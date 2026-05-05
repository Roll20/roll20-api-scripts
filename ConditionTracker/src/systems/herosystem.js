/** @type {import('./index.js').GameSystemProfile} */
export const heroSystemProfile = Object.freeze({
  SYSTEM_ID: "herosystem",
  SYSTEM_NAME: "Hero System",

  STANDARD_CONDITIONS: Object.freeze(
    [
      "Blinded",
      "Confused",
      "Dazed",
      "Entangled",
      "Stunned",
      "Unconscious",
    ].sort((a, b) => a.localeCompare(b)),
  ),

  CONDITION_DATA: Object.freeze({
    Blinded: { past: "blinded", verb: "blinds", icon: "[B]", emoji: "🙈" },
    Confused: { past: "confused", verb: "confuses", icon: "[Con]", emoji: "🤪" },
    Dazed: { past: "dazed", verb: "dazes", icon: "[Dz]", emoji: "😵" },
    Entangled: { past: "entangled", verb: "entangles", icon: "[Ent]", emoji: "🕸️" },
    Stunned: { past: "stunned", verb: "stuns", icon: "[Stn]", emoji: "😵" },
    Unconscious: { past: "unconscious", verb: "knocks", suffix: "unconscious", icon: "[U]", emoji: "💤" },
    Ability: { past: "affected by a power", verb: "uses a power on", icon: "[Pwr]", emoji: "🎯" },
  }),

  DEFAULT_MARKERS: Object.freeze({
    Blinded: "bleeding-eye",
    Confused: "interdiction",
    Dazed: "pummeled",
    Entangled: "cobweb",
    Stunned: "pummeled",
    Unconscious: "sleepy",
    Ability: "fist",
  }),

  CUSTOM_EFFECT_TYPES: Object.freeze(["Ability", "Other"]),
  CUSTOM_EFFECT_LABELS: Object.freeze({ Ability: "Power" }),
});
