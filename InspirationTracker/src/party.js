// Who is in the party, and who may act for a character.

import { getPartyChoices } from './state.js';
import { isToken, toText } from './utils.js';

/**
 * Returns the IDs in a character's "Can Be Edited & Controlled By" list.
 *
 * @param {object} character Roll20 character.
 * @returns {string[]} Player IDs, and `all` when everyone controls it.
 */
export function controllerIds(character) {
  return toText(character?.get('controlledby'))
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

/**
 * Returns true when a player may spend a character's inspiration: a GM, or a
 * player in the character's controlled-by list (or `all`).
 *
 * @param {string} playerId Roll20 player ID.
 * @param {object} character Roll20 character.
 * @returns {boolean} True when allowed.
 */
export function canControl(playerId, character) {
  if (playerIsGM(playerId)) {
    return true;
  }
  const ids = controllerIds(character);
  return ids.includes('all') || ids.includes(playerId);
}

/**
 * Returns the non-GM players who control a character. `all` stands for every
 * player.
 *
 * @param {object} character Roll20 character.
 * @returns {string[]} Player IDs.
 */
export function ownerIds(character) {
  const ids = controllerIds(character);
  const players = ids.includes('all')
    ? findObjs({ _type: 'player' }).map((p) => p.id)
    : ids.filter((id) => getObj('player', id));
  return players.filter((id) => !playerIsGM(id));
}

/**
 * Returns true for a character a player controls, which is how the party is
 * found unless the GM adds or removes characters.
 *
 * @param {object} character Roll20 character.
 * @returns {boolean} True when controlled by a player.
 */
function playerControlled(character) {
  return controllerIds(character).some(
    (id) => id !== 'all' && getObj('player', id) && !playerIsGM(id)
  );
}

/**
 * Lists the party: player-controlled characters plus those the GM added,
 * minus those the GM removed. Archived characters are left out.
 *
 * @returns {object[]} Roll20 characters, sorted by name.
 */
export function partyMembers() {
  const { include, exclude } = getPartyChoices();
  return findObjs({ _type: 'character' })
    .filter((c) => !c.get('archived'))
    .filter((c) => include.includes(c.id) || (playerControlled(c) && !exclude.includes(c.id)))
    .sort((a, b) => toText(a.get('name')).localeCompare(toText(b.get('name'))));
}

/**
 * Returns true when a character is in the party.
 *
 * @param {object} character Roll20 character.
 * @returns {boolean} True for party members.
 */
export function isPartyMember(character) {
  return partyMembers().some((c) => c.id === character.id);
}

/**
 * Finds the characters behind the selected tokens, or behind token and
 * character IDs given with --ids. Duplicates are dropped.
 *
 * @param {object[]} selected msg.selected entries.
 * @param {string[]} ids Token or character IDs.
 * @returns {{characters: object[], skipped: string[]}} Characters, and the tokens or IDs that gave none.
 */
export function resolveCharacters(selected, ids) {
  const characters = [];
  const skipped = [];
  const add = (character, label) => {
    if (!character) {
      skipped.push(label);
    } else if (!characters.some((c) => c.id === character.id)) {
      characters.push(character);
    }
  };
  for (const entry of selected || []) {
    const token = getObj('graphic', entry._id);
    if (token && isToken(token)) {
      add(getObj('character', token.get('represents')), toText(token.get('name')) || token.id);
    }
  }
  for (const id of ids) {
    const token = getObj('graphic', id);
    const character = token
      ? getObj('character', token.get('represents'))
      : getObj('character', id);
    add(character, id);
  }
  return { characters, skipped };
}

/**
 * Returns every token, on every page, that stands for a character.
 *
 * @param {string} charId Character ID.
 * @returns {object[]} Roll20 graphics.
 */
export function tokensFor(charId) {
  return findObjs({ _type: 'graphic', _subtype: 'token', represents: charId });
}
