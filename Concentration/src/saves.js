// Concentration saves: noticing damage, working out the DC, rolling the save
// (or offering Roll and Advantage buttons) and ending concentration on a failure.

import { buildButton, buildRow, buildSecondaryButton } from './chat.js';
import {
  COLOR_BORDER,
  COLOR_FAILURE,
  COLOR_SUCCESS,
  DAMAGE_DEBOUNCE_MS,
  MAX_SAVE_DC,
  MIN_SAVE_DC,
} from './constants.js';
import { debugLog } from './debug.js';
import {
  addPendingRoll,
  getConfig,
  getPendingRoll,
  getRecord,
  hasAdvantage,
  takePendingRoll,
} from './state.js';
import { rich, tr } from './text.js';
import {
  canControl,
  characterOf,
  endConcentration,
  isConcentrating,
  keyOf,
  sendAbout,
} from './tracker.js';
import { clamp, escapeHtml, parseNumber, tokenName, toText } from './utils.js';

// When each key last took damage, so one hit on linked tokens is checked once.
const lastHit = new Map();

/**
 * Works out the DC of a concentration save.
 *
 * @param {number} damage Damage taken.
 * @returns {number} DC 10 or half the damage (rounded down), up to DC 30.
 */
export function saveDc(damage) {
  return clamp(Math.floor(damage / 2), MIN_SAVE_DC, MAX_SAVE_DC);
}

/**
 * Formats a modifier with its sign.
 *
 * @param {number} mod Modifier.
 * @returns {string} "+3" or "-1".
 */
function signed(mod) {
  return mod < 0 ? String(mod) : `+${mod}`;
}

/**
 * Reads a character's concentration save modifier from the Bonus Attribute.
 * D&D 2024 (Beacon) sheets are read with getSheetItem, other sheets with
 * getAttrByName. A missing or non-numeric value counts as 0.
 *
 * @param {string} characterId Character ID.
 * @returns {Promise<number>} Modifier.
 */
export async function getSaveModifier(characterId) {
  const attribute = getConfig().bonus_attribute;
  if (!characterId) {
    debugLog('Missing character for save modifier', { attribute });
    return 0;
  }
  let raw = null;
  if (typeof getSheetItem === 'function') {
    try {
      raw = await getSheetItem(characterId, attribute);
    } catch (err) {
      debugLog('getSheetItem failed', {
        characterId,
        attribute,
        error: err?.message || String(err),
      });
    }
  }
  if ((raw === null || raw === undefined || raw === '') && typeof getAttrByName === 'function') {
    try {
      raw = getAttrByName(characterId, attribute, 'current');
    } catch (err) {
      debugLog('getAttrByName failed', {
        characterId,
        attribute,
        error: err?.message || String(err),
      });
    }
  }
  const value = parseNumber(raw);
  if (value === null) {
    debugLog('Missing or non-numeric concentration modifier', {
      characterId,
      attribute,
      value: raw,
    });
    return 0;
  }
  return Math.trunc(value);
}

/**
 * Rolls two d20s with Roll20's dice roller.
 *
 * @returns {Promise<number[]>} The two results.
 */
function rollTwoD20() {
  return new Promise((resolve) => {
    sendChat('', '[[1d20]] [[1d20]]', (results) => {
      const rolls = results?.[0]?.inlinerolls || [];
      const value = (i) => {
        const total = Number(rolls[i]?.results?.total);
        return Number.isFinite(total) ? total : randomInteger(20);
      };
      resolve([value(0), value(1)]);
    });
  });
}

/**
 * Builds the Concentration Save card body.
 *
 * @param {object} save Save details.
 * @returns {string} HTML.
 */
function buildSaveBody(save) {
  const { dc, mod, dice, advantage, total, success, spell, name } = save;
  const colour = success ? COLOR_SUCCESS : COLOR_FAILURE;
  const rollText = advantage
    ? tr('save.advantageRoll', { first: dice[0], second: dice[1] })
    : String(dice[0]);
  const vars = { name, spell };
  const outcome = success ? 'kept' : 'lost';
  return [
    buildRow(tr('save.dc'), `<strong>${dc}</strong>`),
    buildRow(tr('save.modifier'), escapeHtml(signed(mod))),
    buildRow(tr('save.roll'), escapeHtml(rollText)),
    `<div style="text-align:center;margin:6px 0 2px 0"><span style="display:inline-block;min-width:2.2em;padding:2px 8px;border:2px solid ${colour};border-radius:4px;font-size:1.6em;font-weight:bold">${total}</span></div>`,
    `<div style="text-align:center;font-weight:bold;color:${colour};font-size:1.1em">${escapeHtml(tr(success ? 'save.success' : 'save.failure'))}</div>`,
    `<div style="border-top:1px solid ${COLOR_BORDER};margin-top:4px;padding-top:3px">${rich(`notices.${spell ? outcome : `${outcome}NoSpell`}`, vars)}</div>`,
  ].join('');
}

/**
 * Rolls a concentration save and reports it. A failed save ends concentration.
 *
 * @param {object} details Save details.
 * @param {string} details.key Character or token ID.
 * @param {string} [details.tokenId] Token that took the damage.
 * @param {number} details.dc DC.
 * @param {number} details.mod Modifier.
 * @param {string} details.name Name shown on the card.
 * @param {boolean} details.advantage Roll with advantage.
 * @returns {Promise<void>}
 */
export async function rollSave({ key, tokenId, dc, mod, name, advantage }) {
  const dice = await rollTwoD20();
  const natural = advantage ? Math.max(dice[0], dice[1]) : dice[0];
  const total = natural + mod;
  const success = total >= dc;
  const token = tokenId ? getObj('graphic', tokenId) : undefined;
  const spell = getRecord(key)?.spell || '';
  sendAbout(
    key,
    token,
    tr('titles.save'),
    buildSaveBody({ dc, mod, dice, advantage, total, success, spell, name }),
    name
  );
  if (!success) {
    endConcentration(key, 'lost', { announce: false, token });
  }
}

/**
 * Sends the "make a concentration save" reminder, with Roll and Advantage
 * buttons when Roll Button is on.
 *
 * @param {object} details Save details (see rollSave).
 * @param {object} token Token that took the damage.
 * @returns {void}
 */
function sendReminder(details, token) {
  const { dc, name, key } = details;
  const lines = [
    `<div>${rich('notices.checkNeeded', { name, dc: tr('save.dcValue', { dc }) })}</div>`,
  ];
  if (getConfig().show_roll_button) {
    const id = addPendingRoll({ ...details, advantage: false });
    const command = `!${getConfig().command}`;
    lines.push(
      `<div style="text-align:center;margin-top:4px">${buildButton(tr('buttons.roll'), `${command} roll ${id}`)}${buildSecondaryButton(tr('buttons.advantage'), `${command} advantage ${id}`)}</div>`
    );
  }
  sendAbout(key, token, tr('titles.check'), lines.join(''), name);
}

/**
 * Handles a change to a token's hit point bar: damage to a concentrating
 * token calls for a save, and 0 hit points ends concentration.
 *
 * @param {object} token Roll20 graphic.
 * @param {object} prev Previous attributes.
 * @returns {Promise<void>}
 */
export async function handleDamage(token, prev) {
  const bar = `bar${getConfig().bar}_value`;
  const before = parseNumber(prev?.[bar]);
  const after = parseNumber(token.get(bar));
  if (before === null || after === null || after >= before) {
    return;
  }
  const key = keyOf(token);
  if (!isConcentrating(key)) {
    return;
  }
  const config = getConfig();
  if (config.end_at_zero && after <= 0) {
    endConcentration(key, 'zeroHp', { token });
    return;
  }
  // A linked bar changes every token of the character, each with the same
  // before and after; only the first of those echoes is a hit.
  const now = Date.now();
  const hit = `${before}>${after}`;
  const last = lastHit.get(key);
  if (last && last.hit === hit && now - last.at < DAMAGE_DEBOUNCE_MS) {
    return;
  }
  lastHit.set(key, { hit, at: now });
  const characterId = toText(characterOf(token)?.id);
  const details = {
    key,
    tokenId: token.id,
    dc: saveDc(before - after),
    mod: await getSaveModifier(characterId),
    name: tokenName(token) || tr('values.unnamed'),
  };
  if (config.auto_roll_save) {
    await rollSave({ ...details, advantage: hasAdvantage(characterId) });
  } else {
    sendReminder(details, token);
  }
}

/**
 * Rolls a save from a Roll or Advantage button.
 *
 * @param {string} id Pending save ID.
 * @param {boolean} advantage Roll with advantage.
 * @param {string} playerId Who clicked.
 * @returns {Promise<'rolled'|'expired'|'denied'>} What happened.
 */
export async function rollPending(id, advantage, playerId) {
  const pending = getPendingRoll(id);
  if (!pending) {
    return 'expired';
  }
  // Someone else's click leaves the button working for the right player; with
  // the token gone, only the GM (or another Mod) may roll.
  const token = pending.tokenId ? getObj('graphic', pending.tokenId) : null;
  const gm = playerId === 'API' || playerIsGM(playerId);
  if (token ? !canControl(token, playerId) : !gm) {
    return 'denied';
  }
  takePendingRoll(id);
  // Concentration that has ended since the reminder needs no save.
  if (!isConcentrating(pending.key)) {
    return 'expired';
  }
  await rollSave({ ...pending, advantage });
  return 'rolled';
}
