/**
 * NOTE: GENERATED FILE - DO NOT EDIT DIRECTLY.
 * NOTE: Source files live under src/ and are bundled with `npm run build`.
 * ------------------------------------------------
 * Name: Hexploration
 * Script: Hexploration.js
 * Version: 2.0.0
 * Built: 2026-10-29T02:20:55.900Z
 */
const HexplorationMod = (() => {
  'use strict';

  // Build-time placeholders replaced by rollup.config.js inject-build-metadata plugin.
  const SCRIPT_NAME = 'Hexploration';
  const SCRIPT_VERSION = '2.0.0';
  const SCRIPT_LAST_UPDATED = '2026-10-29T02:20:55.900Z';

  const DEFAULT_LOCALE$1 = 'en-US';

  const STATE_KEY = 'Hexploration';
  const SCHEMA_VERSION = 2;
  const COMMAND = '!hexploration';

  // v1 commands, kept so existing macros and the Hexploration_menu macro still work.
  const LEGACY_COMMANDS = {
    '!hexploration_fillPoly': 'fill',
    '!hexploration_fillInversePoly': 'fillInverse',
    '!hexploration_showMenuMain': 'menu',
    '!hexploration_configModifyProperty': 'legacyConfig',
    '!hexploration_hexModifyProperty': 'legacyHex',
  };

  // Separator v1 used between the arguments of its config and hex commands.
  const LEGACY_ARG_SEPARATOR = '&&';

  const HANDOUT_HELP_NAME = 'Hexploration - Help';
  const HANDOUT_DECK_NAME = 'Hexploration - Command Deck';

  const AUTHOR_LINKS = {
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

  const DEMO_GIF_URL =
    'https://raw.githubusercontent.com/Roll20/roll20-api-scripts/master/Hexploration/Hexploration.gif';

  // Roll20 layer identifiers.
  const LAYER_TOKEN = 'objects';
  const LAYER_GM = 'gmlayer';
  const LAYER_FOREGROUND = 'foreground';

  // Roll20 object types for drawn shapes. Jumpgate draws pathv2; Legacy draws path.
  const PATH_TYPE_LEGACY = 'path';
  const PATH_TYPE_V2 = 'pathv2';
  const PATH_TYPES = [PATH_TYPE_V2, PATH_TYPE_LEGACY];

  // Status marker v1 used to flag location tokens. Still honoured as a fallback.
  const LOCATION_MARKER = 'white-tower';

  // Option lists for settings.
  const HEX_LAYER_OPTIONS = ['auto', 'foreground', 'objects'];
  const REVEAL_BY_OPTIONS = ['players', 'characters', 'all'];
  const REVEAL_MODE_OPTIONS = ['clear', 'glimpse'];
  const ANNOUNCE_OPTIONS = ['all', 'gm', 'off'];

  // Default configuration for new installs. Migrated v1 games keep their own values.
  const DEFAULT_CONFIG = {
    language: DEFAULT_LOCALE$1,
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
  const COVERED_TOKEN_PROPS = [
    'showplayers_name',
    'showplayers_bar1',
    'showplayers_bar2',
    'showplayers_bar3',
    'showplayers_aura1',
    'showplayers_aura2',
  ];

  // Settings that can be overridden for a single page.
  const PAGE_SETTING_KEYS = [
    'revealDistance',
    'lineOfSight',
    'revealPath',
    'revealBy',
    'revealMode',
    'announce',
    'pingDiscoveries',
  ];

  // Limits that keep a single command from creating an unreasonable number of objects.
  const MAX_REVEAL_DISTANCE = 20;
  const MAX_STROKE_WIDTH = 20;
  const MAX_FILL_HEXES = 20000;
  const MAX_NAME_LENGTH = 100;

  // Hexes are created and removed in batches so large fills do not trip the
  // API's long-running script watchdog.
  const BATCH_SIZE = 100;

  // How close (as a fraction of the column step) a path's centre must be to a
  // hex centre for Rescan to adopt it as a hex.
  const RESCAN_CENTRE_TOLERANCE = 0.2;

  // How close (in pixels) a text label must be to a hex centre to be adopted as its name.
  const RESCAN_LABEL_TOLERANCE = 6;

  // Colour palette for chat cards and handouts.
  const COLOR_HEADER_BG = '#1b2a1f';
  const COLOR_HEADER_TEXT = '#e8dcb5';
  const COLOR_CARD_BG_TOP = '#22352a';
  const COLOR_CARD_BG_BOTTOM = '#14211a';
  const COLOR_BORDER = '#3c5a45';
  const COLOR_TEXT = '#e4e0d0';
  const COLOR_MUTED = '#9aa89c';
  const COLOR_ACCENT = '#d9a441';
  const COLOR_BUTTON_BG = '#b5832a';
  const COLOR_BUTTON_TEXT = '#ffffff';
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
   * Returns true when a value is a colour Roll20 accepts for path fill and stroke:
   * #rgb, #rgba, #rrggbb, #rrggbbaa, rgb(), rgba(), transparent, or a CSS colour name.
   *
   * @param {*} raw Colour text.
   * @returns {boolean} True when valid.
   */
  function isValidColor(raw) {
    const text = toText(raw);
    return (
      /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(text) ||
      /^rgba?\(\s*[\d.]+%?\s*,\s*[\d.]+%?\s*,\s*[\d.]+%?\s*(?:,\s*[\d.]+%?\s*)?\)$/i.test(text) ||
      /^[a-z]{3,20}$/i.test(text)
    );
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
   * Returns the page a player is viewing: their own page when split from the
   * party, otherwise the player ribbon page.
   *
   * @param {string} playerId Roll20 player ID.
   * @returns {string} Page ID.
   */
  function getPlayerPageId(playerId) {
    const campaign = Campaign();
    if (playerIsGM(playerId)) {
      const player = getObj('player', playerId);
      const lastPage = player?.get('_lastpage');
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
   * Returns the player IDs who control a token, directly or through the
   * character it represents.
   *
   * @param {Graphic} token Roll20 token.
   * @returns {string[]} Controller IDs (may include 'all').
   */
  function getTokenControllers(token) {
    const ids = new Set();
    const add = (list) => {
      for (const id of toText(list).split(',')) {
        if (id.trim()) {
          ids.add(id.trim());
        }
      }
    };
    add(token.get('controlledby'));
    const characterId = token.get('represents');
    if (characterId) {
      add(getObj('character', characterId)?.get('controlledby'));
    }
    return [...ids];
  }

  /**
   * Returns true when a token carries a status marker, matching both plain
   * markers ("white-tower") and numbered ones ("white-tower@2").
   *
   * @param {Graphic} token Roll20 token.
   * @param {string} marker Marker tag.
   * @returns {boolean} True when the marker is present.
   */
  function tokenHasMarker(token, marker) {
    return toText(token.get('statusmarkers'))
      .split(',')
      .some((tag) => tag.split('@')[0] === marker);
  }

  /**
   * Splits work into batches run on successive event-loop turns, so large jobs
   * do not trip the API sandbox's long-running script watchdog.
   *
   * @param {Array} items Items to process.
   * @param {number} size Batch size.
   * @param {(item: *, index: number) => void} work Called for each item.
   * @param {(errors: number) => void} [done] Called once every item has been
   *        processed, with the number of items whose work threw.
   * @returns {void}
   */
  function runInBatches(items, size, work, done) {
    let index = 0;
    let errors = 0;
    // Errors are caught per item: an exception thrown from a timer callback
    // would otherwise stop the whole API sandbox.
    const step = () => {
      const end = Math.min(items.length, index + size);
      for (; index < end; index++) {
        try {
          work(items[index], index);
        } catch (err) {
          errors++;
          log(`Hexploration: batch item failed: ${err?.message || err}`);
        }
      }
      if (index < items.length) {
        setTimeout(step, 0);
      } else if (done) {
        try {
          done(errors);
        } catch (err) {
          log(`Hexploration: batch completion failed: ${err?.message || err}`);
        }
      }
    };
    step();
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
    'background:#2c4034',
    `color:${COLOR_TEXT}`,
    'border:1px solid #4d6b56',
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

  /**
   * Builds a small colour swatch with its value.
   *
   * @param {string} color CSS colour.
   * @returns {string} HTML string.
   */
  function buildSwatch(color) {
    const safe = escapeHtml(color);
    return `<span style="display:inline-block;width:12px;height:12px;vertical-align:middle;border:1px solid #888;background:${safe}"></span> <code>${safe}</code>`;
  }

  // Hex grid geometry. Pure functions only: nothing here touches the Roll20 API,
  // so the whole module can be unit tested in Node.
  //
  // Hexes are addressed by offset coordinates [row, col], matching the keys v1
  // stored in state. "vertical" is Roll20's Hex (V) grid (pointy-top hexes, odd
  // rows shifted right by half a hex). "horizontal" is Hex (H) (flat-top hexes,
  // odd columns shifted down by half a hex). Internally the maths converts to
  // cube coordinates, which make distance, rounding and line drawing exact.

  const SQRT3 = Math.sqrt(3);

  const ORIENTATION_VERTICAL = 'vertical';
  const ORIENTATION_HORIZONTAL = 'horizontal';

  // Pixel spacing of a 1-unit hex grid.
  //
  // Legacy values were measured from the Legacy editor's grid by the v1 author
  // and are kept exactly so existing v1 hexes stay aligned. Legacy hexes are
  // slightly stretched rather than regular.
  //
  // Jumpgate draws mathematically regular hexes from the 70 px grid unit: the
  // distance across the flats is one unit, so the corner radius is 70/√3. The
  // first hex's bounding box sits at the page's top-left corner. (Taken from the
  // Jumpgate client's hex grid, which builds cells with radius gridCellSize/√3.)
  // Pages that still do not line up can be corrected with `!hexploration calibrate`.
  const LEGACY_V = {
    colStep: 75.19856198446,
    rowStep: 66.965827824268,
    originX: 37.5,
    originY: 44,
  };
  const LEGACY_H = {
    colStep: 69.585127490377,
    rowStep: 79.688789983504,
    originX: 47,
    originY: 40.5,
  };
  const JUMPGATE_UNIT = 70;

  const GRID_PROFILES = {
    legacy: {
      [ORIENTATION_VERTICAL]: LEGACY_V,
      [ORIENTATION_HORIZONTAL]: LEGACY_H,
    },
    jumpgate: {
      [ORIENTATION_VERTICAL]: {
        colStep: JUMPGATE_UNIT,
        rowStep: (JUMPGATE_UNIT * SQRT3) / 2,
        originX: JUMPGATE_UNIT / 2,
        originY: JUMPGATE_UNIT / SQRT3,
      },
      [ORIENTATION_HORIZONTAL]: {
        colStep: (JUMPGATE_UNIT * SQRT3) / 2,
        rowStep: JUMPGATE_UNIT,
        originX: JUMPGATE_UNIT / SQRT3,
        originY: JUMPGATE_UNIT / 2,
      },
    },
  };

  /**
   * Maps a Roll20 page grid_type to a hex orientation.
   *
   * @param {string} gridType Page grid_type ('hex' or 'hexr').
   * @returns {string|null} Orientation, or null when the grid is not hexagonal.
   */
  function orientationForGridType(gridType) {
    if (gridType === 'hex') {
      return ORIENTATION_VERTICAL;
    }
    if (gridType === 'hexr') {
      return ORIENTATION_HORIZONTAL;
    }
    return null;
  }

  /**
   * Builds a grid description for a page.
   *
   * @param {object} options Grid options.
   * @param {string} options.gridType Page grid_type.
   * @param {number} [options.scale=1] Page snapping_increment (cell size in units).
   * @param {boolean} [options.jumpgate=false] True for Jumpgate geometry.
   * @param {number} [options.offsetX=0] Jumpgate page grid_offset_x, in pixels.
   * @param {number} [options.offsetY=0] Jumpgate page grid_offset_y, in pixels. Jumpgate
   *        measures it upwards, so a positive value moves the grid up the page.
   * @param {object|null} [options.calibration] Per-page pixel overrides from calibrate.
   * @returns {object|null} Grid object, or null when the page has no hex grid.
   */
  function createGrid({
    gridType,
    scale = 1,
    jumpgate = false,
    offsetX = 0,
    offsetY = 0,
    calibration = null,
  }) {
    const orientation = orientationForGridType(gridType);
    if (!orientation) {
      return null;
    }

    const unit = Number(scale) > 0 ? Number(scale) : 1;
    const profile = GRID_PROFILES[jumpgate ? 'jumpgate' : 'legacy'][orientation];
    const grid = {
      orientation,
      colStep: profile.colStep * unit,
      rowStep: profile.rowStep * unit,
      originX: profile.originX * unit + (jumpgate ? Number(offsetX) || 0 : 0),
      originY: profile.originY * unit - (jumpgate ? Number(offsetY) || 0 : 0),
    };

    if (calibration) {
      for (const key of ['colStep', 'rowStep', 'originX', 'originY']) {
        if (
          Number.isFinite(calibration[key]) &&
          (key.startsWith('origin') || calibration[key] > 0)
        ) {
          grid[key] = calibration[key];
        }
      }
    }

    return grid;
  }

  /**
   * Returns true when an integer is odd, including negative values.
   *
   * @param {number} n Integer.
   * @returns {boolean} True when odd.
   */
  function isOdd(n) {
    return (n & 1) === 1;
  }

  /**
   * Builds the state key for a hex.
   *
   * @param {number} row Hex row.
   * @param {number} col Hex column.
   * @returns {string} Key in "row,col" form.
   */
  function hexKey(row, col) {
    return `${row},${col}`;
  }

  /**
   * Parses a "row,col" hex key.
   *
   * @param {string} key Hex key.
   * @returns {number[]|null} [row, col], or null when malformed.
   */
  function parseHexKey(key) {
    const parts = String(key).split(',');
    if (parts.length !== 2) {
      return null;
    }
    const row = Number(parts[0]);
    const col = Number(parts[1]);
    return Number.isInteger(row) && Number.isInteger(col) ? [row, col] : null;
  }

  /**
   * Converts offset coordinates to cube coordinates.
   *
   * @param {object} grid Grid object.
   * @param {number} row Hex row.
   * @param {number} col Hex column.
   * @returns {number[]} [q, r, s].
   */
  function offsetToCube(grid, row, col) {
    let q;
    let r;
    if (grid.orientation === ORIENTATION_VERTICAL) {
      q = col - (row - (row & 1)) / 2;
      r = row;
    } else {
      q = col;
      r = row - (col - (col & 1)) / 2;
    }
    return [q, r, -q - r];
  }

  /**
   * Converts cube coordinates to offset coordinates.
   *
   * @param {object} grid Grid object.
   * @param {number[]} cube [q, r, s].
   * @returns {number[]} [row, col].
   */
  function cubeToOffset(grid, cube) {
    const [q, r] = cube;
    if (grid.orientation === ORIENTATION_VERTICAL) {
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
    // Normalise -0 so keys never contain "-0".
    return [q + 0, r + 0, s + 0];
  }

  /**
   * Returns the pixel centre of a hex.
   *
   * @param {object} grid Grid object.
   * @param {number} row Hex row.
   * @param {number} col Hex column.
   * @returns {number[]} [x, y].
   */
  function hexToPixel(grid, row, col) {
    if (grid.orientation === ORIENTATION_VERTICAL) {
      return [
        grid.originX + (col + (isOdd(row) ? 0.5 : 0)) * grid.colStep,
        grid.originY + row * grid.rowStep,
      ];
    }
    return [
      grid.originX + col * grid.colStep,
      grid.originY + (row + (isOdd(col) ? 0.5 : 0)) * grid.rowStep,
    ];
  }

  /**
   * Returns the hex containing a pixel position.
   *
   * The grid is treated as a regular hex lattice scaled by colStep and rowStep,
   * so this is exact for both regular (Jumpgate) and stretched (Legacy) hexes.
   *
   * @param {object} grid Grid object.
   * @param {number} x Pixel x.
   * @param {number} y Pixel y.
   * @returns {number[]} [row, col].
   */
  function pixelToHex(grid, x, y) {
    const colF = (x - grid.originX) / grid.colStep;
    const rowF = (y - grid.originY) / grid.rowStep;
    let q;
    let r;
    if (grid.orientation === ORIENTATION_VERTICAL) {
      q = colF - rowF / 2;
      r = rowF;
    } else {
      q = colF;
      r = rowF - colF / 2;
    }
    return cubeToOffset(grid, cubeRound([q, r, -q - r]));
  }

  /**
   * Returns the number of hex steps between two hexes.
   *
   * @param {object} grid Grid object.
   * @param {number[]} a [row, col].
   * @param {number[]} b [row, col].
   * @returns {number} Distance in hexes.
   */
  function hexDistance(grid, a, b) {
    const ca = offsetToCube(grid, a[0], a[1]);
    const cb = offsetToCube(grid, b[0], b[1]);
    return Math.max(Math.abs(ca[0] - cb[0]), Math.abs(ca[1] - cb[1]), Math.abs(ca[2] - cb[2]));
  }

  /**
   * Returns every hex within a distance of a hex (excluding the hex itself),
   * nearest first.
   *
   * @param {object} grid Grid object.
   * @param {number} row Hex row.
   * @param {number} col Hex column.
   * @param {number} radius Distance in hexes.
   * @returns {number[][]} Array of [row, col].
   */
  function hexesWithin(grid, row, col, radius) {
    const result = [];
    const [q, r] = offsetToCube(grid, row, col);
    for (let dist = 1; dist <= radius; dist++) {
      for (let dq = -dist; dq <= dist; dq++) {
        for (let dr = Math.max(-dist, -dq - dist); dr <= Math.min(dist, -dq + dist); dr++) {
          const ds = -dq - dr;
          if (Math.max(Math.abs(dq), Math.abs(dr), Math.abs(ds)) === dist) {
            result.push(cubeToOffset(grid, [q + dq, r + dr, -(q + dq) - (r + dr)]));
          }
        }
      }
    }
    return result;
  }

  /**
   * Returns the hexes on a straight line between two hexes, both ends included.
   *
   * @param {object} grid Grid object.
   * @param {number[]} a [row, col].
   * @param {number[]} b [row, col].
   * @returns {number[][]} Array of [row, col].
   */
  function hexLine(grid, a, b) {
    const n = hexDistance(grid, a, b);
    const ca = offsetToCube(grid, a[0], a[1]);
    const cb = offsetToCube(grid, b[0], b[1]);
    if (n === 0) {
      return [[a[0], a[1]]];
    }

    // A tiny nudge stops the line landing exactly on hex edges, where rounding
    // would otherwise pick a side inconsistently.
    const nudge = [1e-6, 2e-6, -3e-6];
    const result = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const cube = [0, 1, 2].map((k) => ca[k] + nudge[k] + (cb[k] - ca[k]) * t);
      result.push(cubeToOffset(grid, cubeRound(cube)));
    }
    return result;
  }

  /**
   * Returns the hexes strictly between two hexes on a straight line.
   *
   * @param {object} grid Grid object.
   * @param {number[]} a [row, col].
   * @param {number[]} b [row, col].
   * @returns {number[][]} Array of [row, col].
   */
  function hexesBetween(grid, a, b) {
    return hexLine(grid, a, b).slice(1, -1);
  }

  /**
   * Returns the hexes crossed by a pixel-space line segment, in travel order.
   *
   * @param {object} grid Grid object.
   * @param {number[]} from [x, y].
   * @param {number[]} to [x, y].
   * @returns {number[][]} Array of [row, col].
   */
  function hexesAlongSegment(grid, from, to) {
    return hexLine(grid, pixelToHex(grid, from[0], from[1]), pixelToHex(grid, to[0], to[1]));
  }

  /**
   * Returns the six corner points of a hex in pixels.
   *
   * @param {object} grid Grid object.
   * @param {number} row Hex row.
   * @param {number} col Hex column.
   * @returns {number[][]} Array of six [x, y] points, clockwise.
   */
  function hexCorners(grid, row, col) {
    const [cx, cy] = hexToPixel(grid, row, col);
    const corners = [];
    for (let i = 0; i < 6; i++) {
      if (grid.orientation === ORIENTATION_VERTICAL) {
        const angle = ((30 + 60 * i) * Math.PI) / 180;
        corners.push([
          cx + (Math.cos(angle) / SQRT3) * grid.colStep,
          cy + ((Math.sin(angle) * 2) / 3) * grid.rowStep,
        ]);
      } else {
        const angle = (60 * i * Math.PI) / 180;
        corners.push([
          cx + ((Math.cos(angle) * 2) / 3) * grid.colStep,
          cy + (Math.sin(angle) / SQRT3) * grid.rowStep,
        ]);
      }
    }
    return corners;
  }

  /**
   * Returns every hex whose centre lies inside a bounding box.
   *
   * @param {object} grid Grid object.
   * @param {object} box Box with left, top, right and bottom in pixels.
   * @returns {number[][]} Array of [row, col].
   */
  function hexesInBox(grid, box) {
    const [r0, c0] = pixelToHex(grid, box.left, box.top);
    const [r1, c1] = pixelToHex(grid, box.right, box.bottom);
    const result = [];
    for (let row = Math.min(r0, r1) - 1; row <= Math.max(r0, r1) + 1; row++) {
      for (let col = Math.min(c0, c1) - 1; col <= Math.max(c0, c1) + 1; col++) {
        const [x, y] = hexToPixel(grid, row, col);
        if (x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) {
          result.push([row, col]);
        }
      }
    }
    return result;
  }

  /**
   * Returns every hex needed to cover a page completely, including the partial
   * hexes along its edges.
   *
   * @param {object} grid Grid object.
   * @param {number} widthPx Page width in pixels.
   * @param {number} heightPx Page height in pixels.
   * @returns {number[][]} Array of [row, col].
   */
  function hexesCoveringPage(grid, widthPx, heightPx) {
    // A hex overlaps the page when its centre is within its own half-size of
    // the page edge. Slivers thinner than a quarter pixel are ignored.
    const vertical = grid.orientation === ORIENTATION_VERTICAL;
    const padX = (vertical ? grid.colStep / 2 : (grid.colStep * 2) / 3) - 0.25;
    const padY = (vertical ? (grid.rowStep * 2) / 3 : grid.rowStep / 2) - 0.25;
    return hexesInBox(grid, {
      left: -padX,
      top: -padY,
      right: widthPx + padX,
      bottom: heightPx + padY,
    });
  }

  /**
   * Returns the hexes a token covers: every hex whose centre lies under the
   * token, plus the hex under its centre.
   *
   * @param {object} grid Grid object.
   * @param {number} x Token centre x.
   * @param {number} y Token centre y.
   * @param {number} width Token width in pixels.
   * @param {number} height Token height in pixels.
   * @returns {number[][]} Array of [row, col], centre hex first.
   */
  function hexesUnderToken(grid, x, y, width, height) {
    const centre = pixelToHex(grid, x, y);
    // Shrink slightly so a token that only touches a neighbour's centre does not claim it.
    const halfW = Math.max(0, width / 2 - 2);
    const halfH = Math.max(0, height / 2 - 2);
    const covered = hexesInBox(grid, {
      left: x - halfW,
      top: y - halfH,
      right: x + halfW,
      bottom: y + halfH,
    });
    const centreKey = hexKey(centre[0], centre[1]);
    return [centre, ...covered.filter(([r, c]) => hexKey(r, c) !== centreKey)];
  }

  /**
   * Derives a calibration from tokens the GM has snapped to hex centres.
   *
   * One token corrects the grid origin. Two tokens in neighbouring cells of the
   * same row (Hex V) or column (Hex H) also correct the hex spacing, keeping the
   * current ratio between column and row spacing.
   *
   * @param {object} grid Current grid object.
   * @param {number[][]} points Token centres [[x, y], ...].
   * @returns {object|null} Calibration, or null when the points cannot be used.
   */
  function calibrateGrid(grid, points) {
    if (!Array.isArray(points) || points.length === 0) {
      return null;
    }

    let { colStep, rowStep } = grid;
    if (points.length >= 2) {
      const [a, b] = points;
      const vertical = grid.orientation === ORIENTATION_VERTICAL;
      const along = vertical ? Math.abs(b[0] - a[0]) : Math.abs(b[1] - a[1]);
      const across = vertical ? Math.abs(b[1] - a[1]) : Math.abs(b[0] - a[0]);
      const currentStep = vertical ? colStep : rowStep;
      const steps = Math.round(along / currentStep);
      if (steps < 1 || across > currentStep / 4) {
        return null;
      }
      const ratio = rowStep / colStep;
      if (vertical) {
        colStep = along / steps;
        rowStep = colStep * ratio;
      } else {
        rowStep = along / steps;
        colStep = rowStep / ratio;
      }
    }

    const scaled = { ...grid, colStep, rowStep };
    const [px, py] = points[0];
    const [row, col] = pixelToHex(scaled, px, py);
    const [cx, cy] = hexToPixel(scaled, row, col);
    const calibration = {
      colStep,
      rowStep,
      originX: grid.originX + (px - cx),
      originY: grid.originY + (py - cy),
    };

    // Keep the origin inside the first cell so offsets stay small and stable.
    // Shifting by two rows/columns preserves the odd/even offset pattern.
    const vertical = grid.orientation === ORIENTATION_VERTICAL;
    const wrapX = vertical ? colStep : colStep * 2;
    const wrapY = vertical ? rowStep * 2 : rowStep;
    calibration.originX = ((calibration.originX % wrapX) + wrapX) % wrapX;
    calibration.originY = ((calibration.originY % wrapY) + wrapY) % wrapY;
    return calibration;
  }

  const TRANSLATION$4 = {
    titles: {
      ready: 'Heeksplorasie is gereed.',
      settings: 'Heksplorasie-instellings',
      languages: "Kies 'n taal",
      pageSettings: 'Bladsyinstellings: {page}',
      status: 'Heksplorasiestatus: {page}',
      help: 'Heksplorasie-opdragte',
      confirm: 'Bevestig asseblief',
    },
    discovery: {
      title: 'Ligging ontdek',
    },
    menu: {
      draw: 'Teken',
      reveal: 'Openbaar en versteek',
      locations: 'Liggings',
      tools: 'Gereedskap',
      layerInUse: 'Nuwe hekse word op die {layer} geteken.',
      pageSettingsHelp:
        'Hierdie instellings is slegs van toepassing op hierdie bladsy. Instellings gemerk ★ ignoreer die globale instellings.',
    },
    buttons: {
      fill: 'Vul',
      fillInverse: 'Omgekeerde vul',
      undo: 'Ontdoen vul',
      reveal: 'Onthul',
      conceal: 'Versteek',
      explore: 'Verken',
      revealPage: 'Onthul bladsy',
      resetPage: 'Stel bladsy terug',
      mark: 'Merk ligging',
      unmark: 'Ontmerk',
      name: 'Noem Hex',
      settings: 'Instellings',
      pageSettings: 'Bladsy-instellings',
      status: 'Status',
      rescan: 'Skandeer weer',
      calibrate: 'Kalibreer',
      calibrateReset: 'Stel Kalibrasie terug',
      help: 'Help',
      change: 'Verander',
      menu: 'Spyskaart',
      clearOverrides: 'Vee oorskrywings uit',
      confirmReset: 'Ja, verwyder alle hekse',
    },
    prompts: {
      name: 'Liggingnaam (laat leeg om skoon te maak)',
    },
    values: {
      on: 'Aan',
      off: 'Af',
      none: 'Geen',
      hexLayer: {
        auto: 'Outo (voorgrond indien beskikbaar)',
        foreground: 'voorgrond laag',
        objects: 'tekenlaag',
      },
      revealBy: {
        players: 'Speler tokens',
        characters: 'Karaktertekens',
        all: 'Alle tekens',
      },
      revealMode: {
        clear: 'Duidelik',
        glimpse: 'Glimpie',
      },
      announce: {
        all: 'Almal',
        gm: 'Slegs GM',
        off: 'Af',
      },
      orientation: {
        vertical: 'Heks (V)',
        horizontal: 'Heks (H)',
      },
      fillKind: {
        fill: 'Vul',
        fillInverse: 'Omgekeerde vul',
        conceal: 'Versteek',
      },
    },
    settings: {
      language: {
        label: 'Taal',
        desc: 'Taal vir spyskaarte, boodskappe en uitdeelstukke.',
      },
      hexLayer: {
        label: 'Hex laag',
        desc: 'Waar nuwe hekkies geteken word. Outo probeer die voorgrondlaag (bo tokens) en val terug na die token laag as die speletjie dit nie ondersteun nie.',
      },
      fillColor: {
        label: 'Vul kleur',
        desc: 'Kleur van nuwe hekkies. Gebruik rgba() vir deursigtige hekse, byvoorbeeld rgba(0,0,0,0.8).',
      },
      strokeColor: {
        label: 'Rand Kleur',
        desc: 'Kleur van die buitelyn van nuwe hekse.',
      },
      labelColor: {
        label: 'Etiket Kleur',
        desc: 'Kleur van die GM-net naametikette op benoemde hekse.',
      },
      glimpseColor: {
        label: 'Glimp kleur',
        desc: "Kleur hekkies verander na wanneer gekyk word (Glimpse onthullingsmodus). Gebruik 'n deurskynende rgba()-kleur.",
      },
      strokeWidth: {
        label: 'Grens breedte',
        desc: 'Breedte van die buitelyn van nuwe hekse, in pixels (0 tot 20).',
      },
      maxDistance: {
        label: 'Hex Reveal Distance',
        desc: "Toegepas op hekse soos hulle geteken word: 'n teken moet binne hierdie baie hekse wees om hulle te openbaar, hoe ver dit ook al kan sien. Laat leeg vir geen beperking nie.",
      },
      revealDistance: {
        label: 'Sigafstand',
        desc: "Hoeveel hekkies rondom 'n bewegende teken word geopenbaar (0 tot 20). 0 openbaar slegs die hekkies waardeur die teken gaan.",
      },
      lineOfSight: {
        label: 'Siglyn',
        desc: "Wanneer dit aan is, word 'n hex slegs geopenbaar as geen bedekte hex tussen dit en die teken lê nie.",
      },
      revealPath: {
        label: 'Openbaar Langs Pad',
        desc: "Wanneer dit aan is, word elke heks wat 'n teken deurgaan terwyl dit gesleep word (insluitend waypoints) geopenbaar, nie net waar dit stop nie.",
      },
      revealBy: {
        label: 'Tekens wat openbaar',
        desc: "Watter tekens op die tekenlaag openbaar hekse: tekens wat deur 'n speler beheer word, tekens wat enige karakter verteenwoordig, of elke teken.",
      },
      revealMode: {
        label: 'Onthullingsmodus',
        desc: "Clear verwyder hekkies binne sig. Glimpse maak hulle eerder deurskynend; hulle word verwyder wanneer 'n teken hulle binnekom.",
      },
      announce: {
        label: 'Kondig ontdekkings aan',
        desc: "Wie sien die kletsboodskap wanneer 'n genoemde ligging ontdek word.",
      },
      pingDiscoveries: {
        label: 'Ping Ontdekkings',
        desc: "Wanneer aan, word spelers na 'n genoemde plek geping wanneer dit ontdek word.",
      },
    },
    status: {
      engine: 'Spel enjin',
      grid: 'Rooster',
      layer: 'Hex laag',
      hexes: 'Hekse',
      named: 'Benoemde hekse',
      icons: 'Liggingtekens',
      glimpsed: 'Geskimpte hekkies',
      pending: "Liggings wat wag vir 'n vulling",
      calibrated: 'Gekalibreer',
      overrides: 'Bladsy ignoreer',
      undo: 'Ontdoen beskikbaar',
    },
    messages: {
      filled:
        'Vul voltooi: {created} heks geteken, {restyled} herstileer, {icons} liggings versteek.',
      revealed: '{count} hekkies geopenbaar.',
      revealedPage: 'Alle {count} hekse op die bladsy is geopenbaar.',
      confirmReset:
        'Verwyder alle {count} hekse van "{page}"? Liggingtokens keer terug na die tokenlaag. Ontdoen kan dit nie omkeer nie.',
      resetPage: '{count} hekse van die bladsy verwyder.',
      undone:
        'Laaste invulling is ongedaan gemaak: {removed} hekse is verwyder, {restored} herstileerde hekse is teruggestel.',
      named: '{count} heksies genaamd "{name}".',
      unnamed: 'Naam verwyder van {count} hekse.',
      marked:
        '{attached} liggings versteek in bestaande hekkies; {pending} sal versteek word deur die volgende vul wat hulle bedek.',
      unmarked: '{count} tekens is nie meer liggings nie.',
      settingChanged: '{setting} gestel na {value}.',
      rescanned:
        "Herskandering voltooi: {kept} hekkies gehou, {adopted} aangeneem, {moved} herliasseer, {dropped} ontbrekende hekse vergete, {labels} etikette en __HEX_PLACEHOLDER's herskakel na.",
      calibrated:
        'Rooster gekalibreer (kolomstap {colStep}px, rystap {rowStep}px). Herskandeer: {kept} behou, {moved} herliasseer, {adopted} aangeneem.',
      calibrationReset:
        'Kalibrasie verwyder. Herskandeer: {kept} behou, {moved} herliasseer, {adopted} aangeneem.',
      journalRebuilt: 'Die "{help}" en "{deck}"-uitdeelstukke is herbou.',
      migrated:
        "Jou Hexploration 1.x-hex-kaarte is opgegradeer. As hierdie speletjie uit 'n Legacy-speletjie gekopieer is, voer Rescan op elke hekskaartbladsy uit.",
      pruned:
        '{dropped} gestoorde hekkies bestaan ​​nie meer nie en is vergeet. As hierdie speletjie of bladsy gekopieer is, hardloop Rescan op die bladsy om sy hekkies weer op te tel.',
      readyHint:
        'Tik !hexploration vir die spyskaart, of maak die "Hexploration - Command Deck"-uitdeelstuk oop.',
    },
    warnings: {
      foregroundUnavailable:
        'Hierdie speletjie ondersteun nie tekening op die voorgrondlaag nie, dus is hekse op die tekenlaag geteken.',
      someFailed:
        '{count} heks kon nie geteken word nie. Gaan die API-konsole na vir besonderhede.',
    },
    errors: {
      noPage: 'Kon nie die bladsy vind om aan te werk nie.',
      notHex: "Hierdie bladsy gebruik nie 'n hex-rooster nie.",
      noPolygons: 'Kies een of meer getekende vorms om te vul.',
      emptyArea: 'Die geselekteerde area bevat geen heksasiemiddels nie.',
      tooMany: 'Dit sal {count} hexes skep, wat te veel in een slag is.',
      nothingToConceal: 'Kies getekende vorms of tekens om te versteek.',
      nothingToReveal: 'Kies hekkies, getekende vorms of tekens om te openbaar.',
      noTokens: 'Kies eers een of meer tekens.',
      noHexes: 'Kies eers een of meer hekse (of tekens wat op hekse staan).',
      nothingToUndo: 'Daar is geen vul om ongedaan te maak nie.',
      unknownCommand: 'Onbekende opdrag: {command}',
      unknownSetting: 'Onbekende instelling: {key}',
      unknownPageSetting: 'Instellings wat per bladsy gestel kan word: {keys}',
      invalidValue: '"{value}" is nie \'n geldige waarde vir {key} nie.',
      calibrateNeedsTokens: 'Kies een of twee tokens wat aan heksende middelpunte geknip is.',
      calibrateFailed: 'Daardie tekens kan nie gebruik word om te kalibreer nie.',
      unexpected: 'Iets het verkeerd geloop: {message}',
    },
    hints: {
      noPage: 'Maak die bladsy oop waaraan jy wil werk, of kies iets daarop.',
      notHex: 'Stel die bladsyrooster op Hex (V) of Hex (H) in Bladsy-instellings.',
      noPolygons:
        "Teken 'n veelhoek, reghoek, ellips of vryhandvorm om die area, kies dit en probeer dan weer.",
      emptyArea: "Teken 'n groter vorm, of gaan die bladsyroosterinstellings na.",
      tooMany: 'Vul `n kleiner area, of verdeel die area in verskeie vorms.',
      noHexes:
        'Hekse is op die voorgrond of tekenlaag; skakel oor na daardie laag om hulle te kies.',
      unknownCommand: 'Tik !hexploration help om die opdragte te lys.',
      unknownSetting: 'Tik !hexploration set om elke instelling te sien.',
      calibrateNeedsTokens:
        "Knip 'n teken in die middel van 'n hekshoek en kies dit. Kies 'n tweede teken wat aan 'n naburige heks in dieselfde ry (Hex V) of kolom (Hex H) geknip is om ook die heksgrootte reg te stel.",
      calibrateFailed:
        'Twee tekens moet in dieselfde ry (Hex V) of dieselfde kolom (Hex H) wees, ten minste een heks van mekaar.',
      unexpected: 'Besonderhede is in die API-konsole-logboek.',
    },
    help: {
      menu: 'Wys die spyskaart.',
      fill: 'Bedek die geselekteerde getekende vorms met hekse.',
      fillInverse: 'Bedek die hele bladsy behalwe binne die geselekteerde vorms.',
      undo: 'Ontdoen die laaste vulling, omgekeerde vulling of versteek, en herstel die vorms wat dit gebruik het.',
      reveal:
        'Onthul die geselekteerde hekse, en die hekse onder die geselekteerde vorms en tekens.',
      revealPage: 'Onthul elke heksie op die bladsy sonder aankondigings.',
      conceal: 'Bedek die area onder die geselekteerde vorms en tekens weer met hekkies.',
      explore: 'Onthul rondom die geselekteerde tekens asof hulle net daarheen verhuis het.',
      resetPage: 'Verwyder elke heks op die bladsy (vra eers).',
      name: 'Noem die geselekteerde hekse, of die hekse onder die geselekteerde tokens. Laat die naam leeg om dit skoon te maak.',
      mark: 'Verander die geselekteerde tekens in versteekte liggings.',
      unmark: 'Stop dat die geselekteerde tokens versteekte liggings is.',
      set: "Verander 'n instelling, of wys alle instellings.",
      pageSet: "Ignoreer slegs 'n onthulling-instelling op die huidige bladsy.",
      pageClear: 'Verwyder die huidige bladsy se ignorering.',
      rescan:
        "Herbou die bladsy se hex lys, byvoorbeeld nadat jy 'n bladsy of speletjie gekopieer het.",
      calibrate:
        'Voer die hekselrooster uit met een of twee geselekteerde tokens wat aan heksmiddelmiddels vasgemaak is.',
      calibrateReset: 'Verwyder die huidige bladsy se kalibrasie.',
      status: 'Wys wat Hexploration van die huidige bladsy weet.',
      journal: 'Herbou die hulp- en beveldek-uitdeelstukke.',
      help: 'Wys hierdie lys.',
      handout: 'Volledige instruksies is in die "{name}"-uitdeelstuk.',
    },
    deck: {
      subtitle: 'Beveldek',
      drawDesc:
        "Teken vorms om 'n area, kies hulle en vul dan. Ontdoen keer die laaste vulling om.",
      revealDesc:
        'Kies hekkies, vorms of tekens om dit weer te openbaar of te bedek. Verken onthullings rondom geselekteerde tekens asof hulle beweeg het.',
      locationsDesc:
        "Kies tekens om hulle as liggings onder hekkies te versteek. Kies hekkies of tekens om 'n heks te noem.",
      toolsDesc:
        'Instellings, bladsy ignoreer, status, herskandeer van gekopieerde bladsye en kalibrering van die rooster.',
      footer: 'Sien die "{help}"-uitdeelstuk vir volledige instruksies.',
    },
    handout: {
      versionLabel: 'Weergawe',
      subtitle: 'Heks-vir-heks verkenning vir Roll20',
      footer: 'Gebruik die "{deck}"-uitdeelstuk vir een-klik kontroles.',
      overview: {
        heading: 'Oorsig',
        body: "Heksplorasie dek 'n hekskaart met ondeursigtige hekse. Soos die party beweeg, word die hekkies waardeur hulle gaan (en, as jy wil, die hekse rondom hulle) verwyder, sodat die kaart een hek op 'n slag ontbloot word. Versteekte liggings kan onder hekkies geplaas word en word aangekondig wanneer dit gevind word. Dit werk in Jumpgate en Legacy-speletjies, op Hex (V) en Hex (H) roosters van enige grootte.",
        demo: "Kyk na 'n kort demonstrasie (vanaf weergawe 1)",
      },
      quickStart: {
        heading: 'Vinnige Begin',
        steps: [
          "Maak 'n bladsy oop waarvan die rooster op Hex (V) of Hex (H) gestel is.",
          'Teken een of meer vorms (veelhoek, reghoek, ellips of vryhand) om die area om weg te steek.',
          'Kies die vorms en klik Vul die Command Deck in (of tik !hexploration fill). Die vorms word deur hekse vervang.',
          'Opsioneel: voor invul, kies tekens vir belangrike plekke en klik Merk ligging. Hulle word onder die hekse versteek en aangekondig wanneer hulle ontdek word.',
          "Beweeg 'n spelertoken. Elke heks wat dit deurgaan, en die hekse binne sy sigafstand, word geopenbaar.",
        ],
      },
      commands: {
        heading: 'Opdragte',
        intro:
          "Slegs GM'e kan hierdie opdragte gebruik. Die meeste werk op die geselekteerde voorwerpe; die res tree op op die bladsy wat jy bekyk.",
        colCommand: 'Bevel',
        colDesc: 'Wat dit doen',
      },
      revealing: {
        heading: 'Hoe onthulling werk',
        points: [
          'Slegs tekens op die tekenlaag openbaar hekse. Watter tokens telling word bepaal deur Tokens That Reveal: speler tokens by verstek, sodat die GM monsters kan skuif sonder om die kaart te ontbloot.',
          "'n Teken onthul elke hek wat dit dek (groot tokens dek verskeie) en, met Reveal Along Path op, elke hek op die roete wat dit meegesleep is, insluitend waypoints.",
          "Sigafstand openbaar die hekse rondom elkeen van daardie hekse. Met siglyn aan, word 'n hekshoek slegs geopenbaar as geen bedekte heks tussenin lê nie.",
          "Hex Reveal Distance word op hekse gestoor soos hulle geteken word. Daardie hekse word net van binne geopenbaar soveel hekse, hoe ver 'n teken ook al kan sien. Gebruik dit vir berge of woude wat versteek wat agter hulle is.",
          "In Glimpse-modus word hekkies binne sig deurskynend in plaas daarvan om te verdwyn, en word verwyder wanneer 'n teken hulle binnekom.",
          'Die API rapporteer nie bewegings wat deur ander mods gemaak is nie. TokenMod-skuiwe word outomaties opgetel; vir ander mods, kies die tokens en klik Explore, of bel Hexploration.revealAround(token) vanaf jou eie mod.',
        ],
      },
      locations: {
        heading: 'Genoemde hekse en liggings',
        points: [
          "Merk ligging verander die geselekteerde tekens in versteekte liggings. 'n Teken wat reeds onder 'n heksel is, word dadelik weggesteek; anders word dit weggesteek deur die volgende vul wat dit bedek.",
          'Tekens met die wittoringstatusmerker word ook as liggings hanteer wanneer jy invul, soos in weergawe 1.',
          'Versteekte liggingtokens word na die GM-laag geskuif. Wanneer hul heks onthul word, keer hulle terug na die tekenlaag met hul naam gewys, en hul ontdekking word aangekondig.',
          "Name Hex gee 'n hex 'n naam sonder 'n teken. Die naam word aan die GM gewys as 'n etiket op die GM-laag en aangekondig wanneer die heksel bekend gemaak word.",
          'Announce Discoveries kies of almal, net die GM, of niemand die aankondiging sien nie. Ping Discoveries skuif ook die spelers se uitsig na die ligging.',
        ],
      },
      settings: {
        heading: 'Instellings',
        intro:
          'Verander instellings met !hexploration set (of die Instellings-knoppie). Hex Layer, Tokens That Reveal en Language kan ook op die Mod se instellingsbladsy ingestel word.',
        colKey: 'Sleutel',
        colName: 'Instelling',
        colDesc: 'Beskrywing',
        perPage: '(Kan per bladsy gestel word.)',
      },
      jumpgate: {
        heading: 'Jumpgate en Legacy',
        points: [
          'Heeksplorasie werk uit watter enjin die speletjie gebruik en teken die bypassende soort vorm. Vorms wat in enige redigeerder geteken is, kan gevul word.',
          'Met Hex Layer op Outo gestel, word hekse op die voorgrondlaag bo tekens geteken, sodat spelers nie kan sien wat onder is nie. As die voorgrondlaag nie beskikbaar is nie, word die tekenlaag eerder gebruik.',
          "Jumpgate teken wiskundig gereelde hekse, wat 'n effens ander vorm as Legacy hekse is. As die hekkies nie in lyn is met 'n bladsy se rooster nie, plak 'n teken na 'n heksasiemiddel, kies dit en klik Kalibreer. Kies twee tekens in naburige heks van dieselfde ry (Hex V) of kolom (Hex H) om die heksgrootte ook reg te stel.",
          "Wanneer 'n bladsy of speletjie gekopieer word, kry sy hekkies nuwe ID's. Begin Rescan op die bladsy om hulle weer op te tel, saam met hul naametikette en liggingtokens.",
        ],
      },
      upgrading: {
        heading: 'Opgradering vanaf weergawe 1',
        points: [
          "Weergawe 2 het nie meer PathMath, MatrixMath, Vector Math of HTML Builder nodig nie. Jy kan hulle verwyder tensy 'n ander mod dit gebruik.",
          'Bestaande hekskaarte, name, liggingtekens en instellings word outomaties opgegradeer met die eerste aanvang.',
          'Die weergawe 1-opdragte, insluitend die Hexploration_menu-makro, werk steeds.',
          "Weergawe 1 laat enige teken wat 'n karakter verteenwoordig, hekse openbaar. Stel tekens wat openbaar op karaktertekens om daardie gedrag te behou.",
        ],
        colV1: 'Weergawe 1 opdrag',
        colV2: 'Weergawe 2 opdrag',
      },
      troubleshooting: {
        heading: 'Probleemoplossing',
        points: [
          "Niks gebeur wanneer 'n teken beweeg nie: maak seker dat die teken op die tekenlaag is en ooreenstem met Tokens That Reveal, en dat die bladsy hekse het (!hexploration-status).",
          "Hekse is verreken van die rooster: gebruik Kalibreer, kyk dan met 'n teken op 'n paar hekse oor die kaart.",
          "Hexes het opgehou om te openbaar nadat 'n bladsy of speletjie gekopieer is: hardloop Rescan op die bladsy.",
          'Fill sê die area het geen hekselmiddels nie: die vorm moet die middelpunt van ten minste een hekshoek bevat.',
          'Vir enigiets anders, gaan die API-konsole-logboek na en sluit sy boodskappe in wanneer jy om hulp vra.',
        ],
      },
      languages: {
        heading: 'Tale',
        body: "Kies 'n taal met !hexploration stel taal. Beskikbare tale:",
      },
      credits: {
        heading: 'Krediete',
        original: 'Oorspronklike mod deur',
        maintainer: 'Weergawe 2 onderhou deur',
        marketplace: 'Ada se kunspakkies op die Roll20 Marketplace',
        support:
          "As jy 'n fout vind of 'n idee het, plaas in die Roll20 Mod-forum of maak 'n probleem op GitHub oop, en sluit enige boodskappe van die API-konsole-logboek in.",
      },
    },
  };

  const TRANSLATION$3 = {
    titles: {
      ready: "L'exploració està a punt.",
      settings: "Configuració d'exploració",
      languages: 'Trieu un idioma',
      pageSettings: 'Configuració de la pàgina: {page}',
      status: "Estat de l'exploració: {page}",
      help: "Comandes d'exploració",
      confirm: 'Si us plau, confirmeu',
    },
    discovery: {
      title: 'Localització descoberta',
    },
    menu: {
      draw: 'Dibuixa',
      reveal: 'Revela i amaga',
      locations: 'Ubicacions',
      tools: 'Eines',
      layerInUse: "S'estan dibuixant nous hexagones al {layer}.",
      pageSettingsHelp:
        "Aquesta configuració només s'aplica a aquesta pàgina. La configuració marcada amb ★ anul·la la configuració global.",
    },
    buttons: {
      fill: 'Omplir',
      fillInverse: 'Farciment invers',
      undo: 'Desfer el farciment',
      reveal: 'Revelar',
      conceal: 'Ocultar',
      explore: 'Explora',
      revealPage: 'Revela la pàgina',
      resetPage: 'Restableix la pàgina',
      mark: 'Marca la ubicació',
      unmark: 'Desmarca',
      name: 'Nom Hex',
      settings: 'Configuració',
      pageSettings: 'Configuració de la pàgina',
      status: 'Estat',
      rescan: 'Torna a escanejar',
      calibrate: 'Calibrar',
      calibrateReset: 'Restableix la calibració',
      help: 'Ajuda',
      change: 'Canviar',
      menu: 'Menú',
      clearOverrides: 'Esborra les substitucions',
      confirmReset: 'Sí, traieu tots els hexagones',
    },
    prompts: {
      name: 'Nom de la ubicació (deixeu en blanc per esborrar)',
    },
    values: {
      on: 'Encès',
      off: 'Apagat',
      none: 'Cap',
      hexLayer: {
        auto: 'Automàtic (en primer pla si està disponible)',
        foreground: 'capa de primer pla',
        objects: 'capa de testimoni',
      },
      revealBy: {
        players: 'Fitxes de jugador',
        characters: 'Fitxes de personatges',
        all: 'Totes les fitxes',
      },
      revealMode: {
        clear: 'Clar',
        glimpse: "Un cop d'ull",
      },
      announce: {
        all: 'Tothom',
        gm: 'Només GM',
        off: 'Apagat',
      },
      orientation: {
        vertical: 'Hexadecimal (V)',
        horizontal: 'Hex (H)',
      },
      fillKind: {
        fill: 'Omplir',
        fillInverse: 'Farciment invers',
        conceal: 'Ocultar',
      },
    },
    settings: {
      language: {
        label: 'Llengua',
        desc: 'Idioma per a menús, missatges i fullets.',
      },
      hexLayer: {
        label: 'Capa hexagonal',
        desc: "On es dibuixen nous hexagones. Auto prova la capa de primer pla (a sobre de fitxes) i torna a caure a la capa de fitxes si el joc no l'admet.",
      },
      fillColor: {
        label: 'Color de farciment',
        desc: 'Color dels nous hexagonals. Utilitzeu rgba() per a hexadecimals transparents, per exemple rgba(0,0,0,0.8).',
      },
      strokeColor: {
        label: 'Color de la vora',
        desc: 'Color del contorn dels nous hexagonals.',
      },
      labelColor: {
        label: "Color de l'etiqueta",
        desc: 'Color de les etiquetes de nom només de GM en hexadecims amb nom.',
      },
      glimpseColor: {
        label: "Color d'ull",
        desc: 'Els hexagonals de color canvien a quan es veuen (mode de revelació de vista). Utilitzeu un color rgba() transparent.',
      },
      strokeWidth: {
        label: 'Amplada de la vora',
        desc: 'Amplada del contorn dels nous hexadecimals, en píxels (0 a 20).',
      },
      maxDistance: {
        label: 'Distància de revelació hexagonal',
        desc: "S'aplica als hexàgons a mesura que es dibuixen: una fitxa ha d'estar dins d'aquests hexagones per revelar-los, per molt lluny que pugui veure. Deixeu buit sense límit.",
      },
      revealDistance: {
        label: 'Distància de visió',
        desc: "Quants hexagones es mostren al voltant d'una fitxa en moviment (de 0 a 20). 0 només revela els hexagones pels quals passa la fitxa.",
      },
      lineOfSight: {
        label: 'Línia de visió',
        desc: 'Quan està activat, un hexàgon només es revela si no hi ha cap hexagonal cobert entre ell i la fitxa.',
      },
      revealPath: {
        label: 'Revela al llarg del camí',
        desc: "Quan està activat, es revela cada hexàgono per on passa una fitxa mentre és arrossegada (inclosos els waypoints), no només on s'atura.",
      },
      revealBy: {
        label: 'Fitxes que revelen',
        desc: 'Quines fitxes de la capa de fitxes revelen hexagones: fitxes controlades per un jugador, fitxes que representen qualsevol personatge o cada fitxa.',
      },
      revealMode: {
        label: 'Mode de revelació',
        desc: "Clear elimina els hexàgons a la vista. En canvi, la vista els fa veure a través; s'eliminen quan hi entra una fitxa.",
      },
      announce: {
        label: 'Anunciar descobriments',
        desc: 'Qui veu el missatge de xat quan es descobreix una ubicació amb nom.',
      },
      pingDiscoveries: {
        label: 'Ping Descobriments',
        desc: 'Quan està activat, els jugadors reben un ping a una ubicació amb nom quan es descobreix.',
      },
    },
    status: {
      engine: 'Motor de joc',
      grid: 'Quadrícula',
      layer: 'Capa hexagonal',
      hexes: 'Hexes',
      named: 'Hexagones anomenats',
      icons: "Fitxes d'ubicació",
      glimpsed: 'Hexagones albirats',
      pending: "Ubicacions a l'espera d'omplir-se",
      calibrated: 'Calibrat',
      overrides: 'Anul·lació de la pàgina',
      undo: 'Desfer disponible',
    },
    messages: {
      filled:
        'Ompliment complet: {created} hexadecimals dibuixats, {restyled} redissenyats, {icons} ubicacions amagades.',
      revealed: '{count} hexadecimals revelats.',
      revealedPage: "S'han revelat tots els {count} hexadecificis de la pàgina.",
      confirmReset:
        'Vols suprimir tots els {count} hexadecimals de "{page}"? Les fitxes d\'ubicació tornen a la capa de fitxes. Desfer no pot revertir això.',
      resetPage: '{count} hexadecimals eliminats de la pàgina.',
      undone:
        'Últim farciment desfet: {removed} hexadecimals eliminats, {restored} hexadecimals restaurats.',
      named: '{count} hexadecimals anomenats "{name}".',
      unnamed: "S'ha esborrat el nom de {count} hexadecimals.",
      marked:
        "{attached} ubicacions amagades als hexàgons existents; {pending} s'amagarà pel següent farcit que els cobreixi.",
      unmarked: 'Les fitxes {count} ja no són ubicacions.',
      settingChanged: "{setting} s'ha establert en {value}.",
      rescanned:
        "S'ha completat la tornada de l'exploració: {kept} hexadecimals conservats, {adopted} adoptat, {moved} tornat a arxivar, {dropped} hexadecimals que falten oblidats, __HEX_PLACEHOLDER_4_etiquetes_4__ S'han tornat a enllaçar {icons} fitxes d'ubicació.",
      calibrated:
        'Quadrícula calibrada (pas de columna {colStep}px, pas de fila {rowStep}px). Torna a escanejar: {kept} conservat, {moved} tornat a arxivar, {adopted} adoptat.',
      calibrationReset:
        "S'ha eliminat el calibratge. Torna a escanejar: {kept} conservat, {moved} tornat a arxivar, {adopted} adoptat.",
      journalRebuilt: 'Els fullets "{help}" i "{deck}" s\'han reconstruït.',
      migrated:
        "Els vostres mapes hexadecimals d'Hexploration 1.x s'han actualitzat. Si aquest joc s'ha copiat d'un joc Legacy, executeu Reexplora a cada pàgina de mapa hexadecimal.",
      pruned:
        "Els {dropped} desats ja no existeixen i s'han oblidat. Si s'ha copiat aquest joc o pàgina, executeu Tornar a escanejar a la pàgina per recollir-ne els hexàgons.",
      readyHint:
        'Escriviu !hexploration per al menú o obriu el fullet "Hexploration - Conjunt d\'ordres".',
    },
    warnings: {
      foregroundUnavailable:
        'Aquest joc no admet dibuixar a la capa de primer pla, de manera que es van dibuixar hexagones a la capa de fitxes.',
      someFailed:
        "No s'han pogut dibuixar {count} hexadecimals. Consulteu la consola de l'API per obtenir més informació.",
    },
    errors: {
      noPage: "No s'ha pogut trobar la pàgina per treballar.",
      notHex: 'Aquesta pàgina no utilitza una graella hexadecimal.',
      noPolygons: 'Seleccioneu una o més formes dibuixades per omplir.',
      emptyArea: "L'àrea seleccionada no conté cap centre hexagonal.",
      tooMany: "Això crearia {count} hexadecimals, que són massa d'una vegada.",
      nothingToConceal: 'Seleccioneu formes dibuixades o fitxes per ocultar.',
      nothingToReveal: 'Seleccioneu hexagonals, formes dibuixades o fitxes per revelar.',
      noTokens: 'Seleccioneu primer un o més fitxes.',
      noHexes: 'Seleccioneu primer un o més hexagones (o fitxes situades en hexagones).',
      nothingToUndo: 'No hi ha cap emplenament per desfer.',
      unknownCommand: 'Ordre desconeguda: {command}',
      unknownSetting: 'Configuració desconeguda: {key}',
      unknownPageSetting: 'Configuració que es pot establir per pàgina: {keys}',
      invalidValue: '"{value}" no és un valor vàlid per a {key}.',
      calibrateNeedsTokens: 'Seleccioneu una o dues fitxes encaixades als centres hexagonals.',
      calibrateFailed: 'Aquestes fitxes no es poden utilitzar per calibrar.',
      unexpected: "S'ha produït un error: {message}",
    },
    hints: {
      noPage: 'Obriu la pàgina en què voleu treballar o seleccioneu-hi alguna cosa.',
      notHex:
        'Estableix la quadrícula de la pàgina a Hex (V) o Hex (H) a la configuració de la pàgina.',
      noPolygons:
        "Dibuixa un polígon, un rectangle, una el·lipse o una forma a mà alçada al voltant de l'àrea, selecciona'l i torna-ho a provar.",
      emptyArea:
        'Dibuixa una forma més gran o comprova la configuració de la quadrícula de la pàgina.',
      tooMany: "Omple una àrea més petita o divideix l'àrea en diverses formes.",
      noHexes:
        'Els hexagonals es troben en primer pla o capa de fitxes; canvieu a aquesta capa per seleccionar-los.',
      unknownCommand: 'Escriviu !hexploration help per llistar les ordres.',
      unknownSetting: 'Escriviu !hexploration set per veure tots els paràmetres.',
      calibrateNeedsTokens:
        "Col·loca una fitxa al centre d'un hexagonal i selecciona-la. Seleccioneu una segona fitxa enganxada a un hexadecimal veí a la mateixa fila (hexadecimal V) o columna (hexadecimal H) per corregir també la mida de l'hexadecimal.",
      calibrateFailed:
        "Dues fitxes han d'estar a la mateixa fila (hexadecimal V) o a la mateixa columna (hexadecimal H), almenys un hexadecimal de distància.",
      unexpected: "Els detalls es troben al registre de la consola de l'API.",
    },
    help: {
      menu: 'Mostra el menú.',
      fill: 'Cobriu les formes dibuixades seleccionades amb hexagonals.',
      fillInverse: 'Cobriu tota la pàgina excepte dins de les formes seleccionades.',
      undo: "Desfer l'últim farciment, farciment invers o ocultar i restaurar les formes que utilitzava.",
      reveal:
        'Revela els hexagones seleccionats i els hexagonals sota les formes i fitxes seleccionades.',
      revealPage: 'Revela cada hexadecimal de la pàgina sense anuncis.',
      conceal: "Torneu a cobrir l'àrea sota les formes i fitxes seleccionades amb hexagonals.",
      explore: "Revela les fitxes seleccionades com si acabessin de moure's allà.",
      resetPage: 'Traieu tots els hexadecimals de la pàgina (demana primer).',
      name: 'Anomena els hexagones seleccionats o els hexadegons que hi ha a sota de les fitxes seleccionades. Deixeu el nom buit per esborrar-lo.',
      mark: 'Converteix les fitxes seleccionades en llocs ocults.',
      unmark: 'Deixeu que les fitxes seleccionades siguin ubicacions ocultes.',
      set: 'Canvia un paràmetre o mostra tots els paràmetres.',
      pageSet: 'Substituïu una configuració de revelació només a la pàgina actual.',
      pageClear: 'Elimina les substitucions de la pàgina actual.',
      rescan:
        'Reconstrueix la llista hexadecimal de la pàgina, per exemple després de copiar una pàgina o un joc.',
      calibrate:
        'Alineeu la quadrícula hexagonal amb una o dues fitxes seleccionades enganxades als centres hexagonals.',
      calibrateReset: 'Elimineu el calibratge de la pàgina actual.',
      status: 'Mostra què sap Hexploration sobre la pàgina actual.',
      journal: "Reconstruïu els fulls d'ajuda i de comandaments.",
      help: 'Mostra aquesta llista.',
      handout: 'Les instruccions completes es troben al fullet "{name}".',
    },
    deck: {
      subtitle: 'Comandament de la plataforma',
      drawDesc:
        "Dibuixa formes al voltant d'una àrea, selecciona-les i omple. Desfer inverteix l'últim farcit.",
      revealDesc:
        "Seleccioneu hexagonals, formes o fitxes per revelar-los o tornar-los a cobrir. Explora revelacions al voltant de fitxes seleccionades com si s'haguessin mogut.",
      locationsDesc:
        'Seleccioneu fitxes per amagar-les com a ubicacions sota hexagones. Seleccioneu hexadecimals o fitxes per anomenar un hexadecimal.',
      toolsDesc:
        'Configuració, substitucions de pàgines, estat, reescaneig de pàgines copiades i calibratge de la quadrícula.',
      footer: 'Consulteu el fullet "{help}" per obtenir instruccions completes.',
    },
    handout: {
      versionLabel: 'Versió',
      subtitle: 'Exploració hexadecimal per hexadecimal per a Roll20',
      footer: 'Utilitzeu el fullet "{deck}" per als controls amb un sol clic.',
      overview: {
        heading: 'Visió general',
        body: "Hexploration cobreix un mapa hexagonal amb hexagonals opacs. A mesura que el grup es mou, els hexàgons pels quals travessen (i, si voleu, els hexagonals que els envolten) s'eliminen, de manera que el mapa es descobreix un hexàgono a la vegada. Les ubicacions ocultes es poden col·locar sota hexagones i s'anuncien quan es troben. Funciona en jocs Jumpgate i Legacy, en quadrícules Hex (V) i Hex (H) de qualsevol mida.",
        demo: 'Mira una petita demostració (de la versió 1)',
      },
      quickStart: {
        heading: 'Inici ràpid',
        steps: [
          'Obriu una pàgina la graella de la qual estigui configurada en Hex (V) o Hex (H).',
          "Dibuixa una o més formes (polígon, rectangle, el·lipse o mà alçada) al voltant de l'àrea per amagar.",
          "Seleccioneu les formes i feu clic a Emplenar el conjunt d'ordres (o escriviu !hexploration fill). Les formes es substitueixen per hexagonals.",
          "Opcional: abans d'omplir, seleccioneu fitxes per a llocs importants i feu clic a Marca la ubicació. S'amaguen sota els hexàgons i s'anuncien quan es descobreixen.",
          'Mou una fitxa de jugador. Es revelen tots els hexàgons que travessa i els hexàgons dins de la seva distància de visió.',
        ],
      },
      commands: {
        heading: 'Ordres',
        intro:
          'Només els GM poden utilitzar aquestes ordres. La majoria actuen sobre els objectes seleccionats; la resta actuen a la pàgina que esteu veient.',
        colCommand: 'Comandament',
        colDesc: 'Què fa',
      },
      revealing: {
        heading: 'Com funciona la revelació',
        points: [
          'Només les fitxes de la capa de fitxes revelen hexagones. El nombre de fitxes està establert per Fitxes que revelen: fitxes de jugador per defecte, de manera que el GM pot moure monstres sense descobrir el mapa.',
          "Una fitxa revela tots els hexàgons que cobreix (les fitxes grans en cobreixen diversos) i, amb Reveal Along Path activat, tots els hexàgons de la ruta per on s'ha arrossegat, inclosos els waypoints.",
          "La distància de visió revela els hexagones al voltant de cadascun d'aquests hexagones. Amb la línia de visió activada, un hexàgon només es revela si no hi ha cap hexagonal cobert entremig.",
          "Hex Reveal La distància s'emmagatzema en hexagonals a mesura que es dibuixen. Aquests hexagones només es revelen des de dins tants hexagones, per molt lluny que pugui veure una fitxa. Utilitzeu-lo per muntanyes o boscos que amaguen el que hi ha darrere.",
          "En el mode Visió visual, els hexàgons a la vista esdevenen transparents en lloc de desaparèixer, i s'eliminen quan hi entra una fitxa.",
          "L'API no informa dels moviments fets per altres modificacions. Els moviments de TokenMod es recullen automàticament; per a altres modificacions, seleccioneu les fitxes i feu clic a Explora, o truqueu a Hexploration.revealAround(token) des del vostre propi mod.",
        ],
      },
      locations: {
        heading: 'Hexes i ubicacions anomenades',
        points: [
          "Marca la ubicació converteix les fitxes seleccionades en ubicacions ocultes. Una fitxa que ja està sota un hexàgon s'amaga immediatament; en cas contrari queda amagat pel següent farciment que el cobreix.",
          "Els fitxes amb el marcador d'estat de la torre blanca també es tracten com a ubicacions quan ompliu, com a la versió 1.",
          "Les fitxes d'ubicació ocultes es mouen a la capa de GM. Quan es revela el seu hex, tornen a la capa de fitxes amb el seu nom mostrat i s'anuncia el seu descobriment.",
          "Name Hex dóna un nom a un hexadecimal sense cap testimoni. El nom es mostra al GM com una etiqueta a la capa de GM i s'anuncia quan es revela l'hex.",
          "Announce Discoveries tria si tothom, només el GM, o ningú veu l'anunci. Ping Discoveries també mou la vista dels jugadors a la ubicació.",
        ],
      },
      settings: {
        heading: 'Configuració',
        intro:
          "Canvieu la configuració amb !hexploration set (o el botó Configuració). La capa hexadecimal, els fitxes que revelen i l'idioma també es poden configurar a la pàgina de configuració del mod.",
        colKey: 'clau',
        colName: 'Configuració',
        colDesc: 'Descripció',
        perPage: '(Es pot configurar per pàgina.)',
      },
      jumpgate: {
        heading: 'Jumpgate i Legacy',
        points: [
          'Hexploration determina quin motor utilitza el joc i dibuixa el tipus de forma corresponent. Les formes dibuixades en qualsevol dels editors es poden omplir.',
          "Amb la capa hexadecimal establerta a Automàtic, els hexadecimals es dibuixen a la capa de primer pla, per sobre de les fitxes, de manera que els jugadors no poden veure què hi ha a sota. Si la capa de primer pla no està disponible, s'utilitza la capa de testimoni.",
          "Jumpgate dibuixa hexagones matemàticament regulars, que tenen una forma lleugerament diferent dels hexagones heretats. Si els hexadecimals no s'alineen amb la quadrícula d'una pàgina, col·loqueu un testimoni a un centre hexadecimal, seleccioneu-lo i feu clic a Calibrar. Seleccioneu dues fitxes en hexàgons veïns de la mateixa fila (hexadecimal V) o columna (hexadecimal H) per corregir també la mida de l'hexadecimal.",
          "Quan es copia una pàgina o un joc, els seus hexadecimals obtenen nous identificadors. Executeu Torna a escanejar a la pàgina per tornar-los a recollir, juntament amb les etiquetes de noms i fitxes d'ubicació.",
        ],
      },
      upgrading: {
        heading: 'Actualització de la versió 1',
        points: [
          'La versió 2 ja no necessita PathMath, MatrixMath, Vector Math o HTML Builder. Podeu eliminar-los tret que els utilitzi un altre mod.',
          "Els mapes hexadecimals, els noms, les fitxes d'ubicació i la configuració existents s'actualitzen automàticament al primer inici.",
          'Les ordres de la versió 1, inclosa la macro Hexploration_menu, encara funcionen.',
          'La versió 1 permetia que qualsevol fitxa que representés un personatge revelés hexagones. Estableix fitxes que revelen en fitxes de personatge per mantenir aquest comportament.',
        ],
        colV1: 'Comandament de la versió 1',
        colV2: 'Comandament de la versió 2',
      },
      troubleshooting: {
        heading: 'Resolució de problemes',
        points: [
          'No passa res quan un testimoni es mou: comproveu que el testimoni estigui a la capa de fitxes i coincideixi amb els fitxes que es revelen i que la pàgina tingui hexadecimals (estat! hexploration).',
          'Els hexagones es desplacen de la quadrícula: utilitzeu Calibrar i, a continuació, comproveu amb una fitxa en uns quants hexagones del mapa.',
          'Hexes va deixar de revelar-se després de copiar una pàgina o un joc: executeu Tornar a explorar la pàgina.',
          "El farciment diu que l'àrea no té centres hexagonals: la forma ha de contenir el centre d'almenys un hexagonal.",
          "Per a qualsevol altra cosa, comproveu el registre de la consola de l'API i incloeu-ne els missatges quan demaneu ajuda.",
        ],
      },
      languages: {
        heading: 'Idiomes',
        body: "Trieu un idioma amb l'idioma definit de !hexploration. Idiomes disponibles:",
      },
      credits: {
        heading: 'Crèdits',
        original: 'Mod original de',
        maintainer: 'Versió 2 mantinguda per',
        marketplace: "Els paquets d'art de l'Ada al mercat Roll20",
        support:
          "Si trobeu un error o teniu una idea, publiqueu-lo al fòrum Roll20 Mod o obriu un problema a GitHub i incloeu qualsevol missatge del registre de la consola de l'API.",
      },
    },
  };

  const TRANSLATION$2 = {
    titles: {
      ready: 'H探索已準備就緒。',
      settings: 'H探索設置',
      languages: '選擇語言',
      pageSettings: '頁面設定：{page}',
      status: 'H探索狀態：{page}',
      help: '探索命令',
      confirm: '請確認',
    },
    discovery: {
      title: '發現地點',
    },
    menu: {
      draw: '畫',
      reveal: '顯示和隱藏',
      locations: '地點',
      tools: '工具',
      layerInUse: '正在 {layer} 上繪製新的六角形。',
      pageSettingsHelp: '這些設定僅適用於該頁面。標記為★的設定將覆蓋全域設定。',
    },
    buttons: {
      fill: '充滿',
      fillInverse: '反向填充',
      undo: '撤銷填充',
      reveal: '揭示',
      conceal: '隱藏',
      explore: '探索',
      revealPage: '顯示頁面',
      resetPage: '重置頁面',
      mark: '標記位置',
      unmark: '取消標記',
      name: '名稱十六進位',
      settings: '設定',
      pageSettings: '頁面設定',
      status: '地位',
      rescan: '重新掃描',
      calibrate: '校準',
      calibrateReset: '重置校準',
      help: '幫助',
      change: '改變',
      menu: '選單',
      clearOverrides: '清除覆蓋',
      confirmReset: '是的，刪除所有六角形',
    },
    prompts: {
      name: '地點名稱（留空以清除）',
    },
    values: {
      on: '在',
      off: '離開',
      none: '沒有任何',
      hexLayer: {
        auto: '自動（前景，如果可用）',
        foreground: '前景層',
        objects: '令牌層',
      },
      revealBy: {
        players: '玩家代幣',
        characters: 'Character tokens',
        all: '所有代幣',
      },
      revealMode: {
        clear: '清除',
        glimpse: '一瞥',
      },
      announce: {
        all: '每個人',
        gm: '限通用汽車',
        off: '離開',
      },
      orientation: {
        vertical: '六角 (V)',
        horizontal: '六角 (H)',
      },
      fillKind: {
        fill: '充滿',
        fillInverse: '反向填充',
        conceal: '隱藏',
      },
    },
    settings: {
      language: {
        label: '語言',
        desc: '選單、訊息和講義的語言。',
      },
      hexLayer: {
        label: '六角層',
        desc: '繪製新六角形的地方。自動嘗試前景層（令牌上方），如果遊戲不支持，則回退到令牌層。',
      },
      fillColor: {
        label: '填充顏色',
        desc: '新六角形的顏色。使用 rgba() 來透視十六進位，例如 rgba(0,0,0,0.8)。',
      },
      strokeColor: {
        label: '邊框顏色',
        desc: '新六邊形輪廓的顏色。',
      },
      labelColor: {
        label: '標籤顏色',
        desc: '命名六角形上僅限 GM 的名稱標籤的顏色。',
      },
      glimpseColor: {
        label: '瞥見顏色',
        desc: '瞥見時，顏色六角形會變更為（瞥見顯示模式）。使用透明的 rgba() 顏色。',
      },
      strokeWidth: {
        label: '邊框寬度',
        desc: '新六邊形輪廓的寬度，以像素為單位（0 到 20）。',
      },
      maxDistance: {
        label: '十六進位顯示距離',
        desc: '應用於繪製的六角形：令牌必須位於這麼多六角形內才能顯示它們，無論它能看到多遠。留空則無限制。',
      },
      revealDistance: {
        label: '視距',
        desc: '顯示移動令牌周圍有多少個六角形（0 到 20）。 0 僅顯示令牌經過的六角形。',
      },
      lineOfSight: {
        label: '視線',
        desc: '啟用後，僅當六角形與令牌之間沒有被覆蓋的六角形時，該六角形才會顯示。',
      },
      revealPath: {
        label: '沿路徑顯示',
        desc: '啟用後，標記在拖曳時經過的每個六角形（包括路徑點）都會顯示出來，而不僅僅是其停止的位置。',
      },
      revealBy: {
        label: '揭示的代幣',
        desc: '令牌層上的哪些令牌顯示六角形：由玩家控制的令牌、代表任何角色的令牌或每個令牌。',
      },
      revealMode: {
        label: '揭示模式',
        desc: '清除可移除視線範圍內的六角形。瞥見反而讓他們看穿；當令牌進入它們時，它們就會被刪除。',
      },
      announce: {
        label: '宣布發現',
        desc: '當發現指定位置時誰會看到聊天訊息。',
      },
      pingDiscoveries: {
        label: '平發現',
        desc: '啟用後，當發現指定位置時，玩家會被 ping 到該位置。',
      },
    },
    status: {
      engine: '遊戲引擎',
      grid: '網格',
      layer: '六角層',
      hexes: '六角形',
      named: '命名六角形',
      icons: '位置標記',
      glimpsed: '瞥見的六角形',
      pending: '等待填補的地點',
      calibrated: '已校準',
      overrides: '頁面覆蓋',
      undo: '可以撤銷',
    },
    messages: {
      filled: '填入完成：繪製 {created} 六角形，重新設計 {restyled} 樣式，隱藏 {icons} 位置。',
      revealed: '{count} 十六進位顯示。',
      revealedPage: '顯示頁面上的所有 {count} 十六進位。',
      confirmReset:
        '從“{page}”中刪除所有 {count} 十六進位嗎？位置令牌返回令牌層。撤銷無法逆轉此情況。',
      resetPage: '從頁面中刪除了 {count} 十六進位。',
      undone: '上次填入撤銷：刪除了 {removed} 六角形，恢復了 {restored} 重新設計的六角形。',
      named: '{count} 名為「{name}」的十六進位。',
      unnamed: '從 {count} 十六進位清除名稱。',
      marked: '{attached} 隱藏在現有六角形中的位置； {pending} 將被覆蓋它們的下一個填充隱藏。',
      unmarked: '{count} 標記不再是位置。',
      settingChanged: '{setting} 設定為 {value}。',
      rescanned:
        '重新掃描完成：保留 {kept} 十六進制，採用 {adopted}，重新歸檔 {moved}，忘記 {dropped} 缺失的十六進位，重新連結 __HEX_PLACEHOLDER_4%__HOLDER 41_ACE__HOL _HEX_',
      calibrated:
        '網格校準（列步長 {colStep}px，行步長 {rowStep}px）。重新掃描：{kept} 保留，{moved} 重新歸檔，{adopted} 採用。',
      calibrationReset: '校準已刪除。重新掃描：{kept} 保留，{moved} 重新歸檔，{adopted} 採用。',
      journalRebuilt: 'The "{help}" and "{deck}" handouts have been rebuilt.',
      migrated:
        '您的 Heexploration 1.x 十六進位地圖已升級。如果此遊戲是從舊版遊戲複製的，請在每個十六進位地圖頁面上執行重新掃描。',
      pruned:
        '{dropped} 保存的十六進位不再存在並被遺忘。如果該遊戲或頁面被複製，請在該頁面上執行重新掃描以再次擷取其六角形。',
      readyHint: '在選單中輸入 !hexploration，或開啟「Hexploration - Command Deck」講義。',
    },
    warnings: {
      foregroundUnavailable: '遊戲不支援在前景圖層上繪製，因此在令牌層上繪製了六角形。',
      someFailed: '無法繪製 {count} 六角形。檢查 API 控制台以了解詳細資訊。',
    },
    errors: {
      noPage: '找不到要處理的頁面。',
      notHex: '此頁面不使用六角網格。',
      noPolygons: '選擇一個或多個要填滿的繪製形狀。',
      emptyArea: '所選區域不包含任何六角形中心。',
      tooMany: '這會建立 {count} 六角形，一次性就太多了。',
      nothingToConceal: '選擇要隱藏的繪製形狀或標記。',
      nothingToReveal: '選擇要顯示的六角形、繪製的形狀或標記。',
      noTokens: '首先選擇一個或多個令牌。',
      noHexes: '首先選擇一個或多個六角形（或站在六角形上的標記）。',
      nothingToUndo: '沒有可撤消的填充。',
      unknownCommand: '未知指令：{command}',
      unknownSetting: '未知設定：{key}',
      unknownPageSetting: '每頁可設定的設定：{keys}',
      invalidValue: '“{value}”對於 {key} 不是有效值。',
      calibrateNeedsTokens: '選擇一或兩個吸附到六角形中心的標記。',
      calibrateFailed: '這些令牌不能用於校準。',
      unexpected: '出了點問題：{message}',
    },
    hints: {
      noPage: '開啟您要處理的頁面，或選擇其中的某些內容。',
      notHex: '在頁面設定中將頁面網格設定為十六進位 (V) 或十六進位 (H)。',
      noPolygons: '圍繞該區域繪製多邊形、矩形、橢圓形或手繪形狀，選擇它，然後重試。',
      emptyArea: '繪製更大的形狀，或檢查頁面網格設定。',
      tooMany: '填滿較小的區域，或將該區域分割成多個形狀。',
      noHexes: '六角形位於前景或令牌層；切換到該層以選擇它們。',
      unknownCommand: '鍵入 !hexploration help 以列出指令。',
      unknownSetting: '輸入 !hexploration set 查看每個設定。',
      calibrateNeedsTokens:
        '將標記捕捉到六角形的中心並選擇它。選取捕捉到同一行 (Hex V) 或列 (Hex H) 中相鄰六角形的第二個標記，也可以修正六角形大小。',
      calibrateFailed: '兩個標記必須位於同一行 (Hex V) 或同一列 (Hex H)，相距至少 1 個十六進位。',
      unexpected: '詳細資訊位於 API 控制台日誌中。',
    },
    help: {
      menu: '顯示選單。',
      fill: '用六角形覆蓋選定的繪製形狀。',
      fillInverse: '覆蓋除所選形狀內部之外的整個頁面。',
      undo: 'Undo the last fill, inverse fill or conceal, and restore the shapes it used.',
      reveal: '顯示選定的六角形以及選定形狀和標記下的六角形。',
      revealPage: '顯示頁面上的每個十六進制，無需公告。',
      conceal: '再次用六角形覆蓋所選形狀和標記下方的區域。',
      explore: '顯示所選標記的周圍，就好像它們剛剛移動到那裡一樣。',
      resetPage: '刪除頁面上的每個十六進制（首先詢問）。',
      name: '命名選定的六角形或選定標記下的六角形。將名稱留空以將其清除。',
      mark: '將選取的標記變成隱藏位置。',
      unmark: '停止將選定的標記隱藏在位置。',
      set: '更改設定或顯示所有設定。',
      pageSet: '僅覆蓋目前頁面上的顯示設定。',
      pageClear: '刪除目前頁面的覆蓋。',
      rescan: '重建頁面的十六進位列表，例如複製頁面或遊戲後。',
      calibrate: '將六角形網格與對齊到六角形中心的一兩個選定標記對齊。',
      calibrateReset: '刪除目前頁面的校準。',
      status: '顯示 Hexploration 對目前頁面的了解。',
      journal: '重建幫助和命令平台講義。',
      help: '顯示此清單。',
      handout: '完整說明位於「{name}」講義。',
    },
    deck: {
      subtitle: '指揮台',
      drawDesc: '在某個區域周圍繪製形狀，選擇它們，然後填充。撤消會反轉最後一次填充。',
      revealDesc:
        '選擇六角形、形狀或標記以再次顯示或覆蓋它們。探索會顯示所選標記周圍的情況，就好像它們已移動一樣。',
      locationsDesc: '選擇標記以將其隱藏為六角形下的位置。選擇十六進位或標記來命名十六進位。',
      toolsDesc: '設定、頁面覆蓋、狀態、重新掃描複製的頁面和校準網格。',
      footer: '有關完整說明，請參閱“{help}”講義。',
    },
    handout: {
      versionLabel: '版本',
      subtitle: 'Roll20 的逐十六進位探索',
      footer: '使用“{deck}”講義進行一鍵式控制項。',
      overview: {
        heading: '概述',
        body: 'Heexploration 覆蓋了帶有不透明六角形的六角形地圖。當隊伍移動時，他們穿過的六角形（如果你願意的話，他們周圍的六角形）也會被移除，因此地圖一次會露出一個六角形。隱藏位置可以放置在六角形下，並在發現時宣布。它適用於 Jumpgate 和 Legacy 遊戲，適用於任何大小的 Hex (V) 和 Hex (H) 網格。',
        demo: '觀看簡短的演示（來自版本 1）',
      },
      quickStart: {
        heading: '快速入門',
        steps: [
          '開啟網格設定為十六進位 (V) 或十六進位 (H) 的頁面。',
          '在要隱藏的區域周圍繪製一個或多個形狀（多邊形、矩形、橢圓形或手繪）。',
          '選擇形狀並點選指令面板中的「填滿」（或鍵入 !hexploration fill）。形狀被六角形取代。',
          '可選：填寫前，選擇重要地點的標記，然後按一下「標記位置」。它們隱藏在六角形下並在被發現時宣布。',
          '移動玩家令牌。它穿過的每個六角形以及其視距內的六角形都會被顯示出來。',
        ],
      },
      commands: {
        heading: '命令',
        intro:
          '只有 GM 可以使用這些指令。大多數作用於選定的物件；其餘的將在您正在查看的頁面上進行操作。',
        colCommand: '命令',
        colDesc: '它的作用',
      },
      revealing: {
        heading: '揭示如何運作',
        points: [
          '只有令牌層上的令牌才會顯示六角形。預設情況下，哪些令牌計數由「顯示的令牌：玩家令牌」設置，因此 GM 可以在不揭開地圖的情況下移動怪物。',
          '標記會顯示它所覆蓋的每個六角形（大標記會覆蓋幾個），並且在啟用「沿路徑顯示」的情況下，會顯示它所拖曳的路線上的每個六角形，包括航路點。',
          '視距顯示每個六角形周圍的六角形。當視線打開時，只有當中間沒有被覆蓋的六角形時才會顯示六角形。',
          '六角形顯示距離在繪製時儲存在六角形上。無論令牌能看到多遠，這些六角形都只能從那麼多六角形內顯露出來。將其用於隱藏其後面的山脈或森林。',
          '在「一瞥」模式中，視線內的六角形會變得透明而不是消失，當令牌進入其中時會被移除。',
          'API 不會報告其他模組所做的動作。 TokenMod 動作會自動拾取；對於其他 mod，請選擇令牌並點擊“探索”，或從您自己的 mod 中呼叫 Heexploration.revealAround(token)。',
        ],
      },
      locations: {
        heading: '命名六角形和位置',
        points: [
          '標記位置將選定的標記轉變為隱藏位置。已經在六角形下的標記會立即隱藏；否則它會被覆蓋它的下一個填充隱藏。',
          '與版本 1 一樣，帶有白塔狀態標記的標記在您填充時也被視為位置。',
          '隱藏位置標記被移至 GM 層。當他們的十六進制被揭露時，他們返回到令牌層並顯示他們的名字，並宣布他們的發現。',
          'Name Hex 為十六進位提供一個沒有標記的名稱。該名稱作為 GM 層上的標籤顯示給 GM，並在十六進位顯示時宣布。',
          '宣布發現選擇是所有人、僅總經理還是無人看到該公告。 Ping Discoveries 也將玩家的視野移動到該位置。',
        ],
      },
      settings: {
        heading: '設定',
        intro:
          '使用 !hexploration set（或「設定」按鈕）變更設定。十六進位圖層、顯示的令牌和語言也可以在 Mod 的設定頁面上設定。',
        colKey: '鑰匙',
        colName: '環境',
        colDesc: '描述',
        perPage: '（可按頁設定。）',
      },
      jumpgate: {
        heading: '跳躍門和遺產',
        points: [
          'Hexploration 計算出遊戲使用的引擎並繪製相符的形狀。可以填滿在任一編輯器中繪製的形狀。',
          '將「六角形圖層」設定為「自動」時，六角形會繪製在令牌上方的前景圖層上，因此玩家無法看到下面的內容。如果前景層不可用，則使用令牌層。',
          'Jumpgate 繪製數學上規則的六角形，其形狀與舊版六角形略有不同。如果六角形未與頁面網格對齊，請將標記捕捉到六角形中心，選擇它並按一下校準。選擇同一行（十六進位 V）或同一列（十六進位 H）的相鄰六角形中的兩個標記也可以更正六角形大小。',
          '當頁面或遊戲被複製時，其六角形會獲得新的 ID。在頁面上執行重新掃描以再次拾取它們以及它們的名稱標籤和位置標記。',
        ],
      },
      upgrading: {
        heading: '從版本 1 升級',
        points: [
          '版本 2 不再需要 PathMath、MatrixMath、Vector Math 或 HTML Builder。您可以刪除它們，除非另一個模組使用它們。',
          '現有的十六進位地圖、名稱、位置標記和設定會在首次啟動時自動升級。',
          '版本 1 指令（包括 Heexploration_menu 巨集）仍然有效。',
          '版本 1 讓任何代表字元的標記都顯示十六進位。將「顯示的令牌」設為「角色令牌」以保留該行為。',
        ],
        colV1: '版本 1 指令',
        colV2: '版本 2 指令',
      },
      troubleshooting: {
        heading: '故障排除',
        points: [
          '令牌移動時不會發生任何事情：檢查令牌是否位於令牌層上並與「顯示的令牌」匹配，頁面是否有六角形（！h探索狀態）。',
          '六角形偏離網格：使用校準，然後用地圖上幾個六角形上的標記進行檢查。',
          '複製頁面或遊戲後，十六進位停止顯示：在頁面上執行重新掃描。',
          'Fill says the area has no hex centres: the shape must contain the centre of at least one hex.',
          'For anything else, check the API console log and include its messages when asking for help.',
        ],
      },
      languages: {
        heading: '語言',
        body: '透過 !hexploration 設定語言來選擇語言。可用語言：',
      },
      credits: {
        heading: '製作人員',
        original: '原始模組由',
        maintainer: '版本 2 維護者',
        marketplace: 'Roll20 Marketplace 上的 Ada 藝術包',
        support:
          '如果您發現錯誤或有想法，請在 Roll20 Mod 論壇中發佈或在 GitHub 上提出問題，並包含 API 控制台日誌中的任何訊息。',
      },
    },
  };

  const TRANSLATION$1 = {
    titles: {
      ready: 'Heexploration je připraven.',
      settings: 'Nastavení Heexploration',
      languages: 'Vyberte jazyk',
      pageSettings: 'Nastavení stránky: {page}',
      status: 'Stav průzkumu: {page}',
      help: 'Příkazy pro průzkum',
      confirm: 'Prosím potvrďte',
    },
    discovery: {
      title: 'Místo objeveno',
    },
    menu: {
      draw: 'Remíza',
      reveal: 'Odhalit a skrýt',
      locations: 'Místa',
      tools: 'Nástroje',
      layerInUse: 'Na {layer} se kreslí nové hexy.',
      pageSettingsHelp:
        'Tato nastavení platí pouze pro tuto stránku. Nastavení označená ★ přepíší globální nastavení.',
    },
    buttons: {
      fill: 'Vyplnit',
      fillInverse: 'Inverzní výplň',
      undo: 'Vrátit zpět výplň',
      reveal: 'Odhalit',
      conceal: 'Skrývat',
      explore: 'Prozkoumat',
      revealPage: 'Odhalit stránku',
      resetPage: 'Obnovit stránku',
      mark: 'Označte umístění',
      unmark: 'Zrušit označení',
      name: 'Jméno Hex',
      settings: 'Nastavení',
      pageSettings: 'Nastavení stránky',
      status: 'Postavení',
      rescan: 'Znovu naskenujte',
      calibrate: 'Kalibrovat',
      calibrateReset: 'Resetovat kalibraci',
      help: 'Pomoc',
      change: 'Přeměna',
      menu: 'Menu',
      clearOverrides: 'Vymazat přepisy',
      confirmReset: 'Ano, Odebrat všechny hexy',
    },
    prompts: {
      name: 'Název místa (pro vymazání ponechte prázdné)',
    },
    values: {
      on: 'Na',
      off: 'Vypnuto',
      none: 'Žádný',
      hexLayer: {
        auto: 'Auto (popředí, pokud je k dispozici)',
        foreground: 'vrstva popředí',
        objects: 'vrstva tokenů',
      },
      revealBy: {
        players: 'Hráčské žetony',
        characters: 'Žetony postav',
        all: 'Všechny tokeny',
      },
      revealMode: {
        clear: 'Jasný',
        glimpse: 'Záblesk',
      },
      announce: {
        all: 'Každý',
        gm: 'Pouze GM',
        off: 'Vypnuto',
      },
      orientation: {
        vertical: 'Hexadecimální (V)',
        horizontal: 'Hexadecimální (H)',
      },
      fillKind: {
        fill: 'Vyplnit',
        fillInverse: 'Inverzní výplň',
        conceal: 'Skrývat',
      },
    },
    settings: {
      language: {
        label: 'Jazyk',
        desc: 'Jazyk pro nabídky, zprávy a letáky.',
      },
      hexLayer: {
        label: 'Hexadecimální vrstva',
        desc: 'Kde se kreslí nové hexy. Auto zkouší vrstvu popředí (nad žetony) a pokud ji hra nepodporuje, přejde zpět na vrstvu žetonů.',
      },
      fillColor: {
        label: 'Barva výplně',
        desc: 'Barva nových hexů. Použijte rgba() pro průhledné hexy, například rgba(0,0,0,0,8).',
      },
      strokeColor: {
        label: 'Barva ohraničení',
        desc: 'Barva obrysu nových hexů.',
      },
      labelColor: {
        label: 'Barva štítku',
        desc: 'Barva jmenovek pouze GM na pojmenovaných hexech.',
      },
      glimpseColor: {
        label: 'Barva záblesku',
        desc: 'Barevné hexy se při zahlédnutí změní na (režim Odhalení letmým pohledem). Použijte průhlednou barvu rgba().',
      },
      strokeWidth: {
        label: 'Šířka okraje',
        desc: 'Šířka obrysu nových hexů v pixelech (0 až 20).',
      },
      maxDistance: {
        label: 'Hexadecimální vzdálenost odhalení',
        desc: 'Aplikuje se na hexy, když jsou taženy: žeton musí být v tomto počtu hexů, aby je odhalil, ať už vidí jakkoli daleko. Nechte prázdné bez omezení.',
      },
      revealDistance: {
        label: 'Pohledová vzdálenost',
        desc: 'Kolik hexů kolem pohybujícího se žetonu je odhaleno (0 až 20). 0 odhaluje pouze hexy, kterými žeton prochází.',
      },
      lineOfSight: {
        label: 'Zornost',
        desc: 'Když je zapnuto, hex je odhalen pouze v případě, že mezi ním a žetonem není žádný krytý hex.',
      },
      revealPath: {
        label: 'Odhalení Po cestě',
        desc: 'Když je zapnuto, je odhalen každý hex, kterým žeton při tažení projde (včetně trasových bodů), nejen tam, kde se zastaví.',
      },
      revealBy: {
        label: 'Tokeny, které odhalují',
        desc: 'Které žetony na vrstvě žetonů odhalují hexy: žetony ovládané hráčem, žetony, které představují jakoukoli postavu, nebo každý žeton.',
      },
      revealMode: {
        label: 'Režim odhalení',
        desc: 'Clear odstraní hexy na dohled. Letmý pohled je místo toho dělá průhlednými; jsou odstraněny, když do nich vstoupí token.',
      },
      announce: {
        label: 'Oznamte objevy',
        desc: 'Kdo uvidí chatovou zprávu, když je objeveno pojmenované místo.',
      },
      pingDiscoveries: {
        label: 'Ping Discovery',
        desc: 'Když je zapnuto, hráči jsou pingnuti na pojmenované místo, když je objeveno.',
      },
    },
    status: {
      engine: 'Herní engine',
      grid: 'Mřížka',
      layer: 'Hexadecimální vrstva',
      hexes: 'Hexy',
      named: 'Pojmenované hexy',
      icons: 'Tokeny polohy',
      glimpsed: 'Zahlédnuté hexy',
      pending: 'Místa čekající na zaplnění',
      calibrated: 'Zkalibrováno',
      overrides: 'Přepíše stránku',
      undo: 'Zpět k dispozici',
    },
    messages: {
      filled:
        'Vyplnění dokončeno: {created} nakreslených hexů, {restyled} změněných, {icons} míst skrytých.',
      revealed: '{count} odhalených hexů.',
      revealedPage: 'Všechny {count} hexy na stránce odhaleny.',
      confirmReset:
        'Odebrat všechny {count} hexy z „{page}“? Tokeny umístění se vrátí do vrstvy tokenů. Zpět to nelze vrátit.',
      resetPage: '{count} hexy odstraněny ze stránky.',
      undone:
        'Poslední vyplnění bylo zrušeno: {removed} hexy odstraněny, {restored} obnovené hexy s novým stylem.',
      named: '{count} hexy s názvem „{name}“.',
      unnamed: 'Název byl vymazán z {count} hexů.',
      marked:
        '{attached} umístění skrytá na stávajících hexech; {pending} budou skryty další výplní, která je zakryje.',
      unmarked: '{count} tokeny již nejsou umístění.',
      settingChanged: '{setting} nastaveno na {value}.',
      rescanned:
        'Opětovné skenování dokončeno: {kept} hexy ponechány, {adopted} přijato, {moved} znovu zaregistrováno, {dropped} chybějící hexy zapomenuty, __HEX_PLACEHOLDER__5_4_ umístěníHEX_4_ umístění tokeny znovu propojeny.',
      calibrated:
        'Mřížka zkalibrována (krok sloupce {colStep}px, krok řádku {rowStep}px). Znovu naskenovat: {kept} ponecháno, {moved} znovu zaevidováno, {adopted} přijato.',
      calibrationReset:
        'Kalibrace odstraněna. Znovu naskenovat: {kept} ponecháno, {moved} znovu zaevidováno, {adopted} přijato.',
      journalRebuilt: 'Materiály „{help}“ a „{deck}“ byly přepracovány.',
      migrated:
        'Vaše hex mapy Heexploration 1.x byly upgradovány. Pokud byla tato hra zkopírována ze starší hry, spusťte znovu skenování na každé stránce hexové mapy.',
      pruned:
        '{dropped} uložená hexy již neexistují a byla zapomenuta. Pokud byla tato hra nebo stránka zkopírována, spusťte Rescan na stránce a znovu seberte její hexy.',
      readyHint:
        'Zadejte !hexploration pro nabídku nebo otevřete leták „Hexploration – Command Deck“.',
    },
    warnings: {
      foregroundUnavailable:
        'Tato hra nepodporuje kreslení na vrstvě popředí, takže hexy byly nakresleny na vrstvu žetonů.',
      someFailed: '{count} hexy nelze nakreslit. Podrobnosti naleznete v konzole API.',
    },
    errors: {
      noPage: 'Nelze najít stránku, na které by se dalo pracovat.',
      notHex: 'Tato stránka nepoužívá hexadecimální mřížku.',
      noPolygons: 'Vyberte jeden nebo více nakreslených tvarů, které chcete vyplnit.',
      emptyArea: 'Vybraná oblast neobsahuje žádné středy šestihran.',
      tooMany: 'To by vytvořilo {count} hexů, což je příliš mnoho najednou.',
      nothingToConceal: 'Vyberte nakreslené tvary nebo žetony, které chcete skrýt.',
      nothingToReveal: 'Vyberte hexy, nakreslené tvary nebo žetony, které chcete odhalit.',
      noTokens: 'Nejprve vyberte jeden nebo více žetonů.',
      noHexes: 'Nejprve vyberte jeden nebo více hexů (nebo žetonů stojících na hexech).',
      nothingToUndo: 'Neexistuje žádná výplň, kterou lze vrátit zpět.',
      unknownCommand: 'Neznámý příkaz: {command}',
      unknownSetting: 'Neznámé nastavení: {key}',
      unknownPageSetting: 'Nastavení, která lze nastavit na stránce: {keys}',
      invalidValue: '„{value}“ není platná hodnota pro {key}.',
      calibrateNeedsTokens: 'Vyberte jeden nebo dva žetony přichycené na středy hexů.',
      calibrateFailed: 'Tyto tokeny nelze použít ke kalibraci.',
      unexpected: 'Něco se pokazilo: {message}',
    },
    hints: {
      noPage: 'Otevřete stránku, na které chcete pracovat, nebo na ní něco vyberte.',
      notHex: 'Nastavte mřížku stránky na Hex (V) nebo Hex (H) v Nastavení stránky.',
      noPolygons:
        'Nakreslete kolem oblasti mnohoúhelník, obdélník, elipsu nebo tvar od ruky, vyberte jej a zkuste to znovu.',
      emptyArea: 'Nakreslete větší tvar nebo zkontrolujte nastavení mřížky stránky.',
      tooMany: 'Vyplňte menší oblast nebo oblast rozdělte do několika tvarů.',
      noHexes: 'Hexy jsou na popředí nebo vrstvě tokenů; přepněte na tuto vrstvu a vyberte je.',
      unknownCommand: 'Chcete-li zobrazit seznam příkazů, zadejte !hexploration help.',
      unknownSetting: 'Chcete-li zobrazit všechna nastavení, zadejte !hexploration set.',
      calibrateNeedsTokens:
        'Přichyťte žeton do středu hexu a vyberte jej. Vyberte druhý žeton přichycený na sousední hex ve stejném řádku (Hex V) nebo sloupci (Hex H), abyste také opravili velikost hexu.',
      calibrateFailed:
        'Dva žetony musí být ve stejném řádku (Hex V) nebo stejném sloupci (Hex H), alespoň jeden hex od sebe.',
      unexpected: 'Podrobnosti jsou v protokolu konzoly API.',
    },
    help: {
      menu: 'Ukaž menu.',
      fill: 'Zakryjte vybrané nakreslené tvary hexy.',
      fillInverse: 'Zakryjte celou stránku kromě vybraných tvarů.',
      undo: 'Zrušte poslední výplň, inverzní výplň nebo skrytí a obnovte tvary, které použila.',
      reveal: 'Odhalte vybrané hexy a hexy pod vybranými tvary a žetony.',
      revealPage: 'Odhalte každé hex na stránce bez oznámení.',
      conceal: 'Znovu zakryjte oblast pod vybranými tvary a žetony hexy.',
      explore: 'Odhalte kolem vybraných žetonů, jako by se tam právě přesunuly.',
      resetPage: 'Odstraňte každý hex na stránce (nejprve se ptá).',
      name: 'Pojmenujte vybrané hexy nebo hexy pod vybranými žetony. Chcete-li jej vymazat, ponechte název prázdný.',
      mark: 'Proměňte vybrané žetony na skrytá místa.',
      unmark: 'Zabraňte tomu, aby se vybrané tokeny staly skrytými místy.',
      set: 'Změňte nastavení nebo zobrazte všechna nastavení.',
      pageSet: 'Přepsat nastavení odkrytí pouze na aktuální stránce.',
      pageClear: 'Odstraňte přepsání aktuální stránky.',
      rescan: 'Znovu vytvořte seznam hex na stránce, například po zkopírování stránky nebo hry.',
      calibrate:
        'Zarovnejte hexovou mřížku jedním nebo dvěma vybranými žetony přichycenými do středů hexů.',
      calibrateReset: 'Odstraňte kalibraci aktuální stránky.',
      status: 'Ukažte, co Heexploration ví o aktuální stránce.',
      journal: 'Znovu sestavte podklady pro balíček nápovědy a příkazů.',
      help: 'Zobrazit tento seznam.',
      handout: 'Úplné pokyny jsou v letáku „{name}“.',
    },
    deck: {
      subtitle: 'Velitelský balíček',
      drawDesc:
        'Nakreslete tvary kolem oblasti, vyberte je a poté vyplňte. Zpět vrátí poslední výplň zpět.',
      revealDesc:
        'Vyberte hexy, tvary nebo žetony, abyste je znovu odhalili nebo zakryli. Prozkoumejte odhalení kolem vybraných žetonů, jako by se pohnuly.',
      locationsDesc:
        'Vyberte žetony a skryjte je jako místa pod hexy. Vyberte hexy nebo žetony a pojmenujte hex.',
      toolsDesc:
        'Nastavení, přepsání stránek, stav, opětovné skenování zkopírovaných stránek a kalibrace mřížky.',
      footer: 'Úplné pokyny naleznete v letáku „{help}“.',
    },
    handout: {
      versionLabel: 'Verze',
      subtitle: 'Průzkum hex po hexu pro Roll20',
      footer: 'Pro ovládání jedním kliknutím použijte leták „{deck}“.',
      overview: {
        heading: 'Přehled',
        body: 'Hexploration pokrývá hexovou mapu s neprůhlednými hexy. Jak se skupina pohybuje, hexy, kterými prochází (a chcete-li, hexy kolem nich), jsou odstraněny, takže mapa je odkrývána jeden hex po druhém. Skrytá místa mohou být umístěna pod hexy a jsou oznámena, když jsou nalezena. Funguje ve hrách Jumpgate a Legacy, na mřížkách Hex (V) a Hex (H) jakékoli velikosti.',
        demo: 'Podívejte se na krátkou ukázku (od verze 1)',
      },
      quickStart: {
        heading: 'Rychlý start',
        steps: [
          'Otevřete stránku, jejíž mřížka je nastavena na Hex (V) nebo Hex (H).',
          'Nakreslete jeden nebo více tvarů (mnohoúhelník, obdélník, elipsa nebo od ruky) kolem oblasti, kterou chcete skrýt.',
          'Vyberte tvary a klikněte na Vyplnit v balíčku příkazů (nebo zadejte !hexploration fill). Tvary jsou nahrazeny hexy.',
          'Volitelné: před vyplněním vyberte žetony pro důležitá místa a klikněte na Označit místo. Jsou ukryty pod hexy a oznámeny, když jsou objeveny.',
          'Přesuňte žeton hráče. Každý hex, kterým projde, a hexy v jeho Viditelné vzdálenosti jsou odhaleny.',
        ],
      },
      commands: {
        heading: 'Příkazy',
        intro:
          'Tyto příkazy mohou používat pouze GM. Většina působí na vybrané objekty; zbytek působí na stránce, kterou si prohlížíte.',
        colCommand: 'Příkaz',
        colDesc: 'Co to dělá',
      },
      revealing: {
        heading: 'Jak funguje odhalování',
        points: [
          'Pouze žetony na vrstvě žetonů odhalují hexy. Počet žetonů je nastaven pomocí žetonů, které se odhalují: žetony hráčů ve výchozím nastavení, takže GM může pohybovat příšerami, aniž by odkrýval mapu.',
          'Žeton odhaluje každý hex, který zakrývá (velké žetony jich pokrývají několik), a se zapnutou funkcí Odhalení podél cesty každý hex na trase, po které byl tažen, včetně navigačních bodů.',
          'Viditelná vzdálenost odhaluje hexy kolem každého z těchto hexů. Se zapnutou linií viditelnosti je hex odhalen pouze v případě, že mezi nimi není žádný krytý hex.',
          'Hexová vzdálenost odhalení je uložena na hexech tak, jak jsou kresleny. Tyto hexy jsou odhaleny pouze z tolika hexů, jakkoli daleko žeton vidí. Použijte jej na hory nebo lesy, které skrývají to, co je za nimi.',
          'V režimu Glimpse se hexy v dohledu stanou průhlednými, místo aby zmizely, a jsou odstraněny, když do nich vstoupí žeton.',
          'API nehlásí pohyby provedené jinými mody. Pohyby TokenMod se sbírají automaticky; pro další mody vyberte tokeny a klikněte na Prozkoumat, nebo zavolejte Heexploration.revealAround(token) ze svého vlastního modu.',
        ],
      },
      locations: {
        heading: 'Pojmenované hexy a umístění',
        points: [
          'Označit místo změní vybrané žetony na skrytá místa. Žeton, který je již pod hexem, je okamžitě skryt; jinak je skryta další výplní, která jej zakrývá.',
          'Žetony se značkou stavu bílé věže jsou při vyplňování také považovány za místa, jako ve verzi 1.',
          'Žetony skrytých umístění se přesunou do vrstvy GM. Když je jejich hex odhalen, vrátí se do vrstvy žetonů se zobrazeným jménem a jejich objev je oznámen.',
          'Name Hex dává hexu jméno bez žetonu. Jméno je ukázáno GM jako štítek na GM vrstvě a oznámeno, když je odhalen hex.',
          'Announce Discoveries volí, zda oznámení uvidí všichni, pouze GM nebo nikdo. Ping Discoveries také přesune pohled hráčů na místo.',
        ],
      },
      settings: {
        heading: 'Nastavení',
        intro:
          'Změňte nastavení pomocí sady !hexploration (nebo tlačítka Nastavení). Hexadecimální vrstvu, tokeny, které odhalují a jazyk lze také nastavit na stránce nastavení modu.',
        colKey: 'Klíč',
        colName: 'Nastavení',
        colDesc: 'Popis',
        perPage: '(Lze nastavit na stránku.)',
      },
      jumpgate: {
        heading: 'Jumpgate a Legacy',
        points: [
          'Heexploration zjistí, který engine hra používá, a nakreslí odpovídající druh tvaru. Tvary nakreslené v obou editorech lze vyplnit.',
          'Při nastavení Hex Layer na Auto se hexy kreslí na vrstvu popředí nad žetony, takže hráči nevidí, co je pod nimi. Pokud vrstva popředí není k dispozici, použije se místo ní vrstva tokenu.',
          'Jumpgate kreslí matematicky pravidelné hexy, které mají trochu jiný tvar než hexy Legacy. Pokud hexy nejsou zarovnány s mřížkou stránky, přichyťte token ke středu hexu, vyberte jej a klikněte na Kalibrovat. Vyberte dva žetony na sousedních hexech stejného řádku (Hex V) nebo sloupce (Hex H), abyste také opravili velikost hexu.',
          'Když je stránka nebo hra zkopírována, její hexy získají nová ID. Spusťte Rescan na stránce a vyzvedněte je znovu spolu s jejich jmenovkami a žetony umístění.',
        ],
      },
      upgrading: {
        heading: 'Upgrade z verze 1',
        points: [
          'Verze 2 již nepotřebuje PathMath, MatrixMath, Vector Math nebo HTML Builder. Můžete je odstranit, pokud je nepoužívá jiný mod.',
          'Stávající hexadecimální mapy, názvy, tokeny umístění a nastavení se automaticky upgradují při prvním spuštění.',
          'Příkazy verze 1, včetně makra Heexploration_menu, stále fungují.',
          'Verze 1 umožnila jakémukoli žetonu, který představoval postavu, odhalit hexy. Chcete-li zachovat toto chování, nastavte žetony, které se odhalují, na žetony postav.',
        ],
        colV1: 'Příkaz verze 1',
        colV2: 'Příkaz verze 2',
      },
      troubleshooting: {
        heading: 'Odstraňování problémů',
        points: [
          'Když se žeton pohne, nic se nestane: zkontrolujte, zda je žeton na vrstvě žetonů a odpovídá žetonům, které odhalují, a že stránka má hexy (stav !hexploration).',
          'Hexy jsou odsazeny od mřížky: použijte Kalibrovat a poté zkontrolujte pomocí žetonu několik hexů po mapě.',
          'Po zkopírování stránky nebo hry se hexy přestaly odhalovat: spusťte znovu skenování stránky.',
          'Fill říká, že oblast nemá žádné středy hexu: tvar musí obsahovat střed alespoň jednoho hexu.',
          'Pro cokoli jiného zkontrolujte protokol konzoly API a při žádosti o pomoc zahrňte jeho zprávy.',
        ],
      },
      languages: {
        heading: 'Jazyky',
        body: 'Vyberte jazyk pomocí nastavení jazyka !hexploration. Dostupné jazyky:',
      },
      credits: {
        heading: 'Kredity',
        original: 'Původní mod od',
        maintainer: 'Verze 2 spravovaná společností',
        marketplace: 'Adiny umělecké balíčky na Roll20 Marketplace',
        support:
          'Pokud najdete chybu nebo máte nápad, zveřejněte příspěvek na fóru Roll20 Mod nebo otevřete problém na GitHubu a zahrňte všechny zprávy z protokolu konzoly API.',
      },
    },
  };

  const TRANSLATION = {
    titles: {
      ready: 'Hexploration er klar.',
      settings: 'Indstillinger for Hexploration',
      languages: 'Vælg et sprog',
      pageSettings: 'Sideindstillinger: {page}',
      status: 'Hexploration Status: {page}',
      help: 'Hexploration kommandoer',
      confirm: 'Bekræft venligst',
    },
    discovery: {
      title: 'Sted opdaget',
    },
    menu: {
      draw: 'Tegne',
      reveal: 'Afsløre og skjul',
      locations: 'Steder',
      tools: 'Værktøjer',
      layerInUse: 'Nye sekskanter bliver tegnet på {layer}.',
      pageSettingsHelp:
        'Disse indstillinger gælder kun for denne side. Indstillinger markeret ★ tilsidesætter de globale indstillinger.',
    },
    buttons: {
      fill: 'Fylde',
      fillInverse: 'Omvendt fyld',
      undo: 'Fortryd Fyld',
      reveal: 'Afsløre',
      conceal: 'Skjule',
      explore: 'Udforske',
      revealPage: 'Afsløre side',
      resetPage: 'Nulstil side',
      mark: 'Marker placering',
      unmark: 'Fjern markering',
      name: 'Navn Hex',
      settings: 'Indstillinger',
      pageSettings: 'Sideindstillinger',
      status: 'Status',
      rescan: 'Scan igen',
      calibrate: 'Kalibrer',
      calibrateReset: 'Nulstil kalibrering',
      help: 'Hjælp',
      change: 'Forandring',
      menu: 'Menu',
      clearOverrides: 'Ryd tilsidesættelser',
      confirmReset: 'Ja, Fjern alle Hexes',
    },
    prompts: {
      name: 'Placeringsnavn (lad tom for at rydde)',
    },
    values: {
      on: 'På',
      off: 'Slukket',
      none: 'Ingen',
      hexLayer: {
        auto: 'Auto (forgrund, hvis tilgængelig)',
        foreground: 'forgrundslaget',
        objects: 'symbollag',
      },
      revealBy: {
        players: 'Spillerpoletter',
        characters: 'Karakter tokens',
        all: 'Alle tokens',
      },
      revealMode: {
        clear: 'Klar',
        glimpse: 'Glimt',
      },
      announce: {
        all: 'Alle sammen',
        gm: 'Kun GM',
        off: 'Slukket',
      },
      orientation: {
        vertical: 'Hex (V)',
        horizontal: 'Hex (H)',
      },
      fillKind: {
        fill: 'Fylde',
        fillInverse: 'Omvendt fyld',
        conceal: 'Skjule',
      },
    },
    settings: {
      language: {
        label: 'Sprog',
        desc: 'Sprog til menuer, beskeder og uddelingskopier.',
      },
      hexLayer: {
        label: 'Hex lag',
        desc: 'Hvor nye sekskanter tegnes. Auto prøver forgrundslaget (over tokens) og falder tilbage til tokenlaget, hvis spillet ikke understøtter det.',
      },
      fillColor: {
        label: 'Fyld farve',
        desc: 'Farve på nye sekskanter. Brug rgba() til gennemsigtige hexes, for eksempel rgba(0,0,0,0.8).',
      },
      strokeColor: {
        label: 'Kantfarve',
        desc: 'Farve på omridset af nye sekskanter.',
      },
      labelColor: {
        label: 'Etiket farve',
        desc: 'Farven på GM-only navneetiketter på navngivne sekskanter.',
      },
      glimpseColor: {
        label: 'Glimt farve',
        desc: 'Farvehexer ændres til, når de skimtes (Glimpse-afsløringstilstand). Brug en gennemsigtig rgba()-farve.',
      },
      strokeWidth: {
        label: 'Border Bredde',
        desc: 'Bredden af ​​omridset af nye sekskanter, i pixels (0 til 20).',
      },
      maxDistance: {
        label: 'Hex Reveal Distance',
        desc: 'Anvendes på hexes, efterhånden som de tegnes: Et symbol skal være inden for så mange hexes for at afsløre dem, uanset hvor langt det kan se. Lad være tomt uden grænse.',
      },
      revealDistance: {
        label: 'Synsafstand',
        desc: 'Hvor mange sekskanter omkring et bevægeligt token afsløres (0 til 20). 0 afslører kun de sekskanter, som tokenet passerer igennem.',
      },
      lineOfSight: {
        label: 'Synslinie',
        desc: 'Når den er aktiveret, afsløres en hex kun, hvis der ikke er nogen dækket hex mellem den og tokenet.',
      },
      revealPath: {
        label: 'Afsløre langs stien',
        desc: 'Når den er tændt, afsløres hver hex, et token passerer igennem, mens det trækkes (inklusive waypoints), ikke kun hvor det stopper.',
      },
      revealBy: {
        label: 'Tokens, der afslører',
        desc: 'Hvilke tokens på tokenlaget afslører hexes: tokens kontrolleret af en spiller, tokens, der repræsenterer en hvilken som helst karakter, eller hver token.',
      },
      revealMode: {
        label: 'Reveal Mode',
        desc: 'Clear fjerner sekskanter inden for syne. Glimt gør dem gennemsigtige i stedet; de fjernes, når et token kommer ind i dem.',
      },
      announce: {
        label: 'Annoncer opdagelser',
        desc: 'Hvem ser chatbeskeden, når en navngivet placering opdages.',
      },
      pingDiscoveries: {
        label: 'Ping opdagelser',
        desc: 'Når den er aktiveret, bliver spillere pinget til en navngiven placering, når den opdages.',
      },
    },
    status: {
      engine: 'Spil motor',
      grid: 'Gitter',
      layer: 'Hex lag',
      hexes: 'Hekser',
      named: 'Navngivne hexes',
      icons: 'Placeringstokens',
      glimpsed: 'Glimpede sekskanter',
      pending: 'Steder, der venter på udfyldning',
      calibrated: 'Kalibreret',
      overrides: 'Side tilsidesætter',
      undo: 'Fortryd tilgængelig',
    },
    messages: {
      filled:
        'Fyld fuldført: {created} hexes tegnet, {restyled} restylet, {icons} placeringer skjult.',
      revealed: '{count} hexes afsløret.',
      revealedPage: 'Alle {count} hexes på siden afsløret.',
      confirmReset:
        'Vil du fjerne alle {count} hexes fra "{page}"? Placeringstokens vender tilbage til tokenlaget. Fortryd kan ikke fortryde dette.',
      resetPage: '{count} sekskanter fjernet fra siden.',
      undone:
        'Sidste udfyldning fortrydet: {removed} hexes fjernet, {restored} restyled hexes gendannet.',
      named: '{count} hexes med navnet "{name}".',
      unnamed: 'Navnet er ryddet fra {count} hexes.',
      marked:
        '{attached} placeringer skjult i eksisterende hexes; {pending} vil blive skjult af den næste udfyldning, der dækker dem.',
      unmarked: '{count} tokens er ikke længere placeringer.',
      settingChanged: '{setting} indstillet til {value}.',
      rescanned:
        'Genscanning fuldført: {kept} hexes bevaret, {adopted} adopteret, {moved} genarkiveret, {dropped} manglende hexes glemt, {labels} etiketter og __HEX_PLACEHOLDERs gentilknyttede placeringer.',
      calibrated:
        'Gitter kalibreret (kolonnetrin {colStep}px, rækketrin {rowStep}px). Genscan: {kept} beholdt, {moved} genindgivet, {adopted} vedtaget.',
      calibrationReset:
        'Kalibrering fjernet. Genscan: {kept} beholdes, {moved} genindgivet, {adopted} blev vedtaget.',
      journalRebuilt: 'Uddelingsarkene "{help}" og "{deck}" er blevet genopbygget.',
      migrated:
        'Dine Hexploration 1.x hex-kort er blevet opgraderet. Hvis dette spil blev kopieret fra et Legacy-spil, skal du køre Rescan på hver hex-kortside.',
      pruned:
        '{dropped} gemte hexes eksisterer ikke længere og blev glemt. Hvis dette spil eller denne side blev kopieret, skal du køre Rescan på siden for at samle dens hexes op igen.',
      readyHint:
        'Skriv !hexploration for menuen, eller åbn "Hexploration - Command Deck"-uddelingsark.',
    },
    warnings: {
      foregroundUnavailable:
        'Dette spil understøtter ikke tegning på forgrundslaget, så der blev tegnet sekskanter på tokenlaget.',
      someFailed: '{count} sekskanter kunne ikke tegnes. Tjek API-konsollen for detaljer.',
    },
    errors: {
      noPage: 'Kunne ikke finde siden at arbejde på.',
      notHex: 'Denne side bruger ikke et hex-gitter.',
      noPolygons: 'Vælg en eller flere tegnede figurer, der skal udfyldes.',
      emptyArea: 'Det valgte område indeholder ingen hex-centre.',
      tooMany: 'Det ville skabe {count} hexes, hvilket er for mange på én gang.',
      nothingToConceal: 'Vælg tegnede figurer eller tokens til at skjule.',
      nothingToReveal: 'Vælg sekskanter, tegnede figurer eller tokens for at afsløre.',
      noTokens: 'Vælg først et eller flere tokens.',
      noHexes: 'Vælg først en eller flere hexes (eller poletter stående på hexes).',
      nothingToUndo: 'Der er ingen udfyldning at fortryde.',
      unknownCommand: 'Ukendt kommando: {command}',
      unknownSetting: 'Ukendt indstilling: {key}',
      unknownPageSetting: 'Indstillinger, der kan indstilles pr. side: {keys}',
      invalidValue: '"{value}" er ikke en gyldig værdi for {key}.',
      calibrateNeedsTokens: 'Vælg et eller to tokens fastgjort til hex-centre.',
      calibrateFailed: 'Disse tokens kan ikke bruges til at kalibrere.',
      unexpected: 'Noget gik galt: {message}',
    },
    hints: {
      noPage: 'Åbn den side, du vil arbejde på, eller vælg noget på den.',
      notHex: 'Indstil sidegitteret til Hex (V) eller Hex (H) i Sideindstillinger.',
      noPolygons:
        'Tegn en polygon, et rektangel, en ellipse eller en frihåndsform rundt om området, vælg det, og prøv derefter igen.',
      emptyArea: 'Tegn en større form, eller kontroller indstillingerne for sidegitteret.',
      tooMany: 'Udfyld et mindre område, eller opdel området i flere former.',
      noHexes: 'Hekser er på forgrunden eller symbollaget; skift til det lag for at vælge dem.',
      unknownCommand: 'Skriv !hexploration help for at vise kommandoerne.',
      unknownSetting: 'Skriv !hexploration set for at se alle indstillinger.',
      calibrateNeedsTokens:
        'Snap et token til midten af ​​en sekskant, og vælg det. Vælg en anden token, der er snappet til en tilstødende hex i samme række (Hex V) eller kolonne (Hex H) for også at rette hex-størrelsen.',
      calibrateFailed:
        'To tokens skal være i samme række (Hex V) eller den samme kolonne (Hex H), med mindst én hex fra hinanden.',
      unexpected: 'Detaljer er i API-konsolloggen.',
    },
    help: {
      menu: 'Vis menuen.',
      fill: 'Dæk de valgte tegnede figurer med sekskanter.',
      fillInverse: 'Dæk hele siden undtagen inde i de valgte former.',
      undo: 'Fortryd den sidste fyldning, omvendt fyld eller skjul, og gendan de former, den brugte.',
      reveal: 'Afslør de valgte hexes og hexes under de valgte former og tokens.',
      revealPage: 'Afslør hver hex på siden uden meddelelser.',
      conceal: 'Dæk området under de valgte former og tokens med sekskanter igen.',
      explore: 'Afslør omkring de valgte tokens, som om de lige var flyttet dertil.',
      resetPage: 'Fjern hver hex på siden (spørg først).',
      name: 'Navngiv de valgte hexes, eller hexes under de valgte tokens. Lad navnet stå tomt for at rydde det.',
      mark: 'Gør de valgte tokens til skjulte placeringer.',
      unmark: 'Stop de valgte tokens med at være skjulte placeringer.',
      set: 'Skift en indstilling, eller vis alle indstillinger.',
      pageSet: 'Tilsidesæt kun en afsløringsindstilling på den aktuelle side.',
      pageClear: 'Fjern den aktuelle sides tilsidesættelser.',
      rescan:
        'Genopbyg sidens hex-liste, for eksempel efter at have kopieret en side eller et spil.',
      calibrate:
        'Sæt hex-gitteret på linje med et eller to udvalgte tokens, der er fastgjort til hex-centre.',
      calibrateReset: 'Fjern den aktuelle sides kalibrering.',
      status: 'Vis, hvad Hexploration ved om den aktuelle side.',
      journal: 'Genopbyg hjælpe- og kommandodækket-uddelingsarkene.',
      help: 'Vis denne liste.',
      handout: 'Fuldstændige instruktioner findes i "{name}" uddelingsark.',
    },
    deck: {
      subtitle: 'Kommandodæk',
      drawDesc:
        'Tegn figurer rundt om et område, vælg dem, og udfyld derefter. Fortryd vender den sidste udfyldning.',
      revealDesc:
        'Vælg sekskanter, former eller tokens for at afsløre eller dække dem igen. Udforsk afsløringer omkring udvalgte tokens, som om de havde flyttet sig.',
      locationsDesc:
        'Vælg tokens for at skjule dem som placeringer under hexes. Vælg hexes eller tokens for at navngive en hex.',
      toolsDesc:
        'Indstillinger, sidetilsidesættelser, status, genscanning af kopierede sider og kalibrering af gitteret.',
      footer: 'Se "{help}"-uddelingsark for fuldstændige instruktioner.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Hex-by-hex-udforskning for Roll20',
      footer: 'Brug "{deck}"-uddelingsark til kontrolelementer med et enkelt klik.',
      overview: {
        heading: 'Oversigt',
        body: 'Hexploration dækker et hex-kort med uigennemsigtige hexes. Efterhånden som partiet bevæger sig, fjernes de hexes, de passerer igennem (og, hvis du vil, hexes omkring dem), så kortet afsløres en hex ad gangen. Skjulte placeringer kan placeres under hexes og annonceres, når de findes. Det fungerer i Jumpgate og Legacy-spil, på Hex (V) og Hex (H) gitter af enhver størrelse.',
        demo: 'Se en kort demo (fra version 1)',
      },
      quickStart: {
        heading: 'Hurtig start',
        steps: [
          'Åbn en side, hvis gitter er indstillet til Hex (V) eller Hex (H).',
          'Tegn en eller flere figurer (polygon, rektangel, ellipse eller frihånd) rundt om området for at skjule.',
          'Vælg figurerne, og klik på Fyld i kommandodækket (eller skriv !hexploration fill). Formerne erstattes af sekskanter.',
          'Valgfrit: Inden du udfylder, skal du vælge tokens for vigtige steder og klikke på Marker placering. De er gemt under hexes og annonceret, når de opdages.',
          'Flyt et spillertoken. Hver hex, den passerer igennem, og hexes inden for dens synsafstand, afsløres.',
        ],
      },
      commands: {
        heading: 'Kommandoer',
        intro:
          "Kun GM'er kan bruge disse kommandoer. De fleste handler på de valgte objekter; resten handler på den side, du ser.",
        colCommand: 'Kommando',
        colDesc: 'Hvad den gør',
      },
      revealing: {
        heading: 'Sådan fungerer afsløring',
        points: [
          'Kun tokens på tokenlaget afslører sekskanter. Hvilket antal tokens er angivet af Tokens That Reveal: spillerpoletter som standard, så GM kan flytte monstre uden at afdække kortet.',
          'Et token afslører hver hex, den dækker (store tokens dækker flere), og med Reveal Along Path aktiveret, hver hex på den rute, den blev trukket langs, inklusive waypoints.',
          'Sight Distance afslører sekskanterne omkring hver af disse sekskanter. Med Line of Sight slået til, afsløres en hex kun, hvis der ikke ligger nogen dækket hex imellem.',
          'Hex Reveal Distance gemmes på hexes, efterhånden som de tegnes. Disse hexes afsløres kun indefra så mange hexes, uanset hvor langt et token kan se. Brug den til bjerge eller skove, der skjuler, hvad der er bag dem.',
          'I Glimpse-tilstand bliver sekskanter inden for synsvidde gennemsigtige i stedet for at forsvinde, og fjernes, når et token kommer ind i dem.',
          "API'en rapporterer ikke bevægelser foretaget af andre mods. TokenMod-træk opfanges automatisk; for andre mods, vælg tokens og klik på Udforsk, eller ring til Hexploration.revealAround(token) fra din egen mod.",
        ],
      },
      locations: {
        heading: 'Navngivne Hekser og Steder',
        points: [
          'Mark Location forvandler de valgte tokens til skjulte placeringer. Et token, der allerede er under en hex, gemmes med det samme; ellers er det skjult af det næste fyld, der dækker det.',
          'Tokens med det hvide tårns statusmarkør behandles også som placeringer, når du udfylder, som i version 1.',
          'Skjulte placeringstokens flyttes til GM-laget. Når deres hex afsløres, vender de tilbage til token-laget med deres navn vist, og deres opdagelse annonceres.',
          'Navn Hex giver en hex et navn uden token. Navnet vises til GM som en etiket på GM-laget og annonceres, når hexen afsløres.',
          'Announce Discoveries vælger, om alle, kun GM, eller ingen ser meddelelsen. Ping Discoveries flytter også spillernes udsigt til placeringen.',
        ],
      },
      settings: {
        heading: 'Indstillinger',
        intro:
          "Skift indstillinger med !hexploration set (eller knappen Indstillinger). Hex Layer, Tokens That Reveal og Language kan også indstilles på Mod'ens indstillingsside.",
        colKey: 'Nøgle',
        colName: 'Indstilling',
        colDesc: 'Beskrivelse',
        perPage: '(Kan indstilles pr. side.)',
      },
      jumpgate: {
        heading: 'Jumpgate og Legacy',
        points: [
          'Hexploration finder ud af, hvilken motor spillet bruger, og tegner den matchende form. Figurer tegnet i begge editorer kan udfyldes.',
          'Med Hex Layer sat til Auto, tegnes hexes på forgrundslaget, over tokens, så spillere ikke kan se, hvad der er nedenunder. Hvis forgrundslaget ikke er tilgængeligt, bruges tokenlaget i stedet.',
          'Jumpgate tegner matematisk regulære hexes, som er en lidt anderledes form end Legacy hexes. Hvis hexene ikke stemmer overens med en sides gitter, skal du sætte et token til et hex-center, vælge det og klikke på Kalibrer. Vælg to tokens i tilstødende hexes i samme række (Hex V) eller kolonne (Hex H) for også at rette hex-størrelsen.',
          "Når en side eller et spil kopieres, får dets hexes nye id'er. Kør Rescan på siden for at samle dem op igen, sammen med deres navneetiketter og placeringstokens.",
        ],
      },
      upgrading: {
        heading: 'Opgradering fra version 1',
        points: [
          'Version 2 behøver ikke længere PathMath, MatrixMath, Vector Math eller HTML Builder. Du kan fjerne dem, medmindre en anden mod bruger dem.',
          'Eksisterende hex-kort, navne, placeringstokens og indstillinger opgraderes automatisk ved første start.',
          'Version 1-kommandoerne, inklusive makroen Hexploration_menu, virker stadig.',
          'Version 1 lader enhver token, der repræsenterede en karakter, afsløre hexes. Indstil Tokens That Reveal til Character-tokens for at bevare denne adfærd.',
        ],
        colV1: 'Version 1 kommando',
        colV2: 'Version 2 kommando',
      },
      troubleshooting: {
        heading: 'Fejlfinding',
        points: [
          'Der sker ikke noget, når et token bevæger sig: Kontroller, at tokenet er på tokenlaget og matcher Tokens That Reveal, og at siden har hexes (!hexploration-status).',
          'Hexes er forskudt fra gitteret: Brug Kalibrer, og tjek derefter med et token på et par hexes på tværs af kortet.',
          'Hexes stoppede med at afsløre efter kopiering af en side eller et spil: kør Rescan på siden.',
          'Fill siger, at området ikke har nogen hex-centre: Formen skal indeholde midten af ​​mindst én hex-centre.',
          'For alt andet skal du tjekke API-konsolloggen og inkludere dens meddelelser, når du beder om hjælp.',
        ],
      },
      languages: {
        heading: 'Sprog',
        body: 'Vælg et sprog med !hexploration set sprog. Tilgængelige sprog:',
      },
      credits: {
        heading: 'Credits',
        original: 'Original mod af',
        maintainer: 'Version 2 vedligeholdes af',
        marketplace: 'Adas kunstpakker på Roll20 Marketplace',
        support:
          'Hvis du finder en fejl eller har en idé, skal du skrive i Roll20 Mod-forummet eller åbne et problem på GitHub og inkludere eventuelle meddelelser fra API-konsollens log.',
      },
    },
  };

  var localeNl = {};

  var localeEnUS = {
    titles: {
      ready: 'Hexploration is ready.',
      settings: 'Hexploration Settings',
      languages: 'Choose a Language',
      pageSettings: 'Page Settings: {page}',
      status: 'Hexploration Status: {page}',
      help: 'Hexploration Commands',
      confirm: 'Please Confirm',
    },
    discovery: {
      title: 'Location Discovered',
    },
    menu: {
      draw: 'Draw',
      reveal: 'Reveal and Hide',
      locations: 'Locations',
      tools: 'Tools',
      layerInUse: 'New hexes are being drawn on the {layer}.',
      pageSettingsHelp:
        'These settings apply to this page only. Settings marked ★ override the global settings.',
    },
    buttons: {
      fill: 'Fill',
      fillInverse: 'Inverse Fill',
      undo: 'Undo Fill',
      reveal: 'Reveal',
      conceal: 'Conceal',
      explore: 'Explore',
      revealPage: 'Reveal Page',
      resetPage: 'Reset Page',
      mark: 'Mark Location',
      unmark: 'Unmark',
      name: 'Name Hex',
      settings: 'Settings',
      pageSettings: 'Page Settings',
      status: 'Status',
      rescan: 'Rescan',
      calibrate: 'Calibrate',
      calibrateReset: 'Reset Calibration',
      help: 'Help',
      change: 'Change',
      menu: 'Menu',
      clearOverrides: 'Clear Overrides',
      confirmReset: 'Yes, Remove All Hexes',
    },
    prompts: {
      name: 'Location name (leave empty to clear)',
    },
    values: {
      on: 'On',
      off: 'Off',
      none: 'None',
      hexLayer: {
        auto: 'Auto (foreground if available)',
        foreground: 'foreground layer',
        objects: 'token layer',
      },
      revealBy: {
        players: 'Player tokens',
        characters: 'Character tokens',
        all: 'All tokens',
      },
      revealMode: {
        clear: 'Clear',
        glimpse: 'Glimpse',
      },
      announce: {
        all: 'Everyone',
        gm: 'GM only',
        off: 'Off',
      },
      orientation: {
        vertical: 'Hex (V)',
        horizontal: 'Hex (H)',
      },
      fillKind: {
        fill: 'Fill',
        fillInverse: 'Inverse Fill',
        conceal: 'Conceal',
      },
    },
    settings: {
      language: {
        label: 'Language',
        desc: 'Language for menus, messages and handouts.',
      },
      hexLayer: {
        label: 'Hex Layer',
        desc: 'Where new hexes are drawn. Auto tries the foreground layer (above tokens) and falls back to the token layer if the game does not support it.',
      },
      fillColor: {
        label: 'Fill Colour',
        desc: 'Colour of new hexes. Use rgba() for see-through hexes, for example rgba(0,0,0,0.8).',
      },
      strokeColor: {
        label: 'Border Colour',
        desc: 'Colour of the outline of new hexes.',
      },
      labelColor: {
        label: 'Label Colour',
        desc: 'Colour of the GM-only name labels on named hexes.',
      },
      glimpseColor: {
        label: 'Glimpse Colour',
        desc: 'Colour hexes change to when glimpsed (Glimpse reveal mode). Use a see-through rgba() colour.',
      },
      strokeWidth: {
        label: 'Border Width',
        desc: 'Width of the outline of new hexes, in pixels (0 to 20).',
      },
      maxDistance: {
        label: 'Hex Reveal Distance',
        desc: 'Applied to hexes as they are drawn: a token must be within this many hexes to reveal them, however far it can see. Leave empty for no limit.',
      },
      revealDistance: {
        label: 'Sight Distance',
        desc: 'How many hexes around a moving token are revealed (0 to 20). 0 reveals only the hexes the token passes through.',
      },
      lineOfSight: {
        label: 'Line of Sight',
        desc: 'When on, a hex is only revealed if no covered hex lies between it and the token.',
      },
      revealPath: {
        label: 'Reveal Along Path',
        desc: 'When on, every hex a token passes through while being dragged (including waypoints) is revealed, not just where it stops.',
      },
      revealBy: {
        label: 'Tokens That Reveal',
        desc: 'Which tokens on the token layer reveal hexes: tokens controlled by a player, tokens that represent any character, or every token.',
      },
      revealMode: {
        label: 'Reveal Mode',
        desc: 'Clear removes hexes within sight. Glimpse makes them see-through instead; they are removed when a token enters them.',
      },
      announce: {
        label: 'Announce Discoveries',
        desc: 'Who sees the chat message when a named location is discovered.',
      },
      pingDiscoveries: {
        label: 'Ping Discoveries',
        desc: 'When on, players are pinged to a named location when it is discovered.',
      },
      hideCoveredTokens: {
        label: 'Hide Covered Tokens',
        desc: 'Roll20 draws names, bars and auras above hexes. When on, tokens under a covered hex have their player-visible name, bars and auras switched off, and switched back on when they are uncovered.',
      },
    },
    status: {
      engine: 'Game engine',
      grid: 'Grid',
      layer: 'Hex layer',
      hexes: 'Hexes',
      named: 'Named hexes',
      icons: 'Location tokens',
      glimpsed: 'Glimpsed hexes',
      pending: 'Locations waiting for a fill',
      calibrated: 'Calibrated',
      overrides: 'Page overrides',
      undo: 'Undo available',
    },
    messages: {
      filled:
        'Fill complete. Hexes drawn: {created}. Restyled: {restyled}. Locations hidden: {icons}.',
      revealed: 'Hexes revealed: {count}.',
      revealedPage: 'Every hex on the page revealed ({count}).',
      confirmReset:
        'Remove every hex from "{page}" ({count})? Location tokens return to the token layer. Undo cannot reverse this.',
      resetPage: 'Hexes removed from the page: {count}.',
      undone: 'Last fill undone. Hexes removed: {removed}. Restyled hexes restored: {restored}.',
      named: 'Hexes named "{name}": {count}.',
      unnamed: 'Names cleared: {count}.',
      marked:
        'Locations hidden in existing hexes: {attached}. Waiting for the next fill that covers them: {pending}.',
      unmarked: 'Tokens that are no longer locations: {count}.',
      settingChanged: '{setting} set to {value}.',
      rescanned:
        'Rescan complete. Kept: {kept}. Adopted: {adopted}. Re-filed: {moved}. Missing and forgotten: {dropped}. Labels re-linked: {labels}. Location tokens re-linked: {icons}.',
      calibrated:
        'Grid calibrated (column step {colStep}px, row step {rowStep}px). Rescan: kept {kept}, re-filed {moved}, adopted {adopted}.',
      calibrationReset:
        'Calibration removed. Rescan: kept {kept}, re-filed {moved}, adopted {adopted}.',
      journalRebuilt: 'The "{help}" and "{deck}" handouts have been rebuilt.',
      migrated:
        'Your Hexploration 1.x hex maps have been upgraded. If this game was copied from a Legacy game, run Rescan on each hex map page.',
      pruned:
        'Saved hexes that no longer exist and were forgotten: {dropped}. If this game or page was copied, run Rescan on the page to pick its hexes up again.',
      readyHint:
        'Type !hexploration for the menu, or open the "Hexploration - Command Deck" handout.',
    },
    warnings: {
      foregroundUnavailable:
        'This game does not support drawing on the foreground layer, so hexes were drawn on the token layer.',
      someFailed: 'Hexes that could not be drawn: {count}. Check the API console for details.',
    },
    errors: {
      noPage: 'Could not find the page to work on.',
      notHex: 'This page does not use a hex grid.',
      noPolygons: 'Select one or more drawn shapes to fill.',
      emptyArea: 'The selected area does not contain any hex centres.',
      tooMany: 'That would create too many hexes in one go ({count}).',
      nothingToConceal: 'Select drawn shapes or tokens to conceal.',
      nothingToReveal: 'Select hexes, drawn shapes or tokens to reveal.',
      noTokens: 'Select one or more tokens first.',
      noHexes: 'Select one or more hexes (or tokens standing on hexes) first.',
      nothingToUndo: 'There is no fill to undo.',
      unknownCommand: 'Unknown command: {command}',
      unknownSetting: 'Unknown setting: {key}',
      unknownPageSetting: 'Settings that can be set per page: {keys}',
      invalidValue: '"{value}" is not a valid value for {key}.',
      calibrateNeedsTokens: 'Select one or two tokens snapped to hex centres.',
      calibrateFailed: 'Those tokens cannot be used to calibrate.',
      unexpected: 'Something went wrong: {message}',
    },
    hints: {
      noPage: 'Open the page you want to work on, or select something on it.',
      notHex: 'Set the page grid to Hex (V) or Hex (H) in Page Settings.',
      noPolygons:
        'Draw a polygon, rectangle, ellipse or freehand shape around the area, select it, then try again.',
      emptyArea: 'Draw a larger shape, or check the page grid settings.',
      tooMany: 'Fill a smaller area, or split the area into several shapes.',
      noHexes: 'Hexes are on the foreground or token layer; switch to that layer to select them.',
      unknownCommand: 'Type !hexploration help to list the commands.',
      unknownSetting: 'Type !hexploration set to see every setting.',
      calibrateNeedsTokens:
        'Snap a token to the centre of a hex and select it. Select a second token snapped to a neighbouring hex in the same row (Hex V) or column (Hex H) to correct the hex size too.',
      calibrateFailed:
        'Two tokens must be in the same row (Hex V) or the same column (Hex H), at least one hex apart.',
      unexpected: 'Details are in the API console log.',
    },
    help: {
      menu: 'Show the menu.',
      fill: 'Cover the selected drawn shapes with hexes.',
      fillInverse: 'Cover the whole page except inside the selected shapes.',
      undo: 'Undo the last fill, inverse fill or conceal, and restore the shapes it used.',
      reveal: 'Reveal the selected hexes, and the hexes under the selected shapes and tokens.',
      revealPage: 'Reveal every hex on the page without announcements.',
      conceal: 'Cover the area under the selected shapes and tokens with hexes again.',
      explore: 'Reveal around the selected tokens as if they had just moved there.',
      resetPage: 'Remove every hex on the page (asks first).',
      name: 'Name the selected hexes, or the hexes under the selected tokens. Leave the name empty to clear it.',
      mark: 'Turn the selected tokens into hidden locations.',
      unmark: 'Stop the selected tokens being hidden locations.',
      set: 'Change a setting, or show all settings.',
      pageSet: 'Override a reveal setting on the current page only.',
      pageClear: 'Remove the current page’s overrides.',
      rescan: 'Rebuild the page’s hex list, for example after copying a page or game.',
      calibrate: 'Line the hex grid up with one or two selected tokens snapped to hex centres.',
      calibrateReset: 'Remove the current page’s calibration.',
      status: 'Show what Hexploration knows about the current page.',
      journal: 'Rebuild the Help and Command Deck handouts.',
      help: 'Show this list.',
      handout: 'Full instructions are in the "{name}" handout.',
    },
    deck: {
      subtitle: 'Command Deck',
      drawDesc: 'Draw shapes around an area, select them, then fill. Undo reverses the last fill.',
      revealDesc:
        'Select hexes, shapes or tokens to reveal or cover them again. Explore reveals around selected tokens as if they had moved.',
      locationsDesc:
        'Select tokens to hide them as locations under hexes. Select hexes or tokens to name a hex.',
      toolsDesc:
        'Settings, page overrides, status, rescanning copied pages and calibrating the grid.',
      footer: 'See the "{help}" handout for full instructions.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Hex-by-hex exploration for Roll20',
      footer: 'Use the "{deck}" handout for one-click controls.',
      overview: {
        heading: 'Overview',
        body: 'Hexploration covers a hex map with opaque hexes. As the party moves, the hexes they pass through (and, if you like, the hexes around them) are removed, so the map is uncovered one hex at a time. Hidden locations can be placed under hexes and are announced when found. It works in Jumpgate and Legacy games, on Hex (V) and Hex (H) grids of any size.',
        demo: 'Watch a short demo (from version 1)',
      },
      quickStart: {
        heading: 'Quick Start',
        steps: [
          'Open a page whose grid is set to Hex (V) or Hex (H).',
          'Draw one or more shapes (polygon, rectangle, ellipse or freehand) around the area to hide.',
          'Select the shapes and click Fill in the Command Deck (or type !hexploration fill). The shapes are replaced by hexes.',
          'Optional: before filling, select tokens for important places and click Mark Location. They are hidden under the hexes and announced when discovered.',
          'Move a player token. Every hex it passes through, and the hexes within its Sight Distance, are revealed.',
        ],
      },
      commands: {
        heading: 'Commands',
        intro:
          'Only GMs can use these commands. Most act on the selected objects; the rest act on the page you are viewing.',
        colCommand: 'Command',
        colDesc: 'What it does',
      },
      revealing: {
        heading: 'How Revealing Works',
        points: [
          'Only tokens on the token layer reveal hexes. Which tokens count is set by Tokens That Reveal: player tokens by default, so the GM can move monsters without uncovering the map.',
          'A token reveals every hex it covers (large tokens cover several) and, with Reveal Along Path on, every hex on the route it was dragged along, including waypoints.',
          'Sight Distance reveals the hexes around each of those hexes. With Line of Sight on, a hex is only revealed if no covered hex lies in between.',
          'Hex Reveal Distance is stored on hexes as they are drawn. Those hexes are only revealed from within that many hexes, however far a token can see. Use it for mountains or forests that hide what is behind them.',
          'In Glimpse mode, hexes within sight become see-through instead of disappearing, and are removed when a token enters them.',
          'Roll20 draws token names, bars and auras above hexes. With Hide Covered Tokens on, a token under a covered hex has its player-visible name, bars and auras switched off until it is uncovered, so hidden monsters do not give themselves away. If you switch one of them on while the token is covered, it stays hidden and is switched on when the token is uncovered.',
          'The API does not report moves made by other mods. TokenMod moves are picked up automatically; for other mods, select the tokens and click Explore, or call Hexploration.revealAround(token) from your own mod.',
        ],
      },
      locations: {
        heading: 'Named Hexes and Locations',
        points: [
          'Mark Location turns the selected tokens into hidden locations. A token already under a hex is hidden straight away; otherwise it is hidden by the next fill that covers it.',
          'Tokens with the white-tower status marker are also treated as locations when you fill, as in version 1.',
          'Hidden location tokens are moved to the GM layer. When their hex is revealed they return to the token layer with their name shown, and their discovery is announced.',
          'Name Hex gives a hex a name without a token. The name is shown to the GM as a label on the GM layer and announced when the hex is revealed.',
          'Announce Discoveries chooses whether everyone, only the GM, or nobody sees the announcement. Ping Discoveries also moves the players’ view to the location.',
        ],
      },
      settings: {
        heading: 'Settings',
        intro:
          'Change settings with !hexploration set (or the Settings button). Hex Layer, Tokens That Reveal and Language can also be set on the Mod’s settings page.',
        colKey: 'Key',
        colName: 'Setting',
        colDesc: 'Description',
        perPage: '(Can be set per page.)',
      },
      jumpgate: {
        heading: 'Jumpgate and Legacy',
        points: [
          'Hexploration works out which engine the game uses and draws the matching kind of shape. Shapes drawn in either editor can be filled.',
          'With Hex Layer set to Auto, hexes are drawn on the foreground layer, above tokens, so players cannot see what is underneath. If the foreground layer is not available, the token layer is used instead.',
          'Jumpgate draws mathematically regular hexes, which are a slightly different shape from Legacy hexes. If the hexes do not line up with a page’s grid, snap a token to a hex centre, select it and click Calibrate. Select two tokens in neighbouring hexes of the same row (Hex V) or column (Hex H) to correct the hex size too.',
          'When a page or game is copied, its hexes get new IDs. Run Rescan on the page to pick them up again, together with their name labels and location tokens.',
        ],
      },
      upgrading: {
        heading: 'Upgrading from Version 1',
        points: [
          'Version 2 no longer needs PathMath, MatrixMath, Vector Math or HTML Builder. You can remove them unless another mod uses them.',
          'Existing hex maps, names, location tokens and settings are upgraded automatically on the first start.',
          'The version 1 commands, including the Hexploration_menu macro, still work.',
          'Version 1 let any token that represented a character reveal hexes. Set Tokens That Reveal to Character tokens to keep that behaviour.',
        ],
        colV1: 'Version 1 command',
        colV2: 'Version 2 command',
      },
      troubleshooting: {
        heading: 'Troubleshooting',
        points: [
          'Nothing happens when a token moves: check the token is on the token layer and matches Tokens That Reveal, and that the page has hexes (!hexploration status).',
          'Hexes are offset from the grid: use Calibrate, then check with a token on a few hexes across the map.',
          'Hexes stopped revealing after copying a page or game: run Rescan on the page.',
          'Fill says the area has no hex centres: the shape must contain the centre of at least one hex.',
          'For anything else, check the API console log and include its messages when asking for help.',
        ],
      },
      languages: {
        heading: 'Languages',
        body: 'Choose a language with !hexploration set language. Available languages:',
      },
      credits: {
        heading: 'Credits',
        original: 'Original mod by',
        maintainer: 'Version 2 maintained by',
        marketplace: 'Ada’s art packs on the Roll20 Marketplace',
        support:
          'If you find a bug or have an idea, post in the Roll20 Mod forum or open an issue on GitHub, and include any messages from the API console log.',
      },
    },
  };

  var localeFi = {};

  var localeFr = {};

  var localeDe = {};

  var localeEl = {};

  var localeHe = {};

  var localeHu = {};

  var localeIt = {};

  var localeJa = {};

  var localeKo = {};

  var localePl = {};

  var localePtPT = {};

  var localePtBR = {};

  var localeRu = {};

  var localeEs = {};

  var localeSv = {};

  var localeTr = {};

  var localeUk = {};

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
    af: TRANSLATION$4,
    ca: TRANSLATION$3,
    'zh-TW': TRANSLATION$2,
    cs: TRANSLATION$1,
    da: TRANSLATION,
    nl: localeNl,
    'en-US': localeEnUS,
    fi: localeFi,
    fr: localeFr,
    de: localeDe,
    el: localeEl,
    he: localeHe,
    hu: localeHu,
    it: localeIt,
    ja: localeJa,
    ko: localeKo,
    pl: localePl,
    'pt-PT': localePtPT,
    'pt-BR': localePtBR,
    ru: localeRu,
    es: localeEs,
    sv: localeSv,
    tr: localeTr,
    uk: localeUk,
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

  // ---------------------------------------------------------------------------
  // Config validation (pure)
  // ---------------------------------------------------------------------------

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

    switch (key) {
      case 'language': {
        const lang = normalizeLocale(raw);
        return lang ? ok(lang) : bad;
      }
      case 'hexLayer':
        return HEX_LAYER_OPTIONS.includes(raw) ? ok(raw) : bad;
      case 'revealBy':
        return REVEAL_BY_OPTIONS.includes(raw) ? ok(raw) : bad;
      case 'revealMode':
        return REVEAL_MODE_OPTIONS.includes(raw) ? ok(raw) : bad;
      case 'announce':
        return ANNOUNCE_OPTIONS.includes(raw) ? ok(raw) : bad;
      case 'fillColor':
      case 'strokeColor':
      case 'labelColor':
      case 'glimpseColor':
        return isValidColor(raw) ? ok(toText(raw)) : bad;
      case 'strokeWidth': {
        const n = typeof raw === 'number' ? Math.trunc(raw) : parseStrictInt(raw);
        return n === null || !Number.isFinite(n) || n < 0 ? bad : ok(clamp(n, 0, MAX_STROKE_WIDTH));
      }
      case 'revealDistance': {
        const n = typeof raw === 'number' ? Math.trunc(raw) : parseStrictInt(raw);
        return n === null || !Number.isFinite(n) || n < 0
          ? bad
          : ok(clamp(n, 0, MAX_REVEAL_DISTANCE));
      }
      case 'maxDistance': {
        if (raw === null || raw === undefined || ['', '-', 'none', 'off'].includes(toText(raw))) {
          return ok(null);
        }
        const n = typeof raw === 'number' ? Math.trunc(raw) : parseStrictInt(raw);
        return n === null || !Number.isFinite(n) || n < 0
          ? bad
          : ok(clamp(n, 0, MAX_REVEAL_DISTANCE));
      }
      case 'lineOfSight':
      case 'revealPath':
      case 'pingDiscoveries':
      case 'hideCoveredTokens': {
        const b = parseBoolean(raw);
        return b === null ? bad : ok(b);
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
   * Keeps only valid per-page overrides.
   *
   * @param {object} settings Raw page settings.
   * @returns {object} Clean page settings.
   */
  function mergePageSettings(settings) {
    const clean = {};
    if (!isRecord(settings)) {
      return clean;
    }
    for (const key of PAGE_SETTING_KEYS) {
      if (key in settings) {
        const result = validateConfigValue(key, settings[key]);
        if (result.valid) {
          clean[key] = result.value;
        }
      }
    }
    return clean;
  }

  // ---------------------------------------------------------------------------
  // State shape and migration (pure)
  // ---------------------------------------------------------------------------

  /**
   * Creates an empty v2 state object.
   *
   * @returns {object} Fresh state.
   */
  function createDefaultState() {
    return {
      schemaVersion: SCHEMA_VERSION,
      version: SCRIPT_VERSION,
      config: { ...DEFAULT_CONFIG },
      pages: {},
      pendingLocations: {},
      lastFill: null,
      coveredTokens: {},
      notices: {},
    };
  }

  /**
   * Normalises one stored hex record.
   *
   * @param {string} key "row,col" key.
   * @param {object} raw Stored record.
   * @returns {object|null} Clean hex record, or null when unusable.
   */
  function normaliseHex(key, raw) {
    const coords = parseHexKey(key);
    if (!coords || !isRecord(raw) || !toText(raw.id)) {
      return null;
    }
    const hex = {
      id: toText(raw.id),
      type: raw.type === 'pathv2' ? 'pathv2' : raw.type === 'path' ? 'path' : null,
      row: coords[0],
      col: coords[1],
    };
    if (toText(raw.name)) {
      hex.name = toText(raw.name);
    }
    if (toText(raw.nameId)) {
      hex.nameId = toText(raw.nameId);
    }
    if (toText(raw.iconId)) {
      hex.iconId = toText(raw.iconId);
    }
    const maxDistance = validateConfigValue('maxDistance', raw.maxDistance);
    if (maxDistance.valid && maxDistance.value !== null) {
      hex.maxDistance = maxDistance.value;
    }
    if (raw.glimpsed === true) {
      hex.glimpsed = true;
    }
    return hex;
  }

  /**
   * Normalises a page's stored data.
   *
   * @param {object} raw Stored page data.
   * @returns {object} Clean page data.
   */
  function normalisePage(raw) {
    const page = { hexes: {}, settings: {}, calibration: null };
    if (!isRecord(raw)) {
      return page;
    }
    if (isRecord(raw.hexes)) {
      for (const [key, value] of Object.entries(raw.hexes)) {
        const hex = normaliseHex(key, value);
        if (hex) {
          page.hexes[`${hex.row},${hex.col}`] = hex;
        }
      }
    }
    page.settings = mergePageSettings(raw.settings);
    if (isRecord(raw.calibration)) {
      const cal = {};
      for (const k of ['colStep', 'rowStep', 'originX', 'originY']) {
        if (Number.isFinite(raw.calibration[k])) {
          cal[k] = raw.calibration[k];
        }
      }
      page.calibration = Object.keys(cal).length === 4 ? cal : null;
    }
    return page;
  }

  /**
   * Converts any stored state (v1, v2 or damaged) into a clean v2 state.
   *
   * v1 stored hexes in `pageHexes[pageId]["row,col"]` with a parallel `hexIdMap`,
   * and a flat config. Its defaults differed (no reveal distance), so missing
   * v1 values fall back to v1 behaviour rather than the new defaults.
   *
   * @param {*} raw Stored state.
   * @returns {{state: object, migratedFrom: number|null}} Clean state and the
   *          schema it was migrated from (null when no migration was needed).
   */
  function migrateState(raw) {
    const fresh = createDefaultState();
    if (!isRecord(raw)) {
      return { state: fresh, migratedFrom: null };
    }

    if (isRecord(raw.pageHexes) && !isRecord(raw.pages)) {
      const v1Defaults = { ...DEFAULT_CONFIG, revealDistance: 0, strokeWidth: 0 };
      fresh.config = mergeConfig(raw.config, v1Defaults);
      for (const [pageId, hexes] of Object.entries(raw.pageHexes)) {
        const page = normalisePage({ hexes });
        if (Object.keys(page.hexes).length > 0) {
          fresh.pages[pageId] = page;
        }
      }
      return { state: fresh, migratedFrom: 1 };
    }

    fresh.config = mergeConfig(raw.config);
    if (isRecord(raw.pages)) {
      for (const [pageId, page] of Object.entries(raw.pages)) {
        fresh.pages[pageId] = normalisePage(page);
      }
    }
    if (isRecord(raw.pendingLocations)) {
      for (const [tokenId, pageId] of Object.entries(raw.pendingLocations)) {
        if (toText(pageId)) {
          fresh.pendingLocations[tokenId] = toText(pageId);
        }
      }
    }
    if (isRecord(raw.lastFill)) {
      fresh.lastFill = raw.lastFill;
    }
    if (isRecord(raw.coveredTokens)) {
      for (const [tokenId, entry] of Object.entries(raw.coveredTokens)) {
        if (isRecord(entry) && toText(entry.pageId) && isRecord(entry.saved)) {
          fresh.coveredTokens[tokenId] = {
            pageId: toText(entry.pageId),
            saved: { ...entry.saved },
          };
        }
      }
    }
    if (isRecord(raw.notices)) {
      fresh.notices = { ...raw.notices };
    }
    return { state: fresh, migratedFrom: null };
  }

  // ---------------------------------------------------------------------------
  // Persistent state access (Roll20)
  // ---------------------------------------------------------------------------

  let pathIndex = null;

  /**
   * Loads, migrates and validates the persistent state. Call once on ready.
   *
   * @returns {number|null} The schema migrated from, or null.
   */
  function initialiseState() {
    const { state: clean, migratedFrom } = migrateState(state[STATE_KEY]);
    clean.version = SCRIPT_VERSION;
    state[STATE_KEY] = clean;
    pathIndex = null;
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
   * Imports Roll20 One-Click useroptions into the persisted config.
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
    // useroptions only change when the GM edits them, so remember what was last
    // applied and only re-apply on change; otherwise chat changes would be
    // overwritten on every restart.
    const applied = isRecord(s.notices.useroptions) ? s.notices.useroptions : {};
    for (const key of ['hexLayer', 'revealBy', 'language']) {
      if (key in options && options[key] !== applied[key]) {
        setConfigValue(key, options[key]);
        applied[key] = options[key];
      }
    }
    s.notices.useroptions = applied;
  }

  /**
   * Returns a page's stored data.
   *
   * @param {string} pageId Page ID.
   * @param {boolean} [create=false] Create the record when missing.
   * @returns {object|null} Page data.
   */
  function getPageData(pageId, create = false) {
    const s = getState();
    if (!s.pages[pageId] && create) {
      s.pages[pageId] = { hexes: {}, settings: {}, calibration: null };
    }
    return s.pages[pageId] || null;
  }

  /**
   * Returns the IDs of every page with stored data.
   *
   * @returns {string[]} Page IDs.
   */
  function getPageIds() {
    return Object.keys(getState().pages);
  }

  /**
   * Removes a page's stored data entirely.
   *
   * @param {string} pageId Page ID.
   * @returns {void}
   */
  function deletePageData(pageId) {
    const s = getState();
    const page = s.pages[pageId];
    if (page && pathIndex) {
      for (const hex of Object.values(page.hexes)) {
        pathIndex.delete(hex.id);
      }
    }
    delete s.pages[pageId];
  }

  /**
   * Returns the settings in force on a page: global config plus page overrides.
   *
   * @param {string} pageId Page ID.
   * @returns {object} Effective settings.
   */
  function getPageSettings(pageId) {
    const page = getPageData(pageId);
    return { ...getConfig(), ...(page ? page.settings : {}) };
  }

  /**
   * Sets a per-page override.
   *
   * @param {string} pageId Page ID.
   * @param {string} key Setting key (must be in PAGE_SETTING_KEYS).
   * @param {*} raw Raw value.
   * @returns {{valid: boolean, value?: *}} Validation result.
   */
  function setPageSetting(pageId, key, raw) {
    if (!PAGE_SETTING_KEYS.includes(key)) {
      return { valid: false };
    }
    const result = validateConfigValue(key, raw);
    if (result.valid) {
      getPageData(pageId, true).settings[key] = result.value;
    }
    return result;
  }

  /**
   * Clears all per-page overrides.
   *
   * @param {string} pageId Page ID.
   * @returns {void}
   */
  function clearPageSettings(pageId) {
    const page = getPageData(pageId);
    if (page) {
      page.settings = {};
    }
  }

  /**
   * Stores or clears a page's grid calibration.
   *
   * @param {string} pageId Page ID.
   * @param {object|null} calibration Calibration, or null to clear.
   * @returns {void}
   */
  function setCalibration(pageId, calibration) {
    getPageData(pageId, true).calibration = calibration ? { ...calibration } : null;
  }

  // ---------------------------------------------------------------------------
  // Hex records
  // ---------------------------------------------------------------------------

  /**
   * Builds the in-memory path ID index on first use.
   *
   * @returns {Map<string, string[]>} Map of path ID to [pageId, key].
   */
  function getIndex() {
    if (!pathIndex) {
      pathIndex = new Map();
      for (const [pageId, page] of Object.entries(getState().pages)) {
        for (const [key, hex] of Object.entries(page.hexes)) {
          pathIndex.set(hex.id, [pageId, key]);
        }
      }
    }
    return pathIndex;
  }

  /**
   * Returns a hex record.
   *
   * @param {string} pageId Page ID.
   * @param {string} key "row,col" key.
   * @returns {object|null} Hex record.
   */
  function getHex(pageId, key) {
    return getPageData(pageId)?.hexes[key] || null;
  }

  /**
   * Returns every hex record on a page.
   *
   * @param {string} pageId Page ID.
   * @returns {object[]} Hex records.
   */
  function getPageHexes(pageId) {
    const page = getPageData(pageId);
    return page ? Object.values(page.hexes) : [];
  }

  /**
   * Returns the hex record drawn by a path, with its page.
   *
   * @param {string} pathId Path object ID.
   * @returns {{pageId: string, key: string, hex: object}|null} Lookup result.
   */
  function getHexByPathId(pathId) {
    const entry = getIndex().get(pathId);
    if (!entry) {
      return null;
    }
    const [pageId, key] = entry;
    const hex = getHex(pageId, key);
    return hex ? { pageId, key, hex } : null;
  }

  /**
   * Stores a hex record, replacing any record at the same cell.
   *
   * @param {string} pageId Page ID.
   * @param {object} hex Hex record with row and col.
   * @returns {object} The stored record.
   */
  function putHex(pageId, hex) {
    const key = `${hex.row},${hex.col}`;
    const page = getPageData(pageId, true);
    const old = page.hexes[key];
    if (old && old.id !== hex.id) {
      getIndex().delete(old.id);
    }
    page.hexes[key] = hex;
    getIndex().set(hex.id, [pageId, key]);
    return hex;
  }

  /**
   * Removes a hex record (not its Roll20 objects).
   *
   * @param {string} pageId Page ID.
   * @param {string} key "row,col" key.
   * @returns {object|null} The removed record.
   */
  function deleteHexRecord(pageId, key) {
    const page = getPageData(pageId);
    const hex = page?.hexes[key];
    if (!hex) {
      return null;
    }
    delete page.hexes[key];
    getIndex().delete(hex.id);
    return hex;
  }

  // ---------------------------------------------------------------------------
  // Pending locations and undo
  // ---------------------------------------------------------------------------

  /**
   * Returns pending location token IDs on a page (tokens marked as locations
   * before the area under them was filled).
   *
   * @param {string} pageId Page ID.
   * @returns {string[]} Token IDs.
   */
  function getPendingLocations(pageId) {
    return Object.entries(getState().pendingLocations)
      .filter(([, page]) => page === pageId)
      .map(([tokenId]) => tokenId);
  }

  /**
   * Adds or removes a pending location.
   *
   * @param {string} tokenId Token ID.
   * @param {string|null} pageId Page ID, or null to remove.
   * @returns {void}
   */
  function setPendingLocation(tokenId, pageId) {
    const pending = getState().pendingLocations;
    if (pageId) {
      pending[tokenId] = pageId;
    } else {
      delete pending[tokenId];
    }
  }

  /**
   * Returns the record of the last fill, used by undo.
   *
   * @returns {object|null} Last fill record.
   */
  function getLastFill() {
    return getState().lastFill;
  }

  /**
   * Stores or clears the record of the last fill.
   *
   * @param {object|null} record Fill record.
   * @returns {void}
   */
  function setLastFill(record) {
    getState().lastFill = record;
  }

  /**
   * Returns the saved player-visible properties of tokens hidden under hexes.
   *
   * @returns {object} Map of token ID to { pageId, saved }.
   */
  function getCoveredTokens() {
    return getState().coveredTokens;
  }

  /**
   * Builds the hex grid for a page, including any calibration.
   *
   * @param {object} page Roll20 page.
   * @returns {object|null} Grid object, or null when the page has no hex grid.
   */
  function buildPageGrid(page) {
    const pageId = page.get('_id');
    return createGrid({
      gridType: page.get('grid_type'),
      // snapping_increment is 0 when snapping is off; the grid is still drawn at 1 unit.
      scale: Number(page.get('snapping_increment')) || 1,
      jumpgate: isJumpgate(),
      // Set by Jumpgate's map alignment tool.
      offsetX: Number(page.get('grid_offset_x')) || 0,
      offsetY: Number(page.get('grid_offset_y')) || 0,
      calibration: getPageData(pageId)?.calibration || null,
    });
  }

  /**
   * Returns everything needed to work on a page's hexes.
   *
   * @param {string} pageId Page ID.
   * @returns {{ok: true, pageId: string, page: object, grid: object}|{ok: false, reason: string}}
   *          Context, or the reason it is unavailable ('noPage' or 'notHex').
   */
  function getPageContext(pageId) {
    const page = pageId ? getObj('page', pageId) : null;
    if (!page) {
      return { ok: false, reason: 'noPage' };
    }
    const grid = buildPageGrid(page);
    if (!grid) {
      return { ok: false, reason: 'notHex' };
    }
    return { ok: true, pageId, page, grid };
  }

  // Hiding tokens' player-visible details while they are under a hex.
  //
  // Hexes hide the token image, but Roll20 draws nameplates, bars and auras
  // above the foreground layer, so a monster under a hex would still give its
  // position away. While a token's centre is under a covered (not glimpsed) hex,
  // its player-visible flags are switched off; the saved values are restored
  // when it is uncovered, moved out, or the setting is turned off.

  /**
   * Returns true when a token's centre is under a covered hex.
   *
   * @param {object} ctx Page context.
   * @param {object} token Roll20 graphic.
   * @returns {boolean} True when covered.
   */
  function isCovered(ctx, token) {
    if (token.get('layer') !== LAYER_TOKEN || token.get('_subtype') !== 'token') {
      return false;
    }
    const [row, col] = pixelToHex(ctx.grid, Number(token.get('left')), Number(token.get('top')));
    const hex = getHex(ctx.pageId, hexKey(row, col));
    return !!hex && !hex.glimpsed;
  }

  /**
   * Switches a token's player-visible details off, saving their values.
   *
   * @param {object} token Roll20 graphic.
   * @returns {void}
   */
  function hideDetails(token) {
    const covered = getCoveredTokens();
    const id = token.get('_id');
    if (covered[id]) {
      return;
    }
    const saved = {};
    const updates = {};
    for (const prop of COVERED_TOKEN_PROPS) {
      saved[prop] = token.get(prop) === true;
      updates[prop] = false;
    }
    covered[id] = { pageId: token.get('_pageid'), saved };
    token.set(updates);
  }

  /**
   * Restores a token's saved player-visible details.
   *
   * @param {string} tokenId Token ID.
   * @returns {void}
   */
  function restoreDetails(tokenId) {
    const covered = getCoveredTokens();
    const entry = covered[tokenId];
    if (!entry) {
      return;
    }
    delete covered[tokenId];
    const token = getObj('graphic', tokenId);
    if (token) {
      token.set({ ...entry.saved });
    }
  }

  /**
   * Keeps a covered token's details hidden when the GM switches one on while it
   * is covered: the new value is saved for when the token is uncovered.
   *
   * @param {object} token Roll20 graphic.
   * @param {object} prev Previous property values.
   * @returns {void}
   */
  function handleCoveredChange(token, prev) {
    const entry = getCoveredTokens()[token.get('_id')];
    if (!entry || !prev) {
      return;
    }
    const updates = {};
    for (const prop of COVERED_TOKEN_PROPS) {
      if (token.get(prop) === true && prev[prop] !== true) {
        entry.saved[prop] = true;
        updates[prop] = false;
      }
    }
    if (Object.keys(updates).length > 0) {
      token.set(updates);
    }
  }

  /**
   * Hides or restores one token's details to match whether it is covered.
   *
   * @param {object} token Roll20 graphic.
   * @returns {void}
   */
  function refreshToken(token) {
    const ctx = getPageContext(token.get('_pageid'));
    if (getConfig().hideCoveredTokens && ctx.ok && isCovered(ctx, token)) {
      hideDetails(token);
    } else {
      restoreDetails(token.get('_id'));
    }
  }

  /**
   * Hides or restores the details of every token on a page.
   *
   * @param {string} pageId Page ID.
   * @returns {void}
   */
  function refreshPage(pageId) {
    const ctx = getPageContext(pageId);
    const enabled = getConfig().hideCoveredTokens && ctx.ok;
    const covered = getCoveredTokens();
    for (const token of findObjs({ _type: 'graphic', _pageid: pageId, _subtype: 'token' })) {
      if (enabled && isCovered(ctx, token)) {
        hideDetails(token);
      } else if (covered[token.get('_id')]) {
        restoreDetails(token.get('_id'));
      }
    }
    // Forget tokens that were deleted while hidden.
    for (const [tokenId, entry] of Object.entries(covered)) {
      if (entry.pageId === pageId && !getObj('graphic', tokenId)) {
        delete covered[tokenId];
      }
    }
  }

  /**
   * Restores every hidden token in the game (used when the setting is turned off).
   *
   * @returns {void}
   */
  function restoreAll() {
    for (const tokenId of Object.keys(getCoveredTokens())) {
      restoreDetails(tokenId);
    }
  }

  // Named hexes and hidden location tokens.
  //
  // A hex can carry a name (shown to the GM as a label on the GM layer) and an
  // icon (a token hidden on the GM layer). Both are announced when the hex is
  // revealed, and the icon is moved back to the token layer.

  /**
   * Returns the token attached to a hex as its icon, if it still exists.
   *
   * @param {object} hex Hex record.
   * @returns {object|null} Roll20 graphic.
   */
  function getHexIcon(hex) {
    return hex.iconId ? getObj('graphic', hex.iconId) || null : null;
  }

  /**
   * Returns the name announced when a hex is discovered: the icon's name, or
   * the hex's own name.
   *
   * @param {object} hex Hex record.
   * @returns {string} Discovery name (empty when the hex is unnamed).
   */
  function getDiscoveryName(hex) {
    const icon = getHexIcon(hex);
    return toText(icon?.get('name')) || toText(hex.name);
  }

  /**
   * Removes a hex's GM-layer name label.
   *
   * @param {object} hex Hex record.
   * @returns {void}
   */
  function removeLabel(hex) {
    if (hex.nameId) {
      getObj('text', hex.nameId)?.remove();
      delete hex.nameId;
    }
  }

  /**
   * Sets or clears a hex's name and redraws its GM-layer label.
   *
   * @param {object} ctx Page context.
   * @param {object} hex Hex record.
   * @param {string} name New name (empty to clear).
   * @returns {void}
   */
  function setHexName(ctx, hex, name) {
    removeLabel(hex);
    const clean = toText(name).slice(0, MAX_NAME_LENGTH);
    if (!clean) {
      delete hex.name;
      return;
    }
    hex.name = clean;
    const [x, y] = hexToPixel(ctx.grid, hex.row, hex.col);
    const label = createObj('text', {
      _pageid: ctx.pageId,
      layer: LAYER_GM,
      left: x,
      top: y,
      text: clean,
      color: getConfig().labelColor,
    });
    if (label) {
      hex.nameId = label.get('_id');
    }
  }

  /**
   * Attaches a token to a hex as its hidden icon.
   *
   * @param {object} hex Hex record.
   * @param {object} token Roll20 graphic.
   * @returns {string} The token's layer before it was hidden (for undo).
   */
  function attachIcon(hex, token) {
    const previousLayer = token.get('layer');
    hex.iconId = token.get('_id');
    token.set('layer', LAYER_GM);
    setPendingLocation(hex.iconId, null);
    return previousLayer;
  }

  /**
   * Detaches a hex's icon and returns it to the token layer.
   *
   * @param {object} hex Hex record.
   * @param {boolean} [show=true] Move the icon back to the token layer.
   * @returns {void}
   */
  function detachIcon(hex, show = true) {
    const icon = getHexIcon(hex);
    if (icon && show) {
      icon.set('layer', LAYER_TOKEN);
    }
    delete hex.iconId;
  }

  /**
   * Returns the hex records on a page keyed by the ID of their icon.
   *
   * @param {string} pageId Page ID.
   * @returns {Map<string, object>} Map of icon ID to hex record.
   */
  function hexesByIcon(pageId) {
    const map = new Map();
    for (const hex of getPageHexes(pageId)) {
      if (hex.iconId) {
        map.set(hex.iconId, hex);
      }
    }
    return map;
  }

  /**
   * Returns location tokens waiting for a hex on a page, keyed by hex cell:
   * tokens marked with `mark`, plus (as in v1) tokens with the white-tower
   * status marker. Tokens already attached to a hex are ignored.
   *
   * @param {object} ctx Page context.
   * @returns {Map<string, object>} Map of "row,col" to Roll20 graphic.
   */
  function findLocationTokens(ctx) {
    const attached = hexesByIcon(ctx.pageId);
    const tokens = new Map();
    const consider = (token) => {
      if (!token || attached.has(token.get('_id'))) {
        return;
      }
      const [row, col] = pixelToHex(ctx.grid, token.get('left'), token.get('top'));
      tokens.set(hexKey(row, col), token);
    };

    for (const tokenId of getPendingLocations(ctx.pageId)) {
      const token = getObj('graphic', tokenId);
      if (token) {
        consider(token);
      } else {
        setPendingLocation(tokenId, null);
      }
    }
    for (const token of findObjs({ _type: 'graphic', _pageid: ctx.pageId })) {
      if (tokenHasMarker(token, LOCATION_MARKER)) {
        consider(token);
      }
    }
    return tokens;
  }

  /**
   * Marks tokens as hidden locations. A token already under a hex is attached
   * immediately; otherwise it waits for the next fill that covers it.
   *
   * @param {object} ctx Page context.
   * @param {object[]} tokens Roll20 graphics.
   * @returns {{attached: number, pending: number}} Counts.
   */
  function markLocations(ctx, tokens) {
    const attached = hexesByIcon(ctx.pageId);
    let attachedCount = 0;
    let pendingCount = 0;
    for (const token of tokens) {
      if (attached.has(token.get('_id'))) {
        continue;
      }
      const [row, col] = pixelToHex(ctx.grid, token.get('left'), token.get('top'));
      const hex = getHex(ctx.pageId, hexKey(row, col));
      if (hex && !hex.iconId) {
        attachIcon(hex, token);
        attachedCount++;
      } else {
        setPendingLocation(token.get('_id'), ctx.pageId);
        pendingCount++;
      }
    }
    return { attached: attachedCount, pending: pendingCount };
  }

  /**
   * Stops tokens being hidden locations. Attached tokens return to the token layer.
   *
   * @param {object} ctx Page context.
   * @param {object[]} tokens Roll20 graphics.
   * @returns {number} Number of tokens unmarked.
   */
  function unmarkLocations(ctx, tokens) {
    const attached = hexesByIcon(ctx.pageId);
    const pending = new Set(getPendingLocations(ctx.pageId));
    let count = 0;
    for (const token of tokens) {
      const id = token.get('_id');
      const hex = attached.get(id);
      if (hex) {
        detachIcon(hex);
        count++;
      } else if (pending.has(id)) {
        setPendingLocation(id, null);
        count++;
      }
    }
    return count;
  }

  // Polygon maths for Roll20 drawn shapes. Pure functions only: callers pass
  // plain property objects, so the module can be unit tested in Node.
  //
  // Both kinds of Roll20 path store points relative to their own bounding box
  // and are placed by their centre:
  //   - Legacy `path`: `_path` is a JSON list of SVG-like commands (M, L, Q, C),
  //     placed by left/top, sized by width/height, scaled by scaleX/scaleY.
  //   - Jumpgate `pathv2`: `points` is a JSON list of [x, y] pairs interpreted by
  //     `shape` (pol, free, rec, eli) and placed by x/y. It has no scale.
  // Both can be rotated by `rotation` degrees about their centre.

  const UNIT_PX = 70;
  const ELLIPSE_SEGMENTS = 32;
  const CURVE_SEGMENTS = 8;

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
   * Tests whether a point lies inside a polygon ring (even-odd rule). The ring
   * is treated as closed whether or not its last point repeats the first.
   *
   * @param {number[]} point [x, y].
   * @param {number[][]} ring Array of [x, y].
   * @returns {boolean} True when inside.
   */
  function pointInRing(point, ring) {
    const [x, y] = point;
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      const crosses = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (crosses) {
        inside = !inside;
      }
    }
    return inside;
  }

  /**
   * Tests whether a point lies inside any of a shape's rings (even-odd across
   * rings, so a ring drawn inside another makes a hole).
   *
   * @param {number[]} point [x, y].
   * @param {number[][][]} rings Array of rings.
   * @returns {boolean} True when inside.
   */
  function pointInShape(point, rings) {
    let inside = false;
    for (const ring of rings) {
      if (ring.length >= 3 && pointInRing(point, ring)) {
        inside = !inside;
      }
    }
    return inside;
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

    let ring;
    if (props.shape === 'rec') {
      ring = [
        [0, 0],
        [width, 0],
        [width, height],
        [0, height],
      ];
    } else if (props.shape === 'eli') {
      ring = ellipsePoints(width, height);
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
   * Builds the properties for a closed polygon as either kind of path.
   * Points are made relative to their bounding box, and the path is placed by
   * its centre, matching how Roll20 stores both path types.
   *
   * @param {number[][]} points Polygon corners in page pixels.
   * @param {boolean} jumpgate True to build a pathv2, false for a Legacy path.
   * @returns {object} Geometry properties for createObj.
   */
  function polygonPathProps(points, jumpgate) {
    const box = boundingBox(points);
    const width = box.right - box.left;
    const height = box.bottom - box.top;
    const cx = box.left + width / 2;
    const cy = box.top + height / 2;
    const round = (n) => Math.round(n * 1000) / 1000;
    const local = points.map(([x, y]) => [round(x - box.left), round(y - box.top)]);
    const closed = [...local, local[0]];

    if (jumpgate) {
      return {
        shape: 'pol',
        points: JSON.stringify(closed),
        x: cx,
        y: cy,
      };
    }

    const commands = closed.map(([x, y], i) => [i === 0 ? 'M' : 'L', x, y]);
    return {
      _path: JSON.stringify(commands),
      left: cx,
      top: cy,
      width,
      height,
    };
  }

  /**
   * Returns the centroid of a ring's distinct vertices.
   *
   * @param {number[][]} ring Array of [x, y].
   * @returns {number[]} [x, y].
   */
  function ringCentre(ring) {
    const pts = distinctVertices(ring);
    const sum = pts.reduce((acc, [x, y]) => [acc[0] + x, acc[1] + y], [0, 0]);
    return [sum[0] / pts.length, sum[1] / pts.length];
  }

  /**
   * Returns a ring's vertices with a repeated closing point removed.
   *
   * @param {number[][]} ring Array of [x, y].
   * @returns {number[][]} Distinct vertices.
   */
  function distinctVertices(ring) {
    if (ring.length > 1) {
      const first = ring[0];
      const last = ring.at(-1);
      if (Math.abs(first[0] - last[0]) < 0.01 && Math.abs(first[1] - last[1]) < 0.01) {
        return ring.slice(0, -1);
      }
    }
    return ring;
  }

  // Roll20 object access for drawn shapes. Jumpgate games draw `pathv2`
  // objects; Legacy games draw `path` objects. Everything that reads or writes a
  // path goes through this module so the rest of the mod never cares which.

  // Set when the foreground layer turns out to be unavailable, so later hexes
  // go straight to the token layer instead of failing one by one.
  let foregroundUnavailable = false;

  /**
   * Returns a path object of either type by ID.
   *
   * @param {string} id Object ID.
   * @param {string|null} [type] Known type, checked first.
   * @returns {object|null} Roll20 path or pathv2 object.
   */
  function getPathObject(id, type = null) {
    if (!id) {
      return null;
    }
    const types = activePathTypes();
    const order = type && types.includes(type) ? [type, ...types.filter((t) => t !== type)] : types;
    for (const t of order) {
      const obj = getObj(t, id);
      if (obj) {
        return obj;
      }
    }
    return null;
  }

  /**
   * Returns true when a Roll20 object is a path of either type.
   *
   * @param {object} obj Roll20 object.
   * @returns {boolean} True for path and pathv2.
   */
  function isPathObject(obj) {
    return !!obj && PATH_TYPES.includes(obj.get('_type'));
  }

  /**
   * Copies the properties the polygon module needs from a path.
   *
   * @param {object} obj Roll20 path or pathv2.
   * @returns {object} Plain properties including `type`.
   */
  function readPathProps(obj) {
    const type = obj.get('_type');
    const base = {
      type,
      pageId: obj.get('_pageid'),
      layer: obj.get('layer'),
      rotation: obj.get('rotation'),
      fill: obj.get('fill'),
      stroke: obj.get('stroke'),
      stroke_width: obj.get('stroke_width'),
    };
    if (type === PATH_TYPE_V2) {
      return {
        ...base,
        shape: obj.get('shape'),
        points: obj.get('points'),
        x: obj.get('x'),
        y: obj.get('y'),
      };
    }
    return {
      ...base,
      _path: obj.get('_path'),
      left: obj.get('left'),
      top: obj.get('top'),
      width: obj.get('width'),
      height: obj.get('height'),
      scaleX: obj.get('scaleX'),
      scaleY: obj.get('scaleY'),
    };
  }

  /**
   * Returns a path's outline as page-space rings.
   *
   * @param {object} obj Roll20 path or pathv2.
   * @returns {number[][][]} Rings.
   */
  function getPathRings(obj) {
    const props = readPathProps(obj);
    const page = getObj('page', props.pageId);
    return pathToRings(props, page ? { width: page.get('width'), height: page.get('height') } : {});
  }

  /**
   * Recreates a path from properties saved by readPathProps (used by undo).
   *
   * @param {object} props Saved properties.
   * @returns {object|null} New Roll20 object.
   */
  function recreatePath(props) {
    const { type, pageId, ...rest } = props;
    const attrs = { _pageid: pageId };
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined && value !== null) {
        attrs[key] = value;
      }
    }
    // A Legacy game cannot create pathv2 objects, and vice versa.
    const createType = type === PATH_TYPE_V2 && !isJumpgate() ? PATH_TYPE_LEGACY : type;
    return createObj(createType, attrs) || null;
  }

  /**
   * Returns the layer new hexes should be drawn on.
   *
   * @returns {string} Roll20 layer.
   */
  function getHexLayer() {
    const setting = getConfig().hexLayer;
    if (setting === 'objects' || foregroundUnavailable) {
      return LAYER_TOKEN;
    }
    return LAYER_FOREGROUND;
  }

  /**
   * Draws a hex outline as a path.
   *
   * The foreground layer is tried first (unless the GM chose the token layer);
   * if the game rejects it, the hex is drawn on the token layer instead and the
   * fallback is remembered for the rest of the session.
   *
   * @param {string} pageId Page ID.
   * @param {number[][]} corners Hex corners in page pixels.
   * @param {object} style Style with fill, stroke and strokeWidth.
   * @returns {{obj: object, fellBack: boolean}|null} New path, or null when it could not be created.
   */
  function createHexPath(pageId, corners, style) {
    const jumpgate = isJumpgate();
    const type = jumpgate ? PATH_TYPE_V2 : PATH_TYPE_LEGACY;
    const geometry = polygonPathProps(corners, jumpgate);
    const attrs = {
      ...geometry,
      _pageid: pageId,
      fill: style.fill,
      stroke: style.stroke,
      stroke_width: style.strokeWidth,
      controlledby: '',
    };

    const layer = getHexLayer();
    let obj = createObj(type, { ...attrs, layer });
    if (obj && obj.get('layer') === layer) {
      return { obj, fellBack: false };
    }

    if (layer === LAYER_FOREGROUND) {
      if (obj) {
        obj.remove();
      }
      foregroundUnavailable = true;
      obj = createObj(type, { ...attrs, layer: LAYER_TOKEN });
      return obj ? { obj, fellBack: true } : null;
    }
    return obj ? { obj, fellBack: false } : null;
  }

  /**
   * Removes a Roll20 object if it still exists.
   *
   * @param {object|null} obj Roll20 object.
   * @returns {void}
   */
  function safeRemove(obj) {
    if (obj) {
      try {
        obj.remove();
      } catch (err) {
        log(`Hexploration: could not remove object: ${err?.message || err}`);
      }
    }
  }

  /**
   * Returns every path of either type on a page.
   *
   * @param {string} pageId Page ID.
   * @returns {object[]} Roll20 path objects.
   */
  function getPagePaths(pageId) {
    return activePathTypes().flatMap((type) => findObjs({ _type: type, _pageid: pageId }));
  }

  /**
   * Returns the path types that can exist in this game. Jumpgate games can
   * hold both (old API-made paths survive); Legacy games only have `path`.
   *
   * @returns {string[]} Path types.
   */
  function activePathTypes() {
    return isJumpgate() ? PATH_TYPES : [PATH_TYPE_LEGACY];
  }

  // Creating, removing and maintaining hexes on a page: fill, inverse fill,
  // conceal, reset, rescan, calibrate and undo.

  /**
   * Returns the hex style from the current config.
   *
   * @returns {{fill: string, stroke: string, strokeWidth: number, maxDistance: number|null}} Style.
   */
  function currentStyle() {
    const config = getConfig();
    return {
      fill: config.fillColor,
      stroke: config.strokeColor,
      strokeWidth: config.strokeWidth,
      maxDistance: config.maxDistance,
    };
  }

  /**
   * Draws one hex and stores its record.
   *
   * @param {object} ctx Page context.
   * @param {number} row Hex row.
   * @param {number} col Hex column.
   * @param {object} style Hex style.
   * @param {object} [extra] Extra record fields (name, iconId…).
   * @returns {{hex: object, fellBack: boolean}|null} New record, or null on failure.
   */
  function drawHex(ctx, row, col, style, extra = {}) {
    const created = createHexPath(ctx.pageId, hexCorners(ctx.grid, row, col), style);
    if (!created) {
      return null;
    }
    const hex = { id: created.obj.get('_id'), type: created.obj.get('_type'), row, col, ...extra };
    if (Number.isInteger(style.maxDistance)) {
      hex.maxDistance = style.maxDistance;
    }
    putHex(ctx.pageId, hex);
    return { hex, fellBack: created.fellBack };
  }

  /**
   * Removes a hex: its record, its path and its name label. Its icon is moved
   * back to the token layer when `showIcon` is true, otherwise left hidden.
   *
   * @param {string} pageId Page ID.
   * @param {string} key "row,col" key.
   * @param {boolean} [showIcon=false] Return the icon to the token layer.
   * @returns {object|null} The removed record.
   */
  function removeHex(pageId, key, showIcon = false) {
    const hex = deleteHexRecord(pageId, key);
    if (!hex) {
      return null;
    }
    removeLabel(hex);
    if (showIcon) {
      detachIcon(hex);
    }
    safeRemove(getPathObject(hex.id, hex.type));
    return hex;
  }

  /**
   * Returns the cells whose centres lie inside any of the given paths.
   *
   * @param {object} ctx Page context.
   * @param {object[]} paths Roll20 path objects on the page.
   * @returns {number[][]} Array of [row, col], without duplicates.
   */
  function cellsInPaths(ctx, paths) {
    const seen = new Set();
    const cells = [];
    for (const path of paths) {
      const rings = getPathRings(path);
      if (rings.length === 0) {
        continue;
      }
      const box = boundingBox(rings.flat());
      for (const [row, col] of hexesInBox(ctx.grid, box)) {
        const key = hexKey(row, col);
        if (!seen.has(key) && pointInShape(hexToPixel(ctx.grid, row, col), rings)) {
          seen.add(key);
          cells.push([row, col]);
        }
      }
    }
    return cells;
  }

  /**
   * Returns every cell on the page except those inside the given paths.
   *
   * @param {object} ctx Page context.
   * @param {object[]} paths Roll20 path objects to leave uncovered.
   * @returns {number[][]} Array of [row, col].
   */
  function cellsOutsidePaths(ctx, paths) {
    const omit = new Set(cellsInPaths(ctx, paths).map(([r, c]) => hexKey(r, c)));
    const width = Number(ctx.page.get('width')) * 70;
    const height = Number(ctx.page.get('height')) * 70;
    return hexesCoveringPage(ctx.grid, width, height).filter(([r, c]) => !omit.has(hexKey(r, c)));
  }

  /**
   * Covers cells with hexes. Existing hexes are restyled rather than replaced,
   * so their names and icons are kept. Location tokens in a covered cell are
   * attached as icons. Work is batched; `onDone` receives a summary.
   *
   * @param {object} ctx Page context.
   * @param {number[][]} cells Cells to cover.
   * @param {object} options Fill options.
   * @param {object[]} [options.sources] Saved properties of the polygons used (for undo).
   * @param {string} options.kind Fill kind for undo ('fill', 'fillInverse', 'conceal').
   * @param {(summary: object) => void} options.onDone Completion callback.
   * @returns {{started: boolean, reason?: string}} Whether the fill started.
   */
  function fillCells(ctx, cells, { sources = [], kind, onDone }) {
    if (cells.length > MAX_FILL_HEXES) {
      return { started: false, reason: 'tooMany' };
    }

    const style = currentStyle();
    const locations = findLocationTokens(ctx);
    const record = {
      pageId: ctx.pageId,
      kind,
      time: Date.now(),
      created: [],
      restyled: [],
      icons: [],
      sources,
    };
    const summary = { created: 0, restyled: 0, icons: 0, failed: 0, fellBack: false };

    runInBatches(
      cells,
      BATCH_SIZE,
      ([row, col]) => {
        const key = hexKey(row, col);
        let hex = getHex(ctx.pageId, key);
        const existingPath = hex ? getPathObject(hex.id, hex.type) : null;

        if (hex && existingPath) {
          record.restyled.push({
            key,
            fill: existingPath.get('fill'),
            stroke: existingPath.get('stroke'),
            strokeWidth: existingPath.get('stroke_width'),
            maxDistance: hex.maxDistance ?? null,
            glimpsed: hex.glimpsed === true,
          });
          existingPath.set({
            fill: style.fill,
            stroke: style.stroke,
            stroke_width: style.strokeWidth,
          });
          delete hex.glimpsed;
          if (Number.isInteger(style.maxDistance)) {
            hex.maxDistance = style.maxDistance;
          } else {
            delete hex.maxDistance;
          }
          summary.restyled++;
        } else {
          if (hex) {
            // The record outlived its path (deleted while the API was off).
            deleteHexRecord(ctx.pageId, key);
          }
          const drawn = drawHex(ctx, row, col, style);
          if (!drawn) {
            summary.failed++;
            return;
          }
          hex = drawn.hex;
          summary.fellBack = summary.fellBack || drawn.fellBack;
          record.created.push({ key, id: hex.id });
          summary.created++;
        }

        const token = locations.get(key);
        if (token && !hex.iconId) {
          record.icons.push({ id: token.get('_id'), layer: token.get('layer') });
          attachIcon(hex, token);
          summary.icons++;
        }
      },
      (errors) => {
        summary.failed += errors;
        setLastFill(record);
        onDone(summary);
      }
    );

    return { started: true };
  }

  /**
   * Removes every hex on a page, returning icons to the token layer. Page
   * settings and calibration are kept.
   *
   * @param {object} ctx Page context.
   * @param {(count: number) => void} onDone Completion callback.
   * @returns {void}
   */
  function clearPage(ctx, onDone) {
    const keys = getPageHexes(ctx.pageId).map((hex) => hexKey(hex.row, hex.col));
    for (const tokenId of getPendingLocations(ctx.pageId)) {
      setPendingLocation(tokenId, null);
    }
    const last = getLastFill();
    if (last?.pageId === ctx.pageId) {
      setLastFill(null);
    }
    runInBatches(
      keys,
      BATCH_SIZE,
      (key) => removeHex(ctx.pageId, key, true),
      () => onDone(keys.length)
    );
  }

  /**
   * Reverses the last fill: removes the hexes it created, restores the style
   * of hexes it restyled, returns icons it hid, and redraws the polygons it used.
   *
   * @returns {{ok: boolean, reason?: string, removed?: number, restored?: number, pageId?: string}} Result.
   */
  function undoLastFill() {
    const record = getLastFill();
    if (!record) {
      return { ok: false, reason: 'nothingToUndo' };
    }
    setLastFill(null);
    const page = getObj('page', record.pageId);
    if (!page) {
      return { ok: false, reason: 'noPage' };
    }

    let removed = 0;
    for (const { key, id } of record.created || []) {
      const hex = getHex(record.pageId, key);
      if (hex && hex.id === id) {
        removeHex(record.pageId, key, false);
        removed++;
      }
    }

    let restored = 0;
    for (const prev of record.restyled || []) {
      const hex = getHex(record.pageId, prev.key);
      const path = hex ? getPathObject(hex.id, hex.type) : null;
      if (path) {
        path.set({ fill: prev.fill, stroke: prev.stroke, stroke_width: prev.strokeWidth });
        if (Number.isInteger(prev.maxDistance)) {
          hex.maxDistance = prev.maxDistance;
        } else {
          delete hex.maxDistance;
        }
        if (prev.glimpsed) {
          hex.glimpsed = true;
        }
        restored++;
      }
    }

    for (const { id, layer } of record.icons || []) {
      const token = getObj('graphic', id);
      if (token) {
        for (const hex of getPageHexes(record.pageId)) {
          if (hex.iconId === id) {
            delete hex.iconId;
          }
        }
        token.set('layer', layer || LAYER_TOKEN);
      }
    }

    for (const props of record.sources || []) {
      recreatePath(props);
    }

    return { ok: true, removed, restored, pageId: record.pageId };
  }

  /**
   * Captures the polygons used for a fill so undo can redraw them, then deletes them.
   *
   * @param {object[]} paths Roll20 path objects.
   * @returns {object[]} Saved properties.
   */
  function consumeSourcePaths(paths) {
    // A selected path may itself be a hex; only plain drawings are consumed.
    const drawings = paths.filter((path) => !getHexByPathId(path.get('_id')));
    const sources = drawings.map(readPathProps);
    for (const path of drawings) {
      safeRemove(path);
    }
    return sources;
  }

  /**
   * Returns the hex a path draws, judged by its shape: a six-cornered polygon
   * centred on a hex cell and roughly the size of a hex.
   *
   * @param {object} ctx Page context.
   * @param {object} path Roll20 path object.
   * @returns {number[]|null} [row, col], or null when the path is not a hex.
   */
  function matchHexShape(ctx, path) {
    const rings = getPathRings(path);
    if (rings.length !== 1) {
      return null;
    }
    const vertices = distinctVertices(rings[0]);
    if (vertices.length !== 6) {
      return null;
    }
    const [x, y] = ringCentre(vertices);
    const [row, col] = pixelToHex(ctx.grid, x, y);
    const [cx, cy] = hexToPixel(ctx.grid, row, col);
    if (Math.hypot(x - cx, y - cy) > ctx.grid.colStep * RESCAN_CENTRE_TOLERANCE) {
      return null;
    }
    const actual = boundingBox(vertices);
    const expected = boundingBox(hexCorners(ctx.grid, row, col));
    const ratioW = (actual.right - actual.left) / (expected.right - expected.left);
    const ratioH = (actual.bottom - actual.top) / (expected.bottom - expected.top);
    if (ratioW < 0.75 || ratioW > 1.25 || ratioH < 0.75 || ratioH > 1.25) {
      return null;
    }
    return [row, col];
  }

  /**
   * Rebuilds a page's hex list from what is actually on the page:
   *  - drops records whose path is gone, and label/icon links that are broken;
   *  - re-files hexes whose cell changed (after calibration);
   *  - adopts hex-shaped paths the mod does not know about (duplicated pages,
   *    Legacy games copied to Jumpgate);
   *  - re-links GM-layer labels and white-tower icons sitting on hexes.
   *
   * @param {object} ctx Page context.
   * @returns {{kept: number, dropped: number, moved: number, adopted: number, labels: number, icons: number}} Counts.
   */
  function rescanPage(ctx) {
    const counts = { kept: 0, dropped: 0, moved: 0, adopted: 0, labels: 0, icons: 0 };
    const pageData = getPageData(ctx.pageId, true);

    // 1. Check existing records.
    for (const hex of Object.values(pageData.hexes)) {
      const key = hexKey(hex.row, hex.col);
      const path = getPathObject(hex.id, hex.type);
      if (!path) {
        removeLabel(hex);
        deleteHexRecord(ctx.pageId, key);
        counts.dropped++;
        continue;
      }
      hex.type = path.get('_type');
      if (hex.nameId && !getObj('text', hex.nameId)) {
        delete hex.nameId;
      }
      if (hex.iconId && !getHexIcon(hex)) {
        delete hex.iconId;
      }
      const cell = matchHexShape(ctx, path);
      if (
        cell &&
        hexKey(cell[0], cell[1]) !== key &&
        !getHex(ctx.pageId, hexKey(cell[0], cell[1]))
      ) {
        deleteHexRecord(ctx.pageId, key);
        putHex(ctx.pageId, { ...hex, row: cell[0], col: cell[1] });
        counts.moved++;
      } else {
        counts.kept++;
      }
    }

    // 2. Adopt unknown hex-shaped paths.
    for (const path of getPagePaths(ctx.pageId)) {
      const id = path.get('_id');
      if (getHexByPathId(id)) {
        continue;
      }
      const cell = matchHexShape(ctx, path);
      if (!cell || getHex(ctx.pageId, hexKey(cell[0], cell[1]))) {
        continue;
      }
      putHex(ctx.pageId, { id, type: path.get('_type'), row: cell[0], col: cell[1] });
      counts.adopted++;
    }

    // 3. Re-link GM-layer labels sitting on hex centres.
    const linkedLabels = new Set(
      getPageHexes(ctx.pageId)
        .map((hex) => hex.nameId)
        .filter(Boolean)
    );
    for (const text of findObjs({ _type: 'text', _pageid: ctx.pageId, layer: LAYER_GM })) {
      if (linkedLabels.has(text.get('_id'))) {
        continue;
      }
      const x = Number(text.get('left'));
      const y = Number(text.get('top'));
      const [row, col] = pixelToHex(ctx.grid, x, y);
      const [cx, cy] = hexToPixel(ctx.grid, row, col);
      const hex = getHex(ctx.pageId, hexKey(row, col));
      if (hex && !hex.nameId && Math.hypot(x - cx, y - cy) <= RESCAN_LABEL_TOLERANCE) {
        hex.nameId = text.get('_id');
        hex.name = String(text.get('text') || '').trim() || hex.name;
        counts.labels++;
      }
    }

    // 4. Re-link hidden white-tower icons.
    const linkedIcons = new Set(
      getPageHexes(ctx.pageId)
        .map((hex) => hex.iconId)
        .filter(Boolean)
    );
    for (const token of findObjs({ _type: 'graphic', _pageid: ctx.pageId, layer: LAYER_GM })) {
      if (linkedIcons.has(token.get('_id')) || !tokenHasMarker(token, LOCATION_MARKER)) {
        continue;
      }
      const [row, col] = pixelToHex(ctx.grid, token.get('left'), token.get('top'));
      const hex = getHex(ctx.pageId, hexKey(row, col));
      if (hex && !hex.iconId) {
        hex.iconId = token.get('_id');
        counts.icons++;
      }
    }

    return counts;
  }

  /**
   * Calibrates a page's grid from tokens snapped to hex centres, then rescans
   * so existing hexes are filed under their corrected cells.
   *
   * @param {object} ctx Page context.
   * @param {object[]} tokens One or two Roll20 graphics.
   * @returns {{ok: boolean, calibration?: object, counts?: object}} Result.
   */
  function calibratePage(ctx, tokens) {
    const points = tokens.slice(0, 2).map((t) => [Number(t.get('left')), Number(t.get('top'))]);
    // Calibrate against the uncalibrated profile so repeated calibration does not drift.
    setCalibration(ctx.pageId, null);
    const base = buildPageGrid(ctx.page);
    const calibration = calibrateGrid(base, points);
    if (!calibration) {
      return { ok: false };
    }
    setCalibration(ctx.pageId, calibration);
    const fresh = { ...ctx, grid: buildPageGrid(ctx.page) };
    return { ok: true, calibration, counts: rescanPage(fresh) };
  }

  /**
   * Clears a page's calibration and rescans.
   *
   * @param {object} ctx Page context.
   * @returns {object} Rescan counts.
   */
  function resetCalibration(ctx) {
    setCalibration(ctx.pageId, null);
    return rescanPage({ ...ctx, grid: buildPageGrid(ctx.page) });
  }

  /**
   * Removes stored hexes whose paths no longer exist, on every page. Run on
   * startup, since paths deleted while the API was off fire no events.
   *
   * @returns {{dropped: number, pages: number}} Counts.
   */
  function pruneMissingHexes() {
    let dropped = 0;
    let pages = 0;
    for (const pageId of getPageIds()) {
      if (!getObj('page', pageId)) {
        dropped += getPageHexes(pageId).length;
        deletePageData(pageId);
        pages++;
        continue;
      }
      for (const hex of getPageHexes(pageId)) {
        if (!getPathObject(hex.id, hex.type)) {
          deleteHexRecord(pageId, hexKey(hex.row, hex.col));
          dropped++;
        }
      }
    }
    return { dropped, pages };
  }

  // Journal handouts: the Help handout and the Command Deck.

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
    code: 'font-family:monospace;color:#f3d48b;white-space:nowrap;',
    link: `color:${COLOR_ACCENT};`,
    footer: `color:${COLOR_MUTED};font-size:0.85em;text-align:center;margin-top:16px;border-top:1px solid ${COLOR_BORDER};padding-top:8px;`,
    btn: `background:${COLOR_BUTTON_BG};color:${COLOR_BUTTON_TEXT};padding:3px 9px;border-radius:3px;text-decoration:none;font-size:0.9em;display:inline-block;margin:2px 3px;font-weight:bold;`,
    btnDark: `background:#2c4034;color:${COLOR_TEXT};border:1px solid #4d6b56;padding:3px 9px;border-radius:3px;text-decoration:none;font-size:0.9em;display:inline-block;margin:2px 3px;`,
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
   * Builds a paragraph list from a translated array.
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

    const commands = [
      ['', 'menu'],
      ['fill', 'fill'],
      ['fill inverse', 'fillInverse'],
      ['undo', 'undo'],
      ['reveal', 'reveal'],
      ['reveal page', 'revealPage'],
      ['conceal', 'conceal'],
      ['explore', 'explore'],
      ['reset page', 'resetPage'],
      ['name <text>', 'name'],
      ['mark', 'mark'],
      ['unmark', 'unmark'],
      ['set <setting> <value>', 'set'],
      ['page set <setting> <value>', 'pageSet'],
      ['page clear', 'pageClear'],
      ['rescan', 'rescan'],
      ['calibrate', 'calibrate'],
      ['calibrate reset', 'calibrateReset'],
      ['status', 'status'],
      ['journal rebuild', 'journal'],
      ['help', 'help'],
    ].map(([cmd, key]) => [code(`${COMMAND} ${cmd}`.trim()), escapeHtml(t(`help.${key}`, lang))]);

    const settings = Object.keys(DEFAULT_CONFIG).map((key) => [
      code(key),
      escapeHtml(t(`settings.${key}.label`, lang)),
      escapeHtml(t(`settings.${key}.desc`, lang)) +
        (PAGE_SETTING_KEYS.includes(key) ? ` <em>${h('settings.perPage')}</em>` : ''),
    ]);

    const legacyCommands = [
      ['!hexploration_showMenuMain', `${COMMAND}`],
      ['!hexploration_fillPoly', `${COMMAND} fill`],
      ['!hexploration_fillInversePoly', `${COMMAND} fill inverse`],
      ['!hexploration_hexModifyProperty name&&…', `${COMMAND} name …`],
      ['!hexploration_configModifyProperty …', `${COMMAND} set …`],
    ].map(([v1, v2]) => [code(v1), code(v2)]);

    const locales = SUPPORTED_LOCALES.map((c) => escapeHtml(LOCALE_LABELS[c])).join(', ');
    const { original, maintainer } = AUTHOR_LINKS;

    return `<div style="${STYLE.outer}${getDirectionStyle(lang)}">
    <div style="${STYLE.header}">
      <h1 style="${STYLE.h1}">⬢ ${SCRIPT_NAME} ⬢</h1>
      <p style="${STYLE.subtitle}">${h('versionLabel')} ${SCRIPT_VERSION} • ${h('subtitle')}</p>
    </div>
    ${section('overview', `<p style="${STYLE.p}">${h('overview.body')}</p><p style="${STYLE.p}">${link(DEMO_GIF_URL, t('handout.overview.demo', lang))}</p>`)}
    ${section('quickStart', list(raw('quickStart.steps'), true))}
    ${section('commands', `<p style="${STYLE.p}">${h('commands.intro')}</p>${table([t('handout.commands.colCommand', lang), t('handout.commands.colDesc', lang)], commands)}`)}
    ${section('revealing', list(raw('revealing.points')))}
    ${section('locations', list(raw('locations.points')))}
    ${section('settings', `<p style="${STYLE.p}">${h('settings.intro')}</p>${table([t('handout.settings.colKey', lang), t('handout.settings.colName', lang), t('handout.settings.colDesc', lang)], settings)}`)}
    ${section('jumpgate', list(raw('jumpgate.points')))}
    ${section('upgrading', `${list(raw('upgrading.points'))}${table([t('handout.upgrading.colV1', lang), t('handout.upgrading.colV2', lang)], legacyCommands)}`)}
    ${section('troubleshooting', list(raw('troubleshooting.points')))}
    ${section('languages', `<p style="${STYLE.p}">${h('languages.body')}</p><p style="${STYLE.p};font-size:0.85em">${locales}</p>`)}
    ${section(
      'credits',
      `<p style="${STYLE.p}">${h('credits.original')} ${link(original.profile, original.name)} • ${link(original.marketplace, t('handout.credits.marketplace', lang))}</p>
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
    const btn = (key, cmd, dark = false) =>
      `<a href="${escapeHtml(`${COMMAND} ${cmd}`.trim())}" style="${dark ? STYLE.btnDark : STYLE.btn}">${escapeHtml(tr(`buttons.${key}`))}</a>`;
    const group = (titleKey, descKey, buttons) =>
      `<div style="${STYLE.section}">${escapeHtml(tr(titleKey))}</div><div style="${STYLE.desc}">${escapeHtml(tr(descKey))}</div><div>${buttons.join('')}</div>`;

    return `<div style="${STYLE.outer}${getDirectionStyle(lang)}">
    <div style="${STYLE.header}">
      <h1 style="${STYLE.h1}">⬢ ${SCRIPT_NAME} ⬢</h1>
      <p style="${STYLE.subtitle}">${escapeHtml(tr('deck.subtitle'))} • v${SCRIPT_VERSION}</p>
    </div>
    ${group('menu.draw', 'deck.drawDesc', [btn('fill', 'fill'), btn('fillInverse', 'fill inverse'), btn('undo', 'undo', true)])}
    ${group('menu.reveal', 'deck.revealDesc', [btn('reveal', 'reveal'), btn('conceal', 'conceal'), btn('explore', 'explore'), btn('revealPage', 'reveal page', true), btn('resetPage', 'reset page', true)])}
    ${group('menu.locations', 'deck.locationsDesc', [btn('mark', 'mark'), btn('unmark', 'unmark', true), btn('name', `name ?{${tr('prompts.name')}}`)])}
    ${group('menu.tools', 'deck.toolsDesc', [btn('settings', 'set', true), btn('pageSettings', 'page', true), btn('status', 'status', true), btn('rescan', 'rescan', true), btn('calibrate', 'calibrate', true), btn('calibrateReset', 'calibrate reset', true), btn('help', 'help', true), btn('menu', '', true)])}
    <div style="${STYLE.footer}">${escapeHtml(tr('deck.footer', { help: HANDOUT_HELP_NAME }))}</div>
  </div>`;
  }

  /**
   * Creates or updates a handout, removing duplicates with the same name.
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
   * Creates or refreshes the Help and Command Deck handouts in the current language.
   *
   * @returns {void}
   */
  function installHandouts() {
    const lang = getConfig().language;
    upsertHandout(HANDOUT_HELP_NAME, buildHelpHtml(lang));
    upsertHandout(HANDOUT_DECK_NAME, buildDeckHtml(lang));
  }

  // Revealing hexes: when tokens move, from GM commands, and through the public API.

  /**
   * Returns true when a token should reveal hexes under the page's settings.
   *
   * @param {object} token Roll20 graphic.
   * @param {object} settings Effective page settings.
   * @returns {boolean} True when the token reveals.
   */
  function tokenReveals(token, settings) {
    if (!token || token.get('_subtype') !== 'token' || token.get('layer') !== LAYER_TOKEN) {
      return false;
    }
    switch (settings.revealBy) {
      case 'all':
        return true;
      case 'characters':
        return !!token.get('represents');
      default:
        return getTokenControllers(token).some((id) => id === 'all' || !playerIsGM(id));
    }
  }

  /**
   * Announces a discovered location.
   *
   * @param {object} ctx Page context.
   * @param {object} hex Hex record (before removal).
   * @param {string} name Location name.
   * @param {string} imgsrc Icon image URL (may be empty).
   * @param {object} settings Effective page settings.
   * @returns {void}
   */
  function announceDiscovery(ctx, hex, name, imgsrc, settings) {
    if (name && settings.announce !== 'off') {
      const lang = getConfig().language;
      const img = imgsrc
        ? `<div style="text-align:center"><img src="${escapeHtml(imgsrc)}" style="max-height:48px;max-width:48px"></div>`
        : '';
      const html = buildCard(
        t('discovery.title', lang),
        `${img}<div style="text-align:center;font-weight:bold;font-size:1.1em">${escapeHtml(name)}</div>`
      );
      const prefix = settings.announce === 'gm' ? '/w gm ' : '';
      sendChat(SCRIPT_NAME, `${prefix}${html}`);
    }
    if (name && settings.pingDiscoveries) {
      const [x, y] = hexToPixel(ctx.grid, hex.row, hex.col);
      sendPing(x, y, ctx.pageId, null, true);
    }
  }

  /**
   * Reveals one hex: removes it and its label, shows its icon, and announces
   * it when named.
   *
   * @param {object} ctx Page context.
   * @param {string} key "row,col" key.
   * @param {object} settings Effective page settings.
   * @param {object} [options] Options.
   * @param {number} [options.distance=0] Distance from the revealing token (for maxDistance).
   * @param {boolean} [options.announce=true] Announce named discoveries.
   * @returns {boolean} True when a hex was revealed.
   */
  function revealHex(ctx, key, settings, { distance = 0, announce = true } = {}) {
    const hex = getHex(ctx.pageId, key);
    if (!hex) {
      return false;
    }
    if (distance > 0 && Number.isInteger(hex.maxDistance) && distance > hex.maxDistance) {
      return false;
    }

    const name = getDiscoveryName(hex);
    const icon = getHexIcon(hex);
    const imgsrc = icon ? toText(icon.get('imgsrc')) : '';
    removeHex(ctx.pageId, key, false);
    if (icon) {
      icon.set({ layer: LAYER_TOKEN, showname: true });
    }
    if (announce) {
      announceDiscovery(ctx, hex, name, imgsrc, settings);
    }
    return true;
  }

  /**
   * Turns a hex see-through (glimpse mode) without revealing it.
   *
   * @param {object} ctx Page context.
   * @param {string} key "row,col" key.
   * @param {number} distance Distance from the revealing token.
   * @returns {boolean} True when the hex changed.
   */
  function glimpseHex(ctx, key, distance) {
    const hex = getHex(ctx.pageId, key);
    if (!hex || hex.glimpsed) {
      return false;
    }
    if (Number.isInteger(hex.maxDistance) && distance > hex.maxDistance) {
      return false;
    }
    const path = getPathObject(hex.id, hex.type);
    if (!path) {
      return false;
    }
    path.set('fill', getConfig().glimpseColor);
    hex.glimpsed = true;
    return true;
  }

  /**
   * Returns true when line of sight from one hex to another is blocked by a
   * covered hex. Glimpsed hexes have been seen through, so they do not block.
   *
   * @param {object} ctx Page context.
   * @param {number[]} from [row, col].
   * @param {number[]} to [row, col].
   * @returns {boolean} True when blocked.
   */
  function isBlocked(ctx, from, to) {
    return hexesBetween(ctx.grid, from, to).some(([r, c]) => {
      const hex = getHex(ctx.pageId, hexKey(r, c));
      return hex && !hex.glimpsed;
    });
  }

  /**
   * Parses a token's lastmove into points.
   *
   * @param {string} lastmove Roll20 lastmove ("x1,y1,x2,y2,…").
   * @returns {number[][]} Array of [x, y].
   */
  function parseLastMove(lastmove) {
    const nums = toText(lastmove)
      .split(',')
      .map(Number)
      .filter((n) => Number.isFinite(n));
    const points = [];
    for (let i = 0; i + 1 < nums.length; i += 2) {
      points.push([nums[i], nums[i + 1]]);
    }
    return points;
  }

  /**
   * Returns the cells a token passed through on its last move, in order, plus
   * every cell it now covers.
   *
   * @param {object} ctx Page context.
   * @param {object} token Roll20 graphic.
   * @param {object|null} prev Previous token properties, when known.
   * @param {boolean} followPath Include the route travelled.
   * @returns {number[][]} Array of [row, col], without duplicates.
   */
  function travelledCells(ctx, token, prev, followPath) {
    const current = [Number(token.get('left')), Number(token.get('top'))];
    const cells = [];

    if (
      followPath &&
      prev &&
      Number.isFinite(Number(prev.left)) &&
      Number.isFinite(Number(prev.top))
    ) {
      const start = [Number(prev.left), Number(prev.top)];
      // lastmove holds the start point and any waypoints of the latest drag. It
      // is only trusted when it starts where the token was; moves made by other
      // mods leave a stale lastmove behind.
      const waypoints = parseLastMove(token.get('lastmove'));
      const startsHere =
        waypoints.length > 0 &&
        Math.abs(waypoints[0][0] - start[0]) < 1 &&
        Math.abs(waypoints[0][1] - start[1]) < 1;
      const route = startsHere ? [...waypoints, current] : [start, current];
      for (let i = 1; i < route.length; i++) {
        cells.push(...hexesAlongSegment(ctx.grid, route[i - 1], route[i]));
      }
    }

    cells.push(
      ...hexesUnderToken(
        ctx.grid,
        current[0],
        current[1],
        Number(token.get('width')) || 0,
        Number(token.get('height')) || 0
      )
    );

    const seen = new Set();
    return cells.filter(([r, c]) => {
      const key = hexKey(r, c);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Reveals around a list of origin cells using the page's settings.
   *
   * @param {object} ctx Page context.
   * @param {number[][]} origins Cells the token occupied, in order.
   * @param {object} settings Effective page settings.
   * @returns {number} Number of hexes revealed or glimpsed.
   */
  function revealFromCells(ctx, origins, settings) {
    let changed = 0;
    for (const origin of origins) {
      if (revealHex(ctx, hexKey(origin[0], origin[1]), settings)) {
        changed++;
      }
      for (const cell of hexesWithin(ctx.grid, origin[0], origin[1], settings.revealDistance)) {
        const key = hexKey(cell[0], cell[1]);
        if (!getHex(ctx.pageId, key)) {
          continue;
        }
        if (settings.lineOfSight && isBlocked(ctx, origin, cell)) {
          continue;
        }
        const distance = hexDistance(ctx.grid, origin, cell);
        const done =
          settings.revealMode === 'glimpse'
            ? glimpseHex(ctx, key, distance)
            : revealHex(ctx, key, settings, { distance });
        if (done) {
          changed++;
        }
      }
    }
    return changed;
  }

  /**
   * Reveals the hexes a token has moved through and can now see.
   *
   * @param {object} token Roll20 graphic.
   * @param {object|null} [prev] Previous token properties from a change event.
   * @param {boolean} [force=false] Skip the "which tokens reveal" check.
   * @returns {number} Number of hexes revealed or glimpsed.
   */
  function revealAroundToken(token, prev = null, force = false) {
    const pageId = token?.get('_pageid');
    if (!pageId || getPageHexes(pageId).length === 0) {
      return 0;
    }
    const ctx = getPageContext(pageId);
    if (!ctx.ok) {
      return 0;
    }
    const settings = getPageSettings(pageId);
    if (!force && !tokenReveals(token, settings)) {
      return 0;
    }
    return revealFromCells(ctx, travelledCells(ctx, token, prev, settings.revealPath), settings);
  }

  /**
   * Handles a graphic change event: reveals when a token moves or arrives on
   * the token layer.
   *
   * @param {object} token Roll20 graphic.
   * @param {object} prev Previous property values.
   * @returns {void}
   */
  function handleTokenChange(token, prev) {
    const moved = prev && (prev.left !== token.get('left') || prev.top !== token.get('top'));
    const surfaced =
      prev && prev.layer !== token.get('layer') && token.get('layer') === LAYER_TOKEN;
    const resized =
      prev && (prev.width !== token.get('width') || prev.height !== token.get('height'));
    handleCoveredChange(token, prev);
    const layerChanged = prev && prev.layer !== token.get('layer');
    if (moved || surfaced || resized) {
      if (revealAroundToken(token, moved ? prev : null) > 0) {
        // Reveals may uncover other tokens as well as this one.
        refreshPage(token.get('_pageid'));
        return;
      }
    }
    if (moved || layerChanged) {
      refreshToken(token);
    }
  }

  /**
   * Reveals every hex on a page without announcements.
   *
   * @param {object} ctx Page context.
   * @param {(count: number) => void} onDone Completion callback.
   * @returns {void}
   */
  function revealPage(ctx, onDone) {
    const settings = getPageSettings(ctx.pageId);
    const keys = getPageHexes(ctx.pageId).map((hex) => hexKey(hex.row, hex.col));
    let count = 0;
    runInBatches(
      keys,
      BATCH_SIZE,
      (key) => {
        if (revealHex(ctx, key, settings, { announce: false })) {
          count++;
        }
      },
      () => {
        refreshPage(ctx.pageId);
        onDone(count);
      }
    );
  }

  // Settings shown in the menu, in order, with how to prompt for them.
  const SETTING_ROWS = [
    { key: 'hexLayer', options: HEX_LAYER_OPTIONS },
    { key: 'fillColor', color: true },
    { key: 'strokeColor', color: true },
    { key: 'labelColor', color: true },
    { key: 'glimpseColor', color: true },
    { key: 'strokeWidth' },
    { key: 'maxDistance' },
    { key: 'revealDistance' },
    { key: 'lineOfSight', options: ['on', 'off'] },
    { key: 'revealPath', options: ['on', 'off'] },
    { key: 'revealBy', options: REVEAL_BY_OPTIONS },
    { key: 'revealMode', options: REVEAL_MODE_OPTIONS },
    { key: 'announce', options: ANNOUNCE_OPTIONS },
    { key: 'pingDiscoveries', options: ['on', 'off'] },
    { key: 'hideCoveredTokens', options: ['on', 'off'] },
    { key: 'language' },
  ];

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
   * Formats a setting value for display.
   *
   * @param {string} key Setting key.
   * @param {*} value Setting value.
   * @returns {string} Display text.
   */
  function formatValue(key, value) {
    if (typeof value === 'boolean') {
      return tr(value ? 'values.on' : 'values.off');
    }
    if (value === null || value === undefined) {
      return tr('values.none');
    }
    if (key === 'language') {
      return LOCALE_LABELS[value] || value;
    }
    if (['hexLayer', 'revealBy', 'revealMode', 'announce'].includes(key)) {
      return tr(`values.${key}.${value}`);
    }
    return String(value);
  }

  /**
   * Builds a Roll20 query prompting for a setting's new value.
   *
   * @param {object} row Setting row definition.
   * @param {*} current Current value.
   * @returns {string} Query text.
   */
  function settingQuery(row, current) {
    const label = tr(`settings.${row.key}.label`).replaceAll(/[|}]/g, '');
    if (row.options) {
      return `?{${label}|${row.options.join('|')}}`;
    }
    if (row.key === 'language') {
      return `?{${label}|${SUPPORTED_LOCALES.join('|')}}`;
    }
    const shown = current === null || current === undefined ? '' : String(current);
    return `?{${label}|${shown.replaceAll(/[|}]/g, '')}}`;
  }

  // ---------------------------------------------------------------------------
  // Selection and page helpers
  // ---------------------------------------------------------------------------

  /**
   * Sorts the selection into drawn shapes, hexes and tokens.
   *
   * @param {object} msg Chat message.
   * @returns {{paths: object[], hexes: object[], tokens: object[], pageId: string|null}} Selection.
   */
  function readSelection(msg) {
    const selection = { paths: [], hexes: [], tokens: [], pageId: null };
    for (const sel of msg.selected || []) {
      const obj = getObj(sel._type, sel._id);
      if (!obj) {
        continue;
      }
      selection.pageId = selection.pageId || obj.get('_pageid');
      if (isPathObject(obj)) {
        const found = getHexByPathId(sel._id);
        if (found) {
          selection.hexes.push(found);
        } else {
          selection.paths.push(obj);
        }
      } else if (sel._type === 'graphic' && obj.get('_subtype') === 'token') {
        selection.tokens.push(obj);
      }
    }
    return selection;
  }

  /**
   * Returns the context for the selection's page, or the GM's current page.
   * Whispers an error when the page cannot be used.
   *
   * @param {object} msg Chat message.
   * @param {object} selection Selection from readSelection.
   * @returns {object|null} Page context.
   */
  function pageContextFor(msg, selection) {
    const ctx = getPageContext(selection.pageId || getPlayerPageId(msg.playerid));
    if (!ctx.ok) {
      fail(msg.playerid, ctx.reason);
      return null;
    }
    return ctx;
  }

  /**
   * Returns the cells under the selected tokens.
   *
   * @param {object} ctx Page context.
   * @param {object[]} tokens Roll20 graphics.
   * @returns {number[][]} Array of [row, col].
   */
  function cellsUnderTokens(ctx, tokens) {
    return tokens.flatMap((token) =>
      hexesUnderToken(
        ctx.grid,
        Number(token.get('left')),
        Number(token.get('top')),
        Number(token.get('width')) || 0,
        Number(token.get('height')) || 0
      )
    );
  }

  /**
   * Reports the end of a fill.
   *
   * @param {string} playerId Player ID.
   * @param {object} summary Fill summary.
   * @returns {void}
   */
  function reportFill(playerId, summary) {
    done(playerId, 'filled', summary);
    if (summary.fellBack) {
      whisperWarning(playerId, tr('warnings.foregroundUnavailable'));
    }
    if (summary.failed > 0) {
      whisperWarning(playerId, tr('warnings.someFailed', { count: summary.failed }));
    }
  }

  /**
   * Starts a fill and reports its outcome.
   *
   * @param {object} msg Chat message.
   * @param {object} ctx Page context.
   * @param {number[][]} allCells Cells to cover (duplicates are ignored).
   * @param {object[]} sources Saved source polygons.
   * @param {string} kind Fill kind.
   * @returns {void}
   */
  function startFill(msg, ctx, allCells, sources, kind) {
    const seen = new Set();
    const cells = allCells.filter(([r, c]) => {
      const key = hexKey(r, c);
      return seen.has(key) ? false : seen.add(key);
    });
    if (cells.length === 0) {
      fail(msg.playerid, 'emptyArea');
      return;
    }
    const result = fillCells(ctx, cells, {
      sources,
      kind,
      onDone: (summary) => {
        refreshPage(ctx.pageId);
        reportFill(msg.playerid, summary);
      },
    });
    if (!result.started) {
      fail(msg.playerid, result.reason, { count: cells.length });
    }
  }

  // ---------------------------------------------------------------------------
  // Command handlers
  // ---------------------------------------------------------------------------

  /**
   * `fill` and `fill inverse`: cover the selected polygons (or everything
   * outside them) with hexes.
   *
   * @param {object} msg Chat message.
   * @param {boolean} inverse Fill outside the polygons.
   * @returns {void}
   */
  function commandFill(msg, inverse) {
    const selection = readSelection(msg);
    if (selection.paths.length === 0) {
      fail(msg.playerid, 'noPolygons');
      return;
    }
    const ctx = pageContextFor(msg, selection);
    if (!ctx) {
      return;
    }
    const cells = inverse
      ? cellsOutsidePaths(ctx, selection.paths)
      : cellsInPaths(ctx, selection.paths);
    if (cells.length === 0) {
      fail(msg.playerid, 'emptyArea');
      return;
    }
    const sources = consumeSourcePaths(selection.paths);
    startFill(msg, ctx, cells, sources, inverse ? 'fillInverse' : 'fill');
  }

  /**
   * `conceal`: cover the cells under the selected polygons and tokens again.
   *
   * @param {object} msg Chat message.
   * @returns {void}
   */
  function commandConceal(msg) {
    const selection = readSelection(msg);
    if (selection.paths.length === 0 && selection.tokens.length === 0) {
      fail(msg.playerid, 'nothingToConceal');
      return;
    }
    const ctx = pageContextFor(msg, selection);
    if (!ctx) {
      return;
    }
    const cells = [
      ...cellsInPaths(ctx, selection.paths),
      ...cellsUnderTokens(ctx, selection.tokens),
    ];
    const sources = consumeSourcePaths(selection.paths);
    startFill(msg, ctx, cells, sources, 'conceal');
  }

  /**
   * `reveal`: reveal the selected hexes and the hexes under selected polygons
   * and tokens. `reveal page` reveals everything on the page silently.
   *
   * @param {object} msg Chat message.
   * @param {string[]} args Arguments.
   * @returns {void}
   */
  function commandReveal(msg, args) {
    const selection = readSelection(msg);
    const ctx = pageContextFor(msg, selection);
    if (!ctx) {
      return;
    }

    if (args[0] === 'page') {
      revealPage(ctx, (count) => done(msg.playerid, 'revealedPage', { count }));
      return;
    }

    const keys = new Set(selection.hexes.filter((h) => h.pageId === ctx.pageId).map((h) => h.key));
    for (const [r, c] of [
      ...cellsInPaths(ctx, selection.paths),
      ...cellsUnderTokens(ctx, selection.tokens),
    ]) {
      keys.add(hexKey(r, c));
    }
    if (keys.size === 0) {
      fail(msg.playerid, 'nothingToReveal');
      return;
    }
    consumeSourcePaths(selection.paths);
    const settings = getPageSettings(ctx.pageId);
    let count = 0;
    for (const key of keys) {
      if (revealHex(ctx, key, settings)) {
        count++;
      }
    }
    refreshPage(ctx.pageId);
    done(msg.playerid, 'revealed', { count });
  }

  /**
   * `explore`: reveal around the selected tokens as if they had just moved
   * there. Useful after moving tokens with other mods.
   *
   * @param {object} msg Chat message.
   * @returns {void}
   */
  function commandExplore(msg) {
    const selection = readSelection(msg);
    if (selection.tokens.length === 0) {
      fail(msg.playerid, 'noTokens');
      return;
    }
    const count = selection.tokens.reduce(
      (sum, token) => sum + revealAroundToken(token, null, true),
      0
    );
    refreshPage(selection.pageId);
    done(msg.playerid, 'revealed', { count });
  }

  /**
   * `reset page [confirm]`: remove every hex on the page.
   *
   * @param {object} msg Chat message.
   * @param {string[]} args Arguments.
   * @returns {void}
   */
  function commandReset(msg, args) {
    if (args[0] !== 'page') {
      fail(msg.playerid, 'unknownCommand', { command: `reset ${args.join(' ')}` });
      return;
    }
    const ctx = pageContextFor(msg, readSelection(msg));
    if (!ctx) {
      return;
    }
    const count = getPageHexes(ctx.pageId).length;
    if (args[1] !== 'confirm') {
      whisper(msg.playerid, tr('titles.confirm'), [
        `<div>${escapeHtml(tr('messages.confirmReset', { count, page: ctx.page.get('name') }))}</div>`,
        `<div style="text-align:center;margin-top:4px">${buildButton(tr('buttons.confirmReset'), `${COMMAND} reset page confirm`)}</div>`,
      ]);
      return;
    }
    clearPage(ctx, (removed) => {
      refreshPage(ctx.pageId);
      done(msg.playerid, 'resetPage', { count: removed });
    });
  }

  /**
   * `undo`: reverse the last fill.
   *
   * @param {object} msg Chat message.
   * @returns {void}
   */
  function commandUndo(msg) {
    const result = undoLastFill();
    if (!result.ok) {
      fail(msg.playerid, result.reason);
      return;
    }
    refreshPage(result.pageId);
    done(msg.playerid, 'undone', result);
  }

  /**
   * `name <text>`: name the selected hexes (or the hexes under selected tokens).
   * An empty name clears it.
   *
   * @param {object} msg Chat message.
   * @param {string} rawName Name text.
   * @returns {void}
   */
  function commandName(msg, rawName) {
    const selection = readSelection(msg);
    const ctx = pageContextFor(msg, selection);
    if (!ctx) {
      return;
    }
    const keys = new Set(selection.hexes.map((h) => h.key));
    for (const token of selection.tokens) {
      const [r, c] = cellsUnderTokens(ctx, [token])[0];
      keys.add(hexKey(r, c));
    }
    const hexes = [...keys].map((key) => getHex(ctx.pageId, key)).filter(Boolean);
    if (hexes.length === 0) {
      fail(msg.playerid, 'noHexes');
      return;
    }
    for (const hex of hexes) {
      setHexName(ctx, hex, rawName);
    }
    done(msg.playerid, toText(rawName) ? 'named' : 'unnamed', {
      count: hexes.length,
      name: toText(rawName),
    });
  }

  /**
   * `mark` / `unmark`: turn the selected tokens into hidden locations, or back.
   *
   * @param {object} msg Chat message.
   * @param {boolean} mark True to mark, false to unmark.
   * @returns {void}
   */
  function commandMark(msg, mark) {
    const selection = readSelection(msg);
    if (selection.tokens.length === 0) {
      fail(msg.playerid, 'noTokens');
      return;
    }
    const ctx = pageContextFor(msg, selection);
    if (!ctx) {
      return;
    }
    if (mark) {
      done(msg.playerid, 'marked', markLocations(ctx, selection.tokens));
    } else {
      done(msg.playerid, 'unmarked', { count: unmarkLocations(ctx, selection.tokens) });
    }
  }

  /**
   * `set [key] [value]`: change a global setting, or show the settings card.
   *
   * @param {object} msg Chat message.
   * @param {string[]} args Arguments.
   * @returns {void}
   */
  function commandSet(msg, args) {
    const [key, ...rest] = args;
    if (!key) {
      showSettings(msg.playerid);
      return;
    }
    if (!(key in DEFAULT_CONFIG)) {
      fail(msg.playerid, 'unknownSetting', { key });
      return;
    }
    const raw = rest.join(' ');
    if (key === 'language' && !raw) {
      showLanguages(msg.playerid);
      return;
    }
    const result = setConfigValue(key, raw);
    if (!result.valid) {
      fail(msg.playerid, 'invalidValue', { key, value: raw });
      return;
    }
    if (key === 'language') {
      installHandouts();
    }
    if (key === 'hideCoveredTokens') {
      if (result.value) {
        getPageIds().forEach(refreshPage);
      } else {
        restoreAll();
      }
    }
    done(msg.playerid, 'settingChanged', {
      setting: tr(`settings.${key}.label`),
      value: formatValue(key, result.value),
    });
    showSettings(msg.playerid);
  }

  /**
   * `page [set <key> <value> | clear]`: per-page overrides.
   *
   * @param {object} msg Chat message.
   * @param {string[]} args Arguments.
   * @returns {void}
   */
  function commandPage(msg, args) {
    const ctx = pageContextFor(msg, readSelection(msg));
    if (!ctx) {
      return;
    }
    const [action, key, ...rest] = args;
    if (action === 'set') {
      if (!PAGE_SETTING_KEYS.includes(key)) {
        fail(msg.playerid, 'unknownPageSetting', {
          key: key || '',
          keys: PAGE_SETTING_KEYS.join(', '),
        });
        return;
      }
      const raw = rest.join(' ');
      const result = setPageSetting(ctx.pageId, key, raw);
      if (!result.valid) {
        fail(msg.playerid, 'invalidValue', { key, value: raw });
        return;
      }
    } else if (action === 'clear') {
      clearPageSettings(ctx.pageId);
    } else if (action) {
      fail(msg.playerid, 'unknownCommand', { command: `page ${args.join(' ')}` });
      return;
    }
    showPageSettings(msg.playerid, ctx);
  }

  /**
   * `rescan`: rebuild the page's hex list from the objects on it.
   *
   * @param {object} msg Chat message.
   * @returns {void}
   */
  function commandRescan(msg) {
    const ctx = pageContextFor(msg, readSelection(msg));
    if (ctx) {
      const counts = rescanPage(ctx);
      refreshPage(ctx.pageId);
      done(msg.playerid, 'rescanned', counts);
    }
  }

  /**
   * `calibrate [reset]`: line the grid up with tokens snapped to hex centres.
   *
   * @param {object} msg Chat message.
   * @param {string[]} args Arguments.
   * @returns {void}
   */
  function commandCalibrate(msg, args) {
    const selection = readSelection(msg);
    const ctx = pageContextFor(msg, selection);
    if (!ctx) {
      return;
    }
    if (args[0] === 'reset') {
      const counts = resetCalibration(ctx);
      refreshPage(ctx.pageId);
      done(msg.playerid, 'calibrationReset', counts);
      return;
    }
    if (selection.tokens.length === 0) {
      fail(msg.playerid, 'calibrateNeedsTokens');
      return;
    }
    const result = calibratePage(ctx, selection.tokens);
    if (!result.ok) {
      fail(msg.playerid, 'calibrateFailed');
      return;
    }
    refreshPage(ctx.pageId);
    done(msg.playerid, 'calibrated', {
      ...result.counts,
      colStep: result.calibration.colStep.toFixed(2),
      rowStep: result.calibration.rowStep.toFixed(2),
    });
  }

  /**
   * `journal rebuild`: recreate the help and Command Deck handouts.
   *
   * @param {object} msg Chat message.
   * @returns {void}
   */
  function commandJournal(msg) {
    installHandouts();
    done(msg.playerid, 'journalRebuilt', { help: HANDOUT_HELP_NAME, deck: HANDOUT_DECK_NAME });
  }

  // ---------------------------------------------------------------------------
  // Cards
  // ---------------------------------------------------------------------------

  /**
   * Whispers the main menu.
   *
   * @param {string|null} playerId Player ID (null for every GM).
   * @returns {void}
   */
  function showMainMenu(playerId) {
    const b = (key, cmd) => buildButton(tr(`buttons.${key}`), `${COMMAND} ${cmd}`);
    const s = (key, cmd) => buildSecondaryButton(tr(`buttons.${key}`), `${COMMAND} ${cmd}`);
    whisper(playerId, `${SCRIPT_NAME} v${SCRIPT_VERSION}`, [
      buildSectionLabel(tr('menu.draw')),
      `<div>${b('fill', 'fill')}${b('fillInverse', 'fill inverse')}${s('undo', 'undo')}</div>`,
      buildSectionLabel(tr('menu.reveal')),
      `<div>${b('reveal', 'reveal')}${b('conceal', 'conceal')}${b('explore', 'explore')}</div>`,
      `<div>${s('revealPage', 'reveal page')}${s('resetPage', 'reset page')}</div>`,
      buildSectionLabel(tr('menu.locations')),
      `<div>${b('mark', 'mark')}${s('unmark', 'unmark')}${b('name', `name ?{${tr('prompts.name')}}`)}</div>`,
      buildSectionLabel(tr('menu.tools')),
      `<div>${s('settings', 'set')}${s('pageSettings', 'page')}${s('status', 'status')}</div>`,
      `<div>${s('rescan', 'rescan')}${s('calibrate', 'calibrate')}${s('help', 'help')}</div>`,
    ]);
  }

  /**
   * Whispers the global settings card.
   *
   * @param {string} playerId Player ID.
   * @returns {void}
   */
  function showSettings(playerId) {
    const config = getConfig();
    const rows = SETTING_ROWS.map((row) => {
      const value = config[row.key];
      const shown = row.color ? buildSwatch(value) : escapeHtml(formatValue(row.key, value));
      const button = buildSecondaryButton(
        tr('buttons.change'),
        `${COMMAND} set ${row.key} ${settingQuery(row, value)}`
      );
      return buildRow(tr(`settings.${row.key}.label`), `${shown} ${button}`);
    });
    whisper(playerId, tr('titles.settings'), [
      ...rows,
      buildDivider(),
      `<div style="font-size:0.85em">${escapeHtml(tr('menu.layerInUse', { layer: tr(`values.hexLayer.${getHexLayer() === LAYER_TOKEN ? 'objects' : 'foreground'}`) }))}</div>`,
      `<div>${buildSecondaryButton(tr('buttons.menu'), COMMAND)}</div>`,
    ]);
  }

  /**
   * Whispers the list of languages.
   *
   * @param {string} playerId Player ID.
   * @returns {void}
   */
  function showLanguages(playerId) {
    const buttons = SUPPORTED_LOCALES.map((code) =>
      buildSecondaryButton(LOCALE_LABELS[code], `${COMMAND} set language ${code}`)
    );
    whisper(playerId, tr('titles.languages'), `<div>${buttons.join('')}</div>`);
  }

  /**
   * Whispers a page's settings and overrides.
   *
   * @param {string} playerId Player ID.
   * @param {object} ctx Page context.
   * @returns {void}
   */
  function showPageSettings(playerId, ctx) {
    const overrides = getPageData(ctx.pageId)?.settings || {};
    const effective = getPageSettings(ctx.pageId);
    const rows = PAGE_SETTING_KEYS.map((key) => {
      const row = SETTING_ROWS.find((r) => r.key === key);
      const marker = key in overrides ? ' ★' : '';
      const button = buildSecondaryButton(
        tr('buttons.change'),
        `${COMMAND} page set ${key} ${settingQuery(row, effective[key])}`
      );
      return buildRow(
        `${tr(`settings.${key}.label`)}${marker}`,
        `${escapeHtml(formatValue(key, effective[key]))} ${button}`
      );
    });
    whisper(playerId, tr('titles.pageSettings', { page: ctx.page.get('name') }), [
      `<div style="font-size:0.85em">${escapeHtml(tr('menu.pageSettingsHelp'))}</div>`,
      ...rows,
      `<div>${buildSecondaryButton(tr('buttons.clearOverrides'), `${COMMAND} page clear`)}${buildSecondaryButton(tr('buttons.menu'), COMMAND)}</div>`,
    ]);
  }

  /**
   * Whispers the status of the current page.
   *
   * @param {object} msg Chat message.
   * @returns {void}
   */
  function showStatus(msg) {
    const ctx = pageContextFor(msg, readSelection(msg));
    if (!ctx) {
      return;
    }
    const hexes = getPageHexes(ctx.pageId);
    const data = getPageData(ctx.pageId);
    const last = getLastFill();
    const row = (key, value) => buildRow(tr(`status.${key}`), escapeHtml(String(value)));
    whisper(msg.playerid, tr('titles.status', { page: ctx.page.get('name') }), [
      row('engine', isJumpgate() ? 'Jumpgate' : 'Legacy'),
      row('grid', tr(`values.orientation.${ctx.grid.orientation}`)),
      row(
        'layer',
        tr(`values.hexLayer.${getHexLayer() === LAYER_TOKEN ? 'objects' : 'foreground'}`)
      ),
      row('hexes', hexes.length),
      row('named', hexes.filter((h) => h.name).length),
      row('icons', hexes.filter((h) => h.iconId).length),
      row('glimpsed', hexes.filter((h) => h.glimpsed).length),
      row('pending', getPendingLocations(ctx.pageId).length),
      row('calibrated', tr(data?.calibration ? 'values.on' : 'values.off')),
      row('overrides', Object.keys(data?.settings || {}).length),
      row('undo', last ? tr(`values.fillKind.${last.kind}`) : tr('values.none')),
    ]);
  }

  /**
   * Whispers the help card.
   *
   * @param {string} playerId Player ID.
   * @returns {void}
   */
  function showHelp(playerId) {
    const lines = [
      ['', 'menu'],
      ['fill', 'fill'],
      ['fill inverse', 'fillInverse'],
      ['undo', 'undo'],
      ['reveal', 'reveal'],
      ['reveal page', 'revealPage'],
      ['conceal', 'conceal'],
      ['explore', 'explore'],
      ['reset page', 'resetPage'],
      ['name <text>', 'name'],
      ['mark', 'mark'],
      ['unmark', 'unmark'],
      ['set <setting> <value>', 'set'],
      ['page set <setting> <value>', 'pageSet'],
      ['page clear', 'pageClear'],
      ['rescan', 'rescan'],
      ['calibrate', 'calibrate'],
      ['calibrate reset', 'calibrateReset'],
      ['status', 'status'],
      ['journal rebuild', 'journal'],
      ['help', 'help'],
    ];
    const html = lines
      .map(
        ([cmd, key]) =>
          `<div style="margin:2px 0"><code>${escapeHtml(`${COMMAND} ${cmd}`.trim())}</code><br><span style="font-size:0.85em">${escapeHtml(tr(`help.${key}`))}</span></div>`
      )
      .join('');
    whisper(playerId, tr('titles.help'), [
      html,
      buildDivider(),
      `<div style="font-size:0.85em">${escapeHtml(tr('help.handout', { name: HANDOUT_HELP_NAME }))}</div>`,
    ]);
  }

  // ---------------------------------------------------------------------------
  // Routing
  // ---------------------------------------------------------------------------

  /**
   * Routes a parsed command.
   *
   * @param {object} msg Chat message.
   * @param {string} sub Subcommand.
   * @param {string[]} args Arguments.
   * @param {string} rest Raw text after the subcommand.
   * @returns {void}
   */
  function routeCommand(msg, sub, args, rest) {
    switch (sub) {
      case '':
      case 'menu':
        showMainMenu(msg.playerid);
        return;
      case 'help':
        showHelp(msg.playerid);
        return;
      case 'fill':
        commandFill(msg, args[0] === 'inverse');
        return;
      case 'conceal':
      case 'hide':
        commandConceal(msg);
        return;
      case 'reveal':
        commandReveal(msg, args);
        return;
      case 'explore':
        commandExplore(msg);
        return;
      case 'reset':
        commandReset(msg, args);
        return;
      case 'undo':
        commandUndo(msg);
        return;
      case 'name':
        commandName(msg, rest);
        return;
      case 'mark':
        commandMark(msg, true);
        return;
      case 'unmark':
        commandMark(msg, false);
        return;
      case 'set':
      case 'config':
        commandSet(msg, args);
        return;
      case 'page':
        commandPage(msg, args);
        return;
      case 'rescan':
        commandRescan(msg);
        return;
      case 'calibrate':
        commandCalibrate(msg, args);
        return;
      case 'status':
        showStatus(msg);
        return;
      case 'journal':
        commandJournal(msg);
        return;
      default:
        fail(msg.playerid, 'unknownCommand', { command: sub });
    }
  }

  /**
   * Maps a v1 command to the v2 handlers.
   *
   * @param {object} msg Chat message.
   * @param {string} action Legacy action from LEGACY_COMMANDS.
   * @param {string} rest Raw text after the command.
   * @returns {void}
   */
  function routeLegacy(msg, action, rest) {
    const params = rest.split(LEGACY_ARG_SEPARATOR).map((p) => p.trim());
    switch (action) {
      case 'fill':
        commandFill(msg, false);
        return;
      case 'fillInverse':
        commandFill(msg, true);
        return;
      case 'menu':
        showMainMenu(msg.playerid);
        return;
      case 'legacyHex':
        if (params[0] === 'name') {
          commandName(msg, params.slice(1).join(LEGACY_ARG_SEPARATOR));
        }
        return;
      case 'legacyConfig': {
        const [prop, ...values] = params;
        // v1 defaults when a colour prompt is left empty.
        const updates = {
          color: () => ({
            fillColor: values[0] || 'black',
            strokeColor: values[1] || 'transparent',
            labelColor: values[2] || 'white',
          }),
          strokeWidth: () => ({ strokeWidth: values[0] || '0' }),
          maxDistance: () => ({ maxDistance: values[0] || '' }),
          revealDistance: () => ({ revealDistance: values[0] || '0' }),
        }[prop];
        if (!updates) {
          fail(msg.playerid, 'unknownSetting', { key: prop || '' });
          return;
        }
        for (const [key, value] of Object.entries(updates())) {
          if (!setConfigValue(key, value).valid) {
            fail(msg.playerid, 'invalidValue', { key, value });
          }
        }
        showSettings(msg.playerid);
        return;
      }
    }
  }

  /**
   * Handles chat input: `!hexploration …` and the v1 commands. GM only.
   *
   * @param {object} msg Roll20 chat message.
   * @returns {void}
   */
  function handleInput(msg) {
    if (msg.type !== 'api') {
      return;
    }
    const content = toText(msg.content);
    const [first] = content.split(/\s+/, 1);
    const isMain = first === COMMAND;
    const legacy = LEGACY_COMMANDS[first];
    if (!isMain && !legacy) {
      return;
    }
    if (!playerIsGM(msg.playerid)) {
      return;
    }

    try {
      const rest = content.slice(first.length).trim();
      if (legacy) {
        routeLegacy(msg, legacy, rest);
        return;
      }
      const [sub = '', ...args] = rest.split(/\s+/).filter(Boolean);
      const afterSub = rest.slice(sub.length).trim();
      routeCommand(msg, sub.toLowerCase(), args, afterSub);
    } catch (err) {
      log(`${SCRIPT_NAME} ERROR: ${err?.message || err}`);
      if (err?.stack) {
        log(err.stack);
      }
      fail(msg.playerid, 'unexpected', { message: err?.message || String(err) });
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
   * Forgets a hex whose path was deleted by hand.
   *
   * @param {object} path Deleted Roll20 path.
   * @returns {void}
   */
  function handlePathDestroyed(path) {
    const found = getHexByPathId(path.get('_id'));
    if (found) {
      removeLabel(found.hex);
      deleteHexRecord(found.pageId, found.key);
      refreshPage(found.pageId);
    }
  }

  /**
   * Forgets a deleted token as a pending location or hidden token.
   *
   * @param {object} token Deleted Roll20 graphic.
   * @returns {void}
   */
  function handleGraphicDestroyed(token) {
    setPendingLocation(token.get('_id'), null);
    delete getCoveredTokens()[token.get('_id')];
  }

  /**
   * Forgets a deleted page's hexes.
   *
   * @param {object} page Deleted Roll20 page.
   * @returns {void}
   */
  function handlePageDestroyed(page) {
    const pageId = page.get('_id');
    if (getPageIds().includes(pageId)) {
      deletePageData(pageId);
    }
  }

  /**
   * Registers with TokenMod (if installed) so tokens it moves reveal hexes;
   * the API does not raise change events for moves made by other mods.
   *
   * @returns {void}
   */
  function observeOtherMods() {
    if (typeof TokenMod !== 'undefined' && typeof TokenMod?.ObserveTokenChange === 'function') {
      TokenMod.ObserveTokenChange(guarded('TokenMod observer', handleTokenChange));
    }
  }

  /**
   * Publishes the API other mods can call.
   *
   * @returns {void}
   */
  function publishApi() {
    globalThis.Hexploration = Object.freeze({
      version: SCRIPT_VERSION,
      /**
       * Reveals around a token as if it had just moved, for mods that move tokens.
       *
       * @param {object|string} tokenOrId Roll20 graphic or its ID.
       * @param {object} [prev] Previous left/top, to reveal along the route.
       * @returns {number} Number of hexes revealed or glimpsed.
       */
      revealAround(tokenOrId, prev = null) {
        const token = typeof tokenOrId === 'string' ? getObj('graphic', tokenOrId) : tokenOrId;
        if (!ready || !token) {
          return 0;
        }
        try {
          const changed = revealAroundToken(token, prev);
          refreshPage(token.get('_pageid'));
          return changed;
        } catch (err) {
          log(`${SCRIPT_NAME} ERROR in revealAround: ${err?.message || err}`);
          return 0;
        }
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
    const pruned = pruneMissingHexes();
    for (const pageId of new Set([
      ...getPageIds(),
      ...Object.values(getCoveredTokens()).map((entry) => entry.pageId),
    ])) {
      refreshPage(pageId);
    }
    installHandouts();
    registerEngineHandlers();
    observeOtherMods();
    publishApi();
    ready = true;

    log(
      `-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} [Updated: ${SCRIPT_LAST_UPDATED}] (${isJumpgate() ? 'Jumpgate' : 'Legacy'}) <=-`
    );

    const lang = getConfig().language;
    const lines = [`<div><strong>${escapeHtml(t('titles.ready', lang))}</strong></div>`];
    if (migratedFrom === 1) {
      lines.push(`<div style="margin-top:3px">${escapeHtml(t('messages.migrated', lang))}</div>`);
    }
    if (pruned.dropped > 0) {
      lines.push(
        `<div style="margin-top:3px">${escapeHtml(t('messages.pruned', lang, pruned))}</div>`
      );
    }
    lines.push(
      `<div style="font-size:0.85em;margin-top:3px">${escapeHtml(t('messages.readyHint', lang))}</div>`
    );
    whisper(null, `${SCRIPT_NAME} v${SCRIPT_VERSION}`, lines);
    if (migratedFrom === 1 || pruned.dropped > 0) {
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
    on('change:graphic', guarded('change:graphic', handleTokenChange));
    on('add:graphic', guarded('add:graphic', refreshToken));
    on('destroy:graphic', guarded('destroy:graphic', handleGraphicDestroyed));
    on('destroy:page', guarded('destroy:page', handlePageDestroyed));
    on(`destroy:${PATH_TYPE_LEGACY}`, guarded('destroy:path', handlePathDestroyed));
  }

  /**
   * Registers handlers that depend on the game engine. pathv2 objects only
   * exist in Jumpgate, and the engine is only known once the game has loaded.
   *
   * @returns {void}
   */
  function registerEngineHandlers() {
    if (isJumpgate()) {
      on(`destroy:${PATH_TYPE_V2}`, guarded('destroy:pathv2', handlePathDestroyed));
    }
  }

  registerEventHandlers();
})();
