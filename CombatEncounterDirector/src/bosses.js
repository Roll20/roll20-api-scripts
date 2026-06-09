import { BOSS_PRESETS, VALID_BOSS_PRESETS } from './constants.js';
import { getConfig, setTokenRecord } from './state.js';
import { applyAcToToken, ensureTokenRecord, getSelectedTokens, writeTokenHp } from './tokens.js';
import { getTokenName, roundAtLeastOne } from './utils.js';

/**
 * Returns the boss preset configuration for a given key.
 *
 * @param {string} presetKey Preset key (e.g. 'boss', 'elite').
 * @returns {object|null} Preset config or null when not found.
 */
export function resolveBossPreset(presetKey) {
  return BOSS_PRESETS[presetKey] || null;
}

/**
 * Returns true when the given key is a valid boss preset identifier.
 *
 * @param {string} key Key to test.
 * @returns {boolean} True when valid.
 */
export function isValidBossPreset(key) {
  return VALID_BOSS_PRESETS.has(key);
}

/**
 * Applies a boss preset to a single token.
 *
 * - 'set' hpMode: overrides HP to a fixed value (e.g. Minion → 1 HP).
 *   Skipped when the token's HP bar was blank when first tracked.
 * - 'percent' hpMode: scales HP/maxHP from the original max HP.
 *   Skipped when original.maxHp is null (blank bar) or <= 0.
 * AC is adjusted by the preset's flat modifier.
 *   Skipped when original.ac is null (blank bar or acBar is 'none').
 *
 * @param {Graphic} token Roll20 Graphic object.
 * @param {object} preset Boss preset config.
 * @param {string} presetKey Boss preset key for record tagging.
 * @returns {object} Updated token record.
 */
export function applyBossPresetToToken(token, preset, presetKey) {
  const record = ensureTokenRecord(token);

  if (preset.hpMode === 'set') {
    // Minion: force HP to a fixed value — only when the HP bar was present.
    if (record.original.maxHp !== null) {
      writeTokenHp(token, preset.hp, preset.hp);
      record.hpModifier = preset.hp === 1 ? -999 : preset.hp; // flag for report display
    }
  } else {
    // percent mode: scale from original max HP.
    // Guard: blank bar (null) or zero/negative max means we cannot derive a value.
    if (record.original.maxHp !== null && record.original.maxHp > 0) {
      const newMax = roundAtLeastOne((record.original.maxHp * preset.hp) / 100);
      const hpRatio =
        record.original.hp !== null && record.original.hp > 0
          ? record.original.hp / record.original.maxHp
          : 1;
      const newHp = roundAtLeastOne(newMax * hpRatio);
      writeTokenHp(token, Math.min(newHp, newMax), newMax);
      record.hpModifier = preset.hp;
    }
  }

  // Apply AC modifier — skipped when original.ac is null (blank bar or 'none').
  if (record.original.ac !== null) {
    const newAc = record.original.ac + preset.ac;
    const { acBar } = getConfig();
    if (acBar !== 'none') {
      token.set(`${acBar}_value`, newAc);
    }
    record.acModifier = preset.ac;
  }

  record.damageModifier = preset.damage;
  record.preset = presetKey;
  record.lastModified = Date.now();
  record.lastOperation = `boss:${presetKey}`;

  setTokenRecord(token.id, record);
  return record;
}

/**
 * Applies a boss preset to all selected tokens.
 *
 * @param {object} msg Roll20 chat message.
 * @param {string} presetKey Boss preset key.
 * @returns {{ applied: string[], preset: object|null }} Result summary.
 */
export function applyBossPresetToSelected(msg, presetKey) {
  const preset = resolveBossPreset(presetKey);
  if (!preset) {
    return { applied: [], preset: null };
  }

  const tokens = getSelectedTokens(msg);
  const applied = [];
  for (const token of tokens) {
    applyBossPresetToToken(token, preset, presetKey);
    applied.push(getTokenName(token));
  }

  return { applied, preset };
}
