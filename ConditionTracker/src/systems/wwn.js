/** @type {import('./index.js').GameSystemProfile} */
export const wwnProfile = Object.freeze({
  SYSTEM_ID: 'wwn',
  SYSTEM_NAME: 'Worlds Without Number',

  STANDARD_CONDITIONS: Object.freeze(
    [
      'Blinded',
      'Dazed',
      'Deafened',
      'Diseased',
      'Incapacitated',
      'Paralyzed',
      'Poisoned',
      'Prone',
      'Stunned',
    ].sort((a, b) => a.localeCompare(b))
  ),

  CONDITION_DATA: Object.freeze({
    Blinded: { past: 'blinded', verb: 'blinds', icon: '[B]', emoji: '🙈' },
    Dazed: { past: 'dazed', verb: 'dazes', icon: '[Dz]', emoji: '😵' },
    Deafened: { past: 'deafened', verb: 'deafens', icon: '[Df]', emoji: '🙉' },
    Diseased: { past: 'diseased', verb: 'infects', icon: '[Di]', emoji: '🦠' },
    Incapacitated: { past: 'incapacitated', verb: 'incapacitates', icon: '[Inc]', emoji: '🚫' },
    Paralyzed: { past: 'paralyzed', verb: 'paralyzes', icon: '[Pz]', emoji: '❄️' },
    Poisoned: { past: 'poisoned', verb: 'poisons', icon: '[Psn]', emoji: '☠️' },
    Prone: { past: 'knocked prone', verb: 'knocks', suffix: 'prone', icon: '[P]', emoji: '🛌' },
    Stunned: { past: 'stunned', verb: 'stuns', icon: '[Stn]', emoji: '😵' },
    Spell: { past: 'affected by a spell', verb: 'casts a spell on', icon: '[Spl]', emoji: '🔮' },
    Ability: {
      past: 'affected by an ability',
      verb: 'uses an ability on',
      icon: '[Abl]',
      emoji: '🎯',
    },
  }),

  DEFAULT_MARKERS: Object.freeze({
    Blinded: 'bleeding-eye',
    Dazed: 'pummeled',
    Deafened: 'edge-crack',
    Diseased: 'chemical-bolt',
    Incapacitated: 'interdiction',
    Paralyzed: 'frozen-orb',
    Poisoned: 'chemical-bolt',
    Prone: 'back-pain',
    Stunned: 'pummeled',
    Spell: 'lightning-helix',
    Ability: 'fist',
  }),

  CUSTOM_EFFECT_TYPES: Object.freeze(['Spell', 'Ability', 'Other']),
  CUSTOM_EFFECT_LABELS: Object.freeze({}),
});
