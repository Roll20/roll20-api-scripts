/**
 * NOTE: GENERATED FILE - DO NOT EDIT DIRECTLY.
 * NOTE: Source files live under src/ and are bundled with `npm run build`.
 * ------------------------------------------------
 * Name: TokenController
 * Script: TokenController.js
 * Version: 5.0.0
 * Built: 2026-10-29T06:13:55.090Z
 */
const TokenControllerMod = (() => {
  'use strict';

  // Build-time placeholders replaced by rollup.config.js inject-build-metadata plugin.
  const SCRIPT_NAME = 'TokenController';
  const SCRIPT_VERSION = '5.0.0';
  const SCRIPT_LAST_UPDATED = '2026-10-29T06:13:55.090Z';

  const DEFAULT_LOCALE$1 = 'en-US';

  const STATE_KEY = 'TokenController';
  const SCHEMA_VERSION = 5;
  const COMMAND = '!tokencontroller';

  // v4 command prefixes. Both accept the v4 subcommands as well as the v5 ones,
  // so existing macros and the T-Cntrl_ macros keep working.
  const LEGACY_PREFIXES = ['!tc', '!token-control'];

  const HANDOUT_HELP_NAME = 'TokenController - Help';
  const HANDOUT_DECK_NAME = 'TokenController - Command Deck';

  // v4 created this handout visible to every player. It is replaced by the
  // GM-only Help handout on upgrade.
  const LEGACY_HANDOUT_NAME = 'TokenController Usage Guide';

  const AUTHOR_LINKS = {
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
  const LAYER_TOKEN = 'objects';
  const LAYER_GM = 'gmlayer';

  // Roll20 object types for drawn shapes. Jumpgate draws pathv2; Legacy draws path.
  const PATH_TYPE_LEGACY = 'path';
  const PATH_TYPE_V2 = 'pathv2';

  // Roll20 pages measure width and height in 70 px units.
  const PAGE_UNIT_PX = 70;

  // Route kinds: a step code ("U2R2D2L2") or a list of waypoints.
  const ROUTE_KIND_CODE = 'code';
  const ROUTE_KIND_WAYPOINTS = 'waypoints';

  // Waypoint anchors: fixed to a page (drawn routes) or relative to where the
  // token starts (recorded routes).
  const ANCHOR_PAGE = 'page';
  const ANCHOR_TOKEN = 'token';

  // Option lists for settings and route options.
  const ROUTE_MODE_OPTIONS = ['loop', 'pingpong', 'once'];
  const MOVEMENT_OPTIONS = ['cell', 'segment'];
  const FACING_OPTIONS = ['off', 'up', 'down', 'left', 'right'];
  const COMBAT_DETECTION_OPTIONS = ['tracker', 'manual', 'both'];
  const COMBAT_BEHAVIOUR_OPTIONS = ['pause', 'step', 'ignore'];
  const LOCK_MODE_OPTIONS = ['native', 'revert', 'freeze'];
  const FOLLOW_MODE_OPTIONS = ['trail', 'formation'];
  const MANUAL_MOVE_OPTIONS = ['continue', 'stop'];

  // Default configuration for new installs. Upgraded v4 games keep their own values.
  const DEFAULT_CONFIG = {
    language: DEFAULT_LOCALE$1,
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
  const USEROPTION_KEYS = [
    'language',
    'movement',
    'facing',
    'combatDetection',
    'combatBehaviour',
    'lockMode',
    'followMode',
  ];

  // Limits that keep a command from creating unreasonable work.
  const MIN_INTERVAL = 250;
  const MAX_INTERVAL = 600000;
  const MAX_STEP_DISTANCE = 100;
  const MAX_WAIT = 100;
  const MAX_TRACK_FRAMES = 5000;
  const MAX_NAME_LENGTH = 100;
  const MAX_BUTTON_STEP = 20;
  const MAX_TOKENS_PER_ROUTE = 500;

  // How often the scheduler wakes up to check which patrols are due. Each patrol
  // keeps its own due time, so routes can run at their own intervals.
  const SCHEDULER_TICK_MS = 250;

  // Followers in trail mode step into the leader's previous positions; this is
  // how many positions each leader remembers.
  const TRAIL_LENGTH = 50;

  // Points closer than this (in pixels) are treated as the same place.
  const POSITION_EPSILON = 0.5;

  // Commands listed by `help` and the Help handout, with their help keys.
  const HELP_COMMANDS = [
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
  const EXAMPLE_ROUTES = [
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
  const COLOR_HEADER_BG = '#1d2a3a';
  const COLOR_HEADER_TEXT = '#e6edf5';
  const COLOR_CARD_BG_TOP = '#26394f';
  const COLOR_CARD_BG_BOTTOM = '#17222f';
  const COLOR_BORDER = '#3a5573';
  const COLOR_TEXT = '#e2e8f0';
  const COLOR_MUTED = '#9aabbd';
  const COLOR_ACCENT = '#f6ae2d';
  const COLOR_BUTTON_BG = '#33658a';
  const COLOR_BUTTON_TEXT = '#ffffff';
  const COLOR_BUTTON_ALT_BG = '#24384d';
  const COLOR_BUTTON_ALT_BORDER = '#4a6a8c';
  const COLOR_WARNING_BG = '#fef3c7';
  const COLOR_WARNING_BORDER = '#92400e';
  const COLOR_WARNING_TEXT = '#92400e';
  const COLOR_ERROR_BG = '#fee2e2';
  const COLOR_ERROR_BORDER = '#991b1b';
  const COLOR_ERROR_TEXT = '#991b1b';

  /**
   * Returns true when a value is a plain non-null, non-array object.
   *
   * @param {*} value Value to test.
   * @returns {boolean} True when the value is a record.
   */
  function isRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  /**
   * Converts a value to trimmed text, treating null and undefined as empty.
   *
   * @param {*} value Value to convert.
   * @returns {string} Trimmed string.
   */
  function toText(value) {
    return value === null || value === undefined ? '' : String(value).trim();
  }

  /**
   * Escapes HTML special characters.
   *
   * @param {*} text Text to escape.
   * @returns {string} Escaped text.
   */
  function escapeHtml(text) {
    return String(text)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  /**
   * Parses a whole number, rejecting anything that is not entirely digits
   * (with an optional leading minus sign).
   *
   * @param {*} raw Raw input.
   * @returns {number|null} Parsed integer, or null when invalid.
   */
  function parseStrictInt(raw) {
    if (typeof raw === 'number') {
      return Number.isInteger(raw) ? raw : null;
    }
    const text = toText(raw);
    return /^-?\d+$/.test(text) ? Number(text) : null;
  }

  /**
   * Parses a yes/no style value.
   *
   * @param {*} raw Raw input.
   * @returns {boolean|null} Parsed boolean, or null when not recognised.
   */
  function parseBoolean(raw) {
    if (typeof raw === 'boolean') {
      return raw;
    }
    const text = toText(raw).toLowerCase();
    if (['on', 'true', 'yes', '1'].includes(text)) {
      return true;
    }
    if (['off', 'false', 'no', '0'].includes(text)) {
      return false;
    }
    return null;
  }

  /**
   * Clamps a number into a range.
   *
   * @param {number} value Value.
   * @param {number} min Minimum.
   * @param {number} max Maximum.
   * @returns {number} Clamped value.
   */
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  /**
   * Splits command text into words, keeping "double quoted" phrases together.
   * Quotes are removed; an unterminated quote runs to the end of the text.
   *
   * @param {string} text Command text.
   * @returns {{text: string, quoted: boolean}[]} Words in order.
   */
  function tokenize(text) {
    const words = [];
    const pattern = /"([^"]*)"?|(\S+)/g;
    for (const match of toText(text).matchAll(pattern)) {
      if (match[1] !== undefined) {
        words.push({ text: match[1].trim(), quoted: true });
      } else {
        words.push({ text: match[2], quoted: false });
      }
    }
    return words;
  }

  let jumpgateCache = null;

  /**
   * Returns true when the game runs on Jumpgate. Roll20 has exposed this as
   * both `_release` and `release`, so both are checked.
   *
   * @returns {boolean} True for Jumpgate games.
   */
  function isJumpgate() {
    if (jumpgateCache === null) {
      const campaign = Campaign();
      const release = toText(campaign.get('_release') || campaign.get('release')).toLowerCase();
      jumpgateCache = release === 'jumpgate';
    }
    return jumpgateCache;
  }

  /**
   * Returns the page a player is viewing: a GM's last page, their own page when
   * split from the party, otherwise the player ribbon page.
   *
   * @param {string} playerId Roll20 player ID.
   * @returns {string} Page ID.
   */
  function getPlayerPageId(playerId) {
    const campaign = Campaign();
    if (playerIsGM(playerId)) {
      const lastPage = getObj('player', playerId)?.get('_lastpage');
      if (lastPage) {
        return lastPage;
      }
    }
    const specific = campaign.get('playerspecificpages');
    if (isRecord(specific) && specific[playerId]) {
      return specific[playerId];
    }
    return campaign.get('playerpageid');
  }

  /**
   * Returns true when a graphic is a token (not a card or map image).
   *
   * @param {object} obj Roll20 object.
   * @returns {boolean} True for tokens.
   */
  function isToken(obj) {
    return Boolean(obj) && obj.get('_type') === 'graphic' && obj.get('_subtype') === 'token';
  }

  /**
   * Returns a token's display name, falling back to its ID.
   *
   * @param {object|null} token Roll20 graphic.
   * @param {string} [fallbackId] ID to show when the token or its name is missing.
   * @returns {string} Name.
   */
  function tokenLabel(token, fallbackId = '') {
    return toText(token?.get('name')) || toText(token?.id) || fallbackId;
  }

  /**
   * Adds or removes a status marker, preserving the token's other markers.
   *
   * @param {object} token Roll20 graphic.
   * @param {string} marker Marker tag.
   * @param {boolean} on Add when true, remove when false.
   * @returns {void}
   */
  function setMarker(token, marker, on) {
    const markers = toText(token.get('statusmarkers'))
      .split(',')
      .filter((tag) => tag && tag.split('@')[0] !== marker);
    if (on) {
      markers.push(marker);
    }
    token.set('statusmarkers', markers.join(','));
  }

  /**
   * Parses Roll20's `lastmove` ("x1,y1,x2,y2,…") into points.
   *
   * @param {*} raw lastmove value.
   * @returns {number[][]} Array of [x, y].
   */
  function parseLastMove(raw) {
    const numbers = toText(raw)
      .split(',')
      .map((n) => Number(n));
    const points = [];
    for (let i = 0; i + 1 < numbers.length; i += 2) {
      if (Number.isFinite(numbers[i]) && Number.isFinite(numbers[i + 1])) {
        points.push([numbers[i], numbers[i + 1]]);
      }
    }
    return points;
  }

  const CHAT_CARD_STYLE = [
    'width:100%',
    'border-radius:4px',
    'box-shadow:1px 1px 3px rgba(0,0,0,0.4)',
    'text-align:left',
    'margin:2px auto',
    `border:1px solid ${COLOR_BORDER}`,
    `color:${COLOR_TEXT}`,
    `background-image:-webkit-linear-gradient(135deg,${COLOR_CARD_BG_TOP} 0%,${COLOR_CARD_BG_BOTTOM} 100%)`,
    `background-color:${COLOR_CARD_BG_BOTTOM}`,
    'overflow:hidden',
  ].join(';');

  const CHAT_HEADER_STYLE = [
    `background:${COLOR_HEADER_BG}`,
    `color:${COLOR_HEADER_TEXT}`,
    'padding:4px 8px',
    `border-bottom:2px solid ${COLOR_ACCENT}`,
    'font-variant:small-caps',
    'font-weight:bold',
    'font-size:1.05em',
    'text-align:center',
    'letter-spacing:0.05em',
  ].join(';');

  const CHAT_CONTENT_STYLE = 'padding:5px 8px;line-height:1.5';

  const BUTTON_STYLE = [
    `background:${COLOR_BUTTON_BG}`,
    `color:${COLOR_BUTTON_TEXT}`,
    'padding:2px 7px',
    'border-radius:3px',
    'text-decoration:none',
    'font-size:0.9em',
    'display:inline-block',
    'margin:1px 2px',
  ].join(';');

  const BUTTON_SECONDARY_STYLE = [
    `background:${COLOR_BUTTON_ALT_BG}`,
    `color:${COLOR_TEXT}`,
    `border:1px solid ${COLOR_BUTTON_ALT_BORDER}`,
    'padding:2px 7px',
    'border-radius:3px',
    'text-decoration:none',
    'font-size:0.9em',
    'display:inline-block',
    'margin:1px 2px',
  ].join(';');

  const SECTION_LABEL_STYLE = [
    `color:${COLOR_MUTED}`,
    'font-size:0.8em',
    'text-transform:uppercase',
    'letter-spacing:0.08em',
    'margin-top:4px',
    'margin-bottom:2px',
  ].join(';');

  const DIVIDER_STYLE = `border:none;border-top:1px solid ${COLOR_BORDER};margin:4px 0`;

  /**
   * Returns the whisper target for a player, falling back to all GMs.
   *
   * Double quotes are stripped so the name is safe inside /w "name".
   *
   * @param {string} [playerId] Roll20 player ID.
   * @returns {string} Whisper target text.
   */
  function whisperTarget(playerId) {
    const player = playerId ? getObj('player', playerId) : null;
    if (!player) {
      return 'gm';
    }
    return `"${String(player.get('displayname') || playerId).replaceAll('"', '')}"`;
  }

  /**
   * Sends a styled card whispered to a player, or to every GM when no player is given.
   *
   * @param {string|null} playerId Roll20 player ID.
   * @param {string} title Card header text.
   * @param {string|string[]} content HTML body content.
   * @returns {void}
   */
  function whisper(playerId, title, content) {
    const body = Array.isArray(content) ? content.join('') : content;
    sendChat(SCRIPT_NAME, `/w ${whisperTarget(playerId)} ${buildCard(title, body)}`, null, {
      noarchive: true,
    });
  }

  /**
   * Sends a warning whispered to a player (or every GM).
   *
   * @param {string|null} playerId Roll20 player ID.
   * @param {string} message Warning text.
   * @returns {void}
   */
  function whisperWarning(playerId, message) {
    const style = [
      `background:${COLOR_WARNING_BG}`,
      `color:${COLOR_WARNING_TEXT}`,
      `border:1px solid ${COLOR_WARNING_BORDER}`,
      'padding:4px 8px',
      'border-radius:4px',
      'font-size:0.95em',
    ].join(';');
    const html = `<div style="${style}">${escapeHtml(message)}</div>`;
    sendChat(SCRIPT_NAME, `/w ${whisperTarget(playerId)} ${html}`, null, { noarchive: true });
  }

  /**
   * Sends an error whispered to a player (or every GM).
   *
   * @param {string|null} playerId Roll20 player ID.
   * @param {string} message What went wrong.
   * @param {string} [hint] How to fix it.
   * @returns {void}
   */
  function whisperError(playerId, message, hint) {
    const style = [
      `background:${COLOR_ERROR_BG}`,
      `color:${COLOR_ERROR_TEXT}`,
      `border:1px solid ${COLOR_ERROR_BORDER}`,
      'padding:4px 8px',
      'border-radius:4px',
      'font-size:0.95em',
    ].join(';');
    const hintHtml = hint
      ? `<div style="margin-top:3px;font-size:0.9em">${escapeHtml(hint)}</div>`
      : '';
    const html = `<div style="${style}"><strong>${escapeHtml(message)}</strong>${hintHtml}</div>`;
    sendChat(SCRIPT_NAME, `/w ${whisperTarget(playerId)} ${html}`, null, { noarchive: true });
  }

  /**
   * Builds a styled chat card.
   *
   * @param {string} title Header text (escaped).
   * @param {string} body Body HTML (trusted).
   * @returns {string} HTML string.
   */
  function buildCard(title, body) {
    return [
      `<div style="${CHAT_CARD_STYLE}">`,
      `<div style="${CHAT_HEADER_STYLE}">${escapeHtml(title)}</div>`,
      `<div style="${CHAT_CONTENT_STYLE}">${body}</div>`,
      '</div>',
    ].join('');
  }

  /**
   * Builds a primary action button.
   *
   * @param {string} label Button label.
   * @param {string} command Chat command the button runs.
   * @returns {string} HTML anchor.
   */
  function buildButton(label, command) {
    return `<a href="${escapeHtml(command)}" style="${BUTTON_STYLE}">${escapeHtml(label)}</a>`;
  }

  /**
   * Builds a secondary action button.
   *
   * @param {string} label Button label.
   * @param {string} command Chat command the button runs.
   * @returns {string} HTML anchor.
   */
  function buildSecondaryButton(label, command) {
    return `<a href="${escapeHtml(command)}" style="${BUTTON_SECONDARY_STYLE}">${escapeHtml(label)}</a>`;
  }

  /**
   * Builds a section label.
   *
   * @param {string} text Label text.
   * @returns {string} HTML string.
   */
  function buildSectionLabel(text) {
    return `<div style="${SECTION_LABEL_STYLE}">${escapeHtml(text)}</div>`;
  }

  /**
   * Builds a horizontal divider.
   *
   * @returns {string} HTML string.
   */
  function buildDivider() {
    return `<hr style="${DIVIDER_STYLE}">`;
  }

  /**
   * Builds a label/value row. The value may be trusted HTML (e.g. a button).
   *
   * @param {string} label Label text (escaped).
   * @param {string} valueHtml Value HTML.
   * @returns {string} HTML string.
   */
  function buildRow(label, valueHtml) {
    return [
      '<table style="width:100%;border-collapse:collapse;margin:1px 0"><tr>',
      `<td style="color:${COLOR_MUTED};width:50%;font-size:0.9em">${escapeHtml(label)}</td>`,
      `<td style="text-align:right;width:50%">${valueHtml}</td>`,
      '</tr></table>',
    ].join('');
  }

  // Grid geometry for every Roll20 grid type. Pure functions only: nothing here
  // touches the Roll20 API, so the whole module can be unit tested in Node.
  //
  // A grid answers three questions for the movement engine: where is the
  // centre of the cell under a point (snap), where is the next cell in a screen
  // direction (step), and how far apart are cells (pitch). Directions are screen
  // directions: "U" is always up the screen, whatever the grid.

  const SQRT3 = Math.sqrt(3);

  const GRID_SQUARE = 'square';
  const GRID_HEX = 'hex';
  const GRID_ISO = 'iso';

  const HEX_VERTICAL = 'vertical';
  const HEX_HORIZONTAL = 'horizontal';

  // Roll20 pages measure everything in 70 px units.
  const UNIT_PX$1 = 70;

  // Hex spacing of a 1-unit grid. Legacy values were measured from the Legacy
  // editor's (slightly stretched) hexes; Jumpgate draws regular hexes 70 px
  // across the flats with the first hex's bounding box at the page's top-left.
  // These are the same profiles Hexploration v2 verified in both engines.
  const HEX_PROFILES = {
    legacy: {
      [HEX_VERTICAL]: {
        colStep: 75.19856198446,
        rowStep: 66.965827824268,
        originX: 37.5,
        originY: 44,
      },
      [HEX_HORIZONTAL]: {
        colStep: 69.585127490377,
        rowStep: 79.688789983504,
        originX: 47,
        originY: 40.5,
      },
    },
    jumpgate: {
      [HEX_VERTICAL]: {
        colStep: UNIT_PX$1,
        rowStep: (UNIT_PX$1 * SQRT3) / 2,
        originX: UNIT_PX$1 / 2,
        originY: UNIT_PX$1 / SQRT3,
      },
      [HEX_HORIZONTAL]: {
        colStep: (UNIT_PX$1 * SQRT3) / 2,
        rowStep: UNIT_PX$1,
        originX: UNIT_PX$1 / SQRT3,
        originY: UNIT_PX$1 / 2,
      },
    },
  };

  // Isometric and dimetric cells are diamonds one unit tall. Isometric ones are
  // √3 units wide and dimetric ones 2 units wide. Measured in Jumpgate: with no
  // grid offset, a diamond centre sits at (0, ¾ of a diamond height).
  const ISO_WIDTH_RATIO = { isometric: SQRT3, dimetric: 2 };

  // Screen direction vectors (x right, y down), before scaling.
  const DIRECTIONS = {
    U: [0, -1],
    D: [0, 1],
    L: [-1, 0],
    R: [1, 0],
    UL: [-1, -1],
    UR: [1, -1],
    DL: [-1, 1],
    DR: [1, 1],
  };

  const CUBE_DIRECTIONS = [
    [1, 0, -1],
    [1, -1, 0],
    [0, -1, 1],
    [-1, 0, 1],
    [-1, 1, 0],
    [0, 1, -1],
  ];

  // Hex neighbours whose bearings differ by less than this are treated as a tie
  // (for example "U" on a Hex (V) grid), and the step alternates between them.
  const TIE_DEGREES = 5;

  /**
   * Builds a grid description for a page.
   *
   * @param {object} options Grid options.
   * @param {string} [options.gridType='square'] Page grid_type.
   * @param {number} [options.snapping=1] Page snapping_increment (cell size in units, 0 = off).
   * @param {boolean} [options.showGrid=true] Page showgrid.
   * @param {boolean} [options.jumpgate=false] True for Jumpgate geometry.
   * @param {number} [options.offsetX=0] Jumpgate page grid_offset_x, in pixels.
   * @param {number} [options.offsetY=0] Jumpgate page grid_offset_y, in pixels, measured upwards.
   * @param {object|null} [options.calibration] Per-page { dx, dy, scale } correction.
   * @returns {object} Grid object.
   */
  function createGrid({
    gridType = 'square',
    snapping = 1,
    showGrid = true,
    jumpgate = false,
    offsetX = 0,
    offsetY = 0,
    calibration = null,
  } = {}) {
    const snapValue = Number(snapping);
    const snap = snapValue > 0 && showGrid !== false;
    const scale =
      (snapValue > 0 ? snapValue : 1) *
      (calibration && Number(calibration.scale) > 0 ? Number(calibration.scale) : 1);
    const shiftX = (jumpgate ? Number(offsetX) || 0 : 0) + (Number(calibration?.dx) || 0);
    const shiftY = (jumpgate ? -(Number(offsetY) || 0) : 0) + (Number(calibration?.dy) || 0);

    if (gridType === 'hex' || gridType === 'hexr') {
      const orientation = gridType === 'hex' ? HEX_VERTICAL : HEX_HORIZONTAL;
      const profile = HEX_PROFILES[jumpgate ? 'jumpgate' : 'legacy'][orientation];
      return {
        kind: GRID_HEX,
        snap,
        orientation,
        colStep: profile.colStep * scale,
        rowStep: profile.rowStep * scale,
        originX: profile.originX * scale + shiftX,
        originY: profile.originY * scale + shiftY,
      };
    }

    if (gridType === 'isometric' || gridType === 'dimetric') {
      const height = UNIT_PX$1 * scale;
      const width = height * ISO_WIDTH_RATIO[gridType];
      return {
        kind: GRID_ISO,
        snap,
        width,
        height,
        originX: shiftX,
        originY: (height * 3) / 4 + shiftY,
      };
    }

    const unit = UNIT_PX$1 * scale;
    return {
      kind: GRID_SQUARE,
      snap,
      unit,
      originX: shiftX,
      originY: shiftY,
    };
  }

  // ---------------------------------------------------------------------------
  // Hex helpers
  // ---------------------------------------------------------------------------

  /**
   * Converts offset coordinates to cube coordinates.
   *
   * @param {object} grid Hex grid.
   * @param {number} row Row.
   * @param {number} col Column.
   * @returns {number[]} [q, r, s].
   */
  function offsetToCube(grid, row, col) {
    if (grid.orientation === HEX_VERTICAL) {
      const q = col - (row - (row & 1)) / 2;
      return [q, row, -q - row];
    }
    const r = row - (col - (col & 1)) / 2;
    return [col, r, -col - r];
  }

  /**
   * Converts cube coordinates to offset coordinates.
   *
   * @param {object} grid Hex grid.
   * @param {number[]} cube [q, r, s].
   * @returns {number[]} [row, col].
   */
  function cubeToOffset(grid, [q, r]) {
    if (grid.orientation === HEX_VERTICAL) {
      return [r, q + (r - (r & 1)) / 2];
    }
    return [r + (q - (q & 1)) / 2, q];
  }

  /**
   * Rounds fractional cube coordinates to the nearest hex.
   *
   * @param {number[]} cube Fractional [q, r, s].
   * @returns {number[]} Integer [q, r, s].
   */
  function cubeRound(cube) {
    let q = Math.round(cube[0]);
    let r = Math.round(cube[1]);
    let s = Math.round(cube[2]);
    const dq = Math.abs(q - cube[0]);
    const dr = Math.abs(r - cube[1]);
    const ds = Math.abs(s - cube[2]);
    if (dq > dr && dq > ds) {
      q = -r - s;
    } else if (dr > ds) {
      r = -q - s;
    } else {
      s = -q - r;
    }
    return [q + 0, r + 0, s + 0];
  }

  /**
   * Returns the pixel centre of a hex.
   *
   * @param {object} grid Hex grid.
   * @param {number} row Row.
   * @param {number} col Column.
   * @returns {number[]} [x, y].
   */
  function hexToPixel(grid, row, col) {
    if (grid.orientation === HEX_VERTICAL) {
      return [
        grid.originX + (col + ((row & 1) === 1 ? 0.5 : 0)) * grid.colStep,
        grid.originY + row * grid.rowStep,
      ];
    }
    return [
      grid.originX + col * grid.colStep,
      grid.originY + (row + ((col & 1) === 1 ? 0.5 : 0)) * grid.rowStep,
    ];
  }

  /**
   * Returns the hex containing a pixel position.
   *
   * @param {object} grid Hex grid.
   * @param {number} x Pixel x.
   * @param {number} y Pixel y.
   * @returns {number[]} [row, col].
   */
  function pixelToHex(grid, x, y) {
    const colF = (x - grid.originX) / grid.colStep;
    const rowF = (y - grid.originY) / grid.rowStep;
    const q = grid.orientation === HEX_VERTICAL ? colF - rowF / 2 : colF;
    const r = grid.orientation === HEX_VERTICAL ? rowF : rowF - colF / 2;
    return cubeToOffset(grid, cubeRound([q, r, -q - r]));
  }

  /**
   * Returns a screen bearing in degrees (0 = up, 90 = right) for a vector.
   *
   * @param {number} dx X component.
   * @param {number} dy Y component (down is positive).
   * @returns {number} Bearing in [0, 360).
   */
  function bearing(dx, dy) {
    const deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
    return (deg + 360) % 360;
  }

  /**
   * Returns the smallest difference between two bearings.
   *
   * @param {number} a Bearing.
   * @param {number} b Bearing.
   * @returns {number} Difference in [0, 180].
   */
  function bearingDiff(a, b) {
    const d = Math.abs(a - b) % 360;
    return d > 180 ? 360 - d : d;
  }

  /**
   * Steps one hex in a screen direction. When the direction falls between two
   * neighbours (for example "U" on a Hex (V) grid) the step zigzags: it picks the
   * neighbour closest to the reference line, so a run of steps stays on course
   * and a step back returns to the same hex.
   *
   * @param {object} grid Hex grid.
   * @param {number[]} from [x, y].
   * @param {number[]} vector Direction vector.
   * @param {number|null} ref Lateral coordinate to keep close to (x on Hex (V),
   *        y on Hex (H)); on a tie the neighbour to the left (Hex (V)) or above
   *        (Hex (H)) is picked.
   * @returns {number[]} [x, y] of the neighbour's centre.
   */
  function hexStep(grid, from, vector, ref) {
    const [row, col] = pixelToHex(grid, from[0], from[1]);
    const [cx, cy] = hexToPixel(grid, row, col);
    const [q, r, s] = offsetToCube(grid, row, col);
    const want = bearing(vector[0], vector[1]);
    const options = CUBE_DIRECTIONS.map(([dq, dr, ds]) => {
      const [nr, nc] = cubeToOffset(grid, [q + dq, r + dr, s + ds]);
      const [x, y] = hexToPixel(grid, nr, nc);
      const b = bearing(x - cx, y - cy);
      return { x, y, b, diff: bearingDiff(b, want) };
    }).sort((a, b) => a.diff - b.diff);

    const [best, second] = options;
    if (second.diff - best.diff < TIE_DEGREES) {
      const lateral = (p) => (grid.orientation === HEX_VERTICAL ? p.x : p.y);
      if (ref !== null && ref !== undefined) {
        const da = Math.abs(lateral(best) - ref);
        const db = Math.abs(lateral(second) - ref);
        if (Math.abs(da - db) > 0.5) {
          const pick = da < db ? best : second;
          return [pick.x, pick.y];
        }
      }
      // Otherwise lean the same way (left on Hex (V), up on Hex (H)) whichever
      // way the token travels, so stepping back retraces the same hexes.
      const pick = lateral(best) < lateral(second) ? best : second;
      return [pick.x, pick.y];
    }
    return [best.x, best.y];
  }

  // ---------------------------------------------------------------------------
  // Public geometry
  // ---------------------------------------------------------------------------

  /**
   * Returns the centre of the cell under a point. Gridless pages (no snapping)
   * return the point unchanged.
   *
   * @param {object} grid Grid object.
   * @param {number} x Pixel x.
   * @param {number} y Pixel y.
   * @returns {number[]} [x, y].
   */
  function snapToCell(grid, x, y) {
    if (!grid.snap) {
      return [x, y];
    }
    if (grid.kind === GRID_HEX) {
      const [row, col] = pixelToHex(grid, x, y);
      return hexToPixel(grid, row, col);
    }
    if (grid.kind === GRID_ISO) {
      // Diamond lattice: centres at origin + ((a - b) * w/2, (a + b) * h/2).
      const u = (x - grid.originX) / (grid.width / 2);
      const v = (y - grid.originY) / (grid.height / 2);
      const a = Math.round((u + v) / 2);
      const b = Math.round((v - u) / 2);
      return [
        grid.originX + ((a - b) * grid.width) / 2,
        grid.originY + ((a + b) * grid.height) / 2,
      ];
    }
    const cx = grid.originX + (Math.floor((x - grid.originX) / grid.unit) + 0.5) * grid.unit;
    const cy = grid.originY + (Math.floor((y - grid.originY) / grid.unit) + 0.5) * grid.unit;
    return [cx, cy];
  }

  /**
   * Steps one cell from a point in a screen direction.
   *
   * Square and gridless pages move one unit (diagonals one unit on each axis).
   * Hex pages move to a neighbouring hex. Isometric and dimetric pages move
   * along the screen: diagonals cross one diamond edge, straight moves cross a
   * corner.
   *
   * @param {object} grid Grid object.
   * @param {number[]} from [x, y].
   * @param {string} dir Direction key from DIRECTIONS.
   * @param {number|null} [ref=null] Lateral reference for hex zigzags (see lateralCoordinate).
   * @returns {number[]} [x, y].
   */
  function stepFrom(grid, from, dir, ref = null) {
    const vector = DIRECTIONS[dir];
    if (!vector) {
      return [from[0], from[1]];
    }
    if (grid.kind === GRID_HEX) {
      return hexStep(grid, from, vector, ref);
    }
    if (grid.kind === GRID_ISO) {
      const diagonal = vector[0] !== 0 && vector[1] !== 0;
      const fx = diagonal ? grid.width / 2 : grid.width;
      const fy = diagonal ? grid.height / 2 : grid.height;
      return [from[0] + vector[0] * fx, from[1] + vector[1] * fy];
    }
    return [from[0] + vector[0] * grid.unit, from[1] + vector[1] * grid.unit];
  }

  /**
   * Returns true when a direction falls between two hex neighbours, so steps in
   * it zigzag around a reference line.
   *
   * @param {object} grid Grid object.
   * @param {string} dir Direction key.
   * @returns {boolean} True when the direction zigzags.
   */
  function directionZigzags(grid, dir) {
    if (grid.kind !== GRID_HEX) {
      return false;
    }
    return grid.orientation === HEX_VERTICAL
      ? dir === 'U' || dir === 'D'
      : dir === 'L' || dir === 'R';
  }

  /**
   * Returns the coordinate a zigzag keeps close to: x on Hex (V), y on Hex (H).
   *
   * @param {object} grid Grid object.
   * @param {number[]} point [x, y].
   * @returns {number} Lateral coordinate.
   */
  function lateralCoordinate(grid, point) {
    return grid.orientation === HEX_VERTICAL ? point[0] : point[1];
  }

  /**
   * Returns the typical distance between neighbouring cell centres, used to
   * split long waypoint legs into cell-sized steps.
   *
   * @param {object} grid Grid object.
   * @returns {number} Pixels.
   */
  function cellPitch(grid) {
    if (grid.kind === GRID_HEX) {
      return Math.min(grid.colStep, grid.rowStep);
    }
    if (grid.kind === GRID_ISO) {
      return Math.hypot(grid.width / 2, grid.height / 2);
    }
    return grid.unit;
  }

  /**
   * Returns the axis and spacing used to measure the cell size from two tokens
   * in neighbouring cells: a row for square, Hex (V) and iso grids, a column for
   * Hex (H) grids.
   *
   * @param {object} grid Grid object.
   * @returns {{axis: number, pitch: number}} Axis (0 = x, 1 = y) and pixels per cell.
   */
  function calibrationAxis(grid) {
    if (grid.kind === GRID_HEX) {
      return grid.orientation === HEX_VERTICAL
        ? { axis: 0, pitch: grid.colStep }
        : { axis: 1, pitch: grid.rowStep };
    }
    if (grid.kind === GRID_ISO) {
      return { axis: 0, pitch: grid.width };
    }
    return { axis: 0, pitch: grid.unit };
  }

  /**
   * Derives a page calibration from tokens the GM has snapped to cell centres.
   *
   * One token corrects the grid's position. Two tokens in neighbouring cells of
   * the same row (same column on Hex (H) grids) also correct the cell size.
   *
   * @param {object} options Options used to build the uncalibrated grid (see createGrid).
   * @param {number[][]} points Token centres [[x, y], ...].
   * @returns {{dx: number, dy: number, scale: number}|null} Calibration, or null
   *          when the points cannot be used.
   */
  function calibrateGrid(options, points) {
    if (!Array.isArray(points) || points.length === 0) {
      return null;
    }
    const base = createGrid({ ...options, calibration: null });
    let scale = 1;
    if (points.length >= 2) {
      const { axis, pitch } = calibrationAxis(base);
      const [a, b] = points;
      const along = Math.abs(b[axis] - a[axis]);
      const across = Math.abs(b[1 - axis] - a[1 - axis]);
      const cells = Math.round(along / pitch);
      if (cells < 1 || across > pitch / 4) {
        return null;
      }
      scale = along / (cells * pitch);
    }
    const scaled = createGrid({ ...options, calibration: { scale, dx: 0, dy: 0 }, showGrid: true });
    const forced = { ...scaled, snap: true };
    const [px, py] = points[0];
    const [cx, cy] = snapToCell(forced, px, py);
    return { dx: px - cx, dy: py - cy, scale };
  }

  const TRANSLATION$n = {};

  const TRANSLATION$m = {};

  const TRANSLATION$l = {};

  const TRANSLATION$k = {};

  const TRANSLATION$j = {};

  const TRANSLATION$i = {};

  const TRANSLATION$h = {
    titles: {
      ready: 'TokenController is ready.',
      settings: 'TokenController Settings',
      help: 'TokenController Commands',
      export: 'Route Export',
      routes: 'Routes',
      tokens: 'Controlled Tokens',
      status: 'TokenController Status',
    },
    messages: {
      migrated:
        'Upgraded from version 4. Routes kept: {routes}. Patrolling tokens kept: {patrols}. Your old macros and !tc commands still work.',
      removedGuide:
        'The old "TokenController Usage Guide" handout, which players could see, was replaced by the GM-only Help handout.',
      pruned: 'Patrols forgotten because their tokens no longer exist: {count}.',
      readyHint: 'Type !tokencontroller for the menu, or open the Command Deck handout.',
      combatStarted: {
        pause: 'Combat has started: patrols are paused until it ends.',
        step: 'Combat has started: patrols move one step each turn.',
      },
      combatEnded: 'Combat is over: patrols carry on.',
      routeAdded: 'Route "{name}" added ({mode}).',
      routeUpdated: 'Route "{name}" updated. Tokens on it carry on with the new route.',
      confirmRemove: 'Remove route "{name}"? Tokens on it that will stop: {count}.',
      routeRemoved: 'Route "{name}" removed. Tokens stopped: {count}.',
      routeRenamed: 'Route "{from}" renamed to "{to}".',
      examplesAdded: 'Example routes added: {count}.',
      exportHint: 'Copy the text below and paste it after {command} in any game.',
      imported: 'Imported {added} routes; skipped {skipped} (name already used or not valid).',
      started: '{tokens} started on "{name}".',
      stopped: 'Tokens stopped: {count}.',
      reset: 'Tokens returned to where they started: {count}.',
      locked: 'Locked: {tokens} ({mode}).',
      unlocked: 'Unlocked: {tokens}.',
      leaderSet: '{token} is the leader. Select the followers and click Follow.',
      following: 'Now following {leader} ({mode}): {tokens}.',
      unfollowed: 'Tokens no longer following: {count}.',
      noRecordings: 'Nothing is being recorded.',
      recordingCancelled: 'Recording "{name}" cancelled.',
      languages: 'Supported languages: {list}',
      settingChanged: '{setting} is now {value}.',
      combatOn: 'Combat switched on.',
      combatOff: 'Combat switched off.',
      calibrationCleared: 'Grid calibration removed from this page.',
      calibrated: 'Grid calibrated for this page (cell size × {scale}).',
      paused: 'All patrols paused.',
      resumed: 'Patrols resumed.',
      journalRebuilt: 'Handouts rebuilt: {help} and {deck}.',
    },
    errors: {
      noTokens: 'No tokens selected.',
      noRouteName: 'No route name given.',
      routeNotFound: 'There is no route called "{name}".',
      routeExists: 'There is already a route called "{name}".',
      code: {
        empty: 'The step code is empty.',
        badToken: 'The step code "{code}" has something it does not understand at "{at}".',
        tooFar: 'The step "{at}" is too long.',
      },
      routeInvalid: 'That route could not be saved.',
      usageAdd: 'Give a name and a step code.',
      usageEdit: 'Give a route and a new step code.',
      selectOneDrawing:
        'Select exactly one drawing (a line, polygon, freehand shape, rectangle or ellipse).',
      drawingEmpty: 'The selected drawing has too few points to follow.',
      usageRoute: 'Give a route, an option and a value.',
      unknownRouteOption: 'There is no route option called "{option}".',
      selectOneToken: 'Select exactly one token.',
      badRouteValue: '"{value}" is not a valid value for {option}.',
      usageRename: 'Give a route and its new name.',
      usageCopy: 'Give a route and a name for the copy.',
      badJson: 'That is not route export text.',
      tokenLocked: '{tokens} cannot start: locked.',
      routeOnOtherPage: '{tokens} cannot start: "{name}" was drawn on another page.',
      startOnOtherPage: '{tokens} cannot start: the fixed start of "{name}" is on another page.',
      routeFull: '{tokens} cannot start: "{name}" already has {max} tokens.',
      noPage: 'The page could not be found.',
      emptyTrack: '{tokens} cannot start: "{name}" has no moves.',
      leaderNotFound: 'No token called "{name}" was found on this page.',
      noLeader: 'There is no leader yet.',
      followLoop: '{tokens} cannot follow a token that follows them.',
      alreadyRecording: '{token} is already being recorded.',
      recordingTokenGone: 'The token for recording "{name}" no longer exists.',
      recordingEmpty: 'Nothing has been recorded yet.',
      unknownSetting: 'There is no setting called "{key}".',
      badSettingValue: '"{value}" is not a valid value for {key}.',
      calibrateNeedsTokens: 'Select one or two tokens snapped to cell centres.',
      calibrateFailed: 'The selected tokens could not be used to calibrate the grid.',
      unknownCommand: 'Unknown command "{command}".',
      gmOnly: 'Only the GM can use TokenController.',
      internal: 'Something went wrong. Details are in the API console.',
    },
    hints: {
      noTokens: 'Select the tokens on the map first.',
      noRouteName: 'For example: !tokencontroller add Guard Walk U2R2D2L2',
      routeNotFound: 'Type !tokencontroller list to see all routes.',
      code: {
        empty: 'For example: U2R2D2L2',
        badToken:
          'Use U, D, L, R, UL, UR, DL or DR with a number of cells, W to wait and S for stealth.',
        tooFar: 'A single step can be at most 100 cells; waits at most 100 ticks.',
      },
      selectOneDrawing:
        'Draw the route with a drawing tool, select it (drag a box around a thin outline if clicking misses it), then try again.',
      usageRoute: 'Options: mode, interval, max, random, start.',
      routeOnOtherPage: 'Drawn routes only work on the page they were drawn on.',
      startOnOtherPage: 'Clear the fixed start, or move the token to that page first.',
      noLeader:
        'Select the leader and click Leader, or give its name: !tokencontroller follow Name',
      leaderNotFound: 'Use the token name exactly as shown on the map, or its token ID.',
      badJson: 'Paste the text from !tokencontroller export (or v4 exportpaths) exactly.',
      unknownSetting: 'Type !tokencontroller set to see all settings.',
      calibrateNeedsTokens:
        'One token lines up the grid; two tokens in neighbouring cells of a row also fix the cell size.',
      calibrateFailed:
        'Make sure the tokens are in neighbouring cells of the same row (column on Hex (H) pages).',
      unknownCommand: 'Type !tokencontroller help for the list of commands.',
      tokenLocked: 'Unlock the token first.',
    },
    warnings: {
      offPage: 'Part of the route runs off the page (steps: {count}). Those steps are skipped.',
      combatTrackerOnly:
        'Combat Detection is set to the turn tracker, so this switch has no effect until you change it.',
      unitPx:
        'Version 5 reads the cell size from each page, so the old Pixels Per Unit setting is no longer used. If tokens do not line up, use !tokencontroller calibrate.',
    },
    values: {
      on: 'On',
      off: 'Off',
      none: 'None',
      default: 'Default',
      noLimit: 'No limit',
      ms: '{ms} ms',
      andMore: 'and {count} more',
      following: 'following {leader}',
      locked: 'locked',
      gridless: 'no snapping',
      grid: {
        square: 'Square',
        hex: 'Hex',
        iso: 'Isometric / Dimetric',
      },
      mode: {
        loop: 'Loop',
        pingpong: 'Back and forth',
        once: 'Once',
      },
      movement: {
        cell: 'One cell at a time',
        segment: 'Whole step at a time',
      },
      facing: {
        off: 'Do not turn',
        up: 'Art faces up',
        down: 'Art faces down',
        left: 'Art faces left',
        right: 'Art faces right',
      },
      combatDetection: {
        tracker: 'Turn tracker',
        manual: 'GM switch',
        both: 'Turn tracker or GM switch',
      },
      combatBehaviour: {
        pause: 'Pause',
        step: 'Move each turn',
        ignore: 'Keep moving',
      },
      lockMode: {
        native: "Roll20's position lock",
        revert: 'Undo moves',
        freeze: 'Hold still only',
      },
      followMode: {
        trail: 'Single file',
        formation: 'Formation',
      },
      manualMove: {
        continue: 'Carry on from there',
        stop: 'Stop the patrol',
      },
    },
    menu: {
      statusRunning: 'Patrolling tokens: {patrols}. Routes: {routes}.',
      statusPaused: 'All patrols are paused.',
      statusCombat: {
        pause: 'In combat: patrols are paused.',
        step: 'In combat: patrols move each turn.',
      },
      routes: 'Routes',
      noRoutes: 'No routes yet. Add one, draw one, record one or add the examples.',
      create: 'New Route',
      selected: 'Selected Tokens',
      tools: 'Tools',
      recordings: 'Recordings',
      patrols: 'Patrols',
    },
    buttons: {
      start: 'Start',
      stop: 'Stop',
      add: 'Step Code',
      draw: 'From Drawing',
      record: 'Record',
      examples: 'Examples',
      reset: 'Reset',
      lock: 'Lock',
      unlock: 'Unlock',
      leader: 'Leader',
      follow: 'Follow',
      unfollow: 'Unfollow',
      resume: 'Resume',
      pause: 'Pause All',
      combatOn: 'Combat On',
      combatOff: 'Combat Off',
      stopAll: 'Stop All',
      settings: 'Settings',
      status: 'Status',
      help: 'Help',
      open: 'Open',
      clearStart: 'Clear',
      setStart: 'Set to Selected',
      edit: 'Edit Code',
      rename: 'Rename',
      copy: 'Copy',
      export: 'Export',
      remove: 'Remove',
      menu: 'Menu',
      wait: 'Wait',
      stealth: 'Stealth',
      undo: 'Undo',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Yes, remove it',
      startRoute: 'Start Route',
      list: 'List Routes',
      calibrate: 'Calibrate',
    },
    prompts: {
      name: 'Route name',
      code: 'Step code',
      interval: 'Milliseconds per step (0 = default)',
      maxTokens: 'Most tokens at once (0 = no limit)',
      newName: 'New name',
      route: 'Route name',
    },
    route: {
      drawn: 'Drawn route, {points} points',
      recorded: 'Recorded route, {points} points',
      path: 'Path',
      mode: 'Mode',
      interval: 'Interval',
      maxTokens: 'Most tokens',
      randomStart: 'Random start',
      start: 'Fixed start',
      tokens: 'Tokens',
    },
    record: {
      title: 'Recording "{name}"',
      intro:
        'Recording {token} (moves so far: {count}). Click the arrows, or drag the token on the map; every move is recorded.',
    },
    settings: {
      interval: {
        label: 'Interval',
        desc: 'Milliseconds between steps. Each route can override it.',
      },
      movement: {
        label: 'Movement',
        desc: 'cell moves one cell per step; segment moves a whole step (such as U3) at once, as version 4 did.',
      },
      facing: {
        label: 'Turn Tokens',
        desc: 'Turn tokens to face where they are going: off, or the way the token art faces (up, down, left or right).',
      },
      combatDetection: {
        label: 'Combat Detection',
        desc: 'How combat is noticed: tracker (the turn tracker is open with someone in it), manual (the Combat On/Off buttons) or both.',
      },
      combatBehaviour: {
        label: 'Combat Behaviour',
        desc: 'What patrols do in combat: pause, step (move once each time the turn passes) or ignore (keep moving).',
      },
      lockMode: {
        label: 'Lock Mode',
        desc: "How Lock holds a token: native (Roll20's own position lock, so nobody can drag it), revert (moves are undone) or freeze (it stops patrolling and following but can still be dragged).",
      },
      lockMarker: {
        label: 'Lock Marker',
        desc: 'Status marker shown on locked tokens, or none. Players can see markers.',
      },
      followMode: {
        label: 'Follow Mode',
        desc: "trail: followers walk single file in the leader's footsteps. formation: followers keep their place around the leader (drag a follower to change its place).",
      },
      manualMove: {
        label: 'Dragging a Patrol',
        desc: 'When you drag a patrolling token: continue (the route carries on from where you dropped it) or stop (the patrol ends).',
      },
      buttonStep: {
        label: 'Cells per Click',
        desc: 'How far the recording arrows move a token.',
      },
      language: {
        label: 'Language',
        desc: 'Language for menus, messages and handouts.',
      },
    },
    status: {
      routes: 'Routes',
      patrols: 'Patrolling tokens',
      followers: 'Following tokens',
      locked: 'Locked tokens',
      recordings: 'Recordings',
      paused: 'Paused',
      combat: 'Combat',
      page: 'Current page',
      grid: 'Grid',
      cell: 'Cell size',
      calibration: 'Calibration',
    },
    help: {
      menu: 'Show the menu.',
      start: 'Put the selected tokens on a route.',
      stop: 'Stop the selected tokens (patrols and following), every token on a route, or all.',
      reset: 'Return tokens to where they started and stop them.',
      pause: 'Pause or resume every patrol.',
      lock: 'Hold the selected tokens in place, or release them.',
      leader: 'Choose the selected token as the leader to follow.',
      follow: 'Make the selected tokens follow the leader, or a token given by name.',
      unfollow: 'Stop the selected tokens following.',
      add: 'Create a route from a step code, such as U2R2D2L2.',
      edit: "Change a route's step code.",
      draw: 'Create a route that follows the selected drawing on this page.',
      record: 'Record a route by moving the selected token with buttons or by dragging it.',
      route: 'Change a route option: mode, interval, max, random or start.',
      show: "Show a route's details and buttons.",
      rename: 'Rename a route.',
      copy: 'Copy a route under a new name.',
      remove: 'Remove a route (asks first).',
      list: 'List the routes, or the tokens being controlled.',
      examples: 'Add the example routes.',
      export: 'Show routes as text to copy into another game.',
      import: 'Add routes from export text.',
      combat: 'Switch combat on or off by hand.',
      set: 'Change a setting, or show all settings.',
      calibrate: 'Line the grid up with tokens snapped to cell centres, or remove the calibration.',
      status: 'Show what the Mod is doing and how it sees this page.',
      journal: 'Rebuild the Help and Command Deck handouts.',
      help: 'Show this list.',
      footer:
        'Full instructions are in the "{help}" handout; buttons are in "{deck}". {legacy} still work with the version 4 commands.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Patrols, followers and locks for Jumpgate and Legacy games',
      overview: {
        heading: 'Overview',
        body: 'TokenController moves tokens for you. Give a guard a patrol route, have a cart follow its driver, or lock a statue in place. Routes can be typed as a step code, traced from a drawing on the map, or recorded by moving a token. Routes work on square, hex, isometric, dimetric and gridless pages.',
      },
      quickStart: {
        heading: 'Quick Start',
        steps: [
          'Open the Command Deck handout, or type !tokencontroller for the menu.',
          'Click Examples to add some ready-made routes, or Step Code to type your own (for example U2R2D2L2).',
          'Select one or more tokens and click Start next to a route.',
          'Select a token and click Stop to stop it, or Reset to send it back to where it started.',
        ],
      },
      routes: {
        heading: 'Making Routes',
        points: [
          'Step code: type moves such as U2R2D2L2. Codes are not tied to a place on the map, so the same route works anywhere.',
          'From Drawing: draw a line, polygon, freehand shape, rectangle or ellipse with the drawing tools, select it and click From Drawing. Tokens walk along it, on that page only. You can delete the drawing afterwards.',
          'Record: select a token and click Record. Move it with the arrow buttons or drag it on the map (Roll20 waypoints are followed), then click Save. On square grids the recording becomes a step code you can edit.',
          'Loop routes start again from the beginning; back-and-forth routes walk back the way they came; once routes stop at the end. New routes that end where they start loop; others go back and forth.',
        ],
      },
      codes: {
        colCode: 'Code',
        colMeaning: 'Meaning',
        move: 'Move up, down, left or right, one cell.',
        diagonal: 'Move diagonally.',
        distance: 'A number after a direction moves that many cells.',
        face: 'Turn to face a direction without moving (needs Turn Tokens).',
        wait: 'Wait one step, or the given number of steps.',
        stealth:
          'Move the token between the token layer and the GM layer, so it vanishes and reappears.',
      },
      routeOptions: {
        heading: 'Route Options',
        colOption: 'Option',
        colMeaning: 'Meaning',
        mode: 'loop, pingpong (back and forth) or once.',
        interval: 'Milliseconds per step for this route, or 0 for the global interval.',
        max: 'The most tokens that can be on the route at once, or 0 for no limit.',
        random: 'on: each token starts at a random point along the route.',
        start:
          "set: tokens jump to the selected token's position when they start. clear: they start where they stand.",
      },
      tokens: {
        heading: 'Controlling Tokens',
        points: [
          'A token is on one route at a time. Starting it on another route replaces the first.',
          'Stop leaves tokens where they are. Reset puts them back where they were before they started, on their original layer.',
          'Lock holds a token in place. Locked tokens do not patrol or follow until unlocked.',
          "Follow: select the leader and click Leader, then select the followers and click Follow. You can also type the leader's name: !tokencontroller follow Goblin Boss. Followers follow tokens that patrol, tokens you drag and tokens moved by TokenMod.",
          'Followers can follow other followers, making a chain or a column.',
          'Dragging a patrolling token carries the patrol on from where you drop it, unless Dragging a Patrol is set to stop.',
        ],
      },
      grids: {
        heading: 'Grids',
        points: [
          'The cell size and grid type are read from each page, so different pages can use different grids.',
          'U and D always mean up and down the screen. On hex grids, moves with no matching neighbour zigzag; on isometric and dimetric grids, diagonals cross one diamond.',
          'Pages with snapping turned off move in 70-pixel steps without lining up to a grid.',
          'If tokens drift off the grid, snap a token to a cell centre, select it and click Calibrate. Select two tokens in neighbouring cells of a row to fix the cell size too.',
        ],
      },
      combat: {
        heading: 'Combat',
        points: [
          'Combat Detection chooses how combat is noticed: the turn tracker, the Combat On/Off buttons, or either.',
          'Combat Behaviour chooses what patrols do: pause, move one step each time the turn passes, or keep moving.',
          'Pause All stops every patrol at any time; Resume starts them again.',
        ],
      },
      commands: {
        heading: 'Commands',
        intro:
          'Only GMs can use these commands. Routes can be named, or referred to by their #id from the menu buttons. Put names with spaces in "quotes" when a command takes two names.',
        colCommand: 'Command',
        colDesc: 'What it does',
      },
      settings: {
        heading: 'Settings',
        intro:
          'Change settings from the menu, with !tokencontroller set <setting> <value>, or on the Mod settings page in the API Scripts screen.',
        colKey: 'Key',
        colName: 'Setting',
        colDesc: 'Description',
      },
      upgrading: {
        heading: 'Upgrading from Version 4',
        points: [
          'Paths, patrolling tokens, locks, followers and unfinished drafts are kept. Drafts become routes ending in "(draft)".',
          'Your version 4 settings are kept: interval, sub-steps, rotation, combat patrol and units per click.',
          'The !tc and !token-control commands and the T-Cntrl_ macros keep working. The table shows the new commands.',
          'Version 4 sent the whole menu after every action; version 5 sends a short reply instead.',
          'The Pixels Per Unit setting is gone: the cell size comes from each page. HTML Builder is no longer needed.',
          'The old Usage Guide handout, which every player could see, is replaced by this GM-only handout.',
        ],
        colV4: 'Version 4',
        colV5: 'Version 5',
      },
      troubleshooting: {
        heading: 'Troubleshooting',
        points: [
          'Tokens do not move: check Status. Patrols wait while paused, while locked, and in combat when Combat Behaviour is pause.',
          "Tokens move the wrong distance: the page's grid size or snapping may have changed; try Calibrate.",
          'A drawn route will not start: drawn routes only work on the page they were drawn on.',
          'Followers do not move when another Mod moves the leader: only TokenMod reports its moves. Other Mods can call TokenController.ObserveTokenChange.',
          'Report problems on the Roll20 forum with any messages from the API console.',
        ],
      },
      languages: {
        heading: 'Languages',
        body: 'TokenController is translated into the languages below. Choose one with the Language setting.',
      },
      credits: {
        heading: 'Credits',
        original: 'Original Mod by',
        maintainer: 'Version 5 maintained by',
        support: 'Report bugs and ideas on the Roll20 Mod forum or on GitHub.',
      },
      footer: 'Buttons for every action are in the "{deck}" handout.',
    },
    deck: {
      subtitle: 'Command Deck',
      patrolsDesc: 'Start, stop and pause patrols. Select tokens first.',
      createDesc: 'Make routes from a step code, a drawing or by recording a token.',
      selectedDesc: 'Lock tokens, or make them follow a leader.',
      toolsDesc: 'Combat, settings and grid tools.',
      footer: 'Full instructions are in the "{help}" handout.',
    },
  };

  const TRANSLATION$g = {};

  const TRANSLATION$f = {};

  const TRANSLATION$e = {};

  const TRANSLATION$d = {};

  const TRANSLATION$c = {};

  const TRANSLATION$b = {};

  const TRANSLATION$a = {};

  const TRANSLATION$9 = {};

  const TRANSLATION$8 = {};

  const TRANSLATION$7 = {};

  const TRANSLATION$6 = {};

  const TRANSLATION$5 = {};

  const TRANSLATION$4 = {};

  const TRANSLATION$3 = {};

  const TRANSLATION$2 = {};

  const TRANSLATION$1 = {};

  const TRANSLATION = {};

  const DEFAULT_LOCALE = 'en-US';

  const LOCALE_DEFINITIONS = Object.freeze([
    {
      code: 'af',
      name: 'Afrikaans',
      direction: 'ltr',
      translationFile: 'locale/af.js',
      flag: '🇿🇦',
      flagLabel: 'Flag of South Africa',
    },
    {
      code: 'ca',
      name: 'Catalan',
      nativeName: 'Català',
      direction: 'ltr',
      translationFile: 'locale/ca.js',
      flag: '🇪🇸',
      flagLabel: 'Flag of Spain',
    },
    {
      code: 'zh-TW',
      name: 'Chinese (Traditional)',
      nativeName: '正體中文',
      direction: 'ltr',
      translationFile: 'locale/zh-TW.js',
      aliases: ['zh'],
      flag: '🇹🇼',
      flagLabel: 'Flag of Taiwan',
    },
    {
      code: 'cs',
      name: 'Czech',
      nativeName: 'Čeština',
      direction: 'ltr',
      translationFile: 'locale/cs.js',
      flag: '🇨🇿',
      flagLabel: 'Flag of Czechia',
    },
    {
      code: 'da',
      name: 'Danish',
      nativeName: 'Dansk',
      direction: 'ltr',
      translationFile: 'locale/da.js',
      flag: '🇩🇰',
      flagLabel: 'Flag of Denmark',
    },
    {
      code: 'nl',
      name: 'Dutch',
      nativeName: 'Nederlands',
      direction: 'ltr',
      translationFile: 'locale/nl.js',
      flag: '🇳🇱',
      flagLabel: 'Flag of the Netherlands',
    },
    {
      code: 'en-US',
      name: 'English',
      nativeName: 'English',
      direction: 'ltr',
      translationFile: 'locale/en-US.js',
      aliases: ['en'],
      flag: '🇺🇸',
      flagLabel: 'Flag of the United States',
    },
    {
      code: 'fi',
      name: 'Finnish',
      nativeName: 'Suomeksi',
      direction: 'ltr',
      translationFile: 'locale/fi.js',
      flag: '🇫🇮',
      flagLabel: 'Flag of Finland',
    },
    {
      code: 'fr',
      name: 'French',
      nativeName: 'Français',
      direction: 'ltr',
      translationFile: 'locale/fr.js',
      flag: '🇫🇷',
      flagLabel: 'Flag of France',
    },
    {
      code: 'de',
      name: 'German',
      nativeName: 'Deutsch',
      direction: 'ltr',
      translationFile: 'locale/de.js',
      flag: '🇩🇪',
      flagLabel: 'Flag of Germany',
    },
    {
      code: 'el',
      name: 'Greek',
      nativeName: 'Ελληνικά',
      direction: 'ltr',
      translationFile: 'locale/el.js',
      flag: '🇬🇷',
      flagLabel: 'Flag of Greece',
    },
    {
      code: 'he',
      name: 'Hebrew',
      nativeName: 'עברית',
      direction: 'rtl',
      translationFile: 'locale/he.js',
      flag: '🇮🇱',
      flagLabel: 'Flag of Israel',
    },
    {
      code: 'hu',
      name: 'Hungarian',
      nativeName: 'Magyar',
      direction: 'ltr',
      translationFile: 'locale/hu.js',
      flag: '🇭🇺',
      flagLabel: 'Flag of Hungary',
    },
    {
      code: 'it',
      name: 'Italian',
      nativeName: 'Italiano',
      direction: 'ltr',
      translationFile: 'locale/it.js',
      flag: '🇮🇹',
      flagLabel: 'Flag of Italy',
    },
    {
      code: 'ja',
      name: 'Japanese',
      nativeName: '日本語',
      direction: 'ltr',
      translationFile: 'locale/ja.js',
      flag: '🇯🇵',
      flagLabel: 'Flag of Japan',
    },
    {
      code: 'ko',
      name: 'Korean',
      nativeName: '한국어',
      direction: 'ltr',
      translationFile: 'locale/ko.js',
      flag: '🇰🇷',
      flagLabel: 'Flag of South Korea',
    },
    {
      code: 'pl',
      name: 'Polish',
      nativeName: 'Polski',
      direction: 'ltr',
      translationFile: 'locale/pl.js',
      flag: '🇵🇱',
      flagLabel: 'Flag of Poland',
    },
    {
      code: 'pt-PT',
      name: 'Portuguese (Portugal)',
      nativeName: 'Português - Portugal',
      direction: 'ltr',
      translationFile: 'locale/pt-PT.js',
      aliases: ['pt'],
      flag: '🇵🇹',
      flagLabel: 'Flag of Portugal',
    },
    {
      code: 'pt-BR',
      name: 'Portuguese (Brazil)',
      nativeName: 'Português - Brasil',
      direction: 'ltr',
      translationFile: 'locale/pt-BR.js',
      flag: '🇧🇷',
      flagLabel: 'Flag of Brazil',
    },
    {
      code: 'ru',
      name: 'Russian',
      nativeName: 'Русский',
      direction: 'ltr',
      translationFile: 'locale/ru.js',
      flag: '🇷🇺',
      flagLabel: 'Flag of Russia',
    },
    {
      code: 'es',
      name: 'Spanish',
      nativeName: 'Español',
      direction: 'ltr',
      translationFile: 'locale/es.js',
      flag: '🇪🇸',
      flagLabel: 'Flag of Spain',
    },
    {
      code: 'sv',
      name: 'Swedish',
      nativeName: 'Svenska',
      direction: 'ltr',
      translationFile: 'locale/sv.js',
      flag: '🇸🇪',
      flagLabel: 'Flag of Sweden',
    },
    {
      code: 'tr',
      name: 'Turkish',
      nativeName: 'Türkçe',
      direction: 'ltr',
      translationFile: 'locale/tr.js',
      flag: '🇹🇷',
      flagLabel: 'Flag of Turkey',
    },
    {
      code: 'uk',
      name: 'Ukrainian',
      nativeName: 'Українська',
      direction: 'ltr',
      translationFile: 'locale/uk.js',
      flag: '🇺🇦',
      flagLabel: 'Flag of Ukraine',
    },
  ]);

  const SUPPORTED_LOCALES = Object.freeze(LOCALE_DEFINITIONS.map(({ code }) => code));
  const VALID_LOCALES = new Set(SUPPORTED_LOCALES);
  const LOCALE_ALIASES = Object.freeze(
    LOCALE_DEFINITIONS.reduce((aliases, locale) => {
      for (const alias of locale.aliases || []) {
        aliases[alias] = locale.code;
      }
      return aliases;
    }, {})
  );
  const LOCALE_LABELS = Object.freeze(
    LOCALE_DEFINITIONS.reduce((labels, locale) => {
      const displayName = locale.nativeName
        ? `${locale.code} - ${locale.name} (${locale.nativeName})`
        : `${locale.code} - ${locale.name}`;
      labels[locale.code] = displayName;
      return labels;
    }, {})
  );
  SUPPORTED_LOCALES.map((code) => LOCALE_LABELS[code]).join(' / ');

  const TRANSLATIONS = {
    af: TRANSLATION$n,
    ca: TRANSLATION$m,
    'zh-TW': TRANSLATION$l,
    cs: TRANSLATION$k,
    da: TRANSLATION$j,
    nl: TRANSLATION$i,
    'en-US': TRANSLATION$h,
    fi: TRANSLATION$g,
    fr: TRANSLATION$f,
    de: TRANSLATION$e,
    el: TRANSLATION$d,
    he: TRANSLATION$c,
    hu: TRANSLATION$b,
    it: TRANSLATION$a,
    ja: TRANSLATION$9,
    ko: TRANSLATION$8,
    pl: TRANSLATION$7,
    'pt-PT': TRANSLATION$6,
    'pt-BR': TRANSLATION$5,
    ru: TRANSLATION$4,
    es: TRANSLATION$3,
    sv: TRANSLATION$2,
    tr: TRANSLATION$1,
    uk: TRANSLATION,
  };

  /**
   * Returns the canonical locale for a supported locale string or alias.
   * Matching is case-insensitive after exact matches are checked.
   *
   * @param {string} lang Locale string or alias (e.g. 'en', 'fr', 'zh-TW').
   * @returns {string} Canonical locale code, or an empty string when unsupported.
   */
  function normalizeLocale(lang) {
    const s = typeof lang === 'string' ? lang.trim() : '';
    if (VALID_LOCALES.has(s)) {
      return s;
    }
    if (LOCALE_ALIASES[s]) {
      return LOCALE_ALIASES[s];
    }
    const normalized = s.toLowerCase();
    const found = Array.from(VALID_LOCALES).find((locale) => locale.toLowerCase() === normalized);
    return (
      found ||
      Object.entries(LOCALE_ALIASES).find(([alias]) => alias.toLowerCase() === normalized)?.[1] ||
      ''
    );
  }

  /**
   * Returns a valid canonical locale, falling back to the default when unsupported.
   *
   * @param {string} lang Locale string to validate.
   * @returns {string} Validated canonical locale.
   */
  function getLocale(lang) {
    return normalizeLocale(lang) || DEFAULT_LOCALE;
  }

  /**
   * Navigates a nested object following dot-separated key path segments.
   *
   * @param {object} obj Root object.
   * @param {string[]} parts Key path segments.
   * @returns {*} Value at the path, or undefined.
   */
  function getNestedValue(obj, parts) {
    let current = obj;
    for (const part of parts) {
      if (current == null || typeof current !== 'object') {
        return undefined;
      }
      current = current[part];
    }
    return current;
  }

  /**
   * Returns the raw translated value (string, array or object) for a key,
   * falling back to en-US when the key is missing in the requested locale.
   *
   * @param {string} key Dot-separated translation key.
   * @param {string} locale Locale code.
   * @returns {*} Raw value, or undefined when not found.
   */
  function tRaw(key, locale) {
    const lang = getLocale(locale);
    const parts = key.split('.');
    const value = getNestedValue(TRANSLATIONS[lang], parts);
    return value === undefined && lang !== DEFAULT_LOCALE
      ? getNestedValue(TRANSLATIONS[DEFAULT_LOCALE], parts)
      : value;
  }

  /**
   * Returns the text direction CSS for a locale.
   *
   * @param {string} locale Locale code.
   * @returns {string} CSS declarations, empty for left-to-right locales.
   */
  function getDirectionStyle(locale) {
    const lang = getLocale(locale);
    const def = LOCALE_DEFINITIONS.find((d) => d.code === lang);
    return def?.direction === 'rtl' ? 'direction:rtl;text-align:right;' : '';
  }

  /**
   * Returns the translated string for a dot-separated key, interpolating {placeholder} vars.
   * Falls back to en-US when the key is missing in the requested locale.
   * No HTML escaping is performed — callers must pre-escape HTML-unsafe values.
   *
   * @param {string} key Dot-separated translation key (e.g. 'errors.noTokensSelected').
   * @param {string} locale Locale code.
   * @param {object} [vars] Interpolation variables mapped to {placeholder} names.
   * @returns {string} Translated and interpolated string. Returns the key when not found.
   */
  function t(key, locale, vars = {}) {
    const lang = getLocale(locale);
    const parts = key.split('.');
    let value = getNestedValue(TRANSLATIONS[lang], parts);

    if (value === undefined && lang !== DEFAULT_LOCALE) {
      value = getNestedValue(TRANSLATIONS[DEFAULT_LOCALE], parts);
    }

    if (typeof value !== 'string') {
      return key;
    }

    return value.replaceAll(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
  }

  // Route parsing and compilation. Pure functions only: nothing here touches the
  // Roll20 API, so the module can be unit tested in Node.
  //
  // A route compiles into a track: the list of positions ("frames") a token
  // visits, starting where it starts. Patrols walk the track forwards, and
  // ping-pong routes walk it backwards again, so a token always retraces exactly
  // the cells it came along.

  // One step-code token: a direction with an optional distance, W (wait) with an
  // optional count, or S (stealth). Diagonals are matched before single letters.
  const CODE_TOKEN = /(UL|UR|DL|DR|U|D|L|R)(\d+)?|(W)(\d+)?|(S)/iy;
  const CODE_SEPARATOR = /[\s,;]+/y;

  /**
   * Parses a step code such as "U2R2D2L2", "UR3 W2 DL3" or "U0WWS".
   *
   * Directions are U, D, L, R and the diagonals UL, UR, DL, DR, each followed by
   * a distance in cells (default 1). A distance of 0 turns the token without
   * moving it. W waits one tick (W3 waits three). S toggles stealth: the token
   * moves between the token layer and the GM layer.
   *
   * @param {string} code Step code.
   * @returns {{ok: true, steps: object[]}|{ok: false, error: string, at?: string}}
   *          Parsed steps, or an error key ('empty', 'badToken', 'tooFar', 'tooLong').
   */
  function parseCode(code) {
    const text = typeof code === 'string' ? code.trim() : '';
    if (!text) {
      return { ok: false, error: 'empty' };
    }
    const steps = [];
    let index = 0;
    while (index < text.length) {
      CODE_SEPARATOR.lastIndex = index;
      if (CODE_SEPARATOR.test(text)) {
        index = CODE_SEPARATOR.lastIndex;
        continue;
      }
      CODE_TOKEN.lastIndex = index;
      const match = CODE_TOKEN.exec(text);
      if (!match) {
        return { ok: false, error: 'badToken', at: text.slice(index, index + 6) };
      }
      index = CODE_TOKEN.lastIndex;
      if (match[1]) {
        const distance = match[2] === undefined ? 1 : Number(match[2]);
        if (distance > MAX_STEP_DISTANCE) {
          return { ok: false, error: 'tooFar', at: match[0] };
        }
        const dir = match[1].toUpperCase();
        steps.push(distance === 0 ? { type: 'face', dir } : { type: 'move', dir, distance });
      } else if (match[3]) {
        const count = match[4] === undefined ? 1 : Number(match[4]);
        if (count < 1 || count > MAX_WAIT) {
          return { ok: false, error: 'tooFar', at: match[0] };
        }
        steps.push({ type: 'wait', count });
      } else {
        steps.push({ type: 'stealth' });
      }
    }
    if (steps.length === 0) {
      return { ok: false, error: 'empty' };
    }
    return { ok: true, steps };
  }

  /**
   * Writes steps back as a canonical step code.
   *
   * @param {object[]} steps Parsed steps.
   * @returns {string} Step code.
   */
  function stepsToCode(steps) {
    return steps
      .map((step) => {
        if (step.type === 'move') {
          return `${step.dir}${step.distance}`;
        }
        if (step.type === 'face') {
          return `${step.dir}0`;
        }
        if (step.type === 'wait') {
          return step.count === 1 ? 'W' : `W${step.count}`;
        }
        return 'S';
      })
      .join('');
  }

  /**
   * Returns true when a step code ends where it starts on a square grid
   * (moves cancel out). Used to pick a sensible default mode for new routes.
   *
   * @param {object[]} steps Parsed steps.
   * @returns {boolean} True when the moves cancel out.
   */
  function stepsReturnToStart(steps) {
    let x = 0;
    let y = 0;
    let moved = false;
    for (const step of steps) {
      if (step.type === 'move') {
        const [dx, dy] = DIRECTIONS[step.dir];
        x += dx * step.distance;
        y += dy * step.distance;
        moved = true;
      }
    }
    return moved && x === 0 && y === 0;
  }

  /**
   * Creates a track frame.
   *
   * @param {number[]} point [x, y].
   * @param {object} [extra] Extra frame fields.
   * @returns {object} Frame.
   */
  function frame([x, y], extra = {}) {
    return { x, y, end: true, ...extra };
  }

  /**
   * Compiles a step-code route into a track.
   *
   * @param {object[]} steps Parsed steps.
   * @param {object} grid Grid from grid.js.
   * @param {number[]} start [x, y] where the token starts.
   * @returns {object[]} Frames.
   */
  function compileSteps(steps, grid, start) {
    const frames = [frame(start)];
    let pos = start;
    // Hex zigzags keep close to the line they started on until a sideways move.
    let ref = null;
    for (const step of steps) {
      if (frames.length > MAX_TRACK_FRAMES) {
        break;
      }
      if (step.type === 'wait') {
        for (let i = 0; i < step.count; i++) {
          frames.push(frame(pos, { wait: true }));
        }
      } else if (step.type === 'stealth') {
        frames.push(frame(pos, { stealth: true }));
      } else if (step.type === 'face') {
        const [dx, dy] = DIRECTIONS[step.dir];
        frames.push(frame(pos, { face: bearing(dx, dy) }));
      } else {
        if (directionZigzags(grid, step.dir)) {
          ref = ref ?? lateralCoordinate(grid, pos);
        } else {
          ref = null;
        }
        for (let i = 0; i < step.distance; i++) {
          pos = stepFrom(grid, pos, step.dir, ref);
          frames.push(frame(pos, { end: i === step.distance - 1 }));
        }
      }
    }
    return frames;
  }

  /**
   * Compiles a waypoint route into a track, splitting each leg into steps about
   * one cell long.
   *
   * @param {object[]} points Waypoints: { x, y }, { wait: n } or { stealth: true }.
   * @param {object} grid Grid from grid.js.
   * @param {number[]} offset [dx, dy] added to every point (the start for
   *        token-anchored routes, [0, 0] for page-anchored ones).
   * @returns {object[]} Frames.
   */
  function compileWaypoints(points, grid, offset) {
    const pitch = cellPitch(grid);
    const frames = [];
    let pos = null;
    for (const point of points) {
      if (frames.length > MAX_TRACK_FRAMES) {
        break;
      }
      if (point.wait) {
        if (pos) {
          for (let i = 0; i < Math.min(point.wait, MAX_WAIT); i++) {
            frames.push(frame(pos, { wait: true }));
          }
        }
        continue;
      }
      if (point.stealth) {
        if (pos) {
          frames.push(frame(pos, { stealth: true }));
        }
        continue;
      }
      const target = [point.x + offset[0], point.y + offset[1]];
      if (!pos) {
        pos = target;
        frames.push(frame(pos));
        continue;
      }
      const length = Math.hypot(target[0] - pos[0], target[1] - pos[1]);
      if (length < POSITION_EPSILON) {
        continue;
      }
      const parts = Math.max(1, Math.round(length / pitch));
      for (let i = 1; i <= parts; i++) {
        const t = i / parts;
        frames.push(
          frame([pos[0] + (target[0] - pos[0]) * t, pos[1] + (target[1] - pos[1]) * t], {
            end: i === parts,
          })
        );
      }
      pos = target;
    }
    return frames;
  }

  /**
   * Compiles a route into a track.
   *
   * @param {object} route Route record (see state.js).
   * @param {object} grid Grid from grid.js.
   * @param {number[]} anchor [x, y] where the track starts (ignored for page-anchored routes).
   * @returns {object[]} Frames; empty when the route cannot be compiled.
   */
  function compileTrack(route, grid, anchor) {
    let frames;
    if (route.kind === ROUTE_KIND_CODE) {
      const parsed = parseCode(route.code);
      frames = parsed.ok ? compileSteps(parsed.steps, grid, anchor) : [];
    } else {
      const offset = route.anchor === ANCHOR_PAGE ? [0, 0] : anchor;
      frames = compileWaypoints(route.points || [], grid, offset);
    }
    return frames.slice(0, MAX_TRACK_FRAMES + 1);
  }

  /**
   * Returns the index of the next frame a patrol should move to.
   *
   * In segment movement, a patrol skips the frames inside a leg and stops only
   * at the end of each leg, wait or action.
   *
   * @param {object[]} frames Track.
   * @param {number} index Current frame index.
   * @param {number} dir 1 forwards, -1 backwards.
   * @param {string} mode Route mode: 'loop', 'pingpong' or 'once'.
   * @param {boolean} segment True for segment movement.
   * @returns {{index: number, dir: number, finished: boolean}} Next position.
   */
  function nextFrame(frames, index, dir, mode, segment) {
    const last = frames.length - 1;
    if (last <= 0) {
      return { index: 0, dir, finished: mode === 'once' };
    }
    // A closed loop's last frame is its first, so the wrap skips frame 0
    // rather than spending a tick standing still.
    const closed = trackIsClosed(frames);
    let i = index;
    let d = dir;
    for (let guard = 0; guard <= frames.length * 2; guard++) {
      if (d > 0 && i >= last) {
        if (mode === 'once') {
          return { index: last, dir: d, finished: true };
        }
        if (mode === 'loop') {
          i = 0;
          if (closed) {
            continue;
          }
        } else {
          d = -1;
          i -= 1;
        }
      } else if (d < 0 && i <= 0) {
        d = 1;
        i += 1;
      } else {
        i += d;
      }
      if (!segment || frames[i].end || i === 0 || i === last) {
        return { index: i, dir: d, finished: false };
      }
    }
    return { index: i, dir: d, finished: false };
  }

  /**
   * Returns true when a track's last frame is where it started, so looping does
   * not jump.
   *
   * @param {object[]} frames Track.
   * @returns {boolean} True when closed.
   */
  function trackIsClosed(frames) {
    if (frames.length < 2) {
      return true;
    }
    const first = frames[0];
    const last = frames.at(-1);
    return Math.hypot(first.x - last.x, first.y - last.y) < POSITION_EPSILON;
  }

  /**
   * Counts the frames that fall outside a page.
   *
   * @param {object[]} frames Track.
   * @param {number} widthPx Page width in pixels.
   * @param {number} heightPx Page height in pixels.
   * @returns {number} Number of frames off the page.
   */
  function framesOffPage(frames, widthPx, heightPx) {
    return frames.filter((f) => f.x < 0 || f.y < 0 || f.x > widthPx || f.y > heightPx).length;
  }

  /**
   * Returns the rotation for a token facing a bearing, given which way its art faces.
   *
   * @param {number} heading Bearing in degrees (0 = up the screen).
   * @param {string} facing Setting: 'up', 'down', 'left' or 'right' (the way the art faces).
   * @returns {number} Roll20 rotation in degrees.
   */
  function rotationFor(heading, facing) {
    const offsets = { up: 0, right: -90, down: 180, left: 90 };
    const rotation = heading + (offsets[facing] ?? 0);
    return Math.round(((rotation % 360) + 360) % 360);
  }

  /**
   * Converts recorded absolute positions into a route: a step code when every
   * move is a whole number of cells in one of the eight directions on a square
   * grid, otherwise token-relative waypoints.
   *
   * @param {object[]} entries Recorded entries: { x, y }, { wait: 1 } or { stealth: true }.
   *        The first entry must be the start position.
   * @param {object} grid Grid from grid.js.
   * @returns {{kind: 'code', code: string}|{kind: 'waypoints', points: object[]}|null}
   *          Route fields, or null when nothing was recorded.
   */
  function recordingToRoute(entries, grid) {
    const [start] = entries;
    if (!start || entries.length < 2) {
      return null;
    }
    const relative = entries.map((e) =>
      'x' in e ? { x: e.x - start.x, y: e.y - start.y } : { ...e }
    );

    if (grid.kind === 'square') {
      const steps = [];
      let prev = relative[0];
      let representable = true;
      for (const entry of relative.slice(1)) {
        if (entry.wait) {
          steps.push({ type: 'wait', count: 1 });
          continue;
        }
        if (entry.stealth) {
          steps.push({ type: 'stealth' });
          continue;
        }
        const cx = (entry.x - prev.x) / grid.unit;
        const cy = (entry.y - prev.y) / grid.unit;
        prev = entry;
        if (Math.abs(cx) < 0.01 && Math.abs(cy) < 0.01) {
          continue;
        }
        const rx = Math.round(cx);
        const ry = Math.round(cy);
        const straight = rx === 0 || ry === 0 || Math.abs(rx) === Math.abs(ry);
        if (Math.abs(cx - rx) > 0.01 || Math.abs(cy - ry) > 0.01 || !straight) {
          representable = false;
          break;
        }
        const dir = `${ry < 0 ? 'U' : ry > 0 ? 'D' : ''}${rx < 0 ? 'L' : rx > 0 ? 'R' : ''}`;
        const distance = Math.max(Math.abs(rx), Math.abs(ry));
        const previous = steps.at(-1);
        if (previous?.type === 'move' && previous.dir === dir) {
          previous.distance += distance;
        } else {
          steps.push({ type: 'move', dir, distance });
        }
      }
      if (representable && steps.length > 0) {
        return { kind: 'code', code: stepsToCode(steps) };
      }
    }

    return { kind: 'waypoints', points: relative };
  }

  // ---------------------------------------------------------------------------
  // Value validation (pure)
  // ---------------------------------------------------------------------------

  /**
   * Parses an interval in milliseconds. Values under 10 are taken as seconds,
   * as v4 did.
   *
   * @param {*} raw Raw input.
   * @returns {number|null} Interval in ms, or null when invalid.
   */
  function parseInterval(raw) {
    const n = typeof raw === 'number' ? Math.trunc(raw) : parseStrictInt(raw);
    if (n === null || !Number.isFinite(n) || n < 1) {
      return null;
    }
    return clamp(n < 10 ? n * 1000 : n, MIN_INTERVAL, MAX_INTERVAL);
  }

  /**
   * Validates one configuration value.
   *
   * @param {string} key Config key.
   * @param {*} raw Raw value.
   * @returns {{valid: boolean, value?: *}} Result; `value` is the normalised value when valid.
   */
  function validateConfigValue(key, raw) {
    const ok = (value) => ({ valid: true, value });
    const bad = { valid: false };
    const option = (list) => {
      const text = toText(raw).toLowerCase();
      const found = list.find((o) => o.toLowerCase() === text);
      return found ? ok(found) : bad;
    };

    switch (key) {
      case 'language': {
        const lang = normalizeLocale(raw);
        return lang ? ok(lang) : bad;
      }
      case 'interval': {
        const ms = parseInterval(raw);
        return ms === null ? bad : ok(ms);
      }
      case 'movement':
        return option(MOVEMENT_OPTIONS);
      case 'facing':
        return option(FACING_OPTIONS);
      case 'combatDetection':
        return option(COMBAT_DETECTION_OPTIONS);
      case 'combatBehaviour':
        return option(COMBAT_BEHAVIOUR_OPTIONS);
      case 'lockMode':
        return option(LOCK_MODE_OPTIONS);
      case 'followMode':
        return option(FOLLOW_MODE_OPTIONS);
      case 'manualMove':
        return option(MANUAL_MOVE_OPTIONS);
      case 'lockMarker': {
        const text = toText(raw);
        if (!text || ['none', 'off', '-'].includes(text.toLowerCase())) {
          return ok('none');
        }
        return /^[\w:-]{1,60}$/.test(text) ? ok(text) : bad;
      }
      case 'buttonStep': {
        const n = typeof raw === 'number' ? Math.trunc(raw) : parseStrictInt(raw);
        return n === null || n < 1 ? bad : ok(clamp(n, 1, MAX_BUTTON_STEP));
      }
      default:
        return bad;
    }
  }

  /**
   * Merges a possibly incomplete or invalid config with defaults.
   *
   * @param {object} config Config to merge.
   * @param {object} [defaults] Defaults to fall back on.
   * @returns {object} Complete config.
   */
  function mergeConfig(config, defaults = DEFAULT_CONFIG) {
    const c = isRecord(config) ? config : {};
    const merged = {};
    for (const key of Object.keys(DEFAULT_CONFIG)) {
      const result = key in c ? validateConfigValue(key, c[key]) : { valid: false };
      merged[key] = result.valid ? result.value : defaults[key];
    }
    return merged;
  }

  /**
   * Cleans a route name: trims it, drops characters that break chat buttons and
   * limits its length.
   *
   * @param {*} raw Raw name.
   * @returns {string} Clean name (may be empty).
   */
  function cleanName(raw) {
    return toText(raw)
      .replaceAll(/["|{}[\]\\]/g, '')
      .replaceAll(/\s+/g, ' ')
      .slice(0, MAX_NAME_LENGTH)
      .trim();
  }

  /**
   * Validates one route option.
   *
   * @param {string} key Option: mode, interval, maxTokens or randomStart.
   * @param {*} raw Raw value.
   * @returns {{valid: boolean, value?: *}} Result.
   */
  function validateRouteOption(key, raw) {
    const text = toText(raw).toLowerCase();
    const off = ['', '0', 'off', 'none', 'default', '-'].includes(text);
    switch (key) {
      case 'mode':
        return ROUTE_MODE_OPTIONS.includes(text) ? { valid: true, value: text } : { valid: false };
      case 'interval': {
        if (off) {
          return { valid: true, value: null };
        }
        const ms = parseInterval(raw);
        return ms === null ? { valid: false } : { valid: true, value: ms };
      }
      case 'maxTokens': {
        if (off) {
          return { valid: true, value: null };
        }
        const n = parseStrictInt(raw);
        return n === null || n < 1
          ? { valid: false }
          : { valid: true, value: Math.min(n, MAX_TOKENS_PER_ROUTE) };
      }
      case 'randomStart': {
        const b = parseBoolean(raw);
        return b === null ? { valid: false } : { valid: true, value: b };
      }
      default:
        return { valid: false };
    }
  }

  /**
   * Normalises a stored waypoint list.
   *
   * @param {*} raw Stored points.
   * @returns {object[]} Clean points.
   */
  function normalisePoints(raw) {
    if (!Array.isArray(raw)) {
      return [];
    }
    const points = [];
    for (const p of raw) {
      if (isRecord(p) && Number.isFinite(p.x) && Number.isFinite(p.y)) {
        points.push({ x: p.x, y: p.y });
      } else if (isRecord(p) && Number.isInteger(p.wait) && p.wait > 0) {
        points.push({ wait: p.wait });
      } else if (isRecord(p) && p.stealth === true) {
        points.push({ stealth: true });
      }
    }
    return points;
  }

  /**
   * Normalises a fixed start position.
   *
   * @param {*} raw Stored start.
   * @returns {object|null} { pageId, left, top, rotation } or null.
   */
  function normaliseStart(raw) {
    if (!isRecord(raw) || !toText(raw.pageId)) {
      return null;
    }
    const left = Number(raw.left);
    const top = Number(raw.top);
    if (!Number.isFinite(left) || !Number.isFinite(top)) {
      return null;
    }
    return {
      pageId: toText(raw.pageId),
      left,
      top,
      rotation: Number.isFinite(Number(raw.rotation)) ? Number(raw.rotation) : null,
    };
  }

  /**
   * Normalises one stored route, or returns null when it is unusable.
   *
   * @param {*} raw Stored route.
   * @returns {object|null} Clean route.
   */
  function normaliseRoute(raw) {
    if (!isRecord(raw) || !toText(raw.id) || !cleanName(raw.name)) {
      return null;
    }
    const route = {
      id: toText(raw.id),
      name: cleanName(raw.name),
      kind: raw.kind === ROUTE_KIND_WAYPOINTS ? ROUTE_KIND_WAYPOINTS : ROUTE_KIND_CODE,
      mode: ROUTE_MODE_OPTIONS.includes(raw.mode) ? raw.mode : 'pingpong',
      interval: validateRouteOption('interval', raw.interval ?? '').value ?? null,
      maxTokens: validateRouteOption('maxTokens', raw.maxTokens ?? '').value ?? null,
      randomStart: raw.randomStart === true,
      start: normaliseStart(raw.start),
    };
    if (route.kind === ROUTE_KIND_CODE) {
      if (!parseCode(raw.code).ok) {
        return null;
      }
      route.code = toText(raw.code);
    } else {
      route.anchor = raw.anchor === ANCHOR_PAGE ? ANCHOR_PAGE : ANCHOR_TOKEN;
      route.points = normalisePoints(raw.points);
      if (route.anchor === ANCHOR_PAGE) {
        route.pageId = toText(raw.pageId);
      }
      if (route.points.filter((p) => 'x' in p).length < 2) {
        return null;
      }
    }
    return route;
  }

  // ---------------------------------------------------------------------------
  // State shape and migration (pure)
  // ---------------------------------------------------------------------------

  /**
   * Creates an empty v5 state object.
   *
   * @returns {object} Fresh state.
   */
  function createDefaultState() {
    return {
      schemaVersion: SCHEMA_VERSION,
      version: SCRIPT_VERSION,
      config: { ...DEFAULT_CONFIG },
      routes: {},
      nextId: 1,
      patrols: {},
      locks: {},
      follows: {},
      leaders: {},
      recordings: {},
      calibrations: {},
      combat: { manual: false, active: false, turnId: null },
      paused: false,
      notices: {},
    };
  }

  /**
   * Normalises a saved token position.
   *
   * @param {*} raw Stored position.
   * @returns {object|null} { left, top, rotation, layer? } or null.
   */
  function normalisePosition(raw) {
    if (!isRecord(raw)) {
      return null;
    }
    const left = Number(raw.left);
    const top = Number(raw.top);
    if (!Number.isFinite(left) || !Number.isFinite(top)) {
      return null;
    }
    const pos = { left, top, rotation: Number(raw.rotation) || 0 };
    if (toText(raw.layer)) {
      pos.layer = toText(raw.layer);
    }
    return pos;
  }

  /**
   * Normalises one stored patrol.
   *
   * @param {*} raw Stored patrol.
   * @param {object} routes Clean routes by ID.
   * @returns {object|null} Clean patrol.
   */
  function normalisePatrol(raw, routes) {
    if (!isRecord(raw) || !routes[raw.routeId]) {
      return null;
    }
    const anchor =
      Array.isArray(raw.anchor) && raw.anchor.length === 2 && raw.anchor.every(Number.isFinite)
        ? [raw.anchor[0], raw.anchor[1]]
        : null;
    return {
      routeId: raw.routeId,
      pageId: toText(raw.pageId),
      index: Number.isInteger(raw.index) && raw.index >= 0 ? raw.index : 0,
      dir: raw.dir === -1 ? -1 : 1,
      anchor,
      origin: normalisePosition(raw.origin),
      dueAt: Number(raw.dueAt) || 0,
    };
  }

  /**
   * Converts v4 state (`storedVariables`) into a clean v5 state.
   *
   * v4 kept everything in arrays keyed by name: `paths` (name, path code,
   * isCycle and the 4.x options), `activeTokenPaths` (tokens on paths, by path
   * name), `tokenMemory` (locked and following tokens) and `pathDrafts`
   * (unfinished paths built with the menu buttons). Drafts with any steps are
   * kept as routes so no work is lost.
   *
   * @param {object} vars v4 storedVariables.
   * @returns {object} Clean v5 state.
   */
  function migrateV4(vars) {
    const fresh = createDefaultState();
    const v4Interval = parseInterval(vars.interval);
    fresh.config = {
      ...DEFAULT_CONFIG,
      interval: v4Interval ?? 5000,
      movement: vars.subStepMovement === true ? 'cell' : 'segment',
      facing: vars.rotateTokens === true ? 'down' : 'off',
      combatBehaviour: vars.combatPatrol === true ? 'step' : 'pause',
      combatDetection: 'tracker',
      lockMode: 'revert',
      lockMarker: 'red',
      followMode: 'trail',
      buttonStep: validateConfigValue('buttonStep', vars.unitPerClick).value ?? 1,
    };

    const byName = {};
    const addRoute = (route) => {
      const clean = normaliseRoute({ ...route, id: `r${fresh.nextId}` });
      if (!clean || byName[clean.name.toLowerCase()]) {
        return null;
      }
      fresh.nextId++;
      fresh.routes[clean.id] = clean;
      byName[clean.name.toLowerCase()] = clean;
      return clean;
    };

    for (const p of Array.isArray(vars.paths) ? vars.paths : []) {
      if (!isRecord(p)) {
        continue;
      }
      // 4.0.0 could store the path record itself in `path` by mistake.
      const code = typeof p.path === 'string' ? p.path : toText(p.path?.path);
      // v4 worked out isCycle when a path was first started if it was missing.
      const parsed = parseCode(code);
      const cycles = p.isCycle ?? (parsed.ok && stepsReturnToStart(parsed.steps));
      addRoute({
        name: p.name,
        kind: ROUTE_KIND_CODE,
        code,
        mode: p.runOnce === true ? 'once' : cycles ? 'loop' : 'pingpong',
        interval: p.intervalOverride,
        maxTokens: p.maxTokens,
        randomStart: p.randomStart === true,
        start:
          p.fixedStart === true
            ? {
                pageId: p.startPageId,
                left: p.startLeft,
                top: p.startTop,
                rotation: p.startRotation,
              }
            : null,
      });
    }

    for (const d of Array.isArray(vars.pathDrafts) ? vars.pathDrafts : []) {
      if (isRecord(d) && toText(d.path)) {
        const code = toText(d.path);
        const parsed = parseCode(code);
        addRoute({
          name: `${cleanName(d.name)} (draft)`,
          kind: ROUTE_KIND_CODE,
          code,
          mode: parsed.ok && stepsReturnToStart(parsed.steps) ? 'loop' : 'pingpong',
        });
      }
    }

    for (const tp of Array.isArray(vars.activeTokenPaths) ? vars.activeTokenPaths : []) {
      const route = isRecord(tp) ? byName[cleanName(tp.pathName).toLowerCase()] : null;
      const tokenId = toText(tp?.tokenId);
      // v4 allowed several paths per token; v5 keeps the first.
      if (!route || !tokenId || fresh.patrols[tokenId]) {
        continue;
      }
      fresh.patrols[tokenId] = {
        routeId: route.id,
        pageId: toText(tp.pageId),
        index: 0,
        dir: 1,
        // Re-anchored at the token's current position on startup.
        anchor: null,
        origin: normalisePosition({
          left: tp.initialLeft,
          top: tp.initialTop,
          rotation: tp.initialRotation,
        }),
        dueAt: 0,
      };
    }

    for (const tm of Array.isArray(vars.tokenMemory) ? vars.tokenMemory : []) {
      const tokenId = toText(tm?.tokenId);
      if (!tokenId) {
        continue;
      }
      if (tm.isLocked === true) {
        const pos = normalisePosition(tm);
        if (pos) {
          fresh.locks[tokenId] = {
            pageId: toText(tm.pageId),
            ...pos,
            marker: 'red',
            mode: 'revert',
            native: false,
          };
        }
      } else if (tm.isFollowing === true && toText(tm.followingTokenId)) {
        fresh.follows[tokenId] = { leaderId: toText(tm.followingTokenId), offset: null };
      }
    }

    fresh.notices.migratedV4 = {
      routes: Object.keys(fresh.routes).length,
      patrols: Object.keys(fresh.patrols).length,
      unitPx: Number(vars.unitPx) || 70,
    };
    return fresh;
  }

  /**
   * Converts any stored state (v4, v5 or damaged) into a clean v5 state.
   *
   * @param {*} raw Stored state.
   * @returns {{state: object, migratedFrom: number|null}} Clean state and the
   *          major version it was migrated from (null when no migration was needed).
   */
  function migrateState(raw) {
    if (!isRecord(raw)) {
      return { state: createDefaultState(), migratedFrom: null };
    }
    if (isRecord(raw.storedVariables) && raw.schemaVersion !== SCHEMA_VERSION) {
      return { state: migrateV4(raw.storedVariables), migratedFrom: 4 };
    }

    const fresh = createDefaultState();
    fresh.config = mergeConfig(raw.config);
    fresh.nextId = Number.isInteger(raw.nextId) && raw.nextId > 0 ? raw.nextId : 1;
    if (isRecord(raw.routes)) {
      for (const value of Object.values(raw.routes)) {
        const route = normaliseRoute(value);
        if (route) {
          fresh.routes[route.id] = route;
          const n = Number(route.id.replace(/^r/, ''));
          if (Number.isInteger(n) && n >= fresh.nextId) {
            fresh.nextId = n + 1;
          }
        }
      }
    }
    if (isRecord(raw.patrols)) {
      for (const [tokenId, value] of Object.entries(raw.patrols)) {
        const patrol = normalisePatrol(value, fresh.routes);
        if (patrol) {
          fresh.patrols[tokenId] = patrol;
        }
      }
    }
    if (isRecord(raw.locks)) {
      for (const [tokenId, value] of Object.entries(raw.locks)) {
        const pos = normalisePosition(value);
        if (pos) {
          fresh.locks[tokenId] = {
            pageId: toText(value.pageId),
            ...pos,
            marker: toText(value.marker) || 'none',
            // Locks saved before modes were stored undo moves, unless native.
            mode: LOCK_MODE_OPTIONS.includes(value.mode)
              ? value.mode
              : value.native === true
                ? 'native'
                : 'revert',
            native: value.native === true,
          };
        }
      }
    }
    if (isRecord(raw.follows)) {
      for (const [tokenId, value] of Object.entries(raw.follows)) {
        if (isRecord(value) && toText(value.leaderId) && value.leaderId !== tokenId) {
          const offset =
            Array.isArray(value.offset) && value.offset.every(Number.isFinite)
              ? [value.offset[0], value.offset[1]]
              : null;
          fresh.follows[tokenId] = { leaderId: toText(value.leaderId), offset };
        }
      }
    }
    if (isRecord(raw.leaders)) {
      for (const [playerId, tokenId] of Object.entries(raw.leaders)) {
        if (toText(tokenId)) {
          fresh.leaders[playerId] = toText(tokenId);
        }
      }
    }
    if (isRecord(raw.recordings)) {
      for (const [id, rec] of Object.entries(raw.recordings)) {
        if (
          isRecord(rec) &&
          toText(rec.tokenId) &&
          cleanName(rec.name) &&
          Array.isArray(rec.entries)
        ) {
          fresh.recordings[id] = {
            id,
            name: cleanName(rec.name),
            tokenId: toText(rec.tokenId),
            pageId: toText(rec.pageId),
            entries: normalisePoints(rec.entries),
          };
        }
      }
    }
    if (isRecord(raw.calibrations)) {
      for (const [pageId, cal] of Object.entries(raw.calibrations)) {
        if (isRecord(cal) && [cal.dx, cal.dy, cal.scale].every(Number.isFinite) && cal.scale > 0) {
          fresh.calibrations[pageId] = { dx: cal.dx, dy: cal.dy, scale: cal.scale };
        }
      }
    }
    if (isRecord(raw.combat)) {
      fresh.combat = {
        manual: raw.combat.manual === true,
        active: raw.combat.active === true,
        turnId: toText(raw.combat.turnId) || null,
      };
    }
    fresh.paused = raw.paused === true;
    if (isRecord(raw.notices)) {
      fresh.notices = { ...raw.notices };
    }
    return { state: fresh, migratedFrom: null };
  }

  // ---------------------------------------------------------------------------
  // Persistent state access (Roll20)
  // ---------------------------------------------------------------------------

  /**
   * Loads, migrates and validates the persistent state. Call once on ready.
   *
   * @returns {number|null} The major version migrated from, or null.
   */
  function initialiseState() {
    const { state: clean, migratedFrom } = migrateState(state[STATE_KEY]);
    clean.version = SCRIPT_VERSION;
    state[STATE_KEY] = clean;
    return migratedFrom;
  }

  /**
   * Returns the persistent state, creating it when missing.
   *
   * @returns {object} State branch.
   */
  function getState() {
    if (!isRecord(state[STATE_KEY]) || state[STATE_KEY].schemaVersion !== SCHEMA_VERSION) {
      initialiseState();
    }
    return state[STATE_KEY];
  }

  /**
   * Returns the global configuration.
   *
   * @returns {object} Config.
   */
  function getConfig() {
    return getState().config;
  }

  /**
   * Sets one global configuration value.
   *
   * @param {string} key Config key.
   * @param {*} raw Raw value.
   * @returns {{valid: boolean, value?: *}} Validation result.
   */
  function setConfigValue(key, raw) {
    if (!(key in DEFAULT_CONFIG)) {
      return { valid: false };
    }
    const result = validateConfigValue(key, raw);
    if (result.valid) {
      getState().config[key] = result.value;
    }
    return result;
  }

  /**
   * Imports Roll20 One-Click useroptions into the persisted config. Options are
   * only re-applied when the GM changes them, so chat changes survive restarts.
   *
   * @returns {void}
   */
  function applyGlobalConfig() {
    if (typeof globalconfig === 'undefined' || !isRecord(globalconfig)) {
      return;
    }
    const branch = globalconfig[STATE_KEY.toLowerCase()] || globalconfig[STATE_KEY];
    if (!isRecord(branch)) {
      return;
    }
    const options = isRecord(branch.useroptions) ? branch.useroptions : branch;
    const s = getState();
    const applied = isRecord(s.notices.useroptions) ? s.notices.useroptions : {};
    for (const key of USEROPTION_KEYS) {
      if (key in options && options[key] !== applied[key]) {
        setConfigValue(key, options[key]);
        applied[key] = options[key];
      }
    }
    s.notices.useroptions = applied;
  }

  // ---------------------------------------------------------------------------
  // Routes
  // ---------------------------------------------------------------------------

  /**
   * Returns every route, sorted by name.
   *
   * @returns {object[]} Routes.
   */
  function listRoutes() {
    return Object.values(getState().routes).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );
  }

  /**
   * Finds a route by `#id` or by name (case-insensitive).
   *
   * @param {string} ref Route reference.
   * @returns {object|null} Route.
   */
  function findRoute(ref) {
    const text = toText(ref);
    if (!text) {
      return null;
    }
    const routes = getState().routes;
    if (text.startsWith('#')) {
      return routes[text.slice(1)] || null;
    }
    const lower = cleanName(text).toLowerCase();
    return Object.values(routes).find((r) => r.name.toLowerCase() === lower) || null;
  }

  /**
   * Adds a route, giving it a new ID.
   *
   * @param {object} fields Route fields (name, kind, code or points, options).
   * @returns {object|null} The stored route, or null when invalid.
   */
  function addRoute(fields) {
    const s = getState();
    const route = normaliseRoute({ ...fields, id: `r${s.nextId}` });
    if (!route) {
      return null;
    }
    s.nextId++;
    s.routes[route.id] = route;
    return route;
  }

  /**
   * Replaces a route's fields, keeping its ID.
   *
   * @param {string} id Route ID.
   * @param {object} fields Fields to change.
   * @returns {object|null} The updated route, or null when the result is invalid.
   */
  function updateRoute(id, fields) {
    const s = getState();
    const current = s.routes[id];
    if (!current) {
      return null;
    }
    const route = normaliseRoute({ ...current, ...fields, id });
    if (route) {
      s.routes[id] = route;
    }
    return route;
  }

  /**
   * Removes a route and any patrols on it.
   *
   * @param {string} id Route ID.
   * @returns {string[]} IDs of tokens that were on the route.
   */
  function deleteRoute(id) {
    const s = getState();
    delete s.routes[id];
    const stopped = [];
    for (const [tokenId, patrol] of Object.entries(s.patrols)) {
      if (patrol.routeId === id) {
        delete s.patrols[tokenId];
        stopped.push(tokenId);
      }
    }
    return stopped;
  }

  // ---------------------------------------------------------------------------
  // Patrols, locks, follows and recordings
  // ---------------------------------------------------------------------------

  /**
   * Returns all patrols keyed by token ID.
   *
   * @returns {object} Patrols.
   */
  function getPatrols() {
    return getState().patrols;
  }

  /**
   * Returns all locks keyed by token ID.
   *
   * @returns {object} Locks.
   */
  function getLocks() {
    return getState().locks;
  }

  /**
   * Returns all follows keyed by follower token ID.
   *
   * @returns {object} Follows.
   */
  function getFollows() {
    return getState().follows;
  }

  /**
   * Returns all recordings keyed by ID.
   *
   * @returns {object} Recordings.
   */
  function getRecordings() {
    return getState().recordings;
  }

  /**
   * Creates a recording session.
   *
   * @param {string} name Route name to save as.
   * @param {string} tokenId Token being recorded.
   * @param {string} pageId Token's page.
   * @param {number[]} start [x, y] start position.
   * @returns {object} Recording.
   */
  function addRecording(name, tokenId, pageId, start) {
    const s = getState();
    const id = `d${s.nextId++}`;
    s.recordings[id] = {
      id,
      name,
      tokenId,
      pageId,
      entries: [{ x: start[0], y: start[1] }],
    };
    return s.recordings[id];
  }

  /**
   * Finds a recording by `#id` or by name (case-insensitive).
   *
   * @param {string} ref Recording reference.
   * @returns {object|null} Recording.
   */
  function findRecording(ref) {
    const text = toText(ref);
    const recordings = getState().recordings;
    if (text.startsWith('#')) {
      return recordings[text.slice(1)] || null;
    }
    const lower = cleanName(text).toLowerCase();
    return Object.values(recordings).find((r) => r.name.toLowerCase() === lower) || null;
  }

  /**
   * Returns the recording a token is being recorded in.
   *
   * @param {string} tokenId Token ID.
   * @returns {object|null} Recording.
   */
  function getRecordingForToken(tokenId) {
    return Object.values(getState().recordings).find((r) => r.tokenId === tokenId) || null;
  }

  /**
   * Returns a page's grid calibration.
   *
   * @param {string} pageId Page ID.
   * @returns {object|null} Calibration.
   */
  function getCalibration(pageId) {
    return getState().calibrations[pageId] || null;
  }

  /**
   * Stores or clears a page's grid calibration.
   *
   * @param {string} pageId Page ID.
   * @param {object|null} calibration Calibration, or null to clear.
   * @returns {void}
   */
  function setCalibration(pageId, calibration) {
    const calibrations = getState().calibrations;
    if (calibration) {
      calibrations[pageId] = { ...calibration };
    } else {
      delete calibrations[pageId];
    }
  }

  /**
   * Forgets everything stored about a token.
   *
   * @param {string} tokenId Token ID.
   * @returns {void}
   */
  function forgetToken(tokenId) {
    const s = getState();
    delete s.patrols[tokenId];
    delete s.locks[tokenId];
    delete s.follows[tokenId];
    for (const [followerId, follow] of Object.entries(s.follows)) {
      if (follow.leaderId === tokenId) {
        delete s.follows[followerId];
      }
    }
    for (const [playerId, leaderId] of Object.entries(s.leaders)) {
      if (leaderId === tokenId) {
        delete s.leaders[playerId];
      }
    }
    for (const [id, rec] of Object.entries(s.recordings)) {
      if (rec.tokenId === tokenId) {
        delete s.recordings[id];
      }
    }
  }

  /**
   * Returns the createGrid options for a page, without any calibration.
   *
   * @param {object} page Roll20 page.
   * @returns {object} Grid options.
   */
  function pageGridOptions(page) {
    return {
      gridType: page.get('grid_type') || 'square',
      snapping: Number(page.get('snapping_increment')),
      showGrid: page.get('showgrid') !== false,
      jumpgate: isJumpgate(),
      // Set by Jumpgate's map alignment tool.
      offsetX: Number(page.get('grid_offset_x')) || 0,
      offsetY: Number(page.get('grid_offset_y')) || 0,
    };
  }

  /**
   * Returns everything needed to move tokens on a page. The grid is read from
   * the page every time, so resizing a page or changing its grid takes effect
   * at once.
   *
   * @param {string} pageId Page ID.
   * @returns {{page: object, grid: object, widthPx: number, heightPx: number}|null}
   *          Page context, or null when the page does not exist.
   */
  function getPageContext(pageId) {
    const page = pageId ? getObj('page', pageId) : null;
    if (!page) {
      return null;
    }
    return {
      page,
      grid: createGrid({ ...pageGridOptions(page), calibration: getCalibration(pageId) }),
      widthPx: (Number(page.get('width')) || 0) * PAGE_UNIT_PX,
      heightPx: (Number(page.get('height')) || 0) * PAGE_UNIT_PX,
    };
  }

  // Turns Roll20 drawings into route waypoints. Pure functions only: callers
  // pass plain property objects, so the module can be unit tested in Node.
  // The geometry is shared with Hexploration v2.
  //
  // Both kinds of Roll20 path store points relative to their own bounding box
  // and are placed by their centre:
  //   - Legacy `path`: `_path` is a JSON list of SVG-like commands (M, L, Q, C),
  //     placed by left/top, sized by width/height, scaled by scaleX/scaleY.
  //   - Jumpgate `pathv2`: `points` is a JSON list of [x, y] pairs interpreted by
  //     `shape` (pol, free, rec, eli and others) and placed by x/y. It has no scale.
  // Both can be rotated by `rotation` degrees about their centre.

  const UNIT_PX = 70;
  const ELLIPSE_SEGMENTS = 16;
  const CURVE_SEGMENTS = 8;

  // Freehand drawings have a point every few pixels. Points closer together
  // than this are merged so the route keeps its shape without thousands of legs.
  const SIMPLIFY_PX = 10;

  /**
   * Returns the bounding box of a list of points.
   *
   * @param {number[][]} points Array of [x, y].
   * @returns {{left: number, top: number, right: number, bottom: number}} Bounding box.
   */
  function boundingBox(points) {
    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;
    for (const [x, y] of points) {
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
    return { left, top, right, bottom };
  }

  /**
   * Builds a transform from path-local coordinates to page pixels.
   *
   * @param {object} t Transform values.
   * @returns {(x: number, y: number) => number[]} Point transform.
   */
  function makeTransform({ width, height, cx, cy, scaleX = 1, scaleY = 1, rotation = 0 }) {
    const angle = ((Number(rotation) || 0) * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return (x, y) => {
      const lx = (x - width / 2) * scaleX;
      const ly = (y - height / 2) * scaleY;
      return [cx + lx * cos - ly * sin, cy + lx * sin + ly * cos];
    };
  }

  /**
   * Samples a quadratic Bezier curve.
   *
   * @param {number[]} p0 Start point.
   * @param {number[]} p1 Control point.
   * @param {number[]} p2 End point.
   * @returns {number[][]} Points after the start point.
   */
  function sampleQuadratic(p0, p1, p2) {
    const points = [];
    for (let i = 1; i <= CURVE_SEGMENTS; i++) {
      const t = i / CURVE_SEGMENTS;
      const u = 1 - t;
      points.push([
        u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
        u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
      ]);
    }
    return points;
  }

  /**
   * Samples a cubic Bezier curve.
   *
   * @param {number[]} p0 Start point.
   * @param {number[]} p1 First control point.
   * @param {number[]} p2 Second control point.
   * @param {number[]} p3 End point.
   * @returns {number[][]} Points after the start point.
   */
  function sampleCubic(p0, p1, p2, p3) {
    const points = [];
    for (let i = 1; i <= CURVE_SEGMENTS; i++) {
      const t = i / CURVE_SEGMENTS;
      const u = 1 - t;
      const a = u * u * u;
      const b = 3 * u * u * t;
      const c = 3 * u * t * t;
      const d = t * t * t;
      points.push([
        a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
        a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1],
      ]);
    }
    return points;
  }

  /**
   * Converts a Legacy path's command list into rings in path-local coordinates.
   *
   * @param {Array[]} commands Parsed `_path` commands.
   * @returns {number[][][]} Rings.
   */
  function legacyCommandsToRings(commands) {
    const rings = [];
    let ring = [];
    let prevType = null;
    for (const cmd of commands) {
      if (!Array.isArray(cmd)) {
        continue;
      }
      const [type, ...args] = cmd;
      const nums = args.map(Number);
      const prev = ring.at(-1);
      if (type === 'M' && prevType !== 'M') {
        if (ring.length > 0) {
          rings.push(ring);
        }
        ring = [[nums[0], nums[1]]];
      } else if (type === 'L' || type === 'M') {
        // Two consecutive Ms are drawn by Roll20 as a line, so treat the second as L.
        ring.push([nums[0], nums[1]]);
      } else if (type === 'Q' && prev) {
        ring.push(...sampleQuadratic(prev, [nums[0], nums[1]], [nums[2], nums[3]]));
      } else if (type === 'C' && prev) {
        ring.push(...sampleCubic(prev, [nums[0], nums[1]], [nums[2], nums[3]], [nums[4], nums[5]]));
      }
      prevType = type;
    }
    if (ring.length > 0) {
      rings.push(ring);
    }
    return rings;
  }

  /**
   * Returns points approximating an ellipse inside a box.
   *
   * @param {number} width Box width.
   * @param {number} height Box height.
   * @returns {number[][]} Points in box-local coordinates.
   */
  function ellipsePoints(width, height) {
    const points = [];
    for (let i = 0; i < ELLIPSE_SEGMENTS; i++) {
      const angle = (i / ELLIPSE_SEGMENTS) * Math.PI * 2;
      points.push([
        width / 2 + (Math.cos(angle) * width) / 2,
        height / 2 + (Math.sin(angle) * height) / 2,
      ]);
    }
    return points;
  }

  /**
   * Parses a JSON string, returning null on failure.
   *
   * @param {string} text JSON text.
   * @returns {*} Parsed value, or null.
   */
  function safeJson(text) {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  /**
   * Converts a Legacy path's properties into page-space rings.
   *
   * @param {object} props Path properties (_path, left, top, width, height, scaleX, scaleY, rotation).
   * @param {object} [page] Page size in units ({ width, height }) for mapWidth/mapHeight paths.
   * @returns {number[][][]} Rings in page pixels.
   */
  function legacyPathToRings(props, page = {}) {
    const raw = String(props._path || props.path || '')
      .replaceAll('mapWidth', String((Number(page.width) || 0) * UNIT_PX))
      .replaceAll('mapHeight', String((Number(page.height) || 0) * UNIT_PX));
    const commands = safeJson(raw);
    if (!Array.isArray(commands)) {
      return [];
    }
    const transform = makeTransform({
      width: Number(props.width) || 0,
      height: Number(props.height) || 0,
      cx: Number(props.left) || 0,
      cy: Number(props.top) || 0,
      scaleX: Number(props.scaleX) || 1,
      scaleY: Number(props.scaleY) || 1,
      rotation: props.rotation,
    });
    return legacyCommandsToRings(commands).map((ring) => ring.map(([x, y]) => transform(x, y)));
  }

  /**
   * Converts a Jumpgate pathv2's properties into page-space rings.
   *
   * @param {object} props Path properties (points, shape, x, y, rotation).
   * @returns {number[][][]} Rings in page pixels.
   */
  function pathV2ToRings(props) {
    const parsed = safeJson(props.points);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [];
    }
    const raw = parsed
      .filter((p) => Array.isArray(p) && p.length >= 2)
      .map(([x, y]) => [Number(x), Number(y)])
      .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
    if (raw.length === 0) {
      return [];
    }

    // Points are normalised so the bounding box starts at 0,0.
    const box = boundingBox(raw);
    const local = raw.map(([x, y]) => [x - box.left, y - box.top]);
    const width = box.right - box.left;
    const height = box.bottom - box.top;

    // Rectangles and ellipses are closed shapes, so their rings end where they start.
    let ring;
    if (props.shape === 'rec') {
      ring = [
        [0, 0],
        [width, 0],
        [width, height],
        [0, height],
        [0, 0],
      ];
    } else if (props.shape === 'eli') {
      const points = ellipsePoints(width, height);
      ring = [...points, points[0]];
    } else {
      ring = local;
    }

    const transform = makeTransform({
      width,
      height,
      cx: Number(props.x) || 0,
      cy: Number(props.y) || 0,
      rotation: props.rotation,
    });
    return [ring.map(([x, y]) => transform(x, y))];
  }

  /**
   * Converts either kind of path into page-space rings.
   *
   * @param {object} props Path properties including `type` ('path' or 'pathv2').
   * @param {object} [page] Page size in units, for Legacy mapWidth/mapHeight paths.
   * @returns {number[][][]} Rings in page pixels.
   */
  function pathToRings(props, page) {
    if (props.type === 'pathv2') {
      return pathV2ToRings(props);
    }
    return legacyPathToRings(props, page);
  }

  /**
   * Drops points that are closer than `minGap` to the previous kept point,
   * always keeping the first and last points.
   *
   * @param {number[][]} points Array of [x, y].
   * @param {number} [minGap=SIMPLIFY_PX] Minimum gap in pixels.
   * @returns {number[][]} Simplified points.
   */
  function simplifyPoints(points, minGap = SIMPLIFY_PX) {
    if (points.length <= 2) {
      return points.map(([x, y]) => [x, y]);
    }
    const kept = [points[0]];
    for (let i = 1; i < points.length - 1; i++) {
      const [px, py] = kept.at(-1);
      if (Math.hypot(points[i][0] - px, points[i][1] - py) >= minGap) {
        kept.push(points[i]);
      }
    }
    const last = points.at(-1);
    const [lx, ly] = kept.at(-1);
    if (kept.length > 1 && Math.hypot(last[0] - lx, last[1] - ly) < minGap) {
      kept.pop();
    }
    kept.push(last);
    return kept.map(([x, y]) => [x, y]);
  }

  /**
   * Returns the waypoints of a drawing: the first line of the drawing, in the
   * order it was drawn, in page pixels.
   *
   * @param {object} props Path properties including `type` ('path' or 'pathv2').
   * @param {object} [page] Page size in units, for Legacy mapWidth/mapHeight paths.
   * @returns {{points: number[][], closed: boolean}|null} Waypoints and whether
   *          the drawing ends where it starts, or null when it has fewer than two points.
   */
  function drawingWaypoints(props, page) {
    const [ring] = pathToRings(props, page);
    if (!ring || ring.length < 2) {
      return null;
    }
    const points = simplifyPoints(ring);
    if (points.length < 2) {
      return null;
    }
    const first = points[0];
    const last = points.at(-1);
    const closed = points.length > 2 && Math.hypot(first[0] - last[0], first[1] - last[1]) < 1;
    return { points, closed };
  }

  // The movement engine: patrols, followers, locks, combat and recording.
  //
  // One scheduler wakes every SCHEDULER_TICK_MS and moves each patrol whose due
  // time has passed, so every route can run at its own interval. The API does
  // not raise change events for moves the API makes, so followers, other Mods
  // and Hexploration are told about every move here.

  // In-memory caches, rebuilt on demand: compiled tracks per token and the
  // recent positions of every leader (for trail following).
  const trackCache = new Map();
  const trails = new Map();
  const observers = [];
  let schedulerId = null;

  /**
   * Translates a key in the active locale.
   *
   * @param {string} key Translation key.
   * @param {object} [vars] Interpolation variables.
   * @returns {string} Text.
   */
  function tr$1(key, vars) {
    return t(key, getConfig().language, vars);
  }

  /**
   * Whispers a short notice to every GM.
   *
   * @param {string} key Key under `messages.`.
   * @param {object} [vars] Interpolation variables.
   * @returns {void}
   */
  function notifyGm(key, vars) {
    whisper(null, SCRIPT_NAME, `<div>${escapeHtml(tr$1(`messages.${key}`, vars))}</div>`);
  }

  /**
   * Returns the current time in milliseconds.
   *
   * @returns {number} Milliseconds.
   */
  function now() {
    return Date.now();
  }

  /**
   * Returns a token's position.
   *
   * @param {object} token Roll20 graphic.
   * @returns {number[]} [x, y].
   */
  function positionOf(token) {
    return [Number(token.get('left')) || 0, Number(token.get('top')) || 0];
  }

  /**
   * Returns true when two points are the same place.
   *
   * @param {number[]} a [x, y].
   * @param {number[]} b [x, y].
   * @returns {boolean} True when equal.
   */
  function samePlace(a, b) {
    return Math.hypot(a[0] - b[0], a[1] - b[1]) < POSITION_EPSILON;
  }

  // ---------------------------------------------------------------------------
  // Observers
  // ---------------------------------------------------------------------------

  /**
   * Registers a function called whenever TokenController moves a token.
   *
   * @param {(token: object, prev: object) => void} fn Observer.
   * @returns {void}
   */
  function observeTokenChange(fn) {
    if (typeof fn === 'function') {
      observers.push(fn);
    }
  }

  /**
   * Tells followers, observers and Hexploration that a token moved.
   *
   * @param {object} token Roll20 graphic.
   * @param {object} prev Previous attributes ({ left, top, rotation, layer }).
   * @param {Set<string>} [visited] Tokens already moved in this chain.
   * @returns {void}
   */
  function announceMove(token, prev, visited = new Set()) {
    rememberTrail(token.id, [[prev.left, prev.top]]);
    for (const fn of observers) {
      try {
        fn(token, prev);
      } catch (err) {
        log(`${SCRIPT_NAME}: observer failed: ${err?.message || err}`);
      }
    }
    if (typeof Hexploration !== 'undefined' && typeof Hexploration?.revealAround === 'function') {
      try {
        Hexploration.revealAround(token, { left: prev.left, top: prev.top });
      } catch (err) {
        log(`${SCRIPT_NAME}: Hexploration reveal failed: ${err?.message || err}`);
      }
    }
    moveFollowers(token, visited);
  }

  // ---------------------------------------------------------------------------
  // Moving tokens
  // ---------------------------------------------------------------------------

  /**
   * Moves a token, turning it to face its direction of travel when enabled,
   * and announces the move.
   *
   * @param {object} token Roll20 graphic.
   * @param {number[]} to [x, y].
   * @param {Set<string>} [visited] Tokens already moved in this chain.
   * @returns {boolean} True when the token moved.
   */
  function moveTokenTo(token, to, visited) {
    const from = positionOf(token);
    if (samePlace(from, to)) {
      return false;
    }
    const prev = { left: from[0], top: from[1], rotation: token.get('rotation') };
    const update = { left: to[0], top: to[1] };
    const facing = getConfig().facing;
    if (facing !== 'off') {
      update.rotation = rotationFor(bearing(to[0] - from[0], to[1] - from[1]), facing);
    }
    token.set(update);
    announceMove(token, prev, visited);
    return true;
  }

  /**
   * Moves a token between the token layer and the GM layer.
   *
   * @param {object} token Roll20 graphic.
   * @returns {void}
   */
  function toggleStealth(token) {
    token.set('layer', token.get('layer') === LAYER_GM ? LAYER_TOKEN : LAYER_GM);
  }

  // ---------------------------------------------------------------------------
  // Tracks
  // ---------------------------------------------------------------------------

  /**
   * Returns a patrol's compiled track, compiling it when the route, anchor or
   * page grid has changed.
   *
   * @param {object} patrol Patrol record.
   * @param {object} route Route record.
   * @param {object} ctx Page context.
   * @returns {object[]} Frames.
   */
  function trackFor(patrol, route, ctx) {
    const key = JSON.stringify([route, patrol.anchor, ctx.grid]);
    const cached = trackCache.get(key);
    if (cached) {
      return cached;
    }
    const frames = compileTrack(route, ctx.grid, patrol.anchor || [0, 0]);
    if (trackCache.size > 500) {
      trackCache.clear();
    }
    trackCache.set(key, frames);
    return frames;
  }

  // ---------------------------------------------------------------------------
  // Patrols
  // ---------------------------------------------------------------------------

  /**
   * Returns the interval in force for a route.
   *
   * @param {object} route Route record.
   * @returns {number} Milliseconds.
   */
  function intervalFor(route) {
    return route.interval || getConfig().interval;
  }

  /**
   * Puts a token on a route.
   *
   * @param {object} token Roll20 graphic.
   * @param {object} route Route record.
   * @returns {{ok: true, offPage: number}|{ok: false, reason: string}} Outcome;
   *          reasons match `errors.` keys.
   */
  function startPatrol(token, route) {
    const tokenId = token.id;
    const pageId = token.get('_pageid');
    const s = getState();
    if (s.locks[tokenId]) {
      return { ok: false, reason: 'tokenLocked' };
    }
    if (route.anchor === ANCHOR_PAGE && route.pageId !== pageId) {
      return { ok: false, reason: 'routeOnOtherPage' };
    }
    if (route.start && route.start.pageId !== pageId) {
      return { ok: false, reason: 'startOnOtherPage' };
    }
    const already = Object.entries(s.patrols).filter(
      ([id, p]) => p.routeId === route.id && id !== tokenId
    ).length;
    if (route.maxTokens && already >= route.maxTokens) {
      return { ok: false, reason: 'routeFull' };
    }
    const ctx = getPageContext(pageId);
    if (!ctx) {
      return { ok: false, reason: 'noPage' };
    }

    const origin = s.patrols[tokenId]?.origin || {
      left: Number(token.get('left')) || 0,
      top: Number(token.get('top')) || 0,
      rotation: Number(token.get('rotation')) || 0,
      layer: token.get('layer'),
    };

    if (route.start) {
      token.set({ left: route.start.left, top: route.start.top });
      if (route.start.rotation !== null) {
        token.set('rotation', route.start.rotation);
      }
    }

    const patrol = {
      routeId: route.id,
      pageId,
      index: 0,
      dir: 1,
      anchor: positionOf(token),
      origin,
      dueAt: now() + intervalFor(route),
    };
    const frames = trackFor(patrol, route, ctx);
    if (frames.length < 2) {
      return { ok: false, reason: 'emptyTrack' };
    }
    if (route.randomStart) {
      patrol.index = Math.floor(Math.random() * frames.length);
    }

    // A token stops following when it starts a patrol: one controller at a time.
    delete s.follows[tokenId];
    s.patrols[tokenId] = patrol;
    const first = frames[patrol.index];
    moveTokenTo(token, [first.x, first.y]);
    return { ok: true, offPage: framesOffPage(frames, ctx.widthPx, ctx.heightPx) };
  }

  /**
   * Takes a token off its route, leaving it where it is.
   *
   * @param {string} tokenId Token ID.
   * @returns {boolean} True when it was on a route.
   */
  function stopPatrol(tokenId) {
    const patrols = getPatrols();
    if (!patrols[tokenId]) {
      return false;
    }
    delete patrols[tokenId];
    return true;
  }

  /**
   * Takes a token off its route and puts it back where it was when it started.
   *
   * @param {string} tokenId Token ID.
   * @returns {boolean} True when it was on a route.
   */
  function resetPatrol(tokenId) {
    const patrol = getPatrols()[tokenId];
    if (!patrol) {
      return false;
    }
    delete getPatrols()[tokenId];
    const token = getObj('graphic', tokenId);
    if (token && patrol.origin) {
      const update = {
        left: patrol.origin.left,
        top: patrol.origin.top,
        rotation: patrol.origin.rotation,
      };
      if (patrol.origin.layer) {
        update.layer = patrol.origin.layer;
      }
      const prev = { left: token.get('left'), top: token.get('top') };
      token.set(update);
      announceMove(token, prev);
    }
    return true;
  }

  /**
   * Moves one patrol to its next frame.
   *
   * @param {string} tokenId Token ID.
   * @param {object} patrol Patrol record.
   * @returns {void}
   */
  function advancePatrol(tokenId, patrol) {
    const s = getState();
    const token = getObj('graphic', tokenId);
    const route = s.routes[patrol.routeId];
    if (!token || !route) {
      delete s.patrols[tokenId];
      return;
    }
    if (s.locks[tokenId]) {
      return;
    }
    const ctx = getPageContext(token.get('_pageid'));
    if (!ctx) {
      return;
    }
    if (!patrol.anchor) {
      patrol.anchor = positionOf(token);
    }
    const frames = trackFor(patrol, route, ctx);
    if (frames.length < 2) {
      delete s.patrols[tokenId];
      log(`${SCRIPT_NAME}: route "${route.name}" has no moves; stopped ${tokenId}.`);
      return;
    }

    const step = nextFrame(
      frames,
      Math.min(patrol.index, frames.length - 1),
      patrol.dir,
      route.mode,
      getConfig().movement === 'segment'
    );
    patrol.index = step.index;
    patrol.dir = step.dir;
    const target = frames[step.index];

    if (target.stealth) {
      toggleStealth(token);
    } else if (target.face !== undefined) {
      const facing = getConfig().facing;
      if (facing !== 'off') {
        token.set('rotation', rotationFor(target.face, facing));
      }
    } else if (!target.wait) {
      // Frames off the page are skipped; the patrol keeps its place on the track
      // and rejoins it when the route comes back on to the page.
      const onPage =
        target.x >= 0 && target.y >= 0 && target.x <= ctx.widthPx && target.y <= ctx.heightPx;
      if (onPage) {
        moveTokenTo(token, [target.x, target.y]);
      }
    }

    if (step.finished) {
      delete s.patrols[tokenId];
    }
  }

  /**
   * Moves every patrol that is due, or every patrol when forced.
   *
   * @param {boolean} [force=false] Move all patrols now, ignoring their intervals.
   * @returns {void}
   */
  function runPatrols(force = false) {
    const s = getState();
    const time = now();
    for (const [tokenId, patrol] of Object.entries(s.patrols)) {
      if (!force && patrol.dueAt > time) {
        continue;
      }
      try {
        advancePatrol(tokenId, patrol);
      } catch (err) {
        log(`${SCRIPT_NAME}: patrol ${tokenId} failed: ${err?.message || err}`);
        delete s.patrols[tokenId];
      }
      const route = s.routes[patrol.routeId];
      if (route) {
        patrol.dueAt = time + intervalFor(route);
      }
    }
  }

  /**
   * Scheduler tick: checks combat, then moves due patrols.
   *
   * @returns {void}
   */
  function tick() {
    const s = getState();
    const inCombat = updateCombatState();
    if (s.paused) {
      return;
    }
    if (inCombat && getConfig().combatBehaviour !== 'ignore') {
      // Patrols wait (pause) or move with the turn order (step).
      return;
    }
    runPatrols(false);
  }

  /**
   * Starts the scheduler.
   *
   * @returns {void}
   */
  function startScheduler() {
    if (schedulerId !== null) {
      clearInterval(schedulerId);
    }
    schedulerId = setInterval(() => {
      try {
        tick();
      } catch (err) {
        log(`${SCRIPT_NAME} ERROR in scheduler: ${err?.message || err}`);
      }
    }, SCHEDULER_TICK_MS);
  }

  /**
   * Re-anchors patrols that were migrated from v4 (which kept no anchor) at
   * their tokens' current positions, and drops patrols whose tokens are gone.
   *
   * @returns {number} Number of patrols dropped.
   */
  function preparePatrols() {
    const patrols = getPatrols();
    let dropped = 0;
    for (const [tokenId, patrol] of Object.entries(patrols)) {
      const token = getObj('graphic', tokenId);
      if (!token) {
        delete patrols[tokenId];
        dropped++;
        continue;
      }
      patrol.pageId = token.get('_pageid');
      if (!patrol.anchor) {
        patrol.anchor = positionOf(token);
        patrol.index = 0;
        patrol.dir = 1;
      }
      patrol.dueAt = 0;
    }
    return dropped;
  }

  /**
   * Forgets cached tracks, for example after a page's grid changes.
   *
   * @returns {void}
   */
  function clearTrackCache() {
    trackCache.clear();
  }

  // ---------------------------------------------------------------------------
  // Combat
  // ---------------------------------------------------------------------------

  /**
   * Parses the campaign turn order.
   *
   * @param {*} raw turnorder value.
   * @returns {object[]} Entries.
   */
  function parseTurnOrder(raw) {
    if (Array.isArray(raw)) {
      return raw;
    }
    try {
      const parsed = JSON.parse(toText(raw) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /**
   * Returns true when the turn tracker is open with someone in it.
   *
   * @returns {boolean} True when the tracker shows a fight.
   */
  function trackerActive() {
    const campaign = Campaign();
    return (
      campaign.get('initiativepage') !== false &&
      Boolean(campaign.get('initiativepage')) &&
      parseTurnOrder(campaign.get('turnorder')).length > 0
    );
  }

  /**
   * Returns true when combat is on, by the turn tracker, the GM's switch, or
   * both, depending on the Combat Detection setting.
   *
   * @returns {boolean} True in combat.
   */
  function isCombatActive() {
    const detection = getConfig().combatDetection;
    const manual = getState().combat.manual === true;
    if (detection === 'manual') {
      return manual;
    }
    if (detection === 'tracker') {
      return trackerActive();
    }
    return manual || trackerActive();
  }

  /**
   * Recomputes the combat state and tells the GM when patrols pause or resume.
   *
   * @returns {boolean} True in combat.
   */
  function updateCombatState() {
    const combat = getState().combat;
    const active = isCombatActive();
    if (active !== combat.active) {
      combat.active = active;
      const behaviour = getConfig().combatBehaviour;
      if (Object.keys(getPatrols()).length > 0 && behaviour !== 'ignore') {
        notifyGm(active ? `combatStarted.${behaviour}` : 'combatEnded');
      }
    }
    return active;
  }

  /**
   * Handles a turn order change: with Combat Behaviour set to step, every
   * patrol moves once each time the turn passes.
   *
   * @param {object} campaign Roll20 campaign.
   * @returns {void}
   */
  function handleTurnOrderChange(campaign) {
    const combat = getState().combat;
    const active = updateCombatState();
    const [current] = parseTurnOrder(campaign.get('turnorder'));
    const turnId = current ? `${toText(current.id)}|${toText(current.custom)}` : null;
    const advanced = turnId !== null && turnId !== combat.turnId;
    combat.turnId = turnId;
    if (active && advanced && !getState().paused && getConfig().combatBehaviour === 'step') {
      runPatrols(true);
    }
  }

  // ---------------------------------------------------------------------------
  // Locks
  // ---------------------------------------------------------------------------

  /**
   * Locks a token in place, using the Lock Mode setting.
   *
   * @param {object} token Roll20 graphic.
   * @returns {void}
   */
  function lockToken(token) {
    const config = getConfig();
    const marker = config.lockMarker;
    const mode = config.lockMode;
    const native = mode === 'native';
    getLocks()[token.id] = {
      pageId: token.get('_pageid'),
      left: Number(token.get('left')) || 0,
      top: Number(token.get('top')) || 0,
      rotation: Number(token.get('rotation')) || 0,
      marker,
      mode,
      native,
    };
    if (native) {
      token.set('lockMovement', true);
    }
    if (marker !== 'none') {
      setMarker(token, marker, true);
    }
  }

  /**
   * Unlocks a token.
   *
   * @param {object} token Roll20 graphic.
   * @returns {boolean} True when it was locked.
   */
  function unlockToken(token) {
    const lock = getLocks()[token.id];
    if (!lock) {
      return false;
    }
    delete getLocks()[token.id];
    if (lock.native) {
      token.set('lockMovement', false);
    }
    if (lock.marker && lock.marker !== 'none') {
      setMarker(token, lock.marker, false);
    }
    return true;
  }

  // ---------------------------------------------------------------------------
  // Following
  // ---------------------------------------------------------------------------

  /**
   * Adds positions to a leader's trail, newest first.
   *
   * @param {string} leaderId Leader token ID.
   * @param {number[][]} positions Positions, newest first.
   * @returns {void}
   */
  function rememberTrail(leaderId, positions) {
    const trail = trails.get(leaderId) || [];
    for (const pos of [...positions].reverse()) {
      if (!trail.length || !samePlace(trail[0], pos)) {
        trail.unshift(pos);
      }
    }
    trails.set(leaderId, trail.slice(0, TRAIL_LENGTH));
  }

  /**
   * Makes tokens follow a leader.
   *
   * @param {object[]} followers Roll20 graphics.
   * @param {object} leader Roll20 graphic.
   * @returns {{started: object[], skipped: object[]}} Tokens that now follow, and
   *          those that could not (the leader itself, or a token the leader follows).
   */
  function followLeader(followers, leader) {
    const follows = getFollows();
    const started = [];
    const skipped = [];
    for (const follower of followers) {
      if (follower.id === leader.id || leadsTo(leader.id, follower.id)) {
        skipped.push(follower);
        continue;
      }
      const [fx, fy] = positionOf(follower);
      const [lx, ly] = positionOf(leader);
      follows[follower.id] = { leaderId: leader.id, offset: [fx - lx, fy - ly] };
      delete getPatrols()[follower.id];
      started.push(follower);
    }
    return { started, skipped };
  }

  /**
   * Returns true when following the chain of leaders from `fromId` reaches `toId`.
   *
   * @param {string} fromId Token ID to start from.
   * @param {string} toId Token ID to look for.
   * @returns {boolean} True when `fromId` (directly or indirectly) follows `toId`.
   */
  function leadsTo(fromId, toId) {
    const follows = getFollows();
    const seen = new Set();
    let current = follows[fromId]?.leaderId;
    while (current && !seen.has(current)) {
      if (current === toId) {
        return true;
      }
      seen.add(current);
      current = follows[current]?.leaderId;
    }
    return false;
  }

  /**
   * Stops a token following.
   *
   * @param {string} tokenId Token ID.
   * @returns {boolean} True when it was following.
   */
  function unfollow(tokenId) {
    const follows = getFollows();
    if (!follows[tokenId]) {
      return false;
    }
    delete follows[tokenId];
    return true;
  }

  /**
   * Moves the followers of a token that has just moved. In trail mode the
   * first follower steps into the leader's last position, the second into the
   * one before, and so on. In formation mode each keeps its distance and
   * direction from the leader. Followers of followers move in turn.
   *
   * @param {object} leader Roll20 graphic that moved.
   * @param {Set<string>} visited Tokens already moved in this chain.
   * @returns {void}
   */
  function moveFollowers(leader, visited) {
    visited.add(leader.id);
    const s = getState();
    const followers = Object.entries(s.follows).filter(([, f]) => f.leaderId === leader.id);
    if (followers.length === 0) {
      return;
    }
    const trailMode = getConfig().followMode === 'trail';
    const trail = trails.get(leader.id) || [];
    const [lx, ly] = positionOf(leader);
    followers.forEach(([followerId, follow], i) => {
      if (visited.has(followerId) || s.locks[followerId] || s.patrols[followerId]) {
        return;
      }
      const follower = getObj('graphic', followerId);
      if (!follower) {
        delete s.follows[followerId];
        return;
      }
      if (follower.get('_pageid') !== leader.get('_pageid')) {
        return;
      }
      let target;
      if (trailMode) {
        // Followers further back wait until the leader has gone far enough.
        target = trail[i];
      } else if (follow.offset) {
        // Snap so a follower that started between cells still lands in one.
        const grid = getPageContext(leader.get('_pageid'))?.grid;
        const x = lx + follow.offset[0];
        const y = ly + follow.offset[1];
        target = grid ? snapToCell(grid, x, y) : [x, y];
      }
      if (target) {
        moveTokenTo(follower, target, visited);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Moves made by people
  // ---------------------------------------------------------------------------

  /**
   * Handles a token changed by a person (the API reports no changes it makes
   * itself): keeps locks, records moves, re-anchors patrols and moves followers.
   *
   * @param {object} token Roll20 graphic.
   * @param {object} prev Previous attributes.
   * @returns {void}
   */
  function handleTokenChange(token, prev) {
    if (!isRecord(prev)) {
      return;
    }
    const from = [Number(prev.left) || 0, Number(prev.top) || 0];
    const to = positionOf(token);
    if (samePlace(from, to)) {
      return;
    }
    const s = getState();
    const tokenId = token.id;

    const lock = s.locks[tokenId];
    // Each lock keeps the mode it was made with, whatever the setting is now.
    if (lock?.mode === 'revert') {
      token.set({ left: lock.left, top: lock.top, rotation: lock.rotation });
      return;
    }

    // lastmove holds the start and waypoints of the drag. Trust it only when it
    // starts where the token was.
    const waypoints = parseLastMove(token.get('lastmove'));
    const route = waypoints.length > 0 && samePlace(waypoints[0], from) ? waypoints : [from];

    const recording = getRecordingForToken(tokenId);
    if (recording) {
      for (const [x, y] of [...route.slice(1), to]) {
        recording.entries.push({ x, y });
      }
    }

    const patrol = s.patrols[tokenId];
    if (patrol) {
      if (getConfig().manualMove === 'stop') {
        delete s.patrols[tokenId];
      } else if (patrol.anchor && s.routes[patrol.routeId]?.anchor !== ANCHOR_PAGE) {
        // Carry on along the same route from the new spot.
        patrol.anchor = [patrol.anchor[0] + to[0] - from[0], patrol.anchor[1] + to[1] - from[1]];
      }
    }

    const follow = s.follows[tokenId];
    if (follow && getConfig().followMode === 'formation') {
      // Dragging a follower adjusts its place in the formation.
      const leader = getObj('graphic', follow.leaderId);
      if (leader) {
        const [lx, ly] = positionOf(leader);
        follow.offset = [to[0] - lx, to[1] - ly];
      }
    }

    rememberTrail(tokenId, [...route].reverse());
    moveFollowers(token, new Set());
  }

  /**
   * Handles a token moved by another Mod that reports its changes (TokenMod).
   *
   * @param {object} token Roll20 graphic.
   * @param {object} prev Previous attributes.
   * @returns {void}
   */
  function handleObservedChange(token, prev) {
    if (!isRecord(prev)) {
      return;
    }
    const from = [Number(prev.left) || 0, Number(prev.top) || 0];
    if (!samePlace(from, positionOf(token))) {
      rememberTrail(token.id, [from]);
      moveFollowers(token, new Set());
    }
  }

  // ---------------------------------------------------------------------------
  // Recording
  // ---------------------------------------------------------------------------

  /**
   * Moves a recorded token one or more cells and records each cell.
   *
   * @param {object} recording Recording record.
   * @param {object} token Roll20 graphic.
   * @param {string} dir Direction key.
   * @param {number} distance Cells.
   * @returns {boolean} True when the page exists.
   */
  function recordStep(recording, token, dir, distance) {
    const ctx = getPageContext(token.get('_pageid'));
    if (!ctx) {
      return false;
    }
    let pos = positionOf(token);
    const ref = directionZigzags(ctx.grid, dir) ? lateralCoordinate(ctx.grid, pos) : null;
    for (let i = 0; i < distance; i++) {
      const next = stepFrom(ctx.grid, pos, dir, ref);
      recording.entries.push({ x: next[0], y: next[1] });
      pos = next;
    }
    moveTokenTo(token, pos);
    return true;
  }

  /**
   * Removes the last recorded entry, moving the token back when it was a move.
   *
   * @param {object} recording Recording record.
   * @param {object} token Roll20 graphic.
   * @returns {boolean} True when something was undone.
   */
  function recordUndo(recording, token) {
    if (recording.entries.length <= 1) {
      return false;
    }
    const removed = recording.entries.pop();
    if (removed.stealth) {
      toggleStealth(token);
    }
    const lastPlace = [...recording.entries].reverse().find((e) => 'x' in e);
    if ('x' in removed && lastPlace) {
      moveTokenTo(token, [lastPlace.x, lastPlace.y]);
    }
    return true;
  }

  // Journal handouts: the Help handout and the Command Deck. Both are GM-only.

  const STYLE = {
    outer: `background:${COLOR_CARD_BG_BOTTOM};color:${COLOR_TEXT};padding:14px 18px;border:1px solid ${COLOR_BORDER};border-radius:6px;font-family:Arial,sans-serif;line-height:1.5;`,
    header: `background:${COLOR_HEADER_BG};padding:12px;border-radius:4px;text-align:center;border-bottom:3px solid ${COLOR_ACCENT};margin-bottom:12px;`,
    h1: `color:${COLOR_HEADER_TEXT};margin:0;font-size:1.8em;letter-spacing:0.05em;`,
    subtitle: `color:${COLOR_MUTED};margin:4px 0 0 0;font-size:0.9em;`,
    h2: `color:${COLOR_ACCENT};border-bottom:1px solid ${COLOR_BORDER};padding-bottom:3px;margin:18px 0 8px 0;font-size:1.25em;`,
    p: `color:${COLOR_TEXT};margin:6px 0;`,
    li: `color:${COLOR_TEXT};margin:3px 0;`,
    table: 'width:100%;border-collapse:collapse;margin:6px 0;font-size:0.92em;',
    th: `background:${COLOR_HEADER_BG};color:${COLOR_HEADER_TEXT};padding:5px 8px;text-align:left;border:1px solid ${COLOR_BORDER};`,
    td: `padding:5px 8px;border:1px solid ${COLOR_BORDER};vertical-align:top;color:${COLOR_TEXT};`,
    code: 'font-family:monospace;color:#ffd58a;white-space:nowrap;',
    link: `color:${COLOR_ACCENT};`,
    footer: `color:${COLOR_MUTED};font-size:0.85em;text-align:center;margin-top:16px;border-top:1px solid ${COLOR_BORDER};padding-top:8px;`,
    btn: `background:${COLOR_BUTTON_BG};color:${COLOR_BUTTON_TEXT};padding:3px 9px;border-radius:3px;text-decoration:none;font-size:0.9em;display:inline-block;margin:2px 3px;font-weight:bold;`,
    btnDark: `background:${COLOR_BUTTON_ALT_BG};color:${COLOR_TEXT};border:1px solid ${COLOR_BUTTON_ALT_BORDER};padding:3px 9px;border-radius:3px;text-decoration:none;font-size:0.9em;display:inline-block;margin:2px 3px;`,
    section: `background:${COLOR_HEADER_BG};color:${COLOR_ACCENT};padding:4px 8px;font-variant:small-caps;font-weight:bold;letter-spacing:0.05em;border-left:3px solid ${COLOR_ACCENT};margin:12px 0 4px 0;`,
    desc: `color:${COLOR_MUTED};font-size:0.85em;margin:0 0 4px 8px;`,
  };

  /**
   * Builds a table.
   *
   * @param {string[]} headings Column headings (escaped).
   * @param {string[][]} rows Row cells (trusted HTML).
   * @returns {string} HTML string.
   */
  function table(headings, rows) {
    const head = headings.map((h) => `<th style="${STYLE.th}">${escapeHtml(h)}</th>`).join('');
    const body = rows
      .map((cells) => `<tr>${cells.map((c) => `<td style="${STYLE.td}">${c}</td>`).join('')}</tr>`)
      .join('');
    return `<table style="${STYLE.table}"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
  }

  /**
   * Builds a list from a translated array.
   *
   * @param {*} items Translated value (array of strings expected).
   * @param {boolean} [ordered=false] Use a numbered list.
   * @returns {string} HTML string.
   */
  function list(items, ordered = false) {
    const tag = ordered ? 'ol' : 'ul';
    const lis = (Array.isArray(items) ? items : [])
      .map((item) => `<li style="${STYLE.li}">${escapeHtml(item)}</li>`)
      .join('');
    return `<${tag}>${lis}</${tag}>`;
  }

  /**
   * Builds a link.
   *
   * @param {string} url URL.
   * @param {string} label Link text.
   * @returns {string} HTML anchor.
   */
  function link(url, label) {
    return `<a href="${escapeHtml(url)}" style="${STYLE.link}">${escapeHtml(label)}</a>`;
  }

  /**
   * Builds the Help handout HTML.
   *
   * @param {string} locale Locale code.
   * @returns {string} HTML string.
   */
  function buildHelpHtml(locale) {
    const lang = getLocale(locale);
    const h = (key, vars) => escapeHtml(t(`handout.${key}`, lang, vars));
    const raw = (key) => tRaw(`handout.${key}`, lang);
    const code = (text) => `<span style="${STYLE.code}">${escapeHtml(text)}</span>`;
    const section = (key, body) => `<h2 style="${STYLE.h2}">${h(`${key}.heading`)}</h2>${body}`;

    const commands = HELP_COMMANDS.map(([text, key]) => [
      code(`${COMMAND} ${text}`.trim()),
      escapeHtml(t(`help.${key}`, lang)),
    ]);

    const codes = [
      ['U D L R', 'move'],
      ['UL UR DL DR', 'diagonal'],
      ['U3, R10', 'distance'],
      ['U0', 'face'],
      ['W, W3', 'wait'],
      ['S', 'stealth'],
    ].map(([c, key]) => [code(c), escapeHtml(t(`handout.codes.${key}`, lang))]);

    const routeOptions = ['mode', 'interval', 'max', 'random', 'start'].map((key) => [
      code(key),
      escapeHtml(t(`handout.routeOptions.${key}`, lang)),
    ]);

    const settings = Object.keys(DEFAULT_CONFIG).map((key) => [
      code(key),
      escapeHtml(t(`settings.${key}.label`, lang)),
      escapeHtml(t(`settings.${key}.desc`, lang)),
    ]);

    const legacyCommands = [
      ['!tc / !token-control', `${COMMAND}`],
      ['!tc set <path> <code>', `${COMMAND} edit <route> <code>`],
      ['!tc setstart / clearstart <path>', `${COMMAND} route <route> start set|clear`],
      ['!tc build, !tc draft', `${COMMAND} record`],
      ['!tc tick <ms>', `${COMMAND} set interval <ms>`],
      ['!tc rotate / combat / substeps', `${COMMAND} set facing / combatBehaviour / movement`],
      ['!tc pathinterval / maxtokens', `${COMMAND} route <route> interval / max`],
      ['!tc runonce / cycle / randomstart', `${COMMAND} route <route> mode / random`],
      ['!tc duplicate', `${COMMAND} copy`],
      ['!tc exportpaths / importpaths', `${COMMAND} export / import`],
      ['!tc follow <follower> <leader>', `${COMMAND} follow <leader>`],
    ].map(([v4, v5]) => [code(v4), code(v5)]);

    const locales = SUPPORTED_LOCALES.map((c) => escapeHtml(LOCALE_LABELS[c])).join(', ');
    const { original, maintainer } = AUTHOR_LINKS;

    return `<div style="${STYLE.outer}${getDirectionStyle(lang)}">
    <div style="${STYLE.header}">
      <h1 style="${STYLE.h1}">✥ ${SCRIPT_NAME} ✥</h1>
      <p style="${STYLE.subtitle}">${h('versionLabel')} ${SCRIPT_VERSION} • ${h('subtitle')}</p>
    </div>
    ${section('overview', `<p style="${STYLE.p}">${h('overview.body')}</p>`)}
    ${section('quickStart', list(raw('quickStart.steps'), true))}
    ${section('routes', `${list(raw('routes.points'))}${table([t('handout.codes.colCode', lang), t('handout.codes.colMeaning', lang)], codes)}`)}
    ${section('routeOptions', table([t('handout.routeOptions.colOption', lang), t('handout.routeOptions.colMeaning', lang)], routeOptions))}
    ${section('tokens', list(raw('tokens.points')))}
    ${section('grids', list(raw('grids.points')))}
    ${section('combat', list(raw('combat.points')))}
    ${section('commands', `<p style="${STYLE.p}">${h('commands.intro')}</p>${table([t('handout.commands.colCommand', lang), t('handout.commands.colDesc', lang)], commands)}`)}
    ${section('settings', `<p style="${STYLE.p}">${h('settings.intro')}</p>${table([t('handout.settings.colKey', lang), t('handout.settings.colName', lang), t('handout.settings.colDesc', lang)], settings)}`)}
    ${section('upgrading', `${list(raw('upgrading.points'))}${table([t('handout.upgrading.colV4', lang), t('handout.upgrading.colV5', lang)], legacyCommands)}`)}
    ${section('troubleshooting', list(raw('troubleshooting.points')))}
    ${section('languages', `<p style="${STYLE.p}">${h('languages.body')}</p><p style="${STYLE.p};font-size:0.85em">${locales}</p>`)}
    ${section(
      'credits',
      `<p style="${STYLE.p}">${h('credits.original')} ${link(original.profile, original.name)} • ${link(original.patreon, 'Patreon')}</p>
       <p style="${STYLE.p}">${h('credits.maintainer')} ${link(maintainer.profile, maintainer.name)} • ${link(maintainer.github, 'GitHub')}</p>
       <p style="${STYLE.p}">${h('credits.support')}</p>`
    )}
    <div style="${STYLE.footer}">${SCRIPT_NAME} ${SCRIPT_VERSION} • ${h('footer', { deck: HANDOUT_DECK_NAME })}</div>
  </div>`;
  }

  /**
   * Builds the Command Deck handout HTML.
   *
   * @param {string} locale Locale code.
   * @returns {string} HTML string.
   */
  function buildDeckHtml(locale) {
    const lang = getLocale(locale);
    const tr = (key, vars) => t(key, lang, vars);
    const q = (key, fallback = '') => `?{${tr(key).replaceAll(/[|}]/g, '')}|${fallback}}`;
    const btn = (key, args, dark = false) =>
      `<a href="${escapeHtml(`${COMMAND} ${args}`.trim())}" style="${dark ? STYLE.btnDark : STYLE.btn}">${escapeHtml(tr(`buttons.${key}`))}</a>`;
    const group = (titleKey, descKey, buttons) =>
      `<div style="${STYLE.section}">${escapeHtml(tr(titleKey))}</div><div style="${STYLE.desc}">${escapeHtml(tr(descKey))}</div><div>${buttons.join('')}</div>`;

    return `<div style="${STYLE.outer}${getDirectionStyle(lang)}">
    <div style="${STYLE.header}">
      <h1 style="${STYLE.h1}">✥ ${SCRIPT_NAME} ✥</h1>
      <p style="${STYLE.subtitle}">${escapeHtml(tr('deck.subtitle'))} • v${SCRIPT_VERSION}</p>
    </div>
    ${group('menu.patrols', 'deck.patrolsDesc', [btn('menu', ''), btn('startRoute', `start ${q('prompts.route')}`), btn('stop', 'stop', true), btn('reset', 'reset', true), btn('stopAll', 'stop all', true), btn('pause', 'pause', true), btn('resume', 'resume', true)])}
    ${group('menu.create', 'deck.createDesc', [btn('add', `add ${q('prompts.name')} ${q('prompts.code', 'U2R2D2L2')}`), btn('draw', `draw ${q('prompts.name')}`), btn('record', `record ${q('prompts.name')}`), btn('examples', 'examples', true), btn('list', 'list', true)])}
    ${group('menu.selected', 'deck.selectedDesc', [btn('lock', 'lock'), btn('unlock', 'unlock', true), btn('leader', 'leader'), btn('follow', 'follow'), btn('unfollow', 'unfollow', true)])}
    ${group('menu.tools', 'deck.toolsDesc', [btn('combatOn', 'combat on', true), btn('combatOff', 'combat off', true), btn('settings', 'set', true), btn('status', 'status', true), btn('calibrate', 'calibrate', true), btn('help', 'help', true)])}
    <div style="${STYLE.footer}">${escapeHtml(tr('deck.footer', { help: HANDOUT_HELP_NAME }))}</div>
  </div>`;
  }

  /**
   * Creates or updates a GM-only handout, removing duplicates with the same name.
   *
   * @param {string} name Handout name.
   * @param {string} html Handout notes HTML.
   * @returns {void}
   */
  function upsertHandout(name, html) {
    const existing = findObjs({ _type: 'handout', name });
    const [primary, ...duplicates] = existing;
    const handout = primary || createObj('handout', { name });
    if (!handout) {
      return;
    }
    handout.set({ inplayerjournals: '', controlledby: '' });
    handout.set('notes', html);
    for (const dup of duplicates) {
      dup.remove();
    }
  }

  /**
   * Creates or refreshes the Help and Command Deck handouts in the current
   * language.
   *
   * @returns {void}
   */
  function installHandouts() {
    const lang = getConfig().language;
    upsertHandout(HANDOUT_HELP_NAME, buildHelpHtml(lang));
    upsertHandout(HANDOUT_DECK_NAME, buildDeckHtml(lang));
  }

  /**
   * Removes v4's usage guide, which every player could see.
   *
   * @returns {number} Number of handouts removed.
   */
  function removeLegacyHandout() {
    const old = findObjs({ _type: 'handout', name: LEGACY_HANDOUT_NAME });
    for (const handout of old) {
      handout.remove();
    }
    return old.length;
  }

  // Translates v4 `!tc` / `!token-control` subcommands into v5 commands, so
  // existing macros, the T-Cntrl_ macros and old chat buttons keep working.
  // v5 subcommands typed after `!tc` pass through unchanged.

  /**
   * Builds an unquoted word.
   *
   * @param {string} text Word text.
   * @returns {{text: string, quoted: boolean}} Word.
   */
  function word(text) {
    return { text: String(text), quoted: false };
  }

  /**
   * Returns a route's reference word for a v4 path name, falling back to the
   * name itself so the v5 command reports "not found".
   *
   * @param {object[]} nameWords Words of the path name.
   * @returns {{route: object|null, ref: object}} Route and reference word.
   */
  function routeRef(nameWords) {
    const name = nameWords.map((w) => w.text).join(' ');
    const route = findRoute(name);
    return { route, ref: route ? word(`#${route.id}`) : { text: name, quoted: true } };
  }

  /**
   * Translates a v4 subcommand.
   *
   * @param {{text: string, quoted: boolean}[]} words Words after the prefix.
   * @returns {{words: {text: string, quoted: boolean}[], raw?: boolean}} v5 words.
   */
  function translateLegacy(words) {
    if (words.length === 0) {
      return { words: [] };
    }
    const [first, ...rest] = words;
    const sub = first.text.toLowerCase();
    const config = getConfig();
    const pass = { words };

    switch (sub) {
      case 'setup':
        return { words: [word('journal'), word('rebuild')] };
      case 'hide':
        return { words: [] };
      case 'usage':
        return { words: [word('help')] };
      case 'list': {
        const what = rest[0]?.text.toLowerCase();
        const name = rest.slice(1);
        if (what === 'paths' && name.length > 0) {
          return { words: [word('show'), routeRef(name).ref] };
        }
        if (what === 'tokens') {
          return { words: [word('list'), word('tokens'), ...name] };
        }
        if (what === 'draft') {
          return { words: [word('record'), word('status')] };
        }
        if (what === 'tick' || what === 'vars') {
          return { words: [word('status')] };
        }
        return { words: [word('list'), word('routes')] };
      }
      case 'set':
        return { words: [word('edit'), ...rest] };
      case 'setstart':
      case 'clearstart':
        return {
          words: [
            word('route'),
            routeRef(rest).ref,
            word('start'),
            word(sub === 'setstart' ? 'set' : 'clear'),
          ],
        };
      case 'build': {
        // v4: !tc Build <tokenId> <name>
        return { words: [word('record'), ...rest] };
      }
      case 'draft': {
        // v4: !tc draft <name> <U|D|L|R|W|S|Set|Rmv> [units]
        if (rest.length < 2) {
          return { words: [word('record'), word('status')] };
        }
        const [name, op, units] = rest;
        const opText = op.text.toLowerCase();
        const mapped = opText === 'set' ? 'save' : opText === 'rmv' ? 'cancel' : op.text;
        return { words: [word('record'), name, word(mapped), ...(units ? [units] : [])] };
      }
      case 'unit':
        return { words: [word('set'), word('buttonStep'), ...rest] };
      case 'unitpx':
        return { words: [word('unitpx')] };
      case 'tick':
        return { words: [word('set'), word('interval'), ...rest] };
      case 'reset':
        return rest.length === 0 ? { words: [word('reset'), word('all')] } : pass;
      case 'rotate':
        return {
          words: [word('set'), word('facing'), word(config.facing === 'off' ? 'down' : 'off')],
        };
      case 'combat':
        return {
          words: [
            word('set'),
            word('combatBehaviour'),
            word(config.combatBehaviour === 'step' ? 'pause' : 'step'),
          ],
        };
      case 'substeps':
        return {
          words: [
            word('set'),
            word('movement'),
            word(config.movement === 'cell' ? 'segment' : 'cell'),
          ],
        };
      case 'pathinterval':
      case 'maxtokens': {
        const value = rest.at(-1);
        const { ref } = routeRef(rest.slice(0, -1));
        return {
          words: [word('route'), ref, word(sub === 'pathinterval' ? 'interval' : 'max'), value],
        };
      }
      case 'runonce':
      case 'cycle':
      case 'randomstart': {
        const { route, ref } = routeRef(rest);
        if (sub === 'randomstart') {
          return { words: [word('route'), ref, word('random'), word('toggle')] };
        }
        let mode;
        if (sub === 'runonce') {
          mode = route?.mode === 'once' ? 'pingpong' : 'once';
        } else {
          mode = route?.mode === 'loop' ? 'pingpong' : 'loop';
        }
        return { words: [word('route'), ref, word('mode'), word(mode)] };
      }
      case 'duplicate':
        return { words: [word('copy'), ...rest] };
      case 'exportpaths':
        return { words: [word('export')] };
      case 'importpaths':
        return { words: [word('import'), ...rest], raw: true };
      default:
        return pass;
    }
  }

  // Settings shown in the menu, in order, with how to prompt for them.
  const SETTING_ROWS = [
    { key: 'interval' },
    { key: 'movement', options: MOVEMENT_OPTIONS },
    { key: 'facing', options: FACING_OPTIONS },
    { key: 'combatDetection', options: COMBAT_DETECTION_OPTIONS },
    { key: 'combatBehaviour', options: COMBAT_BEHAVIOUR_OPTIONS },
    { key: 'lockMode', options: LOCK_MODE_OPTIONS },
    { key: 'lockMarker' },
    { key: 'followMode', options: FOLLOW_MODE_OPTIONS },
    { key: 'manualMove', options: MANUAL_MOVE_OPTIONS },
    { key: 'buttonStep' },
    { key: 'language' },
  ];

  // Settings whose values are shown with a translated label.
  const OPTION_KEYS = SETTING_ROWS.filter((row) => row.options).map((row) => row.key);

  const RECORD_OPS = ['undo', 'save', 'cancel', 'w', 's'];
  const MAX_LISTED_TOKENS = 30;

  /**
   * Returns the active locale.
   *
   * @returns {string} Locale code.
   */
  function lang() {
    return getConfig().language;
  }

  /**
   * Translates a key in the active locale.
   *
   * @param {string} key Translation key.
   * @param {object} [vars] Interpolation variables.
   * @returns {string} Translated text.
   */
  function tr(key, vars) {
    return t(key, lang(), vars);
  }

  /**
   * Whispers a translated error with its hint.
   *
   * @param {string} playerId Player ID.
   * @param {string} key Key under `errors.` (the hint lives under `hints.`).
   * @param {object} [vars] Interpolation variables.
   * @returns {void}
   */
  function fail(playerId, key, vars) {
    const hint = t(`hints.${key}`, lang(), vars);
    whisperError(playerId, tr(`errors.${key}`, vars), hint === `hints.${key}` ? '' : hint);
  }

  /**
   * Whispers a short translated confirmation.
   *
   * @param {string} playerId Player ID.
   * @param {string} key Key under `messages.`.
   * @param {object} [vars] Interpolation variables.
   * @returns {void}
   */
  function done(playerId, key, vars) {
    whisper(playerId, SCRIPT_NAME, `<div>${escapeHtml(tr(`messages.${key}`, vars))}</div>`);
  }

  /**
   * Builds a command line from the main command and arguments.
   *
   * @param {string} args Arguments.
   * @returns {string} Command.
   */
  function cmd(args) {
    return `${COMMAND} ${args}`.trim();
  }

  /**
   * Formats a setting value for display.
   *
   * @param {string} key Setting key.
   * @param {*} value Setting value.
   * @returns {string} Display text.
   */
  function formatValue(key, value) {
    if (key === 'language') {
      return LOCALE_LABELS[value] || value;
    }
    if (key === 'interval') {
      return tr('values.ms', { ms: value });
    }
    if (key === 'lockMarker' && value === 'none') {
      return tr('values.none');
    }
    if (OPTION_KEYS.includes(key)) {
      return tr(`values.${key}.${value}`);
    }
    return String(value);
  }

  /**
   * Builds a Roll20 query prompting for a value.
   *
   * @param {string} label Prompt label.
   * @param {string[]|null} options Choices, or null for free text.
   * @param {*} [current] Current value, offered as the default.
   * @returns {string} Query text.
   */
  function query(label, options, current) {
    const safe = (text) => String(text).replaceAll(/[|}]/g, '');
    if (options) {
      return `?{${safe(label)}|${options.map(safe).join('|')}}`;
    }
    const shown = current === null || current === undefined ? '' : safe(current);
    return `?{${safe(label)}|${shown}}`;
  }

  /**
   * Joins words back into text.
   *
   * @param {{text: string}[]} words Words.
   * @returns {string} Text.
   */
  function joinWords(words) {
    return words.map((w) => w.text).join(' ');
  }

  /**
   * Splits words into two names: a quoted or `#id` first name, otherwise
   * everything but the last word, then the rest.
   *
   * @param {{text: string, quoted: boolean}[]} words Words.
   * @returns {string[]|null} [first, second], or null when there are too few words.
   */
  function splitTwoNames(words) {
    if (words.length < 2) {
      return null;
    }
    if (words[0].quoted || words[0].text.startsWith('#')) {
      return [words[0].text, joinWords(words.slice(1))];
    }
    return [joinWords(words.slice(0, -1)), words.at(-1).text];
  }

  /**
   * Describes a route's path for display.
   *
   * @param {object} route Route record.
   * @returns {string} Description.
   */
  function describeRoute(route) {
    if (route.kind === ROUTE_KIND_CODE) {
      return route.code;
    }
    const points = route.points.filter((p) => 'x' in p).length;
    return tr(route.anchor === ANCHOR_PAGE ? 'route.drawn' : 'route.recorded', { points });
  }

  /**
   * Returns the tokens on a route.
   *
   * @param {string} routeId Route ID.
   * @returns {string[]} Token IDs.
   */
  function tokensOnRoute(routeId) {
    return Object.entries(getPatrols())
      .filter(([, p]) => p.routeId === routeId)
      .map(([id]) => id);
  }

  // ---------------------------------------------------------------------------
  // Selection
  // ---------------------------------------------------------------------------

  /**
   * Returns the other drawing type: `path` for `pathv2` and the reverse.
   *
   * @param {string} type Drawing type.
   * @returns {string} The other drawing type.
   */
  function otherPathType(type) {
    return type === PATH_TYPE_V2 ? PATH_TYPE_LEGACY : PATH_TYPE_V2;
  }

  /**
   * Sorts the selection into tokens and drawings.
   *
   * @param {object} msg Chat message.
   * @returns {{tokens: object[], drawings: object[]}} Selection.
   */
  function readSelection(msg) {
    const selection = { tokens: [], drawings: [] };
    for (const sel of msg.selected || []) {
      if (sel._type === PATH_TYPE_V2 || sel._type === PATH_TYPE_LEGACY) {
        // Jumpgate's chat reports its drawings as `path`, but the API knows
        // them as `pathv2`, so look under both.
        const drawing = getObj(sel._type, sel._id) || getObj(otherPathType(sel._type), sel._id);
        if (drawing) {
          selection.drawings.push(drawing);
        }
        continue;
      }
      const obj = getObj(sel._type, sel._id);
      if (obj && isToken(obj)) {
        selection.tokens.push(obj);
      }
    }
    return selection;
  }

  /**
   * Returns the selected tokens, whispering an error when there are none.
   *
   * @param {object} msg Chat message.
   * @returns {object[]|null} Tokens, or null.
   */
  function requireTokens(msg) {
    const { tokens } = readSelection(msg);
    if (tokens.length === 0) {
      fail(msg.playerid, 'noTokens');
      return null;
    }
    return tokens;
  }

  /**
   * Finds a route, whispering an error when it does not exist.
   *
   * @param {object} msg Chat message.
   * @param {string} ref Route reference.
   * @returns {object|null} Route.
   */
  function requireRoute(msg, ref) {
    if (!toText(ref)) {
      fail(msg.playerid, 'noRouteName');
      return null;
    }
    const route = findRoute(ref);
    if (!route) {
      fail(msg.playerid, 'routeNotFound', { name: ref });
    }
    return route;
  }

  /**
   * Finds a token by ID, or by name on the GM's current page.
   *
   * @param {object} msg Chat message.
   * @param {string} ref Token ID or name.
   * @returns {object|null} Token.
   */
  function findToken(msg, ref) {
    const text = toText(ref);
    if (!text) {
      return null;
    }
    const byId = getObj('graphic', text);
    if (isToken(byId)) {
      return byId;
    }
    const pageId = getPlayerPageId(msg.playerid);
    const lower = text.toLowerCase();
    const named = findObjs({ _type: 'graphic', _subtype: 'token', _pageid: pageId }).filter(
      (tok) => toText(tok.get('name')).toLowerCase() === lower
    );
    return named[0] || null;
  }

  /**
   * Lists token names for a message, shortening long lists.
   *
   * @param {object[]} tokens Roll20 graphics.
   * @returns {string} Comma-separated names.
   */
  function namesOf(tokens) {
    const names = tokens.slice(0, MAX_LISTED_TOKENS).map((tok) => tokenLabel(tok));
    if (tokens.length > MAX_LISTED_TOKENS) {
      names.push(tr('values.andMore', { count: tokens.length - MAX_LISTED_TOKENS }));
    }
    return names.join(', ');
  }

  // ---------------------------------------------------------------------------
  // Menus and cards
  // ---------------------------------------------------------------------------

  /**
   * Shows the main menu.
   *
   * @param {string|null} playerId Player ID, or null for every GM.
   * @returns {void}
   */
  function showMainMenu(playerId) {
    const s = getState();
    const routes = listRoutes();
    const patrolCount = Object.keys(s.patrols).length;
    const lines = [];

    let statusKey = 'menu.statusRunning';
    if (s.paused) {
      statusKey = 'menu.statusPaused';
    } else if (isCombatActive() && getConfig().combatBehaviour !== 'ignore') {
      statusKey = `menu.statusCombat.${getConfig().combatBehaviour}`;
    }
    lines.push(
      `<div style="font-size:0.9em">${escapeHtml(tr(statusKey, { patrols: patrolCount, routes: routes.length }))}</div>`
    );

    lines.push(buildSectionLabel(tr('menu.routes')));
    if (routes.length === 0) {
      lines.push(`<div style="font-size:0.9em">${escapeHtml(tr('menu.noRoutes'))}</div>`);
    }
    for (const route of routes) {
      const count = tokensOnRoute(route.id).length;
      const label = count > 0 ? `${route.name} (${count})` : route.name;
      lines.push(
        buildRow(
          label,
          buildButton(tr('buttons.start'), cmd(`start #${route.id}`)) +
            buildSecondaryButton(tr('buttons.stop'), cmd(`stop #${route.id}`)) +
            buildSecondaryButton('⋯', cmd(`show #${route.id}`))
        )
      );
    }

    lines.push(buildSectionLabel(tr('menu.create')));
    lines.push(
      [
        buildButton(
          tr('buttons.add'),
          cmd(
            `add ${query(tr('prompts.name'), null)} ${query(tr('prompts.code'), null, 'U2R2D2L2')}`
          )
        ),
        buildButton(tr('buttons.draw'), cmd(`draw ${query(tr('prompts.name'), null)}`)),
        buildButton(tr('buttons.record'), cmd(`record ${query(tr('prompts.name'), null)}`)),
        buildSecondaryButton(tr('buttons.examples'), cmd('examples')),
      ].join('')
    );

    lines.push(buildSectionLabel(tr('menu.selected')));
    lines.push(
      [
        buildSecondaryButton(tr('buttons.stop'), cmd('stop')),
        buildSecondaryButton(tr('buttons.reset'), cmd('reset')),
        buildSecondaryButton(tr('buttons.lock'), cmd('lock')),
        buildSecondaryButton(tr('buttons.unlock'), cmd('unlock')),
        buildSecondaryButton(tr('buttons.leader'), cmd('leader')),
        buildSecondaryButton(tr('buttons.follow'), cmd('follow')),
        buildSecondaryButton(tr('buttons.unfollow'), cmd('unfollow')),
      ].join('')
    );

    lines.push(buildSectionLabel(tr('menu.tools')));
    const tools = [
      s.paused
        ? buildButton(tr('buttons.resume'), cmd('resume'))
        : buildSecondaryButton(tr('buttons.pause'), cmd('pause')),
    ];
    if (getConfig().combatDetection !== 'tracker') {
      tools.push(
        buildSecondaryButton(
          tr(s.combat.manual ? 'buttons.combatOff' : 'buttons.combatOn'),
          cmd(`combat ${s.combat.manual ? 'off' : 'on'}`)
        )
      );
    }
    tools.push(
      buildSecondaryButton(tr('buttons.stopAll'), cmd('stop all')),
      buildSecondaryButton(tr('buttons.settings'), cmd('set')),
      buildSecondaryButton(tr('buttons.status'), cmd('status')),
      buildSecondaryButton(tr('buttons.help'), cmd('help'))
    );
    lines.push(tools.join(''));

    const recordings = Object.values(getRecordings());
    if (recordings.length > 0) {
      lines.push(buildSectionLabel(tr('menu.recordings')));
      for (const rec of recordings) {
        lines.push(buildRow(rec.name, buildButton(tr('buttons.open'), cmd(`record #${rec.id}`))));
      }
    }

    whisper(playerId, `${SCRIPT_NAME} v${SCRIPT_VERSION}`, lines);
  }

  /**
   * Shows a route's details and controls.
   *
   * @param {string} playerId Player ID.
   * @param {object} route Route record.
   * @returns {void}
   */
  function showRoute(playerId, route) {
    const ref = `#${route.id}`;
    const tokens = tokensOnRoute(route.id).map(
      (id) => getObj('graphic', id) || { id, get: () => id }
    );
    const lines = [
      buildRow(tr('route.path'), `<code>${escapeHtml(describeRoute(route))}</code>`),
      buildRow(
        tr('route.mode'),
        buildSecondaryButton(
          tr(`values.mode.${route.mode}`),
          cmd(`route ${ref} mode ${query(tr('route.mode'), ROUTE_MODE_OPTIONS)}`)
        )
      ),
      buildRow(
        tr('route.interval'),
        buildSecondaryButton(
          route.interval ? tr('values.ms', { ms: route.interval }) : tr('values.default'),
          cmd(`route ${ref} interval ${query(tr('prompts.interval'), null, route.interval || 0)}`)
        )
      ),
      buildRow(
        tr('route.maxTokens'),
        buildSecondaryButton(
          route.maxTokens ? String(route.maxTokens) : tr('values.noLimit'),
          cmd(`route ${ref} max ${query(tr('prompts.maxTokens'), null, route.maxTokens || 0)}`)
        )
      ),
      buildRow(
        tr('route.randomStart'),
        buildSecondaryButton(
          tr(route.randomStart ? 'values.on' : 'values.off'),
          cmd(`route ${ref} random ${route.randomStart ? 'off' : 'on'}`)
        )
      ),
      buildRow(
        tr('route.start'),
        route.start
          ? buildSecondaryButton(tr('buttons.clearStart'), cmd(`route ${ref} start clear`))
          : buildSecondaryButton(tr('buttons.setStart'), cmd(`route ${ref} start set`))
      ),
      buildRow(
        tr('route.tokens'),
        escapeHtml(tokens.length > 0 ? namesOf(tokens) : tr('values.none'))
      ),
      buildDivider(),
      [
        buildButton(tr('buttons.start'), cmd(`start ${ref}`)),
        buildSecondaryButton(tr('buttons.stop'), cmd(`stop ${ref}`)),
        buildSecondaryButton(tr('buttons.reset'), cmd(`reset ${ref}`)),
        route.kind === ROUTE_KIND_CODE
          ? buildSecondaryButton(
              tr('buttons.edit'),
              cmd(`edit ${ref} ${query(tr('prompts.code'), null, route.code)}`)
            )
          : '',
        buildSecondaryButton(
          tr('buttons.rename'),
          cmd(`rename ${ref} ${query(tr('prompts.newName'), null, route.name)}`)
        ),
        buildSecondaryButton(
          tr('buttons.copy'),
          cmd(`copy ${ref} ${query(tr('prompts.newName'), null)}`)
        ),
        buildSecondaryButton(tr('buttons.export'), cmd(`export ${ref}`)),
        buildSecondaryButton(tr('buttons.remove'), cmd(`remove ${ref}`)),
        buildSecondaryButton(tr('buttons.menu'), cmd('')),
      ].join(''),
    ];
    whisper(playerId, route.name, lines);
  }

  /**
   * Shows a recording's controls.
   *
   * @param {string} playerId Player ID.
   * @param {object} recording Recording record.
   * @returns {void}
   */
  function showRecording(playerId, recording) {
    const ref = `#${recording.id}`;
    const step = getConfig().buttonStep;
    const token = getObj('graphic', recording.tokenId);
    const moves = recording.entries.length - 1;
    const dirButton = (dir) => buildButton(dir, cmd(`record ${ref} ${dir} ${step}`));
    const lines = [
      `<div style="font-size:0.9em">${escapeHtml(tr('record.intro', { token: tokenLabel(token, recording.tokenId), count: moves }))}</div>`,
      `<div style="text-align:center">${dirButton('UL')}${dirButton('U')}${dirButton('UR')}</div>`,
      `<div style="text-align:center">${dirButton('L')}${buildSecondaryButton(tr('buttons.wait'), cmd(`record ${ref} W`))}${dirButton('R')}</div>`,
      `<div style="text-align:center">${dirButton('DL')}${dirButton('D')}${dirButton('DR')}</div>`,
      buildRow(
        tr('settings.buttonStep.label'),
        buildSecondaryButton(
          String(step),
          cmd(`set buttonStep ${query(tr('settings.buttonStep.label'), null, step)}`)
        )
      ),
      buildDivider(),
      [
        buildSecondaryButton(tr('buttons.stealth'), cmd(`record ${ref} S`)),
        buildSecondaryButton(tr('buttons.undo'), cmd(`record ${ref} undo`)),
        buildButton(tr('buttons.save'), cmd(`record ${ref} save`)),
        buildSecondaryButton(tr('buttons.cancel'), cmd(`record ${ref} cancel`)),
      ].join(''),
    ];
    whisper(playerId, tr('record.title', { name: recording.name }), lines);
  }

  /**
   * Shows every setting with a button to change it.
   *
   * @param {string} playerId Player ID.
   * @returns {void}
   */
  function showSettings(playerId) {
    const config = getConfig();
    const lines = SETTING_ROWS.map((row) => {
      const label = tr(`settings.${row.key}.label`);
      const options = row.key === 'language' ? SUPPORTED_LOCALES : row.options || null;
      return buildRow(
        label,
        buildSecondaryButton(
          formatValue(row.key, config[row.key]),
          cmd(`set ${row.key} ${query(label, options, config[row.key])}`)
        )
      );
    });
    lines.push(buildDivider(), buildSecondaryButton(tr('buttons.menu'), cmd('')));
    whisper(playerId, tr('titles.settings'), lines);
  }

  /**
   * Shows the command list.
   *
   * @param {string} playerId Player ID.
   * @returns {void}
   */
  function showHelp(playerId) {
    const rows = HELP_COMMANDS.map(([text, key]) =>
      buildRow(text ? `${COMMAND} ${text}` : COMMAND, escapeHtml(tr(`help.${key}`)))
    );
    rows.push(
      `<div style="font-size:0.85em;margin-top:4px">${escapeHtml(tr('help.footer', { help: HANDOUT_HELP_NAME, deck: HANDOUT_DECK_NAME, legacy: LEGACY_PREFIXES.join(', ') }))}</div>`
    );
    whisper(playerId, tr('titles.help'), rows);
  }

  // ---------------------------------------------------------------------------
  // Route commands
  // ---------------------------------------------------------------------------

  /**
   * Picks the default mode for a new route: loop when it ends where it starts,
   * ping-pong otherwise.
   *
   * @param {object} fields Route fields.
   * @returns {string} Mode.
   */
  function defaultMode(fields) {
    if (fields.kind === ROUTE_KIND_CODE) {
      const parsed = parseCode(fields.code);
      return parsed.ok && stepsReturnToStart(parsed.steps) ? 'loop' : 'pingpong';
    }
    const places = fields.points.filter((p) => 'x' in p);
    const first = places[0];
    const last = places.at(-1);
    return places.length > 2 && Math.hypot(first.x - last.x, first.y - last.y) < 1
      ? 'loop'
      : 'pingpong';
  }

  /**
   * Checks a new route name, whispering an error when it is empty or taken.
   *
   * @param {object} msg Chat message.
   * @param {string} raw Name.
   * @param {string} [exceptId] Route allowed to have the name (when renaming).
   * @returns {string|null} Clean name, or null.
   */
  function checkNewName(msg, raw, exceptId) {
    const name = cleanName(raw);
    if (!name || name.startsWith('#')) {
      fail(msg.playerid, 'noRouteName');
      return null;
    }
    const existing = findRoute(name);
    if (existing && existing.id !== exceptId) {
      fail(msg.playerid, 'routeExists', { name });
      return null;
    }
    return name;
  }

  /**
   * Checks a step code, whispering an error when it is invalid.
   *
   * @param {object} msg Chat message.
   * @param {string} code Step code.
   * @returns {boolean} True when valid.
   */
  function checkCode(msg, code) {
    const parsed = parseCode(code);
    if (!parsed.ok) {
      fail(msg.playerid, `code.${parsed.error}`, { at: parsed.at || '', code });
      return false;
    }
    return true;
  }

  /**
   * Stores a new route and confirms it.
   *
   * @param {object} msg Chat message.
   * @param {object} fields Route fields.
   * @returns {object|null} Route.
   */
  function createRoute(msg, fields) {
    const route = addRoute({ mode: defaultMode(fields), ...fields });
    if (!route) {
      fail(msg.playerid, 'routeInvalid');
      return null;
    }
    done(msg.playerid, 'routeAdded', { name: route.name, mode: tr(`values.mode.${route.mode}`) });
    showRoute(msg.playerid, route);
    return route;
  }

  /**
   * `add <name> <code>`: create a route from a step code.
   *
   * @param {object} msg Chat message.
   * @param {object[]} words Arguments.
   * @returns {void}
   */
  function commandAdd(msg, words) {
    if (words.length < 2) {
      fail(msg.playerid, 'usageAdd');
      return;
    }
    const code = words.at(-1).text;
    const name = checkNewName(msg, joinWords(words.slice(0, -1)));
    if (name && checkCode(msg, code)) {
      createRoute(msg, { name, kind: ROUTE_KIND_CODE, code });
    }
  }

  /**
   * `edit <route> <code>`: change a route's step code.
   *
   * @param {object} msg Chat message.
   * @param {object[]} words Arguments.
   * @returns {void}
   */
  function commandEdit(msg, words) {
    if (words.length < 2) {
      fail(msg.playerid, 'usageEdit');
      return;
    }
    const route = requireRoute(msg, joinWords(words.slice(0, -1)));
    const code = words.at(-1).text;
    if (!route || !checkCode(msg, code)) {
      return;
    }
    const updated = updateRoute(route.id, { kind: ROUTE_KIND_CODE, code, anchor: undefined });
    clearTrackCache();
    done(msg.playerid, 'routeUpdated', { name: updated.name });
    showRoute(msg.playerid, updated);
  }

  /**
   * `draw <name>`: create a route that follows the selected drawing.
   *
   * @param {object} msg Chat message.
   * @param {object[]} words Arguments.
   * @returns {void}
   */
  function commandDraw(msg, words) {
    const { drawings } = readSelection(msg);
    if (drawings.length !== 1) {
      fail(msg.playerid, 'selectOneDrawing');
      return;
    }
    const name = checkNewName(msg, joinWords(words));
    if (!name) {
      return;
    }
    const drawing = drawings[0];
    const pageId = drawing.get('_pageid');
    const page = getObj('page', pageId);
    const props = {
      type: drawing.get('_type'),
      _path: drawing.get('_path') ?? drawing.get('path'),
      points: drawing.get('points'),
      shape: drawing.get('shape'),
      x: drawing.get('x'),
      y: drawing.get('y'),
      left: drawing.get('left'),
      top: drawing.get('top'),
      width: drawing.get('width'),
      height: drawing.get('height'),
      scaleX: drawing.get('scaleX'),
      scaleY: drawing.get('scaleY'),
      rotation: drawing.get('rotation'),
    };
    const result = drawingWaypoints(props, {
      width: page?.get('width'),
      height: page?.get('height'),
    });
    if (!result) {
      fail(msg.playerid, 'drawingEmpty');
      return;
    }
    createRoute(msg, {
      name,
      kind: ROUTE_KIND_WAYPOINTS,
      anchor: ANCHOR_PAGE,
      pageId,
      points: result.points.map(([x, y]) => ({ x, y })),
    });
  }

  /**
   * `route <route> <option> <value>`: change a route option.
   *
   * @param {object} msg Chat message.
   * @param {object[]} words Arguments.
   * @returns {void}
   */
  function commandRouteOption(msg, words) {
    if (words.length < 3) {
      fail(msg.playerid, 'usageRoute');
      return;
    }
    const route = requireRoute(msg, joinWords(words.slice(0, -2)));
    if (!route) {
      return;
    }
    const option = words.at(-2).text.toLowerCase();
    const value = words.at(-1).text;
    const aliases = {
      mode: 'mode',
      interval: 'interval',
      max: 'maxTokens',
      maxtokens: 'maxTokens',
      random: 'randomStart',
      randomstart: 'randomStart',
      start: 'start',
    };
    const key = aliases[option];
    if (!key) {
      fail(msg.playerid, 'unknownRouteOption', { option });
      return;
    }

    if (key === 'start') {
      const mode = value.toLowerCase();
      if (mode === 'clear') {
        updateRoute(route.id, { start: null });
      } else {
        const tokens = readSelection(msg).tokens;
        if (tokens.length !== 1) {
          fail(msg.playerid, 'selectOneToken');
          return;
        }
        const [token] = tokens;
        updateRoute(route.id, {
          start: {
            pageId: token.get('_pageid'),
            left: token.get('left'),
            top: token.get('top'),
            rotation: token.get('rotation'),
          },
        });
      }
    } else {
      const raw =
        key === 'randomStart' && value.toLowerCase() === 'toggle' ? !route.randomStart : value;
      const result = validateRouteOption(key, raw);
      if (!result.valid) {
        fail(msg.playerid, 'badRouteValue', { option, value });
        return;
      }
      updateRoute(route.id, { [key]: result.value });
    }
    clearTrackCache();
    showRoute(msg.playerid, findRoute(`#${route.id}`));
  }

  /**
   * `rename <route> <new name>`.
   *
   * @param {object} msg Chat message.
   * @param {object[]} words Arguments.
   * @returns {void}
   */
  function commandRename(msg, words) {
    const names = splitTwoNames(words);
    if (!names) {
      fail(msg.playerid, 'usageRename');
      return;
    }
    const route = requireRoute(msg, names[0]);
    const name = route && checkNewName(msg, names[1], route.id);
    if (route && name) {
      updateRoute(route.id, { name });
      done(msg.playerid, 'routeRenamed', { from: route.name, to: name });
    }
  }

  /**
   * `copy <route> <new name>`.
   *
   * @param {object} msg Chat message.
   * @param {object[]} words Arguments.
   * @returns {void}
   */
  function commandCopy(msg, words) {
    const names = splitTwoNames(words);
    if (!names) {
      fail(msg.playerid, 'usageCopy');
      return;
    }
    const route = requireRoute(msg, names[0]);
    const name = route && checkNewName(msg, names[1]);
    if (route && name) {
      const { id, ...fields } = route;
      createRoute(msg, { ...JSON.parse(JSON.stringify(fields)), name });
    }
  }

  /**
   * `remove <route> [confirm]`: delete a route, asking first.
   *
   * @param {object} msg Chat message.
   * @param {object[]} words Arguments.
   * @returns {void}
   */
  function commandRemove(msg, words) {
    const confirmed = words.at(-1)?.text.toLowerCase() === 'confirm';
    const route = requireRoute(msg, joinWords(confirmed ? words.slice(0, -1) : words));
    if (!route) {
      return;
    }
    if (!confirmed) {
      whisper(msg.playerid, SCRIPT_NAME, [
        `<div>${escapeHtml(tr('messages.confirmRemove', { name: route.name, count: tokensOnRoute(route.id).length }))}</div>`,
        buildButton(tr('buttons.confirm'), cmd(`remove #${route.id} confirm`)),
      ]);
      return;
    }
    const stopped = deleteRoute(route.id);
    done(msg.playerid, 'routeRemoved', { name: route.name, count: stopped.length });
  }

  /**
   * `examples`: add v4's example routes that are missing.
   *
   * @param {object} msg Chat message.
   * @returns {void}
   */
  function commandExamples(msg) {
    let added = 0;
    for (const example of EXAMPLE_ROUTES) {
      if (!findRoute(example.name)) {
        const fields = { name: example.name, kind: ROUTE_KIND_CODE, code: example.code };
        if (addRoute({ mode: defaultMode(fields), ...fields })) {
          added++;
        }
      }
    }
    done(msg.playerid, 'examplesAdded', { count: added });
    showMainMenu(msg.playerid);
  }

  /**
   * Builds the portable form of a route for export.
   *
   * @param {object} route Route record.
   * @returns {object} Export record.
   */
  function exportRecord(route) {
    const { id, ...fields } = route;
    return fields;
  }

  /**
   * `export [<route>]`: whisper routes as JSON for `import`.
   *
   * @param {object} msg Chat message.
   * @param {object[]} words Arguments.
   * @returns {void}
   */
  function commandExport(msg, words) {
    let routes = listRoutes();
    if (words.length > 0) {
      const route = requireRoute(msg, joinWords(words));
      if (!route) {
        return;
      }
      routes = [route];
    }
    const json = JSON.stringify(routes.map(exportRecord));
    whisper(msg.playerid, tr('titles.export'), [
      `<div style="font-size:0.85em">${escapeHtml(tr('messages.exportHint', { command: `${COMMAND} import` }))}</div>`,
      `<div style="font-family:monospace;word-break:break-all;font-size:0.8em">${escapeHtml(json)}</div>`,
    ]);
  }

  /**
   * `import <json>`: add routes from `export` (or v4 `exportpaths`) output.
   *
   * @param {object} msg Chat message.
   * @param {string} raw JSON text.
   * @returns {void}
   */
  function commandImport(msg, raw) {
    let data;
    try {
      // Roll20 escapes quotes in chat; undo that before parsing.
      data = JSON.parse(
        toText(raw).replaceAll('&quot;', '"').replaceAll('&#34;', '"').replaceAll('&amp;', '&')
      );
    } catch {
      fail(msg.playerid, 'badJson');
      return;
    }
    if (!Array.isArray(data)) {
      fail(msg.playerid, 'badJson');
      return;
    }
    let added = 0;
    let skipped = 0;
    for (const item of data) {
      if (!item || typeof item !== 'object' || findRoute(cleanName(item.name))) {
        skipped++;
        continue;
      }
      let fields = item;
      if (typeof item.path === 'string' && !item.kind) {
        // v4 exportpaths format.
        fields = {
          name: item.name,
          kind: ROUTE_KIND_CODE,
          code: item.path,
          mode: item.runOnce ? 'once' : item.isCycle ? 'loop' : 'pingpong',
          interval: item.intervalOverride,
          maxTokens: item.maxTokens,
          randomStart: item.randomStart === true,
        };
      }
      if (addRoute(fields)) {
        added++;
      } else {
        skipped++;
      }
    }
    done(msg.playerid, 'imported', { added, skipped });
  }

  // ---------------------------------------------------------------------------
  // Token commands
  // ---------------------------------------------------------------------------

  /**
   * `start <route>`: put the selected tokens on a route.
   *
   * @param {object} msg Chat message.
   * @param {object[]} words Arguments.
   * @returns {void}
   */
  function commandStart(msg, words) {
    const tokens = requireTokens(msg);
    const route = tokens && requireRoute(msg, joinWords(words));
    if (!tokens || !route) {
      return;
    }
    const started = [];
    const failures = {};
    let offPage = 0;
    for (const token of tokens) {
      const result = startPatrol(token, route);
      if (result.ok) {
        started.push(token);
        offPage = Math.max(offPage, result.offPage);
      } else {
        (failures[result.reason] ||= []).push(token);
      }
    }
    if (started.length > 0) {
      done(msg.playerid, 'started', { name: route.name, tokens: namesOf(started) });
    }
    if (offPage > 0) {
      whisperWarning(msg.playerid, tr('warnings.offPage', { count: offPage }));
    }
    for (const [reason, failed] of Object.entries(failures)) {
      fail(msg.playerid, reason, {
        tokens: namesOf(failed),
        name: route.name,
        max: route.maxTokens,
      });
    }
  }

  /**
   * Returns the tokens a stop or reset applies to: the selection, a route's
   * tokens, or every patrolling token for `all`.
   *
   * @param {object} msg Chat message.
   * @param {object[]} words Arguments.
   * @returns {string[]|null} Token IDs, or null after an error.
   */
  function targetTokenIds(msg, words) {
    const text = joinWords(words);
    if (text.toLowerCase() === 'all') {
      return Object.keys(getPatrols());
    }
    if (text) {
      const route = requireRoute(msg, text);
      return route ? tokensOnRoute(route.id) : null;
    }
    const tokens = requireTokens(msg);
    return tokens ? tokens.map((tok) => tok.id) : null;
  }

  /**
   * `stop [<route>|all]`: take tokens off their routes and stop selected
   * tokens following.
   *
   * @param {object} msg Chat message.
   * @param {object[]} words Arguments.
   * @returns {void}
   */
  function commandStop(msg, words) {
    const ids = targetTokenIds(msg, words);
    if (!ids) {
      return;
    }
    let count = 0;
    for (const id of ids) {
      const stopped = stopPatrol(id);
      const unfollowed = words.length === 0 && unfollow(id);
      if (stopped || unfollowed) {
        count++;
      }
    }
    done(msg.playerid, 'stopped', { count });
  }

  /**
   * `reset [<route>|all]`: return tokens to where they started and stop them.
   *
   * @param {object} msg Chat message.
   * @param {object[]} words Arguments.
   * @returns {void}
   */
  function commandReset(msg, words) {
    const ids = targetTokenIds(msg, words);
    if (!ids) {
      return;
    }
    const count = ids.filter((id) => resetPatrol(id)).length;
    done(msg.playerid, 'reset', { count });
  }

  /**
   * `lock` / `unlock`.
   *
   * @param {object} msg Chat message.
   * @param {boolean} lock True to lock.
   * @returns {void}
   */
  function commandLock(msg, lock) {
    const tokens = requireTokens(msg);
    if (!tokens) {
      return;
    }
    const changed = tokens.filter((tok) => {
      if (lock) {
        lockToken(tok);
        return true;
      }
      return unlockToken(tok);
    });
    done(msg.playerid, lock ? 'locked' : 'unlocked', {
      tokens: changed.length ? namesOf(changed) : tr('values.none'),
      mode: tr(`values.lockMode.${getConfig().lockMode}`),
    });
  }

  /**
   * `leader`: remember the selected token as the leader for `follow`.
   *
   * @param {object} msg Chat message.
   * @returns {void}
   */
  function commandLeader(msg) {
    const tokens = requireTokens(msg);
    if (!tokens) {
      return;
    }
    if (tokens.length !== 1) {
      fail(msg.playerid, 'selectOneToken');
      return;
    }
    getState().leaders[msg.playerid] = tokens[0].id;
    done(msg.playerid, 'leaderSet', { token: tokenLabel(tokens[0]) });
  }

  /**
   * `follow [<leader>]`: make the selected tokens follow a leader, given by
   * name or ID, or the one set with `leader`. `follow <followerId> <leaderId>`
   * (the v4 form) also works.
   *
   * @param {object} msg Chat message.
   * @param {object[]} words Arguments.
   * @returns {void}
   */
  function commandFollow(msg, words) {
    let followers = readSelection(msg).tokens;
    let leader = null;
    if (
      words.length === 2 &&
      getObj('graphic', words[0].text) &&
      getObj('graphic', words[1].text)
    ) {
      followers = [getObj('graphic', words[0].text)];
      leader = getObj('graphic', words[1].text);
    } else if (words.length > 0) {
      leader = findToken(msg, joinWords(words));
      if (!leader) {
        fail(msg.playerid, 'leaderNotFound', { name: joinWords(words) });
        return;
      }
    } else {
      leader = getObj('graphic', getState().leaders[msg.playerid] || '');
      if (!leader) {
        fail(msg.playerid, 'noLeader');
        return;
      }
    }
    followers = followers.filter((tok) => tok.id !== leader.id);
    if (followers.length === 0) {
      fail(msg.playerid, 'noTokens');
      return;
    }
    const { started, skipped } = followLeader(followers, leader);
    if (started.length > 0) {
      done(msg.playerid, 'following', {
        tokens: namesOf(started),
        leader: tokenLabel(leader),
        mode: tr(`values.followMode.${getConfig().followMode}`),
      });
    }
    if (skipped.length > 0) {
      fail(msg.playerid, 'followLoop', { tokens: namesOf(skipped) });
    }
  }

  /**
   * `unfollow`: stop the selected tokens following.
   *
   * @param {object} msg Chat message.
   * @returns {void}
   */
  function commandUnfollow(msg) {
    const tokens = requireTokens(msg);
    if (tokens) {
      const count = tokens.filter((tok) => unfollow(tok.id)).length;
      done(msg.playerid, 'unfollowed', { count });
    }
  }

  // ---------------------------------------------------------------------------
  // Recording
  // ---------------------------------------------------------------------------

  /**
   * `record …`: start a recording, or work on one.
   *
   *   record <name>                start recording the selected token
   *   record <tokenId> <name>      start recording a token (v4 `build`)
   *   record <ref> <dir> [cells]   move the token and record it
   *   record <ref> W | S           record a wait or a stealth toggle
   *   record <ref> undo|save|cancel
   *   record status                list recordings
   *
   * @param {object} msg Chat message.
   * @param {object[]} words Arguments.
   * @returns {void}
   */
  function commandRecord(msg, words) {
    if (words.length === 0 || (words.length === 1 && words[0].text.toLowerCase() === 'status')) {
      const recordings = Object.values(getRecordings());
      if (recordings.length === 0) {
        done(msg.playerid, 'noRecordings');
      }
      for (const rec of recordings) {
        showRecording(msg.playerid, rec);
      }
      return;
    }

    // An operation on an existing recording: the last word (or the one before a
    // number) is a direction or operation, and the rest names the recording.
    let opIndex = words.length - 1;
    let amount = null;
    if (words.length >= 3 && parseStrictInt(words.at(-1).text) !== null) {
      opIndex = words.length - 2;
      amount = parseStrictInt(words.at(-1).text);
    }
    const op = words[opIndex]?.text.toUpperCase();
    const isOp = op && (DIRECTIONS[op] || RECORD_OPS.includes(op.toLowerCase()));
    const recording =
      words.length >= 2 && isOp ? findRecording(joinWords(words.slice(0, opIndex))) : null;
    if (recording) {
      runRecordOp(msg, recording, op, amount);
      return;
    }

    const onlyRecording = words.length === 1 ? findRecording(words[0].text) : null;
    if (onlyRecording) {
      showRecording(msg.playerid, onlyRecording);
      return;
    }

    // Start a new recording.
    let token = null;
    let nameWords = words;
    const byId = getObj('graphic', words[0].text);
    if (isToken(byId) && words.length > 1) {
      token = byId;
      nameWords = words.slice(1);
    } else {
      const tokens = readSelection(msg).tokens;
      if (tokens.length !== 1) {
        fail(msg.playerid, 'selectOneToken');
        return;
      }
      [token] = tokens;
    }
    const name = checkNewName(msg, joinWords(nameWords));
    if (!name) {
      return;
    }
    if (getRecordingForToken(token.id)) {
      fail(msg.playerid, 'alreadyRecording', { token: tokenLabel(token) });
      return;
    }
    stopPatrol(token.id);
    unfollow(token.id);
    const created = addRecording(name, token.id, token.get('_pageid'), [
      Number(token.get('left')) || 0,
      Number(token.get('top')) || 0,
    ]);
    showRecording(msg.playerid, created);
  }

  /**
   * Runs one recording operation.
   *
   * @param {object} msg Chat message.
   * @param {object} recording Recording record.
   * @param {string} op Upper-case direction or operation.
   * @param {number|null} amount Cells to move.
   * @returns {void}
   */
  function runRecordOp(msg, recording, op, amount) {
    const token = getObj('graphic', recording.tokenId);
    const recordings = getRecordings();
    if (op === 'CANCEL') {
      delete recordings[recording.id];
      done(msg.playerid, 'recordingCancelled', { name: recording.name });
      return;
    }
    if (!token) {
      delete recordings[recording.id];
      fail(msg.playerid, 'recordingTokenGone', { name: recording.name });
      return;
    }
    if (op === 'SAVE') {
      saveRecording(msg, recording);
      return;
    }
    if (op === 'UNDO') {
      recordUndo(recording, token);
    } else if (op === 'W') {
      recording.entries.push({ wait: 1 });
    } else if (op === 'S') {
      toggleStealth(token);
      recording.entries.push({ stealth: true });
    } else {
      const cells = Math.min(Math.max(amount ?? getConfig().buttonStep, 1), 20);
      recordStep(recording, token, op, cells);
    }
    showRecording(msg.playerid, recording);
  }

  /**
   * Saves a recording as a route.
   *
   * @param {object} msg Chat message.
   * @param {object} recording Recording record.
   * @returns {void}
   */
  function saveRecording(msg, recording) {
    const ctx = getPageContext(recording.pageId);
    const result = ctx ? recordingToRoute(recording.entries, ctx.grid) : null;
    if (!result) {
      fail(msg.playerid, 'recordingEmpty');
      return;
    }
    const name = checkNewName(msg, recording.name);
    if (!name) {
      return;
    }
    const fields =
      result.kind === 'code'
        ? { name, kind: ROUTE_KIND_CODE, code: result.code }
        : { name, kind: ROUTE_KIND_WAYPOINTS, anchor: ANCHOR_TOKEN, points: result.points };
    if (createRoute(msg, fields)) {
      delete getRecordings()[recording.id];
    }
  }

  // ---------------------------------------------------------------------------
  // Settings, status and tools
  // ---------------------------------------------------------------------------

  /**
   * `set [<setting> <value>]`.
   *
   * @param {object} msg Chat message.
   * @param {object[]} words Arguments.
   * @returns {void}
   */
  function commandSet(msg, words) {
    if (words.length === 0) {
      showSettings(msg.playerid);
      return;
    }
    const key = Object.keys(DEFAULT_CONFIG).find(
      (k) => k.toLowerCase() === words[0].text.toLowerCase()
    );
    if (!key) {
      fail(msg.playerid, 'unknownSetting', { key: words[0].text });
      return;
    }
    if (words.length === 1) {
      if (key === 'language') {
        done(msg.playerid, 'languages', { list: SUPPORTED_LOCALES.join(', ') });
      } else {
        showSettings(msg.playerid);
      }
      return;
    }
    const raw = joinWords(words.slice(1));
    const result = setConfigValue(key, raw);
    if (!result.valid) {
      fail(msg.playerid, 'badSettingValue', { key, value: raw });
      return;
    }
    clearTrackCache();
    if (key === 'language') {
      installHandouts();
    }
    done(msg.playerid, 'settingChanged', {
      setting: tr(`settings.${key}.label`),
      value: formatValue(key, result.value),
    });
  }

  /**
   * `combat [on|off]`: switch combat on or off by hand.
   *
   * @param {object} msg Chat message.
   * @param {object[]} words Arguments.
   * @returns {void}
   */
  function commandCombat(msg, words) {
    const value = words[0]?.text.toLowerCase();
    const combat = getState().combat;
    combat.manual = value === 'on' ? true : value === 'off' ? false : !combat.manual;
    if (getConfig().combatDetection === 'tracker') {
      whisperWarning(msg.playerid, tr('warnings.combatTrackerOnly'));
    }
    done(msg.playerid, combat.manual ? 'combatOn' : 'combatOff');
  }

  /**
   * `list [routes|tokens]`.
   *
   * @param {object} msg Chat message.
   * @param {object[]} words Arguments.
   * @returns {void}
   */
  function commandList(msg, words) {
    const what = words[0]?.text.toLowerCase();
    if (what !== 'tokens') {
      const rows = listRoutes().map((route) =>
        buildRow(route.name, `<code>${escapeHtml(describeRoute(route))}</code>`)
      );
      whisper(msg.playerid, tr('titles.routes'), rows.length ? rows : tr('menu.noRoutes'));
      return;
    }
    const filter = words.length > 1 ? findRoute(joinWords(words.slice(1))) : null;
    const s = getState();
    const rows = [];
    for (const [tokenId, patrol] of Object.entries(s.patrols)) {
      if (filter && patrol.routeId !== filter.id) {
        continue;
      }
      rows.push(
        buildRow(
          tokenLabel(getObj('graphic', tokenId), tokenId),
          escapeHtml(s.routes[patrol.routeId]?.name || '?')
        )
      );
    }
    for (const [tokenId, follow] of Object.entries(s.follows)) {
      rows.push(
        buildRow(
          tokenLabel(getObj('graphic', tokenId), tokenId),
          escapeHtml(
            tr('values.following', {
              leader: tokenLabel(getObj('graphic', follow.leaderId), follow.leaderId),
            })
          )
        )
      );
    }
    for (const tokenId of Object.keys(s.locks)) {
      rows.push(
        buildRow(tokenLabel(getObj('graphic', tokenId), tokenId), escapeHtml(tr('values.locked')))
      );
    }
    whisper(msg.playerid, tr('titles.tokens'), rows.length ? rows : escapeHtml(tr('values.none')));
  }

  /**
   * `status`: what the Mod is doing and how it sees the current page's grid.
   *
   * @param {object} msg Chat message.
   * @returns {void}
   */
  function commandStatus(msg) {
    const s = getState();
    const pageId = getPlayerPageId(msg.playerid);
    const ctx = getPageContext(pageId);
    const lines = [
      buildRow(tr('status.routes'), String(Object.keys(s.routes).length)),
      buildRow(tr('status.patrols'), String(Object.keys(s.patrols).length)),
      buildRow(tr('status.followers'), String(Object.keys(getFollows()).length)),
      buildRow(tr('status.locked'), String(Object.keys(getLocks()).length)),
      buildRow(tr('status.recordings'), String(Object.keys(s.recordings).length)),
      buildRow(tr('status.paused'), escapeHtml(tr(s.paused ? 'values.on' : 'values.off'))),
      buildRow(tr('status.combat'), escapeHtml(tr(isCombatActive() ? 'values.on' : 'values.off'))),
      buildRow(
        tr('settings.interval.label'),
        escapeHtml(formatValue('interval', getConfig().interval))
      ),
    ];
    if (ctx) {
      const grid = ctx.grid;
      const cell =
        grid.kind === 'hex'
          ? `${grid.colStep.toFixed(1)} × ${grid.rowStep.toFixed(1)}`
          : grid.kind === 'iso'
            ? `${grid.width.toFixed(1)} × ${grid.height.toFixed(1)}`
            : grid.unit.toFixed(1);
      lines.push(
        buildDivider(),
        buildRow(tr('status.page'), escapeHtml(toText(ctx.page.get('name')))),
        buildRow(
          tr('status.grid'),
          escapeHtml(
            tr(`values.grid.${grid.kind}`) + (grid.snap ? '' : ` (${tr('values.gridless')})`)
          )
        ),
        buildRow(tr('status.cell'), escapeHtml(`${cell} px`)),
        buildRow(
          tr('status.calibration'),
          escapeHtml(getCalibration(pageId) ? tr('values.on') : tr('values.off'))
        )
      );
    }
    whisper(msg.playerid, tr('titles.status'), lines);
  }

  /**
   * `calibrate` / `calibrate reset`: line the grid up with tokens snapped to
   * cell centres on the current page.
   *
   * @param {object} msg Chat message.
   * @param {object[]} words Arguments.
   * @returns {void}
   */
  function commandCalibrate(msg, words) {
    const { tokens } = readSelection(msg);
    const pageId = tokens[0]?.get('_pageid') || getPlayerPageId(msg.playerid);
    const page = getObj('page', pageId);
    if (!page) {
      fail(msg.playerid, 'noPage');
      return;
    }
    if (words[0]?.text.toLowerCase() === 'reset') {
      setCalibration(pageId, null);
      clearTrackCache();
      done(msg.playerid, 'calibrationCleared');
      return;
    }
    if (tokens.length === 0) {
      fail(msg.playerid, 'calibrateNeedsTokens');
      return;
    }
    const points = tokens
      .slice(0, 2)
      .map((tok) => [Number(tok.get('left')), Number(tok.get('top'))]);
    const calibration = calibrateGrid(pageGridOptions(page), points);
    if (!calibration) {
      fail(msg.playerid, 'calibrateFailed');
      return;
    }
    setCalibration(pageId, calibration);
    clearTrackCache();
    done(msg.playerid, 'calibrated', { scale: calibration.scale.toFixed(3) });
  }

  /**
   * `pause` / `resume`: stop or restart every patrol at once.
   *
   * @param {object} msg Chat message.
   * @param {boolean} paused True to pause.
   * @returns {void}
   */
  function commandPause(msg, paused) {
    getState().paused = paused;
    done(msg.playerid, paused ? 'paused' : 'resumed');
  }

  // ---------------------------------------------------------------------------
  // Routing
  // ---------------------------------------------------------------------------

  /**
   * Runs a command.
   *
   * @param {object} msg Chat message.
   * @param {object[]} words Words after the prefix.
   * @param {string} rawRest Raw text after the subcommand (for import).
   * @returns {void}
   */
  function routeCommand(msg, words, rawRest) {
    const [first, ...args] = words;
    const sub = first ? first.text.toLowerCase() : 'menu';
    switch (sub) {
      case 'menu':
        showMainMenu(msg.playerid);
        break;
      case 'help':
        showHelp(msg.playerid);
        break;
      case 'start':
        commandStart(msg, args);
        break;
      case 'stop':
        commandStop(msg, args);
        break;
      case 'reset':
        commandReset(msg, args);
        break;
      case 'pause':
        commandPause(msg, true);
        break;
      case 'resume':
        commandPause(msg, false);
        break;
      case 'lock':
        commandLock(msg, true);
        break;
      case 'unlock':
        commandLock(msg, false);
        break;
      case 'leader':
        commandLeader(msg);
        break;
      case 'follow':
        commandFollow(msg, args);
        break;
      case 'unfollow':
        commandUnfollow(msg);
        break;
      case 'add':
        commandAdd(msg, args);
        break;
      case 'edit':
        commandEdit(msg, args);
        break;
      case 'draw':
        commandDraw(msg, args);
        break;
      case 'record':
        commandRecord(msg, args);
        break;
      case 'route':
        commandRouteOption(msg, args);
        break;
      case 'show': {
        const route = requireRoute(msg, joinWords(args));
        if (route) {
          showRoute(msg.playerid, route);
        }
        break;
      }
      case 'rename':
        commandRename(msg, args);
        break;
      case 'copy':
        commandCopy(msg, args);
        break;
      case 'remove':
        commandRemove(msg, args);
        break;
      case 'list':
        commandList(msg, args);
        break;
      case 'examples':
        commandExamples(msg);
        break;
      case 'export':
        commandExport(msg, args);
        break;
      case 'import':
        commandImport(msg, rawRest);
        break;
      case 'combat':
        commandCombat(msg, args);
        break;
      case 'set':
        commandSet(msg, args);
        break;
      case 'calibrate':
        commandCalibrate(msg, args);
        break;
      case 'status':
        commandStatus(msg);
        break;
      case 'journal':
        installHandouts();
        done(msg.playerid, 'journalRebuilt', { help: HANDOUT_HELP_NAME, deck: HANDOUT_DECK_NAME });
        break;
      case 'unitpx':
        whisperWarning(msg.playerid, tr('warnings.unitPx'));
        break;
      default:
        fail(msg.playerid, 'unknownCommand', { command: first.text });
    }
  }

  /**
   * Handles a chat message, routing TokenController commands.
   *
   * @param {object} msg Roll20 chat message.
   * @returns {void}
   */
  function handleInput(msg) {
    if (msg.type !== 'api') {
      return;
    }
    const content = toText(msg.content);
    const prefix = content.split(/\s+/)[0].toLowerCase();
    const legacy = LEGACY_PREFIXES.includes(prefix);
    if (prefix !== COMMAND && !legacy) {
      return;
    }
    if (!playerIsGM(msg.playerid)) {
      fail(msg.playerid, 'gmOnly');
      return;
    }
    try {
      const afterPrefix = content.slice(prefix.length);
      let words = tokenize(afterPrefix);
      if (legacy) {
        words = translateLegacy(words).words;
      }
      // Text after the subcommand, untouched, for JSON imports.
      const rawRest = afterPrefix.trim().replace(/^\S+\s*/, '');
      routeCommand(msg, words, rawRest);
    } catch (err) {
      log(`${SCRIPT_NAME} ERROR handling "${content}": ${err?.message || err}`);
      if (err?.stack) {
        log(err.stack);
      }
      fail(msg.playerid, 'internal');
    }
  }

  let ready = false;

  /**
   * Runs a handler, logging instead of crashing the sandbox on errors.
   *
   * @param {string} label Handler name for the log.
   * @param {Function} fn Handler.
   * @returns {Function} Wrapped handler.
   */
  function guarded(label, fn) {
    return (...args) => {
      if (!ready) {
        return;
      }
      try {
        fn(...args);
      } catch (err) {
        log(`${SCRIPT_NAME} ERROR in ${label}: ${err?.message || err}`);
        if (err?.stack) {
          log(err.stack);
        }
      }
    };
  }

  /**
   * Handles a changed graphic: only tokens matter.
   *
   * @param {object} obj Roll20 graphic.
   * @param {object} prev Previous attributes.
   * @returns {void}
   */
  function handleGraphicChange(obj, prev) {
    if (isToken(obj)) {
      handleTokenChange(obj, prev);
    }
  }

  /**
   * Registers with TokenMod (if installed) so followers move with tokens it
   * moves; the API does not raise change events for moves made by other Mods.
   *
   * @returns {void}
   */
  function observeOtherMods() {
    if (typeof TokenMod !== 'undefined' && typeof TokenMod?.ObserveTokenChange === 'function') {
      TokenMod.ObserveTokenChange(guarded('TokenMod observer', handleObservedChange));
    }
  }

  /**
   * Publishes the API other Mods can call.
   *
   * @returns {void}
   */
  function publishApi() {
    globalThis.TokenController = Object.freeze({
      version: SCRIPT_VERSION,
      /**
       * Registers a function called with (token, prev) whenever TokenController
       * moves a token, matching TokenMod's ObserveTokenChange.
       *
       * @param {Function} fn Observer.
       * @returns {void}
       */
      ObserveTokenChange(fn) {
        observeTokenChange(fn);
      },
      /**
       * Puts a token on a route.
       *
       * @param {string} tokenId Token ID.
       * @param {string} route Route name or `#id`.
       * @returns {boolean} True when the token started.
       */
      start(tokenId, route) {
        const token = getObj('graphic', tokenId);
        const found = findRoute(route);
        return Boolean(ready && token && found && startPatrol(token, found).ok);
      },
      /**
       * Takes a token off its route.
       *
       * @param {string} tokenId Token ID.
       * @returns {boolean} True when it was on a route.
       */
      stop(tokenId) {
        return ready && stopPatrol(tokenId);
      },
      /**
       * Returns a token to where it started and takes it off its route.
       *
       * @param {string} tokenId Token ID.
       * @returns {boolean} True when it was on a route.
       */
      reset(tokenId) {
        return ready && resetPatrol(tokenId);
      },
      /**
       * Returns the name of the route a token is on.
       *
       * @param {string} tokenId Token ID.
       * @returns {string|null} Route name, or null.
       */
      routeOf(tokenId) {
        const patrol = getPatrols()[tokenId];
        return patrol ? getState().routes[patrol.routeId]?.name || null : null;
      },
    });
  }

  /**
   * Startup: migrate state, clean up, install handouts and greet the GM.
   *
   * @returns {void}
   */
  function checkInstall() {
    const migratedFrom = initialiseState();
    applyGlobalConfig();
    const dropped = preparePatrols();
    installHandouts();
    const removedGuide = migratedFrom === 4 ? removeLegacyHandout() : 0;
    observeOtherMods();
    publishApi();
    startScheduler();
    ready = true;

    log(
      `-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} [Updated: ${SCRIPT_LAST_UPDATED}] (${isJumpgate() ? 'Jumpgate' : 'Legacy'}) <=-`
    );

    const lang = getConfig().language;
    const line = (text) => `<div style="margin-top:3px">${escapeHtml(text)}</div>`;
    const lines = [`<div><strong>${escapeHtml(t('titles.ready', lang))}</strong></div>`];
    if (migratedFrom === 4) {
      const info = getState().notices.migratedV4 || {};
      lines.push(line(t('messages.migrated', lang, info)));
      if (info.unitPx && info.unitPx !== 70) {
        lines.push(line(t('warnings.unitPx', lang)));
      }
      if (removedGuide > 0) {
        lines.push(line(t('messages.removedGuide', lang)));
      }
    }
    if (dropped > 0) {
      lines.push(line(t('messages.pruned', lang, { count: dropped })));
    }
    lines.push(
      `<div style="font-size:0.85em;margin-top:3px">${escapeHtml(t('messages.readyHint', lang))}</div>`
    );
    whisper(null, `${SCRIPT_NAME} v${SCRIPT_VERSION}`, lines);
    if (migratedFrom === 4) {
      showMainMenu(null);
    }
  }

  /**
   * Registers all Roll20 event handlers.
   *
   * @returns {void}
   */
  function registerEventHandlers() {
    on('ready', () => {
      try {
        checkInstall();
      } catch (err) {
        log(`${SCRIPT_NAME} ERROR during startup: ${err?.message || err}`);
        if (err?.stack) {
          log(err.stack);
        }
      }
    });
    on('chat:message', (msg) => {
      if (ready) {
        handleInput(msg);
      }
    });
    on('change:graphic', guarded('change:graphic', handleGraphicChange));
    on(
      'destroy:graphic',
      guarded('destroy:graphic', (obj) => forgetToken(obj.id))
    );
    on('change:page', guarded('change:page', clearTrackCache));
    on(
      'change:campaign:turnorder',
      guarded('change:campaign:turnorder', (campaign) => handleTurnOrderChange(campaign))
    );
  }

  registerEventHandlers();
})();
