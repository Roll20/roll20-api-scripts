/** @type {import('./index.js').GameSystemProfile} */
export const cypherSystemProfile = Object.freeze({
  SYSTEM_ID: "cyphersystem",
  SYSTEM_NAME: "Cypher System",

  STANDARD_CONDITIONS: Object.freeze(
    [
      "Dazed",
      "Debilitated",
      "Impaired",
    ].sort((a, b) => a.localeCompare(b)),
  ),

  CONDITION_DATA: Object.freeze({
    Dazed: { past: "dazed", verb: "dazes", icon: "[Dz]", emoji: "😵" },
    Debilitated: { past: "debilitated", verb: "debilitates", icon: "[Dbl]", emoji: "💔" },
    Impaired: { past: "impaired", verb: "impairs", icon: "[Imp]", emoji: "⚠️" },
    Ability: { past: "affected by an ability", verb: "uses an ability on", icon: "[Abl]", emoji: "🎯" },
  }),

  DEFAULT_MARKERS: Object.freeze({
    Dazed: "pummeled",
    Debilitated: "skull",
    Impaired: "half-heart",
    Ability: "fist",
  }),

  CUSTOM_EFFECT_TYPES: Object.freeze(["Ability", "Other"]),
  CUSTOM_EFFECT_LABELS: Object.freeze({}),
});
