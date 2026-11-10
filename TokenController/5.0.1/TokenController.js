/**
 * NOTE: GENERATED FILE - DO NOT EDIT DIRECTLY.
 * NOTE: Source files live under src/ and are bundled with `npm run build`.
 * ------------------------------------------------
 * Name: TokenController
 * Script: TokenController.js
 * Version: 5.0.1
 * Built: 2026-11-10T00:57:54.682Z
 */
const TokenControllerMod = (() => {
  'use strict';

  // Build-time placeholders replaced by rollup.config.js inject-build-metadata plugin.
  const SCRIPT_NAME = 'TokenController';
  const SCRIPT_VERSION = '5.0.1';
  const SCRIPT_LAST_UPDATED = '2026-11-10T00:57:54.682Z';

  const DEFAULT_LOCALE$1 = 'en-US';

  const STATE_KEY = 'TokenController';
  const SCHEMA_VERSION = 5;
  const COMMAND = '!tokencontroller';

  // v4 command prefixes. Both accept the v4 subcommands as well as the v5 ones,
  // so existing macros and the T-Cntrl_ macros keep working.
  const LEGACY_PREFIXES = ['!tc', '!token-control'];

  // The player ID Roll20 gives chat messages sent by Mods with sendChat.
  const API_PLAYER_ID = 'API';

  const HANDOUT_HELP_NAME = 'TokenController - Help';
  const HANDOUT_DECK_NAME = 'TokenController - Command Deck';
  // Journal icon (the handouts' avatar): the plain TokenController icon in Roll20's
  // file store. Roll20 keeps it as `.../max.webp?<number>`, so an icon is matched
  // on its image path. Only the webp files exist (thumb.png is a 404).
  const HANDOUT_ICON_PATH = '/images/506962431/pc4jQiRNRPyN2p2m4Hykzg/';
  const HANDOUT_ICON = `https://files.d20.io${HANDOUT_ICON_PATH}thumb.webp`;

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

  // Route kinds: a step code ("U2R2D2L2"), a list of waypoints, or an area to
  // bounce around inside.
  const ROUTE_KIND_CODE = 'code';
  const ROUTE_KIND_WAYPOINTS = 'waypoints';
  const ROUTE_KIND_AREA = 'area';

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
  const MARKER_ACTION_OPTIONS = ['stop', 'reset'];
  const WALL_MODE_OPTIONS = ['ignore', 'hold', 'turn'];
  const WALL_CHECK_OPTIONS = ['centre', 'width'];
  const WALL_PASS_OPTIONS = ['block', 'pass'];

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
    stopMarkers: 'none',
    markerAction: 'stop',
    wallMode: 'ignore',
    wallCheck: 'centre',
    oneWayWalls: 'block',
    transparentWalls: 'block',
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
    ['bounce <name>', 'bounce'],
    ['record <name>', 'record'],
    ['route <route> <option> <value>', 'route'],
    ['show <route>', 'show'],
    ['rename <route> <new name>', 'rename'],
    ['copy <route> <new name>', 'copy'],
    ['remove <route>', 'remove'],
    ['start | stop | reset | lock | unlock | remove --ids <id;id;…>', 'ids'],
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
   * Reads the properties of a drawing (Legacy `path` or Jumpgate `pathv2`)
   * that the drawing geometry needs.
   *
   * @param {object} drawing Roll20 path or pathv2.
   * @returns {object} Plain properties.
   */
  function drawingProps(drawing) {
    return {
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
  }

  /**
   * Parses a list of status marker names separated by semicolons, commas or
   * spaces ("dead;red"). `none`, `off` and `-` mean an empty list.
   *
   * @param {*} raw Raw input.
   * @returns {string[]|null} Marker names, or null when one is not a valid name.
   */
  function parseMarkerList(raw) {
    const text = toText(raw);
    if (!text || ['none', 'off', '-'].includes(text.toLowerCase())) {
      return [];
    }
    const names = text.split(/[;,\s]+/).filter(Boolean);
    return names.every((name) => /^[\w:-]{1,60}$/.test(name)) ? [...new Set(names)] : null;
  }

  /**
   * Returns the first of the given marker names that a token shows. Number
   * badges (`red@2`) are ignored, and a custom marker (`Poisoned::1234`) matches
   * by its whole tag or by its name. Names match whatever their case.
   *
   * @param {object} token Roll20 graphic.
   * @param {string[]} names Marker names to look for.
   * @returns {string|null} The matching name, or null.
   */
  function findMarker(token, names) {
    const shown = new Set();
    for (const tag of toText(token.get('statusmarkers')).split(',')) {
      const base = tag.split('@')[0].trim().toLowerCase();
      if (base) {
        shown.add(base);
        shown.add(base.split('::')[0]);
      }
    }
    return names.find((name) => shown.has(name.toLowerCase())) || null;
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
  // √3 units wide and dimetric ones 2 units wide. Measured in Jumpgate and
  // Legacy: with no grid offset, a diamond centre sits at (0, ¾ of a diamond
  // height).
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

  const TRANSLATION$n = {
    titles: {
      ready: 'TokenController is gereed.',
      settings: 'TokenController-instellings',
      help: 'TokenController-opdragte',
      export: 'Roete-uitvoer',
      routes: 'Roetes',
      tokens: 'Beheerde tekens',
      status: 'TokenController-status',
    },
    messages: {
      migrated:
        "Opgegradeer vanaf weergawe 4. Roetes gehou: {routes}. Patrolleertekens gehou: {patrols}. Jou ou makro's en !tc-opdragte werk steeds.",
      removedGuide:
        'Die ou "TokenController Usage Guide"-uitdeelstuk, wat spelers kon sien, is vervang deur die GM-enigste Help-uitdeelstuk.',
      pruned: 'Patrollies vergeet omdat hul tokens nie meer bestaan nie: {count}.',
      readyHint:
        'Tik !tokencontroller vir die spyskaart, of maak die Command Deck-uitdeelstuk oop.',
      combatStarted: {
        pause: 'Geveg het begin: patrollies word onderbreek totdat dit eindig.',
        step: 'Geveg het begin: patrollies beweeg een tree elke beurt.',
      },
      combatEnded: 'Geveg is verby: patrollies gaan voort.',
      routeAdded: 'Roete "{name}" bygevoeg ({mode}).',
      routeUpdated: 'Roete "{name}" is opgedateer. Tekens daarop gaan voort met die nuwe roete.',
      confirmRemove: 'Verwyder roete "{name}"? Tekens daarop wat sal stop: {count}.',
      routeRemoved: 'Roete "{name}" is verwyder. Tekens gestop: {count}.',
      routeRenamed: 'Roete "{from}" hernoem na "{to}".',
      examplesAdded: 'Voorbeeldroetes bygevoeg: {count}.',
      exportHint: 'Kopieer die teks hieronder en plak dit na {command} in enige speletjie.',
      imported:
        'Ingevoerde {added} roetes; {skipped} oorgeslaan (naam reeds gebruik of nie geldig nie).',
      started: '{tokens} het begin op "{name}".',
      stopped: 'Tekens gestop: {count}.',
      reset: 'Tokens het teruggekeer na waar hulle begin het: {count}.',
      locked: 'Gesluit: {tokens} ({mode}).',
      unlocked: 'Ontsluit: {tokens}.',
      leaderSet: '{token} is die leier. Kies die volgers en klik op Volg.',
      following: 'Volg nou {leader} ({mode}): {tokens}.',
      unfollowed: 'Tekens volg nie meer nie: {count}.',
      noRecordings: 'Niks word aangeteken nie.',
      recordingCancelled: 'Opname "{name}" is gekanselleer.',
      languages: 'Ondersteunde tale: {list}',
      settingChanged: '{setting} is nou {value}.',
      combatOn: 'Geveg aangeskakel.',
      combatOff: 'Geveg afgeskakel.',
      calibrationCleared: 'Roosterkalibrasie is van hierdie bladsy verwyder.',
      calibrated: 'Rooster gekalibreer vir hierdie bladsy (selgrootte × {scale}).',
      paused: 'Alle patrollies het stilgestaan.',
      resumed: 'Patrollies is hervat.',
      journalRebuilt: 'Uitdeelstukke herbou: {help} en {deck}.',
      markerStopped: "Gestop deur 'n stopmerker: {tokens}.",
      markerReset: "Teruggestuur na waar hulle begin het deur 'n stopmerker: {tokens}.",
    },
    errors: {
      noTokens: 'Geen tokens gekies nie.',
      noRouteName: 'Geen roetenaam gegee nie.',
      routeNotFound: 'Daar is geen roete genaamd "{name}" nie.',
      routeExists: 'Daar is reeds \'n roete genaamd "{name}".',
      code: {
        empty: 'Die stapkode is leeg.',
        badToken: 'Die stapkode "{code}" het iets wat dit nie verstaan nie by "{at}".',
        tooFar: 'Die stap "{at}" is te lank.',
      },
      routeInvalid: 'Daardie roete kon nie gestoor word nie.',
      usageAdd: "Gee 'n naam en 'n stapkode.",
      usageEdit: "Gee 'n roete en 'n nuwe stapkode.",
      selectOneDrawing:
        "Kies presies een tekening ('n lyn, veelhoek, vryhandvorm, reghoek of ellips).",
      drawingEmpty: 'Die geselekteerde tekening het te min punte om te volg.',
      usageRoute: "Gee 'n roete, 'n opsie en 'n waarde.",
      unknownRouteOption: 'Daar is geen roete-opsie genaamd "{option}" nie.',
      selectOneToken: 'Kies presies een teken.',
      badRouteValue: '"{value}" is nie \'n geldige waarde vir {option} nie.',
      usageRename: "Gee 'n roete en sy nuwe naam.",
      usageCopy: "Gee 'n roete en 'n naam vir die kopie.",
      badJson: 'Dit is nie roete-uitvoerteks nie.',
      tokenLocked: '{tokens} kan nie begin nie: gesluit.',
      tokenMarked: "{tokens} kan nie begin nie: hulle het 'n stopmerker.",
      outsideArea: '{tokens} kan nie begin nie: hulle is buite "{name}".',
      selectOneArea:
        "Kies presies een geslote tekening ('n veelhoek, reghoek, ellips of vryhandlus).",
      areaTooSmall: "Die geselekteerde tekening benodig ten minste drie hoeke om 'n area te maak.",
      idsNotFound: "Geen tokens het hierdie ID's nie: {ids}.",
      routeOnOtherPage: '{tokens} kan nie begin nie: "{name}" is op \'n ander bladsy geteken.',
      startOnOtherPage:
        '{tokens} kan nie begin nie: die vaste begin van "{name}" is op \'n ander bladsy.',
      routeFull: '{tokens} kan nie begin nie: "{name}" het reeds {max} tekens.',
      noPage: 'Die bladsy kon nie gevind word nie.',
      emptyTrack: '{tokens} kan nie begin nie: "{name}" het geen bewegings nie.',
      leaderNotFound: 'Geen teken genaamd "{name}" is op hierdie bladsy gevind nie.',
      noLeader: 'Daar is nog geen leier nie.',
      followLoop: "{tokens} kan nie 'n teken volg wat hulle volg nie.",
      alreadyRecording: '{token} word reeds opgeneem.',
      recordingTokenGone: 'Die teken vir die opname van "{name}" bestaan nie meer nie.',
      recordingEmpty: 'Niks is nog aangeteken nie.',
      unknownSetting: 'Daar is geen instelling genaamd "{key}" nie.',
      badSettingValue: '"{value}" is nie \'n geldige waarde vir {key} nie.',
      calibrateNeedsTokens: 'Kies een of twee tekens wat na selsentrums geknip is.',
      calibrateFailed:
        'Die geselekteerde tokens kon nie gebruik word om die rooster te kalibreer nie.',
      unknownCommand: 'Onbekende opdrag "{command}".',
      gmOnly: 'Slegs die GM kan TokenController gebruik.',
      internal: 'Iets het verkeerd geloop. Besonderhede is in die API-konsole.',
    },
    hints: {
      noTokens: 'Kies eers die tekens op die kaart.',
      noRouteName: 'Byvoorbeeld: !tokenbeheerder voeg Guard Walk U2R2D2L2 by',
      routeNotFound: 'Tik !tokencontroller list om alle roetes te sien.',
      code: {
        empty: 'Byvoorbeeld: U2R2D2L2',
        badToken:
          "Gebruik U, D, L, R, UL, UR, DL of DR met 'n aantal selle, W om te wag en S vir stealth.",
        tooFar: "'n Enkele stap kan hoogstens 100 selle wees; wag hoogstens 100 bosluise.",
      },
      selectOneDrawing:
        "Teken die roete met 'n tekengereedskap, kies dit (sleep 'n blokkie om 'n dun buitelyn as jy dit mis deur te klik), probeer dan weer.",
      usageRoute: 'Opsies: modus, interval, maksimum, ewekansig, mure, begin.',
      routeOnOtherPage: 'Getekende roetes werk net op die bladsy waarop hulle geteken is.',
      startOnOtherPage: 'Maak die vaste begin skoon, of skuif eers die teken na daardie bladsy.',
      noLeader: 'Kies die leier en klik Leier, of gee sy naam: !tokencontroller follow Name',
      leaderNotFound: 'Gebruik die tekennaam presies soos op die kaart gewys, of sy teken-ID.',
      badJson: 'Plak die teks van !tokencontroller export (of v4 exportpaths) presies.',
      unknownSetting: 'Tik !tokencontroller set om alle instellings te sien.',
      calibrateNeedsTokens:
        "Een teken is in lyn met die rooster; twee tekens in naburige selle van 'n ry bepaal ook die selgrootte.",
      calibrateFailed:
        'Maak seker dat die tokens in naburige selle van dieselfde ry is (kolom op Hex (H) bladsye).',
      unknownCommand: 'Tik !tokencontroller-hulp vir die lys opdragte.',
      tokenLocked: 'Ontsluit eers die teken.',
      tokenMarked: 'Verwyder die merker, of verander die Stop Merkers instelling.',
      outsideArea:
        'Beweeg eers die tekens binne die area, of skakel Willekeurige begin vir die roete aan.',
      selectOneArea:
        "Teken die area met 'n tekengereedskap, kies dit (sleep 'n blokkie om 'n dun buitelyn as jy dit mis deur te klik), probeer dan weer.",
      idsNotFound: "Gee teken-ID's na --ids, geskei deur kommapunte.",
    },
    warnings: {
      idsNotFound: "Geen tokens het hierdie ID's nie, so hulle is oorgeslaan: {ids}.",
      offPage:
        "'n Deel van die roete loop van die bladsy af (stappe: {count}). Daardie stappe word oorgeslaan.",
      combatTrackerOnly:
        'Gevegsopsporing is ingestel op die beurtspoorder, so hierdie skakelaar het geen effek totdat jy dit verander nie.',
      unitPx:
        'Weergawe 5 lees die selgrootte vanaf elke bladsy, dus word die ou Pixels Per Unit-instelling nie meer gebruik nie. As tokens nie in lyn is nie, gebruik !tokencontroller calibrate.',
    },
    values: {
      on: 'Aan',
      off: 'Af',
      none: 'Geen',
      default: 'Verstek',
      noLimit: 'Geen beperking nie',
      ms: '{ms} ms',
      andMore: 'en nog {count}',
      following: 'volg {leader}',
      locked: 'gesluit',
      gridless: 'geen klap nie',
      grid: {
        square: 'Vierkantig',
        hex: 'Heks',
        iso: 'Isometries / Dimetries',
      },
      mode: {
        loop: 'Lus',
        pingpong: 'Heen en weer',
        once: 'Een keer',
      },
      movement: {
        cell: "Een sel op 'n slag",
        segment: "Hele stap op 'n slag",
      },
      facing: {
        off: 'Moenie draai nie',
        up: 'Kuns gesigte na bo',
        down: 'Kuns gesigte na onder',
        left: 'Kunsgesigte links',
        right: 'Kuns gesigte reg',
      },
      combatDetection: {
        tracker: 'Draai spoorsnyer',
        manual: 'GM skakelaar',
        both: 'Draai spoorsnyer of GM-skakelaar',
      },
      combatBehaviour: {
        pause: 'Pouse',
        step: 'Beweeg elke beurt',
        ignore: 'Hou aan beweeg',
      },
      lockMode: {
        native: 'Roll20 se posisie slot',
        revert: 'Ontdoen bewegings',
        freeze: 'Hou net stil',
      },
      followMode: {
        trail: 'Enkele lêer',
        formation: 'Vorming',
      },
      manualMove: {
        continue: 'Gaan voort van daar af',
        stop: 'Stop die patrollie',
      },
      markerAction: {
        stop: 'Stop waar dit is',
        reset: 'Gaan terug na die begin',
      },
      wallMode: {
        ignore: 'Loop deur mure',
        hold: 'Wag by mure',
        turn: 'Draai terug by mure',
      },
      wallCheck: {
        centre: 'Middel van die teken',
        width: 'Hele teken',
      },
      oneWayWalls: {
        block: 'Blok',
        pass: 'Laat deur',
      },
      transparentWalls: {
        block: 'Blok',
        pass: 'Laat deur',
      },
    },
    menu: {
      statusRunning: 'Patrolleertekens: {patrols}. Roetes: {routes}.',
      statusPaused: 'Alle patrollies word onderbreek.',
      statusCombat: {
        pause: 'In geveg: patrollies word onderbreek.',
        step: "In 'n geveg: patrollies beweeg elke beurt.",
      },
      routes: 'Roetes',
      noRoutes:
        'Nog geen roetes nie. Voeg een by, teken een, teken een aan of voeg die voorbeelde by.',
      create: 'Nuwe roete',
      selected: 'Geselekteerde tokens',
      tools: 'Gereedskap',
      recordings: 'Opnames',
      patrols: 'Patrollies',
    },
    buttons: {
      start: 'Begin',
      stop: 'Stop',
      add: 'Stap Kode',
      draw: 'Van Tekening',
      bounce: 'Weerkaatsarea',
      record: 'Rekord',
      examples: 'Voorbeelde',
      reset: 'Stel terug',
      lock: 'Sluit',
      unlock: 'Ontsluit',
      leader: 'Leier',
      follow: 'Volg',
      unfollow: 'Ontvolg',
      resume: 'Hervat',
      pause: 'Onderbreek alles',
      combatOn: 'Geveg aan',
      combatOff: 'Geveg af',
      stopAll: 'Stop Almal',
      settings: 'Instellings',
      status: 'Status',
      help: 'Hulp',
      open: 'Maak oop',
      clearStart: 'Duidelik',
      setStart: 'Stel op Gekies',
      edit: 'Wysig kode',
      rename: 'Hernoem',
      copy: 'Kopieer',
      export: 'Uitvoer',
      remove: 'Verwyder',
      menu: 'Spyskaart',
      wait: 'Wag',
      stealth: 'Sluip',
      undo: 'Ontdoen',
      save: 'Stoor',
      cancel: 'Kanselleer',
      confirm: 'Ja, verwyder dit',
      startRoute: 'Begin roete',
      list: 'Lys Roetes',
      calibrate: 'Kalibreer',
    },
    prompts: {
      name: 'Roete naam',
      code: 'Stap kode',
      interval: 'Millisekondes per stap (0 = verstek)',
      maxTokens: 'Meeste tokens gelyktydig (0 = geen limiet)',
      newName: 'Nuwe naam',
      route: 'Roete naam',
    },
    route: {
      drawn: 'Getekende roete, {points} punte',
      recorded: 'Opgeneemde roete, {points} punte',
      area: 'Weiering area, {points} hoeke',
      path: 'Pad',
      mode: 'Modus',
      interval: 'Interval',
      maxTokens: 'Die meeste tekens',
      randomStart: 'Willekeurige begin',
      walls: 'Mure',
      start: 'Vaste begin',
      tokens: 'Tekens',
    },
    record: {
      title: 'Neem tans "{name}" op',
      intro:
        'Neem {token} op (beweeg tot dusver: {count}). Klik op die pyle, of sleep die teken op die kaart; elke beweging word aangeteken.',
    },
    settings: {
      interval: {
        label: 'Interval',
        desc: 'Millisekondes tussen stappe. Elke roete kan dit ignoreer.',
      },
      movement: {
        label: 'Beweging',
        desc: "sel beweeg een sel per stap; segment beweeg 'n hele stap (soos U3) op een slag, soos weergawe 4 gedoen het.",
      },
      facing: {
        label: 'Draai Tokens',
        desc: 'Draai tekens om te wys waarheen hulle gaan: af, of die manier waarop die tekenkuns wys (op, af, links of regs).',
      },
      combatDetection: {
        label: 'Gevegsopsporing',
        desc: 'Hoe gevegte opgemerk word: spoorsnyer (die beurt spoorsnyer is oop met iemand daarin), handleiding (die Combat On/Off knoppies) of albei.',
      },
      combatBehaviour: {
        label: 'Gevegsgedrag',
        desc: "Wat patrollies in 'n geveg doen: breek, trap (beweeg een keer elke keer as die beurt verbygaan) of ignoreer (hou aan beweeg).",
      },
      lockMode: {
        label: 'Sluitmodus',
        desc: "Hoe Lock 'n teken hou: inheems (Roll20 se eie posisieslot, sodat niemand dit kan sleep nie), keer terug (skuiwe word ongedaan gemaak) of vries (dit hou op patrolleer en volg, maar kan steeds gesleep word).",
      },
      lockMarker: {
        label: 'Slot Merker',
        desc: 'Statusmerker wat op geslote tekens gewys word, of geen. Spelers kan merkers sien.',
      },
      followMode: {
        label: 'Volgmodus',
        desc: "roete: volgelinge loop enkele lêer in die leier se voetspore. vorming: volgelinge hou hul plek rondom die leier (sleep 'n volger om sy plek te verander).",
      },
      manualMove: {
        label: "Sleep 'n patrollie",
        desc: "Wanneer jy 'n patrollieteken sleep: gaan voort (die roete gaan voort van waar jy dit laat val het) of stop (die patrollie eindig).",
      },
      stopMarkers: {
        label: 'Stop Merkers',
        desc: "Statusmerkers wat 'n teken van sy roete afhaal en keer dat dit volg, geskei deur kommapunte (byvoorbeeld dood;rooi), of geen. Volgers van 'n leier met een van hierdie merkers stop ook.",
      },
      markerAction: {
        label: 'Stop Merker Aksie',
        desc: "Wat 'n patrollieteken doen wanneer dit 'n stopmerker kry: stop (dit bly waar dit is) of herstel (dit gaan terug na waar dit begin het).",
      },
      wallMode: {
        label: 'Mure',
        desc: "Wat patrollies en volgelinge doen by dinamiese beligtingsmure en toe deure en vensters: ignoreer (loop deur), hou vas (wag totdat die pad oop is, byvoorbeeld totdat 'n deur oopgaan) of draai (patrollies draai terug). Elke roete kan sy eie kies, so spoke kan steeds deur mure loop.",
      },
      wallCheck: {
        label: 'Muurtjek',
        desc: "middel: slegs die middel van 'n teken moet wegbly van mure. breedte: die hele teken doen dit, so 'n groot teken kan nie deur 'n nou gaping druk nie.",
      },
      oneWayWalls: {
        label: 'Eenrigtingmure',
        desc: 'Of eenrigtingmure stoptekens (blok) of nie (slaag).',
      },
      transparentWalls: {
        label: 'Sien-Deur Mure',
        desc: 'Of deursigtige mure, wat lig deurlaat, tekens stop (blok) of nie (slaag).',
      },
      buttonStep: {
        label: 'Selle per klik',
        desc: "Hoe ver beweeg die opnamepyle 'n teken.",
      },
      language: {
        label: 'Taal',
        desc: 'Taal vir spyskaarte, boodskappe en uitdeelstukke.',
      },
    },
    status: {
      routes: 'Roetes',
      patrols: 'Patrolleer tekens',
      followers: 'Volgende tekens',
      locked: 'Geslote tekens',
      recordings: 'Opnames',
      paused: 'Onderbreek',
      combat: 'Geveg',
      page: 'Huidige bladsy',
      grid: 'Rooster',
      cell: 'Selgrootte',
      calibration: 'Kalibrasie',
    },
    help: {
      menu: 'Wys die spyskaart.',
      start: "Plaas die geselekteerde tekens op 'n roete.",
      stop: "Stop die geselekteerde tekens (patrollies en volg), elke teken op 'n roete, of almal.",
      reset: 'Bring tekens terug na waar hulle begin het en stop hulle.',
      pause: 'Onderbreek of hervat elke patrollie.',
      lock: 'Hou die geselekteerde tekens in plek, of laat hulle los.',
      leader: 'Kies die gekose teken as die leier om te volg.',
      follow:
        "Laat die geselekteerde tekens die leier volg, of 'n teken wat by die naam gegee word.",
      unfollow: 'Stop die geselekteerde tekens wat volg.',
      add: "Skep 'n roete vanaf 'n stapkode, soos U2R2D2L2.",
      edit: "Verander 'n roete se stapkode.",
      draw: "Skep 'n roete wat die geselekteerde tekening op hierdie bladsy volg.",
      bounce:
        "Skep 'n roete waarop tokens binne die geselekteerde geslote tekening dwaal en van sy rande af bons.",
      record:
        "Teken 'n roete op deur die geselekteerde teken met knoppies te skuif of deur dit te sleep.",
      route: "Verander 'n roete-opsie: modus, interval, maksimum, ewekansig, mure of begin.",
      show: "Wys 'n roete se besonderhede en knoppies.",
      rename: "Hernoem 'n roete.",
      copy: "Kopieer 'n roete onder 'n nuwe naam.",
      remove: "Verwyder 'n roete (vra eers).",
      ids: "Reageer op die tokens met hierdie ID's in plaas van die geselekteerdes, sodat ander Mods soos ScriptCards tokens kan beheer. verwyder --ids neem die tekens van hul roetes af; dit verwyder nooit 'n roete nie.",
      list: 'Lys die roetes, of die tekens wat beheer word.',
      examples: 'Voeg die voorbeeldroetes by.',
      export: "Wys roetes as teks om na 'n ander speletjie te kopieer.",
      import: 'Voeg roetes vanaf uitvoerteks by.',
      combat: 'Skakel geveg met die hand aan of af.',
      set: "Verander 'n instelling, of wys alle instellings.",
      calibrate:
        'Voer die rooster uit met tokens wat na selsentrums geknip is, of verwyder die kalibrasie.',
      status: 'Wys wat die Mod doen en hoe dit hierdie bladsy sien.',
      journal: 'Herbou die hulp- en beveldek-uitdeelstukke.',
      help: 'Wys hierdie lys.',
      footer:
        'Volledige instruksies is in die "{help}"-uitdeelstuk; knoppies is in "{deck}". {legacy} werk steeds met die weergawe 4-opdragte.',
    },
    handout: {
      versionLabel: 'Weergawe',
      subtitle: 'Patrollies, volgelinge en slotte vir Jumpgate en Legacy-speletjies',
      overview: {
        heading: 'Oorsig',
        body: "TokenController skuif tokens vir jou. Gee 'n wag 'n patrollieroete, laat 'n wa sy bestuurder volg, of sluit 'n standbeeld in plek. Roetes kan as 'n stapkode getik word, nagespoor word vanaf 'n tekening op die kaart, of aangeteken word deur 'n teken te skuif. Roetes werk op vierkantige, heks-, isometriese, dimetriese en roosterlose bladsye.",
      },
      quickStart: {
        heading: 'Vinnige Begin',
        steps: [
          'Maak die Command Deck-uitdeelstuk oop, of tik !tokencontroller vir die spyskaart.',
          "Klik Voorbeelde om 'n paar klaargemaakte roetes by te voeg, of Stapkode om jou eie in te tik (byvoorbeeld U2R2D2L2).",
          "Kies een of meer tekens en klik Begin langs 'n roete.",
          "Kies 'n teken en klik Stop om dit te stop, of Herstel om dit terug te stuur na waar dit begin het.",
        ],
      },
      routes: {
        heading: 'Roetes maak',
        points: [
          "Stapkode: tik bewegings soos U2R2D2L2. Kodes is nie gekoppel aan 'n plek op die kaart nie, so dieselfde roete werk enige plek.",
          "Van tekening: teken 'n lyn, veelhoek, vryhandvorm, reghoek of ellips met die tekengereedskap, kies dit en klik vanaf tekening. Tekens loop daarlangs, slegs op daardie bladsy. Jy kan die tekening daarna uitvee.",
          "Rekord: kies 'n teken en klik Rekord. Beweeg dit met die pyltjieknoppies of sleep dit op die kaart (Roll20-wegpunte word gevolg), klik dan Stoor. Op vierkantige roosters word die opname 'n stapkode wat jy kan wysig.",
          'Lusroetes begin weer van voor af; heen-en-weer roetes stap terug soos hulle gekom het; sodra roetes aan die einde stop. Nuwe roetes wat eindig waar hulle begin lus; ander gaan heen en weer.',
          "Weerkaatsarea: teken 'n geslote vorm om die area, kies dit en klik op Weieringgebied. Tekens wat daarop begin, beweeg in reguit lyne en bons van sy rande af (en van mure af, tensy die roete dit ignoreer), en draai elke keer 'n bietjie lukraak. Ewekansige begin plaas elke teken in 'n ewekansige sel van die area.",
        ],
      },
      codes: {
        colCode: 'Kode',
        colMeaning: 'Betekenis',
        move: 'Beweeg op, af, links of regs, een sel.',
        diagonal: 'Beweeg diagonaal.',
        distance: "'n Getal na 'n rigting beweeg soveel selle.",
        face: "Draai om na 'n rigting te kyk sonder om te beweeg (benodig Draaitekens).",
        wait: 'Wag een stap, of die gegewe aantal stappe.',
        stealth:
          'Beweeg die teken tussen die tekenlaag en die GM-laag, sodat dit verdwyn en weer verskyn.',
      },
      routeOptions: {
        heading: 'Roete-opsies',
        colOption: 'Opsie',
        colMeaning: 'Betekenis',
        mode: 'lus, pingpong (heen en weer) of een keer.',
        interval: 'Millisekondes per stap vir hierdie roete, of 0 vir die globale interval.',
        max: 'Die meeste tekens wat gelyktydig op die roete kan wees, of 0 vir geen limiet nie.',
        random: "aan: elke teken begin by 'n ewekansige punt langs die roete.",
        walls:
          'ignoreer (loop deur mure), hou (wag by mure en toe deure), draai (draai terug) of verstek (gebruik die Mure-instelling).',
        start:
          'stel: tokens spring na die geselekteerde token se posisie wanneer hulle begin. duidelik: hulle begin waar hulle staan.',
      },
      tokens: {
        heading: 'Beheer Tokens',
        points: [
          "'n Teken is op een roete op 'n slag. Deur dit op 'n ander roete te begin, vervang die eerste.",
          'Stop laat tekens waar hulle is. Herstel plaas hulle terug waar hulle was voordat hulle begin het, op hul oorspronklike laag.',
          "Slot hou 'n teken in plek. Geslote tekens patrolleer of volg nie totdat dit oopgesluit is nie.",
          'Volg: kies die leier en klik Leier, kies dan die volgers en klik Volg. Jy kan ook die leier se naam tik: !tokencontroller volg Goblin Boss. Volgers volg tekens wat patrolleer, tekens wat jy sleep en tekens wat deur TokenMod geskuif word.',
          "Volgers kan ander volgelinge volg, 'n ketting of 'n kolom maak.",
          "Deur 'n patrollieteken te sleep, dra die patrollie voort van waar jy dit laat val, tensy Sleep 'n patrollie gestel is om te stop.",
          "Mure: met die Mure aan, loop patrollies en volgelinge nie deur dinamiese beligtingsmure of toe deure en vensters nie; oop deure en vensters laat hulle deur. Gee 'n roete sy eie mure opsie (byvoorbeeld ignoreer vir 'n spook).",
          "Stopmerkers: 'n teken wat een van hierdie statusmerkers kry (byvoorbeeld dood) verlaat sy roete en hou op om te volg, en die volgelinge van 'n leier wat een stop kry ook. Stel hulle met !tokenbeheerder stel stopMerkers dood;rooi. Dit werk ook wanneer 'n ander Mod die merker byvoeg.",
        ],
      },
      grids: {
        heading: 'Roosters',
        points: [
          'Die selgrootte en roostertipe word vanaf elke bladsy gelees, so verskillende bladsye kan verskillende roosters gebruik.',
          'U en D beteken altyd op en af op die skerm. Op hex-roosters, beweeg met geen bypassende buur-sigsag nie; op isometriese en dimetriese roosters kruis diagonale een diamant.',
          "Bladsye met knip afgeskakel beweeg in 70-pixel stappe sonder om in lyn te wees met 'n rooster.",
          "As tekens van die rooster af dryf, snap 'n teken na 'n selsentrum, kies dit en klik Kalibreer. Kies twee tekens in naburige selle van 'n ry om ook die selgrootte reg te stel.",
        ],
      },
      combat: {
        heading: 'Geveg',
        points: [
          'Gevegsopsporing kies hoe gevegte opgemerk word: die beurtspoorder, die Geveg aan/af-knoppies, of een van die twee.',
          'Gevegsgedrag kies wat patrollies doen: onderbreek, beweeg een tree elke keer as die beurt verbygaan, of hou aan beweeg.',
          'Pouse All stop elke patrollie enige tyd; Resume begin hulle weer.',
        ],
      },
      commands: {
        heading: 'Opdragte',
        intro:
          'Slegs GM\'e kan hierdie opdragte gebruik. Roetes kan genoem word, of na verwys word deur hul #id vanaf die kieslysknoppies. Plaas name met spasies in "aanhalingstekens" wanneer \'n opdrag twee name neem.',
        mods: "Ander Mods kan ook hierdie opdragte stuur, byvoorbeeld vanaf ScriptCards. Hulle kan nie tekens kies nie, daarom noem hulle hulle met --ids gevolg deur teken-ID's geskei deur kommapunte: !tc stop --ids ID1;ID2. Antwoorde gaan na die GM.",
        colCommand: 'Bevel',
        colDesc: 'Wat dit doen',
      },
      settings: {
        heading: 'Instellings',
        intro:
          'Verander instellings vanaf die kieslys, met !tokencontroller stel <setting> <value>, of op die Mod instellings bladsy in die API Scripts skerm.',
        colKey: 'Sleutel',
        colName: 'Instelling',
        colDesc: 'Beskrywing',
      },
      upgrading: {
        heading: 'Opgradering vanaf weergawe 4',
        points: [
          'Paadjies, patrollietekens, slotte, volgelinge en onvoltooide konsepte word gehou. Konsepte word roetes wat eindig op "(konsep)".',
          'Jou weergawe 4-instellings word behou: interval, substappe, rotasie, gevegspatrollie en eenhede per klik.',
          "Die !tc- en !tokenbeheer-opdragte en die T-Cntrl_-makro's bly werk. Die tabel toon die nuwe opdragte.",
          "Weergawe 4 het die hele spyskaart na elke aksie gestuur; weergawe 5 stuur eerder 'n kort antwoord.",
          'Die Pixels Per Unit-instelling is weg: die selgrootte kom van elke bladsy af. HTML Builder is nie meer nodig nie.',
          'Die ou Gebruiksgids-uitdeelstuk, wat elke speler kon sien, word vervang deur hierdie GM-alleen-uitdeelstuk.',
        ],
        colV4: 'Weergawe 4',
        colV5: 'Weergawe 5',
      },
      troubleshooting: {
        heading: 'Probleemoplossing',
        points: [
          'Tekens beweeg nie: kontroleer Status. Patrollies wag terwyl hulle onderbreek, terwyl hulle gesluit is, en in gevegte wanneer Gevegsgedrag pouse is.',
          'Tokens beweeg die verkeerde afstand: die bladsy se roostergrootte of breuk het dalk verander; probeer Kalibreer.',
          "'n Getekende roete sal nie begin nie: getekende roetes werk net op die bladsy waarop hulle geteken is.",
          "Volgers beweeg nie wanneer 'n ander Mod die leier beweeg nie: slegs TokenMod rapporteer sy bewegings. Ander Mods kan TokenController.ObserveTokenChange noem.",
          'Rapporteer probleme op die Roll20-forum met enige boodskappe vanaf die API-konsole.',
        ],
      },
      languages: {
        heading: 'Tale',
        body: 'TokenController word in die tale hieronder vertaal. Kies een met die Taalinstelling.',
        colCode: 'Kode',
        colName: 'Taal',
        colNative: 'Inheemse naam',
      },
      credits: {
        heading: 'Krediete',
        original: 'Oorspronklike mod deur',
        maintainer: 'Weergawe 5 onderhou deur',
        support: 'Rapporteer foute en idees op die Roll20 Mod-forum of op GitHub.',
      },
      footer: 'Knoppies vir elke handeling is in die "{deck}"-uitdeelstuk.',
    },
    deck: {
      subtitle: 'Beveldek',
      patrolsDesc: 'Begin, stop en onderbreek patrollies. Kies eers tekens.',
      createDesc: "Maak roetes van 'n stapkode, 'n tekening of deur 'n teken aan te teken.",
      selectedDesc: "Sluit tekens, of laat hulle 'n leier volg.",
      toolsDesc: 'Geveg, instellings en roostergereedskap.',
      footer: 'Volledige instruksies is in die "{help}"-uitdeelstuk.',
    },
  };

  const TRANSLATION$m = {
    titles: {
      ready: 'TokenController està llest.',
      settings: 'Configuració de TokenController',
      help: 'Ordres de TokenController',
      export: 'Exportació de ruta',
      routes: 'Rutes',
      tokens: 'Fitxes controlades',
      status: 'Estat de TokenController',
    },
    messages: {
      migrated:
        'Actualitzat des de la versió 4. Rutes conservades: {routes}. Es conserven fitxes de patrulla: {patrols}. Les vostres macros antigues i les ordres !tc encara funcionen.',
      removedGuide:
        'El fullet antic "Guia d\'ús de TokenController", que els jugadors podien veure, es va substituir pel full d\'ajuda només per a GM.',
      pruned: 'Patrulles oblidades perquè les seves fitxes ja no existeixen: {count}.',
      readyHint: 'Escriviu !tokencontroller per al menú o obriu el fullet de comandaments.',
      combatStarted: {
        pause: "El combat ha començat: les patrulles s'aturen fins que s'acaben.",
        step: 'El combat ha començat: les patrulles es mouen un pas cada torn.',
      },
      combatEnded: "El combat s'ha acabat: les patrulles continuen.",
      routeAdded: 'S\'ha afegit la ruta "{name}" ({mode}).',
      routeUpdated:
        'La ruta "{name}" s\'ha actualitzat. Les fitxes contingudes continuen amb la nova ruta.',
      confirmRemove: 'Vols suprimir la ruta "{name}"? Fitxes que s\'aturaran: {count}.',
      routeRemoved: 'S\'ha eliminat la ruta "{name}". Fitxes aturades: {count}.',
      routeRenamed: 'La ruta "{from}" s\'ha canviat de nom a "{to}".',
      examplesAdded: 'Exemples de rutes afegides: {count}.',
      exportHint: "Copia el text següent i enganxa'l després de {command} en qualsevol joc.",
      imported: "{added} rutes importades; s'ha omès {skipped} (nom ja s'utilitza o no és vàlid).",
      started: '{tokens} va començar a "{name}".',
      stopped: 'Fitxes aturades: {count}.',
      reset: 'Els fitxes han tornat a on van començar: {count}.',
      locked: 'Bloquejat: {tokens} ({mode}).',
      unlocked: 'Desbloquejat: {tokens}.',
      leaderSet: '{token} és el líder. Seleccioneu els seguidors i feu clic a Segueix.',
      following: 'Ara seguint {leader} ({mode}): {tokens}.',
      unfollowed: 'Els fitxes ja no segueixen: {count}.',
      noRecordings: "No s'està gravant res.",
      recordingCancelled: 'S\'ha cancel·lat l\'enregistrament "{name}".',
      languages: 'Idiomes admesos: {list}',
      settingChanged: '{setting} ara és {value}.',
      combatOn: 'Combat activat.',
      combatOff: 'Combat apagat.',
      calibrationCleared: "S'ha eliminat el calibratge de la quadrícula d'aquesta pàgina.",
      calibrated: 'Quadrícula calibrada per a aquesta pàgina (mida de cel·la × {scale}).',
      paused: 'Totes les patrulles es van aturar.',
      resumed: 'Es van reprendre les patrulles.',
      journalRebuilt: 'Fullets reconstruïts: {help} i {deck}.',
      markerStopped: "Aturat per un marcador d'aturada: {tokens}.",
      markerReset: 'Un marcador de parada els ha enviat de tornada a on van començar: {tokens}.',
    },
    errors: {
      noTokens: "No s'han seleccionat fitxes.",
      noRouteName: "No s'ha donat cap nom de ruta.",
      routeNotFound: 'No hi ha cap ruta anomenada "{name}".',
      routeExists: 'Ja hi ha una ruta anomenada "{name}".',
      code: {
        empty: 'El codi de pas és buit.',
        badToken: 'El codi de pas "{code}" té alguna cosa que no entén a "{at}".',
        tooFar: 'El pas "{at}" és massa llarg.',
      },
      routeInvalid: "Aquesta ruta no s'ha pogut desar.",
      usageAdd: 'Doneu un nom i un codi de pas.',
      usageEdit: 'Doneu una ruta i un codi de pas nou.',
      selectOneDrawing:
        'Seleccioneu exactament un dibuix (una línia, polígon, forma a mà alçada, rectangle o el·lipse).',
      drawingEmpty: 'El dibuix seleccionat té massa pocs punts per seguir.',
      usageRoute: 'Doneu una ruta, una opció i un valor.',
      unknownRouteOption: 'No hi ha cap opció de ruta anomenada "{option}".',
      selectOneToken: 'Seleccioneu exactament un testimoni.',
      badRouteValue: '"{value}" no és un valor vàlid per a {option}.',
      usageRename: 'Doneu una ruta i el seu nou nom.',
      usageCopy: 'Doneu una ruta i un nom per a la còpia.',
      badJson: "Això no és text d'exportació de ruta.",
      tokenLocked: '{tokens} no pot començar: bloquejat.',
      tokenMarked: "{tokens} no pot començar: tenen un marcador d'aturada.",
      outsideArea: '{tokens} no pot començar: són fora de "{name}".',
      selectOneArea:
        'Seleccioneu exactament un dibuix tancat (un polígon, rectangle, el·lipse o bucle a mà alçada).',
      areaTooSmall: 'El dibuix seleccionat necessita almenys tres cantonades per fer una àrea.',
      idsNotFound: 'Cap testimoni no té aquests identificadors: {ids}.',
      routeOnOtherPage: '{tokens} no pot començar: "{name}" s\'ha dibuixat en una altra pàgina.',
      startOnOtherPage:
        '{tokens} no pot començar: l\'inici fix de "{name}" es troba en una altra pàgina.',
      routeFull: '{tokens} no pot començar: "{name}" ja té fitxes {max}.',
      noPage: "No s'ha pogut trobar la pàgina.",
      emptyTrack: '{tokens} no pot començar: "{name}" no té cap moviment.',
      leaderNotFound: 'No s\'ha trobat cap testimoni anomenat "{name}" en aquesta pàgina.',
      noLeader: 'Encara no hi ha cap líder.',
      followLoop: '{tokens} no pot seguir un testimoni que els segueix.',
      alreadyRecording: "{token} ja s'està gravant.",
      recordingTokenGone: 'El testimoni per gravar "{name}" ja no existeix.',
      recordingEmpty: "Encara no s'ha gravat res.",
      unknownSetting: 'No hi ha cap configuració anomenada "{key}".',
      badSettingValue: '"{value}" no és un valor vàlid per a {key}.',
      calibrateNeedsTokens: 'Seleccioneu una o dues fitxes fixades als centres cel·lulars.',
      calibrateFailed:
        "Les fitxes seleccionades no s'han pogut utilitzar per calibrar la quadrícula.",
      unknownCommand: 'Ordre desconeguda "{command}".',
      gmOnly: 'Només el GM pot utilitzar TokenController.',
      internal: "Alguna cosa va fallar. Els detalls es troben a la consola de l'API.",
    },
    hints: {
      noTokens: 'Seleccioneu primer les fitxes al mapa.',
      noRouteName: 'Per exemple: !tokencontroller afegeix Guard Walk U2R2D2L2',
      routeNotFound: 'Escriviu !tokencontroller list per veure totes les rutes.',
      code: {
        empty: 'Per exemple: U2R2D2L2',
        badToken:
          'Utilitzeu U, D, L, R, UL, UR, DL o DR amb un nombre de cel·les, W per esperar i S per sigil.',
        tooFar: 'Un sol pas pot tenir com a màxim 100 cel·les; espera com a màxim 100 ticks.',
      },
      selectOneDrawing:
        "Dibuixa la ruta amb una eina de dibuix, selecciona-la (arrossegueu un quadre al voltant d'un contorn prim si no hi feu clic) i torneu-ho a provar.",
      usageRoute: 'Opcions: mode, interval, màxim, aleatori, parets, inici.',
      routeOnOtherPage: "Les rutes dibuixades només funcionen a la pàgina on s'han dibuixat.",
      startOnOtherPage: "Esborra l'inici fix o mou primer el testimoni a aquesta pàgina.",
      noLeader:
        'Seleccioneu el líder i feu clic a Líder, o doneu-ne el nom: !tokencontroller follow Name',
      leaderNotFound:
        'Utilitzeu el nom del testimoni exactament com es mostra al mapa, o el seu identificador del testimoni.',
      badJson: 'Enganxeu exactament el text de !tokencontroller export (o v4 exportpaths).',
      unknownSetting: 'Escriviu !tokencontroller set per veure tots els paràmetres.',
      calibrateNeedsTokens:
        "Una fitxa alinea la graella; dues fitxes a les cel·les veïnes d'una fila també fixen la mida de la cel·la.",
      calibrateFailed:
        'Assegureu-vos que les fitxes estiguin a les cel·les veïnes de la mateixa fila (columna a les pàgines Hex (H)).',
      unknownCommand: "Escriviu !tokencontroller help per a la llista d'ordres.",
      tokenLocked: 'Desbloquegeu primer el testimoni.',
      tokenMarked: 'Traieu el marcador o canvieu la configuració de Stop Markers.',
      outsideArea: "Primer moveu les fitxes dins de l'àrea o activeu Inici aleatori per a la ruta.",
      selectOneArea:
        "Dibuixa l'àrea amb una eina de dibuix, selecciona-la (arrossegueu un quadre al voltant d'un contorn prim si no hi feu clic) i torneu-ho a provar.",
      idsNotFound: 'Doneu els ID de testimoni després de --ids, separats per punt i coma.',
    },
    warnings: {
      idsNotFound: "Cap testimoni no té aquests identificadors, de manera que s'han omès: {ids}.",
      offPage: 'Part de la ruta surt de la pàgina (passos: {count}). Es salten aquests passos.',
      combatTrackerOnly:
        'La detecció de combat està configurada per al rastrejador de torns, de manera que aquest interruptor no té cap efecte fins que el canvieu.',
      unitPx:
        "La versió 5 llegeix la mida de la cel·la de cada pàgina, de manera que l'antiga configuració Píxels per unitat ja no s'utilitza. Si les fitxes no s'alineen, utilitzeu !tokencontroller calibrate.",
    },
    values: {
      on: 'Encès',
      off: 'Apagat',
      none: 'Cap',
      default: 'Per defecte',
      noLimit: 'Sense límit',
      ms: '{ms} ms',
      andMore: 'i {count} més',
      following: 'seguint {leader}',
      locked: 'tancat',
      gridless: 'sense trencament',
      grid: {
        square: 'Plaçada',
        hex: 'Hexagonal',
        iso: 'Isomètric / Dimètric',
      },
      mode: {
        loop: 'Bucle',
        pingpong: 'Anada i tornada',
        once: 'Una vegada',
      },
      movement: {
        cell: 'Una cèl·lula a la vegada',
        segment: 'Pas sencer a la vegada',
      },
      facing: {
        off: 'No gireu',
        up: "L'art cara amunt",
        down: "L'art cara avall",
        left: "L'art s'enfronta a l'esquerra",
        right: "L'art mira a la dreta",
      },
      combatDetection: {
        tracker: 'Seguidor de torns',
        manual: 'Interruptor GM',
        both: "Gireu el rastrejador o l'interruptor GM",
      },
      combatBehaviour: {
        pause: 'Pausa',
        step: 'Mou cada torn',
        ignore: 'Seguiu movent-vos',
      },
      lockMode: {
        native: 'Bloqueig de posició de Roll20',
        revert: 'Desfer moviments',
        freeze: 'Mantenir quiet només',
      },
      followMode: {
        trail: 'Fitxa única',
        formation: 'Formació',
      },
      manualMove: {
        continue: "Seguiu des d'allà",
        stop: 'Atureu la patrulla',
      },
      markerAction: {
        stop: 'Atureu-vos on és',
        reset: "Torna a l'inici",
      },
      wallMode: {
        ignore: 'Caminar per les parets',
        hold: 'Espereu a les parets',
        turn: 'Gireu enrere a les parets',
      },
      wallCheck: {
        centre: 'Centre de la fitxa',
        width: 'Fitxa sencera',
      },
      oneWayWalls: {
        block: 'Bloc',
        pass: 'Deixa passar',
      },
      transparentWalls: {
        block: 'Bloc',
        pass: 'Deixa passar',
      },
    },
    menu: {
      statusRunning: 'Fitxes de patrulla: {patrols}. Rutes: {routes}.',
      statusPaused: 'Totes les patrulles estan aturades.',
      statusCombat: {
        pause: 'En combat: les patrulles estan en pausa.',
        step: 'En combat: les patrulles es mouen cada torn.',
      },
      routes: 'Rutes',
      noRoutes:
        'Encara no hi ha rutes. Afegiu-ne un, dibuixeu-ne un, enregistreu-ne un o afegiu-ne els exemples.',
      create: 'Nova Ruta',
      selected: 'Fitxes seleccionades',
      tools: 'Eines',
      recordings: 'Enregistraments',
      patrols: 'Patrulles',
    },
    buttons: {
      start: 'Comença',
      stop: 'Atureu-vos',
      add: 'Codi de pas',
      draw: 'Del Dibuix',
      bounce: 'Àrea de rebot',
      record: 'Registre',
      examples: 'Exemples',
      reset: 'Restableix',
      lock: 'Bloqueig',
      unlock: 'Desbloqueja',
      leader: 'Líder',
      follow: 'Seguiu',
      unfollow: 'Deixa de seguir',
      resume: 'Reprèn',
      pause: 'Posa-ho tot en pausa',
      combatOn: 'Combat activat',
      combatOff: 'Combat desactivat',
      stopAll: 'Atureu-ho tot',
      settings: 'Configuració',
      status: 'Estat',
      help: 'Ajuda',
      open: 'Obert',
      clearStart: 'Clar',
      setStart: 'Estableix com a Seleccionat',
      edit: 'Edita el codi',
      rename: 'Canvia el nom',
      copy: 'Còpia',
      export: 'Exporta',
      remove: 'Eliminar',
      menu: 'Menú',
      wait: 'Espera',
      stealth: 'Sigil',
      undo: 'Desfer',
      save: 'Desa',
      cancel: 'Cancel·la',
      confirm: 'Sí, elimina-ho',
      startRoute: 'Inici de la ruta',
      list: 'Llista de rutes',
      calibrate: 'Calibrar',
    },
    prompts: {
      name: 'Nom de la ruta',
      code: 'Codi de pas',
      interval: 'Mil·lisegons per pas (0 = predeterminat)',
      maxTokens: 'La majoria de fitxes alhora (0 = sense límit)',
      newName: 'Nou nom',
      route: 'Nom de la ruta',
    },
    route: {
      drawn: 'Ruta dibuixada, {points} punts',
      recorded: 'Ruta registrada, {points} punts',
      area: 'Àrea de rebot, {points} cantonades',
      path: 'Camí',
      mode: 'Mode',
      interval: 'Interval',
      maxTokens: 'La majoria de fitxes',
      randomStart: 'Inici aleatori',
      walls: 'Murs',
      start: 'Inici fix',
      tokens: 'Fitxes',
    },
    record: {
      title: 'Gravació "{name}"',
      intro:
        'Enregistrament {token} (es mou fins ara: {count}). Feu clic a les fletxes o arrossegueu el testimoni al mapa; cada moviment està gravat.',
    },
    settings: {
      interval: {
        label: 'Interval',
        desc: 'Mil·lisegons entre passos. Cada ruta pot anul·lar-la.',
      },
      movement: {
        label: 'Moviment',
        desc: 'la cèl·lula es mou una cel·la per pas; El segment mou un pas sencer (com ara U3) alhora, com va fer la versió 4.',
      },
      facing: {
        label: 'Torneu les fitxes',
        desc: "Gireu les fitxes cap a on van: desactivades, o la manera en què s'enfronta l'art de fitxes (amunt, avall, esquerra o dreta).",
      },
      combatDetection: {
        label: 'Detecció de combat',
        desc: 'Com es nota el combat: rastrejador (el rastrejador de torns està obert amb algú dins), manual (els botons Combat On/Off) o tots dos.',
      },
      combatBehaviour: {
        label: 'Comportament de combat',
        desc: 'Què fan les patrulles en combat: fer una pausa, fer un pas (mou una vegada cada vegada que passa el torn) o ignorar (seguir movent-se).',
      },
      lockMode: {
        label: 'Mode de bloqueig',
        desc: 'Com Lock manté un testimoni: natiu (bloqueig de posició propi de Roll20, perquè ningú el pugui arrossegar), revertir (els moviments es desfereixen) o congelar (deixa de patrullar i seguir però encara es pot arrossegar).',
      },
      lockMarker: {
        label: 'Marcador de bloqueig',
        desc: "El marcador d'estat es mostra als fitxes bloquejats o cap. Els jugadors poden veure els marcadors.",
      },
      followMode: {
        label: 'Mode de seguiment',
        desc: 'sender: els seguidors caminen en fila individual seguint els passos del líder. formació: els seguidors mantenen el seu lloc al voltant del líder (arrossegar un seguidor per canviar-ne de lloc).',
      },
      manualMove: {
        label: 'Arrossegant una patrulla',
        desc: "Quan arrossegueu una fitxa de patrulla: continueu (la ruta continua des d'on l'heu deixat) o atureu-vos (la patrulla acaba).",
      },
      stopMarkers: {
        label: "Marcadors d'aturada",
        desc: "Marcadors d'estat que treuen un indicador de la seva ruta i deixen de seguir-lo, separats per punt i coma (per exemple, mort; vermell) o cap. Els seguidors d'un líder amb un d'aquests marcadors també s'aturen.",
      },
      markerAction: {
        label: "Aturar l'acció del marcador",
        desc: "Què fa un testimoni de patrulla quan rep un marcador d'aturada: aturar-se (es queda on està) o reiniciar (torna a on va començar).",
      },
      wallMode: {
        label: 'Murs',
        desc: "Què fan les patrulles i els seguidors a les parets d'il·luminació dinàmica i a portes i finestres tancades: ignorar (passar per), aguantar (esperar fins que el camí estigui lliure, per exemple fins que s'obri una porta) o girar (les patrulles tornen enrere). Cada ruta pot triar la seva, de manera que els fantasmes encara poden travessar les parets.",
      },
      wallCheck: {
        label: 'Revisió de paret',
        desc: "centre: només la meitat d'una fitxa ha d'estar allunyada de les parets. amplada: tota la fitxa ho fa, de manera que una fitxa gran no pot passar per un buit estret.",
      },
      oneWayWalls: {
        label: 'Murs unidireccionals',
        desc: 'Si les parets unidireccionals detenen fitxes (bloquejar) o no (passar).',
      },
      transparentWalls: {
        label: 'Murs Transparents',
        desc: 'Ja siguin parets transparents, que deixen passar la llum, aturar fitxes (bloquejar) o no (passar).',
      },
      buttonStep: {
        label: 'Cel·les per clic',
        desc: "Fins a quina distància mouen les fletxes d'enregistrament una fitxa.",
      },
      language: {
        label: 'Llengua',
        desc: 'Idioma per a menús, missatges i fullets.',
      },
    },
    status: {
      routes: 'Rutes',
      patrols: 'Fitxes de patrulla',
      followers: 'Següents fitxes',
      locked: 'Fitxes bloquejades',
      recordings: 'Enregistraments',
      paused: 'En pausa',
      combat: 'Combat',
      page: 'Pàgina actual',
      grid: 'Quadrícula',
      cell: 'Mida cel·lular',
      calibration: 'Calibració',
    },
    help: {
      menu: 'Mostra el menú.',
      start: 'Col·loqueu les fitxes seleccionades en una ruta.',
      stop: "Atura les fitxes seleccionades (patrulles i seguiment), totes les fitxes d'una ruta o totes.",
      reset: 'Torneu les fitxes a on van començar i atureu-les.',
      pause: 'Posa en pausa o reprèn cada patrulla.',
      lock: 'Manteniu les fitxes seleccionades al seu lloc o allibereu-les.',
      leader: 'Trieu la fitxa seleccionada com a líder a seguir.',
      follow:
        'Feu que les fitxes seleccionades segueixin el líder, o una fitxa donada pel seu nom.',
      unfollow: 'Atura les fitxes seleccionades següents.',
      add: "Creeu una ruta a partir d'un codi de pas, com ara U2R2D2L2.",
      edit: "Canviar el codi de pas d'una ruta.",
      draw: 'Crea una ruta que segueixi el dibuix seleccionat en aquesta pàgina.',
      bounce:
        'Crea una ruta on les fitxes vagin dins del dibuix tancat seleccionat, rebotant a les vores.',
      record: 'Enregistreu una ruta movent el testimoni seleccionat amb botons o arrossegant-lo.',
      route: "Canvia l'opció d'una ruta: mode, interval, màxim, aleatori, parets o inici.",
      show: "Mostra els detalls i els botons d'una ruta.",
      rename: "Canvia el nom d'una ruta.",
      copy: 'Copia una ruta amb un nom nou.',
      remove: 'Eliminar una ruta (demana primer).',
      ids: 'Actueu sobre les fitxes amb aquestes identificacions en comptes de les seleccionades, de manera que altres mods com ara ScriptCards poden controlar fitxes. eliminar --ids treu les fitxes de les seves rutes; mai elimina una ruta.',
      list: 'Enumereu les rutes o les fitxes que es controlen.',
      examples: 'Afegiu els exemples de rutes.',
      export: 'Mostra les rutes com a text per copiar-les a un altre joc.',
      import: "Afegiu rutes des del text d'exportació.",
      combat: 'Activa o desactiva el combat a mà.',
      set: 'Canvia un paràmetre o mostra tots els paràmetres.',
      calibrate:
        'Alineeu la graella amb fitxes enganxades als centres de la cel·la o elimineu el calibratge.',
      status: 'Mostra què fa el Mod i com veu aquesta pàgina.',
      journal: "Reconstruïu els fulls d'ajuda i de comandaments.",
      help: 'Mostra aquesta llista.',
      footer:
        'Les instruccions completes es troben al fullet "{help}"; els botons es troben a "{deck}". {legacy} encara funciona amb les ordres de la versió 4.',
    },
    handout: {
      versionLabel: 'Versió',
      subtitle: 'Patrulles, seguidors i bloquejos per als jocs Jumpgate i Legacy',
      overview: {
        heading: 'Visió general',
        body: "TokenController mou fitxes per a tu. Doneu a un guàrdia una ruta de patrulla, feu que un carro segueixi el seu conductor o tanqueu una estàtua al seu lloc. Les rutes es poden escriure com a codi de pas, traçar-se a partir d'un dibuix al mapa o registrar-se movent una fitxa. Les rutes funcionen en pàgines quadrades, hexadecimals, isomètriques, dimètriques i sense quadrícula.",
      },
      quickStart: {
        heading: 'Inici ràpid',
        steps: [
          'Obriu el fullet de comandaments o escriviu !tokencontroller per al menú.',
          'Feu clic a Exemples per afegir algunes rutes ja fetes o al codi de pas per escriure el vostre propi (per exemple, U2R2D2L2).',
          "Seleccioneu una o més fitxes i feu clic a Inicia al costat d'una ruta.",
          'Seleccioneu un testimoni i feu clic a Atura per aturar-lo o a Restableix per tornar-lo a on va començar.',
        ],
      },
      routes: {
        heading: 'Realització de rutes',
        points: [
          'Codi de pas: escriviu moviments com ara U2R2D2L2. Els codis no estan lligats a un lloc del mapa, de manera que la mateixa ruta funciona a qualsevol lloc.',
          'Des del dibuix: dibuixeu una línia, polígon, forma a mà alçada, rectangle o el·lipse amb les eines de dibuix, seleccioneu-lo i feu clic a Des del dibuix. Hi passen fitxes, només en aquesta pàgina. Podeu esborrar el dibuix després.',
          'Enregistrament: seleccioneu un testimoni i feu clic a Enregistrar. Moveu-lo amb els botons de fletxa o arrossegueu-lo al mapa (se segueixen els waypoints Roll20) i feu clic a Desa. A les quadrícules quadrades, la gravació es converteix en un codi de pas que podeu editar.',
          "Les rutes de bucle comencen de nou des del principi; les rutes d'anada i tornada recorren pel camí que van arribar; un cop les rutes s'aturin al final. Noves rutes que acaben on comencen bucle; altres van i torna.",
          "Àrea de rebot: dibuixa una forma tancada al voltant de l'àrea, selecciona-la i fes clic a Àrea de rebot. Les fitxes que s'hi han començat viatgen en línia recta i reboten a les vores (i a les parets, tret que la ruta les ignori), girant una mica a l'atzar cada vegada. L'inici aleatori posa cada fitxa en una cel·la aleatòria de l'àrea.",
        ],
      },
      codes: {
        colCode: 'Codi',
        colMeaning: 'Significat',
        move: 'Mou cap amunt, avall, esquerra o dreta, una cel·la.',
        diagonal: 'Mou-te en diagonal.',
        distance: "Un nombre després d'una direcció mou tantes cel·les.",
        face: "Gireu per mirar una direcció sense moure's (necessita fitxes de gir).",
        wait: 'Espereu un pas o el nombre indicat de passos.',
        stealth:
          'Mou el testimoni entre la capa de fitxes i la capa de GM, de manera que desaparegui i torni a aparèixer.',
      },
      routeOptions: {
        heading: 'Opcions de ruta',
        colOption: 'Opció',
        colMeaning: 'Significat',
        mode: 'bucle, pingpong (anada i tornada) o una vegada.',
        interval: "Mil·lisegons per pas per a aquesta ruta, o 0 per a l'interval global.",
        max: 'La majoria de fitxes que es poden trobar a la ruta alhora, o 0 sense límit.',
        random: 'on: cada fitxa comença en un punt aleatori de la ruta.',
        walls:
          'ignorar (caminar per les parets), mantenir premut (esperar a les parets i les portes tancades), girar (tornar enrere) o predeterminar (utilitzar la configuració Murs).',
        start:
          'set: les fitxes salten a la posició de la fitxa seleccionada quan comencen. clar: comencen on estan.',
      },
      tokens: {
        heading: 'Control de fitxes',
        points: [
          'Un testimoni es troba en una ruta alhora. Començar-lo en una altra ruta substitueix la primera.',
          'Stop deixa fitxes on es troben. Restableix els torna a posar-los on estaven abans de començar, a la seva capa original.',
          'El pany manté un testimoni al seu lloc. Les fitxes bloquejades no patrullen ni segueixen fins que es desbloquegen.',
          'Seguiu: seleccioneu el líder i feu clic a Líder, després seleccioneu els seguidors i feu clic a Segueix. També pots escriure el nom del líder: !tokencontroller segueix Goblin Boss. Els seguidors segueixen fitxes que patrullen, fitxes que arrossegueu i fitxes mogudes per TokenMod.',
          'Els seguidors poden seguir a altres seguidors, fent una cadena o una columna.',
          "Si arrossegueu una fitxa de patrulla, la patrulla continua des d'on la deixeu anar, tret que Arrossegar una patrulla estigui configurada per aturar-se.",
          "Murs: amb la configuració de Murs activada, les patrulles i els seguidors no passen per parets d'il·luminació dinàmica o portes i finestres tancades; portes i finestres obertes els deixen passar. Doneu una opció de parets a una ruta (per exemple, ignorar per a un fantasma).",
          "Marcadors d'aturada: una fitxa que obté un d'aquests marcadors d'estat (per exemple, mort) deixa la seva ruta i deixa de seguir, i els seguidors d'un líder que aconsegueixen també una parada. Estableix-los amb !tokencontroller set stopMarkers dead;red. Això també funciona quan un altre mod afegeix el marcador.",
        ],
      },
      grids: {
        heading: 'Graelles',
        points: [
          'La mida de la cel·la i el tipus de quadrícula es llegeixen des de cada pàgina, de manera que diferents pàgines poden utilitzar quadrícules diferents.',
          'U i D sempre signifiquen amunt i avall de la pantalla. A les quadrícules hexadecimals, es mou sense cap veí que coincideixi fent ziga-zaga; a les quadrícules isomètriques i dimètriques, les diagonals creuen un diamant.',
          "Les pàgines amb la funció d'ajustament desactivada es mouen en passos de 70 píxels sense alinear-se a una quadrícula.",
          "Si les fitxes surten de la quadrícula, col·loqueu una fitxa al centre de la cel·la, seleccioneu-la i feu clic a Calibrar. Seleccioneu dos fitxes a les cel·les veïnes d'una fila per fixar la mida de la cel·la també.",
        ],
      },
      combat: {
        heading: 'Combat',
        points: [
          "Combat Detection tria com es nota el combat: el rastrejador de torns, els botons d'activació/desactivació de combat, o qualsevol dels dos.",
          "Comportament de combat escull què fan les patrulles: fer una pausa, moure's un pas cada vegada que passa el torn o continuar en moviment.",
          'Pausa tot atura cada patrulla en qualsevol moment; Resum els torna a començar.',
        ],
      },
      commands: {
        heading: 'Ordres',
        intro:
          'Només els GM poden utilitzar aquestes ordres. Les rutes es poden anomenar o fer referència amb el seu #id als botons del menú. Posa noms amb espais entre "cometes" quan una ordre pren dos noms.',
        mods: "Altres mods també poden enviar aquestes ordres, per exemple des de ScriptCards. No poden seleccionar fitxes, de manera que els anomenen amb --ids seguit d'ID de testimoni separats per punt i coma: !tc stop --ids ID1;ID2. Les respostes van al GM.",
        colCommand: 'Comandament',
        colDesc: 'Què fa',
      },
      settings: {
        heading: 'Configuració',
        intro:
          "Canvieu la configuració des del menú, amb !tokencontroller configurat <setting> <value>, o a la pàgina de configuració del mod a la pantalla Scripts de l'API.",
        colKey: 'clau',
        colName: 'Configuració',
        colDesc: 'Descripció',
      },
      upgrading: {
        heading: 'Actualització de la versió 4',
        points: [
          'Es conserven camins, fitxes de patrulla, panys, seguidors i esborranys inacabats. Els esborranys es converteixen en rutes que acaben en "(esborrany)".',
          'La configuració de la versió 4 es manté: interval, subpassos, rotació, patrulla de combat i unitats per clic.',
          'Les ordres !tc i !token-control i les macros T-Cntrl_ continuen funcionant. La taula mostra les noves ordres.',
          'La versió 4 va enviar tot el menú després de cada acció; la versió 5 envia una resposta breu.',
          'La configuració Píxels per unitat ha desaparegut: la mida de la cel·la prové de cada pàgina. HTML Builder ja no és necessari.',
          "L'antic fullet de la Guia d'ús, que tots els jugadors podien veure, es substitueix per aquest fullet només per a GM.",
        ],
        colV4: 'Versió 4',
        colV5: 'Versió 5',
      },
      troubleshooting: {
        heading: 'Resolució de problemes',
        points: [
          'Les fitxes no es mouen: comproveu Estat. Les patrulles esperen mentre estan en pausa, estan bloquejades i en combat quan el Comportament de Combat està en pausa.',
          "Les fitxes es mouen a una distància incorrecta: la mida de la quadrícula o l'ajustament de la pàgina pot haver canviat; prova de calibrar.",
          "Una ruta dibuixada no s'iniciarà: les rutes dibuixades només funcionen a la pàgina on s'han dibuixat.",
          'Els seguidors no es mouen quan un altre Mod mou el líder: només TokenMod informa dels seus moviments. Altres mods poden trucar a TokenController.ObserveTokenChange.',
          "Informeu de problemes al fòrum Roll20 amb qualsevol missatge de la consola de l'API.",
        ],
      },
      languages: {
        heading: 'Idiomes',
        body: "TokenController està traduït als idiomes següents. Trieu-ne un amb la configuració d'Idioma.",
        colCode: 'Codi',
        colName: 'Llengua',
        colNative: 'Nom nadiu',
      },
      credits: {
        heading: 'Crèdits',
        original: 'Mod original de',
        maintainer: 'Versió 5 mantinguda per',
        support: "Informa d'errors i idees al fòrum Roll20 Mod o a GitHub.",
      },
      footer: 'Els botons per a cada acció es troben al fullet "{deck}".',
    },
    deck: {
      subtitle: 'Comandament de la plataforma',
      patrolsDesc: 'Iniciar, aturar i aturar les patrulles. Seleccioneu primer les fitxes.',
      createDesc: "Feu rutes a partir d'un codi de pas, un dibuix o gravant un testimoni.",
      selectedDesc: 'Bloqueja fitxes o fes que segueixin un líder.',
      toolsDesc: 'Eines de combat, configuració i quadrícula.',
      footer: 'Les instruccions completes es troben al fullet "{help}".',
    },
  };

  const TRANSLATION$l = {
    titles: {
      ready: 'TokenController 已準備就緒。',
      settings: '令牌控制器設定',
      help: 'TokenController指令',
      export: '路由導出',
      routes: '路線',
      tokens: '受控代幣',
      status: '令牌控制器狀態',
    },
    messages: {
      migrated:
        '從版本 4 升級。保留的路线：{routes}。保留的巡逻令牌：{patrols}。您的舊巨集和 !tc 指令仍然有效。',
      removedGuide:
        '玩家可以看到的舊的「TokenController 使用指南」講義被僅用於 GM 的幫助講義所取代。',
      pruned: '已忘記代幣不存在的巡邏：{count}。',
      readyHint: '在選單中輸入 !tokencontroller，或開啟 Command Deck 講義。',
      combatStarted: {
        pause: '戰鬥已經開始：巡邏暫停直至結束。',
        step: '戰鬥已經開始：巡邏隊每回合移動一步。',
      },
      combatEnded: '戰鬥結束：巡邏繼續。',
      routeAdded: '新增了路線「{name}」({mode})。',
      routeUpdated: '路線“{name}”已更新。其上的令牌继续执行新路线。',
      confirmRemove: '刪除路線“{name}”？ Tokens on it that will stop: {count}.',
      routeRemoved: '路線“{name}”已刪除。 Tokens stopped: {count}.',
      routeRenamed: '路線“{from}”重新命名為“{to}”。',
      examplesAdded: '新增的範例路線：{count}。',
      exportHint: '複製下面的文字並將其貼上到任何遊戲中的 {command} 後面。',
      imported: '導入{added}路線；跳過 {skipped} （名稱已使用或無效）。',
      started: '{tokens} 從「{name}」開始。',
      stopped: '令牌已停止：{count}。',
      reset: '已返回起點的代幣：{count}。',
      locked: '鎖定：{tokens} ({mode})。',
      unlocked: '已解鎖：{tokens}。',
      leaderSet: '{token} 是領導者。選擇追蹤者並點擊“關注”。',
      following: '現在遵循 {leader} ({mode})：{tokens}。',
      unfollowed: '令牌不再遵循：{count}。',
      noRecordings: '沒有記錄任何內容。',
      recordingCancelled: '錄製“{name}”已取消。',
      languages: '支援的語言：{list}',
      settingChanged: '{setting} 現在是 {value}。',
      combatOn: '戰鬥開啟。',
      combatOff: '戰鬥關閉。',
      calibrationCleared: '網格校準已從此頁面刪除。',
      calibrated: '為此頁面校準的網格（單元格大小 × {scale}）。',
      paused: '所有巡邏隊都暫停了。',
      resumed: '巡邏恢復了。',
      journalRebuilt: '重建講義：{help} 和 {deck}。',
      markerStopped: '由停止標記停止：{tokens}。',
      markerReset: '由停止標記發送回他們開始的位置：{tokens}。',
    },
    errors: {
      noTokens: '未選擇任何標記。',
      noRouteName: '沒有給出路線名稱。',
      routeNotFound: '沒有名為「{name}」的路線。',
      routeExists: '已經有一條名為「{name}」的路線。',
      code: {
        empty: '步驟代碼為空。',
        badToken: '步驟代碼「{code}」在「{at}」處有一些不理解的內容。',
        tooFar: '步驟「{at}」太長。',
      },
      routeInvalid: '無法保存該路線。',
      usageAdd: '給出名稱和步驟代碼。',
      usageEdit: '給出路線和新的步驟代碼。',
      selectOneDrawing: '僅選擇一幅圖形（直線、多邊形、手繪形狀、矩形或橢圓形）。',
      drawingEmpty: '所選繪圖的要點太少，無法遵循。',
      usageRoute: '給予一條路線、一個選項和一個值。',
      unknownRouteOption: '沒有名為「{option}」的路線選項。',
      selectOneToken: '僅選擇一個令牌。',
      badRouteValue: '“{value}”對於 {option} 不是有效值。',
      usageRename: '給予一條路線及其新名稱。',
      usageCopy: '指定副本的路線和名稱。',
      badJson: '這不是路由導出文字。',
      tokenLocked: '{tokens} 無法啟動：已鎖定。',
      tokenMarked: '{tokens} 無法啟動：它們有一個停止標記。',
      outsideArea: '{tokens} 無法啟動：它們位於「{name}」之外。',
      selectOneArea: '精確選擇一幅閉合圖形（多邊形、矩形、橢圓形或手繪環）。',
      areaTooSmall: '所選圖形至少需要三個角落才能形成一個區域。',
      idsNotFound: '沒有令牌具有以下 ID：{ids}。',
      routeOnOtherPage: '{tokens} 無法啟動：「{name}」繪製在另一頁。',
      startOnOtherPage: '{tokens} 無法啟動：「{name}」的固定開頭位於另一頁。',
      routeFull: '{tokens} 無法啟動：「{name}」已具有 {max} 令牌。',
      noPage: '找不到該頁面。',
      emptyTrack: '{tokens} 無法啟動：「{name}」沒有移動。',
      leaderNotFound: '此頁面上未找到名為「{name}」的令牌。',
      noLeader: '目前還沒有領導者。',
      followLoop: '{tokens} 不能跟在其後的標記之後。',
      alreadyRecording: '{token} 已被記錄。',
      recordingTokenGone: '用於記錄「{name}」的令牌不再存在。',
      recordingEmpty: '尚未記錄任何內容。',
      unknownSetting: '沒有名為「{key}」的設定。',
      badSettingValue: '“{value}”對於 {key} 不是有效值。',
      calibrateNeedsTokens: '選擇一個或兩個捕捉到單元中心的標記。',
      calibrateFailed: '所選令牌無法用於校準網格。',
      unknownCommand: '未知指令“{command}”。',
      gmOnly: '只有GM可以使用TokenController。',
      internal: '出了點問題。詳細資訊請參閱 API 控制台。',
    },
    hints: {
      noTokens: '首先選擇地圖上的標記。',
      noRouteName: '例如： !tokencontroller 新增 Guard Walk U2R2D2L2',
      routeNotFound: '輸入 !tokencontroller list 以查看所有路由。',
      code: {
        empty: '例如：U2R2D2L2',
        badToken: '使用 U、D、L、R、UL、UR、DL 或 DR 與多個單元，W 等待，S 隱身。',
        tooFar: '單步最多可以有100個cell；最多等待 100 個時脈週期。',
      },
      selectOneDrawing:
        '使用繪圖工具繪製路線，選擇它（如果單擊錯過了，則在細輪廓周圍拖曳一個框），然後重試。',
      usageRoute: '選項：模式、間隔、最大、隨機、牆壁、開始。',
      routeOnOtherPage: '繪製的路線僅在繪製它們的頁面上有效。',
      startOnOtherPage: '清除固定開始，或先將令牌移到該頁面。',
      noLeader: '選擇領導者並點擊領導者，或給出其名稱： !tokencontroller follow Name',
      leaderNotFound: '使用與地圖上所示完全相同的令牌名稱或其令牌 ID。',
      badJson: '準確貼上 !tokencontroller 匯出（或 v4 匯出路徑）中的文字。',
      unknownSetting: '輸入 !tokencontroller set 以查看所有設定。',
      calibrateNeedsTokens:
        '一個令牌排列在網格上；一行相鄰單元格中的兩個標記也可以固定單元格大小。',
      calibrateFailed: '確保標記位於同一行（十六進位 (H) 頁上的列）的相鄰儲存格中。',
      unknownCommand: '鍵入 !tokencontroller help 以取得命令清單。',
      tokenLocked: '先解鎖令牌。',
      tokenMarked: '刪除標記，或變更停止標記設定。',
      outsideArea: '首先將標記移動到區域內，或開啟路線的「隨機開始」。',
      selectOneArea:
        '使用繪圖工具繪製該區域，選擇它（如果單擊錯過了，則在細輪廓周圍拖曳一個框），然後重試。',
      idsNotFound: '在 --ids 之後給予令牌 ID，以分號分隔。',
    },
    warnings: {
      idsNotFound: '沒有令牌具有這些 ID，因此它們被跳過：{ids}。',
      offPage: '部分路線超出頁面（步驟：{count}）。這些步驟將會被跳過。',
      combatTrackerOnly: '戰鬥偵測設定為回合追蹤器，因此在您更改它之前此開關無效。',
      unitPx:
        '版本 5 從每個頁面讀取儲存格大小，因此不再使用舊的「每單位像素」設定。如果令牌未對齊，請使用 !tokencontroller 校準。',
    },
    values: {
      on: '在',
      off: '離開',
      none: '沒有任何',
      default: '預設',
      noLimit: '無限制',
      ms: '{ms} 毫秒',
      andMore: '和 {count} 更多',
      following: '以下 {leader}',
      locked: '鎖定',
      gridless: '沒有折斷',
      grid: {
        square: '方塊',
        hex: '十六進位',
        iso: '等軸測/二軸測',
      },
      mode: {
        loop: '環形',
        pingpong: '來回',
        once: '一次',
      },
      movement: {
        cell: '一次一個細胞',
        segment: '一次完成整個步驟',
      },
      facing: {
        off: '請勿轉動',
        up: '藝術面朝上',
        down: '藝術面朝下',
        left: '留下藝術面孔',
        right: '藝術面朝右',
      },
      combatDetection: {
        tracker: '轉彎追蹤器',
        manual: '一般開關',
        both: '轉彎追蹤器或 GM 開關',
      },
      combatBehaviour: {
        pause: '暫停',
        step: '每轉一圈移動',
        ignore: '繼續前進',
      },
      lockMode: {
        native: 'Roll20的位置鎖',
        revert: '撤銷動作',
        freeze: '僅保持不動',
      },
      followMode: {
        trail: '單一檔案',
        formation: '編隊',
      },
      manualMove: {
        continue: '從那裡繼續',
        stop: '停止巡邏',
      },
      markerAction: {
        stop: '停在原處',
        reset: '回到起點',
      },
      wallMode: {
        ignore: '穿牆而行',
        hold: '靠牆等候',
        turn: '靠牆回頭',
      },
      wallCheck: {
        centre: '令牌的中心',
        width: '整個代幣',
      },
      oneWayWalls: {
        block: '堵塞',
        pass: '讓透過',
      },
      transparentWalls: {
        block: '堵塞',
        pass: '讓透過',
      },
    },
    menu: {
      statusRunning: '巡邏令牌：{patrols}。路線：{routes}。',
      statusPaused: '所有巡邏都暫停了。',
      statusCombat: {
        pause: '戰鬥中：巡邏暫停。',
        step: '在戰鬥中：巡邏隊每回合移動一次。',
      },
      routes: '路線',
      noRoutes: '還沒有路線。新增一、畫一、記錄一或新增範例。',
      create: '新航線',
      selected: '選定的代幣',
      tools: '工具',
      recordings: '錄音',
      patrols: '巡邏',
    },
    buttons: {
      start: '開始',
      stop: '停止',
      add: '步驟程式碼',
      draw: '從繪圖',
      bounce: '彈跳區',
      record: '記錄',
      examples: '範例',
      reset: '重置',
      lock: '鎖',
      unlock: '開鎖',
      leader: '領導者',
      follow: '跟隨',
      unfollow: '取消追蹤',
      resume: '恢復',
      pause: '全部暫停',
      combatOn: '戰鬥繼續',
      combatOff: '戰鬥關閉',
      stopAll: '全部停止',
      settings: '設定',
      status: '地位',
      help: '幫助',
      open: '打開',
      clearStart: '清除',
      setStart: '設定為選定',
      edit: '編輯程式碼',
      rename: '重新命名',
      copy: '複製',
      export: '出口',
      remove: '消除',
      menu: '選單',
      wait: '等待',
      stealth: '隱身',
      undo: '撤銷',
      save: '節省',
      cancel: '取消',
      confirm: '是的，刪除它',
      startRoute: '起始路線',
      list: '列出路線',
      calibrate: '校準',
    },
    prompts: {
      name: '路線名稱',
      code: '步驟程式碼',
      interval: '每步毫秒數（0 = 預設值）',
      maxTokens: '一次最多令牌（0 = 無限制）',
      newName: '新名稱',
      route: '路線名稱',
    },
    route: {
      drawn: '繪製路線，{points} 點',
      recorded: '已記錄路線，{points} 點',
      area: '彈跳區域，{points} 角',
      path: '小路',
      mode: '模式',
      interval: '間隔',
      maxTokens: '大多數代幣',
      randomStart: '隨機開始',
      walls: '牆壁',
      start: '固定啟動',
      tokens: '代幣',
    },
    record: {
      title: '正在錄製“{name}”',
      intro:
        '正在錄製 {token}（移動至今：{count}）。點擊箭頭，或拖曳地圖上的標記；每一個動作都被記錄下來。',
    },
    settings: {
      interval: {
        label: '間隔',
        desc: '步驟之間的毫秒數。每條路線都可以覆蓋它。',
      },
      movement: {
        label: '移動',
        desc: '細胞每步移動一個細胞；段一次移動一整步（例如 U3），就像版本 4 所做的那樣。',
      },
      facing: {
        label: '回合令牌',
        desc: '將令牌轉向其要去的方向：關閉，或令牌藝術面朝的方式（上、下、左或右）。',
      },
      combatDetection: {
        label: '戰鬥偵測',
        desc: '如何注意到戰鬥：追蹤器（回合追蹤器打開時有人在其中）、手動（戰鬥開/關按鈕）或兩者兼而有之。',
      },
      combatBehaviour: {
        label: '戰鬥行為',
        desc: '巡邏隊在戰鬥中做什麼：暫停、邁步（每次轉彎時移動一次）或忽略（繼續移動）。',
      },
      lockMode: {
        label: '鎖定模式',
        desc: 'Lock 如何持有令牌：原生（Roll20 自己的位置鎖定，因此沒人可以拖曳它）、恢復（移動被撤消）或凍結（它停止巡邏和跟隨，但仍然可以拖曳）。',
      },
      lockMarker: {
        label: '鎖定標記',
        desc: '狀態標記顯示在鎖定的令牌上，或不顯示。玩家可以看到標記。',
      },
      followMode: {
        label: '跟隨模式',
        desc: '蹤跡：追隨者沿著領導者的足跡排成一列。編隊：追隨者保持在領導者周圍的位置（拖曳追隨者以改變其位置）。',
      },
      manualMove: {
        label: '拖曳巡邏隊',
        desc: '當您拖曳巡邏標記時：繼續（路線從您放置它的位置繼續）或停止（巡邏結束）。',
      },
      stopMarkers: {
        label: '停止標記',
        desc: '狀態標記，將令牌從其路線上取下並停止其跟隨，用分號分隔（例如死亡；紅色），或無。具有這些標記之一的領導者的追隨者也會停下來。',
      },
      markerAction: {
        label: '停止標記動作',
        desc: '當巡邏令牌獲得停止標記時，它會做什麼：停止（它停留在原來的位置）或重置（它回到開始的位置）。',
      },
      wallMode: {
        label: '牆壁',
        desc: '巡邏隊和追隨者在動態照明牆和關閉的門窗處做什麼：忽略（走過）、等待（等到道路暢通，例如直到門打開）或轉身（巡邏隊返回）。每條路線都可以選擇自己的路線，所以鬼魂仍然可以穿牆而過。',
      },
      wallCheck: {
        label: '牆壁檢查',
        desc: '中心：只有令牌的中間必須遠離牆壁。寬度：整個令牌都是如此，因此大令牌無法擠過狹窄的間隙。',
      },
      oneWayWalls: {
        label: '單向牆',
        desc: '單向牆是否阻止代幣（阻止）或不阻止（通過）。',
      },
      transparentWalls: {
        label: '透明牆',
        desc: '讓光線通過的透明牆是否會阻止令牌（阻擋）或不阻止（通過）。',
      },
      buttonStep: {
        label: '每次點擊的單元數',
        desc: '記錄箭頭將令牌移動多遠。',
      },
      language: {
        label: '語言',
        desc: '選單、訊息和講義的語言。',
      },
    },
    status: {
      routes: '路線',
      patrols: '巡邏令牌',
      followers: '關注代幣',
      locked: '鎖定代幣',
      recordings: '錄音',
      paused: '已暫停',
      combat: '戰鬥',
      page: '目前頁面',
      grid: '網格',
      cell: '細胞尺寸',
      calibration: '校準',
    },
    help: {
      menu: '顯示選單。',
      start: '將選定的標記放置在路線上。',
      stop: '停止選定的標記（巡邏和跟隨）、路線上的每個標記或全部。',
      reset: '將令牌返回到它們開始的地方並停止它們。',
      pause: '暫停或恢復每次巡邏。',
      lock: '將選取的代幣固定在原地，或解除固定。',
      leader: '選擇選定的令牌作為要跟隨的領導者。',
      follow: '使選定的令牌跟隨領導者或按名稱指定的令牌。',
      unfollow: '停止以下選定的令牌。',
      add: '從步驟代碼建立路線，例如 U2R2D2L2。',
      edit: '更改路線的步驟代碼。',
      draw: '建立遵循此頁面上所選圖形的路線。',
      bounce: '建立一條路線，讓標記在選定的封閉圖形內徘徊，並從其邊緣反彈。',
      record: '透過使用按鈕移動選定的標記或拖曳它來記錄路線。',
      route: '變更路線選項：模式、間隔、最大、隨機、牆壁或起點。',
      show: '顯示路線的詳細資訊和按鈕。',
      rename: '重命名路線。',
      copy: '以新名稱複製路線。',
      remove: '刪除一條路線（首先詢問）。',
      ids: '對具有這些 ID（而不是選定的 ID）的令牌進行操作，因此其他 Mod（例如 ScriptCard）可以控制令牌。 remove --ids 將令牌從其路線上移除；它永遠不會刪除路線。',
      list: '列出路由或受控制的令牌。',
      examples: '新增範例路線。',
      export: '將路線顯示為文字以複製到另一個遊戲中。',
      import: '從導出文字新增路由。',
      combat: '手動開啟或關閉戰鬥。',
      set: '更改設定或顯示所有設定。',
      calibrate: '將網格與對齊單元中心的標記對齊，或刪除校準。',
      status: '顯示 Mod 正在做什麼以及它如何看待此頁面。',
      journal: '重建幫助和命令平台講義。',
      help: '顯示此清單。',
      footer: '完整說明位於「{help}」講義中；按鈕位於「{deck}」。 {legacy} 仍然適用於版本 4 指令。',
    },
    handout: {
      versionLabel: '版本',
      subtitle: 'Jumpgate 和 Legacy 遊戲的巡邏、追隨者和鎖',
      overview: {
        heading: '概述',
        body: 'TokenController 為您移動令牌。給守衛一條巡邏路線，讓一輛推車跟著它的司機，或將一座雕像鎖定在適當的位置。路線可以作為步驟代碼輸入、從地圖上的繪圖追蹤或透過移動標記來記錄。路線適用於方形、六角形、等軸測、二軸測和無網格頁面。',
      },
      quickStart: {
        heading: '快速入門',
        steps: [
          '打開 Command Deck 講義，或輸入 !tokencontroller 進入選單。',
          '點選「範例」新增一些現成的路線，或點選「步驟代碼」鍵入您自己的路線（例如 U2R2D2L2）。',
          '選擇一個或多個令牌，然後按一下路線旁邊的「開始」。',
          '選擇一個令牌並點擊“停止”將其停止，或點擊“重置”將其發送回開始的位置。',
        ],
      },
      routes: {
        heading: '制定路線',
        points: [
          '步驟代碼：鍵入動作，例如U2R2D2L2。程式碼不與地圖上的位置綁定，因此相同的路線在任何地方都適用。',
          '從繪圖：使用繪圖工具繪製直線、多邊形、手繪形狀、矩形或橢圓形，選擇它並按一下從繪圖。令牌僅在該頁面上沿著它行走。之後您可以刪除該繪圖。',
          '錄製：選擇一個token，點選錄製。使用箭頭按鈕移動它或將其拖曳到地圖上（跟隨 Roll20 航點），然後按一下「儲存」。在方形網格上，錄音變成可以編輯的步驟代碼。',
          '循環路線從頭開始；來迴路線 沿著來時的路走回去；一旦路線停在終點。新路線從起點開始循環；其他人則來回走動。',
          '彈跳區域：圍繞該區域繪製一個閉合形狀，選擇它並點擊彈跳區域。令牌開始沿直線行進，並從其邊緣（以及牆壁，除非路線忽略它們）反彈，每次都會隨機轉動一點。隨機開始將每個令牌放入該區域的隨機儲存格中。',
        ],
      },
      codes: {
        colCode: '程式碼',
        colMeaning: '意義',
        move: '向上、向下、向左或向右移動一個儲存格。',
        diagonal: '沿對角線移動。',
        distance: '方向後面的數字會移動對應數量的儲存格。',
        face: '轉身面向一個方向而不移動（需要轉彎令牌）。',
        wait: '等待一步，或指定的步數。',
        stealth: '在代幣層和GM層之間移動代幣，使其消失並重新出現。',
      },
      routeOptions: {
        heading: '路線選項',
        colOption: '選項',
        colMeaning: '意義',
        mode: '循環、乒乓球（來回）或一次。',
        interval: '此路線每步的毫秒數，或全域間隔的 0 毫秒。',
        max: '一次可以在路線上的代幣數量最多，或 0 表示沒有限制。',
        random: 'on：每個標記從沿路線的隨機點開始。',
        walls:
          '忽略（穿過牆壁）、保持（在牆壁和關閉的門處等待）、轉身（返回）或預設（使用牆壁設定）。',
        start: 'set：標記在開始時跳到所選標記的位置。明確：他們從他們所處的位置開始。',
      },
      tokens: {
        heading: '控制代幣',
        points: [
          '令牌一次位於一條路線上。在另一條路線上啟動它會取代第一條路線。',
          'Stop 將令牌留在原處。重置會將它們放回開始之前的位置，即原始圖層上。',
          '鎖將令牌固定到位。鎖定的令牌在解鎖之前不會巡邏或跟隨。',
          '关注：选择领导者并单击领导者，然后选择关注者并单击关注。您也可以輸入領導者的名字：!tokencontroller follow Goblin Boss。追隨者跟隨巡邏的令牌、您拖曳的令牌以及 TokenMod 移動的令牌。',
          '追隨者可以追隨其他追隨者，形成一條鍊或一列。',
          '拖曳巡邏標記會從放置它的位置開始巡邏，除非拖曳巡邏設定為停止。',
          '牆壁：啟用牆壁後，巡邏人員和追隨者不會穿過動態照明牆或關閉的門窗；打開門窗讓他們通過。為路線提供自己的牆壁選項（例如忽略幽靈）。',
          '停止標記：獲得這些狀態標記之一（例如死亡）的令牌離開其路線並停止跟隨，領導者的追隨者也獲得一站。使用 !tokencontroller set stopMarkers dead;red 設定它們。當另一個 Mod 添加標記時，這也適用。',
        ],
      },
      grids: {
        heading: '網格',
        points: [
          '單元格大小和網格類型是從每個頁面讀取的，因此不同的頁面可以使用不同的網格。',
          'U 和 D 總是表示螢幕上和下。在六角形網格上，移動時沒有匹配的相鄰鋸齒形；在等軸測和二軸測網格上，對角線穿過一顆菱形。',
          '關閉貼齊的頁面以 70 像素為一步移動，不對齊網格。',
          '如果令牌偏離網格，請將令牌捕捉到單元格中心，選擇它並按一下「校準」。選取一行的相鄰儲存格中的兩個標記也可以固定儲存格大小。',
        ],
      },
      combat: {
        heading: '戰鬥',
        points: [
          '戰鬥偵測選擇如何注意到戰鬥：回合追蹤器、戰鬥開/關按鈕或其中之一。',
          '戰鬥行為選擇巡邏隊的行為：暫停、每次轉彎時移動一步或繼續移動。',
          'Pause All 隨時停止每次巡邏；恢復再次啟動它們。',
        ],
      },
      commands: {
        heading: '命令',
        intro:
          '只有 GM 可以使用這些指令。可以命名路線，或透過選單按鈕中的 #id 來引用路線。當指令採用兩個名稱時，請將帶空格的名稱放在「引號」中。',
        mods: '其他 Mod 也可以發送這些命令，例如從 ScriptCard。他們無法選擇令牌，因此使用 --ids 命名，後面跟著以分號分隔的令牌 ID：!tc stop --ids ID1;ID2。回覆將發送至 GM。',
        colCommand: '命令',
        colDesc: '它的作用',
      },
      settings: {
        heading: '設定',
        intro:
          '從選單中使用 !tokencontroller set <setting> <value> 或在 API 腳本畫面的 Mod 設定頁面上變更設定。',
        colKey: '鑰匙',
        colName: '環境',
        colDesc: '描述',
      },
      upgrading: {
        heading: '從版本 4 升級',
        points: [
          '路徑、巡邏令牌、鎖、追隨者和未完成的草稿都被保留。草稿成為以「(draft)」結尾的路線。',
          '您的版本 4 設定將被保留：間隔、子步驟、旋轉、戰鬥巡邏和每次點擊單位。',
          '!tc 和 !token-control 指令以及 T-Cntrl_ 巨集繼續運作。該表顯示了新命令。',
          '版本 4 在每次操作後發送整個選單；版本 5 改為發送簡短回覆。',
          '每單位像素設定已消失：單元格大小來自每個頁面。不再需要 HTML 產生器。',
          '每個玩家都可以看到的舊使用指南講義已被僅用於 GM 的講義所取代。',
        ],
        colV4: '版本4',
        colV5: '版本5',
      },
      troubleshooting: {
        heading: '故障排除',
        points: [
          '令牌不移動：檢查狀態。巡邏在暫停時、鎖定時以及戰鬥行為暫停時在戰鬥中等待。',
          '代幣移動距離錯誤：頁面的網格大小或貼齊設定可能已變更；請試試「校準」。',
          '繪製的路線不會啟動：繪製的路線僅在繪製它們的頁面上運作。',
          '當另一個 Mod 移動領導者時，追隨者不會移動：只有 TokenMod 報告其移動。其他 Mod 可以呼叫 TokenController.ObserveTokenChange。',
          '使用 API 控制台中的任何訊息在 Roll20 論壇上報告問題。',
        ],
      },
      languages: {
        heading: '語言',
        body: 'TokenController 被翻譯成以下語言。透過語言設定選擇一種。',
        colCode: '程式碼',
        colName: '語言',
        colNative: '原生名',
      },
      credits: {
        heading: '製作人員',
        original: '原始模組由',
        maintainer: '版本 5 維護者',
        support: '在 Roll20 Mod 論壇或 GitHub 上報告錯誤和想法。',
      },
      footer: '每個操作的按鈕都在「{deck}」講義中。',
    },
    deck: {
      subtitle: '指揮台',
      patrolsDesc: '開始、停止和暫停巡邏。首先選擇代幣。',
      createDesc: '從步驟代碼、繪圖或透過記錄令牌來建立路線。',
      selectedDesc: '鎖定令牌，或讓它們跟隨領導者。',
      toolsDesc: '戰鬥、設定和網格工具。',
      footer: '完整說明位於「{help}」講義。',
    },
  };

  const TRANSLATION$k = {
    titles: {
      ready: 'TokenController je připraven.',
      settings: 'Nastavení TokenController',
      help: 'Příkazy TokenController',
      export: 'Export trasy',
      routes: 'Trasy',
      tokens: 'Kontrolované tokeny',
      status: 'Stav TokenController',
    },
    messages: {
      migrated:
        'Upgradováno z verze 4. Zachované trasy: {routes}. Uchované hlídací tokeny: {patrols}. Vaše stará makra a příkazy !tc stále fungují.',
      removedGuide:
        'Starý leták „TokenController Usage Guide“, který mohli hráči vidět, byl nahrazen letákem Help pouze pro GM.',
      pruned: 'Hlídky zapomenuty, protože jejich žetony již neexistují: {count}.',
      readyHint: 'Zadejte !tokencontroller pro nabídku nebo otevřete leták Command Deck.',
      combatStarted: {
        pause: 'Boj začal: hlídky jsou pozastaveny, dokud neskončí.',
        step: 'Boj začal: hlídky se v každém kole posunou o jeden krok.',
      },
      combatEnded: 'Boj je u konce: hlídky pokračují.',
      routeAdded: 'Byla přidána trasa „{name}“ ({mode}).',
      routeUpdated: 'Trasa „{name}“ byla aktualizována. Žetony na něm pokračují v nové trase.',
      confirmRemove: 'Odebrat trasu „{name}“? Tokeny na něm, které se zastaví: {count}.',
      routeRemoved: 'Trasa „{name}“ byla odstraněna. Tokeny zastaveny: {count}.',
      routeRenamed: 'Trasa „{from}“ byla přejmenována na „{to}“.',
      examplesAdded: 'Příklad přidaných tras: {count}.',
      exportHint: 'Zkopírujte níže uvedený text a vložte jej za {command} v jakékoli hře.',
      imported:
        'Importované trasy {added}; přeskočeno {skipped} (název se již používá nebo není platný).',
      started: '{tokens} začalo dne „{name}“.',
      stopped: 'Tokeny zastaveny: {count}.',
      reset: 'Tokeny se vrátily tam, kde začaly: {count}.',
      locked: 'Uzamčeno: {tokens} ({mode}).',
      unlocked: 'Odemčeno: {tokens}.',
      leaderSet: '{token} je lídrem. Vyberte sledující a klikněte na Sledovat.',
      following: 'Nyní sledujete {leader} ({mode}): {tokens}.',
      unfollowed: 'Tokeny již nenásledují: {count}.',
      noRecordings: 'Nic se nezaznamenává.',
      recordingCancelled: 'Nahrávání „{name}“ bylo zrušeno.',
      languages: 'Podporované jazyky: {list}',
      settingChanged: '{setting} je nyní {value}.',
      combatOn: 'Boj zapnutý.',
      combatOff: 'Boj vypnutý.',
      calibrationCleared: 'Z této stránky byla odstraněna kalibrace mřížky.',
      calibrated: 'Mřížka kalibrovaná pro tuto stránku (velikost buňky × {scale}).',
      paused: 'Všechny hlídky se zastavily.',
      resumed: 'Hlídky byly obnoveny.',
      journalRebuilt: 'Přepracované podklady: {help} a {deck}.',
      markerStopped: 'Zastaveno značkou zastávky: {tokens}.',
      markerReset: 'Posláno zpět tam, kde začali, značkou zastávky: {tokens}.',
    },
    errors: {
      noTokens: 'Nejsou vybrány žádné tokeny.',
      noRouteName: 'Není uveden název trasy.',
      routeNotFound: 'Neexistuje žádná trasa s názvem „{name}“.',
      routeExists: 'Trasa s názvem „{name}“ již existuje.',
      code: {
        empty: 'Kód kroku je prázdný.',
        badToken: 'Kód kroku „{code}“ obsahuje něco, čemu v „{at}“ nerozumí.',
        tooFar: 'Krok „{at}“ je příliš dlouhý.',
      },
      routeInvalid: 'Tuto trasu nebylo možné uložit.',
      usageAdd: 'Zadejte jméno a kód kroku.',
      usageEdit: 'Zadejte cestu a nový kód kroku.',
      selectOneDrawing:
        'Vyberte přesně jeden výkres (čáru, mnohoúhelník, tvar od ruky, obdélník nebo elipsu).',
      drawingEmpty: 'Vybraný výkres má příliš málo bodů, které nelze následovat.',
      usageRoute: 'Uveďte trasu, možnost a hodnotu.',
      unknownRouteOption: 'Neexistuje žádná možnost trasy s názvem „{option}“.',
      selectOneToken: 'Vyberte přesně jeden token.',
      badRouteValue: '„{value}“ není platná hodnota pro {option}.',
      usageRename: 'Uveďte trasu a její nový název.',
      usageCopy: 'Uveďte trasu a název kopie.',
      badJson: 'Toto není text exportu trasy.',
      tokenLocked: '{tokens} nelze spustit: uzamčeno.',
      tokenMarked: '{tokens} nelze spustit: mají značku zastavení.',
      outsideArea: '{tokens} nelze spustit: jsou mimo „{name}“.',
      selectOneArea:
        'Vyberte přesně jeden uzavřený výkres (mnohoúhelník, obdélník, elipsa nebo smyčka od ruky).',
      areaTooSmall: 'Vybraný výkres potřebuje k vytvoření oblasti alespoň tři rohy.',
      idsNotFound: 'Žádné tokeny nemají tato ID: {ids}.',
      routeOnOtherPage: '{tokens} nelze spustit: „{name}“ bylo nakresleno na jiné stránce.',
      startOnOtherPage: '{tokens} nelze spustit: pevný začátek „{name}“ je na jiné stránce.',
      routeFull: '{tokens} nelze spustit: „{name}“ již má {max} tokenů.',
      noPage: 'Stránku se nepodařilo najít.',
      emptyTrack: '{tokens} nelze spustit: „{name}“ nemá žádné pohyby.',
      leaderNotFound: 'Na této stránce nebyl nalezen žádný token s názvem „{name}“.',
      noLeader: 'Zatím není žádný vůdce.',
      followLoop: '{tokens} nemůže následovat token, který je následuje.',
      alreadyRecording: '{token} se již nahrává.',
      recordingTokenGone: 'Token pro záznam „{name}“ již neexistuje.',
      recordingEmpty: 'Zatím nebylo nic zaznamenáno.',
      unknownSetting: 'Neexistuje žádné nastavení s názvem „{key}“.',
      badSettingValue: '„{value}“ není platná hodnota pro {key}.',
      calibrateNeedsTokens: 'Vyberte jeden nebo dva žetony přichycené do středů buněk.',
      calibrateFailed: 'Vybrané tokeny nebylo možné použít ke kalibraci mřížky.',
      unknownCommand: 'Neznámý příkaz "{command}".',
      gmOnly: 'TokenController může používat pouze GM.',
      internal: 'Něco se pokazilo. Podrobnosti jsou v konzole API.',
    },
    hints: {
      noTokens: 'Nejprve vyberte žetony na mapě.',
      noRouteName: 'Například: !tokencontroller přidejte Guard Walk U2R2D2L2',
      routeNotFound: 'Chcete-li zobrazit všechny trasy, zadejte !tokencontroller list.',
      code: {
        empty: 'Například: U2R2D2L2',
        badToken:
          'Použijte U, D, L, R, UL, UR, DL nebo DR s určitým počtem buněk, W pro čekání a S pro stealth.',
        tooFar: 'Jeden krok může mít maximálně 100 buněk; čeká maximálně 100 tiků.',
      },
      selectOneDrawing:
        'Nakreslete trasu pomocí kreslicího nástroje, vyberte ji (přetáhněte rámeček kolem tenkého obrysu, pokud jej kliknutím minete), a zkuste to znovu.',
      usageRoute: 'Možnosti: režim, interval, max, náhodný, stěny, start.',
      routeOnOtherPage: 'Nakreslené trasy fungují pouze na stránce, na které byly nakresleny.',
      startOnOtherPage: 'Vymažte pevný začátek nebo nejprve přesuňte token na tuto stránku.',
      noLeader:
        'Vyberte vůdce a klikněte na Vůdce nebo zadejte jeho název: !tokencontroller follow Name',
      leaderNotFound:
        'Použijte název tokenu přesně tak, jak je zobrazen na mapě, nebo jeho ID tokenu.',
      badJson: 'Vložte text z exportu !tokencontroller (nebo v4 exportpaths) přesně.',
      unknownSetting: 'Chcete-li zobrazit všechna nastavení, zadejte !tokencontroller set.',
      calibrateNeedsTokens:
        'Jeden žeton zarovná mřížku; dva tokeny v sousedních buňkách v řadě také fixují velikost buňky.',
      calibrateFailed:
        'Ujistěte se, že žetony jsou v sousedních buňkách stejného řádku (sloupec na Hex (H) stránkách).',
      unknownCommand: 'Pro seznam příkazů napište !tokencontroller help.',
      tokenLocked: 'Nejprve odemkněte token.',
      tokenMarked: 'Odstraňte značku nebo změňte nastavení Stop Markers.',
      outsideArea: 'Nejprve přesuňte žetony uvnitř oblasti nebo zapněte pro trasu Náhodný start.',
      selectOneArea:
        'Nakreslete oblast pomocí kreslicího nástroje, vyberte ji (přetáhněte rámeček kolem tenkého obrysu, pokud jej kliknutím minete), a zkuste to znovu.',
      idsNotFound: 'ID tokenů uveďte za --ids oddělené středníky.',
    },
    warnings: {
      idsNotFound: 'Žádné tokeny nemají tato ID, takže byly přeskočeny: {ids}.',
      offPage: 'Část trasy vede mimo stránku (kroky: {count}). Tyto kroky jsou přeskočeny.',
      combatTrackerOnly:
        'Detekce boje je nastavena na sledování zatáček, takže tento přepínač nemá žádný účinek, dokud jej nezměníte.',
      unitPx:
        'Verze 5 čte velikost buňky z každé stránky, takže staré nastavení pixelů na jednotku se již nepoužívá. Pokud se tokeny neshodují, použijte kalibraci !tokencontroller.',
    },
    values: {
      on: 'Na',
      off: 'Vypnuto',
      none: 'Žádný',
      default: 'Výchozí',
      noLimit: 'Bez omezení',
      ms: '{ms} ms',
      andMore: 'a {count} další',
      following: 'sledující {leader}',
      locked: 'uzamčeno',
      gridless: 'žádné praskání',
      grid: {
        square: 'Náměstí',
        hex: 'Šestiúhelník',
        iso: 'Izometrické / Dimetrické',
      },
      mode: {
        loop: 'Smyčka',
        pingpong: 'Sem a tam',
        once: 'Jednou',
      },
      movement: {
        cell: 'Jedna buňka po druhé',
        segment: 'Celý krok najednou',
      },
      facing: {
        off: 'Neotáčet se',
        up: 'Umění tváří vzhůru',
        down: 'Umění tváří dolů',
        left: 'Umělecké tváře vlevo',
        right: 'Umění má pravdu',
      },
      combatDetection: {
        tracker: 'Pořadí tahů',
        manual: 'GM spínač',
        both: 'Otočte sledovač nebo spínač GM',
      },
      combatBehaviour: {
        pause: 'Pauza',
        step: 'Posuňte každé otočení',
        ignore: 'Pokračujte v pohybu',
      },
      lockMode: {
        native: 'Zámek polohy Roll20',
        revert: 'Vracet pohyby',
        freeze: 'Jen se držte',
      },
      followMode: {
        trail: 'Jediný soubor',
        formation: 'Formace',
      },
      manualMove: {
        continue: 'Pokračujte odtud',
        stop: 'Zastavte hlídku',
      },
      markerAction: {
        stop: 'Zastavte se, kde to je',
        reset: 'Vraťte se na začátek',
      },
      wallMode: {
        ignore: 'Procházet zdmi',
        hold: 'Čekej u zdí',
        turn: 'Otočte se zpět ke stěnám',
      },
      wallCheck: {
        centre: 'Střed tokenu',
        width: 'Celý token',
      },
      oneWayWalls: {
        block: 'Blok',
        pass: 'Nechat projít',
      },
      transparentWalls: {
        block: 'Blok',
        pass: 'Nechat projít',
      },
    },
    menu: {
      statusRunning: 'Hlídací tokeny: {patrols}. Trasy: {routes}.',
      statusPaused: 'Všechny hlídky jsou pozastaveny.',
      statusCombat: {
        pause: 'V boji: hlídky jsou pozastaveny.',
        step: 'V boji: hlídky se pohybují každé kolo.',
      },
      routes: 'Trasy',
      noRoutes:
        'Zatím žádné trasy. Přidejte jeden, nakreslete jeden, zaznamenejte jeden nebo přidejte příklady.',
      create: 'Nová trasa',
      selected: 'Vybrané tokeny',
      tools: 'Nástroje',
      recordings: 'Nahrávky',
      patrols: 'Hlídky',
    },
    buttons: {
      start: 'Spustit',
      stop: 'Zastávka',
      add: 'Krokový kód',
      draw: 'Z Kreslení',
      bounce: 'Oblast odrážení',
      record: 'Záznam',
      examples: 'Příklady',
      reset: 'Resetovat',
      lock: 'Zámek',
      unlock: 'Odemknout',
      leader: 'Vůdce',
      follow: 'Následovat',
      unfollow: 'Přestat sledovat',
      resume: 'Obnovit',
      pause: 'Pozastavit vše',
      combatOn: 'Boj zap.',
      combatOff: 'Boj vyp.',
      stopAll: 'Zastavit vše',
      settings: 'Nastavení',
      status: 'Postavení',
      help: 'Pomoc',
      open: 'OTEVŘENO',
      clearStart: 'Jasný',
      setStart: 'Nastavte na Vybrané',
      edit: 'Upravit kód',
      rename: 'Přejmenovat',
      copy: 'Kopie',
      export: 'Vývozní',
      remove: 'Odstranit',
      menu: 'Menu',
      wait: 'Počkejte',
      stealth: 'Plížení',
      undo: 'Vrátit zpět',
      save: 'Uložit',
      cancel: 'Zrušit',
      confirm: 'Ano, odstranit',
      startRoute: 'Spustit trasu',
      list: 'Seznam tras',
      calibrate: 'Kalibrovat',
    },
    prompts: {
      name: 'Název trasy',
      code: 'Krokový kód',
      interval: 'Milisekundy na krok (0 = výchozí)',
      maxTokens: 'Většina tokenů najednou (0 = žádný limit)',
      newName: 'Nové jméno',
      route: 'Název trasy',
    },
    route: {
      drawn: 'Nakreslená trasa, {points} bodů',
      recorded: 'Zaznamenaná trasa, {points} bodů',
      area: 'Oblast odrazu, {points} rohy',
      path: 'Cesta',
      mode: 'Režim',
      interval: 'Interval',
      maxTokens: 'Většina tokenů',
      randomStart: 'Náhodný start',
      walls: 'Stěny',
      start: 'Pevný start',
      tokens: 'Tokeny',
    },
    record: {
      title: 'Nahrávání „{name}“',
      intro:
        'Nahrávání {token} (zatím se pohybuje: {count}). Klikněte na šipky nebo přetáhněte žeton na mapě; každý pohyb je zaznamenán.',
    },
    settings: {
      interval: {
        label: 'Interval',
        desc: 'Milisekundy mezi kroky. Každá trasa jej může přepsat.',
      },
      movement: {
        label: 'Hnutí',
        desc: 'buňka se posune o jednu buňku na krok; segment se přesune o celý krok (například U3) najednou, jako to udělala verze 4.',
      },
      facing: {
        label: 'Otočte žetony',
        desc: 'Otočte žetony čelem tam, kam jdou: vypnuto nebo tak, jak je obrázek žetonu otočen (nahoru, dolů, doleva nebo doprava).',
      },
      combatDetection: {
        label: 'Bojová detekce',
        desc: 'Jak si všimnete boje: sledovač (sledovač tahů je otevřený a někdo v něm), manuální (tlačítka Combat On/Off) nebo obojí.',
      },
      combatBehaviour: {
        label: 'Bojové chování',
        desc: 'Co dělají hlídky v boji: pauza, krok (pohyb jednou při každém průchodu tahu) nebo ignorování (pokračování v pohybu).',
      },
      lockMode: {
        label: 'Režim uzamčení',
        desc: 'Jak Lock drží token: nativní (vlastní zámek polohy Roll20, takže jej nikdo nemůže přetáhnout), vrátit zpět (tahy jsou vráceny zpět) nebo zmrazit (přestane hlídkovat a následovat, ale stále lze přetáhnout).',
      },
      lockMarker: {
        label: 'Značka zámku',
        desc: 'Stavová značka zobrazená na uzamčených tokenech nebo žádná. Hráči mohou vidět značky.',
      },
      followMode: {
        label: 'Režim sledování',
        desc: 'stezka: následovníci jdou po jediném souboru ve stopách vůdce. formace: následovníci si udržují své místo kolem vůdce (přetažením následovníka změníte jeho místo).',
      },
      manualMove: {
        label: 'Tažení hlídky',
        desc: 'Když přetáhnete žeton hlídky: pokračujte (trasa pokračuje od místa, kde jste ji upustili) nebo zastavte (hlídka končí).',
      },
      stopMarkers: {
        label: 'Značky zastavení',
        desc: 'Značky stavu, které oddělují token z jeho trasy a zabraňují mu následovat, oddělené středníky (například mrtvý;červený) nebo žádné. Následovníci vůdce s jedním z těchto značek se také zastaví.',
      },
      markerAction: {
        label: 'Zastavit akci značky',
        desc: 'Co udělá žeton hlídky, když dostane značku zastavení: zastavit (zůstane tam, kde je) nebo resetovat (vrátit se tam, kde začal).',
      },
      wallMode: {
        label: 'Stěny',
        desc: 'Co dělají hlídky a následovníci u dynamických osvětlovacích stěn a zavřených dveří a oken: ignorovat (procházet), držet (čekat, dokud se cesta neuvolní, například dokud se neotevřou dveře) nebo se otočit (hlídky se otočí zpět). Každá trasa si může vybrat svou, takže duchové mohou stále procházet zdmi.',
      },
      wallCheck: {
        label: 'Kontrola stěny',
        desc: 'střed: pouze střed žetonu musí zůstat mimo zdi. šířka: celý žeton ano, takže velký žeton se nemůže protlačit úzkou mezerou.',
      },
      oneWayWalls: {
        label: 'Jednosměrné stěny',
        desc: 'Zda jednosměrné zdi zastaví žetony (blok) nebo ne (průchod).',
      },
      transparentWalls: {
        label: 'Průhledné stěny',
        desc: 'Zda průhledné stěny, které propouštějí světlo, zastavují žetony (blok) nebo ne (průchod).',
      },
      buttonStep: {
        label: 'Počet buněk na kliknutí',
        desc: 'Jak daleko posunou šipky záznamu token.',
      },
      language: {
        label: 'Jazyk',
        desc: 'Jazyk pro nabídky, zprávy a letáky.',
      },
    },
    status: {
      routes: 'Trasy',
      patrols: 'Hlídkové žetony',
      followers: 'Sledování tokenů',
      locked: 'Uzamčené tokeny',
      recordings: 'Nahrávky',
      paused: 'Pozastaveno',
      combat: 'Boj',
      page: 'Aktuální stránka',
      grid: 'Mřížka',
      cell: 'Velikost buňky',
      calibration: 'Kalibrace',
    },
    help: {
      menu: 'Ukaž menu.',
      start: 'Umístěte vybrané žetony na trasu.',
      stop: 'Zastavte vybrané žetony (hlídky a sledování), každý žeton na trase nebo všechny.',
      reset: 'Vraťte žetony tam, kde začaly, a zastavte je.',
      pause: 'Pozastavit nebo obnovit každou hlídku.',
      lock: 'Podržte vybrané žetony na místě nebo je uvolněte.',
      leader: 'Vyberte si vybraný žeton jako vůdce, kterého budete následovat.',
      follow: 'Nechte vybrané žetony následovat vůdce nebo žeton daný jménem.',
      unfollow: 'Zastavte sledování vybraných tokenů.',
      add: 'Vytvořte trasu z kódu kroku, například U2R2D2L2.',
      edit: 'Změňte kód kroku trasy.',
      draw: 'Vytvořte trasu, která sleduje vybraný výkres na této stránce.',
      bounce:
        'Vytvořte trasu, na které žetony putují uvnitř vybraného uzavřeného výkresu a odrážejí se od jeho okrajů.',
      record: 'Zaznamenejte trasu přesunutím vybraného tokenu pomocí tlačítek nebo přetažením.',
      route: 'Změňte možnost trasy: režim, interval, maximální, náhodná, stěny nebo začátek.',
      show: 'Zobrazit podrobnosti o trase a tlačítka.',
      rename: 'Přejmenujte trasu.',
      copy: 'Zkopírujte trasu pod novým názvem.',
      remove: 'Odebrat trasu (nejprve se zeptá).',
      ids: 'Jednejte s tokeny s těmito ID namísto s vybranými, takže jiné mody, jako jsou ScriptCards, mohou ovládat tokeny. odstranit --ids odebere tokeny z jejich tras; nikdy neodstraní trasu.',
      list: 'Seznam tras nebo žetonů, které jsou ovládány.',
      examples: 'Přidejte ukázkové trasy.',
      export: 'Zobrazit trasy jako text ke zkopírování do jiné hry.',
      import: 'Přidejte trasy z exportovaného textu.',
      combat: 'Zapněte nebo vypněte boj ručně.',
      set: 'Změňte nastavení nebo zobrazte všechna nastavení.',
      calibrate:
        'Zarovnejte mřížku pomocí žetonů přichycených ke středům buněk nebo odstraňte kalibraci.',
      status: 'Ukažte, co modul dělá a jak vidí tuto stránku.',
      journal: 'Znovu sestavte podklady pro balíček nápovědy a příkazů.',
      help: 'Zobrazit tento seznam.',
      footer:
        'Úplné pokyny jsou v letáku „{help}“; tlačítka jsou v „{deck}“. {legacy} stále funguje s příkazy verze 4.',
    },
    handout: {
      versionLabel: 'Verze',
      subtitle: 'Hlídky, následovníci a zámky pro hry Jumpgate a Legacy',
      overview: {
        heading: 'Přehled',
        body: 'TokenController přesune tokeny za vás. Dejte strážci hlídkovou trasu, nechte vozík následovat svého řidiče nebo zamkněte sochu na místě. Trasy lze zadat jako kód kroku, vysledovat z výkresu na mapě nebo zaznamenat pohybem žetonu. Trasy fungují na čtvercových, hexadecimálních, izometrických, dimetrických a bezmřížkových stránkách.',
      },
      quickStart: {
        heading: 'Rychlý start',
        steps: [
          'Otevřete leták Command Deck nebo pro nabídku napište !tokencontroller.',
          'Klikněte na Příklady, chcete-li přidat nějaké hotové trasy, nebo na Krokový kód a zadejte svůj vlastní (například U2R2D2L2).',
          'Vyberte jeden nebo více tokenů a klikněte na Start vedle trasy.',
          'Vyberte token a klikněte na Zastavit, chcete-li jej zastavit, nebo na Resetovat, chcete-li jej poslat zpět tam, kde začal.',
        ],
      },
      routes: {
        heading: 'Vytváření tras',
        points: [
          'Kód kroku: zadejte pohyby jako U2R2D2L2. Kódy nejsou vázány na místo na mapě, takže stejná trasa funguje kdekoli.',
          'Z kreslení: nakreslete pomocí nástrojů kreslení čáru, mnohoúhelník, tvar od ruky, obdélník nebo elipsu, vyberte je a klikněte na Z kresby. Tokeny po ní chodí, pouze na této stránce. Nákres můžete poté smazat.',
          'Záznam: vyberte token a klikněte na Záznam. Přesuňte jej pomocí tlačítek se šipkami nebo jej přetáhněte na mapu (sledují se trasové body Roll20) a poté klikněte na Uložit. Na čtvercové mřížce se záznam stane kódem kroku, který můžete upravit.',
          'Smyčkové trasy začínají znovu od začátku; trasy tam a zpět jdou zpět tak, jak přišli; jakmile se trasy zastaví na konci. Nové trasy, které končí tam, kde začínají, smyčka; ostatní jdou tam a zpět.',
          'Oblast odrazu: nakreslete kolem oblasti uzavřený tvar, vyberte jej a klikněte na Oblast odrazu. Žetony, které na něm začaly, cestují v přímých liniích a odrážejí se od jeho okrajů (a od zdí, pokud je trasa ignoruje), přičemž se pokaždé trochu náhodně otočí. Náhodný start umístí každý žeton do náhodné buňky oblasti.',
        ],
      },
      codes: {
        colCode: 'Kód',
        colMeaning: 'Význam',
        move: 'Pohyb nahoru, dolů, doleva nebo doprava o jednu buňku.',
        diagonal: 'Pohybujte se diagonálně.',
        distance: 'Číslo za směrem posune tolik buněk.',
        face: 'Otočte se čelem ke směru bez pohybu (potřebuje žetony otočení).',
        wait: 'Počkejte jeden krok nebo daný počet kroků.',
        stealth: 'Přesuňte token mezi vrstvu tokenu a vrstvu GM, aby zmizel a znovu se objevil.',
      },
      routeOptions: {
        heading: 'Možnosti trasy',
        colOption: 'Volba',
        colMeaning: 'Význam',
        mode: 'smyčka, pingpong (tam a zpět) nebo jednou.',
        interval: 'Milisekundy na krok pro tuto trasu nebo 0 pro globální interval.',
        max: 'Nejvíce žetonů, které mohou být na trase najednou, nebo 0 bez omezení.',
        random: 'zapnuto: každý žeton začíná v náhodném bodě na trase.',
        walls:
          'ignorovat (procházet zdmi), držet (čekat u zdí a zavřených dveří), otáčet se (vrátit se zpět) nebo výchozí (použít nastavení Zdi).',
        start:
          'sada: žetony na začátku přeskočí na pozici vybraného žetonu. jasné: začínají tam, kde stojí.',
      },
      tokens: {
        heading: 'Ovládání tokenů',
        points: [
          'Token je vždy na jedné trase. Zahájení na jiné trase nahradí první trasu.',
          'Stop nechává žetony tam, kde jsou. Reset je vrátí tam, kde byly před začátkem, na jejich původní vrstvě.',
          'Zámek drží žeton na místě. Zamčené žetony nehlídají ani nesledují, dokud nejsou odemčeny.',
          'Následovat: vyberte vůdce a klikněte na vůdce, poté vyberte následovníky a klikněte na Následovat. Můžete také napsat jméno vůdce: !tokencontroller follow Goblin Boss. Následovníci sledují žetony, které hlídkují, žetony, které přetáhnete, a žetony přesunuté TokenModem.',
          'Následovníci mohou následovat ostatní příznivce a vytvořit tak řetěz nebo sloupec.',
          'Přetažení žetonu hlídky přenese hlídku z místa, kde ji upustíte, pokud není přetažení hlídky nastaveno na zastavení.',
          'Zdi: při zapnutém Zdi hlídky a následovníci neprocházejí dynamickými osvětlovacími stěnami nebo zavřenými dveřmi a okny; otevřené dveře a okna je propustí. Dejte trase možnost vlastní zdi (například ignorovat pro ducha).',
          'Stop Markers: Token, který získá jeden z těchto ukazatelů stavu (například mrtvý), opustí svou trasu a přestane ho následovat a následovníci vůdce, který dostane jednu zastávku také. Nastavte je pomocí !tokencontroller set stopMarkers dead;red. To také funguje, když jiný Mod přidá značku.',
        ],
      },
      grids: {
        heading: 'Mřížky',
        points: [
          'Velikost buňky a typ mřížky se čte z každé stránky, takže různé stránky mohou používat různé mřížky.',
          'U a D vždy znamenají nahoru a dolů na obrazovce. Na hexadecimálních mřížkách se pohybuje bez shodného souseda cik-cak; na izometrických a dimetrických mřížkách protínají úhlopříčky jeden kosočtverec.',
          'Stránky s vypnutým přichytáváním se pohybují v krocích po 70 pixelech bez zarovnání do mřížky.',
          'Pokud se žetony odchýlí od mřížky, přichyťte žeton do středu buňky, vyberte jej a klikněte na Kalibrovat. Vyberte dva tokeny v sousedních buňkách řádku, abyste také opravili velikost buňky.',
        ],
      },
      combat: {
        heading: 'Boj',
        points: [
          'Combat Detection určuje, jak je boj zaznamenán: sledovač tahů, tlačítka Combat On/Off nebo obojí.',
          'Combat Behavior (Bojové chování) určuje, co hlídky dělají: pozastavit se, posunout se o jeden krok pokaždé, když zatáčku projde, nebo pokračovat v pohybu.',
          'Pozastavit vše kdykoli zastaví každou hlídku; Resume je znovu spustí.',
        ],
      },
      commands: {
        heading: 'Příkazy',
        intro:
          'Tyto příkazy mohou používat pouze GM. Trasy lze pojmenovat nebo na ně odkazovat pomocí #id z tlačítek nabídky. Pokud má příkaz dvě jména, vložte jména s mezerami do "uvozovek".',
        mods: 'Tyto příkazy mohou odesílat i jiné mody, například ze ScriptCards. Nemohou vybrat tokeny, takže je pojmenují --ids následované ID tokenu oddělenými středníky: !tc stop --ids ID1;ID2. Odpovědi jdou GM.',
        colCommand: 'Příkaz',
        colDesc: 'Co to dělá',
      },
      settings: {
        heading: 'Nastavení',
        intro:
          'Změňte nastavení z nabídky pomocí !tokencontroller set <setting> <value> nebo na stránce nastavení Mod na obrazovce API Scripts.',
        colKey: 'Klíč',
        colName: 'Nastavení',
        colDesc: 'Popis',
      },
      upgrading: {
        heading: 'Upgrade z verze 4',
        points: [
          'Cesty, hlídkové žetony, zámky, následovníci a nedokončené koncepty jsou zachovány. Z konceptů se stanou trasy končící na „(návrh)“.',
          'Vaše nastavení verze 4 jsou zachována: interval, dílčí kroky, rotace, bojová hlídka a jednotky na kliknutí.',
          'Příkazy !tc a !token-control a makra T-Cntrl_ nadále fungují. V tabulce jsou uvedeny nové příkazy.',
          'Verze 4 odeslala po každé akci celé menu; verze 5 místo toho odešle krátkou odpověď.',
          'Nastavení pixelů na jednotku je pryč: velikost buňky pochází z každé stránky. HTML Builder již není potřeba.',
          'Starý leták Usage Guide, který mohl vidět každý hráč, je nahrazen tímto letákem určeným pouze pro GM.',
        ],
        colV4: 'Verze 4',
        colV5: 'Verze 5',
      },
      troubleshooting: {
        heading: 'Odstraňování problémů',
        points: [
          'Tokeny se nepohybují: zkontrolujte Stav. Hlídky čekají při pauze, při uzamčení a v boji, když je bojové chování pozastaveno.',
          'Žetony se pohybují o nesprávnou vzdálenost: velikost mřížky stránky nebo uchopení se mohly změnit; zkuste Kalibrovat.',
          'Nakreslená trasa se nespustí: nakreslené trasy fungují pouze na stránce, na které byly nakresleny.',
          'Následovníci se nepohybují, když jiný mod pohne vůdcem: pouze TokenMod hlásí své pohyby. Ostatní mody mohou volat TokenController.ObserveTokenChange.',
          'Nahlaste problémy na fóru Roll20 se všemi zprávami z konzole API.',
        ],
      },
      languages: {
        heading: 'Jazyky',
        body: 'TokenController je přeložen do níže uvedených jazyků. Vyberte jeden pomocí nastavení Jazyk.',
        colCode: 'Kód',
        colName: 'Jazyk',
        colNative: 'Rodné jméno',
      },
      credits: {
        heading: 'Kredity',
        original: 'Původní mod od',
        maintainer: 'Verze 5 spravovaná společností',
        support: 'Nahlaste chyby a nápady na fóru Roll20 Mod nebo na GitHubu.',
      },
      footer: 'Tlačítka pro každou akci jsou v letáku „{deck}“.',
    },
    deck: {
      subtitle: 'Velitelský balíček',
      patrolsDesc: 'Spusťte, zastavte a pozastavte hlídky. Nejprve vyberte tokeny.',
      createDesc: 'Vytvořte trasy z kódu kroku, nákresu nebo nahráním tokenu.',
      selectedDesc: 'Uzamkněte žetony nebo je přimějte, aby následovaly vůdce.',
      toolsDesc: 'Nástroje pro boj, nastavení a mřížku.',
      footer: 'Úplné pokyny jsou v letáku „{help}“.',
    },
  };

  const TRANSLATION$j = {
    titles: {
      ready: 'TokenController er klar.',
      settings: 'TokenController-indstillinger',
      help: 'TokenController-kommandoer',
      export: 'Ruteeksport',
      routes: 'Ruter',
      tokens: 'Kontrollerede tokens',
      status: 'TokenController-status',
    },
    messages: {
      migrated:
        'Opgraderet fra version 4. Ruter bevaret: {routes}. Beholdt patruljeringstokens: {patrols}. Dine gamle makroer og !tc-kommandoer virker stadig.',
      removedGuide:
        'Den gamle "TokenController Usage Guide", som spillere kunne se, blev erstattet af GM-kun Hjælp-uddelingsark.',
      pruned: 'Patruljer glemt, fordi deres tokens ikke længere eksisterer: {count}.',
      readyHint: 'Skriv !tokencontroller for menuen, eller åbn Command Deck-uddelingskopien.',
      combatStarted: {
        pause: 'Kampen er startet: patruljer er sat på pause, indtil den slutter.',
        step: 'Kampen er startet: patruljer bevæger sig et skridt hver tur.',
      },
      combatEnded: 'Kampen er forbi: patruljer fortsætter.',
      routeAdded: 'Ruten "{name}" tilføjet ({mode}).',
      routeUpdated: 'Ruten "{name}" er opdateret. Tokens på den fortsætter med den nye rute.',
      confirmRemove: 'Vil du fjerne ruten "{name}"? Tokens på den, der stopper: {count}.',
      routeRemoved: 'Ruten "{name}" blev fjernet. Tokens stoppet: {count}.',
      routeRenamed: 'Rute "{from}" omdøbt til "{to}".',
      examplesAdded: 'Eksempel på ruter tilføjet: {count}.',
      exportHint: 'Kopiér teksten nedenfor, og indsæt den efter {command} i ethvert spil.',
      imported:
        'Importerede {added} ruter; sprunget over {skipped} (navnet er allerede brugt eller ikke gyldigt).',
      started: '{tokens} startede den "{name}".',
      stopped: 'Tokens stoppet: {count}.',
      reset: 'Tokens vendt tilbage til hvor de startede: {count}.',
      locked: 'Låst: {tokens} ({mode}).',
      unlocked: 'Ulåst: {tokens}.',
      leaderSet: '{token} er lederen. Vælg følgerne, og klik på Følg.',
      following: 'Følger nu {leader} ({mode}): {tokens}.',
      unfollowed: 'Tokens følger ikke længere: {count}.',
      noRecordings: 'Der bliver ikke registreret noget.',
      recordingCancelled: 'Optagelsen "{name}" blev annulleret.',
      languages: 'Understøttede sprog: {list}',
      settingChanged: '{setting} er nu {value}.',
      combatOn: 'Kamp slået til.',
      combatOff: 'Kamp slået fra.',
      calibrationCleared: 'Gitterkalibrering fjernet fra denne side.',
      calibrated: 'Gitter kalibreret til denne side (cellestørrelse × {scale}).',
      paused: 'Alle patruljer holdt pause.',
      resumed: 'Patruljer blev genoptaget.',
      journalRebuilt: 'Handouts genopbygget: {help} og {deck}.',
      markerStopped: 'Stoppet af en stopmarkør: {tokens}.',
      markerReset: 'Sendt tilbage til det sted, hvor de startede af en stopmarkør: {tokens}.',
    },
    errors: {
      noTokens: 'Ingen tokens valgt.',
      noRouteName: 'Intet rutenavn angivet.',
      routeNotFound: 'Der er ingen rute kaldet "{name}".',
      routeExists: 'Der er allerede en rute kaldet "{name}".',
      code: {
        empty: 'Trinkoden er tom.',
        badToken: 'Trinkoden "{code}" har noget, den ikke forstår ved "{at}".',
        tooFar: 'Trinet "{at}" er for langt.',
      },
      routeInvalid: 'Den rute kunne ikke gemmes.',
      usageAdd: 'Giv et navn og en trinkode.',
      usageEdit: 'Giv en rute og en ny trinkode.',
      selectOneDrawing:
        'Vælg nøjagtig én tegning (en linje, polygon, frihåndsform, rektangel eller ellipse).',
      drawingEmpty: 'Den valgte tegning har for få punkter at følge.',
      usageRoute: 'Giv en rute, en mulighed og en værdi.',
      unknownRouteOption: 'Der er ingen rutevalg kaldet "{option}".',
      selectOneToken: 'Vælg præcis én token.',
      badRouteValue: '"{value}" er ikke en gyldig værdi for {option}.',
      usageRename: 'Giv en rute og dens nye navn.',
      usageCopy: 'Giv en rute og et navn til kopien.',
      badJson: 'Det er ikke ruteeksporttekst.',
      tokenLocked: '{tokens} kan ikke starte: låst.',
      tokenMarked: '{tokens} kan ikke starte: de har en stopmarkør.',
      outsideArea: '{tokens} kan ikke starte: de er uden for "{name}".',
      selectOneArea:
        'Vælg præcis én lukket tegning (en polygon, rektangel, ellipse eller frihåndsløkke).',
      areaTooSmall: 'Den valgte tegning skal have mindst tre hjørner for at lave et område.',
      idsNotFound: "Ingen tokens har disse id'er: {ids}.",
      routeOnOtherPage: '{tokens} kan ikke starte: "{name}" blev tegnet på en anden side.',
      startOnOtherPage:
        '{tokens} kan ikke starte: den faste start på "{name}" er på en anden side.',
      routeFull: '{tokens} kan ikke starte: "{name}" har allerede {max} tokens.',
      noPage: 'Siden kunne ikke findes.',
      emptyTrack: '{tokens} kan ikke starte: "{name}" har ingen træk.',
      leaderNotFound: 'Der blev ikke fundet noget token kaldet "{name}" på denne side.',
      noLeader: 'Der er ingen leder endnu.',
      followLoop: '{tokens} kan ikke følge et token, der følger dem.',
      alreadyRecording: '{token} bliver allerede optaget.',
      recordingTokenGone: 'Tokenet til optagelse af "{name}" eksisterer ikke længere.',
      recordingEmpty: 'Der er ikke registreret noget endnu.',
      unknownSetting: 'Der er ingen indstilling kaldet "{key}".',
      badSettingValue: '"{value}" er ikke en gyldig værdi for {key}.',
      calibrateNeedsTokens: 'Vælg et eller to tokens, der er fastgjort til cellecentre.',
      calibrateFailed: 'De valgte tokens kunne ikke bruges til at kalibrere gitteret.',
      unknownCommand: 'Ukendt kommando "{command}".',
      gmOnly: 'Kun GM kan bruge TokenController.',
      internal: 'Noget gik galt. Detaljer findes i API-konsollen.',
    },
    hints: {
      noTokens: 'Vælg først tokens på kortet.',
      noRouteName: 'For eksempel: !tokencontroller tilføj Guard Walk U2R2D2L2',
      routeNotFound: 'Skriv !tokencontroller liste for at se alle ruter.',
      code: {
        empty: 'For eksempel: U2R2D2L2',
        badToken:
          'Brug U, D, L, R, UL, UR, DL eller DR med et antal celler, W til at vente og S til stealth.',
        tooFar: 'Et enkelt trin kan højst være på 100 celler; venter højst 100 kryds.',
      },
      selectOneDrawing:
        'Tegn ruten med et tegneværktøj, vælg den (træk en boks rundt om en tynd kontur, hvis du klikker forbi den), prøv derefter igen.',
      usageRoute: 'Indstillinger: tilstand, interval, max, tilfældig, vægge, start.',
      routeOnOtherPage: 'Tegnede ruter virker kun på den side, de er tegnet på.',
      startOnOtherPage: 'Ryd den faste start, eller flyt tokenet til den side først.',
      noLeader: 'Vælg lederen og klik Leder, eller giv dens navn: !tokencontroller følg Navn',
      leaderNotFound: 'Brug tokennavnet nøjagtigt som vist på kortet, eller dets token-id.',
      badJson: 'Indsæt teksten fra !tokencontroller-eksport (eller v4-eksportstier) nøjagtigt.',
      unknownSetting: 'Skriv !tokencontroller set for at se alle indstillinger.',
      calibrateNeedsTokens:
        'Et token står på linje med gitteret; to tokens i naboceller i en række fastsætter også cellestørrelsen.',
      calibrateFailed:
        'Sørg for, at tokens er i tilstødende celler i samme række (kolonne på Hex (H) sider).',
      unknownCommand: 'Skriv !tokencontroller help for listen over kommandoer.',
      tokenLocked: 'Lås først tokenet op.',
      tokenMarked: 'Fjern markøren, eller skift indstillingen Stop Markers.',
      outsideArea: 'Flyt tokens inden for området først, eller slå tilfældig start til for ruten.',
      selectOneArea:
        'Tegn området med et tegneværktøj, vælg det (træk en boks rundt om et tyndt omrids, hvis du klikker forbi det), prøv derefter igen.',
      idsNotFound: "Giv token-id'er efter --ids, adskilt af semikolon.",
    },
    warnings: {
      idsNotFound: "Ingen tokens har disse id'er, så de blev sprunget over: {ids}.",
      offPage: 'En del af ruten løber væk fra siden (trin: {count}). Disse trin springes over.',
      combatTrackerOnly:
        'Combat Detection er indstillet til turn tracker, så denne kontakt har ingen effekt, før du ændrer den.',
      unitPx:
        'Version 5 læser cellestørrelsen fra hver side, så den gamle Pixels Per Unit-indstilling bruges ikke længere. Hvis tokens ikke er på linje, skal du bruge !tokencontroller-kalibrering.',
    },
    values: {
      on: 'På',
      off: 'Slukket',
      none: 'Ingen',
      default: 'Misligholdelse',
      noLimit: 'Ingen grænse',
      ms: '{ms} ms',
      andMore: 'og {count} mere',
      following: 'følger {leader}',
      locked: 'låst',
      gridless: 'ingen snapping',
      grid: {
        square: 'Firkant',
        hex: 'Sekskant',
        iso: 'Isometrisk / Dimetric',
      },
      mode: {
        loop: 'Løkke',
        pingpong: 'Frem og tilbage',
        once: 'Engang',
      },
      movement: {
        cell: 'En celle ad gangen',
        segment: 'Hele skridt ad gangen',
      },
      facing: {
        off: 'Vend ikke',
        up: 'Kunsten vender opad',
        down: 'Kunsten vender nedad',
        left: 'Kunstansigter tilbage',
        right: 'Kunst ansigter højre',
      },
      combatDetection: {
        tracker: 'Drej tracker',
        manual: 'GM-kontakt',
        both: 'Drej tracker eller GM-kontakt',
      },
      combatBehaviour: {
        pause: 'Pause',
        step: 'Flyt hver tur',
        ignore: 'Bliv ved med at bevæge dig',
      },
      lockMode: {
        native: "Roll20's positionslås",
        revert: 'Fortryd bevægelser',
        freeze: 'Hold kun stille',
      },
      followMode: {
        trail: 'Enkelt fil',
        formation: 'Dannelse',
      },
      manualMove: {
        continue: 'Fortsæt derfra',
        stop: 'Stop patruljen',
      },
      markerAction: {
        stop: 'Stop hvor det er',
        reset: 'Gå tilbage til starten',
      },
      wallMode: {
        ignore: 'Gå gennem vægge',
        hold: 'Vent ved vægge',
        turn: 'Vend tilbage ved vægge',
      },
      wallCheck: {
        centre: 'Midten af tokenet',
        width: 'Hel token',
      },
      oneWayWalls: {
        block: 'Blok',
        pass: 'Slip igennem',
      },
      transparentWalls: {
        block: 'Blok',
        pass: 'Slip igennem',
      },
    },
    menu: {
      statusRunning: 'Patruljerende tokens: {patrols}. Ruter: {routes}.',
      statusPaused: 'Alle patruljer er sat på pause.',
      statusCombat: {
        pause: 'I kamp: patruljer er sat på pause.',
        step: 'I kamp: patruljer bevæger sig hver tur.',
      },
      routes: 'Ruter',
      noRoutes: 'Ingen ruter endnu. Tilføj en, tegn en, optag en eller tilføj eksemplerne.',
      create: 'Ny rute',
      selected: 'Udvalgte tokens',
      tools: 'Værktøjer',
      recordings: 'Optagelser',
      patrols: 'Patruljer',
    },
    buttons: {
      start: 'Starte',
      stop: 'Stop',
      add: 'Trin kode',
      draw: 'Fra Tegning',
      bounce: 'Bounce område',
      record: 'Optage',
      examples: 'Eksempler',
      reset: 'Nulstil',
      lock: 'Låse',
      unlock: 'Lås op',
      leader: 'Leder',
      follow: 'Følge',
      unfollow: 'Slut med at følge',
      resume: 'Genoptage',
      pause: 'Sæt alle på pause',
      combatOn: 'Kamp på',
      combatOff: 'Kamp off',
      stopAll: 'Stop alle',
      settings: 'Indstillinger',
      status: 'Status',
      help: 'Hjælp',
      open: 'Åben',
      clearStart: 'Klar',
      setStart: 'Indstil til Valgt',
      edit: 'Rediger kode',
      rename: 'Omdøb',
      copy: 'Kopi',
      export: 'Eksportere',
      remove: 'Fjerne',
      menu: 'Menu',
      wait: 'Vente',
      stealth: 'Snig',
      undo: 'Fortryd',
      save: 'Spare',
      cancel: 'Ophæve',
      confirm: 'Ja, fjern den',
      startRoute: 'Start rute',
      list: 'Liste over ruter',
      calibrate: 'Kalibrer',
    },
    prompts: {
      name: 'Rutenavn',
      code: 'Trin kode',
      interval: 'Millisekunder pr. trin (0 = standard)',
      maxTokens: 'De fleste tokens på én gang (0 = ingen grænse)',
      newName: 'Nyt navn',
      route: 'Rutenavn',
    },
    route: {
      drawn: 'Tegnet rute, {points} point',
      recorded: 'Registreret rute, {points} point',
      area: 'Afvisningsområde, {points} hjørner',
      path: 'Sti',
      mode: 'Tilstand',
      interval: 'Interval',
      maxTokens: 'De fleste tokens',
      randomStart: 'Tilfældig start',
      walls: 'Vægge',
      start: 'Fast start',
      tokens: 'Poletter',
    },
    record: {
      title: 'Optager "{name}"',
      intro:
        'Optager {token} (bevæger sig indtil videre: {count}). Klik på pilene, eller træk tokenet på kortet; hver bevægelse registreres.',
    },
    settings: {
      interval: {
        label: 'Interval',
        desc: 'Millisekunder mellem trin. Hver rute kan tilsidesætte den.',
      },
      movement: {
        label: 'Bevægelse',
        desc: 'celle flytter en celle pr. trin; segment flytter et helt trin (såsom U3) på én gang, som version 4 gjorde.',
      },
      facing: {
        label: 'Drej tokens',
        desc: 'Vend tokens til ansigt, hvor de skal hen: slukket, eller den måde, som tokenkunsten vender (op, ned, venstre eller højre).',
      },
      combatDetection: {
        label: 'Kampdetektion',
        desc: 'Sådan bemærkes kamp: tracker (tursporeren er åben med nogen i den), manuel (Combat On/Off-knapperne) eller begge dele.',
      },
      combatBehaviour: {
        label: 'Kampadfærd',
        desc: 'Hvad patruljer gør i kamp: pause, trin (bevæg dig én gang hver gang turen går) eller ignorer (bliv ved med at bevæge dig).',
      },
      lockMode: {
        label: 'Låsetilstand',
        desc: "Sådan holder lås en token: indfødt (Roll20's egen positionslås, så ingen kan trække den), gå tilbage (bevægelser fortrydes) eller fryse (den stopper med at patruljere og følge, men kan stadig trækkes).",
      },
      lockMarker: {
        label: 'Låsemarkør',
        desc: 'Statusmarkør vist på låste tokens, eller ingen. Spillere kan se markører.',
      },
      followMode: {
        label: 'Følg tilstand',
        desc: 'spor: følgere går enkelt fil i lederens fodspor. formation: følgere beholder deres plads omkring lederen (træk en følger for at ændre dens plads).',
      },
      manualMove: {
        label: 'Trækker en patrulje',
        desc: 'Når du trækker et patruljerende token: fortsæt (ruten fortsætter fra det sted, hvor du tabte den) eller stop (patruljen slutter).',
      },
      stopMarkers: {
        label: 'Stopmarkører',
        desc: 'Statusmarkører, der fjerner et token fra ruten og stopper det med at følge, adskilt af semikolon (f.eks. død;rød) eller ingen. Tilhængere af en leder med en af disse markører stopper også.',
      },
      markerAction: {
        label: 'Stop markør handling',
        desc: 'Hvad et patruljerende token gør, når det får en stopmarkør: stop (det bliver, hvor det er) eller nulstil (det går tilbage til, hvor det startede).',
      },
      wallMode: {
        label: 'Vægge',
        desc: 'Hvad patruljer og følgere gør ved dynamiske belysningsvægge og lukkede døre og vinduer: ignorere (gå igennem), holde (vente indtil vejen er fri, for eksempel indtil en dør åbner) eller dreje (patruljer vender tilbage). Hver rute kan vælge sin egen, så spøgelser kan stadig gå gennem vægge.',
      },
      wallCheck: {
        label: 'Vægtjek',
        desc: 'i midten: kun midten af en token skal holde sig fri af vægge. bredde: hele token gør det, så en stor token kan ikke presse sig gennem et smalt mellemrum.',
      },
      oneWayWalls: {
        label: 'Envejsvægge',
        desc: 'Hvorvidt envejsvægge stopper tokens (blok) eller ej (pas).',
      },
      transparentWalls: {
        label: 'Gennemsigtige vægge',
        desc: 'Om gennemsigtige vægge, som slipper lys igennem, stopper tokens (blokerer) eller ej (passerer).',
      },
      buttonStep: {
        label: 'Celler pr. klik',
        desc: 'Hvor langt optagelsespilene flytter et token.',
      },
      language: {
        label: 'Sprog',
        desc: 'Sprog til menuer, beskeder og uddelingskopier.',
      },
    },
    status: {
      routes: 'Ruter',
      patrols: 'Patruljerende tokens',
      followers: 'Følgende tokens',
      locked: 'Låste tokens',
      recordings: 'Optagelser',
      paused: 'Pause',
      combat: 'Bekæmpe',
      page: 'Nuværende side',
      grid: 'Gitter',
      cell: 'Cellestørrelse',
      calibration: 'Kalibrering',
    },
    help: {
      menu: 'Vis menuen.',
      start: 'Sæt de valgte tokens på en rute.',
      stop: 'Stop de valgte tokens (patruljer og følger), hvert token på en rute eller alle.',
      reset: 'Returner tokens til hvor de startede, og stop dem.',
      pause: 'Sæt pause eller genoptag hver patrulje.',
      lock: 'Hold de valgte tokens på plads, eller slip dem.',
      leader: 'Vælg det valgte token som leder at følge.',
      follow: 'Få de valgte tokens til at følge lederen, eller et token givet ved navn.',
      unfollow: 'Stop de valgte tokens efter.',
      add: 'Opret en rute fra en trinkode, såsom U2R2D2L2.',
      edit: 'Skift en rutes trinkode.',
      draw: 'Opret en rute, der følger den valgte tegning på denne side.',
      bounce:
        'Opret en rute, hvor tokens vandrer inde i den valgte lukkede tegning og hopper af dens kanter.',
      record: 'Optag en rute ved at flytte det valgte token med knapper eller ved at trække det.',
      route: 'Skift en ruteindstilling: tilstand, interval, maks., tilfældig, vægge eller start.',
      show: 'Vis en rutes detaljer og knapper.',
      rename: 'Omdøb en rute.',
      copy: 'Kopier en rute under et nyt navn.',
      remove: 'Fjern en rute (spørger først).',
      ids: "Handl på tokens med disse ID'er i stedet for de valgte, så andre Mods såsom ScriptCards kan styre tokens. fjern --ids fjerner tokens fra deres ruter; det fjerner aldrig en rute.",
      list: 'Liste over ruterne eller de tokens, der kontrolleres.',
      examples: 'Tilføj eksempler på ruter.',
      export: 'Vis ruter som tekst, der skal kopieres til et andet spil.',
      import: 'Tilføj ruter fra eksporttekst.',
      combat: 'Slå kamp til eller fra med hånden.',
      set: 'Skift en indstilling, eller vis alle indstillinger.',
      calibrate:
        'Ret gitteret op med tokens, der er fastgjort til cellecentre, eller fjern kalibreringen.',
      status: "Vis, hvad Mod'en laver, og hvordan den ser denne side.",
      journal: 'Genopbyg hjælpe- og kommandodækket-uddelingsarkene.',
      help: 'Vis denne liste.',
      footer:
        'Fuldstændige instruktioner findes i "{help}" uddelingsark; knapperne er i "{deck}". {legacy} fungerer stadig med version 4-kommandoerne.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Patruljer, følgere og låse til Jumpgate og Legacy-spil',
      overview: {
        heading: 'Oversigt',
        body: 'TokenController flytter tokens for dig. Giv en vagt en patruljerute, lad en vogn følge sin chauffør, eller lås en statue på plads. Ruter kan indtastes som en trinkode, spores fra en tegning på kortet eller registreres ved at flytte en token. Ruter fungerer på kvadratiske, hex-, isometriske, dimetriske og gitterløse sider.',
      },
      quickStart: {
        heading: 'Hurtig start',
        steps: [
          'Åbn Command Deck-uddelingsark, eller skriv !tokencontroller for menuen.',
          'Klik på Eksempler for at tilføje nogle færdige ruter eller Trinkode for at indtaste din egen (for eksempel U2R2D2L2).',
          'Vælg et eller flere tokens, og klik på Start ud for en rute.',
          'Vælg et token, og klik på Stop for at stoppe det, eller Nulstil for at sende det tilbage, hvor det startede.',
        ],
      },
      routes: {
        heading: 'At lave ruter',
        points: [
          'Trinkode: skriv bevægelser såsom U2R2D2L2. Koder er ikke bundet til et sted på kortet, så den samme rute fungerer overalt.',
          'Fra tegning: Tegn en linje, polygon, frihåndsform, rektangel eller ellipse med tegneværktøjerne, vælg den og klik på Fra tegning. Poletter går langs den, kun på den side. Du kan slette tegningen efterfølgende.',
          'Optag: Vælg et token, og klik på Optag. Flyt den med pileknapperne eller træk den på kortet (Roll20 waypoints følges), og klik derefter på Gem. På firkantede gitter bliver optagelsen en trinkode, du kan redigere.',
          'Loop-ruter starter igen fra begyndelsen; frem og tilbage ruter går tilbage på den måde, de kom; når ruterne stopper for enden. Nye ruter, der slutter, hvor de starter, loop; andre går frem og tilbage.',
          'Bounce-område: Tegn en lukket form rundt om området, vælg det, og klik på Bounce-område. Tokens, der startes på den, rejser i lige linjer og hopper af dens kanter (og fra vægge, medmindre ruten ignorerer dem), og drejer lidt tilfældigt hver gang. Tilfældig start placerer hver token i en tilfældig celle i området.',
        ],
      },
      codes: {
        colCode: 'Kode',
        colMeaning: 'Mening',
        move: 'Flyt op, ned, til venstre eller højre, én celle.',
        diagonal: 'Bevæg dig diagonalt.',
        distance: 'Et tal efter en retning flytter så mange celler.',
        face: 'Drej for at vende mod en retning uden at bevæge sig (kræver Turn Tokens).',
        wait: 'Vent et trin eller det givne antal trin.',
        stealth:
          'Flyt tokenet mellem token-laget og GM-laget, så det forsvinder og dukker op igen.',
      },
      routeOptions: {
        heading: 'Rutemuligheder',
        colOption: 'Valgmulighed',
        colMeaning: 'Mening',
        mode: 'loop, pingpong (frem og tilbage) eller én gang.',
        interval: 'Millisekunder pr. trin for denne rute, eller 0 for det globale interval.',
        max: 'De fleste tokens, der kan være på ruten på én gang, eller 0 uden grænse.',
        random: 'tændt: hvert token starter på et tilfældigt punkt langs ruten.',
        walls:
          'ignorere (gå gennem vægge), hold (vent ved vægge og lukkede døre), vend (vend tilbage) eller standard (brug indstillingen Vægge).',
        start:
          'sæt: tokens hopper til det valgte tokens position, når de starter. klart: de starter, hvor de står.',
      },
      tokens: {
        heading: 'Styring af tokens',
        points: [
          'Et token er på én rute ad gangen. At starte den på en anden rute erstatter den første.',
          'Stop efterlader tokens, hvor de er. Nulstil sætter dem tilbage, hvor de var, før de startede, på deres oprindelige lag.',
          'Lås holder et token på plads. Låste tokens patruljerer eller følger ikke efter, før de er låst op.',
          'Følg: vælg lederen, og klik på Leder, vælg derefter følgerne, og klik på Følg. Du kan også skrive lederens navn: !tokencontroller follow Goblin Boss. Følgere følger tokens, der patruljerer, tokens, du trækker, og tokens, der flyttes af TokenMod.',
          'Følgere kan følge andre følgere, lave en kæde eller en kolonne.',
          'At trække et patruljerende token fører patruljen videre fra det sted, hvor du taber det, medmindre at trække en patrulje er indstillet til at stoppe.',
          'Vægge: med vægge aktiveret, går patruljer og følgere ikke gennem dynamiske lysvægge eller lukkede døre og vinduer; åbne døre og vinduer slipper dem igennem. Giv en rute sin egen væg mulighed (for eksempel ignorer for et spøgelse).',
          'Stopmarkører: et token, der får en af disse statusmarkører (for eksempel død) forlader sin rute og stopper med at følge, og følgerne af en leder, der får et stop også. Indstil dem med !tokencontroller sæt stopMarkers dead;red. Dette virker også, når en anden Mod tilføjer markøren.',
        ],
      },
      grids: {
        heading: 'Gitter',
        points: [
          'Cellestørrelsen og gittertypen læses fra hver side, så forskellige sider kan bruge forskellige gitter.',
          'U og D betyder altid op og ned på skærmen. På hex-gitter, bevægelser uden matchende nabo-zigzag; på isometriske og dimetriske gitter krydser diagonaler én diamant.',
          'Sider, hvor snapping er slået fra, bevæger sig i trin på 70 pixel uden at være på linje med et gitter.',
          'Hvis tokens glider væk fra gitteret, skal du sætte et token til et cellecenter, vælge det og klikke på Kalibrer. Vælg to tokens i tilstødende celler i en række for også at fastsætte cellestørrelsen.',
        ],
      },
      combat: {
        heading: 'Bekæmpe',
        points: [
          'Combat Detection vælger, hvordan kamp bemærkes: Turn tracker, Combat On/Off-knapperne eller enten.',
          'Combat Behavior vælger, hvad patruljer gør: pause, flytte et skridt, hver gang turen går, eller fortsæt med at bevæge sig.',
          'Pause All stopper hver patrulje til enhver tid; Genoptag starter dem igen.',
        ],
      },
      commands: {
        heading: 'Kommandoer',
        intro:
          'Kun GM\'er kan bruge disse kommandoer. Ruter kan navngives eller henvises til med deres #id fra menuknapperne. Sæt navne med mellemrum i "anførselstegn", når en kommando tager to navne.',
        mods: "Andre Mods kan også sende disse kommandoer, for eksempel fra ScriptCards. De kan ikke vælge tokens, så de navngiver dem med --ids efterfulgt af token-id'er adskilt af semikolon: !tc stop --ids ID1;ID2. Svar går til GM.",
        colCommand: 'Kommando',
        colDesc: 'Hvad den gør',
      },
      settings: {
        heading: 'Indstillinger',
        intro:
          'Skift indstillinger fra menuen, med !tokencontroller indstillet <indstilling> <værdi>, eller på Mod indstillingssiden i API Scripts skærmen.',
        colKey: 'Nøgle',
        colName: 'Indstilling',
        colDesc: 'Beskrivelse',
      },
      upgrading: {
        heading: 'Opgradering fra version 4',
        points: [
          'Stier, patruljeringstegn, låse, følgere og ufærdige udkast opbevares. Udkast bliver til ruter, der ender på "(udkast)".',
          'Dine version 4-indstillinger bevares: interval, undertrin, rotation, kamppatrulje og enheder pr. klik.',
          'Kommandoerne !tc og !token-kontrol og T-Cntrl_-makroerne bliver ved med at fungere. Tabellen viser de nye kommandoer.',
          'Version 4 sendte hele menuen efter hver handling; version 5 sender i stedet et kort svar.',
          'Indstillingen Pixels Per Unit er væk: cellestørrelsen kommer fra hver side. HTML Builder er ikke længere nødvendig.',
          'Den gamle brugsvejledning-uddeling, som alle spillere kunne se, er erstattet af denne uddeling, der kun er GM.',
        ],
        colV4: 'Version 4',
        colV5: 'Version 5',
      },
      troubleshooting: {
        heading: 'Fejlfinding',
        points: [
          'Tokens flytter sig ikke: Tjek Status. Patruljer venter, mens de er på pause, mens de er låst, og i kamp, når kampadfærd er pause.',
          'Tokens flytter sig den forkerte afstand: sidens gitterstørrelse eller snapping kan have ændret sig; prøv Kalibrer.',
          'En tegnet rute starter ikke: Tegnede ruter fungerer kun på den side, de er tegnet på.',
          'Følgere flytter sig ikke, når en anden Mod flytter lederen: kun TokenMod rapporterer sine træk. Andre Mods kan kalde TokenController.ObserveTokenChange.',
          'Rapporter problemer på Roll20-forummet med eventuelle meddelelser fra API-konsollen.',
        ],
      },
      languages: {
        heading: 'Sprog',
        body: 'TokenController er oversat til sprogene nedenfor. Vælg en med sprogindstillingen.',
        colCode: 'Kode',
        colName: 'Sprog',
        colNative: 'Indfødt navn',
      },
      credits: {
        heading: 'Credits',
        original: 'Original Mod af',
        maintainer: 'Version 5 vedligeholdes af',
        support: 'Rapporter fejl og ideer på Roll20 Mod-forummet eller på GitHub.',
      },
      footer: 'Knapper for hver handling er i "{deck}" uddelingsark.',
    },
    deck: {
      subtitle: 'Kommandodæk',
      patrolsDesc: 'Start, stop og sæt patruljer på pause. Vælg tokens først.',
      createDesc: 'Lav ruter ud fra en trinkode, en tegning eller ved at optage et token.',
      selectedDesc: 'Lås tokens, eller få dem til at følge en leder.',
      toolsDesc: 'Kamp-, indstillinger og gitterværktøjer.',
      footer: 'Fuldstændige instruktioner findes i "{help}" uddelingsark.',
    },
  };

  const TRANSLATION$i = {
    titles: {
      ready: 'TokenController is klaar.',
      settings: 'TokenController-instellingen',
      help: 'TokenController-opdrachten',
      export: 'Route-export',
      routes: 'Routes',
      tokens: 'Gecontroleerde tokens',
      status: 'TokenController-status',
    },
    messages: {
      migrated:
        "Geüpgraded vanaf versie 4. Behouden routes: {routes}. Patrouillerende tokens bewaard: {patrols}. Uw oude macro's en !tc-opdrachten werken nog steeds.",
      removedGuide:
        'De oude "TokenController Usage Guide", die spelers konden zien, werd vervangen door de Help-handout die alleen voor GM beschikbaar was.',
      pruned: 'Patrouilles vergeten omdat hun tokens niet meer bestaan: {count}.',
      readyHint: 'Typ !tokencontroller voor het menu, of open het Command Deck-hand-out.',
      combatStarted: {
        pause: 'Het gevecht is begonnen: patrouilles worden gepauzeerd totdat ze eindigen.',
        step: 'Het gevecht is begonnen: patrouilles verplaatsen elke beurt één stap.',
      },
      combatEnded: 'Het gevecht is voorbij: de patrouilles gaan door.',
      routeAdded: 'Route "{name}" toegevoegd ({mode}).',
      routeUpdated: 'Route "{name}" bijgewerkt. Tokens erop gaan verder met de nieuwe route.',
      confirmRemove: 'Route "{name}" verwijderen? Tokens erop die zullen stoppen: {count}.',
      routeRemoved: 'Route "{name}" verwijderd. Tokens gestopt: {count}.',
      routeRenamed: 'Route "{from}" hernoemd naar "{to}".',
      examplesAdded: 'Voorbeeldroutes toegevoegd: {count}.',
      exportHint: 'Kopieer de onderstaande tekst en plak deze na {command} in een spel.',
      imported:
        'Geïmporteerde {added} routes; {skipped} overgeslagen (naam al gebruikt of niet geldig).',
      started: '{tokens} is begonnen op "{name}".',
      stopped: 'Tokens gestopt: {count}.',
      reset: 'Tokens keerden terug naar waar ze begonnen: {count}.',
      locked: 'Vergrendeld: {tokens} ({mode}).',
      unlocked: 'Ontgrendeld: {tokens}.',
      leaderSet: '{token} is de leider. Selecteer de volgers en klik op Volgen.',
      following: 'Volgt nu {leader} ({mode}): {tokens}.',
      unfollowed: 'Tokens volgen niet meer: {count}.',
      noRecordings: 'Er wordt niets opgenomen.',
      recordingCancelled: 'Opname "{name}" geannuleerd.',
      languages: 'Ondersteunde talen: {list}',
      settingChanged: '{setting} is nu {value}.',
      combatOn: 'Gevechten ingeschakeld.',
      combatOff: 'Gevecht uitgeschakeld.',
      calibrationCleared: 'Rasterkalibratie verwijderd van deze pagina.',
      calibrated: 'Raster gekalibreerd voor deze pagina (celgrootte × {scale}).',
      paused: 'Alle patrouilles stopten.',
      resumed: 'De patrouilles werden hervat.',
      journalRebuilt: 'Hand-outs herbouwd: {help} en {deck}.',
      markerStopped: 'Gestopt door een stopmarkering: {tokens}.',
      markerReset: 'Teruggestuurd naar waar ze begonnen door een stopmarkering: {tokens}.',
    },
    errors: {
      noTokens: 'Geen tokens geselecteerd.',
      noRouteName: 'Er is geen routenaam opgegeven.',
      routeNotFound: 'Er is geen route met de naam "{name}".',
      routeExists: 'Er bestaat al een route met de naam "{name}".',
      code: {
        empty: 'De stapcode is leeg.',
        badToken: 'De stapcode "{code}" bevat iets dat hij niet begrijpt bij "{at}".',
        tooFar: 'De stap "{at}" is te lang.',
      },
      routeInvalid: 'Die route kon niet worden opgeslagen.',
      usageAdd: 'Geef een naam en een stapcode op.',
      usageEdit: 'Geef een route en een nieuwe stapcode op.',
      selectOneDrawing:
        'Selecteer precies één tekening (een lijn, veelhoek, vorm uit de vrije hand, rechthoek of ellips).',
      drawingEmpty: 'De geselecteerde tekening heeft te weinig punten om te volgen.',
      usageRoute: 'Geef een route, een optie en een waarde.',
      unknownRouteOption: 'Er is geen routeoptie met de naam "{option}".',
      selectOneToken: 'Selecteer precies één token.',
      badRouteValue: '"{value}" is geen geldige waarde voor {option}.',
      usageRename: 'Geef een route en de nieuwe naam ervan.',
      usageCopy: 'Geef een route en een naam voor de kopie.',
      badJson: 'Dat is geen route-exporttekst.',
      tokenLocked: '{tokens} kan niet starten: vergrendeld.',
      tokenMarked: '{tokens} kan niet starten: ze hebben een stopmarkering.',
      outsideArea: '{tokens} kan niet starten: ze bevinden zich buiten "{name}".',
      selectOneArea:
        'Selecteer precies één gesloten tekening (een veelhoek, rechthoek, ellips of lus uit de vrije hand).',
      areaTooSmall:
        'De geselecteerde tekening heeft minimaal drie hoeken nodig om een gebied te vormen.',
      idsNotFound: "Er zijn geen tokens met deze ID's: {ids}.",
      routeOnOtherPage: '{tokens} kan niet starten: "{name}" is op een andere pagina getekend.',
      startOnOtherPage:
        '{tokens} kan niet starten: het vaste begin van "{name}" bevindt zich op een andere pagina.',
      routeFull: '{tokens} kan niet starten: "{name}" heeft al {max} tokens.',
      noPage: 'De pagina kon niet worden gevonden.',
      emptyTrack: '{tokens} kan niet starten: "{name}" heeft geen zetten.',
      leaderNotFound: 'Er is geen token met de naam "{name}" gevonden op deze pagina.',
      noLeader: 'Er is nog geen leider.',
      followLoop: '{tokens} kan geen token volgen dat hen volgt.',
      alreadyRecording: '{token} wordt al opgenomen.',
      recordingTokenGone: 'Het token voor de opname "{name}" bestaat niet meer.',
      recordingEmpty: 'Er is nog niets opgenomen.',
      unknownSetting: 'Er is geen instelling genaamd "{key}".',
      badSettingValue: '"{value}" is geen geldige waarde voor {key}.',
      calibrateNeedsTokens: 'Selecteer een of twee tokens die op celcentra zijn vastgemaakt.',
      calibrateFailed:
        'De geselecteerde tokens konden niet worden gebruikt om het raster te kalibreren.',
      unknownCommand: 'Onbekend commando "{command}".',
      gmOnly: 'Alleen de GM kan TokenController gebruiken.',
      internal: 'Er is iets misgegaan. Details staan in de API-console.',
    },
    hints: {
      noTokens: 'Selecteer eerst de tokens op de kaart.',
      noRouteName: 'Bijvoorbeeld: !tokencontroller voeg Guard Walk U2R2D2L2 toe',
      routeNotFound: 'Typ !tokencontroller list om alle routes te zien.',
      code: {
        empty: 'Bijvoorbeeld: U2R2D2L2',
        badToken:
          'Gebruik U, D, L, R, UL, UR, DL of DR met een aantal cellen, W om te wachten en S voor stealth.',
        tooFar: 'Een enkele stap kan maximaal 100 cellen bevatten; wacht maximaal 100 ticks.',
      },
      selectOneDrawing:
        'Teken de route met een tekengereedschap, selecteer deze (sleep een kader rond een dunne omtrek als u deze mist door te klikken) en probeer het opnieuw.',
      usageRoute: 'Opties: modus, interval, max, willekeurig, muren, start.',
      routeOnOtherPage: 'Getekende routes werken alleen op de pagina waarop ze getekend zijn.',
      startOnOtherPage: 'Wis de vaste start of verplaats het token eerst naar die pagina.',
      noLeader:
        'Selecteer de leider en klik op Leider, of geef de naam ervan: !tokencontroller follow Name',
      leaderNotFound: 'Gebruik de tokennaam precies zoals weergegeven op de kaart, of de token-ID.',
      badJson: 'Plak de tekst van !tokencontroller export (of v4 exportpaths) exact.',
      unknownSetting: 'Typ !tokencontroller set om alle instellingen te bekijken.',
      calibrateNeedsTokens:
        'Eén token lijnt het raster uit; twee tokens in aangrenzende cellen van een rij bepalen ook de celgrootte.',
      calibrateFailed:
        "Zorg ervoor dat de tokens zich in aangrenzende cellen van dezelfde rij bevinden (kolom op Hex (H)-pagina's).",
      unknownCommand: 'Typ !tokencontroller help voor de lijst met opdrachten.',
      tokenLocked: 'Ontgrendel eerst het token.',
      tokenMarked: 'Verwijder de markering of wijzig de instelling Stopmarkeringen.',
      outsideArea:
        'Verplaats de tokens eerst binnen het gebied of schakel Willekeurige start in voor de route.',
      selectOneArea:
        'Teken het gebied met een tekengereedschap, selecteer het (sleep een kader rond een dunne omtrek als u er niet op klikt) en probeer het opnieuw.',
      idsNotFound: "Geef token-ID's op na --ids, gescheiden door puntkomma's.",
    },
    warnings: {
      idsNotFound: "Er zijn geen tokens met deze ID's, dus deze zijn overgeslagen: {ids}.",
      offPage:
        'Een deel van de route loopt buiten de pagina (stappen: {count}). Die stappen worden overgeslagen.',
      combatTrackerOnly:
        'Gevechtsdetectie is ingesteld op de beurttracker, dus deze schakelaar heeft geen effect totdat je deze wijzigt.',
      unitPx:
        'Versie 5 leest de celgrootte van elke pagina, dus de oude instelling Pixels Per Unit wordt niet langer gebruikt. Als tokens niet op één lijn staan, gebruik dan !tokencontroller calibrate.',
    },
    values: {
      on: 'Op',
      off: 'Uit',
      none: 'Geen',
      default: 'Standaard',
      noLimit: 'Geen limiet',
      ms: '{ms} ms',
      andMore: 'en nog {count} meer',
      following: 'volgt {leader}',
      locked: 'vergrendeld',
      gridless: 'geen knappen',
      grid: {
        square: 'Vierkant',
        hex: 'Hex',
        iso: 'Isometrisch/dimetrisch',
      },
      mode: {
        loop: 'Lus',
        pingpong: 'Heen en weer',
        once: 'Eenmaal',
      },
      movement: {
        cell: 'Eén cel tegelijk',
        segment: 'Hele stap tegelijk',
      },
      facing: {
        off: 'Draai niet',
        up: 'Kunst is naar boven gericht',
        down: 'Kunst is naar beneden gericht',
        left: 'Kunst gezichten naar links',
        right: 'Kunst kijkt naar rechts',
      },
      combatDetection: {
        tracker: 'Turn-tracker',
        manual: 'GM-schakelaar',
        both: 'Turntracker of GM-schakelaar',
      },
      combatBehaviour: {
        pause: 'Pauze',
        step: 'Verplaats elke beurt',
        ignore: 'Blijf in beweging',
      },
      lockMode: {
        native: 'Positievergrendeling van Roll20',
        revert: 'Zet ongedaan maken',
        freeze: 'Houd alleen stil',
      },
      followMode: {
        trail: 'Enkel bestand',
        formation: 'Vorming',
      },
      manualMove: {
        continue: 'Ga vanaf daar verder',
        stop: 'Stop de patrouille',
      },
      markerAction: {
        stop: 'Stop waar het is',
        reset: 'Ga terug naar het begin',
      },
      wallMode: {
        ignore: 'Loop door muren',
        hold: 'Wacht bij muren',
        turn: 'Keer terug bij muren',
      },
      wallCheck: {
        centre: 'Midden van het token',
        width: 'Hele teken',
      },
      oneWayWalls: {
        block: 'Blok',
        pass: 'Doorlaten',
      },
      transparentWalls: {
        block: 'Blok',
        pass: 'Doorlaten',
      },
    },
    menu: {
      statusRunning: 'Patrouillerende tokens: {patrols}. Routes: {routes}.',
      statusPaused: 'Alle patrouilles worden onderbroken.',
      statusCombat: {
        pause: 'In gevecht: patrouilles worden gepauzeerd.',
        step: 'In de strijd: patrouilles verplaatsen zich elke beurt.',
      },
      routes: 'Routes',
      noRoutes:
        'Nog geen trajecten. Voeg er een toe, teken er een, neem er een op of voeg de voorbeelden toe.',
      create: 'Nieuwe route',
      selected: 'Geselecteerde tokens',
      tools: 'Hulpmiddelen',
      recordings: 'Opnames',
      patrols: 'Patrouilles',
    },
    buttons: {
      start: 'Begin',
      stop: 'Stop',
      add: 'Stapcode',
      draw: 'Van tekening',
      bounce: 'Stuitergebied',
      record: 'Dossier',
      examples: 'Voorbeelden',
      reset: 'Opnieuw instellen',
      lock: 'Slot',
      unlock: 'Ontgrendelen',
      leader: 'Leider',
      follow: 'Volgen',
      unfollow: 'Ontvolgen',
      resume: 'Hervatten',
      pause: 'Pauzeer alles',
      combatOn: 'Gevecht aan',
      combatOff: 'Gevecht uit',
      stopAll: 'Stop alles',
      settings: 'Instellingen',
      status: 'Status',
      help: 'Hulp',
      open: 'Open',
      clearStart: 'Duidelijk',
      setStart: 'Stel in op Geselecteerd',
      edit: 'Code bewerken',
      rename: 'Hernoemen',
      copy: 'Kopiëren',
      export: 'Exporteren',
      remove: 'Verwijderen',
      menu: 'Menu',
      wait: 'Wachten',
      stealth: 'Stealth',
      undo: 'Ongedaan maken',
      save: 'Redden',
      cancel: 'Annuleren',
      confirm: 'Ja, verwijder het',
      startRoute: 'Route starten',
      list: 'Lijst routes',
      calibrate: 'Kalibreren',
    },
    prompts: {
      name: 'Routenaam',
      code: 'Stapcode',
      interval: 'Milliseconden per stap (0 = standaard)',
      maxTokens: 'De meeste tokens tegelijk (0 = geen limiet)',
      newName: 'Nieuwe naam',
      route: 'Routenaam',
    },
    route: {
      drawn: 'Getekende route, {points} punten',
      recorded: 'Opgenomen route, {points} punten',
      area: 'Stuiteergebied, {points} hoeken',
      path: 'Pad',
      mode: 'Modus',
      interval: 'Interval',
      maxTokens: 'De meeste tokens',
      randomStart: 'Willekeurig begin',
      walls: 'Muren',
      start: 'Vast begin',
      tokens: 'Tokens',
    },
    record: {
      title: 'Opname "{name}"',
      intro:
        'Opnemen van {token} (gaat tot nu toe: {count}). Klik op de pijlen of sleep het token op de kaart; elke beweging wordt geregistreerd.',
    },
    settings: {
      interval: {
        label: 'Interval',
        desc: 'Milliseconden tussen stappen. Elke route kan deze overschrijven.',
      },
      movement: {
        label: 'Beweging',
        desc: 'cel beweegt één cel per stap; segment verplaatst een hele stap (zoals U3) in één keer, zoals versie 4 deed.',
      },
      facing: {
        label: 'Draaifiches',
        desc: 'Draai de fiches naar de richting waar ze naartoe gaan: uit, of in de richting waarin de fichekunst wijst (omhoog, omlaag, links of rechts).',
      },
      combatDetection: {
        label: 'Gevechtsdetectie',
        desc: 'Hoe gevechten worden opgemerkt: tracker (de beurttracker is open met iemand erin), handmatig (de gevechtsaan/uit-knoppen) of beide.',
      },
      combatBehaviour: {
        label: 'Gevechtsgedrag',
        desc: 'Wat patrouilles doen in een gevecht: pauzeren, stappen (één keer bewegen elke keer dat de beurt voorbij is) of negeren (blijven bewegen).',
      },
      lockMode: {
        label: 'Vergrendelmodus',
        desc: "Hoe Lock een token vasthoudt: native (Roll20's eigen positievergrendeling, zodat niemand het kan slepen), terugdraaien (zetten worden ongedaan gemaakt) of bevriezen (het stopt met patrouilleren en volgen, maar kan nog steeds worden gesleept).",
      },
      lockMarker: {
        label: 'Vergrendelmarkering',
        desc: 'Statusmarkering weergegeven op vergrendelde tokens, of geen. Spelers kunnen markeringen zien.',
      },
      followMode: {
        label: 'Volg modus',
        desc: 'spoor: volgers lopen in één rij in de voetsporen van de leider. formatie: volgers behouden hun plaats rondom de leider (sleep een volger om van plaats te veranderen).',
      },
      manualMove: {
        label: 'Een patrouille slepen',
        desc: 'Als je een patrouillefiche versleept: ga verder (de route gaat verder vanaf het punt waar je hem hebt laten vallen) of stop (de patrouille eindigt).',
      },
      stopMarkers: {
        label: 'Stopmarkeringen',
        desc: "Statusmarkeringen die een fiche van zijn route halen en hem ervan weerhouden deze te volgen, gescheiden door puntkomma's (bijvoorbeeld dood;rood), of geen. Volgers van een leider met een van deze markeringen stoppen ook.",
      },
      markerAction: {
        label: 'Markeractie stoppen',
        desc: 'Wat een patrouillefiche doet als het een stopmarkering krijgt: stoppen (het blijft waar het is) of resetten (het gaat terug naar waar het begon).',
      },
      wallMode: {
        label: 'Muren',
        desc: 'Wat patrouilles en volgers doen bij dynamische lichtmuren en gesloten deuren en ramen: negeren (doorlopen), vasthouden (wachten tot de weg vrij is, bijvoorbeeld tot een deur opengaat) of draaien (patrouilles keren terug). Elke route kan zijn eigen route kiezen, zodat geesten nog steeds door muren kunnen lopen.',
      },
      wallCheck: {
        label: 'Muurcontrole',
        desc: 'midden: alleen het midden van een fiche mag vrij blijven van muren. breedte: het hele token doet dat, dus een groot token kan niet door een nauwe opening wurmen.',
      },
      oneWayWalls: {
        label: 'Eenrichtingsmuren',
        desc: 'Of eenrichtingsmuren tokens tegenhouden (blokkeren) of niet (passeren).',
      },
      transparentWalls: {
        label: 'Doorzichtige muren',
        desc: 'Of het nu gaat om transparante muren, die licht doorlaten, tokens tegenhouden (blokkeren) of niet (passeren).',
      },
      buttonStep: {
        label: 'Cellen per klik',
        desc: 'Hoe ver de opnamepijlen een fiche verplaatsen.',
      },
      language: {
        label: 'Taal',
        desc: "Taal voor menu's, berichten en hand-outs.",
      },
    },
    status: {
      routes: 'Routes',
      patrols: 'Patrouillerende tokens',
      followers: 'Volgende tokens',
      locked: 'Vergrendelde tokens',
      recordings: 'Opnames',
      paused: 'Gepauzeerd',
      combat: 'Gevecht',
      page: 'Huidige pagina',
      grid: 'Rooster',
      cell: 'Celgrootte',
      calibration: 'Kalibratie',
    },
    help: {
      menu: 'Laat de menukaart zien.',
      start: 'Plaats de geselecteerde tokens op een route.',
      stop: 'Stop de geselecteerde tokens (patrouilles en volgelingen), elk token op een route, of allemaal.',
      reset: 'Leg de tokens terug op de plek waar ze begonnen zijn en stop ze.',
      pause: 'Pauzeer of hervat elke patrouille.',
      lock: 'Houd de geselecteerde tokens op hun plaats of laat ze los.',
      leader: 'Kies het geselecteerde token als de leider die je moet volgen.',
      follow: 'Laat de geselecteerde tokens de leider volgen, of een token met een naam.',
      unfollow: 'Stop met het volgen van de geselecteerde tokens.',
      add: 'Maak een route op basis van een stapcode, zoals U2R2D2L2.',
      edit: 'Wijzig de stapcode van een route.',
      draw: 'Maak een route die de geselecteerde tekening op deze pagina volgt.',
      bounce:
        'Creëer een route waarop tokens binnen de geselecteerde gesloten tekening dwalen en tegen de randen stuiteren.',
      record:
        'Leg een route vast door het geselecteerde token met knoppen te verplaatsen of door het te slepen.',
      route: 'Wijzig een routeoptie: modus, interval, max, willekeurig, muren of start.',
      show: 'Toon de details en knoppen van een route.',
      rename: 'De naam van een route wijzigen.',
      copy: 'Kopieer een route onder een nieuwe naam.',
      remove: 'Verwijder een route (vraag eerst).',
      ids: "Handel op de tokens met deze ID's in plaats van op de geselecteerde, zodat andere Mods zoals ScriptCards tokens kunnen controleren. verwijder --ids haalt de tokens van hun routes; het verwijdert nooit een route.",
      list: 'Maak een lijst van de routes of de tokens die worden gecontroleerd.',
      examples: 'Voeg de voorbeeldroutes toe.',
      export: 'Toon routes als tekst om naar een ander spel te kopiëren.',
      import: 'Routes toevoegen vanuit exporttekst.',
      combat: 'Schakel gevechten met de hand in of uit.',
      set: 'Wijzig een instelling of toon alle instellingen.',
      calibrate:
        'Lijn het raster uit met tokens die in het midden van de cellen zijn vastgeklikt, of verwijder de kalibratie.',
      status: 'Laat zien wat de Mod doet en hoe hij deze pagina ziet.',
      journal: 'Herbouw de Help- en Command Deck-hand-outs.',
      help: 'Laat deze lijst zien.',
      footer:
        'Volledige instructies vindt u in de uitreikblad "{help}"; knoppen bevinden zich in "{deck}". {legacy} werkt nog steeds met de opdrachten van versie 4.',
    },
    handout: {
      versionLabel: 'Versie',
      subtitle: 'Patrouilles, volgers en sloten voor Jumpgate- en Legacy-spellen',
      overview: {
        heading: 'Overzicht',
        body: "TokenController verplaatst tokens voor u. Geef een bewaker een patrouilleroute, laat een kar de chauffeur volgen of zet een standbeeld op zijn plaats. Routes kunnen worden getypt als een stapcode, getraceerd vanaf een tekening op de kaart of vastgelegd door een token te verplaatsen. Routes werken op vierkante, hex, isometrische, dimetrische en rasterloze pagina's.",
      },
      quickStart: {
        heading: 'Snel beginnen',
        steps: [
          'Open het Command Deck-hand-out of typ !tokencontroller voor het menu.',
          'Klik op Voorbeelden om enkele kant-en-klare routes toe te voegen, of op Stapcode om uw eigen routes te typen (bijvoorbeeld U2R2D2L2).',
          'Selecteer een of meerdere tokens en klik op Start naast een route.',
          'Selecteer een token en klik op Stoppen om het te stoppen, of op Reset om het terug te sturen naar waar het begon.',
        ],
      },
      routes: {
        heading: 'Routes maken',
        points: [
          'Stapcode: typ bewegingen zoals U2R2D2L2. Codes zijn niet gebonden aan een plaats op de kaart, dus dezelfde route werkt overal.',
          'Uit tekening: teken een lijn, veelhoek, vorm uit de vrije hand, rechthoek of ellips met de tekengereedschappen, selecteer deze en klik op Uit tekening. Tokens lopen erlangs, alleen op die pagina. Je kunt de tekening achteraf verwijderen.',
          'Opnemen: selecteer een token en klik op Opnemen. Verplaats het met de pijlknoppen of sleep het over de kaart (Roll20-waypoints worden gevolgd) en klik vervolgens op Opslaan. Op vierkante rasters wordt de opname een stapcode die u kunt bewerken.',
          'Lusroutes beginnen opnieuw vanaf het begin; heen en weer routes lopen terug zoals ze gekomen zijn; zodra routes aan het einde stoppen. Nieuwe routes die eindigen waar ze beginnen, lus; anderen gaan heen en weer.',
          'Stuiteringsgebied: teken een gesloten vorm rond het gebied, selecteer deze en klik op Stuiteringsgebied. Tokens die erop zijn begonnen, reizen in rechte lijnen en stuiteren tegen de randen (en tegen muren, tenzij de route ze negeert), waarbij ze elke keer een beetje willekeurig draaien. Willekeurige start plaatst elk token in een willekeurige cel van het gebied.',
        ],
      },
      codes: {
        colCode: 'Code',
        colMeaning: 'Betekenis',
        move: 'Ga één cel omhoog, omlaag, naar links of naar rechts.',
        diagonal: 'Beweeg diagonaal.',
        distance: 'Een getal na een richting verplaatst zoveel cellen.',
        face: 'Draai je om in een richting te kijken zonder te bewegen (je hebt beurtfiches nodig).',
        wait: 'Wacht één stap of het opgegeven aantal stappen.',
        stealth:
          'Verplaats het token tussen de tokenlaag en de GM-laag, zodat het verdwijnt en weer verschijnt.',
      },
      routeOptions: {
        heading: 'Route-opties',
        colOption: 'Optie',
        colMeaning: 'Betekenis',
        mode: 'lus, pingpong (heen en weer) of één keer.',
        interval: 'Milliseconden per stap voor deze route, of 0 voor het globale interval.',
        max: 'De meeste tokens die tegelijk op de route kunnen liggen, of 0 voor geen limiet.',
        random: 'op: elk token begint op een willekeurig punt langs de route.',
        walls:
          'negeren (door muren lopen), vasthouden (wachten bij muren en gesloten deuren), draaien (terugdraaien) of standaard (gebruik de instelling Muren).',
        start:
          'set: tokens springen naar de positie van het geselecteerde token wanneer ze starten. duidelijk: ze beginnen waar ze staan.',
      },
      tokens: {
        heading: 'Tokens beheren',
        points: [
          'Een token bevindt zich op één route tegelijk. Als u hem op een andere route start, vervangt u de eerste.',
          'Stop laat fiches achter waar ze zijn. Met Reset worden ze teruggezet waar ze waren voordat ze begonnen, op hun originele laag.',
          'Het slot houdt een token op zijn plaats. Vergrendelde tokens patrouilleren of volgen niet totdat ze ontgrendeld zijn.',
          'Volgen: selecteer de leider en klik op Leider, selecteer vervolgens de volgers en klik op Volgen. Je kunt ook de naam van de leider typen: !tokencontroller volg Goblin Boss. Volgers volgen tokens die patrouilleren, tokens die je sleept en tokens die door TokenMod worden verplaatst.',
          'Volgers kunnen andere volgers volgen, waardoor een ketting of een kolom ontstaat.',
          'Door een patrouillefiche te slepen, gaat de patrouille verder vanaf het punt waar je hem neerzet, tenzij het slepen van een patrouille stopt.',
          'Muren: als de Muren zijn ingeschakeld, lopen patrouilles en volgers niet door dynamische verlichtingsmuren of gesloten deuren en ramen; open deuren en ramen laten ze door. Geef een route een eigen muuroptie (bijvoorbeeld negeren vanwege een geest).',
          'Stopmarkeringen: een fiche die één van deze statusmarkeringen krijgt (bijvoorbeeld dood), verlaat zijn route en stopt met volgen, en de volgers van een leider die één stop krijgen ook. Stel ze in met !tokencontroller set stopMarkers dead;red. Dit werkt ook als een andere Mod de markering toevoegt.',
        ],
      },
      grids: {
        heading: 'Rasters',
        points: [
          "De celgrootte en het rastertype worden van elke pagina gelezen, zodat verschillende pagina's verschillende rasters kunnen gebruiken.",
          'U en D betekenen altijd omhoog en omlaag op het scherm. Op hex-rasters, bewegingen zonder bijpassende buurzigzag; op isometrische en dimetrische rasters kruisen diagonalen één ruit.',
          "Pagina's waarvoor uitlijnen is uitgeschakeld, verplaatsen zich in stappen van 70 pixels, zonder dat ze in een raster worden uitgelijnd.",
          'Als tokens van het raster afdrijven, plaats dan een token in het midden van een cel, selecteer het en klik op Kalibreren. Selecteer twee tokens in aangrenzende cellen van een rij om ook de celgrootte vast te stellen.',
        ],
      },
      combat: {
        heading: 'Gevecht',
        points: [
          'Gevechtsdetectie bepaalt hoe gevechten worden opgemerkt: de beurttracker, de gevechtsaan/uit-knoppen of een van beide.',
          'Gevechtsgedrag bepaalt wat patrouilles doen: pauzeren, elke keer dat de beurt voorbijgaat een stap zetten of in beweging blijven.',
          'Pause All stopt elke patrouille op elk moment; Hervatten begint ze opnieuw.',
        ],
      },
      commands: {
        heading: "Commando's",
        intro:
          'Alleen GM\'s kunnen deze commando\'s gebruiken. Routes kunnen een naam krijgen of er kan naar worden verwezen met hun #id via de menuknoppen. Plaats namen met spaties tussen "aanhalingstekens" als een commando twee namen heeft.',
        mods: "Andere Mods kunnen deze commando's ook verzenden, bijvoorbeeld vanuit ScriptCards. Ze kunnen geen tokens selecteren, dus geven ze ze de naam --ids gevolgd door token-ID's gescheiden door puntkomma's: !tc stop --ids ID1;ID2. De antwoorden gaan naar de GM.",
        colCommand: 'Commando',
        colDesc: 'Wat het doet',
      },
      settings: {
        heading: 'Instellingen',
        intro:
          'Wijzig de instellingen vanuit het menu, met !tokencontroller set <setting> <value>, of op de Mod-instellingenpagina in het API Scripts-scherm.',
        colKey: 'Sleutel',
        colName: 'Instelling',
        colDesc: 'Beschrijving',
      },
      upgrading: {
        heading: 'Upgraden vanaf versie 4',
        points: [
          'Paden, patrouillefiches, sloten, volgers en onvoltooide concepten worden bewaard. Concepten worden routes die eindigen op "(concept)".',
          'Uw versie 4-instellingen blijven behouden: interval, substappen, rotatie, gevechtspatrouille en eenheden per klik.',
          "De opdrachten !tc en !token-control en de macro's T-Cntrl_ blijven werken. De tabel toont de nieuwe commando's.",
          'Versie 4 stuurde na elke actie het hele menu; versie 5 stuurt in plaats daarvan een kort antwoord.',
          'De instelling Pixels Per Unit is verdwenen: de celgrootte komt van elke pagina. HTML Builder is niet langer nodig.',
          "De oude gebruiksgids, die elke speler kon zien, is vervangen door deze alleen voor GM's.",
        ],
        colV4: 'Versie 4',
        colV5: 'Versie 5',
      },
      troubleshooting: {
        heading: 'Problemen oplossen',
        points: [
          'Tokens bewegen niet: controleer Status. Patrouilles wachten terwijl ze zijn gepauzeerd, terwijl ze zijn vergrendeld, en tijdens gevechten wanneer het gevechtsgedrag is gepauzeerd.',
          'Tokens verplaatsen zich over de verkeerde afstand: de rastergrootte of de snapping van de pagina is mogelijk veranderd; probeer Kalibreren.',
          'Een getekende route start niet: getekende routes werken alleen op de pagina waarop ze getekend zijn.',
          'Volgers bewegen niet wanneer een andere Mod de leider verplaatst: alleen TokenMod rapporteert zijn bewegingen. Andere Mods kunnen TokenController.ObserveTokenChange aanroepen.',
          'Meld problemen op het Roll20-forum met eventuele berichten van de API-console.',
        ],
      },
      languages: {
        heading: 'Talen',
        body: 'TokenController is vertaald in de onderstaande talen. Kies er een met de taalinstelling.',
        colCode: 'Code',
        colName: 'Taal',
        colNative: 'Inheemse naam',
      },
      credits: {
        heading: 'Kredieten',
        original: 'Originele mod door',
        maintainer: 'Versie 5 onderhouden door',
        support: 'Rapporteer bugs en ideeën op het Roll20 Mod-forum of op GitHub.',
      },
      footer: 'Knoppen voor elke actie staan in de uitreikblad "{deck}".',
    },
    deck: {
      subtitle: 'Commandodek',
      patrolsDesc: 'Patrouilles starten, stoppen en pauzeren. Selecteer eerst tokens.',
      createDesc:
        'Maak routes vanuit een stapcode, een tekening of door het vastleggen van een token.',
      selectedDesc: 'Vergrendel tokens of laat ze een leider volgen.',
      toolsDesc: 'Gevechten, instellingen en rastertools.',
      footer: 'Volledige instructies vindt u in de uitreikblad "{help}".',
    },
  };

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
      markerStopped: 'Stopped by a Stop Marker: {tokens}.',
      markerReset: 'Sent back to where they started by a Stop Marker: {tokens}.',
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
      tokenMarked: '{tokens} cannot start: they have a Stop Marker.',
      outsideArea: '{tokens} cannot start: they are outside "{name}".',
      selectOneArea:
        'Select exactly one closed drawing (a polygon, rectangle, ellipse or freehand loop).',
      areaTooSmall: 'The selected drawing needs at least three corners to make an area.',
      idsNotFound: 'No tokens have these IDs: {ids}.',
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
      usageRoute: 'Options: mode, interval, max, random, walls, start.',
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
      tokenMarked: 'Remove the marker, or change the Stop Markers setting.',
      outsideArea: 'Move the tokens inside the area first, or turn on Random start for the route.',
      selectOneArea:
        'Draw the area with a drawing tool, select it (drag a box around a thin outline if clicking misses it), then try again.',
      idsNotFound: 'Give token IDs after --ids, separated by semicolons.',
    },
    warnings: {
      idsNotFound: 'No tokens have these IDs, so they were skipped: {ids}.',
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
      markerAction: {
        stop: 'Stop where it is',
        reset: 'Go back to the start',
      },
      wallMode: {
        ignore: 'Walk through walls',
        hold: 'Wait at walls',
        turn: 'Turn back at walls',
      },
      wallCheck: {
        centre: 'Centre of the token',
        width: 'Whole token',
      },
      oneWayWalls: {
        block: 'Block',
        pass: 'Let through',
      },
      transparentWalls: {
        block: 'Block',
        pass: 'Let through',
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
      bounce: 'Bounce Area',
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
      area: 'Bounce area, {points} corners',
      path: 'Path',
      mode: 'Mode',
      interval: 'Interval',
      maxTokens: 'Most tokens',
      randomStart: 'Random start',
      walls: 'Walls',
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
      stopMarkers: {
        label: 'Stop Markers',
        desc: 'Status markers that take a token off its route and stop it following, separated by semicolons (for example dead;red), or none. Followers of a leader with one of these markers stop too.',
      },
      markerAction: {
        label: 'Stop Marker Action',
        desc: 'What a patrolling token does when it gets a Stop Marker: stop (it stays where it is) or reset (it goes back to where it started).',
      },
      wallMode: {
        label: 'Walls',
        desc: 'What patrols and followers do at dynamic lighting walls and closed doors and windows: ignore (walk through), hold (wait until the way is clear, for example until a door opens) or turn (patrols turn back). Each route can choose its own, so ghosts can still walk through walls.',
      },
      wallCheck: {
        label: 'Wall Check',
        desc: 'centre: only the middle of a token has to stay clear of walls. width: the whole token does, so a large token cannot squeeze through a narrow gap.',
      },
      oneWayWalls: {
        label: 'One-Way Walls',
        desc: 'Whether one-way walls stop tokens (block) or not (pass).',
      },
      transparentWalls: {
        label: 'See-Through Walls',
        desc: 'Whether transparent walls, which let light through, stop tokens (block) or not (pass).',
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
      bounce:
        'Create a route on which tokens wander inside the selected closed drawing, bouncing off its edges.',
      record: 'Record a route by moving the selected token with buttons or by dragging it.',
      route: 'Change a route option: mode, interval, max, random, walls or start.',
      show: "Show a route's details and buttons.",
      rename: 'Rename a route.',
      copy: 'Copy a route under a new name.',
      remove: 'Remove a route (asks first).',
      ids: 'Act on the tokens with these IDs instead of the selected ones, so other Mods such as ScriptCards can control tokens. remove --ids takes the tokens off their routes; it never removes a route.',
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
          'Bounce Area: draw a closed shape around the area, select it and click Bounce Area. Tokens started on it travel in straight lines and bounce off its edges (and off walls, unless the route ignores them), turning a little at random each time. Random start puts each token in a random cell of the area.',
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
        walls:
          'ignore (walk through walls), hold (wait at walls and closed doors), turn (turn back) or default (use the Walls setting).',
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
          'Walls: with the Walls setting on, patrols and followers do not walk through dynamic lighting walls or closed doors and windows; open doors and windows let them through. Give a route its own walls option (for example ignore for a ghost).',
          'Stop Markers: a token that gets one of these status markers (for example dead) leaves its route and stops following, and the followers of a leader that gets one stop too. Set them with !tokencontroller set stopMarkers dead;red. This also works when another Mod adds the marker.',
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
        mods: 'Other Mods can send these commands too, for example from ScriptCards. They cannot select tokens, so they name them with --ids followed by token IDs separated by semicolons: !tc stop --ids ID1;ID2. Replies go to the GM.',
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
        colCode: 'Code',
        colName: 'Language',
        colNative: 'Native name',
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

  const TRANSLATION$g = {
    titles: {
      ready: 'TokenController on valmis.',
      settings: 'TokenController-asetukset',
      help: 'TokenController-komennot',
      export: 'Reitin vienti',
      routes: 'Reitit',
      tokens: 'Hallitut Tokenit',
      status: 'TokenControllerin tila',
    },
    messages: {
      migrated:
        'Päivitetty versiosta 4. Säilytetyt reitit: {routes}. Säilytetyt partiointitunnukset: {patrols}. Vanhat makrot ja !tc-komennot toimivat edelleen.',
      removedGuide:
        'Vanha "TokenController Usage Guide" -moniste, jonka pelaajat näkivät, korvattiin GM-apumonisteella.',
      pruned: 'Partiot unohdettu, koska heidän tunnuksiaan ei enää ole: {count}.',
      readyHint: 'Kirjoita valikkoon !tokencontroller tai avaa Command Deck -moniste.',
      combatStarted: {
        pause: 'Taistelu on alkanut: partiot keskeytetään, kunnes se päättyy.',
        step: 'Taistelu on alkanut: partiot liikkuvat yhden askeleen jokaisella kierroksella.',
      },
      combatEnded: 'Taistelu on ohi: partiot jatkavat.',
      routeAdded: 'Reitti "{name}" lisätty ({mode}).',
      routeUpdated: 'Reitti "{name}" päivitetty. Siinä olevat merkit jatkavat uutta reittiä.',
      confirmRemove:
        'Poistetaanko reitti "{name}"? Siinä olevat merkit, jotka pysähtyvät: {count}.',
      routeRemoved: 'Reitti "{name}" poistettu. Tokenit pysäytetty: {count}.',
      routeRenamed: 'Reitti "{from}" nimettiin uudelleen muotoon "{to}".',
      examplesAdded: 'Lisätty esimerkkireitit: {count}.',
      exportHint: 'Kopioi alla oleva teksti ja liitä se {command} jälkeen mihin tahansa peliin.',
      imported: 'Tuodut {added} reitit; ohitettu {skipped} (nimi on jo käytössä tai ei kelpaa).',
      started: '{tokens} alkoi "{name}".',
      stopped: 'Tokenit pysäytetty: {count}.',
      reset: 'Tokenit palasivat alkuun: {count}.',
      locked: 'Lukittu: {tokens} ({mode}).',
      unlocked: 'Avattu: {tokens}.',
      leaderSet: '{token} on johtaja. Valitse seuraajat ja napsauta Seuraa.',
      following: 'Nyt seuraa {leader} ({mode}): {tokens}.',
      unfollowed: 'Tunnuksia ei enää seurata: {count}.',
      noRecordings: 'Mitään ei tallenneta.',
      recordingCancelled: 'Tallennus "{name}" peruutettu.',
      languages: 'Tuetut kielet: {list}',
      settingChanged: '{setting} on nyt {value}.',
      combatOn: 'Taistelu kytketty päälle.',
      combatOff: 'Taistelu kytketty pois päältä.',
      calibrationCleared: 'Verkkokalibrointi poistettu tältä sivulta.',
      calibrated: 'Tälle sivulle kalibroitu ruudukko (solun koko × {scale}).',
      paused: 'Kaikki partiot pysähtyivät.',
      resumed: 'Partioita jatkettiin.',
      journalRebuilt: 'Uudelleen rakennetut monisteet: {help} ja {deck}.',
      markerStopped: 'Pysäytysmerkin pysäyttämä: {tokens}.',
      markerReset: 'Pysäytysmerkinnän lähettämä takaisin aloituspaikkaan: {tokens}.',
    },
    errors: {
      noTokens: 'Tunnuksia ei ole valittu.',
      noRouteName: 'Reitin nimeä ei ole annettu.',
      routeNotFound: 'Ei ole reittiä nimeltä "{name}".',
      routeExists: 'Reitti nimeltä "{name}" on jo olemassa.',
      code: {
        empty: 'Vaihekoodi on tyhjä.',
        badToken: 'Vaihekoodissa "{code}" on jotain, jota se ei ymmärrä osoitteessa "{at}".',
        tooFar: 'Vaihe "{at}" on liian pitkä.',
      },
      routeInvalid: 'Reittiä ei voitu tallentaa.',
      usageAdd: 'Anna nimi ja vaihekoodi.',
      usageEdit: 'Anna reitti ja uusi askelkoodi.',
      selectOneDrawing:
        'Valitse täsmälleen yksi piirros (viiva, monikulmio, vapaamuotoinen muoto, suorakulmio tai ellipsi).',
      drawingEmpty: 'Valitussa piirustuksessa on liian vähän seurattavia kohtia.',
      usageRoute: 'Anna reitti, vaihtoehto ja arvo.',
      unknownRouteOption: 'Ei ole reittivaihtoehtoa nimeltä "{option}".',
      selectOneToken: 'Valitse täsmälleen yksi merkki.',
      badRouteValue: '"{value}" ei ole kelvollinen arvo kohteelle {option}.',
      usageRename: 'Anna reitti ja sen uusi nimi.',
      usageCopy: 'Anna kopiolle reitti ja nimi.',
      badJson: 'Se ei ole reitin vientiteksti.',
      tokenLocked: '{tokens} ei käynnisty: lukittu.',
      tokenMarked: '{tokens} ei voi käynnistyä: niissä on pysäytysmerkki.',
      outsideArea: '{tokens} ei voi alkaa: ne ovat kohteen "{name}" ulkopuolella.',
      selectOneArea:
        'Valitse täsmälleen yksi suljettu piirros (monikulmio, suorakulmio, ellipsi tai vapaakäden silmukka).',
      areaTooSmall:
        'Valitussa piirustuksessa tarvitaan vähintään kolme kulmaa alueen muodostamiseksi.',
      idsNotFound: 'Millään tunnuksilla ei ole näitä tunnuksia: {ids}.',
      routeOnOtherPage: '{tokens} ei voi alkaa: "{name}" piirrettiin toiselle sivulle.',
      startOnOtherPage: '{tokens} ei voi alkaa: "{name}" -kohdan kiinteä alku on toisella sivulla.',
      routeFull: '{tokens} ei voi alkaa: "{name}" sisältää jo {max} tunnuksia.',
      noPage: 'Sivua ei löytynyt.',
      emptyTrack: '{tokens} ei voi käynnistyä: "{name}" ei sisällä liikettä.',
      leaderNotFound: 'Tältä sivulta ei löytynyt tunnusta nimeltä "{name}".',
      noLeader: 'Johtajaa ei vielä ole.',
      followLoop: '{tokens} ei voi seurata niitä seuraavaa merkkiä.',
      alreadyRecording: '{token} on jo tallennettu.',
      recordingTokenGone: 'Tallennustunnusta "{name}" ei enää ole.',
      recordingEmpty: 'Mitään ei ole vielä tallennettu.',
      unknownSetting: 'Ei ole asetusta nimeltä "{key}".',
      badSettingValue: '"{value}" ei ole kelvollinen arvo kohteelle {key}.',
      calibrateNeedsTokens: 'Valitse yksi tai kaksi solukeskuksiin napsautettua merkkiä.',
      calibrateFailed: 'Valittuja tunnuksia ei voitu käyttää ruudukon kalibrointiin.',
      unknownCommand: 'Tuntematon komento "{command}".',
      gmOnly: 'Vain GM voi käyttää TokenControlleria.',
      internal: 'Jotain meni pieleen. Yksityiskohdat ovat API-konsolissa.',
    },
    hints: {
      noTokens: 'Valitse ensin merkit kartalta.',
      noRouteName: 'Esimerkki: !tokencontroller add Guard Walk U2R2D2L2',
      routeNotFound: 'Näet kaikki reitit kirjoittamalla !tokencontroller list.',
      code: {
        empty: 'Esimerkiksi: U2R2D2L2',
        badToken: 'Käytä U, D, L, R, UL, UR, DL tai DR useilla soluilla, W odottaa ja S salaa.',
        tooFar: 'Yksi vaihe voi olla enintään 100 solua; odottaa enintään 100 tikkua.',
      },
      selectOneDrawing:
        'Piirrä reitti piirtotyökalulla, valitse se (vetämällä laatikko ohuen ääriviivan ympärille, jos se ei napsauttakaan), yritä sitten uudelleen.',
      usageRoute: 'Vaihtoehdot: tila, intervalli, maksimi, satunnainen, seinät, aloitus.',
      routeOnOtherPage: 'Piirretyt reitit toimivat vain sillä sivulla, jolle ne on piirretty.',
      startOnOtherPage: 'Tyhjennä kiinteä aloitus tai siirrä merkki tälle sivulle ensin.',
      noLeader:
        'Valitse johtaja ja napsauta Leader tai anna sille nimi: !tokencontroller follow Name',
      leaderNotFound:
        'Käytä tunnuksen nimeä täsmälleen kuten kartalla näkyy, tai sen tunnuksen tunnusta.',
      badJson: 'Liitä teksti !tokencontroller exportista (tai v4-vientipoluista) tarkasti.',
      unknownSetting: 'Näet kaikki asetukset kirjoittamalla !tokencontroller set.',
      calibrateNeedsTokens:
        'Yksi merkki rivittää ruudukon; kaksi merkkiä rivin viereisissä soluissa korjaa myös solun koon.',
      calibrateFailed:
        'Varmista, että tunnukset ovat saman rivin viereisissä soluissa (sarake Hex (H) -sivuilla).',
      unknownCommand: 'Kirjoita komentoluetteloon !tokencontroller help.',
      tokenLocked: 'Avaa tunnuksen lukitus ensin.',
      tokenMarked: 'Poista merkki tai muuta Stop Markers -asetusta.',
      outsideArea:
        'Siirrä ensin merkit alueen sisällä tai ota käyttöön reitin satunnainen aloitus.',
      selectOneArea:
        'Piirrä alue piirtotyökalulla, valitse se (vetämällä laatikko ohuen ääriviivan ympärille, jos napsauttaminen ei onnistu) ja yritä sitten uudelleen.',
      idsNotFound: 'Anna tunnustunnukset --ids jälkeen puolipisteillä erotettuina.',
    },
    warnings: {
      idsNotFound: 'Millään tunnuksilla ei ole näitä tunnuksia, joten ne ohitettiin: {ids}.',
      offPage: 'Osa reitistä kulkee sivulta (vaiheet: {count}). Ne vaiheet ohitetaan.',
      combatTrackerOnly:
        'Combat Detection on asetettu käännösseurantaan, joten tällä kytkimellä ei ole vaikutusta ennen kuin muutat sen.',
      unitPx:
        'Versio 5 lukee solun koon jokaiselta sivulta, joten vanhaa Pixels Per Unit -asetusta ei enää käytetä. Jos tunnukset eivät ole kohdakkain, käytä !tokencontroller calibrate -toimintoa.',
    },
    values: {
      on: 'Päällä',
      off: 'Pois',
      none: 'Ei mitään',
      default: 'Oletus',
      noLimit: 'Ei rajaa',
      ms: '{ms} ms',
      andMore: 'ja {count} muuta',
      following: 'seuraa {leader}',
      locked: 'lukittu',
      gridless: 'ei napsahtelua',
      grid: {
        square: 'Neliö',
        hex: 'Kuusikulmio',
        iso: 'Isometrinen / dimetrinen',
      },
      mode: {
        loop: 'Silmukka',
        pingpong: 'Edestakaisin',
        once: 'Kerran',
      },
      movement: {
        cell: 'Yksi solu kerrallaan',
        segment: 'Koko askel kerrallaan',
      },
      facing: {
        off: 'Älä käännä',
        up: 'Taide kuvapuoli ylöspäin',
        down: 'Taide kasvot alaspäin',
        left: 'Taidekasvot vasemmalle',
        right: 'Taide kasvot oikealle',
      },
      combatDetection: {
        tracker: 'Käännösseuranta',
        manual: 'GM-kytkin',
        both: 'Käännä seurantalaitetta tai GM-kytkintä',
      },
      combatBehaviour: {
        pause: 'Tauko',
        step: 'Siirrä jokaista kierrosta',
        ignore: 'Jatka liikkumista',
      },
      lockMode: {
        native: 'Roll20:n asentolukko',
        revert: 'Kumoa liikkeet',
        freeze: 'Pysy vain paikallaan',
      },
      followMode: {
        trail: 'Yksittäinen tiedosto',
        formation: 'Muodostumista',
      },
      manualMove: {
        continue: 'Jatka sieltä',
        stop: 'Pysäytä partio',
      },
      markerAction: {
        stop: 'Pysähdy missä se on',
        reset: 'Palaa alkuun',
      },
      wallMode: {
        ignore: 'Kävele seinien läpi',
        hold: 'Odota seinillä',
        turn: 'Käänny takaisin seiniin',
      },
      wallCheck: {
        centre: 'Tunnusmerkin keskusta',
        width: 'Koko merkki',
      },
      oneWayWalls: {
        block: 'Lohko',
        pass: 'Päästä läpi',
      },
      transparentWalls: {
        block: 'Lohko',
        pass: 'Päästä läpi',
      },
    },
    menu: {
      statusRunning: 'Partiomerkit: {patrols}. Reitit: {routes}.',
      statusPaused: 'Kaikki partiot on keskeytetty.',
      statusCombat: {
        pause: 'Taistelussa: partiot keskeytetään.',
        step: 'Taistelussa: partiot liikkuvat jokaisella kierroksella.',
      },
      routes: 'Reitit',
      noRoutes: 'Ei vielä reittejä. Lisää yksi, piirrä yksi, nauhoita yksi tai lisää esimerkkejä.',
      create: 'Uusi reitti',
      selected: 'Valitut tokenit',
      tools: 'Työkalut',
      recordings: 'Tallenteet',
      patrols: 'Partioita',
    },
    buttons: {
      start: 'Aloita',
      stop: 'Pysäytä',
      add: 'Vaihekoodi',
      draw: 'Piirtämisestä',
      bounce: 'Pomppualue',
      record: 'Tallentaa',
      examples: 'Esimerkkejä',
      reset: 'Nollaa',
      lock: 'Lukko',
      unlock: 'Avata',
      leader: 'Johtaja',
      follow: 'Seuraa',
      unfollow: 'Lopeta seuraaminen',
      resume: 'Jatkaa',
      pause: 'Keskeytä kaikki',
      combatOn: 'Taistelu päälle',
      combatOff: 'Taistelu pois päältä',
      stopAll: 'Pysäytä kaikki',
      settings: 'Asetukset',
      status: 'Tila',
      help: 'Auttaa',
      open: 'Avata',
      clearStart: 'Selkeä',
      setStart: 'Aseta arvoon Valittu',
      edit: 'Muokkaa koodia',
      rename: 'Nimeä uudelleen',
      copy: 'Kopioida',
      export: 'Viedä',
      remove: 'Poistaa',
      menu: 'Valikko',
      wait: 'Odota',
      stealth: 'Hiiviskely',
      undo: 'Kumoa',
      save: 'Tallentaa',
      cancel: 'Peruuttaa',
      confirm: 'Kyllä, poista se',
      startRoute: 'Aloita reitti',
      list: 'Listaa reitit',
      calibrate: 'Kalibroida',
    },
    prompts: {
      name: 'Reitin nimi',
      code: 'Vaihekoodi',
      interval: 'Millisekuntia askelta kohti (0 = oletus)',
      maxTokens: 'Suurin osa tokeneista kerralla (0 = ei rajaa)',
      newName: 'Uusi nimi',
      route: 'Reitin nimi',
    },
    route: {
      drawn: 'Piirretty reitti, {points} pistettä',
      recorded: 'Reitti tallennettu, {points} pistettä',
      area: 'Pomppualue, {points} kulmat',
      path: 'Polku',
      mode: 'tila',
      interval: 'Intervalli',
      maxTokens: 'Suurin osa tokeneista',
      randomStart: 'Satunnainen aloitus',
      walls: 'Seinät',
      start: 'Kiinteä aloitus',
      tokens: 'Tokenit',
    },
    record: {
      title: 'Nauhoitus "{name}"',
      intro:
        'Tallennus {token} (siirtyy tähän asti: {count}). Napsauta nuolia tai vedä merkkiä kartalla; jokainen liike tallennetaan.',
    },
    settings: {
      interval: {
        label: 'Intervalli',
        desc: 'Millisekuntia vaiheiden välillä. Jokainen reitti voi ohittaa sen.',
      },
      movement: {
        label: 'Liike',
        desc: 'solu siirtää yhden solun askelta kohti; segmentti siirtää koko askeleen (kuten U3) kerralla, kuten versio 4 teki.',
      },
      facing: {
        label: 'Käännä Tokeneita',
        desc: 'Käännä rahakkeet kohtiin, minne ne ovat menossa: pois päältä tai merkkitaidetta kohti (ylös, alas, vasemmalle tai oikealle).',
      },
      combatDetection: {
        label: 'Taistelun tunnistus',
        desc: 'Kuinka taistelu havaitaan: tracker (käännösseuranta on auki, kun joku on siinä), manuaalinen (Combat On/Off -painikkeet) tai molemmat.',
      },
      combatBehaviour: {
        label: 'Taistelukäyttäytyminen',
        desc: 'Mitä partiot tekevät taistelussa: tauko, askel (liikkua kerran joka kerta, kun vuoro ohitetaan) tai huomiotta (jatka liikkumista).',
      },
      lockMode: {
        label: 'Lukitustila',
        desc: 'Kuinka Lukko pitää merkin: natiivi (Roll20:n oma asentolukko, joten kukaan ei voi vetää sitä), peruuttaa (liikkeet peruutetaan) tai pysäyttää (se lopettaa partioinnin ja seuraamisen, mutta sitä voidaan silti vetää).',
      },
      lockMarker: {
        label: 'Lukkomerkki',
        desc: 'Tilamerkki näkyy lukituissa tunnuksissa tai ei mitään. Pelaajat näkevät merkit.',
      },
      followMode: {
        label: 'Seuraa tilaa',
        desc: 'polku: seuraajat kävelevät yksitellen johtajan jalanjäljissä. muodostus: seuraajat säilyttävät paikkansa johtajan ympärillä (vetämällä seuraajaa vaihtaaksesi sen paikkaa).',
      },
      manualMove: {
        label: 'Partion vetäminen',
        desc: 'Kun vedät partiomerkkiä: jatka (reitti jatkuu kohdasta, josta pudotit sen) tai pysähdy (partio päättyy).',
      },
      stopMarkers: {
        label: 'Pysäytysmerkit',
        desc: 'Tilamerkit, jotka vievät tunnuksen pois reitiltä ja pysäyttävät sen seuraamisen puolipisteillä erotettuina (esimerkiksi kuollut;punainen) tai ei mitään. Myös johtajan seuraajat, joilla on yksi näistä merkeistä, pysähtyvät.',
      },
      markerAction: {
        label: 'Lopeta merkkitoiminto',
        desc: 'Mitä partiomerkki tekee, kun se saa Stop Markerin: pysäyttää (se pysyy paikallaan) tai nollaa (se palaa alkuun).',
      },
      wallMode: {
        label: 'Seinät',
        desc: 'Mitä partiot ja seuraajat tekevät dynaamisissa valaistusseinissä ja suljetuissa ovissa ja ikkunoissa: jätä huomiotta (kävele läpi), pidä kiinni (odota, kunnes tie on vapaa, esimerkiksi kunnes ovi avautuu) tai käänny (partiot kääntyvät takaisin). Jokainen reitti voi valita oman, joten haamut voivat silti kävellä seinien läpi.',
      },
      wallCheck: {
        label: 'Seinätarkastus',
        desc: 'keskus: vain merkin keskiosan on pysyttävä poissa seinistä. leveys: koko merkki riittää, joten suuri merkki ei voi puristaa kapeasta raosta.',
      },
      oneWayWalls: {
        label: 'Yksisuuntaiset seinät',
        desc: 'Pysäyttävätkö yksisuuntaiset seinät merkit (estää) vai eivät (läpäisevätkö).',
      },
      transparentWalls: {
        label: 'Läpinäkyvät seinät',
        desc: 'Olipa sitten läpinäkyvät seinät, jotka päästävät valoa läpi, pysäyttävät tokeneita (lohko) tai eivät (läpäisevät).',
      },
      buttonStep: {
        label: 'Solut per napsautus',
        desc: 'Kuinka pitkälle tallennusnuolet siirtävät merkkiä.',
      },
      language: {
        label: 'Kieli',
        desc: 'Valikkojen, viestien ja monisteiden kieli.',
      },
    },
    status: {
      routes: 'Reitit',
      patrols: 'Partiomerkit',
      followers: 'Tokeneja seuraavat',
      locked: 'Lukitut merkit',
      recordings: 'Tallenteet',
      paused: 'Keskeytetty',
      combat: 'Taistele',
      page: 'Nykyinen sivu',
      grid: 'Ruudukko',
      cell: 'Solun koko',
      calibration: 'Kalibrointi',
    },
    help: {
      menu: 'Näytä valikko.',
      start: 'Aseta valitut merkit reitille.',
      stop: 'Pysäytä valitut merkit (partiot ja seuraavat), jokainen reitin merkki tai kaikki.',
      reset: 'Palauta rahakkeet sinne, mistä ne alkoivat, ja pysäytä ne.',
      pause: 'Keskeytä tai jatka jokaista partiointia.',
      lock: 'Pidä valitut merkit paikoillaan tai vapauta ne.',
      leader: 'Valitse valittu merkki johtajaksi, jota seurataan.',
      follow: 'Aseta valitut merkit seuraamaan johtajaa tai nimenomaista merkkiä.',
      unfollow: 'Lopeta valittujen merkkien seuraaminen.',
      add: 'Luo reitti askelkoodista, kuten U2R2D2L2.',
      edit: 'Muuta reitin askelkoodia.',
      draw: 'Luo reitti, joka seuraa valittua piirustusta tällä sivulla.',
      bounce:
        'Luo reitti, jolla merkit vaeltavat valitun suljetun piirustuksen sisällä pomppien sen reunoista.',
      record: 'Tallenna reitti siirtämällä valittua merkkiä painikkeilla tai vetämällä sitä.',
      route: 'Muuta reittivaihtoehtoa: tila, väli, maksimi, satunnainen, seinät tai alku.',
      show: 'Näytä reitin tiedot ja painikkeet.',
      rename: 'Nimeä reitti uudelleen.',
      copy: 'Kopioi reitti uudella nimellä.',
      remove: 'Poista reitti (kysyy ensin).',
      ids: 'Käytä tunnuksia näillä tunnuksilla valittujen tunnuksien sijaan, jotta muut modit, kuten ScriptCards, voivat hallita tokeneita. poista --ids poistaa tunnukset niiden reiteiltä; se ei koskaan poista reittiä.',
      list: 'Listaa reitit tai ohjattavat merkit.',
      examples: 'Lisää esimerkkireitit.',
      export: 'Näytä reitit tekstinä kopioitavaksi toiseen peliin.',
      import: 'Lisää reittejä vientitekstistä.',
      combat: 'Kytke taistelu päälle tai pois päältä käsin.',
      set: 'Muuta asetusta tai näytä kaikki asetukset.',
      calibrate:
        'Kohdista ruudukko solukeskuksiin kiinnitetyillä tunnuksilla tai poista kalibrointi.',
      status: 'Näytä, mitä Mod tekee ja miten se näkee tämän sivun.',
      journal: 'Rakenna Ohje- ja komentokansion monisteet uudelleen.',
      help: 'Näytä tämä luettelo.',
      footer:
        'Täydelliset ohjeet ovat monisteessa "{help}". painikkeet ovat kohdassa "{deck}". {legacy} toimivat edelleen version 4 komentojen kanssa.',
    },
    handout: {
      versionLabel: 'Versio',
      subtitle: 'Partioita, seuraajia ja lukot Jumpgate- ja Legacy-peleihin',
      overview: {
        heading: 'Yleiskatsaus',
        body: 'TokenController siirtää tokeneja puolestasi. Anna vartijalle partioreitti, pyydä kärryä seuraamaan kuljettajaansa tai lukitse patsas paikalleen. Reitit voidaan kirjoittaa askelkoodina, jäljittää kartalla olevasta piirroksesta tai tallentaa liikuttamalla merkkiä. Reitit toimivat neliö-, heksa-, isometrisilla, dimetrisillä ja ruudukottomilla sivuilla.',
      },
      quickStart: {
        heading: 'Pika-aloitus',
        steps: [
          'Avaa Command Deck -moniste tai kirjoita valikkoon !tokencontroller.',
          'Napsauta Esimerkkejä lisätäksesi valmiita reittejä tai Vaihekoodi kirjoittaaksesi omasi (esimerkiksi U2R2D2L2).',
          'Valitse yksi tai useampi merkki ja napsauta Aloita reitin vieressä.',
          'Valitse tunnus ja napsauta Pysäytä lopettaaksesi sen tai Palauta lähettääksesi sen takaisin alkuun.',
        ],
      },
      routes: {
        heading: 'Reittien tekeminen',
        points: [
          'Vaihekoodi: kirjoita liikkeet, kuten U2R2D2L2. Koodit eivät ole sidottu paikkaan kartalla, joten sama reitti toimii missä tahansa.',
          'Piirrosta: piirrä viiva, monikulmio, vapaalla kädellä oleva muoto, suorakulmio tai ellipsi piirtotyökaluilla, valitse se ja napsauta Piirustuksesta. Rahakkeet kulkevat sitä pitkin, vain sillä sivulla. Voit poistaa piirroksen jälkeenpäin.',
          'Tallenna: valitse tunnus ja napsauta Tallenna. Siirrä sitä nuolipainikkeilla tai vedä sitä kartalla (Roll20 reittipisteitä seurataan) ja napsauta sitten Tallenna. Neliöruudukoissa tallennuksesta tulee askelkoodi, jota voit muokata.',
          'Silmukkareitit alkavat uudelleen alusta; edestakaiset reitit kävelevät takaisin samaa tietä kuin tulivat; kun reitit pysähtyvät lopussa. Uudet reitit, jotka päättyvät silmukan alkuun; toiset menevät edestakaisin.',
          'Poistumisalue: piirrä suljettu muoto alueen ympärille, valitse se ja napsauta Poistumisalue. Sillä alkavat merkit kulkevat suoria linjoja ja pomppaavat sen reunoista (ja seiniltä, ellei reitti jätä niitä huomiotta), kääntyen joka kerta hieman satunnaisesti. Satunnaisaloitus asettaa jokaisen merkin alueen satunnaiseen soluun.',
        ],
      },
      codes: {
        colCode: 'Koodi',
        colMeaning: 'Merkitys',
        move: 'Siirry ylös, alas, vasemmalle tai oikealle, yksi solu.',
        diagonal: 'Siirrä vinosti.',
        distance: 'Numero suunnan jälkeen siirtää niin monta solua.',
        face: 'Käänny katsomaan suuntaan liikkumatta (vaatii käännöstokeneita).',
        wait: 'Odota yksi askel tai annettu määrä vaiheita.',
        stealth:
          'Siirrä merkkiä merkkikerroksen ja GM-kerroksen välillä, jotta se katoaa ja tulee uudelleen näkyviin.',
      },
      routeOptions: {
        heading: 'Reittivaihtoehdot',
        colOption: 'Vaihtoehto',
        colMeaning: 'Merkitys',
        mode: 'silmukka, pingpong (edestakaisin) tai kerran.',
        interval: 'Millisekuntia askelta kohden tälle reitille tai 0 globaalille aikavälille.',
        max: 'Eniten tokeneita, jotka voivat olla reitillä kerralla, tai 0 ilman rajoitusta.',
        random: 'päällä: jokainen merkki alkaa satunnaisesta pisteestä reitin varrella.',
        walls:
          'ohita (kävele seinien läpi), pidä kiinni (odota seinillä ja suljetuilla ovilla), käännä (käänny taaksepäin) tai oletus (käytä Seinät-asetusta).',
        start:
          'set: Tokenit hyppäävät valitun merkin paikkaan alkaessaan. selvä: ne alkavat siitä, missä ovat.',
      },
      tokens: {
        heading: 'Tokenien hallinta',
        points: [
          'Tunnus on yhdellä reitillä kerrallaan. Sen aloittaminen toiselta reitiltä korvaa ensimmäisen.',
          'Pysäytä merkit, missä ne ovat. Reset asettaa ne takaisin alkuperäiselle tasolle, missä ne olivat ennen aloittamista.',
          'Lukko pitää merkkiä paikallaan. Lukitut rahakkeet eivät partio tai seuraa, ennen kuin ne on avattu.',
          'Seuraa: valitse johtaja ja napsauta Johtaja, valitse sitten seuraajat ja napsauta Seuraa. Voit myös kirjoittaa johtajan nimen: !tokencontroller follow Goblin Boss. Seuraajat seuraavat partioivia tunnuksia, vetämiäsi tokeneja ja TokenModin siirtämiä tokeneita.',
          'Seuraajat voivat seurata muita seuraajia muodostaen ketjun tai sarakkeen.',
          'Partiomerkin vetäminen kuljettaa partioa siitä kohdasta, josta sen pudotat, ellei Partion vetäminen ole asetettu pysähtymään.',
          'Seinät: Seinät-asetuksen ollessa päällä partiot ja seuraajat eivät kulje dynaamisten valaistusseinien tai suljettujen ovien ja ikkunoiden läpi; avoimet ovet ja ikkunat päästävät ne läpi. Anna reitille omat seinänsä vaihtoehto (esimerkiksi ohita haamu).',
          'Pysäytysmerkit: merkki, joka saa yhden näistä tilamerkeistä (esimerkiksi kuollut), poistuu reitiltä ja lakkaa seuraamasta, sekä johtajan seuraajat, joka saa yhden pysähdyksen. Aseta ne komennolla !tokencontroller set stopMarkers dead;red. Tämä toimii myös, kun toinen modi lisää merkin.',
        ],
      },
      grids: {
        heading: 'Ristikot',
        points: [
          'Solun koko ja ruudukkotyyppi luetaan jokaiselta sivulta, joten eri sivuilla voidaan käyttää erilaisia ruudukoita.',
          'U ja D tarkoittavat aina näyttöä ylös ja alas. Hex-ruudukoilla liikkuu ilman vastaavaa naapurin siksakia; isometrisissa ja dimetrisissä ruudukoissa lävistäjät ylittävät yhden vinoneliön.',
          'Sivut, joiden napsautus on poistettu käytöstä, liikkuvat 70 pikselin askelin ilman, että ne asettuvat ruudukkoon.',
          'Jos merkit ajautuvat ruudukosta, kiinnitä merkki solun keskelle, valitse se ja napsauta Kalibroi. Valitse kaksi merkkiä rivin viereisistä soluista myös solun koon korjaamiseksi.',
        ],
      },
      combat: {
        heading: 'Taistele',
        points: [
          'Combat Detection valitsee kuinka taistelu havaitaan: käännösseuranta, Combat On/Off -painikkeet tai jompikumpi.',
          'Taistelukäyttäytyminen valitsee, mitä partiot tekevät: tauko, liikkua yksi askel joka kerta, kun käänne ohitetaan, tai jatkaa liikettä.',
          'Pause All pysäyttää jokaisen partioinnin milloin tahansa; Jatka aloittaa ne uudelleen.',
        ],
      },
      commands: {
        heading: 'komennot',
        intro:
          'Vain GM:t voivat käyttää näitä komentoja. Reittejä voidaan nimetä tai viitata niiden #id:llä valikkopainikkeista. Laita nimet välilyönneillä "lainausmerkkeihin", kun komennossa on kaksi nimeä.',
        mods: 'Myös muut modit voivat lähettää näitä komentoja, esimerkiksi ScriptCardista. He eivät voi valita tunnuksia, joten he nimeävät ne tunnuksella --ids, jota seuraa tunnukset puolipisteillä erotettuina: !tc stop --ids ID1;ID2. Vastaukset menevät GM:lle.',
        colCommand: 'Komento',
        colDesc: 'Mitä se tekee',
      },
      settings: {
        heading: 'Asetukset',
        intro:
          'Muuta asetuksia valikosta asettamalla !tokencontroller <asetus> <arvo> tai API-skriptit -näytön Mod-asetukset-sivulla.',
        colKey: 'Avain',
        colName: 'Asetus',
        colDesc: 'Kuvaus',
      },
      upgrading: {
        heading: 'Päivitys versiosta 4',
        points: [
          'Polut, partiomerkit, lukot, seuraajat ja keskeneräiset luonnokset säilytetään. Luonnoksista tulee reittejä, jotka päättyvät "(luonnos)".',
          'Versiosi 4 asetukset säilytetään: intervalli, osavaiheet, kierto, taistelupartio ja yksiköt napsautuksella.',
          '!tc- ja !token-control-komennot ja T-Cntrl_-makrot jatkavat toimintaansa. Taulukko näyttää uudet komennot.',
          'Versio 4 lähetti koko valikon jokaisen toiminnon jälkeen; versio 5 lähettää sen sijaan lyhyen vastauksen.',
          'Pixels Per Unit -asetus on poissa: solun koko tulee jokaiselta sivulta. HTML Builder -ohjelmaa ei enää tarvita.',
          'Vanha käyttöopas, jonka jokainen pelaaja näki, korvataan tällä GM-monisteella.',
        ],
        colV4: 'Versio 4',
        colV5: 'Versio 5',
      },
      troubleshooting: {
        heading: 'Vianetsintä',
        points: [
          'Tokenit eivät liiku: tarkista Tila. Partiot odottavat taukotilassa, lukittuna ja taistelussa taistelukäyttäytymisen ollessa tauolla.',
          'Tokenit liikkuvat väärälle etäisyydelle: sivun ruudukon koko tai katkaisu on saattanut muuttua; yritä kalibroida.',
          'Piirretty reitti ei käynnisty: piirretyt reitit toimivat vain sillä sivulla, jolle ne piirrettiin.',
          'Seuraajat eivät liiku, kun toinen Mod siirtää johtajaa: vain TokenMod raportoi liikkeestään. Muut modit voivat kutsua TokenController.ObserveTokenChangea.',
          'Ilmoita ongelmista Roll20-keskusteluryhmässä API-konsolin viesteissä.',
        ],
      },
      languages: {
        heading: 'Kielet',
        body: 'TokenController on käännetty alla oleville kielille. Valitse yksi Kieli-asetuksista.',
        colCode: 'Koodi',
        colName: 'Kieli',
        colNative: 'Alkuperäinen nimi',
      },
      credits: {
        heading: 'Krediitit',
        original: 'Alkuperäinen mod',
        maintainer: 'Versio 5 ylläpitää',
        support: 'Ilmoita virheistä ja ideoista Roll20 Mod -foorumilla tai GitHubissa.',
      },
      footer: 'Jokaisen toiminnon painikkeet ovat monisteessa "{deck}".',
    },
    deck: {
      subtitle: 'Komentopaneeli',
      patrolsDesc: 'Aloita, pysäytä ja keskeytä partiointi. Valitse ensin tunnukset.',
      createDesc: 'Tee reittejä askelkoodista, piirroksesta tai tallentamalla merkki.',
      selectedDesc: 'Lukitse rahakkeet tai pakota ne seuraamaan johtajaa.',
      toolsDesc: 'Taistelu, asetukset ja ruudukkotyökalut.',
      footer: 'Täydelliset ohjeet ovat monisteessa "{help}".',
    },
  };

  const TRANSLATION$f = {
    titles: {
      ready: 'TokenController est prêt.',
      settings: 'Paramètres du contrôleur de jetons',
      help: 'Commandes TokenController',
      export: "Exportation d'itinéraire",
      routes: 'Itinéraires',
      tokens: 'Jetons contrôlés',
      status: 'Statut du contrôleur de jetons',
    },
    messages: {
      migrated:
        'Mise à jour depuis la version 4. Itinéraires conservés : {routes}. Jetons de patrouille conservés : {patrols}. Vos anciennes macros et commandes !tc fonctionnent toujours.',
      removedGuide:
        'L\'ancien document "TokenController Usage Guide", que les joueurs pouvaient voir, a été remplacé par le document d\'aide réservé aux GM.',
      pruned: "Patrouilles oubliées car leurs jetons n'existent plus : {count}.",
      readyHint: 'Tapez !tokencontroller pour le menu ou ouvrez le document Command Deck.',
      combatStarted: {
        pause: "Le combat a commencé : les patrouilles sont mises en pause jusqu'à la fin.",
        step: "Le combat a commencé : les patrouilles avancent d'un pas à chaque tour.",
      },
      combatEnded: 'Le combat est terminé : les patrouilles continuent.',
      routeAdded: 'Itinéraire "{name}" ajouté ({mode}).',
      routeUpdated:
        'Itinéraire "{name}" mis à jour. Les jetons dessus continuent avec le nouvel itinéraire.',
      confirmRemove:
        'Supprimer l\'itinéraire "{name}" ? Jetons dessus qui s\'arrêteront : {count}.',
      routeRemoved: 'Itinéraire "{name}" supprimé. Jetons arrêtés : {count}.',
      routeRenamed: 'Itinéraire "{from}" renommé "{to}".',
      examplesAdded: "Exemples d'itinéraires ajoutés : {count}.",
      exportHint:
        "Copiez le texte ci-dessous et collez-le après {command} dans n'importe quel jeu.",
      imported: 'Itinéraires {added} importés ; ignoré {skipped} (nom déjà utilisé ou non valide).',
      started: '{tokens} a commencé le "{name}".',
      stopped: 'Jetons arrêtés : {count}.',
      reset: 'Les jetons sont retournés à leur point de départ : {count}.',
      locked: 'Verrouillé : {tokens} ({mode}).',
      unlocked: 'Débloqué : {tokens}.',
      leaderSet: '{token} est le leader. Sélectionnez les abonnés et cliquez sur Suivre.',
      following: 'Maintenant, après {leader} ({mode}) : {tokens}.',
      unfollowed: 'Les jetons ne suivent plus : {count}.',
      noRecordings: "Rien n'est enregistré.",
      recordingCancelled: 'Enregistrement "{name}" annulé.',
      languages: 'Langues prises en charge : {list}',
      settingChanged: '{setting} est désormais {value}.',
      combatOn: 'Combat activé.',
      combatOff: 'Combat désactivé.',
      calibrationCleared: 'Calibrage de la grille supprimé de cette page.',
      calibrated: 'Grille calibrée pour cette page (taille de cellule × {scale}).',
      paused: 'Toutes les patrouilles se sont arrêtées.',
      resumed: 'Les patrouilles ont repris.',
      journalRebuilt: 'Documents reconstruits : {help} et {deck}.',
      markerStopped: "Arrêté par un marqueur d'arrêt : {tokens}.",
      markerReset: "Renvoyé à son point de départ par un marqueur d'arrêt : {tokens}.",
    },
    errors: {
      noTokens: 'Aucun jeton sélectionné.',
      noRouteName: "Aucun nom d'itinéraire donné.",
      routeNotFound: 'Il n\'existe aucun itinéraire appelé "{name}".',
      routeExists: 'Il existe déjà un itinéraire appelé "{name}".',
      code: {
        empty: "Le code de l'étape est vide.",
        badToken:
          'Le code d\'étape "{code}" contient quelque chose qu\'il ne comprend pas dans "{at}".',
        tooFar: 'L\'étape "{at}" est trop longue.',
      },
      routeInvalid: "Cet itinéraire n'a pas pu être enregistré.",
      usageAdd: "Donnez un nom et un code d'étape.",
      usageEdit: "Donnez un itinéraire et un nouveau code d'étape.",
      selectOneDrawing:
        'Sélectionnez exactement un dessin (une ligne, un polygone, une forme à main levée, un rectangle ou une ellipse).',
      drawingEmpty: 'Le dessin sélectionné comporte trop peu de points à suivre.',
      usageRoute: 'Donnez un itinéraire, une option et une valeur.',
      unknownRouteOption: 'Il n\'existe aucune option d\'itinéraire appelée "{option}".',
      selectOneToken: 'Sélectionnez exactement un jeton.',
      badRouteValue: '"{value}" n\'est pas une valeur valide pour {option}.',
      usageRename: 'Donnez un itinéraire et son nouveau nom.',
      usageCopy: 'Donnez un itinéraire et un nom pour la copie.',
      badJson: "Ce n'est pas un texte d'exportation d'itinéraire.",
      tokenLocked: '{tokens} ne peut pas démarrer : verrouillé.',
      tokenMarked: "{tokens} ne peut pas démarrer : il a un marqueur d'arrêt.",
      outsideArea: '{tokens} ne peut pas démarrer : ils se trouvent en dehors de "{name}".',
      selectOneArea:
        'Sélectionnez exactement un dessin fermé (un polygone, un rectangle, une ellipse ou une boucle à main levée).',
      areaTooSmall: "Le dessin sélectionné a besoin d'au moins trois coins pour créer une zone.",
      idsNotFound: "Aucun jeton n'a ces identifiants : {ids}.",
      routeOnOtherPage:
        '{tokens} ne peut pas démarrer : "{name}" a été dessiné sur une autre page.',
      startOnOtherPage:
        '{tokens} ne peut pas démarrer : le début fixe de "{name}" se trouve sur une autre page.',
      routeFull: '{tokens} ne peut pas démarrer : "{name}" possède déjà {max} jetons.',
      noPage: 'La page est introuvable.',
      emptyTrack: '{tokens} ne peut pas démarrer : "{name}" n\'a aucun mouvement.',
      leaderNotFound: 'Aucun jeton appelé "{name}" n\'a été trouvé sur cette page.',
      noLeader: "Il n'y a pas encore de leader.",
      followLoop: '{tokens} ne peut pas suivre un jeton qui les suit.',
      alreadyRecording: "{token} est déjà en cours d'enregistrement.",
      recordingTokenGone: 'Le jeton d\'enregistrement "{name}" n\'existe plus.',
      recordingEmpty: "Rien n'a encore été enregistré.",
      unknownSetting: 'Il n\'existe aucun paramètre appelé "{key}".',
      badSettingValue: '"{value}" n\'est pas une valeur valide pour {key}.',
      calibrateNeedsTokens: 'Sélectionnez un ou deux jetons accrochés aux centres cellulaires.',
      calibrateFailed:
        "Les jetons sélectionnés n'ont pas pu être utilisés pour calibrer la grille.",
      unknownCommand: 'Commande inconnue "{command}".',
      gmOnly: 'Seul le MJ peut utiliser TokenController.',
      internal: "Quelque chose s'est mal passé. Les détails sont dans la console API.",
    },
    hints: {
      noTokens: "Sélectionnez d'abord les jetons sur la carte.",
      noRouteName: 'Par exemple : !tokencontroller ajoute Guard Walk U2R2D2L2',
      routeNotFound: 'Tapez !tokencontroller list pour voir toutes les routes.',
      code: {
        empty: 'Par exemple : U2R2D2L2',
        badToken:
          'Utilisez U, D, L, R, UL, UR, DL ou DR avec un certain nombre de cellules, W pour attendre et S pour être furtif.',
        tooFar:
          'Une seule étape peut contenir au maximum 100 cellules ; attend au maximum 100 ticks.',
      },
      selectOneDrawing:
        "Dessinez l'itinéraire avec un outil de dessin, sélectionnez-le (faites glisser un cadre autour d'un contour fin si le clic le manque), puis réessayez.",
      usageRoute: 'Options : mode, intervalle, max, aléatoire, murs, démarrage.',
      routeOnOtherPage:
        'Les itinéraires dessinés ne fonctionnent que sur la page sur laquelle ils ont été dessinés.',
      startOnOtherPage: "Effacez le début fixe ou déplacez d'abord le jeton vers cette page.",
      noLeader:
        'Sélectionnez le leader et cliquez sur Leader, ou donnez son nom : !tokencontroller follow Name',
      leaderNotFound:
        'Utilisez le nom du jeton exactement comme indiqué sur la carte, ou son ID de jeton.',
      badJson: 'Collez exactement le texte de !tokencontroller export (ou v4 exportpaths).',
      unknownSetting: 'Tapez !tokencontroller set pour voir tous les paramètres.',
      calibrateNeedsTokens:
        "Un jeton aligne la grille ; deux jetons dans les cellules voisines d'une rangée fixent également la taille de la cellule.",
      calibrateFailed:
        'Assurez-vous que les jetons se trouvent dans les cellules voisines de la même ligne (colonne des pages Hex (H)).',
      unknownCommand: 'Tapez !tokencontroller help pour la liste des commandes.',
      tokenLocked: "Débloquez d'abord le jeton.",
      tokenMarked: 'Supprimez le marqueur ou modifiez le paramètre Stop Markers.',
      outsideArea:
        "Déplacez d'abord les jetons à l'intérieur de la zone ou activez le démarrage aléatoire pour l'itinéraire.",
      selectOneArea:
        "Dessinez la zone avec un outil de dessin, sélectionnez-la (faites glisser un cadre autour d'un contour fin si vous cliquez dessus), puis réessayez.",
      idsNotFound: 'Donnez les ID de jeton après --ids, séparés par des points-virgules.',
    },
    warnings: {
      idsNotFound: 'Aucun jeton ne possède ces identifiants, ils ont donc été ignorés : {ids}.',
      offPage:
        "Une partie de l'itinéraire s'effectue hors de la page (étapes : {count}). Ces étapes sont ignorées.",
      combatTrackerOnly:
        "La détection de combat est définie sur le suivi des tours, donc ce commutateur n'a aucun effet jusqu'à ce que vous le changiez.",
      unitPx:
        "La version 5 lit la taille des cellules de chaque page, de sorte que l'ancien paramètre Pixels par unité n'est plus utilisé. Si les jetons ne s’alignent pas, utilisez !tokencontroller calibrer.",
    },
    values: {
      on: 'Sur',
      off: 'Désactivé',
      none: 'Aucun',
      default: 'Défaut',
      noLimit: 'Aucune limite',
      ms: '{ms} ms',
      andMore: 'et {count} plus',
      following: 'suivant {leader}',
      locked: 'fermé',
      gridless: 'pas de claquement',
      grid: {
        square: 'Carré',
        hex: 'Hex',
        iso: 'Isométrique / Dimétrique',
      },
      mode: {
        loop: 'Boucle',
        pingpong: 'Aller et retour',
        once: 'Une fois',
      },
      movement: {
        cell: 'Une cellule à la fois',
        segment: 'Une étape entière à la fois',
      },
      facing: {
        off: 'Ne tournez pas',
        up: 'L’art face à face',
        down: 'L’art face contre terre',
        left: "L'art fait face à gauche",
        right: "L'art fait face à droite",
      },
      combatDetection: {
        tracker: 'Traqueur de virage',
        manual: 'Commutateur GM',
        both: 'Tournez le tracker ou le commutateur GM',
      },
      combatBehaviour: {
        pause: 'Pause',
        step: 'Déplacez-vous à chaque tour',
        ignore: 'Continuez à bouger',
      },
      lockMode: {
        native: 'Verrouillage de position du Roll20',
        revert: 'Annuler les mouvements',
        freeze: 'Reste immobile seulement',
      },
      followMode: {
        trail: 'Fichier unique',
        formation: 'Formation',
      },
      manualMove: {
        continue: 'Continuez à partir de là',
        stop: 'Arrêtez la patrouille',
      },
      markerAction: {
        stop: "Arrêtez-vous là où c'est",
        reset: 'Revenir au début',
      },
      wallMode: {
        ignore: 'Traverser les murs',
        hold: 'Attendez aux murs',
        turn: 'Retournez aux murs',
      },
      wallCheck: {
        centre: 'Centre du jeton',
        width: 'Jeton entier',
      },
      oneWayWalls: {
        block: 'Bloc',
        pass: 'Laisser passer',
      },
      transparentWalls: {
        block: 'Bloc',
        pass: 'Laisser passer',
      },
    },
    menu: {
      statusRunning: 'Jetons de patrouille : {patrols}. Itinéraires : {routes}.',
      statusPaused: 'Toutes les patrouilles sont suspendues.',
      statusCombat: {
        pause: 'En combat : les patrouilles sont en pause.',
        step: 'En combat : les patrouilles se déplacent à chaque tour.',
      },
      routes: 'Itinéraires',
      noRoutes:
        "Aucun itinéraire pour l'instant. Ajoutez-en un, dessinez-en un, enregistrez-en un ou ajoutez les exemples.",
      create: 'Nouvel itinéraire',
      selected: 'Jetons sélectionnés',
      tools: 'Outils',
      recordings: 'Enregistrements',
      patrols: 'Patrouilles',
    },
    buttons: {
      start: 'Commencer',
      stop: 'Arrêt',
      add: "Code d'étape",
      draw: 'Du dessin',
      bounce: 'Zone de rebond',
      record: 'Enregistrer',
      examples: 'Exemples',
      reset: 'Réinitialiser',
      lock: 'Verrouillage',
      unlock: 'Ouvrir',
      leader: 'Chef',
      follow: 'Suivre',
      unfollow: 'Ne plus suivre',
      resume: 'Reprendre',
      pause: 'Tout suspendre',
      combatOn: 'Combattez',
      combatOff: 'Combattre',
      stopAll: 'Arrêter tout',
      settings: 'Paramètres',
      status: 'Statut',
      help: 'Aide',
      open: 'Ouvrir',
      clearStart: 'Clair',
      setStart: 'Définir sur Sélectionné',
      edit: 'Modifier le code',
      rename: 'Rebaptiser',
      copy: 'Copie',
      export: 'Exporter',
      remove: 'Retirer',
      menu: 'Menu',
      wait: 'Attendez',
      stealth: 'Furtivité',
      undo: 'Défaire',
      save: 'Sauvegarder',
      cancel: 'Annuler',
      confirm: 'Oui, supprime-le',
      startRoute: "Début de l'itinéraire",
      list: 'Liste des itinéraires',
      calibrate: 'Étalonner',
    },
    prompts: {
      name: "Nom de l'itinéraire",
      code: "Code d'étape",
      interval: 'Millisecondes par étape (0 = par défaut)',
      maxTokens: 'La plupart des jetons à la fois (0 = aucune limite)',
      newName: 'Nouveau nom',
      route: "Nom de l'itinéraire",
    },
    route: {
      drawn: 'Itinéraire tracé, {points} points',
      recorded: 'Itinéraire enregistré, {points} points',
      area: 'Zone de rebond, {points} coins',
      path: 'Chemin',
      mode: 'Mode',
      interval: 'Intervalle',
      maxTokens: 'La plupart des jetons',
      randomStart: 'Démarrage aléatoire',
      walls: 'Murs',
      start: 'Démarrage fixe',
      tokens: 'Jetons',
    },
    record: {
      title: 'Enregistrement de "{name}"',
      intro:
        "Enregistrement {token} (déplacement jusqu'à présent : {count}). Cliquez sur les flèches ou faites glisser le jeton sur la carte ; chaque mouvement est enregistré.",
    },
    settings: {
      interval: {
        label: 'Intervalle',
        desc: 'Millisecondes entre les étapes. Chaque itinéraire peut le remplacer.',
      },
      movement: {
        label: 'Mouvement',
        desc: "la cellule se déplace d'une cellule par pas ; Le segment déplace un pas entier (comme U3) à la fois, comme le faisait la version 4.",
      },
      facing: {
        label: 'Tourner les jetons',
        desc: "Tournez les jetons vers l'endroit où ils vont : vers l'extérieur, ou vers la façon dont l'illustration du jeton est orientée (haut, bas, gauche ou droite).",
      },
      combatDetection: {
        label: 'Détection de combat',
        desc: "Comment le combat est remarqué : tracker (le tracker de tour est ouvert avec quelqu'un à l'intérieur), manuel (les boutons Combat On/Off) ou les deux.",
      },
      combatBehaviour: {
        label: 'Comportement de combat',
        desc: 'Ce que font les patrouilles au combat : faire une pause, faire un pas (se déplacer une fois à chaque tour) ou ignorer (continuer à avancer).',
      },
      lockMode: {
        label: 'Mode de verrouillage',
        desc: 'Comment Lock détient un jeton : natif (le propre verrouillage de position du Roll20, afin que personne ne puisse le faire glisser), revenir (les mouvements sont annulés) ou geler (il arrête de patrouiller et de suivre mais peut toujours être déplacé).',
      },
      lockMarker: {
        label: 'Marqueur de verrouillage',
        desc: 'Marqueur de statut affiché sur les jetons verrouillés, ou aucun. Les joueurs peuvent voir les marqueurs.',
      },
      followMode: {
        label: 'Mode Suivre',
        desc: 'sentier : les adeptes marchent en file indienne sur les traces du leader. formation : les suiveurs gardent leur place autour du leader (faites glisser un suiveur pour changer de place).',
      },
      manualMove: {
        label: 'Faire glisser une patrouille',
        desc: "Lorsque vous faites glisser un jeton de patrouille : continuez (l'itinéraire continue là où vous l'avez déposé) ou arrêtez (la patrouille se termine).",
      },
      stopMarkers: {
        label: "Marqueurs d'arrêt",
        desc: "Marqueurs d'état qui retirent un jeton de son itinéraire et l'empêchent de suivre, séparés par des points-virgules (par exemple mort ; rouge) ou aucun. Les partisans d'un leader avec l'un de ces marqueurs s'arrêtent également.",
      },
      markerAction: {
        label: "Arrêter l'action du marqueur",
        desc: "Ce que fait un jeton de patrouille lorsqu'il reçoit un marqueur d'arrêt : s'arrêter (il reste là où il se trouve) ou se réinitialiser (il revient à son point de départ).",
      },
      wallMode: {
        label: 'Murs',
        desc: "Ce que font les patrouilles et les suiveurs face à des murs à éclairage dynamique et à des portes et fenêtres fermées : ignorer (traverser), attendre (attendre que la voie soit libre, par exemple jusqu'à ce qu'une porte s'ouvre) ou tourner (les patrouilles font demi-tour). Chaque itinéraire peut choisir le sien, afin que les fantômes puissent toujours traverser les murs.",
      },
      wallCheck: {
        label: 'Vérification du mur',
        desc: "centre : seul le milieu d'un jeton doit rester à l'écart des murs. width : le jeton entier le fait, donc un gros jeton ne peut pas se faufiler à travers un espace étroit.",
      },
      oneWayWalls: {
        label: 'Murs à sens unique',
        desc: 'Que les murs à sens unique arrêtent les jetons (bloquer) ou non (passer).',
      },
      transparentWalls: {
        label: 'Murs transparents',
        desc: "Qu'il s'agisse de murs transparents, qui laissent passer la lumière, arrêtent les jetons (bloquer) ou non (passer).",
      },
      buttonStep: {
        label: 'Cellules par clic',
        desc: "Jusqu'où les flèches d'enregistrement déplacent un jeton.",
      },
      language: {
        label: 'Langue',
        desc: 'Langue des menus, des messages et des documents.',
      },
    },
    status: {
      routes: 'Itinéraires',
      patrols: 'Jetons de patrouille',
      followers: 'Jetons suivants',
      locked: 'Jetons verrouillés',
      recordings: 'Enregistrements',
      paused: 'En pause',
      combat: 'Combat',
      page: 'Page actuelle',
      grid: 'Grille',
      cell: 'Taille des cellules',
      calibration: 'Étalonnage',
    },
    help: {
      menu: 'Afficher le menu.',
      start: 'Mettez les jetons sélectionnés sur un itinéraire.',
      stop: 'Arrêtez les jetons sélectionnés (patrouilles et suivis), tous les jetons sur un itinéraire, ou tous.',
      reset: 'Remettez les jetons là où ils ont commencé et arrêtez-les.',
      pause: 'Mettez en pause ou reprenez chaque patrouille.',
      lock: 'Maintenez les jetons sélectionnés en place ou relâchez-les.',
      leader: 'Choisissez le jeton sélectionné comme leader à suivre.',
      follow:
        'Faites en sorte que les jetons sélectionnés suivent le chef ou un jeton donné par leur nom.',
      unfollow: 'Arrêtez les jetons sélectionnés suivants.',
      add: "Créez un itinéraire à partir d'un code d'étape, tel que U2R2D2L2.",
      edit: "Modifier le code d'étape d'un itinéraire.",
      draw: 'Créez un itinéraire qui suit le dessin sélectionné sur cette page.',
      bounce:
        "Créez un itinéraire sur lequel les jetons errent à l'intérieur du dessin fermé sélectionné, rebondissant sur ses bords.",
      record:
        'Enregistrez un itinéraire en déplaçant le jeton sélectionné avec les boutons ou en le faisant glisser.',
      route:
        "Modifiez une option d'itinéraire : mode, intervalle, maximum, aléatoire, murs ou début.",
      show: "Afficher les détails et les boutons d'un itinéraire.",
      rename: 'Renommer un itinéraire.',
      copy: 'Copiez un itinéraire sous un nouveau nom.',
      remove: 'Supprimer un itinéraire (demande en premier).',
      ids: "Agissez sur les jetons avec ces identifiants au lieu de ceux sélectionnés, afin que d'autres mods tels que les ScriptCards puissent contrôler les jetons. Remove --ids retire les jetons de leurs itinéraires ; il ne supprime jamais un itinéraire.",
      list: 'Répertoriez les itinéraires ou les jetons contrôlés.',
      examples: "Ajoutez les exemples d'itinéraires.",
      export: 'Afficher les itinéraires sous forme de texte à copier dans un autre jeu.',
      import: "Ajoutez des itinéraires à partir du texte d'exportation.",
      combat: 'Activez ou désactivez le combat à la main.',
      set: 'Modifiez un paramètre ou affichez tous les paramètres.',
      calibrate:
        "Alignez la grille avec les jetons accrochés aux centres cellulaires ou supprimez l'étalonnage.",
      status: 'Montrez ce que fait le mod et comment il voit cette page.',
      journal: "Reconstruisez les documents d'aide et de commande.",
      help: 'Montrez cette liste.',
      footer:
        'Les instructions complètes se trouvent dans le document « {help} » ; les boutons sont dans "{deck}". {legacy} fonctionne toujours avec les commandes de la version 4.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Patrouilles, suiveurs et verrous pour les jeux Jumpgate et Legacy',
      overview: {
        heading: 'Aperçu',
        body: "TokenController déplace les jetons pour vous. Donnez à un garde un itinéraire de patrouille, demandez à un chariot de suivre son conducteur ou verrouillez une statue en place. Les itinéraires peuvent être saisis sous forme de code d'étape, tracés à partir d'un dessin sur la carte ou enregistrés en déplaçant un jeton. Les itinéraires fonctionnent sur des pages carrées, hexagonales, isométriques, dimétriques et sans grille.",
      },
      quickStart: {
        heading: 'Démarrage rapide',
        steps: [
          'Ouvrez le document Command Deck ou tapez !tokencontroller pour le menu.',
          "Cliquez sur Exemples pour ajouter des itinéraires prêts à l'emploi ou sur Step Code pour saisir le vôtre (par exemple U2R2D2L2).",
          "Sélectionnez un ou plusieurs jetons et cliquez sur Démarrer à côté d'un itinéraire.",
          "Sélectionnez un jeton et cliquez sur Arrêter pour l'arrêter ou sur Réinitialiser pour le renvoyer là où il a commencé.",
        ],
      },
      routes: {
        heading: 'Créer des itinéraires',
        points: [
          "Code d'étape : tapez des mouvements tels que U2R2D2L2. Les codes ne sont pas liés à un endroit sur la carte, donc le même itinéraire fonctionne n'importe où.",
          'Depuis le dessin : dessinez une ligne, un polygone, une forme à main levée, un rectangle ou une ellipse avec les outils de dessin, sélectionnez-le et cliquez sur Depuis le dessin. Les jetons le parcourent, sur cette page uniquement. Vous pourrez ensuite supprimer le dessin.',
          "Enregistrer : sélectionnez un jeton et cliquez sur Enregistrer. Déplacez-le avec les boutons fléchés ou faites-le glisser sur la carte (les waypoints Roll20 sont suivis), puis cliquez sur Enregistrer. Sur les grilles carrées, l'enregistrement devient un code d'étape que vous pouvez modifier.",
          "Les itinéraires en boucle recommencent depuis le début ; les itinéraires aller-retour reviennent par où ils sont venus ; une fois que les itinéraires s'arrêtent à la fin. De nouveaux itinéraires qui se terminent là où ils commencent la boucle ; d'autres vont et viennent.",
          "Zone de rebond : dessinez une forme fermée autour de la zone, sélectionnez-la et cliquez sur Zone de rebond. Les jetons qui y sont lancés se déplacent en lignes droites et rebondissent sur ses bords (et sur les murs, à moins que l'itinéraire ne les ignore), tournant un peu au hasard à chaque fois. Le démarrage aléatoire place chaque jeton dans une cellule aléatoire de la zone.",
        ],
      },
      codes: {
        colCode: 'Code',
        colMeaning: 'Signification',
        move: "Déplacez-vous vers le haut, le bas, la gauche ou la droite, d'une cellule.",
        diagonal: 'Déplacez-vous en diagonale.',
        distance: 'Un nombre après une direction déplace autant de cellules.',
        face: 'Tournez-vous pour faire face à une direction sans bouger (nécessite des jetons de virage).',
        wait: "Attendez une étape ou le nombre d'étapes indiqué.",
        stealth:
          "Déplacez le jeton entre la couche de jetons et la couche GM pour qu'il disparaisse et réapparaisse.",
      },
      routeOptions: {
        heading: "Options d'itinéraire",
        colOption: 'Option',
        colMeaning: 'Signification',
        mode: 'boucle, pingpong (aller et retour) ou une fois.',
        interval: "Millisecondes par étape pour cet itinéraire, ou 0 pour l'intervalle global.",
        max: 'Le plus grand nombre de jetons pouvant être sur la route en même temps, ou 0 pour aucune limite.',
        random: 'activé : chaque jeton commence à un point aléatoire le long du parcours.',
        walls:
          'ignorer (traverser les murs), maintenir (attendre devant les murs et les portes fermées), tourner (faire demi-tour) ou par défaut (utiliser le paramètre Murs).',
        start:
          "set : les jetons sautent à la position du jeton sélectionné lorsqu'ils démarrent. clair : ils commencent là où ils en sont.",
      },
      tokens: {
        heading: 'Contrôler les jetons',
        points: [
          'Un jeton est sur un itinéraire à la fois. Le démarrer sur un autre itinéraire remplace le premier.',
          "Stop laisse les jetons là où ils se trouvent. La réinitialisation les remet là où ils étaient avant de commencer, sur leur calque d'origine.",
          "Lock maintient un jeton en place. Les jetons verrouillés ne patrouillent ni ne suivent jusqu'à ce qu'ils soient déverrouillés.",
          'Suivre : sélectionnez le leader et cliquez sur Leader, puis sélectionnez les suiveurs et cliquez sur Suivre. Vous pouvez également saisir le nom du leader : !tokencontroller follow Goblin Boss. Les abonnés suivent les jetons qui patrouillent, les jetons que vous faites glisser et les jetons déplacés par TokenMod.',
          'Les abonnés peuvent suivre d’autres abonnés en créant une chaîne ou une colonne.',
          "Faire glisser un jeton de patrouille permet à la patrouille de continuer là où vous l'avez déposé, à moins que le déplacement d'une patrouille ne soit réglé pour s'arrêter.",
          "Murs : lorsque l'option Murs est activée, les patrouilles et les suiveurs ne traversent pas les murs à éclairage dynamique ou les portes et fenêtres fermées ; portes et fenêtres ouvertes les laissent passer. Donnez à un itinéraire ses propres options de murs (par exemple ignorer un fantôme).",
          "Marqueurs d'arrêt : un jeton qui obtient l'un de ces marqueurs de statut (par exemple mort) quitte son itinéraire et arrête de le suivre, ainsi que les partisans d'un leader qui obtiennent un arrêt également. Définissez-les avec !tokencontroller set stopMarkers dead;red. Cela fonctionne également lorsqu'un autre Mod ajoute le marqueur.",
        ],
      },
      grids: {
        heading: 'Grilles',
        points: [
          'La taille des cellules et le type de grille sont lus sur chaque page, de sorte que différentes pages peuvent utiliser différentes grilles.',
          "U et D signifient toujours haut et bas de l'écran. Sur les grilles hexagonales, se déplace sans voisin correspondant en zigzag ; sur les grilles isométriques et dimétriques, les diagonales croisent un losange.",
          "Les pages dont l'accrochage est désactivé se déplacent par incréments de 70 pixels sans s'aligner sur une grille.",
          "Si des jetons s'écartent de la grille, placez-en un sur un centre cellulaire, sélectionnez-le et cliquez sur Calibrer. Sélectionnez deux jetons dans les cellules voisines d'une ligne pour fixer également la taille des cellules.",
        ],
      },
      combat: {
        heading: 'Combat',
        points: [
          'La détection de combat choisit la manière dont le combat est remarqué : le suivi des tours, les boutons Combat On/Off, ou les deux.',
          "Le comportement de combat choisit ce que font les patrouilles : faire une pause, avancer d'un pas à chaque tour ou continuer à avancer.",
          'Pause All arrête chaque patrouille à tout moment ; La reprise les redémarre.',
        ],
      },
      commands: {
        heading: 'Commandes',
        intro:
          'Seuls les MJ peuvent utiliser ces commandes. Les itinéraires peuvent être nommés ou référencés par leur #id à partir des boutons de menu. Mettez les noms avec des espaces entre "guillemets" lorsqu\'une commande prend deux noms.',
        mods: "D'autres Mods peuvent également envoyer ces commandes, par exemple depuis des ScriptCards. Ils ne peuvent pas sélectionner de jetons, ils les nomment donc avec --ids suivi d'ID de jeton séparés par des points-virgules : !tc stop --ids ID1;ID2. Les réponses vont au GM.",
        colCommand: 'Commande',
        colDesc: 'Ce que ça fait',
      },
      settings: {
        heading: 'Paramètres',
        intro:
          "Modifiez les paramètres depuis le menu, avec !tokencontroller set <setting> <value>, ou sur la page des paramètres du module dans l'écran Scripts API.",
        colKey: 'Clé',
        colName: 'Paramètre',
        colDesc: 'Description',
      },
      upgrading: {
        heading: 'Mise à niveau à partir de la version 4',
        points: [
          'Les chemins, les jetons de patrouille, les écluses, les suiveurs et les brouillons inachevés sont conservés. Les brouillons deviennent des itinéraires se terminant par "(draft)".',
          'Vos paramètres version 4 sont conservés : intervalle, sous-étapes, rotation, patrouille de combat et unités par clic.',
          'Les commandes !tc et !token-control et les macros T-Cntrl_ continuent de fonctionner. Le tableau montre les nouvelles commandes.',
          "La version 4 envoyait l'intégralité du menu après chaque action ; la version 5 envoie une courte réponse à la place.",
          "Le paramètre Pixels par unité a disparu : la taille des cellules provient de chaque page. HTML Builder n'est plus nécessaire.",
          "L'ancien document du Guide d'utilisation, que chaque joueur pouvait voir, est remplacé par ce document réservé aux MJ.",
        ],
        colV4: 'Version 4',
        colV5: 'Version 5',
      },
      troubleshooting: {
        heading: 'Dépannage',
        points: [
          "Les jetons ne bougent pas : vérifiez le statut. Les patrouilles attendent lorsqu'elles sont en pause, lorsqu'elles sont verrouillées et en combat lorsque le comportement de combat est en pause.",
          "Les jetons se déplacent à la mauvaise distance : la taille de la grille ou l'alignement de la page peut avoir changé ; essayez de calibrer.",
          'Un itinéraire dessiné ne démarre pas : les itinéraires dessinés ne fonctionnent que sur la page sur laquelle ils ont été dessinés.',
          "Les suiveurs ne bougent pas lorsqu'un autre Mod déplace le leader : seul TokenMod rapporte ses mouvements. D'autres mods peuvent appeler TokenController.ObserveTokenChange.",
          'Signalez les problèmes sur le forum Roll20 avec tous les messages de la console API.',
        ],
      },
      languages: {
        heading: 'Langues',
        body: 'TokenController est traduit dans les langues ci-dessous. Choisissez-en un avec le paramètre Langue.',
        colCode: 'Code',
        colName: 'Langue',
        colNative: 'Nom natif',
      },
      credits: {
        heading: 'Crédits',
        original: 'Mod original par',
        maintainer: 'Version 5 maintenue par',
        support: 'Signalez des bugs et des idées sur le forum Roll20 Mod ou sur GitHub.',
      },
      footer: 'Les boutons pour chaque action se trouvent dans le document « {deck} ».',
    },
    deck: {
      subtitle: 'Pont de commandement',
      patrolsDesc:
        "Démarrez, arrêtez et mettez en pause les patrouilles. Sélectionnez d'abord les jetons.",
      createDesc:
        "Réalisez des itinéraires à partir d'un code étape, d'un dessin ou en enregistrant un jeton.",
      selectedDesc: 'Verrouillez les jetons ou faites-les suivre un leader.',
      toolsDesc: 'Outils de combat, de paramètres et de grille.',
      footer: 'Les instructions complètes se trouvent dans le document « {help} ».',
    },
  };

  const TRANSLATION$e = {
    titles: {
      ready: 'TokenController ist bereit.',
      settings: 'TokenController-Einstellungen',
      help: 'TokenController-Befehle',
      export: 'Routenexport',
      routes: 'Routen',
      tokens: 'Kontrollierte Token',
      status: 'TokenController-Status',
    },
    messages: {
      migrated:
        'Von Version 4 aktualisiert. Routen beibehalten: {routes}. Behaltene Patrouillentoken: {patrols}. Ihre alten Makros und !tc-Befehle funktionieren weiterhin.',
      removedGuide:
        'Das alte „TokenController Usage Guide“-Handout, das die Spieler sehen konnten, wurde durch das Nur-GM-Hilfe-Handout ersetzt.',
      pruned: 'Patrouillen vergessen, weil ihre Token nicht mehr existieren: {count}.',
      readyHint:
        'Geben Sie !tokencontroller für das Menü ein oder öffnen Sie das Command Deck-Handout.',
      combatStarted: {
        pause: 'Der Kampf hat begonnen: Die Patrouillen werden bis zum Ende unterbrochen.',
        step: 'Der Kampf hat begonnen: Patrouillen bewegen sich in jeder Runde einen Schritt.',
      },
      combatEnded: 'Der Kampf ist beendet: Die Patrouillen gehen weiter.',
      routeAdded: 'Route „{name}“ hinzugefügt ({mode}).',
      routeUpdated:
        'Route „{name}“ aktualisiert. Darauf befindliche Token fahren mit der neuen Route fort.',
      confirmRemove:
        'Route „{name}“ entfernen? Darauf befinden sich Token, die angehalten werden: {count}.',
      routeRemoved: 'Route „{name}“ entfernt. Gestoppte Token: {count}.',
      routeRenamed: 'Route „{from}“ umbenannt in „{to}“.',
      examplesAdded: 'Beispielrouten hinzugefügt: {count}.',
      exportHint:
        'Kopieren Sie den Text unten und fügen Sie ihn nach {command} in ein beliebiges Spiel ein.',
      imported:
        'Importierte {added} Routen; übersprungen {skipped} (Name bereits verwendet oder ungültig).',
      started: '{tokens} begann am „{name}“.',
      stopped: 'Gestoppte Token: {count}.',
      reset: 'Die Tokens kehrten dorthin zurück, wo sie begonnen haben: {count}.',
      locked: 'Gesperrt: {tokens} ({mode}).',
      unlocked: 'Entsperrt: {tokens}.',
      leaderSet:
        '{token} ist der Anführer. Wählen Sie die Follower aus und klicken Sie auf „Folgen“.',
      following: 'Nun folgt {leader} ({mode}): {tokens}.',
      unfollowed: 'Token folgen nicht mehr: {count}.',
      noRecordings: 'Es wird nichts aufgezeichnet.',
      recordingCancelled: 'Aufnahme „{name}“ abgebrochen.',
      languages: 'Unterstützte Sprachen: {list}',
      settingChanged: '{setting} ist jetzt {value}.',
      combatOn: 'Kampf eingeschaltet.',
      combatOff: 'Kampf ausgeschaltet.',
      calibrationCleared: 'Die Gitterkalibrierung wurde von dieser Seite entfernt.',
      calibrated: 'Raster für diese Seite kalibriert (Zellengröße × {scale}).',
      paused: 'Alle Patrouillen pausierten.',
      resumed: 'Die Patrouillen wurden wieder aufgenommen.',
      journalRebuilt: 'Handouts neu erstellt: {help} und {deck}.',
      markerStopped: 'Gestoppt durch einen Stoppmarker: {tokens}.',
      markerReset:
        'Durch einen Stoppmarker dorthin zurückgeschickt, wo sie begonnen haben: {tokens}.',
    },
    errors: {
      noTokens: 'Keine Token ausgewählt.',
      noRouteName: 'Kein Routenname angegeben.',
      routeNotFound: 'Es gibt keine Route namens „{name}“.',
      routeExists: 'Es gibt bereits eine Route namens „{name}“.',
      code: {
        empty: 'Der Schrittcode ist leer.',
        badToken: 'Der Schrittcode „{code}“ hat etwas, das er bei „{at}“ nicht versteht.',
        tooFar: 'Der Schritt „{at}“ ist zu lang.',
      },
      routeInvalid: 'Diese Route konnte nicht gespeichert werden.',
      usageAdd: 'Geben Sie einen Namen und einen Schrittcode ein.',
      usageEdit: 'Geben Sie eine Route und einen neuen Schrittcode ein.',
      selectOneDrawing:
        'Wählen Sie genau eine Zeichnung aus (eine Linie, ein Polygon, eine Freihandform, ein Rechteck oder eine Ellipse).',
      drawingEmpty:
        'Die ausgewählte Zeichnung enthält zu wenige Punkte, denen gefolgt werden kann.',
      usageRoute: 'Geben Sie eine Route, eine Option und einen Wert an.',
      unknownRouteOption: 'Es gibt keine Routenoption namens „{option}“.',
      selectOneToken: 'Wählen Sie genau einen Token aus.',
      badRouteValue: '„{value}“ ist kein gültiger Wert für {option}.',
      usageRename: 'Geben Sie eine Route und ihren neuen Namen ein.',
      usageCopy: 'Geben Sie eine Route und einen Namen für die Kopie ein.',
      badJson: 'Das ist kein Routenexporttext.',
      tokenLocked: '{tokens} kann nicht gestartet werden: gesperrt.',
      tokenMarked: '{tokens} kann nicht starten: Sie haben eine Stoppmarkierung.',
      outsideArea: '{tokens} kann nicht gestartet werden: Sie liegen außerhalb von „{name}“.',
      selectOneArea:
        'Wählen Sie genau eine geschlossene Zeichnung (ein Polygon, ein Rechteck, eine Ellipse oder eine Freihandschleife) aus.',
      areaTooSmall:
        'Die ausgewählte Zeichnung benötigt mindestens drei Ecken, um eine Fläche zu bilden.',
      idsNotFound: 'Keine Token haben diese IDs: {ids}.',
      routeOnOtherPage:
        '{tokens} kann nicht gestartet werden: „{name}“ wurde auf einer anderen Seite gezeichnet.',
      startOnOtherPage:
        '{tokens} kann nicht starten: Der feste Anfang von „{name}“ liegt auf einer anderen Seite.',
      routeFull: '{tokens} kann nicht gestartet werden: „{name}“ verfügt bereits über {max} Token.',
      noPage: 'Die Seite konnte nicht gefunden werden.',
      emptyTrack: '{tokens} kann nicht starten: „{name}“ hat keine Züge.',
      leaderNotFound: 'Auf dieser Seite wurde kein Token mit dem Namen „{name}“ gefunden.',
      noLeader: 'Es gibt noch keinen Anführer.',
      followLoop: '{tokens} kann einem Token, das ihnen folgt, nicht folgen.',
      alreadyRecording: '{token} wird bereits aufgezeichnet.',
      recordingTokenGone: 'Das Token für die Aufzeichnung „{name}“ existiert nicht mehr.',
      recordingEmpty: 'Es wurde noch nichts aufgezeichnet.',
      unknownSetting: 'Es gibt keine Einstellung namens „{key}“.',
      badSettingValue: '„{value}“ ist kein gültiger Wert für {key}.',
      calibrateNeedsTokens:
        'Wählen Sie ein oder zwei Token aus, die an den Zellmitten eingerastet sind.',
      calibrateFailed:
        'Die ausgewählten Token konnten nicht zur Kalibrierung des Rasters verwendet werden.',
      unknownCommand: 'Unbekannter Befehl „{command}“.',
      gmOnly: 'Nur der GM kann TokenController verwenden.',
      internal: 'Etwas ist schief gelaufen. Details finden Sie in der API-Konsole.',
    },
    hints: {
      noTokens: 'Wählen Sie zuerst die Token auf der Karte aus.',
      noRouteName: 'Beispiel: !tokencontroller fügt Guard Walk U2R2D2L2 hinzu',
      routeNotFound: 'Geben Sie !tokencontroller list ein, um alle Routen anzuzeigen.',
      code: {
        empty: 'Zum Beispiel: U2R2D2L2',
        badToken:
          'Verwenden Sie U, D, L, R, UL, UR, DL oder DR mit mehreren Zellen, W zum Warten und S zum Stealth.',
        tooFar:
          'Ein einzelner Schritt kann höchstens 100 Zellen umfassen; wartet höchstens 100 Ticks.',
      },
      selectOneDrawing:
        'Zeichnen Sie die Route mit einem Zeichenwerkzeug, wählen Sie sie aus (ziehen Sie einen Rahmen um einen dünnen Umriss, wenn Sie darauf klicken, und versuchen Sie es erneut).',
      usageRoute: 'Optionen: Modus, Intervall, Max, Zufall, Wände, Start.',
      routeOnOtherPage:
        'Gezeichnete Routen funktionieren nur auf der Seite, auf der sie gezeichnet wurden.',
      startOnOtherPage:
        'Löschen Sie den festen Anfang oder verschieben Sie das Token zuerst auf diese Seite.',
      noLeader:
        'Wählen Sie den Anführer aus und klicken Sie auf „Anführer“ oder geben Sie seinen Namen ein: !tokencontroller follow Name',
      leaderNotFound:
        'Verwenden Sie den Token-Namen genau so, wie er auf der Karte angezeigt wird, oder seine Token-ID.',
      badJson: 'Fügen Sie den Text aus !tokencontroller export (oder v4 exportpaths) genau ein.',
      unknownSetting: 'Geben Sie !tokencontroller set ein, um alle Einstellungen anzuzeigen.',
      calibrateNeedsTokens:
        'Ein Spielstein richtet das Raster aus; Zwei Spielsteine in benachbarten Zellen einer Zeile legen ebenfalls die Zellengröße fest.',
      calibrateFailed:
        'Stellen Sie sicher, dass sich die Token in benachbarten Zellen derselben Zeile (Spalte auf Hex-Seiten (H)) befinden.',
      unknownCommand: 'Geben Sie !tokencontroller help für die Liste der Befehle ein.',
      tokenLocked: 'Entsperren Sie zuerst den Token.',
      tokenMarked:
        'Entfernen Sie die Markierung oder ändern Sie die Einstellung „Stoppmarkierungen“.',
      outsideArea:
        'Bewegen Sie die Spielsteine zuerst innerhalb des Bereichs oder aktivieren Sie „Zufälliger Start“ für die Route.',
      selectOneArea:
        'Zeichnen Sie den Bereich mit einem Zeichenwerkzeug, wählen Sie ihn aus (ziehen Sie einen Rahmen um einen dünnen Umriss, falls dieser beim Klicken übersehen wird), und versuchen Sie es erneut.',
      idsNotFound: 'Geben Sie nach --ids Token-IDs an, getrennt durch Semikolons.',
    },
    warnings: {
      idsNotFound: 'Keine Token haben diese IDs, daher wurden sie übersprungen: {ids}.',
      offPage:
        'Ein Teil der Route verläuft außerhalb der Seite (Schritte: {count}). Diese Schritte werden übersprungen.',
      combatTrackerOnly:
        'Die Kampferkennung ist auf den Runden-Tracker eingestellt, sodass dieser Schalter keine Wirkung hat, bis Sie ihn ändern.',
      unitPx:
        'Version 5 liest die Zellengröße von jeder Seite, sodass die alte Einstellung „Pixel pro Einheit“ nicht mehr verwendet wird. Wenn die Token nicht ausgerichtet sind, verwenden Sie !tokencontroller kalibrieren.',
    },
    values: {
      on: 'An',
      off: 'Aus',
      none: 'Keiner',
      default: 'Standard',
      noLimit: 'Keine Begrenzung',
      ms: '{ms} ms',
      andMore: 'und {count} mehr',
      following: 'folge {leader}',
      locked: 'gesperrt',
      gridless: 'kein Knacken',
      grid: {
        square: 'Quadrat',
        hex: 'Verhexen',
        iso: 'Isometrisch / dimetrisch',
      },
      mode: {
        loop: 'Schleife',
        pingpong: 'Hin und her',
        once: 'Einmal',
      },
      movement: {
        cell: 'Eine Zelle nach der anderen',
        segment: 'Ganzer Schritt auf einmal',
      },
      facing: {
        off: 'Nicht umdrehen',
        up: 'Die Kunst zeigt nach oben',
        down: 'Die Kunst ist mit der Vorderseite nach unten gerichtet',
        left: 'Kunstgesichter übrig',
        right: 'Die Kunst zeigt nach rechts',
      },
      combatDetection: {
        tracker: 'Turn-Tracker',
        manual: 'GM-Schalter',
        both: 'Drehen Sie den Tracker oder den GM-Schalter',
      },
      combatBehaviour: {
        pause: 'Pause',
        step: 'Bewegen Sie sich jede Runde',
        ignore: 'Bleiben Sie in Bewegung',
      },
      lockMode: {
        native: 'Positionssperre des Roll20',
        revert: 'Machen Sie Bewegungen rückgängig',
        freeze: 'Nur stillhalten',
      },
      followMode: {
        trail: 'Einzelne Datei',
        formation: 'Bildung',
      },
      manualMove: {
        continue: 'Von dort aus weitermachen',
        stop: 'Stoppen Sie die Patrouille',
      },
      markerAction: {
        stop: 'Stehen bleiben',
        reset: 'Zurück zum Start',
      },
      wallMode: {
        ignore: 'Durch Wände gehen',
        hold: 'An Wänden warten',
        turn: 'An Wänden umkehren',
      },
      wallCheck: {
        centre: 'Mittelpunkt des Tokens',
        width: 'Ganzes Token',
      },
      oneWayWalls: {
        block: 'Blockieren',
        pass: 'Durchlassen',
      },
      transparentWalls: {
        block: 'Blockieren',
        pass: 'Durchlassen',
      },
    },
    menu: {
      statusRunning: 'Patrouillentoken: {patrols}. Routen: {routes}.',
      statusPaused: 'Alle Patrouillen sind pausiert.',
      statusCombat: {
        pause: 'Im Kampf: Patrouillen werden pausiert.',
        step: 'Im Kampf: Patrouillen bewegen sich jede Runde.',
      },
      routes: 'Routen',
      noRoutes:
        'Noch keine Routen. Fügen Sie eines hinzu, zeichnen Sie eines, zeichnen Sie eines auf oder fügen Sie die Beispiele hinzu.',
      create: 'Neue Route',
      selected: 'Ausgewählte Token',
      tools: 'Werkzeuge',
      recordings: 'Aufnahmen',
      patrols: 'Patrouillen',
    },
    buttons: {
      start: 'Start',
      stop: 'Stoppen',
      add: 'Schrittcode',
      draw: 'Aus der Zeichnung',
      bounce: 'Bounce-Bereich',
      record: 'Aufzeichnen',
      examples: 'Beispiele',
      reset: 'Zurücksetzen',
      lock: 'Sperren',
      unlock: 'Entsperren',
      leader: 'Führer',
      follow: 'Folgen',
      unfollow: 'Nicht mehr folgen',
      resume: 'Wieder aufnehmen',
      pause: 'Alles anhalten',
      combatOn: 'Kampf weiter',
      combatOff: 'Kampf aus',
      stopAll: 'Alles stoppen',
      settings: 'Einstellungen',
      status: 'Status',
      help: 'Helfen',
      open: 'Offen',
      clearStart: 'Klar',
      setStart: 'Auf „Ausgewählt“ setzen',
      edit: 'Code bearbeiten',
      rename: 'Umbenennen',
      copy: 'Kopie',
      export: 'Export',
      remove: 'Entfernen',
      menu: 'Speisekarte',
      wait: 'Warten',
      stealth: 'Heimlichkeit',
      undo: 'Rückgängig machen',
      save: 'Speichern',
      cancel: 'Stornieren',
      confirm: 'Ja, entfernen Sie es',
      startRoute: 'Route starten',
      list: 'Routen auflisten',
      calibrate: 'Kalibrieren',
    },
    prompts: {
      name: 'Routenname',
      code: 'Schrittcode',
      interval: 'Millisekunden pro Schritt (0 = Standard)',
      maxTokens: 'Die meisten Token auf einmal (0 = kein Limit)',
      newName: 'Neuer Name',
      route: 'Routenname',
    },
    route: {
      drawn: 'Gezeichnete Route, {points} Punkte',
      recorded: 'Aufgezeichnete Route, {points} Punkte',
      area: 'Absprungbereich, {points} Ecken',
      path: 'Weg',
      mode: 'Modus',
      interval: 'Intervall',
      maxTokens: 'Die meisten Token',
      randomStart: 'Zufälliger Start',
      walls: 'Wände',
      start: 'Fester Start',
      tokens: 'Token',
    },
    record: {
      title: 'Aufnahme „{name}“',
      intro:
        'Aufnahme {token} (Bisherige Verschiebungen: {count}). Klicken Sie auf die Pfeile oder ziehen Sie das Token auf der Karte. Jede Bewegung wird aufgezeichnet.',
    },
    settings: {
      interval: {
        label: 'Intervall',
        desc: 'Millisekunden zwischen Schritten. Jede Route kann es überschreiben.',
      },
      movement: {
        label: 'Bewegung',
        desc: 'Zelle bewegt sich eine Zelle pro Schritt; Das Segment bewegt einen ganzen Schritt (z. B. U3) auf einmal, wie es in Version 4 der Fall war.',
      },
      facing: {
        label: 'Spielsteine umdrehen',
        desc: 'Drehen Sie die Spielsteine so, dass sie dorthin zeigen, wo sie hingehören: weg, oder in die Richtung, in die das Spielsteinbild zeigt (nach oben, unten, links oder rechts).',
      },
      combatDetection: {
        label: 'Kampferkennung',
        desc: 'Wie der Kampf wahrgenommen wird: Tracker (der Turn-Tracker ist geöffnet, wenn sich jemand darin befindet), manuell (die Schaltflächen „Kampf ein/aus“) oder beides.',
      },
      combatBehaviour: {
        label: 'Kampfverhalten',
        desc: 'Was Patrouillen im Kampf tun: Pause, Schritt (sich einmal bewegen, wenn die Runde vorbei ist) oder ignorieren (sich weiterbewegen).',
      },
      lockMode: {
        label: 'Sperrmodus',
        desc: 'Wie Lock ein Token hält: native (Roll20s eigene Positionssperre, sodass niemand es ziehen kann), Revert (Bewegungen werden rückgängig gemacht) oder Freeze (es hört auf zu patrouillieren und zu folgen, kann aber immer noch gezogen werden).',
      },
      lockMarker: {
        label: 'Sperrmarkierung',
        desc: 'Statusmarkierung wird auf gesperrten Token angezeigt oder keine. Spieler können Markierungen sehen.',
      },
      followMode: {
        label: 'Folgemodus',
        desc: 'Spur: Anhänger gehen im Gänsemarsch in die Fußstapfen des Anführers. Formation: Anhänger behalten ihren Platz um den Anführer herum (ziehen Sie einen Anhänger, um seinen Platz zu ändern).',
      },
      manualMove: {
        label: 'Eine Patrouille ziehen',
        desc: 'Wenn Sie einen Patrouillenmarker ziehen: Fahren Sie fort (die Route wird an der Stelle fortgesetzt, an der Sie sie abgelegt haben) oder stoppen Sie (die Patrouille endet).',
      },
      stopMarkers: {
        label: 'Stoppmarkierungen',
        desc: 'Statusmarkierungen, die einen Token von seiner Route abhalten und ihn daran hindern, ihm zu folgen, getrennt durch Semikolons (z. B. dead;red) oder keine. Anhänger eines Anführers mit einem dieser Marker bleiben ebenfalls stehen.',
      },
      markerAction: {
        label: 'Markierungsaktion stoppen',
        desc: 'Was ein Patrouillenmarker tut, wenn er einen Stoppmarker erhält: anhalten (er bleibt dort, wo er ist) oder zurücksetzen (er geht dorthin zurück, wo er begonnen hat).',
      },
      wallMode: {
        label: 'Wände',
        desc: 'Was Patrouillen und Verfolger bei dynamischen Beleuchtungswänden und geschlossenen Türen und Fenstern tun: ignorieren (durchgehen), halten (warten, bis der Weg frei ist, zum Beispiel bis sich eine Tür öffnet) oder umdrehen (Streifen umdrehen). Jeder Weg kann seinen eigenen wählen, sodass Geister immer noch durch Wände gehen können.',
      },
      wallCheck: {
        label: 'Wandcheck',
        desc: 'Mitte: Nur die Mitte eines Spielsteins darf von Wänden fern bleiben. Breite: Der gesamte Token reicht aus, daher kann sich ein großer Token nicht durch eine schmale Lücke quetschen.',
      },
      oneWayWalls: {
        label: 'Einbahnstraßen',
        desc: 'Ob Einwegwände Token stoppen (blockieren) oder nicht (passieren).',
      },
      transparentWalls: {
        label: 'Durchsichtige Wände',
        desc: 'Ob transparente Wände, die Licht durchlassen, Spielsteine stoppen (blockieren) oder nicht (passieren).',
      },
      buttonStep: {
        label: 'Zellen pro Klick',
        desc: 'Wie weit bewegen die Aufzeichnungspfeile einen Spielstein?',
      },
      language: {
        label: 'Sprache',
        desc: 'Sprache für Menüs, Nachrichten und Handouts.',
      },
    },
    status: {
      routes: 'Routen',
      patrols: 'Patrouillenmarken',
      followers: 'Folgende Token',
      locked: 'Gesperrte Token',
      recordings: 'Aufnahmen',
      paused: 'Angehalten',
      combat: 'Kampf',
      page: 'Aktuelle Seite',
      grid: 'Netz',
      cell: 'Zellgröße',
      calibration: 'Kalibrierung',
    },
    help: {
      menu: 'Zeigen Sie das Menü an.',
      start: 'Platzieren Sie die ausgewählten Token auf einer Route.',
      stop: 'Stoppen Sie die ausgewählten Token (Patrouillen und Verfolger), jeden Token auf einer Route oder alle.',
      reset: 'Bringen Sie die Token dorthin zurück, wo sie begonnen haben, und stoppen Sie sie.',
      pause: 'Unterbrechen Sie jede Patrouille oder setzen Sie sie fort.',
      lock: 'Halten Sie die ausgewählten Token fest oder lassen Sie sie los.',
      leader: 'Wählen Sie den ausgewählten Token als Anführer aus, dem Sie folgen möchten.',
      follow:
        'Lassen Sie die ausgewählten Spielsteine dem Anführer oder einem namentlich genannten Spielstein folgen.',
      unfollow: 'Stoppen Sie die folgenden ausgewählten Token.',
      add: 'Erstellen Sie eine Route aus einem Schrittcode, z. B. U2R2D2L2.',
      edit: 'Ändern Sie den Schrittcode einer Route.',
      draw: 'Erstellen Sie eine Route, die der ausgewählten Zeichnung auf dieser Seite folgt.',
      bounce:
        'Erstellen Sie eine Route, auf der Spielsteine innerhalb der ausgewählten geschlossenen Zeichnung wandern und von deren Rändern abprallen.',
      record:
        'Zeichnen Sie eine Route auf, indem Sie das ausgewählte Token mit den Tasten verschieben oder ziehen.',
      route: 'Ändern Sie eine Routenoption: Modus, Intervall, Maximum, Zufall, Wände oder Start.',
      show: 'Zeigt die Details und Schaltflächen einer Route an.',
      rename: 'Benennen Sie eine Route um.',
      copy: 'Kopieren Sie eine Route unter einem neuen Namen.',
      remove: 'Eine Route entfernen (fragt zuerst).',
      ids: 'Handeln Sie auf die Token mit diesen IDs anstelle der ausgewählten, sodass andere Mods wie ScriptCards Token steuern können. Remove --ids entfernt die Token von ihren Routen; Es wird niemals eine Route entfernt.',
      list: 'Listen Sie die Routen oder die kontrollierten Token auf.',
      examples: 'Fügen Sie die Beispielrouten hinzu.',
      export: 'Routen als Text anzeigen, um sie in ein anderes Spiel zu kopieren.',
      import: 'Routen aus Exporttext hinzufügen.',
      combat: 'Schalten Sie den Kampf manuell ein oder aus.',
      set: 'Ändern Sie eine Einstellung oder zeigen Sie alle Einstellungen an.',
      calibrate:
        'Richten Sie das Raster so aus, dass die Token in die Zellmitte eingerastet sind, oder entfernen Sie die Kalibrierung.',
      status: 'Zeigen Sie, was der Mod macht und wie er diese Seite sieht.',
      journal: 'Erstellen Sie die Handzettel für das Hilfe- und Befehlsdeck neu.',
      help: 'Diese Liste anzeigen.',
      footer:
        'Vollständige Anweisungen finden Sie im Handout „{help}“. Schaltflächen befinden sich in „{deck}“. {legacy} funktionieren weiterhin mit den Befehlen der Version 4.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Patrouillen, Anhänger und Schlösser für Jumpgate- und Legacy-Spiele',
      overview: {
        heading: 'Überblick',
        body: 'TokenController verschiebt Token für Sie. Geben Sie einem Wachmann eine Patrouillenroute, lassen Sie einen Karren seinem Fahrer folgen oder fixieren Sie eine Statue. Routen können als Schrittcode eingegeben, anhand einer Zeichnung auf der Karte verfolgt oder durch Verschieben eines Tokens aufgezeichnet werden. Routen funktionieren auf quadratischen, sechseckigen, isometrischen, dimetrischen und rasterlosen Seiten.',
      },
      quickStart: {
        heading: 'Schnellstart',
        steps: [
          'Öffnen Sie das Command Deck-Handout oder geben Sie !tokencontroller für das Menü ein.',
          'Klicken Sie auf Beispiele, um einige vorgefertigte Routen hinzuzufügen, oder auf Schrittcode, um Ihren eigenen einzugeben (z. B. U2R2D2L2).',
          'Wählen Sie einen oder mehrere Token aus und klicken Sie neben einer Route auf „Starten“.',
          'Wählen Sie ein Token aus und klicken Sie auf „Stopp“, um es zu stoppen, oder auf „Zurücksetzen“, um es an den Ausgangspunkt zurückzusetzen.',
        ],
      },
      routes: {
        heading: 'Routen erstellen',
        points: [
          'Schrittcode: Geben Sie Bewegungen wie U2R2D2L2 ein. Codes sind nicht an einen Ort auf der Karte gebunden, sodass überall dieselbe Route funktioniert.',
          'Aus Zeichnung: Zeichnen Sie mit den Zeichenwerkzeugen eine Linie, ein Polygon, eine Freihandform, ein Rechteck oder eine Ellipse, wählen Sie sie aus und klicken Sie auf „Aus Zeichnung“. Token laufen daran entlang, nur auf dieser Seite. Sie können die Zeichnung anschließend löschen.',
          'Aufzeichnen: Wählen Sie ein Token aus und klicken Sie auf Aufzeichnen. Bewegen Sie es mit den Pfeiltasten oder ziehen Sie es auf der Karte (Roll20 Wegpunkte werden verfolgt) und klicken Sie dann auf Speichern. Auf quadratischen Rastern wird die Aufnahme zu einem Schrittcode, den Sie bearbeiten können.',
          'Rundrouten beginnen wieder von vorne; Hin- und Herrouten gehen den Weg zurück, den sie gekommen sind; Sobald Routen am Ende anhalten. Neue Routen, die dort enden, wo sie beginnen, Schleife; andere gehen hin und her.',
          'Bounce-Bereich: Zeichnen Sie eine geschlossene Form um den Bereich, wählen Sie ihn aus und klicken Sie auf Bounce-Bereich. Darauf begonnene Spielsteine bewegen sich in geraden Linien und prallen von seinen Kanten (und von Wänden, es sei denn, die Route ignoriert sie) ab, wobei sie sich jedes Mal ein wenig zufällig drehen. Beim zufälligen Start wird jeder Spielstein in eine zufällige Zelle des Bereichs gelegt.',
        ],
      },
      codes: {
        colCode: 'Code',
        colMeaning: 'Bedeutung',
        move: 'Eine Zelle nach oben, unten, links oder rechts bewegen.',
        diagonal: 'Bewegen Sie sich diagonal.',
        distance: 'Eine Zahl hinter einer Richtung verschiebt so viele Zellen.',
        face: 'Drehen Sie sich, um in eine Richtung zu schauen, ohne sich zu bewegen (erfordert Turn-Token).',
        wait: 'Warten Sie einen Schritt oder die angegebene Anzahl von Schritten.',
        stealth:
          'Bewegen Sie den Token zwischen der Token-Ebene und der GM-Ebene, sodass er verschwindet und wieder erscheint.',
      },
      routeOptions: {
        heading: 'Routenoptionen',
        colOption: 'Option',
        colMeaning: 'Bedeutung',
        mode: 'Schleife, Pingpong (hin und her) oder einmal.',
        interval: 'Millisekunden pro Schritt für diese Route oder 0 für das globale Intervall.',
        max: 'Die meisten Token, die gleichzeitig auf der Route sein können, oder 0 für keine Begrenzung.',
        random: 'on: Jeder Token beginnt an einem zufälligen Punkt entlang der Route.',
        walls:
          'ignorieren (durch Wände gehen), halten (an Wänden und geschlossenen Türen warten), umdrehen (umdrehen) oder Standard (die Einstellung „Wände“ verwenden).',
        start:
          'Set: Token springen beim Start zur Position des ausgewählten Tokens. Klar: Sie fangen dort an, wo sie stehen.',
      },
      tokens: {
        heading: 'Kontrollierte Token',
        points: [
          'Ein Token befindet sich jeweils auf einer Route. Das Starten auf einer anderen Route ersetzt die erste.',
          'Stop lässt die Token dort, wo sie sind. Beim Zurücksetzen werden sie auf die ursprüngliche Ebene zurückgesetzt, wo sie sich vor dem Start befanden.',
          'Das Schloss hält einen Token an Ort und Stelle. Gesperrte Token patrouillieren oder folgen nicht, bis sie entsperrt werden.',
          'Folgen: Wählen Sie den Anführer aus und klicken Sie auf „Anführer“. Wählen Sie dann die Follower aus und klicken Sie auf „Folgen“. Sie können auch den Namen des Anführers eingeben: !tokencontroller follow Goblin Boss. Follower folgen Token, die patrouillieren, Token, die Sie ziehen, und Token, die von TokenMod verschoben werden.',
          'Follower können anderen Followern folgen und so eine Kette oder Spalte bilden.',
          'Durch Ziehen eines Patrouillenmarkers wird die Patrouille an der Stelle fortgesetzt, an der Sie sie abgelegt haben, es sei denn, das Ziehen einer Patrouille ist auf Stopp eingestellt.',
          'Wände: Wenn die Einstellung „Wände“ aktiviert ist, gehen Patrouillen und Begleiter nicht durch dynamische Beleuchtungswände oder geschlossene Türen und Fenster; Offene Türen und Fenster lassen sie durch. Geben Sie einer Route die Option „eigene Wände“ (z. B. „Ignorieren“ für einen Geist).',
          'Stoppmarkierungen: Ein Spielstein, der eine dieser Statusmarkierungen erhält (z. B. tot), verlässt seine Route und hört auf, ihm zu folgen, und die Anhänger eines Anführers, der einen Stopp erhält, ebenfalls. Setzen Sie sie mit !tokencontroller set stopMarkers dead;red. Dies funktioniert auch, wenn ein anderer Mod die Markierung hinzufügt.',
        ],
      },
      grids: {
        heading: 'Gitter',
        points: [
          'Die Zellengröße und der Rastertyp werden von jeder Seite gelesen, sodass verschiedene Seiten unterschiedliche Raster verwenden können.',
          'U und D bedeuten immer auf und ab auf dem Bildschirm. Auf Hex-Gittern erfolgt die Bewegung ohne passenden Nachbarn im Zickzack; Auf isometrischen und dimetrischen Gittern kreuzen Diagonalen eine Raute.',
          'Seiten mit deaktivierter Einrastfunktion werden in 70-Pixel-Schritten verschoben, ohne dass sie in einem Raster ausgerichtet werden.',
          'Wenn Token vom Raster abweichen, rasten Sie einen Token in der Mitte einer Zelle ein, wählen Sie ihn aus und klicken Sie auf Kalibrieren. Wählen Sie zwei Token in benachbarten Zellen einer Zeile aus, um auch die Zellengröße festzulegen.',
        ],
      },
      combat: {
        heading: 'Kampf',
        points: [
          'Die Kampferkennung legt fest, wie der Kampf erkannt wird: der Turn-Tracker, die Schaltflächen „Kampf ein/aus“ oder beides.',
          'Das Kampfverhalten legt fest, was Patrouillen tun: pausieren, bei jedem Durchgang einen Schritt weitergehen oder in Bewegung bleiben.',
          '„Alles anhalten“ stoppt jede Patrouille jederzeit; Resume startet sie erneut.',
        ],
      },
      commands: {
        heading: 'Befehle',
        intro:
          'Nur GMs können diese Befehle verwenden. Routen können über die Menüschaltflächen benannt oder mit ihrer #id bezeichnet werden. Setzen Sie Namen mit Leerzeichen in „Anführungszeichen“, wenn ein Befehl zwei Namen annimmt.',
        mods: 'Auch andere Mods können diese Befehle senden, beispielsweise von ScriptCards. Sie können keine Token auswählen und benennen sie daher mit --ids, gefolgt von durch Semikolons getrennten Token-IDs: !tc stop --ids ID1;ID2. Antworten gehen an den GM.',
        colCommand: 'Befehl',
        colDesc: 'Was es bewirkt',
      },
      settings: {
        heading: 'Einstellungen',
        intro:
          'Ändern Sie die Einstellungen über das Menü, mit !tokencontroller set <setting> <value>, oder auf der Seite „Mod-Einstellungen“ im Bildschirm „API-Skripte“.',
        colKey: 'Schlüssel',
        colName: 'Einstellung',
        colDesc: 'Beschreibung',
      },
      upgrading: {
        heading: 'Upgrade von Version 4',
        points: [
          'Pfade, Patrouillenmarken, Schlösser, Anhänger und unvollendete Entwürfe bleiben erhalten. Entwürfe werden zu Routen, die mit „(Entwurf)“ enden.',
          'Ihre Einstellungen der Version 4 bleiben erhalten: Intervall, Unterschritte, Rotation, Kampfpatrouille und Einheiten pro Klick.',
          'Die Befehle !tc und !token-control sowie die T-Cntrl_-Makros funktionieren weiterhin. Die Tabelle zeigt die neuen Befehle.',
          'Version 4 sendete nach jeder Aktion das gesamte Menü; Version 5 sendet stattdessen eine kurze Antwort.',
          'Die Einstellung „Pixel pro Einheit“ ist weg: Die Zellengröße stammt von jeder Seite. HTML Builder wird nicht mehr benötigt.',
          'Das alte Handout zur Benutzungsanleitung, das jeder Spieler sehen konnte, wird durch dieses Nur-GM-Handout ersetzt.',
        ],
        colV4: 'Version 4',
        colV5: 'Version 5',
      },
      troubleshooting: {
        heading: 'Fehlerbehebung',
        points: [
          'Token bewegen sich nicht: Überprüfen Sie den Status. Patrouillen warten, während sie pausiert sind, während sie gesperrt sind, und im Kampf, wenn das Kampfverhalten pausiert ist.',
          'Token bewegen sich im falschen Abstand: Die Rastergröße oder Ausrichtung der Seite hat sich möglicherweise geändert; Versuchen Sie es mit Kalibrieren.',
          'Eine gezeichnete Route startet nicht: Gezeichnete Routen funktionieren nur auf der Seite, auf der sie gezeichnet wurden.',
          'Anhänger bewegen sich nicht, wenn ein anderer Mod den Anführer bewegt: Nur TokenMod meldet seine Bewegungen. Andere Mods können TokenController.ObserveTokenChange aufrufen.',
          'Melden Sie Probleme im Roll20-Forum mit Nachrichten von der API-Konsole.',
        ],
      },
      languages: {
        heading: 'Sprachen',
        body: 'TokenController ist in die folgenden Sprachen übersetzt. Wählen Sie eine mit der Spracheinstellung aus.',
        colCode: 'Code',
        colName: 'Sprache',
        colNative: 'Einheimischer Name',
      },
      credits: {
        heading: 'Credits',
        original: 'Original Mod von',
        maintainer: 'Version 5, gepflegt von',
        support: 'Melden Sie Fehler und Ideen im Roll20 Mod-Forum oder auf GitHub.',
      },
      footer: 'Schaltflächen für jede Aktion finden Sie im Handout „{deck}“.',
    },
    deck: {
      subtitle: 'Kommandodeck',
      patrolsDesc: 'Starten, stoppen und pausieren Sie Patrouillen. Wählen Sie zuerst Token aus.',
      createDesc:
        'Erstellen Sie Routen anhand eines Schrittcodes, einer Zeichnung oder durch Aufzeichnen eines Tokens.',
      selectedDesc: 'Sperren Sie Token oder lassen Sie sie einem Anführer folgen.',
      toolsDesc: 'Kampf, Einstellungen und Rasterwerkzeuge.',
      footer: 'Vollständige Anweisungen finden Sie im Handout „{help}“.',
    },
  };

  const TRANSLATION$d = {
    titles: {
      ready: 'Το TokenController είναι έτοιμο.',
      settings: 'Ρυθμίσεις TokenController',
      help: 'Εντολές TokenController',
      export: 'Εξαγωγή διαδρομής',
      routes: 'Διαδρομές',
      tokens: 'Ελεγχόμενα Tokens',
      status: 'Κατάσταση TokenController',
    },
    messages: {
      migrated:
        'Αναβαθμίστηκε από την έκδοση 4. Διατηρήθηκαν διαδρομές: {routes}. Διατηρούνται διακριτικά περιπολίας: {patrols}. Οι παλιές σας μακροεντολές και !tc εξακολουθούν να λειτουργούν.',
      removedGuide:
        'Το παλιό φυλλάδιο "TokenController Usage Guide", το οποίο μπορούσαν να δουν οι παίκτες, αντικαταστάθηκε από το φυλλάδιο Βοήθειας μόνο για GM.',
      pruned: 'Περιπολίες ξεχασμένες επειδή τα διακριτικά τους δεν υπάρχουν πλέον: {count}.',
      readyHint: 'Πληκτρολογήστε !tokencontroller για το μενού ή ανοίξτε το φυλλάδιο Command Deck.',
      combatStarted: {
        pause: 'Ο αγώνας έχει ξεκινήσει: οι περιπολίες σταματούν μέχρι να τελειώσουν.',
        step: 'Η μάχη έχει ξεκινήσει: οι περίπολοι κινούνται ένα βήμα σε κάθε στροφή.',
      },
      combatEnded: 'Ο αγώνας τελείωσε: οι περιπολίες συνεχίζονται.',
      routeAdded: 'Προστέθηκε η διαδρομή "{name}" ({mode}).',
      routeUpdated:
        'Η διαδρομή "{name}" ενημερώθηκε. Τα διακριτικά σε αυτό συνεχίζουν με τη νέα διαδρομή.',
      confirmRemove:
        'Κατάργηση διαδρομής "{name}"; Διακριτικά σε αυτό που θα σταματήσουν: {count}.',
      routeRemoved: 'Η διαδρομή "{name}" καταργήθηκε. Τα διακριτικά σταμάτησαν: {count}.',
      routeRenamed: 'Η διαδρομή "{from}" μετονομάστηκε σε "{to}".',
      examplesAdded: 'Παραδείγματα διαδρομών που προστέθηκαν: {count}.',
      exportHint:
        'Αντιγράψτε το παρακάτω κείμενο και επικολλήστε το μετά το {command} σε οποιοδήποτε παιχνίδι.',
      imported:
        'Εισαγόμενα {added} διαδρομές. παράβλεψε {skipped} (όνομα που χρησιμοποιείται ήδη ή δεν είναι έγκυρο).',
      started: 'Το {tokens} ξεκίνησε στις "{name}".',
      stopped: 'Τα διακριτικά σταμάτησαν: {count}.',
      reset: 'Τα διακριτικά επέστρεψαν εκεί που ξεκίνησαν: {count}.',
      locked: 'Κλειδωμένο: {tokens} ({mode}).',
      unlocked: 'Ξεκλείδωτο: {tokens}.',
      leaderSet: 'Ο {token} είναι ο ηγέτης. Επιλέξτε τους ακόλουθους και κάντε κλικ στο Follow.',
      following: 'Τώρα ακολουθεί {leader} ({mode}): {tokens}.',
      unfollowed: 'Τα διακριτικά που δεν ακολουθούν πλέον: {count}.',
      noRecordings: 'Δεν καταγράφεται τίποτα.',
      recordingCancelled: 'Η εγγραφή "{name}" ακυρώθηκε.',
      languages: 'Υποστηριζόμενες γλώσσες: {list}',
      settingChanged: 'Το {setting} είναι πλέον {value}.',
      combatOn: 'Η μάχη ενεργοποιήθηκε.',
      combatOff: 'Η μάχη απενεργοποιήθηκε.',
      calibrationCleared: 'Η βαθμονόμηση πλέγματος καταργήθηκε από αυτήν τη σελίδα.',
      calibrated: 'Το πλέγμα βαθμονομήθηκε για αυτήν τη σελίδα (μέγεθος κελιού × {scale}).',
      paused: 'Όλες οι περιπολίες σταμάτησαν.',
      resumed: 'Οι περιπολίες ξεκίνησαν ξανά.',
      journalRebuilt: 'Ανακατασκευή φυλλαδίων: {help} και {deck}.',
      markerStopped: 'Σταμάτησε από έναν δείκτη διακοπής: {tokens}.',
      markerReset: 'Στάλθηκε πίσω στο σημείο όπου ξεκίνησαν με έναν δείκτη διακοπής: {tokens}.',
    },
    errors: {
      noTokens: 'Δεν επιλέχθηκαν διακριτικά.',
      noRouteName: 'Δεν δόθηκε όνομα διαδρομής.',
      routeNotFound: 'Δεν υπάρχει διαδρομή που να ονομάζεται "{name}".',
      routeExists: 'Υπάρχει ήδη μια διαδρομή που ονομάζεται "{name}".',
      code: {
        empty: 'Ο κωδικός βήματος είναι κενός.',
        badToken: 'Ο κωδικός βήματος "{code}" έχει κάτι που δεν κατανοεί στο "{at}".',
        tooFar: 'Το βήμα "{at}" είναι πολύ μεγάλο.',
      },
      routeInvalid: 'Δεν ήταν δυνατή η αποθήκευση αυτής της διαδρομής.',
      usageAdd: 'Δώστε ένα όνομα και έναν κωδικό βήματος.',
      usageEdit: 'Δώστε μια διαδρομή και έναν νέο κωδικό βήματος.',
      selectOneDrawing:
        'Επιλέξτε ακριβώς ένα σχέδιο (γραμμή, πολύγωνο, σχήμα ελεύθερου, ορθογώνιο ή έλλειψη).',
      drawingEmpty: 'Το επιλεγμένο σχέδιο έχει πολύ λίγα σημεία για να ακολουθήσει.',
      usageRoute: 'Δώστε μια διαδρομή, μια επιλογή και μια αξία.',
      unknownRouteOption: 'Δεν υπάρχει επιλογή διαδρομής με το όνομα "{option}".',
      selectOneToken: 'Επιλέξτε ακριβώς ένα διακριτικό.',
      badRouteValue: 'Το "{value}" δεν είναι έγκυρη τιμή για {option}.',
      usageRename: 'Δώστε μια διαδρομή και το νέο της όνομα.',
      usageCopy: 'Δώστε μια διαδρομή και ένα όνομα για το αντίγραφο.',
      badJson: 'Αυτό δεν είναι κείμενο εξαγωγής διαδρομής.',
      tokenLocked: 'Το {tokens} δεν μπορεί να ξεκινήσει: κλειδωμένο.',
      tokenMarked: 'Το {tokens} δεν μπορεί να ξεκινήσει: έχουν δείκτη διακοπής.',
      outsideArea: 'Το {tokens} δεν μπορεί να ξεκινήσει: είναι εκτός του "{name}".',
      selectOneArea:
        'Επιλέξτε ακριβώς ένα κλειστό σχέδιο (ένα πολύγωνο, ορθογώνιο, έλλειψη ή βρόχο ελεύθερου χεριού).',
      areaTooSmall:
        'Το επιλεγμένο σχέδιο χρειάζεται τουλάχιστον τρεις γωνίες για να δημιουργήσει μια περιοχή.',
      idsNotFound: 'Κανένα διακριτικό δεν έχει αυτά τα αναγνωριστικά: {ids}.',
      routeOnOtherPage:
        'Το {tokens} δεν μπορεί να ξεκινήσει: Το "{name}" σχεδιάστηκε σε άλλη σελίδα.',
      startOnOtherPage:
        'Το {tokens} δεν μπορεί να ξεκινήσει: η σταθερή έναρξη του "{name}" βρίσκεται σε άλλη σελίδα.',
      routeFull: 'Το {tokens} δεν μπορεί να ξεκινήσει: "{name}" έχει ήδη {max} διακριτικά.',
      noPage: 'Δεν ήταν δυνατή η εύρεση της σελίδας.',
      emptyTrack: 'Το {tokens} δεν μπορεί να ξεκινήσει: "{name}" δεν έχει κινήσεις.',
      leaderNotFound: 'Δεν βρέθηκε κανένα διακριτικό με το όνομα "{name}" σε αυτήν τη σελίδα.',
      noLeader: 'Δεν υπάρχει ακόμη αρχηγός.',
      followLoop: 'Το {tokens} δεν μπορεί να ακολουθήσει ένα διακριτικό που τον ακολουθεί.',
      alreadyRecording: 'Το {token} καταγράφεται ήδη.',
      recordingTokenGone: 'Το διακριτικό για την εγγραφή "{name}" δεν υπάρχει πλέον.',
      recordingEmpty: 'Δεν έχει καταγραφεί τίποτα ακόμα.',
      unknownSetting: 'Δεν υπάρχει ρύθμιση με το όνομα "{key}".',
      badSettingValue: 'Το "{value}" δεν είναι έγκυρη τιμή για {key}.',
      calibrateNeedsTokens: 'Επιλέξτε ένα ή δύο διακριτικά που έχουν κολλήσει στα κέντρα κελιών.',
      calibrateFailed:
        'Τα επιλεγμένα διακριτικά δεν μπορούσαν να χρησιμοποιηθούν για τη βαθμονόμηση του πλέγματος.',
      unknownCommand: 'Άγνωστη εντολή "{command}".',
      gmOnly: 'Μόνο ο GM μπορεί να χρησιμοποιήσει το TokenController.',
      internal: 'Κάτι πήγε στραβά. Οι λεπτομέρειες βρίσκονται στην κονσόλα API.',
    },
    hints: {
      noTokens: 'Επιλέξτε πρώτα τα διακριτικά στον χάρτη.',
      noRouteName: 'Για παράδειγμα: !tokencontroller προσθέστε το Guard Walk U2R2D2L2',
      routeNotFound: 'Πληκτρολογήστε !tokencontroller list για να δείτε όλες τις διαδρομές.',
      code: {
        empty: 'Για παράδειγμα: U2R2D2L2',
        badToken:
          'Χρησιμοποιήστε U, D, L, R, UL, UR, DL ή DR με έναν αριθμό κυψελών, W για αναμονή και S για stealth.',
        tooFar: 'Ένα μόνο βήμα μπορεί να είναι το πολύ 100 κελιά. περιμένει το πολύ 100 τικ.',
      },
      selectOneDrawing:
        'Σχεδιάστε τη διαδρομή με ένα εργαλείο σχεδίασης, επιλέξτε την (σύρετε ένα πλαίσιο γύρω από ένα λεπτό περίγραμμα, εάν το χάσετε με κλικ) και δοκιμάστε ξανά.',
      usageRoute: 'Επιλογές: λειτουργία, διάστημα, μέγιστο, τυχαίο, τοίχοι, έναρξη.',
      routeOnOtherPage:
        'Οι σχεδιασμένες διαδρομές λειτουργούν μόνο στη σελίδα στην οποία σχεδιάστηκαν.',
      startOnOtherPage:
        'Διαγράψτε τη σταθερή εκκίνηση ή μετακινήστε πρώτα το διακριτικό σε αυτήν τη σελίδα.',
      noLeader:
        'Επιλέξτε τον οδηγό και κάντε κλικ στο Leader ή δώστε το όνομά του: !tokencontroller follow Name',
      leaderNotFound:
        'Χρησιμοποιήστε το όνομα διακριτικού ακριβώς όπως φαίνεται στον χάρτη ή το αναγνωριστικό διακριτικού του.',
      badJson: 'Επικολλήστε ακριβώς το κείμενο από το !tokencontroller export (ή v4 exportpaths).',
      unknownSetting: 'Πληκτρολογήστε !tokencontroller set για να δείτε όλες τις ρυθμίσεις.',
      calibrateNeedsTokens:
        'Ένα διακριτικό ευθυγραμμίζει το πλέγμα. δύο διακριτικά σε γειτονικά κελιά μιας σειράς καθορίζουν επίσης το μέγεθος του κελιού.',
      calibrateFailed:
        'Βεβαιωθείτε ότι τα διακριτικά βρίσκονται σε γειτονικά κελιά της ίδιας σειράς (στήλη στις σελίδες Hex (H)).',
      unknownCommand: 'Πληκτρολογήστε !tokencontroller help για τη λίστα των εντολών.',
      tokenLocked: 'Ξεκλειδώστε πρώτα το διακριτικό.',
      tokenMarked: 'Αφαιρέστε το δείκτη ή αλλάξτε τη ρύθμιση Stop Markers.',
      outsideArea:
        'Μετακινήστε πρώτα τα διακριτικά μέσα στην περιοχή ή ενεργοποιήστε την Τυχαία εκκίνηση για τη διαδρομή.',
      selectOneArea:
        'Σχεδιάστε την περιοχή με ένα εργαλείο σχεδίασης, επιλέξτε την (σύρετε ένα πλαίσιο γύρω από ένα λεπτό περίγραμμα, εάν το χάσετε με κλικ) και δοκιμάστε ξανά.',
      idsNotFound: 'Δώστε αναγνωριστικά διακριτικών μετά το --ids, διαχωρισμένα με ερωτηματικά.',
    },
    warnings: {
      idsNotFound:
        'Κανένα διακριτικό δεν έχει αυτά τα αναγνωριστικά, επομένως παραλείφθηκαν: {ids}.',
      offPage:
        'Μέρος της διαδρομής τρέχει από τη σελίδα (βήματα: {count}). Αυτά τα βήματα παραλείπονται.',
      combatTrackerOnly:
        'Το Combat Detection έχει ρυθμιστεί στο turn tracker, επομένως αυτός ο διακόπτης δεν έχει κανένα αποτέλεσμα μέχρι να τον αλλάξετε.',
      unitPx:
        'Η έκδοση 5 διαβάζει το μέγεθος κελιού από κάθε σελίδα, επομένως η παλιά ρύθμιση Pixels Per Unit δεν χρησιμοποιείται πλέον. Εάν τα διακριτικά δεν ευθυγραμμίζονται, χρησιμοποιήστε τη βαθμονόμηση !tokencontroller.',
    },
    values: {
      on: 'Επί',
      off: 'Μακριά από',
      none: 'Κανένας',
      default: 'Αθέτηση',
      noLimit: 'Κανένα όριο',
      ms: '{ms} ms',
      andMore: 'και {count} ακόμη',
      following: 'ακολουθεί {leader}',
      locked: 'κλειδωμένο',
      gridless: 'κανένα κούμπωμα',
      grid: {
        square: 'Πλατεία',
        hex: 'Γοητεύω',
        iso: 'Ισομετρική / Διμετρική',
      },
      mode: {
        loop: 'Βρόχος',
        pingpong: 'Πηγαινοέρχομαι',
        once: 'Μια φορά',
      },
      movement: {
        cell: 'Ένα κελί τη φορά',
        segment: 'Ολόκληρο βήμα τη φορά',
      },
      facing: {
        off: 'Μην στρίβετε',
        up: 'Η τέχνη στραμμένη προς τα πάνω',
        down: 'Η τέχνη στραμμένη προς τα κάτω',
        left: 'Αριστερά πρόσωπα τέχνης',
        right: 'Η τέχνη αντιμετωπίζει σωστά',
      },
      combatDetection: {
        tracker: 'Ανιχνευτής στροφών',
        manual: 'Διακόπτης GM',
        both: 'Γυρίστε το tracker ή το διακόπτη GM',
      },
      combatBehaviour: {
        pause: 'Παύση',
        step: 'Μετακινήστε κάθε στροφή',
        ignore: 'Συνέχισε να κινείσαι',
      },
      lockMode: {
        native: 'Κλείδωμα θέσης Roll20',
        revert: 'Αναίρεση κινήσεων',
        freeze: 'Μείνετε ακίνητοι μόνο',
      },
      followMode: {
        trail: 'Εις μια σειρά',
        formation: 'Σχηματισμός',
      },
      manualMove: {
        continue: 'Συνεχίστε από εκεί',
        stop: 'Σταματήστε την περιπολία',
      },
      markerAction: {
        stop: 'Σταμάτα εκεί που είναι',
        reset: 'Επιστρέψτε στην αρχή',
      },
      wallMode: {
        ignore: 'Περπατήστε μέσα από τοίχους',
        hold: 'Περιμένετε στους τοίχους',
        turn: 'Γυρίστε πίσω στους τοίχους',
      },
      wallCheck: {
        centre: 'Κέντρο του κουπονιού',
        width: 'Ολόκληρο το σύμβολο',
      },
      oneWayWalls: {
        block: 'Φραγμός',
        pass: 'Αφήστε να περάσει',
      },
      transparentWalls: {
        block: 'Φραγμός',
        pass: 'Αφήστε να περάσει',
      },
    },
    menu: {
      statusRunning: 'Διακριτικά περιπολίας: {patrols}. Διαδρομές: {routes}.',
      statusPaused: 'Όλες οι περιπολίες έχουν σταματήσει.',
      statusCombat: {
        pause: 'Σε μάχη: οι περιπολίες διακόπτονται.',
        step: 'Στη μάχη: οι περιπολίες κινούνται σε κάθε στροφή.',
      },
      routes: 'Διαδρομές',
      noRoutes:
        'Δεν υπάρχουν ακόμη διαδρομές. Προσθέστε ένα, σχεδιάστε ένα, καταγράψτε ένα ή προσθέστε τα παραδείγματα.',
      create: 'Νέα Διαδρομή',
      selected: 'Επιλεγμένα διακριτικά',
      tools: 'Εργαλεία',
      recordings: 'Ηχογραφήσεις',
      patrols: 'Περιπολίες',
    },
    buttons: {
      start: 'Αρχή',
      stop: 'Στάση',
      add: 'Κωδικός βήματος',
      draw: 'Από το σχέδιο',
      bounce: 'Περιοχή αναπήδησης',
      record: 'Ρεκόρ',
      examples: 'Παραδείγματα',
      reset: 'Επαναφορά',
      lock: 'Κλειδαριά',
      unlock: 'Ξεκλειδώνω',
      leader: 'Ηγέτης',
      follow: 'Ακολουθώ',
      unfollow: 'Κατάργηση παρακολούθησης',
      resume: 'Συνέχιση',
      pause: 'Παύση όλων',
      combatOn: 'Μάχη ενεργή',
      combatOff: 'Μάχη ανενεργή',
      stopAll: 'Σταματήστε όλα',
      settings: 'Ρυθμίσεις',
      status: 'Κατάσταση',
      help: 'Βοήθεια',
      open: 'Ανοιχτό',
      clearStart: 'Σαφής',
      setStart: 'Ορίστε σε Επιλεγμένα',
      edit: 'Επεξεργασία κώδικα',
      rename: 'Μετονομάζω',
      copy: 'Αντίγραφο',
      export: 'Εξαγωγή',
      remove: 'Αφαιρώ',
      menu: 'Μενού',
      wait: 'Περιμένετε',
      stealth: 'Λαθραία',
      undo: 'Ξεκάνω',
      save: 'Εκτός',
      cancel: 'Ματαίωση',
      confirm: 'Ναι, αφαιρέστε το',
      startRoute: 'Έναρξη διαδρομής',
      list: 'Κατάλογος Διαδρομών',
      calibrate: 'Μετρώ την διάμετρο',
    },
    prompts: {
      name: 'Όνομα διαδρομής',
      code: 'Κωδικός βήματος',
      interval: 'Χιλιοστά του δευτερολέπτου ανά βήμα (0 = προεπιλογή)',
      maxTokens: 'Τα περισσότερα διακριτικά ταυτόχρονα (0 = χωρίς όριο)',
      newName: 'Νέο όνομα',
      route: 'Όνομα διαδρομής',
    },
    route: {
      drawn: 'Τραβηγμένη διαδρομή, {points} βαθμοί',
      recorded: 'Καταγεγραμμένη διαδρομή, {points} βαθμοί',
      area: 'Περιοχή αναπήδησης, {points} γωνίες',
      path: 'Μονοπάτι',
      mode: 'Τρόπος',
      interval: 'Διάστημα',
      maxTokens: 'Τα περισσότερα κουπόνια',
      randomStart: 'Τυχαία εκκίνηση',
      walls: 'Τοίχοι',
      start: 'Διορθώθηκε η εκκίνηση',
      tokens: 'Μαρτυρίες',
    },
    record: {
      title: 'Εγγραφή "{name}"',
      intro:
        'Εγγραφή {token} (μετακινείται μέχρι στιγμής: {count}). Κάντε κλικ στα βέλη ή σύρετε το διακριτικό στον χάρτη. κάθε κίνηση καταγράφεται.',
    },
    settings: {
      interval: {
        label: 'Διάστημα',
        desc: 'Χιλιοστά του δευτερολέπτου μεταξύ των βημάτων. Κάθε διαδρομή μπορεί να την παρακάμψει.',
      },
      movement: {
        label: 'Κίνηση',
        desc: 'Το κελί μετακινεί ένα κελί ανά βήμα. Το τμήμα μετακινεί ένα ολόκληρο βήμα (όπως το U3) ταυτόχρονα, όπως έκανε η έκδοση 4.',
      },
      facing: {
        label: 'Tokens Turn',
        desc: 'Γυρίστε τα κουπόνια προς τα εκεί που πάνε: απενεργοποιημένα ή με τον τρόπο που βλέπει η τέχνη του κουπόνι (πάνω, κάτω, αριστερά ή δεξιά).',
      },
      combatDetection: {
        label: 'Ανίχνευση Μάχης',
        desc: 'Πώς παρατηρείται η μάχη: ιχνηλάτης (το δρομολογητή στροφής είναι ανοιχτό με κάποιον μέσα), χειροκίνητο (τα κουμπιά On/Off Combat) ή και τα δύο.',
      },
      combatBehaviour: {
        label: 'Συμπεριφορά μάχης',
        desc: 'Τι κάνουν οι περίπολοι στη μάχη: παύση, βήμα (μετακίνηση μία φορά κάθε φορά που περνά η στροφή) ή αγνόηση (συνεχίστε να κινείστε).',
      },
      lockMode: {
        label: 'Λειτουργία κλειδώματος',
        desc: 'Πώς το Lock κρατά ένα διακριτικό: εγγενές (το κλείδωμα θέσης του Roll20, ώστε κανείς να μην μπορεί να το σύρει), επαναφορά (οι κινήσεις αναιρέθηκαν) ή πάγωμα (σταματάει να περιπολεί και να ακολουθεί, αλλά μπορεί ακόμα να συρθεί).',
      },
      lockMarker: {
        label: 'Μαρκαδόρος κλειδαριάς',
        desc: 'Ο δείκτης κατάστασης εμφανίζεται σε κλειδωμένα διακριτικά ή κανένας. Οι παίκτες μπορούν να δουν δείκτες.',
      },
      followMode: {
        label: 'Ακολουθήστε τη λειτουργία',
        desc: 'μονοπάτι: οι οπαδοί περπατούν με ένα μόνο αρχείο στα βήματα του ηγέτη. σχηματισμός: οι ακόλουθοι διατηρούν τη θέση τους γύρω από τον ηγέτη (σύρετε έναν ακόλουθο για να αλλάξετε τη θέση του).',
      },
      manualMove: {
        label: 'Σέρνοντας περιπολικό',
        desc: 'Όταν σύρετε ένα διακριτικό περιπολίας: συνεχίστε (η διαδρομή συνεχίζεται από εκεί που την ρίξατε) ή σταματήστε (η περιπολία τελειώνει).',
      },
      stopMarkers: {
        label: 'Σημάδια στάσης',
        desc: 'Δείκτες κατάστασης που απομακρύνουν ένα διακριτικό από τη διαδρομή του και το σταματούν να ακολουθεί, χωρίζονται με ερωτηματικά (για παράδειγμα νεκρό, κόκκινο) ή κανένα. Οι ακόλουθοι ενός ηγέτη με έναν από αυτούς τους δείκτες σταματούν επίσης.',
      },
      markerAction: {
        label: 'Ενέργεια δείκτη διακοπής',
        desc: 'Τι κάνει ένα διακριτικό περιπολίας όταν λαμβάνει δείκτη διακοπής: σταματήσει (μένει εκεί που είναι) ή επαναφέρει (επιστρέφει στο σημείο που ξεκίνησε).',
      },
      wallMode: {
        label: 'Τοίχοι',
        desc: 'Τι κάνουν οι περίπολοι και οι ακόλουθοι σε τοίχους δυναμικού φωτισμού και κλειστές πόρτες και παράθυρα: αγνοήστε (περπατήστε), κρατήστε (περιμένετε μέχρι να ανοίξει ο δρόμος, για παράδειγμα μέχρι να ανοίξει μια πόρτα) ή στρίψτε (οι περίπολοι γυρίζουν πίσω). Κάθε διαδρομή μπορεί να επιλέξει τη δική της, έτσι τα φαντάσματα μπορούν ακόμα να περπατήσουν μέσα από τοίχους.',
      },
      wallCheck: {
        label: 'Έλεγχος τοίχου',
        desc: 'κέντρο: μόνο η μέση ενός κουπόνι πρέπει να μείνει μακριά από τοίχους. πλάτος: ολόκληρο το διακριτικό κάνει, επομένως ένα μεγάλο κουπόνι δεν μπορεί να πιέσει μέσα από ένα στενό κενό.',
      },
      oneWayWalls: {
        label: 'Μονόδρομοι τοίχοι',
        desc: 'Είτε οι τοίχοι μονής κατεύθυνσης σταματούν μάρκες (μπλοκ) είτε όχι (πάσο).',
      },
      transparentWalls: {
        label: 'Διαφανείς τοίχοι',
        desc: 'Είτε οι διαφανείς τοίχοι, που αφήνουν το φως να περάσει, σταματούν τα κουπόνια (μπλοκ) είτε όχι (περνούν).',
      },
      buttonStep: {
        label: 'Κυψέλες ανά κλικ',
        desc: 'Πόσο μακριά μετακινούν τα βέλη εγγραφής ένα διακριτικό.',
      },
      language: {
        label: 'Γλώσσα',
        desc: 'Γλώσσα για μενού, μηνύματα και φυλλάδια.',
      },
    },
    status: {
      routes: 'Διαδρομές',
      patrols: 'Μαρτυρίες περιπολίας',
      followers: 'Ακολουθώντας μάρκες',
      locked: 'Κλειδωμένα μάρκες',
      recordings: 'Ηχογραφήσεις',
      paused: 'Σε παύση',
      combat: 'Μάχη',
      page: 'Τρέχουσα σελίδα',
      grid: 'Πλέγμα',
      cell: 'Μέγεθος κυττάρου',
      calibration: 'Διαμέτρηση',
    },
    help: {
      menu: 'Εμφάνιση του μενού.',
      start: 'Τοποθετήστε τα επιλεγμένα διακριτικά σε μια διαδρομή.',
      stop: 'Σταματήστε τα επιλεγμένα διακριτικά (περιπολίες και παρακολούθηση), κάθε διακριτικό σε μια διαδρομή ή όλα.',
      reset: 'Επιστρέψτε τα διακριτικά από όπου ξεκίνησαν και σταματήστε τα.',
      pause: 'Παύση ή συνέχιση κάθε περιπολίας.',
      lock: 'Κρατήστε τα επιλεγμένα διακριτικά στη θέση τους ή αφήστε τα.',
      leader: 'Επιλέξτε το επιλεγμένο διακριτικό ως αρχηγό που θα ακολουθήσετε.',
      follow:
        'Κάντε τα επιλεγμένα διακριτικά να ακολουθούν τον αρχηγό ή ένα διακριτικό που δίνεται ονομαστικά.',
      unfollow: 'Σταματήστε τα επιλεγμένα διακριτικά που ακολουθούν.',
      add: 'Δημιουργήστε μια διαδρομή από έναν κωδικό βήματος, όπως το U2R2D2L2.',
      edit: 'Αλλάξτε τον κωδικό βήματος μιας διαδρομής.',
      draw: 'Δημιουργήστε μια διαδρομή που ακολουθεί το επιλεγμένο σχέδιο σε αυτήν τη σελίδα.',
      bounce:
        'Δημιουργήστε μια διαδρομή στην οποία τα διακριτικά περιπλανώνται μέσα στο επιλεγμένο κλειστό σχέδιο, αναπηδώντας από τις άκρες του.',
      record:
        'Καταγράψτε μια διαδρομή μετακινώντας το επιλεγμένο διακριτικό με κουμπιά ή σύροντάς το.',
      route:
        'Αλλάξτε μια επιλογή διαδρομής: λειτουργία, διάστημα, μέγιστο, τυχαίο, τοίχοι ή εκκίνηση.',
      show: 'Εμφάνιση των λεπτομερειών και των κουμπιών μιας διαδρομής.',
      rename: 'Μετονομάστε μια διαδρομή.',
      copy: 'Αντιγράψτε μια διαδρομή με νέο όνομα.',
      remove: 'Κατάργηση διαδρομής (ρωτά πρώτα).',
      ids: 'Ενεργήστε στα διακριτικά με αυτά τα αναγνωριστικά αντί για τα επιλεγμένα, ώστε άλλα Mods όπως οι ScriptCards να μπορούν να ελέγχουν τα διακριτικά. αφαίρεση --ids αφαιρεί τα διακριτικά από τις διαδρομές τους. δεν αφαιρεί ποτέ μια διαδρομή.',
      list: 'Καταγράψτε τις διαδρομές ή τα διακριτικά που ελέγχονται.',
      examples: 'Προσθέστε τα παραδείγματα διαδρομών.',
      export: 'Εμφάνιση διαδρομών ως κείμενο για αντιγραφή σε άλλο παιχνίδι.',
      import: 'Προσθήκη διαδρομών από κείμενο εξαγωγής.',
      combat: 'Ενεργοποιήστε ή απενεργοποιήστε τη μάχη με το χέρι.',
      set: 'Αλλάξτε μια ρύθμιση ή εμφανίστε όλες τις ρυθμίσεις.',
      calibrate:
        'Ευθυγραμμίστε το πλέγμα με κουπόνια που έχουν κουμπώσει στα κέντρα κελιών ή αφαιρέστε τη βαθμονόμηση.',
      status: 'Δείξτε τι κάνει το Mod και πώς βλέπει αυτήν τη σελίδα.',
      journal: 'Αναδημιουργήστε τα φυλλάδια Help and Command Deck.',
      help: 'Εμφάνιση αυτής της λίστας.',
      footer:
        'Πλήρεις οδηγίες βρίσκονται στο φυλλάδιο "{help}". τα κουμπιά βρίσκονται στο "{deck}". Το {legacy} εξακολουθεί να λειτουργεί με τις εντολές της έκδοσης 4.',
    },
    handout: {
      versionLabel: 'Εκδοχή',
      subtitle: 'Περιπολίες, ακόλουθοι και κλειδαριές για παιχνίδια Jumpgate και Legacy',
      overview: {
        heading: 'Επισκόπηση',
        body: 'TokenController μετακινεί μάρκες για εσάς. Δώστε σε έναν φρουρό μια διαδρομή περιπολίας, βάλτε ένα κάρο να ακολουθήσει τον οδηγό του ή κλειδώστε ένα άγαλμα στη θέση του. Οι διαδρομές μπορούν να πληκτρολογηθούν ως κωδικός βήματος, να εντοπιστούν από ένα σχέδιο στον χάρτη ή να καταγραφούν μετακινώντας ένα διακριτικό. Οι διαδρομές λειτουργούν σε τετράγωνες, εξάγωνες, ισομετρικές, διμετρικές και χωρίς πλέγμα σελίδες.',
      },
      quickStart: {
        heading: 'Γρήγορη εκκίνηση',
        steps: [
          'Ανοίξτε το φυλλάδιο Command Deck ή πληκτρολογήστε !tokencontroller για το μενού.',
          'Κάντε κλικ στα Παραδείγματα για να προσθέσετε κάποιες έτοιμες διαδρομές ή τον Κωδικό Βήματος για να πληκτρολογήσετε τη δική σας (για παράδειγμα U2R2D2L2).',
          'Επιλέξτε ένα ή περισσότερα διακριτικά και κάντε κλικ στο Έναρξη δίπλα σε μια διαδρομή.',
          'Επιλέξτε ένα διακριτικό και κάντε κλικ στο Stop για να το σταματήσετε ή στο Reset για να το στείλετε πίσω στο σημείο που ξεκίνησε.',
        ],
      },
      routes: {
        heading: 'Δημιουργία Διαδρομών',
        points: [
          'Κωδικός βήματος: πληκτρολογήστε κινήσεις όπως U2R2D2L2. Οι κωδικοί δεν συνδέονται με ένα μέρος στο χάρτη, επομένως η ίδια διαδρομή λειτουργεί οπουδήποτε.',
          'Από το σχέδιο: σχεδιάστε μια γραμμή, πολύγωνο, σχήμα ελεύθερου χεριού, ορθογώνιο ή έλλειψη με τα εργαλεία σχεδίασης, επιλέξτε το και κάντε κλικ στο Από το σχέδιο. Τα διακριτικά περπατούν κατά μήκος της, μόνο σε αυτήν τη σελίδα. Μπορείτε να διαγράψετε το σχέδιο μετά.',
          'Εγγραφή: επιλέξτε ένα διακριτικό και κάντε κλικ στην Εγγραφή. Μετακινήστε το με τα κουμπιά βέλους ή σύρετέ το στον χάρτη (ακολουθούνται τα σημεία αναφοράς Roll20) και μετά κάντε κλικ στην επιλογή Αποθήκευση. Σε τετράγωνα πλέγματα η εγγραφή γίνεται ένας κωδικός βήματος που μπορείτε να επεξεργαστείτε.',
          'Οι διαδρομές βρόχου ξεκινούν ξανά από την αρχή. Οι διαδρομές πέρα δώθε περπατούν πίσω από τον τρόπο που ήρθαν. μόλις οι διαδρομές σταματήσουν στο τέλος. Νέες διαδρομές που τελειώνουν εκεί που ξεκινούν. άλλοι πάνε πέρα δώθε.',
          'Περιοχή αναπήδησης: σχεδιάστε ένα κλειστό σχήμα γύρω από την περιοχή, επιλέξτε το και κάντε κλικ στην Περιοχή αναπήδησης. Τα διακριτικά που ξεκινούν σε αυτό ταξιδεύουν σε ευθείες γραμμές και αναπηδούν από τις άκρες του (και από τους τοίχους, εκτός αν η διαδρομή τα αγνοεί), γυρίζοντας λίγο τυχαία κάθε φορά. Η τυχαία εκκίνηση τοποθετεί κάθε διακριτικό σε ένα τυχαίο κελί της περιοχής.',
        ],
      },
      codes: {
        colCode: 'Κώδικας',
        colMeaning: 'Εννοια',
        move: 'Μετακίνηση πάνω, κάτω, αριστερά ή δεξιά, ένα κελί.',
        diagonal: 'Μετακινηθείτε διαγώνια.',
        distance: 'Ένας αριθμός μετά από μια κατεύθυνση μετακινεί τόσα κελιά.',
        face: 'Στρίψτε για να κοιτάξετε προς μια κατεύθυνση χωρίς να κινηθείτε (χρειάζονται κουπόνια στροφής).',
        wait: 'Περιμένετε ένα βήμα ή τον συγκεκριμένο αριθμό βημάτων.',
        stealth:
          'Μετακινήστε το διακριτικό μεταξύ του επιπέδου διακριτικού και του επιπέδου GM, έτσι ώστε να εξαφανιστεί και να εμφανιστεί ξανά.',
      },
      routeOptions: {
        heading: 'Επιλογές διαδρομής',
        colOption: 'Επιλογή',
        colMeaning: 'Εννοια',
        mode: 'βρόχο, πινγκ πονγκ (μπρος-πίσω) ή μία φορά.',
        interval:
          'Χιλιοστά του δευτερολέπτου ανά βήμα για αυτήν τη διαδρομή ή 0 για το παγκόσμιο διάστημα.',
        max: 'Τα περισσότερα διακριτικά που μπορούν να βρίσκονται στη διαδρομή ταυτόχρονα ή 0 χωρίς όριο.',
        random: 'on: κάθε διακριτικό ξεκινά από ένα τυχαίο σημείο κατά μήκος της διαδρομής.',
        walls:
          'αγνοήστε (περπατήστε μέσα από τοίχους), κρατήστε πατημένο (περιμένετε σε τοίχους και κλειστές πόρτες), γυρίστε (γυρίστε πίσω) ή προεπιλογή (χρησιμοποιήστε τη ρύθμιση Τοίχοι).',
        start:
          'set: τα διακριτικά μεταπηδούν στη θέση του επιλεγμένου διακριτικού όταν ξεκινούν. ξεκάθαρα: ξεκινούν από εκεί που στέκονται.',
      },
      tokens: {
        heading: 'Έλεγχος διακριτικών',
        points: [
          'Ένα διακριτικό βρίσκεται σε μία διαδρομή τη φορά. Η εκκίνηση σε άλλη διαδρομή αντικαθιστά την πρώτη.',
          'Το Stop αφήνει μάρκες εκεί που βρίσκονται. Η επαναφορά τους επαναφέρει εκεί που ήταν πριν ξεκινήσουν, στο αρχικό τους στρώμα.',
          'Η κλειδαριά κρατά ένα κουπόνι στη θέση του. Τα κλειδωμένα διακριτικά δεν περιπολούν ούτε ακολουθούν μέχρι να ξεκλειδωθούν.',
          'Ακολουθήστε: επιλέξτε τον ηγέτη και κάντε κλικ στο Leader, επιλέξτε τους ακόλουθους και κάντε κλικ στο Follow. Μπορείτε επίσης να πληκτρολογήσετε το όνομα του αρχηγού: !tokencontroller follow Goblin Boss. Οι ακόλουθοι ακολουθούν μάρκες που περιπολούν, μάρκες που σύρετε και μάρκες που μετακινούνται από το TokenMod.',
          'Οι ακόλουθοι μπορούν να ακολουθήσουν άλλους ακόλουθους, φτιάχνοντας μια αλυσίδα ή μια στήλη.',
          'Σύροντας ένα διακριτικό περιπολίας μεταφέρεται η περίπολος από το σημείο που το ρίχνετε, εκτός εάν το Σύρετε ένα Patrol έχει ρυθμιστεί να σταματήσει.',
          'Τείχη: με τα Τείχη αναμμένα, οι περίπολοι και οι ακόλουθοι δεν περνούν μέσα από τοίχους δυναμικού φωτισμού ή κλειστές πόρτες και παράθυρα. ανοιχτές πόρτες και παράθυρα αφήστε τους να περάσουν. Δώστε σε μια διαδρομή τη δική της επιλογή τοίχους (για παράδειγμα αγνοήστε για ένα φάντασμα).',
          'Σημάδια διακοπής: ένα διακριτικό που λαμβάνει έναν από αυτούς τους δείκτες κατάστασης (για παράδειγμα νεκρός) φεύγει από τη διαδρομή του και σταματά να ακολουθεί, και οι ακόλουθοι ενός ηγέτη που λαμβάνει επίσης μία στάση. Ρυθμίστε τα με το !tokencontroller set stopMarkers dead;red. Αυτό λειτουργεί επίσης όταν ένα άλλο Mod προσθέτει τον δείκτη.',
        ],
      },
      grids: {
        heading: 'Πλέγματα',
        points: [
          'Το μέγεθος του κελιού και ο τύπος πλέγματος διαβάζονται από κάθε σελίδα, επομένως διαφορετικές σελίδες μπορούν να χρησιμοποιούν διαφορετικά πλέγματα.',
          'Το U και το D σημαίνουν πάντα πάνω και κάτω στην οθόνη. Σε εξαγωνικά πλέγματα, κινείται χωρίς αντίστοιχο ζιγκ-ζαγκ. σε ισομετρικά και διμετρικά πλέγματα, οι διαγώνιες διασταυρώνονται με ένα διαμάντι.',
          'Οι σελίδες με απενεργοποιημένη απόσπαση μετακινούνται με βήματα 70 pixel χωρίς να ευθυγραμμίζονται σε πλέγμα.',
          'Εάν τα διακριτικά απομακρυνθούν από το πλέγμα, κουμπώστε ένα διακριτικό σε ένα κέντρο κελιών, επιλέξτε το και κάντε κλικ στο Βαθμονόμηση. Επιλέξτε δύο διακριτικά σε γειτονικά κελιά μιας σειράς για να καθορίσετε και το μέγεθος του κελιού.',
        ],
      },
      combat: {
        heading: 'Μάχη',
        points: [
          'Το Combat Detection επιλέγει τον τρόπο με τον οποίο παρατηρείται η μάχη: το turn tracker, τα κουμπιά Combat On/Off ή οποιοδήποτε άλλο.',
          'Το Combat Behavior επιλέγει τι κάνουν οι περίπολοι: παύση, κίνηση ενός βήματος κάθε φορά που περνά η στροφή ή συνεχίζει να κινείται.',
          'Παύση Όλα σταματά κάθε περιπολία ανά πάσα στιγμή. Το Resume τους ξεκινά ξανά.',
        ],
      },
      commands: {
        heading: 'Εντολές',
        intro:
          'Μόνο οι GM μπορούν να χρησιμοποιήσουν αυτές τις εντολές. Οι διαδρομές μπορούν να ονομαστούν ή να αναφέρονται με το #id τους από τα κουμπιά μενού. Βάλτε ονόματα με κενά σε "εισαγωγικά" όταν μια εντολή παίρνει δύο ονόματα.',
        mods: 'Άλλα Mods μπορούν επίσης να στείλουν αυτές τις εντολές, για παράδειγμα από ScriptCards. Δεν μπορούν να επιλέξουν διακριτικά, επομένως τα ονομάζουν με --ids ακολουθούμενα από αναγνωριστικά διακριτικών διαχωρισμένα με ερωτηματικά: !tc stop --ids ID1;ID2. Οι απαντήσεις πηγαίνουν στο GM.',
        colCommand: 'Εντολή',
        colDesc: 'Τι κάνει',
      },
      settings: {
        heading: 'Ρυθμίσεις',
        intro:
          'Αλλάξτε τις ρυθμίσεις από το μενού, με το !tokencontroller που έχει οριστεί <setting> <value> ή στη σελίδα ρυθμίσεων Mod στην οθόνη Scripts API.',
        colKey: 'Κλειδί',
        colName: 'Σύνθεση',
        colDesc: 'Περιγραφή',
      },
      upgrading: {
        heading: 'Αναβάθμιση από την έκδοση 4',
        points: [
          'Διατηρούνται μονοπάτια, μάρκες περιπολίας, κλειδαριές, ακόλουθοι και ημιτελή προσχέδια. Τα πρόχειρα γίνονται διαδρομές που τελειώνουν σε "(πρόχειρο)".',
          'Οι ρυθμίσεις της έκδοσης 4 διατηρούνται: διάστημα, δευτερεύοντα βήματα, περιστροφή, περιπολία μάχης και μονάδες ανά κλικ.',
          'Οι εντολές !tc και !token-control και οι μακροεντολές T-Cntrl_ συνεχίζουν να λειτουργούν. Ο πίνακας δείχνει τις νέες εντολές.',
          'Η έκδοση 4 έστελνε ολόκληρο το μενού μετά από κάθε ενέργεια. Η έκδοση 5 στέλνει μια σύντομη απάντηση.',
          'Η ρύθμιση Pixels Per Unit έχει φύγει: το μέγεθος κελιού προέρχεται από κάθε σελίδα. Το HTML Builder δεν χρειάζεται πλέον.',
          'Το παλιό φυλλάδιο του Οδηγού χρήσης, το οποίο μπορούσε να δει κάθε παίκτης, αντικαθίσταται από αυτό το φυλλάδιο μόνο για GM.',
        ],
        colV4: 'Έκδοση 4',
        colV5: 'Έκδοση 5',
      },
      troubleshooting: {
        heading: 'Αντιμετώπιση προβλημάτων',
        points: [
          'Τα διακριτικά δεν μετακινούνται: ελέγξτε την Κατάσταση. Οι περιπολίες περιμένουν σε παύση, ενώ είναι κλειδωμένες και σε μάχη όταν η Συμπεριφορά Μάχης είναι παύση.',
          'Τα διακριτικά μετακινούνται σε λάθος απόσταση: το μέγεθος πλέγματος ή το κούμπωμα της σελίδας μπορεί να έχει αλλάξει. δοκιμάστε το Calibrate.',
          'Μια σχεδιασμένη διαδρομή δεν θα ξεκινήσει: οι διαδρομές που έχουν σχεδιαστεί λειτουργούν μόνο στη σελίδα στην οποία σχεδιάστηκαν.',
          'Οι ακόλουθοι δεν μετακινούνται όταν ένας άλλος Mod μετακινεί τον αρχηγό: μόνο το TokenMod αναφέρει τις κινήσεις του. Άλλα Mods μπορούν να καλέσουν το TokenController.ObserveTokenChange.',
          'Αναφέρετε προβλήματα στο φόρουμ Roll20 με τυχόν μηνύματα από την κονσόλα API.',
        ],
      },
      languages: {
        heading: 'Γλώσσες',
        body: 'Το TokenController μεταφράζεται στις παρακάτω γλώσσες. Επιλέξτε ένα με τη ρύθμιση Γλώσσα.',
        colCode: 'Κώδικας',
        colName: 'Γλώσσα',
        colNative: 'Εγγενές όνομα',
      },
      credits: {
        heading: 'Πιστώσεις',
        original: 'Αρχικό Mod από',
        maintainer: 'Έκδοση 5 που διατηρείται από',
        support: 'Αναφέρετε σφάλματα και ιδέες στο φόρουμ Roll20 Mod ή στο GitHub.',
      },
      footer: 'Τα κουμπιά για κάθε ενέργεια βρίσκονται στο φυλλάδιο "{deck}".',
    },
    deck: {
      subtitle: 'Κατάστρωμα εντολών',
      patrolsDesc:
        'Ξεκινήστε, σταματήστε και σταματήστε τις περιπολίες. Επιλέξτε πρώτα τα κουπόνια.',
      createDesc:
        'Κάντε διαδρομές από έναν κωδικό βήματος, ένα σχέδιο ή καταγράφοντας ένα διακριτικό.',
      selectedDesc: 'Κλειδώστε τα διακριτικά ή κάντε τα να ακολουθήσουν έναν ηγέτη.',
      toolsDesc: 'Μάχη, ρυθμίσεις και εργαλεία πλέγματος.',
      footer: 'Πλήρεις οδηγίες βρίσκονται στο φυλλάδιο "{help}".',
    },
  };

  const TRANSLATION$c = {
    titles: {
      ready: 'TokenController מוכן.',
      settings: 'הגדרות TokenController',
      help: 'פקודות TokenController',
      export: 'מסלול ייצוא',
      routes: 'מסלולים',
      tokens: 'אסימונים מבוקרים',
      status: 'סטטוס TokenController',
    },
    messages: {
      migrated:
        'שודרג מגרסה 4. מסלולים שנשמרו: {routes}. אסימוני סיור שנשמרו: {patrols}. פקודות המאקרו הישנות שלך ופקודות !tc עדיין פועלות.',
      removedGuide:
        'דף העזר הישן "מדריך השימוש ב-TokenController", ששחקנים יכלו לראות, הוחלף ב-GM בלבד.',
      pruned: 'סיורים נשכחו כי האסימונים שלהם אינם קיימים יותר: {count}.',
      readyHint: 'הקלד !tokencontroller עבור התפריט, או פתח את דף המידע של Command Deck.',
      combatStarted: {
        pause: 'הלחימה החלה: הסיורים מושהים עד לסיומו.',
        step: 'הלחימה החלה: הסיורים נעים צעד אחד בכל תור.',
      },
      combatEnded: 'הקרב הסתיים: הסיורים ממשיכים.',
      routeAdded: 'מסלול "{name}" נוסף ({mode}).',
      routeUpdated: 'המסלול "{name}" עודכן. אסימונים עליו ממשיכים עם המסלול החדש.',
      confirmRemove: 'להסיר את המסלול "{name}"? אסימונים על זה שיעצרו: {count}.',
      routeRemoved: 'המסלול "{name}" הוסר. אסימונים שנעצרו: {count}.',
      routeRenamed: 'שם המסלול "{from}" שונה ל-"{to}".',
      examplesAdded: 'נוספו מסלולים לדוגמה: {count}.',
      exportHint: 'העתק את הטקסט למטה והדבק אותו אחרי {command} בכל משחק.',
      imported: '{added} מסלולים מיובאים; דילג על {skipped} (שם כבר בשימוש או לא חוקי).',
      started: '{tokens} התחיל ב-"{name}".',
      stopped: 'אסימונים שנעצרו: {count}.',
      reset: 'אסימונים הוחזרו למקום שבו הם התחילו: {count}.',
      locked: 'נעול: {tokens} ({mode}).',
      unlocked: 'לא נעול: {tokens}.',
      leaderSet: '{token} הוא המוביל. בחר את העוקבים ולחץ על עקוב.',
      following: 'כעת עוקב אחר {leader} ({mode}): {tokens}.',
      unfollowed: 'אסימונים כבר לא עוקבים אחרי: {count}.',
      noRecordings: 'שום דבר לא מוקלט.',
      recordingCancelled: 'ההקלטה "{name}" בוטלה.',
      languages: 'שפות נתמכות: {list}',
      settingChanged: '{setting} הוא כעת {value}.',
      combatOn: 'הקרב מופעל.',
      combatOff: 'הקרב כבה.',
      calibrationCleared: 'כיול רשת הוסר מדף זה.',
      calibrated: 'רשת מכוילת עבור דף זה (גודל תא × {scale}).',
      paused: 'כל הסיורים עצרו.',
      resumed: 'התחדשו הסיורים.',
      journalRebuilt: 'דפי מידע שנבנו מחדש: {help} ו-{deck}.',
      markerStopped: 'נעצר על ידי סמן עצור: {tokens}.',
      markerReset: 'נשלח חזרה למקום שבו הם התחילו על ידי סמן עצור: {tokens}.',
    },
    errors: {
      noTokens: 'לא נבחרו אסימונים.',
      noRouteName: 'לא ניתן שם מסלול.',
      routeNotFound: 'אין מסלול בשם "{name}".',
      routeExists: 'יש כבר מסלול בשם "{name}".',
      code: {
        empty: 'קוד הצעד ריק.',
        badToken: 'לקוד הצעד "{code}" יש משהו שהוא לא מבין ב-"{at}".',
        tooFar: 'השלב "{at}" ארוך מדי.',
      },
      routeInvalid: 'לא ניתן היה לשמור את המסלול הזה.',
      usageAdd: 'תן שם וקוד צעד.',
      usageEdit: 'תן מסלול וקוד צעד חדש.',
      selectOneDrawing: 'בחר ציור אחד בדיוק (קו, מצולע, צורת יד חופשית, מלבן או אליפסה).',
      drawingEmpty: 'לשרטוט שנבחר יש מעט מדי נקודות לעקוב אחריהם.',
      usageRoute: 'תן מסלול, אופציה וערך.',
      unknownRouteOption: 'אין אפשרות מסלול בשם "{option}".',
      selectOneToken: 'בחר אסימון אחד בדיוק.',
      badRouteValue: '"{value}" אינו ערך חוקי עבור {option}.',
      usageRename: 'תן מסלול ושמו החדש.',
      usageCopy: 'תן מסלול ושם לעותק.',
      badJson: 'זה לא טקסט ייצוא נתיב.',
      tokenLocked: '{tokens} לא יכול להתחיל: נעול.',
      tokenMarked: '{tokens} לא יכול להתחיל: יש להם סמן עצור.',
      outsideArea: '{tokens} לא יכול להתחיל: הם נמצאים מחוץ ל-"{name}".',
      selectOneArea: 'בחר בדיוק ציור סגור אחד (מצולע, מלבן, אליפסה או לולאה חופשית).',
      areaTooSmall: 'הציור שנבחר צריך לפחות שלוש פינות כדי ליצור אזור.',
      idsNotFound: 'לאף אסימונים יש את המזהים הבאים: {ids}.',
      routeOnOtherPage: '{tokens} לא יכול להתחיל: "{name}" צויר בדף אחר.',
      startOnOtherPage: '{tokens} לא יכול להתחיל: ההתחלה הקבועה של "{name}" נמצאת בדף אחר.',
      routeFull: '{tokens} לא יכול להתחיל: "{name}" כבר מכיל {max} אסימונים.',
      noPage: 'הדף לא נמצא.',
      emptyTrack: '{tokens} לא יכול להתחיל: "{name}" אין מהלכים.',
      leaderNotFound: 'לא נמצא אסימון בשם "{name}" בדף זה.',
      noLeader: 'אין עדיין מנהיג.',
      followLoop: '{tokens} לא יכול לעקוב אחר אסימון שעוקב אחריהם.',
      alreadyRecording: '{token} כבר מוקלט.',
      recordingTokenGone: 'האסימון להקלטת "{name}" אינו קיים יותר.',
      recordingEmpty: 'שום דבר עדיין לא נרשם.',
      unknownSetting: 'אין הגדרה בשם "{key}".',
      badSettingValue: '"{value}" אינו ערך חוקי עבור {key}.',
      calibrateNeedsTokens: 'בחר אסימון אחד או שניים שהוצמדו למרכזי תאים.',
      calibrateFailed: 'לא ניתן היה להשתמש באסימונים שנבחרו כדי לכייל את הרשת.',
      unknownCommand: 'פקודה לא ידועה "{command}".',
      gmOnly: 'רק ה-GM יכול להשתמש ב-TokenController.',
      internal: 'משהו השתבש. הפרטים נמצאים במסוף ה-API.',
    },
    hints: {
      noTokens: 'תחילה בחר את האסימונים במפה.',
      noRouteName: 'לדוגמה: !tokencontroller הוסף Guard Walk U2R2D2L2',
      routeNotFound: 'הקלד !Tokencontroller list כדי לראות את כל המסלולים.',
      code: {
        empty: 'לדוגמה: U2R2D2L2',
        badToken: 'השתמש ב-U, D, L, R, UL, UR, DL או DR עם מספר תאים, W להמתנה ו-S להתגנבות.',
        tooFar: 'שלב בודד יכול להיות לכל היותר 100 תאים; ממתין לכל היותר 100 קרציות.',
      },
      selectOneDrawing:
        'צייר את המסלול עם כלי ציור, בחר אותו (גרור תיבה סביב קו מתאר דק אם לחיצה מחמיצה אותו), ואז נסה שוב.',
      usageRoute: 'אפשרויות: מצב, מרווח, מקסימום, אקראי, קירות, התחלה.',
      routeOnOtherPage: 'מסלולים מצוירים פועלים רק בדף שבו הם צוירו.',
      startOnOtherPage: 'נקה את ההתחלה הקבועה, או העבר תחילה את האסימון לדף זה.',
      noLeader: 'בחר את המנהיג ולחץ על Leader, או תן את שמו: !tokencontroller follow Name',
      leaderNotFound: 'השתמש בשם האסימון בדיוק כפי שמוצג במפה, או במזהה האסימון שלו.',
      badJson: 'הדבק את הטקסט מ-!tokencontroller export (או v4 exportpaths) בדיוק.',
      unknownSetting: 'הקלד !tokencontroller set כדי לראות את כל ההגדרות.',
      calibrateNeedsTokens:
        'אסימון אחד מסדר את הרשת; שני אסימונים בתאים שכנים בשורה גם קובעים את גודל התא.',
      calibrateFailed: 'ודא שהאסימונים נמצאים בתאים שכנים של אותה שורה (עמודה בדפי Hex (H).',
      unknownCommand: 'הקלד !tokencontroller help עבור רשימת הפקודות.',
      tokenLocked: 'פתח תחילה את נעילת האסימון.',
      tokenMarked: 'הסר את הסמן, או שנה את ההגדרה Stop Markers.',
      outsideArea: 'הזיזו תחילה את האסימונים בתוך האזור, או הפעל התחלה אקראית עבור המסלול.',
      selectOneArea:
        'צייר את האזור עם כלי ציור, בחר אותו (גרור תיבה סביב קו מתאר דק אם לחיצה מחמיצה אותו), ואז נסה שוב.',
      idsNotFound: 'תן מזהי אסימון אחרי --ids, מופרדים באמצעות נקודה-פסיק.',
    },
    warnings: {
      idsNotFound: 'לאף אסימונים יש את המזהים האלה, ולכן דילגו עליהם: {ids}.',
      offPage: 'חלק מהמסלול עובר מחוץ לדף (שלבים: {count}). מדלגים על השלבים האלה.',
      combatTrackerOnly: 'זיהוי קרב מוגדר למעקב אחר פניות, כך למתג זה אין השפעה עד שתשנה אותו.',
      unitPx:
        'גרסה 5 קוראת את גודל התא מכל עמוד, כך שההגדרה הישנה של פיקסלים ליחידה אינה בשימוש. אם אסימונים אינם עומדים בשורה, השתמש בכיול !tokencontroller.',
    },
    values: {
      on: 'עַל',
      off: 'כבוי',
      none: 'אַף לֹא אֶחָד',
      default: 'בְּרִירַת מֶחדָל',
      noLimit: 'אין הגבלה',
      ms: '{ms} אלפיות השנייה',
      andMore: 'ועוד {count}',
      following: 'עוקב אחר {leader}',
      locked: 'נָעוּל',
      gridless: 'בלי להישבר',
      grid: {
        square: 'מְרוּבָּע',
        hex: 'משושה',
        iso: 'איזומטרי / דימטרי',
      },
      mode: {
        loop: 'לוּלָאָה',
        pingpong: 'הלוך ושוב',
        once: 'פַּעַם',
      },
      movement: {
        cell: 'תא אחד בכל פעם',
        segment: 'שלב שלם בכל פעם',
      },
      facing: {
        off: 'אל תסתובב',
        up: 'האמנות פונה כלפי מעלה',
        down: 'האמנות עם הפנים כלפי מטה',
        left: 'פני אמנות נותרו',
        right: 'אמנות פרצופים נכון',
      },
      combatDetection: {
        tracker: 'גשש סיבובים',
        manual: 'מתג GM',
        both: 'סיבוב גשש או מתג GM',
      },
      combatBehaviour: {
        pause: 'הַפסָקָה',
        step: 'הזיזו כל תור',
        ignore: 'תמשיכי לנוע',
      },
      lockMode: {
        native: 'נעילת העמדה של Roll20',
        revert: 'בטל מהלכים',
        freeze: 'החזיקו בשקט בלבד',
      },
      followMode: {
        trail: 'קובץ בודד',
        formation: 'מַעֲרָך',
      },
      manualMove: {
        continue: 'המשיכו משם',
        stop: 'עצור את הסיור',
      },
      markerAction: {
        stop: 'תפסיק איפה זה',
        reset: 'חזור להתחלה',
      },
      wallMode: {
        ignore: 'ללכת דרך קירות',
        hold: 'חכה ליד קירות',
        turn: 'פנה בחזרה אל הקירות',
      },
      wallCheck: {
        centre: 'מרכז האסימון',
        width: 'אסימון שלם',
      },
      oneWayWalls: {
        block: 'לַחסוֹם',
        pass: 'תן לעבור',
      },
      transparentWalls: {
        block: 'לַחסוֹם',
        pass: 'תן לעבור',
      },
    },
    menu: {
      statusRunning: 'אסימוני סיור: {patrols}. מסלולים: {routes}.',
      statusPaused: 'כל הסיורים מושהים.',
      statusCombat: {
        pause: 'בלחימה: הסיורים מושהים.',
        step: 'בלחימה: סיורים זזים בכל תור.',
      },
      routes: 'מסלולים',
      noRoutes: 'עדיין אין מסלולים. הוסף אחד, צייר אחד, הקלט אחד או הוסף את הדוגמאות.',
      create: 'מסלול חדש',
      selected: 'אסימונים נבחרים',
      tools: 'כְּלֵי עֲבוֹדָה',
      recordings: 'הקלטות',
      patrols: 'פטרולים',
    },
    buttons: {
      start: 'הַתחָלָה',
      stop: 'לְהַפְסִיק',
      add: 'קוד שלב',
      draw: 'מתוך ציור',
      bounce: 'אזור הקפצה',
      record: 'רְשׁוּמָה',
      examples: 'דוגמאות',
      reset: 'אִתחוּל',
      lock: 'לִנְעוֹל',
      unlock: 'לִפְתוֹחַ',
      leader: 'מַנהִיג',
      follow: 'לַעֲקוֹב',
      unfollow: 'בטל את המעקב',
      resume: 'המשך',
      pause: 'השהה הכל',
      combatOn: 'קרב פעיל',
      combatOff: 'קרב כבוי',
      stopAll: 'עצור הכל',
      settings: 'הגדרות',
      status: 'סטָטוּס',
      help: 'עֶזרָה',
      open: 'לִפְתוֹחַ',
      clearStart: 'בָּרוּר',
      setStart: "הגדר ל'נבחר'",
      edit: 'ערוך קוד',
      rename: 'שנה שם',
      copy: 'לְהַעְתִיק',
      export: 'יְצוּא',
      remove: 'לְהַסִיר',
      menu: 'תַפרִיט',
      wait: 'לַחֲכוֹת',
      stealth: 'הִתגַנְבוּת',
      undo: 'לְבַטֵל',
      save: 'לְהַצִיל',
      cancel: 'לְבַטֵל',
      confirm: 'כן, הסר אותו',
      startRoute: 'התחל מסלול',
      list: 'רשימת מסלולים',
      calibrate: 'לְדַרֵג',
    },
    prompts: {
      name: 'שם המסלול',
      code: 'קוד שלב',
      interval: 'אלפיות שניות לכל שלב (0 = ברירת מחדל)',
      maxTokens: 'רוב האסימונים בבת אחת (0 = ללא הגבלה)',
      newName: 'שם חדש',
      route: 'שם המסלול',
    },
    route: {
      drawn: 'מסלול מצויר, {points} נקודות',
      recorded: 'מסלול מתועד, {points} נקודות',
      area: 'אזור הקפצה, {points} פינות',
      path: 'נָתִיב',
      mode: 'מצב',
      interval: 'הַפסָקָה',
      maxTokens: 'רוב האסימונים',
      randomStart: 'התחלה אקראית',
      walls: 'קירות',
      start: 'התחלה קבועה',
      tokens: 'אסימונים',
    },
    record: {
      title: 'הקלטה "{name}"',
      intro:
        'מקליט {token} (מהלכים עד כה: {count}). לחץ על החצים, או גרור את האסימון על המפה; כל מהלך מתועד.',
    },
    settings: {
      interval: {
        label: 'הַפסָקָה',
        desc: 'אלפיות שניות בין צעדים. כל מסלול יכול לעקוף אותו.',
      },
      movement: {
        label: 'תְנוּעָה',
        desc: 'תא מזיז תא אחד בכל צעד; קטע מזיז צעד שלם (כגון U3) בבת אחת, כפי שעשתה גרסה 4.',
      },
      facing: {
        label: 'סיבוב אסימונים',
        desc: 'סובב אסימונים לפנים לאן שהם הולכים: כבוי, או איך שאומנות האסימון פונה (למעלה, למטה, שמאלה או ימינה).',
      },
      combatDetection: {
        label: 'זיהוי קרב',
        desc: 'איך מבחינים בלחימה: גשש (גשש הפניות פתוח עם מישהו בתוכו), ידני (כפתורי ההפעלה/כיבוי של Combat) או שניהם.',
      },
      combatBehaviour: {
        label: 'התנהגות לחימה',
        desc: 'מה עושים סיורים בלחימה: עוצרים, צעדים (זוזים פעם אחת בכל פעם שהתור עובר) או התעלמות (המשיכו לנוע).',
      },
      lockMode: {
        label: 'מצב נעילה',
        desc: 'איך נעילה מחזיקה אסימון: מקורי (נעילת המיקום של Roll20 משלו, כך שאף אחד לא יכול לגרור אותו), לחזור (המהלכים בוטלו) או להקפיא (הוא מפסיק לסייר ולעקוב אבל עדיין ניתן לגרור אותו).',
      },
      lockMarker: {
        label: 'סמן מנעול',
        desc: 'סמן סטטוס מוצג על אסימונים נעולים, או אף אחד. שחקנים יכולים לראות סמנים.',
      },
      followMode: {
        label: 'מצב מעקב',
        desc: 'שביל: עוקבים צועדים קובץ בודד בעקבות המנהיג. היווצרות: עוקבים שומרים על מקומם סביב המנהיג (גררו עוקב כדי לשנות את מקומו).',
      },
      manualMove: {
        label: 'גרירת סיירת',
        desc: 'כאשר אתה גורר אסימון סיור: המשך (המסלול ממשיך מהמקום שבו הפלת אותו) או עצור (הסיור מסתיים).',
      },
      stopMarkers: {
        label: 'סמני סטופ',
        desc: 'סמני סטטוס שמוציאים אסימון מהמסלול שלו ומפסיקים לעקוב אחריו, מופרדים על ידי נקודות פסיק (למשל מת; אדום), או אף אחד. עוקבים של מנהיג עם אחד מהסמנים האלה נעצרים גם הם.',
      },
      markerAction: {
        label: 'פעולת סמן עצירה',
        desc: 'מה שעושה אסימון סיור כשהוא מקבל סמן סטופ: עצור (הוא נשאר איפה שהוא) או איפוס (הוא חוזר למקום שבו הוא התחיל).',
      },
      wallMode: {
        label: 'קירות',
        desc: 'מה עושים סיורים וחסידים בקירות תאורה דינמיים ובדלתות וחלונות סגורים: מתעלמים (לעבור), מחזיקים (ממתינים עד שהדרך תהיה פנויה, למשל עד שדלת נפתחת) או פונים (הפטרולים מסתובבים לאחור). כל מסלול יכול לבחור משלו, כך שרוחות רפאים עדיין יכולות לעבור דרך קירות.',
      },
      wallCheck: {
        label: 'בדיקת קיר',
        desc: 'מרכז: רק האמצע של האסימון צריך להישאר רחוק מקירות. רוחב: כל האסימון עושה זאת, אז אסימון גדול לא יכול להידחק דרך מרווח צר.',
      },
      oneWayWalls: {
        label: 'קירות חד כיוונים',
        desc: 'בין אם קירות חד כיוונים עוצרים אסימונים (חסימה) או לא (עוברים).',
      },
      transparentWalls: {
        label: 'קירות שקופים',
        desc: 'בין אם קירות שקופים, שמכניסים אור, עוצרים אסימונים (חסימה) או לא (עוברים).',
      },
      buttonStep: {
        label: 'תאים לכל קליק',
        desc: 'כמה רחוק מזיזים חיצי ההקלטה אסימון.',
      },
      language: {
        label: 'שָׂפָה',
        desc: 'שפה לתפריטים, הודעות ודפי מידע.',
      },
    },
    status: {
      routes: 'מסלולים',
      patrols: 'אסימונים מפטרלים',
      followers: 'בעקבות אסימונים',
      locked: 'אסימונים נעולים',
      recordings: 'הקלטות',
      paused: 'מושהה',
      combat: 'לְחִימָה',
      page: 'עמוד נוכחי',
      grid: 'רֶשֶׁת',
      cell: 'גודל תא',
      calibration: 'כִּיוּל',
    },
    help: {
      menu: 'הצג את התפריט.',
      start: 'שים את האסימונים שנבחרו במסלול.',
      stop: 'עצור את האסימונים שנבחרו (סיורים ומעקבים), כל אסימון במסלול, או כולם.',
      reset: 'החזר אסימונים למקום שבו הם התחילו ועצור אותם.',
      pause: 'השהה או המשך כל סיור.',
      lock: 'החזק את האסימונים שנבחרו במקומם, או שחרר אותם.',
      leader: 'בחר את האסימון שנבחר בתור המנהיג לעקוב אחריו.',
      follow: 'הפוך את האסימונים שנבחרו לעקוב אחר המנהיג, או אסימון שניתן בשמו.',
      unfollow: 'עצור את האסימונים שנבחרו הבאים.',
      add: 'צור מסלול מקוד צעד, כגון U2R2D2L2.',
      edit: 'שנה את קוד הצעד של מסלול.',
      draw: 'צור מסלול העוקב אחר הציור שנבחר בדף זה.',
      bounce: 'צור מסלול שבו אסימונים מסתובבים בתוך הציור הסגור שנבחר, ומקפצים מהקצוות שלו.',
      record: 'הקלט מסלול על ידי הזזת האסימון שנבחר באמצעות לחצנים או על ידי גרירתו.',
      route: 'שנה אפשרות מסלול: מצב, מרווח, מקסימום, אקראי, קירות או התחלה.',
      show: 'הצג את הפרטים והלחצנים של מסלול.',
      rename: 'שנה שם מסלול.',
      copy: 'העתק מסלול תחת שם חדש.',
      remove: 'הסר מסלול (שואל קודם).',
      ids: 'פעל על האסימונים עם המזהים האלה במקום עם אלה שנבחרו, כך שמודים אחרים כגון ScriptCards יכולים לשלוט באסימונים. הסר --ids מסיר את האסימונים מהמסלולים שלהם; זה אף פעם לא מסיר מסלול.',
      list: 'רשום את המסלולים, או את האסימונים הנשלטים.',
      examples: 'הוסף את המסלולים לדוגמה.',
      export: 'הצג מסלולים כטקסט להעתקה למשחק אחר.',
      import: 'הוסף מסלולים מטקסט הייצוא.',
      combat: 'הפעל או כבה את הקרב ביד.',
      set: 'שנה הגדרה או הצג את כל ההגדרות.',
      calibrate: 'יש ליישר את הרשת עם אסימונים שהוצמדו למרכזי התאים, או להסיר את הכיול.',
      status: 'הראה מה המוד עושה ואיך הוא רואה את הדף הזה.',
      journal: 'בנה מחדש את דפי העזרה והפקודה.',
      help: 'הצג רשימה זו.',
      footer:
        'ההנחיות המלאות נמצאות בדף "{help}"; הלחצנים נמצאים ב-"{deck}". {legacy} עדיין עובד עם פקודות גרסה 4.',
    },
    handout: {
      versionLabel: 'גִרְסָה',
      subtitle: 'סיורים, עוקבים ומנעולים למשחקי Jumpgate ו-Legacy',
      overview: {
        heading: 'סקירה כללית',
        body: 'TokenController מעביר אסימונים עבורך. תנו לשומר מסלול סיור, תנו לעגלה ללכת בעקבות הנהג שלה, או לנעול פסל במקום. ניתן להקליד מסלולים כקוד צעד, לעקוב אחר ציור על המפה, או לתעד באמצעות הזזת אסימון. מסלולים עובדים על דפים מרובעים, משושה, איזומטריים, דימטריים וחסרי רשת.',
      },
      quickStart: {
        heading: 'התחלה מהירה',
        steps: [
          'פתח את דף המידע של Command Deck, או הקלד !tokencontroller עבור התפריט.',
          'לחץ על דוגמאות כדי להוסיף כמה מסלולים מוכנים, או על Step Code כדי להקליד משלך (לדוגמה U2R2D2L2).',
          'בחר אסימון אחד או יותר ולחץ על התחל לצד מסלול.',
          'בחר אסימון ולחץ על עצור כדי לעצור אותו, או אפס כדי לשלוח אותו בחזרה למקום שבו הוא התחיל.',
        ],
      },
      routes: {
        heading: 'ביצוע מסלולים',
        points: [
          'קוד שלב: הקלד מהלכים כגון U2R2D2L2. קודים אינם קשורים למקום במפה, כך שאותו מסלול פועל בכל מקום.',
          'מתוך ציור: צייר קו, מצולע, צורה ביד חופשית, מלבן או אליפסה עם כלי הציור, בחר אותו ולחץ על מתוך ציור. אסימונים הולכים לאורכו, בדף זה בלבד. אתה יכול למחוק את הציור לאחר מכן.',
          'הקלט: בחר אסימון ולחץ על הקלט. הזז אותו עם לחצני החצים או גרור אותו על המפה (מעקב אחר נקודות ציון של Roll20), ולאחר מכן לחץ על שמור. ברשתות מרובעות ההקלטה הופכת לקוד צעד שניתן לערוך.',
          'מסלולי לולאה מתחילים שוב מההתחלה; מסלולים הלוך ושוב הולכים אחורה בדרך שבה הגיעו; ברגע שהמסלולים נעצרים בסוף. מסלולים חדשים שמסתיימים במקום בו הם מתחילים לולאה; אחרים הולכים הלוך ושוב.',
          'אזור הקפצה: צייר צורה סגורה סביב האזור, בחר אותו ולחץ על אזור הקפצה. אסימונים שהתחילו בו נעים בקווים ישרים ומקפצים מהקצוות שלו (ומעבר לקירות, אלא אם כן המסלול מתעלם מהם), ומסתובבים קצת באקראי בכל פעם. התחלה אקראית מכניסה כל אסימון לתא אקראי של האזור.',
        ],
      },
      codes: {
        colCode: 'קוד',
        colMeaning: 'מַשְׁמָעוּת',
        move: 'זז למעלה, למטה, שמאלה או ימינה, תא אחד.',
        diagonal: 'זז באלכסון.',
        distance: 'מספר אחרי כיוון מזיז תאים רבים כל כך.',
        face: 'פנה כדי לפנות לכיוון מבלי לזוז (צריך אסימוני סיבוב).',
        wait: 'המתן צעד אחד, או מספר הצעדים הנתון.',
        stealth: 'העבר את האסימון בין שכבת האסימון לשכבת ה-GM, כך שהוא ייעלם ויופיע שוב.',
      },
      routeOptions: {
        heading: 'אפשרויות מסלול',
        colOption: 'אוֹפְּצִיָה',
        colMeaning: 'מַשְׁמָעוּת',
        mode: 'לולאה, פינג פונג (הלוך ושוב) או פעם אחת.',
        interval: 'אלפיות שניות לכל שלב עבור מסלול זה, או 0 עבור המרווח הגלובלי.',
        max: 'הכי הרבה אסימונים שיכולים להיות במסלול בבת אחת, או 0 ללא הגבלה.',
        random: 'מופעל: כל אסימון מתחיל בנקודה אקראית לאורך המסלול.',
        walls:
          'להתעלם (לעבור דרך קירות), להחזיק (להמתין ליד קירות ודלתות סגורות), להסתובב (להסתובב אחורה) או ברירת מחדל (השתמש בהגדרת הקירות).',
        start:
          'קבע: אסימונים קופצים למיקום האסימון שנבחר כשהם מתחילים. ברור: הם מתחילים היכן שהם עומדים.',
      },
      tokens: {
        heading: 'שליטה באסימונים',
        points: [
          'אסימון נמצא במסלול אחד בכל פעם. התחלתו במסלול אחר מחליפה את הראשון.',
          'עצור משאיר אסימונים היכן שהם נמצאים. איפוס מחזיר אותם למקום שבו הם היו לפני שהם התחילו, בשכבה המקורית שלהם.',
          'מנעול מחזיק אסימון במקום. אסימונים נעולים אינם מפטרלים או עוקבים עד שהם פותחים אותם.',
          'עקוב: בחר את המנהיג ולחץ על מנהיג, ולאחר מכן בחר את העוקבים ולחץ על עקוב. אתה יכול גם להקליד את שם המנהיג: !tokencontroller follow Goblin Boss. עוקבים עוקבים אחר אסימונים שמפטרלים, אסימונים שאתה גורר ואסימונים המוזזים על ידי TokenMod.',
          'עוקבים יכולים לעקוב אחר עוקבים אחרים, ליצור שרשרת או עמודה.',
          'גרירת אסימון סיור מובילה את הסיור מהמקום שבו אתה מפיל אותו, אלא אם כן גרירת סיור מוגדרת לעצור.',
          'קירות: עם הגדרת חומות, סיורים וחסידים אינם עוברים דרך קירות תאורה דינמיים או דלתות וחלונות סגורים; דלתות וחלונות פתוחים מכניסים אותם. תן למסלול אפשרות קירות משלו (לדוגמה התעלם עבור רוח רפאים).',
          'סמני עצור: אסימון שמקבל אחד מסמני הסטטוס הללו (לדוגמה מת) עוזב את המסלול שלו ומפסיק לעקוב, וגם העוקבים של מנהיג שמקבל עצירה אחת. הגדר אותם עם !tokencontroller set stopMarkers dead;red. זה עובד גם כאשר Mod אחר מוסיף את הסמן.',
        ],
      },
      grids: {
        heading: 'רשתות',
        points: [
          'גודל התא וסוג הרשת נקראים מכל עמוד, כך שדפים שונים יכולים להשתמש ברשתות שונות.',
          'U ו-D תמיד מתכוונים למעלה ולמטה במסך. ברשתות משושה, מהלכים ללא זיגזג של שכן תואם; על רשתות איזומטריות ודימטריות, אלכסונים חוצים יהלום אחד.',
          'דפים שבהם הצילום כבוי נעים בצעדים של 70 פיקסלים מבלי להתיישר לרשת.',
          'אם אסימונים נסחפים מהרשת, הצמד אסימון למרכז תא, בחר אותו ולחץ על כיול. בחר שני אסימונים בתאים שכנים בשורה כדי לתקן גם את גודל התא.',
        ],
      },
      combat: {
        heading: 'לְחִימָה',
        points: [
          'Combat Detection בוחר כיצד יבחינו בלחימה: עוקב הסיבובים, לחצני ההפעלה/כיבוי של הקרב, או כל אחד מהם.',
          'התנהגות לחימה בוחרת מה עושות הסיורים: עוצרים, זזים צעד אחד בכל פעם שהתור עובר, או ממשיכים לנוע.',
          'השהה הכל עוצר כל סיור בכל עת; קורות חיים מתחילים אותם שוב.',
        ],
      },
      commands: {
        heading: 'פקודות',
        intro:
          'רק GMs יכולים להשתמש בפקודות אלה. ניתן לתת שם למסלולים, או להתייחס אליהם לפי #id שלהם מכפתורי התפריט. שים שמות עם רווחים ב"מרכאות" כאשר פקודה לוקחת שני שמות.',
        mods: 'גם מודים אחרים יכולים לשלוח פקודות אלה, למשל מ-ScriptCards. הם לא יכולים לבחור אסימונים, אז הם נותנים להם שם --ids ואחריו מזהי אסימון מופרדים בנקודה-פסיק: !tc stop --ids ID1;ID2. התשובות מגיעות ל-GM.',
        colCommand: 'פְּקוּדָה',
        colDesc: 'מה זה עושה',
      },
      settings: {
        heading: 'הגדרות',
        intro:
          'שנה הגדרות מהתפריט, עם !tokencontroller מוגדר <setting> <value>, או בדף הגדרות Mod במסך API Scripts.',
        colKey: 'מַפְתֵחַ',
        colName: 'סְבִיבָה',
        colDesc: 'תֵאוּר',
      },
      upgrading: {
        heading: 'משדרג מגרסה 4',
        points: [
          'נשמרים שבילים, אסימוני סיור, מנעולים, עוקבים וטיוטות לא גמורות. טיוטות הופכות למסלולים המסתיימים ב-"(טיוטה)".',
          'הגדרות גרסה 4 שלך נשמרות: מרווח, שלבי משנה, סיבוב, סיור קרבי ויחידות לכל קליק.',
          'הפקודות !tc ו-!token-control ופקודות המאקרו T-Cntrl_ ממשיכות לעבוד. הטבלה מציגה את הפקודות החדשות.',
          'גרסה 4 שלחה את כל התפריט לאחר כל פעולה; גרסה 5 שולחת תשובה קצרה במקום זאת.',
          'ההגדרה של פיקסלים ליחידה נעלמה: גודל התא מגיע מכל עמוד. אין עוד צורך ב-HTML Builder.',
          'דף המידע הישן של מדריך השימוש, שכל שחקן יכול היה לראות, מוחלף על ידי דף זה של GM בלבד.',
        ],
        colV4: 'גרסה 4',
        colV5: 'גרסה 5',
      },
      troubleshooting: {
        heading: 'פתרון בעיות',
        points: [
          'אסימונים לא זזים: בדוק סטטוס. סיורים ממתינים בזמן השהייה, בזמן נעול, ובקרב כאשר התנהגות הלחימה היא הפסקה.',
          'אסימונים זזים למרחק שגוי: ייתכן שגודל הרשת או ההצמדה של העמוד השתנו; נסה כיול.',
          'מסלול מצויר לא יתחיל: מסלולים מצוירים פועלים רק בעמוד שבו צוירו.',
          'העוקבים לא זזים כשמוד אחר מזיז את המנהיג: רק TokenMod מדווח על המהלכים שלו. מודים אחרים יכולים לקרוא TokenController.ObserveTokenChange.',
          'דווח על בעיות בפורום Roll20 עם כל הודעה ממסוף ה-API.',
        ],
      },
      languages: {
        heading: 'שפות',
        body: 'TokenController מתורגם לשפות למטה. בחר אחד עם הגדרת השפה.',
        colCode: 'קוד',
        colName: 'שָׂפָה',
        colNative: 'שם יליד',
      },
      credits: {
        heading: 'קרדיטים',
        original: 'מוד מקורי מאת',
        maintainer: 'גרסה 5 מתוחזקת על ידי',
        support: 'דווח על באגים ורעיונות בפורום Roll20 Mod או ב-GitHub.',
      },
      footer: 'הלחצנים לכל פעולה נמצאים בדפי המידע "{deck}".',
    },
    deck: {
      subtitle: 'סיפון פיקוד',
      patrolsDesc: 'להתחיל, לעצור ולהשהות סיורים. תחילה בחר אסימונים.',
      createDesc: 'צור מסלולים מקוד צעד, ציור או על ידי הקלטת אסימון.',
      selectedDesc: 'נעל אסימונים, או תגרום להם לעקוב אחר מנהיג.',
      toolsDesc: 'כלי לחימה, הגדרות וכלי רשת.',
      footer: 'ההנחיות המלאות נמצאות בדף "{help}".',
    },
  };

  const TRANSLATION$b = {
    titles: {
      ready: 'A TokenController készen áll.',
      settings: 'TokenController beállításai',
      help: 'TokenController parancsok',
      export: 'Útvonal exportálása',
      routes: 'Útvonalak',
      tokens: 'Ellenőrzött tokenek',
      status: 'TokenController állapota',
    },
    messages: {
      migrated:
        'Frissítve a 4-es verzióról. Megtartott útvonalak: {routes}. Megőrzött járőrözési tokenek: {patrols}. A régi makrók és a !tc parancsok továbbra is működnek.',
      removedGuide:
        'A régi "TokenController Usage Guide" tájékoztatót, amelyet a játékosok láthattak, a csak GM-nek szánt súgó váltotta fel.',
      pruned: 'Az őrjáratokat elfelejtették, mert a tokenek már nem léteznek: {count}.',
      readyHint:
        'Írja be a !tokencontroller parancsot a menübe, vagy nyissa meg a Command Deck tájékoztatót.',
      combatStarted: {
        pause: 'A harc elkezdődött: a járőrözést szüneteltetik, amíg véget nem ér.',
        step: 'A harc megkezdődött: a járőrök minden fordulóban egy lépést tesznek.',
      },
      combatEnded: 'A harcnak vége: a járőrök folytatják.',
      routeAdded: 'A „{name}” útvonal hozzáadva ({mode}).',
      routeUpdated:
        'A "{name}" útvonal frissítve. A rajta lévő zsetonok folytatják az új útvonalat.',
      confirmRemove:
        'Eltávolítja a "{name}" útvonalat? A rajta lévő tokenek, amelyek leállnak: {count}.',
      routeRemoved: 'A "{name}" útvonal eltávolítva. A leállított tokenek: {count}.',
      routeRenamed: 'A(z) „{from}” útvonal átnevezve erre: „{to}”.',
      examplesAdded: 'Példaútvonalak hozzáadva: {count}.',
      exportHint: 'Másold ki az alábbi szöveget, és illeszd be a {command} után bármely játékba.',
      imported:
        'Importált {added} útvonalak; kihagyva {skipped} (már használt név vagy nem érvényes).',
      started: 'A {tokens} a következő napon kezdődött: „{name}”.',
      stopped: 'A leállított tokenek: {count}.',
      reset: 'A tokenek visszakerültek oda, ahonnan indultak: {count}.',
      locked: 'Zárolva: {tokens} ({mode}).',
      unlocked: 'Feloldva: {tokens}.',
      leaderSet: '{token} a vezető. Válassza ki a követőket, majd kattintson a Követés gombra.',
      following: 'Most követi a következőt: {leader} ({mode}): {tokens}.',
      unfollowed: 'A már nem követett tokenek: {count}.',
      noRecordings: 'Semmit sem rögzítenek.',
      recordingCancelled: 'A „{name}” felvétel megszakítva.',
      languages: 'Támogatott nyelvek: {list}',
      settingChanged: '{setting} mostantól {value}.',
      combatOn: 'A harc bekapcsolva.',
      combatOff: 'A harc kikapcsolva.',
      calibrationCleared: 'A rácskalibráció eltávolítva erről az oldalról.',
      calibrated: 'Az oldalhoz kalibrált rács (cellaméret × {scale}).',
      paused: 'Minden járőr megállt.',
      resumed: 'A járőrözés újraindult.',
      journalRebuilt: 'Átépített tájékoztatók: {help} és {deck}.',
      markerStopped: 'Megálló jelzővel megállítva: {tokens}.',
      markerReset: 'Stop Marker visszaküldte oda, ahonnan indultak: {tokens}.',
    },
    errors: {
      noTokens: 'Nincs kiválasztva token.',
      noRouteName: 'Nincs megadva útvonalnév.',
      routeNotFound: 'Nincs "{name}" nevű útvonal.',
      routeExists: 'Már van egy "{name}" nevű útvonal.',
      code: {
        empty: 'A lépés kódja üres.',
        badToken: 'A "{code}" lépéskódban van valami, amit nem ért a következő helyen: "{at}".',
        tooFar: 'A „{at}” lépés túl hosszú.',
      },
      routeInvalid: 'Ez az útvonal nem menthető.',
      usageAdd: 'Adjon nevet és lépéskódot.',
      usageEdit: 'Adjon meg egy útvonalat és egy új lépéskódot.',
      selectOneDrawing:
        'Válasszon ki pontosan egy rajzot (egy vonal, sokszög, szabadkézi alakzat, téglalap vagy ellipszis).',
      drawingEmpty: 'A kiválasztott rajz túl kevés követendő pontot tartalmaz.',
      usageRoute: 'Adjon meg egy útvonalat, egy opciót és egy értéket.',
      unknownRouteOption: 'Nincs "{option}" nevű útvonalopció.',
      selectOneToken: 'Válasszon ki pontosan egy tokent.',
      badRouteValue: 'A „{value}” nem érvényes érték a {option} számára.',
      usageRename: 'Adjon meg egy útvonalat és annak új nevét.',
      usageCopy: 'Adjon útvonalat és nevet a másolatnak.',
      badJson: 'Ez nem útvonalexportálási szöveg.',
      tokenLocked: '{tokens} nem indítható: zárolva.',
      tokenMarked: '{tokens} nem tud elindulni: Stop Markerrel rendelkeznek.',
      outsideArea: 'A {tokens} nem tud elindulni: a következőn kívül vannak: "{name}".',
      selectOneArea:
        'Válasszon ki pontosan egy zárt rajzot (sokszög, téglalap, ellipszis vagy szabadkézi hurok).',
      areaTooSmall:
        'A kiválasztott rajznak legalább három sarokra van szüksége egy terület létrehozásához.',
      idsNotFound: 'Egyik tokenek sem rendelkeznek a következő azonosítókkal: {ids}.',
      routeOnOtherPage: 'A {tokens} nem indulhat el: a „{name}” egy másik oldalra került.',
      startOnOtherPage:
        'A {tokens} nem indulhat el: a „{name}” rögzített kezdete egy másik oldalon található.',
      routeFull: 'A {tokens} nem indulhat el: "{name}" már rendelkezik {max} tokenekkel.',
      noPage: 'Az oldal nem található.',
      emptyTrack: 'A {tokens} nem tud elindulni: "{name}" nem rendelkezik mozgással.',
      leaderNotFound: 'Nem található "{name}" token ezen az oldalon.',
      noLeader: 'Vezető még nincs.',
      followLoop: '{tokens} nem tudja követni az őket követő tokent.',
      alreadyRecording: 'A {token} már rögzítve van.',
      recordingTokenGone: 'A(z) „{name}” rögzítési token már nem létezik.',
      recordingEmpty: 'Még nem rögzítettek semmit.',
      unknownSetting: 'Nincs "{key}" nevű beállítás.',
      badSettingValue: 'A „{value}” nem érvényes érték a {key} számára.',
      calibrateNeedsTokens:
        'Válasszon ki egy vagy két tokent, amelyek a cellaközpontokhoz vannak rögzítve.',
      calibrateFailed: 'A kiválasztott tokenek nem használhatók a rács kalibrálásához.',
      unknownCommand: 'Ismeretlen „{command}” parancs.',
      gmOnly: 'Csak a GM használhatja a TokenControllert.',
      internal: 'Valami elromlott. A részletek az API-konzolban találhatók.',
    },
    hints: {
      noTokens: 'Először válassza ki a tokeneket a térképen.',
      noRouteName: 'Például: !tokencontroller add Guard Walk U2R2D2L2',
      routeNotFound: 'Az összes útvonal megtekintéséhez írja be a !tokencontroller list parancsot.',
      code: {
        empty: 'Például: U2R2D2L2',
        badToken:
          'Használja az U, D, L, R, UL, UR, DL vagy DR jeleket számos cellával, W-t a várakozáshoz és S-t a lopakodáshoz.',
        tooFar: 'Egy lépésben legfeljebb 100 cella lehet; legfeljebb 100 kullancsot vár.',
      },
      selectOneDrawing:
        'Rajzolja meg az útvonalat egy rajzeszközzel, jelölje ki (ha a kattintás elmulasztja, húzzon egy négyzetet egy vékony körvonal köré), majd próbálkozzon újra.',
      usageRoute: 'Opciók: mód, intervallum, max, véletlenszerű, falak, indítás.',
      routeOnOtherPage:
        'A megrajzolt útvonalak csak azon az oldalon működnek, amelyre megrajzolták őket.',
      startOnOtherPage:
        'Törölje a rögzített kezdést, vagy először helyezze át a tokent arra az oldalra.',
      noLeader:
        'Válassza ki a vezetőt, és kattintson a Vezér gombra, vagy adja meg a nevét: !tokencontroller follow Name',
      leaderNotFound:
        'A token nevét pontosan úgy használja, ahogyan a térképen látható, vagy annak azonosítóját.',
      badJson: 'Illessze be pontosan a !tokencontroller export (vagy v4 exportútvonalak) szövegét.',
      unknownSetting:
        'Az összes beállítás megtekintéséhez írja be a !tokencontroller set parancsot.',
      calibrateNeedsTokens:
        'Egy token sorakozik a rácson; egy sor szomszédos cellájában lévő két token is rögzíti a cella méretét.',
      calibrateFailed:
        'Győződjön meg arról, hogy a tokenek ugyanannak a sornak a szomszédos celláiban vannak (a hexadecimális (H) oldalak oszlopa).',
      unknownCommand: 'Írja be a !tokencontroller help parancsot a parancsok listájához.',
      tokenLocked: 'Először oldja fel a tokent.',
      tokenMarked: 'Távolítsa el a jelölőt, vagy módosítsa a Stop Markers beállítást.',
      outsideArea:
        'Először mozgassa a tokeneket a területen belül, vagy kapcsolja be a Véletlenszerű indítást az útvonalon.',
      selectOneArea:
        'Rajzolja meg a területet egy rajzeszközzel, jelölje ki (ha rákattintva kihagyja, húzzon egy négyzetet egy vékony körvonal köré), majd próbálja újra.',
      idsNotFound: 'Adja meg a tokenazonosítókat a --ids után, pontosvesszővel elválasztva.',
    },
    warnings: {
      idsNotFound:
        'Egyik tokenek sem rendelkeznek ezekkel az azonosítókkal, ezért kimaradtak: {ids}.',
      offPage:
        'Az útvonal egy része lefut az oldalról (lépések: {count}). Ezek a lépések kimaradnak.',
      combatTrackerOnly:
        'A Combat Detection a kanyarkövetőre van állítva, így ennek a kapcsolónak nincs hatása, amíg meg nem változtatja.',
      unitPx:
        'Az 5-ös verzió minden oldalról beolvassa a cellaméretet, így a régi Pixels Per Unit beállítás már nem használatos. Ha a tokenek nem illeszkednek egymáshoz, használja a !tokencontroller calibrate parancsot.',
    },
    values: {
      on: 'On',
      off: 'Le',
      none: 'Egyik sem',
      default: 'Alapértelmezett',
      noLimit: 'Nincs korlátozás',
      ms: '{ms} ms',
      andMore: 'és {count} további',
      following: 'követve: {leader}',
      locked: 'bezárt',
      gridless: 'nincs csattanás',
      grid: {
        square: 'Négyzet',
        hex: 'Hatszög',
        iso: 'Izometrikus / dimetrikus',
      },
      mode: {
        loop: 'Hurok',
        pingpong: 'oda-vissza',
        once: 'Egyszer',
      },
      movement: {
        cell: 'Egyszerre egy cellát',
        segment: 'Egyszerre egész lépés',
      },
      facing: {
        off: 'Ne forduljon',
        up: 'A művészet arccal felfelé',
        down: 'A művészet arccal lefelé',
        left: 'Művészi arcok maradtak',
        right: 'A művészet jobbra néz',
      },
      combatDetection: {
        tracker: 'Fordulatkövető',
        manual: 'GM kapcsoló',
        both: 'Fordítsa el a nyomkövetőt vagy a GM kapcsolót',
      },
      combatBehaviour: {
        pause: 'Szünet',
        step: 'Mozgassa meg minden kört',
        ignore: 'Mozogj tovább',
      },
      lockMode: {
        native: 'Roll20 pozíciózára',
        revert: 'Mozdulatok visszavonása',
        freeze: 'Csak maradjon nyugton',
      },
      followMode: {
        trail: 'Egyetlen fájl',
        formation: 'Képződés',
      },
      manualMove: {
        continue: 'Folytasd onnan',
        stop: 'Állítsd meg a járőrt',
      },
      markerAction: {
        stop: 'Állj meg ott, ahol van',
        reset: 'Menj vissza az elejére',
      },
      wallMode: {
        ignore: 'Sétálj át a falakon',
        hold: 'Várj a falaknál',
        turn: 'Fordulj vissza a falaknál',
      },
      wallCheck: {
        centre: 'A token közepe',
        width: 'Egész token',
      },
      oneWayWalls: {
        block: 'Tömb',
        pass: 'Engedd át',
      },
      transparentWalls: {
        block: 'Tömb',
        pass: 'Engedd át',
      },
    },
    menu: {
      statusRunning: 'Járőrözési tokenek: {patrols}. Útvonalak: {routes}.',
      statusPaused: 'Minden őrjárat szünetel.',
      statusCombat: {
        pause: 'Harcban: a járőrözés szünetel.',
        step: 'Harcban: a járőrök minden körben mozognak.',
      },
      routes: 'Útvonalak',
      noRoutes:
        'Még nincsenek útvonalak. Adjon hozzá egyet, rajzoljon egyet, rögzítsen egyet, vagy adja hozzá a példákat.',
      create: 'Új útvonal',
      selected: 'Kiválasztott tokenek',
      tools: 'Eszközök',
      recordings: 'Felvételek',
      patrols: 'Járőrök',
    },
    buttons: {
      start: 'Indul',
      stop: 'Leállítás',
      add: 'Lépéskód',
      draw: 'Rajzból',
      bounce: 'Visszapattanási terület',
      record: 'Rekord',
      examples: 'Példák',
      reset: 'Visszaállítás',
      lock: 'Zár',
      unlock: 'Kinyit',
      leader: 'Vezető',
      follow: 'Kövesd',
      unfollow: 'Követés megszüntetése',
      resume: 'Folytatás',
      pause: 'Összes szüneteltetése',
      combatOn: 'Harc be',
      combatOff: 'Harc ki',
      stopAll: 'Összes leállítása',
      settings: 'Beállítások elemre',
      status: 'Állapot',
      help: 'Segítség',
      open: 'Nyitott',
      clearStart: 'Világos',
      setStart: 'Állítsa a Kiválasztott értékre',
      edit: 'Kód szerkesztése',
      rename: 'Átnevezés',
      copy: 'Másolat',
      export: 'Exportálás',
      remove: 'Távolítsa el',
      menu: 'Menü',
      wait: 'Várjon',
      stealth: 'Lopakodás',
      undo: 'Visszavonás',
      save: 'Megtakarítás',
      cancel: 'Mégse',
      confirm: 'Igen, távolítsa el',
      startRoute: 'Útvonal indítása',
      list: 'Útvonalak listája',
      calibrate: 'Kalibrálni',
    },
    prompts: {
      name: 'Útvonal neve',
      code: 'Lépéskód',
      interval: 'Ezredmásodperc lépésenként (0 = alapértelmezett)',
      maxTokens: 'A legtöbb token egyszerre (0 = nincs korlátozás)',
      newName: 'Új név',
      route: 'Útvonal neve',
    },
    route: {
      drawn: 'Megrajzolt útvonal, {points} pont',
      recorded: 'Felvett útvonal, {points} pont',
      area: 'Visszapattanó terület, {points} sarkok',
      path: 'Útvonal',
      mode: 'Mód',
      interval: 'Intervallum',
      maxTokens: 'A legtöbb token',
      randomStart: 'Véletlenszerű indítás',
      walls: 'Falak',
      start: 'Fix indítás',
      tokens: 'Tokenek',
    },
    record: {
      title: '„{name}” felvétel',
      intro:
        'Felvétel {token} (idáig elmozdul: {count}). Kattintson a nyilakra, vagy húzza a tokent a térképen; minden mozdulatot rögzítenek.',
    },
    settings: {
      interval: {
        label: 'Intervallum',
        desc: 'Ezredmásodpercek a lépések között. Mindegyik útvonal felülírhatja.',
      },
      movement: {
        label: 'Mozgás',
        desc: 'cella lépésenként egy cellát mozgat; szegmens egy egész lépést (például az U3-at) egyszerre mozgat, ahogy a 4-es verzió tette.',
      },
      facing: {
        label: 'Tokenek forgatása',
        desc: 'Fordítsd a tokeneket arrafelé, amerre mennek: kikapcsolva, vagy a token művészet irányába (fel, le, balra vagy jobbra).',
      },
      combatDetection: {
        label: 'Harci észlelés',
        desc: 'Hogyan veszik észre a harcot: nyomkövető (a fordulókövető nyitva van, és valaki benne van), manuális (a Combat On/Off gombok) vagy mindkettő.',
      },
      combatBehaviour: {
        label: 'Harci viselkedés',
        desc: 'Mit csinálnak az őrjáratok a harcban: szünet, lépés (egyszer mozogni minden alkalommal, amikor a kör elhalad) vagy figyelmen kívül hagyás (mozgás tovább).',
      },
      lockMode: {
        label: 'Lezárási mód',
        desc: 'Hogyan tart a zár egy tokent: natív (a Roll20 saját pozíciózára, így senki sem húzhatja), visszafordul (a mozdulatokat visszavonja) vagy lefagy (leállítja a járőrözést és a követést, de továbbra is húzható).',
      },
      lockMarker: {
        label: 'Zárjelző',
        desc: 'Állapotjelző megjelenik a zárolt tokeneken, vagy nincs. A játékosok láthatják a jelzőket.',
      },
      followMode: {
        label: 'Kövesse a módot',
        desc: 'nyomvonal: a követők egyetlen fájlban haladnak a vezető nyomában. formáció: a követők megtartják a helyüket a vezető körül (egy követő húzásával megváltoztathatja a helyét).',
      },
      manualMove: {
        label: 'Járőr húzása',
        desc: 'Amikor húz egy járőrjelzőt: folytassa (az útvonal onnan folytatódik, ahol elejtette) vagy álljon meg (az őrjárat véget ér).',
      },
      stopMarkers: {
        label: 'Stop jelzők',
        desc: 'Állapotjelzők, amelyek leállítják a tokent az útvonaláról, és megállítják a követését, pontosvesszővel elválasztva (például halott;piros), vagy nincs. Egy ilyen jelzővel rendelkező vezető követői is megállnak.',
      },
      markerAction: {
        label: 'Marker akció leállítása',
        desc: 'Mit csinál egy járőr token, ha Stop Markert kap: megáll (ahol van) vagy reset (visszamegy oda, ahonnan indult).',
      },
      wallMode: {
        label: 'Falak',
        desc: 'Mit tesznek a járőrök és a követők a dinamikus világítású falaknál és a zárt ajtóknál és ablakoknál: figyelmen kívül hagyni (átmenni), tartani (várni, amíg szabaddá válik az út, például, amíg kinyílik egy ajtó) vagy megfordulni (az járőrök visszafordulnak). Mindegyik útvonal kiválaszthatja a sajátját, így a szellemek továbbra is áthaladhatnak a falakon.',
      },
      wallCheck: {
        label: 'Falellenőrzés',
        desc: 'központ: csak a token közepének kell távol maradnia a falaktól. szélesség: az egész token igen, tehát egy nagy token nem tud átnyomni egy szűk résen.',
      },
      oneWayWalls: {
        label: 'Egyirányú falak',
        desc: 'Függetlenül attól, hogy az egyirányú falak megállítják-e a jelzőket (blokk) vagy sem (áthalad).',
      },
      transparentWalls: {
        label: 'Átlátszó falak',
        desc: 'Akár átlátszó falak, amelyek átengedik a fényt, megállítják a jelzőket (blokk), vagy nem (áthaladnak).',
      },
      buttonStep: {
        label: 'Cellák kattintásonként',
        desc: 'Milyen messzire mozgatják a rögzítési nyilak a tokent.',
      },
      language: {
        label: 'Nyelv',
        desc: 'A menük, üzenetek és tájékoztatók nyelve.',
      },
    },
    status: {
      routes: 'Útvonalak',
      patrols: 'Járőrözési jelzők',
      followers: 'A tokenek követése',
      locked: 'Zárolt tokenek',
      recordings: 'Felvételek',
      paused: 'Szüneteltetve',
      combat: 'Harc',
      page: 'Aktuális oldal',
      grid: 'Rács',
      cell: 'Sejtméret',
      calibration: 'Kalibráció',
    },
    help: {
      menu: 'Mutasd a menüt.',
      start: 'Helyezze a kiválasztott tokeneket egy útvonalra.',
      stop: 'Állítsa le a kiválasztott tokeneket (járőrök és követés), minden jelzőt az útvonalon, vagy az összeset.',
      reset: 'Tegye vissza a tokeneket oda, ahonnan indult, és állítsa le őket.',
      pause: 'Minden járőrözés szüneteltetése vagy folytatása.',
      lock: 'Tartsa a kiválasztott tokeneket a helyükön, vagy engedje el őket.',
      leader: 'Válassza ki a kiválasztott tokent követendő vezetőként.',
      follow: 'Kövesse a kiválasztott jelzőket a vezető vagy egy név szerint megadott token.',
      unfollow: 'Állítsa le a kiválasztott tokenek követését.',
      add: 'Hozzon létre egy útvonalat lépéskódból, például U2R2D2L2.',
      edit: 'Módosítsa az útvonal lépéskódját.',
      draw: 'Hozzon létre egy útvonalat, amely követi a kiválasztott rajzot ezen az oldalon.',
      bounce:
        'Hozzon létre egy útvonalat, amelyen a tokenek a kiválasztott zárt rajzon belül vándorolnak, annak széleiről visszapattanva.',
      record:
        'Rögzítsen egy útvonalat a kiválasztott token gombokkal történő mozgatásával vagy húzásával.',
      route: 'Útvonalopció módosítása: mód, intervallum, max., véletlenszerű, falak vagy kezdet.',
      show: 'Az útvonal részleteinek és gombjainak megjelenítése.',
      rename: 'Útvonal átnevezése.',
      copy: 'Útvonal másolása új néven.',
      remove: 'Útvonal eltávolítása (először kérdez).',
      ids: 'A kiválasztott azonosítók helyett ezekkel az azonosítókkal járjon el a tokenekkel, így más modok, például a ScriptCards vezérelhetik a tokeneket. Remove --ids leveszi a tokeneket az útvonalukról; soha nem távolít el útvonalat.',
      list: 'Sorolja fel az útvonalakat vagy a vezérelt tokeneket.',
      examples: 'Adja hozzá a példaútvonalakat.',
      export: 'Útvonalak megjelenítése szövegként egy másik játékba másoláshoz.',
      import: 'Útvonalak hozzáadása az exportált szövegből.',
      combat: 'Kapcsolja be vagy ki a harcot kézzel.',
      set: 'Módosítson egy beállítást, vagy jelenítse meg az összes beállítást.',
      calibrate:
        'Sorolja fel a rácsot a cellák közepére rögzített tokenekkel, vagy távolítsa el a kalibrálást.',
      status: 'Mutassa meg, mit csinál a Mod, és hogyan látja ezt az oldalt.',
      journal: 'Építsd újra a Help és Command Deck segédanyagokat.',
      help: 'Mutasd ezt a listát.',
      footer:
        'A teljes utasítás a „{help}” tájékoztatóban található; a gombok a következő helyen találhatók: "{deck}". {legacy} továbbra is működik a 4-es verzió parancsaival.',
    },
    handout: {
      versionLabel: 'Változat',
      subtitle: 'Járőrök, követők és zárak a Jumpgate és Legacy játékokhoz',
      overview: {
        heading: 'Áttekintés',
        body: 'A TokenController a tokeneket mozgatja helyetted. Adjon egy őrnek járőrutat, egy szekér kövesse a vezetőjét, vagy zárjon a helyére egy szobrot. Az útvonalak beírhatók lépéskódként, nyomon követhetők a térképen lévő rajzból, vagy rögzíthetők egy token mozgatásával. Az útvonalak négyzetes, hatszögletű, izometrikus, dimetrikus és rács nélküli oldalakon működnek.',
      },
      quickStart: {
        heading: 'Gyors kezdés',
        steps: [
          'Nyissa meg a Command Deck tájékoztatót, vagy írja be a !tokencontroller parancsot a menübe.',
          'Kattintson a Példák lehetőségre néhány kész útvonal hozzáadásához, vagy a Lépéskód lehetőségre a saját beírásához (például U2R2D2L2).',
          'Válasszon ki egy vagy több tokent, és kattintson az Indítás gombra az útvonal mellett.',
          'Válasszon ki egy tokent, és kattintson a Leállítás gombra a leállításához, vagy a Reset gombra, ha vissza szeretné küldeni oda, ahonnan indult.',
        ],
      },
      routes: {
        heading: 'Útvonalak készítése',
        points: [
          'Lépéskód: írja be a mozdulatokat, például U2R2D2L2. A kódok nincsenek helyhez kötve a térképen, így bárhol ugyanaz az útvonal működik.',
          'Rajzból: rajzoljon vonalat, sokszöget, szabadkézi alakzatot, téglalapot vagy ellipszist a rajzeszközökkel, jelölje ki, majd kattintson a Rajzból elemre. A tokenek végigmennek rajta, csak ezen az oldalon. A rajzot utólag törölheti.',
          'Rögzítés: válasszon ki egy tokent, és kattintson a Rögzítés gombra. Mozgassa a nyílgombokkal, vagy húzza a térképen (a Roll20 útpontokat követi), majd kattintson a Mentés gombra. A négyzetrácsokon a felvétel szerkeszthető lépéskód lesz.',
          'A hurokútvonalak újra elölről kezdődnek; oda-vissza utak járnak vissza, ahogy jöttek; ha az útvonalak a végén megállnak. Új útvonalak, amelyek ott végződnek, ahol indulnak; mások oda-vissza járnak.',
          'Visszapattanási terület: rajzoljon egy zárt alakzatot a terület köré, jelölje ki, majd kattintson a Visszapattanási terület elemre. A rajta indult tokenek egyenes vonalban haladnak, és visszapattannak a széleiről (és a falakról, hacsak az útvonal nem hagyja figyelmen kívül), minden alkalommal véletlenszerűen fordulnak egy kicsit. A véletlenszerű indítás minden tokent a terület véletlenszerű cellájába helyezi.',
        ],
      },
      codes: {
        colCode: 'Kód',
        colMeaning: 'Jelentése',
        move: 'Mozgassa fel, le, balra vagy jobbra egy cellát.',
        diagonal: 'Mozgás átlósan.',
        distance: 'Egy irány utáni szám annyi cellát mozgat meg.',
        face: 'Fordulj, hogy egy irányba nézz, anélkül, hogy mozognál (fordulási jelzőkre van szükség).',
        wait: 'Várjon egy lépést, vagy a megadott számú lépést.',
        stealth:
          'Helyezze a tokent a token réteg és a GM réteg közé, így eltűnik és újra megjelenik.',
      },
      routeOptions: {
        heading: 'Útvonal opciók',
        colOption: 'Opció',
        colMeaning: 'Jelentése',
        mode: 'hurok, pingpong (oda-vissza) vagy egyszer.',
        interval:
          'Ezredmásodperc lépésenként ehhez az útvonalhoz, vagy 0 a globális intervallumhoz.',
        max: 'A legtöbb token, amely egyszerre lehet az útvonalon, vagy 0 korlát nélkül.',
        random: 'be: minden token az útvonal egy véletlenszerű pontján kezdődik.',
        walls:
          'figyelmen kívül hagyja (sétáljon át a falakon), tartsa (várjon a falaknál és zárt ajtóknál), forduljon (forduljon vissza) vagy alapértelmezett (használja a Falak beállítást).',
        start:
          'set: a tokenek induláskor a kiválasztott token pozíciójára ugranak. világos: ott kezdik, ahol állnak.',
      },
      tokens: {
        heading: 'Tokenek vezérlése',
        points: [
          'A token egyszerre csak egy útvonalon van. Ha egy másik útvonalon indítja el, az felváltja az elsőt.',
          'Állítsa le a leveleket ott, ahol vannak. A Reset visszaállítja őket az eredeti rétegükre, ahol az indulás előtt voltak.',
          'A zár egy tokent a helyén tartja. A zárolt tokenek nem járőröznek és nem követik, amíg fel nem oldják.',
          'Követés: válassza ki a vezetőt, majd kattintson a Vezető gombra, majd válassza ki a követőket, és kattintson a Követés gombra. Beírhatod a vezető nevét is: !tokencontroller follow Goblin Boss. A követők követik a járőröző tokeneket, a húzott tokeneket és a TokenMod által mozgatott tokeneket.',
          'A követők követhetnek más követőket, láncot vagy oszlopot alkotva.',
          'Az őrjárati token elhúzása onnan továbbítja az őrjáratot, ahol ledobta, kivéve, ha a Járőrhúzás leállításra van állítva.',
          'Falak: bekapcsolt falak mellett a járőrök és a követők nem mennek át dinamikus világító falakon vagy zárt ajtókon és ablakokon; nyitott ajtók és ablakok engedik át őket. Adja meg az útvonalnak saját falait (például szellem esetén figyelmen kívül hagyja).',
          'Stop Markers: egy jelző, amely megkapja az egyik ilyen állapotjelzőt (például halott), elhagyja az útvonalat és abbahagyja a követést, valamint a vezető követői, akik egy megállót kapnak. Állítsa be őket: !tokencontroller set stopMarkers dead;red. Ez akkor is működik, ha egy másik Mod hozzáadja a jelölőt.',
        ],
      },
      grids: {
        heading: 'Rácsok',
        points: [
          'A cellaméret és a rács típusa minden oldalról olvasható, így a különböző oldalak különböző rácsokat használhatnak.',
          'U és D mindig azt jelenti, hogy felfelé és lefelé a képernyőn. A hatszögletű rácsokon a szomszédos cikkcakk nélkül mozog; izometrikus és dimetrikus rácsokon az átlók egy gyémántot kereszteznek.',
          'Azok az oldalak, amelyeknél a kattanás ki van kapcsolva, 70 képpontos lépésekben mozognak anélkül, hogy egy rácshoz sorakoznának.',
          'Ha a tokenek lesodródnak a rácsról, illesszen egy tokent egy cella közepére, jelölje ki, és kattintson a Kalibrálás gombra. Válasszon ki két tokent a sor szomszédos celláiban a cella méretének rögzítéséhez.',
        ],
      },
      combat: {
        heading: 'Harc',
        points: [
          'A Combat Detection kiválasztja, hogy a harc hogyan kerüljön észrevételre: a fordulatkövető, a Combat On/Off gombok vagy bármelyik.',
          'A Combat Behavior kiválasztja, hogy a járőrök mit tegyenek: szünetet, lépést minden alkalommal, amikor a kanyar elhalad, vagy tovább haladnak.',
          'Pause All bármikor leállít minden járőrt; A Resume újra elindítja őket.',
        ],
      },
      commands: {
        heading: 'Parancsok',
        intro:
          'Csak a GM-ek használhatják ezeket a parancsokat. Az útvonalakat a menügombok segítségével el lehet nevezni, vagy #id-jükkel hivatkozni lehet rájuk. Tegye a neveket szóközzel „idézőjelbe”, ha egy parancs két nevet vesz fel.',
        mods: 'Más modok is el tudják küldeni ezeket a parancsokat, például ScriptCard-okról. Nem tudnak kiválasztani tokeneket, ezért a --ids jellel, majd pontosvesszővel elválasztott tokenazonosítókkal nevezik el őket: !tc stop --ids ID1;ID2. A válaszok a GM-hez mennek.',
        colCommand: 'Parancs',
        colDesc: 'Mit csinál',
      },
      settings: {
        heading: 'Beállítások elemre',
        intro:
          'Módosítsa a beállításokat a menüből a !tokencontroller <beállítás> <érték> beállításával, vagy a Mod settings oldalon az API Scripts képernyőn.',
        colKey: 'Kulcsfontosságú',
        colName: 'Beállítás',
        colDesc: 'Leírás',
      },
      upgrading: {
        heading: 'Frissítés a 4-es verzióról',
        points: [
          'Az ösvények, a járőrözési jelzők, a zárak, a követők és a befejezetlen piszkozatok megmaradnak. A piszkozatok „(tervezet)”-re végződő útvonalakká válnak.',
          'A 4-es verzió beállításai megmaradnak: intervallum, részlépések, rotáció, harci járőrözés és egységek kattintásonként.',
          'A !tc és !token-control parancsok és a T-Cntrl_ makrók továbbra is működnek. A táblázat az új parancsokat mutatja.',
          'A 4-es verzió minden művelet után elküldte a teljes menüt; Az 5-ös verzió rövid választ küld helyette.',
          'A Pixels Per Unit beállítás megszűnt: a cellaméret minden oldalról származik. A HTML Builderre már nincs szükség.',
          'A régi használati útmutatót, amelyet minden játékos láthatott, ez a csak GM-nek szánt tájékoztató váltja fel.',
        ],
        colV4: '4-es verzió',
        colV5: '5-ös verzió',
      },
      troubleshooting: {
        heading: 'Hibaelhárítás',
        points: [
          'A tokenek nem mozognak: jelölje be az Állapot. A járőrök várakoznak, amíg szünetel, zárva vannak, és harcban állnak, amikor a Harci Viselkedés szünetel.',
          'A tokenek rossz távolságra mozognak: előfordulhat, hogy az oldal rácsmérete vagy rasztere megváltozott; próbáld meg a kalibrálást.',
          'A megrajzolt útvonal nem indul el: a megrajzolt útvonalak csak azon az oldalon működnek, amelyre rajzolták.',
          'A követők nem mozognak, ha egy másik Mod mozgatja a vezetőt: csak a TokenMod jelenti a lépéseit. Más modok hívhatják a TokenController.ObserveTokenChange programot.',
          'Az API-konzolról érkező üzenetekkel kapcsolatos problémák bejelentése a Roll20 fórumon.',
        ],
      },
      languages: {
        heading: 'Nyelvek',
        body: 'A TokenController az alábbi nyelvekre van lefordítva. Válasszon egyet a Nyelv beállítással.',
        colCode: 'Kód',
        colName: 'Nyelv',
        colNative: 'Natív név',
      },
      credits: {
        heading: 'Kredit',
        original: 'Eredeti Mod by',
        maintainer: 'Az 5-ös verziót karbantartja',
        support: 'Jelentse be a hibákat és ötleteket a Roll20 Mod fórumon vagy a GitHubon.',
      },
      footer: 'Minden művelet gombja a „{deck}” tájékoztatóban található.',
    },
    deck: {
      subtitle: 'Parancspult',
      patrolsDesc:
        'Indítsa el, állítsa le és szüneteltesse a járőrözést. Először válassza ki a tokeneket.',
      createDesc: 'Útvonalakat készíthet lépéskódból, rajzból vagy token rögzítésével.',
      selectedDesc: 'Zárja le a jelzőket, vagy kényszerítse őket egy vezető követésére.',
      toolsDesc: 'Harc, beállítások és rácseszközök.',
      footer: 'A teljes utasítás a „{help}” tájékoztatóban található.',
    },
  };

  const TRANSLATION$a = {
    titles: {
      ready: 'TokenController è pronto.',
      settings: 'Impostazioni del tokencontroller',
      help: 'Comandi del TokenController',
      export: 'Esportazione del percorso',
      routes: 'Percorsi',
      tokens: 'Token controllati',
      status: 'Stato del tokencontroller',
    },
    messages: {
      migrated:
        'Aggiornato dalla versione 4. Percorsi mantenuti: {routes}. Gettoni di pattugliamento conservati: {patrols}. Le tue vecchie macro e i comandi !tc funzionano ancora.',
      removedGuide:
        'Il vecchio volantino "Guida all\'utilizzo del TokenController", che i giocatori potevano vedere, è stato sostituito dal volantino di aiuto riservato ai GM.',
      pruned: 'Pattuglie dimenticate perché i loro token non esistono più: {count}.',
      readyHint: 'Digita !tokencontroller per il menu o apri il volantino del Command Deck.',
      combatStarted: {
        pause: 'Il combattimento è iniziato: le pattuglie vengono interrotte fino al termine.',
        step: 'Il combattimento è iniziato: le pattuglie muovono un passo ogni turno.',
      },
      combatEnded: 'Il combattimento è finito: le pattuglie continuano.',
      routeAdded: 'Percorso "{name}" aggiunto ({mode}).',
      routeUpdated:
        'Percorso "{name}" aggiornato. I gettoni su di esso continuano con il nuovo percorso.',
      confirmRemove: 'Rimuovere il percorso "{name}"? Token su di esso che si fermeranno: {count}.',
      routeRemoved: 'Percorso "{name}" rimosso. Token interrotti: {count}.',
      routeRenamed: 'Percorso "{from}" rinominato in "{to}".',
      examplesAdded: 'Percorsi di esempio aggiunti: {count}.',
      exportHint: 'Copia il testo qui sotto e incollalo dopo {command} in qualsiasi gioco.',
      imported: 'Percorsi {added} importati; saltato {skipped} (nome già utilizzato o non valido).',
      started: '{tokens} iniziato il "{name}".',
      stopped: 'Token interrotti: {count}.',
      reset: 'I token sono tornati al punto di partenza: {count}.',
      locked: 'Bloccato: {tokens} ({mode}).',
      unlocked: 'Sbloccato: {tokens}.',
      leaderSet: '{token} è il leader. Seleziona i follower e fai clic su Segui.',
      following: 'Ora segue {leader} ({mode}): {tokens}.',
      unfollowed: 'I token non seguono più: {count}.',
      noRecordings: 'Non viene registrato nulla.',
      recordingCancelled: 'Registrazione "{name}" annullata.',
      languages: 'Lingue supportate: {list}',
      settingChanged: '{setting} ora è {value}.',
      combatOn: 'Combattimento attivato.',
      combatOff: 'Il combattimento è stato interrotto.',
      calibrationCleared: 'Calibrazione della griglia rimossa da questa pagina.',
      calibrated: 'Griglia calibrata per questa pagina (dimensione cella × {scale}).',
      paused: 'Tutte le pattuglie si fermarono.',
      resumed: 'Sono riprese le pattuglie.',
      journalRebuilt: 'Schede ricostruite: {help} e {deck}.',
      markerStopped: 'Fermato da un indicatore di fermata: {tokens}.',
      markerReset: 'Rimandati al punto di partenza tramite un indicatore di stop: {tokens}.',
    },
    errors: {
      noTokens: 'Nessun token selezionato.',
      noRouteName: 'Nessun nome del percorso fornito.',
      routeNotFound: 'Non esiste un percorso chiamato "{name}".',
      routeExists: 'Esiste già un percorso chiamato "{name}".',
      code: {
        empty: 'Il codice del passaggio è vuoto.',
        badToken: 'Il codice del passaggio "{code}" contiene qualcosa che non capisce in "{at}".',
        tooFar: 'Il passaggio "{at}" è troppo lungo.',
      },
      routeInvalid: 'Impossibile salvare il percorso.',
      usageAdd: 'Assegnare un nome e un codice passo.',
      usageEdit: 'Fornire un percorso e un nuovo codice passo.',
      selectOneDrawing:
        "Seleziona esattamente un disegno (una linea, un poligono, una forma a mano libera, un rettangolo o un'ellisse).",
      drawingEmpty: 'Il disegno selezionato ha troppo pochi punti da seguire.',
      usageRoute: "Fornisci un percorso, un'opzione e un valore.",
      unknownRouteOption: 'Non esiste un\'opzione di percorso chiamata "{option}".',
      selectOneToken: 'Seleziona esattamente un token.',
      badRouteValue: '"{value}" non è un valore valido per {option}.',
      usageRename: 'Fornire un percorso e il suo nuovo nome.',
      usageCopy: 'Assegna un percorso e un nome alla copia.',
      badJson: 'Questo non è il testo di esportazione del percorso.',
      tokenLocked: '{tokens} non può essere avviato: bloccato.',
      tokenMarked: '{tokens} non può iniziare: ha un indicatore di stop.',
      outsideArea: '{tokens} non può avviarsi: è esterno a "{name}".',
      selectOneArea:
        "Seleziona esattamente un disegno chiuso (un poligono, un rettangolo, un'ellisse o un ciclo a mano libera).",
      areaTooSmall: "Il disegno selezionato necessita di almeno tre angoli per creare un'area.",
      idsNotFound: 'Nessun token ha questi ID: {ids}.',
      routeOnOtherPage:
        '{tokens} non può iniziare: "{name}" è stato disegnato su un\'altra pagina.',
      startOnOtherPage:
        '{tokens} non può iniziare: l\'inizio fisso di "{name}" è su un\'altra pagina.',
      routeFull: '{tokens} non può iniziare: "{name}" ha già token {max}.',
      noPage: 'Impossibile trovare la pagina.',
      emptyTrack: '{tokens} non può iniziare: "{name}" non ha mosse.',
      leaderNotFound: 'Nessun token chiamato "{name}" è stato trovato in questa pagina.',
      noLeader: "Non c'è ancora un leader.",
      followLoop: '{tokens} non può seguire un token che lo segue.',
      alreadyRecording: '{token} è già in fase di registrazione.',
      recordingTokenGone: 'Il token per la registrazione "{name}" non esiste più.',
      recordingEmpty: 'Non è stato ancora registrato nulla.',
      unknownSetting: 'Non esiste alcuna impostazione chiamata "{key}".',
      badSettingValue: '"{value}" non è un valore valido per {key}.',
      calibrateNeedsTokens: 'Seleziona uno o due token agganciati ai centri delle celle.',
      calibrateFailed:
        'I token selezionati non possono essere utilizzati per calibrare la griglia.',
      unknownCommand: 'Comando sconosciuto "{command}".',
      gmOnly: 'Solo il GM può utilizzare TokenController.',
      internal: 'Qualcosa è andato storto. I dettagli si trovano nella console API.',
    },
    hints: {
      noTokens: 'Seleziona prima i token sulla mappa.',
      noRouteName: 'Ad esempio: !tokencontroller aggiungi Guard Walk U2R2D2L2',
      routeNotFound: 'Digita !tokencontroller list per vedere tutti i percorsi.',
      code: {
        empty: 'Ad esempio: U2R2D2L2',
        badToken:
          'Usa U, D, L, R, UL, UR, DL o DR con un numero di celle, W per aspettare e S per nascondersi.',
        tooFar:
          'Un singolo passaggio può contenere al massimo 100 celle; attende al massimo 100 tick.',
      },
      selectOneDrawing:
        'Disegna il percorso con uno strumento di disegno, selezionalo (trascina una casella attorno a un contorno sottile se facendo clic non si riesce a raggiungerlo), quindi riprova.',
      usageRoute: 'Opzioni: modalità, intervallo, max, casuale, muri, avvio.',
      routeOnOtherPage:
        'I percorsi disegnati funzionano solo sulla pagina su cui sono stati disegnati.',
      startOnOtherPage: "Cancella l'inizio fisso o sposta prima il token su quella pagina.",
      noLeader:
        'Seleziona il leader e fai clic su Leader, oppure inserisci il suo nome: !tokencontroller segui Nome',
      leaderNotFound:
        'Utilizza il nome del token esattamente come mostrato sulla mappa o il relativo ID token.',
      badJson: 'Incolla esattamente il testo da !tokencontroller export (o v4 exportpaths).',
      unknownSetting: 'Digita !tokencontroller set per vedere tutte le impostazioni.',
      calibrateNeedsTokens:
        'Un gettone allinea la griglia; anche due token nelle celle adiacenti di una riga fissano la dimensione della cella.',
      calibrateFailed:
        'Assicurati che i token si trovino nelle celle vicine della stessa riga (colonna sulle pagine esadecimali (H)).',
      unknownCommand: "Digitare !tokencontroller help per l'elenco dei comandi.",
      tokenLocked: 'Sblocca prima il token.',
      tokenMarked: "Rimuovere il contrassegno o modificare l'impostazione Contrassegni di arresto.",
      outsideArea:
        "Sposta prima i gettoni all'interno dell'area o attiva l'avvio casuale del percorso.",
      selectOneArea:
        "Disegna l'area con uno strumento di disegno, selezionala (trascina una casella attorno a un contorno sottile se facendo clic non si riesce a raggiungerlo), quindi riprova.",
      idsNotFound: 'Fornisci gli ID token dopo --ids, separati da punto e virgola.',
    },
    warnings: {
      idsNotFound: 'Nessun token ha questi ID, quindi sono stati ignorati: {ids}.',
      offPage:
        'Parte del percorso esce dalla pagina (passi: {count}). Questi passaggi vengono saltati.',
      combatTrackerOnly:
        'Il rilevamento del combattimento è impostato sul contaturni, quindi questo interruttore non ha effetto finché non lo cambi.',
      unitPx:
        'La versione 5 legge la dimensione della cella da ciascuna pagina, quindi la vecchia impostazione Pixel per unità non viene più utilizzata. Se i token non si allineano, utilizzare !tokencontroller calibrate.',
    },
    values: {
      on: 'SU',
      off: 'Spento',
      none: 'Nessuno',
      default: 'Predefinito',
      noLimit: 'Nessun limite',
      ms: '{ms}ms',
      andMore: 'e {count} altro',
      following: 'seguendo {leader}',
      locked: 'bloccato',
      gridless: 'nessuno scatto',
      grid: {
        square: 'Piazza',
        hex: 'Esadecimale',
        iso: 'Isometrico/Dimetrico',
      },
      mode: {
        loop: 'Ciclo continuo',
        pingpong: 'Avanti e indietro',
        once: 'Una volta',
      },
      movement: {
        cell: 'Una cella alla volta',
        segment: 'Un intero passo alla volta',
      },
      facing: {
        off: 'Non voltarti',
        up: "L'arte si affaccia",
        down: "L'arte è a faccia in giù",
        left: "L'arte si affaccia a sinistra",
        right: "L'arte è rivolta verso destra",
      },
      combatDetection: {
        tracker: 'Indicatore di svolta',
        manual: 'Interruttore GM',
        both: 'Indicatore di direzione o interruttore GM',
      },
      combatBehaviour: {
        pause: 'Pausa',
        step: 'Muoviti a ogni turno',
        ignore: 'Continua a muoverti',
      },
      lockMode: {
        native: 'Blocco della posizione di Roll20',
        revert: 'Annulla le mosse',
        freeze: 'Stai fermo solo',
      },
      followMode: {
        trail: 'Fascicolo unico',
        formation: 'Formazione',
      },
      manualMove: {
        continue: 'Continua da lì',
        stop: 'Ferma la pattuglia',
      },
      markerAction: {
        stop: "Fermati dov'è",
        reset: "Torna all'inizio",
      },
      wallMode: {
        ignore: 'Cammina attraverso i muri',
        hold: 'Aspetta ai muri',
        turn: 'Tornare alle mura',
      },
      wallCheck: {
        centre: 'Centro del gettone',
        width: 'Gettone intero',
      },
      oneWayWalls: {
        block: 'Bloccare',
        pass: 'Lascia passare',
      },
      transparentWalls: {
        block: 'Bloccare',
        pass: 'Lascia passare',
      },
    },
    menu: {
      statusRunning: 'Gettoni di pattugliamento: {patrols}. Percorsi: {routes}.',
      statusPaused: 'Tutte le pattuglie sono in pausa.',
      statusCombat: {
        pause: 'In combattimento: le pattuglie vengono messe in pausa.',
        step: 'In combattimento: le pattuglie si muovono ogni turno.',
      },
      routes: 'Percorsi',
      noRoutes:
        'Nessun percorso ancora. Aggiungine uno, disegnane uno, registrane uno o aggiungi gli esempi.',
      create: 'Nuovo percorso',
      selected: 'Gettoni selezionati',
      tools: 'Utensili',
      recordings: 'Registrazioni',
      patrols: 'Pattuglie',
    },
    buttons: {
      start: 'Inizio',
      stop: 'Fermare',
      add: 'Codice passo',
      draw: 'Dal disegno',
      bounce: 'Area di rimbalzo',
      record: 'Documentazione',
      examples: 'Esempi',
      reset: 'Reset',
      lock: 'Serratura',
      unlock: 'Sbloccare',
      leader: 'Leader',
      follow: 'Seguire',
      unfollow: 'Smetti di seguire',
      resume: 'Riprendere',
      pause: 'Metti tutto in pausa',
      combatOn: 'Combattimento attivo',
      combatOff: 'Combattimento disattivato',
      stopAll: 'Ferma tutto',
      settings: 'Impostazioni',
      status: 'Stato',
      help: 'Aiuto',
      open: 'Aprire',
      clearStart: 'Chiaro',
      setStart: 'Imposta su Selezionato',
      edit: 'Modifica codice',
      rename: 'Rinominare',
      copy: 'Copia',
      export: 'Esportare',
      remove: 'Rimuovere',
      menu: 'Menu',
      wait: 'Aspettare',
      stealth: 'Furtivo',
      undo: 'Disfare',
      save: 'Salva',
      cancel: 'Cancellare',
      confirm: 'Sì, rimuovilo',
      startRoute: 'Inizia il percorso',
      list: 'Elenco percorsi',
      calibrate: 'Calibrare',
    },
    prompts: {
      name: 'Nome del percorso',
      code: 'Codice passo',
      interval: 'Millisecondi per passo (0 = predefinito)',
      maxTokens: 'La maggior parte dei token contemporaneamente (0 = nessun limite)',
      newName: 'Nuovo nome',
      route: 'Nome del percorso',
    },
    route: {
      drawn: 'Percorso tracciato, {points} punti',
      recorded: 'Percorso registrato, {points} punti',
      area: 'Area di rimbalzo, {points} angoli',
      path: 'Sentiero',
      mode: 'Modalità',
      interval: 'Intervallo',
      maxTokens: 'La maggior parte dei gettoni',
      randomStart: 'Inizio casuale',
      walls: 'Muri',
      start: 'Inizio fisso',
      tokens: 'Gettoni',
    },
    record: {
      title: 'Registrazione "{name}"',
      intro:
        'Registrazione {token} (si sposta finora: {count}). Clicca sulle frecce, oppure trascina il token sulla mappa; ogni mossa viene registrata.',
    },
    settings: {
      interval: {
        label: 'Intervallo',
        desc: 'Millisecondi tra i passaggi. Ogni percorso può sovrascriverlo.',
      },
      movement: {
        label: 'Movimento',
        desc: 'la cella si sposta di una cella per passo; segment sposta un intero passo (come U3) contemporaneamente, come faceva la versione 4.',
      },
      facing: {
        label: 'Gira i gettoni',
        desc: 'Gira i gettoni in modo che siano rivolti verso la direzione in cui stanno andando: spento o nel modo in cui è rivolta la grafica dei gettoni (su, giù, sinistra o destra).',
      },
      combatDetection: {
        label: 'Rilevamento del combattimento',
        desc: 'Come viene notato il combattimento: tracker (il contaturni è aperto con qualcuno al suo interno), manuale (i pulsanti Combat On/Off) o entrambi.',
      },
      combatBehaviour: {
        label: 'Comportamento di combattimento',
        desc: 'Cosa fanno le pattuglie in combattimento: pausa, passo (muoviti una volta ogni volta che passa il turno) o ignora (continua a muoverti).',
      },
      lockMode: {
        label: 'Modalità di blocco',
        desc: 'Come Lock trattiene un token: nativo (il blocco della posizione di Roll20, quindi nessuno può trascinarlo), ripristina (le mosse vengono annullate) o blocca (smette di pattugliare e seguire ma può ancora essere trascinato).',
      },
      lockMarker: {
        label: 'Indicatore di blocco',
        desc: 'Indicatore di stato mostrato sui token bloccati o nessuno. I giocatori possono vedere i marcatori.',
      },
      followMode: {
        label: 'Modalità Segui',
        desc: 'sentiero: i seguaci camminano in fila indiana sulle orme del leader. formazione: i seguaci mantengono la loro posizione attorno al leader (trascina un seguace per cambiarne la posizione).',
      },
      manualMove: {
        label: 'Trascinare una pattuglia',
        desc: 'Quando trascini un segnalino pattuglia: continua (il percorso prosegue da dove lo hai lasciato) oppure fermati (la pattuglia termina).',
      },
      stopMarkers: {
        label: 'Indicatori di arresto',
        desc: 'Indicatori di stato che tolgono un gettone dal suo percorso e gli impediscono di seguirlo, separati da punto e virgola (ad esempio morto; rosso) o nessuno. Anche i seguaci di un leader con uno di questi segnalini si fermano.',
      },
      markerAction: {
        label: "Arresta l'azione del marcatore",
        desc: "Cosa fa un segnalino di pattuglia quando riceve un Segnalino di Stop: si ferma (rimane dov'è) o si resetta (torna al punto di partenza).",
      },
      wallMode: {
        label: 'Muri',
        desc: "Cosa fanno le pattuglie e i seguaci con l'illuminazione dinamica dei muri e delle porte e finestre chiuse: ignorare (attraversare), trattenere (aspettare finché la strada è libera, ad esempio finché non si apre una porta) o girare (le pattuglie tornano indietro). Ogni percorso può scegliere il proprio, quindi i fantasmi possono ancora camminare attraverso i muri.",
      },
      wallCheck: {
        label: 'Controllo del muro',
        desc: "centro: solo la parte centrale del gettone deve restare lontana dai muri. larghezza: lo fa l'intero gettone, quindi un gettone grande non può passare attraverso uno spazio stretto.",
      },
      oneWayWalls: {
        label: 'Muri a senso unico',
        desc: 'Se i muri unidirezionali fermano i gettoni (blocco) o meno (passaggio).',
      },
      transparentWalls: {
        label: 'Pareti trasparenti',
        desc: 'Sia che le pareti trasparenti, che lasciano passare la luce, fermino i gettoni (bloccano) oppure no (passino).',
      },
      buttonStep: {
        label: 'Celle per clic',
        desc: 'Di quanto le frecce di registrazione spostano un token.',
      },
      language: {
        label: 'Lingua',
        desc: 'Lingua per menu, messaggi e dispense.',
      },
    },
    status: {
      routes: 'Percorsi',
      patrols: 'Gettoni di pattugliamento',
      followers: 'Seguono i token',
      locked: 'Gettoni bloccati',
      recordings: 'Registrazioni',
      paused: 'In pausa',
      combat: 'Combattere',
      page: 'Pagina corrente',
      grid: 'Griglia',
      cell: 'Dimensione della cella',
      calibration: 'Calibrazione',
    },
    help: {
      menu: 'Mostra il menù.',
      start: 'Metti i gettoni selezionati su un percorso.',
      stop: 'Ferma i gettoni selezionati (pattuglie e seguiti), ogni gettone su un percorso o tutti.',
      reset: 'Riporta i gettoni al punto in cui hanno iniziato e fermali.',
      pause: 'Metti in pausa o riprendi ogni pattuglia.',
      lock: 'Mantieni i gettoni selezionati in posizione o rilasciali.',
      leader: 'Scegli il token selezionato come leader da seguire.',
      follow:
        'Fai in modo che i gettoni selezionati seguano il leader o un gettone indicato per nome.',
      unfollow: 'Arresta i token selezionati che seguono.',
      add: 'Crea un percorso da un codice passo, come U2R2D2L2.',
      edit: 'Modificare il codice passo di un percorso.',
      draw: 'Crea un percorso che segue il disegno selezionato in questa pagina.',
      bounce:
        "Crea un percorso sul quale i token vagano all'interno del disegno chiuso selezionato, rimbalzando sui suoi bordi.",
      record: 'Registra un percorso spostando il token selezionato con i pulsanti o trascinandolo.',
      route: "Cambia un'opzione di percorso: modalità, intervallo, max, casuale, muri o inizio.",
      show: 'Mostra i dettagli e i pulsanti di un percorso.',
      rename: 'Rinominare un percorso.',
      copy: 'Copia un percorso con un nuovo nome.',
      remove: 'Rimuovere un percorso (chiede prima).',
      ids: 'Agisci sui token con questi ID invece che su quelli selezionati, in modo che altri Mod come ScriptCard possano controllare i token. rimuovi --ids toglie i token dai loro percorsi; non rimuove mai un percorso.',
      list: 'Elenca i percorsi o i token controllati.',
      examples: 'Aggiungi i percorsi di esempio.',
      export: 'Mostra percorsi come testo da copiare in un altro gioco.',
      import: 'Aggiungi percorsi dal testo di esportazione.',
      combat: 'Attiva o disattiva il combattimento manualmente.',
      set: "Modifica un'impostazione o mostra tutte le impostazioni.",
      calibrate:
        'Allinea la griglia con i gettoni agganciati ai centri delle celle o rimuovi la calibrazione.',
      status: 'Mostra cosa sta facendo il Mod e come vede questa pagina.',
      journal: 'Ricostruisci le dispense del mazzo di aiuto e di comando.',
      help: 'Mostra questo elenco.',
      footer:
        'Le istruzioni complete si trovano nel volantino "{help}"; i pulsanti sono in "{deck}". {legacy} funziona ancora con i comandi della versione 4.',
    },
    handout: {
      versionLabel: 'Versione',
      subtitle: 'Pattuglie, seguaci e serrature per i giochi Jumpgate e Legacy',
      overview: {
        heading: 'Panoramica',
        body: 'TokenController sposta i token per te. Dai a una guardia un percorso di pattuglia, fai in modo che un carro segua il suo conducente o chiudi una statua sul posto. I percorsi possono essere digitati come codice passo, tracciati da un disegno sulla mappa o registrati spostando un token. I percorsi funzionano su pagine quadrate, esagonali, isometriche, dimetriche e senza griglia.',
      },
      quickStart: {
        heading: 'Avvio rapido',
        steps: [
          'Apri il volantino del Command Deck o digita !tokencontroller per il menu.',
          'Fai clic su Esempi per aggiungere alcuni percorsi già pronti o su Codice passo per digitarne uno tuo (ad esempio U2R2D2L2).',
          'Seleziona uno o più token e fai clic su Avvia accanto a un percorso.',
          'Seleziona un token e fai clic su Interrompi per interromperlo o su Reimposta per rimandarlo al punto in cui è iniziato.',
        ],
      },
      routes: {
        heading: 'Realizzazione di percorsi',
        points: [
          'Codice passo: digita mosse come U2R2D2L2. I codici non sono legati a un luogo sulla mappa, quindi lo stesso percorso funziona ovunque.',
          "Dal disegno: disegna una linea, un poligono, una forma a mano libera, un rettangolo o un'ellisse con gli strumenti di disegno, selezionala e fai clic su Da disegno. I token la percorrono, solo su quella pagina. Successivamente è possibile eliminare il disegno.",
          'Registra: seleziona un token e fai clic su Registra. Spostarlo con i pulsanti freccia o trascinarlo sulla mappa (vengono seguiti 20 waypoint), quindi fare clic su Salva. Sulle griglie quadrate la registrazione diventa un codice passo che è possibile modificare.',
          'I percorsi ad anello riprendono da capo; i percorsi di andata e ritorno ripercorrono la strada da cui sono venuti; una volta che i percorsi si fermano alla fine. Nuovi percorsi che terminano dove iniziano il giro; altri vanno avanti e indietro.',
          "Area di rimbalzo: disegna una forma chiusa attorno all'area, selezionala e fai clic su Area di rimbalzo. I gettoni avviati su di esso viaggiano in linea retta e rimbalzano sui suoi bordi (e sui muri, a meno che il percorso non li ignori), girando un po' a caso ogni volta. L'avvio casuale inserisce ciascun gettone in una cella casuale dell'area.",
        ],
      },
      codes: {
        colCode: 'Codice',
        colMeaning: 'Senso',
        move: 'Spostati su, giù, a sinistra o a destra, di una cella.',
        diagonal: 'Muoviti in diagonale.',
        distance: 'Un numero dopo una direzione sposta altrettante celle.',
        face: 'Girati per affrontare una direzione senza muoverti (sono necessari i gettoni di svolta).',
        wait: 'Attendi un passaggio o il numero di passaggi specificato.',
        stealth:
          'Sposta il token tra il livello token e il livello GM, in modo che svanisca e riapparisca.',
      },
      routeOptions: {
        heading: 'Opzioni del percorso',
        colOption: 'Opzione',
        colMeaning: 'Senso',
        mode: 'loop, pingpong (avanti e indietro) o una volta.',
        interval: "Millisecondi per passo per questo percorso o 0 per l'intervallo globale.",
        max: 'Il numero massimo di token che possono trovarsi sul percorso contemporaneamente o 0 per nessun limite.',
        random: 'on: ogni token inizia in un punto casuale lungo il percorso.',
        walls:
          "ignora (cammina attraverso i muri), tieni premuto (aspetta davanti ai muri e alle porte chiuse), gira (torna indietro) o imposta il valore predefinito (usa l'impostazione Muri).",
        start:
          'set: i token saltano alla posizione del token selezionato quando iniziano. chiaro: iniziano da dove si trovano.',
      },
      tokens: {
        heading: 'Token di controllo',
        points: [
          'Un token si trova su un percorso alla volta. Avviarlo su un altro percorso sostituisce il primo.',
          "Stop lascia i gettoni dove sono. Il ripristino li riporta al punto in cui si trovavano prima dell'inizio, nel livello originale.",
          'La serratura mantiene un gettone in posizione. I gettoni bloccati non pattugliano né seguono finché non vengono sbloccati.',
          'Segui: seleziona il leader e fai clic su Leader, quindi seleziona i follower e fai clic su Segui. Puoi anche digitare il nome del leader: !tokencontroller segui Goblin Boss. I follower seguono i token che pattugliano, i token che trascini e i token spostati da TokenMod.',
          'I follower possono seguire altri follower, creando una catena o una colonna.',
          "Trascinare un gettone di pattuglia riporta la pattuglia dal punto in cui l'hai rilasciata, a meno che il trascinamento di una pattuglia non sia impostato per interrompersi.",
          "Muri: con l'impostazione Muri attiva, pattuglie e seguaci non attraversano muri con illuminazione dinamica o porte e finestre chiuse; porte e finestre aperte li lasciano passare. Assegna a un percorso l'opzione delle proprie mura (ad esempio ignora per un fantasma).",
          'Segnalini di Stop: un gettone che ottiene uno di questi segnalini di stato (ad esempio morto) lascia il suo percorso e smette di seguirlo, e anche i seguaci di un leader che ottiene uno si fermano. Impostali con !tokencontroller set stopMarkers dead;red. Funziona anche quando un altro Mod aggiunge il marcatore.',
        ],
      },
      grids: {
        heading: 'Griglie',
        points: [
          'La dimensione della cella e il tipo di griglia vengono letti da ogni pagina, quindi pagine diverse possono utilizzare griglie diverse.',
          'U e D significano sempre su e giù per lo schermo. Sulle griglie esagonali, le mosse senza vicini corrispondenti zigzagano; sulle griglie isometriche e dimetriche, le diagonali incrociano un diamante.',
          "Le pagine con l'aggancio disattivato si spostano a incrementi di 70 pixel senza allinearsi a una griglia.",
          'Se i token escono dalla griglia, aggancia un token al centro della cella, selezionalo e fai clic su Calibra. Seleziona due token nelle celle adiacenti di una riga per fissare anche la dimensione della cella.',
        ],
      },
      combat: {
        heading: 'Combattere',
        points: [
          'Il rilevamento del combattimento sceglie il modo in cui viene notato il combattimento: il contaturni, i pulsanti di attivazione/disattivazione del combattimento o entrambi.',
          'Il Comportamento di Combattimento sceglie cosa fanno le pattuglie: fermarsi, muoversi di un passo ogni volta che passa il turno o continuare a muoversi.',
          'Pausa tutto arresta ogni pattuglia in qualsiasi momento; Riprendi li avvia di nuovo.',
        ],
      },
      commands: {
        heading: 'Comandi',
        intro:
          'Solo i GM possono utilizzare questi comandi. È possibile nominare i percorsi o fare riferimento al loro #id dai pulsanti del menu. Metti i nomi con spazi tra "virgolette" quando un comando richiede due nomi.',
        mods: 'Anche altri mod possono inviare questi comandi, ad esempio da ScriptCards. Non possono selezionare i token, quindi li nominano con --ids seguito da ID token separati da punto e virgola: !tc stop --ids ID1;ID2. Le risposte vanno al GM.',
        colCommand: 'Comando',
        colDesc: 'Cosa fa',
      },
      settings: {
        heading: 'Impostazioni',
        intro:
          'Modifica le impostazioni dal menu, con !tokencontroller set <setting> <value>, o nella pagina Mod settings nella schermata API Scripts.',
        colKey: 'Chiave',
        colName: 'Collocamento',
        colDesc: 'Descrizione',
      },
      upgrading: {
        heading: 'Aggiornamento dalla versione 4',
        points: [
          'Vengono conservati i percorsi, i gettoni di pattugliamento, le serrature, i seguaci e le bozze non completate. Le bozze diventano percorsi che terminano con "(bozza)".',
          'Le impostazioni della versione 4 vengono mantenute: intervallo, passaggi secondari, rotazione, pattuglia di combattimento e unità per clic.',
          'I comandi !tc e !token-control e le macro T-Cntrl_ continuano a funzionare. La tabella mostra i nuovi comandi.',
          "La versione 4 inviava l'intero menu dopo ogni azione; la versione 5 invia invece una breve risposta.",
          "L'impostazione Pixel per unità è scomparsa: la dimensione della cella proviene da ciascuna pagina. Il costruttore HTML non è più necessario.",
          "Il vecchio volantino della Guida all'Uso, che ogni giocatore poteva vedere, è sostituito da questo volantino riservato solo al GM.",
        ],
        colV4: 'Versione 4',
        colV5: 'Versione 5',
      },
      troubleshooting: {
        heading: 'Risoluzione dei problemi',
        points: [
          'I gettoni non si muovono: controlla lo Stato. Le pattuglie attendono mentre sono in pausa, mentre sono bloccate e in combattimento quando il comportamento di combattimento è in pausa.',
          "I token si muovono alla distanza sbagliata: la dimensione della griglia o l'aggancio della pagina potrebbero essere cambiati; prova a calibrare.",
          'Un percorso disegnato non si avvierà: i percorsi tracciati funzionano solo nella pagina su cui sono stati disegnati.',
          'I follower non si muovono quando un altro Mod sposta il leader: solo TokenMod riporta le sue mosse. Altri mod possono chiamare TokenController.ObserveTokenChange.',
          'Segnala problemi sul forum Roll20 con qualsiasi messaggio dalla console API.',
        ],
      },
      languages: {
        heading: 'Lingue',
        body: "TokenController è tradotto nelle lingue seguenti. Scegline uno con l'impostazione Lingua.",
        colCode: 'Codice',
        colName: 'Lingua',
        colNative: 'Nome nativo',
      },
      credits: {
        heading: 'Crediti',
        original: 'Mod originale di',
        maintainer: 'Versione 5 mantenuta da',
        support: 'Segnala bug e idee sul forum Roll20 Mod o su GitHub.',
      },
      footer: 'I pulsanti per ogni azione si trovano nel volantino "{deck}".',
    },
    deck: {
      subtitle: 'Mazzo di comando',
      patrolsDesc: 'Avvia, ferma e metti in pausa le pattuglie. Seleziona prima i token.',
      createDesc:
        'Crea percorsi partendo da un codice passo, da un disegno o registrando un gettone.',
      selectedDesc: 'Blocca i token o fai in modo che seguano un leader.',
      toolsDesc: 'Combattimento, impostazioni e strumenti della griglia.',
      footer: 'Le istruzioni complete si trovano nel volantino "{help}".',
    },
  };

  const TRANSLATION$9 = {
    titles: {
      ready: 'TokenController の準備ができました。',
      settings: 'トークンコントローラーの設定',
      help: 'TokenController コマンド',
      export: 'ルートのエクスポート',
      routes: 'ルート',
      tokens: '管理されたトークン',
      status: 'トークンコントローラーのステータス',
    },
    messages: {
      migrated:
        'バージョン 4 からアップグレードされました。ルートは {routes} のままです。保持されているパトロール トークン: {patrols}。古いマクロと !tc コマンドは引き続き機能します。',
      removedGuide:
        'プレイヤーが閲覧できる古い「TokenController 使用ガイド」配布物は、GM 専用のヘルプ配布物に置き換えられました。',
      pruned: 'トークンが存在しなくなったため忘れられたパトロール: {count}。',
      readyHint: 'メニューに「!tokencontroller」と入力するか、配布資料のコマンドデッキを開きます。',
      combatStarted: {
        pause: '戦闘が開始されました: 戦闘が終了するまでパトロールは一時停止されます。',
        step: '戦闘が開始されました: パトロールは毎ターン 1 ステップ移動します。',
      },
      combatEnded: '戦闘は終了しました。パトロールは続けられます。',
      routeAdded: 'ルート「{name}」が追加されました ({mode})。',
      routeUpdated:
        'ルート「{name}」が更新されました。その上のトークンは新しいルートを継続します。',
      confirmRemove: 'ルート「{name}」を削除しますか?停止するトークン: {count}。',
      routeRemoved: 'ルート「{name}」が削除されました。停止したトークン: {count}。',
      routeRenamed: 'ルート「{from}」の名前が「{to}」に変更されました。',
      examplesAdded: '追加されたルートの例: {count}。',
      exportHint: '以下のテキストをコピーし、任意のゲームの {command} の後に貼り付けます。',
      imported:
        '{added} ルートをインポートしました。 {skipped} をスキップしました (名前はすでに使用されているか無効です)。',
      started: '{tokens} は「{name}」に開始されました。',
      stopped: '停止したトークン: {count}。',
      reset: 'トークンは開始位置に戻りました: {count}。',
      locked: 'ロック済み: {tokens} ({mode})。',
      unlocked: 'ロック解除済み: {tokens}。',
      leaderSet: '{token} がリーダーです。フォロワーを選択し、「フォロー」をクリックします。',
      following: '{leader} ({mode}) に続きます: {tokens}。',
      unfollowed: 'トークンはもうフォローされていません: {count}。',
      noRecordings: '何も記録されていません。',
      recordingCancelled: '「{name}」の記録がキャンセルされました。',
      languages: 'サポートされている言語: {list}',
      settingChanged: '{setting} は {value} になりました。',
      combatOn: '戦闘スイッチがオンになりました。',
      combatOff: '戦闘はオフになりました。',
      calibrationCleared: 'グリッド キャリブレーションはこのページから削除されました。',
      calibrated: 'このページ用に調整されたグリッド (セル サイズ × {scale})。',
      paused: 'すべてのパトロールが停止されました。',
      resumed: 'パトロールが再開されました。',
      journalRebuilt: '再構築された配布資料: {help} および {deck}。',
      markerStopped: '停止マーカーによって停止されました: {tokens}。',
      markerReset: '停止マーカーによって開始位置に戻されました: {tokens}。',
    },
    errors: {
      noTokens: 'トークンが選択されていません。',
      noRouteName: '路線名は記載されていません。',
      routeNotFound: '「{name}」というルートはありません。',
      routeExists: '「{name}」というルートがすでに存在します。',
      code: {
        empty: 'ステップコードが空です。',
        badToken: 'ステップコード「{code}」の「{at}」に理解できない箇所があります。',
        tooFar: 'ステップ「{at}」が長すぎます。',
      },
      routeInvalid: 'そのルートは保存できませんでした。',
      usageAdd: '名前とステップコードを入力します。',
      usageEdit: 'ルートと新しいステップ コードを指定します。',
      selectOneDrawing:
        '図面 (線、多角形、フリーハンド形状、長方形、または楕円) を 1 つだけ選択します。',
      drawingEmpty: '選択した図面にはフォローするにはポイントが少なすぎます。',
      usageRoute: 'ルート、オプション、値を指定します。',
      unknownRouteOption: '「{option}」というルート オプションはありません。',
      selectOneToken: 'トークンを 1 つだけ選択します。',
      badRouteValue: '「{value}」は {option} の有効な値ではありません。',
      usageRename: 'ルートとその新しい名前を指定します。',
      usageCopy: 'コピーのルートと名前を指定します。',
      badJson: 'これはルート エクスポート テキストではありません。',
      tokenLocked: '{tokens} を開始できません: ロックされています。',
      tokenMarked: '{tokens} は開始できません。停止マーカーがあります。',
      outsideArea: '{tokens} は開始できません。「{name}」の外にあります。',
      selectOneArea:
        '閉じた図面 (多角形、長方形、楕円、またはフリーハンド ループ) を 1 つだけ選択します。',
      areaTooSmall: '選択した図面で領域を作成するには、少なくとも 3 つの角が必要です。',
      idsNotFound: 'これらの ID を持つトークンはありません: {ids}。',
      routeOnOtherPage: '{tokens} を開始できません: 「{name}」は別のページに描画されました。',
      startOnOtherPage: '{tokens} を開始できません。「{name}」の固定開始点は別のページにあります。',
      routeFull: '{tokens} を開始できません: 「{name}」にはすでに {max} トークンがあります。',
      noPage: 'ページが見つかりませんでした。',
      emptyTrack: '{tokens} を開始できません: 「{name}」には移動がありません。',
      leaderNotFound: 'このページには「{name}」というトークンが見つかりませんでした。',
      noLeader: 'まだリーダーはいません。',
      followLoop: '{tokens} は、その後に続くトークンをフォローできません。',
      alreadyRecording: '{token} はすでに記録されています。',
      recordingTokenGone: '「{name}」を記録するためのトークンは存在しません。',
      recordingEmpty: 'まだ何も記録されていません。',
      unknownSetting: '「{key}」という設定はありません。',
      badSettingValue: '「{value}」は {key} の有効な値ではありません。',
      calibrateNeedsTokens: 'セルの中心にスナップされた 1 つまたは 2 つのトークンを選択します。',
      calibrateFailed: '選択したトークンはグリッドの調整に使用できませんでした。',
      unknownCommand: '不明なコマンド「{command}」。',
      gmOnly: 'TokenController を使用できるのは GM のみです。',
      internal: '何か問題が発生しました。詳細は API コンソールに記載されています。',
    },
    hints: {
      noTokens: 'まずマップ上のトークンを選択します。',
      noRouteName: '例: !tokencontroller add Guard Walk U2R2D2L2',
      routeNotFound: 'すべてのルートを表示するには、「!tokencontroller list」と入力します。',
      code: {
        empty: '例: U2R2D2L2',
        badToken:
          'セル数を指定して U、D、L、R、UL、UR、DL、または DR を使用します。待機するには W、ステルスには S を使用します。',
        tooFar: '1 つのステップは最大 100 セルまで可能です。最大 100 ティック待機します。',
      },
      selectOneDrawing:
        '描画ツールでルートを描画し、それを選択し (クリックし損ねた場合は、細い輪郭の周囲にボックスをドラッグします)、もう一度試してください。',
      usageRoute: 'オプション: モード、間隔、最大、ランダム、壁、開始。',
      routeOnOtherPage: '描画されたルートは、それが描画されたページ上でのみ機能します。',
      startOnOtherPage: '固定開始をクリアするか、最初にトークンをそのページに移動します。',
      noLeader:
        'リーダーを選択して「リーダー」をクリックするか、その名前を指定します: !tokencontroller follow Name',
      leaderNotFound:
        'マップに表示されているとおり正確にトークン名を使用するか、そのトークン ID を使用します。',
      badJson:
        '!tokencontroller エクスポート (または v4 エクスポートパス) からのテキストを正確に貼り付けます。',
      unknownSetting: 'すべての設定を表示するには、「!tokencontroller set」と入力します。',
      calibrateNeedsTokens:
        '1 つのトークンがグリッドに並びます。行の隣接するセルにある 2 つのトークンもセル サイズを固定します。',
      calibrateFailed:
        'トークンが同じ行 (16 進数 (H) ページの列) の隣接するセルにあることを確認してください。',
      unknownCommand: 'コマンドのリストを表示するには、「!tokencontroller help」と入力します。',
      tokenLocked: 'まずトークンのロックを解除します。',
      tokenMarked: 'マーカーを削除するか、[マーカーの停止] 設定を変更します。',
      outsideArea:
        '最初にエリア内でトークンを移動するか、ルートのランダム スタートをオンにします。',
      selectOneArea:
        '描画ツールで領域を描画し、それを選択し (クリックし損ねた場合は、細い輪郭の周囲にボックスをドラッグします)、もう一度試してください。',
      idsNotFound: '--ids の後にトークン ID をセミコロンで区切って指定します。',
    },
    warnings: {
      idsNotFound: 'これらの ID を持つトークンはないため、スキップされました: {ids}。',
      offPage:
        'ルートの一部がページからはみ出しています (ステップ: {count})。それらの手順はスキップされます。',
      combatTrackerOnly:
        '戦闘検出はターン トラッカーに設定されているため、このスイッチは変更するまで効果がありません。',
      unitPx:
        'バージョン 5 では各ページからセル サイズを読み取るため、古い単位あたりのピクセル数の設定は使用されなくなりました。トークンが一列に並んでいない場合は、!tokencontroller 調整を使用します。',
    },
    values: {
      on: 'の上',
      off: 'オフ',
      none: 'なし',
      default: 'デフォルト',
      noLimit: '制限なし',
      ms: '{ms} ミリ秒',
      andMore: 'および {count} 詳細',
      following: '{leader} をフォロー中',
      locked: 'ロックされた',
      gridless: 'スナップなし',
      grid: {
        square: '四角',
        hex: '16進数',
        iso: 'アイソメトリック / ディメトリック',
      },
      mode: {
        loop: 'ループ',
        pingpong: '行ったり来たり',
        once: '一度',
      },
      movement: {
        cell: '一度に 1 つのセル',
        segment: '一度に全ステップ',
      },
      facing: {
        off: '回転しないでください',
        up: 'アートは上を向く',
        down: 'アートは下を向きます',
        left: 'アートフェイス左',
        right: 'アートは右向き',
      },
      combatDetection: {
        tracker: 'ターントラッカー',
        manual: 'GMスイッチ',
        both: 'ターントラッカーまたはGMスイッチ',
      },
      combatBehaviour: {
        pause: '一時停止',
        step: '毎ターン移動する',
        ignore: '動き続けてください',
      },
      lockMode: {
        native: 'Roll20のポジションロック',
        revert: '移動を元に戻す',
        freeze: 'じっとしてるだけ',
      },
      followMode: {
        trail: '単一ファイル',
        formation: '形成',
      },
      manualMove: {
        continue: 'そこから続けてください',
        stop: 'パトロールをやめてください',
      },
      markerAction: {
        stop: 'そこに止まってください',
        reset: '最初に戻る',
      },
      wallMode: {
        ignore: '壁を通り抜ける',
        hold: '壁際で待つ',
        turn: '壁に向かって振り返る',
      },
      wallCheck: {
        centre: 'トークンの中心',
        width: 'トークン全体',
      },
      oneWayWalls: {
        block: 'ブロック',
        pass: '通してください',
      },
      transparentWalls: {
        block: 'ブロック',
        pass: '通してください',
      },
    },
    menu: {
      statusRunning: 'パトロールトークン: {patrols}。ルート: {routes}。',
      statusPaused: 'すべてのパトロールが停止されています。',
      statusCombat: {
        pause: '戦闘中: パトロールは一時停止されます。',
        step: '戦闘中: パトロールはターンごとに移動します。',
      },
      routes: 'ルート',
      noRoutes:
        'まだルートはありません。 1 つ追加する、1 つ描く、1 つ記録する、または例を追加します。',
      create: '新しいルート',
      selected: '選択されたトークン',
      tools: 'ツール',
      recordings: '録音',
      patrols: 'パトロール',
    },
    buttons: {
      start: '始める',
      stop: '停止',
      add: 'ステップコード',
      draw: '図面から',
      bounce: 'バウンスエリア',
      record: '記録',
      examples: '例',
      reset: 'リセット',
      lock: 'ロック',
      unlock: 'ロックを解除する',
      leader: 'リーダー',
      follow: 'フォローする',
      unfollow: 'フォローを解除する',
      resume: '再開する',
      pause: 'すべて一時停止',
      combatOn: '戦闘開始',
      combatOff: '戦闘オフ',
      stopAll: 'すべて停止',
      settings: '設定',
      status: '状態',
      help: 'ヘルプ',
      open: '開ける',
      clearStart: 'クリア',
      setStart: '選択済みに設定',
      edit: 'コードを編集する',
      rename: '名前の変更',
      copy: 'コピー',
      export: '輸出',
      remove: '取り除く',
      menu: 'メニュー',
      wait: '待って',
      stealth: 'ステルス',
      undo: '元に戻す',
      save: '保存',
      cancel: 'キャンセル',
      confirm: 'はい、削除します',
      startRoute: 'スタートルート',
      list: 'ルートのリスト',
      calibrate: '校正する',
    },
    prompts: {
      name: '路線名',
      code: 'ステップコード',
      interval: 'ステップごとのミリ秒 (0 = デフォルト)',
      maxTokens: '一度にほとんどのトークン (0 = 制限なし)',
      newName: '新しい名前',
      route: '路線名',
    },
    route: {
      drawn: '描かれたルート、{points} ポイント',
      recorded: '記録されたルート、{points} ポイント',
      area: 'バウンスエリア、{points} コーナー',
      path: 'パス',
      mode: 'モード',
      interval: '間隔',
      maxTokens: 'ほとんどのトークン',
      randomStart: 'ランダムスタート',
      walls: '壁',
      start: '固定スタート',
      tokens: 'トークン',
    },
    record: {
      title: '「{name}」を記録中',
      intro:
        '{token} を記録しています (ここまでの移動: {count})。矢印をクリックするか、マップ上でトークンをドラッグします。あらゆる動きが記録されます。',
    },
    settings: {
      interval: {
        label: '間隔',
        desc: 'ステップ間のミリ秒。各ルートはそれをオーバーライドできます。',
      },
      movement: {
        label: '動き',
        desc: 'セルはステップごとに 1 つのセルを移動します。セグメントは、バージョン 4 と同様に、ステップ全体 (U3 など) を一度に移動します。',
      },
      facing: {
        label: 'ターントークン',
        desc: 'トークンの向きを、オフ、またはトークン アートの向き (上、下、左、または右) に向けます。',
      },
      combatDetection: {
        label: '戦闘検知',
        desc: '戦闘の通知方法: トラッカー (誰かがいる状態でターン トラッカーが開いている)、手動 (戦闘オン/オフ ボタン)、またはその両方。',
      },
      combatBehaviour: {
        label: '戦闘行動',
        desc: '戦闘中にパトロールが行うこと: 一時停止、ステップ (ターンが経過するたびに 1 回移動)、または無視 (移動を続ける)。',
      },
      lockMode: {
        label: 'ロックモード',
        desc: 'Lock がトークンを保持する方法: ネイティブ (Roll20 独自の位置ロックのため、誰もドラッグできません)、元に戻す (移動は取り消されます)、またはフリーズ (パトロールと追跡を停止しますが、引き続きドラッグできます)。',
      },
      lockMarker: {
        label: 'ロックマーカー',
        desc: 'ロックされたトークンにステータス マーカーが表示されるか、何も表示されません。プレイヤーにはマーカーが表示されます。',
      },
      followMode: {
        label: 'フォローモード',
        desc: 'トレイル: フォロワーはリーダーの足跡を一列で歩きます。フォーメーション: フォロワーはリーダーの周囲に位置を保ちます (位置を変更するには、フォロワーをドラッグします)。',
      },
      manualMove: {
        label: 'パトロールのドラッグ',
        desc: 'パトロール トークンをドラッグする場合: 続行 (ドロップした場所からルートが続行) または停止 (パトロールが終了)。',
      },
      stopMarkers: {
        label: 'ストップマーカー',
        desc: 'トークンをルートから外し、その後のトークンを停止するステータス マーカー。セミコロンで区切られるか (例: Dead;red)、または何もありません。これらのマーカーのいずれかを持っているリーダーのフォロワーも停止します。',
      },
      markerAction: {
        label: 'マーカーアクションの停止',
        desc: '停止マーカーを取得したときのパトロール トークンの動作: 停止 (その場所に留まる) またはリセット (開始位置に戻る)。',
      },
      wallMode: {
        label: '壁',
        desc: '動的照明の壁や閉ざされたドアや窓でパトロールや追随者が行うこと: 無視 (通り抜ける)、保留 (道が空くまで、たとえばドアが開くまで待つ)、または方向転換 (パトロールが引き返す)。それぞれのルートは独自に選択できるため、幽霊は壁を通り抜けることができます。',
      },
      wallCheck: {
        label: '壁のチェック',
        desc: '中心: トークンの中央だけが壁から離れていなければなりません。 width: トークン全体がそうなるので、大きなトークンは狭い隙間を通り抜けることができません。',
      },
      oneWayWalls: {
        label: '一方通行の壁',
        desc: '一方通行の壁がトークンを止めるか（ブロック）、止めないか（パス）。',
      },
      transparentWalls: {
        label: 'シースルーウォール',
        desc: '光を通す透明な壁がトークンを止めるか（ブロックするか）、しないか（通過するか）。',
      },
      buttonStep: {
        label: 'クリックごとのセル数',
        desc: '記録用の矢印がトークンを移動させる距離。',
      },
      language: {
        label: '言語',
        desc: 'メニュー、メッセージ、配布資料の言語。',
      },
    },
    status: {
      routes: 'ルート',
      patrols: 'パトロールトークン',
      followers: 'トークンをフォロー中',
      locked: 'ロックされたトークン',
      recordings: '録音',
      paused: '一時停止中',
      combat: '戦闘',
      page: '現在のページ',
      grid: 'グリッド',
      cell: 'セルサイズ',
      calibration: '較正',
    },
    help: {
      menu: 'メニューを表示します。',
      start: '選択したトークンをルート上に配置します。',
      stop: '選択したトークン (パトロールとフォロー)、ルート上のすべてのトークン、またはすべてを停止します。',
      reset: 'トークンを開始位置に戻して停止します。',
      pause: 'パトロールごとに一時停止または再開します。',
      lock: '選択したトークンを所定の位置に保持するか、放します。',
      leader: '選択したトークンをフォローするリーダーとして選択します。',
      follow: '選択したトークンをリーダー、または名前で指定されたトークンに従わせます。',
      unfollow: '選択したトークンの後続を停止します。',
      add: 'U2R2D2L2 などのステップ コードからルートを作成します。',
      edit: 'ルートのステップコードを変更します。',
      draw: 'このページで選択した図面に従うルートを作成します。',
      bounce: '選択した閉じた図面内をトークンが歩き回り、その端で跳ね返るルートを作成します。',
      record: '選択したトークンをボタンで移動するか、ドラッグしてルートを記録します。',
      route: 'ルート オプションを変更します: モード、間隔、最大、ランダム、壁、または開始。',
      show: 'ルートの詳細とボタンを表示します。',
      rename: 'ルートの名前を変更します。',
      copy: 'ルートを新しい名前でコピーします。',
      remove: 'ルートを削除します (最初に質問します)。',
      ids: '選択した ID の代わりにこれらの ID を持つトークンに作用するため、ScriptCard などの他の Mod がトークンを制御できるようになります。 --ids を削除すると、トークンがルートから削除されます。ルートが削除されることはありません。',
      list: 'ルート、または制御されているトークンをリストします。',
      examples: 'ルート例を追加します。',
      export: '別のゲームにコピーするテキストとしてルートを表示します。',
      import: 'エクスポートテキストからルートを追加します。',
      combat: '手動で戦闘のオン/オフを切り替えます。',
      set: '設定を変更するか、すべての設定を表示します。',
      calibrate:
        'セルの中心にスナップされたトークンをグリッドに並べるか、キャリブレーションを削除します。',
      status: 'Mod が何をしているのか、そしてこのページをどのように認識しているのかを示します。',
      journal: 'ヘルプとコマンドデッキの配布資料を再構築します。',
      help: 'このリストを表示します。',
      footer:
        '完全な手順は配布資料「{help}」に記載されています。ボタンは「{deck}」にあります。 {legacy} は引き続きバージョン 4 コマンドで動作します。',
    },
    handout: {
      versionLabel: 'バージョン',
      subtitle: 'Jumpgate および Legacy ゲームのパトロール、フォロワー、ロック',
      overview: {
        heading: '概要',
        body: 'TokenController はトークンを移動します。警備員に巡回ルートを与えたり、カートに運転手を従わせたり、像を所定の位置に固定したりできます。ルートはステップ コードとして入力したり、地図上の描画から追跡したり、トークンを移動して記録したりできます。ルートは、正方形、16 進数、アイソメトリック、ディメトリック、グリッドなしのページで機能します。',
      },
      quickStart: {
        heading: 'クイックスタート',
        steps: [
          'コマンドデッキ配布資料を開くか、メニューに「!tokencontroller」と入力します。',
          '[例] をクリックして既製のルートを追加するか、独自のステップ コード (U2R2D2L2 など) を入力します。',
          '1 つ以上のトークンを選択し、ルートの横にある「開始」をクリックします。',
          'トークンを選択し、「停止」をクリックして停止するか、「リセット」をクリックして開始位置に戻します。',
        ],
      },
      routes: {
        heading: 'ルートの作成',
        points: [
          'ステップコード: U2R2D2L2 などの動きを入力します。コードは地図上の場所に関連付けられていないため、どこにいても同じルートが機能します。',
          '図面から: 描画ツールを使用して線、多角形、フリーハンド形状、長方形、または楕円を描き、それを選択して「図面から」をクリックします。トークンはそのページ上でのみそれに沿って歩きます。描画は後で削除できます。',
          '記録: トークンを選択し、「記録」をクリックします。矢印ボタンを使用して移動するか、マップ上でドラッグして (Roll20 ウェイポイントに従います)、[保存] をクリックします。正方形のグリッドでは、録音は編集可能なステップ コードになります。',
          'ループ ルートは最初からやり直します。往復ルートは来た道を戻ります。ルートが最後に停止すると。ループの開始位置で終了する新しいルート。他の人は行ったり来たりします。',
          'バウンスエリア: エリアの周囲に閉じた形状を描画し、それを選択して「バウンスエリア」をクリックします。その上で開始されたトークンは直線的に移動し、その端 (およびルートが無視しない限り壁) で跳ね返り、毎回少しランダムに回転します。ランダム スタートでは、各トークンがエリアのランダムなセルに配置されます。',
        ],
      },
      codes: {
        colCode: 'コード',
        colMeaning: '意味',
        move: '上下左右に 1 セルずつ移動します。',
        diagonal: '斜めに移動します。',
        distance: '方向の後の数字は、その数のセルを移動します。',
        face: '動かずに方向を向いて方向を向きます (ターン トークンが必要です)。',
        wait: '1 ステップ、または指定されたステップ数だけ待ちます。',
        stealth:
          'トークンをトークン レイヤーと GM レイヤーの間で移動すると、トークンが消えてから再び現れます。',
      },
      routeOptions: {
        heading: 'ルートオプション',
        colOption: 'オプション',
        colMeaning: '意味',
        mode: 'ループ、ピンポン（往復）、または 1 回。',
        interval: 'このルートのステップあたりのミリ秒、またはグローバル間隔の場合は 0。',
        max: 'ルート上に一度に存在できるトークンの最大数、または制限がない場合は 0。',
        random: 'on: 各トークンはルート上のランダムな点から始まります。',
        walls:
          '無視 (壁を通り抜ける)、保留 (壁や閉まったドアで待つ)、方向転換 (引き返す)、またはデフォルト (壁設定を使用)。',
        start:
          'set: トークンは開始時に選択されたトークンの位置にジャンプします。明確です。彼らは自分が立っているところから始まります。',
      },
      tokens: {
        heading: 'トークンの制御',
        points: [
          'トークンは一度に 1 つのルート上にあります。別のルートで開始すると、最初のルートが置き換えられます。',
          'Stop はトークンをその場に残します。リセットすると、元のレイヤー上の開始前の場所に戻ります。',
          'ロックはトークンを所定の位置に保持します。ロックされたトークンは、ロックが解除されるまでパトロールしたり追跡したりしません。',
          'フォロー: リーダーを選択して「リーダー」をクリックし、フォロワーを選択して「フォロー」をクリックします。リーダーの名前を入力することもできます: !tokencontroller follow ゴブリン ボス。フォロワーは、巡回するトークン、ドラッグしたトークン、TokenMod によって移動されたトークンを追跡します。',
          'フォロワーは他のフォロワーをフォローしてチェーンや列を作ることができます。',
          'パトロール トークンをドラッグすると、パトロールのドラッグが停止するように設定されていない限り、ドロップした場所からパトロールが続行されます。',
          '壁: 壁をオンにすると、パトロールとフォロワーは動的照明の壁や閉じたドアや窓を通り抜けません。開いたドアや窓はそれらを通過させます。ルートに独自の壁オプションを与えます (たとえば、ゴーストを無視する)。',
          '停止マーカー: これらのステータス マーカーの 1 つ (たとえば死亡) を取得したトークンはルートを離れてフォローを停止し、リーダーのフォロワーも 1 つの停止を取得します。 !tokencontroller set stopMarkers Dead;red で設定します。これは、別の Mod がマーカーを追加した場合にも機能します。',
        ],
      },
      grids: {
        heading: 'グリッド',
        points: [
          'セル サイズとグリッド タイプは各ページから読み取られるため、異なるページでは異なるグリッドを使用できます。',
          'U と D は常に画面の上下を意味します。 16 進グリッドでは、一致する隣接するものがない状態でジグザグに移動します。等角グリッドと二等角グリッドでは、対角線が 1 つのダイヤモンドと交差します。',
          'スナップがオフになっているページは、グリッドに整列せずに 70 ピクセル単位で移動します。',
          'トークンがグリッドから外れてしまった場合は、トークンをセルの中心にスナップし、それを選択して「調整」をクリックします。行の隣接するセルにある 2 つのトークンを選択して、セル サイズも固定します。',
        ],
      },
      combat: {
        heading: '戦闘',
        points: [
          '戦闘検知では、戦闘を検知する方法 (ターン トラッカー、戦闘オン/オフ ボタン、またはそのいずれか) を選択します。',
          '戦闘行動では、パトロールの動作を選択します。一時停止するか、ターンが経過するたびに 1 歩ずつ移動するか、動き続けるかです。',
          'すべて一時停止は、すべてのパトロールをいつでも停止します。再開すると再び開始されます。',
        ],
      },
      commands: {
        heading: 'コマンド',
        intro:
          'これらのコマンドは GM のみが使用できます。ルートには名前を付けることも、メニュー ボタンから #id で参照することもできます。コマンドに 2 つの名前が必要な場合は、名前を「引用符」で囲んでスペースを入れます。',
        mods: '他の Mod も、たとえば ScriptCard からこれらのコマンドを送信できます。トークンを選択できないため、--ids の後にトークン ID をセミコロンで区切って名前を付けます: !tc stop --ids ID1;ID2。返信は GM に送られます。',
        colCommand: '指示',
        colDesc: '何をするのか',
      },
      settings: {
        heading: '設定',
        intro:
          '!tokencontroller set <setting> <value> を使用してメニューから設定を変更するか、API Scripts 画面の Mod 設定ページで設定を変更します。',
        colKey: '鍵',
        colName: '設定',
        colDesc: '説明',
      },
      upgrading: {
        heading: 'バージョン 4 からのアップグレード',
        points: [
          'パス、パトロールトークン、ロック、フォロワー、未完成のドラフトが保持されます。ドラフトは「(ドラフト)」で終わるルートになります。',
          'バージョン 4 の設定 (間隔、サブステップ、ローテーション、戦闘パトロール、クリックあたりの単位) が維持されます。',
          '!tc および !token-control コマンドと T-Cntrl_ マクロは引き続き機能します。表に新しいコマンドを示します。',
          'バージョン 4 では、すべてのアクションの後にメニュー全体が送信されました。バージョン 5 では、代わりに短い応答が送信されます。',
          '単位あたりのピクセル数の設定はなくなりました。セル サイズは各ページから取得されます。 HTML ビルダーは必要なくなりました。',
          'すべてのプレイヤーが閲覧できる古い使用ガイドの配布物は、この GM 専用の配布物に置き換えられます。',
        ],
        colV4: 'バージョン4',
        colV5: 'バージョン5',
      },
      troubleshooting: {
        heading: 'トラブルシューティング',
        points: [
          'トークンが移動しない: ステータスを確認してください。パトロールは、一時停止中、ロック中、および戦闘動作が一時停止されている間は戦闘中に待機します。',
          'トークンが間違った距離を移動します。ページのグリッド サイズまたはスナップが変更された可能性があります。キャリブレーションを試してください。',
          '描画されたルートは開始されません。描画されたルートは、描画されたページ上でのみ機能します。',
          '別の Mod がリーダーを移動してもフォロワーは移動しません。TokenMod のみがその動きを報告します。他の Mod は TokenController.ObserveTokenChange を呼び出すことができます。',
          'API コンソールからのメッセージを添えて、Roll20 フォーラムで問題を報告してください。',
        ],
      },
      languages: {
        heading: '言語',
        body: 'TokenController は以下の言語に翻訳されています。言語設定でいずれかを選択します。',
        colCode: 'コード',
        colName: '言語',
        colNative: 'ネイティブネーム',
      },
      credits: {
        heading: 'クレジット',
        original: 'オリジナルModによる',
        maintainer: 'バージョン 5 の保守者',
        support: 'バグやアイデアは Roll20 Mod フォーラムまたは GitHub で報告してください。',
      },
      footer: 'すべてのアクションのボタンは配布資料「{deck}」にあります。',
    },
    deck: {
      subtitle: 'コマンドデッキ',
      patrolsDesc: 'パトロールを開始、停止、一時停止します。最初にトークンを選択します。',
      createDesc: 'ステップコード、図面、またはトークンを記録してルートを作成します。',
      selectedDesc: 'トークンをロックするか、リーダーに従うようにします。',
      toolsDesc: '戦闘、設定、グリッドツール。',
      footer: '完全な手順は配布資料「{help}」に記載されています。',
    },
  };

  const TRANSLATION$8 = {
    titles: {
      ready: 'TokenController가 준비되었습니다.',
      settings: '토큰컨트롤러 설정',
      help: '토큰 컨트롤러 명령',
      export: '경로 내보내기',
      routes: '노선',
      tokens: '통제되는 토큰',
      status: '토큰컨트롤러 상태',
    },
    messages: {
      migrated:
        '버전 4에서 업그레이드되었습니다. 유지된 경로: {routes}. 보관된 순찰 토큰: {patrols}. 이전 매크로와 !tc 명령은 여전히 작동합니다.',
      removedGuide:
        '플레이어가 볼 수 있었던 기존 "TokenController 사용 가이드" 유인물은 GM 전용 도움말 유인물로 대체되었습니다.',
      pruned: '토큰이 더 이상 존재하지 않기 때문에 잊어버린 순찰: {count}.',
      readyHint: '메뉴에 !tokencontroller를 입력하거나 Command Deck 유인물을 엽니다.',
      combatStarted: {
        pause: '전투가 시작되었습니다. 전투가 끝날 때까지 순찰이 일시 중지됩니다.',
        step: '전투가 시작되었습니다. 순찰대는 매 턴마다 한 걸음씩 이동합니다.',
      },
      combatEnded: '전투는 끝났습니다. 순찰은 계속됩니다.',
      routeAdded: '경로 "{name}"이({mode}) 추가되었습니다.',
      routeUpdated:
        "'{name}' 경로가 업데이트되었습니다. 거기에 있는 토큰은 새로운 경로로 계속됩니다.",
      confirmRemove: "'{name}' 경로를 삭제하시겠습니까? 중지될 토큰: {count}.",
      routeRemoved: "'{name}' 경로가 삭제되었습니다. 중지된 토큰: {count}.",
      routeRenamed: '경로 "{from}"이(가) "{to}"로 이름이 변경되었습니다.',
      examplesAdded: '추가된 경로 예시: {count}.',
      exportHint: '아래 텍스트를 복사하여 게임에서 {command} 뒤에 붙여넣으세요.',
      imported:
        '{added} 경로를 가져왔습니다. {skipped}(이미 사용된 이름이거나 유효하지 않은 이름)을 건너뛰었습니다.',
      started: '{tokens}이(가) "{name}"에서 시작되었습니다.',
      stopped: '중지된 토큰: {count}.',
      reset: '토큰이 시작된 위치({count})로 반환되었습니다.',
      locked: '잠김: {tokens}({mode}).',
      unlocked: '잠금 해제됨: {tokens}.',
      leaderSet: '{token}이 리더입니다. 팔로어를 선택하고 팔로우를 클릭하세요.',
      following: '이제 {leader}({mode}) 팔로우: {tokens}.',
      unfollowed: '더 이상 따르지 않는 토큰: {count}.',
      noRecordings: '아무것도 녹음되고 있지 않습니다.',
      recordingCancelled: "'{name}' 녹화가 취소되었습니다.",
      languages: '지원되는 언어: {list}',
      settingChanged: '{setting}은(는) 이제 {value}입니다.',
      combatOn: '전투가 켜졌습니다.',
      combatOff: '전투가 꺼졌습니다.',
      calibrationCleared: '이 페이지에서 그리드 보정이 제거되었습니다.',
      calibrated: '이 페이지에 대해 보정된 그리드입니다(셀 크기 × {scale}).',
      paused: '모든 순찰이 일시 중지되었습니다.',
      resumed: '순찰이 재개되었습니다.',
      journalRebuilt: '유인물 재구성: {help} 및 {deck}.',
      markerStopped: '정지 표시에 의해 정지됨: {tokens}.',
      markerReset: '정지 표시({tokens})를 통해 시작한 위치로 다시 보냈습니다.',
    },
    errors: {
      noTokens: '선택된 토큰이 없습니다.',
      noRouteName: '경로 이름이 지정되지 않았습니다.',
      routeNotFound: "'{name}'이라는 경로가 없습니다.",
      routeExists: "'{name}'이라는 경로가 이미 있습니다.",
      code: {
        empty: '단계 코드가 비어 있습니다.',
        badToken: '단계 코드 "{code}"에는 "{at}"에서 이해할 수 없는 내용이 있습니다.',
        tooFar: '"{at}" 단계가 너무 깁니다.',
      },
      routeInvalid: '경로를 저장할 수 없습니다.',
      usageAdd: '이름과 단계 코드를 입력하세요.',
      usageEdit: '경로와 새 단계 코드를 제공합니다.',
      selectOneDrawing:
        '정확히 하나의 그림(선, 다각형, 자유형 모양, 직사각형 또는 타원)을 선택합니다.',
      drawingEmpty: '선택한 도면에 따라야 할 점이 너무 적습니다.',
      usageRoute: '경로, 옵션 및 값을 제공하십시오.',
      unknownRouteOption: '"{option}"이라는 경로 옵션이 없습니다.',
      selectOneToken: '정확히 하나의 토큰을 선택하세요.',
      badRouteValue: '"{value}"은(는) {option}에 유효한 값이 아닙니다.',
      usageRename: '경로와 새 이름을 지정합니다.',
      usageCopy: '복사본의 경로와 이름을 지정합니다.',
      badJson: '경로 내보내기 텍스트가 아닙니다.',
      tokenLocked: '{tokens}을(를) 시작할 수 없습니다: 잠겨 있습니다.',
      tokenMarked: '{tokens}을(를) 시작할 수 없습니다. 중지 마커가 있습니다.',
      outsideArea: '{tokens}을(를) 시작할 수 없습니다. "{name}" 외부에 있습니다.',
      selectOneArea:
        '정확히 하나의 닫힌 그림(다각형, 직사각형, 타원 또는 자유형 루프)을 선택합니다.',
      areaTooSmall: '선택한 도면에 영역을 만들려면 모서리가 세 개 이상 필요합니다.',
      idsNotFound: '다음 ID를 가진 토큰이 없습니다: {ids}.',
      routeOnOtherPage:
        '{tokens}을(를) 시작할 수 없습니다. "{name}"이(가) 다른 페이지에 그려졌습니다.',
      startOnOtherPage:
        '{tokens}을(를) 시작할 수 없습니다. "{name}"의 고정 시작이 다른 페이지에 있습니다.',
      routeFull: '{tokens}을(를) 시작할 수 없습니다. "{name}"에 이미 {max} 토큰이 있습니다.',
      noPage: '페이지를 찾을 수 없습니다.',
      emptyTrack: '{tokens}을(를) 시작할 수 없습니다. "{name}"에는 이동이 없습니다.',
      leaderNotFound: '이 페이지에서는 "{name}"이라는 토큰을 찾을 수 없습니다.',
      noLeader: '아직 리더가 없습니다.',
      followLoop: '{tokens}은(는) 자신을 따르는 토큰을 따를 수 없습니다.',
      alreadyRecording: '{token}은(는) 이미 녹화 중입니다.',
      recordingTokenGone: '"{name}" 녹화용 토큰이 더 이상 존재하지 않습니다.',
      recordingEmpty: '아직 아무것도 녹음되지 않았습니다.',
      unknownSetting: '"{key}"이라는 설정이 없습니다.',
      badSettingValue: '"{value}"은(는) {key}에 유효한 값이 아닙니다.',
      calibrateNeedsTokens: '셀 중앙에 스냅된 하나 또는 두 개의 토큰을 선택합니다.',
      calibrateFailed: '선택한 토큰을 그리드 보정에 사용할 수 없습니다.',
      unknownCommand: '알 수 없는 명령 "{command}".',
      gmOnly: 'GM만이 TokenController를 사용할 수 있습니다.',
      internal: '문제가 발생했습니다. 자세한 내용은 API 콘솔에 있습니다.',
    },
    hints: {
      noTokens: '먼저 지도에서 토큰을 선택하세요.',
      noRouteName: '예: !tokencontroller add Guard Walk U2R2D2L2',
      routeNotFound: '모든 경로를 보려면 !tokencontroller list를 입력하세요.',
      code: {
        empty: '예: U2R2D2L2',
        badToken:
          '셀 수가 많은 U, D, L, R, UL, UR, DL 또는 DR을 사용하고 대기하려면 W, 스텔스에는 S를 사용하세요.',
        tooFar: '단일 단계는 최대 100개의 셀일 수 있습니다. 최대 100틱을 기다립니다.',
      },
      selectOneDrawing:
        '그리기 도구를 사용하여 경로를 그리고 선택한 다음(클릭하여 놓친 경우 얇은 윤곽선 주위에 상자를 드래그) 다시 시도하십시오.',
      usageRoute: '옵션: 모드, 간격, 최대, 무작위, 벽, 시작.',
      routeOnOtherPage: '그려진 경로는 그려진 페이지에서만 작동합니다.',
      startOnOtherPage: '고정 시작을 지우거나 먼저 토큰을 해당 페이지로 이동하세요.',
      noLeader:
        '리더를 선택하고 리더를 클릭하거나 이름을 지정하십시오: !tokencontroller follow Name',
      leaderNotFound: '지도에 표시된 토큰 이름이나 해당 토큰 ID를 정확하게 사용하세요.',
      badJson: '!tokencontroller 내보내기(또는 v4 내보내기 경로)의 텍스트를 정확하게 붙여넣습니다.',
      unknownSetting: '모든 설정을 보려면 !tokencontroller set를 입력하세요.',
      calibrateNeedsTokens:
        '하나의 토큰이 그리드를 정렬합니다. 행의 인접한 셀에 있는 두 개의 토큰도 셀 크기를 고정합니다.',
      calibrateFailed: '토큰이 동일한 행(16진수(H) 페이지의 열)의 인접 셀에 있는지 확인하십시오.',
      unknownCommand: '명령 목록을 보려면 !tokencontroller help를 입력하세요.',
      tokenLocked: '먼저 토큰을 잠금 해제하세요.',
      tokenMarked: '마커를 제거하거나 정지 마커 설정을 변경하십시오.',
      outsideArea: '먼저 해당 지역 내부로 토큰을 이동하거나 경로에 대해 무작위 시작을 켜십시오.',
      selectOneArea:
        '그리기 도구를 사용하여 영역을 그리고 선택한 다음(클릭하지 못한 경우 얇은 윤곽선 주위로 상자를 드래그) 다시 시도하십시오.',
      idsNotFound: '--ids 뒤에 세미콜론으로 구분하여 토큰 ID를 제공하세요.',
    },
    warnings: {
      idsNotFound: '다음 ID를 가진 토큰이 없으므로 건너뛰었습니다: {ids}.',
      offPage: '경로의 일부가 페이지를 벗어납니다(단계: {count}). 해당 단계는 건너뜁니다.',
      combatTrackerOnly:
        '전투 감지는 턴 추적기로 설정되어 있으므로 이 스위치는 변경할 때까지 아무런 효과가 없습니다.',
      unitPx:
        '버전 5는 각 페이지에서 셀 크기를 읽으므로 이전 단위당 픽셀 설정은 더 이상 사용되지 않습니다. 토큰이 정렬되지 않으면 !tokencontroller calibrate를 사용하세요.',
    },
    values: {
      on: '~에',
      off: '끄다',
      none: '없음',
      default: '기본',
      noLimit: '제한 없음',
      ms: '{ms} ms',
      andMore: '그 외 {count}개',
      following: '{leader} 팔로우',
      locked: '잠긴',
      gridless: '스냅 없음',
      grid: {
        square: '정사각형',
        hex: '마녀',
        iso: '아이소메트릭 / 디메트릭',
      },
      mode: {
        loop: '고리',
        pingpong: '이리저리',
        once: '한 번',
      },
      movement: {
        cell: '한 번에 하나의 셀',
        segment: '한 번에 전체 단계',
      },
      facing: {
        off: '돌리지 마세요',
        up: '예술이 위로 향한다',
        down: '예술품이 아래로 향함',
        left: '왼쪽 예술 얼굴',
        right: '예술은 오른쪽을 향하고 있다',
      },
      combatDetection: {
        tracker: '회전 추적기',
        manual: 'GM 스위치',
        both: '회전 추적기 또는 GM 스위치',
      },
      combatBehaviour: {
        pause: '정지시키다',
        step: '매 턴마다 이동',
        ignore: '계속 움직여',
      },
      lockMode: {
        native: 'Roll20의 위치 잠금',
        revert: '이동 취소',
        freeze: '가만히만 있어라',
      },
      followMode: {
        trail: '단일 파일',
        formation: '형성',
      },
      manualMove: {
        continue: '거기서부터 계속해',
        stop: '순찰을 중지하세요',
      },
      markerAction: {
        stop: '그 자리에 멈춰',
        reset: '처음으로 돌아가기',
      },
      wallMode: {
        ignore: '벽을 통과해 걷기',
        hold: '벽에서 기다리세요',
        turn: '벽에서 돌아서세요',
      },
      wallCheck: {
        centre: '토큰의 중심',
        width: '전체 토큰',
      },
      oneWayWalls: {
        block: '차단하다',
        pass: '통과시키다',
      },
      transparentWalls: {
        block: '차단하다',
        pass: '통과시키다',
      },
    },
    menu: {
      statusRunning: '순찰 토큰: {patrols}. 경로: {routes}.',
      statusPaused: '모든 순찰이 일시 중지됩니다.',
      statusCombat: {
        pause: '전투 중: 순찰이 일시 중지됩니다.',
        step: '전투 중: 순찰대는 매 턴마다 이동합니다.',
      },
      routes: '노선',
      noRoutes:
        '아직 경로가 없습니다. 하나를 추가하고, 하나를 그리고, 하나를 기록하거나 예시를 추가하세요.',
      create: '새로운 경로',
      selected: '선택된 토큰',
      tools: '도구',
      recordings: '녹음',
      patrols: '순찰',
    },
    buttons: {
      start: '시작',
      stop: '멈추다',
      add: '단계 코드',
      draw: '도면에서',
      bounce: '바운스 영역',
      record: '기록',
      examples: '예',
      reset: '다시 놓기',
      lock: '잠그다',
      unlock: '터놓다',
      leader: '지도자',
      follow: '따르다',
      unfollow: '언팔로우',
      resume: '재개하다',
      pause: '모두 일시중지',
      combatOn: '전투 시작',
      combatOff: '전투 꺼짐',
      stopAll: '모두 중지',
      settings: '설정',
      status: '상태',
      help: '돕다',
      open: '열려 있는',
      clearStart: '분명한',
      setStart: '선택됨으로 설정',
      edit: '코드 편집',
      rename: '이름 바꾸기',
      copy: '복사',
      export: '내보내다',
      remove: '제거하다',
      menu: '메뉴',
      wait: '기다리다',
      stealth: '몰래 하기',
      undo: '끄르다',
      save: '구하다',
      cancel: '취소',
      confirm: '예, 삭제하세요',
      startRoute: '경로 시작',
      list: '경로 나열',
      calibrate: '교정',
    },
    prompts: {
      name: '노선명',
      code: '단계 코드',
      interval: '단계당 밀리초(0 = 기본값)',
      maxTokens: '한 번에 대부분의 토큰(0 = 제한 없음)',
      newName: '새 이름',
      route: '노선명',
    },
    route: {
      drawn: '그려진 경로, {points} 포인트',
      recorded: '기록된 경로, {points} 포인트',
      area: '바운스 영역, {points} 코너',
      path: '길',
      mode: '방법',
      interval: '간격',
      maxTokens: '대부분의 토큰',
      randomStart: '무작위 시작',
      walls: '벽',
      start: '고정 시작',
      tokens: '토큰',
    },
    record: {
      title: '"{name}" 녹화 중',
      intro:
        '{token}(지금까지 이동한 횟수: {count})을 기록 중입니다. 화살표를 클릭하거나 지도에서 토큰을 드래그하세요. 모든 움직임이 기록됩니다.',
    },
    settings: {
      interval: {
        label: '간격',
        desc: '단계 사이의 밀리초입니다. 각 경로는 이를 재정의할 수 있습니다.',
      },
      movement: {
        label: '움직임',
        desc: '셀은 한 단계에 한 셀씩 이동합니다. 세그먼트는 버전 4처럼 한 번에 전체 단계(예: U3)를 이동합니다.',
      },
      facing: {
        label: '토큰 돌리기',
        desc: '토큰을 토큰이 향하는 방향(꺼짐 또는 토큰 아트가 향하는 방향(위, 아래, 왼쪽 또는 오른쪽))으로 돌립니다.',
      },
      combatDetection: {
        label: '전투 감지',
        desc: '전투를 인지하는 방법: 추적기(턴 추적기가 안에 누군가와 함께 열려 있음), 수동(전투 켜기/끄기 버튼) 또는 둘 다.',
      },
      combatBehaviour: {
        label: '전투 행동',
        desc: '순찰대가 전투에서 하는 일: 일시 정지, 발걸음(턴이 지날 때마다 한 번씩 이동) 또는 무시(계속 이동).',
      },
      lockMode: {
        label: '잠금 모드',
        desc: 'Lock이 토큰을 보유하는 방법: 기본(Roll20의 자체 위치 잠금이므로 누구도 끌 수 없음), 되돌리기(이동이 취소됨) 또는 동결(순찰 및 추적을 중지하지만 여전히 끌 수 있음).',
      },
      lockMarker: {
        label: '잠금 마커',
        desc: '잠긴 토큰에 상태 표시가 표시되거나 표시되지 않습니다. 플레이어는 마커를 볼 수 있습니다.',
      },
      followMode: {
        label: '팔로우 모드',
        desc: '트레일: 추종자들은 리더의 발자취를 따라 한 줄로 걷는다. 대형: 추종자들은 리더 주변에서 자신의 위치를 유지합니다(위치를 변경하려면 추종자를 드래그하세요).',
      },
      manualMove: {
        label: '순찰대 끌기',
        desc: '순찰 토큰을 끌 때: 계속(경로가 토큰을 놓은 곳부터 계속됨) 또는 중지(순찰 종료)됩니다.',
      },
      stopMarkers: {
        label: '정지 마커',
        desc: '토큰을 해당 경로에서 벗어나 추적을 중지하는 상태 표시는 세미콜론으로 구분되거나(예: dead;red) 또는 없음입니다. 이러한 마커 중 하나를 가진 리더의 추종자도 중지됩니다.',
      },
      markerAction: {
        label: '정지 마커 동작',
        desc: '순찰 토큰이 중지 마커를 받으면 수행하는 작업: 중지(현재 위치에 유지) 또는 재설정(시작한 위치로 돌아감).',
      },
      wallMode: {
        label: '벽',
        desc: '순찰대원과 추종자들이 역동적인 조명 벽과 닫힌 문과 창문에서 하는 일: 무시(통행), 보류(길이 깨끗해질 때까지 기다리기(예: 문이 열릴 때까지)) 또는 회전(순찰대가 돌아올 때까지). 각 경로는 자체적으로 선택할 수 있으므로 유령은 여전히 벽을 통과할 수 있습니다.',
      },
      wallCheck: {
        label: '월 체크',
        desc: '중앙: 토큰의 중앙만 벽에서 떨어져 있어야 합니다. 너비: 전체 토큰이 그러하므로 큰 토큰은 좁은 간격을 통과할 수 없습니다.',
      },
      oneWayWalls: {
        label: '단방향 벽',
        desc: '단방향 벽이 토큰을 중지하는지(차단) 또는 중지하지 않는지(통과) 여부입니다.',
      },
      transparentWalls: {
        label: '투명 벽',
        desc: '빛을 통과시키는 투명한 벽이 토큰을 중지(차단)하는지 여부(통과).',
      },
      buttonStep: {
        label: '클릭당 셀 수',
        desc: '기록 화살표가 토큰을 이동하는 거리입니다.',
      },
      language: {
        label: '언어',
        desc: '메뉴, 메시지, 유인물에 대한 언어입니다.',
      },
    },
    status: {
      routes: '노선',
      patrols: '순찰 토큰',
      followers: '팔로우 토큰',
      locked: '잠긴 토큰',
      recordings: '녹음',
      paused: '일시중지됨',
      combat: '전투',
      page: '현재 페이지',
      grid: '그리드',
      cell: '셀 크기',
      calibration: '구경 측정',
    },
    help: {
      menu: '메뉴를 보여주세요.',
      start: '선택한 토큰을 경로에 넣습니다.',
      stop: '선택한 토큰(순찰 및 추적), 경로의 모든 토큰 또는 모두를 중지합니다.',
      reset: '토큰을 시작한 곳으로 되돌리고 중지합니다.',
      pause: '모든 순찰을 일시 중지하거나 재개합니다.',
      lock: '선택한 토큰을 제자리에 고정하거나 놓습니다.',
      leader: '선택한 토큰을 따라갈 리더로 선택하세요.',
      follow: '선택된 토큰이 리더 또는 이름으로 주어진 토큰을 따르도록 만듭니다.',
      unfollow: '선택한 토큰 다음을 중지합니다.',
      add: 'U2R2D2L2와 같은 단계 코드에서 경로를 만듭니다.',
      edit: '경로의 단계 코드를 변경합니다.',
      draw: '이 페이지에서 선택한 그림을 따르는 경로를 만듭니다.',
      bounce: '선택한 닫힌 도면 내부에서 토큰이 가장자리에서 튕겨져 돌아다니는 경로를 만듭니다.',
      record: '선택한 토큰을 버튼으로 이동하거나 드래그하여 경로를 기록하세요.',
      route: '경로 옵션 변경: 모드, 간격, 최대, 무작위, 벽 또는 시작.',
      show: '경로의 세부정보와 버튼을 표시합니다.',
      rename: '경로 이름을 바꿉니다.',
      copy: '새 이름으로 경로를 복사합니다.',
      remove: '경로를 제거합니다(먼저 묻습니다).',
      ids: '선택한 ID 대신 이러한 ID를 사용하여 토큰을 작동하면 ScriptCard와 같은 다른 Mod가 토큰을 제어할 수 있습니다. --ids 제거는 경로에서 토큰을 제거합니다. 결코 경로를 제거하지 않습니다.',
      list: '제어되는 경로 또는 토큰을 나열합니다.',
      examples: '예시 경로를 추가합니다.',
      export: '경로를 텍스트로 표시하여 다른 게임에 복사하세요.',
      import: '내보내기 텍스트에서 경로를 추가합니다.',
      combat: '전투를 직접 켜거나 끌 수 있습니다.',
      set: '설정을 변경하거나 모든 설정을 표시합니다.',
      calibrate: '셀 중심에 스냅된 토큰으로 그리드를 정렬하거나 교정을 제거합니다.',
      status: 'Mod가 무엇을 하고 있는지, 그리고 이 페이지가 어떻게 보이는지 보여주세요.',
      journal: '도움말 및 명령 데크 유인물을 재구성합니다.',
      help: '이 목록을 보여주세요.',
      footer:
        '전체 지침은 "{help}" 유인물에 있습니다. 버튼은 "{deck}"에 있습니다. {legacy}는 여전히 버전 4 명령으로 작동합니다.',
    },
    handout: {
      versionLabel: '버전',
      subtitle: 'Jumpgate 및 Legacy 게임에 대한 순찰, 추종자 및 잠금 장치',
      overview: {
        heading: '개요',
        body: 'TokenController가 토큰을 이동합니다. 경비원에게 순찰 경로를 제공하고, 카트가 운전자를 따르도록 하거나, 동상을 제자리에 잠급니다. 경로는 단계 코드로 입력하거나 지도의 그림에서 추적하거나 토큰을 이동하여 기록할 수 있습니다. 경로는 정사각형, 16진수, 등각투영, 이등각, 격자 없는 페이지에서 작동합니다.',
      },
      quickStart: {
        heading: '빠른 시작',
        steps: [
          'Command Deck 유인물을 열거나 메뉴에 !tokencontroller를 입력하세요.',
          '예제를 클릭하여 미리 만들어진 경로를 추가하거나 단계 코드를 클릭하여 직접 입력하세요(예: U2R2D2L2).',
          '하나 이상의 토큰을 선택하고 경로 옆에 있는 시작을 클릭합니다.',
          '토큰을 선택하고 중지를 클릭하여 중지하거나 재설정을 클릭하여 시작된 위치로 다시 보냅니다.',
        ],
      },
      routes: {
        heading: '경로 만들기',
        points: [
          '단계 코드: U2R2D2L2와 같은 이동을 입력합니다. 코드는 지도상의 한 장소에 묶여 있지 않으므로 동일한 경로가 어디에서나 작동됩니다.',
          '그리기에서: 그리기 도구를 사용하여 선, 다각형, 자유형 모양, 직사각형 또는 타원을 그리고 이를 선택한 다음 그리기에서를 클릭합니다. 토큰은 해당 페이지에서만 이동합니다. 나중에 그림을 삭제할 수 있습니다.',
          '기록: 토큰을 선택하고 기록을 클릭합니다. 화살표 버튼을 사용하여 이동하거나 지도에서 드래그한 다음(Roll20 웨이포인트를 따릅니다) 저장을 클릭합니다. 정사각형 그리드에서 녹음은 편집할 수 있는 단계 코드가 됩니다.',
          '순환 경로는 처음부터 다시 시작됩니다. 왕복 경로는 왔던 길을 되돌아갑니다. 경로가 끝에 멈추면. 루프가 시작되는 곳에서 끝나는 새로운 경로; 다른 사람들은 앞뒤로 이동합니다.',
          '바운스 영역: 영역 주위에 닫힌 모양을 그리고 이를 선택한 다음 바운스 영역을 클릭합니다. 그 위에서 시작된 토큰은 직선으로 이동하고 가장자리에서 튕겨 나가며(경로가 이를 무시하지 않는 한 벽에서) 매번 조금씩 무작위로 회전합니다. 무작위 시작은 각 토큰을 해당 지역의 무작위 셀에 넣습니다.',
        ],
      },
      codes: {
        colCode: '암호',
        colMeaning: '의미',
        move: '위, 아래, 왼쪽 또는 오른쪽으로 한 셀씩 이동합니다.',
        diagonal: '대각선으로 이동합니다.',
        distance: '방향 뒤의 숫자는 그만큼의 셀을 이동합니다.',
        face: '움직이지 않고 방향을 향하도록 회전합니다(회전 토큰 필요).',
        wait: '한 단계 또는 지정된 단계 수만큼 기다리십시오.',
        stealth: '토큰 레이어와 GM 레이어 사이에서 토큰을 이동하면 사라졌다가 다시 나타납니다.',
      },
      routeOptions: {
        heading: '경로 옵션',
        colOption: '옵션',
        colMeaning: '의미',
        mode: '루프, 탁구(앞뒤로) 또는 한 번.',
        interval: '이 경로의 경우 단계당 밀리초, 전역 간격의 경우 0입니다.',
        max: '한 번에 경로에 있을 수 있는 최대 토큰 수 또는 제한이 없는 경우 0입니다.',
        random: 'on: 각 토큰은 경로를 따라 임의의 지점에서 시작됩니다.',
        walls:
          '무시(벽을 통과하여 걷기), 보류(벽과 닫힌 문에서 대기), 회전(뒤로 돌아서) 또는 기본값(벽 설정 사용).',
        start:
          'set: 토큰은 시작 시 선택한 토큰의 위치로 점프합니다. 명확함: 그들은 자신이 서 있는 곳에서 시작합니다.',
      },
      tokens: {
        heading: '토큰 관리',
        points: [
          '토큰은 한 번에 하나의 경로에 있습니다. 다른 경로에서 시작하면 첫 번째 경로가 대체됩니다.',
          '중지하면 토큰이 있는 곳에 그대로 둡니다. 재설정은 시작하기 전의 원래 레이어로 되돌립니다.',
          '잠금은 토큰을 제자리에 유지합니다. 잠긴 토큰은 잠금이 해제될 때까지 순찰하거나 따라가지 않습니다.',
          '팔로우: 리더를 선택하고 리더를 클릭한 다음 팔로워를 선택하고 팔로우를 클릭합니다. 리더의 이름을 입력할 수도 있습니다: !tokencontroller Follow Goblin Boss. 팔로어는 순찰하는 토큰, 드래그한 토큰, TokenMod가 이동한 토큰을 따릅니다.',
          '팔로워는 다른 팔로워를 따라가며 체인이나 기둥을 만들 수 있습니다.',
          '순찰 토큰 끌기가 중지로 설정되어 있지 않은 한 순찰 토큰을 드래그하면 놓은 위치부터 순찰이 계속됩니다.',
          '벽: 벽 설정이 켜져 있으면 순찰대와 추종자는 역동적인 조명 벽이나 닫힌 문 및 창문을 통과하여 걷지 않습니다. 문과 창문을 열어서 통과시키세요. 경로에 자체 벽 옵션을 제공합니다(예: 유령 무시).',
          '정지 마커: 이러한 상태 마커 중 하나(예: 사망)를 얻은 토큰은 경로를 떠나 팔로우를 중지하고 리더의 추종자도 한 정지를 얻습니다. !tokencontroller set stopMarkers dead;red로 설정하세요. 이는 다른 Mod가 마커를 추가할 때도 작동합니다.',
        ],
      },
      grids: {
        heading: '그리드',
        points: [
          '셀 크기와 그리드 유형은 각 페이지에서 읽혀지므로 페이지마다 서로 다른 그리드를 사용할 수 있습니다.',
          'U와 D는 항상 화면 위아래를 의미합니다. 육각형 그리드에서는 일치하는 이웃이 없는 지그재그로 이동합니다. 아이소 메트릭 및 디메트릭 그리드에서 대각선은 하나의 다이아몬드와 교차합니다.',
          '맞추기가 꺼진 페이지는 격자에 정렬되지 않고 70픽셀 단위로 이동합니다.',
          '토큰이 그리드에서 벗어나면 토큰을 셀 중앙에 맞추고 선택한 후 보정을 클릭하세요. 행의 인접한 셀에서 두 개의 토큰을 선택하여 셀 크기도 고정합니다.',
        ],
      },
      combat: {
        heading: '전투',
        points: [
          '전투 감지는 전투를 감지하는 방법(턴 트래커, 전투 켜기/끄기 버튼 또는 둘 중 하나)을 선택합니다.',
          '전투 행동은 순찰이 수행할 작업을 선택합니다. 즉, 일시 중지, 턴이 지날 때마다 한 걸음 이동, 계속 이동 등을 선택합니다.',
          'Pause All은 언제든지 모든 순찰을 중지합니다. 재개하면 다시 시작됩니다.',
        ],
      },
      commands: {
        heading: '명령',
        intro:
          'GM만이 이 명령을 사용할 수 있습니다. 경로는 메뉴 버튼의 #id로 이름을 지정하거나 참조할 수 있습니다. 명령이 두 개의 이름을 사용하는 경우 이름을 공백과 함께 "따옴표"로 묶습니다.',
        mods: '다른 모드도 ScriptCard 등에서 이러한 명령을 보낼 수 있습니다. 토큰을 선택할 수 없으므로 --ids 뒤에 세미콜론으로 구분된 토큰 ID(!tc stop --ids ID1;ID2)를 사용하여 이름을 지정합니다. 답변은 GM에게 전달됩니다.',
        colCommand: '명령',
        colDesc: '기능',
      },
      settings: {
        heading: '설정',
        intro:
          '!tokencontroller set <setting> <value>를 사용하여 메뉴에서 설정을 변경하거나 API 스크립트 화면의 Mod 설정 페이지에서 설정을 변경하세요.',
        colKey: '열쇠',
        colName: '환경',
        colDesc: '설명',
      },
      upgrading: {
        heading: '버전 4에서 업그레이드',
        points: [
          '경로, 순찰 토큰, 자물쇠, 추종자 및 미완성 초안이 유지됩니다. 초안은 "(초안)"으로 끝나는 경로가 됩니다.',
          '버전 4 설정은 간격, 하위 단계, 회전, 전투 순찰 및 클릭당 단위로 유지됩니다.',
          '!tc 및 !token-control 명령과 T-Cntrl_ 매크로는 계속 작동합니다. 표에는 새로운 명령이 나와 있습니다.',
          '버전 4는 모든 작업 후에 전체 메뉴를 보냈습니다. 버전 5에서는 대신 짧은 응답을 보냅니다.',
          '단위당 픽셀 설정이 사라졌습니다. 셀 크기는 각 페이지에서 가져옵니다. HTML 빌더는 더 이상 필요하지 않습니다.',
          '모든 플레이어가 볼 수 있었던 기존 사용 가이드 유인물이 GM 전용 유인물로 대체되었습니다.',
        ],
        colV4: '버전 4',
        colV5: '버전 5',
      },
      troubleshooting: {
        heading: '문제 해결',
        points: [
          '토큰이 이동하지 않습니다. 상태를 확인하세요. 순찰은 일시 정지된 동안, 잠겨 있는 동안, 그리고 전투 행동이 일시 정지된 전투 중일 때 기다립니다.',
          '토큰이 잘못된 거리로 이동합니다. 페이지의 격자 크기나 스냅이 변경되었을 수 있습니다. 교정을 시도해보세요.',
          '그려진 경로는 시작되지 않습니다. 그려진 경로는 그려진 페이지에서만 작동합니다.',
          '다른 Mod가 리더를 움직일 때 추종자는 움직이지 않습니다. TokenMod만이 움직임을 보고합니다. 다른 Mod는 TokenController.ObserveTokenChange를 호출할 수 있습니다.',
          'API 콘솔의 메시지가 있으면 Roll20 포럼에 문제를 보고하세요.',
        ],
      },
      languages: {
        heading: '언어',
        body: 'TokenController는 아래 언어로 번역됩니다. 언어 설정이 있는 것을 선택하세요.',
        colCode: '암호',
        colName: '언어',
        colNative: '본명',
      },
      credits: {
        heading: '크레딧',
        original: '원본 모드 작성자:',
        maintainer: '버전 5는 다음에 의해 유지 관리됩니다.',
        support: 'Roll20 Mod 포럼이나 GitHub에 버그와 아이디어를 보고하세요.',
      },
      footer: '모든 작업에 대한 버튼은 "{deck}" 유인물에 있습니다.',
    },
    deck: {
      subtitle: '커맨드 덱',
      patrolsDesc: '순찰을 시작, 중지 및 일시 중지합니다. 먼저 토큰을 선택하세요.',
      createDesc: '단계 코드, 그림 또는 토큰 기록을 통해 경로를 만듭니다.',
      selectedDesc: '토큰을 잠그거나 리더를 따르도록 만드세요.',
      toolsDesc: '전투, 설정 및 그리드 도구.',
      footer: '전체 지침은 "{help}" 유인물에 나와 있습니다.',
    },
  };

  const TRANSLATION$7 = {
    titles: {
      ready: 'TokenController jest gotowy.',
      settings: 'Ustawienia TokenController',
      help: 'Polecenia TokenController',
      export: 'Eksport tras',
      routes: 'Trasy',
      tokens: 'Tokeny kontrolowane',
      status: 'Stan kontrolera tokenu',
    },
    messages: {
      migrated:
        'Zaktualizowano z wersji 4. Zachowane trasy: {routes}. Zachowane tokeny patrolowania: {patrols}. Twoje stare makra i polecenia !tc nadal działają.',
      removedGuide:
        'Stara ulotka „Przewodnik użytkowania TokenController”, którą gracze mogli zobaczyć, została zastąpiona ulotką Pomocy dostępną tylko dla GM.',
      pruned: 'Patrole zapomniane, ponieważ ich tokeny już nie istnieją: {count}.',
      readyHint: 'Wpisz !tokencontroller w menu lub otwórz ulotkę dotyczącą talii poleceń.',
      combatStarted: {
        pause: 'Walka się rozpoczęła: patrole są wstrzymane do czasu jej zakończenia.',
        step: 'Walka się rozpoczęła: patrole poruszają się o jeden krok w każdej turze.',
      },
      combatEnded: 'Walka się skończyła, patrole kontynuują działania.',
      routeAdded: 'Dodano trasę „{name}” ({mode}).',
      routeUpdated:
        'Trasa „{name}” została zaktualizowana. Znajdujące się na nim żetony kontynuują nową trasę.',
      confirmRemove:
        'Usunąć trasę „{name}”? Znajdujące się na nim żetony, które się zatrzymają: {count}.',
      routeRemoved: 'Trasa „{name}” została usunięta. Tokeny zatrzymane: {count}.',
      routeRenamed: 'Zmieniono nazwę trasy „{from}” na „{to}”.',
      examplesAdded: 'Dodano przykładowe trasy: {count}.',
      exportHint: 'Skopiuj poniższy tekst i wklej go po {command} w dowolnej grze.',
      imported:
        'Zaimportowane trasy {added}; pominięto {skipped} (nazwa już używana lub nieprawidłowa).',
      started: '{tokens} rozpoczęło się w dniu „{name}”.',
      stopped: 'Tokeny zatrzymane: {count}.',
      reset: 'Tokeny wróciły do miejsca, w którym zaczęły: {count}.',
      locked: 'Zablokowano: {tokens} ({mode}).',
      unlocked: 'Odblokowano: {tokens}.',
      leaderSet: '{token} jest liderem. Wybierz obserwujących i kliknij Obserwuj.',
      following: 'Teraz obserwujesz {leader} ({mode}): {tokens}.',
      unfollowed: 'Tokeny nie są już obserwowane: {count}.',
      noRecordings: 'Nic nie jest nagrywane.',
      recordingCancelled: 'Nagrywanie „{name}” zostało anulowane.',
      languages: 'Obsługiwane języki: {list}',
      settingChanged: '{setting} jest teraz {value}.',
      combatOn: 'Walka włączona.',
      combatOff: 'Walka wyłączona.',
      calibrationCleared: 'Kalibracja siatki została usunięta z tej strony.',
      calibrated: 'Siatka skalibrowana dla tej strony (rozmiar komórki × {scale}).',
      paused: 'Wszystkie patrole zatrzymały się.',
      resumed: 'Patrole zostały wznowione.',
      journalRebuilt: 'Przebudowano materiały informacyjne: {help} i {deck}.',
      markerStopped: 'Zatrzymany przez znacznik zatrzymania: {tokens}.',
      markerReset:
        'Odesłany z powrotem do miejsca rozpoczęcia przez znacznik zatrzymania: {tokens}.',
    },
    errors: {
      noTokens: 'Nie wybrano tokenów.',
      noRouteName: 'Nie podano nazwy trasy.',
      routeNotFound: 'Nie ma trasy o nazwie „{name}”.',
      routeExists: 'Istnieje już trasa o nazwie „{name}”.',
      code: {
        empty: 'Kod kroku jest pusty.',
        badToken: 'Kod kroku „{code}” zawiera coś, czego nie rozumie w „{at}”.',
        tooFar: 'Krok „{at}” jest za długi.',
      },
      routeInvalid: 'Nie udało się zapisać tej trasy.',
      usageAdd: 'Podaj nazwę i kod kroku.',
      usageEdit: 'Podaj trasę i nowy kod kroku.',
      selectOneDrawing:
        'Wybierz dokładnie jeden rysunek (linię, wielokąt, kształt odręczny, prostokąt lub elipsę).',
      drawingEmpty: 'Wybrany rysunek ma zbyt mało punktów do naśladowania.',
      usageRoute: 'Podaj trasę, opcję i wartość.',
      unknownRouteOption: 'Nie ma opcji trasy o nazwie „{option}”.',
      selectOneToken: 'Wybierz dokładnie jeden token.',
      badRouteValue: '„{value}” nie jest prawidłową wartością dla {option}.',
      usageRename: 'Podaj trasę i jej nową nazwę.',
      usageCopy: 'Podaj trasę i nazwę kopii.',
      badJson: 'To nie jest tekst eksportu trasy.',
      tokenLocked: '{tokens} nie można uruchomić: zablokowane.',
      tokenMarked: '{tokens} nie mogą rozpocząć się: mają znacznik zatrzymania.',
      outsideArea: '{tokens} nie może rozpocząć się: znajdują się poza „{name}”.',
      selectOneArea:
        'Wybierz dokładnie jeden zamknięty rysunek (wielokąt, prostokąt, elipsa lub odręczna pętla).',
      areaTooSmall:
        'Wybrany rysunek potrzebuje co najmniej trzech narożników, aby utworzyć obszar.',
      idsNotFound: 'Żadne tokeny nie mają tych identyfikatorów: {ids}.',
      routeOnOtherPage:
        '{tokens} nie może się rozpocząć: „{name}” został narysowany na innej stronie.',
      startOnOtherPage:
        '{tokens} nie może się rozpocząć: ustalony początek „{name}” znajduje się na innej stronie.',
      routeFull: '{tokens} nie może rozpocząć się: „{name}” ma już tokeny {max}.',
      noPage: 'Nie można znaleźć strony.',
      emptyTrack: '{tokens} nie może rozpocząć: „{name}” nie ma żadnych ruchów.',
      leaderNotFound: 'Na tej stronie nie znaleziono tokena o nazwie „{name}”.',
      noLeader: 'Nie ma jeszcze lidera.',
      followLoop: '{tokens} nie może podążać za tokenem, który za nimi podąża.',
      alreadyRecording: '{token} jest już nagrywany.',
      recordingTokenGone: 'Token do nagrywania „{name}” już nie istnieje.',
      recordingEmpty: 'Nic nie zostało jeszcze nagrane.',
      unknownSetting: 'Nie ma ustawienia o nazwie „{key}”.',
      badSettingValue: '„{value}” nie jest prawidłową wartością dla {key}.',
      calibrateNeedsTokens: 'Wybierz jeden lub dwa żetony przyciągnięte do środków komórek.',
      calibrateFailed: 'Wybranych tokenów nie można było użyć do kalibracji sieci.',
      unknownCommand: 'Nieznane polecenie „{command}”.',
      gmOnly: 'Tylko GM może używać TokenController.',
      internal: 'Coś poszło nie tak. Szczegóły znajdują się w konsoli API.',
    },
    hints: {
      noTokens: 'Najpierw wybierz żetony na mapie.',
      noRouteName: 'Na przykład: !tokencontroller dodaj Guard Walk U2R2D2L2',
      routeNotFound: 'Wpisz !tokencontroller list, aby wyświetlić wszystkie trasy.',
      code: {
        empty: 'Na przykład: U2R2D2L2',
        badToken:
          'Użyj U, D, L, R, UL, UR, DL lub DR z liczbą komórek, W, aby czekać i S, aby ukryć się.',
        tooFar:
          'Pojedynczy krok może obejmować maksymalnie 100 komórek; czeka maksymalnie 100 tików.',
      },
      selectOneDrawing:
        'Narysuj trasę za pomocą narzędzia do rysowania, zaznacz ją (przeciągnij ramkę wokół cienkiego konturu, jeśli kliknięcie go nie zauważy), a następnie spróbuj ponownie.',
      usageRoute: 'Opcje: tryb, interwał, max, losowy, ściany, start.',
      routeOnOtherPage: 'Narysowane trasy działają tylko na stronie, na której zostały narysowane.',
      startOnOtherPage: 'Wyczyść stały początek lub najpierw przesuń token na tę stronę.',
      noLeader:
        'Wybierz lidera i kliknij Lidera lub podaj jego nazwę: !tokencontroller follow Name',
      leaderNotFound:
        'Użyj nazwy tokena dokładnie tak, jak pokazano na mapie lub jego identyfikatora tokena.',
      badJson: 'Wklej dokładnie tekst z eksportu !tokencontroller (lub ścieżek eksportu v4).',
      unknownSetting: 'Wpisz !tokencontroller set, aby zobaczyć wszystkie ustawienia.',
      calibrateNeedsTokens:
        'Jeden żeton ustawia się na planszy; dwa żetony w sąsiednich komórkach wiersza również ustalają rozmiar komórki.',
      calibrateFailed:
        'Upewnij się, że tokeny znajdują się w sąsiednich komórkach tego samego wiersza (kolumna na stronach szesnastkowych (H)).',
      unknownCommand: 'Wpisz !tokencontroller help, aby wyświetlić listę poleceń.',
      tokenLocked: 'Najpierw odblokuj token.',
      tokenMarked: 'Usuń znacznik lub zmień ustawienie znaczników zatrzymania.',
      outsideArea: 'Najpierw przesuń żetony do obszaru lub włącz opcję Losowy start dla trasy.',
      selectOneArea:
        'Narysuj obszar za pomocą narzędzia do rysowania, zaznacz go (przeciągnij ramkę wokół cienkiego konturu, jeśli kliknięcie go nie zauważy), a następnie spróbuj ponownie.',
      idsNotFound: 'Podaj identyfikatory tokenów po --ids, oddzielone średnikami.',
    },
    warnings: {
      idsNotFound: 'Żadne tokeny nie mają tych identyfikatorów, więc zostały pominięte: {ids}.',
      offPage: 'Część trasy wychodzi poza stronę (kroki: {count}). Te kroki są pomijane.',
      combatTrackerOnly:
        'Wykrywanie walki jest ustawione na śledzenie tur, więc ten przełącznik nie działa, dopóki go nie zmienisz.',
      unitPx:
        'Wersja 5 odczytuje rozmiar komórki z każdej strony, więc stare ustawienie liczby pikseli na jednostkę nie jest już używane. Jeśli tokeny nie są zgodne, użyj kalibracji !tokencontroller.',
    },
    values: {
      on: 'NA',
      off: 'Wyłączony',
      none: 'Nic',
      default: 'Domyślny',
      noLimit: 'Bez limitu',
      ms: '{ms} ms',
      andMore: 'i {count} więcej',
      following: 'obserwuj {leader}',
      locked: 'zamknięty',
      gridless: 'żadnego przyciągania',
      grid: {
        square: 'Kwadrat',
        hex: 'Klątwa',
        iso: 'Izometryczny / dimetryczny',
      },
      mode: {
        loop: 'Pętla',
        pingpong: 'Tam i z powrotem',
        once: 'Raz',
      },
      movement: {
        cell: 'Jedna komórka na raz',
        segment: 'Cały krok na raz',
      },
      facing: {
        off: 'Nie skręcaj',
        up: 'Sztuka stawia czoła',
        down: 'Sztuka twarzą w dół',
        left: 'Pozostały artystyczne twarze',
        right: 'Sztuka skierowana jest w prawo',
      },
      combatDetection: {
        tracker: 'Włącz tracker',
        manual: 'Przełącznik GM',
        both: 'Włącz tracker lub przełącznik GM',
      },
      combatBehaviour: {
        pause: 'Pauza',
        step: 'Poruszaj się w każdej turze',
        ignore: 'Ruszaj się dalej',
      },
      lockMode: {
        native: 'Blokada pozycji Roll20',
        revert: 'Cofaj ruchy',
        freeze: 'Tylko trzymaj się nieruchomo',
      },
      followMode: {
        trail: 'Pojedynczy plik',
        formation: 'Tworzenie',
      },
      manualMove: {
        continue: 'Stamtąd kontynuuj',
        stop: 'Zatrzymaj patrol',
      },
      markerAction: {
        stop: 'Zatrzymaj się tam, gdzie to jest',
        reset: 'Wróć do początku',
      },
      wallMode: {
        ignore: 'Przejdź przez ściany',
        hold: 'Poczekaj pod ścianami',
        turn: 'Odwróć się do ścian',
      },
      wallCheck: {
        centre: 'Środek tokena',
        width: 'Cały token',
      },
      oneWayWalls: {
        block: 'Blok',
        pass: 'Przepuszczać',
      },
      transparentWalls: {
        block: 'Blok',
        pass: 'Przepuszczać',
      },
    },
    menu: {
      statusRunning: 'Żetony patrolowania: {patrols}. Trasy: {routes}.',
      statusPaused: 'Wszystkie patrole są wstrzymane.',
      statusCombat: {
        pause: 'Podczas walki: patrole są wstrzymane.',
        step: 'Podczas walki: patrole poruszają się w każdej turze.',
      },
      routes: 'Trasy',
      noRoutes: 'Nie ma jeszcze tras. Dodaj jeden, narysuj, nagraj jeden lub dodaj przykłady.',
      create: 'Nowa trasa',
      selected: 'Wybrane tokeny',
      tools: 'Narzędzia',
      recordings: 'Nagrania',
      patrols: 'Patrole',
    },
    buttons: {
      start: 'Start',
      stop: 'Zatrzymywać się',
      add: 'Kod kroku',
      draw: 'Z rysunku',
      bounce: 'Obszar odbicia',
      record: 'Nagrywać',
      examples: 'Przykłady',
      reset: 'Nastawić',
      lock: 'Zamek',
      unlock: 'Odblokować',
      leader: 'Lider',
      follow: 'Podążać',
      unfollow: 'Przestań obserwować',
      resume: 'Wznawiać',
      pause: 'Wstrzymaj wszystko',
      combatOn: 'Walka włączona',
      combatOff: 'Walka wyłączona',
      stopAll: 'Zatrzymaj wszystko',
      settings: 'Ustawienia',
      status: 'Status',
      help: 'Pomoc',
      open: 'Otwarte',
      clearStart: 'Jasne',
      setStart: 'Ustaw na Wybrane',
      edit: 'Edytuj kod',
      rename: 'Przemianować',
      copy: 'Kopia',
      export: 'Eksport',
      remove: 'Usunąć',
      menu: 'Menu',
      wait: 'Czekać',
      stealth: 'Podstęp',
      undo: 'Anulować',
      save: 'Ratować',
      cancel: 'Anulować',
      confirm: 'Tak, usuń to',
      startRoute: 'Rozpocznij trasę',
      list: 'Lista tras',
      calibrate: 'Kalibrować',
    },
    prompts: {
      name: 'Nazwa trasy',
      code: 'Kod kroku',
      interval: 'milisekundy na krok (0 = wartość domyślna)',
      maxTokens: 'Najwięcej tokenów na raz (0 = bez limitu)',
      newName: 'Nowa nazwa',
      route: 'Nazwa trasy',
    },
    route: {
      drawn: 'Wyznaczona trasa, {points} punktów',
      recorded: 'Zapisana trasa, {points} punktów',
      area: 'Obszar odbicia, {points} narożniki',
      path: 'Ścieżka',
      mode: 'Tryb',
      interval: 'Interwał',
      maxTokens: 'Większość tokenów',
      randomStart: 'Losowy początek',
      walls: 'Ściany',
      start: 'Naprawiono start',
      tokens: 'Żetony',
    },
    record: {
      title: 'Nagranie „{name}”',
      intro:
        'Nagranie {token} (przeszło do tej pory: {count}). Kliknij strzałki lub przeciągnij token na mapę; każdy ruch jest rejestrowany.',
    },
    settings: {
      interval: {
        label: 'Interwał',
        desc: 'Milisekundy między krokami. Każda trasa może to zastąpić.',
      },
      movement: {
        label: 'Ruch',
        desc: 'komórka przesuwa się o jedną komórkę na krok; segment przesuwa cały krok (np. U3) na raz, tak jak zrobiła to wersja 4.',
      },
      facing: {
        label: 'Obróć żetony',
        desc: 'Obróć żetony w stronę kierunku, w którym zmierzają: wyłączonego lub w stronę grafiki żetonu (w górę, w dół, w lewo lub w prawo).',
      },
      combatDetection: {
        label: 'Wykrywanie walki',
        desc: 'Jak zauważana jest walka: moduł śledzący (wyświetlacz tur jest otwarty, gdy ktoś w nim jest), ręczny (przyciski włączania/wyłączania walki) lub oba.',
      },
      combatBehaviour: {
        label: 'Zachowanie bojowe',
        desc: 'Co patrole robią podczas walki: pauza, krok (poruszaj się raz po każdej turze) lub ignorowanie (kontynuuj ruch).',
      },
      lockMode: {
        label: 'Tryb blokady',
        desc: 'Jak Lock przechowuje token: natywny (blokada pozycji Roll20, więc nikt nie może go przeciągnąć), przywrócenie (ruchy są cofane) lub zamrożenie (przestaje patrolować i podążać, ale nadal można go przeciągać).',
      },
      lockMarker: {
        label: 'Znacznik blokady',
        desc: 'Znacznik stanu widoczny na zablokowanych żetonach lub brak. Gracze mogą widzieć znaczniki.',
      },
      followMode: {
        label: 'Tryb śledzenia',
        desc: 'szlak: wyznawcy idą gęsiego śladami przywódcy. formacja: obserwujący utrzymują swoje miejsce wokół lidera (przeciągnij obserwującego, aby zmienić jego miejsce).',
      },
      manualMove: {
        label: 'Przeciąganie patrolu',
        desc: 'Gdy przeciągniesz żeton patrolowania: kontynuuj (trasa będzie kontynuowana od miejsca, w którym go upuściłeś) lub zatrzymaj (patrol zakończy się).',
      },
      stopMarkers: {
        label: 'Zatrzymaj znaczniki',
        desc: 'Znaczniki stanu, które usuwają żeton z trasy i zatrzymują go, oddzielając je średnikami (na przykład martwy; czerwony) lub żadnym. Podążający za liderem posiadającym jeden z tych znaczników również się zatrzymują.',
      },
      markerAction: {
        label: 'Zatrzymaj działanie znacznika',
        desc: 'Co robi żeton patrolujący, gdy otrzyma znacznik zatrzymania: zatrzymuje się (pozostaje tam, gdzie był) lub resetuje (wraca do miejsca, w którym zaczął).',
      },
      wallMode: {
        label: 'Ściany',
        desc: 'Co patrole i towarzysze robią przy dynamicznym oświetlaniu ścian oraz zamkniętych drzwi i okien: ignoruj (przejdź), przytrzymaj (poczekaj, aż droga będzie wolna, np. aż otworzą się drzwi) lub odwróć się (patrole zawracają). Każda trasa może wybrać własną, więc duchy nadal mogą przechodzić przez ściany.',
      },
      wallCheck: {
        label: 'Kontrola ściany',
        desc: 'środek: tylko środek żetonu musi znajdować się z dala od ścian. szerokość: robi to cały żeton, więc duży żeton nie może przecisnąć się przez wąską szczelinę.',
      },
      oneWayWalls: {
        label: 'Ściany jednokierunkowe',
        desc: 'Czy ściany jednokierunkowe zatrzymują żetony (blok), czy nie (pas).',
      },
      transparentWalls: {
        label: 'Przezroczyste ściany',
        desc: 'Niezależnie od tego, czy przezroczyste ściany, które przepuszczają światło, zatrzymują żetony (blok), czy nie (przechodzą).',
      },
      buttonStep: {
        label: 'Komórki na kliknięcie',
        desc: 'Jak daleko strzałki nagrywania przesuwają żeton.',
      },
      language: {
        label: 'Język',
        desc: 'Język menu, komunikatów i materiałów informacyjnych.',
      },
    },
    status: {
      routes: 'Trasy',
      patrols: 'Żetony patrolujące',
      followers: 'Następujące tokeny',
      locked: 'Zablokowane tokeny',
      recordings: 'Nagrania',
      paused: 'Wstrzymano',
      combat: 'Walka',
      page: 'Bieżąca strona',
      grid: 'Siatka',
      cell: 'Rozmiar komórki',
      calibration: 'Kalibrowanie',
    },
    help: {
      menu: 'Pokaż menu.',
      start: 'Umieść wybrane żetony na trasie.',
      stop: 'Zatrzymaj wybrane żetony (patrole i podążające za nimi), wszystkie żetony na trasie lub wszystkie.',
      reset: 'Wróć żetony do miejsca, w którym rozpoczęły się i zatrzymaj je.',
      pause: 'Wstrzymaj lub wznów każdy patrol.',
      lock: 'Przytrzymaj wybrane żetony w miejscu lub puść je.',
      leader: 'Wybierz wybrany żeton jako lidera, za którym będziesz podążał.',
      follow: 'Spraw, aby wybrane żetony podążały za liderem lub żetonem nadanym z imienia.',
      unfollow: 'Zatrzymaj śledzenie wybranych tokenów.',
      add: 'Utwórz trasę na podstawie kodu kroku, np. U2R2D2L2.',
      edit: 'Zmień kod etapu trasy.',
      draw: 'Utwórz trasę zgodnie z wybranym rysunkiem na tej stronie.',
      bounce:
        'Utwórz trasę, po której żetony wędrują wewnątrz wybranego zamkniętego rysunku, odbijając się od jego krawędzi.',
      record: 'Zapisz trasę przesuwając wybrany token przyciskami lub przeciągając go.',
      route: 'Zmień opcję trasy: tryb, interwał, maks., losowo, ściany lub start.',
      show: 'Pokaż szczegóły trasy i przyciski.',
      rename: 'Zmień nazwę trasy.',
      copy: 'Skopiuj trasę pod nową nazwą.',
      remove: 'Usuń trasę (najpierw pyta).',
      ids: 'Działaj na tokenach z tymi identyfikatorami, a nie na wybranych, aby inne Mody, takie jak Karty Skryptów, mogły kontrolować tokeny. usuń --ids usuwa tokeny ze swoich tras; nigdy nie usuwa trasy.',
      list: 'Wypisz trasy lub tokeny, które są kontrolowane.',
      examples: 'Dodaj przykładowe trasy.',
      export: 'Pokaż trasy jako tekst do skopiowania do innej gry.',
      import: 'Dodaj trasy z tekstu eksportu.',
      combat: 'Włącz lub wyłącz walkę ręcznie.',
      set: 'Zmień ustawienie lub pokaż wszystkie ustawienia.',
      calibrate:
        'Wyrównaj siatkę z żetonami przyciągniętymi do środków komórek lub usuń kalibrację.',
      status: 'Pokaż co robi Mod i jak widzi tę stronę.',
      journal: 'Odbuduj materiały informacyjne dotyczące talii pomocy i dowodzenia.',
      help: 'Pokaż tę listę.',
      footer:
        'Pełne instrukcje znajdują się w ulotce „{help}”; przyciski znajdują się w „{deck}”. {legacy} nadal działa z poleceniami wersji 4.',
    },
    handout: {
      versionLabel: 'Wersja',
      subtitle: 'Patrole, obserwatorzy i blokady w grach Jumpgate i Legacy',
      overview: {
        heading: 'Przegląd',
        body: 'TokenController przenosi tokeny za Ciebie. Wyznacz strażnikowi trasę patrolu, poproś wózek podążający za kierowcą lub zablokuj posąg na miejscu. Trasy można wpisać jako kod kroku, prześledzić na podstawie rysunku na mapie lub zapisać, przesuwając żeton. Trasy działają na stronach kwadratowych, szesnastkowych, izometrycznych, dimetrycznych i bez siatki.',
      },
      quickStart: {
        heading: 'Szybki start',
        steps: [
          'Otwórz materiały informacyjne dotyczące talii poleceń lub wpisz w menu !tokencontroller.',
          'Kliknij Przykłady, aby dodać gotowe trasy, lub Kod kroku, aby wpisać własne (na przykład U2R2D2L2).',
          'Wybierz jeden lub więcej żetonów i kliknij Start obok trasy.',
          'Wybierz token i kliknij Stop, aby go zatrzymać, lub Resetuj, aby odesłać go do miejsca, w którym zaczął.',
        ],
      },
      routes: {
        heading: 'Tworzenie tras',
        points: [
          'Kod kroku: wpisz ruchy, takie jak U2R2D2L2. Kody nie są powiązane z miejscem na mapie, więc ta sama trasa działa wszędzie.',
          'Z rysunku: narysuj linię, wielokąt, kształt odręczny, prostokąt lub elipsę za pomocą narzędzi do rysowania, wybierz go i kliknij Z rysunku. Żetony chodzą po niej, tylko na tej stronie. Możesz później usunąć rysunek.',
          'Nagraj: wybierz token i kliknij Nagraj. Przesuń go za pomocą przycisków strzałek lub przeciągnij na mapę (podążane będą punkty trasy Roll20), a następnie kliknij Zapisz. Na siatkach kwadratowych nagranie staje się kodem kroku, który można edytować.',
          'Trasy pętli rozpoczynają się od początku; trasy tam i z powrotem prowadzą z powrotem tą samą drogą, którą przyszli; gdy trasy zatrzymują się na końcu. Nowe trasy, które kończą się w miejscu rozpoczęcia pętli; inni chodzą tam i z powrotem.',
          'Obszar odbicia: narysuj zamknięty kształt wokół obszaru, wybierz go i kliknij Obszar odbicia. Rozpoczęte na nim żetony poruszają się po liniach prostych i odbijają się od jego krawędzi (oraz od ścian, chyba że trasa je ignoruje), za każdym razem obracając się nieco losowo. Losowy start umieszcza każdy żeton w losowej komórce obszaru.',
        ],
      },
      codes: {
        colCode: 'Kod',
        colMeaning: 'Oznaczający',
        move: 'Przejdź w górę, w dół, w lewo lub w prawo o jedną komórkę.',
        diagonal: 'Poruszaj się po przekątnej.',
        distance: 'Liczba znajdująca się po kierunku powoduje przesunięcie o tyle komórek.',
        face: 'Odwróć się w określonym kierunku, nie ruszając się (wymaga żetonów tury).',
        wait: 'Poczekaj jeden krok lub podaną liczbę kroków.',
        stealth:
          'Przesuń token pomiędzy warstwą tokenów a warstwą GM, tak aby zniknął i pojawił się ponownie.',
      },
      routeOptions: {
        heading: 'Opcje trasy',
        colOption: 'Opcja',
        colMeaning: 'Oznaczający',
        mode: 'pętla, ping-pong (w tę i z powrotem) lub raz.',
        interval: 'Milisekundy na krok dla tej trasy lub 0 dla interwału globalnego.',
        max: 'Najwięcej żetonów, które mogą znajdować się na trasie jednocześnie, lub 0 w przypadku braku limitu.',
        random: 'on: każdy żeton zaczyna się w losowym punkcie na trasie.',
        walls:
          'ignoruj (przejdź przez ściany), przytrzymaj (czekaj przy ścianach i zamkniętych drzwiach), odwróć się (odwróć) lub domyśl (użyj ustawienia Ściany).',
        start:
          'set: żetony przeskakują na pozycję wybranego żetonu po uruchomieniu. jasne: zaczynają tam, gdzie stoją.',
      },
      tokens: {
        heading: 'Tokeny kontrolne',
        points: [
          'Token znajduje się na jednej trasie w danym momencie. Rozpoczęcie na innej trasie zastępuje pierwszą.',
          'Zatrzymaj pozostawia żetony tam, gdzie się znajdują. Reset przywraca je tam, gdzie były przed rozpoczęciem, na ich pierwotnej warstwie.',
          'Zamek utrzymuje żeton na miejscu. Zablokowane tokeny nie patrolują ani nie podążają, dopóki nie zostaną odblokowane.',
          'Obserwuj: wybierz lidera i kliknij Lidera, następnie wybierz obserwujących i kliknij Obserwuj. Możesz także wpisać imię lidera: !tokencontroller podążaj za Goblinem Bossem. Obserwujący podążają za tokenami, które patrolują, tokenami, które przeciągasz i tokenami przenoszonymi przez TokenMod.',
          'Obserwujący mogą podążać za innymi obserwującymi, tworząc łańcuch lub kolumnę.',
          'Przeciągnięcie żetonu patrolowania powoduje kontynuację patrolu od miejsca, w którym go upuściłeś, chyba że przeciąganie patrolu zostanie zatrzymane.',
          'Ściany: przy włączonej opcji Ściany patrole i towarzysze nie przechodzą przez dynamicznie oświetlane ściany lub zamknięte drzwi i okna; otwarte drzwi i okna ich przepuszczają. Nadaj trasie opcję własnych ścian (na przykład ignorowanie ducha).',
          'Znaczniki zatrzymania: żeton, który otrzyma jeden z tych znaczników statusu (na przykład martwy), opuszcza swoją trasę i przestaje podążać, a także zwolennicy lidera, którzy również otrzymują jeden przystanek. Ustaw je za pomocą !tokencontroller set stopMarkers dead;red. Działa to również, gdy inny Mod dodaje znacznik.',
        ],
      },
      grids: {
        heading: 'Siatki',
        points: [
          'Rozmiar komórki i typ siatki są odczytywane z każdej strony, więc różne strony mogą używać różnych siatek.',
          'U i D zawsze oznaczają górę i dół ekranu. Na siatkach heksów porusza się bez pasującego sąsiadującego zygzaka; na siatkach izometrycznych i dimetrycznych przekątne przecinają jeden romb.',
          'Strony z wyłączonym przyciąganiem przesuwają się w krokach co 70 pikseli, bez układania się w siatkę.',
          'Jeśli tokeny odejdą od siatki, przyciągnij token do środka komórki, zaznacz go i kliknij Kalibruj. Wybierz dwa żetony w sąsiednich komórkach wiersza, aby również ustalić rozmiar komórki.',
        ],
      },
      combat: {
        heading: 'Walka',
        points: [
          'Funkcja wykrywania walki wybiera sposób, w jaki walka jest zauważana: wskaźnik tur, przyciski włączania/wyłączania walki lub jedno i drugie.',
          'Zachowanie bojowe decyduje o tym, co robią patrole: pauza, poruszanie się o jeden krok za każdym razem, gdy minie tura, lub poruszanie się dalej.',
          'Wstrzymaj wszystko zatrzymuje każdy patrol w dowolnym momencie; Wznów uruchamia je ponownie.',
        ],
      },
      commands: {
        heading: 'Polecenia',
        intro:
          'Tylko MG mogą używać tych poleceń. Trasom można nadać nazwy lub można do nich odnosić się za pomocą #id za pomocą przycisków menu. Nazwy ze spacjami należy umieszczać w cudzysłowie, gdy polecenie przyjmuje dwie nazwy.',
        mods: "Inni Modowie również mogą wysyłać te polecenia, na przykład z Kart Skryptów. Nie mogą wybierać tokenów, więc nadają im nazwę za pomocą --ids, po którym następują identyfikatory tokenów oddzielone średnikami: !tc stop --ids ID1;ID2. Odpowiedzi trafiają do GM'a.",
        colCommand: 'Rozkaz',
        colDesc: 'Co to robi',
      },
      settings: {
        heading: 'Ustawienia',
        intro:
          'Zmień ustawienia z menu za pomocą !tokencontroller ustawionego na <ustawienie> <wartość> lub na stronie ustawień Mod na ekranie Skrypty API.',
        colKey: 'Klawisz',
        colName: 'Ustawienie',
        colDesc: 'Opis',
      },
      upgrading: {
        heading: 'Aktualizacja z wersji 4',
        points: [
          'Ścieżki, żetony patrolowania, zamki, naśladowcy i niedokończone wersje robocze pozostają zachowane. Szkice stają się trasami kończącymi się na „(wersja robocza)”.',
          'Ustawienia wersji 4 zostają zachowane: interwał, podkroki, rotacja, patrol bojowy i jednostki na kliknięcie.',
          'Polecenia !tc i !token-control oraz makra T-Cntrl_ nadal działają. Tabela przedstawia nowe polecenia.',
          'Wersja 4 wysyłała całe menu po każdej akcji; wersja 5 zamiast tego wysyła krótką odpowiedź.',
          'Zniknęło ustawienie Liczba pikseli na jednostkę: rozmiar komórki pochodzi z każdej strony. Kreator HTML nie jest już potrzebny.',
          'Stara ulotka z Przewodnikiem użytkowania, którą mógł zobaczyć każdy gracz, została zastąpiona ulotką dostępną tylko dla GM.',
        ],
        colV4: 'Wersja 4',
        colV5: 'Wersja 5',
      },
      troubleshooting: {
        heading: 'Rozwiązywanie problemów',
        points: [
          'Tokeny nie przesuwają się: sprawdź Status. Patrole czekają, gdy są wstrzymane, zablokowane i walczą, gdy zachowanie bojowe jest wstrzymane.',
          'Tokeny przesuwają się na niewłaściwą odległość: rozmiar siatki strony lub przyciąganie mogły się zmienić; spróbuj skalibrować.',
          'Narysowana trasa nie rozpocznie się: narysowane trasy działają tylko na stronie, na której zostały narysowane.',
          'Obserwujący nie poruszają się, gdy inny Mod przesuwa lidera: tylko TokenMod zgłasza swoje ruchy. Inne mody mogą wywoływać TokenController.ObserveTokenChange.',
          'Zgłaszaj problemy na forum Roll20 z dowolnymi komunikatami z konsoli API.',
        ],
      },
      languages: {
        heading: 'Języki',
        body: 'TokenController został przetłumaczony na poniższe języki. Wybierz ten z ustawieniem Język.',
        colCode: 'Kod',
        colName: 'Język',
        colNative: 'Imię rodzime',
      },
      credits: {
        heading: 'Kredyty',
        original: 'Oryginalny mod autorstwa',
        maintainer: 'Wersja 5 obsługiwana przez',
        support: 'Zgłaszaj błędy i pomysły na forum Roll20 Mod lub na GitHubie.',
      },
      footer: 'Przyciski do każdej akcji znajdują się w ulotce „{deck}”.',
    },
    deck: {
      subtitle: 'Pokład dowodzenia',
      patrolsDesc: 'Rozpoczynanie, zatrzymywanie i wstrzymywanie patroli. Najpierw wybierz tokeny.',
      createDesc: 'Twórz trasy na podstawie kodu kroku, rysunku lub zapisując token.',
      selectedDesc: 'Zablokuj żetony lub spraw, aby podążały za liderem.',
      toolsDesc: 'Walka, ustawienia i narzędzia siatki.',
      footer: 'Pełne instrukcje znajdują się w ulotce „{help}”.',
    },
  };

  const TRANSLATION$6 = {
    titles: {
      ready: 'O TokenController está pronto.',
      settings: 'Configurações do TokenController',
      help: 'Comandos TokenController',
      export: 'Exportação de rota',
      routes: 'Rotas',
      tokens: 'Tokens Controlados',
      status: 'Estado do TokenController',
    },
    messages: {
      migrated:
        'Atualizado a partir da versão 4. Rotas mantidas: {routes}. Tokens de patrulha mantidos: {patrols}. As suas macros antigas e comandos !tc ainda funcionam.',
      removedGuide:
        'O antigo folheto "Guia de utilização do TokenController", que os jogadores podiam ver, foi substituído pelo folheto de ajuda exclusivo para GM.',
      pruned: 'Patrulhas esquecidas porque os seus tokens já não existem: {count}.',
      readyHint: 'Introduza !tokencontroller para o menu ou abra o folheto do Command Deck.',
      combatStarted: {
        pause: 'O combate começou: as patrulhas estão em pausa até terminar.',
        step: 'O combate começou: as patrulhas avançam um passo a cada turno.',
      },
      combatEnded: 'O combate terminou: as patrulhas continuam.',
      routeAdded: 'Adicionado o percurso "{name}" ({mode}).',
      routeUpdated: 'Rota "{name}" atualizada. Os tokens nele contidos continuam com a nova rota.',
      confirmRemove: 'Remover rota "{name}"? Tokens que irão parar: {count}.',
      routeRemoved: 'Rota "{name}" removida. Tokens parados: {count}.',
      routeRenamed: 'Rota "{from}" renomeada para "{to}".',
      examplesAdded: 'Rotas de exemplo adicionadas: {count}.',
      exportHint: 'Copie o texto abaixo e cole-o depois de {command} em qualquer jogo.',
      imported: 'Rotas {added} importadas; ignorado {skipped} (nome já utilizado ou inválido).',
      started: '{tokens} começou em "{name}".',
      stopped: 'Tokens parados: {count}.',
      reset: 'Os tokens voltaram para onde começaram: {count}.',
      locked: 'Bloqueado: {tokens} ({mode}).',
      unlocked: 'Desbloqueado: {tokens}.',
      leaderSet: '{token} é o líder. Selecione os seguidores e clique em Seguir.',
      following: 'Seguindo agora {leader} ({mode}): {tokens}.',
      unfollowed: 'Os tokens já não seguem: {count}.',
      noRecordings: 'Nada está a ser gravado.',
      recordingCancelled: 'Gravação "{name}" cancelada.',
      languages: 'Idiomas suportados: {list}',
      settingChanged: '{setting} é agora {value}.',
      combatOn: 'Combate ativado.',
      combatOff: 'Combate desligado.',
      calibrationCleared: 'Calibração de grelha removida desta página.',
      calibrated: 'Grelha calibrada para esta página (tamanho da célula × {scale}).',
      paused: 'Todas as patrulhas pararam.',
      resumed: 'As patrulhas foram retomadas.',
      journalRebuilt: 'Apostilas reconstruídas: {help} e {deck}.',
      markerStopped: 'Parado por um marcador de paragem: {tokens}.',
      markerReset: 'Enviado de volta para onde começou por um marcador de paragem: {tokens}.',
    },
    errors: {
      noTokens: 'Nenhum token selecionado.',
      noRouteName: 'Nenhum nome de rota fornecido.',
      routeNotFound: 'Não existe nenhuma rota chamada "{name}".',
      routeExists: 'Já existe uma rota chamada "{name}".',
      code: {
        empty: 'O código da etapa está vazio.',
        badToken: 'O código do passo "{code}" tem algo que não entende em "{at}".',
        tooFar: 'O passo "{at}" é demasiado longo.',
      },
      routeInvalid: 'Esta rota não pôde ser guardada.',
      usageAdd: 'Dê um nome e um código de passo.',
      usageEdit: 'Forneça uma rota e um novo código de passo.',
      selectOneDrawing:
        'Selecione exatamente um desenho (uma linha, um polígono, uma forma à mão livre, um retângulo ou uma elipse).',
      drawingEmpty: 'O desenho selecionado tem poucos pontos a seguir.',
      usageRoute: 'Dê um caminho, uma opção e um valor.',
      unknownRouteOption: 'Não existe nenhuma opção de rota denominada "{option}".',
      selectOneToken: 'Selecione exatamente um token.',
      badRouteValue: '"{value}" não é um valor válido para {option}.',
      usageRename: 'Dê uma rota e o seu novo nome.',
      usageCopy: 'Dê uma rota e um nome à cópia.',
      badJson: 'Esse não é um texto de exportação de rotas.',
      tokenLocked: '{tokens} não pode iniciar: bloqueado.',
      tokenMarked: '{tokens} não pode iniciar: possuem um marcador de paragem.',
      outsideArea: '{tokens} não pode iniciar: estão fora de "{name}".',
      selectOneArea:
        'Selecione exatamente um desenho fechado (um polígono, retângulo, elipse ou loop à mão livre).',
      areaTooSmall:
        'O desenho selecionado necessita de, pelo menos, três cantos para formar uma área.',
      idsNotFound: 'Nenhum token possui estes IDs: {ids}.',
      routeOnOtherPage: '{tokens} não pode iniciar: "{name}" foi desenhado noutra página.',
      startOnOtherPage:
        '{tokens} não pode ser iniciado: o início fixo de "{name}" está noutra página.',
      routeFull: '{tokens} não pode ser iniciado: "{name}" já tem {max} tokens.',
      noPage: 'A página não foi encontrada.',
      emptyTrack: '{tokens} não pode iniciar: "{name}" não tem movimentos.',
      leaderNotFound: 'Não foi encontrado nenhum token chamado "{name}" nesta página.',
      noLeader: 'Ainda não há líder.',
      followLoop: '{tokens} não pode seguir um token que os siga.',
      alreadyRecording: '{token} já está a ser gravado.',
      recordingTokenGone: 'O token para a escrita "{name}" já não existe.',
      recordingEmpty: 'Nada foi registado ainda.',
      unknownSetting: 'Não existe nenhuma configuração chamada "{key}".',
      badSettingValue: '"{value}" não é um valor válido para {key}.',
      calibrateNeedsTokens: 'Selecione um ou dois tokens ajustados aos centros das células.',
      calibrateFailed: 'Os tokens selecionados não puderam ser utilizados para calibrar a grelha.',
      unknownCommand: 'Comando desconhecido "{command}".',
      gmOnly: 'Apenas o GM pode utilizar o TokenController.',
      internal: 'Algo correu mal. Os detalhes estão na consola da API.',
    },
    hints: {
      noTokens: 'Selecione primeiro os tokens no mapa.',
      noRouteName: 'Por exemplo: !tokencontroller add Guard Walk U2R2D2L2',
      routeNotFound: 'Introduza !tokencontroller list para ver todas as rotas.',
      code: {
        empty: 'Por exemplo: U2R2D2L2',
        badToken:
          'Utilize U, D, L, R, UL, UR, DL ou DR com um número de células, W para esperar e S para furtividade.',
        tooFar: 'Uma única etapa pode ter um máximo de 100 células; espera no máximo 100 ticks.',
      },
      selectOneDrawing:
        'Desenhe a rota com uma ferramenta de desenho, selecione-a (arraste uma caixa à volta de um contorno fino se clicar em errado) e tente novamente.',
      usageRoute: 'Opções: modo, intervalo, máximo, aleatório, paredes, início.',
      routeOnOtherPage: 'As rotas desenhadas funcionam apenas na página em que foram desenhadas.',
      startOnOtherPage: 'Limpe o início fixo ou mova primeiro o token para essa página.',
      noLeader:
        'Selecione o líder e clique em Líder, ou dê o seu nome: !tokencontroller follow Name',
      leaderNotFound:
        'Utilize o nome do token exatamente como mostrado no mapa ou o seu ID do token.',
      badJson: 'Cole o texto de !tokencontroller export (ou v4 exportpaths) exatamente.',
      unknownSetting: 'Digite !tokencontroller set para ver todas as definições.',
      calibrateNeedsTokens:
        'Um token alinha a grelha; dois tokens em células vizinhas de uma linha também fixam o tamanho da célula.',
      calibrateFailed:
        'Certifique-se de que os tokens estão em células vizinhas da mesma linha (coluna nas páginas Hex(H)).',
      unknownCommand: 'Digite !tokencontroller help para obter a lista de comandos.',
      tokenLocked: 'Desbloqueie o token primeiro.',
      tokenMarked: 'Remova o marcador ou altere a definição dos marcadores de paragem.',
      outsideArea:
        'Mova primeiro os tokens dentro da área ou ative o Início aleatório para a rota.',
      selectOneArea:
        'Desenhe a área com uma ferramenta de desenho, seleccione-a (arraste uma caixa à volta de um contorno fino se clicar em errado) e tente novamente.',
      idsNotFound: 'Forneça os IDs de token após --ids, separados por ponto e vírgula.',
    },
    warnings: {
      idsNotFound: 'Nenhum token possui estes IDs, pelo que foram ignorados: {ids}.',
      offPage: 'Parte da rota sai da página (passos: {count}). Estas etapas são ignoradas.',
      combatTrackerOnly:
        'A Detecção de Combate está definida para o rastreador de turno, pelo que esta opção não terá qualquer efeito até que a altere.',
      unitPx:
        'A versão 5 lê o tamanho da célula de cada página, pelo que a antiga configuração Pixels Per Unit já não é utilizada. Se os tokens não estiverem alinhados, utilize !tokencontroller calibrate.',
    },
    values: {
      on: 'Em',
      off: 'Desligado',
      none: 'Nenhum',
      default: 'Predefinição',
      noLimit: 'Sem limite',
      ms: '{ms} ms',
      andMore: 'e mais {count}',
      following: 'seguindo {leader}',
      locked: 'bloqueado',
      gridless: 'sem encaixe',
      grid: {
        square: 'Quadrado',
        hex: 'Feitiço',
        iso: 'Isométrico / Dimétrico',
      },
      mode: {
        loop: 'Laço',
        pingpong: 'Vai e volta',
        once: 'Uma vez',
      },
      movement: {
        cell: 'Uma célula de cada vez',
        segment: 'Passo inteiro de cada vez',
      },
      facing: {
        off: 'Não vire',
        up: 'Arte virada para cima',
        down: 'Arte virada para baixo',
        left: 'Art enfrenta à esquerda',
        right: 'A arte está virada para a direita',
      },
      combatDetection: {
        tracker: 'Vire rastreador',
        manual: 'Interruptor GM',
        both: 'Rode o rastreador ou interruptor GM',
      },
      combatBehaviour: {
        pause: 'Pausa',
        step: 'Mover cada turno',
        ignore: 'Continue andando',
      },
      lockMode: {
        native: 'Bloqueio de posição do Roll20',
        revert: 'Desfazer movimentos',
        freeze: 'Fique parado apenas',
      },
      followMode: {
        trail: 'Arquivo único',
        formation: 'Formação',
      },
      manualMove: {
        continue: 'Continue a partir daí',
        stop: 'Pare a patrulha',
      },
      markerAction: {
        stop: 'Pare onde está',
        reset: 'Voltar ao início',
      },
      wallMode: {
        ignore: 'Atravesse paredes',
        hold: 'Espere nas paredes',
        turn: 'Volte para as paredes',
      },
      wallCheck: {
        centre: 'Centro do token',
        width: 'Token inteiro',
      },
      oneWayWalls: {
        block: 'Bloco',
        pass: 'Deixe passar',
      },
      transparentWalls: {
        block: 'Bloco',
        pass: 'Deixe passar',
      },
    },
    menu: {
      statusRunning: 'Tokens de patrulha: {patrols}. Percursos: {routes}.',
      statusPaused: 'Todas as patrulhas estão em pausa.',
      statusCombat: {
        pause: 'Em combate: as patrulhas são pausadas.',
        step: 'Em combate: as patrulhas deslocam-se a cada turno.',
      },
      routes: 'Rotas',
      noRoutes:
        'Ainda não há rotas. Adicione um, desenhe um, registe um ou acrescente os exemplos.',
      create: 'Nova rota',
      selected: 'Tokens Selecionados',
      tools: 'Ferramentas',
      recordings: 'Gravações',
      patrols: 'Patrulhas',
    },
    buttons: {
      start: 'Iniciar',
      stop: 'Parar',
      add: 'Código da etapa',
      draw: 'Do desenho',
      bounce: 'Área de rejeição',
      record: 'Registo',
      examples: 'Exemplos',
      reset: 'Reiniciar',
      lock: 'Bloquear',
      unlock: 'Desbloquear',
      leader: 'Líder',
      follow: 'Seguir',
      unfollow: 'Deixar de seguir',
      resume: 'Retomar',
      pause: 'Pausar tudo',
      combatOn: 'Combate ativado',
      combatOff: 'Combate desativado',
      stopAll: 'Pare tudo',
      settings: 'Configurações',
      status: 'Estatuto',
      help: 'Ajuda',
      open: 'Aberto',
      clearStart: 'Claro',
      setStart: 'Definir como selecionado',
      edit: 'Editar código',
      rename: 'Renomear',
      copy: 'Cópia',
      export: 'Exportar',
      remove: 'Remover',
      menu: 'Menu',
      wait: 'Espera',
      stealth: 'Furtividade',
      undo: 'Desfazer',
      save: 'Guardar',
      cancel: 'Cancelar',
      confirm: 'Sim, retire-o',
      startRoute: 'Iniciar rota',
      list: 'Listar rotas',
      calibrate: 'Calibrar',
    },
    prompts: {
      name: 'Nome da rota',
      code: 'Código da etapa',
      interval: 'Milissegundos por passo (0 = padrão)',
      maxTokens: 'A maioria dos tokens de uma só vez (0 = sem limite)',
      newName: 'Novo nome',
      route: 'Nome da rota',
    },
    route: {
      drawn: 'Percurso desenhado, {points} pontos',
      recorded: 'Percurso registado, {points} pontos',
      area: 'Área de salto, {points} cantos',
      path: 'Percurso',
      mode: 'Modo',
      interval: 'Intervalo',
      maxTokens: 'A maioria dos tokens',
      randomStart: 'Início aleatório',
      walls: 'Paredes',
      start: 'Início fixo',
      tokens: 'Fichas',
    },
    record: {
      title: 'A gravar "{name}"',
      intro:
        'A escrever {token} (move até agora: {count}). Clique nas setas ou arraste o token no mapa; cada movimento é registado.',
    },
    settings: {
      interval: {
        label: 'Intervalo',
        desc: 'Milissegundos entre etapas. Cada rota pode substituí-la.',
      },
      movement: {
        label: 'Movimento',
        desc: 'a célula move uma célula por etapa; segmento move um passo inteiro (como U3) de uma só vez, como fez a versão 4.',
      },
      facing: {
        label: 'Fichas de Turno',
        desc: 'Vire as fichas para onde vão: para fora, ou para a direção para onde a arte da ficha está virada (para cima, para baixo, para a esquerda ou para a direita).',
      },
      combatDetection: {
        label: 'Detecção de Combate',
        desc: 'Como o combate é percebido: rastreador (o rastreador de turno está aberto com alguém nele), manual (os botões Ligar/Desligar Combate) ou ambos.',
      },
      combatBehaviour: {
        label: 'Comportamento de Combate',
        desc: 'O que as patrulhas fazem em combate: pausar, pisar (mover-se uma vez de cada vez que passa o turno) ou ignorar (continuar em movimento).',
      },
      lockMode: {
        label: 'Modo de bloqueio',
        desc: 'Como Lock mantém um token: nativo (bloqueio de posição do próprio Roll20, para que ninguém o possa arrastar), reverter (os movimentos são desfeitos) ou congelar (deixa de patrulhar e seguir, mas ainda pode ser arrastado).',
      },
      lockMarker: {
        label: 'Marcador de bloqueio',
        desc: 'Marcador de estado mostrado em tokens bloqueados ou nenhum. Os jogadores podem ver os marcadores.',
      },
      followMode: {
        label: 'Modo Seguir',
        desc: 'trilho: os seguidores caminham em fila indiana seguindo os passos do líder. formação: os seguidores mantêm o seu lugar à volta do líder (arraste um seguidor para mudar o seu lugar).',
      },
      manualMove: {
        label: 'Arrastando uma patrulha',
        desc: 'Ao arrastar uma ficha de patrulha: continue (a rota continua a partir do local onde a largou) ou pare (a patrulha termina).',
      },
      stopMarkers: {
        label: 'Marcadores de paragem',
        desc: 'Marcadores de estado que desviam um token da sua rota e o impedem de o seguir, separados por ponto e vírgula (por exemplo, morto; vermelho) ou nenhum. Os seguidores de um líder com um destes marcadores também param.',
      },
      markerAction: {
        label: 'Parar a ação do marcador',
        desc: 'O que faz uma ficha de patrulha quando recebe um Marcador de Paragem: parar (permanece onde está) ou reiniciar (volta para onde começou).',
      },
      wallMode: {
        label: 'Paredes',
        desc: 'O que as patrulhas e os seguidores fazem em paredes de iluminação dinâmica e portas e janelas fechadas: ignorar (passar), segurar (esperar até que o caminho esteja livre, por exemplo, até que uma porta se abra) ou virar (as patrulhas regressam). Cada rota pode escolher a sua própria, pelo que os fantasmas ainda podem atravessar paredes.',
      },
      wallCheck: {
        label: 'Verificação de parede',
        desc: 'centro: apenas o meio de uma ficha deve estar afastado das paredes. largura: todo o token o faz, pelo que um token grande não pode passar por uma lacuna estreita.',
      },
      oneWayWalls: {
        label: 'Paredes Unidirecionais',
        desc: 'Se as paredes unidirecionais param os tokens (bloquear) ou não (passar).',
      },
      transparentWalls: {
        label: 'Paredes transparentes',
        desc: 'Sejam paredes transparentes, que deixam passar a luz, fichas de paragem (bloqueio) ou não (passagem).',
      },
      buttonStep: {
        label: 'Células por clique',
        desc: 'A que distância as setas de gravação movem um token.',
      },
      language: {
        label: 'Idioma',
        desc: 'Idioma para menus, mensagens e folhetos.',
      },
    },
    status: {
      routes: 'Rotas',
      patrols: 'Tokens de patrulha',
      followers: 'Seguindo tokens',
      locked: 'Tokens bloqueados',
      recordings: 'Gravações',
      paused: 'Pausado',
      combat: 'Combate',
      page: 'Página atual',
      grid: 'Rede',
      cell: 'Tamanho da célula',
      calibration: 'Calibração',
    },
    help: {
      menu: 'Mostre o menu.',
      start: 'Coloque os tokens selecionados numa rota.',
      stop: 'Pare os tokens selecionados (patrulhas e seguimento), todos os tokens de uma rota ou todos.',
      reset: 'Volte a colocar os tokens para onde começaram e pare-os.',
      pause: 'Faça uma pausa ou retome cada patrulha.',
      lock: 'Segure os tokens selecionados no lugar ou solte-os.',
      leader: 'Escolha o token selecionado como o líder a seguir.',
      follow: 'Faça com que as fichas selecionadas sigam o líder ou uma ficha indicada pelo nome.',
      unfollow: 'Pare os tokens selecionados a seguir.',
      add: 'Crie uma rota a partir de um código de passo, como por exemplo U2R2D2L2.',
      edit: 'Altere o código de etapa de uma rota.',
      draw: 'Crie uma rota que siga o desenho selecionado nesta página.',
      bounce:
        'Crie uma rota na qual os tokens vagueiam dentro do desenho fechado selecionado, ricocheteando nas suas margens.',
      record: 'Grave uma rota movendo o token selecionado com botões ou arrastando-o.',
      route: 'Altere uma opção de rota: modo, intervalo, máximo, aleatório, paredes ou início.',
      show: 'Mostrar detalhes e botões de uma rota.',
      rename: 'Renomeie uma rota.',
      copy: 'Copie uma rota com um novo nome.',
      remove: 'Remover uma rota (pergunta primeiro).',
      ids: 'Aja sobre os tokens com estes IDs em vez dos selecionados, para que outros Mods, como os ScriptCards, possam controlar os tokens. remove --ids retira os tokens das suas rotas; nunca remove uma rota.',
      list: 'Liste as rotas ou os tokens que estão a ser controlados.',
      examples: 'Adicione as rotas de exemplo.',
      export: 'Mostrar rotas como texto para copiar noutro jogo.',
      import: 'Adicione rotas do texto de exportação.',
      combat: 'Ative ou desative o combate manualmente.',
      set: 'Altere uma definição ou mostre todas as definições.',
      calibrate:
        'Alinhe a grelha com tokens encaixados nos centros das células ou retire a calibração.',
      status: 'Mostre o que o Mod está a fazer e como vê esta página.',
      journal: 'Reconstrua os folhetos da Ajuda e da Plataforma de Comando.',
      help: 'Mostre esta lista.',
      footer:
        'As instruções completas estão no folheto "{help}"; os botões estão em "{deck}". {legacy} ainda funciona com os comandos da versão 4.',
    },
    handout: {
      versionLabel: 'Versão',
      subtitle: 'Patrulhas, seguidores e bloqueios para jogos Jumpgate e Legacy',
      overview: {
        heading: 'Visão geral',
        body: 'O TokenController move tokens para si. Dê a um guarda uma rota de patrulha, faça com que uma carroça siga o seu condutor ou prenda uma estátua no lugar. As rotas podem ser introduzidas como um código de passo, traçadas a partir de um desenho no mapa ou registadas através da movimentação de um token. As rotas funcionam em páginas quadradas, hexadecimais, isométricas, dimétricas e sem grelha.',
      },
      quickStart: {
        heading: 'Início rápido',
        steps: [
          'Abra o folheto do Command Deck ou digite !tokencontroller para o menu.',
          'Clique em Exemplos para adicionar algumas rotas já prontas ou em Step Code para digitar as suas próprias (por exemplo, U2R2D2L2).',
          'Selecione um ou mais tokens e clique em Iniciar junto a uma rota.',
          'Selecione um token e clique em Parar para o interromper ou em Repor para o enviar de volta para o ponto de partida.',
        ],
      },
      routes: {
        heading: 'Fazendo rotas',
        points: [
          'Código do passo: introduza os movimentos como U2R2D2L2. Os códigos não estão ligados a um local no mapa, pelo que a mesma rota funciona em qualquer lugar.',
          'A partir do Desenho: desenhe uma linha, polígono, forma à mão livre, retângulo ou elipse com as ferramentas de desenho, selecione-o e clique em A partir do Desenho. Os tokens caminham ao longo do mesmo, apenas nessa página. Pode excluir o desenho posteriormente.',
          'Gravar: selecione um token e clique em Gravar. Mova-o com os botões de seta ou arraste-o no mapa (os pontos de passagem Roll20 são seguidos) e clique em Guardar. Nas grelhas quadradas, a gravação torna-se um código de passo que pode editar.',
          'As rotas circulares recomeçam desde o início; os percursos de ida e volta regressam pelo caminho de onde vieram; uma vez que as rotas param no final. Novas rotas que terminam onde iniciam o loop; outros vão e voltam.',
          'Área de salto: desenhe uma forma fechada à volta da área, seleccione-a e clique em Área de salto. Os tokens iniciados nele viajam em linhas retas e ricocheteiam nas suas bordas (e nas paredes, a menos que a rota os ignore), girando um pouco aleatoriamente de cada vez. O início aleatório coloca cada ficha numa célula aleatória da área.',
        ],
      },
      codes: {
        colCode: 'Código',
        colMeaning: 'Significado',
        move: 'Mover para cima, para baixo, para a esquerda ou para a direita, uma célula.',
        diagonal: 'Mova-se na diagonal.',
        distance: 'Um número após uma direção move esse número de células.',
        face: 'Vire-se para uma direção sem se mover (necessita de fichas de turno).',
        wait: 'Aguarde um passo ou o número determinado de passos.',
        stealth:
          'Mova a ficha entre a camada de fichas e a camada GM, para que desapareça e volte a aparecer.',
      },
      routeOptions: {
        heading: 'Opções de rota',
        colOption: 'Opção',
        colMeaning: 'Significado',
        mode: 'loop, pingue-pongue (para a frente e para trás) ou uma vez.',
        interval: 'Milissegundos por passo para esta rota ou 0 para o intervalo global.',
        max: 'O maior número de tokens que podem estar na rota de uma só vez, ou 0 sem limite.',
        random: 'on: cada token começa num ponto aleatório ao longo da rota.',
        walls:
          'ignorar (atravessar paredes), segurar (esperar nas paredes e portas fechadas), virar (voltar atrás) ou padrão (utilizar a definição Paredes).',
        start:
          'set: os tokens saltam para a posição do token selecionado quando são iniciados. claro: começam onde estão.',
      },
      tokens: {
        heading: 'Controle de tokens',
        points: [
          'Um token está numa rota de cada vez. Iniciá-lo noutra rota substitui a primeira.',
          'O stop deixa os tokens onde estão. Redefinir coloca-os de volta onde estavam antes de começar, na sua camada original.',
          'Lock mantém um token no lugar. Os tokens bloqueados não patrulham nem seguem até serem desbloqueados.',
          'Seguir: selecione o líder e clique em Líder, depois selecione os seguidores e clique em Seguir. Pode também digitar o nome do líder: !tokencontroller follow Goblin Boss. Os seguidores seguem os tokens que patrulham, os tokens que arrasta e os tokens movidos pelo TokenMod.',
          'Os seguidores podem seguir outros seguidores, formando uma corrente ou coluna.',
          'Arrastar uma ficha de patrulha continua a patrulha a partir do local onde a libertou, a menos que Arrastar uma Patrulha esteja definido para parar.',
          'Paredes: com a definição Paredes ativada, as patrulhas e os seguidores não transitam por paredes com iluminação dinâmica ou portas e janelas fechadas; portas e janelas abertas deixam-nos passar. Dê a uma rota a sua própria opção de paredes (por exemplo, ignorar um fantasma).',
          'Marcadores de paragem: um token que recebe um destes marcadores de estado (por exemplo, morto) sai da sua rota e deixa de seguir, e os seguidores de um líder que recebe uma paragem também. Defina-os com !tokencontroller set stopMarkers dead;red. Isto também funciona quando outro Mod adiciona o marcador.',
        ],
      },
      grids: {
        heading: 'Grades',
        points: [
          'O tamanho da célula e o tipo de grelha são lidos em cada página, pelo que páginas diferentes podem utilizar grelhas diferentes.',
          'U e D significam sempre para cima e para baixo no ecrã. Nas grades hexadecimais, movimentos sem ziguezague vizinho correspondente; em malhas isométricas e dimétricas, as diagonais cruzam um losango.',
          'As páginas com o ajuste desativado movem-se em passos de 70 pixels sem se alinharem com uma grelha.',
          'Se os tokens saírem da grelha, encaixe um token no centro da célula, seleccione-o e clique em Calibrar. Selecione dois tokens nas células vizinhas de uma linha para corrigir também o tamanho da célula.',
        ],
      },
      combat: {
        heading: 'Combate',
        points: [
          'A Detecção de Combate escolhe a forma como o combate é percebido: o rastreador de turno, os botões Ligar/Desligar Combate ou ambos.',
          'O Comportamento de Combate escolhe o que as patrulhas fazem: pausar, dar um passo de cada vez que o turno passa ou continuar em movimento.',
          'Pausar tudo interrompe todas as patrulhas a qualquer momento; Retomar os inicia novamente.',
        ],
      },
      commands: {
        heading: 'Comandos',
        intro:
          'Apenas os GMs podem usar estes comandos. As rotas podem ser nomeadas ou referenciadas pelo seu #id nos botões do menu. Coloque nomes com espaços entre “aspas” quando um comando recebe dois nomes.',
        mods: 'Outros Mods também podem enviar estes comandos, por exemplo, a partir de ScriptCards. Não podem selecionar tokens, por isso nomeiam-nos com --ids seguido de IDs de token separados por ponto e vírgula: !tc stop --ids ID1;ID2. As respostas vão para o GM.',
        colCommand: 'Comando',
        colDesc: 'O que faz',
      },
      settings: {
        heading: 'Configurações',
        intro:
          'Altere as definições no menu, com !tokencontroller set <setting> <value>, ou na página Mod settings no ecrã API Scripts.',
        colKey: 'Chave',
        colName: 'Definição',
        colDesc: 'Descrição',
      },
      upgrading: {
        heading: 'Atualização da versão 4',
        points: [
          'Caminhos, fichas de patrulha, bloqueios, seguidores e rascunhos inacabados são mantidos. Os rascunhos tornam-se rotas que terminam em "(rascunho)".',
          'As suas definições da versão 4 são mantidas: intervalo, subetapas, rotação, patrulha de combate e unidades por clique.',
          'Os comandos !tc e !token-control e as macros T-Cntrl_ continuam a funcionar. A tabela mostra os novos comandos.',
          'A versão 4 enviava o menu completo após cada ação; a versão 5 envia uma resposta curta.',
          'A definição Pixels Per Unit desapareceu: o tamanho da célula vem de cada página. O HTML Builder já não é necessário.',
          'O antigo folheto do Guia de Utilização, que todos os jogadores podiam ver, foi substituído por este folheto exclusivo para GM.',
        ],
        colV4: 'Versão 4',
        colV5: 'Versão 5',
      },
      troubleshooting: {
        heading: 'Solução de problemas',
        points: [
          'Os tokens não se movem: verifique o estado. As patrulhas esperam enquanto estão em pausa, enquanto estão bloqueadas e em combate quando o Comportamento de Combate está em pausa.',
          'Os tokens movem-se à distância errada: o tamanho da grelha ou o ajuste da página podem ter sido alterados; tente Calibrar.',
          'Uma rota desenhada não será iniciada: as rotas desenhadas só funcionam na página em que foram desenhadas.',
          'Os seguidores não se movem quando outro Mod move o líder: apenas o TokenMod reporta os seus movimentos. Outros Mods podem chamar TokenController.ObserveTokenChange.',
          'Reporte problemas no fórum Roll20 com quaisquer mensagens da consola API.',
        ],
      },
      languages: {
        heading: 'Idiomas',
        body: 'TokenController está traduzido para os idiomas abaixo. Escolha um com a definição de idioma.',
        colCode: 'Código',
        colName: 'Idioma',
        colNative: 'Nome nativo',
      },
      credits: {
        heading: 'Créditos',
        original: 'Mod original de',
        maintainer: 'A versão 5 mantida por',
        support: 'Reporte bugs e ideias no fórum Roll20 Mod ou no GitHub.',
      },
      footer: 'Os botões de cada ação estão no folheto "{deck}".',
    },
    deck: {
      subtitle: 'Convés de Comando',
      patrolsDesc: 'Iniciar, parar e pausar patrulhas. Selecione primeiro os tokens.',
      createDesc:
        'Faça rotas a partir de um código de passo, de um desenho ou registando um token.',
      selectedDesc: 'Bloqueie os tokens ou faça-os seguir um líder.',
      toolsDesc: 'Combate, configurações e ferramentas de grelha.',
      footer: 'As instruções completas estão no folheto "{help}".',
    },
  };

  const TRANSLATION$5 = {
    titles: {
      ready: 'TokenController está pronto.',
      settings: 'Configurações do TokenController',
      help: 'Comandos TokenController',
      export: 'Exportação de rota',
      routes: 'Rotas',
      tokens: 'Tokens Controlados',
      status: 'Status do TokenController',
    },
    messages: {
      migrated:
        'Atualizado da versão 4. Rotas mantidas: {routes}. Tokens de patrulha mantidos: {patrols}. Suas macros antigas e comandos !tc ainda funcionam.',
      removedGuide:
        'O antigo folheto "Guia de uso do TokenController", que os jogadores podiam ver, foi substituído pelo folheto de ajuda exclusivo para GM.',
      pruned: 'Patrulhas esquecidas porque seus tokens não existem mais: {count}.',
      readyHint: 'Digite !tokencontroller para o menu ou abra o folheto do Command Deck.',
      combatStarted: {
        pause: 'O combate começou: as patrulhas estão pausadas até terminar.',
        step: 'O combate começou: as patrulhas avançam um passo a cada turno.',
      },
      combatEnded: 'O combate acabou: as patrulhas continuam.',
      routeAdded: 'Rota "{name}" adicionada ({mode}).',
      routeUpdated: 'Rota "{name}" atualizada. Os tokens nele continuam com a nova rota.',
      confirmRemove: 'Remover rota "{name}"? Tokens que irão parar: {count}.',
      routeRemoved: 'Rota "{name}" removida. Tokens parados: {count}.',
      routeRenamed: 'Rota "{from}" renomeada para "{to}".',
      examplesAdded: 'Rotas de exemplo adicionadas: {count}.',
      exportHint: 'Copie o texto abaixo e cole depois de {command} em qualquer jogo.',
      imported: 'Rotas {added} importadas; ignorado {skipped} (nome já utilizado ou inválido).',
      started: '{tokens} começou em "{name}".',
      stopped: 'Tokens parados: {count}.',
      reset: 'Os tokens retornaram para onde começaram: {count}.',
      locked: 'Bloqueado: {tokens} ({mode}).',
      unlocked: 'Desbloqueado: {tokens}.',
      leaderSet: '{token} é o líder. Selecione os seguidores e clique em Seguir.',
      following: 'Agora seguindo {leader} ({mode}): {tokens}.',
      unfollowed: 'Os tokens não seguem mais: {count}.',
      noRecordings: 'Nada está sendo gravado.',
      recordingCancelled: 'Gravação "{name}" cancelada.',
      languages: 'Idiomas suportados: {list}',
      settingChanged: '{setting} agora é {value}.',
      combatOn: 'Combate ativado.',
      combatOff: 'Combate desligado.',
      calibrationCleared: 'Calibração de grade removida desta página.',
      calibrated: 'Grade calibrada para esta página (tamanho da célula × {scale}).',
      paused: 'Todas as patrulhas pararam.',
      resumed: 'As patrulhas foram retomadas.',
      journalRebuilt: 'Apostilas reconstruídas: {help} e {deck}.',
      markerStopped: 'Parado por um marcador de parada: {tokens}.',
      markerReset: 'Enviado de volta para onde começou por um marcador de parada: {tokens}.',
    },
    errors: {
      noTokens: 'Nenhum token selecionado.',
      noRouteName: 'Nenhum nome de rota fornecido.',
      routeNotFound: 'Não existe nenhuma rota chamada "{name}".',
      routeExists: 'Já existe uma rota chamada "{name}".',
      code: {
        empty: 'O código da etapa está vazio.',
        badToken: 'O código da etapa "{code}" tem algo que não entende em "{at}".',
        tooFar: 'A etapa "{at}" é muito longa.',
      },
      routeInvalid: 'Essa rota não pôde ser salva.',
      usageAdd: 'Dê um nome e um código de etapa.',
      usageEdit: 'Forneça uma rota e um novo código de etapa.',
      selectOneDrawing:
        'Selecione exatamente um desenho (uma linha, um polígono, uma forma à mão livre, um retângulo ou uma elipse).',
      drawingEmpty: 'O desenho selecionado tem poucos pontos para seguir.',
      usageRoute: 'Dê um caminho, uma opção e um valor.',
      unknownRouteOption: 'Não há opção de rota chamada "{option}".',
      selectOneToken: 'Selecione exatamente um token.',
      badRouteValue: '"{value}" não é um valor válido para {option}.',
      usageRename: 'Dê uma rota e seu novo nome.',
      usageCopy: 'Dê uma rota e um nome para a cópia.',
      badJson: 'Esse não é um texto de exportação de rota.',
      tokenLocked: '{tokens} não pode iniciar: bloqueado.',
      tokenMarked: '{tokens} não pode iniciar: eles possuem um marcador de parada.',
      outsideArea: '{tokens} não pode iniciar: eles estão fora de "{name}".',
      selectOneArea:
        'Selecione exatamente um desenho fechado (um polígono, retângulo, elipse ou loop à mão livre).',
      areaTooSmall: 'O desenho selecionado precisa de pelo menos três cantos para formar uma área.',
      idsNotFound: 'Nenhum token possui estes IDs: {ids}.',
      routeOnOtherPage: '{tokens} não pode iniciar: "{name}" foi desenhado em outra página.',
      startOnOtherPage:
        '{tokens} não pode ser iniciado: o início fixo de "{name}" está em outra página.',
      routeFull: '{tokens} não pode ser iniciado: "{name}" já possui {max} tokens.',
      noPage: 'A página não foi encontrada.',
      emptyTrack: '{tokens} não pode iniciar: "{name}" não tem movimentos.',
      leaderNotFound: 'Nenhum token chamado "{name}" foi encontrado nesta página.',
      noLeader: 'Ainda não há líder.',
      followLoop: '{tokens} não pode seguir um token que os segue.',
      alreadyRecording: '{token} já está sendo gravado.',
      recordingTokenGone: 'O token para gravação "{name}" não existe mais.',
      recordingEmpty: 'Nada foi registrado ainda.',
      unknownSetting: 'Não há configuração chamada "{key}".',
      badSettingValue: '"{value}" não é um valor válido para {key}.',
      calibrateNeedsTokens: 'Selecione um ou dois tokens ajustados aos centros das células.',
      calibrateFailed: 'Os tokens selecionados não puderam ser usados para calibrar a grade.',
      unknownCommand: 'Comando desconhecido "{command}".',
      gmOnly: 'Somente o GM pode usar o TokenController.',
      internal: 'Algo deu errado. Os detalhes estão no console da API.',
    },
    hints: {
      noTokens: 'Selecione primeiro os tokens no mapa.',
      noRouteName: 'Por exemplo: !tokencontroller add Guard Walk U2R2D2L2',
      routeNotFound: 'Digite !tokencontroller list para ver todas as rotas.',
      code: {
        empty: 'Por exemplo: U2R2D2L2',
        badToken:
          'Use U, D, L, R, UL, UR, DL ou DR com um número de células, W para esperar e S para furtividade.',
        tooFar: 'Uma única etapa pode ter no máximo 100 células; espera no máximo 100 ticks.',
      },
      selectOneDrawing:
        'Desenhe a rota com uma ferramenta de desenho, selecione-a (arraste uma caixa ao redor de um contorno fino se clicar em errado) e tente novamente.',
      usageRoute: 'Opções: modo, intervalo, máximo, aleatório, paredes, início.',
      routeOnOtherPage: 'As rotas desenhadas funcionam apenas na página em que foram desenhadas.',
      startOnOtherPage: 'Limpe o início fixo ou mova o token para essa página primeiro.',
      noLeader: 'Selecione o líder e clique em Líder, ou dê seu nome: !tokencontroller follow Name',
      leaderNotFound: 'Use o nome do token exatamente como mostrado no mapa ou seu ID do token.',
      badJson: 'Cole o texto de !tokencontroller export (ou v4 exportpaths) exatamente.',
      unknownSetting: 'Digite !tokencontroller set para ver todas as configurações.',
      calibrateNeedsTokens:
        'Um token alinha a grade; dois tokens em células vizinhas de uma linha também fixam o tamanho da célula.',
      calibrateFailed:
        'Certifique-se de que os tokens estejam em células vizinhas da mesma linha (coluna nas páginas Hex (H)).',
      unknownCommand: 'Digite !tokencontroller help para obter a lista de comandos.',
      tokenLocked: 'Desbloqueie o token primeiro.',
      tokenMarked: 'Remova o marcador ou altere a configuração dos marcadores de parada.',
      outsideArea:
        'Mova os tokens dentro da área primeiro ou ative o Início aleatório para a rota.',
      selectOneArea:
        'Desenhe a área com uma ferramenta de desenho, selecione-a (arraste uma caixa ao redor de um contorno fino se clicar em errado) e tente novamente.',
      idsNotFound: 'Forneça IDs de token após --ids, separados por ponto e vírgula.',
    },
    warnings: {
      idsNotFound: 'Nenhum token possui estes IDs, então eles foram ignorados: {ids}.',
      offPage: 'Parte da rota sai da página (etapas: {count}). Essas etapas são ignoradas.',
      combatTrackerOnly:
        'A Detecção de Combate está definida para o rastreador de turno, portanto, essa opção não terá efeito até que você a altere.',
      unitPx:
        'A versão 5 lê o tamanho da célula de cada página, portanto a antiga configuração Pixels Per Unit não é mais usada. Se os tokens não estiverem alinhados, use !tokencontroller calibrate.',
    },
    values: {
      on: 'Sobre',
      off: 'Desligado',
      none: 'Nenhum',
      default: 'Padrão',
      noLimit: 'Sem limite',
      ms: '{ms} ms',
      andMore: 'e mais {count}',
      following: 'seguindo {leader}',
      locked: 'bloqueado',
      gridless: 'sem encaixe',
      grid: {
        square: 'Quadrado',
        hex: 'Feitiço',
        iso: 'Isométrico / Dimétrico',
      },
      mode: {
        loop: 'Laço',
        pingpong: 'Vai e volta',
        once: 'Uma vez',
      },
      movement: {
        cell: 'Uma célula de cada vez',
        segment: 'Passo inteiro de cada vez',
      },
      facing: {
        off: 'Não vire',
        up: 'Arte voltada para cima',
        down: 'Arte voltada para baixo',
        left: 'Art enfrenta à esquerda',
        right: 'A arte está voltada para a direita',
      },
      combatDetection: {
        tracker: 'Vire rastreador',
        manual: 'Interruptor GM',
        both: 'Gire o rastreador ou interruptor GM',
      },
      combatBehaviour: {
        pause: 'Pausa',
        step: 'Mova cada turno',
        ignore: 'Continue andando',
      },
      lockMode: {
        native: 'Bloqueio de posição do Roll20',
        revert: 'Desfazer movimentos',
        freeze: 'Fique parado apenas',
      },
      followMode: {
        trail: 'Arquivo único',
        formation: 'Formação',
      },
      manualMove: {
        continue: 'Continue a partir daí',
        stop: 'Pare a patrulha',
      },
      markerAction: {
        stop: 'Pare onde está',
        reset: 'Volte ao início',
      },
      wallMode: {
        ignore: 'Atravesse paredes',
        hold: 'Espere nas paredes',
        turn: 'Volte para as paredes',
      },
      wallCheck: {
        centre: 'Centro do token',
        width: 'Token inteiro',
      },
      oneWayWalls: {
        block: 'Bloquear',
        pass: 'Deixe passar',
      },
      transparentWalls: {
        block: 'Bloquear',
        pass: 'Deixe passar',
      },
    },
    menu: {
      statusRunning: 'Tokens de patrulha: {patrols}. Rotas: {routes}.',
      statusPaused: 'Todas as patrulhas estão pausadas.',
      statusCombat: {
        pause: 'Em combate: as patrulhas são pausadas.',
        step: 'Em combate: as patrulhas se movem a cada turno.',
      },
      routes: 'Rotas',
      noRoutes: 'Ainda não há rotas. Adicione um, desenhe um, registre um ou adicione os exemplos.',
      create: 'Nova rota',
      selected: 'Tokens Selecionados',
      tools: 'Ferramentas',
      recordings: 'Gravações',
      patrols: 'Patrulhas',
    },
    buttons: {
      start: 'Começar',
      stop: 'Parar',
      add: 'Código da etapa',
      draw: 'Do desenho',
      bounce: 'Área de rejeição',
      record: 'Registro',
      examples: 'Exemplos',
      reset: 'Reiniciar',
      lock: 'Trancar',
      unlock: 'Desbloquear',
      leader: 'Líder',
      follow: 'Seguir',
      unfollow: 'Deixar de seguir',
      resume: 'Retomar',
      pause: 'Pausar tudo',
      combatOn: 'Combate ativado',
      combatOff: 'Combate desativado',
      stopAll: 'Pare tudo',
      settings: 'Configurações',
      status: 'Status',
      help: 'Ajuda',
      open: 'Abrir',
      clearStart: 'Claro',
      setStart: 'Definir como selecionado',
      edit: 'Editar código',
      rename: 'Renomear',
      copy: 'Cópia',
      export: 'Exportar',
      remove: 'Remover',
      menu: 'Menu',
      wait: 'Espere',
      stealth: 'Furtividade',
      undo: 'Desfazer',
      save: 'Salvar',
      cancel: 'Cancelar',
      confirm: 'Sim, remova-o',
      startRoute: 'Iniciar rota',
      list: 'Listar rotas',
      calibrate: 'Calibrar',
    },
    prompts: {
      name: 'Nome da rota',
      code: 'Código da etapa',
      interval: 'Milissegundos por etapa (0 = padrão)',
      maxTokens: 'A maioria dos tokens de uma vez (0 = sem limite)',
      newName: 'Novo nome',
      route: 'Nome da rota',
    },
    route: {
      drawn: 'Rota desenhada, {points} pontos',
      recorded: 'Rota registrada, {points} pontos',
      area: 'Área de salto, {points} cantos',
      path: 'Caminho',
      mode: 'Modo',
      interval: 'Intervalo',
      maxTokens: 'A maioria dos tokens',
      randomStart: 'Início aleatório',
      walls: 'Paredes',
      start: 'Início fixo',
      tokens: 'Fichas',
    },
    record: {
      title: 'Gravando "{name}"',
      intro:
        'Gravando {token} (move até agora: {count}). Click the arrows, or drag the token on the map; cada movimento é registrado.',
    },
    settings: {
      interval: {
        label: 'Intervalo',
        desc: 'Milissegundos entre etapas. Cada rota pode substituí-la.',
      },
      movement: {
        label: 'Movimento',
        desc: 'a célula move uma célula por etapa; segmento move uma etapa inteira (como U3) de uma só vez, como fez a versão 4.',
      },
      facing: {
        label: 'Fichas de Turno',
        desc: 'Vire as fichas para onde elas estão indo: para fora, ou para a direção que a arte da ficha está voltada (para cima, para baixo, para a esquerda ou para a direita).',
      },
      combatDetection: {
        label: 'Detecção de Combate',
        desc: 'Como o combate é percebido: rastreador (o rastreador de turno está aberto com alguém nele), manual (os botões Ligar/Desligar Combate) ou ambos.',
      },
      combatBehaviour: {
        label: 'Comportamento de Combate',
        desc: 'O que as patrulhas fazem em combate: pausar, pisar (mover-se uma vez cada vez que passa o turno) ou ignorar (continuar em movimento).',
      },
      lockMode: {
        label: 'Modo de bloqueio',
        desc: 'Como Lock mantém um token: nativo (bloqueio de posição do próprio Roll20, para que ninguém possa arrastá-lo), reverter (os movimentos são desfeitos) ou congelar (ele para de patrulhar e seguir, mas ainda pode ser arrastado).',
      },
      lockMarker: {
        label: 'Marcador de bloqueio',
        desc: 'Marcador de status mostrado em tokens bloqueados ou nenhum. Os jogadores podem ver os marcadores.',
      },
      followMode: {
        label: 'Modo Seguir',
        desc: 'trilha: os seguidores caminham em fila indiana seguindo os passos do líder. formação: os seguidores mantêm seu lugar ao redor do líder (arraste um seguidor para mudar seu lugar).',
      },
      manualMove: {
        label: 'Arrastando uma patrulha',
        desc: 'Ao arrastar uma ficha de patrulha: continue (a rota continua de onde você a soltou) ou pare (a patrulha termina).',
      },
      stopMarkers: {
        label: 'Marcadores de parada',
        desc: 'Marcadores de status que desviam um token de sua rota e o impedem de segui-lo, separados por ponto e vírgula (por exemplo, morto; vermelho) ou nenhum. Seguidores de um líder com um desses marcadores também param.',
      },
      markerAction: {
        label: 'Parar ação do marcador',
        desc: 'O que uma ficha de patrulha faz quando recebe um Marcador de Parada: parar (permanece onde está) ou reiniciar (volta para onde começou).',
      },
      wallMode: {
        label: 'Paredes',
        desc: 'O que as patrulhas e os seguidores fazem em paredes de iluminação dinâmica e portas e janelas fechadas: ignorar (passar), segurar (esperar até que o caminho esteja livre, por exemplo, até que uma porta se abra) ou virar (as patrulhas voltam). Cada rota pode escolher a sua própria, então os fantasmas ainda podem atravessar paredes.',
      },
      wallCheck: {
        label: 'Verificação de parede',
        desc: 'centro: apenas o meio de uma ficha deve ficar longe das paredes. largura: o token inteiro o faz, portanto, um token grande não pode passar por uma lacuna estreita.',
      },
      oneWayWalls: {
        label: 'Paredes Unidirecionais',
        desc: 'Se as paredes unidirecionais param os tokens (bloquear) ou não (passar).',
      },
      transparentWalls: {
        label: 'Paredes transparentes',
        desc: 'Sejam paredes transparentes, que deixam passar luz, fichas de parada (bloqueio) ou não (passagem).',
      },
      buttonStep: {
        label: 'Células por clique',
        desc: 'A que distância as setas de gravação movem um token.',
      },
      language: {
        label: 'Linguagem',
        desc: 'Idioma para menus, mensagens e folhetos.',
      },
    },
    status: {
      routes: 'Rotas',
      patrols: 'Tokens de patrulha',
      followers: 'Seguindo tokens',
      locked: 'Tokens bloqueados',
      recordings: 'Gravações',
      paused: 'Pausado',
      combat: 'Combate',
      page: 'Página atual',
      grid: 'Grade',
      cell: 'Tamanho da célula',
      calibration: 'Calibração',
    },
    help: {
      menu: 'Mostre o cardápio.',
      start: 'Coloque os tokens selecionados em uma rota.',
      stop: 'Pare os tokens selecionados (patrulhas e seguimento), todos os tokens em uma rota ou todos.',
      reset: 'Retorne os tokens para onde eles começaram e pare-os.',
      pause: 'Pause ou retome cada patrulha.',
      lock: 'Segure os tokens selecionados no lugar ou solte-os.',
      leader: 'Escolha o token selecionado como o líder a seguir.',
      follow: 'Faça com que as fichas selecionadas sigam o líder ou uma ficha indicada pelo nome.',
      unfollow: 'Pare os tokens selecionados a seguir.',
      add: 'Crie uma rota a partir de um código de etapa, como U2R2D2L2.',
      edit: 'Altere o código de etapa de uma rota.',
      draw: 'Crie uma rota que siga o desenho selecionado nesta página.',
      bounce:
        'Crie uma rota na qual os tokens vagam dentro do desenho fechado selecionado, ricocheteando em suas bordas.',
      record: 'Grave uma rota movendo o token selecionado com botões ou arrastando-o.',
      route: 'Altere uma opção de rota: modo, intervalo, máximo, aleatório, paredes ou início.',
      show: 'Mostrar detalhes e botões de uma rota.',
      rename: 'Renomeie uma rota.',
      copy: 'Copie uma rota com um novo nome.',
      remove: 'Remover uma rota (pergunta primeiro).',
      ids: 'Aja nos tokens com esses IDs em vez dos selecionados, para que outros Mods, como ScriptCards, possam controlar os tokens. remove --ids tira os tokens de suas rotas; nunca remove uma rota.',
      list: 'Liste as rotas ou os tokens que estão sendo controlados.',
      examples: 'Adicione as rotas de exemplo.',
      export: 'Mostre rotas como texto para copiar em outro jogo.',
      import: 'Adicione rotas do texto de exportação.',
      combat: 'Ative ou desative o combate manualmente.',
      set: 'Altere uma configuração ou mostre todas as configurações.',
      calibrate:
        'Alinhe a grade com tokens encaixados nos centros das células ou remova a calibração.',
      status: 'Mostre o que o Mod está fazendo e como ele vê esta página.',
      journal: 'Reconstrua os folhetos da Ajuda e da Plataforma de Comando.',
      help: 'Mostre esta lista.',
      footer:
        'As instruções completas estão no folheto "{help}"; os botões estão em "{deck}". {legacy} ainda funciona com os comandos da versão 4.',
    },
    handout: {
      versionLabel: 'Versão',
      subtitle: 'Patrulhas, seguidores e bloqueios para jogos Jumpgate e Legacy',
      overview: {
        heading: 'Visão geral',
        body: 'TokenController move tokens para você. Dê a um guarda uma rota de patrulha, faça com que uma carroça siga seu motorista ou prenda uma estátua no lugar. As rotas podem ser digitadas como um código de etapa, traçadas a partir de um desenho no mapa ou registradas movendo um token. As rotas funcionam em páginas quadradas, hexadecimais, isométricas, dimétricas e sem grade.',
      },
      quickStart: {
        heading: 'Início rápido',
        steps: [
          'Abra o folheto do Command Deck ou digite !tokencontroller para o menu.',
          'Clique em Exemplos para adicionar algumas rotas prontas ou em Step Code para digitar as suas próprias (por exemplo, U2R2D2L2).',
          'Selecione um ou mais tokens e clique em Iniciar próximo a uma rota.',
          'Selecione um token e clique em Parar para interrompê-lo ou em Redefinir para enviá-lo de volta ao ponto de partida.',
        ],
      },
      routes: {
        heading: 'Fazendo rotas',
        points: [
          'Código da etapa: digite movimentos como U2R2D2L2. Os códigos não estão vinculados a um local no mapa, portanto, a mesma rota funciona em qualquer lugar.',
          'Do Desenho: desenhe uma linha, polígono, forma à mão livre, retângulo ou elipse com as ferramentas de desenho, selecione-o e clique em Do Desenho. Os tokens caminham ao longo dele, apenas nessa página. Você pode excluir o desenho posteriormente.',
          'Gravar: selecione um token e clique em Gravar. Mova-o com os botões de seta ou arraste-o no mapa (os waypoints Roll20 são seguidos) e clique em Salvar. Em grades quadradas, a gravação se torna um código de etapa que você pode editar.',
          'As rotas circulares recomeçam desde o início; rotas de ida e volta voltam pelo caminho de onde vieram; uma vez que as rotas param no final. Novas rotas que terminam onde iniciam o loop; outros vão e voltam.',
          'Área de salto: desenhe uma forma fechada ao redor da área, selecione-a e clique em Área de salto. Os tokens iniciados nele viajam em linhas retas e ricocheteiam em suas bordas (e nas paredes, a menos que a rota os ignore), girando um pouco aleatoriamente a cada vez. O início aleatório coloca cada ficha em uma célula aleatória da área.',
        ],
      },
      codes: {
        colCode: 'Código',
        colMeaning: 'Significado',
        move: 'Mova para cima, para baixo, para a esquerda ou para a direita, uma célula.',
        diagonal: 'Mova-se na diagonal.',
        distance: 'Um número após uma direção move esse número de células.',
        face: 'Vire-se para uma direção sem se mover (precisa de fichas de turno).',
        wait: 'Aguarde uma etapa ou o número determinado de etapas.',
        stealth:
          'Mova a ficha entre a camada de fichas e a camada GM, para que ela desapareça e reapareça.',
      },
      routeOptions: {
        heading: 'Opções de rota',
        colOption: 'Opção',
        colMeaning: 'Significado',
        mode: 'loop, pingue-pongue (para frente e para trás) ou uma vez.',
        interval: 'Milissegundos por etapa para esta rota ou 0 para o intervalo global.',
        max: 'O maior número de tokens que podem estar na rota de uma só vez, ou 0 sem limite.',
        random: 'on: cada token começa em um ponto aleatório ao longo da rota.',
        walls:
          'ignorar (atravessar paredes), segurar (esperar nas paredes e portas fechadas), virar (voltar) ou padrão (usar a configuração Paredes).',
        start:
          'set: os tokens saltam para a posição do token selecionado quando são iniciados. claro: eles começam onde estão.',
      },
      tokens: {
        heading: 'Controle de tokens',
        points: [
          'Um token está em uma rota por vez. Iniciá-lo em outra rota substitui a primeira.',
          'Stop deixa os tokens onde estão. Redefinir os coloca de volta onde estavam antes de começar, em sua camada original.',
          'Lock mantém um token no lugar. Os tokens bloqueados não patrulham nem seguem até serem desbloqueados.',
          'Seguir: selecione o líder e clique em Líder, depois selecione os seguidores e clique em Seguir. Você também pode digitar o nome do líder: !tokencontroller follow Goblin Boss. Os seguidores seguem os tokens que patrulham, os tokens que você arrasta e os tokens movidos pelo TokenMod.',
          'Os seguidores podem seguir outros seguidores, formando uma corrente ou coluna.',
          'Arrastar uma ficha de patrulha continua a patrulha de onde você a soltou, a menos que Arrastar uma Patrulha esteja definido para parar.',
          'Paredes: com a configuração Paredes ativada, patrulhas e seguidores não transitam por paredes com iluminação dinâmica ou portas e janelas fechadas; portas e janelas abertas os deixam passar. Dê a uma rota sua própria opção de paredes (por exemplo, ignorar um fantasma).',
          'Marcadores de parada: um token que recebe um desses marcadores de status (por exemplo, morto) sai de sua rota e para de seguir, e os seguidores de um líder que recebe uma parada também. Defina-os com !tokencontroller set stopMarkers dead;red. Isso também funciona quando outro Mod adiciona o marcador.',
        ],
      },
      grids: {
        heading: 'Grades',
        points: [
          'O tamanho da célula e o tipo de grade são lidos em cada página, portanto, páginas diferentes podem usar grades diferentes.',
          'U e D sempre significam para cima e para baixo na tela. Em grades hexadecimais, movimentos sem zigue-zague vizinho correspondente; em grades isométricas e dimétricas, as diagonais cruzam um losango.',
          'As páginas com o ajuste desativado se movem em etapas de 70 pixels sem se alinharem a uma grade.',
          'Se os tokens saírem da grade, encaixe um token no centro da célula, selecione-o e clique em Calibrar. Selecione dois tokens nas células vizinhas de uma linha para corrigir também o tamanho da célula.',
        ],
      },
      combat: {
        heading: 'Combate',
        points: [
          'A Detecção de Combate escolhe como o combate é notado: o rastreador de turno, os botões Ligar/Desligar Combate ou ambos.',
          'O Comportamento de Combate escolhe o que as patrulhas fazem: pausar, dar um passo cada vez que o turno passa ou continuar em movimento.',
          'Pausar tudo interrompe todas as patrulhas a qualquer momento; Retomar os inicia novamente.',
        ],
      },
      commands: {
        heading: 'Comandos',
        intro:
          'Somente GMs podem usar esses comandos. As rotas podem ser nomeadas ou referenciadas por seu #id nos botões do menu. Coloque nomes com espaços entre “aspas” quando um comando leva dois nomes.',
        mods: 'Outros Mods também podem enviar esses comandos, por exemplo, de ScriptCards. Eles não podem selecionar tokens, então eles os nomeiam com --ids seguido por IDs de token separados por ponto e vírgula: !tc stop --ids ID1;ID2. As respostas vão para o GM.',
        colCommand: 'Comando',
        colDesc: 'O que isso faz',
      },
      settings: {
        heading: 'Configurações',
        intro:
          'Altere as configurações no menu, com !tokencontroller set <setting> <value>, ou na página Mod settings na tela API Scripts.',
        colKey: 'Chave',
        colName: 'Contexto',
        colDesc: 'Descrição',
      },
      upgrading: {
        heading: 'Atualizando da versão 4',
        points: [
          'Caminhos, fichas de patrulha, bloqueios, seguidores e rascunhos inacabados são mantidos. Os rascunhos tornam-se rotas que terminam em "(rascunho)".',
          'Suas configurações da versão 4 são mantidas: intervalo, subetapas, rotação, patrulha de combate e unidades por clique.',
          'Os comandos !tc e !token-control e as macros T-Cntrl_ continuam funcionando. A tabela mostra os novos comandos.',
          'A versão 4 enviava o menu completo após cada ação; a versão 5 envia uma resposta curta.',
          'A configuração Pixels Per Unit desapareceu: o tamanho da célula vem de cada página. O HTML Builder não é mais necessário.',
          'O antigo folheto do Guia de Uso, que todos os jogadores podiam ver, foi substituído por este folheto exclusivo para GM.',
        ],
        colV4: 'Versão 4',
        colV5: 'Versão 5',
      },
      troubleshooting: {
        heading: 'Solução de problemas',
        points: [
          'Os tokens não se movem: verifique o status. As patrulhas esperam enquanto estão em pausa, enquanto estão bloqueadas e em combate quando o Comportamento de Combate está em pausa.',
          'Os tokens se movem na distância errada: o tamanho da grade ou o ajuste da página podem ter mudado; tente Calibrar.',
          'Uma rota desenhada não será iniciada: as rotas desenhadas só funcionam na página em que foram desenhadas.',
          'Os seguidores não se movem quando outro Mod move o líder: apenas o TokenMod relata seus movimentos. Outros Mods podem chamar TokenController.ObserveTokenChange.',
          'Relate problemas no fórum Roll20 com quaisquer mensagens do console da API.',
        ],
      },
      languages: {
        heading: 'Idiomas',
        body: 'TokenController é traduzido para os idiomas abaixo. Escolha um com a configuração de idioma.',
        colCode: 'Código',
        colName: 'Linguagem',
        colNative: 'Nome nativo',
      },
      credits: {
        heading: 'Créditos',
        original: 'Mod original por',
        maintainer: 'Versão 5 mantida por',
        support: 'Relate bugs e ideias no fórum Roll20 Mod ou no GitHub.',
      },
      footer: 'Os botões para cada ação estão no folheto "{deck}".',
    },
    deck: {
      subtitle: 'Convés de Comando',
      patrolsDesc: 'Iniciar, parar e pausar patrulhas. Selecione os tokens primeiro.',
      createDesc: 'Faça rotas a partir de um código de passo, um desenho ou registrando um token.',
      selectedDesc: 'Bloqueie tokens ou faça-os seguir um líder.',
      toolsDesc: 'Combate, configurações e ferramentas de grade.',
      footer: 'As instruções completas estão no folheto "{help}".',
    },
  };

  const TRANSLATION$4 = {
    titles: {
      ready: 'Токенконтроллер готов.',
      settings: 'Настройки токенаконтроллера',
      help: 'Команды контроллера токена',
      export: 'Экспорт маршрута',
      routes: 'Маршруты',
      tokens: 'Контролируемые токены',
      status: 'Статус токенаконтроллера',
    },
    messages: {
      migrated:
        'Обновлено с версии 4. Сохранены маршруты: {routes}. Сохранены жетоны патрулирования: {patrols}. Ваши старые макросы и команды !tc все еще работают.',
      removedGuide:
        'Старый раздаточный материал «Руководство по использованию TokenController», который могли видеть игроки, был заменен раздаточным материалом справки, предназначенным только для GM.',
      pruned: 'Патрули забыты, поскольку их жетонов больше не существует: {count}.',
      readyHint: 'Введите !tokencontroller в меню или откройте раздаточный материал Command Deck.',
      combatStarted: {
        pause: 'Бой начался: патрулирование приостановлено до его окончания.',
        step: 'Бой начался: патрули каждый ход передвигаются на один шаг.',
      },
      combatEnded: 'Бой окончен: патрули продолжаются.',
      routeAdded: 'Добавлен маршрут «{name}» ({mode}).',
      routeUpdated:
        'Маршрут «{name}» обновлен. Жетоны на нем продолжают движение по новому маршруту.',
      confirmRemove: 'Удалить маршрут "{name}"? Токены на нем, которые остановятся: {count}.',
      routeRemoved: 'Маршрут «{name}» удален. Токены остановлены: {count}.',
      routeRenamed: 'Маршрут «{from}» переименован в «{to}».',
      examplesAdded: 'Добавлены примеры маршрутов: {count}.',
      exportHint: 'Скопируйте текст ниже и вставьте его после {command} в любой игре.',
      imported:
        'Импортированы маршруты {added}; пропущен {skipped} (имя уже использовано или недействительно).',
      started: '{tokens} началось в "{name}".',
      stopped: 'Токены остановлены: {count}.',
      reset: 'Токены вернулись туда, где они были изначально: {count}.',
      locked: 'Заблокировано: {tokens} ({mode}).',
      unlocked: 'Разблокировано: {tokens}.',
      leaderSet: '{token} является лидером. Выберите подписчиков и нажмите «Подписаться».',
      following: 'Сейчас подписан на {leader} ({mode}): {tokens}.',
      unfollowed: 'Токены больше не следуют: {count}.',
      noRecordings: 'Ничего не записывается.',
      recordingCancelled: 'Запись "{name}" отменена.',
      languages: 'Поддерживаемые языки: {list}.',
      settingChanged: '{setting} теперь {value}.',
      combatOn: 'Включен бой.',
      combatOff: 'Боевые действия отключены.',
      calibrationCleared: 'Калибровка сетки удалена с этой страницы.',
      calibrated: 'Сетка откалибрована для этой страницы (размер ячейки × {scale}).',
      paused: 'Все патрули остановились.',
      resumed: 'Патрули возобновились.',
      journalRebuilt: 'Перестроены раздаточные материалы: {help} и {deck}.',
      markerStopped: 'Остановлен маркером остановки: {tokens}.',
      markerReset: 'Отправляется обратно туда, где они начали, с помощью стоп-маркера: {tokens}.',
    },
    errors: {
      noTokens: 'Токены не выбраны.',
      noRouteName: 'Название маршрута не указано.',
      routeNotFound: 'Маршрута с названием "{name}" не существует.',
      routeExists: 'Маршрут под названием "{name}" уже существует.',
      code: {
        empty: 'Код шага пуст.',
        badToken: 'Код шага «{code}» содержит что-то непонятное в «{at}».',
        tooFar: 'Шаг «{at}» слишком длинный.',
      },
      routeInvalid: 'Этот маршрут не удалось сохранить.',
      usageAdd: 'Дайте имя и код шага.',
      usageEdit: 'Дайте маршрут и новый код шага.',
      selectOneDrawing:
        'Выберите ровно один рисунок (линию, многоугольник, фигуру, нарисованную от руки, прямоугольник или эллипс).',
      drawingEmpty: 'В выбранном чертеже слишком мало точек для отслеживания.',
      usageRoute: 'Укажите маршрут, опцию и значение.',
      unknownRouteOption: 'Опция маршрута «{option}» отсутствует.',
      selectOneToken: 'Выберите ровно один жетон.',
      badRouteValue: '«{value}» не является допустимым значением для {option}.',
      usageRename: 'Дайте маршрут и его новое имя.',
      usageCopy: 'Укажите маршрут и имя копии.',
      badJson: 'Это не текст экспорта маршрута.',
      tokenLocked: '{tokens} не может запуститься: заблокировано.',
      tokenMarked: '{tokens} не может запуститься: у него есть маркер остановки.',
      outsideArea: '{tokens} не может запуститься: они находятся за пределами "{name}".',
      selectOneArea:
        'Выберите ровно один замкнутый рисунок (многоугольник, прямоугольник, эллипс или контур от руки).',
      areaTooSmall: 'Выбранному рисунку необходимо как минимум три угла, чтобы составить площадь.',
      idsNotFound: 'Ни один токен не имеет таких идентификаторов: {ids}.',
      routeOnOtherPage: '{tokens} не может начаться: «{name}» было нарисовано на другой странице.',
      startOnOtherPage:
        '{tokens} не может начаться: фиксированное начало «{name}» находится на другой странице.',
      routeFull: '{tokens} не может запуститься: у «{name}» уже есть {max} токенов.',
      noPage: 'Страница не найдена.',
      emptyTrack: '{tokens} не может начаться: у «{name}» нет ходов.',
      leaderNotFound: 'На этой странице не найден токен с именем «{name}».',
      noLeader: 'Лидера пока нет.',
      followLoop: '{tokens} не может следовать за токеном, который следует за ним.',
      alreadyRecording: '{token} уже записывается.',
      recordingTokenGone: 'Токен для записи «{name}» больше не существует.',
      recordingEmpty: 'Еще ничего не записано.',
      unknownSetting: 'Нет настройки под названием «{key}».',
      badSettingValue: '«{value}» не является допустимым значением для {key}.',
      calibrateNeedsTokens: 'Выберите один или два жетона, привязанных к центрам ячеек.',
      calibrateFailed: 'Выбранные токены не могут быть использованы для калибровки сетки.',
      unknownCommand: 'Неизвестная команда «{command}».',
      gmOnly: 'Только GM может использовать TokenController.',
      internal: 'Что-то пошло не так. Подробности в консоли API.',
    },
    hints: {
      noTokens: 'Сначала выберите жетоны на карте.',
      noRouteName: 'Например: !tokencontroller добавить Guard Walk U2R2D2L2',
      routeNotFound: 'Введите !tokencontroller list, чтобы просмотреть все маршруты.',
      code: {
        empty: 'Например: U2R2D2L2',
        badToken:
          'Используйте U, D, L, R, UL, UR, DL или DR с несколькими ячейками: W для ожидания и S для скрытности.',
        tooFar: 'Один шаг может содержать не более 100 ячеек; ждет не более 100 тиков.',
      },
      selectOneDrawing:
        'Нарисуйте маршрут с помощью инструмента рисования, выберите его (перетащите рамку вокруг тонкого контура, если щелчок не промахнулся), затем повторите попытку.',
      usageRoute: 'Опции: режим, интервал, максимум, случайный, стены, старт.',
      routeOnOtherPage:
        'Нарисованные маршруты работают только на той странице, на которой они были нарисованы.',
      startOnOtherPage:
        'Очистите фиксированное начало или сначала переместите токен на эту страницу.',
      noLeader:
        'Выберите лидера и нажмите «Лидер» или укажите его имя: !tokencontroller Follow Name',
      leaderNotFound:
        'Используйте имя токена точно так, как показано на карте, или его идентификатор токена.',
      badJson: 'Вставьте текст из экспорта !tokencontroller (или пути экспорта v4).',
      unknownSetting: 'Введите !tokencontroller set, чтобы увидеть все настройки.',
      calibrateNeedsTokens:
        'Один жетон выравнивает сетку; два токена в соседних ячейках строки также фиксируют размер ячейки.',
      calibrateFailed:
        'Убедитесь, что жетоны находятся в соседних ячейках одной строки (столбец на страницах Hex (H)).',
      unknownCommand: 'Введите !tokencontroller help для получения списка команд.',
      tokenLocked: 'Сначала разблокируйте токен.',
      tokenMarked: 'Удалите маркер или измените настройку «Стоп-маркеры».',
      outsideArea:
        'Сначала переместите жетоны внутри области или включите случайное начало маршрута.',
      selectOneArea:
        'Нарисуйте область с помощью инструмента рисования, выберите ее (перетащите рамку вокруг тонкого контура, если щелчок не попал в нее), затем повторите попытку.',
      idsNotFound: 'Укажите идентификаторы токенов после --ids, разделенные точкой с запятой.',
    },
    warnings: {
      idsNotFound:
        'Ни один токен не имеет таких идентификаторов, поэтому они были пропущены: {ids}.',
      offPage: 'Часть маршрута выходит за пределы страницы (шаги: {count}). Эти шаги пропускаются.',
      combatTrackerOnly:
        'Обнаружение боя настроено на отслеживание поворотов, поэтому этот переключатель не будет действовать, пока вы его не измените.',
      unitPx:
        'Версия 5 считывает размер ячейки с каждой страницы, поэтому старая настройка «Пикселей на единицу» больше не используется. Если токены не совпадают, используйте !tokencontroller калибровать.',
    },
    values: {
      on: 'На',
      off: 'Выключенный',
      none: 'Никто',
      default: 'По умолчанию',
      noLimit: 'Без ограничений',
      ms: '{ms} мс',
      andMore: 'и еще {count}',
      following: 'подписка на {leader}',
      locked: 'заперто',
      gridless: 'без щелчков',
      grid: {
        square: 'Квадрат',
        hex: 'Шестигранник',
        iso: 'Изометрический/Диметрический',
      },
      mode: {
        loop: 'Петля',
        pingpong: 'Взад и вперед',
        once: 'Один раз',
      },
      movement: {
        cell: 'Одна ячейка за раз',
        segment: 'Целый шаг за раз',
      },
      facing: {
        off: 'Не поворачивайся',
        up: 'Искусство лицом вверх',
        down: 'Искусство обращено вниз',
        left: 'Художественные лица остались',
        right: 'Искусство смотрит вправо',
      },
      combatDetection: {
        tracker: 'Трекер поворотов',
        manual: 'переключатель ГМ',
        both: 'Поверните трекер или переключатель GM',
      },
      combatBehaviour: {
        pause: 'Пауза',
        step: 'Двигайтесь каждый ход',
        ignore: 'Продолжайте двигаться',
      },
      lockMode: {
        native: 'Блокировка положения Roll20',
        revert: 'Отменить ходы',
        freeze: 'Только держись спокойно',
      },
      followMode: {
        trail: 'Один файл',
        formation: 'Формирование',
      },
      manualMove: {
        continue: 'Продолжайте оттуда',
        stop: 'Остановить патруль',
      },
      markerAction: {
        stop: 'Остановись там, где это',
        reset: 'Вернуться к началу',
      },
      wallMode: {
        ignore: 'Пройти сквозь стены',
        hold: 'Жди у стен',
        turn: 'Повернуться назад у стен',
      },
      wallCheck: {
        centre: 'Центр токена',
        width: 'Целый токен',
      },
      oneWayWalls: {
        block: 'Блокировать',
        pass: 'Пропустить',
      },
      transparentWalls: {
        block: 'Блокировать',
        pass: 'Пропустить',
      },
    },
    menu: {
      statusRunning: 'Жетоны патрулирования: {patrols}. Маршруты: {routes}.',
      statusPaused: 'Все патрули приостановлены.',
      statusCombat: {
        pause: 'В бою: патрулирование приостановлено.',
        step: 'В бою: патрули перемещаются каждый ход.',
      },
      routes: 'Маршруты',
      noRoutes:
        'Маршрутов пока нет. Добавьте один, нарисуйте один, запишите один или добавьте примеры.',
      create: 'Новый маршрут',
      selected: 'Выбранные токены',
      tools: 'Инструменты',
      recordings: 'Записи',
      patrols: 'Патрули',
    },
    buttons: {
      start: 'Начинать',
      stop: 'Останавливаться',
      add: 'Код шага',
      draw: 'Из рисунка',
      bounce: 'Область отскока',
      record: 'Записывать',
      examples: 'Примеры',
      reset: 'Перезагрузить',
      lock: 'Замок',
      unlock: 'Разблокировать',
      leader: 'Лидер',
      follow: 'Следовать',
      unfollow: 'Отписаться',
      resume: 'Возобновить',
      pause: 'Приостановить все',
      combatOn: 'Бой включен',
      combatOff: 'Бой выключен',
      stopAll: 'Остановить все',
      settings: 'Настройки',
      status: 'Статус',
      help: 'Помощь',
      open: 'Открыть',
      clearStart: 'Прозрачный',
      setStart: 'Установить выбранное',
      edit: 'Редактировать код',
      rename: 'Переименовать',
      copy: 'Копировать',
      export: 'Экспорт',
      remove: 'Удалять',
      menu: 'Меню',
      wait: 'Ждать',
      stealth: 'Скрытность',
      undo: 'Отменить',
      save: 'Сохранять',
      cancel: 'Отмена',
      confirm: 'Да, удалить',
      startRoute: 'Начать маршрут',
      list: 'Получение списка маршрутов',
      calibrate: 'Калибровка',
    },
    prompts: {
      name: 'Название маршрута',
      code: 'Код шага',
      interval: 'Миллисекунды на шаг (0 = по умолчанию)',
      maxTokens: 'Максимальное количество токенов одновременно (0 = без ограничений)',
      newName: 'Новое имя',
      route: 'Название маршрута',
    },
    route: {
      drawn: 'Нарисован маршрут, {points} баллов',
      recorded: 'Записанный маршрут, {points} баллов',
      area: 'Зона отскока, {points} углов',
      path: 'Путь',
      mode: 'Режим',
      interval: 'Интервал',
      maxTokens: 'Большинство токенов',
      randomStart: 'Случайный старт',
      walls: 'Стены',
      start: 'Фиксированный старт',
      tokens: 'Токены',
    },
    record: {
      title: 'Запись "{name}"',
      intro:
        'Запись {token} (на данный момент перемещено: {count}). Нажимайте стрелки или перетащите маркер на карту; каждое движение записывается.',
    },
    settings: {
      interval: {
        label: 'Интервал',
        desc: 'Миллисекунды между шагами. Каждый маршрут может его переопределить.',
      },
      movement: {
        label: 'Движение',
        desc: 'ячейка перемещается на одну ячейку за шаг; сегмент перемещается на целый шаг (например, U3), как это было в версии 4.',
      },
      facing: {
        label: 'Жетоны хода',
        desc: 'Поверните жетоны лицом туда, куда они направляются: в сторону или в ту сторону, куда обращено изображение жетона (вверх, вниз, влево или вправо).',
      },
      combatDetection: {
        label: 'Боевое обнаружение',
        desc: 'Как замечен бой: трекерный (трекер хода открыт, в нем кто-то есть), ручной (кнопки включения/выключения боя) или и то, и другое.',
      },
      combatBehaviour: {
        label: 'Боевое поведение',
        desc: 'Что патрули делают в бою: делают паузу, шагают (двигаются один раз при каждом прохождении хода) или игнорируют (продолжают двигаться).',
      },
      lockMode: {
        label: 'Режим блокировки',
        desc: 'Как Lock удерживает токен: собственный (собственная блокировка позиции Roll20, поэтому никто не может его перетаскивать), возврат (движения отменяются) или заморозка (он прекращает патрулирование и отслеживание, но его все равно можно перетаскивать).',
      },
      lockMarker: {
        label: 'Маркер блокировки',
        desc: 'Маркер статуса отображается на заблокированных жетонах или отсутствует. Игроки могут видеть маркеры.',
      },
      followMode: {
        label: 'Режим следования',
        desc: 'след: последователи идут гуськом по следам лидера. формирование: последователи сохраняют свое место вокруг лидера (перетащите последователя, чтобы изменить его место).',
      },
      manualMove: {
        label: 'Перетаскивание патруля',
        desc: 'Когда вы перетаскиваете жетон патрулирования: продолжайте (маршрут продолжается с того места, где вы его бросили) или остановитесь (патрулирование заканчивается).',
      },
      stopMarkers: {
        label: 'Стоп-маркеры',
        desc: 'Маркеры состояния, которые сбивают токен с его маршрута и останавливают его, разделяются точкой с запятой (например, мертвый;красный) или отсутствуют. Последователи лидера с одним из этих маркеров тоже останавливаются.',
      },
      markerAction: {
        label: 'Остановить действие маркера',
        desc: 'Что делает жетон патрулирования, когда получает маркер остановки: останавливается (остается на месте) или сбрасывается (возвращается к тому месту, где начал).',
      },
      wallMode: {
        label: 'Стены',
        desc: 'Что делают патрули и сопровождающие при динамическом освещении стен и закрытых дверях и окнах: игнорировать (проходить), удерживать (ждать, пока не освободится путь, например, пока не откроется дверь) или поворачивать (патрули поворачивают назад). Каждый маршрут может выбирать свой, поэтому призраки по-прежнему могут проходить сквозь стены.',
      },
      wallCheck: {
        label: 'Проверка стены',
        desc: 'центр: только середина жетона должна оставаться подальше от стен. ширина: весь токен имеет такую ширину, поэтому большой токен не может протиснуться в узкий зазор.',
      },
      oneWayWalls: {
        label: 'Односторонние стены',
        desc: 'Останавливают ли односторонние стены жетоны (блокируют) или нет (проходят).',
      },
      transparentWalls: {
        label: 'Прозрачные стены',
        desc: 'Независимо от того, пропускают ли свет прозрачные стены, останавливают жетоны (блокируют) или нет (проходят).',
      },
      buttonStep: {
        label: 'Ячейок на клик',
        desc: 'Насколько далеко стрелки записи перемещают фишку.',
      },
      language: {
        label: 'Язык',
        desc: 'Язык меню, сообщений и раздаточных материалов.',
      },
    },
    status: {
      routes: 'Маршруты',
      patrols: 'Жетоны патрулирования',
      followers: 'Следующие токены',
      locked: 'Заблокированные токены',
      recordings: 'Записи',
      paused: 'Приостановлено',
      combat: 'Бой',
      page: 'Текущая страница',
      grid: 'Сетка',
      cell: 'Размер ячейки',
      calibration: 'Калибровка',
    },
    help: {
      menu: 'Покажите меню.',
      start: 'Поместите выбранные жетоны на маршрут.',
      stop: 'Остановите выбранные маркеры (патрули и сопровождающие), каждый маркер на маршруте или все.',
      reset: 'Верните жетоны туда, откуда они начали, и остановите их.',
      pause: 'Приостанавливайте или возобновляйте каждое патрулирование.',
      lock: 'Удерживайте выбранные жетоны на месте или отпустите их.',
      leader: 'Выберите выбранный токен в качестве лидера, которому нужно следовать.',
      follow:
        'Сделайте так, чтобы выбранные жетоны следовали за лидером или за жетоном, данным по имени.',
      unfollow: 'Остановить выбранные токены.',
      add: 'Создайте маршрут из кода шага, например U2R2D2L2.',
      edit: 'Измените код шага маршрута.',
      draw: 'Создайте маршрут, следующий за выбранным рисунком на этой странице.',
      bounce:
        'Создайте маршрут, по которому жетоны бродят внутри выбранного замкнутого рисунка, отскакивая от его краев.',
      record: 'Запишите маршрут, перемещая выбранный жетон кнопками или перетаскивая его.',
      route: 'Измените вариант маршрута: режим, интервал, максимум, случайный, стены или начало.',
      show: 'Отображение сведений о маршруте и кнопок.',
      rename: 'Переименуйте маршрут.',
      copy: 'Скопируйте маршрут под новым именем.',
      remove: 'Удалить маршрут (сначала спрашивает).',
      ids: 'Действуйте на токены с этими идентификаторами вместо выбранных, чтобы другие моды, такие как ScriptCards, могли управлять токенами. удаление --ids убирает токены с их маршрутов; он никогда не удаляет маршрут.',
      list: 'Перечислите маршруты или контролируемые токены.',
      examples: 'Добавьте примеры маршрутов.',
      export: 'Покажите маршруты в виде текста для копирования в другую игру.',
      import: 'Добавьте маршруты из текста экспорта.',
      combat: 'Включайте и выключайте бой вручную.',
      set: 'Измените настройку или отобразите все настройки.',
      calibrate:
        'Выровняйте сетку с помощью жетонов, привязанных к центрам ячеек, или удалите калибровку.',
      status: 'Покажите, что делает Мод и как он видит эту страницу.',
      journal: 'Восстановите раздаточные материалы «Помощь» и «Командная колода».',
      help: 'Покажите этот список.',
      footer:
        'Полные инструкции находятся в раздаточном материале «{help}»; кнопки находятся в «{deck}». {legacy} по-прежнему работает с командами версии 4.',
    },
    handout: {
      versionLabel: 'Версия',
      subtitle: 'Патрули, компаньоны и замки для игр Jumpgate и Legacy.',
      overview: {
        heading: 'Обзор',
        body: 'TokenController перемещает токены за вас. Укажите охраннику маршрут патрулирования, заставьте тележку следовать за водителем или зафиксируйте статую на месте. Маршруты можно вводить в виде пошагового кода, чертить по рисунку на карте или записывать путем перемещения маркера. Маршруты работают на квадратных, шестигранных, изометрических, диметрических страницах и страницах без сетки.',
      },
      quickStart: {
        heading: 'Быстрый старт',
        steps: [
          'Откройте раздаточный материал Command Deck или введите !tokencontroller в меню.',
          'Нажмите «Примеры», чтобы добавить готовые маршруты, или «Код шага», чтобы ввести свой собственный (например, U2R2D2L2).',
          'Выберите один или несколько жетонов и нажмите «Начать» рядом с маршрутом.',
          'Выберите токен и нажмите «Стоп», чтобы остановить его, или «Сбросить», чтобы отправить его обратно туда, где он начался.',
        ],
      },
      routes: {
        heading: 'Создание маршрутов',
        points: [
          'Код шага: введите ходы, например U2R2D2L2. Коды не привязаны к месту на карте, поэтому один и тот же маршрут работает где угодно.',
          'Из рисунка: нарисуйте линию, многоугольник, фигуру от руки, прямоугольник или эллипс с помощью инструментов рисования, выберите его и нажмите «Из рисунка». Токены ходят по нему, только на этой странице. После этого рисунок можно удалить.',
          'Запись: выберите токен и нажмите «Запись». Переместите его с помощью кнопок со стрелками или перетащите на карту (следуют путевые точки Roll20), затем нажмите «Сохранить». В квадратных сетках запись становится кодом шага, который вы можете редактировать.',
          'Кольцевые маршруты начинаются снова с самого начала; маршруты туда и обратно возвращаются туда, откуда пришли; как только маршруты останавливаются в конце. Новые маршруты, которые заканчиваются там, где они начинаются; другие ходят туда и обратно.',
          'Область отскока: нарисуйте замкнутую фигуру вокруг области, выберите ее и нажмите «Область отскока». Жетоны, находящиеся на нем, перемещаются по прямым линиям и отскакивают от его краев (и от стен, если только маршрут их не игнорирует), каждый раз поворачиваясь немного случайным образом. Случайный старт помещает каждый жетон в случайную ячейку области.',
        ],
      },
      codes: {
        colCode: 'Код',
        colMeaning: 'Значение',
        move: 'Перемещение вверх, вниз, влево или вправо на одну ячейку.',
        diagonal: 'Двигайтесь по диагонали.',
        distance: 'Число после направления перемещает такое количество ячеек.',
        face: 'Повернитесь лицом в направлении, не двигаясь (нужны жетоны хода).',
        wait: 'Подождите один шаг или заданное количество шагов.',
        stealth:
          'Переместите токен между слоем токена и слоем GM, чтобы он исчез и появился снова.',
      },
      routeOptions: {
        heading: 'Варианты маршрута',
        colOption: 'Вариант',
        colMeaning: 'Значение',
        mode: 'цикл, пинг-понг (туда-сюда) или один раз.',
        interval: 'Миллисекунды на шаг для этого маршрута или 0 для глобального интервала.',
        max: 'Максимальное количество жетонов, которые могут находиться на маршруте одновременно, или 0 без ограничений.',
        random: 'включено: каждый токен начинается в случайной точке маршрута.',
        walls:
          'игнорировать (пройти сквозь стены), удерживать (подождать у стен и закрытых дверей), повернуть (повернуть назад) или по умолчанию (использовать настройку «Стены»).',
        start:
          'set: токены при запуске переходят на позицию выбранного токена. ясно: они начинаются там, где стоят.',
      },
      tokens: {
        heading: 'Управление токенами',
        points: [
          'Токен одновременно находится на одном маршруте. Запуск по другому маршруту заменяет первый.',
          'Стоп оставляет жетоны там, где они есть. Сброс возвращает их туда, где они были до начала, на исходный слой.',
          'Замок удерживает токен на месте. Заблокированные жетоны не патрулируют и не следуют, пока не разблокируются.',
          'Следовать: выберите лидера и нажмите «Лидер», затем выберите последователей и нажмите «Следовать». Вы также можете ввести имя лидера: !tokencontroller Follow Goblin Boss. Последователи следуют за токенами, которые патрулируют, жетонами, которые вы перетаскиваете, и жетонами, перемещаемыми TokenMod.',
          'Подписчики могут подписываться на других подписчиков, образуя цепочку или столбец.',
          'При перетаскивании жетона патрулирования патруль продолжается с того места, где вы его бросили, если только перетаскивание патруля не установлено на остановку.',
          'Стены: при включенной настройке «Стены» патрули и сопровождающие не проходят через стены с динамическим освещением или закрытые двери и окна; открытые двери и окна пропускали их. Предоставьте маршруту возможность иметь собственные стены (например, игнорировать призрака).',
          'Маркеры остановки: жетон, получивший один из этих маркеров статуса (например, мертвый), покидает свой маршрут и перестает следовать, а последователи лидера, получившего одну остановку, тоже останавливаются. Установите их с помощью !tokencontroller set stopMarkers Dead;red. Это также работает, когда другой мод добавляет маркер.',
        ],
      },
      grids: {
        heading: 'Сетки',
        points: [
          'Размер ячейки и тип сетки считываются с каждой страницы, поэтому на разных страницах могут использоваться разные сетки.',
          'U и D всегда означают верх и низ экрана. В шестигранных сетках движение осуществляется без совпадающего зигзагообразного соседа; на изометрической и диметрической сетках диагонали пересекают один ромб.',
          'Страницы с отключенной привязкой перемещаются с шагом 70 пикселей без выравнивания по сетке.',
          'Если жетоны выходят за пределы сетки, привяжите жетон к центру ячейки, выберите его и нажмите «Калибровать». Выберите два токена в соседних ячейках строки, чтобы также зафиксировать размер ячейки.',
        ],
      },
      combat: {
        heading: 'Бой',
        points: [
          'Функция «Обнаружение боя» выбирает способ отслеживания боя: трекер поворотов, кнопки включения/выключения боя или и то, и другое.',
          'Боевое поведение выбирает, что будут делать патрули: останавливаться, двигаться на один шаг каждый раз, когда проходит ход, или продолжать движение.',
          '«Пауза все» останавливает каждый патруль в любой момент; Резюме запускает их снова.',
        ],
      },
      commands: {
        heading: 'Команды',
        intro:
          'Только GM могут использовать эти команды. Маршрутам можно давать имена или ссылаться на них по #id с помощью кнопок меню. Заключайте имена через пробелы в «кавычки», если команда принимает два имени.',
        mods: 'Другие моды тоже могут отправлять эти команды, например, из ScriptCards. Они не могут выбирать токены, поэтому называют их с помощью --ids, за которым следуют идентификаторы токенов, разделенные точкой с запятой: !tc stop --ids ID1;ID2. Ответы отправляются GM.',
        colCommand: 'Команда',
        colDesc: 'Что он делает',
      },
      settings: {
        heading: 'Настройки',
        intro:
          'Измените настройки из меню, установив !tokencontroller <настройка> <значение>, или на странице настроек мода на экране сценариев API.',
        colKey: 'Ключ',
        colName: 'Параметр',
        colDesc: 'Описание',
      },
      upgrading: {
        heading: 'Обновление с версии 4',
        points: [
          'Пути, жетоны патрулирования, замки, последователи и незавершенные чертежи сохраняются. Черновики становятся маршрутами, оканчивающимися на «(черновик)».',
          'Сохраняются ваши настройки версии 4: интервал, подшаги, ротация, боевой патруль и юнитов на клик.',
          'Команды !tc и !token-control и макросы T-Cntrl_ продолжают работать. В таблице показаны новые команды.',
          'Версия 4 отправляла все меню после каждого действия; версия 5 вместо этого отправляет короткий ответ.',
          'Настройка «Пикселей на единицу» исчезла: размер ячейки зависит от каждой страницы. HTML Builder больше не нужен.',
          'Старый раздаточный материал «Руководство по использованию», который мог видеть каждый игрок, заменен этим раздаточным материалом, предназначенным только для GM.',
        ],
        colV4: 'Версия 4',
        colV5: 'Версия 5',
      },
      troubleshooting: {
        heading: 'Поиск неисправностей',
        points: [
          'Токены не перемещаются: проверьте Статус. Патрули ждут во время паузы, в запертом состоянии и в бою, когда боевое поведение находится на паузе.',
          'Токены перемещаются на неправильное расстояние: возможно, изменился размер сетки или привязка страницы; попробуйте откалибровать.',
          'Нарисованный маршрут не запускается: нарисованные маршруты работают только на той странице, на которой они были нарисованы.',
          'Последователи не перемещаются, когда другой мод перемещает лидера: только TokenMod сообщает о его перемещениях. Другие моды могут вызывать TokenController.ObserveTokenChange.',
          'Сообщайте о проблемах на форуме Roll20 с помощью любых сообщений из консоли API.',
        ],
      },
      languages: {
        heading: 'Языки',
        body: 'TokenController переведен на языки, указанные ниже. Выберите один с настройкой «Язык».',
        colCode: 'Код',
        colName: 'Язык',
        colNative: 'Родное имя',
      },
      credits: {
        heading: 'Кредиты',
        original: 'Оригинальный мод от',
        maintainer: 'Версия 5 поддерживается',
        support: 'Сообщайте об ошибках и идеях на форуме Roll20 Mod или на GitHub.',
      },
      footer: 'Кнопки для каждого действия находятся в раздаточном материале «{deck}».',
    },
    deck: {
      subtitle: 'Командная колода',
      patrolsDesc:
        'Начинайте, останавливайте и приостанавливайте патрулирование. Сначала выберите жетоны.',
      createDesc: 'Прокладывайте маршруты по пошаговому коду, рисунку или записи жетона.',
      selectedDesc: 'Заблокируйте жетоны или заставьте их следовать за лидером.',
      toolsDesc: 'Бой, настройки и инструменты сетки.',
      footer: 'Полные инструкции приведены в раздаточном материале «{help}».',
    },
  };

  const TRANSLATION$3 = {
    titles: {
      ready: 'TokenController está listo.',
      settings: 'Configuración del controlador de token',
      help: 'Comandos del controlador de token',
      export: 'Exportación de ruta',
      routes: 'Rutas',
      tokens: 'Fichas controladas',
      status: 'Estado del controlador de token',
    },
    messages: {
      migrated:
        'Actualizado desde la versión 4. Rutas mantenidas: {routes}. Fichas de patrullaje guardadas: {patrols}. Tus antiguas macros y comandos !tc todavía funcionan.',
      removedGuide:
        'El antiguo folleto "Guía de uso de TokenController", que los jugadores podían ver, fue reemplazado por el folleto de ayuda exclusivo para GM.',
      pruned: 'Patrullas olvidadas porque sus tokens ya no existen: {count}.',
      readyHint: 'Escriba !tokencontroller para el menú o abra el folleto Command Deck.',
      combatStarted: {
        pause: 'El combate ha comenzado: las patrullas se pausan hasta que finaliza.',
        step: 'El combate ha comenzado: las patrullas avanzan un paso en cada turno.',
      },
      combatEnded: 'El combate ha terminado: las patrullas continúan.',
      routeAdded: 'Se agregó la ruta "{name}" ({mode}).',
      routeUpdated:
        'Ruta "{name}" actualizada. Las fichas que contiene continúan con la nueva ruta.',
      confirmRemove: '¿Eliminar la ruta "{name}"? Tokens que se detendrán: {count}.',
      routeRemoved: 'Ruta "{name}" eliminada. Tokens detenidos: {count}.',
      routeRenamed: 'La ruta "{from}" pasó a llamarse "{to}".',
      examplesAdded: 'Rutas de ejemplo agregadas: {count}.',
      exportHint:
        'Copie el texto a continuación y péguelo después de {command} en cualquier juego.',
      imported: 'Rutas {added} importadas; omitido {skipped} (nombre ya utilizado o no válido).',
      started: '{tokens} comenzó el "{name}".',
      stopped: 'Tokens detenidos: {count}.',
      reset: 'Los tokens regresaron a donde comenzaron: {count}.',
      locked: 'Bloqueado: {tokens} ({mode}).',
      unlocked: 'Desbloqueado: {tokens}.',
      leaderSet: '{token} es el líder. Seleccione los seguidores y haga clic en Seguir.',
      following: 'Ahora siguiendo a {leader} ({mode}): {tokens}.',
      unfollowed: 'Los tokens ya no siguen: {count}.',
      noRecordings: 'No se está grabando nada.',
      recordingCancelled: 'Grabación "{name}" cancelada.',
      languages: 'Idiomas admitidos: {list}',
      settingChanged: '{setting} ahora es {value}.',
      combatOn: 'Combate activado.',
      combatOff: 'El combate se apagó.',
      calibrationCleared: 'Calibración de cuadrícula eliminada de esta página.',
      calibrated: 'Cuadrícula calibrada para esta página (tamaño de celda × {scale}).',
      paused: 'Todas las patrullas hicieron una pausa.',
      resumed: 'Se reanudaron las patrullas.',
      journalRebuilt: 'Documentos reconstruidos: {help} y {deck}.',
      markerStopped: 'Detenido por un marcador de parada: {tokens}.',
      markerReset:
        'Enviado de regreso al punto de partida mediante un marcador de parada: {tokens}.',
    },
    errors: {
      noTokens: 'No hay tokens seleccionados.',
      noRouteName: 'No se ha proporcionado ningún nombre de ruta.',
      routeNotFound: 'No existe ninguna ruta llamada "{name}".',
      routeExists: 'Ya existe una ruta llamada "{name}".',
      code: {
        empty: 'El código de paso está vacío.',
        badToken: 'El código de paso "{code}" tiene algo que no comprende en "{at}".',
        tooFar: 'El paso "{at}" es demasiado largo.',
      },
      routeInvalid: 'Esa ruta no se pudo salvar.',
      usageAdd: 'Dé un nombre y un código de paso.',
      usageEdit: 'Proporcione una ruta y un nuevo código de paso.',
      selectOneDrawing:
        'Seleccione exactamente un dibujo (una línea, un polígono, una forma a mano alzada, un rectángulo o una elipse).',
      drawingEmpty: 'El dibujo seleccionado tiene muy pocos puntos para seguir.',
      usageRoute: 'Da una ruta, una opción y un valor.',
      unknownRouteOption: 'No existe ninguna opción de ruta llamada "{option}".',
      selectOneToken: 'Seleccione exactamente una ficha.',
      badRouteValue: '"{value}" no es un valor válido para {option}.',
      usageRename: 'Da una ruta y su nuevo nombre.',
      usageCopy: 'Da una ruta y un nombre para la copia.',
      badJson: 'Ese no es un texto de exportación de ruta.',
      tokenLocked: '{tokens} no puede iniciarse: bloqueado.',
      tokenMarked: '{tokens} no puede comenzar: tiene un marcador de parada.',
      outsideArea: '{tokens} no puede iniciar: están fuera de "{name}".',
      selectOneArea:
        'Seleccione exactamente un dibujo cerrado (un polígono, un rectángulo, una elipse o un bucle a mano alzada).',
      areaTooSmall: 'El dibujo seleccionado necesita al menos tres esquinas para formar un área.',
      idsNotFound: 'Ningún token tiene estos ID: {ids}.',
      routeOnOtherPage: '{tokens} no puede iniciarse: "{name}" se dibujó en otra página.',
      startOnOtherPage:
        '{tokens} no puede iniciarse: el inicio fijo de "{name}" está en otra página.',
      routeFull: '{tokens} no puede iniciarse: "{name}" ya tiene {max} tokens.',
      noPage: 'No se pudo encontrar la página.',
      emptyTrack: '{tokens} no puede comenzar: "{name}" no tiene movimientos.',
      leaderNotFound: 'No se encontró ningún token llamado "{name}" en esta página.',
      noLeader: 'Aún no hay ningún líder.',
      followLoop: '{tokens} no puede seguir un token que los sigue.',
      alreadyRecording: '{token} ya se está grabando.',
      recordingTokenGone: 'El token para registrar "{name}" ya no existe.',
      recordingEmpty: 'Aún no se ha registrado nada.',
      unknownSetting: 'No hay ninguna configuración llamada "{key}".',
      badSettingValue: '"{value}" no es un valor válido para {key}.',
      calibrateNeedsTokens: 'Seleccione una o dos fichas colocadas en los centros celulares.',
      calibrateFailed: 'Los tokens seleccionados no se pudieron usar para calibrar la cuadrícula.',
      unknownCommand: 'Comando desconocido "{command}".',
      gmOnly: 'Sólo el GM puede usar TokenController.',
      internal: 'Algo salió mal. Los detalles están en la consola API.',
    },
    hints: {
      noTokens: 'Primero selecciona las fichas en el mapa.',
      noRouteName: 'Por ejemplo: !tokencontroller agrega Guard Walk U2R2D2L2',
      routeNotFound: 'Escriba !tokencontroller list para ver todas las rutas.',
      code: {
        empty: 'Por ejemplo: U2R2D2L2',
        badToken:
          'Utilice U, D, L, R, UL, UR, DL o DR con varias celdas, W para esperar y S para sigilo.',
        tooFar: 'Un solo paso puede tener como máximo 100 celdas; espera como máximo 100 ticks.',
      },
      selectOneDrawing:
        'Dibuje la ruta con una herramienta de dibujo, selecciónela (arrastre un cuadro alrededor de un contorno delgado si no logra hacer clic) y vuelva a intentarlo.',
      usageRoute: 'Opciones: modo, intervalo, máximo, aleatorio, paredes, inicio.',
      routeOnOtherPage:
        'Las rutas dibujadas sólo funcionan en la página en la que fueron dibujadas.',
      startOnOtherPage: 'Borre el inicio fijo o mueva el token a esa página primero.',
      noLeader:
        'Seleccione el líder y haga clic en Líder, o proporcione su nombre: !tokencontroller follow Name',
      leaderNotFound:
        'Utilice el nombre del token exactamente como se muestra en el mapa, o su ID del token.',
      badJson:
        'Pegue el texto de la exportación de !tokencontroller (o rutas de exportación v4) exactamente.',
      unknownSetting: 'Escriba !tokencontroller set para ver todas las configuraciones.',
      calibrateNeedsTokens:
        'Una ficha se alinea en la cuadrícula; dos fichas en celdas vecinas de una fila también fijan el tamaño de la celda.',
      calibrateFailed:
        'Asegúrese de que las fichas estén en celdas vecinas de la misma fila (columna en las páginas Hex (H)).',
      unknownCommand: 'Escriba !tokencontroller help para obtener la lista de comandos.',
      tokenLocked: 'Desbloquea el token primero.',
      tokenMarked: 'Elimine el marcador o cambie la configuración de Detener marcadores.',
      outsideArea:
        'Primero mueve las fichas dentro del área o activa el inicio aleatorio de la ruta.',
      selectOneArea:
        'Dibuje el área con una herramienta de dibujo, selecciónela (arrastre un cuadro alrededor de un contorno delgado si no logra hacer clic) y vuelva a intentarlo.',
      idsNotFound: 'Proporcione los ID de los tokens después de --ids, separados por punto y coma.',
    },
    warnings: {
      idsNotFound: 'Ningún token tiene estos ID, por lo que se omitieron: {ids}.',
      offPage: 'Parte de la ruta sale de la página (pasos: {count}). Esos pasos se omiten.',
      combatTrackerOnly:
        'La detección de combate está configurada en el rastreador de turnos, por lo que este interruptor no tiene efecto hasta que lo cambies.',
      unitPx:
        'La versión 5 lee el tamaño de celda de cada página, por lo que ya no se utiliza la configuración anterior de píxeles por unidad. Si los tokens no se alinean, utilice !tokencontroller calibrar.',
    },
    values: {
      on: 'En',
      off: 'Apagado',
      none: 'Ninguno',
      default: 'Por defecto',
      noLimit: 'Sin límite',
      ms: '{ms} ms',
      andMore: 'y {count} más',
      following: 'siguiente {leader}',
      locked: 'bloqueado',
      gridless: 'sin chasquidos',
      grid: {
        square: 'Cuadrado',
        hex: 'Maleficio',
        iso: 'Isométrica / Dimétrica',
      },
      mode: {
        loop: 'Bucle',
        pingpong: 'De aquí para allí',
        once: 'Una vez',
      },
      movement: {
        cell: 'Una celda a la vez',
        segment: 'Paso completo a la vez',
      },
      facing: {
        off: 'no te vuelvas',
        up: 'El arte mira hacia arriba.',
        down: 'Arte boca abajo',
        left: 'Caras de arte a la izquierda',
        right: 'El arte mira hacia la derecha',
      },
      combatDetection: {
        tracker: 'Rastreador de giros',
        manual: 'interruptor GM',
        both: 'Girar rastreador o interruptor GM',
      },
      combatBehaviour: {
        pause: 'Pausa',
        step: 'Mueve cada turno',
        ignore: 'sigue moviéndote',
      },
      lockMode: {
        native: 'Bloqueo de posición de Roll20',
        revert: 'Deshacer movimientos',
        freeze: 'Quédate quieto sólo',
      },
      followMode: {
        trail: 'Fila india',
        formation: 'Formación',
      },
      manualMove: {
        continue: 'Continúe desde allí',
        stop: 'detener la patrulla',
      },
      markerAction: {
        stop: 'Deténgase donde está',
        reset: 'volver al inicio',
      },
      wallMode: {
        ignore: 'Caminar a través de paredes',
        hold: 'Espera en las paredes',
        turn: 'Vuelve a las paredes',
      },
      wallCheck: {
        centre: 'Centro de la ficha',
        width: 'ficha entera',
      },
      oneWayWalls: {
        block: 'Bloquear',
        pass: 'Dejar pasar',
      },
      transparentWalls: {
        block: 'Bloquear',
        pass: 'Dejar pasar',
      },
    },
    menu: {
      statusRunning: 'Fichas de patrullaje: {patrols}. Rutas: {routes}.',
      statusPaused: 'Todas las patrullas están en pausa.',
      statusCombat: {
        pause: 'En combate: las patrullas están en pausa.',
        step: 'En combate: las patrullas se mueven en cada turno.',
      },
      routes: 'Rutas',
      noRoutes: 'Aún no hay rutas. Añade uno, dibuja uno, graba uno o añade los ejemplos.',
      create: 'Nueva ruta',
      selected: 'Fichas seleccionadas',
      tools: 'Herramientas',
      recordings: 'Grabaciones',
      patrols: 'Patrullas',
    },
    buttons: {
      start: 'Comenzar',
      stop: 'Detener',
      add: 'Código de paso',
      draw: 'Del dibujo',
      bounce: 'Área de rebote',
      record: 'Registro',
      examples: 'Ejemplos',
      reset: 'Reiniciar',
      lock: 'Cerrar',
      unlock: 'Descubrir',
      leader: 'Líder',
      follow: 'Seguir',
      unfollow: 'Dejar de seguir',
      resume: 'Reanudar',
      pause: 'Pausar todo',
      combatOn: 'Combate activado',
      combatOff: 'Combate desactivado',
      stopAll: 'Detener todo',
      settings: 'Ajustes',
      status: 'Estado',
      help: 'Ayuda',
      open: 'Abierto',
      clearStart: 'Claro',
      setStart: 'Establecer en Seleccionado',
      edit: 'Editar código',
      rename: 'Rebautizar',
      copy: 'Copiar',
      export: 'Exportar',
      remove: 'Eliminar',
      menu: 'Menú',
      wait: 'Esperar',
      stealth: 'Sigilo',
      undo: 'Deshacer',
      save: 'Ahorrar',
      cancel: 'Cancelar',
      confirm: 'Sí, quítalo',
      startRoute: 'Iniciar ruta',
      list: 'Listar rutas',
      calibrate: 'Calibrar',
    },
    prompts: {
      name: 'Nombre de la ruta',
      code: 'código de paso',
      interval: 'Milisegundos por paso (0 = predeterminado)',
      maxTokens: 'La mayoría de los tokens a la vez (0 = sin límite)',
      newName: 'Nuevo nombre',
      route: 'Nombre de la ruta',
    },
    route: {
      drawn: 'Ruta dibujada, {points} puntos',
      recorded: 'Ruta registrada, {points} puntos',
      area: 'Área de rebote, {points} esquinas',
      path: 'Camino',
      mode: 'Modo',
      interval: 'Intervalo',
      maxTokens: 'La mayoría de las fichas',
      randomStart: 'Inicio aleatorio',
      walls: 'Paredes',
      start: 'inicio fijo',
      tokens: 'Fichas',
    },
    record: {
      title: 'Grabando "{name}"',
      intro:
        'Grabando {token} (se mueve hasta ahora: {count}). Haga clic en las flechas o arrastre la ficha en el mapa; cada movimiento queda registrado.',
    },
    settings: {
      interval: {
        label: 'Intervalo',
        desc: 'Milisegundos entre pasos. Cada ruta puede anularla.',
      },
      movement: {
        label: 'Movimiento',
        desc: 'la celda mueve una celda por paso; El segmento mueve un paso completo (como U3) a la vez, como lo hacía la versión 4.',
      },
      facing: {
        label: 'Girar fichas',
        desc: 'Gire las fichas para que miren hacia donde se dirigen: hacia afuera o hacia la forma en que mira el arte de la ficha (arriba, abajo, izquierda o derecha).',
      },
      combatDetection: {
        label: 'Detección de combate',
        desc: 'Cómo se nota el combate: rastreador (el rastreador de turnos está abierto con alguien dentro), manual (los botones de combate activado/desactivado) o ambos.',
      },
      combatBehaviour: {
        label: 'Comportamiento de combate',
        desc: 'Qué hacen las patrullas en combate: pausar, dar un paso (moverse una vez cada vez que pasa el turno) o ignorar (seguir moviéndonos).',
      },
      lockMode: {
        label: 'Modo de bloqueo',
        desc: 'Cómo Lock sostiene un token: nativo (la propia posición de Roll20 se bloquea, para que nadie pueda arrastrarlo), revertir (los movimientos se deshacen) o congelar (deja de patrullar y seguir, pero aún se puede arrastrar).',
      },
      lockMarker: {
        label: 'Marcador de bloqueo',
        desc: 'Marcador de estado que se muestra en los tokens bloqueados o ninguno. Los jugadores pueden ver marcadores.',
      },
      followMode: {
        label: 'Modo de seguimiento',
        desc: 'Sendero: los seguidores caminan en fila india siguiendo los pasos del líder. Formación: los seguidores mantienen su lugar alrededor del líder (arrastre un seguidor para cambiar su lugar).',
      },
      manualMove: {
        label: 'Arrastrando una patrulla',
        desc: 'Cuando arrastras una ficha de patrulla: continúa (la ruta continúa desde donde la dejaste) o detente (la patrulla termina).',
      },
      stopMarkers: {
        label: 'Marcadores de parada',
        desc: 'Marcadores de estado que sacan un token de su ruta y evitan que siga, separados por punto y coma (por ejemplo, muerto; rojo) o ninguno. Los seguidores de un líder con uno de estos marcadores también se detienen.',
      },
      markerAction: {
        label: 'Detener acción del marcador',
        desc: 'Qué hace una ficha de patrulla cuando recibe un Marcador de Parada: detenerse (permanece donde está) o reiniciarse (vuelve al punto de inicio).',
      },
      wallMode: {
        label: 'Paredes',
        desc: 'Lo que hacen las patrullas y los seguidores en paredes con iluminación dinámica y puertas y ventanas cerradas: ignorar (caminar), esperar hasta que el camino esté despejado, por ejemplo hasta que se abra una puerta) o girar (las patrullas retroceden). Cada ruta puede elegir la suya propia, por lo que los fantasmas aún pueden atravesar las paredes.',
      },
      wallCheck: {
        label: 'Verificación de pared',
        desc: 'Centro: sólo la mitad de una ficha debe quedar libre de las paredes. ancho: toda la ficha lo hace, por lo que una ficha grande no puede pasar por un espacio estrecho.',
      },
      oneWayWalls: {
        label: 'Muros unidireccionales',
        desc: 'Si los muros unidireccionales detienen las fichas (bloquean) o no (pasan).',
      },
      transparentWalls: {
        label: 'Paredes transparentes',
        desc: 'Ya sean paredes transparentes, que dejan pasar la luz, detienen las fichas (bloquean) o no (pasan).',
      },
      buttonStep: {
        label: 'Celdas por clic',
        desc: 'Hasta qué punto las flechas de grabación mueven una ficha.',
      },
      language: {
        label: 'Idioma',
        desc: 'Idioma para menús, mensajes y folletos.',
      },
    },
    status: {
      routes: 'Rutas',
      patrols: 'Fichas de patrullaje',
      followers: 'Siguientes tokens',
      locked: 'Fichas bloqueadas',
      recordings: 'Grabaciones',
      paused: 'En pausa',
      combat: 'Combatir',
      page: 'Página actual',
      grid: 'Red',
      cell: 'Tamaño de celda',
      calibration: 'Calibración',
    },
    help: {
      menu: 'Mostrar el menú.',
      start: 'Coloca las fichas seleccionadas en una ruta.',
      stop: 'Detén las fichas seleccionadas (patrullas y seguidores), todas las fichas de una ruta o todas.',
      reset: 'Devuelve las fichas al lugar donde empezaron y detenlas.',
      pause: 'Pausa o reanuda cada patrulla.',
      lock: 'Mantenga las fichas seleccionadas en su lugar o suéltelas.',
      leader: 'Elija el token seleccionado como líder a seguir.',
      follow: 'Haga que las fichas seleccionadas sigan al líder, o una ficha dada por su nombre.',
      unfollow: 'Detenga el seguimiento de los tokens seleccionados.',
      add: 'Cree una ruta a partir de un código de paso, como U2R2D2L2.',
      edit: 'Cambiar el código de paso de una ruta.',
      draw: 'Cree una ruta que siga el dibujo seleccionado en esta página.',
      bounce:
        'Cree una ruta en la que las fichas deambulen dentro del dibujo cerrado seleccionado, rebotando en sus bordes.',
      record: 'Graba una ruta moviendo el token seleccionado con botones o arrastrándolo.',
      route: 'Cambie una opción de ruta: modo, intervalo, máximo, aleatorio, paredes o inicio.',
      show: 'Muestra los detalles y botones de una ruta.',
      rename: 'Cambiar el nombre de una ruta.',
      copy: 'Copie una ruta con un nuevo nombre.',
      remove: 'Eliminar una ruta (pregunta primero).',
      ids: 'Actúa sobre los tokens con estos ID en lugar de los seleccionados, para que otros Mods como ScriptCards puedan controlar los tokens. eliminar --ids elimina los tokens de sus rutas; nunca elimina una ruta.',
      list: 'Enumere las rutas o los tokens que se controlan.',
      examples: 'Agregue las rutas de ejemplo.',
      export: 'Muestra rutas como texto para copiar en otro juego.',
      import: 'Agregue rutas desde el texto de exportación.',
      combat: 'Activa o desactiva el combate manualmente.',
      set: 'Cambie una configuración o muestre todas las configuraciones.',
      calibrate:
        'Alinee la cuadrícula con fichas encajadas en los centros de las celdas o retire la calibración.',
      status: 'Muestra qué está haciendo el Mod y cómo ve esta página.',
      journal: 'Reconstruya los folletos de Ayuda y Comando.',
      help: 'Muestra esta lista.',
      footer:
        'Las instrucciones completas se encuentran en el folleto "{help}"; Los botones están en "{deck}". {legacy} todavía funciona con los comandos de la versión 4.',
    },
    handout: {
      versionLabel: 'Versión',
      subtitle: 'Patrullas, seguidores y candados para juegos Jumpgate y Legacy',
      overview: {
        heading: 'Descripción general',
        body: 'TokenController mueve tokens por usted. Dale a un guardia una ruta de patrulla, haz que un carro siga a su conductor o bloquea una estatua en su lugar. Las rutas pueden escribirse como un código de paso, trazarse a partir de un dibujo en el mapa o registrarse moviendo una ficha. Las rutas funcionan en páginas cuadradas, hexadecimales, isométricas, dimétricas y sin cuadrículas.',
      },
      quickStart: {
        heading: 'Inicio rápido',
        steps: [
          'Abra el folleto Command Deck o escriba !tokencontroller para el menú.',
          'Haga clic en Ejemplos para agregar algunas rutas ya preparadas o en Código de paso para escribir el suyo propio (por ejemplo, U2R2D2L2).',
          'Seleccione uno o más tokens y haga clic en Iniciar junto a una ruta.',
          'Seleccione un token y haga clic en Detener para detenerlo o en Restablecer para devolverlo al punto donde comenzó.',
        ],
      },
      routes: {
        heading: 'Haciendo rutas',
        points: [
          'Código de paso: escriba movimientos como U2R2D2L2. Los códigos no están vinculados a un lugar en el mapa, por lo que la misma ruta funciona en cualquier lugar.',
          'Desde Dibujo: dibuja una línea, polígono, forma a mano alzada, rectángulo o elipse con las herramientas de dibujo, selecciónala y haz clic en Desde Dibujo. Las fichas caminan a lo largo de él, solo en esa página. Puedes borrar el dibujo después.',
          'Grabar: seleccione un token y haga clic en Grabar. Muévalo con los botones de flecha o arrástrelo en el mapa (se siguen los puntos de referencia de Roll20), luego haga clic en Guardar. En las cuadrículas, la grabación se convierte en un código de paso que puedes editar.',
          'Las rutas circulares empiezan de nuevo desde el principio; las rutas de ida y vuelta regresan por donde vinieron; una vez que las rutas se detienen al final. Nuevas rutas que terminan donde empiezan el bucle; otros van y vienen.',
          'Área de rebote: dibuje una forma cerrada alrededor del área, selecciónela y haga clic en Área de rebote. Las fichas que comienzan en él viajan en línea recta y rebotan en sus bordes (y en las paredes, a menos que la ruta las ignore), girando un poco al azar cada vez. El inicio aleatorio coloca cada ficha en una celda aleatoria del área.',
        ],
      },
      codes: {
        colCode: 'Código',
        colMeaning: 'Significado',
        move: 'Muévete hacia arriba, abajo, izquierda o derecha, una celda.',
        diagonal: 'Muévete en diagonal.',
        distance: 'Un número después de una dirección mueve esa misma cantidad de celdas.',
        face: 'Gira para mirar en una dirección sin moverte (necesita fichas de giro).',
        wait: 'Espere un paso o el número de pasos indicado.',
        stealth:
          'Mueve la ficha entre la capa de fichas y la capa de GM, para que desaparezca y reaparezca.',
      },
      routeOptions: {
        heading: 'Opciones de ruta',
        colOption: 'Opción',
        colMeaning: 'Significado',
        mode: 'loop, pingpong (ida y vuelta) o una vez.',
        interval: 'Milisegundos por paso para esta ruta o 0 para el intervalo global.',
        max: 'La mayor cantidad de tokens que puede haber en la ruta a la vez, o 0 sin límite.',
        random: 'activado: cada ficha comienza en un punto aleatorio a lo largo de la ruta.',
        walls:
          'ignorar (caminar a través de paredes), mantener (esperar en paredes y puertas cerradas), girar (retroceder) o predeterminado (usar la configuración de Paredes).',
        start:
          'set: las fichas saltan a la posición de la ficha seleccionada cuando comienzan. claro: empiezan donde están.',
      },
      tokens: {
        heading: 'Controlar fichas',
        points: [
          'Un token está en una ruta a la vez. Iniciarlo por otra ruta sustituye a la primera.',
          'Detener deja las fichas donde están. Restablecer los devuelve a donde estaban antes de comenzar, en su capa original.',
          'El candado mantiene una ficha en su lugar. Las fichas bloqueadas no patrullan ni siguen hasta que se desbloquean.',
          'Seguir: seleccione el líder y haga clic en Líder, luego seleccione los seguidores y haga clic en Seguir. También puedes escribir el nombre del líder: !tokencontroller sigue a Goblin Boss. Los seguidores siguen los tokens que patrullan, los tokens que arrastras y los tokens movidos por TokenMod.',
          'Los seguidores pueden seguir a otros seguidores, formando una cadena o una columna.',
          'Al arrastrar una ficha de patrulla, la patrulla continúa desde donde la dejaste, a menos que Arrastrar una patrulla esté configurado para detenerse.',
          'Muros: con los Muros activados, las patrullas y seguidores no caminan a través de muros con iluminación dinámica o puertas y ventanas cerradas; puertas abiertas y ventanas les dejan pasar. Dale a una ruta su propia opción de paredes (por ejemplo, ignorarla si aparece un fantasma).',
          'Marcadores de parada: una ficha que obtiene uno de estos marcadores de estado (por ejemplo, muerto) abandona su ruta y deja de seguir, y los seguidores de un líder que obtiene uno también se detienen. Configúrelos con !tokencontroller set stopMarkers dead;red. Esto también funciona cuando otro Mod agrega el marcador.',
        ],
      },
      grids: {
        heading: 'Rejillas',
        points: [
          'El tamaño de celda y el tipo de cuadrícula se leen en cada página, por lo que diferentes páginas pueden usar cuadrículas diferentes.',
          'U y D siempre significan arriba y abajo en la pantalla. En cuadrículas hexagonales, los movimientos sin vecinos coincidentes en zigzag; en cuadrículas isométricas y dimétricas, las diagonales cruzan un diamante.',
          'Las páginas con el ajuste desactivado se mueven en pasos de 70 píxeles sin alinearse en una cuadrícula.',
          'Si los tokens se salen de la cuadrícula, coloque un token en el centro de una celda, selecciónelo y haga clic en Calibrar. Seleccione dos tokens en celdas vecinas de una fila para fijar también el tamaño de la celda.',
        ],
      },
      combat: {
        heading: 'Combatir',
        points: [
          'La Detección de combate elige cómo se detecta el combate: el rastreador de turnos, los botones de encendido/apagado de combate, o cualquiera de los dos.',
          'El comportamiento de combate elige lo que hacen las patrullas: pausar, avanzar un paso cada vez que pasa el turno o seguir moviéndonos.',
          'Pausar todo detiene todas las patrullas en cualquier momento; Reanudar los inicia nuevamente.',
        ],
      },
      commands: {
        heading: 'Comandos',
        intro:
          'Sólo los GM pueden usar estos comandos. Las rutas se pueden nombrar o hacer referencia a ellas mediante su #id en los botones del menú. Coloque los nombres con espacios entre "comillas" cuando un comando tenga dos nombres.',
        mods: 'Otros Mods también pueden enviar estos comandos, por ejemplo desde ScriptCards. No pueden seleccionar tokens, por lo que los nombran con --ids seguido de ID de token separados por punto y coma: !tc stop --ids ID1;ID2. Las respuestas van al GM.',
        colCommand: 'Dominio',
        colDesc: 'que hace',
      },
      settings: {
        heading: 'Ajustes',
        intro:
          'Cambie la configuración desde el menú, con !tokencontroller configurado <configuración> <valor>, o en la página de configuración Mod en la pantalla API Scripts.',
        colKey: 'Llave',
        colName: 'Configuración',
        colDesc: 'Descripción',
      },
      upgrading: {
        heading: 'Actualización desde la versión 4',
        points: [
          'Se conservan caminos, fichas de patrulla, candados, seguidores y borradores sin terminar. Los borradores se convierten en rutas que terminan en "(borrador)".',
          'Se mantienen las configuraciones de la versión 4: intervalo, subpasos, rotación, patrulla de combate y unidades por clic.',
          'Los comandos !tc y !token-control y las macros T-Cntrl_ siguen funcionando. La tabla muestra los nuevos comandos.',
          'La versión 4 envió el menú completo después de cada acción; En su lugar, la versión 5 envía una breve respuesta.',
          'La configuración de píxeles por unidad desapareció: el tamaño de celda proviene de cada página. HTML Builder ya no es necesario.',
          'El antiguo folleto de la Guía de uso, que todos los jugadores podían ver, ha sido reemplazado por este folleto exclusivo para GM.',
        ],
        colV4: 'Versión 4',
        colV5: 'Versión 5',
      },
      troubleshooting: {
        heading: 'Solución de problemas',
        points: [
          'Los tokens no se mueven: verifique el Estado. Las patrullas esperan mientras están en pausa, mientras están bloqueadas y en combate cuando el comportamiento de combate está en pausa.',
          'Los tokens se mueven a una distancia incorrecta: es posible que el tamaño de la cuadrícula de la página o el ajuste hayan cambiado; Pruebe Calibrar.',
          'Una ruta dibujada no comenzará: las rutas dibujadas solo funcionan en la página en la que fueron dibujadas.',
          'Los seguidores no se mueven cuando otro Mod mueve al líder: sólo TokenMod informa sus movimientos. Otros Mods pueden llamar a TokenController.ObserveTokenChange.',
          'Informe problemas en el foro Roll20 con cualquier mensaje de la consola API.',
        ],
      },
      languages: {
        heading: 'Idiomas',
        body: 'TokenController está traducido a los siguientes idiomas. Elija uno con la configuración de Idioma.',
        colCode: 'Código',
        colName: 'Idioma',
        colNative: 'nombre nativo',
      },
      credits: {
        heading: 'Créditos',
        original: 'Mod original de',
        maintainer: 'Versión 5 mantenida por',
        support: 'Informe errores e ideas en el foro Roll20 Mod o en GitHub.',
      },
      footer: 'Los botones para cada acción se encuentran en el folleto "{deck}".',
    },
    deck: {
      subtitle: 'Cubierta de mando',
      patrolsDesc: 'Iniciar, detener y pausar patrullas. Seleccione las fichas primero.',
      createDesc: 'Realiza rutas a partir de un código de paso, un dibujo o grabando un token.',
      selectedDesc: 'Bloquea fichas o haz que sigan a un líder.',
      toolsDesc: 'Combate, escenarios y herramientas de cuadrícula.',
      footer: 'Las instrucciones completas se encuentran en el folleto "{help}".',
    },
  };

  const TRANSLATION$2 = {
    titles: {
      ready: 'TokenController är klar.',
      settings: 'TokenController-inställningar',
      help: 'TokenController-kommandon',
      export: 'Ruttexport',
      routes: 'Rutter',
      tokens: 'Kontrollerade tokens',
      status: 'TokenController-status',
    },
    messages: {
      migrated:
        'Uppgraderad från version 4. Bevarade rutter: {routes}. Bevarade patrulleringstokens: {patrols}. Dina gamla makron och !tc-kommandon fungerar fortfarande.',
      removedGuide:
        'Den gamla "TokenController Usage Guide"-handouten, som spelare kunde se, ersattes av GM-enbart Hjälp-handout.',
      pruned: 'Patruller glöms bort eftersom deras tokens inte längre finns: {count}.',
      readyHint: 'Skriv !tokencontroller för menyn, eller öppna kommandodeckets handout.',
      combatStarted: {
        pause: 'Striden har börjat: patruller pausas tills den tar slut.',
        step: 'Striden har börjat: patruller går ett steg varje tur.',
      },
      combatEnded: 'Striden är över: patruller fortsätter.',
      routeAdded: 'Rutten "{name}" har lagts till ({mode}).',
      routeUpdated: 'Rutten "{name}" har uppdaterats. Tokens på den fortsätter med den nya rutten.',
      confirmRemove:
        'Vill du ta bort rutten "{name}"? Tokens på den som kommer att stoppa: {count}.',
      routeRemoved: 'Rutten "{name}" har tagits bort. Tokens stoppade: {count}.',
      routeRenamed: 'Rutten "{from}" har bytt namn till "{to}".',
      examplesAdded: 'Exempel på rutter som lagts till: {count}.',
      exportHint: 'Kopiera texten nedan och klistra in den efter {command} i valfritt spel.',
      imported:
        'Importerade {added} rutter; hoppade över {skipped} (namnet används redan eller är inte giltigt).',
      started: '{tokens} började på "{name}".',
      stopped: 'Tokens stoppade: {count}.',
      reset: 'Tokens återvände till där de började: {count}.',
      locked: 'Låst: {tokens} ({mode}).',
      unlocked: 'Upplåst: {tokens}.',
      leaderSet: '{token} är ledaren. Välj följare och klicka på Följ.',
      following: 'Följer nu {leader} ({mode}): {tokens}.',
      unfollowed: 'Tokens följer inte längre: {count}.',
      noRecordings: 'Ingenting spelas in.',
      recordingCancelled: 'Inspelningen "{name}" avbröts.',
      languages: 'Språk som stöds: {list}',
      settingChanged: '{setting} är nu {value}.',
      combatOn: 'Strid påslagen.',
      combatOff: 'Strid avstängd.',
      calibrationCleared: 'Rutnätskalibrering har tagits bort från den här sidan.',
      calibrated: 'Rutnät kalibrerat för den här sidan (cellstorlek × {scale}).',
      paused: 'Alla patruller pausade.',
      resumed: 'Patruller återupptogs.',
      journalRebuilt: 'Handouts ombyggda: {help} och {deck}.',
      markerStopped: 'Stoppas av en stoppmarkör: {tokens}.',
      markerReset: 'Skickade tillbaka till där de började av en stoppmarkör: {tokens}.',
    },
    errors: {
      noTokens: 'Inga tokens har valts.',
      noRouteName: 'Inget ruttnamn angivet.',
      routeNotFound: 'Det finns ingen rutt som heter "{name}".',
      routeExists: 'Det finns redan en rutt som heter "{name}".',
      code: {
        empty: 'Stegkoden är tom.',
        badToken: 'Stegkoden "{code}" har något den inte förstår vid "{at}".',
        tooFar: 'Steget "{at}" är för långt.',
      },
      routeInvalid: 'Den rutten kunde inte sparas.',
      usageAdd: 'Ge ett namn och en stegkod.',
      usageEdit: 'Ge en rutt och en ny stegkod.',
      selectOneDrawing:
        'Välj exakt en ritning (en linje, polygon, frihandsform, rektangel eller ellips).',
      drawingEmpty: 'Den valda ritningen har för få punkter att följa.',
      usageRoute: 'Ge en rutt, ett alternativ och ett värde.',
      unknownRouteOption: 'Det finns inget ruttalternativ som heter "{option}".',
      selectOneToken: 'Välj exakt en token.',
      badRouteValue: '"{value}" är inte ett giltigt värde för {option}.',
      usageRename: 'Ge en rutt och dess nya namn.',
      usageCopy: 'Ge en rutt och ett namn för kopian.',
      badJson: 'Det är inte ruttexporttext.',
      tokenLocked: '{tokens} kan inte starta: låst.',
      tokenMarked: '{tokens} kan inte starta: de har en stoppmarkör.',
      outsideArea: '{tokens} kan inte starta: de är utanför "{name}".',
      selectOneArea:
        'Välj exakt en sluten ritning (en polygon, rektangel, ellips eller frihandsögla).',
      areaTooSmall: 'Den valda ritningen behöver minst tre hörn för att göra ett område.',
      idsNotFound: 'Inga tokens har dessa ID:n: {ids}.',
      routeOnOtherPage: '{tokens} kan inte starta: "{name}" ritades på en annan sida.',
      startOnOtherPage:
        '{tokens} kan inte starta: den fasta starten för "{name}" finns på en annan sida.',
      routeFull: '{tokens} kan inte starta: "{name}" har redan {max} tokens.',
      noPage: 'Sidan kunde inte hittas.',
      emptyTrack: '{tokens} kan inte starta: "{name}" har inga drag.',
      leaderNotFound: 'Ingen token som heter "{name}" hittades på den här sidan.',
      noLeader: 'Det finns ingen ledare ännu.',
      followLoop: '{tokens} kan inte följa en token som följer dem.',
      alreadyRecording: '{token} spelas redan in.',
      recordingTokenGone: 'Token för inspelning av "{name}" finns inte längre.',
      recordingEmpty: 'Inget har spelats in ännu.',
      unknownSetting: 'Det finns ingen inställning som heter "{key}".',
      badSettingValue: '"{value}" är inte ett giltigt värde för {key}.',
      calibrateNeedsTokens: 'Välj en eller två tokens som fästs till cellcentra.',
      calibrateFailed: 'De valda tokens kunde inte användas för att kalibrera rutnätet.',
      unknownCommand: 'Okänt kommando "{command}".',
      gmOnly: 'Endast GM kan använda TokenController.',
      internal: 'Något gick fel. Detaljer finns i API-konsolen.',
    },
    hints: {
      noTokens: 'Välj tokens på kartan först.',
      noRouteName: 'Till exempel: !tokencontroller lägg till Guard Walk U2R2D2L2',
      routeNotFound: 'Skriv !tokencontroller list för att se alla rutter.',
      code: {
        empty: 'Till exempel: U2R2D2L2',
        badToken:
          'Använd U, D, L, R, UL, UR, DL eller DR med ett antal celler, W för att vänta och S för smygande.',
        tooFar: 'Ett enda steg kan vara högst 100 celler; väntar högst 100 fästingar.',
      },
      selectOneDrawing:
        'Rita rutten med ett ritverktyg, markera det (dra en ruta runt en tunn kontur om du missar den genom att klicka), försök sedan igen.',
      usageRoute: 'Alternativ: läge, intervall, max, slumpmässigt, väggar, start.',
      routeOnOtherPage: 'Ritade rutter fungerar bara på sidan de ritades på.',
      startOnOtherPage: 'Rensa den fasta starten eller flytta token till den sidan först.',
      noLeader:
        'Välj ledaren och klicka på Ledare, eller ange dess namn: !tokencontroller follow Name',
      leaderNotFound: 'Använd tokennamnet exakt som det visas på kartan, eller dess token-ID.',
      badJson: 'Klistra in texten från !tokencontroller export (eller v4 exportpaths) exakt.',
      unknownSetting: 'Skriv !tokencontroller set för att se alla inställningar.',
      calibrateNeedsTokens:
        'En token radar upp rutnätet; två tokens i angränsande celler i en rad bestämmer också cellstorleken.',
      calibrateFailed:
        'Se till att tokens finns i närliggande celler på samma rad (kolumn på Hex (H)-sidor).',
      unknownCommand: 'Skriv !tokencontroller help för listan med kommandon.',
      tokenLocked: 'Lås upp token först.',
      tokenMarked: 'Ta bort markören eller ändra inställningen för stoppmarkörer.',
      outsideArea:
        'Flytta tokens innanför området först, eller aktivera Slumpmässig start för rutten.',
      selectOneArea:
        'Rita området med ett ritverktyg, markera det (dra en ruta runt en tunn kontur om du missar det genom att klicka), försök sedan igen.',
      idsNotFound: 'Ge token-ID:n efter --ids, avgränsade med semikolon.',
    },
    warnings: {
      idsNotFound: 'Inga tokens har dessa ID:n, så de hoppades över: {ids}.',
      offPage: 'En del av rutten går utanför sidan (steg: {count}). De stegen hoppas över.',
      combatTrackerOnly:
        'Combat Detection är inställt på svängspåraren, så den här omkopplaren har ingen effekt förrän du ändrar den.',
      unitPx:
        'Version 5 läser cellstorleken från varje sida, så den gamla inställningen Pixels Per Unit används inte längre. Om tokens inte står i linje, använd !tokencontroller calibrate.',
    },
    values: {
      on: 'På',
      off: 'Av',
      none: 'Ingen',
      default: 'Standard',
      noLimit: 'Ingen gräns',
      ms: '{ms} ms',
      andMore: 'och {count} till',
      following: 'följer {leader}',
      locked: 'låst',
      gridless: 'ingen knäppning',
      grid: {
        square: 'Fyrkant',
        hex: 'Hexagon',
        iso: 'Isometrisk / Dimetric',
      },
      mode: {
        loop: 'Slinga',
        pingpong: 'Fram och tillbaka',
        once: 'En gång',
      },
      movement: {
        cell: 'En cell i taget',
        segment: 'Hela steget i taget',
      },
      facing: {
        off: 'Vänd dig inte',
        up: 'Konsten är vänd uppåt',
        down: 'Konsten är vänd nedåt',
        left: 'Konst ansikten kvar',
        right: 'Konst ansikten rätt',
      },
      combatDetection: {
        tracker: 'Turordningslista',
        manual: 'GM-omkopplare',
        both: 'Vrid tracker eller GM switch',
      },
      combatBehaviour: {
        pause: 'Paus',
        step: 'Flytta varje varv',
        ignore: 'Fortsätt röra på dig',
      },
      lockMode: {
        native: 'Roll20:s positionslås',
        revert: 'Ångra drag',
        freeze: 'Håll bara still',
      },
      followMode: {
        trail: 'Enstaka fil',
        formation: 'Bildning',
      },
      manualMove: {
        continue: 'Fortsätt därifrån',
        stop: 'Stoppa patrullen',
      },
      markerAction: {
        stop: 'Stanna där det är',
        reset: 'Gå tillbaka till början',
      },
      wallMode: {
        ignore: 'Gå genom väggar',
        hold: 'Vänta vid väggarna',
        turn: 'Vänd tillbaka vid väggarna',
      },
      wallCheck: {
        centre: 'Mitten av token',
        width: 'Hel token',
      },
      oneWayWalls: {
        block: 'Blockera',
        pass: 'Släppa fram',
      },
      transparentWalls: {
        block: 'Blockera',
        pass: 'Släppa fram',
      },
    },
    menu: {
      statusRunning: 'Patrullerande tokens: {patrols}. Rutter: {routes}.',
      statusPaused: 'Alla patruller är pausade.',
      statusCombat: {
        pause: 'I strid: patruller pausas.',
        step: 'I strid: patruller flyttar varje tur.',
      },
      routes: 'Rutter',
      noRoutes: 'Inga rutter ännu. Lägg till en, rita en, spela in en eller lägg till exemplen.',
      create: 'Ny rutt',
      selected: 'Valda tokens',
      tools: 'Verktyg',
      recordings: 'Inspelningar',
      patrols: 'Patruller',
    },
    buttons: {
      start: 'Starta',
      stop: 'Stopp',
      add: 'Stegkod',
      draw: 'Från ritning',
      bounce: 'Studsområde',
      record: 'Spela in',
      examples: 'Exempel',
      reset: 'Återställa',
      lock: 'Låsa',
      unlock: 'Låsa upp',
      leader: 'Ledare',
      follow: 'Följa',
      unfollow: 'Sluta följa',
      resume: 'Återuppta',
      pause: 'Pausa alla',
      combatOn: 'Strid på',
      combatOff: 'Strid av',
      stopAll: 'Stoppa alla',
      settings: 'Inställningar',
      status: 'Status',
      help: 'Hjälp',
      open: 'Öppna',
      clearStart: 'Rensa',
      setStart: 'Ställ in på Vald',
      edit: 'Redigera kod',
      rename: 'Döpa om',
      copy: 'Kopiera',
      export: 'Exportera',
      remove: 'Ta bort',
      menu: 'Meny',
      wait: 'Vänta',
      stealth: 'Smyg',
      undo: 'Ångra',
      save: 'Spara',
      cancel: 'Avboka',
      confirm: 'Ja, ta bort den',
      startRoute: 'Starta rutt',
      list: 'Lista rutter',
      calibrate: 'Kalibrera',
    },
    prompts: {
      name: 'Ruttnamn',
      code: 'Stegkod',
      interval: 'Millisekunder per steg (0 = standard)',
      maxTokens: 'De flesta tokens på en gång (0 = ingen gräns)',
      newName: 'Nytt namn',
      route: 'Ruttnamn',
    },
    route: {
      drawn: 'Ritad rutt, {points} poäng',
      recorded: 'Inspelad rutt, {points} poäng',
      area: 'Avvisningsområde, {points} hörn',
      path: 'Väg',
      mode: 'Läge',
      interval: 'Intervall',
      maxTokens: 'De flesta tokens',
      randomStart: 'Slumpmässig start',
      walls: 'Väggar',
      start: 'Fast start',
      tokens: 'Polletter',
    },
    record: {
      title: 'Spelar in "{name}"',
      intro:
        'Spelar in {token} (flyttar hittills: {count}). Klicka på pilarna eller dra symbolen på kartan; varje rörelse registreras.',
    },
    settings: {
      interval: {
        label: 'Intervall',
        desc: 'Millisekunder mellan stegen. Varje rutt kan åsidosätta den.',
      },
      movement: {
        label: 'Rörelse',
        desc: 'cell flyttar en cell per steg; segmentet flyttar ett helt steg (som U3) på en gång, som version 4 gjorde.',
      },
      facing: {
        label: 'Vrid tokens',
        desc: 'Vänd tokens till ansiktet vart de är på väg: av, eller hur tokenkonsten är (upp, ner, vänster eller höger).',
      },
      combatDetection: {
        label: 'Stridsdetektering',
        desc: 'Hur strid uppmärksammas: tracker (svängspåraren är öppen med någon i den), manuell (Combat On/Off-knapparna) eller båda.',
      },
      combatBehaviour: {
        label: 'Stridsbeteende',
        desc: 'Vad patruller gör i strid: pausa, kliva (förflytta sig en gång varje gång turen går) eller ignorera (fortsätt röra på dig).',
      },
      lockMode: {
        label: 'Låsläge',
        desc: 'Hur lås håller en token: inbyggt (Roll20:s eget positionslås, så att ingen kan dra det), återgå (drag ångras) eller frysa (den slutar patrullera och följa men kan fortfarande dras).',
      },
      lockMarker: {
        label: 'Låsmarkör',
        desc: 'Statusmarkör visas på låsta tokens, eller ingen. Spelare kan se markörer.',
      },
      followMode: {
        label: 'Följ läge',
        desc: 'spår: anhängare går singelfil i ledarens fotspår. formation: följare behåller sin plats runt ledaren (dra en följare för att byta plats).',
      },
      manualMove: {
        label: 'Dra en patrull',
        desc: 'När du drar en patrulleringstoken: fortsätt (rutten fortsätter där du tappade den) eller stanna (patrullen slutar).',
      },
      stopMarkers: {
        label: 'Stoppmarkörer',
        desc: 'Statusmarkörer som tar bort en token från dess rutt och stoppar den efter, åtskilda av semikolon (till exempel död;röd), eller ingen. Följare av en ledare med en av dessa markörer slutar också.',
      },
      markerAction: {
        label: 'Åtgärd vid stoppmarkör',
        desc: 'Vad en patrullerande token gör när den får en stoppmarkering: stoppa (den stannar där den är) eller återställ (den går tillbaka till där den började).',
      },
      wallMode: {
        label: 'Väggar',
        desc: 'Vad patruller och följare gör vid dynamiska belysningsväggar och stängda dörrar och fönster: ignorera (gå igenom), hålla (vänta tills vägen är fri, till exempel tills en dörr öppnas) eller vända (patruller vänder tillbaka). Varje rutt kan välja sin egen, så spöken kan fortfarande gå genom väggar.',
      },
      wallCheck: {
        label: 'Väggkontroll',
        desc: 'mitten: endast mitten av en token måste hålla sig borta från väggar. bredd: hela poletten gör det, så en stor pollett kan inte pressa sig genom ett smalt gap.',
      },
      oneWayWalls: {
        label: 'Enkelriktade väggar',
        desc: 'Om enkelriktade väggar stoppar polletter (blockera) eller inte (pass).',
      },
      transparentWalls: {
        label: 'Genomskinliga väggar',
        desc: 'Oavsett om genomskinliga väggar, som släpper igenom ljus, stoppar tokens (blockerar) eller inte (passerar).',
      },
      buttonStep: {
        label: 'Celler per klick',
        desc: 'Hur långt inspelningspilarna flyttar en token.',
      },
      language: {
        label: 'Språk',
        desc: 'Språk för menyer, meddelanden och åhörarkopior.',
      },
    },
    status: {
      routes: 'Rutter',
      patrols: 'Patrullerande polletter',
      followers: 'Följande tokens',
      locked: 'Låsta polletter',
      recordings: 'Inspelningar',
      paused: 'Pausad',
      combat: 'Bekämpa',
      page: 'Aktuell sida',
      grid: 'Rutnät',
      cell: 'Cellstorlek',
      calibration: 'Kalibrering',
    },
    help: {
      menu: 'Visa menyn.',
      start: 'Placera de valda polletterna på en rutt.',
      stop: 'Stoppa de valda polletterna (patrullerar och följer), varje token på en rutt, eller alla.',
      reset: 'Returnera tokens till där de började och stoppa dem.',
      pause: 'Pausa eller återuppta varje patrull.',
      lock: 'Håll de valda polletterna på plats eller släpp dem.',
      leader: 'Välj den valda token som ledare att följa.',
      follow: 'Få de valda polletterna att följa ledaren, eller en token som ges med namn.',
      unfollow: 'Stoppa följande valda tokens.',
      add: 'Skapa en rutt från en stegkod, till exempel U2R2D2L2.',
      edit: 'Ändra en rutts stegkod.',
      draw: 'Skapa en rutt som följer den valda ritningen på denna sida.',
      bounce:
        'Skapa en rutt där tokens vandrar in i den valda stängda ritningen och studsar mot dess kanter.',
      record:
        'Spela in en rutt genom att flytta den valda token med knappar eller genom att dra den.',
      route: 'Ändra ett ruttalternativ: läge, intervall, max, slumpmässigt, väggar eller start.',
      show: 'Visa en rutts detaljer och knappar.',
      rename: 'Byt namn på en rutt.',
      copy: 'Kopiera en rutt under ett nytt namn.',
      remove: 'Ta bort en rutt (frågar först).',
      ids: 'Agera på tokens med dessa ID:n istället för de valda, så att andra Mods som ScriptCards kan styra tokens. ta bort --ids tar tokens från sina rutter; den tar aldrig bort en rutt.',
      list: 'Lista rutterna eller de tokens som kontrolleras.',
      examples: 'Lägg till exempel på rutter.',
      export: 'Visa rutter som text att kopiera till ett annat spel.',
      import: 'Lägg till rutter från exporttext.',
      combat: 'Slå på eller av strid för hand.',
      set: 'Ändra en inställning eller visa alla inställningar.',
      calibrate:
        'Rikta upp rutnätet med tokens som fästs på cellcentra, eller ta bort kalibreringen.',
      status: 'Visa vad modden gör och hur den ser på den här sidan.',
      journal: 'Bygg om hjälp- och kommandodäcken.',
      help: 'Visa den här listan.',
      footer:
        'Fullständiga instruktioner finns i "{help}"-handouten; knapparna finns i "{deck}". {legacy} fungerar fortfarande med version 4-kommandona.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Patruller, följare och lås för Jumpgate och Legacy-spel',
      overview: {
        heading: 'Översikt',
        body: 'TokenController flyttar tokens åt dig. Ge en väktare en patrullväg, låt en vagn följa sin förare eller lås en staty på plats. Rutter kan skrivas in som en stegkod, spåras från en ritning på kartan eller registreras genom att flytta en token. Rutter fungerar på kvadratiska, hexadecimala, isometriska, dimetriska och rutnätslösa sidor.',
      },
      quickStart: {
        heading: 'Snabbstart',
        steps: [
          'Öppna Command Deck-handouten eller skriv !tokencontroller för menyn.',
          'Klicka på Exempel för att lägga till några färdiga rutter, eller Stegkod för att skriva din egen (till exempel U2R2D2L2).',
          'Välj en eller flera tokens och klicka på Start bredvid en rutt.',
          'Välj en token och klicka på Stopp för att stoppa den, eller Återställ för att skicka tillbaka den till där den började.',
        ],
      },
      routes: {
        heading: 'Att göra rutter',
        points: [
          'Stegkod: skriv drag såsom U2R2D2L2. Koder är inte bundna till en plats på kartan, så samma rutt fungerar var som helst.',
          'Från ritning: rita en linje, polygon, frihandsform, rektangel eller ellips med ritverktygen, välj den och klicka på Från ritning. Tokens går längs den, bara på den sidan. Du kan radera ritningen i efterhand.',
          'Spela in: välj en token och klicka på Spela in. Flytta den med pilknapparna eller dra den på kartan (Roll20 waypoints följs), klicka sedan på Spara. På kvadratiska rutnät blir inspelningen en stegkod som du kan redigera.',
          'Slingrutter börjar om från början; rutter fram och tillbaka går tillbaka som de kom; när rutter stannar i slutet. Nya rutter som slutar där de börjar loopa; andra går fram och tillbaka.',
          'Bounce Area: rita en stängd form runt området, markera den och klicka på Bounce Area. Tokens som startas på den färdas i raka linjer och studsar från dess kanter (och från väggar, om inte rutten ignorerar dem), och svänger lite slumpmässigt varje gång. Slumpmässig start placerar varje token i en slumpmässig cell i området.',
        ],
      },
      codes: {
        colCode: 'Koda',
        colMeaning: 'Menande',
        move: 'Flytta upp, ned, vänster eller höger, en cell.',
        diagonal: 'Flytta diagonalt.',
        distance: 'En siffra efter en riktning flyttar så många celler.',
        face: 'Vänd dig för att vända dig mot en riktning utan att röra dig (behöver Turn Tokens).',
        wait: 'Vänta ett steg, eller det givna antalet steg.',
        stealth:
          'Flytta token mellan tokenlagret och GM-lagret så att det försvinner och dyker upp igen.',
      },
      routeOptions: {
        heading: 'Ruttalternativ',
        colOption: 'Alternativ',
        colMeaning: 'Menande',
        mode: 'slinga, pingis (fram och tillbaka) eller en gång.',
        interval: 'Millisekunder per steg för denna rutt, eller 0 för det globala intervallet.',
        max: 'De flesta tokens som kan finnas på rutten på en gång, eller 0 utan gräns.',
        random: 'på: varje token börjar på en slumpmässig punkt längs rutten.',
        walls:
          'ignorera (gå genom väggar), håll (vänta vid väggar och stängda dörrar), vänd (vänd tillbaka) eller standard (använd inställningen Väggar).',
        start:
          'set: tokens hoppar till den valda tokens position när de startar. klart: de börjar där de står.',
      },
      tokens: {
        heading: 'Styra tokens',
        points: [
          'En token finns på en rutt i taget. Att starta den på en annan rutt ersätter den första.',
          'Stop lämnar tokens där de är. Återställ placerar dem tillbaka där de var innan de började, på sitt ursprungliga lager.',
          'Låset håller en token på plats. Låsta polletter patrullerar eller följer inte med förrän de är upplåsta.',
          'Följ: välj ledaren och klicka på Ledare, välj sedan följare och klicka på Följ. Du kan också skriva in ledarens namn: !tokencontroller follow Goblin Boss. Följare följer tokens som patrullerar, tokens du drar och tokens som flyttas av TokenMod.',
          'Följare kan följa andra följare, skapa en kedja eller en kolumn.',
          'Att dra en patrulleringstoken för patrullen vidare där du tappar den, om inte Drag a Patrol är inställd på att stoppa.',
          'Väggar: med inställningen Väggar på går patruller och följare inte genom dynamiska belysningsväggar eller stängda dörrar och fönster; öppna dörrar och fönster släpper igenom dem. Ge en rutt dess egna väggalternativ (till exempel ignorera för ett spöke).',
          'Stoppmarkörer: en token som får en av dessa statusmarkörer (till exempel död) lämnar sin rutt och slutar följa, och anhängarna till en ledare som får ett stopp också. Ställ in dem med !tokencontroller set stopMarkers dead;red. Detta fungerar också när en annan mod lägger till markören.',
        ],
      },
      grids: {
        heading: 'Rutnät',
        points: [
          'Cellstorleken och rutnätstypen läses från varje sida, så olika sidor kan använda olika rutnät.',
          'U och D betyder alltid upp och ner på skärmen. På hex-rutnät, rörelser utan matchande sicksack; på isometriska och dimetriska rutnät korsar diagonaler en diamant.',
          'Sidor där snapping är avstängt flyttas i steg om 70 pixlar utan att hamna i linje med ett rutnät.',
          'Om tokens glider bort från rutnätet, fäst en token till ett cellcentrum, välj det och klicka på Kalibrera. Välj två tokens i närliggande celler i en rad för att fixa cellstorleken också.',
        ],
      },
      combat: {
        heading: 'Bekämpa',
        points: [
          'Combat Detection väljer hur strid uppmärksammas: svängspåraren, Combat On/Off-knapparna eller någotdera.',
          'Stridsbeteende väljer vad patruller gör: pausa, flytta ett steg varje gång svängen passerar, eller fortsätt att röra på sig.',
          'Paus All stoppar varje patrull när som helst; Resume startar dem igen.',
        ],
      },
      commands: {
        heading: 'Kommandon',
        intro:
          'Endast GM:er kan använda dessa kommandon. Rutter kan namnges eller refereras till med deras #id från menyknapparna. Sätt namn med mellanslag inom "citattecken" när ett kommando tar två namn.',
        mods: 'Andra Mods kan också skicka dessa kommandon, till exempel från ScriptCards. De kan inte välja tokens, så de namnger dem med --ids följt av token-ID:n separerade med semikolon: !tc stop --ids ID1;ID2. Svaren går till GM.',
        colCommand: 'Kommando',
        colDesc: 'Vad den gör',
      },
      settings: {
        heading: 'Inställningar',
        intro:
          'Ändra inställningar från menyn, med !tokencontroller-inställningen <setting> <värde>, eller på sidan Mod-inställningar på skärmen API-skript.',
        colKey: 'Nyckel',
        colName: 'Miljö',
        colDesc: 'Beskrivning',
      },
      upgrading: {
        heading: 'Uppgraderar från version 4',
        points: [
          'Vägar, patrulleringspoletter, lås, följare och oavslutade utkast behålls. Utkast blir rutter som slutar på "(utkast)".',
          'Dina version 4-inställningar behålls: intervall, delsteg, rotation, stridspatrull och enheter per klick.',
          'Kommandona !tc och !token-kontroll och T-Cntrl_-makron fortsätter att fungera. Tabellen visar de nya kommandona.',
          'Version 4 skickade hela menyn efter varje åtgärd; version 5 skickar ett kort svar istället.',
          'Inställningen för pixlar per enhet är borta: cellstorleken kommer från varje sida. HTML Builder behövs inte längre.',
          'Den gamla bruksanvisningen, som alla spelare kunde se, ersätts av denna enbart GM-utdelning.',
        ],
        colV4: 'Version 4',
        colV5: 'Version 5',
      },
      troubleshooting: {
        heading: 'Felsökning',
        points: [
          'Tokens rör sig inte: kontrollera Status. Patruller väntar medan de är pausade, när de är låsta och i strid när stridsbeteendet är pausat.',
          'Tokens flyttar sig fel avstånd: sidans rutnätsstorlek eller knäppning kan ha ändrats; prova Kalibrera.',
          'En ritad rutt startar inte: ritade rutter fungerar bara på sidan de ritades på.',
          'Följare rör sig inte när en annan Mod flyttar ledaren: endast TokenMod rapporterar sina drag. Andra Mods kan anropa TokenController.ObserveTokenChange.',
          'Rapportera problem på Roll20-forumet med alla meddelanden från API-konsolen.',
        ],
      },
      languages: {
        heading: 'Språk',
        body: 'TokenController är översatt till språken nedan. Välj en med språkinställningen.',
        colCode: 'Koda',
        colName: 'Språk',
        colNative: 'Inhemskt namn',
      },
      credits: {
        heading: 'Krediter',
        original: 'Original Mod av',
        maintainer: 'Version 5 underhålls av',
        support: 'Rapportera buggar och idéer på Roll20 Mod-forumet eller på GitHub.',
      },
      footer: 'Knappar för varje åtgärd finns i "{deck}"-handouten.',
    },
    deck: {
      subtitle: 'Kommandodäck',
      patrolsDesc: 'Starta, stoppa och pausa patruller. Välj tokens först.',
      createDesc: 'Gör rutter från en stegkod, en ritning eller genom att spela in en token.',
      selectedDesc: 'Lås tokens eller få dem att följa en ledare.',
      toolsDesc: 'Strids, inställningar och rutnätsverktyg.',
      footer: 'Fullständiga instruktioner finns i "{help}" handout.',
    },
  };

  const TRANSLATION$1 = {
    titles: {
      ready: 'TokenController hazır.',
      settings: 'TokenController Ayarları',
      help: 'TokenController Komutları',
      export: 'Rota Dışa Aktarma',
      routes: 'Rotalar',
      tokens: 'Kontrollü Tokenlar',
      status: 'TokenDenetleyici Durumu',
    },
    messages: {
      migrated:
        "Sürüm 4'ten yükseltildi. Tutulan rotalar: {routes}. Tutulan devriye jetonları: {patrols}. Eski makrolarınız ve !tc komutlarınız hâlâ çalışıyor.",
      removedGuide:
        'Oyuncuların görebildiği eski "TokenController Kullanım Kılavuzu" broşürünün yerini yalnızca GM\'ye özel Yardım broşürü aldı.',
      pruned: 'Jetonları artık mevcut olmadığı için unutulan devriyeler: {count}.',
      readyHint: 'Menü için !tokencontroller yazın veya Komut Güvertesi broşürünü açın.',
      combatStarted: {
        pause: 'Savaş başladı: devriyeler bitene kadar duraklatıldı.',
        step: 'Savaş başladı: Devriyeler her turda bir adım ilerliyor.',
      },
      combatEnded: 'Savaş bitti: devriyeler devam ediyor.',
      routeAdded: '"{name}" rotası eklendi ({mode}).',
      routeUpdated: '"{name}" rotası güncellendi. Üzerindeki jetonlar yeni rotaya devam eder.',
      confirmRemove: '"{name}" rotası kaldırılsın mı? Üzerinde duracak jetonlar: {count}.',
      routeRemoved: '"{name}" rotası kaldırıldı. Jetonlar durduruldu: {count}.',
      routeRenamed: '"{from}" rotasının adı "{to}" olarak değiştirildi.',
      examplesAdded: 'Örnek rotalar eklendi: {count}.',
      exportHint:
        'Aşağıdaki metni kopyalayın ve herhangi bir oyunda {command} sonrasına yapıştırın.',
      imported:
        '{added} rotaları içe aktarıldı; atlandı {skipped} (ad zaten kullanılmış veya geçerli değil).',
      started: '{tokens} "{name}" tarihinde başladı.',
      stopped: 'Jetonlar durduruldu: {count}.',
      reset: 'Jetonlar başladıkları yere geri döndü: {count}.',
      locked: 'Kilitli: {tokens} ({mode}).',
      unlocked: 'Kilit açıldı: {tokens}.',
      leaderSet: "{token} liderdir. Takipçileri seçin ve Takip Et'e tıklayın.",
      following: 'Şimdi {leader} ({mode}) takip ediliyor: {tokens}.',
      unfollowed: 'Tokenlar artık takip edilmiyor: {count}.',
      noRecordings: 'Hiçbir şey kaydedilmiyor.',
      recordingCancelled: '"{name}" kaydı iptal edildi.',
      languages: 'Desteklenen diller: {list}',
      settingChanged: '{setting} artık {value} oldu.',
      combatOn: 'Savaş açıldı.',
      combatOff: 'Savaş kapatıldı.',
      calibrationCleared: 'Izgara kalibrasyonu bu sayfadan kaldırıldı.',
      calibrated: 'Izgara bu sayfa için kalibre edildi (hücre boyutu × {scale}).',
      paused: 'Tüm devriyeler durduruldu.',
      resumed: 'Devriyeler yeniden başladı.',
      journalRebuilt: 'Ödevler yeniden oluşturuldu: {help} ve {deck}.',
      markerStopped: 'Bir Durdurma İşareti Tarafından Durduruldu: {tokens}.',
      markerReset: 'Durdurma İşareti ile başladıkları yere geri gönderildiler: {tokens}.',
    },
    errors: {
      noTokens: 'Hiçbir jeton seçilmedi.',
      noRouteName: 'Rota adı verilmedi.',
      routeNotFound: '"{name}" adında bir rota yok.',
      routeExists: 'Zaten "{name}" adında bir rota var.',
      code: {
        empty: 'Adım kodu boş.',
        badToken: '"{code}" adım kodunda "{at}"de anlamadığı bir şey var.',
        tooFar: '"{at}" adımı çok uzun.',
      },
      routeInvalid: 'Bu rota kaydedilemedi.',
      usageAdd: 'Bir ad ve adım kodu verin.',
      usageEdit: 'Bir rota ve yeni bir adım kodu verin.',
      selectOneDrawing:
        'Tam olarak bir çizim seçin (çizgi, çokgen, serbest şekil, dikdörtgen veya elips).',
      drawingEmpty: 'Seçilen çizimde takip edilecek çok az nokta var.',
      usageRoute: 'Bir rota, bir seçenek ve bir değer verin.',
      unknownRouteOption: '"{option}" adında bir rota seçeneği yoktur.',
      selectOneToken: 'Tam olarak bir jeton seçin.',
      badRouteValue: '"{value}", {option} için geçerli bir değer değil.',
      usageRename: 'Bir rota ve yeni adını verin.',
      usageCopy: 'Kopya için bir rota ve ad verin.',
      badJson: 'Bu rota dışa aktarma metni değil.',
      tokenLocked: '{tokens} başlatılamıyor: kilitli.',
      tokenMarked: '{tokens} başlayamıyor: bir Durdurma İşareti var.',
      outsideArea: '{tokens} başlatılamıyor: "{name}" dışındalar.',
      selectOneArea:
        'Tam olarak bir kapalı çizim seçin (çokgen, dikdörtgen, elips veya serbest el döngüsü).',
      areaTooSmall: 'Seçilen çizimin alan oluşturabilmesi için en az üç köşeye ihtiyacı vardır.',
      idsNotFound: 'Şu kimliklere sahip jeton yok: {ids}.',
      routeOnOtherPage: '{tokens} başlatılamıyor: "{name}" başka bir sayfaya çizilmiş.',
      startOnOtherPage: '{tokens} başlatılamıyor: "{name}" sabit başlangıcı başka bir sayfadadır.',
      routeFull: '{tokens} başlatılamıyor: "{name}" zaten {max} belirteçlerine sahip.',
      noPage: 'Sayfa bulunamadı.',
      emptyTrack: '{tokens} başlatılamıyor: "{name}" hiçbir hamleye sahip değil.',
      leaderNotFound: 'Bu sayfada "{name}" adında bir jeton bulunamadı.',
      noLeader: 'Henüz bir lider yok.',
      followLoop: '{tokens} kendilerini takip eden bir jetonu takip edemez.',
      alreadyRecording: '{token} zaten kaydediliyor.',
      recordingTokenGone: '"{name}" kaydetme jetonu artık mevcut değil.',
      recordingEmpty: 'Henüz hiçbir şey kaydedilmedi.',
      unknownSetting: '"{key}" adında bir ayar yoktur.',
      badSettingValue: '"{value}", {key} için geçerli bir değer değil.',
      calibrateNeedsTokens: 'Hücre merkezlerine tutturulmuş bir veya iki belirteci seçin.',
      calibrateFailed: 'Seçilen jetonlar ızgarayı kalibre etmek için kullanılamadı.',
      unknownCommand: 'Bilinmeyen komut "{command}".',
      gmOnly: "TokenController'ı yalnızca GM kullanabilir.",
      internal: 'Bir şeyler ters gitti. Ayrıntılar API konsolundadır.',
    },
    hints: {
      noTokens: 'Önce haritadaki jetonları seçin.',
      noRouteName: "Örneğin: !tokencontroller Guard Walk U2R2D2L2'yi ekleyin",
      routeNotFound: 'Tüm rotaları görmek için !tokencontroller list yazın.',
      code: {
        empty: 'Örneğin: U2R2D2L2',
        badToken:
          "Bir dizi hücreyle birlikte U, D, L, R, UL, UR, DL veya DR'yi kullanın; beklemek için W ve gizlilik için S'yi kullanın.",
        tooFar: 'Tek bir adım en fazla 100 hücre olabilir; en fazla 100 tik bekler.',
      },
      selectOneDrawing:
        'Rotayı bir çizim aracıyla çizin, seçin (tıklandığında gözden kaçırılırsa kutuyu ince bir anahat etrafında sürükleyin), sonra tekrar deneyin.',
      usageRoute: 'Seçenekler: mod, aralık, maksimum, rastgele, duvarlar, başlangıç.',
      routeOnOtherPage: 'Çizilen rotalar yalnızca çizildikleri sayfada çalışır.',
      startOnOtherPage: 'Sabit başlangıcı temizleyin veya önce jetonu o sayfaya taşıyın.',
      noLeader: "Lideri seçin ve Lider'e tıklayın veya adını verin: !tokencontroller follow Name",
      leaderNotFound:
        'Jeton adını tam olarak haritada gösterildiği gibi veya jeton kimliğini kullanın.',
      badJson:
        '!tokencontroller dışa aktarımındaki (veya v4 dışa aktarım yollarındaki) metni tam olarak yapıştırın.',
      unknownSetting: 'Tüm ayarları görmek için !tokencontroller set yazın.',
      calibrateNeedsTokens:
        'Bir jeton ızgarayı sıralıyor; Bir sıradaki komşu hücrelerde bulunan iki jeton da hücre boyutunu sabitler.',
      calibrateFailed:
        'Belirteçlerin aynı satırın komşu hücrelerinde olduğundan emin olun (Hex (H) sayfalardaki sütun).',
      unknownCommand: 'Komutların listesi için !tokencontroller help yazın.',
      tokenLocked: 'Önce jetonun kilidini açın.',
      tokenMarked: 'İşaretçiyi kaldırın veya İşaretçileri Durdurma ayarını değiştirin.',
      outsideArea:
        'Önce jetonları alanın içine taşıyın veya rota için Rastgele başlangıç seçeneğini açın.',
      selectOneArea:
        'Alanı bir çizim aracıyla çizin, seçin (tıklandığında gözden kaçırılırsa kutuyu ince bir çerçevenin etrafında sürükleyin), sonra tekrar deneyin.',
      idsNotFound: 'Jeton kimliklerini --ids sonrasında noktalı virgülle ayırarak verin.',
    },
    warnings: {
      idsNotFound: 'Hiçbir jeton bu kimliklere sahip olmadığından atlandı: {ids}.',
      offPage: 'Rotanın bir kısmı sayfanın dışına çıkıyor (adımlar: {count}). Bu adımlar atlanır.',
      combatTrackerOnly:
        'Savaş Tespiti dönüş izleyiciye ayarlıdır, dolayısıyla bu anahtarın siz değiştirene kadar hiçbir etkisi yoktur.',
      unitPx:
        "Sürüm 5, her sayfadaki hücre boyutunu okur, dolayısıyla eski Birim Başına Piksel ayarı artık kullanılmaz. Belirteçler sıralanmıyorsa !tokencontroller calibre'yi kullanın.",
    },
    values: {
      on: 'Açık',
      off: 'Kapalı',
      none: 'Hiçbiri',
      default: 'Varsayılan',
      noLimit: 'Sınır yok',
      ms: '{ms} ms',
      andMore: 've {count} daha',
      following: '{leader} takip ediliyor',
      locked: 'kilitli',
      gridless: 'yapışmak yok',
      grid: {
        square: 'Kare',
        hex: 'Altıgen',
        iso: 'İzometrik / Dimetrik',
      },
      mode: {
        loop: 'Döngü',
        pingpong: 'İleri geri',
        once: 'Bir kere',
      },
      movement: {
        cell: 'Bir seferde bir hücre',
        segment: 'Bir seferde tüm adım',
      },
      facing: {
        off: 'Dönme',
        up: 'Sanat yüzleşiyor',
        down: 'Sanat yüz üstü',
        left: 'Sanat yüzleri sola',
        right: 'Sanat sağa bakar',
      },
      combatDetection: {
        tracker: 'Dönüş izleyici',
        manual: 'GM anahtarı',
        both: 'Dönüş izleyiciyi veya GM anahtarını',
      },
      combatBehaviour: {
        pause: 'Duraklat',
        step: 'Her dönüşte hareket et',
        ignore: 'Hareket etmeye devam et',
      },
      lockMode: {
        native: "Roll20'nin konum kilidi",
        revert: 'Hareketleri geri al',
        freeze: 'Yalnızca hareketsiz dur',
      },
      followMode: {
        trail: 'Tek dosya',
        formation: 'Formasyon',
      },
      manualMove: {
        continue: 'Oradan devam et',
        stop: 'Devriyeyi durdur',
      },
      markerAction: {
        stop: 'Olduğu yerde dur',
        reset: 'Başlangıca geri dön',
      },
      wallMode: {
        ignore: 'Duvarların içinden geç',
        hold: 'Duvarlarda bekleyin',
        turn: 'Duvarlara arkanı dön',
      },
      wallCheck: {
        centre: 'Belirtecin merkezi',
        width: 'Bütün jeton',
      },
      oneWayWalls: {
        block: 'Engellemek',
        pass: 'Geçmesine izin ver',
      },
      transparentWalls: {
        block: 'Engellemek',
        pass: 'Geçmesine izin ver',
      },
    },
    menu: {
      statusRunning: 'Devriye jetonları: {patrols}. Rotalar: {routes}.',
      statusPaused: 'Tüm devriyeler durduruldu.',
      statusCombat: {
        pause: 'Çatışmada: devriyeler duraklatılır.',
        step: 'Çatışmada: Devriyeler her fırsatta hareket eder.',
      },
      routes: 'Rotalar',
      noRoutes:
        'Henüz rota yok. Bir tane ekleyin, bir tane çizin, bir tane kaydedin veya örnekleri ekleyin.',
      create: 'Yeni Rota',
      selected: 'Seçilen Tokenlar',
      tools: 'Aletler',
      recordings: 'Kayıtlar',
      patrols: 'Devriyeler',
    },
    buttons: {
      start: 'Başlangıç',
      stop: 'Durmak',
      add: 'Adım Kodu',
      draw: 'Çizimden',
      bounce: 'Sıçrama Alanı',
      record: 'Kayıt',
      examples: 'Örnekler',
      reset: 'Sıfırla',
      lock: 'Kilit',
      unlock: 'Kilidi aç',
      leader: 'Lider',
      follow: 'Takip etmek',
      unfollow: 'Takibi bırak',
      resume: 'Sürdürmek',
      pause: 'Tümünü Duraklat',
      combatOn: 'Savaş Açık',
      combatOff: 'Savaş Kapalı',
      stopAll: 'Tümünü Durdur',
      settings: 'Ayarlar',
      status: 'Durum',
      help: 'Yardım',
      open: 'Açık',
      clearStart: 'Temizlemek',
      setStart: 'Seçilene Ayarla',
      edit: 'Kodu Düzenle',
      rename: 'Yeniden isimlendirmek',
      copy: 'Kopyala',
      export: 'İhracat',
      remove: 'Kaldırmak',
      menu: 'Menü',
      wait: 'Beklemek',
      stealth: 'Gizlilik',
      undo: 'Geri al',
      save: 'Kaydetmek',
      cancel: 'İptal etmek',
      confirm: 'Evet, kaldır',
      startRoute: 'Rotayı Başlat',
      list: 'Rotaları Listele',
      calibrate: 'Kalibre et',
    },
    prompts: {
      name: 'Rota adı',
      code: 'Adım kodu',
      interval: 'Adım başına milisaniye (0 = varsayılan)',
      maxTokens: 'Aynı anda en çok jeton (0 = limit yok)',
      newName: 'Yeni isim',
      route: 'Rota adı',
    },
    route: {
      drawn: 'Rota çizildi, {points} puan',
      recorded: 'Kaydedilen rota, {points} puan',
      area: 'Sıçrama alanı, {points} köşeler',
      path: 'Yol',
      mode: 'Mod',
      interval: 'Aralık',
      maxTokens: 'Çoğu jeton',
      randomStart: 'Rastgele başlangıç',
      walls: 'Duvarlar',
      start: 'Sabit başlangıç',
      tokens: 'Jetonlar',
    },
    record: {
      title: '"{name}" kaydediliyor',
      intro:
        '{token} kaydediliyor (şimdiye kadar ilerliyor: {count}). Oklara tıklayın veya jetonu harita üzerinde sürükleyin; her hareket kaydedilir.',
    },
    settings: {
      interval: {
        label: 'Aralık',
        desc: 'Adımlar arasında milisaniye. Her rota onu geçersiz kılabilir.',
      },
      movement: {
        label: 'Hareket',
        desc: "hücre her adımda bir hücreyi hareket ettirir; segment, sürüm 4'te olduğu gibi tüm adımı (U3 gibi) aynı anda hareket ettirir.",
      },
      facing: {
        label: 'Jetonları Dönüştür',
        desc: 'Jetonları gittikleri yere doğru çevirin: kapalı veya jeton resminin baktığı yöne (yukarı, aşağı, sola veya sağa).',
      },
      combatDetection: {
        label: 'Savaş Tespiti',
        desc: 'Dövüş nasıl fark edilir: izleyici (dönüş izleyici, içinde biri varken açık), manuel (Savaş Açma/Kapama düğmeleri) veya her ikisi.',
      },
      combatBehaviour: {
        label: 'Savaş Davranışı',
        desc: 'Devriyelerin savaşta yaptığı şey: duraklatmak, adım atmak (her dönüşte bir kez hareket etmek) veya görmezden gelmek (hareket etmeye devam etmek).',
      },
      lockMode: {
        label: 'Kilit Modu',
        desc: "Lock bir jetonu nasıl tutar: yerel (Roll20'nin kendi konum kilidi, böylece kimse sürükleyemez), geri döndür (hareketler geri alınır) veya dondur (devriye gezmeyi ve takip etmeyi durdurur ancak yine de sürüklenebilir).",
      },
      lockMarker: {
        label: 'Kilit İşaretleyici',
        desc: 'Kilitli belirteçlerde durum işaretçisi gösteriliyor veya yok. Oyuncular işaretçileri görebilir.',
      },
      followMode: {
        label: 'Takip Modu',
        desc: 'İz: Takipçiler liderin izinden tek sıra halinde yürürler. oluşumu: takipçiler liderin etrafındaki yerlerini korurlar (bir takipçiyi yerini değiştirmek için sürükleyin).',
      },
      manualMove: {
        label: 'Bir Devriyeyi Sürüklemek',
        desc: 'Bir devriye jetonunu sürüklediğinizde: devam edin (rota, bıraktığınız yerden devam eder) veya durun (devriye biter).',
      },
      stopMarkers: {
        label: 'İşaretçileri Durdur',
        desc: 'Noktalı virgüllerle (örneğin ölü; kırmızı) ayrılmış veya hiçbiriyle ayrılmış olarak, bir jetonu rotasından çıkaran ve takip etmesini durduran durum işaretçileri. Bu işaretlerden birine sahip bir liderin takipçileri de durur.',
      },
      markerAction: {
        label: 'İşaretçi Eylemini Durdur',
        desc: 'Devriye gezen bir token, Durdurma İşareti aldığında ne yapar: Durdurun (olduğu yerde kalır) veya sıfırlayın (başladığı yere geri döner).',
      },
      wallMode: {
        label: 'Duvarlar',
        desc: 'Dinamik aydınlatmalı duvarlarda ve kapalı kapı ve pencerelerde devriyelerin ve takipçilerin yaptığı şey: görmezden gelmek (içeriden geçmek), beklemek (yol boşalıncaya kadar beklemek, örneğin bir kapı açılıncaya kadar) veya dönmek (devriyeler geri dönmek). Her rota kendi rotasını seçebilir, böylece hayaletler hâlâ duvarların içinden geçebilir.',
      },
      wallCheck: {
        label: 'Duvar Kontrolü',
        desc: 'merkez: jetonun yalnızca ortasının duvarlardan uzak durması gerekir. genişlik: jetonun tamamı öyledir, bu nedenle büyük bir jeton dar bir aralıktan geçemez.',
      },
      oneWayWalls: {
        label: 'Tek Yönlü Duvarlar',
        desc: 'Tek yönlü duvarların jetonları durdurup durdurmadığı (blok) veya durdurmadığı (geçme).',
      },
      transparentWalls: {
        label: 'Şeffaf Duvarlar',
        desc: 'Işığın geçmesine izin veren şeffaf duvarların jetonları durdurup durdurmadığı (bloke) veya etmemesi (geçmesi).',
      },
      buttonStep: {
        label: 'Tıklama Başına Hücre Sayısı',
        desc: 'Kayıt oklarının jetonu ne kadar uzağa taşıdığı.',
      },
      language: {
        label: 'Dil',
        desc: 'Menüler, mesajlar ve bildiriler için dil.',
      },
    },
    status: {
      routes: 'Rotalar',
      patrols: 'Devriye jetonları',
      followers: 'Tokenları takip etmek',
      locked: 'Kilitli jetonlar',
      recordings: 'Kayıtlar',
      paused: 'Duraklatıldı',
      combat: 'Dövüş',
      page: 'Geçerli sayfa',
      grid: 'Izgara',
      cell: 'Hücre boyutu',
      calibration: 'Kalibrasyon',
    },
    help: {
      menu: 'Menüyü göster.',
      start: 'Seçilen jetonları bir rotaya yerleştirin.',
      stop: 'Seçilen jetonları (devriyeler ve takip), rotadaki her jetonu veya tümünü durdurun.',
      reset: 'Jetonları başladıkları yere döndürün ve durdurun.',
      pause: 'Her devriyeyi duraklatın veya devam ettirin.',
      lock: 'Seçilen jetonları yerinde tutun veya bırakın.',
      leader: 'Takip edilecek lider olarak seçilen jetonu seçin.',
      follow:
        'Seçilen jetonların lideri veya isme göre verilen bir jetonu takip etmesini sağlayın.',
      unfollow: 'Seçilen jetonların takibini durdurun.',
      add: 'U2R2D2L2 gibi bir adım kodundan rota oluşturun.',
      edit: 'Bir rotanın adım kodunu değiştirin.',
      draw: 'Bu sayfada seçilen çizimi takip eden bir rota oluşturun.',
      bounce:
        'Belirteçlerin seçilen kapalı çizimin içinde dolaşıp kenarlarından sıçradığı bir rota oluşturun.',
      record: 'Seçilen jetonu düğmelerle hareket ettirerek veya sürükleyerek bir rota kaydedin.',
      route:
        'Bir rota seçeneğini değiştirin: mod, aralık, maksimum, rastgele, duvarlar veya başlangıç.',
      show: 'Bir rotanın ayrıntılarını ve düğmelerini gösterin.',
      rename: 'Bir rotayı yeniden adlandırın.',
      copy: 'Bir rotayı yeni bir adla kopyalayın.',
      remove: 'Bir rotayı kaldırın (önce sorar).',
      ids: "Seçilenler yerine bu kimliklere sahip jetonlar üzerinde hareket edin, böylece ScriptCard'lar gibi diğer Modlar jetonları kontrol edebilir. kaldır --ids jetonları rotalarından çıkarır; asla bir rotayı kaldırmaz.",
      list: 'Rotaları veya kontrol edilen jetonları listeleyin.',
      examples: 'Örnek rotaları ekleyin.',
      export: 'Başka bir oyuna kopyalamak için rotaları metin olarak gösterin.',
      import: 'Dışa aktarma metninden rota ekleyin.',
      combat: 'Savaşı elle açın veya kapatın.',
      set: 'Bir ayarı değiştirin veya tüm ayarları gösterin.',
      calibrate:
        'Izgarayı, hücre merkezlerine tutturulmuş belirteçlerle hizalayın veya kalibrasyonu kaldırın.',
      status: 'Modun ne yaptığını ve bu sayfayı nasıl gördüğünü gösterin.',
      journal: 'Yardım ve Komut Paneli bildirilerini yeniden oluşturun.',
      help: 'Bu listeyi göster.',
      footer:
        'Talimatların tamamı "{help}" broşüründe yer almaktadır; düğmeler "{deck}" konumundadır. {legacy} hala sürüm 4 komutlarıyla çalışıyor.',
    },
    handout: {
      versionLabel: 'Sürüm',
      subtitle: 'Jumpgate ve Legacy oyunları için devriyeler, takipçiler ve kilitler',
      overview: {
        heading: 'Genel Bakış',
        body: 'TokenController jetonları sizin için hareket ettirir. Bir muhafıza devriye rotası verin, bir arabanın sürücüsünü takip etmesini sağlayın veya bir heykeli yerine kilitleyin. Rotalar adım kodu olarak yazılabilir, haritadaki bir çizimden takip edilebilir veya bir jetonun hareket ettirilmesiyle kaydedilebilir. Rotalar kare, altıgen, izometrik, dimetrik ve ızgarasız sayfalarda çalışır.',
      },
      quickStart: {
        heading: 'Hızlı Başlangıç',
        steps: [
          'Command Deck broşürünü açın veya menü için !tokencontroller yazın.',
          "Bazı hazır rotalar eklemek için Örnekler'e veya kendi rotanızı yazmak için Adım Kodu'na (örneğin U2R2D2L2) tıklayın.",
          "Bir veya daha fazla jeton seçin ve rotanın yanındaki Başlat'a tıklayın.",
          "Bir jeton seçin ve durdurmak için Durdur'a veya başladığı yere geri göndermek için Sıfırla'ya tıklayın.",
        ],
      },
      routes: {
        heading: 'Rota Oluşturma',
        points: [
          'Adım kodu: U2R2D2L2 gibi hareketleri yazın. Kodlar haritadaki bir yere bağlı değildir, dolayısıyla her yerde aynı rota çalışır.',
          'Çizimden: çizim araçlarını kullanarak bir çizgi, çokgen, serbest şekil, dikdörtgen veya elips çizin, seçin ve Çizimden öğesine tıklayın. Jetonlar yalnızca bu sayfada yürür. Daha sonra çizimi silebilirsiniz.',
          "Kaydet: Bir belirteç seçin ve Kaydet'e tıklayın. Ok düğmeleriyle hareket ettirin veya harita üzerinde sürükleyin (Roll20 yol noktaları takip edilir), ardından Kaydet'e tıklayın. Kare ızgaralarda kayıt, düzenleyebileceğiniz bir adım koduna dönüşür.",
          'Döngü rotaları yeniden baştan başlar; ileri geri rotalar geldikleri yoldan geri yürür; rotalar sonunda durduğunda. Döngünün başladığı yerde biten yeni rotalar; diğerleri ileri geri gider.',
          "Sıçrama Alanı: alanın çevresine kapalı bir şekil çizin, onu seçin ve Sıçrama Alanı'na tıklayın. Üzerinde başlatılan jetonlar düz çizgiler halinde hareket eder ve kenarlarından (ve rota onları görmezden gelmediği sürece duvarlardan) sekerek her seferinde biraz rastgele döner. Rastgele başlangıç, her jetonu alanın rastgele bir hücresine yerleştirir.",
        ],
      },
      codes: {
        colCode: 'Kod',
        colMeaning: 'Anlam',
        move: 'Yukarı, aşağı, sola veya sağa bir hücre hareket ettirin.',
        diagonal: 'Çapraz olarak hareket edin.',
        distance: 'Bir yönden sonraki bir sayı o kadar hücreyi hareket ettirir.',
        face: 'Hareket etmeden bir yöne dönün (Dönüş Jetonlarına ihtiyaç duyar).',
        wait: 'Bir adım veya belirtilen sayıda adım bekleyin.',
        stealth:
          'Belirteci, belirteç katmanı ile GM katmanı arasında hareket ettirin, böylece kaybolur ve yeniden görünür.',
      },
      routeOptions: {
        heading: 'Rota Seçenekleri',
        colOption: 'Seçenek',
        colMeaning: 'Anlam',
        mode: 'döngü, pingpong (ileri geri) veya bir kez.',
        interval: 'Bu rota için adım başına milisaniye veya genel aralık için 0.',
        max: 'Aynı anda rotada olabilecek en fazla jeton veya sınırsız olarak 0.',
        random: 'açık: her jeton rota boyunca rastgele bir noktada başlar.',
        walls:
          'görmezden gelin (duvarlardan geçin), tutun (duvarlarda ve kapalı kapılarda bekleyin), dönün (geri dönün) veya varsayılanı kullanın (Duvarlar ayarını kullanın).',
        start:
          'set: jetonlar başladığında seçilen jetonun konumuna atlar. açık: durdukları yerden başlıyorlar.',
      },
      tokens: {
        heading: 'Tokenların Kontrolü',
        points: [
          'Bir jeton aynı anda tek bir rota üzerindedir. Başka bir rotadan başlamak ilkinin yerini alır.',
          'Stop, jetonları oldukları yerde bırakır. Sıfırlama, onları başlamadan önceki konumlarına, orijinal katmanlarına geri getirir.',
          'Kilit, jetonu yerinde tutar. Kilitli jetonlar, kilidi açılana kadar devriye gezmez veya takip etmez.',
          "Takip et: lideri seçin ve Lider'e tıklayın, ardından takipçileri seçin ve Takip Et'e tıklayın. Ayrıca liderin adını da yazabilirsiniz: !tokencontroller Goblin Boss'u takip edin. Takipçiler devriye gezen jetonları, sürüklediğiniz jetonları ve TokenMod tarafından taşınan jetonları takip eder.",
          'Takipçiler diğer takipçileri takip ederek bir zincir veya sütun oluşturabilirler.',
          'Bir Devriyeyi Sürüklemek durmaya ayarlı olmadığı sürece, bir devriye jetonunu sürüklemek, devriyeyi bıraktığınız yerden devam ettirir.',
          'Duvarlar: Duvarlar ayarı açıkken devriyeler ve takipçiler dinamik aydınlatmalı duvarlardan veya kapalı kapı ve pencerelerden geçmez; açık kapılar ve pencereler onların geçmesine izin veriyor. Bir rotaya kendi duvarları seçeneğini verin (örneğin bir hayaleti görmezden gelin).',
          'Durdurma İşaretçileri: Bu durum işaretleyicilerinden (örneğin ölü) birini alan bir token, rotasını terk eder ve takip etmeyi bırakır ve bir liderin takipçileri de bir durak alır. Bunları !tokencontroller set stopMarkers dead;red ile ayarlayın. Bu aynı zamanda başka bir Mod işaretçiyi eklediğinde de çalışır.',
        ],
      },
      grids: {
        heading: 'Izgaralar',
        points: [
          'Hücre boyutu ve ızgara türü her sayfadan okunur, böylece farklı sayfalar farklı ızgaralar kullanabilir.',
          'U ve D her zaman ekranın yukarısı ve aşağısı anlamına gelir. Altıgen ızgaralarda, eşleşen komşu zigzag olmadan hareket eder; izometrik ve dimetrik ızgaralarda köşegenler bir elmasla kesişir.',
          'Yakalamanın kapalı olduğu sayfalar, bir ızgaraya göre sıralanmadan 70 piksellik adımlarla hareket eder.',
          "Belirteçler ızgaradan saparsa, bir belirteci hücre merkezine tutturun, seçin ve Kalibre Et'e tıklayın. Hücre boyutunu da sabitlemek için bir satırın komşu hücrelerinde iki jeton seçin.",
        ],
      },
      combat: {
        heading: 'Dövüş',
        points: [
          'Savaş Tespiti, savaşın nasıl fark edileceğini seçer: dönüş izleyici, Savaş Açma/Kapama düğmeleri veya bunlardan herhangi biri.',
          'Savaş Davranışı devriyelerin ne yapacağını seçer: Duraklatın, her dönüşte bir adım ilerleyin veya ilerlemeye devam edin.',
          'Tümünü Duraklat; her devriyeyi herhangi bir zamanda durdurur; Devam ettir onları yeniden başlatır.',
        ],
      },
      commands: {
        heading: 'Komutlar',
        intro:
          'Bu komutları yalnızca GM\'ler kullanabilir. Rotalar, menü düğmelerinden #id\'leriyle adlandırılabilir veya bunlara başvurulabilir. Bir komut iki ad aldığında adları boşluklu olarak "tırnak" içine koyun.',
        mods: "Diğer Modlar da bu komutları örneğin ScriptCard'lardan gönderebilir. Belirteçleri seçemezler, bu nedenle onları --ids ve ardından noktalı virgülle ayrılmış belirteç kimlikleriyle adlandırırlar: !tc stop --ids ID1;ID2. Cevaplar GM'ye gidiyor.",
        colCommand: 'Emretmek',
        colDesc: 'Ne işe yarar',
      },
      settings: {
        heading: 'Ayarlar',
        intro:
          '!tokencontroller set <setting> <value> seçeneğini kullanarak menüden veya API Komut Dosyaları ekranındaki Mod ayarları sayfasından ayarları değiştirin.',
        colKey: 'Anahtar',
        colName: 'Ayar',
        colDesc: 'Tanım',
      },
      upgrading: {
        heading: "Sürüm 4'ten yükseltme",
        points: [
          'Yollar, devriye jetonları, kilitler, takipçiler ve tamamlanmamış taslaklar saklanır. Taslaklar "(taslak)" ile biten rotalara dönüşür.',
          'Sürüm 4 ayarlarınız korunur: aralık, alt adımlar, dönüş, savaş devriyesi ve tıklama başına birim.',
          '!tc ve !token-control komutları ve T-Cntrl_ makroları çalışmaya devam eder. Tablo yeni komutları göstermektedir.',
          'Sürüm 4, her işlemden sonra tüm menüyü gönderdi; sürüm 5 bunun yerine kısa bir yanıt gönderir.',
          "Birim Başına Piksel ayarı kaldırıldı: hücre boyutu her sayfadan geliyor. HTML Builder'a artık gerek yok.",
          "Her oyuncunun görebileceği eski Kullanım Kılavuzu broşürünün yerini yalnızca GM'ye özel broşür aldı.",
        ],
        colV4: 'Sürüm 4',
        colV5: 'Sürüm 5',
      },
      troubleshooting: {
        heading: 'Sorun giderme',
        points: [
          'Jetonlar hareket etmiyor: Durumu kontrol edin. Devriyeler duraklatıldığında, kilitliyken ve Savaş Davranışı duraklatıldığında savaşta bekler.',
          'Jetonlar yanlış mesafeye hareket ediyor: sayfanın ızgara boyutu veya yapışması değişmiş olabilir; Kalibre etmeyi deneyin.',
          'Çizilen bir rota başlamayacaktır: Çizilen rotalar yalnızca çizildikleri sayfada çalışır.',
          "Başka bir Mod lideri hareket ettirdiğinde takipçiler hareket etmez: yalnızca TokenMod hamlelerini bildirir. Diğer Modlar TokenController.ObserveTokenChange'i çağırabilir.",
          'API konsolundan gelen herhangi bir mesajla ilgili sorunları Roll20 forumunda bildirin.',
        ],
      },
      languages: {
        heading: 'Diller',
        body: 'TokenController aşağıdaki dillere çevrilmiştir. Dil ayarına sahip birini seçin.',
        colCode: 'Kod',
        colName: 'Dil',
        colNative: 'Yerel ad',
      },
      credits: {
        heading: 'Kredi',
        original: 'Orijinal Mod:',
        maintainer: 'Versiyon 5 tarafından sürdürülen',
        support: "Hataları ve fikirleri Roll20 Mod forumunda veya GitHub'da bildirin.",
      },
      footer: 'Her eyleme ilişkin düğmeler "{deck}" broşüründe yer almaktadır.',
    },
    deck: {
      subtitle: 'Komut Güvertesi',
      patrolsDesc: 'Devriyeleri başlatın, durdurun ve duraklatın. Önce belirteçleri seçin.',
      createDesc: 'Bir adım kodundan, bir çizimden veya bir jeton kaydederek rotalar oluşturun.',
      selectedDesc: 'Jetonları kilitleyin veya bir lideri takip etmelerini sağlayın.',
      toolsDesc: 'Savaş, ayarlar ve ızgara araçları.',
      footer: 'Talimatların tamamı "{help}" broşüründe yer almaktadır.',
    },
  };

  const TRANSLATION = {
    titles: {
      ready: 'TokenController готовий.',
      settings: 'Налаштування TokenController',
      help: 'Команди TokenController',
      export: 'Експорт маршруту',
      routes: 'Маршрути',
      tokens: 'Контрольовані токени',
      status: 'Статус TokenController',
    },
    messages: {
      migrated:
        'Оновлено з версії 4. Збережено маршрути: {routes}. Збережено маркери патрулювання: {patrols}. Ваші старі макроси та команди !tc все ще працюють.',
      removedGuide:
        'Старий роздатковий матеріал «Посібник із використання TokenController», який могли бачити гравці, було замінено роздатковим матеріалом довідки лише для GM.',
      pruned: 'Патрулі забуті, оскільки їх жетони більше не існують: {count}.',
      readyHint:
        'Введіть !tokencontroller для меню або відкрийте роздатковий матеріал Command Deck.',
      combatStarted: {
        pause: 'Бій почався: патрулювання призупинено до його закінчення.',
        step: 'Почався бій: патрулі рухаються на один крок за хід.',
      },
      combatEnded: 'Бій закінчено: патрулювання продовжується.',
      routeAdded: 'Додано маршрут "{name}" ({mode}).',
      routeUpdated:
        'Маршрут "{name}" оновлено. Жетони на ньому продовжують рух за новим маршрутом.',
      confirmRemove: 'Видалити маршрут "{name}"? Жетони на ньому, які зупиняться: {count}.',
      routeRemoved: 'Маршрут "{name}" видалено. Токени зупинено: {count}.',
      routeRenamed: 'Маршрут "{from}" перейменовано на "{to}".',
      examplesAdded: 'Додано приклади маршрутів: {count}.',
      exportHint: 'Скопіюйте текст нижче та вставте його після {command} у будь-якій грі.',
      imported:
        'Імпортовано {added} маршрутів; пропущено {skipped} (назва вже використана або недійсна).',
      started: '{tokens} почався на "{name}".',
      stopped: 'Токени зупинено: {count}.',
      reset: 'Токени повернулися туди, звідки вони почали: {count}.',
      locked: 'Заблоковано: {tokens} ({mode}).',
      unlocked: 'Розблоковано: {tokens}.',
      leaderSet: '{token} є лідером. Виберіть підписників і натисніть Підписатися.',
      following: 'Тепер підписаний на {leader} ({mode}): {tokens}.',
      unfollowed: 'Маркери більше не підписуються: {count}.',
      noRecordings: 'Нічого не записується.',
      recordingCancelled: 'Запис "{name}" скасовано.',
      languages: 'Підтримувані мови: {list}',
      settingChanged: '{setting} тепер {value}.',
      combatOn: 'Бой увімкнено.',
      combatOff: 'Бій вимкнено.',
      calibrationCleared: 'Калібрування сітки видалено з цієї сторінки.',
      calibrated: 'Сітку відкалібровано для цієї сторінки (розмір комірки × {scale}).',
      paused: 'Усі патрулі зробили паузу.',
      resumed: 'Патрулювання відновили.',
      journalRebuilt: 'Роздаткові матеріали перебудовано: {help} та {deck}.',
      markerStopped: 'Зупинено маркером зупинки: {tokens}.',
      markerReset: 'Повернуто туди, звідки вони почали, маркер зупинки: {tokens}.',
    },
    errors: {
      noTokens: 'Токенів не вибрано.',
      noRouteName: 'Назви маршруту не вказано.',
      routeNotFound: 'Немає маршруту під назвою "{name}".',
      routeExists: 'Уже існує маршрут під назвою "{name}".',
      code: {
        empty: 'Код кроку порожній.',
        badToken: 'Код кроку "{code}" щось не розуміє в "{at}".',
        tooFar: 'Крок "{at}" задовгий.',
      },
      routeInvalid: 'Цей маршрут не вдалося зберегти.',
      usageAdd: 'Введіть назву та код кроку.',
      usageEdit: 'Вкажіть маршрут і новий код кроку.',
      selectOneDrawing:
        'Виберіть рівно один малюнок (лінію, багатокутник, форму від руки, прямокутник або еліпс).',
      drawingEmpty: 'Вибраний малюнок має занадто мало точок для наслідування.',
      usageRoute: 'Вкажіть маршрут, варіант і значення.',
      unknownRouteOption: 'Немає параметра маршруту під назвою "{option}".',
      selectOneToken: 'Виберіть рівно один жетон.',
      badRouteValue: '"{value}" не є дійсним значенням для {option}.',
      usageRename: 'Дайте маршрут і його нову назву.',
      usageCopy: 'Вкажіть маршрут і назву копії.',
      badJson: 'Це не текст експорту маршруту.',
      tokenLocked: '{tokens} не може запуститися: заблоковано.',
      tokenMarked: '{tokens} не може початися: у них є маркер зупинки.',
      outsideArea: '{tokens} не може запуститися: вони за межами "{name}".',
      selectOneArea:
        'Виберіть рівно один закритий малюнок (багатокутник, прямокутник, еліпс або петлю від руки).',
      areaTooSmall: 'Вибраний малюнок потребує принаймні трьох кутів, щоб створити область.',
      idsNotFound: 'Жоден маркер не має таких ідентифікаторів: {ids}.',
      routeOnOtherPage: '{tokens} не може початися: "{name}" намальовано на іншій сторінці.',
      startOnOtherPage:
        '{tokens} не може початися: фіксований початок "{name}" знаходиться на іншій сторінці.',
      routeFull: '{tokens} не може початися: "{name}" вже має {max} токенів.',
      noPage: 'Сторінку не вдалося знайти.',
      emptyTrack: '{tokens} не може початися: "{name}" не має ходів.',
      leaderNotFound: 'На цій сторінці не знайдено жодного маркера під назвою "{name}".',
      noLeader: 'Лідера ще немає.',
      followLoop: '{tokens} не може стежити за маркером, який слідує за ними.',
      alreadyRecording: '{token} вже записується.',
      recordingTokenGone: 'Маркер для запису "{name}" більше не існує.',
      recordingEmpty: 'Ще нічого не записано.',
      unknownSetting: 'Немає параметра під назвою "{key}".',
      badSettingValue: '"{value}" не є дійсним значенням для {key}.',
      calibrateNeedsTokens: 'Виберіть один або два маркери, прив’язані до центрів клітинок.',
      calibrateFailed: 'Вибрані маркери не можна використати для калібрування сітки.',
      unknownCommand: 'Невідома команда "{command}".',
      gmOnly: 'Тільки GM може використовувати TokenController.',
      internal: 'Щось пішло не так. Деталі в консолі API.',
    },
    hints: {
      noTokens: 'Спочатку виберіть жетони на карті.',
      noRouteName: 'Наприклад: !tokencontroller add Guard Walk U2R2D2L2',
      routeNotFound: 'Введіть !tokencontroller list, щоб переглянути всі маршрути.',
      code: {
        empty: 'Наприклад: U2R2D2L2',
        badToken:
          'Використовуйте U, D, L, R, UL, UR, DL або DR з кількістю комірок, W для очікування та S для скритності.',
        tooFar: 'Один крок може містити не більше 100 комірок; чекає щонайбільше 100 тиків.',
      },
      selectOneDrawing:
        'Намалюйте маршрут за допомогою інструмента для малювання, виділіть його (перетягніть рамку навколо тонкого контуру, якщо клацання пропустив його), а потім повторіть спробу.',
      usageRoute: 'Опції: режим, інтервал, максимум, випадковий, стіни, старт.',
      routeOnOtherPage: 'Намальовані маршрути працюють лише на сторінці, на якій вони намальовані.',
      startOnOtherPage:
        'Очистіть фіксований початок або спочатку перемістіть маркер на цю сторінку.',
      noLeader:
        'Виберіть лідера та натисніть «Лідер» або вкажіть його назву: !tokencontroller follow Name',
      leaderNotFound:
        'Використовуйте назву маркера, як показано на карті, або його ідентифікатор маркера.',
      badJson: 'Точно вставте текст із експорту !tokencontroller (або шляхів експорту v4).',
      unknownSetting: 'Введіть !tokencontroller set, щоб переглянути всі налаштування.',
      calibrateNeedsTokens:
        'Один жетон вирівнює сітку; два маркери в сусідніх клітинках рядка також фіксують розмір клітинки.',
      calibrateFailed:
        'Переконайтеся, що маркери знаходяться в сусідніх клітинках того самого рядка (стовпець на сторінках Hex (H)).',
      unknownCommand: 'Введіть !tokencontroller help для списку команд.',
      tokenLocked: 'Спочатку розблокуйте маркер.',
      tokenMarked: 'Видаліть маркер або змініть параметр Зупинити маркери.',
      outsideArea:
        'Спочатку перемістіть жетони всередину області або ввімкніть випадковий початок маршруту.',
      selectOneArea:
        'Намалюйте область за допомогою інструмента для малювання, виділіть її (перетягніть рамку навколо тонкого контуру, якщо клацання його пропускає), а потім повторіть спробу.',
      idsNotFound: 'Укажіть ідентифікатори токенів після --ids, розділивши їх крапкою з комою.',
    },
    warnings: {
      idsNotFound: 'Жоден маркер не має цих ідентифікаторів, тому їх було пропущено: {ids}.',
      offPage:
        'Частина маршруту проходить поза сторінкою (кроки: {count}). Ці кроки пропускаються.',
      combatTrackerOnly:
        'Combat Detection встановлено на трекер повороту, тому цей перемикач не діє, доки ви його не зміните.',
      unitPx:
        'Версія 5 зчитує розмір комірки з кожної сторінки, тому старе налаштування пікселів на одиницю більше не використовується. Якщо токени не вирівнюються, використовуйте !tokencontroller calibrate.',
    },
    values: {
      on: 'Увімкнено',
      off: 'Вимкнено',
      none: 'Жодного',
      default: 'За замовчуванням',
      noLimit: 'Без обмежень',
      ms: '{ms} мс',
      andMore: 'і ще {count}',
      following: 'стежити за {leader}',
      locked: 'заблокований',
      gridless: 'немає клацання',
      grid: {
        square: 'Квадратний',
        hex: 'Шестикутна',
        iso: 'Ізометричний / диметричний',
      },
      mode: {
        loop: 'Петля',
        pingpong: 'Вперед і назад',
        once: 'Один раз',
      },
      movement: {
        cell: 'По одній клітинці',
        segment: 'Весь крок за раз',
      },
      facing: {
        off: 'Не обертайте',
        up: 'Мистецтво обличчям догори',
        down: 'Мистецтво обличчям вниз',
        left: 'Мистецькі обличчя ліворуч',
        right: 'Мистецтво обличчям праворуч',
      },
      combatDetection: {
        tracker: 'Трекер поворотів',
        manual: 'Перемикач GM',
        both: 'Поверніть трекер або перемикач GM',
      },
      combatBehaviour: {
        pause: 'Пауза',
        step: 'Рухайтесь кожен хід',
        ignore: 'Продовжуйте рухатися',
      },
      lockMode: {
        native: 'Блокування положення Roll20',
        revert: 'Скасувати ходи',
        freeze: 'Тільки тримайся нерухомо',
      },
      followMode: {
        trail: 'Один файл',
        formation: 'формування',
      },
      manualMove: {
        continue: 'Продовжуйте звідти',
        stop: 'Зупиніть патруль',
      },
      markerAction: {
        stop: 'Зупиніться там, де є',
        reset: 'Поверніться до початку',
      },
      wallMode: {
        ignore: 'Пройти крізь стіни',
        hold: 'Чекай біля стін',
        turn: 'Поверніться до стін',
      },
      wallCheck: {
        centre: 'Центр жетона',
        width: 'Цілий жетон',
      },
      oneWayWalls: {
        block: 'Блокувати',
        pass: 'Пропустити',
      },
      transparentWalls: {
        block: 'Блокувати',
        pass: 'Пропустити',
      },
    },
    menu: {
      statusRunning: 'Жетони патрулювання: {patrols}. Маршрути: {routes}.',
      statusPaused: 'Усі патрулі призупинені.',
      statusCombat: {
        pause: 'У бою: патрулювання призупинено.',
        step: 'У бою: патрулі рухаються кожен крок.',
      },
      routes: 'Маршрути',
      noRoutes:
        'Маршрутів ще немає. Додайте один, намалюйте один, запишіть один або додайте приклади.',
      create: 'Новий маршрут',
      selected: 'Вибрані токени',
      tools: 'Інструменти',
      recordings: 'Записи',
      patrols: 'Патрулі',
    },
    buttons: {
      start: 'старт',
      stop: 'СТІЙ',
      add: 'Код кроку',
      draw: 'З Малювання',
      bounce: 'Область відскоку',
      record: 'запис',
      examples: 'Приклади',
      reset: 'Скинути',
      lock: 'Замок',
      unlock: 'Розблокувати',
      leader: 'Лідер',
      follow: 'Слідуйте',
      unfollow: 'Відписатися',
      resume: 'Відновити',
      pause: 'Призупинити все',
      combatOn: 'Бій увімк.',
      combatOff: 'Бій вимк.',
      stopAll: 'Зупинити все',
      settings: 'Налаштування',
      status: 'Статус',
      help: 'Довідка',
      open: 'ВІДЧИНЕНО',
      clearStart: 'ясно',
      setStart: 'Встановити Вибране',
      edit: 'Редагувати код',
      rename: 'Перейменувати',
      copy: 'Копія',
      export: 'Експорт',
      remove: 'видалити',
      menu: 'Меню',
      wait: 'Зачекайте',
      stealth: 'Стелс',
      undo: 'Скасувати',
      save: 'зберегти',
      cancel: 'Скасувати',
      confirm: 'Так, видалити',
      startRoute: 'Початок маршруту',
      list: 'Список маршрутів',
      calibrate: 'Відкалібрувати',
    },
    prompts: {
      name: 'Назва маршруту',
      code: 'Код кроку',
      interval: 'Мілісекунди на крок (0 = за умовчанням)',
      maxTokens: 'Більшість токенів одночасно (0 = без обмежень)',
      newName: 'Нова назва',
      route: 'Назва маршруту',
    },
    route: {
      drawn: 'Накреслений маршрут, {points} балів',
      recorded: 'Записаний маршрут, {points} балів',
      area: 'Область відскоку, {points} кутів',
      path: 'шлях',
      mode: 'Режим',
      interval: 'Інтервал',
      maxTokens: 'Більшість жетонів',
      randomStart: 'Випадковий старт',
      walls: 'Стіни',
      start: 'Фіксований старт',
      tokens: 'Жетони',
    },
    record: {
      title: 'Запис "{name}"',
      intro:
        'Запис {token} (переміщено: {count}). Натисніть стрілки або перетягніть жетон на карті; кожен рух записується.',
    },
    settings: {
      interval: {
        label: 'Інтервал',
        desc: 'Мілісекунди між кроками. Кожен маршрут може його замінити.',
      },
      movement: {
        label: 'Рух',
        desc: 'клітинка переміщується на одну клітинку за крок; segment переміщує весь крок (наприклад, U3) одночасно, як це робила версія 4.',
      },
      facing: {
        label: 'Жетони повороту',
        desc: 'Повертайте жетони так, куди вони йдуть: убік або так, як зображення жетонів дивиться (вгору, вниз, ліворуч або праворуч).',
      },
      combatDetection: {
        label: 'Бойове виявлення',
        desc: 'Як помічається бій: трекер (трекер поворотів відкритий і хтось у ньому), ручний (кнопки увімкнення/вимкнення бою) або обидва.',
      },
      combatBehaviour: {
        label: 'Бойова поведінка',
        desc: 'Що роблять патрулі під час бою: зупиняються, крокують (рухаються один раз, коли проходить хід) або ігнорують (продовжують рухатися).',
      },
      lockMode: {
        label: 'Режим блокування',
        desc: 'Як Lock утримує маркер: нативний (власне блокування позиції Roll20, щоб ніхто не міг його перетягнути), повернення (рухи скасовуються) або заморожування (він припиняє патрулювання та слідування, але його все одно можна перетягувати).',
      },
      lockMarker: {
        label: 'Маркер замка',
        desc: 'Маркер статусу відображається на заблокованих токенах або відсутній. Гравці бачать маркери.',
      },
      followMode: {
        label: 'Слідкуйте за режимом',
        desc: 'стежка: послідовники йдуть по одному слідом за лідером. формування: послідовники зберігають своє місце навколо лідера (перетягніть послідовника, щоб змінити його місце).',
      },
      manualMove: {
        label: 'Перетягування патруля',
        desc: 'Коли ви перетягуєте жетон патрулювання: продовжуйте (маршрут продовжується з того місця, де ви його кинули) або зупиняйтеся (патрулювання закінчується).',
      },
      stopMarkers: {
        label: 'Маркери зупинки',
        desc: 'Маркери статусу, які відхиляють маркер від його маршруту та зупиняють його слідування, розділені крапкою з комою (наприклад, мертвий; червоний) або жодного. Послідовники лідера з одним із цих маркерів також зупиняються.',
      },
      markerAction: {
        label: 'Зупинити дію маркера',
        desc: 'Що робить жетон патрулювання, коли він отримує маркер зупинки: зупиняється (він залишається там, де є) або скидається (він повертається туди, звідки почав).',
      },
      wallMode: {
        label: 'Стіни',
        desc: 'Що роблять патрулі та супроводжувачі при динамічному освітленні стін і закритих дверях і вікнах: ігнорують (проходять), тримають (чекають, поки шлях звільниться, наприклад, поки двері відчиняться) або повертають (патрулі повертаються назад). Кожен маршрут може вибрати свій, тому привиди все одно можуть проходити крізь стіни.',
      },
      wallCheck: {
        label: 'Перевірка стіни',
        desc: 'центр: тільки середина жетона має залишатися подалі від стін. ширина: весь жетон відповідає, тому великий жетон не може протиснутися через вузьку щілину.',
      },
      oneWayWalls: {
        label: 'Односторонні стіни',
        desc: 'Чи зупиняють односторонні стіни жетони (блокувати) чи ні (пропускати).',
      },
      transparentWalls: {
        label: 'Прозорі стіни',
        desc: 'Чи прозорі стіни, які пропускають світло, зупиняють жетони (блокують) чи ні (пропускають).',
      },
      buttonStep: {
        label: 'Клітинки за клік',
        desc: 'Наскільки стрілки запису пересувають жетон.',
      },
      language: {
        label: 'Мова',
        desc: 'Мова для меню, повідомлень і роздаткових матеріалів.',
      },
    },
    status: {
      routes: 'Маршрути',
      patrols: 'Патрульні жетони',
      followers: 'Наступні токени',
      locked: 'Заблоковані жетони',
      recordings: 'Записи',
      paused: 'Призупинено',
      combat: 'Бойовий',
      page: 'Поточна сторінка',
      grid: 'Сітка',
      cell: 'Розмір комірки',
      calibration: 'Калібрування',
    },
    help: {
      menu: 'Показати меню.',
      start: 'Покладіть вибрані жетони на маршрут.',
      stop: 'Зупиніть вибрані жетони (патрулювання та слідування), кожен жетон на маршруті або всі.',
      reset: 'Поверніть жетони туди, звідки вони почали, і зупиніть їх.',
      pause: 'Призупинити або відновити кожне патрулювання.',
      lock: 'Утримуйте вибрані жетони на місці або відпустіть їх.',
      leader: 'Виберіть вибраний жетон як лідер, за яким слід слідувати.',
      follow: 'Зробіть так, щоб вибрані жетони йшли за лідером або жетоном, названим ім’ям.',
      unfollow: 'Зупинити наступні вибрані токени.',
      add: 'Створіть маршрут із коду кроку, наприклад U2R2D2L2.',
      edit: 'Змінити код кроку маршруту.',
      draw: 'Створіть маршрут за вибраним малюнком на цій сторінці.',
      bounce:
        'Створіть маршрут, за яким жетони блукають усередині вибраного закритого малюнка, відскакуючи від його країв.',
      record: 'Записуйте маршрут, переміщуючи вибраний жетон кнопками або перетягуючи його.',
      route: 'Змініть варіант маршруту: режим, інтервал, максимум, випадковий, стіни або початок.',
      show: 'Показати деталі маршруту та кнопки.',
      rename: 'Перейменувати маршрут.',
      copy: 'Скопіюйте маршрут під новою назвою.',
      remove: 'Видалити маршрут (спочатку запитує).',
      ids: 'Дійте на токени з цими ідентифікаторами замість вибраних, щоб інші моди, такі як ScriptCards, могли контролювати токени. видалити --ids знімає жетони зі своїх маршрутів; він ніколи не видаляє маршрут.',
      list: 'Перелічіть маршрути або маркери, які контролюються.',
      examples: 'Додайте приклади маршрутів.',
      export: 'Показувати маршрути як текст для копіювання в іншу гру.',
      import: 'Додайте маршрути з тексту експорту.',
      combat: 'Вмикайте або вимикайте бій вручну.',
      set: 'Змінити налаштування або показати всі налаштування.',
      calibrate:
        'Вирівняйте сітку за допомогою жетонів, прикріплених до центрів комірок, або видаліть калібрування.',
      status: 'Покажіть, що робить Мод і як він бачить цю сторінку.',
      journal: 'Перебудуйте роздаткові матеріали довідки та командної колоди.',
      help: 'Покажіть цей список.',
      footer:
        'Повні інструкції наведено в роздатковому матеріалі "{help}". кнопки знаходяться в "{deck}". {legacy} все ще працює з командами версії 4.',
    },
    handout: {
      versionLabel: 'Версія',
      subtitle: 'Патрулі, послідовники та замки для ігор Jumpgate та Legacy',
      overview: {
        heading: 'Огляд',
        body: 'TokenController переміщує токени за вас. Вкажіть охоронцеві маршрут патрулювання, попросіть візок слідувати за водієм або зафіксуйте статую на місці. Маршрути можна вводити як кроковий код, простежувати за малюнком на карті або записувати, переміщуючи маркер. Маршрути працюють на квадратних, шестигранних, ізометричних, диметричних сторінках і сторінках без сітки.',
      },
      quickStart: {
        heading: 'Швидкий старт',
        steps: [
          'Відкрийте роздатковий матеріал Command Deck або введіть !tokencontroller для меню.',
          'Натисніть «Приклади», щоб додати кілька готових маршрутів, або «Код кроку», щоб ввести власний (наприклад, U2R2D2L2).',
          'Виберіть один або кілька маркерів і натисніть Почати поруч із маршрутом.',
          'Виберіть маркер і натисніть «Зупинити», щоб зупинити його, або «Скинути», щоб повернути його туди, звідки він почався.',
        ],
      },
      routes: {
        heading: 'Створення маршрутів',
        points: [
          'Код кроку: введіть такі ходи, як U2R2D2L2. Коди не прив’язані до місця на карті, тому той самий маршрут працює будь-де.',
          'З малюнка: намалюйте лінію, багатокутник, фігуру від руки, прямокутник або еліпс за допомогою інструментів малювання, виділіть це та натисніть «З малюнка». Жетони проходять уздовж нього, лише на цій сторінці. Згодом малюнок можна видалити.',
          'Запис: виберіть маркер і натисніть Записати. Перемістіть його за допомогою кнопок зі стрілками або перетягніть на мапі (дотримуйтеся маршрутних точок Roll20), а потім натисніть «Зберегти». На квадратних сітках запис стає кроковим кодом, який можна редагувати.',
          'Кольцеві маршрути починаються спочатку; туди-назад маршрути повертаються тим шляхом, яким вони прийшли; один раз маршрути зупиняються в кінці. Нові маршрути, які закінчуються там, де вони починаються; інші ходять туди-сюди.',
          'Зона відскоку: намалюйте замкнуту форму навколо області, виберіть її та клацніть «Область відскоку». Жетони, запущені на ньому, рухаються по прямих лініях і відскакують від його країв (і від стін, якщо маршрут їх не ігнорує), щоразу трохи повертаючись навмання. Випадковий початок поміщає кожен жетон у випадкову клітинку області.',
        ],
      },
      codes: {
        colCode: 'Код',
        colMeaning: 'Значення',
        move: 'Переміщення вгору, вниз, вліво або вправо на одну клітинку.',
        diagonal: 'Рухайтеся по діагоналі.',
        distance: 'Число після напрямку переміщує стільки клітинок.',
        face: 'Поверніться обличчям у певному напрямку, не рухаючись (потрібні жетони повороту).',
        wait: 'Зачекайте один крок або вказану кількість кроків.',
        stealth:
          'Перемістіть маркер між шаром маркерів і шаром GM, щоб він зникав і знову з’являвся.',
      },
      routeOptions: {
        heading: 'Параметри маршруту',
        colOption: 'Варіант',
        colMeaning: 'Значення',
        mode: 'петля, пінг-понг (вперед і назад) або один раз.',
        interval: 'Мілісекунди на крок для цього маршруту або 0 для глобального інтервалу.',
        max: 'Максимальна кількість жетонів, які можуть бути на маршруті одночасно, або 0 без обмежень.',
        random: 'on: кожен жетон починається з випадкової точки на маршруті.',
        walls:
          'ігнорувати (проходити крізь стіни), утримувати (чекати біля стін і зачинених дверей), повертати (повертатись назад) або за замовчуванням (використовуйте налаштування «Стіни»).',
        start:
          'set: жетони переходять на позицію вибраного жетона, коли вони починаються. ясно: вони починають там, де стоять.',
      },
      tokens: {
        heading: 'Контрольні токени',
        points: [
          'Жетон перебуває на одному маршруті за раз. Запуск по іншому маршруту замінює перший.',
          'Зупинка залишає жетони там, де вони є. Скидання повертає їх на вихідний шар, де вони були до початку.',
          'Замок утримує жетон на місці. Заблоковані жетони не патрулюють і не слідують, доки не розблокують.',
          'Стежити: виберіть лідера та натисніть Лідер, потім виберіть послідовників і натисніть Слідувати. Ви також можете ввести ім’я лідера: !tokencontroller follow Goblin Boss. Підписники стежать за жетонами, які патрулюють, за жетонами, які ви перетягуєте, і за жетонами, які переміщує TokenMod.',
          'Підписники можуть слідувати за іншими підписниками, створюючи ланцюжок або колону.',
          'Перетягування жетона патрулювання продовжує патрулювання з того місця, де ви його впустили, якщо перетягування патруля не зупинено.',
          'Стіни: з увімкненим параметром «Стіни» патрулі та слідчі не проходять через стіни з динамічним освітленням або закриті двері та вікна; відкриті двері та вікна пропускають їх. Надайте маршруту власні стіни (наприклад, ігноруйте для привида).',
          'Маркери зупинки: маркер, який отримує один із цих маркерів статусу (наприклад, мертвий), залишає свій маршрут і припиняє слідувати, а також послідовники лідера, який отримує одну зупинку. Встановіть їх за допомогою !tokencontroller set stopMarkers dead;red. Це також працює, коли інший мод додає маркер.',
        ],
      },
      grids: {
        heading: 'Сітки',
        points: [
          'Розмір комірки та тип сітки зчитуються з кожної сторінки, тому різні сторінки можуть використовувати різні сітки.',
          'U та D завжди означають вгору та вниз по екрану. На шістнадцятковій сітці рухається без сусідніх зигзагів; на ізометричній і диметричній сітках діагоналі перетинають один ромб.',
          'Сторінки з вимкненою прив’язкою переміщуються з кроком у 70 пікселів без вишикування до сітки.',
          'Якщо маркери відходять від сітки, прив’яжіть маркер до центру комірки, виберіть його та натисніть «Калібрувати». Виберіть два маркери в сусідніх клітинках рядка, щоб також зафіксувати розмір клітинки.',
        ],
      },
      combat: {
        heading: 'Бойовий',
        points: [
          'Combat Detection вибирає, як буде помічено бій: трекер повороту, кнопки ввімкнення/вимкнення бою або будь-яке інше.',
          'Бойова поведінка вибирає, що робити патрулям: зупинятися, рухатися на один крок кожного разу, коли минає хід, або продовжувати рух.',
          'Пауза для всіх зупиняє кожне патрулювання в будь-який час; Відновлення починає їх знову.',
        ],
      },
      commands: {
        heading: 'Команди',
        intro:
          'Тільки GM можуть використовувати ці команди. Маршрути можна назвати або посилатися за їх #id за допомогою кнопок меню. Помістіть імена з пробілами в лапки, коли команда приймає два імена.',
        mods: 'Інші моди також можуть надсилати ці команди, наприклад, із ScriptCards. Вони не можуть вибрати маркери, тому вони називають їх за допомогою --ids, після якого йдуть ідентифікатори маркерів, розділені крапкою з комою: !tc stop --ids ID1;ID2. Відповіді надходять до GM.',
        colCommand: 'Команда',
        colDesc: 'Що воно робить',
      },
      settings: {
        heading: 'Налаштування',
        intro:
          'Змінюйте параметри в меню за допомогою !tokencontroller set <setting> <value> або на сторінці налаштувань Mod на екрані сценаріїв API.',
        colKey: 'ключ',
        colName: 'Налаштування',
        colDesc: 'опис',
      },
      upgrading: {
        heading: 'Оновлення з версії 4',
        points: [
          'Шляхи, жетони патрулювання, замки, послідовники та незавершені чернетки зберігаються. Чернетки стають маршрутами, що закінчуються на "(чернетка)".',
          'Ваші налаштування версії 4 зберігаються: інтервал, підкроки, ротація, бойове патрулювання та одиниці за клацання.',
          'Команди !tc і !token-control і макроси T-Cntrl_ продовжують працювати. У таблиці показано нові команди.',
          'Версія 4 надсилає все меню після кожної дії; версія 5 замість цього надсилає коротку відповідь.',
          'Налаштування «Пікселі на одиницю» зникло: розмір комірки залежить від кожної сторінки. HTML Builder більше не потрібен.',
          'Старий роздатковий посібник із використання, який міг бачити кожен гравець, замінено цим роздатковим матеріалом лише для GM.',
        ],
        colV4: 'Версія 4',
        colV5: 'Версія 5',
      },
      troubleshooting: {
        heading: 'Усунення несправностей',
        points: [
          'Жетони не рухаються: перевірте статус. Патрулі чекають під час паузи, під час блокування та під час бою, коли бойова поведінка призупинено.',
          'Жетони переміщуються на неправильну відстань: можливо, змінився розмір сітки сторінки або прив’язка; спробуйте відкалібрувати.',
          'Намальований маршрут не розпочнеться: намальовані маршрути працюють лише на сторінці, на якій вони намальовані.',
          'Послідовники не рухаються, коли інший мод переміщує лідера: лише TokenMod повідомляє про свої рухи. Інші моди можуть викликати TokenController.ObserveTokenChange.',
          'Повідомте про проблеми на форумі Roll20 із будь-якими повідомленнями з консолі API.',
        ],
      },
      languages: {
        heading: 'Мови',
        body: 'TokenController перекладено на наведені нижче мови. Виберіть один із налаштуваннями мови.',
        colCode: 'Код',
        colName: 'Мова',
        colNative: 'Рідна назва',
      },
      credits: {
        heading: 'Кредити',
        original: 'Оригінальний мод від',
        maintainer: 'Версія 5 підтримується',
        support: 'Повідомляйте про помилки та ідеї на форумі Roll20 Mod або на GitHub.',
      },
      footer: 'Кнопки для кожної дії є в роздатковому матеріалі "{deck}".',
    },
    deck: {
      subtitle: 'Командна колода',
      patrolsDesc: 'Початок, зупинка та пауза патрулювання. Спочатку виберіть жетони.',
      createDesc: 'Створюйте маршрути з крокового коду, креслення або запису маркера.',
      selectedDesc: 'Заблокуйте жетони або змусьте їх слідувати за лідером.',
      toolsDesc: 'Бої, налаштування та інструменти сітки.',
      footer: 'Повні інструкції наведено в роздатковому матеріалі "{help}".',
    },
  };

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
      case 'stopMarkers': {
        const markers = parseMarkerList(raw);
        if (markers === null) {
          return bad;
        }
        return ok(markers.length > 0 ? markers.join(';') : 'none');
      }
      case 'markerAction':
        return option(MARKER_ACTION_OPTIONS);
      case 'wallMode':
        return option(WALL_MODE_OPTIONS);
      case 'wallCheck':
        return option(WALL_CHECK_OPTIONS);
      case 'oneWayWalls':
      case 'transparentWalls':
        return option(WALL_PASS_OPTIONS);
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
   * @param {string} key Option: mode, interval, maxTokens, randomStart or walls.
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
      case 'walls':
        // Empty or "default" follows the Walls setting; "off" means walk through.
        if (['', 'default', '-'].includes(text)) {
          return { valid: true, value: null };
        }
        if (['off', 'none', '0'].includes(text)) {
          return { valid: true, value: 'ignore' };
        }
        return WALL_MODE_OPTIONS.includes(text) ? { valid: true, value: text } : { valid: false };
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
      kind: [ROUTE_KIND_WAYPOINTS, ROUTE_KIND_AREA].includes(raw.kind) ? raw.kind : ROUTE_KIND_CODE,
      mode: ROUTE_MODE_OPTIONS.includes(raw.mode) ? raw.mode : 'pingpong',
      interval: validateRouteOption('interval', raw.interval ?? '').value ?? null,
      maxTokens: validateRouteOption('maxTokens', raw.maxTokens ?? '').value ?? null,
      randomStart: raw.randomStart === true,
      walls: validateRouteOption('walls', raw.walls ?? '').value ?? null,
      start: normaliseStart(raw.start),
    };
    if (route.kind === ROUTE_KIND_CODE) {
      if (!parseCode(raw.code).ok) {
        return null;
      }
      route.code = toText(raw.code);
    } else if (route.kind === ROUTE_KIND_AREA) {
      // An area is a polygon fixed to the page it was drawn on.
      route.anchor = ANCHOR_PAGE;
      route.pageId = toText(raw.pageId);
      route.points = normalisePoints(raw.points).filter((p) => 'x' in p);
      if (route.points.length < 3) {
        return null;
      }
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
      // Bounce routes: the bearing the token travels on and where that line began.
      heading: Number.isFinite(raw.heading) ? raw.heading : null,
      line:
        Array.isArray(raw.line) && raw.line.length === 2 && raw.line.every(Number.isFinite)
          ? [raw.line[0], raw.line[1]]
          : null,
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

  // Dynamic lighting barriers that patrols and followers can be kept behind.
  //
  // Roll20 does not stop tokens that the API moves at walls (its own "restrict
  // movement" only applies to people dragging tokens), so the Mod checks each
  // move against the page's barriers itself:
  //   - walls: `pathv2` (Jumpgate) or `path` (Legacy) drawings on the walls
  //     layer, with a barrierType of wall, oneWay or transparent;
  //   - doors and windows: `door` and `window` objects, which block only while
  //     they are closed. They are placed by x and -y (y measured upwards) with
  //     two handles relative to that point, also with y upwards.
  //
  // The geometry functions are pure, so they can be unit tested in Node.

  const LAYER_WALLS = 'walls';

  // In width mode a token may brush a wall by this share of its half-width, so
  // tokens fit corridors whose walls run along the cell edges.
  const BODY_RATIO = 0.9;

  const EPSILON = 1e-9;

  const cache = new Map();

  // ---------------------------------------------------------------------------
  // Geometry (pure)
  // ---------------------------------------------------------------------------

  /**
   * Turns rings of points into wall segments.
   *
   * @param {number[][][]} rings Rings in page pixels.
   * @param {string} kind Barrier kind.
   * @returns {{a: number[], b: number[], kind: string}[]} Segments.
   */
  function ringsToSegments(rings, kind) {
    const segments = [];
    for (const ring of rings) {
      for (let i = 1; i < ring.length; i++) {
        const a = ring[i - 1];
        const b = ring[i];
        if (Math.hypot(a[0] - b[0], a[1] - b[1]) > EPSILON) {
          segments.push({ a, b, kind });
        }
      }
    }
    return segments;
  }

  /**
   * Returns the signed area of the triangle a, b, c (twice over).
   *
   * @param {number[]} a Point.
   * @param {number[]} b Point.
   * @param {number[]} c Point.
   * @returns {number} Cross product.
   */
  function cross(a, b, c) {
    return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  }

  /**
   * Returns true when point p, known to be in line with a and b, lies between them.
   *
   * @param {number[]} a Segment start.
   * @param {number[]} b Segment end.
   * @param {number[]} p Point.
   * @returns {boolean} True when on the segment.
   */
  function onSegment(a, b, p) {
    return (
      Math.min(a[0], b[0]) - EPSILON <= p[0] &&
      p[0] <= Math.max(a[0], b[0]) + EPSILON &&
      Math.min(a[1], b[1]) - EPSILON <= p[1] &&
      p[1] <= Math.max(a[1], b[1]) + EPSILON
    );
  }

  /**
   * Returns true when segment ab touches or crosses segment cd.
   *
   * @param {number[]} a First segment start.
   * @param {number[]} b First segment end.
   * @param {number[]} c Second segment start.
   * @param {number[]} d Second segment end.
   * @returns {boolean} True when they meet.
   */
  function segmentsCross(a, b, c, d) {
    const d1 = cross(c, d, a);
    const d2 = cross(c, d, b);
    const d3 = cross(a, b, c);
    const d4 = cross(a, b, d);
    if (
      ((d1 > EPSILON && d2 < -EPSILON) || (d1 < -EPSILON && d2 > EPSILON)) &&
      ((d3 > EPSILON && d4 < -EPSILON) || (d3 < -EPSILON && d4 > EPSILON))
    ) {
      return true;
    }
    return (
      (Math.abs(d1) <= EPSILON && onSegment(c, d, a)) ||
      (Math.abs(d2) <= EPSILON && onSegment(c, d, b)) ||
      (Math.abs(d3) <= EPSILON && onSegment(a, b, c)) ||
      (Math.abs(d4) <= EPSILON && onSegment(a, b, d))
    );
  }

  /**
   * Returns the distance from a point to a segment.
   *
   * @param {number[]} p Point.
   * @param {number[]} a Segment start.
   * @param {number[]} b Segment end.
   * @returns {number} Pixels.
   */
  function pointSegmentDistance(p, a, b) {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const length = dx * dx + dy * dy;
    const t =
      length > 0 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / length)) : 0;
    return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
  }

  /**
   * Returns the shortest distance between two segments.
   *
   * @param {number[]} a First segment start.
   * @param {number[]} b First segment end.
   * @param {number[]} c Second segment start.
   * @param {number[]} d Second segment end.
   * @returns {number} Pixels (0 when they meet).
   */
  function segmentDistance(a, b, c, d) {
    if (segmentsCross(a, b, c, d)) {
      return 0;
    }
    return Math.min(
      pointSegmentDistance(a, c, d),
      pointSegmentDistance(b, c, d),
      pointSegmentDistance(c, a, b),
      pointSegmentDistance(d, a, b)
    );
  }

  /**
   * Returns the first wall a move runs into.
   *
   * With a radius of 0 only the line between the two centres is checked. With
   * a radius, the token's body must not pass through a wall either; a token
   * that already overlaps a wall may still move away from it.
   *
   * @param {{a: number[], b: number[]}[]} walls Wall segments.
   * @param {number[]} from [x, y] the token moves from.
   * @param {number[]} to [x, y] the token moves to.
   * @param {number} [radius=0] Half the token's width, in pixels.
   * @returns {object|null} The wall in the way, or null.
   */
  function blockingWall(walls, from, to, radius = 0) {
    for (const wall of walls) {
      if (segmentsCross(from, to, wall.a, wall.b)) {
        return wall;
      }
      if (radius > 0 && segmentDistance(from, to, wall.a, wall.b) < radius) {
        const startGap = pointSegmentDistance(from, wall.a, wall.b);
        if (startGap >= radius || pointSegmentDistance(to, wall.a, wall.b) < startGap) {
          return wall;
        }
      }
    }
    return null;
  }

  /**
   * Returns the radius a token's body is checked with.
   *
   * @param {number} width Token width.
   * @param {number} height Token height.
   * @returns {number} Pixels.
   */
  function bodyRadius(width, height) {
    return (Math.min(Number(width) || 0, Number(height) || 0) / 2) * BODY_RATIO;
  }

  /**
   * Converts a door's or window's position into a segment in page pixels.
   *
   * @param {object} props { x, y, path } where path holds handle0 and handle1.
   * @returns {number[][]|null} [start, end], or null when the path is missing.
   */
  function portalEnds(props) {
    let path = props.path;
    if (typeof path === 'string') {
      try {
        path = JSON.parse(path);
      } catch {
        return null;
      }
    }
    if (!isRecord(path) || !isRecord(path.handle0) || !isRecord(path.handle1)) {
      return null;
    }
    const x = Number(props.x) || 0;
    const y = Number(props.y) || 0;
    const end = (h) => [x + (Number(h.x) || 0), -(y + (Number(h.y) || 0))];
    return [end(path.handle0), end(path.handle1)];
  }

  /**
   * Returns true when walls of a kind block movement, given the settings.
   *
   * @param {string} kind wall, oneway, transparent, door or window (lower case).
   * @param {object} config Mod settings.
   * @returns {boolean} True when they block.
   */
  function kindBlocks(kind, config) {
    if (kind === 'oneway') {
      return config.oneWayWalls !== 'pass';
    }
    if (kind === 'transparent') {
      return config.transparentWalls !== 'pass';
    }
    return true;
  }

  // ---------------------------------------------------------------------------
  // Reading barriers (Roll20)
  // ---------------------------------------------------------------------------

  /**
   * Forgets the barriers read from pages, for example after a wall or door changes.
   *
   * @returns {void}
   */
  function clearWallCache() {
    cache.clear();
  }

  /**
   * Reads every barrier on a page: walls of any kind and closed doors and windows.
   *
   * @param {string} pageId Page ID.
   * @returns {{a: number[], b: number[], kind: string}[]} Segments.
   */
  function readWalls(pageId) {
    const page = getObj('page', pageId);
    const size = {
      width: Number(page?.get('width')) || 0,
      height: Number(page?.get('height')) || 0,
    };
    const segments = [];
    for (const type of [PATH_TYPE_V2, PATH_TYPE_LEGACY]) {
      for (const wall of findObjs({ _type: type, _pageid: pageId, layer: LAYER_WALLS })) {
        const kind = toText(wall.get('barrierType')).toLowerCase() || 'wall';
        segments.push(...ringsToSegments(pathToRings(drawingProps(wall), size), kind));
      }
    }
    for (const type of ['door', 'window']) {
      for (const portal of findObjs({ _type: type, _pageid: pageId })) {
        if (portal.get('isOpen') === true) {
          continue;
        }
        const ends = portalEnds({
          x: portal.get('x'),
          y: portal.get('y'),
          path: portal.get('path'),
        });
        if (ends) {
          segments.push({ a: ends[0], b: ends[1], kind: type });
        }
      }
    }
    return segments;
  }

  /**
   * Returns the barriers on a page that block movement with the given settings.
   *
   * @param {string} pageId Page ID.
   * @param {object} config Mod settings.
   * @returns {{a: number[], b: number[], kind: string}[]} Segments.
   */
  function getWalls(pageId, config) {
    if (!cache.has(pageId)) {
      cache.set(pageId, readWalls(pageId));
    }
    return cache.get(pageId).filter((wall) => kindBlocks(wall.kind, config));
  }

  /**
   * Returns true when a change to a drawing, door or window may change where
   * the walls are.
   *
   * @param {object} obj Roll20 object.
   * @param {object} [prev] Previous attributes.
   * @returns {boolean} True for barriers.
   */
  function isBarrier(obj, prev) {
    const type = obj.get('_type');
    if (type === 'door' || type === 'window') {
      return true;
    }
    return obj.get('layer') === LAYER_WALLS || prev?.layer === LAYER_WALLS;
  }

  // Bounce routes: a token wanders inside a drawn area, travelling in straight
  // lines and bouncing off the area's edges (and walls) like a ball in Pong.
  // Pure functions only, so the module can be unit tested in Node.
  //
  // On pages with a grid the token steps from cell to cell, choosing each time
  // the neighbour that keeps it closest to its line of travel, so it moves at
  // an angle like a line drawn on squared paper. On gridless pages it moves a
  // cell's width along its heading. At an edge its heading is reflected off the
  // edge and turned by a few random degrees, so its path does not repeat.

  // Each bounce turns the reflected heading by up to this many degrees either way.
  const JITTER_DEGREES = 20;

  // How many random points to try when picking a random cell inside an area.
  const RANDOM_TRIES = 200;

  /**
   * Returns a unit vector for a screen bearing (0 = up, 90 = right).
   *
   * @param {number} degrees Bearing.
   * @returns {number[]} [x, y] with y down.
   */
  function headingVector(degrees) {
    const radians = (degrees * Math.PI) / 180;
    return [Math.sin(radians), -Math.cos(radians)];
  }

  /**
   * Returns true when a point is inside a polygon (even-odd rule).
   *
   * @param {number[]} point [x, y].
   * @param {number[][]} polygon Corners, in order.
   * @returns {boolean} True when inside.
   */
  function pointInPolygon(point, polygon) {
    const [x, y] = point;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i];
      const [xj, yj] = polygon[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    return inside;
  }

  /**
   * Returns the polygon's edges as segments.
   *
   * @param {number[][]} polygon Corners.
   * @returns {{a: number[], b: number[]}[]} Edges, including the closing one.
   */
  function polygonEdges(polygon) {
    return polygon.map((a, i) => ({ a, b: polygon[(i + 1) % polygon.length] }));
  }

  /**
   * Returns the polygon's centroid (the average of its corners).
   *
   * @param {number[][]} polygon Corners.
   * @returns {number[]} [x, y].
   */
  function polygonCentre(polygon) {
    const sum = polygon.reduce((acc, [x, y]) => [acc[0] + x, acc[1] + y], [0, 0]);
    return [sum[0] / polygon.length, sum[1] / polygon.length];
  }

  /**
   * Reflects a heading off a segment.
   *
   * @param {number} heading Bearing in degrees.
   * @param {{a: number[], b: number[]}} edge The edge it hits.
   * @returns {number} The reflected bearing.
   */
  function reflectHeading(heading, edge) {
    const [vx, vy] = headingVector(heading);
    const ex = edge.b[0] - edge.a[0];
    const ey = edge.b[1] - edge.a[1];
    const length = Math.hypot(ex, ey) || 1;
    const nx = -ey / length;
    const ny = ex / length;
    const dot = vx * nx + vy * ny;
    return bearing(vx - 2 * dot * nx, vy - 2 * dot * ny);
  }

  /**
   * Picks a random cell centre inside an area.
   *
   * @param {object} grid Grid object.
   * @param {number[][]} polygon Area corners.
   * @param {() => number} random Random number source in [0, 1).
   * @returns {number[]|null} [x, y], or null when no cell was found.
   */
  function randomPointInArea(grid, polygon, random) {
    const xs = polygon.map((p) => p[0]);
    const ys = polygon.map((p) => p[1]);
    const [left, right, top, bottom] = [
      Math.min(...xs),
      Math.max(...xs),
      Math.min(...ys),
      Math.max(...ys),
    ];
    for (let i = 0; i < RANDOM_TRIES; i++) {
      const x = left + random() * (right - left);
      const y = top + random() * (bottom - top);
      const point = snapToCell(grid, x, y);
      if (pointInPolygon(point, polygon)) {
        return point;
      }
    }
    return null;
  }

  /**
   * Returns the first edge a move crosses.
   *
   * @param {number[]} from [x, y].
   * @param {number[]} to [x, y].
   * @param {{a: number[], b: number[]}[]} edges Edges.
   * @returns {object|null} The nearest edge crossed, or null.
   */
  function firstEdgeCrossed(from, to, edges) {
    let best = null;
    let bestDistance = Infinity;
    for (const edge of edges) {
      if (segmentsCross(from, to, edge.a, edge.b)) {
        const mid = [(edge.a[0] + edge.b[0]) / 2, (edge.a[1] + edge.b[1]) / 2];
        const distance = Math.hypot(mid[0] - from[0], mid[1] - from[1]);
        if (distance < bestDistance) {
          best = edge;
          bestDistance = distance;
        }
      }
    }
    return best;
  }

  /**
   * Returns the cells (or, on gridless pages, the point) a token could move to
   * next along a line, best first.
   *
   * @param {object} grid Grid object.
   * @param {number[]} pos Token position.
   * @param {number[]} origin A point on the line of travel.
   * @param {number} heading Bearing in degrees.
   * @returns {number[][]} Candidate positions.
   */
  function candidates(grid, pos, origin, heading) {
    const [ux, uy] = headingVector(heading);
    if (!grid.snap) {
      const pitch = cellPitch(grid);
      return [[pos[0] + ux * pitch, pos[1] + uy * pitch]];
    }
    return Object.keys(DIRECTIONS)
      .filter((dir) => !directionZigzags(grid, dir))
      .map((dir) => stepFrom(grid, pos, dir))
      .map((next) => {
        const progress = (next[0] - pos[0]) * ux + (next[1] - pos[1]) * uy;
        // Distance of the cell from the line of travel.
        const offLine = Math.abs((next[0] - origin[0]) * uy - (next[1] - origin[1]) * ux);
        return { next, progress, offLine };
      })
      .filter((c) => c.progress > 1e-6)
      .sort((a, b) => a.offLine - b.offLine || b.progress - a.progress)
      .map((c) => c.next);
  }

  /**
   * Works out a bouncing token's next move.
   *
   * @param {object} options Options.
   * @param {object} options.grid Grid object.
   * @param {number[]} options.pos Token position.
   * @param {number} options.heading Current bearing in degrees.
   * @param {number[]} options.origin Where the current line of travel started.
   * @param {number[][]} options.polygon Area corners.
   * @param {(from: number[], to: number[]) => object|null} [options.blockedBy]
   *        Returns the wall (with a and b) in the way of a move, or null.
   * @param {() => number} [options.random] Random number source in [0, 1).
   * @returns {{to: number[]|null, heading: number, origin: number[]}} Where to
   *          move (null to stay put this time), and the line to follow next.
   */
  function nextBounce({
    grid,
    pos,
    heading,
    origin,
    polygon,
    blockedBy = () => null,
    random = Math.random,
  }) {
    const edges = polygonEdges(polygon);
    const outside = !pointInPolygon(pos, polygon);
    if (outside) {
      // Dragged out of its area: head back towards the middle of it.
      const centre = polygonCentre(polygon);
      heading = bearing(centre[0] - pos[0], centre[1] - pos[1]);
      origin = pos;
    }

    const obstacle = (to) => {
      const wall = blockedBy(pos, to);
      if (wall) {
        return wall;
      }
      if (outside) {
        return null;
      }
      return firstEdgeCrossed(pos, to, edges) || (pointInPolygon(to, polygon) ? null : edges[0]);
    };

    let current = heading;
    let line = origin;
    for (let attempt = 0; attempt < 3; attempt++) {
      const options = candidates(grid, pos, line, current);
      const to = options.find((next) => !obstacle(next));
      const hit = options.length > 0 ? obstacle(options[0]) : null;
      // The first time, a cell that is in the way means a bounce rather than a
      // slide along the edge.
      if (to && (!hit || attempt > 0)) {
        return { to, heading: current, origin: line };
      }
      // Bounce off what is in the way: reflect, turn a little at random and
      // start a new line from here. If that fails too, go straight back.
      const jitter = (random() * 2 - 1) * JITTER_DEGREES;
      current =
        attempt === 0 && hit
          ? (reflectHeading(current, hit) + jitter + 360) % 360
          : (current + 180 + jitter + 360) % 360;
      line = pos;
    }
    return { to: null, heading: current, origin: pos };
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
    if (stopMarkerOf(token)) {
      return { ok: false, reason: 'tokenMarked' };
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
    if (route.kind === ROUTE_KIND_AREA) {
      return startBounce(token, route, patrol, ctx);
    }
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
   * Puts a token on a bounce route, at a random cell of the area when the route
   * has a random start, heading off in a random direction.
   *
   * @param {object} token Roll20 graphic.
   * @param {object} route Area route.
   * @param {object} patrol New patrol record.
   * @param {object} ctx Page context.
   * @returns {{ok: true, offPage: number}|{ok: false, reason: string}} Outcome.
   */
  function startBounce(token, route, patrol, ctx) {
    const polygon = route.points.map((p) => [p.x, p.y]);
    let pos = positionOf(token);
    if (route.randomStart) {
      pos = randomPointInArea(ctx.grid, polygon, Math.random) || pos;
    }
    if (!pointInPolygon(pos, polygon)) {
      return { ok: false, reason: 'outsideArea' };
    }
    const s = getState();
    patrol.heading = Math.random() * 360;
    patrol.line = pos;
    delete s.follows[token.id];
    s.patrols[token.id] = patrol;
    moveTokenTo(token, pos);
    return { ok: true, offPage: 0 };
  }

  /**
   * Moves a token on a bounce route one step, bouncing off the area's edges and,
   * unless the route ignores them, off walls and closed doors.
   *
   * @param {object} token Roll20 graphic.
   * @param {object} patrol Patrol record.
   * @param {object} route Area route.
   * @param {object} ctx Page context.
   * @returns {void}
   */
  function advanceBounce(token, patrol, route, ctx) {
    const pos = positionOf(token);
    const ignoreWalls = wallModeFor(route) === 'ignore';
    const step = nextBounce({
      grid: ctx.grid,
      pos,
      heading: Number.isFinite(patrol.heading) ? patrol.heading : Math.random() * 360,
      origin: patrol.line || pos,
      polygon: route.points.map((p) => [p.x, p.y]),
      blockedBy: ignoreWalls ? undefined : (from, to) => wallInTheWay(token, to, ctx),
    });
    patrol.heading = step.heading;
    patrol.line = step.origin;
    if (step.to && onPage({ x: step.to[0], y: step.to[1] }, ctx)) {
      moveTokenTo(token, step.to);
    }
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
   * Returns true when a frame's position is on the page.
   *
   * @param {object} frame Track frame.
   * @param {object} ctx Page context.
   * @returns {boolean} True when on the page.
   */
  function onPage(frame, ctx) {
    return frame.x >= 0 && frame.y >= 0 && frame.x <= ctx.widthPx && frame.y <= ctx.heightPx;
  }

  /**
   * Returns how a route treats walls: its own Walls option, or the setting.
   *
   * @param {object} route Route record.
   * @returns {string} ignore, hold or turn.
   */
  function wallModeFor(route) {
    return route.walls || getConfig().wallMode;
  }

  /**
   * Returns true when a wall, or a closed door or window, stands between a
   * token and where it would move to. Frames that do not move the token (waits,
   * turns, stealth) and frames off the page are never blocked.
   *
   * @param {object} token Roll20 graphic.
   * @param {object} frame Track frame, or { x, y }.
   * @param {object} ctx Page context.
   * @returns {boolean} True when blocked.
   */
  function moveIsBlocked(token, frame, ctx) {
    if (!frame || frame.wait || frame.stealth || frame.face !== undefined || !onPage(frame, ctx)) {
      return false;
    }
    return Boolean(wallInTheWay(token, [frame.x, frame.y], ctx));
  }

  /**
   * Returns the wall, door or window between a token and a point, if any.
   *
   * @param {object} token Roll20 graphic.
   * @param {number[]} to [x, y].
   * @param {object} ctx Page context.
   * @returns {object|null} The barrier segment ({ a, b, kind }), or null.
   */
  function wallInTheWay(token, to, ctx) {
    const config = getConfig();
    const walls = getWalls(ctx.page.id, config);
    if (walls.length === 0) {
      return null;
    }
    const radius =
      config.wallCheck === 'width' ? bodyRadius(token.get('width'), token.get('height')) : 0;
    return blockingWall(walls, positionOf(token), to, radius);
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
    if (stopMarkerOf(token)) {
      applyStopMarkers();
      return;
    }
    const ctx = getPageContext(token.get('_pageid'));
    if (!ctx) {
      return;
    }
    if (route.kind === ROUTE_KIND_AREA) {
      advanceBounce(token, patrol, route, ctx);
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

    const mode = wallModeFor(route);
    const segment = getConfig().movement === 'segment';
    const index = Math.min(patrol.index, frames.length - 1);
    if (route.mode === 'once' && patrol.dir < 0 && index <= 0) {
      // A run-once patrol that turned back at a wall is home again.
      delete s.patrols[tokenId];
      return;
    }

    let step = nextFrame(frames, index, patrol.dir, route.mode, segment);
    if (mode !== 'ignore' && moveIsBlocked(token, frames[step.index], ctx)) {
      if (mode === 'hold') {
        // Wait for the way to clear, for example for a door to open.
        return;
      }
      // Turn back, and take the first step back now if that way is clear.
      patrol.dir = -patrol.dir;
      step = nextFrame(frames, index, patrol.dir, route.mode, segment);
      if (moveIsBlocked(token, frames[step.index], ctx)) {
        return;
      }
    }
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
    } else if (!target.wait && onPage(target, ctx)) {
      // Frames off the page are skipped; the patrol keeps its place on the track
      // and rejoins it when the route comes back on to the page.
      moveTokenTo(token, [target.x, target.y]);
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
    // Markers are checked even while patrols wait, so a token killed in combat
    // has already left its route when the fight ends.
    applyStopMarkers();
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
  // Stop markers
  // ---------------------------------------------------------------------------

  /**
   * Returns the Stop Marker a token shows, if any.
   *
   * @param {object} token Roll20 graphic.
   * @returns {string|null} Marker name, or null.
   */
  function stopMarkerOf(token) {
    const setting = getConfig().stopMarkers;
    return setting && setting !== 'none' ? findMarker(token, setting.split(';')) : null;
  }

  /**
   * Takes tokens that show a Stop Marker off their routes (stopping them or
   * sending them back, as Stop Marker Action says), and stops them following.
   * Followers of a leader that shows one stop too. Tells the GM who stopped.
   *
   * The API raises no change events for markers set by other Mods, so this runs
   * on every scheduler tick as well as when a GM changes a token's markers.
   *
   * @returns {number} Number of tokens stopped.
   */
  function applyStopMarkers() {
    if (getConfig().stopMarkers === 'none') {
      return 0;
    }
    const s = getState();
    const marked = new Map();
    const isMarked = (tokenId) => {
      if (!marked.has(tokenId)) {
        const token = getObj('graphic', tokenId);
        marked.set(tokenId, token ? Boolean(stopMarkerOf(token)) : false);
      }
      return marked.get(tokenId);
    };

    const stopped = [];
    const sentBack = [];
    const reset = getConfig().markerAction === 'reset';
    for (const tokenId of Object.keys(s.patrols)) {
      if (isMarked(tokenId)) {
        (reset ? sentBack : stopped).push(tokenId);
        if (reset) {
          resetPatrol(tokenId);
        } else {
          stopPatrol(tokenId);
        }
      }
    }
    for (const [followerId, follow] of Object.entries(s.follows)) {
      if (isMarked(followerId) || isMarked(follow.leaderId)) {
        delete s.follows[followerId];
        if (!stopped.includes(followerId) && !sentBack.includes(followerId)) {
          stopped.push(followerId);
        }
      }
    }

    const names = (ids) => ids.map((id) => tokenLabel(getObj('graphic', id), id)).join(', ');
    if (stopped.length > 0) {
      notifyGm('markerStopped', { tokens: names(stopped) });
    }
    if (sentBack.length > 0) {
      notifyGm('markerReset', { tokens: names(sentBack) });
    }
    return stopped.length + sentBack.length;
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
      if (!target) {
        return;
      }
      const ctx = getConfig().wallMode === 'ignore' ? null : getPageContext(leader.get('_pageid'));
      // Followers wait rather than walk through walls, when walls are on.
      if (ctx && moveIsBlocked(follower, { x: target[0], y: target[1] }, ctx)) {
        return;
      }
      moveTokenTo(follower, target, visited);
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
      } else if (s.routes[patrol.routeId]?.kind === ROUTE_KIND_AREA) {
        // Bounce on from where it was dropped.
        patrol.line = to;
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
   * Builds a Twemoji asset URL for a locale flag.
   *
   * @param {string} flag Unicode regional-indicator flag.
   * @returns {string} SVG asset URL or an empty string.
   */
  function flagAssetUrl(flag) {
    const codepoints = Array.from(String(flag || '').trim())
      .map((character) => character.codePointAt(0).toString(16))
      .join('-');
    return codepoints
      ? `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codepoints}.svg`
      : '';
  }

  /**
   * Builds a flag image for a locale. An image is used because Roll20 on Windows
   * shows emoji flags as letter pairs.
   *
   * @param {object} locale Locale metadata.
   * @returns {string} Trusted locale flag HTML.
   */
  function buildLocaleFlag(locale) {
    const label = escapeHtml(locale.flagLabel || locale.name);
    const url = flagAssetUrl(locale.flag);
    if (!url) {
      return '';
    }
    return `<img src="${escapeHtml(url)}" alt="${label}" title="${label}" style="width:1.1em;height:1.1em;vertical-align:-0.15em;margin-right:4px;" />`;
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

    const routeOptions = ['mode', 'interval', 'max', 'random', 'walls', 'start'].map((key) => [
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
      ['!tc set <setting> <value>', `${COMMAND} set <setting> <value>`],
      ['!tc setstart / clearstart <path>', `${COMMAND} route <route> start set|clear`],
      ['!tc build, !tc draft', `${COMMAND} record`],
      ['!tc tick <ms>', `${COMMAND} set interval <ms>`],
      ['!tc rotate / combat / substeps', `${COMMAND} set facing / combatBehaviour / movement`],
      ['!tc combat on / off', `${COMMAND} combat on / off`],
      ['!tc pathinterval / maxtokens', `${COMMAND} route <route> interval / max`],
      ['!tc runonce / cycle / randomstart', `${COMMAND} route <route> mode / random`],
      ['!tc duplicate', `${COMMAND} copy`],
      ['!tc exportpaths / importpaths', `${COMMAND} export / import`],
      ['!tc follow <follower> <leader>', `${COMMAND} follow <leader>`],
    ].map(([v4, v5]) => [code(v4), code(v5)]);

    const locales = LOCALE_DEFINITIONS.map((locale) => [
      `${buildLocaleFlag(locale)}${code(locale.code)}`,
      escapeHtml(locale.name),
      escapeHtml(locale.nativeName || locale.name),
    ]);
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
    ${section('commands', `<p style="${STYLE.p}">${h('commands.intro')}</p><p style="${STYLE.p}">${h('commands.mods')}</p>${table([t('handout.commands.colCommand', lang), t('handout.commands.colDesc', lang)], commands)}`)}
    ${section('settings', `<p style="${STYLE.p}">${h('settings.intro')}</p>${table([t('handout.settings.colKey', lang), t('handout.settings.colName', lang), t('handout.settings.colDesc', lang)], settings)}`)}
    ${section('upgrading', `${list(raw('upgrading.points'))}${table([t('handout.upgrading.colV4', lang), t('handout.upgrading.colV5', lang)], legacyCommands)}`)}
    ${section('troubleshooting', list(raw('troubleshooting.points')))}
    ${section('languages', `<p style="${STYLE.p}">${h('languages.body')}</p>${table([t('handout.languages.colCode', lang), t('handout.languages.colName', lang), t('handout.languages.colNative', lang)], locales)}`)}
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
    ${group('menu.create', 'deck.createDesc', [btn('add', `add ${q('prompts.name')} ${q('prompts.code', 'U2R2D2L2')}`), btn('draw', `draw ${q('prompts.name')}`), btn('bounce', `bounce ${q('prompts.name')}`), btn('record', `record ${q('prompts.name')}`), btn('examples', 'examples', true), btn('list', 'list', true)])}
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
    const handout = primary || createObj('handout', { name, avatar: HANDOUT_ICON });
    if (!handout) {
      return;
    }
    handout.set({ inplayerjournals: '', controlledby: '' });
    if (!String(handout.get('avatar') || '').includes(HANDOUT_ICON_PATH)) {
      handout.set('avatar', HANDOUT_ICON);
    }
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
   * Returns true when `set` names a v5 setting rather than a v4 path, so
   * `!tc set wallMode hold` changes the setting. A route with that name wins.
   *
   * @param {object[]} rest Words after `set`.
   * @returns {boolean} True for a v5 setting.
   */
  function isV5Set(rest) {
    if (rest.length === 0) {
      return true;
    }
    const key = rest[0].text.toLowerCase();
    const isSetting = Object.keys(DEFAULT_CONFIG).some((k) => k.toLowerCase() === key);
    return isSetting && !routeRef(rest.slice(0, -1)).route;
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
        return isV5Set(rest) ? pass : { words: [word('edit'), ...rest] };
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
        // v4 `combat` toggled combat behaviour; v5 `combat on|off` switches combat.
        if (['on', 'off'].includes(rest[0]?.text.toLowerCase())) {
          return pass;
        }
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
    { key: 'stopMarkers' },
    { key: 'markerAction', options: MARKER_ACTION_OPTIONS },
    { key: 'wallMode', options: WALL_MODE_OPTIONS },
    { key: 'wallCheck', options: WALL_CHECK_OPTIONS },
    { key: 'oneWayWalls', options: WALL_PASS_OPTIONS },
    { key: 'transparentWalls', options: WALL_PASS_OPTIONS },
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
    if ((key === 'lockMarker' || key === 'stopMarkers') && value === 'none') {
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
    if (route.kind === ROUTE_KIND_AREA) {
      return tr('route.area', { points });
    }
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
   * Splits a `--ids` list off the arguments, so other Mods (which cannot select
   * tokens) can say which tokens a command is for. The IDs follow `--ids` (or
   * `--ids|`), separated by semicolons, commas or spaces, up to the next `--`
   * option or the end of the command.
   *
   * @param {object[]} words Arguments.
   * @returns {{ids: string[]|null, words: object[]}} The IDs (null when there is
   *          no `--ids`) and the other arguments.
   */
  function splitIds(words) {
    const index = words.findIndex((w) => /^--ids(?:[|=:]|$)/i.test(w.text));
    if (index === -1) {
      return { ids: null, words };
    }
    let end = index + 1;
    while (end < words.length && !words[end].text.startsWith('--')) {
      end++;
    }
    const ids = [
      words[index].text.replace(/^--ids[|=:]?/i, ''),
      ...words.slice(index + 1, end).map((w) => w.text),
    ]
      .join(';')
      .split(/[;,\s]+/)
      .filter(Boolean);
    return { ids: [...new Set(ids)], words: [...words.slice(0, index), ...words.slice(end)] };
  }

  /**
   * Returns the tokens with the given IDs, warning about IDs that are not tokens.
   *
   * @param {object} msg Chat message.
   * @param {string[]} ids Token IDs.
   * @returns {object[]} Tokens.
   */
  function tokensFromIds(msg, ids) {
    const tokens = [];
    const missing = [];
    for (const id of ids) {
      const token = getObj('graphic', id);
      if (isToken(token)) {
        tokens.push(token);
      } else {
        missing.push(id);
      }
    }
    if (tokens.length > 0 && missing.length > 0) {
      whisperWarning(msg.playerid, tr('warnings.idsNotFound', { ids: missing.join(', ') }));
    }
    return tokens;
  }

  /**
   * Returns the tokens a command is for: those given with `--ids`, otherwise
   * the selected ones. Whispers an error when there are none.
   *
   * @param {object} msg Chat message.
   * @param {string[]|null} [ids] Token IDs from `--ids`, or null for the selection.
   * @returns {object[]|null} Tokens, or null.
   */
  function requireTokens(msg, ids = null) {
    if (ids) {
      const tokens = tokensFromIds(msg, ids);
      if (tokens.length === 0) {
        fail(msg.playerid, 'idsNotFound', { ids: ids.join(', ') || '-' });
        return null;
      }
      return tokens;
    }
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
        buildButton(tr('buttons.bounce'), cmd(`bounce ${query(tr('prompts.name'), null)}`)),
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
    const area = route.kind === ROUTE_KIND_AREA;
    const lines = [
      buildRow(tr('route.path'), `<code>${escapeHtml(describeRoute(route))}</code>`),
      area
        ? ''
        : buildRow(
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
        tr('route.walls'),
        buildSecondaryButton(
          route.walls
            ? tr(`values.wallMode.${route.walls}`)
            : `${tr('values.default')} (${tr(`values.wallMode.${getConfig().wallMode}`)})`,
          cmd(`route ${ref} walls ${query(tr('route.walls'), ['default', ...WALL_MODE_OPTIONS])}`)
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
    const result = drawingWaypoints(drawingProps(drawing), {
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
   * `bounce <name>`: create a route on which tokens bounce around inside the
   * selected closed drawing.
   *
   * @param {object} msg Chat message.
   * @param {object[]} words Arguments.
   * @returns {void}
   */
  function commandBounce(msg, words) {
    const { drawings } = readSelection(msg);
    if (drawings.length !== 1) {
      fail(msg.playerid, 'selectOneArea');
      return;
    }
    const name = checkNewName(msg, joinWords(words));
    if (!name) {
      return;
    }
    const drawing = drawings[0];
    const pageId = drawing.get('_pageid');
    const page = getObj('page', pageId);
    const [ring] = pathToRings(drawingProps(drawing), {
      width: page?.get('width'),
      height: page?.get('height'),
    });
    const corners = ring ? simplifyPoints(ring) : [];
    // A closed outline repeats its first corner at the end.
    const last = corners.at(-1);
    if (
      last &&
      corners.length > 1 &&
      Math.hypot(last[0] - corners[0][0], last[1] - corners[0][1]) < 1
    ) {
      corners.pop();
    }
    if (corners.length < 3) {
      fail(msg.playerid, 'areaTooSmall');
      return;
    }
    createRoute(msg, {
      name,
      kind: ROUTE_KIND_AREA,
      mode: 'loop',
      pageId,
      points: corners.map(([x, y]) => ({ x, y })),
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
      walls: 'walls',
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
    if (splitIds(words).ids) {
      // `remove --ids` takes tokens off their routes; it never removes a route.
      commandStop(msg, words);
      return;
    }
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
    const { ids, words: rest } = splitIds(words);
    const tokens = requireTokens(msg, ids);
    const route = tokens && requireRoute(msg, joinWords(rest));
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
   * Returns the tokens a stop or reset applies to: the tokens given with
   * `--ids`, a route's tokens, every patrolling token for `all`, or the selection.
   *
   * @param {object} msg Chat message.
   * @param {object[]} words Arguments, without the `--ids` list.
   * @param {string[]|null} ids Token IDs from `--ids`, or null.
   * @returns {string[]|null} Token IDs, or null after an error.
   */
  function targetTokenIds(msg, words, ids) {
    if (ids) {
      const tokens = requireTokens(msg, ids);
      return tokens ? tokens.map((tok) => tok.id) : null;
    }
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
    const { ids: given, words: rest } = splitIds(words);
    const ids = targetTokenIds(msg, rest, given);
    if (!ids) {
      return;
    }
    let count = 0;
    for (const id of ids) {
      const stopped = stopPatrol(id);
      const unfollowed = (given !== null || rest.length === 0) && unfollow(id);
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
    const { ids: given, words: rest } = splitIds(words);
    const ids = targetTokenIds(msg, rest, given);
    if (!ids) {
      return;
    }
    const count = ids.filter((id) => resetPatrol(id)).length;
    done(msg.playerid, 'reset', { count });
  }

  /**
   * `lock` / `unlock [--ids <ids>]`.
   *
   * @param {object} msg Chat message.
   * @param {boolean} lock True to lock.
   * @param {object[]} words Arguments.
   * @returns {void}
   */
  function commandLock(msg, lock, words) {
    const tokens = requireTokens(msg, splitIds(words).ids);
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
        commandLock(msg, true, args);
        break;
      case 'unlock':
        commandLock(msg, false, args);
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
      case 'bounce':
        commandBounce(msg, args);
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
    // Commands sent by other Mods (ScriptCards, macros run by the API) come from
    // the player "API". Replies to them go to the GM.
    if (msg.playerid !== API_PLAYER_ID && !playerIsGM(msg.playerid)) {
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
    if (!isToken(obj)) {
      return;
    }
    handleTokenChange(obj, prev);
    if (prev?.statusmarkers !== obj.get('statusmarkers')) {
      applyStopMarkers();
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
    // Walls, doors and windows are read once per page and read again when one changes.
    const wallChanged = (obj, prev) => {
      if (isBarrier(obj, prev)) {
        clearWallCache();
      }
    };
    for (const type of ['path', 'pathv2', 'door', 'window']) {
      for (const event of ['add', 'change', 'destroy']) {
        on(`${event}:${type}`, guarded(`${event}:${type}`, wallChanged));
      }
    }
    on(
      'change:campaign:turnorder',
      guarded('change:campaign:turnorder', (campaign) => handleTurnOrderChange(campaign))
    );
  }

  registerEventHandlers();
})();
