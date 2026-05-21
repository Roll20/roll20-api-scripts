/**
 * Generic / Other profile for games without a predefined condition set.
 * Only the universal custom effect types (Spell, Ability, Other) are available;
 * GMs apply effects via the "Other" free-text type or through custom markers.
 *
 * @type {import('./index.js').GameSystemProfile}
 */
export const genericProfile = Object.freeze({
  SYSTEM_ID: 'generic',
  SYSTEM_NAME: 'Generic / Other',

  STANDARD_CONDITIONS: Object.freeze([]),

  CONDITION_DATA: Object.freeze({
    Spell: { past: 'affected by a spell', verb: 'casts a spell on', icon: '[Spl]', emoji: '🔮' },
    Ability: {
      past: 'affected by an ability',
      verb: 'uses an ability on',
      icon: '[Abl]',
      emoji: '🎯',
    },
  }),

  DEFAULT_MARKERS: Object.freeze({}),

  CUSTOM_EFFECT_TYPES: Object.freeze(['Spell', 'Ability', 'Other']),
  CUSTOM_EFFECT_LABELS: Object.freeze({}),
});
