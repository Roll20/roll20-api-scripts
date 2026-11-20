// Build-time placeholders replaced by rollup.config.js inject-build-metadata plugin.
export const SCRIPT_NAME = '__SCRIPT_NAME__';
export const SCRIPT_VERSION = '__BUILD_VERSION__';
export const SCRIPT_LAST_UPDATED = '__BUILD_DATE__';

export const DEFAULT_LOCALE = 'en-US';

export const STATE_KEY = 'LazyExperience';
// Where 0.1.x kept its state. Read once for migration and left in place so a rollback works.
export const LEGACY_STATE_KEY = 'LAZYEXPERIENCE';
export const SCHEMA_VERSION = 1;

export const COMMAND = '!lazyxp';
export const LONG_COMMAND = '!lazyexperience';
// 0.1.x answered to !xp. EasyExperience and ExperienceTracker use it too, so it is
// only an alias while neither of them is installed.
export const SHORT_ALIAS = '!xp';
export const CONFLICTING_GLOBALS = ['EASYEXPERIENCE', 'EXPERIENCETRACKER'];

// The player ID Roll20 gives chat messages sent by Mods with sendChat.
export const API_PLAYER_ID = 'API';

export const HANDOUT_HELP_NAME = 'LazyExperience - Help';
// The deck's name is not translated, so it always matches the handout's name.
export const DECK_TITLE = 'Command Deck';
export const HANDOUT_DECK_NAME = `LazyExperience - ${DECK_TITLE}`;
// Journal icon (the handouts' avatar): the plain LazyExperience icon in Roll20's
// file store. Roll20 keeps it as `.../max.webp?<number>`, so an icon is matched
// on its image path. Only the webp files exist (thumb.png is a 404).
export const HANDOUT_ICON_PATH = '/images/506991614/emQ4__XezYV7Y1Zl9wDy8g/';
export const HANDOUT_ICON = `https://files.d20.io${HANDOUT_ICON_PATH}thumb.webp`;
export const HANDOUT_LOG_NAME = 'LazyExperience - Session Log';

export const AUTHOR_LINKS = {
  original: {
    name: 'Robin Kuiper',
    profile: 'https://app.roll20.net/users/1226016/robin',
    github: 'https://github.com/RobinKuiper/Roll20APIScripts',
    patreon: 'https://www.patreon.com/robinkuiper',
  },
  maintainer: {
    name: 'MidNiteShadow7',
    profile: 'https://app.roll20.net/users/16506286/midniteshadow7',
    github: 'https://github.com/steverobertsuk',
  },
};

// Option lists for settings.
export const PAYOUT_OPTIONS = ['end', 'instant'];
export const ROSTER_OPTIONS = ['auto', 'party', 'players', 'manual'];
export const KILL_MODE_OPTIONS = ['prompt', 'auto', 'off'];
export const NOTICE_OPTIONS = ['public', 'whisper', 'gm', 'off'];
export const BAR_OPTIONS = [1, 2, 3];

// Default configuration for new installs. Migrated 0.1.x games keep their own values.
export const DEFAULT_CONFIG = {
  language: DEFAULT_LOCALE,
  payout: 'end',
  updateSheets: true,
  system: 'auto',
  pf1Track: 'medium',
  roster: 'auto',
  absentShare: 0,
  extraShares: 0,
  killMode: 'prompt',
  killBar: true,
  hpBar: 1,
  killMarker: true,
  marker: 'dead',
  killDeathTracker: true,
  announce: 'public',
  levelNotice: 'public',
  customXp: 'experience',
  customLevel: 'level',
  customNpcXp: 'npc_xp',
  customNpcCr: 'npc_challenge',
  customLevels: '',
};

// Settings shown on the settings card, in order, and how each one is edited.
export const SETTING_TYPES = {
  language: 'locale',
  payout: PAYOUT_OPTIONS,
  updateSheets: 'boolean',
  system: 'system',
  pf1Track: 'track',
  roster: ROSTER_OPTIONS,
  absentShare: 'share',
  extraShares: 'count',
  killMode: KILL_MODE_OPTIONS,
  killBar: 'boolean',
  hpBar: BAR_OPTIONS,
  killMarker: 'boolean',
  marker: 'marker',
  killDeathTracker: 'boolean',
  announce: NOTICE_OPTIONS,
  levelNotice: NOTICE_OPTIONS,
  customXp: 'field',
  customLevel: 'field',
  customNpcXp: 'field',
  customNpcCr: 'field',
  customLevels: 'levels',
};

// Limits that keep a single command sensible.
export const MAX_XP = 10000000;
export const MAX_EXTRA_SHARES = 20;
export const MAX_REASON_LENGTH = 120;
export const MAX_LOGGED_SESSIONS = 50;
export const MAX_AWARDS_PER_SESSION = 500;

// How long a token handled through change:attribute is ignored by change:graphic, so
// one HP drop is not seen twice.
export const RECENT_ATTR_MS = 250;

// Built-in Roll20 status markers (without the status_ prefix).
export const BUILTIN_MARKERS = [
  'red',
  'blue',
  'green',
  'brown',
  'purple',
  'pink',
  'yellow',
  'dead',
  'skull',
  'sleepy',
  'half-heart',
  'half-haze',
  'interdiction',
  'snail',
  'lightning-helix',
  'spanner',
  'chained-heart',
  'chemical-bolt',
  'death-zone',
  'drink-me',
  'edge-crack',
  'ninja-mask',
  'stopwatch',
  'fishing-net',
  'overdrive',
  'strong',
  'fist',
  'padlock',
  'three-leaves',
  'fluffy-wing',
  'pummeled',
  'tread',
  'arrowed',
  'aura',
  'back-pain',
  'black-flag',
  'bleeding-eye',
  'bolt-shield',
  'broken-heart',
  'cobweb',
  'broken-shield',
  'flying-flag',
  'radioactive',
  'trophy',
  'broken-skull',
  'frozen-orb',
  'rolling-bomb',
  'white-tower',
  'grab',
  'screaming',
  'grenade',
  'sentry-gun',
  'all-for-one',
  'angel-outfit',
  'archery-target',
];

// Colour palette for chat cards and handouts: parchment gold on deep violet.
export const COLOR_HEADER_BG = '#2a1d3d';
export const COLOR_HEADER_TEXT = '#f2deb0';
export const COLOR_CARD_BG_TOP = '#33264a';
export const COLOR_CARD_BG_BOTTOM = '#1e1530';
export const COLOR_BORDER = '#5a4680';
export const COLOR_TEXT = '#ebe4f5';
export const COLOR_MUTED = '#b3a7c9';
export const COLOR_ACCENT = '#e3b04b';
export const COLOR_BUTTON_BG = '#b8862b';
export const COLOR_BUTTON_TEXT = '#ffffff';
export const COLOR_WARNING_BG = '#fef3c7';
export const COLOR_WARNING_BORDER = '#92400e';
export const COLOR_WARNING_TEXT = '#92400e';
export const COLOR_ERROR_BG = '#fee2e2';
export const COLOR_ERROR_BORDER = '#991b1b';
export const COLOR_ERROR_TEXT = '#991b1b';
