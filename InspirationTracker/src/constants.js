// Build-time placeholders replaced by rollup.config.js inject-build-metadata plugin.
export const SCRIPT_NAME = '__SCRIPT_NAME__';
export const SCRIPT_VERSION = '__BUILD_VERSION__';
export const SCRIPT_LAST_UPDATED = '__BUILD_DATE__';

export const DEFAULT_LOCALE = 'en-US';

export const STATE_KEY = 'InspirationTracker';
export const SCHEMA_VERSION = 1;
export const COMMAND = '!inspiration';

// 0.1.x kept its settings here, including a GM-chosen command name.
export const LEGACY_STATE_KEY = 'INSPIRATIONTRACKER';

// The player ID Roll20 gives chat messages sent by Mods with sendChat.
export const API_PLAYER_ID = 'API';

export const HANDOUT_HELP_NAME = 'InspirationTracker - Help';
export const HANDOUT_DECK_NAME = 'InspirationTracker - Command Deck';
// Journal icon (the handouts' avatar): the plain InspirationTracker icon in Roll20's
// file store. Roll20 keeps it as `.../max.webp?<number>`, so an icon is matched
// on its image path. Only the webp files exist (thumb.png is a 404).
export const HANDOUT_ICON_PATH = '/images/506991612/MVQIb3bWgcO-XABFmcaezw/';
export const HANDOUT_ICON = `https://files.d20.io${HANDOUT_ICON_PATH}thumb.webp`;

// The token action macro players use to spend inspiration.
export const MACRO_NAME = 'Inspiration';

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

// Sheet attribute and item names.
// The 2014 OGL sheet stores a checkbox attribute ("on" when ticked).
export const LEGACY_ATTRIBUTE = 'inspiration';
// The D&D 2024 (Beacon) sheet exposes a 0/1 sheet item, kept inside the
// character's `store` attribute.
export const BEACON_ITEM = 'inspiration';
export const BEACON_STORE_ATTRIBUTE = 'store';

// Rules editions, used for wording and the 2024 pass-on rule.
export const RULES_2014 = '2014';
export const RULES_2024 = '2024';

// Option lists for settings.
export const TRACKING_OPTIONS = ['flag', 'pool'];
export const WORDING_OPTIONS = ['auto', RULES_2014, RULES_2024];
export const ANNOUNCE_OPTIONS = ['public', 'gm', 'off'];

// Roll20's built-in coloured dots. They are not listed in the campaign's
// token marker sets, so they are offered alongside them.
export const COLOUR_MARKERS = ['red', 'blue', 'green', 'brown', 'purple', 'pink', 'yellow'];

// The D&D 2024 sheet draws its own condition markers; they are left alone.
export const SHEET_MARKER_PREFIX = 'sheet-';

// Default configuration for new installs. Upgraded 0.1.x games keep their marker
// and special effect.
export const DEFAULT_CONFIG = {
  language: DEFAULT_LOCALE,
  tracking: 'flag',
  marker: 'black-flag',
  wording: 'auto',
  announce: 'public',
  fx: true,
  fxType: 'nova-holy',
  playerSpend: true,
  playerOverview: false,
  passOn: true,
};

// Settings the GM can change on the Mod's page in the API Scripts screen.
export const USEROPTION_KEYS = ['language', 'wording', 'playerOverview'];

// Settings shown in the settings menu, in order.
export const SETTING_KEYS = [
  'language',
  'tracking',
  'marker',
  'wording',
  'announce',
  'fx',
  'fxType',
  'playerSpend',
  'playerOverview',
  'passOn',
];

// Points pools: counters a GM can award and players can spend, such as a pool
// of inspiration points, hero points or luck. A pool is kept in the sheet's
// resource box with the pool's name, or in a plain attribute.
export const POOL_SOURCES = ['resource', 'attribute'];
export const POOL_FIELDS = ['name', 'source', 'cost', 'max', 'marker'];
export const DEFAULT_POOL = {
  id: 'inspiration',
  name: 'Inspiration',
  source: 'resource',
  cost: 1,
  max: 0,
  marker: '',
};
export const MAX_POOLS = 8;
export const MAX_POINTS = 9999;
// A pool's plain attribute is its ID with this ending: "inspiration_pool".
export const POOL_ATTRIBUTE_SUFFIX = '_pool';

// Roll20's built-in special effect names ("type-colour").
export const FX_TYPES = [
  'beam',
  'bomb',
  'breath',
  'bubbling',
  'burn',
  'burst',
  'explode',
  'glow',
  'missile',
  'nova',
  'splatter',
];
export const FX_COLOURS = [
  'acid',
  'blood',
  'charm',
  'death',
  'fire',
  'frost',
  'holy',
  'magic',
  'slime',
  'smoke',
  'water',
];

// How many spends can be undone, and for how long an offer to pass on
// Heroic Inspiration stays open.
export const MAX_UNDO = 30;
export const OFFER_LIFETIME_MS = 60 * 60 * 1000;

// Commands listed by `help` and the Help handout, with their help keys.
export const HELP_COMMANDS = [
  ['', 'menu'],
  ['give', 'give'],
  ['remove', 'remove'],
  ['toggle', 'toggle'],
  ['spend', 'spend'],
  ['party', 'party'],
  ['party add / party remove', 'partyEdit'],
  ['give | remove | toggle | spend --ids <id;id;…>', 'ids'],
  ['give | remove | spend <points>', 'points'],
  ['boost <bonus>', 'boost'],
  ['give | remove | spend | boost | party --pool <name>', 'poolFlag'],
  ['pools', 'pools'],
  ['pool add <name> / pool delete <name>', 'poolEdit'],
  ['pool set <name> <name|source|cost|max|marker> <value>', 'poolSet'],
  ['undo <id>', 'undo'],
  ['macro', 'macro'],
  ['sync', 'sync'],
  ['set [<setting> <value>]', 'set'],
  ['reset', 'reset'],
  ['status', 'status'],
  ['journal rebuild', 'journal'],
  ['help', 'help'],
];

// Colour palette for chat cards and handouts.
export const COLOR_HEADER_BG = '#2a2140';
export const COLOR_HEADER_TEXT = '#f3eefc';
export const COLOR_CARD_BG_TOP = '#3a2d59';
export const COLOR_CARD_BG_BOTTOM = '#1f1830';
export const COLOR_BORDER = '#5b4a85';
export const COLOR_TEXT = '#ece6f7';
export const COLOR_MUTED = '#b3a8cc';
export const COLOR_ACCENT = '#f2c94c';
export const COLOR_BUTTON_BG = '#6a4fb3';
export const COLOR_BUTTON_TEXT = '#ffffff';
export const COLOR_BUTTON_ALT_BG = '#2f2548';
export const COLOR_BUTTON_ALT_BORDER = '#6d5c99';
export const COLOR_WARNING_BG = '#fef3c7';
export const COLOR_WARNING_BORDER = '#92400e';
export const COLOR_WARNING_TEXT = '#92400e';
export const COLOR_ERROR_BG = '#fee2e2';
export const COLOR_ERROR_BORDER = '#991b1b';
export const COLOR_ERROR_TEXT = '#991b1b';

// The inspiration icon Robin Kuiper's 0.1.x showed on its chat cards.
export const ICON_URL =
  'https://s3.amazonaws.com/files.d20.io/images/39783029/-w45_4ICV9QnFzijBimwKA/max.png';
