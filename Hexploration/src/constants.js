// Build-time placeholders replaced by rollup.config.js inject-build-metadata plugin.
export const SCRIPT_NAME = '__SCRIPT_NAME__';
export const SCRIPT_VERSION = '__BUILD_VERSION__';
export const SCRIPT_LAST_UPDATED = '__BUILD_DATE__';

export const DEFAULT_LOCALE = 'en-US';

export const STATE_KEY = 'Hexploration';
export const SCHEMA_VERSION = 2;
export const COMMAND = '!hexploration';

// v1 commands, kept so existing macros and the Hexploration_menu macro still work.
export const LEGACY_COMMANDS = {
  '!hexploration_fillPoly': 'fill',
  '!hexploration_fillInversePoly': 'fillInverse',
  '!hexploration_showMenuMain': 'menu',
  '!hexploration_configModifyProperty': 'legacyConfig',
  '!hexploration_hexModifyProperty': 'legacyHex',
};

// Separator v1 used between the arguments of its config and hex commands.
export const LEGACY_ARG_SEPARATOR = '&&';

export const HANDOUT_HELP_NAME = 'Hexploration - Help';
// The deck's name is not translated, so it always matches the handout's name.
export const DECK_TITLE = 'Command Deck';
export const HANDOUT_DECK_NAME = `Hexploration - ${DECK_TITLE}`;

export const AUTHOR_LINKS = {
  original: {
    name: 'Ada Lindberg',
    profile: 'https://app.roll20.net/users/46544/ada-l',
    marketplace: 'https://marketplace.roll20.net/browse/publisher/165/ada-lindberg',
  },
  maintainer: {
    name: 'MidNiteShadow7',
    profile: 'https://app.roll20.net/users/16506286/midniteshadow7',
    github: 'https://github.com/steverobertsuk',
  },
};

export const DEMO_GIF_URL =
  'https://raw.githubusercontent.com/Roll20/roll20-api-scripts/master/Hexploration/Hexploration.gif';

// Roll20 layer identifiers.
export const LAYER_TOKEN = 'objects';
export const LAYER_GM = 'gmlayer';
export const LAYER_FOREGROUND = 'foreground';

// Roll20 object types for drawn shapes. Jumpgate draws pathv2; Legacy draws path.
export const PATH_TYPE_LEGACY = 'path';
export const PATH_TYPE_V2 = 'pathv2';
export const PATH_TYPES = [PATH_TYPE_V2, PATH_TYPE_LEGACY];

// Status marker v1 used to flag location tokens. Still honoured as a fallback.
export const LOCATION_MARKER = 'white-tower';

// Option lists for settings.
export const HEX_LAYER_OPTIONS = ['auto', 'foreground', 'objects'];
export const REVEAL_BY_OPTIONS = ['players', 'characters', 'all'];
export const REVEAL_MODE_OPTIONS = ['clear', 'glimpse'];
export const ANNOUNCE_OPTIONS = ['all', 'gm', 'off'];

// Default configuration for new installs. Migrated v1 games keep their own values.
export const DEFAULT_CONFIG = {
  language: DEFAULT_LOCALE,
  hexLayer: 'auto',
  fillColor: '#222222',
  strokeColor: '#444444',
  labelColor: '#FFFFFF',
  glimpseColor: 'rgba(34,34,34,0.5)',
  strokeWidth: 1,
  revealDistance: 1,
  maxDistance: null,
  lineOfSight: true,
  revealPath: true,
  revealBy: 'players',
  revealMode: 'clear',
  announce: 'all',
  pingDiscoveries: false,
  hideCoveredTokens: true,
};

// Player-visible token properties switched off while a token is under a
// covered hex, because Roll20 draws nameplates, bars and auras above the
// foreground layer. Saved values are restored when the token is uncovered.
export const COVERED_TOKEN_PROPS = [
  'showplayers_name',
  'showplayers_bar1',
  'showplayers_bar2',
  'showplayers_bar3',
  'showplayers_aura1',
  'showplayers_aura2',
];

// Settings that can be overridden for a single page.
export const PAGE_SETTING_KEYS = [
  'revealDistance',
  'lineOfSight',
  'revealPath',
  'revealBy',
  'revealMode',
  'announce',
  'pingDiscoveries',
];

// Limits that keep a single command from creating an unreasonable number of objects.
export const MAX_REVEAL_DISTANCE = 20;
export const MAX_STROKE_WIDTH = 20;
export const MAX_FILL_HEXES = 20000;
export const MAX_NAME_LENGTH = 100;

// Hexes are created and removed in batches so large fills do not trip the
// API's long-running script watchdog.
export const BATCH_SIZE = 100;

// How close (as a fraction of the column step) a path's centre must be to a
// hex centre for Rescan to adopt it as a hex.
export const RESCAN_CENTRE_TOLERANCE = 0.2;

// How close (in pixels) a text label must be to a hex centre to be adopted as its name.
export const RESCAN_LABEL_TOLERANCE = 6;

// Colour palette for chat cards and handouts.
export const COLOR_HEADER_BG = '#1b2a1f';
export const COLOR_HEADER_TEXT = '#e8dcb5';
export const COLOR_CARD_BG_TOP = '#22352a';
export const COLOR_CARD_BG_BOTTOM = '#14211a';
export const COLOR_BORDER = '#3c5a45';
export const COLOR_TEXT = '#e4e0d0';
export const COLOR_MUTED = '#9aa89c';
export const COLOR_ACCENT = '#d9a441';
export const COLOR_BUTTON_BG = '#b5832a';
export const COLOR_BUTTON_TEXT = '#ffffff';
export const COLOR_WARNING_BG = '#fef3c7';
export const COLOR_WARNING_BORDER = '#92400e';
export const COLOR_WARNING_TEXT = '#92400e';
export const COLOR_ERROR_BG = '#fee2e2';
export const COLOR_ERROR_BORDER = '#991b1b';
export const COLOR_ERROR_TEXT = '#991b1b';
