/** @type {import('./index.js').GameSystemProfile} */
export const shadowrunProfile = Object.freeze({
  SYSTEM_ID: "shadowrun",
  SYSTEM_NAME: "Shadowrun",

  STANDARD_CONDITIONS: Object.freeze(
    [
      "Disoriented",
      "Fatigued",
      "Immobilized",
      "Knocked Down",
      "Paralyzed",
      "Stunned",
      "Unconscious",
    ].sort((a, b) => a.localeCompare(b)),
  ),

  CONDITION_DATA: Object.freeze({
    Disoriented: { past: "disoriented", verb: "disorients", icon: "[Dis]", emoji: "😵" },
    Fatigued: { past: "fatigued", verb: "fatigues", icon: "[Fat]", emoji: "😫" },
    Immobilized: { past: "immobilized", verb: "immobilizes", icon: "[Im]", emoji: "🔗" },
    "Knocked Down": { past: "knocked down", verb: "knocks", suffix: "down", icon: "[KD]", emoji: "⬇️" },
    Paralyzed: { past: "paralyzed", verb: "paralyzes", icon: "[Pz]", emoji: "❄️" },
    Stunned: { past: "stunned", verb: "stuns", icon: "[Stn]", emoji: "😵" },
    Unconscious: { past: "unconscious", verb: "knocks", suffix: "unconscious", icon: "[U]", emoji: "💤" },
    Spell: { past: "affected by a spell", verb: "casts a spell on", icon: "[Spl]", emoji: "🔮" },
    Ability: { past: "affected by a power", verb: "uses a power on", icon: "[Pwr]", emoji: "🎯" },
  }),

  DEFAULT_MARKERS: Object.freeze({
    Disoriented: "interdiction",
    Fatigued: "half-heart",
    Immobilized: "padlock",
    "Knocked Down": "back-pain",
    Paralyzed: "frozen-orb",
    Stunned: "pummeled",
    Unconscious: "sleepy",
    Spell: "lightning-helix",
    Ability: "fist",
  }),

  CUSTOM_EFFECT_TYPES: Object.freeze(["Spell", "Ability", "Other"]),
  CUSTOM_EFFECT_LABELS: Object.freeze({ Ability: "Power" }),
});
