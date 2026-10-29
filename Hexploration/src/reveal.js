// Revealing hexes: when tokens move, from GM commands, and through the public API.

import { buildCard } from './chat.js';
import { BATCH_SIZE, LAYER_TOKEN, SCRIPT_NAME } from './constants.js';
import { getPageContext } from './context.js';
import { handleCoveredChange, refreshPage, refreshToken } from './cover.js';
import {
  hexDistance,
  hexesAlongSegment,
  hexesBetween,
  hexesUnderToken,
  hexesWithin,
  hexKey,
  hexToPixel,
} from './grid.js';
import { removeHex } from './hexes.js';
import { t } from './i18n.js';
import { getDiscoveryName, getHexIcon } from './locations.js';
import { getPathObject } from './paths.js';
import { getConfig, getHex, getPageHexes, getPageSettings } from './state.js';
import { escapeHtml, getTokenControllers, runInBatches, toText } from './utils.js';

/**
 * Returns true when a token should reveal hexes under the page's settings.
 *
 * @param {object} token Roll20 graphic.
 * @param {object} settings Effective page settings.
 * @returns {boolean} True when the token reveals.
 */
export function tokenReveals(token, settings) {
  if (!token || token.get('_subtype') !== 'token' || token.get('layer') !== LAYER_TOKEN) {
    return false;
  }
  switch (settings.revealBy) {
    case 'all':
      return true;
    case 'characters':
      return !!token.get('represents');
    default:
      return getTokenControllers(token).some((id) => id === 'all' || !playerIsGM(id));
  }
}

/**
 * Announces a discovered location.
 *
 * @param {object} ctx Page context.
 * @param {object} hex Hex record (before removal).
 * @param {string} name Location name.
 * @param {string} imgsrc Icon image URL (may be empty).
 * @param {object} settings Effective page settings.
 * @returns {void}
 */
function announceDiscovery(ctx, hex, name, imgsrc, settings) {
  if (name && settings.announce !== 'off') {
    const lang = getConfig().language;
    const img = imgsrc
      ? `<div style="text-align:center"><img src="${escapeHtml(imgsrc)}" style="max-height:48px;max-width:48px"></div>`
      : '';
    const html = buildCard(
      t('discovery.title', lang),
      `${img}<div style="text-align:center;font-weight:bold;font-size:1.1em">${escapeHtml(name)}</div>`
    );
    const prefix = settings.announce === 'gm' ? '/w gm ' : '';
    sendChat(SCRIPT_NAME, `${prefix}${html}`);
  }
  if (name && settings.pingDiscoveries) {
    const [x, y] = hexToPixel(ctx.grid, hex.row, hex.col);
    sendPing(x, y, ctx.pageId, null, true);
  }
}

/**
 * Reveals one hex: removes it and its label, shows its icon, and announces
 * it when named.
 *
 * @param {object} ctx Page context.
 * @param {string} key "row,col" key.
 * @param {object} settings Effective page settings.
 * @param {object} [options] Options.
 * @param {number} [options.distance=0] Distance from the revealing token (for maxDistance).
 * @param {boolean} [options.announce=true] Announce named discoveries.
 * @returns {boolean} True when a hex was revealed.
 */
export function revealHex(ctx, key, settings, { distance = 0, announce = true } = {}) {
  const hex = getHex(ctx.pageId, key);
  if (!hex) {
    return false;
  }
  if (distance > 0 && Number.isInteger(hex.maxDistance) && distance > hex.maxDistance) {
    return false;
  }

  const name = getDiscoveryName(hex);
  const icon = getHexIcon(hex);
  const imgsrc = icon ? toText(icon.get('imgsrc')) : '';
  removeHex(ctx.pageId, key, false);
  if (icon) {
    icon.set({ layer: LAYER_TOKEN, showname: true });
  }
  if (announce) {
    announceDiscovery(ctx, hex, name, imgsrc, settings);
  }
  return true;
}

/**
 * Turns a hex see-through (glimpse mode) without revealing it.
 *
 * @param {object} ctx Page context.
 * @param {string} key "row,col" key.
 * @param {number} distance Distance from the revealing token.
 * @returns {boolean} True when the hex changed.
 */
export function glimpseHex(ctx, key, distance) {
  const hex = getHex(ctx.pageId, key);
  if (!hex || hex.glimpsed) {
    return false;
  }
  if (Number.isInteger(hex.maxDistance) && distance > hex.maxDistance) {
    return false;
  }
  const path = getPathObject(hex.id, hex.type);
  if (!path) {
    return false;
  }
  path.set('fill', getConfig().glimpseColor);
  hex.glimpsed = true;
  return true;
}

/**
 * Returns true when line of sight from one hex to another is blocked by a
 * covered hex. Glimpsed hexes have been seen through, so they do not block.
 *
 * @param {object} ctx Page context.
 * @param {number[]} from [row, col].
 * @param {number[]} to [row, col].
 * @returns {boolean} True when blocked.
 */
function isBlocked(ctx, from, to) {
  return hexesBetween(ctx.grid, from, to).some(([r, c]) => {
    const hex = getHex(ctx.pageId, hexKey(r, c));
    return hex && !hex.glimpsed;
  });
}

/**
 * Parses a token's lastmove into points.
 *
 * @param {string} lastmove Roll20 lastmove ("x1,y1,x2,y2,…").
 * @returns {number[][]} Array of [x, y].
 */
function parseLastMove(lastmove) {
  const nums = toText(lastmove)
    .split(',')
    .map(Number)
    .filter((n) => Number.isFinite(n));
  const points = [];
  for (let i = 0; i + 1 < nums.length; i += 2) {
    points.push([nums[i], nums[i + 1]]);
  }
  return points;
}

/**
 * Returns the cells a token passed through on its last move, in order, plus
 * every cell it now covers.
 *
 * @param {object} ctx Page context.
 * @param {object} token Roll20 graphic.
 * @param {object|null} prev Previous token properties, when known.
 * @param {boolean} followPath Include the route travelled.
 * @returns {number[][]} Array of [row, col], without duplicates.
 */
function travelledCells(ctx, token, prev, followPath) {
  const current = [Number(token.get('left')), Number(token.get('top'))];
  const cells = [];

  if (
    followPath &&
    prev &&
    Number.isFinite(Number(prev.left)) &&
    Number.isFinite(Number(prev.top))
  ) {
    const start = [Number(prev.left), Number(prev.top)];
    // lastmove holds the start point and any waypoints of the latest drag. It
    // is only trusted when it starts where the token was; moves made by other
    // mods leave a stale lastmove behind.
    const waypoints = parseLastMove(token.get('lastmove'));
    const startsHere =
      waypoints.length > 0 &&
      Math.abs(waypoints[0][0] - start[0]) < 1 &&
      Math.abs(waypoints[0][1] - start[1]) < 1;
    const route = startsHere ? [...waypoints, current] : [start, current];
    for (let i = 1; i < route.length; i++) {
      cells.push(...hexesAlongSegment(ctx.grid, route[i - 1], route[i]));
    }
  }

  cells.push(
    ...hexesUnderToken(
      ctx.grid,
      current[0],
      current[1],
      Number(token.get('width')) || 0,
      Number(token.get('height')) || 0
    )
  );

  const seen = new Set();
  return cells.filter(([r, c]) => {
    const key = hexKey(r, c);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Reveals around a list of origin cells using the page's settings.
 *
 * @param {object} ctx Page context.
 * @param {number[][]} origins Cells the token occupied, in order.
 * @param {object} settings Effective page settings.
 * @returns {number} Number of hexes revealed or glimpsed.
 */
function revealFromCells(ctx, origins, settings) {
  let changed = 0;
  for (const origin of origins) {
    if (revealHex(ctx, hexKey(origin[0], origin[1]), settings)) {
      changed++;
    }
    for (const cell of hexesWithin(ctx.grid, origin[0], origin[1], settings.revealDistance)) {
      const key = hexKey(cell[0], cell[1]);
      if (!getHex(ctx.pageId, key)) {
        continue;
      }
      if (settings.lineOfSight && isBlocked(ctx, origin, cell)) {
        continue;
      }
      const distance = hexDistance(ctx.grid, origin, cell);
      const done =
        settings.revealMode === 'glimpse'
          ? glimpseHex(ctx, key, distance)
          : revealHex(ctx, key, settings, { distance });
      if (done) {
        changed++;
      }
    }
  }
  return changed;
}

/**
 * Reveals the hexes a token has moved through and can now see.
 *
 * @param {object} token Roll20 graphic.
 * @param {object|null} [prev] Previous token properties from a change event.
 * @param {boolean} [force=false] Skip the "which tokens reveal" check.
 * @returns {number} Number of hexes revealed or glimpsed.
 */
export function revealAroundToken(token, prev = null, force = false) {
  const pageId = token?.get('_pageid');
  if (!pageId || getPageHexes(pageId).length === 0) {
    return 0;
  }
  const ctx = getPageContext(pageId);
  if (!ctx.ok) {
    return 0;
  }
  const settings = getPageSettings(pageId);
  if (!force && !tokenReveals(token, settings)) {
    return 0;
  }
  return revealFromCells(ctx, travelledCells(ctx, token, prev, settings.revealPath), settings);
}

/**
 * Handles a graphic change event: reveals when a token moves or arrives on
 * the token layer.
 *
 * @param {object} token Roll20 graphic.
 * @param {object} prev Previous property values.
 * @returns {void}
 */
export function handleTokenChange(token, prev) {
  const moved = prev && (prev.left !== token.get('left') || prev.top !== token.get('top'));
  const surfaced = prev && prev.layer !== token.get('layer') && token.get('layer') === LAYER_TOKEN;
  const resized =
    prev && (prev.width !== token.get('width') || prev.height !== token.get('height'));
  handleCoveredChange(token, prev);
  const layerChanged = prev && prev.layer !== token.get('layer');
  if (moved || surfaced || resized) {
    if (revealAroundToken(token, moved ? prev : null) > 0) {
      // Reveals may uncover other tokens as well as this one.
      refreshPage(token.get('_pageid'));
      return;
    }
  }
  if (moved || layerChanged) {
    refreshToken(token);
  }
}

/**
 * Reveals every hex on a page without announcements.
 *
 * @param {object} ctx Page context.
 * @param {(count: number) => void} onDone Completion callback.
 * @returns {void}
 */
export function revealPage(ctx, onDone) {
  const settings = getPageSettings(ctx.pageId);
  const keys = getPageHexes(ctx.pageId).map((hex) => hexKey(hex.row, hex.col));
  let count = 0;
  runInBatches(
    keys,
    BATCH_SIZE,
    (key) => {
      if (revealHex(ctx, key, settings, { announce: false })) {
        count++;
      }
    },
    () => {
      refreshPage(ctx.pageId);
      onDone(count);
    }
  );
}
