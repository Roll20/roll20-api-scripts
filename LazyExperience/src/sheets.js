// Reading and writing XP and levels on character sheets. Beacon sheets (D&D 2024)
// are read with getSheetItem and written with setSheetItem; other sheets use legacy
// attributes. Every function returns a promise.

import { canUseBeacon, parseStrictInt, parseXpText, toText } from './utils.js';
import { profileForCharacter } from './systems.js';
import { getConfig } from './state.js';

// One read-modify-write at a time per character, so two awards cannot overwrite
// each other.
const queues = new Map();

/**
 * Runs a task after any earlier task for the same character.
 *
 * @param {string} characterId Character ID.
 * @param {Function} task Async task.
 * @returns {Promise<*>} The task's result.
 */
function serialise(characterId, task) {
  const previous = queues.get(characterId) || Promise.resolve();
  const next = previous.then(task, task);
  queues.set(
    characterId,
    next.catch(() => {})
  );
  return next;
}

/**
 * Returns the profile for a character with the current settings.
 *
 * @param {object} character Roll20 character.
 * @returns {object} Profile.
 */
export function getProfile(character) {
  return profileForCharacter(character, getConfig(), canUseBeacon());
}

/**
 * Finds a legacy attribute by name (case-insensitive).
 *
 * @param {string} characterId Character ID.
 * @param {string} name Attribute name.
 * @returns {object|undefined} Attribute.
 */
function findAttribute(characterId, name) {
  const lower = name.toLowerCase();
  return findObjs(
    { _type: 'attribute', _characterid: characterId },
    { caseInsensitive: true }
  ).find((a) => toText(a.get('name')).toLowerCase() === lower);
}

/**
 * Reads the first field in a list that has a value.
 *
 * @param {object} character Roll20 character.
 * @param {string[]} names Field names, in order.
 * @param {string} access 'beacon' or 'legacy'.
 * @returns {Promise<{name: string, value: *}|null>} Field and value, or null.
 */
export async function readField(character, names, access) {
  const id = character.id;
  for (const name of names || []) {
    if (access === 'beacon') {
      if (!canUseBeacon()) {
        return null;
      }
      try {
        const value = await getSheetItem(id, name);
        if (value !== undefined && value !== null && toText(value) !== '') {
          return { name, value };
        }
      } catch {
        // Unknown field: try the next name.
      }
    } else {
      const attr = findAttribute(id, name);
      if (attr && toText(attr.get('current')) !== '') {
        return { name, value: attr.get('current') };
      }
      // Roll20 keeps a sheet input named attr_<name>_max as the max of <name>.
      const base = !attr && /_max$/i.test(name) ? findAttribute(id, name.slice(0, -4)) : null;
      if (base && toText(base.get('max')) !== '') {
        return { name, value: base.get('max') };
      }
    }
  }
  return null;
}

/**
 * Reads a character's XP and level.
 *
 * @param {object} character Roll20 character.
 * @returns {Promise<{xp: number|null, level: number|null, field: string|null, profile: object}>} Values.
 */
export async function readProgress(character) {
  const profile = getProfile(character);
  const xpField = await readField(character, profile.pc?.xp, profile.access);
  const levelField = await readField(character, profile.pc?.level, profile.access);
  const nextField = await readField(character, profile.pc?.next, profile.access);
  const level = levelField ? parseStrictInt(String(levelField.value).replace(/\D.*$/, '')) : null;
  let next = nextField ? parseXpText(nextField.value) : null;
  if (next === null && typeof profile.nextXp === 'function' && Number.isFinite(level)) {
    next = profile.nextXp(level);
  }
  return {
    xp: xpField ? parseXpText(xpField.value) : null,
    level,
    next: next > 0 ? next : null,
    field: xpField?.name || null,
    profile,
  };
}

/**
 * Writes a value to a character's XP field.
 *
 * @param {object} character Roll20 character.
 * @param {object} profile Profile.
 * @param {string|null} field Field read before, if any.
 * @param {number} value New XP.
 * @returns {Promise<{ok: boolean, reason?: string}>} Result.
 */
async function writeXp(character, profile, field, value, amount) {
  if (profile.write?.kind === 'repeatingRow') {
    addLedgerRow(character, profile.write, amount);
    return { ok: true };
  }
  const name = field || profile.pc?.xp?.[0];
  if (!name) {
    return { ok: false, reason: 'noField' };
  }
  if (profile.access === 'beacon') {
    if (!canUseBeacon()) {
      return { ok: false, reason: 'sandbox' };
    }
    // Beacon sheets ignore a write of 0 (seen on the D&D 2024 sheet, sandbox 1.5).
    if (value <= 0) {
      return { ok: false, reason: 'zero' };
    }
    await setSheetItem(character.id, name, value);
    return { ok: true };
  }
  setLegacy(character, findAttribute(character.id, name), name, value);
  // Karma-style sheets keep a running total next to the spendable amount.
  for (const total of profile.alsoAdd || []) {
    const totalAttr = findAttribute(character.id, total);
    const current = parseXpText(totalAttr?.get('current')) ?? 0;
    setLegacy(character, totalAttr, total, Math.max(0, current + amount));
  }
  return { ok: true };
}

/**
 * Writes the XP for the next level into the sheet's next-level box, for profiles whose
 * track comes from the pf1Track setting (Pathfinder 1E). The box is the max of the XP
 * attribute, so the sheet shows the same goal the level-up notices use.
 *
 * @param {object} character Roll20 character.
 * @param {object} profile Profile.
 * @param {number|null} level Level on the sheet.
 * @returns {void}
 */
function writeNextBox(character, profile, level) {
  if (!profile.trackPlan || !/_max$/i.test(profile.nextBox || '')) return;
  const next = profile.nextXp(level);
  if (!Number.isFinite(next)) return;
  const name = profile.nextBox.slice(0, -4);
  const attr = findAttribute(character.id, name);
  if (!attr || parseXpText(attr.get('max')) === next) return;
  const text = String(next);
  if (typeof attr.setWithWorker === 'function') {
    attr.setWithWorker({ max: text });
  } else {
    attr.set('max', text);
  }
}

/**
 * Sets a legacy attribute through the sheet workers, creating it when missing.
 *
 * @param {object} character Roll20 character.
 * @param {object|undefined} attr Existing attribute.
 * @param {string} name Attribute name.
 * @param {*} value New value.
 * @returns {void}
 */
function setLegacy(character, attr, name, value) {
  if (!attr) {
    const created = createObj('attribute', { characterid: character.id, name, current: '' });
    attr = created;
  }
  // Sheets hold what players type, which is text; some sheet workers fail on numbers
  // (the D&D 5E 2014 sheet's sanitizeXP calls trim()). setWithWorker lets the sheet's
  // own workers update level and totals.
  const text = String(value);
  if (typeof attr.setWithWorker === 'function') {
    attr.setWithWorker({ current: text });
  } else {
    attr.set('current', text);
  }
}

/**
 * Makes a Roll20 repeating-row ID (a time-based, sortable 20-character ID).
 *
 * @returns {string} Row ID.
 */
export function makeRowId() {
  const chars = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';
  let time = Date.now();
  let id = '';
  for (let i = 0; i < 8; i++) {
    id = chars.charAt(time % 64) + id;
    time = Math.floor(time / 64);
  }
  for (let i = 0; i < 12; i++) {
    id += chars.charAt(Math.floor(Math.random() * 64));
  }
  return id;
}

/**
 * Adds an XP ledger row (sheets such as WFRP 4E add their rows up themselves).
 *
 * @param {object} character Roll20 character.
 * @param {{section: string, amount: string, note: string}} write Row layout.
 * @param {number} amount XP.
 * @returns {void}
 */
function addLedgerRow(character, write, amount) {
  const prefix = `repeating_${write.section}_${makeRowId()}_`;
  setLegacy(character, undefined, `${prefix}${write.note}`, 'LazyExperience');
  setLegacy(character, undefined, `${prefix}${write.amount}`, amount);
}

/**
 * Adds (or with a negative amount, takes away) XP on a character's sheet.
 *
 * @param {object} character Roll20 character.
 * @param {number} amount XP to add.
 * @returns {Promise<{ok: boolean, reason?: string, before?: number, after?: number, level?: number|null, profile?: object}>} Result.
 */
export function addXp(character, amount) {
  return serialise(character.id, async () => {
    const progress = await readProgress(character);
    if (progress.profile.access === 'beacon' && !canUseBeacon()) {
      return { ok: false, reason: 'sandbox', profile: progress.profile };
    }
    if (progress.profile.xpless) {
      return { ok: false, reason: 'xpless', profile: progress.profile };
    }
    const before = progress.xp ?? 0;
    const after = Math.max(0, before + amount);
    if (after === before) {
      return {
        ok: true,
        before,
        after,
        level: progress.level,
        next: progress.next,
        profile: progress.profile,
      };
    }
    const result = await writeXp(
      character,
      progress.profile,
      progress.field,
      after,
      after - before
    );
    if (result.ok) writeNextBox(character, progress.profile, progress.level);
    return {
      ...result,
      before,
      after,
      level: progress.level,
      next: progress.next,
      profile: progress.profile,
    };
  });
}

/**
 * Reads the XP a defeated creature is worth.
 *
 * @param {object} character The creature's character.
 * @param {number|null} partyLevel Average party level, for systems that need it.
 * @returns {Promise<number|null>} XP, or null when the sheet has none.
 */
export async function readCreatureXp(character, partyLevel) {
  const profile = getProfile(character);
  if (typeof profile.creatureXp === 'function') {
    const level = await readField(character, profile.npc?.level, profile.access);
    return profile.creatureXp(level?.value, partyLevel);
  }
  const xp = await readField(character, profile.npc?.xp, profile.access);
  const parsed = xp ? parseXpText(xp.value) : null;
  if (parsed !== null && parsed > 0) {
    return parsed;
  }
  if (typeof profile.crXp === 'function') {
    const cr = await readField(character, profile.npc?.cr, profile.access);
    return cr ? profile.crXp(cr.value) : null;
  }
  return null;
}
