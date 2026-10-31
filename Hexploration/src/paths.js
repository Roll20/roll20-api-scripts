// Roll20 object access for drawn shapes. Jumpgate games draw `pathv2`
// objects; Legacy games draw `path` objects. Everything that reads or writes a
// path goes through this module so the rest of the mod never cares which.

import {
  LAYER_FOREGROUND,
  LAYER_TOKEN,
  PATH_TYPE_LEGACY,
  PATH_TYPE_V2,
  PATH_TYPES,
} from './constants.js';
import { pathToRings, polygonPathProps } from './polygon.js';
import { getConfig } from './state.js';
import { isJumpgate, toPathV2Color } from './utils.js';

// Set when the foreground layer turns out to be unavailable, so later hexes
// go straight to the token layer instead of failing one by one.
let foregroundUnavailable = false;

/**
 * Returns a path object of either type by ID.
 *
 * @param {string} id Object ID.
 * @param {string|null} [type] Known type, checked first.
 * @returns {object|null} Roll20 path or pathv2 object.
 */
export function getPathObject(id, type = null) {
  if (!id) {
    return null;
  }
  const types = activePathTypes();
  const order = type && types.includes(type) ? [type, ...types.filter((t) => t !== type)] : types;
  for (const t of order) {
    const obj = getObj(t, id);
    if (obj) {
      return obj;
    }
  }
  return null;
}

/**
 * Returns true when a Roll20 object is a path of either type.
 *
 * @param {object} obj Roll20 object.
 * @returns {boolean} True for path and pathv2.
 */
export function isPathObject(obj) {
  return !!obj && PATH_TYPES.includes(obj.get('_type'));
}

/**
 * Returns a colour in a form the given path type accepts.
 *
 * @param {string} color Colour from the settings.
 * @param {string} type Path type.
 * @returns {string} Colour to write.
 */
export function pathColor(color, type) {
  return type === PATH_TYPE_V2 ? toPathV2Color(color) : color;
}

/**
 * Sets a path's colours, converting them for Jumpgate pathv2 objects.
 *
 * @param {object} obj Roll20 path or pathv2.
 * @param {object} attrs Attributes to set; `fill` and `stroke` are converted.
 * @returns {void}
 */
export function setPathStyle(obj, attrs) {
  const type = obj.get('_type');
  const converted = { ...attrs };
  for (const key of ['fill', 'stroke']) {
    if (key in converted) {
      converted[key] = pathColor(converted[key], type);
    }
  }
  obj.set(converted);
}

/**
 * Copies the properties the polygon module needs from a path.
 *
 * @param {object} obj Roll20 path or pathv2.
 * @returns {object} Plain properties including `type`.
 */
export function readPathProps(obj) {
  const type = obj.get('_type');
  const base = {
    type,
    pageId: obj.get('_pageid'),
    layer: obj.get('layer'),
    rotation: obj.get('rotation'),
    fill: obj.get('fill'),
    stroke: obj.get('stroke'),
    stroke_width: obj.get('stroke_width'),
  };
  if (type === PATH_TYPE_V2) {
    return {
      ...base,
      shape: obj.get('shape'),
      points: obj.get('points'),
      x: obj.get('x'),
      y: obj.get('y'),
    };
  }
  return {
    ...base,
    _path: obj.get('_path'),
    left: obj.get('left'),
    top: obj.get('top'),
    width: obj.get('width'),
    height: obj.get('height'),
    scaleX: obj.get('scaleX'),
    scaleY: obj.get('scaleY'),
  };
}

/**
 * Returns a path's outline as page-space rings.
 *
 * @param {object} obj Roll20 path or pathv2.
 * @returns {number[][][]} Rings.
 */
export function getPathRings(obj) {
  const props = readPathProps(obj);
  const page = getObj('page', props.pageId);
  return pathToRings(props, page ? { width: page.get('width'), height: page.get('height') } : {});
}

/**
 * Recreates a path from properties saved by readPathProps (used by undo).
 *
 * @param {object} props Saved properties.
 * @returns {object|null} New Roll20 object.
 */
export function recreatePath(props) {
  const { type, pageId, ...rest } = props;
  const attrs = { _pageid: pageId };
  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined && value !== null) {
      attrs[key] = value;
    }
  }
  // A Legacy game cannot create pathv2 objects, and vice versa.
  const createType = type === PATH_TYPE_V2 && !isJumpgate() ? PATH_TYPE_LEGACY : type;
  return createObj(createType, attrs) || null;
}

/**
 * Returns the layer new hexes should be drawn on.
 *
 * @returns {string} Roll20 layer.
 */
export function getHexLayer() {
  const setting = getConfig().hexLayer;
  if (setting === 'objects' || foregroundUnavailable) {
    return LAYER_TOKEN;
  }
  return LAYER_FOREGROUND;
}

/**
 * Draws a hex outline as a path.
 *
 * The foreground layer is tried first (unless the GM chose the token layer);
 * if the game rejects it, the hex is drawn on the token layer instead and the
 * fallback is remembered for the rest of the session.
 *
 * @param {string} pageId Page ID.
 * @param {number[][]} corners Hex corners in page pixels.
 * @param {object} style Style with fill, stroke and strokeWidth.
 * @returns {{obj: object, fellBack: boolean}|null} New path, or null when it could not be created.
 */
export function createHexPath(pageId, corners, style) {
  const jumpgate = isJumpgate();
  const type = jumpgate ? PATH_TYPE_V2 : PATH_TYPE_LEGACY;
  const geometry = polygonPathProps(corners, jumpgate);
  const attrs = {
    ...geometry,
    _pageid: pageId,
    fill: pathColor(style.fill, type),
    stroke: pathColor(style.stroke, type),
    stroke_width: style.strokeWidth,
    controlledby: '',
  };

  const layer = getHexLayer();
  let obj = createObj(type, { ...attrs, layer });
  if (obj && obj.get('layer') === layer) {
    return { obj, fellBack: false };
  }

  if (layer === LAYER_FOREGROUND) {
    if (obj) {
      obj.remove();
    }
    foregroundUnavailable = true;
    obj = createObj(type, { ...attrs, layer: LAYER_TOKEN });
    return obj ? { obj, fellBack: true } : null;
  }
  return obj ? { obj, fellBack: false } : null;
}

/**
 * Removes a Roll20 object if it still exists.
 *
 * @param {object|null} obj Roll20 object.
 * @returns {void}
 */
export function safeRemove(obj) {
  if (obj) {
    try {
      obj.remove();
    } catch (err) {
      log(`Hexploration: could not remove object: ${err?.message || err}`);
    }
  }
}

/**
 * Returns every path of either type on a page.
 *
 * @param {string} pageId Page ID.
 * @returns {object[]} Roll20 path objects.
 */
export function getPagePaths(pageId) {
  return activePathTypes().flatMap((type) => findObjs({ _type: type, _pageid: pageId }));
}

/**
 * Returns the path types that can exist in this game. Jumpgate games can
 * hold both (old API-made paths survive); Legacy games only have `path`.
 *
 * @returns {string[]} Path types.
 */
function activePathTypes() {
  return isJumpgate() ? PATH_TYPES : [PATH_TYPE_LEGACY];
}
