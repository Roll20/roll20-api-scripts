/** @type {import('./index.js').GameSystemProfile} */
export const gurpsProfile = Object.freeze({
  SYSTEM_ID: "gurps",
  SYSTEM_NAME: "GURPS",

  STANDARD_CONDITIONS: Object.freeze(
    [
      "Berserk",
      "Confused",
      "Dazed",
      "Dying",
      "Stunned",
      "Unconscious",
    ].sort((a, b) => a.localeCompare(b)),
  ),

  CONDITION_DATA: Object.freeze({
    Berserk: { past: "berserk", verb: "sends", suffix: "berserk", icon: "[Bsk]", emoji: "😤" },
    Confused: { past: "confused", verb: "confuses", icon: "[Con]", emoji: "🤪" },
    Dazed: { past: "dazed", verb: "dazes", icon: "[Dz]", emoji: "😵" },
    Dying: { past: "dying", verb: "knocks", suffix: "dying", icon: "[Dy]", emoji: "☠️" },
    Stunned: { past: "stunned", verb: "stuns", icon: "[Stn]", emoji: "😵" },
    Unconscious: { past: "unconscious", verb: "knocks", suffix: "unconscious", icon: "[U]", emoji: "💤" },
    Spell: { past: "affected by a spell", verb: "casts a spell on", icon: "[Spl]", emoji: "🔮" },
    Ability: { past: "affected by an ability", verb: "uses an ability on", icon: "[Abl]", emoji: "🎯" },
  }),

  DEFAULT_MARKERS: Object.freeze({
    Berserk: "screaming",
    Confused: "interdiction",
    Dazed: "pummeled",
    Dying: "dead",
    Stunned: "pummeled",
    Unconscious: "sleepy",
    Spell: "lightning-helix",
    Ability: "fist",
  }),

  CUSTOM_EFFECT_TYPES: Object.freeze(["Spell", "Ability", "Other"]),
  CUSTOM_EFFECT_LABELS: Object.freeze({}),
});
