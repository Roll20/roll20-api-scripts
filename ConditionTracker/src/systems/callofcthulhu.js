/** @type {import('./index.js').GameSystemProfile} */
export const callOfCthulhuProfile = Object.freeze({
  SYSTEM_ID: 'callofcthulhu',
  SYSTEM_NAME: 'Call of Cthulhu 7e',

  STANDARD_CONDITIONS: Object.freeze(
    [
      'Berserk',
      'Dying',
      'Indefinite Insanity',
      'Injured',
      'Mania',
      'Phobia',
      'Seriously Wounded',
      'Temporary Insanity',
      'Unconscious',
    ].sort((a, b) => a.localeCompare(b))
  ),

  CONDITION_DATA: Object.freeze({
    Berserk: { past: 'berserk', verb: 'drives', suffix: 'berserk', icon: '[Brs]', emoji: '😡' },
    Dying: { past: 'dying', verb: 'reduces', suffix: 'to dying', icon: '[Dy]', emoji: '💀' },
    'Indefinite Insanity': {
      past: 'indefinitely insane',
      verb: 'drives',
      suffix: 'indefinitely insane',
      icon: '[II]',
      emoji: '🤯',
    },
    Injured: { past: 'injured', verb: 'injures', icon: '[Inj]', emoji: '🩹' },
    Mania: { past: 'gripped by mania', verb: 'triggers mania in', icon: '[Man]', emoji: '😤' },
    Phobia: {
      past: 'gripped by a phobia',
      verb: 'triggers a phobia in',
      icon: '[Phb]',
      emoji: '😱',
    },
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
    // "Spell" = Mythos spells; "Ability" canonical key labelled "Skill"
    Spell: {
      past: 'affected by a mythos spell',
      verb: 'casts a mythos spell on',
      icon: '[Spl]',
      emoji: '🔮',
    },
    Ability: {
      past: 'affected by a skill effect',
      verb: 'uses a skill on',
      icon: '[Skl]',
      emoji: '🎯',
    },
  }),

  DEFAULT_MARKERS: Object.freeze({
    Berserk: 'screaming',
    Dying: 'skull',
    'Indefinite Insanity': 'interdiction',
    Injured: 'half-heart',
    Mania: 'chained-heart',
    Phobia: 'screaming',
    'Seriously Wounded': 'half-heart',
    'Temporary Insanity': 'frozen-orb',
    Unconscious: 'sleepy',
    Spell: 'lightning-helix',
    Ability: 'fist',
  }),

  CUSTOM_EFFECT_TYPES: Object.freeze(['Spell', 'Ability', 'Other']),
  // CoC uses "Skill" instead of the generic "Ability" label
  CUSTOM_EFFECT_LABELS: Object.freeze({ Ability: 'Skill' }),
});
