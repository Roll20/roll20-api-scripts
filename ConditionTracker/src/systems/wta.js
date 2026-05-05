/** @type {import('./index.js').GameSystemProfile} */
export const wtaProfile = Object.freeze({
  SYSTEM_ID: "wta",
  SYSTEM_NAME: "Werewolf: The Apocalypse",

  STANDARD_CONDITIONS: Object.freeze(
    [
      "Frenzied",
      "Injured",
      "Knocked Down",
      "Paralyzed",
      "Wounded",
    ].sort((a, b) => a.localeCompare(b)),
  ),

  CONDITION_DATA: Object.freeze({
    Frenzied: { past: "frenzied", verb: "sends", suffix: "into frenzy", icon: "[Frz]", emoji: "🐺" },
    Injured: { past: "injured", verb: "injures", icon: "[Inj]", emoji: "🩹" },
    "Knocked Down": { past: "knocked down", verb: "knocks", suffix: "down", icon: "[KD]", emoji: "⬇️" },
    Paralyzed: { past: "paralyzed", verb: "paralyzes", icon: "[Pz]", emoji: "❄️" },
    Wounded: { past: "wounded", verb: "wounds", icon: "[W]", emoji: "🤕" },
    Ability: { past: "affected by a gift", verb: "uses a gift on", icon: "[Gft]", emoji: "🎯" },
  }),

  DEFAULT_MARKERS: Object.freeze({
    Frenzied: "screaming",
    Injured: "half-heart",
    "Knocked Down": "back-pain",
    Paralyzed: "frozen-orb",
    Wounded: "skull",
    Ability: "fist",
  }),

  CUSTOM_EFFECT_TYPES: Object.freeze(["Ability", "Other"]),
  CUSTOM_EFFECT_LABELS: Object.freeze({ Ability: "Gift" }),
});
