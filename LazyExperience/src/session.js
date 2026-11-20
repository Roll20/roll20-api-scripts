// The session: the XP pool, bonuses, awards, paying out and ending a session.

import { announce, buildNote, whisper, whisperWarning } from './chat.js';
import { MAX_AWARDS_PER_SESSION, MAX_REASON_LENGTH, MAX_XP, SCRIPT_NAME } from './constants.js';
import { t } from './i18n.js';
import { checkLevelUp } from './levels.js';
import { controllingPlayers, getRoster, splitXp } from './roster.js';
import { addXp } from './sheets.js';
import { getCharacterRecord, getConfig, getSession, getState, newSession } from './state.js';
import { escapeForChat, formatNumber, makeId, toText } from './utils.js';

const awardObservers = [];
const sessionEndListeners = [];

/**
 * Registers a function called with each award ({kind, xp, reason, targets}).
 *
 * @param {Function} fn Observer.
 * @returns {void}
 */
export function onAward(fn) {
  if (typeof fn === 'function') {
    awardObservers.push(fn);
  }
}

/**
 * Registers a function called with the summary when a session ends (used by the log).
 *
 * @param {Function} fn Listener.
 * @returns {void}
 */
export function onSessionEnd(fn) {
  sessionEndListeners.push(fn);
}

/**
 * Calls each function with an event, logging instead of stopping on errors.
 *
 * @param {Function[]} list Functions.
 * @param {*} event Event.
 * @returns {void}
 */
function emit(list, event) {
  for (const fn of list) {
    try {
      fn(event);
    } catch (err) {
      log(`${SCRIPT_NAME}: an observer failed: ${err?.message || err}`);
    }
  }
}

/**
 * Checks an XP amount. Negative amounts are allowed only for corrections.
 *
 * @param {*} xp Amount.
 * @param {boolean} [allowNegative=false] Accept amounts below 0.
 * @returns {number|null} Whole XP, or null when invalid.
 */
export function validXp(xp, allowNegative = false) {
  const n = Number(xp);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n === 0 || Math.abs(n) > MAX_XP) {
    return null;
  }
  return n < 0 && !allowNegative ? null : n;
}

/**
 * Trims a reason to a sensible length.
 *
 * @param {*} reason Reason text.
 * @returns {string} Reason.
 */
function cleanReason(reason) {
  return toText(reason).slice(0, MAX_REASON_LENGTH);
}

/**
 * Records an award in the session.
 *
 * @param {object} award Award.
 * @returns {object} The award.
 */
function record(award) {
  const session = getSession();
  session.awards.push(award);
  if (session.awards.length > MAX_AWARDS_PER_SESSION) {
    session.awards.splice(0, session.awards.length - MAX_AWARDS_PER_SESSION);
  }
  emit(awardObservers, { ...award });
  return award;
}

/**
 * Pays XP to characters now: writes the sheets (when that setting is on), adds to the
 * session's paid totals and checks for level-ups.
 *
 * @param {{id: string, xp: number}[]} rows Who gets what.
 * @returns {Promise<{id: string, name: string, xp: number, ok: boolean, reason?: string, after?: number}[]>} Results.
 */
export async function pay(rows) {
  const config = getConfig();
  const session = getSession();
  const results = [];
  for (const row of rows) {
    const character = getObj('character', row.id);
    if (!character || !row.xp) {
      continue;
    }
    session.paid[row.id] = (session.paid[row.id] || 0) + row.xp;
    if (!config.updateSheets) {
      results.push({ id: row.id, name: character.get('name'), xp: row.xp, ok: true, sheet: false });
      continue;
    }
    try {
      const result = await addXp(character, row.xp);
      if (result.ok) {
        checkLevelUp(character, result);
      } else if (result.reason === 'xpless') {
        // A system without XP (Savage Worlds, 13th Age…): nothing was given, so the
        // summary must not say otherwise.
        session.paid[row.id] -= row.xp;
        if (session.paid[row.id] === 0) delete session.paid[row.id];
      }
      results.push({ id: row.id, name: character.get('name'), xp: row.xp, ...result, sheet: true });
    } catch (err) {
      log(`${SCRIPT_NAME}: could not update ${character.get('name')}: ${err?.message || err}`);
      results.push({
        id: row.id,
        name: character.get('name'),
        xp: row.xp,
        ok: false,
        reason: 'error',
      });
    }
  }
  reportProblems(results);
  return results;
}

/**
 * Tells the GM about sheets that could not be updated.
 *
 * @param {object[]} results Pay results.
 * @returns {void}
 */
function reportProblems(results) {
  const lang = getConfig().language;
  for (const r of results.filter((x) => !x.ok)) {
    whisperWarning(
      null,
      t(`warnings.write.${r.reason || 'error'}`, lang, { name: r.name, xp: formatNumber(r.xp) })
    );
  }
}

/**
 * Adds XP to the session pool, or pays it straight away in instant mode.
 *
 * @param {number} xp XP.
 * @param {string} [reason] Why.
 * @param {object} [meta] Extra details (source, tokenId).
 * @returns {Promise<object|null>} The award, or null when refused.
 */
export async function addToPool(xp, reason = '', meta = {}) {
  const amount = validXp(xp, true);
  if (amount === null) {
    return null;
  }
  const config = getConfig();
  const session = getSession();
  const award = record({
    id: makeId(),
    kind: 'pool',
    xp: amount,
    reason: cleanReason(reason),
    at: Date.now(),
    source: meta.source || 'manual',
    tokenId: meta.tokenId || null,
    paid: false,
  });
  if (config.payout === 'instant') {
    const split = splitXp(amount + session.carried);
    session.carried = split.remainder;
    award.paid = true;
    award.split = split.rows.map((r) => ({ id: r.id, xp: r.xp }));
    const results = await pay(split.rows);
    if (split.rows.length === 0 || split.perShare <= 0) {
      whisperWarning(
        null,
        t('warnings.nobodyToPay', config.language, { xp: formatNumber(split.remainder) })
      );
    } else {
      announceInstant(award, split, results);
    }
  } else {
    session.pool = Math.max(0, session.pool + amount);
  }
  return award;
}

/**
 * Gives bonus XP to some characters on top of their share.
 *
 * @param {string[]} characterIds Characters.
 * @param {number} xp XP each (negative to correct a mistake).
 * @param {string} [reason] Why.
 * @returns {Promise<object|null>} The award, or null when refused.
 */
export async function addBonus(characterIds, xp, reason = '') {
  const amount = validXp(xp, true);
  if (amount === null || characterIds.length === 0) {
    return null;
  }
  const config = getConfig();
  const session = getSession();
  const award = record({
    id: makeId(),
    kind: 'bonus',
    xp: amount,
    reason: cleanReason(reason),
    targets: [...characterIds],
    at: Date.now(),
    paid: false,
  });
  if (config.payout === 'instant') {
    award.paid = true;
    const results = await pay(characterIds.map((id) => ({ id, xp: amount })));
    announceBonus(award, results);
  } else {
    for (const id of characterIds) {
      session.bonuses[id] = (session.bonuses[id] || 0) + amount;
    }
  }
  return award;
}

/**
 * Takes back the last award that has not been paid yet.
 *
 * @returns {object|null} The award taken back, or null.
 */
export function undoLast() {
  const session = getSession();
  let index = -1;
  for (let i = session.awards.length - 1; i >= 0 && index < 0; i--) {
    if (!session.awards[i].paid && !session.awards[i].undone) index = i;
  }
  if (index < 0) {
    return null;
  }
  const award = session.awards[index];
  award.undone = true;
  if (award.kind === 'pool') {
    session.pool = Math.max(0, session.pool - award.xp);
    if (award.tokenId && session.kills[award.tokenId]) {
      session.kills[award.tokenId].status = 'ignored';
    }
  } else if (award.kind === 'bonus') {
    for (const id of award.targets) {
      session.bonuses[id] = (session.bonuses[id] || 0) - award.xp;
      if (session.bonuses[id] === 0) delete session.bonuses[id];
    }
  }
  return award;
}

/**
 * Works out what each character would get if the session ended now.
 *
 * @returns {{split: object, rows: {id: string, name: string, share: number, xp: number, bonus: number, total: number}[]}} Preview.
 */
export function previewPayout() {
  const session = getSession();
  const roster = getRoster();
  const split = splitXp(session.pool + session.carried, roster);
  const ids = new Set(split.rows.map((r) => r.id));
  const rows = split.rows.map((r) => ({
    ...r,
    bonus: session.bonuses[r.id] || 0,
    total: r.xp + (session.bonuses[r.id] || 0),
  }));
  // Bonus XP for a character no longer on the roster is still paid.
  for (const [id, bonus] of Object.entries(session.bonuses)) {
    const character = getObj('character', id);
    if (!ids.has(id) && character && bonus) {
      rows.push({ id, name: character.get('name'), share: 0, xp: 0, bonus, total: bonus });
    }
  }
  return { split, rows };
}

/**
 * Ends the session: pays the pool and bonuses (unless already paid instantly),
 * announces the results, logs the session and starts the next one.
 *
 * @returns {Promise<object>} Summary of the session.
 */
export async function endSession() {
  const config = getConfig();
  const lang = config.language;
  const session = getSession();
  const s = getState();
  let rows = [];
  let results = [];
  let split = null;
  if (config.payout === 'end') {
    const preview = previewPayout();
    split = preview.split;
    rows = preview.rows;
    results = await pay(rows.map((r) => ({ id: r.id, xp: r.total })));
  }
  const totals = Object.entries(session.paid)
    .map(([id, xp]) => ({ id, name: getObj('character', id)?.get('name') || id, xp }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const summary = {
    number: session.number,
    started: session.started,
    ended: Date.now(),
    payout: config.payout,
    pool: session.pool,
    awards: session.awards.filter((a) => !a.undone),
    kills: Object.values(session.kills).filter((k) => k.status === 'added'),
    totals,
    levelUps: [...session.levelUps],
    remainder: split ? split.remainder : session.carried,
    results,
  };

  announceEnd(summary);
  for (const row of totals) {
    const character = getObj('character', row.id);
    const result = results.find((r) => r.id === row.id);
    if (character) {
      const owners = controllingPlayers(character);
      const after = result?.after !== undefined ? formatNumber(result.after) : null;
      const text = after
        ? t('end.playerLineTotal', lang, {
            name: escapeForChat(row.name),
            xp: formatNumber(row.xp),
            total: after,
          })
        : t('end.playerLine', lang, { name: escapeForChat(row.name), xp: formatNumber(row.xp) });
      for (const id of owners) {
        whisper(id, t('titles.yourXp', lang), `<div>${text}</div>`);
      }
    }
  }

  emit(sessionEndListeners, summary);
  // Absence is for one session only.
  for (const rec of Object.values(s.characters)) {
    rec.absent = false;
  }
  const next = newSession(session.number + 1);
  next.carried = summary.remainder;
  s.session = next;
  return summary;
}

/**
 * Starts a new session without paying anything (the pool and bonuses are dropped).
 *
 * @returns {void}
 */
export function resetSession() {
  const s = getState();
  s.session = newSession(s.session.number);
}

/**
 * Announces an instant award.
 *
 * @param {object} award Award.
 * @param {object} split Split.
 * @param {object[]} results Pay results.
 * @returns {void}
 */
function announceInstant(award, split, results) {
  const lang = getConfig().language;
  const lines = [
    `<div>${t('instant.everyone', lang, { xp: `<strong>${formatNumber(split.perShare)}</strong>` })}</div>`,
  ];
  if (award.reason) {
    lines.push(buildNote(escapeForChat(award.reason)));
  }
  const owners = results.flatMap((r) => {
    const c = getObj('character', r.id);
    return c ? controllingPlayers(c) : [];
  });
  announce(getConfig().announce, owners, t('titles.xpAwarded', lang), lines);
}

/**
 * Announces an instant bonus.
 *
 * @param {object} award Award.
 * @param {object[]} results Pay results.
 * @returns {void}
 */
function announceBonus(award, results) {
  const lang = getConfig().language;
  const names = results.map((r) => escapeForChat(r.name)).join(', ');
  const lines = [
    `<div>${t('instant.bonus', lang, { names: `<strong>${names}</strong>`, xp: formatNumber(award.xp) })}</div>`,
  ];
  if (award.reason) {
    lines.push(buildNote(escapeForChat(award.reason)));
  }
  const owners = award.targets.flatMap((id) => {
    const c = getObj('character', id);
    return c ? controllingPlayers(c) : [];
  });
  announce(getConfig().announce, owners, t('titles.xpAwarded', lang), lines);
}

/**
 * Announces the end of a session.
 *
 * @param {object} summary Session summary.
 * @returns {void}
 */
function announceEnd(summary) {
  const lang = getConfig().language;
  const lines = [];
  if (summary.totals.length === 0) {
    lines.push(`<div>${escapeForChat(t('end.nothing', lang))}</div>`);
  }
  for (const row of summary.totals) {
    lines.push(
      `<div>${escapeForChat(row.name)}: <strong>${formatNumber(row.xp)}</strong> XP</div>`
    );
  }
  const owners = summary.totals.flatMap((r) => {
    const c = getObj('character', r.id);
    return c ? controllingPlayers(c) : [];
  });
  announce(
    getConfig().announce,
    owners,
    t('titles.sessionEnded', lang, { number: summary.number }),
    lines
  );
  if (summary.remainder > 0) {
    whisper(
      null,
      t('titles.sessionEnded', lang, { number: summary.number }),
      buildNote(escapeForChat(t('end.remainder', lang, { xp: formatNumber(summary.remainder) })))
    );
  }
}

/**
 * Returns a character's paid total this session.
 *
 * @param {string} characterId Character ID.
 * @returns {number} XP.
 */
export function paidThisSession(characterId) {
  return getSession().paid[characterId] || 0;
}

/**
 * Marks characters absent or present for this session.
 *
 * @param {string[]} characterIds Characters.
 * @param {boolean} absent Absent?
 * @returns {void}
 */
export function setAbsent(characterIds, absent) {
  for (const id of characterIds) {
    getCharacterRecord(id).absent = absent;
  }
}
