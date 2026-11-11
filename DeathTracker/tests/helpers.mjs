// Builders shared by the tests: characters, tokens and the 2024 sheet's store.

import { createSandbox } from './roll20-stub.mjs';

/**
 * Starts a sandbox and fires ready.
 *
 * @param {object} [options] createSandbox options.
 * @returns {object} Sandbox controls.
 */
export function start(options = {}) {
  const api = createSandbox(options);
  api.ready();
  api.chat.length = 0;
  return api;
}

/**
 * Makes a 2024-sheet store value.
 *
 * @param {object} [o] Options.
 * @param {number} [o.hp=10] Current HP on the sheet.
 * @param {number} [o.s=0] Death save successes.
 * @param {number} [o.f=0] Death save failures.
 * @param {boolean} [o.npc=false] NPC (Stat Block layout).
 * @returns {object} Store.
 */
export function storeValue({ hp = 10, s = 0, f = 0, npc = false } = {}) {
  return {
    hitpoints: { currentHP: hp, deathSaves: { successes: s, failures: f, open: true } },
    settings: { layoutState: npc ? 'Stat Block' : 'Compact' },
    npc: {},
  };
}

/**
 * Adds a character with an optional 2024 store and other attributes.
 *
 * @param {object} api Sandbox.
 * @param {object} [o] Options.
 * @param {string} [o.name] Name.
 * @param {string} [o.controlledby] Controllers.
 * @param {object|null} [o.store] Store value (null for none).
 * @param {Record<string, string>} [o.attrs] Plain attributes.
 * @returns {{character: object, store: object|null}} Character and its store attribute.
 */
export function addCharacter(
  api,
  { name = 'Hero', controlledby = '', store = null, attrs = {} } = {}
) {
  const character = api.add('character', { name, controlledby });
  let storeAttr = null;
  if (store) {
    storeAttr = api.add('attribute', {
      _characterid: character.id,
      name: 'store',
      current: store,
      max: '',
    });
    api.add('attribute', {
      _characterid: character.id,
      name: 'appState',
      current: store.settings.layoutState === 'Stat Block' ? 'npc' : 'sheet',
      max: '',
    });
  }
  for (const [n, v] of Object.entries(attrs)) {
    api.add('attribute', { _characterid: character.id, name: n, current: v, max: '' });
  }
  return { character, store: storeAttr };
}

/**
 * Adds a token on page1.
 *
 * @param {object} api Sandbox.
 * @param {object} [attrs] Token attributes.
 * @returns {object} Token.
 */
export function addToken(api, attrs = {}) {
  return api.add('graphic', {
    _subtype: 'token',
    _pageid: 'page1',
    layer: 'objects',
    left: 105,
    top: 105,
    width: 70,
    height: 70,
    name: 'Token',
    bar1_value: 10,
    bar1_max: 10,
    statusmarkers: '',
    tint_color: 'transparent',
    controlledby: '',
    represents: '',
    ...attrs,
  });
}

/**
 * Adds a player character on the 2024 sheet, controlled by the player p1.
 *
 * @param {object} api Sandbox.
 * @param {object} [o] Options.
 * @returns {{token: object, character: object, store: object}} Parts.
 */
export function addPc(
  api,
  { hp = 10, max = 10, controlledby = 'p1', s = 0, f = 0, name = 'Kildrak' } = {}
) {
  const { character, store } = addCharacter(api, {
    name,
    controlledby,
    store: storeValue({ hp, s, f }),
  });
  const token = addToken(api, {
    name,
    represents: character.id,
    bar1_value: hp,
    bar1_max: max,
    bar1_link: 'hp',
  });
  return { token, character, store };
}

/**
 * Adds an NPC token (unlinked bar, NPC sheet).
 *
 * @param {object} api Sandbox.
 * @param {object} [o] Options.
 * @returns {object} Token.
 */
export function addNpc(api, { hp = 10, max = 10, name = 'Goblin 1' } = {}) {
  const { character } = addCharacter(api, {
    name: 'Goblin',
    store: storeValue({ hp: max, npc: true }),
  });
  return addToken(api, {
    name,
    represents: character.id,
    bar1_value: String(hp),
    bar1_max: String(max),
  });
}

/**
 * Ticks the 2024 sheet's death saves (as clicking the boxes does).
 *
 * @param {object} api Sandbox.
 * @param {object} store Store attribute.
 * @param {number} s Successes.
 * @param {number} f Failures.
 * @returns {void}
 */
export function tickSaves(api, store, s, f) {
  const value = JSON.parse(JSON.stringify(store.get('current')));
  value.hitpoints.deathSaves = { successes: s, failures: f, open: true };
  api.editAttr(store, value);
}

/**
 * Returns the death saves on a store attribute.
 *
 * @param {object} store Store attribute.
 * @returns {{s: number, f: number}} Counts.
 */
export function sheetSaves(store) {
  const d = store.get('current').hitpoints.deathSaves;
  return { s: d.successes, f: d.failures };
}
