/** @type {import('./index.js').GameSystemProfile} */
export const bfrpgProfile = Object.freeze({
  SYSTEM_ID: "bfrpg",
  SYSTEM_NAME: "Basic Fantasy RPG",

  STANDARD_CONDITIONS: Object.freeze(
    [
      "Blinded",
      "Charmed",
      "Confused",
      "Frightened",
      "Held",
      "Paralyzed",
      "Poisoned",
      "Unconscious",
    ].sort((a, b) => a.localeCompare(b)),
  ),

  CONDITION_DATA: Object.freeze({
    Blinded: { past: "blinded", verb: "blinds", icon: "[B]", emoji: "🙈" },
    Charmed: { past: "charmed", verb: "charms", icon: "[C]", emoji: "💫" },
    Confused: { past: "confused", verb: "confuses", icon: "[Con]", emoji: "🤪" },
    Frightened: { past: "frightened", verb: "frightens", icon: "[Fr]", emoji: "😱" },
    Held: { past: "held", verb: "holds", icon: "[H]", emoji: "🔒" },
    Paralyzed: { past: "paralyzed", verb: "paralyzes", icon: "[Pz]", emoji: "❄️" },
    Poisoned: { past: "poisoned", verb: "poisons", icon: "[Psn]", emoji: "☠️" },
    Unconscious: { past: "unconscious", verb: "knocks", suffix: "unconscious", icon: "[U]", emoji: "💤" },
    Spell: { past: "affected by a spell", verb: "casts a spell on", icon: "[Spl]", emoji: "🔮" },
    Ability: { past: "affected by an ability", verb: "uses an ability on", icon: "[Abl]", emoji: "🎯" },
  }),

  DEFAULT_MARKERS: Object.freeze({
    Blinded: "bleeding-eye",
    Charmed: "chained-heart",
    Confused: "interdiction",
    Frightened: "screaming",
    Held: "padlock",
    Paralyzed: "frozen-orb",
    Poisoned: "chemical-bolt",
    Unconscious: "sleepy",
    Spell: "lightning-helix",
    Ability: "fist",
  }),

  CUSTOM_EFFECT_TYPES: Object.freeze(["Spell", "Ability", "Other"]),
  CUSTOM_EFFECT_LABELS: Object.freeze({}),
});
