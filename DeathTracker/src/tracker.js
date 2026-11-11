// The heart of DeathTracker: judge a token from its hit points (and a PC's
// death saves), show the right marker, tint and effects, and run the on-death
// actions.

import { runDeathActions } from './actions.js';
import { broadcast, whisper } from './chat.js';
import { STATUS, STATUS_MARKER_SETTING } from './constants.js';
import { applyTint, clearTint, playFx } from './fx.js';
import { readHp } from './hp.js';
import { t } from './i18n.js';
import { applyMarkers } from './markers.js';
import { owns } from './owners.js';
import {
  capSaves,
  clearDeathSaves,
  getCharacter,
  readDeathSaves,
  sheetRole,
  tokenControllers,
} from './sheet.js';
import { getLang, getRecord, getRole, getSettings } from './state.js';
import { countSaves, decideStatus, isMassiveDamage } from './status.js';
import { escapeHtml, toText } from './utils.js';

const statusListeners = [];

// A character's tokens on other pages change with it, so the same news can
// come from several tokens at once: tell it once per character.
const ANNOUNCE_REPEAT_MS = 5000;
const lastAnnounced = new Map();

/**
 * Registers a function called whenever a token's status changes.
 *
 * @param {Function} fn Called with {token, status, previous, isPc}.
 * @returns {void}
 */
export function onStatusChange(fn) {
  if (typeof fn === 'function') {
    statusListeners.push(fn);
  }
}

/**
 * Says whether a token is a player character: the GM's choice for its
 * character (or the token) first, then whether a player controls it, then
 * (when PC detection is "auto") what its sheet says.
 *
 * @param {object} token Roll20 graphic.
 * @param {object|null} [character] Its character.
 * @returns {boolean} True for a PC.
 */
export function isPc(token, character = getCharacter(token)) {
  const role = getRole(character ? character.id : token.id);
  if (role) {
    return role === 'pc';
  }
  if (tokenControllers(token).length) {
    return true;
  }
  if (character && getSettings().pcDetection === 'auto') {
    return sheetRole(character.id) === 'pc';
  }
  return false;
}

/**
 * Returns the marker tag for a status ('' for none).
 *
 * @param {string|null} status Status.
 * @param {object} settings Settings.
 * @returns {string} Marker tag.
 */
export function markerFor(status, settings) {
  const key = STATUS_MARKER_SETTING[status];
  return key ? toText(settings[key]) : '';
}

/**
 * Judges a token and brings its markers, tint and actions up to date.
 *
 * @param {object} token Roll20 graphic.
 * @param {object} [options] Options.
 * @param {number|null} [options.prevHp] Hit points before this change (from a change event).
 * @param {boolean} [options.event=false] True when hit points changed just now (plays effects).
 * @param {string|null} [options.force] Status to set by hand (only 'stable' is used).
 * @returns {{status: string|null, previous: string|null, changed: boolean, isPc: boolean, saves: object|null}} Outcome.
 */
export function judge(token, { prevHp = null, event = false, force = null } = {}) {
  const settings = getSettings();
  const { value: hp, max } = readHp(token, settings.hpBar);
  const record = getRecord(token.id, true);
  const previous = record.status;
  if (hp === null) {
    return { status: previous, previous, changed: false, isPc: false, saves: record.saves };
  }
  const character = getCharacter(token);
  const pc = isPc(token, character);
  // HealthColors may be the one handling death saves, colours or effects.
  const ownSaves = owns('deathSaves');
  const deathSaves = settings.deathSaves && ownSaves;
  const before = record.hp ?? prevHp;
  const wasDown = [STATUS.DYING, STATUS.STABLE, STATUS.DEAD].includes(previous);
  const dropped = hp <= 0 && (before === null ? false : before > 0) && !wasDown;
  const healed = hp > 0 && (wasDown || (before !== null && before <= 0));

  if (healed) {
    record.base = null;
    record.saves = null;
    if (pc && character && ownSaves && settings.resetSheetSaves) {
      clearDeathSaves(character.id, settings, false);
    }
  }

  let massive = false;
  if (pc && hp <= 0) {
    if (dropped) {
      massive = settings.massiveDamage && isMassiveDamage(hp, max);
      record.saves = null;
      record.base = { s: 0, f: 0 };
      if (character && deathSaves) {
        if (settings.resetSheetSaves) {
          clearDeathSaves(character.id, settings, true);
          record.base = { s: 0, f: 0 };
        } else {
          const now = readDeathSaves(character.id, settings);
          record.base = now ? { s: now.s, f: now.f } : { s: 0, f: 0 };
        }
      }
    }
    if (character && deathSaves) {
      const sheet = readDeathSaves(character.id, settings);
      if (sheet) {
        const counted = countSaves(sheet, record.base);
        record.base = counted.base;
        record.saves = counted.saves;
      }
    }
  }

  let status = decideStatus({
    hp,
    max,
    isPc: pc,
    previous,
    saves: record.saves ? capSaves(record.saves) : null,
    deathSaves,
    bloodiedPercent: settings.bloodiedPercent,
    massive,
  });
  if (force === STATUS.STABLE && pc && hp <= 0 && status !== STATUS.DEAD) {
    status = STATUS.STABLE;
  }

  // The dying, stable and dead markers go with death saves.
  const down = [STATUS.DYING, STATUS.STABLE, STATUS.DEAD].includes(status);
  const marker = down && !ownSaves ? '' : markerFor(status, settings);
  record.markers = applyMarkers(token, record.markers, [marker]);
  if (owns('colours') && (pc ? settings.tintPlayers : settings.tintNpcs)) {
    applyTint(token, record, hp, max);
  } else {
    clearTint(token, record);
  }
  if (event && prevHp !== null && hp !== prevHp && owns('effects')) {
    if (hp < prevHp && settings.hurtFx) {
      playFx(token, settings.hurtFxType);
    } else if (hp > prevHp && settings.healFx) {
      playFx(token, settings.healFxType);
    }
  }

  record.hp = hp;
  record.status = status;
  const changed = status !== previous;
  if (changed) {
    if (status === STATUS.DEAD && (!pc || settings.deathActionsFor === 'all')) {
      const done = runDeathActions(token, settings);
      if (done) {
        record.actions = { ...done, ...(record.actions || {}) };
      }
    }
    announce(token, status, previous, pc, record.saves, event);
    for (const fn of statusListeners) {
      try {
        fn({ token, status, previous, isPc: pc });
      } catch (e) {
        log(`DeathTracker: a status listener failed: ${e?.message || e}`);
      }
    }
  }
  return { status, previous, changed, isPc: pc, saves: record.saves };
}

/**
 * Tells the GM (and the PC's players, when set) that a PC went down, became
 * stable, died or got back up.
 *
 * @param {object} token Roll20 graphic.
 * @param {string} status New status.
 * @param {string|null} previous Old status.
 * @param {boolean} pc True for a PC.
 * @param {{s: number, f: number}|null} saves Death saves counted.
 * @param {boolean} event True when hit points changed just now.
 * @returns {void}
 */
function announce(token, status, previous, pc, saves, event) {
  const settings = getSettings();
  // A token first seen by `check` is not news; one just hit is. When
  // HealthColors (or nobody) handles death saves, it is not DeathTracker's news.
  if (!pc || settings.announce === 'off' || (previous === null && !event) || !owns('deathSaves')) {
    return;
  }
  const down = [STATUS.DYING, STATUS.STABLE, STATUS.DEAD];
  let key = null;
  if (down.includes(status)) {
    key = status;
  } else if (down.includes(previous)) {
    key = 'up';
  }
  if (!key) {
    return;
  }
  const who = toText(token.get('represents')) || token.id;
  const now = Date.now();
  const last = lastAnnounced.get(who);
  if (last && last.key === key && now - last.at < ANNOUNCE_REPEAT_MS) {
    return;
  }
  lastAnnounced.set(who, { key, at: now });
  const lang = getLang();
  const name = escapeHtml(toText(token.get('name')) || t('status.unnamed', lang));
  let body = escapeHtml(t(`announce.${key}`, lang, { name: '\u0000' })).replace(
    '\u0000',
    `<strong>${name}</strong>`
  );
  if (key === 'dying' && settings.deathSaves) {
    body += `<div style="font-size:0.9em">${escapeHtml(t('announce.savesHint', lang))}</div>`;
  }
  if (key === 'stable' && saves) {
    body += `<div style="font-size:0.9em">${escapeHtml(t('status.saves', lang, { s: saves.s, f: saves.f }))}</div>`;
  }
  const title = t('titles.announce', lang);
  const controllers = settings.announce === 'controllers' ? tokenControllers(token) : [];
  if (controllers.includes('all')) {
    broadcast(title, body);
    return;
  }
  whisper(null, title, body);
  for (const id of controllers) {
    whisper(id, title, body);
  }
}
