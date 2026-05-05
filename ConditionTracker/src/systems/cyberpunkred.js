/** @type {import('./index.js').GameSystemProfile} */
export const cyberpunkRedProfile = Object.freeze({
  SYSTEM_ID: "cyberpunkred",
  SYSTEM_NAME: "Cyberpunk Red",

  STANDARD_CONDITIONS: Object.freeze(
    [
      "Blinded",
      "Deafened",
      "Mortally Wounded",
      "Seriously Wounded",
      "Stunned",
      "Unconscious",
    ].sort((a, b) => a.localeCompare(b)),
  ),

  CONDITION_DATA: Object.freeze({
    Blinded: { past: "blinded", verb: "blinds", icon: "[B]", emoji: "🙈" },
    Deafened: { past: "deafened", verb: "deafens", icon: "[Df]", emoji: "🙉" },
    "Mortally Wounded": { past: "mortally wounded", verb: "mortally wounds", icon: "[MW]", emoji: "💀" },
    "Seriously Wounded": { past: "seriously wounded", verb: "seriously wounds", icon: "[SW]", emoji: "🩸" },
    Stunned: { past: "stunned", verb: "stuns", icon: "[Stn]", emoji: "😵" },
    Unconscious: { past: "unconscious", verb: "knocks", suffix: "unconscious", icon: "[U]", emoji: "💤" },
    Ability: { past: "affected by a netrunner ability", verb: "uses an ability on", icon: "[Abl]", emoji: "🎯" },
  }),

  DEFAULT_MARKERS: Object.freeze({
    Blinded: "bleeding-eye",
    Deafened: "edge-crack",
    "Mortally Wounded": "skull",
    "Seriously Wounded": "half-heart",
    Stunned: "pummeled",
    Unconscious: "sleepy",
    Ability: "fist",
  }),

  CUSTOM_EFFECT_TYPES: Object.freeze(["Ability", "Other"]),
  CUSTOM_EFFECT_LABELS: Object.freeze({}),
});
