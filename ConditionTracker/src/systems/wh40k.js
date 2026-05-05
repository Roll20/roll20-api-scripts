/** @type {import('./index.js').GameSystemProfile} */
export const wh40kProfile = Object.freeze({
  SYSTEM_ID: "wh40k",
  SYSTEM_NAME: "Warhammer 40,000 RPG",

  STANDARD_CONDITIONS: Object.freeze(
    [
      "Burning",
      "Fatigued",
      "Frightened",
      "Poisoned",
      "Prone",
      "Restrained",
      "Shocked",
      "Stunned",
      "Unconscious",
      "Wounded",
    ].sort((a, b) => a.localeCompare(b)),
  ),

  CONDITION_DATA: Object.freeze({
    Burning: { past: "burning", verb: "sets", suffix: "on fire", icon: "[Brn]", emoji: "🔥" },
    Fatigued: { past: "fatigued", verb: "fatigues", icon: "[Fat]", emoji: "😫" },
    Frightened: { past: "frightened", verb: "frightens", icon: "[Fr]", emoji: "😱" },
    Poisoned: { past: "poisoned", verb: "poisons", icon: "[Psn]", emoji: "☠️" },
    Prone: { past: "knocked prone", verb: "knocks", suffix: "prone", icon: "[P]", emoji: "🛌" },
    Restrained: { past: "restrained", verb: "restrains", icon: "[R]", emoji: "🔒" },
    Shocked: { past: "shocked", verb: "shocks", icon: "[Shk]", emoji: "⚡" },
    Stunned: { past: "stunned", verb: "stuns", icon: "[Stn]", emoji: "😵" },
    Unconscious: { past: "unconscious", verb: "knocks", suffix: "unconscious", icon: "[U]", emoji: "💤" },
    Wounded: { past: "wounded", verb: "wounds", icon: "[W]", emoji: "🤕" },
    Spell: { past: "affected by a psychic power", verb: "uses a psychic power on", icon: "[Psy]", emoji: "🔮" },
    Ability: { past: "affected by a talent", verb: "uses a talent on", icon: "[Tal]", emoji: "🎯" },
  }),

  DEFAULT_MARKERS: Object.freeze({
    Burning: "half-haze",
    Fatigued: "half-heart",
    Frightened: "screaming",
    Poisoned: "chemical-bolt",
    Prone: "back-pain",
    Restrained: "padlock",
    Shocked: "lightning-helix",
    Stunned: "pummeled",
    Unconscious: "sleepy",
    Wounded: "half-heart",
    Spell: "aura",
    Ability: "fist",
  }),

  CUSTOM_EFFECT_TYPES: Object.freeze(["Spell", "Ability", "Other"]),
  CUSTOM_EFFECT_LABELS: Object.freeze({ Spell: "Psychic Power", Ability: "Talent" }),
});
