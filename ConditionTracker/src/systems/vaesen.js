/** @type {import('./index.js').GameSystemProfile} */
export const vaesenProfile = Object.freeze({
  SYSTEM_ID: "vaesen",
  SYSTEM_NAME: "Vaesen",

  STANDARD_CONDITIONS: Object.freeze(
    [
      "Broken",
      "Dying",
      "Frightened",
      "Injured",
    ].sort((a, b) => a.localeCompare(b)),
  ),

  CONDITION_DATA: Object.freeze({
    Broken: { past: "broken", verb: "breaks", icon: "[Brk]", emoji: "💔" },
    Dying: { past: "dying", verb: "knocks", suffix: "dying", icon: "[Dy]", emoji: "☠️" },
    Frightened: { past: "frightened", verb: "frightens", icon: "[Fr]", emoji: "😱" },
    Injured: { past: "injured", verb: "injures", icon: "[Inj]", emoji: "🩹" },
    Ability: { past: "affected by a skill", verb: "uses a skill on", icon: "[Skl]", emoji: "🎯" },
  }),

  DEFAULT_MARKERS: Object.freeze({
    Broken: "broken-heart",
    Dying: "dead",
    Frightened: "screaming",
    Injured: "half-heart",
    Ability: "fist",
  }),

  CUSTOM_EFFECT_TYPES: Object.freeze(["Ability", "Other"]),
  CUSTOM_EFFECT_LABELS: Object.freeze({ Ability: "Skill" }),
});
