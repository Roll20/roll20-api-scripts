/** @type {import('./index.js').GameSystemProfile} */
export const vtmProfile = Object.freeze({
  SYSTEM_ID: 'vtm',
  SYSTEM_NAME: 'Vampire: The Masquerade',

  STANDARD_CONDITIONS: Object.freeze(
    [
      'Blinded',
      'Blood Bound',
      'Dominated',
      'Entranced',
      'Frenzied',
      'Paralyzed',
      'Torpor',
      'Wounded',
    ].sort((a, b) => a.localeCompare(b))
  ),

  CONDITION_DATA: Object.freeze({
    Blinded: { past: 'blinded', verb: 'blinds', icon: '[B]', emoji: '🙈' },
    'Blood Bound': { past: 'blood bound', verb: 'blood bonds', icon: '[BB]', emoji: '🩸' },
    Dominated: { past: 'dominated', verb: 'dominates', icon: '[Dom]', emoji: '👁️' },
    Entranced: { past: 'entranced', verb: 'entrances', icon: '[Ent]', emoji: '🌀' },
    Frenzied: {
      past: 'frenzied',
      verb: 'sends',
      suffix: 'into frenzy',
      icon: '[Frz]',
      emoji: '🐺',
    },
    Paralyzed: { past: 'paralyzed', verb: 'paralyzes', icon: '[Pz]', emoji: '❄️' },
    Torpor: { past: 'in torpor', verb: 'sends', suffix: 'into torpor', icon: '[Tor]', emoji: '💀' },
    Wounded: { past: 'wounded', verb: 'wounds', icon: '[W]', emoji: '🤕' },
    Ability: {
      past: 'affected by a discipline',
      verb: 'uses a discipline on',
      icon: '[Dis]',
      emoji: '🎯',
    },
  }),

  DEFAULT_MARKERS: Object.freeze({
    Blinded: 'bleeding-eye',
    'Blood Bound': 'chained-heart',
    Dominated: 'aura',
    Entranced: 'chained-heart',
    Frenzied: 'screaming',
    Paralyzed: 'frozen-orb',
    Torpor: 'sleepy',
    Wounded: 'half-heart',
    Ability: 'fist',
  }),

  CUSTOM_EFFECT_TYPES: Object.freeze(['Ability', 'Other']),
  CUSTOM_EFFECT_LABELS: Object.freeze({ Ability: 'Discipline' }),
});
