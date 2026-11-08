// Build-time placeholders replaced by rollup.config.js inject-build-metadata plugin.
export const SCRIPT_NAME = '__SCRIPT_NAME__';
export const SCRIPT_VERSION = '__BUILD_VERSION__';
export const SCRIPT_LAST_UPDATED = '__BUILD_DATE__';

export const DEFAULT_LOCALE = 'en-US';

export const STATE_KEY = 'PageFX';
export const SCHEMA_VERSION = 2;

// Commands are matched without regard to case, so v1's `!pageFX on` and
// `!pageFX off` reach the same handlers as `!pagefx on` and `!pagefx off`.
export const COMMAND = '!pagefx';
export const COMMAND_ALIASES = ['!pagefx', '!page-fx'];

// The player ID Roll20 gives chat messages sent by Mods with sendChat.
export const API_PLAYER_ID = 'API';

// v1 marked effects and no-effect areas by token name, and disabled an effect
// with the interdiction status marker. All three are still honoured.
export const V1_EFFECT_NAME = 'PageFX';
export const V1_NULL_NAME = 'NullFX';
export const V1_DISABLE_MARKER = 'interdiction';

export const HANDOUT_HELP_NAME = 'PageFX - Help';
// The deck's name is not translated, so it always matches the handout's name.
export const DECK_TITLE = 'Command Deck';
export const HANDOUT_DECK_NAME = `PageFX - ${DECK_TITLE}`;

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
  'https://raw.githubusercontent.com/Roll20/roll20-api-scripts/master/PageFX/PageFX.gif';

// Roll20's built-in effect types and colours. An effect is written "type-colour".
export const BUILTIN_TYPES = [
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
export const BUILTIN_COLOURS = [
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
// Built-in types drawn from one point to another.
export const BEAM_TYPES = ['beam', 'breath', 'splatter'];
// Names v1 accepted for built-in types.
export const BUILTIN_TYPE_ALIASES = { explosion: 'explode' };

// Values Roll20 needs in every custom FX definition. Jumpgate draws a
// definition that lacks one as black squares that never fade (seen with a
// missing lifeSpanRandom, 4 November 2026), so missing values are filled in.
export const CUSTOM_FX_DEFAULTS = Object.freeze({
  maxParticles: 100,
  duration: 25,
  emissionRate: 5,
  size: 15,
  sizeRandom: 0,
  lifeSpan: 20,
  lifeSpanRandom: 0,
  speed: 3,
  speedRandom: 0,
  angle: 0,
  angleRandom: 360,
  startColour: [255, 255, 255, 1],
  startColourRandom: [0, 0, 0, 0],
  endColour: [0, 0, 0, 0],
  endColourRandom: [0, 0, 0, 0],
});

// A saved custom FX whose angle is -1 is drawn from one point to another.
export const BEAM_ANGLE = -1;

// Custom FX objects PageFX makes for itself start with this name, so they are
// easy to tell apart from the GM's own in Roll20's FX list.
export const OWNED_FX_PREFIX = 'PageFX: ';

// Pixels in one Roll20 page unit (one grid cell at snapping increment 1).
export const PIXELS_PER_UNIT = 70;

// Spawn interval used when a v1 token has no Bar 1 value, as in v1.
export const DEFAULT_INTERVAL_MS = 100;
// Shortest delay between two spawns of one layer, whatever the intensity.
export const MIN_DELAY_MS = 20;
export const MAX_INTERVAL_MS = 600000;

export const MIN_INTENSITY = 0.1;
export const MAX_INTENSITY = 5;

// Spawns per second allowed on one page (measured smooth up to 60 in Jumpgate).
export const DEFAULT_MAX_SPAWNS_PER_SECOND = 30;
export const MAX_SPAWNS_PER_SECOND_LIMIT = 60;
export const RATE_WINDOW_MS = 1000;

// How often the live pages are checked for moves Roll20 raises no event for.
export const LIVE_PAGE_CHECK_MS = 3000;

export const MAX_NAME_LENGTH = 60;
export const MAX_LAYERS = 8;

// New effects made from the chat menu: time between spawns, and the size of
// the area (in grid cells) given to a token that has no Aura 1 yet.
export const NEW_EFFECT_INTERVAL_MS = [500, 1500];
export const NEW_EFFECT_AREA_CELLS = 3;
export const NEW_EFFECT_NAME = 'PageFX';

// Most effect cards one command shows, and most spawns one `fire` makes per layer.
export const MAX_EDIT_CARDS = 5;
export const MAX_FIRE_COUNT = 20;

// Default settings for new installs.
export const DEFAULT_SETTINGS = {
  language: DEFAULT_LOCALE,
  gmPagePreview: false,
  intensity: 1,
  maxSpawnsPerSecond: DEFAULT_MAX_SPAWNS_PER_SECOND,
};

// Colour palette for chat cards and handouts.
export const COLOR_HEADER_BG = '#1d1638';
export const COLOR_HEADER_TEXT = '#e6dfff';
export const COLOR_CARD_BG_TOP = '#2a1f4f';
export const COLOR_CARD_BG_BOTTOM = '#151027';
export const COLOR_BORDER = '#4b3a85';
export const COLOR_TEXT = '#ece8f7';
export const COLOR_MUTED = '#a99fc9';
export const COLOR_ACCENT = '#b388ff';
export const COLOR_BUTTON_BG = '#6a0dad';
export const COLOR_BUTTON_TEXT = '#ffffff';
export const COLOR_BUTTON2_BG = '#2f2556';
export const COLOR_BUTTON2_BORDER = '#5b4a99';
export const COLOR_WARNING_BG = '#fef3c7';
export const COLOR_WARNING_BORDER = '#92400e';
export const COLOR_WARNING_TEXT = '#92400e';
export const COLOR_ERROR_BG = '#fee2e2';
export const COLOR_ERROR_BORDER = '#991b1b';
export const COLOR_ERROR_TEXT = '#991b1b';
