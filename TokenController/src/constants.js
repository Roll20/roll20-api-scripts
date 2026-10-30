// Build-time placeholders replaced by rollup.config.js inject-build-metadata plugin.
export const SCRIPT_NAME = '__SCRIPT_NAME__';
export const SCRIPT_VERSION = '__BUILD_VERSION__';
export const SCRIPT_LAST_UPDATED = '__BUILD_DATE__';

export const DEFAULT_LOCALE = 'en-US';

export const STATE_KEY = 'TokenController';
export const SCHEMA_VERSION = 5;
export const COMMAND = '!tokencontroller';

// v4 command prefixes. Both accept the v4 subcommands as well as the v5 ones,
// so existing macros and the T-Cntrl_ macros keep working.
export const LEGACY_PREFIXES = ['!tc', '!token-control'];

export const HANDOUT_HELP_NAME = 'TokenController - Help';
export const HANDOUT_DECK_NAME = 'TokenController - Command Deck';

// v4 created this handout visible to every player. It is replaced by the
// GM-only Help handout on upgrade.
export const LEGACY_HANDOUT_NAME = 'TokenController Usage Guide';

export const AUTHOR_LINKS = {
  original: {
    name: 'Developesque',
    profile: 'https://app.roll20.net/users/6975764',
    patreon: 'https://www.patreon.com/Developesque',
  },
  maintainer: {
    name: 'MidNiteShadow7',
    profile: 'https://app.roll20.net/users/16506286/midniteshadow7',
    github: 'https://github.com/steverobertsuk',
  },
};

// Roll20 layer identifiers.
export const LAYER_TOKEN = 'objects';
export const LAYER_GM = 'gmlayer';

// Roll20 object types for drawn shapes. Jumpgate draws pathv2; Legacy draws path.
export const PATH_TYPE_LEGACY = 'path';
export const PATH_TYPE_V2 = 'pathv2';

// Roll20 pages measure width and height in 70 px units.
export const PAGE_UNIT_PX = 70;

// Route kinds: a step code ("U2R2D2L2") or a list of waypoints.
export const ROUTE_KIND_CODE = 'code';
export const ROUTE_KIND_WAYPOINTS = 'waypoints';

// Waypoint anchors: fixed to a page (drawn routes) or relative to where the
// token starts (recorded routes).
export const ANCHOR_PAGE = 'page';
export const ANCHOR_TOKEN = 'token';

// Option lists for settings and route options.
export const ROUTE_MODE_OPTIONS = ['loop', 'pingpong', 'once'];
export const MOVEMENT_OPTIONS = ['cell', 'segment'];
export const FACING_OPTIONS = ['off', 'up', 'down', 'left', 'right'];
export const COMBAT_DETECTION_OPTIONS = ['tracker', 'manual', 'both'];
export const COMBAT_BEHAVIOUR_OPTIONS = ['pause', 'step', 'ignore'];
export const LOCK_MODE_OPTIONS = ['native', 'revert', 'freeze'];
export const FOLLOW_MODE_OPTIONS = ['trail', 'formation'];
export const MANUAL_MOVE_OPTIONS = ['continue', 'stop'];

// Default configuration for new installs. Upgraded v4 games keep their own values.
export const DEFAULT_CONFIG = {
  language: DEFAULT_LOCALE,
  interval: 2000,
  movement: 'cell',
  facing: 'off',
  combatDetection: 'both',
  combatBehaviour: 'pause',
  lockMode: 'native',
  lockMarker: 'none',
  followMode: 'trail',
  manualMove: 'continue',
  buttonStep: 1,
};

// Settings the GM can change on the Mod's page in the API Scripts screen.
export const USEROPTION_KEYS = [
  'language',
  'movement',
  'facing',
  'combatDetection',
  'combatBehaviour',
  'lockMode',
  'followMode',
];

// Limits that keep a command from creating unreasonable work.
export const MIN_INTERVAL = 250;
export const MAX_INTERVAL = 600000;
export const MAX_STEP_DISTANCE = 100;
export const MAX_WAIT = 100;
export const MAX_TRACK_FRAMES = 5000;
export const MAX_NAME_LENGTH = 100;
export const MAX_BUTTON_STEP = 20;
export const MAX_TOKENS_PER_ROUTE = 500;

// How often the scheduler wakes up to check which patrols are due. Each patrol
// keeps its own due time, so routes can run at their own intervals.
export const SCHEDULER_TICK_MS = 250;

// Followers in trail mode step into the leader's previous positions; this is
// how many positions each leader remembers.
export const TRAIL_LENGTH = 50;

// Points closer than this (in pixels) are treated as the same place.
export const POSITION_EPSILON = 0.5;

// Commands listed by `help` and the Help handout, with their help keys.
export const HELP_COMMANDS = [
  ['', 'menu'],
  ['start <route>', 'start'],
  ['stop [<route>|all]', 'stop'],
  ['reset [<route>|all]', 'reset'],
  ['pause / resume', 'pause'],
  ['lock / unlock', 'lock'],
  ['leader', 'leader'],
  ['follow [<leader>]', 'follow'],
  ['unfollow', 'unfollow'],
  ['add <name> <code>', 'add'],
  ['edit <route> <code>', 'edit'],
  ['draw <name>', 'draw'],
  ['record <name>', 'record'],
  ['route <route> <option> <value>', 'route'],
  ['show <route>', 'show'],
  ['rename <route> <new name>', 'rename'],
  ['copy <route> <new name>', 'copy'],
  ['remove <route>', 'remove'],
  ['list [routes|tokens]', 'list'],
  ['examples', 'examples'],
  ['export [<route>]', 'export'],
  ['import <json>', 'import'],
  ['combat on|off', 'combat'],
  ['set [<setting> <value>]', 'set'],
  ['calibrate / calibrate reset', 'calibrate'],
  ['status', 'status'],
  ['journal rebuild', 'journal'],
  ['help', 'help'],
];

// v4's built-in example paths, offered again by `examples`.
export const EXAMPLE_ROUTES = [
  { name: 'Square', code: 'U2R2D2L2' },
  { name: 'Big Square', code: 'U3R3D3L3' },
  { name: 'Horizontal', code: 'R4L4' },
  { name: 'Vertical', code: 'U4D4' },
  { name: 'Rectangle', code: 'U1R2D1L2' },
  { name: 'Pause Square', code: 'U2WR2WD2WL2W' },
  { name: 'Zigzag', code: 'U1R1U1R1D1L1D1L1' },
  { name: 'Diamond', code: 'UR2DR2DL2UL2' },
  { name: 'Blinker', code: 'S' },
  { name: 'T-Patrol', code: 'U3U0WWR2R0WWL4WWR2D3WW' },
  { name: 'Figure-8', code: 'R2U2L2D2L2U2R2D2' },
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
export const COLOR_WARNING_BG = '#fef3c7';
export const COLOR_WARNING_BORDER = '#92400e';
export const COLOR_WARNING_TEXT = '#92400e';
export const COLOR_ERROR_BG = '#fee2e2';
export const COLOR_ERROR_BORDER = '#991b1b';
export const COLOR_ERROR_TEXT = '#991b1b';
