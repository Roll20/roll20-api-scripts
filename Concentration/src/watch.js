// Catches hit point damage that Roll20 never reports. Roll20 raises no
// change:graphic event when another Mod (AlterBars, for example) sets a token
// bar, so Concentration remembers the hit points of everyone concentrating and
// looks again shortly after each Mod command, and when a linked attribute changes.

import { BAR_CHECK_DELAYS_MS, SCRIPT_NAME } from './constants.js';
import { handleDamage } from './saves.js';
import { getConfig, getRecords } from './state.js';
import { keyOf, tokensFor } from './tracker.js';
import { isToken, toText } from './utils.js';

/** Last hit points seen for each concentrating token: token ID → bar value. */
const seen = new Map();

/**
 * Returns the name of the hit point bar's value property.
 *
 * @returns {string} For example 'bar1_value'.
 */
function barValue() {
  return `bar${getConfig().bar}_value`;
}

/**
 * Returns every token on the map for someone concentrating.
 *
 * @returns {object[]} Tokens.
 */
function concentratingTokens() {
  return Object.keys(getRecords()).flatMap((key) => tokensFor(key));
}

/**
 * Treats a drop in hit points as damage, logging any error.
 *
 * @param {object} token Roll20 graphic.
 * @param {string} before Hit points before.
 * @param {string} after Hit points now.
 * @returns {void}
 */
function damage(token, before, after) {
  handleDamage(token, { [barValue()]: before }, after).catch((err) => {
    log(`${SCRIPT_NAME} ERROR checking hit points: ${err?.message || err}`);
  });
}

/**
 * Remembers a token's hit points as seen.
 *
 * @param {object} token Roll20 graphic.
 * @returns {void}
 */
export function noteBar(token) {
  if (isToken(token)) {
    seen.set(token.id, toText(token.get(barValue())));
  }
}

/**
 * Remembers the hit points of concentrating tokens not seen yet.
 *
 * @returns {void}
 */
function noteUnseen() {
  for (const token of concentratingTokens()) {
    if (!seen.has(token.id)) {
      noteBar(token);
    }
  }
}

/**
 * Looks for hit points that dropped without an event and treats each drop as
 * damage. Forgets tokens no longer concentrating.
 *
 * @returns {void}
 */
export function checkBars() {
  const live = new Set();
  for (const token of concentratingTokens()) {
    live.add(token.id);
    const before = seen.get(token.id);
    noteBar(token);
    const after = seen.get(token.id);
    if (before !== undefined && before !== after) {
      damage(token, before, after);
    }
  }
  for (const id of seen.keys()) {
    if (!live.has(id)) {
      seen.delete(id);
    }
  }
}

/**
 * After a Mod command, looks again once other Mods have had time to act
 * (AlterBars waits for a dice roll before it sets the bar).
 *
 * @param {object} msg Roll20 chat message.
 * @returns {void}
 */
export function handleApiCommand(msg) {
  if (msg?.type !== 'api') {
    return;
  }
  noteUnseen();
  for (const delay of BAR_CHECK_DELAYS_MS) {
    setTimeout(checkBars, delay);
  }
}

/**
 * A linked hit point attribute changed (by a Mod, a sheet or a person): treats a
 * drop as damage to the tokens that show it.
 *
 * @param {object} attr Roll20 attribute.
 * @param {object} prev Previous attribute values.
 * @returns {void}
 */
export function handleAttributeChange(attr, prev) {
  const characterId = toText(attr.get('characterid'));
  const before = toText(prev?.current);
  if (!characterId || before === toText(attr.get('current'))) {
    return;
  }
  const link = `bar${getConfig().bar}_link`;
  const records = getRecords();
  for (const token of tokensFor(characterId)) {
    if (toText(token.get(link)) !== attr.id || !records[keyOf(token)]) {
      continue;
    }
    // The bar may not show the new value yet; the attribute is the truth.
    const after = toText(attr.get('current'));
    seen.set(token.id, after);
    damage(token, before, after);
  }
}
