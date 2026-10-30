// The store character: a hidden, archived character whose abilities hold each
// listener's commands. Version 1 used the same character, so upgrading keeps
// every command and any macro that calls %{Customizable Roll Listener|name}.

import { STORE_CHARACTER_NAME } from './constants.js';
import { t } from './i18n.js';
import {
  deleteListener,
  getConfig,
  getListener,
  getListeners,
  getState,
  normaliseListener,
  parseStoredRules,
  putListener,
  serialiseRules,
} from './state.js';
import { escapeHtml, toText } from './utils.js';

/**
 * Returns the store character, finding or creating it as needed.
 *
 * @returns {object|null} Roll20 character.
 */
export function getStoreCharacter() {
  const s = getState();
  let character = s.characterId ? getObj('character', s.characterId) : null;
  if (!character) {
    character =
      findObjs({ _type: 'character', name: STORE_CHARACTER_NAME })[0] ||
      createObj('character', { name: STORE_CHARACTER_NAME, archived: true });
    s.characterId = character ? character.id : '';
  }
  return character || null;
}

/**
 * Returns the URL that opens the store character in the Journal.
 *
 * @returns {string} URL, or an empty string when there is no character.
 */
export function getStoreLink() {
  const character = getStoreCharacter();
  return character ? `https://journal.roll20.net/character/${character.id}` : '';
}

/**
 * Keeps the store character hidden from players and explains it in its bio.
 *
 * @returns {void}
 */
export function prepareStoreCharacter() {
  const character = getStoreCharacter();
  if (!character) {
    return;
  }
  const lang = getConfig().language;
  character.set({ inplayerjournals: '', controlledby: '' });
  character.set(
    'bio',
    `<p>${escapeHtml(t('store.bio', lang))}</p><p>${escapeHtml(t('store.bioHelp', lang))}</p>`
  );
}

/**
 * Returns every ability on the store character.
 *
 * @returns {object[]} Roll20 abilities.
 */
function getStoreAbilities() {
  const character = getStoreCharacter();
  return character ? findObjs({ _type: 'ability', _characterid: character.id }) : [];
}

/**
 * Returns a listener's ability.
 *
 * @param {string} id Ability ID.
 * @returns {object|null} Roll20 ability.
 */
export function getAbility(id) {
  return getObj('ability', id) || null;
}

/**
 * Returns true when an ability belongs to the store character.
 *
 * @param {object} ability Roll20 ability.
 * @returns {boolean} True when it is a listener's ability.
 */
export function isStoreAbility(ability) {
  const id = getState().characterId;
  return Boolean(id) && ability?.get('_characterid') === id;
}

/**
 * Writes a listener's rules into its ability description.
 *
 * @param {string} id Ability ID.
 * @returns {void}
 */
export function mirrorRules(id) {
  const ability = getAbility(id);
  const listener = getListener(id);
  if (!ability || !listener) {
    return;
  }
  const text = serialiseRules(listener);
  if (ability.get('description') !== text) {
    ability.set('description', text);
  }
}

/**
 * Takes on an ability that has no listener record yet: rules stored in its
 * description (version 2, or version 1 JSON) are used; an ability without
 * rules becomes a switched-off listener so the GM can see and set it up.
 *
 * @param {object} ability Roll20 ability.
 * @returns {'upgraded'|'restored'|'adopted'} What happened.
 */
export function adoptAbility(ability) {
  const name = toText(ability.get('name'));
  const stored = parseStoredRules(ability.get('description'), name);
  if (stored) {
    putListener(ability.id, stored.rules);
  } else {
    putListener(ability.id, normaliseListener({ name, enabled: false }));
  }
  mirrorRules(ability.id);
  if (!stored) {
    return 'adopted';
  }
  return stored.version === 1 ? 'upgraded' : 'restored';
}

/**
 * Brings listener records and the store character's abilities into line.
 *
 * @returns {{upgraded: number, restored: number, adopted: number, removed: number}}
 *          Counts of what changed.
 */
export function syncListeners() {
  const counts = { upgraded: 0, restored: 0, adopted: 0, removed: 0 };
  const abilities = getStoreAbilities();
  const ids = new Set(abilities.map((a) => a.id));
  for (const { id } of getListeners()) {
    if (!ids.has(id)) {
      deleteListener(id);
      counts.removed++;
    }
  }
  for (const ability of abilities) {
    const listener = getListener(ability.id);
    if (listener) {
      listener.name = toText(ability.get('name'));
      mirrorRules(ability.id);
    } else {
      counts[adoptAbility(ability)]++;
    }
  }
  return counts;
}

/**
 * Creates the ability for a new listener.
 *
 * @param {string} name Listener name.
 * @param {string} commands Commands, one per line.
 * @returns {object|null} Roll20 ability.
 */
export function createListenerAbility(name, commands) {
  const character = getStoreCharacter();
  if (!character) {
    return null;
  }
  return (
    createObj('ability', {
      characterid: character.id,
      name,
      action: commands,
      description: '',
      istokenaction: false,
    }) || null
  );
}

/**
 * Returns a listener's commands.
 *
 * @param {string} id Ability ID.
 * @returns {string} Commands, one per line.
 */
export function getCommands(id) {
  return toText(getAbility(id)?.get('action'));
}

/**
 * Replaces a listener's commands.
 *
 * @param {string} id Ability ID.
 * @param {string} commands Commands, one per line.
 * @returns {void}
 */
export function setCommands(id, commands) {
  getAbility(id)?.set('action', commands);
}

/**
 * Renames a listener's ability.
 *
 * @param {string} id Ability ID.
 * @param {string} name New name.
 * @returns {void}
 */
export function renameAbility(id, name) {
  getAbility(id)?.set('name', name);
}

/**
 * Removes a listener's ability.
 *
 * @param {string} id Ability ID.
 * @returns {void}
 */
export function removeAbility(id) {
  getAbility(id)?.remove();
}

/**
 * Keeps records in step when the GM edits an ability in the Journal.
 *
 * @param {object} ability Roll20 ability.
 * @returns {void}
 */
export function handleAbilityChanged(ability) {
  if (!isStoreAbility(ability)) {
    return;
  }
  const listener = getListener(ability.id);
  if (!listener) {
    adoptAbility(ability);
    return;
  }
  const name = toText(ability.get('name'));
  const stored = parseStoredRules(ability.get('description'), name);
  if (stored && stored.version === 2) {
    // The GM edited the rules JSON by hand.
    putListener(ability.id, stored.rules);
  } else {
    listener.name = name;
  }
  mirrorRules(ability.id);
}

/**
 * Forgets a listener whose ability was deleted in the Journal.
 *
 * @param {object} ability Roll20 ability.
 * @returns {void}
 */
export function handleAbilityDestroyed(ability) {
  if (getListener(ability.id)) {
    deleteListener(ability.id);
  }
}
