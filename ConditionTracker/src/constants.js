export const SCRIPT_NAME = "__SCRIPT_NAME__";
export const SCRIPT_FILE = "__SCRIPT_FILE__";
export const SCRIPT_VERSION = "__BUILD_VERSION__";
export const SCRIPT_LAST_UPDATED = "__BUILD_DATE__";

export {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  VALID_LOCALES,
} from "./locales/metadata.js";

export const COLOR_BG_SOFT_BLACK = "#0A0A12";
export const COLOR_TEXT_ARCANE_SILVER = "#E6DFFF";
export const COLOR_TEXT_DIM_SILVER = "#B8AFCF";
export const COLOR_ACCENT_LIGHT = "#FF4D6D";
export const COLOR_ACCENT_DARK = "#5B21B6";
export const COLOR_HEADER_LIGHT = "#E9D5FF";
export const COLOR_HEADER_DARK = "#1E40AF";
export const COLOR_TEXT_WHITE = "#FFFFFF";

export const STATE_KEY = SCRIPT_NAME.replaceAll(/\s+/g, "");
export const HANDOUT_NAME = `${SCRIPT_NAME} — Help & Reference`;
export const MACRO_NAME = `${STATE_KEY}Wizard`;
export const MACRO_NAME_MULTI_TARGET = `${STATE_KEY}MultiTarget`;
export const COMMAND = "!condition-tracker";
export const COMMAND_HELP = `${COMMAND} --help`;
export const COMMAND_PROMPT = `${COMMAND} --prompt`;
export const COMMAND_MULTI_TARGET = `${COMMAND} --multi-target`;
export const TURN_ORDER_PREFIX = `${STATE_KEY}:`;
export const TOKEN_MARKER_SEPARATOR = ",";
export const EMPTY_TURN_ORDER = "[]";
export const VALID_HEALTH_BARS = ["bar1_value", "bar2_value", "bar3_value"];
export const BOOLEAN_TEXT = new Set(["true", "false"]);
export const DURATION_UNTIL_REMOVED = "untilRemoved";
export const DURATION_TURN_END = "turnEnd";
export const DURATION_ROUNDS = "rounds";
export const MENU_REMOVE = "remove";
export const CONDITION_OTHER = "Other";
export const CONDITION_SPELL = "Spell";
export const CONDITION_ABILITY = "Ability";
export const CONDITION_ADVANTAGE = "Advantage";
export const CONDITION_DISADVANTAGE = "Disadvantage";
export const DEFAULT_MACRO_BODY = `${COMMAND_PROMPT}`;
export const DEFAULT_MULTI_TARGET_MACRO_BODY = `${COMMAND_MULTI_TARGET}`;

export const DEFAULT_MARKERS = Object.freeze({
  Grappled: "grab",
  Restrained: "padlock",
  Prone: "back-pain",
  Poisoned: "chemical-bolt",
  Stunned: "pummeled",
  Blinded: "bleeding-eye",
  Charmed: "chained-heart",
  Frightened: "screaming",
  Incapacitated: "interdiction",
  Invisible: "ninja-mask",
  Paralyzed: "frozen-orb",
  Petrified: "fossil",
  Unconscious: "sleepy",
  Spell: "lightning-helix",
  Ability: "fist",
  Advantage: "three-leaves",
  Disadvantage: "broken-heart",
});

export const CONDITION_DATA = Object.freeze({
  Grappled: { past: "grappled", verb: "grapples", icon: "[G]", emoji: "🤛" },
  Restrained: {
    past: "restrained",
    verb: "restrains",
    icon: "[R]",
    emoji: "🔒",
  },
  Prone: {
    past: "knocked prone",
    verb: "knocks",
    suffix: "prone",
    icon: "[P]",
    emoji: "🛌",
  },
  Poisoned: { past: "poisoned", verb: "poisons", icon: "[Psn]", emoji: "☠️" },
  Stunned: { past: "stunned", verb: "stuns", icon: "[Stn]", emoji: "😵" },
  Blinded: { past: "blinded", verb: "blinds", icon: "[B]", emoji: "🙈" },
  Charmed: { past: "charmed", verb: "charms", icon: "[C]", emoji: "😍" },
  Frightened: {
    past: "frightened",
    verb: "frightens",
    icon: "[F]",
    emoji: "😱",
  },
  Incapacitated: {
    past: "incapacitated",
    verb: "incapacitates",
    icon: "[I]",
    emoji: "🚫",
  },
  Invisible: {
    past: "invisible",
    verb: "makes",
    suffix: "invisible",
    icon: "[Inv]",
    emoji: "🥷",
  },
  Paralyzed: {
    past: "paralyzed",
    verb: "paralyzes",
    icon: "[Pz]",
    emoji: "❄️",
  },
  Petrified: {
    past: "petrified",
    verb: "petrifies",
    icon: "[Pet]",
    emoji: "🪨",
  },
  Unconscious: {
    past: "unconscious",
    verb: "knocks",
    suffix: "unconscious",
    icon: "[U]",
    emoji: "💤",
  },
  Spell: {
    past: "affected by a spell",
    verb: "casts a spell on",
    icon: "[Spl]",
    emoji: "🔮",
  },
  Ability: {
    past: "affected by an ability",
    verb: "uses an ability on",
    icon: "[Abl]",
    emoji: "🎯",
  },
  Advantage: {
    past: "has advantage",
    verb: "grants advantage to",
    icon: "[Adv]",
    emoji: "🍀",
    noBy: true,
  },
  Disadvantage: {
    past: "has disadvantage",
    verb: "imposes disadvantage on",
    icon: "[Dis]",
    emoji: "⬇️",
    noBy: true,
  },
});

export const STANDARD_CONDITIONS = Object.freeze(
  [
    "Grappled",
    "Restrained",
    "Prone",
    "Poisoned",
    "Stunned",
    "Blinded",
    "Charmed",
    "Frightened",
    "Incapacitated",
    "Invisible",
    "Paralyzed",
    "Petrified",
    "Unconscious",
  ].sort((a, b) => a.localeCompare(b)),
);
export const CUSTOM_EFFECT_TYPES = Object.freeze([
  CONDITION_SPELL,
  CONDITION_ABILITY,
  CONDITION_ADVANTAGE,
  CONDITION_DISADVANTAGE,
  CONDITION_OTHER,
]);
export const CUSTOM_EFFECT_TYPE_SET = Object.freeze(
  new Set(CUSTOM_EFFECT_TYPES),
);
export const CUSTOM_TEXT_CONDITIONS = Object.freeze(
  new Set([CONDITION_SPELL, CONDITION_ABILITY, CONDITION_OTHER]),
);
export const CONDITION_CHOICES = Object.freeze([
  ...STANDARD_CONDITIONS,
  ...CUSTOM_EFFECT_TYPES,
]);

export const DURATION_OPTIONS = Object.freeze([
  "Until removed",
  "End of target next turn",
  "End of source next turn",
  "1 round",
  "2 rounds",
  "3 rounds",
  "10 rounds",
]);

export const LOGO_URL_256 =
  "https://files.d20.io/images/485066521/0h0oZF8g-5RuLMztE7mTSw/original.png";
export const LOGO_URL_512 =
  "https://files.d20.io/images/485066393/v9LJk9VFfPohrzbTJ3b51Q/original.png";
export const LOGO_URL_600 =
  "https://files.d20.io/images/485066394/rqPgJDQcfjbuZDBORsV7aA/original.png";
export const LOGO_URL_1024 =
  "https://files.d20.io/images/485066395/4x8ZFtSThYT1-BE88p_OYQ/original.png";
