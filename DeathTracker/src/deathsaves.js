// Keeping dying PCs up to date: sheet changes, a slow poll as a fallback, and
// the death save macro for sheets DeathTracker cannot read.

import { COMMAND, DEATH_SAVE_POLL_MS, MACRO_NAME, STATUS } from './constants.js';
import { isTicked } from './sheet.js';
import { getRecord, getSettings, getState } from './state.js';
import { countSaves } from './status.js';
import { judge } from './tracker.js';
import { splitList, toText } from './utils.js';

/**
 * Returns the tokens DeathTracker has as dying or stable.
 *
 * @param {string} [characterId] Only tokens of this character.
 * @returns {object[]} Roll20 graphics.
 */
export function downedTokens(characterId) {
  const out = [];
  for (const [id, rec] of Object.entries(getState().tokens)) {
    if (rec.status !== STATUS.DYING && rec.status !== STATUS.STABLE) {
      continue;
    }
    const token = getObj('graphic', id);
    if (token && (!characterId || token.get('represents') === characterId)) {
      out.push(token);
    }
  }
  return out;
}

/**
 * Handles a changed attribute: the 2024 sheet's store, or a death save field.
 *
 * @param {object} attr Roll20 attribute.
 * @returns {void}
 */
export function handleAttributeChange(attr) {
  const settings = getSettings();
  if (!settings.deathSaves) {
    return;
  }
  const name = toText(attr.get('name')).toLowerCase();
  const fields = [...splitList(settings.successFields), ...splitList(settings.failureFields)].map(
    (f) => f.toLowerCase()
  );
  if (name !== 'store' && !fields.includes(name)) {
    return;
  }
  for (const token of downedTokens(attr.get('_characterid'))) {
    judge(token);
  }
}

/**
 * Starts the poll that re-reads dying PCs' death saves.
 *
 * @returns {void}
 */
export function startPoll() {
  const tick = () => {
    try {
      if (getSettings().deathSaves) {
        for (const token of downedTokens()) {
          judge(token);
        }
      }
    } catch (e) {
      log(`DeathTracker: death save check failed: ${e?.message || e}`);
    }
    setTimeout(tick, DEATH_SAVE_POLL_MS);
  };
  setTimeout(tick, DEATH_SAVE_POLL_MS);
}

/**
 * Builds the death save macro's action. Roll20's chat fills in the
 * @{selected|...} values when a player clicks it.
 *
 * @returns {string} Macro action.
 */
export function macroAction() {
  const s = getSettings();
  const refs = (fields) =>
    splitList(fields)
      .map((f) => `@{selected|${f}}`)
      .join(',');
  return `${COMMAND} dsync @{selected|token_id} s=${refs(s.successFields)} f=${refs(s.failureFields)}`;
}

/**
 * Creates or updates the death save macro as a token action everyone can use.
 *
 * @param {string} playerId GM's player ID (the macro's owner).
 * @returns {void}
 */
export function installMacro(playerId) {
  const action = macroAction();
  const [macro] = findObjs({ _type: 'macro', name: MACRO_NAME });
  if (macro) {
    macro.set({ action, istokenaction: true, visibleto: 'all' });
  } else {
    createObj('macro', {
      _playerid: playerId,
      name: MACRO_NAME,
      action,
      istokenaction: true,
      visibleto: 'all',
    });
  }
}

/**
 * Reads the macro's "s=1,0,on f=0,0,0" values.
 *
 * @param {string[]} args Words after the token ID.
 * @returns {{s: number, f: number}} Ticked boxes.
 */
export function parseSyncArgs(args) {
  const out = { s: 0, f: 0 };
  for (const arg of args) {
    const m = /^([sf])=(.*)$/i.exec(arg);
    if (m) {
      out[m[1].toLowerCase()] = m[2].split(',').filter(isTicked).length;
    }
  }
  return out;
}

/**
 * Stores death saves sent by the macro, for a sheet DeathTracker cannot read.
 *
 * @param {object} token Roll20 graphic.
 * @param {{s: number, f: number}} counts Ticked boxes.
 * @returns {object} Outcome of judging the token.
 */
export function syncSaves(token, counts) {
  const rec = getRecord(token.id, true);
  const counted = countSaves(counts, rec.base);
  rec.base = counted.base;
  rec.saves = counted.saves;
  return judge(token);
}
