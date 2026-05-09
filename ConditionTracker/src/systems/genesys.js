/** @type {import('./index.js').GameSystemProfile} */
export const genesysProfile = Object.freeze({
  SYSTEM_ID: 'genesys',
  SYSTEM_NAME: 'Genesys',

  STANDARD_CONDITIONS: Object.freeze(
    ['Disoriented', 'Ensnared', 'Immobilized', 'Prone', 'Staggered', 'Strained'].sort((a, b) =>
      a.localeCompare(b)
    )
  ),

  CONDITION_DATA: Object.freeze({
    Disoriented: { past: 'disoriented', verb: 'disorients', icon: '[Dis]', emoji: '😵' },
    Ensnared: { past: 'ensnared', verb: 'ensnares', icon: '[Ens]', emoji: '🕸️' },
    Immobilized: { past: 'immobilized', verb: 'immobilizes', icon: '[Im]', emoji: '🔗' },
    Prone: { past: 'knocked prone', verb: 'knocks', suffix: 'prone', icon: '[P]', emoji: '🛌' },
    Staggered: { past: 'staggered', verb: 'staggers', icon: '[Stg]', emoji: '🥴' },
    Strained: { past: 'strained', verb: 'strains', icon: '[Str]', emoji: '😓' },
    Ability: {
      past: 'affected by an ability',
      verb: 'uses an ability on',
      icon: '[Abl]',
      emoji: '🎯',
    },
  }),

  DEFAULT_MARKERS: Object.freeze({
    Disoriented: 'interdiction',
    Ensnared: 'cobweb',
    Immobilized: 'padlock',
    Prone: 'back-pain',
    Staggered: 'pummeled',
    Strained: 'half-heart',
    Ability: 'fist',
  }),

  CUSTOM_EFFECT_TYPES: Object.freeze(['Ability', 'Other']),
  CUSTOM_EFFECT_LABELS: Object.freeze({}),
});
