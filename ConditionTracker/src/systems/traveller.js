/** @type {import('./index.js').GameSystemProfile} */
export const travellerProfile = Object.freeze({
  SYSTEM_ID: 'traveller',
  SYSTEM_NAME: 'Traveller',

  STANDARD_CONDITIONS: Object.freeze(
    ['Bleeding', 'Incapacitated', 'Stunned', 'Unconscious'].sort((a, b) => a.localeCompare(b))
  ),

  CONDITION_DATA: Object.freeze({
    Bleeding: { past: 'bleeding', verb: 'causes', suffix: 'to bleed', icon: '[Bld]', emoji: '🩸' },
    Incapacitated: { past: 'incapacitated', verb: 'incapacitates', icon: '[Inc]', emoji: '🚫' },
    Stunned: { past: 'stunned', verb: 'stuns', icon: '[Stn]', emoji: '😵' },
    Unconscious: {
      past: 'unconscious',
      verb: 'knocks',
      suffix: 'unconscious',
      icon: '[U]',
      emoji: '💤',
    },
    Ability: {
      past: 'affected by an ability',
      verb: 'uses an ability on',
      icon: '[Abl]',
      emoji: '🎯',
    },
  }),

  DEFAULT_MARKERS: Object.freeze({
    Bleeding: 'bleeding-eye',
    Incapacitated: 'interdiction',
    Stunned: 'pummeled',
    Unconscious: 'sleepy',
    Ability: 'fist',
  }),

  CUSTOM_EFFECT_TYPES: Object.freeze(['Ability', 'Other']),
  CUSTOM_EFFECT_LABELS: Object.freeze({}),
});
