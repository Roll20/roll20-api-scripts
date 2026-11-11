// Which pages a command is for: the page the GM is looking at, a --pages list,
// or the pages ticked in the page picker.

import { API_PLAYER_ID } from './constants.js';
import { getState } from './state.js';
import { toText } from './utils.js';

/**
 * Returns every page, in the order Roll20 lists them, without archived ones.
 *
 * @returns {object[]} Roll20 pages.
 */
export function allPages() {
  return findObjs({ _type: 'page' }).filter((p) => p.get('archived') !== true);
}

/**
 * Returns the page a player is on: the GM's last viewed page, or the player
 * ribbon page for commands from other Mods.
 *
 * @param {string} playerId Roll20 player ID.
 * @returns {object|null} Roll20 page.
 */
export function currentPage(playerId) {
  if (playerId && playerId !== API_PLAYER_ID) {
    const last = getObj('player', playerId)?.get('_lastpage');
    const page = last && getObj('page', last);
    if (page) {
      return page;
    }
  }
  return getObj('page', Campaign().get('playerpageid')) || null;
}

/**
 * Reads a --pages list: all, current, picked, ribbon, or page names and IDs
 * separated by commas (names may contain spaces).
 *
 * @param {string} spec Text after --pages.
 * @param {string} playerId Who asked.
 * @returns {{pages: object[], unknown: string[]}} Pages found and names not found.
 */
export function resolvePages(spec, playerId) {
  const parts = toText(spec)
    .replaceAll(/^["']|["']$/g, '')
    .split(',')
    .map((p) => p.trim().replaceAll(/^["']|["']$/g, ''))
    .filter(Boolean);
  const pages = [];
  const unknown = [];
  const add = (page) => {
    if (page && !pages.includes(page)) {
      pages.push(page);
    }
  };
  const every = allPages();
  for (const part of parts) {
    const word = part.toLowerCase();
    if (word === 'all') {
      every.forEach(add);
    } else if (word === 'current' || word === 'here') {
      add(currentPage(playerId));
    } else if (word === 'ribbon') {
      add(getObj('page', Campaign().get('playerpageid')));
    } else if (word === 'picked') {
      pickedPages().forEach(add);
    } else {
      const page =
        getObj('page', part) || every.find((p) => toText(p.get('name')).toLowerCase() === word);
      if (page) {
        add(page);
      } else {
        unknown.push(part);
      }
    }
  }
  return { pages, unknown };
}

/**
 * Returns the pages ticked in the picker that still exist.
 *
 * @returns {object[]} Roll20 pages.
 */
export function pickedPages() {
  const s = getState();
  s.picked = s.picked.filter((id) => getObj('page', id));
  return s.picked.map((id) => getObj('page', id));
}

/**
 * Ticks or unticks a page in the picker.
 *
 * @param {string} pageId Page ID.
 * @returns {boolean|null} True when now ticked, false when unticked, null when no such page.
 */
export function togglePicked(pageId) {
  if (!getObj('page', pageId)) {
    return null;
  }
  const s = getState();
  if (s.picked.includes(pageId)) {
    s.picked = s.picked.filter((id) => id !== pageId);
    return false;
  }
  s.picked.push(pageId);
  return true;
}

/**
 * Ticks every page, or none.
 *
 * @param {boolean} on Tick (true) or clear (false).
 * @returns {void}
 */
export function pickAll(on) {
  getState().picked = on ? allPages().map((p) => p.id) : [];
}
