export const SCRIPT_NAME = '__SCRIPT_NAME__';
export const SCRIPT_FILE = '__SCRIPT_FILE__';
export const SCRIPT_VERSION = '__BUILD_VERSION__';
export const SCRIPT_LAST_UPDATED = '__BUILD_DATE__';

export { DEFAULT_LOCALE, SUPPORTED_LOCALES, VALID_LOCALES } from './locales/metadata.js';

export const COLOR_BG_SOFT_BLACK = '#0A0A12';
export const COLOR_TEXT_ARCANE_SILVER = '#E6DFFF';
export const COLOR_TEXT_DIM_SILVER = '#B8AFCF';
export const COLOR_ACCENT_LIGHT = '#FF4D6D';
export const COLOR_ACCENT_DARK = '#5B21B6';
export const COLOR_HEADER_LIGHT = '#E9D5FF';
export const COLOR_HEADER_DARK = '#1E40AF';
export const COLOR_TEXT_WHITE = '#FFFFFF';

export const STATE_KEY = SCRIPT_NAME.replaceAll(/\s+/g, '');
export const HANDOUT_NAME = `${SCRIPT_NAME} — Help & Reference`;
export const MACRO_NAME = `${STATE_KEY}Wizard`;
export const MACRO_NAME_MULTI_TARGET = `${STATE_KEY}MultiTarget`;
export const MACRO_NAME_REPORT_TOKEN = `${STATE_KEY}ReportToken`;
export const COMMAND = '!condition-tracker';
export const COMMAND_HELP = `${COMMAND} --help`;
export const COMMAND_PROMPT = `${COMMAND} --prompt`;
export const COMMAND_MULTI_TARGET = `${COMMAND} --multi-target`;
export const COMMAND_REPORT_TOKEN = `${COMMAND} --report-token`;
export const TURN_ORDER_PREFIX = `${STATE_KEY}:`;
export const TOKEN_MARKER_SEPARATOR = ',';
export const EMPTY_TURN_ORDER = '[]';
export const VALID_HEALTH_BARS = ['bar1_value', 'bar2_value', 'bar3_value'];
export const BOOLEAN_TEXT = new Set(['true', 'false']);
export const DURATION_UNTIL_REMOVED = 'untilRemoved';
export const DURATION_TURN_END = 'turnEnd';
export const DURATION_ROUNDS = 'rounds';
export const MENU_REMOVE = 'remove';
export const COMMAND_SAVED = `${COMMAND} --saved`;
export const MACRO_NAME_SAVED = `${STATE_KEY}Saved`;
export const COMMAND_CLASSIFY = `${COMMAND} --classify`;
export const MACRO_NAME_CLASSIFY = `${STATE_KEY}Classify`;
export const DEFAULT_MACRO_BODY = `${COMMAND_PROMPT}`;
export const DEFAULT_MULTI_TARGET_MACRO_BODY = `${COMMAND_MULTI_TARGET}`;
export const DEFAULT_REPORT_TOKEN_MACRO_BODY = `${COMMAND_REPORT_TOKEN}`;
export const DEFAULT_SAVED_MACRO_BODY = COMMAND_SAVED;
export const DEFAULT_CLASSIFY_MACRO_BODY = `${COMMAND_CLASSIFY} show`;

export const SAVED_VISIBILITY_PUBLIC = 'public';
export const SAVED_VISIBILITY_MASKED = 'masked';
export const SAVED_VISIBILITY_GM = 'gm';
export const VALID_SAVED_VISIBILITIES = Object.freeze(
  new Set([SAVED_VISIBILITY_PUBLIC, SAVED_VISIBILITY_MASKED, SAVED_VISIBILITY_GM])
);

export const SAVED_SNOOZE_TURN = 'turn';
export const SAVED_SNOOZE_ROUNDS = 'rounds';
export const SAVED_SNOOZE_COMBAT = 'combat';
export const VALID_SNOOZE_SCOPES = Object.freeze(
  new Set([SAVED_SNOOZE_TURN, SAVED_SNOOZE_ROUNDS, SAVED_SNOOZE_COMBAT])
);

// Canonical custom-effect-type keys — stable across all game systems.
// System profiles choose which subset to surface in the wizard UI.
export const CONDITION_OTHER = 'Other';
export const CONDITION_SPELL = 'Spell';
export const CONDITION_ABILITY = 'Ability';
export const CONDITION_ADVANTAGE = 'Advantage';
export const CONDITION_DISADVANTAGE = 'Disadvantage';

// Full set of all canonical custom-effect-type keys (used for validation).
export const CANONICAL_CUSTOM_TYPES = Object.freeze(
  new Set([
    CONDITION_SPELL,
    CONDITION_ABILITY,
    CONDITION_ADVANTAGE,
    CONDITION_DISADVANTAGE,
    CONDITION_OTHER,
  ])
);

// Custom types that always require free-text input via --other.
export const CANONICAL_TEXT_CONDITIONS = Object.freeze(
  new Set([CONDITION_SPELL, CONDITION_ABILITY, CONDITION_OTHER])
);

export const DURATION_OPTIONS = Object.freeze([
  'Until removed',
  'End of target next turn',
  'End of source next turn',
  '1 round',
  '2 rounds',
  '3 rounds',
  '10 rounds',
]);

export const LOGO_URL_256 =
  'https://files.d20.io/images/485066521/0h0oZF8g-5RuLMztE7mTSw/original.png';
export const LOGO_URL_512 =
  'https://files.d20.io/images/485066393/v9LJk9VFfPohrzbTJ3b51Q/original.png';
export const LOGO_URL_600 =
  'https://files.d20.io/images/485066394/rqPgJDQcfjbuZDBORsV7aA/original.png';
export const LOGO_URL_1024 =
  'https://files.d20.io/images/485066395/4x8ZFtSThYT1-BE88p_OYQ/original.png';
