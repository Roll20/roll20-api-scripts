/** @type {import('./index.js').GameSystemProfile} */
export const ctdProfile = Object.freeze({
  SYSTEM_ID: "ctd",
  SYSTEM_NAME: "Changeling: The Dreaming",

  STANDARD_CONDITIONS: Object.freeze(
    [
      "Bedlam",
      "Blinded",
      "Chimera-Touched",
      "Dazed",
      "Paralyzed",
      "Unconscious",
    ].sort((a, b) => a.localeCompare(b)),
  ),

  CONDITION_DATA: Object.freeze({
    Bedlam: { past: "in bedlam", verb: "sends", suffix: "into bedlam", icon: "[Bdm]", emoji: "🌀" },
    Blinded: { past: "blinded", verb: "blinds", icon: "[B]", emoji: "🙈" },
    "Chimera-Touched": { past: "chimera-touched", verb: "touches with chimera", icon: "[CT]", emoji: "✨" },
    Dazed: { past: "dazed", verb: "dazes", icon: "[Dz]", emoji: "😵" },
    Paralyzed: { past: "paralyzed", verb: "paralyzes", icon: "[Pz]", emoji: "❄️" },
    Unconscious: { past: "unconscious", verb: "knocks", suffix: "unconscious", icon: "[U]", emoji: "💤" },
    Ability: { past: "affected by an art", verb: "uses an art on", icon: "[Art]", emoji: "🎯" },
  }),

  DEFAULT_MARKERS: Object.freeze({
    Bedlam: "interdiction",
    Blinded: "bleeding-eye",
    "Chimera-Touched": "fluffy-wing",
    Dazed: "pummeled",
    Paralyzed: "frozen-orb",
    Unconscious: "sleepy",
    Ability: "three-leaves",
  }),

  CUSTOM_EFFECT_TYPES: Object.freeze(["Ability", "Other"]),
  CUSTOM_EFFECT_LABELS: Object.freeze({ Ability: "Art" }),
});
