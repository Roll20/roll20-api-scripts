// Build-time placeholders replaced by rollup.config.js inject-build-metadata plugin.
export const SCRIPT_NAME = '__SCRIPT_NAME__';
export const SCRIPT_VERSION = '__BUILD_VERSION__';
export const SCRIPT_LAST_UPDATED = '__BUILD_DATE__';

export const DEFAULT_LOCALE = 'en-US';

// Version 1.0 kept its settings here, so the key is unchanged.
export const STATE_KEY = 'CONCENTRATION';
export const SCHEMA_VERSION = 2;

// The command word without "!". The GM can change it with the `command` setting.
export const DEFAULT_COMMAND = 'concentration';

// The player ID Roll20 gives chat messages sent by Mods with sendChat.
export const API_PLAYER_ID = 'API';

export const HANDOUT_HELP_NAME = 'Concentration - Help';
export const HANDOUT_DECK_NAME = 'Concentration - Command Deck';
// Journal icon (the handouts' avatar): the plain Concentration icon in Roll20's
// file store. Roll20 keeps it as `.../max.webp?<number>`, so an icon is matched
// on its image path. Only the webp files exist (thumb.png is a 404).
export const HANDOUT_ICON_PATH = '/images/506991604/a1UiVOI8fGKK8iOrNd_Cdw/';
export const HANDOUT_ICON = `https://files.d20.io${HANDOUT_ICON_PATH}thumb.webp`;

export const AUTHOR_LINKS = {
  original: {
    name: 'Robin Kuiper',
    profile: 'https://app.roll20.net/users/1226016/robin',
    patreon: 'https://www.patreon.com/robinkuiper',
  },
  maintainer: {
    name: 'MidNiteShadow7',
    profile: 'https://app.roll20.net/users/16506286/midniteshadow7',
    github: 'https://github.com/steverobertsuk',
  },
};

// Who sees concentration notices and saves.
export const SEND_TO_OPTIONS = ['everyone', 'character', 'gm'];
export const SUPPORT_MODE_OPTIONS = ['basic', 'detailed'];
export const BAR_OPTIONS = [1, 2, 3];

// Default configuration. Keys keep version 1.0's names so existing macros such
// as `!concentration config auto_roll_save|false` keep working.
export const DEFAULT_CONFIG = {
  language: DEFAULT_LOCALE,
  command: DEFAULT_COMMAND,
  statusmarker: 'stopwatch',
  bar: 1,
  send_reminder_to: 'everyone',
  auto_add_concentration_marker: true,
  auto_roll_save: true,
  show_roll_button: true,
  end_at_zero: true,
  bonus_attribute: 'constitution_save_mod',
  debug: false,
  support_mode: 'basic',
};

// Settings that take true or false.
export const TOGGLE_KEYS = [
  'auto_add_concentration_marker',
  'auto_roll_save',
  'show_roll_button',
  'end_at_zero',
  'debug',
];

// Settings the GM can change on the Mod's page in the API Scripts screen.
export const USEROPTION_KEYS = [
  'language',
  'command',
  'statusmarker',
  'bar',
  'send_reminder_to',
  'auto_add_concentration_marker',
  'auto_roll_save',
  'end_at_zero',
  'bonus_attribute',
];

// Rules for concentration saves: DC 10 or half the damage, up to DC 30.
export const MIN_SAVE_DC = 10;
export const MAX_SAVE_DC = 30;

// Roll and Advantage buttons stop working after this long.
export const PENDING_ROLL_TTL_MS = 10 * 60 * 1000;
export const MAX_PENDING_ROLLS = 100;

// Linked bars change every token of a character at once; damage seen again
// for the same character within this time is the same hit.
export const DAMAGE_DEBOUNCE_MS = 1000;

// Limits on text typed into commands.
export const MAX_SPELL_LENGTH = 80;
export const MAX_ATTRIBUTE_LENGTH = 80;

// Version 1.0's marker names, offered when the game has no custom token markers.
export const DEFAULT_MARKERS = [
  'blue',
  'brown',
  'green',
  'pink',
  'purple',
  'red',
  'yellow',
  'all-for-one',
  'angel-outfit',
  'archery-target',
  'arrowed',
  'aura',
  'back-pain',
  'black-flag',
  'bleeding-eye',
  'bolt-shield',
  'broken-heart',
  'broken-shield',
  'broken-skull',
  'chained-heart',
  'chemical-bolt',
  'cobweb',
  'dead',
  'death-zone',
  'drink-me',
  'edge-crack',
  'fishing-net',
  'fist',
  'fluffy-wing',
  'flying-flag',
  'frozen-orb',
  'grab',
  'grenade',
  'half-haze',
  'half-heart',
  'interdiction',
  'lightning-helix',
  'ninja-mask',
  'overdrive',
  'padlock',
  'pummeled',
  'radioactive',
  'rolling-tomb',
  'screaming',
  'sentry-gun',
  'skull',
  'sleepy',
  'snail',
  'spanner',
  'stopwatch',
  'strong',
  'three-leaves',
  'tread',
  'trophy',
  'white-tower',
];

// Commands listed by `help` and the Help handout, with their help keys.
export const HELP_COMMANDS = [
  ['', 'menu'],
  ['<spell>', 'toggle'],
  ['end', 'end'],
  ['status', 'status'],
  ['config [<setting>|<value>]', 'config'],
  ['advantage-menu', 'advantageMenu'],
  ['toggle-advantage <character id>', 'toggleAdvantage'],
  ['roll <id> / advantage <id>', 'roll'],
  ['journal', 'journal'],
  ['reset', 'reset'],
  ['help', 'help'],
];

// Colour palette for chat cards and handouts.
export const COLOR_HEADER_BG = '#1d2a3a';
export const COLOR_HEADER_TEXT = '#e6edf5';
export const COLOR_CARD_BG_TOP = '#26394f';
export const COLOR_CARD_BG_BOTTOM = '#17222f';
export const COLOR_BORDER = '#3a5573';
export const COLOR_TEXT = '#e2e8f0';
export const COLOR_MUTED = '#9aabbd';
export const COLOR_ACCENT = '#f6ae2d';
export const COLOR_BUTTON_BG = '#33658a';
export const COLOR_BUTTON_TEXT = '#ffffff';
export const COLOR_BUTTON_ALT_BG = '#24384d';
export const COLOR_BUTTON_ALT_BORDER = '#4a6a8c';
export const COLOR_SUCCESS = '#4ade80';
export const COLOR_FAILURE = '#f87171';
export const COLOR_WARNING_BG = '#fef3c7';
export const COLOR_WARNING_BORDER = '#92400e';
export const COLOR_WARNING_TEXT = '#92400e';
export const COLOR_ERROR_BG = '#fee2e2';
export const COLOR_ERROR_BORDER = '#991b1b';
export const COLOR_ERROR_TEXT = '#991b1b';
