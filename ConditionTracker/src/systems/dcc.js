/** @type {import('./index.js').GameSystemProfile} */
export const dccProfile = Object.freeze({
  SYSTEM_ID: 'dcc',
  SYSTEM_NAME: 'Dungeon Crawl Classics',

  STANDARD_CONDITIONS: Object.freeze(
    [
      'Blinded',
      'Deafened',
      'Diseased',
      'Frightened',
      'Paralyzed',
      'Petrified',
      'Poisoned',
      'Unconscious',
    ].sort((a, b) => a.localeCompare(b))
  ),

  CONDITION_DATA: Object.freeze({
    Blinded: { past: 'blinded', verb: 'blinds', icon: '[B]', emoji: '🙈' },
    Deafened: { past: 'deafened', verb: 'deafens', icon: '[Df]', emoji: '🙉' },
    Diseased: { past: 'diseased', verb: 'infects', icon: '[Di]', emoji: '🦠' },
    Frightened: { past: 'frightened', verb: 'frightens', icon: '[Fr]', emoji: '😱' },
    Paralyzed: { past: 'paralyzed', verb: 'paralyzes', icon: '[Pz]', emoji: '❄️' },
    Petrified: { past: 'petrified', verb: 'petrifies', icon: '[Pet]', emoji: '🪨' },
    Poisoned: { past: 'poisoned', verb: 'poisons', icon: '[Psn]', emoji: '☠️' },
    Unconscious: {
      past: 'unconscious',
      verb: 'knocks',
      suffix: 'unconscious',
      icon: '[U]',
      emoji: '💤',
    },
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
    Deafened: 'edge-crack',
    Diseased: 'chemical-bolt',
    Frightened: 'screaming',
    Paralyzed: 'frozen-orb',
    Petrified: 'fossil',
    Poisoned: 'chemical-bolt',
    Unconscious: 'sleepy',
    Spell: 'lightning-helix',
    Ability: 'fist',
  }),

  CUSTOM_EFFECT_TYPES: Object.freeze(['Spell', 'Ability', 'Other']),
  CUSTOM_EFFECT_LABELS: Object.freeze({}),
});
