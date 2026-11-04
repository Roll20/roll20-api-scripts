// Build-time placeholders replaced by rollup.config.js inject-build-metadata plugin.
export const SCRIPT_NAME = '__SCRIPT_NAME__';
export const SCRIPT_VERSION = '__BUILD_VERSION__';
export const SCRIPT_LAST_UPDATED = '__BUILD_DATE__';

export const DEFAULT_LOCALE = 'en-US';

// 0.0.9 kept its settings in state.RESIZER, so 1.0 keeps the same branch and
// upgrades it in place.
export const STATE_KEY = 'RESIZER';
export const SCHEMA_VERSION = 2;

// The main command. GMs could rename it in 0.0.9 (config command|name); a
// renamed command keeps working as well as these.
export const COMMAND = '!resizer';
export const COMMAND_ALIASES = ['!resizer', '!rsz'];
export const DEFAULT_COMMAND_NAME = 'resizer';
export const MAX_COMMAND_NAME_LENGTH = 30;

// The player ID Roll20 gives chat messages sent by Mods with sendChat.
export const API_PLAYER_ID = 'API';

export const HANDOUT_HELP_NAME = 'Resizer - Help';
// The deck's name is not translated, so it always matches the handout's name.
export const DECK_TITLE = 'Command Deck';
export const HANDOUT_DECK_NAME = `Resizer - ${DECK_TITLE}`;

export const AUTHOR_LINKS = {
  original: {
    name: 'Robin Kuiper',
    profile: 'https://app.roll20.net/users/1226016/robin',
    thread: 'https://app.roll20.net/forum/post/6285519/script-resizer/',
  },
  maintainer: {
    name: 'MidNiteShadow7',
    profile: 'https://app.roll20.net/users/16506286/midniteshadow7',
    github: 'https://github.com/steverobertsuk',
  },
};

// Pixels in one Roll20 page unit. A grid cell is this times the page's
// snapping increment.
export const PIXELS_PER_UNIT = 70;

// Zoom factors allowed in one command.
export const MIN_ZOOM = 0.05;
export const MAX_ZOOM = 20;

// Largest page Roll20 allows, in page units.
export const MAX_PAGE_UNITS = 1000;

// Undo history: changes kept, and the most characters they may take in state
// (the history is stored with the game, so it is kept small).
export const UNDO_DEPTH = 10;
export const MAX_UNDO_CHARS = 400000;

// Creature sizes, in grid cells across (D&D sizes; Tiny shares a cell).
export const CREATURE_SIZES = {
  tiny: 0.5,
  small: 1,
  medium: 1,
  large: 2,
  huge: 3,
  gargantuan: 4,
};

// Units for sizes typed with size and page.
export const SIZE_UNITS = ['px', 'cells', 'units'];

// Most selected objects listed by name in one reply.
export const MAX_LISTED = 12;

// Most pages one picker card lists.
export const MAX_PICKER_PAGES = 40;

// Default settings for new installs.
export const DEFAULT_SETTINGS = {
  language: DEFAULT_LOCALE,
  command: DEFAULT_COMMAND_NAME,
  keepTokenSize: false,
  scaleStrokes: true,
  deleteCalibrationBox: true,
};

// Colour palette for chat cards and handouts.
export const COLOR_HEADER_BG = '#0e2a30';
export const COLOR_HEADER_TEXT = '#dff7f4';
export const COLOR_CARD_BG_TOP = '#15404a';
export const COLOR_CARD_BG_BOTTOM = '#0b1f24';
export const COLOR_BORDER = '#2b6f78';
export const COLOR_TEXT = '#e6f4f2';
export const COLOR_MUTED = '#9cc3c0';
export const COLOR_ACCENT = '#3fd1c0';
export const COLOR_BUTTON_BG = '#0f8a80';
export const COLOR_BUTTON_TEXT = '#ffffff';
export const COLOR_BUTTON2_BG = '#163a40';
export const COLOR_BUTTON2_BORDER = '#2f7d85';
export const COLOR_WARNING_BG = '#fef3c7';
export const COLOR_WARNING_BORDER = '#92400e';
export const COLOR_WARNING_TEXT = '#92400e';
export const COLOR_ERROR_BG = '#fee2e2';
export const COLOR_ERROR_BORDER = '#991b1b';
export const COLOR_ERROR_TEXT = '#991b1b';

// Every command, with the key of its description under help.*. Shared by the
// chat help card and the Help handout.
export const COMMAND_LIST = [
  ['', 'menu'],
  ['size <width> <height> [px|cells|units]', 'size'],
  ['size tiny|small|medium|large|huge|gargantuan', 'creature'],
  ['fit [--keep-ratio]', 'fit'],
  ['center [both|h|v]', 'center'],
  ['calibrate [across] [down] [--fit-page] [--keep-box]', 'calibrate'],
  ['calibrate --cell <px> [--fit-page]', 'calibrateCell'],
  ['page [<width> <height> [units|cells|px]]', 'page'],
  ['zoom <factor> [--pages …] [--keep-tokens|--scale-tokens]', 'zoom'],
  ['pages | pick <page>|all|none', 'pages'],
  ['undo', 'undo'],
  ['history [clear]', 'history'],
  ['settings | set <setting> <value>', 'settings'],
  ['reset', 'reset'],
  ['journal rebuild', 'journal'],
  ['help', 'help'],
];
