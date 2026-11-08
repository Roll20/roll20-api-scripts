// The rules that turn hit points and death saves into a status. Nothing here
// touches Roll20, so it is easy to test.

import { DEATH_SAVES_NEEDED, STATUS } from './constants.js';

/**
 * @typedef {object} Judgement
 * @property {number|null} hp Current hit points.
 * @property {number|null} max Maximum hit points.
 * @property {boolean} isPc True for player characters.
 * @property {string|null} previous Status before this change.
 * @property {{s: number, f: number}|null} saves Death saves counted since the drop to 0.
 * @property {boolean} deathSaves True when PCs at 0 make death saves.
 * @property {number} bloodiedPercent Bloodied at or below this share of maximum.
 * @property {boolean} massive True when the hit that dropped the PC to 0 was massive damage.
 */

/**
 * Decides a token's status.
 *
 * @param {Judgement} j What is known.
 * @returns {string|null} Status, or null when the hit points cannot be read (leave the token alone).
 */
export function decideStatus(j) {
  if (j.hp === null || j.hp === undefined) {
    return null;
  }
  if (j.hp > 0) {
    if (j.max && j.bloodiedPercent > 0 && j.hp <= (j.max * j.bloodiedPercent) / 100) {
      return STATUS.BLOODIED;
    }
    return STATUS.HEALTHY;
  }
  if (!j.isPc) {
    return STATUS.DEAD;
  }
  // A dead PC stays dead at 0 until healed.
  if (j.previous === STATUS.DEAD || j.massive) {
    return STATUS.DEAD;
  }
  if (!j.deathSaves) {
    return STATUS.DYING;
  }
  const saves = j.saves || { s: 0, f: 0 };
  if (saves.f >= DEATH_SAVES_NEEDED) {
    return STATUS.DEAD;
  }
  if (saves.s >= DEATH_SAVES_NEEDED) {
    return STATUS.STABLE;
  }
  // Stabilised by hand (the stable command, a Medicine check) stays stable
  // until the PC fails a save again.
  if (j.previous === STATUS.STABLE && saves.f === 0) {
    return STATUS.STABLE;
  }
  return STATUS.DYING;
}

/**
 * Counts the death saves made since the drop to 0. The sheet keeps old ticks
 * (the 2024 sheet never clears them on healing), so they are counted from the
 * values seen at the drop. When the sheet's count goes down (someone cleared
 * the boxes), the starting point goes down with it.
 *
 * @param {{s: number, f: number}} sheet Counts on the sheet now.
 * @param {{s: number, f: number}|null} base Counts at the drop to 0.
 * @returns {{base: {s: number, f: number}, saves: {s: number, f: number}}} New starting point and counted saves.
 */
export function countSaves(sheet, base) {
  const b = base || { s: 0, f: 0 };
  const nextBase = { s: Math.min(b.s, sheet.s), f: Math.min(b.f, sheet.f) };
  return {
    base: nextBase,
    saves: {
      s: Math.min(DEATH_SAVES_NEEDED, sheet.s - nextBase.s),
      f: Math.min(DEATH_SAVES_NEEDED, sheet.f - nextBase.f),
    },
  };
}

/**
 * Applies the massive damage rule: damage left over after dropping to 0 that
 * is at least the maximum kills outright. DeathTracker only sees the leftover
 * when the bar goes below 0.
 *
 * @param {number|null} hp Hit points now.
 * @param {number|null} max Maximum.
 * @returns {boolean} True when the PC dies outright.
 */
export function isMassiveDamage(hp, max) {
  return hp !== null && max !== null && max > 0 && hp < 0 && -hp >= max;
}

/**
 * Picks the tint colour for a share of hit points: green when full, red at 0.
 *
 * @param {number} hp Hit points.
 * @param {number} max Maximum.
 * @returns {number} Hue (0 red to 120 green).
 */
export function tintHue(hp, max) {
  const share = Math.max(0, Math.min(1, hp / max));
  return share * 120;
}
