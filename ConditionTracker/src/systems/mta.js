/** @type {import('./index.js').GameSystemProfile} */
export const mtaProfile = Object.freeze({
  SYSTEM_ID: 'mta',
  SYSTEM_NAME: 'Mage: The Ascension',

  STANDARD_CONDITIONS: Object.freeze(
    ['Blinded', 'Controlled', 'Paradox', 'Unconscious', 'Willpower Spent'].sort((a, b) =>
      a.localeCompare(b)
    )
  ),

  CONDITION_DATA: Object.freeze({
    Blinded: { past: 'blinded', verb: 'blinds', icon: '[B]', emoji: '🙈' },
    Controlled: { past: 'controlled', verb: 'controls', icon: '[Ctrl]', emoji: '🎭' },
    Paradox: { past: 'paradox affected', verb: 'inflicts paradox on', icon: '[Prx]', emoji: '♾️' },
    Unconscious: {
      past: 'unconscious',
      verb: 'knocks',
      suffix: 'unconscious',
      icon: '[U]',
      emoji: '💤',
    },
    'Willpower Spent': {
      past: 'willpower spent',
      verb: 'drains willpower from',
      icon: '[WP]',
      emoji: '💧',
    },
    Ability: {
      past: 'affected by a sphere effect',
      verb: 'uses a sphere effect on',
      icon: '[Sph]',
      emoji: '🎯',
    },
  }),

  DEFAULT_MARKERS: Object.freeze({
    Blinded: 'bleeding-eye',
    Controlled: 'chained-heart',
    Paradox: 'interdiction',
    Unconscious: 'sleepy',
    'Willpower Spent': 'half-heart',
    Ability: 'aura',
  }),

  CUSTOM_EFFECT_TYPES: Object.freeze(['Ability', 'Other']),
  CUSTOM_EFFECT_LABELS: Object.freeze({ Ability: 'Sphere' }),
});
