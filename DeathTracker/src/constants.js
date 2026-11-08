// Build-time placeholders replaced by rollup.config.js inject-build-metadata plugin.
export const SCRIPT_NAME = '__SCRIPT_NAME__';
export const SCRIPT_VERSION = '__BUILD_VERSION__';
export const SCRIPT_LAST_UPDATED = '__BUILD_DATE__';

export const DEFAULT_LOCALE = 'en-US';

export const STATE_KEY = 'DeathTracker';
// Where 0.1.x kept its settings. Read once to carry them over, then left alone
// so going back to 0.1.8 still finds them.
export const LEGACY_STATE_KEY = 'DEATHTRACKER';
export const SCHEMA_VERSION = 1;

// Commands are matched without regard to case. `!dead` was 0.1.x's command.
export const COMMAND = '!deathtracker';
export const COMMAND_ALIASES = ['!deathtracker', '!death-tracker', '!dt', '!dead'];

// The player ID Roll20 gives chat messages sent by Mods with sendChat.
export const API_PLAYER_ID = 'API';

export const HANDOUT_HELP_NAME = 'DeathTracker - Help';
// The deck's name is not translated, so it always matches the handout's name.
export const DECK_TITLE = 'Command Deck';
export const HANDOUT_DECK_NAME = `DeathTracker - ${DECK_TITLE}`;
export const MACRO_NAME = 'DeathSaves';

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

// What a token can be. A token with no readable hit points has no status.
export const STATUS = Object.freeze({
  HEALTHY: 'healthy',
  BLOODIED: 'bloodied',
  DYING: 'dying',
  STABLE: 'stable',
  DEAD: 'dead',
});
export const STATUS_LIST = Object.values(STATUS);

// The marker setting for each status that has one.
export const STATUS_MARKER_SETTING = Object.freeze({
  bloodied: 'bloodiedMarker',
  dying: 'dyingMarker',
  stable: 'stableMarker',
  dead: 'deadMarker',
});

// Roll20's built-in marker tags, used when the game's own list cannot be read.
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
// Coloured dots: markers with no picture, so they are listed without a name.
export const COLOUR_MARKERS = ['red', 'blue', 'green', 'brown', 'purple', 'pink', 'yellow'];

// Roll20's built-in effect types and colours. An effect is written "type-colour".
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
// Built-in types drawn from one point to another (0.1.x drew every effect this way).
export const BEAM_FX_TYPES = ['beam', 'breath', 'splatter'];

// Death saves on the D&D 5E (2014) sheet and others that keep them as checkboxes.
export const DEFAULT_SUCCESS_FIELDS = 'deathsave_succ1,deathsave_succ2,deathsave_succ3';
export const DEFAULT_FAILURE_FIELDS = 'deathsave_fail1,deathsave_fail2,deathsave_fail3';
export const DEATH_SAVES_NEEDED = 3;
// The D&D 2024 (Beacon) sheet keeps everything in one attribute named "store".
export const BEACON_STORE_ATTR = 'store';
export const BEACON_NPC_LAYOUT = 'Stat Block';

// How often dying characters' death saves are read when no event arrives.
export const DEATH_SAVE_POLL_MS = 3000;

export const SETTING_CHOICES = Object.freeze({
  hpBar: [1, 2, 3],
  pcDetection: ['auto', 'players'],
  deathLayer: ['none', 'gmlayer', 'map'],
  deathTurnOrder: ['keep', 'remove'],
  deathActionsFor: ['npc', 'all'],
  announce: ['off', 'gm', 'controllers'],
});

// Default settings for new installs. Tint and FX are switched off on a new
// install when HealthColors is installed (it draws its own).
export const DEFAULT_SETTINGS = {
  language: DEFAULT_LOCALE,
  hpBar: 1,
  bloodiedPercent: 50,
  bloodiedMarker: 'red',
  dyingMarker: 'sleepy',
  stableMarker: 'green',
  deadMarker: 'dead',
  pcDetection: 'auto',
  deathSaves: true,
  resetSheetSaves: true,
  successFields: DEFAULT_SUCCESS_FIELDS,
  failureFields: DEFAULT_FAILURE_FIELDS,
  massiveDamage: false,
  announce: 'controllers',
  deathLayer: 'none',
  deathTurnOrder: 'keep',
  deathActionsFor: 'npc',
  tintPlayers: true,
  tintNpcs: true,
  hurtFx: true,
  hurtFxType: 'splatter-blood',
  healFx: false,
  healFxType: 'glow-holy',
};

// Settings shown as on/off switches.
export const BOOLEAN_SETTINGS = [
  'deathSaves',
  'resetSheetSaves',
  'massiveDamage',
  'tintPlayers',
  'tintNpcs',
  'hurtFx',
  'healFx',
];
export const MARKER_SETTINGS = ['bloodiedMarker', 'dyingMarker', 'stableMarker', 'deadMarker'];

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
// Status colours in menus.
export const STATUS_COLOURS = Object.freeze({
  healthy: '#6fcf97',
  bloodied: '#f2c94c',
  dying: '#f2994a',
  stable: '#56ccf2',
  dead: '#eb5757',
});
