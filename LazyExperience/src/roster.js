// Who shares the XP: Roll20's own party, the players' characters, or a hand-picked list.

import { getCharacterRecord, getConfig } from './state.js';
import { splitList, toText } from './utils.js';

/**
 * Returns the non-GM player IDs that control a character. "all" is not a player.
 *
 * @param {object} character Roll20 character.
 * @returns {string[]} Player IDs.
 */
export function controllingPlayers(character) {
  return splitList(character.get('controlledby')).filter(
    (id) => id !== 'all' && getObj('player', id) && !playerIsGM(id)
  );
}

/**
 * Returns true when a character is in Roll20's party (Jumpgate "Party Member").
 *
 * @param {object} character Roll20 character.
 * @returns {boolean} True when in the party.
 */
export function inRoll20Party(character) {
  return character.get('inParty') === true || toText(character.get('inParty')) === 'true';
}

/**
 * Returns true when any character is in Roll20's party.
 *
 * @returns {boolean} True when the party is in use.
 */
export function roll20PartyInUse() {
  return findObjs({ _type: 'character' }).some(inRoll20Party);
}

/**
 * Works out which roster source applies now.
 *
 * @returns {'party'|'players'|'manual'} Source.
 */
export function rosterSource() {
  const setting = getConfig().roster;
  if (setting === 'auto') {
    return roll20PartyInUse() ? 'party' : 'players';
  }
  return setting;
}

/**
 * Returns the characters on the roster, sorted by name. Archived and excluded
 * characters are left out; absent ones are kept (they may get a share).
 *
 * @returns {object[]} Roll20 characters.
 */
export function getRoster() {
  const source = rosterSource();
  return findObjs({ _type: 'character' })
    .filter((c) => c.get('archived') !== true)
    .filter((c) => {
      const rec = getCharacterRecord(c.id);
      if (rec.excluded) {
        return false;
      }
      if (source === 'party') return inRoll20Party(c);
      if (source === 'manual') return rec.member === true;
      return controllingPlayers(c).length > 0;
    })
    .sort((a, b) => toText(a.get('name')).localeCompare(toText(b.get('name'))));
}

/**
 * Returns true when a character is on the roster.
 *
 * @param {string} characterId Character ID.
 * @returns {boolean} True when on the roster.
 */
export function isOnRoster(characterId) {
  return getRoster().some((c) => c.id === characterId);
}

/**
 * Returns a character's share of the pool: 0 to 1 for absent characters (the
 * Absent Share setting), otherwise its own share (default 1).
 *
 * @param {string} characterId Character ID.
 * @returns {number} Share.
 */
export function shareOf(characterId) {
  const rec = getCharacterRecord(characterId);
  if (rec.absent) {
    return Math.max(0, Math.min(1, Number(getConfig().absentShare) || 0));
  }
  const share = Number(rec.share);
  return Number.isFinite(share) && share >= 0 ? share : 1;
}

/**
 * Splits an amount of XP between the roster.
 *
 * @param {number} amount XP to split.
 * @param {object[]} [roster] Characters (defaults to the roster).
 * @returns {{perShare: number, shares: number, remainder: number, rows: {id: string, name: string, share: number, xp: number}[]}} Split.
 */
export function splitXp(amount, roster = getRoster()) {
  const extra = Math.max(0, Number(getConfig().extraShares) || 0);
  const rows = roster.map((c) => ({ id: c.id, name: c.get('name'), share: shareOf(c.id), xp: 0 }));
  const shares = rows.reduce((sum, r) => sum + r.share, 0) + extra;
  if (shares <= 0 || amount <= 0) {
    return { perShare: 0, shares, remainder: Math.max(0, amount), rows };
  }
  const perShare = amount / shares;
  let given = 0;
  for (const row of rows) {
    row.xp = Math.floor(perShare * row.share);
    given += row.xp;
  }
  // Extra shares (companions, hirelings) take their XP out of the pool.
  const extraXp = Math.floor(perShare * extra);
  return {
    perShare: Math.floor(perShare),
    shares,
    remainder: Math.max(0, amount - given - extraXp),
    rows,
  };
}

/**
 * Returns the average level of the roster from tracked levels, for systems whose
 * monster XP depends on it.
 *
 * @returns {number|null} Average level, or null when none is known.
 */
export function averagePartyLevel() {
  const levels = getRoster()
    .map((c) => getCharacterRecord(c.id).level)
    .filter((n) => Number.isFinite(n) && n > 0);
  if (levels.length === 0) {
    return null;
  }
  return Math.round(levels.reduce((a, b) => a + b, 0) / levels.length);
}
