/**
 * NOTE: GENERATED FILE - DO NOT EDIT DIRECTLY.
 * NOTE: Source files live under src/ and are bundled with `npm run build`.
 * ------------------------------------------------
 * Name: Hexploration
 * Script: Hexploration.js
 * Version: 2.0.1
 * Built: 2026-10-30T15:35:23.371Z
 */
const HexplorationMod = (() => {
  'use strict';

  // Build-time placeholders replaced by rollup.config.js inject-build-metadata plugin.
  const SCRIPT_NAME = 'Hexploration';
  const SCRIPT_VERSION = '2.0.1';
  const SCRIPT_LAST_UPDATED = '2026-10-30T15:35:23.371Z';

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
  // The deck's name is not translated, so it always matches the handout's name.
  const DECK_TITLE = 'Command Deck';
  const HANDOUT_DECK_NAME = `Hexploration - ${DECK_TITLE}`;

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
   * Parses a hex, rgb() or rgba() colour into its channels.
   *
   * @param {*} raw Colour text.
   * @returns {{r: number, g: number, b: number, a: number}|null} Channels 0–255 and alpha 0–1, or null for other colours such as names.
   */
  function parseColor(raw) {
    const text = toText(raw);

    const hex = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(text);
    if (hex) {
      const digits = hex[1].length <= 4 ? [...hex[1]].map((c) => c + c).join('') : hex[1];
      const [r, g, b, a = 255] = digits.match(/../g).map((pair) => parseInt(pair, 16));
      return { r, g, b, a: a / 255 };
    }

    const fn =
      /^rgba?\(\s*([\d.]+%?)\s*,\s*([\d.]+%?)\s*,\s*([\d.]+%?)\s*(?:,\s*([\d.]+%?)\s*)?\)$/i.exec(
        text
      );
    if (!fn) {
      return null;
    }
    const channel = (v) =>
      clamp(v.endsWith('%') ? (parseFloat(v) * 255) / 100 : parseFloat(v), 0, 255);
    const alpha =
      fn[4] === undefined ? 1 : fn[4].endsWith('%') ? parseFloat(fn[4]) / 100 : parseFloat(fn[4]);
    return { r: channel(fn[1]), g: channel(fn[2]), b: channel(fn[3]), a: clamp(alpha, 0, 1) };
  }

  /**
   * Converts a colour to the #rrggbb or #rrggbbaa form Jumpgate's pathv2 objects
   * accept. Jumpgate silently ignores rgb(), rgba() and short hex colours, so a
   * hex keeps its old colour. Colour names are returned unchanged.
   *
   * @param {*} raw Colour text.
   * @returns {string} Colour for a pathv2 fill or stroke.
   */
  function toPathV2Color(raw) {
    const color = parseColor(raw);
    if (!color) {
      return toText(raw);
    }
    const hex = (n) => Math.round(n).toString(16).padStart(2, '0');
    const rgb = `#${hex(color.r)}${hex(color.g)}${hex(color.b)}`;
    return color.a >= 1 ? rgb : `${rgb}${hex(color.a * 255)}`;
  }

  /**
   * Converts a colour to a form Roll20 chat keeps in inline styles. Chat drops
   * #rrggbbaa colours and rgb() with an alpha value, leaving the style empty;
   * #rrggbb and rgba() survive. Colour names are returned unchanged.
   *
   * @param {*} raw Colour text.
   * @returns {string} Colour for chat HTML.
   */
  function toChatColor(raw) {
    const color = parseColor(raw);
    if (!color) {
      return toText(raw);
    }
    if (color.a >= 1) {
      return toPathV2Color(raw);
    }
    const [r, g, b] = [color.r, color.g, color.b].map(Math.round);
    return `rgba(${r},${g},${b},${Math.round(color.a * 100) / 100})`;
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
   * @param {string} [prefixHtml=''] Trusted HTML shown before the label, such as a flag.
   * @returns {string} HTML anchor.
   */
  function buildSecondaryButton(label, command, prefixHtml = '') {
    return `<a href="${escapeHtml(command)}" style="${BUTTON_SECONDARY_STYLE}">${prefixHtml}${escapeHtml(label)}</a>`;
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
   * Builds a locale's flag as a Twemoji image. Roll20 on Windows shows emoji
   * flags as letter pairs, so the flag is drawn from an SVG instead.
   *
   * @param {object} locale Locale metadata.
   * @returns {string} Trusted flag HTML, or an empty string when there is no flag.
   */
  function buildLocaleFlag(locale) {
    const label = escapeHtml(locale?.flagLabel || locale?.name || '');
    const url = flagAssetUrl(locale?.flag);
    if (!url) {
      return '';
    }
    return `<img src="${escapeHtml(url)}" alt="${label}" title="${label}" style="width:1.1em;height:1.1em;vertical-align:-0.15em;margin-right:4px;" />`;
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
    return `<span style="display:inline-block;width:12px;height:12px;vertical-align:middle;border:1px solid #888;background:${escapeHtml(toChatColor(color))}"></span> <code>${safe}</code>`;
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

  const TRANSLATION$m = {
    titles: {
      ready: 'Hexploration is gereed.',
      settings: 'Hexploration-instellings',
      languages: "Kies 'n taal",
      pageSettings: 'Bladsyinstellings: {page}',
      status: 'Hexploration-status: {page}',
      help: 'Hexploration-opdragte',
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
      layerInUse: 'Nuwe seshoeke word op die {layer} geteken.',
      pageSettingsHelp:
        'Hierdie instellings geld slegs vir hierdie bladsy. Instellings gemerk met ★ oorskryf die globale instellings.',
    },
    buttons: {
      fill: 'Vul',
      fillInverse: 'Omgekeerde vulling',
      undo: 'Ontdoen vulling',
      reveal: 'Onthul',
      conceal: 'Versteek',
      explore: 'Verken',
      revealPage: 'Onthul bladsy',
      resetPage: 'Stel bladsy terug',
      mark: 'Merk ligging',
      unmark: 'Ontmerk',
      name: 'Benoem seshoek',
      settings: 'Instellings',
      pageSettings: 'Bladsy-instellings',
      status: 'Status',
      rescan: 'Skandeer weer',
      calibrate: 'Kalibreer',
      calibrateReset: 'Stel kalibrasie terug',
      help: 'Hulp',
      change: 'Verander',
      menu: 'Kieslys',
      clearOverrides: 'Vee oorskrywings uit',
      confirmReset: 'Ja, verwyder alle seshoeke',
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
        foreground: 'voorgrondlaag',
        objects: 'tokenlaag',
      },
      revealBy: {
        players: 'Speler-tokens',
        characters: 'Karaktertokens',
        all: 'Alle tokens',
      },
      revealMode: {
        clear: 'Verwyder',
        glimpse: 'Glimp',
      },
      announce: {
        all: 'Almal',
        gm: 'Slegs GM',
        off: 'Af',
      },
      orientation: {
        vertical: 'Hex (V)',
        horizontal: 'Hex (H)',
      },
      fillKind: {
        fill: 'Vul',
        fillInverse: 'Omgekeerde vulling',
        conceal: 'Versteek',
      },
    },
    settings: {
      language: {
        label: 'Taal',
        desc: 'Taal vir kieslyste, boodskappe en uitdeelstukke.',
      },
      hexLayer: {
        label: 'Seshoeklaag',
        desc: 'Waar nuwe seshoeke geteken word. Outo probeer die voorgrondlaag (bo tokens) en val terug na die tokenlaag as die speletjie dit nie ondersteun nie.',
      },
      fillColor: {
        label: 'Vulkleur',
        desc: 'Kleur van nuwe seshoeke. Gebruik rgba() vir deursigtige seshoeke, byvoorbeeld rgba(0,0,0,0.8).',
      },
      strokeColor: {
        label: 'Randkleur',
        desc: 'Kleur van die buitelyn van nuwe seshoeke.',
      },
      labelColor: {
        label: 'Etiketkleur',
        desc: 'Kleur van die naametikette wat net die GM sien, op benoemde seshoeke.',
      },
      glimpseColor: {
        label: 'Glimpkleur',
        desc: "Kleur waarna seshoeke verander wanneer hulle deurskynend word (Glimp-onthullingsmodus). Gebruik 'n deurskynende rgba()-kleur.",
      },
      strokeWidth: {
        label: 'Randdikte',
        desc: 'Dikte van die buitelyn van nuwe seshoeke, in pieksels (0 tot 20).',
      },
      maxDistance: {
        label: 'Seshoek-onthullingsafstand',
        desc: "Word op seshoeke gestoor wanneer hulle gevul word, so stel dit in voordat jy vul: om dit later te verander, raak nie seshoeke wat reeds op die kaart is nie. 'n Token moet binne soveel seshoeke wees om hulle te onthul, hoe ver dit ook al kan sien; met 0 word hulle slegs onthul deur hulle binne te gaan. Gebruik dit vir berge of woude. Laat leeg vir geen beperking nie.",
      },
      revealDistance: {
        label: 'Sigafstand',
        desc: "Hoeveel seshoeke rondom 'n bewegende token onthul word (0 tot 20). 0 onthul slegs die seshoeke waardeur die token beweeg.",
      },
      lineOfSight: {
        label: 'Siglyn',
        desc: "Wanneer dit aan is, versteek seshoeke wat bedek bly, soos berge wat met 'n Seshoek-onthullingsafstand gevul is, die seshoeke agter hulle. Dit maak slegs 'n verskil met 'n Sigafstand van 2 of meer.",
      },
      revealPath: {
        label: 'Onthul langs pad',
        desc: "Wanneer dit aan is, word elke seshoek waardeur 'n token beweeg terwyl dit gesleep word (insluitend tussenpunte), onthul, nie net waar dit stop nie.",
      },
      revealBy: {
        label: 'Tokens wat onthul',
        desc: "Watter tokens op die tokenlaag seshoeke onthul: tokens wat deur 'n speler beheer word, tokens wat enige karakter verteenwoordig, of elke token.",
      },
      revealMode: {
        label: 'Onthullingsmodus',
        desc: "Met Verwyder word seshoeke binne sig verwyder. Met Glimp word hulle eerder deurskynend; hulle word verwyder wanneer 'n token hulle binnegaan.",
      },
      announce: {
        label: 'Kondig ontdekkings aan',
        desc: "Wie sien die kletsboodskap wanneer 'n genoemde ligging ontdek word.",
      },
      pingDiscoveries: {
        label: 'Ping ontdekkings',
        desc: "Wanneer aan, word spelers na 'n genoemde plek geping wanneer dit ontdek word.",
      },
      hideCoveredTokens: {
        label: 'Versteek bedekte tokens',
        desc: "Roll20 teken name, balke en auras bo seshoeke. Wanneer dit aan is, word die naam, balke en auras wat spelers kan sien, afgeskakel vir tokens onder 'n bedekte seshoek, en weer aangeskakel wanneer hulle ontbloot word.",
      },
    },
    status: {
      engine: 'Spelenjin',
      grid: 'Rooster',
      layer: 'Seshoeklaag',
      hexes: 'Seshoeke',
      named: 'Benoemde seshoeke',
      icons: 'Liggingtokens',
      glimpsed: 'Deurskynende seshoeke',
      pending: "Liggings wat op 'n vulling wag",
      calibrated: 'Gekalibreer',
      overrides: 'Bladsy-oorskrywings',
      undo: 'Ontdoen beskikbaar',
    },
    messages: {
      filled:
        'Vulling voltooi. Seshoeke geteken: {created}. Herstileer: {restyled}. Liggings versteek: {icons}.',
      revealed: 'Seshoeke onthul: {count}.',
      revealedPage: 'Elke seshoek op die bladsy is onthul ({count}).',
      confirmReset:
        'Verwyder elke seshoek van "{page}" ({count})? Liggingtokens keer terug na die tokenlaag. Ontdoen kan dit nie omkeer nie.',
      resetPage: 'Seshoeke van die bladsy verwyder: {count}.',
      undone:
        'Laaste vulling ontdoen. Seshoeke verwyder: {removed}. Herstileerde seshoeke herstel: {restored}.',
      named: 'Seshoeke benoem as "{name}": {count}.',
      unnamed: 'Name skoongemaak: {count}.',
      marked:
        'Liggings versteek in bestaande seshoeke: {attached}. Wag vir die volgende vulling wat hulle bedek: {pending}.',
      unmarked: 'Tokens wat nie meer liggings is nie: {count}.',
      settingChanged: '{setting} gestel na {value}.',
      rescanned:
        'Herskandeer voltooi. Gehou: {kept}. Aangeneem: {adopted}. Herliasseer: {moved}. Ontbreek en vergeet: {dropped}. Etikette herskakel: {labels}. Liggingtokens herskakel: {icons}.',
      calibrated:
        'Rooster gekalibreer (kolomstap {colStep}px, rystap {rowStep}px). Herskandeer: behou {kept}, herliasseer {moved}, het {adopted} aangeneem.',
      calibrationReset:
        'Kalibrasie verwyder. Herskandeer: behou {kept}, herliasseer {moved}, het {adopted} aangeneem.',
      journalRebuilt: 'Die "{help}" en "{deck}"-uitdeelstukke is herbou.',
      migrated:
        "Jou Hexploration 1.x-seshoekkaarte is opgegradeer. As hierdie speletjie uit 'n Legacy-speletjie gekopieer is, gebruik Skandeer weer op elke seshoekkaartbladsy.",
      pruned:
        'Gestoorde seshoeke wat nie meer bestaan nie en vergeet is: {dropped}. As hierdie speletjie of bladsy gekopieer is, gebruik Skandeer weer op die bladsy om sy seshoeke weer op te tel.',
      readyHint:
        'Tik !hexploration vir die kieslys, of maak die "Hexploration - Command Deck"-uitdeelstuk oop.',
    },
    warnings: {
      foregroundUnavailable:
        'Hierdie speletjie ondersteun nie teken op die voorgrondlaag nie, dus is die seshoeke op die tokenlaag geteken.',
      someFailed:
        'Seshoeke wat nie geteken kon word nie: {count}. Kyk in die API-konsole vir besonderhede.',
    },
    errors: {
      noPage: 'Kon nie die bladsy vind om aan te werk nie.',
      notHex: "Hierdie bladsy gebruik nie 'n seshoekrooster nie.",
      noPolygons: 'Kies een of meer getekende vorms om te vul.',
      emptyArea: 'Die geselekteerde gebied bevat geen seshoekmiddelpunte nie.',
      tooMany: 'Dit sal te veel seshoeke op een slag skep ({count}).',
      nothingToConceal: 'Kies getekende vorms of tokens om te versteek.',
      nothingToReveal: 'Kies seshoeke, getekende vorms of tokens om te onthul.',
      noTokens: 'Kies eers een of meer tokens.',
      noHexes: 'Kies eers een of meer seshoeke (of tokens wat op seshoeke staan).',
      nothingToUndo: 'Daar is geen vul om ongedaan te maak nie.',
      unknownCommand: 'Onbekende opdrag: {command}',
      unknownSetting: 'Onbekende instelling: {key}',
      unknownPageSetting: 'Instellings wat per bladsy gestel kan word: {keys}',
      invalidValue: '"{value}" is nie \'n geldige waarde vir {key} nie.',
      calibrateNeedsTokens: 'Kies een of twee tokens wat op seshoekmiddelpunte vasgeklik is.',
      calibrateFailed: 'Daardie tokens kan nie gebruik word om te kalibreer nie.',
      unexpected: 'Iets het verkeerd geloop: {message}',
    },
    hints: {
      noPage: 'Maak die bladsy oop waaraan jy wil werk, of kies iets daarop.',
      notHex: 'Stel die bladsyrooster op Hex (V) of Hex (H) in Bladsy-instellings.',
      noPolygons:
        "Teken 'n veelhoek, reghoek, ellips of vryhandvorm om die area, kies dit en probeer dan weer.",
      emptyArea: "Teken 'n groter vorm, of gaan die bladsyroosterinstellings na.",
      tooMany: "Vul 'n kleiner gebied, of verdeel die gebied in verskeie vorms.",
      noHexes:
        'Seshoeke is op die voorgrond- of tokenlaag; skakel oor na daardie laag om hulle te kies.',
      unknownCommand: 'Tik !hexploration help om die opdragte te lys.',
      unknownSetting: 'Tik !hexploration set om elke instelling te sien.',
      calibrateNeedsTokens:
        "Klik 'n token vas in die middel van 'n seshoek en kies dit. Kies 'n tweede token wat op 'n naburige seshoek in dieselfde ry (Hex V) of kolom (Hex H) vasgeklik is om ook die seshoekgrootte reg te stel.",
      calibrateFailed:
        'Die twee tokens moet in dieselfde ry (Hex V) of dieselfde kolom (Hex H) wees, minstens een seshoek uitmekaar.',
      unexpected: 'Besonderhede is in die API-konsole-logboek.',
    },
    help: {
      menu: 'Wys die kieslys.',
      fill: 'Bedek die geselekteerde getekende vorms met seshoeke.',
      fillInverse: 'Bedek die hele bladsy behalwe binne die geselekteerde vorms.',
      undo: 'Ontdoen die laaste vulling, omgekeerde vulling of versteek, en herstel die vorms wat dit gebruik het.',
      reveal:
        'Onthul die geselekteerde seshoeke, en die seshoeke onder die geselekteerde vorms en tokens.',
      revealPage: 'Onthul elke seshoek op die bladsy sonder aankondigings.',
      conceal: 'Bedek die gebied onder die geselekteerde vorms en tokens weer met seshoeke.',
      explore: 'Onthul rondom die geselekteerde tokens asof hulle pas daarheen beweeg het.',
      resetPage: 'Verwyder elke seshoek op die bladsy (vra eers).',
      name: 'Benoem die geselekteerde seshoeke, of die seshoeke onder die geselekteerde tokens. Laat die naam leeg om dit uit te vee.',
      mark: 'Verander die geselekteerde tokens in versteekte liggings.',
      unmark: 'Stop dat die geselekteerde tokens versteekte liggings is.',
      set: "Verander 'n instelling, of wys alle instellings.",
      pageSet: "Oorskryf 'n onthullingsinstelling slegs op die huidige bladsy.",
      pageClear: 'Verwyder die huidige bladsy se oorskrywings.',
      rescan:
        "Herbou die bladsy se seshoeklys, byvoorbeeld nadat jy 'n bladsy of speletjie gekopieer het.",
      calibrate:
        'Belyn die seshoekrooster met een of twee geselekteerde tokens wat op seshoekmiddelpunte vasgeklik is.',
      calibrateReset: 'Verwyder die huidige bladsy se kalibrasie.',
      status: 'Wys wat Hexploration van die huidige bladsy weet.',
      journal: 'Herbou die Help- en Command Deck-uitdeelstukke.',
      help: 'Wys hierdie lys.',
      handout: 'Volledige instruksies is in die "{name}"-uitdeelstuk.',
    },
    deck: {
      drawDesc:
        "Teken vorms om 'n area, kies hulle en vul dan. Ontdoen keer die laaste vulling om.",
      revealDesc:
        'Kies seshoeke, vorms of tokens om hulle te onthul of weer te bedek. Verken onthul rondom geselekteerde tokens asof hulle beweeg het.',
      locationsDesc:
        "Kies tokens om hulle as liggings onder seshoeke te versteek. Kies seshoeke of tokens om 'n seshoek te benoem.",
      toolsDesc:
        'Instellings, bladsy-oorskrywings, status, herskandering van gekopieerde bladsye en kalibrering van die rooster.',
      footer: 'Sien die "{help}"-uitdeelstuk vir volledige instruksies.',
    },
    handout: {
      versionLabel: 'Weergawe',
      subtitle: 'Seshoek-vir-seshoek-verkenning vir Roll20',
      footer: 'Gebruik die "{deck}"-uitdeelstuk vir een-klik kontroles.',
      overview: {
        heading: 'Oorsig',
        body: "Hexploration bedek 'n seshoekkaart met ondeursigtige seshoeke. Soos die groep beweeg, word die seshoeke waardeur hulle gaan (en, as jy wil, die seshoeke rondom hulle) verwyder, sodat die kaart een seshoek op 'n slag ontbloot word. Versteekte liggings kan onder seshoeke geplaas word en word aangekondig wanneer hulle gevind word. Dit werk in Jumpgate- en Legacy-speletjies, op Hex (V)- en Hex (H)-roosters van enige grootte.",
        demo: "Kyk na 'n kort demonstrasie (vanaf weergawe 1)",
      },
      quickStart: {
        heading: 'Vinnige Begin',
        steps: [
          "Maak 'n bladsy oop waarvan die rooster op Hex (V) of Hex (H) gestel is.",
          'Teken een of meer vorms (veelhoek, reghoek, ellips of vryhand) om die area om weg te steek.',
          'Kies die vorms en klik op Vul in die Command Deck (of tik !hexploration fill). Die vorms word deur seshoeke vervang.',
          'Opsioneel: kies voor die vulling tokens vir belangrike plekke en klik Merk ligging. Hulle word onder die seshoeke versteek en aangekondig wanneer hulle ontdek word.',
          "Beweeg 'n speler-token. Elke seshoek waardeur dit beweeg, en die seshoeke binne sy Sigafstand, word onthul.",
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
          'Slegs tokens op die tokenlaag onthul seshoeke. Watter tokens tel, word deur Tokens wat onthul bepaal: by verstek speler-tokens, sodat die GM monsters kan skuif sonder om die kaart te ontbloot.',
          "'n Token onthul elke seshoek wat dit bedek (groot tokens bedek verskeie) en, met Onthul langs pad aan, elke seshoek op die roete waarlangs dit gesleep is, insluitend tussenpunte.",
          "Sigafstand onthul die seshoeke rondom elk van daardie seshoeke, die naaste eerste. Met Siglyn aan word 'n seshoek nie onthul solank 'n bedekte seshoek tussen dit en die token lê nie. Nader seshoeke word gewoonlik eerste onthul, so in oop terrein verander Siglyn niks nie: dit maak slegs saak met 'n Sigafstand van 2 of meer en seshoeke wat bedek bly, soos terrein wat met 'n Seshoek-onthullingsafstand gevul is.",
          "Seshoek-onthullingsafstand word op elke seshoek gestoor wanneer dit gevul word, so stel dit in voordat jy vul; om dit later te verander, raak nie seshoeke wat reeds op die kaart is nie. 'n Token moet binne soveel seshoeke wees om hulle te onthul, hoe ver dit ook al kan sien, en met 0 word hulle slegs onthul deur hulle binne te gaan. Vir 'n bergreeks: stel Seshoek-onthullingsafstand op 0, vul die berge, stel dit terug na geen, en vul dan die land daaragter. Met Sigafstand 3 en Siglyn aan sien die groep die oop grond rondom hulle, maar nie die berge of wat agter hulle lê nie. Elke bergseshoek word onthul wanneer 'n token daarin instap.",
          "In Glimp-modus word seshoeke binne sig deurskynend in plaas daarvan om te verdwyn, en hulle word verwyder wanneer 'n token hulle binnegaan. Deurskynende Glimp-seshoeke blokkeer nie Siglyn nie.",
          "Roll20 teken tokenname, balke en auras bo seshoeke. Met Versteek bedekte tokens aan, word die naam, balke en auras wat spelers kan sien, afgeskakel vir 'n token onder 'n bedekte seshoek totdat dit ontbloot word, sodat versteekte monsters hulself nie verklap nie. As jy een daarvan aanskakel terwyl die token bedek is, bly dit versteek en word dit aangeskakel wanneer die token ontbloot word.",
          'Die API rapporteer nie bewegings wat deur ander mods gemaak is nie. TokenMod-skuiwe word outomaties opgetel; vir ander mods, kies die tokens en klik Explore, of bel Hexploration.revealAround(token) vanaf jou eie mod.',
        ],
      },
      locations: {
        heading: 'Benoemde seshoeke en liggings',
        points: [
          "Merk ligging verander die geselekteerde tokens in versteekte liggings. 'n Token wat reeds onder 'n seshoek is, word dadelik versteek; anders word dit versteek deur die volgende vulling wat dit bedek.",
          'Tokens met die wittoring-statusmerker word ook as liggings hanteer wanneer jy vul, soos in weergawe 1.',
          'Versteekte liggingtokens word na die GM-laag geskuif. Wanneer hul seshoek onthul word, keer hulle terug na die tokenlaag met hul naam sigbaar, en hul ontdekking word aangekondig.',
          "Benoem seshoek gee 'n seshoek 'n naam sonder 'n token. Die naam word aan die GM gewys as 'n etiket op die GM-laag en aangekondig wanneer die seshoek onthul word.",
          'Announce Discoveries kies of almal, net die GM, of niemand die aankondiging sien nie. Ping Discoveries skuif ook die spelers se uitsig na die ligging.',
        ],
      },
      settings: {
        heading: 'Instellings',
        intro:
          'Verander instellings met !hexploration set (of die Instellings-knoppie). Seshoeklaag, Tokens wat onthul en Taal kan ook op die Mod se instellingsbladsy gestel word.',
        colKey: 'Sleutel',
        colName: 'Instelling',
        colDesc: 'Beskrywing',
        perPage: '(Kan per bladsy gestel word.)',
      },
      jumpgate: {
        heading: 'Jumpgate en Legacy',
        points: [
          'Hexploration bepaal watter enjin die speletjie gebruik en teken die ooreenstemmende soort vorm. Vorms wat in enige van die twee redigeerders geteken is, kan gevul word.',
          'Met Seshoeklaag op Outo gestel, word seshoeke op die voorgrondlaag bo tokens geteken, sodat spelers nie kan sien wat daaronder is nie. As die voorgrondlaag nie beskikbaar is nie, word die tokenlaag eerder gebruik.',
          "Jumpgate teken wiskundig reëlmatige seshoeke, wat 'n effens ander vorm as Legacy-seshoeke het. As die seshoeke nie met 'n bladsy se rooster belyn nie, klik 'n token vas op 'n seshoekmiddelpunt, kies dit en klik Kalibreer. Kies twee tokens in naburige seshoeke van dieselfde ry (Hex V) of kolom (Hex H) om ook die seshoekgrootte reg te stel.",
          "Wanneer 'n bladsy of speletjie gekopieer word, kry sy seshoeke nuwe ID's. Gebruik Skandeer weer op die bladsy om hulle weer op te tel, saam met hul naametikette en liggingtokens.",
        ],
      },
      upgrading: {
        heading: 'Opgradering vanaf weergawe 1',
        points: [
          "Weergawe 2 het nie meer PathMath, MatrixMath, Vector Math of HTML Builder nodig nie. Jy kan hulle verwyder tensy 'n ander mod dit gebruik.",
          'Bestaande seshoekkaarte, name, liggingtokens en instellings word met die eerste begin outomaties opgegradeer.',
          'Die weergawe 1-opdragte, insluitend die Hexploration_menu-makro, werk steeds.',
          "Weergawe 1 het enige token wat 'n karakter verteenwoordig, seshoeke laat onthul. Stel Tokens wat onthul op Karaktertokens om daardie gedrag te behou.",
        ],
        colV1: 'Weergawe 1 opdrag',
        colV2: 'Weergawe 2 opdrag',
      },
      troubleshooting: {
        heading: 'Probleemoplossing',
        points: [
          "Niks gebeur wanneer 'n token beweeg nie: maak seker dat die token op die tokenlaag is en by Tokens wat onthul pas, en dat die bladsy seshoeke het (!hexploration status).",
          "Seshoeke is van die rooster af verskuif: gebruik Kalibreer en kyk dan met 'n token op 'n paar seshoeke oor die kaart heen.",
          "Seshoeke word nie meer onthul nadat 'n bladsy of speletjie gekopieer is nie: gebruik Skandeer weer op die bladsy.",
          'Vul sê die gebied het geen seshoekmiddelpunte nie: die vorm moet die middelpunt van ten minste een seshoek bevat.',
          'Vir enigiets anders, gaan die API-konsole-logboek na en sluit sy boodskappe in wanneer jy om hulp vra.',
        ],
      },
      languages: {
        heading: 'Tale',
        body: "Kies 'n taal met !hexploration stel taal. Beskikbare tale:",
        colLanguage: 'Taal',
        colNative: 'Naam in eie taal',
        colCode: 'Kode',
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

  const TRANSLATION$l = {
    titles: {
      ready: 'Hexploration està a punt.',
      settings: "Configuració d'Hexploration",
      languages: 'Trieu un idioma',
      pageSettings: 'Configuració de la pàgina: {page}',
      status: "Estat d'Hexploration: {page}",
      help: "Comandes d'Hexploration",
      confirm: 'Si us plau, confirmeu',
    },
    discovery: {
      title: 'Ubicació descoberta',
    },
    menu: {
      draw: 'Dibuixa',
      reveal: 'Revela i amaga',
      locations: 'Ubicacions',
      tools: 'Eines',
      layerInUse: "S'estan dibuixant hexàgons nous a la {layer}.",
      pageSettingsHelp:
        "Aquesta configuració només s'aplica a aquesta pàgina. La configuració marcada amb ★ anul·la la configuració global.",
    },
    buttons: {
      fill: 'Omple',
      fillInverse: 'Emplenament invers',
      undo: "Desfés l'emplenament",
      reveal: 'Revela',
      conceal: 'Amaga',
      explore: 'Explora',
      revealPage: 'Revela la pàgina',
      resetPage: 'Restableix la pàgina',
      mark: 'Marca la ubicació',
      unmark: 'Desmarca',
      name: "Anomena l'hexàgon",
      settings: 'Configuració',
      pageSettings: 'Configuració de la pàgina',
      status: 'Estat',
      rescan: 'Torna a escanejar',
      calibrate: 'Calibra',
      calibrateReset: 'Restableix la calibració',
      help: 'Ajuda',
      change: 'Canvia',
      menu: 'Menú',
      clearOverrides: 'Esborra les substitucions',
      confirmReset: 'Sí, elimina tots els hexàgons',
    },
    prompts: {
      name: 'Nom de la ubicació (deixeu en blanc per esborrar)',
    },
    values: {
      on: 'Activat',
      off: 'Desactivat',
      none: 'Cap',
      hexLayer: {
        auto: 'Automàtic (primer pla si està disponible)',
        foreground: 'capa de primer pla',
        objects: 'capa de fitxes',
      },
      revealBy: {
        players: 'Fitxes de jugador',
        characters: 'Fitxes de personatges',
        all: 'Totes les fitxes',
      },
      revealMode: {
        clear: 'Neteja',
        glimpse: "Cop d'ull",
      },
      announce: {
        all: 'Tothom',
        gm: 'Només el GM',
        off: 'Desactivat',
      },
      orientation: {
        vertical: 'Hex (V)',
        horizontal: 'Hex (H)',
      },
      fillKind: {
        fill: 'Omple',
        fillInverse: 'Emplenament invers',
        conceal: 'Amaga',
      },
    },
    settings: {
      language: {
        label: 'Llengua',
        desc: 'Idioma per a menús, missatges i fullets.',
      },
      hexLayer: {
        label: 'Capa dels hexàgons',
        desc: "On es dibuixen els hexàgons nous. Automàtic prova la capa de primer pla (per sobre de les fitxes) i recorre a la capa de fitxes si el joc no l'admet.",
      },
      fillColor: {
        label: 'Color de farciment',
        desc: 'Color dels hexàgons nous. Utilitzeu rgba() per a hexàgons transparents, per exemple rgba(0,0,0,0.8).',
      },
      strokeColor: {
        label: 'Color de la vora',
        desc: 'Color del contorn dels nous hexagonals.',
      },
      labelColor: {
        label: "Color de l'etiqueta",
        desc: 'Color de les etiquetes de nom, visibles només per al GM, dels hexàgons amb nom.',
      },
      glimpseColor: {
        label: "Color de cop d'ull",
        desc: "Color que prenen els hexàgons quan es veuen de cop d'ull (mode de revelació Cop d'ull). Utilitzeu un color rgba() transparent.",
      },
      strokeWidth: {
        label: 'Amplada de la vora',
        desc: 'Amplada del contorn dels hexàgons nous, en píxels (de 0 a 20).',
      },
      maxDistance: {
        label: 'Distància de revelació dels hexàgons',
        desc: "Es desa als hexàgons quan s'omplen, així que configureu-la abans d'omplir: canviar-la després no afecta els hexàgons que ja són al mapa. Una fitxa ha d'estar com a màxim a aquest nombre d'hexàgons per revelar-los, per lluny que pugui veure; amb 0, només es revelen quan s'hi entra. Utilitzeu-la per a muntanyes o boscos. Deixeu-ho buit perquè no hi hagi límit.",
      },
      revealDistance: {
        label: 'Distància de visió',
        desc: "Quants hexagones es mostren al voltant d'una fitxa en moviment (de 0 a 20). 0 només revela els hexagones pels quals passa la fitxa.",
      },
      lineOfSight: {
        label: 'Línia de visió',
        desc: 'Quan està activat, els hexàgons que continuen coberts, com ara muntanyes omplertes amb una Distància de revelació dels hexàgons, amaguen els hexàgons que hi ha darrere. Només té efecte amb una Distància de visió de 2 o més.',
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
        desc: "Neteja elimina els hexàgons a la vista. Cop d'ull, en canvi, els fa transparents; s'eliminen quan hi entra una fitxa.",
      },
      announce: {
        label: 'Anunciar descobriments',
        desc: 'Qui veu el missatge de xat quan es descobreix una ubicació amb nom.',
      },
      pingDiscoveries: {
        label: 'Fer ping als descobriments',
        desc: 'Quan està activat, els jugadors reben un ping a una ubicació amb nom quan es descobreix.',
      },
      hideCoveredTokens: {
        label: 'Amaga les fitxes cobertes',
        desc: 'Roll20 dibuixa noms, barres i aures per sobre dels hexagones. Quan està activat, les fitxes sota un hexagonal cobert tenen el seu nom visible per al jugador, les barres i les aures desactivades, i tornen a activar-se quan es destaquen.',
      },
    },
    status: {
      engine: 'Motor de joc',
      grid: 'Quadrícula',
      layer: 'Capa dels hexàgons',
      hexes: 'Hexàgons',
      named: 'Hexàgons amb nom',
      icons: "Fitxes d'ubicació",
      glimpsed: 'Hexàgons albirats',
      pending: "Ubicacions pendents d'emplenament",
      calibrated: 'Calibrat',
      overrides: 'Substitucions de la pàgina',
      undo: 'Es pot desfer',
    },
    messages: {
      filled:
        'Emplenament completat. Hexàgons dibuixats: {created}. Amb estil nou: {restyled}. Ubicacions amagades: {icons}.',
      revealed: 'Hexagones revelats: {count}.',
      revealedPage: "S'han revelat tots els hexàgons de la pàgina ({count}).",
      confirmReset:
        'Voleu eliminar tots els hexàgons de "{page}" ({count})? Les fitxes d\'ubicació tornen a la capa de fitxes. Aquesta acció no es pot revertir amb Desfer.',
      resetPage: 'Hexàgons eliminats de la pàgina: {count}.',
      undone:
        'Últim farciment desfet. Hexagones eliminats: {removed}. Hexagones redissenyats restaurats: {restored}.',
      named: 'Hexàgons anomenats "{name}": {count}.',
      unnamed: 'Noms esborrats: {count}.',
      marked:
        'Ubicacions amagades en hexàgons existents: {attached}. Pendents del següent farciment que les cobreixi: {pending}.',
      unmarked: 'Fitxes que ja no són ubicacions: {count}.',
      settingChanged: "{setting} s'ha establert en {value}.",
      rescanned:
        "Torna a escanejar completat. Conservat: {kept}. Adoptat: {adopted}. Tornada a arxivar: {moved}. Falta i oblidat: {dropped}. Etiquetes tornades a enllaçar: {labels}. S'han tornat a enllaçar fitxes d'ubicació: {icons}.",
      calibrated:
        "Quadrícula calibrada (pas de columna {colStep}px, pas de fila {rowStep}px). Torna a escanejar: s'ha mantingut {kept}, s'ha tornat a arxivar {moved}, s'ha adoptat {adopted}.",
      calibrationReset:
        "S'ha eliminat el calibratge. Torna a escanejar: s'ha mantingut {kept}, s'ha tornat a arxivar {moved}, s'ha adoptat {adopted}.",
      journalRebuilt: 'Els fullets "{help}" i "{deck}" s\'han reconstruït.',
      migrated:
        "Els vostres mapes d'hexàgons d'Hexploration 1.x s'han actualitzat. Si aquest joc s'ha copiat d'un joc Legacy, executeu Torna a escanejar a cada pàgina amb mapa d'hexàgons.",
      pruned:
        "Hexàgons desats que ja no existeixen i s'han oblidat: {dropped}. Si s'ha copiat aquest joc o pàgina, executeu Torna a escanejar a la pàgina per recuperar-ne els hexàgons.",
      readyHint:
        'Escriviu !hexploration per obrir el menú o obriu el fullet "Hexploration - Command Deck".',
    },
    warnings: {
      foregroundUnavailable:
        'Aquest joc no admet dibuixar a la capa de primer pla, de manera que es van dibuixar hexagones a la capa de fitxes.',
      someFailed:
        "Hexagones que no s'han pogut dibuixar: {count}. Consulteu la consola de l'API per obtenir més informació.",
    },
    errors: {
      noPage: "No s'ha pogut trobar la pàgina per treballar.",
      notHex: 'Aquesta pàgina no utilitza una graella hexagonal.',
      noPolygons: 'Seleccioneu una o més formes dibuixades per omplir.',
      emptyArea: "L'àrea seleccionada no conté cap centre hexagonal.",
      tooMany: "Això crearia massa hexagones d'una vegada ({count}).",
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
        'Els hexàgons són a la capa de primer pla o a la de fitxes; canvieu a aquesta capa per seleccionar-los.',
      unknownCommand: 'Escriviu !hexploration help per llistar les ordres.',
      unknownSetting: 'Escriviu !hexploration set per veure tots els paràmetres.',
      calibrateNeedsTokens:
        "Col·loqueu una fitxa al centre d'un hexàgon i seleccioneu-la. Seleccioneu una segona fitxa ajustada a un hexàgon veí de la mateixa fila (Hex V) o columna (Hex H) per corregir també la mida de l'hexàgon.",
      calibrateFailed:
        "Les dues fitxes han d'estar a la mateixa fila (Hex V) o a la mateixa columna (Hex H), separades almenys per un hexàgon.",
      unexpected: "Els detalls es troben al registre de la consola de l'API.",
    },
    help: {
      menu: 'Mostra el menú.',
      fill: 'Cobriu les formes dibuixades seleccionades amb hexagonals.',
      fillInverse: 'Cobriu tota la pàgina excepte dins de les formes seleccionades.',
      undo: "Desfer l'últim farciment, farciment invers o ocultar i restaurar les formes que utilitzava.",
      reveal:
        'Revela els hexagones seleccionats i els hexagonals sota les formes i fitxes seleccionades.',
      revealPage: 'Revela tots els hexàgons de la pàgina sense anuncis.',
      conceal: "Torneu a cobrir l'àrea sota les formes i fitxes seleccionades amb hexagonals.",
      explore: "Revela les fitxes seleccionades com si acabessin de moure's allà.",
      resetPage: 'Elimina tots els hexàgons de la pàgina (primer ho pregunta).',
      name: 'Anomena els hexagones seleccionats o els hexadegons que hi ha a sota de les fitxes seleccionades. Deixeu el nom buit per esborrar-lo.',
      mark: 'Converteix les fitxes seleccionades en llocs ocults.',
      unmark: 'Deixeu que les fitxes seleccionades siguin ubicacions ocultes.',
      set: 'Canvia un paràmetre o mostra tots els paràmetres.',
      pageSet: 'Substituïu una configuració de revelació només a la pàgina actual.',
      pageClear: 'Elimina les substitucions de la pàgina actual.',
      rescan:
        "Reconstrueix la llista d'hexàgons de la pàgina, per exemple després de copiar una pàgina o un joc.",
      calibrate:
        'Alineeu la quadrícula hexagonal amb una o dues fitxes seleccionades enganxades als centres hexagonals.',
      calibrateReset: 'Elimineu el calibratge de la pàgina actual.',
      status: 'Mostra què sap Hexploration sobre la pàgina actual.',
      journal: "Reconstrueix els fullets d'Ajuda i del Command Deck.",
      help: 'Mostra aquesta llista.',
      handout: 'Les instruccions completes es troben al fullet "{name}".',
    },
    deck: {
      drawDesc:
        "Dibuixa formes al voltant d'una àrea, selecciona-les i omple. Desfés l'emplenament reverteix l'últim emplenament.",
      revealDesc:
        "Selecciona hexàgons, formes o fitxes per revelar-los o tornar-los a cobrir. Explora revela el voltant de les fitxes seleccionades com si s'haguessin mogut.",
      locationsDesc:
        'Seleccioneu fitxes per amagar-les com a ubicacions sota els hexàgons. Seleccioneu hexàgons o fitxes per posar nom a un hexàgon.',
      toolsDesc:
        'Configuració, substitucions de pàgines, estat, reescaneig de pàgines copiades i calibratge de la quadrícula.',
      footer: 'Consulteu el fullet "{help}" per obtenir instruccions completes.',
    },
    handout: {
      versionLabel: 'Versió',
      subtitle: 'Exploració hexàgon a hexàgon per a Roll20',
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
          'Seleccioneu les formes i feu clic a Omple al Command Deck (o escriviu !hexploration fill). Les formes se substitueixen per hexàgons.',
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
          'Només les fitxes de la capa de fitxes revelen hexàgons. Quines fitxes compten ho determina Fitxes que revelen: per defecte, les fitxes de jugador, de manera que el GM pot moure monstres sense descobrir el mapa.',
          "Una fitxa revela tots els hexàgons que cobreix (les fitxes grans en cobreixen diversos) i, amb Revela al llarg del camí activat, tots els hexàgons de la ruta per on s'ha arrossegat, inclosos els punts de pas.",
          "La Distància de visió revela els hexàgons al voltant de cadascun d'aquests hexàgons, començant pels més propers. Amb la Línia de visió activada, un hexàgon no es revela mentre hi hagi un hexàgon cobert entre ell i la fitxa. Normalment els hexàgons més propers es revelen primer, de manera que en terreny obert la Línia de visió no canvia res: només importa amb una Distància de visió de 2 o més i hexàgons que continuen coberts, com ara terreny omplert amb una Distància de revelació dels hexàgons.",
          "La Distància de revelació dels hexàgons es desa a cada hexàgon quan s'omple, així que configureu-la abans d'omplir; canviar-la després no afecta els hexàgons que ja són al mapa. Una fitxa ha d'estar com a màxim a aquest nombre d'hexàgons per revelar-los, per lluny que pugui veure, i amb 0 només es revelen quan s'hi entra. Per a una serralada: poseu la Distància de revelació dels hexàgons a 0, ompliu les muntanyes, torneu-la a deixar sense límit i després ompliu les terres de més enllà. Amb una Distància de visió de 3 i la Línia de visió activada, el grup veu el terreny obert al seu voltant, però no les muntanyes ni el que hi ha darrere. Cada hexàgon de muntanya es revela quan una fitxa hi entra.",
          "En el mode Cop d'ull, els hexàgons a la vista es tornen transparents en lloc de desaparèixer, i s'eliminen quan hi entra una fitxa. Els hexàgons transparents del mode Cop d'ull no bloquegen la Línia de visió.",
          "Roll20 dibuixa els noms, les barres i les aures de les fitxes per sobre dels hexàgons. Amb Amaga les fitxes cobertes activat, una fitxa sota un hexàgon cobert té el nom, les barres i les aures visibles per als jugadors desactivats fins que es descobreix, perquè els monstres amagats no es delatin. Si n'activeu algun mentre la fitxa està coberta, continua amagat i s'activa quan la fitxa es descobreix.",
          "L'API no informa dels moviments fets per altres modificacions. Els moviments de TokenMod es recullen automàticament; per a altres modificacions, seleccioneu les fitxes i feu clic a Explora, o truqueu a Hexploration.revealAround(token) des del vostre propi mod.",
        ],
      },
      locations: {
        heading: 'Hexes i ubicacions anomenades',
        points: [
          "Marca la ubicació converteix les fitxes seleccionades en ubicacions ocultes. Una fitxa que ja està sota un hexàgon s'amaga immediatament; en cas contrari queda amagat pel següent farciment que el cobreix.",
          "Els fitxes amb el marcador d'estat de la torre blanca també es tracten com a ubicacions quan ompliu, com a la versió 1.",
          "Les fitxes d'ubicació ocultes es mouen a la capa de GM. Quan es revela el seu hex, tornen a la capa de fitxes amb el seu nom mostrat i s'anuncia el seu descobriment.",
          "Anomena l'hexàgon dona nom a un hexàgon sense cap fitxa. El nom es mostra al GM com una etiqueta a la capa del GM i s'anuncia quan es revela l'hexàgon.",
          "Anunciar descobriments tria si veuen l'anunci tothom, només el GM o ningú. Fer ping als descobriments també mou la vista dels jugadors a la ubicació.",
        ],
      },
      settings: {
        heading: 'Configuració',
        intro:
          'Canvieu la configuració amb !hexploration set (o amb el botó Configuració). Capa dels hexàgons, Fitxes que revelen i Llengua també es poden configurar a la pàgina de configuració del mod.',
        colKey: 'clau',
        colName: 'Configuració',
        colDesc: 'Descripció',
        perPage: '(Es pot configurar per pàgina.)',
      },
      jumpgate: {
        heading: 'Jumpgate i Legacy',
        points: [
          'Hexploration determina quin motor utilitza el joc i dibuixa el tipus de forma corresponent. Les formes dibuixades en qualsevol dels editors es poden omplir.',
          "Amb Capa dels hexàgons establerta a Automàtic, els hexàgons es dibuixen a la capa de primer pla, per sobre de les fitxes, perquè els jugadors no puguin veure què hi ha a sota. Si la capa de primer pla no està disponible, s'utilitza la capa de fitxes.",
          "Jumpgate dibuixa hexàgons matemàticament regulars, que tenen una forma lleugerament diferent dels hexàgons de Legacy. Si els hexàgons no s'alineen amb la graella d'una pàgina, ajusteu una fitxa al centre d'un hexàgon, seleccioneu-la i feu clic a Calibra. Seleccioneu dues fitxes en hexàgons veïns de la mateixa fila (Hex V) o columna (Hex H) per corregir també la mida de l'hexàgon.",
          "Quan es copia una pàgina o un joc, els seus hexàgons reben identificadors nous. Executeu Torna a escanejar a la pàgina per tornar-los a recuperar, juntament amb les etiquetes de nom i les fitxes d'ubicació.",
        ],
      },
      upgrading: {
        heading: 'Actualització de la versió 1',
        points: [
          'La versió 2 ja no necessita PathMath, MatrixMath, Vector Math o HTML Builder. Podeu eliminar-los tret que els utilitzi un altre mod.',
          "Els mapes d'hexàgons, els noms, les fitxes d'ubicació i la configuració existents s'actualitzen automàticament la primera vegada que s'inicia.",
          'Les ordres de la versió 1, inclosa la macro Hexploration_menu, encara funcionen.',
          'La versió 1 permetia que qualsevol fitxa que representés un personatge revelés hexàgons. Establiu Fitxes que revelen a Fitxes de personatges per mantenir aquest comportament.',
        ],
        colV1: 'Comandament de la versió 1',
        colV2: 'Comandament de la versió 2',
      },
      troubleshooting: {
        heading: 'Resolució de problemes',
        points: [
          'No passa res quan es mou una fitxa: comproveu que la fitxa és a la capa de fitxes i que coincideix amb Fitxes que revelen, i que la pàgina té hexàgons (!hexploration status).',
          'Els hexàgons estan desplaçats respecte de la quadrícula: utilitzeu Calibra i, a continuació, comproveu-ho amb una fitxa en uns quants hexàgons del mapa.',
          'Els hexàgons han deixat de revelar-se després de copiar una pàgina o un joc: executeu Torna a escanejar a la pàgina.',
          "Omple diu que l'àrea no té centres d'hexàgon: la forma ha de contenir el centre d'almenys un hexàgon.",
          "Per a qualsevol altra cosa, comproveu el registre de la consola de l'API i incloeu-ne els missatges quan demaneu ajuda.",
        ],
      },
      languages: {
        heading: 'Idiomes',
        body: "Trieu un idioma amb l'idioma definit de !hexploration. Idiomes disponibles:",
        colLanguage: 'Llengua',
        colNative: 'Nom original',
        colCode: 'Codi',
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

  const TRANSLATION$k = {
    titles: {
      ready: 'Hexploration 已就緒。',
      settings: 'Hexploration 設定',
      languages: '選擇語言',
      pageSettings: '頁面設定：{page}',
      status: 'Hexploration 狀態：{page}',
      help: 'Hexploration 指令',
      confirm: '請確認',
    },
    discovery: {
      title: '發現地點',
    },
    menu: {
      draw: '繪製',
      reveal: '揭示與隱藏',
      locations: '地點',
      tools: '工具',
      layerInUse: '正在 {layer} 上繪製新的六角形。',
      pageSettingsHelp: '這些設定僅適用於該頁面。標記為★的設定將覆蓋全域設定。',
    },
    buttons: {
      fill: '填充',
      fillInverse: '反向填充',
      undo: '撤銷填充',
      reveal: '揭示',
      conceal: '隱藏',
      explore: '探索',
      revealPage: '揭示整頁',
      resetPage: '重置頁面',
      mark: '標記地點',
      unmark: '取消標記',
      name: '命名六角格',
      settings: '設定',
      pageSettings: '頁面設定',
      status: '狀態',
      rescan: '重新掃描',
      calibrate: '校準',
      calibrateReset: '重置校準',
      help: '說明',
      change: '變更',
      menu: '選單',
      clearOverrides: '清除覆寫',
      confirmReset: '是，移除所有六角格',
    },
    prompts: {
      name: '地點名稱（留空以清除）',
    },
    values: {
      on: '開',
      off: '關',
      none: '無',
      hexLayer: {
        auto: '自動（可用時使用前景層）',
        foreground: '前景層',
        objects: '令牌層',
      },
      revealBy: {
        players: '玩家令牌',
        characters: '角色令牌',
        all: '所有令牌',
      },
      revealMode: {
        clear: '清除',
        glimpse: '瞥見',
      },
      announce: {
        all: '所有人',
        gm: '僅限 GM',
        off: '關',
      },
      orientation: {
        vertical: 'Hex (V)',
        horizontal: 'Hex (H)',
      },
      fillKind: {
        fill: '填充',
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
        label: '六角格圖層',
        desc: '繪製新六角形的地方。自動嘗試前景層（令牌上方），如果遊戲不支持，則回退到令牌層。',
      },
      fillColor: {
        label: '填充顏色',
        desc: '新六角格的顏色。若要讓六角格半透明，請使用 rgba()，例如 rgba(0,0,0,0.8)。',
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
        desc: '六角格被瞥見時變成的顏色（「瞥見」揭示模式）。請使用半透明的 rgba() 顏色。',
      },
      strokeWidth: {
        label: '邊框寬度',
        desc: '新六邊形輪廓的寬度，以像素為單位（0 到 20）。',
      },
      maxDistance: {
        label: '六角格揭示距離',
        desc: '六角格在填充時會儲存此值，因此請在填充前設定：之後再更改不會影響地圖上已有的六角格。無論令牌能看多遠，都必須位於這麼多格以內才能揭示它們；設為 0 時，只有進入六角格才會揭示。可用於山脈或森林。留空則無限制。',
      },
      revealDistance: {
        label: '視距',
        desc: '顯示移動令牌周圍有多少個六角形（0 到 20）。 0 僅顯示令牌經過的六角形。',
      },
      lineOfSight: {
        label: '視線',
        desc: '啟用後，持續被覆蓋的六角格（例如以「六角格揭示距離」填充的山脈）會遮住其後方的六角格。只有在「視距」為 2 或以上時才會有差別。',
      },
      revealPath: {
        label: '沿路徑顯示',
        desc: '啟用後，標記在拖曳時經過的每個六角形（包括路徑點）都會顯示出來，而不僅僅是其停止的位置。',
      },
      revealBy: {
        label: '可揭示的令牌',
        desc: '令牌層上哪些令牌會揭示六角格：由玩家控制的令牌、代表任何角色的令牌，或所有令牌。',
      },
      revealMode: {
        label: '揭示模式',
        desc: '清除會移除視線範圍內的六角格。瞥見則改為讓六角格變得半透明；令牌進入時才將其移除。',
      },
      announce: {
        label: '公告發現',
        desc: '當發現指定位置時誰會看到聊天訊息。',
      },
      pingDiscoveries: {
        label: '標示發現位置',
        desc: '啟用後，當發現指定位置時，玩家會被 ping 到該位置。',
      },
      hideCoveredTokens: {
        label: '隱藏被覆蓋的令牌',
        desc: 'Roll20 在六角形上方繪製名稱、條形和光環。啟用後，被覆蓋的六角形下的令牌的玩家可見的名稱、條形和光環會關閉，並在未被覆蓋時重新打開。',
      },
    },
    status: {
      engine: '遊戲引擎',
      grid: '網格',
      layer: '六角格圖層',
      hexes: '六角格',
      named: '已命名的六角格',
      icons: '地點令牌',
      glimpsed: '被瞥見的六角格',
      pending: '等待填充的地點',
      calibrated: '已校準',
      overrides: '頁面覆寫',
      undo: '可撤銷',
    },
    messages: {
      filled: '填寫完成。繪製的六角形：{created}。重新設計：{restyled}。隱藏位置：{icons}。',
      revealed: '六角形顯示：{count}。',
      revealedPage: '已揭示頁面上的所有六角格（{count}）。',
      confirmReset:
        '要移除「{page}」上的所有六角格（{count}）嗎？地點令牌會回到令牌層。此操作無法以撤銷復原。',
      resetPage: '已從頁面移除的六角格：{count}。',
      undone: '上次填充已撤消。已刪除六角形：{removed}。重新設計的六角形已恢復：{restored}。',
      named: '名為「{name}」的六角形：{count}。',
      unnamed: '已清除的名稱：{count}。',
      marked: '隱藏在現有六角形中的位置：{attached}。等待下一次填充覆蓋它們：{pending}。',
      unmarked: '不再是位置的標記：{count}。',
      settingChanged: '{setting} 設定為 {value}。',
      rescanned:
        '重新掃描完成。保留：{kept}。採用：{adopted}。重新歸檔：{moved}。遺失與遺忘：{dropped}。標籤重新連結：{labels}。位置標記重新連結：{icons}。',
      calibrated:
        '網格校準（列步長 {colStep}px，行步長 {rowStep}px）。重新掃描：保留{kept}，重新歸檔{moved}，採用{adopted}。',
      calibrationReset: '校準已刪除。重新掃描：保留{kept}，重新歸檔{moved}，採用{adopted}。',
      journalRebuilt: '“{help}”和“{deck}”講義已重建。',
      migrated:
        '您的 Hexploration 1.x 六角格地圖已升級。如果此遊戲是從舊版遊戲複製而來，請在每個六角格地圖頁面上執行「重新掃描」。',
      pruned:
        '已不存在而被遺忘的已儲存六角格：{dropped}。如果此遊戲或頁面是複製而來，請在該頁面上執行「重新掃描」，以重新取回其六角格。',
      readyHint: '輸入 !hexploration 開啟選單，或開啟 "Hexploration - Command Deck" 講義。',
    },
    warnings: {
      foregroundUnavailable: '遊戲不支援在前景圖層上繪製，因此在令牌層上繪製了六角形。',
      someFailed: '無法繪製的六角形：{count}。檢查 API 控制台以了解詳細資訊。',
    },
    errors: {
      noPage: '找不到要處理的頁面。',
      notHex: '此頁面不使用六角網格。',
      noPolygons: '選擇一個或多個要填滿的繪製形狀。',
      emptyArea: '所選區域不包含任何六角形中心。',
      tooMany: '這會一次建立太多的六角形 ({count})。',
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
      notHex: '請在頁面設定中將頁面網格設為 Hex (V) 或 Hex (H)。',
      noPolygons: '圍繞該區域繪製多邊形、矩形、橢圓形或手繪形狀，選擇它，然後重試。',
      emptyArea: '繪製更大的形狀，或檢查頁面網格設定。',
      tooMany: '填滿較小的區域，或將該區域分割成多個形狀。',
      noHexes: '六角形位於前景或令牌層；切換到該層以選擇它們。',
      unknownCommand: '鍵入 !hexploration help 以列出指令。',
      unknownSetting: '輸入 !hexploration set 查看每個設定。',
      calibrateNeedsTokens:
        '將標記捕捉到六角形的中心並選擇它。選取捕捉到同一行 (Hex V) 或列 (Hex H) 中相鄰六角形的第二個標記，也可以修正六角形大小。',
      calibrateFailed: '兩個令牌必須位於同一列 (Hex V) 或同一行 (Hex H)，且至少相隔一個六角格。',
      unexpected: '詳細資訊位於 API 控制台日誌中。',
    },
    help: {
      menu: '顯示選單。',
      fill: '用六角形覆蓋選定的繪製形狀。',
      fillInverse: '覆蓋除所選形狀內部之外的整個頁面。',
      undo: '撤銷上次填充、反向填充或隱藏，並恢復其使用的形狀。',
      reveal: '顯示選定的六角形以及選定形狀和標記下的六角形。',
      revealPage: '揭示頁面上的所有六角格，不發布公告。',
      conceal: '再次用六角形覆蓋所選形狀和標記下方的區域。',
      explore: '顯示所選標記的周圍，就好像它們剛剛移動到那裡一樣。',
      resetPage: '移除頁面上的所有六角格（會先確認）。',
      name: '命名選定的六角形或選定標記下的六角形。將名稱留空以將其清除。',
      mark: '將選取的標記變成隱藏位置。',
      unmark: '停止將選定的標記隱藏在位置。',
      set: '更改設定或顯示所有設定。',
      pageSet: '僅覆蓋目前頁面上的顯示設定。',
      pageClear: '刪除目前頁面的覆蓋。',
      rescan: '重建頁面的六角格清單，例如在複製頁面或遊戲之後。',
      calibrate: '將六角形網格與對齊到六角形中心的一兩個選定標記對齊。',
      calibrateReset: '刪除目前頁面的校準。',
      status: '顯示 Hexploration 對目前頁面的了解。',
      journal: '重建說明與 Command Deck 講義。',
      help: '顯示此清單。',
      handout: '完整說明位於「{name}」講義。',
    },
    deck: {
      drawDesc: '在區域周圍繪製形狀，選取後填充。「撤銷填充」會還原上一次填充。',
      revealDesc:
        '選擇六角形、形狀或標記以再次顯示或覆蓋它們。探索會顯示所選標記周圍的情況，就好像它們已移動一樣。',
      locationsDesc: '選取令牌，將其作為地點隱藏在六角格下。選取六角格或令牌，為六角格命名。',
      toolsDesc: '設定、頁面覆蓋、狀態、重新掃描複製的頁面和校準網格。',
      footer: '有關完整說明，請參閱“{help}”講義。',
    },
    handout: {
      versionLabel: '版本',
      subtitle: 'Roll20 的逐格六角格探索',
      footer: '使用“{deck}”講義進行一鍵式控制項。',
      overview: {
        heading: '概述',
        body: 'Hexploration 以不透明的六角格覆蓋六角格地圖。隊伍移動時，他們經過的六角格（以及你願意的話，周圍的六角格）會被移除，讓地圖一格一格地揭開。隱藏地點可以放在六角格下方，被找到時會公告。它適用於 Jumpgate 和 Legacy 遊戲，以及任何大小的 Hex (V) 和 Hex (H) 網格。',
        demo: '觀看簡短的演示（來自版本 1）',
      },
      quickStart: {
        heading: '快速入門',
        steps: [
          '開啟網格設為 Hex (V) 或 Hex (H) 的頁面。',
          '在要隱藏的區域周圍繪製一個或多個形狀（多邊形、矩形、橢圓形或手繪）。',
          '選取形狀，然後在 Command Deck 中點選「填充」（或輸入 !hexploration fill）。形狀會被六角格取代。',
          '可選：填充前，選取重要地點的令牌並點選「標記地點」。它們會隱藏在六角格下，被發現時公告。',
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
          '只有令牌層上的令牌才會揭示六角格。哪些令牌算數由「可揭示的令牌」決定：預設為玩家令牌，因此 GM 可以移動怪物而不揭開地圖。',
          '標記會顯示它所覆蓋的每個六角形（大標記會覆蓋幾個），並且在啟用「沿路徑顯示」的情況下，會顯示它所拖曳的路線上的每個六角形，包括航路點。',
          '「視距」會由近而遠揭示這些六角格周圍的六角格。啟用「視線」時，只要六角格與令牌之間有被覆蓋的六角格，該六角格就不會被揭示。較近的六角格通常會先被揭示，因此在開闊地區「視線」不會帶來任何改變：只有在「視距」為 2 或以上，且有持續被覆蓋的六角格（例如以「六角格揭示距離」填充的地形）時才有作用。',
          '「六角格揭示距離」會在六角格填充時儲存在每個六角格上，因此請在填充前設定；之後再更改不會影響地圖上已有的六角格。無論令牌能看多遠，都必須位於該格數以內才能揭示它們；設為 0 時，只有進入六角格才會揭示。以山脈為例：將「六角格揭示距離」設為 0，填充山脈，再將其設回無，然後填充山脈後方的土地。在「視距」為 3 且啟用「視線」時，隊伍能看到周圍的開闊地，但看不到山脈或山後的事物。每個山脈六角格會在令牌走進時被揭示。',
          '在「瞥見」模式中，視野內的六角格會變為半透明而非消失，並在令牌進入時被移除。處於瞥見狀態的六角格不會阻擋「視線」。',
          'Roll20 會把令牌的名稱、條和光環繪製在六角格上方。啟用「隱藏被覆蓋的令牌」後，位於被覆蓋六角格下的令牌，其玩家可見的名稱、條和光環會關閉，直到被揭開為止，讓隱藏的怪物不會暴露行蹤。若在令牌仍被覆蓋時開啟其中任何一項，它會保持隱藏，並在令牌被揭開時開啟。',
          'API 不會回報其他模組造成的移動。TokenMod 的移動會自動偵測；對於其他模組，請選取令牌並點選「探索」，或從你自己的模組呼叫 Hexploration.revealAround(token)。',
        ],
      },
      locations: {
        heading: '命名六角形和位置',
        points: [
          '「標記地點」會將選取的令牌變成隱藏地點。已在六角格下的令牌會立即隱藏；否則會在下一次覆蓋它的填充時隱藏。',
          '與版本 1 一樣，帶有白塔狀態標記的標記在您填充時也被視為位置。',
          '隱藏的地點令牌會移到 GM 層。當其所在的六角格被揭示時，它們會回到令牌層並顯示名稱，同時公告其發現。',
          '「命名六角格」可在沒有令牌的情況下為六角格命名。名稱會以標籤形式顯示在 GM 層上供 GM 查看，並在該六角格被揭示時公告。',
          '「公告發現」決定所有人、僅 GM 或沒有人看到公告。「標示發現位置」還會把玩家的視野移到該地點。',
        ],
      },
      settings: {
        heading: '設定',
        intro:
          '使用 !hexploration set（或「設定」按鈕）變更設定。「六角格圖層」、「可揭示的令牌」與「語言」也可以在 Mod 的設定頁面上設定。',
        colKey: '鑰匙',
        colName: '環境',
        colDesc: '描述',
        perPage: '（可按頁設定。）',
      },
      jumpgate: {
        heading: 'Jumpgate 與 Legacy',
        points: [
          'Hexploration 計算出遊戲使用的引擎並繪製相符的形狀。可以填滿在任一編輯器中繪製的形狀。',
          '將「六角格圖層」設為「自動」時，六角格會繪製在令牌上方的前景層，因此玩家看不到下方的內容。如果前景層無法使用，則改用令牌層。',
          'Jumpgate 繪製的是數學上規則的六角格，形狀與舊版六角格略有不同。如果六角格與頁面網格沒有對齊，請將一個令牌吸附到六角格中心，選取它並點選「校準」。若在同一列 (Hex V) 或同一行 (Hex H) 的相鄰六角格中選取兩個令牌，還能一併修正六角格大小。',
          '當頁面或遊戲被複製時，其六角形會獲得新的 ID。在頁面上執行重新掃描以再次拾取它們以及它們的名稱標籤和位置標記。',
        ],
      },
      upgrading: {
        heading: '從版本 1 升級',
        points: [
          '版本 2 不再需要 PathMath、MatrixMath、Vector Math 或 HTML Builder。您可以刪除它們，除非另一個模組使用它們。',
          '現有的六角格地圖、名稱、地點令牌與設定會在首次啟動時自動升級。',
          '版本 1 的指令（包括 Hexploration_menu 巨集）仍然有效。',
          '版本 1 允許任何代表角色的令牌揭示六角格。若要保留此行為，請將「可揭示的令牌」設為「角色令牌」。',
        ],
        colV1: '版本 1 指令',
        colV2: '版本 2 指令',
      },
      troubleshooting: {
        heading: '故障排除',
        points: [
          '令牌移動時沒有任何反應：檢查令牌是否在令牌層上且符合「可揭示的令牌」，以及頁面上是否有六角格（!hexploration status）。',
          '六角形偏離網格：使用校準，然後用地圖上幾個六角形上的標記進行檢查。',
          '複製頁面或遊戲後六角格不再揭示：請在該頁面上執行「重新掃描」。',
          '「填充」提示該區域沒有六角格中心：形狀必須包含至少一個六角格的中心。',
          '對於其他任何事情，請檢查 API 控制台日誌並在尋求協助時包含其訊息。',
        ],
      },
      languages: {
        heading: '語言',
        body: '使用 !hexploration set language 選擇語言。可用語言：',
        colLanguage: '語言',
        colNative: '原文名稱',
        colCode: '程式碼',
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

  const TRANSLATION$j = {
    titles: {
      ready: 'Hexploration je připraven.',
      settings: 'Nastavení Hexploration',
      languages: 'Vyberte jazyk',
      pageSettings: 'Nastavení stránky: {page}',
      status: 'Stav Hexploration: {page}',
      help: 'Příkazy Hexploration',
      confirm: 'Potvrďte prosím',
    },
    discovery: {
      title: 'Místo objeveno',
    },
    menu: {
      draw: 'Kreslení',
      reveal: 'Odhalení a skrytí',
      locations: 'Místa',
      tools: 'Nástroje',
      layerInUse: 'Vrstva, do které se kreslí nové hexy: {layer}.',
      pageSettingsHelp:
        'Tato nastavení platí pouze pro tuto stránku. Nastavení označená ★ přepíší globální nastavení.',
    },
    buttons: {
      fill: 'Vyplnit',
      fillInverse: 'Inverzní výplň',
      undo: 'Vrátit výplň',
      reveal: 'Odhalit',
      conceal: 'Zakrýt',
      explore: 'Prozkoumat',
      revealPage: 'Odhalit stránku',
      resetPage: 'Resetovat stránku',
      mark: 'Označit místo',
      unmark: 'Zrušit označení',
      name: 'Pojmenovat hex',
      settings: 'Nastavení',
      pageSettings: 'Nastavení stránky',
      status: 'Stav',
      rescan: 'Znovu skenovat',
      calibrate: 'Kalibrovat',
      calibrateReset: 'Resetovat kalibraci',
      help: 'Pomoc',
      change: 'Změnit',
      menu: 'Menu',
      clearOverrides: 'Zrušit přepsání',
      confirmReset: 'Ano, odebrat všechny hexy',
    },
    prompts: {
      name: 'Název místa (pro vymazání ponechte prázdné)',
    },
    values: {
      on: 'Zapnuto',
      off: 'Vypnuto',
      none: 'Žádné',
      hexLayer: {
        auto: 'Auto (popředí, pokud je k dispozici)',
        foreground: 'vrstva popředí',
        objects: 'vrstva žetonů',
      },
      revealBy: {
        players: 'Žetony hráčů',
        characters: 'Žetony postav',
        all: 'Všechny žetony',
      },
      revealMode: {
        clear: 'Odstranění',
        glimpse: 'Záblesk',
      },
      announce: {
        all: 'Všichni',
        gm: 'Pouze GM',
        off: 'Vypnuto',
      },
      orientation: {
        vertical: 'Hex (V)',
        horizontal: 'Hex (H)',
      },
      fillKind: {
        fill: 'Vyplnit',
        fillInverse: 'Inverzní výplň',
        conceal: 'Zakrýt',
      },
    },
    settings: {
      language: {
        label: 'Jazyk',
        desc: 'Jazyk pro nabídky, zprávy a letáky.',
      },
      hexLayer: {
        label: 'Vrstva šestiúhelníků',
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
        label: 'Barva popisku',
        desc: 'Barva jmenovek pouze GM na pojmenovaných hexech.',
      },
      glimpseColor: {
        label: 'Barva záblesku',
        desc: 'Barva, kterou hexy získají při zahlédnutí (režim odhalování Záblesk). Použijte průhlednou barvu rgba().',
      },
      strokeWidth: {
        label: 'Šířka ohraničení',
        desc: 'Šířka obrysu nových hexů v pixelech (0 až 20).',
      },
      maxDistance: {
        label: 'Vzdálenost odhalení šestiúhelníků',
        desc: 'Ukládá se do hexů při jejich vyplňování, proto ji nastavte před vyplněním: pozdější změna neovlivní hexy, které už jsou na mapě. Žeton musí být v dosahu tohoto počtu hexů, aby je odhalil, ať vidí jakkoli daleko; při hodnotě 0 se odhalí jen tím, že do nich vstoupí. Použijte ji pro hory nebo lesy. Nechte prázdné bez omezení.',
      },
      revealDistance: {
        label: 'Vzdálenost dohledu',
        desc: 'Kolik hexů kolem pohybujícího se žetonu je odhaleno (0 až 20). 0 odhaluje pouze hexy, kterými žeton prochází.',
      },
      lineOfSight: {
        label: 'Přímá viditelnost',
        desc: 'Když je zapnuto, hexy, které zůstávají zakryté, například hory vyplněné s nastavením Vzdálenost odhalení šestiúhelníků, skrývají hexy za sebou. Projeví se to pouze tehdy, když je Vzdálenost dohledu 2 nebo více.',
      },
      revealPath: {
        label: 'Odhalovat po cestě',
        desc: 'Když je zapnuto, je odhalen každý hex, kterým žeton při tažení projde (včetně trasových bodů), nejen tam, kde se zastaví.',
      },
      revealBy: {
        label: 'Žetony, které odhalují',
        desc: 'Které žetony na vrstvě žetonů odhalují hexy: žetony ovládané hráčem, žetony, které představují jakoukoli postavu, nebo každý žeton.',
      },
      revealMode: {
        label: 'Režim odhalování',
        desc: 'Odstranění odstraní hexy v dohledu. Záblesk je místo toho zprůhlední; odstraní se, když do nich vstoupí žeton.',
      },
      announce: {
        label: 'Oznamovat objevy',
        desc: 'Kdo uvidí chatovou zprávu, když je objeveno pojmenované místo.',
      },
      pingDiscoveries: {
        label: 'Pingnout objevy',
        desc: 'Když je zapnuto, hráči jsou pingnuti na pojmenované místo, když je objeveno.',
      },
      hideCoveredTokens: {
        label: 'Skrýt zakryté žetony',
        desc: 'Roll20 kreslí jména, pruhy a aury nad hexy. Když jsou žetony pod krytým hexem zapnuté, jejich jméno, pruhy a aury viditelné pro hráče jsou vypnuté a znovu zapnuté, když jsou odkryty.',
      },
    },
    status: {
      engine: 'Herní engine',
      grid: 'Mřížka',
      layer: 'Vrstva hexů',
      hexes: 'Hexy',
      named: 'Pojmenované hexy',
      icons: 'Žetony míst',
      glimpsed: 'Zahlédnuté hexy',
      pending: 'Místa čekající na výplň',
      calibrated: 'Zkalibrováno',
      overrides: 'Přepsání stránky',
      undo: 'Lze vrátit zpět',
    },
    messages: {
      filled:
        'Vyplnění dokončeno. Vylosované hexy: {created}. Změna stylu: {restyled}. Skrytá místa: {icons}.',
      revealed: 'Odhalené hexy: {count}.',
      revealedPage: 'Každé odhalené hex na stránce ({count}).',
      confirmReset:
        'Odebrat každé hex z „{page}“ ({count})? Tokeny umístění se vrátí do vrstvy tokenů. Zpět to nelze vrátit.',
      resetPage: 'Ze stránky byly odstraněny hexy: {count}.',
      undone:
        'Poslední výplň vrácena. Odstraněné hexy: {removed}. Hexy s obnoveným stylem: {restored}.',
      named: 'Hexusy s názvem „{name}“: {count}.',
      unnamed: 'Jména vymazána: {count}.',
      marked:
        'Místa skrytá na stávajících hexech: {attached}. Čekání na další výplň, která je pokryje: {pending}.',
      unmarked: 'Tokeny, které již nejsou umístěními: {count}.',
      settingChanged: '{setting} nastaveno na {value}.',
      rescanned:
        'Opětovné skenování dokončeno. Uchováno: {kept}. Přijato: {adopted}. Znovu vyplněno: {moved}. Chybějící a zapomenuté: {dropped}. Znovu propojené štítky: {labels}. Tokeny polohy byly znovu propojeny: {icons}.',
      calibrated:
        'Mřížka zkalibrována (krok sloupce {colStep}px, krok řádku {rowStep}px). Znovu naskenovat: ponecháno {kept}, znovu zadáno {moved}, přijato {adopted}.',
      calibrationReset:
        'Kalibrace odstraněna. Znovu naskenovat: ponecháno {kept}, znovu uloženo {moved}, přijato {adopted}.',
      journalRebuilt: 'Materiály „{help}“ a „{deck}“ byly přepracovány.',
      migrated:
        'Vaše hexové mapy z Hexploration 1.x byly aktualizovány. Pokud byla tato hra zkopírována z hry Legacy, spusťte Znovu skenovat na každé stránce s hexovou mapou.',
      pruned:
        'Uložené hexy, které již neexistují a byly zapomenuty: {dropped}. Pokud byla tato hra nebo stránka zkopírována, spusťte na stránce Znovu skenovat, aby se její hexy znovu načetly.',
      readyHint:
        'Zadejte !hexploration pro otevření nabídky nebo otevřete leták "Hexploration - Command Deck".',
    },
    warnings: {
      foregroundUnavailable:
        'Tato hra nepodporuje kreslení na vrstvě popředí, takže hexy byly nakresleny na vrstvu žetonů.',
      someFailed:
        'Hexametry, které nebylo možné nakreslit: {count}. Podrobnosti naleznete v konzole API.',
    },
    errors: {
      noPage: 'Nelze najít stránku, na které by se dalo pracovat.',
      notHex: 'Tato stránka nepoužívá hexovou mřížku.',
      noPolygons: 'Vyberte jeden nebo více nakreslených tvarů, které chcete vyplnit.',
      emptyArea: 'Vybraná oblast neobsahuje žádné středy šestihran.',
      tooMany: 'To by vytvořilo příliš mnoho hexů najednou ({count}).',
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
      status: 'Zobrazit, co Hexploration ví o aktuální stránce.',
      journal: 'Znovu vytvořte letáky „Pomoc“ a „Command Deck“.',
      help: 'Zobrazit tento seznam.',
      handout: 'Úplné pokyny jsou v letáku „{name}“.',
    },
    deck: {
      drawDesc:
        'Nakreslete tvary kolem oblasti, vyberte je a poté vyplňte. Zpět vrátí poslední výplň zpět.',
      revealDesc:
        'Vyberte hexy, tvary nebo žetony, abyste je odhalili nebo znovu zakryli. Prozkoumat odhalí okolí vybraných žetonů, jako by se pohnuly.',
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
          'Vyberte tvary a v Command Deck klikněte na Vyplnit (nebo zadejte !hexploration fill). Tvary se nahradí hexy.',
          'Volitelné: před vyplněním vyberte žetony pro důležitá místa a klikněte na Označit místo. Jsou ukryty pod hexy a oznámeny, když jsou objeveny.',
          'Přesuňte žeton hráče. Každý hex, kterým projde, a hexy v jeho Vzdálenosti dohledu jsou odhaleny.',
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
          'Hexy odhalují pouze žetony na vrstvě žetonů. Které žetony se počítají, určuje nastavení Žetony, které odhalují: ve výchozím stavu žetony hráčů, takže GM může pohybovat příšerami, aniž by odkrýval mapu.',
          'Žeton odhalí každý hex, který zakrývá (velké žetony zakrývají několik), a se zapnutým nastavením Odhalovat po cestě také každý hex na trase, po které byl tažen, včetně průchozích bodů.',
          'Vzdálenost dohledu odhaluje hexy kolem každého z těchto hexů, od nejbližších. Když je zapnutá Přímá viditelnost, hex se neodhalí, dokud mezi ním a žetonem leží zakrytý hex. Bližší hexy se obvykle odhalí jako první, takže v otevřené krajině Přímá viditelnost nic nemění: projeví se jen tehdy, když je Vzdálenost dohledu 2 nebo více a existují hexy, které zůstávají zakryté, například terén vyplněný s nastavením Vzdálenost odhalení šestiúhelníků.',
          'Vzdálenost odhalení šestiúhelníků se ukládá do každého hexu při jeho vyplnění, proto ji nastavte před vyplňováním; pozdější změna neovlivní hexy, které už jsou na mapě. Žeton musí být v dosahu tolika hexů, aby je odhalil, ať vidí jakkoli daleko, a při hodnotě 0 se odhalí jen tím, že do nich vstoupí. Pro horské pásmo: nastavte Vzdálenost odhalení šestiúhelníků na 0, vyplňte hory, pak hodnotu opět vymažte (bez omezení) a nakonec vyplňte krajinu za nimi. Když je Vzdálenost dohledu 3 a Přímá viditelnost zapnutá, družina vidí otevřený terén kolem sebe, ale ne hory ani to, co leží za nimi. Každý horský hex se odhalí, když do něj vstoupí žeton.',
          'V režimu Záblesk se hexy v dohledu místo zmizení stanou průhlednými a odstraní se, když do nich vstoupí žeton. Hexy zahlédnuté v režimu Záblesk nezakrývají výhled pro nastavení Přímá viditelnost.',
          'Roll20 kreslí jména, ukazatele a aury žetonů nad hexy. Se zapnutým nastavením Skrýt zakryté žetony má žeton pod zakrytým hexem vypnuté jméno, ukazatele a aury viditelné pro hráče, dokud není odkryt, takže se skryté příšery neprozradí. Pokud některý z nich zapnete, zatímco je žeton zakrytý, zůstane skrytý a zapne se, až bude žeton odkryt.',
          'API nehlásí pohyby provedené jinými mody. Pohyby z TokenMod se zachytí automaticky; u ostatních modů vyberte žetony a klikněte na Prozkoumat, nebo zavolejte Hexploration.revealAround(token) z vlastního modu.',
        ],
      },
      locations: {
        heading: 'Pojmenované hexy a umístění',
        points: [
          'Označit místo změní vybrané žetony na skrytá místa. Žeton, který je již pod hexem, je okamžitě skryt; jinak je skryta další výplní, která jej zakrývá.',
          'Žetony se značkou stavu bílé věže jsou při vyplňování také považovány za místa, jako ve verzi 1.',
          'Žetony skrytých umístění se přesunou do vrstvy GM. Když je jejich hex odhalen, vrátí se do vrstvy žetonů se zobrazeným jménem a jejich objev je oznámen.',
          'Pojmenovat hex dá hexu jméno bez žetonu. Jméno se GM zobrazí jako popisek na vrstvě GM a oznámí se, když je hex odhalen.',
          'Oznamovat objevy určuje, zda oznámení uvidí všichni, pouze GM, nebo nikdo. Pingnout objevy navíc přesune pohled hráčů na dané místo.',
        ],
      },
      settings: {
        heading: 'Nastavení',
        intro:
          'Nastavení změníte příkazem !hexploration set (nebo tlačítkem Nastavení). Vrstvu šestiúhelníků, Žetony, které odhalují, a Jazyk lze nastavit také na stránce nastavení modu.',
        colKey: 'Klíč',
        colName: 'Nastavení',
        colDesc: 'Popis',
        perPage: '(Lze nastavit na stránku.)',
      },
      jumpgate: {
        heading: 'Jumpgate a Legacy',
        points: [
          'Heexploration zjistí, který engine hra používá, a nakreslí odpovídající druh tvaru. Tvary nakreslené v obou editorech lze vyplnit.',
          'Když je Vrstva šestiúhelníků nastavena na Auto, hexy se kreslí na vrstvu popředí nad žetony, takže hráči nevidí, co je pod nimi. Pokud vrstva popředí není k dispozici, použije se místo ní vrstva žetonů.',
          'Jumpgate kreslí matematicky pravidelné hexy, které mají trochu jiný tvar než hexy Legacy. Pokud hexy nejsou zarovnány s mřížkou stránky, přichyťte token ke středu hexu, vyberte jej a klikněte na Kalibrovat. Vyberte dva žetony na sousedních hexech stejného řádku (Hex V) nebo sloupce (Hex H), abyste také opravili velikost hexu.',
          'Když se stránka nebo hra zkopíruje, její hexy získají nová ID. Spusťte na stránce Znovu skenovat, aby se znovu načetly spolu se svými popisky jmen a žetony míst.',
        ],
      },
      upgrading: {
        heading: 'Upgrade z verze 1',
        points: [
          'Verze 2 již nepotřebuje PathMath, MatrixMath, Vector Math nebo HTML Builder. Můžete je odstranit, pokud je nepoužívá jiný mod.',
          'Stávající hexové mapy, názvy, tokeny lokací a nastavení se při prvním spuštění automaticky aktualizují.',
          'Příkazy verze 1, včetně makra Hexploration_menu, stále fungují.',
          'Verze 1 umožňovala odhalovat hexy každému žetonu, který představoval postavu. Chcete-li toto chování zachovat, nastavte Žetony, které odhalují, na Žetony postav.',
        ],
        colV1: 'Příkaz verze 1',
        colV2: 'Příkaz verze 2',
      },
      troubleshooting: {
        heading: 'Odstraňování problémů',
        points: [
          'Když se žeton pohne, nic se nestane: zkontrolujte, zda je žeton na vrstvě žetonů a odpovídá nastavení Žetony, které odhalují, a zda stránka obsahuje hexy (!hexploration status).',
          'Hexy jsou odsazeny od mřížky: použijte Kalibrovat a poté zkontrolujte pomocí žetonu několik hexů po mapě.',
          'Po zkopírování stránky nebo hry se hexy přestaly odhalovat: spusťte na stránce Znovu skenovat.',
          'Vyplnit hlásí, že oblast neobsahuje žádné středy hexů: tvar musí obsahovat střed alespoň jednoho hexu.',
          'Pro cokoli jiného zkontrolujte protokol konzoly API a při žádosti o pomoc zahrňte jeho zprávy.',
        ],
      },
      languages: {
        heading: 'Jazyky',
        body: 'Jazyk vyberte příkazem !hexploration set language. Dostupné jazyky:',
        colLanguage: 'Jazyk',
        colNative: 'Vlastní název',
        colCode: 'Kód',
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

  const TRANSLATION$i = {
    titles: {
      ready: 'Hexploration er klar.',
      settings: 'Indstillinger for Hexploration',
      languages: 'Vælg et sprog',
      pageSettings: 'Sideindstillinger: {page}',
      status: 'Hexploration-status: {page}',
      help: 'Hexploration-kommandoer',
      confirm: 'Bekræft venligst',
    },
    discovery: {
      title: 'Sted opdaget',
    },
    menu: {
      draw: 'Tegn',
      reveal: 'Afslør og skjul',
      locations: 'Steder',
      tools: 'Værktøjer',
      layerInUse: 'Nye hexfelter tegnes på {layer}.',
      pageSettingsHelp:
        'Disse indstillinger gælder kun for denne side. Indstillinger markeret ★ tilsidesætter de globale indstillinger.',
    },
    buttons: {
      fill: 'Fyld',
      fillInverse: 'Omvendt fyld',
      undo: 'Fortryd fyld',
      reveal: 'Afslør',
      conceal: 'Skjul',
      explore: 'Udforsk',
      revealPage: 'Afslør side',
      resetPage: 'Nulstil side',
      mark: 'Marker sted',
      unmark: 'Fjern markering',
      name: 'Navngiv hexfelt',
      settings: 'Indstillinger',
      pageSettings: 'Sideindstillinger',
      status: 'Status',
      rescan: 'Scan igen',
      calibrate: 'Kalibrer',
      calibrateReset: 'Nulstil kalibrering',
      help: 'Hjælp',
      change: 'Skift',
      menu: 'Menu',
      clearOverrides: 'Ryd tilsidesættelser',
      confirmReset: 'Ja, fjern alle hexfelter',
    },
    prompts: {
      name: 'Stednavn (lad feltet være tomt for at rydde)',
    },
    values: {
      on: 'Til',
      off: 'Fra',
      none: 'Ingen',
      hexLayer: {
        auto: 'Auto (forgrund, hvis tilgængelig)',
        foreground: 'forgrundslaget',
        objects: 'tokenlaget',
      },
      revealBy: {
        players: 'Spillertokens',
        characters: 'Karaktertokens',
        all: 'Alle tokens',
      },
      revealMode: {
        clear: 'Fjern',
        glimpse: 'Glimt',
      },
      announce: {
        all: 'Alle',
        gm: 'Kun GM',
        off: 'Fra',
      },
      orientation: {
        vertical: 'Hex (V)',
        horizontal: 'Hex (H)',
      },
      fillKind: {
        fill: 'Fyld',
        fillInverse: 'Omvendt fyld',
        conceal: 'Skjul',
      },
    },
    settings: {
      language: {
        label: 'Sprog',
        desc: 'Sprog til menuer, beskeder og uddelingskopier.',
      },
      hexLayer: {
        label: 'Lag for hexfelter',
        desc: 'Hvor nye hexfelter tegnes. Auto prøver forgrundslaget (over tokens) og falder tilbage til tokenlaget, hvis spillet ikke understøtter det.',
      },
      fillColor: {
        label: 'Fyldfarve',
        desc: 'Farve på nye sekskanter. Brug rgba() til gennemsigtige hexes, for eksempel rgba(0,0,0,0.8).',
      },
      strokeColor: {
        label: 'Kantfarve',
        desc: 'Farve på omridset af nye sekskanter.',
      },
      labelColor: {
        label: 'Etiketfarve',
        desc: 'Farven på GM-only navneetiketter på navngivne sekskanter.',
      },
      glimpseColor: {
        label: 'Glimtfarve',
        desc: 'Den farve, hexfelter skifter til, når de skimtes (afsløringstilstanden Glimt). Brug en gennemsigtig rgba()-farve.',
      },
      strokeWidth: {
        label: 'Kantbredde',
        desc: 'Bredden af ​​omridset af nye sekskanter, i pixels (0 til 20).',
      },
      maxDistance: {
        label: 'Afsløringsafstand for hexfelter',
        desc: 'Gemmes på hexfelterne, når de udfyldes, så indstil den før udfyldning: Ændres den senere, påvirker det ikke hexfelter, der allerede er på kortet. Et token skal være inden for så mange hexfelter for at afsløre dem, uanset hvor langt det kan se; med 0 afsløres de kun ved at gå ind i dem. Brug den til bjerge eller skove. Lad feltet stå tomt for ingen grænse.',
      },
      revealDistance: {
        label: 'Synsafstand',
        desc: 'Hvor mange sekskanter omkring et bevægeligt token afsløres (0 til 20). 0 afslører kun de sekskanter, som tokenet passerer igennem.',
      },
      lineOfSight: {
        label: 'Synslinje',
        desc: 'Når den er slået til, skjuler hexfelter, der forbliver dækket, såsom bjerge udfyldt med en Afsløringsafstand for hexfelter, hexfelterne bag dem. Den gør kun en forskel med en Synsafstand på 2 eller mere.',
      },
      revealPath: {
        label: 'Afslør langs ruten',
        desc: 'Når den er tændt, afsløres hver hex, et token passerer igennem, mens det trækkes (inklusive waypoints), ikke kun hvor det stopper.',
      },
      revealBy: {
        label: 'Afslørende tokens',
        desc: 'Hvilke tokens på tokenlaget afslører hexes: tokens kontrolleret af en spiller, tokens, der repræsenterer en hvilken som helst karakter, eller hver token.',
      },
      revealMode: {
        label: 'Afsløringstilstand',
        desc: 'Fjern fjerner hexfelter inden for synsvidde. Glimt gør dem i stedet gennemsigtige; de fjernes, når et token går ind i dem.',
      },
      announce: {
        label: 'Annoncer opdagelser',
        desc: 'Hvem ser chatbeskeden, når en navngivet placering opdages.',
      },
      pingDiscoveries: {
        label: 'Ping opdagelser',
        desc: 'Når den er aktiveret, bliver spillere pinget til en navngiven placering, når den opdages.',
      },
      hideCoveredTokens: {
        label: 'Skjul dækkede tokens',
        desc: 'Roll20 tegner navne, streger og auraer over sekskanter. Når den er tændt, har tokens under en dækket sekskant deres spillersynlige navn, bjælker og auraer slået fra og tændt igen, når de afsløres.',
      },
    },
    status: {
      engine: 'Spilmotor',
      grid: 'Gitter',
      layer: 'Lag for hexfelter',
      hexes: 'Hexfelter',
      named: 'Navngivne hexfelter',
      icons: 'Stedtokens',
      glimpsed: 'Gennemsigtige hexfelter',
      pending: 'Steder, der venter på fyld',
      calibrated: 'Kalibreret',
      overrides: 'Sidetilsidesættelser',
      undo: 'Fortryd tilgængelig',
    },
    messages: {
      filled:
        'Fyld færdig. Hexer tegnede: {created}. Omstilet: {restyled}. Steder skjult: {icons}.',
      revealed: 'Hexer afsløret: {count}.',
      revealedPage: 'Hver hex på siden afsløret ({count}).',
      confirmReset:
        'Vil du fjerne hver hex fra "{page}" ({count})? Placeringstokens vender tilbage til tokenlaget. Fortryd kan ikke fortryde dette.',
      resetPage: 'Hexer fjernet fra siden: {count}.',
      undone:
        'Sidste udfyldning fortrydet. Hekser fjernet: {removed}. Restyled hexes gendannet: {restored}.',
      named: 'Hexer med navnet "{name}": {count}.',
      unnamed: 'Navne ryddet: {count}.',
      marked:
        'Placeringer skjult i eksisterende hexes: {attached}. Venter på den næste fyldning, der dækker dem: {pending}.',
      unmarked: 'Tokens, der ikke længere er placeringer: {count}.',
      settingChanged: '{setting} indstillet til {value}.',
      rescanned:
        'Genscanning fuldført. Gemt: {kept}. Vedtaget: {adopted}. Genindgivet: {moved}. Manglende og glemt: {dropped}. Etiketter genlinket: {labels}. Placeringstokens genlinket: {icons}.',
      calibrated:
        'Gitter kalibreret (kolonnetrin {colStep}px, rækketrin {rowStep}px). Genscan: beholdt {kept}, genindsendt {moved}, adopteret {adopted}.',
      calibrationReset:
        'Kalibrering fjernet. Genscan: beholdt {kept}, genindleveret {moved}, adopteret {adopted}.',
      journalRebuilt: 'Uddelingsarkene "{help}" og "{deck}" er blevet genopbygget.',
      migrated:
        'Dine Hexploration 1.x-hexkort er blevet opgraderet. Hvis dette spil blev kopieret fra et Legacy-spil, skal du køre Scan igen på hver side med et hexkort.',
      pruned:
        'Gemte hexfelter, der ikke længere findes og er blevet glemt: {dropped}. Hvis dette spil eller denne side blev kopieret, skal du køre Scan igen på siden for at finde dens hexfelter igen.',
      readyHint:
        'Skriv !hexploration for at åbne menuen, eller åbn uddelingsarket "Hexploration - Command Deck".',
    },
    warnings: {
      foregroundUnavailable:
        'Dette spil understøtter ikke tegning på forgrundslaget, så der blev tegnet sekskanter på tokenlaget.',
      someFailed: 'Hexer, der ikke kunne tegnes: {count}. Tjek API-konsollen for detaljer.',
    },
    errors: {
      noPage: 'Kunne ikke finde siden at arbejde på.',
      notHex: 'Denne side bruger ikke et hex-gitter.',
      noPolygons: 'Vælg en eller flere tegnede figurer, der skal udfyldes.',
      emptyArea: 'Det valgte område indeholder ingen hex-centre.',
      tooMany: 'Det ville skabe for mange hexes på én gang ({count}).',
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
      journal: 'Genopbyg uddelingsarkene Help og Command Deck.',
      help: 'Vis denne liste.',
      handout: 'Fuldstændige instruktioner findes i "{name}" uddelingsark.',
    },
    deck: {
      drawDesc:
        'Tegn figurer rundt om et område, vælg dem, og fyld derefter. Fortryd fyld annullerer den sidste fyldning.',
      revealDesc:
        'Vælg hexfelter, figurer eller tokens for at afsløre dem eller dække dem igen. Udforsk afslører omkring valgte tokens, som om de var flyttet.',
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
          'Vælg figurerne, og klik på Fyld i Command Deck (eller skriv !hexploration fill). Figurerne erstattes af hexfelter.',
          'Valgfrit: Før du fylder, kan du vælge tokens for vigtige steder og klikke på Marker sted. De skjules under hexfelterne og annonceres, når de opdages.',
          'Flyt et spillertoken. Hvert hexfelt, det passerer igennem, og hexfelterne inden for dets Synsafstand afsløres.',
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
          'Kun tokens på tokenlaget afslører hexfelter. Hvilke tokens der tæller, bestemmes af Afslørende tokens: som standard spillertokens, så GM kan flytte monstre uden at afdække kortet.',
          'Et token afslører hvert hexfelt, det dækker (store tokens dækker flere), og med Afslør langs ruten slået til hvert hexfelt på den rute, det blev trukket langs, inklusive mellempunkter.',
          'Synsafstand afslører hexfelterne omkring hvert af disse hexfelter, de nærmeste først. Med Synslinje slået til afsløres et hexfelt ikke, så længe der ligger et dækket hexfelt mellem det og tokenet. Nærmere hexfelter afsløres som regel først, så i åbent terræn ændrer Synslinje intet: Den har kun betydning med en Synsafstand på 2 eller mere og hexfelter, der forbliver dækket, såsom terræn udfyldt med en Afsløringsafstand for hexfelter.',
          'Afsløringsafstand for hexfelter gemmes på hvert hexfelt, når det udfyldes, så indstil den før udfyldning; ændres den senere, påvirker det ikke hexfelter, der allerede er på kortet. Et token skal være inden for så mange hexfelter for at afsløre dem, uanset hvor langt det kan se, og med 0 afsløres de kun ved at gå ind i dem. Til en bjergkæde: Sæt Afsløringsafstand for hexfelter til 0, udfyld bjergene, sæt den tilbage til ingen, og udfyld derefter landet bagved. Med Synsafstand 3 og Synslinje slået til ser gruppen det åbne terræn omkring sig, men ikke bjergene eller det, der ligger bag dem. Hvert bjerghexfelt afsløres, når et token går ind i det.',
          'I tilstanden Glimt bliver hexfelter inden for synsvidde gennemsigtige i stedet for at forsvinde og fjernes, når et token går ind i dem. Gennemsigtige Glimt-hexfelter blokerer ikke Synslinje.',
          'Roll20 tegner tokennavne, bjælker og auraer oven over hexfelterne. Med Skjul dækkede tokens slået til får et token under et dækket hexfelt sit navn, sine bjælker og auraer, som spillerne kan se, slået fra, indtil det afdækkes, så skjulte monstre ikke afslører sig selv. Hvis du slår en af dem til, mens tokenet er dækket, forbliver den skjult og slås til, når tokenet afdækkes.',
          'API’en rapporterer ikke flytninger foretaget af andre mods. Flytninger med TokenMod opfanges automatisk; for andre mods skal du vælge tokens og klikke på Udforsk eller kalde Hexploration.revealAround(token) fra din egen mod.',
        ],
      },
      locations: {
        heading: 'Navngivne Hekser og Steder',
        points: [
          'Marker sted forvandler de valgte tokens til skjulte steder. Et token, der allerede ligger under et hexfelt, skjules med det samme; ellers skjules det af den næste fyldning, der dækker det.',
          'Tokens med det hvide tårns statusmarkør behandles også som placeringer, når du udfylder, som i version 1.',
          'Skjulte placeringstokens flyttes til GM-laget. Når deres hex afsløres, vender de tilbage til token-laget med deres navn vist, og deres opdagelse annonceres.',
          'Navngiv hexfelt giver et hexfelt et navn uden et token. Navnet vises for GM som en etiket på GM-laget og annonceres, når hexfeltet afsløres.',
          'Annoncer opdagelser bestemmer, om alle, kun GM eller ingen ser meddelelsen. Ping opdagelser flytter desuden spillernes visning hen til stedet.',
        ],
      },
      settings: {
        heading: 'Indstillinger',
        intro:
          'Skift indstillinger med !hexploration set (eller knappen Indstillinger). Lag for hexfelter, Afslørende tokens og Sprog kan også indstilles på modens indstillingsside.',
        colKey: 'Nøgle',
        colName: 'Indstilling',
        colDesc: 'Beskrivelse',
        perPage: '(Kan indstilles pr. side.)',
      },
      jumpgate: {
        heading: 'Jumpgate og Legacy',
        points: [
          'Hexploration finder ud af, hvilken motor spillet bruger, og tegner den matchende form. Figurer tegnet i begge editorer kan udfyldes.',
          'Når Lag for hexfelter er sat til Auto, tegnes hexfelter på forgrundslaget over tokens, så spillerne ikke kan se, hvad der er nedenunder. Hvis forgrundslaget ikke er tilgængeligt, bruges tokenlaget i stedet.',
          'Jumpgate tegner matematisk regulære hexfelter, som har en lidt anden form end Legacy-hexfelter. Hvis hexfelterne ikke flugter med en sides gitter, så fastgør et token til midten af et hexfelt, vælg det, og klik på Kalibrer. Vælg to tokens i nabohexfelter i samme række (Hex V) eller kolonne (Hex H) for også at rette hexfeltstørrelsen.',
          'Når en side eller et spil kopieres, får hexfelterne nye id’er. Kør Scan igen på siden for at finde dem igen sammen med deres navneetiketter og stedtokens.',
        ],
      },
      upgrading: {
        heading: 'Opgradering fra version 1',
        points: [
          'Version 2 behøver ikke længere PathMath, MatrixMath, Vector Math eller HTML Builder. Du kan fjerne dem, medmindre en anden mod bruger dem.',
          'Eksisterende hex-kort, navne, placeringstokens og indstillinger opgraderes automatisk ved første start.',
          'Version 1-kommandoerne, inklusive makroen Hexploration_menu, virker stadig.',
          'I version 1 kunne ethvert token, der repræsenterede en karakter, afsløre hexfelter. Sæt Afslørende tokens til Karaktertokens for at bevare den adfærd.',
        ],
        colV1: 'Version 1 kommando',
        colV2: 'Version 2 kommando',
      },
      troubleshooting: {
        heading: 'Fejlfinding',
        points: [
          'Der sker ikke noget, når et token flytter sig: Kontroller, at tokenet ligger på tokenlaget og matcher Afslørende tokens, og at siden har hexfelter (!hexploration status).',
          'Hexfelterne er forskudt i forhold til gitteret: Brug Kalibrer, og kontroller derefter med et token på nogle få hexfelter rundt om på kortet.',
          'Hexfelterne holdt op med at blive afsløret efter kopiering af en side eller et spil: Kør Scan igen på siden.',
          'Fyld siger, at området ikke har nogen hexfeltcentre: Figuren skal indeholde midten af mindst ét hexfelt.',
          'For alt andet skal du tjekke API-konsolloggen og inkludere dens meddelelser, når du beder om hjælp.',
        ],
      },
      languages: {
        heading: 'Sprog',
        body: 'Vælg et sprog med !hexploration set sprog. Tilgængelige sprog:',
        colLanguage: 'Sprog',
        colNative: 'Eget navn',
        colCode: 'Kode',
      },
      credits: {
        heading: 'Kreditter',
        original: 'Original mod af',
        maintainer: 'Version 2 vedligeholdes af',
        marketplace: 'Adas kunstpakker på Roll20 Marketplace',
        support:
          'Hvis du finder en fejl eller har en idé, skal du skrive i Roll20 Mod-forummet eller åbne et problem på GitHub og inkludere eventuelle meddelelser fra API-konsollens log.',
      },
    },
  };

  const TRANSLATION$h = {
    titles: {
      ready: 'Hexploration is klaar.',
      settings: 'Hexploration-instellingen',
      languages: 'Kies een taal',
      pageSettings: 'Pagina-instellingen: {page}',
      status: 'Hexploration-status: {page}',
      help: 'Hexploration-opdrachten',
      confirm: 'Bevestig alstublieft',
    },
    discovery: {
      title: 'Locatie ontdekt',
    },
    menu: {
      draw: 'Tekenen',
      reveal: 'Onthullen en verbergen',
      locations: 'Locaties',
      tools: 'Hulpmiddelen',
      layerInUse: 'Nieuwe zeshoeken worden getekend op de {layer}.',
      pageSettingsHelp:
        'Deze instellingen zijn alleen van toepassing op deze pagina. Instellingen gemarkeerd met ★ overschrijven de algemene instellingen.',
    },
    buttons: {
      fill: 'Vullen',
      fillInverse: 'Omgekeerde vulling',
      undo: 'Vulling ongedaan maken',
      reveal: 'Onthullen',
      conceal: 'Verbergen',
      explore: 'Verkennen',
      revealPage: 'Pagina onthullen',
      resetPage: 'Pagina opnieuw instellen',
      mark: 'Locatie markeren',
      unmark: 'Markering opheffen',
      name: 'Zeshoek benoemen',
      settings: 'Instellingen',
      pageSettings: 'Pagina-instellingen',
      status: 'Status',
      rescan: 'Opnieuw scannen',
      calibrate: 'Kalibreren',
      calibrateReset: 'Kalibratie opnieuw instellen',
      help: 'Help',
      change: 'Wijzigen',
      menu: 'Menu',
      clearOverrides: 'Overschrijvingen wissen',
      confirmReset: 'Ja, verwijder alle zeshoeken',
    },
    prompts: {
      name: 'Locatienaam (leeg laten om te wissen)',
    },
    values: {
      on: 'Aan',
      off: 'Uit',
      none: 'Geen',
      hexLayer: {
        auto: 'Automatisch (voorgrond indien beschikbaar)',
        foreground: 'voorgrondlaag',
        objects: 'tokenlaag',
      },
      revealBy: {
        players: 'Spelertokens',
        characters: 'Personagetokens',
        all: 'Alle tokens',
      },
      revealMode: {
        clear: 'Wissen',
        glimpse: 'Glimp',
      },
      announce: {
        all: 'Iedereen',
        gm: 'Alleen GM',
        off: 'Uit',
      },
      orientation: {
        vertical: 'Hex (V)',
        horizontal: 'Hex (H)',
      },
      fillKind: {
        fill: 'Vullen',
        fillInverse: 'Omgekeerde vulling',
        conceal: 'Verbergen',
      },
    },
    settings: {
      language: {
        label: 'Taal',
        desc: "Taal voor menu's, berichten en hand-outs.",
      },
      hexLayer: {
        label: 'Laag voor zeshoeken',
        desc: 'Waar nieuwe zeshoeken worden getekend. Automatisch probeert de voorgrondlaag (boven tokens) en valt terug op de tokenlaag als het spel die niet ondersteunt.',
      },
      fillColor: {
        label: 'Vulkleur',
        desc: 'Kleur van nieuwe vakjes. Gebruik rgba() voor doorzichtige hexen, bijvoorbeeld rgba(0,0,0,0.8).',
      },
      strokeColor: {
        label: 'Randkleur',
        desc: 'Kleur van de omtrek van nieuwe vakjes.',
      },
      labelColor: {
        label: 'Labelkleur',
        desc: 'Kleur van de GM-only naamlabels op benoemde vakjes.',
      },
      glimpseColor: {
        label: 'Glimpkleur',
        desc: 'Kleur die zeshoeken krijgen wanneer er een glimp van wordt opgevangen (onthullingsmodus Glimp). Gebruik een doorzichtige rgba()-kleur.',
      },
      strokeWidth: {
        label: 'Randbreedte',
        desc: 'Breedte van de omtrek van nieuwe vakken, in pixels (0 tot 20).',
      },
      maxDistance: {
        label: 'Onthullingsafstand van zeshoeken',
        desc: 'Wordt bij het vullen in de zeshoeken opgeslagen, dus stel dit in vóór het vullen: later wijzigen heeft geen effect op zeshoeken die al op de kaart staan. Een token moet zich binnen zoveel zeshoeken bevinden om ze te onthullen, hoe ver het ook kan kijken; bij 0 worden ze alleen onthuld door ze te betreden. Gebruik dit voor bergen of bossen. Laat leeg voor geen limiet.',
      },
      revealDistance: {
        label: 'Zichtafstand',
        desc: 'Hoeveel vakjes rond een bewegend pion worden onthuld (0 tot 20). 0 onthult alleen de vakjes waar het fiche doorheen gaat.',
      },
      lineOfSight: {
        label: 'Zichtlijn',
        desc: 'Wanneer deze optie aan staat, verbergen zeshoeken die bedekt blijven, zoals bergen die zijn gevuld met een Onthullingsafstand van zeshoeken, de zeshoeken erachter. Het maakt alleen verschil bij een Zichtafstand van 2 of meer.',
      },
      revealPath: {
        label: 'Onthullen langs pad',
        desc: 'Wanneer deze optie is ingeschakeld, wordt elke vakje waar een token doorheen gaat tijdens het slepen (inclusief tussenpunten) onthuld, niet alleen waar het stopt.',
      },
      revealBy: {
        label: 'Tokens die onthullen',
        desc: 'Welke tokens op de tokenlaag onthullen hexen: tokens die door een speler worden beheerd, tokens die een willekeurig personage vertegenwoordigen, of elk token.',
      },
      revealMode: {
        label: 'Onthullingsmodus',
        desc: 'Wissen verwijdert zeshoeken binnen het zicht. Glimp maakt ze in plaats daarvan doorzichtig; ze worden verwijderd wanneer een token ze betreedt.',
      },
      announce: {
        label: 'Ontdekkingen aankondigen',
        desc: 'Wie ziet het chatbericht wanneer een genoemde locatie wordt ontdekt?',
      },
      pingDiscoveries: {
        label: 'Ontdekkingen pingen',
        desc: 'Wanneer deze optie is ingeschakeld, worden spelers naar een genoemde locatie gepingd wanneer deze wordt ontdekt.',
      },
      hideCoveredTokens: {
        label: 'Bedekte tokens verbergen',
        desc: "Roll20 tekent namen, balken en aura's boven velden. Wanneer deze zijn ingeschakeld, zijn de voor de speler zichtbare naam, balken en aura's van tokens onder een afgedekt vakje uitgeschakeld, en weer ingeschakeld wanneer ze worden blootgelegd.",
      },
    },
    status: {
      engine: 'Game-engine',
      grid: 'Rooster',
      layer: 'Laag voor zeshoeken',
      hexes: 'Zeshoeken',
      named: 'Benoemde zeshoeken',
      icons: 'Locatietokens',
      glimpsed: 'Doorzichtige zeshoeken',
      pending: 'Locaties die op een vulling wachten',
      calibrated: 'Gekalibreerd',
      overrides: 'Pagina-overschrijvingen',
      undo: 'Ongedaan maken beschikbaar',
    },
    messages: {
      filled:
        'Vul compleet. Getekende vakjes: {created}. Gerestyled: {restyled}. Locaties verborgen: {icons}.',
      revealed: 'Hexen onthuld: {count}.',
      revealedPage: 'Elke zeshoek op de pagina wordt onthuld ({count}).',
      confirmReset:
        'Elke hex verwijderen uit "{page}" ({count})? Locatietokens keren terug naar de tokenlaag. Ongedaan maken kan dit niet ongedaan maken.',
      resetPage: 'Hexes verwijderd van de pagina: {count}.',
      undone:
        'Laatste vulling ongedaan gemaakt. Hexen verwijderd: {removed}. Gerestylede velden hersteld: {restored}.',
      named: 'Hexen met de naam "{name}": {count}.',
      unnamed: 'Namen gewist: {count}.',
      marked:
        'Locaties verborgen in bestaande vakjes: {attached}. Wachten op de volgende vulling die ze bedekt: {pending}.',
      unmarked: 'Tokens die niet langer locaties zijn: {count}.',
      settingChanged: '{setting} ingesteld op {value}.',
      rescanned:
        'Opnieuw scannen voltooid. Bewaarde: {kept}. Aangenomen: {adopted}. Opnieuw ingediend: {moved}. Vermist en vergeten: {dropped}. Labels opnieuw gekoppeld: {labels}. Locatietokens opnieuw gekoppeld: {icons}.',
      calibrated:
        'Raster gekalibreerd (kolomstap {colStep}px, rijstap {rowStep}px). Opnieuw scannen: {kept} behouden, opnieuw gearchiveerd {moved}, {adopted} overgenomen.',
      calibrationReset:
        'Kalibratie verwijderd. Opnieuw scannen: {kept} behouden, opnieuw gearchiveerd {moved}, {adopted} overgenomen.',
      journalRebuilt: 'De hand-outs "{help}" en "{deck}" zijn opnieuw opgebouwd.',
      migrated:
        'Uw Hexploration 1.x-zeshoekkaarten zijn bijgewerkt. Als dit spel is gekopieerd uit een Legacy-spel, voer dan Opnieuw scannen uit op elke pagina met een zeshoekkaart.',
      pruned:
        'Opgeslagen zeshoeken die niet meer bestaan en zijn vergeten: {dropped}. Als dit spel of deze pagina is gekopieerd, voer dan Opnieuw scannen uit op de pagina om de zeshoeken weer op te pikken.',
      readyHint:
        'Typ !hexploration voor het menu, of open de hand-out "Hexploration - Command Deck".',
    },
    warnings: {
      foregroundUnavailable:
        'Dit spel biedt geen ondersteuning voor tekenen op de voorgrondlaag, dus werden er vakjes op de tokenlaag getekend.',
      someFailed:
        'Velden die niet konden worden getekend: {count}. Controleer de API-console voor meer informatie.',
    },
    errors: {
      noPage: 'Kon de pagina niet vinden om aan te werken.',
      notHex: 'Deze pagina maakt geen gebruik van een hex-raster.',
      noPolygons: 'Selecteer een of meer getekende vormen om te vullen.',
      emptyArea: 'Het geselecteerde gebied bevat geen hex-centra.',
      tooMany: 'Dat zou te veel velden in één keer creëren ({count}).',
      nothingToConceal: 'Selecteer getekende vormen of tokens om te verbergen.',
      nothingToReveal: 'Selecteer vakjes, getekende vormen of tokens om te onthullen.',
      noTokens: 'Selecteer eerst een of meer tokens.',
      noHexes: 'Selecteer eerst een of meer vakjes (of fiches die op vakjes staan).',
      nothingToUndo: 'Er is geen vulling die ongedaan kan worden gemaakt.',
      unknownCommand: 'Onbekend commando: {command}',
      unknownSetting: 'Onbekende instelling: {key}',
      unknownPageSetting: 'Instellingen die per pagina kunnen worden ingesteld: {keys}',
      invalidValue: '"{value}" is geen geldige waarde voor {key}.',
      calibrateNeedsTokens:
        'Selecteer een of twee tokens die op de middelpunten van de zeshoeken zijn vastgemaakt.',
      calibrateFailed: 'Deze tokens kunnen niet worden gebruikt om te kalibreren.',
      unexpected: 'Er is iets misgegaan: {message}',
    },
    hints: {
      noPage: 'Open de pagina waaraan u wilt werken of selecteer er iets op.',
      notHex: 'Stel het paginaraster in op Hex (V) of Hex (H) in Pagina-instellingen.',
      noPolygons:
        'Teken een veelhoek, rechthoek, ellips of vorm uit de vrije hand rond het gebied, selecteer het en probeer het opnieuw.',
      emptyArea: 'Teken een grotere vorm of controleer de paginarasterinstellingen.',
      tooMany: 'Vul een kleiner gebied, of splits het gebied in verschillende vormen.',
      noHexes:
        'Hexes bevinden zich op de voorgrond of tokenlaag; ga naar die laag om ze te selecteren.',
      unknownCommand: 'Typ !hexploration help om de opdrachten weer te geven.',
      unknownSetting: 'Typ !hexploration set om elke instelling te bekijken.',
      calibrateNeedsTokens:
        'Plaats een token in het midden van een vakje en selecteer het. Selecteer een tweede token dat is vastgemaakt aan een aangrenzende hex in dezelfde rij (Hex V) of kolom (Hex H) om ook de hex-grootte te corrigeren.',
      calibrateFailed:
        'Twee fiches moeten zich in dezelfde rij (Hex V) of dezelfde kolom (Hex H) bevinden, met minstens één vakje uit elkaar.',
      unexpected: 'Details staan ​​in het API-consolelogboek.',
    },
    help: {
      menu: 'Laat de menukaart zien.',
      fill: 'Bedek de geselecteerde getekende vormen met vakjes.',
      fillInverse: 'Bedek de hele pagina, behalve binnen de geselecteerde vormen.',
      undo: 'Maak de laatste vulling ongedaan, keer de vulling om of verberg deze, en herstel de gebruikte vormen.',
      reveal:
        'Onthul de geselecteerde velden en de velden onder de geselecteerde vormen en fiches.',
      revealPage: 'Onthul elke hex op de pagina zonder aankondigingen.',
      conceal: 'Bedek het gebied onder de geselecteerde vormen en fiches opnieuw met vakjes.',
      explore: 'Onthul de geselecteerde tokens alsof ze er net naartoe zijn verhuisd.',
      resetPage: 'Verwijder elk vakje op de pagina (eerst gevraagd).',
      name: 'Geef de geselecteerde velden een naam, of de velden onder de geselecteerde tokens. Laat de naam leeg om deze te wissen.',
      mark: 'Verander de geselecteerde tokens in verborgen locaties.',
      unmark: 'Voorkom dat de geselecteerde tokens verborgen locaties zijn.',
      set: 'Wijzig een instelling of toon alle instellingen.',
      pageSet: 'Overschrijf een instelling voor onthullen alleen op de huidige pagina.',
      pageClear: 'Verwijder de overschrijvingen van de huidige pagina.',
      rescan:
        'Bouw de hexlijst van de pagina opnieuw op, bijvoorbeeld na het kopiëren van een pagina of spel.',
      calibrate:
        'Lijn het hexraster uit met een of twee geselecteerde tokens die op het midden van een hex zijn vastgeklikt.',
      calibrateReset: 'Verwijder de kalibratie van de huidige pagina.',
      status: 'Laat zien wat Hexploration weet over de huidige pagina.',
      journal: 'Bouw de hand-outs Help en Command Deck opnieuw op.',
      help: 'Laat deze lijst zien.',
      handout: 'Volledige instructies vindt u in de hand-out "{name}".',
    },
    deck: {
      drawDesc:
        'Teken vormen rond een gebied, selecteer ze en vul ze dan. Vulling ongedaan maken draait de laatste vulling terug.',
      revealDesc:
        'Selecteer zeshoeken, vormen of tokens om ze te onthullen of weer te bedekken. Verkennen onthult de omgeving van geselecteerde tokens alsof ze daarheen zijn verplaatst.',
      locationsDesc:
        'Selecteer tokens om ze te verbergen als locaties onder vakjes. Selecteer vakken of tokens om een ​​vak een naam te geven.',
      toolsDesc:
        "Instellingen, paginaoverschrijvingen, status, gekopieerde pagina's opnieuw scannen en het raster kalibreren.",
      footer: 'Zie de hand-out "{help}" voor volledige instructies.',
    },
    handout: {
      versionLabel: 'Versie',
      subtitle: 'Hex-voor-hex verkenning voor Roll20',
      footer: 'Gebruik de hand-out "{deck}" voor bediening met één klik.',
      overview: {
        heading: 'Overzicht',
        body: 'Hexploration beslaat een hex-kaart met ondoorzichtige vakjes. Terwijl het gezelschap beweegt, worden de vakken waar ze doorheen gaan (en, als je wilt, de vakken eromheen) verwijderd, zodat de kaart vakje voor vakje wordt blootgelegd. Verborgen locaties kunnen onder vakjes worden geplaatst en worden aangekondigd wanneer ze worden gevonden. Het werkt in Jumpgate- en Legacy-spellen, op Hex (V) en Hex (H) rasters van elke grootte.',
        demo: 'Bekijk een korte demo (vanaf versie 1)',
      },
      quickStart: {
        heading: 'Snel beginnen',
        steps: [
          'Open een pagina waarvan het raster is ingesteld op Hex (V) of Hex (H).',
          'Teken een of meer vormen (veelhoek, rechthoek, ellips of uit de vrije hand) rond het gebied dat u wilt verbergen.',
          'Selecteer de vormen en klik in het Command Deck op Vullen (of typ !hexploration fill). De vormen worden vervangen door zeshoeken.',
          'Optioneel: selecteer vóór het vullen tokens voor belangrijke plaatsen en klik op Locatie markeren. Ze worden verborgen onder de zeshoeken en aangekondigd wanneer ze worden ontdekt.',
          'Verplaats een spelertoken. Elke zeshoek waar het doorheen gaat, en de zeshoeken binnen zijn Zichtafstand, worden onthuld.',
        ],
      },
      commands: {
        heading: "Commando's",
        intro:
          "Alleen GM's kunnen deze commando's gebruiken. De meeste werken op de geselecteerde objecten; de rest handelt op de pagina die u bekijkt.",
        colCommand: 'Commando',
        colDesc: 'Wat het doet',
      },
      revealing: {
        heading: 'Hoe onthullen werkt',
        points: [
          'Alleen tokens op de tokenlaag onthullen zeshoeken. Welke tokens meetellen, bepaalt Tokens die onthullen: standaard spelertokens, zodat de GM monsters kan verplaatsen zonder de kaart bloot te leggen.',
          'Een token onthult elke zeshoek die het bedekt (grote tokens bedekken er meerdere) en, als Onthullen langs pad aan staat, elke zeshoek op de route waarlangs het is gesleept, inclusief tussenpunten.',
          'Zichtafstand onthult de zeshoeken rond elk van die zeshoeken, de dichtstbijzijnde eerst. Als Zichtlijn aan staat, wordt een zeshoek niet onthuld zolang er een bedekte zeshoek tussen die zeshoek en het token ligt. Dichterbij gelegen zeshoeken worden meestal eerst onthuld, dus in open terrein verandert Zichtlijn niets: het telt alleen bij een Zichtafstand van 2 of meer en zeshoeken die bedekt blijven, zoals terrein dat is gevuld met een Onthullingsafstand van zeshoeken.',
          'Onthullingsafstand van zeshoeken wordt bij het vullen in elke zeshoek opgeslagen, dus stel dit in vóór het vullen; later wijzigen heeft geen effect op zeshoeken die al op de kaart staan. Een token moet zich binnen zoveel zeshoeken bevinden om ze te onthullen, hoe ver het ook kan kijken, en bij 0 worden ze alleen onthuld door ze te betreden. Voor een bergketen: stel Onthullingsafstand van zeshoeken in op 0, vul de bergen, zet de waarde terug op geen en vul daarna het land erachter. Met Zichtafstand 3 en Zichtlijn aan ziet de groep het open terrein om zich heen, maar niet de bergen of wat erachter ligt. Elke bergzeshoek wordt onthuld wanneer een token erin stapt.',
          'In de modus Glimp worden zeshoeken binnen het zicht doorzichtig in plaats van te verdwijnen, en ze worden verwijderd wanneer een token ze betreedt. Doorzichtige Glimp-zeshoeken blokkeren de Zichtlijn niet.',
          'Roll20 tekent tokennamen, balken en aura’s boven de zeshoeken. Als Bedekte tokens verbergen aan staat, worden bij een token onder een bedekte zeshoek de voor spelers zichtbare naam, balken en aura’s uitgeschakeld totdat het wordt onthuld, zodat verborgen monsters zichzelf niet verraden. Als u een ervan inschakelt terwijl het token bedekt is, blijft het verborgen en wordt het ingeschakeld zodra het token wordt onthuld.',
          'De API meldt geen verplaatsingen door andere mods. Verplaatsingen door TokenMod worden automatisch opgepikt; voor andere mods selecteert u de tokens en klikt u op Verkennen, of roept u Hexploration.revealAround(token) aan vanuit uw eigen mod.',
        ],
      },
      locations: {
        heading: 'Genoemde velden en locaties',
        points: [
          'Locatie markeren verandert de geselecteerde tokens in verborgen locaties. Een token dat al onder een zeshoek ligt, wordt meteen verborgen; anders wordt het verborgen door de volgende vulling die het bedekt.',
          'Tokens met de statusmarkering van de witte toren worden bij het vullen ook behandeld als locaties, zoals in versie 1.',
          'Verborgen locatiefiches worden verplaatst naar de GM-laag. Wanneer hun hex wordt onthuld, keren ze terug naar de tokenlaag met hun naam weergegeven, en wordt hun ontdekking aangekondigd.',
          'Zeshoek benoemen geeft een zeshoek een naam zonder token. De naam wordt aan de GM getoond als label op de GM-laag en aangekondigd wanneer de zeshoek wordt onthuld.',
          'Ontdekkingen aankondigen bepaalt of iedereen, alleen de GM of niemand de aankondiging ziet. Ontdekkingen pingen verplaatst bovendien het beeld van de spelers naar de locatie.',
        ],
      },
      settings: {
        heading: 'Instellingen',
        intro:
          'Wijzig de instellingen met !hexploration set (of de knop Instellingen). Laag voor zeshoeken, Tokens die onthullen en Taal kunnen ook worden ingesteld op de instellingenpagina van de mod.',
        colKey: 'Sleutel',
        colName: 'Instelling',
        colDesc: 'Beschrijving',
        perPage: '(Kan per pagina worden ingesteld.)',
      },
      jumpgate: {
        heading: 'Jumpgate en erfenis',
        points: [
          'Hexploration zoekt uit welke engine het spel gebruikt en tekent de bijpassende vorm. Vormen die in beide editors zijn getekend, kunnen worden gevuld.',
          'Als Laag voor zeshoeken op Automatisch staat, worden zeshoeken op de voorgrondlaag getekend, boven de tokens, zodat spelers niet kunnen zien wat eronder ligt. Als de voorgrondlaag niet beschikbaar is, wordt in plaats daarvan de tokenlaag gebruikt.',
          'Jumpgate tekent wiskundig regelmatige zeshoeken, die een iets andere vorm hebben dan Legacy-zeshoeken. Als de zeshoeken niet samenvallen met het raster van een pagina, zet dan een token vast op het midden van een zeshoek, selecteer het en klik op Kalibreren. Selecteer twee tokens in aangrenzende zeshoeken van dezelfde rij (Hex V) of kolom (Hex H) om ook de grootte van de zeshoeken te corrigeren.',
          'Wanneer een pagina of spel wordt gekopieerd, krijgen de zeshoeken nieuwe ID’s. Voer Opnieuw scannen uit op de pagina om ze weer op te pikken, samen met hun naamlabels en locatietokens.',
        ],
      },
      upgrading: {
        heading: 'Upgraden vanaf versie 1',
        points: [
          'Versie 2 heeft niet langer PathMath, MatrixMath, Vector Math of HTML Builder nodig. Je kunt ze verwijderen, tenzij een andere mod ze gebruikt.',
          'Bestaande hexkaarten, namen, locatietokens en instellingen worden bij de eerste start automatisch bijgewerkt.',
          'De opdrachten van versie 1, inclusief de macro Hexploration_menu, werken nog steeds.',
          'In versie 1 kon elk token dat een personage voorstelde zeshoeken onthullen. Stel Tokens die onthullen in op Personagetokens om dat gedrag te behouden.',
        ],
        colV1: 'Versie 1-opdracht',
        colV2: 'Versie 2-opdracht',
      },
      troubleshooting: {
        heading: 'Problemen oplossen',
        points: [
          'Er gebeurt niets wanneer een token beweegt: controleer of het token op de tokenlaag staat en overeenkomt met Tokens die onthullen, en of de pagina zeshoeken heeft (!hexploration status).',
          'Zeshoeken zijn verschoven ten opzichte van het raster: gebruik Kalibreren en controleer daarna met een token op een paar zeshoeken verspreid over de kaart.',
          'Zeshoeken worden niet meer onthuld na het kopiëren van een pagina of spel: voer Opnieuw scannen uit op de pagina.',
          'Vullen meldt dat het gebied geen middelpunten van zeshoeken bevat: de vorm moet het middelpunt van ten minste één zeshoek bevatten.',
          'Voor al het andere kunt u het logboek van de API-console raadplegen en de berichten erbij vermelden als u om hulp vraagt.',
        ],
      },
      languages: {
        heading: 'Talen',
        body: 'Kies een taal met de door !hexploration ingestelde taal. Beschikbare talen:',
        colLanguage: 'Taal',
        colNative: 'Eigen naam',
        colCode: 'Code',
      },
      credits: {
        heading: 'Kredieten',
        original: 'Originele mod door',
        maintainer: 'Versie 2 onderhouden door',
        marketplace: "Ada's kunstpakketten op de Roll20 Marketplace",
        support:
          'Als je een bug vindt of een idee hebt, plaats dan een bericht op het Roll20 Mod-forum of open een probleem op GitHub, en voeg eventuele berichten uit het API-consolelogboek toe.',
      },
    },
  };

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
        desc: 'Stored on hexes when they are filled, so set it before filling: changing it later does not affect hexes already on the map. A token must be within this many hexes to reveal them, however far it can see; with 0 they are only revealed by entering them. Use it for mountains or forests. Leave empty for no limit.',
      },
      revealDistance: {
        label: 'Sight Distance',
        desc: 'How many hexes around a moving token are revealed (0 to 20). 0 reveals only the hexes the token passes through.',
      },
      lineOfSight: {
        label: 'Line of Sight',
        desc: 'When on, hexes that stay covered, such as mountains filled with a Hex Reveal Distance, hide the hexes behind them. It only makes a difference with a Sight Distance of 2 or more.',
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
          'Sight Distance reveals the hexes around each of those hexes, nearest first. With Line of Sight on, a hex is not revealed while a covered hex lies between it and the token. Nearer hexes are usually revealed first, so in open country Line of Sight changes nothing: it only matters with a Sight Distance of 2 or more and hexes that stay covered, such as terrain filled with a Hex Reveal Distance.',
          'Hex Reveal Distance is stored on each hex when it is filled, so set it before filling; changing it later does not affect hexes already on the map. A token must be within that many hexes to reveal them, however far it can see, and with 0 they are only revealed by entering them. For a mountain range: set Hex Reveal Distance to 0, fill the mountains, set it back to none, then fill the land beyond. With Sight Distance 3 and Line of Sight on, the party sees the open ground around them, but not the mountains or what lies behind them. Each mountain hex is revealed when a token walks into it.',
          'In Glimpse mode, hexes within sight become see-through instead of disappearing, and are removed when a token enters them. Glimpsed hexes do not block Line of Sight.',
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
        colLanguage: 'Language',
        colNative: 'Native name',
        colCode: 'Code',
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

  const TRANSLATION$g = {
    titles: {
      ready: 'Hexploration on valmis.',
      settings: 'Hexploration-asetukset',
      languages: 'Valitse kieli',
      pageSettings: 'Sivuasetukset: {page}',
      status: 'Hexploration-tila: {page}',
      help: 'Hexploration-komennot',
      confirm: 'Vahvista',
    },
    discovery: {
      title: 'Sijainti löydetty',
    },
    menu: {
      draw: 'Piirto',
      reveal: 'Paljasta ja piilota',
      locations: 'Sijainnit',
      tools: 'Työkalut',
      layerInUse: 'Uudet heksat piirretään tasolle: {layer}.',
      pageSettingsHelp:
        'Nämä asetukset koskevat vain tätä sivua. ★-merkityt asetukset ohittavat yleiset asetukset.',
    },
    buttons: {
      fill: 'Täytä',
      fillInverse: 'Käänteinen täyttö',
      undo: 'Kumoa täyttö',
      reveal: 'Paljasta',
      conceal: 'Peitä',
      explore: 'Tutki',
      revealPage: 'Paljasta sivu',
      resetPage: 'Nollaa sivu',
      mark: 'Merkitse sijainti',
      unmark: 'Poista merkintä',
      name: 'Nimeä heksa',
      settings: 'Asetukset',
      pageSettings: 'Sivuasetukset',
      status: 'Tila',
      rescan: 'Skannaa uudelleen',
      calibrate: 'Kalibroi',
      calibrateReset: 'Nollaa kalibrointi',
      help: 'Ohje',
      change: 'Muuta',
      menu: 'Valikko',
      clearOverrides: 'Tyhjennä ohitukset',
      confirmReset: 'Kyllä, poista kaikki heksat',
    },
    prompts: {
      name: 'Sijainnin nimi (jätä tyhjäksi tyhjentääksesi)',
    },
    values: {
      on: 'Päällä',
      off: 'Pois',
      none: 'Ei mitään',
      hexLayer: {
        auto: 'Automaattinen (etuala, jos saatavilla)',
        foreground: 'etualan taso',
        objects: 'merkkitaso',
      },
      revealBy: {
        players: 'Pelaajien merkit',
        characters: 'Hahmojen merkit',
        all: 'Kaikki merkit',
      },
      revealMode: {
        clear: 'Poisto',
        glimpse: 'Vilkaisu',
      },
      announce: {
        all: 'Kaikki',
        gm: 'Vain GM',
        off: 'Pois',
      },
      orientation: {
        vertical: 'Hex (V)',
        horizontal: 'Hex (H)',
      },
      fillKind: {
        fill: 'Täyttö',
        fillInverse: 'Käänteinen täyttö',
        conceal: 'Peitto',
      },
    },
    settings: {
      language: {
        label: 'Kieli',
        desc: 'Valikkojen, viestien ja monisteiden kieli.',
      },
      hexLayer: {
        label: 'Heksataso',
        desc: 'Mihin uudet heksat piirretään. Automaattinen kokeilee etualan tasoa (merkkien yläpuolella) ja käyttää merkkitasoa, jos peli ei tue sitä.',
      },
      fillColor: {
        label: 'Täyttöväri',
        desc: 'Uusien kuusioiden väri. Käytä rgba()-funktiota läpinäkyville heksadesille, esimerkiksi rgba(0,0,0,0.8).',
      },
      strokeColor: {
        label: 'Reunan väri',
        desc: 'Uusien kuusioiden ääriviivan väri.',
      },
      labelColor: {
        label: 'Nimilappujen väri',
        desc: 'Vain GM:n nimitarrojen väri nimetyissä heksadesissä.',
      },
      glimpseColor: {
        label: 'Vilkaisun väri',
        desc: 'Väri, jonka heksat saavat Vilkaisu-tilassa. Käytä läpikuultavaa rgba()-väriä.',
      },
      strokeWidth: {
        label: 'Reunan leveys',
        desc: 'Uusien heksojen ääriviivan leveys pikseleinä (0 - 20).',
      },
      maxDistance: {
        label: 'Heksojen paljastusetäisyys',
        desc: 'Tallennetaan heksoihin, kun ne täytetään, joten aseta se ennen täyttämistä: myöhempi muutos ei vaikuta kartalla jo oleviin heksoihin. Merkin on oltava enintään näin monen heksan päässä paljastaakseen ne, riippumatta siitä, kuinka kauas se näkee; arvolla 0 ne paljastuvat vain, kun niihin astutaan. Käytä sitä vuorille tai metsille. Jätä tyhjäksi, jos rajaa ei haluta.',
      },
      revealDistance: {
        label: 'Näköetäisyys',
        desc: 'Kuinka monta heksaa liikkuvan merkin ympärillä paljastetaan (0 - 20). 0 paljastaa vain ne heksat, joiden läpi merkki kulkee.',
      },
      lineOfSight: {
        label: 'Näköyhteys',
        desc: 'Kun asetus on päällä, peitettyinä pysyvät heksat, kuten Heksojen paljastusetäisyys -asetuksella täytetyt vuoret, kätkevät takanaan olevat heksat. Sillä on merkitystä vain, kun Näköetäisyys on 2 tai enemmän.',
      },
      revealPath: {
        label: 'Paljasta reitin varrelta',
        desc: 'Kun se on päällä, jokainen hex, jonka läpi merkki kulkee vedettäessä (mukaan lukien reittipisteet), paljastetaan, ei vain sen pysähtymiskohtaa.',
      },
      revealBy: {
        label: 'Paljastavat merkit',
        desc: 'Token-kerroksen merkit paljastavat heksioita: pelaajan hallitsemia merkkejä, mitä tahansa hahmoa edustavia merkkejä tai jokaista merkkiä.',
      },
      revealMode: {
        label: 'Paljastustila',
        desc: 'Poisto poistaa näköetäisyydellä olevat heksat. Vilkaisu tekee niistä sen sijaan läpikuultavia; ne poistetaan, kun merkki astuu niihin.',
      },
      announce: {
        label: 'Ilmoita löydöt',
        desc: 'Kuka näkee chat-viestin, kun nimetty sijainti löydetään.',
      },
      pingDiscoveries: {
        label: 'Pingaa löydöt',
        desc: 'Kun se on päällä, pelaajat pingoidaan nimettyyn paikkaan, kun se löydetään.',
      },
      hideCoveredTokens: {
        label: 'Piilota peitetyt merkit',
        desc: 'Roll20 piirtää nimiä, palkkeja ja auloja heksaan yläpuolelle. Kun se on päällä, peitetyn heksan alla olevilla rahakkeilla on pelaajalle näkyvä nimi, palkit ja aurat pois päältä ja takaisin päälle, kun ne paljastuvat.',
      },
    },
    status: {
      engine: 'Pelimoottori',
      grid: 'Ruudukko',
      layer: 'Heksataso',
      hexes: 'Heksat',
      named: 'Nimetyt heksat',
      icons: 'Sijaintimerkit',
      glimpsed: 'Vilkaistut heksat',
      pending: 'Täyttöä odottavat sijainnit',
      calibrated: 'Kalibroitu',
      overrides: 'Sivun ohitukset',
      undo: 'Kumoaminen käytettävissä',
    },
    messages: {
      filled:
        'Täyttö valmis. Heksat piirretty: {created}. Uudelleen muotoiltu: {restyled}. Piilotetut sijainnit: {icons}.',
      revealed: 'Heksat paljastettiin: {count}.',
      revealedPage: 'Jokainen sivun heksa paljastettiin ({count}).',
      confirmReset:
        'Poistetaanko jokainen heksa kohdasta "{page}" ({count})? Sijaintitunnukset palaavat merkkikerrokseen. Kumoa ei voi peruuttaa tätä.',
      resetPage: 'Heksit poistettu sivulta: {count}.',
      undone:
        'Viimeinen täyttö kumottu. Heksit poistettu: {removed}. Uudelleen muotoillut heksat palautettu: {restored}.',
      named: 'Heksaalit nimeltä "{name}": {count}.',
      unnamed: 'Poistetut nimet: {count}.',
      marked:
        'Olemassa oleviin heksaan piilotetut sijainnit: {attached}. Odotetaan seuraavaa täyttöä, joka kattaa ne: {pending}.',
      unmarked: 'Tunnukset, jotka eivät ole enää sijainteja: {count}.',
      settingChanged: '{setting} asetettu arvoon {value}.',
      rescanned:
        'Uudelleenskannaus valmis. Säilytetty: {kept}. Hyväksytty: {adopted}. Arkistoitu uudelleen: {moved}. Kadonnut ja unohdettu: {dropped}. Uudelleen linkitetyt tunnisteet: {labels}. Sijaintitunnukset linkitetty uudelleen: {icons}.',
      calibrated:
        'Ruudukko kalibroitu (sarakkeen vaihe {colStep}px, rivin vaihe {rowStep}px). Tarkista uudelleen: säilytetty {kept}, arkistoitu uudelleen {moved}, hyväksytty {adopted}.',
      calibrationReset:
        'Kalibrointi poistettu. Tarkista uudelleen: säilytetty {kept}, arkistoitu uudelleen {moved}, hyväksytty {adopted}.',
      journalRebuilt: 'Monisteet "{help}" ja "{deck}" on rakennettu uudelleen.',
      migrated:
        'Hexploration 1.x -heksakarttasi on päivitetty. Jos tämä peli on kopioitu Legacy-pelistä, suorita Skannaa uudelleen jokaisella heksakarttasivulla.',
      pruned:
        'Tallennetut heksat, joita ei enää ole ja jotka unohdettiin: {dropped}. Jos tämä peli tai sivu kopioitiin, suorita sivulla Skannaa uudelleen, jotta sen heksat löytyvät taas.',
      readyHint:
        'Kirjoita !hexploration avataksesi valikon, tai avaa moniste "Hexploration - Command Deck".',
    },
    warnings: {
      foregroundUnavailable:
        'Tämä peli ei tue piirtämistä etualan kerrokselle, joten heksaat piirrettiin merkkikerrokseen.',
      someFailed: 'Heksat, joita ei voitu piirtää: {count}. Katso lisätietoja API-konsolista.',
    },
    errors: {
      noPage: 'Työstettävää sivua ei löytynyt.',
      notHex: 'Tämä sivu ei käytä kuusioruudukkoa.',
      noPolygons: 'Valitse yksi tai useampi piirretty muoto täytettäväksi.',
      emptyArea: 'Valittu alue ei sisällä heksakeskuksia.',
      tooMany: 'Tämä loisi liian monta heksaa kerralla ({count}).',
      nothingToConceal: 'Valitse piilotettavat piirretyt muodot tai merkit.',
      nothingToReveal: 'Valitse paljastettavat kuusikat, piirretyt muodot tai merkit.',
      noTokens: 'Valitse ensin yksi tai useampi merkki.',
      noHexes: 'Valitse ensin yksi tai useampi heksa (tai heksoilla seisova rahake).',
      nothingToUndo: 'Kumoavaa täyttöä ei ole.',
      unknownCommand: 'Tuntematon komento: {command}',
      unknownSetting: 'Tuntematon asetus: {key}',
      unknownPageSetting: 'Sivukohtaisesti määritettävissä olevat asetukset: {keys}',
      invalidValue: '"{value}" ei ole kelvollinen arvo kohteelle {key}.',
      calibrateNeedsTokens: 'Valitse yksi tai kaksi kuusiokeskuksiin napsautettua rahaketta.',
      calibrateFailed: 'Näitä tunnuksia ei voi käyttää kalibrointiin.',
      unexpected: 'Jotain meni pieleen: {message}',
    },
    hints: {
      noPage: 'Avaa sivu, jota haluat käsitellä, tai valitse siitä jotain.',
      notHex: 'Aseta sivun ruudukoksi Hex (V) tai Hex (H) sivun asetuksista.',
      noPolygons:
        'Piirrä alueen ympärille monikulmio, suorakulmio, ellipsi tai vapaalla kädellä oleva muoto, valitse se ja yritä sitten uudelleen.',
      emptyArea: 'Piirrä suurempi muoto tai tarkista sivuruudukon asetukset.',
      tooMany: 'Täytä pienempi alue tai jaa alue useisiin muotoihin.',
      noHexes:
        'Heksit ovat etualalla tai merkkikerroksessa; vaihda kyseiselle tasolle valitaksesi ne.',
      unknownCommand: 'Kirjoita !hexploration help listataksesi komennot.',
      unknownSetting: 'Näet kaikki asetukset kirjoittamalla !hexploration set.',
      calibrateNeedsTokens:
        'Kiinnitä merkki heksan keskelle ja valitse se. Korjaa myös heksan koko valitsemalla toinen merkki, joka on kiinnitetty viereiseen heksaan samalla rivillä (Hex V) tai samassa sarakkeessa (Hex H).',
      calibrateFailed:
        'Kahden tunnuksen on oltava samalla rivillä (Hex V) tai samassa sarakkeessa (Hex H), vähintään yhden heksan päässä toisistaan.',
      unexpected: 'Yksityiskohdat ovat API-konsolin lokissa.',
    },
    help: {
      menu: 'Näytä valikko.',
      fill: 'Peitä valitut piirretyt muodot kuusioilla.',
      fillInverse: 'Peitä koko sivu paitsi valittujen muotojen sisällä.',
      undo: 'Kumoa viimeinen täyttö, käänteinen täyttö tai piilota ja palauta käytetyt muodot.',
      reveal: 'Näytä valitut heksat ja valittujen muotojen ja merkkien alla olevat heksat.',
      revealPage: 'Paljasta sivun jokainen hex ilman ilmoituksia.',
      conceal: 'Peitä alue valittujen muotojen ja merkkien alla uudelleen kuusioilla.',
      explore:
        'Paljasta valittujen rahakkeiden ympärillä ikään kuin ne olisivat juuri muuttaneet sinne.',
      resetPage: 'Poista sivulta jokainen hekseli (kysyy ensin).',
      name: 'Nimeä valitut heksat tai valittujen merkkien alla olevat heksat. Tyhjennä se jättämällä nimen tyhjäksi.',
      mark: 'Muuta valitut merkit piilotettuihin paikkoihin.',
      unmark: 'Estä valittujen merkkien piilottaminen.',
      set: 'Muuta asetusta tai näytä kaikki asetukset.',
      pageSet: 'Ohita paljastamisasetus vain nykyisellä sivulla.',
      pageClear: 'Poista nykyisen sivun ohitukset.',
      rescan:
        'Rakenna sivun heksaluettelo uudelleen, esimerkiksi sivun tai pelin kopioinnin jälkeen.',
      calibrate:
        'Linjaa kuusioruudukko yhdellä tai kahdella valitulla kentällä, jotka on napsautettu kuusiokeskuksiin.',
      calibrateReset: 'Poista nykyisen sivun kalibrointi.',
      status: 'Näytä, mitä Hexploration tietää nykyisestä sivusta.',
      journal: 'Rakenna monisteet Help ja Command Deck uudelleen.',
      help: 'Näytä tämä luettelo.',
      handout: 'Täydelliset ohjeet ovat monisteessa "{name}".',
    },
    deck: {
      drawDesc:
        'Piirrä muotoja alueen ympärille, valitse ne ja napsauta Täytä. Kumoa täyttö peruu viimeisimmän täytön.',
      revealDesc:
        'Valitse heksoja, muotoja tai merkkejä paljastaaksesi ne tai peittääksesi ne uudelleen. Tutki paljastaa valittujen merkkien ympäristön ikään kuin ne olisivat juuri siirtyneet sinne.',
      locationsDesc:
        'Valitse merkit piilottaaksesi ne sijainneiksi heksojen alle. Valitse heksoja tai merkkejä nimetäksesi heksan.',
      toolsDesc:
        'Asetukset, sivujen ohitukset, tila, kopioitujen sivujen uudelleenskannaus ja ruudukon kalibrointi.',
      footer: 'Katso täydelliset ohjeet monisteesta "{help}".',
    },
    handout: {
      versionLabel: 'Versio',
      subtitle: 'Hex-by-hex tutkiminen Roll20:lle',
      footer: 'Käytä "{deck}" -monistetta yhden napsautuksen ohjaimiin.',
      overview: {
        heading: 'Yleiskatsaus',
        body: 'Hexploration kattaa hex-kartan läpinäkymättömillä heksailla. Kun seurue liikkuu, niiden läpi kulkevat heksat (ja halutessasi niiden ympärillä olevat heksat) poistetaan, joten kartta paljastuu heksa kerrallaan. Piilotetut paikat voidaan sijoittaa heksojen alle ja niistä ilmoitetaan, kun ne löydetään. Se toimii Jumpgate- ja Legacy-peleissä, minkä tahansa kokoisissa Hex (V) ja Hex (H) -ruudukoissa.',
        demo: 'Katso lyhyt esittely (versiosta 1)',
      },
      quickStart: {
        heading: 'Pika-aloitus',
        steps: [
          'Avaa sivu, jonka ruudukkoasetuksena on Hex (V) tai Hex (H).',
          'Piirrä piilotettavan alueen ympärille yksi tai useampi muoto (monikulmio, suorakaide, ellipsi tai vapaalla kädellä).',
          'Valitse muodot ja napsauta Command Deck -monisteessa Täytä (tai kirjoita !hexploration fill). Muodot korvataan heksoilla.',
          'Valinnainen: valitse ennen täyttöä merkit tärkeille paikoille ja napsauta Merkitse sijainti. Ne piilotetaan heksojen alle, ja niistä ilmoitetaan, kun ne löydetään.',
          'Siirrä pelaajan merkkiä. Jokainen heksa, jonka läpi se kulkee, ja sen Näköetäisyyden sisällä olevat heksat paljastetaan.',
        ],
      },
      commands: {
        heading: 'komennot',
        intro:
          'Vain GM:t voivat käyttää näitä komentoja. Useimmat toimivat valittuihin objekteihin; loput toimivat katsomallasi sivulla.',
        colCommand: 'Komento',
        colDesc: 'Mitä se tekee',
      },
      revealing: {
        heading: 'Kuinka paljastaminen toimii',
        points: [
          'Heksoja paljastavat vain merkkitason merkit. Asetus Paljastavat merkit määrää, mitkä merkit lasketaan: oletuksena pelaajien merkit, joten GM voi siirtää hirviöitä paljastamatta karttaa.',
          'Merkki paljastaa jokaisen heksan, jonka se peittää (suuret merkit peittävät useita), ja kun Paljasta reitin varrelta on päällä, jokaisen heksan reitillä, jota pitkin sitä vedettiin, välipisteet mukaan lukien.',
          'Näköetäisyys paljastaa kunkin näiden heksojen ympärillä olevat heksat, lähimmät ensin. Kun Näköyhteys on päällä, heksaa ei paljasteta niin kauan kuin sen ja merkin välissä on peitetty heksa. Lähemmät heksat paljastuvat yleensä ensin, joten avoimessa maastossa Näköyhteys ei muuta mitään: sillä on merkitystä vain, kun Näköetäisyys on 2 tai enemmän ja jotkin heksat pysyvät peitettyinä, kuten Heksojen paljastusetäisyys -asetuksella täytetty maasto.',
          'Heksojen paljastusetäisyys tallennetaan jokaiseen heksaan, kun se täytetään, joten aseta se ennen täyttämistä; myöhempi muutos ei vaikuta kartalla jo oleviin heksoihin. Merkin on oltava enintään näin monen heksan päässä paljastaakseen ne, vaikka se näkisi kauemmas, ja arvolla 0 ne paljastuvat vain, kun niihin astutaan. Vuorijonoa varten: aseta Heksojen paljastusetäisyys arvoon 0, täytä vuoret, palauta asetus tyhjäksi ja täytä sitten takana oleva maa. Kun Näköetäisyys on 3 ja Näköyhteys on päällä, seurue näkee ympärillään olevan avoimen maaston mutta ei vuoria eikä sitä, mitä niiden takana on. Kukin vuoriheksa paljastuu, kun merkki astuu siihen.',
          'Vilkaisu-tilassa näköetäisyydellä olevat heksat muuttuvat läpikuultaviksi katoamisen sijaan, ja ne poistetaan, kun merkki astuu niihin. Vilkaisun läpikuultavat heksat eivät estä näkyvyyttä Näköyhteys-asetuksessa.',
          'Roll20 piirtää merkkien nimet, palkit ja aurat heksojen päälle. Kun Piilota peitetyt merkit on päällä, peitetyn heksan alla olevan merkin pelaajille näkyvä nimi, palkit ja aurat kytketään pois, kunnes se paljastuu, joten piilotetut hirviöt eivät paljasta itseään. Jos kytket jonkin niistä päälle merkin ollessa peitettynä, se pysyy piilossa ja kytkeytyy päälle, kun merkki paljastuu.',
          'API ei ilmoita muiden modien tekemistä siirroista. TokenModin siirrot huomataan automaattisesti; muiden modien kohdalla valitse merkit ja napsauta Tutki tai kutsu Hexploration.revealAround(token) omasta modistasi.',
        ],
      },
      locations: {
        heading: 'Nimetty Heksit ja sijainnit',
        points: [
          'Merkitse sijainti muuttaa valitut merkit piilotetuiksi sijainneiksi. Jo heksan alla oleva merkki piilotetaan heti; muuten sen piilottaa seuraava täyttö, joka peittää sen.',
          'Valkoisen tornin tilamerkillä varustetut rahakkeet käsitellään myös sijainneina, kun täytät, kuten versiossa 1.',
          'Piilotetut sijaintitunnukset siirretään GM-tasolle. Kun heidän heksansa paljastetaan, he palaavat merkkikerrokseen ja heidän nimensä näytetään, ja heidän löytönsä ilmoitetaan.',
          'Nimeä heksa antaa heksalle nimen ilman merkkiä. Nimi näytetään GM:lle nimilappuna GM-tasolla, ja siitä ilmoitetaan, kun heksa paljastetaan.',
          'Ilmoita löydöt valitsee, näkevätkö ilmoituksen kaikki, vain GM vai ei kukaan. Pingaa löydöt siirtää lisäksi pelaajien näkymän sijaintiin.',
        ],
      },
      settings: {
        heading: 'Asetukset',
        intro:
          'Muuta asetuksia komennolla !hexploration set (tai Asetukset-painikkeella). Heksatason, Paljastavat merkit ja Kielen voi asettaa myös modin asetussivulla.',
        colKey: 'Avain',
        colName: 'Asetus',
        colDesc: 'Kuvaus',
        perPage: '(Voidaan asettaa sivukohtaisesti.)',
      },
      jumpgate: {
        heading: 'Jumpgate ja Legacy',
        points: [
          'Hexploration selvittää, mitä moottoria peli käyttää, ja piirtää vastaavan muodon. Kummassakin editorissa piirretyt muodot voidaan täyttää.',
          'Kun Heksataso on Automaattinen, heksat piirretään etualan tasolle merkkien yläpuolelle, joten pelaajat eivät näe, mitä alla on. Jos etualan taso ei ole käytettävissä, käytetään merkkitasoa.',
          'Jumpgate piirtää matemaattisesti säännöllisiä heksoja, jotka ovat hieman eri muotoisia kuin Legacy-heksat. Jos heksat eivät osu sivun ruudukkoon, kiinnitä merkki heksan keskipisteeseen, valitse se ja napsauta Kalibroi. Korjaa myös heksan koko valitsemalla kaksi merkkiä saman rivin (Hex V) tai sarakkeen (Hex H) vierekkäisistä heksoista.',
          'Kun sivu tai peli kopioidaan, sen heksat saavat uudet tunnisteet. Suorita sivulla Skannaa uudelleen, jotta ne löytyvät taas nimilappuineen ja sijaintimerkkeineen.',
        ],
      },
      upgrading: {
        heading: 'Päivitys versiosta 1',
        points: [
          'Versio 2 ei enää tarvitse PathMath-, MatrixMath-, Vector Math- tai HTML Builder -sovellusta. Voit poistaa ne, ellei toinen mod käytä niitä.',
          'Nykyiset heksakartat, nimet, sijaintimerkit ja asetukset päivitetään automaattisesti ensimmäisellä käynnistyksellä.',
          'Version 1 komennot, mukaan lukien Hexploration_menu-makro, toimivat edelleen.',
          'Versiossa 1 mikä tahansa hahmoa edustava merkki paljasti heksoja. Säilytä tämä toiminta asettamalla Paljastavat merkit arvoon Hahmojen merkit.',
        ],
        colV1: 'Version 1 komento',
        colV2: 'Version 2 komento',
      },
      troubleshooting: {
        heading: 'Vianetsintä',
        points: [
          'Mitään ei tapahdu, kun merkki liikkuu: tarkista, että merkki on merkkitasolla ja vastaa Paljastavat merkit -asetusta ja että sivulla on heksoja (!hexploration status).',
          'Heksat ovat siirtyneet ruudukosta: käytä Kalibroi-toimintoa ja tarkista sitten merkillä muutama heksa eri puolilta karttaa.',
          'Heksat lakkasivat paljastumasta sivun tai pelin kopioinnin jälkeen: suorita sivulla Skannaa uudelleen.',
          'Täytä ilmoittaa, ettei alueella ole heksojen keskipisteitä: muodon on sisällettävä vähintään yhden heksan keskipiste.',
          'Jos haluat lisätietoja, tarkista API-konsolin loki ja sisällytä sen viestit, kun pyydät apua.',
        ],
      },
      languages: {
        heading: 'Kielet',
        body: 'Valitse kieli komennolla !hexploration set language. Käytettävissä olevat kielet:',
        colLanguage: 'Kieli',
        colNative: 'Oma nimi',
        colCode: 'Koodi',
      },
      credits: {
        heading: 'Krediitit',
        original: 'Alkuperäisen modin tekijä',
        maintainer: 'Versio 2 ylläpitäjä',
        marketplace: 'Adan taidepaketit Roll20 Marketplacessa',
        support:
          'Jos löydät virheen tai sinulla on idea, kirjoita viesti Roll20 Mod -foorumille tai avaa ongelma GitHubissa ja sisällytä kaikki viestit API-konsolin lokista.',
      },
    },
  };

  const TRANSLATION$f = {
    titles: {
      ready: 'Hexploration est prêt.',
      settings: "Paramètres d'Hexploration",
      languages: 'Choisissez une langue',
      pageSettings: 'Paramètres de la page : {page}',
      status: "État d'Hexploration : {page}",
      help: "Commandes d'Hexploration",
      confirm: 'Veuillez confirmer',
    },
    discovery: {
      title: 'Emplacement découvert',
    },
    menu: {
      draw: 'Dessiner',
      reveal: 'Révéler et masquer',
      locations: 'Emplacements',
      tools: 'Outils',
      layerInUse: 'De nouveaux hexagones sont dessinés sur le {layer}.',
      pageSettingsHelp:
        "Ces paramètres s'appliquent uniquement à cette page. Les paramètres marqués ★ remplacent les paramètres globaux.",
    },
    buttons: {
      fill: 'Remplir',
      fillInverse: 'Remplissage inversé',
      undo: 'Annuler le remplissage',
      reveal: 'Révéler',
      conceal: 'Cacher',
      explore: 'Explorer',
      revealPage: 'Révéler la page',
      resetPage: 'Réinitialiser la page',
      mark: "Marquer l'emplacement",
      unmark: 'Démarquer',
      name: "Nommer l'hexagone",
      settings: 'Paramètres',
      pageSettings: 'Paramètres de la page',
      status: 'Statut',
      rescan: 'Nouvelle analyse',
      calibrate: 'Calibrer',
      calibrateReset: 'Réinitialiser le calibrage',
      help: 'Aide',
      change: 'Modifier',
      menu: 'Menu',
      clearOverrides: 'Effacer les remplacements',
      confirmReset: 'Oui, supprimer tous les hexagones',
    },
    prompts: {
      name: 'Nom du lieu (laissez vide pour effacer)',
    },
    values: {
      on: 'Activé',
      off: 'Désactivé',
      none: 'Aucun',
      hexLayer: {
        auto: 'Auto (premier plan si disponible)',
        foreground: 'calque de premier plan',
        objects: 'calque des jetons',
      },
      revealBy: {
        players: 'Jetons de joueur',
        characters: 'Jetons de personnage',
        all: 'Tous les jetons',
      },
      revealMode: {
        clear: 'Effacer',
        glimpse: 'Aperçu',
      },
      announce: {
        all: 'Tout le monde',
        gm: 'MJ uniquement',
        off: 'Désactivé',
      },
      orientation: {
        vertical: 'Hex (V)',
        horizontal: 'Hex (H)',
      },
      fillKind: {
        fill: 'Remplir',
        fillInverse: 'Remplissage inversé',
        conceal: 'Cacher',
      },
    },
    settings: {
      language: {
        label: 'Langue',
        desc: 'Langue des menus, des messages et des documents.',
      },
      hexLayer: {
        label: 'Calque des hexagones',
        desc: 'Où de nouveaux hexagones sont dessinés. Auto essaie la couche de premier plan (au-dessus des jetons) et revient à la couche de jetons si le jeu ne la prend pas en charge.',
      },
      fillColor: {
        label: 'Couleur de remplissage',
        desc: 'Couleur des nouveaux hexagones. Utilisez rgba() pour les hexagones transparents, par exemple rgba(0,0,0,0.8).',
      },
      strokeColor: {
        label: 'Couleur de la bordure',
        desc: 'Couleur du contour des nouveaux hexagones.',
      },
      labelColor: {
        label: "Couleur de l'étiquette",
        desc: 'Couleur des étiquettes de nom réservées aux GM sur les hexs nommés.',
      },
      glimpseColor: {
        label: "Couleur d'aperçu",
        desc: 'Couleur que prennent les hexagones aperçus (mode de révélation Aperçu). Utilisez une couleur rgba() transparente.',
      },
      strokeWidth: {
        label: 'Largeur de la bordure',
        desc: 'Largeur du contour des nouveaux hexs, en pixels (0 à 20).',
      },
      maxDistance: {
        label: 'Distance de révélation des hexagones',
        desc: "Enregistrée sur les hexagones au moment où ils sont remplis, donc réglez-la avant de remplir : la modifier ensuite n'affecte pas les hexagones déjà présents sur la carte. Un jeton doit se trouver à ce nombre d'hexagones au plus pour les révéler, aussi loin qu'il puisse voir ; avec 0, ils ne sont révélés qu'en y entrant. Utilisez-la pour des montagnes ou des forêts. Laissez vide pour ne fixer aucune limite.",
      },
      revealDistance: {
        label: 'Distance de vue',
        desc: "Combien d'hexagones autour d'un jeton en mouvement sont révélés (0 à 20). 0 révèle uniquement les hexagones traversés par le jeton.",
      },
      lineOfSight: {
        label: 'Ligne de vue',
        desc: "Lorsque cette option est activée, les hexagones qui restent couverts, comme des montagnes remplies avec une Distance de révélation des hexagones, cachent les hexagones situés derrière eux. Elle n'a d'effet qu'avec une Distance de vue de 2 ou plus.",
      },
      revealPath: {
        label: 'Révéler le long du chemin',
        desc: "Lorsque cette option est activée, chaque hexagone traversé par un jeton lorsqu'il est déplacé (y compris les waypoints) est révélé, pas seulement l'endroit où il s'arrête.",
      },
      revealBy: {
        label: 'Jetons révélateurs',
        desc: "Quels jetons sur la couche de jetons révèlent des hexagones : jetons contrôlés par un joueur, jetons qui représentent n'importe quel personnage ou chaque jeton.",
      },
      revealMode: {
        label: 'Mode de révélation',
        desc: "Effacer supprime les hexagones à portée de vue. Aperçu les rend plutôt transparents ; ils sont supprimés lorsqu'un jeton y entre.",
      },
      announce: {
        label: 'Annoncer les découvertes',
        desc: "Qui voit le message de discussion lorsqu'un emplacement nommé est découvert.",
      },
      pingDiscoveries: {
        label: 'Pinger les découvertes',
        desc: "Lorsque cette option est activée, les joueurs reçoivent un ping vers un emplacement nommé lorsqu'il est découvert.",
      },
      hideCoveredTokens: {
        label: 'Masquer les jetons couverts',
        desc: "Roll20 dessine des noms, des barres et des auras au-dessus des hexagones. Lorsqu'ils sont activés, les jetons situés sous un hexagone couvert ont leur nom visible par le joueur, leurs barres et leurs auras éteints, et réactivés lorsqu'ils sont découverts.",
      },
    },
    status: {
      engine: 'Moteur de jeu',
      grid: 'Grille',
      layer: 'Calque des hexagones',
      hexes: 'Hexagones',
      named: 'Hexagones nommés',
      icons: "Jetons d'emplacement",
      glimpsed: 'Hexagones aperçus',
      pending: 'Emplacements en attente de remplissage',
      calibrated: 'Calibré',
      overrides: 'Remplacements de page',
      undo: 'Annulation disponible',
    },
    messages: {
      filled:
        'Remplissage terminé. Hexagones dessinés : {created}. Restylés : {restyled}. Emplacements cachés : {icons}.',
      revealed: 'Hexs révélés : {count}.',
      revealedPage: 'Chaque hexagone de la page révélé ({count}).',
      confirmReset:
        'Supprimer chaque hexagone de "{page}" ({count}) ? Les jetons d\'emplacement reviennent à la couche de jetons. L\'annulation ne peut pas inverser cette situation.',
      resetPage: 'Hexs supprimés de la page : {count}.',
      undone:
        'Dernier remplissage annulé. Hexs supprimés : {removed}. Hexs relookés restaurés : {restored}.',
      named: 'Hexs nommés "{name}" : {count}.',
      unnamed: 'Noms effacés : {count}.',
      marked:
        'Emplacements cachés dans les hexs existants : {attached}. En attente du prochain remplissage qui les couvre : {pending}.',
      unmarked: 'Jetons qui ne sont plus des emplacements : {count}.',
      settingChanged: '{setting} défini sur {value}.',
      rescanned:
        'Nouvelle analyse terminée. Conservé : {kept}. Adopté : {adopted}. Re-déposé : {moved}. Manquant et oublié : {dropped}. Libellés réassociés : {labels}. Jetons de localisation réassociés : {icons}.',
      calibrated:
        'Grille calibrée (pas de colonne {colStep}px, pas de ligne {rowStep}px). Nouvelle analyse : conservé {kept}, reclassé {moved}, adopté {adopted}.',
      calibrationReset:
        'Calibrage supprimé. Nouvelle analyse : conservé {kept}, reclassé {moved}, adopté {adopted}.',
      journalRebuilt: 'Les documents « {help} » et « {deck} » ont été reconstruits.',
      migrated:
        "Vos cartes hexagonales Hexploration 1.x ont été mises à niveau. Si ce jeu a été copié à partir d'un jeu Legacy, lancez une nouvelle analyse sur chaque page de carte hexagonale.",
      pruned:
        "Hexs enregistrés qui n'existent plus et ont été oubliés : {dropped}. Si ce jeu ou cette page a été copié, lancez une nouvelle analyse sur la page pour récupérer ses hexagones.",
      readyHint:
        'Tapez !hexploration pour afficher le menu, ou ouvrez le document "Hexploration - Command Deck".',
    },
    warnings: {
      foregroundUnavailable:
        'Ce jeu ne prend pas en charge le dessin sur la couche de premier plan, les hexagones ont donc été dessinés sur la couche de jetons.',
      someFailed:
        "Hexs qui n'ont pas pu être tirés : {count}. Consultez la console API pour plus de détails.",
    },
    errors: {
      noPage: 'Impossible de trouver la page sur laquelle travailler.',
      notHex: "Cette page n'utilise pas de grille hexadécimale.",
      noPolygons: 'Sélectionnez une ou plusieurs formes dessinées à remplir.',
      emptyArea: "La zone sélectionnée ne contient aucun centre d'hexagone.",
      tooMany: "Cela créerait trop d'hexagones en une seule fois ({count}).",
      nothingToConceal: 'Sélectionnez des formes dessinées ou des jetons à masquer.',
      nothingToReveal: 'Sélectionnez des hexagones, des formes dessinées ou des jetons à révéler.',
      noTokens: "Sélectionnez d'abord un ou plusieurs jetons.",
      noHexes:
        "Sélectionnez d'abord un ou plusieurs hexagones (ou des jetons placés sur des hexagones).",
      nothingToUndo: "Il n'y a aucun remplissage à défaire.",
      unknownCommand: 'Commande inconnue : {command}',
      unknownSetting: 'Paramètre inconnu : {key}',
      unknownPageSetting: 'Paramètres pouvant être définis par page : {keys}',
      invalidValue: '"{value}" n\'est pas une valeur valide pour {key}.',
      calibrateNeedsTokens: 'Sélectionnez un ou deux jetons accrochés aux centres des hexagones.',
      calibrateFailed: 'Ces jetons ne peuvent pas être utilisés pour calibrer.',
      unexpected: "Un problème s'est produit : {message}",
    },
    hints: {
      noPage:
        'Ouvrez la page sur laquelle vous souhaitez travailler ou sélectionnez quelque chose dessus.',
      notHex: 'Définissez la grille de la page sur Hex (V) ou Hex (H) dans Paramètres de page.',
      noPolygons:
        'Dessinez un polygone, un rectangle, une ellipse ou une forme à main levée autour de la zone, sélectionnez-le, puis réessayez.',
      emptyArea:
        'Dessinez une forme plus grande ou vérifiez les paramètres de la grille de la page.',
      tooMany: 'Remplissez une zone plus petite ou divisez la zone en plusieurs formes.',
      noHexes:
        'Les hexagones sont au premier plan ou sur la couche de jetons ; passez à ce calque pour les sélectionner.',
      unknownCommand: 'Tapez !hexploration help pour lister les commandes.',
      unknownSetting: 'Tapez !hexploration set pour voir tous les paramètres.',
      calibrateNeedsTokens:
        "Placez un jeton au centre d'un hexagone et sélectionnez-le. Sélectionnez un deuxième jeton accroché à un hexagone voisin dans la même ligne (Hex V) ou colonne (Hex H) pour corriger également la taille de l'hexagone.",
      calibrateFailed:
        "Deux jetons doivent être dans la même ligne (Hex V) ou dans la même colonne (Hex H), à au moins un hex l'un de l'autre.",
      unexpected: 'Les détails se trouvent dans le journal de la console API.',
    },
    help: {
      menu: 'Afficher le menu.',
      fill: 'Couvrez les formes dessinées sélectionnées avec des hexagones.',
      fillInverse: "Couvrez toute la page sauf à l'intérieur des formes sélectionnées.",
      undo: 'Annulez le dernier remplissage, inversez le remplissage ou masquez-le et restaurez les formes utilisées.',
      reveal:
        'Révélez les hexagones sélectionnés et les hexagones sous les formes et les jetons sélectionnés.',
      revealPage: 'Révélez chaque hexagone de la page sans annonce.',
      conceal:
        'Couvrez à nouveau la zone sous les formes et les jetons sélectionnés avec des hexagones.',
      explore: "Révélez autour des jetons sélectionnés comme s'ils venaient de s'y déplacer.",
      resetPage: 'Supprimez tous les hexagones de la page (demande en premier).',
      name: "Nommez les hexagones sélectionnés ou les hexagones sous les jetons sélectionnés. Laissez le nom vide pour l'effacer.",
      mark: 'Transformez les jetons sélectionnés en emplacements cachés.',
      unmark: "Empêchez les jetons sélectionnés d'être des emplacements cachés.",
      set: 'Modifiez un paramètre ou affichez tous les paramètres.',
      pageSet: 'Remplacer un paramètre de révélation sur la page actuelle uniquement.',
      pageClear: 'Supprimez les remplacements de la page actuelle.',
      rescan:
        'Reconstruisez la liste hexadécimale de la page, par exemple après avoir copié une page ou un jeu.',
      calibrate:
        'Alignez la grille hexagonale avec un ou deux jetons sélectionnés accrochés aux centres des hexagones.',
      calibrateReset: 'Supprimez le calibrage de la page actuelle.',
      status: 'Montre ce que Hexploration sait de la page actuelle.',
      journal: 'Reconstruisez les documents Help et Command Deck.',
      help: 'Montrez cette liste.',
      handout: 'Les instructions complètes se trouvent dans le document « {name} ».',
    },
    deck: {
      drawDesc:
        "Dessinez des formes autour d'une zone, sélectionnez-les, puis remplissez. Annuler le remplissage annule le dernier remplissage.",
      revealDesc:
        "Sélectionnez des hexagones, des formes ou des jetons pour les révéler ou les recouvrir. Explorer révèle les alentours des jetons sélectionnés comme s'ils venaient de s'y déplacer.",
      locationsDesc:
        "Sélectionnez les jetons pour les cacher en tant qu'emplacements sous les hexagones. Sélectionnez des hexagones ou des jetons pour nommer un hexagone.",
      toolsDesc:
        'Paramètres, remplacements de pages, statut, nouvelle numérisation des pages copiées et calibrage de la grille.',
      footer: 'Consultez le document « {help} » pour obtenir des instructions complètes.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Exploration hex par hex pour Roll20',
      footer: 'Utilisez le document "{deck}" pour les contrôles en un clic.',
      overview: {
        heading: 'Aperçu',
        body: "L'hexploration couvre une carte d'hexagones avec des hexagones opaques. Au fur et à mesure que le groupe se déplace, les hexagones qu'il traverse (et, si vous le souhaitez, les hexagones qui l'entourent) sont supprimés, de sorte que la carte est découverte un hexagone à la fois. Les emplacements cachés peuvent être placés sous les hexagones et sont annoncés lorsqu'ils sont trouvés. Il fonctionne dans les jeux Jumpgate et Legacy, sur les grilles Hex (V) et Hex (H) de n'importe quelle taille.",
        demo: 'Regardez une courte démo (à partir de la version 1)',
      },
      quickStart: {
        heading: 'Démarrage rapide',
        steps: [
          'Ouvrez une page dont la grille est définie sur Hex (V) ou Hex (H).',
          'Dessinez une ou plusieurs formes (polygone, rectangle, ellipse ou à main levée) autour de la zone à masquer.',
          'Sélectionnez les formes et cliquez sur Remplir dans le Command Deck (ou tapez !hexploration fill). Les formes sont remplacées par des hexagones.',
          "Facultatif : avant de remplir, sélectionnez les jetons pour les lieux importants et cliquez sur Marquer l'emplacement. Ils sont cachés sous les hexagones et annoncés dès leur découverte.",
          "Déplacez un jeton de joueur. Chaque hex qu'il traverse, ainsi que les hexs situés à sa distance de vue, sont révélés.",
        ],
      },
      commands: {
        heading: 'Commandes',
        intro:
          'Seuls les MJ peuvent utiliser ces commandes. La plupart agissent sur les objets sélectionnés ; le reste agit sur la page que vous consultez.',
        colCommand: 'Commande',
        colDesc: 'Ce que ça fait',
      },
      revealing: {
        heading: 'Comment fonctionne la révélation',
        points: [
          'Seuls les jetons sur le calque des jetons révèlent des hexagones. Les jetons concernés sont définis par Jetons révélateurs : les jetons de joueur par défaut, afin que le MJ puisse déplacer des monstres sans découvrir la carte.',
          "Un jeton révèle chaque hex qu'il couvre (les gros jetons en couvrent plusieurs) et, avec Révéler le long du chemin activé, chaque hex de la route qu'il a parcouru, y compris les waypoints.",
          "La Distance de vue révèle les hexagones autour de chacun de ces hexagones, en commençant par les plus proches. Avec Ligne de vue activée, un hexagone n'est pas révélé tant qu'un hexagone couvert se trouve entre lui et le jeton. Les hexagones les plus proches sont généralement révélés en premier, donc en terrain dégagé la Ligne de vue ne change rien : elle ne compte qu'avec une Distance de vue de 2 ou plus et des hexagones qui restent couverts, comme un terrain rempli avec une Distance de révélation des hexagones.",
          "La Distance de révélation des hexagones est enregistrée sur chaque hexagone au moment où il est rempli, donc réglez-la avant de remplir ; la modifier ensuite n'affecte pas les hexagones déjà présents sur la carte. Un jeton doit se trouver à ce nombre d'hexagones au plus pour les révéler, aussi loin qu'il puisse voir, et avec 0 ils ne sont révélés qu'en y entrant. Pour une chaîne de montagnes : réglez la Distance de révélation des hexagones sur 0, remplissez les montagnes, remettez-la sans limite, puis remplissez les terres au-delà. Avec une Distance de vue de 3 et la Ligne de vue activée, le groupe voit le terrain dégagé autour de lui, mais pas les montagnes ni ce qui se trouve derrière. Chaque hexagone de montagne est révélé lorsqu'un jeton y pénètre.",
          "En mode Aperçu, les hexagones visibles deviennent transparents au lieu de disparaître et sont supprimés lorsqu'un jeton y pénètre. Les hexagones aperçus ne bloquent pas la Ligne de vue.",
          "Roll20 dessine les noms, les barres et les auras des jetons au-dessus des hexagones. Avec Masquer les jetons couverts activé, un jeton sous un hexagone couvert voit son nom, ses barres et ses auras visibles par les joueurs désactivés jusqu'à ce qu'il soit découvert, afin que les monstres cachés ne se trahissent pas. Si vous en réactivez un pendant que le jeton est couvert, il reste masqué et sera activé lorsque le jeton sera découvert.",
          "L'API ne signale pas les mouvements effectués par d'autres mods. Les mouvements TokenMod sont récupérés automatiquement ; pour les autres mods, sélectionnez les jetons et cliquez sur Explorer, ou appelez Hexploration.revealAround(token) depuis votre propre mod.",
        ],
      },
      locations: {
        heading: 'Hexs et emplacements nommés',
        points: [
          "Marquer l'emplacement transforme les jetons sélectionnés en emplacements cachés. Un jeton déjà sous un hexagone est caché immédiatement ; sinon, il est caché par le prochain remplissage qui le recouvre.",
          'Les jetons avec le marqueur de statut tour blanche sont également traités comme des emplacements lorsque vous remplissez, comme dans la version 1.',
          "Les jetons d'emplacement cachés sont déplacés vers la couche GM. Lorsque leur hexagone est révélé, ils retournent à la couche de jetons avec leur nom affiché et leur découverte est annoncée.",
          "Nommer l'hexagone donne un nom à un hexagone sans jeton. Le nom est montré au MJ sous forme d'étiquette sur le calque MJ et annoncé lorsque l'hexagone est révélé.",
          "Annoncer les découvertes détermine si tout le monde, seulement le MJ ou personne ne voit l'annonce. Pinger les découvertes déplace aussi la vue des joueurs vers l'emplacement.",
        ],
      },
      settings: {
        heading: 'Paramètres',
        intro:
          'Modifiez les paramètres avec !hexploration set (ou le bouton Paramètres). Calque des hexagones, Jetons révélateurs et Langue peuvent aussi être définis sur la page de paramètres du mod.',
        colKey: 'Clé',
        colName: 'Paramètre',
        colDesc: 'Description',
        perPage: '(Peut être défini par page.)',
      },
      jumpgate: {
        heading: 'Jumpgate et héritage',
        points: [
          "Hexploration détermine quel moteur le jeu utilise et dessine le type de forme correspondant. Les formes dessinées dans l'un ou l'autre éditeur peuvent être remplies.",
          "Avec Calque des hexagones réglé sur Auto, les hexagones sont dessinés sur le calque de premier plan, au-dessus des jetons, afin que les joueurs ne puissent pas voir ce qu'il y a en dessous. Si le calque de premier plan n'est pas disponible, le calque des jetons est utilisé à la place.",
          "Jumpgate dessine des hexagones mathématiquement réguliers, qui ont une forme légèrement différente des hexagones Legacy. Si les hexagones ne s’alignent pas avec la grille d’une page, placez un jeton au centre d’un hexagone, sélectionnez-le et cliquez sur Calibrer. Sélectionnez deux jetons dans des hexagones voisins de la même ligne (Hex V) ou colonne (Hex H) pour corriger également la taille de l'hexagone.",
          "Lorsqu'une page ou un jeu est copié, ses hexagones obtiennent de nouveaux identifiants. Exécutez une nouvelle analyse sur la page pour les récupérer, ainsi que leurs étiquettes de nom et leurs jetons de localisation.",
        ],
      },
      upgrading: {
        heading: 'Mise à niveau à partir de la version 1',
        points: [
          "La version 2 n'a plus besoin de PathMath, MatrixMath, Vector Math ou HTML Builder. Vous pouvez les supprimer à moins qu'un autre mod ne les utilise.",
          'Les cartes hexagonales, les noms, les jetons de localisation et les paramètres existants sont automatiquement mis à niveau au premier démarrage.',
          'Les commandes de la version 1, dont la macro Hexploration_menu, fonctionnent toujours.',
          'La version 1 permettait à tout jeton représentant un personnage de révéler des hexagones. Réglez Jetons révélateurs sur Jetons de personnage pour conserver ce comportement.',
        ],
        colV1: 'Commande version 1',
        colV2: 'Commande version 2',
      },
      troubleshooting: {
        heading: 'Dépannage',
        points: [
          'Rien ne se passe quand un jeton se déplace : vérifiez que le jeton est sur le calque des jetons et correspond à Jetons révélateurs, et que la page contient des hexagones (!hexploration status).',
          'Les hexs sont décalés par rapport à la grille : utilisez Calibrer, puis vérifiez avec un jeton sur quelques hexs de la carte.',
          "Les hexagones ont cessé de s'afficher après la copie d'une page ou d'un jeu : lancez une nouvelle analyse de la page.",
          "Remplir indique que la zone ne contient aucun centre d'hexagone : la forme doit contenir le centre d'au moins un hexagone.",
          "Pour toute autre chose, consultez le journal de la console API et incluez ses messages lorsque vous demandez de l'aide.",
        ],
      },
      languages: {
        heading: 'Langues',
        body: 'Choisissez une langue avec !hexploration set language. Langues disponibles :',
        colLanguage: 'Langue',
        colNative: "Nom d'origine",
        colCode: 'Code',
      },
      credits: {
        heading: 'Crédits',
        original: 'Mod original par',
        maintainer: 'Version 2 maintenue par',
        marketplace: "Les packs artistiques d'Ada sur le Marketplace Roll20",
        support:
          'Si vous trouvez un bug ou avez une idée, publiez-le sur le forum Roll20 Mod ou ouvrez un problème sur GitHub et incluez tous les messages du journal de la console API.',
      },
    },
  };

  const TRANSLATION$e = {
    titles: {
      ready: 'Hexploration ist bereit.',
      settings: 'Hexploration-Einstellungen',
      languages: 'Sprache wählen',
      pageSettings: 'Seiteneinstellungen: {page}',
      status: 'Hexploration-Status: {page}',
      help: 'Hexploration-Befehle',
      confirm: 'Bitte bestätigen',
    },
    discovery: {
      title: 'Standort entdeckt',
    },
    menu: {
      draw: 'Zeichnen',
      reveal: 'Aufdecken und Verdecken',
      locations: 'Standorte',
      tools: 'Werkzeuge',
      layerInUse: 'Neue Hexfelder werden auf der {layer} gezeichnet.',
      pageSettingsHelp:
        'Diese Einstellungen gelten nur für diese Seite. Mit ★ gekennzeichnete Einstellungen überschreiben die globalen Einstellungen.',
    },
    buttons: {
      fill: 'Füllen',
      fillInverse: 'Umgekehrt füllen',
      undo: 'Füllung rückgängig machen',
      reveal: 'Aufdecken',
      conceal: 'Verbergen',
      explore: 'Erkunden',
      revealPage: 'Seite aufdecken',
      resetPage: 'Seite zurücksetzen',
      mark: 'Standort markieren',
      unmark: 'Markierung aufheben',
      name: 'Hexfeld benennen',
      settings: 'Einstellungen',
      pageSettings: 'Seiteneinstellungen',
      status: 'Status',
      rescan: 'Erneut scannen',
      calibrate: 'Kalibrieren',
      calibrateReset: 'Kalibrierung zurücksetzen',
      help: 'Hilfe',
      change: 'Ändern',
      menu: 'Menü',
      clearOverrides: 'Überschreibungen löschen',
      confirmReset: 'Ja, alle Hexfelder entfernen',
    },
    prompts: {
      name: 'Standortname (zum Löschen leer lassen)',
    },
    values: {
      on: 'An',
      off: 'Aus',
      none: 'Keine',
      hexLayer: {
        auto: 'Auto (Vordergrund, falls verfügbar)',
        foreground: 'Vordergrundebene',
        objects: 'Token-Ebene',
      },
      revealBy: {
        players: 'Spielertoken',
        characters: 'Charaktertoken',
        all: 'Alle Token',
      },
      revealMode: {
        clear: 'Entfernen',
        glimpse: 'Durchsicht',
      },
      announce: {
        all: 'Alle',
        gm: 'Nur GM',
        off: 'Aus',
      },
      orientation: {
        vertical: 'Hex (V)',
        horizontal: 'Hex (H)',
      },
      fillKind: {
        fill: 'Füllen',
        fillInverse: 'Umgekehrt füllen',
        conceal: 'Verbergen',
      },
    },
    settings: {
      language: {
        label: 'Sprache',
        desc: 'Sprache für Menüs, Nachrichten und Handouts.',
      },
      hexLayer: {
        label: 'Hexfeld-Ebene',
        desc: 'Wo neue Hexfelder gezeichnet werden. „Auto“ versucht es mit der Vordergrundebene (über den Token) und weicht auf die Token-Ebene aus, wenn das Spiel sie nicht unterstützt.',
      },
      fillColor: {
        label: 'Füllfarbe',
        desc: 'Farbe neuer Hexfelder. Verwenden Sie rgba() für durchsichtige Hexadezimalwerte, zum Beispiel rgba(0,0,0,0.8).',
      },
      strokeColor: {
        label: 'Randfarbe',
        desc: 'Farbe der Umrisse neuer Hexfelder.',
      },
      labelColor: {
        label: 'Beschriftungsfarbe',
        desc: 'Farbe der Nur-GM-Namensschilder auf benannten Hexfeldern.',
      },
      glimpseColor: {
        label: 'Durchsicht-Farbe',
        desc: 'Farbe, die Hexfelder annehmen, wenn sie durchsichtig werden (Aufdeckmodus „Durchsicht“). Verwenden Sie eine durchsichtige rgba()-Farbe.',
      },
      strokeWidth: {
        label: 'Randbreite',
        desc: 'Breite des Umrisses neuer Hexfelder in Pixel (0 bis 20).',
      },
      maxDistance: {
        label: 'Aufdeckungsdistanz für Hexfelder',
        desc: 'Wird beim Füllen in den Hexfeldern gespeichert, also vor dem Füllen festlegen: Spätere Änderungen wirken sich nicht auf Hexfelder aus, die bereits auf der Karte liegen. Ein Spielstein muss sich innerhalb dieser Anzahl von Hexfeldern befinden, um sie aufzudecken, egal wie weit er sehen kann; bei 0 werden sie nur aufgedeckt, wenn man sie betritt. Für Berge oder Wälder verwenden. Für keine Begrenzung leer lassen.',
      },
      revealDistance: {
        label: 'Sichtweite',
        desc: 'Wie viele Hexfelder um einen beweglichen Spielstein herum angezeigt werden (0 bis 20). 0 zeigt nur die Hexfelder an, die der Token durchquert.',
      },
      lineOfSight: {
        label: 'Sichtlinie',
        desc: 'Wenn diese Option aktiviert ist, verbergen Hexfelder, die verdeckt bleiben, etwa Berge, die mit einer Aufdeckungsdistanz für Hexfelder gefüllt wurden, die Hexfelder dahinter. Das macht nur bei einer Sichtweite von 2 oder mehr einen Unterschied.',
      },
      revealPath: {
        label: 'Entlang des Wegs aufdecken',
        desc: 'Wenn diese Option aktiviert ist, wird jedes Hexfeld, das ein Spielstein beim Ziehen durchquert (einschließlich Wegpunkte), angezeigt, nicht nur die Stelle, an der er anhält.',
      },
      revealBy: {
        label: 'Aufdeckende Token',
        desc: 'Welche Spielsteine ​​auf der Spielsteinebene zeigen Hexereien an: Spielsteine, die von einem Spieler kontrolliert werden, Spielsteine, die einen beliebigen Charakter repräsentieren, oder jeder Spielstein.',
      },
      revealMode: {
        label: 'Aufdeckmodus',
        desc: '„Entfernen“ entfernt Hexfelder in Sichtweite. „Durchsicht“ macht sie stattdessen durchsichtig; sie werden entfernt, sobald ein Token sie betritt.',
      },
      announce: {
        label: 'Entdeckungen ankündigen',
        desc: 'Wer sieht die Chat-Nachricht, wenn ein benannter Ort entdeckt wird?',
      },
      pingDiscoveries: {
        label: 'Entdeckungen anpingen',
        desc: 'Wenn diese Option aktiviert ist, werden Spieler an einen benannten Ort gepingt, wenn dieser entdeckt wird.',
      },
      hideCoveredTokens: {
        label: 'Verdeckte Token ausblenden',
        desc: 'Roll20 zeichnet Namen, Balken und Auren über Hexfeldern. Wenn diese Option aktiviert ist, werden der für den Spieler sichtbare Name, die Balken und die Auren von Spielsteinen unter einem abgedeckten Hexfeld ausgeschaltet und wieder eingeschaltet, wenn sie aufgedeckt werden.',
      },
    },
    status: {
      engine: 'Spiel-Engine',
      grid: 'Raster',
      layer: 'Hexfeld-Ebene',
      hexes: 'Hexfelder',
      named: 'Benannte Hexfelder',
      icons: 'Standort-Token',
      glimpsed: 'Durchsichtige Hexfelder',
      pending: 'Standorte, die auf eine Füllung warten',
      calibrated: 'Kalibriert',
      overrides: 'Seitenüberschreibungen',
      undo: 'Rückgängig möglich',
    },
    messages: {
      filled:
        'Vollständig ausfüllen. Gezeichnete Hexen: {created}. Neu gestaltet: {restyled}. Ausgeblendete Orte: {icons}.',
      revealed: 'Aufgedeckte Verhexungen: {count}.',
      revealedPage: 'Jedes Hex auf der Seite wird angezeigt ({count}).',
      confirmReset:
        'Jedes Hex aus „{page}“ ({count}) entfernen? Standort-Tokens kehren zur Token-Ebene zurück. Durch Rückgängigmachen kann dies nicht rückgängig gemacht werden.',
      resetPage: 'Hexes wurden von der Seite entfernt: {count}.',
      undone:
        'Letzte Füllung rückgängig gemacht. Entfernte Verhexungen: {removed}. Neu gestaltete Hexfelder wiederhergestellt: {restored}.',
      named: 'Hexen mit dem Namen „{name}“: {count}.',
      unnamed: 'Gelöschte Namen: {count}.',
      marked:
        'In vorhandenen Hexfeldern versteckte Orte: {attached}. Warten auf die nächste Füllung, die sie abdeckt: {pending}.',
      unmarked: 'Token, die keine Standorte mehr sind: {count}.',
      settingChanged: '{setting} wird auf {value} gesetzt.',
      rescanned:
        'Neuscan abgeschlossen. Behalten: {kept}. Angenommen: {adopted}. Erneut eingereicht: {moved}. Fehlt und vergessen: {dropped}. Neu verknüpfte Etiketten: {labels}. Standort-Tokens neu verknüpft: {icons}.',
      calibrated:
        'Rasterkalibriert (Spaltenschritt {colStep}px, Zeilenschritt {rowStep}px). Erneut scannen: beibehalten {kept}, erneut eingereicht {moved}, übernommen {adopted}.',
      calibrationReset:
        'Kalibrierung entfernt. Erneut scannen: beibehalten {kept}, erneut eingereicht {moved}, übernommen {adopted}.',
      journalRebuilt: 'Die Handouts „{help}“ und „{deck}“ wurden neu erstellt.',
      migrated:
        'Ihre Hexploration-1.x-Hexkarten wurden aktualisiert. Wenn dieses Spiel aus einem Legacy-Spiel kopiert wurde, führen Sie auf jeder Hexkartenseite „Erneut scannen“ aus.',
      pruned:
        'Gespeicherte Hexfelder, die nicht mehr existieren und vergessen wurden: {dropped}. Wenn dieses Spiel oder diese Seite kopiert wurde, führen Sie auf der Seite „Erneut scannen“ aus, um ihre Hexfelder wieder zu erfassen.',
      readyHint:
        'Geben Sie !hexploration ein, um das Menü aufzurufen, oder öffnen Sie das Handout "Hexploration - Command Deck".',
    },
    warnings: {
      foregroundUnavailable:
        'Dieses Spiel unterstützt das Zeichnen auf der Vordergrundebene nicht, daher wurden Hexfelder auf der Tokenebene gezeichnet.',
      someFailed:
        'Hexen, die nicht gezeichnet werden konnten: {count}. Weitere Informationen finden Sie in der API-Konsole.',
    },
    errors: {
      noPage: 'Die Seite, an der gearbeitet werden soll, konnte nicht gefunden werden.',
      notHex: 'Diese Seite verwendet kein Hex-Raster.',
      noPolygons: 'Wählen Sie eine oder mehrere gezeichnete Formen zum Füllen aus.',
      emptyArea: 'Der ausgewählte Bereich enthält keine Hex-Zentren.',
      tooMany: 'Das würde zu viele Verhexungen auf einmal erzeugen ({count}).',
      nothingToConceal:
        'Wählen Sie gezeichnete Formen oder Spielsteine ​​aus, die Sie verbergen möchten.',
      nothingToReveal:
        'Wählen Sie Hexfelder, gezeichnete Formen oder Spielsteine ​​aus, die Sie aufdecken möchten.',
      noTokens: 'Wählen Sie zunächst einen oder mehrere Token aus.',
      noHexes:
        'Wählen Sie zunächst ein oder mehrere Hexfelder (oder darauf stehende Spielsteine) aus.',
      nothingToUndo: 'Es gibt keine Füllung, die rückgängig gemacht werden könnte.',
      unknownCommand: 'Unbekannter Befehl: {command}',
      unknownSetting: 'Unbekannte Einstellung: {key}',
      unknownPageSetting: 'Einstellungen, die pro Seite festgelegt werden können: {keys}',
      invalidValue: '„{value}“ ist kein gültiger Wert für {key}.',
      calibrateNeedsTokens:
        'Wählen Sie ein oder zwei Token aus, die an den Sechseckzentren befestigt werden.',
      calibrateFailed: 'Diese Token können nicht zur Kalibrierung verwendet werden.',
      unexpected: 'Es ist ein Fehler aufgetreten: {message}',
    },
    hints: {
      noPage:
        'Öffnen Sie die Seite, an der Sie arbeiten möchten, oder wählen Sie etwas darauf aus.',
      notHex:
        'Stellen Sie das Seitenraster in den Seiteneinstellungen auf Hex (V) oder Hex (H) ein.',
      noPolygons:
        'Zeichnen Sie ein Polygon, ein Rechteck, eine Ellipse oder eine Freihandform um den Bereich, wählen Sie es aus und versuchen Sie es erneut.',
      emptyArea:
        'Zeichnen Sie eine größere Form oder überprüfen Sie die Seitenrastereinstellungen.',
      tooMany:
        'Füllen Sie einen kleineren Bereich oder teilen Sie den Bereich in mehrere Formen auf.',
      noHexes:
        'Verhexungen befinden sich im Vordergrund oder auf der Token-Ebene. Wechseln Sie zu dieser Ebene, um sie auszuwählen.',
      unknownCommand: 'Geben Sie !hexploration help ein, um die Befehle aufzulisten.',
      unknownSetting: 'Geben Sie !hexploration set ein, um alle Einstellungen anzuzeigen.',
      calibrateNeedsTokens:
        'Rasten Sie einen Spielstein in der Mitte eines Hexfelds ein und wählen Sie ihn aus. Wählen Sie ein zweites Token aus, das an einem benachbarten Hexfeld in derselben Zeile (Hex V) oder Spalte (Hex H) eingerastet ist, um auch die Hexfeldgröße zu korrigieren.',
      calibrateFailed:
        'Zwei Spielsteine ​​müssen sich in derselben Reihe (Hex V) oder derselben Spalte (Hex H) befinden und mindestens ein Hex voneinander entfernt sein.',
      unexpected: 'Details finden Sie im API-Konsolenprotokoll.',
    },
    help: {
      menu: 'Zeigen Sie das Menü an.',
      fill: 'Decken Sie die ausgewählten gezeichneten Formen mit Hexen ab.',
      fillInverse: 'Bedecken Sie die gesamte Seite mit Ausnahme der ausgewählten Formen.',
      undo: 'Machen Sie die letzte Füllung rückgängig, kehren Sie die Füllung um oder verbergen Sie sie und stellen Sie die verwendeten Formen wieder her.',
      reveal:
        'Zeigt die ausgewählten Hexfelder und die Hexfelder unter den ausgewählten Formen und Spielsteinen an.',
      revealPage: 'Enthülle jedes Hex auf der Seite ohne Ankündigungen.',
      conceal:
        'Decken Sie den Bereich unter den ausgewählten Formen und Spielsteinen erneut mit Hexen ab.',
      explore:
        'Zeigen Sie die ausgewählten Spielsteine ​​an, als ob sie sich gerade dorthin bewegt hätten.',
      resetPage: 'Entferne jedes Hex auf der Seite (fragt zuerst).',
      name: 'Benennen Sie die ausgewählten Hexfelder oder die Hexfelder unter den ausgewählten Spielsteinen. Lassen Sie den Namen leer, um ihn zu löschen.',
      mark: 'Verwandeln Sie die ausgewählten Spielsteine ​​in versteckte Orte.',
      unmark: 'Verhindern Sie, dass die ausgewählten Token versteckte Orte sind.',
      set: 'Ändern Sie eine Einstellung oder zeigen Sie alle Einstellungen an.',
      pageSet: 'Überschreiben Sie eine Anzeigeeinstellung nur auf der aktuellen Seite.',
      pageClear: 'Entfernen Sie die Überschreibungen der aktuellen Seite.',
      rescan:
        'Erstellen Sie die Hex-Liste der Seite neu, beispielsweise nach dem Kopieren einer Seite oder eines Spiels.',
      calibrate:
        'Richten Sie das Sechseckgitter so aus, dass ein oder zwei ausgewählte Spielsteine ​​in die Sechseckmitten eingerastet werden.',
      calibrateReset: 'Entfernen Sie die Kalibrierung der aktuellen Seite.',
      status: 'Zeigen Sie, was Hexploration über die aktuelle Seite weiß.',
      journal: 'Erstellen Sie die Handouts Help und Command Deck neu.',
      help: 'Diese Liste anzeigen.',
      handout: 'Vollständige Anweisungen finden Sie im Handout „{name}“.',
    },
    deck: {
      drawDesc:
        'Zeichnen Sie Formen um einen Bereich, wählen Sie sie aus und füllen Sie sie dann. „Füllung rückgängig machen“ macht die letzte Füllung rückgängig.',
      revealDesc:
        'Wählen Sie Hexfelder, Formen oder Token aus, um sie aufzudecken oder wieder zu verdecken. „Erkunden“ deckt die Umgebung ausgewählter Token auf, als hätten sie sich bewegt.',
      locationsDesc:
        'Wählen Sie Spielsteine ​​aus, um sie als Standorte unter Hexfeldern zu verbergen. Wählen Sie Hexfelder oder Token aus, um einem Hexfeld einen Namen zu geben.',
      toolsDesc:
        'Einstellungen, Seitenüberschreibungen, Status, erneutes Scannen kopierter Seiten und Kalibrieren des Rasters.',
      footer: 'Vollständige Anweisungen finden Sie im Handout „{help}“.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Hex-für-Hex-Erkundung für Roll20',
      footer: 'Verwenden Sie das Handout „{deck}“ für Ein-Klick-Steuerungen.',
      overview: {
        heading: 'Überblick',
        body: 'Hexploration umfasst eine Hexfeldkarte mit undurchsichtigen Hexfeldern. Während sich die Gruppe bewegt, werden die Hexfelder, die sie durchquert (und, wenn Sie möchten, die Hexfelder um sie herum) entfernt, sodass die Karte jeweils ein Hexfeld freigelegt wird. Versteckte Orte können unter Hexfeldern platziert werden und werden bekannt gegeben, wenn sie gefunden werden. Es funktioniert in Jumpgate- und Legacy-Spielen auf Hex- (V) und Hex- (H) Gittern jeder Größe.',
        demo: 'Sehen Sie sich eine kurze Demo an (ab Version 1)',
      },
      quickStart: {
        heading: 'Schnellstart',
        steps: [
          'Öffnen Sie eine Seite, deren Raster auf Hex (V) oder Hex (H) eingestellt ist.',
          'Zeichnen Sie eine oder mehrere Formen (Polygon, Rechteck, Ellipse oder Freihand) um den auszublendenden Bereich.',
          'Wählen Sie die Formen aus und klicken Sie im Command Deck auf Füllen (oder geben Sie !hexploration fill ein). Die Formen werden durch Hexfelder ersetzt.',
          'Optional: Wählen Sie vor dem Füllen Token für wichtige Orte aus und klicken Sie auf „Standort markieren“. Sie werden unter den Hexfeldern versteckt und bei ihrer Entdeckung angekündigt.',
          'Bewegen Sie einen Spieler-Token. Jedes Hexfeld, das er durchquert, und die Hexfelder innerhalb seiner Sichtweite werden aufgedeckt.',
        ],
      },
      commands: {
        heading: 'Befehle',
        intro:
          'Nur GMs können diese Befehle verwenden. Die meisten wirken auf die ausgewählten Objekte; Der Rest wirkt auf der Seite, die Sie gerade betrachten.',
        colCommand: 'Befehl',
        colDesc: 'Was es bewirkt',
      },
      revealing: {
        heading: 'Wie Offenlegung funktioniert',
        points: [
          'Nur Token auf der Token-Ebene decken Hexfelder auf. Welche Token zählen, legt „Aufdeckende Token“ fest: standardmäßig Spieler-Token, sodass der GM Monster bewegen kann, ohne die Karte aufzudecken.',
          'Ein Token deckt jedes Hexfeld auf, das er bedeckt (große Token bedecken mehrere), und bei aktiviertem „Entlang des Wegs aufdecken“ jedes Hexfeld auf der Route, entlang der er gezogen wurde, einschließlich Wegpunkten.',
          '„Sichtweite“ deckt die Hexfelder um jedes dieser Hexfelder auf, die nächstgelegenen zuerst. Ist „Sichtlinie“ aktiviert, wird ein Hexfeld nicht aufgedeckt, solange ein verdecktes Hexfeld zwischen ihm und dem Token liegt. Nähere Hexfelder werden meist zuerst aufgedeckt, daher ändert „Sichtlinie“ in offenem Gelände nichts: Sie spielt nur bei einer „Sichtweite“ von 2 oder mehr und bei Hexfeldern eine Rolle, die verdeckt bleiben, etwa Gelände, das mit einer „Aufdeckungsdistanz für Hexfelder“ gefüllt wurde.',
          '„Aufdeckungsdistanz für Hexfelder“ wird beim Füllen in jedem Hexfeld gespeichert, legen Sie sie also vor dem Füllen fest; spätere Änderungen wirken sich nicht auf Hexfelder aus, die bereits auf der Karte liegen. Ein Token muss sich innerhalb so vieler Hexfelder befinden, um sie aufzudecken, egal wie weit es sehen kann, und bei 0 werden sie nur aufgedeckt, wenn man sie betritt. Für eine Bergkette: Setzen Sie „Aufdeckungsdistanz für Hexfelder“ auf 0, füllen Sie die Berge, setzen Sie den Wert wieder auf „keine“ zurück und füllen Sie dann das Land dahinter. Mit „Sichtweite“ 3 und aktivierter „Sichtlinie“ sieht die Gruppe das offene Gelände um sich herum, aber weder die Berge noch das, was dahinter liegt. Jedes Berg-Hexfeld wird aufgedeckt, wenn ein Token es betritt.',
          'Im Modus „Durchsicht“ werden Hexfelder in Sichtweite durchsichtig, statt zu verschwinden, und werden entfernt, sobald ein Token sie betritt. Durchsichtige Hexfelder blockieren die „Sichtlinie“ nicht.',
          'Roll20 zeichnet Token-Namen, Leisten und Auren über den Hexfeldern. Ist „Verdeckte Token ausblenden“ aktiviert, werden bei einem Token unter einem verdeckten Hexfeld der für Spieler sichtbare Name, die Leisten und die Auren ausgeschaltet, bis er aufgedeckt wird, damit versteckte Monster sich nicht verraten. Schalten Sie eines davon ein, während der Token verdeckt ist, bleibt es verborgen und wird eingeschaltet, sobald der Token aufgedeckt wird.',
          'Die API meldet keine Bewegungen anderer Mods. TokenMod-Bewegungen werden automatisch übernommen; Wählen Sie für andere Mods die Token aus und klicken Sie auf „Erkunden“ oder rufen Sie Hexploration.revealAround(token) von Ihrem eigenen Mod aus auf.',
        ],
      },
      locations: {
        heading: 'Benannte Hexfelder und Orte',
        points: [
          '„Standort markieren“ verwandelt die ausgewählten Token in versteckte Standorte. Ein Token, der bereits unter einem Hexfeld liegt, wird sofort versteckt; andernfalls wird er von der nächsten Füllung versteckt, die ihn bedeckt.',
          'Token mit der Statusmarkierung „Weißer Turm“ werden beim Ausfüllen ebenfalls als Orte behandelt, wie in Version 1.',
          'Versteckte Standortmarker werden auf die GM-Ebene verschoben. Wenn ihr Hexfeld aufgedeckt wird, kehren sie mit angezeigtem Namen zur Spielsteinebene zurück und ihre Entdeckung wird bekannt gegeben.',
          '„Hexfeld benennen“ gibt einem Hexfeld einen Namen ohne Token. Der Name wird dem GM als Beschriftung auf der GM-Ebene angezeigt und angekündigt, wenn das Hexfeld aufgedeckt wird.',
          '„Entdeckungen ankündigen“ legt fest, ob alle, nur der GM oder niemand die Ankündigung sieht. „Entdeckungen anpingen“ verschiebt außerdem die Ansicht der Spieler zum Standort.',
        ],
      },
      settings: {
        heading: 'Einstellungen',
        intro:
          'Ändern Sie Einstellungen mit !hexploration set (oder über die Schaltfläche „Einstellungen“). „Hexfeld-Ebene“, „Aufdeckende Token“ und „Sprache“ lassen sich auch auf der Einstellungsseite des Mods festlegen.',
        colKey: 'Schlüssel',
        colName: 'Einstellung',
        colDesc: 'Beschreibung',
        perPage: '(Kann pro Seite eingestellt werden.)',
      },
      jumpgate: {
        heading: 'Jumpgate und Legacy',
        points: [
          'Hexploration ermittelt, welche Engine das Spiel verwendet, und zeichnet die passende Form. In beiden Editoren gezeichnete Formen können gefüllt werden.',
          'Ist „Hexfeld-Ebene“ auf „Auto“ gesetzt, werden Hexfelder auf der Vordergrundebene über den Token gezeichnet, sodass Spieler nicht sehen können, was darunter liegt. Ist die Vordergrundebene nicht verfügbar, wird stattdessen die Token-Ebene verwendet.',
          'Jumpgate zeichnet mathematisch regelmäßige Hexfelder, deren Form leicht von Legacy-Hexfeldern abweicht. Wenn die Hexfelder nicht mit dem Raster einer Seite übereinstimmen, rasten Sie einen Token in der Mitte eines Hexfelds ein, wählen Sie ihn aus und klicken Sie auf „Kalibrieren“. Wählen Sie zwei Token in benachbarten Hexfeldern derselben Zeile (Hex V) oder Spalte (Hex H) aus, um auch die Hexfeldgröße zu korrigieren.',
          'Wenn eine Seite oder ein Spiel kopiert wird, erhalten ihre Hexfelder neue IDs. Führen Sie auf der Seite „Erneut scannen“ aus, um sie zusammen mit ihren Namensbeschriftungen und Standort-Token wieder zu erfassen.',
        ],
      },
      upgrading: {
        heading: 'Upgrade von Version 1',
        points: [
          'Version 2 benötigt PathMath, MatrixMath, Vector Math oder HTML Builder nicht mehr. Sie können sie entfernen, es sei denn, ein anderer Mod verwendet sie.',
          'Vorhandene Hex-Karten, Namen, Standort-Tokens und Einstellungen werden beim ersten Start automatisch aktualisiert.',
          'Die Befehle der Version 1, einschließlich des Hexploration_menu-Makros, funktionieren weiterhin.',
          'In Version 1 konnte jeder Token, der einen Charakter darstellt, Hexfelder aufdecken. Setzen Sie „Aufdeckende Token“ auf „Charaktertoken“, um dieses Verhalten beizubehalten.',
        ],
        colV1: 'Befehl der Version 1',
        colV2: 'Befehl der Version 2',
      },
      troubleshooting: {
        heading: 'Fehlerbehebung',
        points: [
          'Nichts passiert, wenn sich ein Token bewegt: Prüfen Sie, ob der Token auf der Token-Ebene liegt und zu „Aufdeckende Token“ passt und ob die Seite Hexfelder hat (!hexploration status).',
          'Hexfelder sind gegenüber dem Raster versetzt: Verwenden Sie „Kalibrieren“ und prüfen Sie dann mit einem Token einige Hexfelder auf der Karte.',
          'Hexfelder werden nach dem Kopieren einer Seite oder eines Spiels nicht mehr aufgedeckt: Führen Sie auf der Seite „Erneut scannen“ aus.',
          '„Füllen“ meldet, dass der Bereich keine Hexfeld-Mittelpunkte enthält: Die Form muss den Mittelpunkt von mindestens einem Hexfeld enthalten.',
          'Überprüfen Sie für alles andere das API-Konsolenprotokoll und geben Sie die entsprechenden Meldungen an, wenn Sie um Hilfe bitten.',
        ],
      },
      languages: {
        heading: 'Sprachen',
        body: 'Wählen Sie eine Sprache mit !hexploration set language. Verfügbare Sprachen:',
        colLanguage: 'Sprache',
        colNative: 'Eigenbezeichnung',
        colCode: 'Code',
      },
      credits: {
        heading: 'Credits',
        original: 'Original-Mod von',
        maintainer: 'Version 2 verwaltet von',
        marketplace: 'Adas Kunstpakete auf dem Roll20-Marktplatz',
        support:
          'Wenn Sie einen Fehler finden oder eine Idee haben, posten Sie im Roll20 Mod-Forum oder öffnen Sie ein Problem auf GitHub und fügen Sie alle Meldungen aus dem API-Konsolenprotokoll hinzu.',
      },
    },
  };

  const TRANSLATION$d = {
    titles: {
      ready: 'Το Hexploration είναι έτοιμο.',
      settings: 'Ρυθμίσεις Hexploration',
      languages: 'Επιλέξτε μια γλώσσα',
      pageSettings: 'Ρυθμίσεις σελίδας: {page}',
      status: 'Κατάσταση Hexploration: {page}',
      help: 'Εντολές Hexploration',
      confirm: 'Επιβεβαιώστε',
    },
    discovery: {
      title: 'Ανακαλύφθηκε τοποθεσία',
    },
    menu: {
      draw: 'Σχεδίαση',
      reveal: 'Αποκάλυψη και απόκρυψη',
      locations: 'Τοποθεσίες',
      tools: 'Εργαλεία',
      layerInUse: 'Νέα εξάγωνα σχεδιάζονται στο {layer}.',
      pageSettingsHelp:
        'Αυτές οι ρυθμίσεις ισχύουν μόνο για αυτήν τη σελίδα. Οι ρυθμίσεις με την ένδειξη ★ αντικαθιστούν τις καθολικές ρυθμίσεις.',
    },
    buttons: {
      fill: 'Γέμισμα',
      fillInverse: 'Αντίστροφο γέμισμα',
      undo: 'Αναίρεση γεμίσματος',
      reveal: 'Αποκάλυψη',
      conceal: 'Απόκρυψη',
      explore: 'Εξερεύνηση',
      revealPage: 'Αποκάλυψη σελίδας',
      resetPage: 'Επαναφορά σελίδας',
      mark: 'Επισήμανση τοποθεσίας',
      unmark: 'Κατάργηση επισήμανσης',
      name: 'Ονομασία εξαγώνου',
      settings: 'Ρυθμίσεις',
      pageSettings: 'Ρυθμίσεις σελίδας',
      status: 'Κατάσταση',
      rescan: 'Επανασάρωση',
      calibrate: 'Βαθμονόμηση',
      calibrateReset: 'Επαναφορά βαθμονόμησης',
      help: 'Βοήθεια',
      change: 'Αλλαγή',
      menu: 'Μενού',
      clearOverrides: 'Κατάργηση παρακάμψεων',
      confirmReset: 'Ναι, αφαίρεση όλων των εξαγώνων',
    },
    prompts: {
      name: 'Όνομα τοποθεσίας (αφήστε κενό για διαγραφή)',
    },
    values: {
      on: 'Ενεργό',
      off: 'Ανενεργό',
      none: 'Κανένα',
      hexLayer: {
        auto: 'Αυτόματο (πρώτο πλάνο, αν είναι διαθέσιμο)',
        foreground: 'επίπεδο πρώτου πλάνου',
        objects: 'επίπεδο διακριτικών',
      },
      revealBy: {
        players: 'Διακριτικά παικτών',
        characters: 'Διακριτικά χαρακτήρων',
        all: 'Όλα τα διακριτικά',
      },
      revealMode: {
        clear: 'Καθαρισμός',
        glimpse: 'Ματιά',
      },
      announce: {
        all: 'Όλοι',
        gm: 'Μόνο GM',
        off: 'Ανενεργό',
      },
      orientation: {
        vertical: 'Hex (V)',
        horizontal: 'Hex (H)',
      },
      fillKind: {
        fill: 'Γέμισμα',
        fillInverse: 'Αντίστροφο γέμισμα',
        conceal: 'Απόκρυψη',
      },
    },
    settings: {
      language: {
        label: 'Γλώσσα',
        desc: 'Γλώσσα για μενού, μηνύματα και φυλλάδια.',
      },
      hexLayer: {
        label: 'Επίπεδο εξαγώνων',
        desc: 'Πού σχεδιάζονται τα νέα εξάγωνα. Το «Αυτόματο» δοκιμάζει το επίπεδο πρώτου πλάνου (πάνω από τα διακριτικά) και, αν το παιχνίδι δεν το υποστηρίζει, χρησιμοποιεί το επίπεδο διακριτικών.',
      },
      fillColor: {
        label: 'Χρώμα πλήρωσης',
        desc: 'Χρώμα νέων εξάγωνων. Χρησιμοποιήστε rgba() για διαφανή εξάγωνα, για παράδειγμα rgba(0,0,0,0.8).',
      },
      strokeColor: {
        label: 'Χρώμα περιγράμματος',
        desc: 'Χρώμα του περιγράμματος των νέων εξάγωνων.',
      },
      labelColor: {
        label: 'Χρώμα ετικετών',
        desc: 'Χρώμα των ετικετών ονομάτων μόνο για GM στα επώνυμα εξάγωνα.',
      },
      glimpseColor: {
        label: 'Χρώμα Ματιάς',
        desc: 'Το χρώμα που παίρνουν τα εξάγωνα στη λειτουργία «Ματιά». Χρησιμοποιήστε ένα διαφανές χρώμα rgba().',
      },
      strokeWidth: {
        label: 'Πλάτος περιγράμματος',
        desc: 'Πλάτος του περιγράμματος των νέων εξάγωνων, σε pixel (0 έως 20).',
      },
      maxDistance: {
        label: 'Απόσταση αποκάλυψης εξαγώνων',
        desc: 'Αποθηκεύεται στα εξάγωνα όταν γεμίζονται, οπότε ορίστε το πριν από το γέμισμα: αν το αλλάξετε αργότερα, δεν επηρεάζονται τα εξάγωνα που υπάρχουν ήδη στον χάρτη. Ένα διακριτικό πρέπει να βρίσκεται σε απόσταση έως τόσα εξάγωνα για να τα αποκαλύψει, όσο μακριά κι αν βλέπει· με 0 αποκαλύπτονται μόνο όταν μπει σε αυτά. Χρησιμοποιήστε το για βουνά ή δάση. Αφήστε το κενό για να μην υπάρχει όριο.',
      },
      revealDistance: {
        label: 'Απόσταση όρασης',
        desc: 'Πόσα εξάγωνα γύρω από ένα κινούμενο διακριτικό αποκαλύπτονται (0 έως 20). Το 0 αποκαλύπτει μόνο τα εξάγωνα από τα οποία διέρχεται το διακριτικό.',
      },
      lineOfSight: {
        label: 'Γραμμή όρασης',
        desc: 'Όταν είναι ενεργοποιημένο, τα εξάγωνα που παραμένουν καλυμμένα, όπως βουνά που γεμίστηκαν με «Απόσταση αποκάλυψης εξαγώνων», κρύβουν τα εξάγωνα πίσω τους. Κάνει διαφορά μόνο με «Απόσταση όρασης» 2 ή μεγαλύτερη.',
      },
      revealPath: {
        label: 'Αποκάλυψη κατά μήκος της διαδρομής',
        desc: 'Όταν είναι ενεργοποιημένο, κάθε εξάγωνο από το οποίο περνάει ένα διακριτικό κατά τη μεταφορά (συμπεριλαμβανομένων των σημείων διαδρομής) αποκαλύπτεται, όχι μόνο το σημείο που σταματά.',
      },
      revealBy: {
        label: 'Διακριτικά που αποκαλύπτουν',
        desc: 'Ποια κουπόνια στο επίπεδο διακριτικών αποκαλύπτουν εξάγωνα: μάρκες που ελέγχονται από έναν παίκτη, μάρκες που αντιπροσωπεύουν οποιονδήποτε χαρακτήρα ή κάθε διακριτικό.',
      },
      revealMode: {
        label: 'Λειτουργία αποκάλυψης',
        desc: "Ο «Καθαρισμός» αφαιρεί τα εξάγωνα εντός όρασης. Η «Ματιά» τα κάνει αντί γι' αυτό διαφανή· αφαιρούνται όταν μπει σε αυτά ένα διακριτικό.",
      },
      announce: {
        label: 'Ανακοίνωση ανακαλύψεων',
        desc: 'Ποιος βλέπει το μήνυμα συνομιλίας όταν ανακαλύπτεται μια τοποθεσία με όνομα.',
      },
      pingDiscoveries: {
        label: 'Ping στις ανακαλύψεις',
        desc: 'Όταν είναι ενεργοποιημένο, οι παίκτες αποστέλλονται ping σε μια συγκεκριμένη τοποθεσία όταν ανακαλυφθεί.',
      },
      hideCoveredTokens: {
        label: 'Απόκρυψη καλυμμένων διακριτικών',
        desc: 'Το Roll20 σχεδιάζει ονόματα, μπάρες και αύρες πάνω από εξάγωνα. Όταν είναι ενεργοποιημένα, τα κουπόνια κάτω από ένα καλυμμένο εξάγωνο έχουν το όνομα που είναι ορατό από τον παίκτη, τις μπάρες και τις αύρες απενεργοποιημένες και ενεργοποιούνται ξανά όταν αποκαλυφθούν.',
      },
    },
    status: {
      engine: 'Μηχανή παιχνιδιού',
      grid: 'Πλέγμα',
      layer: 'Επίπεδο εξαγώνων',
      hexes: 'Εξάγωνα',
      named: 'Ονομασμένα εξάγωνα',
      icons: 'Διακριτικά τοποθεσιών',
      glimpsed: 'Εξάγωνα σε Ματιά',
      pending: 'Τοποθεσίες που περιμένουν γέμισμα',
      calibrated: 'Βαθμονομημένο',
      overrides: 'Παρακάμψεις σελίδας',
      undo: 'Αναίρεση διαθέσιμη',
    },
    messages: {
      filled:
        'Η συμπλήρωση ολοκληρώθηκε. Σχεδιασμένα εξάγωνα: {created}. Επανασχεδιασμένο: {restyled}. Κρυφές τοποθεσίες: {icons}.',
      revealed: 'Αποκαλύφθηκαν εξάγωνα: {count}.',
      revealedPage: 'Κάθε εξάγωνο στη σελίδα που αποκαλύπτεται ({count}).',
      confirmReset:
        'Να καταργηθεί κάθε εξάγωνο από το "{page}" ({count}); Τα διακριτικά τοποθεσίας επιστρέφουν στο επίπεδο διακριτικών. Η αναίρεση δεν μπορεί να το αντιστρέψει.',
      resetPage: 'Τα εξάγωνα καταργήθηκαν από τη σελίδα: {count}.',
      undone:
        'Η τελευταία πλήρωση αναιρέθηκε. Τα εξάγωνα καταργήθηκαν: {removed}. Αποκαταστάθηκαν τα ανανεωμένα εξάγωνα: {restored}.',
      named: 'Hexes με όνομα "{name}": {count}.',
      unnamed: 'Τα ονόματα διαγράφηκαν: {count}.',
      marked:
        'Τοποθεσίες που είναι κρυμμένες σε υπάρχοντα hexes: {attached}. Αναμονή για το επόμενο γέμισμα που τα καλύπτει: {pending}.',
      unmarked: 'Διακριτικά που δεν είναι πλέον τοποθεσίες: {count}.',
      settingChanged: 'Το {setting} ορίστηκε σε {value}.',
      rescanned:
        'Ολοκληρώθηκε η εκ νέου σάρωση. Διατήρηση: {kept}. Εγκρίθηκε: {adopted}. Κατατέθηκε εκ νέου: {moved}. Λείπει και έχει ξεχαστεί: {dropped}. Οι ετικέτες επανασυνδέθηκαν: {labels}. Τα διακριτικά τοποθεσίας επανασυνδέθηκαν: {icons}.',
      calibrated:
        'Βαθμονόμηση πλέγματος (βήμα στήλης {colStep}px, βήμα γραμμής {rowStep}px). Εκ νέου σάρωση: διατηρήθηκε {kept}, κατατέθηκε εκ νέου {moved}, υιοθετήθηκε {adopted}.',
      calibrationReset:
        'Η βαθμονόμηση καταργήθηκε. Εκ νέου σάρωση: διατηρήθηκε {kept}, κατατέθηκε εκ νέου {moved}, υιοθετήθηκε {adopted}.',
      journalRebuilt: 'Τα φυλλάδια "{help}" και "{deck}" έχουν ανακατασκευαστεί.',
      migrated:
        'Οι εξαγωνικοί χάρτες σας του Hexploration 1.x αναβαθμίστηκαν. Αν αυτό το παιχνίδι αντιγράφηκε από παιχνίδι Legacy, εκτελέστε «Επανασάρωση» σε κάθε σελίδα με εξαγωνικό χάρτη.',
      pruned:
        'Αποθηκευμένα εξάγωνα που δεν υπάρχουν πια και ξεχάστηκαν: {dropped}. Αν αυτό το παιχνίδι ή η σελίδα αντιγράφηκε, εκτελέστε «Επανασάρωση» στη σελίδα για να εντοπιστούν ξανά τα εξάγωνά της.',
      readyHint:
        'Πληκτρολογήστε !hexploration για να ανοίξει το μενού ή ανοίξτε το φυλλάδιο "Hexploration - Command Deck".',
    },
    warnings: {
      foregroundUnavailable:
        'Αυτό το παιχνίδι δεν υποστηρίζει τη σχεδίαση στο πρώτο επίπεδο, επομένως σχεδιάστηκαν εξάγωνα στο επίπεδο διακριτικών.',
      someFailed:
        'Δεκαεξάγωνα που δεν ήταν δυνατό να σχεδιαστούν: {count}. Ελέγξτε την κονσόλα API για λεπτομέρειες.',
    },
    errors: {
      noPage: 'Δεν ήταν δυνατή η εύρεση της σελίδας για εργασία.',
      notHex: 'Αυτή η σελίδα δεν χρησιμοποιεί εξαγωνικό πλέγμα.',
      noPolygons: 'Επιλέξτε ένα ή περισσότερα σχεδιασμένα σχήματα για συμπλήρωση.',
      emptyArea: 'Η επιλεγμένη περιοχή δεν περιέχει κέντρα εξαγώνων.',
      tooMany: 'Αυτό θα δημιουργούσε πάρα πολλά εξάγωνα με μία κίνηση ({count}).',
      nothingToConceal: 'Επιλέξτε σχεδιασμένα σχήματα ή μάρκες για απόκρυψη.',
      nothingToReveal: 'Επιλέξτε εξάγωνα, σχεδιασμένα σχήματα ή μάρκες για αποκάλυψη.',
      noTokens: 'Επιλέξτε πρώτα ένα ή περισσότερα διακριτικά.',
      noHexes: 'Επιλέξτε πρώτα ένα ή περισσότερα εξάγωνα (ή μάρκες που στέκονται σε εξάγωνα).',
      nothingToUndo: 'Δεν υπάρχει γέμισμα για αναίρεση.',
      unknownCommand: 'Άγνωστη εντολή: {command}',
      unknownSetting: 'Άγνωστη ρύθμιση: {key}',
      unknownPageSetting: 'Ρυθμίσεις που μπορούν να οριστούν ανά σελίδα: {keys}',
      invalidValue: 'Το "{value}" δεν είναι έγκυρη τιμή για {key}.',
      calibrateNeedsTokens: 'Επιλέξτε ένα ή δύο διακριτικά που έχουν κουμπώσει σε εξάγωνα κέντρα.',
      calibrateFailed: 'Αυτά τα διακριτικά δεν μπορούν να χρησιμοποιηθούν για βαθμονόμηση.',
      unexpected: 'Κάτι πήγε στραβά: {message}',
    },
    hints: {
      noPage: 'Ανοίξτε τη σελίδα στην οποία θέλετε να εργαστείτε ή επιλέξτε κάτι σε αυτήν.',
      notHex: 'Ορίστε το πλέγμα σελίδων σε Hex (V) ή Hex (H) στις Ρυθμίσεις σελίδας.',
      noPolygons:
        'Σχεδιάστε ένα πολύγωνο, ορθογώνιο, έλλειψη ή σχήμα ελεύθερου γύρω από την περιοχή, επιλέξτε το και δοκιμάστε ξανά.',
      emptyArea: 'Σχεδιάστε ένα μεγαλύτερο σχήμα ή ελέγξτε τις ρυθμίσεις πλέγματος σελίδων.',
      tooMany: 'Γεμίστε μια μικρότερη περιοχή ή χωρίστε την περιοχή σε διάφορα σχήματα.',
      noHexes:
        'Τα εξάγωνα βρίσκονται στο προσκήνιο ή στο στρώμα συμβολικής. μεταβείτε σε αυτό το επίπεδο για να τα επιλέξετε.',
      unknownCommand: 'Πληκτρολογήστε !hexploration help για να παραθέσετε τις εντολές.',
      unknownSetting: 'Πληκτρολογήστε !hexploration set για να δείτε κάθε ρύθμιση.',
      calibrateNeedsTokens:
        'Τοποθετήστε ένα διακριτικό στο κέντρο ενός εξάγωνου και επιλέξτε το. Επιλέξτε ένα δεύτερο διακριτικό που έχει κολλήσει σε ένα γειτονικό εξάγωνο στην ίδια σειρά (Hex V) ή στήλη (Hex H) για να διορθώσετε επίσης το μέγεθος του hex.',
      calibrateFailed:
        'Δύο κουπόνια πρέπει να βρίσκονται στην ίδια σειρά (Hex V) ή στην ίδια στήλη (Hex H), τουλάχιστον ένα εξάγωνο μεταξύ τους.',
      unexpected: 'Οι λεπτομέρειες βρίσκονται στο αρχείο καταγραφής της κονσόλας API.',
    },
    help: {
      menu: 'Εμφάνιση του μενού.',
      fill: 'Καλύψτε τα επιλεγμένα σχεδιασμένα σχήματα με εξάγωνα.',
      fillInverse: 'Καλύψτε ολόκληρη τη σελίδα εκτός από το εσωτερικό των επιλεγμένων σχημάτων.',
      undo: 'Αναιρέστε το τελευταίο γέμισμα, αντίστροφο γέμισμα ή απόκρυψη και επαναφέρετε τα σχήματα που χρησιμοποίησε.',
      reveal:
        'Αποκαλύψτε τα επιλεγμένα εξάγωνα και τα εξάγωνα κάτω από τα επιλεγμένα σχήματα και μάρκες.',
      revealPage: 'Αποκαλύψτε κάθε εξάγωνο στη σελίδα χωρίς ανακοινώσεις.',
      conceal: 'Καλύψτε ξανά την περιοχή κάτω από τα επιλεγμένα σχήματα και μάρκες με εξάγωνα.',
      explore: 'Αποκαλύψτε γύρω από τα επιλεγμένα διακριτικά σαν να είχαν μόλις μετακομίσει εκεί.',
      resetPage: 'Αφαιρέστε κάθε εξάγωνο στη σελίδα (ρωτά πρώτα).',
      name: 'Ονομάστε τα επιλεγμένα εξάγωνα ή τα εξάγωνα κάτω από τα επιλεγμένα διακριτικά. Αφήστε το όνομα κενό για να το διαγράψετε.',
      mark: 'Μετατρέψτε τα επιλεγμένα διακριτικά σε κρυφές τοποθεσίες.',
      unmark: 'Σταματήστε τα επιλεγμένα διακριτικά να είναι κρυφές τοποθεσίες.',
      set: 'Αλλάξτε μια ρύθμιση ή εμφανίστε όλες τις ρυθμίσεις.',
      pageSet: 'Παράκαμψη μιας ρύθμισης αποκάλυψης μόνο στην τρέχουσα σελίδα.',
      pageClear: 'Καταργήστε τις παρακάμψεις της τρέχουσας σελίδας.',
      rescan:
        'Δημιουργήστε ξανά τη λίστα εξαγώνων της σελίδας, για παράδειγμα μετά την αντιγραφή μιας σελίδας ή ενός παιχνιδιού.',
      calibrate:
        'Ευθυγραμμίστε το εξαγωνικό πλέγμα με ένα ή δύο επιλεγμένα κουπόνια που έχουν κουμπώσει σε εξάγωνα κέντρα.',
      calibrateReset: 'Καταργήστε τη βαθμονόμηση της τρέχουσας σελίδας.',
      status: 'Δείξτε τι γνωρίζει η Hexploration για την τρέχουσα σελίδα.',
      journal: 'Αναδημιουργήστε τα φυλλάδια Βοήθειας και Command Deck.',
      help: 'Εμφάνιση αυτής της λίστας.',
      handout: 'Πλήρεις οδηγίες βρίσκονται στο φυλλάδιο "{name}".',
    },
    deck: {
      drawDesc:
        'Σχεδιάστε σχήματα γύρω από μια περιοχή, επιλέξτε τα και κάντε «Γέμισμα». Η «Αναίρεση γεμίσματος» αναιρεί το τελευταίο γέμισμα.',
      revealDesc:
        'Επιλέξτε εξάγωνα, σχήματα ή διακριτικά για να τα αποκαλύψετε ή να τα καλύψετε ξανά. Η «Εξερεύνηση» αποκαλύπτει γύρω από τα επιλεγμένα διακριτικά σαν να είχαν μόλις μετακινηθεί εκεί.',
      locationsDesc:
        'Επιλέξτε διακριτικά για να τα αποκρύψετε ως τοποθεσίες κάτω από τα hexes. Επιλέξτε εξάγωνα ή διακριτικά για να ονομάσετε ένα εξάγωνο.',
      toolsDesc:
        'Ρυθμίσεις, παρακάμψεις σελίδων, κατάσταση, εκ νέου σάρωση αντιγραμμένων σελίδων και βαθμονόμηση του πλέγματος.',
      footer: 'Δείτε το φυλλάδιο "{help}" για πλήρεις οδηγίες.',
    },
    handout: {
      versionLabel: 'Εκδοχή',
      subtitle: 'Εξερεύνηση Hex-by-hex για το Roll20',
      footer: 'Χρησιμοποιήστε το φυλλάδιο "{deck}" για στοιχεία ελέγχου με ένα κλικ.',
      overview: {
        heading: 'Επισκόπηση',
        body: 'Το Hexploration καλύπτει έναν εξάγωνο χάρτη με αδιαφανή εξάγωνα. Καθώς το πάρτι κινείται, τα εξάγωνα από τα οποία περνούν (και, αν θέλετε, τα εξάγωνα γύρω τους) αφαιρούνται, οπότε ο χάρτης αποκαλύπτεται ένα εξάγωνο τη φορά. Οι κρυφές τοποθεσίες μπορούν να τοποθετηθούν κάτω από εξάγωνα και ανακοινώνονται όταν βρεθούν. Λειτουργεί σε παιχνίδια Jumpgate και Legacy, σε πλέγματα Hex (V) και Hex (H) οποιουδήποτε μεγέθους.',
        demo: 'Παρακολουθήστε ένα σύντομο demo (από την έκδοση 1)',
      },
      quickStart: {
        heading: 'Γρήγορη εκκίνηση',
        steps: [
          'Ανοίξτε μια σελίδα της οποίας το πλέγμα έχει οριστεί σε Hex (V) ή Hex (H).',
          'Σχεδιάστε ένα ή περισσότερα σχήματα (πολύγωνο, ορθογώνιο, έλλειψη ή με ελεύθερο χέρι) γύρω από την περιοχή για να κρύψετε.',
          'Επιλέξτε τα σχήματα και κάντε κλικ στο Γέμισμα στο Command Deck (ή πληκτρολογήστε !hexploration fill). Τα σχήματα αντικαθίστανται από εξάγωνα.',
          'Προαιρετικά: πριν από το γέμισμα, επιλέξτε διακριτικά για σημαντικά μέρη και κάντε κλικ στην «Επισήμανση τοποθεσίας». Κρύβονται κάτω από τα εξάγωνα και ανακοινώνονται όταν ανακαλυφθούν.',
          'Μετακινήστε ένα διακριτικό παίκτη. Κάθε εξάγωνο από το οποίο περνά, και τα εξάγωνα εντός της «Απόστασης όρασης» του, αποκαλύπτονται.',
        ],
      },
      commands: {
        heading: 'Εντολές',
        intro:
          'Μόνο οι GM μπορούν να χρησιμοποιήσουν αυτές τις εντολές. Οι περισσότεροι ενεργούν στα επιλεγμένα αντικείμενα. τα υπόλοιπα ενεργούν στη σελίδα που βλέπετε.',
        colCommand: 'Εντολή',
        colDesc: 'Τι κάνει',
      },
      revealing: {
        heading: 'Πώς λειτουργεί η αποκάλυψη',
        points: [
          'Εξάγωνα αποκαλύπτουν μόνο τα διακριτικά στο επίπεδο διακριτικών. Ποια διακριτικά μετράνε ορίζεται από τη ρύθμιση «Διακριτικά που αποκαλύπτουν»: από προεπιλογή τα διακριτικά παικτών, ώστε ο GM να μπορεί να μετακινεί τέρατα χωρίς να αποκαλύπτει τον χάρτη.',
          'Ένα διακριτικό αποκαλύπτει κάθε εξάγωνο που καλύπτει (τα μεγάλα διακριτικά καλύπτουν πολλά) και, με ενεργή την «Αποκάλυψη κατά μήκος της διαδρομής», κάθε εξάγωνο της διαδρομής στην οποία σύρθηκε, μαζί με τα ενδιάμεσα σημεία.',
          'Η «Απόσταση όρασης» αποκαλύπτει τα εξάγωνα γύρω από καθένα από αυτά τα εξάγωνα, ξεκινώντας από τα πλησιέστερα. Με ενεργή τη «Γραμμή όρασης», ένα εξάγωνο δεν αποκαλύπτεται όσο παρεμβάλλεται καλυμμένο εξάγωνο ανάμεσα σε αυτό και στο διακριτικό. Τα πλησιέστερα εξάγωνα συνήθως αποκαλύπτονται πρώτα, οπότε σε ανοιχτό έδαφος η «Γραμμή όρασης» δεν αλλάζει τίποτα: έχει σημασία μόνο με «Απόσταση όρασης» 2 ή μεγαλύτερη και εξάγωνα που παραμένουν καλυμμένα, όπως έδαφος που γεμίστηκε με «Απόσταση αποκάλυψης εξαγώνων».',
          'Η «Απόσταση αποκάλυψης εξαγώνων» αποθηκεύεται σε κάθε εξάγωνο όταν γεμίζεται, οπότε ορίστε την πριν από το γέμισμα· αν την αλλάξετε αργότερα, δεν επηρεάζονται τα εξάγωνα που υπάρχουν ήδη στον χάρτη. Ένα διακριτικό πρέπει να βρίσκεται σε απόσταση έως τόσα εξάγωνα για να τα αποκαλύψει, όσο μακριά κι αν βλέπει, και με 0 αποκαλύπτονται μόνο όταν μπει σε αυτά. Για μια οροσειρά: ορίστε την «Απόσταση αποκάλυψης εξαγώνων» σε 0, γεμίστε τα βουνά, επαναφέρετέ την σε καμία τιμή και μετά γεμίστε τη γη πέρα από αυτά. Με «Απόσταση όρασης» 3 και ενεργή τη «Γραμμή όρασης», η ομάδα βλέπει το ανοιχτό έδαφος γύρω της, αλλά όχι τα βουνά ή ό,τι βρίσκεται πίσω τους. Κάθε ορεινό εξάγωνο αποκαλύπτεται όταν ένα διακριτικό μπει σε αυτό.',
          'Στη λειτουργία «Ματιά», τα εξάγωνα εντός όρασης γίνονται διαφανή αντί να εξαφανίζονται και αφαιρούνται όταν μπει σε αυτά ένα διακριτικό. Τα εξάγωνα σε κατάσταση «Ματιά» δεν εμποδίζουν τη «Γραμμή όρασης».',
          'Το Roll20 σχεδιάζει τα ονόματα, τις μπάρες και τις αύρες των διακριτικών πάνω από τα εξάγωνα. Με ενεργή την «Απόκρυψη καλυμμένων διακριτικών», ένα διακριτικό κάτω από καλυμμένο εξάγωνο έχει απενεργοποιημένα το ορατό στους παίκτες όνομα, τις μπάρες και τις αύρες μέχρι να αποκαλυφθεί, ώστε τα κρυμμένα τέρατα να μην προδίδονται. Αν ενεργοποιήσετε κάποιο από αυτά ενώ το διακριτικό είναι καλυμμένο, παραμένει κρυφό και ενεργοποιείται όταν το διακριτικό αποκαλυφθεί.',
          'Το API δεν αναφέρει κινήσεις που κάνουν άλλα mods. Οι κινήσεις του TokenMod εντοπίζονται αυτόματα· για άλλα mods, επιλέξτε τα διακριτικά και κάντε κλικ στην «Εξερεύνηση» ή καλέστε το Hexploration.revealAround(token) από το δικό σας mod.',
        ],
      },
      locations: {
        heading: 'Με όνομα Hexes and Locations',
        points: [
          'Η «Επισήμανση τοποθεσίας» μετατρέπει τα επιλεγμένα διακριτικά σε κρυφές τοποθεσίες. Ένα διακριτικό που βρίσκεται ήδη κάτω από εξάγωνο κρύβεται αμέσως· αλλιώς κρύβεται από το επόμενο γέμισμα που το καλύπτει.',
          'Τα διακριτικά με τον δείκτη κατάστασης του λευκού πύργου αντιμετωπίζονται επίσης ως τοποθεσίες όταν συμπληρώνετε, όπως στην έκδοση 1.',
          'Τα κρυφά διακριτικά τοποθεσίας μετακινούνται στο επίπεδο GM. Όταν το εξάγωνό τους αποκαλύπτεται, επιστρέφουν στο στρώμα συμβολικών με το όνομά τους που φαίνεται και η ανακάλυψή τους ανακοινώνεται.',
          'Η «Ονομασία εξαγώνου» δίνει όνομα σε ένα εξάγωνο χωρίς διακριτικό. Το όνομα εμφανίζεται στον GM ως ετικέτα στο επίπεδο GM και ανακοινώνεται όταν αποκαλυφθεί το εξάγωνο.',
          'Η «Ανακοίνωση ανακαλύψεων» ορίζει αν θα βλέπουν την ανακοίνωση όλοι, μόνο ο GM ή κανείς. Το «Ping στις ανακαλύψεις» μετακινεί επίσης την προβολή των παικτών στην τοποθεσία.',
        ],
      },
      settings: {
        heading: 'Ρυθμίσεις',
        intro:
          'Αλλάξτε τις ρυθμίσεις με το !hexploration set (ή το κουμπί «Ρυθμίσεις»). Το «Επίπεδο εξαγώνων», τα «Διακριτικά που αποκαλύπτουν» και η «Γλώσσα» ορίζονται επίσης στη σελίδα ρυθμίσεων του Mod.',
        colKey: 'Κλειδί',
        colName: 'Σύνθεση',
        colDesc: 'Περιγραφή',
        perPage: '(Μπορεί να οριστεί ανά σελίδα.)',
      },
      jumpgate: {
        heading: 'Jumpgate και Legacy',
        points: [
          'Το Hexploration προσδιορίζει τον κινητήρα που χρησιμοποιεί το παιχνίδι και σχεδιάζει το αντίστοιχο είδος σχήματος. Τα σχήματα που σχεδιάζονται σε οποιοδήποτε πρόγραμμα επεξεργασίας μπορούν να συμπληρωθούν.',
          'Με το «Επίπεδο εξαγώνων» σε «Αυτόματο», τα εξάγωνα σχεδιάζονται στο επίπεδο πρώτου πλάνου, πάνω από τα διακριτικά, ώστε οι παίκτες να μη βλέπουν τι υπάρχει από κάτω. Αν το επίπεδο πρώτου πλάνου δεν είναι διαθέσιμο, χρησιμοποιείται το επίπεδο διακριτικών.',
          'Το Jumpgate σχεδιάζει μαθηματικά κανονικά εξάγωνα, με ελαφρώς διαφορετικό σχήμα από τα εξάγωνα του Legacy. Αν τα εξάγωνα δεν ευθυγραμμίζονται με το πλέγμα μιας σελίδας, κουμπώστε ένα διακριτικό στο κέντρο ενός εξαγώνου, επιλέξτε το και κάντε κλικ στη «Βαθμονόμηση». Επιλέξτε δύο διακριτικά σε γειτονικά εξάγωνα της ίδιας σειράς (Hex V) ή στήλης (Hex H) για να διορθώσετε και το μέγεθος του εξαγώνου.',
          'Όταν αντιγράφεται μια σελίδα ή ένα παιχνίδι, τα εξάγωνά του παίρνουν νέα αναγνωριστικά. Εκτελέστε «Επανασάρωση» στη σελίδα για να εντοπιστούν ξανά, μαζί με τις ετικέτες ονομάτων και τα διακριτικά τοποθεσιών τους.',
        ],
      },
      upgrading: {
        heading: 'Αναβάθμιση από την έκδοση 1',
        points: [
          'Η έκδοση 2 δεν χρειάζεται πλέον PathMath, MatrixMath, Vector Math ή HTML Builder. Μπορείτε να τα αφαιρέσετε εκτός εάν τα χρησιμοποιεί άλλο mod.',
          'Οι υπάρχοντες εξαγωνικοί χάρτες, τα ονόματα, τα διακριτικά τοποθεσιών και οι ρυθμίσεις αναβαθμίζονται αυτόματα στην πρώτη εκκίνηση.',
          'Οι εντολές έκδοσης 1, συμπεριλαμβανομένης της μακροεντολής Hexploration_menu, εξακολουθούν να λειτουργούν.',
          'Η έκδοση 1 επέτρεπε σε κάθε διακριτικό που αντιπροσώπευε χαρακτήρα να αποκαλύπτει εξάγωνα. Ορίστε τα «Διακριτικά που αποκαλύπτουν» σε «Διακριτικά χαρακτήρων» για να διατηρήσετε αυτή τη συμπεριφορά.',
        ],
        colV1: 'Εντολή έκδοσης 1',
        colV2: 'Εντολή έκδοσης 2',
      },
      troubleshooting: {
        heading: 'Αντιμετώπιση προβλημάτων',
        points: [
          'Δεν συμβαίνει τίποτα όταν μετακινείται ένα διακριτικό: ελέγξτε ότι το διακριτικό βρίσκεται στο επίπεδο διακριτικών και ταιριάζει με τη ρύθμιση «Διακριτικά που αποκαλύπτουν», και ότι η σελίδα έχει εξάγωνα (!hexploration status).',
          'Τα εξάγωνα είναι μετατοπισμένα από το πλέγμα: χρησιμοποιήστε τη «Βαθμονόμηση» και μετά ελέγξτε με ένα διακριτικό μερικά εξάγωνα σε διάφορα σημεία του χάρτη.',
          'Τα εξάγωνα σταμάτησαν να αποκαλύπτονται μετά την αντιγραφή μιας σελίδας ή ενός παιχνιδιού: εκτελέστε «Επανασάρωση» στη σελίδα.',
          'Το «Γέμισμα» αναφέρει ότι η περιοχή δεν έχει κέντρα εξαγώνων: το σχήμα πρέπει να περιέχει το κέντρο τουλάχιστον ενός εξαγώνου.',
          'Για οτιδήποτε άλλο, ελέγξτε το αρχείο καταγραφής της κονσόλας API και συμπεριλάβετε τα μηνύματά του όταν ζητάτε βοήθεια.',
        ],
      },
      languages: {
        heading: 'Γλώσσες',
        body: 'Επιλέξτε μια γλώσσα με !hexploration set language. Διαθέσιμες γλώσσες:',
        colLanguage: 'Γλώσσα',
        colNative: 'Όνομα στη γλώσσα της',
        colCode: 'Κώδικας',
      },
      credits: {
        heading: 'Πιστώσεις',
        original: 'Πρωτότυπο mod από',
        maintainer: 'Έκδοση 2 που διατηρείται από',
        marketplace: 'Τα πακέτα τέχνης της Ada στο Roll20 Marketplace',
        support:
          'Εάν βρείτε ένα σφάλμα ή έχετε μια ιδέα, δημοσιεύστε στο φόρουμ Roll20 Mod ή ανοίξτε ένα ζήτημα στο GitHub και συμπεριλάβετε τυχόν μηνύματα από το αρχείο καταγραφής της κονσόλας API.',
      },
    },
  };

  const TRANSLATION$c = {
    titles: {
      ready: 'Hexploration מוכן.',
      settings: 'הגדרות Hexploration',
      languages: 'בחירת שפה',
      pageSettings: 'הגדרות דף: {page}',
      status: 'מצב Hexploration: {page}',
      help: 'פקודות Hexploration',
      confirm: 'נא לאשר',
    },
    discovery: {
      title: 'מיקום התגלה',
    },
    menu: {
      draw: 'ציור',
      reveal: 'חשיפה והסתרה',
      locations: 'מיקומים',
      tools: 'כלים',
      layerInUse: 'משושים חדשים מצוירים על {layer}.',
      pageSettingsHelp:
        'הגדרות אלו חלות על דף זה בלבד. הגדרות המסומנות ★ עוקפות את ההגדרות הגלובליות.',
    },
    buttons: {
      fill: 'מילוי',
      fillInverse: 'מילוי הפוך',
      undo: 'ביטול מילוי',
      reveal: 'חשיפה',
      conceal: 'הסתרה',
      explore: 'חקירה',
      revealPage: 'חשיפת הדף',
      resetPage: 'איפוס הדף',
      mark: 'סימון מיקום',
      unmark: 'ביטול סימון',
      name: 'מתן שם למשושה',
      settings: 'הגדרות',
      pageSettings: 'הגדרות דף',
      status: 'מצב',
      rescan: 'סריקה מחדש',
      calibrate: 'כיול',
      calibrateReset: 'אפס כיול',
      help: 'עזרה',
      change: 'שינוי',
      menu: 'תפריט',
      clearOverrides: 'ניקוי עקיפות',
      confirmReset: 'כן, הסר את כל המשושים',
    },
    prompts: {
      name: 'שם המיקום (השאירו ריק כדי לנקות)',
    },
    values: {
      on: 'מופעל',
      off: 'כבוי',
      none: 'ללא',
      hexLayer: {
        auto: 'אוטומטי (שכבת החזית אם זמינה)',
        foreground: 'שכבת החזית',
        objects: 'שכבת האסימונים',
      },
      revealBy: {
        players: 'אסימוני שחקנים',
        characters: 'אסימוני דמויות',
        all: 'כל האסימונים',
      },
      revealMode: {
        clear: 'הסרה',
        glimpse: 'הצצה',
      },
      announce: {
        all: 'כולם',
        gm: 'GM בלבד',
        off: 'כבוי',
      },
      orientation: {
        vertical: 'Hex (V)',
        horizontal: 'Hex (H)',
      },
      fillKind: {
        fill: 'מילוי',
        fillInverse: 'מילוי הפוך',
        conceal: 'הסתרה',
      },
    },
    settings: {
      language: {
        label: 'שפה',
        desc: 'שפה לתפריטים, הודעות ודפי מידע.',
      },
      hexLayer: {
        label: 'שכבת המשושים',
        desc: 'היכן מציירים משושים חדשים. אוטומטי מנסה את שכבת החזית (מעל האסימונים) ונופל בחזרה לשכבת האסימון אם המשחק אינו תומך בה.',
      },
      fillColor: {
        label: 'צבע מילוי',
        desc: 'צבע של משושים חדשים. השתמש ב-rgba() עבור hexes שקופים, למשל rgba(0,0,0,0.8).',
      },
      strokeColor: {
        label: 'צבע מסגרת',
        desc: 'צבע קווי המתאר של משושות חדשות.',
      },
      labelColor: {
        label: 'צבע תווית',
        desc: 'צבע של תוויות השם GM בלבד על hexes עם שם.',
      },
      glimpseColor: {
        label: 'צבע הצצה',
        desc: 'הצבע שאליו משושים משתנים בעת הצצה (מצב החשיפה הצצה). השתמש בצבע rgba() שקוף.',
      },
      strokeWidth: {
        label: 'עובי מסגרת',
        desc: 'רוחב קווי המתאר של משושים חדשים, בפיקסלים (0 עד 20).',
      },
      maxDistance: {
        label: 'מרחק חשיפת משושים',
        desc: 'נשמר על המשושים בעת מילוים, לכן הגדר אותו לפני המילוי: שינוי מאוחר יותר אינו משפיע על משושים שכבר נמצאים במפה. אסימון חייב להיות בטווח של מספר המשושים הזה כדי לחשוף אותם, לא משנה כמה רחוק הוא יכול לראות; עם 0 הם נחשפים רק כשנכנסים אליהם. השתמש בו להרים או ליערות. השאר ריק ללא הגבלה.',
      },
      revealDistance: {
        label: 'מרחק ראייה',
        desc: 'כמה משושים סביב אסימון נע נחשפים (0 עד 20). 0 חושף רק את המשושים שהאסימון עובר דרכם.',
      },
      lineOfSight: {
        label: 'קו ראייה',
        desc: 'כאשר מופעל, משושים שנשארים מכוסים, כמו הרים שמולאו עם מרחק חשיפת משושים, מסתירים את המשושים שמאחוריהם. יש לכך השפעה רק עם מרחק ראייה של 2 ומעלה.',
      },
      revealPath: {
        label: 'חשיפה לאורך המסלול',
        desc: 'כאשר הוא פועל, כל משושה שאסימון עובר דרכו בזמן גרירה (כולל נקודות ציון) מתגלה, לא רק היכן שהוא עוצר.',
      },
      revealBy: {
        label: 'אסימונים חושפים',
        desc: 'אילו אסימונים בשכבת האסימון חושפים משושים: אסימונים הנשלטים על ידי שחקן, אסימונים המייצגים כל דמות או כל אסימון.',
      },
      revealMode: {
        label: 'מצב חשיפה',
        desc: 'הסרה מסירה משושים שבטווח הראייה. הצצה הופכת אותם לשקופים במקום זאת; הם מוסרים כאשר אסימון נכנס אליהם.',
      },
      announce: {
        label: 'הכרזה על תגליות',
        desc: "מי רואה את הודעת הצ'אט כאשר מתגלה מיקום בעל שם.",
      },
      pingDiscoveries: {
        label: 'פינג לתגליות',
        desc: 'כאשר הוא פועל, שחקנים מקבלים פינג למיקום בעל שם כאשר הוא מתגלה.',
      },
      hideCoveredTokens: {
        label: 'הסתר אסימונים מכוסים',
        desc: 'Roll20 מצייר שמות, פסים והילות מעל משושים. כשההגדרה מופעלת, השם, הפסים וההילות הגלויים לשחקנים של אסימונים שמתחת למשושה מכוסה נכבים, ומופעלים שוב כשהם נחשפים.',
      },
    },
    status: {
      engine: 'מנוע משחק',
      grid: 'רשת',
      layer: 'שכבת המשושים',
      hexes: 'משושים',
      named: 'משושים עם שם',
      icons: 'אסימוני מיקום',
      glimpsed: 'משושים בהצצה',
      pending: 'מיקומים ממתינים למילוי',
      calibrated: 'מכויל',
      overrides: 'עקיפות דף',
      undo: 'ניתן לבטל',
    },
    messages: {
      filled:
        'מילוי הושלם. משושים מצוירים: {created}. עיצוב מחדש: {restyled}. מיקומים מוסתרים: {icons}.',
      revealed: 'נחשפו משושים: {count}.',
      revealedPage: 'כל hex בדף נחשף ({count}).',
      confirmReset:
        'להסיר כל hex מ-"{page}" ({count})? אסימוני מיקום חוזרים לשכבת האסימון. לא ניתן לבטל את זה.',
      resetPage: 'הקסים הוסרו מהדף: {count}.',
      undone: 'המילוי האחרון בוטל. הקסים הוסרו: {removed}. שוחזרו משושי סגנון מחדש: {restored}.',
      named: 'hexes בשם "{name}": {count}.',
      unnamed: 'שמות נוקו: {count}.',
      marked: 'מיקומים מוסתרים בשושים קיימים: {attached}. ממתין למילוי הבא שיכסה אותם: {pending}.',
      unmarked: 'אסימונים שאינם עוד מיקומים: {count}.',
      settingChanged: '{setting} מוגדר ל-{value}.',
      rescanned:
        'הסריקה מחדש הושלמה. נשמר: {kept}. אומץ: {adopted}. הוגש מחדש: {moved}. חסר ונשכח: {dropped}. תוויות מקושרות מחדש: {labels}. אסימוני מיקום מקושרים מחדש: {icons}.',
      calibrated:
        'רשת מכוילת (שלב עמודה {colStep}px, שלב שורה {rowStep}px). סריקה מחדש: שמר על {kept}, הוגש מחדש {moved}, אומץ {adopted}.',
      calibrationReset:
        'הכיול הוסר. סריקה מחדש: שמר על {kept}, הוגש מחדש {moved}, אימץ את {adopted}.',
      journalRebuilt: 'הדפים "{help}" ו-"{deck}" נבנו מחדש.',
      migrated:
        'מפות המשושים שלך מ-Hexploration 1.x שודרגו. אם המשחק הזה הועתק ממשחק Legacy, הפעל סריקה מחדש בכל דף של מפת משושים.',
      pruned:
        'משושים שמורים שכבר לא קיימים ונשכחו: {dropped}. אם המשחק או הדף הזה הועתקו, הפעל סריקה מחדש בדף כדי להרים שוב את המשושים שלו.',
      readyHint:
        'הקלד !hexploration כדי לפתוח את התפריט, או פתח את דף המידע "Hexploration - Command Deck".',
    },
    warnings: {
      foregroundUnavailable:
        'משחק זה אינו תומך בציור על שכבת החזית, כך ששושים צוירו על שכבת האסימון.',
      someFailed: 'הקסים שלא ניתן היה לצייר: {count}. בדוק את מסוף ה-API לפרטים.',
    },
    errors: {
      noPage: 'לא הצלחתי למצוא את הדף לעבוד עליו.',
      notHex: 'דף זה אינו משתמש ברשת משושה.',
      noPolygons: 'בחר צורה מצוירת אחת או יותר למילוי.',
      emptyArea: 'האזור שנבחר אינו מכיל מרכזי hex.',
      tooMany: 'זה ייצור יותר מדי hexes במכה אחת ({count}).',
      nothingToConceal: 'בחר צורות מצוירות או אסימונים כדי להסתיר.',
      nothingToReveal: 'בחר משושים, צורות מצוירות או אסימונים לחשיפה.',
      noTokens: 'תחילה בחר אסימון אחד או יותר.',
      noHexes: 'בחר תחילה משושה אחת או יותר (או אסימונים העומדים על משושים).',
      nothingToUndo: 'אין מילוי לבטל.',
      unknownCommand: 'פקודה לא ידועה: {command}',
      unknownSetting: 'הגדרה לא ידועה: {key}',
      unknownPageSetting: 'הגדרות שניתן להגדיר לכל עמוד: {keys}',
      invalidValue: '"{value}" אינו ערך חוקי עבור {key}.',
      calibrateNeedsTokens: 'בחר אסימון אחד או שניים שהוצמדו למרכזי משושה.',
      calibrateFailed: 'לא ניתן להשתמש באסימונים האלה לכיול.',
      unexpected: 'משהו השתבש: {message}',
    },
    hints: {
      noPage: 'פתח את הדף שאתה רוצה לעבוד עליו, או בחר משהו בו.',
      notHex: 'הגדר את רשת העמודים ל-Hex (V) או Hex (H) בהגדרות עמוד.',
      noPolygons:
        'צייר מצולע, מלבן, אליפסה או צורה ביד חופשית סביב האזור, בחר אותו ולאחר מכן נסה שוב.',
      emptyArea: 'צייר צורה גדולה יותר, או בדוק את הגדרות רשת העמודים.',
      tooMany: 'ממלאים שטח קטן יותר, או חלקו את השטח למספר צורות.',
      noHexes: 'המשושים נמצאים בחזית או בשכבת האסימון; עבור לשכבה זו כדי לבחור אותם.',
      unknownCommand: 'הקלד !hexploration help כדי לרשום את הפקודות.',
      unknownSetting: 'הקלד !hexploration set כדי לראות כל הגדרה.',
      calibrateNeedsTokens:
        'הצמד אסימון למרכז משושה ובחר בו. בחר אסימון שני שנצמד ל-hex סמוך באותה שורה (Hex V) או עמודה (Hex H) כדי לתקן גם את גודל הhex.',
      calibrateFailed:
        'שני אסימונים חייבים להיות באותה שורה (Hex V) או באותה עמודה (Hex H), לפחות hex אחד בנפרד.',
      unexpected: 'הפרטים נמצאים ביומן מסוף ה-API.',
    },
    help: {
      menu: 'הצג את התפריט.',
      fill: 'כסה את הצורות המצוירות שנבחרו בשושים.',
      fillInverse: 'כסה את כל העמוד למעט בתוך הצורות שנבחרו.',
      undo: 'בטל את המילוי האחרון, מילוי הפוך או הסתר, ושחזר את הצורות בהן השתמש.',
      reveal: 'חשוף את המשושים שנבחרו, ואת המשושים תחת הצורות והאסימונים שנבחרו.',
      revealPage: 'חשוף כל קסם בדף ללא הודעות.',
      conceal: 'כסה שוב את השטח מתחת לצורות והאסימונים שנבחרו בשושים.',
      explore: 'חשפו סביב האסימונים שנבחרו כאילו הם זה עתה עברו לשם.',
      resetPage: 'הסר כל hex בדף (שואל תחילה).',
      name: 'תן שם למשושים שנבחרו, או לשושים מתחת לאסימונים שנבחרו. השאר את השם ריק כדי לנקות אותו.',
      mark: 'הפוך את האסימונים שנבחרו למיקומים נסתרים.',
      unmark: 'עצור את האסימונים שנבחרו להיות מיקומים מוסתרים.',
      set: 'שנה הגדרה או הצג את כל ההגדרות.',
      pageSet: 'עוקף הגדרת חשיפה בדף הנוכחי בלבד.',
      pageClear: 'הסר את העקיפות של הדף הנוכחי.',
      rescan: 'בנה מחדש את רשימת ה-hex של העמוד, למשל לאחר העתקת עמוד או משחק.',
      calibrate: 'שורה את הרשת המשושה עם אסימון אחד או שניים נבחרים המוצמדים למרכזי משושה.',
      calibrateReset: 'הסר את הכיול של הדף הנוכחי.',
      status: 'הצג מה Hexploration יודע על הדף הנוכחי.',
      journal: 'בנה מחדש את דפי המידע של העזרה ושל Command Deck.',
      help: 'הצג רשימה זו.',
      handout: 'ההנחיות המלאות נמצאות בדף "{name}".',
    },
    deck: {
      drawDesc: 'צייר צורות סביב אזור, בחר אותן ולאחר מכן מלא. ביטול מילוי מבטל את המילוי האחרון.',
      revealDesc:
        'בחר משושים, צורות או אסימונים כדי לחשוף אותם או לכסות אותם שוב. חקירה חושפת את הסביבה של האסימונים הנבחרים כאילו הם זזו לשם.',
      locationsDesc:
        'בחר אסימונים כדי להסתיר אותם כמיקומים מתחת למשושים. בחר משושים או אסימונים כדי לתת שם למשושה.',
      toolsDesc: 'הגדרות, עקיפות עמודים, מצב, סריקה מחדש של דפים שהועתקו וכיול הרשת.',
      footer: 'עיין בדף "{help}" להנחיות מלאות.',
    },
    handout: {
      versionLabel: 'גִרְסָה',
      subtitle: 'חקירה משושה אחר קסם עבור Roll20',
      footer: 'השתמש בדף "{deck}" עבור פקדים בלחיצה אחת.',
      overview: {
        heading: 'סקירה כללית',
        body: 'Hexploration מכסה מפת משושים במשושים אטומים. כשהחבורה זזה, המשושים שהיא עוברת דרכם (ואם תרצו, גם המשושים שסביבה) מוסרים, כך שהמפה נחשפת משושה אחר משושה. אפשר להציב מיקומים מוסתרים מתחת למשושים, והם מוכרזים כשהם נמצאים. הכלי עובד במשחקי Jumpgate ו-Legacy, על רשתות Hex (V) ו-Hex (H) בכל גודל.',
        demo: 'צפו בהדגמה קצרה (מגרסה 1)',
      },
      quickStart: {
        heading: 'התחלה מהירה',
        steps: [
          'פתח עמוד שהרשת שלו מוגדרת ל- Hex (V) או Hex (H).',
          'צייר צורה אחת או יותר (מצולע, מלבן, אליפסה או ביד חופשית) סביב האזור כדי להסתיר.',
          'בחר את הצורות ולחץ על מילוי ב-Command Deck (או הקלד !hexploration fill). הצורות מוחלפות במשושים.',
          'אופציונלי: לפני המילוי, בחר אסימונים למקומות חשובים ולחץ על סימון מיקום. הם מוסתרים מתחת למשושים ומוכרזים כשהם מתגלים.',
          'הזז אסימון שחקן. כל משושה שהוא עובר דרכו, והמשושים שבתוך מרחק הראייה שלו, נחשפים.',
        ],
      },
      commands: {
        heading: 'פקודות',
        intro:
          'רק GMs יכולים להשתמש בפקודות אלה. רובם פועלים על האובייקטים שנבחרו; השאר פועלים בדף שבו אתה צופה.',
        colCommand: 'פְּקוּדָה',
        colDesc: 'מה זה עושה',
      },
      revealing: {
        heading: 'איך עובד גילוי',
        points: [
          'רק אסימונים בשכבת האסימונים חושפים משושים. אילו אסימונים נחשבים נקבע בהגדרה אסימונים חושפים: כברירת מחדל אסימוני שחקנים, כך שה-GM יכול להזיז מפלצות בלי לחשוף את המפה.',
          'אסימון חושף כל משושה שהוא מכסה (אסימונים גדולים מכסים כמה), וכשחשיפה לאורך המסלול מופעלת, גם כל משושה במסלול שלאורכו נגרר, כולל נקודות ציון.',
          'מרחק ראייה חושף את המשושים סביב כל אחד מאותם משושים, מהקרוב ביותר תחילה. כשקו ראייה מופעל, משושה אינו נחשף כל עוד יש משושה מכוסה בינו לבין האסימון. משושים קרובים יותר נחשפים בדרך כלל ראשונים, ולכן בשטח פתוח קו ראייה אינו משנה דבר: יש לו השפעה רק עם מרחק ראייה של 2 ומעלה ומשושים שנשארים מכוסים, כמו שטח שמולא עם מרחק חשיפת משושים.',
          'מרחק חשיפת משושים נשמר על כל משושה בעת מילויו, לכן הגדר אותו לפני המילוי; שינוי מאוחר יותר אינו משפיע על משושים שכבר נמצאים במפה. אסימון חייב להיות בטווח של מספר המשושים הזה כדי לחשוף אותם, לא משנה כמה רחוק הוא יכול לראות, ועם 0 הם נחשפים רק כשנכנסים אליהם. לרכס הרים: הגדר את מרחק חשיפת משושים ל-0, מלא את ההרים, החזר אותו ל"ללא", ואז מלא את השטח שמעבר להם. עם מרחק ראייה 3 וקו ראייה מופעל, החבורה רואה את השטח הפתוח סביבה, אך לא את ההרים או את מה שמאחוריהם. כל משושה הר נחשף כאשר אסימון נכנס אליו.',
          'במצב הצצה, משושים בטווח ראייה הופכים שקופים במקום להיעלם, והם מוסרים כאשר אסימון נכנס אליהם. משושים במצב הצצה אינם חוסמים קו ראייה.',
          'Roll20 מצייר את שמות האסימונים, הפסים וההילות מעל משושים. כשהסתר אסימונים מכוסים מופעל, לאסימון שמתחת למשושה מכוסה נכבים השם, הפסים וההילות הגלויים לשחקנים עד שהוא נחשף, כך שמפלצות מוסתרות לא מסגירות את עצמן. אם תפעיל אחד מהם בזמן שהאסימון מכוסה, הוא יישאר מוסתר ויופעל כשהאסימון ייחשף.',
          'ה-API אינו מדווח על תזוזות שבוצעו על ידי מודים אחרים. תזוזות של TokenMod נקלטות אוטומטית; עבור מודים אחרים, בחר את האסימונים ולחץ על חקירה, או קרא ל-Hexploration.revealAround(token) מהמוד שלך.',
        ],
      },
      locations: {
        heading: 'בשם משושים ומיקומים',
        points: [
          'סימון מיקום הופך את האסימונים שנבחרו למיקומים מוסתרים. אסימון שכבר נמצא מתחת למשושה מוסתר מיד; אחרת הוא מוסתר במילוי הבא שמכסה אותו.',
          'אסימונים עם סמן המצב של המגדל הלבן מטופלים גם כמיקומים בעת מילוי, כמו בגרסה 1.',
          'אסימוני מיקום מוסתרים מועברים לשכבת GM. כאשר הקסם שלהם מתגלה הם חוזרים לשכבת האסימון עם שמם מוצג, והגילוי שלהם מוכרז.',
          'מתן שם למשושה נותן למשושה שם ללא אסימון. השם מוצג ל-GM כתווית בשכבת ה-GM ומוכרז כשהמשושה נחשף.',
          'הכרזה על תגליות קובעת אם כולם, רק ה-GM או אף אחד לא יראו את ההכרזה. פינג לתגליות גם מעביר את תצוגת השחקנים למיקום.',
        ],
      },
      settings: {
        heading: 'הגדרות',
        intro:
          'שנה הגדרות באמצעות !hexploration set (או כפתור ההגדרות). את שכבת המשושים, אסימונים חושפים ושפה אפשר להגדיר גם בדף ההגדרות של המוד.',
        colKey: 'מַפְתֵחַ',
        colName: 'סְבִיבָה',
        colDesc: 'תֵאוּר',
        perPage: '(ניתן להגדיר לכל עמוד.)',
      },
      jumpgate: {
        heading: 'Jumpgate ו-Legacy',
        points: [
          'Hexploration מזהה באיזה מנוע המשחק משתמש ומצייר את סוג הצורה המתאים. אפשר למלא צורות שצוירו בכל אחד משני העורכים.',
          'כששכבת המשושים מוגדרת לאוטומטי, משושים מצוירים בשכבת החזית, מעל האסימונים, כך ששחקנים לא יכולים לראות מה יש מתחת. אם שכבת החזית אינה זמינה, נעשה שימוש בשכבת האסימונים במקום זאת.',
          'Jumpgate מצייר משושים משוכללים מתמטית, שצורתם שונה מעט ממשושי Legacy. אם המשושים אינם מתיישרים עם הרשת של הדף, הצמד אסימון למרכז משושה, בחר אותו ולחץ על כיול. בחר שני אסימונים במשושים שכנים באותה שורה (Hex V) או עמודה (Hex H) כדי לתקן גם את גודל המשושה.',
          'כאשר עמוד או משחק מועתקים, המשושים שלו מקבלים מזהים חדשים. הפעל סריקה מחדש בדף כדי לאסוף אותם שוב, יחד עם תוויות השם ואסימוני המיקום שלהם.',
        ],
      },
      upgrading: {
        heading: 'משדרג מגרסה 1',
        points: [
          'גרסה 2 כבר לא צריכה PathMath, MatrixMath, Vector Math או HTML Builder. אתה יכול להסיר אותם אלא אם מוד אחר משתמש בהם.',
          'מפות hex קיימות, שמות, אסימוני מיקום והגדרות משודרגים אוטומטית בהתחלה הראשונה.',
          'הפקודות של גרסה 1, כולל המאקרו Hexploration_menu, עדיין עובדות.',
          'בגרסה 1 כל אסימון שייצג דמות יכול היה לחשוף משושים. הגדר את אסימונים חושפים לאסימוני דמויות כדי לשמור על התנהגות זו.',
        ],
        colV1: 'פקודה גרסה 1',
        colV2: 'פקודה גרסה 2',
      },
      troubleshooting: {
        heading: 'פתרון בעיות',
        points: [
          'שום דבר לא קורה כשאסימון זז: בדוק שהאסימון נמצא בשכבת האסימונים ותואם להגדרה אסימונים חושפים, ושבדף יש משושים (!hexploration status).',
          'המשושים מוסטים מהרשת: השתמש בכיול, ואז בדוק עם אסימון על כמה משושים ברחבי המפה.',
          'משושים הפסיקו להיחשף לאחר העתקת דף או משחק: הפעל סריקה מחדש בדף.',
          'מילוי אומר שלאזור אין מרכזי משושה: הצורה חייבת להכיל את המרכז של משושה אחת לפחות.',
          'לכל דבר אחר, בדוק את יומן מסוף ה-API וכלול את ההודעות שלו כאשר אתה מבקש עזרה.',
        ],
      },
      languages: {
        heading: 'שפות',
        body: 'בחר שפה עם !hexploration set language. שפות זמינות:',
        colLanguage: 'שָׂפָה',
        colNative: 'שם בשפת המקור',
        colCode: 'קוד',
      },
      credits: {
        heading: 'קרדיטים',
        original: 'מוד מקורי מאת',
        maintainer: 'גרסה 2 מתוחזקת על ידי',
        marketplace: 'חבילות האמנות של עדה ב-Roll20 Marketplace',
        support:
          'אם אתה מוצא באג או יש לך רעיון, פרסם בפורום Roll20 Mod או פתח בעיה ב-GitHub, וכלול הודעות כלשהן מיומן מסוף ה-API.',
      },
    },
  };

  const TRANSLATION$b = {
    titles: {
      ready: 'A Hexploration készen áll.',
      settings: 'Hexploration-beállítások',
      languages: 'Válasszon nyelvet',
      pageSettings: 'Oldalbeállítások: {page}',
      status: 'Hexploration-állapot: {page}',
      help: 'Hexploration parancsok',
      confirm: 'Kérjük, erősítse meg',
    },
    discovery: {
      title: 'Helyszín felfedezve',
    },
    menu: {
      draw: 'Rajzolás',
      reveal: 'Felfedés és elrejtés',
      locations: 'Helyszínek',
      tools: 'Eszközök',
      layerInUse: 'Az új hatszögek ide kerülnek: {layer}.',
      pageSettingsHelp:
        'Ezek a beállítások csak erre az oldalra vonatkoznak. A ★ jelű beállítások felülírják a globális beállításokat.',
    },
    buttons: {
      fill: 'Kitöltés',
      fillInverse: 'Inverz kitöltés',
      undo: 'Kitöltés visszavonása',
      reveal: 'Felfedés',
      conceal: 'Lefedés',
      explore: 'Felderítés',
      revealPage: 'Oldal felfedése',
      resetPage: 'Oldal visszaállítása',
      mark: 'Helyszín megjelölése',
      unmark: 'Jelölés törlése',
      name: 'Hatszög elnevezése',
      settings: 'Beállítások',
      pageSettings: 'Oldalbeállítások',
      status: 'Állapot',
      rescan: 'Újraszkennelés',
      calibrate: 'Kalibrálás',
      calibrateReset: 'Kalibrálás visszaállítása',
      help: 'Segítség',
      change: 'Módosítás',
      menu: 'Menü',
      clearOverrides: 'Felülbírálások törlése',
      confirmReset: 'Igen, minden hatszög eltávolítása',
    },
    prompts: {
      name: 'Helynév (a törléshez hagyja üresen)',
    },
    values: {
      on: 'Be',
      off: 'Ki',
      none: 'Nincs',
      hexLayer: {
        auto: 'Automatikus (előtér, ha elérhető)',
        foreground: 'előtérréteg',
        objects: 'tokenréteg',
      },
      revealBy: {
        players: 'Játékos tokenek',
        characters: 'Karakter tokenek',
        all: 'Minden token',
      },
      revealMode: {
        clear: 'Eltávolítás',
        glimpse: 'Bepillantás',
      },
      announce: {
        all: 'Mindenki',
        gm: 'Csak a GM',
        off: 'Ki',
      },
      orientation: {
        vertical: 'Hex (V)',
        horizontal: 'Hex (H)',
      },
      fillKind: {
        fill: 'Kitöltés',
        fillInverse: 'Inverz kitöltés',
        conceal: 'Lefedés',
      },
    },
    settings: {
      language: {
        label: 'Nyelv',
        desc: 'A menük, üzenetek és tájékoztatók nyelve.',
      },
      hexLayer: {
        label: 'Hatszögek rétege',
        desc: 'Hová kerülnek az új hatszögek. Az Automatikus az előtérréteggel próbálkozik (a tokenek fölött), és ha a játék ezt nem támogatja, a tokenréteget használja.',
      },
      fillColor: {
        label: 'Kitöltés színe',
        desc: 'Új hatszögek színe. Használja az rgba()-t az átlátszó hexákhoz, például rgba(0,0,0,0,8).',
      },
      strokeColor: {
        label: 'Szegély színe',
        desc: 'Az új hatszögek körvonalának színe.',
      },
      labelColor: {
        label: 'Címke színe',
        desc: 'A csak GM-nek szánt névcímkék színe a megnevezett hexákon.',
      },
      glimpseColor: {
        label: 'Bepillantás színe',
        desc: 'Az a szín, amelyre a hatszögek bepillantáskor váltanak (Bepillantás felfedési mód). Használjon átlátszó rgba() színt.',
      },
      strokeWidth: {
        label: 'Szegély szélessége',
        desc: 'Az új hatszögek körvonalának szélessége pixelben (0-tól 20-ig).',
      },
      maxDistance: {
        label: 'Hatszögek felfedési távolsága',
        desc: 'A hatszögek kitöltésekor kerül tárolásra rajtuk, ezért a kitöltés előtt állítsa be: a későbbi módosítás nem hat a térképen már meglévő hatszögekre. Egy tokennek ennyi hatszögön belül kell lennie ahhoz, hogy felfedje őket, bármilyen messzire lát is; 0 esetén csak akkor fedődnek fel, ha belépnek beléjük. Hegyekhez vagy erdőkhöz használja. Hagyja üresen, ha nem kíván korlátozást.',
      },
      revealDistance: {
        label: 'Látótávolság',
        desc: 'Hány hexa jelenik meg egy mozgó token körül (0-tól 20-ig). A 0 csak azokat a hatszögeket mutatja, amelyeken a token áthalad.',
      },
      lineOfSight: {
        label: 'Látóvonal',
        desc: 'Ha be van kapcsolva, a fedve maradó hatszögek, például a Hatszögek felfedési távolsága beállítással kitöltött hegyek, eltakarják a mögöttük lévő hatszögeket. Csak akkor számít, ha a Látótávolság legalább 2.',
      },
      revealPath: {
        label: 'Felfedés az útvonal mentén',
        desc: 'Ha be van kapcsolva, minden hexa, amelyen a token áthalad a húzás közben (beleértve az útpontokat is), megjelenik, nem csak az, ahol megáll.',
      },
      revealBy: {
        label: 'Felfedő tokenek',
        desc: 'A tokenrétegen lévő jelzők hatszögeket mutatnak: a játékos által irányított jelzőket, bármely karaktert vagy minden jelzőt.',
      },
      revealMode: {
        label: 'Felfedési mód',
        desc: 'Az Eltávolítás mód eltávolítja a látótávolságon belüli hatszögeket. A Bepillantás mód ehelyett átlátszóvá teszi őket; akkor tűnnek el, amikor egy token belép beléjük.',
      },
      announce: {
        label: 'Felfedezések bejelentése',
        desc: 'Ki látja a csevegőüzenetet, ha egy megnevezett helyet felfedeznek.',
      },
      pingDiscoveries: {
        label: 'Felfedezések pingelése',
        desc: 'Ha be van kapcsolva, a játékosok egy megnevezett helyre pingelődnek, amikor felfedezik.',
      },
      hideCoveredTokens: {
        label: 'Lefedett tokenek elrejtése',
        desc: 'A Roll20 neveket, sávokat és aurákat rajzol a hatszögek fölé. Ha be van kapcsolva, a fedett hatszög alatti jelzőknek a játékosok által látható nevük, a sávok és az aurák ki vannak kapcsolva, majd újra bekapcsolnak, amikor feltárják őket.',
      },
    },
    status: {
      engine: 'Játékmotor',
      grid: 'Rács',
      layer: 'Hatszögek rétege',
      hexes: 'Hatszögek',
      named: 'Elnevezett hatszögek',
      icons: 'Helyszíntokenek',
      glimpsed: 'Bepillantott hatszögek',
      pending: 'Kitöltésre váró helyszínek',
      calibrated: 'Kalibrálva',
      overrides: 'Oldalszintű felülbírálások',
      undo: 'Visszavonható',
    },
    messages: {
      filled:
        'Kitöltés kész. Rajzolt hatszögek: {created}. Átformálva: {restyled}. Elrejtett helyek: {icons}.',
      revealed: 'Felfedezett hatszögek: {count}.',
      revealedPage: 'Az oldalon minden hex látható ({count}).',
      confirmReset:
        'Eltávolít minden hexát innen: „{page}” ({count})? A helyjelzők visszatérnek a token rétegbe. A visszavonás ezt nem tudja visszafordítani.',
      resetPage: 'Az oldalról eltávolított hatszögek: {count}.',
      undone:
        'Az utolsó kitöltés visszavonva. Eltávolított hatszögek: {removed}. Újraformázott hatszögek visszaállítva: {restored}.',
      named: '"{name}" nevű hatszögek: {count}.',
      unnamed: 'Törölt nevek: {count}.',
      marked:
        'Meglévő hexákban rejtett helyek: {attached}. Várakozás a következő kitöltésre, amely lefedi őket: {pending}.',
      unmarked: 'Tokenek, amelyek már nem helyek: {count}.',
      settingChanged: '{setting} értéke {value}.',
      rescanned:
        'Az újraszkennelés befejeződött. Tartva: {kept}. Elfogadva: {adopted}. Újra benyújtva: {moved}. Hiányzó és elfelejtett: {dropped}. Újra összekapcsolt címkék: {labels}. A helytokenek újra összekapcsolva: {icons}.',
      calibrated:
        'Rács kalibrálva (oszloplépés {colStep}px, sorlépés {rowStep}px). Újraellenőrzés: megtartva {kept}, újra benyújtva {moved}, átvéve {adopted}.',
      calibrationReset:
        'A kalibráció eltávolítva. Újraellenőrzés: megtartva {kept}, újra benyújtva {moved}, átvett {adopted}.',
      journalRebuilt: 'A "{help}" és a "{deck}" szórólapok újjáépítésre kerültek.',
      migrated:
        'Az Ön Hexploration 1.x hatszögtérképei frissültek. Ha ezt a játékot egy Legacy játékból másolták, futtassa az Újraszkennelést minden hatszögtérkép-oldalon.',
      pruned:
        'Mentett hatszögek, amelyek már nem léteznek, és törlődtek a nyilvántartásból: {dropped}. Ha ezt a játékot vagy oldalt másolták, futtassa az Újraszkennelést az oldalon, hogy újra felvegye a hatszögeit.',
      readyHint:
        'A menühöz írja be a !hexploration parancsot, vagy nyissa meg a "Hexploration - Command Deck" tájékoztatót.',
    },
    warnings: {
      foregroundUnavailable:
        'Ez a játék nem támogatja az előtér rétegre való rajzolást, ezért hatszögletűek rajzoltak a token rétegre.',
      someFailed: 'Nem rajzolható hatszögek: {count}. A részletekért tekintse meg az API-konzolt.',
    },
    errors: {
      noPage: 'Nem található az oldal, amelyen dolgozni kellene.',
      notHex: 'Ez az oldal nem használ hatszögletű rácsot.',
      noPolygons: 'Válasszon ki egy vagy több rajzolt alakzatot a kitöltéshez.',
      emptyArea: 'A kijelölt terület egyetlen hatszögközéppontot sem tartalmaz.',
      tooMany: 'Ez túl sok hexát hozna létre egyszerre ({count}).',
      nothingToConceal: 'Válassza ki a rajzolt alakzatokat vagy jelzőket az elrejteni.',
      nothingToReveal:
        'Válassza ki a hatszögleteket, a rajzolt alakzatokat vagy a tokeneket a felfedéshez.',
      noTokens: 'Először válasszon ki egy vagy több tokent.',
      noHexes: 'Először válasszon ki egy vagy több hexát (vagy hatszögletű tokent).',
      nothingToUndo: 'Nincs visszavonható kitöltés.',
      unknownCommand: 'Ismeretlen parancs: {command}',
      unknownSetting: 'Ismeretlen beállítás: {key}',
      unknownPageSetting: 'Oldalanként beállítható beállítások: {keys}',
      invalidValue: 'A „{value}” nem érvényes érték a {key} számára.',
      calibrateNeedsTokens: 'Válasszon ki egy vagy két hatszögletű középpontra pattintott tokent.',
      calibrateFailed: 'Ezeket a tokeneket nem lehet kalibrálni.',
      unexpected: 'Hiba történt: {message}',
    },
    hints: {
      noPage: 'Nyissa meg azt az oldalt, amelyen dolgozni szeretne, vagy válasszon rajta valamit.',
      notHex: 'Állítsa az oldalrácsot Hex (V) vagy Hex (H) értékre az Oldalbeállításokban.',
      noPolygons:
        'Rajzoljon sokszöget, téglalapot, ellipszist vagy szabadkézi alakzatot a terület köré, jelölje ki, majd próbálkozzon újra.',
      emptyArea: 'Rajzoljon nagyobb alakzatot, vagy ellenőrizze az oldalrács beállításait.',
      tooMany: 'Töltsön ki egy kisebb területet, vagy ossza fel több formára.',
      noHexes:
        'A hatszögek az előtérben vagy a token rétegben vannak; váltson át arra a rétegre a kijelölésükhöz.',
      unknownCommand: 'Írja be a !hexploration help parancsot a parancsok listázásához.',
      unknownSetting: 'Minden beállítás megtekintéséhez írja be a !hexploration set parancsot.',
      calibrateNeedsTokens:
        'Illesszen egy tokent egy hatszög közepére, és jelölje ki. Válasszon ki egy második tokent, amely egy szomszédos hatszögre van illesztve ugyanabban a sorban (Hex V) vagy oszlopban (Hex H), hogy a hatszög méretét is javítsa.',
      calibrateFailed:
        'A két tokennek ugyanabban a sorban (Hex V) vagy ugyanabban az oszlopban (Hex H) kell lennie, egymástól legalább egy hatszögnyire.',
      unexpected: 'A részletek az API-konzol naplójában találhatók.',
    },
    help: {
      menu: 'Mutasd a menüt.',
      fill: 'A kiválasztott rajzolt alakzatokat hatszögletekkel fedjük le.',
      fillInverse: 'Fedje le az egész oldalt, kivéve a kiválasztott formák belsejét.',
      undo: 'Vonja vissza az utolsó kitöltést, inverz kitöltést vagy elrejtést, és állítsa vissza a használt alakzatokat.',
      reveal:
        'Jelenítse meg a kiválasztott hatszögeket, valamint a kiválasztott alakzatok és tokenek alatti hatszögeket.',
      revealPage: 'Felfed minden hexát az oldalon bejelentések nélkül.',
      conceal:
        'A kiválasztott alakzatok és tokenek alatti területet ismét takarja be hatszögletekkel.',
      explore: 'Felfedés a kijelölt tokenek körül, mintha éppen oda mozogtak volna.',
      resetPage: 'Távolítson el minden hatszögletet az oldalon (először rákérdez).',
      name: 'Nevezze el a kiválasztott hexákat, vagy a kiválasztott tokenek alatti hexákat. Hagyja üresen a nevet a törléshez.',
      mark: 'A kiválasztott tokeneket rejtett helyekké alakíthatja.',
      unmark: 'Állítsa le, hogy a kiválasztott tokenek rejtett helyek legyenek.',
      set: 'Módosítson egy beállítást, vagy jelenítse meg az összes beállítást.',
      pageSet: 'Felfedezési beállítás felülírása csak az aktuális oldalon.',
      pageClear: 'Távolítsa el az aktuális oldal felülírásait.',
      rescan: 'Építse újra az oldal hatszöglistáját, például egy oldal vagy játék másolása után.',
      calibrate:
        'Sorolja fel a hatszögletű rácsot egy vagy két kiválasztott tokennel, amelyeket hatszögletű középpontokra pattint.',
      calibrateReset: 'Távolítsa el az aktuális oldal kalibrálását.',
      status: 'Mutassa meg, mit tud a Hexploration az aktuális oldalról.',
      journal: 'Építse újra a Segítség és a Command Deck tájékoztatót.',
      help: 'Mutasd ezt a listát.',
      handout: 'A teljes utasítás a „{name}” tájékoztatóban található.',
    },
    deck: {
      drawDesc:
        'Rajzoljon alakzatokat egy terület köré, jelölje ki őket, majd töltse ki. A visszavonás megfordítja az utolsó kitöltést.',
      revealDesc:
        'Jelöljön ki hatszögeket, alakzatokat vagy tokeneket a felfedésükhöz vagy újbóli lefedésükhöz. A Felderítés úgy fed fel a kijelölt tokenek körül, mintha odamozogtak volna.',
      locationsDesc:
        'Jelölje ki a tokeneket, hogy elrejtse őket hexák alatti helyként. Válasszon hexákat vagy tokeneket a hexa elnevezéséhez.',
      toolsDesc:
        'Beállítások, oldalfelülírások, állapot, a másolt oldalak újraolvasása és a rács kalibrálása.',
      footer: 'A teljes útmutatásért lásd a „{help}” tájékoztatót.',
    },
    handout: {
      versionLabel: 'Változat',
      subtitle: 'Hex-by-hex felfedezés a Roll20 számára',
      footer: 'Használja a „{deck}” tájékoztatót az egykattintásos vezérlőkhöz.',
      overview: {
        heading: 'Áttekintés',
        body: 'A Hexploration átlátszatlan hatszögekkel fedi le a hatszögtérképet. Ahogy a csapat halad, a hatszögek, amelyeken áthalad (és ha szeretné, a körülöttük lévők is), eltűnnek, így a térkép hatszögről hatszögre tárul fel. A hatszögek alá rejtett helyszínek helyezhetők el, ezeket megtalálásukkor a rendszer bejelenti. Jumpgate és Legacy játékokban is működik, bármekkora Hex (V) és Hex (H) rácson.',
        demo: 'Nézzen meg egy rövid bemutatót (az 1-es verziótól)',
      },
      quickStart: {
        heading: 'Gyors kezdés',
        steps: [
          'Nyisson meg egy oldalt, amelynek rácsának beállítása Hex (V) vagy Hex (H).',
          'Rajzoljon egy vagy több alakzatot (sokszög, téglalap, ellipszis vagy szabadkézi) az elrejteni kívánt terület köré.',
          'Jelölje ki az alakzatokat, és kattintson a Command Deck Kitöltés gombjára (vagy írja be: !hexploration fill). Az alakzatok helyére hatszögek kerülnek.',
          'Nem kötelező: a kitöltés előtt jelölje ki a fontos helyek tokenjeit, és kattintson a Helyszín megjelölése gombra. Ezek a hatszögek alá rejtőznek, és felfedezésükkor a rendszer bejelenti őket.',
          'Mozgass egy játékos tokent. Minden hatszög, amelyen áthalad, és a látótávolságon belüli hatszögek feltárulnak.',
        ],
      },
      commands: {
        heading: 'Parancsok',
        intro:
          'Csak a GM-ek használhatják ezeket a parancsokat. A legtöbb a kiválasztott objektumokra hat; a többi az éppen megtekintett oldalon működik.',
        colCommand: 'Parancs',
        colDesc: 'Mit csinál',
      },
      revealing: {
        heading: 'Hogyan működik a feltárás',
        points: [
          'Csak a tokenrétegen lévő tokenek fednek fel hatszögeket. Hogy mely tokenek számítanak, azt a Felfedő tokenek beállítás határozza meg: alapértelmezés szerint a játékosok tokenjei, így a GM a térkép felfedése nélkül mozgathatja a szörnyeket.',
          'Egy token felfed minden hatszöget, amelyet lefed (a nagy tokenek többet is), és ha a Felfedés az útvonal mentén be van kapcsolva, minden hatszöget azon az útvonalon is, amelyen végighúzták, az útpontokat is beleértve.',
          'A Látótávolság az egyes ilyen hatszögek körüli hatszögeket fedi fel, a legközelebbiekkel kezdve. Ha a Látóvonal be van kapcsolva, egy hatszög nem fedődik fel, amíg közte és a token között lefedett hatszög van. A közelebbi hatszögek általában előbb fedődnek fel, így nyílt terepen a Látóvonal semmin sem változtat: csak akkor számít, ha a Látótávolság legalább 2, és vannak fedve maradó hatszögek, például a Hatszögek felfedési távolsága beállítással kitöltött terep.',
          'A Hatszögek felfedési távolsága minden hatszögön a kitöltésekor kerül tárolásra, ezért a kitöltés előtt állítsa be; a későbbi módosítás nem hat a térképen már meglévő hatszögekre. Egy tokennek ennyi hatszögön belül kell lennie ahhoz, hogy felfedje őket, bármilyen messzire lát is, 0 esetén pedig csak akkor fedődnek fel, ha belépnek beléjük. Hegyvonulathoz: állítsa a Hatszögek felfedési távolsága értékét 0-ra, töltse ki a hegyeket, állítsa vissza üresre (korlátozás nélkül), majd töltse ki a mögöttük lévő vidéket. Ha a Látótávolság 3 és a Látóvonal be van kapcsolva, a csapat látja a körülötte lévő nyílt terepet, de a hegyeket és azt, ami mögöttük van, nem. Minden hegyi hatszög akkor fedődik fel, amikor egy token belép bele.',
          'Bepillantás módban a látótávolságon belüli hatszögek eltűnés helyett átlátszóvá válnak, és eltávolításra kerülnek, amikor egy token belép beléjük. A Bepillantás módban látott hatszögek a Látóvonal szempontjából nem számítanak takarásnak.',
          'A Roll20 a tokenek nevét, sávjait és auráit a hatszögek fölé rajzolja. Ha a Lefedett tokenek elrejtése be van kapcsolva, a lefedett hatszög alatti token játékosok által látható neve, sávjai és aurái kikapcsolnak, amíg fel nem fedik, így a rejtett szörnyek nem árulják el magukat. Ha ezek közül bármelyiket bekapcsolja, amíg a token le van fedve, rejtve marad, és a token felfedésekor kapcsol be.',
          'Az API nem jelzi a más modok által végrehajtott mozgásokat. A TokenMod mozgásait a rendszer automatikusan észleli; más modok esetén jelölje ki a tokeneket, és kattintson a Felderítés gombra, vagy hívja meg a Hexploration.revealAround(token) függvényt a saját modjából.',
        ],
      },
      locations: {
        heading: 'Hexák és helyek neve',
        points: [
          'A Helyszín megjelölése a kijelölt tokeneket rejtett helyszínekké alakítja. A már hatszög alatt lévő token azonnal elrejtődik; különben a következő kitöltés rejti el, amely lefedi.',
          'A fehér torony állapotjelzővel ellátott tokeneket a rendszer az 1-es verzióhoz hasonlóan helyként kezeli kitöltésekor.',
          'A rejtett helyjelzők a GM rétegre kerülnek. Amikor a hatszögük kiderül, a nevükkel együtt visszatérnek a token réteghez, és a felfedezésüket bejelentik.',
          'A Hatszög elnevezése token nélkül ad nevet egy hatszögnek. A nevet a GM címkeként látja a GM-rétegen, és a rendszer bejelenti, amikor a hatszög felfedődik.',
          'A Felfedezések bejelentése határozza meg, hogy mindenki, csak a GM vagy senki sem látja a bejelentést. A Felfedezések pingelése a játékosok nézetét is a helyszínre mozgatja.',
        ],
      },
      settings: {
        heading: 'Beállítások elemre',
        intro:
          'A beállításokat a !hexploration set paranccsal (vagy a Beállítások gombbal) módosíthatja. A Hatszögek rétege, a Felfedő tokenek és a Nyelv a Mod beállítási oldalán is megadható.',
        colKey: 'Kulcsfontosságú',
        colName: 'Beállítás',
        colDesc: 'Leírás',
        perPage: '(Oldalonként beállítható.)',
      },
      jumpgate: {
        heading: 'Jumpgate és Legacy',
        points: [
          'A Hexploration kidolgozza, hogy a játék melyik motort használja, és megrajzolja a megfelelő formát. Bármelyik szerkesztőben rajzolt alakzatok kitölthetők.',
          'Ha a Hatszögek rétege Automatikus értékre van állítva, a hatszögek az előtérrétegre, a tokenek fölé kerülnek, így a játékosok nem látják, mi van alattuk. Ha az előtérréteg nem érhető el, a rendszer helyette a tokenréteget használja.',
          'A Jumpgate matematikailag szabályos hatszögeket rajzol, amelyek alakja kissé eltér a Legacy hatszögekétől. Ha a hatszögek nem illeszkednek az oldal rácsához, illesszen egy tokent egy hatszög középpontjára, jelölje ki, majd kattintson a Kalibrálás gombra. A hatszögméret javításához jelöljön ki két tokent ugyanazon sor (Hex V) vagy oszlop (Hex H) szomszédos hatszögeiben.',
          'Amikor egy oldalt vagy játékot másolnak, a hatszögei új azonosítókat kapnak. Futtassa az Újraszkennelést az oldalon, hogy újra felvegye őket a névcímkéikkel és helyszíntokenjeikkel együtt.',
        ],
      },
      upgrading: {
        heading: 'Frissítés az 1-es verzióról',
        points: [
          'A 2-es verziónak már nincs szüksége PathMath-ra, MatrixMath-ra, Vector Math-ra vagy HTML-készítőre. Eltávolíthatja őket, hacsak egy másik mod nem használja őket.',
          'A meglévő hexa térképek, nevek, helyjelzők és beállítások automatikusan frissülnek az első indításkor.',
          'Az 1-es verzió parancsai, beleértve a Hexploration_menu makrót is, továbbra is működnek.',
          'Az 1-es verzióban bármely karaktert ábrázoló token felfedhetett hatszögeket. Ennek megtartásához állítsa a Felfedő tokenek beállítást Karakter tokenek értékre.',
        ],
        colV1: '1-es verzió parancs',
        colV2: '2-es verzió parancs',
      },
      troubleshooting: {
        heading: 'Hibaelhárítás',
        points: [
          'Semmi sem történik, amikor egy token mozog: ellenőrizze, hogy a token a tokenrétegen van-e, megfelel-e a Felfedő tokenek beállításnak, és vannak-e hatszögek az oldalon (!hexploration status).',
          'A hatszögek el vannak tolva a rácstól: használja a Kalibrálást, majd ellenőrizze a token segítségével néhány hatszöget a térképen.',
          'Egy oldal vagy játék másolása után a hatszögek nem fedődnek fel: futtassa az Újraszkennelést az oldalon.',
          'Kitöltés szerint a területnek nincs hatszög középpontja: az alakzatnak tartalmaznia kell legalább egy hatszög középpontját.',
          'Ha bármi mást szeretne, ellenőrizze az API-konzol naplóját, és adja meg az üzeneteit, amikor segítséget kér.',
        ],
      },
      languages: {
        heading: 'Nyelvek',
        body: 'Nyelvet a !hexploration set language paranccsal választhat. Elérhető nyelvek:',
        colLanguage: 'Nyelv',
        colNative: 'Saját név',
        colCode: 'Kód',
      },
      credits: {
        heading: 'Kredit',
        original: 'Az eredeti mod szerzője',
        maintainer: 'A 2-es verziót karbantartja',
        marketplace: 'Ada művészeti csomagjai a Roll20 Marketplace-en',
        support:
          'Ha hibát talál, vagy ötlete van, tegye közzé a Roll20 Mod fórumban, vagy nyissa meg a problémát a GitHubon, és adja meg az API-konzol naplójából származó üzeneteket.',
      },
    },
  };

  const TRANSLATION$a = {
    titles: {
      ready: 'Hexploration è pronto.',
      settings: 'Impostazioni di Hexploration',
      languages: 'Scegli una lingua',
      pageSettings: 'Impostazioni pagina: {page}',
      status: 'Stato di Hexploration: {page}',
      help: 'Comandi di Hexploration',
      confirm: 'Conferma',
    },
    discovery: {
      title: 'Posizione scoperta',
    },
    menu: {
      draw: 'Disegna',
      reveal: 'Rivela e nascondi',
      locations: 'Posizioni',
      tools: 'Strumenti',
      layerInUse: 'I nuovi esagoni vengono disegnati sul {layer}.',
      pageSettingsHelp:
        'Queste impostazioni si applicano solo a questa pagina. Le impostazioni contrassegnate con ★ sovrascrivono le impostazioni globali.',
    },
    buttons: {
      fill: 'Riempi',
      fillInverse: 'Riempimento inverso',
      undo: 'Annulla riempimento',
      reveal: 'Rivela',
      conceal: 'Nascondi',
      explore: 'Esplora',
      revealPage: 'Rivela pagina',
      resetPage: 'Reimposta pagina',
      mark: 'Segna posizione',
      unmark: 'Rimuovi segno',
      name: 'Nomina esagono',
      settings: 'Impostazioni',
      pageSettings: 'Impostazioni pagina',
      status: 'Stato',
      rescan: 'Nuova scansione',
      calibrate: 'Calibra',
      calibrateReset: 'Ripristina calibrazione',
      help: 'Aiuto',
      change: 'Modifica',
      menu: 'Menu',
      clearOverrides: 'Cancella sostituzioni',
      confirmReset: 'Sì, rimuovi tutti gli esagoni',
    },
    prompts: {
      name: 'Nome della posizione (lascia vuoto per cancellare)',
    },
    values: {
      on: 'Attivo',
      off: 'Disattivo',
      none: 'Nessuno',
      hexLayer: {
        auto: 'Automatico (in primo piano se disponibile)',
        foreground: 'livello in primo piano',
        objects: 'livello dei segnalini',
      },
      revealBy: {
        players: 'Segnalini dei giocatori',
        characters: 'Segnalini dei personaggi',
        all: 'Tutti i segnalini',
      },
      revealMode: {
        clear: 'Elimina',
        glimpse: 'Intravedi',
      },
      announce: {
        all: 'Tutti',
        gm: 'Solo il GM',
        off: 'Disattivo',
      },
      orientation: {
        vertical: 'Hex (V)',
        horizontal: 'Hex (H)',
      },
      fillKind: {
        fill: 'Riempi',
        fillInverse: 'Riempimento inverso',
        conceal: 'Nascondi',
      },
    },
    settings: {
      language: {
        label: 'Lingua',
        desc: 'Lingua per menu, messaggi e dispense.',
      },
      hexLayer: {
        label: 'Livello degli esagoni',
        desc: 'Dove vengono disegnati i nuovi esagoni. Automatico prova il livello in primo piano (sopra i segnalini) e ripiega sul livello dei segnalini se il gioco non lo supporta.',
      },
      fillColor: {
        label: 'Colore riempimento',
        desc: 'Colore dei nuovi esagoni. Usa rgba() per esagoni trasparenti, ad esempio rgba(0,0,0,0.8).',
      },
      strokeColor: {
        label: 'Colore del bordo',
        desc: 'Colore del contorno dei nuovi esagoni.',
      },
      labelColor: {
        label: "Colore dell'etichetta",
        desc: 'Colore delle etichette con i nomi riservati ai GM sugli esagoni con nome.',
      },
      glimpseColor: {
        label: 'Colore degli esagoni intravisti',
        desc: 'Colore che assumono gli esagoni intravisti (modalità di rivelazione Intravedi). Usa un colore rgba() trasparente.',
      },
      strokeWidth: {
        label: 'Larghezza del bordo',
        desc: 'Larghezza del contorno dei nuovi esagoni, in pixel (da 0 a 20).',
      },
      maxDistance: {
        label: 'Distanza di rivelazione degli esagoni',
        desc: 'Memorizzata sugli esagoni quando vengono riempiti, quindi impostala prima di riempire: modificarla in seguito non influisce sugli esagoni già presenti sulla mappa. Un segnalino deve trovarsi entro questo numero di esagoni per rivelarli, per quanto lontano possa vedere; con 0 vengono rivelati solo entrandoci. Usala per montagne o foreste. Lascia vuoto per nessun limite.',
      },
      revealDistance: {
        label: 'Distanza di vista',
        desc: 'Quanti esagoni vengono rivelati attorno a un segnalino in movimento (da 0 a 20). 0 rivela solo gli esagoni attraversati dal segnalino.',
      },
      lineOfSight: {
        label: 'Linea di vista',
        desc: 'Quando è attivo, gli esagoni che restano coperti, come le montagne riempite con una Distanza di rivelazione degli esagoni, nascondono gli esagoni dietro di essi. Fa differenza solo con una Distanza di vista di 2 o più.',
      },
      revealPath: {
        label: 'Rivela lungo il percorso',
        desc: 'Quando è attivo, viene rivelato ogni esagono attraversato da un token mentre viene trascinato (inclusi i punti di passaggio), non solo dove si ferma.',
      },
      revealBy: {
        label: 'Segnalini che rivelano',
        desc: 'Quali gettoni sul livello dei gettoni rivelano esagoni: gettoni controllati da un giocatore, gettoni che rappresentano qualsiasi personaggio o ogni gettone.',
      },
      revealMode: {
        label: 'Modalità di rivelazione',
        desc: 'Elimina rimuove gli esagoni in vista. Intravedi invece li rende trasparenti; vengono rimossi quando un segnalino vi entra.',
      },
      announce: {
        label: 'Annuncia le scoperte',
        desc: 'Chi vede il messaggio di chat quando viene scoperta una posizione denominata.',
      },
      pingDiscoveries: {
        label: 'Ping sulle scoperte',
        desc: 'Quando è attivo, i giocatori vengono collegati a una posizione denominata quando viene scoperta.',
      },
      hideCoveredTokens: {
        label: 'Nascondi i segnalini coperti',
        desc: 'Roll20 disegna nomi, barre e aure sopra gli esagoni. Quando sono attivi, i gettoni sotto un esagono coperto hanno il nome, le barre e le aure visibili al giocatore disattivati ​​e riattivati ​​quando vengono scoperti.',
      },
    },
    status: {
      engine: 'Motore di gioco',
      grid: 'Griglia',
      layer: 'Livello degli esagoni',
      hexes: 'Esagoni',
      named: 'Esagoni con nome',
      icons: 'Segnalini di posizione',
      glimpsed: 'Esagoni intravisti',
      pending: 'Posizioni in attesa di riempimento',
      calibrated: 'Calibrato',
      overrides: 'Sostituzioni di pagina',
      undo: 'Annullamento disponibile',
    },
    messages: {
      filled:
        'Riempimento completato. Esagoni tracciati: {created}. Restyling: {restyled}. Posizioni nascoste: {icons}.',
      revealed: 'Esagoni rivelati: {count}.',
      revealedPage: 'Tutti gli esagoni della pagina sono stati rivelati ({count}).',
      confirmReset:
        'Rimuovere ogni esagono da "{page}" ({count})? I token di posizione ritornano al livello dei token. L\'annullamento non può annullare questa operazione.',
      resetPage: 'Esagoni rimossi dalla pagina: {count}.',
      undone:
        'Ultimo riempimento annullato. Esagoni rimossi: {removed}. Esagoni rinnovati ripristinati: {restored}.',
      named: 'Esagoni denominati "{name}": {count}.',
      unnamed: 'Nomi cancellati: {count}.',
      marked:
        'Posizioni nascoste negli esagoni esistenti: {attached}. In attesa del prossimo riempimento che li ricopra: {pending}.',
      unmarked: 'Token che non rappresentano più posizioni: {count}.',
      settingChanged: '{setting} impostato su {value}.',
      rescanned:
        'Nuova scansione completata. Conservato: {kept}. Adottato: {adopted}. Archiviato nuovamente: {moved}. Mancante e dimenticato: {dropped}. Etichette ricollegate: {labels}. Token di posizione ricollegati: {icons}.',
      calibrated:
        'Griglia calibrata (passo colonna {colStep}px, passo riga {rowStep}px). Nuova scansione: mantenuto {kept}, archiviato nuovamente {moved}, adottato {adopted}.',
      calibrationReset:
        'Calibrazione rimossa. Nuova scansione: mantenuto {kept}, archiviato nuovamente {moved}, adottato {adopted}.',
      journalRebuilt: 'Le dispense "{help}" e "{deck}" sono state ricostruite.',
      migrated:
        'Le tue mappe a esagoni di Hexploration 1.x sono state aggiornate. Se questo gioco è stato copiato da un gioco Legacy, esegui Nuova scansione su ogni pagina con una mappa a esagoni.',
      pruned:
        'Esagoni salvati che non esistono più e sono stati dimenticati: {dropped}. Se questo gioco o questa pagina sono stati copiati, esegui Nuova scansione sulla pagina per riprenderne gli esagoni.',
      readyHint:
        'Digita !hexploration per il menu, oppure apri la dispensa "Hexploration - Command Deck".',
    },
    warnings: {
      foregroundUnavailable:
        'Questo gioco non supporta il disegno sul livello in primo piano, quindi gli esagoni sono stati disegnati sul livello dei token.',
      someFailed:
        'Esagoni che non è stato possibile disegnare: {count}. Controlla la console API per i dettagli.',
    },
    errors: {
      noPage: 'Impossibile trovare la pagina su cui lavorare.',
      notHex: 'Questa pagina non usa una griglia esagonale.',
      noPolygons: 'Seleziona una o più forme disegnate da riempire.',
      emptyArea: "L'area selezionata non contiene alcun centro di esagono.",
      tooMany: 'Ciò creerebbe troppi esagoni in una volta sola ({count}).',
      nothingToConceal: 'Seleziona forme disegnate o gettoni da nascondere.',
      nothingToReveal: 'Seleziona esagoni, forme disegnate o gettoni da rivelare.',
      noTokens: 'Seleziona prima uno o più token.',
      noHexes: 'Seleziona prima uno o più esagoni (o gettoni che si trovano sugli esagoni).',
      nothingToUndo: "Non c'è nessun riempimento da annullare.",
      unknownCommand: 'Comando sconosciuto: {command}',
      unknownSetting: 'Impostazione sconosciuta: {key}',
      unknownPageSetting: 'Impostazioni che possono essere impostate per pagina: {keys}',
      invalidValue: '"{value}" non è un valore valido per {key}.',
      calibrateNeedsTokens: 'Seleziona uno o due token agganciati ai centri esagonali.',
      calibrateFailed: 'Questi token non possono essere utilizzati per calibrare.',
      unexpected: 'Qualcosa è andato storto: {message}',
    },
    hints: {
      noPage: 'Apri la pagina su cui vuoi lavorare o seleziona qualcosa al suo interno.',
      notHex: 'Imposta la griglia della pagina su Hex (V) o Hex (H) nelle Impostazioni pagina.',
      noPolygons:
        "Disegna un poligono, un rettangolo, un'ellisse o una forma a mano libera attorno all'area, selezionala e riprova.",
      emptyArea:
        'Disegna una forma più grande o controlla le impostazioni della griglia della pagina.',
      tooMany: "Riempi un'area più piccola o dividi l'area in più forme.",
      noHexes:
        'Gli esagoni si trovano in primo piano o sul livello token; passare a quel livello per selezionarli.',
      unknownCommand: 'Digita !hexploration help per elencare i comandi.',
      unknownSetting: 'Digita !hexploration set per vedere tutte le impostazioni.',
      calibrateNeedsTokens:
        'Aggancia un segnalino al centro di un esagono e selezionalo. Seleziona un secondo segnalino agganciato a un esagono adiacente nella stessa riga (Hex V) o colonna (Hex H) per correggere anche la dimensione degli esagoni.',
      calibrateFailed:
        'Due gettoni devono trovarsi nella stessa riga (Hex V) o nella stessa colonna (Hex H), ad almeno un esagono di distanza.',
      unexpected: 'I dettagli si trovano nel registro della console API.',
    },
    help: {
      menu: 'Mostra il menù.',
      fill: 'Copri le forme disegnate selezionate con esagoni.',
      fillInverse: "Copri l'intera pagina tranne l'interno delle forme selezionate.",
      undo: "Annulla l'ultimo riempimento, inverti il ​​riempimento o nascondi e ripristina le forme utilizzate.",
      reveal:
        'Rivela gli esagoni selezionati e gli esagoni sotto le forme e i gettoni selezionati.',
      revealPage: 'Rivela ogni esagono sulla pagina senza annunci.',
      conceal: "Copri nuovamente l'area sotto le forme e i gettoni selezionati con esagoni.",
      explore: 'Rivela i gettoni selezionati come se si fossero appena spostati lì.',
      resetPage: 'Rimuovi ogni esagono dalla pagina (chiede prima).',
      name: 'Assegna un nome agli esagoni selezionati o agli esagoni sotto i gettoni selezionati. Lascia il nome vuoto per cancellarlo.',
      mark: 'Trasforma i gettoni selezionati in luoghi nascosti.',
      unmark: 'Impedisci che i token selezionati siano posizioni nascoste.',
      set: "Modifica un'impostazione o mostra tutte le impostazioni.",
      pageSet: "Sostituisci un'impostazione di visualizzazione solo nella pagina corrente.",
      pageClear: 'Rimuovi le sostituzioni della pagina corrente.',
      rescan:
        "Ricostruisci l'elenco degli esagoni della pagina, ad esempio dopo aver copiato una pagina o un gioco.",
      calibrate:
        'Allinea la griglia esagonale con uno o due gettoni selezionati agganciati ai centri esagonali.',
      calibrateReset: 'Rimuovi la calibrazione della pagina corrente.',
      status: 'Mostra cosa sa Hexploration sulla pagina corrente.',
      journal: 'Ricostruisci le dispense Help e Command Deck.',
      help: 'Mostra questo elenco.',
      handout: 'Le istruzioni complete si trovano nel volantino "{name}".',
    },
    deck: {
      drawDesc:
        "Disegna forme attorno a un'area, selezionale, quindi riempi. Annulla riempimento annulla l'ultimo riempimento.",
      revealDesc:
        'Seleziona esagoni, forme o segnalini per rivelarli o coprirli di nuovo. Esplora rivela attorno ai segnalini selezionati come se si fossero appena spostati.',
      locationsDesc:
        'Seleziona i token per nasconderli come posizioni sotto esagoni. Seleziona esagoni o gettoni per nominare un esagono.',
      toolsDesc:
        'Impostazioni, sostituzioni di pagina, stato, nuova scansione delle pagine copiate e calibrazione della griglia.',
      footer: 'Consulta il volantino "{help}" per le istruzioni complete.',
    },
    handout: {
      versionLabel: 'Versione',
      subtitle: 'Esplorazione esagono per esagono per Roll20',
      footer: 'Utilizza il volantino "{deck}" per i controlli con un clic.',
      overview: {
        heading: 'Panoramica',
        body: "L'esplorazione copre una mappa esagonale con esagoni opachi. Mentre il gruppo si muove, gli esagoni che attraversa (e, se preferisci, gli esagoni attorno a lui) vengono rimossi, quindi la mappa viene scoperta un esagono alla volta. I luoghi nascosti possono essere posizionati sotto esagoni e vengono annunciati quando vengono trovati. Funziona nei giochi Jumpgate e Legacy, su griglie Hex (V) e Hex (H) di qualsiasi dimensione.",
        demo: 'Guarda una breve demo (dalla versione 1)',
      },
      quickStart: {
        heading: 'Avvio rapido',
        steps: [
          'Apri una pagina la cui griglia è impostata su Hex (V) o Hex (H).',
          "Disegna una o più forme (poligono, rettangolo, ellisse o a mano libera) attorno all'area da nascondere.",
          'Seleziona le forme e fai clic su Riempi nel Command Deck (oppure digita !hexploration fill). Le forme vengono sostituite da esagoni.',
          'Facoltativo: prima di riempire, seleziona i segnalini dei luoghi importanti e fai clic su Segna posizione. Vengono nascosti sotto gli esagoni e annunciati quando vengono scoperti.',
          'Muovi un segnalino giocatore. Ogni esagono che attraversa, e gli esagoni entro la sua Distanza di vista, vengono rivelati.',
        ],
      },
      commands: {
        heading: 'Comandi',
        intro:
          'Solo i GM possono utilizzare questi comandi. La maggior parte agisce sugli oggetti selezionati; il resto agisci sulla pagina che stai visualizzando.',
        colCommand: 'Comando',
        colDesc: 'Cosa fa',
      },
      revealing: {
        heading: 'Come funziona la rivelazione',
        points: [
          'Solo i segnalini sul livello dei segnalini rivelano gli esagoni. Quali segnalini contano lo stabilisce Segnalini che rivelano: per impostazione predefinita i segnalini dei giocatori, così il GM può spostare i mostri senza scoprire la mappa.',
          'Un segnalino rivela ogni esagono che copre (i segnalini grandi ne coprono diversi) e, con Rivela lungo il percorso attivo, ogni esagono del percorso lungo il quale è stato trascinato, compresi i waypoint.',
          'La Distanza di vista rivela gli esagoni attorno a ciascuno di quegli esagoni, a partire dai più vicini. Con Linea di vista attiva, un esagono non viene rivelato finché tra esso e il segnalino si trova un esagono coperto. Di solito gli esagoni più vicini vengono rivelati per primi, quindi in campo aperto la Linea di vista non cambia nulla: conta solo con una Distanza di vista di 2 o più ed esagoni che restano coperti, come il terreno riempito con una Distanza di rivelazione degli esagoni.',
          "La Distanza di rivelazione degli esagoni viene memorizzata su ciascun esagono quando viene riempito, quindi impostala prima di riempire; modificarla in seguito non influisce sugli esagoni già presenti sulla mappa. Un segnalino deve trovarsi entro quel numero di esagoni per rivelarli, per quanto lontano possa vedere, e con 0 vengono rivelati solo entrandoci. Per una catena montuosa: imposta la Distanza di rivelazione degli esagoni a 0, riempi le montagne, riportala a nessun limite, poi riempi le terre al di là. Con Distanza di vista 3 e Linea di vista attiva, il gruppo vede il terreno aperto attorno a sé, ma non le montagne né ciò che c'è dietro. Ogni esagono di montagna viene rivelato quando un segnalino vi entra.",
          'Nella modalità Intravedi, gli esagoni in vista diventano trasparenti invece di scomparire e vengono rimossi quando un segnalino vi entra. Gli esagoni intravisti non bloccano la Linea di vista.',
          'Roll20 disegna nomi, barre e aure dei segnalini sopra gli esagoni. Con Nascondi i segnalini coperti attivo, un segnalino sotto un esagono coperto ha nome, barre e aure visibili ai giocatori disattivati finché non viene scoperto, così i mostri nascosti non si tradiscono. Se ne attivi uno mentre il segnalino è coperto, resta nascosto e viene attivato quando il segnalino viene scoperto.',
          "L'API non segnala gli spostamenti effettuati da altre mod. Gli spostamenti di TokenMod vengono rilevati automaticamente; per altre mod, seleziona i segnalini e fai clic su Esplora, oppure chiama Hexploration.revealAround(token) dalla tua mod.",
        ],
      },
      locations: {
        heading: 'Esagoni e posizioni con nome',
        points: [
          'Segna posizione trasforma i segnalini selezionati in posizioni nascoste. Un segnalino già sotto un esagono viene nascosto subito; altrimenti viene nascosto dal riempimento successivo che lo copre.',
          "Anche i gettoni con l'indicatore di stato della torre bianca vengono trattati come posizioni quando li riempi, come nella versione 1.",
          'I segnalini posizione nascosta vengono spostati nel livello GM. Quando il loro esagono viene rivelato, ritornano al livello dei gettoni con il loro nome mostrato e la loro scoperta viene annunciata.',
          "Nomina esagono dà un nome a un esagono senza usare un segnalino. Il nome viene mostrato al GM come etichetta sul livello GM e annunciato quando l'esagono viene rivelato.",
          "Annuncia le scoperte sceglie se l'annuncio lo vedono tutti, solo il GM o nessuno. Ping sulle scoperte sposta anche la visuale dei giocatori sulla posizione.",
        ],
      },
      settings: {
        heading: 'Impostazioni',
        intro:
          'Modifica le impostazioni con !hexploration set (o con il pulsante Impostazioni). Livello degli esagoni, Segnalini che rivelano e Lingua si possono impostare anche nella pagina delle impostazioni della mod.',
        colKey: 'Chiave',
        colName: 'Collocamento',
        colDesc: 'Descrizione',
        perPage: '(Può essere impostato per pagina.)',
      },
      jumpgate: {
        heading: 'Jumpgate e Legacy',
        points: [
          "L'esplorazione determina quale motore utilizza il gioco e disegna il tipo di forma corrispondente. È possibile riempire le forme disegnate in entrambi gli editor.",
          "Con Livello degli esagoni impostato su Automatico, gli esagoni vengono disegnati sul livello in primo piano, sopra i segnalini, così i giocatori non possono vedere cosa c'è sotto. Se il livello in primo piano non è disponibile, viene usato invece il livello dei segnalini.",
          'Jumpgate disegna esagoni matematicamente regolari, che hanno una forma leggermente diversa dagli esagoni Legacy. Se gli esagoni non sono allineati alla griglia di una pagina, aggancia un segnalino al centro di un esagono, selezionalo e fai clic su Calibra. Seleziona due segnalini in esagoni adiacenti della stessa riga (Hex V) o colonna (Hex H) per correggere anche la dimensione degli esagoni.',
          'Quando una pagina o un gioco viene copiato, i suoi esagoni ottengono nuovi ID. Esegui Nuova scansione sulla pagina per riprenderli, insieme alle etichette dei nomi e ai segnalini di posizione.',
        ],
      },
      upgrading: {
        heading: 'Aggiornamento dalla versione 1',
        points: [
          'La versione 2 non necessita più di PathMath, MatrixMath, Vector Math o HTML Builder. Puoi rimuoverli a meno che un altro mod non li utilizzi.',
          'Le mappe a esagoni, i nomi, i segnalini di posizione e le impostazioni esistenti vengono aggiornati automaticamente al primo avvio.',
          'I comandi della versione 1, inclusa la macro Hexploration_menu, funzionano ancora.',
          'La versione 1 permetteva a qualsiasi segnalino che rappresentasse un personaggio di rivelare esagoni. Imposta Segnalini che rivelano su Segnalini dei personaggi per mantenere quel comportamento.',
        ],
        colV1: 'Comando della versione 1',
        colV2: 'Comando della versione 2',
      },
      troubleshooting: {
        heading: 'Risoluzione dei problemi',
        points: [
          'Non succede nulla quando un segnalino si muove: controlla che il segnalino sia sul livello dei segnalini e corrisponda a Segnalini che rivelano, e che la pagina abbia esagoni (!hexploration status).',
          'Gli esagoni sono sfalsati rispetto alla griglia: usa Calibra, poi controlla con un segnalino su alcuni esagoni in vari punti della mappa.',
          'Gli esagoni non vengono più rivelati dopo aver copiato una pagina o un gioco: esegui Nuova scansione sulla pagina.',
          "Riempi indica che l'area non contiene centri di esagono: la forma deve contenere il centro di almeno un esagono.",
          'Per qualsiasi altra cosa, controlla il registro della console API e includi i suoi messaggi quando chiedi aiuto.',
        ],
      },
      languages: {
        heading: 'Lingue',
        body: 'Scegli una lingua con !hexploration set language. Lingue disponibili:',
        colLanguage: 'Lingua',
        colNative: 'Nome originale',
        colCode: 'Codice',
      },
      credits: {
        heading: 'Crediti',
        original: 'Mod originale di',
        maintainer: 'Versione 2 mantenuta da',
        marketplace: 'I pacchetti artistici di Ada sul Marketplace Roll20',
        support:
          "Se trovi un bug o hai un'idea, pubblica un post nel forum Roll20 Mod o apri un problema su GitHub e includi eventuali messaggi dal registro della console API.",
      },
    },
  };

  const TRANSLATION$9 = {
    titles: {
      ready: 'Hexploration の準備ができました。',
      settings: 'Hexploration 設定',
      languages: '言語の選択',
      pageSettings: 'ページ設定: {page}',
      status: 'Hexploration ステータス: {page}',
      help: 'Hexploration コマンド',
      confirm: 'ご確認ください',
    },
    discovery: {
      title: '場所が発見されました',
    },
    menu: {
      draw: '描画',
      reveal: '表示と非表示',
      locations: '場所',
      tools: 'ツール',
      layerInUse: '新しいヘクスが {layer} に描画されています。',
      pageSettingsHelp:
        'これらの設定は、このページにのみ適用されます。 ★ のマークが付いた設定は、グローバル設定をオーバーライドします。',
    },
    buttons: {
      fill: '塗りつぶし',
      fillInverse: '反転塗りつぶし',
      undo: '塗りつぶしを元に戻す',
      reveal: '表示',
      conceal: '隠す',
      explore: '探索',
      revealPage: 'ページを全表示',
      resetPage: 'ページをリセット',
      mark: '場所としてマーク',
      unmark: 'マーク解除',
      name: 'ヘクスに名前を付ける',
      settings: '設定',
      pageSettings: 'ページ設定',
      status: 'ステータス',
      rescan: '再スキャン',
      calibrate: '調整',
      calibrateReset: '調整をリセット',
      help: 'ヘルプ',
      change: '変更',
      menu: 'メニュー',
      clearOverrides: '上書きを解除',
      confirmReset: 'はい、すべてのヘクスを削除',
    },
    prompts: {
      name: '場所の名前 (クリアするには空白のままにします)',
    },
    values: {
      on: 'オン',
      off: 'オフ',
      none: 'なし',
      hexLayer: {
        auto: '自動（可能なら前景レイヤー）',
        foreground: '前景レイヤー',
        objects: 'トークンレイヤー',
      },
      revealBy: {
        players: 'プレイヤートークン',
        characters: 'キャラクタートークン',
        all: 'すべてのトークン',
      },
      revealMode: {
        clear: '除去',
        glimpse: '透過',
      },
      announce: {
        all: '全員',
        gm: 'GMのみ',
        off: 'オフ',
      },
      orientation: {
        vertical: 'Hex (V)',
        horizontal: 'Hex (H)',
      },
      fillKind: {
        fill: '塗りつぶし',
        fillInverse: '反転塗りつぶし',
        conceal: '隠す',
      },
    },
    settings: {
      language: {
        label: '言語',
        desc: 'メニュー、メッセージ、配布資料の言語。',
      },
      hexLayer: {
        label: 'ヘクスのレイヤー',
        desc: '新しいヘクスを描画する場所。自動では前景レイヤー（トークンの上）を試し、ゲームが対応していない場合はトークンレイヤーを使用します。',
      },
      fillColor: {
        label: '塗りつぶしの色',
        desc: '新しいヘクスの色。シースルー ヘクスには rgba() を使用します (例: rgba(0,0,0,0.8))。',
      },
      strokeColor: {
        label: '枠線の色',
        desc: '新しいヘクスの輪郭の色。',
      },
      labelColor: {
        label: 'ラベルの色',
        desc: '名前付きヘクス上の GM 専用の名前ラベルの色。',
      },
      glimpseColor: {
        label: '透過色',
        desc: '透過したときにヘクスが変わる色（表示モード「透過」）。半透明の rgba() カラーを使用してください。',
      },
      strokeWidth: {
        label: '枠線の幅',
        desc: '新しいヘクスのアウトラインの幅 (ピクセル単位) (0 ～ 20)。',
      },
      maxDistance: {
        label: 'ヘクスの公開距離',
        desc: 'ヘクスを塗りつぶすときにヘクスに保存されるため、塗りつぶす前に設定してください。後から変更しても、すでにマップ上にあるヘクスには影響しません。トークンがどれだけ遠くまで見えても、ヘクスを公開するにはこの数のヘクス以内にいる必要があります。0の場合、ヘクスに入ったときにのみ公開されます。山や森に使用します。制限を設けない場合は空のままにします。',
      },
      revealDistance: {
        label: '視界距離',
        desc: '移動するトークンの周りのヘクス数が明らかになります (0 ～ 20)。 0 は、トークンが通過するヘクスのみを表示します。',
      },
      lineOfSight: {
        label: '視線',
        desc: 'オンの場合、「ヘクスの公開距離」を設定して塗りつぶした山など、覆われたままのヘクスが、その背後のヘクスを隠します。「視界距離」が2以上の場合にのみ違いが出ます。',
      },
      revealPath: {
        label: '経路に沿って表示',
        desc: 'オンの場合、トークンが停止する場所だけでなく、ドラッグ中にトークンが通過するすべてのヘクス (ウェイポイントを含む) が表示されます。',
      },
      revealBy: {
        label: '公開するトークン',
        desc: 'トークン レイヤー上のどのトークンがヘクスを明らかにします: プレイヤーが制御するトークン、任意のキャラクターを表すトークン、またはすべてのトークン。',
      },
      revealMode: {
        label: '公開モード',
        desc: '除去は視界内のヘクスを取り除きます。透過は代わりにヘクスを半透明にし、トークンが入ると取り除きます。',
      },
      announce: {
        label: '発見を通知',
        desc: '名前付きの場所が発見されたときにチャット メッセージを表示する人。',
      },
      pingDiscoveries: {
        label: '発見地点をピン',
        desc: 'オンにすると、プレーヤーは指定された場所が検出されたときに、その場所に ping されます。',
      },
      hideCoveredTokens: {
        label: '覆われたトークンを隠す',
        desc: 'Roll20 はヘクスの上に名前、バー、オーラを描画します。オンの場合、覆われたヘクスの下にあるトークンは、プレイヤーに表示される名前、バー、オーラがオフになり、覆われていないと再びオンになります。',
      },
    },
    status: {
      engine: 'ゲームエンジン',
      grid: 'グリッド',
      layer: 'ヘクスレイヤー',
      hexes: 'ヘクス',
      named: '名前付きヘクス',
      icons: '場所トークン',
      glimpsed: '透過中のヘクス',
      pending: '塗りつぶし待ちの場所',
      calibrated: '調整済み',
      overrides: 'ページの上書き',
      undo: '元に戻せる操作',
    },
    messages: {
      filled:
        '充填完了。描画されたヘクス: {created}。スタイル変更: {restyled}。非表示の場所: {icons}。',
      revealed: '明らかになったヘクス: {count}。',
      revealedPage: 'ページ上のすべてのヘクスが表示されます ({count})。',
      confirmReset:
        '「{page}」({count}) からすべてのヘクスを削除しますか?位置トークンはトークン層に戻ります。 「元に戻す」ではこれを元に戻すことはできません。',
      resetPage: 'ページから削除されたヘクス: {count}。',
      undone:
        '最後の塗りつぶしが取り消されました。削除されたヘクス: {removed}。スタイル変更されたヘクスが復元されました: {restored}。',
      named: '「{name}」という名前のヘクス: {count}。',
      unnamed: '削除された名前: {count}。',
      marked:
        '既存のヘクスに隠されている場所: {attached}。それらをカバーする次のフィルを待っています: {pending}。',
      unmarked: '場所ではなくなったトークン: {count}。',
      settingChanged: '{setting} を {value} に設定します。',
      rescanned:
        '再スキャンが完了しました。保持: {kept}。採用されました: {adopted}。再提出: {moved}。行方不明または忘れられているもの: {dropped}。ラベルが再リンクされました: {labels}。位置トークンが再リンクされました: {icons}。',
      calibrated:
        'グリッドが調整されました (列ステップ {colStep}px、行ステップ {rowStep}px)。再スキャン: {kept} を保持し、{moved} を再ファイルし、{adopted} を採用しました。',
      calibrationReset:
        'キャリブレーションが削除されました。再スキャン: {kept} を保持し、{moved} を再ファイルし、{adopted} を採用しました。',
      journalRebuilt: '「{help}」および「{deck}」の配布資料が再構築されました。',
      migrated:
        'Hexploration 1.x ヘクス マップがアップグレードされました。このゲームがレガシー ゲームからコピーされた場合は、各ヘクス マップ ページで再スキャンを実行します。',
      pruned:
        '存在せず忘れ去られた保存ヘクス: {dropped}。このゲームまたはページがコピーされている場合は、ページで再スキャンを実行してヘクスを再度取得します。',
      readyHint:
        'メニューを開くには !hexploration と入力するか、配布資料 "Hexploration - Command Deck" を開きます。',
    },
    warnings: {
      foregroundUnavailable:
        'このゲームは前景レイヤーでの描画をサポートしていないため、ヘクスはトークン レイヤーに描画されました。',
      someFailed:
        '描画できなかったヘクス: {count}。詳細については API コンソールを確認してください。',
    },
    errors: {
      noPage: '作業するページが見つかりませんでした。',
      notHex: 'このページはヘクスグリッドを使用していません。',
      noPolygons: '塗りつぶす描画形状を 1 つまたは複数選択します。',
      emptyArea: '選択した領域には六角中心が含まれていません。',
      tooMany: 'これでは、一度に作成されるヘクスが多すぎます ({count})。',
      nothingToConceal: '非表示にする描画された図形またはトークンを選択します。',
      nothingToReveal: '表示するヘクス、描画された形状、またはトークンを選択します。',
      noTokens: '最初に 1 つ以上のトークンを選択します。',
      noHexes: '最初に 1 つ以上のヘクス (またはヘクス上にあるトークン) を選択します。',
      nothingToUndo: '元に戻す塗りつぶしはありません。',
      unknownCommand: '不明なコマンド: {command}',
      unknownSetting: '不明な設定: {key}',
      unknownPageSetting: 'ページごとに設定できる設定: {keys}',
      invalidValue: '「{value}」は、{key} の有効な値ではありません。',
      calibrateNeedsTokens: '六角中心にスナップされた 1 つまたは 2 つのトークンを選択します。',
      calibrateFailed: 'これらのトークンは調整には使用できません。',
      unexpected: '問題が発生しました: {message}',
    },
    hints: {
      noPage: '作業したいページを開くか、ページ上で何かを選択します。',
      notHex: 'ページ設定でページのグリッドを Hex (V) または Hex (H) に設定してください。',
      noPolygons:
        '領域の周囲に多角形、長方形、楕円、またはフリーハンド形状を描画し、それを選択してから、再試行してください。',
      emptyArea: 'より大きな図形を描画するか、ページ グリッドの設定を確認してください。',
      tooMany: 'より小さい領域を塗りつぶすか、領域をいくつかの形状に分割します。',
      noHexes: 'ヘクスは前景またはトークン層にあります。そのレイヤーに切り替えて選択します。',
      unknownCommand: '「!hexploration help」と入力してコマンドをリストします。',
      unknownSetting: 'すべての設定を表示するには、「!hexploration set」と入力します。',
      calibrateNeedsTokens:
        'トークンをヘクスの中心にスナップして選択します。同じ行 (Hex V) または列 (Hex H) の隣接するヘクスにスナップした 2 つ目のトークンも選択すると、ヘクスのサイズも補正されます。',
      calibrateFailed:
        '2 つのトークンは同じ行 (Hex V) または同じ列 (Hex H) にあり、少なくとも 1 ヘクス離れている必要があります。',
      unexpected: '詳細は API コンソールのログに記載されています。',
    },
    help: {
      menu: 'メニューを表示します。',
      fill: '選択した描画形状を六角形で覆います。',
      fillInverse: '選択した図形の内側を除いてページ全体を覆います。',
      undo: '最後の塗りつぶしを元に戻し、逆塗りつぶしまたは非表示にし、使用した形状を復元します。',
      reveal: '選択したヘクスと、選択した図形とトークンの下のヘクスを表示します。',
      revealPage: 'ページ上のすべてのヘクスをアナウンスなしで公開します。',
      conceal: '選択したシェイプとトークンの下の領域を再度六角形で覆います。',
      explore: '選択したトークンの周囲を、まるでそこに移動したかのように表示します。',
      resetPage: 'ページ上のすべてのヘクスを削除します (最初に質問します)。',
      name: '選択したヘクス、または選択したトークンの下のヘクスに名前を付けます。名前をクリアするには、名前を空のままにしておきます。',
      mark: '選択したトークンを非表示の場所に変更します。',
      unmark: '選択したトークンが非表示の場所になるのを停止します。',
      set: '設定を変更するか、すべての設定を表示します。',
      pageSet: '現在のページでのみ公開設定をオーバーライドします。',
      pageClear: '現在のページのオーバーライドを削除します。',
      rescan: 'ページのヘクス一覧を再構築します。ページやゲームをコピーした後などに使います。',
      calibrate:
        '選択した 1 つまたは 2 つのトークンを六角形の中心にスナップして六角形のグリッドを並べます。',
      calibrateReset: '現在のページの調整を削除します。',
      status: '現在のページについて Hexploration が知っていることを表示します。',
      journal: 'ヘルプと Command Deck の配布資料を再構築します。',
      help: 'このリストを表示します。',
      handout: '完全な手順は配布資料「{name}」に記載されています。',
    },
    deck: {
      drawDesc:
        '領域の周囲に図形を描き、選択して塗りつぶします。「塗りつぶしを元に戻す」で最後の塗りつぶしを取り消せます。',
      revealDesc:
        'ヘクス、図形、またはトークンを選択して、表示するか再び覆います。「探索」は、選択したトークンがそこへ移動したかのように周囲を表示します。',
      locationsDesc:
        'ヘクスの下の位置としてトークンを非表示にするには、トークンを選択します。ヘクスまたはトークンを選択してヘクスに名前を付けます。',
      toolsDesc:
        '設定、ページの上書き、ステータス、コピーされたページの再スキャン、グリッドの調整。',
      footer: '完全な手順については、配布資料「{help}」を参照してください。',
    },
    handout: {
      versionLabel: 'バージョン',
      subtitle: 'Roll20 のヘクスごとの探索',
      footer: 'ワンクリック コントロールについては、配布資料「{deck}」を使用してください。',
      overview: {
        heading: '概要',
        body: 'Hexploration は、ヘクスマップを不透明なヘクスで覆います。パーティが移動すると、通過したヘクス（必要に応じてその周囲のヘクスも）が取り除かれ、マップが 1 ヘクスずつ明らかになります。隠し場所をヘクスの下に配置でき、見つかるとアナウンスされます。Jumpgate と Legacy の両方のゲームで、任意のサイズの Hex (V) および Hex (H) グリッドで動作します。',
        demo: '短いデモを見る (バージョン 1 から)',
      },
      quickStart: {
        heading: 'クイックスタート',
        steps: [
          'グリッドが Hex (V) または Hex (H) に設定されたページを開きます。',
          '非表示にする領域の周囲に 1 つ以上の形状 (多角形、長方形、楕円、またはフリーハンド) を描画します。',
          '図形を選択し、Command Deck の「塗りつぶし」をクリックします（または !hexploration fill と入力します）。図形がヘクスに置き換わります。',
          '任意: 塗りつぶす前に、重要な場所のトークンを選択して「場所としてマーク」をクリックします。それらはヘクスの下に隠され、発見されるとアナウンスされます。',
          'プレイヤートークンを移動します。通過したすべてのヘクスと、その視界距離内のヘクスが表示されます。',
        ],
      },
      commands: {
        heading: 'コマンド',
        intro:
          'これらのコマンドは GM のみが使用できます。ほとんどは、選択したオブジェクトに作用します。残りの部分は、表示しているページに基づいて動作します。',
        colCommand: '指示',
        colDesc: '何をするのか',
      },
      revealing: {
        heading: '暴露の仕組み',
        points: [
          'ヘクスを表示するのは、トークンレイヤー上のトークンだけです。どのトークンが対象かは「公開するトークン」で設定します。既定ではプレイヤートークンなので、GM はマップを表示させずにモンスターを動かせます。',
          'トークンは自分が覆うすべてのヘクスを表示し（大きなトークンは複数のヘクスを覆います）、「経路に沿って表示」がオンの場合は、ドラッグされた経路上のすべてのヘクス（ウェイポイントを含む）も表示します。',
          '「視界距離」は、それらの各ヘクスの周囲のヘクスを近い順に公開します。「視線」がオンの場合、ヘクスとトークンの間に覆われたヘクスがある間は、そのヘクスは公開されません。通常は近いヘクスから先に公開されるため、開けた土地では「視線」は何も変えません。意味を持つのは、「視界距離」が2以上で、「ヘクスの公開距離」を設定して塗りつぶした地形など、覆われたままのヘクスがある場合だけです。',
          '「ヘクスの公開距離」は、ヘクスを塗りつぶすときに各ヘクスに保存されるため、塗りつぶす前に設定してください。後から変更しても、すでにマップ上にあるヘクスには影響しません。トークンがどれだけ遠くまで見えても、ヘクスを公開するにはその数のヘクス以内にいる必要があり、0の場合はヘクスに入ったときにのみ公開されます。山脈の場合：「ヘクスの公開距離」を0に設定して山を塗りつぶし、設定をなしに戻してから、その先の土地を塗りつぶします。「視界距離」を3にして「視線」をオンにすると、パーティーは周囲の開けた土地は見えますが、山やその背後にあるものは見えません。各山岳ヘクスは、トークンがその中に入ったときに公開されます。',
          '「透過」モードでは、視界内のヘクスは消えずに半透明になり、トークンが入ると取り除かれます。透過状態のヘクスは「視線」を遮りません。',
          'Roll20 はトークンの名前、バー、オーラをヘクスの上に描画します。「覆われたトークンを隠す」がオンの場合、覆われたヘクスの下にあるトークンは、覆いが外れるまでプレイヤーに見える名前、バー、オーラがオフになるため、隠れたモンスターの存在がばれません。トークンが覆われている間にそれらのいずれかをオンにしても隠されたままになり、覆いが外れたときにオンになります。',
          'API は他の Mod による移動を報告しません。TokenMod による移動は自動的に検出されます。その他の Mod の場合は、トークンを選択して「探索」をクリックするか、独自の Mod から Hexploration.revealAround(token) を呼び出してください。',
        ],
      },
      locations: {
        heading: '名前付きヘクスと場所',
        points: [
          '「場所としてマーク」は、選択したトークンを隠し場所に変えます。すでにヘクスの下にあるトークンはすぐに隠されます。それ以外の場合は、そのトークンを覆う次の塗りつぶしで隠されます。',
          'バージョン 1 と同様に、白い塔のステータス マーカーが付いたトークンも、埋めるときに場所として扱われます。',
          '非表示の位置トークンは GM レイヤーに移動されます。彼らのヘクスが明らかになると、彼らは名前が表示された状態でトークン層に戻り、彼らの発見が発表されます。',
          '「ヘクスに名前を付ける」は、トークンなしでヘクスに名前を付けます。名前は GM レイヤー上のラベルとして GM に表示され、ヘクスが表示されたときにアナウンスされます。',
          '「発見を通知」では、アナウンスを全員が見るか、GM のみが見るか、誰も見ないかを選択します。「発見地点をピン」は、さらにプレイヤーの視点をその場所へ移動します。',
        ],
      },
      settings: {
        heading: '設定',
        intro:
          '!hexploration set（または「設定」ボタン）で設定を変更します。「ヘクスのレイヤー」、「公開するトークン」、「言語」は Mod の設定ページでも設定できます。',
        colKey: '鍵',
        colName: '設定',
        colDesc: '説明',
        perPage: '（ページごとに設定可能）',
      },
      jumpgate: {
        heading: 'Jumpgate と Legacy',
        points: [
          'Hexploration は、ゲームがどのエンジンを使用しているかを判断し、一致する種類の形状を描画します。どちらのエディタでも描画された形状を塗りつぶすことができます。',
          '「ヘクスのレイヤー」が「自動」の場合、ヘクスは前景レイヤー（トークンの上）に描画されるため、プレイヤーはその下にあるものを見ることができません。前景レイヤーが使用できない場合は、代わりにトークンレイヤーが使用されます。',
          'Jumpgate は数学的に正確な正六角形のヘクスを描画するため、Legacy のヘクスとは形状がわずかに異なります。ヘクスがページのグリッドと揃わない場合は、ヘクスの中心にトークンをスナップし、それを選択して「調整」をクリックします。同じ行 (Hex V) または列 (Hex H) の隣接するヘクスにある 2 つのトークンを選択すると、ヘクスのサイズも補正されます。',
          'ページまたはゲームがコピーされると、そのヘクスは新しい ID を取得します。ページで再スキャンを実行して、名前ラベルと場所トークンとともにそれらを再度取得します。',
        ],
      },
      upgrading: {
        heading: 'バージョン1からのアップグレード',
        points: [
          'バージョン 2 では、PathMath、MatrixMath、Vector Math、または HTML Builder は必要なくなりました。別の MOD が使用していない限り、削除しても構いません。',
          '既存のヘクス マップ、名前、位置トークン、および設定は、初回起動時に自動的にアップグレードされます。',
          'Hexploration_menu マクロを含むバージョン 1 のコマンドは引き続き機能します。',
          'バージョン 1 では、キャラクターを表すトークンであればどれでもヘクスを表示できました。この動作を維持するには、「公開するトークン」を「キャラクタートークン」に設定してください。',
        ],
        colV1: 'バージョン1のコマンド',
        colV2: 'バージョン 2 コマンド',
      },
      troubleshooting: {
        heading: 'トラブルシューティング',
        points: [
          'トークンを動かしても何も起こらない: トークンがトークンレイヤー上にあり「公開するトークン」の設定に合っていること、ページにヘクスがあること（!hexploration status）を確認してください。',
          'ヘクスがグリッドからずれている: 「調整」を使い、マップ上のいくつかのヘクスにトークンを置いて確認してください。',
          'ページまたはゲームをコピーした後、ヘクスが表示されなくなりました。ページで再スキャンを実行してください。',
          '「塗りつぶし」で領域にヘクスの中心がないと表示される: 図形には少なくとも 1 つのヘクスの中心が含まれている必要があります。',
          'その他の場合は、API コンソール ログを確認し、ヘルプを求めるときにそのメッセージを含めてください。',
        ],
      },
      languages: {
        heading: '言語',
        body: '!hexploration set language で言語を選択します。利用可能な言語:',
        colLanguage: '言語',
        colNative: '現地語での名称',
        colCode: 'コード',
      },
      credits: {
        heading: 'クレジット',
        original: 'オリジナル版の作者',
        maintainer: 'バージョン 2 の保守者',
        marketplace: 'Roll20 マーケットプレイスのエイダのアート パック',
        support:
          'バグを見つけた場合やアイデアがある場合は、Roll20 Mod フォーラムに投稿するか、GitHub で問題を開いて、API コンソール ログからのメッセージを含めてください。',
      },
    },
  };

  const TRANSLATION$8 = {
    titles: {
      ready: 'Hexploration이 준비되었습니다.',
      settings: 'Hexploration 설정',
      languages: '언어 선택',
      pageSettings: '페이지 설정: {page}',
      status: 'Hexploration 상태: {page}',
      help: 'Hexploration 명령어',
      confirm: '확인해주세요',
    },
    discovery: {
      title: '위치 발견',
    },
    menu: {
      draw: '그리기',
      reveal: '공개 및 숨기기',
      locations: '위치',
      tools: '도구',
      layerInUse: '{layer}에 새로운 헥스가 그려지고 있습니다.',
      pageSettingsHelp:
        '이 설정은 이 페이지에만 적용됩니다. ★로 표시된 설정은 전역 설정보다 우선 적용됩니다.',
    },
    buttons: {
      fill: '채우기',
      fillInverse: '반전 채우기',
      undo: '채우기 취소',
      reveal: '공개',
      conceal: '숨기기',
      explore: '탐색',
      revealPage: '페이지 전체 공개',
      resetPage: '페이지 초기화',
      mark: '위치 표시',
      unmark: '표시 해제',
      name: '헥스 이름 지정',
      settings: '설정',
      pageSettings: '페이지 설정',
      status: '상태',
      rescan: '다시 스캔',
      calibrate: '보정',
      calibrateReset: '보정 초기화',
      help: '도움말',
      change: '변경',
      menu: '메뉴',
      clearOverrides: '재정의 지우기',
      confirmReset: '예, 모든 헥스 제거',
    },
    prompts: {
      name: '위치 이름(지우려면 비워 두세요)',
    },
    values: {
      on: '켜짐',
      off: '꺼짐',
      none: '없음',
      hexLayer: {
        auto: '자동(사용 가능한 경우 전경)',
        foreground: '전경 레이어',
        objects: '토큰 레이어',
      },
      revealBy: {
        players: '플레이어 토큰',
        characters: '캐릭터 토큰',
        all: '모든 토큰',
      },
      revealMode: {
        clear: '제거',
        glimpse: '반투명',
      },
      announce: {
        all: '모두',
        gm: 'GM 전용',
        off: '꺼짐',
      },
      orientation: {
        vertical: 'Hex (V)',
        horizontal: 'Hex (H)',
      },
      fillKind: {
        fill: '채우기',
        fillInverse: '반전 채우기',
        conceal: '숨기기',
      },
    },
    settings: {
      language: {
        label: '언어',
        desc: '메뉴, 메시지, 유인물에 대한 언어입니다.',
      },
      hexLayer: {
        label: '헥스 레이어',
        desc: '새 헥스를 그릴 위치입니다. 자동은 전경 레이어(토큰 위)를 먼저 시도하고, 게임이 지원하지 않으면 토큰 레이어를 사용합니다.',
      },
      fillColor: {
        label: '채우기 색상',
        desc: '새 헥스의 색상입니다. 비쳐 보이는 헥스를 원하면 rgba()를 사용하세요(예: rgba(0,0,0,0.8)).',
      },
      strokeColor: {
        label: '테두리 색상',
        desc: '새로운 육각형의 윤곽선 색상입니다.',
      },
      labelColor: {
        label: '라벨 색상',
        desc: '명명된 육각형의 GM 전용 이름 라벨 색상입니다.',
      },
      glimpseColor: {
        label: '반투명 색상',
        desc: '반투명 상태가 된 헥스의 색상입니다(반투명 공개 모드). 비쳐 보이는 rgba() 색상을 사용하세요.',
      },
      strokeWidth: {
        label: '테두리 너비',
        desc: '새 헥스의 윤곽선 너비(픽셀 단위)(0~20).',
      },
      maxDistance: {
        label: '헥스 공개 거리',
        desc: '헥스를 채울 때 헥스에 저장되므로 채우기 전에 설정하세요. 나중에 바꿔도 이미 맵에 있는 헥스에는 영향을 주지 않습니다. 토큰이 얼마나 멀리 볼 수 있든, 헥스를 공개하려면 이 헥스 수 이내에 있어야 합니다. 0이면 헥스에 들어가야만 공개됩니다. 산이나 숲에 사용하세요. 제한이 없으면 비워 두세요.',
      },
      revealDistance: {
        label: '시야 거리',
        desc: '움직이는 토큰 주변의 헥스 수는 공개됩니다(0~20). 0은 토큰이 통과하는 헥스만 나타냅니다.',
      },
      lineOfSight: {
        label: '시선',
        desc: '켜져 있으면, 헥스 공개 거리로 채운 산처럼 계속 덮여 있는 헥스가 그 뒤의 헥스를 가립니다. 시야 거리가 2 이상일 때만 차이가 있습니다.',
      },
      revealPath: {
        label: '경로를 따라 표시',
        desc: '켜져 있으면 토큰이 멈추는 위치뿐만 아니라 드래그되는 동안 토큰이 통과하는 모든 헥스(경유지 포함)가 표시됩니다.',
      },
      revealBy: {
        label: '공개하는 토큰',
        desc: '토큰 레이어의 어떤 토큰이 헥스를 공개할지 정합니다: 플레이어가 조종하는 토큰, 캐릭터를 나타내는 토큰 또는 모든 토큰.',
      },
      revealMode: {
        label: '공개 모드',
        desc: '제거는 시야 안의 헥스를 없앱니다. 반투명은 대신 헥스를 비쳐 보이게 하며, 토큰이 들어가면 제거합니다.',
      },
      announce: {
        label: '발견 알림',
        desc: '이름이 지정된 위치가 발견되면 채팅 메시지를 볼 수 있는 사람입니다.',
      },
      pingDiscoveries: {
        label: '발견 위치 핑',
        desc: '켜져 있으면 이름이 지정된 위치가 발견되면 플레이어에게 해당 위치로 핑이 전송됩니다.',
      },
      hideCoveredTokens: {
        label: '덮인 토큰 숨기기',
        desc: 'Roll20은 이름, 막대, 오라를 헥스 위에 그립니다. 켜져 있으면 덮인 헥스 아래에 있는 토큰의 플레이어에게 보이는 이름, 막대, 오라를 끄고, 덮개가 벗겨지면 다시 켭니다.',
      },
    },
    status: {
      engine: '게임 엔진',
      grid: '그리드',
      layer: '헥스 레이어',
      hexes: '헥스',
      named: '명명된 헥스',
      icons: '위치 토큰',
      glimpsed: '반투명 헥스',
      pending: '채우기를 기다리는 위치',
      calibrated: '보정됨',
      overrides: '페이지 재정의',
      undo: '실행 취소 가능',
    },
    messages: {
      filled:
        '채우기가 완료되었습니다. 그려진 헥스: {created}. 스타일이 변경되었습니다: {restyled}. 숨겨진 위치: {icons}.',
      revealed: '공개된 헥스: {count}.',
      revealedPage: '페이지의 모든 헥스를 공개했습니다({count}).',
      confirmReset:
        '"{page}"의 모든 헥스({count})를 제거하시겠습니까? 위치 토큰은 토큰 레이어로 돌아갑니다. 이 작업은 실행 취소로 되돌릴 수 없습니다.',
      resetPage: '페이지에서 제거한 헥스: {count}.',
      undone:
        '마지막 채우기를 취소했습니다. 제거한 헥스: {removed}. 원래 스타일로 복원한 헥스: {restored}.',
      named: '"{name}"이라는 헥스: {count}.',
      unnamed: '지워진 이름: {count}.',
      marked:
        '기존 헥스 아래에 숨긴 위치: {attached}. 이 위치를 덮을 다음 채우기를 기다리는 위치: {pending}.',
      unmarked: '더 이상 위치가 아닌 토큰: {count}.',
      settingChanged: '{setting}이(가) {value}로 설정되었습니다.',
      rescanned:
        '재검색이 완료되었습니다. 유지됨: {kept}. 채택됨: {adopted}. 다시 제출됨: {moved}. 누락 및 잊혀짐: {dropped}. 다시 연결된 라벨: {labels}. 다시 연결된 위치 토큰: {icons}.',
      calibrated:
        '그리드가 보정되었습니다(열 단계 {colStep}px, 행 단계 {rowStep}px). 재스캔: {kept} 유지, {moved} 다시 제출, {adopted} 채택.',
      calibrationReset:
        '보정이 제거되었습니다. 재스캔: {kept} 유지, {moved} 다시 제출, {adopted} 채택.',
      journalRebuilt: '"{help}" 및 "{deck}" 유인물이 다시 작성되었습니다.',
      migrated:
        'Hexploration 1.x 헥스 지도가 업그레이드되었습니다. 이 게임이 Legacy 게임에서 복사된 경우 각 헥스 지도 페이지에서 다시 스캔을 실행하세요.',
      pruned:
        '더 이상 존재하지 않아 잊어버린 저장된 헥스: {dropped}. 이 게임이나 페이지를 복사했다면 해당 페이지에서 다시 스캔을 실행해 헥스를 다시 인식시키세요.',
      readyHint:
        '메뉴를 보려면 !hexploration을 입력하거나 "Hexploration - Command Deck" 유인물을 여세요.',
    },
    warnings: {
      foregroundUnavailable:
        '이 게임은 전경 레이어 그리기를 지원하지 않으므로 토큰 레이어에 육각형을 그렸습니다.',
      someFailed: '그릴 수 없는 육각형: {count}. 자세한 내용은 API 콘솔을 확인하세요.',
    },
    errors: {
      noPage: '작업할 페이지를 찾을 수 없습니다.',
      notHex: '이 페이지는 육각형 그리드를 사용하지 않습니다.',
      noPolygons: '채울 하나 이상의 그려진 도형을 선택합니다.',
      emptyArea: '선택한 영역에 헥스 중심이 하나도 없습니다.',
      tooMany: '그러면 한 번에 너무 많은 헥스가 생성됩니다({count}).',
      nothingToConceal: '숨길 그려진 모양이나 토큰을 선택하세요.',
      nothingToReveal: '공개할 육각형, 그려진 모양 또는 토큰을 선택하세요.',
      noTokens: '먼저 하나 이상의 토큰을 선택하세요.',
      noHexes: '먼저 하나 이상의 헥스(또는 헥스 위에 있는 토큰)를 선택하세요.',
      nothingToUndo: '실행 취소할 채우기가 없습니다.',
      unknownCommand: '알 수 없는 명령: {command}',
      unknownSetting: '알 수 없는 설정: {key}',
      unknownPageSetting: '페이지별로 설정할 수 있는 설정 : {keys}',
      invalidValue: '"{value}"은(는) {key}에 유효한 값이 아닙니다.',
      calibrateNeedsTokens: '육각형 중앙에 고정된 하나 또는 두 개의 토큰을 선택합니다.',
      calibrateFailed: '해당 토큰은 보정에 사용할 수 없습니다.',
      unexpected: '문제가 발생했습니다: {message}',
    },
    hints: {
      noPage: '작업하려는 페이지를 열거나 페이지에서 항목을 선택하세요.',
      notHex: '페이지 설정에서 페이지 격자를 Hex (V) 또는 Hex (H)로 설정하세요.',
      noPolygons:
        '영역 주위에 다각형, 직사각형, 타원 또는 자유형 모양을 그리고 선택한 다음 다시 시도하십시오.',
      emptyArea: '더 큰 도형을 그리거나 페이지 그리드 설정을 확인하세요.',
      tooMany: '더 작은 영역을 채우거나 영역을 여러 모양으로 분할합니다.',
      noHexes: '육각형은 전경 또는 토큰 레이어에 있습니다. 해당 레이어로 전환하여 선택하세요.',
      unknownCommand: '명령 목록을 보려면 !hexploration help를 입력하세요.',
      unknownSetting: '모든 설정을 보려면 !hexploration set를 입력하세요.',
      calibrateNeedsTokens:
        '토큰 하나를 헥스 중심에 스냅한 뒤 선택하세요. 같은 행(Hex V) 또는 열(Hex H)의 이웃한 헥스에 스냅한 두 번째 토큰도 선택하면 헥스 크기까지 보정합니다.',
      calibrateFailed:
        '두 토큰은 같은 행(Hex V) 또는 같은 열(Hex H)에 있어야 하며, 적어도 헥스 한 칸 이상 떨어져 있어야 합니다.',
      unexpected: '세부정보는 API 콘솔 로그에 있습니다.',
    },
    help: {
      menu: '메뉴를 보여주세요.',
      fill: '선택한 그려진 모양을 육각형으로 덮습니다.',
      fillInverse: '선택한 도형 내부를 제외하고 전체 페이지를 덮습니다.',
      undo: '마지막 채우기를 실행 취소하고, 채우기를 반전하거나 숨기고, 사용한 모양을 복원합니다.',
      reveal: '선택한 육각형과 선택한 모양 및 토큰 아래의 육각형을 표시합니다.',
      revealPage: '알림 없이 페이지의 모든 헥스를 공개합니다.',
      conceal: '선택한 모양과 토큰 아래 영역을 다시 헥스로 덮습니다.',
      explore: '선택한 토큰이 방금 그곳으로 이동한 것처럼 주변을 드러냅니다.',
      resetPage: '페이지의 모든 헥스를 제거합니다(먼저 확인합니다).',
      name: '선택한 헥스 또는 선택한 토큰 아래의 헥스의 이름을 지정합니다. 이름을 지우려면 이름을 비워 두세요.',
      mark: '선택한 토큰을 숨겨진 위치로 바꿉니다.',
      unmark: '선택한 토큰이 숨겨진 위치가 되는 것을 중지하세요.',
      set: '설정을 변경하거나 모든 설정을 표시합니다.',
      pageSet: '현재 페이지에서만 표시 설정을 재정의합니다.',
      pageClear: '현재 페이지의 재정의를 제거합니다.',
      rescan:
        '페이지의 헥스 목록을 다시 만듭니다. 예를 들어 페이지나 게임을 복사한 뒤에 사용합니다.',
      calibrate: '헥스 중심에 스냅된 토큰 한두 개를 선택해 헥스 격자를 맞춥니다.',
      calibrateReset: '현재 페이지의 보정을 제거합니다.',
      status: '현재 페이지에 대해 Hexploration이 알고 있는 내용을 보여줍니다.',
      journal: '도움말 및 Command Deck 유인물을 다시 만듭니다.',
      help: '이 목록을 보여주세요.',
      handout: '전체 지침은 "{name}" 유인물에 있습니다.',
    },
    deck: {
      drawDesc:
        '영역 주위에 도형을 그리고 선택한 다음 채웁니다. 채우기 취소는 마지막 채우기를 되돌립니다.',
      revealDesc:
        '헥스, 도형 또는 토큰을 선택해 공개하거나 다시 덮습니다. 탐색은 선택한 토큰이 그곳으로 막 이동한 것처럼 주변을 공개합니다.',
      locationsDesc:
        '토큰을 선택해 헥스 아래의 위치로 숨기세요. 헥스나 토큰을 선택해 헥스에 이름을 붙이세요.',
      toolsDesc: '설정, 페이지 재정의, 상태, 복사된 페이지 다시 스캔 및 그리드 보정.',
      footer: '전체 지침은 "{help}" 유인물을 참조하세요.',
    },
    handout: {
      versionLabel: '버전',
      subtitle: 'Roll20용 헥스 단위 탐험',
      footer: '원클릭 제어를 위해서는 "{deck}" 유인물을 사용하세요.',
      overview: {
        heading: '개요',
        body: 'Hexploration은 헥스 지도를 불투명한 헥스로 덮습니다. 파티가 이동하면 지나간 헥스(원하면 주변 헥스도)가 제거되어 지도가 한 헥스씩 드러납니다. 숨겨진 위치를 헥스 아래에 둘 수 있으며, 발견되면 알려줍니다. Jumpgate와 Legacy 게임 모두에서, 모든 크기의 Hex (V) 및 Hex (H) 그리드에서 작동합니다.',
        demo: '짧은 데모 보기(버전 1부터)',
      },
      quickStart: {
        heading: '빠른 시작',
        steps: [
          '격자가 Hex (V) 또는 Hex (H)로 설정된 페이지를 엽니다.',
          '숨길 영역 주위에 하나 이상의 도형(다각형, 직사각형, 타원 또는 자유형)을 그립니다.',
          '모양을 선택하고 Command Deck에서 채우기를 클릭합니다(또는 !hexploration fill 입력). 모양이 헥스로 바뀝니다.',
          '선택 사항: 채우기 전에 중요한 장소의 토큰을 선택하고 위치 표시를 클릭하세요. 토큰은 헥스 아래에 숨겨지고 발견되면 알려집니다.',
          '플레이어 토큰을 움직입니다. 토큰이 지나가는 모든 헥스와 시야 거리 안의 헥스가 공개됩니다.',
        ],
      },
      commands: {
        heading: '명령',
        intro:
          'GM만이 이 명령을 사용할 수 있습니다. 대부분은 선택한 개체에 작용합니다. 나머지는 현재 보고 있는 페이지에서 수행됩니다.',
        colCommand: '명령',
        colDesc: '기능',
      },
      revealing: {
        heading: '공개 작동 방식',
        points: [
          '토큰 레이어에 있는 토큰만 헥스를 공개합니다. 어떤 토큰이 해당되는지는 공개하는 토큰 설정으로 정합니다. 기본값은 플레이어 토큰이므로 GM은 지도를 드러내지 않고 몬스터를 움직일 수 있습니다.',
          '토큰은 해당 토큰이 포함하는 모든 헥스를 표시하며(큰 토큰은 여러 개를 포함) 경로를 따라 표시를 설정하면 웨이포인트를 포함하여 드래그된 경로의 모든 헥스를 표시합니다.',
          '시야 거리는 그 각 헥스 주변의 헥스를 가까운 것부터 공개합니다. 시선이 켜져 있으면, 헥스와 토큰 사이에 덮인 헥스가 있는 동안에는 그 헥스가 공개되지 않습니다. 보통 가까운 헥스가 먼저 공개되므로 탁 트인 지형에서는 시선이 아무것도 바꾸지 않습니다. 시야 거리가 2 이상이고, 헥스 공개 거리로 채운 지형처럼 계속 덮여 있는 헥스가 있을 때만 의미가 있습니다.',
          '헥스 공개 거리는 헥스를 채울 때 각 헥스에 저장되므로 채우기 전에 설정하세요. 나중에 바꿔도 이미 맵에 있는 헥스에는 영향을 주지 않습니다. 토큰이 얼마나 멀리 볼 수 있든, 헥스를 공개하려면 그 헥스 수 이내에 있어야 하며, 0이면 헥스에 들어가야만 공개됩니다. 산맥의 경우: 헥스 공개 거리를 0으로 설정하고 산을 채운 다음, 다시 없음으로 되돌리고 그 너머의 땅을 채우세요. 시야 거리 3에 시선을 켜면, 일행은 주변의 탁 트인 땅은 보지만 산이나 그 뒤에 있는 것은 보지 못합니다. 각 산 헥스는 토큰이 그 안으로 걸어 들어갈 때 공개됩니다.',
          '반투명 모드에서는 시야 안의 헥스가 사라지는 대신 비쳐 보이게 되며, 토큰이 들어가면 제거됩니다. 반투명이 된 헥스는 시선을 가리지 않습니다.',
          'Roll20은 토큰 이름, 막대, 오라를 헥스 위에 그립니다. 덮인 토큰 숨기기를 켜면 덮인 헥스 아래에 있는 토큰은 덮개가 벗겨질 때까지 플레이어에게 보이는 이름, 막대, 오라가 꺼지므로, 숨은 몬스터가 정체를 드러내지 않습니다. 토큰이 덮여 있는 동안 그중 하나를 켜면 숨겨진 상태로 유지되다가 덮개가 벗겨질 때 켜집니다.',
          'API는 다른 모드의 움직임을 보고하지 않습니다. TokenMod 이동은 자동으로 선택됩니다. 다른 모드의 경우 토큰을 선택하고 탐색을 클릭하거나 자신의 모드에서 Hexploration.revealAround(token)를 호출하세요.',
        ],
      },
      locations: {
        heading: '명명된 육각형 및 위치',
        points: [
          '위치 표시는 선택한 토큰을 숨겨진 위치로 바꿉니다. 이미 헥스 아래에 있는 토큰은 즉시 숨겨지고, 그렇지 않으면 그 토큰을 덮는 다음 채우기 때 숨겨집니다.',
          '흰색 타워 상태 표시가 있는 토큰도 버전 1에서와 같이 채우기 시 위치로 처리됩니다.',
          '숨겨진 위치 토큰은 GM 레이어로 이동됩니다. 헥스가 공개되면 이름이 표시된 토큰 레이어로 돌아가고 발견이 발표됩니다.',
          '헥스 이름 지정은 토큰 없이 헥스에 이름을 붙입니다. 이름은 GM 레이어에 라벨로 표시되어 GM에게 보이며, 헥스가 공개되면 발표됩니다.',
          '발견 알림은 모든 사람, GM만, 또는 아무도 알림을 보지 않을지 선택합니다. 발견 위치 핑은 플레이어의 시점도 해당 위치로 옮깁니다.',
        ],
      },
      settings: {
        heading: '설정',
        intro:
          '!hexploration set(또는 설정 버튼)으로 설정을 변경하세요. 헥스 레이어, 공개하는 토큰, 언어는 Mod 설정 페이지에서도 설정할 수 있습니다.',
        colKey: '열쇠',
        colName: '환경',
        colDesc: '설명',
        perPage: '(페이지별로 설정 가능합니다.)',
      },
      jumpgate: {
        heading: 'Jumpgate와 Legacy',
        points: [
          'Hexploration은 게임이 어떤 엔진을 사용하는지 알아내고 그에 맞는 모양을 그립니다. 어느 편집기에서 그린 도형이든 채울 수 있습니다.',
          '헥스 레이어를 자동으로 설정하면 헥스가 토큰 위의 전경 레이어에 그려지므로 플레이어는 그 아래에 무엇이 있는지 볼 수 없습니다. 전경 레이어를 사용할 수 없으면 대신 토큰 레이어를 사용합니다.',
          'Jumpgate는 수학적으로 정확한 정육각형 헥스를 그리므로 Legacy 헥스와 모양이 약간 다릅니다. 헥스가 페이지 격자와 맞지 않으면 토큰 하나를 헥스 중심에 스냅하고 선택한 뒤 보정을 클릭하세요. 같은 행(Hex V) 또는 열(Hex H)의 이웃한 헥스에 있는 토큰 두 개를 선택하면 헥스 크기까지 보정합니다.',
          '페이지나 게임이 복사되면 해당 헥스에 새 ID가 부여됩니다. 페이지에서 다시 스캔을 실행하여 이름 라벨 및 위치 토큰과 함께 다시 가져옵니다.',
        ],
      },
      upgrading: {
        heading: '버전 1에서 업그레이드',
        points: [
          '버전 2에는 더 이상 PathMath, MatrixMath, Vector Math 또는 HTML Builder가 필요하지 않습니다. 다른 모드에서 사용하지 않는 한 제거할 수 있습니다.',
          '기존 헥스 지도, 이름, 위치 토큰과 설정은 처음 시작할 때 자동으로 업그레이드됩니다.',
          'Hexploration_menu 매크로를 포함한 버전 1 명령은 여전히 작동합니다.',
          '버전 1에서는 캐릭터를 나타내는 토큰이면 무엇이든 헥스를 공개할 수 있었습니다. 이 동작을 유지하려면 공개하는 토큰을 캐릭터 토큰으로 설정하세요.',
        ],
        colV1: '버전 1 명령',
        colV2: '버전 2 명령',
      },
      troubleshooting: {
        heading: '문제 해결',
        points: [
          '토큰을 움직여도 아무 일도 일어나지 않음: 토큰이 토큰 레이어에 있고 공개하는 토큰 설정과 일치하는지, 페이지에 헥스가 있는지(!hexploration status) 확인하세요.',
          '헥스가 격자에서 어긋남: 보정을 사용한 다음, 지도 곳곳의 몇몇 헥스에 토큰을 놓아 확인하세요.',
          '페이지나 게임을 복사한 뒤 헥스가 더 이상 공개되지 않음: 해당 페이지에서 다시 스캔을 실행하세요.',
          '채우기에서 영역에 헥스 중심이 없다고 나옴: 모양 안에 적어도 헥스 하나의 중심이 들어 있어야 합니다.',
          '그 밖의 사항은 API 콘솔 로그를 확인하고 도움을 요청할 때 해당 메시지를 포함하세요.',
        ],
      },
      languages: {
        heading: '언어',
        body: '!hexploration set language로 언어를 선택하세요. 사용 가능한 언어:',
        colLanguage: '언어',
        colNative: '현지어 이름',
        colCode: '암호',
      },
      credits: {
        heading: '크레딧',
        original: '원본 모드 제작자',
        maintainer: '버전 2는 다음에 의해 유지 관리됩니다.',
        marketplace: 'Roll20 마켓플레이스의 Ada 아트 팩',
        support:
          '버그를 발견하거나 아이디어가 있는 경우 Roll20 Mod 포럼에 게시하거나 GitHub에서 문제를 열고 API 콘솔 로그의 메시지를 포함하세요.',
      },
    },
  };

  const TRANSLATION$7 = {
    titles: {
      ready: 'Hexploration jest gotowy.',
      settings: 'Ustawienia Hexploration',
      languages: 'Wybierz język',
      pageSettings: 'Ustawienia strony: {page}',
      status: 'Stan Hexploration: {page}',
      help: 'Polecenia Hexploration',
      confirm: 'Proszę potwierdzić',
    },
    discovery: {
      title: 'Odkryto lokalizację',
    },
    menu: {
      draw: 'Rysowanie',
      reveal: 'Odkrywanie i ukrywanie',
      locations: 'Lokalizacje',
      tools: 'Narzędzia',
      layerInUse: 'Warstwa, na której rysowane są nowe heksy: {layer}.',
      pageSettingsHelp:
        'Te ustawienia dotyczą tylko tej strony. Ustawienia oznaczone ★ zastępują ustawienia globalne.',
    },
    buttons: {
      fill: 'Wypełnij',
      fillInverse: 'Odwrotne wypełnienie',
      undo: 'Cofnij wypełnienie',
      reveal: 'Odkryj',
      conceal: 'Zakryj',
      explore: 'Eksploruj',
      revealPage: 'Odkryj stronę',
      resetPage: 'Zresetuj stronę',
      mark: 'Oznacz lokalizację',
      unmark: 'Usuń oznaczenie',
      name: 'Nazwij heks',
      settings: 'Ustawienia',
      pageSettings: 'Ustawienia strony',
      status: 'Status',
      rescan: 'Skanuj ponownie',
      calibrate: 'Kalibruj',
      calibrateReset: 'Zresetuj kalibrację',
      help: 'Pomoc',
      change: 'Zmień',
      menu: 'Menu',
      clearOverrides: 'Usuń nadpisania',
      confirmReset: 'Tak, usuń wszystkie heksy',
    },
    prompts: {
      name: 'Nazwa lokalizacji (pozostaw puste, aby wyczyścić)',
    },
    values: {
      on: 'Włączone',
      off: 'Wyłączone',
      none: 'Brak',
      hexLayer: {
        auto: 'Auto (pierwszy plan, jeśli jest dostępny)',
        foreground: 'warstwa pierwszego planu',
        objects: 'warstwa żetonów',
      },
      revealBy: {
        players: 'Żetony graczy',
        characters: 'Żetony postaci',
        all: 'Wszystkie żetony',
      },
      revealMode: {
        clear: 'Usuwanie',
        glimpse: 'Przebłysk',
      },
      announce: {
        all: 'Wszyscy',
        gm: 'Tylko MG',
        off: 'Wyłączone',
      },
      orientation: {
        vertical: 'Hex (V)',
        horizontal: 'Hex (H)',
      },
      fillKind: {
        fill: 'Wypełnij',
        fillInverse: 'Odwrotne wypełnienie',
        conceal: 'Zakryj',
      },
    },
    settings: {
      language: {
        label: 'Język',
        desc: 'Język menu, komunikatów i materiałów informacyjnych.',
      },
      hexLayer: {
        label: 'Warstwa heksagonów',
        desc: 'Gdzie rysowane są nowe heksy. Auto próbuje warstwy pierwszego planu (nad żetonami), a jeśli gra jej nie obsługuje, używa warstwy żetonów.',
      },
      fillColor: {
        label: 'Kolor wypełnienia',
        desc: 'Kolor nowych heksów. Użyj rgba() dla przezroczystych heksów, na przykład rgba(0,0,0,0.8).',
      },
      strokeColor: {
        label: 'Kolor obramowania',
        desc: 'Kolor konturu nowych heksów.',
      },
      labelColor: {
        label: 'Kolor etykiety',
        desc: 'Kolor etykiet z nazwami tylko dla GM na nazwanych heksach.',
      },
      glimpseColor: {
        label: 'Kolor przebłysku',
        desc: 'Kolor, jaki przyjmują heksy objęte przebłyskiem (tryb odkrywania Przebłysk). Użyj przezroczystego koloru rgba().',
      },
      strokeWidth: {
        label: 'Szerokość obramowania',
        desc: 'Szerokość konturu nowych heksów w pikselach (0 do 20).',
      },
      maxDistance: {
        label: 'Odległość odkrywania heksagonów',
        desc: 'Zapisywana na heksach w chwili ich wypełniania, więc ustaw ją przed wypełnianiem: późniejsza zmiana nie wpływa na heksy, które już są na mapie. Żeton musi znajdować się w obrębie tylu heksów, aby je odkryć, niezależnie od tego, jak daleko widzi; przy 0 odkrywa się je tylko przez wejście na nie. Używaj jej dla gór lub lasów. Pozostaw puste, aby nie było ograniczenia.',
      },
      revealDistance: {
        label: 'Zasięg wzroku',
        desc: 'Ile heksów wokół poruszającego się żetonu zostało odkrytych (od 0 do 20). 0 ujawnia tylko heksy, przez które przechodzi żeton.',
      },
      lineOfSight: {
        label: 'Linia wzroku',
        desc: 'Kiedy jest włączone, heksy, które pozostają zakryte, np. góry wypełnione przy ustawieniu „Odległość odkrywania heksagonów”, zasłaniają heksy za nimi. Ma to znaczenie tylko wtedy, gdy „Zasięg wzroku” wynosi 2 lub więcej.',
      },
      revealPath: {
        label: 'Odkrywaj wzdłuż ścieżki',
        desc: 'Kiedy jest włączone, odkrywane jest każde pole, przez które przechodzi żeton podczas przeciągania (w tym punkty orientacyjne), a nie tylko miejsce, w którym się zatrzymuje.',
      },
      revealBy: {
        label: 'Żetony odkrywające',
        desc: 'Które żetony na warstwie żetonów odsłaniają heksy: żetony kontrolowane przez gracza, żetony reprezentujące dowolną postać lub każdy żeton.',
      },
      revealMode: {
        label: 'Tryb odkrywania',
        desc: 'Usuwanie usuwa heksy w zasięgu wzroku. Przebłysk zamiast tego czyni je przezroczystymi; są usuwane, gdy wejdzie na nie żeton.',
      },
      announce: {
        label: 'Ogłaszaj odkrycia',
        desc: 'Kto widzi wiadomość na czacie po odkryciu nazwanej lokalizacji.',
      },
      pingDiscoveries: {
        label: 'Pinguj odkrycia',
        desc: 'Gdy ta opcja jest włączona, gracze są wysyłani sygnałem ping do nazwanej lokalizacji po jej wykryciu.',
      },
      hideCoveredTokens: {
        label: 'Ukrywaj zakryte żetony',
        desc: 'Roll20 rysuje nazwy, słupki i aury nad heksami. Kiedy jest włączone, żetony pod zakrytym heksem mają widoczną dla gracza nazwę, paski i aury wyłączone i włączane ponownie, gdy zostaną odkryte.',
      },
    },
    status: {
      engine: 'Silnik gry',
      grid: 'Siatka',
      layer: 'Warstwa heksagonów',
      hexes: 'Heksy',
      named: 'Nazwane heksy',
      icons: 'Żetony lokalizacji',
      glimpsed: 'Heksy w przebłysku',
      pending: 'Lokalizacje czekające na wypełnienie',
      calibrated: 'Skalibrowano',
      overrides: 'Nadpisania strony',
      undo: 'Można cofnąć',
    },
    messages: {
      filled:
        'Wypełnienie zakończone. Wylosowane heksy: {created}. Zmiana stylu: {restyled}. Ukryte lokalizacje: {icons}.',
      revealed: 'Ujawnione heksy: {count}.',
      revealedPage: 'Każdy odkryty heks na stronie ({count}).',
      confirmReset:
        'Usunąć wszystkie heksy z „{page}” ({count})? Żetony lokalizacji wracają na warstwę żetonów. Opcja Cofnij nie może tego odwrócić.',
      resetPage: 'Heksy usunięte ze strony: {count}.',
      undone:
        'Ostatnie wypełnienie nie zostało wykonane. Usunięte heksy: {removed}. Przywrócono nowe heksy: {restored}.',
      named: 'Heksy o nazwie „{name}”: {count}.',
      unnamed: 'Nazwy zostały usunięte: {count}.',
      marked:
        'Lokalizacje ukryte na istniejących heksach: {attached}. Czekam na następne wypełnienie, które je obejmuje: {pending}.',
      unmarked: 'Tokeny, które nie są już lokalizacjami: {count}.',
      settingChanged: '{setting} ustawiony na {value}.',
      rescanned:
        'Ponowne skanowanie zakończone. Zachowane: {kept}. Przyjęto: {adopted}. Zgłoszono ponownie: {moved}. Zaginione i zapomniane: {dropped}. Etykiety ponownie połączone: {labels}. Połączono ponownie tokeny lokalizacji: {icons}.',
      calibrated:
        'Skalibrowano siatkę (krok kolumny {colStep}px, krok wiersza {rowStep}px). Ponowne skanowanie: zachowane {kept}, ponownie złożone {moved}, przyjęte {adopted}.',
      calibrationReset:
        'Kalibracja usunięta. Ponowne skanowanie: zachowane {kept}, ponownie przesłane {moved}, przyjęte {adopted}.',
      journalRebuilt: 'Przebudowano materiały informacyjne „{help}” i „{deck}”.',
      migrated:
        'Twoje mapy heksowe z Hexploration 1.x zostały zaktualizowane. Jeśli ta gra została skopiowana z gry Legacy, uruchom „Skanuj ponownie” na każdej stronie z mapą heksową.',
      pruned:
        'Zapisane heksy, które już nie istnieją i zostały zapomniane: {dropped}. Jeśli ta gra lub strona została skopiowana, uruchom „Skanuj ponownie” na stronie, aby ponownie odnaleźć jej heksy.',
      readyHint:
        'Wpisz !hexploration, aby otworzyć menu, lub otwórz materiał informacyjny "Hexploration - Command Deck".',
    },
    warnings: {
      foregroundUnavailable:
        'Ta gra nie obsługuje rysowania na warstwie pierwszego planu, więc heksy zostały narysowane na warstwie żetonów.',
      someFailed:
        'Heksy, których nie można narysować: {count}. Aby uzyskać szczegółowe informacje, sprawdź konsolę API.',
    },
    errors: {
      noPage: 'Nie udało się znaleźć strony, nad którą można pracować.',
      notHex: 'Ta strona nie używa siatki heksowej.',
      noPolygons: 'Wybierz jeden lub więcej narysowanych kształtów do wypełnienia.',
      emptyArea: 'Zaznaczony obszar nie zawiera żadnych środków heksów.',
      tooMany: 'Spowodowałoby to utworzenie zbyt wielu heksów za jednym razem ({count}).',
      nothingToConceal: 'Wybierz narysowane kształty lub żetony do ukrycia.',
      nothingToReveal: 'Wybierz heksy, narysowane kształty lub żetony do odsłonięcia.',
      noTokens: 'Najpierw wybierz jeden lub więcej tokenów.',
      noHexes: 'Najpierw wybierz jeden lub więcej heksów (lub żetonów stojących na heksach).',
      nothingToUndo: 'Nie ma wypełnienia, które można cofnąć.',
      unknownCommand: 'Nieznane polecenie: {command}',
      unknownSetting: 'Nieznane ustawienie: {key}',
      unknownPageSetting: 'Ustawienia, które można ustawić na stronie: {keys}',
      invalidValue: '„{value}” nie jest prawidłową wartością dla {key}.',
      calibrateNeedsTokens: 'Wybierz jeden lub dwa żetony przyciągnięte do środków heksów.',
      calibrateFailed: 'Tych tokenów nie można używać do kalibracji.',
      unexpected: 'Coś poszło nie tak: {message}',
    },
    hints: {
      noPage: 'Otwórz stronę, nad którą chcesz pracować, lub wybierz coś na niej.',
      notHex: 'Ustaw siatkę strony na Hex (V) lub Hex (H) w Ustawieniach strony.',
      noPolygons:
        'Narysuj wielokąt, prostokąt, elipsę lub odręczny kształt wokół obszaru, zaznacz go i spróbuj ponownie.',
      emptyArea: 'Narysuj większy kształt lub sprawdź ustawienia siatki strony.',
      tooMany: 'Wypełnij mniejszy obszar lub podziel obszar na kilka kształtów.',
      noHexes:
        'Heksy znajdują się na pierwszym planie lub w warstwie żetonów; przejdź do tej warstwy, aby je wybrać.',
      unknownCommand: 'Wpisz !hexploration help, aby wyświetlić listę poleceń.',
      unknownSetting: 'Wpisz !hexploration set, aby zobaczyć wszystkie ustawienia.',
      calibrateNeedsTokens:
        'Przyciągnij żeton do środka heksa i wybierz go. Wybierz drugi żeton przyciągnięty do sąsiedniego heksu w tym samym rzędzie (Hex V) lub kolumnie (Hex H), aby również skorygować rozmiar heksa.',
      calibrateFailed:
        'Dwa żetony muszą znajdować się w tym samym rzędzie (Hex V) lub w tej samej kolumnie (Hex H), w odległości co najmniej jednego heksa od siebie.',
      unexpected: 'Szczegóły znajdują się w dzienniku konsoli API.',
    },
    help: {
      menu: 'Pokaż menu.',
      fill: 'Zakryj wybrane narysowane kształty heksami.',
      fillInverse: 'Zakryj całą stronę z wyjątkiem wnętrza wybranych kształtów.',
      undo: 'Cofnij ostatnie wypełnienie, odwróć wypełnienie lub ukryj i przywróć używane kształty.',
      reveal: 'Odsłoń wybrane heksy oraz heksy pod wybranymi kształtami i żetonami.',
      revealPage: 'Odkryj każdy heks na stronie bez ogłoszeń.',
      conceal: 'Ponownie zakryj obszar pod wybranymi kształtami i żetonami heksami.',
      explore: 'Odsłoń wokół wybranych żetonów tak, jakby właśnie się tam przesunęły.',
      resetPage: 'Usuń wszystkie heksy na stronie (najpierw pyta).',
      name: 'Nazwij wybrane heksy lub heksy pod wybranymi żetonami. Pozostaw nazwę pustą, aby ją wyczyścić.',
      mark: 'Zamień wybrane żetony w ukryte lokalizacje.',
      unmark: 'Spraw, by zaznaczone żetony przestały być ukrytymi lokalizacjami.',
      set: 'Zmień ustawienie lub pokaż wszystkie ustawienia.',
      pageSet: 'Zastąp ustawienie odkrywania tylko na bieżącej stronie.',
      pageClear: 'Usuń zastąpienia bieżącej strony.',
      rescan: 'Odbuduj listę heksów strony, na przykład po skopiowaniu strony lub gry.',
      calibrate:
        'Wyrównaj siatkę heksów jednym lub dwoma wybranymi żetonami przyczepionymi do środków heksów.',
      calibrateReset: 'Usuń kalibrację bieżącej strony.',
      status: 'Pokaż, co Hexploration wie o bieżącej stronie.',
      journal: 'Odbuduj materiały informacyjne „Pomoc” i „Command Deck”.',
      help: 'Pokaż tę listę.',
      handout: 'Pełne instrukcje znajdują się w ulotce „{name}”.',
    },
    deck: {
      drawDesc:
        'Narysuj kształty wokół obszaru, zaznacz je, a następnie wypełnij. Cofnij odwraca ostatnie wypełnienie.',
      revealDesc:
        'Zaznacz heksy, kształty lub żetony, aby je odkryć lub ponownie zakryć. „Eksploruj” odkrywa okolicę zaznaczonych żetonów, jakby właśnie się przesunęły.',
      locationsDesc:
        'Wybierz żetony, aby ukryć je jako lokalizacje pod heksami. Wybierz heksy lub żetony, aby nazwać heks.',
      toolsDesc:
        'Ustawienia, nadpisania stron, status, ponowne skanowanie skopiowanych stron i kalibracja siatki.',
      footer: 'Pełne instrukcje znajdziesz w ulotce „{help}”.',
    },
    handout: {
      versionLabel: 'Wersja',
      subtitle: 'Eksploracja heks po heksie dla Roll20',
      footer:
        'Skorzystaj z materiałów informacyjnych „{deck}”, aby uzyskać informacje na temat elementów sterujących jednym kliknięciem.',
      overview: {
        heading: 'Przegląd',
        body: 'Heksploracja obejmuje mapę heksów nieprzezroczystymi heksami. Gdy drużyna się porusza, heksy, przez które przechodzi (oraz, jeśli wolisz, heksy wokół niej) są usuwane, więc mapa jest odkrywana heks po heksie. Ukryte lokalizacje można umieszczać pod heksami i ogłaszać je po ich znalezieniu. Działa w grach Jumpgate i Legacy, na siatkach Hex (V) i Hex (H) o dowolnym rozmiarze.',
        demo: 'Obejrzyj krótkie demo (od wersji 1)',
      },
      quickStart: {
        heading: 'Szybki start',
        steps: [
          'Otwórz stronę, której siatka jest ustawiona na Hex (V) lub Hex (H).',
          'Narysuj jeden lub więcej kształtów (wielokąt, prostokąt, elipsa lub odręcznie) wokół obszaru, który chcesz ukryć.',
          'Zaznacz kształty i kliknij „Wypełnij” w Command Deck (lub wpisz !hexploration fill). Kształty zostaną zastąpione heksami.',
          'Opcjonalnie: przed wypełnieniem zaznacz żetony ważnych miejsc i kliknij „Oznacz lokalizację”. Zostaną ukryte pod heksami i ogłoszone po odkryciu.',
          'Przesuń żeton gracza. Każdy heks, przez który przejdzie, oraz heksy w jego zasięgu wzroku (ustawienie „Zasięg wzroku”) zostaną odkryte.',
        ],
      },
      commands: {
        heading: 'Polecenia',
        intro:
          'Tylko MG mogą używać tych poleceń. Większość działa na wybrane obiekty; reszta działa na stronie, którą przeglądasz.',
        colCommand: 'Polecenie',
        colDesc: 'Co to robi',
      },
      revealing: {
        heading: 'Jak działa odkrywanie',
        points: [
          'Heksy odkrywają tylko żetony na warstwie żetonów. To, które żetony się liczą, określa ustawienie „Żetony odkrywające”: domyślnie żetony graczy, więc MG może przesuwać potwory bez odkrywania mapy.',
          'Żeton odkrywa każdy heks, który zajmuje (duże żetony zajmują kilka), a przy włączonej opcji „Odkrywaj wzdłuż ścieżki” także każdy heks na trasie, po której był przeciągany, łącznie z punktami pośrednimi.',
          '„Zasięg wzroku” odkrywa heksy wokół każdego z tych heksów, zaczynając od najbliższych. Gdy „Linia wzroku” jest włączona, heks nie zostaje odkryty, dopóki między nim a żetonem leży zakryty heks. Bliższe heksy są zwykle odkrywane jako pierwsze, więc na otwartym terenie „Linia wzroku” niczego nie zmienia: ma znaczenie tylko wtedy, gdy „Zasięg wzroku” wynosi 2 lub więcej i istnieją heksy, które pozostają zakryte, np. teren wypełniony przy ustawieniu „Odległość odkrywania heksagonów”.',
          '„Odległość odkrywania heksagonów” jest zapisywana na każdym heksie w chwili jego wypełniania, więc ustaw ją przed wypełnianiem; późniejsza zmiana nie wpływa na heksy, które już są na mapie. Żeton musi znajdować się w obrębie tylu heksów, aby je odkryć, niezależnie od tego, jak daleko widzi, a przy 0 odkrywa się je tylko przez wejście na nie. Dla pasma górskiego: ustaw „Odległość odkrywania heksagonów” na 0, wypełnij góry, ponownie wyczyść tę wartość (bez limitu), a potem wypełnij teren za nimi. Gdy „Zasięg wzroku” wynosi 3, a „Linia wzroku” jest włączona, drużyna widzi otwarty teren wokół siebie, ale nie góry ani to, co leży za nimi. Każdy heks górski zostaje odkryty, gdy wejdzie na niego żeton.',
          'W trybie Przebłysk heksy w zasięgu wzroku stają się przezroczyste zamiast znikać i są usuwane, gdy wejdzie na nie żeton. Heksy widziane w trybie Przebłysk nie zasłaniają widoku przy włączonej opcji „Linia wzroku”.',
          'Roll20 rysuje nazwy, paski i aury żetonów nad heksami. Przy włączonej opcji „Ukrywaj zakryte żetony” żeton pod zakrytym heksem ma wyłączone widoczne dla graczy nazwę, paski i aury, dopóki nie zostanie odkryty, więc ukryte potwory się nie zdradzą. Jeśli włączysz któryś z tych elementów, gdy żeton jest zakryty, pozostanie on ukryty i zostanie włączony po odkryciu żetonu.',
          'API nie zgłasza ruchów wykonanych przez inne mody. Ruchy TokenMod są wychwytywane automatycznie; w przypadku innych modów zaznacz żetony i kliknij „Eksploruj” albo wywołaj Hexploration.revealAround(token) z własnego moda.',
        ],
      },
      locations: {
        heading: 'Nazwane heksy i lokalizacje',
        points: [
          'Oznacz lokalizację zamienia wybrane żetony w ukryte lokalizacje. Żeton znajdujący się już pod heksem jest natychmiast ukrywany; w przeciwnym razie zostanie ukryty przez następne wypełnienie, które je zakrywa.',
          'Żetony ze znacznikiem stanu białej wieży są również traktowane jako lokalizacje podczas zapełniania, tak jak w wersji 1.',
          'Żetony ukrytych lokalizacji są przenoszone na warstwę GM. Kiedy ich heks zostanie odkryty, wracają na warstwę żetonów z pokazaną nazwą i ogłaszają swoje odkrycie.',
          '„Nazwij heks” nadaje heksowi nazwę bez żetonu. Nazwa jest pokazywana MG jako etykieta na warstwie MG i ogłaszana, gdy heks zostanie odkryty.',
          '„Ogłaszaj odkrycia” określa, czy ogłoszenie widzą wszyscy, tylko MG, czy nikt. „Pinguj odkrycia” dodatkowo przenosi widok graczy na lokalizację.',
        ],
      },
      settings: {
        heading: 'Ustawienia',
        intro:
          'Zmieniaj ustawienia poleceniem !hexploration set (lub przyciskiem Ustawienia). „Warstwa heksagonów”, „Żetony odkrywające” i „Język” można też ustawić na stronie ustawień moda.',
        colKey: 'Klucz',
        colName: 'Ustawienie',
        colDesc: 'Opis',
        perPage: '(Można ustawić na stronę.)',
      },
      jumpgate: {
        heading: 'Jumpgate i Dziedzictwo',
        points: [
          'Heexploration sprawdza, z jakiego silnika korzysta gra, i rysuje odpowiedni kształt. Kształty narysowane w dowolnym edytorze można wypełnić.',
          'Gdy „Warstwa heksagonów” jest ustawiona na Auto, heksy są rysowane na warstwie pierwszego planu, nad żetonami, więc gracze nie widzą, co jest pod spodem. Jeśli warstwa pierwszego planu jest niedostępna, używana jest warstwa żetonów.',
          'Jumpgate rysuje matematycznie regularne heksy, które mają nieco inny kształt niż heksy Legacy. Jeśli heksy nie pokrywają się z siatką strony, przyciągnij żeton do środka heksu, zaznacz go i kliknij „Kalibruj”. Zaznacz dwa żetony na sąsiednich heksach tego samego rzędu (Hex V) lub kolumny (Hex H), aby skorygować także rozmiar heksu.',
          'Po skopiowaniu strony lub gry jej heksy otrzymują nowe identyfikatory. Uruchom „Skanuj ponownie” na stronie, aby ponownie je odnaleźć wraz z etykietami nazw i żetonami lokalizacji.',
        ],
      },
      upgrading: {
        heading: 'Aktualizacja z wersji 1',
        points: [
          'Wersja 2 nie potrzebuje już PathMath, MatrixMath, Vector Math ani HTML Builder. Możesz je usunąć, chyba że użyje ich inny mod.',
          'Istniejące mapy heksów, nazwy, tokeny lokalizacji i ustawienia są aktualizowane automatycznie przy pierwszym uruchomieniu.',
          'Polecenia wersji 1, w tym makro Hexploration_menu, nadal działają.',
          'W wersji 1 heksy mógł odkrywać każdy żeton reprezentujący postać. Aby zachować to zachowanie, ustaw „Żetony odkrywające” na „Żetony postaci”.',
        ],
        colV1: 'Polecenie wersji 1',
        colV2: 'Polecenie wersji 2',
      },
      troubleshooting: {
        heading: 'Rozwiązywanie problemów',
        points: [
          'Nic się nie dzieje, gdy żeton się porusza: sprawdź, czy żeton jest na warstwie żetonów i pasuje do ustawienia „Żetony odkrywające” oraz czy strona ma heksy (!hexploration status).',
          'Heksy są przesunięte względem siatki: użyj opcji Kalibruj, a następnie sprawdź za pomocą żetonu na kilku heksach na mapie.',
          'Heksy przestały się odkrywać po skopiowaniu strony lub gry: uruchom „Skanuj ponownie” na stronie.',
          '„Wypełnij” zgłasza, że obszar nie zawiera środków heksów: kształt musi zawierać środek co najmniej jednego heksu.',
          'W innych przypadkach sprawdź dziennik konsoli API i dołącz zawarte w nim komunikaty, prosząc o pomoc.',
        ],
      },
      languages: {
        heading: 'Języki',
        body: 'Wybierz język poleceniem !hexploration set language. Dostępne języki:',
        colLanguage: 'Język',
        colNative: 'Nazwa rodzima',
        colCode: 'Kod',
      },
      credits: {
        heading: 'Kredyty',
        original: 'Oryginalny mod autorstwa',
        maintainer: 'Wersja 2 obsługiwana przez',
        marketplace: 'Pakiety grafik Ady na Roll20 Marketplace',
        support:
          'Jeśli znajdziesz błąd lub masz pomysł, opublikuj post na forum Roll20 Mod lub otwórz problem w GitHub i dołącz wszelkie komunikaty z dziennika konsoli API.',
      },
    },
  };

  const TRANSLATION$6 = {
    titles: {
      ready: 'O Hexploration está pronto.',
      settings: 'Definições do Hexploration',
      languages: 'Escolha um idioma',
      pageSettings: 'Definições da página: {page}',
      status: 'Estado do Hexploration: {page}',
      help: 'Comandos do Hexploration',
      confirm: 'Por favor, confirme',
    },
    discovery: {
      title: 'Local descoberto',
    },
    menu: {
      draw: 'Desenhar',
      reveal: 'Revelar e ocultar',
      locations: 'Locais',
      tools: 'Ferramentas',
      layerInUse: 'Os novos hexágonos estão a ser desenhados na {layer}.',
      pageSettingsHelp:
        'Estas definições aplicam-se somente a esta página. As definições marcadas com ★ substituem as definições globais.',
    },
    buttons: {
      fill: 'Preencher',
      fillInverse: 'Preenchimento inverso',
      undo: 'Desfazer preenchimento',
      reveal: 'Revelar',
      conceal: 'Ocultar',
      explore: 'Explorar',
      revealPage: 'Revelar página',
      resetPage: 'Redefinir página',
      mark: 'Marcar local',
      unmark: 'Desmarcar',
      name: 'Nomear hexágono',
      settings: 'Definições',
      pageSettings: 'Definições da página',
      status: 'Estado',
      rescan: 'Reanalisar',
      calibrate: 'Calibrar',
      calibrateReset: 'Redefinir calibração',
      help: 'Ajuda',
      change: 'Alterar',
      menu: 'Menu',
      clearOverrides: 'Limpar substituições',
      confirmReset: 'Sim, remover todos os hexágonos',
    },
    prompts: {
      name: 'Nome do local (deixar em branco para limpar)',
    },
    values: {
      on: 'Ligado',
      off: 'Desligado',
      none: 'Nenhum',
      hexLayer: {
        auto: 'Automático (primeiro plano, se disponível)',
        foreground: 'camada de primeiro plano',
        objects: 'camada de fichas',
      },
      revealBy: {
        players: 'Fichas de jogador',
        characters: 'Fichas de personagem',
        all: 'Todas as fichas',
      },
      revealMode: {
        clear: 'Limpar',
        glimpse: 'Vislumbre',
      },
      announce: {
        all: 'Toda a gente',
        gm: 'Apenas o GM',
        off: 'Desligado',
      },
      orientation: {
        vertical: 'Hex (V)',
        horizontal: 'Hex (H)',
      },
      fillKind: {
        fill: 'Preencher',
        fillInverse: 'Preenchimento inverso',
        conceal: 'Ocultar',
      },
    },
    settings: {
      language: {
        label: 'Idioma',
        desc: 'Idioma para menus, mensagens e folhetos.',
      },
      hexLayer: {
        label: 'Camada dos hexágonos',
        desc: 'Onde são desenhados os novos hexágonos. Automático tenta a camada de primeiro plano (acima das fichas) e recorre à camada de fichas se o jogo não a suportar.',
      },
      fillColor: {
        label: 'Cor de preenchimento',
        desc: 'Cor dos novos hexágonos. Utilize rgba() para hexágonos transparentes, por exemplo rgba(0,0,0,0.8).',
      },
      strokeColor: {
        label: 'Cor da borda',
        desc: 'Cor do contorno dos novos hexágonos.',
      },
      labelColor: {
        label: 'Cor da etiqueta',
        desc: 'Cor dos rótulos de nomes exclusivos do GM em hexágonos nomeados.',
      },
      glimpseColor: {
        label: 'Cor do vislumbre',
        desc: 'Cor que os hexágonos assumem quando vislumbrados (modo de revelação Vislumbre). Utilize uma cor rgba() transparente.',
      },
      strokeWidth: {
        label: 'Largura da borda',
        desc: 'Largura do contorno dos novos hexágonos, em pixéis (0 a 20).',
      },
      maxDistance: {
        label: 'Distância de revelação dos hexágonos',
        desc: 'Guardada nos hexágonos quando são preenchidos, por isso defina-a antes de preencher: alterá-la depois não afeta os hexágonos que já estão no mapa. Uma ficha tem de estar a, no máximo, este número de hexágonos para os revelar, por mais longe que consiga ver; com 0, só são revelados quando se entra neles. Utilize-a para montanhas ou florestas. Deixe em branco para não haver limite.',
      },
      revealDistance: {
        label: 'Distância de visão',
        desc: 'Quantos hexágonos em redor de uma ficha em movimento são revelados (0 a 20). 0 revela apenas os hexágonos pelos quais o token passa.',
      },
      lineOfSight: {
        label: 'Linha de visão',
        desc: 'Quando ativado, os hexágonos que continuam cobertos, como montanhas preenchidas com uma Distância de revelação dos hexágonos, escondem os hexágonos que estão por trás deles. Só faz diferença com uma Distância de visão de 2 ou mais.',
      },
      revealPath: {
        label: 'Revelar ao longo do percurso',
        desc: 'Quando ativado, cada hexágono que uma ficha passa enquanto é arrastada (incluindo pontos de passagem) é revelado, e não apenas onde pára.',
      },
      revealBy: {
        label: 'Fichas que revelam',
        desc: 'Quais as fichas na camada de fichas que revelam hexágonos: fichas controladas por um jogador, fichas que representam qualquer personagem ou todas as fichas.',
      },
      revealMode: {
        label: 'Modo de revelação',
        desc: 'Limpar remove os hexágonos à vista. Vislumbre torna-os transparentes; são removidos quando uma ficha entra neles.',
      },
      announce: {
        label: 'Anunciar descobertas',
        desc: 'Quem vê a mensagem do chat quando um local nomeado é descoberto.',
      },
      pingDiscoveries: {
        label: 'Pingar descobertas',
        desc: 'Quando ativado, os jogadores recebem um ping para um local nomeado quando este é descoberto.',
      },
      hideCoveredTokens: {
        label: 'Ocultar fichas cobertas',
        desc: 'Roll20 desenha nomes, barras e auras por cima dos hexágonos. Quando ativado, os tokens sob um hexágono coberto têm o seu nome, barras e auras visíveis para o jogador desligados e ligados novamente quando são descobertos.',
      },
    },
    status: {
      engine: 'Motor de jogo',
      grid: 'Grelha',
      layer: 'Camada dos hexágonos',
      hexes: 'Hexágonos',
      named: 'Hexágonos nomeados',
      icons: 'Fichas de local',
      glimpsed: 'Hexágonos vislumbrados',
      pending: 'Locais a aguardar preenchimento',
      calibrated: 'Calibrado',
      overrides: 'Substituições da página',
      undo: 'Desfazer disponível',
    },
    messages: {
      filled:
        'Preenchimento completo. Hexágonos desenhados: {created}. Reestilizado: {restyled}. Locais escondidos: {icons}.',
      revealed: 'Feitiços revelados: {count}.',
      revealedPage: 'Cada hexágono da página revelado ({count}).',
      confirmReset:
        'Remover todos os hexágonos de "{page}" ({count})? As fichas de localização regressam à camada de fichas. Esta ação não pode ser revertida com Desfazer.',
      resetPage: 'Hexágonos removidos da página: {count}.',
      undone:
        'Último preenchimento desfeito. Hexágonos removidos: {removed}. Hexágonos reestilizados restaurados: {restored}.',
      named: 'Hexágonos denominados "{name}": {count}.',
      unnamed: 'Nomes apagados: {count}.',
      marked:
        'Locais escondidos em hexágonos existentes: {attached}. Aguardam o próximo enchimento que os cobre: ​​​​{pending}.',
      unmarked: 'Tokens que já não são locais: {count}.',
      settingChanged: '{setting} definido como {value}.',
      rescanned:
        'Nova verificação concluída. Mantido: {kept}. Adoptado: {adopted}. Arquivado novamente: {moved}. Ausente e esquecido: {dropped}. Rótulos novamente ligados: {labels}. Tokens de localização novamente ligados: {icons}.',
      calibrated:
        'Grelha calibrada (etapa de coluna {colStep}px, etapa de linha {rowStep}px). Nova análise: mantido {kept}, arquivado novamente {moved}, adotado {adopted}.',
      calibrationReset:
        'Calibração removida. Nova análise: mantido {kept}, arquivado novamente {moved}, adotado {adopted}.',
      journalRebuilt: 'Os folhetos "{help}" e "{deck}" foram reconstruídos.',
      migrated:
        'Os seus mapas de hexágonos do Hexploration 1.x foram atualizados. Se este jogo foi copiado de um jogo Legacy, execute Reanalisar em cada página com mapa de hexágonos.',
      pruned:
        'Hexágonos guardados que já não existem e foram esquecidos: {dropped}. Se este jogo ou página tiver sido copiado, execute Reanalisar na página para recuperar os seus hexágonos.',
      readyHint:
        'Escreva !hexploration para abrir o menu ou abra o folheto "Hexploration - Command Deck".',
    },
    warnings: {
      foregroundUnavailable:
        'Este jogo não suporta o desenho na camada de primeiro plano, pelo que foram desenhados hexágonos na camada de tokens.',
      someFailed:
        'Hexágonos que não puderam ser desenhados: {count}. Verifique a consola da API para obter detalhes.',
    },
    errors: {
      noPage: 'Não foi possível encontrar a página para trabalhar.',
      notHex: 'Esta página não utiliza uma grelha hexagonal.',
      noPolygons: 'Selecione uma ou mais formas desenhadas para preencher.',
      emptyArea: 'A área selecionada não contém nenhum centro de hexágono.',
      tooMany: 'Isto criaria muitos hexágonos de uma só vez ({count}).',
      nothingToConceal: 'Selecione formas desenhadas ou fichas para ocultar.',
      nothingToReveal: 'Selecione hexágonos, formas desenhadas ou fichas para revelar.',
      noTokens: 'Selecione primeiro um ou mais tokens.',
      noHexes: 'Selecione primeiro um ou mais hexágonos (ou fichas sobre hexágonos).',
      nothingToUndo: 'Não há enchimento para desfazer.',
      unknownCommand: 'Comando desconhecido: {command}',
      unknownSetting: 'Configuração desconhecida: {key}',
      unknownPageSetting: 'Configurações que podem ser definidas por página: {keys}',
      invalidValue: '"{value}" não é um valor válido para {key}.',
      calibrateNeedsTokens: 'Selecione uma ou duas fichas encaixadas em centros de hexágonos.',
      calibrateFailed: 'Estes tokens não podem ser utilizados para calibrar.',
      unexpected: 'Algo correu mal: {message}',
    },
    hints: {
      noPage: 'Abra a página na qual pretende trabalhar ou selecione algo da mesma.',
      notHex: 'Defina a grelha da página para Hex (V) ou Hex (H) nas Definições da página.',
      noPolygons:
        'Desenhe um polígono, retângulo, elipse ou forma à mão livre à volta da área, selecione-o e tente novamente.',
      emptyArea: 'Desenhe uma forma maior ou verifique as definições da grelha da página.',
      tooMany: 'Preencha uma área mais pequena ou divida a área em várias formas.',
      noHexes:
        'Os hexágonos estão no primeiro plano ou na camada de tokens; mude para essa camada para os selecionar.',
      unknownCommand: 'Introduza !hexploration help para listar os comandos.',
      unknownSetting: 'Digite !hexploration set para ver todas as definições.',
      calibrateNeedsTokens:
        'Encaixe uma ficha no centro de um hexágono e selecione-a. Selecione uma segunda ficha encaixada num hexágono vizinho na mesma linha (Hex V) ou coluna (Hex H) para corrigir também o tamanho do hexágono.',
      calibrateFailed:
        'As duas fichas têm de estar na mesma linha (Hex V) ou na mesma coluna (Hex H), a pelo menos um hexágono de distância.',
      unexpected: 'Os detalhes estão no log da consola da API.',
    },
    help: {
      menu: 'Mostre o menu.',
      fill: 'Cubra as formas desenhadas selecionadas com hexágonos.',
      fillInverse: 'Cubra a página inteira, exceto dentro das formas selecionadas.',
      undo: 'Desfaça o último enchimento, inverta o enchimento ou ocultar e restaure as formas utilizadas.',
      reveal:
        'Revele os hexágonos selecionados e os hexágonos sob as formas e fichas selecionadas.',
      revealPage: 'Revele cada hexágono da página sem anúncios.',
      conceal: 'Cubra a área sob as formas e fichas selecionadas com hexágonos novamente.',
      explore:
        'Revele à volta das fichas selecionadas como se tivessem acabado de se mover para lá.',
      resetPage: 'Remova todos os hexágonos da página (pergunta primeiro).',
      name: 'Nomeie os hexágonos selecionados ou os hexágonos sob os tokens selecionados. Deixe o nome vazio para o limpar.',
      mark: 'Transforme os tokens selecionados em locais ocultos.',
      unmark: 'Impede que os tokens selecionados sejam locais ocultos.',
      set: 'Altere uma definição ou mostre todas as definições.',
      pageSet: 'Substituir uma configuração de revelação apenas na página atual.',
      pageClear: 'Remova as substituições da página atual.',
      rescan:
        'Reconstrua a lista de hexágonos da página, por exemplo, depois de copiar uma página ou um jogo.',
      calibrate:
        'Alinhe a grelha hexagonal com uma ou duas fichas selecionadas encaixadas em centros de hexágonos.',
      calibrateReset: 'Remova a calibração da página atual.',
      status: 'Mostre o que o Hexploration sabe sobre a página atual.',
      journal: 'Reconstrua os folhetos de Ajuda e do Command Deck.',
      help: 'Mostre esta lista.',
      handout: 'As instruções completas estão no folheto "{name}".',
    },
    deck: {
      drawDesc:
        'Desenhe formas à volta de uma área, selecione-as e preencha. Desfazer reverte o último preenchimento.',
      revealDesc:
        'Selecione hexágonos, formas ou fichas para os revelar ou voltar a cobrir. Explorar revela à volta das fichas selecionadas como se se tivessem movido.',
      locationsDesc:
        'Selecione fichas para as ocultar como locais sob hexágonos. Selecione hexágonos ou fichas para nomear um hexágono.',
      toolsDesc:
        'Definições, substituições de páginas, estado, nova digitalização de páginas copiadas e calibração da grelha.',
      footer: 'Consulte o folheto "{help}" para obter as instruções completas.',
    },
    handout: {
      versionLabel: 'Versão',
      subtitle: 'Exploração hexágono a hexágono para Roll20',
      footer: 'Utilize o folheto "{deck}" para controlos de um clique.',
      overview: {
        heading: 'Visão geral',
        body: 'O Hexploration cobre um mapa hexagonal com hexágonos opacos. À medida que o grupo se desloca, os hexágonos por onde passa (e, se quiser, os hexágonos à sua volta) são removidos, pelo que o mapa é descoberto um hexágono de cada vez. Podem ser colocados locais escondidos sob os hexágonos, que são anunciados quando encontrados. Funciona em jogos Jumpgate e Legacy, em grelhas Hex (V) e Hex (H) de qualquer tamanho.',
        demo: 'Assista a uma breve demonstração (da versão 1)',
      },
      quickStart: {
        heading: 'Início rápido',
        steps: [
          'Abra uma página cuja grelha esteja definida para Hex (V) ou Hex (H).',
          'Desenhe uma ou mais formas (polígono, retângulo, elipse ou à mão livre) à volta da área a ocultar.',
          'Selecione as formas e clique em Preencher no Command Deck (ou escreva !hexploration fill). As formas são substituídas por hexágonos.',
          'Opcional: antes de preencher, selecione fichas de locais importantes e clique em Marcar local. Ficam escondidas sob os hexágonos e são anunciadas quando descobertas.',
          'Mova uma ficha de jogador. Cada hexágono por onde passa e os hexágonos dentro da sua Distância de visão são revelados.',
        ],
      },
      commands: {
        heading: 'Comandos',
        intro:
          'Apenas os GMs podem usar estes comandos. A maioria atua sobre os objetos selecionados; o resto atua na página que está a visualizar.',
        colCommand: 'Comando',
        colDesc: 'O que faz',
      },
      revealing: {
        heading: 'Como funciona a revelação',
        points: [
          'Apenas as fichas na camada de fichas revelam hexágonos. Quais as fichas que contam é definido por Fichas que revelam: fichas de jogador por predefinição, para que o GM possa mover monstros sem descobrir o mapa.',
          'Uma ficha revela cada hexágono que cobre (as fichas grandes cobrem vários) e, com Revelar ao longo do percurso ativado, cada hexágono do percurso pelo qual foi arrastada, incluindo os pontos de passagem.',
          'A Distância de visão revela os hexágonos em torno de cada um destes hexágonos, começando pelos mais próximos. Com a Linha de visão ativada, um hexágono não é revelado enquanto existir um hexágono coberto entre ele e a ficha. Os hexágonos mais próximos são normalmente revelados primeiro, por isso em terreno aberto a Linha de visão não altera nada: só tem importância com uma Distância de visão de 2 ou mais e hexágonos que continuam cobertos, como terreno preenchido com uma Distância de revelação dos hexágonos.',
          'A Distância de revelação dos hexágonos é guardada em cada hexágono quando este é preenchido, por isso defina-a antes de preencher; alterá-la depois não afeta os hexágonos que já estão no mapa. Uma ficha tem de estar a, no máximo, esse número de hexágonos para os revelar, por mais longe que consiga ver, e com 0 só são revelados quando se entra neles. Para uma cordilheira: defina a Distância de revelação dos hexágonos como 0, preencha as montanhas, volte a deixá-la sem limite e depois preencha as terras mais além. Com Distância de visão 3 e Linha de visão ativada, o grupo vê o terreno aberto à sua volta, mas não as montanhas nem o que está por trás delas. Cada hexágono de montanha é revelado quando uma ficha entra nele.',
          'No modo Vislumbre, os hexágonos à vista tornam-se transparentes em vez de desaparecerem e são removidos quando uma ficha entra neles. Os hexágonos vislumbrados não bloqueiam a Linha de visão.',
          'O Roll20 desenha os nomes, barras e auras das fichas por cima dos hexágonos. Com Ocultar fichas cobertas ativado, uma ficha sob um hexágono coberto tem o nome, as barras e as auras visíveis para os jogadores desativados até ser descoberta, para que os monstros escondidos não se denunciem. Se ativar um deles enquanto a ficha estiver coberta, este continua oculto e é ativado quando a ficha for descoberta.',
          'A API não reporta movimentos feitos por outros mods. Os movimentos do TokenMod são captados automaticamente; para outros mods, selecione as fichas e clique em Explorar, ou chame Hexploration.revealAround(token) a partir do seu próprio mod.',
        ],
      },
      locations: {
        heading: 'Hexes e locais nomeados',
        points: [
          'Marcar local transforma as fichas selecionadas em locais escondidos. Uma ficha que já esteja sob um hexágono é ocultada imediatamente; caso contrário, ficará oculta pelo próximo preenchimento que a cobrir.',
          'Os tokens com o marcador de estado da torre branca também são tratados como locais quando preenche, como na versão 1.',
          'As fichas de localização oculta são movidas para a camada GM. Quando o seu hexágono é revelado, regressam à camada de token com o seu nome mostrado e a sua descoberta é anunciada.',
          'Nomear hexágono dá um nome a um hexágono sem precisar de uma ficha. O nome é mostrado ao GM como uma etiqueta na camada do GM e anunciado quando o hexágono é revelado.',
          'Anunciar descobertas escolhe se todos, apenas o GM ou ninguém vê o anúncio. Pingar descobertas também move a vista dos jogadores para o local.',
        ],
      },
      settings: {
        heading: 'Configurações',
        intro:
          'Altere as definições com !hexploration set (ou com o botão Definições). Camada dos hexágonos, Fichas que revelam e Idioma também podem ser definidos na página de definições do Mod.',
        colKey: 'Chave',
        colName: 'Definição',
        colDesc: 'Descrição',
        perPage: '(Pode ser definido por página.)',
      },
      jumpgate: {
        heading: 'Jumpgate e Legado',
        points: [
          'Hexploration descobre qual o motor que o jogo utiliza e desenha o tipo de forma correspondente. As formas desenhadas em qualquer editor podem ser preenchidas.',
          'Com a Camada dos hexágonos definida como Automático, os hexágonos são desenhados na camada de primeiro plano, por cima das fichas, para que os jogadores não consigam ver o que está por baixo. Se a camada de primeiro plano não estiver disponível, é utilizada a camada de fichas.',
          'O Jumpgate desenha hexágonos matematicamente regulares, com uma forma ligeiramente diferente dos hexágonos do Legacy. Se os hexágonos não ficarem alinhados com a grelha da página, encaixe uma ficha no centro de um hexágono, selecione-a e clique em Calibrar. Selecione duas fichas em hexágonos vizinhos da mesma linha (Hex V) ou coluna (Hex H) para corrigir também o tamanho do hexágono.',
          'Quando uma página ou jogo é copiado, os seus hexágonos recebem novos IDs. Execute Reanalisar na página para os voltar a apanhar, juntamente com as suas etiquetas de nome e fichas de local.',
        ],
      },
      upgrading: {
        heading: 'Atualização da versão 1',
        points: [
          'A versão 2 já não precisa de PathMath, MatrixMath, Vector Math ou HTML Builder. Pode removê-los, a menos que outro mod os utilize.',
          'Os mapas de hexágonos, nomes, fichas de localização e definições existentes são atualizados automaticamente no primeiro arranque.',
          'Os comandos da versão 1, incluindo a macro Hexploration_menu, ainda funcionam.',
          'A versão 1 permitia que qualquer ficha que representasse uma personagem revelasse hexágonos. Defina Fichas que revelam como Fichas de personagem para manter este comportamento.',
        ],
        colV1: 'Comando da versão 1',
        colV2: 'Comando da versão 2',
      },
      troubleshooting: {
        heading: 'Solução de problemas',
        points: [
          'Nada acontece quando uma ficha se move: verifique se a ficha está na camada de fichas e corresponde a Fichas que revelam, e se a página tem hexágonos (!hexploration status).',
          'Os hexágonos estão desalinhados com a grelha: use Calibrar e verifique depois com uma ficha em alguns hexágonos do mapa.',
          'Os hexágonos deixaram de ser revelados após copiar uma página ou jogo: execute Reanalisar na página.',
          'Preencher indica que a área não tem centros de hexágonos: a forma tem de conter o centro de pelo menos um hexágono.',
          'Para qualquer outra coisa, verifique o registo da consola da API e inclua as suas mensagens ao pedir ajuda.',
        ],
      },
      languages: {
        heading: 'Idiomas',
        body: 'Escolha um idioma com !hexploration set language. Idiomas disponíveis:',
        colLanguage: 'Idioma',
        colNative: 'Nome original',
        colCode: 'Código',
      },
      credits: {
        heading: 'Créditos',
        original: 'Mod original de',
        maintainer: 'Versão 2 mantida pela',
        marketplace: 'Pacotes de arte de Ada no Roll20 Marketplace',
        support:
          'Se encontrar um bug ou tiver uma ideia, publique no fórum Roll20 Mod ou abra um problema no GitHub e inclua quaisquer mensagens do registo da consola da API.',
      },
    },
  };

  const TRANSLATION$5 = {
    titles: {
      ready: 'O Hexploration está pronto.',
      settings: 'Configurações do Hexploration',
      languages: 'Escolha um idioma',
      pageSettings: 'Configurações da página: {page}',
      status: 'Status do Hexploration: {page}',
      help: 'Comandos do Hexploration',
      confirm: 'Por favor, confirme',
    },
    discovery: {
      title: 'Local descoberto',
    },
    menu: {
      draw: 'Desenhar',
      reveal: 'Revelar e ocultar',
      locations: 'Locais',
      tools: 'Ferramentas',
      layerInUse: 'Novos hexágonos estão sendo desenhados na {layer}.',
      pageSettingsHelp:
        'Essas configurações se aplicam somente a esta página. As configurações marcadas com ★ substituem as configurações globais.',
    },
    buttons: {
      fill: 'Preencher',
      fillInverse: 'Preenchimento inverso',
      undo: 'Desfazer preenchimento',
      reveal: 'Revelar',
      conceal: 'Ocultar',
      explore: 'Explorar',
      revealPage: 'Revelar página',
      resetPage: 'Redefinir página',
      mark: 'Marcar local',
      unmark: 'Desmarcar',
      name: 'Nomear hexágono',
      settings: 'Configurações',
      pageSettings: 'Configurações da página',
      status: 'Status',
      rescan: 'Reescanear',
      calibrate: 'Calibrar',
      calibrateReset: 'Redefinir calibração',
      help: 'Ajuda',
      change: 'Alterar',
      menu: 'Menu',
      clearOverrides: 'Limpar substituições',
      confirmReset: 'Sim, remover todos os hexágonos',
    },
    prompts: {
      name: 'Nome do local (deixe em branco para limpar)',
    },
    values: {
      on: 'Ligado',
      off: 'Desligado',
      none: 'Nenhum',
      hexLayer: {
        auto: 'Automático (primeiro plano, se disponível)',
        foreground: 'camada de primeiro plano',
        objects: 'camada de tokens',
      },
      revealBy: {
        players: 'Tokens de jogador',
        characters: 'Tokens de personagem',
        all: 'Todos os tokens',
      },
      revealMode: {
        clear: 'Limpar',
        glimpse: 'Vislumbre',
      },
      announce: {
        all: 'Todos',
        gm: 'Apenas GM',
        off: 'Desligado',
      },
      orientation: {
        vertical: 'Hex (V)',
        horizontal: 'Hex (H)',
      },
      fillKind: {
        fill: 'Preencher',
        fillInverse: 'Preenchimento inverso',
        conceal: 'Ocultar',
      },
    },
    settings: {
      language: {
        label: 'Idioma',
        desc: 'Idioma para menus, mensagens e folhetos.',
      },
      hexLayer: {
        label: 'Camada dos hexágonos',
        desc: 'Onde novos hexágonos são desenhados. Auto tenta a camada de primeiro plano (acima dos tokens) e volta para a camada de tokens se o jogo não suportar.',
      },
      fillColor: {
        label: 'Cor de preenchimento',
        desc: 'Cor dos novos hexágonos. Use rgba() para hexágonos transparentes, por exemplo rgba(0,0,0,0.8).',
      },
      strokeColor: {
        label: 'Cor da borda',
        desc: 'Cor do contorno dos novos hexágonos.',
      },
      labelColor: {
        label: 'Cor do rótulo',
        desc: 'Cor dos rótulos de nomes exclusivos do GM em hexágonos nomeados.',
      },
      glimpseColor: {
        label: 'Cor do vislumbre',
        desc: 'Cor que os hexágonos assumem quando vislumbrados (modo de revelação Vislumbre). Use uma cor rgba() transparente.',
      },
      strokeWidth: {
        label: 'Largura da borda',
        desc: 'Largura do contorno dos novos hexágonos, em pixels (0 a 20).',
      },
      maxDistance: {
        label: 'Distância de revelação dos hexágonos',
        desc: 'Gravada nos hexágonos quando eles são preenchidos, então defina-a antes de preencher: alterá-la depois não afeta os hexágonos que já estão no mapa. Uma ficha deve estar a no máximo este número de hexágonos para revelá-los, por mais longe que possa ver; com 0, eles só são revelados quando se entra neles. Use-a para montanhas ou florestas. Deixe em branco para não ter limite.',
      },
      revealDistance: {
        label: 'Distância de visão',
        desc: 'Quantos hexágonos ao redor de uma ficha em movimento são revelados (0 a 20). 0 revela apenas os hexágonos pelos quais o token passa.',
      },
      lineOfSight: {
        label: 'Linha de visão',
        desc: 'Quando ativado, os hexágonos que permanecem cobertos, como montanhas preenchidas com uma Distância de revelação dos hexágonos, escondem os hexágonos atrás deles. Só faz diferença com uma Distância de visão de 2 ou mais.',
      },
      revealPath: {
        label: 'Revelar ao longo do caminho',
        desc: 'Quando ativado, cada hexágono que uma ficha passa enquanto é arrastada (incluindo waypoints) é revelado, não apenas onde ela para.',
      },
      revealBy: {
        label: 'Tokens que revelam',
        desc: 'Quais fichas na camada de fichas revelam hexágonos: fichas controladas por um jogador, fichas que representam qualquer personagem ou todas as fichas.',
      },
      revealMode: {
        label: 'Modo de revelação',
        desc: 'Limpar remove os hexágonos à vista. Vislumbre os torna transparentes; eles são removidos quando um token entra neles.',
      },
      announce: {
        label: 'Anunciar descobertas',
        desc: 'Quem vê a mensagem do chat quando um local nomeado é descoberto.',
      },
      pingDiscoveries: {
        label: 'Pingar descobertas',
        desc: 'Quando ativado, os jogadores recebem um ping para um local nomeado quando ele é descoberto.',
      },
      hideCoveredTokens: {
        label: 'Ocultar tokens cobertos',
        desc: 'Roll20 desenha nomes, barras e auras acima dos hexágonos. Quando ativado, os tokens sob um hexágono coberto têm seu nome, barras e auras visíveis ao jogador desligados e ligados novamente quando são descobertos.',
      },
    },
    status: {
      engine: 'Motor de jogo',
      grid: 'Grade',
      layer: 'Camada dos hexágonos',
      hexes: 'Hexágonos',
      named: 'Hexágonos nomeados',
      icons: 'Tokens de local',
      glimpsed: 'Hexágonos vislumbrados',
      pending: 'Locais aguardando preenchimento',
      calibrated: 'Calibrado',
      overrides: 'Substituições da página',
      undo: 'Desfazer disponível',
    },
    messages: {
      filled:
        'Preenchimento completo. Hexágonos desenhados: {created}. Reestilizado: {restyled}. Locais ocultos: {icons}.',
      revealed: 'Feitiços revelados: {count}.',
      revealedPage: 'Cada hexágono da página revelado ({count}).',
      confirmReset:
        'Remover todos os hexágonos de "{page}" ({count})? Os tokens de localização voltam para a camada de tokens. Esta ação não pode ser revertida com Desfazer.',
      resetPage: 'Hexágonos removidos da página: {count}.',
      undone:
        'Último preenchimento desfeito. Hexágonos removidos: {removed}. Hexágonos reestilizados restaurados: {restored}.',
      named: 'Hexágonos chamados "{name}": {count}.',
      unnamed: 'Nomes apagados: {count}.',
      marked:
        'Locais ocultos em hexágonos existentes: {attached}. Aguardando o próximo preenchimento que os cobre: ​​{pending}.',
      unmarked: 'Tokens que não são mais locais: {count}.',
      settingChanged: '{setting} definido como {value}.',
      rescanned:
        'Nova verificação concluída. Mantido: {kept}. Adotado: {adopted}. Arquivado novamente: {moved}. Ausente e esquecido: {dropped}. Rótulos vinculados novamente: {labels}. Tokens de localização vinculados novamente: {icons}.',
      calibrated:
        'Grade calibrada (etapa de coluna {colStep}px, etapa de linha {rowStep}px). Nova varredura: mantido {kept}, arquivado novamente {moved}, adotado {adopted}.',
      calibrationReset:
        'Calibração removida. Nova varredura: mantido {kept}, arquivado novamente {moved}, adotado {adopted}.',
      journalRebuilt: 'Os folhetos "{help}" e "{deck}" foram reconstruídos.',
      migrated:
        'Seus mapas de hexágonos do Hexploration 1.x foram atualizados. Se este jogo foi copiado de um jogo Legacy, execute Reescanear em cada página com mapa de hexágonos.',
      pruned:
        'Hexágonos salvos que não existem mais e foram esquecidos: {dropped}. Se este jogo ou página foi copiado, execute Reescanear na página para recuperar seus hexágonos.',
      readyHint:
        'Digite !hexploration para abrir o menu ou abra o folheto "Hexploration - Command Deck".',
    },
    warnings: {
      foregroundUnavailable:
        'Este jogo não suporta desenho na camada de primeiro plano, então hexágonos foram desenhados na camada de token.',
      someFailed:
        'Hexágonos que não puderam ser desenhados: {count}. Verifique o console da API para obter detalhes.',
    },
    errors: {
      noPage: 'Não foi possível encontrar a página para trabalhar.',
      notHex: 'Esta página não usa uma grade hexagonal.',
      noPolygons: 'Selecione uma ou mais formas desenhadas para preencher.',
      emptyArea: 'A área selecionada não contém nenhum centro de hexágono.',
      tooMany: 'Isso criaria muitos hexágonos de uma só vez ({count}).',
      nothingToConceal: 'Selecione formas desenhadas ou fichas para ocultar.',
      nothingToReveal: 'Selecione hexágonos, formas desenhadas ou fichas para revelar.',
      noTokens: 'Selecione um ou mais tokens primeiro.',
      noHexes: 'Selecione um ou mais hexágonos (ou fichas sobre hexágonos) primeiro.',
      nothingToUndo: 'Não há preenchimento para desfazer.',
      unknownCommand: 'Comando desconhecido: {command}',
      unknownSetting: 'Configuração desconhecida: {key}',
      unknownPageSetting: 'Configurações que podem ser definidas por página: {keys}',
      invalidValue: '"{value}" não é um valor válido para {key}.',
      calibrateNeedsTokens: 'Selecione um ou dois tokens encaixados em centros de hexágonos.',
      calibrateFailed: 'Esses tokens não podem ser usados ​​para calibrar.',
      unexpected: 'Algo deu errado: {message}',
    },
    hints: {
      noPage: 'Abra a página na qual deseja trabalhar ou selecione algo nela.',
      notHex: 'Defina a grade da página como Hex (V) ou Hex (H) nas Configurações da página.',
      noPolygons:
        'Desenhe um polígono, retângulo, elipse ou forma à mão livre ao redor da área, selecione-o e tente novamente.',
      emptyArea: 'Desenhe uma forma maior ou verifique as configurações da grade da página.',
      tooMany: 'Preencha uma área menor ou divida a área em várias formas.',
      noHexes:
        'Os hexágonos estão no primeiro plano ou na camada de token; mude para essa camada para selecioná-los.',
      unknownCommand: 'Digite !hexploration help para listar os comandos.',
      unknownSetting: 'Digite !hexploration set para ver todas as configurações.',
      calibrateNeedsTokens:
        'Encaixe um token no centro de um hexágono e selecione-o. Selecione um segundo token encaixado em um hexágono vizinho na mesma linha (Hex V) ou coluna (Hex H) para corrigir também o tamanho do hexágono.',
      calibrateFailed:
        'Os dois tokens devem estar na mesma linha (Hex V) ou na mesma coluna (Hex H), a pelo menos um hexágono de distância.',
      unexpected: 'Os detalhes estão no log do console da API.',
    },
    help: {
      menu: 'Mostrar o menu.',
      fill: 'Cubra as formas desenhadas selecionadas com hexágonos.',
      fillInverse: 'Cubra a página inteira, exceto dentro das formas selecionadas.',
      undo: 'Desfaça o último preenchimento, inverta o preenchimento ou oculte e restaure as formas usadas.',
      reveal:
        'Revele os hexágonos selecionados e os hexágonos sob as formas e fichas selecionadas.',
      revealPage: 'Revele cada hexágono da página sem anúncios.',
      conceal: 'Cubra a área sob as formas e fichas selecionadas com hexágonos novamente.',
      explore:
        'Revele ao redor dos tokens selecionados como se eles tivessem acabado de se mover para lá.',
      resetPage: 'Remova todos os hexágonos da página (pergunta antes).',
      name: 'Nomeie os hexágonos selecionados ou os hexágonos sob os tokens selecionados. Deixe o nome vazio para limpá-lo.',
      mark: 'Transforme os tokens selecionados em locais ocultos.',
      unmark: 'Impede que os tokens selecionados sejam locais ocultos.',
      set: 'Altere uma configuração ou mostre todas as configurações.',
      pageSet: 'Substituir uma configuração de revelação somente na página atual.',
      pageClear: 'Remova as substituições da página atual.',
      rescan:
        'Reconstrua a lista de hexágonos da página, por exemplo, depois de copiar uma página ou um jogo.',
      calibrate:
        'Alinhe a grade hexagonal com um ou dois tokens selecionados encaixados em centros de hexágonos.',
      calibrateReset: 'Remova a calibração da página atual.',
      status: 'Mostre o que o Hexploration sabe sobre a página atual.',
      journal: 'Reconstrua os folhetos de Ajuda e do Command Deck.',
      help: 'Mostre esta lista.',
      handout: 'As instruções completas estão no folheto "{name}".',
    },
    deck: {
      drawDesc:
        'Desenhe formas ao redor de uma área, selecione-as e preencha. Desfazer reverte o último preenchimento.',
      revealDesc:
        'Selecione hexágonos, formas ou tokens para revelá-los ou cobri-los novamente. Explorar revela ao redor dos tokens selecionados como se eles tivessem se movido.',
      locationsDesc:
        'Selecione tokens para ocultá-los como locais sob hexágonos. Selecione hexágonos ou tokens para nomear um hexágono.',
      toolsDesc:
        'Configurações, substituições de páginas, status, nova digitalização de páginas copiadas e calibração da grade.',
      footer: 'Consulte o folheto "{help}" para obter instruções completas.',
    },
    handout: {
      versionLabel: 'Versão',
      subtitle: 'Exploração hexágono a hexágono para Roll20',
      footer: 'Use o folheto "{deck}" para controles de um clique.',
      overview: {
        heading: 'Visão geral',
        body: 'O Hexploration cobre um mapa hexagonal com hexágonos opacos. À medida que o grupo se move, os hexágonos pelos quais ele passa (e, se você quiser, os hexágonos ao redor) são removidos, de modo que o mapa é descoberto um hexágono por vez. Locais ocultos podem ser colocados sob os hexágonos e são anunciados quando encontrados. Funciona em jogos Jumpgate e Legacy, em grades Hex (V) e Hex (H) de qualquer tamanho.',
        demo: 'Assista a uma breve demonstração (da versão 1)',
      },
      quickStart: {
        heading: 'Início rápido',
        steps: [
          'Abra uma página cuja grade esteja definida como Hex (V) ou Hex (H).',
          'Desenhe uma ou mais formas (polígono, retângulo, elipse ou à mão livre) ao redor da área a ser ocultada.',
          'Selecione as formas e clique em Preencher no Command Deck (ou digite !hexploration fill). As formas são substituídas por hexágonos.',
          'Opcional: antes de preencher, selecione tokens de locais importantes e clique em Marcar local. Eles ficam ocultos sob os hexágonos e são anunciados quando descobertos.',
          'Mova um token de jogador. Cada hexágono pelo qual ele passa e os hexágonos dentro da sua Distância de visão são revelados.',
        ],
      },
      commands: {
        heading: 'Comandos',
        intro:
          'Somente GMs podem usar esses comandos. A maioria atua nos objetos selecionados; o resto atua na página que você está visualizando.',
        colCommand: 'Comando',
        colDesc: 'O que isso faz',
      },
      revealing: {
        heading: 'Como funciona a revelação',
        points: [
          'Apenas tokens na camada de tokens revelam hexágonos. Quais tokens contam é definido por Tokens que revelam: tokens de jogador por padrão, para que o GM possa mover monstros sem descobrir o mapa.',
          'Um token revela cada hexágono que cobre (tokens grandes cobrem vários) e, com Revelar ao longo do caminho ativado, cada hexágono da rota pela qual foi arrastado, incluindo os pontos de passagem.',
          'A Distância de visão revela os hexágonos em torno de cada um desses hexágonos, começando pelos mais próximos. Com a Linha de visão ativada, um hexágono não é revelado enquanto houver um hexágono coberto entre ele e o token. Os hexágonos mais próximos costumam ser revelados primeiro, então em terreno aberto a Linha de visão não muda nada: ela só importa com uma Distância de visão de 2 ou mais e hexágonos que permanecem cobertos, como terreno preenchido com uma Distância de revelação dos hexágonos.',
          'A Distância de revelação dos hexágonos é gravada em cada hexágono quando ele é preenchido, então defina-a antes de preencher; alterá-la depois não afeta os hexágonos que já estão no mapa. Um token deve estar a no máximo essa quantidade de hexágonos para revelá-los, por mais longe que consiga ver, e com 0 eles só são revelados quando se entra neles. Para uma cordilheira: defina a Distância de revelação dos hexágonos como 0, preencha as montanhas, volte a deixá-la sem limite e então preencha as terras mais adiante. Com Distância de visão 3 e Linha de visão ativada, o grupo vê o terreno aberto ao seu redor, mas não as montanhas nem o que há atrás delas. Cada hexágono de montanha é revelado quando um token entra nele.',
          'No modo Vislumbre, os hexágonos à vista tornam-se transparentes em vez de desaparecer e são removidos quando um token entra neles. Os hexágonos vislumbrados não bloqueiam a Linha de visão.',
          'O Roll20 desenha nomes, barras e auras de tokens acima dos hexágonos. Com Ocultar tokens cobertos ativado, um token sob um hexágono coberto tem o nome, as barras e as auras visíveis aos jogadores desativados até ser descoberto, para que monstros escondidos não se denunciem. Se você ativar um deles enquanto o token estiver coberto, ele continua oculto e é ativado quando o token for descoberto.',
          'A API não relata movimentos feitos por outros mods. Os movimentos do TokenMod são captados automaticamente; para outros mods, selecione os tokens e clique em Explorar ou chame Hexploration.revealAround(token) do seu próprio mod.',
        ],
      },
      locations: {
        heading: 'Hexes e locais nomeados',
        points: [
          'Marcar local transforma os tokens selecionados em locais ocultos. Um token que já esteja sob um hexágono é ocultado imediatamente; caso contrário, ele será ocultado pelo próximo preenchimento que o cobrir.',
          'Os tokens com o marcador de status da torre branca também são tratados como locais quando você preenche, como na versão 1.',
          'As fichas de localização oculta são movidas para a camada GM. Quando seu hexágono é revelado, eles retornam à camada de token com seu nome mostrado e sua descoberta é anunciada.',
          'Nomear hexágono dá um nome a um hexágono sem precisar de um token. O nome é mostrado ao GM como um rótulo na camada do GM e anunciado quando o hexágono é revelado.',
          'Anunciar descobertas escolhe se todos, apenas o GM ou ninguém verá o anúncio. Pingar descobertas também move a visão dos jogadores para o local.',
        ],
      },
      settings: {
        heading: 'Configurações',
        intro:
          'Altere as configurações com !hexploration set (ou com o botão Configurações). Camada dos hexágonos, Tokens que revelam e Idioma também podem ser definidos na página de configurações do Mod.',
        colKey: 'Chave',
        colName: 'Configuração',
        colDesc: 'Descrição',
        perPage: '(Pode ser definido por página.)',
      },
      jumpgate: {
        heading: 'Jumpgate e Legado',
        points: [
          'Hexploration descobre qual motor o jogo usa e desenha o tipo de forma correspondente. As formas desenhadas em qualquer editor podem ser preenchidas.',
          'Com a Camada dos hexágonos definida como Automático, os hexágonos são desenhados na camada de primeiro plano, acima dos tokens, para que os jogadores não possam ver o que está por baixo. Se a camada de primeiro plano não estiver disponível, a camada de tokens é usada no lugar.',
          'O Jumpgate desenha hexágonos matematicamente regulares, com um formato ligeiramente diferente dos hexágonos do Legacy. Se os hexágonos não se alinharem com a grade da página, encaixe um token no centro de um hexágono, selecione-o e clique em Calibrar. Selecione dois tokens em hexágonos vizinhos da mesma linha (Hex V) ou coluna (Hex H) para corrigir também o tamanho do hexágono.',
          'Quando uma página ou jogo é copiado, seus hexágonos recebem novos IDs. Execute Reescanear na página para recuperá-los, junto com seus rótulos de nome e tokens de local.',
        ],
      },
      upgrading: {
        heading: 'Atualizando da versão 1',
        points: [
          'A versão 2 não precisa mais de PathMath, MatrixMath, Vector Math ou HTML Builder. Você pode removê-los, a menos que outro mod os use.',
          'Os mapas de hexágonos, nomes, tokens de localização e configurações existentes são atualizados automaticamente na primeira inicialização.',
          'Os comandos da versão 1, incluindo a macro Hexploration_menu, ainda funcionam.',
          'A versão 1 permitia que qualquer token que representasse um personagem revelasse hexágonos. Defina Tokens que revelam como Tokens de personagem para manter esse comportamento.',
        ],
        colV1: 'Comando da versão 1',
        colV2: 'Comando da versão 2',
      },
      troubleshooting: {
        heading: 'Solução de problemas',
        points: [
          'Nada acontece quando um token se move: verifique se o token está na camada de tokens e corresponde a Tokens que revelam, e se a página possui hexágonos (!hexploration status).',
          'Os hexágonos são deslocados da grade: use Calibrar e verifique com um token alguns hexágonos no mapa.',
          'Os hexágonos pararam de ser revelados após copiar uma página ou jogo: execute Reescanear na página.',
          'Preencher diz que a área não tem centros de hexágonos: a forma precisa conter o centro de pelo menos um hexágono.',
          'Para qualquer outra coisa, verifique o log do console da API e inclua suas mensagens ao pedir ajuda.',
        ],
      },
      languages: {
        heading: 'Idiomas',
        body: 'Escolha um idioma com !hexploration set language. Idiomas disponíveis:',
        colLanguage: 'Linguagem',
        colNative: 'Nome original',
        colCode: 'Código',
      },
      credits: {
        heading: 'Créditos',
        original: 'Mod original por',
        maintainer: 'Versão 2 mantida por',
        marketplace: 'Pacotes de arte de Ada no Roll20 Marketplace',
        support:
          'Se você encontrar um bug ou tiver uma ideia, poste no fórum Roll20 Mod ou abra um problema no GitHub e inclua quaisquer mensagens do log do console da API.',
      },
    },
  };

  const TRANSLATION$4 = {
    titles: {
      ready: 'Hexploration готова.',
      settings: 'Настройки Hexploration',
      languages: 'Выберите язык',
      pageSettings: 'Настройки страницы: {page}',
      status: 'Статус Hexploration: {page}',
      help: 'Команды Hexploration',
      confirm: 'Пожалуйста, подтвердите',
    },
    discovery: {
      title: 'Локация обнаружена',
    },
    menu: {
      draw: 'Рисование',
      reveal: 'Раскрытие и скрытие',
      locations: 'Локации',
      tools: 'Инструменты',
      layerInUse: 'Новые гексы рисуются на этом слое: {layer}.',
      pageSettingsHelp:
        'Эти настройки применяются только к этой странице. Настройки, отмеченные знаком ★, переопределяют глобальные настройки.',
    },
    buttons: {
      fill: 'Заполнить',
      fillInverse: 'Обратная заливка',
      undo: 'Отменить заливку',
      reveal: 'Раскрыть',
      conceal: 'Скрыть',
      explore: 'Исследовать',
      revealPage: 'Раскрыть страницу',
      resetPage: 'Сбросить страницу',
      mark: 'Отметить локацию',
      unmark: 'Снять отметку',
      name: 'Назвать гекс',
      settings: 'Настройки',
      pageSettings: 'Настройки страницы',
      status: 'Статус',
      rescan: 'Пересканировать',
      calibrate: 'Калибровать',
      calibrateReset: 'Сбросить калибровку',
      help: 'Справка',
      change: 'Изменить',
      menu: 'Меню',
      clearOverrides: 'Сбросить переопределения',
      confirmReset: 'Да, удалить все гексы',
    },
    prompts: {
      name: 'Название местоположения (оставьте пустым, чтобы очистить)',
    },
    values: {
      on: 'Вкл.',
      off: 'Выкл.',
      none: 'Нет',
      hexLayer: {
        auto: 'Авто (передний план, если доступен)',
        foreground: 'слой переднего плана',
        objects: 'слой токенов',
      },
      revealBy: {
        players: 'Токены игроков',
        characters: 'Токены персонажей',
        all: 'Все токены',
      },
      revealMode: {
        clear: 'Очистка',
        glimpse: 'Проблеск',
      },
      announce: {
        all: 'Все',
        gm: 'Только ГМ',
        off: 'Выкл.',
      },
      orientation: {
        vertical: 'Hex (V)',
        horizontal: 'Hex (H)',
      },
      fillKind: {
        fill: 'Заливка',
        fillInverse: 'Обратная заливка',
        conceal: 'Скрытие',
      },
    },
    settings: {
      language: {
        label: 'Язык',
        desc: 'Язык меню, сообщений и раздаточных материалов.',
      },
      hexLayer: {
        label: 'Слой шестиугольников',
        desc: 'Где рисуются новые гексы. «Авто» пробует слой переднего плана (над токенами), а если игра его не поддерживает, использует слой токенов.',
      },
      fillColor: {
        label: 'Цвет заливки',
        desc: 'Цвет новых гексов. Используйте rgba() для прозрачных шестигранников, например rgba(0,0,0,0.8).',
      },
      strokeColor: {
        label: 'Цвет границы',
        desc: 'Цвет контура новых гексов.',
      },
      labelColor: {
        label: 'Цвет меток',
        desc: 'Цвет меток с именами, предназначенными только для GM, на именованных гексах.',
      },
      glimpseColor: {
        label: 'Цвет проблеска',
        desc: 'Цвет, который принимают гексы в режиме «Проблеск». Используйте полупрозрачный цвет rgba().',
      },
      strokeWidth: {
        label: 'Ширина границы',
        desc: 'Ширина контура новых шестиугольников в пикселях (от 0 до 20).',
      },
      maxDistance: {
        label: 'Дальность раскрытия шестиугольников',
        desc: 'Сохраняется в гексах при их заполнении, поэтому задайте значение до заполнения: его последующее изменение не влияет на гексы, уже находящиеся на карте. Жетон должен находиться в пределах этого количества гексов, чтобы раскрыть их, как бы далеко он ни видел; при значении 0 они раскрываются, только когда в них входят. Используйте для гор или лесов. Оставьте пустым, чтобы не было ограничений.',
      },
      revealDistance: {
        label: 'Расстояние обзора',
        desc: 'Сколько гексов вокруг движущегося жетона обнаружено (от 0 до 20). 0 показывает только те гексы, через которые проходит фишка.',
      },
      lineOfSight: {
        label: 'Линия видимости',
        desc: 'Когда эта опция включена, гексы, которые остаются закрытыми, например горы, заполненные с параметром «Дальность раскрытия шестиугольников», скрывают гексы за ними. Это имеет значение, только если «Расстояние обзора» равно 2 или больше.',
      },
      revealPath: {
        label: 'Раскрывать вдоль пути',
        desc: 'Когда эта функция включена, отображается каждый гекс, через который проходит жетон во время перетаскивания (включая путевые точки), а не только то место, где он останавливается.',
      },
      revealBy: {
        label: 'Раскрывающие токены',
        desc: 'Какие жетоны на слое жетонов отображают гексы: жетоны, контролируемые игроком, жетоны, представляющие любого персонажа, или каждый жетон.',
      },
      revealMode: {
        label: 'Режим раскрытия',
        desc: '«Очистка» удаляет гексы в пределах видимости. «Проблеск» вместо этого делает их полупрозрачными; они удаляются, когда в них входит токен.',
      },
      announce: {
        label: 'Объявлять об открытиях',
        desc: 'Кто видит сообщение чата при обнаружении именованного местоположения.',
      },
      pingDiscoveries: {
        label: 'Пинговать находки',
        desc: 'Если эта функция включена, игроки отправляются в указанное место при его обнаружении.',
      },
      hideCoveredTokens: {
        label: 'Скрывать токены под гексами',
        desc: 'Roll20 рисует имена, полосы и ауры над гексами. Когда эта функция включена, жетоны под закрытым гексом имеют видимое для игрока имя, полосы и ауры отключаются и снова включаются, когда они открываются.',
      },
    },
    status: {
      engine: 'Игровой движок',
      grid: 'Сетка',
      layer: 'Слой гексов',
      hexes: 'Гексы',
      named: 'Именованные гексы',
      icons: 'Токены локаций',
      glimpsed: 'Гексы в проблеске',
      pending: 'Локации, ожидающие заливки',
      calibrated: 'Откалибровано',
      overrides: 'Переопределения страницы',
      undo: 'Доступна отмена',
    },
    messages: {
      filled:
        'Заполнение завершено. Нарисованы гексы: {created}. Новый стиль: {restyled}. Местоположение скрыто: {icons}.',
      revealed: 'Обнаружены гексы: {count}.',
      revealedPage: 'Все гексы на странице открыты ({count}).',
      confirmReset:
        'Удалить все гексы со страницы "{page}" ({count})? Токены локаций вернутся на слой токенов. Отменить это действие будет нельзя.',
      resetPage: 'Со страницы удалены шестигранники: {count}.',
      undone:
        'Последнее заполнение отменено. Удалены шестигранники: {removed}. Восстановлены измененные гексы: {restored}.',
      named: 'Шестигранники с именем "{name}": {count}.',
      unnamed: 'Имена удалены: {count}.',
      marked:
        'Местоположение, скрытое в существующих гексах: {attached}. Ожидание следующей заливки, которая их закроет: {pending}.',
      unmarked: 'Токены, которые больше не являются локациями: {count}.',
      settingChanged: 'Для {setting} установлено значение {value}.',
      rescanned:
        'Повторное сканирование завершено. Сохранено: {kept}. Принято: {adopted}. Повторно отправлено: {moved}. Пропало и забыто: {dropped}. Ярлыки повторно связаны: {labels}. Токены местоположения повторно связаны: {icons}.',
      calibrated:
        'Сетка откалибрована (шаг столбца {colStep}px, шаг строки {rowStep}px). Повторное сканирование: сохранено {kept}, повторно сохранено {moved}, принято {adopted}.',
      calibrationReset:
        'Калибровка удалена. Повторное сканирование: сохранено {kept}, повторно сохранено {moved}, принято {adopted}.',
      journalRebuilt: 'Раздаточные материалы «{help}» и «{deck}» были перестроены.',
      migrated:
        'Ваши гексовые карты Hexploration 1.x обновлены. Если эта игра скопирована из игры Legacy, выполните «Пересканировать» на каждой странице с гексовой картой.',
      pruned:
        'Забыты сохранённые гексы, которых больше нет: {dropped}. Если эта игра или страница была скопирована, выполните «Пересканировать» на странице, чтобы снова найти её гексы.',
      readyHint:
        'Введите !hexploration, чтобы открыть меню, или откройте раздаточный материал "Hexploration - Command Deck".',
    },
    warnings: {
      foregroundUnavailable:
        'Эта игра не поддерживает рисование на слое переднего плана, поэтому шестигранники рисовались на слое жетонов.',
      someFailed:
        'Гексы, которые не удалось нарисовать: {count}. Подробности проверьте в консоли API.',
    },
    errors: {
      noPage: 'Не удалось найти страницу для работы.',
      notHex: 'На этой странице не используется шестигранная сетка.',
      noPolygons: 'Выберите одну или несколько нарисованных фигур для заливки.',
      emptyArea: 'Выбранная область не содержит шестигранных центров.',
      tooMany: 'Это создаст слишком много шестигранников за один раз ({count}).',
      nothingToConceal: 'Выберите нарисованные фигуры или жетоны, которые нужно скрыть.',
      nothingToReveal:
        'Выбирайте шестигранники, нарисованные фигуры или жетоны, чтобы их показать.',
      noTokens: 'Сначала выберите один или несколько жетонов.',
      noHexes: 'Сначала выберите один или несколько гексов (или жетоны, стоящие на гексах).',
      nothingToUndo: 'Нет заливки, которую можно было бы отменить.',
      unknownCommand: 'Неизвестная команда: {command}',
      unknownSetting: 'Неизвестная настройка: {key}.',
      unknownPageSetting: 'Настройки, которые можно установить для каждой страницы: {keys}.',
      invalidValue: '«{value}» не является допустимым значением для {key}.',
      calibrateNeedsTokens: 'Выберите один или два жетона, привязанных к шестигранным центрам.',
      calibrateFailed: 'Эти жетоны нельзя использовать для калибровки.',
      unexpected: 'Что-то пошло не так: {message}',
    },
    hints: {
      noPage: 'Откройте страницу, над которой хотите работать, или выберите что-нибудь на ней.',
      notHex: 'Установите сетку страницы на Hex (V) или Hex (H) в настройках страницы.',
      noPolygons:
        'Нарисуйте многоугольник, прямоугольник, эллипс или фигуру от руки вокруг области, выберите ее и повторите попытку.',
      emptyArea: 'Нарисуйте фигуру большего размера или проверьте настройки сетки страницы.',
      tooMany: 'Заполните меньшую область или разделите ее на несколько фигур.',
      noHexes:
        'Шестигранники находятся на переднем плане или на слое жетонов; переключитесь на этот слой, чтобы выбрать их.',
      unknownCommand: 'Введите !hexploration help, чтобы просмотреть список команд.',
      unknownSetting: 'Введите !hexploration set, чтобы увидеть все настройки.',
      calibrateNeedsTokens:
        'Привяжите токен к центру гекса и выделите его. Чтобы заодно исправить размер гекса, выделите второй токен, привязанный к соседнему гексу в той же строке (Hex V) или в том же столбце (Hex H).',
      calibrateFailed:
        'Два токена должны находиться в одной строке (Hex V) или в одном столбце (Hex H) на расстоянии не менее одного гекса друг от друга.',
      unexpected: 'Подробности в журнале консоли API.',
    },
    help: {
      menu: 'Покажите меню.',
      fill: 'Покройте выбранные нарисованные фигуры шестигранниками.',
      fillInverse: 'Закройте всю страницу, кроме выбранных фигур.',
      undo: 'Отмените последнюю заливку, инвертируйте заливку или скройте и восстановите использованные фигуры.',
      reveal: 'Покажите выбранные гексы, а также гексы под выбранными фигурами и жетонами.',
      revealPage: 'Раскройте каждый гекс на странице без объявлений.',
      conceal: 'Снова покройте область под выбранными фигурами и жетонами шестигранниками.',
      explore: 'Раскройте выбранные жетоны, как будто они только что туда переместились.',
      resetPage: 'Удалите все гексы на странице (сначала запрашивает подтверждение).',
      name: 'Назовите выбранные гексы или гексы под выбранными жетонами. Оставьте имя пустым, чтобы очистить его.',
      mark: 'Превратите выбранные жетоны в скрытые локации.',
      unmark: 'Препятствовать тому, чтобы выбранные токены были скрытыми местами.',
      set: 'Измените настройку или отобразите все настройки.',
      pageSet: 'Переопределить настройку отображения только на текущей странице.',
      pageClear: 'Удалить переопределения текущей страницы.',
      rescan: 'Перестройте список гексов страницы, например после копирования страницы или игры.',
      calibrate:
        'Выровняйте шестигранную сетку с помощью одного или двух выбранных жетонов, привязанных к шестигранным центрам.',
      calibrateReset: 'Удалить калибровку текущей страницы.',
      status: 'Покажите, что Hexploration знает о текущей странице.',
      journal: 'Пересоздайте раздаточные материалы «Помощь» и «Command Deck».',
      help: 'Покажите этот список.',
      handout: 'Полные инструкции приведены в раздаточном материале «{name}».',
    },
    deck: {
      drawDesc:
        'Обведите область фигурами, выделите их и нажмите «Заполнить». «Отменить заливку» отменяет последнюю заливку.',
      revealDesc:
        'Выделите гексы, фигуры или токены, чтобы раскрыть их или снова скрыть. «Исследовать» раскрывает гексы вокруг выбранных токенов, как если бы они туда переместились.',
      locationsDesc:
        'Выберите жетоны, чтобы скрыть их как места под гексами. Выберите гексы или жетоны, чтобы назвать гекс.',
      toolsDesc:
        'Настройки, переопределение страниц, статус, повторное сканирование скопированных страниц и калибровка сетки.',
      footer: 'Подробные инструкции см. в раздаточном материале «{help}».',
    },
    handout: {
      versionLabel: 'Версия',
      subtitle: 'Исследование гекс за гексом для Roll20',
      footer: 'Используйте раздаточный материал «{deck}» для управления одним щелчком мыши.',
      overview: {
        heading: 'Обзор',
        body: 'Hexploration закрывает гексовую карту непрозрачными гексами. По мере продвижения группы гексы, через которые она проходит (и, при желании, гексы вокруг них), удаляются, так что карта открывается гекс за гексом. Под гексами можно разместить скрытые локации — при обнаружении о них будет объявлено. Работает в играх Jumpgate и Legacy, на сетках Hex (V) и Hex (H) любого размера.',
        demo: 'Посмотрите короткую демонстрацию (из версии 1)',
      },
      quickStart: {
        heading: 'Быстрый старт',
        steps: [
          'Откройте страницу, для сетки которой установлено значение Hex (V) или Hex (H).',
          'Нарисуйте одну или несколько фигур (многоугольник, прямоугольник, эллипс или от руки) вокруг области, которую нужно скрыть.',
          'Выделите фигуры и нажмите «Заполнить» в Command Deck (или введите !hexploration fill). Фигуры заменятся гексами.',
          'Необязательно: перед заливкой выделите токены важных мест и нажмите «Отметить локацию». Они будут спрятаны под гексами, а при обнаружении о них будет объявлено.',
          'Переместите токен игрока. Каждый гекс, через который он проходит, и гексы в пределах его «Расстояния обзора» раскрываются.',
        ],
      },
      commands: {
        heading: 'Команды',
        intro:
          'Только GM могут использовать эти команды. Большинство действует на выбранные объекты; остальные действуют на просматриваемой вами странице.',
        colCommand: 'Команда',
        colDesc: 'Что он делает',
      },
      revealing: {
        heading: 'Как работает выявление',
        points: [
          'Гексы раскрывают только токены на слое токенов. Какие именно, задаёт настройка «Раскрывающие токены»: по умолчанию это токены игроков, поэтому ГМ может перемещать монстров, не открывая карту.',
          'Токен раскрывает каждый гекс, который он занимает (большие токены занимают несколько), а при включённой настройке «Раскрывать вдоль пути» — и каждый гекс на маршруте, по которому его перетаскивали, включая промежуточные точки.',
          '«Расстояние обзора» раскрывает гексы вокруг каждого из этих гексов, начиная с ближайших. Когда «Линия видимости» включена, гекс не раскрывается, пока между ним и токеном лежит закрытый гекс. Ближние гексы обычно раскрываются первыми, поэтому на открытой местности «Линия видимости» ничего не меняет: она важна, только если «Расстояние обзора» равно 2 или больше и есть гексы, которые остаются закрытыми, например местность, заполненная с параметром «Дальность раскрытия шестиугольников».',
          '«Дальность раскрытия шестиугольников» сохраняется в каждом гексе при его заполнении, поэтому задайте её до заполнения; последующее изменение не влияет на гексы, уже находящиеся на карте. Токен должен находиться в пределах этого количества гексов, чтобы раскрыть их, как бы далеко он ни видел, а при значении 0 они раскрываются, только когда в них входят. Для горного хребта: установите «Дальность раскрытия шестиугольников» на 0, заполните горы, снова очистите значение (без ограничений), затем заполните земли за ними. Если «Расстояние обзора» равно 3, а «Линия видимости» включена, отряд видит открытую местность вокруг себя, но не горы и не то, что лежит за ними. Каждый горный гекс раскрывается, когда в него входит токен.',
          'В режиме «Проблеск» гексы в пределах видимости не исчезают, а становятся полупрозрачными и удаляются, когда в них входит токен. Гексы, видимые в режиме «Проблеск», не загораживают обзор для параметра «Линия видимости».',
          'Roll20 рисует имена, полоски и ауры токенов поверх гексов. При включённой настройке «Скрывать токены под гексами» у токена под закрытым гексом отключаются видимые игрокам имя, полоски и ауры, пока его не откроют, так что спрятанные монстры не выдают себя. Если включить что-то из этого, пока токен закрыт, оно останется скрытым и включится, когда токен откроется.',
          'API не сообщает о перемещениях, сделанных другими модами. Перемещения TokenMod подхватываются автоматически; для других модов выделите токены и нажмите «Исследовать» или вызовите Hexploration.revealAround(token) из своего мода.',
        ],
      },
      locations: {
        heading: 'Именованные гексы и локации',
        points: [
          '«Отметить локацию» превращает выбранные токены в скрытые локации. Токен, уже находящийся под гексом, прячется сразу; иначе его спрячет следующая заливка, которая его накроет.',
          'Жетоны с маркером статуса белой башни также считаются локациями при заполнении, как и в версии 1.',
          'Жетоны скрытых локаций перемещаются на уровень GM. Когда их гекс раскрывается, они возвращаются на слой жетонов с указанием своего имени, и об их открытии объявляется.',
          '«Назвать гекс» даёт гексу имя без токена. Имя показывается ГМу в виде метки на слое ГМ и объявляется, когда гекс открывается.',
          '«Объявлять об открытиях» определяет, увидят ли объявление все, только ГМ или никто. «Пинговать находки» также переводит взгляд игроков на локацию.',
        ],
      },
      settings: {
        heading: 'Настройки',
        intro:
          'Меняйте настройки командой !hexploration set (или кнопкой «Настройки»). «Слой шестиугольников», «Раскрывающие токены» и «Язык» также можно задать на странице настроек мода.',
        colKey: 'Ключ',
        colName: 'Параметр',
        colDesc: 'Описание',
        perPage: '(Можно установить для каждой страницы.)',
      },
      jumpgate: {
        heading: 'Джампгейт и Наследие',
        points: [
          'Hexploration определяет, какой движок используется в игре, и рисует соответствующую форму. Фигуры, нарисованные в любом редакторе, можно закрашивать.',
          'Если для «Слоя шестиугольников» выбрано «Авто», гексы рисуются на слое переднего плана, над токенами, так что игроки не видят, что под ними. Если слой переднего плана недоступен, используется слой токенов.',
          'Jumpgate рисует математически правильные гексы, форма которых немного отличается от гексов Legacy. Если гексы не совпадают с сеткой страницы, привяжите токен к центру гекса, выделите его и нажмите «Калибровать». Чтобы заодно исправить размер гекса, выделите два токена в соседних гексах одной строки (Hex V) или одного столбца (Hex H).',
          'При копировании страницы или игры её гексы получают новые идентификаторы. Выполните «Пересканировать» на странице, чтобы снова найти их вместе с метками названий и токенами локаций.',
        ],
      },
      upgrading: {
        heading: 'Обновление с версии 1',
        points: [
          'Версия 2 больше не требует PathMath, MatrixMath, Vector Math или HTML Builder. Вы можете удалить их, если их не использует другой мод.',
          'Существующие гексовые карты, имена, токены локаций и настройки обновляются автоматически при первом запуске.',
          'Команды версии 1, включая макрос Hexploration_menu, по-прежнему работают.',
          'В версии 1 гексы мог раскрывать любой токен, представляющий персонажа. Чтобы сохранить такое поведение, установите для «Раскрывающие токены» значение «Токены персонажей».',
        ],
        colV1: 'Команда версии 1',
        colV2: 'Команда версии 2',
      },
      troubleshooting: {
        heading: 'Поиск неисправностей',
        points: [
          'При перемещении токена ничего не происходит: убедитесь, что токен находится на слое токенов и подходит под настройку «Раскрывающие токены», а на странице есть гексы (!hexploration status).',
          'Гексы смещены относительно сетки: нажмите «Калибровать», затем проверьте токеном несколько гексов в разных частях карты.',
          'Гексы перестали раскрываться после копирования страницы или игры: выполните «Пересканировать» на странице.',
          '«Заполнить» сообщает, что в области нет центров гексов: фигура должна содержать центр хотя бы одного гекса.',
          'В противном случае проверьте журнал консоли API и включите его сообщения при обращении за помощью.',
        ],
      },
      languages: {
        heading: 'Языки',
        body: 'Выберите язык командой !hexploration set language. Доступные языки:',
        colLanguage: 'Язык',
        colNative: 'Самоназвание',
        colCode: 'Код',
      },
      credits: {
        heading: 'Кредиты',
        original: 'Оригинальный мод от',
        maintainer: 'Версия 2 поддерживается',
        marketplace: 'Наборы произведений искусства Ады на торговой площадке Roll20',
        support:
          'Если вы обнаружили ошибку или у вас есть идея, напишите сообщение на форуме Roll20 Mod или откройте проблему на GitHub и включите все сообщения из журнала консоли API.',
      },
    },
  };

  const TRANSLATION$3 = {
    titles: {
      ready: 'Hexploration está listo.',
      settings: 'Configuración de Hexploration',
      languages: 'Elige un idioma',
      pageSettings: 'Configuración de página: {page}',
      status: 'Estado de Hexploration: {page}',
      help: 'Comandos de Hexploration',
      confirm: 'Por favor, confirme',
    },
    discovery: {
      title: 'Ubicación descubierta',
    },
    menu: {
      draw: 'Dibujar',
      reveal: 'Revelar y ocultar',
      locations: 'Ubicaciones',
      tools: 'Herramientas',
      layerInUse: 'Se están dibujando nuevos hexágonos en la {layer}.',
      pageSettingsHelp:
        'Esta configuración se aplica únicamente a esta página. Las configuraciones marcadas con ★ anulan la configuración global.',
    },
    buttons: {
      fill: 'Rellenar',
      fillInverse: 'Relleno inverso',
      undo: 'Deshacer relleno',
      reveal: 'Revelar',
      conceal: 'Ocultar',
      explore: 'Explorar',
      revealPage: 'Revelar página',
      resetPage: 'Restablecer página',
      mark: 'Marcar ubicación',
      unmark: 'Desmarcar',
      name: 'Nombrar hexágono',
      settings: 'Configuración',
      pageSettings: 'Configuración de página',
      status: 'Estado',
      rescan: 'Volver a escanear',
      calibrate: 'Calibrar',
      calibrateReset: 'Restablecer calibración',
      help: 'Ayuda',
      change: 'Cambiar',
      menu: 'Menú',
      clearOverrides: 'Borrar anulaciones',
      confirmReset: 'Sí, eliminar todos los hexágonos',
    },
    prompts: {
      name: 'Nombre de la ubicación (déjelo vacío para borrarlo)',
    },
    values: {
      on: 'Activado',
      off: 'Desactivado',
      none: 'Ninguno',
      hexLayer: {
        auto: 'Auto (primer plano si está disponible)',
        foreground: 'capa de primer plano',
        objects: 'capa de fichas',
      },
      revealBy: {
        players: 'Fichas de jugador',
        characters: 'Fichas de personaje',
        all: 'Todas las fichas',
      },
      revealMode: {
        clear: 'Despejar',
        glimpse: 'Vistazo',
      },
      announce: {
        all: 'Todos',
        gm: 'Solo el DJ',
        off: 'Desactivado',
      },
      orientation: {
        vertical: 'Hex (V)',
        horizontal: 'Hex (H)',
      },
      fillKind: {
        fill: 'Rellenar',
        fillInverse: 'Relleno inverso',
        conceal: 'Ocultar',
      },
    },
    settings: {
      language: {
        label: 'Idioma',
        desc: 'Idioma para menús, mensajes y folletos.',
      },
      hexLayer: {
        label: 'Capa de hexágonos',
        desc: 'Donde se dibujan nuevos hexágonos. Auto prueba la capa de primer plano (sobre las fichas) y vuelve a la capa de fichas si el juego no lo admite.',
      },
      fillColor: {
        label: 'Color de relleno',
        desc: 'Color de nuevos hexágonos. Utilice rgba() para hexágonos transparentes, por ejemplo rgba(0,0,0,0.8).',
      },
      strokeColor: {
        label: 'Color del borde',
        desc: 'Color del contorno de nuevos hexágonos.',
      },
      labelColor: {
        label: 'Color de la etiqueta',
        desc: 'Color de las etiquetas de nombres exclusivos para GM en hexágonos con nombre.',
      },
      glimpseColor: {
        label: 'Color de vistazo',
        desc: 'Color que toman los hexágonos al vislumbrarse (modo de revelación Vistazo). Use un color rgba() transparente.',
      },
      strokeWidth: {
        label: 'Ancho del borde',
        desc: 'Ancho del contorno de nuevos hexágonos, en píxeles (0 a 20).',
      },
      maxDistance: {
        label: 'Distancia de revelación de hexágonos',
        desc: 'Se guarda en los hexágonos cuando se rellenan, así que configúrelo antes de rellenar: cambiarlo después no afecta a los hexágonos que ya están en el mapa. Una ficha debe estar a esta cantidad de hexágonos como máximo para revelarlos, por muy lejos que pueda ver; con 0, sólo se revelan al entrar en ellos. Úselo para montañas o bosques. Déjelo vacío para no tener límite.',
      },
      revealDistance: {
        label: 'Distancia de visión',
        desc: 'Cuántos hexágonos se revelan alrededor de una ficha en movimiento (0 a 20). 0 revela sólo los hexágonos por los que pasa la ficha.',
      },
      lineOfSight: {
        label: 'Línea de visión',
        desc: 'Cuando está activado, los hexágonos que siguen cubiertos, como las montañas rellenadas con una Distancia de revelación de hexágonos, ocultan los hexágonos que hay detrás de ellos. Sólo tiene efecto con una Distancia de visión de 2 o más.',
      },
      revealPath: {
        label: 'Revelar a lo largo del camino',
        desc: 'Cuando está activado, se revela cada hexágono por el que pasa una ficha mientras es arrastrada (incluidos los puntos de ruta), no solo dónde se detiene.',
      },
      revealBy: {
        label: 'Fichas que revelan',
        desc: 'Qué fichas en la capa de fichas revelan hexágonos: fichas controladas por un jugador, fichas que representan cualquier personaje o todas las fichas.',
      },
      revealMode: {
        label: 'Modo de revelación',
        desc: 'Despejar elimina los hexágonos a la vista. Vistazo, en cambio, los vuelve transparentes; se eliminan cuando una ficha entra en ellos.',
      },
      announce: {
        label: 'Anunciar descubrimientos',
        desc: 'Quién ve el mensaje de chat cuando se descubre una ubicación con nombre.',
      },
      pingDiscoveries: {
        label: 'Hacer ping a los descubrimientos',
        desc: 'Cuando está activado, los jugadores reciben un ping a una ubicación con nombre cuando se descubre.',
      },
      hideCoveredTokens: {
        label: 'Ocultar fichas cubiertas',
        desc: 'Roll20 dibuja nombres, barras y auras sobre hexágonos. Cuando están activadas, las fichas bajo un hexágono cubierto tienen su nombre, barras y auras visibles para el jugador desactivadas y se vuelven a activar cuando se descubren.',
      },
    },
    status: {
      engine: 'Motor de juego',
      grid: 'Cuadrícula',
      layer: 'Capa de hexágonos',
      hexes: 'Hexágonos',
      named: 'Hexágonos con nombre',
      icons: 'Fichas de ubicación',
      glimpsed: 'Hexágonos vislumbrados',
      pending: 'Ubicaciones pendientes de relleno',
      calibrated: 'Calibrado',
      overrides: 'Anulaciones de página',
      undo: 'Deshacer disponible',
    },
    messages: {
      filled:
        'Relleno completado. Hexágonos dibujados: {created}. Con nuevo estilo: {restyled}. Ubicaciones ocultas: {icons}.',
      revealed: 'Hexágonos revelados: {count}.',
      revealedPage: 'Cada hexágono en la página revelado ({count}).',
      confirmReset:
        '¿Eliminar todos los hexágonos de "{page}" ({count})? Los tokens de ubicación regresan a la capa de tokens. Deshacer no puede revertir esto.',
      resetPage: 'Hexes eliminados de la página: {count}.',
      undone:
        'Último relleno deshecho. Hexágonos eliminados: {removed}. Hexágonos rediseñados restaurados: {restored}.',
      named: 'Hexágonos denominados "{name}": {count}.',
      unnamed: 'Nombres borrados: {count}.',
      marked:
        'Ubicaciones ocultas en hexágonos existentes: {attached}. Esperando el siguiente relleno que los cubra: {pending}.',
      unmarked: 'Tokens que ya no son ubicaciones: {count}.',
      settingChanged: '{setting} establecido en {value}.',
      rescanned:
        'Volver a escanear completo. Mantenido: {kept}. Adoptado: {adopted}. Representado nuevamente: {moved}. Desaparecido y olvidado: {dropped}. Etiquetas vinculadas nuevamente: {labels}. Tokens de ubicación vueltos a vincular: {icons}.',
      calibrated:
        'Cuadrícula calibrada (paso de columna {colStep}px, paso de fila {rowStep}px). Volver a escanear: mantuvo {kept}, volvió a presentar {moved}, adoptó {adopted}.',
      calibrationReset:
        'Se eliminó la calibración. Volver a escanear: mantuvo {kept}, volvió a presentar {moved}, adoptó {adopted}.',
      journalRebuilt: 'Se han reconstruido los folletos "{help}" y "{deck}".',
      migrated:
        'Tus mapas de hexágonos de Hexploration 1.x se han actualizado. Si este juego se copió de un juego Legacy, ejecuta Volver a escanear en cada página con mapa de hexágonos.',
      pruned:
        'Hexágonos guardados que ya no existen y fueron olvidados: {dropped}. Si este juego o página fue copiado, ejecuta Volver a escanear en la página para recuperar sus hexágonos nuevamente.',
      readyHint:
        'Escriba !hexploration para ver el menú o abra el folleto "Hexploration - Command Deck".',
    },
    warnings: {
      foregroundUnavailable:
        'Este juego no admite dibujar en la capa de primer plano, por lo que los hexágonos se dibujaron en la capa de fichas.',
      someFailed:
        'Hexágonos que no se pudieron dibujar: {count}. Consulte la consola API para obtener más detalles.',
    },
    errors: {
      noPage: 'No se pudo encontrar la página para trabajar.',
      notHex: 'Esta página no utiliza una cuadrícula hexagonal.',
      noPolygons: 'Seleccione una o más formas dibujadas para rellenar.',
      emptyArea: 'El área seleccionada no contiene ningún centro de hexágono.',
      tooMany: 'Eso crearía demasiados hexágonos de una sola vez ({count}).',
      nothingToConceal: 'Seleccione formas dibujadas o fichas para ocultar.',
      nothingToReveal: 'Selecciona hexágonos, formas dibujadas o fichas para revelar.',
      noTokens: 'Seleccione uno o más tokens primero.',
      noHexes: 'Selecciona uno o más hexágonos (o fichas que se encuentren en hexágonos) primero.',
      nothingToUndo: 'No hay ningún relleno que deshacer.',
      unknownCommand: 'Comando desconocido: {command}',
      unknownSetting: 'Configuración desconocida: {key}',
      unknownPageSetting: 'Configuraciones que se pueden establecer por página: {keys}',
      invalidValue: '"{value}" no es un valor válido para {key}.',
      calibrateNeedsTokens: 'Seleccione una o dos fichas ajustadas a centros de hexágonos.',
      calibrateFailed: 'Esas fichas no se pueden utilizar para calibrar.',
      unexpected: 'Algo salió mal: {message}',
    },
    hints: {
      noPage: 'Abra la página en la que desea trabajar o seleccione algo en ella.',
      notHex:
        'Establezca la cuadrícula de la página en Hex (V) o Hex (H) en Configuración de página.',
      noPolygons:
        'Dibuja un polígono, un rectángulo, una elipse o una forma a mano alzada alrededor del área, selecciónala y vuelve a intentarlo.',
      emptyArea:
        'Dibuja una forma más grande o verifica la configuración de la cuadrícula de la página.',
      tooMany: 'Rellene un área más pequeña o divida el área en varias formas.',
      noHexes:
        'Los hexágonos están en primer plano o en la capa de fichas; cambie a esa capa para seleccionarlas.',
      unknownCommand: 'Escriba !hexploration help para enumerar los comandos.',
      unknownSetting: 'Escriba !hexploration set para ver todas las configuraciones.',
      calibrateNeedsTokens:
        'Coloca una ficha en el centro de un hexágono y selecciónala. Seleccione una segunda ficha colocada en un hexágono vecino en la misma fila (Hex V) o columna (Hex H) para corregir también el tamaño del hex.',
      calibrateFailed:
        'Dos fichas deben estar en la misma fila (Hex V) o en la misma columna (Hex H), separadas por al menos un hex.',
      unexpected: 'Los detalles se encuentran en el registro de la consola API.',
    },
    help: {
      menu: 'Mostrar el menú.',
      fill: 'Cubre las formas dibujadas seleccionadas con hexágonos.',
      fillInverse: 'Cubre toda la página excepto el interior de las formas seleccionadas.',
      undo: 'Deshaga el último relleno, invierta el relleno u oculte y restaure las formas que utilizó.',
      reveal:
        'Revela los hexágonos seleccionados y los hexágonos debajo de las formas y fichas seleccionadas.',
      revealPage: 'Revela cada hexágono de la página sin anuncios.',
      conceal:
        'Cubre el área debajo de las formas y fichas seleccionadas con hexágonos nuevamente.',
      explore: 'Muestra las fichas seleccionadas como si acabaran de mudarse allí.',
      resetPage: 'Elimina todos los hexágonos de la página (pregunta primero).',
      name: 'Nombra los hexágonos seleccionados, o los hexágonos debajo de las fichas seleccionadas. Deje el nombre vacío para borrarlo.',
      mark: 'Convierte las fichas seleccionadas en ubicaciones ocultas.',
      unmark: 'Evite que los tokens seleccionados sean ubicaciones ocultas.',
      set: 'Cambie una configuración o muestre todas las configuraciones.',
      pageSet: 'Anula una configuración de revelación solo en la página actual.',
      pageClear: 'Elimine las anulaciones de la página actual.',
      rescan:
        'Reconstruye la lista de hexágonos de la página, por ejemplo, después de copiar una página o un juego.',
      calibrate:
        'Alinea la cuadrícula hexagonal con una o dos fichas seleccionadas encajadas en los centros hexagonales.',
      calibrateReset: 'Elimina la calibración de la página actual.',
      status: 'Muestra lo que Hexploration sabe sobre la página actual.',
      journal: 'Reconstruye los folletos de Ayuda y del Command Deck.',
      help: 'Muestra esta lista.',
      handout: 'Las instrucciones completas se encuentran en el folleto "{name}".',
    },
    deck: {
      drawDesc:
        'Dibuja formas alrededor de un área, selecciónalas y luego rellena. Deshacer relleno revierte el último relleno.',
      revealDesc:
        'Selecciona hexágonos, formas o fichas para revelarlos o volver a cubrirlos. Explorar revela alrededor de las fichas seleccionadas como si se hubieran movido.',
      locationsDesc:
        'Selecciona fichas para ocultarlas como ubicaciones debajo de hexágonos. Selecciona hexágonos o fichas para nombrar un hexágono.',
      toolsDesc:
        'Configuraciones, anulaciones de páginas, estado, volver a escanear páginas copiadas y calibrar la cuadrícula.',
      footer: 'Consulte el folleto "{help}" para obtener instrucciones completas.',
    },
    handout: {
      versionLabel: 'Versión',
      subtitle: 'Exploración hexágono por hexágono para Roll20',
      footer: 'Utilice el folleto "{deck}" para obtener controles con un solo clic.',
      overview: {
        heading: 'Descripción general',
        body: 'La hexploración cubre un mapa de hexágonos con hexágonos opacos. A medida que el grupo se mueve, los hexágonos por los que pasa (y, si lo desea, los hexágonos que los rodean) se eliminan, por lo que el mapa se descubre un hexágono a la vez. Las ubicaciones ocultas se pueden colocar debajo de hexágonos y se anuncian cuando se encuentran. Funciona en juegos Jumpgate y Legacy, en cuadrículas Hex (V) y Hex (H) de cualquier tamaño.',
        demo: 'Vea una breve demostración (de la versión 1)',
      },
      quickStart: {
        heading: 'Inicio rápido',
        steps: [
          'Abra una página cuya cuadrícula esté configurada en Hex (V) o Hex (H).',
          'Dibuja una o más formas (polígono, rectángulo, elipse o a mano alzada) alrededor del área a ocultar.',
          'Seleccione las formas y haga clic en Rellenar en el Command Deck (o escriba !hexploration fill). Las formas se sustituyen por hexágonos.',
          'Opcional: antes de completar, seleccione fichas para lugares importantes y haga clic en Marcar ubicación. Están ocultos debajo de los hexágonos y se anuncian cuando se descubren.',
          'Mueve una ficha de jugador. Se revelan cada hexágono por el que pasa y los hexágonos dentro de su distancia de visión.',
        ],
      },
      commands: {
        heading: 'Comandos',
        intro:
          'Sólo los GM pueden usar estos comandos. La mayoría actúa sobre los objetos seleccionados; el resto actúa sobre la página que estás viendo.',
        colCommand: 'Dominio',
        colDesc: 'que hace',
      },
      revealing: {
        heading: 'Cómo funciona la revelación',
        points: [
          'Solo las fichas de la capa de fichas revelan hexágonos. Qué fichas cuentan se define con Fichas que revelan: por defecto, las fichas de jugador, para que el DJ pueda mover monstruos sin descubrir el mapa.',
          'Una ficha revela cada hexágono que cubre (las fichas grandes cubren varios) y, con Revelar a lo largo del camino activado, cada hexágono de la ruta por la que fue arrastrado, incluidos los puntos de ruta.',
          'La Distancia de visión revela los hexágonos alrededor de cada uno de esos hexágonos, empezando por los más cercanos. Con la Línea de visión activada, un hexágono no se revela mientras haya un hexágono cubierto entre él y la ficha. Los hexágonos más cercanos suelen revelarse primero, así que en terreno abierto la Línea de visión no cambia nada: sólo importa con una Distancia de visión de 2 o más y hexágonos que siguen cubiertos, como el terreno rellenado con una Distancia de revelación de hexágonos.',
          'La Distancia de revelación de hexágonos se guarda en cada hexágono cuando se rellena, así que configúrela antes de rellenar; cambiarla después no afecta a los hexágonos que ya están en el mapa. Una ficha debe estar a esa cantidad de hexágonos como máximo para revelarlos, por muy lejos que pueda ver, y con 0 sólo se revelan al entrar en ellos. Para una cordillera: ponga la Distancia de revelación de hexágonos en 0, rellene las montañas, vuelva a dejarla sin límite y después rellene las tierras que hay más allá. Con una Distancia de visión de 3 y la Línea de visión activada, el grupo ve el terreno abierto a su alrededor, pero no las montañas ni lo que hay detrás de ellas. Cada hexágono de montaña se revela cuando una ficha entra en él.',
          'En el modo Vistazo, los hexágonos a la vista se vuelven transparentes en lugar de desaparecer, y se eliminan cuando una ficha entra en ellos. Los hexágonos transparentes del modo Vistazo no bloquean la Línea de visión.',
          'Roll20 dibuja los nombres, barras y auras de las fichas por encima de los hexágonos. Con Ocultar fichas cubiertas activado, una ficha bajo un hexágono cubierto tiene desactivados su nombre, barras y auras visibles para los jugadores hasta que se descubre, para que los monstruos ocultos no se delaten. Si activa alguno mientras la ficha está cubierta, permanece oculto y se activa cuando la ficha se descubre.',
          'La API no informa de los movimientos hechos por otros mods. Los movimientos de TokenMod se detectan automáticamente; para otros mods, seleccione las fichas y haga clic en Explorar, o llame a Hexploration.revealAround(token) desde su propio mod.',
        ],
      },
      locations: {
        heading: 'Hexágonos y ubicaciones con nombre',
        points: [
          'Marcar ubicación convierte las fichas seleccionadas en ubicaciones ocultas. Una ficha que ya está bajo un hexágono se oculta de inmediato; si no, la oculta el siguiente relleno que la cubra.',
          'Las fichas con el marcador de estado de la torre blanca también se tratan como ubicaciones cuando las llenas, como en la versión 1.',
          'Las fichas de ubicación oculta se mueven a la capa de GM. Cuando se revela su hexágono, regresan a la capa de fichas con su nombre mostrado y se anuncia su descubrimiento.',
          'Nombrar hexágono da un nombre a un hexágono sin usar ninguna ficha. El nombre se muestra al DJ como una etiqueta en la capa del DJ y se anuncia cuando se revela el hexágono.',
          'Anunciar descubrimientos elige si ven el anuncio todos, solo el DJ o nadie. Hacer ping a los descubrimientos también mueve la vista de los jugadores a la ubicación.',
        ],
      },
      settings: {
        heading: 'Ajustes',
        intro:
          'Cambie la configuración con !hexploration set (o el botón Configuración). Capa de hexágonos, Fichas que revelan e Idioma también se pueden configurar en la página de configuración del mod.',
        colKey: 'Llave',
        colName: 'Configuración',
        colDesc: 'Descripción',
        perPage: '(Se puede configurar por página).',
      },
      jumpgate: {
        heading: 'Jumpgate y legado',
        points: [
          'Hexploration determina qué motor utiliza el juego y dibuja el tipo de forma correspondiente. Las formas dibujadas en cualquiera de los editores se pueden rellenar.',
          'Con Capa de hexágonos en Auto, los hexágonos se dibujan en la capa de primer plano, encima de las fichas, para que los jugadores no puedan ver lo que hay debajo. Si la capa de primer plano no está disponible, se usa la capa de fichas.',
          'Jumpgate dibuja hexágonos matemáticamente regulares, cuya forma es ligeramente distinta de la de los hexágonos de Legacy. Si los hexágonos no se alinean con la cuadrícula de una página, ajuste una ficha al centro de un hexágono, selecciónela y haga clic en Calibrar. Seleccione dos fichas en hexágonos vecinos de la misma fila (Hex V) o columna (Hex H) para corregir también el tamaño del hexágono.',
          'Cuando se copia una página o un juego, sus hexágonos obtienen nuevos ID. Ejecute Volver a escanear en la página para recuperarlos, junto con sus etiquetas de nombre y fichas de ubicación.',
        ],
      },
      upgrading: {
        heading: 'Actualización desde la versión 1',
        points: [
          'La versión 2 ya no necesita PathMath, MatrixMath, Vector Math o HTML Builder. Puedes eliminarlos a menos que otro mod los use.',
          'Los mapas de hexágonos, nombres, fichas de ubicación y ajustes existentes se actualizan automáticamente la primera vez que se inicia.',
          'Los comandos de la versión 1, incluida la macro Hexploration_menu, todavía funcionan.',
          'La versión 1 permitía que cualquier ficha que representara a un personaje revelara hexágonos. Ajuste Fichas que revelan a Fichas de personaje para mantener ese comportamiento.',
        ],
        colV1: 'Comando versión 1',
        colV2: 'Comando versión 2',
      },
      troubleshooting: {
        heading: 'Solución de problemas',
        points: [
          'No pasa nada cuando una ficha se mueve: compruebe que la ficha está en la capa de fichas y coincide con Fichas que revelan, y que la página tiene hexágonos (!hexploration status).',
          'Los hexágonos están desplazados de la cuadrícula: usa Calibrar, luego verifica con una ficha en algunos hexágonos del mapa.',
          'Los hexágonos dejaron de revelarse tras copiar una página o un juego: ejecute Volver a escanear en la página.',
          'Rellenar dice que el área no tiene centros de hexágono: la forma debe contener el centro de al menos un hexágono.',
          'Para cualquier otra cosa, consulte el registro de la consola API e incluya sus mensajes cuando solicite ayuda.',
        ],
      },
      languages: {
        heading: 'Idiomas',
        body: 'Elija un idioma con !hexploration set language. Idiomas disponibles:',
        colLanguage: 'Idioma',
        colNative: 'Nombre original',
        colCode: 'Código',
      },
      credits: {
        heading: 'Créditos',
        original: 'Mod original de',
        maintainer: 'Versión 2 mantenida por',
        marketplace: 'Paquetes de arte de Ada en Roll20 Marketplace',
        support:
          'Si encuentra un error o tiene una idea, publíquelo en el foro Roll20 Mod o abra un problema en GitHub e incluya cualquier mensaje del registro de la consola API.',
      },
    },
  };

  const TRANSLATION$2 = {
    titles: {
      ready: 'Hexploration är redo.',
      settings: 'Hexploration-inställningar',
      languages: 'Välj ett språk',
      pageSettings: 'Sidinställningar: {page}',
      status: 'Hexploration-status: {page}',
      help: 'Hexploration-kommandon',
      confirm: 'Vänligen bekräfta',
    },
    discovery: {
      title: 'Plats upptäckt',
    },
    menu: {
      draw: 'Rita',
      reveal: 'Avslöja och dölj',
      locations: 'Platser',
      tools: 'Verktyg',
      layerInUse: 'Nya hexar ritas på {layer}.',
      pageSettingsHelp:
        'Dessa inställningar gäller endast för denna sida. Inställningar markerade ★ åsidosätter de globala inställningarna.',
    },
    buttons: {
      fill: 'Fyll',
      fillInverse: 'Omvänd fyllning',
      undo: 'Ångra fyllning',
      reveal: 'Avslöja',
      conceal: 'Dölj',
      explore: 'Utforska',
      revealPage: 'Avslöja sida',
      resetPage: 'Återställ sida',
      mark: 'Markera plats',
      unmark: 'Avmarkera',
      name: 'Namnge hex',
      settings: 'Inställningar',
      pageSettings: 'Sidinställningar',
      status: 'Status',
      rescan: 'Skanna igen',
      calibrate: 'Kalibrera',
      calibrateReset: 'Återställ kalibrering',
      help: 'Hjälp',
      change: 'Ändra',
      menu: 'Meny',
      clearOverrides: 'Rensa åsidosättningar',
      confirmReset: 'Ja, ta bort alla hexar',
    },
    prompts: {
      name: 'Platsnamn (låt vara tomt för att rensa)',
    },
    values: {
      on: 'På',
      off: 'Av',
      none: 'Ingen',
      hexLayer: {
        auto: 'Auto (förgrund om tillgängligt)',
        foreground: 'förgrundslagret',
        objects: 'tokenlagret',
      },
      revealBy: {
        players: 'Spelartokens',
        characters: 'Rollpersonstokens',
        all: 'Alla tokens',
      },
      revealMode: {
        clear: 'Rensa',
        glimpse: 'Glimt',
      },
      announce: {
        all: 'Alla',
        gm: 'Endast GM',
        off: 'Av',
      },
      orientation: {
        vertical: 'Hex (V)',
        horizontal: 'Hex (H)',
      },
      fillKind: {
        fill: 'Fyll',
        fillInverse: 'Omvänd fyllning',
        conceal: 'Dölj',
      },
    },
    settings: {
      language: {
        label: 'Språk',
        desc: 'Språk för menyer, meddelanden och åhörarkopior.',
      },
      hexLayer: {
        label: 'Lager för hexar',
        desc: 'Där nya hexar ritas. Auto provar förgrundslagret (ovanför tokens) och faller tillbaka till tokenlagret om spelet inte stöder det.',
      },
      fillColor: {
        label: 'Fyllningsfärg',
        desc: 'Färg på nya hexar. Använd rgba() för genomskinliga hexar, till exempel rgba(0,0,0,0.8).',
      },
      strokeColor: {
        label: 'Kantfärg',
        desc: 'Färg på konturerna av nya sexkanter.',
      },
      labelColor: {
        label: 'Etikettfärg',
        desc: 'Färgen på namnetiketterna endast för GM på namngivna sexkanter.',
      },
      glimpseColor: {
        label: 'Glimtfärg',
        desc: 'Färgen som hexar byter till när de skymtas (avslöjandeläget Glimt). Använd en genomskinlig rgba()-färg.',
      },
      strokeWidth: {
        label: 'Kantbredd',
        desc: 'Bredden på konturerna av nya hex, i pixlar (0 till 20).',
      },
      maxDistance: {
        label: 'Avslöjandeavstånd för hexar',
        desc: 'Lagras på hexarna när de fylls, så ställ in det innan du fyller: att ändra det senare påverkar inte hexar som redan finns på kartan. En token måste vara inom så många hexar för att avslöja dem, hur långt den än kan se; med 0 avslöjas de bara när man går in i dem. Använd det för berg eller skogar. Lämna tomt för ingen gräns.',
      },
      revealDistance: {
        label: 'Siktavstånd',
        desc: 'Hur många hexar runt en rörlig token som avslöjas (0 till 20). 0 avslöjar endast de hexar som token passerar igenom.',
      },
      lineOfSight: {
        label: 'Siktlinje',
        desc: 'När den är på döljer hexar som förblir täckta, till exempel berg som fyllts med ett Avslöjandeavstånd för hexar, hexarna bakom dem. Det gör bara skillnad med ett Siktavstånd på 2 eller mer.',
      },
      revealPath: {
        label: 'Avslöja längs vägen',
        desc: 'När den är på avslöjas varje hex som en token passerar genom medan den dras (inklusive waypoints), inte bara där den stannar.',
      },
      revealBy: {
        label: 'Tokens som avslöjar',
        desc: 'Vilka tokens på tokenlagret avslöjar hexes: tokens som kontrolleras av en spelare, tokens som representerar vilken karaktär som helst eller varje token.',
      },
      revealMode: {
        label: 'Avslöjandeläge',
        desc: 'Rensa tar bort hexar inom synhåll. Glimt gör dem i stället genomskinliga; de tas bort när en token går in i dem.',
      },
      announce: {
        label: 'Tillkännage upptäckter',
        desc: 'Vem ser chattmeddelandet när en namngiven plats upptäcks.',
      },
      pingDiscoveries: {
        label: 'Pinga upptäckter',
        desc: 'När den är på pingas spelare till en namngiven plats när den upptäcks.',
      },
      hideCoveredTokens: {
        label: 'Dölj täckta tokens',
        desc: 'Roll20 ritar namn, staplar och auror ovanför hexen. När de är på, har tokens under en täckt sexkant sitt spelare-synliga namn, staplar och auror avstängda och påslagna igen när de avslöjas.',
      },
    },
    status: {
      engine: 'Spelmotor',
      grid: 'Rutnät',
      layer: 'Hexlager',
      hexes: 'Hexar',
      named: 'Namngivna hexar',
      icons: 'Platstokens',
      glimpsed: 'Genomskinliga hexar',
      pending: 'Platser som väntar på fyllning',
      calibrated: 'Kalibrerad',
      overrides: 'Sidåsidosättningar',
      undo: 'Ångra tillgängligt',
    },
    messages: {
      filled: 'Fyllning klar. Hex ritade: {created}. Omstylad: {restyled}. Gömda platser: {icons}.',
      revealed: 'Hexen avslöjade: {count}.',
      revealedPage: 'Varje hex på sidan avslöjas ({count}).',
      confirmReset:
        'Ta bort varje hex från "{page}" ({count})? Platssymboler återgår till tokenlagret. Ångra kan inte ångra detta.',
      resetPage: 'Hexen har tagits bort från sidan: {count}.',
      undone:
        'Senaste fyllningen ångrad. Borttagna hexar: {removed}. Omstylade hexar som återställts: {restored}.',
      named: 'Hex med namnet "{name}": {count}.',
      unnamed: 'Namn raderade: {count}.',
      marked:
        'Platser dolda i befintliga hexar: {attached}. Väntar på nästa fyllning som täcker dem: {pending}.',
      unmarked: 'Tokens som inte längre är platser: {count}.',
      settingChanged: '{setting} inställd på {value}.',
      rescanned:
        'Omsökningen är klar. Sparade: {kept}. Antagen: {adopted}. Återarkiverad: {moved}. Saknas och glöms: {dropped}. Etiketter återlänkade: {labels}. Platstokens återlänkade: {icons}.',
      calibrated:
        'Rutnät kalibrerat (kolumnsteg {colStep}px, radsteg {rowStep}px). Skanna om: behöll {kept}, arkiverade på nytt {moved}, antog {adopted}.',
      calibrationReset:
        'Kalibrering har tagits bort. Skanna om: behöll {kept}, arkiverade på nytt {moved}, antog {adopted}.',
      journalRebuilt: '"{help}" och "{deck}" har byggts om.',
      migrated:
        'Dina hexkartor från Hexploration 1.x har uppgraderats. Om det här spelet kopierades från ett Legacy-spel kör du Skanna igen på varje sida med en hexkarta.',
      pruned:
        'Sparade hexar som inte längre finns och har glömts bort: {dropped}. Om det här spelet eller sidan kopierades kör du Skanna igen på sidan för att hitta dess hexar igen.',
      readyHint:
        'Skriv !hexploration för menyn, eller öppna handouten "Hexploration - Command Deck".',
    },
    warnings: {
      foregroundUnavailable:
        'Det här spelet stöder inte ritning på förgrundslagret, så hexadecken ritades på tokenlagret.',
      someFailed: 'Hex som inte kunde ritas: {count}. Kontrollera API-konsolen för detaljer.',
    },
    errors: {
      noPage: 'Kunde inte hitta sidan att arbeta på.',
      notHex: 'Den här sidan använder inte ett hex-rutnät.',
      noPolygons: 'Välj en eller flera ritade former att fylla.',
      emptyArea: 'Det valda området innehåller inga hexa-center.',
      tooMany: 'Det skulle skapa för många hexar på en gång ({count}).',
      nothingToConceal: 'Välj ritade former eller tokens att dölja.',
      nothingToReveal: 'Välj hex, ritade former eller polletter att avslöja.',
      noTokens: 'Välj först en eller flera tokens.',
      noHexes: 'Välj en eller flera hexes (eller polletter som står på hexes) först.',
      nothingToUndo: 'Det finns ingen fyllning att ångra.',
      unknownCommand: 'Okänt kommando: {command}',
      unknownSetting: 'Okänd inställning: {key}',
      unknownPageSetting: 'Inställningar som kan ställas in per sida: {keys}',
      invalidValue: '"{value}" är inte ett giltigt värde för {key}.',
      calibrateNeedsTokens: 'Välj en eller två polletter som knäpps till hexade centra.',
      calibrateFailed: 'Dessa tokens kan inte användas för att kalibrera.',
      unexpected: 'Något gick fel: {message}',
    },
    hints: {
      noPage: 'Öppna sidan du vill arbeta på eller välj något på den.',
      notHex: 'Ställ in sidrutnätet på Hex (V) eller Hex (H) i Sidinställningar.',
      noPolygons:
        'Rita en polygon, rektangel, ellips eller frihandsform runt området, markera det och försök sedan igen.',
      emptyArea: 'Rita en större form eller kontrollera inställningarna för sidrutnätet.',
      tooMany: 'Fyll ett mindre område, eller dela området i flera former.',
      noHexes: 'Hex är på förgrunden eller symbollagret; växla till det lagret för att välja dem.',
      unknownCommand: 'Skriv !hexploration help för att lista kommandona.',
      unknownSetting: 'Skriv !hexploration set för att se alla inställningar.',
      calibrateNeedsTokens:
        'Fäst en token i mitten av en hex och välj den. Välj en andra token som fästs på en intilliggande hex i samma rad (Hex V) eller kolumn (Hex H) för att korrigera hexstorleken också.',
      calibrateFailed:
        'Två tokens måste ligga i samma rad (Hex V) eller samma kolumn (Hex H), minst en hex från varandra.',
      unexpected: 'Detaljer finns i API-konsolloggen.',
    },
    help: {
      menu: 'Visa menyn.',
      fill: 'Täck de utvalda ritade formerna med hex.',
      fillInverse: 'Täck hela sidan utom inuti de valda formerna.',
      undo: 'Ångra den sista fyllningen, inverterad fyllning eller dölj och återställ formerna den använde.',
      reveal: 'Avslöja de valda hexen och hexen under de valda formerna och symbolerna.',
      revealPage: 'Avslöja varje hex på sidan utan tillkännagivanden.',
      conceal: 'Täck området under de valda formerna och polletterna med hexar igen.',
      explore: 'Avslöja runt de valda tokens som om de precis hade flyttat dit.',
      resetPage: 'Ta bort varje hex på sidan (frågar först).',
      name: 'Namnge de valda hexorna, eller hexarna under de valda polletterna. Lämna namnet tomt för att rensa det.',
      mark: 'Förvandla de valda tokens till dolda platser.',
      unmark: 'Stoppa de valda tokens från att vara dolda platser.',
      set: 'Ändra en inställning eller visa alla inställningar.',
      pageSet: 'Åsidosätt en avslöjningsinställning endast på den aktuella sidan.',
      pageClear: 'Ta bort den aktuella sidans åsidosättningar.',
      rescan:
        'Bygg om sidans hex-lista, till exempel efter att du kopierat en sida eller ett spel.',
      calibrate: 'Rada hex-rutnätet med en eller två utvalda tokens fästa till hex-centrum.',
      calibrateReset: 'Ta bort den aktuella sidans kalibrering.',
      status: 'Visa vad Hexploration vet om den aktuella sidan.',
      journal: 'Bygg om handouterna Help och Command Deck.',
      help: 'Visa den här listan.',
      handout: 'Fullständiga instruktioner finns i "{name}" handout.',
    },
    deck: {
      drawDesc:
        'Rita former runt ett område, markera dem och fyll sedan. Ångra fyllning tar bort den senaste fyllningen.',
      revealDesc:
        'Välj hexar, former eller tokens för att avslöja dem eller täcka dem igen. Utforska avslöjar runt valda tokens som om de hade flyttats dit.',
      locationsDesc:
        'Välj tokens för att dölja dem som platser under hex. Välj hex eller token för att namnge en hex.',
      toolsDesc:
        'Inställningar, sidöverstyrningar, status, skanna om kopierade sidor och kalibrering av rutnätet.',
      footer: 'Se "{help}"-handouten för fullständiga instruktioner.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Hex-by-hex-utforskning för Roll20',
      footer: 'Använd "{deck}"-handouten för kontroller med ett klick.',
      overview: {
        heading: 'Översikt',
        body: 'Hexploration täcker en hex-karta med ogenomskinliga hexes. När sällskapet rör sig tas hexen de passerar igenom (och, om du vill, hexen runt dem) bort, så kartan avslöjas en hex i taget. Dolda platser kan placeras under hex och meddelas när de hittas. Det fungerar i Jumpgate och Legacy-spel, på Hex (V) och Hex (H) rutnät av alla storlekar.',
        demo: 'Se en kort demo (från version 1)',
      },
      quickStart: {
        heading: 'Snabbstart',
        steps: [
          'Öppna en sida vars rutnät är inställt på Hex (V) eller Hex (H).',
          'Rita en eller flera former (polygon, rektangel, ellips eller frihand) runt området för att dölja.',
          'Markera formerna och klicka på Fyll i Command Deck (eller skriv !hexploration fill). Formerna ersätts av hexar.',
          'Valfritt: innan du fyller, välj tokens för viktiga platser och klicka på Markera plats. De är gömda under hexen och tillkännages när de upptäcks.',
          'Flytta en spelartoken. Varje hex den passerar, och hexarna inom dess Siktavstånd, avslöjas.',
        ],
      },
      commands: {
        heading: 'Kommandon',
        intro:
          'Endast GM:er kan använda dessa kommandon. De flesta agerar på de valda objekten; resten agerar på sidan du tittar på.',
        colCommand: 'Kommando',
        colDesc: 'Vad den gör',
      },
      revealing: {
        heading: 'Hur avslöjande fungerar',
        points: [
          'Endast tokens på tokenlagret avslöjar hexar. Vilka tokens som räknas bestäms av Tokens som avslöjar: spelartokens som standard, så att GM kan flytta monster utan att avslöja kartan.',
          'En token avslöjar varje hex den täcker (stora tokens täcker flera) och, med Avslöja längs vägen på, varje hex på rutten den drogs längs, inklusive mellanpunkter.',
          'Siktavstånd avslöjar hexarna runt var och en av dessa hexar, de närmaste först. Med Siktlinje på avslöjas en hex inte så länge en täckt hex ligger mellan den och token. Närmare hexar avslöjas oftast först, så i öppen terräng ändrar Siktlinje ingenting: den spelar bara roll med ett Siktavstånd på 2 eller mer och hexar som förblir täckta, till exempel terräng som fyllts med ett Avslöjandeavstånd för hexar.',
          'Avslöjandeavstånd för hexar lagras på varje hex när den fylls, så ställ in det innan du fyller; att ändra det senare påverkar inte hexar som redan finns på kartan. En token måste vara inom så många hexar för att avslöja dem, hur långt den än kan se, och med 0 avslöjas de bara när man går in i dem. För en bergskedja: ställ in Avslöjandeavstånd för hexar på 0, fyll bergen, återställ det till inget och fyll sedan landet bortom. Med Siktavstånd 3 och Siktlinje på ser gruppen den öppna marken runt sig, men inte bergen eller det som ligger bakom dem. Varje berghex avslöjas när en token går in i den.',
          'I läget Glimt blir hexar inom synhåll genomskinliga i stället för att försvinna, och de tas bort när en token går in i dem. Genomskinliga Glimt-hexar blockerar inte Siktlinje.',
          'Roll20 ritar tokennamn, staplar och auror ovanpå hexarna. Med Dölj täckta tokens på stängs det namn, de staplar och de auror som spelarna kan se av för en token under en täckt hex tills den avtäcks, så att dolda monster inte avslöjar sig. Om du slår på något av dem medan token är täckt förblir det dolt och slås på när token avtäcks.',
          'API:et rapporterar inte förflyttningar som görs av andra moddar. TokenMod-förflyttningar fångas upp automatiskt; för andra moddar markerar du tokens och klickar på Utforska, eller anropar Hexploration.revealAround(token) från din egen mod.',
        ],
      },
      locations: {
        heading: 'Namngivna Hex och platser',
        points: [
          'Markera plats förvandlar de valda tokens till dolda platser. En token redan under en hex döljs direkt; annars döljs den av nästa fyllning som täcker den.',
          'Tokens med statusmarkören för det vita tornet behandlas också som platser när du fyller, som i version 1.',
          'Dolda platssymboler flyttas till GM-lagret. När deras hex avslöjas återvänder de till tokenlagret med deras namn visat, och deras upptäckt tillkännages.',
          'Namnge hex ger en hex ett namn utan en token. Namnet visas för GM som en etikett på GM-lagret och tillkännages när hexen avslöjas.',
          'Tillkännage upptäckter väljer om alla, bara GM eller ingen ser tillkännagivandet. Pinga upptäckter flyttar också spelarnas vy till platsen.',
        ],
      },
      settings: {
        heading: 'Inställningar',
        intro:
          'Ändra inställningar med !hexploration set (eller knappen Inställningar). Lager för hexar, Tokens som avslöjar och Språk kan också ställas in på modens inställningssida.',
        colKey: 'Nyckel',
        colName: 'Miljö',
        colDesc: 'Beskrivning',
        perPage: '(Kan ställas in per sida.)',
      },
      jumpgate: {
        heading: 'Jumpgate och Legacy',
        points: [
          'Hexploration tar reda på vilken motor spelet använder och ritar den matchande formen. Former ritade i någon av editorerna kan fyllas.',
          'När Lager för hexar är inställt på Auto ritas hexar på förgrundslagret, ovanför tokens, så att spelarna inte kan se vad som finns under. Om förgrundslagret inte är tillgängligt används tokenlagret i stället.',
          'Jumpgate ritar matematiskt regelbundna hexar, som har en något annan form än Legacy-hexar. Om hexarna inte stämmer med en sidas rutnät, fäst en token i mitten av en hex, markera den och klicka på Kalibrera. Markera två tokens i angränsande hexar i samma rad (Hex V) eller kolumn (Hex H) för att även korrigera hexstorleken.',
          'När en sida eller ett spel kopieras får dess hexar nya ID:n. Kör Skanna igen på sidan för att hitta dem igen, tillsammans med deras namnetiketter och platstokens.',
        ],
      },
      upgrading: {
        heading: 'Uppgraderar från version 1',
        points: [
          'Version 2 behöver inte längre PathMath, MatrixMath, Vector Math eller HTML Builder. Du kan ta bort dem om inte en annan mod använder dem.',
          'Befintliga hexkartor, namn, platstokens och inställningar uppgraderas automatiskt vid första starten.',
          'Version 1-kommandona, inklusive makrot Hexploration_menu, fungerar fortfarande.',
          'I version 1 kunde varje token som representerade en rollperson avslöja hexar. Ställ in Tokens som avslöjar på Rollpersonstokens för att behålla det beteendet.',
        ],
        colV1: 'Kommandot version 1',
        colV2: 'Kommandot version 2',
      },
      troubleshooting: {
        heading: 'Felsökning',
        points: [
          'Ingenting händer när en token flyttas: kontrollera att token ligger på tokenlagret och matchar Tokens som avslöjar, och att sidan har hexar (!hexploration status).',
          'Hexen är förskjutna från rutnätet: använd Kalibrera och kontrollera sedan med en token på några hexar över kartan.',
          'Hexar slutade avslöjas efter att en sida eller ett spel kopierats: kör Skanna igen på sidan.',
          'Fyll säger att området inte innehåller några hexmittpunkter: formen måste innehålla mittpunkten på minst en hex.',
          'För allt annat, kontrollera API-konsolloggen och inkludera dess meddelanden när du ber om hjälp.',
        ],
      },
      languages: {
        heading: 'Språk',
        body: 'Välj ett språk med !hexploration set språk. Tillgängliga språk:',
        colLanguage: 'Språk',
        colNative: 'Eget namn',
        colCode: 'Koda',
      },
      credits: {
        heading: 'Krediter',
        original: 'Originalmod av',
        maintainer: 'Version 2 underhålls av',
        marketplace: 'Adas konstpaket på Roll20 Marketplace',
        support:
          'Om du hittar en bugg eller har en idé, posta i Roll20 Mod-forumet eller öppna ett problem på GitHub och inkludera eventuella meddelanden från API-konsolloggen.',
      },
    },
  };

  const TRANSLATION$1 = {
    titles: {
      ready: 'Hexploration hazır.',
      settings: 'Hexploration Ayarları',
      languages: 'Bir Dil Seçin',
      pageSettings: 'Sayfa Ayarları: {page}',
      status: 'Hexploration Durumu: {page}',
      help: 'Hexploration Komutları',
      confirm: 'Lütfen Onaylayın',
    },
    discovery: {
      title: 'Konum Keşfedildi',
    },
    menu: {
      draw: 'Çizim',
      reveal: 'Açığa Çıkarma ve Gizleme',
      locations: 'Konumlar',
      tools: 'Araçlar',
      layerInUse: 'Yeni altıgenler şu katmana çiziliyor: {layer}.',
      pageSettingsHelp:
        'Bu ayarlar yalnızca bu sayfa için geçerlidir. ★ işaretli ayarlar genel ayarları geçersiz kılar.',
    },
    buttons: {
      fill: 'Doldur',
      fillInverse: 'Ters Doldur',
      undo: 'Doldurmayı Geri Al',
      reveal: 'Açığa Çıkar',
      conceal: 'Gizle',
      explore: 'Keşfet',
      revealPage: 'Sayfayı Açığa Çıkar',
      resetPage: 'Sayfayı Sıfırla',
      mark: 'Konumu İşaretle',
      unmark: 'İşareti Kaldır',
      name: 'Altıgeni Adlandır',
      settings: 'Ayarlar',
      pageSettings: 'Sayfa Ayarları',
      status: 'Durum',
      rescan: 'Yeniden Tara',
      calibrate: 'Kalibre Et',
      calibrateReset: 'Kalibrasyonu Sıfırla',
      help: 'Yardım',
      change: 'Değiştir',
      menu: 'Menü',
      clearOverrides: 'Geçersiz Kılmaları Temizle',
      confirmReset: 'Evet, Tüm Altıgenleri Kaldır',
    },
    prompts: {
      name: 'Konum adı (temizlemek için boş bırakın)',
    },
    values: {
      on: 'Açık',
      off: 'Kapalı',
      none: 'Hiçbiri',
      hexLayer: {
        auto: 'Otomatik (varsa ön plan)',
        foreground: 'ön plan katmanı',
        objects: 'jeton katmanı',
      },
      revealBy: {
        players: 'Oyuncu jetonları',
        characters: 'Karakter jetonları',
        all: 'Tüm jetonlar',
      },
      revealMode: {
        clear: 'Temizleme',
        glimpse: 'Bakış',
      },
      announce: {
        all: 'Herkes',
        gm: 'Yalnızca GM',
        off: 'Kapalı',
      },
      orientation: {
        vertical: 'Hex (V)',
        horizontal: 'Hex (H)',
      },
      fillKind: {
        fill: 'Doldurma',
        fillInverse: 'Ters Doldurma',
        conceal: 'Gizleme',
      },
    },
    settings: {
      language: {
        label: 'Dil',
        desc: 'Menüler, mesajlar ve broşürler için dil.',
      },
      hexLayer: {
        label: 'Altıgen Katmanı',
        desc: 'Yeni altıgenlerin çizildiği yer. Otomatik, ön plan katmanını (jetonların üstünde) dener; oyun bunu desteklemiyorsa jeton katmanına geri döner.',
      },
      fillColor: {
        label: 'Dolgu Rengi',
        desc: 'Yeni altıgenlerin rengi. Şeffaf altıgenler için rgba() kullanın; örneğin rgba(0,0,0,0.8).',
      },
      strokeColor: {
        label: 'Kenarlık Rengi',
        desc: 'Yeni altıgenlerin ana hatlarının rengi.',
      },
      labelColor: {
        label: 'Etiket Rengi',
        desc: 'Adlandırılmış altıgenlerdeki yalnızca GM ad etiketlerinin rengi.',
      },
      glimpseColor: {
        label: 'Bakış Rengi',
        desc: 'Altıgenlerin Bakış modunda aldığı renk. Yarı saydam bir rgba() rengi kullanın.',
      },
      strokeWidth: {
        label: 'Kenarlık Kalınlığı',
        desc: 'Yeni altıgenlerin ana hattının genişliği, piksel cinsinden (0 ila 20).',
      },
      maxDistance: {
        label: 'Altıgen Açığa Çıkarma Mesafesi',
        desc: 'Altıgenler doldurulurken onlara kaydedilir, bu yüzden doldurmadan önce ayarlayın: sonradan değiştirmek haritada zaten bulunan altıgenleri etkilemez. Bir jeton ne kadar uzağı görürse görsün, altıgenleri açığa çıkarmak için bu kadar altıgen mesafede olmalıdır; 0 ile yalnızca içlerine girilerek açığa çıkarlar. Dağlar veya ormanlar için kullanın. Sınır olmaması için boş bırakın.',
      },
      revealDistance: {
        label: 'Görüş Mesafesi',
        desc: 'Hareket eden bir jetonun etrafındaki kaç tane altıgen ortaya çıkar (0 ila 20). 0 yalnızca belirtecin geçtiği altıgenleri ortaya çıkarır.',
      },
      lineOfSight: {
        label: 'Görüş Hattı',
        desc: 'Açıkken, Altıgen Açığa Çıkarma Mesafesi ile doldurulmuş dağlar gibi örtülü kalan altıgenler, arkalarındaki altıgenleri gizler. Yalnızca 2 veya daha fazla Görüş Mesafesi ile fark yaratır.',
      },
      revealPath: {
        label: 'Yol Boyunca Açığa Çıkar',
        desc: 'Açık olduğunda, bir jetonun sürüklenirken geçtiği her altıgen (ara noktalar dahil) yalnızca durduğu yer değil, ortaya çıkar.',
      },
      revealBy: {
        label: 'Açığa Çıkaran Jetonlar',
        desc: 'Jeton katmanındaki hangi jetonlar altıgenleri ortaya çıkarır: bir oyuncu tarafından kontrol edilen jetonlar, herhangi bir karakteri temsil eden jetonlar veya her jeton.',
      },
      revealMode: {
        label: 'Açığa Çıkarma Modu',
        desc: 'Temizleme, görüş alanındaki altıgenleri kaldırır. Bakış ise onları yarı saydam yapar; içlerine bir jeton girdiğinde kaldırılırlar.',
      },
      announce: {
        label: 'Keşifleri Duyur',
        desc: 'Adlandırılmış bir konum keşfedildiğinde sohbet mesajını kimler görür?',
      },
      pingDiscoveries: {
        label: 'Keşifleri Pingle',
        desc: 'Açık olduğunda, oyuncular keşfedildiklerinde adlandırılmış bir konuma ping atılır.',
      },
      hideCoveredTokens: {
        label: 'Örtülü Jetonları Gizle',
        desc: 'Roll20 altıgenlerin üzerine isimleri, çubukları ve auraları çizer. Açıkken, kapalı bir altıgen altındaki jetonların oyuncuların görebileceği adları vardır, çubuklar ve auralar kapatılır ve açığa çıktıklarında tekrar açılır.',
      },
    },
    status: {
      engine: 'Oyun motoru',
      grid: 'Izgara',
      layer: 'Altıgen katmanı',
      hexes: 'Altıgenler',
      named: 'Adlandırılmış altıgenler',
      icons: 'Konum jetonları',
      glimpsed: 'Bakış altındaki altıgenler',
      pending: 'Doldurma bekleyen konumlar',
      calibrated: 'Kalibre edildi',
      overrides: 'Sayfa geçersiz kılmaları',
      undo: 'Geri alma mevcut',
    },
    messages: {
      filled:
        'Doldurma tamamlandı. Çizilen altıgenler: {created}. Yeniden stil: {restyled}. Gizlenen konumlar: {icons}.',
      revealed: 'Büyüler ortaya çıktı: {count}.',
      revealedPage: 'Sayfadaki her altıgen ortaya çıktı ({count}).',
      confirmReset:
        '"{page}" ({count}) öğesindeki her altıgen kaldırılsın mı? Konum belirteçleri, belirteç katmanına geri döner. Geri alma işlemi bunu tersine çeviremez.',
      resetPage: 'Sayfadan kaldırılan altıgenler: {count}.',
      undone:
        'Son doldurma geri alındı. Kaldırılan altıgenler: {removed}. Yeniden biçimlendirilen altıgenler geri yüklendi: {restored}.',
      named: '"{name}" adlı altıgenler: {count}.',
      unnamed: 'İsimler temizlendi: {count}.',
      marked:
        'Mevcut altıgenlerde gizli konumlar: {attached}. Bunları kapsayan bir sonraki dolgu bekleniyor: {pending}.',
      unmarked: 'Artık konum olmayan jetonlar: {count}.',
      settingChanged: '{setting}, {value} olarak ayarlandı.',
      rescanned:
        'Yeniden tarama tamamlandı. Tutulan: {kept}. Kabul edildi: {adopted}. Yeniden dosyalandı: {moved}. Eksik ve unutulmuş: {dropped}. Etiketler yeniden bağlandı: {labels}. Konum jetonları yeniden bağlandı: {icons}.',
      calibrated:
        'Izgara kalibre edildi (sütun adımı {colStep}px, satır adımı {rowStep}px). Yeniden tarama: {kept} tutuldu, {moved} yeniden dosyalandı, {adopted} kabul edildi.',
      calibrationReset:
        'Kalibrasyon kaldırıldı. Yeniden tarama: {kept} tutuldu, {moved} yeniden dosyalandı, {adopted} kabul edildi.',
      journalRebuilt: '"{help}" ve "{deck}" broşürleri yeniden oluşturuldu.',
      migrated:
        "Hexploration 1.x altıgen haritalarınız yükseltildi. Bu oyun bir Legacy oyunundan kopyalandıysa, her altıgen harita sayfasında Yeniden Tara'yı çalıştırın.",
      pruned:
        "Artık var olmayan ve unutulan kayıtlı altıgenler: {dropped}. Bu oyun veya sayfa kopyalandıysa, altıgenlerini yeniden bulmak için sayfada Yeniden Tara'yı çalıştırın.",
      readyHint: 'Menü için !hexploration yazın veya "Hexploration - Command Deck" broşürünü açın.',
    },
    warnings: {
      foregroundUnavailable:
        'Bu oyun ön plan katmanında çizimi desteklemediğinden, simge katmanına altıgenler çizildi.',
      someFailed: 'Çizilemeyen altıgenler: {count}. Ayrıntılar için API konsolunu kontrol edin.',
    },
    errors: {
      noPage: 'Üzerinde çalışılacak sayfa bulunamadı.',
      notHex: 'Bu sayfada altıgen ızgara kullanılmamaktadır.',
      noPolygons: 'Doldurulacak bir veya daha fazla çizilmiş şekli seçin.',
      emptyArea: 'Seçilen alan herhangi bir altıgen merkez içermiyor.',
      tooMany: 'Bu, tek seferde çok fazla altıgen oluşturacaktır ({count}).',
      nothingToConceal: 'Gizlenecek çizilmiş şekilleri veya simgeleri seçin.',
      nothingToReveal: 'Ortaya çıkarmak için altıgenleri, çizilmiş şekilleri veya jetonları seçin.',
      noTokens: 'Önce bir veya daha fazla jeton seçin.',
      noHexes:
        'Önce bir veya daha fazla altıgen (veya altıgenlerin üzerinde duran jetonlar) seçin.',
      nothingToUndo: 'Geri alınacak bir dolgu yok.',
      unknownCommand: 'Bilinmeyen komut: {command}',
      unknownSetting: 'Bilinmeyen ayar: {key}',
      unknownPageSetting: 'Sayfa başına ayarlanabilen ayarlar: {keys}',
      invalidValue: '"{value}", {key} için geçerli bir değer değil.',
      calibrateNeedsTokens: 'Altıgen merkezlere tutturulmuş bir veya iki jeton seçin.',
      calibrateFailed: 'Bu jetonlar kalibrasyon için kullanılamaz.',
      unexpected: 'Bir şeyler ters gitti: {message}',
    },
    hints: {
      noPage: 'Üzerinde çalışmak istediğiniz sayfayı açın veya üzerinde bir şey seçin.',
      notHex: "Sayfa Ayarları'nda sayfa ızgarasını Hex (V) veya Hex (H) olarak ayarlayın.",
      noPolygons:
        'Alanın çevresine çokgen, dikdörtgen, elips veya serbest şekil çizin, seçin ve tekrar deneyin.',
      emptyArea: 'Daha büyük bir şekil çizin veya sayfa ızgarası ayarlarını kontrol edin.',
      tooMany: 'Daha küçük bir alanı doldurun veya alanı birkaç şekle bölün.',
      noHexes:
        'Altıgenler ön planda veya simge katmanındadır; bunları seçmek için o katmana geçin.',
      unknownCommand: 'Komutları listelemek için !hexploration help yazın.',
      unknownSetting: 'Her ayarı görmek için !hexploration set yazın.',
      calibrateNeedsTokens:
        'Bir altıgenin ortasına bir jeton tutturun ve onu seçin. Altıgen boyutunu da düzeltmek için aynı satırdaki (Hex V) veya sütundaki (Hex H) komşu altıgene tutturulmuş ikinci bir jeton seçin.',
      calibrateFailed:
        'İki jetonun aynı satırda (Hex V) veya aynı sütunda (Hex H) ve en az bir altıgen aralıkla olması gerekir.',
      unexpected: 'Ayrıntılar API konsolu günlüğündedir.',
    },
    help: {
      menu: 'Menüyü göster.',
      fill: 'Seçilen çizilen şekilleri altıgenlerle kaplayın.',
      fillInverse: 'Seçilen şekillerin içi hariç tüm sayfayı kaplayın.',
      undo: 'Son dolguyu geri alın, ters dolguyu ters çevirin veya gizleyin ve kullandığı şekilleri geri yükleyin.',
      reveal:
        'Seçilen altıgenleri ve seçilen şekillerin ve simgelerin altındaki altıgenleri ortaya çıkarın.',
      revealPage: 'Sayfadaki her altıgeni duyuru yapmadan ortaya çıkarın.',
      conceal: 'Seçilen şekillerin ve jetonların altındaki alanı tekrar altıgenlerle kaplayın.',
      explore: 'Seçilen jetonların etrafını sanki oraya yeni taşınmışlar gibi gösterin.',
      resetPage: 'Sayfadaki her altıgeni kaldırın (önce sorar).',
      name: 'Seçilen altıgenleri veya seçilen belirteçlerin altındaki altıgenleri adlandırın. Temizlemek için adı boş bırakın.',
      mark: 'Seçilen jetonları gizli konumlara dönüştürün.',
      unmark: 'Seçilen belirteçlerin gizli konumlar olmasını durdurun.',
      set: 'Bir ayarı değiştirin veya tüm ayarları gösterin.',
      pageSet: 'Yalnızca geçerli sayfadaki bir gösterme ayarını geçersiz kılın.',
      pageClear: 'Geçerli sayfanın geçersiz kılmalarını kaldırın.',
      rescan:
        'Sayfanın altıgen listesini yeniden oluşturun; örneğin bir sayfayı veya oyunu kopyaladıktan sonra.',
      calibrate:
        'Altıgen ızgarayı, altıgen merkezlerine tutturulmuş bir veya iki seçilmiş jetonla hizalayın.',
      calibrateReset: 'Geçerli sayfanın kalibrasyonunu kaldırın.',
      status: "Hexploration'ın geçerli sayfa hakkında bildiklerini gösterin.",
      journal: 'Yardım ve Command Deck broşürlerini yeniden oluşturun.',
      help: 'Bu listeyi göster.',
      handout: 'Talimatların tamamı "{name}" broşüründe yer almaktadır.',
    },
    deck: {
      drawDesc:
        "Bir alanın çevresine şekiller çizin, onları seçin ve Doldur'a tıklayın. Doldurmayı Geri Al, son doldurmayı geri alır.",
      revealDesc:
        'Altıgenleri, şekilleri veya jetonları açığa çıkarmak ya da yeniden örtmek için seçin. Keşfet, seçili jetonların çevresini sanki oraya yeni gitmişler gibi açığa çıkarır.',
      locationsDesc:
        'Altıgenlerin altındaki konumlar olarak gizlemek için belirteçleri seçin. Bir altıgeni adlandırmak için altıgenleri veya belirteçleri seçin.',
      toolsDesc:
        'Ayarlar, sayfa geçersiz kılmaları, durum, kopyalanan sayfaları yeniden tarama ve ızgarayı kalibre etme.',
      footer: 'Talimatların tamamı için "{help}" broşürüne bakın.',
    },
    handout: {
      versionLabel: 'Sürüm',
      subtitle: 'Roll20 için hex-hex keşif',
      footer: 'Tek tıklamayla kontroller için "{deck}" broşürünü kullanın.',
      overview: {
        heading: 'Genel Bakış',
        body: 'Hexploration, bir altıgen haritayı opak altıgenlerle kaplar. Grup ilerledikçe içinden geçtiği altıgenler (ve isterseniz çevresindeki altıgenler) kaldırılır; böylece harita altıgen altıgen ortaya çıkar. Gizli konumlar altıgenlerin altına yerleştirilebilir ve bulunduklarında duyurulur. Jumpgate ve Legacy oyunlarında, her boyuttaki Hex (V) ve Hex (H) ızgaralarında çalışır.',
        demo: "Kısa bir demo izleyin (versiyon 1'den)",
      },
      quickStart: {
        heading: 'Hızlı Başlangıç',
        steps: [
          'Izgarası Hex (V) veya Hex (H) olarak ayarlanmış bir sayfayı açın.',
          'Gizlenecek alanın çevresine bir veya daha fazla şekil (çokgen, dikdörtgen, elips veya serbest çizim) çizin.',
          "Şekilleri seçin ve Command Deck'te Doldur'a tıklayın (veya !hexploration fill yazın). Şekiller altıgenlerle değiştirilir.",
          "İsteğe bağlı: doldurmadan önce önemli yerler için jetonları seçin ve Konumu İşaretle'ye tıklayın. Altıgenlerin altında gizlenirler ve keşfedildiklerinde duyurulurlar.",
          'Bir oyuncu jetonunu taşıyın. İçinden geçtiği her altıgen ve Görüş Mesafesindeki altıgenler ortaya çıkar.',
        ],
      },
      commands: {
        heading: 'Komutlar',
        intro:
          "Bu komutları yalnızca GM'ler kullanabilir. Çoğu seçilen nesneler üzerinde hareket eder; geri kalanı görüntülediğiniz sayfada hareket eder.",
        colCommand: 'Emretmek',
        colDesc: 'Ne işe yarar',
      },
      revealing: {
        heading: 'Açığa Çıkarma Nasıl Çalışır?',
        points: [
          'Altıgenleri yalnızca jeton katmanındaki jetonlar açığa çıkarır. Hangi jetonların sayılacağını Açığa Çıkaran Jetonlar ayarı belirler: varsayılan olarak oyuncu jetonları; böylece GM haritayı açmadan canavarları hareket ettirebilir.',
          'Bir jeton kapladığı her altıgeni (büyük jetonlar birkaç altıgen kaplar) ve Yol Boyunca Açığa Çıkar açıkken, ara noktalar dahil sürüklendiği rotadaki her altıgeni açığa çıkarır.',
          'Görüş Mesafesi, bu altıgenlerin her birinin çevresindeki altıgenleri en yakından başlayarak açığa çıkarır. Görüş Hattı açıkken, bir altıgen ile jeton arasında örtülü bir altıgen bulunduğu sürece o altıgen açığa çıkmaz. Yakın altıgenler genellikle önce açığa çıktığından, açık arazide Görüş Hattı hiçbir şeyi değiştirmez: yalnızca 2 veya daha fazla Görüş Mesafesi ve Altıgen Açığa Çıkarma Mesafesi ile doldurulmuş arazi gibi örtülü kalan altıgenler olduğunda önem taşır.',
          'Altıgen Açığa Çıkarma Mesafesi, her altıgen doldurulurken ona kaydedilir, bu yüzden doldurmadan önce ayarlayın; sonradan değiştirmek haritada zaten bulunan altıgenleri etkilemez. Bir jeton ne kadar uzağı görürse görsün, altıgenleri açığa çıkarmak için o kadar altıgen mesafede olmalıdır ve 0 ile yalnızca içlerine girilerek açığa çıkarlar. Bir sıradağ için: Altıgen Açığa Çıkarma Mesafesi ayarını 0 yapın, dağları doldurun, ayarı yeniden boşaltın, ardından ötedeki araziyi doldurun. Görüş Mesafesi 3 ve Görüş Hattı açıkken grup çevresindeki açık araziyi görür, ancak dağları ya da arkalarında olanları göremez. Her dağ altıgeni, bir jeton içine girdiğinde açığa çıkar.',
          "Bakış modunda, görüş alanındaki altıgenler kaybolmak yerine yarı saydam olur ve içlerine bir jeton girdiğinde kaldırılır. Bakış durumundaki altıgenler Görüş Hattı'nı engellemez.",
          'Roll20, jeton adlarını, çubuklarını ve auralarını altıgenlerin üzerine çizer. Örtülü Jetonları Gizle açıkken, örtülü bir altıgenin altındaki jetonun oyunculara görünen adı, çubukları ve auraları açığa çıkana kadar kapatılır; böylece gizli canavarlar kendilerini belli etmez. Jeton örtülüyken bunlardan birini açarsanız gizli kalır ve jeton açığa çıktığında açılır.',
          "API, diğer modların yaptığı hareketleri bildirmez. TokenMod hareketleri otomatik olarak algılanır; diğer modlar için jetonları seçip Keşfet'e tıklayın veya kendi modunuzdan Hexploration.revealAround(token) çağırın.",
        ],
      },
      locations: {
        heading: 'Adlandırılmış Altıgenler ve Konumlar',
        points: [
          'Konumu İşaretle, seçilen jetonları gizli konumlara dönüştürür. Zaten altıgen altında olan bir jeton hemen gizlenir; aksi takdirde onu kapsayan bir sonraki dolgu tarafından gizlenir.',
          "Beyaz kule durum işaretçisine sahip jetonlar da, sürüm 1'de olduğu gibi, doldurduğunuzda konum olarak kabul edilir.",
          'Gizli konum belirteçleri GM katmanına taşınır. Altıgenleri ortaya çıktığında, adlarının gösterildiği simge katmanına geri dönerler ve keşifleri duyurulur.',
          "Altıgeni Adlandır, bir altıgene jeton olmadan ad verir. Ad, GM katmanında bir etiket olarak GM'ye gösterilir ve altıgen açığa çıktığında duyurulur.",
          "Keşifleri Duyur, duyuruyu herkesin mi, yalnızca GM'nin mi yoksa hiç kimsenin mi göreceğini seçer. Keşifleri Pingle ayrıca oyuncuların görünümünü konuma taşır.",
        ],
      },
      settings: {
        heading: 'Ayarlar',
        intro:
          "Ayarları !hexploration set ile (veya Ayarlar düğmesiyle) değiştirin. Altıgen Katmanı, Açığa Çıkaran Jetonlar ve Dil, Mod'un ayarlar sayfasından da ayarlanabilir.",
        colKey: 'Anahtar',
        colName: 'Ayar',
        colDesc: 'Tanım',
        perPage: '(Sayfa başına ayarlanabilir.)',
      },
      jumpgate: {
        heading: 'Jumpgate ve Eski',
        points: [
          'Hexploration, oyunun hangi motoru kullandığını belirler ve uygun türde şekil çizer. Her iki düzenleyicide çizilen şekiller doldurulabilir.',
          'Altıgen Katmanı Otomatik olarak ayarlandığında altıgenler ön plan katmanında, jetonların üzerine çizilir; böylece oyuncular altında ne olduğunu göremez. Ön plan katmanı kullanılamıyorsa bunun yerine jeton katmanı kullanılır.',
          "Jumpgate matematiksel olarak düzgün altıgenler çizer; bunların şekli Legacy altıgenlerinden biraz farklıdır. Altıgenler sayfanın ızgarasıyla hizalı değilse bir altıgenin merkezine bir jeton tutturun, onu seçin ve Kalibre Et'e tıklayın. Altıgen boyutunu da düzeltmek için aynı satırdaki (Hex V) veya sütundaki (Hex H) komşu altıgenlerde iki jeton seçin.",
          "Bir sayfa veya oyun kopyalandığında altıgenleri yeni kimlikler alır. Onları ad etiketleri ve konum jetonlarıyla birlikte yeniden bulmak için sayfada Yeniden Tara'yı çalıştırın.",
        ],
      },
      upgrading: {
        heading: "Sürüm 1'den yükseltme",
        points: [
          "Sürüm 2'nin artık PathMath, MatrixMath, Vector Math veya HTML Builder'a ihtiyacı yok. Başka bir mod kullanmadığı sürece bunları kaldırabilirsiniz.",
          'Mevcut altıgen haritalar, adlar, konum belirteçleri ve ayarlar ilk başlangıçta otomatik olarak yükseltilir.',
          'Hexploration_menu makrosu dahil sürüm 1 komutları hâlâ çalışır.',
          "Sürüm 1, bir karakteri temsil eden her jetonun altıgenleri açığa çıkarmasına izin veriyordu. Bu davranışı korumak için Açığa Çıkaran Jetonlar'ı Karakter jetonları olarak ayarlayın.",
        ],
        colV1: 'Sürüm 1 komutu',
        colV2: 'Sürüm 2 komutu',
      },
      troubleshooting: {
        heading: 'Sorun giderme',
        points: [
          'Bir jeton hareket ettiğinde hiçbir şey olmuyor: jetonun jeton katmanında olduğunu ve Açığa Çıkaran Jetonlar ayarına uyduğunu, sayfada da altıgenler bulunduğunu (!hexploration status) kontrol edin.',
          "Altıgenler ızgaradan kaymış: Kalibre Et'i kullanın, ardından haritanın farklı yerlerindeki birkaç altıgeni bir jetonla kontrol edin.",
          "Bir sayfayı veya oyunu kopyaladıktan sonra altıgenler açığa çıkmıyor: sayfada Yeniden Tara'yı çalıştırın.",
          'Doldur, alanda altıgen merkezi olmadığını söylüyor: şeklin en az bir altıgenin merkezini içermesi gerekir.',
          'Başka bir şey için API konsolu günlüğünü kontrol edin ve yardım isterken mesajlarını ekleyin.',
        ],
      },
      languages: {
        heading: 'Diller',
        body: '!hexploration set language ile bir dil seçin. Mevcut diller:',
        colLanguage: 'Dil',
        colNative: 'Yerel ad',
        colCode: 'Kod',
      },
      credits: {
        heading: 'Kredi',
        original: 'Orijinal modun yapımcısı',
        maintainer: 'Versiyon 2 tarafından sürdürülen',
        marketplace: "Ada'nın sanat paketleri Roll20 Marketplace'te",
        support:
          "Bir hata bulursanız veya bir fikriniz varsa Roll20 Mod forumuna gönderin veya GitHub'da bir sorun açın ve API konsolu günlüğündeki tüm mesajları ekleyin.",
      },
    },
  };

  const TRANSLATION = {
    titles: {
      ready: 'Hexploration готовий.',
      settings: 'Налаштування Hexploration',
      languages: 'Виберіть мову',
      pageSettings: 'Налаштування сторінки: {page}',
      status: 'Статус Hexploration: {page}',
      help: 'Команди Hexploration',
      confirm: 'Будь ласка, підтвердьте',
    },
    discovery: {
      title: 'Локацію виявлено',
    },
    menu: {
      draw: 'Малювання',
      reveal: 'Розкриття і приховування',
      locations: 'Локації',
      tools: 'Інструменти',
      layerInUse: 'Нові гекси малюються на цьому шарі: {layer}.',
      pageSettingsHelp:
        'Ці налаштування застосовуються лише до цієї сторінки. Налаштування, позначені ★, замінюють глобальні налаштування.',
    },
    buttons: {
      fill: 'Заповнити',
      fillInverse: 'Зворотне заповнення',
      undo: 'Скасувати заповнення',
      reveal: 'Розкрити',
      conceal: 'Приховати',
      explore: 'Дослідити',
      revealPage: 'Розкрити сторінку',
      resetPage: 'Скинути сторінку',
      mark: 'Позначити локацію',
      unmark: 'Зняти позначку',
      name: 'Назвати гекс',
      settings: 'Налаштування',
      pageSettings: 'Налаштування сторінки',
      status: 'Статус',
      rescan: 'Пересканувати',
      calibrate: 'Відкалібрувати',
      calibrateReset: 'Скинути калібрування',
      help: 'Довідка',
      change: 'Змінити',
      menu: 'Меню',
      clearOverrides: 'Скинути перевизначення',
      confirmReset: 'Так, видалити всі гекси',
    },
    prompts: {
      name: 'Назва місця (залиште порожнім, щоб очистити)',
    },
    values: {
      on: 'Увімкнено',
      off: 'Вимкнено',
      none: 'Немає',
      hexLayer: {
        auto: 'Авто (передній план, якщо доступний)',
        foreground: 'шар переднього плану',
        objects: 'шар маркерів',
      },
      revealBy: {
        players: 'Маркери гравців',
        characters: 'Маркери персонажів',
        all: 'Усі маркери',
      },
      revealMode: {
        clear: 'Очищення',
        glimpse: 'Проблиск',
      },
      announce: {
        all: 'Всі',
        gm: 'Лише GM',
        off: 'Вимкнено',
      },
      orientation: {
        vertical: 'Hex (V)',
        horizontal: 'Hex (H)',
      },
      fillKind: {
        fill: 'Заповнення',
        fillInverse: 'Зворотне заповнення',
        conceal: 'Приховування',
      },
    },
    settings: {
      language: {
        label: 'Мова',
        desc: 'Мова для меню, повідомлень і роздаткових матеріалів.',
      },
      hexLayer: {
        label: 'Шар шестикутників',
        desc: 'Де малюються нові гекси. «Авто» пробує шар переднього плану (над маркерами), а якщо гра його не підтримує, використовує шар маркерів.',
      },
      fillColor: {
        label: 'Колір заливки',
        desc: 'Колір нових гексів. Використовуйте rgba() для прозорих шестигранників, наприклад rgba(0,0,0,0.8).',
      },
      strokeColor: {
        label: 'Колір контуру',
        desc: 'Колір контуру нових гексів.',
      },
      labelColor: {
        label: 'Колір міток',
        desc: 'Колір написів імен лише для GM на іменованих гексах.',
      },
      glimpseColor: {
        label: 'Колір проблиску',
        desc: 'Колір, якого набувають гекси в режимі «Проблиск». Використовуйте напівпрозорий колір rgba().',
      },
      strokeWidth: {
        label: 'Товщина контуру',
        desc: 'Ширина контуру нових гексів у пікселях (від 0 до 20).',
      },
      maxDistance: {
        label: 'Відстань розкриття шестикутників',
        desc: 'Зберігається в гексах під час їх заповнення, тому задайте значення до заповнення: подальша зміна не впливає на гекси, що вже є на карті. Жетон має бути в межах такої кількості гексів, щоб відкрити їх, хоч би як далеко він бачив; при значенні 0 вони відкриваються лише тоді, коли на них заходять. Використовуйте для гір або лісів. Залиште порожнім, щоб не було обмежень.',
      },
      revealDistance: {
        label: 'Дальність огляду',
        desc: 'Скільки гексів навколо рухомого жетона відкрито (від 0 до 20). 0 показує лише гекси, через які проходить жетон.',
      },
      lineOfSight: {
        label: 'Лінія видимості',
        desc: 'Коли ввімкнено, гекси, які залишаються закритими, як-от гори, заповнені з параметром «Відстань розкриття шестикутників», приховують гекси за ними. Це має значення лише тоді, коли «Дальність огляду» становить 2 або більше.',
      },
      revealPath: {
        label: 'Розкривати вздовж шляху',
        desc: 'Коли ввімкнено, відображається кожен гекс, через який проходить жетон під час перетягування (включно з маршрутними точками), а не лише там, де він зупиняється.',
      },
      revealBy: {
        label: 'Маркери, що розкривають',
        desc: 'Які жетони на шарі жетонів розкривають гекси: жетони, якими керує гравець, жетони, які представляють будь-якого персонажа, або кожен жетон.',
      },
      revealMode: {
        label: 'Режим розкриття',
        desc: '«Очищення» видаляє гекси в межах видимості. «Проблиск» натомість робить їх напівпрозорими; вони видаляються, коли на них заходить маркер.',
      },
      announce: {
        label: 'Оголошувати відкриття',
        desc: 'Хто бачить повідомлення чату, коли виявлено вказане місце.',
      },
      pingDiscoveries: {
        label: 'Пінгувати знахідки',
        desc: 'Коли ввімкнено, гравці відправляються до вказаного місця, коли його виявляють.',
      },
      hideCoveredTokens: {
        label: 'Ховати маркери під гексами',
        desc: 'Roll20 малює імена, смужки та аури над гексами. Коли ввімкнено, жетони під закритим гексагоном мають видимі для гравця назви, смужки та аури вимикаються та знову вмикаються, коли їх відкривають.',
      },
    },
    status: {
      engine: 'Ігровий рушій',
      grid: 'Сітка',
      layer: 'Шар шестикутників',
      hexes: 'Гекси',
      named: 'Іменовані гекси',
      icons: 'Маркери локацій',
      glimpsed: 'Гекси в проблиску',
      pending: 'Локації, що чекають на заповнення',
      calibrated: 'Відкалібровано',
      overrides: 'Перевизначення сторінки',
      undo: 'Доступне скасування',
    },
    messages: {
      filled:
        'Заповнення завершено. Намальовані гекси: {created}. Рестайлінг: {restyled}. Приховані місця: {icons}.',
      revealed: 'Розкрито гекси: {count}.',
      revealedPage: 'Розкрито кожен гекс на сторінці ({count}).',
      confirmReset:
        'Видалити всі гекси зі сторінки "{page}" ({count})? Маркери локацій повернуться на маркерний шар. Скасувати цю дію не вдасться.',
      resetPage: 'Зі сторінки видалено шестигранники: {count}.',
      undone:
        'Останнє заповнення скасовано. Видалені гекси: {removed}. Відновлено оновлені гекси: {restored}.',
      named: 'Гекси з назвою "{name}": {count}.',
      unnamed: 'Імена видалено: {count}.',
      marked:
        'Місця, приховані в існуючих гексах: {attached}. Очікування наступного заповнення, яке охопить їх: {pending}.',
      unmarked: 'Жетони, які більше не є місцеположеннями: {count}.',
      settingChanged: '{setting} встановлено на {value}.',
      rescanned:
        'Повторне сканування завершено. Збережено: {kept}. Прийнято: {adopted}. Повторно подано: {moved}. Відсутній і забутий: {dropped}. Мітки повторно пов’язані: {labels}. Маркери розташування повторно пов’язані: {icons}.',
      calibrated:
        'Сітка відкалібрована (крок стовпця {colStep}px, крок рядка {rowStep}px). Повторне сканування: збережено {kept}, повторно подано {moved}, прийнято {adopted}.',
      calibrationReset:
        'Калібрування видалено. Повторне сканування: збережено {kept}, повторно подано {moved}, прийнято {adopted}.',
      journalRebuilt: 'Роздаткові матеріали «{help}» та «{deck}» було перебудовано.',
      migrated:
        'Ваші гексові карти Hexploration 1.x оновлено. Якщо цю гру скопійовано з гри Legacy, виконайте «Пересканувати» на кожній сторінці з гексовою картою.',
      pruned:
        'Забуто збережені гекси, яких більше не існує: {dropped}. Якщо цю гру чи сторінку було скопійовано, виконайте «Пересканувати» на сторінці, щоб знову знайти її гекси.',
      readyHint:
        'Введіть !hexploration, щоб відкрити меню, або відкрийте роздатковий матеріал "Hexploration - Command Deck".',
    },
    warnings: {
      foregroundUnavailable:
        'Ця гра не підтримує малювання на передньому шарі, тому гекси були намальовані на шарі жетонів.',
      someFailed:
        'Гекси, які не вдалося намалювати: {count}. Перевірте консоль API для отримання деталей.',
    },
    errors: {
      noPage: 'Не вдалося знайти сторінку для роботи.',
      notHex: 'На цій сторінці не використовується гексова сітка.',
      noPolygons: 'Виберіть одну або кілька намальованих фігур для заповнення.',
      emptyArea: 'Вибрана область не містить шестигранних центрів.',
      tooMany: 'Це призведе до створення забагато гексів за один раз ({count}).',
      nothingToConceal: 'Виберіть намальовані фігури або жетони, щоб приховати.',
      nothingToReveal: 'Виберіть шестигранники, намальовані фігури або жетони, щоб розкрити їх.',
      noTokens: 'Спочатку виберіть один або кілька токенів.',
      noHexes: 'Спочатку виберіть один або кілька гексів (або жетонів, що стоять на гексах).',
      nothingToUndo: 'Немає заповнення, яке можна скасувати.',
      unknownCommand: 'Невідома команда: {command}',
      unknownSetting: 'Невідоме налаштування: {key}',
      unknownPageSetting: 'Параметри, які можна встановити для кожної сторінки: {keys}',
      invalidValue: '"{value}" не є дійсним значенням для {key}.',
      calibrateNeedsTokens: 'Виберіть один або два жетони, прикріплені до шестигранних центрів.',
      calibrateFailed: 'Ці жетони не можна використовувати для калібрування.',
      unexpected: 'Щось пішло не так: {message}',
    },
    hints: {
      noPage: 'Відкрийте сторінку, над якою хочете працювати, або виберіть щось на ній.',
      notHex: 'Установіть для сітки сторінки Hex (V) або Hex (H) у налаштуваннях сторінки.',
      noPolygons:
        'Намалюйте багатокутник, прямокутник, еліпс або форму від руки навколо області, виберіть її та повторіть спробу.',
      emptyArea: 'Намалюйте більшу форму або перевірте параметри сітки сторінки.',
      tooMany: 'Заповніть меншу область або розділіть її на кілька фігур.',
      noHexes:
        'Гекси знаходяться на передньому плані або шарі жетонів; перейдіть на цей шар, щоб вибрати їх.',
      unknownCommand: 'Введіть !hexploration help, щоб отримати список команд.',
      unknownSetting: 'Введіть !hexploration set, щоб побачити кожне налаштування.',
      calibrateNeedsTokens:
        'Прив’яжіть жетон до центру шестигранника та виберіть його. Виберіть другий жетон, прив’язаний до сусіднього шестигранника в тому ж рядку (Hex V) або стовпці (Hex H), щоб також виправити розмір шестигранника.',
      calibrateFailed:
        'Два жетони мають бути в одному рядку (Hex V) або в одному стовпці (Hex H) на відстані принаймні один гексагон.',
      unexpected: 'Подробиці в журналі консолі API.',
    },
    help: {
      menu: 'Показати меню.',
      fill: 'Покрийте вибрані намальовані форми шестигранниками.',
      fillInverse: 'Покрийте всю сторінку, за винятком вибраних форм.',
      undo: 'Скасуйте останню заливку, інверсну заливку або приховання та відновіть використані форми.',
      reveal: 'Розкрийте вибрані гекси та гекси під вибраними фігурами та жетонами.',
      revealPage: 'Відкрийте кожен гекс на сторінці без оголошень.',
      conceal: 'Знову покрийте область під вибраними фігурами та жетонами шестигранниками.',
      explore: 'Розкрийте навколо вибраних жетонів так, ніби вони щойно туди перемістилися.',
      resetPage: 'Видаліть кожен гекс на сторінці (спочатку запитує).',
      name: 'Назвіть вибрані гекси або гекси під вибраними жетонами. Залиште ім’я порожнім, щоб очистити його.',
      mark: 'Перетворіть вибрані жетони на приховані місця.',
      unmark: 'Заборонити вибрані маркери бути прихованими місцями.',
      set: 'Змінити налаштування або показати всі налаштування.',
      pageSet: 'Перевизначити налаштування показу лише на поточній сторінці.',
      pageClear: 'Видаліть перевизначення поточної сторінки.',
      rescan: 'Перебудуйте список гексів сторінки, наприклад після копіювання сторінки чи гри.',
      calibrate:
        'Вирівняйте гексову сітку за одним або двома вибраними маркерами, прив’язаними до центрів гексів.',
      calibrateReset: 'Видалити калібрування поточної сторінки.',
      status: 'Покажіть, що Hexploration знає про поточну сторінку.',
      journal: 'Перебудуйте роздаткові матеріали «Довідка» та «Command Deck».',
      help: 'Покажіть цей список.',
      handout: 'Повні інструкції наведено в роздатковому матеріалі "{name}".',
    },
    deck: {
      drawDesc:
        'Обведіть область фігурами, виділіть їх і натисніть «Заповнити». «Скасувати заповнення» скасовує останнє заповнення.',
      revealDesc:
        'Виділіть гекси, фігури або маркери, щоб розкрити їх або знову приховати. «Дослідити» розкриває гекси навколо вибраних маркерів, ніби вони туди перемістилися.',
      locationsDesc:
        'Виберіть жетони, щоб приховати їх як місця під гексами. Виберіть гекси або жетони, щоб назвати гекс.',
      toolsDesc:
        'Налаштування, перевизначення сторінок, статус, повторне сканування скопійованих сторінок і калібрування сітки.',
      footer: 'Перегляньте роздатковий матеріал "{help}", щоб отримати повні інструкції.',
    },
    handout: {
      versionLabel: 'Версія',
      subtitle: 'Дослідження гекс за гексом для Roll20',
      footer: 'Використовуйте роздатковий матеріал "{deck}" для керування одним натисканням.',
      overview: {
        heading: 'Огляд',
        body: 'Hexploration охоплює шестигранну карту з непрозорими гексами. Коли група рухається, гекси, через які вони проходять (і, якщо хочете, гекси навколо них) видаляються, тому карта відкривається по одному гексу за раз. Приховані локації можна розмістити під гексами та оголошувати, коли вони знайдені. Він працює в іграх Jumpgate і Legacy, на Hex (V) і Hex (H) сітках будь-якого розміру.',
        demo: 'Перегляньте коротку демонстрацію (з версії 1)',
      },
      quickStart: {
        heading: 'Швидкий старт',
        steps: [
          'Відкрийте сторінку, сітку якої встановлено як Hex (V) або Hex (H).',
          'Намалюйте одну або кілька фігур (багатокутник, прямокутник, еліпс або від руки) навколо області, яку потрібно сховати.',
          'Виберіть фігури та натисніть «Заповнити» в Command Deck (або введіть !hexploration fill). Фігури буде замінено гексами.',
          'Додатково: перед заповненням виділіть маркери важливих місць і натисніть «Позначити локацію». Вони сховаються під гексами, а коли їх виявлять, про це буде оголошено.',
          'Перемістіть маркер гравця. Кожен гекс, через який він проходить, і гекси в межах його «Дальності огляду» розкриваються.',
        ],
      },
      commands: {
        heading: 'Команди',
        intro:
          "Тільки GM можуть використовувати ці команди. Більшість діють на обрані об'єкти; решта діють на сторінці, яку ви переглядаєте.",
        colCommand: 'Команда',
        colDesc: 'Що воно робить',
      },
      revealing: {
        heading: 'Як працює розкриття',
        points: [
          'Гекси розкривають лише маркери на шарі маркерів. Які саме, визначає параметр «Маркери, що розкривають»: типово це маркери гравців, тож GM може пересувати монстрів, не відкриваючи карту.',
          'Маркер розкриває кожен гекс, який він займає (великі маркери займають кілька), а з увімкненим параметром «Розкривати вздовж шляху» — і кожен гекс на маршруті, яким його перетягнули, включно з проміжними точками.',
          '«Дальність огляду» розкриває гекси навколо кожного з цих гексів, починаючи з найближчих. Коли «Лінія видимості» ввімкнена, гекс не розкривається, доки між ним і маркером лежить закритий гекс. Ближчі гекси зазвичай розкриваються першими, тож на відкритій місцевості «Лінія видимості» нічого не змінює: вона має значення лише тоді, коли «Дальність огляду» становить 2 або більше і є гекси, які залишаються закритими, як-от місцевість, заповнена з параметром «Відстань розкриття шестикутників».',
          '«Відстань розкриття шестикутників» зберігається в кожному гексі під час його заповнення, тому задайте її до заповнення; подальша зміна не впливає на гекси, що вже є на карті. Маркер має бути в межах такої кількості гексів, щоб розкрити їх, хоч би як далеко він бачив, а при значенні 0 вони розкриваються лише тоді, коли на них заходять. Для гірського хребта: встановіть «Відстань розкриття шестикутників» на 0, заповніть гори, знову очистьте значення (без обмежень), а потім заповніть землі за ними. Коли «Дальність огляду» становить 3, а «Лінія видимості» ввімкнена, загін бачить відкриту місцевість навколо себе, але не гори й не те, що лежить за ними. Кожен гірський гекс розкривається, коли на нього заходить маркер.',
          'У режимі «Проблиск» гекси в межах видимості не зникають, а стають напівпрозорими й видаляються, коли на них заходить маркер. Гекси, побачені в режимі «Проблиск», не закривають огляд для параметра «Лінія видимості».',
          "Roll20 малює імена, смуги й аури маркерів поверх гексів. З увімкненим параметром «Ховати маркери під гексами» у маркера під закритим гексом вимикаються видимі гравцям ім'я, смуги й аури, доки його не відкриють, тож сховані монстри себе не видають. Якщо ввімкнути щось із цього, поки маркер закритий, воно лишиться прихованим і ввімкнеться, коли маркер відкриють.",
          'API не повідомляє про переміщення, зроблені іншими модами. Переміщення TokenMod підхоплюються автоматично; для інших модів виділіть маркери й натисніть «Дослідити» або викличте Hexploration.revealAround(token) зі свого моду.',
        ],
      },
      locations: {
        heading: 'Іменовані гекси та локації',
        points: [
          '«Позначити локацію» перетворює вибрані маркери на приховані локації. Маркер, який уже стоїть під гексом, ховається відразу; інакше його сховає наступне заповнення, що його накриє.',
          'Жетони з маркером статусу білої вежі також розглядаються як локації, коли ви заповнюєте, як у версії 1.',
          'Жетони прихованого розташування переміщуються на рівень GM. Коли їхній гексагон розкривається, вони повертаються до рівня маркерів із показом свого імені та оголошують про своє відкриття.',
          '«Назвати гекс» дає гексу назву без маркера. Назва показується GM як мітка на шарі GM і оголошується, коли гекс відкривається.',
          '«Оголошувати відкриття» визначає, чи бачитимуть оголошення всі, лише GM чи ніхто. «Пінгувати знахідки» також переміщує погляд гравців на локацію.',
        ],
      },
      settings: {
        heading: 'Налаштування',
        intro:
          'Змінюйте налаштування командою !hexploration set (або кнопкою «Налаштування»). «Шар шестикутників», «Маркери, що розкривають» і «Мова» також можна задати на сторінці налаштувань мода.',
        colKey: 'ключ',
        colName: 'Налаштування',
        colDesc: 'опис',
        perPage: '(Можна встановити на сторінку.)',
      },
      jumpgate: {
        heading: 'Jumpgate і Legacy',
        points: [
          'Hexploration визначає, який двигун використовує гра, і малює відповідну форму. Фігури, намальовані в будь-якому редакторі, можна заливати.',
          'Якщо для «Шару шестикутників» вибрано «Авто», гекси малюються на шарі переднього плану, над маркерами, тож гравці не бачать, що під ними. Якщо шар переднього плану недоступний, використовується шар маркерів.',
          'Jumpgate малює математично правильні гекси, форма яких трохи відрізняється від гексів Legacy. Якщо гекси не збігаються із сіткою сторінки, прив’яжіть маркер до центру гекса, виберіть його та натисніть «Відкалібрувати». Щоб заодно виправити розмір гекса, виберіть два маркери в сусідніх гексах одного рядка (Hex V) або стовпця (Hex H).',
          'Коли сторінку чи гру копіюють, її гекси отримують нові ідентифікатори. Виконайте «Пересканувати» на сторінці, щоб знову знайти їх разом із мітками назв і маркерами локацій.',
        ],
      },
      upgrading: {
        heading: 'Оновлення з версії 1',
        points: [
          'Версія 2 більше не потребує PathMath, MatrixMath, Vector Math або HTML Builder. Ви можете видалити їх, якщо інший мод не використовує їх.',
          'Наявні гексові карти, назви, маркери локацій і налаштування оновлюються автоматично під час першого запуску.',
          'Команди версії 1, включаючи макрос Hexploration_menu, все ще працюють.',
          'У версії 1 гекси міг розкривати будь-який маркер, що представляв персонажа. Щоб зберегти таку поведінку, встановіть для «Маркери, що розкривають» значення «Маркери персонажів».',
        ],
        colV1: 'Команда версії 1',
        colV2: 'Команда версії 2',
      },
      troubleshooting: {
        heading: 'Усунення несправностей',
        points: [
          'Коли маркер рухається, нічого не відбувається: перевірте, чи маркер на шарі маркерів і відповідає параметру «Маркери, що розкривають», а на сторінці є гекси (!hexploration status).',
          'Гекси зміщені відносно сітки: натисніть «Відкалібрувати», а потім перевірте маркером кілька гексів у різних частинах карти.',
          'Гекси перестали розкриватися після копіювання сторінки або гри: виконайте «Пересканувати» на сторінці.',
          '«Заповнити» повідомляє, що в області немає центрів гексів: фігура має містити центр принаймні одного гекса.',
          'Щодо іншого, перевірте журнал консолі API та включіть його повідомлення під час запиту про допомогу.',
        ],
      },
      languages: {
        heading: 'Мови',
        body: 'Виберіть мову командою !hexploration set language. Доступні мови:',
        colLanguage: 'Мова',
        colNative: 'Самоназва',
        colCode: 'Код',
      },
      credits: {
        heading: 'Кредити',
        original: 'Оригінальний мод від',
        maintainer: 'Версія 2 підтримується',
        marketplace: 'Художні набори Ади на Roll20 Marketplace',
        support:
          'Якщо ви знайшли помилку або маєте ідею, опублікуйте на форумі Roll20 Mod або відкрийте проблему на GitHub і додайте будь-які повідомлення з журналу консолі API.',
      },
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
    af: TRANSLATION$m,
    ca: TRANSLATION$l,
    'zh-TW': TRANSLATION$k,
    cs: TRANSLATION$j,
    da: TRANSLATION$i,
    nl: TRANSLATION$h,
    'en-US': localeEnUS,
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
   * Returns a colour in a form the given path type accepts.
   *
   * @param {string} color Colour from the settings.
   * @param {string} type Path type.
   * @returns {string} Colour to write.
   */
  function pathColor(color, type) {
    return type === PATH_TYPE_V2 ? toPathV2Color(color) : color;
  }

  /**
   * Sets a path's colours, converting them for Jumpgate pathv2 objects.
   *
   * @param {object} obj Roll20 path or pathv2.
   * @param {object} attrs Attributes to set; `fill` and `stroke` are converted.
   * @returns {void}
   */
  function setPathStyle(obj, attrs) {
    const type = obj.get('_type');
    const converted = { ...attrs };
    for (const key of ['fill', 'stroke']) {
      if (key in converted) {
        converted[key] = pathColor(converted[key], type);
      }
    }
    obj.set(converted);
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
      fill: pathColor(style.fill, type),
      stroke: pathColor(style.stroke, type),
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
          setPathStyle(existingPath, {
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
        setPathStyle(path, {
          fill: prev.fill,
          stroke: prev.stroke,
          stroke_width: prev.strokeWidth,
        });
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

    const locales = LOCALE_DEFINITIONS.map((locale) => [
      escapeHtml(locale.name),
      escapeHtml(locale.nativeName || locale.name),
      `${buildLocaleFlag(locale)}${code(locale.code)}`,
    ]);
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
    ${section('languages', `<p style="${STYLE.p}">${h('languages.body')}</p>${table([t('handout.languages.colLanguage', lang), t('handout.languages.colNative', lang), t('handout.languages.colCode', lang)], locales)}`)}
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
      <p style="${STYLE.subtitle}">${DECK_TITLE} • v${SCRIPT_VERSION}</p>
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
    if (!hex) {
      return false;
    }
    const path = getPathObject(hex.id, hex.type);
    if (!path) {
      return false;
    }
    const fill = pathColor(getConfig().glimpseColor, path.get('_type'));
    if (hex.glimpsed) {
      // Versions before this fix marked Jumpgate hexes as glimpsed without
      // changing their colour; repaint them when they are seen again.
      if (path.get('fill') !== fill) {
        path.set('fill', fill);
      }
      return false;
    }
    if (Number.isInteger(hex.maxDistance) && distance > hex.maxDistance) {
      return false;
    }
    path.set('fill', fill);
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
      const flag =
        row.key === 'language'
          ? buildLocaleFlag(LOCALE_DEFINITIONS.find(({ code }) => code === value))
          : '';
      const shown = row.color ? buildSwatch(value) : flag + escapeHtml(formatValue(row.key, value));
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
    const buttons = LOCALE_DEFINITIONS.map((locale) =>
      buildSecondaryButton(
        LOCALE_LABELS[locale.code],
        `${COMMAND} set language ${locale.code}`,
        buildLocaleFlag(locale)
      )
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
