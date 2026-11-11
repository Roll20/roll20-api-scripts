// Reading characters: the D&D 2024 (Beacon) sheet's "store" attribute, plain
// attributes for other sheets, and who controls a character.
//
// Found in Jumpgate on sandbox v1.5 (4 November 2026): the 2024 sheet keeps
// its data in one attribute named "store" whose current value is an object.
// store.hitpoints is {currentHP, deathSaves: {successes, failures, open}}.
// Ticking a death-save box or rolling a save fires change:attribute for it,
// and writing a changed copy back clears the boxes on the sheet.

import { BEACON_NPC_LAYOUT, BEACON_STORE_ATTR, DEATH_SAVES_NEEDED } from './constants.js';
import { isRecord, splitList, toNumber, toText } from './utils.js';

/**
 * Returns a character's attribute by name, ignoring case.
 *
 * @param {string} characterId Character ID.
 * @param {string} name Attribute name.
 * @returns {object|null} Roll20 attribute.
 */
export function findAttribute(characterId, name) {
  const exact = findObjs({ _type: 'attribute', _characterid: characterId, name });
  if (exact.length) {
    return exact[0];
  }
  const lower = name.toLowerCase();
  return (
    findObjs({ _type: 'attribute', _characterid: characterId }).find(
      (a) => toText(a.get('name')).toLowerCase() === lower
    ) || null
  );
}

/**
 * Returns the 2024 sheet's store, or null for other sheets.
 *
 * @param {string} characterId Character ID.
 * @returns {object|null} The store object.
 */
export function readStore(characterId) {
  const attr = findObjs({
    _type: 'attribute',
    _characterid: characterId,
    name: BEACON_STORE_ATTR,
  })[0];
  if (!attr) {
    return null;
  }
  let value = attr.get('current');
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  return isRecord(value) ? value : null;
}

/**
 * Returns true when a checkbox-style value is ticked. Only clear yes values
 * count, so text Roll20 failed to fill in never counts as a tick.
 *
 * @param {*} raw Attribute value.
 * @returns {boolean} True when ticked.
 */
export function isTicked(raw) {
  if (raw === true) {
    return true;
  }
  const text = toText(raw).toLowerCase();
  if (['on', 'true', 'yes', 'checked'].includes(text)) {
    return true;
  }
  const n = toNumber(text);
  return n !== null && n > 0;
}

/**
 * Reads a character's death saves.
 *
 * @param {string} characterId Character ID.
 * @param {{successFields: string, failureFields: string}} settings Field lists for sheets with checkboxes.
 * @returns {{s: number, f: number, source: string}|null} Counts (not capped), or null when the sheet has none.
 */
export function readDeathSaves(characterId, settings) {
  const store = readStore(characterId);
  // The 2024 sheet only adds hitpoints.deathSaves once a save is first ticked
  // or rolled; until then the character has made none.
  const saves = store && isRecord(store.hitpoints) ? store.hitpoints.deathSaves || {} : null;
  if (isRecord(saves)) {
    return {
      s: Math.max(0, Math.round(toNumber(saves.successes) ?? 0)),
      f: Math.max(0, Math.round(toNumber(saves.failures) ?? 0)),
      source: 'store',
    };
  }
  const count = (fields) => {
    let found = false;
    let n = 0;
    for (const name of splitList(fields)) {
      const attr = findAttribute(characterId, name);
      if (attr) {
        found = true;
        if (isTicked(attr.get('current'))) {
          n += 1;
        }
      }
    }
    return found ? n : null;
  };
  const s = count(settings.successFields);
  const f = count(settings.failureFields);
  if (s === null && f === null) {
    return null;
  }
  return { s: s ?? 0, f: f ?? 0, source: 'attributes' };
}

/**
 * Clears a character's death saves on the sheet. Works on the 2024 sheet
 * (through its store) and on sheets with checkbox attributes. On the 2024
 * sheet it also shows or hides the death save boxes: the sheet only shows
 * them when hit points reach 0 through its own Damage box, so a PC dropped
 * to 0 from the token bar would otherwise have no boxes to tick.
 *
 * @param {string} characterId Character ID.
 * @param {{successFields: string, failureFields: string}} settings Field lists.
 * @param {boolean} [open] 2024 sheet: show (true) or hide (false) the death save boxes.
 * @returns {boolean} True when the sheet was changed.
 */
export function clearDeathSaves(characterId, settings, open) {
  const attr = findObjs({
    _type: 'attribute',
    _characterid: characterId,
    name: BEACON_STORE_ATTR,
  })[0];
  const store = readStore(characterId);
  if (attr && store && isRecord(store.hitpoints)) {
    const old = isRecord(store.hitpoints.deathSaves) ? store.hitpoints.deathSaves : {};
    const wantOpen = typeof open === 'boolean' ? open : old.open === true;
    if (!toNumber(old.successes) && !toNumber(old.failures) && (old.open === true) === wantOpen) {
      return false;
    }
    // A copy, so Roll20 sees a new value and saves it.
    const copy = JSON.parse(JSON.stringify(store));
    copy.hitpoints.deathSaves = { ...old, successes: 0, failures: 0, open: wantOpen };
    attr.set('current', copy);
    return true;
  }
  let cleared = false;
  for (const name of [...splitList(settings.successFields), ...splitList(settings.failureFields)]) {
    const a = findAttribute(characterId, name);
    if (a && isTicked(a.get('current'))) {
      a.set('current', '0');
      cleared = true;
    }
  }
  return cleared;
}

/**
 * Caps death-save counts at what the rules allow.
 *
 * @param {{s: number, f: number}} counts Counts.
 * @returns {{s: number, f: number}} Capped counts.
 */
export function capSaves(counts) {
  return {
    s: Math.min(DEATH_SAVES_NEEDED, Math.max(0, counts.s)),
    f: Math.min(DEATH_SAVES_NEEDED, Math.max(0, counts.f)),
  };
}

/**
 * Says whether a character's sheet describes a PC or an NPC.
 *
 * @param {string} characterId Character ID.
 * @returns {'pc'|'npc'|null} The sheet's answer, or null when it cannot tell.
 */
export function sheetRole(characterId) {
  const store = readStore(characterId);
  if (store) {
    const layout = isRecord(store.settings) ? toText(store.settings.layoutState) : '';
    const appState = findAttribute(characterId, 'appState');
    if (layout === BEACON_NPC_LAYOUT || toText(appState?.get('current')) === 'npc') {
      return 'npc';
    }
    return layout ? 'pc' : null;
  }
  const npc = findAttribute(characterId, 'npc');
  if (npc) {
    return isTicked(npc.get('current')) ? 'npc' : 'pc';
  }
  return null;
}

/**
 * Returns the players named in a controlledby list who are not GMs. "all"
 * counts as a player.
 *
 * @param {*} raw controlledby value.
 * @returns {string[]} Player IDs (or "all").
 */
export function playerControllers(raw) {
  return splitList(raw).filter((id) => id === 'all' || !playerIsGM(id));
}

/**
 * Returns the players who control a token, through the token or its character.
 *
 * @param {object} token Roll20 graphic.
 * @returns {string[]} Player IDs (or "all").
 */
export function tokenControllers(token) {
  const character = getCharacter(token);
  return [
    ...new Set([
      ...playerControllers(token.get('controlledby')),
      ...(character ? playerControllers(character.get('controlledby')) : []),
    ]),
  ];
}

/**
 * Returns the character a token represents.
 *
 * @param {object} token Roll20 graphic.
 * @returns {object|null} Roll20 character.
 */
export function getCharacter(token) {
  const id = toText(token.get('represents'));
  return id ? getObj('character', id) || null : null;
}

/**
 * Returns the Mod sandbox version ("1.0" or "1.5"), or an empty string when
 * Roll20 does not say.
 *
 * @returns {string} Sandbox version.
 */
export function getSandboxVersion() {
  try {
    return toText(Campaign()?.sandboxVersion);
  } catch {
    return '';
  }
}
