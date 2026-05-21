/** @type {import('./index.js').GameSystemProfile} */
export const knaveProfile = Object.freeze({
  SYSTEM_ID: 'knave',
  SYSTEM_NAME: 'Knave',

  STANDARD_CONDITIONS: Object.freeze(
    ['Blinded', 'Frightened', 'Paralyzed', 'Poisoned'].sort((a, b) => a.localeCompare(b))
  ),

  CONDITION_DATA: Object.freeze({
    Blinded: { past: 'blinded', verb: 'blinds', icon: '[B]', emoji: '🙈' },
    Frightened: { past: 'frightened', verb: 'frightens', icon: '[Fr]', emoji: '😱' },
    Paralyzed: { past: 'paralyzed', verb: 'paralyzes', icon: '[Pz]', emoji: '❄️' },
    Poisoned: { past: 'poisoned', verb: 'poisons', icon: '[Psn]', emoji: '☠️' },
    Spell: { past: 'affected by a spell', verb: 'casts a spell on', icon: '[Spl]', emoji: '🔮' },
  }),

  DEFAULT_MARKERS: Object.freeze({
    Blinded: 'bleeding-eye',
    Frightened: 'screaming',
    Paralyzed: 'frozen-orb',
    Poisoned: 'chemical-bolt',
    Spell: 'lightning-helix',
  }),

  CUSTOM_EFFECT_TYPES: Object.freeze(['Spell', 'Other']),
  CUSTOM_EFFECT_LABELS: Object.freeze({}),
});
