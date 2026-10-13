import { ATTACKER_ANY, CONDITION_ADVANTAGE } from './constants.js';

/**
 * One-click effect presets. Each preset pre-fills wizard arguments so the GM
 * only picks the tokens involved. `reasonKey` is the translation key for the
 * reason label shown in the Turn Tracker row.
 */
const PRESETS = Object.freeze({
  help: Object.freeze({
    id: 'help',
    labelKey: 'ui.preset.help.label',
    reasonKey: 'ui.preset.help.reason',
    condition: CONDITION_ADVANTAGE,
    args: Object.freeze({
      attacker: ATTACKER_ANY,
      once: 'true',
      duration: 'Start of source next turn',
    }),
  }),
});

/**
 * Returns a preset by id.
 *
 * @param {string} id Preset id (case-insensitive).
 * @returns {object|null} Preset definition or null.
 */
export function getPreset(id) {
  return PRESETS[String(id || '').toLowerCase()] || null;
}

/**
 * Returns the presets usable with a game-system profile.
 *
 * @param {object} profile Active system profile.
 * @returns {object[]} Preset definitions whose effect type the system supports.
 */
export function getPresetsForProfile(profile) {
  const types = profile?.CUSTOM_EFFECT_TYPES || [];
  return Object.values(PRESETS).filter((preset) => types.includes(preset.condition));
}
