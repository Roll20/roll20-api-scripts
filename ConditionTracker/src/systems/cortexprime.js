/** @type {import('./index.js').GameSystemProfile} */
export const cortexPrimeProfile = Object.freeze({
  SYSTEM_ID: "cortexprime",
  SYSTEM_NAME: "Cortex Prime",

  STANDARD_CONDITIONS: Object.freeze(
    [
      "Afraid",
      "Angry",
      "Corrupted",
      "Exhausted",
      "Harmed",
      "Hungry",
      "Infected",
      "Isolated",
      "Panicked",
      "Poisoned",
    ].sort((a, b) => a.localeCompare(b)),
  ),

  CONDITION_DATA: Object.freeze({
    Afraid: { past: "afraid", verb: "frightens", icon: "[Afr]", emoji: "😨" },
    Angry: { past: "angry", verb: "angers", icon: "[Ang]", emoji: "😠" },
    Corrupted: { past: "corrupted", verb: "corrupts", icon: "[Cor]", emoji: "☠️" },
    Exhausted: { past: "exhausted", verb: "exhausts", icon: "[Ex]", emoji: "😩" },
    Harmed: { past: "harmed", verb: "harms", icon: "[Hrm]", emoji: "🤕" },
    Hungry: { past: "hungry", verb: "causes", suffix: "to hunger", icon: "[Hgr]", emoji: "🍖" },
    Infected: { past: "infected", verb: "infects", icon: "[Inf]", emoji: "🦠" },
    Isolated: { past: "isolated", verb: "isolates", icon: "[Iso]", emoji: "🏝️" },
    Panicked: { past: "panicked", verb: "causes", suffix: "to panic", icon: "[Pan]", emoji: "😱" },
    Poisoned: { past: "poisoned", verb: "poisons", icon: "[Psn]", emoji: "☠️" },
    Ability: { past: "affected by an ability", verb: "uses an ability on", icon: "[Abl]", emoji: "🎯" },
  }),

  DEFAULT_MARKERS: Object.freeze({
    Afraid: "screaming",
    Angry: "screaming",
    Corrupted: "death-zone",
    Exhausted: "sleepy",
    Harmed: "half-heart",
    Hungry: "half-heart",
    Infected: "chemical-bolt",
    Isolated: "interdiction",
    Panicked: "screaming",
    Poisoned: "chemical-bolt",
    Ability: "fist",
  }),

  CUSTOM_EFFECT_TYPES: Object.freeze(["Ability", "Other"]),
  CUSTOM_EFFECT_LABELS: Object.freeze({}),
});
