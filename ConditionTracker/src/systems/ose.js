/** @type {import('./index.js').GameSystemProfile} */
export const oseProfile = Object.freeze({
  SYSTEM_ID: "ose",
  SYSTEM_NAME: "Old-School Essentials",

  STANDARD_CONDITIONS: Object.freeze(
    [
      "Blinded",
      "Charmed",
      "Confused",
      "Frightened",
      "Held",
      "Paralyzed",
      "Petrified",
      "Poisoned",
      "Stunned",
    ].sort((a, b) => a.localeCompare(b)),
  ),

  CONDITION_DATA: Object.freeze({
    Blinded: { past: "blinded", verb: "blinds", icon: "[B]", emoji: "🙈" },
    Charmed: { past: "charmed", verb: "charms", icon: "[C]", emoji: "💫" },
    Confused: { past: "confused", verb: "confuses", icon: "[Con]", emoji: "🤪" },
    Frightened: { past: "frightened", verb: "frightens", icon: "[Fr]", emoji: "😱" },
    Held: { past: "held", verb: "holds", icon: "[H]", emoji: "🔒" },
    Paralyzed: { past: "paralyzed", verb: "paralyzes", icon: "[Pz]", emoji: "❄️" },
    Petrified: { past: "petrified", verb: "petrifies", icon: "[Pet]", emoji: "🪨" },
    Poisoned: { past: "poisoned", verb: "poisons", icon: "[Psn]", emoji: "☠️" },
    Stunned: { past: "stunned", verb: "stuns", icon: "[Stn]", emoji: "😵" },
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
    Petrified: "fossil",
    Poisoned: "chemical-bolt",
    Stunned: "pummeled",
    Spell: "lightning-helix",
    Ability: "fist",
  }),

  CUSTOM_EFFECT_TYPES: Object.freeze(["Spell", "Ability", "Other"]),
  CUSTOM_EFFECT_LABELS: Object.freeze({}),
});
