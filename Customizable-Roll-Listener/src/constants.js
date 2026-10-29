// Build-time placeholders replaced by rollup.config.js inject-build-metadata plugin.
export const SCRIPT_NAME = '__SCRIPT_NAME__';
export const SCRIPT_VERSION = '__BUILD_VERSION__';
export const SCRIPT_LAST_UPDATED = '__BUILD_DATE__';

export const DEFAULT_LOCALE = 'en-US';

export const STATE_KEY = 'CRL';
export const SCHEMA_VERSION = 2;
export const COMMAND = '!crl';

// Name listener commands are sent as when they are not sent as the roller.
// Version 1 used the same name, so existing macros and filters still see it.
export const CRL_SPEAKER = 'CRL';

// The character whose abilities hold each listener's commands. Version 1
// created it with this name, so existing games keep the same character.
export const STORE_CHARACTER_NAME = 'Customizable Roll Listener';

export const HANDOUT_HELP_NAME = 'Customizable Roll Listener - Help';
export const HANDOUT_DECK_NAME = 'Customizable Roll Listener - Command Deck';

export const AUTHOR_LINKS = {
  original: {
    name: 'Scott C.',
    profile: 'https://app.roll20.net/users/459831',
    wiki: 'https://wiki.roll20.net/CRL',
  },
  maintainer: {
    name: 'MidNiteShadow7',
    profile: 'https://app.roll20.net/users/16506286/midniteshadow7',
    github: 'https://github.com/steverobertsuk',
  },
};

// Marks a v2 listener's rules when they are mirrored into its ability description.
export const RULES_MARKER = 'crl';

// Roll results a listener can look for.
export const RESULT_OPTIONS = ['crit', 'fumble', 'success', 'fail'];

// Other names accepted for roll results, including the ones version 1 used.
export const RESULT_ALIASES = {
  crit: 'crit',
  critical: 'crit',
  criticals: 'crit',
  fumble: 'fumble',
  fumbles: 'fumble',
  success: 'success',
  successes: 'success',
  fail: 'fail',
  failure: 'fail',
  failures: 'fail',
};

// Chat message types. Listeners ignore 'api' messages unless they ask for them.
// Beacon sheets (such as D&D 2024) post their rolls as 'advancedroll'.
export const MESSAGE_TYPES = [
  'general',
  'rollresult',
  'gmrollresult',
  'emote',
  'whisper',
  'desc',
  'advancedroll',
  'api',
];

// Template value that matches messages without a roll template.
export const TEMPLATE_NONE = 'none';

export const SPEAKER_OPTIONS = ['crl', 'roller'];
export const LISTENER_SPEAKER_OPTIONS = ['default', 'crl', 'roller'];

// Default configuration for new installs.
export const DEFAULT_CONFIG = {
  language: DEFAULT_LOCALE,
  enabled: true,
  speaker: 'crl',
  listenToMods: true,
};

// A new listener matches everything until filters are added.
export const DEFAULT_LISTENER = {
  name: '',
  enabled: true,
  templates: [],
  types: [],
  text: [],
  regex: false,
  who: [],
  players: [],
  results: [],
  total: '',
  natural: '',
  dice: 'auto',
  cooldown: 0,
  stop: false,
  speaker: 'default',
};

// Limits on what a listener may hold.
export const MAX_NAME_LENGTH = 60;
export const MAX_COOLDOWN_SECONDS = 3600;
export const MAX_TEXT_TERMS = 20;
export const MAX_LIST_ITEMS = 50;

// Loop protection: a listener that fires this many times within the window
// is switched off, because it is almost certainly triggering itself.
export const LOOP_LIMIT = 20;
export const LOOP_WINDOW_MS = 10000;

// The inspector shows at most this many characters of a message's content.
export const INSPECT_CONTENT_LIMIT = 3000;

// Colour palette for chat cards and handouts.
export const COLOR_HEADER_BG = '#1a1f36';
export const COLOR_HEADER_TEXT = '#e6e9f5';
export const COLOR_CARD_BG_TOP = '#252c4c';
export const COLOR_CARD_BG_BOTTOM = '#161b30';
export const COLOR_BORDER = '#3b4675';
export const COLOR_TEXT = '#e3e6f2';
export const COLOR_MUTED = '#9aa3c2';
export const COLOR_ACCENT = '#f2b134';
export const COLOR_BUTTON_BG = '#2f6fd6';
export const COLOR_BUTTON_TEXT = '#ffffff';
export const COLOR_BUTTON_DARK_BG = '#2a3255';
export const COLOR_BUTTON_DARK_BORDER = '#4a5688';
export const COLOR_OK = '#7bd389';
export const COLOR_OFF = '#e07a7a';
export const COLOR_WARNING_BG = '#fef3c7';
export const COLOR_WARNING_BORDER = '#92400e';
export const COLOR_WARNING_TEXT = '#92400e';
export const COLOR_ERROR_BG = '#fee2e2';
export const COLOR_ERROR_BORDER = '#991b1b';
export const COLOR_ERROR_TEXT = '#991b1b';
