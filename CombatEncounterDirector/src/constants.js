// Build-time placeholders replaced by rollup.config.js inject-build-metadata plugin.
export const SCRIPT_NAME = '__SCRIPT_NAME__';
export const SCRIPT_VERSION = '__BUILD_VERSION__';
export const SCRIPT_LAST_UPDATED = '__BUILD_DATE__';

export const DEFAULT_LOCALE = 'en-US';

export const STATE_KEY = 'CombatEncounterDirector';
export const COMMAND = '!ced';

// Legacy command from v1.0.0 — kept for backward compatibility.
// If the Director script (community mod) is also installed its state key will
// be present; we use that to detect a conflict and only whisper a notice
// rather than silently processing the command under the old name.
export const LEGACY_COMMAND = '!director';
export const DIRECTOR_CONFLICT_STATE_KEY = 'DIRECTOR_STATE';

export const JOURNAL_PANEL_NAME = 'Combat Encounter Director - Command Deck';
export const JOURNAL_STATUS_NAME = 'Combat Encounter Director - Status';

// Command Deck views
export const DECK_VIEW_KEYS = ['all', 'scaling', 'positioning', 'admin'];
export const DEFAULT_DECK_VIEW = 'all';
export const DECK_VIEWS = {
  all: { label: 'All' },
  scaling: { label: 'Scaling' },
  positioning: { label: 'Positioning' },
  admin: { label: 'Admin' },
};

// Token bars
export const VALID_HP_BARS = ['bar1', 'bar2', 'bar3'];
export const VALID_AC_BARS = ['bar1', 'bar2', 'bar3', 'none'];
export const DEFAULT_HP_BAR = 'bar1';
export const DEFAULT_AC_BAR = 'bar2';

// Roll20 layer identifiers
export const LAYER_TOKEN = 'objects';
export const LAYER_GM = 'gmlayer';
export const LAYER_MAP = 'map';
export const VALID_LAYERS = new Set([LAYER_TOKEN, LAYER_GM, LAYER_MAP]);

/**
 * Party-size scaling presets.
 *
 * hp / damage are percentages of the base value.
 * ac is a flat modifier added to base AC.
 */
export const PARTY_PRESETS = {
  solo: { label: 'Solo', partySize: 1, hp: 25, ac: -2, damage: 75 },
  duo: { label: 'Duo', partySize: 2, hp: 50, ac: -1, damage: 85 },
  small: { label: 'Small Party', partySize: 3, hp: 75, ac: 0, damage: 90 },
  standard: { label: 'Standard Party', partySize: 4, hp: 100, ac: 0, damage: 100 },
  large: { label: 'Large Party', partySize: 6, hp: 140, ac: 1, damage: 120 },
  convention: { label: 'Convention Table', partySize: 10, hp: 200, ac: 2, damage: 150 },
  massive: { label: 'Massive Table', partySize: 20, hp: 300, ac: 3, damage: 200 },
};

/**
 * Boss-type presets.
 *
 * For 'set' hpMode the hp value replaces the token's HP directly.
 * For 'percent' hpMode the hp value is a percentage of original max HP.
 * ac is a flat modifier added to original AC.
 * damage is a percentage of base damage.
 */
export const BOSS_PRESETS = {
  minion: { label: 'Minion', hpMode: 'set', hp: 1, ac: -2, damage: 50 },
  elite: { label: 'Elite', hpMode: 'percent', hp: 150, ac: 1, damage: 125 },
  boss: { label: 'Boss', hpMode: 'percent', hp: 300, ac: 2, damage: 150 },
  legendary: { label: 'Legendary', hpMode: 'percent', hp: 500, ac: 3, damage: 200 },
};

export const VALID_BOSS_PRESETS = new Set(Object.keys(BOSS_PRESETS));
export const VALID_PARTY_PRESETS = new Set(Object.keys(PARTY_PRESETS));

// Duplicate counts offered in the journal panel
export const DUPLICATE_OPTIONS = [2, 3, 5, 10];

// Maximum total tokens created in a single duplicate operation across all selected tokens
export const MAX_TOTAL_DUPLICATES = 100;

// Encounter name constraints: letters, digits, spaces, hyphens, underscores; max 64 chars
export const ENCOUNTER_NAME_RE = /^[a-zA-Z0-9 _-]{1,64}$/;

// Color palette
export const COLOR_HEADER_BG = '#1a1a2e';
export const COLOR_HEADER_TEXT = '#c8b8a2';
export const COLOR_CARD_BG_TOP = '#16213e';
export const COLOR_CARD_BG_BOTTOM = '#0f3460';
export const COLOR_BORDER = '#2a2a4a';
export const COLOR_TEXT = '#d0cfc8';
export const COLOR_MUTED = '#888888';
export const COLOR_ACCENT = '#e94560';
export const COLOR_BUTTON_BG = '#e94560';
export const COLOR_BUTTON_TEXT = '#ffffff';
export const COLOR_CHANGED = '#f59e0b';
export const COLOR_WARNING_BG = '#fef3c7';
export const COLOR_WARNING_BORDER = '#92400e';
export const COLOR_WARNING_TEXT = '#92400e';
export const COLOR_ERROR_BG = '#fee2e2';
export const COLOR_ERROR_BORDER = '#991b1b';
export const COLOR_ERROR_TEXT = '#991b1b';
