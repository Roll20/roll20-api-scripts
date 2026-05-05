/** @type {import('./index.js').GameSystemProfile} */
export const savageWorldsProfile = Object.freeze({
  SYSTEM_ID: "savageworlds",
  SYSTEM_NAME: "Savage Worlds Adventure Edition",

  STANDARD_CONDITIONS: Object.freeze(
    [
      "Bleeding Out",
      "Bound",
      "Distracted",
      "Entangled",
      "Exhausted",
      "Fatigued",
      "Incapacitated",
      "Shaken",
      "Stunned",
      "Vulnerable",
    ].sort((a, b) => a.localeCompare(b)),
  ),

  CONDITION_DATA: Object.freeze({
    "Bleeding Out": { past: "bleeding out", verb: "causes", suffix: "to bleed out", icon: "[BO]", emoji: "🩸" },
    Bound: { past: "bound", verb: "binds", icon: "[Bnd]", emoji: "⛓️" },
    Distracted: { past: "distracted", verb: "distracts", icon: "[Dis]", emoji: "😶" },
    Entangled: { past: "entangled", verb: "entangles", icon: "[Ent]", emoji: "🕸️" },
    Exhausted: { past: "exhausted", verb: "exhausts", icon: "[Ex]", emoji: "😩" },
    Fatigued: { past: "fatigued", verb: "fatigues", icon: "[Fat]", emoji: "😫" },
    Incapacitated: { past: "incapacitated", verb: "incapacitates", icon: "[Inc]", emoji: "🚫" },
    Shaken: { past: "shaken", verb: "shakes", icon: "[Shk]", emoji: "😨" },
    Stunned: { past: "stunned", verb: "stuns", icon: "[Stn]", emoji: "😵" },
    Vulnerable: { past: "vulnerable", verb: "makes", suffix: "vulnerable", icon: "[Vul]", emoji: "🎯" },
    // "Spell" canonical key — displayed as "Power" via CUSTOM_EFFECT_LABELS
    Spell: { past: "affected by a power", verb: "uses a power on", icon: "[Pwr]", emoji: "🔮" },
    // "Ability" canonical key — displayed as "Edge" via CUSTOM_EFFECT_LABELS
    Ability: { past: "affected by an edge", verb: "uses an edge on", icon: "[Edge]", emoji: "⚡" },
  }),

  DEFAULT_MARKERS: Object.freeze({
    "Bleeding Out": "half-heart",
    Bound: "padlock",
    Distracted: "overdrive",
    Entangled: "grab",
    Exhausted: "sleepy",
    Fatigued: "half-heart",
    Incapacitated: "skull",
    Shaken: "pummeled",
    Stunned: "frozen-orb",
    Vulnerable: "back-pain",
    Spell: "lightning-helix",
    Ability: "fist",
  }),

  CUSTOM_EFFECT_TYPES: Object.freeze(["Spell", "Ability", "Other"]),
  // SWADE terminology: "Spell" → "Power", "Ability" → "Edge"
  CUSTOM_EFFECT_LABELS: Object.freeze({ Spell: "Power", Ability: "Edge" }),
});
