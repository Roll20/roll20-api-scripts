/** @type {import('./index.js').GameSystemProfile} */
export const brpProfile = Object.freeze({
  SYSTEM_ID: "brp",
  SYSTEM_NAME: "Basic Role-Playing",

  STANDARD_CONDITIONS: Object.freeze(
    [
      "Bleeding",
      "Dying",
      "Fatigued",
      "Insane",
      "Poisoned",
      "Unconscious",
      "Wounded",
    ].sort((a, b) => a.localeCompare(b)),
  ),

  CONDITION_DATA: Object.freeze({
    Bleeding: { past: "bleeding", verb: "causes", suffix: "to bleed", icon: "[Bld]", emoji: "🩸" },
    Dying: { past: "dying", verb: "knocks", suffix: "dying", icon: "[Dy]", emoji: "☠️" },
    Fatigued: { past: "fatigued", verb: "fatigues", icon: "[Fat]", emoji: "😫" },
    Insane: { past: "insane", verb: "drives", suffix: "insane", icon: "[Ins]", emoji: "🌀" },
    Poisoned: { past: "poisoned", verb: "poisons", icon: "[Psn]", emoji: "☠️" },
    Unconscious: { past: "unconscious", verb: "knocks", suffix: "unconscious", icon: "[U]", emoji: "💤" },
    Wounded: { past: "wounded", verb: "wounds", icon: "[W]", emoji: "🤕" },
    Spell: { past: "affected by a spell", verb: "casts a spell on", icon: "[Spl]", emoji: "🔮" },
    Ability: { past: "affected by a skill", verb: "uses a skill on", icon: "[Skl]", emoji: "🎯" },
  }),

  DEFAULT_MARKERS: Object.freeze({
    Bleeding: "bleeding-eye",
    Dying: "dead",
    Fatigued: "half-heart",
    Insane: "interdiction",
    Poisoned: "chemical-bolt",
    Unconscious: "sleepy",
    Wounded: "half-heart",
    Spell: "lightning-helix",
    Ability: "fist",
  }),

  CUSTOM_EFFECT_TYPES: Object.freeze(["Spell", "Ability", "Other"]),
  CUSTOM_EFFECT_LABELS: Object.freeze({ Ability: "Skill" }),
});
