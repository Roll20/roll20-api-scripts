/** @type {import('./index.js').GameSystemProfile} */
export const starsWithoutNumberProfile = Object.freeze({
  SYSTEM_ID: "swn",
  SYSTEM_NAME: "Stars Without Number",

  STANDARD_CONDITIONS: Object.freeze(
    [
      "Blinded",
      "Dazed",
      "Deafened",
      "Diseased",
      "Incapacitated",
      "Paralyzed",
      "Poisoned",
    ].sort((a, b) => a.localeCompare(b)),
  ),

  CONDITION_DATA: Object.freeze({
    Blinded: { past: "blinded", verb: "blinds", icon: "[B]", emoji: "🙈" },
    Dazed: { past: "dazed", verb: "dazes", icon: "[Dz]", emoji: "😵" },
    Deafened: { past: "deafened", verb: "deafens", icon: "[Df]", emoji: "🙉" },
    Diseased: { past: "diseased", verb: "infects", icon: "[Di]", emoji: "🦠" },
    Incapacitated: { past: "incapacitated", verb: "incapacitates", icon: "[Inc]", emoji: "🚫" },
    Paralyzed: { past: "paralyzed", verb: "paralyzes", icon: "[Pz]", emoji: "❄️" },
    Poisoned: { past: "poisoned", verb: "poisons", icon: "[Psn]", emoji: "☠️" },
    Spell: { past: "affected by a psionic power", verb: "uses a psionic power on", icon: "[Psi]", emoji: "🔮" },
    Ability: { past: "affected by an ability", verb: "uses an ability on", icon: "[Abl]", emoji: "🎯" },
  }),

  DEFAULT_MARKERS: Object.freeze({
    Blinded: "bleeding-eye",
    Dazed: "pummeled",
    Deafened: "edge-crack",
    Diseased: "chemical-bolt",
    Incapacitated: "interdiction",
    Paralyzed: "frozen-orb",
    Poisoned: "chemical-bolt",
    Spell: "psi",
    Ability: "fist",
  }),

  CUSTOM_EFFECT_TYPES: Object.freeze(["Spell", "Ability", "Other"]),
  CUSTOM_EFFECT_LABELS: Object.freeze({ Spell: "Psionic" }),
});
