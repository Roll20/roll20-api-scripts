// Giving, removing, spending and passing on inspiration, and keeping token
// markers and chat in step with the sheets.

import {
  broadcast,
  buildButton,
  buildButtonGrid,
  buildSecondaryButton,
  whisper,
  whisperEach,
} from './chat.js';
import { API_PLAYER_ID, COMMAND, ICON_URL, RULES_2024, SCRIPT_NAME } from './constants.js';
import { t } from './i18n.js';
import { canControl, ownerIds, partyMembers, tokensFor } from './party.js';
import { readInspiration, readPool, rulesFor, writeInspiration, writePool } from './sheet.js';
import {
  createOffer,
  defaultPool,
  getConfig,
  getKnown,
  getPools,
  pushUndo,
  restoreOffer,
  setKnown,
  setPoints,
  takeOffer,
  takeUndo,
} from './state.js';
import { escapeHtml, getGmPlayerIds, isGmOrMod, queryText, setMarker, toText } from './utils.js';

const observers = [];
const busy = new Set();

/**
 * Registers a function called with (token, prev) whenever this Mod changes a
 * token's markers, matching TokenMod's ObserveTokenChange.
 *
 * @param {Function} fn Observer.
 * @returns {void}
 */
export function observeTokenChange(fn) {
  if (typeof fn === 'function') {
    observers.push(fn);
  }
}

/**
 * Returns the word for inspiration for a character: "Heroic Inspiration"
 * under the 2024 rules, "Inspiration" under the 2014 rules.
 *
 * @param {string} charId Character ID.
 * @param {string} lang Locale code.
 * @returns {string} Translated term.
 */
export function termFor(charId, lang) {
  const pool = activePool();
  if (pool) {
    return pool.name;
  }
  return t(rulesFor(charId) === RULES_2024 ? 'terms.heroic' : 'terms.classic', lang);
}

/**
 * Returns a character's name.
 *
 * @param {object} character Roll20 character.
 * @returns {string} Name.
 */
function nameOf(character) {
  return toText(character?.get('name')) || toText(character?.id);
}

/**
 * Shows or hides the inspiration marker on every token for a character.
 *
 * @param {string} charId Character ID.
 * @param {boolean} inspired Whether to show it.
 * @returns {void}
 */
export function syncTokens(charId, inspired) {
  applyMarker(charId, getConfig().marker, inspired);
}

/**
 * Returns the pool that commands naming no pool work on: the default pool
 * while Tracking is set to a points pool, otherwise none (the sheet's
 * inspiration box is used).
 *
 * @returns {object|null} Pool.
 */
export function activePool() {
  return getConfig().tracking === 'pool' ? defaultPool() : null;
}

/**
 * Returns the marker shown while a character has points in a pool. The
 * default pool uses the Marker setting while it is the one being tracked;
 * other pools use their own marker, if they have one.
 *
 * @param {object} pool Pool.
 * @returns {string} Marker tag, or an empty string for none.
 */
export function poolMarker(pool) {
  if (pool === defaultPool()) {
    return getConfig().tracking === 'pool' ? getConfig().marker : '';
  }
  return pool.marker === getConfig().marker ? '' : pool.marker;
}

/**
 * Reads a character's points in a pool, records them and puts its markers
 * right.
 *
 * @param {string} charId Character ID.
 * @param {object} pool Pool.
 * @returns {{where: string, exists: boolean, value: number}} What was read.
 */
export function syncPool(charId, pool) {
  const read = readPool(charId, pool);
  setPoints(pool.id, charId, read.value);
  applyMarker(charId, poolMarker(pool), read.value > 0);
  return read;
}

/**
 * Shows or hides a marker on every token for a character.
 *
 * @param {string} charId Character ID.
 * @param {string} marker Marker tag; nothing happens when empty.
 * @param {boolean} inspired Whether to show it.
 * @returns {void}
 */
export function applyMarker(charId, marker, inspired) {
  if (!marker) {
    return;
  }
  for (const token of tokensFor(charId)) {
    const prev = { ...token.attributes, statusmarkers: token.get('statusmarkers') };
    if (setMarker(token, marker, inspired)) {
      for (const fn of observers) {
        try {
          fn(token, prev);
        } catch (err) {
          log(`${SCRIPT_NAME}: observer failed: ${err?.message || err}`);
        }
      }
    }
  }
}

/**
 * Plays the chosen special effect on a character's tokens.
 *
 * @param {string} charId Character ID.
 * @returns {void}
 */
function playFx(charId) {
  const { fx, fxType } = getConfig();
  if (!fx || typeof spawnFx !== 'function') {
    return;
  }
  for (const token of tokensFor(charId)) {
    if (token.get('layer') === 'gmlayer') {
      continue;
    }
    spawnFx(token.get('left'), token.get('top'), fxType, token.get('_pageid'));
  }
}

/**
 * Builds the body of an announcement card.
 *
 * @param {string} text Sentence (escaped).
 * @param {string} [buttons] Button HTML.
 * @returns {string} HTML.
 */
function announcementBody(text, buttons = '') {
  return [
    '<div style="overflow:hidden;min-height:38px">',
    `<img src="${ICON_URL}" alt="" style="float:right;width:36px;height:36px;margin-left:6px">`,
    `<div>${text}</div>`,
    '</div>',
    buttons ? `<div style="margin-top:4px">${buttons}</div>` : '',
  ].join('');
}

/**
 * Sends an announcement the way the GM chose: to everyone, to the GM and the
 * character's players, or not at all.
 *
 * @param {object} character Roll20 character.
 * @param {string} title Card title.
 * @param {string} body Card body.
 * @returns {void}
 */
function announce(character, title, body) {
  const mode = getConfig().announce;
  if (mode === 'public') {
    broadcast(title, body);
  } else if (mode === 'gm') {
    whisperEach([...getGmPlayerIds(), ...ownerIds(character)], title, body);
  }
}

/**
 * Runs an action for one character at a time, so a double-clicked button
 * cannot spend the same inspiration twice.
 *
 * @param {string} charId Character ID.
 * @param {Function} fn Async action.
 * @returns {Promise<object>} The action's result, or `{status: 'busy'}`.
 */
async function exclusive(charId, fn) {
  if (busy.has(charId)) {
    return { status: 'busy' };
  }
  busy.add(charId);
  try {
    return await fn();
  } finally {
    busy.delete(charId);
  }
}

/**
 * Writes a new value, recording it first so the sheet's own change event for
 * this write is not taken for a player's change.
 *
 * @param {string} charId Character ID.
 * @param {boolean} inspired New value.
 * @returns {Promise<{ok: boolean, error?: string}>} Result.
 */
async function store(charId, inspired) {
  const before = getKnown(charId);
  setKnown(charId, inspired);
  const result = await writeInspiration(charId, inspired);
  if (!result.ok) {
    setKnown(charId, before);
  }
  return result;
}

/**
 * Announces that a character gained inspiration, with a Spend button.
 *
 * @param {object} character Roll20 character.
 * @returns {void}
 */
function announceGain(character) {
  const lang = getConfig().language;
  const term = termFor(character.id, lang);
  const text = escapeHtml(t('messages.gained', lang, { name: nameOf(character), term }));
  const button = getConfig().playerSpend
    ? buildButtonGrid(
        [buildButton(t('buttons.spend', lang), `${COMMAND} spend --ids ${character.id}`)],
        1
      )
    : '';
  announce(character, term, announcementBody(text, button));
}

/**
 * Announces a spend, and tells the GM with an Undo button.
 *
 * @param {object} character Roll20 character.
 * @param {string|null} playerId Who spent it, or null for a change on the sheet or token.
 * @returns {void}
 */
function announceSpend(character, playerId) {
  const lang = getConfig().language;
  const term = termFor(character.id, lang);
  const name = nameOf(character);
  announce(
    character,
    term,
    announcementBody(escapeHtml(t('messages.spent', lang, { name, term })))
  );
  const undoId = pushUndo(character.id, playerId || '', Date.now());
  const who = playerId && getObj('player', playerId)?.get('displayname');
  const line = who
    ? t('messages.spentBy', lang, { name, term, player: who })
    : t('messages.spentSheet', lang, { name, term });
  whisper(
    null,
    SCRIPT_NAME,
    `<div>${escapeHtml(line)}</div>${buildButtonGrid([buildSecondaryButton(t('buttons.undo', lang), `${COMMAND} undo ${undoId}`)], 1)}`
  );
}

/**
 * Gives a character inspiration. Under the 2024 rules, a character who
 * already has Heroic Inspiration may give it to another party member instead.
 *
 * @param {object} character Roll20 character.
 * @param {string} actorId Who gave it.
 * @returns {Promise<{status: string, error?: string}>} given | already | offered | failed | busy.
 */
export function give(character, actorId) {
  return exclusive(character.id, async () => {
    const { inspired } = await readInspiration(character.id);
    if (inspired) {
      setKnown(character.id, true);
      syncTokens(character.id, true);
      if (getConfig().passOn && rulesFor(character.id) === RULES_2024) {
        offerPassOn(character, actorId);
        return { status: 'offered' };
      }
      return { status: 'already' };
    }
    const result = await store(character.id, true);
    if (!result.ok) {
      return { status: 'failed', error: result.error };
    }
    syncTokens(character.id, true);
    playFx(character.id);
    announceGain(character);
    return { status: 'given' };
  });
}

/**
 * Takes inspiration away without it counting as a spend.
 *
 * @param {object} character Roll20 character.
 * @returns {Promise<{status: string, error?: string}>} removed | none | failed | busy.
 */
export function remove(character) {
  return exclusive(character.id, async () => {
    const { inspired } = await readInspiration(character.id);
    if (!inspired) {
      setKnown(character.id, false);
      syncTokens(character.id, false);
      return { status: 'none' };
    }
    const result = await store(character.id, false);
    if (!result.ok) {
      return { status: 'failed', error: result.error };
    }
    syncTokens(character.id, false);
    return { status: 'removed' };
  });
}

/**
 * Spends a character's inspiration.
 *
 * @param {object} character Roll20 character.
 * @param {string} actorId Who is spending it.
 * @returns {Promise<{status: string, error?: string}>} spent | none | denied | failed | busy.
 */
export function spend(character, actorId) {
  const gm = isGmOrMod(actorId, API_PLAYER_ID);
  if (!gm && (!getConfig().playerSpend || !canControl(actorId, character))) {
    return Promise.resolve({ status: 'denied' });
  }
  return exclusive(character.id, async () => {
    const { inspired } = await readInspiration(character.id);
    if (!inspired) {
      setKnown(character.id, false);
      syncTokens(character.id, false);
      return { status: 'none' };
    }
    const result = await store(character.id, false);
    if (!result.ok) {
      return { status: 'failed', error: result.error };
    }
    syncTokens(character.id, false);
    announceSpend(character, actorId === API_PLAYER_ID ? null : actorId);
    return { status: 'spent' };
  });
}

/**
 * Gives back inspiration that was spent.
 *
 * @param {string} undoId Undo ID from the GM's spend message.
 * @returns {Promise<{status: string, name?: string, error?: string}>} restored | unknown | already | failed | busy.
 */
export async function undoSpend(undoId) {
  const entry = takeUndo(undoId);
  const character = entry && getObj('character', entry.charId);
  if (!character) {
    return { status: 'unknown' };
  }
  if (entry.poolId) {
    const pool = getPools().find((p) => p.id === entry.poolId);
    return pool ? undoPoolSpend(character, pool, entry.amount) : { status: 'unknown' };
  }
  const result = await exclusive(character.id, async () => {
    const { inspired } = await readInspiration(character.id);
    if (inspired) {
      return { status: 'already' };
    }
    const written = await store(character.id, true);
    if (!written.ok) {
      return { status: 'failed', error: written.error };
    }
    syncTokens(character.id, true);
    return { status: 'restored' };
  });
  if (result.status === 'restored') {
    const lang = getConfig().language;
    const term = termFor(character.id, lang);
    const text = t('messages.restored', lang, { name: nameOf(character), term });
    whisperEach(
      [...getGmPlayerIds(), ...ownerIds(character)],
      term,
      announcementBody(escapeHtml(text))
    );
  }
  return { ...result, name: nameOf(character) };
}

// ---------------------------------------------------------------------------
// Points pools
// ---------------------------------------------------------------------------

/**
 * Builds the Spend and Boost buttons shown under a pool announcement.
 *
 * @param {object} character Roll20 character.
 * @param {object} pool Pool.
 * @returns {string} Button HTML, empty when players cannot spend.
 */
function poolButtons(character, pool) {
  if (!getConfig().playerSpend) {
    return '';
  }
  const lang = getConfig().language;
  const target = `--ids ${character.id} --pool ${pool.id}`;
  return buildButtonGrid([
    buildButton(
      t('buttons.spend', lang),
      `${COMMAND} spend ?{${queryText(t('prompts.points', lang))}|1} ${target}`
    ),
    buildSecondaryButton(
      t('buttons.boost', lang),
      `${COMMAND} boost ?{${queryText(t('prompts.bonus', lang))}|1} ${target}`
    ),
  ]);
}

/**
 * Changes a character's points in a pool and puts its markers right.
 *
 * @param {object} character Roll20 character.
 * @param {object} pool Pool.
 * @param {number} after New points.
 * @returns {void}
 */
function storePool(character, pool, after) {
  setPoints(pool.id, character.id, after);
  writePool(character.id, pool, after);
  applyMarker(character.id, poolMarker(pool), after > 0);
}

/**
 * Adds points to a character's pool, up to the pool's maximum.
 *
 * @param {object} character Roll20 character.
 * @param {object} pool Pool.
 * @param {number} amount Points to add.
 * @returns {Promise<object>} `{status}`: given | full | busy, with before, after and amount.
 */
export function poolGive(character, pool, amount) {
  return exclusive(character.id, async () => {
    const before = readPool(character.id, pool).value;
    const after = pool.max > 0 ? Math.min(pool.max, before + amount) : before + amount;
    if (after <= before) {
      syncPool(character.id, pool);
      return { status: 'full', term: pool.name, max: pool.max };
    }
    storePool(character, pool, after);
    playFx(character.id);
    const lang = getConfig().language;
    const vars = {
      name: nameOf(character),
      term: pool.name,
      amount: after - before,
      before,
      after,
    };
    announce(
      character,
      pool.name,
      announcementBody(
        escapeHtml(t('pool.gained', lang, vars)),
        after > 0 ? poolButtons(character, pool) : ''
      )
    );
    return { status: 'given', ...vars };
  });
}

/**
 * Takes points away without it counting as a spend.
 *
 * @param {object} character Roll20 character.
 * @param {object} pool Pool.
 * @param {number|'all'} amount Points to take, or `all`.
 * @returns {Promise<object>} `{status}`: poolRemoved | poolNone | busy.
 */
export function poolRemove(character, pool, amount) {
  return exclusive(character.id, async () => {
    const before = readPool(character.id, pool).value;
    if (before === 0) {
      syncPool(character.id, pool);
      return { status: 'poolNone', term: pool.name };
    }
    const taken = amount === 'all' ? before : Math.min(before, amount);
    const after = before - taken;
    storePool(character, pool, after);
    return { status: 'poolRemoved', term: pool.name, amount: taken, before, after };
  });
}

/**
 * Spends points from a character's pool. With a bonus, the points bought a
 * bonus to a roll, at the pool's cost per +1.
 *
 * @param {object} character Roll20 character.
 * @param {object} pool Pool.
 * @param {number} amount Points to spend.
 * @param {string} actorId Who is spending them.
 * @param {number} [bonus] The bonus the points buy.
 * @returns {Promise<object>} `{status}`: spent | short | poolNone | denied | busy.
 */
export function poolSpend(character, pool, amount, actorId, bonus = 0) {
  const gm = isGmOrMod(actorId, API_PLAYER_ID);
  if (!gm && (!getConfig().playerSpend || !canControl(actorId, character))) {
    return Promise.resolve({ status: 'denied' });
  }
  return exclusive(character.id, async () => {
    const before = readPool(character.id, pool).value;
    if (before === 0) {
      syncPool(character.id, pool);
      return { status: 'poolNone', term: pool.name };
    }
    if (amount > before) {
      return { status: 'short', term: pool.name, have: before, need: amount };
    }
    const after = before - amount;
    storePool(character, pool, after);
    const lang = getConfig().language;
    const name = nameOf(character);
    const vars = { name, term: pool.name, amount, bonus, before, after };
    announce(
      character,
      pool.name,
      announcementBody(
        escapeHtml(t(bonus > 0 ? 'pool.boosted' : 'pool.spent', lang, vars)),
        after > 0 ? poolButtons(character, pool) : ''
      )
    );
    const playerId = actorId === API_PLAYER_ID ? '' : actorId;
    const undoId = pushUndo(character.id, playerId, Date.now(), { poolId: pool.id, amount });
    const who = playerId && getObj('player', playerId)?.get('displayname');
    const line = t('pool.spentBy', lang, { ...vars, player: who || SCRIPT_NAME });
    whisper(
      null,
      SCRIPT_NAME,
      `<div>${escapeHtml(line)}</div>${buildButtonGrid([buildSecondaryButton(t('buttons.undo', lang), `${COMMAND} undo ${undoId}`)], 1)}`
    );
    return { status: 'spent', ...vars };
  });
}

/**
 * Gives back points that were spent.
 *
 * @param {object} character Roll20 character.
 * @param {object} pool Pool.
 * @param {number} amount Points to give back.
 * @returns {Promise<object>} `{status}`: restored | busy, with the character's name.
 */
async function undoPoolSpend(character, pool, amount) {
  const result = await exclusive(character.id, async () => {
    const before = readPool(character.id, pool).value;
    const after = before + amount;
    storePool(character, pool, after);
    return { status: 'restored', before, after };
  });
  if (result.status === 'restored') {
    const lang = getConfig().language;
    const text = t('pool.restored', lang, {
      name: nameOf(character),
      term: pool.name,
      amount,
      before: result.before,
      after: result.after,
    });
    whisperEach(
      [...getGmPlayerIds(), ...ownerIds(character)],
      pool.name,
      announcementBody(escapeHtml(text))
    );
  }
  return { ...result, name: nameOf(character) };
}

/**
 * Reacts to a pool's points being changed on the sheet by hand: the value is
 * recorded and the markers follow.
 *
 * @param {object} attr Roll20 attribute that changed.
 * @returns {void}
 */
export function handlePoolAttribute(attr) {
  const charId = attr.get('_characterid') || attr.get('characterid');
  if (!charId || busy.has(charId)) {
    return;
  }
  for (const pool of getPools()) {
    syncPool(charId, pool);
  }
}

/**
 * Asks a character's players (or the GM, when nobody controls it) who should
 * get the Heroic Inspiration it cannot hold twice.
 *
 * @param {object} character Roll20 character that already has it.
 * @param {string} actorId Who tried to give it.
 * @returns {void}
 */
function offerPassOn(character, actorId) {
  const lang = getConfig().language;
  const term = termFor(character.id, lang);
  const offerId = createOffer(character.id, Date.now());
  const candidates = partyMembers().filter((c) => c.id !== character.id && getKnown(c.id) !== true);
  const buttons = candidates.map((c) =>
    buildButton(nameOf(c), `${COMMAND} pass ${offerId} ${c.id}`)
  );
  buttons.push(buildSecondaryButton(t('buttons.decline', lang), `${COMMAND} pass ${offerId} none`));
  const body = [
    `<div>${escapeHtml(t('messages.passOffer', lang, { name: nameOf(character), term }))}</div>`,
    candidates.length === 0
      ? `<div style="margin-top:3px;font-size:0.9em">${escapeHtml(t('messages.passNobody', lang))}</div>`
      : '',
    buildButtonGrid(buttons, 2),
  ].join('');
  const owners = ownerIds(character);
  const recipients = owners.length > 0 ? owners : getGmPlayerIds();
  whisperEach(recipients, term, body);
  if (owners.length > 0 && isGmOrMod(actorId, API_PLAYER_ID)) {
    whisper(
      null,
      SCRIPT_NAME,
      escapeHtml(t('messages.passAsked', lang, { name: nameOf(character), term }))
    );
  }
}

/**
 * Passes Heroic Inspiration on from an offer, or lets it go.
 *
 * @param {string} offerId Offer ID.
 * @param {string} targetId Character ID, or `none` to let it go.
 * @param {string} actorId Who clicked.
 * @returns {Promise<{status: string, from?: string, to?: string, term?: string, error?: string}>} passed | declined | unknown | denied | invalid | already | failed | busy.
 */
export async function passOn(offerId, targetId, actorId) {
  const now = Date.now();
  const offer = takeOffer(offerId, now);
  const from = offer && getObj('character', offer.charId);
  if (!from) {
    return { status: 'unknown' };
  }
  const putBack = () => restoreOffer(offerId, offer);
  if (!isGmOrMod(actorId, API_PLAYER_ID) && !canControl(actorId, from)) {
    putBack();
    return { status: 'denied' };
  }
  const term = termFor(from.id, getConfig().language);
  if (targetId === 'none') {
    return { status: 'declined', from: nameOf(from), term };
  }
  const target = getObj('character', targetId);
  if (!target || target.id === from.id || !partyMembers().some((c) => c.id === target.id)) {
    putBack();
    return { status: 'invalid' };
  }
  const result = await exclusive(target.id, async () => {
    const { inspired } = await readInspiration(target.id);
    if (inspired) {
      setKnown(target.id, true);
      return { status: 'already' };
    }
    const written = await store(target.id, true);
    return written.ok ? { status: 'passed' } : { status: 'failed', error: written.error };
  });
  if (result.status === 'already' || result.status === 'busy') {
    putBack();
  }
  if (result.status === 'passed') {
    syncTokens(target.id, true);
    playFx(target.id);
    const lang = getConfig().language;
    const term = termFor(target.id, lang);
    const text = t('messages.passed', lang, { from: nameOf(from), to: nameOf(target), term });
    const button = getConfig().playerSpend
      ? buildButton(t('buttons.spend', lang), `${COMMAND} spend --ids ${target.id}`)
      : '';
    announce(target, term, announcementBody(escapeHtml(text), button));
  }
  return { ...result, from: nameOf(from), to: nameOf(target), term };
}

/**
 * Reacts to inspiration changed on a sheet by a person. Ticking it counts as
 * a gain and clearing it as a spend, so the GM can undo it.
 *
 * @param {string} charId Character ID.
 * @param {boolean} inspired New value.
 * @returns {void}
 */
export function handleSheetValue(charId, inspired) {
  if (busy.has(charId) || getKnown(charId) === inspired) {
    return;
  }
  // While a points pool is tracked, the sheet's inspiration box is only recorded.
  if (activePool()) {
    setKnown(charId, inspired);
    return;
  }
  const first = getKnown(charId) === undefined;
  setKnown(charId, inspired);
  syncTokens(charId, inspired);
  const character = getObj('character', charId);
  // The first value seen for a character is only recorded.
  if (!character || first) {
    return;
  }
  if (inspired) {
    playFx(charId);
    announceGain(character);
  } else {
    announceSpend(character, null);
  }
}

/**
 * Reacts to the inspiration marker being added to or taken off a token by
 * hand or by another Mod: the sheet follows the marker.
 *
 * @param {object} token Roll20 graphic.
 * @param {boolean} shown Whether the marker is now shown.
 * @returns {Promise<void>}
 */
export async function handleMarkerChange(token, shown) {
  const character = getObj('character', token.get('represents'));
  if (!character) {
    return;
  }
  // A pool's marker only shows whether there are points: it is put back.
  const pool = activePool();
  if (pool) {
    syncPool(character.id, pool);
    return;
  }
  if (shown) {
    const result = await give(character, API_PLAYER_ID);
    if (result.status === 'offered' || result.status === 'already') {
      syncTokens(character.id, true);
    }
    return;
  }
  const result = await spend(character, API_PLAYER_ID);
  if (result.status === 'none') {
    syncTokens(character.id, false);
  }
}

/**
 * Reads every character once, records the values and puts the markers right.
 *
 * @returns {Promise<{checked: number, inspired: number}>} Counts.
 */
export async function syncAll() {
  let checked = 0;
  let inspired = 0;
  const tracked = activePool();
  for (const character of findObjs({ _type: 'character' })) {
    for (const pool of getPools()) {
      const read = syncPool(character.id, pool);
      if (pool === tracked && read.exists) {
        checked += 1;
        inspired += read.value > 0 ? 1 : 0;
      }
    }
    const value = await readInspiration(character.id);
    if (tracked) {
      if (value.kind !== 'none') {
        setKnown(character.id, value.inspired);
      }
      continue;
    }
    if (value.kind === 'none') {
      continue;
    }
    checked += 1;
    if (value.inspired) {
      inspired += 1;
    }
    setKnown(character.id, value.inspired);
    syncTokens(character.id, value.inspired);
  }
  return { checked, inspired };
}
