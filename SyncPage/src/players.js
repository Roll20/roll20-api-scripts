// Players and pages: who is on which page, moving players with split party
// (playerspecificpages), and each group's remembered layout.

import { isRecord, toText } from './utils.js';

/**
 * Returns the split-party map. Roll20 gives `false` when no one is split.
 *
 * @returns {Record<string, string>} Page ID by player ID.
 */
export function readSplit() {
  const raw = Campaign().get('playerspecificpages');
  if (isRecord(raw)) {
    return { ...raw };
  }
  if (typeof raw === 'string' && raw.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(raw);
      return isRecord(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
}

/**
 * Writes the split-party map. It is cleared first, so Roll20 sees the change.
 *
 * @param {Record<string, string>} split Page ID by player ID.
 * @returns {void}
 */
function writeSplit(split) {
  Campaign().set('playerspecificpages', false);
  if (Object.keys(split).length) {
    Campaign().set('playerspecificpages', split);
  }
}

/**
 * Returns the players who are not GMs.
 *
 * @returns {object[]} Players, by name.
 */
export function listPlayers() {
  return findObjs({ _type: 'player' })
    .filter((p) => !playerIsGM(p.id))
    .sort((a, b) => toText(a.get('displayname')).localeCompare(toText(b.get('displayname'))));
}

/**
 * Returns the page a player is on.
 *
 * @param {string} playerId Player ID.
 * @returns {string} Page ID.
 */
export function pageOfPlayer(playerId) {
  return readSplit()[playerId] || Campaign().get('playerpageid');
}

/**
 * Moves one player to a page.
 *
 * @param {string} playerId Player ID.
 * @param {string} pageId Page ID.
 * @returns {void}
 */
export function movePlayer(playerId, pageId) {
  const split = readSplit();
  if (pageId === Campaign().get('playerpageid')) {
    delete split[playerId];
  } else {
    split[playerId] = pageId;
  }
  writeSplit(split);
}

/**
 * Moves several players at once.
 *
 * @param {Record<string, string>} moves Page ID by player ID.
 * @returns {void}
 */
export function movePlayers(moves) {
  const split = readSplit();
  const ribbon = Campaign().get('playerpageid');
  for (const [playerId, pageId] of Object.entries(moves)) {
    if (pageId === ribbon) {
      delete split[playerId];
    } else {
      split[playerId] = pageId;
    }
  }
  writeSplit(split);
}

/**
 * Returns the players on each of a group's pages.
 *
 * @param {object} group Group.
 * @returns {Record<string, object[]>} Players by page ID.
 */
export function playersByPage(group) {
  const out = Object.fromEntries(group.pages.map((p) => [p, []]));
  for (const player of listPlayers()) {
    const page = pageOfPlayer(player.id);
    if (out[page]) {
      out[page].push(player);
    }
  }
  return out;
}

/**
 * Remembers where the group's players are now.
 *
 * @param {object} group Group.
 * @returns {number} Players remembered.
 */
export function saveLayout(group) {
  group.layout = {};
  for (const [pageId, players] of Object.entries(playersByPage(group))) {
    for (const player of players) {
      group.layout[player.id] = pageId;
    }
  }
  return Object.keys(group.layout).length;
}

/**
 * Puts players back where the group remembered them.
 *
 * @param {object} group Group.
 * @returns {number} Players moved.
 */
export function restoreLayout(group) {
  const moves = {};
  for (const [playerId, pageId] of Object.entries(group.layout)) {
    if (group.pages.includes(pageId) && getObj('player', playerId)) {
      moves[playerId] = pageId;
    }
  }
  if (Object.keys(moves).length) {
    movePlayers(moves);
  }
  return Object.keys(moves).length;
}

/**
 * Moves every player on the group's pages to one page, remembering the
 * layout first (unless everyone is already on that page).
 *
 * @param {object} group Group.
 * @param {string} pageId Page ID.
 * @returns {number} Players moved.
 */
export function gatherPlayers(group, pageId) {
  const byPage = playersByPage(group);
  // Remember the layout unless everyone is already there (that would forget it).
  const someoneMoves = Object.entries(byPage).some(([p, list]) => p !== pageId && list.length);
  if (someoneMoves) {
    saveLayout(group);
  }
  const moves = {};
  for (const players of Object.values(byPage)) {
    for (const player of players) {
      moves[player.id] = pageId;
    }
  }
  movePlayers(moves);
  return Object.keys(moves).length;
}
