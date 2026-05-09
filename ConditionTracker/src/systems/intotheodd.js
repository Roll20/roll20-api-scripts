/** @type {import('./index.js').GameSystemProfile} */
export const intoTheOddProfile = Object.freeze({
  SYSTEM_ID: 'intotheodd',
  SYSTEM_NAME: 'Into the Odd',

  STANDARD_CONDITIONS: Object.freeze(
    ['Blinded', 'Deprived', 'Stunned', 'Unconscious'].sort((a, b) => a.localeCompare(b))
  ),

  CONDITION_DATA: Object.freeze({
    Blinded: { past: 'blinded', verb: 'blinds', icon: '[B]', emoji: '🙈' },
    Deprived: { past: 'deprived', verb: 'deprives', icon: '[Dep]', emoji: '🌑' },
    Stunned: { past: 'stunned', verb: 'stuns', icon: '[Stn]', emoji: '😵' },
    Unconscious: {
      past: 'unconscious',
      verb: 'knocks',
      suffix: 'unconscious',
      icon: '[U]',
      emoji: '💤',
    },
  }),

  DEFAULT_MARKERS: Object.freeze({
    Blinded: 'bleeding-eye',
    Deprived: 'half-heart',
    Stunned: 'pummeled',
    Unconscious: 'sleepy',
  }),

  CUSTOM_EFFECT_TYPES: Object.freeze(['Other']),
  CUSTOM_EFFECT_LABELS: Object.freeze({}),
});
