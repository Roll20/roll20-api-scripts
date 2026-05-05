/** @type {import('./index.js').GameSystemProfile} */
export const cairnProfile = Object.freeze({
  SYSTEM_ID: "cairn",
  SYSTEM_NAME: "Cairn",

  STANDARD_CONDITIONS: Object.freeze(
    [
      "Blinded",
      "Deprived",
      "Panicked",
      "Unconscious",
    ].sort((a, b) => a.localeCompare(b)),
  ),

  CONDITION_DATA: Object.freeze({
    Blinded: { past: "blinded", verb: "blinds", icon: "[B]", emoji: "🙈" },
    Deprived: { past: "deprived", verb: "deprives", icon: "[Dep]", emoji: "🌑" },
    Panicked: { past: "panicked", verb: "causes", suffix: "to panic", icon: "[Pan]", emoji: "😨" },
    Unconscious: { past: "unconscious", verb: "knocks", suffix: "unconscious", icon: "[U]", emoji: "💤" },
  }),

  DEFAULT_MARKERS: Object.freeze({
    Blinded: "bleeding-eye",
    Deprived: "half-heart",
    Panicked: "screaming",
    Unconscious: "sleepy",
  }),

  CUSTOM_EFFECT_TYPES: Object.freeze(["Other"]),
  CUSTOM_EFFECT_LABELS: Object.freeze({}),
});
