// Who is concentrating on what: starting, switching and ending concentration,
// keeping the marker on the map in step, and telling the table.

import { buildCard, characterTarget, sendTo } from './chat.js';
import { debugLog } from './debug.js';
import { resolveCaster } from './detect.js';
import { clearRecord, getConfig, getRecord, getRecords, setRecord } from './state.js';
import { dirStyle, rich, tr } from './text.js';
import { hasMarker, isToken, setMarker, splitControllers, toText, tokenName } from './utils.js';

/**
 * Returns the character a token represents.
 *
 * @param {object} token Roll20 graphic.
 * @returns {object|null} Character, or null.
 */
export function characterOf(token) {
  const id = toText(token?.get('represents'));
  return id ? getObj('character', id) || null : null;
}

/**
 * Returns true when a token's hit point bar is linked to its character, so
 * every token of that character shares one hit point total.
 *
 * @param {object} token Roll20 graphic.
 * @returns {boolean} True when linked.
 */
function isLinked(token) {
  return Boolean(toText(token.get(`bar${getConfig().bar}_link`)));
}

/**
 * Returns the key concentration is stored under. Tokens of one character with
 * a linked hit point bar (player characters, named NPCs) share it; other
 * tokens (a pack of goblins from one sheet) each concentrate on their own.
 *
 * @param {object} token Roll20 graphic.
 * @returns {string} Character or token ID.
 */
export function keyOf(token) {
  const characterId = toText(token.get('represents'));
  return characterId && isLinked(token) ? characterId : token.id;
}

/**
 * Returns the tokens that show concentration for a key.
 *
 * @param {string} key Character or token ID.
 * @returns {object[]} Tokens.
 */
export function tokensFor(key) {
  const token = getObj('graphic', key);
  if (token) {
    return [token];
  }
  return findObjs({ _type: 'graphic', represents: key }).filter((t) => isToken(t) && isLinked(t));
}

/**
 * Returns the name shown in chat for a key.
 *
 * @param {string} key Character or token ID.
 * @param {object} [token] A token for the key, when known.
 * @returns {string} Name.
 */
function nameFor(key, token) {
  const character = getObj('character', key);
  return (
    toText(character?.get('name')) ||
    tokenName(token || tokensFor(key)[0]) ||
    getRecord(key)?.name ||
    tr('values.unnamed')
  );
}

/**
 * Works out who sees messages about a key, following Send Reminder To.
 * Whispers to a character also go to the GM, who may not control it.
 *
 * @param {string} key Character or token ID.
 * @param {object} [token] A token for the key.
 * @returns {string[]} Whisper targets ('' for everyone).
 */
export function audienceFor(key, token) {
  const mode = getConfig().send_reminder_to;
  if (mode === 'everyone') {
    return [''];
  }
  if (mode === 'character') {
    const character = getObj('character', key) || characterOf(token || tokensFor(key)[0]);
    return character ? [characterTarget(character.get('name')), 'gm'] : ['gm'];
  }
  return ['gm'];
}

/**
 * Sends a card to everyone who should see messages about a key.
 *
 * @param {string} key Character or token ID.
 * @param {object|undefined} token A token for the key.
 * @param {string} title Card title.
 * @param {string} body Card body HTML.
 * @param {string} [subtitle] Second header line.
 * @returns {void}
 */
export function sendAbout(key, token, title, body, subtitle = '') {
  const card = buildCard(title, body, subtitle, dirStyle());
  for (const target of audienceFor(key, token)) {
    sendTo(target, card);
  }
}

/**
 * Announces a change in concentration.
 *
 * @param {string} key Character or token ID.
 * @param {object|undefined} token A token for the key.
 * @param {string} notice Key under `notices.` (with a `NoSpell` variant).
 * @param {object} vars Values: name, spell, old.
 * @returns {void}
 */
function announce(key, token, notice, vars) {
  const variant = vars.spell ? notice : `${notice}NoSpell`;
  sendAbout(
    key,
    token,
    tr('titles.concentration'),
    `<div>${rich(`notices.${variant}`, vars)}</div>`
  );
}

/**
 * Puts the marker on (or takes it off) every token for a key.
 *
 * @param {string} key Character or token ID.
 * @param {boolean} on Add when true.
 * @returns {void}
 */
function markAll(key, on) {
  const marker = getConfig().statusmarker;
  for (const token of tokensFor(key)) {
    setMarker(token, marker, on);
  }
}

/**
 * Returns true when a key is concentrating.
 *
 * @param {string} key Character or token ID.
 * @returns {boolean} True when concentrating.
 */
export function isConcentrating(key) {
  return Boolean(getRecord(key));
}

/**
 * Returns what a token is concentrating on.
 *
 * @param {object} token Roll20 graphic.
 * @returns {{spell: string, name: string, since: number}|null} Record, or null.
 */
export function getRecordFor(token) {
  return getRecord(keyOf(token));
}

/**
 * Starts concentration, or switches it to a new spell.
 *
 * @param {object} token A token for the caster.
 * @param {string} spell Spell name (may be empty).
 * @param {object} [options] Options.
 * @param {boolean} [options.announce=true] Tell the table.
 * @returns {void}
 */
export function startConcentration(token, spell, { announce: tell = true } = {}) {
  const key = keyOf(token);
  const previous = getRecord(key);
  const name = nameFor(key, token);
  // The same spell again (a repeated sheet card, such as Moonbeam's damage each
  // round) changes nothing.
  if (previous && toText(spell) && previous.spell.toLowerCase() === toText(spell).toLowerCase()) {
    markAll(key, true);
    return;
  }
  setRecord(key, spell, name);
  markAll(key, true);
  const record = getRecord(key);
  if (!tell) {
    return;
  }
  if (
    previous?.spell &&
    record.spell &&
    previous.spell.toLowerCase() !== record.spell.toLowerCase()
  ) {
    announce(key, token, 'switched', { name, spell: record.spell, old: previous.spell });
  } else {
    announce(key, token, 'started', { name, spell: record.spell });
  }
}

/**
 * Ends concentration.
 *
 * @param {string} key Character or token ID.
 * @param {'ended'|'lost'|'zeroHp'} reason Why it ended.
 * @param {object} [options] Options.
 * @param {boolean} [options.announce=true] Tell the table.
 * @param {object} [options.token] A token for the key.
 * @returns {boolean} True when the key was concentrating.
 */
export function endConcentration(key, reason, { announce: tell = true, token } = {}) {
  const name = nameFor(key, token);
  const record = clearRecord(key);
  markAll(key, false);
  if (!record) {
    return false;
  }
  debugLog('Concentration ended', { scope: reason, characterName: name, spellName: record.spell });
  if (tell) {
    announce(key, token, reason, { name, spell: record.spell });
  }
  return true;
}

/**
 * `!concentration [spell]` on a token: starts concentration, switches to a
 * different spell, or ends it.
 *
 * @param {object} token Roll20 graphic.
 * @param {string} spell Spell typed after the command (may be empty).
 * @returns {void}
 */
export function toggleConcentration(token, spell) {
  const key = keyOf(token);
  const record = getRecord(key);
  if (!record) {
    startConcentration(token, spell);
    return;
  }
  if (spell && spell.toLowerCase() !== record.spell.toLowerCase()) {
    startConcentration(token, spell);
    return;
  }
  endConcentration(key, 'ended', { token });
}

/**
 * Returns true when a player may change a token's concentration: the GM,
 * other Mods, or someone who controls the token or its character.
 *
 * @param {object} token Roll20 graphic.
 * @param {string} playerId Player ID.
 * @returns {boolean} True when allowed.
 */
export function canControl(token, playerId) {
  if (playerId === 'API' || playerIsGM(playerId)) {
    return true;
  }
  const controllers = [
    ...splitControllers(token.get('controlledby')),
    ...splitControllers(characterOf(token)?.get('controlledby')),
  ];
  return controllers.includes(playerId) || controllers.includes('all');
}

/**
 * Follows the marker being put on or taken off a token by hand.
 *
 * @param {object} token Roll20 graphic.
 * @param {object} prev Previous attributes.
 * @returns {void}
 */
export function handleMarkerChange(token, prev) {
  const marker = getConfig().statusmarker;
  const had = hasMarker({ get: (k) => prev?.[k] }, marker);
  const has = hasMarker(token, marker);
  if (had === has) {
    return;
  }
  const key = keyOf(token);
  if (has && !isConcentrating(key)) {
    startConcentration(token, '');
  } else if (!has && isConcentrating(key)) {
    endConcentration(key, 'ended', { token });
  }
}

/**
 * Ends concentration when its last token is deleted: a token that
 * concentrated on its own, or the last linked token of a character.
 *
 * @param {object} token Roll20 graphic (already removed).
 * @returns {void}
 */
export function handleTokenDestroyed(token) {
  if (getRecord(token.id)) {
    endConcentration(token.id, 'ended', { token });
    return;
  }
  const characterId = toText(token.get('represents'));
  if (characterId && getRecord(characterId)) {
    const remaining = tokensFor(characterId).filter((t) => t.id !== token.id);
    if (remaining.length === 0) {
      endConcentration(characterId, 'ended', { token });
    }
  }
}

/**
 * Keeps one token in step with the records: a new linked token of a
 * concentrating character gets the marker, and a marked token with no record
 * (pasted, or moved between keys by a bar link change) gets one, keeping the
 * spell stored under its other key. Nothing is announced.
 *
 * @param {object} token Roll20 graphic.
 * @returns {void}
 */
export function syncToken(token) {
  if (!isToken(token)) {
    return;
  }
  const marker = getConfig().statusmarker;
  const key = keyOf(token);
  const records = getRecords();
  if (records[key]) {
    setMarker(token, marker, true);
    if (key !== token.id) {
      delete records[token.id];
    }
    return;
  }
  if (!hasMarker(token, marker)) {
    return;
  }
  const characterId = toText(token.get('represents'));
  const old = records[token.id] || (characterId ? records[characterId] : null);
  setRecord(key, old?.spell || '', nameFor(key, token));
  if (old && records[token.id] && key !== token.id) {
    delete records[token.id];
  }
}

/**
 * Marks the caster of an automatically detected concentration spell.
 *
 * @param {object} msg Roll20 chat message.
 * @param {import('./detect.js').SpellCast} spellCast The spell cast.
 * @returns {void}
 */
export function handleSpellCast(msg, spellCast) {
  const { character, warning } = resolveCaster(spellCast);
  if (warning) {
    debugLog('Character resolution warning', {
      warning,
      characterName: spellCast.characterName,
      characterId: spellCast.characterId,
    });
  }
  if (!character) {
    debugLog('Spell cast aborted', {
      reason: 'unresolved-character',
      characterName: spellCast.characterName,
      spellName: spellCast.spellName,
    });
    return;
  }
  const all = findObjs({ _type: 'graphic', represents: character.id }).filter(isToken);
  const pageId = toText(getObj('player', msg.playerid)?.get('_lastpage'));
  const onPage = all.filter((t) => t.get('_pageid') === pageId);
  const tokens = onPage.length > 0 ? onPage : all;
  if (tokens.length === 0) {
    debugLog('No represented tokens found for spell cast', {
      characterName: character.get('name'),
      spellName: spellCast.spellName,
      pageId,
    });
    return;
  }
  // Anyone can post a spell card naming any character, so only the GM, other
  // Mods and the character's own players count.
  const allowed = tokens.filter((token) => canControl(token, msg.playerid));
  if (allowed.length === 0) {
    debugLog('Spell cast aborted', {
      reason: 'sender-does-not-control-caster',
      characterName: character.get('name'),
      spellName: spellCast.spellName,
    });
    return;
  }
  const done = new Set();
  for (const token of allowed) {
    const key = keyOf(token);
    if (done.has(key)) {
      continue;
    }
    done.add(key);
    // A card matched only by the word "concentration" (a feat such as War
    // Caster mentions it) may start concentration but never replaces a spell.
    if (spellCast.weak && getRecord(key)?.spell) {
      debugLog('Spell cast ignored', {
        reason: 'weak-match-while-concentrating',
        characterName: character.get('name'),
        spellName: spellCast.spellName,
      });
      continue;
    }
    startConcentration(token, spellCast.spellName);
  }
}

/**
 * Brings the records in line with the map after a restart: tokens that carry
 * the marker are concentrating, and records with no marked token are dropped.
 *
 * After a setting change (`keepUnmatched`), only records whose concentration
 * moved to another key are dropped, so nothing ends without a message.
 *
 * @param {object} [options] Options.
 * @param {boolean} [options.keepUnmatched=false] Keep records with no marked token.
 * @returns {{added: number, dropped: number}} Changes made.
 */
export function reconcile({ keepUnmatched = false } = {}) {
  const marker = getConfig().statusmarker;
  const records = getRecords();
  const marked = findObjs({ _type: 'graphic' }).filter((t) => isToken(t) && hasMarker(t, marker));
  const seen = new Set();
  const moved = new Set();
  let added = 0;
  for (const token of marked) {
    const key = keyOf(token);
    seen.add(key);
    if (!records[key]) {
      // A changed HP Bar can move a token between character and token keys;
      // keep the spell it was stored with.
      const characterId = toText(token.get('represents'));
      const oldKey = records[token.id]
        ? token.id
        : characterId && records[characterId]
          ? characterId
          : '';
      setRecord(key, oldKey ? records[oldKey].spell : '', nameFor(key, token));
      if (oldKey) {
        moved.add(oldKey);
      } else {
        added += 1;
      }
    }
  }
  let dropped = 0;
  for (const key of Object.keys(records)) {
    if (!seen.has(key) && (!keepUnmatched || moved.has(key))) {
      delete records[key];
      dropped += 1;
    }
  }
  return { added, dropped };
}

/**
 * Lists who is concentrating, for the status card and the API.
 *
 * @returns {{key: string, name: string, spell: string, since: number}[]} Entries by name.
 */
export function listConcentrating() {
  return Object.entries(getRecords())
    .map(([key, record]) => ({ key, ...record, name: nameFor(key) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
