/**
 * NOTE: GENERATED FILE - DO NOT EDIT DIRECTLY.
 * NOTE: Source files live under src/ and are bundled with `npm run build`.
 * ------------------------------------------------
 * Name: Resizer
 * Script: Resizer.js
 * Version: 1.0.0
 * Built: 2026-11-04T23:15:53.413Z
 */
const ResizerMod = (() => {
  'use strict';

  // Build-time placeholders replaced by rollup.config.js inject-build-metadata plugin.
  const SCRIPT_NAME = 'Resizer';
  const SCRIPT_VERSION = '1.0.0';
  const SCRIPT_LAST_UPDATED = '2026-11-04T23:15:53.413Z';

  const DEFAULT_LOCALE$1 = 'en-US';

  // 0.0.9 kept its settings in state.RESIZER, so 1.0 keeps the same branch and
  // upgrades it in place.
  const STATE_KEY = 'RESIZER';
  const SCHEMA_VERSION = 2;
  const DEFAULT_COMMAND_NAME = 'resizer';
  const MAX_COMMAND_NAME_LENGTH = 30;

  // The player ID Roll20 gives chat messages sent by Mods with sendChat.
  const API_PLAYER_ID = 'API';

  const HANDOUT_HELP_NAME = 'Resizer - Help';
  // The deck's name is not translated, so it always matches the handout's name.
  const DECK_TITLE = 'Command Deck';
  const HANDOUT_DECK_NAME = `Resizer - ${DECK_TITLE}`;

  const AUTHOR_LINKS = {
    original: {
      name: 'Robin Kuiper',
      profile: 'https://app.roll20.net/users/1226016/robin',
      thread: 'https://app.roll20.net/forum/post/6285519/script-resizer/',
    },
    maintainer: {
      name: 'MidNiteShadow7',
      profile: 'https://app.roll20.net/users/16506286/midniteshadow7',
      github: 'https://github.com/steverobertsuk',
    },
  };

  // Pixels in one Roll20 page unit. A grid cell is this times the page's
  // snapping increment.
  const PIXELS_PER_UNIT = 70;

  // Zoom factors allowed in one command.
  const MIN_ZOOM = 0.05;
  const MAX_ZOOM = 20;

  // Largest page Roll20 allows, in page units.
  const MAX_PAGE_UNITS = 1000;

  // Undo history: changes kept, and the most characters they may take in state
  // (the history is stored with the game, so it is kept small).
  const UNDO_DEPTH = 10;
  const MAX_UNDO_CHARS = 400000;

  // Creature sizes, in grid cells across (D&D sizes; Tiny shares a cell).
  const CREATURE_SIZES = {
    tiny: 0.5,
    small: 1,
    medium: 1,
    large: 2,
    huge: 3,
    gargantuan: 4,
  };

  // Units for sizes typed with size and page.
  const SIZE_UNITS = ['px', 'cells', 'units'];

  // Most selected objects listed by name in one reply.
  const MAX_LISTED = 12;

  // Most pages one picker card lists.
  const MAX_PICKER_PAGES = 40;

  // Default settings for new installs.
  const DEFAULT_SETTINGS = {
    language: DEFAULT_LOCALE$1,
    command: DEFAULT_COMMAND_NAME,
    keepTokenSize: false,
    scaleStrokes: true,
    deleteCalibrationBox: true,
  };

  // Colour palette for chat cards and handouts.
  const COLOR_HEADER_BG = '#0e2a30';
  const COLOR_HEADER_TEXT = '#dff7f4';
  const COLOR_CARD_BG_TOP = '#15404a';
  const COLOR_CARD_BG_BOTTOM = '#0b1f24';
  const COLOR_BORDER = '#2b6f78';
  const COLOR_TEXT = '#e6f4f2';
  const COLOR_MUTED = '#9cc3c0';
  const COLOR_ACCENT = '#3fd1c0';
  const COLOR_BUTTON_BG = '#0f8a80';
  const COLOR_BUTTON_TEXT = '#ffffff';
  const COLOR_BUTTON2_BG = '#163a40';
  const COLOR_BUTTON2_BORDER = '#2f7d85';
  const COLOR_WARNING_BG = '#fef3c7';
  const COLOR_WARNING_BORDER = '#92400e';
  const COLOR_WARNING_TEXT = '#92400e';
  const COLOR_ERROR_BG = '#fee2e2';
  const COLOR_ERROR_BORDER = '#991b1b';
  const COLOR_ERROR_TEXT = '#991b1b';

  // Every command, with the key of its description under help.*. Shared by the
  // chat help card and the Help handout.
  const COMMAND_LIST = [
    ['', 'menu'],
    ['size <width> <height> [px|cells|units]', 'size'],
    ['size tiny|small|medium|large|huge|gargantuan', 'creature'],
    ['fit [--keep-ratio]', 'fit'],
    ['center [both|h|v]', 'center'],
    ['calibrate [across] [down] [--fit-page] [--keep-box]', 'calibrate'],
    ['calibrate --cell <px> [--fit-page]', 'calibrateCell'],
    ['page [<width> <height> [units|cells|px]]', 'page'],
    ['zoom <factor> [--pages …] [--keep-tokens|--scale-tokens]', 'zoom'],
    ['pages | pick <page>|all|none', 'pages'],
    ['undo', 'undo'],
    ['history [clear]', 'history'],
    ['settings | set <setting> <value>', 'settings'],
    ['reset', 'reset'],
    ['journal rebuild', 'journal'],
    ['help', 'help'],
  ];

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
   * Parses a number. Roll20 stores bar values, aura radii and some page sizes as
   * text (hex pages report widths such as "27.93"), so everything goes through here.
   *
   * @param {*} raw Raw value.
   * @returns {number|null} Finite number, or null when the value is empty or not a number.
   */
  function toNumber(raw) {
    if (typeof raw === 'number') {
      return Number.isFinite(raw) ? raw : null;
    }
    const text = toText(raw);
    if (text === '' || !/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(text)) {
      return null;
    }
    return Number(text);
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
   * Rounds a number for messages: at most two decimals, no trailing zeros.
   *
   * @param {number} value Number.
   * @returns {string} Short text.
   */
  function formatNumber(value) {
    if (!Number.isFinite(value)) {
      return String(value);
    }
    return String(Math.round(value * 100) / 100);
  }

  /**
   * Rounds a coordinate so repeated zooms do not pile up float noise
   * (six decimals is far below a pixel).
   *
   * @param {number} value Number.
   * @returns {number} Rounded number.
   */
  function roundCoord(value) {
    return Math.round(value * 1e6) / 1e6;
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
    `background:${COLOR_BUTTON2_BG}`,
    `color:${COLOR_TEXT}`,
    `border:1px solid ${COLOR_BUTTON2_BORDER}`,
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
    const hintHtml = '';
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

  // Pure geometry: no Roll20 calls, so every rule here is unit-tested.
  //
  // Page coordinates are pixels from the page's top-left corner, y downwards,
  // except Jumpgate doors and windows, whose y is measured upwards (negative on
  // the page). Zooms scale about the page's top-left corner, so a point (x, y)
  // moves to (x·f, y·f) whatever its kind.

  /**
   * Returns a page's grid cell size in pixels.
   *
   * @param {object} page Page attributes (snapping_increment).
   * @returns {number} Cell size in pixels (70 when the page has no increment).
   */
  function cellPixels(page) {
    const snap = toNumber(page?.snapping_increment);
    return PIXELS_PER_UNIT * (snap && snap > 0 ? snap : 1);
  }

  /**
   * Returns a page's size in pixels.
   *
   * @param {object} page Page attributes (width, height in page units).
   * @returns {{width: number, height: number}} Size in pixels.
   */
  function pagePixels(page) {
    return {
      width: (toNumber(page?.width) ?? 0) * PIXELS_PER_UNIT,
      height: (toNumber(page?.height) ?? 0) * PIXELS_PER_UNIT,
    };
  }

  /**
   * Page attributes after a zoom. The distance per cell (scale_number) is kept,
   * so rulers, auras and lights still measure the same.
   *
   * @param {object} page Page attributes.
   * @param {number} f Zoom factor.
   * @returns {object} Changed attributes.
   */
  function zoomPage(page, f) {
    const n = (v, fallback = 0) => toNumber(v) ?? fallback;
    return {
      width: roundCoord(n(page.width) * f),
      height: roundCoord(n(page.height) * f),
      snapping_increment: roundCoord(n(page.snapping_increment, 1) * f),
      grid_offset_x: roundCoord(n(page.grid_offset_x) * f),
      grid_offset_y: roundCoord(n(page.grid_offset_y) * f),
    };
  }

  /**
   * Graphic attributes after a zoom.
   *
   * @param {object} g Graphic attributes (left, top, width, height).
   * @param {number} f Zoom factor.
   * @param {boolean} [keepSize=false] Move only; keep the width and height.
   * @returns {object} Changed attributes.
   */
  function zoomGraphic(g, f, keepSize = false) {
    const out = {
      left: roundCoord((toNumber(g.left) ?? 0) * f),
      top: roundCoord((toNumber(g.top) ?? 0) * f),
    };
    if (!keepSize) {
      out.width = roundCoord((toNumber(g.width) ?? 0) * f);
      out.height = roundCoord((toNumber(g.height) ?? 0) * f);
    }
    return out;
  }

  /**
   * Text attributes after a zoom. Jumpgate accepts any font size.
   *
   * @param {object} txt Text attributes.
   * @param {number} f Zoom factor.
   * @returns {object} Changed attributes.
   */
  function zoomText(txt, f) {
    const out = {
      left: roundCoord((toNumber(txt.left) ?? 0) * f),
      top: roundCoord((toNumber(txt.top) ?? 0) * f),
      font_size: roundCoord((toNumber(txt.font_size) ?? 16) * f),
    };
    for (const key of ['width', 'height']) {
      const v = toNumber(txt[key]);
      if (v) {
        out[key] = roundCoord(v * f);
      }
    }
    return out;
  }

  /**
   * Parses a Jumpgate drawing's point list.
   *
   * @param {*} raw The points attribute (JSON text or an array).
   * @returns {number[][]|null} Points, or null when unreadable.
   */
  function parsePoints(raw) {
    let pts = raw;
    if (typeof raw === 'string') {
      try {
        pts = JSON.parse(raw);
      } catch {
        return null;
      }
    }
    if (!Array.isArray(pts)) {
      return null;
    }
    return pts.every((p) => Array.isArray(p) && p.length >= 2 && p.every(Number.isFinite))
      ? pts
      : null;
  }

  /**
   * Jumpgate drawing (pathv2) attributes after a zoom. x and y are the centre of
   * the drawing's box and the points are in the drawing's own frame, so scaling
   * all of them scales the drawing about the page corner.
   *
   * @param {object} p Drawing attributes (x, y, points, stroke_width).
   * @param {number} f Zoom factor.
   * @param {boolean} [scaleStroke=false] Scale the line width too.
   * @returns {object|null} Changed attributes, or null when the points are unreadable.
   */
  function zoomPathV2(p, f, scaleStroke = false) {
    const pts = parsePoints(p.points);
    if (!pts) {
      return null;
    }
    const out = {
      x: roundCoord((toNumber(p.x) ?? 0) * f),
      y: roundCoord((toNumber(p.y) ?? 0) * f),
      points: JSON.stringify(pts.map((pt) => pt.map((v) => roundCoord(v * f)))),
    };
    if (scaleStroke) {
      out.stroke_width = roundCoord((toNumber(p.stroke_width) ?? 0) * f);
    }
    return out;
  }

  /**
   * Scales the numbers of a Legacy path (SVG-like commands such as ["M",x,y],
   * ["L",x,y], ["Q",cx,cy,x,y], ["C",…]).
   *
   * @param {*} raw The _path attribute (JSON text or an array).
   * @param {number} sx Horizontal factor.
   * @param {number} sy Vertical factor.
   * @returns {string|null} New path JSON, or null when unreadable.
   */
  function scaleLegacyPathData(raw, sx, sy) {
    let cmds = raw;
    if (typeof raw === 'string') {
      try {
        cmds = JSON.parse(raw);
      } catch {
        return null;
      }
    }
    if (!Array.isArray(cmds)) {
      return null;
    }
    const out = [];
    for (const cmd of cmds) {
      if (!Array.isArray(cmd) || typeof cmd[0] !== 'string') {
        return null;
      }
      const [op, ...nums] = cmd;
      if (!nums.every((v) => Number.isFinite(Number(v)))) {
        return null;
      }
      // Numbers come in x, y pairs.
      out.push([op, ...nums.map((v, i) => roundCoord(Number(v) * (i % 2 === 0 ? sx : sy)))]);
    }
    return JSON.stringify(out);
  }

  /**
   * Properties for a Legacy path recreated at a new size. Jumpgate does not
   * redraw a Legacy path whose position or scale an API changes, and resets its
   * scale to 1 on the next load, so a zoomed Legacy path is drawn again with its
   * old scale and the zoom baked into its points.
   *
   * @param {object} p Path attributes (_path, left, top, width, height, scaleX, scaleY).
   * @param {number} f Zoom factor.
   * @param {boolean} [scaleStroke=false] Scale the line width too.
   * @returns {object|null} New attributes for createObj, or null when unreadable.
   */
  function zoomLegacyPath(p, f, scaleStroke = false) {
    const sx = (toNumber(p.scaleX) ?? 1) * f;
    const sy = (toNumber(p.scaleY) ?? 1) * f;
    const data = scaleLegacyPathData(p._path ?? p.path, sx, sy);
    if (data === null) {
      return null;
    }
    const out = {
      _path: data,
      left: roundCoord((toNumber(p.left) ?? 0) * f),
      top: roundCoord((toNumber(p.top) ?? 0) * f),
      width: roundCoord((toNumber(p.width) ?? 0) * sx),
      height: roundCoord((toNumber(p.height) ?? 0) * sy),
      scaleX: 1,
      scaleY: 1,
    };
    if (scaleStroke) {
      out.stroke_width = roundCoord((toNumber(p.stroke_width) ?? 0) * f);
    }
    return out;
  }

  /**
   * Door or window attributes after a zoom. Their y is measured upwards, which
   * a scale about the corner leaves the right way round.
   *
   * @param {object} d Door or window attributes (x, y, path.handle0/handle1).
   * @param {number} f Zoom factor.
   * @returns {object} Changed attributes.
   */
  function zoomPortal(d, f) {
    const handle = (h) => ({
      x: roundCoord((toNumber(h?.x) ?? 0) * f),
      y: roundCoord((toNumber(h?.y) ?? 0) * f),
    });
    const path = d.path && typeof d.path === 'object' ? d.path : {};
    return {
      x: roundCoord((toNumber(d.x) ?? 0) * f),
      y: roundCoord((toNumber(d.y) ?? 0) * f),
      path: { ...path, handle0: handle(path.handle0), handle1: handle(path.handle1) },
    };
  }

  /**
   * Size and place for a graphic fitted to the page.
   *
   * @param {object} g Graphic attributes (width, height).
   * @param {object} page Page attributes.
   * @param {boolean} keepRatio Keep the graphic's shape (fit inside, centred).
   * @returns {object} New left, top, width, height.
   */
  function fitToPage(g, page, keepRatio) {
    const { width: pw, height: ph } = pagePixels(page);
    const w = toNumber(g.width) || 1;
    const h = toNumber(g.height) || 1;
    if (!keepRatio) {
      return { left: pw / 2, top: ph / 2, width: pw, height: ph };
    }
    const k = Math.min(pw / w, ph / h);
    return {
      left: roundCoord(pw / 2),
      top: roundCoord(ph / 2),
      width: roundCoord(w * k),
      height: roundCoord(h * k),
    };
  }

  /**
   * Position for a graphic centred on the page.
   *
   * @param {object} page Page attributes.
   * @param {boolean} horizontal Centre across.
   * @param {boolean} vertical Centre down.
   * @returns {object} Changed attributes.
   */
  function centreOnPage(page, horizontal, vertical) {
    const { width: pw, height: ph } = pagePixels(page);
    const out = {};
    if (horizontal) {
      out.left = pw / 2;
    }
    if (vertical) {
      out.top = ph / 2;
    }
    return out;
  }

  /**
   * Bounding box of a drawing in page pixels.
   *
   * @param {string} type 'pathv2' or 'path'.
   * @param {object} p Drawing attributes.
   * @returns {{x0: number, y0: number, x1: number, y1: number}|null} Box, or null.
   */
  function drawingBox(type, p) {
    if (type === 'pathv2') {
      const pts = parsePoints(p.points);
      if (!pts || pts.length === 0) {
        return null;
      }
      const xs = pts.map((pt) => pt[0]);
      const ys = pts.map((pt) => pt[1]);
      const w = Math.max(...xs) - Math.min(...xs);
      const h = Math.max(...ys) - Math.min(...ys);
      const cx = toNumber(p.x) ?? 0;
      const cy = toNumber(p.y) ?? 0;
      return { x0: cx - w / 2, y0: cy - h / 2, x1: cx + w / 2, y1: cy + h / 2 };
    }
    const w = (toNumber(p.width) ?? 0) * (toNumber(p.scaleX) ?? 1);
    const h = (toNumber(p.height) ?? 0) * (toNumber(p.scaleY) ?? 1);
    const cx = toNumber(p.left) ?? 0;
    const cy = toNumber(p.top) ?? 0;
    return { x0: cx - w / 2, y0: cy - h / 2, x1: cx + w / 2, y1: cy + h / 2 };
  }

  /**
   * Positions of the page's grid lines nearest to a point: lines sit at
   * offset + k·cell across, and (cell·k − offset) down because Jumpgate
   * measures the vertical offset upwards.
   *
   * @param {number} v Coordinate.
   * @param {number} cell Cell size.
   * @param {number} offset Grid offset along this axis, already signed for y-down.
   * @returns {number} Nearest grid line.
   */
  function nearestLine(v, cell, offset) {
    return Math.round((v - offset) / cell) * cell + offset;
  }

  /**
   * Works out how to scale and move a map so the squares drawn on it match the
   * page grid.
   *
   * @param {object} map Map graphic attributes (left, top, width, height).
   * @param {{x0: number, y0: number, x1: number, y1: number}} box Box drawn over the map's squares.
   * @param {number} across Squares across the box.
   * @param {number} down Squares down the box.
   * @param {object} page Page attributes.
   * @param {object} [options] Options.
   * @param {boolean} [options.fitPage=false] Move the map to the page corner and size the page to it.
   * @returns {{ok: boolean, error?: string, map?: object, page?: object, squarePx?: number[], scale?: number[]}}
   *   New map (and page) attributes, the map's square size before, and the scale used.
   */
  function calibrateFromBox(map, box, across, down, page, { fitPage = false } = {}) {
    const bw = box.x1 - box.x0;
    const bh = box.y1 - box.y0;
    if (!(across > 0) || !(down > 0)) {
      return { ok: false, error: 'errors.badCount' };
    }
    if (bw < 4 || bh < 4) {
      return { ok: false, error: 'errors.boxTooSmall' };
    }
    const cell = cellPixels(page);
    const sqx = bw / across;
    const sqy = bh / down;
    const kx = cell / sqx;
    const ky = cell / sqy;
    return placeScaledMap(
      map,
      page,
      kx,
      ky,
      { x: box.x0, y: box.y0 },
      { fitPage, squarePx: [sqx, sqy] }
    );
  }

  /**
   * Works out how to scale a map whose squares are a known number of pixels.
   *
   * @param {object} map Map graphic attributes.
   * @param {number} squarePx Pixels per square in the map as it is drawn now.
   * @param {object} page Page attributes.
   * @param {object} [options] Options.
   * @param {boolean} [options.fitPage=false] Move the map to the page corner and size the page to it.
   * @returns {object} As calibrateFromBox.
   */
  function calibrateFromSquare(map, squarePx, page, { fitPage = false } = {}) {
    if (!(squarePx >= 2)) {
      return { ok: false, error: 'errors.badSquarePx' };
    }
    const k = cellPixels(page) / squarePx;
    return placeScaledMap(map, page, k, k, null, { fitPage, squarePx: [squarePx, squarePx] });
  }

  /**
   * Scales a map about its top-left corner and, when an anchor is given, moves it
   * so that anchor (a corner of a drawn square) lands on a grid line.
   *
   * @param {object} map Map attributes.
   * @param {object} page Page attributes.
   * @param {number} kx Horizontal scale.
   * @param {number} ky Vertical scale.
   * @param {{x: number, y: number}|null} anchor Point on the map that must sit on grid lines.
   * @param {object} options Options.
   * @returns {object} As calibrateFromBox.
   */
  function placeScaledMap(map, page, kx, ky, anchor, { fitPage, squarePx }) {
    const w = toNumber(map.width) ?? 0;
    const h = toNumber(map.height) ?? 0;
    const left0 = (toNumber(map.left) ?? 0) - w / 2;
    const top0 = (toNumber(map.top) ?? 0) - h / 2;
    const nw = w * kx;
    const nh = h * ky;
    const cell = cellPixels(page);
    const offX = toNumber(page.grid_offset_x) ?? 0;
    const offY = -(toNumber(page.grid_offset_y) ?? 0);
    let nl = left0;
    let nt = top0;
    if (anchor) {
      const ax = left0 + (anchor.x - left0) * kx;
      const ay = top0 + (anchor.y - top0) * ky;
      nl += nearestLine(ax, cell, offX) - ax;
      nt += nearestLine(ay, cell, offY) - ay;
    }
    const out = { ok: true, squarePx, scale: [kx, ky] };
    let pageOut = null;
    if (fitPage) {
      // Slide the map by whole cells (which keeps it on the grid) so its corner
      // is within half a cell of the page corner, then make the page a whole
      // number of cells just big enough for it.
      nl -= Math.round(nl / cell) * cell;
      nt -= Math.round(nt / cell) * cell;
      const snap = cell / PIXELS_PER_UNIT;
      pageOut = {
        width: roundCoord(Math.max(1, Math.ceil((nl + nw) / cell - 1e-6)) * snap),
        height: roundCoord(Math.max(1, Math.ceil((nt + nh) / cell - 1e-6)) * snap),
      };
    }
    out.map = {
      left: roundCoord(nl + nw / 2),
      top: roundCoord(nt + nh / 2),
      width: roundCoord(nw),
      height: roundCoord(nh),
    };
    if (pageOut) {
      out.page = pageOut;
    }
    return out;
  }

  /**
   * Reads a zoom factor: 2, x2, ×2, 0.5, 50%, 1/2, or "to <px>" for a target
   * cell size.
   *
   * @param {string[]} words Words after "zoom".
   * @param {object} page Page attributes, for "to <px>".
   * @returns {number|null} Factor, or null when unreadable.
   */
  function parseFactor(words, page) {
    const text = words.join(' ').trim().toLowerCase();
    const to = /^to\s+([\d.]+)\s*(px)?$/.exec(text);
    if (to) {
      const px = Number(to[1]);
      return px > 0 ? px / cellPixels(page) : null;
    }
    const m = /^[x×*]?\s*([\d.]+)\s*(%)?$/.exec(text);
    if (m) {
      const n = Number(m[1]);
      if (!Number.isFinite(n) || n <= 0) {
        return null;
      }
      return m[2] ? n / 100 : n;
    }
    const frac = /^([\d.]+)\s*\/\s*([\d.]+)$/.exec(text);
    if (frac) {
      const a = Number(frac[1]);
      const b = Number(frac[2]);
      return a > 0 && b > 0 ? a / b : null;
    }
    return null;
  }

  var localeAf = {
    titles: {
      ready: 'Resizer is gereed.',
      history: 'Resizer-geskiedenis',
      pages: 'Resizer-bladsye',
      settings: 'Resizer-instellings',
      help: 'Resizer-hulp',
    },
    menu: {
      selected: 'Gekies',
      nothingSelected: 'Niks is gekies nie. Kies eers speelstukke, ’n kaart of tekeninge.',
      graphicSize: '{name}: {width} × {height} px ({across} × {down} selle)',
      andMore: '…en nog {count}.',
      map: 'Kaart',
      mapHint:
        'Teken ’n reghoek oor ’n paar van die kaart se eie blokke, kies dit en die kaart, en kalibreer dan.',
      page: 'Bladsy',
      pageSize: '{across} × {down} selle, {cell} px per sel, {scale} {units} per sel',
      pageCells: '{across} × {down} selle',
      historyEmpty: 'Nog niks om te ontdoen nie.',
      historyHint: 'Ontdoen neem eers die nuutste verandering terug.',
      minutesAgo: '{minutes} min gelede',
      pickerHint: 'Merk die bladsye om saam te zoem, en druk dan Zoem gemerkte bladsye.',
      on: 'Aan',
      off: 'Af',
      handouts: 'Volledige hulp in die uitdeelstukke:',
    },
    kinds: {
      graphic: 'Grafika',
      text: 'Teks',
      pathv2: 'Tekening',
      path: 'Tekening',
      door: 'Deur',
      window: 'Venster',
    },
    sizes: {
      tiny: 'Piepklein',
      small: 'Klein',
      medium: 'Medium',
      large: 'Groot',
      huge: 'Reusagtig',
      gargantuan: 'Kolossaal',
    },
    units: {
      px: 'px',
      cells: 'selle',
      units: 'bladsy-eenhede',
    },
    buttons: {
      menu: 'Kieslys',
      resize: 'Verander grootte',
      creatureSize: 'Wesegrootte',
      fit: 'Pas op bladsy',
      centre: 'Sentreer',
      sizes: 'Wys groottes',
      calibrate: 'Kalibreer kaart',
      calibrateFit: 'Kalibreer en pas bladsy',
      calibratePx: 'Kalibreer volgens pixels',
      zoom: 'Zoem bladsy',
      zoomIn: 'Zoem ×2',
      zoomOut: 'Zoem ×½',
      resizePage: 'Verander bladsygrootte',
      pageSize: 'Bladsygrootte',
      pages: 'Kies bladsye',
      zoomPicked: 'Zoem gemerkte bladsye ({count})',
      pickAll: 'Merk almal',
      pickNone: 'Merk geen',
      undo: 'Ontdoen',
      undoWhat: 'Ontdoen: {what}',
      history: 'Geskiedenis',
      clearHistory: 'Vee geskiedenis uit',
      settings: 'Instellings',
      help: 'Hulp',
      resetSettings: 'Stel instellings terug',
      rebuild: 'Bou uitdeelstukke weer',
    },
    queries: {
      width: 'Breedte',
      height: 'Hoogte',
      unit: 'Eenheid',
      unitPx: 'Pixels',
      unitCells: 'Roosterselle',
      unitUnits: 'Bladsy-eenhede (70 px)',
      creatureSize: 'Wesegrootte',
      keepShape: 'Behou die vorm?',
      yes: 'Ja',
      no: 'Nee - rek tot die bladsy',
      centre: 'Sentreer',
      both: 'Albei rigtings',
      across: 'Blokke oor die breedte van die raam',
      down: 'Net op en af',
      downCount: 'Blokke oor die hoogte van die raam',
      squarePx: 'Pixels per blok op die kaart nou',
      factor: 'Zoemfaktor (2 = twee keer so groot; 0.5 = die helfte)',
      tokens: 'Speelstukke',
      tokensScale: 'Skaal saam met die bladsy',
      tokensKeep: 'Behou hul grootte',
      language: 'Taal',
      command: 'Opdragnaam sonder !',
    },
    settings: {
      language: 'Taal',
      command: 'Opdrag',
      keepTokenSize: 'Behou speelstukgrootte tydens zoem',
      scaleStrokes: 'Skaal lyndikte van tekeninge',
      deleteCalibrationBox: 'Skrap die kalibrasieraam',
    },
    history: {
      change: 'Verandering',
      zoom: 'Zoem ×{factor} op {page}',
      zoomPages: 'Zoem ×{factor} op {count} bladsye',
      size: 'Verander grootte van {count} grafikas',
      size_one: 'Verander grootte van 1 grafika',
      page: 'Bladsy {page} na {width} × {height} eenhede',
      fit: 'Pas {count} grafikas op die bladsy',
      fit_one: 'Pas 1 grafika op die bladsy',
      centre: 'Sentreer {count} voorwerpe',
      centre_one: 'Sentreer 1 voorwerp',
      calibrate: 'Kalibreer kaart {name}',
      calibrateUnnamed: 'Kalibreer die kaart',
    },
    messages: {
      welcome:
        'Kies iets en maak die kieslys oop om die grootte te verander, of zoem ’n hele bladsy.',
      upgraded:
        'Opgegradeer van Resizer 0.0.9. Jou opdrag {command} en die ou opdragte werk steeds.',
      readyHint:
        'Tik {command} vir die kieslys, of maak die Resizer - Command Deck-uitdeelstuk oop.',
      zoomed: '{page} is ×{factor} gezoem: {objects} voorwerpe het saamgeskuif.',
      zoomedPages:
        '{count} bladsye is ×{factor} gezoem ({page}): {objects} voorwerpe het saamgeskuif.',
      skipped: '{count} voorwerpe kon nie gelees word nie en is met rus gelaat.',
      skipped_one: '1 voorwerp kon nie gelees word nie en is met rus gelaat.',
      resized: 'Grootte van {count} grafikas verander na {width} × {height} {unit}.',
      resized_one: 'Grootte van 1 grafika verander na {width} × {height} {unit}.',
      sized: 'Grootte van {count} grafikas verander na {size}.',
      sized_one: 'Grootte van 1 grafika verander na {size}.',
      pageResized: '{page} is nou {size}.',
      fitted: '{count} grafikas is op die bladsy gepas.',
      fitted_one: '1 grafika is op die bladsy gepas.',
      centred: '{count} voorwerpe is op die bladsy gesentreer.',
      centred_one: '1 voorwerp is op die bladsy gesentreer.',
      calibrated:
        'Gekalibreer: die kaart het blokke van {square} px gehad; dit is nou ×{scale} geskaal na selle van {cell} px en met die rooster belyn.',
      calibratedPage: 'Die bladsy is nou {width} × {height} eenhede sodat die kaart pas.',
      boxRemoved: 'Die kalibrasieraam is geskrap (Ontdoen bring dit terug).',
      undone: 'Ontdoen: {what}.',
      undoMissing: '{count} voorwerpe is intussen geskrap en kon dus nie teruggesit word nie.',
      undoMissing_one: '1 voorwerp is intussen geskrap en kon dus nie teruggesit word nie.',
      notStored: 'Hierdie verandering was te groot om in die ontdoengeskiedenis te hou.',
      historyCleared: '{count} veranderinge vergeet.',
      historyCleared_one: '1 verandering vergeet.',
      settingChanged: '{key} is nou {value}.',
      settingsReset:
        'Die instellings is terug op hul verstekwaardes. Die ontdoengeskiedenis is behou.',
      handoutsRebuilt: 'Die Hulp- en Command Deck-uitdeelstukke is weer gebou.',
    },
    errors: {
      unexpected: 'Iets het verkeerd geloop: {message}',
      unknownCommand: 'Onbekende opdrag "{command}". Tik {help} vir die opdragte.',
      noSelection: 'Kies eers iets (of gee --ids).',
      unknownIds: 'Geen voorwerpe met hierdie ID’s nie: {ids}',
      noGraphics:
        'Geen van die gekose voorwerpe kan so verander word nie. Kies speelstukke of ’n kaart.',
      badSize: 'Gee ’n breedte en ’n hoogte groter as 0, byvoorbeeld size 140 140 px.',
      badCreatureSize: 'Onbekende grootte. Gebruik tiny, small, medium, large, huge of gargantuan.',
      badPageSize: 'Gee ’n bladsybreedte en -hoogte van 1 tot {max} eenhede.',
      badFactor: 'Gee ’n zoemfaktor van {min} tot {max}.',
      badFactorText:
        'Kon "{text}" nie as ’n zoemfaktor lees nie. Probeer 2, 0.5, 150%, 1/2 of "to 140".',
      factorOne: '’n Zoem van 1 verander niks nie.',
      pageTooBig: '{page} sou kleiner as 1 eenheid of groter as {max} eenhede word.',
      noPage: 'Kon nie die bladsy vind nie.',
      noPages: 'Geen bladsye om te verander nie. Merk ’n paar in die bladsykieser, of gee --pages.',
      unknownPages: 'Geen bladsye met die naam: {pages}',
      noMap: 'Kies ook die kaartgrafika.',
      noBox:
        'Kies ’n reghoek wat oor ’n paar van die kaart se blokke geteken is saam met die kaart, of gebruik calibrate --cell <px>.',
      boxUnreadable: 'Kon nie die grootte van die gekose tekening lees nie.',
      boxTooSmall: 'Die kalibrasieraam is te klein. Teken dit oor een of meer hele blokke.',
      badCount: 'Gee die aantal blokke oor die breedte (en hoogte) van die raam, soos 3 of 3 2.',
      badSquarePx: 'Gee die kaart se blokgrootte in pixels, 2 of meer.',
      mapRotated:
        'Draai die kaart reguit met die bladsy (0°, 90°, 180° of 270°) voor jy kalibreer.',
      nothingToUndo: 'Niks om te ontdoen nie.',
      badSetting: 'Onbekende instelling "{key}". Instellings: {settings}',
      badValue: '"{value}" is nie ’n waarde wat {key} aanvaar nie.',
    },
    help: {
      menu: 'Maak die kieslys oop; met voorwerpe gekies wys dit hul groottes.',
      size: 'Verander die grootte van die gekose grafikas (by verstek in pixels).',
      creature: 'Verander die gekose speelstukke na ’n wesegrootte, in roosterselle.',
      fit: 'Pas die gekose grafikas op die bladsy; --keep-ratio behou hul vorm.',
      center: 'Sentreer die gekose grafikas of teks op die bladsy.',
      calibrate:
        'Skaal die gekose kaart sodat die blokke binne die gekose raam by die bladsyrooster pas, en belyn hulle dan.',
      calibrateCell: 'Skaal die gekose kaart volgens sy blokgrootte in pixels.',
      page: 'Wys die bladsygrootte, of verander die bladsy se grootte (nie wat daarop is nie).',
      zoom: 'Zoem bladsye met alles daarop; die afstand per sel bly dieselfde.',
      pages: 'Maak die bladsykieser oop, of merk bladsye, om verskeie bladsye gelyk te zoem.',
      undo: 'Ontdoen die nuutste verandering (die laaste 10 word gehou).',
      history: 'Lys die veranderinge wat jy kan ontdoen; clear vergeet hulle.',
      settings: 'Wys of verander die instellings.',
      reset: 'Stel die instellings terug na hul verstekwaardes.',
      journal: 'Bou die Hulp- en Command Deck-uitdeelstukke weer.',
      help: 'Wys hierdie lys.',
    },
    deck: {
      menuTitle: 'Kieslys',
      menuDesc: 'Die hoofkieslys wys die keuse, die bladsy en wat jy kan ontdoen.',
      selectedTitle: 'Gekose speelstukke en grafikas',
      selectedDesc: 'Kies eers, en druk dan ’n knoppie.',
      mapTitle: 'Kaart',
      mapDesc: 'Kies die kaart en ’n raam wat oor ’n paar van sy blokke geteken is.',
      pageTitle: 'Bladsy',
      pageDesc: 'Zoem die bladsy waarop jy is met alles daarop.',
      historyTitle: 'Geskiedenis',
      historyDesc: 'Ontdoen neem die nuutste verandering terug.',
      footer: 'Volledige instruksies is in die {help}-uitdeelstuk.',
    },
    handout: {
      versionLabel: 'Weergawe',
      subtitle: 'Verander die grootte van speelstukke, kaarte en hele bladsye',
      footer: 'Knoppies vir elke aksie is in die {deck}-uitdeelstuk.',
      overview: {
        heading: 'Oorsig',
        body: 'Resizer verander die grootte van gekose speelstukke en kaarte, verander die grootte van bladsye, en zoem ’n hele bladsy met alles daarop: kaart, speelstukke, tekeninge, teks, mure, deure en vensters. Dit werk met die Jumpgate- en Legacy-redigeerders, behou die afstand per roostersel, belyn kaarte met die rooster, en kan sy laaste 10 veranderinge ontdoen.',
      },
      quickStart: {
        heading: 'Vinnige begin',
        steps: [
          'Maak die Resizer - Command Deck-uitdeelstuk oop, of tik !resizer vir die kieslys.',
          'Om speelstukke se grootte te verander, kies hulle en druk Verander grootte of Wesegrootte.',
          'Om ’n bladsy te zoem, gaan daarheen en druk Zoem bladsy; 2 verdubbel alles, 0.5 halveer dit.',
          'Om ’n kaart by die rooster te laat pas, teken ’n reghoek oor ’n paar van die kaart se blokke, kies dit en die kaart, en druk Kalibreer kaart.',
          'Van plan verander? Druk Ontdoen.',
        ],
      },
      zoom: {
        heading: 'Bladsye zoem',
        intro:
          'Zoem skaal ’n bladsy en alles daarop vanaf sy linkerbohoek. Roosterselle word groter of kleiner, maar elke sel staan steeds vir dieselfde afstand (5 voet bly 5 voet), so linale, auras, speelstukligte en sig meet steeds dieselfde.',
        points: [
          'Skuif en skaal speelstukke, kaartgrafikas, Jumpgate- en Legacy-tekeninge, teks, mure van dinamiese beligting, deure en vensters, en die roosterverskuiwing.',
          'Faktore kan 2, 0.5, 150%, 1/2 of "to 140" vir selle van 140 px wees.',
          'Behou speelstukgrootte (instelling of --keep-tokens) skuif speelstukke saam met die kaart maar los hul grootte.',
          'Lyndiktes van tekeninge skaal saam met die bladsy tensy die instelling af is; mure behou hul dikte.',
          'Legacy-tekeninge word op die nuwe grootte oorgeteken (Jumpgate teken nie ’n Legacy-tekening oor wat ’n Mod verander nie), so hulle kry nuwe ID’s.',
        ],
      },
      calibrate: {
        heading: '’n Kaart by die rooster laat pas',
        intro:
          'Baie kaarte is met hul eie rooster op hul eie grootte geteken. Kalibreer skaal die kaart sodat sy blokke by die bladsy se selle pas en skuif dit sodat die lyne bymekaarkom.',
        steps: [
          'Sit die kaart op die bladsy en teken ’n reghoek (met enige tekengereedskap) oor ’n paar van die kaart se blokke, van lyn tot lyn.',
          'Kies die kaart en die reghoek saam (Shift-klik).',
          'Druk Kalibreer kaart en antwoord hoeveel blokke die raam oor die breedte en hoogte dek.',
          'Die kaart word geskaal en geskuif sodat daardie blokke presies by die bladsyrooster pas; die raam word geskrap.',
        ],
        points: [
          'Kalibreer en pas bladsy skuif ook die kaart na die bladsyhoek en verander die bladsy se grootte om dit te pas.',
          'Kalibreer volgens pixels slaan die raam oor: gee die kaart se blokgrootte in pixels soos dit nou geteken is.',
          '’n Groter raam (meer blokke) gee ’n meer presiese passing.',
        ],
      },
      sizes: {
        heading: 'Wesegroottes',
        intro: 'Size stel speelstukke op ’n wesegrootte in die roosterselle van hul bladsy.',
        colSize: 'Grootte',
        colCommand: 'Opdrag',
        colCells: 'Selle',
        cells: '{cells} × {cells}',
      },
      pages: {
        heading: 'Verskeie bladsye gelyk',
        points: [
          'Kies bladsye maak ’n lys van elke bladsy oop; merk dié wat jy wil hê en druk Zoem gemerkte bladsye.',
          'Getik: zoom 2 --pages all, --pages picked, --pages current, of name en ID’s geskei deur kommas (--pages Town, Docks).',
          'Een ontdoen neem die hele bondel terug.',
        ],
      },
      undo: {
        heading: 'Ontdoen',
        points: [
          'Elke verandering (grootte, pas, sentreer, kalibreer, bladsygrootte, zoem) kan ontdoen word.',
          'Die laaste 10 veranderinge word saam met die speletjie gestoor, so hulle oorleef ’n herbegin van die Mod-sandbox.',
          'Voorwerpe wat sedert die verandering geskrap is, word gemeld en oorgeslaan.',
          'Baie groot veranderinge (duisende voorwerpe) is dalk te groot om te hou; Resizer sê dan so.',
        ],
      },
      commands: {
        heading: 'Opdragte',
        intro: 'Tik {command} met een hiervan. !resizer en !rsz werk ook altyd.',
        colCommand: 'Opdrag',
        colDesc: 'Wat dit doen',
      },
      settings: {
        heading: 'Instellings',
        intro: 'Verander hierdie op die Instellings-kaart of met set <setting> <value>.',
        colKey: 'Instelling',
        colDesc: 'Wat dit doen',
        rows: {
          language: 'Taal vir kieslyste, boodskappe en uitdeelstukke.',
          command: '’n Ekstra naam vir die opdrag (0.0.9 het jou dit laat hernoem).',
          keepTokenSize: 'Zoem skuif speelstukke maar behou hul grootte.',
          scaleStrokes: 'Zoem skaal die lyndikte van tekeninge (mure behou hulle s’n).',
          deleteCalibrationBox: 'Kalibreer skrap die raam wat dit gemeet het.',
        },
      },
      api: {
        heading: 'Vir Mod-skrywers',
        intro: 'Ander Mods kan die globale Resizer-voorwerp gebruik.',
        colFunction: 'Funksie',
        colDesc: 'Wat dit doen',
        rows: {
          zoomPage:
            'Zoem ’n bladsy met alles daarop, met ontdoen. options.keepTokens behou speelstukgroottes.',
          undo: 'Ontdoen die nuutste verandering.',
          onZoom:
            'Roep jou funksie na elke zoem (en met 1/factor nadat een ontdoen is), sodat ’n Mod wat bladsyposisies stoor kan byhou.',
          history: 'Lys die veranderinge wat ontdoen kan word.',
        },
      },
      upgrading: {
        heading: 'Opgradeer van 0.0.9',
        points: [
          'Vervang die ou skrip met hierdie een; jou hernoemde opdrag word behou.',
          'Die ou opdragte werk steeds en doen wat die nuwes hieronder doen.',
          'scale verander nie meer die afstand per sel nie (’n sel van 5 voet bly 5 voet).',
        ],
        colOld: '0.0.9',
        colNew: '1.0',
      },
      troubleshooting: {
        heading: 'Probleemoplossing',
        points: [
          'Ander Mods wat posisies op ’n bladsy onthou (patrolieroetes, speelstukplekke, gestoorde areas) word nie van ’n zoem vertel nie tensy hulle Resizer.onZoom gebruik; kontroleer hulle ná die zoem.',
          'Seshoekbladsye zoem soos vierkantiges, maar kontroleer dat speelstukke steeds in hul seshoeke sit.',
          'As ’n tekening reg ná ’n zoem uit plek lyk, herlaai die bladsy: Roll20 teken soms laat oor.',
          'Kalibreer het die kaart reguit met die bladsy nodig; draai dit eers na 0°, 90°, 180° of 270°.',
        ],
      },
      languages: {
        heading: 'Tale',
        body: 'Kies ’n taal op die Instellings-kaart, met set language <code>, of in die Mod-instellings.',
        colLanguage: 'Taal',
        colNative: 'Eie naam',
        colCode: 'Kode',
      },
      credits: {
        heading: 'Erkennings',
        original: 'Oorspronklike Mod deur',
        maintainer: 'Herskryf en onderhou deur',
        thread: 'Forumdraad',
        support:
          'Het jy ’n probleem gevind of ’n idee? Plaas dit op die forumdraad of open ’n probleemverslag op GitHub.',
      },
    },
  };

  var localeCa = {
    titles: {
      ready: 'El Resizer està a punt.',
      history: 'Historial del Resizer',
      pages: 'Pàgines del Resizer',
      settings: 'Configuració del Resizer',
      help: 'Ajuda del Resizer',
    },
    menu: {
      selected: 'Seleccionat',
      nothingSelected: 'No hi ha res seleccionat. Primer selecciona fitxes, un mapa o dibuixos.',
      graphicSize: '{name}: {width} × {height} px ({across} × {down} cel·les)',
      andMore: '…i {count} més.',
      map: 'Mapa',
      mapHint:
        'Dibuixa un rectangle sobre alguns quadrats del mateix mapa, selecciona’l amb el mapa i calibra.',
      page: 'Pàgina',
      pageSize: '{across} × {down} cel·les, {cell} px per cel·la, {scale} {units} per cel·la',
      pageCells: '{across} × {down} cel·les',
      historyEmpty: 'Encara no hi ha res per desfer.',
      historyHint: 'Desfés anul·la primer el canvi més recent.',
      minutesAgo: 'fa {minutes} min',
      pickerHint: 'Marca les pàgines que vols ampliar juntes i prem Zoom a les marcades.',
      on: 'Activat',
      off: 'Desactivat',
      handouts: 'Ajuda completa als documents:',
    },
    kinds: {
      graphic: 'Gràfic',
      text: 'Text',
      pathv2: 'Dibuix',
      path: 'Dibuix',
      door: 'Porta',
      window: 'Finestra',
    },
    sizes: {
      tiny: 'Diminut',
      small: 'Petit',
      medium: 'Mitjà',
      large: 'Gran',
      huge: 'Enorme',
      gargantuan: 'Gargantuesc',
    },
    units: {
      px: 'px',
      cells: 'cel·les',
      units: 'unitats de pàgina',
    },
    buttons: {
      menu: 'Menú',
      resize: 'Redimensiona',
      creatureSize: 'Mida de criatura',
      fit: 'Ajusta a la pàgina',
      centre: 'Centra',
      sizes: 'Mostra les mides',
      calibrate: 'Calibra el mapa',
      calibrateFit: 'Calibra i ajusta la pàgina',
      calibratePx: 'Calibra per píxels',
      zoom: 'Zoom a la pàgina',
      zoomIn: 'Zoom ×2',
      zoomOut: 'Zoom ×½',
      resizePage: 'Redimensiona la pàgina',
      pageSize: 'Mida de la pàgina',
      pages: 'Tria pàgines',
      zoomPicked: 'Zoom a les marcades ({count})',
      pickAll: 'Marca-les totes',
      pickNone: 'Desmarca-les totes',
      undo: 'Desfés',
      undoWhat: 'Desfés: {what}',
      history: 'Historial',
      clearHistory: 'Esborra l’historial',
      settings: 'Configuració',
      help: 'Ajuda',
      resetSettings: 'Restableix la configuració',
      rebuild: 'Refés els documents',
    },
    queries: {
      width: 'Amplada',
      height: 'Alçada',
      unit: 'Unitat',
      unitPx: 'Píxels',
      unitCells: 'Cel·les de la graella',
      unitUnits: 'Unitats de pàgina (70 px)',
      creatureSize: 'Mida de criatura',
      keepShape: 'Vols mantenir la forma?',
      yes: 'Sí',
      no: 'No - estira-ho fins a la pàgina',
      centre: 'Centra',
      both: 'En els dos sentits',
      across: 'Quadrats d’amplada de la caixa',
      down: 'Només en vertical',
      downCount: 'Quadrats d’alçada de la caixa',
      squarePx: 'Píxels per quadrat al mapa ara',
      factor: 'Factor de zoom (2 = el doble; 0.5 = la meitat)',
      tokens: 'Fitxes',
      tokensScale: 'Escala-les amb la pàgina',
      tokensKeep: 'Mantén-ne la mida',
      language: 'Idioma',
      command: 'Nom de l’ordre sense !',
    },
    settings: {
      language: 'Idioma',
      command: 'Ordre',
      keepTokenSize: 'Mantén la mida de les fitxes en fer zoom',
      scaleStrokes: 'Escala el gruix de les línies dels dibuixos',
      deleteCalibrationBox: 'Esborra la caixa de calibratge',
    },
    history: {
      change: 'Canvi',
      zoom: 'Zoom ×{factor} a {page}',
      zoomPages: 'Zoom ×{factor} a {count} pàgines',
      size: 'Redimensiona {count} gràfics',
      size_one: 'Redimensiona 1 gràfic',
      page: 'Pàgina {page} a {width} × {height} unitats',
      fit: 'Ajusta {count} gràfics a la pàgina',
      fit_one: 'Ajusta 1 gràfic a la pàgina',
      centre: 'Centra {count} objectes',
      centre_one: 'Centra 1 objecte',
      calibrate: 'Calibra el mapa {name}',
      calibrateUnnamed: 'Calibra el mapa',
    },
    messages: {
      welcome:
        'Selecciona alguna cosa i obre el menú per redimensionar-la, o fes zoom a una pàgina.',
      upgraded:
        'Actualitzat des del Resizer 0.0.9. La teva ordre {command} i les ordres antigues continuen funcionant.',
      readyHint: 'Escriu {command} per obrir el menú, o obre el document Resizer - Command Deck.',
      zoomed: 'Zoom a {page} ×{factor}: {objects} objectes s’hi han mogut.',
      zoomedPages: 'Zoom a {count} pàgines ×{factor} ({page}): {objects} objectes s’hi han mogut.',
      skipped: 'No s’han pogut llegir {count} objectes i s’han deixat com estaven.',
      skipped_one: 'No s’ha pogut llegir 1 objecte i s’ha deixat com estava.',
      resized: 'S’han redimensionat {count} gràfics a {width} × {height} {unit}.',
      resized_one: 'S’ha redimensionat 1 gràfic a {width} × {height} {unit}.',
      sized: 'S’han redimensionat {count} gràfics a {size}.',
      sized_one: 'S’ha redimensionat 1 gràfic a {size}.',
      pageResized: '{page} ara fa {size}.',
      fitted: 'S’han ajustat {count} gràfics a la pàgina.',
      fitted_one: 'S’ha ajustat 1 gràfic a la pàgina.',
      centred: 'S’han centrat {count} objectes a la pàgina.',
      centred_one: 'S’ha centrat 1 objecte a la pàgina.',
      calibrated:
        'Calibrat: el mapa tenia quadrats de {square} px; ara està escalat ×{scale} a cel·les de {cell} px i alineat amb la graella.',
      calibratedPage: 'Ara la pàgina fa {width} × {height} unitats per encabir el mapa.',
      boxRemoved: 'S’ha esborrat la caixa de calibratge (Desfés la recupera).',
      undone: 'Desfet: {what}.',
      undoMissing: '{count} objectes s’havien esborrat després i no s’han pogut recuperar.',
      undoMissing_one: '1 objecte s’havia esborrat després i no s’ha pogut recuperar.',
      notStored: 'Aquest canvi era massa gran per desar-lo a l’historial.',
      historyCleared: 'S’han oblidat {count} canvis.',
      historyCleared_one: 'S’ha oblidat 1 canvi.',
      settingChanged: '{key} ara és {value}.',
      settingsReset: 'La configuració torna a ser la predeterminada. S’ha conservat l’historial.',
      handoutsRebuilt: 'S’han refet els documents Help i Command Deck.',
    },
    errors: {
      unexpected: 'Alguna cosa ha fallat: {message}',
      unknownCommand: 'Ordre desconeguda "{command}". Escriu {help} per veure les ordres.',
      noSelection: 'Primer selecciona alguna cosa (o indica --ids).',
      unknownIds: 'No hi ha cap objecte amb aquests ID: {ids}',
      noGraphics:
        'Cap dels objectes seleccionats es pot canviar així. Selecciona fitxes o un mapa.',
      badSize: 'Indica una amplada i una alçada més grans que 0, per exemple size 140 140 px.',
      badCreatureSize:
        'Mida desconeguda. Fes servir tiny, small, medium, large, huge o gargantuan.',
      badPageSize: 'Indica una amplada i una alçada de pàgina d’1 a {max} unitats.',
      badFactor: 'Indica un factor de zoom de {min} a {max}.',
      badFactorText:
        'No s’ha pogut llegir "{text}" com a factor de zoom. Prova 2, 0.5, 150%, 1/2 o "to 140".',
      factorOne: 'Un zoom d’1 no canvia res.',
      pageTooBig: '{page} faria menys d’1 unitat o més de {max} unitats.',
      noPage: 'No s’ha trobat la pàgina.',
      noPages:
        'No hi ha pàgines per canviar. Marca’n alguna al selector de pàgines, o indica --pages.',
      unknownPages: 'No hi ha cap pàgina anomenada: {pages}',
      noMap: 'Selecciona també el gràfic del mapa.',
      noBox:
        'Selecciona, a més del mapa, un rectangle dibuixat sobre alguns quadrats del mapa, o fes servir calibrate --cell <px>.',
      boxUnreadable: 'No s’ha pogut llegir la mida del dibuix seleccionat.',
      boxTooSmall:
        'La caixa de calibratge és massa petita. Dibuixa-la sobre un o més quadrats sencers.',
      badCount: 'Indica el nombre de quadrats d’amplada (i d’alçada) de la caixa, com 3 o 3 2.',
      badSquarePx: 'Indica la mida del quadrat del mapa en píxels, 2 o més.',
      mapRotated:
        'Gira el mapa recte respecte a la pàgina (0°, 90°, 180° o 270°) abans de calibrar.',
      nothingToUndo: 'No hi ha res per desfer.',
      badSetting: 'Paràmetre desconegut "{key}". Paràmetres: {settings}',
      badValue: '"{value}" no és un valor que {key} accepti.',
    },
    help: {
      menu: 'Obre el menú; amb objectes seleccionats, en mostra les mides.',
      size: 'Redimensiona els gràfics seleccionats (en píxels per defecte).',
      creature:
        'Redimensiona les fitxes seleccionades a una mida de criatura, en cel·les de la graella.',
      fit: 'Ajusta els gràfics seleccionats a la pàgina; --keep-ratio en manté la forma.',
      center: 'Centra els gràfics o textos seleccionats a la pàgina.',
      calibrate:
        'Escala el mapa seleccionat perquè els quadrats de dins de la caixa seleccionada coincideixin amb la graella de la pàgina, i després els alinea.',
      calibrateCell: 'Escala el mapa seleccionat a partir de la mida del seu quadrat en píxels.',
      page: 'Mostra la mida de la pàgina, o redimensiona la pàgina (no el que hi ha).',
      zoom: 'Fa zoom a les pàgines amb tot el que contenen; es manté la distància per cel·la.',
      pages: 'Obre el selector de pàgines, o marca pàgines, per fer zoom a diverses alhora.',
      undo: 'Desfà el canvi més recent (es guarden els 10 últims).',
      history: 'Llista els canvis que pots desfer; clear els oblida.',
      settings: 'Mostra o canvia la configuració.',
      reset: 'Torna la configuració als valors predeterminats.',
      journal: 'Refà els documents Help i Command Deck.',
      help: 'Mostra aquesta llista.',
    },
    deck: {
      menuTitle: 'Menú',
      menuDesc: 'El menú principal mostra la selecció, la pàgina i el que pots desfer.',
      selectedTitle: 'Fitxes i gràfics seleccionats',
      selectedDesc: 'Primer selecciona i després prem un botó.',
      mapTitle: 'Mapa',
      mapDesc: 'Selecciona el mapa i una caixa dibuixada sobre alguns dels seus quadrats.',
      pageTitle: 'Pàgina',
      pageDesc: 'Fa zoom a la pàgina on ets, amb tot el que conté.',
      historyTitle: 'Historial',
      historyDesc: 'Desfés anul·la el canvi més recent.',
      footer: 'Les instruccions completes són al document {help}.',
    },
    handout: {
      versionLabel: 'Versió',
      subtitle: 'Redimensiona fitxes, mapes i pàgines senceres',
      footer: 'Els botons de cada acció són al document {deck}.',
      overview: {
        heading: 'Visió general',
        body: 'El Resizer redimensiona les fitxes i els mapes seleccionats, redimensiona pàgines i fa zoom a una pàgina sencera amb tot el que conté: mapa, fitxes, dibuixos, text, parets, portes i finestres. Funciona amb els editors Jumpgate i Legacy, manté la distància per cel·la de la graella, alinea els mapes amb la graella i pot desfer els seus 10 últims canvis.',
      },
      quickStart: {
        heading: 'Inici ràpid',
        steps: [
          'Obre el document Resizer - Command Deck, o escriu !resizer per obrir el menú.',
          'Per redimensionar fitxes, selecciona-les i prem Redimensiona o Mida de criatura.',
          'Per fer zoom a una pàgina, ves-hi i prem Zoom a la pàgina; 2 ho duplica tot, 0.5 ho redueix a la meitat.',
          'Per ajustar un mapa a la graella, dibuixa un rectangle sobre uns quants quadrats del mapa, selecciona’l amb el mapa i prem Calibra el mapa.',
          'Has canviat d’idea? Prem Desfés.',
        ],
      },
      zoom: {
        heading: 'Fer zoom a les pàgines',
        intro:
          'El zoom escala una pàgina i tot el que conté des de la cantonada superior esquerra. Les cel·les de la graella es fan més grans o més petites, però cada cel·la continua representant la mateixa distància (5 ft continuen sent 5 ft), de manera que els regles, les aures, les llums i la visió de les fitxes mesuren igual.',
        points: [
          'Mou i escala fitxes, gràfics de mapa, dibuixos de Jumpgate i de Legacy, text, parets d’il·luminació dinàmica, portes i finestres, i el desplaçament de la graella.',
          'Els factors poden ser 2, 0.5, 150%, 1/2, o "to 140" per a cel·les de 140 px.',
          'Mantenir la mida de les fitxes (paràmetre o --keep-tokens) mou les fitxes amb el mapa però no en canvia la mida.',
          'El gruix de les línies dels dibuixos s’escala amb la pàgina, tret que el paràmetre estigui desactivat; les parets mantenen el seu gruix.',
          'Els dibuixos de Legacy es tornen a dibuixar a la nova mida (Jumpgate no redibuixa un dibuix de Legacy que un Mod canvia), així que reben ID nous.',
        ],
      },
      calibrate: {
        heading: 'Ajustar un mapa a la graella',
        intro:
          'Molts mapes porten la seva pròpia graella dibuixada a la seva pròpia mida. Calibra escala el mapa perquè els seus quadrats coincideixin amb les cel·les de la pàgina i el mou perquè les línies es trobin.',
        steps: [
          'Posa el mapa a la pàgina i dibuixa un rectangle (amb qualsevol eina de dibuix) sobre uns quants quadrats del mapa, de línia a línia.',
          'Selecciona el mapa i el rectangle alhora (Maj-clic).',
          'Prem Calibra el mapa i respon quants quadrats cobreix la caixa d’amplada i d’alçada.',
          'El mapa s’escala i es mou perquè aquests quadrats encaixin exactament amb la graella de la pàgina; la caixa s’esborra.',
        ],
        points: [
          'Calibra i ajusta la pàgina també mou el mapa a la cantonada de la pàgina i redimensiona la pàgina a la mida del mapa.',
          'Calibra per píxels no necessita la caixa: indica la mida del quadrat del mapa en píxels tal com està dibuixat ara.',
          'Una caixa més gran (més quadrats) dona un ajust més exacte.',
        ],
      },
      sizes: {
        heading: 'Mides de criatura',
        intro:
          'L’ordre size dona a les fitxes una mida de criatura en cel·les de la graella de la pàgina.',
        colSize: 'Mida',
        colCommand: 'Ordre',
        colCells: 'Cel·les',
        cells: '{cells} × {cells}',
      },
      pages: {
        heading: 'Diverses pàgines alhora',
        points: [
          'Tria pàgines obre una llista de totes les pàgines; marca les que vulguis i prem Zoom a les marcades.',
          'Escrit: zoom 2 --pages all, --pages picked, --pages current, o noms i ID separats per comes (--pages Town, Docks).',
          'Un sol desfer anul·la tot el lot.',
        ],
      },
      undo: {
        heading: 'Desfer',
        points: [
          'Tots els canvis (redimensionar, ajustar, centrar, calibrar, mida de pàgina, zoom) es poden desfer.',
          'Els 10 últims canvis es guarden amb la partida, així que sobreviuen a un reinici del sandbox de Mods.',
          'Els objectes esborrats després del canvi s’indiquen i s’ometen.',
          'Els canvis molt grans (milers d’objectes) poden ser massa grans per guardar-los; el Resizer ho avisa.',
        ],
      },
      commands: {
        heading: 'Ordres',
        intro: 'Escriu {command} amb una d’aquestes. !resizer i !rsz també funcionen sempre.',
        colCommand: 'Ordre',
        colDesc: 'Què fa',
      },
      settings: {
        heading: 'Configuració',
        intro: 'Canvia-ho des de la targeta de Configuració o amb set <setting> <value>.',
        colKey: 'Paràmetre',
        colDesc: 'Què fa',
        rows: {
          language: 'Idioma dels menús, missatges i documents.',
          command: 'Un nom addicional per a l’ordre (la 0.0.9 permetia canviar-li el nom).',
          keepTokenSize: 'El zoom mou les fitxes però en manté la mida.',
          scaleStrokes:
            'El zoom escala el gruix de les línies dels dibuixos (les parets mantenen el seu).',
          deleteCalibrationBox: 'Calibra esborra la caixa que ha mesurat.',
        },
      },
      api: {
        heading: 'Per als autors de Mods',
        intro: 'Altres Mods poden fer servir l’objecte global Resizer.',
        colFunction: 'Funció',
        colDesc: 'Què fa',
        rows: {
          zoomPage:
            'Fa zoom a una pàgina amb tot el que conté, amb desfer. options.keepTokens manté la mida de les fitxes.',
          undo: 'Desfà el canvi més recent.',
          onZoom:
            'Crida la teva funció després de cada zoom (i amb 1/factor després de desfer-ne un), perquè un Mod que desa posicions de la pàgina pugui seguir-lo.',
          history: 'Llista els canvis que es poden desfer.',
        },
      },
      upgrading: {
        heading: 'Actualitzar des de la 0.0.9',
        points: [
          'Substitueix l’script antic per aquest; es conserva l’ordre que havies reanomenat.',
          'Les ordres antigues continuen funcionant i fan el mateix que les noves d’aquí sota.',
          'scale ja no canvia la distància per cel·la (una cel·la de 5 ft continua fent 5 ft).',
        ],
        colOld: '0.0.9',
        colNew: '1.0',
      },
      troubleshooting: {
        heading: 'Resolució de problemes',
        points: [
          'Altres Mods que recorden posicions d’una pàgina (rutes de patrulla, posicions de fitxes, àrees desades) no s’assabenten d’un zoom tret que facin servir Resizer.onZoom; revisa’ls després del zoom.',
          'Les pàgines hexagonals fan zoom com les quadrades, però comprova que les fitxes continuen dins dels seus hexàgons.',
          'Si un dibuix sembla fora de lloc just després d’un zoom, torna a carregar la pàgina: de vegades el Roll20 redibuixa tard.',
          'Calibra necessita el mapa recte respecte a la pàgina; primer gira’l a 0°, 90°, 180° o 270°.',
        ],
      },
      languages: {
        heading: 'Idiomes',
        body: 'Tria un idioma a la targeta de Configuració, amb set language <code>, o a la configuració del Mod.',
        colLanguage: 'Idioma',
        colNative: 'Nom original',
        colCode: 'Codi',
      },
      credits: {
        heading: 'Crèdits',
        original: 'Mod original de',
        maintainer: 'Reescrit i mantingut per',
        thread: 'Fil del fòrum',
        support:
          'Has trobat un problema o tens una idea? Escriu al fil del fòrum o obre una incidència a GitHub.',
      },
    },
  };

  var localeZhTW = {
    titles: {
      ready: 'Resizer 已準備就緒。',
      history: 'Resizer 紀錄',
      pages: 'Resizer 頁面',
      settings: 'Resizer 設定',
      help: 'Resizer 說明',
    },
    menu: {
      selected: '已選取',
      nothingSelected: '尚未選取任何東西。請先選取標記、地圖或繪圖。',
      graphicSize: '{name}：{width} × {height} px（{across} × {down} 格）',
      andMore: '…還有 {count} 個。',
      map: '地圖',
      mapHint: '在地圖本身的幾個方格上畫一個矩形，選取矩形和地圖，然後進行校準。',
      page: '頁面',
      pageSize: '{across} × {down} 格，每格 {cell} px，每格 {scale} {units}',
      pageCells: '{across} × {down} 格',
      historyEmpty: '目前還沒有可以復原的變更。',
      historyHint: '復原會先撤銷最新的變更。',
      minutesAgo: '{minutes} 分鐘前',
      pickerHint: '勾選要一起縮放的頁面，然後按「縮放已勾選的頁面」。',
      on: '開',
      off: '關',
      handouts: '完整說明請見講義：',
    },
    kinds: {
      graphic: '圖像',
      text: '文字',
      pathv2: '繪圖',
      path: '繪圖',
      door: '門',
      window: '窗戶',
    },
    sizes: {
      tiny: '微型',
      small: '小型',
      medium: '中型',
      large: '大型',
      huge: '巨型',
      gargantuan: '超巨型',
    },
    units: {
      px: 'px',
      cells: '格',
      units: '頁面單位',
    },
    buttons: {
      menu: '選單',
      resize: '調整大小',
      creatureSize: '生物體型',
      fit: '符合頁面',
      centre: '置中',
      sizes: '顯示大小',
      calibrate: '校準地圖',
      calibrateFit: '校準並符合頁面',
      calibratePx: '以像素校準',
      zoom: '縮放頁面',
      zoomIn: '縮放 ×2',
      zoomOut: '縮放 ×½',
      resizePage: '調整頁面大小',
      pageSize: '頁面大小',
      pages: '選擇頁面',
      zoomPicked: '縮放已勾選的頁面（{count}）',
      pickAll: '全部勾選',
      pickNone: '全部取消',
      undo: '復原',
      undoWhat: '復原：{what}',
      history: '紀錄',
      clearHistory: '清除紀錄',
      settings: '設定',
      help: '說明',
      resetSettings: '重設設定',
      rebuild: '重建講義',
    },
    queries: {
      width: '寬度',
      height: '高度',
      unit: '單位',
      unitPx: '像素',
      unitCells: '格線方格',
      unitUnits: '頁面單位（70 px）',
      creatureSize: '生物體型',
      keepShape: '保持形狀？',
      yes: '是',
      no: '否 - 拉伸至頁面大小',
      centre: '置中',
      both: '兩個方向',
      across: '方框橫向的方格數',
      down: '僅縱向',
      downCount: '方框縱向的方格數',
      squarePx: '目前地圖每格的像素數',
      factor: '縮放倍率（2 = 兩倍大; 0.5 = 一半）',
      tokens: '標記',
      tokensScale: '隨頁面縮放',
      tokensKeep: '保持原本大小',
      language: '語言',
      command: '指令名稱（不含 !）',
    },
    settings: {
      language: '語言',
      command: '指令',
      keepTokenSize: '縮放時保持標記大小',
      scaleStrokes: '縮放繪圖的線條寬度',
      deleteCalibrationBox: '刪除校準方框',
    },
    history: {
      change: '變更',
      zoom: '將 {page} 縮放 ×{factor}',
      zoomPages: '將 {count} 個頁面縮放 ×{factor}',
      size: '調整 {count} 個圖像的大小',
      size_one: '調整 1 個圖像的大小',
      page: '將頁面 {page} 改為 {width} × {height} 單位',
      fit: '將 {count} 個圖像符合頁面',
      fit_one: '將 1 個圖像符合頁面',
      centre: '將 {count} 個物件置中',
      centre_one: '將 1 個物件置中',
      calibrate: '校準地圖 {name}',
      calibrateUnnamed: '校準地圖',
    },
    messages: {
      welcome: '選取東西後開啟選單即可調整大小，也可以縮放整個頁面。',
      upgraded: '已從 Resizer 0.0.9 升級。你的指令 {command} 和舊指令仍然可以使用。',
      readyHint: '輸入 {command} 開啟選單，或開啟「Resizer - Command Deck」講義。',
      zoomed: '已將 {page} 縮放 ×{factor}：{objects} 個物件跟著移動。',
      zoomedPages: '已將 {count} 個頁面縮放 ×{factor}（{page}）：{objects} 個物件跟著移動。',
      skipped: '有 {count} 個物件無法讀取，已保持不變。',
      skipped_one: '有 1 個物件無法讀取，已保持不變。',
      resized: '已將 {count} 個圖像調整為 {width} × {height} {unit}。',
      resized_one: '已將 1 個圖像調整為 {width} × {height} {unit}。',
      sized: '已將 {count} 個圖像調整為 {size}。',
      sized_one: '已將 1 個圖像調整為 {size}。',
      pageResized: '{page} 現在是 {size}。',
      fitted: '已將 {count} 個圖像符合頁面。',
      fitted_one: '已將 1 個圖像符合頁面。',
      centred: '已將 {count} 個物件置於頁面中央。',
      centred_one: '已將 1 個物件置於頁面中央。',
      calibrated:
        '校準完成：地圖原本每格 {square} px；現已縮放 ×{scale} 成為 {cell} px 的方格，並與格線對齊。',
      calibratedPage: '頁面現在是 {width} × {height} 單位，以符合地圖。',
      boxRemoved: '已刪除校準方框（按復原可以找回）。',
      undone: '已復原：{what}。',
      undoMissing: '之後有 {count} 個物件被刪除，因此無法還原。',
      undoMissing_one: '之後有 1 個物件被刪除，因此無法還原。',
      notStored: '這次變更太大，無法保存在復原紀錄中。',
      historyCleared: '已忘記 {count} 項變更。',
      historyCleared_one: '已忘記 1 項變更。',
      settingChanged: '{key} 現在是 {value}。',
      settingsReset: '設定已恢復為預設值。復原紀錄仍然保留。',
      handoutsRebuilt: '已重建說明和 Command Deck 講義。',
    },
    errors: {
      unexpected: '發生錯誤：{message}',
      unknownCommand: '未知的指令「{command}」。輸入 {help} 查看指令。',
      noSelection: '請先選取東西（或指定 --ids）。',
      unknownIds: '找不到這些 ID 的物件：{ids}',
      noGraphics: '選取的物件都無法用這種方式變更。請選取標記或地圖。',
      badSize: '請指定大於 0 的寬度和高度，例如 size 140 140 px。',
      badCreatureSize: '未知的體型。請使用 tiny, small, medium, large, huge or gargantuan。',
      badPageSize: '請指定 1 到 {max} 單位的頁面寬度和高度。',
      badFactor: '請指定 {min} 到 {max} 的縮放倍率。',
      badFactorText: '無法將「{text}」讀取為縮放倍率。請試試 2, 0.5, 150%, 1/2 或 "to 140"。',
      factorOne: '縮放倍率 1 不會改變任何東西。',
      pageTooBig: '{page} 會小於 1 單位或大於 {max} 單位。',
      noPage: '找不到頁面。',
      noPages: '沒有要變更的頁面。請在頁面選擇中勾選，或指定 --pages。',
      unknownPages: '沒有這些名稱的頁面：{pages}',
      noMap: '請一併選取地圖圖像。',
      noBox: '請選取畫在地圖方格上的矩形以及地圖，或使用 calibrate --cell <px>。',
      boxUnreadable: '無法讀取所選繪圖的大小。',
      boxTooSmall: '校準方框太小。請畫在一個或多個完整的方格上。',
      badCount: '請指定方框橫向（和縱向）的方格數，例如 3 或 3 2。',
      badSquarePx: '請以像素指定地圖的方格大小，至少為 2。',
      mapRotated: '校準前請將地圖轉正（0°、90°、180° 或 270°）。',
      nothingToUndo: '沒有可以復原的變更。',
      badSetting: '未知的設定「{key}」。可用設定：{settings}',
      badValue: '「{value}」不是 {key} 可接受的值。',
    },
    help: {
      menu: '開啟選單；選取物件時會顯示其大小。',
      size: '調整所選圖像的大小（預設單位為像素）。',
      creature: '將所選標記調整為生物體型，以格線方格計算。',
      fit: '將所選圖像符合頁面；--keep-ratio 會保持其形狀。',
      center: '將所選圖像或文字置於頁面中央。',
      calibrate: '縮放所選地圖，使所選方框內的方格與頁面格線一致，然後對齊。',
      calibrateCell: '依地圖方格的像素大小縮放所選地圖。',
      page: '顯示頁面大小，或調整頁面大小（不影響頁面上的東西）。',
      zoom: '縮放頁面及其上所有東西；每格代表的距離保持不變。',
      pages: '開啟頁面選擇，或勾選頁面，一次縮放多個頁面。',
      undo: '復原最新的變更（保留最近 10 項）。',
      history: '列出可以復原的變更；clear 會清除它們。',
      settings: '顯示或變更設定。',
      reset: '將設定恢復為預設值。',
      journal: '重建說明和 Command Deck 講義。',
      help: '顯示這份清單。',
    },
    deck: {
      menuTitle: '選單',
      menuDesc: '主選單會顯示目前的選取、頁面，以及可以復原的變更。',
      selectedTitle: '已選取的標記和圖像',
      selectedDesc: '先選取，再按按鈕。',
      mapTitle: '地圖',
      mapDesc: '選取地圖，以及畫在其幾個方格上的方框。',
      pageTitle: '頁面',
      pageDesc: '縮放你所在的頁面及其上所有東西。',
      historyTitle: '紀錄',
      historyDesc: '復原會撤銷最新的變更。',
      footer: '完整說明請見 {help} 講義。',
    },
    handout: {
      versionLabel: '版本',
      subtitle: '調整標記、地圖和整個頁面的大小',
      footer: '所有動作的按鈕都在 {deck} 講義中。',
      overview: {
        heading: '概覽',
        body: 'Resizer 可以調整所選標記和地圖的大小、調整頁面大小，並將整個頁面連同上面的所有東西一起縮放：地圖、標記、繪圖、文字、牆壁、門和窗戶。它支援 Jumpgate 和 Legacy 編輯器，保持每格代表的距離，將地圖與格線對齊，並可以復原最近 10 項變更。',
      },
      quickStart: {
        heading: '快速入門',
        steps: [
          '開啟「Resizer - Command Deck」講義，或輸入 !resizer 開啟選單。',
          '要調整標記大小，請選取標記，然後按「調整大小」或「生物體型」。',
          '要縮放頁面，請前往該頁面並按「縮放頁面」；2 會讓所有東西變成兩倍，0.5 則縮小一半。',
          '要讓地圖符合格線，請在地圖的幾個方格上畫一個矩形，選取矩形和地圖，然後按「校準地圖」。',
          '改變主意了？按「復原」即可。',
        ],
      },
      zoom: {
        heading: '縮放頁面',
        intro:
          '縮放會以左上角為基準，縮放頁面及其上所有東西。格線方格會變大或變小，但每格代表的距離不變（5 ft 仍是 5 ft），因此尺規、光環、標記的光源和視野量起來都一樣。',
        points: [
          '移動並縮放標記、地圖圖像、Jumpgate 和 Legacy 繪圖、文字、動態光照牆壁、門、窗戶，以及格線偏移。',
          '倍率可以是 2, 0.5, 150%, 1/2，或用 "to 140" 變成 140 px 的方格。',
          '保持標記大小（設定或 --keep-tokens）會讓標記隨地圖移動，但不改變其大小。',
          '除非關閉該設定，繪圖的線條寬度會隨頁面縮放；牆壁的寬度保持不變。',
          'Legacy 繪圖會以新大小重新繪製（Jumpgate 不會重繪被 Mod 變更的 Legacy 繪圖），因此會得到新的 ID。',
        ],
      },
      calibrate: {
        heading: '讓地圖符合格線',
        intro:
          '許多地圖都以自己的大小畫有自己的格線。校準會縮放地圖，使其方格與頁面的方格一致，並移動地圖讓線條對齊。',
        steps: [
          '將地圖放到頁面上，在地圖的幾個方格上從線到線畫一個矩形（任何繪圖工具皆可）。',
          '同時選取地圖和矩形（按住 Shift 點選）。',
          '按「校準地圖」，並回答方框橫向和縱向涵蓋幾格。',
          '地圖會被縮放並移動，使這些方格剛好符合頁面格線；方框會被刪除。',
        ],
        points: [
          '「校準並符合頁面」還會將地圖移到頁面角落，並調整頁面大小以符合地圖。',
          '「以像素校準」不需要方框：請以像素指定地圖目前每格的大小。',
          '方框越大（方格越多），符合得越精確。',
        ],
      },
      sizes: {
        heading: '生物體型',
        intro: '體型會以標記所在頁面的格線方格，將標記設為某個生物體型。',
        colSize: '體型',
        colCommand: '指令',
        colCells: '格數',
        cells: '{cells} × {cells}',
      },
      pages: {
        heading: '一次處理多個頁面',
        points: [
          '「選擇頁面」會開啟所有頁面的清單；勾選想要的頁面，然後按「縮放已勾選的頁面」。',
          '用輸入的方式：zoom 2 --pages all、--pages picked、--pages current，或以逗號分隔的名稱和 ID（--pages Town, Docks）。',
          '一次復原就會撤銷整批變更。',
        ],
      },
      undo: {
        heading: '復原',
        points: [
          '每項變更（調整大小、符合頁面、置中、校準、頁面大小、縮放）都可以復原。',
          '最近 10 項變更會隨遊戲保存，因此 Mod 沙箱重新啟動後仍然存在。',
          '變更後被刪除的物件會被回報並略過。',
          '非常大的變更（數千個物件）可能太大而無法保存；Resizer 會告訴你。',
        ],
      },
      commands: {
        heading: '指令',
        intro: '輸入 {command} 加上下列其中一項。!resizer 和 !rsz 也一直可以使用。',
        colCommand: '指令',
        colDesc: '作用',
      },
      settings: {
        heading: '設定',
        intro: '可在設定卡片中變更，或使用 set <setting> <value>。',
        colKey: '設定',
        colDesc: '作用',
        rows: {
          language: '選單、訊息和講義使用的語言。',
          command: '指令的額外名稱（0.0.9 允許你重新命名指令）。',
          keepTokenSize: '縮放時移動標記，但保持其大小。',
          scaleStrokes: '縮放時一併縮放繪圖的線條寬度（牆壁保持原寬度）。',
          deleteCalibrationBox: '校準後刪除用來測量的方框。',
        },
      },
      api: {
        heading: '給 Mod 作者',
        intro: '其他 Mod 可以使用全域的 Resizer 物件。',
        colFunction: '函式',
        colDesc: '作用',
        rows: {
          zoomPage: '縮放頁面及其上所有東西，並可復原。options.keepTokens 會保持標記大小。',
          undo: '復原最新的變更。',
          onZoom:
            '每次縮放後（復原縮放時則以 1/factor）呼叫你的函式，讓儲存頁面位置的 Mod 可以跟著調整。',
          history: '列出可以復原的變更。',
        },
      },
      upgrading: {
        heading: '從 0.0.9 升級',
        points: [
          '用這個腳本取代舊的腳本；你重新命名的指令會保留。',
          '舊指令仍然可以使用，作用與下方的新指令相同。',
          'scale 不再改變每格代表的距離（5 ft 的方格仍是 5 ft）。',
        ],
        colOld: '0.0.9',
        colNew: '1.0',
      },
      troubleshooting: {
        heading: '疑難排解',
        points: [
          '會記住頁面上位置的其他 Mod（巡邏路線、標記原位、儲存的區域）除非使用 Resizer.onZoom，否則不會得知縮放；縮放後請檢查它們。',
          '六角格頁面的縮放方式與方格頁面相同，但請確認標記仍位於各自的六角格內。',
          '如果縮放後繪圖位置看起來不對，請重新載入頁面：Roll20 有時會延遲重繪。',
          '校準需要地圖與頁面保持端正；請先將地圖轉到 0°、90°、180° 或 270°。',
        ],
      },
      languages: {
        heading: '語言',
        body: '可在設定卡片中、使用 set language <code>，或在 Mod 設定中選擇語言。',
        colLanguage: '語言',
        colNative: '原文名稱',
        colCode: '代碼',
      },
      credits: {
        heading: '致謝',
        original: '原始 Mod 作者：',
        maintainer: '改寫與維護：',
        thread: '論壇討論串',
        support: '發現問題或有想法嗎？請在論壇討論串留言，或在 GitHub 上開 issue。',
      },
    },
  };

  var localeCs = {
    titles: {
      ready: 'Resizer je připraven.',
      history: 'Resizer – historie',
      pages: 'Resizer – stránky',
      settings: 'Resizer – nastavení',
      help: 'Resizer – nápověda',
    },
    menu: {
      selected: 'Vybráno',
      nothingSelected: 'Nic není vybráno. Nejdřív vyber žetony, mapu nebo kresby.',
      graphicSize: '{name}: {width} × {height} px ({across} × {down} polí)',
      andMore: '…a {count} dalších.',
      map: 'Mapa',
      mapHint:
        'Nakresli obdélník přes několik vlastních políček mapy, vyber ho spolu s mapou a pak kalibruj.',
      page: 'Stránka',
      pageSize: '{across} × {down} polí, {cell} px na pole, {scale} {units} na pole',
      pageCells: '{across} × {down} polí',
      historyEmpty: 'Zatím není co vrátit.',
      historyHint: 'Zpět vrací nejdřív nejnovější změnu.',
      minutesAgo: 'před {minutes} min',
      pickerHint: 'Zaškrtni stránky ke společnému škálování a stiskni Škálovat zaškrtnuté stránky.',
      on: 'Zap.',
      off: 'Vyp.',
      handouts: 'Úplná nápověda v podkladech:',
    },
    kinds: {
      graphic: 'Grafika',
      text: 'Text',
      pathv2: 'Kresba',
      path: 'Kresba',
      door: 'Dveře',
      window: 'Okno',
    },
    sizes: {
      tiny: 'Drobná',
      small: 'Malá',
      medium: 'Střední',
      large: 'Velká',
      huge: 'Obrovská',
      gargantuan: 'Gigantická',
    },
    units: {
      px: 'px',
      cells: 'polí',
      units: 'jedn. stránky',
    },
    buttons: {
      menu: 'Menu',
      resize: 'Změnit velikost',
      creatureSize: 'Velikost tvora',
      fit: 'Přizpůsobit stránce',
      centre: 'Vycentrovat',
      sizes: 'Zobrazit velikosti',
      calibrate: 'Kalibrovat mapu',
      calibrateFit: 'Kalibrovat a přizpůsobit stránku',
      calibratePx: 'Kalibrovat podle pixelů',
      zoom: 'Škálovat stránku',
      zoomIn: 'Škálovat ×2',
      zoomOut: 'Škálovat ×½',
      resizePage: 'Změnit velikost stránky',
      pageSize: 'Velikost stránky',
      pages: 'Vybrat stránky',
      zoomPicked: 'Škálovat zaškrtnuté stránky ({count})',
      pickAll: 'Zaškrtnout vše',
      pickNone: 'Odškrtnout vše',
      undo: 'Zpět',
      undoWhat: 'Zpět: {what}',
      history: 'Historie',
      clearHistory: 'Vymazat historii',
      settings: 'Nastavení',
      help: 'Nápověda',
      resetSettings: 'Obnovit nastavení',
      rebuild: 'Znovu vytvořit podklady',
    },
    queries: {
      width: 'Šířka',
      height: 'Výška',
      unit: 'Jednotka',
      unitPx: 'Pixely',
      unitCells: 'Pole mřížky',
      unitUnits: 'Jednotky stránky (70 px)',
      creatureSize: 'Velikost tvora',
      keepShape: 'Zachovat tvar?',
      yes: 'Ano',
      no: 'Ne - roztáhnout na stránku',
      centre: 'Vycentrovat',
      both: 'Oběma směry',
      across: 'Políček rámečku vodorovně',
      down: 'Jen svisle',
      downCount: 'Políček rámečku svisle',
      squarePx: 'Pixelů na políčko mapy nyní',
      factor: 'Faktor škálování (2 = dvakrát větší; 0.5 = poloviční)',
      tokens: 'Žetony',
      tokensScale: 'Škálovat se stránkou',
      tokensKeep: 'Zachovat jejich velikost',
      language: 'Jazyk',
      command: 'Název příkazu bez !',
    },
    settings: {
      language: 'Jazyk',
      command: 'Příkaz',
      keepTokenSize: 'Zachovat velikost žetonů při škálování',
      scaleStrokes: 'Škálovat šířku čar kreseb',
      deleteCalibrationBox: 'Smazat kalibrační rámeček',
    },
    history: {
      change: 'Změna',
      zoom: 'Škálování ×{factor} stránky {page}',
      zoomPages: 'Škálování ×{factor} stránek: {count}',
      size: 'Změna velikosti grafik: {count}',
      size_one: 'Změna velikosti 1 grafiky',
      page: 'Stránka {page} na {width} × {height} jedn.',
      fit: 'Přizpůsobení grafik stránce: {count}',
      fit_one: 'Přizpůsobení 1 grafiky stránce',
      centre: 'Vycentrování objektů: {count}',
      centre_one: 'Vycentrování 1 objektu',
      calibrate: 'Kalibrace mapy {name}',
      calibrateUnnamed: 'Kalibrace mapy',
    },
    messages: {
      welcome: 'Vyber něco a otevři menu pro změnu velikosti, nebo naškáluj celou stránku.',
      upgraded:
        'Aktualizováno z Resizer 0.0.9. Tvůj příkaz {command} i staré příkazy stále fungují.',
      readyHint: 'Napiš {command} pro menu, nebo otevři podklad Resizer - Command Deck.',
      zoomed: 'Stránka {page} naškálována ×{factor}: posunuto s ní objektů: {objects}.',
      zoomedPages:
        'Naškálováno stránek: {count} ×{factor} ({page}): posunuto s nimi objektů: {objects}.',
      skipped: 'Objekty ({count}) nešlo přečíst, a tak zůstaly beze změny.',
      skipped_one: '1 objekt nešlo přečíst, a tak zůstal beze změny.',
      resized: 'Velikost grafik ({count}) změněna na {width} × {height} {unit}.',
      resized_one: 'Velikost 1 grafiky změněna na {width} × {height} {unit}.',
      sized: 'Velikost grafik ({count}) změněna na {size}.',
      sized_one: 'Velikost 1 grafiky změněna na {size}.',
      pageResized: '{page} má nyní velikost {size}.',
      fitted: 'Grafiky ({count}) přizpůsobeny stránce.',
      fitted_one: '1 grafika přizpůsobena stránce.',
      centred: 'Objekty ({count}) vycentrovány na stránce.',
      centred_one: '1 objekt vycentrován na stránce.',
      calibrated:
        'Kalibrováno: mapa měla políčka {square} px; nyní je naškálována ×{scale} na pole {cell} px a zarovnána s mřížkou.',
      calibratedPage: 'Stránka má nyní {width} × {height} jedn., aby se do ní mapa vešla.',
      boxRemoved: 'Kalibrační rámeček byl smazán (Zpět ho vrátí).',
      undone: 'Vráceno: {what}.',
      undoMissing: 'Objekty ({count}) byly mezitím smazány, takže je nešlo vrátit.',
      undoMissing_one: '1 objekt byl mezitím smazán, takže ho nešlo vrátit.',
      notStored: 'Tato změna byla příliš velká na uložení do historie Zpět.',
      historyCleared: 'Zapomenuto změn: {count}.',
      historyCleared_one: 'Zapomenuta 1 změna.',
      settingChanged: '{key} je nyní {value}.',
      settingsReset: 'Nastavení jsou zpět na výchozích hodnotách. Historie Zpět zůstala.',
      handoutsRebuilt: 'Podklady Help a Command Deck byly znovu vytvořeny.',
    },
    errors: {
      unexpected: 'Něco se pokazilo: {message}',
      unknownCommand: 'Neznámý příkaz "{command}". Napiš {help} pro seznam příkazů.',
      noSelection: 'Nejdřív něco vyber (nebo zadej --ids).',
      unknownIds: 'Žádné objekty s těmito ID: {ids}',
      noGraphics: 'Žádný z vybraných objektů nejde takto změnit. Vyber žetony nebo mapu.',
      badSize: 'Zadej šířku a výšku větší než 0, například size 140 140 px.',
      badCreatureSize: 'Neznámá velikost. Použij tiny, small, medium, large, huge nebo gargantuan.',
      badPageSize: 'Zadej šířku a výšku stránky od 1 do {max} jedn.',
      badFactor: 'Zadej faktor škálování od {min} do {max}.',
      badFactorText:
        '"{text}" nejde přečíst jako faktor škálování. Zkus 2, 0.5, 150%, 1/2 nebo "to 140".',
      factorOne: 'Škálování 1 nic nemění.',
      pageTooBig: '{page} by byla menší než 1 jedn. nebo větší než {max} jedn.',
      noPage: 'Stránku nelze najít.',
      noPages: 'Žádné stránky ke změně. Zaškrtni některé ve výběru stránek, nebo zadej --pages.',
      unknownPages: 'Žádné stránky s názvem: {pages}',
      noMap: 'Vyber také grafiku mapy.',
      noBox:
        'Kromě mapy vyber i obdélník nakreslený přes několik políček mapy, nebo použij calibrate --cell <px>.',
      boxUnreadable: 'Nelze přečíst velikost vybrané kresby.',
      boxTooSmall:
        'Kalibrační rámeček je příliš malý. Nakresli ho přes jedno či více celých políček.',
      badCount: 'Zadej počet políček rámečku vodorovně (a svisle), například 3 nebo 3 2.',
      badSquarePx: 'Zadej velikost políčka mapy v pixelech, alespoň 2.',
      mapRotated: 'Před kalibrací otoč mapu rovně ke stránce (0°, 90°, 180° nebo 270°).',
      nothingToUndo: 'Není co vrátit.',
      badSetting: 'Neznámé nastavení "{key}". Nastavení: {settings}',
      badValue: '"{value}" není hodnota, kterou {key} přijímá.',
    },
    help: {
      menu: 'Otevře menu; s vybranými objekty ukáže jejich velikosti.',
      size: 'Změní velikost vybraných grafik (výchozí jsou pixely).',
      creature: 'Změní velikost vybraných žetonů na velikost tvora, v polích mřížky.',
      fit: 'Přizpůsobí vybrané grafiky stránce; --keep-ratio zachová jejich tvar.',
      center: 'Vycentruje vybrané grafiky nebo text na stránce.',
      calibrate:
        'Naškáluje vybranou mapu tak, aby políčka uvnitř vybraného rámečku odpovídala mřížce stránky, a pak je zarovná.',
      calibrateCell: 'Naškáluje vybranou mapu podle velikosti jejího políčka v pixelech.',
      page: 'Ukáže velikost stránky, nebo změní velikost stránky (ne toho, co je na ní).',
      zoom: 'Škáluje stránky se vším, co na nich je; vzdálenost na pole zůstává.',
      pages: 'Otevře výběr stránek, nebo zaškrtne stránky, ke škálování více stránek najednou.',
      undo: 'Vrátí nejnovější změnu (uchovává se posledních 10).',
      history: 'Vypíše změny, které lze vrátit; clear je zapomene.',
      settings: 'Ukáže nebo změní nastavení.',
      reset: 'Vrátí nastavení na výchozí hodnoty.',
      journal: 'Znovu vytvoří podklady Help a Command Deck.',
      help: 'Ukáže tento seznam.',
    },
    deck: {
      menuTitle: 'Menu',
      menuDesc: 'Hlavní menu ukazuje výběr, stránku a to, co můžeš vrátit.',
      selectedTitle: 'Vybrané žetony a grafiky',
      selectedDesc: 'Nejdřív vyber, pak stiskni tlačítko.',
      mapTitle: 'Mapa',
      mapDesc: 'Vyber mapu a rámeček nakreslený přes několik jejích políček.',
      pageTitle: 'Stránka',
      pageDesc: 'Naškáluj stránku, na které jsi, se vším, co na ní je.',
      historyTitle: 'Historie',
      historyDesc: 'Zpět vrací nejnovější změnu.',
      footer: 'Úplné pokyny jsou v podkladu {help}.',
    },
    handout: {
      versionLabel: 'Verze',
      subtitle: 'Změna velikosti žetonů, map a celých stránek',
      footer: 'Tlačítka pro každou akci jsou v podkladu {deck}.',
      overview: {
        heading: 'Přehled',
        body: 'Resizer mění velikost vybraných žetonů a map, mění velikost stránek a škáluje celou stránku se vším, co na ní je: mapou, žetony, kresbami, textem, zdmi, dveřmi a okny. Funguje v editorech Jumpgate i Legacy, zachovává vzdálenost na pole mřížky, zarovnává mapy s mřížkou a umí vrátit svých posledních 10 změn.',
      },
      quickStart: {
        heading: 'Rychlý start',
        steps: [
          'Otevři podklad Resizer - Command Deck, nebo napiš !resizer pro menu.',
          'Ke změně velikosti žetonů je vyber a stiskni Změnit velikost nebo Velikost tvora.',
          'Ke škálování stránky na ni přejdi a stiskni Škálovat stránku; 2 vše zdvojnásobí, 0.5 zmenší na polovinu.',
          'K přizpůsobení mapy mřížce nakresli obdélník přes několik políček mapy, vyber ho spolu s mapou a stiskni Kalibrovat mapu.',
          'Rozmyslel ses? Stiskni Zpět.',
        ],
      },
      zoom: {
        heading: 'Škálování stránek',
        intro:
          'Škálování zvětší nebo zmenší stránku a vše na ní vůči jejímu levému hornímu rohu. Pole mřížky se zvětší nebo zmenší, ale každé pole stále představuje stejnou vzdálenost (5 ft zůstává 5 ft), takže pravítka, aury, světla žetonů i vidění měří stejně.',
        points: [
          'Posouvá a škáluje žetony, grafiky map, kresby Jumpgate i Legacy, text, zdi dynamického osvětlení, dveře a okna i posun mřížky.',
          'Faktor může být 2, 0.5, 150%, 1/2 nebo "to 140" pro pole 140 px.',
          'Zachovat velikost žetonů (nastavení nebo --keep-tokens) posouvá žetony s mapou, ale jejich velikost nemění.',
          'Šířka čar kreseb se škáluje se stránkou, pokud není nastavení vypnuté; zdi si šířku zachovají.',
          'Kresby Legacy se znovu nakreslí v nové velikosti (Jumpgate nepřekreslí kresbu Legacy, kterou Mod změní), takže dostanou nová ID.',
        ],
      },
      calibrate: {
        heading: 'Přizpůsobení mapy mřížce',
        intro:
          'Mnoho map má vlastní mřížku ve vlastní velikosti. Kalibrace naškáluje mapu tak, aby její políčka odpovídala polím stránky, a posune ji tak, aby se čáry potkaly.',
        steps: [
          'Polož mapu na stránku a nakresli obdélník (jakýmkoli kreslicím nástrojem) přes několik políček mapy, od čáry k čáře.',
          'Vyber mapu a obdélník společně (Shift+klik).',
          'Stiskni Kalibrovat mapu a zadej, kolik políček rámeček pokrývá vodorovně a svisle.',
          'Mapa se naškáluje a posune tak, aby tato políčka přesně seděla na mřížku stránky; rámeček se smaže.',
        ],
        points: [
          'Kalibrovat a přizpůsobit stránku navíc posune mapu do rohu stránky a změní velikost stránky podle mapy.',
          'Kalibrovat podle pixelů vynechá rámeček: zadej velikost políčka mapy v pixelech, jak je nyní nakreslená.',
          'Větší rámeček (více políček) dá přesnější výsledek.',
        ],
      },
      sizes: {
        heading: 'Velikosti tvorů',
        intro: 'Velikost nastaví žetony na velikost tvora v polích mřížky jejich stránky.',
        colSize: 'Velikost',
        colCommand: 'Příkaz',
        colCells: 'Pole',
        cells: '{cells} × {cells}',
      },
      pages: {
        heading: 'Více stránek najednou',
        points: [
          'Vybrat stránky otevře seznam všech stránek; zaškrtni ty, které chceš, a stiskni Škálovat zaškrtnuté stránky.',
          'Příkazem: zoom 2 --pages all, --pages picked, --pages current nebo názvy a ID oddělené čárkami (--pages Town, Docks).',
          'Jedno Zpět vrátí celou dávku.',
        ],
      },
      undo: {
        heading: 'Zpět',
        points: [
          'Každou změnu (velikost, přizpůsobení, vycentrování, kalibrace, velikost stránky, škálování) lze vrátit.',
          'Posledních 10 změn se ukládá ve hře, takže přežijí restart sandboxu Modů.',
          'Objekty smazané od změny se nahlásí a přeskočí.',
          'Velmi velké změny (tisíce objektů) mohou být příliš velké na uložení; Resizer na to upozorní.',
        ],
      },
      commands: {
        heading: 'Příkazy',
        intro: 'Napiš {command} s jedním z těchto. !resizer a !rsz fungují vždy také.',
        colCommand: 'Příkaz',
        colDesc: 'Co dělá',
      },
      settings: {
        heading: 'Nastavení',
        intro: 'Měň je na kartě Nastavení nebo příkazem set <setting> <value>.',
        colKey: 'Nastavení',
        colDesc: 'Co dělá',
        rows: {
          language: 'Jazyk menu, zpráv a podkladů.',
          command: 'Další název příkazu (0.0.9 umožňovala jeho přejmenování).',
          keepTokenSize: 'Škálování posouvá žetony, ale zachová jejich velikost.',
          scaleStrokes: 'Škálování mění šířku čar kreseb (zdi si zachovají svou).',
          deleteCalibrationBox: 'Kalibrace smaže rámeček, který změřila.',
        },
      },
      api: {
        heading: 'Pro autory Modů',
        intro: 'Ostatní Mody mohou používat globální objekt Resizer.',
        colFunction: 'Funkce',
        colDesc: 'Co dělá',
        rows: {
          zoomPage:
            'Naškáluje stránku se vším, co na ní je, s možností Zpět. options.keepTokens zachová velikosti žetonů.',
          undo: 'Vrátí nejnovější změnu.',
          onZoom:
            'Zavolá tvou funkci po každém škálování (a s 1/factor po jeho vrácení), aby Mod ukládající pozice na stránce mohl držet krok.',
          history: 'Vypíše změny, které lze vrátit.',
        },
      },
      upgrading: {
        heading: 'Přechod z 0.0.9',
        points: [
          'Nahraď starý skript tímto; tvůj přejmenovaný příkaz zůstane.',
          'Staré příkazy stále fungují a dělají totéž co nové níže.',
          'scale už nemění vzdálenost na pole (pole 5 ft zůstává 5 ft).',
        ],
        colOld: '0.0.9',
        colNew: '1.0',
      },
      troubleshooting: {
        heading: 'Řešení potíží',
        points: [
          'Ostatní Mody, které si pamatují pozice na stránce (trasy hlídek, domovská místa žetonů, uložené oblasti), se o škálování nedozví, pokud nepoužívají Resizer.onZoom; po škálování je zkontroluj.',
          'Hexové stránky se škálují jako čtvercové, ale zkontroluj, že žetony stále stojí ve svých hexech.',
          'Pokud kresba hned po škálování vypadá posunutá, obnov stránku: Roll20 někdy překresluje se zpožděním.',
          'Kalibrace vyžaduje mapu rovně ke stránce; nejdřív ji otoč na 0°, 90°, 180° nebo 270°.',
        ],
      },
      languages: {
        heading: 'Jazyky',
        body: 'Vyber jazyk na kartě Nastavení, příkazem set language <code> nebo v nastavení Modu.',
        colLanguage: 'Jazyk',
        colNative: 'Původní název',
        colCode: 'Kód',
      },
      credits: {
        heading: 'Autoři',
        original: 'Původní Mod od',
        maintainer: 'Přepsal a spravuje',
        thread: 'Vlákno na fóru',
        support:
          'Našel jsi problém nebo máš nápad? Napiš do vlákna na fóru nebo založ issue na GitHubu.',
      },
    },
  };

  var localeDa = {
    titles: {
      ready: 'Resizer er klar.',
      history: 'Resizer-historik',
      pages: 'Resizer-sider',
      settings: 'Resizer-indstillinger',
      help: 'Resizer-hjælp',
    },
    menu: {
      selected: 'Markeret',
      nothingSelected: 'Intet er markeret. Markér brikker, et kort eller tegninger først.',
      graphicSize: '{name}: {width} × {height} px ({across} × {down} felter)',
      andMore: '…og {count} mere.',
      map: 'Kort',
      mapHint:
        'Tegn et rektangel over nogle af kortets egne felter, markér det og kortet, og kalibrér så.',
      page: 'Side',
      pageSize: '{across} × {down} felter, {cell} px pr. felt, {scale} {units} pr. felt',
      pageCells: '{across} × {down} felter',
      historyEmpty: 'Intet at fortryde endnu.',
      historyHint: 'Fortryd tager den nyeste ændring tilbage først.',
      minutesAgo: 'for {minutes} min. siden',
      pickerHint: 'Sæt flueben ved de sider, der skal zoomes sammen, og tryk på Zoom valgte sider.',
      on: 'Til',
      off: 'Fra',
      handouts: 'Fuld hjælp i uddelingsarkene:',
    },
    kinds: {
      graphic: 'Grafik',
      text: 'Tekst',
      pathv2: 'Tegning',
      path: 'Tegning',
      door: 'Dør',
      window: 'Vindue',
    },
    sizes: {
      tiny: 'Lillebitte',
      small: 'Lille',
      medium: 'Mellem',
      large: 'Stor',
      huge: 'Kæmpe',
      gargantuan: 'Gigantisk',
    },
    units: {
      px: 'px',
      cells: 'felter',
      units: 'sideenheder',
    },
    buttons: {
      menu: 'Menu',
      resize: 'Skift størrelse',
      creatureSize: 'Væsenstørrelse',
      fit: 'Tilpas til siden',
      centre: 'Centrér',
      sizes: 'Vis størrelser',
      calibrate: 'Kalibrér kort',
      calibrateFit: 'Kalibrér og tilpas side',
      calibratePx: 'Kalibrér med pixels',
      zoom: 'Zoom side',
      zoomIn: 'Zoom ×2',
      zoomOut: 'Zoom ×½',
      resizePage: 'Skift sidestørrelse',
      pageSize: 'Sidestørrelse',
      pages: 'Vælg sider',
      zoomPicked: 'Zoom valgte sider ({count})',
      pickAll: 'Vælg alle',
      pickNone: 'Fravælg alle',
      undo: 'Fortryd',
      undoWhat: 'Fortryd: {what}',
      history: 'Historik',
      clearHistory: 'Ryd historik',
      settings: 'Indstillinger',
      help: 'Hjælp',
      resetSettings: 'Nulstil indstillinger',
      rebuild: 'Genopbyg uddelingsark',
    },
    queries: {
      width: 'Bredde',
      height: 'Højde',
      unit: 'Enhed',
      unitPx: 'Pixels',
      unitCells: 'Gitterfelter',
      unitUnits: 'Sideenheder (70 px)',
      creatureSize: 'Væsenstørrelse',
      keepShape: 'Behold formen?',
      yes: 'Ja',
      no: 'Nej - stræk til siden',
      centre: 'Centrér',
      both: 'Begge veje',
      across: 'Felter i rektanglets bredde',
      down: 'Kun lodret',
      downCount: 'Felter i rektanglets højde',
      squarePx: 'Pixels pr. felt på kortet nu',
      factor: 'Zoomfaktor (2 = dobbelt så stor; 0.5 = halvdelen)',
      tokens: 'Brikker',
      tokensScale: 'Skalér med siden',
      tokensKeep: 'Behold deres størrelse',
      language: 'Sprog',
      command: 'Kommandonavn uden !',
    },
    settings: {
      language: 'Sprog',
      command: 'Kommando',
      keepTokenSize: 'Behold brikkernes størrelse ved zoom',
      scaleStrokes: 'Skalér stregbredde i tegninger',
      deleteCalibrationBox: 'Slet kalibreringsrektanglet',
    },
    history: {
      change: 'Ændring',
      zoom: 'Zoom ×{factor} på {page}',
      zoomPages: 'Zoom ×{factor} på {count} sider',
      size: 'Skift størrelse på {count} grafikker',
      size_one: 'Skift størrelse på 1 grafik',
      page: 'Siden {page} til {width} × {height} enheder',
      fit: 'Tilpas {count} grafikker til siden',
      fit_one: 'Tilpas 1 grafik til siden',
      centre: 'Centrér {count} objekter',
      centre_one: 'Centrér 1 objekt',
      calibrate: 'Kalibrér kortet {name}',
      calibrateUnnamed: 'Kalibrér kortet',
    },
    messages: {
      welcome: 'Markér noget og åbn menuen for at skifte størrelse, eller zoom en hel side.',
      upgraded:
        'Opgraderet fra Resizer 0.0.9. Din kommando {command} og de gamle kommandoer virker stadig.',
      readyHint: 'Skriv {command} for menuen, eller åbn uddelingsarket Resizer - Command Deck.',
      zoomed: 'Zoomede {page} ×{factor}: {objects} objekter blev flyttet med.',
      zoomedPages: 'Zoomede {count} sider ×{factor} ({page}): {objects} objekter blev flyttet med.',
      skipped: '{count} objekter kunne ikke læses og blev ladt urørt.',
      skipped_one: '1 objekt kunne ikke læses og blev ladt urørt.',
      resized: 'Skiftede størrelse på {count} grafikker til {width} × {height} {unit}.',
      resized_one: 'Skiftede størrelse på 1 grafik til {width} × {height} {unit}.',
      sized: 'Skiftede størrelse på {count} grafikker til {size}.',
      sized_one: 'Skiftede størrelse på 1 grafik til {size}.',
      pageResized: '{page} er nu {size}.',
      fitted: 'Tilpassede {count} grafikker til siden.',
      fitted_one: 'Tilpassede 1 grafik til siden.',
      centred: 'Centrerede {count} objekter på siden.',
      centred_one: 'Centrerede 1 objekt på siden.',
      calibrated:
        'Kalibreret: kortet havde felter på {square} px; nu er det skaleret ×{scale} til felter på {cell} px og flugter med gitteret.',
      calibratedPage: 'Siden er nu {width} × {height} enheder, så kortet passer.',
      boxRemoved: 'Kalibreringsrektanglet blev slettet (Fortryd henter det tilbage).',
      undone: 'Fortrudt: {what}.',
      undoMissing: '{count} objekter var blevet slettet siden og kunne ikke sættes tilbage.',
      undoMissing_one: '1 objekt var blevet slettet siden og kunne ikke sættes tilbage.',
      notStored: 'Ændringen var for stor til at blive gemt i fortrydelseshistorikken.',
      historyCleared: 'Glemte {count} ændringer.',
      historyCleared_one: 'Glemte 1 ændring.',
      settingChanged: '{key} er nu {value}.',
      settingsReset: 'Indstillingerne er nulstillet. Fortrydelseshistorikken blev bevaret.',
      handoutsRebuilt: 'Uddelingsarkene Help og Command Deck blev genopbygget.',
    },
    errors: {
      unexpected: 'Noget gik galt: {message}',
      unknownCommand: 'Ukendt kommando "{command}". Skriv {help} for at se kommandoerne.',
      noSelection: 'Markér noget først (eller angiv --ids).',
      unknownIds: 'Ingen objekter med disse ID’er: {ids}',
      noGraphics: 'Ingen af de markerede objekter kan ændres sådan. Markér brikker eller et kort.',
      badSize: 'Angiv en bredde og en højde over 0, for eksempel size 140 140 px.',
      badCreatureSize: 'Ukendt størrelse. Brug tiny, small, medium, large, huge eller gargantuan.',
      badPageSize: 'Angiv en sidebredde og sidehøjde fra 1 til {max} enheder.',
      badFactor: 'Angiv en zoomfaktor fra {min} til {max}.',
      badFactorText:
        'Kunne ikke læse "{text}" som zoomfaktor. Prøv 2, 0.5, 150%, 1/2 eller "to 140".',
      factorOne: 'En zoom på 1 ændrer intet.',
      pageTooBig: '{page} ville blive mindre end 1 enhed eller større end {max} enheder.',
      noPage: 'Kunne ikke finde siden.',
      noPages: 'Ingen sider at ændre. Sæt flueben ved nogle i sidevælgeren, eller angiv --pages.',
      unknownPages: 'Ingen sider med navnet: {pages}',
      noMap: 'Markér også kortgrafikken.',
      noBox:
        'Markér et rektangel tegnet over nogle af kortets felter sammen med kortet, eller brug calibrate --cell <px>.',
      boxUnreadable: 'Kunne ikke læse størrelsen på den markerede tegning.',
      boxTooSmall: 'Kalibreringsrektanglet er for lille. Tegn det over et eller flere hele felter.',
      badCount:
        'Angiv antallet af felter i rektanglets bredde (og højde), for eksempel 3 eller 3 2.',
      badSquarePx: 'Angiv størrelsen på kortets felter i pixels, 2 eller mere.',
      mapRotated:
        'Drej kortet lige i forhold til siden (0°, 90°, 180° eller 270°), før du kalibrerer.',
      nothingToUndo: 'Intet at fortryde.',
      badSetting: 'Ukendt indstilling "{key}". Indstillinger: {settings}',
      badValue: '"{value}" er ikke en værdi, som {key} accepterer.',
    },
    help: {
      menu: 'Åbn menuen; med markerede objekter viser den deres størrelser.',
      size: 'Skift størrelse på den markerede grafik (i pixels som standard).',
      creature: 'Giv de markerede brikker en væsenstørrelse, i gitterfelter.',
      fit: 'Tilpas den markerede grafik til siden; --keep-ratio bevarer formen.',
      center: 'Centrér den markerede grafik eller tekst på siden.',
      calibrate:
        'Skalér det markerede kort, så felterne inde i det markerede rektangel passer til sidens gitter, og ret dem så ind.',
      calibrateCell: 'Skalér det markerede kort ud fra dets feltstørrelse i pixels.',
      page: 'Vis sidestørrelsen, eller skift sidens størrelse (ikke det, der ligger på den).',
      zoom: 'Zoom sider med alt, hvad der ligger på dem; afstanden pr. felt bevares.',
      pages: 'Åbn sidevælgeren, eller vælg sider, for at zoome flere sider på én gang.',
      undo: 'Fortryd den nyeste ændring (de sidste 10 gemmes).',
      history: 'Vis de ændringer, du kan fortryde; clear glemmer dem.',
      settings: 'Vis eller skift indstillingerne.',
      reset: 'Sæt indstillingerne tilbage til standard.',
      journal: 'Genopbyg uddelingsarkene Help og Command Deck.',
      help: 'Vis denne liste.',
    },
    deck: {
      menuTitle: 'Menu',
      menuDesc: 'Hovedmenuen viser markeringen, siden og hvad du kan fortryde.',
      selectedTitle: 'Markerede brikker og grafik',
      selectedDesc: 'Markér først, og tryk så på en knap.',
      mapTitle: 'Kort',
      mapDesc: 'Markér kortet og et rektangel tegnet over nogle af dets felter.',
      pageTitle: 'Side',
      pageDesc: 'Zoom den side, du er på, med alt, hvad der ligger på den.',
      historyTitle: 'Historik',
      historyDesc: 'Fortryd tager den nyeste ændring tilbage.',
      footer: 'Den fulde vejledning står i uddelingsarket {help}.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Skift størrelse på brikker, kort og hele sider',
      footer: 'Knapper til alle handlinger findes i uddelingsarket {deck}.',
      overview: {
        heading: 'Oversigt',
        body: 'Resizer skifter størrelse på markerede brikker og kort, skifter størrelse på sider og zoomer en hel side med alt, hvad der ligger på den: kort, brikker, tegninger, tekst, vægge, døre og vinduer. Den virker med editorerne Jumpgate og Legacy, bevarer afstanden pr. gitterfelt, retter kort ind efter gitteret og kan fortryde sine sidste 10 ændringer.',
      },
      quickStart: {
        heading: 'Kom i gang',
        steps: [
          'Åbn uddelingsarket Resizer - Command Deck, eller skriv !resizer for menuen.',
          'Markér brikker og tryk på Skift størrelse eller Væsenstørrelse for at ændre deres størrelse.',
          'Gå til en side og tryk på Zoom side for at zoome den; 2 fordobler alt, 0.5 halverer det.',
          'Tegn et rektangel over nogle af kortets felter, markér det og kortet, og tryk på Kalibrér kort for at tilpasse kortet til gitteret.',
          'Fortrudt? Tryk på Fortryd.',
        ],
      },
      zoom: {
        heading: 'Zoom af sider',
        intro:
          'Zoom skalerer en side og alt på den ud fra det øverste venstre hjørne. Gitterfelterne bliver større eller mindre, men hvert felt står stadig for den samme afstand (5 ft forbliver 5 ft), så linealer, auraer, brikkernes lys og syn måler det samme.',
        points: [
          'Flytter og skalerer brikker, kortgrafik, tegninger fra Jumpgate og Legacy, tekst, vægge til dynamisk belysning, døre og vinduer samt gitterets forskydning.',
          'Faktorer kan være 2, 0.5, 150%, 1/2 eller "to 140" for felter på 140 px.',
          'Behold brikkernes størrelse (indstilling eller --keep-tokens) flytter brikkerne med kortet, men lader deres størrelse være.',
          'Stregbredden i tegninger skaleres med siden, medmindre indstillingen er slået fra; vægge beholder deres bredde.',
          'Legacy-tegninger tegnes igen i den nye størrelse (Jumpgate gentegner ikke en Legacy-tegning, som en Mod ændrer), så de får nye ID’er.',
        ],
      },
      calibrate: {
        heading: 'Tilpas et kort til gitteret',
        intro:
          'Mange kort er tegnet med deres eget gitter i deres egen størrelse. Kalibrér skalerer kortet, så dets felter passer til sidens felter, og flytter det, så linjerne mødes.',
        steps: [
          'Læg kortet på siden og tegn et rektangel (med et hvilket som helst tegneværktøj) over nogle af kortets felter, fra linje til linje.',
          'Markér kortet og rektanglet sammen (Shift-klik).',
          'Tryk på Kalibrér kort, og svar på, hvor mange felter rektanglet dækker i bredden og højden.',
          'Kortet skaleres og flyttes, så de felter passer præcist til sidens gitter; rektanglet slettes.',
        ],
        points: [
          'Kalibrér og tilpas side flytter også kortet til sidens hjørne og ændrer sidens størrelse, så kortet passer.',
          'Kalibrér med pixels springer rektanglet over: angiv størrelsen på kortets felter i pixels, som de er tegnet nu.',
          'Et større rektangel (flere felter) giver en mere præcis tilpasning.',
        ],
      },
      sizes: {
        heading: 'Væsenstørrelser',
        intro: 'Kommandoen size giver brikker en væsenstørrelse i sidens gitterfelter.',
        colSize: 'Størrelse',
        colCommand: 'Kommando',
        colCells: 'Felter',
        cells: '{cells} × {cells}',
      },
      pages: {
        heading: 'Flere sider på én gang',
        points: [
          'Vælg sider åbner en liste over alle sider; sæt flueben ved dem, du vil have, og tryk på Zoom valgte sider.',
          'Skrevet: zoom 2 --pages all, --pages picked, --pages current, eller navne og ID’er adskilt af kommaer (--pages Town, Docks).',
          'Én fortrydelse tager hele omgangen tilbage.',
        ],
      },
      undo: {
        heading: 'Fortryd',
        points: [
          'Alle ændringer (størrelse, tilpasning, centrering, kalibrering, sidestørrelse, zoom) kan fortrydes.',
          'De sidste 10 ændringer gemmes med spillet, så de overlever en genstart af Mod-sandkassen.',
          'Objekter, der er slettet siden ændringen, bliver meldt og sprunget over.',
          'Meget store ændringer (tusindvis af objekter) kan være for store til at gemme; Resizer siger til.',
        ],
      },
      commands: {
        heading: 'Kommandoer',
        intro: 'Skriv {command} med en af disse. !resizer og !rsz virker også altid.',
        colCommand: 'Kommando',
        colDesc: 'Hvad den gør',
      },
      settings: {
        heading: 'Indstillinger',
        intro: 'Skift dem fra Indstillinger-menuen eller med set <setting> <value>.',
        colKey: 'Indstilling',
        colDesc: 'Hvad den gør',
        rows: {
          language: 'Sprog for menuer, beskeder og uddelingsark.',
          command: 'Et ekstra navn til kommandoen (i 0.0.9 kunne du omdøbe den).',
          keepTokenSize: 'Zoom flytter brikker, men bevarer deres størrelse.',
          scaleStrokes: 'Zoom skalerer stregbredden i tegninger (vægge beholder deres).',
          deleteCalibrationBox: 'Kalibrér sletter det rektangel, den målte.',
        },
      },
      api: {
        heading: 'For Mod-udviklere',
        intro: 'Andre Mods kan bruge det globale Resizer-objekt.',
        colFunction: 'Funktion',
        colDesc: 'Hvad den gør',
        rows: {
          zoomPage:
            'Zoomer en side med alt på den, med fortryd. options.keepTokens bevarer brikkernes størrelse.',
          undo: 'Fortryder den nyeste ændring.',
          onZoom:
            'Kalder din funktion efter hver zoom (og med 1/factor efter at have fortrudt en), så en Mod, der gemmer positioner på siden, kan følge med.',
          history: 'Viser de ændringer, der kan fortrydes.',
        },
      },
      upgrading: {
        heading: 'Opgradering fra 0.0.9',
        points: [
          'Erstat det gamle script med dette; din omdøbte kommando bevares.',
          'De gamle kommandoer virker stadig og gør det samme som de nye herunder.',
          'scale ændrer ikke længere afstanden pr. felt (et felt på 5 ft forbliver 5 ft).',
        ],
        colOld: '0.0.9',
        colNew: '1.0',
      },
      troubleshooting: {
        heading: 'Fejlfinding',
        points: [
          'Andre Mods, der husker positioner på en side (patruljeruter, brikkers hjemmepladser, gemte områder), får ikke besked om en zoom, medmindre de bruger Resizer.onZoom; tjek dem efter zoomet.',
          'Sekskantsider zoomes ligesom firkantede, men tjek, at brikkerne stadig står i deres sekskanter.',
          'Hvis en tegning ser forkert placeret ud lige efter en zoom, så genindlæs siden: Roll20 gentegner nogle gange sent.',
          'Kalibrér kræver, at kortet ligger lige i forhold til siden; drej det til 0°, 90°, 180° eller 270° først.',
        ],
      },
      languages: {
        heading: 'Sprog',
        body: 'Vælg et sprog i Indstillinger-menuen, med set language <code>, eller i Mod-indstillingerne.',
        colLanguage: 'Sprog',
        colNative: 'Eget navn',
        colCode: 'Kode',
      },
      credits: {
        heading: 'Tak til',
        original: 'Oprindelig Mod af',
        maintainer: 'Omskrevet og vedligeholdt af',
        thread: 'Forumtråd',
        support:
          'Fundet et problem eller har en idé? Skriv i forumtråden eller opret en sag på GitHub.',
      },
    },
  };

  var localeNl = {
    titles: {
      ready: 'Resizer is klaar.',
      history: 'Resizer-geschiedenis',
      pages: 'Resizer-pagina’s',
      settings: 'Resizer-instellingen',
      help: 'Resizer-hulp',
    },
    menu: {
      selected: 'Geselecteerd',
      nothingSelected: 'Niets geselecteerd. Selecteer eerst tokens, een kaart of tekeningen.',
      graphicSize: '{name}: {width} × {height} px ({across} × {down} vakjes)',
      andMore: '…en nog {count}.',
      map: 'Kaart',
      mapHint:
        'Teken een rechthoek over een paar vakjes van de kaart zelf, selecteer die samen met de kaart en kalibreer.',
      page: 'Pagina',
      pageSize: '{across} × {down} vakjes, {cell} px per vakje, {scale} {units} per vakje',
      pageCells: '{across} × {down} vakjes',
      historyEmpty: 'Nog niets om ongedaan te maken.',
      historyHint: 'Ongedaan maken draait eerst de nieuwste wijziging terug.',
      minutesAgo: '{minutes} min geleden',
      pickerHint:
        'Vink de pagina’s aan die samen moeten zoomen en druk dan op Aangevinkte pagina’s zoomen.',
      on: 'Aan',
      off: 'Uit',
      handouts: 'Volledige hulp in de handouts:',
    },
    kinds: {
      graphic: 'Afbeelding',
      text: 'Tekst',
      pathv2: 'Tekening',
      path: 'Tekening',
      door: 'Deur',
      window: 'Raam',
    },
    sizes: {
      tiny: 'Minuscuul',
      small: 'Klein',
      medium: 'Middelgroot',
      large: 'Groot',
      huge: 'Enorm',
      gargantuan: 'Gigantisch',
    },
    units: {
      px: 'px',
      cells: 'vakjes',
      units: 'pagina-eenheden',
    },
    buttons: {
      menu: 'Menu',
      resize: 'Formaat wijzigen',
      creatureSize: 'Wezensgrootte',
      fit: 'Passend op pagina',
      centre: 'Centreren',
      sizes: 'Formaten tonen',
      calibrate: 'Kaart kalibreren',
      calibrateFit: 'Kalibreren en pagina passend maken',
      calibratePx: 'Kalibreren op pixels',
      zoom: 'Pagina zoomen',
      zoomIn: 'Zoom ×2',
      zoomOut: 'Zoom ×½',
      resizePage: 'Paginaformaat wijzigen',
      pageSize: 'Paginaformaat',
      pages: 'Pagina’s kiezen',
      zoomPicked: 'Aangevinkte pagina’s zoomen ({count})',
      pickAll: 'Alles aanvinken',
      pickNone: 'Niets aanvinken',
      undo: 'Ongedaan maken',
      undoWhat: 'Ongedaan maken: {what}',
      history: 'Geschiedenis',
      clearHistory: 'Geschiedenis wissen',
      settings: 'Instellingen',
      help: 'Hulp',
      resetSettings: 'Instellingen herstellen',
      rebuild: 'Handouts opnieuw maken',
    },
    queries: {
      width: 'Breedte',
      height: 'Hoogte',
      unit: 'Eenheid',
      unitPx: 'Pixels',
      unitCells: 'Rastervakjes',
      unitUnits: 'Pagina-eenheden (70 px)',
      creatureSize: 'Wezensgrootte',
      keepShape: 'Vorm behouden?',
      yes: 'Ja',
      no: 'Nee - uitrekken tot de pagina',
      centre: 'Centreren',
      both: 'Beide richtingen',
      across: 'Vakjes in de breedte van het kader',
      down: 'Alleen verticaal',
      downCount: 'Vakjes in de hoogte van het kader',
      squarePx: 'Pixels per vakje op de kaart nu',
      factor: 'Zoomfactor (2 = twee keer zo groot; 0.5 = de helft)',
      tokens: 'Tokens',
      tokensScale: 'Meeschalen met de pagina',
      tokensKeep: 'Hun formaat behouden',
      language: 'Taal',
      command: 'Commandonaam zonder !',
    },
    settings: {
      language: 'Taal',
      command: 'Commando',
      keepTokenSize: 'Tokenformaat behouden bij zoomen',
      scaleStrokes: 'Lijndikte van tekeningen meeschalen',
      deleteCalibrationBox: 'Kalibratiekader verwijderen',
    },
    history: {
      change: 'Wijziging',
      zoom: 'Zoom ×{factor} op {page}',
      zoomPages: 'Zoom ×{factor} op {count} pagina’s',
      size: 'Formaat van {count} afbeeldingen wijzigen',
      size_one: 'Formaat van 1 afbeelding wijzigen',
      page: 'Pagina {page} naar {width} × {height} eenheden',
      fit: '{count} afbeeldingen passend maken op de pagina',
      fit_one: '1 afbeelding passend maken op de pagina',
      centre: '{count} objecten centreren',
      centre_one: '1 object centreren',
      calibrate: 'Kaart {name} kalibreren',
      calibrateUnnamed: 'De kaart kalibreren',
    },
    messages: {
      welcome:
        'Selecteer iets en open het menu om het formaat te wijzigen, of zoom een hele pagina.',
      upgraded:
        'Bijgewerkt vanaf Resizer 0.0.9. Je commando {command} en de oude commando’s werken nog steeds.',
      readyHint: 'Typ {command} voor het menu, of open de handout Resizer - Command Deck.',
      zoomed: '{page} ×{factor} gezoomd: {objects} objecten zijn meebewogen.',
      zoomedPages:
        '{count} pagina’s ×{factor} gezoomd ({page}): {objects} objecten zijn meebewogen.',
      skipped: '{count} objecten konden niet worden gelezen en zijn ongemoeid gelaten.',
      skipped_one: '1 object kon niet worden gelezen en is ongemoeid gelaten.',
      resized: 'Formaat van {count} afbeeldingen gewijzigd naar {width} × {height} {unit}.',
      resized_one: 'Formaat van 1 afbeelding gewijzigd naar {width} × {height} {unit}.',
      sized: 'Formaat van {count} afbeeldingen gewijzigd naar {size}.',
      sized_one: 'Formaat van 1 afbeelding gewijzigd naar {size}.',
      pageResized: '{page} is nu {size}.',
      fitted: '{count} afbeeldingen passend gemaakt op de pagina.',
      fitted_one: '1 afbeelding passend gemaakt op de pagina.',
      centred: '{count} objecten gecentreerd op de pagina.',
      centred_one: '1 object gecentreerd op de pagina.',
      calibrated:
        'Gekalibreerd: de kaart had vakjes van {square} px; hij is nu ×{scale} geschaald naar vakjes van {cell} px en uitgelijnd met het raster.',
      calibratedPage: 'De pagina is nu {width} × {height} eenheden zodat de kaart past.',
      boxRemoved: 'Het kalibratiekader is verwijderd (Ongedaan maken haalt het terug).',
      undone: 'Ongedaan gemaakt: {what}.',
      undoMissing: '{count} objecten waren intussen verwijderd en konden niet worden teruggezet.',
      undoMissing_one: '1 object was intussen verwijderd en kon niet worden teruggezet.',
      notStored: 'Deze wijziging was te groot om in de geschiedenis te bewaren.',
      historyCleared: '{count} wijzigingen vergeten.',
      historyCleared_one: '1 wijziging vergeten.',
      settingChanged: '{key} is nu {value}.',
      settingsReset:
        'De instellingen staan weer op de standaardwaarden. De geschiedenis is bewaard.',
      handoutsRebuilt: 'De handouts Help en Command Deck zijn opnieuw gemaakt.',
    },
    errors: {
      unexpected: 'Er ging iets mis: {message}',
      unknownCommand: 'Onbekend commando "{command}". Typ {help} voor de commando’s.',
      noSelection: 'Selecteer eerst iets (of geef --ids op).',
      unknownIds: 'Geen objecten met deze ID’s: {ids}',
      noGraphics:
        'Geen van de geselecteerde objecten kan zo worden gewijzigd. Selecteer tokens of een kaart.',
      badSize: 'Geef een breedte en hoogte groter dan 0, bijvoorbeeld size 140 140 px.',
      badCreatureSize: 'Onbekende grootte. Gebruik tiny, small, medium, large, huge of gargantuan.',
      badPageSize: 'Geef een paginabreedte en -hoogte van 1 tot {max} eenheden.',
      badFactor: 'Geef een zoomfactor van {min} tot {max}.',
      badFactorText:
        'Kon "{text}" niet lezen als zoomfactor. Probeer 2, 0.5, 150%, 1/2 of "to 140".',
      factorOne: 'Een zoom van 1 verandert niets.',
      pageTooBig: '{page} zou kleiner worden dan 1 eenheid of groter dan {max} eenheden.',
      noPage: 'De pagina is niet gevonden.',
      noPages:
        'Geen pagina’s om te wijzigen. Vink er een paar aan in de paginakiezer, of geef --pages op.',
      unknownPages: 'Geen pagina’s met de naam: {pages}',
      noMap: 'Selecteer ook de kaartafbeelding.',
      noBox:
        'Selecteer naast de kaart een rechthoek die over een paar vakjes van de kaart is getekend, of gebruik calibrate --cell <px>.',
      boxUnreadable: 'Kon het formaat van de geselecteerde tekening niet lezen.',
      boxTooSmall: 'Het kalibratiekader is te klein. Teken het over een of meer hele vakjes.',
      badCount: 'Geef het aantal vakjes in de breedte (en hoogte) van het kader, zoals 3 of 3 2.',
      badSquarePx: 'Geef de vakgrootte van de kaart in pixels, 2 of meer.',
      mapRotated:
        'Draai de kaart recht ten opzichte van de pagina (0°, 90°, 180° of 270°) voor het kalibreren.',
      nothingToUndo: 'Niets om ongedaan te maken.',
      badSetting: 'Onbekende instelling "{key}". Instellingen: {settings}',
      badValue: '"{value}" is geen waarde die {key} accepteert.',
    },
    help: {
      menu: 'Opent het menu; met geselecteerde objecten toont het hun formaat.',
      size: 'Wijzigt het formaat van de geselecteerde afbeeldingen (standaard in pixels).',
      creature: 'Zet de geselecteerde tokens op een wezensgrootte, in rastervakjes.',
      fit: 'Maakt de geselecteerde afbeeldingen passend op de pagina; --keep-ratio behoudt hun vorm.',
      center: 'Centreert de geselecteerde afbeeldingen of tekst op de pagina.',
      calibrate:
        'Schaalt de geselecteerde kaart zodat de vakjes in het geselecteerde kader passen op het paginaraster, en lijnt ze uit.',
      calibrateCell: 'Schaalt de geselecteerde kaart aan de hand van de vakgrootte in pixels.',
      page: 'Toont het paginaformaat, of wijzigt het formaat van de pagina (niet wat erop staat).',
      zoom: 'Zoomt pagina’s met alles erop; de afstand per vakje blijft gelijk.',
      pages: 'Opent de paginakiezer, of vinkt pagina’s aan, om er meerdere tegelijk te zoomen.',
      undo: 'Maakt de nieuwste wijziging ongedaan (de laatste 10 worden bewaard).',
      history: 'Toont de wijzigingen die ongedaan kunnen worden; clear vergeet ze.',
      settings: 'Toont of wijzigt de instellingen.',
      reset: 'Zet de instellingen terug op de standaardwaarden.',
      journal: 'Maakt de handouts Help en Command Deck opnieuw.',
      help: 'Toont deze lijst.',
    },
    deck: {
      menuTitle: 'Menu',
      menuDesc: 'Het hoofdmenu toont de selectie, de pagina en wat je ongedaan kunt maken.',
      selectedTitle: 'Geselecteerde tokens en afbeeldingen',
      selectedDesc: 'Eerst selecteren, dan op een knop drukken.',
      mapTitle: 'Kaart',
      mapDesc: 'Selecteer de kaart en een kader dat over een paar van haar vakjes is getekend.',
      pageTitle: 'Pagina',
      pageDesc: 'Zoom de pagina waarop je bent, met alles erop.',
      historyTitle: 'Geschiedenis',
      historyDesc: 'Ongedaan maken draait de nieuwste wijziging terug.',
      footer: 'De volledige uitleg staat in de handout {help}.',
    },
    handout: {
      versionLabel: 'Versie',
      subtitle: 'Formaat van tokens, kaarten en hele pagina’s wijzigen',
      footer: 'Knoppen voor elke actie staan in de handout {deck}.',
      overview: {
        heading: 'Overzicht',
        body: 'Resizer wijzigt het formaat van geselecteerde tokens en kaarten, wijzigt het formaat van pagina’s en zoomt een hele pagina met alles erop: kaart, tokens, tekeningen, tekst, muren, deuren en ramen. Het werkt met de editors Jumpgate en Legacy, behoudt de afstand per rastervakje, lijnt kaarten uit met het raster en kan de laatste 10 wijzigingen ongedaan maken.',
      },
      quickStart: {
        heading: 'Snel aan de slag',
        steps: [
          'Open de handout Resizer - Command Deck, of typ !resizer voor het menu.',
          'Om het formaat van tokens te wijzigen, selecteer ze en druk op Formaat wijzigen of Wezensgrootte.',
          'Om een pagina te zoomen, ga ernaartoe en druk op Pagina zoomen; 2 verdubbelt alles, 0.5 halveert het.',
          'Om een kaart passend op het raster te maken, teken je een rechthoek over een paar vakjes van de kaart, selecteer je die samen met de kaart en druk je op Kaart kalibreren.',
          'Toch van gedachten veranderd? Druk op Ongedaan maken.',
        ],
      },
      zoom: {
        heading: 'Pagina’s zoomen',
        intro:
          'Zoomen schaalt een pagina met alles erop vanuit de linkerbovenhoek. Rastervakjes worden groter of kleiner, maar elk vakje staat nog steeds voor dezelfde afstand (5 ft blijft 5 ft), dus linialen, aura’s, tokenlicht en zicht meten hetzelfde.',
        points: [
          'Verplaatst en schaalt tokens, kaartafbeeldingen, Jumpgate- en Legacy-tekeningen, tekst, muren van dynamische belichting, deuren, ramen en de rasterverschuiving.',
          'De factor kan 2, 0.5, 150%, 1/2 zijn, of "to 140" voor vakjes van 140 px.',
          'Tokenformaat behouden (instelling of --keep-tokens) verplaatst tokens met de kaart maar laat hun formaat ongemoeid.',
          'De lijndikte van tekeningen schaalt mee met de pagina, tenzij de instelling uit staat; muren houden hun dikte.',
          'Legacy-tekeningen worden opnieuw getekend op het nieuwe formaat (Jumpgate tekent een Legacy-tekening die door een Mod is gewijzigd niet opnieuw), dus ze krijgen nieuwe ID’s.',
        ],
      },
      calibrate: {
        heading: 'Een kaart passend op het raster maken',
        intro:
          'Veel kaarten hebben hun eigen raster op hun eigen formaat. Kalibreren schaalt de kaart zodat haar vakjes overeenkomen met de vakjes van de pagina en verschuift haar zodat de lijnen samenvallen.',
        steps: [
          'Leg de kaart op de pagina en teken een rechthoek (met elk tekengereedschap) over een paar vakjes van de kaart, van lijn tot lijn.',
          'Selecteer de kaart en de rechthoek samen (Shift-klik).',
          'Druk op Kaart kalibreren en geef aan hoeveel vakjes het kader in de breedte en hoogte beslaat.',
          'De kaart wordt geschaald en verschoven zodat die vakjes precies op het paginaraster passen; het kader wordt verwijderd.',
        ],
        points: [
          'Kalibreren en pagina passend maken verplaatst de kaart ook naar de hoek van de pagina en past het paginaformaat aan de kaart aan.',
          'Kalibreren op pixels slaat het kader over: geef de huidige vakgrootte van de kaart in pixels.',
          'Een groter kader (meer vakjes) geeft een nauwkeuriger resultaat.',
        ],
      },
      sizes: {
        heading: 'Wezensgroottes',
        intro: 'Grootte zet tokens op een wezensgrootte in de rastervakjes van hun pagina.',
        colSize: 'Grootte',
        colCommand: 'Commando',
        colCells: 'Vakjes',
        cells: '{cells} × {cells}',
      },
      pages: {
        heading: 'Meerdere pagina’s tegelijk',
        points: [
          'Pagina’s kiezen opent een lijst van alle pagina’s; vink de gewenste aan en druk op Aangevinkte pagina’s zoomen.',
          'Getypt: zoom 2 --pages all, --pages picked, --pages current, of namen en ID’s gescheiden door komma’s (--pages Town, Docks).',
          'Eén keer ongedaan maken draait de hele reeks terug.',
        ],
      },
      undo: {
        heading: 'Ongedaan maken',
        points: [
          'Elke wijziging (formaat, passend maken, centreren, kalibreren, paginaformaat, zoom) kan ongedaan worden gemaakt.',
          'De laatste 10 wijzigingen worden bij het spel bewaard, dus ze overleven een herstart van de Mod-sandbox.',
          'Objecten die sinds de wijziging zijn verwijderd, worden gemeld en overgeslagen.',
          'Heel grote wijzigingen (duizenden objecten) kunnen te groot zijn om te bewaren; Resizer meldt dat.',
        ],
      },
      commands: {
        heading: 'Commando’s',
        intro: 'Typ {command} met een van deze. !resizer en !rsz werken ook altijd.',
        colCommand: 'Commando',
        colDesc: 'Wat het doet',
      },
      settings: {
        heading: 'Instellingen',
        intro: 'Wijzig ze via het Instellingen-paneel of met set <setting> <value>.',
        colKey: 'Instelling',
        colDesc: 'Wat het doet',
        rows: {
          language: 'Taal voor menu’s, berichten en handouts.',
          command: 'Een extra naam voor het commando (in 0.0.9 kon je het hernoemen).',
          keepTokenSize: 'Zoomen verplaatst tokens maar behoudt hun formaat.',
          scaleStrokes: 'Zoomen schaalt de lijndikte van tekeningen (muren houden die van hen).',
          deleteCalibrationBox: 'Kalibreren verwijdert het kader dat het heeft gemeten.',
        },
      },
      api: {
        heading: 'Voor Mod-makers',
        intro: 'Andere Mods kunnen het globale object Resizer gebruiken.',
        colFunction: 'Functie',
        colDesc: 'Wat het doet',
        rows: {
          zoomPage:
            'Zoomt een pagina met alles erop, met ongedaan maken. options.keepTokens behoudt het tokenformaat.',
          undo: 'Maakt de nieuwste wijziging ongedaan.',
          onZoom:
            'Roept je functie aan na elke zoom (en met 1/factor na het ongedaan maken ervan), zodat een Mod die paginaposities bewaart kan meebewegen.',
          history: 'Toont de wijzigingen die ongedaan kunnen worden gemaakt.',
        },
      },
      upgrading: {
        heading: 'Overstappen vanaf 0.0.9',
        points: [
          'Vervang het oude script door dit script; je hernoemde commando blijft behouden.',
          'De oude commando’s werken nog en doen wat de nieuwe hieronder doen.',
          'scale verandert de afstand per vakje niet meer (een vakje van 5 ft blijft 5 ft).',
        ],
        colOld: '0.0.9',
        colNew: '1.0',
      },
      troubleshooting: {
        heading: 'Problemen oplossen',
        points: [
          'Andere Mods die posities op een pagina onthouden (patrouilleroutes, thuisposities van tokens, opgeslagen gebieden) horen niets van een zoom, tenzij ze Resizer.onZoom gebruiken; controleer ze na het zoomen.',
          'Hexpagina’s zoomen net als vierkante, maar controleer of de tokens nog in hun hexen staan.',
          'Als een tekening direct na een zoom verkeerd lijkt te staan, herlaad dan de pagina: Roll20 tekent soms te laat opnieuw.',
          'Kalibreren vereist een kaart die recht op de pagina staat; draai hem eerst naar 0°, 90°, 180° of 270°.',
        ],
      },
      languages: {
        heading: 'Talen',
        body: 'Kies een taal in het Instellingen-paneel, met set language <code>, of in de Mod-instellingen.',
        colLanguage: 'Taal',
        colNative: 'Eigen naam',
        colCode: 'Code',
      },
      credits: {
        heading: 'Met dank aan',
        original: 'Oorspronkelijke Mod door',
        maintainer: 'Herschreven en onderhouden door',
        thread: 'Forumdraad',
        support:
          'Een probleem gevonden of een idee? Reageer in de forumdraad of open een issue op GitHub.',
      },
    },
  };

  var localeEnUS = {
    titles: {
      ready: 'Resizer is ready.',
      history: 'Resizer History',
      pages: 'Resizer Pages',
      settings: 'Resizer Settings',
      help: 'Resizer Help',
    },
    menu: {
      selected: 'Selected',
      nothingSelected: 'Nothing selected. Select tokens, a map or drawings first.',
      graphicSize: '{name}: {width} × {height} px ({across} × {down} cells)',
      andMore: '…and {count} more.',
      map: 'Map',
      mapHint:
        "Draw a rectangle over some of the map's own squares, select it and the map, then calibrate.",
      page: 'Page',
      pageSize: '{across} × {down} cells, {cell} px a cell, {scale} {units} a cell',
      pageCells: '{across} × {down} cells',
      historyEmpty: 'Nothing to undo yet.',
      historyHint: 'Undo takes back the newest change first.',
      minutesAgo: '{minutes} min ago',
      pickerHint: 'Tick the pages to zoom together, then press Zoom ticked pages.',
      on: 'On',
      off: 'Off',
      handouts: 'Full help in the handouts:',
    },
    kinds: {
      graphic: 'Graphic',
      text: 'Text',
      pathv2: 'Drawing',
      path: 'Drawing',
      door: 'Door',
      window: 'Window',
    },
    sizes: {
      tiny: 'Tiny',
      small: 'Small',
      medium: 'Medium',
      large: 'Large',
      huge: 'Huge',
      gargantuan: 'Gargantuan',
    },
    units: {
      px: 'px',
      cells: 'cells',
      units: 'page units',
    },
    buttons: {
      menu: 'Menu',
      resize: 'Resize',
      creatureSize: 'Creature size',
      fit: 'Fit to page',
      centre: 'Centre',
      sizes: 'Show sizes',
      calibrate: 'Calibrate map',
      calibrateFit: 'Calibrate and fit page',
      calibratePx: 'Calibrate by pixels',
      zoom: 'Zoom page',
      zoomIn: 'Zoom ×2',
      zoomOut: 'Zoom ×½',
      resizePage: 'Resize page',
      pageSize: 'Page size',
      pages: 'Pick pages',
      zoomPicked: 'Zoom ticked pages ({count})',
      pickAll: 'Tick all',
      pickNone: 'Tick none',
      undo: 'Undo',
      undoWhat: 'Undo: {what}',
      history: 'History',
      clearHistory: 'Clear history',
      settings: 'Settings',
      help: 'Help',
      resetSettings: 'Reset settings',
      rebuild: 'Rebuild handouts',
    },
    queries: {
      width: 'Width',
      height: 'Height',
      unit: 'Unit',
      unitPx: 'Pixels',
      unitCells: 'Grid cells',
      unitUnits: 'Page units (70 px)',
      creatureSize: 'Creature size',
      keepShape: 'Keep the shape?',
      yes: 'Yes',
      no: 'No - stretch to the page',
      centre: 'Centre',
      both: 'Both ways',
      across: 'Squares across the box',
      down: 'Down only',
      downCount: 'Squares down the box',
      squarePx: 'Pixels per square on the map now',
      factor: 'Zoom factor (2 = twice as big; 0.5 = half)',
      tokens: 'Tokens',
      tokensScale: 'Scale with the page',
      tokensKeep: 'Keep their size',
      language: 'Language',
      command: 'Command name without !',
    },
    settings: {
      language: 'Language',
      command: 'Command',
      keepTokenSize: 'Keep token size when zooming',
      scaleStrokes: 'Scale drawing line widths',
      deleteCalibrationBox: 'Delete the calibration box',
    },
    history: {
      change: 'Change',
      zoom: 'Zoom ×{factor} on {page}',
      zoomPages: 'Zoom ×{factor} on {count} pages',
      size: 'Resize {count} graphics',
      size_one: 'Resize 1 graphic',
      page: 'Page {page} to {width} × {height} units',
      fit: 'Fit {count} graphics to the page',
      fit_one: 'Fit 1 graphic to the page',
      centre: 'Centre {count} objects',
      centre_one: 'Centre 1 object',
      calibrate: 'Calibrate map {name}',
      calibrateUnnamed: 'Calibrate the map',
    },
    messages: {
      welcome: 'Select something and open the menu to resize it, or zoom a whole page.',
      upgraded:
        'Upgraded from Resizer 0.0.9. Your command {command} and the old commands still work.',
      readyHint: 'Type {command} for the menu, or open the Resizer - Command Deck handout.',
      zoomed: 'Zoomed {page} ×{factor}: {objects} objects moved with it.',
      zoomedPages: 'Zoomed {count} pages ×{factor} ({page}): {objects} objects moved with them.',
      skipped: '{count} objects could not be read and were left alone.',
      skipped_one: '1 object could not be read and was left alone.',
      resized: 'Resized {count} graphics to {width} × {height} {unit}.',
      resized_one: 'Resized 1 graphic to {width} × {height} {unit}.',
      sized: 'Resized {count} graphics to {size}.',
      sized_one: 'Resized 1 graphic to {size}.',
      pageResized: '{page} is now {size}.',
      fitted: 'Fitted {count} graphics to the page.',
      fitted_one: 'Fitted 1 graphic to the page.',
      centred: 'Centred {count} objects on the page.',
      centred_one: 'Centred 1 object on the page.',
      calibrated:
        'Calibrated: the map had {square} px squares; it is now scaled ×{scale} to {cell} px cells and lined up with the grid.',
      calibratedPage: 'The page is now {width} × {height} units to fit the map.',
      boxRemoved: 'The calibration box was deleted (Undo brings it back).',
      undone: 'Undone: {what}.',
      undoMissing: '{count} objects had been deleted since, so they could not be put back.',
      undoMissing_one: '1 object had been deleted since, so it could not be put back.',
      notStored: 'This change was too big to keep in the undo history.',
      historyCleared: 'Forgot {count} changes.',
      historyCleared_one: 'Forgot 1 change.',
      settingChanged: '{key} is now {value}.',
      settingsReset: 'Settings are back to their defaults. The undo history was kept.',
      handoutsRebuilt: 'The Help and Command Deck handouts were rebuilt.',
    },
    errors: {
      unexpected: 'Something went wrong: {message}',
      unknownCommand: 'Unknown command "{command}". Type {help} for the commands.',
      noSelection: 'Select something first (or give --ids).',
      unknownIds: 'No objects with these IDs: {ids}',
      noGraphics: 'None of the selected objects can be changed this way. Select tokens or a map.',
      badSize: 'Give a width and a height above 0, for example size 140 140 px.',
      badCreatureSize: 'Unknown size. Use tiny, small, medium, large, huge or gargantuan.',
      badPageSize: 'Give a page width and height from 1 to {max} units.',
      badFactor: 'Give a zoom factor from {min} to {max}.',
      badFactorText: 'Could not read "{text}" as a zoom factor. Try 2, 0.5, 150%, 1/2 or "to 140".',
      factorOne: 'A zoom of 1 changes nothing.',
      pageTooBig: '{page} would be smaller than 1 unit or bigger than {max} units.',
      noPage: 'Could not find the page.',
      noPages: 'No pages to change. Tick some in the page picker, or give --pages.',
      unknownPages: 'No pages called: {pages}',
      noMap: 'Select the map graphic too.',
      noBox:
        "Select a rectangle drawn over some of the map's squares as well as the map, or use calibrate --cell <px>.",
      boxUnreadable: 'Could not read the size of the selected drawing.',
      boxTooSmall: 'The calibration box is too small. Draw it over one or more whole squares.',
      badCount: 'Give the number of squares across (and down) the box, such as 3 or 3 2.',
      badSquarePx: 'Give the map’s square size in pixels, 2 or more.',
      mapRotated: 'Turn the map square to the page (0°, 90°, 180° or 270°) before calibrating.',
      nothingToUndo: 'Nothing to undo.',
      badSetting: 'Unknown setting "{key}". Settings: {settings}',
      badValue: '"{value}" is not a value {key} accepts.',
    },
    help: {
      menu: 'Open the menu; with objects selected it shows their sizes.',
      size: 'Resize the selected graphics (pixels by default).',
      creature: 'Resize the selected tokens to a creature size, in grid cells.',
      fit: 'Fit the selected graphics to the page; --keep-ratio keeps their shape.',
      center: 'Centre the selected graphics or text on the page.',
      calibrate:
        'Scale the selected map so the squares inside the selected box match the page grid, then line them up.',
      calibrateCell: 'Scale the selected map from its square size in pixels.',
      page: 'Show the page size, or resize the page (not what is on it).',
      zoom: 'Zoom pages with everything on them; distance per cell is kept.',
      pages: 'Open the page picker, or tick pages, to zoom several pages at once.',
      undo: 'Undo the newest change (the last 10 are kept).',
      history: 'List the changes you can undo; clear forgets them.',
      settings: 'Show or change the settings.',
      reset: 'Put the settings back to their defaults.',
      journal: 'Rebuild the Help and Command Deck handouts.',
      help: 'Show this list.',
    },
    deck: {
      menuTitle: 'Menu',
      menuDesc: 'The main menu shows the selection, the page and what you can undo.',
      selectedTitle: 'Selected tokens and graphics',
      selectedDesc: 'Select first, then press a button.',
      mapTitle: 'Map',
      mapDesc: 'Select the map and a box drawn over some of its squares.',
      pageTitle: 'Page',
      pageDesc: 'Zoom the page you are on with everything on it.',
      historyTitle: 'History',
      historyDesc: 'Undo takes back the newest change.',
      footer: 'Full instructions are in the {help} handout.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Resize tokens, maps and whole pages',
      footer: 'Buttons for every action are in the {deck} handout.',
      overview: {
        heading: 'Overview',
        body: 'Resizer resizes selected tokens and maps, resizes pages, and zooms a whole page with everything on it: map, tokens, drawings, text, walls, doors and windows. It works with the Jumpgate and Legacy editors, keeps the distance per grid cell, lines maps up with the grid, and can undo its last 10 changes.',
      },
      quickStart: {
        heading: 'Quick start',
        steps: [
          'Open the Resizer - Command Deck handout, or type !resizer for the menu.',
          'To resize tokens, select them and press Resize or Creature size.',
          'To zoom a page, go to it and press Zoom page; 2 doubles everything, 0.5 halves it.',
          "To fit a map to the grid, draw a rectangle over a few of the map's squares, select it and the map, and press Calibrate map.",
          'Changed your mind? Press Undo.',
        ],
      },
      zoom: {
        heading: 'Zooming pages',
        intro:
          'Zoom scales a page and everything on it about its top-left corner. Grid cells get bigger or smaller, but each cell still stands for the same distance (5 ft stays 5 ft), so rulers, auras, token lights and vision still measure the same.',
        points: [
          'Moves and scales tokens, map graphics, Jumpgate and Legacy drawings, text, dynamic lighting walls, doors and windows, and the grid offset.',
          'Factors can be 2, 0.5, 150%, 1/2, or "to 140" for 140 px cells.',
          'Keep token size (setting or --keep-tokens) moves tokens with the map but leaves their size alone.',
          'Line widths of drawings scale with the page unless the setting is off; walls keep their width.',
          'Legacy drawings are drawn again at the new size (Jumpgate does not redraw a Legacy drawing a Mod changes), so they get new IDs.',
        ],
      },
      calibrate: {
        heading: 'Fitting a map to the grid',
        intro:
          "Many maps are drawn with their own grid at their own size. Calibrate scales the map so its squares match the page's cells and moves it so the lines meet.",
        steps: [
          "Put the map on the page and draw a rectangle (any drawing tool) over a few of the map's squares, from line to line.",
          'Select the map and the rectangle together (Shift-click).',
          'Press Calibrate map and answer how many squares the box covers across and down.',
          'The map is scaled and moved so those squares fit the page grid exactly; the box is deleted.',
        ],
        points: [
          'Calibrate and fit page also moves the map to the page corner and resizes the page to fit it.',
          "Calibrate by pixels skips the box: give the map's square size in pixels as it is drawn now.",
          'A bigger box (more squares) gives a more exact fit.',
        ],
      },
      sizes: {
        heading: 'Creature sizes',
        intro: "Size sets tokens to a creature size in their page's grid cells.",
        colSize: 'Size',
        colCommand: 'Command',
        colCells: 'Cells',
        cells: '{cells} × {cells}',
      },
      pages: {
        heading: 'Several pages at once',
        points: [
          'Pick pages opens a list of every page; tick the ones you want and press Zoom ticked pages.',
          'Typed: zoom 2 --pages all, --pages picked, --pages current, or names and IDs separated by commas (--pages Town, Docks).',
          'One undo takes back the whole batch.',
        ],
      },
      undo: {
        heading: 'Undo',
        points: [
          'Every change (resize, fit, centre, calibrate, page size, zoom) can be undone.',
          'The last 10 changes are kept with the game, so they survive a Mod sandbox restart.',
          'Objects deleted since the change are reported and skipped.',
          'Very big changes (thousands of objects) may be too big to keep; Resizer says so.',
        ],
      },
      commands: {
        heading: 'Commands',
        intro: 'Type {command} with one of these. !resizer and !rsz always work too.',
        colCommand: 'Command',
        colDesc: 'What it does',
      },
      settings: {
        heading: 'Settings',
        intro: 'Change these from the Settings card or with set <setting> <value>.',
        colKey: 'Setting',
        colDesc: 'What it does',
        rows: {
          language: 'Language for menus, messages and handouts.',
          command: 'An extra name for the command (0.0.9 let you rename it).',
          keepTokenSize: 'Zoom moves tokens but keeps their size.',
          scaleStrokes: 'Zoom scales the line width of drawings (walls keep theirs).',
          deleteCalibrationBox: 'Calibrate deletes the box it measured.',
        },
      },
      api: {
        heading: 'For Mod authors',
        intro: 'Other Mods can use the global Resizer object.',
        colFunction: 'Function',
        colDesc: 'What it does',
        rows: {
          zoomPage:
            'Zooms a page with everything on it, with undo. options.keepTokens keeps token sizes.',
          undo: 'Undoes the newest change.',
          onZoom:
            'Calls your function after every zoom (and with 1/factor after undoing one), so a Mod that stores page positions can follow.',
          history: 'Lists the changes that can be undone.',
        },
      },
      upgrading: {
        heading: 'Upgrading from 0.0.9',
        points: [
          'Replace the old script with this one; your renamed command is kept.',
          'The old commands still work and do what the new ones below do.',
          'scale no longer changes the distance per cell (a 5 ft cell stays 5 ft).',
        ],
        colOld: '0.0.9',
        colNew: '1.0',
      },
      troubleshooting: {
        heading: 'Troubleshooting',
        points: [
          'Other Mods that remember positions on a page (patrol routes, token homes, saved areas) are not told about a zoom unless they use Resizer.onZoom; check them after zooming.',
          'Hex pages zoom like square ones, but check that tokens still sit in their hexes.',
          'If a drawing looks out of place straight after a zoom, reload the page: Roll20 sometimes redraws late.',
          'Calibrate needs the map square to the page; turn it to 0°, 90°, 180° or 270° first.',
        ],
      },
      languages: {
        heading: 'Languages',
        body: 'Choose a language in the Settings card, with set language <code>, or in the Mod settings.',
        colLanguage: 'Language',
        colNative: 'Native name',
        colCode: 'Code',
      },
      credits: {
        heading: 'Credits',
        original: 'Original Mod by',
        maintainer: 'Rewritten and maintained by',
        thread: 'Forum thread',
        support:
          'Found a problem or have an idea? Post on the forum thread or open an issue on GitHub.',
      },
    },
  };

  var localeFi = {
    titles: {
      ready: 'Resizer on valmis.',
      history: 'Resizer – historia',
      pages: 'Resizer – sivut',
      settings: 'Resizer – asetukset',
      help: 'Resizer – ohje',
    },
    menu: {
      selected: 'Valittuna',
      nothingSelected: 'Mitään ei ole valittu. Valitse ensin poletteja, kartta tai piirroksia.',
      graphicSize: '{name}: {width} × {height} px ({across} × {down} ruutua)',
      andMore: '…ja {count} muuta.',
      map: 'Kartta',
      mapHint:
        'Piirrä suorakulmio muutaman kartan oman ruudun päälle, valitse se ja kartta ja kalibroi sitten.',
      page: 'Sivu',
      pageSize: '{across} × {down} ruutua, {cell} px ruutua kohden, {scale} {units} ruutua kohden',
      pageCells: '{across} × {down} ruutua',
      historyEmpty: 'Ei vielä mitään kumottavaa.',
      historyHint: 'Kumoa peruu ensin uusimman muutoksen.',
      minutesAgo: '{minutes} min sitten',
      pickerHint: 'Rastita yhdessä zoomattavat sivut ja paina Zoomaa rastitetut sivut.',
      on: 'Päällä',
      off: 'Pois',
      handouts: 'Täydet ohjeet monisteissa:',
    },
    kinds: {
      graphic: 'Grafiikka',
      text: 'Teksti',
      pathv2: 'Piirros',
      path: 'Piirros',
      door: 'Ovi',
      window: 'Ikkuna',
    },
    sizes: {
      tiny: 'Hyvin pieni',
      small: 'Pieni',
      medium: 'Keskikokoinen',
      large: 'Suuri',
      huge: 'Valtava',
      gargantuan: 'Jättimäinen',
    },
    units: {
      px: 'px',
      cells: 'ruutua',
      units: 'sivuyksikköä',
    },
    buttons: {
      menu: 'Valikko',
      resize: 'Muuta kokoa',
      creatureSize: 'Olennon koko',
      fit: 'Sovita sivuun',
      centre: 'Keskitä',
      sizes: 'Näytä koot',
      calibrate: 'Kalibroi kartta',
      calibrateFit: 'Kalibroi ja sovita sivu',
      calibratePx: 'Kalibroi pikseleillä',
      zoom: 'Zoomaa sivu',
      zoomIn: 'Zoomaa ×2',
      zoomOut: 'Zoomaa ×½',
      resizePage: 'Muuta sivun kokoa',
      pageSize: 'Sivun koko',
      pages: 'Valitse sivut',
      zoomPicked: 'Zoomaa rastitetut sivut ({count})',
      pickAll: 'Rastita kaikki',
      pickNone: 'Poista rastit',
      undo: 'Kumoa',
      undoWhat: 'Kumoa: {what}',
      history: 'Historia',
      clearHistory: 'Tyhjennä historia',
      settings: 'Asetukset',
      help: 'Ohje',
      resetSettings: 'Palauta asetukset',
      rebuild: 'Luo monisteet uudelleen',
    },
    queries: {
      width: 'Leveys',
      height: 'Korkeus',
      unit: 'Yksikkö',
      unitPx: 'Pikselit',
      unitCells: 'Ruudukon ruudut',
      unitUnits: 'Sivuyksiköt (70 px)',
      creatureSize: 'Olennon koko',
      keepShape: 'Säilytetäänkö muoto?',
      yes: 'Kyllä',
      no: 'Ei - venytä sivun kokoiseksi',
      centre: 'Keskitä',
      both: 'Molempiin suuntiin',
      across: 'Ruutuja laatikon leveydellä',
      down: 'Vain pystysuunnassa',
      downCount: 'Ruutuja laatikon korkeudella',
      squarePx: 'Pikseleitä ruutua kohden kartalla nyt',
      factor: 'Zoomauskerroin (2 = kaksi kertaa isompi; 0.5 = puolet)',
      tokens: 'Poletit',
      tokensScale: 'Skaalaa sivun mukana',
      tokensKeep: 'Säilytä niiden koko',
      language: 'Kieli',
      command: 'Komennon nimi ilman !-merkkiä',
    },
    settings: {
      language: 'Kieli',
      command: 'Komento',
      keepTokenSize: 'Säilytä polettien koko zoomatessa',
      scaleStrokes: 'Skaalaa piirrosten viivanleveydet',
      deleteCalibrationBox: 'Poista kalibrointilaatikko',
    },
    history: {
      change: 'Muutos',
      zoom: 'Zoomaus ×{factor} sivulla {page}',
      zoomPages: 'Zoomaus ×{factor} {count} sivulla',
      size: 'Muuta {count} grafiikan kokoa',
      size_one: 'Muuta 1 grafiikan kokoa',
      page: 'Sivu {page} kokoon {width} × {height} yksikköä',
      fit: 'Sovita {count} grafiikkaa sivuun',
      fit_one: 'Sovita 1 grafiikka sivuun',
      centre: 'Keskitä {count} objektia',
      centre_one: 'Keskitä 1 objekti',
      calibrate: 'Kalibroi kartta {name}',
      calibrateUnnamed: 'Kalibroi kartta',
    },
    messages: {
      welcome: 'Valitse jotain ja avaa valikko muuttaaksesi sen kokoa, tai zoomaa koko sivu.',
      upgraded:
        'Päivitetty versiosta Resizer 0.0.9. Komentosi {command} ja vanhat komennot toimivat yhä.',
      readyHint: 'Kirjoita {command} avataksesi valikon, tai avaa Resizer - Command Deck -moniste.',
      zoomed: 'Sivu {page} zoomattu ×{factor}: {objects} objektia siirtyi mukana.',
      zoomedPages: '{count} sivua zoomattu ×{factor} ({page}): {objects} objektia siirtyi mukana.',
      skipped: '{count} objektia ei voitu lukea, joten ne jätettiin ennalleen.',
      skipped_one: 'Yhtä objektia ei voitu lukea, joten se jätettiin ennalleen.',
      resized: '{count} grafiikan koko muutettu: {width} × {height} {unit}.',
      resized_one: 'Yhden grafiikan koko muutettu: {width} × {height} {unit}.',
      sized: '{count} grafiikan koko muutettu: {size}.',
      sized_one: 'Yhden grafiikan koko muutettu: {size}.',
      pageResized: 'Sivun {page} koko on nyt {size}.',
      fitted: '{count} grafiikkaa sovitettu sivuun.',
      fitted_one: '1 grafiikka sovitettu sivuun.',
      centred: '{count} objektia keskitetty sivulle.',
      centred_one: '1 objekti keskitetty sivulle.',
      calibrated:
        'Kalibroitu: kartan ruudut olivat {square} px; se on nyt skaalattu ×{scale} {cell} px:n ruutuihin ja kohdistettu ruudukkoon.',
      calibratedPage: 'Sivu on nyt {width} × {height} yksikköä, jotta kartta mahtuu siihen.',
      boxRemoved: 'Kalibrointilaatikko poistettiin (Kumoa tuo sen takaisin).',
      undone: 'Kumottu: {what}.',
      undoMissing: '{count} objektia oli poistettu sen jälkeen, joten niitä ei voitu palauttaa.',
      undoMissing_one: '1 objekti oli poistettu sen jälkeen, joten sitä ei voitu palauttaa.',
      notStored: 'Tämä muutos oli liian suuri säilytettäväksi kumoamishistoriassa.',
      historyCleared: 'Unohdettiin {count} muutosta.',
      historyCleared_one: 'Unohdettiin 1 muutos.',
      settingChanged: '{key} on nyt {value}.',
      settingsReset: 'Asetukset on palautettu oletuksiin. Kumoamishistoria säilytettiin.',
      handoutsRebuilt: 'Help- ja Command Deck -monisteet luotiin uudelleen.',
    },
    errors: {
      unexpected: 'Jokin meni vikaan: {message}',
      unknownCommand: 'Tuntematon komento "{command}". Kirjoita {help} nähdäksesi komennot.',
      noSelection: 'Valitse ensin jotain (tai anna --ids).',
      unknownIds: 'Ei objekteja näillä tunnuksilla: {ids}',
      noGraphics:
        'Mitään valituista objekteista ei voi muuttaa näin. Valitse poletteja tai kartta.',
      badSize: 'Anna leveys ja korkeus, jotka ovat yli 0, esimerkiksi size 140 140 px.',
      badCreatureSize: 'Tuntematon koko. Käytä tiny, small, medium, large, huge tai gargantuan.',
      badPageSize: 'Anna sivun leveys ja korkeus väliltä 1–{max} yksikköä.',
      badFactor: 'Anna zoomauskerroin väliltä {min}–{max}.',
      badFactorText:
        'Arvoa "{text}" ei voitu lukea zoomauskertoimeksi. Kokeile 2, 0.5, 150%, 1/2 tai "to 140".',
      factorOne: 'Zoomaus 1 ei muuta mitään.',
      pageTooBig: 'Sivu {page} olisi pienempi kuin 1 yksikkö tai suurempi kuin {max} yksikköä.',
      noPage: 'Sivua ei löytynyt.',
      noPages: 'Ei muutettavia sivuja. Rastita joitain sivunvalitsimessa tai anna --pages.',
      unknownPages: 'Ei tämännimisiä sivuja: {pages}',
      noMap: 'Valitse myös karttagrafiikka.',
      noBox:
        'Valitse kartan lisäksi suorakulmio, joka on piirretty muutaman kartan ruudun päälle, tai käytä calibrate --cell <px>.',
      boxUnreadable: 'Valitun piirroksen kokoa ei voitu lukea.',
      boxTooSmall:
        'Kalibrointilaatikko on liian pieni. Piirrä se yhden tai useamman kokonaisen ruudun päälle.',
      badCount: 'Anna ruutujen määrä laatikon leveydellä (ja korkeudella), esimerkiksi 3 tai 3 2.',
      badSquarePx: 'Anna kartan ruudun koko pikseleinä, vähintään 2.',
      mapRotated:
        'Käännä kartta suoraan sivuun nähden (0°, 90°, 180° tai 270°) ennen kalibrointia.',
      nothingToUndo: 'Ei mitään kumottavaa.',
      badSetting: 'Tuntematon asetus "{key}". Asetukset: {settings}',
      badValue: '"{value}" ei ole arvo, jonka {key} hyväksyy.',
    },
    help: {
      menu: 'Avaa valikko; kun objekteja on valittuna, se näyttää niiden koot.',
      size: 'Muuta valittujen grafiikoiden kokoa (oletuksena pikseleinä).',
      creature: 'Muuta valitut poletit olennon kokoon ruudukon ruutuina.',
      fit: 'Sovita valitut grafiikat sivuun; --keep-ratio säilyttää niiden muodon.',
      center: 'Keskitä valitut grafiikat tai teksti sivulle.',
      calibrate:
        'Skaalaa valittu kartta niin, että valitun laatikon sisällä olevat ruudut vastaavat sivun ruudukkoa, ja kohdista ne.',
      calibrateCell: 'Skaalaa valittu kartta sen ruutukoon perusteella pikseleinä.',
      page: 'Näytä sivun koko tai muuta sivun kokoa (ei sen sisältöä).',
      zoom: 'Zoomaa sivut kaikkineen; etäisyys ruutua kohden säilyy.',
      pages: 'Avaa sivunvalitsin tai rastita sivuja zoomataksesi useita sivuja kerralla.',
      undo: 'Kumoa uusin muutos (viimeiset 10 säilytetään).',
      history: 'Luettele kumottavissa olevat muutokset; clear unohtaa ne.',
      settings: 'Näytä tai muuta asetuksia.',
      reset: 'Palauta asetukset oletuksiin.',
      journal: 'Luo Help- ja Command Deck -monisteet uudelleen.',
      help: 'Näytä tämä luettelo.',
    },
    deck: {
      menuTitle: 'Valikko',
      menuDesc: 'Päävalikko näyttää valinnan, sivun ja sen, mitä voit kumota.',
      selectedTitle: 'Valitut poletit ja grafiikat',
      selectedDesc: 'Valitse ensin ja paina sitten painiketta.',
      mapTitle: 'Kartta',
      mapDesc: 'Valitse kartta ja laatikko, joka on piirretty muutaman sen ruudun päälle.',
      pageTitle: 'Sivu',
      pageDesc: 'Zoomaa sivu, jolla olet, kaikkineen.',
      historyTitle: 'Historia',
      historyDesc: 'Kumoa peruu uusimman muutoksen.',
      footer: 'Täydet ohjeet ovat monisteessa {help}.',
    },
    handout: {
      versionLabel: 'Versio',
      subtitle: 'Muuta polettien, karttojen ja kokonaisten sivujen kokoa',
      footer: 'Painikkeet jokaiselle toiminnolle ovat monisteessa {deck}.',
      overview: {
        heading: 'Yleiskatsaus',
        body: 'Resizer muuttaa valittujen polettien ja karttojen kokoa, muuttaa sivujen kokoa ja zoomaa kokonaisen sivun kaikkineen: kartan, poletit, piirrokset, tekstit, seinät, ovet ja ikkunat. Se toimii Jumpgate- ja Legacy-editoreissa, säilyttää etäisyyden ruudukon ruutua kohden, kohdistaa kartat ruudukkoon ja voi kumota 10 viimeisintä muutostaan.',
      },
      quickStart: {
        heading: 'Pika-aloitus',
        steps: [
          'Avaa Resizer - Command Deck -moniste tai kirjoita !resizer avataksesi valikon.',
          'Muuttaaksesi polettien kokoa valitse ne ja paina Muuta kokoa tai Olennon koko.',
          'Zoomataksesi sivun mene sille ja paina Zoomaa sivu; 2 tuplaa kaiken, 0.5 puolittaa sen.',
          'Sovittaaksesi kartan ruudukkoon piirrä suorakulmio muutaman kartan ruudun päälle, valitse se ja kartta ja paina Kalibroi kartta.',
          'Muutitko mielesi? Paina Kumoa.',
        ],
      },
      zoom: {
        heading: 'Sivujen zoomaus',
        intro:
          'Zoomaus skaalaa sivun ja kaiken sillä olevan sen vasemman yläkulman suhteen. Ruudukon ruudut suurenevat tai pienenevät, mutta jokainen ruutu vastaa yhä samaa etäisyyttä (5 ft pysyy 5 ft:nä), joten viivaimet, aurat, polettien valot ja näkö mittaavat yhä samoin.',
        points: [
          'Siirtää ja skaalaa poletit, karttagrafiikat, Jumpgate- ja Legacy-piirrokset, tekstit, dynaamisen valaistuksen seinät, ovet ja ikkunat sekä ruudukon siirtymän.',
          'Kerroin voi olla 2, 0.5, 150%, 1/2 tai "to 140" 140 px:n ruuduille.',
          'Säilytä polettien koko (asetus tai --keep-tokens) siirtää poletit kartan mukana mutta jättää niiden koon ennalleen.',
          'Piirrosten viivanleveydet skaalautuvat sivun mukana, ellei asetus ole pois päältä; seinät säilyttävät leveytensä.',
          'Legacy-piirrokset piirretään uudelleen uudessa koossa (Jumpgate ei piirrä uudelleen Legacy-piirrosta, jota Mod muuttaa), joten ne saavat uudet tunnukset.',
        ],
      },
      calibrate: {
        heading: 'Kartan sovittaminen ruudukkoon',
        intro:
          'Monet kartat on piirretty omalla ruudukollaan omassa koossaan. Kalibrointi skaalaa kartan niin, että sen ruudut vastaavat sivun ruutuja, ja siirtää sitä niin, että viivat kohtaavat.',
        steps: [
          'Aseta kartta sivulle ja piirrä suorakulmio (millä tahansa piirtotyökalulla) muutaman kartan ruudun päälle, viivasta viivaan.',
          'Valitse kartta ja suorakulmio yhdessä (Shift-napsautus).',
          'Paina Kalibroi kartta ja kerro, montako ruutua laatikko kattaa leveys- ja korkeussuunnassa.',
          'Kartta skaalataan ja siirretään niin, että nuo ruudut sopivat tarkasti sivun ruudukkoon; laatikko poistetaan.',
        ],
        points: [
          'Kalibroi ja sovita sivu myös siirtää kartan sivun kulmaan ja muuttaa sivun kokoa sen mukaan.',
          'Kalibroi pikseleillä ohittaa laatikon: anna kartan ruudun koko pikseleinä sellaisena kuin se nyt on piirretty.',
          'Isompi laatikko (enemmän ruutuja) antaa tarkemman sovituksen.',
        ],
      },
      sizes: {
        heading: 'Olentojen koot',
        intro: 'Koko asettaa poletit olennon kokoon niiden sivun ruudukon ruutuina.',
        colSize: 'Koko',
        colCommand: 'Komento',
        colCells: 'Ruudut',
        cells: '{cells} × {cells}',
      },
      pages: {
        heading: 'Useita sivuja kerralla',
        points: [
          'Valitse sivut avaa luettelon kaikista sivuista; rastita haluamasi ja paina Zoomaa rastitetut sivut.',
          'Kirjoitettuna: zoom 2 --pages all, --pages picked, --pages current tai pilkuilla erotetut nimet ja tunnukset (--pages Town, Docks).',
          'Yksi kumoaminen peruu koko erän.',
        ],
      },
      undo: {
        heading: 'Kumoaminen',
        points: [
          'Jokainen muutos (koon muutos, sovitus, keskitys, kalibrointi, sivun koko, zoomaus) voidaan kumota.',
          '10 viimeisintä muutosta tallennetaan peliin, joten ne säilyvät Mod-hiekkalaatikon uudelleenkäynnistyksen yli.',
          'Muutoksen jälkeen poistetut objektit ilmoitetaan ja ohitetaan.',
          'Hyvin suuret muutokset (tuhansia objekteja) voivat olla liian suuria säilytettäviksi; Resizer kertoo siitä.',
        ],
      },
      commands: {
        heading: 'Komennot',
        intro: 'Kirjoita {command} ja jokin näistä. !resizer ja !rsz toimivat aina myös.',
        colCommand: 'Komento',
        colDesc: 'Mitä se tekee',
      },
      settings: {
        heading: 'Asetukset',
        intro: 'Muuta näitä Asetukset-kortilta tai komennolla set <setting> <value>.',
        colKey: 'Asetus',
        colDesc: 'Mitä se tekee',
        rows: {
          language: 'Valikkojen, viestien ja monisteiden kieli.',
          command: 'Komennon lisänimi (0.0.9 antoi nimetä sen uudelleen).',
          keepTokenSize: 'Zoomaus siirtää poletteja mutta säilyttää niiden koon.',
          scaleStrokes: 'Zoomaus skaalaa piirrosten viivanleveyden (seinät säilyttävät omansa).',
          deleteCalibrationBox: 'Kalibrointi poistaa mittaamansa laatikon.',
        },
      },
      api: {
        heading: 'Mod-tekijöille',
        intro: 'Muut Modit voivat käyttää globaalia Resizer-objektia.',
        colFunction: 'Funktio',
        colDesc: 'Mitä se tekee',
        rows: {
          zoomPage:
            'Zoomaa sivun kaikkineen, kumottavasti. options.keepTokens säilyttää polettien koot.',
          undo: 'Kumoaa uusimman muutoksen.',
          onZoom:
            'Kutsuu funktiotasi jokaisen zoomauksen jälkeen (ja arvolla 1/factor zoomauksen kumoamisen jälkeen), jotta sivun sijainteja tallentava Mod voi seurata mukana.',
          history: 'Luettelee kumottavissa olevat muutokset.',
        },
      },
      upgrading: {
        heading: 'Päivittäminen versiosta 0.0.9',
        points: [
          'Korvaa vanha skripti tällä; uudelleennimetty komentosi säilyy.',
          'Vanhat komennot toimivat yhä ja tekevät saman kuin alla olevat uudet.',
          'scale ei enää muuta etäisyyttä ruutua kohden (5 ft:n ruutu pysyy 5 ft:nä).',
        ],
        colOld: '0.0.9',
        colNew: '1.0',
      },
      troubleshooting: {
        heading: 'Vianmääritys',
        points: [
          'Muille Modeille, jotka muistavat sijainteja sivulla (partioreitit, polettien kotipaikat, tallennetut alueet), ei kerrota zoomauksesta, elleivät ne käytä Resizer.onZoom-kutsua; tarkista ne zoomauksen jälkeen.',
          'Heksasivut zoomautuvat kuten ruutusivut, mutta tarkista, että poletit ovat yhä heksoissaan.',
          'Jos piirros näyttää olevan väärässä paikassa heti zoomauksen jälkeen, lataa sivu uudelleen: Roll20 piirtää joskus myöhässä.',
          'Kalibrointi vaatii kartan olevan suorassa sivuun nähden; käännä se ensin 0°, 90°, 180° tai 270° kulmaan.',
        ],
      },
      languages: {
        heading: 'Kielet',
        body: 'Valitse kieli Asetukset-kortilta, komennolla set language <code> tai Modin asetuksista.',
        colLanguage: 'Kieli',
        colNative: 'Nimi omalla kielellä',
        colCode: 'Koodi',
      },
      credits: {
        heading: 'Tekijät',
        original: 'Alkuperäisen Modin teki',
        maintainer: 'Uudelleen kirjoittanut ja ylläpitää',
        thread: 'Foorumiketju',
        support:
          'Löysitkö ongelman tai onko sinulla idea? Kirjoita foorumiketjuun tai avaa issue GitHubissa.',
      },
    },
  };

  var localeFr = {
    titles: {
      ready: 'Resizer est prêt.',
      history: 'Historique de Resizer',
      pages: 'Pages de Resizer',
      settings: 'Réglages de Resizer',
      help: 'Aide de Resizer',
    },
    menu: {
      selected: 'Sélection',
      nothingSelected:
        'Rien n’est sélectionné. Sélectionnez d’abord des jetons, une carte ou des dessins.',
      graphicSize: '{name} : {width} × {height} px ({across} × {down} cases)',
      andMore: '…et {count} de plus.',
      map: 'Carte',
      mapHint:
        'Tracez un rectangle sur quelques cases de la carte, sélectionnez-le avec la carte, puis calibrez.',
      page: 'Page',
      pageSize: '{across} × {down} cases, {cell} px par case, {scale} {units} par case',
      pageCells: '{across} × {down} cases',
      historyEmpty: 'Rien à annuler pour l’instant.',
      historyHint: 'Annuler défait d’abord la modification la plus récente.',
      minutesAgo: 'il y a {minutes} min',
      pickerHint: 'Cochez les pages à zoomer ensemble, puis appuyez sur Zoomer les pages cochées.',
      on: 'Activé',
      off: 'Désactivé',
      handouts: 'Aide complète dans les documents :',
    },
    kinds: {
      graphic: 'Image',
      text: 'Texte',
      pathv2: 'Dessin',
      path: 'Dessin',
      door: 'Porte',
      window: 'Fenêtre',
    },
    sizes: {
      tiny: 'Très petit',
      small: 'Petit',
      medium: 'Moyen',
      large: 'Grand',
      huge: 'Très grand',
      gargantuan: 'Gigantesque',
    },
    units: {
      px: 'px',
      cells: 'cases',
      units: 'unités de page',
    },
    buttons: {
      menu: 'Menu',
      resize: 'Redimensionner',
      creatureSize: 'Taille de créature',
      fit: 'Ajuster à la page',
      centre: 'Centrer',
      sizes: 'Afficher les tailles',
      calibrate: 'Calibrer la carte',
      calibrateFit: 'Calibrer et ajuster la page',
      calibratePx: 'Calibrer en pixels',
      zoom: 'Zoomer la page',
      zoomIn: 'Zoom ×2',
      zoomOut: 'Zoom ×½',
      resizePage: 'Redimensionner la page',
      pageSize: 'Taille de la page',
      pages: 'Choisir des pages',
      zoomPicked: 'Zoomer les pages cochées ({count})',
      pickAll: 'Tout cocher',
      pickNone: 'Tout décocher',
      undo: 'Annuler',
      undoWhat: 'Annuler : {what}',
      history: 'Historique',
      clearHistory: 'Vider l’historique',
      settings: 'Réglages',
      help: 'Aide',
      resetSettings: 'Réinitialiser les réglages',
      rebuild: 'Recréer les documents',
    },
    queries: {
      width: 'Largeur',
      height: 'Hauteur',
      unit: 'Unité',
      unitPx: 'Pixels',
      unitCells: 'Cases de la grille',
      unitUnits: 'Unités de page (70 px)',
      creatureSize: 'Taille de créature',
      keepShape: 'Garder les proportions ?',
      yes: 'Oui',
      no: 'Non - étirer à la page',
      centre: 'Centrer',
      both: 'Dans les deux sens',
      across: 'Cases en largeur dans le cadre',
      down: 'Verticalement seulement',
      downCount: 'Cases en hauteur dans le cadre',
      squarePx: 'Pixels par case sur la carte actuellement',
      factor: 'Facteur de zoom (2 = deux fois plus grand; 0.5 = moitié)',
      tokens: 'Jetons',
      tokensScale: 'Suivre l’échelle de la page',
      tokensKeep: 'Garder leur taille',
      language: 'Langue',
      command: 'Nom de la commande sans !',
    },
    settings: {
      language: 'Langue',
      command: 'Commande',
      keepTokenSize: 'Garder la taille des jetons lors du zoom',
      scaleStrokes: 'Mettre à l’échelle l’épaisseur des traits',
      deleteCalibrationBox: 'Supprimer le cadre de calibrage',
    },
    history: {
      change: 'Modification',
      zoom: 'Zoom ×{factor} sur {page}',
      zoomPages: 'Zoom ×{factor} sur {count} pages',
      size: 'Redimensionner {count} images',
      size_one: 'Redimensionner 1 image',
      page: 'Page {page} à {width} × {height} unités',
      fit: 'Ajuster {count} images à la page',
      fit_one: 'Ajuster 1 image à la page',
      centre: 'Centrer {count} objets',
      centre_one: 'Centrer 1 objet',
      calibrate: 'Calibrer la carte {name}',
      calibrateUnnamed: 'Calibrer la carte',
    },
    messages: {
      welcome:
        'Sélectionnez quelque chose et ouvrez le menu pour le redimensionner, ou zoomez toute une page.',
      upgraded:
        'Mise à jour depuis Resizer 0.0.9. Votre commande {command} et les anciennes commandes fonctionnent toujours.',
      readyHint: 'Tapez {command} pour le menu, ou ouvrez le document Resizer - Command Deck.',
      zoomed: 'Zoom de {page} ×{factor} : {objects} objets ont suivi.',
      zoomedPages: 'Zoom de {count} pages ×{factor} ({page}) : {objects} objets ont suivi.',
      skipped: '{count} objets n’ont pas pu être lus et ont été laissés tels quels.',
      skipped_one: '1 objet n’a pas pu être lu et a été laissé tel quel.',
      resized: '{count} images redimensionnées à {width} × {height} {unit}.',
      resized_one: '1 image redimensionnée à {width} × {height} {unit}.',
      sized: '{count} images redimensionnées en {size}.',
      sized_one: '1 image redimensionnée en {size}.',
      pageResized: '{page} mesure maintenant {size}.',
      fitted: '{count} images ajustées à la page.',
      fitted_one: '1 image ajustée à la page.',
      centred: '{count} objets centrés sur la page.',
      centred_one: '1 objet centré sur la page.',
      calibrated:
        'Calibrage terminé : la carte avait des cases de {square} px ; elle est mise à l’échelle ×{scale} pour des cases de {cell} px et alignée sur la grille.',
      calibratedPage: 'La page mesure maintenant {width} × {height} unités pour contenir la carte.',
      boxRemoved: 'Le cadre de calibrage a été supprimé (Annuler le fait revenir).',
      undone: 'Annulé : {what}.',
      undoMissing: '{count} objets ont été supprimés entre-temps et n’ont pas pu être rétablis.',
      undoMissing_one: '1 objet a été supprimé entre-temps et n’a pas pu être rétabli.',
      notStored: 'Cette modification était trop grosse pour être gardée dans l’historique.',
      historyCleared: '{count} modifications oubliées.',
      historyCleared_one: '1 modification oubliée.',
      settingChanged: '{key} vaut maintenant {value}.',
      settingsReset: 'Les réglages sont revenus par défaut. L’historique d’annulation a été gardé.',
      handoutsRebuilt: 'Les documents Help et Command Deck ont été recréés.',
    },
    errors: {
      unexpected: 'Une erreur s’est produite : {message}',
      unknownCommand: 'Commande inconnue « {command} ». Tapez {help} pour voir les commandes.',
      noSelection: 'Sélectionnez d’abord quelque chose (ou utilisez --ids).',
      unknownIds: 'Aucun objet avec ces ID : {ids}',
      noGraphics:
        'Aucun des objets sélectionnés ne peut être modifié ainsi. Sélectionnez des jetons ou une carte.',
      badSize: 'Indiquez une largeur et une hauteur supérieures à 0, par exemple size 140 140 px.',
      badCreatureSize: 'Taille inconnue. Utilisez tiny, small, medium, large, huge ou gargantuan.',
      badPageSize: 'Indiquez une largeur et une hauteur de page de 1 à {max} unités.',
      badFactor: 'Indiquez un facteur de zoom de {min} à {max}.',
      badFactorText:
        'Impossible de lire « {text} » comme facteur de zoom. Essayez 2, 0.5, 150%, 1/2 ou "to 140".',
      factorOne: 'Un zoom de 1 ne change rien.',
      pageTooBig: '{page} ferait moins de 1 unité ou plus de {max} unités.',
      noPage: 'Page introuvable.',
      noPages: 'Aucune page à modifier. Cochez-en dans le sélecteur de pages, ou utilisez --pages.',
      unknownPages: 'Aucune page nommée : {pages}',
      noMap: 'Sélectionnez aussi l’image de la carte.',
      noBox:
        'Sélectionnez un rectangle tracé sur quelques cases de la carte en plus de la carte, ou utilisez calibrate --cell <px>.',
      boxUnreadable: 'Impossible de lire la taille du dessin sélectionné.',
      boxTooSmall:
        'Le cadre de calibrage est trop petit. Tracez-le sur une ou plusieurs cases entières.',
      badCount:
        'Indiquez le nombre de cases en largeur (et en hauteur) du cadre, par exemple 3 ou 3 2.',
      badSquarePx: 'Indiquez la taille des cases de la carte en pixels, 2 ou plus.',
      mapRotated:
        'Tournez la carte droite par rapport à la page (0°, 90°, 180° ou 270°) avant de calibrer.',
      nothingToUndo: 'Rien à annuler.',
      badSetting: 'Réglage inconnu « {key} ». Réglages : {settings}',
      badValue: '« {value} » n’est pas une valeur acceptée par {key}.',
    },
    help: {
      menu: 'Ouvre le menu ; avec des objets sélectionnés, il affiche leurs tailles.',
      size: 'Redimensionne les images sélectionnées (en pixels par défaut).',
      creature: 'Donne aux jetons sélectionnés une taille de créature, en cases de grille.',
      fit: 'Ajuste les images sélectionnées à la page ; --keep-ratio garde leurs proportions.',
      center: 'Centre les images ou le texte sélectionnés sur la page.',
      calibrate:
        'Met la carte sélectionnée à l’échelle pour que les cases du cadre sélectionné correspondent à la grille, puis les aligne.',
      calibrateCell:
        'Met la carte sélectionnée à l’échelle d’après la taille de ses cases en pixels.',
      page: 'Affiche la taille de la page, ou redimensionne la page (pas son contenu).',
      zoom: 'Zoome des pages avec tout leur contenu ; la distance par case est conservée.',
      pages: 'Ouvre le sélecteur de pages, ou coche des pages, pour en zoomer plusieurs à la fois.',
      undo: 'Annule la modification la plus récente (les 10 dernières sont gardées).',
      history: 'Liste les modifications annulables ; clear les oublie.',
      settings: 'Affiche ou modifie les réglages.',
      reset: 'Remet les réglages par défaut.',
      journal: 'Recrée les documents Help et Command Deck.',
      help: 'Affiche cette liste.',
    },
    deck: {
      menuTitle: 'Menu',
      menuDesc: 'Le menu principal montre la sélection, la page et ce que vous pouvez annuler.',
      selectedTitle: 'Jetons et images sélectionnés',
      selectedDesc: 'Sélectionnez d’abord, puis appuyez sur un bouton.',
      mapTitle: 'Carte',
      mapDesc: 'Sélectionnez la carte et un cadre tracé sur quelques-unes de ses cases.',
      pageTitle: 'Page',
      pageDesc: 'Zoomez la page où vous êtes avec tout son contenu.',
      historyTitle: 'Historique',
      historyDesc: 'Annuler défait la modification la plus récente.',
      footer: 'Les instructions complètes sont dans le document {help}.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Redimensionner jetons, cartes et pages entières',
      footer: 'Les boutons de chaque action sont dans le document {deck}.',
      overview: {
        heading: 'Présentation',
        body: 'Resizer redimensionne les jetons et cartes sélectionnés, redimensionne les pages et zoome une page entière avec tout son contenu : carte, jetons, dessins, texte, murs, portes et fenêtres. Il fonctionne avec les éditeurs Jumpgate et Legacy, conserve la distance par case, aligne les cartes sur la grille et peut annuler ses 10 dernières modifications.',
      },
      quickStart: {
        heading: 'Démarrage rapide',
        steps: [
          'Ouvrez le document Resizer - Command Deck, ou tapez !resizer pour le menu.',
          'Pour redimensionner des jetons, sélectionnez-les et appuyez sur Redimensionner ou Taille de créature.',
          'Pour zoomer une page, allez-y et appuyez sur Zoomer la page ; 2 double tout, 0.5 divise par deux.',
          'Pour ajuster une carte à la grille, tracez un rectangle sur quelques cases de la carte, sélectionnez-le avec la carte et appuyez sur Calibrer la carte.',
          'Vous avez changé d’avis ? Appuyez sur Annuler.',
        ],
      },
      zoom: {
        heading: 'Zoomer des pages',
        intro:
          'Le zoom met à l’échelle une page et tout son contenu depuis son coin supérieur gauche. Les cases grandissent ou rétrécissent, mais chaque case représente toujours la même distance (5 ft restent 5 ft) : règles, auras, lumières et vision des jetons mesurent pareil.',
        points: [
          'Déplace et met à l’échelle les jetons, les images de carte, les dessins Jumpgate et Legacy, le texte, les murs d’éclairage dynamique, les portes, les fenêtres et le décalage de la grille.',
          'Le facteur peut être 2, 0.5, 150%, 1/2, ou "to 140" pour des cases de 140 px.',
          'Garder la taille des jetons (réglage ou --keep-tokens) déplace les jetons avec la carte sans changer leur taille.',
          'L’épaisseur des traits suit l’échelle de la page sauf si le réglage est désactivé ; les murs gardent leur épaisseur.',
          'Les dessins Legacy sont retracés à la nouvelle taille (Jumpgate ne redessine pas un dessin Legacy modifié par un Mod) ; ils reçoivent donc de nouveaux ID.',
        ],
      },
      calibrate: {
        heading: 'Ajuster une carte à la grille',
        intro:
          'Beaucoup de cartes ont leur propre grille, à leur propre taille. Calibrer met la carte à l’échelle pour que ses cases correspondent à celles de la page, puis la déplace pour que les lignes coïncident.',
        steps: [
          'Placez la carte sur la page et tracez un rectangle (avec n’importe quel outil de dessin) sur quelques cases de la carte, d’une ligne à l’autre.',
          'Sélectionnez ensemble la carte et le rectangle (Maj-clic).',
          'Appuyez sur Calibrer la carte et indiquez combien de cases le cadre couvre en largeur et en hauteur.',
          'La carte est mise à l’échelle et déplacée pour que ces cases tombent exactement sur la grille ; le cadre est supprimé.',
        ],
        points: [
          'Calibrer et ajuster la page déplace aussi la carte dans le coin de la page et redimensionne la page à sa taille.',
          'Calibrer en pixels se passe du cadre : indiquez la taille actuelle des cases de la carte en pixels.',
          'Un cadre plus grand (plus de cases) donne un ajustement plus précis.',
        ],
      },
      sizes: {
        heading: 'Tailles de créature',
        intro:
          'Taille donne aux jetons une taille de créature, en cases de la grille de leur page.',
        colSize: 'Taille',
        colCommand: 'Commande',
        colCells: 'Cases',
        cells: '{cells} × {cells}',
      },
      pages: {
        heading: 'Plusieurs pages à la fois',
        points: [
          'Choisir des pages ouvre la liste de toutes les pages ; cochez celles voulues et appuyez sur Zoomer les pages cochées.',
          'En commande : zoom 2 --pages all, --pages picked, --pages current, ou des noms et ID séparés par des virgules (--pages Town, Docks).',
          'Une seule annulation défait tout le lot.',
        ],
      },
      undo: {
        heading: 'Annuler',
        points: [
          'Chaque modification (redimensionner, ajuster, centrer, calibrer, taille de page, zoom) peut être annulée.',
          'Les 10 dernières modifications sont gardées avec la partie : elles survivent à un redémarrage du bac à sable des Mods.',
          'Les objets supprimés depuis la modification sont signalés et ignorés.',
          'Les très grosses modifications (des milliers d’objets) peuvent être trop lourdes à garder ; Resizer le signale.',
        ],
      },
      commands: {
        heading: 'Commandes',
        intro:
          'Tapez {command} suivi de l’une de ces commandes. !resizer et !rsz marchent toujours aussi.',
        colCommand: 'Commande',
        colDesc: 'Effet',
      },
      settings: {
        heading: 'Réglages',
        intro: 'Modifiez-les depuis le panneau Réglages ou avec set <setting> <value>.',
        colKey: 'Réglage',
        colDesc: 'Effet',
        rows: {
          language: 'Langue des menus, messages et documents.',
          command: 'Un nom supplémentaire pour la commande (la 0.0.9 permettait de la renommer).',
          keepTokenSize: 'Le zoom déplace les jetons mais garde leur taille.',
          scaleStrokes:
            'Le zoom met à l’échelle l’épaisseur des traits (les murs gardent la leur).',
          deleteCalibrationBox: 'Calibrer supprime le cadre mesuré.',
        },
      },
      api: {
        heading: 'Pour les auteurs de Mods',
        intro: 'Les autres Mods peuvent utiliser l’objet global Resizer.',
        colFunction: 'Fonction',
        colDesc: 'Effet',
        rows: {
          zoomPage:
            'Zoome une page avec tout son contenu, avec annulation. options.keepTokens garde la taille des jetons.',
          undo: 'Annule la modification la plus récente.',
          onZoom:
            'Appelle votre fonction après chaque zoom (et avec 1/factor après l’annulation d’un zoom), pour qu’un Mod qui mémorise des positions sur la page puisse suivre.',
          history: 'Liste les modifications annulables.',
        },
      },
      upgrading: {
        heading: 'Mise à jour depuis la 0.0.9',
        points: [
          'Remplacez l’ancien script par celui-ci ; votre commande renommée est conservée.',
          'Les anciennes commandes marchent toujours et font ce que font les nouvelles ci-dessous.',
          'scale ne change plus la distance par case (une case de 5 ft reste à 5 ft).',
        ],
        colOld: '0.0.9',
        colNew: '1.0',
      },
      troubleshooting: {
        heading: 'Dépannage',
        points: [
          'Les autres Mods qui mémorisent des positions sur une page (rondes de patrouille, positions de jetons, zones enregistrées) ne sont pas prévenus d’un zoom sauf s’ils utilisent Resizer.onZoom ; vérifiez-les après un zoom.',
          'Les pages hexagonales se zooment comme les autres, mais vérifiez que les jetons restent dans leurs hexagones.',
          'Si un dessin semble mal placé juste après un zoom, rechargez la page : Roll20 redessine parfois en retard.',
          'Calibrer exige une carte droite par rapport à la page ; tournez-la d’abord à 0°, 90°, 180° ou 270°.',
        ],
      },
      languages: {
        heading: 'Langues',
        body: 'Choisissez une langue dans le panneau Réglages, avec set language <code>, ou dans les réglages du Mod.',
        colLanguage: 'Langue',
        colNative: 'Nom d’origine',
        colCode: 'Code',
      },
      credits: {
        heading: 'Crédits',
        original: 'Mod original par',
        maintainer: 'Réécrit et maintenu par',
        thread: 'Fil du forum',
        support:
          'Un problème ou une idée ? Écrivez sur le fil du forum ou ouvrez un ticket sur GitHub.',
      },
    },
  };

  var localeDe = {
    titles: {
      ready: 'Resizer ist bereit.',
      history: 'Resizer-Verlauf',
      pages: 'Resizer-Seiten',
      settings: 'Resizer-Einstellungen',
      help: 'Resizer-Hilfe',
    },
    menu: {
      selected: 'Ausgewählt',
      nothingSelected: 'Nichts ausgewählt. Wähle zuerst Token, eine Karte oder Zeichnungen aus.',
      graphicSize: '{name}: {width} × {height} px ({across} × {down} Felder)',
      andMore: '…und {count} weitere.',
      map: 'Karte',
      mapHint:
        'Zeichne ein Rechteck über einige Felder der Karte, wähle es zusammen mit der Karte aus und kalibriere dann.',
      page: 'Seite',
      pageSize: '{across} × {down} Felder, {cell} px pro Feld, {scale} {units} pro Feld',
      pageCells: '{across} × {down} Felder',
      historyEmpty: 'Noch nichts rückgängig zu machen.',
      historyHint: 'Rückgängig nimmt zuerst die neueste Änderung zurück.',
      minutesAgo: 'vor {minutes} Min.',
      pickerHint:
        'Hake die Seiten an, die zusammen gezoomt werden sollen, und drücke dann Angehakte Seiten zoomen.',
      on: 'An',
      off: 'Aus',
      handouts: 'Vollständige Hilfe in den Handouts:',
    },
    kinds: {
      graphic: 'Grafik',
      text: 'Text',
      pathv2: 'Zeichnung',
      path: 'Zeichnung',
      door: 'Tür',
      window: 'Fenster',
    },
    sizes: {
      tiny: 'Winzig',
      small: 'Klein',
      medium: 'Mittelgroß',
      large: 'Groß',
      huge: 'Riesig',
      gargantuan: 'Gigantisch',
    },
    units: {
      px: 'px',
      cells: 'Felder',
      units: 'Seiteneinheiten',
    },
    buttons: {
      menu: 'Menü',
      resize: 'Größe ändern',
      creatureSize: 'Kreaturengröße',
      fit: 'An Seite anpassen',
      centre: 'Zentrieren',
      sizes: 'Größen anzeigen',
      calibrate: 'Karte kalibrieren',
      calibrateFit: 'Kalibrieren und Seite anpassen',
      calibratePx: 'Nach Pixeln kalibrieren',
      zoom: 'Seite zoomen',
      zoomIn: 'Zoom ×2',
      zoomOut: 'Zoom ×½',
      resizePage: 'Seitengröße ändern',
      pageSize: 'Seitengröße',
      pages: 'Seiten wählen',
      zoomPicked: 'Angehakte Seiten zoomen ({count})',
      pickAll: 'Alle anhaken',
      pickNone: 'Keine anhaken',
      undo: 'Rückgängig',
      undoWhat: 'Rückgängig: {what}',
      history: 'Verlauf',
      clearHistory: 'Verlauf löschen',
      settings: 'Einstellungen',
      help: 'Hilfe',
      resetSettings: 'Einstellungen zurücksetzen',
      rebuild: 'Handouts neu erstellen',
    },
    queries: {
      width: 'Breite',
      height: 'Höhe',
      unit: 'Einheit',
      unitPx: 'Pixel',
      unitCells: 'Rasterfelder',
      unitUnits: 'Seiteneinheiten (70 px)',
      creatureSize: 'Kreaturengröße',
      keepShape: 'Form beibehalten?',
      yes: 'Ja',
      no: 'Nein - auf die Seite strecken',
      centre: 'Zentrieren',
      both: 'In beide Richtungen',
      across: 'Felder quer im Rahmen',
      down: 'Nur senkrecht',
      downCount: 'Felder senkrecht im Rahmen',
      squarePx: 'Pixel pro Feld auf der Karte jetzt',
      factor: 'Zoomfaktor (2 = doppelt so groß; 0.5 = halb)',
      tokens: 'Token',
      tokensScale: 'Mit der Seite skalieren',
      tokensKeep: 'Größe beibehalten',
      language: 'Sprache',
      command: 'Befehlsname ohne !',
    },
    settings: {
      language: 'Sprache',
      command: 'Befehl',
      keepTokenSize: 'Tokengröße beim Zoomen beibehalten',
      scaleStrokes: 'Linienstärke von Zeichnungen skalieren',
      deleteCalibrationBox: 'Kalibrierungsrahmen löschen',
    },
    history: {
      change: 'Änderung',
      zoom: 'Zoom ×{factor} auf {page}',
      zoomPages: 'Zoom ×{factor} auf {count} Seiten',
      size: 'Größe von {count} Grafiken ändern',
      size_one: 'Größe von 1 Grafik ändern',
      page: 'Seite {page} auf {width} × {height} Einheiten',
      fit: '{count} Grafiken an die Seite anpassen',
      fit_one: '1 Grafik an die Seite anpassen',
      centre: '{count} Objekte zentrieren',
      centre_one: '1 Objekt zentrieren',
      calibrate: 'Karte {name} kalibrieren',
      calibrateUnnamed: 'Karte kalibrieren',
    },
    messages: {
      welcome:
        'Wähle etwas aus und öffne das Menü, um die Größe zu ändern, oder zoome eine ganze Seite.',
      upgraded:
        'Aktualisiert von Resizer 0.0.9. Dein Befehl {command} und die alten Befehle funktionieren weiterhin.',
      readyHint: 'Tippe {command} für das Menü oder öffne das Handout Resizer - Command Deck.',
      zoomed: '{page} ×{factor} gezoomt: {objects} Objekte wurden mitbewegt.',
      zoomedPages: '{count} Seiten ×{factor} gezoomt ({page}): {objects} Objekte wurden mitbewegt.',
      skipped: '{count} Objekte konnten nicht gelesen werden und blieben unverändert.',
      skipped_one: '1 Objekt konnte nicht gelesen werden und blieb unverändert.',
      resized: 'Größe von {count} Grafiken auf {width} × {height} {unit} geändert.',
      resized_one: 'Größe von 1 Grafik auf {width} × {height} {unit} geändert.',
      sized: 'Größe von {count} Grafiken auf {size} geändert.',
      sized_one: 'Größe von 1 Grafik auf {size} geändert.',
      pageResized: '{page} ist jetzt {size}.',
      fitted: '{count} Grafiken an die Seite angepasst.',
      fitted_one: '1 Grafik an die Seite angepasst.',
      centred: '{count} Objekte auf der Seite zentriert.',
      centred_one: '1 Objekt auf der Seite zentriert.',
      calibrated:
        'Kalibriert: Die Karte hatte Felder mit {square} px; sie ist jetzt ×{scale} auf Felder mit {cell} px skaliert und am Raster ausgerichtet.',
      calibratedPage: 'Die Seite ist jetzt {width} × {height} Einheiten groß, passend zur Karte.',
      boxRemoved: 'Der Kalibrierungsrahmen wurde gelöscht (Rückgängig holt ihn zurück).',
      undone: 'Rückgängig gemacht: {what}.',
      undoMissing:
        '{count} Objekte wurden inzwischen gelöscht und konnten nicht wiederhergestellt werden.',
      undoMissing_one:
        '1 Objekt wurde inzwischen gelöscht und konnte nicht wiederhergestellt werden.',
      notStored: 'Diese Änderung war zu groß für den Rückgängig-Verlauf.',
      historyCleared: '{count} Änderungen vergessen.',
      historyCleared_one: '1 Änderung vergessen.',
      settingChanged: '{key} ist jetzt {value}.',
      settingsReset:
        'Die Einstellungen sind wieder auf Standard. Der Rückgängig-Verlauf wurde behalten.',
      handoutsRebuilt: 'Die Handouts Help und Command Deck wurden neu erstellt.',
    },
    errors: {
      unexpected: 'Etwas ist schiefgelaufen: {message}',
      unknownCommand: 'Unbekannter Befehl „{command}“. Tippe {help} für die Befehle.',
      noSelection: 'Wähle zuerst etwas aus (oder gib --ids an).',
      unknownIds: 'Keine Objekte mit diesen IDs: {ids}',
      noGraphics:
        'Keines der ausgewählten Objekte kann so geändert werden. Wähle Token oder eine Karte aus.',
      badSize: 'Gib eine Breite und Höhe über 0 an, zum Beispiel size 140 140 px.',
      badCreatureSize:
        'Unbekannte Größe. Verwende tiny, small, medium, large, huge oder gargantuan.',
      badPageSize: 'Gib eine Seitenbreite und -höhe von 1 bis {max} Einheiten an.',
      badFactor: 'Gib einen Zoomfaktor von {min} bis {max} an.',
      badFactorText:
        '„{text}“ ist kein lesbarer Zoomfaktor. Versuche 2, 0.5, 150%, 1/2 oder "to 140".',
      factorOne: 'Ein Zoom von 1 ändert nichts.',
      pageTooBig: '{page} wäre kleiner als 1 Einheit oder größer als {max} Einheiten.',
      noPage: 'Die Seite wurde nicht gefunden.',
      noPages: 'Keine Seiten zu ändern. Hake welche in der Seitenauswahl an oder gib --pages an.',
      unknownPages: 'Keine Seiten mit diesem Namen: {pages}',
      noMap: 'Wähle auch die Kartengrafik aus.',
      noBox:
        'Wähle neben der Karte ein Rechteck aus, das über einige Felder der Karte gezeichnet ist, oder verwende calibrate --cell <px>.',
      boxUnreadable: 'Die Größe der ausgewählten Zeichnung konnte nicht gelesen werden.',
      boxTooSmall:
        'Der Kalibrierungsrahmen ist zu klein. Zeichne ihn über ein oder mehrere ganze Felder.',
      badCount: 'Gib die Anzahl der Felder quer (und senkrecht) im Rahmen an, etwa 3 oder 3 2.',
      badSquarePx: 'Gib die Feldgröße der Karte in Pixeln an, 2 oder mehr.',
      mapRotated:
        'Drehe die Karte gerade zur Seite (0°, 90°, 180° oder 270°), bevor du kalibrierst.',
      nothingToUndo: 'Nichts rückgängig zu machen.',
      badSetting: 'Unbekannte Einstellung „{key}“. Einstellungen: {settings}',
      badValue: '„{value}“ ist kein gültiger Wert für {key}.',
    },
    help: {
      menu: 'Öffnet das Menü; bei ausgewählten Objekten zeigt es deren Größen.',
      size: 'Ändert die Größe der ausgewählten Grafiken (standardmäßig in Pixeln).',
      creature: 'Setzt die ausgewählten Token auf eine Kreaturengröße, in Rasterfeldern.',
      fit: 'Passt die ausgewählten Grafiken an die Seite an; --keep-ratio behält ihre Form.',
      center: 'Zentriert die ausgewählten Grafiken oder Texte auf der Seite.',
      calibrate:
        'Skaliert die ausgewählte Karte, sodass die Felder im ausgewählten Rahmen zum Seitenraster passen, und richtet sie aus.',
      calibrateCell: 'Skaliert die ausgewählte Karte anhand ihrer Feldgröße in Pixeln.',
      page: 'Zeigt die Seitengröße oder ändert die Seitengröße (nicht den Inhalt).',
      zoom: 'Zoomt Seiten mit allem darauf; die Distanz pro Feld bleibt gleich.',
      pages: 'Öffnet die Seitenauswahl oder hakt Seiten an, um mehrere auf einmal zu zoomen.',
      undo: 'Macht die neueste Änderung rückgängig (die letzten 10 werden behalten).',
      history:
        'Listet die Änderungen auf, die rückgängig gemacht werden können; clear vergisst sie.',
      settings: 'Zeigt oder ändert die Einstellungen.',
      reset: 'Setzt die Einstellungen auf Standard zurück.',
      journal: 'Erstellt die Handouts Help und Command Deck neu.',
      help: 'Zeigt diese Liste.',
    },
    deck: {
      menuTitle: 'Menü',
      menuDesc: 'Das Hauptmenü zeigt die Auswahl, die Seite und was du rückgängig machen kannst.',
      selectedTitle: 'Ausgewählte Token und Grafiken',
      selectedDesc: 'Erst auswählen, dann einen Knopf drücken.',
      mapTitle: 'Karte',
      mapDesc: 'Wähle die Karte und einen Rahmen aus, der über einige ihrer Felder gezeichnet ist.',
      pageTitle: 'Seite',
      pageDesc: 'Zoome die Seite, auf der du bist, mit allem darauf.',
      historyTitle: 'Verlauf',
      historyDesc: 'Rückgängig nimmt die neueste Änderung zurück.',
      footer: 'Die vollständige Anleitung steht im Handout {help}.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Größe von Token, Karten und ganzen Seiten ändern',
      footer: 'Knöpfe für jede Aktion findest du im Handout {deck}.',
      overview: {
        heading: 'Überblick',
        body: 'Resizer ändert die Größe ausgewählter Token und Karten, ändert Seitengrößen und zoomt eine ganze Seite mit allem darauf: Karte, Token, Zeichnungen, Text, Wände, Türen und Fenster. Er funktioniert mit den Editoren Jumpgate und Legacy, behält die Distanz pro Rasterfeld bei, richtet Karten am Raster aus und kann seine letzten 10 Änderungen rückgängig machen.',
      },
      quickStart: {
        heading: 'Schnellstart',
        steps: [
          'Öffne das Handout Resizer - Command Deck oder tippe !resizer für das Menü.',
          'Um die Größe von Token zu ändern, wähle sie aus und drücke Größe ändern oder Kreaturengröße.',
          'Um eine Seite zu zoomen, gehe zu ihr und drücke Seite zoomen; 2 verdoppelt alles, 0.5 halbiert es.',
          'Um eine Karte ans Raster anzupassen, zeichne ein Rechteck über einige Felder der Karte, wähle es zusammen mit der Karte aus und drücke Karte kalibrieren.',
          'Doch anders entschieden? Drücke Rückgängig.',
        ],
      },
      zoom: {
        heading: 'Seiten zoomen',
        intro:
          'Zoom skaliert eine Seite mit allem darauf von ihrer oberen linken Ecke aus. Die Rasterfelder werden größer oder kleiner, stehen aber weiter für dieselbe Distanz (5 ft bleiben 5 ft), sodass Lineale, Auren, Tokenlicht und Sicht gleich messen.',
        points: [
          'Bewegt und skaliert Token, Kartengrafiken, Jumpgate- und Legacy-Zeichnungen, Text, Wände der dynamischen Beleuchtung, Türen, Fenster und den Rasterversatz.',
          'Faktoren können 2, 0.5, 150%, 1/2 oder "to 140" für Felder mit 140 px sein.',
          'Tokengröße beibehalten (Einstellung oder --keep-tokens) bewegt Token mit der Karte, lässt ihre Größe aber unverändert.',
          'Die Linienstärke von Zeichnungen skaliert mit der Seite, außer die Einstellung ist aus; Wände behalten ihre Stärke.',
          'Legacy-Zeichnungen werden in der neuen Größe neu gezeichnet (Jumpgate zeichnet eine von einer Mod geänderte Legacy-Zeichnung nicht neu), daher bekommen sie neue IDs.',
        ],
      },
      calibrate: {
        heading: 'Eine Karte ans Raster anpassen',
        intro:
          'Viele Karten haben ein eigenes Raster in eigener Größe. Kalibrieren skaliert die Karte, sodass ihre Felder zu den Feldern der Seite passen, und verschiebt sie, bis die Linien übereinanderliegen.',
        steps: [
          'Lege die Karte auf die Seite und zeichne ein Rechteck (mit einem beliebigen Zeichenwerkzeug) über einige Felder der Karte, von Linie zu Linie.',
          'Wähle die Karte und das Rechteck zusammen aus (Umschalt-Klick).',
          'Drücke Karte kalibrieren und gib an, wie viele Felder der Rahmen quer und senkrecht abdeckt.',
          'Die Karte wird skaliert und verschoben, sodass diese Felder genau auf das Seitenraster passen; der Rahmen wird gelöscht.',
        ],
        points: [
          'Kalibrieren und Seite anpassen verschiebt die Karte zusätzlich in die Seitenecke und passt die Seitengröße an die Karte an.',
          'Nach Pixeln kalibrieren braucht keinen Rahmen: Gib die aktuelle Feldgröße der Karte in Pixeln an.',
          'Ein größerer Rahmen (mehr Felder) ergibt eine genauere Anpassung.',
        ],
      },
      sizes: {
        heading: 'Kreaturengrößen',
        intro: 'Größe setzt Token auf eine Kreaturengröße in den Rasterfeldern ihrer Seite.',
        colSize: 'Größe',
        colCommand: 'Befehl',
        colCells: 'Felder',
        cells: '{cells} × {cells}',
      },
      pages: {
        heading: 'Mehrere Seiten auf einmal',
        points: [
          'Seiten wählen öffnet eine Liste aller Seiten; hake die gewünschten an und drücke Angehakte Seiten zoomen.',
          'Per Befehl: zoom 2 --pages all, --pages picked, --pages current oder durch Kommas getrennte Namen und IDs (--pages Town, Docks).',
          'Ein einziges Rückgängig nimmt den ganzen Stapel zurück.',
        ],
      },
      undo: {
        heading: 'Rückgängig',
        points: [
          'Jede Änderung (Größe, Anpassen, Zentrieren, Kalibrieren, Seitengröße, Zoom) kann rückgängig gemacht werden.',
          'Die letzten 10 Änderungen werden mit dem Spiel gespeichert und überstehen so einen Neustart der Mod-Sandbox.',
          'Objekte, die seit der Änderung gelöscht wurden, werden gemeldet und übersprungen.',
          'Sehr große Änderungen (tausende Objekte) können zu groß zum Speichern sein; Resizer sagt dann Bescheid.',
        ],
      },
      commands: {
        heading: 'Befehle',
        intro:
          'Tippe {command} mit einem dieser Befehle. !resizer und !rsz funktionieren auch immer.',
        colCommand: 'Befehl',
        colDesc: 'Wirkung',
      },
      settings: {
        heading: 'Einstellungen',
        intro: 'Ändere sie im Einstellungsbereich oder mit set <setting> <value>.',
        colKey: 'Einstellung',
        colDesc: 'Wirkung',
        rows: {
          language: 'Sprache für Menüs, Meldungen und Handouts.',
          command: 'Ein zusätzlicher Name für den Befehl (0.0.9 ließ dich ihn umbenennen).',
          keepTokenSize: 'Zoom bewegt Token, behält aber ihre Größe.',
          scaleStrokes: 'Zoom skaliert die Linienstärke von Zeichnungen (Wände behalten ihre).',
          deleteCalibrationBox: 'Kalibrieren löscht den gemessenen Rahmen.',
        },
      },
      api: {
        heading: 'Für Mod-Autoren',
        intro: 'Andere Mods können das globale Objekt Resizer verwenden.',
        colFunction: 'Funktion',
        colDesc: 'Wirkung',
        rows: {
          zoomPage:
            'Zoomt eine Seite mit allem darauf, mit Rückgängig. options.keepTokens behält die Tokengrößen.',
          undo: 'Macht die neueste Änderung rückgängig.',
          onZoom:
            'Ruft deine Funktion nach jedem Zoom auf (und mit 1/factor, wenn einer rückgängig gemacht wird), damit eine Mod, die Seitenpositionen speichert, folgen kann.',
          history: 'Listet die Änderungen auf, die rückgängig gemacht werden können.',
        },
      },
      upgrading: {
        heading: 'Umstieg von 0.0.9',
        points: [
          'Ersetze das alte Skript durch dieses; dein umbenannter Befehl bleibt erhalten.',
          'Die alten Befehle funktionieren weiter und tun, was die neuen unten tun.',
          'scale ändert die Distanz pro Feld nicht mehr (ein 5-ft-Feld bleibt 5 ft).',
        ],
        colOld: '0.0.9',
        colNew: '1.0',
      },
      troubleshooting: {
        heading: 'Fehlerbehebung',
        points: [
          'Andere Mods, die sich Positionen auf einer Seite merken (Patrouillenrouten, Token-Startpunkte, gespeicherte Bereiche), erfahren nichts von einem Zoom, außer sie nutzen Resizer.onZoom; prüfe sie nach dem Zoomen.',
          'Hex-Seiten werden wie quadratische gezoomt, aber prüfe, ob die Token noch in ihren Hexfeldern stehen.',
          'Wenn eine Zeichnung direkt nach einem Zoom verrutscht aussieht, lade die Seite neu: Roll20 zeichnet manchmal verspätet neu.',
          'Kalibrieren braucht eine gerade zur Seite ausgerichtete Karte; drehe sie zuerst auf 0°, 90°, 180° oder 270°.',
        ],
      },
      languages: {
        heading: 'Sprachen',
        body: 'Wähle eine Sprache im Einstellungsbereich, mit set language <code> oder in den Mod-Einstellungen.',
        colLanguage: 'Sprache',
        colNative: 'Eigenname',
        colCode: 'Code',
      },
      credits: {
        heading: 'Danksagung',
        original: 'Ursprüngliche Mod von',
        maintainer: 'Neu geschrieben und gepflegt von',
        thread: 'Forenthread',
        support:
          'Ein Problem gefunden oder eine Idee? Schreib im Forenthread oder eröffne ein Issue auf GitHub.',
      },
    },
  };

  var localeEl = {
    titles: {
      ready: 'Το Resizer είναι έτοιμο.',
      history: 'Resizer: Ιστορικό',
      pages: 'Resizer: Σελίδες',
      settings: 'Resizer: Ρυθμίσεις',
      help: 'Resizer: Βοήθεια',
    },
    menu: {
      selected: 'Επιλεγμένα',
      nothingSelected: 'Δεν έχει επιλεγεί τίποτα. Επιλέξτε πρώτα πιόνια, χάρτη ή σχέδια.',
      graphicSize: '{name}: {width} × {height} px ({across} × {down} κελιά)',
      andMore: '…και {count} ακόμη.',
      map: 'Χάρτης',
      mapHint:
        'Σχεδιάστε ένα ορθογώνιο πάνω σε μερικά από τα τετράγωνα του ίδιου του χάρτη, επιλέξτε το μαζί με τον χάρτη και κάντε βαθμονόμηση.',
      page: 'Σελίδα',
      pageSize: '{across} × {down} κελιά, {cell} px ανά κελί, {scale} {units} ανά κελί',
      pageCells: '{across} × {down} κελιά',
      historyEmpty: 'Δεν υπάρχει ακόμη κάτι για αναίρεση.',
      historyHint: 'Η αναίρεση ακυρώνει πρώτα την πιο πρόσφατη αλλαγή.',
      minutesAgo: 'πριν από {minutes} λεπτά',
      pickerHint:
        'Τσεκάρετε τις σελίδες που θα κλιμακωθούν μαζί και πατήστε Κλιμάκωση τσεκαρισμένων.',
      on: 'Ναι',
      off: 'Όχι',
      handouts: 'Πλήρης βοήθεια στα φυλλάδια:',
    },
    kinds: {
      graphic: 'Γραφικό',
      text: 'Κείμενο',
      pathv2: 'Σχέδιο',
      path: 'Σχέδιο',
      door: 'Πόρτα',
      window: 'Παράθυρο',
    },
    sizes: {
      tiny: 'Μικροσκοπικό',
      small: 'Μικρό',
      medium: 'Μεσαίο',
      large: 'Μεγάλο',
      huge: 'Τεράστιο',
      gargantuan: 'Γιγαντιαίο',
    },
    units: {
      px: 'px',
      cells: 'κελιά',
      units: 'μονάδες σελίδας',
    },
    buttons: {
      menu: 'Μενού',
      resize: 'Αλλαγή μεγέθους',
      creatureSize: 'Μέγεθος πλάσματος',
      fit: 'Προσαρμογή στη σελίδα',
      centre: 'Στο κέντρο',
      sizes: 'Εμφάνιση μεγεθών',
      calibrate: 'Βαθμονόμηση χάρτη',
      calibrateFit: 'Βαθμονόμηση και προσαρμογή σελίδας',
      calibratePx: 'Βαθμονόμηση με pixel',
      zoom: 'Κλιμάκωση σελίδας',
      zoomIn: 'Κλιμάκωση ×2',
      zoomOut: 'Κλιμάκωση ×½',
      resizePage: 'Αλλαγή μεγέθους σελίδας',
      pageSize: 'Μέγεθος σελίδας',
      pages: 'Επιλογή σελίδων',
      zoomPicked: 'Κλιμάκωση τσεκαρισμένων ({count})',
      pickAll: 'Τσεκάρισμα όλων',
      pickNone: 'Ξετσεκάρισμα όλων',
      undo: 'Αναίρεση',
      undoWhat: 'Αναίρεση: {what}',
      history: 'Ιστορικό',
      clearHistory: 'Εκκαθάριση ιστορικού',
      settings: 'Ρυθμίσεις',
      help: 'Βοήθεια',
      resetSettings: 'Επαναφορά ρυθμίσεων',
      rebuild: 'Αναδημιουργία φυλλαδίων',
    },
    queries: {
      width: 'Πλάτος',
      height: 'Ύψος',
      unit: 'Μονάδα',
      unitPx: 'Pixel',
      unitCells: 'Κελιά πλέγματος',
      unitUnits: 'Μονάδες σελίδας (70 px)',
      creatureSize: 'Μέγεθος πλάσματος',
      keepShape: 'Διατήρηση σχήματος;',
      yes: 'Ναι',
      no: 'Όχι - τέντωμα στη σελίδα',
      centre: 'Κεντράρισμα',
      both: 'Και προς τις δύο κατευθύνσεις',
      across: 'Τετράγωνα κατά πλάτος του πλαισίου',
      down: 'Μόνο κατακόρυφα',
      downCount: 'Τετράγωνα καθ’ ύψος του πλαισίου',
      squarePx: 'Pixel ανά τετράγωνο του χάρτη τώρα',
      factor: 'Συντελεστής κλιμάκωσης (2 = διπλάσιο· 0.5 = μισό)',
      tokens: 'Πιόνια',
      tokensScale: 'Κλιμάκωση μαζί με τη σελίδα',
      tokensKeep: 'Διατήρηση του μεγέθους τους',
      language: 'Γλώσσα',
      command: 'Όνομα εντολής χωρίς !',
    },
    settings: {
      language: 'Γλώσσα',
      command: 'Εντολή',
      keepTokenSize: 'Διατήρηση μεγέθους πιονιών στην κλιμάκωση',
      scaleStrokes: 'Κλιμάκωση πάχους γραμμών των σχεδίων',
      deleteCalibrationBox: 'Διαγραφή του πλαισίου βαθμονόμησης',
    },
    history: {
      change: 'Αλλαγή',
      zoom: 'Κλιμάκωση ×{factor} στη σελίδα {page}',
      zoomPages: 'Κλιμάκωση ×{factor} σε {count} σελίδες',
      size: 'Αλλαγή μεγέθους {count} γραφικών',
      size_one: 'Αλλαγή μεγέθους 1 γραφικού',
      page: 'Σελίδα {page} σε {width} × {height} μονάδες',
      fit: 'Προσαρμογή {count} γραφικών στη σελίδα',
      fit_one: 'Προσαρμογή 1 γραφικού στη σελίδα',
      centre: 'Κεντράρισμα {count} αντικειμένων',
      centre_one: 'Κεντράρισμα 1 αντικειμένου',
      calibrate: 'Βαθμονόμηση χάρτη {name}',
      calibrateUnnamed: 'Βαθμονόμηση του χάρτη',
    },
    messages: {
      welcome:
        'Επιλέξτε κάτι και ανοίξτε το μενού για να αλλάξετε το μέγεθός του ή κλιμακώστε ολόκληρη τη σελίδα.',
      upgraded:
        'Αναβαθμίστηκε από το Resizer 0.0.9. Η εντολή σας {command} και οι παλιές εντολές λειτουργούν ακόμη.',
      readyHint:
        'Πληκτρολογήστε {command} για το μενού ή ανοίξτε το φυλλάδιο Resizer - Command Deck.',
      zoomed:
        'Η σελίδα {page} κλιμακώθηκε ×{factor}: {objects} αντικείμενα μετακινήθηκαν μαζί της.',
      zoomedPages:
        '{count} σελίδες κλιμακώθηκαν ×{factor} ({page}): {objects} αντικείμενα μετακινήθηκαν μαζί τους.',
      skipped: '{count} αντικείμενα δεν διαβάστηκαν και έμειναν ανέγγιχτα.',
      skipped_one: '1 αντικείμενο δεν διαβάστηκε και έμεινε ανέγγιχτο.',
      resized: 'Το μέγεθος {count} γραφικών άλλαξε σε {width} × {height} {unit}.',
      resized_one: 'Το μέγεθος 1 γραφικού άλλαξε σε {width} × {height} {unit}.',
      sized: 'Το μέγεθος {count} γραφικών άλλαξε σε {size}.',
      sized_one: 'Το μέγεθος 1 γραφικού άλλαξε σε {size}.',
      pageResized: 'Η σελίδα {page} είναι τώρα {size}.',
      fitted: '{count} γραφικά προσαρμόστηκαν στη σελίδα.',
      fitted_one: '1 γραφικό προσαρμόστηκε στη σελίδα.',
      centred: '{count} αντικείμενα κεντραρίστηκαν στη σελίδα.',
      centred_one: '1 αντικείμενο κεντραρίστηκε στη σελίδα.',
      calibrated:
        'Βαθμονομήθηκε: ο χάρτης είχε τετράγωνα {square} px· τώρα είναι κλιμακωμένος ×{scale} σε κελιά {cell} px και ευθυγραμμισμένος με το πλέγμα.',
      calibratedPage: 'Η σελίδα είναι τώρα {width} × {height} μονάδες για να χωράει ο χάρτης.',
      boxRemoved: 'Το πλαίσιο βαθμονόμησης διαγράφηκε (η Αναίρεση το επαναφέρει).',
      undone: 'Αναιρέθηκε: {what}.',
      undoMissing: '{count} αντικείμενα είχαν διαγραφεί στο μεταξύ, οπότε δεν επανήλθαν.',
      undoMissing_one: '1 αντικείμενο είχε διαγραφεί στο μεταξύ, οπότε δεν επανήλθε.',
      notStored: 'Αυτή η αλλαγή ήταν πολύ μεγάλη για το ιστορικό αναίρεσης.',
      historyCleared: 'Ξεχάστηκαν {count} αλλαγές.',
      historyCleared_one: 'Ξεχάστηκε 1 αλλαγή.',
      settingChanged: 'Το {key} είναι τώρα {value}.',
      settingsReset: 'Οι ρυθμίσεις επανήλθαν στις προεπιλογές. Το ιστορικό αναίρεσης διατηρήθηκε.',
      handoutsRebuilt: 'Τα φυλλάδια Βοήθειας και Command Deck αναδημιουργήθηκαν.',
    },
    errors: {
      unexpected: 'Κάτι πήγε στραβά: {message}',
      unknownCommand: 'Άγνωστη εντολή "{command}". Πληκτρολογήστε {help} για τις εντολές.',
      noSelection: 'Επιλέξτε πρώτα κάτι (ή δώστε --ids).',
      unknownIds: 'Δεν υπάρχουν αντικείμενα με αυτά τα ID: {ids}',
      noGraphics:
        'Κανένα από τα επιλεγμένα αντικείμενα δεν αλλάζει με αυτόν τον τρόπο. Επιλέξτε πιόνια ή χάρτη.',
      badSize: 'Δώστε πλάτος και ύψος πάνω από 0, για παράδειγμα size 140 140 px.',
      badCreatureSize:
        'Άγνωστο μέγεθος. Χρησιμοποιήστε tiny, small, medium, large, huge ή gargantuan.',
      badPageSize: 'Δώστε πλάτος και ύψος σελίδας από 1 έως {max} μονάδες.',
      badFactor: 'Δώστε συντελεστή κλιμάκωσης από {min} έως {max}.',
      badFactorText:
        'Το "{text}" δεν αναγνωρίστηκε ως συντελεστής κλιμάκωσης. Δοκιμάστε 2, 0.5, 150%, 1/2 ή "to 140".',
      factorOne: 'Η κλιμάκωση 1 δεν αλλάζει τίποτα.',
      pageTooBig:
        'Η σελίδα {page} θα γινόταν μικρότερη από 1 μονάδα ή μεγαλύτερη από {max} μονάδες.',
      noPage: 'Η σελίδα δεν βρέθηκε.',
      noPages:
        'Δεν υπάρχουν σελίδες για αλλαγή. Τσεκάρετε μερικές στην επιλογή σελίδων ή δώστε --pages.',
      unknownPages: 'Δεν υπάρχουν σελίδες με όνομα: {pages}',
      noMap: 'Επιλέξτε και το γραφικό του χάρτη.',
      noBox:
        'Επιλέξτε μαζί με τον χάρτη ένα ορθογώνιο σχεδιασμένο πάνω σε τετράγωνά του ή χρησιμοποιήστε calibrate --cell <px>.',
      boxUnreadable: 'Δεν ήταν δυνατή η ανάγνωση του μεγέθους του επιλεγμένου σχεδίου.',
      boxTooSmall:
        'Το πλαίσιο βαθμονόμησης είναι πολύ μικρό. Σχεδιάστε το πάνω σε ένα ή περισσότερα ολόκληρα τετράγωνα.',
      badCount:
        'Δώστε τον αριθμό τετραγώνων κατά πλάτος (και καθ’ ύψος) του πλαισίου, π.χ. 3 ή 3 2.',
      badSquarePx: 'Δώστε το μέγεθος τετραγώνου του χάρτη σε pixel, 2 ή περισσότερα.',
      mapRotated:
        'Στρέψτε τον χάρτη ευθεία προς τη σελίδα (0°, 90°, 180° ή 270°) πριν από τη βαθμονόμηση.',
      nothingToUndo: 'Δεν υπάρχει κάτι για αναίρεση.',
      badSetting: 'Άγνωστη ρύθμιση "{key}". Ρυθμίσεις: {settings}',
      badValue: 'Το "{value}" δεν είναι αποδεκτή τιμή για το {key}.',
    },
    help: {
      menu: 'Άνοιγμα του μενού· με επιλεγμένα αντικείμενα δείχνει τα μεγέθη τους.',
      size: 'Αλλαγή μεγέθους των επιλεγμένων γραφικών (σε pixel από προεπιλογή).',
      creature: 'Ορισμός μεγέθους πλάσματος στα επιλεγμένα πιόνια, σε κελιά πλέγματος.',
      fit: 'Προσαρμογή των επιλεγμένων γραφικών στη σελίδα· το --keep-ratio κρατά το σχήμα τους.',
      center: 'Κεντράρισμα των επιλεγμένων γραφικών ή κειμένου στη σελίδα.',
      calibrate:
        'Κλιμάκωση του επιλεγμένου χάρτη ώστε τα τετράγωνα μέσα στο επιλεγμένο πλαίσιο να ταιριάζουν με το πλέγμα της σελίδας και ευθυγράμμισή τους.',
      calibrateCell: 'Κλιμάκωση του επιλεγμένου χάρτη με βάση το μέγεθος τετραγώνου του σε pixel.',
      page: 'Εμφάνιση του μεγέθους της σελίδας ή αλλαγή του (όχι όσων είναι πάνω της).',
      zoom: 'Κλιμάκωση σελίδων με ό,τι έχουν πάνω τους· η απόσταση ανά κελί διατηρείται.',
      pages: 'Άνοιγμα επιλογής σελίδων ή τσεκάρισμα σελίδων για κλιμάκωση πολλών μαζί.',
      undo: 'Αναίρεση της πιο πρόσφατης αλλαγής (κρατιούνται οι τελευταίες 10).',
      history: 'Λίστα των αλλαγών που αναιρούνται· το clear τις ξεχνά.',
      settings: 'Εμφάνιση ή αλλαγή των ρυθμίσεων.',
      reset: 'Επαναφορά των ρυθμίσεων στις προεπιλογές.',
      journal: 'Αναδημιουργία των φυλλαδίων Βοήθειας και Command Deck.',
      help: 'Εμφάνιση αυτής της λίστας.',
    },
    deck: {
      menuTitle: 'Μενού',
      menuDesc: 'Το κύριο μενού δείχνει την επιλογή, τη σελίδα και τι μπορείτε να αναιρέσετε.',
      selectedTitle: 'Επιλεγμένα πιόνια και γραφικά',
      selectedDesc: 'Επιλέξτε πρώτα και μετά πατήστε ένα κουμπί.',
      mapTitle: 'Χάρτης',
      mapDesc: 'Επιλέξτε τον χάρτη και ένα πλαίσιο σχεδιασμένο πάνω σε μερικά τετράγωνά του.',
      pageTitle: 'Σελίδα',
      pageDesc: 'Κλιμακώστε τη σελίδα όπου βρίσκεστε με ό,τι έχει πάνω της.',
      historyTitle: 'Ιστορικό',
      historyDesc: 'Η αναίρεση ακυρώνει την πιο πρόσφατη αλλαγή.',
      footer: 'Πλήρεις οδηγίες υπάρχουν στο φυλλάδιο {help}.',
    },
    handout: {
      versionLabel: 'Έκδοση',
      subtitle: 'Αλλαγή μεγέθους πιονιών, χαρτών και ολόκληρων σελίδων',
      footer: 'Κουμπιά για κάθε ενέργεια υπάρχουν στο φυλλάδιο {deck}.',
      overview: {
        heading: 'Επισκόπηση',
        body: 'Το Resizer αλλάζει το μέγεθος επιλεγμένων πιονιών και χαρτών, αλλάζει το μέγεθος σελίδων και κλιμακώνει ολόκληρη σελίδα με ό,τι έχει πάνω της: χάρτη, πιόνια, σχέδια, κείμενο, τοίχους, πόρτες και παράθυρα. Λειτουργεί με τους επεξεργαστές Jumpgate και Legacy, διατηρεί την απόσταση ανά κελί πλέγματος, ευθυγραμμίζει χάρτες με το πλέγμα και μπορεί να αναιρέσει τις τελευταίες 10 αλλαγές του.',
      },
      quickStart: {
        heading: 'Γρήγορη εκκίνηση',
        steps: [
          'Ανοίξτε το φυλλάδιο Resizer - Command Deck ή πληκτρολογήστε !resizer για το μενού.',
          'Για αλλαγή μεγέθους πιονιών, επιλέξτε τα και πατήστε Αλλαγή μεγέθους ή Μέγεθος πλάσματος.',
          'Για κλιμάκωση σελίδας, πηγαίνετε σε αυτή και πατήστε Κλιμάκωση σελίδας· το 2 διπλασιάζει τα πάντα, το 0.5 τα υποδιπλασιάζει.',
          'Για να ταιριάξετε έναν χάρτη στο πλέγμα, σχεδιάστε ένα ορθογώνιο πάνω σε μερικά τετράγωνα του χάρτη, επιλέξτε το μαζί με τον χάρτη και πατήστε Βαθμονόμηση χάρτη.',
          'Αλλάξατε γνώμη; Πατήστε Αναίρεση.',
        ],
      },
      zoom: {
        heading: 'Κλιμάκωση σελίδων',
        intro:
          'Η κλιμάκωση μεγαλώνει ή μικραίνει μια σελίδα και ό,τι έχει πάνω της γύρω από την πάνω αριστερή γωνία της. Τα κελιά του πλέγματος μεγαλώνουν ή μικραίνουν, αλλά κάθε κελί αντιστοιχεί πάντα στην ίδια απόσταση (τα 5 πόδια μένουν 5 πόδια), οπότε χάρακες, αύρες, φως πιονιών και όραση μετρούν το ίδιο.',
        points: [
          'Μετακινεί και κλιμακώνει πιόνια, γραφικά χαρτών, σχέδια Jumpgate και Legacy, κείμενο, τοίχους δυναμικού φωτισμού, πόρτες και παράθυρα, καθώς και τη μετατόπιση του πλέγματος.',
          'Ο συντελεστής μπορεί να είναι 2, 0.5, 150%, 1/2 ή "to 140" για κελιά 140 px.',
          'Η διατήρηση μεγέθους πιονιών (ρύθμιση ή --keep-tokens) μετακινεί τα πιόνια μαζί με τον χάρτη αλλά δεν αλλάζει το μέγεθός τους.',
          'Το πάχος γραμμών των σχεδίων κλιμακώνεται μαζί με τη σελίδα εκτός αν η ρύθμιση είναι ανενεργή· οι τοίχοι κρατούν το πάχος τους.',
          'Τα σχέδια Legacy ξανασχεδιάζονται στο νέο μέγεθος (το Jumpgate δεν ξανασχεδιάζει σχέδιο Legacy που αλλάζει ένα Mod), οπότε παίρνουν νέα ID.',
        ],
      },
      calibrate: {
        heading: 'Ταίριασμα χάρτη στο πλέγμα',
        intro:
          'Πολλοί χάρτες σχεδιάζονται με δικό τους πλέγμα σε δικό τους μέγεθος. Η βαθμονόμηση κλιμακώνει τον χάρτη ώστε τα τετράγωνά του να ταιριάζουν με τα κελιά της σελίδας και τον μετακινεί ώστε να συμπίπτουν οι γραμμές.',
        steps: [
          'Βάλτε τον χάρτη στη σελίδα και σχεδιάστε ένα ορθογώνιο (με οποιοδήποτε εργαλείο σχεδίασης) πάνω σε μερικά τετράγωνα του χάρτη, από γραμμή σε γραμμή.',
          'Επιλέξτε μαζί τον χάρτη και το ορθογώνιο (Shift-κλικ).',
          'Πατήστε Βαθμονόμηση χάρτη και απαντήστε πόσα τετράγωνα καλύπτει το πλαίσιο κατά πλάτος και καθ’ ύψος.',
          'Ο χάρτης κλιμακώνεται και μετακινείται ώστε αυτά τα τετράγωνα να ταιριάζουν ακριβώς στο πλέγμα της σελίδας· το πλαίσιο διαγράφεται.',
        ],
        points: [
          'Η Βαθμονόμηση και προσαρμογή σελίδας μετακινεί επίσης τον χάρτη στη γωνία της σελίδας και αλλάζει το μέγεθος της σελίδας ώστε να τον χωράει.',
          'Η Βαθμονόμηση με pixel παραλείπει το πλαίσιο: δώστε το μέγεθος τετραγώνου του χάρτη σε pixel όπως είναι σχεδιασμένος τώρα.',
          'Μεγαλύτερο πλαίσιο (περισσότερα τετράγωνα) δίνει πιο ακριβές ταίριασμα.',
        ],
      },
      sizes: {
        heading: 'Μεγέθη πλασμάτων',
        intro:
          'Το size ορίζει στα πιόνια μέγεθος πλάσματος σε κελιά του πλέγματος της σελίδας τους.',
        colSize: 'Μέγεθος',
        colCommand: 'Εντολή',
        colCells: 'Κελιά',
        cells: '{cells} × {cells}',
      },
      pages: {
        heading: 'Πολλές σελίδες μαζί',
        points: [
          'Η Επιλογή σελίδων ανοίγει λίστα με όλες τις σελίδες· τσεκάρετε όσες θέλετε και πατήστε Κλιμάκωση τσεκαρισμένων.',
          'Με εντολή: zoom 2 --pages all, --pages picked, --pages current ή ονόματα και ID χωρισμένα με κόμματα (--pages Town, Docks).',
          'Μία αναίρεση ακυρώνει ολόκληρη την ομάδα.',
        ],
      },
      undo: {
        heading: 'Αναίρεση',
        points: [
          'Κάθε αλλαγή (μέγεθος, προσαρμογή, κεντράρισμα, βαθμονόμηση, μέγεθος σελίδας, κλιμάκωση) αναιρείται.',
          'Οι τελευταίες 10 αλλαγές αποθηκεύονται με το παιχνίδι, οπότε αντέχουν σε επανεκκίνηση του sandbox των Mod.',
          'Αντικείμενα που διαγράφηκαν μετά την αλλαγή αναφέρονται και παραλείπονται.',
          'Πολύ μεγάλες αλλαγές (χιλιάδες αντικείμενα) ίσως δεν χωρούν στο ιστορικό· το Resizer θα το πει.',
        ],
      },
      commands: {
        heading: 'Εντολές',
        intro:
          'Πληκτρολογήστε {command} με μία από αυτές. Τα !resizer και !rsz λειτουργούν επίσης πάντα.',
        colCommand: 'Εντολή',
        colDesc: 'Τι κάνει',
      },
      settings: {
        heading: 'Ρυθμίσεις',
        intro: 'Αλλάξτε τις από την κάρτα Ρυθμίσεων ή με set <setting> <value>.',
        colKey: 'Ρύθμιση',
        colDesc: 'Τι κάνει',
        rows: {
          language: 'Γλώσσα για μενού, μηνύματα και φυλλάδια.',
          command: 'Ένα επιπλέον όνομα για την εντολή (η 0.0.9 σας άφηνε να τη μετονομάσετε).',
          keepTokenSize: 'Η κλιμάκωση μετακινεί τα πιόνια αλλά κρατά το μέγεθός τους.',
          scaleStrokes:
            'Η κλιμάκωση αλλάζει το πάχος γραμμών των σχεδίων (οι τοίχοι κρατούν το δικό τους).',
          deleteCalibrationBox: 'Η βαθμονόμηση διαγράφει το πλαίσιο που μέτρησε.',
        },
      },
      api: {
        heading: 'Για δημιουργούς Mod',
        intro: 'Άλλα Mod μπορούν να χρησιμοποιούν το καθολικό αντικείμενο Resizer.',
        colFunction: 'Συνάρτηση',
        colDesc: 'Τι κάνει',
        rows: {
          zoomPage:
            'Κλιμακώνει μια σελίδα με ό,τι έχει πάνω της, με αναίρεση. Το options.keepTokens κρατά το μέγεθος των πιονιών.',
          undo: 'Αναιρεί την πιο πρόσφατη αλλαγή.',
          onZoom:
            'Καλεί τη συνάρτησή σας μετά από κάθε κλιμάκωση (και με 1/factor μετά την αναίρεσή της), ώστε ένα Mod που αποθηκεύει θέσεις σε σελίδα να ακολουθεί.',
          history: 'Επιστρέφει λίστα με τις αλλαγές που αναιρούνται.',
        },
      },
      upgrading: {
        heading: 'Αναβάθμιση από 0.0.9',
        points: [
          'Αντικαταστήστε το παλιό script με αυτό· η μετονομασμένη εντολή σας διατηρείται.',
          'Οι παλιές εντολές λειτουργούν ακόμη και κάνουν ό,τι οι νέες παρακάτω.',
          'Το scale δεν αλλάζει πια την απόσταση ανά κελί (ένα κελί 5 ποδιών μένει 5 πόδια).',
        ],
        colOld: '0.0.9',
        colNew: '1.0',
      },
      troubleshooting: {
        heading: 'Αντιμετώπιση προβλημάτων',
        points: [
          'Άλλα Mod που θυμούνται θέσεις σε μια σελίδα (διαδρομές περιπολίας, θέσεις πιονιών, αποθηκευμένες περιοχές) δεν ενημερώνονται για μια κλιμάκωση εκτός αν χρησιμοποιούν το Resizer.onZoom· ελέγξτε τα μετά την κλιμάκωση.',
          'Οι εξαγωνικές σελίδες κλιμακώνονται όπως οι τετραγωνικές, αλλά ελέγξτε ότι τα πιόνια κάθονται ακόμη στα εξάγωνά τους.',
          'Αν ένα σχέδιο φαίνεται εκτός θέσης αμέσως μετά από κλιμάκωση, ανανεώστε τη σελίδα: το Roll20 μερικές φορές ξανασχεδιάζει καθυστερημένα.',
          'Η βαθμονόμηση θέλει τον χάρτη ευθεία προς τη σελίδα· στρέψτε τον πρώτα σε 0°, 90°, 180° ή 270°.',
        ],
      },
      languages: {
        heading: 'Γλώσσες',
        body: 'Επιλέξτε γλώσσα στην κάρτα Ρυθμίσεων, με set language <code> ή στις ρυθμίσεις του Mod.',
        colLanguage: 'Γλώσσα',
        colNative: 'Εγγενές όνομα',
        colCode: 'Κωδικός',
      },
      credits: {
        heading: 'Συντελεστές',
        original: 'Αρχικό Mod από',
        maintainer: 'Ξαναγράφτηκε και συντηρείται από',
        thread: 'Θέμα στο φόρουμ',
        support:
          'Βρήκατε πρόβλημα ή έχετε μια ιδέα; Γράψτε στο θέμα του φόρουμ ή ανοίξτε ένα αίτημα στο GitHub.',
      },
    },
  };

  var localeHe = {
    titles: {
      ready: 'Resizer מוכן.',
      history: 'Resizer - היסטוריה',
      pages: 'Resizer - עמודים',
      settings: 'Resizer - הגדרות',
      help: 'Resizer - עזרה',
    },
    menu: {
      selected: 'נבחרו',
      nothingSelected: 'לא נבחר דבר. בחרו קודם אסימונים, מפה או ציורים.',
      graphicSize: '{name}: {width} × {height} px ({across} × {down} משבצות)',
      andMore: '…ועוד {count}.',
      map: 'מפה',
      mapHint: 'ציירו מלבן מעל כמה מהמשבצות של המפה עצמה, בחרו אותו ואת המפה, ואז כיילו.',
      page: 'עמוד',
      pageSize: '{across} × {down} משבצות, {cell} px למשבצת, {scale} {units} למשבצת',
      pageCells: '{across} × {down} משבצות',
      historyEmpty: 'עדיין אין מה לבטל.',
      historyHint: 'ביטול מחזיר קודם את השינוי האחרון.',
      minutesAgo: 'לפני {minutes} דק׳',
      pickerHint: 'סמנו את העמודים לזום משותף, ואז לחצו על זום לעמודים המסומנים.',
      on: 'פעיל',
      off: 'כבוי',
      handouts: 'עזרה מלאה בדפי המידע:',
    },
    kinds: {
      graphic: 'גרפיקה',
      text: 'טקסט',
      pathv2: 'ציור',
      path: 'ציור',
      door: 'דלת',
      window: 'חלון',
    },
    sizes: {
      tiny: 'זעיר',
      small: 'קטן',
      medium: 'בינוני',
      large: 'גדול',
      huge: 'ענק',
      gargantuan: 'עצום',
    },
    units: {
      px: 'px',
      cells: 'משבצות',
      units: 'יחידות עמוד',
    },
    buttons: {
      menu: 'תפריט',
      resize: 'שינוי גודל',
      creatureSize: 'גודל יצור',
      fit: 'התאמה לעמוד',
      centre: 'מרכוז',
      sizes: 'הצגת גדלים',
      calibrate: 'כיול מפה',
      calibrateFit: 'כיול והתאמת עמוד',
      calibratePx: 'כיול לפי פיקסלים',
      zoom: 'זום לעמוד',
      zoomIn: 'זום ×2',
      zoomOut: 'זום ×½',
      resizePage: 'שינוי גודל עמוד',
      pageSize: 'גודל עמוד',
      pages: 'בחירת עמודים',
      zoomPicked: 'זום לעמודים המסומנים ({count})',
      pickAll: 'סימון הכול',
      pickNone: 'ביטול הסימון',
      undo: 'ביטול',
      undoWhat: 'ביטול: {what}',
      history: 'היסטוריה',
      clearHistory: 'ניקוי היסטוריה',
      settings: 'הגדרות',
      help: 'עזרה',
      resetSettings: 'איפוס הגדרות',
      rebuild: 'בנייה מחדש של דפי המידע',
    },
    queries: {
      width: 'רוחב',
      height: 'גובה',
      unit: 'יחידה',
      unitPx: 'פיקסלים',
      unitCells: 'משבצות רשת',
      unitUnits: 'יחידות עמוד (70 px)',
      creatureSize: 'גודל יצור',
      keepShape: 'לשמור על הצורה?',
      yes: 'כן',
      no: 'לא - למתוח לגודל העמוד',
      centre: 'מרכוז',
      both: 'בשני הכיוונים',
      across: 'משבצות לרוחב המלבן',
      down: 'לגובה בלבד',
      downCount: 'משבצות לגובה המלבן',
      squarePx: 'פיקסלים למשבצת במפה כעת',
      factor: 'מקדם זום (2 = פי שניים; 0.5 = חצי)',
      tokens: 'אסימונים',
      tokensScale: 'לשנות יחד עם העמוד',
      tokensKeep: 'לשמור על גודלם',
      language: 'שפה',
      command: 'שם הפקודה בלי !',
    },
    settings: {
      language: 'שפה',
      command: 'פקודה',
      keepTokenSize: 'שמירת גודל האסימונים בזום',
      scaleStrokes: 'שינוי עובי הקווים של ציורים',
      deleteCalibrationBox: 'מחיקת מלבן הכיול',
    },
    history: {
      change: 'שינוי',
      zoom: 'זום ×{factor} בעמוד {page}',
      zoomPages: 'זום ×{factor} ב-{count} עמודים',
      size: 'שינוי גודל של {count} גרפיקות',
      size_one: 'שינוי גודל של גרפיקה אחת',
      page: 'עמוד {page} לגודל {width} × {height} יחידות',
      fit: 'התאמת {count} גרפיקות לעמוד',
      fit_one: 'התאמת גרפיקה אחת לעמוד',
      centre: 'מרכוז {count} עצמים',
      centre_one: 'מרכוז עצם אחד',
      calibrate: 'כיול המפה {name}',
      calibrateUnnamed: 'כיול המפה',
    },
    messages: {
      welcome: 'בחרו משהו ופתחו את התפריט כדי לשנות את גודלו, או עשו זום לעמוד שלם.',
      upgraded: 'שודרג מ-Resizer 0.0.9. הפקודה שלכם {command} והפקודות הישנות עדיין עובדות.',
      readyHint: 'הקלידו {command} לתפריט, או פתחו את דף המידע Resizer - Command Deck.',
      zoomed: 'בוצע זום ×{factor} לעמוד {page}: {objects} עצמים זזו יחד איתו.',
      zoomedPages: 'בוצע זום ×{factor} ל-{count} עמודים ({page}): {objects} עצמים זזו יחד איתם.',
      skipped: 'לא ניתן היה לקרוא {count} עצמים והם נשארו ללא שינוי.',
      skipped_one: 'לא ניתן היה לקרוא עצם אחד והוא נשאר ללא שינוי.',
      resized: 'הגודל של {count} גרפיקות שונה ל-{width} × {height} {unit}.',
      resized_one: 'הגודל של גרפיקה אחת שונה ל-{width} × {height} {unit}.',
      sized: 'הגודל של {count} גרפיקות שונה ל-{size}.',
      sized_one: 'הגודל של גרפיקה אחת שונה ל-{size}.',
      pageResized: 'גודל {page} הוא כעת {size}.',
      fitted: '{count} גרפיקות הותאמו לעמוד.',
      fitted_one: 'גרפיקה אחת הותאמה לעמוד.',
      centred: '{count} עצמים מורכזו בעמוד.',
      centred_one: 'עצם אחד מורכז בעמוד.',
      calibrated:
        'בוצע כיול: למפה היו משבצות של {square} px; כעת היא בקנה מידה ×{scale} למשבצות של {cell} px ומיושרת לרשת.',
      calibratedPage: 'העמוד הוא כעת {width} × {height} יחידות כדי להכיל את המפה.',
      boxRemoved: 'מלבן הכיול נמחק (ביטול מחזיר אותו).',
      undone: 'בוטל: {what}.',
      undoMissing: '{count} עצמים נמחקו מאז, ולכן לא ניתן היה להחזיר אותם.',
      undoMissing_one: 'עצם אחד נמחק מאז, ולכן לא ניתן היה להחזיר אותו.',
      notStored: 'השינוי הזה גדול מדי לשמירה בהיסטוריית הביטול.',
      historyCleared: '{count} שינויים נשכחו.',
      historyCleared_one: 'שינוי אחד נשכח.',
      settingChanged: '{key} הוא כעת {value}.',
      settingsReset: 'ההגדרות חזרו לברירת המחדל. היסטוריית הביטול נשמרה.',
      handoutsRebuilt: 'דפי המידע של העזרה ושל Command Deck נבנו מחדש.',
    },
    errors: {
      unexpected: 'משהו השתבש: {message}',
      unknownCommand: 'פקודה לא מוכרת "{command}". הקלידו {help} לרשימת הפקודות.',
      noSelection: 'בחרו משהו קודם (או ציינו --ids).',
      unknownIds: 'אין עצמים עם המזהים האלה: {ids}',
      noGraphics: 'אף אחד מהעצמים שנבחרו לא ניתן לשינוי בדרך זו. בחרו אסימונים או מפה.',
      badSize: 'ציינו רוחב וגובה גדולים מ-0, למשל size 140 140 px.',
      badCreatureSize: 'גודל לא מוכר. השתמשו ב-tiny, small, medium, large, huge או gargantuan.',
      badPageSize: 'ציינו רוחב וגובה של עמוד בין 1 ל-{max} יחידות.',
      badFactor: 'ציינו מקדם זום בין {min} ל-{max}.',
      badFactorText: 'לא ניתן לקרוא את "{text}" כמקדם זום. נסו 2, 0.5, 150%, 1/2 או "to 140".',
      factorOne: 'זום של 1 לא משנה דבר.',
      pageTooBig: '{page} היה נעשה קטן מיחידה אחת או גדול מ-{max} יחידות.',
      noPage: 'העמוד לא נמצא.',
      noPages: 'אין עמודים לשינוי. סמנו כמה בבחירת העמודים, או ציינו --pages.',
      unknownPages: 'אין עמודים בשם: {pages}',
      noMap: 'בחרו גם את גרפיקת המפה.',
      noBox: 'בחרו יחד עם המפה מלבן שצויר מעל כמה מהמשבצות שלה, או השתמשו ב-calibrate --cell <px>.',
      boxUnreadable: 'לא ניתן לקרוא את הגודל של הציור שנבחר.',
      boxTooSmall: 'מלבן הכיול קטן מדי. ציירו אותו מעל משבצת שלמה אחת או יותר.',
      badCount: 'ציינו את מספר המשבצות לרוחב (ולגובה) המלבן, למשל 3 או 3 2.',
      badSquarePx: 'ציינו את גודל המשבצת של המפה בפיקסלים, 2 או יותר.',
      mapRotated: 'סובבו את המפה כך שתהיה ישרה ביחס לעמוד (0°, 90°, 180° או 270°) לפני הכיול.',
      nothingToUndo: 'אין מה לבטל.',
      badSetting: 'הגדרה לא מוכרת "{key}". הגדרות: {settings}',
      badValue: '"{value}" אינו ערך ש-{key} מקבל.',
    },
    help: {
      menu: 'פתיחת התפריט; כשנבחרו עצמים הוא מציג את הגדלים שלהם.',
      size: 'שינוי גודל הגרפיקות שנבחרו (בפיקסלים כברירת מחדל).',
      creature: 'שינוי גודל האסימונים שנבחרו לגודל יצור, במשבצות רשת.',
      fit: 'התאמת הגרפיקות שנבחרו לעמוד; --keep-ratio שומר על הצורה שלהן.',
      center: 'מרכוז הגרפיקות או הטקסט שנבחרו בעמוד.',
      calibrate:
        'שינוי קנה המידה של המפה שנבחרה כך שהמשבצות בתוך המלבן שנבחר יתאימו לרשת העמוד, ואז יישור שלהן.',
      calibrateCell: 'שינוי קנה המידה של המפה שנבחרה לפי גודל המשבצת שלה בפיקסלים.',
      page: 'הצגת גודל העמוד, או שינוי גודל העמוד (לא של מה שעליו).',
      zoom: 'זום לעמודים עם כל מה שעליהם; המרחק לכל משבצת נשמר.',
      pages: 'פתיחת בחירת העמודים, או סימון עמודים, לזום לכמה עמודים בבת אחת.',
      undo: 'ביטול השינוי האחרון (10 האחרונים נשמרים).',
      history: 'רשימת השינויים שאפשר לבטל; clear שוכח אותם.',
      settings: 'הצגה או שינוי של ההגדרות.',
      reset: 'החזרת ההגדרות לברירת המחדל.',
      journal: 'בנייה מחדש של דפי המידע של העזרה ושל Command Deck.',
      help: 'הצגת הרשימה הזו.',
    },
    deck: {
      menuTitle: 'תפריט',
      menuDesc: 'התפריט הראשי מציג את הבחירה, את העמוד ואת מה שאפשר לבטל.',
      selectedTitle: 'אסימונים וגרפיקות שנבחרו',
      selectedDesc: 'בחרו קודם, ואז לחצו על כפתור.',
      mapTitle: 'מפה',
      mapDesc: 'בחרו את המפה ומלבן שצויר מעל כמה מהמשבצות שלה.',
      pageTitle: 'עמוד',
      pageDesc: 'זום לעמוד שבו אתם נמצאים עם כל מה שעליו.',
      historyTitle: 'היסטוריה',
      historyDesc: 'ביטול מחזיר את השינוי האחרון.',
      footer: 'הוראות מלאות נמצאות בדף המידע {help}.',
    },
    handout: {
      versionLabel: 'גרסה',
      subtitle: 'שינוי גודל של אסימונים, מפות ועמודים שלמים',
      footer: 'כפתורים לכל פעולה נמצאים בדף המידע {deck}.',
      overview: {
        heading: 'סקירה',
        body: 'Resizer משנה את הגודל של אסימונים ומפות שנבחרו, משנה את גודל העמודים ועושה זום לעמוד שלם עם כל מה שעליו: מפה, אסימונים, ציורים, טקסט, קירות, דלתות וחלונות. הוא עובד עם העורכים Jumpgate ו-Legacy, שומר על המרחק לכל משבצת ברשת, מיישר מפות לרשת ויכול לבטל את 10 השינויים האחרונים שלו.',
      },
      quickStart: {
        heading: 'התחלה מהירה',
        steps: [
          'פתחו את דף המידע Resizer - Command Deck, או הקלידו !resizer לתפריט.',
          'כדי לשנות גודל של אסימונים, בחרו אותם ולחצו על שינוי גודל או גודל יצור.',
          'כדי לעשות זום לעמוד, עברו אליו ולחצו על זום לעמוד; 2 מכפיל הכול, 0.5 מקטין הכול בחצי.',
          'כדי להתאים מפה לרשת, ציירו מלבן מעל כמה ממשבצות המפה, בחרו אותו ואת המפה, ולחצו על כיול מפה.',
          'התחרטתם? לחצו על ביטול.',
        ],
      },
      zoom: {
        heading: 'זום לעמודים',
        intro:
          'זום משנה את קנה המידה של עמוד ושל כל מה שעליו סביב הפינה השמאלית העליונה שלו. משבצות הרשת גדלות או קטנות, אבל כל משבצת עדיין מייצגת את אותו מרחק (5 רגל נשארים 5 רגל), כך שסרגלים, הילות, אורות של אסימונים וראייה נמדדים כמו קודם.',
        points: [
          'מזיז ומשנה את קנה המידה של אסימונים, גרפיקות מפה, ציורי Jumpgate ו-Legacy, טקסט, קירות של תאורה דינמית, דלתות וחלונות, וגם את היסט הרשת.',
          'המקדם יכול להיות 2, 0.5, 150%, 1/2, או "to 140" למשבצות של 140 px.',
          'שמירת גודל האסימונים (הגדרה או --keep-tokens) מזיזה את האסימונים עם המפה אבל לא משנה את גודלם.',
          'עובי הקווים של ציורים משתנה עם העמוד, אלא אם ההגדרה כבויה; הקירות שומרים על העובי שלהם.',
          'ציורי Legacy מצוירים מחדש בגודל החדש (Jumpgate לא מצייר מחדש ציור Legacy ש-Mod משנה), ולכן הם מקבלים מזהים חדשים.',
        ],
      },
      calibrate: {
        heading: 'התאמת מפה לרשת',
        intro:
          'מפות רבות מצוירות עם רשת משלהן בגודל משלהן. כיול משנה את קנה המידה של המפה כך שהמשבצות שלה יתאימו למשבצות העמוד, ומזיז אותה כך שהקווים ייפגשו.',
        steps: [
          'שימו את המפה בעמוד וציירו מלבן (בכל כלי ציור) מעל כמה ממשבצות המפה, מקו לקו.',
          'בחרו את המפה ואת המלבן יחד (Shift-לחיצה).',
          'לחצו על כיול מפה וענו כמה משבצות המלבן מכסה לרוחב ולגובה.',
          'המפה משנה קנה מידה וזזה כך שהמשבצות האלה מתאימות בדיוק לרשת העמוד; המלבן נמחק.',
        ],
        points: [
          'כיול והתאמת עמוד גם מזיז את המפה לפינת העמוד ומשנה את גודל העמוד כך שיתאים לה.',
          'כיול לפי פיקסלים מוותר על המלבן: ציינו את גודל המשבצת של המפה בפיקסלים כפי שהיא מצוירת עכשיו.',
          'מלבן גדול יותר (יותר משבצות) נותן התאמה מדויקת יותר.',
        ],
      },
      sizes: {
        heading: 'גדלי יצורים',
        intro: 'הפקודה size קובעת לאסימונים גודל יצור במשבצות הרשת של העמוד שלהם.',
        colSize: 'גודל',
        colCommand: 'פקודה',
        colCells: 'משבצות',
        cells: '{cells} × {cells}',
      },
      pages: {
        heading: 'כמה עמודים בבת אחת',
        points: [
          'בחירת עמודים פותחת רשימה של כל העמודים; סמנו את אלה שאתם רוצים ולחצו על זום לעמודים המסומנים.',
          'בהקלדה: zoom 2 --pages all, --pages picked, --pages current, או שמות ומזהים מופרדים בפסיקים (--pages Town, Docks).',
          'ביטול אחד מחזיר את כל הקבוצה.',
        ],
      },
      undo: {
        heading: 'ביטול',
        points: [
          'כל שינוי (שינוי גודל, התאמה, מרכוז, כיול, גודל עמוד, זום) ניתן לביטול.',
          '10 השינויים האחרונים נשמרים עם המשחק, כך שהם שורדים הפעלה מחדש של ארגז החול של ה-Mods.',
          'עצמים שנמחקו מאז השינוי מדווחים ומדולגים.',
          'שינויים גדולים מאוד (אלפי עצמים) עלולים להיות גדולים מדי לשמירה; Resizer יודיע על כך.',
        ],
      },
      commands: {
        heading: 'פקודות',
        intro: 'הקלידו {command} עם אחת מאלה. גם !resizer ו-!rsz תמיד עובדות.',
        colCommand: 'פקודה',
        colDesc: 'מה היא עושה',
      },
      settings: {
        heading: 'הגדרות',
        intro: 'שנו אותן מכרטיס ההגדרות או עם set <setting> <value>.',
        colKey: 'הגדרה',
        colDesc: 'מה היא עושה',
        rows: {
          language: 'שפה לתפריטים, להודעות ולדפי המידע.',
          command: 'שם נוסף לפקודה (0.0.9 אפשרה לשנות את שמה).',
          keepTokenSize: 'הזום מזיז אסימונים אבל שומר על גודלם.',
          scaleStrokes: 'הזום משנה את עובי הקווים של ציורים (הקירות שומרים על שלהם).',
          deleteCalibrationBox: 'הכיול מוחק את המלבן שהוא מדד.',
        },
      },
      api: {
        heading: 'למפתחי Mods',
        intro: 'Mods אחרים יכולים להשתמש באובייקט הגלובלי Resizer.',
        colFunction: 'פונקציה',
        colDesc: 'מה היא עושה',
        rows: {
          zoomPage:
            'עושה זום לעמוד עם כל מה שעליו, עם ביטול. options.keepTokens שומר על גודל האסימונים.',
          undo: 'מבטלת את השינוי האחרון.',
          onZoom:
            'קוראת לפונקציה שלכם אחרי כל זום (ועם 1/factor אחרי ביטול שלו), כך ש-Mod ששומר מיקומים בעמוד יכול להתעדכן.',
          history: 'מחזירה רשימה של השינויים שאפשר לבטל.',
        },
      },
      upgrading: {
        heading: 'שדרוג מ-0.0.9',
        points: [
          'החליפו את הסקריפט הישן בזה; הפקודה ששיניתם את שמה נשמרת.',
          'הפקודות הישנות עדיין עובדות ועושות את מה שהחדשות שלהלן עושות.',
          'scale כבר לא משנה את המרחק לכל משבצת (משבצת של 5 רגל נשארת 5 רגל).',
        ],
        colOld: '0.0.9',
        colNew: '1.0',
      },
      troubleshooting: {
        heading: 'פתרון בעיות',
        points: [
          'Mods אחרים שזוכרים מיקומים בעמוד (מסלולי סיור, מקומות של אסימונים, אזורים שמורים) לא מקבלים הודעה על זום אלא אם הם משתמשים ב-Resizer.onZoom; בדקו אותם אחרי הזום.',
          'עמודי משושים עוברים זום כמו עמודי משבצות, אבל בדקו שהאסימונים עדיין יושבים במשושים שלהם.',
          'אם ציור נראה לא במקומו מיד אחרי זום, טענו מחדש את הדף: Roll20 לפעמים מצייר מחדש באיחור.',
          'הכיול דורש שהמפה תהיה ישרה ביחס לעמוד; סובבו אותה קודם ל-0°, 90°, 180° או 270°.',
        ],
      },
      languages: {
        heading: 'שפות',
        body: 'בחרו שפה בכרטיס ההגדרות, עם set language <code>, או בהגדרות ה-Mod.',
        colLanguage: 'שפה',
        colNative: 'שם בשפת המקור',
        colCode: 'קוד',
      },
      credits: {
        heading: 'קרדיטים',
        original: 'ה-Mod המקורי מאת',
        maintainer: 'נכתב מחדש ומתוחזק על ידי',
        thread: 'שרשור בפורום',
        support: 'מצאתם בעיה או שיש לכם רעיון? כתבו בשרשור בפורום או פתחו דיווח ב-GitHub.',
      },
    },
  };

  var localeHu = {
    titles: {
      ready: 'A Resizer készen áll.',
      history: 'Resizer – előzmények',
      pages: 'Resizer – oldalak',
      settings: 'Resizer – beállítások',
      help: 'Resizer – súgó',
    },
    menu: {
      selected: 'Kijelölve',
      nothingSelected: 'Nincs kijelölés. Előbb jelölj ki tokeneket, egy térképet vagy rajzokat.',
      graphicSize: '{name}: {width} × {height} px ({across} × {down} mező)',
      andMore: '…és még {count}.',
      map: 'Térkép',
      mapHint:
        'Rajzolj téglalapot a térkép néhány saját négyzetére, jelöld ki a térképpel együtt, majd kalibrálj.',
      page: 'Oldal',
      pageSize: '{across} × {down} mező, mezőnként {cell} px, mezőnként {scale} {units}',
      pageCells: '{across} × {down} mező',
      historyEmpty: 'Még nincs mit visszavonni.',
      historyHint: 'A Visszavonás a legújabb módosítással kezdi.',
      minutesAgo: '{minutes} perce',
      pickerHint:
        'Pipáld ki az együtt skálázandó oldalakat, majd nyomd meg a Kipipált oldalak skálázása gombot.',
      on: 'Be',
      off: 'Ki',
      handouts: 'A teljes súgó a segédanyagokban:',
    },
    kinds: {
      graphic: 'Grafika',
      text: 'Szöveg',
      pathv2: 'Rajz',
      path: 'Rajz',
      door: 'Ajtó',
      window: 'Ablak',
    },
    sizes: {
      tiny: 'Apró',
      small: 'Kicsi',
      medium: 'Közepes',
      large: 'Nagy',
      huge: 'Hatalmas',
      gargantuan: 'Óriási',
    },
    units: {
      px: 'px',
      cells: 'mező',
      units: 'oldalegység',
    },
    buttons: {
      menu: 'Menü',
      resize: 'Átméretezés',
      creatureSize: 'Lényméret',
      fit: 'Igazítás az oldalhoz',
      centre: 'Középre',
      sizes: 'Méretek mutatása',
      calibrate: 'Térkép kalibrálása',
      calibrateFit: 'Kalibrálás és oldalhoz igazítás',
      calibratePx: 'Kalibrálás pixelekkel',
      zoom: 'Oldal skálázása',
      zoomIn: 'Skálázás ×2',
      zoomOut: 'Skálázás ×½',
      resizePage: 'Oldal átméretezése',
      pageSize: 'Oldalméret',
      pages: 'Oldalak választása',
      zoomPicked: 'Kipipált oldalak skálázása ({count})',
      pickAll: 'Mind kipipálása',
      pickNone: 'Pipák törlése',
      undo: 'Visszavonás',
      undoWhat: 'Visszavonás: {what}',
      history: 'Előzmények',
      clearHistory: 'Előzmények törlése',
      settings: 'Beállítások',
      help: 'Súgó',
      resetSettings: 'Beállítások visszaállítása',
      rebuild: 'Segédanyagok újraépítése',
    },
    queries: {
      width: 'Szélesség',
      height: 'Magasság',
      unit: 'Mértékegység',
      unitPx: 'Pixel',
      unitCells: 'Rácsmező',
      unitUnits: 'Oldalegység (70 px)',
      creatureSize: 'Lényméret',
      keepShape: 'Megmaradjon az alak?',
      yes: 'Igen',
      no: 'Nem - nyújtás az oldalra',
      centre: 'Középre',
      both: 'Mindkét irányban',
      across: 'Négyzetek a keret szélességében',
      down: 'Csak függőlegesen',
      downCount: 'Négyzetek a keret magasságában',
      squarePx: 'Pixel négyzetenként a térképen most',
      factor: 'Skálázási tényező (2 = kétszer akkora; 0.5 = fele)',
      tokens: 'Tokenek',
      tokensScale: 'Skálázás az oldallal',
      tokensKeep: 'Méretük megtartása',
      language: 'Nyelv',
      command: 'Parancs neve ! nélkül',
    },
    settings: {
      language: 'Nyelv',
      command: 'Parancs',
      keepTokenSize: 'Tokenméret megtartása skálázáskor',
      scaleStrokes: 'Rajzok vonalvastagságának skálázása',
      deleteCalibrationBox: 'Kalibrálókeret törlése',
    },
    history: {
      change: 'Módosítás',
      zoom: 'Skálázás ×{factor} – oldal: {page}',
      zoomPages: 'Skálázás ×{factor} – {count} oldal',
      size: '{count} grafika átméretezése',
      size_one: '1 grafika átméretezése',
      page: 'Oldal: {page} → {width} × {height} egység',
      fit: '{count} grafika igazítása az oldalhoz',
      fit_one: '1 grafika igazítása az oldalhoz',
      centre: '{count} objektum középre helyezése',
      centre_one: '1 objektum középre helyezése',
      calibrate: 'Térkép kalibrálása: {name}',
      calibrateUnnamed: 'A térkép kalibrálása',
    },
    messages: {
      welcome:
        'Jelölj ki valamit és nyisd meg a menüt az átméretezéshez, vagy skálázz egy egész oldalt.',
      upgraded:
        'Frissítve a Resizer 0.0.9-es verziójáról. A(z) {command} parancsod és a régi parancsok továbbra is működnek.',
      readyHint:
        'Írd be: {command} a menühöz, vagy nyisd meg a Resizer - Command Deck segédanyagot.',
      zoomed: 'Skálázva ×{factor} – oldal: {page}; vele mozgott {objects} objektum.',
      zoomedPages: '{count} oldal skálázva ×{factor} ({page}); velük mozgott {objects} objektum.',
      skipped: '{count} objektumot nem sikerült beolvasni, ezért változatlanok maradtak.',
      skipped_one: '1 objektumot nem sikerült beolvasni, ezért változatlan maradt.',
      resized: '{count} grafika átméretezve: {width} × {height} {unit}.',
      resized_one: '1 grafika átméretezve: {width} × {height} {unit}.',
      sized: '{count} grafika átméretezve: {size}.',
      sized_one: '1 grafika átméretezve: {size}.',
      pageResized: 'Oldal: {page} – új méret: {size}.',
      fitted: '{count} grafika az oldalhoz igazítva.',
      fitted_one: '1 grafika az oldalhoz igazítva.',
      centred: '{count} objektum középre helyezve az oldalon.',
      centred_one: '1 objektum középre helyezve az oldalon.',
      calibrated:
        'Kalibrálva: a térkép négyzetei {square} px-esek voltak; most ×{scale} skálázva {cell} px-es mezőkre, és a rácshoz igazítva.',
      calibratedPage: 'Az oldal most {width} × {height} egység, hogy elférjen rajta a térkép.',
      boxRemoved: 'A kalibrálókeret törölve (a Visszavonás visszahozza).',
      undone: 'Visszavonva: {what}.',
      undoMissing: '{count} objektumot azóta töröltek, ezért nem lehetett visszaállítani őket.',
      undoMissing_one: '1 objektumot azóta töröltek, ezért nem lehetett visszaállítani.',
      notStored: 'Ez a módosítás túl nagy volt ahhoz, hogy a visszavonási előzményekbe kerüljön.',
      historyCleared: '{count} módosítás elfelejtve.',
      historyCleared_one: '1 módosítás elfelejtve.',
      settingChanged: '{key} új értéke: {value}.',
      settingsReset:
        'A beállítások visszaálltak alapértékre. A visszavonási előzmények megmaradtak.',
      handoutsRebuilt: 'A Help és Command Deck segédanyagok újraépültek.',
    },
    errors: {
      unexpected: 'Valami hiba történt: {message}',
      unknownCommand: 'Ismeretlen parancs: "{command}". A parancsokért írd be: {help}.',
      noSelection: 'Előbb jelölj ki valamit (vagy add meg: --ids).',
      unknownIds: 'Nincs objektum ezekkel az azonosítókkal: {ids}',
      noGraphics:
        'A kijelölt objektumok egyike sem módosítható így. Jelölj ki tokeneket vagy egy térképet.',
      badSize: 'Adj meg 0-nál nagyobb szélességet és magasságot, például size 140 140 px.',
      badCreatureSize:
        'Ismeretlen méret. Használd ezeket: tiny, small, medium, large, huge vagy gargantuan.',
      badPageSize: 'Adj meg 1 és {max} egység közötti oldalszélességet és -magasságot.',
      badFactor: 'Adj meg {min} és {max} közötti skálázási tényezőt.',
      badFactorText:
        'A(z) "{text}" nem olvasható skálázási tényezőként. Próbáld: 2, 0.5, 150%, 1/2 vagy "to 140".',
      factorOne: 'Az 1-es skálázás semmit sem változtat.',
      pageTooBig: 'Oldal: {page} – 1 egységnél kisebb vagy {max} egységnél nagyobb lenne.',
      noPage: 'Az oldal nem található.',
      noPages:
        'Nincs módosítandó oldal. Pipálj ki néhányat az oldalválasztóban, vagy add meg: --pages.',
      unknownPages: 'Nincs ilyen nevű oldal: {pages}',
      noMap: 'Jelöld ki a térképgrafikát is.',
      noBox:
        'A térkép mellett jelölj ki egy, a térkép néhány négyzetére rajzolt téglalapot is, vagy használd: calibrate --cell <px>.',
      boxUnreadable: 'A kijelölt rajz mérete nem olvasható.',
      boxTooSmall: 'A kalibrálókeret túl kicsi. Rajzold egy vagy több teljes négyzetre.',
      badCount:
        'Add meg a keret négyzeteinek számát vízszintesen (és függőlegesen), pl. 3 vagy 3 2.',
      badSquarePx: 'Add meg a térkép négyzetméretét pixelben, legalább 2-t.',
      mapRotated:
        'Kalibrálás előtt fordítsd a térképet egyenesre az oldalhoz (0°, 90°, 180° vagy 270°).',
      nothingToUndo: 'Nincs mit visszavonni.',
      badSetting: 'Ismeretlen beállítás: "{key}". Beállítások: {settings}',
      badValue: 'A(z) "{value}" nem elfogadott érték ehhez: {key}.',
    },
    help: {
      menu: 'Megnyitja a menüt; kijelölt objektumoknál mutatja a méretüket.',
      size: 'Átméretezi a kijelölt grafikákat (alapból pixelben).',
      creature: 'A kijelölt tokeneket lényméretre állítja, rácsmezőkben.',
      fit: 'Az oldalhoz igazítja a kijelölt grafikákat; a --keep-ratio megtartja az alakjukat.',
      center: 'Középre helyezi a kijelölt grafikákat vagy szöveget az oldalon.',
      calibrate:
        'Úgy skálázza a kijelölt térképet, hogy a kijelölt keretben lévő négyzetek illeszkedjenek az oldal rácsához, majd igazítja őket.',
      calibrateCell: 'A kijelölt térképet a négyzetméretéből (pixelben) skálázza.',
      page: 'Mutatja az oldal méretét, vagy átméretezi az oldalt (nem a rajta lévőket).',
      zoom: 'Oldalakat skáláz mindennel együtt; a mezőnkénti távolság megmarad.',
      pages:
        'Megnyitja az oldalválasztót, vagy kipipál oldalakat, hogy egyszerre több oldalt skálázz.',
      undo: 'Visszavonja a legújabb módosítást (az utolsó 10 megmarad).',
      history: 'Listázza a visszavonható módosításokat; a clear elfelejti őket.',
      settings: 'Mutatja vagy módosítja a beállításokat.',
      reset: 'Visszaállítja a beállításokat alapértékre.',
      journal: 'Újraépíti a Help és Command Deck segédanyagokat.',
      help: 'Mutatja ezt a listát.',
    },
    deck: {
      menuTitle: 'Menü',
      menuDesc: 'A főmenü mutatja a kijelölést, az oldalt és azt, amit visszavonhatsz.',
      selectedTitle: 'Kijelölt tokenek és grafikák',
      selectedDesc: 'Előbb jelölj ki, aztán nyomj meg egy gombot.',
      mapTitle: 'Térkép',
      mapDesc: 'Jelöld ki a térképet és egy, a néhány négyzetére rajzolt keretet.',
      pageTitle: 'Oldal',
      pageDesc: 'Skálázd azt az oldalt, amelyen vagy, mindennel együtt.',
      historyTitle: 'Előzmények',
      historyDesc: 'A Visszavonás a legújabb módosítást vonja vissza.',
      footer: 'A teljes útmutató ebben a segédanyagban található: {help}.',
    },
    handout: {
      versionLabel: 'Verzió',
      subtitle: 'Tokenek, térképek és egész oldalak átméretezése',
      footer: 'Minden művelethez van gomb ebben a segédanyagban: {deck}.',
      overview: {
        heading: 'Áttekintés',
        body: 'A Resizer átméretezi a kijelölt tokeneket és térképeket, átméretezi az oldalakat, és egy egész oldalt skáláz mindennel együtt: térképpel, tokenekkel, rajzokkal, szöveggel, falakkal, ajtókkal és ablakokkal. Működik a Jumpgate és a Legacy szerkesztővel, megtartja a rácsmezőnkénti távolságot, a rácshoz igazítja a térképeket, és vissza tudja vonni az utolsó 10 módosítását.',
      },
      quickStart: {
        heading: 'Gyors kezdés',
        steps: [
          'Nyisd meg a Resizer - Command Deck segédanyagot, vagy írd be: !resizer a menühöz.',
          'Tokenek átméretezéséhez jelöld ki őket, és nyomd meg az Átméretezés vagy a Lényméret gombot.',
          'Oldal skálázásához menj az oldalra, és nyomd meg az Oldal skálázása gombot; a 2 mindent megdupláz, a 0.5 megfelez.',
          'Ha a térképet a rácshoz akarod igazítani, rajzolj téglalapot a térkép néhány négyzetére, jelöld ki a térképpel együtt, és nyomd meg a Térkép kalibrálása gombot.',
          'Meggondoltad magad? Nyomd meg a Visszavonás gombot.',
        ],
      },
      zoom: {
        heading: 'Oldalak skálázása',
        intro:
          'A skálázás az oldalt és mindent, ami rajta van, a bal felső sarkához képest méretezi. A rácsmezők nagyobbak vagy kisebbek lesznek, de minden mező ugyanakkora távolságot jelent (5 ft marad 5 ft), így a vonalzók, aurák, tokenfények és a látás ugyanúgy mérnek.',
        points: [
          'Mozgatja és skálázza a tokeneket, térképgrafikákat, Jumpgate és Legacy rajzokat, szöveget, a dinamikus fény falait, ajtókat és ablakokat, valamint a rács eltolását.',
          'A tényező lehet 2, 0.5, 150%, 1/2, vagy "to 140" 140 px-es mezőkhöz.',
          'A Tokenméret megtartása (beállítás vagy --keep-tokens) a térképpel mozgatja a tokeneket, de a méretüket nem változtatja.',
          'A rajzok vonalvastagsága az oldallal skálázódik, hacsak a beállítás nincs kikapcsolva; a falak megtartják vastagságukat.',
          'A Legacy rajzok az új méretben újra megrajzolódnak (a Jumpgate nem rajzolja újra a Mod által módosított Legacy rajzot), így új azonosítót kapnak.',
        ],
      },
      calibrate: {
        heading: 'Térkép igazítása a rácshoz',
        intro:
          'Sok térkép saját rácsot kapott, saját méretben. A kalibrálás úgy skálázza a térképet, hogy négyzetei illeszkedjenek az oldal mezőihez, és úgy mozgatja, hogy a vonalak találkozzanak.',
        steps: [
          'Tedd a térképet az oldalra, és rajzolj téglalapot (bármilyen rajzeszközzel) a térkép néhány négyzetére, vonaltól vonalig.',
          'Jelöld ki együtt a térképet és a téglalapot (Shift+kattintás).',
          'Nyomd meg a Térkép kalibrálása gombot, és add meg, hány négyzetet fed le a keret vízszintesen és függőlegesen.',
          'A térkép úgy skálázódik és mozdul, hogy ezek a négyzetek pontosan illeszkedjenek az oldal rácsához; a keret törlődik.',
        ],
        points: [
          'A Kalibrálás és oldalhoz igazítás a térképet az oldal sarkába is mozgatja, és az oldalt a térképhez méretezi.',
          'A Kalibrálás pixelekkel kihagyja a keretet: add meg a térkép négyzetméretét pixelben, ahogy most meg van rajzolva.',
          'Nagyobb keret (több négyzet) pontosabb illesztést ad.',
        ],
      },
      sizes: {
        heading: 'Lényméretek',
        intro: 'A méret a tokeneket lényméretre állítja az oldaluk rácsmezőiben.',
        colSize: 'Méret',
        colCommand: 'Parancs',
        colCells: 'Mezők',
        cells: '{cells} × {cells}',
      },
      pages: {
        heading: 'Több oldal egyszerre',
        points: [
          'Az Oldalak választása listát nyit az összes oldalról; pipáld ki a kívántakat, és nyomd meg a Kipipált oldalak skálázása gombot.',
          'Begépelve: zoom 2 --pages all, --pages picked, --pages current, vagy vesszővel elválasztott nevek és azonosítók (--pages Town, Docks).',
          'Egy visszavonás az egész köteget visszavonja.',
        ],
      },
      undo: {
        heading: 'Visszavonás',
        points: [
          'Minden módosítás (átméretezés, igazítás, középre helyezés, kalibrálás, oldalméret, skálázás) visszavonható.',
          'Az utolsó 10 módosítás a játékkal együtt tárolódik, így túléli a Mod-sandbox újraindítását.',
          'A módosítás óta törölt objektumokat jelzi és kihagyja.',
          'A nagyon nagy módosítások (több ezer objektum) túl nagyok lehetnek a tároláshoz; a Resizer ezt jelzi.',
        ],
      },
      commands: {
        heading: 'Parancsok',
        intro: 'Írd be: {command} és ezek egyikét. A !resizer és a !rsz is mindig működik.',
        colCommand: 'Parancs',
        colDesc: 'Mit csinál',
      },
      settings: {
        heading: 'Beállítások',
        intro: 'Ezeket a Beállítások kártyán vagy a set <setting> <value> paranccsal módosíthatod.',
        colKey: 'Beállítás',
        colDesc: 'Mit csinál',
        rows: {
          language: 'A menük, üzenetek és segédanyagok nyelve.',
          command: 'A parancs további neve (a 0.0.9 engedte átnevezni).',
          keepTokenSize: 'A skálázás mozgatja a tokeneket, de megtartja a méretüket.',
          scaleStrokes:
            'A skálázás a rajzok vonalvastagságát is méretezi (a falak megtartják a sajátjukat).',
          deleteCalibrationBox: 'A kalibrálás törli a lemért keretet.',
        },
      },
      api: {
        heading: 'Mod-készítőknek',
        intro: 'Más Modok használhatják a globális Resizer objektumot.',
        colFunction: 'Függvény',
        colDesc: 'Mit csinál',
        rows: {
          zoomPage:
            'Skáláz egy oldalt mindennel együtt, visszavonhatóan. Az options.keepTokens megtartja a tokenméreteket.',
          undo: 'Visszavonja a legújabb módosítást.',
          onZoom:
            'Minden skálázás után meghívja a függvényedet (visszavonáskor 1/factor értékkel), hogy az oldalpozíciókat tároló Mod is követni tudja.',
          history: 'Listázza a visszavonható módosításokat.',
        },
      },
      upgrading: {
        heading: 'Frissítés a 0.0.9-ről',
        points: [
          'Cseréld le a régi szkriptet erre; az átnevezett parancsod megmarad.',
          'A régi parancsok továbbra is működnek, és azt teszik, amit az alábbi újak.',
          'A scale már nem változtatja a mezőnkénti távolságot (az 5 ft-os mező 5 ft marad).',
        ],
        colOld: '0.0.9',
        colNew: '1.0',
      },
      troubleshooting: {
        heading: 'Hibaelhárítás',
        points: [
          'Más Modok, amelyek pozíciókat jegyeznek meg egy oldalon (őrjárat-útvonalak, tokenek otthonai, mentett területek), nem értesülnek a skálázásról, hacsak nem használják a Resizer.onZoom-ot; skálázás után ellenőrizd őket.',
          'A hatszöges oldalak ugyanúgy skálázódnak, mint a négyzetesek, de ellenőrizd, hogy a tokenek a hatszögeikben maradtak-e.',
          'Ha egy rajz közvetlenül a skálázás után rossz helyen látszik, töltsd újra az oldalt: a Roll20 néha késve rajzol újra.',
          'A kalibráláshoz a térképnek egyenesen kell állnia az oldalhoz képest; előbb fordítsd 0°, 90°, 180° vagy 270°-ra.',
        ],
      },
      languages: {
        heading: 'Nyelvek',
        body: 'Válassz nyelvet a Beállítások kártyán, a set language <code> paranccsal vagy a Mod beállításaiban.',
        colLanguage: 'Nyelv',
        colNative: 'Saját nyelvű név',
        colCode: 'Kód',
      },
      credits: {
        heading: 'Készítők',
        original: 'Az eredeti Mod szerzője:',
        maintainer: 'Újraírta és karbantartja:',
        thread: 'Fórumtéma',
        support:
          'Hibát találtál, vagy van egy ötleted? Írj a fórumtémába, vagy nyiss egy issue-t a GitHubon.',
      },
    },
  };

  var localeIt = {
    titles: {
      ready: 'Resizer è pronto.',
      history: 'Cronologia di Resizer',
      pages: 'Pagine di Resizer',
      settings: 'Impostazioni di Resizer',
      help: 'Guida di Resizer',
    },
    menu: {
      selected: 'Selezionati',
      nothingSelected: 'Nessuna selezione. Seleziona prima delle pedine, una mappa o dei disegni.',
      graphicSize: '{name}: {width} × {height} px ({across} × {down} caselle)',
      andMore: '…e altri {count}.',
      map: 'Mappa',
      mapHint:
        'Disegna un rettangolo su alcune caselle della mappa, selezionalo insieme alla mappa e poi calibra.',
      page: 'Pagina',
      pageSize: '{across} × {down} caselle, {cell} px a casella, {scale} {units} a casella',
      pageCells: '{across} × {down} caselle',
      historyEmpty: 'Ancora niente da annullare.',
      historyHint: 'Annulla toglie prima la modifica più recente.',
      minutesAgo: '{minutes} min fa',
      pickerHint: 'Spunta le pagine da zoomare insieme, poi premi Zoom pagine spuntate.',
      on: 'Attivo',
      off: 'Disattivo',
      handouts: 'Guida completa nei documenti:',
    },
    kinds: {
      graphic: 'Immagine',
      text: 'Testo',
      pathv2: 'Disegno',
      path: 'Disegno',
      door: 'Porta',
      window: 'Finestra',
    },
    sizes: {
      tiny: 'Minuscola',
      small: 'Piccola',
      medium: 'Media',
      large: 'Grande',
      huge: 'Enorme',
      gargantuan: 'Mastodontica',
    },
    units: {
      px: 'px',
      cells: 'caselle',
      units: 'unità di pagina',
    },
    buttons: {
      menu: 'Menu',
      resize: 'Ridimensiona',
      creatureSize: 'Taglia creatura',
      fit: 'Adatta alla pagina',
      centre: 'Centra',
      sizes: 'Mostra dimensioni',
      calibrate: 'Calibra mappa',
      calibrateFit: 'Calibra e adatta pagina',
      calibratePx: 'Calibra in pixel',
      zoom: 'Zoom pagina',
      zoomIn: 'Zoom ×2',
      zoomOut: 'Zoom ×½',
      resizePage: 'Ridimensiona pagina',
      pageSize: 'Dimensioni pagina',
      pages: 'Scegli pagine',
      zoomPicked: 'Zoom pagine spuntate ({count})',
      pickAll: 'Spunta tutte',
      pickNone: 'Togli tutte',
      undo: 'Annulla',
      undoWhat: 'Annulla: {what}',
      history: 'Cronologia',
      clearHistory: 'Svuota cronologia',
      settings: 'Impostazioni',
      help: 'Guida',
      resetSettings: 'Ripristina impostazioni',
      rebuild: 'Ricrea documenti',
    },
    queries: {
      width: 'Larghezza',
      height: 'Altezza',
      unit: 'Unità',
      unitPx: 'Pixel',
      unitCells: 'Caselle della griglia',
      unitUnits: 'Unità di pagina (70 px)',
      creatureSize: 'Taglia creatura',
      keepShape: 'Mantenere la forma?',
      yes: 'Sì',
      no: 'No - stira sulla pagina',
      centre: 'Centra',
      both: 'In entrambe le direzioni',
      across: 'Caselle in larghezza nel riquadro',
      down: 'Solo in verticale',
      downCount: 'Caselle in altezza nel riquadro',
      squarePx: 'Pixel per casella sulla mappa ora',
      factor: 'Fattore di zoom (2 = il doppio; 0.5 = la metà)',
      tokens: 'Pedine',
      tokensScale: 'Scala con la pagina',
      tokensKeep: 'Mantieni la loro dimensione',
      language: 'Lingua',
      command: 'Nome del comando senza !',
    },
    settings: {
      language: 'Lingua',
      command: 'Comando',
      keepTokenSize: 'Mantieni la dimensione delle pedine nello zoom',
      scaleStrokes: 'Scala lo spessore delle linee dei disegni',
      deleteCalibrationBox: 'Elimina il riquadro di calibrazione',
    },
    history: {
      change: 'Modifica',
      zoom: 'Zoom ×{factor} su {page}',
      zoomPages: 'Zoom ×{factor} su {count} pagine',
      size: 'Ridimensiona {count} immagini',
      size_one: 'Ridimensiona 1 immagine',
      page: 'Pagina {page} a {width} × {height} unità',
      fit: 'Adatta {count} immagini alla pagina',
      fit_one: 'Adatta 1 immagine alla pagina',
      centre: 'Centra {count} oggetti',
      centre_one: 'Centra 1 oggetto',
      calibrate: 'Calibra la mappa {name}',
      calibrateUnnamed: 'Calibra la mappa',
    },
    messages: {
      welcome: 'Seleziona qualcosa e apri il menu per ridimensionarlo, o zooma un’intera pagina.',
      upgraded:
        'Aggiornato da Resizer 0.0.9. Il tuo comando {command} e i vecchi comandi funzionano ancora.',
      readyHint: 'Scrivi {command} per il menu o apri il documento Resizer - Command Deck.',
      zoomed: 'Zoom ×{factor} su {page}: {objects} oggetti si sono spostati con essa.',
      zoomedPages:
        'Zoom ×{factor} su {count} pagine ({page}): {objects} oggetti si sono spostati con loro.',
      skipped: '{count} oggetti non sono stati letti e sono rimasti com’erano.',
      skipped_one: '1 oggetto non è stato letto ed è rimasto com’era.',
      resized: '{count} immagini ridimensionate a {width} × {height} {unit}.',
      resized_one: '1 immagine ridimensionata a {width} × {height} {unit}.',
      sized: '{count} immagini ridimensionate a {size}.',
      sized_one: '1 immagine ridimensionata a {size}.',
      pageResized: '{page} ora misura {size}.',
      fitted: '{count} immagini adattate alla pagina.',
      fitted_one: '1 immagine adattata alla pagina.',
      centred: '{count} oggetti centrati nella pagina.',
      centred_one: '1 oggetto centrato nella pagina.',
      calibrated:
        'Calibrata: la mappa aveva caselle da {square} px; ora è scalata ×{scale} a caselle da {cell} px e allineata alla griglia.',
      calibratedPage: 'Ora la pagina misura {width} × {height} unità per contenere la mappa.',
      boxRemoved: 'Il riquadro di calibrazione è stato eliminato (Annulla lo riporta).',
      undone: 'Annullato: {what}.',
      undoMissing:
        '{count} oggetti erano stati eliminati nel frattempo e non sono stati ripristinati.',
      undoMissing_one: '1 oggetto era stato eliminato nel frattempo e non è stato ripristinato.',
      notStored: 'Questa modifica era troppo grande per restare nella cronologia di annullamento.',
      historyCleared: '{count} modifiche dimenticate.',
      historyCleared_one: '1 modifica dimenticata.',
      settingChanged: '{key} ora è {value}.',
      settingsReset:
        'Le impostazioni sono tornate ai valori predefiniti. La cronologia di annullamento è stata mantenuta.',
      handoutsRebuilt: 'I documenti Help e Command Deck sono stati ricreati.',
    },
    errors: {
      unexpected: 'Qualcosa è andato storto: {message}',
      unknownCommand: 'Comando sconosciuto «{command}». Scrivi {help} per i comandi.',
      noSelection: 'Seleziona prima qualcosa (oppure usa --ids).',
      unknownIds: 'Nessun oggetto con questi ID: {ids}',
      noGraphics:
        'Nessuno degli oggetti selezionati si può modificare così. Seleziona delle pedine o una mappa.',
      badSize: 'Indica una larghezza e un’altezza maggiori di 0, per esempio size 140 140 px.',
      badCreatureSize: 'Taglia sconosciuta. Usa tiny, small, medium, large, huge o gargantuan.',
      badPageSize: 'Indica una larghezza e un’altezza di pagina da 1 a {max} unità.',
      badFactor: 'Indica un fattore di zoom da {min} a {max}.',
      badFactorText:
        'Impossibile leggere «{text}» come fattore di zoom. Prova 2, 0.5, 150%, 1/2 o "to 140".',
      factorOne: 'Uno zoom di 1 non cambia nulla.',
      pageTooBig: '{page} sarebbe più piccola di 1 unità o più grande di {max} unità.',
      noPage: 'Pagina non trovata.',
      noPages: 'Nessuna pagina da modificare. Spuntane alcune nel selettore pagine o usa --pages.',
      unknownPages: 'Nessuna pagina con questo nome: {pages}',
      noMap: 'Seleziona anche l’immagine della mappa.',
      noBox:
        'Seleziona, oltre alla mappa, un rettangolo disegnato su alcune caselle della mappa, oppure usa calibrate --cell <px>.',
      boxUnreadable: 'Impossibile leggere la dimensione del disegno selezionato.',
      boxTooSmall:
        'Il riquadro di calibrazione è troppo piccolo. Disegnalo su una o più caselle intere.',
      badCount:
        'Indica quante caselle copre il riquadro in larghezza (e in altezza), per esempio 3 o 3 2.',
      badSquarePx: 'Indica la dimensione delle caselle della mappa in pixel, 2 o più.',
      mapRotated:
        'Raddrizza la mappa rispetto alla pagina (0°, 90°, 180° o 270°) prima di calibrare.',
      nothingToUndo: 'Niente da annullare.',
      badSetting: 'Impostazione sconosciuta «{key}». Impostazioni: {settings}',
      badValue: '«{value}» non è un valore accettato da {key}.',
    },
    help: {
      menu: 'Apre il menu; con oggetti selezionati ne mostra le dimensioni.',
      size: 'Ridimensiona le immagini selezionate (in pixel per impostazione predefinita).',
      creature: 'Porta le pedine selezionate a una taglia di creatura, in caselle della griglia.',
      fit: 'Adatta le immagini selezionate alla pagina; --keep-ratio ne mantiene la forma.',
      center: 'Centra nella pagina le immagini o i testi selezionati.',
      calibrate:
        'Scala la mappa selezionata in modo che le caselle del riquadro selezionato corrispondano alla griglia, poi le allinea.',
      calibrateCell:
        'Scala la mappa selezionata in base alla dimensione delle sue caselle in pixel.',
      page: 'Mostra le dimensioni della pagina o ridimensiona la pagina (non il suo contenuto).',
      zoom: 'Zooma le pagine con tutto ciò che contengono; la distanza per casella resta la stessa.',
      pages: 'Apre il selettore pagine, o spunta pagine, per zoomarne diverse insieme.',
      undo: 'Annulla la modifica più recente (vengono tenute le ultime 10).',
      history: 'Elenca le modifiche annullabili; clear le dimentica.',
      settings: 'Mostra o cambia le impostazioni.',
      reset: 'Riporta le impostazioni ai valori predefiniti.',
      journal: 'Ricrea i documenti Help e Command Deck.',
      help: 'Mostra questo elenco.',
    },
    deck: {
      menuTitle: 'Menu',
      menuDesc: 'Il menu principale mostra la selezione, la pagina e cosa puoi annullare.',
      selectedTitle: 'Pedine e immagini selezionate',
      selectedDesc: 'Prima seleziona, poi premi un pulsante.',
      mapTitle: 'Mappa',
      mapDesc: 'Seleziona la mappa e un riquadro disegnato su alcune delle sue caselle.',
      pageTitle: 'Pagina',
      pageDesc: 'Zooma la pagina in cui ti trovi con tutto ciò che contiene.',
      historyTitle: 'Cronologia',
      historyDesc: 'Annulla toglie la modifica più recente.',
      footer: 'Le istruzioni complete sono nel documento {help}.',
    },
    handout: {
      versionLabel: 'Versione',
      subtitle: 'Ridimensiona pedine, mappe e pagine intere',
      footer: 'I pulsanti per ogni azione sono nel documento {deck}.',
      overview: {
        heading: 'Panoramica',
        body: 'Resizer ridimensiona le pedine e le mappe selezionate, ridimensiona le pagine e zooma un’intera pagina con tutto ciò che contiene: mappa, pedine, disegni, testo, muri, porte e finestre. Funziona con gli editor Jumpgate e Legacy, mantiene la distanza per casella, allinea le mappe alla griglia e può annullare le sue ultime 10 modifiche.',
      },
      quickStart: {
        heading: 'Per iniziare',
        steps: [
          'Apri il documento Resizer - Command Deck o scrivi !resizer per il menu.',
          'Per ridimensionare delle pedine, selezionale e premi Ridimensiona o Taglia creatura.',
          'Per zoomare una pagina, vai su di essa e premi Zoom pagina; 2 raddoppia tutto, 0.5 lo dimezza.',
          'Per adattare una mappa alla griglia, disegna un rettangolo su alcune caselle della mappa, selezionalo insieme alla mappa e premi Calibra mappa.',
          'Hai cambiato idea? Premi Annulla.',
        ],
      },
      zoom: {
        heading: 'Zoom delle pagine',
        intro:
          'Lo zoom scala una pagina e tutto ciò che contiene a partire dall’angolo in alto a sinistra. Le caselle diventano più grandi o più piccole, ma ognuna rappresenta sempre la stessa distanza (5 ft restano 5 ft), quindi righelli, aure, luci e visione delle pedine misurano allo stesso modo.',
        points: [
          'Sposta e scala pedine, immagini di mappa, disegni Jumpgate e Legacy, testo, muri dell’illuminazione dinamica, porte, finestre e lo scostamento della griglia.',
          'Il fattore può essere 2, 0.5, 150%, 1/2 o "to 140" per caselle da 140 px.',
          'Mantieni la dimensione delle pedine (impostazione o --keep-tokens) sposta le pedine con la mappa ma non ne cambia la dimensione.',
          'Lo spessore delle linee dei disegni segue la scala della pagina a meno che l’impostazione sia disattivata; i muri mantengono il loro spessore.',
          'I disegni Legacy vengono ridisegnati alla nuova dimensione (Jumpgate non ridisegna un disegno Legacy modificato da una Mod), quindi ricevono nuovi ID.',
        ],
      },
      calibrate: {
        heading: 'Adattare una mappa alla griglia',
        intro:
          'Molte mappe hanno una propria griglia a una propria dimensione. Calibra scala la mappa in modo che le sue caselle corrispondano a quelle della pagina e la sposta finché le linee coincidono.',
        steps: [
          'Metti la mappa sulla pagina e disegna un rettangolo (con qualsiasi strumento di disegno) su alcune caselle della mappa, da linea a linea.',
          'Seleziona insieme la mappa e il rettangolo (Maiusc-clic).',
          'Premi Calibra mappa e indica quante caselle copre il riquadro in larghezza e in altezza.',
          'La mappa viene scalata e spostata in modo che quelle caselle combacino con la griglia; il riquadro viene eliminato.',
        ],
        points: [
          'Calibra e adatta pagina sposta anche la mappa nell’angolo della pagina e ridimensiona la pagina per contenerla.',
          'Calibra in pixel salta il riquadro: indica la dimensione attuale delle caselle della mappa in pixel.',
          'Un riquadro più grande (più caselle) dà un adattamento più preciso.',
        ],
      },
      sizes: {
        heading: 'Taglie delle creature',
        intro: 'Taglia porta le pedine a una taglia di creatura nelle caselle della loro pagina.',
        colSize: 'Taglia',
        colCommand: 'Comando',
        colCells: 'Caselle',
        cells: '{cells} × {cells}',
      },
      pages: {
        heading: 'Più pagine insieme',
        points: [
          'Scegli pagine apre l’elenco di tutte le pagine; spunta quelle che vuoi e premi Zoom pagine spuntate.',
          'Da comando: zoom 2 --pages all, --pages picked, --pages current, oppure nomi e ID separati da virgole (--pages Town, Docks).',
          'Un solo annullamento toglie l’intero gruppo.',
        ],
      },
      undo: {
        heading: 'Annulla',
        points: [
          'Ogni modifica (ridimensiona, adatta, centra, calibra, dimensioni pagina, zoom) si può annullare.',
          'Le ultime 10 modifiche vengono salvate con la partita, quindi resistono a un riavvio della sandbox delle Mod.',
          'Gli oggetti eliminati dopo la modifica vengono segnalati e saltati.',
          'Le modifiche molto grandi (migliaia di oggetti) possono essere troppo grandi da salvare; Resizer lo segnala.',
        ],
      },
      commands: {
        heading: 'Comandi',
        intro:
          'Scrivi {command} seguito da uno di questi. Anche !resizer e !rsz funzionano sempre.',
        colCommand: 'Comando',
        colDesc: 'Cosa fa',
      },
      settings: {
        heading: 'Impostazioni',
        intro: 'Cambiale dal pannello Impostazioni o con set <setting> <value>.',
        colKey: 'Impostazione',
        colDesc: 'Cosa fa',
        rows: {
          language: 'Lingua di menu, messaggi e documenti.',
          command: 'Un nome aggiuntivo per il comando (la 0.0.9 permetteva di rinominarlo).',
          keepTokenSize: 'Lo zoom sposta le pedine ma ne mantiene la dimensione.',
          scaleStrokes:
            'Lo zoom scala lo spessore delle linee dei disegni (i muri mantengono il loro).',
          deleteCalibrationBox: 'Calibra elimina il riquadro che ha misurato.',
        },
      },
      api: {
        heading: 'Per gli autori di Mod',
        intro: 'Le altre Mod possono usare l’oggetto globale Resizer.',
        colFunction: 'Funzione',
        colDesc: 'Cosa fa',
        rows: {
          zoomPage:
            'Zooma una pagina con tutto ciò che contiene, con annullamento. options.keepTokens mantiene la dimensione delle pedine.',
          undo: 'Annulla la modifica più recente.',
          onZoom:
            'Chiama la tua funzione dopo ogni zoom (e con 1/factor dopo averne annullato uno), così una Mod che salva posizioni sulla pagina può seguire.',
          history: 'Elenca le modifiche annullabili.',
        },
      },
      upgrading: {
        heading: 'Aggiornare dalla 0.0.9',
        points: [
          'Sostituisci il vecchio script con questo; il tuo comando rinominato viene mantenuto.',
          'I vecchi comandi funzionano ancora e fanno ciò che fanno i nuovi qui sotto.',
          'scale non cambia più la distanza per casella (una casella da 5 ft resta da 5 ft).',
        ],
        colOld: '0.0.9',
        colNew: '1.0',
      },
      troubleshooting: {
        heading: 'Risoluzione dei problemi',
        points: [
          'Le altre Mod che ricordano posizioni su una pagina (percorsi di pattuglia, posizioni base delle pedine, aree salvate) non vengono avvisate di uno zoom a meno che usino Resizer.onZoom; controllale dopo lo zoom.',
          'Le pagine esagonali si zoomano come quelle quadrate, ma controlla che le pedine siano ancora nei loro esagoni.',
          'Se un disegno sembra fuori posto subito dopo uno zoom, ricarica la pagina: a volte Roll20 ridisegna in ritardo.',
          'Calibra richiede la mappa dritta rispetto alla pagina; prima ruotala a 0°, 90°, 180° o 270°.',
        ],
      },
      languages: {
        heading: 'Lingue',
        body: 'Scegli una lingua nel pannello Impostazioni, con set language <code> o nelle impostazioni della Mod.',
        colLanguage: 'Lingua',
        colNative: 'Nome nativo',
        colCode: 'Codice',
      },
      credits: {
        heading: 'Riconoscimenti',
        original: 'Mod originale di',
        maintainer: 'Riscritto e mantenuto da',
        thread: 'Discussione sul forum',
        support:
          'Hai trovato un problema o hai un’idea? Scrivi nella discussione sul forum o apri una issue su GitHub.',
      },
    },
  };

  var localeJa = {
    titles: {
      ready: 'Resizer の準備ができました。',
      history: 'Resizer 履歴',
      pages: 'Resizer ページ',
      settings: 'Resizer 設定',
      help: 'Resizer ヘルプ',
    },
    menu: {
      selected: '選択中',
      nothingSelected:
        '何も選択されていません。先にトークン、マップ、または描画を選択してください。',
      graphicSize: '{name}: {width} × {height} px（{across} × {down} マス）',
      andMore: '…ほか {count} 件。',
      map: 'マップ',
      mapHint:
        'マップ上のいくつかのマスに重ねて四角形を描き、それとマップを選択してからキャリブレーションしてください。',
      page: 'ページ',
      pageSize: '{across} × {down} マス、1 マス {cell} px、1 マス {scale} {units}',
      pageCells: '{across} × {down} マス',
      historyEmpty: '元に戻せる変更はまだありません。',
      historyHint: '元に戻すと、最新の変更から順に取り消されます。',
      minutesAgo: '{minutes} 分前',
      pickerHint:
        'まとめてズームするページにチェックを入れ、「チェックしたページをズーム」を押してください。',
      on: 'オン',
      off: 'オフ',
      handouts: '詳しいヘルプはハンドアウトにあります:',
    },
    kinds: {
      graphic: 'グラフィック',
      text: 'テキスト',
      pathv2: '描画',
      path: '描画',
      door: 'ドア',
      window: '窓',
    },
    sizes: {
      tiny: '超小型',
      small: '小型',
      medium: '中型',
      large: '大型',
      huge: '超大型',
      gargantuan: '巨大',
    },
    units: {
      px: 'px',
      cells: 'マス',
      units: 'ページ単位',
    },
    buttons: {
      menu: 'メニュー',
      resize: 'サイズ変更',
      creatureSize: 'クリーチャーのサイズ',
      fit: 'ページに合わせる',
      centre: '中央に配置',
      sizes: 'サイズを表示',
      calibrate: 'マップをキャリブレーション',
      calibrateFit: 'キャリブレーションしてページに合わせる',
      calibratePx: 'ピクセルでキャリブレーション',
      zoom: 'ページをズーム',
      zoomIn: 'ズーム ×2',
      zoomOut: 'ズーム ×½',
      resizePage: 'ページのサイズ変更',
      pageSize: 'ページサイズ',
      pages: 'ページを選ぶ',
      zoomPicked: 'チェックしたページをズーム（{count}）',
      pickAll: 'すべてチェック',
      pickNone: 'チェックを外す',
      undo: '元に戻す',
      undoWhat: '元に戻す: {what}',
      history: '履歴',
      clearHistory: '履歴を消去',
      settings: '設定',
      help: 'ヘルプ',
      resetSettings: '設定をリセット',
      rebuild: 'ハンドアウトを作り直す',
    },
    queries: {
      width: '幅',
      height: '高さ',
      unit: '単位',
      unitPx: 'ピクセル',
      unitCells: 'グリッドのマス',
      unitUnits: 'ページ単位（70 px）',
      creatureSize: 'クリーチャーのサイズ',
      keepShape: '形を保ちますか？',
      yes: 'はい',
      no: 'いいえ - ページに合わせて引き伸ばす',
      centre: '中央に配置',
      both: '両方向',
      across: 'ボックスの横のマス数',
      down: '縦のみ',
      downCount: 'ボックスの縦のマス数',
      squarePx: '現在のマップの 1 マスのピクセル数',
      factor: 'ズーム倍率（2 = 2 倍; 0.5 = 半分）',
      tokens: 'トークン',
      tokensScale: 'ページと一緒に拡大縮小',
      tokensKeep: 'サイズを保つ',
      language: '言語',
      command: 'コマンド名（! なし）',
    },
    settings: {
      language: '言語',
      command: 'コマンド',
      keepTokenSize: 'ズーム時にトークンのサイズを保つ',
      scaleStrokes: '描画の線の太さも拡大縮小する',
      deleteCalibrationBox: 'キャリブレーション用のボックスを削除する',
    },
    history: {
      change: '変更',
      zoom: '{page} を ×{factor} でズーム',
      zoomPages: '{count} ページを ×{factor} でズーム',
      size: '{count} 個のグラフィックをサイズ変更',
      size_one: '1 個のグラフィックをサイズ変更',
      page: 'ページ {page} を {width} × {height} 単位に',
      fit: '{count} 個のグラフィックをページに合わせる',
      fit_one: '1 個のグラフィックをページに合わせる',
      centre: '{count} 個のオブジェクトを中央に配置',
      centre_one: '1 個のオブジェクトを中央に配置',
      calibrate: 'マップ {name} をキャリブレーション',
      calibrateUnnamed: 'マップをキャリブレーション',
    },
    messages: {
      welcome:
        '何かを選択してメニューを開くとサイズを変更できます。ページ全体をズームすることもできます。',
      upgraded:
        'Resizer 0.0.9 からアップグレードしました。コマンド {command} と以前のコマンドは引き続き使えます。',
      readyHint:
        '{command} と入力してメニューを開くか、「Resizer - Command Deck」ハンドアウトを開いてください。',
      zoomed:
        '{page} を ×{factor} でズームしました。{objects} 個のオブジェクトも一緒に動きました。',
      zoomedPages:
        '{count} ページを ×{factor} でズームしました（{page}）。{objects} 個のオブジェクトも一緒に動きました。',
      skipped: '{count} 個のオブジェクトを読み取れなかったため、そのままにしました。',
      skipped_one: '1 個のオブジェクトを読み取れなかったため、そのままにしました。',
      resized: '{count} 個のグラフィックを {width} × {height} {unit} にサイズ変更しました。',
      resized_one: '1 個のグラフィックを {width} × {height} {unit} にサイズ変更しました。',
      sized: '{count} 個のグラフィックを {size} にサイズ変更しました。',
      sized_one: '1 個のグラフィックを {size} にサイズ変更しました。',
      pageResized: '{page} は {size} になりました。',
      fitted: '{count} 個のグラフィックをページに合わせました。',
      fitted_one: '1 個のグラフィックをページに合わせました。',
      centred: '{count} 個のオブジェクトをページの中央に配置しました。',
      centred_one: '1 個のオブジェクトをページの中央に配置しました。',
      calibrated:
        'キャリブレーション完了: マップの 1 マスは {square} px でした。×{scale} で {cell} px のマスに拡大縮小し、グリッドに揃えました。',
      calibratedPage: 'マップに合わせて、ページを {width} × {height} 単位にしました。',
      boxRemoved: 'キャリブレーション用のボックスを削除しました（「元に戻す」で復元できます）。',
      undone: '元に戻しました: {what}。',
      undoMissing: 'その後 {count} 個のオブジェクトが削除されていたため、元に戻せませんでした。',
      undoMissing_one: 'その後 1 個のオブジェクトが削除されていたため、元に戻せませんでした。',
      notStored: 'この変更は大きすぎるため、元に戻す履歴に保存できませんでした。',
      historyCleared: '{count} 件の変更を履歴から消去しました。',
      historyCleared_one: '1 件の変更を履歴から消去しました。',
      settingChanged: '{key} は {value} になりました。',
      settingsReset: '設定を初期値に戻しました。元に戻す履歴はそのまま残っています。',
      handoutsRebuilt: 'ヘルプと Command Deck のハンドアウトを作り直しました。',
    },
    errors: {
      unexpected: '問題が発生しました: {message}',
      unknownCommand:
        '不明なコマンド「{command}」です。{help} と入力するとコマンドの一覧が表示されます。',
      noSelection: '先に何かを選択してください（または --ids を指定してください）。',
      unknownIds: '次の ID のオブジェクトはありません: {ids}',
      noGraphics:
        '選択したオブジェクトはこの方法では変更できません。トークンかマップを選択してください。',
      badSize: '0 より大きい幅と高さを指定してください。例: size 140 140 px',
      badCreatureSize:
        '不明なサイズです。tiny, small, medium, large, huge or gargantuan のいずれかを使ってください。',
      badPageSize: 'ページの幅と高さを 1～{max} 単位で指定してください。',
      badFactor: 'ズーム倍率を {min}～{max} で指定してください。',
      badFactorText:
        '「{text}」をズーム倍率として読み取れませんでした。2, 0.5, 150%, 1/2 や "to 140" を試してください。',
      factorOne: 'ズーム倍率 1 では何も変わりません。',
      pageTooBig: '{page} が 1 単位未満、または {max} 単位を超えてしまいます。',
      noPage: 'ページが見つかりませんでした。',
      noPages:
        '変更するページがありません。ページ選択でチェックを入れるか、--pages を指定してください。',
      unknownPages: '次の名前のページはありません: {pages}',
      noMap: 'マップのグラフィックも選択してください。',
      noBox:
        'マップのマスに重ねて描いた四角形をマップと一緒に選択するか、calibrate --cell <px> を使ってください。',
      boxUnreadable: '選択した描画のサイズを読み取れませんでした。',
      boxTooSmall:
        'キャリブレーション用のボックスが小さすぎます。1 マス以上を丸ごと覆うように描いてください。',
      badCount: 'ボックスの横（と縦）のマス数を指定してください。例: 3 または 3 2',
      badSquarePx: 'マップの 1 マスのサイズをピクセルで指定してください（2 以上）。',
      mapRotated:
        'キャリブレーションの前に、マップをページに対してまっすぐ（0°, 90°, 180°, 270°）にしてください。',
      nothingToUndo: '元に戻せるものはありません。',
      badSetting: '不明な設定「{key}」です。設定: {settings}',
      badValue: '「{value}」は {key} に使える値ではありません。',
    },
    help: {
      menu: 'メニューを開きます。オブジェクトを選択していると、そのサイズを表示します。',
      size: '選択したグラフィックのサイズを変更します（既定はピクセル）。',
      creature: '選択したトークンをクリーチャーのサイズ（グリッドのマス単位）に変更します。',
      fit: '選択したグラフィックをページに合わせます。--keep-ratio で形を保ちます。',
      center: '選択したグラフィックまたはテキストをページの中央に配置します。',
      calibrate:
        '選択したボックス内のマスがページのグリッドと一致するようにマップを拡大縮小し、位置を揃えます。',
      calibrateCell: '選択したマップを、1 マスのピクセルサイズをもとに拡大縮小します。',
      page: 'ページサイズを表示するか、ページのサイズを変更します（上にあるものは変わりません）。',
      zoom: 'ページを上にあるものごとズームします。1 マスあたりの距離は変わりません。',
      pages: 'ページ選択を開くか、ページにチェックを入れて、複数のページを一度にズームします。',
      undo: '最新の変更を元に戻します（直近 10 件を保存）。',
      history: '元に戻せる変更を一覧表示します。clear で消去します。',
      settings: '設定を表示または変更します。',
      reset: '設定を初期値に戻します。',
      journal: 'ヘルプと Command Deck のハンドアウトを作り直します。',
      help: 'この一覧を表示します。',
    },
    deck: {
      menuTitle: 'メニュー',
      menuDesc: 'メインメニューには、選択中のもの、ページ、元に戻せる変更が表示されます。',
      selectedTitle: '選択中のトークンとグラフィック',
      selectedDesc: '先に選択してから、ボタンを押してください。',
      mapTitle: 'マップ',
      mapDesc: 'マップと、そのマスに重ねて描いたボックスを選択してください。',
      pageTitle: 'ページ',
      pageDesc: '今いるページを、上にあるものごとズームします。',
      historyTitle: '履歴',
      historyDesc: '元に戻すと、最新の変更が取り消されます。',
      footer: '詳しい説明は {help} ハンドアウトにあります。',
    },
    handout: {
      versionLabel: 'バージョン',
      subtitle: 'トークン、マップ、ページ全体のサイズ変更',
      footer: 'すべての操作のボタンは {deck} ハンドアウトにあります。',
      overview: {
        heading: '概要',
        body: 'Resizer は、選択したトークンやマップのサイズ変更、ページのサイズ変更、そしてページ全体を上にあるものごとズームできます。マップ、トークン、描画、テキスト、壁、ドア、窓も対象です。Jumpgate と Legacy の両エディターで動作し、グリッド 1 マスあたりの距離を保ち、マップをグリッドに揃え、直近 10 件の変更を元に戻せます。',
      },
      quickStart: {
        heading: 'クイックスタート',
        steps: [
          '「Resizer - Command Deck」ハンドアウトを開くか、!resizer と入力してメニューを開きます。',
          'トークンのサイズを変えるには、トークンを選択して「サイズ変更」か「クリーチャーのサイズ」を押します。',
          'ページをズームするには、そのページに移動して「ページをズーム」を押します。2 ですべてが 2 倍、0.5 で半分になります。',
          'マップをグリッドに合わせるには、マップのいくつかのマスに重ねて四角形を描き、それとマップを選択して「マップをキャリブレーション」を押します。',
          'やっぱりやめたいときは「元に戻す」を押します。',
        ],
      },
      zoom: {
        heading: 'ページのズーム',
        intro:
          'ズームは、ページとその上にあるものすべてを左上の角を基準に拡大縮小します。グリッドのマスは大きく（または小さく）なりますが、1 マスが表す距離は変わりません（5 ft は 5 ft のまま）。そのため、ルーラー、オーラ、トークンの光や視界の測り方も変わりません。',
        points: [
          'トークン、マップのグラフィック、Jumpgate と Legacy の描画、テキスト、ダイナミックライティングの壁、ドア、窓、グリッドのオフセットを移動・拡大縮小します。',
          '倍率には 2, 0.5, 150%, 1/2、または 140 px のマスにする "to 140" を使えます。',
          'トークンのサイズを保つ（設定または --keep-tokens）と、トークンはマップと一緒に動きますが、サイズは変わりません。',
          '描画の線の太さは、設定がオフでない限りページと一緒に拡大縮小されます。壁の太さは変わりません。',
          'Legacy の描画は新しいサイズで描き直されます（Mod が変更した Legacy の描画を Jumpgate は再描画しないため）。そのため新しい ID になります。',
        ],
      },
      calibrate: {
        heading: 'マップをグリッドに合わせる',
        intro:
          '多くのマップは、独自のサイズの独自のグリッドで描かれています。キャリブレーションは、マップのマスがページのマスと一致するように拡大縮小し、線が重なるように移動します。',
        steps: [
          'マップをページに置き、マップのいくつかのマスに重ねて、線から線まで四角形を描きます（どの描画ツールでも可）。',
          'マップと四角形を一緒に選択します（Shift キーを押しながらクリック）。',
          '「マップをキャリブレーション」を押し、ボックスが横と縦に何マス分かを答えます。',
          'それらのマスがページのグリッドにぴったり合うように、マップが拡大縮小・移動されます。ボックスは削除されます。',
        ],
        points: [
          '「キャリブレーションしてページに合わせる」は、マップをページの角に移動し、ページのサイズもマップに合わせます。',
          '「ピクセルでキャリブレーション」はボックスを使いません。今描かれているマップの 1 マスのサイズをピクセルで指定します。',
          'ボックスが大きい（マスが多い）ほど、より正確に合わせられます。',
        ],
      },
      sizes: {
        heading: 'クリーチャーのサイズ',
        intro: 'サイズは、トークンをそのページのグリッドのマス単位でクリーチャーのサイズにします。',
        colSize: 'サイズ',
        colCommand: 'コマンド',
        colCells: 'マス',
        cells: '{cells} × {cells}',
      },
      pages: {
        heading: '複数のページを一度に',
        points: [
          '「ページを選ぶ」ですべてのページの一覧が開きます。目的のページにチェックを入れ、「チェックしたページをズーム」を押します。',
          '入力する場合: zoom 2 --pages all、--pages picked、--pages current、またはカンマ区切りの名前や ID（--pages Town, Docks）。',
          '1 回の「元に戻す」で、まとめて行った変更全体が取り消されます。',
        ],
      },
      undo: {
        heading: '元に戻す',
        points: [
          'すべての変更（サイズ変更、ページに合わせる、中央に配置、キャリブレーション、ページサイズ、ズーム）は元に戻せます。',
          '直近 10 件の変更はゲームと一緒に保存されるため、Mod サンドボックスを再起動しても残ります。',
          '変更後に削除されたオブジェクトは報告され、スキップされます。',
          'とても大きな変更（数千個のオブジェクト）は保存できないことがあります。その場合は Resizer がお知らせします。',
        ],
      },
      commands: {
        heading: 'コマンド',
        intro: '{command} に続けて、次のいずれかを入力します。!resizer と !rsz も常に使えます。',
        colCommand: 'コマンド',
        colDesc: '内容',
      },
      settings: {
        heading: '設定',
        intro: '設定カード、または set <setting> <value> で変更できます。',
        colKey: '設定',
        colDesc: '内容',
        rows: {
          language: 'メニュー、メッセージ、ハンドアウトの言語。',
          command: 'コマンドの別名（0.0.9 ではコマンド名を変更できました）。',
          keepTokenSize: 'ズームでトークンを移動しますが、サイズは保ちます。',
          scaleStrokes: 'ズームで描画の線の太さも拡大縮小します（壁の太さは変わりません）。',
          deleteCalibrationBox: 'キャリブレーション後、測定に使ったボックスを削除します。',
        },
      },
      api: {
        heading: 'Mod 作者向け',
        intro: '他の Mod からグローバルな Resizer オブジェクトを使えます。',
        colFunction: '関数',
        colDesc: '内容',
        rows: {
          zoomPage:
            'ページを上にあるものごとズームします（元に戻せます）。options.keepTokens でトークンのサイズを保ちます。',
          undo: '最新の変更を元に戻します。',
          onZoom:
            'ズームのたびに（ズームを元に戻したときは 1/factor で）指定した関数を呼び出します。ページ上の位置を保存している Mod も追従できます。',
          history: '元に戻せる変更を一覧で返します。',
        },
      },
      upgrading: {
        heading: '0.0.9 からのアップグレード',
        points: [
          '古いスクリプトをこれに置き換えてください。変更したコマンド名はそのまま残ります。',
          '以前のコマンドも引き続き使え、下の新しいコマンドと同じ動作をします。',
          'scale は 1 マスあたりの距離を変えなくなりました（5 ft のマスは 5 ft のまま）。',
        ],
        colOld: '0.0.9',
        colNew: '1.0',
      },
      troubleshooting: {
        heading: 'トラブルシューティング',
        points: [
          'ページ上の位置を記憶する他の Mod（巡回ルート、トークンの定位置、保存したエリアなど）は、Resizer.onZoom を使っていない限りズームを検知しません。ズーム後に確認してください。',
          'ヘックスのページも四角マスのページと同じようにズームしますが、トークンがヘックス内に収まっているか確認してください。',
          'ズーム直後に描画の位置がずれて見える場合は、ページを再読み込みしてください。Roll20 は再描画が遅れることがあります。',
          'キャリブレーションには、マップがページに対してまっすぐである必要があります。先に 0°, 90°, 180°, 270° のいずれかに回転してください。',
        ],
      },
      languages: {
        heading: '言語',
        body: '言語は、設定カード、set language <code>、または Mod の設定で選べます。',
        colLanguage: '言語',
        colNative: '現地語での名前',
        colCode: 'コード',
      },
      credits: {
        heading: 'クレジット',
        original: 'オリジナルの Mod 作者:',
        maintainer: '書き直し・メンテナンス:',
        thread: 'フォーラムのスレッド',
        support:
          '問題を見つけた、またはアイデアがありますか？フォーラムのスレッドに投稿するか、GitHub で issue を作成してください。',
      },
    },
  };

  var localeKo = {
    titles: {
      ready: 'Resizer가 준비되었습니다.',
      history: 'Resizer 기록',
      pages: 'Resizer 페이지',
      settings: 'Resizer 설정',
      help: 'Resizer 도움말',
    },
    menu: {
      selected: '선택됨',
      nothingSelected: '선택된 것이 없습니다. 먼저 토큰, 맵 또는 그림을 선택하세요.',
      graphicSize: '{name}: {width} × {height} px ({across} × {down}칸)',
      andMore: '…외 {count}개.',
      map: '맵',
      mapHint: '맵 자체의 칸 몇 개 위에 사각형을 그리고, 그 사각형과 맵을 선택한 다음 보정하세요.',
      page: '페이지',
      pageSize: '{across} × {down}칸, 한 칸에 {cell} px, 한 칸에 {scale} {units}',
      pageCells: '{across} × {down}칸',
      historyEmpty: '아직 되돌릴 것이 없습니다.',
      historyHint: '되돌리기는 가장 최근 변경부터 취소합니다.',
      minutesAgo: '{minutes}분 전',
      pickerHint: '함께 확대/축소할 페이지에 체크한 다음 "체크한 페이지 확대/축소"를 누르세요.',
      on: '켜짐',
      off: '꺼짐',
      handouts: '전체 도움말은 핸드아웃에 있습니다:',
    },
    kinds: {
      graphic: '그래픽',
      text: '텍스트',
      pathv2: '그림',
      path: '그림',
      door: '문',
      window: '창문',
    },
    sizes: {
      tiny: '초소형',
      small: '소형',
      medium: '중형',
      large: '대형',
      huge: '거대형',
      gargantuan: '초거대형',
    },
    units: {
      px: 'px',
      cells: '칸',
      units: '페이지 단위',
    },
    buttons: {
      menu: '메뉴',
      resize: '크기 변경',
      creatureSize: '크리처 크기',
      fit: '페이지에 맞추기',
      centre: '가운데로',
      sizes: '크기 보기',
      calibrate: '맵 보정',
      calibrateFit: '보정 후 페이지 맞추기',
      calibratePx: '픽셀로 보정',
      zoom: '페이지 확대/축소',
      zoomIn: '확대/축소 ×2',
      zoomOut: '확대/축소 ×½',
      resizePage: '페이지 크기 변경',
      pageSize: '페이지 크기',
      pages: '페이지 고르기',
      zoomPicked: '체크한 페이지 확대/축소 ({count})',
      pickAll: '모두 체크',
      pickNone: '모두 해제',
      undo: '되돌리기',
      undoWhat: '되돌리기: {what}',
      history: '기록',
      clearHistory: '기록 지우기',
      settings: '설정',
      help: '도움말',
      resetSettings: '설정 초기화',
      rebuild: '핸드아웃 다시 만들기',
    },
    queries: {
      width: '너비',
      height: '높이',
      unit: '단위',
      unitPx: '픽셀',
      unitCells: '격자 칸',
      unitUnits: '페이지 단위 (70 px)',
      creatureSize: '크리처 크기',
      keepShape: '모양을 유지할까요?',
      yes: '예',
      no: '아니요 - 페이지에 맞게 늘리기',
      centre: '가운데로',
      both: '양방향',
      across: '상자의 가로 칸 수',
      down: '세로만',
      downCount: '상자의 세로 칸 수',
      squarePx: '현재 맵의 한 칸당 픽셀 수',
      factor: '확대/축소 배율 (2 = 두 배; 0.5 = 절반)',
      tokens: '토큰',
      tokensScale: '페이지와 함께 크기 조절',
      tokensKeep: '크기 유지',
      language: '언어',
      command: '! 없이 명령어 이름',
    },
    settings: {
      language: '언어',
      command: '명령어',
      keepTokenSize: '확대/축소할 때 토큰 크기 유지',
      scaleStrokes: '그림의 선 굵기도 조절',
      deleteCalibrationBox: '보정용 상자 삭제',
    },
    history: {
      change: '변경',
      zoom: '{page} ×{factor} 확대/축소',
      zoomPages: '페이지 {count}개 ×{factor} 확대/축소',
      size: '그래픽 {count}개 크기 변경',
      size_one: '그래픽 1개 크기 변경',
      page: '페이지 {page}을(를) {width} × {height} 단위로',
      fit: '그래픽 {count}개를 페이지에 맞추기',
      fit_one: '그래픽 1개를 페이지에 맞추기',
      centre: '오브젝트 {count}개를 가운데로',
      centre_one: '오브젝트 1개를 가운데로',
      calibrate: '맵 {name} 보정',
      calibrateUnnamed: '맵 보정',
    },
    messages: {
      welcome: '무언가를 선택하고 메뉴를 열어 크기를 바꾸거나, 페이지 전체를 확대/축소하세요.',
      upgraded:
        'Resizer 0.0.9에서 업그레이드했습니다. 명령어 {command}와(과) 이전 명령어도 계속 쓸 수 있습니다.',
      readyHint: '{command}을(를) 입력해 메뉴를 열거나 "Resizer - Command Deck" 핸드아웃을 여세요.',
      zoomed: '{page}을(를) ×{factor} 확대/축소했습니다. 오브젝트 {objects}개도 함께 옮겨졌습니다.',
      zoomedPages:
        '페이지 {count}개를 ×{factor} 확대/축소했습니다({page}). 오브젝트 {objects}개도 함께 옮겨졌습니다.',
      skipped: '오브젝트 {count}개는 읽을 수 없어서 그대로 두었습니다.',
      skipped_one: '오브젝트 1개는 읽을 수 없어서 그대로 두었습니다.',
      resized: '그래픽 {count}개의 크기를 {width} × {height} {unit}(으)로 바꿨습니다.',
      resized_one: '그래픽 1개의 크기를 {width} × {height} {unit}(으)로 바꿨습니다.',
      sized: '그래픽 {count}개의 크기를 {size}(으)로 바꿨습니다.',
      sized_one: '그래픽 1개의 크기를 {size}(으)로 바꿨습니다.',
      pageResized: '{page}은(는) 이제 {size}입니다.',
      fitted: '그래픽 {count}개를 페이지에 맞췄습니다.',
      fitted_one: '그래픽 1개를 페이지에 맞췄습니다.',
      centred: '오브젝트 {count}개를 페이지 가운데로 옮겼습니다.',
      centred_one: '오브젝트 1개를 페이지 가운데로 옮겼습니다.',
      calibrated:
        '보정 완료: 맵의 한 칸은 {square} px였습니다. ×{scale} 조절해 {cell} px 칸에 맞추고 격자에 정렬했습니다.',
      calibratedPage: '맵에 맞게 페이지를 {width} × {height} 단위로 바꿨습니다.',
      boxRemoved: '보정용 상자를 삭제했습니다(되돌리기로 복구할 수 있습니다).',
      undone: '되돌렸습니다: {what}.',
      undoMissing: '그 뒤에 오브젝트 {count}개가 삭제되어 되돌릴 수 없었습니다.',
      undoMissing_one: '그 뒤에 오브젝트 1개가 삭제되어 되돌릴 수 없었습니다.',
      notStored: '이 변경은 너무 커서 되돌리기 기록에 저장할 수 없었습니다.',
      historyCleared: '변경 {count}개를 기록에서 지웠습니다.',
      historyCleared_one: '변경 1개를 기록에서 지웠습니다.',
      settingChanged: '{key}은(는) 이제 {value}입니다.',
      settingsReset: '설정을 기본값으로 되돌렸습니다. 되돌리기 기록은 그대로 남아 있습니다.',
      handoutsRebuilt: '도움말과 Command Deck 핸드아웃을 다시 만들었습니다.',
    },
    errors: {
      unexpected: '문제가 발생했습니다: {message}',
      unknownCommand:
        '알 수 없는 명령어 "{command}"입니다. {help}을(를) 입력하면 명령어를 볼 수 있습니다.',
      noSelection: '먼저 무언가를 선택하세요(또는 --ids를 지정하세요).',
      unknownIds: '다음 ID의 오브젝트가 없습니다: {ids}',
      noGraphics: '선택한 오브젝트는 이 방법으로 바꿀 수 없습니다. 토큰이나 맵을 선택하세요.',
      badSize: '0보다 큰 너비와 높이를 지정하세요. 예: size 140 140 px',
      badCreatureSize:
        '알 수 없는 크기입니다. tiny, small, medium, large, huge or gargantuan 중 하나를 쓰세요.',
      badPageSize: '페이지 너비와 높이를 1~{max} 단위로 지정하세요.',
      badFactor: '확대/축소 배율을 {min}~{max} 사이로 지정하세요.',
      badFactorText:
        '"{text}"을(를) 확대/축소 배율로 읽을 수 없습니다. 2, 0.5, 150%, 1/2 또는 "to 140"을 써 보세요.',
      factorOne: '배율 1로는 아무것도 바뀌지 않습니다.',
      pageTooBig: '{page}이(가) 1 단위보다 작아지거나 {max} 단위보다 커집니다.',
      noPage: '페이지를 찾을 수 없습니다.',
      noPages: '바꿀 페이지가 없습니다. 페이지 고르기에서 체크하거나 --pages를 지정하세요.',
      unknownPages: '다음 이름의 페이지가 없습니다: {pages}',
      noMap: '맵 그래픽도 함께 선택하세요.',
      noBox: '맵의 칸 위에 그린 사각형을 맵과 함께 선택하거나, calibrate --cell <px>을(를) 쓰세요.',
      boxUnreadable: '선택한 그림의 크기를 읽을 수 없습니다.',
      boxTooSmall: '보정용 상자가 너무 작습니다. 온전한 칸 하나 이상을 덮도록 그리세요.',
      badCount: '상자의 가로(및 세로) 칸 수를 지정하세요. 예: 3 또는 3 2',
      badSquarePx: '맵의 한 칸 크기를 픽셀로 지정하세요(2 이상).',
      mapRotated: '보정하기 전에 맵을 페이지와 반듯하게(0°, 90°, 180° 또는 270°) 돌려 주세요.',
      nothingToUndo: '되돌릴 것이 없습니다.',
      badSetting: '알 수 없는 설정 "{key}"입니다. 설정: {settings}',
      badValue: '"{value}"은(는) {key}에 쓸 수 있는 값이 아닙니다.',
    },
    help: {
      menu: '메뉴를 엽니다. 오브젝트를 선택하면 그 크기를 보여 줍니다.',
      size: '선택한 그래픽의 크기를 바꿉니다(기본은 픽셀).',
      creature: '선택한 토큰을 크리처 크기(격자 칸 기준)로 바꿉니다.',
      fit: '선택한 그래픽을 페이지에 맞춥니다. --keep-ratio를 쓰면 모양이 유지됩니다.',
      center: '선택한 그래픽이나 텍스트를 페이지 가운데로 옮깁니다.',
      calibrate:
        '선택한 상자 안의 칸이 페이지 격자와 일치하도록 선택한 맵의 크기를 조절하고 정렬합니다.',
      calibrateCell: '선택한 맵을 한 칸의 픽셀 크기를 기준으로 조절합니다.',
      page: '페이지 크기를 보여 주거나 페이지 크기를 바꿉니다(위에 있는 것은 그대로).',
      zoom: '페이지를 위에 있는 모든 것과 함께 확대/축소합니다. 한 칸당 거리는 유지됩니다.',
      pages: '페이지 고르기를 열거나 페이지에 체크해 여러 페이지를 한 번에 확대/축소합니다.',
      undo: '가장 최근 변경을 되돌립니다(최근 10개까지 보관).',
      history: '되돌릴 수 있는 변경을 보여 줍니다. clear로 기록을 지웁니다.',
      settings: '설정을 보거나 바꿉니다.',
      reset: '설정을 기본값으로 되돌립니다.',
      journal: '도움말과 Command Deck 핸드아웃을 다시 만듭니다.',
      help: '이 목록을 보여 줍니다.',
    },
    deck: {
      menuTitle: '메뉴',
      menuDesc: '기본 메뉴에는 선택한 것, 페이지, 되돌릴 수 있는 것이 표시됩니다.',
      selectedTitle: '선택한 토큰과 그래픽',
      selectedDesc: '먼저 선택한 다음 버튼을 누르세요.',
      mapTitle: '맵',
      mapDesc: '맵과, 그 칸 몇 개 위에 그린 상자를 선택하세요.',
      pageTitle: '페이지',
      pageDesc: '지금 있는 페이지를 위에 있는 모든 것과 함께 확대/축소합니다.',
      historyTitle: '기록',
      historyDesc: '되돌리기는 가장 최근 변경을 취소합니다.',
      footer: '전체 설명은 {help} 핸드아웃에 있습니다.',
    },
    handout: {
      versionLabel: '버전',
      subtitle: '토큰, 맵, 페이지 전체의 크기 변경',
      footer: '모든 동작의 버튼은 {deck} 핸드아웃에 있습니다.',
      overview: {
        heading: '개요',
        body: 'Resizer는 선택한 토큰과 맵의 크기를 바꾸고, 페이지 크기를 바꾸며, 페이지 전체를 위에 있는 모든 것과 함께 확대/축소합니다. 맵, 토큰, 그림, 텍스트, 벽, 문, 창문이 모두 포함됩니다. Jumpgate와 Legacy 편집기 모두에서 작동하고, 격자 한 칸당 거리를 유지하며, 맵을 격자에 맞춰 정렬하고, 최근 10개의 변경을 되돌릴 수 있습니다.',
      },
      quickStart: {
        heading: '빠른 시작',
        steps: [
          '"Resizer - Command Deck" 핸드아웃을 열거나 !resizer를 입력해 메뉴를 엽니다.',
          '토큰 크기를 바꾸려면 토큰을 선택하고 "크기 변경" 또는 "크리처 크기"를 누릅니다.',
          '페이지를 확대/축소하려면 그 페이지로 가서 "페이지 확대/축소"를 누릅니다. 2는 모든 것을 두 배로, 0.5는 절반으로 만듭니다.',
          '맵을 격자에 맞추려면 맵의 칸 몇 개 위에 사각형을 그리고, 그 사각형과 맵을 선택한 다음 "맵 보정"을 누릅니다.',
          '마음이 바뀌었나요? "되돌리기"를 누르세요.',
        ],
      },
      zoom: {
        heading: '페이지 확대/축소',
        intro:
          '확대/축소는 페이지와 그 위의 모든 것을 왼쪽 위 모서리를 기준으로 크기를 조절합니다. 격자 칸은 커지거나 작아지지만 한 칸이 나타내는 거리는 그대로입니다(5 ft는 5 ft 그대로). 그래서 자, 오라, 토큰의 빛과 시야도 똑같이 측정됩니다.',
        points: [
          '토큰, 맵 그래픽, Jumpgate와 Legacy 그림, 텍스트, 다이내믹 라이팅 벽, 문, 창문, 격자 오프셋을 옮기고 크기를 조절합니다.',
          '배율은 2, 0.5, 150%, 1/2 또는 140 px 칸으로 만드는 "to 140"을 쓸 수 있습니다.',
          '토큰 크기 유지(설정 또는 --keep-tokens)를 쓰면 토큰은 맵과 함께 움직이지만 크기는 그대로입니다.',
          '그림의 선 굵기는 설정을 끄지 않는 한 페이지와 함께 조절됩니다. 벽의 굵기는 그대로입니다.',
          'Legacy 그림은 새 크기로 다시 그려지므로(Mod가 바꾼 Legacy 그림을 Jumpgate가 다시 그리지 않기 때문) 새 ID를 받습니다.',
        ],
      },
      calibrate: {
        heading: '맵을 격자에 맞추기',
        intro:
          '많은 맵은 자체 크기의 자체 격자로 그려져 있습니다. 보정은 맵의 칸이 페이지의 칸과 같아지도록 크기를 조절하고, 선이 겹치도록 맵을 옮깁니다.',
        steps: [
          '맵을 페이지에 놓고 맵의 칸 몇 개 위에 선에서 선까지 사각형을 그립니다(아무 그리기 도구나 가능).',
          '맵과 사각형을 함께 선택합니다(Shift-클릭).',
          '"맵 보정"을 누르고 상자가 가로와 세로로 몇 칸을 덮는지 답합니다.',
          '그 칸들이 페이지 격자에 정확히 맞도록 맵의 크기가 조절되고 옮겨집니다. 상자는 삭제됩니다.',
        ],
        points: [
          '"보정 후 페이지 맞추기"는 맵을 페이지 모서리로 옮기고 페이지 크기도 맵에 맞게 바꿉니다.',
          '"픽셀로 보정"은 상자를 쓰지 않습니다. 지금 그려진 맵의 한 칸 크기를 픽셀로 지정하세요.',
          '상자가 클수록(칸이 많을수록) 더 정확하게 맞습니다.',
        ],
      },
      sizes: {
        heading: '크리처 크기',
        intro: '크기는 토큰을 그 페이지의 격자 칸 기준 크리처 크기로 설정합니다.',
        colSize: '크기',
        colCommand: '명령어',
        colCells: '칸',
        cells: '{cells} × {cells}',
      },
      pages: {
        heading: '여러 페이지를 한 번에',
        points: [
          '"페이지 고르기"를 누르면 모든 페이지 목록이 열립니다. 원하는 페이지에 체크하고 "체크한 페이지 확대/축소"를 누르세요.',
          '입력할 때: zoom 2 --pages all, --pages picked, --pages current, 또는 쉼표로 구분한 이름과 ID(--pages Town, Docks).',
          '되돌리기 한 번으로 묶음 전체가 취소됩니다.',
        ],
      },
      undo: {
        heading: '되돌리기',
        points: [
          '모든 변경(크기 변경, 페이지 맞추기, 가운데로, 보정, 페이지 크기, 확대/축소)은 되돌릴 수 있습니다.',
          '최근 10개의 변경은 게임과 함께 저장되므로 Mod 샌드박스를 다시 시작해도 남아 있습니다.',
          '변경 뒤에 삭제된 오브젝트는 알려 주고 건너뜁니다.',
          '아주 큰 변경(오브젝트 수천 개)은 저장하지 못할 수 있습니다. 그럴 때는 Resizer가 알려 줍니다.',
        ],
      },
      commands: {
        heading: '명령어',
        intro: '{command} 뒤에 다음 중 하나를 입력하세요. !resizer와 !rsz도 언제나 쓸 수 있습니다.',
        colCommand: '명령어',
        colDesc: '하는 일',
      },
      settings: {
        heading: '설정',
        intro: '설정 카드에서 또는 set <setting> <value>로 바꿀 수 있습니다.',
        colKey: '설정',
        colDesc: '하는 일',
        rows: {
          language: '메뉴, 메시지, 핸드아웃의 언어.',
          command: '명령어의 추가 이름(0.0.9에서는 명령어 이름을 바꿀 수 있었습니다).',
          keepTokenSize: '확대/축소할 때 토큰을 옮기지만 크기는 유지합니다.',
          scaleStrokes: '확대/축소할 때 그림의 선 굵기도 조절합니다(벽 굵기는 그대로).',
          deleteCalibrationBox: '보정할 때 측정에 쓴 상자를 삭제합니다.',
        },
      },
      api: {
        heading: 'Mod 제작자용',
        intro: '다른 Mod에서 전역 Resizer 오브젝트를 쓸 수 있습니다.',
        colFunction: '함수',
        colDesc: '하는 일',
        rows: {
          zoomPage:
            '페이지를 위에 있는 모든 것과 함께 확대/축소하며 되돌릴 수 있습니다. options.keepTokens는 토큰 크기를 유지합니다.',
          undo: '가장 최근 변경을 되돌립니다.',
          onZoom:
            '확대/축소할 때마다(되돌릴 때는 1/factor로) 지정한 함수를 호출하므로, 페이지 위치를 저장하는 Mod도 따라갈 수 있습니다.',
          history: '되돌릴 수 있는 변경 목록을 돌려줍니다.',
        },
      },
      upgrading: {
        heading: '0.0.9에서 업그레이드',
        points: [
          '이전 스크립트를 이것으로 바꾸세요. 바꿔 둔 명령어 이름은 그대로 유지됩니다.',
          '이전 명령어도 계속 쓸 수 있으며, 아래의 새 명령어와 같은 일을 합니다.',
          'scale은 더 이상 한 칸당 거리를 바꾸지 않습니다(5 ft 칸은 5 ft 그대로).',
        ],
        colOld: '0.0.9',
        colNew: '1.0',
      },
      troubleshooting: {
        heading: '문제 해결',
        points: [
          '페이지 위의 위치를 기억하는 다른 Mod(순찰 경로, 토큰 원위치, 저장된 영역 등)는 Resizer.onZoom을 쓰지 않으면 확대/축소를 알지 못합니다. 확대/축소한 뒤 확인하세요.',
          '육각형 페이지도 사각형 페이지처럼 확대/축소되지만, 토큰이 육각형 칸 안에 제대로 있는지 확인하세요.',
          '확대/축소 직후 그림이 제자리에 있지 않아 보이면 페이지를 새로 고치세요. Roll20이 늦게 다시 그릴 때가 있습니다.',
          '보정하려면 맵이 페이지와 반듯해야 합니다. 먼저 0°, 90°, 180° 또는 270°로 돌려 주세요.',
        ],
      },
      languages: {
        heading: '언어',
        body: '설정 카드, set language <code> 또는 Mod 설정에서 언어를 고르세요.',
        colLanguage: '언어',
        colNative: '현지어 이름',
        colCode: '코드',
      },
      credits: {
        heading: '만든 사람',
        original: '원본 Mod 제작:',
        maintainer: '재작성 및 유지 관리:',
        thread: '포럼 스레드',
        support:
          '문제를 찾았거나 아이디어가 있나요? 포럼 스레드에 글을 올리거나 GitHub에 이슈를 등록하세요.',
      },
    },
  };

  var localePl = {
    titles: {
      ready: 'Resizer jest gotowy.',
      history: 'Resizer – historia',
      pages: 'Resizer – strony',
      settings: 'Resizer – ustawienia',
      help: 'Resizer – pomoc',
    },
    menu: {
      selected: 'Zaznaczone',
      nothingSelected: 'Nic nie zaznaczono. Najpierw zaznacz żetony, mapę lub rysunki.',
      graphicSize: '{name}: {width} × {height} px ({across} × {down} pól)',
      andMore: '…i {count} więcej.',
      map: 'Mapa',
      mapHint:
        'Narysuj prostokąt na kilku polach samej mapy, zaznacz go razem z mapą, a potem skalibruj.',
      page: 'Strona',
      pageSize: '{across} × {down} pól, {cell} px na pole, {scale} {units} na pole',
      pageCells: '{across} × {down} pól',
      historyEmpty: 'Na razie nie ma czego cofnąć.',
      historyHint: 'Cofnij najpierw wycofuje najnowszą zmianę.',
      minutesAgo: '{minutes} min temu',
      pickerHint: 'Zaznacz strony do wspólnego skalowania i naciśnij Skaluj zaznaczone strony.',
      on: 'Wł.',
      off: 'Wył.',
      handouts: 'Pełna pomoc w materiałach:',
    },
    kinds: {
      graphic: 'Grafika',
      text: 'Tekst',
      pathv2: 'Rysunek',
      path: 'Rysunek',
      door: 'Drzwi',
      window: 'Okno',
    },
    sizes: {
      tiny: 'Drobny',
      small: 'Mały',
      medium: 'Średni',
      large: 'Duży',
      huge: 'Wielki',
      gargantuan: 'Olbrzymi',
    },
    units: {
      px: 'px',
      cells: 'pól',
      units: 'jedn. strony',
    },
    buttons: {
      menu: 'Menu',
      resize: 'Zmień rozmiar',
      creatureSize: 'Rozmiar istoty',
      fit: 'Dopasuj do strony',
      centre: 'Wyśrodkuj',
      sizes: 'Pokaż rozmiary',
      calibrate: 'Kalibruj mapę',
      calibrateFit: 'Kalibruj i dopasuj stronę',
      calibratePx: 'Kalibruj w pikselach',
      zoom: 'Skaluj stronę',
      zoomIn: 'Skaluj ×2',
      zoomOut: 'Skaluj ×½',
      resizePage: 'Zmień rozmiar strony',
      pageSize: 'Rozmiar strony',
      pages: 'Wybierz strony',
      zoomPicked: 'Skaluj zaznaczone strony ({count})',
      pickAll: 'Zaznacz wszystkie',
      pickNone: 'Odznacz wszystkie',
      undo: 'Cofnij',
      undoWhat: 'Cofnij: {what}',
      history: 'Historia',
      clearHistory: 'Wyczyść historię',
      settings: 'Ustawienia',
      help: 'Pomoc',
      resetSettings: 'Przywróć ustawienia',
      rebuild: 'Odbuduj materiały',
    },
    queries: {
      width: 'Szerokość',
      height: 'Wysokość',
      unit: 'Jednostka',
      unitPx: 'Piksele',
      unitCells: 'Pola siatki',
      unitUnits: 'Jednostki strony (70 px)',
      creatureSize: 'Rozmiar istoty',
      keepShape: 'Zachować kształt?',
      yes: 'Tak',
      no: 'Nie - rozciągnij do strony',
      centre: 'Wyśrodkuj',
      both: 'W obu kierunkach',
      across: 'Pola w poziomie ramki',
      down: 'Tylko w pionie',
      downCount: 'Pola w pionie ramki',
      squarePx: 'Piksele na pole mapy obecnie',
      factor: 'Współczynnik skali (2 = dwa razy większe; 0.5 = połowa)',
      tokens: 'Żetony',
      tokensScale: 'Skaluj razem ze stroną',
      tokensKeep: 'Zachowaj ich rozmiar',
      language: 'Język',
      command: 'Nazwa polecenia bez !',
    },
    settings: {
      language: 'Język',
      command: 'Polecenie',
      keepTokenSize: 'Zachowaj rozmiar żetonów przy skalowaniu',
      scaleStrokes: 'Skaluj grubość linii rysunków',
      deleteCalibrationBox: 'Usuń ramkę kalibracji',
    },
    history: {
      change: 'Zmiana',
      zoom: 'Skalowanie ×{factor} strony {page}',
      zoomPages: 'Skalowanie ×{factor} stron: {count}',
      size: 'Zmiana rozmiaru grafik: {count}',
      size_one: 'Zmiana rozmiaru 1 grafiki',
      page: 'Strona {page} na {width} × {height} jedn.',
      fit: 'Dopasowanie grafik do strony: {count}',
      fit_one: 'Dopasowanie 1 grafiki do strony',
      centre: 'Wyśrodkowanie obiektów: {count}',
      centre_one: 'Wyśrodkowanie 1 obiektu',
      calibrate: 'Kalibracja mapy {name}',
      calibrateUnnamed: 'Kalibracja mapy',
    },
    messages: {
      welcome: 'Zaznacz coś i otwórz menu, aby zmienić rozmiar, albo przeskaluj całą stronę.',
      upgraded:
        'Zaktualizowano z Resizer 0.0.9. Twoje polecenie {command} i stare polecenia nadal działają.',
      readyHint: 'Wpisz {command}, aby otworzyć menu, lub otwórz materiał Resizer - Command Deck.',
      zoomed: 'Przeskalowano {page} ×{factor}: przesunięto razem z nią obiektów: {objects}.',
      zoomedPages:
        'Przeskalowano strony ({count}) ×{factor} ({page}): przesunięto razem z nimi obiektów: {objects}.',
      skipped: 'Nie udało się odczytać obiektów ({count}), więc pozostawiono je bez zmian.',
      skipped_one: 'Nie udało się odczytać 1 obiektu, więc pozostawiono go bez zmian.',
      resized: 'Zmieniono rozmiar grafik ({count}) na {width} × {height} {unit}.',
      resized_one: 'Zmieniono rozmiar 1 grafiki na {width} × {height} {unit}.',
      sized: 'Zmieniono rozmiar grafik ({count}) na {size}.',
      sized_one: 'Zmieniono rozmiar 1 grafiki na {size}.',
      pageResized: '{page} ma teraz rozmiar {size}.',
      fitted: 'Dopasowano grafiki ({count}) do strony.',
      fitted_one: 'Dopasowano 1 grafikę do strony.',
      centred: 'Wyśrodkowano obiekty ({count}) na stronie.',
      centred_one: 'Wyśrodkowano 1 obiekt na stronie.',
      calibrated:
        'Skalibrowano: mapa miała pola {square} px; teraz jest przeskalowana ×{scale} do pól {cell} px i wyrównana z siatką.',
      calibratedPage: 'Strona ma teraz {width} × {height} jedn., aby zmieścić mapę.',
      boxRemoved: 'Ramka kalibracji została usunięta (Cofnij ją przywróci).',
      undone: 'Cofnięto: {what}.',
      undoMissing:
        'Obiekty ({count}) zostały w międzyczasie usunięte, więc nie dało się ich przywrócić.',
      undoMissing_one: '1 obiekt został w międzyczasie usunięty, więc nie dało się go przywrócić.',
      notStored: 'Ta zmiana była zbyt duża, by zachować ją w historii cofania.',
      historyCleared: 'Zapomniano zmiany: {count}.',
      historyCleared_one: 'Zapomniano 1 zmianę.',
      settingChanged: '{key} ma teraz wartość {value}.',
      settingsReset: 'Przywrócono domyślne ustawienia. Historia cofania została zachowana.',
      handoutsRebuilt: 'Materiały Help i Command Deck zostały odbudowane.',
    },
    errors: {
      unexpected: 'Coś poszło nie tak: {message}',
      unknownCommand: 'Nieznane polecenie "{command}". Wpisz {help}, aby zobaczyć polecenia.',
      noSelection: 'Najpierw coś zaznacz (lub podaj --ids).',
      unknownIds: 'Brak obiektów o tych ID: {ids}',
      noGraphics:
        'Żadnego z zaznaczonych obiektów nie da się tak zmienić. Zaznacz żetony lub mapę.',
      badSize: 'Podaj szerokość i wysokość większe od 0, na przykład size 140 140 px.',
      badCreatureSize: 'Nieznany rozmiar. Użyj tiny, small, medium, large, huge lub gargantuan.',
      badPageSize: 'Podaj szerokość i wysokość strony od 1 do {max} jedn.',
      badFactor: 'Podaj współczynnik skali od {min} do {max}.',
      badFactorText:
        'Nie udało się odczytać "{text}" jako współczynnika skali. Spróbuj 2, 0.5, 150%, 1/2 lub "to 140".',
      factorOne: 'Skala 1 niczego nie zmienia.',
      pageTooBig: '{page} byłaby mniejsza niż 1 jedn. lub większa niż {max} jedn.',
      noPage: 'Nie znaleziono strony.',
      noPages: 'Brak stron do zmiany. Zaznacz kilka w wyborze stron lub podaj --pages.',
      unknownPages: 'Brak stron o nazwach: {pages}',
      noMap: 'Zaznacz także grafikę mapy.',
      noBox:
        'Zaznacz oprócz mapy prostokąt narysowany na kilku polach mapy albo użyj calibrate --cell <px>.',
      boxUnreadable: 'Nie udało się odczytać rozmiaru zaznaczonego rysunku.',
      boxTooSmall: 'Ramka kalibracji jest za mała. Narysuj ją na jednym lub kilku całych polach.',
      badCount: 'Podaj liczbę pól w poziomie (i w pionie) ramki, np. 3 lub 3 2.',
      badSquarePx: 'Podaj rozmiar pola mapy w pikselach, co najmniej 2.',
      mapRotated: 'Obróć mapę prosto względem strony (0°, 90°, 180° lub 270°) przed kalibracją.',
      nothingToUndo: 'Nie ma czego cofnąć.',
      badSetting: 'Nieznane ustawienie "{key}". Ustawienia: {settings}',
      badValue: '"{value}" nie jest wartością, którą przyjmuje {key}.',
    },
    help: {
      menu: 'Otwórz menu; gdy obiekty są zaznaczone, pokazuje ich rozmiary.',
      size: 'Zmień rozmiar zaznaczonych grafik (domyślnie w pikselach).',
      creature: 'Zmień rozmiar zaznaczonych żetonów na rozmiar istoty, w polach siatki.',
      fit: 'Dopasuj zaznaczone grafiki do strony; --keep-ratio zachowuje ich kształt.',
      center: 'Wyśrodkuj zaznaczone grafiki lub tekst na stronie.',
      calibrate:
        'Przeskaluj zaznaczoną mapę tak, aby pola wewnątrz zaznaczonej ramki pasowały do siatki strony, a potem je wyrównaj.',
      calibrateCell: 'Przeskaluj zaznaczoną mapę na podstawie rozmiaru jej pola w pikselach.',
      page: 'Pokaż rozmiar strony lub zmień rozmiar strony (nie tego, co na niej jest).',
      zoom: 'Skaluj strony razem ze wszystkim, co na nich jest; odległość na pole się nie zmienia.',
      pages: 'Otwórz wybór stron lub zaznacz strony, aby skalować kilka naraz.',
      undo: 'Cofnij najnowszą zmianę (zapamiętywanych jest ostatnich 10).',
      history: 'Wyświetl zmiany, które można cofnąć; clear je zapomina.',
      settings: 'Pokaż lub zmień ustawienia.',
      reset: 'Przywróć domyślne ustawienia.',
      journal: 'Odbuduj materiały Help i Command Deck.',
      help: 'Pokaż tę listę.',
    },
    deck: {
      menuTitle: 'Menu',
      menuDesc: 'Menu główne pokazuje zaznaczenie, stronę i to, co możesz cofnąć.',
      selectedTitle: 'Zaznaczone żetony i grafiki',
      selectedDesc: 'Najpierw zaznacz, potem naciśnij przycisk.',
      mapTitle: 'Mapa',
      mapDesc: 'Zaznacz mapę i ramkę narysowaną na kilku jej polach.',
      pageTitle: 'Strona',
      pageDesc: 'Skaluj stronę, na której jesteś, razem ze wszystkim, co na niej jest.',
      historyTitle: 'Historia',
      historyDesc: 'Cofnij wycofuje najnowszą zmianę.',
      footer: 'Pełne instrukcje są w materiale {help}.',
    },
    handout: {
      versionLabel: 'Wersja',
      subtitle: 'Zmiana rozmiaru żetonów, map i całych stron',
      footer: 'Przyciski do każdej czynności są w materiale {deck}.',
      overview: {
        heading: 'Przegląd',
        body: 'Resizer zmienia rozmiar zaznaczonych żetonów i map, zmienia rozmiar stron i skaluje całą stronę ze wszystkim, co na niej jest: mapą, żetonami, rysunkami, tekstem, ścianami, drzwiami i oknami. Działa w edytorach Jumpgate i Legacy, zachowuje odległość na pole siatki, wyrównuje mapy z siatką i potrafi cofnąć swoich ostatnich 10 zmian.',
      },
      quickStart: {
        heading: 'Szybki start',
        steps: [
          'Otwórz materiał Resizer - Command Deck lub wpisz !resizer, aby otworzyć menu.',
          'Aby zmienić rozmiar żetonów, zaznacz je i naciśnij Zmień rozmiar lub Rozmiar istoty.',
          'Aby przeskalować stronę, przejdź na nią i naciśnij Skaluj stronę; 2 podwaja wszystko, 0.5 zmniejsza o połowę.',
          'Aby dopasować mapę do siatki, narysuj prostokąt na kilku polach mapy, zaznacz go razem z mapą i naciśnij Kalibruj mapę.',
          'Zmiana zdania? Naciśnij Cofnij.',
        ],
      },
      zoom: {
        heading: 'Skalowanie stron',
        intro:
          'Skalowanie zmienia rozmiar strony i wszystkiego, co na niej jest, względem jej lewego górnego rogu. Pola siatki stają się większe lub mniejsze, ale każde pole nadal oznacza tę samą odległość (5 ft zostaje 5 ft), więc linijki, aury, światła żetonów i widzenie mierzą tak samo.',
        points: [
          'Przesuwa i skaluje żetony, grafiki map, rysunki Jumpgate i Legacy, tekst, ściany dynamicznego oświetlenia, drzwi i okna oraz przesunięcie siatki.',
          'Współczynnik może wynosić 2, 0.5, 150%, 1/2 lub "to 140" dla pól 140 px.',
          'Zachowaj rozmiar żetonów (ustawienie lub --keep-tokens) przesuwa żetony razem z mapą, ale nie zmienia ich rozmiaru.',
          'Grubość linii rysunków skaluje się razem ze stroną, chyba że ustawienie jest wyłączone; ściany zachowują swoją grubość.',
          'Rysunki Legacy są rysowane od nowa w nowym rozmiarze (Jumpgate nie odrysowuje rysunku Legacy zmienionego przez Mod), więc dostają nowe ID.',
        ],
      },
      calibrate: {
        heading: 'Dopasowanie mapy do siatki',
        intro:
          'Wiele map ma własną siatkę we własnym rozmiarze. Kalibracja skaluje mapę tak, by jej pola pasowały do pól strony, i przesuwa ją tak, by linie się zeszły.',
        steps: [
          'Połóż mapę na stronie i narysuj prostokąt (dowolnym narzędziem do rysowania) na kilku polach mapy, od linii do linii.',
          'Zaznacz razem mapę i prostokąt (Shift+klik).',
          'Naciśnij Kalibruj mapę i podaj, ile pól ramka obejmuje w poziomie i w pionie.',
          'Mapa zostaje przeskalowana i przesunięta tak, aby te pola dokładnie pasowały do siatki strony; ramka zostaje usunięta.',
        ],
        points: [
          'Kalibruj i dopasuj stronę dodatkowo przesuwa mapę do rogu strony i dopasowuje rozmiar strony do mapy.',
          'Kalibruj w pikselach pomija ramkę: podaj rozmiar pola mapy w pikselach tak, jak jest teraz narysowana.',
          'Większa ramka (więcej pól) daje dokładniejsze dopasowanie.',
        ],
      },
      sizes: {
        heading: 'Rozmiary istot',
        intro: 'Rozmiar ustawia żetony na rozmiar istoty w polach siatki ich strony.',
        colSize: 'Rozmiar',
        colCommand: 'Polecenie',
        colCells: 'Pola',
        cells: '{cells} × {cells}',
      },
      pages: {
        heading: 'Kilka stron naraz',
        points: [
          'Wybierz strony otwiera listę wszystkich stron; zaznacz te, które chcesz, i naciśnij Skaluj zaznaczone strony.',
          'Wpisując: zoom 2 --pages all, --pages picked, --pages current albo nazwy i ID rozdzielone przecinkami (--pages Town, Docks).',
          'Jedno cofnięcie wycofuje całą partię.',
        ],
      },
      undo: {
        heading: 'Cofanie',
        points: [
          'Każdą zmianę (rozmiar, dopasowanie, wyśrodkowanie, kalibracja, rozmiar strony, skalowanie) można cofnąć.',
          'Ostatnich 10 zmian jest zapisywanych w grze, więc przetrwają restart piaskownicy Modów.',
          'Obiekty usunięte po zmianie są zgłaszane i pomijane.',
          'Bardzo duże zmiany (tysiące obiektów) mogą być zbyt duże, by je zachować; Resizer o tym poinformuje.',
        ],
      },
      commands: {
        heading: 'Polecenia',
        intro: 'Wpisz {command} z jednym z tych poleceń. !resizer i !rsz też zawsze działają.',
        colCommand: 'Polecenie',
        colDesc: 'Co robi',
      },
      settings: {
        heading: 'Ustawienia',
        intro: 'Zmieniaj je na karcie Ustawienia lub poleceniem set <setting> <value>.',
        colKey: 'Ustawienie',
        colDesc: 'Co robi',
        rows: {
          language: 'Język menu, komunikatów i materiałów.',
          command: 'Dodatkowa nazwa polecenia (0.0.9 pozwalała ją zmienić).',
          keepTokenSize: 'Skalowanie przesuwa żetony, ale zachowuje ich rozmiar.',
          scaleStrokes: 'Skalowanie zmienia grubość linii rysunków (ściany zachowują swoją).',
          deleteCalibrationBox: 'Kalibracja usuwa zmierzoną ramkę.',
        },
      },
      api: {
        heading: 'Dla autorów Modów',
        intro: 'Inne Mody mogą korzystać z globalnego obiektu Resizer.',
        colFunction: 'Funkcja',
        colDesc: 'Co robi',
        rows: {
          zoomPage:
            'Skaluje stronę ze wszystkim, co na niej jest, z możliwością cofnięcia. options.keepTokens zachowuje rozmiary żetonów.',
          undo: 'Cofa najnowszą zmianę.',
          onZoom:
            'Wywołuje twoją funkcję po każdym skalowaniu (oraz z 1/factor po jego cofnięciu), aby Mod przechowujący pozycje na stronie mógł nadążyć.',
          history: 'Wyświetla zmiany, które można cofnąć.',
        },
      },
      upgrading: {
        heading: 'Aktualizacja z 0.0.9',
        points: [
          'Zastąp stary skrypt tym; twoje zmienione polecenie zostanie zachowane.',
          'Stare polecenia nadal działają i robią to samo, co nowe poniżej.',
          'scale nie zmienia już odległości na pole (pole 5 ft zostaje 5 ft).',
        ],
        colOld: '0.0.9',
        colNew: '1.0',
      },
      troubleshooting: {
        heading: 'Rozwiązywanie problemów',
        points: [
          'Inne Mody, które zapamiętują pozycje na stronie (trasy patroli, miejsca żetonów, zapisane obszary), nie dowiadują się o skalowaniu, chyba że używają Resizer.onZoom; sprawdź je po skalowaniu.',
          'Strony heksagonalne skalują się jak kwadratowe, ale sprawdź, czy żetony nadal stoją w swoich heksach.',
          'Jeśli rysunek tuż po skalowaniu wygląda na przesunięty, odśwież stronę: Roll20 czasem rysuje z opóźnieniem.',
          'Kalibracja wymaga mapy ustawionej prosto względem strony; najpierw obróć ją do 0°, 90°, 180° lub 270°.',
        ],
      },
      languages: {
        heading: 'Języki',
        body: 'Wybierz język na karcie Ustawienia, poleceniem set language <code> lub w ustawieniach Moda.',
        colLanguage: 'Język',
        colNative: 'Nazwa rodzima',
        colCode: 'Kod',
      },
      credits: {
        heading: 'Autorzy',
        original: 'Autor oryginalnego Moda:',
        maintainer: 'Przepisał i utrzymuje',
        thread: 'Wątek na forum',
        support:
          'Znalazłeś problem lub masz pomysł? Napisz w wątku na forum lub zgłoś issue na GitHubie.',
      },
    },
  };

  var localePtPT = {
    titles: {
      ready: 'O Resizer está pronto.',
      history: 'Histórico do Resizer',
      pages: 'Páginas do Resizer',
      settings: 'Definições do Resizer',
      help: 'Ajuda do Resizer',
    },
    menu: {
      selected: 'Selecionado',
      nothingSelected: 'Nada selecionado. Selecione primeiro tokens, um mapa ou desenhos.',
      graphicSize: '{name}: {width} × {height} px ({across} × {down} células)',
      andMore: '…e mais {count}.',
      map: 'Mapa',
      mapHint:
        'Desenhe um retângulo sobre alguns quadrados do próprio mapa, selecione-o com o mapa e calibre.',
      page: 'Página',
      pageSize: '{across} × {down} células, {cell} px por célula, {scale} {units} por célula',
      pageCells: '{across} × {down} células',
      historyEmpty: 'Ainda não há nada para anular.',
      historyHint: 'Anular desfaz primeiro a alteração mais recente.',
      minutesAgo: 'há {minutes} min',
      pickerHint: 'Assinale as páginas a ampliar em conjunto e prima Zoom às assinaladas.',
      on: 'Ligado',
      off: 'Desligado',
      handouts: 'Ajuda completa nos folhetos:',
    },
    kinds: {
      graphic: 'Gráfico',
      text: 'Texto',
      pathv2: 'Desenho',
      path: 'Desenho',
      door: 'Porta',
      window: 'Janela',
    },
    sizes: {
      tiny: 'Miúdo',
      small: 'Pequeno',
      medium: 'Médio',
      large: 'Grande',
      huge: 'Enorme',
      gargantuan: 'Imenso',
    },
    units: {
      px: 'px',
      cells: 'células',
      units: 'unidades de página',
    },
    buttons: {
      menu: 'Menu',
      resize: 'Redimensionar',
      creatureSize: 'Tamanho de criatura',
      fit: 'Ajustar à página',
      centre: 'Centrar',
      sizes: 'Mostrar tamanhos',
      calibrate: 'Calibrar mapa',
      calibrateFit: 'Calibrar e ajustar página',
      calibratePx: 'Calibrar por píxeis',
      zoom: 'Zoom à página',
      zoomIn: 'Zoom ×2',
      zoomOut: 'Zoom ×½',
      resizePage: 'Redimensionar página',
      pageSize: 'Tamanho da página',
      pages: 'Escolher páginas',
      zoomPicked: 'Zoom às assinaladas ({count})',
      pickAll: 'Assinalar todas',
      pickNone: 'Desassinalar todas',
      undo: 'Anular',
      undoWhat: 'Anular: {what}',
      history: 'Histórico',
      clearHistory: 'Limpar histórico',
      settings: 'Definições',
      help: 'Ajuda',
      resetSettings: 'Repor definições',
      rebuild: 'Recriar folhetos',
    },
    queries: {
      width: 'Largura',
      height: 'Altura',
      unit: 'Unidade',
      unitPx: 'Píxeis',
      unitCells: 'Células da grelha',
      unitUnits: 'Unidades de página (70 px)',
      creatureSize: 'Tamanho de criatura',
      keepShape: 'Manter a forma?',
      yes: 'Sim',
      no: 'Não - esticar até à página',
      centre: 'Centrar',
      both: 'Nos dois sentidos',
      across: 'Quadrados na largura da caixa',
      down: 'Só na vertical',
      downCount: 'Quadrados na altura da caixa',
      squarePx: 'Píxeis por quadrado no mapa agora',
      factor: 'Fator de zoom (2 = o dobro; 0.5 = metade)',
      tokens: 'Tokens',
      tokensScale: 'Escalar com a página',
      tokensKeep: 'Manter o tamanho',
      language: 'Idioma',
      command: 'Nome do comando sem !',
    },
    settings: {
      language: 'Idioma',
      command: 'Comando',
      keepTokenSize: 'Manter o tamanho dos tokens ao fazer zoom',
      scaleStrokes: 'Escalar a espessura das linhas dos desenhos',
      deleteCalibrationBox: 'Eliminar a caixa de calibração',
    },
    history: {
      change: 'Alteração',
      zoom: 'Zoom ×{factor} em {page}',
      zoomPages: 'Zoom ×{factor} em {count} páginas',
      size: 'Redimensionar {count} gráficos',
      size_one: 'Redimensionar 1 gráfico',
      page: 'Página {page} para {width} × {height} unidades',
      fit: 'Ajustar {count} gráficos à página',
      fit_one: 'Ajustar 1 gráfico à página',
      centre: 'Centrar {count} objetos',
      centre_one: 'Centrar 1 objeto',
      calibrate: 'Calibrar o mapa {name}',
      calibrateUnnamed: 'Calibrar o mapa',
    },
    messages: {
      welcome:
        'Selecione algo e abra o menu para o redimensionar, ou faça zoom a uma página inteira.',
      upgraded:
        'Atualizado a partir do Resizer 0.0.9. O seu comando {command} e os comandos antigos continuam a funcionar.',
      readyHint: 'Escreva {command} para abrir o menu, ou abra o folheto Resizer - Command Deck.',
      zoomed: 'Zoom a {page} ×{factor}: {objects} objetos foram movidos com ela.',
      zoomedPages:
        'Zoom a {count} páginas ×{factor} ({page}): {objects} objetos foram movidos com elas.',
      skipped: 'Não foi possível ler {count} objetos; ficaram como estavam.',
      skipped_one: 'Não foi possível ler 1 objeto; ficou como estava.',
      resized: '{count} gráficos redimensionados para {width} × {height} {unit}.',
      resized_one: '1 gráfico redimensionado para {width} × {height} {unit}.',
      sized: '{count} gráficos redimensionados para {size}.',
      sized_one: '1 gráfico redimensionado para {size}.',
      pageResized: '{page} tem agora {size}.',
      fitted: '{count} gráficos ajustados à página.',
      fitted_one: '1 gráfico ajustado à página.',
      centred: '{count} objetos centrados na página.',
      centred_one: '1 objeto centrado na página.',
      calibrated:
        'Calibrado: o mapa tinha quadrados de {square} px; está agora escalado ×{scale} para células de {cell} px e alinhado com a grelha.',
      calibratedPage: 'A página tem agora {width} × {height} unidades para caber o mapa.',
      boxRemoved: 'A caixa de calibração foi eliminada (Anular repõe-na).',
      undone: 'Anulado: {what}.',
      undoMissing: '{count} objetos foram entretanto eliminados e não puderam ser repostos.',
      undoMissing_one: '1 objeto foi entretanto eliminado e não pôde ser reposto.',
      notStored: 'Esta alteração era demasiado grande para guardar no histórico.',
      historyCleared: '{count} alterações esquecidas.',
      historyCleared_one: '1 alteração esquecida.',
      settingChanged: '{key} é agora {value}.',
      settingsReset: 'As definições voltaram aos valores predefinidos. O histórico foi mantido.',
      handoutsRebuilt: 'Os folhetos Help e Command Deck foram recriados.',
    },
    errors: {
      unexpected: 'Ocorreu um erro: {message}',
      unknownCommand: 'Comando desconhecido "{command}". Escreva {help} para ver os comandos.',
      noSelection: 'Selecione primeiro algo (ou indique --ids).',
      unknownIds: 'Nenhum objeto com estes IDs: {ids}',
      noGraphics:
        'Nenhum dos objetos selecionados pode ser alterado desta forma. Selecione tokens ou um mapa.',
      badSize: 'Indique uma largura e uma altura acima de 0, por exemplo size 140 140 px.',
      badCreatureSize: 'Tamanho desconhecido. Use tiny, small, medium, large, huge ou gargantuan.',
      badPageSize: 'Indique uma largura e uma altura de página entre 1 e {max} unidades.',
      badFactor: 'Indique um fator de zoom entre {min} e {max}.',
      badFactorText:
        'Não foi possível ler "{text}" como fator de zoom. Experimente 2, 0.5, 150%, 1/2 ou "to 140".',
      factorOne: 'Um zoom de 1 não altera nada.',
      pageTooBig: '{page} ficaria com menos de 1 unidade ou mais de {max} unidades.',
      noPage: 'Não foi possível encontrar a página.',
      noPages:
        'Não há páginas para alterar. Assinale algumas no seletor de páginas, ou indique --pages.',
      unknownPages: 'Nenhuma página com o nome: {pages}',
      noMap: 'Selecione também o gráfico do mapa.',
      noBox:
        'Selecione, além do mapa, um retângulo desenhado sobre alguns quadrados do mapa, ou use calibrate --cell <px>.',
      boxUnreadable: 'Não foi possível ler o tamanho do desenho selecionado.',
      boxTooSmall:
        'A caixa de calibração é demasiado pequena. Desenhe-a sobre um ou mais quadrados inteiros.',
      badCount: 'Indique o número de quadrados na largura (e na altura) da caixa, como 3 ou 3 2.',
      badSquarePx: 'Indique o tamanho do quadrado do mapa em píxeis, 2 ou mais.',
      mapRotated:
        'Rode o mapa para ficar alinhado com a página (0°, 90°, 180° ou 270°) antes de calibrar.',
      nothingToUndo: 'Nada para anular.',
      badSetting: 'Definição desconhecida "{key}". Definições: {settings}',
      badValue: '"{value}" não é um valor aceite por {key}.',
    },
    help: {
      menu: 'Abre o menu; com objetos selecionados, mostra os respetivos tamanhos.',
      size: 'Redimensiona os gráficos selecionados (em píxeis por predefinição).',
      creature:
        'Redimensiona os tokens selecionados para um tamanho de criatura, em células da grelha.',
      fit: 'Ajusta os gráficos selecionados à página; --keep-ratio mantém a forma.',
      center: 'Centra os gráficos ou textos selecionados na página.',
      calibrate:
        'Escala o mapa selecionado para que os quadrados dentro da caixa selecionada coincidam com a grelha da página e depois alinha-os.',
      calibrateCell: 'Escala o mapa selecionado a partir do tamanho do quadrado em píxeis.',
      page: 'Mostra o tamanho da página, ou redimensiona a página (não o que está nela).',
      zoom: 'Faz zoom às páginas com tudo o que contêm; a distância por célula mantém-se.',
      pages: 'Abre o seletor de páginas, ou assinala páginas, para fazer zoom a várias de uma vez.',
      undo: 'Anula a alteração mais recente (as últimas 10 ficam guardadas).',
      history: 'Lista as alterações que pode anular; clear esquece-as.',
      settings: 'Mostra ou altera as definições.',
      reset: 'Repõe as definições predefinidas.',
      journal: 'Recria os folhetos Help e Command Deck.',
      help: 'Mostra esta lista.',
    },
    deck: {
      menuTitle: 'Menu',
      menuDesc: 'O menu principal mostra a seleção, a página e o que pode anular.',
      selectedTitle: 'Tokens e gráficos selecionados',
      selectedDesc: 'Selecione primeiro e depois prima um botão.',
      mapTitle: 'Mapa',
      mapDesc: 'Selecione o mapa e uma caixa desenhada sobre alguns dos seus quadrados.',
      pageTitle: 'Página',
      pageDesc: 'Faz zoom à página onde está, com tudo o que contém.',
      historyTitle: 'Histórico',
      historyDesc: 'Anular desfaz a alteração mais recente.',
      footer: 'As instruções completas estão no folheto {help}.',
    },
    handout: {
      versionLabel: 'Versão',
      subtitle: 'Redimensione tokens, mapas e páginas inteiras',
      footer: 'Os botões para cada ação estão no folheto {deck}.',
      overview: {
        heading: 'Visão geral',
        body: 'O Resizer redimensiona tokens e mapas selecionados, redimensiona páginas e faz zoom a uma página inteira com tudo o que contém: mapa, tokens, desenhos, textos, paredes, portas e janelas. Funciona com os editores Jumpgate e Legacy, mantém a distância por célula da grelha, alinha mapas com a grelha e consegue anular as suas últimas 10 alterações.',
      },
      quickStart: {
        heading: 'Início rápido',
        steps: [
          'Abra o folheto Resizer - Command Deck, ou escreva !resizer para abrir o menu.',
          'Para redimensionar tokens, selecione-os e prima Redimensionar ou Tamanho de criatura.',
          'Para fazer zoom a uma página, vá até ela e prima Zoom à página; 2 duplica tudo, 0.5 reduz para metade.',
          'Para ajustar um mapa à grelha, desenhe um retângulo sobre alguns quadrados do mapa, selecione-o com o mapa e prima Calibrar mapa.',
          'Mudou de ideias? Prima Anular.',
        ],
      },
      zoom: {
        heading: 'Zoom às páginas',
        intro:
          'O zoom escala uma página e tudo o que contém a partir do canto superior esquerdo. As células da grelha ficam maiores ou mais pequenas, mas cada célula continua a valer a mesma distância (5 ft continuam 5 ft), por isso réguas, auras, luzes e visão dos tokens medem o mesmo.',
        points: [
          'Move e escala tokens, gráficos de mapa, desenhos do Jumpgate e do Legacy, textos, paredes de iluminação dinâmica, portas e janelas, e o desvio da grelha.',
          'Os fatores podem ser 2, 0.5, 150%, 1/2, ou "to 140" para células de 140 px.',
          'Manter o tamanho dos tokens (definição ou --keep-tokens) move os tokens com o mapa, mas não lhes altera o tamanho.',
          'A espessura das linhas dos desenhos escala com a página, a não ser que a definição esteja desligada; as paredes mantêm a espessura.',
          'Os desenhos do Legacy são desenhados de novo no novo tamanho (o Jumpgate não redesenha um desenho do Legacy alterado por um Mod), por isso recebem novos IDs.',
        ],
      },
      calibrate: {
        heading: 'Ajustar um mapa à grelha',
        intro:
          'Muitos mapas trazem a sua própria grelha desenhada num tamanho próprio. Calibrar escala o mapa para que os seus quadrados coincidam com as células da página e move-o para que as linhas se encontrem.',
        steps: [
          'Coloque o mapa na página e desenhe um retângulo (com qualquer ferramenta de desenho) sobre alguns quadrados do mapa, de linha a linha.',
          'Selecione o mapa e o retângulo em conjunto (Shift-clique).',
          'Prima Calibrar mapa e responda quantos quadrados a caixa cobre na largura e na altura.',
          'O mapa é escalado e movido para que esses quadrados coincidam exatamente com a grelha da página; a caixa é eliminada.',
        ],
        points: [
          'Calibrar e ajustar página também move o mapa para o canto da página e redimensiona a página à medida do mapa.',
          'Calibrar por píxeis dispensa a caixa: indique o tamanho do quadrado do mapa em píxeis, tal como está desenhado agora.',
          'Uma caixa maior (mais quadrados) dá um ajuste mais exato.',
        ],
      },
      sizes: {
        heading: 'Tamanhos de criatura',
        intro:
          'O comando size define tokens com um tamanho de criatura em células da grelha da página.',
        colSize: 'Tamanho',
        colCommand: 'Comando',
        colCells: 'Células',
        cells: '{cells} × {cells}',
      },
      pages: {
        heading: 'Várias páginas de uma vez',
        points: [
          'Escolher páginas abre uma lista com todas as páginas; assinale as que quiser e prima Zoom às assinaladas.',
          'Por escrito: zoom 2 --pages all, --pages picked, --pages current, ou nomes e IDs separados por vírgulas (--pages Town, Docks).',
          'Uma única anulação desfaz o lote inteiro.',
        ],
      },
      undo: {
        heading: 'Anular',
        points: [
          'Todas as alterações (redimensionar, ajustar, centrar, calibrar, tamanho da página, zoom) podem ser anuladas.',
          'As últimas 10 alterações ficam guardadas no jogo, por isso sobrevivem a um reinício da sandbox de Mods.',
          'Os objetos eliminados depois da alteração são indicados e ignorados.',
          'Alterações muito grandes (milhares de objetos) podem não caber no histórico; o Resizer avisa.',
        ],
      },
      commands: {
        heading: 'Comandos',
        intro: 'Escreva {command} com um destes. !resizer e !rsz também funcionam sempre.',
        colCommand: 'Comando',
        colDesc: 'O que faz',
      },
      settings: {
        heading: 'Definições',
        intro: 'Altere-as no cartão de Definições ou com set <setting> <value>.',
        colKey: 'Definição',
        colDesc: 'O que faz',
        rows: {
          language: 'Idioma dos menus, mensagens e folhetos.',
          command: 'Um nome adicional para o comando (a 0.0.9 permitia mudar-lhe o nome).',
          keepTokenSize: 'O zoom move os tokens, mas mantém o seu tamanho.',
          scaleStrokes:
            'O zoom escala a espessura das linhas dos desenhos (as paredes mantêm a sua).',
          deleteCalibrationBox: 'Calibrar elimina a caixa que mediu.',
        },
      },
      api: {
        heading: 'Para autores de Mods',
        intro: 'Outros Mods podem usar o objeto global Resizer.',
        colFunction: 'Função',
        colDesc: 'O que faz',
        rows: {
          zoomPage:
            'Faz zoom a uma página com tudo o que contém, com anulação. options.keepTokens mantém o tamanho dos tokens.',
          undo: 'Anula a alteração mais recente.',
          onZoom:
            'Chama a sua função após cada zoom (e com 1/factor após anular um), para que um Mod que guarda posições na página possa acompanhar.',
          history: 'Lista as alterações que podem ser anuladas.',
        },
      },
      upgrading: {
        heading: 'Atualizar a partir da 0.0.9',
        points: [
          'Substitua o script antigo por este; o seu comando com outro nome é mantido.',
          'Os comandos antigos continuam a funcionar e fazem o mesmo que os novos abaixo.',
          'scale já não altera a distância por célula (uma célula de 5 ft continua a ter 5 ft).',
        ],
        colOld: '0.0.9',
        colNew: '1.0',
      },
      troubleshooting: {
        heading: 'Resolução de problemas',
        points: [
          'Outros Mods que memorizam posições numa página (rotas de patrulha, posições de tokens, áreas guardadas) não são avisados de um zoom, a não ser que usem Resizer.onZoom; verifique-os depois do zoom.',
          'As páginas hexagonais fazem zoom como as quadradas, mas verifique se os tokens continuam nos seus hexágonos.',
          'Se um desenho parecer fora do sítio logo após um zoom, recarregue a página: por vezes o Roll20 redesenha com atraso.',
          'Calibrar exige o mapa alinhado com a página; rode-o primeiro para 0°, 90°, 180° ou 270°.',
        ],
      },
      languages: {
        heading: 'Idiomas',
        body: 'Escolha um idioma no cartão de Definições, com set language <code>, ou nas definições do Mod.',
        colLanguage: 'Idioma',
        colNative: 'Nome nativo',
        colCode: 'Código',
      },
      credits: {
        heading: 'Créditos',
        original: 'Mod original de',
        maintainer: 'Reescrito e mantido por',
        thread: 'Tópico no fórum',
        support:
          'Encontrou um problema ou tem uma ideia? Publique no tópico do fórum ou abra um pedido no GitHub.',
      },
    },
  };

  var localePtBR = {
    titles: {
      ready: 'O Resizer está pronto.',
      history: 'Histórico do Resizer',
      pages: 'Páginas do Resizer',
      settings: 'Configurações do Resizer',
      help: 'Ajuda do Resizer',
    },
    menu: {
      selected: 'Selecionado',
      nothingSelected: 'Nada selecionado. Selecione tokens, um mapa ou desenhos primeiro.',
      graphicSize: '{name}: {width} × {height} px ({across} × {down} células)',
      andMore: '…e mais {count}.',
      map: 'Mapa',
      mapHint:
        'Desenhe um retângulo sobre alguns quadrados do próprio mapa, selecione-o junto com o mapa e calibre.',
      page: 'Página',
      pageSize: '{across} × {down} células, {cell} px por célula, {scale} {units} por célula',
      pageCells: '{across} × {down} células',
      historyEmpty: 'Nada para desfazer ainda.',
      historyHint: 'Desfazer reverte primeiro a alteração mais recente.',
      minutesAgo: 'há {minutes} min',
      pickerHint: 'Marque as páginas para dar zoom juntas e depois clique em Zoom nas marcadas.',
      on: 'Ligado',
      off: 'Desligado',
      handouts: 'Ajuda completa nos folhetos:',
    },
    kinds: {
      graphic: 'Gráfico',
      text: 'Texto',
      pathv2: 'Desenho',
      path: 'Desenho',
      door: 'Porta',
      window: 'Janela',
    },
    sizes: {
      tiny: 'Miúdo',
      small: 'Pequeno',
      medium: 'Médio',
      large: 'Grande',
      huge: 'Enorme',
      gargantuan: 'Imenso',
    },
    units: {
      px: 'px',
      cells: 'células',
      units: 'unidades de página',
    },
    buttons: {
      menu: 'Menu',
      resize: 'Redimensionar',
      creatureSize: 'Tamanho de criatura',
      fit: 'Ajustar à página',
      centre: 'Centralizar',
      sizes: 'Mostrar tamanhos',
      calibrate: 'Calibrar mapa',
      calibrateFit: 'Calibrar e ajustar página',
      calibratePx: 'Calibrar por pixels',
      zoom: 'Zoom na página',
      zoomIn: 'Zoom ×2',
      zoomOut: 'Zoom ×½',
      resizePage: 'Redimensionar página',
      pageSize: 'Tamanho da página',
      pages: 'Escolher páginas',
      zoomPicked: 'Zoom nas marcadas ({count})',
      pickAll: 'Marcar todas',
      pickNone: 'Desmarcar todas',
      undo: 'Desfazer',
      undoWhat: 'Desfazer: {what}',
      history: 'Histórico',
      clearHistory: 'Limpar histórico',
      settings: 'Configurações',
      help: 'Ajuda',
      resetSettings: 'Redefinir configurações',
      rebuild: 'Recriar folhetos',
    },
    queries: {
      width: 'Largura',
      height: 'Altura',
      unit: 'Unidade',
      unitPx: 'Pixels',
      unitCells: 'Células da grade',
      unitUnits: 'Unidades de página (70 px)',
      creatureSize: 'Tamanho de criatura',
      keepShape: 'Manter o formato?',
      yes: 'Sim',
      no: 'Não - esticar até a página',
      centre: 'Centralizar',
      both: 'Nos dois sentidos',
      across: 'Quadrados na largura da caixa',
      down: 'Só na vertical',
      downCount: 'Quadrados na altura da caixa',
      squarePx: 'Pixels por quadrado no mapa agora',
      factor: 'Fator de zoom (2 = o dobro; 0.5 = metade)',
      tokens: 'Tokens',
      tokensScale: 'Escalar com a página',
      tokensKeep: 'Manter o tamanho deles',
      language: 'Idioma',
      command: 'Nome do comando sem !',
    },
    settings: {
      language: 'Idioma',
      command: 'Comando',
      keepTokenSize: 'Manter o tamanho dos tokens ao dar zoom',
      scaleStrokes: 'Escalar a espessura das linhas dos desenhos',
      deleteCalibrationBox: 'Apagar a caixa de calibração',
    },
    history: {
      change: 'Alteração',
      zoom: 'Zoom ×{factor} em {page}',
      zoomPages: 'Zoom ×{factor} em {count} páginas',
      size: 'Redimensionar {count} gráficos',
      size_one: 'Redimensionar 1 gráfico',
      page: 'Página {page} para {width} × {height} unidades',
      fit: 'Ajustar {count} gráficos à página',
      fit_one: 'Ajustar 1 gráfico à página',
      centre: 'Centralizar {count} objetos',
      centre_one: 'Centralizar 1 objeto',
      calibrate: 'Calibrar o mapa {name}',
      calibrateUnnamed: 'Calibrar o mapa',
    },
    messages: {
      welcome: 'Selecione algo e abra o menu para redimensionar, ou dê zoom numa página inteira.',
      upgraded:
        'Atualizado do Resizer 0.0.9. Seu comando {command} e os comandos antigos continuam funcionando.',
      readyHint: 'Digite {command} para abrir o menu, ou abra o folheto Resizer - Command Deck.',
      zoomed: 'Zoom em {page} ×{factor}: {objects} objetos foram movidos junto.',
      zoomedPages:
        'Zoom em {count} páginas ×{factor} ({page}): {objects} objetos foram movidos junto.',
      skipped: 'Não foi possível ler {count} objetos; eles ficaram como estavam.',
      skipped_one: 'Não foi possível ler 1 objeto; ele ficou como estava.',
      resized: '{count} gráficos redimensionados para {width} × {height} {unit}.',
      resized_one: '1 gráfico redimensionado para {width} × {height} {unit}.',
      sized: '{count} gráficos redimensionados para {size}.',
      sized_one: '1 gráfico redimensionado para {size}.',
      pageResized: '{page} agora tem {size}.',
      fitted: '{count} gráficos ajustados à página.',
      fitted_one: '1 gráfico ajustado à página.',
      centred: '{count} objetos centralizados na página.',
      centred_one: '1 objeto centralizado na página.',
      calibrated:
        'Calibrado: o mapa tinha quadrados de {square} px; agora está escalado ×{scale} para células de {cell} px e alinhado com a grade.',
      calibratedPage: 'A página agora tem {width} × {height} unidades para caber o mapa.',
      boxRemoved: 'A caixa de calibração foi apagada (Desfazer a traz de volta).',
      undone: 'Desfeito: {what}.',
      undoMissing: '{count} objetos foram apagados depois disso e não puderam ser restaurados.',
      undoMissing_one: '1 objeto foi apagado depois disso e não pôde ser restaurado.',
      notStored: 'Esta alteração era grande demais para guardar no histórico.',
      historyCleared: '{count} alterações esquecidas.',
      historyCleared_one: '1 alteração esquecida.',
      settingChanged: '{key} agora é {value}.',
      settingsReset: 'As configurações voltaram ao padrão. O histórico de desfazer foi mantido.',
      handoutsRebuilt: 'Os folhetos Help e Command Deck foram recriados.',
    },
    errors: {
      unexpected: 'Algo deu errado: {message}',
      unknownCommand: 'Comando desconhecido "{command}". Digite {help} para ver os comandos.',
      noSelection: 'Selecione algo primeiro (ou use --ids).',
      unknownIds: 'Nenhum objeto com estes IDs: {ids}',
      noGraphics:
        'Nenhum dos objetos selecionados pode ser alterado assim. Selecione tokens ou um mapa.',
      badSize: 'Informe uma largura e uma altura acima de 0, por exemplo size 140 140 px.',
      badCreatureSize: 'Tamanho desconhecido. Use tiny, small, medium, large, huge ou gargantuan.',
      badPageSize: 'Informe uma largura e uma altura de página de 1 a {max} unidades.',
      badFactor: 'Informe um fator de zoom de {min} a {max}.',
      badFactorText:
        'Não foi possível ler "{text}" como fator de zoom. Tente 2, 0.5, 150%, 1/2 ou "to 140".',
      factorOne: 'Um zoom de 1 não muda nada.',
      pageTooBig: '{page} ficaria menor que 1 unidade ou maior que {max} unidades.',
      noPage: 'Não foi possível encontrar a página.',
      noPages: 'Nenhuma página para alterar. Marque algumas no seletor de páginas, ou use --pages.',
      unknownPages: 'Nenhuma página chamada: {pages}',
      noMap: 'Selecione também o gráfico do mapa.',
      noBox:
        'Selecione um retângulo desenhado sobre alguns quadrados do mapa junto com o mapa, ou use calibrate --cell <px>.',
      boxUnreadable: 'Não foi possível ler o tamanho do desenho selecionado.',
      boxTooSmall:
        'A caixa de calibração é pequena demais. Desenhe-a sobre um ou mais quadrados inteiros.',
      badCount: 'Informe o número de quadrados na largura (e na altura) da caixa, como 3 ou 3 2.',
      badSquarePx: 'Informe o tamanho do quadrado do mapa em pixels, 2 ou mais.',
      mapRotated:
        'Gire o mapa para ficar alinhado à página (0°, 90°, 180° ou 270°) antes de calibrar.',
      nothingToUndo: 'Nada para desfazer.',
      badSetting: 'Configuração desconhecida "{key}". Configurações: {settings}',
      badValue: '"{value}" não é um valor aceito por {key}.',
    },
    help: {
      menu: 'Abre o menu; com objetos selecionados, mostra os tamanhos deles.',
      size: 'Redimensiona os gráficos selecionados (em pixels por padrão).',
      creature:
        'Redimensiona os tokens selecionados para um tamanho de criatura, em células da grade.',
      fit: 'Ajusta os gráficos selecionados à página; --keep-ratio mantém o formato.',
      center: 'Centraliza os gráficos ou textos selecionados na página.',
      calibrate:
        'Escala o mapa selecionado para que os quadrados dentro da caixa selecionada batam com a grade da página e depois os alinha.',
      calibrateCell: 'Escala o mapa selecionado a partir do tamanho do quadrado em pixels.',
      page: 'Mostra o tamanho da página, ou redimensiona a página (não o que está nela).',
      zoom: 'Dá zoom nas páginas com tudo o que há nelas; a distância por célula é mantida.',
      pages: 'Abre o seletor de páginas, ou marca páginas, para dar zoom em várias de uma vez.',
      undo: 'Desfaz a alteração mais recente (as últimas 10 ficam guardadas).',
      history: 'Lista as alterações que podem ser desfeitas; clear as esquece.',
      settings: 'Mostra ou altera as configurações.',
      reset: 'Volta as configurações ao padrão.',
      journal: 'Recria os folhetos Help e Command Deck.',
      help: 'Mostra esta lista.',
    },
    deck: {
      menuTitle: 'Menu',
      menuDesc: 'O menu principal mostra a seleção, a página e o que dá para desfazer.',
      selectedTitle: 'Tokens e gráficos selecionados',
      selectedDesc: 'Selecione primeiro e depois clique num botão.',
      mapTitle: 'Mapa',
      mapDesc: 'Selecione o mapa e uma caixa desenhada sobre alguns dos quadrados dele.',
      pageTitle: 'Página',
      pageDesc: 'Dá zoom na página em que você está, com tudo o que há nela.',
      historyTitle: 'Histórico',
      historyDesc: 'Desfazer reverte a alteração mais recente.',
      footer: 'As instruções completas estão no folheto {help}.',
    },
    handout: {
      versionLabel: 'Versão',
      subtitle: 'Redimensione tokens, mapas e páginas inteiras',
      footer: 'Os botões para cada ação estão no folheto {deck}.',
      overview: {
        heading: 'Visão geral',
        body: 'O Resizer redimensiona tokens e mapas selecionados, redimensiona páginas e dá zoom numa página inteira com tudo o que há nela: mapa, tokens, desenhos, textos, paredes, portas e janelas. Funciona com os editores Jumpgate e Legacy, mantém a distância por célula da grade, alinha mapas com a grade e pode desfazer suas últimas 10 alterações.',
      },
      quickStart: {
        heading: 'Início rápido',
        steps: [
          'Abra o folheto Resizer - Command Deck, ou digite !resizer para abrir o menu.',
          'Para redimensionar tokens, selecione-os e clique em Redimensionar ou Tamanho de criatura.',
          'Para dar zoom numa página, vá até ela e clique em Zoom na página; 2 dobra tudo, 0.5 reduz pela metade.',
          'Para ajustar um mapa à grade, desenhe um retângulo sobre alguns quadrados do mapa, selecione-o junto com o mapa e clique em Calibrar mapa.',
          'Mudou de ideia? Clique em Desfazer.',
        ],
      },
      zoom: {
        heading: 'Zoom em páginas',
        intro:
          'O zoom escala uma página e tudo o que há nela a partir do canto superior esquerdo. As células da grade ficam maiores ou menores, mas cada célula continua valendo a mesma distância (5 ft continua 5 ft), então réguas, auras, luzes e visão dos tokens medem o mesmo.',
        points: [
          'Move e escala tokens, gráficos de mapa, desenhos do Jumpgate e do Legacy, textos, paredes de iluminação dinâmica, portas e janelas, e o deslocamento da grade.',
          'Os fatores podem ser 2, 0.5, 150%, 1/2, ou "to 140" para células de 140 px.',
          'Manter o tamanho dos tokens (configuração ou --keep-tokens) move os tokens com o mapa, mas não muda o tamanho deles.',
          'A espessura das linhas dos desenhos escala com a página, a menos que a configuração esteja desligada; as paredes mantêm a espessura.',
          'Os desenhos do Legacy são desenhados de novo no novo tamanho (o Jumpgate não redesenha um desenho do Legacy alterado por um Mod), então ganham novos IDs.',
        ],
      },
      calibrate: {
        heading: 'Ajustar um mapa à grade',
        intro:
          'Muitos mapas vêm com a própria grade desenhada num tamanho próprio. Calibrar escala o mapa para que os quadrados dele batam com as células da página e o move para que as linhas coincidam.',
        steps: [
          'Coloque o mapa na página e desenhe um retângulo (com qualquer ferramenta de desenho) sobre alguns quadrados do mapa, de linha a linha.',
          'Selecione o mapa e o retângulo juntos (Shift-clique).',
          'Clique em Calibrar mapa e responda quantos quadrados a caixa cobre na largura e na altura.',
          'O mapa é escalado e movido para que esses quadrados batam exatamente com a grade da página; a caixa é apagada.',
        ],
        points: [
          'Calibrar e ajustar página também move o mapa para o canto da página e redimensiona a página para caber o mapa.',
          'Calibrar por pixels dispensa a caixa: informe o tamanho do quadrado do mapa em pixels, como está desenhado agora.',
          'Uma caixa maior (mais quadrados) dá um ajuste mais exato.',
        ],
      },
      sizes: {
        heading: 'Tamanhos de criatura',
        intro:
          'O comando size define tokens com um tamanho de criatura em células da grade da página.',
        colSize: 'Tamanho',
        colCommand: 'Comando',
        colCells: 'Células',
        cells: '{cells} × {cells}',
      },
      pages: {
        heading: 'Várias páginas de uma vez',
        points: [
          'Escolher páginas abre uma lista com todas as páginas; marque as que quiser e clique em Zoom nas marcadas.',
          'Digitado: zoom 2 --pages all, --pages picked, --pages current, ou nomes e IDs separados por vírgulas (--pages Town, Docks).',
          'Um único desfazer reverte o lote inteiro.',
        ],
      },
      undo: {
        heading: 'Desfazer',
        points: [
          'Toda alteração (redimensionar, ajustar, centralizar, calibrar, tamanho da página, zoom) pode ser desfeita.',
          'As últimas 10 alterações ficam guardadas no jogo, então sobrevivem a um reinício do sandbox de Mods.',
          'Objetos apagados depois da alteração são informados e ignorados.',
          'Alterações muito grandes (milhares de objetos) podem não caber no histórico; o Resizer avisa.',
        ],
      },
      commands: {
        heading: 'Comandos',
        intro: 'Digite {command} com um destes. !resizer e !rsz também sempre funcionam.',
        colCommand: 'Comando',
        colDesc: 'O que faz',
      },
      settings: {
        heading: 'Configurações',
        intro: 'Altere-as no cartão de Configurações ou com set <setting> <value>.',
        colKey: 'Configuração',
        colDesc: 'O que faz',
        rows: {
          language: 'Idioma dos menus, mensagens e folhetos.',
          command: 'Um nome extra para o comando (a 0.0.9 permitia renomeá-lo).',
          keepTokenSize: 'O zoom move os tokens, mas mantém o tamanho deles.',
          scaleStrokes:
            'O zoom escala a espessura das linhas dos desenhos (as paredes mantêm a delas).',
          deleteCalibrationBox: 'Calibrar apaga a caixa que mediu.',
        },
      },
      api: {
        heading: 'Para autores de Mods',
        intro: 'Outros Mods podem usar o objeto global Resizer.',
        colFunction: 'Função',
        colDesc: 'O que faz',
        rows: {
          zoomPage:
            'Dá zoom numa página com tudo o que há nela, com desfazer. options.keepTokens mantém o tamanho dos tokens.',
          undo: 'Desfaz a alteração mais recente.',
          onZoom:
            'Chama sua função após cada zoom (e com 1/factor após desfazer um), para que um Mod que guarda posições na página possa acompanhar.',
          history: 'Lista as alterações que podem ser desfeitas.',
        },
      },
      upgrading: {
        heading: 'Atualizar a partir da 0.0.9',
        points: [
          'Substitua o script antigo por este; seu comando renomeado é mantido.',
          'Os comandos antigos continuam funcionando e fazem o mesmo que os novos abaixo.',
          'scale não muda mais a distância por célula (uma célula de 5 ft continua 5 ft).',
        ],
        colOld: '0.0.9',
        colNew: '1.0',
      },
      troubleshooting: {
        heading: 'Solução de problemas',
        points: [
          'Outros Mods que guardam posições numa página (rotas de patrulha, posições de tokens, áreas salvas) não ficam sabendo do zoom, a menos que usem Resizer.onZoom; confira-os após o zoom.',
          'Páginas hexagonais recebem zoom como as quadradas, mas confira se os tokens continuam dentro dos hexágonos.',
          'Se um desenho parecer fora do lugar logo após um zoom, recarregue a página: às vezes o Roll20 redesenha com atraso.',
          'Calibrar exige o mapa alinhado à página; gire-o para 0°, 90°, 180° ou 270° antes.',
        ],
      },
      languages: {
        heading: 'Idiomas',
        body: 'Escolha um idioma no cartão de Configurações, com set language <code>, ou nas configurações do Mod.',
        colLanguage: 'Idioma',
        colNative: 'Nome nativo',
        colCode: 'Código',
      },
      credits: {
        heading: 'Créditos',
        original: 'Mod original de',
        maintainer: 'Reescrito e mantido por',
        thread: 'Tópico no fórum',
        support:
          'Encontrou um problema ou tem uma ideia? Poste no tópico do fórum ou abra um chamado no GitHub.',
      },
    },
  };

  var localeRu = {
    titles: {
      ready: 'Resizer готов.',
      history: 'Resizer: история',
      pages: 'Resizer: страницы',
      settings: 'Resizer: настройки',
      help: 'Resizer: справка',
    },
    menu: {
      selected: 'Выбрано',
      nothingSelected: 'Ничего не выбрано. Сначала выберите жетоны, карту или рисунки.',
      graphicSize: '{name}: {width} × {height} px ({across} × {down} клеток)',
      andMore: '…и ещё {count}.',
      map: 'Карта',
      mapHint:
        'Нарисуйте прямоугольник поверх нескольких клеток самой карты, выберите его и карту, затем откалибруйте.',
      page: 'Страница',
      pageSize: '{across} × {down} клеток, {cell} px на клетку, {scale} {units} на клетку',
      pageCells: '{across} × {down} клеток',
      historyEmpty: 'Пока нечего отменять.',
      historyHint: 'Отмена сначала возвращает самое последнее изменение.',
      minutesAgo: '{minutes} мин назад',
      pickerHint:
        'Отметьте страницы для общего масштабирования и нажмите «Масштабировать отмеченные».',
      on: 'Вкл.',
      off: 'Выкл.',
      handouts: 'Полная справка в раздатках:',
    },
    kinds: {
      graphic: 'Изображение',
      text: 'Текст',
      pathv2: 'Рисунок',
      path: 'Рисунок',
      door: 'Дверь',
      window: 'Окно',
    },
    sizes: {
      tiny: 'Крошечный',
      small: 'Маленький',
      medium: 'Средний',
      large: 'Большой',
      huge: 'Огромный',
      gargantuan: 'Громадный',
    },
    units: {
      px: 'px',
      cells: 'клеток',
      units: 'единиц страницы',
    },
    buttons: {
      menu: 'Меню',
      resize: 'Изменить размер',
      creatureSize: 'Размер существа',
      fit: 'Вписать в страницу',
      centre: 'По центру',
      sizes: 'Показать размеры',
      calibrate: 'Откалибровать карту',
      calibrateFit: 'Откалибровать и подогнать страницу',
      calibratePx: 'Калибровка по пикселям',
      zoom: 'Масштабировать страницу',
      zoomIn: 'Масштаб ×2',
      zoomOut: 'Масштаб ×½',
      resizePage: 'Изменить размер страницы',
      pageSize: 'Размер страницы',
      pages: 'Выбрать страницы',
      zoomPicked: 'Масштабировать отмеченные ({count})',
      pickAll: 'Отметить все',
      pickNone: 'Снять все',
      undo: 'Отменить',
      undoWhat: 'Отменить: {what}',
      history: 'История',
      clearHistory: 'Очистить историю',
      settings: 'Настройки',
      help: 'Справка',
      resetSettings: 'Сбросить настройки',
      rebuild: 'Пересоздать раздатки',
    },
    queries: {
      width: 'Ширина',
      height: 'Высота',
      unit: 'Единица',
      unitPx: 'Пиксели',
      unitCells: 'Клетки сетки',
      unitUnits: 'Единицы страницы (70 px)',
      creatureSize: 'Размер существа',
      keepShape: 'Сохранить форму?',
      yes: 'Да',
      no: 'Нет - растянуть по странице',
      centre: 'Центрировать',
      both: 'По обеим осям',
      across: 'Клеток по ширине рамки',
      down: 'Только по вертикали',
      downCount: 'Клеток по высоте рамки',
      squarePx: 'Пикселей на клетку карты сейчас',
      factor: 'Коэффициент масштаба (2 = вдвое больше; 0.5 = вдвое меньше)',
      tokens: 'Жетоны',
      tokensScale: 'Масштабировать вместе со страницей',
      tokensKeep: 'Сохранить их размер',
      language: 'Язык',
      command: 'Имя команды без !',
    },
    settings: {
      language: 'Язык',
      command: 'Команда',
      keepTokenSize: 'Сохранять размер жетонов при масштабировании',
      scaleStrokes: 'Масштабировать толщину линий рисунков',
      deleteCalibrationBox: 'Удалять рамку калибровки',
    },
    history: {
      change: 'Изменение',
      zoom: 'Масштаб ×{factor} на {page}',
      zoomPages: 'Масштаб ×{factor} на {count} страницах',
      size: 'Размер {count} изображений',
      size_one: 'Размер 1 изображения',
      page: 'Страница {page}: {width} × {height} единиц',
      fit: 'Вписать {count} изображений в страницу',
      fit_one: 'Вписать 1 изображение в страницу',
      centre: 'Центрировать {count} объектов',
      centre_one: 'Центрировать 1 объект',
      calibrate: 'Калибровка карты {name}',
      calibrateUnnamed: 'Калибровка карты',
    },
    messages: {
      welcome:
        'Выберите что-нибудь и откройте меню, чтобы изменить размер, или масштабируйте всю страницу.',
      upgraded:
        'Обновлено с Resizer 0.0.9. Ваша команда {command} и старые команды по-прежнему работают.',
      readyHint: 'Введите {command} для меню или откройте раздатку Resizer - Command Deck.',
      zoomed:
        'Страница {page} масштабирована ×{factor}; вместе с ней перемещено объектов: {objects}.',
      zoomedPages:
        'Масштабировано страниц: {count} ×{factor} ({page}); вместе с ними перемещено объектов: {objects}.',
      skipped: 'Не удалось прочитать объектов: {count}; они остались без изменений.',
      skipped_one: 'Не удалось прочитать 1 объект; он остался без изменений.',
      resized: 'Размер изображений ({count}) изменён на {width} × {height} {unit}.',
      resized_one: 'Размер 1 изображения изменён на {width} × {height} {unit}.',
      sized: 'Размер изображений ({count}) изменён на {size}.',
      sized_one: 'Размер 1 изображения изменён на {size}.',
      pageResized: 'Размер {page} теперь {size}.',
      fitted: 'Вписано в страницу изображений: {count}.',
      fitted_one: '1 изображение вписано в страницу.',
      centred: 'Отцентрировано на странице объектов: {count}.',
      centred_one: '1 объект отцентрирован на странице.',
      calibrated:
        'Откалибровано: клетки карты были {square} px; теперь она масштабирована ×{scale} до клеток {cell} px и выровнена по сетке.',
      calibratedPage: 'Страница теперь {width} × {height} единиц, чтобы вместить карту.',
      boxRemoved: 'Рамка калибровки удалена (отмена вернёт её).',
      undone: 'Отменено: {what}.',
      undoMissing: 'Объекты ({count}) были удалены после изменения, поэтому их нельзя вернуть.',
      undoMissing_one: '1 объект был удалён после изменения, поэтому его нельзя вернуть.',
      notStored: 'Это изменение слишком большое для истории отмены.',
      historyCleared: 'Забыто изменений: {count}.',
      historyCleared_one: 'Забыто 1 изменение.',
      settingChanged: '{key} теперь {value}.',
      settingsReset: 'Настройки сброшены по умолчанию. История отмены сохранена.',
      handoutsRebuilt: 'Раздатки справки и Command Deck пересозданы.',
    },
    errors: {
      unexpected: 'Что-то пошло не так: {message}',
      unknownCommand: 'Неизвестная команда «{command}». Введите {help}, чтобы увидеть команды.',
      noSelection: 'Сначала выберите что-нибудь (или укажите --ids).',
      unknownIds: 'Нет объектов с такими ID: {ids}',
      noGraphics:
        'Ни один из выбранных объектов нельзя изменить таким образом. Выберите жетоны или карту.',
      badSize: 'Укажите ширину и высоту больше 0, например size 140 140 px.',
      badCreatureSize:
        'Неизвестный размер. Используйте tiny, small, medium, large, huge или gargantuan.',
      badPageSize: 'Укажите ширину и высоту страницы от 1 до {max} единиц.',
      badFactor: 'Укажите коэффициент масштаба от {min} до {max}.',
      badFactorText:
        'Не удалось распознать «{text}» как коэффициент масштаба. Попробуйте 2, 0.5, 150%, 1/2 или "to 140".',
      factorOne: 'Масштаб 1 ничего не меняет.',
      pageTooBig: '{page} стала бы меньше 1 единицы или больше {max} единиц.',
      noPage: 'Не удалось найти страницу.',
      noPages: 'Нет страниц для изменения. Отметьте их в выборе страниц или укажите --pages.',
      unknownPages: 'Нет страниц с названием: {pages}',
      noMap: 'Выберите также изображение карты.',
      noBox:
        'Выберите вместе с картой прямоугольник, нарисованный поверх её клеток, или используйте calibrate --cell <px>.',
      boxUnreadable: 'Не удалось прочитать размер выбранного рисунка.',
      boxTooSmall:
        'Рамка калибровки слишком мала. Нарисуйте её поверх одной или нескольких целых клеток.',
      badCount: 'Укажите число клеток по ширине (и высоте) рамки, например 3 или 3 2.',
      badSquarePx: 'Укажите размер клетки карты в пикселях, не меньше 2.',
      mapRotated: 'Перед калибровкой поверните карту ровно к странице (0°, 90°, 180° или 270°).',
      nothingToUndo: 'Нечего отменять.',
      badSetting: 'Неизвестная настройка «{key}». Настройки: {settings}',
      badValue: '«{value}» не подходит для {key}.',
    },
    help: {
      menu: 'Открыть меню; если выбраны объекты, показывает их размеры.',
      size: 'Изменить размер выбранных изображений (по умолчанию в пикселях).',
      creature: 'Задать выбранным жетонам размер существа в клетках сетки.',
      fit: 'Вписать выбранные изображения в страницу; --keep-ratio сохраняет их форму.',
      center: 'Поставить выбранные изображения или текст по центру страницы.',
      calibrate:
        'Масштабировать выбранную карту так, чтобы клетки внутри выбранной рамки совпали с сеткой страницы, затем выровнять их.',
      calibrateCell: 'Масштабировать выбранную карту по размеру её клетки в пикселях.',
      page: 'Показать размер страницы или изменить его (но не то, что на ней).',
      zoom: 'Масштабировать страницы со всем содержимым; расстояние на клетку сохраняется.',
      pages: 'Открыть выбор страниц или отметить страницы, чтобы масштабировать несколько сразу.',
      undo: 'Отменить последнее изменение (хранятся последние 10).',
      history: 'Список изменений, которые можно отменить; clear забывает их.',
      settings: 'Показать или изменить настройки.',
      reset: 'Вернуть настройки по умолчанию.',
      journal: 'Пересоздать раздатки справки и Command Deck.',
      help: 'Показать этот список.',
    },
    deck: {
      menuTitle: 'Меню',
      menuDesc: 'Главное меню показывает выделение, страницу и то, что можно отменить.',
      selectedTitle: 'Выбранные жетоны и изображения',
      selectedDesc: 'Сначала выберите, затем нажмите кнопку.',
      mapTitle: 'Карта',
      mapDesc: 'Выберите карту и рамку, нарисованную поверх нескольких её клеток.',
      pageTitle: 'Страница',
      pageDesc: 'Масштабируйте текущую страницу со всем содержимым.',
      historyTitle: 'История',
      historyDesc: 'Отмена возвращает самое последнее изменение.',
      footer: 'Полные инструкции в раздатке {help}.',
    },
    handout: {
      versionLabel: 'Версия',
      subtitle: 'Изменение размера жетонов, карт и целых страниц',
      footer: 'Кнопки для всех действий в раздатке {deck}.',
      overview: {
        heading: 'Обзор',
        body: 'Resizer меняет размер выбранных жетонов и карт, меняет размер страниц и масштабирует всю страницу со всем содержимым: картой, жетонами, рисунками, текстом, стенами, дверями и окнами. Он работает с редакторами Jumpgate и Legacy, сохраняет расстояние на клетку сетки, выравнивает карты по сетке и может отменить последние 10 изменений.',
      },
      quickStart: {
        heading: 'Быстрый старт',
        steps: [
          'Откройте раздатку Resizer - Command Deck или введите !resizer для меню.',
          'Чтобы изменить размер жетонов, выберите их и нажмите «Изменить размер» или «Размер существа».',
          'Чтобы масштабировать страницу, перейдите на неё и нажмите «Масштабировать страницу»; 2 удваивает всё, 0.5 уменьшает вдвое.',
          'Чтобы подогнать карту к сетке, нарисуйте прямоугольник поверх нескольких клеток карты, выберите его и карту и нажмите «Откалибровать карту».',
          'Передумали? Нажмите «Отменить».',
        ],
      },
      zoom: {
        heading: 'Масштабирование страниц',
        intro:
          'Масштабирование увеличивает или уменьшает страницу со всем содержимым относительно её левого верхнего угла. Клетки сетки становятся больше или меньше, но каждая клетка обозначает то же расстояние (5 футов остаются 5 футами), поэтому линейки, ауры, свет жетонов и зрение измеряют так же.',
        points: [
          'Перемещает и масштабирует жетоны, изображения карт, рисунки Jumpgate и Legacy, текст, стены динамического освещения, двери и окна, а также смещение сетки.',
          'Коэффициент может быть 2, 0.5, 150%, 1/2 или "to 140" для клеток 140 px.',
          'Сохранение размера жетонов (настройка или --keep-tokens) перемещает жетоны вместе с картой, но не меняет их размер.',
          'Толщина линий рисунков масштабируется вместе со страницей, если настройка не выключена; стены сохраняют свою толщину.',
          'Рисунки Legacy перерисовываются в новом размере (Jumpgate не перерисовывает рисунок Legacy, изменённый модом), поэтому получают новые ID.',
        ],
      },
      calibrate: {
        heading: 'Подгонка карты к сетке',
        intro:
          'Многие карты нарисованы со своей сеткой своего размера. Калибровка масштабирует карту так, чтобы её клетки совпали с клетками страницы, и сдвигает её, чтобы линии сошлись.',
        steps: [
          'Положите карту на страницу и нарисуйте прямоугольник (любым инструментом рисования) поверх нескольких клеток карты, от линии до линии.',
          'Выберите карту и прямоугольник вместе (Shift-щелчок).',
          'Нажмите «Откалибровать карту» и укажите, сколько клеток рамка закрывает по ширине и высоте.',
          'Карта масштабируется и сдвигается так, чтобы эти клетки точно совпали с сеткой страницы; рамка удаляется.',
        ],
        points: [
          '«Откалибровать и подогнать страницу» также сдвигает карту в угол страницы и меняет размер страницы под неё.',
          '«Калибровка по пикселям» обходится без рамки: укажите размер клетки карты в пикселях в её текущем виде.',
          'Чем больше рамка (больше клеток), тем точнее подгонка.',
        ],
      },
      sizes: {
        heading: 'Размеры существ',
        intro: 'Команда size задаёт жетонам размер существа в клетках сетки их страницы.',
        colSize: 'Размер',
        colCommand: 'Команда',
        colCells: 'Клетки',
        cells: '{cells} × {cells}',
      },
      pages: {
        heading: 'Несколько страниц сразу',
        points: [
          '«Выбрать страницы» открывает список всех страниц; отметьте нужные и нажмите «Масштабировать отмеченные».',
          'Командой: zoom 2 --pages all, --pages picked, --pages current или названия и ID через запятую (--pages Town, Docks).',
          'Одна отмена возвращает весь пакет.',
        ],
      },
      undo: {
        heading: 'Отмена',
        points: [
          'Любое изменение (размер, вписывание, центрирование, калибровка, размер страницы, масштаб) можно отменить.',
          'Последние 10 изменений хранятся в игре, поэтому переживают перезапуск песочницы модов.',
          'Объекты, удалённые после изменения, указываются в сообщении и пропускаются.',
          'Очень большие изменения (тысячи объектов) могут не поместиться в историю; Resizer об этом сообщит.',
        ],
      },
      commands: {
        heading: 'Команды',
        intro: 'Введите {command} с одной из этих команд. !resizer и !rsz тоже всегда работают.',
        colCommand: 'Команда',
        colDesc: 'Что делает',
      },
      settings: {
        heading: 'Настройки',
        intro: 'Меняйте их в карточке настроек или командой set <setting> <value>.',
        colKey: 'Настройка',
        colDesc: 'Что делает',
        rows: {
          language: 'Язык меню, сообщений и раздаток.',
          command: 'Дополнительное имя команды (в 0.0.9 её можно было переименовать).',
          keepTokenSize: 'Масштабирование перемещает жетоны, но сохраняет их размер.',
          scaleStrokes: 'Масштабирование меняет толщину линий рисунков (стены сохраняют свою).',
          deleteCalibrationBox: 'Калибровка удаляет рамку, по которой проводила измерение.',
        },
      },
      api: {
        heading: 'Для авторов модов',
        intro: 'Другие моды могут использовать глобальный объект Resizer.',
        colFunction: 'Функция',
        colDesc: 'Что делает',
        rows: {
          zoomPage:
            'Масштабирует страницу со всем содержимым, с возможностью отмены. options.keepTokens сохраняет размер жетонов.',
          undo: 'Отменяет последнее изменение.',
          onZoom:
            'Вызывает вашу функцию после каждого масштабирования (и с 1/factor после его отмены), чтобы мод, хранящий позиции на странице, мог их обновить.',
          history: 'Возвращает список изменений, которые можно отменить.',
        },
      },
      upgrading: {
        heading: 'Обновление с 0.0.9',
        points: [
          'Замените старый скрипт этим; ваша переименованная команда сохранится.',
          'Старые команды по-прежнему работают и делают то же, что новые ниже.',
          'scale больше не меняет расстояние на клетку (клетка 5 футов остаётся 5 футов).',
        ],
        colOld: '0.0.9',
        colNew: '1.0',
      },
      troubleshooting: {
        heading: 'Решение проблем',
        points: [
          'Другие моды, запоминающие позиции на странице (маршруты патрулей, места жетонов, сохранённые области), не узнают о масштабировании, если не используют Resizer.onZoom; проверьте их после масштабирования.',
          'Гексовые страницы масштабируются как квадратные, но проверьте, что жетоны остались в своих гексах.',
          'Если рисунок сразу после масштабирования выглядит не на месте, перезагрузите страницу: Roll20 иногда перерисовывает с опозданием.',
          'Для калибровки карта должна стоять ровно к странице; сначала поверните её на 0°, 90°, 180° или 270°.',
        ],
      },
      languages: {
        heading: 'Языки',
        body: 'Выберите язык в карточке настроек, командой set language <code> или в настройках мода.',
        colLanguage: 'Язык',
        colNative: 'Название на языке',
        colCode: 'Код',
      },
      credits: {
        heading: 'Авторы',
        original: 'Оригинальный мод:',
        maintainer: 'Переписал и поддерживает:',
        thread: 'Тема на форуме',
        support:
          'Нашли проблему или есть идея? Напишите в теме на форуме или создайте запрос на GitHub.',
      },
    },
  };

  var localeEs = {
    titles: {
      ready: 'Resizer está listo.',
      history: 'Historial de Resizer',
      pages: 'Páginas de Resizer',
      settings: 'Ajustes de Resizer',
      help: 'Ayuda de Resizer',
    },
    menu: {
      selected: 'Seleccionado',
      nothingSelected: 'No hay nada seleccionado. Selecciona primero fichas, un mapa o dibujos.',
      graphicSize: '{name}: {width} × {height} px ({across} × {down} casillas)',
      andMore: '…y {count} más.',
      map: 'Mapa',
      mapHint:
        'Dibuja un rectángulo sobre algunas casillas del propio mapa, selecciónalo junto con el mapa y luego calibra.',
      page: 'Página',
      pageSize: '{across} × {down} casillas, {cell} px por casilla, {scale} {units} por casilla',
      pageCells: '{across} × {down} casillas',
      historyEmpty: 'Todavía no hay nada que deshacer.',
      historyHint: 'Deshacer revierte primero el cambio más reciente.',
      minutesAgo: 'hace {minutes} min',
      pickerHint: 'Marca las páginas que quieres ampliar juntas y pulsa Zoom a las marcadas.',
      on: 'Sí',
      off: 'No',
      handouts: 'Ayuda completa en los documentos:',
    },
    kinds: {
      graphic: 'Gráfico',
      text: 'Texto',
      pathv2: 'Dibujo',
      path: 'Dibujo',
      door: 'Puerta',
      window: 'Ventana',
    },
    sizes: {
      tiny: 'Diminuto',
      small: 'Pequeño',
      medium: 'Mediano',
      large: 'Grande',
      huge: 'Enorme',
      gargantuan: 'Gargantuesco',
    },
    units: {
      px: 'px',
      cells: 'casillas',
      units: 'unidades de página',
    },
    buttons: {
      menu: 'Menú',
      resize: 'Redimensionar',
      creatureSize: 'Tamaño de criatura',
      fit: 'Ajustar a la página',
      centre: 'Centrar',
      sizes: 'Ver tamaños',
      calibrate: 'Calibrar mapa',
      calibrateFit: 'Calibrar y ajustar página',
      calibratePx: 'Calibrar por píxeles',
      zoom: 'Zoom de página',
      zoomIn: 'Zoom ×2',
      zoomOut: 'Zoom ×½',
      resizePage: 'Redimensionar página',
      pageSize: 'Tamaño de página',
      pages: 'Elegir páginas',
      zoomPicked: 'Zoom a las marcadas ({count})',
      pickAll: 'Marcar todas',
      pickNone: 'Desmarcar todas',
      undo: 'Deshacer',
      undoWhat: 'Deshacer: {what}',
      history: 'Historial',
      clearHistory: 'Borrar historial',
      settings: 'Ajustes',
      help: 'Ayuda',
      resetSettings: 'Restablecer ajustes',
      rebuild: 'Regenerar documentos',
    },
    queries: {
      width: 'Ancho',
      height: 'Alto',
      unit: 'Unidad',
      unitPx: 'Píxeles',
      unitCells: 'Casillas de la cuadrícula',
      unitUnits: 'Unidades de página (70 px)',
      creatureSize: 'Tamaño de criatura',
      keepShape: '¿Mantener la forma?',
      yes: 'Sí',
      no: 'No - estirar a la página',
      centre: 'Centrar',
      both: 'En ambos sentidos',
      across: 'Casillas a lo ancho del recuadro',
      down: 'Solo en vertical',
      downCount: 'Casillas a lo alto del recuadro',
      squarePx: 'Píxeles por casilla en el mapa ahora',
      factor: 'Factor de zoom (2 = el doble; 0.5 = la mitad)',
      tokens: 'Fichas',
      tokensScale: 'Escalar con la página',
      tokensKeep: 'Mantener su tamaño',
      language: 'Idioma',
      command: 'Nombre del comando sin !',
    },
    settings: {
      language: 'Idioma',
      command: 'Comando',
      keepTokenSize: 'Mantener el tamaño de las fichas al hacer zoom',
      scaleStrokes: 'Escalar el grosor de línea de los dibujos',
      deleteCalibrationBox: 'Borrar el recuadro de calibración',
    },
    history: {
      change: 'Cambio',
      zoom: 'Zoom ×{factor} en {page}',
      zoomPages: 'Zoom ×{factor} en {count} páginas',
      size: 'Redimensionar {count} gráficos',
      size_one: 'Redimensionar 1 gráfico',
      page: 'Página {page} a {width} × {height} unidades',
      fit: 'Ajustar {count} gráficos a la página',
      fit_one: 'Ajustar 1 gráfico a la página',
      centre: 'Centrar {count} objetos',
      centre_one: 'Centrar 1 objeto',
      calibrate: 'Calibrar el mapa {name}',
      calibrateUnnamed: 'Calibrar el mapa',
    },
    messages: {
      welcome: 'Selecciona algo y abre el menú para redimensionarlo, o haz zoom a toda una página.',
      upgraded:
        'Actualizado desde Resizer 0.0.9. Tu comando {command} y los comandos antiguos siguen funcionando.',
      readyHint: 'Escribe {command} para el menú o abre el documento Resizer - Command Deck.',
      zoomed: 'Zoom ×{factor} en {page}: {objects} objetos se movieron con ella.',
      zoomedPages:
        'Zoom ×{factor} en {count} páginas ({page}): {objects} objetos se movieron con ellas.',
      skipped: 'No se pudieron leer {count} objetos y se dejaron como estaban.',
      skipped_one: 'No se pudo leer 1 objeto y se dejó como estaba.',
      resized: '{count} gráficos redimensionados a {width} × {height} {unit}.',
      resized_one: '1 gráfico redimensionado a {width} × {height} {unit}.',
      sized: '{count} gráficos redimensionados a {size}.',
      sized_one: '1 gráfico redimensionado a {size}.',
      pageResized: '{page} ahora mide {size}.',
      fitted: '{count} gráficos ajustados a la página.',
      fitted_one: '1 gráfico ajustado a la página.',
      centred: '{count} objetos centrados en la página.',
      centred_one: '1 objeto centrado en la página.',
      calibrated:
        'Calibrado: el mapa tenía casillas de {square} px; ahora está escalado ×{scale} a casillas de {cell} px y alineado con la cuadrícula.',
      calibratedPage: 'La página mide ahora {width} × {height} unidades para que quepa el mapa.',
      boxRemoved: 'Se borró el recuadro de calibración (Deshacer lo recupera).',
      undone: 'Deshecho: {what}.',
      undoMissing: '{count} objetos se habían borrado desde entonces y no se pudieron restaurar.',
      undoMissing_one: '1 objeto se había borrado desde entonces y no se pudo restaurar.',
      notStored: 'Este cambio era demasiado grande para guardarlo en el historial de deshacer.',
      historyCleared: 'Se olvidaron {count} cambios.',
      historyCleared_one: 'Se olvidó 1 cambio.',
      settingChanged: '{key} ahora es {value}.',
      settingsReset:
        'Los ajustes vuelven a sus valores por defecto. El historial de deshacer se ha conservado.',
      handoutsRebuilt: 'Se regeneraron los documentos Help y Command Deck.',
    },
    errors: {
      unexpected: 'Algo salió mal: {message}',
      unknownCommand: 'Comando desconocido «{command}». Escribe {help} para ver los comandos.',
      noSelection: 'Selecciona algo primero (o usa --ids).',
      unknownIds: 'No hay objetos con estos ID: {ids}',
      noGraphics:
        'Ninguno de los objetos seleccionados se puede cambiar así. Selecciona fichas o un mapa.',
      badSize: 'Indica un ancho y un alto mayores que 0, por ejemplo size 140 140 px.',
      badCreatureSize: 'Tamaño desconocido. Usa tiny, small, medium, large, huge o gargantuan.',
      badPageSize: 'Indica un ancho y un alto de página de 1 a {max} unidades.',
      badFactor: 'Indica un factor de zoom de {min} a {max}.',
      badFactorText:
        'No se pudo leer «{text}» como factor de zoom. Prueba 2, 0.5, 150%, 1/2 o "to 140".',
      factorOne: 'Un zoom de 1 no cambia nada.',
      pageTooBig: '{page} quedaría por debajo de 1 unidad o por encima de {max} unidades.',
      noPage: 'No se encontró la página.',
      noPages: 'No hay páginas que cambiar. Marca algunas en el selector de páginas o usa --pages.',
      unknownPages: 'No hay páginas llamadas: {pages}',
      noMap: 'Selecciona también el gráfico del mapa.',
      noBox:
        'Selecciona, además del mapa, un rectángulo dibujado sobre algunas casillas del mapa, o usa calibrate --cell <px>.',
      boxUnreadable: 'No se pudo leer el tamaño del dibujo seleccionado.',
      boxTooSmall:
        'El recuadro de calibración es demasiado pequeño. Dibújalo sobre una o más casillas enteras.',
      badCount:
        'Indica cuántas casillas abarca el recuadro a lo ancho (y a lo alto), como 3 o 3 2.',
      badSquarePx: 'Indica el tamaño de las casillas del mapa en píxeles, 2 o más.',
      mapRotated: 'Endereza el mapa respecto a la página (0°, 90°, 180° o 270°) antes de calibrar.',
      nothingToUndo: 'No hay nada que deshacer.',
      badSetting: 'Ajuste desconocido «{key}». Ajustes: {settings}',
      badValue: '«{value}» no es un valor que acepte {key}.',
    },
    help: {
      menu: 'Abre el menú; con objetos seleccionados muestra sus tamaños.',
      size: 'Redimensiona los gráficos seleccionados (en píxeles por defecto).',
      creature:
        'Da a las fichas seleccionadas un tamaño de criatura, en casillas de la cuadrícula.',
      fit: 'Ajusta los gráficos seleccionados a la página; --keep-ratio mantiene su forma.',
      center: 'Centra en la página los gráficos o textos seleccionados.',
      calibrate:
        'Escala el mapa seleccionado para que las casillas del recuadro seleccionado coincidan con la cuadrícula y luego las alinea.',
      calibrateCell: 'Escala el mapa seleccionado a partir del tamaño de sus casillas en píxeles.',
      page: 'Muestra el tamaño de la página o la redimensiona (no lo que hay en ella).',
      zoom: 'Hace zoom a páginas con todo lo que contienen; la distancia por casilla se mantiene.',
      pages: 'Abre el selector de páginas, o marca páginas, para hacer zoom a varias a la vez.',
      undo: 'Deshace el cambio más reciente (se guardan los últimos 10).',
      history: 'Lista los cambios que se pueden deshacer; clear los olvida.',
      settings: 'Muestra o cambia los ajustes.',
      reset: 'Devuelve los ajustes a sus valores por defecto.',
      journal: 'Regenera los documentos Help y Command Deck.',
      help: 'Muestra esta lista.',
    },
    deck: {
      menuTitle: 'Menú',
      menuDesc: 'El menú principal muestra la selección, la página y lo que puedes deshacer.',
      selectedTitle: 'Fichas y gráficos seleccionados',
      selectedDesc: 'Primero selecciona y luego pulsa un botón.',
      mapTitle: 'Mapa',
      mapDesc: 'Selecciona el mapa y un recuadro dibujado sobre algunas de sus casillas.',
      pageTitle: 'Página',
      pageDesc: 'Haz zoom a la página en la que estás con todo lo que contiene.',
      historyTitle: 'Historial',
      historyDesc: 'Deshacer revierte el cambio más reciente.',
      footer: 'Las instrucciones completas están en el documento {help}.',
    },
    handout: {
      versionLabel: 'Versión',
      subtitle: 'Redimensiona fichas, mapas y páginas enteras',
      footer: 'Los botones de cada acción están en el documento {deck}.',
      overview: {
        heading: 'Descripción general',
        body: 'Resizer redimensiona las fichas y mapas seleccionados, redimensiona páginas y hace zoom a una página entera con todo lo que contiene: mapa, fichas, dibujos, texto, muros, puertas y ventanas. Funciona con los editores Jumpgate y Legacy, mantiene la distancia por casilla, alinea los mapas con la cuadrícula y puede deshacer sus últimos 10 cambios.',
      },
      quickStart: {
        heading: 'Inicio rápido',
        steps: [
          'Abre el documento Resizer - Command Deck o escribe !resizer para el menú.',
          'Para redimensionar fichas, selecciónalas y pulsa Redimensionar o Tamaño de criatura.',
          'Para hacer zoom a una página, ve a ella y pulsa Zoom de página; 2 lo duplica todo y 0.5 lo reduce a la mitad.',
          'Para ajustar un mapa a la cuadrícula, dibuja un rectángulo sobre algunas casillas del mapa, selecciónalo junto con el mapa y pulsa Calibrar mapa.',
          '¿Cambiaste de idea? Pulsa Deshacer.',
        ],
      },
      zoom: {
        heading: 'Zoom de páginas',
        intro:
          'El zoom escala una página y todo lo que contiene desde su esquina superior izquierda. Las casillas se hacen más grandes o más pequeñas, pero cada una sigue representando la misma distancia (5 ft siguen siendo 5 ft), así que reglas, auras, luces de fichas y visión miden igual.',
        points: [
          'Mueve y escala fichas, gráficos de mapa, dibujos de Jumpgate y Legacy, texto, muros de iluminación dinámica, puertas, ventanas y el desplazamiento de la cuadrícula.',
          'El factor puede ser 2, 0.5, 150%, 1/2 o "to 140" para casillas de 140 px.',
          'Mantener el tamaño de las fichas (ajuste o --keep-tokens) mueve las fichas con el mapa pero no cambia su tamaño.',
          'El grosor de línea de los dibujos se escala con la página salvo que el ajuste esté desactivado; los muros mantienen su grosor.',
          'Los dibujos Legacy se vuelven a dibujar al nuevo tamaño (Jumpgate no redibuja un dibujo Legacy que cambie un Mod), así que reciben ID nuevos.',
        ],
      },
      calibrate: {
        heading: 'Ajustar un mapa a la cuadrícula',
        intro:
          'Muchos mapas traen su propia cuadrícula a su propio tamaño. Calibrar escala el mapa para que sus casillas coincidan con las de la página y lo mueve para que las líneas encajen.',
        steps: [
          'Pon el mapa en la página y dibuja un rectángulo (con cualquier herramienta de dibujo) sobre algunas casillas del mapa, de línea a línea.',
          'Selecciona el mapa y el rectángulo a la vez (Mayús-clic).',
          'Pulsa Calibrar mapa e indica cuántas casillas abarca el recuadro a lo ancho y a lo alto.',
          'El mapa se escala y se mueve para que esas casillas encajen justo en la cuadrícula; el recuadro se borra.',
        ],
        points: [
          'Calibrar y ajustar página también mueve el mapa a la esquina de la página y la redimensiona para que quepa.',
          'Calibrar por píxeles no necesita recuadro: indica el tamaño de las casillas del mapa en píxeles tal como se ve ahora.',
          'Un recuadro más grande (más casillas) da un ajuste más exacto.',
        ],
      },
      sizes: {
        heading: 'Tamaños de criatura',
        intro: 'Tamaño da a las fichas un tamaño de criatura en las casillas de su página.',
        colSize: 'Tamaño',
        colCommand: 'Comando',
        colCells: 'Casillas',
        cells: '{cells} × {cells}',
      },
      pages: {
        heading: 'Varias páginas a la vez',
        points: [
          'Elegir páginas abre una lista de todas las páginas; marca las que quieras y pulsa Zoom a las marcadas.',
          'Escrito: zoom 2 --pages all, --pages picked, --pages current, o nombres e ID separados por comas (--pages Town, Docks).',
          'Un solo deshacer revierte todo el lote.',
        ],
      },
      undo: {
        heading: 'Deshacer',
        points: [
          'Todo cambio (redimensionar, ajustar, centrar, calibrar, tamaño de página, zoom) se puede deshacer.',
          'Los últimos 10 cambios se guardan con la partida, así que sobreviven a un reinicio del sandbox de Mods.',
          'Los objetos borrados desde el cambio se avisan y se omiten.',
          'Los cambios muy grandes (miles de objetos) pueden no caber; Resizer lo avisa.',
        ],
      },
      commands: {
        heading: 'Comandos',
        intro: 'Escribe {command} con uno de estos. !resizer y !rsz también funcionan siempre.',
        colCommand: 'Comando',
        colDesc: 'Qué hace',
      },
      settings: {
        heading: 'Ajustes',
        intro: 'Cámbialos desde el panel de Ajustes o con set <setting> <value>.',
        colKey: 'Ajuste',
        colDesc: 'Qué hace',
        rows: {
          language: 'Idioma de menús, mensajes y documentos.',
          command: 'Un nombre extra para el comando (0.0.9 permitía renombrarlo).',
          keepTokenSize: 'El zoom mueve las fichas pero mantiene su tamaño.',
          scaleStrokes:
            'El zoom escala el grosor de línea de los dibujos (los muros mantienen el suyo).',
          deleteCalibrationBox: 'Calibrar borra el recuadro que ha medido.',
        },
      },
      api: {
        heading: 'Para autores de Mods',
        intro: 'Otros Mods pueden usar el objeto global Resizer.',
        colFunction: 'Función',
        colDesc: 'Qué hace',
        rows: {
          zoomPage:
            'Hace zoom a una página con todo lo que contiene, con deshacer. options.keepTokens mantiene el tamaño de las fichas.',
          undo: 'Deshace el cambio más reciente.',
          onZoom:
            'Llama a tu función tras cada zoom (y con 1/factor al deshacer uno), para que un Mod que guarde posiciones en la página pueda seguirlo.',
          history: 'Lista los cambios que se pueden deshacer.',
        },
      },
      upgrading: {
        heading: 'Actualizar desde 0.0.9',
        points: [
          'Sustituye el script antiguo por este; tu comando renombrado se conserva.',
          'Los comandos antiguos siguen funcionando y hacen lo mismo que los nuevos de abajo.',
          'scale ya no cambia la distancia por casilla (una casilla de 5 ft sigue siendo de 5 ft).',
        ],
        colOld: '0.0.9',
        colNew: '1.0',
      },
      troubleshooting: {
        heading: 'Solución de problemas',
        points: [
          'Otros Mods que recuerdan posiciones en una página (rutas de patrulla, puntos de origen de fichas, zonas guardadas) no se enteran de un zoom salvo que usen Resizer.onZoom; revísalos después del zoom.',
          'Las páginas hexagonales se amplían igual que las cuadradas, pero comprueba que las fichas siguen en sus hexágonos.',
          'Si un dibujo parece fuera de sitio justo después de un zoom, recarga la página: Roll20 a veces redibuja con retraso.',
          'Calibrar necesita el mapa recto respecto a la página; gíralo antes a 0°, 90°, 180° o 270°.',
        ],
      },
      languages: {
        heading: 'Idiomas',
        body: 'Elige un idioma en el panel de Ajustes, con set language <code> o en los ajustes del Mod.',
        colLanguage: 'Idioma',
        colNative: 'Nombre nativo',
        colCode: 'Código',
      },
      credits: {
        heading: 'Créditos',
        original: 'Mod original de',
        maintainer: 'Reescrito y mantenido por',
        thread: 'Hilo del foro',
        support:
          '¿Has encontrado un problema o tienes una idea? Escribe en el hilo del foro o abre una incidencia en GitHub.',
      },
    },
  };

  var localeSv = {
    titles: {
      ready: 'Resizer är redo.',
      history: 'Resizer-historik',
      pages: 'Resizer-sidor',
      settings: 'Resizer-inställningar',
      help: 'Resizer-hjälp',
    },
    menu: {
      selected: 'Markerat',
      nothingSelected: 'Inget är markerat. Markera pjäser, en karta eller teckningar först.',
      graphicSize: '{name}: {width} × {height} px ({across} × {down} celler)',
      andMore: '…och {count} till.',
      map: 'Karta',
      mapHint:
        'Rita en rektangel över några av kartans egna rutor, markera den och kartan och kalibrera sedan.',
      page: 'Sida',
      pageSize: '{across} × {down} celler, {cell} px per cell, {scale} {units} per cell',
      pageCells: '{across} × {down} celler',
      historyEmpty: 'Inget att ångra än.',
      historyHint: 'Ångra tar tillbaka den senaste ändringen först.',
      minutesAgo: 'för {minutes} min sedan',
      pickerHint: 'Bocka för sidorna som ska zoomas tillsammans och tryck på Zooma bockade sidor.',
      on: 'På',
      off: 'Av',
      handouts: 'Fullständig hjälp finns i informationsbladen:',
    },
    kinds: {
      graphic: 'Grafik',
      text: 'Text',
      pathv2: 'Teckning',
      path: 'Teckning',
      door: 'Dörr',
      window: 'Fönster',
    },
    sizes: {
      tiny: 'Pytteliten',
      small: 'Liten',
      medium: 'Medelstor',
      large: 'Stor',
      huge: 'Enorm',
      gargantuan: 'Gigantisk',
    },
    units: {
      px: 'px',
      cells: 'celler',
      units: 'sidenheter',
    },
    buttons: {
      menu: 'Meny',
      resize: 'Ändra storlek',
      creatureSize: 'Varelsestorlek',
      fit: 'Anpassa till sidan',
      centre: 'Centrera',
      sizes: 'Visa storlekar',
      calibrate: 'Kalibrera karta',
      calibrateFit: 'Kalibrera och anpassa sida',
      calibratePx: 'Kalibrera med pixlar',
      zoom: 'Zooma sida',
      zoomIn: 'Zooma ×2',
      zoomOut: 'Zooma ×½',
      resizePage: 'Ändra sidans storlek',
      pageSize: 'Sidstorlek',
      pages: 'Välj sidor',
      zoomPicked: 'Zooma bockade sidor ({count})',
      pickAll: 'Bocka för alla',
      pickNone: 'Bocka av alla',
      undo: 'Ångra',
      undoWhat: 'Ångra: {what}',
      history: 'Historik',
      clearHistory: 'Rensa historik',
      settings: 'Inställningar',
      help: 'Hjälp',
      resetSettings: 'Återställ inställningar',
      rebuild: 'Bygg om informationsblad',
    },
    queries: {
      width: 'Bredd',
      height: 'Höjd',
      unit: 'Enhet',
      unitPx: 'Pixlar',
      unitCells: 'Rutnätsceller',
      unitUnits: 'Sidenheter (70 px)',
      creatureSize: 'Varelsestorlek',
      keepShape: 'Behåll formen?',
      yes: 'Ja',
      no: 'Nej - sträck ut till sidan',
      centre: 'Centrera',
      both: 'Åt båda hållen',
      across: 'Rutor på bredden i rektangeln',
      down: 'Bara på höjden',
      downCount: 'Rutor på höjden i rektangeln',
      squarePx: 'Pixlar per ruta på kartan nu',
      factor: 'Zoomfaktor (2 = dubbelt så stor; 0.5 = hälften)',
      tokens: 'Pjäser',
      tokensScale: 'Skala med sidan',
      tokensKeep: 'Behåll deras storlek',
      language: 'Språk',
      command: 'Kommandonamn utan !',
    },
    settings: {
      language: 'Språk',
      command: 'Kommando',
      keepTokenSize: 'Behåll pjäsernas storlek vid zoom',
      scaleStrokes: 'Skala linjebredd i teckningar',
      deleteCalibrationBox: 'Ta bort kalibreringsrektangeln',
    },
    history: {
      change: 'Ändring',
      zoom: 'Zooma ×{factor} på {page}',
      zoomPages: 'Zooma ×{factor} på {count} sidor',
      size: 'Ändra storlek på {count} grafikobjekt',
      size_one: 'Ändra storlek på 1 grafikobjekt',
      page: 'Sidan {page} till {width} × {height} enheter',
      fit: 'Anpassa {count} grafikobjekt till sidan',
      fit_one: 'Anpassa 1 grafikobjekt till sidan',
      centre: 'Centrera {count} objekt',
      centre_one: 'Centrera 1 objekt',
      calibrate: 'Kalibrera kartan {name}',
      calibrateUnnamed: 'Kalibrera kartan',
    },
    messages: {
      welcome: 'Markera något och öppna menyn för att ändra storlek, eller zooma en hel sida.',
      upgraded:
        'Uppgraderat från Resizer 0.0.9. Ditt kommando {command} och de gamla kommandona fungerar fortfarande.',
      readyHint:
        'Skriv {command} för menyn, eller öppna informationsbladet Resizer - Command Deck.',
      zoomed: 'Zoomade {page} ×{factor}: {objects} objekt flyttades med.',
      zoomedPages: 'Zoomade {count} sidor ×{factor} ({page}): {objects} objekt flyttades med.',
      skipped: '{count} objekt kunde inte läsas och lämnades orörda.',
      skipped_one: '1 objekt kunde inte läsas och lämnades orört.',
      resized: 'Ändrade storlek på {count} grafikobjekt till {width} × {height} {unit}.',
      resized_one: 'Ändrade storlek på 1 grafikobjekt till {width} × {height} {unit}.',
      sized: 'Ändrade storlek på {count} grafikobjekt till {size}.',
      sized_one: 'Ändrade storlek på 1 grafikobjekt till {size}.',
      pageResized: '{page} är nu {size}.',
      fitted: 'Anpassade {count} grafikobjekt till sidan.',
      fitted_one: 'Anpassade 1 grafikobjekt till sidan.',
      centred: 'Centrerade {count} objekt på sidan.',
      centred_one: 'Centrerade 1 objekt på sidan.',
      calibrated:
        'Kalibrerat: kartan hade rutor på {square} px; nu är den skalad ×{scale} till celler på {cell} px och linjerad med rutnätet.',
      calibratedPage: 'Sidan är nu {width} × {height} enheter så att kartan får plats.',
      boxRemoved: 'Kalibreringsrektangeln togs bort (Ångra tar tillbaka den).',
      undone: 'Ångrat: {what}.',
      undoMissing: '{count} objekt hade tagits bort sedan dess och kunde inte återställas.',
      undoMissing_one: '1 objekt hade tagits bort sedan dess och kunde inte återställas.',
      notStored: 'Ändringen var för stor för att sparas i ångrahistoriken.',
      historyCleared: 'Glömde {count} ändringar.',
      historyCleared_one: 'Glömde 1 ändring.',
      settingChanged: '{key} är nu {value}.',
      settingsReset: 'Inställningarna är återställda. Ångrahistoriken sparades.',
      handoutsRebuilt: 'Informationsbladen Help och Command Deck byggdes om.',
    },
    errors: {
      unexpected: 'Något gick fel: {message}',
      unknownCommand: 'Okänt kommando "{command}". Skriv {help} för att se kommandona.',
      noSelection: 'Markera något först (eller ange --ids).',
      unknownIds: 'Inga objekt med dessa ID:n: {ids}',
      noGraphics: 'Inget av de markerade objekten kan ändras så. Markera pjäser eller en karta.',
      badSize: 'Ange en bredd och en höjd över 0, till exempel size 140 140 px.',
      badCreatureSize: 'Okänd storlek. Använd tiny, small, medium, large, huge eller gargantuan.',
      badPageSize: 'Ange en sidbredd och sidhöjd från 1 till {max} enheter.',
      badFactor: 'Ange en zoomfaktor från {min} till {max}.',
      badFactorText:
        'Kunde inte läsa "{text}" som zoomfaktor. Prova 2, 0.5, 150%, 1/2 eller "to 140".',
      factorOne: 'En zoom på 1 ändrar ingenting.',
      pageTooBig: '{page} skulle bli mindre än 1 enhet eller större än {max} enheter.',
      noPage: 'Kunde inte hitta sidan.',
      noPages: 'Inga sidor att ändra. Bocka för några i sidväljaren, eller ange --pages.',
      unknownPages: 'Inga sidor med namnet: {pages}',
      noMap: 'Markera kartgrafiken också.',
      noBox:
        'Markera en rektangel ritad över några av kartans rutor tillsammans med kartan, eller använd calibrate --cell <px>.',
      boxUnreadable: 'Kunde inte läsa storleken på den markerade teckningen.',
      boxTooSmall: 'Kalibreringsrektangeln är för liten. Rita den över en eller flera hela rutor.',
      badCount:
        'Ange antalet rutor på bredden (och höjden) i rektangeln, till exempel 3 eller 3 2.',
      badSquarePx: 'Ange storleken på kartans rutor i pixlar, 2 eller mer.',
      mapRotated: 'Vrid kartan rakt mot sidan (0°, 90°, 180° eller 270°) innan du kalibrerar.',
      nothingToUndo: 'Inget att ångra.',
      badSetting: 'Okänd inställning "{key}". Inställningar: {settings}',
      badValue: '"{value}" är inte ett värde som {key} godtar.',
    },
    help: {
      menu: 'Öppna menyn; med markerade objekt visar den deras storlekar.',
      size: 'Ändra storlek på markerad grafik (i pixlar som standard).',
      creature: 'Ändra markerade pjäser till en varelsestorlek, i rutnätsceller.',
      fit: 'Anpassa markerad grafik till sidan; --keep-ratio behåller formen.',
      center: 'Centrera markerad grafik eller text på sidan.',
      calibrate:
        'Skala den markerade kartan så att rutorna i den markerade rektangeln matchar sidans rutnät, och linjera dem sedan.',
      calibrateCell: 'Skala den markerade kartan utifrån dess rutstorlek i pixlar.',
      page: 'Visa sidstorleken, eller ändra sidans storlek (inte det som ligger på den).',
      zoom: 'Zooma sidor med allt som ligger på dem; avståndet per cell behålls.',
      pages: 'Öppna sidväljaren, eller bocka för sidor, för att zooma flera sidor på en gång.',
      undo: 'Ångra den senaste ändringen (de 10 senaste sparas).',
      history: 'Lista ändringarna du kan ångra; clear glömmer dem.',
      settings: 'Visa eller ändra inställningarna.',
      reset: 'Återställ inställningarna till standard.',
      journal: 'Bygg om informationsbladen Help och Command Deck.',
      help: 'Visa den här listan.',
    },
    deck: {
      menuTitle: 'Meny',
      menuDesc: 'Huvudmenyn visar markeringen, sidan och vad du kan ångra.',
      selectedTitle: 'Markerade pjäser och grafik',
      selectedDesc: 'Markera först och tryck sedan på en knapp.',
      mapTitle: 'Karta',
      mapDesc: 'Markera kartan och en rektangel ritad över några av dess rutor.',
      pageTitle: 'Sida',
      pageDesc: 'Zooma sidan du är på med allt som ligger på den.',
      historyTitle: 'Historik',
      historyDesc: 'Ångra tar tillbaka den senaste ändringen.',
      footer: 'Fullständiga instruktioner finns i informationsbladet {help}.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Ändra storlek på pjäser, kartor och hela sidor',
      footer: 'Knappar för varje åtgärd finns i informationsbladet {deck}.',
      overview: {
        heading: 'Översikt',
        body: 'Resizer ändrar storlek på markerade pjäser och kartor, ändrar sidors storlek och zoomar en hel sida med allt som ligger på den: karta, pjäser, teckningar, text, väggar, dörrar och fönster. Den fungerar med redigerarna Jumpgate och Legacy, behåller avståndet per rutnätscell, linjerar kartor med rutnätet och kan ångra sina 10 senaste ändringar.',
      },
      quickStart: {
        heading: 'Kom igång',
        steps: [
          'Öppna informationsbladet Resizer - Command Deck, eller skriv !resizer för menyn.',
          'Markera pjäser och tryck på Ändra storlek eller Varelsestorlek för att ändra deras storlek.',
          'Gå till en sida och tryck på Zooma sida för att zooma den; 2 dubblar allt, 0.5 halverar det.',
          'Rita en rektangel över några av kartans rutor, markera den och kartan och tryck på Kalibrera karta för att passa in kartan i rutnätet.',
          'Ångrat dig? Tryck på Ångra.',
        ],
      },
      zoom: {
        heading: 'Zooma sidor',
        intro:
          'Zoom skalar en sida och allt på den kring det övre vänstra hörnet. Rutnätscellerna blir större eller mindre, men varje cell står fortfarande för samma avstånd (5 ft förblir 5 ft), så linjaler, auror, pjäsernas ljus och syn mäter likadant.',
        points: [
          'Flyttar och skalar pjäser, kartgrafik, teckningar från Jumpgate och Legacy, text, väggar för dynamisk belysning, dörrar och fönster, samt rutnätets förskjutning.',
          'Faktorer kan vara 2, 0.5, 150%, 1/2, eller "to 140" för celler på 140 px.',
          'Behåll pjäsernas storlek (inställning eller --keep-tokens) flyttar pjäserna med kartan men låter deras storlek vara.',
          'Linjebredden i teckningar skalas med sidan om inte inställningen är avstängd; väggar behåller sin bredd.',
          'Legacy-teckningar ritas om i den nya storleken (Jumpgate ritar inte om en Legacy-teckning som en Mod ändrar), så de får nya ID:n.',
        ],
      },
      calibrate: {
        heading: 'Passa in en karta i rutnätet',
        intro:
          'Många kartor är ritade med ett eget rutnät i egen storlek. Kalibrera skalar kartan så att dess rutor matchar sidans celler och flyttar den så att linjerna möts.',
        steps: [
          'Lägg kartan på sidan och rita en rektangel (med valfritt ritverktyg) över några av kartans rutor, från linje till linje.',
          'Markera kartan och rektangeln tillsammans (Skift-klick).',
          'Tryck på Kalibrera karta och svara hur många rutor rektangeln täcker på bredden och höjden.',
          'Kartan skalas och flyttas så att rutorna passar exakt i sidans rutnät; rektangeln tas bort.',
        ],
        points: [
          'Kalibrera och anpassa sida flyttar också kartan till sidans hörn och ändrar sidans storlek så att kartan får plats.',
          'Kalibrera med pixlar hoppar över rektangeln: ange storleken på kartans rutor i pixlar som de är ritade nu.',
          'En större rektangel (fler rutor) ger en noggrannare passning.',
        ],
      },
      sizes: {
        heading: 'Varelsestorlekar',
        intro: 'Kommandot size ger pjäser en varelsestorlek i sidans rutnätsceller.',
        colSize: 'Storlek',
        colCommand: 'Kommando',
        colCells: 'Celler',
        cells: '{cells} × {cells}',
      },
      pages: {
        heading: 'Flera sidor på en gång',
        points: [
          'Välj sidor öppnar en lista över alla sidor; bocka för dem du vill ha och tryck på Zooma bockade sidor.',
          'Skrivet: zoom 2 --pages all, --pages picked, --pages current, eller namn och ID:n åtskilda med kommatecken (--pages Town, Docks).',
          'En enda ångring tar tillbaka hela omgången.',
        ],
      },
      undo: {
        heading: 'Ångra',
        points: [
          'Varje ändring (storlek, anpassning, centrering, kalibrering, sidstorlek, zoom) kan ångras.',
          'De 10 senaste ändringarna sparas med spelet, så de klarar en omstart av Mod-sandlådan.',
          'Objekt som tagits bort sedan ändringen rapporteras och hoppas över.',
          'Mycket stora ändringar (tusentals objekt) kan vara för stora för att sparas; Resizer säger till.',
        ],
      },
      commands: {
        heading: 'Kommandon',
        intro: 'Skriv {command} med ett av dessa. !resizer och !rsz fungerar också alltid.',
        colCommand: 'Kommando',
        colDesc: 'Vad det gör',
      },
      settings: {
        heading: 'Inställningar',
        intro: 'Ändra dem från kortet Inställningar eller med set <setting> <value>.',
        colKey: 'Inställning',
        colDesc: 'Vad den gör',
        rows: {
          language: 'Språk för menyer, meddelanden och informationsblad.',
          command: 'Ett extra namn för kommandot (i 0.0.9 kunde du byta namn på det).',
          keepTokenSize: 'Zoom flyttar pjäser men behåller deras storlek.',
          scaleStrokes: 'Zoom skalar linjebredden i teckningar (väggar behåller sin).',
          deleteCalibrationBox: 'Kalibrera tar bort rektangeln den mätte.',
        },
      },
      api: {
        heading: 'För Mod-utvecklare',
        intro: 'Andra Mods kan använda det globala Resizer-objektet.',
        colFunction: 'Funktion',
        colDesc: 'Vad den gör',
        rows: {
          zoomPage:
            'Zoomar en sida med allt på den, med ångra. options.keepTokens behåller pjäsernas storlek.',
          undo: 'Ångrar den senaste ändringen.',
          onZoom:
            'Anropar din funktion efter varje zoom (och med 1/factor efter att en har ångrats), så att en Mod som sparar positioner på sidan kan följa med.',
          history: 'Listar ändringarna som kan ångras.',
        },
      },
      upgrading: {
        heading: 'Uppgradera från 0.0.9',
        points: [
          'Ersätt det gamla skriptet med det här; ditt omdöpta kommando behålls.',
          'De gamla kommandona fungerar fortfarande och gör samma sak som de nya nedan.',
          'scale ändrar inte längre avståndet per cell (en cell på 5 ft förblir 5 ft).',
        ],
        colOld: '0.0.9',
        colNew: '1.0',
      },
      troubleshooting: {
        heading: 'Felsökning',
        points: [
          'Andra Mods som minns positioner på en sida (patrullvägar, pjäsers hemplatser, sparade områden) får inte veta om en zoom om de inte använder Resizer.onZoom; kontrollera dem efter zoomningen.',
          'Hexsidor zoomas som rutsidor, men kontrollera att pjäserna fortfarande står i sina hexagoner.',
          'Om en teckning ser felplacerad ut direkt efter en zoom, ladda om sidan: Roll20 ritar ibland om sent.',
          'Kalibrera kräver att kartan är rak mot sidan; vrid den till 0°, 90°, 180° eller 270° först.',
        ],
      },
      languages: {
        heading: 'Språk',
        body: 'Välj ett språk på kortet Inställningar, med set language <code>, eller i Mod-inställningarna.',
        colLanguage: 'Språk',
        colNative: 'Eget namn',
        colCode: 'Kod',
      },
      credits: {
        heading: 'Tack till',
        original: 'Ursprunglig Mod av',
        maintainer: 'Omskriven och underhållen av',
        thread: 'Forumtråd',
        support:
          'Hittat ett problem eller har en idé? Skriv i forumtråden eller öppna ett ärende på GitHub.',
      },
    },
  };

  var localeTr = {
    titles: {
      ready: 'Resizer hazır.',
      history: 'Resizer – geçmiş',
      pages: 'Resizer – sayfalar',
      settings: 'Resizer – ayarlar',
      help: 'Resizer – yardım',
    },
    menu: {
      selected: 'Seçili',
      nothingSelected: 'Hiçbir şey seçili değil. Önce jetonları, bir haritayı ya da çizimleri seç.',
      graphicSize: '{name}: {width} × {height} px ({across} × {down} kare)',
      andMore: '…ve {count} tane daha.',
      map: 'Harita',
      mapHint:
        'Haritanın kendi karelerinden birkaçının üzerine bir dikdörtgen çiz, onu ve haritayı seç, sonra kalibre et.',
      page: 'Sayfa',
      pageSize: '{across} × {down} kare, kare başına {cell} px, kare başına {scale} {units}',
      pageCells: '{across} × {down} kare',
      historyEmpty: 'Henüz geri alınacak bir şey yok.',
      historyHint: 'Geri al önce en yeni değişikliği geri alır.',
      minutesAgo: '{minutes} dk önce',
      pickerHint:
        'Birlikte ölçeklenecek sayfaları işaretle, sonra İşaretli sayfaları ölçekle düğmesine bas.',
      on: 'Açık',
      off: 'Kapalı',
      handouts: 'Tam yardım el notlarında:',
    },
    kinds: {
      graphic: 'Grafik',
      text: 'Metin',
      pathv2: 'Çizim',
      path: 'Çizim',
      door: 'Kapı',
      window: 'Pencere',
    },
    sizes: {
      tiny: 'Minik',
      small: 'Küçük',
      medium: 'Orta',
      large: 'Büyük',
      huge: 'Devasa',
      gargantuan: 'Muazzam',
    },
    units: {
      px: 'px',
      cells: 'kare',
      units: 'sayfa birimi',
    },
    buttons: {
      menu: 'Menü',
      resize: 'Yeniden boyutlandır',
      creatureSize: 'Yaratık boyutu',
      fit: 'Sayfaya sığdır',
      centre: 'Ortala',
      sizes: 'Boyutları göster',
      calibrate: 'Haritayı kalibre et',
      calibrateFit: 'Kalibre et ve sayfayı sığdır',
      calibratePx: 'Piksele göre kalibre et',
      zoom: 'Sayfayı ölçekle',
      zoomIn: 'Ölçekle ×2',
      zoomOut: 'Ölçekle ×½',
      resizePage: 'Sayfayı yeniden boyutlandır',
      pageSize: 'Sayfa boyutu',
      pages: 'Sayfa seç',
      zoomPicked: 'İşaretli sayfaları ölçekle ({count})',
      pickAll: 'Tümünü işaretle',
      pickNone: 'İşaretleri kaldır',
      undo: 'Geri al',
      undoWhat: 'Geri al: {what}',
      history: 'Geçmiş',
      clearHistory: 'Geçmişi temizle',
      settings: 'Ayarlar',
      help: 'Yardım',
      resetSettings: 'Ayarları sıfırla',
      rebuild: 'El notlarını yeniden oluştur',
    },
    queries: {
      width: 'Genişlik',
      height: 'Yükseklik',
      unit: 'Birim',
      unitPx: 'Piksel',
      unitCells: 'Izgara kareleri',
      unitUnits: 'Sayfa birimi (70 px)',
      creatureSize: 'Yaratık boyutu',
      keepShape: 'Şekil korunsun mu?',
      yes: 'Evet',
      no: 'Hayır - sayfaya göre uzat',
      centre: 'Ortala',
      both: 'İki yönde de',
      across: 'Kutunun genişliğindeki kareler',
      down: 'Yalnızca dikey',
      downCount: 'Kutunun yüksekliğindeki kareler',
      squarePx: 'Haritada şu an kare başına piksel',
      factor: 'Ölçek katsayısı (2 = iki kat büyük; 0.5 = yarısı)',
      tokens: 'Jetonlar',
      tokensScale: 'Sayfayla birlikte ölçekle',
      tokensKeep: 'Boyutlarını koru',
      language: 'Dil',
      command: 'Komut adı (! olmadan)',
    },
    settings: {
      language: 'Dil',
      command: 'Komut',
      keepTokenSize: 'Ölçeklerken jeton boyutunu koru',
      scaleStrokes: 'Çizim çizgi kalınlıklarını ölçekle',
      deleteCalibrationBox: 'Kalibrasyon kutusunu sil',
    },
    history: {
      change: 'Değişiklik',
      zoom: 'Ölçekleme ×{factor} – sayfa: {page}',
      zoomPages: 'Ölçekleme ×{factor} – {count} sayfa',
      size: '{count} grafiği yeniden boyutlandır',
      size_one: '1 grafiği yeniden boyutlandır',
      page: 'Sayfa {page} → {width} × {height} birim',
      fit: '{count} grafiği sayfaya sığdır',
      fit_one: '1 grafiği sayfaya sığdır',
      centre: '{count} nesneyi ortala',
      centre_one: '1 nesneyi ortala',
      calibrate: 'Haritayı kalibre et: {name}',
      calibrateUnnamed: 'Haritayı kalibre et',
    },
    messages: {
      welcome:
        'Yeniden boyutlandırmak için bir şey seç ve menüyü aç ya da tüm bir sayfayı ölçekle.',
      upgraded:
        'Resizer 0.0.9 sürümünden yükseltildi. {command} komutun ve eski komutlar hâlâ çalışıyor.',
      readyHint: 'Menü için {command} yaz ya da Resizer - Command Deck el notunu aç.',
      zoomed: 'Sayfa {page} ×{factor} ölçeklendi: {objects} nesne onunla birlikte taşındı.',
      zoomedPages:
        '{count} sayfa ×{factor} ölçeklendi ({page}): {objects} nesne onlarla birlikte taşındı.',
      skipped: '{count} nesne okunamadı ve olduğu gibi bırakıldı.',
      skipped_one: '1 nesne okunamadı ve olduğu gibi bırakıldı.',
      resized: '{count} grafik {width} × {height} {unit} olarak yeniden boyutlandırıldı.',
      resized_one: '1 grafik {width} × {height} {unit} olarak yeniden boyutlandırıldı.',
      sized: '{count} grafik {size} boyutuna getirildi.',
      sized_one: '1 grafik {size} boyutuna getirildi.',
      pageResized: 'Sayfa {page} artık {size}.',
      fitted: '{count} grafik sayfaya sığdırıldı.',
      fitted_one: '1 grafik sayfaya sığdırıldı.',
      centred: '{count} nesne sayfada ortalandı.',
      centred_one: '1 nesne sayfada ortalandı.',
      calibrated:
        'Kalibre edildi: haritanın kareleri {square} px idi; şimdi ×{scale} ölçeklenerek {cell} px karelere getirildi ve ızgarayla hizalandı.',
      calibratedPage: 'Sayfa artık haritaya sığması için {width} × {height} birim.',
      boxRemoved: 'Kalibrasyon kutusu silindi (Geri al onu geri getirir).',
      undone: 'Geri alındı: {what}.',
      undoMissing: '{count} nesne o zamandan beri silinmiş, bu yüzden geri konamadı.',
      undoMissing_one: '1 nesne o zamandan beri silinmiş, bu yüzden geri konamadı.',
      notStored: 'Bu değişiklik geri alma geçmişinde tutulamayacak kadar büyüktü.',
      historyCleared: '{count} değişiklik unutuldu.',
      historyCleared_one: '1 değişiklik unutuldu.',
      settingChanged: '{key} artık {value}.',
      settingsReset: 'Ayarlar varsayılanlarına döndü. Geri alma geçmişi korundu.',
      handoutsRebuilt: 'Help ve Command Deck el notları yeniden oluşturuldu.',
    },
    errors: {
      unexpected: 'Bir şeyler ters gitti: {message}',
      unknownCommand: 'Bilinmeyen komut "{command}". Komutlar için {help} yaz.',
      noSelection: 'Önce bir şey seç (ya da --ids ver).',
      unknownIds: 'Bu kimliklere sahip nesne yok: {ids}',
      noGraphics:
        'Seçili nesnelerin hiçbiri bu şekilde değiştirilemez. Jetonları ya da bir haritayı seç.',
      badSize: '0 üzerinde bir genişlik ve yükseklik ver, örneğin size 140 140 px.',
      badCreatureSize:
        'Bilinmeyen boyut. tiny, small, medium, large, huge ya da gargantuan kullan.',
      badPageSize: '1 ile {max} birim arasında bir sayfa genişliği ve yüksekliği ver.',
      badFactor: '{min} ile {max} arasında bir ölçek katsayısı ver.',
      badFactorText:
        '"{text}" ölçek katsayısı olarak okunamadı. 2, 0.5, 150%, 1/2 ya da "to 140" dene.',
      factorOne: '1 ölçeği hiçbir şeyi değiştirmez.',
      pageTooBig: 'Sayfa {page} 1 birimden küçük ya da {max} birimden büyük olurdu.',
      noPage: 'Sayfa bulunamadı.',
      noPages: 'Değiştirilecek sayfa yok. Sayfa seçicide birkaçını işaretle ya da --pages ver.',
      unknownPages: 'Bu adlarda sayfa yok: {pages}',
      noMap: 'Harita grafiğini de seç.',
      noBox:
        'Haritayla birlikte haritanın birkaç karesi üzerine çizilmiş bir dikdörtgen seç ya da calibrate --cell <px> kullan.',
      boxUnreadable: 'Seçili çizimin boyutu okunamadı.',
      boxTooSmall:
        'Kalibrasyon kutusu çok küçük. Onu bir ya da daha fazla tam karenin üzerine çiz.',
      badCount:
        'Kutunun genişliğindeki (ve yüksekliğindeki) kare sayısını ver, örneğin 3 ya da 3 2.',
      badSquarePx: 'Haritanın kare boyutunu piksel olarak ver; en az 2.',
      mapRotated:
        'Kalibre etmeden önce haritayı sayfaya göre düz çevir (0°, 90°, 180° ya da 270°).',
      nothingToUndo: 'Geri alınacak bir şey yok.',
      badSetting: 'Bilinmeyen ayar "{key}". Ayarlar: {settings}',
      badValue: '"{value}", {key} için geçerli bir değer değil.',
    },
    help: {
      menu: 'Menüyü açar; nesneler seçiliyken boyutlarını gösterir.',
      size: 'Seçili grafikleri yeniden boyutlandırır (varsayılan olarak piksel).',
      creature: 'Seçili jetonları ızgara karesi cinsinden bir yaratık boyutuna getirir.',
      fit: 'Seçili grafikleri sayfaya sığdırır; --keep-ratio şekillerini korur.',
      center: 'Seçili grafikleri ya da metni sayfada ortalar.',
      calibrate:
        'Seçili haritayı, seçili kutunun içindeki kareler sayfa ızgarasıyla eşleşecek şekilde ölçekler, sonra onları hizalar.',
      calibrateCell: 'Seçili haritayı piksel cinsinden kare boyutundan ölçekler.',
      page: 'Sayfa boyutunu gösterir ya da sayfayı yeniden boyutlandırır (üzerindekileri değil).',
      zoom: 'Sayfaları üzerlerindeki her şeyle ölçekler; kare başına mesafe korunur.',
      pages:
        'Sayfa seçiciyi açar ya da sayfaları işaretler; böylece birkaç sayfa aynı anda ölçeklenir.',
      undo: 'En yeni değişikliği geri alır (son 10 tanesi tutulur).',
      history: 'Geri alınabilecek değişiklikleri listeler; clear onları unutur.',
      settings: 'Ayarları gösterir ya da değiştirir.',
      reset: 'Ayarları varsayılanlarına döndürür.',
      journal: 'Help ve Command Deck el notlarını yeniden oluşturur.',
      help: 'Bu listeyi gösterir.',
    },
    deck: {
      menuTitle: 'Menü',
      menuDesc: 'Ana menü seçimi, sayfayı ve geri alabileceklerini gösterir.',
      selectedTitle: 'Seçili jetonlar ve grafikler',
      selectedDesc: 'Önce seç, sonra bir düğmeye bas.',
      mapTitle: 'Harita',
      mapDesc: 'Haritayı ve birkaç karesinin üzerine çizilmiş bir kutuyu seç.',
      pageTitle: 'Sayfa',
      pageDesc: 'Bulunduğun sayfayı üzerindeki her şeyle birlikte ölçekle.',
      historyTitle: 'Geçmiş',
      historyDesc: 'Geri al en yeni değişikliği geri alır.',
      footer: 'Tam talimatlar {help} el notunda.',
    },
    handout: {
      versionLabel: 'Sürüm',
      subtitle: 'Jetonları, haritaları ve tüm sayfaları yeniden boyutlandır',
      footer: 'Her işlem için düğmeler {deck} el notunda.',
      overview: {
        heading: 'Genel bakış',
        body: 'Resizer seçili jetonları ve haritaları yeniden boyutlandırır, sayfaları yeniden boyutlandırır ve tüm bir sayfayı üzerindeki her şeyle ölçekler: harita, jetonlar, çizimler, metin, duvarlar, kapılar ve pencereler. Jumpgate ve Legacy düzenleyicileriyle çalışır, ızgara karesi başına mesafeyi korur, haritaları ızgarayla hizalar ve son 10 değişikliğini geri alabilir.',
      },
      quickStart: {
        heading: 'Hızlı başlangıç',
        steps: [
          'Resizer - Command Deck el notunu aç ya da menü için !resizer yaz.',
          'Jetonları yeniden boyutlandırmak için onları seç ve Yeniden boyutlandır ya da Yaratık boyutu düğmesine bas.',
          'Bir sayfayı ölçeklemek için ona git ve Sayfayı ölçekle düğmesine bas; 2 her şeyi iki katına çıkarır, 0.5 yarıya indirir.',
          'Bir haritayı ızgaraya oturtmak için haritanın birkaç karesi üzerine bir dikdörtgen çiz, onu ve haritayı seç ve Haritayı kalibre et düğmesine bas.',
          'Fikrini mi değiştirdin? Geri al düğmesine bas.',
        ],
      },
      zoom: {
        heading: 'Sayfaları ölçekleme',
        intro:
          'Ölçekleme bir sayfayı ve üzerindeki her şeyi sol üst köşesine göre büyütür ya da küçültür. Izgara kareleri büyür ya da küçülür, ama her kare yine aynı mesafeyi temsil eder (5 ft yine 5 ft kalır); böylece cetveller, auralar, jeton ışıkları ve görüş aynı şekilde ölçer.',
        points: [
          'Jetonları, harita grafiklerini, Jumpgate ve Legacy çizimlerini, metni, dinamik aydınlatma duvarlarını, kapıları ve pencereleri ve ızgara kaydırmasını taşır ve ölçekler.',
          'Katsayı 2, 0.5, 150%, 1/2 ya da 140 px kareler için "to 140" olabilir.',
          'Jeton boyutunu koru (ayar ya da --keep-tokens) jetonları haritayla birlikte taşır ama boyutlarına dokunmaz.',
          'Ayar kapalı değilse çizimlerin çizgi kalınlıkları sayfayla birlikte ölçeklenir; duvarlar kalınlıklarını korur.',
          'Legacy çizimleri yeni boyutta yeniden çizilir (Jumpgate, bir Mod tarafından değiştirilen Legacy çizimini yeniden çizmez), bu yüzden yeni kimlikler alırlar.',
        ],
      },
      calibrate: {
        heading: 'Haritayı ızgaraya oturtma',
        intro:
          'Birçok harita kendi boyutunda kendi ızgarasıyla çizilir. Kalibrasyon haritayı, kareleri sayfanın kareleriyle eşleşecek şekilde ölçekler ve çizgiler buluşacak şekilde taşır.',
        steps: [
          'Haritayı sayfaya koy ve haritanın birkaç karesi üzerine çizgiden çizgiye bir dikdörtgen çiz (herhangi bir çizim aracıyla).',
          'Haritayı ve dikdörtgeni birlikte seç (Shift+tıklama).',
          'Haritayı kalibre et düğmesine bas ve kutunun yatayda ve dikeyde kaç kare kapladığını gir.',
          'Harita, o kareler sayfa ızgarasına tam oturacak şekilde ölçeklenir ve taşınır; kutu silinir.',
        ],
        points: [
          'Kalibre et ve sayfayı sığdır ayrıca haritayı sayfa köşesine taşır ve sayfayı haritaya göre boyutlandırır.',
          'Piksele göre kalibre et kutuyu atlar: haritanın kare boyutunu şu an çizildiği haliyle piksel olarak ver.',
          'Daha büyük bir kutu (daha çok kare) daha kesin bir oturma sağlar.',
        ],
      },
      sizes: {
        heading: 'Yaratık boyutları',
        intro:
          'Boyut, jetonları sayfalarının ızgara kareleri cinsinden bir yaratık boyutuna getirir.',
        colSize: 'Boyut',
        colCommand: 'Komut',
        colCells: 'Kare',
        cells: '{cells} × {cells}',
      },
      pages: {
        heading: 'Aynı anda birkaç sayfa',
        points: [
          'Sayfa seç tüm sayfaların listesini açar; istediklerini işaretle ve İşaretli sayfaları ölçekle düğmesine bas.',
          'Yazarak: zoom 2 --pages all, --pages picked, --pages current ya da virgülle ayrılmış adlar ve kimlikler (--pages Town, Docks).',
          'Tek bir geri alma tüm grubu geri alır.',
        ],
      },
      undo: {
        heading: 'Geri alma',
        points: [
          'Her değişiklik (yeniden boyutlandırma, sığdırma, ortalama, kalibrasyon, sayfa boyutu, ölçekleme) geri alınabilir.',
          'Son 10 değişiklik oyunla birlikte saklanır, böylece Mod korumalı alanının yeniden başlatılmasından etkilenmez.',
          'Değişiklikten sonra silinen nesneler bildirilir ve atlanır.',
          'Çok büyük değişiklikler (binlerce nesne) saklanamayacak kadar büyük olabilir; Resizer bunu söyler.',
        ],
      },
      commands: {
        heading: 'Komutlar',
        intro: '{command} ve bunlardan birini yaz. !resizer ve !rsz de her zaman çalışır.',
        colCommand: 'Komut',
        colDesc: 'Ne yapar',
      },
      settings: {
        heading: 'Ayarlar',
        intro: 'Bunları Ayarlar kartından ya da set <setting> <value> ile değiştir.',
        colKey: 'Ayar',
        colDesc: 'Ne yapar',
        rows: {
          language: 'Menülerin, mesajların ve el notlarının dili.',
          command: 'Komut için ek bir ad (0.0.9 onu yeniden adlandırmana izin veriyordu).',
          keepTokenSize: 'Ölçekleme jetonları taşır ama boyutlarını korur.',
          scaleStrokes:
            'Ölçekleme çizimlerin çizgi kalınlığını ölçekler (duvarlar kendininkini korur).',
          deleteCalibrationBox: 'Kalibrasyon ölçtüğü kutuyu siler.',
        },
      },
      api: {
        heading: 'Mod yazarları için',
        intro: 'Diğer Modlar genel Resizer nesnesini kullanabilir.',
        colFunction: 'Fonksiyon',
        colDesc: 'Ne yapar',
        rows: {
          zoomPage:
            'Bir sayfayı üzerindeki her şeyle, geri alınabilir şekilde ölçekler. options.keepTokens jeton boyutlarını korur.',
          undo: 'En yeni değişikliği geri alır.',
          onZoom:
            'Her ölçeklemeden sonra (ve birini geri aldıktan sonra 1/factor ile) fonksiyonunu çağırır; böylece sayfa konumlarını saklayan bir Mod uyum sağlayabilir.',
          history: 'Geri alınabilecek değişiklikleri listeler.',
        },
      },
      upgrading: {
        heading: '0.0.9 sürümünden yükseltme',
        points: [
          'Eski betiği bununla değiştir; yeniden adlandırdığın komut korunur.',
          'Eski komutlar hâlâ çalışır ve aşağıdaki yenilerle aynı işi yapar.',
          'scale artık kare başına mesafeyi değiştirmiyor (5 ft kare 5 ft kalır).',
        ],
        colOld: '0.0.9',
        colNew: '1.0',
      },
      troubleshooting: {
        heading: 'Sorun giderme',
        points: [
          'Bir sayfadaki konumları hatırlayan diğer Modlar (devriye rotaları, jeton yuvaları, kayıtlı alanlar) Resizer.onZoom kullanmadıkça ölçeklemeden haberdar edilmez; ölçeklemeden sonra onları kontrol et.',
          'Altıgen sayfalar kare sayfalar gibi ölçeklenir, ama jetonların hâlâ kendi altıgenlerinde durduğunu kontrol et.',
          'Bir çizim ölçeklemeden hemen sonra yerinden kaymış görünürse sayfayı yeniden yükle: Roll20 bazen geç yeniden çizer.',
          'Kalibrasyon için harita sayfaya göre düz olmalı; önce onu 0°, 90°, 180° ya da 270° açıya çevir.',
        ],
      },
      languages: {
        heading: 'Diller',
        body: 'Dili Ayarlar kartında, set language <code> ile ya da Mod ayarlarında seç.',
        colLanguage: 'Dil',
        colNative: 'Yerel adı',
        colCode: 'Kod',
      },
      credits: {
        heading: 'Emeği geçenler',
        original: 'Özgün Mod:',
        maintainer: 'Yeniden yazan ve sürdüren:',
        thread: 'Forum başlığı',
        support:
          'Bir sorun mu buldun ya da bir fikrin mi var? Forum başlığına yaz ya da GitHub üzerinde bir issue aç.',
      },
    },
  };

  var localeUk = {
    titles: {
      ready: 'Resizer готовий.',
      history: 'Resizer: історія',
      pages: 'Resizer: сторінки',
      settings: 'Resizer: налаштування',
      help: 'Resizer: довідка',
    },
    menu: {
      selected: 'Вибрано',
      nothingSelected: 'Нічого не вибрано. Спершу виберіть жетони, мапу або малюнки.',
      graphicSize: '{name}: {width} × {height} px ({across} × {down} клітинок)',
      andMore: '…і ще {count}.',
      map: 'Мапа',
      mapHint:
        'Намалюйте прямокутник поверх кількох клітинок самої мапи, виберіть його та мапу, потім відкалібруйте.',
      page: 'Сторінка',
      pageSize: '{across} × {down} клітинок, {cell} px на клітинку, {scale} {units} на клітинку',
      pageCells: '{across} × {down} клітинок',
      historyEmpty: 'Поки що нічого скасовувати.',
      historyHint: 'Скасування спершу повертає найновішу зміну.',
      minutesAgo: '{minutes} хв тому',
      pickerHint:
        'Позначте сторінки для спільного масштабування й натисніть «Масштабувати позначені».',
      on: 'Увімк.',
      off: 'Вимк.',
      handouts: 'Повна довідка в роздатках:',
    },
    kinds: {
      graphic: 'Зображення',
      text: 'Текст',
      pathv2: 'Малюнок',
      path: 'Малюнок',
      door: 'Двері',
      window: 'Вікно',
    },
    sizes: {
      tiny: 'Крихітний',
      small: 'Малий',
      medium: 'Середній',
      large: 'Великий',
      huge: 'Величезний',
      gargantuan: 'Гігантський',
    },
    units: {
      px: 'px',
      cells: 'клітинок',
      units: 'одиниць сторінки',
    },
    buttons: {
      menu: 'Меню',
      resize: 'Змінити розмір',
      creatureSize: 'Розмір істоти',
      fit: 'Вписати в сторінку',
      centre: 'По центру',
      sizes: 'Показати розміри',
      calibrate: 'Відкалібрувати мапу',
      calibrateFit: 'Відкалібрувати й підігнати сторінку',
      calibratePx: 'Калібрування за пікселями',
      zoom: 'Масштабувати сторінку',
      zoomIn: 'Масштаб ×2',
      zoomOut: 'Масштаб ×½',
      resizePage: 'Змінити розмір сторінки',
      pageSize: 'Розмір сторінки',
      pages: 'Вибрати сторінки',
      zoomPicked: 'Масштабувати позначені ({count})',
      pickAll: 'Позначити всі',
      pickNone: 'Зняти всі',
      undo: 'Скасувати',
      undoWhat: 'Скасувати: {what}',
      history: 'Історія',
      clearHistory: 'Очистити історію',
      settings: 'Налаштування',
      help: 'Довідка',
      resetSettings: 'Скинути налаштування',
      rebuild: 'Перестворити роздатки',
    },
    queries: {
      width: 'Ширина',
      height: 'Висота',
      unit: 'Одиниця',
      unitPx: 'Пікселі',
      unitCells: 'Клітинки сітки',
      unitUnits: 'Одиниці сторінки (70 px)',
      creatureSize: 'Розмір істоти',
      keepShape: 'Зберегти форму?',
      yes: 'Так',
      no: 'Ні - розтягнути по сторінці',
      centre: 'Центрувати',
      both: 'За обома осями',
      across: 'Клітинок по ширині рамки',
      down: 'Лише по вертикалі',
      downCount: 'Клітинок по висоті рамки',
      squarePx: 'Пікселів на клітинку мапи зараз',
      factor: 'Коефіцієнт масштабу (2 = удвічі більше; 0.5 = удвічі менше)',
      tokens: 'Жетони',
      tokensScale: 'Масштабувати разом зі сторінкою',
      tokensKeep: 'Зберегти їхній розмір',
      language: 'Мова',
      command: 'Назва команди без !',
    },
    settings: {
      language: 'Мова',
      command: 'Команда',
      keepTokenSize: 'Зберігати розмір жетонів під час масштабування',
      scaleStrokes: 'Масштабувати товщину ліній малюнків',
      deleteCalibrationBox: 'Видаляти рамку калібрування',
    },
    history: {
      change: 'Зміна',
      zoom: 'Масштаб ×{factor} на {page}',
      zoomPages: 'Масштаб ×{factor} на {count} сторінках',
      size: 'Розмір {count} зображень',
      size_one: 'Розмір 1 зображення',
      page: 'Сторінка {page}: {width} × {height} одиниць',
      fit: 'Вписати {count} зображень у сторінку',
      fit_one: 'Вписати 1 зображення в сторінку',
      centre: 'Центрувати {count} об’єктів',
      centre_one: 'Центрувати 1 об’єкт',
      calibrate: 'Калібрування мапи {name}',
      calibrateUnnamed: 'Калібрування мапи',
    },
    messages: {
      welcome: 'Виберіть щось і відкрийте меню, щоб змінити розмір, або масштабуйте всю сторінку.',
      upgraded:
        'Оновлено з Resizer 0.0.9. Ваша команда {command} і старі команди й надалі працюють.',
      readyHint: 'Введіть {command} для меню або відкрийте роздатку Resizer - Command Deck.',
      zoomed:
        'Сторінку {page} масштабовано ×{factor}; разом із нею переміщено об’єктів: {objects}.',
      zoomedPages:
        'Масштабовано сторінок: {count} ×{factor} ({page}); разом із ними переміщено об’єктів: {objects}.',
      skipped: 'Не вдалося прочитати об’єктів: {count}; їх залишено без змін.',
      skipped_one: 'Не вдалося прочитати 1 об’єкт; його залишено без змін.',
      resized: 'Розмір зображень ({count}) змінено на {width} × {height} {unit}.',
      resized_one: 'Розмір 1 зображення змінено на {width} × {height} {unit}.',
      sized: 'Розмір зображень ({count}) змінено на {size}.',
      sized_one: 'Розмір 1 зображення змінено на {size}.',
      pageResized: 'Розмір {page} тепер {size}.',
      fitted: 'Вписано в сторінку зображень: {count}.',
      fitted_one: '1 зображення вписано в сторінку.',
      centred: 'Відцентровано на сторінці об’єктів: {count}.',
      centred_one: '1 об’єкт відцентровано на сторінці.',
      calibrated:
        'Відкалібровано: клітинки мапи були {square} px; тепер її масштабовано ×{scale} до клітинок {cell} px і вирівняно за сіткою.',
      calibratedPage: 'Сторінка тепер {width} × {height} одиниць, щоб умістити мапу.',
      boxRemoved: 'Рамку калібрування видалено (скасування поверне її).',
      undone: 'Скасовано: {what}.',
      undoMissing: 'Об’єкти ({count}) було видалено після зміни, тож їх не можна повернути.',
      undoMissing_one: '1 об’єкт було видалено після зміни, тож його не можна повернути.',
      notStored: 'Ця зміна завелика для історії скасування.',
      historyCleared: 'Забуто змін: {count}.',
      historyCleared_one: 'Забуто 1 зміну.',
      settingChanged: '{key} тепер {value}.',
      settingsReset: 'Налаштування скинуто до типових. Історію скасування збережено.',
      handoutsRebuilt: 'Роздатки довідки та Command Deck перестворено.',
    },
    errors: {
      unexpected: 'Щось пішло не так: {message}',
      unknownCommand: 'Невідома команда «{command}». Введіть {help}, щоб побачити команди.',
      noSelection: 'Спершу виберіть щось (або вкажіть --ids).',
      unknownIds: 'Немає об’єктів із такими ID: {ids}',
      noGraphics:
        'Жоден із вибраних об’єктів не можна змінити таким чином. Виберіть жетони або мапу.',
      badSize: 'Вкажіть ширину й висоту більші за 0, наприклад size 140 140 px.',
      badCreatureSize:
        'Невідомий розмір. Використовуйте tiny, small, medium, large, huge або gargantuan.',
      badPageSize: 'Вкажіть ширину й висоту сторінки від 1 до {max} одиниць.',
      badFactor: 'Вкажіть коефіцієнт масштабу від {min} до {max}.',
      badFactorText:
        'Не вдалося розпізнати «{text}» як коефіцієнт масштабу. Спробуйте 2, 0.5, 150%, 1/2 або "to 140".',
      factorOne: 'Масштаб 1 нічого не змінює.',
      pageTooBig: '{page} стала б меншою за 1 одиницю або більшою за {max} одиниць.',
      noPage: 'Не вдалося знайти сторінку.',
      noPages: 'Немає сторінок для зміни. Позначте їх у виборі сторінок або вкажіть --pages.',
      unknownPages: 'Немає сторінок із назвою: {pages}',
      noMap: 'Виберіть також зображення мапи.',
      noBox:
        'Виберіть разом із мапою прямокутник, намальований поверх її клітинок, або використайте calibrate --cell <px>.',
      boxUnreadable: 'Не вдалося прочитати розмір вибраного малюнка.',
      boxTooSmall:
        'Рамка калібрування замала. Намалюйте її поверх однієї або кількох цілих клітинок.',
      badCount: 'Вкажіть кількість клітинок по ширині (і висоті) рамки, наприклад 3 або 3 2.',
      badSquarePx: 'Вкажіть розмір клітинки мапи в пікселях, не менше 2.',
      mapRotated: 'Перед калібруванням поверніть мапу рівно до сторінки (0°, 90°, 180° або 270°).',
      nothingToUndo: 'Нічого скасовувати.',
      badSetting: 'Невідоме налаштування «{key}». Налаштування: {settings}',
      badValue: '«{value}» не підходить для {key}.',
    },
    help: {
      menu: 'Відкрити меню; якщо вибрано об’єкти, показує їхні розміри.',
      size: 'Змінити розмір вибраних зображень (типово в пікселях).',
      creature: 'Задати вибраним жетонам розмір істоти в клітинках сітки.',
      fit: 'Вписати вибрані зображення в сторінку; --keep-ratio зберігає їхню форму.',
      center: 'Поставити вибрані зображення або текст по центру сторінки.',
      calibrate:
        'Масштабувати вибрану мапу так, щоб клітинки всередині вибраної рамки збіглися із сіткою сторінки, потім вирівняти їх.',
      calibrateCell: 'Масштабувати вибрану мапу за розміром її клітинки в пікселях.',
      page: 'Показати розмір сторінки або змінити його (але не те, що на ній).',
      zoom: 'Масштабувати сторінки з усім вмістом; відстань на клітинку зберігається.',
      pages: 'Відкрити вибір сторінок або позначити сторінки, щоб масштабувати кілька одразу.',
      undo: 'Скасувати найновішу зміну (зберігаються останні 10).',
      history: 'Список змін, які можна скасувати; clear забуває їх.',
      settings: 'Показати або змінити налаштування.',
      reset: 'Повернути типові налаштування.',
      journal: 'Перестворити роздатки довідки та Command Deck.',
      help: 'Показати цей список.',
    },
    deck: {
      menuTitle: 'Меню',
      menuDesc: 'Головне меню показує вибране, сторінку і те, що можна скасувати.',
      selectedTitle: 'Вибрані жетони й зображення',
      selectedDesc: 'Спершу виберіть, потім натисніть кнопку.',
      mapTitle: 'Мапа',
      mapDesc: 'Виберіть мапу й рамку, намальовану поверх кількох її клітинок.',
      pageTitle: 'Сторінка',
      pageDesc: 'Масштабуйте поточну сторінку з усім вмістом.',
      historyTitle: 'Історія',
      historyDesc: 'Скасування повертає найновішу зміну.',
      footer: 'Повні інструкції в роздатці {help}.',
    },
    handout: {
      versionLabel: 'Версія',
      subtitle: 'Зміна розміру жетонів, мап і цілих сторінок',
      footer: 'Кнопки для всіх дій у роздатці {deck}.',
      overview: {
        heading: 'Огляд',
        body: 'Resizer змінює розмір вибраних жетонів і мап, змінює розмір сторінок і масштабує всю сторінку з усім вмістом: мапою, жетонами, малюнками, текстом, стінами, дверима й вікнами. Він працює з редакторами Jumpgate і Legacy, зберігає відстань на клітинку сітки, вирівнює мапи за сіткою і може скасувати останні 10 змін.',
      },
      quickStart: {
        heading: 'Швидкий старт',
        steps: [
          'Відкрийте роздатку Resizer - Command Deck або введіть !resizer для меню.',
          'Щоб змінити розмір жетонів, виберіть їх і натисніть «Змінити розмір» або «Розмір істоти».',
          'Щоб масштабувати сторінку, перейдіть на неї й натисніть «Масштабувати сторінку»; 2 подвоює все, 0.5 зменшує вдвічі.',
          'Щоб підігнати мапу до сітки, намалюйте прямокутник поверх кількох клітинок мапи, виберіть його та мапу й натисніть «Відкалібрувати мапу».',
          'Передумали? Натисніть «Скасувати».',
        ],
      },
      zoom: {
        heading: 'Масштабування сторінок',
        intro:
          'Масштабування збільшує або зменшує сторінку з усім вмістом відносно її лівого верхнього кута. Клітинки сітки стають більшими чи меншими, але кожна клітинка позначає ту саму відстань (5 футів лишаються 5 футами), тож лінійки, аури, світло жетонів і зір вимірюють так само.',
        points: [
          'Переміщує й масштабує жетони, зображення мап, малюнки Jumpgate і Legacy, текст, стіни динамічного освітлення, двері й вікна, а також зміщення сітки.',
          'Коефіцієнт може бути 2, 0.5, 150%, 1/2 або "to 140" для клітинок 140 px.',
          'Збереження розміру жетонів (налаштування або --keep-tokens) переміщує жетони разом із мапою, але не змінює їхній розмір.',
          'Товщина ліній малюнків масштабується разом зі сторінкою, якщо налаштування не вимкнене; стіни зберігають свою товщину.',
          'Малюнки Legacy перемальовуються в новому розмірі (Jumpgate не перемальовує малюнок Legacy, змінений модом), тож отримують нові ID.',
        ],
      },
      calibrate: {
        heading: 'Підгонка мапи до сітки',
        intro:
          'Багато мап намальовано з власною сіткою власного розміру. Калібрування масштабує мапу так, щоб її клітинки збіглися з клітинками сторінки, і зсуває її, щоб лінії зійшлися.',
        steps: [
          'Покладіть мапу на сторінку й намалюйте прямокутник (будь-яким інструментом малювання) поверх кількох клітинок мапи, від лінії до лінії.',
          'Виберіть мапу й прямокутник разом (Shift-клік).',
          'Натисніть «Відкалібрувати мапу» і вкажіть, скільки клітинок рамка охоплює по ширині й висоті.',
          'Мапа масштабується й зсувається так, щоб ці клітинки точно збіглися із сіткою сторінки; рамка видаляється.',
        ],
        points: [
          '«Відкалібрувати й підігнати сторінку» також зсуває мапу в кут сторінки й змінює розмір сторінки під неї.',
          '«Калібрування за пікселями» обходиться без рамки: вкажіть розмір клітинки мапи в пікселях у її теперішньому вигляді.',
          'Що більша рамка (більше клітинок), то точніша підгонка.',
        ],
      },
      sizes: {
        heading: 'Розміри істот',
        intro: 'Команда size задає жетонам розмір істоти в клітинках сітки їхньої сторінки.',
        colSize: 'Розмір',
        colCommand: 'Команда',
        colCells: 'Клітинки',
        cells: '{cells} × {cells}',
      },
      pages: {
        heading: 'Кілька сторінок одразу',
        points: [
          '«Вибрати сторінки» відкриває список усіх сторінок; позначте потрібні й натисніть «Масштабувати позначені».',
          'Командою: zoom 2 --pages all, --pages picked, --pages current або назви й ID через кому (--pages Town, Docks).',
          'Одне скасування повертає весь пакет.',
        ],
      },
      undo: {
        heading: 'Скасування',
        points: [
          'Будь-яку зміну (розмір, вписування, центрування, калібрування, розмір сторінки, масштаб) можна скасувати.',
          'Останні 10 змін зберігаються в грі, тож переживають перезапуск пісочниці модів.',
          'Об’єкти, видалені після зміни, зазначаються в повідомленні й пропускаються.',
          'Дуже великі зміни (тисячі об’єктів) можуть не вміститися в історію; Resizer про це повідомить.',
        ],
      },
      commands: {
        heading: 'Команди',
        intro: 'Введіть {command} з однією з цих команд. !resizer і !rsz теж завжди працюють.',
        colCommand: 'Команда',
        colDesc: 'Що робить',
      },
      settings: {
        heading: 'Налаштування',
        intro: 'Змінюйте їх у картці налаштувань або командою set <setting> <value>.',
        colKey: 'Налаштування',
        colDesc: 'Що робить',
        rows: {
          language: 'Мова меню, повідомлень і роздаток.',
          command: 'Додаткова назва команди (у 0.0.9 її можна було перейменувати).',
          keepTokenSize: 'Масштабування переміщує жетони, але зберігає їхній розмір.',
          scaleStrokes: 'Масштабування змінює товщину ліній малюнків (стіни зберігають свою).',
          deleteCalibrationBox: 'Калібрування видаляє рамку, за якою проводило вимірювання.',
        },
      },
      api: {
        heading: 'Для авторів модів',
        intro: 'Інші моди можуть використовувати глобальний об’єкт Resizer.',
        colFunction: 'Функція',
        colDesc: 'Що робить',
        rows: {
          zoomPage:
            'Масштабує сторінку з усім вмістом, з можливістю скасування. options.keepTokens зберігає розмір жетонів.',
          undo: 'Скасовує найновішу зміну.',
          onZoom:
            'Викликає вашу функцію після кожного масштабування (і з 1/factor після його скасування), щоб мод, який зберігає позиції на сторінці, міг їх оновити.',
          history: 'Повертає список змін, які можна скасувати.',
        },
      },
      upgrading: {
        heading: 'Оновлення з 0.0.9',
        points: [
          'Замініть старий скрипт цим; ваша перейменована команда збережеться.',
          'Старі команди й надалі працюють і роблять те саме, що нові нижче.',
          'scale більше не змінює відстань на клітинку (клітинка 5 футів лишається 5 футів).',
        ],
        colOld: '0.0.9',
        colNew: '1.0',
      },
      troubleshooting: {
        heading: 'Розв’язання проблем',
        points: [
          'Інші моди, що запам’ятовують позиції на сторінці (маршрути патрулів, місця жетонів, збережені області), не дізнаються про масштабування, якщо не використовують Resizer.onZoom; перевірте їх після масштабування.',
          'Гексові сторінки масштабуються як квадратні, але перевірте, чи жетони лишилися у своїх гексах.',
          'Якщо малюнок одразу після масштабування виглядає не на місці, перезавантажте сторінку: Roll20 іноді перемальовує із запізненням.',
          'Для калібрування мапа має стояти рівно до сторінки; спершу поверніть її на 0°, 90°, 180° або 270°.',
        ],
      },
      languages: {
        heading: 'Мови',
        body: 'Виберіть мову в картці налаштувань, командою set language <code> або в налаштуваннях мода.',
        colLanguage: 'Мова',
        colNative: 'Назва мовою оригіналу',
        colCode: 'Код',
      },
      credits: {
        heading: 'Автори',
        original: 'Оригінальний мод:',
        maintainer: 'Переписав і підтримує:',
        thread: 'Тема на форумі',
        support:
          'Знайшли проблему або маєте ідею? Напишіть у темі на форумі або створіть запит на GitHub.',
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
    af: localeAf,
    ca: localeCa,
    'zh-TW': localeZhTW,
    cs: localeCs,
    da: localeDa,
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
   * Falls back to en-US when the key is missing in the requested locale. When
   * vars.count is 1, a sibling key ending in _one is used if it exists.
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
    // A count of 1 uses the key's "_one" form when there is one (in that
    // language, before falling back to its plain form).
    const single = [...parts.slice(0, -1), `${parts.at(-1)}_one`];
    const pick = (translations) =>
      (vars.count === 1 || vars.count === '1' ? getNestedValue(translations, single) : undefined) ??
      getNestedValue(translations, parts);
    let value = pick(TRANSLATIONS[lang]);

    if (value === undefined && lang !== DEFAULT_LOCALE) {
      value = pick(TRANSLATIONS[DEFAULT_LOCALE]);
    }

    if (typeof value !== 'string') {
      return key;
    }

    return value.replaceAll(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
  }

  // Persistent state: state.RESIZER. 0.0.9 stored { config: { command,
  // firsttime } } there; 1.0 upgrades that in place, keeping a renamed command.

  /**
   * Returns a fresh, empty state.
   *
   * @returns {object} State.
   */
  function createDefaultState() {
    return {
      schemaVersion: SCHEMA_VERSION,
      version: SCRIPT_VERSION,
      settings: { ...DEFAULT_SETTINGS },
      // Newest change last. See undo.js.
      undo: [],
      // Page IDs ticked in the page picker.
      picked: [],
      notices: { useroptions: {}, upgradedFrom: null },
    };
  }

  /**
   * Cleans a command name: no "!", letters, digits, "-" and "_" only.
   *
   * @param {*} raw Name typed by the GM.
   * @returns {string} Clean name, or an empty string when nothing usable is left.
   */
  function cleanCommandName(raw) {
    return toText(raw)
      .replace(/^!+/, '')
      .replaceAll(/[^A-Za-z0-9_-]/g, '')
      .slice(0, MAX_COMMAND_NAME_LENGTH)
      .toLowerCase();
  }

  /**
   * Cleans a stored state, filling in anything missing and upgrading 0.0.9.
   *
   * @param {*} raw Stored state.
   * @returns {{state: object, fresh: boolean, upgraded: boolean}} Clean state, whether it
   *   was new, and whether it came from 0.0.9.
   */
  function migrateState(raw) {
    if (!isRecord(raw)) {
      return { state: createDefaultState(), fresh: true, upgraded: false };
    }
    const base = createDefaultState();
    if (raw.schemaVersion === undefined) {
      // 0.0.9: only the command name is worth keeping.
      const config = isRecord(raw.config) ? raw.config : {};
      const command = cleanCommandName(config.command) || DEFAULT_COMMAND_NAME;
      base.settings.command = command;
      base.notices.upgradedFrom = '0.0.9';
      return { state: base, fresh: false, upgraded: true };
    }
    const settings = { ...base.settings, ...(isRecord(raw.settings) ? raw.settings : {}) };
    settings.command = cleanCommandName(settings.command) || DEFAULT_COMMAND_NAME;
    settings.language = getLocale(settings.language);
    for (const key of ['keepTokenSize', 'scaleStrokes', 'deleteCalibrationBox']) {
      settings[key] = typeof settings[key] === 'boolean' ? settings[key] : DEFAULT_SETTINGS[key];
    }
    const clean = {
      ...base,
      ...raw,
      schemaVersion: SCHEMA_VERSION,
      settings,
      undo: Array.isArray(raw.undo) ? raw.undo.filter(isRecord) : [],
      picked: Array.isArray(raw.picked) ? raw.picked.filter((id) => typeof id === 'string') : [],
      notices: { ...base.notices, ...(isRecord(raw.notices) ? raw.notices : {}) },
    };
    return { state: clean, fresh: false, upgraded: false };
  }

  /**
   * Loads (and upgrades) the persistent state.
   *
   * @returns {{fresh: boolean, upgraded: boolean}} Whether it was new or came from 0.0.9.
   */
  function initialiseState() {
    const { state: clean, fresh, upgraded } = migrateState(state[STATE_KEY]);
    clean.version = SCRIPT_VERSION;
    state[STATE_KEY] = clean;
    return { fresh, upgraded };
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
   * Returns the settings.
   *
   * @returns {object} Settings.
   */
  function getSettings() {
    return getState().settings;
  }

  /**
   * Returns the GM's language.
   *
   * @returns {string} Locale code.
   */
  function getLang() {
    return getLocale(getSettings().language);
  }

  /**
   * Returns the commands Resizer answers to: !resizer, !rsz and a renamed one.
   *
   * @returns {string[]} Commands, lower case, with "!".
   */
  function getCommandNames() {
    const custom = `!${cleanCommandName(getSettings().command) || DEFAULT_COMMAND_NAME}`;
    return [...new Set(['!resizer', '!rsz', custom])];
  }

  /**
   * Returns the command buttons and help use (the renamed one when there is one).
   *
   * @returns {string} Command with "!".
   */
  function getCommand() {
    return `!${cleanCommandName(getSettings().command) || DEFAULT_COMMAND_NAME}`;
  }

  /**
   * Changes a setting after checking its value.
   *
   * @param {string} key Setting name.
   * @param {*} value New value.
   * @returns {boolean} True when the value was accepted.
   */
  function setSetting(key, value) {
    const s = getSettings();
    if (key === 'language') {
      s.language = getLocale(value);
      return true;
    }
    if (key === 'command') {
      const name = cleanCommandName(value);
      if (!name) {
        return false;
      }
      s.command = name;
      return true;
    }
    if (key in DEFAULT_SETTINGS && typeof DEFAULT_SETTINGS[key] === 'boolean') {
      const b = parseBoolean(value);
      if (b === null) {
        return false;
      }
      s[key] = b;
      return true;
    }
    return false;
  }

  /**
   * Puts every setting back to its default (the undo history is kept).
   *
   * @returns {void}
   */
  function resetSettings() {
    getState().settings = { ...DEFAULT_SETTINGS };
  }

  /**
   * Applies the One-Click useroptions when the GM has changed them.
   *
   * @returns {void}
   */
  function applyGlobalConfig() {
    if (typeof globalconfig === 'undefined' || !isRecord(globalconfig)) {
      return;
    }
    const branch = globalconfig.resizer || globalconfig.Resizer || globalconfig[STATE_KEY];
    if (!isRecord(branch)) {
      return;
    }
    const options = isRecord(branch.useroptions) ? branch.useroptions : branch;
    const s = getState();
    // useroptions only change when the GM edits them, so remember what was last
    // applied; otherwise chat changes would be overwritten on every restart.
    const applied = isRecord(s.notices.useroptions) ? s.notices.useroptions : {};
    for (const key of ['language']) {
      if (key in options && options[key] !== applied[key]) {
        setSetting(key, options[key]);
        applied[key] = options[key];
      }
    }
    s.notices.useroptions = applied;
  }

  // Journal handouts: the Help handout and the Command Deck. Both are rebuilt on
  // every start and when the language changes, so they always match the
  // installed version.

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
    code: 'font-family:monospace;color:#d9c2ff;',
    link: `color:${COLOR_ACCENT};`,
    footer: `color:${COLOR_MUTED};font-size:0.85em;text-align:center;margin-top:16px;border-top:1px solid ${COLOR_BORDER};padding-top:8px;`,
    btn: `background:${COLOR_BUTTON_BG};color:${COLOR_BUTTON_TEXT};padding:3px 9px;border-radius:3px;text-decoration:none;font-size:0.9em;display:inline-block;margin:2px 3px;font-weight:bold;`,
    btnDark: `background:${COLOR_BUTTON2_BG};color:${COLOR_TEXT};border:1px solid ${COLOR_BUTTON2_BORDER};padding:3px 9px;border-radius:3px;text-decoration:none;font-size:0.9em;display:inline-block;margin:2px 3px;`,
    section: `background:${COLOR_HEADER_BG};color:${COLOR_ACCENT};padding:4px 8px;font-variant:small-caps;font-weight:bold;letter-spacing:0.05em;border-left:3px solid ${COLOR_ACCENT};margin:12px 0 4px 0;`,
    desc: `color:${COLOR_MUTED};font-size:0.85em;margin:0 0 4px 8px;`,
  };

  /**
   * Builds a table.
   *
   * @param {string[]} headings Column headings (escaped here).
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
   * @param {*} items Translated value (an array of strings).
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
    const command = getCommand();
    const h = (key, vars) => escapeHtml(t(`handout.${key}`, lang, vars));
    const raw = (key) => tRaw(`handout.${key}`, lang);
    const code = (text) => `<span style="${STYLE.code}">${escapeHtml(text)}</span>`;
    const p = (key, vars) => `<p style="${STYLE.p}">${h(key, vars)}</p>`;
    const section = (key, body) => `<h2 style="${STYLE.h2}">${h(`${key}.heading`)}</h2>${body}`;

    const commands = COMMAND_LIST.map(([cmd, key]) => [
      code(`${command} ${cmd}`.trim()),
      escapeHtml(t(`help.${key}`, lang)),
    ]);
    const settings = Object.keys(DEFAULT_SETTINGS).map((key) => [
      code(key),
      escapeHtml(t(`handout.settings.rows.${key}`, lang)),
    ]);
    const sizes = Object.entries(CREATURE_SIZES).map(([size, cells]) => [
      escapeHtml(t(`sizes.${size}`, lang)),
      code(`${command} size ${size}`),
      escapeHtml(t('handout.sizes.cells', lang, { cells })),
    ]);
    const legacy = [
      ['!resizer 50 50', `${command} size 50 50 px`],
      ['!resizer page 30 20', `${command} page 30 20 units`],
      ['!resizer page 2100 1400 pixels', `${command} page 2100 1400 px`],
      ['!resizer scale 2 up', `${command} zoom 2`],
      ['!resizer scale 2 down', `${command} zoom 1/2`],
      ['!resizer fit keep_ratio', `${command} fit --keep-ratio`],
      ['!resizer center h v', `${command} center both`],
      ['!resizer config command|name', `${command} set command name`],
    ].map(([a, b]) => [code(a), code(b)]);
    const api = [
      ['zoomPage(pageId, factor, options)', 'zoomPage'],
      ['undo()', 'undo'],
      ['onZoom((pageId, factor) => …)', 'onZoom'],
      ['history()', 'history'],
    ].map(([fn, key]) => [code(`Resizer.${fn}`), escapeHtml(t(`handout.api.rows.${key}`, lang))]);
    const locales = LOCALE_DEFINITIONS.map((locale) => [
      escapeHtml(locale.name),
      escapeHtml(locale.nativeName || locale.name),
      `${buildLocaleFlag(locale)}${code(locale.code)}`,
    ]);
    const { original, maintainer } = AUTHOR_LINKS;

    return `<div style="${STYLE.outer}${getDirectionStyle(lang)}">
    <div style="${STYLE.header}">
      <h1 style="${STYLE.h1}">✦ ${SCRIPT_NAME} ✦</h1>
      <p style="${STYLE.subtitle}">${h('versionLabel')} ${SCRIPT_VERSION} • ${h('subtitle')}</p>
    </div>
    ${section('overview', p('overview.body'))}
    ${section('quickStart', list(raw('quickStart.steps'), true))}
    ${section('zoom', `${p('zoom.intro')}${list(raw('zoom.points'))}`)}
    ${section('calibrate', `${p('calibrate.intro')}${list(raw('calibrate.steps'), true)}${list(raw('calibrate.points'))}`)}
    ${section('sizes', `${p('sizes.intro')}${table([t('handout.sizes.colSize', lang), t('handout.sizes.colCommand', lang), t('handout.sizes.colCells', lang)], sizes)}`)}
    ${section('pages', list(raw('pages.points')))}
    ${section('undo', list(raw('undo.points')))}
    ${section('commands', `${p('commands.intro', { command })}${table([t('handout.commands.colCommand', lang), t('handout.commands.colDesc', lang)], commands)}`)}
    ${section('settings', `${p('settings.intro')}${table([t('handout.settings.colKey', lang), t('handout.settings.colDesc', lang)], settings)}`)}
    ${section('api', `${p('api.intro')}${table([t('handout.api.colFunction', lang), t('handout.api.colDesc', lang)], api)}`)}
    ${section('upgrading', `${list(raw('upgrading.points'))}${table([t('handout.upgrading.colOld', lang), t('handout.upgrading.colNew', lang)], legacy)}`)}
    ${section('troubleshooting', list(raw('troubleshooting.points')))}
    ${section('languages', `${p('languages.body')}${table([t('handout.languages.colLanguage', lang), t('handout.languages.colNative', lang), t('handout.languages.colCode', lang)], locales)}`)}
    ${section(
      'credits',
      `<p style="${STYLE.p}">${h('credits.original')} ${link(original.profile, original.name)} • ${link(original.thread, t('handout.credits.thread', lang))}</p>
       <p style="${STYLE.p}">${h('credits.maintainer')} ${link(maintainer.profile, maintainer.name)} • ${link(maintainer.github, 'GitHub')}</p>
       ${p('credits.support')}`
    )}
    <div style="${STYLE.footer}">${SCRIPT_NAME} ${SCRIPT_VERSION} • ${h('footer', { deck: HANDOUT_DECK_NAME })}</div>
  </div>`;
  }

  /**
   * Makes text safe inside a Roll20 query, where | , { and } have meaning.
   *
   * @param {string} text Label.
   * @returns {string} Safe label.
   */
  function queryText$1(text) {
    return String(text)
      .replaceAll(/[|,{}]/g, ' ')
      .replaceAll(/\s+/g, ' ')
      .trim();
  }

  /**
   * Builds the Command Deck handout HTML.
   *
   * @param {string} locale Locale code.
   * @returns {string} HTML string.
   */
  function buildDeckHtml(locale) {
    const lang = getLocale(locale);
    const command = getCommand();
    const tr = (key, vars) => t(key, lang, vars);
    const q = (key, answer) => `?{${queryText$1(tr(`queries.${key}`))}|${answer}}`;
    const btn = (label, cmd, dark = false) =>
      `<a href="${escapeHtml(`${command} ${cmd}`.trim())}" style="${dark ? STYLE.btnDark : STYLE.btn}">${escapeHtml(label)}</a>`;
    const group = (titleKey, descKey, buttons) =>
      `<div style="${STYLE.section}">${escapeHtml(tr(titleKey))}</div><div style="${STYLE.desc}">${escapeHtml(tr(descKey))}</div><div>${buttons.join('')}</div>`;
    const sizeButtons = Object.keys(CREATURE_SIZES)
      .filter((s) => s !== 'small')
      .map((s) => btn(tr(`sizes.${s}`), `size ${s}`, true));

    return `<div style="${STYLE.outer}${getDirectionStyle(lang)}">
    <div style="${STYLE.header}">
      <h1 style="${STYLE.h1}">✦ ${SCRIPT_NAME} ✦</h1>
      <p style="${STYLE.subtitle}">${DECK_TITLE} • v${SCRIPT_VERSION}</p>
    </div>
    ${group('deck.menuTitle', 'deck.menuDesc', [btn(tr('buttons.menu'), ''), btn(tr('buttons.settings'), 'settings', true), btn(tr('buttons.help'), 'help', true)])}
    ${group('deck.selectedTitle', 'deck.selectedDesc', [btn(tr('buttons.resize'), `size ${q('width', 70)} ${q('height', 70)} px`), btn(tr('buttons.fit'), 'fit --keep-ratio'), btn(tr('buttons.centre'), 'center both', true), ...sizeButtons])}
    ${group('deck.mapTitle', 'deck.mapDesc', [btn(tr('buttons.calibrate'), `calibrate ${q('across', 1)} ${q('downCount', 1)}`), btn(tr('buttons.calibrateFit'), `calibrate ${q('across', 1)} ${q('downCount', 1)} --fit-page`, true), btn(tr('buttons.calibratePx'), `calibrate --cell ${q('squarePx', 100)}`, true)])}
    ${group('deck.pageTitle', 'deck.pageDesc', [btn(tr('buttons.zoomIn'), 'zoom 2'), btn(tr('buttons.zoomOut'), 'zoom 1/2'), btn(tr('buttons.zoom'), `zoom ${q('factor', 2)}`, true), btn(tr('buttons.pageSize'), 'page', true), btn(tr('buttons.pages'), 'pages', true)])}
    ${group('deck.historyTitle', 'deck.historyDesc', [btn(tr('buttons.undo'), 'undo'), btn(tr('buttons.history'), 'history', true)])}
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
    const [primary, ...duplicates] = findObjs({ _type: 'handout', name });
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
   * Creates or refreshes the Help and Command Deck handouts in the GM's language.
   *
   * @returns {void}
   */
  function installHandouts() {
    const lang = getLang();
    upsertHandout(HANDOUT_HELP_NAME, buildHelpHtml(lang));
    upsertHandout(HANDOUT_DECK_NAME, buildDeckHtml(lang));
  }

  // Reading Roll20 objects: what a page holds, what is selected, and which
  // attributes of each kind Resizer changes (and so must remember for undo).

  // Every kind of page object Resizer moves or scales.
  const OBJECT_TYPES = ['graphic', 'text', 'pathv2', 'path', 'door', 'window'];

  // Attributes saved before a change, by object type. Legacy paths are drawn
  // again rather than changed, so all their properties are kept instead.
  const GEOMETRY_KEYS = {
    graphic: ['left', 'top', 'width', 'height'],
    text: ['left', 'top', 'font_size', 'width', 'height'],
    pathv2: ['x', 'y', 'points', 'stroke_width'],
    door: ['x', 'y', 'path'],
    window: ['x', 'y', 'path'],
    page: ['width', 'height', 'snapping_increment', 'grid_offset_x', 'grid_offset_y'],
  };

  // Read-only or bookkeeping attributes left out when a Legacy path is drawn again.
  const LEGACY_SKIP = new Set(['_id', '_type', '_fbpath', '_zorder']);

  /**
   * Returns a plain copy of a Roll20 object's attributes.
   *
   * @param {object} obj Roll20 object.
   * @returns {object} Attributes.
   */
  function attrsOf(obj) {
    return JSON.parse(JSON.stringify(obj.toJSON ? obj.toJSON() : obj.attributes || {}));
  }

  /**
   * Returns the attributes that matter for undo.
   *
   * @param {string} type Object type.
   * @param {object} obj Roll20 object.
   * @returns {object} Attribute values (deep copies).
   */
  function snapshot(type, obj) {
    const out = {};
    for (const key of GEOMETRY_KEYS[type] || []) {
      const v = obj.get(key);
      if (v !== undefined) {
        out[key] = v && typeof v === 'object' ? JSON.parse(JSON.stringify(v)) : v;
      }
    }
    return out;
  }

  /**
   * Properties to draw a Legacy path again.
   *
   * @param {object} obj Roll20 path.
   * @returns {object} Properties for createObj('path').
   */
  function legacyPathProps(obj) {
    const all = attrsOf(obj);
    const out = {};
    for (const [key, value] of Object.entries(all)) {
      if (!LEGACY_SKIP.has(key)) {
        out[key] = value;
      }
    }
    out._pageid = all._pageid;
    out._path = all._path;
    return out;
  }

  /**
   * Returns every object on a page that Resizer changes, by type.
   *
   * @param {string} pageId Page ID.
   * @returns {Array<{type: string, obj: object}>} Objects.
   */
  function pageObjects(pageId) {
    const out = [];
    for (const type of OBJECT_TYPES) {
      for (const obj of findObjs({ _type: type, _pageid: pageId })) {
        out.push({ type, obj });
      }
    }
    return out;
  }

  /**
   * Finds a selected or named object. Jumpgate reports a selected drawing as
   * 'path' even though the API holds it as 'pathv2', so both are tried.
   *
   * @param {string} id Object ID.
   * @param {string} [type] Type Roll20 gave.
   * @returns {{type: string, obj: object}|null} Object, or null.
   */
  function findObject(id, type) {
    const order = [type, ...OBJECT_TYPES].filter(Boolean);
    if (type === 'path') {
      order.unshift('pathv2');
    }
    for (const t of order) {
      const obj = getObj(t, id);
      if (obj) {
        return { type: t, obj };
      }
    }
    return null;
  }

  /**
   * Returns the objects a command is for: the --ids list, or the selection.
   *
   * @param {object} msg Chat message.
   * @param {string[]|null} ids IDs given with --ids.
   * @returns {{found: Array<{type: string, obj: object}>, unknown: string[]}} Objects and IDs
   *   not found.
   */
  function targetObjects(msg, ids) {
    const wanted = ids ? ids.map((id) => ({ _id: id })) : msg.selected || [];
    const found = [];
    const unknown = [];
    const seen = new Set();
    for (const sel of wanted) {
      const hit = findObject(sel._id, sel._type);
      if (hit && !seen.has(hit.obj.id)) {
        seen.add(hit.obj.id);
        found.push(hit);
      } else if (!hit) {
        unknown.push(sel._id);
      }
    }
    return { found, unknown };
  }

  /**
   * Returns a short name for an object, for replies.
   *
   * @param {string} type Object type.
   * @param {object} obj Roll20 object.
   * @returns {string} Name, or an empty string.
   */
  function objectName(type, obj) {
    if (type === 'graphic') {
      return obj.get('name') || '';
    }
    if (type === 'text') {
      return String(obj.get('text') || '').slice(0, 30);
    }
    return '';
  }

  /**
   * True when a graphic counts as a token for "keep token size": anything on the
   * Tokens or GM layer that is not a drawing.
   *
   * @param {object} obj Roll20 graphic.
   * @returns {boolean} True for tokens.
   */
  function isToken(obj) {
    const layer = obj.get('layer');
    return (layer === 'objects' || layer === 'gmlayer') && obj.get('isdrawing') !== true;
  }

  // Which pages a command is for: the page the GM is looking at, a --pages list,
  // or the pages ticked in the page picker.

  /**
   * Returns every page, in the order Roll20 lists them, without archived ones.
   *
   * @returns {object[]} Roll20 pages.
   */
  function allPages() {
    return findObjs({ _type: 'page' }).filter((p) => p.get('archived') !== true);
  }

  /**
   * Returns the page a player is on: the GM's last viewed page, or the player
   * ribbon page for commands from other Mods.
   *
   * @param {string} playerId Roll20 player ID.
   * @returns {object|null} Roll20 page.
   */
  function currentPage(playerId) {
    if (playerId && playerId !== API_PLAYER_ID) {
      const last = getObj('player', playerId)?.get('_lastpage');
      const page = last && getObj('page', last);
      if (page) {
        return page;
      }
    }
    return getObj('page', Campaign().get('playerpageid')) || null;
  }

  /**
   * Reads a --pages list: all, current, picked, ribbon, or page names and IDs
   * separated by commas (names may contain spaces).
   *
   * @param {string} spec Text after --pages.
   * @param {string} playerId Who asked.
   * @returns {{pages: object[], unknown: string[]}} Pages found and names not found.
   */
  function resolvePages(spec, playerId) {
    const parts = toText(spec)
      .replaceAll(/^["']|["']$/g, '')
      .split(',')
      .map((p) => p.trim().replaceAll(/^["']|["']$/g, ''))
      .filter(Boolean);
    const pages = [];
    const unknown = [];
    const add = (page) => {
      if (page && !pages.includes(page)) {
        pages.push(page);
      }
    };
    const every = allPages();
    for (const part of parts) {
      const word = part.toLowerCase();
      if (word === 'all') {
        every.forEach(add);
      } else if (word === 'current' || word === 'here') {
        add(currentPage(playerId));
      } else if (word === 'ribbon') {
        add(getObj('page', Campaign().get('playerpageid')));
      } else if (word === 'picked') {
        pickedPages().forEach(add);
      } else {
        const page =
          getObj('page', part) || every.find((p) => toText(p.get('name')).toLowerCase() === word);
        if (page) {
          add(page);
        } else {
          unknown.push(part);
        }
      }
    }
    return { pages, unknown };
  }

  /**
   * Returns the pages ticked in the picker that still exist.
   *
   * @returns {object[]} Roll20 pages.
   */
  function pickedPages() {
    const s = getState();
    s.picked = s.picked.filter((id) => getObj('page', id));
    return s.picked.map((id) => getObj('page', id));
  }

  /**
   * Ticks or unticks a page in the picker.
   *
   * @param {string} pageId Page ID.
   * @returns {boolean|null} True when now ticked, false when unticked, null when no such page.
   */
  function togglePicked(pageId) {
    if (!getObj('page', pageId)) {
      return null;
    }
    const s = getState();
    if (s.picked.includes(pageId)) {
      s.picked = s.picked.filter((id) => id !== pageId);
      return false;
    }
    s.picked.push(pageId);
    return true;
  }

  /**
   * Ticks every page, or none.
   *
   * @param {boolean} on Tick (true) or clear (false).
   * @returns {void}
   */
  function pickAll(on) {
    getState().picked = on ? allPages().map((p) => p.id) : [];
  }

  // Other Mods that keep page coordinates of their own (patrol routes, homes,
  // areas) can follow a zoom: Resizer.onZoom((pageId, factor) => { … }).

  const listeners = [];

  /**
   * Adds a zoom listener.
   *
   * @param {(pageId: string, factor: number) => void} fn Listener.
   * @returns {() => void} Function that removes the listener.
   */
  function onZoom(fn) {
    if (typeof fn !== 'function') {
      return () => {};
    }
    listeners.push(fn);
    return () => {
      const i = listeners.indexOf(fn);
      if (i >= 0) {
        listeners.splice(i, 1);
      }
    };
  }

  /**
   * Tells the listeners a page was zoomed. A failing listener is logged and the
   * others still run.
   *
   * @param {string} pageId Page ID.
   * @param {number} factor Zoom factor (below 1 for zoom out and for undoing a zoom in).
   * @returns {void}
   */
  function notifyZoom(pageId, factor) {
    for (const fn of [...listeners]) {
      try {
        fn(pageId, factor);
      } catch (err) {
        log(`Resizer: a zoom listener failed: ${err?.message || err}`);
      }
    }
  }

  // Undo history. Each command records what it changed in one entry, across
  // every page it touched; the last UNDO_DEPTH entries are kept in state, so
  // they survive a sandbox restart.
  //
  // Entry: { id, label, vars, at, pages: [{id, before}], changed: [{type, id, before}],
  //          created: [{type, id}], removed: [{type, props}], zooms: [{pageId, factor}] }

  /**
   * Starts recording a change. Make every change through the recorder, then
   * call commit().
   *
   * @param {string} label Message key describing the change (history.*).
   * @param {object} [vars] Values for the label.
   * @returns {object} Recorder.
   */
  function startChange(label, vars = {}) {
    const entry = {
      id: `u${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`,
      label,
      vars,
      at: Date.now(),
      pages: [],
      changed: [],
      created: [],
      removed: [],
      zooms: [],
    };
    const seen = new Set();
    const seenPages = new Set();
    let count = 0;

    return {
      entry,
      /** Number of objects changed so far. */
      get count() {
        return count;
      },
      /**
       * Changes an object, remembering its old geometry the first time.
       *
       * @param {string} type Object type.
       * @param {object} obj Roll20 object.
       * @param {object} attrs New attributes.
       */
      set(type, obj, attrs) {
        if (!seen.has(obj.id)) {
          seen.add(obj.id);
          entry.changed.push({ type, id: obj.id, before: snapshot(type, obj) });
        }
        obj.set(attrs);
        count++;
      },
      /**
       * Changes a page, remembering its old size and grid the first time.
       *
       * @param {object} page Roll20 page.
       * @param {object} attrs New attributes.
       */
      setPage(page, attrs) {
        if (!seenPages.has(page.id)) {
          seenPages.add(page.id);
          entry.pages.push({ id: page.id, before: snapshot('page', page) });
        }
        page.set(attrs);
      },
      /**
       * Draws a Legacy path again with new properties and removes the old one.
       *
       * @param {object} obj Roll20 path.
       * @param {object} changes Properties that differ.
       * @returns {object|null} The new path.
       */
      redrawPath(obj, changes) {
        const props = legacyPathProps(obj);
        const made = createObj('path', { ...props, ...changes });
        if (!made) {
          return null;
        }
        entry.removed.push({ type: 'path', id: obj.id, props });
        entry.created.push({ type: 'path', id: made.id });
        obj.remove();
        count++;
        return made;
      },
      /**
       * Notes a page zoom so undo can tell other Mods.
       *
       * @param {string} pageId Page ID.
       * @param {number} factor Zoom factor.
       */
      zoomed(pageId, factor) {
        entry.zooms.push({ pageId, factor });
      },
      /**
       * Saves the entry to the history.
       *
       * @returns {{stored: boolean}} False when the change was too big to keep for undo.
       */
      commit() {
        if (count === 0 && entry.pages.length === 0) {
          return { stored: false, empty: true };
        }
        return pushEntry(entry);
      },
    };
  }

  /**
   * Adds an entry to the history, dropping the oldest when there are too many
   * or they take too much room.
   *
   * @param {object} entry Entry.
   * @returns {{stored: boolean}} False when the entry alone is too big.
   */
  function pushEntry(entry) {
    const s = getState();
    const size = JSON.stringify(entry).length;
    if (size > MAX_UNDO_CHARS) {
      return { stored: false };
    }
    s.undo.push(entry);
    while (s.undo.length > UNDO_DEPTH) {
      s.undo.shift();
    }
    while (s.undo.length > 1 && JSON.stringify(s.undo).length > MAX_UNDO_CHARS) {
      s.undo.shift();
    }
    return { stored: true };
  }

  /**
   * Returns the history, newest first.
   *
   * @returns {object[]} Entries.
   */
  function listHistory() {
    return [...getState().undo].reverse();
  }

  /**
   * Forgets the history.
   *
   * @returns {number} Entries forgotten.
   */
  function clearHistory() {
    const s = getState();
    const n = s.undo.length;
    s.undo = [];
    return n;
  }

  /**
   * Undoes the newest change.
   *
   * @returns {{ok: boolean, entry?: object, restored?: number, missing?: number}} Result.
   */
  function undoLast() {
    const s = getState();
    const entry = s.undo.pop();
    if (!entry) {
      return { ok: false };
    }
    let restored = 0;
    let missing = 0;
    for (const { type, id } of entry.created || []) {
      getObj(type, id)?.remove();
    }
    for (const { type, id, props } of entry.removed || []) {
      const made = createObj(type, props);
      if (made) {
        restored++;
        // Older entries know the drawing by its old ID.
        if (id) {
          relink(s.undo, id, made.id);
        }
      } else {
        missing++;
      }
    }
    for (const { type, id, before } of entry.changed || []) {
      const obj = getObj(type, id);
      if (obj) {
        obj.set(before);
        restored++;
      } else {
        missing++;
      }
    }
    for (const { id, before } of entry.pages || []) {
      const page = getObj('page', id);
      if (page) {
        page.set(pickKeys(before, GEOMETRY_KEYS.page));
      } else {
        missing++;
      }
    }
    for (const { pageId, factor } of [...(entry.zooms || [])].reverse()) {
      if (factor) {
        notifyZoom(pageId, 1 / factor);
      }
    }
    return { ok: true, entry, restored, missing };
  }

  /**
   * Points older entries at a drawing's new ID after undo drew it again.
   *
   * @param {object[]} entries Entries still in the history.
   * @param {string} oldId ID the drawing had.
   * @param {string} newId ID it has now.
   * @returns {void}
   */
  function relink(entries, oldId, newId) {
    for (const e of entries) {
      for (const list of [e.created || [], e.changed || [], e.removed || []]) {
        for (const item of list) {
          if (item.id === oldId) {
            item.id = newId;
          }
        }
      }
    }
  }

  /**
   * Copies the listed keys that are present.
   *
   * @param {object} obj Source.
   * @param {string[]} keys Keys.
   * @returns {object} Copy.
   */
  function pickKeys(obj, keys) {
    const out = {};
    for (const key of keys) {
      if (obj && key in obj) {
        out[key] = obj[key];
      }
    }
    return out;
  }

  // Chat cards: the main menu, the page picker, the history and the settings.
  // Buttons run the same commands the GM can type; Roll20 queries (?{…}) ask
  // for the numbers.

  /**
   * Makes text safe inside a Roll20 query, where | , { and } have meaning.
   *
   * @param {string} text Label.
   * @returns {string} Safe label.
   */
  function queryText(text) {
    return String(text)
      .replaceAll(/[|,{}]/g, ' ')
      .replaceAll(/\s+/g, ' ')
      .trim();
  }

  /**
   * Builds a Roll20 drop-down query.
   *
   * @param {string} prompt Question.
   * @param {Array<[string, string]>} options Label and value pairs.
   * @returns {string} Query text.
   */
  function choiceQuery(prompt, options) {
    const opts = options.map(([label, value]) => `${queryText(label)},${value}`).join('|');
    return `?{${queryText(prompt)}|${opts}}`;
  }

  /**
   * Builds a Roll20 text query with a default answer.
   *
   * @param {string} prompt Question.
   * @param {string|number} [answer] Default answer.
   * @returns {string} Query text.
   */
  function textQuery(prompt, answer) {
    return answer === undefined ? `?{${queryText(prompt)}}` : `?{${queryText(prompt)}|${answer}}`;
  }

  /**
   * Describes a page's size for menus.
   *
   * @param {object} page Roll20 page.
   * @param {string} lang Locale.
   * @param {boolean} [short=false] Only the number of cells.
   * @returns {string} Text such as "30 × 20 cells, 70 px a cell, 5 ft a cell".
   */
  function describePage(page, lang, short = false) {
    const a = attrsOf(page);
    const cell = cellPixels(a);
    const units = toNumber(a.width) ?? 0;
    const unitsDown = toNumber(a.height) ?? 0;
    return t(short ? 'menu.pageCells' : 'menu.pageSize', lang, {
      across: formatNumber((units * PIXELS_PER_UNIT) / cell),
      down: formatNumber((unitsDown * PIXELS_PER_UNIT) / cell),
      cell: formatNumber(cell),
      scale: formatNumber(toNumber(a.scale_number) ?? 5),
      units: a.scale_units || 'ft',
    });
  }

  /**
   * Lists the selected objects with their sizes.
   *
   * @param {Array<{type: string, obj: object}>} items Selected objects.
   * @param {string} lang Locale.
   * @returns {string} HTML.
   */
  function describeSelection(items, lang) {
    const rows = items.slice(0, MAX_LISTED).map(({ type, obj }) => {
      const name = objectName(type, obj) || t(`kinds.${type}`, lang);
      if (type !== 'graphic') {
        return `<div>${escapeHtml(name)}</div>`;
      }
      const page = getObj('page', obj.get('_pageid'));
      const cell = page ? cellPixels(attrsOf(page)) : PIXELS_PER_UNIT;
      const w = toNumber(obj.get('width')) ?? 0;
      const h = toNumber(obj.get('height')) ?? 0;
      return `<div>${escapeHtml(
        t('menu.graphicSize', lang, {
          name,
          width: formatNumber(w),
          height: formatNumber(h),
          across: formatNumber(w / cell),
          down: formatNumber(h / cell),
        })
      )}</div>`;
    });
    if (items.length > MAX_LISTED) {
      rows.push(
        `<div>${escapeHtml(t('menu.andMore', lang, { count: items.length - MAX_LISTED }))}</div>`
      );
    }
    return rows.join('');
  }

  /**
   * Shows the main menu.
   *
   * @param {string|null} playerId Who to show it to.
   * @param {Array<{type: string, obj: object}>} [selected] Selected objects.
   * @returns {void}
   */
  function showMainMenu(playerId, selected = []) {
    const lang = getLang();
    const cmd = getCommand();
    const tr = (key, vars) => t(key, lang, vars);
    const q = (key) => tr(`queries.${key}`);
    const page = currentPage(playerId);
    const parts = [];

    parts.push(buildSectionLabel(tr('menu.selected')));
    if (selected.length > 0) {
      parts.push(`<div style="font-size:0.9em">${describeSelection(selected, lang)}</div>`);
    } else {
      parts.push(`<div style="font-size:0.9em">${escapeHtml(tr('menu.nothingSelected'))}</div>`);
    }
    const units = choiceQuery(q('unit'), [
      [q('unitPx'), 'px'],
      [q('unitCells'), 'cells'],
      [q('unitUnits'), 'units'],
    ]);
    const sizes = choiceQuery(
      q('creatureSize'),
      Object.keys(CREATURE_SIZES).map((s) => [tr(`sizes.${s}`), s])
    );
    parts.push(
      `<div>${[
        buildButton(
          tr('buttons.resize'),
          `${cmd} size ${textQuery(q('width'), 70)} ${textQuery(q('height'), 70)} ${units} --menu`
        ),
        buildButton(tr('buttons.creatureSize'), `${cmd} size ${sizes} --menu`),
        buildSecondaryButton(
          tr('buttons.fit'),
          `${cmd} fit ${choiceQuery(q('keepShape'), [
            [q('yes'), '--keep-ratio'],
            [q('no'), '--stretch'],
          ])} --menu`
        ),
        buildSecondaryButton(
          tr('buttons.centre'),
          `${cmd} center ${choiceQuery(q('centre'), [
            [q('both'), 'both'],
            [q('across'), 'h'],
            [q('down'), 'v'],
          ])} --menu`
        ),
        buildSecondaryButton(tr('buttons.sizes'), `${cmd} --menu`),
      ].join('')}</div>`
    );

    parts.push(buildSectionLabel(tr('menu.map')));
    parts.push(`<div style="font-size:0.85em">${escapeHtml(tr('menu.mapHint'))}</div>`);
    parts.push(
      `<div>${[
        buildButton(
          tr('buttons.calibrate'),
          `${cmd} calibrate ${textQuery(q('across'), 1)} ${textQuery(q('downCount'), 1)}`
        ),
        buildSecondaryButton(
          tr('buttons.calibrateFit'),
          `${cmd} calibrate ${textQuery(q('across'), 1)} ${textQuery(q('downCount'), 1)} --fit-page`
        ),
        buildSecondaryButton(
          tr('buttons.calibratePx'),
          `${cmd} calibrate --cell ${textQuery(q('squarePx'), 100)}`
        ),
      ].join('')}</div>`
    );

    parts.push(buildSectionLabel(tr('menu.page')));
    if (page) {
      parts.push(
        `<div style="font-size:0.9em"><strong>${escapeHtml(page.get('name') || '')}</strong>: ${escapeHtml(describePage(page, lang))}</div>`
      );
    }
    const pageUnits = choiceQuery(q('unit'), [
      [q('unitCells'), 'cells'],
      [q('unitUnits'), 'units'],
      [q('unitPx'), 'px'],
    ]);
    parts.push(
      `<div>${[
        buildButton(
          tr('buttons.zoom'),
          `${cmd} zoom ${textQuery(q('factor'), 2)} ${choiceQuery(q('tokens'), [
            [q('tokensScale'), '--scale-tokens'],
            [q('tokensKeep'), '--keep-tokens'],
          ])} --menu`
        ),
        buildSecondaryButton(
          tr('buttons.resizePage'),
          `${cmd} page ${textQuery(q('width'), 30)} ${textQuery(q('height'), 20)} ${pageUnits} --menu`
        ),
        buildSecondaryButton(tr('buttons.pages'), `${cmd} pages`),
      ].join('')}</div>`
    );

    parts.push(buildDivider());
    const last = listHistory()[0];
    parts.push(
      `<div>${[
        last
          ? buildButton(
              tr('buttons.undoWhat', { what: describeEntry(last, lang) }),
              `${cmd} undo --menu`
            )
          : '',
        buildSecondaryButton(tr('buttons.history'), `${cmd} history`),
        buildSecondaryButton(tr('buttons.settings'), `${cmd} settings`),
        buildSecondaryButton(tr('buttons.help'), `${cmd} help`),
      ].join('')}</div>`
    );
    whisper(playerId, `${SCRIPT_NAME} v${SCRIPT_VERSION}`, parts);
  }

  /**
   * Describes a history entry.
   *
   * @param {object} entry Undo entry.
   * @param {string} lang Locale.
   * @returns {string} Text.
   */
  function describeEntry(entry, lang) {
    const vars = { ...(entry.vars || {}) };
    if (typeof vars.factor === 'number') {
      vars.factor = formatNumber(vars.factor);
    }
    return t(entry.label || 'history.change', lang, vars);
  }

  /**
   * Shows the undo history.
   *
   * @param {string|null} playerId Who to show it to.
   * @returns {void}
   */
  function showHistory(playerId) {
    const lang = getLang();
    const cmd = getCommand();
    const entries = listHistory();
    const parts = [];
    if (entries.length === 0) {
      parts.push(`<div>${escapeHtml(t('menu.historyEmpty', lang))}</div>`);
    } else {
      entries.forEach((entry, i) => {
        const mins = Math.max(0, Math.round((Date.now() - (entry.at || 0)) / 60000));
        parts.push(
          `<div>${i + 1}. ${escapeHtml(describeEntry(entry, lang))} <span style="font-size:0.8em;opacity:0.8">(${escapeHtml(t('menu.minutesAgo', lang, { minutes: mins }))})</span></div>`
        );
      });
      parts.push(
        `<div style="font-size:0.85em;margin-top:3px">${escapeHtml(t('menu.historyHint', lang))}</div>`
      );
    }
    parts.push(buildDivider());
    parts.push(
      `<div>${[
        entries.length > 0 ? buildButton(t('buttons.undo', lang), `${cmd} undo --history`) : '',
        entries.length > 0
          ? buildSecondaryButton(t('buttons.clearHistory', lang), `${cmd} history clear`)
          : '',
        buildSecondaryButton(t('buttons.menu', lang), `${cmd}`),
      ].join('')}</div>`
    );
    whisper(playerId, t('titles.history', lang), parts);
  }

  /**
   * Shows the page picker.
   *
   * @param {string|null} playerId Who to show it to.
   * @returns {void}
   */
  function showPagePicker(playerId) {
    const lang = getLang();
    const cmd = getCommand();
    const picked = new Set(getState().picked);
    const pages = allPages();
    const parts = [`<div style="font-size:0.85em">${escapeHtml(t('menu.pickerHint', lang))}</div>`];
    for (const page of pages.slice(0, MAX_PICKER_PAGES)) {
      const on = picked.has(page.id);
      const label = `${on ? '☑' : '☐'} ${page.get('name') || page.id}`;
      parts.push(
        buildRow(
          describePage(page, lang, true),
          (on ? buildButton : buildSecondaryButton)(label, `${cmd} pick ${page.id} --picker`)
        )
      );
    }
    if (pages.length > MAX_PICKER_PAGES) {
      parts.push(
        `<div>${escapeHtml(t('menu.andMore', lang, { count: pages.length - MAX_PICKER_PAGES }))}</div>`
      );
    }
    parts.push(buildDivider());
    parts.push(
      `<div>${[
        buildButton(
          t('buttons.zoomPicked', lang, { count: picked.size }),
          `${cmd} zoom ${textQuery(t('queries.factor', lang), 2)} --pages picked --picker`
        ),
        buildSecondaryButton(t('buttons.pickAll', lang), `${cmd} pick all --picker`),
        buildSecondaryButton(t('buttons.pickNone', lang), `${cmd} pick none --picker`),
        buildSecondaryButton(t('buttons.menu', lang), `${cmd}`),
      ].join('')}</div>`
    );
    whisper(playerId, t('titles.pages', lang), parts);
  }

  /**
   * Shows the settings.
   *
   * @param {string|null} playerId Who to show it to.
   * @returns {void}
   */
  function showSettings(playerId) {
    const lang = getLang();
    const cmd = getCommand();
    const s = getSettings();
    const tr = (key, vars) => t(key, lang, vars);
    const onOff = (v) => tr(v ? 'menu.on' : 'menu.off');
    const toggle = (key) =>
      buildSecondaryButton(onOff(s[key]), `${cmd} set ${key} ${s[key] ? 'off' : 'on'} --settings`);
    const locale = LOCALE_DEFINITIONS.find((d) => d.code === lang);
    const langQuery = choiceQuery(
      tr('queries.language'),
      LOCALE_DEFINITIONS.map((d) => [d.nativeName || d.name, d.code])
    );
    const parts = [
      buildRow(
        tr('settings.language'),
        buildSecondaryButton(
          locale?.nativeName || locale?.name || lang,
          `${cmd} set language ${langQuery} --settings`,
          buildLocaleFlag(locale)
        )
      ),
      buildRow(
        tr('settings.command'),
        buildSecondaryButton(
          `!${s.command}`,
          `${cmd} set command ${textQuery(tr('queries.command'), s.command)} --settings`
        )
      ),
      buildRow(tr('settings.keepTokenSize'), toggle('keepTokenSize')),
      buildRow(tr('settings.scaleStrokes'), toggle('scaleStrokes')),
      buildRow(tr('settings.deleteCalibrationBox'), toggle('deleteCalibrationBox')),
      buildDivider(),
      `<div>${[
        buildSecondaryButton(tr('buttons.resetSettings'), `${cmd} reset --settings`),
        buildSecondaryButton(tr('buttons.rebuild'), `${cmd} journal rebuild`),
        buildSecondaryButton(tr('buttons.menu'), `${cmd}`),
      ].join('')}</div>`,
    ];
    whisper(playerId, tr('titles.settings', lang), parts);
  }

  /**
   * Shows a short help card with links to the handouts.
   *
   * @param {string|null} playerId Who to show it to.
   * @param {Array<[string, string]>} commands Command and description-key pairs.
   * @returns {void}
   */
  function showHelp(playerId, commands) {
    const lang = getLang();
    const cmd = getCommand();
    const link = (name) => {
      const handout = findObjs({ _type: 'handout', name })[0];
      return handout
        ? `<a href="http://journal.roll20.net/handout/${handout.id}" style="color:inherit">${escapeHtml(name)}</a>`
        : escapeHtml(name);
    };
    const rows = commands
      .map(
        ([c, key]) =>
          `<div><code>${escapeHtml(`${cmd} ${c}`.trim())}</code> – ${escapeHtml(t(`help.${key}`, lang))}</div>`
      )
      .join('');
    whisper(playerId, t('titles.help', lang), [
      `<div style="font-size:0.9em">${rows}</div>`,
      buildDivider(),
      `<div style="font-size:0.85em">${escapeHtml(t('menu.handouts', lang))} ${link(HANDOUT_HELP_NAME)} • ${link(HANDOUT_DECK_NAME)}</div>`,
    ]);
  }

  // The changes Resizer makes. Each records itself for undo and returns a
  // result the commands turn into a reply. Nothing here talks to chat.

  /**
   * Returns a page's attributes as plain values.
   *
   * @param {object} page Roll20 page.
   * @returns {object} Attributes.
   */
  function pageAttrs(page) {
    return attrsOf(page);
  }

  /**
   * Checks a zoom before anything changes, so a batch is all or nothing.
   *
   * @param {object[]} pages Roll20 pages.
   * @param {number} f Zoom factor.
   * @returns {{ok: boolean, error?: string, vars?: object}} Result.
   */
  function checkZoom(pages, f) {
    if (!Number.isFinite(f) || f < MIN_ZOOM || f > MAX_ZOOM) {
      return { ok: false, error: 'errors.badFactor', vars: { min: MIN_ZOOM, max: MAX_ZOOM } };
    }
    if (f === 1) {
      return { ok: false, error: 'errors.factorOne' };
    }
    for (const page of pages) {
      const next = zoomPage(pageAttrs(page), f);
      if (
        Math.max(next.width, next.height) > MAX_PAGE_UNITS ||
        Math.min(next.width, next.height) < 1
      ) {
        return {
          ok: false,
          error: 'errors.pageTooBig',
          vars: { page: page.get('name'), max: MAX_PAGE_UNITS },
        };
      }
    }
    return { ok: true };
  }

  /**
   * Zooms pages with everything on them. The distance per cell is kept, so a
   * 5 ft cell is still 5 ft, only bigger or smaller on screen.
   *
   * @param {object[]} pages Roll20 pages.
   * @param {number} f Zoom factor.
   * @param {object} [options] Options.
   * @param {boolean} [options.keepTokens] Move tokens without changing their size.
   * @returns {{ok: boolean, error?: string, vars?: object, counts?: object, stored?: boolean}} Result.
   */
  function zoomPages(pages, f, options = {}) {
    const check = checkZoom(pages, f);
    if (!check.ok) {
      return check;
    }
    const settings = getSettings();
    const keepTokens = options.keepTokens ?? settings.keepTokenSize;
    const strokes = settings.scaleStrokes;
    const rec = startChange(pages.length === 1 ? 'history.zoom' : 'history.zoomPages', {
      factor: roundCoord(f),
      page: pages[0]?.get('name') || '',
      count: pages.length,
    });
    const counts = { objects: 0, skipped: 0, pages: pages.length };
    for (const page of pages) {
      rec.setPage(page, zoomPage(pageAttrs(page), f));
      for (const { type, obj } of pageObjects(page.id)) {
        const changed = zoomObject(rec, type, obj, f, { keepTokens, strokes });
        if (changed) {
          counts.objects++;
        } else {
          counts.skipped++;
        }
      }
      rec.zoomed(page.id, f);
    }
    const { stored } = rec.commit();
    for (const page of pages) {
      notifyZoom(page.id, f);
    }
    return { ok: true, counts, stored };
  }

  /**
   * Zooms one object.
   *
   * @param {object} rec Undo recorder.
   * @param {string} type Object type.
   * @param {object} obj Roll20 object.
   * @param {number} f Zoom factor.
   * @param {object} options Options (keepTokens, strokes).
   * @returns {boolean} True when the object was changed.
   */
  function zoomObject(rec, type, obj, f, { keepTokens, strokes }) {
    const a = attrsOf(obj);
    // Walls are lines for lighting, so their width stays readable at any zoom.
    const stroke = strokes && a.layer !== 'walls';
    switch (type) {
      case 'graphic':
        rec.set(type, obj, zoomGraphic(a, f, keepTokens && isToken(obj)));
        return true;
      case 'text':
        rec.set(type, obj, zoomText(a, f));
        return true;
      case 'pathv2': {
        const next = zoomPathV2(a, f, stroke);
        if (!next) {
          return false;
        }
        rec.set(type, obj, next);
        return true;
      }
      case 'path': {
        const next = zoomLegacyPath(a, f, stroke);
        return Boolean(next && rec.redrawPath(obj, next));
      }
      case 'door':
      case 'window':
        rec.set(type, obj, zoomPortal(a, f));
        return true;
      default:
        return false;
    }
  }

  /**
   * Converts a typed size to pixels.
   *
   * @param {number} value Size.
   * @param {string} unit px, cells or units.
   * @param {object} page Page attributes.
   * @returns {number} Pixels.
   */
  function toPixels(value, unit, page) {
    if (unit === 'cells') {
      return value * cellPixels(page);
    }
    if (unit === 'units') {
      return value * PIXELS_PER_UNIT;
    }
    return value;
  }

  /**
   * Resizes graphics, keeping their centres.
   *
   * @param {Array<{type: string, obj: object}>} items Selected objects.
   * @param {number} width New width.
   * @param {number} height New height.
   * @param {string} unit px, cells or units.
   * @returns {{ok: boolean, error?: string, count?: number, skipped?: number, stored?: boolean}} Result.
   */
  function resizeGraphics(items, width, height, unit) {
    if (!(width > 0) || !(height > 0)) {
      return { ok: false, error: 'errors.badSize' };
    }
    const graphics = items.filter((i) => i.type === 'graphic');
    if (graphics.length === 0) {
      return { ok: false, error: 'errors.noGraphics' };
    }
    const rec = startChange('history.size', { count: graphics.length });
    for (const { obj } of graphics) {
      const page = getObj('page', obj.get('_pageid'));
      const pa = page ? pageAttrs(page) : {};
      rec.set('graphic', obj, {
        width: roundCoord(toPixels(width, unit, pa)),
        height: roundCoord(toPixels(height, unit, pa)),
      });
    }
    const { stored } = rec.commit();
    return { ok: true, count: graphics.length, skipped: items.length - graphics.length, stored };
  }

  /**
   * Resizes graphics to a creature size, in grid cells of their page.
   *
   * @param {Array<{type: string, obj: object}>} items Selected objects.
   * @param {string} size tiny … gargantuan.
   * @returns {object} As resizeGraphics.
   */
  function sizeToCreature(items, size) {
    const cells = CREATURE_SIZES[size];
    if (!cells) {
      return { ok: false, error: 'errors.badCreatureSize' };
    }
    const result = resizeGraphics(items, cells, cells, 'cells');
    return result;
  }

  /**
   * Resizes a page (not what is on it).
   *
   * @param {object} page Roll20 page.
   * @param {number} width New width.
   * @param {number} height New height.
   * @param {string} unit units (0.0.9's default), cells or px.
   * @returns {{ok: boolean, error?: string, width?: number, height?: number, stored?: boolean}} Result.
   */
  function resizePage(page, width, height, unit) {
    const pa = pageAttrs(page);
    const toUnits = (v) => toPixels(v, unit, pa) / PIXELS_PER_UNIT;
    const w = roundCoord(toUnits(width));
    const h = roundCoord(toUnits(height));
    if (!(w >= 1) || !(h >= 1) || w > MAX_PAGE_UNITS || h > MAX_PAGE_UNITS) {
      return { ok: false, error: 'errors.badPageSize', vars: { max: MAX_PAGE_UNITS } };
    }
    const rec = startChange('history.page', { page: page.get('name'), width: w, height: h });
    rec.setPage(page, { width: w, height: h });
    const { stored } = rec.commit();
    return { ok: true, width: w, height: h, stored };
  }

  /**
   * Fits graphics to their page.
   *
   * @param {Array<{type: string, obj: object}>} items Selected objects.
   * @param {boolean} keepRatio Keep each graphic's shape.
   * @returns {{ok: boolean, error?: string, count?: number, stored?: boolean}} Result.
   */
  function fitGraphics(items, keepRatio) {
    const graphics = items.filter((i) => i.type === 'graphic');
    if (graphics.length === 0) {
      return { ok: false, error: 'errors.noGraphics' };
    }
    const rec = startChange('history.fit', { count: graphics.length });
    for (const { obj } of graphics) {
      const page = getObj('page', obj.get('_pageid'));
      if (page) {
        rec.set('graphic', obj, fitToPage(attrsOf(obj), pageAttrs(page), keepRatio));
      }
    }
    const { stored } = rec.commit();
    return { ok: true, count: graphics.length, stored };
  }

  /**
   * Centres graphics and text on their page.
   *
   * @param {Array<{type: string, obj: object}>} items Selected objects.
   * @param {boolean} horizontal Centre across.
   * @param {boolean} vertical Centre down.
   * @returns {{ok: boolean, error?: string, count?: number, stored?: boolean}} Result.
   */
  function centreItems(items, horizontal, vertical) {
    const movable = items.filter((i) => i.type === 'graphic' || i.type === 'text');
    if (movable.length === 0) {
      return { ok: false, error: 'errors.noGraphics' };
    }
    const rec = startChange('history.centre', { count: movable.length });
    for (const { type, obj } of movable) {
      const page = getObj('page', obj.get('_pageid'));
      if (page) {
        rec.set(type, obj, centreOnPage(pageAttrs(page), horizontal, vertical));
      }
    }
    const { stored } = rec.commit();
    return { ok: true, count: movable.length, stored };
  }

  /**
   * Picks the map and the calibration box out of a selection: the box is a
   * drawing, the map the biggest graphic (preferring the Map layer).
   *
   * @param {Array<{type: string, obj: object}>} items Selected objects.
   * @returns {{map: object|null, box: {type: string, obj: object}|null}} Map and box.
   */
  function pickMapAndBox(items) {
    const graphics = items.filter((i) => i.type === 'graphic').map((i) => i.obj);
    const area = (o) => (toNumber(o.get('width')) || 0) * (toNumber(o.get('height')) || 0);
    graphics.sort(
      (a, b) =>
        Number(b.get('layer') === 'map') - Number(a.get('layer') === 'map') || area(b) - area(a)
    );
    const box = items.find((i) => i.type === 'pathv2' || i.type === 'path') || null;
    return { map: graphics[0] || null, box };
  }

  /**
   * Scales and moves a map so the squares drawn on it match the page grid.
   *
   * @param {Array<{type: string, obj: object}>} items Selected objects (a map, and a box
   *   unless squarePx is given).
   * @param {object} options Options.
   * @param {number} [options.across] Squares across the box.
   * @param {number} [options.down] Squares down the box.
   * @param {number} [options.squarePx] Pixels per square on the map now (no box needed).
   * @param {boolean} [options.fitPage] Size the page to the map.
   * @param {boolean} [options.keepBox] Keep the box afterwards.
   * @returns {object} Result with the map's old square size and the scale.
   */
  function calibrateMap(items, options) {
    const { map, box } = pickMapAndBox(items);
    if (!map) {
      return { ok: false, error: 'errors.noMap' };
    }
    const rotation = (((toNumber(map.get('rotation')) || 0) % 360) + 360) % 360;
    if (rotation % 180 !== 0) {
      return { ok: false, error: 'errors.mapRotated' };
    }
    const page = getObj('page', map.get('_pageid'));
    if (!page) {
      return { ok: false, error: 'errors.noPage' };
    }
    const pa = pageAttrs(page);
    const ma = attrsOf(map);
    let plan;
    if (options.squarePx) {
      plan = calibrateFromSquare(ma, options.squarePx, pa, { fitPage: options.fitPage });
    } else {
      if (!box) {
        return { ok: false, error: 'errors.noBox' };
      }
      const b = drawingBox(box.type, attrsOf(box.obj));
      if (!b) {
        return { ok: false, error: 'errors.boxUnreadable' };
      }
      const across = options.across ?? 1;
      const down = options.down ?? across;
      plan = calibrateFromBox(ma, b, across, down, pa, { fitPage: options.fitPage });
    }
    if (!plan.ok) {
      return plan;
    }
    if (plan.page && (plan.page.width > MAX_PAGE_UNITS || plan.page.height > MAX_PAGE_UNITS)) {
      return {
        ok: false,
        error: 'errors.pageTooBig',
        vars: { page: page.get('name'), max: MAX_PAGE_UNITS },
      };
    }
    const name = map.get('name') || '';
    const rec = startChange(name ? 'history.calibrate' : 'history.calibrateUnnamed', { name });
    rec.set('graphic', map, plan.map);
    if (plan.page) {
      rec.setPage(page, plan.page);
    }
    let boxRemoved = false;
    if (box && !options.squarePx && !options.keepBox && getSettings().deleteCalibrationBox) {
      // Recorded as removed, so undo draws it again.
      rec.entry.removed.push({ type: box.type, id: box.obj.id, props: boxProps(box.obj) });
      box.obj.remove();
      boxRemoved = true;
    }
    const { stored } = rec.commit();
    return {
      ok: true,
      stored,
      boxRemoved,
      squarePx: plan.squarePx,
      scale: plan.scale,
      page: plan.page || null,
      cell: cellPixels(pa),
    };
  }

  /**
   * Properties to draw a removed calibration box again on undo.
   *
   * @param {object} obj Roll20 drawing.
   * @returns {object} Properties for createObj.
   */
  function boxProps(obj) {
    const all = attrsOf(obj);
    const out = {};
    for (const [key, value] of Object.entries(all)) {
      if (!['_id', '_type', '_fbpath', '_zorder'].includes(key)) {
        out[key] = value;
      }
    }
    return out;
  }

  // Chat commands: !resizer <subcommand> (also !rsz, and a name the GM chose).
  // 0.0.9's commands still work: see translateLegacy.
  //
  // Commands act on the selected objects, or the objects given with --ids, and
  // on the GM's current page unless --pages says otherwise. Menu buttons add
  // --menu, --settings, --history or --picker to show their card again.

  // Flags that name the card to show after a change.
  const BACK_FLAGS = ['menu', 'settings', 'history', 'picker'];
  // Flags that take no value.
  const SWITCHES = ['keep-tokens', 'scale-tokens', 'keep-ratio', 'stretch', 'fit-page', 'keep-box'];

  /**
   * Splits command words into plain arguments and flags.
   *
   * @param {string[]} words Words after the subcommand.
   * @returns {{args: string[], ids: string[]|null, pages: string|null, cell: number|null,
   *   flags: Set<string>, back: string|null}} Parsed words.
   */
  function parseArgs(words) {
    const args = [];
    let ids = null;
    let pages = null;
    let cell = null;
    let back = null;
    const flags = new Set();
    for (let i = 0; i < words.length; i++) {
      const word = words[i].toLowerCase();
      const takeRest = () => {
        const rest = [];
        while (i + 1 < words.length && !words[i + 1].startsWith('--')) {
          rest.push(words[++i]);
        }
        return rest;
      };
      if (word === '--ids') {
        ids = takeRest()
          .flatMap((w) => w.split(','))
          .filter(Boolean);
      } else if (word === '--pages') {
        pages = takeRest().join(' ');
      } else if (word === '--cell') {
        cell = toNumber(takeRest()[0]);
      } else if (word.startsWith('--') && BACK_FLAGS.includes(word.slice(2))) {
        back = word.slice(2);
      } else if (word.startsWith('--') && SWITCHES.includes(word.slice(2))) {
        flags.add(word.slice(2));
      } else {
        args.push(words[i]);
      }
    }
    return { args, ids, pages, cell, flags, back };
  }

  /**
   * Rewrites a 0.0.9 command as a 1.0 one.
   *
   * - `<w> <h>` → `size <w> <h> px`
   * - `scale <n> up|down` → `zoom n` or `zoom 1/n`
   * - `fit keep_ratio` → `fit --keep-ratio`
   * - `page <w> <h> pixels|units` → `page <w> <h> px|units`
   * - `config command|<name>` → `set command <name>`; `config` → `settings`
   *
   * @param {string} sub Subcommand (lower case).
   * @param {string[]} words Words after it.
   * @returns {{sub: string, words: string[]}} 1.0 command.
   */
  function translateLegacy(sub, words) {
    if (toNumber(sub) !== null && toNumber(words[0]) !== null) {
      const unit = words[1] && SIZE_UNITS.includes(words[1].toLowerCase()) ? [] : ['px'];
      return { sub: 'size', words: [sub, ...words, ...unit] };
    }
    if (sub === 'scale') {
      const n = toNumber(words[0]) ?? 2;
      const down = toText(words[1]).toLowerCase() === 'down';
      return { sub: 'zoom', words: [down ? `1/${n}` : String(n), ...words.slice(2)] };
    }
    if (sub === 'fit') {
      return {
        sub,
        words: words.map((w) => (w.toLowerCase() === 'keep_ratio' ? '--keep-ratio' : w)),
      };
    }
    if (sub === 'page' && words[2]?.toLowerCase() === 'pixels') {
      return { sub, words: [words[0], words[1], 'px', ...words.slice(3)] };
    }
    if (sub === 'config') {
      const [setting] = words;
      if (setting && setting.includes('|')) {
        const [key, ...value] = setting.split('|');
        return { sub: 'set', words: [key, value.join('|'), ...words.slice(1)] };
      }
      return { sub: 'settings', words };
    }
    if (sub === 'centre') {
      return { sub: 'center', words };
    }
    return { sub, words };
  }

  /**
   * Sends a short confirmation.
   *
   * @param {object} ctx Command context.
   * @param {string} text Message.
   * @returns {void}
   */
  function notify(ctx, text) {
    whisper(ctx.playerId, SCRIPT_NAME, `<div>${escapeHtml(text)}</div>`);
  }

  /**
   * Answers a change: shows the card the button came from again, or a short
   * confirmation, plus a warning when the change was too big to keep for undo.
   *
   * @param {object} ctx Command context.
   * @param {string} text Confirmation.
   * @param {object} [result] Operation result (stored).
   * @returns {void}
   */
  function reply(ctx, text, result = {}) {
    if (result.stored === false && !result.empty) {
      whisperWarning(ctx.playerId, t('messages.notStored', ctx.lang));
    }
    notify(ctx, text);
    showBack(ctx);
  }

  /**
   * Shows the card named by a back flag.
   *
   * @param {object} ctx Command context.
   * @returns {void}
   */
  function showBack(ctx) {
    switch (ctx.back) {
      case 'menu':
        showMainMenu(ctx.playerId, selection(ctx).found);
        break;
      case 'settings':
        showSettings(ctx.playerId);
        break;
      case 'history':
        showHistory(ctx.playerId);
        break;
      case 'picker':
        showPagePicker(ctx.playerId);
        break;
    }
  }

  /**
   * Sends an error from an operation result.
   *
   * @param {object} ctx Command context.
   * @param {{error: string, vars?: object}} result Result.
   * @returns {void}
   */
  function fail(ctx, result) {
    whisperError(ctx.playerId, t(result.error, ctx.lang, result.vars || {}));
  }

  /**
   * Returns the selected (or --ids) objects.
   *
   * @param {object} ctx Command context.
   * @returns {{found: Array<{type: string, obj: object}>, unknown: string[]}} Objects.
   */
  function selection(ctx) {
    return targetObjects(ctx.msg, ctx.ids);
  }

  /**
   * Returns the selected objects, telling the GM when there are none.
   *
   * @param {object} ctx Command context.
   * @returns {Array<{type: string, obj: object}>} Objects (empty after an error was sent).
   */
  function requireSelection(ctx) {
    const { found, unknown } = selection(ctx);
    if (unknown.length > 0 && ctx.ids) {
      whisperError(ctx.playerId, t('errors.unknownIds', ctx.lang, { ids: unknown.join(', ') }));
      return [];
    }
    if (found.length === 0) {
      whisperError(ctx.playerId, t('errors.noSelection', ctx.lang));
    }
    return found;
  }

  /**
   * Returns the pages a command is for, telling the GM about unknown names.
   *
   * @param {object} ctx Command context.
   * @returns {object[]} Roll20 pages (empty after an error was sent).
   */
  function targetPages(ctx) {
    if (ctx.pages === null) {
      const page = currentPage(ctx.msg.playerid);
      if (!page) {
        whisperError(ctx.playerId, t('errors.noPage', ctx.lang));
        return [];
      }
      return [page];
    }
    const { pages, unknown } = resolvePages(ctx.pages, ctx.msg.playerid);
    if (unknown.length > 0) {
      whisperError(ctx.playerId, t('errors.unknownPages', ctx.lang, { pages: unknown.join(', ') }));
      return [];
    }
    if (pages.length === 0) {
      whisperError(ctx.playerId, t('errors.noPages', ctx.lang));
    }
    return pages;
  }

  /**
   * Reads a unit word.
   *
   * @param {string|undefined} word Word.
   * @param {string} fallback Unit when none is given.
   * @returns {string|null} Unit, or null when the word is not a unit.
   */
  function readUnit(word, fallback) {
    if (word === undefined || word === '') {
      return fallback;
    }
    const w = word.toLowerCase();
    if (['px', 'pixel', 'pixels'].includes(w)) {
      return 'px';
    }
    if (['cell', 'cells', 'squares', 'square'].includes(w)) {
      return 'cells';
    }
    if (['unit', 'units', 'un'].includes(w)) {
      return 'units';
    }
    return null;
  }

  const HANDLERS = {
    menu(ctx) {
      showMainMenu(ctx.playerId, selection(ctx).found);
    },
    help(ctx) {
      showHelp(ctx.playerId, COMMAND_LIST);
    },
    size(ctx) {
      const [first, second, third] = ctx.args;
      const word = toText(first).toLowerCase();
      const items = requireSelection(ctx);
      if (items.length === 0) {
        return;
      }
      if (word in CREATURE_SIZES) {
        const result = sizeToCreature(items, word);
        if (!result.ok) {
          fail(ctx, result);
          return;
        }
        reply(
          ctx,
          t('messages.sized', ctx.lang, {
            count: result.count,
            size: t(`sizes.${word}`, ctx.lang),
          }),
          result
        );
        return;
      }
      const width = toNumber(first);
      const height = toNumber(second ?? first);
      const unit = readUnit(third, 'px');
      if (width === null || height === null || unit === null) {
        fail(ctx, { error: 'errors.badSize' });
        return;
      }
      const result = resizeGraphics(items, width, height, unit);
      if (!result.ok) {
        fail(ctx, result);
        return;
      }
      reply(
        ctx,
        t('messages.resized', ctx.lang, {
          count: result.count,
          width: formatNumber(width),
          height: formatNumber(height),
          unit: t(`units.${unit}`, ctx.lang),
        }),
        result
      );
    },
    page(ctx) {
      const [page] = targetPages(ctx);
      if (!page) {
        return;
      }
      const [w, h, u] = ctx.args;
      if (w === undefined) {
        notify(ctx, `${page.get('name')}: ${describePage(page, ctx.lang)}`);
        showBack(ctx);
        return;
      }
      const width = toNumber(w);
      const height = toNumber(h ?? w);
      const unit = readUnit(u, 'units');
      if (width === null || height === null || unit === null) {
        fail(ctx, { error: 'errors.badPageSize', vars: { max: MAX_PAGE_UNITS } });
        return;
      }
      const result = resizePage(page, width, height, unit);
      if (!result.ok) {
        fail(ctx, result);
        return;
      }
      reply(
        ctx,
        t('messages.pageResized', ctx.lang, {
          page: page.get('name'),
          size: describePage(page, ctx.lang),
        }),
        result
      );
    },
    zoom(ctx) {
      const pages = targetPages(ctx);
      if (pages.length === 0) {
        return;
      }
      const factor = parseFactor(ctx.args, attrsOf(pages[0]));
      if (factor === null) {
        fail(ctx, { error: 'errors.badFactorText', vars: { text: ctx.args.join(' ') } });
        return;
      }
      let keepTokens;
      if (ctx.flags.has('keep-tokens')) {
        keepTokens = true;
      } else if (ctx.flags.has('scale-tokens')) {
        keepTokens = false;
      }
      const result = zoomPages(pages, factor, { keepTokens });
      if (!result.ok) {
        fail(ctx, result);
        return;
      }
      const names = pages.map((p) => p.get('name')).join(', ');
      reply(
        ctx,
        t(pages.length === 1 ? 'messages.zoomed' : 'messages.zoomedPages', ctx.lang, {
          factor: formatNumber(factor),
          page: names,
          count: pages.length,
          objects: result.counts.objects,
        }),
        result
      );
      if (result.counts.skipped > 0) {
        whisperWarning(
          ctx.playerId,
          t('messages.skipped', ctx.lang, { count: result.counts.skipped })
        );
      }
    },
    fit(ctx) {
      const items = requireSelection(ctx);
      if (items.length === 0) {
        return;
      }
      const result = fitGraphics(items, ctx.flags.has('keep-ratio'));
      if (!result.ok) {
        fail(ctx, result);
        return;
      }
      reply(ctx, t('messages.fitted', ctx.lang, { count: result.count }), result);
    },
    center(ctx) {
      const items = requireSelection(ctx);
      if (items.length === 0) {
        return;
      }
      const words = ctx.args.map((a) => a.toLowerCase());
      const h = words.some((w) => ['h', 'hor', 'horizontal', 'across', 'both'].includes(w));
      const v = words.some((w) => ['v', 'ver', 'vertical', 'down', 'both'].includes(w));
      const result = centreItems(items, h || !v, v || !h);
      if (!result.ok) {
        fail(ctx, result);
        return;
      }
      reply(ctx, t('messages.centred', ctx.lang, { count: result.count }), result);
    },
    calibrate(ctx) {
      const items = requireSelection(ctx);
      if (items.length === 0) {
        return;
      }
      const across = ctx.args[0] === undefined ? undefined : toNumber(ctx.args[0]);
      const down = ctx.args[1] === undefined ? undefined : toNumber(ctx.args[1]);
      if (across === null || down === null) {
        fail(ctx, { error: 'errors.badCount' });
        return;
      }
      const result = calibrateMap(items, {
        across,
        down,
        squarePx: ctx.cell ?? undefined,
        fitPage: ctx.flags.has('fit-page'),
        keepBox: ctx.flags.has('keep-box'),
      });
      if (!result.ok) {
        fail(ctx, result);
        return;
      }
      const lines = [
        t('messages.calibrated', ctx.lang, {
          square: formatNumber(result.squarePx[0]),
          cell: formatNumber(result.cell),
          scale: formatNumber(result.scale[0]),
        }),
      ];
      if (result.page) {
        lines.push(
          t('messages.calibratedPage', ctx.lang, {
            width: formatNumber(result.page.width),
            height: formatNumber(result.page.height),
          })
        );
      }
      if (result.boxRemoved) {
        lines.push(t('messages.boxRemoved', ctx.lang));
      }
      reply(ctx, lines.join(' '), result);
    },
    undo(ctx) {
      const result = undoLast();
      if (!result.ok) {
        whisperError(ctx.playerId, t('errors.nothingToUndo', ctx.lang));
        showBack(ctx);
        return;
      }
      notify(ctx, t('messages.undone', ctx.lang, { what: describeEntry(result.entry, ctx.lang) }));
      if (result.missing > 0) {
        whisperWarning(
          ctx.playerId,
          t('messages.undoMissing', ctx.lang, { count: result.missing })
        );
      }
      showBack(ctx);
    },
    history(ctx) {
      if (toText(ctx.args[0]).toLowerCase() === 'clear') {
        const n = clearHistory();
        notify(ctx, t('messages.historyCleared', ctx.lang, { count: n }));
      }
      showHistory(ctx.playerId);
    },
    pages(ctx) {
      showPagePicker(ctx.playerId);
    },
    pick(ctx) {
      const word = toText(ctx.args[0]).toLowerCase();
      if (word === 'all' || word === 'none') {
        pickAll(word === 'all');
      } else {
        const id = ctx.args.join(' ');
        const page = resolvePages(id, ctx.msg.playerid).pages[0];
        if (!page || togglePicked(page.id) === null) {
          whisperError(ctx.playerId, t('errors.unknownPages', ctx.lang, { pages: id }));
          return;
        }
      }
      if (ctx.back) {
        showBack(ctx);
      } else {
        showPagePicker(ctx.playerId);
      }
    },
    settings(ctx) {
      showSettings(ctx.playerId);
    },
    set(ctx) {
      const [key = '', ...rest] = ctx.args;
      const value = rest.join(' ');
      const known = [
        'language',
        'command',
        'keepTokenSize',
        'scaleStrokes',
        'deleteCalibrationBox',
      ];
      const match = known.find((k) => k.toLowerCase() === key.toLowerCase());
      if (!match) {
        whisperError(
          ctx.playerId,
          t('errors.badSetting', ctx.lang, { key, settings: known.join(', ') })
        );
        return;
      }
      if (!setSetting(match, value)) {
        whisperError(ctx.playerId, t('errors.badValue', ctx.lang, { key: match, value }));
        return;
      }
      if (match === 'language') {
        installHandouts();
      }
      const lang = getLang();
      const shown = match === 'command' ? getCommand() : String(getSettings()[match]);
      notify({ ...ctx }, t('messages.settingChanged', lang, { key: match, value: shown }));
      if (match === 'command') {
        installHandouts();
      }
      showBack({ ...ctx });
    },
    reset(ctx) {
      resetSettings();
      installHandouts();
      notify(ctx, t('messages.settingsReset', getLang()));
      showBack(ctx);
    },
    journal(ctx) {
      installHandouts();
      notify(ctx, t('messages.handoutsRebuilt', ctx.lang));
    },
  };

  /**
   * Runs one command.
   *
   * @param {object} msg Chat message.
   * @param {string} rawSub Subcommand.
   * @param {string[]} rawWords Words after it.
   * @returns {void}
   */
  function routeCommand(msg, rawSub, rawWords) {
    const { sub, words } = translateLegacy(rawSub, rawWords);
    // A command that starts with a flag (!resizer --menu) is the menu.
    const name = !sub || sub.startsWith('--') ? 'menu' : sub;
    const parsed = parseArgs(sub.startsWith('--') ? [sub, ...words] : words);
    const ctx = {
      msg,
      playerId: msg.playerid === API_PLAYER_ID ? null : msg.playerid,
      lang: getLang(),
      ...parsed,
    };
    const handler = HANDLERS[name];
    if (!handler) {
      whisperError(
        ctx.playerId,
        t('errors.unknownCommand', ctx.lang, { command: rawSub, help: `${getCommand()} help` })
      );
      return;
    }
    handler(ctx);
  }

  /**
   * Handles a chat message.
   *
   * @param {object} msg Chat message.
   * @returns {void}
   */
  function handleInput(msg) {
    if (msg.type !== 'api') {
      return;
    }
    const content = toText(msg.content);
    const [first = ''] = content.split(/\s+/, 1);
    if (!getCommandNames().includes(first.toLowerCase())) {
      return;
    }
    // Commands sent by other Mods (ScriptCards, macros run by the API) come from
    // the player "API". Replies to them go to the GM.
    if (msg.playerid !== API_PLAYER_ID && !playerIsGM(msg.playerid)) {
      return;
    }
    try {
      const [sub = '', ...words] = content.slice(first.length).trim().split(/\s+/).filter(Boolean);
      routeCommand(msg, sub.toLowerCase(), words);
    } catch (err) {
      log(`${SCRIPT_NAME} ERROR: ${err?.message || err}`);
      if (err?.stack) {
        log(err.stack);
      }
      whisperError(
        msg.playerid === API_PLAYER_ID ? null : msg.playerid,
        t('errors.unexpected', getLang(), { message: err?.message || String(err) })
      );
    }
  }

  let ready = false;

  /**
   * Publishes the API other Mods can call. 0.0.9 published a global Resizer
   * object with CheckInstall and RegisterEventHandlers; they are kept (they do
   * nothing now, as 1.0 starts itself).
   *
   * @returns {void}
   */
  function publishApi() {
    globalThis.Resizer = Object.freeze({
      version: SCRIPT_VERSION,
      CheckInstall: () => {},
      RegisterEventHandlers: () => {},
      /**
       * Zooms a page with everything on it, keeping the distance per cell.
       *
       * @param {string} pageId Page ID.
       * @param {number} factor Zoom factor (2 = twice as big).
       * @param {{keepTokens?: boolean}} [options] Options.
       * @returns {{ok: boolean, error?: string, objects?: number}} Result; error is a message key.
       */
      zoomPage: (pageId, factor, options = {}) => {
        const page = ready && getObj('page', pageId);
        if (!page) {
          return { ok: false, error: 'errors.noPage' };
        }
        const result = zoomPages([page], Number(factor), options);
        return result.ok
          ? { ok: true, objects: result.counts.objects, stored: result.stored }
          : { ok: false, error: result.error };
      },
      /** Undoes the newest change. */
      undo: () => {
        if (!ready) {
          return { ok: false };
        }
        const result = undoLast();
        return result.ok
          ? { ok: true, what: describeEntry(result.entry, getLang()), missing: result.missing }
          : { ok: false };
      },
      /** Lists the undo history, newest first: [{what, at}]. */
      history: () =>
        ready ? listHistory().map((e) => ({ what: describeEntry(e, getLang()), at: e.at })) : [],
      /** Calls fn(pageId, factor) after every zoom, and after undoing one (factor 1/f). */
      onZoom: (fn) => onZoom(fn),
    });
  }

  /**
   * Startup: load state, upgrade 0.0.9, write the handouts and greet the GM.
   *
   * @returns {void}
   */
  function checkInstall() {
    const { fresh, upgraded } = initialiseState();
    applyGlobalConfig();
    ready = true;
    try {
      installHandouts();
    } catch (err) {
      log(`${SCRIPT_NAME}: could not write the handouts: ${err?.message || err}`);
    }

    log(`-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} [Updated: ${SCRIPT_LAST_UPDATED}] <=-`);

    const lang = getLang();
    const lines = [`<div><strong>${escapeHtml(t('titles.ready', lang))}</strong></div>`];
    if (upgraded) {
      lines.push(
        `<div style="margin-top:3px">${escapeHtml(t('messages.upgraded', lang, { command: getCommand() }))}</div>`
      );
    } else if (fresh) {
      lines.push(`<div style="margin-top:3px">${escapeHtml(t('messages.welcome', lang))}</div>`);
    }
    lines.push(
      `<div style="font-size:0.85em;margin-top:3px">${escapeHtml(t('messages.readyHint', lang, { command: getCommand() }))}</div>`
    );
    getState().version = SCRIPT_VERSION;
    whisper(null, `${SCRIPT_NAME} v${SCRIPT_VERSION}`, lines);
  }

  /**
   * Registers all Roll20 event handlers.
   *
   * @returns {void}
   */
  function registerEventHandlers() {
    on('ready', () => {
      try {
        publishApi();
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
  }

  registerEventHandlers();
})();
