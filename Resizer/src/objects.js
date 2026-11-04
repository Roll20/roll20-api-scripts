// Reading Roll20 objects: what a page holds, what is selected, and which
// attributes of each kind Resizer changes (and so must remember for undo).

// Every kind of page object Resizer moves or scales.
export const OBJECT_TYPES = ['graphic', 'text', 'pathv2', 'path', 'door', 'window'];

// Attributes saved before a change, by object type. Legacy paths are drawn
// again rather than changed, so all their properties are kept instead.
export const GEOMETRY_KEYS = {
  graphic: ['left', 'top', 'width', 'height'],
  text: ['left', 'top', 'font_size', 'width', 'height'],
  pathv2: ['x', 'y', 'points', 'stroke_width'],
  door: ['x', 'y', 'path'],
  window: ['x', 'y', 'path'],
  page: ['width', 'height', 'snapping_increment', 'grid_offset_x', 'grid_offset_y'],
};

// Read-only or bookkeeping attributes left out when a Legacy path is drawn again.
const LEGACY_SKIP = new Set(['_id', '_type', '_fbpath', '_zorder']);

/**
 * Returns a plain copy of a Roll20 object's attributes.
 *
 * @param {object} obj Roll20 object.
 * @returns {object} Attributes.
 */
export function attrsOf(obj) {
  return JSON.parse(JSON.stringify(obj.toJSON ? obj.toJSON() : obj.attributes || {}));
}

/**
 * Returns the attributes that matter for undo.
 *
 * @param {string} type Object type.
 * @param {object} obj Roll20 object.
 * @returns {object} Attribute values (deep copies).
 */
export function snapshot(type, obj) {
  const out = {};
  for (const key of GEOMETRY_KEYS[type] || []) {
    const v = obj.get(key);
    if (v !== undefined) {
      out[key] = v && typeof v === 'object' ? JSON.parse(JSON.stringify(v)) : v;
    }
  }
  return out;
}

/**
 * Properties to draw a Legacy path again.
 *
 * @param {object} obj Roll20 path.
 * @returns {object} Properties for createObj('path').
 */
export function legacyPathProps(obj) {
  const all = attrsOf(obj);
  const out = {};
  for (const [key, value] of Object.entries(all)) {
    if (!LEGACY_SKIP.has(key)) {
      out[key] = value;
    }
  }
  out._pageid = all._pageid;
  out._path = all._path;
  return out;
}

/**
 * Returns every object on a page that Resizer changes, by type.
 *
 * @param {string} pageId Page ID.
 * @returns {Array<{type: string, obj: object}>} Objects.
 */
export function pageObjects(pageId) {
  const out = [];
  for (const type of OBJECT_TYPES) {
    for (const obj of findObjs({ _type: type, _pageid: pageId })) {
      out.push({ type, obj });
    }
  }
  return out;
}

/**
 * Finds a selected or named object. Jumpgate reports a selected drawing as
 * 'path' even though the API holds it as 'pathv2', so both are tried.
 *
 * @param {string} id Object ID.
 * @param {string} [type] Type Roll20 gave.
 * @returns {{type: string, obj: object}|null} Object, or null.
 */
export function findObject(id, type) {
  const order = [type, ...OBJECT_TYPES].filter(Boolean);
  if (type === 'path') {
    order.unshift('pathv2');
  }
  for (const t of order) {
    const obj = getObj(t, id);
    if (obj) {
      return { type: t, obj };
    }
  }
  return null;
}

/**
 * Returns the objects a command is for: the --ids list, or the selection.
 *
 * @param {object} msg Chat message.
 * @param {string[]|null} ids IDs given with --ids.
 * @returns {{found: Array<{type: string, obj: object}>, unknown: string[]}} Objects and IDs
 *   not found.
 */
export function targetObjects(msg, ids) {
  const wanted = ids ? ids.map((id) => ({ _id: id })) : msg.selected || [];
  const found = [];
  const unknown = [];
  const seen = new Set();
  for (const sel of wanted) {
    const hit = findObject(sel._id, sel._type);
    if (hit && !seen.has(hit.obj.id)) {
      seen.add(hit.obj.id);
      found.push(hit);
    } else if (!hit) {
      unknown.push(sel._id);
    }
  }
  return { found, unknown };
}

/**
 * Returns a short name for an object, for replies.
 *
 * @param {string} type Object type.
 * @param {object} obj Roll20 object.
 * @returns {string} Name, or an empty string.
 */
export function objectName(type, obj) {
  if (type === 'graphic') {
    return obj.get('name') || '';
  }
  if (type === 'text') {
    return String(obj.get('text') || '').slice(0, 30);
  }
  return '';
}

/**
 * True when a graphic counts as a token for "keep token size": anything on the
 * Tokens or GM layer that is not a drawing.
 *
 * @param {object} obj Roll20 graphic.
 * @returns {boolean} True for tokens.
 */
export function isToken(obj) {
  const layer = obj.get('layer');
  return (layer === 'objects' || layer === 'gmlayer') && obj.get('isdrawing') !== true;
}
