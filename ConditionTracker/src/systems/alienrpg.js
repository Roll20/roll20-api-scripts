/** @type {import('./index.js').GameSystemProfile} */
export const alienRpgProfile = Object.freeze({
  SYSTEM_ID: "alienrpg",
  SYSTEM_NAME: "Alien RPG",

  STANDARD_CONDITIONS: Object.freeze(
    [
      "Broken",
      "Dying",
      "Panicking",
      "Unconscious",
    ].sort((a, b) => a.localeCompare(b)),
  ),

  CONDITION_DATA: Object.freeze({
    Broken: { past: "broken", verb: "breaks", icon: "[Brk]", emoji: "💔" },
    Dying: { past: "dying", verb: "knocks", suffix: "dying", icon: "[Dy]", emoji: "☠️" },
    Panicking: { past: "panicking", verb: "causes", suffix: "to panic", icon: "[Pan]", emoji: "😨" },
    Unconscious: { past: "unconscious", verb: "knocks", suffix: "unconscious", icon: "[U]", emoji: "💤" },
    Ability: { past: "affected by an ability", verb: "uses an ability on", icon: "[Abl]", emoji: "🎯" },
  }),

  DEFAULT_MARKERS: Object.freeze({
    Broken: "broken-heart",
    Dying: "dead",
    Panicking: "screaming",
    Unconscious: "sleepy",
    Ability: "fist",
  }),

  CUSTOM_EFFECT_TYPES: Object.freeze(["Ability", "Other"]),
  CUSTOM_EFFECT_LABELS: Object.freeze({}),
});
