/** @type {import('./index.js').GameSystemProfile} */
export const mothershipProfile = Object.freeze({
  SYSTEM_ID: "mothership",
  SYSTEM_NAME: "Mothership RPG",

  STANDARD_CONDITIONS: Object.freeze(
    [
      "Bleeding",
      "Dead",
      "Dying",
      "Panicking",
      "Unconscious",
      "Wounded",
    ].sort((a, b) => a.localeCompare(b)),
  ),

  CONDITION_DATA: Object.freeze({
    Bleeding: { past: "bleeding", verb: "causes", suffix: "to bleed", icon: "[Bld]", emoji: "🩸" },
    Dead: { past: "dead", verb: "kills", icon: "[X]", emoji: "💀" },
    Dying: { past: "dying", verb: "knocks", suffix: "dying", icon: "[Dy]", emoji: "☠️" },
    Panicking: { past: "panicking", verb: "causes", suffix: "to panic", icon: "[Pan]", emoji: "😨" },
    Unconscious: { past: "unconscious", verb: "knocks", suffix: "unconscious", icon: "[U]", emoji: "💤" },
    Wounded: { past: "wounded", verb: "wounds", icon: "[W]", emoji: "🤕" },
    Ability: { past: "affected by an ability", verb: "uses an ability on", icon: "[Abl]", emoji: "🎯" },
  }),

  DEFAULT_MARKERS: Object.freeze({
    Bleeding: "bleeding-eye",
    Dead: "skull",
    Dying: "dead",
    Panicking: "screaming",
    Unconscious: "sleepy",
    Wounded: "half-heart",
    Ability: "fist",
  }),

  CUSTOM_EFFECT_TYPES: Object.freeze(["Ability", "Other"]),
  CUSTOM_EFFECT_LABELS: Object.freeze({}),
});
