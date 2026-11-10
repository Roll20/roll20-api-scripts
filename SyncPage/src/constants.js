// Build-time placeholders replaced by rollup.config.js inject-build-metadata plugin.
export const SCRIPT_NAME = '__SCRIPT_NAME__';
export const SCRIPT_VERSION = '__BUILD_VERSION__';
export const SCRIPT_LAST_UPDATED = '__BUILD_DATE__';

export const DEFAULT_LOCALE = 'en-US';

export const STATE_KEY = 'SyncPage';
// Where 0.1.x kept its settings and links. Read once to carry them over, then
// left alone so going back to 0.1.9 still finds them.
export const LEGACY_STATE_KEY = 'SYNCPAGE';
export const SCHEMA_VERSION = 1;

// Commands are matched without regard to case. `!sync` was 0.1.x's command.
export const COMMAND = '!syncpage';
export const COMMAND_ALIASES = ['!syncpage', '!sync-page', '!sync'];

export const HANDOUT_HELP_NAME = 'SyncPage - Help';
// The deck's name is not translated, so it always matches the handout's name.
export const DECK_TITLE = 'Command Deck';
export const HANDOUT_DECK_NAME = `SyncPage - ${DECK_TITLE}`;
// Journal icon (the handouts' avatar): the plain SyncPage icon in Roll20's
// file store. Roll20 keeps it as `.../max.webp?<number>`, so an icon is matched
// on its image path. Only the webp files exist (thumb.png is a 404).
export const HANDOUT_ICON_PATH = '/images/506962428/QIXCGGweq2LZqLjRtfP98w/';
export const HANDOUT_ICON = `https://files.d20.io${HANDOUT_ICON_PATH}thumb.webp`;

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

// Object types SyncPage mirrors. Jumpgate lights are graphics, so they need no
// type of their own; fog masks are not API objects and stay per page.
export const SYNC_TYPES = ['graphic', 'text', 'path', 'pathv2', 'door', 'window'];
export const LAYERS = ['map', 'objects', 'gmlayer', 'foreground', 'walls'];
export const HIDDEN_LAYER = 'gmlayer';

// Keys never copied or compared, whatever the type.
export const NEVER_SYNC_KEYS = ['pageid', 'id', 'type'];
// Keys left out when matching objects or looking for drift. Roll20's Duplicate
// Page gives drawings to the GM and recolours doors and windows.
export const IGNORE_FOR_MATCH = {
  graphic: [],
  text: ['controlledby'],
  path: ['controlledby'],
  pathv2: ['controlledby'],
  door: ['color'],
  window: ['color'],
};

// Groups of token properties a GM can keep per page (setting localProps).
// Entries ending in * match every key with that start.
export const PROP_SETS = Object.freeze({
  gmnotes: ['gmnotes'],
  name: [
    'name',
    'showname',
    'showplayers_name',
    'playersedit_name',
    'tooltip',
    'show_tooltip',
    'gm_only_tooltip',
  ],
  bars: [
    'bar1_*',
    'bar2_*',
    'bar3_*',
    'bar4_*',
    'showplayers_bar*',
    'playersedit_bar*',
    'bar_location',
    'compact_bar',
  ],
  markers: ['statusmarkers'],
  tint: ['tint_color'],
  aura: ['aura1_*', 'aura2_*', 'showplayers_aura*', 'playersedit_aura*'],
  vision: [
    'light_hassight',
    'has_bright_light_vision',
    'has_night_vision',
    'night_vision_*',
    'has_limit_field_of_vision',
    'limit_field_of_vision_*',
    'has_limit_field_of_night_vision',
    'limit_field_of_night_vision_*',
    'adv_fow_view_distance',
    'light_sensitivity_multiplier',
    'light_losangle',
  ],
  light: [
    'light_radius',
    'light_dimradius',
    'light_otherplayers',
    'light_angle',
    'light_multiplier',
    'emits_*',
    'bright_light_distance',
    'low_light_distance',
    'has_directional_*',
    'directional_*',
    'dim_light_opacity',
    'lightColor',
  ],
  controlledby: ['controlledby'],
});

// Groups of page settings a GM can keep per page (setting localPageSettings).
export const PAGE_SETS = Object.freeze({
  lighting: [
    'dynamic_lighting_enabled',
    'showlighting',
    'showdarkness',
    'lightenforcelos',
    'lightrestrictmove',
    'lightglobalillum',
    'lightupdatedrop',
  ],
  daylight: ['daylight_mode_enabled', 'daylightModeOpacity', 'darknessEffect'],
  explorer: ['explorer_mode', 'adv_fow_enabled', 'adv_fow_dim_reveals', 'adv_fow_show_grid'],
  fog: ['fog_opacity'],
  grid: [
    'showgrid',
    'grid_type',
    'grid_opacity',
    'gridcolor',
    'gridlabels',
    'snapping_increment',
    'grid_offset_x',
    'grid_offset_y',
    'diagonaltype',
  ],
  background: ['background_color', 'useAutoWrapper', 'wrapperColor'],
  scale: ['scale_number', 'scale_units', 'width', 'height'],
  jukebox: ['jukeboxtrigger'],
});
// Page keys never mirrored: the name is the page's own, archiving one copy
// must not archive the rest, and force_lighting_refresh is a one-off trigger.
export const PAGE_NEVER_SYNC = ['name', 'archived', 'force_lighting_refresh'];

/**
 * The settings table. It drives the settings card, `set` checking, One-Click
 * user options and the Help handout. Scope `group` settings can be
 * overridden per sync group; `global` ones cannot.
 */
export const SETTINGS = Object.freeze([
  {
    key: 'deleteMode',
    type: 'choice',
    options: ['all', 'source', 'unlink', 'ask'],
    default: 'all',
    scope: 'group',
  },
  {
    key: 'hideMode',
    type: 'choice',
    options: ['gmlayer', 'remove'],
    default: 'gmlayer',
    scope: 'group',
  },
  {
    key: 'pairLeftovers',
    type: 'choice',
    options: ['ask', 'copy', 'leave'],
    default: 'ask',
    scope: 'group',
  },
  {
    key: 'newObjects',
    type: 'choice',
    options: ['mirror', 'sourceOnly'],
    default: 'mirror',
    scope: 'group',
  },
  {
    key: 'localProps',
    type: 'multi',
    options: Object.keys(PROP_SETS),
    default: [],
    scope: 'group',
  },
  {
    key: 'localPageSettings',
    type: 'multi',
    options: Object.keys(PAGE_SETS),
    default: [],
    scope: 'group',
  },
  { key: 'excludeLayers', type: 'multi', options: LAYERS, default: [], scope: 'group' },
  { key: 'syncPageSettings', type: 'boolean', default: true, scope: 'group' },
  {
    key: 'repairOnStart',
    type: 'choice',
    options: ['quiet', 'report', 'off'],
    default: 'quiet',
    scope: 'global',
  },
  { key: 'playerMenu', type: 'choice', options: ['gm', 'players'], default: 'gm', scope: 'global' },
  { key: 'recycleSize', type: 'number', min: 1, max: 100, default: 25, scope: 'global' },
  { key: 'language', type: 'locale', default: DEFAULT_LOCALE, scope: 'global' },
]);
export const SETTING_KEYS = SETTINGS.map((s) => s.key);

// Timings.
// New objects are collected this long before copying, so a paste or a
// Duplicate Page burst is handled together and property changes that follow
// the add event have landed.
export const ADD_DEBOUNCE_MS = 250;
// Objects handled per slice of a big job, with a pause between slices so the
// sandbox does not time out.
export const BATCH_SIZE = 50;
export const BATCH_PAUSE_MS = 10;
// How long a write SyncPage made is expected to come back from the client.
// Doors and pages echo API changes about a second later.
export const ECHO_TTL_MS = 5000;
// Buttons that carry a request ID stop working after this long.
export const REQUEST_TTL_MS = 10 * 60 * 1000;
// Housekeeping runs at most this often (on chat activity).
export const SWEEP_EVERY_MS = 15000;

// Colour palette for chat cards and handouts (shared with the other house Mods).
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
export const COLOR_SHOWN = '#6fcf97';
export const COLOR_HIDDEN = '#eb5757';
