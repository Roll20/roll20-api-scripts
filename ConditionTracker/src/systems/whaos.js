/** @type {import('./index.js').GameSystemProfile} */
export const whaosProfile = Object.freeze({
  SYSTEM_ID: 'whaos',
  SYSTEM_NAME: 'Warhammer Age of Sigmar: Soulbound',

  STANDARD_CONDITIONS: Object.freeze(
    [
      'Burning',
      'Dazed',
      'Ensnared',
      'Exhausted',
      'Frightened',
      'Intoxicated',
      'Knocked Down',
      'Poisoned',
      'Stunned',
      'Unconscious',
    ].sort((a, b) => a.localeCompare(b))
  ),

  CONDITION_DATA: Object.freeze({
    Burning: { past: 'burning', verb: 'sets', suffix: 'on fire', icon: '[Brn]', emoji: '🔥' },
    Dazed: { past: 'dazed', verb: 'dazes', icon: '[Dz]', emoji: '😵' },
    Ensnared: { past: 'ensnared', verb: 'ensnares', icon: '[Ens]', emoji: '🕸️' },
    Exhausted: { past: 'exhausted', verb: 'exhausts', icon: '[Ex]', emoji: '😩' },
    Frightened: { past: 'frightened', verb: 'frightens', icon: '[Fr]', emoji: '😱' },
    Intoxicated: { past: 'intoxicated', verb: 'intoxicates', icon: '[Int]', emoji: '🍺' },
    'Knocked Down': {
      past: 'knocked down',
      verb: 'knocks',
      suffix: 'down',
      icon: '[KD]',
      emoji: '⬇️',
    },
    Poisoned: { past: 'poisoned', verb: 'poisons', icon: '[Psn]', emoji: '☠️' },
    Stunned: { past: 'stunned', verb: 'stuns', icon: '[Stn]', emoji: '😵' },
    Unconscious: {
      past: 'unconscious',
      verb: 'knocks',
      suffix: 'unconscious',
      icon: '[U]',
      emoji: '💤',
    },
    Spell: { past: 'affected by a spell', verb: 'casts a spell on', icon: '[Spl]', emoji: '🔮' },
    Ability: {
      past: 'affected by a miracle',
      verb: 'uses a miracle on',
      icon: '[Mir]',
      emoji: '🎯',
    },
  }),

  DEFAULT_MARKERS: Object.freeze({
    Burning: 'half-haze',
    Dazed: 'pummeled',
    Ensnared: 'cobweb',
    Exhausted: 'sleepy',
    Frightened: 'screaming',
    Intoxicated: 'drink-me',
    'Knocked Down': 'back-pain',
    Poisoned: 'chemical-bolt',
    Stunned: 'pummeled',
    Unconscious: 'sleepy',
    Spell: 'lightning-helix',
    Ability: 'three-leaves',
  }),

  CUSTOM_EFFECT_TYPES: Object.freeze(['Spell', 'Ability', 'Other']),
  CUSTOM_EFFECT_LABELS: Object.freeze({ Ability: 'Miracle' }),
});
