/** @type {import('./index.js').GameSystemProfile} */
export const deltaGreenProfile = Object.freeze({
  SYSTEM_ID: 'deltagreen',
  SYSTEM_NAME: 'Delta Green',

  STANDARD_CONDITIONS: Object.freeze(
    [
      'Berserk',
      'Broken',
      'Dying',
      'Injured',
      'Seriously Wounded',
      'Temporary Insanity',
      'Unconscious',
    ].sort((a, b) => a.localeCompare(b))
  ),

  CONDITION_DATA: Object.freeze({
    Berserk: { past: 'berserk', verb: 'sends', suffix: 'berserk', icon: '[Bsk]', emoji: '😤' },
    Broken: { past: 'broken', verb: 'breaks', icon: '[Brk]', emoji: '💔' },
    Dying: { past: 'dying', verb: 'knocks', suffix: 'dying', icon: '[Dy]', emoji: '☠️' },
    Injured: { past: 'injured', verb: 'injures', icon: '[Inj]', emoji: '🩹' },
    'Seriously Wounded': {
      past: 'seriously wounded',
      verb: 'seriously wounds',
      icon: '[SW]',
      emoji: '🩸',
    },
    'Temporary Insanity': {
      past: 'temporarily insane',
      verb: 'drives',
      suffix: 'temporarily insane',
      icon: '[TI]',
      emoji: '🌀',
    },
    Unconscious: {
      past: 'unconscious',
      verb: 'knocks',
      suffix: 'unconscious',
      icon: '[U]',
      emoji: '💤',
    },
    Ability: { past: 'affected by a skill', verb: 'uses a skill on', icon: '[Skl]', emoji: '🎯' },
  }),

  DEFAULT_MARKERS: Object.freeze({
    Berserk: 'screaming',
    Broken: 'broken-heart',
    Dying: 'dead',
    Injured: 'half-heart',
    'Seriously Wounded': 'skull',
    'Temporary Insanity': 'interdiction',
    Unconscious: 'sleepy',
    Ability: 'fist',
  }),

  CUSTOM_EFFECT_TYPES: Object.freeze(['Ability', 'Other']),
  CUSTOM_EFFECT_LABELS: Object.freeze({ Ability: 'Skill' }),
});
