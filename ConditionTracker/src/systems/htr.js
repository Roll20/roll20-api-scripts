/** @type {import('./index.js').GameSystemProfile} */
export const htrProfile = Object.freeze({
  SYSTEM_ID: "htr",
  SYSTEM_NAME: "Hunter: The Reckoning",

  STANDARD_CONDITIONS: Object.freeze(
    [
      "Blinded",
      "Controlled",
      "Frightened",
      "Injured",
      "Paralyzed",
      "Unconscious",
    ].sort((a, b) => a.localeCompare(b)),
  ),

  CONDITION_DATA: Object.freeze({
    Blinded: { past: "blinded", verb: "blinds", icon: "[B]", emoji: "🙈" },
    Controlled: { past: "controlled", verb: "controls", icon: "[Ctrl]", emoji: "🎭" },
    Frightened: { past: "frightened", verb: "frightens", icon: "[Fr]", emoji: "😱" },
    Injured: { past: "injured", verb: "injures", icon: "[Inj]", emoji: "🩹" },
    Paralyzed: { past: "paralyzed", verb: "paralyzes", icon: "[Pz]", emoji: "❄️" },
    Unconscious: { past: "unconscious", verb: "knocks", suffix: "unconscious", icon: "[U]", emoji: "💤" },
    Ability: { past: "affected by an edge", verb: "uses an edge on", icon: "[Edg]", emoji: "🎯" },
  }),

  DEFAULT_MARKERS: Object.freeze({
    Blinded: "bleeding-eye",
    Controlled: "chained-heart",
    Frightened: "screaming",
    Injured: "half-heart",
    Paralyzed: "frozen-orb",
    Unconscious: "sleepy",
    Ability: "fist",
  }),

  CUSTOM_EFFECT_TYPES: Object.freeze(["Ability", "Other"]),
  CUSTOM_EFFECT_LABELS: Object.freeze({ Ability: "Edge" }),
});
