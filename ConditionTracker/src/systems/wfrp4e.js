/** @type {import('./index.js').GameSystemProfile} */
export const wfrp4eProfile = Object.freeze({
  SYSTEM_ID: 'wfrp4e',
  SYSTEM_NAME: 'Warhammer Fantasy Roleplay 4e',

  STANDARD_CONDITIONS: Object.freeze(
    [
      'Ablaze',
      'Bleeding',
      'Blinded',
      'Broken',
      'Deafened',
      'Entangled',
      'Fatigued',
      'Prone',
      'Stunned',
      'Surprised',
    ].sort((a, b) => a.localeCompare(b))
  ),

  CONDITION_DATA: Object.freeze({
    Ablaze: { past: 'ablaze', verb: 'sets', suffix: 'ablaze', icon: '[Abl]', emoji: '🔥' },
    Bleeding: { past: 'bleeding', verb: 'causes', suffix: 'to bleed', icon: '[Bld]', emoji: '🩸' },
    Blinded: { past: 'blinded', verb: 'blinds', icon: '[B]', emoji: '🙈' },
    Broken: { past: 'broken', verb: 'breaks', icon: '[Brk]', emoji: '💔' },
    Deafened: { past: 'deafened', verb: 'deafens', icon: '[Df]', emoji: '🙉' },
    Entangled: { past: 'entangled', verb: 'entangles', icon: '[Ent]', emoji: '🕸️' },
    Fatigued: { past: 'fatigued', verb: 'fatigues', icon: '[Fat]', emoji: '😫' },
    Prone: { past: 'knocked prone', verb: 'knocks', suffix: 'prone', icon: '[P]', emoji: '🛌' },
    Stunned: { past: 'stunned', verb: 'stuns', icon: '[Stn]', emoji: '😵' },
    Surprised: { past: 'surprised', verb: 'surprises', icon: '[Surp]', emoji: '😲' },
    Spell: { past: 'affected by a spell', verb: 'casts a spell on', icon: '[Spl]', emoji: '🔮' },
    // "Ability" canonical key — displayed as "Talent" in WFRP4e
    Ability: { past: 'affected by a talent', verb: 'uses a talent on', icon: '[Tal]', emoji: '⚡' },
  }),

  DEFAULT_MARKERS: Object.freeze({
    Ablaze: 'lightning-helix',
    Bleeding: 'half-heart',
    Blinded: 'bleeding-eye',
    Broken: 'screaming',
    Deafened: 'edge-crack',
    Entangled: 'grab',
    Fatigued: 'sleepy',
    Prone: 'back-pain',
    Stunned: 'pummeled',
    Surprised: 'overdrive',
    Spell: 'lightning-helix',
    Ability: 'fist',
  }),

  CUSTOM_EFFECT_TYPES: Object.freeze(['Spell', 'Ability', 'Other']),
  // WFRP uses "Talent" instead of the generic "Ability" label
  CUSTOM_EFFECT_LABELS: Object.freeze({ Ability: 'Talent' }),
});
