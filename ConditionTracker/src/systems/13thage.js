/** @type {import('./index.js').GameSystemProfile} */
export const thirteenthAgeProfile = Object.freeze({
  SYSTEM_ID: '13thage',
  SYSTEM_NAME: '13th Age',

  STANDARD_CONDITIONS: Object.freeze(
    [
      'Confused',
      'Dazed',
      'Fear',
      'Hampered',
      'Helpless',
      'Ongoing Damage',
      'Stunned',
      'Vulnerable',
      'Weakened',
    ].sort((a, b) => a.localeCompare(b))
  ),

  CONDITION_DATA: Object.freeze({
    Confused: { past: 'confused', verb: 'confuses', icon: '[Con]', emoji: '🤪' },
    Dazed: { past: 'dazed', verb: 'dazes', icon: '[Dz]', emoji: '😵' },
    Fear: { past: 'feared', verb: 'frightens', icon: '[Fr]', emoji: '😱' },
    Hampered: { past: 'hampered', verb: 'hampers', icon: '[Ham]', emoji: '🦶' },
    Helpless: { past: 'helpless', verb: 'renders', suffix: 'helpless', icon: '[Hlp]', emoji: '🙏' },
    'Ongoing Damage': {
      past: 'taking ongoing damage',
      verb: 'deals ongoing damage to',
      icon: '[OD]',
      emoji: '⚡',
    },
    Stunned: { past: 'stunned', verb: 'stuns', icon: '[Stn]', emoji: '😵' },
    Vulnerable: {
      past: 'vulnerable',
      verb: 'renders',
      suffix: 'vulnerable',
      icon: '[Vuln]',
      emoji: '🛡️',
    },
    Weakened: { past: 'weakened', verb: 'weakens', icon: '[Wk]', emoji: '💪' },
    Spell: { past: 'affected by a spell', verb: 'casts a spell on', icon: '[Spl]', emoji: '🔮' },
    Ability: {
      past: 'affected by an ability',
      verb: 'uses an ability on',
      icon: '[Abl]',
      emoji: '🎯',
    },
  }),

  DEFAULT_MARKERS: Object.freeze({
    Confused: 'interdiction',
    Dazed: 'pummeled',
    Fear: 'screaming',
    Hampered: 'back-pain',
    Helpless: 'frozen-orb',
    'Ongoing Damage': 'lightning-helix',
    Stunned: 'pummeled',
    Vulnerable: 'broken-heart',
    Weakened: 'half-heart',
    Spell: 'aura',
    Ability: 'fist',
  }),

  CUSTOM_EFFECT_TYPES: Object.freeze(['Spell', 'Ability', 'Other']),
  CUSTOM_EFFECT_LABELS: Object.freeze({}),
});
