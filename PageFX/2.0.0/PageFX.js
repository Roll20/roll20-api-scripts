/**
 * NOTE: GENERATED FILE - DO NOT EDIT DIRECTLY.
 * NOTE: Source files live under src/ and are bundled with `npm run build`.
 * ------------------------------------------------
 * Name: Page FX
 * Script: PageFX.js
 * Version: 2.0.0
 * Built: 2026-11-07T14:22:32.154Z
 */
const PageFXMod = (() => {
  'use strict';

  // Build-time placeholders replaced by rollup.config.js inject-build-metadata plugin.
  const SCRIPT_NAME = 'Page FX';
  const SCRIPT_VERSION = '2.0.0';
  const SCRIPT_LAST_UPDATED = '2026-11-07T14:22:32.154Z';

  const DEFAULT_LOCALE$1 = 'en-US';

  const STATE_KEY = 'PageFX';
  const SCHEMA_VERSION = 2;

  // Commands are matched without regard to case, so v1's `!pageFX on` and
  // `!pageFX off` reach the same handlers as `!pagefx on` and `!pagefx off`.
  const COMMAND = '!pagefx';
  const COMMAND_ALIASES = ['!pagefx', '!page-fx'];

  // The player ID Roll20 gives chat messages sent by Mods with sendChat.
  const API_PLAYER_ID = 'API';

  // v1 marked effects and no-effect areas by token name, and disabled an effect
  // with the interdiction status marker. All three are still honoured.
  const V1_EFFECT_NAME = 'PageFX';
  const V1_NULL_NAME = 'NullFX';
  const V1_DISABLE_MARKER = 'interdiction';

  const HANDOUT_HELP_NAME = 'PageFX - Help';
  // The deck's name is not translated, so it always matches the handout's name.
  const DECK_TITLE = 'Command Deck';
  const HANDOUT_DECK_NAME = `PageFX - ${DECK_TITLE}`;

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
    'https://raw.githubusercontent.com/Roll20/roll20-api-scripts/master/PageFX/PageFX.gif';

  // Roll20's built-in effect types and colours. An effect is written "type-colour".
  const BUILTIN_TYPES = [
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
  const BUILTIN_COLOURS = [
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
  const BEAM_TYPES = ['beam', 'breath', 'splatter'];
  // Names v1 accepted for built-in types.
  const BUILTIN_TYPE_ALIASES = { explosion: 'explode' };

  // Values Roll20 needs in every custom FX definition. Jumpgate draws a
  // definition that lacks one as black squares that never fade (seen with a
  // missing lifeSpanRandom, 4 November 2026), so missing values are filled in.
  const CUSTOM_FX_DEFAULTS = Object.freeze({
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
  const BEAM_ANGLE = -1;

  // Custom FX objects PageFX makes for itself start with this name, so they are
  // easy to tell apart from the GM's own in Roll20's FX list.
  const OWNED_FX_PREFIX = 'PageFX: ';

  // Pixels in one Roll20 page unit (one grid cell at snapping increment 1).
  const PIXELS_PER_UNIT = 70;

  // Spawn interval used when a v1 token has no Bar 1 value, as in v1.
  const DEFAULT_INTERVAL_MS = 100;
  // Shortest delay between two spawns of one layer, whatever the intensity.
  const MIN_DELAY_MS = 20;
  const MAX_INTERVAL_MS = 600000;

  const MIN_INTENSITY = 0.1;
  const MAX_INTENSITY = 5;

  // Spawns per second allowed on one page (measured smooth up to 60 in Jumpgate).
  const DEFAULT_MAX_SPAWNS_PER_SECOND = 30;
  const MAX_SPAWNS_PER_SECOND_LIMIT = 60;
  const RATE_WINDOW_MS = 1000;

  // How often the live pages are checked for moves Roll20 raises no event for.
  const LIVE_PAGE_CHECK_MS = 3000;

  const MAX_NAME_LENGTH = 60;
  const MAX_LAYERS = 8;

  // New effects made from the chat menu: time between spawns, and the size of
  // the area (in grid cells) given to a token that has no Aura 1 yet.
  const NEW_EFFECT_INTERVAL_MS = [500, 1500];
  const NEW_EFFECT_AREA_CELLS = 3;
  const NEW_EFFECT_NAME = 'PageFX';

  // Most effect cards one command shows, and most spawns one `fire` makes per layer.
  const MAX_EDIT_CARDS = 5;
  const MAX_FIRE_COUNT = 20;

  // Default settings for new installs.
  const DEFAULT_SETTINGS = {
    language: DEFAULT_LOCALE$1,
    gmPagePreview: false,
    intensity: 1,
    maxSpawnsPerSecond: DEFAULT_MAX_SPAWNS_PER_SECOND,
  };

  // Colour palette for chat cards and handouts.
  const COLOR_HEADER_BG = '#1d1638';
  const COLOR_HEADER_TEXT = '#e6dfff';
  const COLOR_CARD_BG_TOP = '#2a1f4f';
  const COLOR_CARD_BG_BOTTOM = '#151027';
  const COLOR_BORDER = '#4b3a85';
  const COLOR_TEXT = '#ece8f7';
  const COLOR_MUTED = '#a99fc9';
  const COLOR_ACCENT = '#b388ff';
  const COLOR_BUTTON_BG = '#6a0dad';
  const COLOR_BUTTON_TEXT = '#ffffff';
  const COLOR_BUTTON2_BG = '#2f2556';
  const COLOR_BUTTON2_BORDER = '#5b4a99';
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
   * Clamps a number to a range.
   *
   * @param {number} value Value.
   * @param {number} min Lower bound.
   * @param {number} max Upper bound.
   * @returns {number} Clamped value.
   */
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  /**
   * Turns a token's GM Notes into plain text. Roll20 stores GM Notes URI-encoded
   * and wrapped in HTML; v1 read effect names and JSON from there.
   *
   * @param {*} raw GM Notes value.
   * @returns {string} Plain text.
   */
  function decodeNotes(raw) {
    let text = toText(raw);
    try {
      text = decodeURIComponent(text);
    } catch {
      // Keep the text as it is when it is not URI-encoded.
    }
    return text
      .replaceAll(/<br\s*\/?>/gi, ' ')
      .replaceAll(/<\/?[^>]+>/g, '')
      .replaceAll('&nbsp;', ' ')
      .replaceAll('&quot;', '"')
      .replaceAll('&#34;', '"')
      .replaceAll('&#39;', "'")
      .replaceAll('&lt;', '<')
      .replaceAll('&gt;', '>')
      .replaceAll('&amp;', '&')
      .trim();
  }

  /**
   * Returns a token's status markers as a list of names (without badges).
   *
   * @param {object} token Roll20 graphic.
   * @returns {string[]} Marker names.
   */
  function getMarkers(token) {
    return toText(token.get('statusmarkers'))
      .split(',')
      .map((m) => m.split('@')[0].trim())
      .filter(Boolean);
  }

  /**
   * Returns true when a token carries a status marker.
   *
   * @param {object} token Roll20 graphic.
   * @param {string} marker Marker name.
   * @returns {boolean} True when present.
   */
  function hasMarker(token, marker) {
    return getMarkers(token).includes(marker) || token.get(`status_${marker}`) === true;
  }

  /**
   * Shortens text to a maximum length.
   *
   * @param {*} text Text.
   * @param {number} max Maximum length.
   * @returns {string} Text, cut with an ellipsis when too long.
   */
  function truncate(text, max) {
    const s = toText(text);
    return s.length > max ? `${s.slice(0, max - 1)}…` : s;
  }

  /**
   * Returns the current time in milliseconds.
   *
   * @returns {number} Milliseconds since the epoch.
   */
  function now() {
    return Date.now();
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

  // Effect specs: parsing what the GM types (or what v1 kept in GM Notes), and
  // turning a spec into something Roll20 can spawn.
  //
  // Jumpgate draws spawnFxWithDefinition() in white only, whatever colours the
  // definition holds, but draws saved custom FX objects in their colours. So a
  // custom definition is kept in a custom FX object PageFX owns, and spawned by
  // its ID (checked in Jumpgate on 4 November 2026).

  /**
   * @typedef {{kind: 'builtin'|'saved'|'custom', value: *}} FxSpec
   */

  /**
   * @typedef {{ok: true, fx: FxSpec} | {ok: false, error: string, vars?: object}} FxParse
   */

  /**
   * Parses an effect: a built-in "type-colour", a saved custom FX name, or a
   * custom FX definition in JSON.
   *
   * @param {*} raw Text typed by the GM or read from v1 GM Notes.
   * @returns {FxParse} Parsed spec, or an error key for the messages.
   */
  function parseFxSpec(raw) {
    const text = toText(raw);
    if (text === '') {
      return { ok: false, error: 'fx.empty' };
    }
    if (text.startsWith('{')) {
      let value;
      try {
        value = JSON.parse(text);
      } catch {
        return { ok: false, error: 'fx.badJson' };
      }
      if (!isRecord(value)) {
        return { ok: false, error: 'fx.badJson' };
      }
      return { ok: true, fx: { kind: 'custom', value: completeDefinition(value) } };
    }
    const builtin = parseBuiltin(text);
    if (builtin) {
      return builtin;
    }
    return { ok: true, fx: { kind: 'saved', value: text } };
  }

  /**
   * Parses a built-in "type-colour" name, accepting v1's aliases and any case.
   *
   * @param {string} text Effect text.
   * @returns {FxParse|null} Parsed built-in, an error for a known type with an
   *   unknown colour, or null when the text is not a built-in name.
   */
  function parseBuiltin(text) {
    const match = /^([a-z]+)-([a-z]+)$/i.exec(text);
    if (!match) {
      return null;
    }
    const lowered = match[1].toLowerCase();
    const type = BUILTIN_TYPE_ALIASES[lowered] || lowered;
    const colour = match[2].toLowerCase();
    if (!BUILTIN_TYPES.includes(type)) {
      return null;
    }
    if (!BUILTIN_COLOURS.includes(colour)) {
      return {
        ok: false,
        error: 'fx.unknownColour',
        vars: { colour, colours: BUILTIN_COLOURS.join(', ') },
      };
    }
    return { ok: true, fx: { kind: 'builtin', value: `${type}-${colour}` } };
  }

  /**
   * Copies colour keys between Roll20's two spellings, so a definition works
   * whichever spelling the engine reads ("Colour" is documented, but the custom
   * FX Roll20's own editor and other Mods save carry "Color" too).
   *
   * @param {object} def Custom FX definition.
   * @returns {object} Definition with both spellings.
   */
  function normaliseDefinition(def) {
    const out = { ...def };
    // Legacy draws nothing for a negative angle other than -1 (beam); Jumpgate takes either.
    // -90 (up) becomes 270, which both draw the same.
    if (typeof out.angle === 'number' && out.angle < 0 && out.angle !== BEAM_ANGLE) {
      out.angle = ((out.angle % 360) + 360) % 360;
    }
    for (const base of ['start', 'end']) {
      for (const suffix of ['', 'Random']) {
        const british = `${base}Colour${suffix}`;
        const american = `${base}Color${suffix}`;
        if (british in out && !(american in out)) {
          out[american] = out[british];
        } else if (american in out && !(british in out)) {
          out[british] = out[american];
        }
      }
    }
    return out;
  }

  /**
   * Fills in the values a custom FX definition leaves out, then gives its
   * colours both spellings. A colour given in either spelling counts as given.
   *
   * @param {object} def Custom FX definition.
   * @returns {object} Complete definition.
   */
  function completeDefinition(def) {
    const out = { ...def };
    for (const [key, value] of Object.entries(CUSTOM_FX_DEFAULTS)) {
      const american = key.replace('Colour', 'Color');
      if (!(key in out) && !(american in out)) {
        out[key] = Array.isArray(value) ? [...value] : value;
      }
    }
    return normaliseDefinition(out);
  }

  /**
   * Returns true when a built-in effect is drawn between two points.
   *
   * @param {string} name Built-in "type-colour" name.
   * @returns {boolean} True for beam-like effects.
   */
  function isBeamBuiltin(name) {
    return BEAM_TYPES.includes(String(name).split('-')[0]);
  }

  /**
   * Describes a spec in a few words for menus and status.
   *
   * @param {FxSpec} fx Spec.
   * @returns {string} Short description.
   */
  function describeFx(fx) {
    if (!fx) {
      return '';
    }
    if (fx.kind === 'custom') {
      return fx.shared ? truncate(fx.shared, 40) : 'JSON';
    }
    return truncate(fx.value, 40);
  }

  /**
   * @typedef {object} ResolvedFx
   * @property {string} id What to pass to spawnFx: a built-in name or a custom FX ID.
   * @property {boolean} beam True when drawn between two points.
   */

  /**
   * Finds a saved custom FX by name: exact first, then ignoring case.
   *
   * @param {string} name Custom FX name.
   * @returns {object|undefined} Roll20 custfx.
   */
  function findSavedFx(name) {
    const exact = findObjs({ _type: 'custfx', name });
    if (exact.length > 0) {
      return exact[0];
    }
    const lower = name.toLowerCase();
    return findObjs({ _type: 'custfx' }).find((f) => toText(f.get('name')).toLowerCase() === lower);
  }

  /**
   * Reads a custom FX object's definition, which the API returns as an object
   * (or, in older games, as JSON text).
   *
   * @param {object} custfx Roll20 custfx.
   * @returns {object} Definition, empty when unreadable.
   */
  function readDefinition(custfx) {
    const def = custfx.get('definition');
    if (isRecord(def)) {
      return def;
    }
    try {
      const parsed = JSON.parse(toText(def));
      return isRecord(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  /**
   * Makes or updates the custom FX object PageFX owns for a custom definition.
   *
   * @param {object} owned Map of owner key to custfx ID (kept in state).
   * @param {string} key Owner key (effect ID and layer number).
   * @param {string} label Name shown in Roll20's FX list, after the prefix.
   * @param {object} definition Custom FX definition.
   * @returns {object|null} Roll20 custfx, or null when it could not be made.
   */
  function ensureOwnedFx(owned, key, label, definition) {
    const name = `${OWNED_FX_PREFIX}${truncate(label, 80)}`;
    const json = JSON.stringify(definition);
    let custfx = owned[key] ? getObj('custfx', owned[key]) : undefined;
    if (custfx) {
      if (JSON.stringify(readDefinition(custfx)) !== json) {
        custfx.set('definition', definition);
      }
      if (custfx.get('name') !== name) {
        custfx.set('name', name);
      }
      return custfx;
    }
    custfx = createObj('custfx', { name, definition });
    if (!custfx) {
      return null;
    }
    owned[key] = custfx.id;
    return custfx;
  }

  /**
   * Removes the custom FX objects PageFX owns for an effect.
   *
   * @param {object} owned Map of owner key to custfx ID (kept in state).
   * @param {string} effectId Effect ID.
   * @returns {void}
   */
  function removeOwnedFx(owned, effectId) {
    for (const key of Object.keys(owned)) {
      if (key.split('#')[0] === effectId) {
        getObj('custfx', owned[key])?.remove();
        delete owned[key];
      }
    }
  }

  /**
   * Turns a spec into something to spawn.
   *
   * @param {FxSpec} fx Spec.
   * @param {{owned: object, key: string, label: string}} owner Where a custom definition is kept.
   * @returns {{ok: true, fx: ResolvedFx} | {ok: false, error: string, vars?: object}} Result.
   */
  function resolveFx(fx, owner) {
    if (fx.kind === 'builtin') {
      return { ok: true, fx: { id: fx.value, beam: isBeamBuiltin(fx.value) } };
    }
    if (fx.kind === 'saved') {
      const saved = findSavedFx(fx.value);
      if (!saved) {
        return { ok: false, error: 'fx.savedMissing', vars: { name: fx.value } };
      }
      return { ok: true, fx: { id: saved.id, beam: readDefinition(saved).angle === BEAM_ANGLE } };
    }
    if (fx.kind === 'custom') {
      // Completed again here so definitions saved before a default was added still draw.
      const def = completeDefinition(fx.value);
      // Preset layers share one custom FX per definition, however many effects use them.
      const custfx = fx.shared
        ? ensureOwnedFx(owner.owned, sharedKey(def), fx.shared, def)
        : ensureOwnedFx(owner.owned, owner.key, owner.label, def);
      if (!custfx) {
        return { ok: false, error: 'fx.cannotCreate' };
      }
      return { ok: true, fx: { id: custfx.id, beam: fx.value.angle === BEAM_ANGLE } };
    }
    return { ok: false, error: 'fx.empty' };
  }

  /**
   * Spawns one effect on a page. The page must always be given: without it
   * Roll20 draws the effect on the player ribbon page, which is why v1 never
   * showed anything to a split party.
   *
   * @param {ResolvedFx} fx Resolved effect.
   * @param {{x: number, y: number}} start Where it appears (or starts).
   * @param {{x: number, y: number}|null} end Where a beam-like effect ends.
   * @param {string} pageId Page ID.
   * @returns {void}
   */
  function spawn(fx, start, end, pageId) {
    if (fx.beam && end) {
      spawnFxBetweenPoints(start, end, fx.id, pageId);
    } else {
      spawnFx(start.x, start.y, fx.id, pageId);
    }
  }

  /**
   * Removes custom FX objects PageFX owns for an effect's layers that no longer
   * need one: layers that were deleted, or that now use a built-in or saved FX.
   *
   * @param {object} owned Map of owner key to custfx ID (kept in state).
   * @param {{id: string, layers: Array<{fx: FxSpec|null}>}} effect Effect.
   * @returns {void}
   */
  function pruneOwnedFx(owned, effect) {
    for (const key of Object.keys(owned)) {
      const [effectId, index] = key.split('#');
      if (effectId !== effect.id) {
        continue;
      }
      if (effect.layers[Number(index)]?.fx?.kind !== 'custom') {
        getObj('custfx', owned[key])?.remove();
        delete owned[key];
      }
    }
  }

  /**
   * Returns true when a spec is drawn between two points, so it has a direction.
   *
   * @param {FxSpec|null} fx Spec.
   * @returns {boolean} True for beam-like effects.
   */
  function isBeamSpec(fx) {
    if (!fx) {
      return false;
    }
    if (fx.kind === 'builtin') {
      return isBeamBuiltin(fx.value);
    }
    if (fx.kind === 'custom') {
      return fx.value.angle === BEAM_ANGLE;
    }
    const saved = findSavedFx(fx.value);
    return !!saved && readDefinition(saved).angle === BEAM_ANGLE;
  }

  /**
   * Returns the names of the game's own saved custom FX, without the ones
   * PageFX made for itself, sorted.
   *
   * @returns {string[]} Names.
   */
  function listSavedFxNames() {
    return findObjs({ _type: 'custfx' })
      .map((f) => toText(f.get('name')))
      .filter((name) => name !== '' && !name.startsWith(OWNED_FX_PREFIX))
      .sort((a, b) => a.localeCompare(b));
  }

  /**
   * Hashes text into a short key (djb2, base 36).
   *
   * @param {string} text Text.
   * @returns {string} Hash.
   */
  function hashText(text) {
    let h = 5381;
    for (let i = 0; i < text.length; i++) {
      h = (Math.imul(h, 33) ^ text.charCodeAt(i)) >>> 0;
    }
    return h.toString(36);
  }

  /**
   * Returns the owner key of the custom FX shared by every layer with this
   * definition.
   *
   * @param {object} def Complete custom FX definition.
   * @returns {string} Owner key.
   */
  function sharedKey(def) {
    return `shared:${hashText(JSON.stringify(def))}`;
  }

  /**
   * Removes shared custom FX objects that no effect layer uses any more.
   *
   * @param {object} owned Map of owner key to custfx ID (kept in state).
   * @param {object[]} effects Every effect.
   * @returns {void}
   */
  function pruneSharedFx(owned, effects) {
    const used = new Set();
    for (const effect of effects) {
      for (const layer of effect.layers) {
        if (layer.fx?.kind === 'custom' && layer.fx.shared) {
          used.add(sharedKey(completeDefinition(layer.fx.value)));
        }
      }
    }
    for (const key of Object.keys(owned)) {
      if (key.startsWith('shared:') && !used.has(key)) {
        getObj('custfx', owned[key])?.remove();
        delete owned[key];
      }
    }
  }

  // Area maths. Everything here is pure: it takes plain numbers and records, so
  // it can be tested in Node without the Roll20 sandbox.

  /**
   * @typedef {object} PageMetrics
   * @property {number} cellPx Pixels in one grid cell.
   * @property {number} pxPerUnit Pixels in one measurement unit (feet, metres...).
   * @property {number} widthPx Page width in pixels.
   * @property {number} heightPx Page height in pixels.
   */

  /**
   * @typedef {object} Area
   * @property {number} x Centre x in pixels.
   * @property {number} y Centre y in pixels.
   * @property {number} r Radius (circle) or half-side (square) in pixels.
   * @property {boolean} square True for a square area.
   */

  /**
   * Works out a page's sizes. A grid cell is 70 px times the snapping increment
   * and measures `scale_number` units; page width and height are in 70 px units.
   * Verified in Jumpgate on 4 November 2026.
   *
   * @param {{width:*, height:*, snapping_increment:*, scale_number:*}} page Page values.
   * @returns {PageMetrics} Page metrics.
   */
  function pageMetrics(page) {
    const snap = toNumber(page.snapping_increment);
    const cellPx = PIXELS_PER_UNIT * (snap && snap > 0 ? snap : 1);
    const scale = toNumber(page.scale_number);
    return {
      cellPx,
      pxPerUnit: cellPx / (scale && scale > 0 ? scale : 1),
      widthPx: (toNumber(page.width) || 0) * PIXELS_PER_UNIT,
      heightPx: (toNumber(page.height) || 0) * PIXELS_PER_UNIT,
    };
  }

  /**
   * Works out a token's Aura 1 area. Roll20 measures auras from the token's edge,
   * so half the token's larger side is added to the radius. A token with no aura
   * covers just itself.
   *
   * @param {{left:*, top:*, width:*, height:*, aura1_radius:*, aura1_square:*}} token Token values.
   * @param {PageMetrics} metrics Page metrics.
   * @returns {Area} Area.
   */
  function tokenArea(token, metrics) {
    const radius = Math.max(0, toNumber(token.aura1_radius) || 0);
    const size = Math.max(toNumber(token.width) || 0, toNumber(token.height) || 0);
    return {
      x: toNumber(token.left) || 0,
      y: toNumber(token.top) || 0,
      r: radius * metrics.pxPerUnit + size / 2,
      square: token.aura1_square === true || token.aura1_square === 'true',
    };
  }

  /**
   * Picks a uniformly distributed point in an area.
   *
   * v1 used `1 - u²` for the distance, which still bunched effects towards the
   * centre; `√u` spreads them evenly over the circle.
   *
   * @param {Area} area Area.
   * @param {() => number} [random=Math.random] Random source in [0, 1).
   * @returns {{x: number, y: number}} Point.
   */
  function randomPointIn(area, random = Math.random) {
    if (area.square) {
      return {
        x: area.x + (random() * 2 - 1) * area.r,
        y: area.y + (random() * 2 - 1) * area.r,
      };
    }
    const angle = random() * 2 * Math.PI;
    const dist = Math.sqrt(random()) * area.r;
    return { x: area.x + dist * Math.cos(angle), y: area.y + dist * Math.sin(angle) };
  }

  /**
   * Returns true when a point lies in an area (edges included).
   *
   * @param {{x: number, y: number}} pt Point.
   * @param {Area} area Area.
   * @returns {boolean} True when inside.
   */
  function isInArea(pt, area) {
    const dx = pt.x - area.x;
    const dy = pt.y - area.y;
    if (area.square) {
      return Math.abs(dx) <= area.r && Math.abs(dy) <= area.r;
    }
    return dx * dx + dy * dy <= area.r * area.r;
  }

  /**
   * Keeps a point on the page.
   *
   * @param {{x: number, y: number}} pt Point.
   * @param {PageMetrics} metrics Page metrics.
   * @returns {{x: number, y: number}} Point inside the page.
   */
  function clampToPage(pt, metrics) {
    return {
      x: Math.min(Math.max(pt.x, 0), metrics.widthPx),
      y: Math.min(Math.max(pt.y, 0), metrics.heightPx),
    };
  }

  /**
   * Works out where a beam-like effect ends. A fixed direction is in grid cells
   * (v1's Bar 2 value and max); "random" picks any direction up to one cell long.
   *
   * @param {{x: number, y: number}} start Start point.
   * @param {null|'random'|{dx: number, dy: number}} direction Direction.
   * @param {PageMetrics} metrics Page metrics.
   * @param {() => number} [random=Math.random] Random source.
   * @returns {{x: number, y: number}} End point.
   */
  function beamEnd(start, direction, metrics, random = Math.random) {
    if (direction === 'random') {
      const angle = random() * 2 * Math.PI;
      const length = (0.25 + random() * 0.75) * metrics.cellPx;
      return { x: start.x + length * Math.cos(angle), y: start.y + length * Math.sin(angle) };
    }
    const dx = direction?.dx || 0;
    const dy = direction?.dy || 0;
    return { x: start.x + dx * metrics.cellPx, y: start.y + dy * metrics.cellPx };
  }

  /**
   * Picks a delay between two spawns.
   *
   * @param {[number, number]} interval Shortest and longest interval in ms.
   * @param {number} intensity Rate multiplier (2 = twice as often).
   * @param {number} minDelay Shortest delay allowed.
   * @param {() => number} [random=Math.random] Random source.
   * @returns {number} Delay in ms.
   */
  function nextDelay(interval, intensity, minDelay, random = Math.random) {
    const [low, high] = interval;
    const base = low + random() * (Math.max(low, high) - low);
    return Math.max(minDelay, base / (intensity > 0 ? intensity : 1));
  }

  // Which pages are "live": the ones effects run on.

  /**
   * Works out the live pages from the campaign's page settings.
   *
   * Players see the ribbon page unless the GM has moved them to their own page
   * (a split party), which Roll20 records in playerspecificpages. v1 only ever
   * ran effects on the ribbon page.
   *
   * @param {object} input Page settings.
   * @param {string} input.ribbon Campaign playerpageid.
   * @param {*} input.split Campaign playerspecificpages: false or {playerId: pageId}.
   * @param {string[]} [input.gmPages=[]] Pages GMs are viewing, when previews are on.
   * @returns {Set<string>} Live page IDs.
   */
  function computeLivePages({ ribbon, split, gmPages = [] }) {
    const live = new Set();
    if (toText(ribbon)) {
      live.add(toText(ribbon));
    }
    if (isRecord(split)) {
      for (const pageId of Object.values(split)) {
        if (toText(pageId)) {
          live.add(toText(pageId));
        }
      }
    }
    for (const pageId of gmPages) {
      if (toText(pageId)) {
        live.add(toText(pageId));
      }
    }
    return live;
  }

  /**
   * Reads playerspecificpages, which Roll20 may hand back as an object or as JSON text.
   *
   * @param {*} raw Campaign value.
   * @returns {object|false} Map of player ID to page ID, or false.
   */
  function readSplitPages(raw) {
    if (isRecord(raw)) {
      return raw;
    }
    if (typeof raw === 'string' && raw.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(raw);
        return isRecord(parsed) ? parsed : false;
      } catch {
        return false;
      }
    }
    return false;
  }

  /**
   * Returns the live pages in the running game.
   *
   * @param {boolean} gmPagePreview Include pages that online GMs are viewing.
   * @returns {Set<string>} Live page IDs.
   */
  function getLivePages(gmPagePreview) {
    const campaign = Campaign();
    const gmPages = gmPagePreview
      ? findObjs({ _type: 'player' })
          .filter((p) => p.get('_online') !== false && playerIsGM(p.id))
          .map((p) => p.get('_lastpage'))
      : [];
    return computeLivePages({
      ribbon: campaign.get('playerpageid'),
      split: readSplitPages(campaign.get('playerspecificpages')),
      gmPages,
    });
  }

  const TRANSLATION$c = {
    titles: {
      ready: 'PageFX is gereed.',
      menu: 'PageFX',
      status: 'PageFX-status',
      settings: 'PageFX-instellings',
      presets: 'PageFX-voorinstellings',
      help: 'PageFX-opdragte',
      effect: 'Effek: {name}',
    },
    messages: {
      readyHint: 'Tik !pagefx om die kieslys oop te maak.',
      adopted:
        '{effects} effek(te) en {nulls} effekvrye gebied(e) van PageFX 1.x-tokens oorgeneem. Hulle werk soos voorheen.',
      rescanned:
        'Die nuwe soektog het {effects} nuwe effek(te) en {nulls} nuwe effekvrye gebied(e) gevind, en {dropped} vergeet waarvan die tokens geskrap is.',
      allPaused: 'Alle effekte is onderbreek. Gebruik !pagefx resume om hulle weer te begin.',
      allResumed: 'Die effekte loop weer.',
      turnedOn: 'Aangeskakel: {count}.',
      turnedOff: 'Afgeskakel: {count}.',
      toggled: 'Aan- of afgeskakel: {count}.',
      paused: 'Onderbreek: {count}.',
      resumed: 'Hervat: {count}.',
      fired: '{count} effek(te) laat verskyn.',
      created: 'Nuwe effekte: {count}. Kies op elkeen se infokaart wat dit laat verskyn.',
      deleted: 'Effekte verwyder: {count}. Hulle tokens is steeds op die kaart.',
      renamed: 'Hernoem: {count}.',
      fxSet: 'Effek verander: {count}.',
      intervalSet: 'Tussentyd verander: {count}.',
      directionSet: 'Rigting verander: {count}.',
      areaSet: 'Gebied verander: {count}.',
      intensitySet: 'Intensiteit verander: {count}.',
      layerAdded: 'Laag bygevoeg: {count}.',
      layerRemoved: 'Laag verwyder: {count}.',
      nullCreated: 'Nuwe effekvrye gebiede: {count}.',
      nullRemoved: 'Effekvrye gebiede verwyder: {count}.',
      presetApplied: '{name} toegepas: {count}.',
      journalRebuilt: 'Die uitdeelstukke “{help}” en “{deck}” is herbou.',
      triggerAdded: 'Sneller bygevoeg: {count}.',
      triggerRemoved: 'Sneller verwyder: {count}.',
      triggersCleared: 'Snellers van {count} effek(te) verwyder.',
      throttled:
        'Die effekte op die bladsy “{page}” word uitgedun: hulle het vir meer as {max} verskynings per sekonde gevra. Verlaag hulle intensiteit, of verhoog die limiet met !pagefx set maxSpawnsPerSecond.',
      settingChanged: '{setting} is nou {value}.',
      problem: 'Die effek “{name}” kan nie loop nie: {reason}',
    },
    menu: {
      page: 'Bladsy',
      live: 'effekte loop hier',
      notLive: 'geen spelers hier nie',
      allPausedNote: 'Alle effekte is onderbreek.',
      effectsHere: 'Effekte op hierdie bladsy',
      noEffectsHere: 'Nog geen effekte op hierdie bladsy nie.',
      otherPages: 'Ander bladsye',
      effectCount: '{count} effek(te)',
      actions: 'Nuut',
      selectHint:
        'Kies eers ’n token op die kaart en klik dan op Nuwe effek of Effekvrye gebied. Die token merk waar die effek verskyn; sy Aura 1 is die gebied.',
      state: 'Toestand',
      area: 'Gebied',
      areaValue: '{radius} {units} rondom die token, {shape}',
      circle: 'sirkel',
      square: 'vierkant',
      circleOption: 'Sirkel',
      squareOption: 'Vierkant',
      layers: 'Lae',
      layer: 'Laag {n}',
      noLayers: 'Geen lae nie. Voeg een by om te kies wat hierdie effek laat verskyn.',
      noFxSet: 'nie gestel nie',
      timing: 'elke {min}–{max} ms',
      directionRandom: 'lukrake rigting',
      directionOffset: 'eindig {dx}, {dy} selle verder',
      v1Note:
        'Hierdie effek volg steeds sy token se SL-notas (“GM Notes”) en stawe, soos in PageFX 1.x. As jy dit hier verander, hou dit op.',
      preset: 'Voorinstelling',
      presetsHint:
        'Kies een of meer tokens op die kaart en klik dan op ’n voorinstelling. Tokens wat nog nie effekte is nie, word effekte, en hulle Aura 1 is die gebied wat die voorinstelling vul.',
      triggers: 'Snellers',
      noTriggers: 'Geen snellers nie: die effek loop wanneer daar spelers op sy bladsy is.',
      triggerHint:
        'Vir ’n beurtsneller, of ’n gebied van ’n ander token, kies eers daardie token op die kaart.',
      yes: 'Ja',
      no: 'Nee',
    },
    buttons: {
      edit: 'Wysig',
      show: 'Wys',
      turnOn: 'Skakel aan',
      turnOff: 'Skakel af',
      pause: 'Onderbreek',
      resume: 'Hervat',
      fire: 'Vuur af',
      pauseAll: 'Onderbreek almal',
      resumeAll: 'Hervat almal',
      create: 'Nuwe effek',
      createNull: 'Effekvrye gebied',
      removeNull: 'Verwyder effekvrye gebied',
      settings: 'Instellings',
      status: 'Status',
      rescan: 'Soek weer',
      rename: 'Hernoem',
      area: 'Gebied',
      intensity: 'Intensiteit',
      builtin: 'Ingeboude FX',
      saved: 'Gestoorde FX',
      json: 'Eie JSON',
      timing: 'Tussentyd',
      random: 'Lukrake rigting',
      offset: 'Stel rigting',
      addLayer: 'Voeg laag by',
      removeLayer: 'Verwyder laag',
      delete: 'Skrap effek',
      preset: 'Voorinstelling',
      presets: 'Voorinstellings',
      remove: 'Verwyder',
      help: 'Hulp',
      rebuild: 'Herbou uitdeelstukke',
      onRound: 'Elke rondte',
      onTurn: 'Op ’n beurt',
      onEnter: 'Token kom in',
      onLeave: 'Token gaan uit',
      menu: 'Kieslys',
      change: 'Verander',
    },
    prompts: {
      type: 'Soort effek',
      colour: 'Kleur',
      saved: 'Gestoorde eie FX',
      json: 'Eie FX-definisie (JSON)',
      intervalMin: 'Kortste tyd tussen verskynings in ms',
      intervalMax: 'Langste tyd tussen verskynings in ms',
      dx: 'Selle regs tot by die einde (negatief is links)',
      dy: 'Selle af tot by die einde (negatief is op)',
      name: 'Naam van die effek',
      radius: 'Radius van die gebied rondom die token in bladsy-eenhede',
      shape: 'Vorm van die gebied',
      intensity: 'Intensiteit ({min} tot {max})',
      maxSpawns: 'Verskynings per sekonde op een bladsy (1 tot {max})',
      preset: 'Voorinstelling',
      then: 'Dan',
      every: 'Elke hoeveel rondtes',
      who: 'Watter tokens tel',
      area: 'Watter gebied',
      once: 'Net die eerste keer?',
      confirmDelete: 'Skrap hierdie effek? Die token bly op die kaart.',
    },
    settings: {
      language: 'Taal',
      globalIntensity: 'Intensiteit vir alle effekte',
      gmPreviewHint:
        'Wanneer dit aan is, loop effekte ook op die bladsy waarna elke SL kyk, selfs sonder spelers daar.',
      maxSpawnsHint:
        'Effekte word uitgedun op ’n bladsy wat vir meer vra. Roll20 bly glad tot omtrent 60.',
    },
    status: {
      livePages: 'Aktiewe bladsye',
      effects: 'Effekte',
      running: 'Loop',
      globalPause: 'Almal onderbreek',
      on: 'Aan',
      off: 'Af',
      pausedState: 'Onderbreek',
      waiting: 'Nie op ’n aktiewe bladsy nie',
      noFx: 'Geen effek gekies nie',
      broken: 'Kan nie loop nie',
      nullAreas: 'Effekvrye gebiede',
      noEffects:
        'Nog geen effekte nie. Kies ’n token en tik !pagefx create, of maak die kieslys oop met !pagefx.',
      gmPreview: 'SL-bladsyvoorskou',
      intensity: 'Intensiteit',
      maxSpawns: 'Maks. verskynings per sekonde, per bladsy',
    },
    help: {
      menu: 'Maak die kieslys oop: die effekte op jou bladsy, en knoppies vir alles anders.',
      create:
        'Maak die gekose tokens effekte. Hulle Aura 1 is die gebied; een word bygevoeg as hulle nie een het nie.',
      edit: 'Wys die infokaart van elke gekose effek, met knoppies om dit te verander.',
      preset:
        'Gee die gekose tokens ’n voorinstelling, en maak hulle eers effekte as dit nodig is.',
      presets: 'Lys die voorinstellings, per pak.',
      switches:
        'Skakel die gekose effekte aan of af, of onderbreek en hervat hulle. As niks gekies is nie, begin on en resume alles weer, en hou off en pause alles stil (soos !pageFX on en off in weergawe 1 gedoen het).',
      fire: 'Laat die gekose effekte nou verskyn, een keer of ’n paar keer, om hulle uit te toets.',
      fx: 'Stel wat ’n laag laat verskyn: ’n ingeboude effek soos burn-fire, die naam van ’n gestoorde eie FX, of ’n eie FX-definisie in JSON.',
      interval:
        'Stel die tyd tussen ’n laag se verskynings, in millisekondes. Elke wagtyd word lukraak tussen die twee gekies.',
      direction:
        'Vir straalagtige effekte, stel waar elke verskyning eindig: lukraak, of ’n aantal selle regs en af van waar dit begin.',
      area: 'Stel die gebied: die radius van die token se Aura 1 in bladsy-eenhede, en sy vorm.',
      intensity:
        'Vermenigvuldig hoe gereeld die gekose effekte verskyn (0,1 tot 5). Met global verander dit vir elke effek.',
      name: 'Hernoem die gekose effekte.',
      layer: 'Voeg ’n laag by, sodat een effek verskeie dinge laat verskyn, of verwyder een.',
      triggerAdd:
        'Voeg ’n sneller by: by round, turn, enter of leave word start, stop, toggle, fire of burst uitgevoer. Opsies: every=2, round=3, count=5, who=players|all|named, names=A;B, area=selected, once.',
      triggerRemove: 'Verwyder een sneller, of almal, van die gekose effekte.',
      null: 'Maak die gekose tokens effekvrye gebiede, waar nooit ’n effek verskyn nie, of maak dit weer ongedaan.',
      delete: 'Haal die effek van die gekose tokens af. Die tokens bly op die kaart.',
      status: 'Lys elke effek, sy bladsy, en of dit loop.',
      settings: 'Wys die instellings.',
      set: 'Verander ’n instelling: language, gmPagePreview, intensity of maxSpawnsPerSecond.',
      rescan:
        'Neem nuwe tokens met die naam PageFX of NullFX oor, en vergeet effekte waarvan die tokens geskrap is.',
      journal: 'Herbou die uitdeelstukke Help en Command Deck.',
      help: 'Wys hierdie lys.',
      handout:
        'Volledige instruksies is in die uitdeelstuk “{help}”; knoppies met een klik is in “{deck}”.',
    },
    deck: {
      menuTitle: 'Kieslys',
      menuDesc: 'Die hoofkieslys lys die effekte op jou bladsy. Status lys hulle almal.',
      newTitle: 'Nuut',
      newDesc:
        'Kies eers een of meer tokens op die kaart. Hulle Aura 1 word die gebied wat die effek vul.',
      selectedTitle: 'Gekose effekte',
      selectedDesc: 'Kies effek-tokens op die kaart en klik dan op ’n knoppie.',
      allTitle: 'Alles',
      allDesc: 'Hou elke effek stil, of begin hulle almal weer.',
      toolsTitle: 'Gereedskap',
      toolsDesc: 'Tel gekopieerde of geskrapte tokens op, en herbou hierdie uitdeelstukke.',
      footer: 'Sien die uitdeelstuk “{help}” vir volledige instruksies.',
    },
    handout: {
      versionLabel: 'Weergawe',
      subtitle: 'Weer- en atmosfeereffekte vir Roll20-kaarte',
      footer: 'Gebruik die uitdeelstuk “{deck}” vir beheer met een klik.',
      overview: {
        heading: 'Oorsig',
        body: 'PageFX vul ’n gebied van die kaart met effekte wat aanhou: reën, sneeu, gloeiende kole, stoom, vuurvliegies en meer. ’n Token merk elke effek se plek, en sy Aura 1 is die gebied. Effekte loop op elke bladsy waar spelers is, ook bladsye waarheen ’n verdeelde groep gestuur is, en hou op wanneer die spelers weggaan. Alles word in kletskieslyste gestel, en snellers kan effekte begin of stop soos gevegsrondtes verbygaan of tokens beweeg.',
        demo: 'Kyk na ’n kort demo (van weergawe 1)',
      },
      quickStart: {
        heading: 'Vinnige begin',
        steps: [
          'Sit ’n token waar die effek moet wees (op die SL-laag bly dit vir spelers versteek) en kies dit.',
          'Tik !pagefx presets, of maak die Command Deck oop en klik op Voorinstellings, en klik dan op ’n voorinstelling soos Swaar reën.',
          'Verander die grootte van die token se Aura 1 om die gebied te stel wat die effek vul. Die aura is vir spelers versteek.',
          'Skuif die spelers na die bladsy. Die effek begin, en hou weer op wanneer hulle weggaan.',
          'Tik !pagefx om die kieslys oop te maak, en klik op Wysig by ’n effek om dit te verander.',
        ],
      },
      effects: {
        heading: 'Effekte',
        points: [
          '’n Effek is ’n token plus instellings wat PageFX hou. Skuif die token om die effek te skuif, en verander sy Aura 1 om die gebied te verander. As jy die token skrap, word die effek ook geskrap.',
          'Elke effek het een of meer lae. Elke laag laat telkens weer een ding verskyn, met ’n lukrake wagtyd tussen sy kortste en langste tyd.',
          '’n Laag kan ’n ingeboude Roll20-effek laat verskyn (soort en kleur, soos burn-fire), ’n eie FX wat in die speletjie gestoor is, of ’n eie FX-definisie wat as JSON geplak is. Waardes wat in ’n definisie ontbreek, word ingevul, sodat selfs ’n kort definisie iets teken.',
          'Straalagtige effekte (beam, breath, splatter, en eie FX met angle -1) word tussen twee punte geteken. Hulle rigting is lukraak, of ’n vaste aantal selle regs en af.',
          'Intensiteit vermenigvuldig hoe gereeld ’n effek verskyn. Die instelling intensity vermenigvuldig elke effek.',
          'Af stop ’n effek totdat dit aangeskakel word. Onderbreek hou dit stil totdat dit hervat word. Onderbreek almal hou elke effek stil sonder om hulle te verander.',
          'Jumpgate teken eie FX-definisies in wit tensy hulle as eie FX gestoor is, daarom stoor PageFX sy eie as eie FX met die naam “PageFX: …”. Hulle word verwyder wanneer geen effek hulle gebruik nie. Los hulle net so.',
        ],
      },
      pages: {
        heading: 'Op watter bladsye effekte loop',
        points: [
          'Effekte loop op die bladsy met die spelerslint en op elke bladsy waarheen ’n speler apart geskuif is.',
          'Skakel SL-bladsyvoorskou aan om effekte ook te laat loop op die bladsy waarna elke SL kyk, sodat jy hulle sonder spelers kan uittoets.',
          'Elke bladsy kry hoogstens Maks. verskynings per sekonde (30 by verstek). As effekte vir meer vra, word sommige verskynings oorgeslaan, en die SL word een keer laat weet.',
          'Wanneer ’n ander Mod die spelerslint skuif of die groep verdeel, sê Roll20 vir niemand nie, daarom kyk PageFX elke paar sekondes en haal dit in.',
        ],
      },
      presets: {
        heading: 'Voorinstellings',
        intro:
          '’n Voorinstelling gee ’n effek ’n stel klaargemaakte lae. As jy daarna ’n laag verander, word die effek jou eie. Ander Mods kan voorinstellings byvoeg met PageFX.registerPreset.',
        colPack: 'Pak',
        colPresets: 'Voorinstellings (naam en ID)',
      },
      triggers: {
        heading: 'Snellers',
        intro:
          '’n Sneller begin, stop, skakel of vuur ’n effek af wanneer iets gebeur. Voeg hulle by op die effek se infokaart, of met !pagefx trigger add.',
        points: [
          'Elke rondte: Roll20 hou nie ’n rondtenommer by nie, dus begin ’n rondte wanneer die beurtvolgorde van sy laaste inskrywing terug na bo gaan. As daar ’n eie inskrywing in die beurtvolgorde met die naam “Round” is, word dit eerder gebruik. Kies elke soveel rondtes, of een rondte. Die eerste rondte van ’n geveg tel nie as ’n wisseling nie.',
          'Op ’n beurt: wanneer ’n gekose token bo-aan die beurtvolgorde kom. Kies die token op die kaart voordat jy op die knoppie klik.',
          'Token kom in of gaan uit: wanneer ’n token in of uit die effek se gebied beweeg, of die Aura 1 van ’n ander token wat jy kies. By verstek tel net tokens wat ’n speler beheer; kies enige token, of gee name.',
          '“Vuur ’n sarsie af” laat die effek ’n paar keer gelyk verskyn. Met “Net die eerste keer” gaan ’n sneller net een keer af.',
          'Roll20 vertel Mods niks wanneer ’n ander Mod ’n token skuif nie. Mods wat tokens skuif, kan daarna PageFX.checkToken(token) roep.',
        ],
      },
      nullAreas: {
        heading: 'Effekvrye gebiede',
        points: [
          '’n Effekvrye gebied is ’n token waar nooit ’n effek verskyn nie, soos die binnekant van ’n huis in ’n storm. Sy gebied is die token en sy Aura 1.',
          'Kies die token en klik op Effekvrye gebied in die kieslys of die Command Deck. Tokens met die naam NullFX is, soos in weergawe 1, ook effekvrye gebiede.',
        ],
      },
      commands: {
        heading: 'Opdragte',
        intro:
          'Net SL’e kan hierdie opdragte gebruik. Hulle werk op die gekose tokens, of op die tokens wat met --ids gegee is. Laagopdragte werk op laag 1 tensy --layer iets anders sê. Ander Mods kan hulle ook stuur; antwoorde gaan na die SL.',
        colCommand: 'Opdrag',
        colDesc: 'Wat dit doen',
      },
      settings: {
        heading: 'Instellings',
        intro:
          'Verander instellings op die infokaart Instellings, of met !pagefx set. Die taal kan ook op die Mod se instellingsbladsy gestel word.',
        colKey: 'Instelling',
        colDesc: 'Wat dit doen',
        rows: {
          language: 'Die taal van PageFX se kieslyste, boodskappe en uitdeelstukke.',
          gmPagePreview: 'Laat effekte ook loop op die bladsy waarna elke SL kyk (by verstek af).',
          intensity: 'Vermenigvuldig hoe gereeld elke effek verskyn (1 by verstek).',
          maxSpawnsPerSecond:
            'Die meeste verskynings op een bladsy elke sekonde, 1 tot 60 (30 by verstek).',
        },
      },
      api: {
        heading: 'Vir ander Mods',
        intro:
          'PageFX publiseer ’n PageFX-objek. Waar ’n funksie ’n token neem, werk die token se ID ook.',
        colFunction: 'Funksie',
        colDesc: 'Wat dit doen',
        rows: {
          activateAll: 'Hervat elke effek (weergawe 1).',
          deactivateAll: 'Onderbreek elke effek (weergawe 1).',
          activate: 'Skakel een effek aan, af, of andersom (weergawe 1).',
          start: 'Skakel een effek aan of af, of onderbreek en hervat dit.',
          setIntensity: 'Verander een effek se intensiteit.',
          fire: 'Laat een effek nou verskyn.',
          create:
            'Maak ’n token ’n effek, met die opsies name, fx, interval, direction en intensity; of haal dit af.',
          getEffect: 'Lees ’n effek, lys die effekte (op een bladsy), of vra of een loop.',
          registerPreset: 'Voeg ’n voorinstelling vir hierdie sessie by, of lys hulle.',
          checkToken: 'Toets ’n token wat jou Mod geskuif het teen die in- en uitgaansnellers.',
        },
      },
      upgrading: {
        heading: 'Opgradering van weergawe 1',
        points: [
          'Tokens met die naam PageFX en NullFX word met die eerste begin oorgeneem en werk soos voorheen.',
          'Totdat jy ’n effek in die klets verander, word dit steeds deur sy token se SL-notas (“GM Notes”), Bar 1 (tyd tussen verskynings) en Bar 2 (straalrigting) beheer, en die statusmerker interdiction skakel dit steeds af. Sodra jy dit in die klets verander, is die SL-notas en stawe weer joune.',
          'Weergawe 1 het effekte net op die spelerslintbladsy geteken, en gestoorde eie FX twee keer laat verskyn. Albei is reggestel.',
          'Die opdragte van weergawe 1 werk steeds:',
        ],
        colV1: 'Opdrag in weergawe 1',
        colV2: 'Dieselfde as',
      },
      troubleshooting: {
        heading: 'Probleemoplossing',
        points: [
          '’n Effek loop nie: maak sy infokaart oop. Die reël Toestand sê hoekom: af, onderbreek, geen effek gekies nie, kan nie loop nie (met die rede), of nie op ’n aktiewe bladsy nie (geen spelers daar nie; skakel SL-bladsyvoorskou aan om dit uit te toets).',
          'Jy sien niks: baie klein of kortstondige deeltjies is moeilik om op ’n besige kaart te sien. Probeer ’n voorinstelling, verhoog die intensiteit, of maak die gebied kleiner.',
          'Effekte lyk yl: die bladsy is dalk by Maks. verskynings per sekonde. Verlaag ’n paar intensiteite, of verhoog die limiet.',
          'Effekte het opgehou nadat ’n bladsy of speletjie gekopieer is: gebruik Soek weer.',
          'Vir enigiets anders: kyk in die API-konsole se log en sluit sy boodskappe in wanneer jy om hulp vra.',
        ],
      },
      languages: {
        heading: 'Tale',
        body: 'Kies ’n taal op die infokaart Instellings, of met !pagefx set language. Beskikbare tale:',
        colLanguage: 'Taal',
        colNative: 'Eie naam',
        colCode: 'Kode',
      },
      credits: {
        heading: 'Erkennings',
        original: 'Oorspronklike Mod deur',
        maintainer: 'Weergawe 2 onderhou deur',
        marketplace: 'Ada se kunspakke op die Roll20 Marketplace',
        support:
          'As jy ’n fout vind of ’n idee het, plaas dit op die Roll20 Mod-forum of open ’n issue op GitHub, en sluit enige boodskappe uit die API-konsole se log in.',
      },
    },
    triggers: {
      line: '{when}: {action}',
      eachRound: 'Elke nuwe rondte',
      everyRounds: 'Elke {n} rondtes',
      onRound: 'In rondte {n}',
      turn: 'Wanneer {name} se beurt begin',
      enter: 'Wanneer {who} {area} binnegaan',
      leave: 'Wanneer {who} {area} verlaat',
      areaSelf: 'hierdie effek se gebied',
      areaSelected: 'die gekose token se aura',
      areaOf: 'die aura van {name}',
      unnamed: '’n token',
      once: '(net die eerste keer)',
      onceUsed: '(net die eerste keer, reeds gebruik)',
      who: {
        players: '’n spelertoken',
        all: 'enige token',
      },
      action: {
        start: 'begin dit',
        stop: 'stop dit',
        toggle: 'skakel dit aan of af',
        fire: 'vuur dit een keer af',
        burst: 'vuur ’n sarsie van {count} af',
      },
      choice: {
        start: 'Begin',
        stop: 'Stop',
        toggle: 'Skakel aan of af',
        fire: 'Vuur een keer af',
        burst: 'Vuur ’n sarsie af',
      },
    },
    packs: {
      weather: 'Weer',
      fire: 'Vuur en hitte',
      water: 'Water',
      magic: 'Magie en grillerig',
      custom: 'Van ander Mods',
    },
    presets: {
      'light-rain': 'Ligte reën',
      'heavy-rain': 'Swaar reën',
      thunderstorm: 'Donderstorm',
      snow: 'Sneeu',
      blizzard: 'Sneeustorm',
      hail: 'Hael',
      sandstorm: 'Sandstorm',
      fog: 'Misslierte',
      embers: 'Gloeiende kole',
      ash: 'Vallende as',
      magma: 'Borrelende magma',
      'lava-spurts': 'Lawaspatsels',
      sparks: 'Vonke',
      drips: 'Grotdruppels',
      steam: 'Stoomopeninge',
      geyser: 'Geiser',
      spray: 'Watervalsproei',
      bubbles: 'Borrels',
      fireflies: 'Vuurvliegies',
      'arcane-motes': 'Arkane ligkolletjies',
      'necrotic-mist': 'Nekrotiese mis',
      'holy-glimmer': 'Heilige glans',
      'swamp-gas': 'Moerasgas',
    },
    fx: {
      empty: 'geen effek is gestel nie.',
      badJson: 'die eie FX-definisie is nie geldige JSON nie.',
      unknownColour: 'daar is geen ingeboude kleur “{colour}” nie. Kleure: {colours}.',
      savedMissing: 'daar is geen gestoorde eie FX met die naam “{name}” nie.',
      cannotCreate: 'Roll20 wou nie ’n eie FX-objek daarvoor skep nie.',
      spawnFailed: 'Roll20 wou dit nie laat verskyn nie ({message}).',
    },
    errors: {
      unknownCommand: 'Onbekende opdrag: {command}',
      noEffects: 'Kies een of meer PageFX-tokens, of gee hulle ID’s met --ids.',
      selectToken: 'Kies eers een of meer tokens, of gee hulle ID’s met --ids.',
      unknownIds: 'Hierdie is nie PageFX-effekte nie: {ids}',
      badSetting: 'Onbekende instelling of waarde: {setting} {value}',
      noLayer: '“{name}” het geen laag {n} nie.',
      tooManyLayers: '’n Effek kan hoogstens {max} lae hê.',
      layerUsage: 'Gebruik !pagefx layer add [effect] of !pagefx layer remove <number>.',
      nullUsage: 'Gebruik !pagefx null create of !pagefx null remove.',
      isEffect: '“{name}” is ’n effek, dus kan dit nie ook ’n effekvrye gebied wees nie.',
      badInterval: 'Gee die tyd tussen verskynings in ms, byvoorbeeld: !pagefx interval 500 1500',
      badDirection: 'Gee random, of selle regs en af, byvoorbeeld: !pagefx direction 2 -1',
      badArea:
        'Gee ’n radius in bladsy-eenhede, en circle of square, byvoorbeeld: !pagefx area 15 circle',
      badIntensity: 'Gee ’n intensiteit bo 0, byvoorbeeld: !pagefx intensity 1.5',
      noName: 'Gee ’n naam, byvoorbeeld: !pagefx name Reën oor die hawe',
      triggerUsage:
        'Gebruik !pagefx trigger add <round|turn|enter|leave> <start|stop|toggle|fire|burst> [every=2] [round=3] [count=5] [who=players|all|named] [names=A;B] [area=self|selected] [once], of !pagefx trigger remove <number>.',
      triggerToken:
        'Kies eers die token op die kaart waaroor hierdie sneller gaan, of gee token=<id>.',
      triggerNames: 'Gee die tokenname met names=, geskei deur ; (byvoorbeeld names=Goblin;Orc).',
      tooManyTriggers: '’n Effek kan hoogstens {max} snellers hê.',
      noTrigger: '“{name}” het geen sneller {n} nie.',
      journalUsage: 'Gebruik !pagefx journal rebuild.',
      unknownPreset:
        'Daar is geen voorinstelling “{id}” nie. Tik !pagefx presets om hulle te sien.',
      unexpected: 'Iets het verkeerd geloop: {message}',
    },
  };

  const TRANSLATION$b = {
    titles: {
      ready: 'PageFX està a punt.',
      menu: 'PageFX',
      status: 'Estat de PageFX',
      settings: 'Configuració de PageFX',
      presets: 'Predefinits de PageFX',
      help: 'Ordres de PageFX',
      effect: 'Efecte: {name}',
    },
    messages: {
      readyHint: 'Escriu !pagefx per obrir el menú.',
      adopted:
        'S’han adoptat {effects} efecte(s) i {nulls} àrea(es) sense efectes de fitxes de PageFX 1.x. Continuen funcionant com abans.',
      rescanned:
        'La nova exploració ha trobat {effects} efecte(s) nou(s) i {nulls} àrea(es) sense efectes nova(es), i n’ha oblidat {dropped} les fitxes dels quals s’han esborrat.',
      allPaused: 'Tots els efectes estan en pausa. Fes servir !pagefx resume per reprendre’ls.',
      allResumed: 'Els efectes tornen a funcionar.',
      turnedOn: 'Activats: {count}.',
      turnedOff: 'Desactivats: {count}.',
      toggled: 'Activats o desactivats: {count}.',
      paused: 'En pausa: {count}.',
      resumed: 'Represos: {count}.',
      fired: 'S’han generat {count} efecte(s).',
      created: 'Efectes nous: {count}. Tria a la targeta de cadascun què genera.',
      deleted: 'Efectes eliminats: {count}. Les seves fitxes continuen al mapa.',
      renamed: 'Reanomenats: {count}.',
      fxSet: 'Efecte canviat: {count}.',
      intervalSet: 'Temps canviat: {count}.',
      directionSet: 'Direcció canviada: {count}.',
      areaSet: 'Àrea canviada: {count}.',
      intensitySet: 'Intensitat canviada: {count}.',
      layerAdded: 'Capa afegida: {count}.',
      layerRemoved: 'Capa eliminada: {count}.',
      nullCreated: 'Àrees sense efectes noves: {count}.',
      nullRemoved: 'Àrees sense efectes eliminades: {count}.',
      presetApplied: '{name} aplicat: {count}.',
      journalRebuilt: 'S’han reconstruït els documents «{help}» i «{deck}».',
      triggerAdded: 'Activador afegit: {count}.',
      triggerRemoved: 'Activador eliminat: {count}.',
      triggersCleared: 'Activadors eliminats de {count} efecte(s).',
      throttled:
        'Els efectes de la pàgina «{page}» s’estan reduint: demanaven més de {max} aparicions per segon. Abaixa’n la intensitat, o apuja el límit amb !pagefx set maxSpawnsPerSecond.',
      settingChanged: '{setting} ara és {value}.',
      problem: 'L’efecte «{name}» no pot funcionar: {reason}',
    },
    menu: {
      page: 'Pàgina',
      live: 'aquí funcionen els efectes',
      notLive: 'no hi ha jugadors aquí',
      allPausedNote: 'Tots els efectes estan en pausa.',
      effectsHere: 'Efectes en aquesta pàgina',
      noEffectsHere: 'Encara no hi ha efectes en aquesta pàgina.',
      otherPages: 'Altres pàgines',
      effectCount: '{count} efecte(s)',
      actions: 'Nou',
      selectHint:
        'Primer selecciona una fitxa al mapa i després prem Efecte nou o Àrea sense efectes. La fitxa marca on apareix l’efecte; la seva «Aura 1» és l’àrea.',
      state: 'Estat',
      area: 'Àrea',
      areaValue: '{radius} {units} més enllà de la fitxa, {shape}',
      circle: 'cercle',
      square: 'quadrat',
      circleOption: 'Cercle',
      squareOption: 'Quadrat',
      layers: 'Capes',
      layer: 'Capa {n}',
      noLayers: 'No hi ha capes. Afegeix-ne una per triar què genera aquest efecte.',
      noFxSet: 'sense definir',
      timing: 'cada {min}–{max} ms',
      directionRandom: 'direcció aleatòria',
      directionOffset: 'acaba a {dx}, {dy} caselles',
      v1Note:
        'Aquest efecte encara segueix les «GM Notes» i les barres de la seva fitxa, com a PageFX 1.x. Si el canvies aquí, deixarà de fer-ho.',
      preset: 'Predefinit',
      presetsHint:
        'Selecciona una o més fitxes al mapa i després prem un predefinit. Les fitxes que encara no són efectes ho passen a ser, i la seva «Aura 1» és l’àrea que omple el predefinit.',
      triggers: 'Activadors',
      noTriggers:
        'Sense activadors: l’efecte funciona sempre que hi hagi jugadors a la seva pàgina.',
      triggerHint:
        'Per a un activador de torn, o una àrea d’una altra fitxa, primer selecciona aquella fitxa al mapa.',
      yes: 'Sí',
      no: 'No',
    },
    buttons: {
      edit: 'Edita',
      show: 'Mostra',
      turnOn: 'Activa',
      turnOff: 'Desactiva',
      pause: 'Pausa',
      resume: 'Reprèn',
      fire: 'Dispara',
      pauseAll: 'Posa-ho tot en pausa',
      resumeAll: 'Reprèn-ho tot',
      create: 'Efecte nou',
      createNull: 'Àrea sense efectes',
      removeNull: 'Treu l’àrea sense efectes',
      settings: 'Configuració',
      status: 'Estat',
      rescan: 'Torna a explorar',
      rename: 'Reanomena',
      area: 'Àrea',
      intensity: 'Intensitat',
      builtin: 'FX integrats',
      saved: 'FX desats',
      json: 'JSON personalitzat',
      timing: 'Temps',
      random: 'Direcció aleatòria',
      offset: 'Fixa la direcció',
      addLayer: 'Afegeix una capa',
      removeLayer: 'Treu una capa',
      delete: 'Esborra l’efecte',
      preset: 'Predefinit',
      presets: 'Predefinits',
      remove: 'Treu',
      help: 'Ajuda',
      rebuild: 'Reconstrueix els documents',
      onRound: 'Cada assalt',
      onTurn: 'En un torn',
      onEnter: 'Una fitxa entra',
      onLeave: 'Una fitxa surt',
      menu: 'Menú',
      change: 'Canvia',
    },
    prompts: {
      type: 'Tipus d’efecte',
      colour: 'Color',
      saved: 'FX personalitzat desat',
      json: 'Definició de l’FX personalitzat (JSON)',
      intervalMin: 'Temps mínim entre aparicions (ms)',
      intervalMax: 'Temps màxim entre aparicions (ms)',
      dx: 'Caselles en horitzontal fins al final (negatiu = esquerra)',
      dy: 'Caselles en vertical fins al final (negatiu = amunt)',
      name: 'Nom de l’efecte',
      radius: 'Radi de l’àrea més enllà de la fitxa (unitats de la pàgina)',
      shape: 'Forma de l’àrea',
      intensity: 'Intensitat (de {min} a {max})',
      maxSpawns: 'Aparicions per segon en una pàgina (d’1 a {max})',
      preset: 'Predefinit',
      then: 'Aleshores',
      every: 'Cada quants assalts',
      who: 'Quines fitxes compten',
      area: 'Quina àrea',
      once: 'Només la primera vegada?',
      confirmDelete: 'Vols esborrar aquest efecte? La fitxa es queda al mapa.',
    },
    settings: {
      language: 'Idioma',
      globalIntensity: 'Intensitat de tots els efectes',
      gmPreviewHint:
        'Si està activat, els efectes també funcionen a la pàgina que mira cada DJ, encara que no hi hagi jugadors.',
      maxSpawnsHint:
        'Els efectes es redueixen a les pàgines que en demanen més. Roll20 va fluid fins a uns 60.',
    },
    status: {
      livePages: 'Pàgines actives',
      effects: 'Efectes',
      running: 'En marxa',
      globalPause: 'Tot en pausa',
      on: 'Activat',
      off: 'Desactivat',
      pausedState: 'En pausa',
      waiting: 'No és en una pàgina activa',
      noFx: 'Cap efecte triat',
      broken: 'No pot funcionar',
      nullAreas: 'Àrees sense efectes',
      noEffects:
        'Encara no hi ha efectes. Selecciona una fitxa i escriu !pagefx create, o obre el menú amb !pagefx.',
      gmPreview: 'Previsualització de la pàgina del DJ',
      intensity: 'Intensitat',
      maxSpawns: 'Màxim d’aparicions per segon i per pàgina',
    },
    help: {
      menu: 'Obre el menú: els efectes de la teva pàgina i botons per a tota la resta.',
      create:
        'Converteix les fitxes seleccionades en efectes. La seva «Aura 1» és l’àrea; se n’afegeix una si no en tenen.',
      edit: 'Mostra la targeta de cada efecte seleccionat, amb botons per canviar-lo.',
      preset:
        'Aplica un predefinit a les fitxes seleccionades, i les converteix abans en efectes si cal.',
      presets: 'Llista els predefinits, per paquet.',
      switches:
        'Activa o desactiva els efectes seleccionats, o els posa en pausa i els reprèn. Sense res seleccionat, on i resume ho tornen a engegar tot, i off i pause ho aturen tot (com feien !pageFX on i off a la versió 1).',
      fire: 'Genera ara els efectes seleccionats, una o unes quantes vegades, per provar-los.',
      fx: 'Defineix què genera una capa: un efecte integrat com burn-fire, el nom d’un FX personalitzat desat, o una definició d’FX personalitzat en JSON.',
      interval:
        'Defineix el temps entre aparicions d’una capa, en mil·lisegons. Cada espera es tria entre els dos valors.',
      direction:
        'Per als efectes de raig, defineix on acaba cada aparició: a l’atzar, o a un nombre de caselles en horitzontal i en vertical des d’on comença.',
      area: 'Defineix l’àrea: el radi de l’«Aura 1» de la fitxa en unitats de la pàgina, i la seva forma.',
      intensity:
        'Multiplica la freqüència amb què generen els efectes seleccionats (de 0.1 a 5). Amb global, la canvia per a tots els efectes.',
      name: 'Reanomena els efectes seleccionats.',
      layer: 'Afegeix una capa, perquè un efecte generi diverses coses, o en treu una.',
      triggerAdd:
        'Afegeix un activador: amb round, turn, enter o leave, fes start, stop, toggle, fire o burst. Opcions: every=2, round=3, count=5, who=players|all|named, names=A;B, area=selected, once.',
      triggerRemove: 'Treu un activador, o tots, dels efectes seleccionats.',
      null: 'Converteix les fitxes seleccionades en àrees sense efectes, on mai no apareix cap efecte, o fa que deixin de ser-ho.',
      delete: 'Treu l’efecte de les fitxes seleccionades. Les fitxes es queden al mapa.',
      status: 'Llista tots els efectes, la seva pàgina i si estan en marxa.',
      settings: 'Mostra la configuració.',
      set: 'Canvia un paràmetre: language, gmPagePreview, intensity o maxSpawnsPerSecond.',
      rescan:
        'Adopta les fitxes noves anomenades PageFX o NullFX, i oblida els efectes les fitxes dels quals s’han esborrat.',
      journal: 'Reconstrueix els documents d’ajuda i Command Deck.',
      help: 'Mostra aquesta llista.',
      handout:
        'Les instruccions completes són al document «{help}»; els botons d’un sol clic són a «{deck}».',
    },
    deck: {
      menuTitle: 'Menú',
      menuDesc: 'El menú principal llista els efectes de la teva pàgina. Estat els llista tots.',
      newTitle: 'Nou',
      newDesc:
        'Primer selecciona una o més fitxes al mapa. La seva «Aura 1» passa a ser l’àrea que omple l’efecte.',
      selectedTitle: 'Efectes seleccionats',
      selectedDesc: 'Selecciona fitxes d’efecte al mapa i després prem un botó.',
      allTitle: 'Tot',
      allDesc: 'Atura tots els efectes, o torna’ls a engegar tots.',
      toolsTitle: 'Eines',
      toolsDesc: 'Recupera fitxes copiades o esborrades, i reconstrueix aquests documents.',
      footer: 'Consulta el document «{help}» per a les instruccions completes.',
    },
    handout: {
      versionLabel: 'Versió',
      subtitle: 'Efectes meteorològics i ambientals per als mapes de Roll20',
      footer: 'Fes servir el document «{deck}» per als controls d’un sol clic.',
      overview: {
        heading: 'Visió general',
        body: 'PageFX omple una àrea del mapa amb efectes continus: pluja, neu, brases, vapor, cuques de llum i molt més. Una fitxa marca el lloc de cada efecte, i la seva «Aura 1» és l’àrea. Els efectes funcionen a totes les pàgines on hi ha jugadors, incloses les pàgines on s’ha enviat part d’un grup dividit, i s’aturen quan els jugadors se’n van. Tot es configura des de menús al xat, i els activadors poden engegar o aturar efectes a mesura que passen els assalts de combat o es mouen les fitxes.',
        demo: 'Mira una demostració breu (de la versió 1)',
      },
      quickStart: {
        heading: 'Inici ràpid',
        steps: [
          'Posa una fitxa on ha d’anar l’efecte (la capa del DJ l’amaga als jugadors) i selecciona-la.',
          'Escriu !pagefx presets, o obre el Command Deck i fes clic a Predefinits, i després fes clic a un predefinit com Pluja intensa.',
          'Canvia la mida de l’«Aura 1» de la fitxa per definir l’àrea que omple l’efecte. L’aura queda amagada als jugadors.',
          'Mou els jugadors a la pàgina. L’efecte s’engega, i s’atura de nou quan se’n van.',
          'Escriu !pagefx per obrir el menú, i fes clic a Edita en un efecte per canviar-lo.',
        ],
      },
      effects: {
        heading: 'Efectes',
        points: [
          'Un efecte és una fitxa més uns paràmetres que guarda PageFX. Mou la fitxa per moure l’efecte, i canvia’n l’«Aura 1» per canviar l’àrea. Si esborres la fitxa, s’esborra l’efecte.',
          'Cada efecte té una o més capes. Cada capa genera una cosa, una vegada i una altra, amb una espera aleatòria entre el seu temps mínim i màxim.',
          'Una capa pot generar un efecte integrat de Roll20 (tipus i color, com burn-fire), un FX personalitzat desat a la partida, o una definició d’FX personalitzat enganxada en JSON. Els valors que falten en una definició s’emplenen, de manera que una definició curta també es dibuixa.',
          'Els efectes de raig (beam, breath, splatter, i els FX personalitzats amb angle -1) es dibuixen entre dos punts. La seva direcció és aleatòria, o un nombre fix de caselles en horitzontal i en vertical.',
          'La intensitat multiplica la freqüència amb què genera un efecte. El paràmetre intensity multiplica tots els efectes.',
          'Desactivar atura un efecte fins que es torna a activar. La pausa el reté fins que es reprèn. Posar-ho tot en pausa reté tots els efectes sense canviar-los.',
          'Jumpgate dibuixa en blanc les definicions d’FX personalitzat tret que estiguin desades com a FX personalitzats, així que PageFX desa les seves com a FX personalitzats anomenats «PageFX: …». S’eliminen quan cap efecte no els fa servir. Deixa’ls on són.',
        ],
      },
      pages: {
        heading: 'Quines pàgines funcionen',
        points: [
          'Els efectes funcionen a la pàgina amb la cinta dels jugadors i a totes les pàgines on s’ha mogut un jugador pel seu compte.',
          'Activa Previsualització de la pàgina del DJ perquè els efectes també funcionin a la pàgina que mira cada DJ, per provar-los sense jugadors.',
          'Cada pàgina rep com a màxim el Màxim d’aparicions per segon (30 per defecte). Si els efectes en demanen més, se salten algunes aparicions, i s’avisa el DJ una vegada.',
          'Quan un altre Mod mou la cinta o divideix el grup, Roll20 no avisa ningú, així que PageFX ho comprova cada pocs segons i es posa al dia.',
        ],
      },
      presets: {
        heading: 'Predefinits',
        intro:
          'Un predefinit dona a un efecte un conjunt de capes ja fetes. Si després canvies una capa, l’efecte passa a ser teu. Altres Mods poden afegir predefinits amb PageFX.registerPreset.',
        colPack: 'Paquet',
        colPresets: 'Predefinits (nom i ID)',
      },
      triggers: {
        heading: 'Activadors',
        intro:
          'Un activador engega, atura, commuta o dispara un efecte quan passa alguna cosa. Afegeix-los des de la targeta de l’efecte, o amb !pagefx trigger add.',
        points: [
          'Cada assalt: Roll20 no porta cap número d’assalt, així que un assalt comença quan l’ordre de torns passa de l’última entrada a la primera. Si hi ha una entrada personalitzada anomenada «Round» a l’ordre de torns, es fa servir aquesta. Tria cada tants assalts, o un assalt concret. El primer assalt d’un combat no compta com a canvi.',
          'En un torn: quan una fitxa triada arriba al capdamunt de l’ordre de torns. Selecciona la fitxa al mapa abans de fer clic al botó.',
          'Una fitxa entra o surt: quan una fitxa entra o surt de l’àrea de l’efecte, o de l’«Aura 1» d’una altra fitxa que seleccionis. Per defecte només compten les fitxes que controla un jugador; tria qualsevol fitxa, o indica noms.',
          'Disparar una ràfega genera l’efecte diverses vegades alhora. Només la primera vegada fa que un activador només es dispari una vegada.',
          'Roll20 no diu res als Mods quan un altre Mod mou una fitxa. Els Mods que mouen fitxes poden cridar PageFX.checkToken(token) després.',
        ],
      },
      nullAreas: {
        heading: 'Àrees sense efectes',
        points: [
          'Una àrea sense efectes és una fitxa on mai no apareix cap efecte, com l’interior d’una casa durant una tempesta. La seva àrea és la fitxa i la seva «Aura 1».',
          'Selecciona la fitxa i fes clic a Àrea sense efectes al menú o al Command Deck. Les fitxes anomenades NullFX, com a la versió 1, també són àrees sense efectes.',
        ],
      },
      commands: {
        heading: 'Ordres',
        intro:
          'Només els DJ poden fer servir aquestes ordres. Actuen sobre les fitxes seleccionades, o sobre les fitxes indicades amb --ids. Les ordres de capa actuen sobre la capa 1 tret que --layer digui una altra cosa. Altres Mods també les poden enviar; les respostes van al DJ.',
        colCommand: 'Ordre',
        colDesc: 'Què fa',
      },
      settings: {
        heading: 'Configuració',
        intro:
          'Canvia la configuració des de la targeta Configuració, o amb !pagefx set. L’idioma també es pot triar a la pàgina de configuració del Mod.',
        colKey: 'Paràmetre',
        colDesc: 'Què fa',
        rows: {
          language: 'L’idioma dels menús, missatges i documents de PageFX.',
          gmPagePreview:
            'Fa funcionar els efectes també a la pàgina que mira cada DJ (desactivat per defecte).',
          intensity: 'Multiplica la freqüència amb què genera cada efecte (1 per defecte).',
          maxSpawnsPerSecond:
            'El màxim d’aparicions per segon en una pàgina, d’1 a 60 (30 per defecte).',
        },
      },
      api: {
        heading: 'Per a altres Mods',
        intro:
          'PageFX publica un objecte PageFX. Quan una funció rep una fitxa, també serveix l’ID de la fitxa.',
        colFunction: 'Funció',
        colDesc: 'Què fa',
        rows: {
          activateAll: 'Reprèn tots els efectes (versió 1).',
          deactivateAll: 'Posa en pausa tots els efectes (versió 1).',
          activate: 'Activa, desactiva o commuta un efecte (versió 1).',
          start: 'Activa o desactiva un efecte, o el posa en pausa i el reprèn.',
          setIntensity: 'Canvia la intensitat d’un efecte.',
          fire: 'Genera ara un efecte.',
          create:
            'Converteix una fitxa en efecte, amb les opcions name, fx, interval, direction i intensity; o li treu l’efecte.',
          getEffect:
            'Llegeix un efecte, llista els efectes (d’una pàgina), o diu si un efecte està en marxa.',
          registerPreset: 'Afegeix un predefinit per a aquesta sessió, o els llista.',
          checkToken:
            'Comprova una fitxa que el teu Mod ha mogut amb els activadors d’entrada i de sortida.',
        },
      },
      upgrading: {
        heading: 'Actualitzar des de la versió 1',
        points: [
          'Les fitxes anomenades PageFX i NullFX s’adopten en el primer inici i continuen funcionant com abans.',
          'Fins que no canviïs un efecte des del xat, les «GM Notes» de la seva fitxa, «Bar 1» (temps entre aparicions) i «Bar 2» (direcció del raig) encara el controlen, i el marcador de prohibició encara el desactiva. Un cop el canviïs des del xat, les «GM Notes» i les barres tornen a ser teves.',
          'La versió 1 només dibuixava efectes a la pàgina de la cinta dels jugadors, i generava dues vegades els FX personalitzats desats. Totes dues coses estan corregides.',
          'Les ordres de la versió 1 encara funcionen:',
        ],
        colV1: 'Ordre de la versió 1',
        colV2: 'Equival a',
      },
      troubleshooting: {
        heading: 'Resolució de problemes',
        points: [
          'Un efecte no funciona: obre la seva targeta. La línia Estat diu per què: desactivat, en pausa, cap efecte triat, no pot funcionar (amb el motiu), o no és en una pàgina activa (no hi ha jugadors; activa Previsualització de la pàgina del DJ per provar-lo).',
          'No veus res: les partícules molt petites o de curta durada costen de veure en un mapa carregat. Prova un predefinit, apuja la intensitat, o fes l’àrea més petita.',
          'Els efectes es veuen escassos: potser la pàgina ha arribat al Màxim d’aparicions per segon. Abaixa algunes intensitats, o apuja el límit.',
          'Els efectes s’han aturat després de copiar una pàgina o una partida: executa Torna a explorar.',
          'Per a qualsevol altra cosa, consulta el registre de la consola de l’API i inclou-ne els missatges quan demanis ajuda.',
        ],
      },
      languages: {
        heading: 'Idiomes',
        body: 'Tria un idioma des de la targeta Configuració, o amb !pagefx set language. Idiomes disponibles:',
        colLanguage: 'Idioma',
        colNative: 'Nom original',
        colCode: 'Codi',
      },
      credits: {
        heading: 'Crèdits',
        original: 'Mod original de',
        maintainer: 'Versió 2 mantinguda per',
        marketplace: 'Els paquets gràfics de l’Ada al Marketplace de Roll20',
        support:
          'Si trobes un error o tens una idea, publica-ho al fòrum de Mods de Roll20 o obre una incidència a GitHub, i inclou els missatges del registre de la consola de l’API.',
      },
    },
    triggers: {
      line: '{when}: {action}',
      eachRound: 'A cada assalt nou',
      everyRounds: 'Cada {n} assalts',
      onRound: 'A l’assalt {n}',
      turn: 'Quan comença el torn de {name}',
      enter: 'Quan {who} entra a {area}',
      leave: 'Quan {who} surt de {area}',
      areaSelf: 'l’àrea d’aquest efecte',
      areaSelected: 'l’aura de la fitxa seleccionada',
      areaOf: 'l’aura de {name}',
      unnamed: 'una fitxa',
      once: '(només la primera vegada)',
      onceUsed: '(només la primera vegada, ja utilitzat)',
      who: {
        players: 'una fitxa de jugador',
        all: 'qualsevol fitxa',
      },
      action: {
        start: 'engega’l',
        stop: 'atura’l',
        toggle: 'activa’l o desactiva’l',
        fire: 'dispara’l una vegada',
        burst: 'dispara una ràfega de {count}',
      },
      choice: {
        start: 'Engega',
        stop: 'Atura',
        toggle: 'Activa o desactiva',
        fire: 'Dispara una vegada',
        burst: 'Dispara una ràfega',
      },
    },
    packs: {
      weather: 'Temps',
      fire: 'Foc i calor',
      water: 'Aigua',
      magic: 'Màgia i misteri',
      custom: 'D’altres Mods',
    },
    presets: {
      'light-rain': 'Pluja suau',
      'heavy-rain': 'Pluja intensa',
      thunderstorm: 'Tempesta elèctrica',
      snow: 'Neu',
      blizzard: 'Torb',
      hail: 'Calamarsa',
      sandstorm: 'Tempesta de sorra',
      fog: 'Fils de boira',
      embers: 'Brases',
      ash: 'Cendra que cau',
      magma: 'Magma bombollejant',
      'lava-spurts': 'Raigs de lava',
      sparks: 'Espurnes',
      drips: 'Degotall de cova',
      steam: 'Sortides de vapor',
      geyser: 'Guèiser',
      spray: 'Ruixim de cascada',
      bubbles: 'Bombolles',
      fireflies: 'Cuques de llum',
      'arcane-motes': 'Partícules arcanes',
      'necrotic-mist': 'Boira necròtica',
      'holy-glimmer': 'Resplendor sagrada',
      'swamp-gas': 'Gas de pantà',
    },
    fx: {
      empty: 'no hi ha cap efecte definit.',
      badJson: 'la definició de l’FX personalitzat no és JSON vàlid.',
      unknownColour: 'no hi ha cap color integrat «{colour}». Colors: {colours}.',
      savedMissing: 'no hi ha cap FX personalitzat desat anomenat «{name}».',
      cannotCreate: 'Roll20 no ha volgut crear-hi un objecte d’FX personalitzat.',
      spawnFailed: 'Roll20 no l’ha volgut generar ({message}).',
    },
    errors: {
      unknownCommand: 'Ordre desconeguda: {command}',
      noEffects: 'Selecciona una o més fitxes de PageFX, o indica’n els ID amb --ids.',
      selectToken: 'Primer selecciona una o més fitxes, o indica’n els ID amb --ids.',
      unknownIds: 'Aquests no són efectes de PageFX: {ids}',
      badSetting: 'Paràmetre o valor desconegut: {setting} {value}',
      noLayer: '«{name}» no té la capa {n}.',
      tooManyLayers: 'Un efecte pot tenir com a màxim {max} capes.',
      layerUsage: 'Fes servir !pagefx layer add [efecte] o !pagefx layer remove <número>.',
      nullUsage: 'Fes servir !pagefx null create o !pagefx null remove.',
      isEffect: '«{name}» és un efecte, així que no pot ser també una àrea sense efectes.',
      badInterval: 'Indica el temps entre aparicions en ms, per exemple: !pagefx interval 500 1500',
      badDirection:
        'Indica random, o caselles en horitzontal i en vertical, per exemple: !pagefx direction 2 -1',
      badArea:
        'Indica un radi en unitats de la pàgina, i circle o square, per exemple: !pagefx area 15 circle',
      badIntensity: 'Indica una intensitat superior a 0, per exemple: !pagefx intensity 1.5',
      noName: 'Indica un nom, per exemple: !pagefx name Pluja sobre el moll',
      triggerUsage:
        'Fes servir !pagefx trigger add <round|turn|enter|leave> <start|stop|toggle|fire|burst> [every=2] [round=3] [count=5] [who=players|all|named] [names=A;B] [area=self|selected] [once], o !pagefx trigger remove <número>.',
      triggerToken:
        'Primer selecciona al mapa la fitxa a què es refereix aquest activador, o indica token=<id>.',
      triggerNames:
        'Indica els noms de les fitxes amb names=, separats per ; (per exemple names=Goblin;Orc).',
      tooManyTriggers: 'Un efecte pot tenir com a màxim {max} activadors.',
      noTrigger: '«{name}» no té l’activador {n}.',
      journalUsage: 'Fes servir !pagefx journal rebuild.',
      unknownPreset: 'No hi ha cap predefinit «{id}». Escriu !pagefx presets per veure’ls.',
      unexpected: 'Alguna cosa ha anat malament: {message}',
    },
  };

  const TRANSLATION$a = {
    titles: {
      ready: 'PageFX 已就緒。',
      menu: 'PageFX',
      status: 'PageFX 狀態',
      settings: 'PageFX 設定',
      presets: 'PageFX 預設集',
      help: 'PageFX 指令',
      effect: '效果：{name}',
    },
    messages: {
      readyHint: '輸入 !pagefx 開啟選單。',
      adopted: '已從 PageFX 1.x 指示物接管 {effects} 個效果和 {nulls} 個無效果區，它們會照舊運作。',
      rescanned:
        '重新掃描找到 {effects} 個新效果和 {nulls} 個新無效果區，並不再追蹤 {dropped} 個指示物已被刪除的項目。',
      allPaused: '所有效果都已暫停。使用 !pagefx resume 讓它們重新開始。',
      allResumed: '效果已恢復運作。',
      turnedOn: '已開啟：{count}。',
      turnedOff: '已關閉：{count}。',
      toggled: '已切換開關：{count}。',
      paused: '已暫停：{count}。',
      resumed: '已繼續：{count}。',
      fired: '已產生 {count} 個效果。',
      created: '新效果：{count}。請在各自的卡片上選擇它要產生什麼。',
      deleted: '已移除效果：{count}。它們的指示物仍留在地圖上。',
      renamed: '已重新命名：{count}。',
      fxSet: '已變更效果：{count}。',
      intervalSet: '已變更時間間隔：{count}。',
      directionSet: '已變更方向：{count}。',
      areaSet: '已變更範圍：{count}。',
      intensitySet: '已變更強度：{count}。',
      layerAdded: '已新增圖層：{count}。',
      layerRemoved: '已移除圖層：{count}。',
      nullCreated: '新的無效果區：{count}。',
      nullRemoved: '已移除無效果區：{count}。',
      presetApplied: '已套用 {name}：{count}。',
      journalRebuilt: '已重建「{help}」和「{deck}」講義。',
      triggerAdded: '已新增觸發條件：{count}。',
      triggerRemoved: '已移除觸發條件：{count}。',
      triggersCleared: '已移除 {count} 個效果的觸發條件。',
      throttled:
        '頁面「{page}」上的效果正在減量：它們每秒要求超過 {max} 次產生。請降低它們的強度，或用 !pagefx set maxSpawnsPerSecond 提高上限。',
      settingChanged: '{setting} 現在是 {value}。',
      problem: '效果「{name}」無法運作：{reason}',
    },
    menu: {
      page: '頁面',
      live: '效果在此運作',
      notLive: '此處沒有玩家',
      allPausedNote: '所有效果都已暫停。',
      effectsHere: '此頁面的效果',
      noEffectsHere: '此頁面還沒有效果。',
      otherPages: '其他頁面',
      effectCount: '{count} 個效果',
      actions: '新增',
      selectHint:
        '請先在地圖上選取一個指示物，再按「新效果」或「無效果區」。指示物標示效果出現的位置，它的 Aura 1 就是範圍。',
      state: '狀態',
      area: '範圍',
      areaValue: '指示物外 {radius} {units}，{shape}',
      circle: '圓形',
      square: '方形',
      circleOption: '圓形',
      squareOption: '方形',
      layers: '圖層',
      layer: '圖層 {n}',
      noLayers: '沒有圖層。新增一個圖層來選擇此效果要產生什麼。',
      noFxSet: '未設定',
      timing: '每 {min}–{max} 毫秒',
      directionRandom: '隨機方向',
      directionOffset: '終點在 {dx}、{dy} 格外',
      v1Note:
        '此效果仍跟隨指示物的 GM Notes 和數值條運作，就像在 PageFX 1.x 中一樣。在這裡變更它，就會停止這種做法。',
      preset: '預設集',
      presetsHint:
        '在地圖上選取一個或多個指示物，再按一個預設集。尚未成為效果的指示物會變成效果，它們的 Aura 1 就是預設集填滿的範圍。',
      triggers: '觸發條件',
      noTriggers: '沒有觸發條件：只要玩家在它的頁面上，效果就會運作。',
      triggerHint: '若要設定回合觸發條件，或使用另一個指示物的範圍，請先在地圖上選取該指示物。',
      yes: '是',
      no: '否',
    },
    buttons: {
      edit: '編輯',
      show: '顯示',
      turnOn: '開啟',
      turnOff: '關閉',
      pause: '暫停',
      resume: '繼續',
      fire: '發動',
      pauseAll: '全部暫停',
      resumeAll: '全部繼續',
      create: '新效果',
      createNull: '無效果區',
      removeNull: '移除無效果區',
      settings: '設定',
      status: '狀態',
      rescan: '重新掃描',
      rename: '重新命名',
      area: '範圍',
      intensity: '強度',
      builtin: '內建 FX',
      saved: '已存 FX',
      json: '自訂 JSON',
      timing: '時間間隔',
      random: '隨機方向',
      offset: '設定方向',
      addLayer: '新增圖層',
      removeLayer: '移除圖層',
      delete: '刪除效果',
      preset: '預設集',
      presets: '預設集',
      remove: '移除',
      help: '說明',
      rebuild: '重建講義',
      onRound: '每輪',
      onTurn: '某人的回合',
      onEnter: '指示物進入',
      onLeave: '指示物離開',
      menu: '選單',
      change: '變更',
    },
    prompts: {
      type: '效果類型',
      colour: '顏色',
      saved: '已儲存的自訂 FX',
      json: '自訂 FX 定義（JSON）',
      intervalMin: '兩次產生之間的最短時間（毫秒）',
      intervalMax: '兩次產生之間的最長時間（毫秒）',
      dx: '到終點的橫向格數（負數為向左）',
      dy: '到終點的縱向格數（負數為向上）',
      name: '效果名稱',
      radius: '指示物外的範圍半徑（以頁面單位計）',
      shape: '範圍形狀',
      intensity: '強度（{min} 到 {max}）',
      maxSpawns: '單一頁面每秒產生次數（1 到 {max}）',
      preset: '預設集',
      then: '然後',
      every: '每幾輪一次',
      who: '計入哪些指示物',
      area: '哪個範圍',
      once: '只限第一次？',
      confirmDelete: '要刪除此效果嗎？指示物會留在地圖上。',
    },
    settings: {
      language: '語言',
      globalIntensity: '所有效果的強度',
      gmPreviewHint: '開啟時，即使沒有玩家，效果也會在每位 GM 正在查看的頁面上運作。',
      maxSpawnsHint: '頁面要求超過此數量時，效果會被減量。Roll20 在大約 60 以內都能保持流暢。',
    },
    status: {
      livePages: '運作中的頁面',
      effects: '效果',
      running: '運作中',
      globalPause: '全部暫停',
      on: '開啟',
      off: '關閉',
      pausedState: '已暫停',
      waiting: '不在運作中的頁面',
      noFx: '未選擇效果',
      broken: '無法運作',
      nullAreas: '無效果區',
      noEffects: '還沒有效果。選取一個指示物並輸入 !pagefx create，或用 !pagefx 開啟選單。',
      gmPreview: 'GM 頁面預覽',
      intensity: '強度',
      maxSpawns: '每頁每秒最大產生次數',
    },
    help: {
      menu: '開啟選單：顯示你頁面上的效果，以及其他所有功能的按鈕。',
      create: '將選取的指示物設為效果。它們的 Aura 1 就是範圍；沒有光環的會自動加上一個。',
      edit: '顯示每個選取效果的卡片，並附上變更它的按鈕。',
      preset: '為選取的指示物套用預設集，必要時先將它們設為效果。',
      presets: '依套組列出預設集。',
      switches:
        '開啟或關閉選取的效果，或暫停和繼續它們。沒有選取任何東西時，on 和 resume 會讓所有效果重新開始，off 和 pause 會暫停所有效果（就像版本 1 的 !pageFX on 和 off）。',
      fire: '立即產生選取的效果一次或數次，方便試看。',
      fx: '設定圖層要產生什麼：內建效果（例如 burn-fire）、已儲存的自訂 FX 名稱，或 JSON 格式的自訂 FX 定義。',
      interval: '設定圖層兩次產生之間的時間，以毫秒為單位。每次的等待時間會在兩個值之間隨機選取。',
      direction: '針對光束類效果，設定每次產生的終點：random，或從起點算起的橫向與縱向格數。',
      area: '設定範圍：指示物 Aura 1 的半徑（以頁面單位計）及其形狀。',
      intensity: '調整選取效果產生頻率的倍數（0.1 到 5）。加上 global 則會變更所有效果。',
      name: '重新命名選取的效果。',
      layer: '新增一個圖層，讓一個效果產生多種東西，或移除一個圖層。',
      triggerAdd:
        '新增觸發條件：在 round、turn、enter 或 leave 時，執行 start、stop、toggle、fire 或 burst。選項：every=2、round=3、count=5、who=players|all|named、names=A;B、area=selected、once。',
      triggerRemove: '從選取的效果移除一個或全部觸發條件。',
      null: '將選取的指示物設為無效果區（任何效果都不會在那裡產生），或取消設定。',
      delete: '移除選取指示物上的效果。指示物會留在地圖上。',
      status: '列出每個效果、所在頁面，以及是否正在運作。',
      settings: '顯示設定。',
      set: '變更設定：language、gmPagePreview、intensity 或 maxSpawnsPerSecond。',
      rescan: '接管名為 PageFX 或 NullFX 的新指示物，並不再追蹤指示物已被刪除的效果。',
      journal: '重建說明（Help）和 Command Deck 講義。',
      help: '顯示此清單。',
      handout: '完整說明在「{help}」講義中；一鍵按鈕在「{deck}」中。',
    },
    deck: {
      menuTitle: '選單',
      menuDesc: '主選單會列出你頁面上的效果。「狀態」會列出所有效果。',
      newTitle: '新增',
      newDesc: '請先在地圖上選取一個或多個指示物。它們的 Aura 1 會成為效果填滿的範圍。',
      selectedTitle: '選取的效果',
      selectedDesc: '在地圖上選取效果指示物，再按一個按鈕。',
      allTitle: '全部',
      allDesc: '暫停所有效果，或讓它們全部重新開始。',
      toolsTitle: '工具',
      toolsDesc: '接管複製出來的指示物、清理已刪除的指示物，並重建這些講義。',
      footer: '完整說明請見「{help}」講義。',
    },
    handout: {
      versionLabel: '版本',
      subtitle: '適用於 Roll20 地圖的天氣與環境效果',
      footer: '一鍵控制請使用「{deck}」講義。',
      overview: {
        heading: '概覽',
        body: 'PageFX 會在地圖的某個範圍內填入持續不斷的效果：雨、雪、餘燼、蒸氣、螢火蟲等等。每個效果的位置由一個指示物標示，它的 Aura 1 就是範圍。效果會在每個有玩家的頁面上運作，包括隊伍分頭行動時玩家被送去的頁面，並在玩家離開時停止。所有設定都透過聊天選單完成，觸發條件還能隨著戰鬥輪次推進或指示物移動來啟動或停止效果。',
        demo: '觀看簡短示範影片（版本 1）',
      },
      quickStart: {
        heading: '快速入門',
        steps: [
          '把指示物放在效果應出現的位置（放在 GM 圖層可以對玩家隱藏），然後選取它。',
          '輸入 !pagefx presets，或開啟 Command Deck 並按「預設集」，然後按一個預設集，例如「大雨」。',
          '調整指示物 Aura 1 的大小，設定效果填滿的範圍。玩家看不到這個光環。',
          '把玩家移到該頁面。效果會開始，並在玩家離開時再次停止。',
          '輸入 !pagefx 開啟選單，然後在效果上按「編輯」來變更它。',
        ],
      },
      effects: {
        heading: '效果',
        points: [
          '效果就是一個指示物，加上 PageFX 保存的設定。移動指示物就能移動效果，改變它的 Aura 1 就能改變範圍。刪除指示物也會刪除效果。',
          '每個效果有一個或多個圖層。每個圖層會反覆產生同一種東西，每次之間的等待時間會在最短和最長時間之間隨機決定。',
          '圖層可以產生 Roll20 內建效果（類型和顏色，例如 burn-fire）、遊戲中已儲存的自訂 FX，或以 JSON 貼上的自訂 FX 定義。定義中缺少的值會自動補上，所以簡短的定義也能畫出來。',
          '光束類效果（beam、breath、splatter，以及 angle 為 -1 的自訂 FX）會在兩點之間繪製。它們的方向可以是隨機的，或是固定的橫向與縱向格數。',
          '強度決定效果產生頻率的倍數。「強度」設定會套用到所有效果上。',
          '「關閉」會讓效果停止，直到再次開啟為止。「暫停」會讓效果停住，直到繼續為止。「全部暫停」會停住所有效果，但不更改它們。',
          'Jumpgate 會把自訂 FX 定義畫成白色，除非它們已儲存為自訂 FX，所以 PageFX 會把自己的定義儲存為名為「PageFX: …」的自訂 FX。沒有效果使用時，它們會被移除。請不要動它們。',
        ],
      },
      pages: {
        heading: '哪些頁面會運作',
        points: [
          '效果會在玩家旗標所在的頁面上運作，也會在每個有玩家被單獨移過去的頁面上運作。',
          '開啟「GM 頁面預覽」後，效果也會在每位 GM 正在查看的頁面上運作，方便在沒有玩家時試看效果。',
          '每個頁面最多只能達到「每秒最大產生次數」（預設為 30）。若效果要求更多，部分產生會被略過，並會通知 GM 一次。',
          '當其他 Mod 移動玩家旗標或讓隊伍分頭行動時，Roll20 不會通知任何人，所以 PageFX 每隔幾秒就會檢查一次並跟上變化。',
        ],
      },
      presets: {
        heading: '預設集',
        intro:
          '預設集會給效果一組現成的圖層。之後變更任何圖層，效果就成為你自己的版本。其他 Mod 可以用 PageFX.registerPreset 新增預設集。',
        colPack: '套組',
        colPresets: '預設集（名稱與 ID）',
      },
      triggers: {
        heading: '觸發條件',
        intro:
          '觸發條件會在某件事發生時啟動、停止、切換或發動效果。可以從效果的卡片新增，或使用 !pagefx trigger add。',
        points: [
          '每輪：Roll20 不會記錄輪數，所以當行動順序從最後一項推進回到最上方時，就算新的一輪開始。若有名為「Round」的自訂行動順序項目，則改用它。可以選擇每隔幾輪，或指定某一輪。戰鬥的第一輪不算是變化。',
          '某人的回合：當選定的指示物到達行動順序最上方時。按下按鈕前，請先在地圖上選取該指示物。',
          '指示物進入或離開：當指示物移入或移出效果的範圍，或你選取的另一個指示物的 Aura 1 時。預設只計入玩家控制的指示物；也可以選擇任何指示物，或指定名稱。',
          '「連發」會一次產生效果數次。「只限第一次」會讓觸發條件只生效一次。',
          '當其他 Mod 移動指示物時，Roll20 不會通知任何 Mod。會移動指示物的 Mod 可以在移動後呼叫 PageFX.checkToken(token)。',
        ],
      },
      nullAreas: {
        heading: '無效果區',
        points: [
          '無效果區是一個任何效果都不會產生的指示物，例如暴風雨中房屋的內部。它的範圍是指示物本身加上它的 Aura 1。',
          '選取指示物，然後在選單或 Command Deck 中按「無效果區」。名為 NullFX 的指示物（和版本 1 一樣）也是無效果區。',
        ],
      },
      commands: {
        heading: '指令',
        intro:
          '只有 GM 可以使用這些指令。它們會作用於選取的指示物，或以 --ids 指定的指示物。圖層指令會作用於圖層 1，除非以 --layer 另行指定。其他 Mod 也可以傳送這些指令；回覆會傳給 GM。',
        colCommand: '指令',
        colDesc: '功能',
      },
      settings: {
        heading: '設定',
        intro: '可以從「設定」卡片或使用 !pagefx set 變更設定。語言也可以在 Mod 的設定頁面中設定。',
        colKey: '設定',
        colDesc: '功能',
        rows: {
          language: 'PageFX 的選單、訊息和講義所使用的語言。',
          gmPagePreview: '也在每位 GM 正在查看的頁面上運作效果（預設為關閉）。',
          intensity: '所有效果產生頻率的倍數（預設為 1）。',
          maxSpawnsPerSecond: '單一頁面每秒最多的產生次數，1 到 60（預設為 30）。',
        },
      },
      api: {
        heading: '給其他 Mod 使用',
        intro: 'PageFX 會公開一個 PageFX 物件。函式需要指示物時，也可以改傳指示物的 ID。',
        colFunction: '函式',
        colDesc: '功能',
        rows: {
          activateAll: '繼續所有效果（版本 1）。',
          deactivateAll: '暫停所有效果（版本 1）。',
          activate: '開啟、關閉或切換一個效果（版本 1）。',
          start: '開啟或關閉一個效果，或暫停和繼續它。',
          setIntensity: '變更一個效果的強度。',
          fire: '立即產生一個效果。',
          create:
            '將指示物設為效果，可用選項 name、fx、interval、direction 和 intensity；或取消設定。',
          getEffect: '讀取一個效果、列出（某一頁面上的）效果，或查詢某個效果是否正在運作。',
          registerPreset: '新增在本次執行期間有效的預設集，或列出預設集。',
          checkToken: '針對進入和離開觸發條件，檢查你的 Mod 移動過的指示物。',
        },
      },
      upgrading: {
        heading: '從版本 1 升級',
        points: [
          '名為 PageFX 和 NullFX 的指示物會在首次啟動時被接管，並照舊運作。',
          '在你從聊天中變更效果之前，指示物的 GM Notes、Bar 1（兩次產生之間的時間）和 Bar 2（光束方向）仍會控制它，禁止標記（interdiction）也仍會關閉它。一旦你從聊天中變更它，GM Notes 和數值條就又歸你自由使用。',
          '版本 1 只會在玩家旗標所在的頁面上繪製效果，並且會把已儲存的自訂 FX 產生兩次。這兩個問題都已修正。',
          '版本 1 的指令仍然可用：',
        ],
        colV1: '版本 1 指令',
        colV2: '等同於',
      },
      troubleshooting: {
        heading: '疑難排解',
        points: [
          '效果沒有運作：開啟它的卡片。「狀態」那一行會說明原因：關閉、已暫停、未選擇效果、無法運作（附上原因），或不在運作中的頁面（那裡沒有玩家；開啟「GM 頁面預覽」來試看）。',
          '什麼都看不到：非常小或存在時間很短的粒子，在複雜的地圖上很難看清楚。試試預設集、提高強度，或縮小範圍。',
          '效果看起來很稀疏：頁面可能已達到「每秒最大產生次數」。降低一些效果的強度，或提高上限。',
          '複製頁面或遊戲後效果停止了：執行「重新掃描」。',
          '其他問題請查看 API 主控台記錄，並在尋求協助時附上其中的訊息。',
        ],
      },
      languages: {
        heading: '語言',
        body: '可以從「設定」卡片或使用 !pagefx set language 選擇語言。可用的語言：',
        colLanguage: '語言',
        colNative: '原文名稱',
        colCode: '代碼',
      },
      credits: {
        heading: '致謝',
        original: '原始 Mod 作者：',
        maintainer: '版本 2 維護者：',
        marketplace: 'Ada 在 Roll20 Marketplace 上的美術包',
        support:
          '如果你發現錯誤或有任何想法，請到 Roll20 Mod 論壇發文，或在 GitHub 上開 issue，並附上 API 主控台記錄中的所有訊息。',
      },
    },
    triggers: {
      line: '{when}：{action}',
      eachRound: '每輪開始時',
      everyRounds: '每 {n} 輪',
      onRound: '第 {n} 輪時',
      turn: '{name} 的回合開始時',
      enter: '{who}進入{area}時',
      leave: '{who}離開{area}時',
      areaSelf: '此效果的範圍',
      areaSelected: '所選指示物的光環',
      areaOf: '{name} 的光環',
      unnamed: '某個指示物',
      once: '（只限第一次）',
      onceUsed: '（只限第一次，已觸發過）',
      who: {
        players: '玩家指示物',
        all: '任何指示物',
      },
      action: {
        start: '啟動',
        stop: '停止',
        toggle: '開啟或關閉',
        fire: '發動一次',
        burst: '連發 {count} 次',
      },
      choice: {
        start: '啟動',
        stop: '停止',
        toggle: '開啟或關閉',
        fire: '發動一次',
        burst: '連發',
      },
    },
    packs: {
      weather: '天氣',
      fire: '火焰與高溫',
      water: '水',
      magic: '魔法與詭異',
      custom: '來自其他 Mod',
    },
    presets: {
      'light-rain': '小雨',
      'heavy-rain': '大雨',
      thunderstorm: '雷雨',
      snow: '雪',
      blizzard: '暴風雪',
      hail: '冰雹',
      sandstorm: '沙塵暴',
      fog: '縷縷薄霧',
      embers: '餘燼',
      ash: '飄落的灰燼',
      magma: '翻騰的岩漿',
      'lava-spurts': '熔岩噴濺',
      sparks: '火花',
      drips: '洞穴滴水',
      steam: '蒸氣噴口',
      geyser: '間歇泉',
      spray: '瀑布水霧',
      bubbles: '氣泡',
      fireflies: '螢火蟲',
      'arcane-motes': '奧術光點',
      'necrotic-mist': '黯蝕之霧',
      'holy-glimmer': '神聖微光',
      'swamp-gas': '沼氣',
    },
    fx: {
      empty: '尚未設定效果。',
      badJson: '自訂 FX 定義不是有效的 JSON。',
      unknownColour: '沒有名為「{colour}」的內建顏色。可用顏色：{colours}。',
      savedMissing: '沒有名為「{name}」的已儲存自訂 FX。',
      cannotCreate: 'Roll20 無法為它建立自訂 FX 物件。',
      spawnFailed: 'Roll20 無法產生它（{message}）。',
    },
    errors: {
      unknownCommand: '未知的指令：{command}',
      noEffects: '請選取一個或多個 PageFX 指示物，或用 --ids 指定它們的 ID。',
      selectToken: '請先選取一個或多個指示物，或用 --ids 指定它們的 ID。',
      unknownIds: '以下不是 PageFX 效果：{ids}',
      badSetting: '未知的設定或值：{setting} {value}',
      noLayer: '「{name}」沒有圖層 {n}。',
      tooManyLayers: '一個效果最多只能有 {max} 個圖層。',
      layerUsage: '請使用 !pagefx layer add [effect] 或 !pagefx layer remove <number>。',
      nullUsage: '請使用 !pagefx null create 或 !pagefx null remove。',
      isEffect: '「{name}」是效果，所以不能同時是無效果區。',
      badInterval: '請以毫秒指定兩次產生之間的時間，例如：!pagefx interval 500 1500',
      badDirection: '請指定 random，或橫向與縱向格數，例如：!pagefx direction 2 -1',
      badArea: '請指定以頁面單位計的半徑，以及 circle 或 square，例如：!pagefx area 15 circle',
      badIntensity: '請指定大於 0 的強度，例如：!pagefx intensity 1.5',
      noName: '請指定名稱，例如：!pagefx name 碼頭上的雨',
      triggerUsage:
        '請使用 !pagefx trigger add <round|turn|enter|leave> <start|stop|toggle|fire|burst> [every=2] [round=3] [count=5] [who=players|all|named] [names=A;B] [area=self|selected] [once]，或 !pagefx trigger remove <number>。',
      triggerToken: '請先在地圖上選取此觸發條件相關的指示物，或指定 token=<id>。',
      triggerNames: '請用 names= 指定指示物名稱，以 ; 分隔（例如 names=Goblin;Orc）。',
      tooManyTriggers: '一個效果最多只能有 {max} 個觸發條件。',
      noTrigger: '「{name}」沒有觸發條件 {n}。',
      journalUsage: '請使用 !pagefx journal rebuild。',
      unknownPreset: '沒有名為「{id}」的預設集。輸入 !pagefx presets 查看所有預設集。',
      unexpected: '發生錯誤：{message}',
    },
  };

  const TRANSLATION$9 = {
    titles: {
      ready: 'PageFX je připraven.',
      menu: 'PageFX',
      status: 'Stav PageFX',
      settings: 'Nastavení PageFX',
      presets: 'Předvolby PageFX',
      help: 'Příkazy PageFX',
      effect: 'Efekt: {name}',
    },
    messages: {
      readyHint: 'Nabídku otevřete příkazem !pagefx.',
      adopted:
        'Z tokenů PageFX 1.x převzato efektů: {effects}, oblastí bez efektů: {nulls}. Fungují dál jako dřív.',
      rescanned:
        'Nové prohledání našlo nové efekty ({effects}) a nové oblasti bez efektů ({nulls}) a zapomnělo efekty ({dropped}), jejichž tokeny byly smazány.',
      allPaused: 'Všechny efekty jsou pozastavené. Znovu je spustíte příkazem !pagefx resume.',
      allResumed: 'Efekty opět běží.',
      turnedOn: 'Zapnuto: {count}.',
      turnedOff: 'Vypnuto: {count}.',
      toggled: 'Zapnuto nebo vypnuto: {count}.',
      paused: 'Pozastaveno: {count}.',
      resumed: 'Obnoveno: {count}.',
      fired: 'Vyvoláno efektů: {count}.',
      created: 'Nové efekty: {count}. Na kartě každého z nich vyberte, co má vyvolávat.',
      deleted: 'Odebrané efekty: {count}. Jejich tokeny zůstaly na mapě.',
      renamed: 'Přejmenováno: {count}.',
      fxSet: 'Efekt změněn: {count}.',
      intervalSet: 'Časování změněno: {count}.',
      directionSet: 'Směr změněn: {count}.',
      areaSet: 'Oblast změněna: {count}.',
      intensitySet: 'Intenzita změněna: {count}.',
      layerAdded: 'Vrstva přidána: {count}.',
      layerRemoved: 'Vrstva odebrána: {count}.',
      nullCreated: 'Nové oblasti bez efektů: {count}.',
      nullRemoved: 'Odebrané oblasti bez efektů: {count}.',
      presetApplied: '{name} použito: {count}.',
      journalRebuilt: 'Podklady „{help}“ a „{deck}“ byly znovu vytvořeny.',
      triggerAdded: 'Spouštěč přidán: {count}.',
      triggerRemoved: 'Spouštěč odebrán: {count}.',
      triggersCleared: 'Spouštěče odebrány z efektů: {count}.',
      throttled:
        'Efekty na stránce „{page}“ se ředí: žádaly víc než {max} vyvolání za sekundu. Snižte jejich intenzitu, nebo zvyšte limit příkazem !pagefx set maxSpawnsPerSecond.',
      settingChanged: '{setting} je nyní {value}.',
      problem: 'Efekt „{name}“ nemůže běžet: {reason}',
    },
    menu: {
      page: 'Stránka',
      live: 'efekty tu běží',
      notLive: 'nejsou tu hráči',
      allPausedNote: 'Všechny efekty jsou pozastavené.',
      effectsHere: 'Efekty na této stránce',
      noEffectsHere: 'Na této stránce zatím nejsou žádné efekty.',
      otherPages: 'Další stránky',
      effectCount: 'efekty: {count}',
      actions: 'Nový',
      selectHint:
        'Nejprve vyberte token na mapě a pak stiskněte Nový efekt nebo Oblast bez efektů. Token určuje, kde se efekt objeví; jeho „Aura 1“ je oblast.',
      state: 'Stav',
      area: 'Oblast',
      areaValue: '{radius} {units} za okrajem tokenu, {shape}',
      circle: 'kruh',
      square: 'čtverec',
      circleOption: 'Kruh',
      squareOption: 'Čtverec',
      layers: 'Vrstvy',
      layer: 'Vrstva {n}',
      noLayers: 'Žádné vrstvy. Přidejte vrstvu a vyberte, co má tento efekt vyvolávat.',
      noFxSet: 'nenastaveno',
      timing: 'každých {min}–{max} ms',
      directionRandom: 'náhodný směr',
      directionOffset: 'končí o {dx}, {dy} políček dál',
      v1Note:
        'Tento efekt se stále řídí poli „GM Notes“ a lištami svého tokenu jako v PageFX 1.x. Když ho změníte tady, přestane to platit.',
      preset: 'Předvolba',
      presetsHint:
        'Vyberte na mapě jeden nebo více tokenů a pak stiskněte předvolbu. Tokeny, které ještě nejsou efekty, se jimi stanou, a jejich „Aura 1“ je oblast, kterou předvolba vyplní.',
      triggers: 'Spouštěče',
      noTriggers: 'Žádné spouštěče: efekt běží vždy, když jsou na jeho stránce hráči.',
      triggerHint:
        'Pro spouštěč tahu nebo oblast podle jiného tokenu nejprve vyberte ten token na mapě.',
      yes: 'Ano',
      no: 'Ne',
    },
    buttons: {
      edit: 'Upravit',
      show: 'Zobrazit',
      turnOn: 'Zapnout',
      turnOff: 'Vypnout',
      pause: 'Pozastavit',
      resume: 'Obnovit',
      fire: 'Vyvolat',
      pauseAll: 'Pozastavit vše',
      resumeAll: 'Obnovit vše',
      create: 'Nový efekt',
      createNull: 'Oblast bez efektů',
      removeNull: 'Zrušit oblast bez efektů',
      settings: 'Nastavení',
      status: 'Stav',
      rescan: 'Znovu prohledat',
      rename: 'Přejmenovat',
      area: 'Oblast',
      intensity: 'Intenzita',
      builtin: 'Vestavěné FX',
      saved: 'Uložené FX',
      json: 'Vlastní JSON',
      timing: 'Časování',
      random: 'Náhodný směr',
      offset: 'Nastavit směr',
      addLayer: 'Přidat vrstvu',
      removeLayer: 'Odebrat vrstvu',
      delete: 'Smazat efekt',
      preset: 'Předvolba',
      presets: 'Předvolby',
      remove: 'Odebrat',
      help: 'Nápověda',
      rebuild: 'Obnovit podklady',
      onRound: 'Každé kolo',
      onTurn: 'Na tahu',
      onEnter: 'Token vstoupí',
      onLeave: 'Token odejde',
      menu: 'Nabídka',
      change: 'Změnit',
    },
    prompts: {
      type: 'Typ efektu',
      colour: 'Barva',
      saved: 'Uložené vlastní FX',
      json: 'Definice vlastního FX (JSON)',
      intervalMin: 'Nejkratší doba mezi vyvoláními v ms',
      intervalMax: 'Nejdelší doba mezi vyvoláními v ms',
      dx: 'Políčka doprava ke konci (záporné číslo doleva)',
      dy: 'Políčka dolů ke konci (záporné číslo nahoru)',
      name: 'Název efektu',
      radius: 'Poloměr oblasti za okrajem tokenu v jednotkách stránky',
      shape: 'Tvar oblasti',
      intensity: 'Intenzita ({min} až {max})',
      maxSpawns: 'Vyvolání za sekundu na jedné stránce (1 až {max})',
      preset: 'Předvolba',
      then: 'Potom',
      every: 'Po kolika kolech',
      who: 'Které tokeny se počítají',
      area: 'Které oblasti se to týká',
      once: 'Jen poprvé?',
      confirmDelete: 'Smazat tento efekt? Token zůstane na mapě.',
    },
    settings: {
      language: 'Jazyk',
      globalIntensity: 'Intenzita všech efektů',
      gmPreviewHint:
        'Když je zapnuto, efekty běží i na stránce, kterou si právě prohlíží některý PJ, i když tam nejsou hráči.',
      maxSpawnsHint:
        'Na stránce, která žádá víc, se efekty ředí. Roll20 zůstává plynulý zhruba do 60.',
    },
    status: {
      livePages: 'Aktivní stránky',
      effects: 'Efekty',
      running: 'Běží',
      globalPause: 'Vše pozastaveno',
      on: 'Zapnuto',
      off: 'Vypnuto',
      pausedState: 'Pozastaveno',
      waiting: 'Není na aktivní stránce',
      noFx: 'Není vybrán žádný efekt',
      broken: 'Nemůže běžet',
      nullAreas: 'Oblasti bez efektů',
      noEffects:
        'Zatím žádné efekty. Vyberte token a napište !pagefx create, nebo otevřete nabídku příkazem !pagefx.',
      gmPreview: 'Náhled stránky PJ',
      intensity: 'Intenzita',
      maxSpawns: 'Max. vyvolání za sekundu na stránku',
    },
    help: {
      menu: 'Otevře nabídku: efekty na vaší stránce a tlačítka pro všechno ostatní.',
      create:
        'Udělá z vybraných tokenů efekty. Jejich „Aura 1“ je oblast; pokud ji nemají, přidá se.',
      edit: 'Zobrazí kartu každého vybraného efektu s tlačítky pro jeho změnu.',
      preset: 'Dá vybraným tokenům předvolbu; pokud je třeba, nejprve z nich udělá efekty.',
      presets: 'Vypíše předvolby podle balíčků.',
      switches:
        'Zapne nebo vypne vybrané efekty, nebo je pozastaví a obnoví. Když není nic vybráno, on a resume znovu spustí vše a off a pause vše zastaví (jako !pageFX on a off ve verzi 1).',
      fire: 'Vyvolá vybrané efekty hned, jednou nebo několikrát, abyste si je vyzkoušeli.',
      fx: 'Nastaví, co vrstva vyvolává: vestavěný efekt, třeba burn-fire, název uloženého vlastního FX, nebo definici vlastního FX v JSON.',
      interval:
        'Nastaví dobu mezi vyvoláními vrstvy v milisekundách. Každé čekání se náhodně zvolí mezi těmito dvěma hodnotami.',
      direction:
        'U paprskovitých efektů nastaví, kde každé vyvolání končí: random, nebo počet políček doprava a dolů od místa, kde začíná.',
      area: 'Nastaví oblast: poloměr „Aura 1“ tokenu v jednotkách stránky a její tvar.',
      intensity:
        'Násobí, jak často se vybrané efekty vyvolávají (0,1 až 5). S global ji změní pro všechny efekty.',
      name: 'Přejmenuje vybrané efekty.',
      layer: 'Přidá vrstvu, aby jeden efekt vyvolával více věcí, nebo jednu odebere.',
      triggerAdd:
        'Přidá spouštěč: při round, turn, enter nebo leave provede start, stop, toggle, fire nebo burst. Volby: every=2, round=3, count=5, who=players|all|named, names=A;B, area=selected, once.',
      triggerRemove: 'Odebere z vybraných efektů jeden spouštěč nebo všechny.',
      null: 'Udělá z vybraných tokenů oblasti bez efektů, kde se nikdy nic nevyvolá, nebo to zruší.',
      delete: 'Odebere efekt z vybraných tokenů. Tokeny zůstanou na mapě.',
      status: 'Vypíše všechny efekty, jejich stránky a zda běží.',
      settings: 'Zobrazí nastavení.',
      set: 'Změní nastavení: language, gmPagePreview, intensity nebo maxSpawnsPerSecond.',
      rescan:
        'Převezme nové tokeny pojmenované PageFX nebo NullFX a zapomene efekty, jejichž tokeny byly smazány.',
      journal: 'Znovu vytvoří podklady s nápovědou a Command Deck.',
      help: 'Zobrazí tento seznam.',
      handout: 'Úplný návod je v podkladu „{help}“; tlačítka na jedno kliknutí jsou v „{deck}“.',
    },
    deck: {
      menuTitle: 'Nabídka',
      menuDesc: 'Hlavní nabídka ukazuje efekty na vaší stránce. Stav ukazuje všechny.',
      newTitle: 'Nový',
      newDesc:
        'Nejprve vyberte na mapě jeden nebo více tokenů. Jejich „Aura 1“ se stane oblastí, kterou efekt vyplní.',
      selectedTitle: 'Vybrané efekty',
      selectedDesc: 'Vyberte na mapě tokeny efektů a pak stiskněte tlačítko.',
      allTitle: 'Všechno',
      allDesc: 'Zastavte všechny efekty, nebo je všechny znovu spusťte.',
      toolsTitle: 'Nástroje',
      toolsDesc: 'Převezměte zkopírované tokeny, zapomeňte smazané a znovu vytvořte tyto podklady.',
      footer: 'Úplný návod najdete v podkladu „{help}“.',
    },
    handout: {
      versionLabel: 'Verze',
      subtitle: 'Počasí a efekty prostředí pro mapy Roll20',
      footer: 'Ovládání na jedno kliknutí najdete v podkladu „{deck}“.',
      overview: {
        heading: 'Přehled',
        body: 'PageFX vyplní oblast mapy efekty, které neustále pokračují: déšť, sníh, žhavé uhlíky, pára, světlušky a další. Místo každého efektu určuje token a jeho „Aura 1“ je oblast. Efekty běží na každé stránce, kde jsou hráči, včetně stránek, kam byla poslána rozdělená družina, a zastaví se, když hráči odejdou. Vše se nastavuje z nabídek v chatu a spouštěče mohou efekty spouštět nebo zastavovat, jak běží kola boje nebo jak se pohybují tokeny.',
        demo: 'Podívejte se na krátké demo (z verze 1)',
      },
      quickStart: {
        heading: 'Rychlý start',
        steps: [
          'Umístěte token tam, kde má efekt být (ve vrstvě PJ zůstane hráčům skrytý), a vyberte ho.',
          'Napište !pagefx presets, nebo otevřete Command Deck a klikněte na Předvolby, pak klikněte na předvolbu, třeba Silný déšť.',
          'Změnou velikosti „Aura 1“ tokenu nastavte oblast, kterou efekt vyplní. Aura je hráčům skrytá.',
          'Přesuňte hráče na stránku. Efekt se spustí a zase se zastaví, když odejdou.',
          'Napište !pagefx pro otevření nabídky a kliknutím na Upravit u efektu ho změňte.',
        ],
      },
      effects: {
        heading: 'Efekty',
        points: [
          'Efekt je token a k němu nastavení, která si PageFX pamatuje. Posunutím tokenu posunete efekt a změnou jeho „Aura 1“ změníte oblast. Smazáním tokenu smažete efekt.',
          'Každý efekt má jednu nebo více vrstev. Každá vrstva vyvolává jednu věc, znovu a znovu, s náhodným čekáním mezi nejkratší a nejdelší dobou.',
          'Vrstva může vyvolat vestavěný efekt Roll20 (typ a barva, třeba burn-fire), vlastní FX uložené ve hře, nebo definici vlastního FX vloženou jako JSON. Chybějící hodnoty v definici se doplní, takže i krátká definice se vykreslí.',
          'Paprskovité efekty (beam, breath, splatter a vlastní FX s úhlem -1) se kreslí mezi dvěma body. Jejich směr je náhodný, nebo daný pevným počtem políček doprava a dolů.',
          'Intenzita násobí, jak často se efekt vyvolává. Nastavení intensity násobí všechny efekty.',
          'Vypnutí zastaví efekt, dokud ho nezapnete. Pozastavení ho zastaví, dokud ho neobnovíte. Pozastavit vše zastaví všechny efekty, aniž by je měnilo.',
          'Jumpgate kreslí definice vlastních FX bíle, pokud nejsou uložené jako vlastní FX, takže PageFX ukládá své definice jako vlastní FX pojmenované „PageFX: …“. Odstraní se, když je žádný efekt nepoužívá. Nechte je na místě.',
        ],
      },
      pages: {
        heading: 'Na kterých stránkách efekty běží',
        points: [
          'Efekty běží na stránce s hráčskou záložkou a na každé stránce, na kterou byl některý hráč přesunut samostatně.',
          'Zapněte Náhled stránky PJ, aby efekty běžely i na stránce, kterou si právě prohlíží některý PJ, a mohli jste je vyzkoušet bez hráčů.',
          'Každá stránka dostane nanejvýš Max. vyvolání za sekundu (výchozí 30). Pokud efekty žádají víc, některá vyvolání se vynechají a PJ dostane jednou zprávu.',
          'Když jiný Mod přesune hráčskou záložku nebo rozdělí družinu, Roll20 nikomu nic neřekne, takže PageFX se každých pár sekund podívá a dožene to.',
        ],
      },
      presets: {
        heading: 'Předvolby',
        intro:
          'Předvolba dá efektu sadu připravených vrstev. Když pak některou vrstvu změníte, efekt se stane vaším vlastním. Jiné Mody mohou přidávat předvolby pomocí PageFX.registerPreset.',
        colPack: 'Balíček',
        colPresets: 'Předvolby (název a ID)',
      },
      triggers: {
        heading: 'Spouštěče',
        intro:
          'Spouštěč efekt spustí, zastaví, přepne nebo vyvolá, když se něco stane. Přidáte je z karty efektu nebo příkazem !pagefx trigger add.',
        points: [
          'Každé kolo: Roll20 nevede číslo kola, takže kolo začne, když se pořadí tahů posune z posledního záznamu zpět na začátek. Pokud v pořadí tahů je vlastní záznam pojmenovaný „Round“, použije se místo toho on. Zvolte každých několik kol, nebo jedno konkrétní kolo. První kolo boje se jako změna nepočítá.',
          'Na tahu: když se zvolený token dostane na začátek pořadí tahů. Před kliknutím na tlačítko vyberte token na mapě.',
          'Token vstoupí nebo odejde: když token vstoupí do oblasti efektu nebo z ní odejde, případně do „Aura 1“ jiného tokenu, který vyberete. Ve výchozím stavu se počítají jen tokeny ovládané hráčem; můžete zvolit jakýkoli token nebo zadat jména.',
          'Vyvolat dávku vyvolá efekt několikrát najednou. Jen poprvé zajistí, že se spouštěč aktivuje jen jednou.',
          'Roll20 Modům nic neřekne, když jiný Mod posune token. Mody, které posouvají tokeny, mohou potom zavolat PageFX.checkToken(token).',
        ],
      },
      nullAreas: {
        heading: 'Oblasti bez efektů',
        points: [
          'Oblast bez efektů je token, kde se nikdy žádný efekt nevyvolá, třeba vnitřek domu za bouře. Její oblastí je token a jeho „Aura 1“.',
          'Vyberte token a klikněte na Oblast bez efektů v nabídce nebo v Command Deck. Tokeny pojmenované NullFX, jako ve verzi 1, jsou také oblasti bez efektů.',
        ],
      },
      commands: {
        heading: 'Příkazy',
        intro:
          'Tyto příkazy mohou používat jen PJ. Působí na vybrané tokeny nebo na tokeny zadané pomocí --ids. Příkazy pro vrstvy působí na vrstvu 1, pokud --layer neurčí jinak. Mohou je posílat i jiné Mody; odpovědi jdou PJ.',
        colCommand: 'Příkaz',
        colDesc: 'Co dělá',
      },
      settings: {
        heading: 'Nastavení',
        intro:
          'Nastavení změníte na kartě Nastavení nebo příkazem !pagefx set. Jazyk lze nastavit i na stránce nastavení Modu.',
        colKey: 'Nastavení',
        colDesc: 'Co dělá',
        rows: {
          language: 'Jazyk nabídek, zpráv a podkladů PageFX.',
          gmPagePreview:
            'Spouštět efekty i na stránce, kterou si prohlíží některý PJ (výchozí vypnuto).',
          intensity: 'Násobí, jak často se vyvolávají všechny efekty (výchozí 1).',
          maxSpawnsPerSecond:
            'Nejvyšší počet vyvolání na jedné stránce za sekundu, 1 až 60 (výchozí 30).',
        },
      },
      api: {
        heading: 'Pro jiné Mody',
        intro: 'PageFX zveřejňuje objekt PageFX. Kde funkce přijímá token, funguje i ID tokenu.',
        colFunction: 'Funkce',
        colDesc: 'Co dělá',
        rows: {
          activateAll: 'Obnoví všechny efekty (verze 1).',
          deactivateAll: 'Pozastaví všechny efekty (verze 1).',
          activate: 'Zapne, vypne nebo přepne jeden efekt (verze 1).',
          start: 'Zapne nebo vypne jeden efekt, nebo ho pozastaví a obnoví.',
          setIntensity: 'Změní intenzitu jednoho efektu.',
          fire: 'Hned vyvolá jeden efekt.',
          create:
            'Udělá z tokenu efekt s volbami name, fx, interval, direction a intensity; nebo efekt odebere.',
          getEffect: 'Přečte efekt, vypíše efekty (na jedné stránce) nebo zjistí, zda efekt běží.',
          registerPreset: 'Přidá předvolbu pro tuto relaci, nebo je vypíše.',
          checkToken: 'Zkontroluje token, který váš Mod posunul, vůči spouštěčům vstupu a odchodu.',
        },
      },
      upgrading: {
        heading: 'Přechod z verze 1',
        points: [
          'Tokeny pojmenované PageFX a NullFX se při prvním spuštění převezmou a fungují dál jako dřív.',
          'Dokud efekt nezměníte z chatu, stále ho řídí pole „GM Notes“ jeho tokenu, „Bar 1“ (doba mezi vyvoláními) a „Bar 2“ (směr paprsku) a značka interdiction ho stále vypíná. Jakmile ho změníte z chatu, pole „GM Notes“ a lišty jsou zase vaše.',
          'Verze 1 kreslila efekty jen na stránce s hráčskou záložkou a uložená vlastní FX vyvolávala dvakrát. Obojí je opraveno.',
          'Příkazy verze 1 stále fungují:',
        ],
        colV1: 'Příkaz verze 1',
        colV2: 'Totéž co',
      },
      troubleshooting: {
        heading: 'Řešení problémů',
        points: [
          'Efekt neběží: otevřete jeho kartu. Řádek Stav říká proč: vypnuto, pozastaveno, není vybrán žádný efekt, nemůže běžet (s důvodem), nebo není na aktivní stránce (nejsou tam hráči; pro vyzkoušení zapněte Náhled stránky PJ).',
          'Nic nevidíte: velmi malé nebo krátce žijící částice jsou na rušné mapě špatně vidět. Zkuste předvolbu, zvyšte intenzitu, nebo zmenšete oblast.',
          'Efekty vypadají řídce: stránka možná dosáhla Max. vyvolání za sekundu. Snižte některé intenzity, nebo zvyšte limit.',
          'Efekty se zastavily po zkopírování stránky nebo hry: použijte Znovu prohledat.',
          'Ve všech ostatních případech se podívejte do protokolu konzole API a při žádosti o pomoc přiložte jeho zprávy.',
        ],
      },
      languages: {
        heading: 'Jazyky',
        body: 'Jazyk vyberte na kartě Nastavení nebo příkazem !pagefx set language. Dostupné jazyky:',
        colLanguage: 'Jazyk',
        colNative: 'Původní název',
        colCode: 'Kód',
      },
      credits: {
        heading: 'Poděkování',
        original: 'Původní mod vytvořila',
        maintainer: 'Verzi 2 spravuje',
        marketplace: 'Grafické balíčky od Ady na Roll20 Marketplace',
        support:
          'Pokud najdete chybu nebo máte nápad, napište do fóra Roll20 Mod nebo založte issue na GitHub a přiložte zprávy z protokolu konzole API.',
      },
    },
    triggers: {
      line: '{when}: {action}',
      eachRound: 'Každé nové kolo',
      everyRounds: 'Každých {n} kol',
      onRound: 'V kole {n}',
      turn: 'Když je na tahu {name}',
      enter: 'Když {who} vstoupí do {area}',
      leave: 'Když {who} odejde z {area}',
      areaSelf: 'oblasti tohoto efektu',
      areaSelected: 'aury vybraného tokenu',
      areaOf: 'aury tokenu {name}',
      unnamed: 'token',
      once: '(jen poprvé)',
      onceUsed: '(jen poprvé, už použito)',
      who: {
        players: 'token hráče',
        all: 'jakýkoli token',
      },
      action: {
        start: 'spustit',
        stop: 'zastavit',
        toggle: 'zapnout nebo vypnout',
        fire: 'jednou vyvolat',
        burst: 'vyvolat dávku {count}',
      },
      choice: {
        start: 'Spustit',
        stop: 'Zastavit',
        toggle: 'Zapnout nebo vypnout',
        fire: 'Jednou vyvolat',
        burst: 'Vyvolat dávku',
      },
    },
    packs: {
      weather: 'Počasí',
      fire: 'Oheň a žár',
      water: 'Voda',
      magic: 'Magie a tajemno',
      custom: 'Z jiných Modů',
    },
    presets: {
      'light-rain': 'Slabý déšť',
      'heavy-rain': 'Silný déšť',
      thunderstorm: 'Bouřka',
      snow: 'Sníh',
      blizzard: 'Vánice',
      hail: 'Krupobití',
      sandstorm: 'Písečná bouře',
      fog: 'Chuchvalce mlhy',
      embers: 'Žhavé uhlíky',
      ash: 'Padající popel',
      magma: 'Bublající magma',
      'lava-spurts': 'Výtrysky lávy',
      sparks: 'Jiskry',
      drips: 'Kapky v jeskyni',
      steam: 'Parní průduchy',
      geyser: 'Gejzír',
      spray: 'Tříšť vodopádu',
      bubbles: 'Bubliny',
      fireflies: 'Světlušky',
      'arcane-motes': 'Magické jiskřičky',
      'necrotic-mist': 'Nekrotická mlha',
      'holy-glimmer': 'Svatý třpyt',
      'swamp-gas': 'Bažinný plyn',
    },
    fx: {
      empty: 'není nastaven žádný efekt.',
      badJson: 'definice vlastního FX není platný JSON.',
      unknownColour: 'neexistuje vestavěná barva „{colour}“. Barvy: {colours}.',
      savedMissing: 'neexistuje uložené vlastní FX s názvem „{name}“.',
      cannotCreate: 'Roll20 pro něj odmítl vytvořit objekt vlastního FX.',
      spawnFailed: 'Roll20 ho odmítl vyvolat ({message}).',
    },
    errors: {
      unknownCommand: 'Neznámý příkaz: {command}',
      noEffects: 'Vyberte jeden nebo více tokenů PageFX, nebo zadejte jejich ID pomocí --ids.',
      selectToken: 'Nejprve vyberte jeden nebo více tokenů, nebo zadejte jejich ID pomocí --ids.',
      unknownIds: 'Toto nejsou efekty PageFX: {ids}',
      badSetting: 'Neznámé nastavení nebo hodnota: {setting} {value}',
      noLayer: '„{name}“ nemá vrstvu {n}.',
      tooManyLayers: 'Efekt může mít nanejvýš {max} vrstev.',
      layerUsage: 'Použijte !pagefx layer add [effect] nebo !pagefx layer remove <number>.',
      nullUsage: 'Použijte !pagefx null create nebo !pagefx null remove.',
      isEffect: '„{name}“ je efekt, takže nemůže být zároveň oblastí bez efektů.',
      badInterval: 'Zadejte dobu mezi vyvoláními v ms, například: !pagefx interval 500 1500',
      badDirection:
        'Zadejte random, nebo počet políček doprava a dolů, například: !pagefx direction 2 -1',
      badArea:
        'Zadejte poloměr v jednotkách stránky a circle nebo square, například: !pagefx area 15 circle',
      badIntensity: 'Zadejte intenzitu větší než 0, například: !pagefx intensity 1.5',
      noName: 'Zadejte název, například: !pagefx name Déšť nad přístavem',
      triggerUsage:
        'Použijte !pagefx trigger add <round|turn|enter|leave> <start|stop|toggle|fire|burst> [every=2] [round=3] [count=5] [who=players|all|named] [names=A;B] [area=self|selected] [once], nebo !pagefx trigger remove <number>.',
      triggerToken:
        'Nejprve vyberte na mapě token, kterého se tento spouštěč týká, nebo zadejte token=<id>.',
      triggerNames:
        'Zadejte jména tokenů pomocí names=, oddělená znakem ; (například names=Goblin;Orc).',
      tooManyTriggers: 'Efekt může mít nanejvýš {max} spouštěčů.',
      noTrigger: '„{name}“ nemá spouštěč {n}.',
      journalUsage: 'Použijte !pagefx journal rebuild.',
      unknownPreset: 'Předvolba „{id}“ neexistuje. Předvolby zobrazíte příkazem !pagefx presets.',
      unexpected: 'Něco se pokazilo: {message}',
    },
  };

  const TRANSLATION$8 = {
    titles: {
      ready: 'PageFX er klar.',
      menu: 'PageFX',
      status: 'PageFX-status',
      settings: 'PageFX-indstillinger',
      presets: 'PageFX-skabeloner',
      help: 'PageFX-kommandoer',
      effect: 'Effekt: {name}',
    },
    messages: {
      readyHint: 'Skriv !pagefx for at åbne menuen.',
      adopted:
        'Overtog {effects} effekt(er) og {nulls} effektfri(e) område(r) fra PageFX 1.x-tokens. De virker som før.',
      rescanned:
        'Ny søgning fandt {effects} ny(e) effekt(er) og {nulls} nye effektfri(e) område(r) og glemte {dropped}, hvis tokens var slettet.',
      allPaused: 'Alle effekter er sat på pause. Brug !pagefx resume for at starte dem igen.',
      allResumed: 'Effekterne kører igen.',
      turnedOn: 'Slået til: {count}.',
      turnedOff: 'Slået fra: {count}.',
      toggled: 'Slået til eller fra: {count}.',
      paused: 'Sat på pause: {count}.',
      resumed: 'Genoptaget: {count}.',
      fired: 'Spawnede {count} effekt(er).',
      created: 'Nye effekter: {count}. Vælg på hver effekts infokort, hvad den skal spawne.',
      deleted: 'Effekter fjernet: {count}. Deres tokens er stadig på kortet.',
      renamed: 'Omdøbt: {count}.',
      fxSet: 'Effekt ændret: {count}.',
      intervalSet: 'Interval ændret: {count}.',
      directionSet: 'Retning ændret: {count}.',
      areaSet: 'Område ændret: {count}.',
      intensitySet: 'Intensitet ændret: {count}.',
      layerAdded: 'Lag tilføjet: {count}.',
      layerRemoved: 'Lag fjernet: {count}.',
      nullCreated: 'Nye effektfrie områder: {count}.',
      nullRemoved: 'Effektfrie områder fjernet: {count}.',
      presetApplied: '{name} anvendt: {count}.',
      journalRebuilt: 'Handoutene »{help}« og »{deck}« er blevet genopbygget.',
      triggerAdded: 'Udløser tilføjet: {count}.',
      triggerRemoved: 'Udløser fjernet: {count}.',
      triggersCleared: 'Udløsere fjernet fra {count} effekt(er).',
      throttled:
        'Effekterne på siden »{page}« bliver tyndet ud: de bad om mere end {max} spawns i sekundet. Sænk deres intensitet, eller hæv grænsen med !pagefx set maxSpawnsPerSecond.',
      settingChanged: '{setting} er nu {value}.',
      problem: 'Effekten »{name}« kan ikke køre: {reason}',
    },
    menu: {
      page: 'Side',
      live: 'effekter kører her',
      notLive: 'ingen spillere her',
      allPausedNote: 'Alle effekter er sat på pause.',
      effectsHere: 'Effekter på denne side',
      noEffectsHere: 'Ingen effekter på denne side endnu.',
      otherPages: 'Andre sider',
      effectCount: '{count} effekt(er)',
      actions: 'Ny',
      selectHint:
        'Vælg først en token på kortet, og tryk så på Ny effekt eller Effektfrit område. Tokenen markerer, hvor effekten vises; dens Aura 1 er området.',
      state: 'Tilstand',
      area: 'Område',
      areaValue: '{radius} {units} ud fra tokenen, {shape}',
      circle: 'cirkel',
      square: 'kvadrat',
      circleOption: 'Cirkel',
      squareOption: 'Kvadrat',
      layers: 'Lag',
      layer: 'Lag {n}',
      noLayers: 'Ingen lag. Tilføj et for at vælge, hvad denne effekt spawner.',
      noFxSet: 'ikke valgt',
      timing: 'hvert {min}–{max} ms',
      directionRandom: 'tilfældig retning',
      directionOffset: 'slutter {dx}, {dy} felter væk',
      v1Note:
        'Denne effekt følger stadig sin tokens SL-noter (»GM Notes«) og bjælker, som i PageFX 1.x. Hvis du ændrer den her, stopper det.',
      preset: 'Skabelon',
      presetsHint:
        'Vælg en eller flere tokens på kortet, og tryk så på en skabelon. Tokens, der endnu ikke er effekter, bliver til effekter, og deres Aura 1 er det område, skabelonen fylder.',
      triggers: 'Udløsere',
      noTriggers: 'Ingen udløsere: effekten kører, når der er spillere på dens side.',
      triggerHint:
        'Til en tur-udløser eller et område fra en anden token skal du først vælge den token på kortet.',
      yes: 'Ja',
      no: 'Nej',
    },
    buttons: {
      edit: 'Rediger',
      show: 'Vis',
      turnOn: 'Slå til',
      turnOff: 'Slå fra',
      pause: 'Pause',
      resume: 'Genoptag',
      fire: 'Affyr',
      pauseAll: 'Sæt alle på pause',
      resumeAll: 'Genoptag alle',
      create: 'Ny effekt',
      createNull: 'Effektfrit område',
      removeNull: 'Fjern effektfrit område',
      settings: 'Indstillinger',
      status: 'Status',
      rescan: 'Søg igen',
      rename: 'Omdøb',
      area: 'Område',
      intensity: 'Intensitet',
      builtin: 'Indbyggede FX',
      saved: 'Gemte FX',
      json: 'Egen JSON',
      timing: 'Interval',
      random: 'Tilfældig retning',
      offset: 'Angiv retning',
      addLayer: 'Tilføj lag',
      removeLayer: 'Fjern lag',
      delete: 'Slet effekt',
      preset: 'Skabelon',
      presets: 'Skabeloner',
      remove: 'Fjern',
      help: 'Hjælp',
      rebuild: 'Genopbyg handouts',
      onRound: 'Hver runde',
      onTurn: 'Ved en tur',
      onEnter: 'Token kommer ind',
      onLeave: 'Token går ud',
      menu: 'Menu',
      change: 'Skift',
    },
    prompts: {
      type: 'Effekttype',
      colour: 'Farve',
      saved: 'Gemt egen FX',
      json: 'Egen FX-definition (JSON)',
      intervalMin: 'Korteste tid mellem spawns i ms',
      intervalMax: 'Længste tid mellem spawns i ms',
      dx: 'Felter mod højre til slutningen (negativ er venstre)',
      dy: 'Felter nedad til slutningen (negativ er opad)',
      name: 'Effektens navn',
      radius: 'Områdets radius ud fra tokenen i sideenheder',
      shape: 'Områdets form',
      intensity: 'Intensitet ({min} til {max})',
      maxSpawns: 'Spawns i sekundet på én side (1 til {max})',
      preset: 'Skabelon',
      then: 'Derefter',
      every: 'Hvor mange runder imellem',
      who: 'Hvilke tokens tæller',
      area: 'Hvilket område',
      once: 'Kun første gang?',
      confirmDelete: 'Slet denne effekt? Tokenen bliver på kortet.',
    },
    settings: {
      language: 'Sprog',
      globalIntensity: 'Intensitet for alle effekter',
      gmPreviewHint:
        'Når den er slået til, kører effekter også på den side, hver SL kigger på, selv uden spillere der.',
      maxSpawnsHint:
        'Effekterne tyndes ud på en side, der beder om flere. Roll20 kører glat op til omkring 60.',
    },
    status: {
      livePages: 'Aktive sider',
      effects: 'Effekter',
      running: 'Kører',
      globalPause: 'Alle på pause',
      on: 'Til',
      off: 'Fra',
      pausedState: 'På pause',
      waiting: 'Ikke på en aktiv side',
      noFx: 'Ingen effekt valgt',
      broken: 'Kan ikke køre',
      nullAreas: 'Effektfrie områder',
      noEffects:
        'Ingen effekter endnu. Vælg en token og skriv !pagefx create, eller åbn menuen med !pagefx.',
      gmPreview: 'SL-sideforhåndsvisning',
      intensity: 'Intensitet',
      maxSpawns: 'Maks. spawns i sekundet pr. side',
    },
    help: {
      menu: 'Åbn menuen: effekterne på din side og knapper til alt det andet.',
      create:
        'Gør de valgte tokens til effekter. Deres Aura 1 er området; der tilføjes en, hvis de ikke har nogen.',
      edit: 'Vis infokortet for hver valgt effekt med knapper til at ændre den.',
      preset:
        'Giv de valgte tokens en skabelon, og gør dem først til effekter, hvis det er nødvendigt.',
      presets: 'Vis skabelonerne efter pakke.',
      switches:
        'Slå de valgte effekter til eller fra, eller sæt dem på pause og genoptag dem. Er intet valgt, starter on og resume alt igen, og off og pause standser alt (som !pageFX on og off gjorde i version 1).',
      fire: 'Spawn de valgte effekter nu, én eller et par gange, for at prøve dem.',
      fx: 'Angiv, hvad et lag spawner: en indbygget effekt som burn-fire, navnet på en gemt egen FX eller en egen FX-definition i JSON.',
      interval:
        'Angiv tiden mellem et lags spawns i millisekunder. Hver ventetid vælges tilfældigt mellem de to.',
      direction:
        'For strålelignende effekter: angiv, hvor hver spawn slutter: tilfældigt eller et antal felter mod højre og nedad fra starten.',
      area: 'Angiv området: radius for tokenens Aura 1 i sideenheder og dens form.',
      intensity:
        'Gang, hvor ofte de valgte effekter spawner (0,1 til 5). Med global ændres det for alle effekter.',
      name: 'Omdøb de valgte effekter.',
      layer: 'Tilføj et lag, så én effekt spawner flere ting, eller fjern et.',
      triggerAdd:
        'Tilføj en udløser: ved round, turn, enter eller leave udføres start, stop, toggle, fire eller burst. Valg: every=2, round=3, count=5, who=players|all|named, names=A;B, area=selected, once.',
      triggerRemove: 'Fjern én udløser eller dem alle fra de valgte effekter.',
      null: 'Gør de valgte tokens til effektfrie områder, hvor ingen effekt nogensinde spawner, eller ophæv det igen.',
      delete: 'Fjern effekten fra de valgte tokens. Tokens bliver på kortet.',
      status: 'Vis alle effekter, deres side, og om de kører.',
      settings: 'Vis indstillingerne.',
      set: 'Skift en indstilling: language, gmPagePreview, intensity eller maxSpawnsPerSecond.',
      rescan:
        'Overtag nye tokens med navnet PageFX eller NullFX, og glem effekter, hvis tokens er slettet.',
      journal: 'Genopbyg handoutene Help og Command Deck.',
      help: 'Vis denne liste.',
      handout:
        'Den fulde vejledning står i handoutet »{help}«; knapper med ét klik findes i »{deck}«.',
    },
    deck: {
      menuTitle: 'Menu',
      menuDesc: 'Hovedmenuen viser effekterne på din side. Status viser dem alle.',
      newTitle: 'Ny',
      newDesc:
        'Vælg først en eller flere tokens på kortet. Deres Aura 1 bliver det område, effekten fylder.',
      selectedTitle: 'Valgte effekter',
      selectedDesc: 'Vælg effekt-tokens på kortet, og tryk så på en knap.',
      allTitle: 'Alt',
      allDesc: 'Stands alle effekter, eller start dem alle igen.',
      toolsTitle: 'Værktøjer',
      toolsDesc: 'Saml kopierede eller slettede tokens op, og genopbyg disse handouts.',
      footer: 'Se handoutet »{help}« for den fulde vejledning.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Vejr- og stemningseffekter til Roll20-kort',
      footer: 'Brug handoutet »{deck}« til betjening med ét klik.',
      overview: {
        heading: 'Oversigt',
        body: 'PageFX fylder et område af kortet med effekter, der bliver ved: regn, sne, gløder, damp, ildfluer og mere. En token markerer hver effekts plads, og dens Aura 1 er området. Effekter kører på hver side, hvor der er spillere, også sider, som en delt gruppe er sendt til, og stopper, når spillerne går. Alt indstilles fra chatmenuer, og udløsere kan starte eller stoppe effekter, efterhånden som kamprunder går, eller tokens flytter sig.',
        demo: 'Se en kort demo (fra version 1)',
      },
      quickStart: {
        heading: 'Kom hurtigt i gang',
        steps: [
          'Sæt en token, hvor effekten skal være (på SL-laget er den skjult for spillerne), og vælg den.',
          'Skriv !pagefx presets, eller åbn Command Deck og klik på Skabeloner, og klik så på en skabelon som Kraftig regn.',
          'Ændr størrelsen på tokenens Aura 1 for at bestemme det område, effekten fylder. Auraen er skjult for spillerne.',
          'Flyt spillerne til siden. Effekten starter og stopper igen, når de går.',
          'Skriv !pagefx for at åbne menuen, og klik på Rediger ved en effekt for at ændre den.',
        ],
      },
      effects: {
        heading: 'Effekter',
        points: [
          'En effekt er en token plus indstillinger, som PageFX gemmer. Flyt tokenen for at flytte effekten, og ændr dens Aura 1 for at ændre området. Sletter du tokenen, slettes effekten også.',
          'Hver effekt har et eller flere lag. Hvert lag spawner én ting igen og igen med en tilfældig ventetid mellem sin korteste og længste tid.',
          'Et lag kan spawne en indbygget Roll20-effekt (type og farve, som burn-fire), en egen FX gemt i spillet eller en egen FX-definition indsat som JSON. Manglende værdier i en definition udfyldes, så selv en kort definition tegner noget.',
          'Strålelignende effekter (beam, breath, splatter og egne FX med angle -1) tegnes mellem to punkter. Deres retning er tilfældig eller et fast antal felter mod højre og nedad.',
          'Intensitet ganger, hvor ofte en effekt spawner. Indstillingen intensity ganger alle effekter.',
          'Fra stopper en effekt, indtil den slås til. Pause standser den, indtil den genoptages. Sæt alle på pause standser alle effekter uden at ændre dem.',
          'Jumpgate tegner egne FX-definitioner i hvidt, medmindre de er gemt som egne FX. Derfor gemmer PageFX sine egne som egne FX med navnet »PageFX: …«. De fjernes, når ingen effekt bruger dem. Lad dem være.',
        ],
      },
      pages: {
        heading: 'Hvilke sider der kører',
        points: [
          'Effekter kører på siden med spillerbåndet og på hver side, som en spiller er flyttet til for sig selv.',
          'Slå SL-sideforhåndsvisning til for også at køre effekter på den side, hver SL kigger på, så du kan prøve dem uden spillere.',
          'Hver side får højst Maks. spawns i sekundet (30 som standard). Beder effekterne om flere, springes nogle spawns over, og SL får besked én gang.',
          'Når en anden Mod flytter spillerbåndet eller deler gruppen, siger Roll20 det ikke til nogen. Derfor kigger PageFX efter med få sekunders mellemrum og indhenter det.',
        ],
      },
      presets: {
        heading: 'Skabeloner',
        intro:
          'En skabelon giver en effekt et sæt færdige lag. Ændrer du et lag bagefter, bliver effekten din egen. Andre Mods kan tilføje skabeloner med PageFX.registerPreset.',
        colPack: 'Pakke',
        colPresets: 'Skabeloner (navn og ID)',
      },
      triggers: {
        heading: 'Udløsere',
        intro:
          'En udløser starter, stopper, skifter eller affyrer en effekt, når noget sker. Tilføj dem fra effektens infokort eller med !pagefx trigger add.',
        points: [
          'Hver runde: Roll20 holder ikke styr på rundenummeret, så en runde begynder, når turrækkefølgen går fra sin sidste post tilbage til toppen. Findes der en egen post i turrækkefølgen med navnet »Round«, bruges den i stedet. Vælg hver så mange runder eller én bestemt runde. Den første runde i en kamp tæller ikke som et skift.',
          'Ved en tur: når en valgt token når toppen af turrækkefølgen. Vælg tokenen på kortet, før du klikker på knappen.',
          'Token kommer ind eller går ud: når en token bevæger sig ind i eller ud af effektens område eller Aura 1 på en anden token, du vælger. Som standard tæller kun tokens, som en spiller styrer; vælg alle tokens, eller angiv navne.',
          '»Affyr en salve« spawner effekten flere gange på én gang. Med »Kun første gang« går en udløser kun af én gang.',
          'Roll20 fortæller ikke Mods noget, når en anden Mod flytter en token. Mods, der flytter tokens, kan bagefter kalde PageFX.checkToken(token).',
        ],
      },
      nullAreas: {
        heading: 'Effektfrie områder',
        points: [
          'Et effektfrit område er en token, hvor ingen effekt nogensinde spawner, f.eks. indersiden af et hus i en storm. Dets område er tokenen og dens Aura 1.',
          'Vælg tokenen, og klik på Effektfrit område i menuen eller i Command Deck. Tokens med navnet NullFX er, som i version 1, også effektfrie områder.',
        ],
      },
      commands: {
        heading: 'Kommandoer',
        intro:
          'Kun SL’er kan bruge disse kommandoer. De virker på de valgte tokens eller på de tokens, der er angivet med --ids. Lagkommandoer virker på lag 1, medmindre --layer siger andet. Andre Mods kan også sende dem; svarene går til SL.',
        colCommand: 'Kommando',
        colDesc: 'Hvad den gør',
      },
      settings: {
        heading: 'Indstillinger',
        intro:
          'Skift indstillinger fra infokortet Indstillinger eller med !pagefx set. Sproget kan også indstilles på Mod’ens indstillingsside.',
        colKey: 'Indstilling',
        colDesc: 'Hvad den gør',
        rows: {
          language: 'Sproget i PageFX’ menuer, beskeder og handouts.',
          gmPagePreview: 'Kør også effekter på den side, hver SL kigger på (fra som standard).',
          intensity: 'Ganger, hvor ofte hver effekt spawner (1 som standard).',
          maxSpawnsPerSecond: 'Flest spawns på én side i sekundet, 1 til 60 (30 som standard).',
        },
      },
      api: {
        heading: 'Til andre Mods',
        intro:
          'PageFX udgiver et PageFX-objekt. Hvor en funktion tager en token, virker tokenens ID også.',
        colFunction: 'Funktion',
        colDesc: 'Hvad den gør',
        rows: {
          activateAll: 'Genoptag alle effekter (version 1).',
          deactivateAll: 'Sæt alle effekter på pause (version 1).',
          activate: 'Slå én effekt til, fra eller omvendt (version 1).',
          start: 'Slå én effekt til eller fra, eller sæt den på pause og genoptag den.',
          setIntensity: 'Skift én effekts intensitet.',
          fire: 'Spawn én effekt nu.',
          create:
            'Gør en token til en effekt med valgene name, fx, interval, direction og intensity; eller fjern effekten igen.',
          getEffect: 'Læs en effekt, vis effekterne (på én side), eller spørg, om en kører.',
          registerPreset: 'Tilføj en skabelon for denne session, eller vis dem.',
          checkToken: 'Tjek en token, som din Mod har flyttet, mod udløsere for ind og ud.',
        },
      },
      upgrading: {
        heading: 'Opgradering fra version 1',
        points: [
          'Tokens med navnet PageFX og NullFX overtages ved første start og virker som før.',
          'Indtil du ændrer en effekt fra chatten, styres den stadig af sin tokens SL-noter (»GM Notes«), Bar 1 (tid mellem spawns) og Bar 2 (strålens retning), og statusmarkøren interdiction slår den stadig fra. Når du ændrer den fra chatten, er SL-noterne og bjælkerne dine igen.',
          'Version 1 tegnede kun effekter på siden med spillerbåndet og spawnede gemte egne FX to gange. Begge dele er rettet.',
          'Kommandoerne fra version 1 virker stadig:',
        ],
        colV1: 'Kommando i version 1',
        colV2: 'Svarer til',
      },
      troubleshooting: {
        heading: 'Fejlfinding',
        points: [
          'En effekt kører ikke: åbn dens infokort. Linjen Tilstand siger hvorfor: fra, på pause, ingen effekt valgt, kan ikke køre (med årsagen) eller ikke på en aktiv side (ingen spillere der; slå SL-sideforhåndsvisning til for at prøve den).',
          'Du ser intet: meget små eller kortlivede partikler er svære at se på et travlt kort. Prøv en skabelon, hæv intensiteten, eller gør området mindre.',
          'Effekterne ser tynde ud: siden er måske nået Maks. spawns i sekundet. Sænk nogle intensiteter, eller hæv grænsen.',
          'Effekterne stoppede efter kopiering af en side eller et spil: kør Søg igen.',
          'Ved alt andet: tjek API-konsollens log, og tag dens beskeder med, når du beder om hjælp.',
        ],
      },
      languages: {
        heading: 'Sprog',
        body: 'Vælg et sprog fra infokortet Indstillinger eller med !pagefx set language. Tilgængelige sprog:',
        colLanguage: 'Sprog',
        colNative: 'Eget navn',
        colCode: 'Kode',
      },
      credits: {
        heading: 'Tak til',
        original: 'Oprindelig Mod af',
        maintainer: 'Version 2 vedligeholdt af',
        marketplace: 'Adas kunstpakker på Roll20 Marketplace',
        support:
          'Finder du en fejl eller har en idé, så skriv i Roll20’s Mod-forum eller opret et issue på GitHub, og tag eventuelle beskeder fra API-konsollens log med.',
      },
    },
    triggers: {
      line: '{when}: {action}',
      eachRound: 'Hver ny runde',
      everyRounds: 'Hver {n}. runde',
      onRound: 'I runde {n}',
      turn: 'Når {name}s tur starter',
      enter: 'Når {who} kommer ind i {area}',
      leave: 'Når {who} forlader {area}',
      areaSelf: 'denne effekts område',
      areaSelected: 'den valgte tokens aura',
      areaOf: 'auraen på {name}',
      unnamed: 'en token',
      once: '(kun første gang)',
      onceUsed: '(kun første gang, allerede brugt)',
      who: {
        players: 'en spillertoken',
        all: 'en hvilken som helst token',
      },
      action: {
        start: 'start den',
        stop: 'stop den',
        toggle: 'slå den til eller fra',
        fire: 'affyr den én gang',
        burst: 'affyr en salve på {count}',
      },
      choice: {
        start: 'Start',
        stop: 'Stop',
        toggle: 'Slå til eller fra',
        fire: 'Affyr én gang',
        burst: 'Affyr en salve',
      },
    },
    packs: {
      weather: 'Vejr',
      fire: 'Ild og hede',
      water: 'Vand',
      magic: 'Magi og uhygge',
      custom: 'Fra andre Mods',
    },
    presets: {
      'light-rain': 'Let regn',
      'heavy-rain': 'Kraftig regn',
      thunderstorm: 'Tordenvejr',
      snow: 'Sne',
      blizzard: 'Snestorm',
      hail: 'Hagl',
      sandstorm: 'Sandstorm',
      fog: 'Tågedotter',
      embers: 'Gløder',
      ash: 'Faldende aske',
      magma: 'Boblende magma',
      'lava-spurts': 'Lavasprøjt',
      sparks: 'Gnister',
      drips: 'Dryp i grotten',
      steam: 'Dampudslip',
      geyser: 'Gejser',
      spray: 'Vandfaldssprøjt',
      bubbles: 'Bobler',
      fireflies: 'Ildfluer',
      'arcane-motes': 'Arkane lyskorn',
      'necrotic-mist': 'Nekrotisk tåge',
      'holy-glimmer': 'Helligt skær',
      'swamp-gas': 'Sumpgas',
    },
    fx: {
      empty: 'der er ikke valgt nogen effekt.',
      badJson: 'den egne FX-definition er ikke gyldig JSON.',
      unknownColour: 'der er ingen indbygget farve »{colour}«. Farver: {colours}.',
      savedMissing: 'der er ingen gemt egen FX med navnet »{name}«.',
      cannotCreate: 'Roll20 ville ikke oprette et eget FX-objekt til den.',
      spawnFailed: 'Roll20 ville ikke spawne den ({message}).',
    },
    errors: {
      unknownCommand: 'Ukendt kommando: {command}',
      noEffects: 'Vælg en eller flere PageFX-tokens, eller angiv deres ID’er med --ids.',
      selectToken: 'Vælg først en eller flere tokens, eller angiv deres ID’er med --ids.',
      unknownIds: 'Disse er ikke PageFX-effekter: {ids}',
      badSetting: 'Ukendt indstilling eller værdi: {setting} {value}',
      noLayer: '»{name}« har intet lag {n}.',
      tooManyLayers: 'En effekt kan højst have {max} lag.',
      layerUsage: 'Brug !pagefx layer add [effect] eller !pagefx layer remove <number>.',
      nullUsage: 'Brug !pagefx null create eller !pagefx null remove.',
      isEffect: '»{name}« er en effekt, så den kan ikke også være et effektfrit område.',
      badInterval: 'Angiv tiden mellem spawns i ms, for eksempel: !pagefx interval 500 1500',
      badDirection:
        'Angiv random eller felter mod højre og nedad, for eksempel: !pagefx direction 2 -1',
      badArea:
        'Angiv en radius i sideenheder og circle eller square, for eksempel: !pagefx area 15 circle',
      badIntensity: 'Angiv en intensitet over 0, for eksempel: !pagefx intensity 1.5',
      noName: 'Angiv et navn, for eksempel: !pagefx name Regn over havnen',
      triggerUsage:
        'Brug !pagefx trigger add <round|turn|enter|leave> <start|stop|toggle|fire|burst> [every=2] [round=3] [count=5] [who=players|all|named] [names=A;B] [area=self|selected] [once] eller !pagefx trigger remove <number>.',
      triggerToken:
        'Vælg først den token på kortet, som denne udløser handler om, eller angiv token=<id>.',
      triggerNames: 'Angiv tokennavnene med names=, adskilt af ; (for eksempel names=Goblin;Orc).',
      tooManyTriggers: 'En effekt kan højst have {max} udløsere.',
      noTrigger: '»{name}« har ingen udløser {n}.',
      journalUsage: 'Brug !pagefx journal rebuild.',
      unknownPreset: 'Der er ingen skabelon »{id}«. Skriv !pagefx presets for at se dem.',
      unexpected: 'Noget gik galt: {message}',
    },
  };

  const TRANSLATION$7 = {
    titles: {
      ready: 'PageFX is klaar.',
      menu: 'PageFX',
      status: 'PageFX-status',
      settings: 'PageFX-instellingen',
      presets: 'PageFX-presets',
      help: 'PageFX-commando’s',
      effect: 'Effect: {name}',
    },
    messages: {
      readyHint: 'Typ !pagefx om het menu te openen.',
      adopted:
        '{effects} effect(en) en {nulls} effectvrij(e) gebied(en) overgenomen van PageFX 1.x-tokens. Ze werken gewoon zoals voorheen.',
      rescanned:
        'Opnieuw zoeken vond {effects} nieuw(e) effect(en) en {nulls} nieuw(e) effectvrij(e) gebied(en), en vergat er {dropped} waarvan de tokens verwijderd zijn.',
      allPaused: 'Alle effecten zijn gepauzeerd. Gebruik !pagefx resume om ze weer te starten.',
      allResumed: 'De effecten lopen weer.',
      turnedOn: 'Aangezet: {count}.',
      turnedOff: 'Uitgezet: {count}.',
      toggled: 'Aan- of uitgezet: {count}.',
      paused: 'Gepauzeerd: {count}.',
      resumed: 'Hervat: {count}.',
      fired: '{count} effect(en) gespawnd.',
      created: 'Nieuwe effecten: {count}. Kies op de infokaart van elk effect wat het spawnt.',
      deleted: 'Effecten verwijderd: {count}. Hun tokens staan nog op de kaart.',
      renamed: 'Hernoemd: {count}.',
      fxSet: 'Effect gewijzigd: {count}.',
      intervalSet: 'Tussentijd gewijzigd: {count}.',
      directionSet: 'Richting gewijzigd: {count}.',
      areaSet: 'Gebied gewijzigd: {count}.',
      intensitySet: 'Intensiteit gewijzigd: {count}.',
      layerAdded: 'Laag toegevoegd: {count}.',
      layerRemoved: 'Laag verwijderd: {count}.',
      nullCreated: 'Nieuwe effectvrije gebieden: {count}.',
      nullRemoved: 'Effectvrije gebieden verwijderd: {count}.',
      presetApplied: '{name} toegepast: {count}.',
      journalRebuilt: 'De handouts ‘{help}’ en ‘{deck}’ zijn opnieuw gemaakt.',
      triggerAdded: 'Trigger toegevoegd: {count}.',
      triggerRemoved: 'Trigger verwijderd: {count}.',
      triggersCleared: 'Triggers verwijderd van {count} effect(en).',
      throttled:
        'De effecten op de pagina ‘{page}’ worden uitgedund: ze vroegen om meer dan {max} spawns per seconde. Verlaag hun intensiteit, of verhoog de limiet met !pagefx set maxSpawnsPerSecond.',
      settingChanged: '{setting} is nu {value}.',
      problem: 'Het effect ‘{name}’ kan niet lopen: {reason}',
    },
    menu: {
      page: 'Pagina',
      live: 'effecten lopen hier',
      notLive: 'geen spelers hier',
      allPausedNote: 'Alle effecten zijn gepauzeerd.',
      effectsHere: 'Effecten op deze pagina',
      noEffectsHere: 'Nog geen effecten op deze pagina.',
      otherPages: 'Andere pagina’s',
      effectCount: '{count} effect(en)',
      actions: 'Nieuw',
      selectHint:
        'Selecteer eerst een token op de kaart en klik dan op Nieuw effect of Effectvrij gebied. Het token geeft aan waar het effect verschijnt; zijn Aura 1 is het gebied.',
      state: 'Toestand',
      area: 'Gebied',
      areaValue: '{radius} {units} rond het token, {shape}',
      circle: 'cirkel',
      square: 'vierkant',
      circleOption: 'Cirkel',
      squareOption: 'Vierkant',
      layers: 'Lagen',
      layer: 'Laag {n}',
      noLayers: 'Geen lagen. Voeg er een toe om te kiezen wat dit effect spawnt.',
      noFxSet: 'niet ingesteld',
      timing: 'elke {min}–{max} ms',
      directionRandom: 'willekeurige richting',
      directionOffset: 'eindigt {dx}, {dy} vakjes verder',
      v1Note:
        'Dit effect volgt nog de SL-notities (‘GM Notes’) en balken van zijn token, zoals in PageFX 1.x. Als je het hier wijzigt, stopt dat.',
      preset: 'Preset',
      presetsHint:
        'Selecteer een of meer tokens op de kaart en klik dan op een preset. Tokens die nog geen effect zijn, worden effecten, en hun Aura 1 is het gebied dat de preset vult.',
      triggers: 'Triggers',
      noTriggers: 'Geen triggers: het effect loopt zolang er spelers op zijn pagina zijn.',
      triggerHint:
        'Voor een beurttrigger, of een gebied van een ander token, selecteer je eerst dat token op de kaart.',
      yes: 'Ja',
      no: 'Nee',
    },
    buttons: {
      edit: 'Bewerken',
      show: 'Tonen',
      turnOn: 'Aanzetten',
      turnOff: 'Uitzetten',
      pause: 'Pauzeren',
      resume: 'Hervatten',
      fire: 'Afvuren',
      pauseAll: 'Alles pauzeren',
      resumeAll: 'Alles hervatten',
      create: 'Nieuw effect',
      createNull: 'Effectvrij gebied',
      removeNull: 'Effectvrij gebied verwijderen',
      settings: 'Instellingen',
      status: 'Status',
      rescan: 'Opnieuw zoeken',
      rename: 'Hernoemen',
      area: 'Gebied',
      intensity: 'Intensiteit',
      builtin: 'Ingebouwde FX',
      saved: 'Opgeslagen FX',
      json: 'Eigen JSON',
      timing: 'Tussentijd',
      random: 'Willekeurige richting',
      offset: 'Richting instellen',
      addLayer: 'Laag toevoegen',
      removeLayer: 'Laag verwijderen',
      delete: 'Effect verwijderen',
      preset: 'Preset',
      presets: 'Presets',
      remove: 'Verwijderen',
      help: 'Help',
      rebuild: 'Handouts opnieuw maken',
      onRound: 'Elke ronde',
      onTurn: 'Bij een beurt',
      onEnter: 'Token komt binnen',
      onLeave: 'Token gaat weg',
      menu: 'Menu',
      change: 'Wijzigen',
    },
    prompts: {
      type: 'Soort effect',
      colour: 'Kleur',
      saved: 'Opgeslagen eigen FX',
      json: 'Eigen FX-definitie (JSON)',
      intervalMin: 'Kortste tijd tussen spawns in ms',
      intervalMax: 'Langste tijd tussen spawns in ms',
      dx: 'Vakjes naar rechts tot het eind (negatief is links)',
      dy: 'Vakjes omlaag tot het eind (negatief is omhoog)',
      name: 'Naam van het effect',
      radius: 'Straal van het gebied rond het token in pagina-eenheden',
      shape: 'Vorm van het gebied',
      intensity: 'Intensiteit ({min} tot {max})',
      maxSpawns: 'Spawns per seconde op één pagina (1 tot {max})',
      preset: 'Preset',
      then: 'Daarna',
      every: 'Om de hoeveel rondes',
      who: 'Welke tokens tellen mee',
      area: 'Welk gebied',
      once: 'Alleen de eerste keer?',
      confirmDelete: 'Dit effect verwijderen? Het token blijft op de kaart.',
    },
    settings: {
      language: 'Taal',
      globalIntensity: 'Intensiteit voor alle effecten',
      gmPreviewHint:
        'Als dit aan staat, lopen effecten ook op de pagina waar elke SL naar kijkt, zelfs als er geen spelers zijn.',
      maxSpawnsHint:
        'Op een pagina die om meer vraagt, worden de effecten uitgedund. Roll20 blijft soepel tot ongeveer 60.',
    },
    status: {
      livePages: 'Actieve pagina’s',
      effects: 'Effecten',
      running: 'Loopt',
      globalPause: 'Alles gepauzeerd',
      on: 'Aan',
      off: 'Uit',
      pausedState: 'Gepauzeerd',
      waiting: 'Niet op een actieve pagina',
      noFx: 'Geen effect gekozen',
      broken: 'Kan niet lopen',
      nullAreas: 'Effectvrije gebieden',
      noEffects:
        'Nog geen effecten. Selecteer een token en typ !pagefx create, of open het menu met !pagefx.',
      gmPreview: 'SL-paginavoorbeeld',
      intensity: 'Intensiteit',
      maxSpawns: 'Max. spawns per seconde, per pagina',
    },
    help: {
      menu: 'Opent het menu: de effecten op jouw pagina, en knoppen voor al het andere.',
      create:
        'Maakt van de geselecteerde tokens effecten. Hun Aura 1 is het gebied; als ze er geen hebben, wordt er een toegevoegd.',
      edit: 'Toont de infokaart van elk geselecteerd effect, met knoppen om het te wijzigen.',
      preset: 'Geeft de geselecteerde tokens een preset, en maakt er zo nodig eerst effecten van.',
      presets: 'Toont de presets, per pakket.',
      switches:
        'Zet de geselecteerde effecten aan of uit, of pauzeert en hervat ze. Als er niets geselecteerd is, starten on en resume alles weer en houden off en pause alles stil (zoals !pageFX on en off in versie 1 deden).',
      fire: 'Spawnt de geselecteerde effecten nu, een of een paar keer, om ze uit te proberen.',
      fx: 'Stelt in wat een laag spawnt: een ingebouwd effect zoals burn-fire, de naam van een opgeslagen eigen FX, of een eigen FX-definitie in JSON.',
      interval:
        'Stelt de tijd tussen de spawns van een laag in, in milliseconden. Elke wachttijd wordt willekeurig tussen de twee gekozen.',
      direction:
        'Stelt voor straalvormige effecten in waar elke spawn eindigt: willekeurig, of een aantal vakjes naar rechts en omlaag vanaf het begin.',
      area: 'Stelt het gebied in: de straal van de Aura 1 van het token in pagina-eenheden, en de vorm.',
      intensity:
        'Vermenigvuldigt hoe vaak de geselecteerde effecten spawnen (0,1 tot 5). Met global geldt het voor alle effecten.',
      name: 'Hernoemt de geselecteerde effecten.',
      layer: 'Voegt een laag toe, zodat één effect meerdere dingen spawnt, of verwijdert er een.',
      triggerAdd:
        'Voegt een trigger toe: bij round, turn, enter of leave wordt start, stop, toggle, fire of burst uitgevoerd. Opties: every=2, round=3, count=5, who=players|all|named, names=A;B, area=selected, once.',
      triggerRemove: 'Verwijdert één trigger, of allemaal, van de geselecteerde effecten.',
      null: 'Maakt van de geselecteerde tokens effectvrije gebieden, waar nooit een effect spawnt, of maakt dat ongedaan.',
      delete: 'Haalt het effect van de geselecteerde tokens af. De tokens blijven op de kaart.',
      status: 'Toont elk effect, zijn pagina, en of het loopt.',
      settings: 'Toont de instellingen.',
      set: 'Wijzigt een instelling: language, gmPagePreview, intensity of maxSpawnsPerSecond.',
      rescan:
        'Neemt nieuwe tokens met de naam PageFX of NullFX over, en vergeet effecten waarvan de tokens verwijderd zijn.',
      journal: 'Maakt de handouts Help en Command Deck opnieuw.',
      help: 'Toont deze lijst.',
      handout:
        'De volledige uitleg staat in de handout ‘{help}’; knoppen voor één klik staan in ‘{deck}’.',
    },
    deck: {
      menuTitle: 'Menu',
      menuDesc: 'Het hoofdmenu toont de effecten op jouw pagina. Status toont ze allemaal.',
      newTitle: 'Nieuw',
      newDesc:
        'Selecteer eerst een of meer tokens op de kaart. Hun Aura 1 wordt het gebied dat het effect vult.',
      selectedTitle: 'Geselecteerde effecten',
      selectedDesc: 'Selecteer effecttokens op de kaart en klik dan op een knop.',
      allTitle: 'Alles',
      allDesc: 'Alle effecten stilzetten, of ze allemaal weer starten.',
      toolsTitle: 'Gereedschap',
      toolsDesc: 'Gekopieerde of verwijderde tokens oppikken, en deze handouts opnieuw maken.',
      footer: 'Zie de handout ‘{help}’ voor de volledige uitleg.',
    },
    handout: {
      versionLabel: 'Versie',
      subtitle: 'Weer- en sfeereffecten voor Roll20-kaarten',
      footer: 'Gebruik de handout ‘{deck}’ voor bediening met één klik.',
      overview: {
        heading: 'Overzicht',
        body: 'PageFX vult een gebied van de kaart met effecten die doorgaan: regen, sneeuw, gloeiende sintels, stoom, vuurvliegjes en meer. Een token geeft de plek van elk effect aan, en zijn Aura 1 is het gebied. Effecten lopen op elke pagina waar spelers zijn, ook op pagina’s waar een opgesplitste groep naartoe is gestuurd, en stoppen als de spelers vertrekken. Alles wordt ingesteld via chatmenu’s, en triggers kunnen effecten starten of stoppen terwijl gevechtsrondes voorbijgaan of tokens bewegen.',
        demo: 'Bekijk een korte demo (van versie 1)',
      },
      quickStart: {
        heading: 'Snel aan de slag',
        steps: [
          'Zet een token waar het effect moet komen (op de SL-laag blijft het verborgen voor spelers) en selecteer het.',
          'Typ !pagefx presets, of open het Command Deck en klik op Presets, en klik dan op een preset zoals Zware regen.',
          'Pas de grootte van de Aura 1 van het token aan om het gebied te bepalen dat het effect vult. De aura is verborgen voor spelers.',
          'Verplaats de spelers naar de pagina. Het effect start, en stopt weer als ze vertrekken.',
          'Typ !pagefx om het menu te openen, en klik bij een effect op Bewerken om het te wijzigen.',
        ],
      },
      effects: {
        heading: 'Effecten',
        points: [
          'Een effect is een token plus instellingen die PageFX bewaart. Verplaats het token om het effect te verplaatsen, en wijzig zijn Aura 1 om het gebied te wijzigen. Als je het token verwijdert, verwijder je ook het effect.',
          'Elk effect heeft een of meer lagen. Elke laag spawnt steeds opnieuw één ding, met een willekeurige wachttijd tussen zijn kortste en langste tijd.',
          'Een laag kan een ingebouwd Roll20-effect spawnen (soort en kleur, zoals burn-fire), een eigen FX die in het spel is opgeslagen, of een eigen FX-definitie die als JSON is geplakt. Ontbrekende waarden in een definitie worden aangevuld, dus ook een korte definitie tekent iets.',
          'Straalvormige effecten (beam, breath, splatter, en eigen FX met angle -1) worden tussen twee punten getekend. Hun richting is willekeurig, of een vast aantal vakjes naar rechts en omlaag.',
          'Intensiteit vermenigvuldigt hoe vaak een effect spawnt. De instelling intensity vermenigvuldigt alle effecten.',
          'Uit stopt een effect tot het weer aangezet wordt. Pauzeren houdt het stil tot het hervat wordt. Alles pauzeren houdt alle effecten stil zonder ze te wijzigen.',
          'Jumpgate tekent eigen FX-definities in het wit, tenzij ze als eigen FX zijn opgeslagen. Daarom slaat PageFX die van zichzelf op als eigen FX met de naam ‘PageFX: …’. Ze worden verwijderd als geen enkel effect ze nog gebruikt. Laat ze staan.',
        ],
      },
      pages: {
        heading: 'Op welke pagina’s effecten lopen',
        points: [
          'Effecten lopen op de pagina met het spelerslint en op elke pagina waar een speler apart naartoe is verplaatst.',
          'Zet SL-paginavoorbeeld aan om effecten ook te laten lopen op de pagina waar elke SL naar kijkt, zodat je ze zonder spelers kunt uitproberen.',
          'Elke pagina krijgt hooguit Max. spawns per seconde (standaard 30). Vragen de effecten om meer, dan worden sommige spawns overgeslagen, en krijgt de SL één keer een melding.',
          'Als een andere Mod het spelerslint verplaatst of de groep opsplitst, meldt Roll20 dat aan niemand. Daarom kijkt PageFX om de paar seconden en haalt het de achterstand in.',
        ],
      },
      presets: {
        heading: 'Presets',
        intro:
          'Een preset geeft een effect een reeks kant-en-klare lagen. Wijzig je daarna een laag, dan wordt het effect helemaal van jou. Andere Mods kunnen presets toevoegen met PageFX.registerPreset.',
        colPack: 'Pakket',
        colPresets: 'Presets (naam en ID)',
      },
      triggers: {
        heading: 'Triggers',
        intro:
          'Een trigger start, stopt, schakelt of vuurt een effect af als er iets gebeurt. Voeg ze toe via de infokaart van het effect, of met !pagefx trigger add.',
        points: [
          'Elke ronde: Roll20 houdt geen rondenummer bij, dus een ronde begint als de beurtvolgorde van de laatste regel terug naar boven gaat. Is er een eigen regel in de beurtvolgorde met de naam ‘Round’, dan wordt die gebruikt. Kies om de zoveel rondes, of één ronde. De eerste ronde van een gevecht telt niet als wissel.',
          'Bij een beurt: als een gekozen token bovenaan de beurtvolgorde komt. Selecteer het token op de kaart voordat je op de knop klikt.',
          'Token komt binnen of gaat weg: als een token het gebied van het effect in- of uitgaat, of de Aura 1 van een ander token dat je selecteert. Standaard tellen alleen tokens die een speler bestuurt; kies elk token, of geef namen op.',
          '‘Salvo afvuren’ spawnt het effect meerdere keren tegelijk. Met ‘Alleen de eerste keer’ gaat een trigger maar één keer af.',
          'Roll20 vertelt Mods niets als een andere Mod een token verplaatst. Mods die tokens verplaatsen, kunnen daarna PageFX.checkToken(token) aanroepen.',
        ],
      },
      nullAreas: {
        heading: 'Effectvrije gebieden',
        points: [
          'Een effectvrij gebied is een token waar nooit een effect spawnt, zoals de binnenkant van een huis in een storm. Zijn gebied is het token en zijn Aura 1.',
          'Selecteer het token en klik op Effectvrij gebied in het menu of het Command Deck. Tokens met de naam NullFX zijn, net als in versie 1, ook effectvrije gebieden.',
        ],
      },
      commands: {
        heading: 'Commando’s',
        intro:
          'Alleen SL’s kunnen deze commando’s gebruiken. Ze werken op de geselecteerde tokens, of op de tokens die met --ids zijn opgegeven. Laagcommando’s werken op laag 1, tenzij --layer iets anders zegt. Andere Mods kunnen ze ook sturen; antwoorden gaan naar de SL.',
        colCommand: 'Commando',
        colDesc: 'Wat het doet',
      },
      settings: {
        heading: 'Instellingen',
        intro:
          'Wijzig instellingen via de infokaart Instellingen, of met !pagefx set. De taal kan ook worden ingesteld op de instellingenpagina van de Mod.',
        colKey: 'Instelling',
        colDesc: 'Wat het doet',
        rows: {
          language: 'De taal van de menu’s, berichten en handouts van PageFX.',
          gmPagePreview:
            'Laat effecten ook lopen op de pagina waar elke SL naar kijkt (standaard uit).',
          intensity: 'Vermenigvuldigt hoe vaak elk effect spawnt (standaard 1).',
          maxSpawnsPerSecond:
            'Het hoogste aantal spawns op één pagina per seconde, 1 tot 60 (standaard 30).',
        },
      },
      api: {
        heading: 'Voor andere Mods',
        intro:
          'PageFX stelt een PageFX-object beschikbaar. Waar een functie een token verwacht, werkt de ID van het token ook.',
        colFunction: 'Functie',
        colDesc: 'Wat het doet',
        rows: {
          activateAll: 'Hervat alle effecten (versie 1).',
          deactivateAll: 'Pauzeert alle effecten (versie 1).',
          activate: 'Zet één effect aan, uit, of andersom (versie 1).',
          start: 'Zet één effect aan of uit, of pauzeert en hervat het.',
          setIntensity: 'Wijzigt de intensiteit van één effect.',
          fire: 'Spawnt één effect nu.',
          create:
            'Maakt van een token een effect, met de opties name, fx, interval, direction en intensity; of haalt het effect eraf.',
          getEffect:
            'Leest een effect, toont de effecten (op één pagina), of vraagt of er een loopt.',
          registerPreset: 'Voegt een preset toe voor deze sessie, of toont ze.',
          checkToken:
            'Controleert een token dat jouw Mod verplaatste aan de triggers voor binnenkomen en weggaan.',
        },
      },
      upgrading: {
        heading: 'Upgraden vanaf versie 1',
        points: [
          'Tokens met de naam PageFX en NullFX worden bij de eerste start overgenomen en werken gewoon zoals voorheen.',
          'Totdat je een effect via de chat wijzigt, sturen de SL-notities (‘GM Notes’), Bar 1 (tijd tussen spawns) en Bar 2 (straalrichting) van zijn token het nog aan, en zet de statusmarkering interdiction het nog uit. Zodra je het via de chat wijzigt, zijn de SL-notities en balken weer van jou.',
          'Versie 1 tekende effecten alleen op de pagina met het spelerslint, en spawnde opgeslagen eigen FX twee keer. Beide zijn opgelost.',
          'De commando’s van versie 1 werken nog steeds:',
        ],
        colV1: 'Commando van versie 1',
        colV2: 'Hetzelfde als',
      },
      troubleshooting: {
        heading: 'Problemen oplossen',
        points: [
          'Een effect loopt niet: open zijn infokaart. De regel Toestand zegt waarom: uit, gepauzeerd, geen effect gekozen, kan niet lopen (met de reden), of niet op een actieve pagina (geen spelers daar; zet SL-paginavoorbeeld aan om het uit te proberen).',
          'Je ziet niets: heel kleine of kortlevende deeltjes zijn moeilijk te zien op een drukke kaart. Probeer een preset, verhoog de intensiteit, of maak het gebied kleiner.',
          'Effecten zien er dun uit: de pagina zit misschien op Max. spawns per seconde. Verlaag een paar intensiteiten, of verhoog de limiet.',
          'Effecten gestopt na het kopiëren van een pagina of spel: gebruik Opnieuw zoeken.',
          'Bij al het andere: kijk in het logboek van de API-console en voeg de berichten toe als je om hulp vraagt.',
        ],
      },
      languages: {
        heading: 'Talen',
        body: 'Kies een taal via de infokaart Instellingen, of met !pagefx set language. Beschikbare talen:',
        colLanguage: 'Taal',
        colNative: 'Eigen naam',
        colCode: 'Code',
      },
      credits: {
        heading: 'Met dank aan',
        original: 'Originele Mod door',
        maintainer: 'Versie 2 onderhouden door',
        marketplace: 'Ada’s kunstpakketten op de Roll20 Marketplace',
        support:
          'Vind je een bug of heb je een idee, post dan op het Roll20 Mod-forum of open een issue op GitHub, en voeg eventuele berichten uit het logboek van de API-console toe.',
      },
    },
    triggers: {
      line: '{when}: {action}',
      eachRound: 'Elke nieuwe ronde',
      everyRounds: 'Om de {n} rondes',
      onRound: 'In ronde {n}',
      turn: 'Als de beurt van {name} begint',
      enter: 'Als {who} {area} binnenkomt',
      leave: 'Als {who} {area} verlaat',
      areaSelf: 'het gebied van dit effect',
      areaSelected: 'de aura van het geselecteerde token',
      areaOf: 'de aura van {name}',
      unnamed: 'een token',
      once: '(alleen de eerste keer)',
      onceUsed: '(alleen de eerste keer, al gebruikt)',
      who: {
        players: 'een spelerstoken',
        all: 'een willekeurig token',
      },
      action: {
        start: 'starten',
        stop: 'stoppen',
        toggle: 'aan- of uitzetten',
        fire: 'één keer afvuren',
        burst: 'een salvo van {count} afvuren',
      },
      choice: {
        start: 'Starten',
        stop: 'Stoppen',
        toggle: 'Aan- of uitzetten',
        fire: 'Eén keer afvuren',
        burst: 'Salvo afvuren',
      },
    },
    packs: {
      weather: 'Weer',
      fire: 'Vuur en hitte',
      water: 'Water',
      magic: 'Magie en griezel',
      custom: 'Van andere Mods',
    },
    presets: {
      'light-rain': 'Lichte regen',
      'heavy-rain': 'Zware regen',
      thunderstorm: 'Onweer',
      snow: 'Sneeuw',
      blizzard: 'Sneeuwstorm',
      hail: 'Hagel',
      sandstorm: 'Zandstorm',
      fog: 'Mistflarden',
      embers: 'Sintels',
      ash: 'Vallende as',
      magma: 'Borrelend magma',
      'lava-spurts': 'Lavaspatten',
      sparks: 'Vonken',
      drips: 'Druppels in de grot',
      steam: 'Stoomgaten',
      geyser: 'Geiser',
      spray: 'Watervalnevel',
      bubbles: 'Bellen',
      fireflies: 'Vuurvliegjes',
      'arcane-motes': 'Arcane lichtjes',
      'necrotic-mist': 'Necrotische mist',
      'holy-glimmer': 'Heilige glans',
      'swamp-gas': 'Moerasgas',
    },
    fx: {
      empty: 'er is geen effect ingesteld.',
      badJson: 'de eigen FX-definitie is geen geldige JSON.',
      unknownColour: 'er is geen ingebouwde kleur ‘{colour}’. Kleuren: {colours}.',
      savedMissing: 'er is geen opgeslagen eigen FX met de naam ‘{name}’.',
      cannotCreate: 'Roll20 wilde er geen eigen FX-object voor maken.',
      spawnFailed: 'Roll20 wilde het niet spawnen ({message}).',
    },
    errors: {
      unknownCommand: 'Onbekend commando: {command}',
      noEffects: 'Selecteer een of meer PageFX-tokens, of geef hun ID’s op met --ids.',
      selectToken: 'Selecteer eerst een of meer tokens, of geef hun ID’s op met --ids.',
      unknownIds: 'Dit zijn geen PageFX-effecten: {ids}',
      badSetting: 'Onbekende instelling of waarde: {setting} {value}',
      noLayer: '‘{name}’ heeft geen laag {n}.',
      tooManyLayers: 'Een effect kan hooguit {max} lagen hebben.',
      layerUsage: 'Gebruik !pagefx layer add [effect] of !pagefx layer remove <number>.',
      nullUsage: 'Gebruik !pagefx null create of !pagefx null remove.',
      isEffect: '‘{name}’ is een effect, dus het kan niet ook een effectvrij gebied zijn.',
      badInterval: 'Geef de tijd tussen spawns op in ms, bijvoorbeeld: !pagefx interval 500 1500',
      badDirection:
        'Geef random op, of vakjes naar rechts en omlaag, bijvoorbeeld: !pagefx direction 2 -1',
      badArea:
        'Geef een straal op in pagina-eenheden, en circle of square, bijvoorbeeld: !pagefx area 15 circle',
      badIntensity: 'Geef een intensiteit boven 0 op, bijvoorbeeld: !pagefx intensity 1.5',
      noName: 'Geef een naam op, bijvoorbeeld: !pagefx name Regen boven de haven',
      triggerUsage:
        'Gebruik !pagefx trigger add <round|turn|enter|leave> <start|stop|toggle|fire|burst> [every=2] [round=3] [count=5] [who=players|all|named] [names=A;B] [area=self|selected] [once], of !pagefx trigger remove <number>.',
      triggerToken:
        'Selecteer eerst het token op de kaart waar deze trigger over gaat, of geef token=<id> op.',
      triggerNames:
        'Geef de namen van de tokens op met names=, gescheiden door ; (bijvoorbeeld names=Goblin;Orc).',
      tooManyTriggers: 'Een effect kan hooguit {max} triggers hebben.',
      noTrigger: '‘{name}’ heeft geen trigger {n}.',
      journalUsage: 'Gebruik !pagefx journal rebuild.',
      unknownPreset: 'Er is geen preset ‘{id}’. Typ !pagefx presets om ze te zien.',
      unexpected: 'Er ging iets mis: {message}',
    },
  };

  var localeEnUS = {
    titles: {
      ready: 'PageFX is ready.',
      menu: 'PageFX',
      status: 'PageFX Status',
      settings: 'PageFX Settings',
      presets: 'PageFX Presets',
      help: 'PageFX Commands',
      effect: 'Effect: {name}',
    },
    messages: {
      readyHint: 'Type !pagefx to open the menu.',
      adopted:
        'Took over {effects} effect(s) and {nulls} no-effect area(s) from PageFX 1.x tokens. They keep working as before.',
      rescanned:
        'Rescan found {effects} new effect(s) and {nulls} new no-effect area(s), and forgot {dropped} whose tokens were deleted.',
      allPaused: 'All effects are paused. Use !pagefx resume to start them again.',
      allResumed: 'Effects are running again.',
      turnedOn: 'Turned on: {count}.',
      turnedOff: 'Turned off: {count}.',
      toggled: 'Switched on or off: {count}.',
      paused: 'Paused: {count}.',
      resumed: 'Resumed: {count}.',
      fired: 'Spawned {count} effect(s).',
      created: 'New effects: {count}. Pick what each one spawns on its card.',
      deleted: 'Effects removed: {count}. Their tokens are still on the map.',
      renamed: 'Renamed: {count}.',
      fxSet: 'Effect changed: {count}.',
      intervalSet: 'Timing changed: {count}.',
      directionSet: 'Direction changed: {count}.',
      areaSet: 'Area changed: {count}.',
      intensitySet: 'Intensity changed: {count}.',
      layerAdded: 'Layer added: {count}.',
      layerRemoved: 'Layer removed: {count}.',
      nullCreated: 'New no-effect areas: {count}.',
      nullRemoved: 'No-effect areas removed: {count}.',
      presetApplied: '{name} applied: {count}.',
      journalRebuilt: 'The "{help}" and "{deck}" handouts have been rebuilt.',
      triggerAdded: 'Trigger added: {count}.',
      triggerRemoved: 'Trigger removed: {count}.',
      triggersCleared: 'Triggers removed from {count} effect(s).',
      throttled:
        'Effects on the page "{page}" are being thinned: they asked for more than {max} spawns a second. Lower their intensity, or raise the limit with !pagefx set maxSpawnsPerSecond.',
      settingChanged: '{setting} is now {value}.',
      problem: 'The effect "{name}" cannot run: {reason}',
    },
    menu: {
      page: 'Page',
      live: 'effects run here',
      notLive: 'no players here',
      allPausedNote: 'All effects are paused.',
      effectsHere: 'Effects on this page',
      noEffectsHere: 'No effects on this page yet.',
      otherPages: 'Other pages',
      effectCount: '{count} effect(s)',
      actions: 'New',
      selectHint:
        'Select a token on the map first, then press New effect or No-effect area. The token marks where the effect appears; its Aura 1 is the area.',
      state: 'State',
      area: 'Area',
      areaValue: '{radius} {units} beyond the token, {shape}',
      circle: 'circle',
      square: 'square',
      circleOption: 'Circle',
      squareOption: 'Square',
      layers: 'Layers',
      layer: 'Layer {n}',
      noLayers: 'No layers. Add one to choose what this effect spawns.',
      noFxSet: 'not set',
      timing: 'every {min}–{max} ms',
      directionRandom: 'random direction',
      directionOffset: 'ends {dx}, {dy} cells away',
      v1Note:
        'This effect still follows its token’s GM Notes and bars, as in PageFX 1.x. Changing it here stops that.',
      preset: 'Preset',
      presetsHint:
        'Select one or more tokens on the map, then press a preset. Tokens that are not effects yet become effects, and their Aura 1 is the area the preset fills.',
      triggers: 'Triggers',
      noTriggers: 'No triggers: the effect runs whenever players are on its page.',
      triggerHint:
        'For a turn trigger, or an area from another token, select that token on the map first.',
      yes: 'Yes',
      no: 'No',
    },
    buttons: {
      edit: 'Edit',
      show: 'Show',
      turnOn: 'Turn on',
      turnOff: 'Turn off',
      pause: 'Pause',
      resume: 'Resume',
      fire: 'Fire',
      pauseAll: 'Pause all',
      resumeAll: 'Resume all',
      create: 'New effect',
      createNull: 'No-effect area',
      removeNull: 'Remove no-effect area',
      settings: 'Settings',
      status: 'Status',
      rescan: 'Rescan',
      rename: 'Rename',
      area: 'Area',
      intensity: 'Intensity',
      builtin: 'Built-in FX',
      saved: 'Saved FX',
      json: 'Custom JSON',
      timing: 'Timing',
      random: 'Random direction',
      offset: 'Set direction',
      addLayer: 'Add layer',
      removeLayer: 'Remove layer',
      delete: 'Delete effect',
      preset: 'Preset',
      presets: 'Presets',
      remove: 'Remove',
      help: 'Help',
      rebuild: 'Rebuild handouts',
      onRound: 'Each round',
      onTurn: 'On a turn',
      onEnter: 'Token enters',
      onLeave: 'Token leaves',
      menu: 'Menu',
      change: 'Change',
    },
    prompts: {
      type: 'Effect type',
      colour: 'Colour',
      saved: 'Saved custom FX',
      json: 'Custom FX definition (JSON)',
      intervalMin: 'Shortest time between spawns, in ms',
      intervalMax: 'Longest time between spawns, in ms',
      dx: 'Cells across to the end (negative is left)',
      dy: 'Cells down to the end (negative is up)',
      name: 'Effect name',
      radius: 'Area radius beyond the token, in page units',
      shape: 'Area shape',
      intensity: 'Intensity ({min} to {max})',
      maxSpawns: 'Spawns per second on one page (1 to {max})',
      preset: 'Preset',
      then: 'Then',
      every: 'Every how many rounds',
      who: 'Which tokens count',
      area: 'Which area',
      once: 'Only the first time?',
      confirmDelete: 'Delete this effect? The token stays on the map.',
    },
    settings: {
      language: 'Language',
      globalIntensity: 'Intensity for all effects',
      gmPreviewHint:
        'When on, effects also run on the page each GM is looking at, even with no players there.',
      maxSpawnsHint:
        'Effects are thinned on a page that asks for more. Roll20 stays smooth up to about 60.',
    },
    status: {
      livePages: 'Live pages',
      effects: 'Effects',
      running: 'Running',
      globalPause: 'All paused',
      on: 'On',
      off: 'Off',
      pausedState: 'Paused',
      waiting: 'Not on a live page',
      noFx: 'No effect chosen',
      broken: 'Cannot run',
      nullAreas: 'No-effect areas',
      noEffects:
        'No effects yet. Select a token and type !pagefx create, or open the menu with !pagefx.',
      gmPreview: 'GM page preview',
      intensity: 'Intensity',
      maxSpawns: 'Max spawns per second, per page',
    },
    help: {
      menu: 'Open the menu: the effects on your page, and buttons for everything else.',
      create:
        'Make the selected tokens effects. Their Aura 1 is the area; one is added if they have none.',
      edit: 'Show the card for each selected effect, with buttons to change it.',
      preset: 'Give the selected tokens a preset, making them effects first if needed.',
      presets: 'List the presets, by pack.',
      switches:
        'Turn the selected effects on or off, or pause and resume them. With nothing selected, on and resume start everything again and off and pause hold everything (as !pageFX on and off did in version 1).',
      fire: 'Spawn the selected effects now, once or a few times, to try them out.',
      fx: 'Set what a layer spawns: a built-in effect such as burn-fire, the name of a saved custom FX, or a custom FX definition in JSON.',
      interval:
        'Set the time between spawns of a layer, in milliseconds. Each wait is picked between the two.',
      direction:
        'For beam-like effects, set where each spawn ends: random, or cells across and down from where it starts.',
      area: 'Set the area: the token’s Aura 1 radius in page units, and its shape.',
      intensity:
        'Multiply how often the selected effects spawn (0.1 to 5). With global, change it for every effect.',
      name: 'Rename the selected effects.',
      layer: 'Add a layer, so one effect spawns several things, or remove one.',
      triggerAdd:
        'Add a trigger: on round, turn, enter or leave, do start, stop, toggle, fire or burst. Options: every=2, round=3, count=5, who=players|all|named, names=A;B, area=selected, once.',
      triggerRemove: 'Remove one trigger, or all of them, from the selected effects.',
      null: 'Make the selected tokens no-effect areas, where no effect ever spawns, or stop them being one.',
      delete: 'Take the effect off the selected tokens. The tokens stay on the map.',
      status: 'List every effect, its page, and whether it is running.',
      settings: 'Show the settings.',
      set: 'Change a setting: language, gmPagePreview, intensity or maxSpawnsPerSecond.',
      rescan:
        'Take over new tokens named PageFX or NullFX, and forget effects whose tokens were deleted.',
      journal: 'Rebuild the Help and Command Deck handouts.',
      help: 'Show this list.',
      handout: 'Full instructions are in the "{help}" handout; one-click buttons are in "{deck}".',
    },
    deck: {
      menuTitle: 'Menu',
      menuDesc: 'The main menu lists the effects on your page. Status lists them all.',
      newTitle: 'New',
      newDesc:
        'Select one or more tokens on the map first. Their Aura 1 becomes the area the effect fills.',
      selectedTitle: 'Selected effects',
      selectedDesc: 'Select effect tokens on the map, then press a button.',
      allTitle: 'Everything',
      allDesc: 'Hold every effect, or start them all again.',
      toolsTitle: 'Tools',
      toolsDesc: 'Pick up copied or deleted tokens, and rebuild these handouts.',
      footer: 'See the "{help}" handout for full instructions.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Weather and ambient effects for Roll20 maps',
      footer: 'Use the "{deck}" handout for one-click controls.',
      overview: {
        heading: 'Overview',
        body: 'PageFX fills an area of the map with effects that keep going: rain, snow, embers, steam, fireflies and more. A token marks each effect’s place, and its Aura 1 is the area. Effects run on every page that has players on it, including pages where a split party has been sent, and stop when the players leave. Everything is set from chat menus, and triggers can start or stop effects as combat rounds pass or as tokens move.',
        demo: 'Watch a short demo (from version 1)',
      },
      quickStart: {
        heading: 'Quick Start',
        steps: [
          'Put a token where the effect should be (the GM layer keeps it hidden from players) and select it.',
          'Type !pagefx presets, or open the Command Deck and click Presets, then click a preset such as Heavy rain.',
          'Resize the token’s Aura 1 to set the area the effect fills. The aura is hidden from players.',
          'Move players to the page. The effect starts, and stops again when they leave.',
          'Type !pagefx to open the menu, and click Edit on an effect to change it.',
        ],
      },
      effects: {
        heading: 'Effects',
        points: [
          'An effect is a token plus settings PageFX keeps. Move the token to move the effect, and change its Aura 1 to change the area. Deleting the token deletes the effect.',
          'Each effect has one or more layers. Each layer spawns one thing, again and again, with a random wait between its shortest and longest time.',
          'A layer can spawn a built-in Roll20 effect (type and colour, such as burn-fire), a custom FX saved in the game, or a custom FX definition pasted as JSON. Missing values in a definition are filled in, so a short definition still draws.',
          'Beam-like effects (beam, breath, splatter, and custom FX with angle -1) are drawn between two points. Their direction is random, or a fixed number of cells across and down.',
          'Intensity multiplies how often an effect spawns. The intensity setting multiplies every effect.',
          'Off stops an effect until it is turned on. Pause holds it until it is resumed. Pause all holds every effect without changing them.',
          'Jumpgate draws custom FX definitions in white unless they are saved as custom FX, so PageFX saves its own as custom FX named “PageFX: …”. They are removed when no effect uses them. Leave them in place.',
        ],
      },
      pages: {
        heading: 'Which Pages Run',
        points: [
          'Effects run on the page with the player ribbon and on every page a player has been moved to on their own.',
          'Turn on GM Page Preview to also run effects on the page each GM is looking at, to try them out with no players there.',
          'Each page gets at most Max Spawns Per Second (30 by default). If effects ask for more, some spawns are skipped, and the GM is told once.',
          'When another Mod moves the ribbon or splits the party, Roll20 tells no one, so PageFX looks every few seconds and catches up.',
        ],
      },
      presets: {
        heading: 'Presets',
        intro:
          'A preset gives an effect a set of ready-made layers. Changing a layer afterwards makes the effect your own. Other Mods can add presets with PageFX.registerPreset.',
        colPack: 'Pack',
        colPresets: 'Presets (name and ID)',
      },
      triggers: {
        heading: 'Triggers',
        intro:
          'A trigger starts, stops, switches or fires an effect when something happens. Add them from the effect’s card, or with !pagefx trigger add.',
        points: [
          'Each round: Roll20 keeps no round number, so a round begins when the turn order is advanced from its last entry back to the top. A custom turn order entry named “Round” is used instead when there is one. Choose every so many rounds, or one round. The first round of a combat does not count as a change.',
          'On a turn: when a chosen token reaches the top of the turn order. Select the token on the map before clicking the button.',
          'Token enters or leaves: when a token moves into or out of the effect’s area, or the Aura 1 of another token you select. By default only tokens a player controls count; choose any token, or give names.',
          'Fire a burst spawns the effect several times at once. First time only makes a trigger go off once.',
          'Roll20 tells Mods nothing when another Mod moves a token. Mods that move tokens can call PageFX.checkToken(token) afterwards.',
        ],
      },
      nullAreas: {
        heading: 'No-Effect Areas',
        points: [
          'A no-effect area is a token where no effect ever spawns, such as the inside of a house in a storm. Its area is the token and its Aura 1.',
          'Select the token and click No-effect area in the menu or Command Deck. Tokens named NullFX, as in version 1, are no-effect areas too.',
        ],
      },
      commands: {
        heading: 'Commands',
        intro:
          'Only GMs can use these commands. They act on the selected tokens, or on the tokens given with --ids. Layer commands act on layer 1 unless --layer says otherwise. Other Mods can send them too; replies go to the GM.',
        colCommand: 'Command',
        colDesc: 'What it does',
      },
      settings: {
        heading: 'Settings',
        intro:
          'Change settings from the Settings card, or with !pagefx set. Language can also be set on the Mod’s settings page.',
        colKey: 'Setting',
        colDesc: 'What it does',
        rows: {
          language: 'The language of PageFX’s menus, messages and handouts.',
          gmPagePreview: 'Also run effects on the page each GM is looking at (off by default).',
          intensity: 'Multiplies how often every effect spawns (1 by default).',
          maxSpawnsPerSecond: 'The most spawns on one page each second, 1 to 60 (30 by default).',
        },
      },
      api: {
        heading: 'For Other Mods',
        intro:
          'PageFX publishes a PageFX object. Where a function takes a token, the token’s ID works too.',
        colFunction: 'Function',
        colDesc: 'What it does',
        rows: {
          activateAll: 'Resume every effect (version 1).',
          deactivateAll: 'Pause every effect (version 1).',
          activate: 'Turn one effect on, off, or the other way (version 1).',
          start: 'Turn one effect on or off, or pause and resume it.',
          setIntensity: 'Change one effect’s intensity.',
          fire: 'Spawn one effect now.',
          create:
            'Make a token an effect, with options name, fx, interval, direction and intensity; or take it off.',
          getEffect:
            'Read an effect, list the effects (on one page), or ask whether one is running.',
          registerPreset: 'Add a preset for this session, or list them.',
          checkToken: 'Check a token your Mod moved against enter and leave triggers.',
        },
      },
      upgrading: {
        heading: 'Upgrading from Version 1',
        points: [
          'Tokens named PageFX and NullFX are taken over on the first start and keep working as before.',
          'Until you change an effect from chat, its token’s GM Notes, Bar 1 (time between spawns) and Bar 2 (beam direction) still drive it, and the interdiction marker still turns it off. Once you change it from chat, the GM Notes and bars are yours again.',
          'Version 1 only ever drew effects on the player ribbon page, and spawned saved custom FX twice. Both are fixed.',
          'The version 1 commands still work:',
        ],
        colV1: 'Version 1 command',
        colV2: 'Same as',
      },
      troubleshooting: {
        heading: 'Troubleshooting',
        points: [
          'An effect does not run: open its card. The State line says why: off, paused, no effect chosen, cannot run (with the reason), or not on a live page (no players there; turn on GM Page Preview to try it).',
          'You see nothing: very small or short-lived particles are hard to see on a busy map. Try a preset, raise the intensity, or make the area smaller.',
          'Effects look thin: the page may be at Max Spawns Per Second. Lower some intensities, or raise the limit.',
          'Effects stopped after copying a page or game: run Rescan.',
          'For anything else, check the API console log and include its messages when asking for help.',
        ],
      },
      languages: {
        heading: 'Languages',
        body: 'Choose a language from the Settings card, or with !pagefx set language. Available languages:',
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
    triggers: {
      line: '{when}: {action}',
      eachRound: 'Each new round',
      everyRounds: 'Every {n} rounds',
      onRound: 'On round {n}',
      turn: 'When {name}’s turn starts',
      enter: 'When {who} enters {area}',
      leave: 'When {who} leaves {area}',
      areaSelf: 'this effect’s area',
      areaSelected: 'the selected token’s aura',
      areaOf: 'the aura of {name}',
      unnamed: 'a token',
      once: '(first time only)',
      onceUsed: '(first time only, already used)',
      who: {
        players: 'a player token',
        all: 'any token',
      },
      action: {
        start: 'start it',
        stop: 'stop it',
        toggle: 'turn it on or off',
        fire: 'fire it once',
        burst: 'fire a burst of {count}',
      },
      choice: {
        start: 'Start',
        stop: 'Stop',
        toggle: 'Turn on or off',
        fire: 'Fire once',
        burst: 'Fire a burst',
      },
    },
    packs: {
      weather: 'Weather',
      fire: 'Fire and heat',
      water: 'Water',
      magic: 'Magic and eerie',
      custom: 'From other Mods',
    },
    presets: {
      'light-rain': 'Light rain',
      'heavy-rain': 'Heavy rain',
      thunderstorm: 'Thunderstorm',
      snow: 'Snow',
      blizzard: 'Blizzard',
      hail: 'Hail',
      sandstorm: 'Sandstorm',
      fog: 'Fog wisps',
      embers: 'Embers',
      ash: 'Falling ash',
      magma: 'Bubbling magma',
      'lava-spurts': 'Lava spurts',
      sparks: 'Sparks',
      drips: 'Cave drips',
      steam: 'Steam vents',
      geyser: 'Geyser',
      spray: 'Waterfall spray',
      bubbles: 'Bubbles',
      fireflies: 'Fireflies',
      'arcane-motes': 'Arcane motes',
      'necrotic-mist': 'Necrotic mist',
      'holy-glimmer': 'Holy glimmer',
      'swamp-gas': 'Swamp gas',
    },
    fx: {
      empty: 'no effect is set.',
      badJson: 'the custom FX definition is not valid JSON.',
      unknownColour: 'there is no built-in colour "{colour}". Colours: {colours}.',
      savedMissing: 'there is no saved custom FX called "{name}".',
      cannotCreate: 'Roll20 would not create a custom FX object for it.',
      spawnFailed: 'Roll20 would not spawn it ({message}).',
    },
    errors: {
      unknownCommand: 'Unknown command: {command}',
      noEffects: 'Select one or more PageFX tokens, or give their IDs with --ids.',
      selectToken: 'Select one or more tokens first, or give their IDs with --ids.',
      unknownIds: 'These are not PageFX effects: {ids}',
      badSetting: 'Unknown setting or value: {setting} {value}',
      noLayer: '"{name}" has no layer {n}.',
      tooManyLayers: 'An effect can have at most {max} layers.',
      layerUsage: 'Use !pagefx layer add [effect] or !pagefx layer remove <number>.',
      nullUsage: 'Use !pagefx null create or !pagefx null remove.',
      isEffect: '"{name}" is an effect, so it cannot also be a no-effect area.',
      badInterval: 'Give the time between spawns in ms, for example: !pagefx interval 500 1500',
      badDirection: 'Give random, or cells across and down, for example: !pagefx direction 2 -1',
      badArea:
        'Give a radius in page units, and circle or square, for example: !pagefx area 15 circle',
      badIntensity: 'Give an intensity above 0, for example: !pagefx intensity 1.5',
      noName: 'Give a name, for example: !pagefx name Rain over the docks',
      triggerUsage:
        'Use !pagefx trigger add <round|turn|enter|leave> <start|stop|toggle|fire|burst> [every=2] [round=3] [count=5] [who=players|all|named] [names=A;B] [area=self|selected] [once], or !pagefx trigger remove <number>.',
      triggerToken: 'Select the token this trigger is about on the map first, or give token=<id>.',
      triggerNames:
        'Give the token names with names=, separated by ; (for example names=Goblin;Orc).',
      tooManyTriggers: 'An effect can have at most {max} triggers.',
      noTrigger: '"{name}" has no trigger {n}.',
      journalUsage: 'Use !pagefx journal rebuild.',
      unknownPreset: 'There is no preset "{id}". Type !pagefx presets to see them.',
      unexpected: 'Something went wrong: {message}',
    },
  };

  const TRANSLATION$6 = {
    titles: {
      ready: 'PageFX on valmis.',
      menu: 'PageFX',
      status: 'PageFX:n tila',
      settings: 'PageFX:n asetukset',
      presets: 'PageFX:n valmisasetukset',
      help: 'PageFX:n komennot',
      effect: 'Tehoste: {name}',
    },
    messages: {
      readyHint: 'Avaa valikko kirjoittamalla !pagefx.',
      adopted:
        'Otettiin hallintaan {effects} tehoste(tta) ja {nulls} tehosteeton(ta) alue(tta) PageFX 1.x -nappuloista. Ne toimivat kuten ennenkin.',
      rescanned:
        'Uudelleenhaku löysi {effects} uutta tehostetta ja {nulls} uutta tehosteetonta aluetta, ja unohti {dropped} tehostetta, joiden nappulat oli poistettu.',
      allPaused: 'Kaikki tehosteet ovat tauolla. Käynnistä ne uudelleen komennolla !pagefx resume.',
      allResumed: 'Tehosteet ovat taas käynnissä.',
      turnedOn: 'Päälle kytketty: {count}.',
      turnedOff: 'Pois kytketty: {count}.',
      toggled: 'Päälle tai pois kytketty: {count}.',
      paused: 'Tauotettu: {count}.',
      resumed: 'Jatkettu: {count}.',
      fired: 'Tuotettiin {count} tehoste(tta).',
      created: 'Uusia tehosteita: {count}. Valitse kunkin kortilta, mitä se tuottaa.',
      deleted: 'Poistettuja tehosteita: {count}. Niiden nappulat ovat yhä kartalla.',
      renamed: 'Nimetty uudelleen: {count}.',
      fxSet: 'Tehoste vaihdettu: {count}.',
      intervalSet: 'Ajoitus vaihdettu: {count}.',
      directionSet: 'Suunta vaihdettu: {count}.',
      areaSet: 'Alue vaihdettu: {count}.',
      intensitySet: 'Voimakkuus vaihdettu: {count}.',
      layerAdded: 'Kerros lisätty: {count}.',
      layerRemoved: 'Kerros poistettu: {count}.',
      nullCreated: 'Uusia tehosteettomia alueita: {count}.',
      nullRemoved: 'Poistettuja tehosteettomia alueita: {count}.',
      presetApplied: '{name} käytetty: {count}.',
      journalRebuilt: 'Monisteet "{help}" ja "{deck}" on rakennettu uudelleen.',
      triggerAdded: 'Laukaisin lisätty: {count}.',
      triggerRemoved: 'Laukaisin poistettu: {count}.',
      triggersCleared: 'Laukaisimet poistettu {count} tehosteesta.',
      throttled:
        'Sivun "{page}" tehosteita harvennetaan: ne pyysivät yli {max} ilmentymää sekunnissa. Laske niiden voimakkuutta tai nosta rajaa komennolla !pagefx set maxSpawnsPerSecond.',
      settingChanged: '{setting} on nyt {value}.',
      problem: 'Tehoste "{name}" ei voi toimia: {reason}',
    },
    menu: {
      page: 'Sivu',
      live: 'tehosteet toimivat täällä',
      notLive: 'ei pelaajia täällä',
      allPausedNote: 'Kaikki tehosteet ovat tauolla.',
      effectsHere: 'Tämän sivun tehosteet',
      noEffectsHere: 'Tällä sivulla ei ole vielä tehosteita.',
      otherPages: 'Muut sivut',
      effectCount: '{count} tehoste(tta)',
      actions: 'Uusi',
      selectHint:
        'Valitse ensin nappula kartalta ja paina sitten Uusi tehoste tai Tehosteeton alue. Nappula merkitsee tehosteen paikan; sen "Aura 1" on alue.',
      state: 'Tila',
      area: 'Alue',
      areaValue: '{radius} {units} nappulan ympärillä, {shape}',
      circle: 'ympyrä',
      square: 'neliö',
      circleOption: 'Ympyrä',
      squareOption: 'Neliö',
      layers: 'Kerrokset',
      layer: 'Kerros {n}',
      noLayers: 'Ei kerroksia. Lisää kerros valitaksesi, mitä tämä tehoste tuottaa.',
      noFxSet: 'ei asetettu',
      timing: '{min}–{max} ms välein',
      directionRandom: 'satunnainen suunta',
      directionOffset: 'päättyy {dx}, {dy} ruudun päähän',
      v1Note:
        'Tämä tehoste noudattaa yhä nappulansa "GM Notes" -kenttää ja palkkeja, kuten PageFX 1.x:ssä. Sen muuttaminen täällä lopettaa sen.',
      preset: 'Valmisasetus',
      presetsHint:
        'Valitse yksi tai useampi nappula kartalta ja paina sitten valmisasetusta. Nappuloista, jotka eivät vielä ole tehosteita, tulee tehosteita, ja niiden "Aura 1" on alue, jonka valmisasetus täyttää.',
      triggers: 'Laukaisimet',
      noTriggers: 'Ei laukaisimia: tehoste toimii aina, kun sen sivulla on pelaajia.',
      triggerHint:
        'Vuorolaukaisinta tai toisen nappulan aluetta varten valitse ensin se nappula kartalta.',
      yes: 'Kyllä',
      no: 'Ei',
    },
    buttons: {
      edit: 'Muokkaa',
      show: 'Näytä',
      turnOn: 'Kytke päälle',
      turnOff: 'Kytke pois',
      pause: 'Tauko',
      resume: 'Jatka',
      fire: 'Laukaise',
      pauseAll: 'Tauota kaikki',
      resumeAll: 'Jatka kaikkia',
      create: 'Uusi tehoste',
      createNull: 'Tehosteeton alue',
      removeNull: 'Poista tehosteeton alue',
      settings: 'Asetukset',
      status: 'Tila',
      rescan: 'Hae uudelleen',
      rename: 'Nimeä uudelleen',
      area: 'Alue',
      intensity: 'Voimakkuus',
      builtin: 'Sisäänrakennettu FX',
      saved: 'Tallennettu FX',
      json: 'Oma JSON',
      timing: 'Ajoitus',
      random: 'Satunnainen suunta',
      offset: 'Aseta suunta',
      addLayer: 'Lisää kerros',
      removeLayer: 'Poista kerros',
      delete: 'Poista tehoste',
      preset: 'Valmisasetus',
      presets: 'Valmisasetukset',
      remove: 'Poista',
      help: 'Ohje',
      rebuild: 'Rakenna monisteet',
      onRound: 'Joka kierros',
      onTurn: 'Vuorolla',
      onEnter: 'Nappula tulee',
      onLeave: 'Nappula poistuu',
      menu: 'Valikko',
      change: 'Vaihda',
    },
    prompts: {
      type: 'Tehosteen tyyppi',
      colour: 'Väri',
      saved: 'Tallennettu oma FX',
      json: 'Oman FX:n määritys (JSON)',
      intervalMin: 'Lyhin aika ilmentymien välillä (ms)',
      intervalMax: 'Pisin aika ilmentymien välillä (ms)',
      dx: 'Ruutuja vaakasuunnassa loppuun (negatiivinen = vasemmalle)',
      dy: 'Ruutuja pystysuunnassa loppuun (negatiivinen = ylös)',
      name: 'Tehosteen nimi',
      radius: 'Alueen säde nappulan ympärillä (sivun yksiköissä)',
      shape: 'Alueen muoto',
      intensity: 'Voimakkuus ({min}–{max})',
      maxSpawns: 'Ilmentymiä sekunnissa yhdellä sivulla (1–{max})',
      preset: 'Valmisasetus',
      then: 'Sitten',
      every: 'Kuinka monen kierroksen välein',
      who: 'Mitkä nappulat lasketaan',
      area: 'Mikä alue',
      once: 'Vain ensimmäisellä kerralla?',
      confirmDelete: 'Poistetaanko tämä tehoste? Nappula jää kartalle.',
    },
    settings: {
      language: 'Kieli',
      globalIntensity: 'Kaikkien tehosteiden voimakkuus',
      gmPreviewHint:
        'Kun tämä on päällä, tehosteet toimivat myös sivulla, jota kukin pelinjohtaja katsoo, vaikka siellä ei olisi pelaajia.',
      maxSpawnsHint:
        'Tehosteita harvennetaan sivulla, joka pyytää enemmän. Roll20 pysyy sujuvana noin 60:een asti.',
    },
    status: {
      livePages: 'Aktiiviset sivut',
      effects: 'Tehosteet',
      running: 'Käynnissä',
      globalPause: 'Kaikki tauolla',
      on: 'Päällä',
      off: 'Pois',
      pausedState: 'Tauolla',
      waiting: 'Ei aktiivisella sivulla',
      noFx: 'Tehostetta ei valittu',
      broken: 'Ei voi toimia',
      nullAreas: 'Tehosteettomat alueet',
      noEffects:
        'Ei vielä tehosteita. Valitse nappula ja kirjoita !pagefx create, tai avaa valikko komennolla !pagefx.',
      gmPreview: 'Pelinjohtajan sivun esikatselu',
      intensity: 'Voimakkuus',
      maxSpawns: 'Ilmentymiä enintään sekunnissa sivua kohden',
    },
    help: {
      menu: 'Avaa valikon: sivusi tehosteet ja painikkeet kaikkeen muuhun.',
      create:
        'Tekee valituista nappuloista tehosteita. Niiden "Aura 1" on alue; sellainen lisätään, jos niillä ei ole sitä.',
      edit: 'Näyttää jokaisen valitun tehosteen kortin ja painikkeet sen muuttamiseen.',
      preset:
        'Antaa valituille nappuloille valmisasetuksen ja tekee niistä ensin tehosteita tarvittaessa.',
      presets: 'Luettelee valmisasetukset paketeittain.',
      switches:
        'Kytkee valitut tehosteet päälle tai pois, tai tauottaa ja jatkaa niitä. Kun mitään ei ole valittu, on ja resume käynnistävät kaiken uudelleen ja off ja pause pysäyttävät kaiken (kuten !pageFX on ja off tekivät versiossa 1).',
      fire: 'Tuottaa valitut tehosteet nyt, kerran tai muutaman kerran, kokeilua varten.',
      fx: 'Asettaa, mitä kerros tuottaa: sisäänrakennetun tehosteen kuten burn-fire, tallennetun oman FX:n nimen tai oman FX:n määrityksen JSON-muodossa.',
      interval:
        'Asettaa kerroksen ilmentymien välisen ajan millisekunteina. Jokainen odotus arvotaan näiden kahden väliltä.',
      direction:
        'Sädemäisille tehosteille asettaa, mihin kukin ilmentymä päättyy: satunnaisesti tai tietyn ruutumäärän päähän vaaka- ja pystysuunnassa lähtöpisteestään.',
      area: 'Asettaa alueen: nappulan "Aura 1" -säteen sivun yksiköissä sekä sen muodon.',
      intensity:
        'Kertoo, kuinka usein valitut tehosteet tuottavat (0.1–5). Sanalla global muuttaa sen kaikille tehosteille.',
      name: 'Nimeää valitut tehosteet uudelleen.',
      layer: 'Lisää kerroksen, jotta yksi tehoste tuottaa useita asioita, tai poistaa kerroksen.',
      triggerAdd:
        'Lisää laukaisimen: tilanteessa round, turn, enter tai leave tee start, stop, toggle, fire tai burst. Valinnat: every=2, round=3, count=5, who=players|all|named, names=A;B, area=selected, once.',
      triggerRemove: 'Poistaa yhden laukaisimen tai kaikki valituista tehosteista.',
      null: 'Tekee valituista nappuloista tehosteettomia alueita, joihin ei koskaan ilmesty tehosteita, tai lopettaa sen.',
      delete: 'Poistaa tehosteen valituista nappuloista. Nappulat jäävät kartalle.',
      status: 'Luettelee kaikki tehosteet, niiden sivun ja sen, ovatko ne käynnissä.',
      settings: 'Näyttää asetukset.',
      set: 'Muuttaa asetusta: language, gmPagePreview, intensity tai maxSpawnsPerSecond.',
      rescan:
        'Ottaa hallintaan uudet nappulat, joiden nimi on PageFX tai NullFX, ja unohtaa tehosteet, joiden nappulat on poistettu.',
      journal: 'Rakentaa ohjemonisteen ja Command Deck -monisteen uudelleen.',
      help: 'Näyttää tämän luettelon.',
      handout:
        'Täydet ohjeet ovat monisteessa "{help}"; yhden napsautuksen painikkeet ovat monisteessa "{deck}".',
    },
    deck: {
      menuTitle: 'Valikko',
      menuDesc: 'Päävalikko luettelee sivusi tehosteet. Tila luettelee ne kaikki.',
      newTitle: 'Uusi',
      newDesc:
        'Valitse ensin yksi tai useampi nappula kartalta. Niiden "Aura 1" on alue, jonka tehoste täyttää.',
      selectedTitle: 'Valitut tehosteet',
      selectedDesc: 'Valitse tehostenappulat kartalta ja paina sitten painiketta.',
      allTitle: 'Kaikki',
      allDesc: 'Pysäytä kaikki tehosteet tai käynnistä ne kaikki uudelleen.',
      toolsTitle: 'Työkalut',
      toolsDesc:
        'Ota haltuun kopioidut tai poistetut nappulat ja rakenna nämä monisteet uudelleen.',
      footer: 'Täydet ohjeet ovat monisteessa "{help}".',
    },
    handout: {
      versionLabel: 'Versio',
      subtitle: 'Sää- ja tunnelmatehosteita Roll20-karttoihin',
      footer: 'Yhden napsautuksen ohjaimet ovat monisteessa "{deck}".',
      overview: {
        heading: 'Yleiskatsaus',
        body: 'PageFX täyttää kartan alueen jatkuvilla tehosteilla: sateella, lumella, hiilloksella, höyryllä, tulikärpäsillä ja muulla. Nappula merkitsee kunkin tehosteen paikan, ja sen "Aura 1" on alue. Tehosteet toimivat jokaisella sivulla, jolla on pelaajia, myös sivuilla, joille jaetun ryhmän osa on lähetetty, ja pysähtyvät, kun pelaajat lähtevät. Kaikki asetetaan chat-valikoista, ja laukaisimet voivat käynnistää tai pysäyttää tehosteita taistelukierrosten kuluessa tai nappuloiden liikkuessa.',
        demo: 'Katso lyhyt esittely (versiosta 1)',
      },
      quickStart: {
        heading: 'Pikaopas',
        steps: [
          'Aseta nappula paikkaan, jossa tehosteen kuuluu olla (GM-taso piilottaa sen pelaajilta), ja valitse se.',
          'Kirjoita !pagefx presets tai avaa Command Deck ja napsauta Valmisasetukset, ja napsauta sitten valmisasetusta, kuten Rankkasade.',
          'Muuta nappulan "Aura 1" -kokoa asettaaksesi alueen, jonka tehoste täyttää. Aura on piilotettu pelaajilta.',
          'Siirrä pelaajat sivulle. Tehoste käynnistyy ja pysähtyy taas, kun he lähtevät.',
          'Avaa valikko kirjoittamalla !pagefx, ja napsauta tehosteen kohdalla Muokkaa muuttaaksesi sitä.',
        ],
      },
      effects: {
        heading: 'Tehosteet',
        points: [
          'Tehoste on nappula sekä asetukset, jotka PageFX tallentaa. Siirrä nappulaa siirtääksesi tehostetta, ja muuta sen "Aura 1" -auran kokoa muuttaaksesi aluetta. Nappulan poistaminen poistaa tehosteen.',
          'Jokaisella tehosteella on yksi tai useampi kerros. Jokainen kerros tuottaa yhtä asiaa yhä uudelleen, satunnaisella odotuksella lyhimmän ja pisimmän aikansa välillä.',
          'Kerros voi tuottaa Roll20:n sisäänrakennetun tehosteen (tyyppi ja väri, kuten burn-fire), peliin tallennetun oman FX:n tai JSON-muodossa liitetyn oman FX:n määrityksen. Määrityksestä puuttuvat arvot täydennetään, joten lyhytkin määritys piirtyy.',
          'Sädemäiset tehosteet (beam, breath, splatter ja omat FX:t, joiden kulma on -1) piirretään kahden pisteen välille. Niiden suunta on satunnainen tai kiinteä määrä ruutuja vaaka- ja pystysuunnassa.',
          'Voimakkuus kertoo, kuinka usein tehoste tuottaa. Asetus intensity kertoo kaikki tehosteet.',
          'Pois kytkeminen pysäyttää tehosteen, kunnes se kytketään päälle. Tauko pitää sen pysähdyksissä, kunnes sitä jatketaan. Tauota kaikki pysäyttää kaikki tehosteet muuttamatta niitä.',
          'Jumpgate piirtää omat FX-määritykset valkoisina, ellei niitä ole tallennettu omiksi FX:iksi, joten PageFX tallentaa omansa omiksi FX:iksi nimellä ”PageFX: …”. Ne poistetaan, kun mikään tehoste ei enää käytä niitä. Jätä ne paikalleen.',
        ],
      },
      pages: {
        heading: 'Millä sivuilla tehosteet toimivat',
        points: [
          'Tehosteet toimivat sivulla, jolla pelaajanauha on, ja jokaisella sivulla, jolle pelaaja on siirretty erikseen.',
          'Kytke Pelinjohtajan sivun esikatselu päälle, niin tehosteet toimivat myös sivulla, jota kukin pelinjohtaja katsoo, ja voit kokeilla niitä ilman pelaajia.',
          'Kukin sivu saa enintään asetuksen Ilmentymiä enintään sekunnissa sivua kohden verran (oletus 30). Jos tehosteet pyytävät enemmän, osa ilmentymistä ohitetaan, ja pelinjohtajalle ilmoitetaan kerran.',
          'Kun toinen Mod siirtää pelaajanauhaa tai jakaa ryhmän, Roll20 ei kerro siitä kenellekään, joten PageFX tarkistaa tilanteen muutaman sekunnin välein ja päivittyy.',
        ],
      },
      presets: {
        heading: 'Valmisasetukset',
        intro:
          'Valmisasetus antaa tehosteelle joukon valmiita kerroksia. Jos muutat kerrosta jälkeenpäin, tehosteesta tulee omasi. Muut Modit voivat lisätä valmisasetuksia funktiolla PageFX.registerPreset.',
        colPack: 'Paketti',
        colPresets: 'Valmisasetukset (nimi ja ID)',
      },
      triggers: {
        heading: 'Laukaisimet',
        intro:
          'Laukaisin käynnistää, pysäyttää, vaihtaa tai laukaisee tehosteen, kun jotain tapahtuu. Lisää niitä tehosteen kortilta tai komennolla !pagefx trigger add.',
        points: [
          'Joka kierros: Roll20 ei pidä kirjaa kierrosnumerosta, joten kierros alkaa, kun vuorojärjestys siirtyy viimeisestä merkinnästä takaisin ensimmäiseen. Jos vuorojärjestyksessä on oma merkintä nimeltä ”Round”, sitä käytetään sen sijaan. Valitse joka n:s kierros tai yksi tietty kierros. Taistelun ensimmäistä kierrosta ei lasketa muutokseksi.',
          'Vuorolla: kun valittu nappula nousee vuorojärjestyksen kärkeen. Valitse nappula kartalta ennen painikkeen napsauttamista.',
          'Nappula tulee tai poistuu: kun nappula liikkuu tehosteen alueelle tai sieltä pois, tai valitsemasi toisen nappulan "Aura 1" -alueelle tai sieltä pois. Oletuksena lasketaan vain pelaajan hallitsemat nappulat; valitse mikä tahansa nappula tai anna nimiä.',
          'Laukaise purske tuottaa tehosteen useita kertoja kerralla. Vain ensimmäisellä kerralla saa laukaisimen toimimaan vain kerran.',
          'Roll20 ei kerro Modeille mitään, kun toinen Mod siirtää nappulaa. Nappuloita siirtävät Modit voivat kutsua jälkeenpäin PageFX.checkToken(token).',
        ],
      },
      nullAreas: {
        heading: 'Tehosteettomat alueet',
        points: [
          'Tehosteeton alue on nappula, jonka kohdalle ei koskaan ilmesty tehosteita, kuten talon sisätila myrskyssä. Sen alue on nappula ja sen "Aura 1".',
          'Valitse nappula ja napsauta Tehosteeton alue valikossa tai Command Deckissä. Myös NullFX-nimiset nappulat ovat tehosteettomia alueita, kuten versiossa 1.',
        ],
      },
      commands: {
        heading: 'Komennot',
        intro:
          'Vain pelinjohtajat voivat käyttää näitä komentoja. Ne kohdistuvat valittuihin nappuloihin tai --ids-valinnalla annettuihin nappuloihin. Kerroskomennot kohdistuvat kerrokseen 1, ellei --layer kerro muuta. Myös muut Modit voivat lähettää niitä; vastaukset menevät pelinjohtajalle.',
        colCommand: 'Komento',
        colDesc: 'Mitä se tekee',
      },
      settings: {
        heading: 'Asetukset',
        intro:
          'Muuta asetuksia Asetukset-kortilta tai komennolla !pagefx set. Kielen voi asettaa myös Modin asetussivulla.',
        colKey: 'Asetus',
        colDesc: 'Mitä se tekee',
        rows: {
          language: 'PageFX:n valikkojen, viestien ja monisteiden kieli.',
          gmPagePreview:
            'Tehosteet toimivat myös sivulla, jota kukin pelinjohtaja katsoo (oletuksena pois).',
          intensity: 'Kertoo, kuinka usein jokainen tehoste tuottaa (oletus 1).',
          maxSpawnsPerSecond:
            'Ilmentymien enimmäismäärä yhdellä sivulla sekunnissa, 1–60 (oletus 30).',
        },
      },
      api: {
        heading: 'Muille Modeille',
        intro:
          'PageFX julkaisee PageFX-olion. Kun funktio ottaa nappulan, myös nappulan ID kelpaa.',
        colFunction: 'Funktio',
        colDesc: 'Mitä se tekee',
        rows: {
          activateAll: 'Jatkaa kaikkia tehosteita (versio 1).',
          deactivateAll: 'Tauottaa kaikki tehosteet (versio 1).',
          activate: 'Kytkee yhden tehosteen päälle, pois tai päinvastaiseen tilaan (versio 1).',
          start: 'Kytkee yhden tehosteen päälle tai pois, tai tauottaa ja jatkaa sitä.',
          setIntensity: 'Muuttaa yhden tehosteen voimakkuutta.',
          fire: 'Tuottaa yhden tehosteen nyt.',
          create:
            'Tekee nappulasta tehosteen valinnoilla name, fx, interval, direction ja intensity; tai poistaa tehosteen.',
          getEffect:
            'Lukee tehosteen, luettelee tehosteet (yhdeltä sivulta) tai kertoo, onko tehoste käynnissä.',
          registerPreset: 'Lisää valmisasetuksen tälle istunnolle tai luettelee ne.',
          checkToken: 'Tarkistaa Modisi siirtämän nappulan tulo- ja poistumislaukaisimia vasten.',
        },
      },
      upgrading: {
        heading: 'Päivitys versiosta 1',
        points: [
          'PageFX- ja NullFX-nimiset nappulat otetaan hallintaan ensimmäisellä käynnistyksellä, ja ne toimivat kuten ennenkin.',
          'Kunnes muutat tehostetta chatista, sen nappulan "GM Notes", "Bar 1" (ilmentymien välinen aika) ja "Bar 2" (säteen suunta) ohjaavat sitä yhä, ja kieltomerkki kytkee sen yhä pois. Kun muutat sitä chatista, "GM Notes" ja palkit ovat taas omassa käytössäsi.',
          'Versio 1 piirsi tehosteita vain pelaajanauhan sivulle ja tuotti tallennetut omat FX:t kahdesti. Molemmat on korjattu.',
          'Version 1 komennot toimivat yhä:',
        ],
        colV1: 'Version 1 komento',
        colV2: 'Sama kuin',
      },
      troubleshooting: {
        heading: 'Vianmääritys',
        points: [
          'Tehoste ei toimi: avaa sen kortti. Tila-rivi kertoo syyn: pois, tauolla, tehostetta ei valittu, ei voi toimia (syyn kanssa) tai ei aktiivisella sivulla (ei pelaajia; kytke Pelinjohtajan sivun esikatselu päälle kokeillaksesi).',
          'Et näe mitään: hyvin pieniä tai lyhytikäisiä hiukkasia on vaikea nähdä täydellä kartalla. Kokeile valmisasetusta, nosta voimakkuutta tai pienennä aluetta.',
          'Tehosteet näyttävät harvoilta: sivu voi olla Ilmentymiä enintään sekunnissa -rajassa. Laske joidenkin voimakkuutta tai nosta rajaa.',
          'Tehosteet pysähtyivät sivun tai pelin kopioinnin jälkeen: suorita Hae uudelleen.',
          'Kaikissa muissa asioissa tarkista API-konsolin loki ja liitä sen viestit mukaan, kun pyydät apua.',
        ],
      },
      languages: {
        heading: 'Kielet',
        body: 'Valitse kieli Asetukset-kortilta tai komennolla !pagefx set language. Saatavilla olevat kielet:',
        colLanguage: 'Kieli',
        colNative: 'Nimi omalla kielellä',
        colCode: 'Koodi',
      },
      credits: {
        heading: 'Tekijät',
        original: 'Alkuperäisen Modin tekijä',
        maintainer: 'Version 2 ylläpitäjä',
        marketplace: 'Adan kuvapaketit Roll20 Marketplacessa',
        support:
          'Jos löydät virheen tai sinulla on idea, kirjoita Roll20:n Mod-foorumille tai avaa issue GitHubissa, ja liitä mukaan API-konsolin lokin viestit.',
      },
    },
    triggers: {
      line: '{when}: {action}',
      eachRound: 'Joka uusi kierros',
      everyRounds: 'Joka {n}. kierros',
      onRound: 'Kierroksella {n}',
      turn: 'Kun nappulan {name} vuoro alkaa',
      enter: 'Kun {who} tulee alueelle {area}',
      leave: 'Kun {who} poistuu alueelta {area}',
      areaSelf: 'tämän tehosteen alue',
      areaSelected: 'valitun nappulan aura',
      areaOf: 'nappulan {name} aura',
      unnamed: 'nappula',
      once: '(vain ensimmäisellä kerralla)',
      onceUsed: '(vain ensimmäisellä kerralla, jo käytetty)',
      who: {
        players: 'pelaajan nappula',
        all: 'mikä tahansa nappula',
      },
      action: {
        start: 'käynnistä se',
        stop: 'pysäytä se',
        toggle: 'kytke se päälle tai pois',
        fire: 'laukaise se kerran',
        burst: 'laukaise {count} ilmentymän purske',
      },
      choice: {
        start: 'Käynnistä',
        stop: 'Pysäytä',
        toggle: 'Kytke päälle tai pois',
        fire: 'Laukaise kerran',
        burst: 'Laukaise purske',
      },
    },
    packs: {
      weather: 'Sää',
      fire: 'Tuli ja kuumuus',
      water: 'Vesi',
      magic: 'Taikuus ja kummitus',
      custom: 'Muista Modeista',
    },
    presets: {
      'light-rain': 'Kevyt sade',
      'heavy-rain': 'Rankkasade',
      thunderstorm: 'Ukkosmyrsky',
      snow: 'Lumi',
      blizzard: 'Lumimyrsky',
      hail: 'Raesade',
      sandstorm: 'Hiekkamyrsky',
      fog: 'Sumuhuntuvat',
      embers: 'Hiillos',
      ash: 'Putoava tuhka',
      magma: 'Kupliva magma',
      'lava-spurts': 'Laavasuihkut',
      sparks: 'Kipinät',
      drips: 'Luolan tippuvesi',
      steam: 'Höyryaukot',
      geyser: 'Geysir',
      spray: 'Vesiputouksen pärskeet',
      bubbles: 'Kuplat',
      fireflies: 'Tulikärpäset',
      'arcane-motes': 'Maagiset hiukkaset',
      'necrotic-mist': 'Nekroottinen usva',
      'holy-glimmer': 'Pyhä hohde',
      'swamp-gas': 'Suokaasu',
    },
    fx: {
      empty: 'tehostetta ei ole asetettu.',
      badJson: 'oman FX:n määritys ei ole kelvollista JSONia.',
      unknownColour: 'sisäänrakennettua väriä "{colour}" ei ole. Värit: {colours}.',
      savedMissing: 'tallennettua omaa FX:ää nimeltä "{name}" ei ole.',
      cannotCreate: 'Roll20 ei suostunut luomaan sille omaa FX-oliota.',
      spawnFailed: 'Roll20 ei suostunut tuottamaan sitä ({message}).',
    },
    errors: {
      unknownCommand: 'Tuntematon komento: {command}',
      noEffects: 'Valitse yksi tai useampi PageFX-nappula tai anna niiden ID:t valinnalla --ids.',
      selectToken: 'Valitse ensin yksi tai useampi nappula tai anna niiden ID:t valinnalla --ids.',
      unknownIds: 'Nämä eivät ole PageFX-tehosteita: {ids}',
      badSetting: 'Tuntematon asetus tai arvo: {setting} {value}',
      noLayer: 'Tehosteella "{name}" ei ole kerrosta {n}.',
      tooManyLayers: 'Tehosteella voi olla enintään {max} kerrosta.',
      layerUsage: 'Käytä komentoa !pagefx layer add [tehoste] tai !pagefx layer remove <numero>.',
      nullUsage: 'Käytä komentoa !pagefx null create tai !pagefx null remove.',
      isEffect: '"{name}" on tehoste, joten se ei voi olla myös tehosteeton alue.',
      badInterval:
        'Anna ilmentymien välinen aika millisekunteina, esimerkiksi: !pagefx interval 500 1500',
      badDirection:
        'Anna random tai ruudut vaaka- ja pystysuunnassa, esimerkiksi: !pagefx direction 2 -1',
      badArea:
        'Anna säde sivun yksiköissä sekä circle tai square, esimerkiksi: !pagefx area 15 circle',
      badIntensity: 'Anna nollaa suurempi voimakkuus, esimerkiksi: !pagefx intensity 1.5',
      noName: 'Anna nimi, esimerkiksi: !pagefx name Sade satamassa',
      triggerUsage:
        'Käytä komentoa !pagefx trigger add <round|turn|enter|leave> <start|stop|toggle|fire|burst> [every=2] [round=3] [count=5] [who=players|all|named] [names=A;B] [area=self|selected] [once] tai !pagefx trigger remove <numero>.',
      triggerToken:
        'Valitse ensin kartalta nappula, jota tämä laukaisin koskee, tai anna token=<id>.',
      triggerNames:
        'Anna nappuloiden nimet valinnalla names= puolipisteellä ; erotettuina (esimerkiksi names=Goblin;Orc).',
      tooManyTriggers: 'Tehosteella voi olla enintään {max} laukaisinta.',
      noTrigger: 'Tehosteella "{name}" ei ole laukaisinta {n}.',
      journalUsage: 'Käytä komentoa !pagefx journal rebuild.',
      unknownPreset: 'Valmisasetusta "{id}" ei ole. Näet ne kirjoittamalla !pagefx presets.',
      unexpected: 'Jokin meni vikaan: {message}',
    },
  };

  const TRANSLATION$5 = {
    titles: {
      ready: 'PageFX est prêt.',
      menu: 'PageFX',
      status: 'État de PageFX',
      settings: 'Réglages de PageFX',
      presets: 'Préréglages de PageFX',
      help: 'Commandes de PageFX',
      effect: 'Effet : {name}',
    },
    messages: {
      readyHint: 'Tapez !pagefx pour ouvrir le menu.',
      adopted:
        'Reprise de {effects} effet(s) et de {nulls} zone(s) sans effet issus de jetons PageFX 1.x. Ils fonctionnent comme avant.',
      rescanned:
        'Le nouvel examen a trouvé {effects} nouvel(s) effet(s) et {nulls} nouvelle(s) zone(s) sans effet, et a oublié {dropped} effet(s) dont les jetons ont été supprimés.',
      allPaused: 'Tous les effets sont en pause. Utilisez !pagefx resume pour les relancer.',
      allResumed: 'Les effets tournent de nouveau.',
      turnedOn: 'Activés : {count}.',
      turnedOff: 'Désactivés : {count}.',
      toggled: 'Activés ou désactivés : {count}.',
      paused: 'En pause : {count}.',
      resumed: 'Relancés : {count}.',
      fired: '{count} effet(s) déclenché(s).',
      created:
        'Nouveaux effets : {count}. Choisissez sur la fiche de chacun ce qu’il fait apparaître.',
      deleted: 'Effets retirés : {count}. Leurs jetons restent sur la carte.',
      renamed: 'Renommés : {count}.',
      fxSet: 'Effet modifié : {count}.',
      intervalSet: 'Rythme modifié : {count}.',
      directionSet: 'Direction modifiée : {count}.',
      areaSet: 'Zone modifiée : {count}.',
      intensitySet: 'Intensité modifiée : {count}.',
      layerAdded: 'Couche ajoutée : {count}.',
      layerRemoved: 'Couche retirée : {count}.',
      nullCreated: 'Nouvelles zones sans effet : {count}.',
      nullRemoved: 'Zones sans effet retirées : {count}.',
      presetApplied: '{name} appliqué : {count}.',
      journalRebuilt: 'Les documents « {help} » et « {deck} » ont été reconstruits.',
      triggerAdded: 'Déclencheur ajouté : {count}.',
      triggerRemoved: 'Déclencheur retiré : {count}.',
      triggersCleared: 'Déclencheurs retirés de {count} effet(s).',
      throttled:
        'Les effets de la page « {page} » sont allégés : ils demandaient plus de {max} apparitions par seconde. Baissez leur intensité, ou relevez la limite avec !pagefx set maxSpawnsPerSecond.',
      settingChanged: '{setting} vaut maintenant {value}.',
      problem: 'L’effet « {name} » ne peut pas tourner : {reason}',
    },
    menu: {
      page: 'Page',
      live: 'les effets tournent ici',
      notLive: 'aucun joueur ici',
      allPausedNote: 'Tous les effets sont en pause.',
      effectsHere: 'Effets sur cette page',
      noEffectsHere: 'Pas encore d’effet sur cette page.',
      otherPages: 'Autres pages',
      effectCount: '{count} effet(s)',
      actions: 'Nouveau',
      selectHint:
        'Sélectionnez d’abord un jeton sur la carte, puis cliquez sur Nouvel effet ou Zone sans effet. Le jeton marque l’endroit de l’effet ; son « Aura 1 » en est la zone.',
      state: 'État',
      area: 'Zone',
      areaValue: '{radius} {units} autour du jeton, {shape}',
      circle: 'cercle',
      square: 'carré',
      circleOption: 'Cercle',
      squareOption: 'Carré',
      layers: 'Couches',
      layer: 'Couche {n}',
      noLayers: 'Aucune couche. Ajoutez-en une pour choisir ce que cet effet fait apparaître.',
      noFxSet: 'non défini',
      timing: 'toutes les {min} à {max} ms',
      directionRandom: 'direction aléatoire',
      directionOffset: 'se termine à {dx}, {dy} cases',
      v1Note:
        'Cet effet suit encore les « GM Notes » et les barres de son jeton, comme dans PageFX 1.x. Le modifier ici met fin à ce comportement.',
      preset: 'Préréglage',
      presetsHint:
        'Sélectionnez un ou plusieurs jetons sur la carte, puis cliquez sur un préréglage. Les jetons qui ne sont pas encore des effets le deviennent, et leur « Aura 1 » est la zone que le préréglage remplit.',
      triggers: 'Déclencheurs',
      noTriggers: 'Aucun déclencheur : l’effet tourne tant que des joueurs sont sur sa page.',
      triggerHint:
        'Pour un déclencheur de tour, ou une zone prise sur un autre jeton, sélectionnez d’abord ce jeton sur la carte.',
      yes: 'Oui',
      no: 'Non',
    },
    buttons: {
      edit: 'Modifier',
      show: 'Afficher',
      turnOn: 'Activer',
      turnOff: 'Désactiver',
      pause: 'Pause',
      resume: 'Relancer',
      fire: 'Déclencher',
      pauseAll: 'Tout mettre en pause',
      resumeAll: 'Tout relancer',
      create: 'Nouvel effet',
      createNull: 'Zone sans effet',
      removeNull: 'Retirer la zone sans effet',
      settings: 'Réglages',
      status: 'État',
      rescan: 'Réexaminer',
      rename: 'Renommer',
      area: 'Zone',
      intensity: 'Intensité',
      builtin: 'FX intégré',
      saved: 'FX enregistré',
      json: 'JSON personnalisé',
      timing: 'Rythme',
      random: 'Direction aléatoire',
      offset: 'Fixer la direction',
      addLayer: 'Ajouter une couche',
      removeLayer: 'Retirer une couche',
      delete: 'Supprimer l’effet',
      preset: 'Préréglage',
      presets: 'Préréglages',
      remove: 'Retirer',
      help: 'Aide',
      rebuild: 'Reconstruire les documents',
      onRound: 'À chaque round',
      onTurn: 'À un tour',
      onEnter: 'Un jeton entre',
      onLeave: 'Un jeton sort',
      menu: 'Menu',
      change: 'Changer',
    },
    prompts: {
      type: 'Type d’effet',
      colour: 'Couleur',
      saved: 'FX personnalisé enregistré',
      json: 'Définition du FX personnalisé (JSON)',
      intervalMin: 'Délai le plus court entre deux apparitions (ms)',
      intervalMax: 'Délai le plus long entre deux apparitions (ms)',
      dx: 'Cases en largeur jusqu’à la fin (négatif = gauche)',
      dy: 'Cases en hauteur jusqu’à la fin (négatif = haut)',
      name: 'Nom de l’effet',
      radius: 'Rayon de la zone autour du jeton (unités de la page)',
      shape: 'Forme de la zone',
      intensity: 'Intensité ({min} à {max})',
      maxSpawns: 'Apparitions par seconde sur une page (1 à {max})',
      preset: 'Préréglage',
      then: 'Puis',
      every: 'Tous les combien de rounds',
      who: 'Quels jetons comptent',
      area: 'Quelle zone',
      once: 'Seulement la première fois ?',
      confirmDelete: 'Supprimer cet effet ? Le jeton reste sur la carte.',
    },
    settings: {
      language: 'Langue',
      globalIntensity: 'Intensité de tous les effets',
      gmPreviewHint:
        'Si activé, les effets tournent aussi sur la page que regarde chaque MJ, même sans joueurs.',
      maxSpawnsHint:
        'Les effets sont allégés sur une page qui en demande plus. Roll20 reste fluide jusqu’à 60 environ.',
    },
    status: {
      livePages: 'Pages actives',
      effects: 'Effets',
      running: 'En cours',
      globalPause: 'Tout en pause',
      on: 'Activé',
      off: 'Désactivé',
      pausedState: 'En pause',
      waiting: 'Pas sur une page active',
      noFx: 'Aucun effet choisi',
      broken: 'Ne peut pas tourner',
      nullAreas: 'Zones sans effet',
      noEffects:
        'Aucun effet pour l’instant. Sélectionnez un jeton et tapez !pagefx create, ou ouvrez le menu avec !pagefx.',
      gmPreview: 'Aperçu de la page du MJ',
      intensity: 'Intensité',
      maxSpawns: 'Apparitions max par seconde et par page',
    },
    help: {
      menu: 'Ouvre le menu : les effets de votre page, et des boutons pour tout le reste.',
      create:
        'Transforme les jetons sélectionnés en effets. Leur « Aura 1 » est la zone ; une aura est ajoutée s’ils n’en ont pas.',
      edit: 'Affiche la fiche de chaque effet sélectionné, avec des boutons pour le modifier.',
      preset:
        'Applique un préréglage aux jetons sélectionnés, en les transformant d’abord en effets si besoin.',
      presets: 'Liste les préréglages, par pack.',
      switches:
        'Active ou désactive les effets sélectionnés, ou les met en pause et les relance. Sans sélection, on et resume relancent tout, et off et pause arrêtent tout (comme le faisaient !pageFX on et off dans la version 1).',
      fire: 'Fait apparaître les effets sélectionnés maintenant, une ou plusieurs fois, pour les essayer.',
      fx: 'Définit ce qu’une couche fait apparaître : un effet intégré comme burn-fire, le nom d’un FX personnalisé enregistré, ou une définition de FX personnalisé en JSON.',
      interval:
        'Définit le délai entre les apparitions d’une couche, en millisecondes. Chaque attente est tirée entre les deux valeurs.',
      direction:
        'Pour les effets en rayon, définit où se termine chaque apparition : au hasard, ou à un nombre de cases en largeur et en hauteur depuis son départ.',
      area: 'Définit la zone : le rayon de l’« Aura 1 » du jeton en unités de la page, et sa forme.',
      intensity:
        'Multiplie la fréquence d’apparition des effets sélectionnés (0.1 à 5). Avec global, la change pour tous les effets.',
      name: 'Renomme les effets sélectionnés.',
      layer:
        'Ajoute une couche, pour qu’un effet fasse apparaître plusieurs choses, ou en retire une.',
      triggerAdd:
        'Ajoute un déclencheur : sur round, turn, enter ou leave, faire start, stop, toggle, fire ou burst. Options : every=2, round=3, count=5, who=players|all|named, names=A;B, area=selected, once.',
      triggerRemove: 'Retire un déclencheur, ou tous, des effets sélectionnés.',
      null: 'Transforme les jetons sélectionnés en zones sans effet, où aucun effet n’apparaît jamais, ou leur retire ce rôle.',
      delete: 'Retire l’effet des jetons sélectionnés. Les jetons restent sur la carte.',
      status: 'Liste tous les effets, leur page, et s’ils tournent.',
      settings: 'Affiche les réglages.',
      set: 'Modifie un réglage : language, gmPagePreview, intensity ou maxSpawnsPerSecond.',
      rescan:
        'Reprend les nouveaux jetons nommés PageFX ou NullFX, et oublie les effets dont les jetons ont été supprimés.',
      journal: 'Reconstruit les documents d’aide et Command Deck.',
      help: 'Affiche cette liste.',
      handout:
        'Les instructions complètes sont dans le document « {help} » ; les boutons en un clic sont dans « {deck} ».',
    },
    deck: {
      menuTitle: 'Menu',
      menuDesc: 'Le menu principal liste les effets de votre page. État les liste tous.',
      newTitle: 'Nouveau',
      newDesc:
        'Sélectionnez d’abord un ou plusieurs jetons sur la carte. Leur « Aura 1 » devient la zone que l’effet remplit.',
      selectedTitle: 'Effets sélectionnés',
      selectedDesc: 'Sélectionnez des jetons d’effet sur la carte, puis cliquez sur un bouton.',
      allTitle: 'Tout',
      allDesc: 'Mettre tous les effets en pause, ou tous les relancer.',
      toolsTitle: 'Outils',
      toolsDesc: 'Reprendre les jetons copiés ou supprimés, et reconstruire ces documents.',
      footer: 'Voir le document « {help} » pour les instructions complètes.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Météo et effets d’ambiance pour les cartes Roll20',
      footer: 'Utilisez le document « {deck} » pour les commandes en un clic.',
      overview: {
        heading: 'Présentation',
        body: 'PageFX remplit une zone de la carte d’effets continus : pluie, neige, braises, vapeur, lucioles et plus encore. Un jeton marque l’emplacement de chaque effet, et son « Aura 1 » en est la zone. Les effets tournent sur toutes les pages où se trouvent des joueurs, y compris celles où un groupe séparé a été envoyé, et s’arrêtent quand les joueurs partent. Tout se règle depuis des menus dans le chat, et des déclencheurs peuvent lancer ou arrêter des effets au fil des rounds de combat ou des déplacements de jetons.',
        demo: 'Voir une courte démo (de la version 1)',
      },
      quickStart: {
        heading: 'Démarrage rapide',
        steps: [
          'Placez un jeton là où l’effet doit se trouver (le calque MJ le cache aux joueurs) et sélectionnez-le.',
          'Tapez !pagefx presets, ou ouvrez le Command Deck et cliquez sur Préréglages, puis cliquez sur un préréglage comme Forte pluie.',
          'Redimensionnez l’« Aura 1 » du jeton pour définir la zone que l’effet remplit. L’aura est cachée aux joueurs.',
          'Déplacez les joueurs sur la page. L’effet démarre, et s’arrête quand ils repartent.',
          'Tapez !pagefx pour ouvrir le menu, et cliquez sur Modifier sur un effet pour le changer.',
        ],
      },
      effects: {
        heading: 'Effets',
        points: [
          'Un effet, c’est un jeton plus des réglages que PageFX conserve. Déplacez le jeton pour déplacer l’effet, et modifiez son « Aura 1 » pour changer la zone. Supprimer le jeton supprime l’effet.',
          'Chaque effet a une ou plusieurs couches. Chaque couche fait apparaître une chose, encore et encore, avec une attente aléatoire entre son délai le plus court et son délai le plus long.',
          'Une couche peut faire apparaître un effet intégré de Roll20 (type et couleur, comme burn-fire), un FX personnalisé enregistré dans la partie, ou une définition de FX personnalisé collée en JSON. Les valeurs manquantes d’une définition sont complétées, donc une définition courte s’affiche quand même.',
          'Les effets en rayon (beam, breath, splatter, et les FX personnalisés avec un angle de -1) sont tracés entre deux points. Leur direction est aléatoire, ou fixée à un nombre de cases en largeur et en hauteur.',
          'L’intensité multiplie la fréquence d’apparition d’un effet. Le réglage intensity multiplie tous les effets.',
          'Désactiver arrête un effet jusqu’à ce qu’il soit réactivé. Pause le suspend jusqu’à ce qu’il soit relancé. Tout mettre en pause suspend tous les effets sans les modifier.',
          'Jumpgate affiche en blanc les définitions de FX personnalisé, sauf si elles sont enregistrées comme FX personnalisés ; PageFX enregistre donc les siennes comme FX personnalisés nommés « PageFX: … ». Elles sont supprimées quand plus aucun effet ne les utilise. Laissez-les en place.',
        ],
      },
      pages: {
        heading: 'Pages actives',
        points: [
          'Les effets tournent sur la page du ruban des joueurs et sur toute page où un joueur a été déplacé seul.',
          'Activez Aperçu de la page du MJ pour faire aussi tourner les effets sur la page que regarde chaque MJ, et les essayer sans joueurs.',
          'Chaque page reçoit au plus Apparitions max par seconde (30 par défaut). Si les effets en demandent plus, certaines apparitions sont sautées, et le MJ est prévenu une fois.',
          'Quand un autre Mod déplace le ruban ou sépare le groupe, Roll20 ne prévient personne : PageFX vérifie donc toutes les quelques secondes et se met à jour.',
        ],
      },
      presets: {
        heading: 'Préréglages',
        intro:
          'Un préréglage donne à un effet un ensemble de couches toutes prêtes. Modifier une couche ensuite fait de l’effet le vôtre. D’autres Mods peuvent ajouter des préréglages avec PageFX.registerPreset.',
        colPack: 'Pack',
        colPresets: 'Préréglages (nom et ID)',
      },
      triggers: {
        heading: 'Déclencheurs',
        intro:
          'Un déclencheur lance, arrête, bascule ou déclenche un effet quand quelque chose se produit. Ajoutez-les depuis la fiche de l’effet, ou avec !pagefx trigger add.',
        points: [
          'À chaque round : Roll20 ne tient pas de numéro de round, donc un round commence quand l’ordre d’initiative passe de sa dernière entrée à la première. Une entrée personnalisée nommée « Round » dans l’ordre d’initiative est utilisée à la place s’il y en a une. Choisissez tous les X rounds, ou un round précis. Le premier round d’un combat ne compte pas comme un changement.',
          'À un tour : quand un jeton choisi arrive en tête de l’ordre d’initiative. Sélectionnez le jeton sur la carte avant de cliquer sur le bouton.',
          'Un jeton entre ou sort : quand un jeton entre dans la zone de l’effet ou en sort, ou dans l’« Aura 1 » d’un autre jeton que vous sélectionnez. Par défaut, seuls les jetons contrôlés par un joueur comptent ; choisissez n’importe quel jeton, ou donnez des noms.',
          'Déclencher une salve fait apparaître l’effet plusieurs fois d’un coup. Seulement la première fois fait qu’un déclencheur ne se déclenche qu’une fois.',
          'Roll20 ne prévient pas les Mods quand un autre Mod déplace un jeton. Les Mods qui déplacent des jetons peuvent appeler PageFX.checkToken(token) ensuite.',
        ],
      },
      nullAreas: {
        heading: 'Zones sans effet',
        points: [
          'Une zone sans effet est un jeton où aucun effet n’apparaît jamais, comme l’intérieur d’une maison pendant un orage. Sa zone est le jeton et son « Aura 1 ».',
          'Sélectionnez le jeton et cliquez sur Zone sans effet dans le menu ou le Command Deck. Les jetons nommés NullFX, comme dans la version 1, sont aussi des zones sans effet.',
        ],
      },
      commands: {
        heading: 'Commandes',
        intro:
          'Seuls les MJ peuvent utiliser ces commandes. Elles agissent sur les jetons sélectionnés, ou sur ceux donnés avec --ids. Les commandes de couche agissent sur la couche 1, sauf indication contraire avec --layer. D’autres Mods peuvent aussi les envoyer ; les réponses vont au MJ.',
        colCommand: 'Commande',
        colDesc: 'Ce qu’elle fait',
      },
      settings: {
        heading: 'Réglages',
        intro:
          'Modifiez les réglages depuis la fiche Réglages, ou avec !pagefx set. La langue peut aussi être choisie sur la page de réglages du Mod.',
        colKey: 'Réglage',
        colDesc: 'Ce qu’il fait',
        rows: {
          language: 'La langue des menus, messages et documents de PageFX.',
          gmPagePreview:
            'Faire aussi tourner les effets sur la page que regarde chaque MJ (désactivé par défaut).',
          intensity: 'Multiplie la fréquence d’apparition de tous les effets (1 par défaut).',
          maxSpawnsPerSecond:
            'Le nombre maximal d’apparitions par seconde sur une page, de 1 à 60 (30 par défaut).',
        },
      },
      api: {
        heading: 'Pour les autres Mods',
        intro:
          'PageFX publie un objet PageFX. Quand une fonction attend un jeton, l’ID du jeton fonctionne aussi.',
        colFunction: 'Fonction',
        colDesc: 'Ce qu’elle fait',
        rows: {
          activateAll: 'Relance tous les effets (version 1).',
          deactivateAll: 'Met tous les effets en pause (version 1).',
          activate: 'Active, désactive ou bascule un effet (version 1).',
          start: 'Active ou désactive un effet, ou le met en pause et le relance.',
          setIntensity: 'Change l’intensité d’un effet.',
          fire: 'Fait apparaître un effet maintenant.',
          create:
            'Transforme un jeton en effet, avec les options name, fx, interval, direction et intensity ; ou lui retire l’effet.',
          getEffect: 'Lit un effet, liste les effets (d’une page), ou indique si un effet tourne.',
          registerPreset: 'Ajoute un préréglage pour cette session, ou les liste.',
          checkToken:
            'Vérifie un jeton déplacé par votre Mod par rapport aux déclencheurs d’entrée et de sortie.',
        },
      },
      upgrading: {
        heading: 'Mise à niveau depuis la version 1',
        points: [
          'Les jetons nommés PageFX et NullFX sont repris au premier démarrage et fonctionnent comme avant.',
          'Tant que vous ne modifiez pas un effet depuis le chat, les « GM Notes » de son jeton, « Bar 1 » (délai entre les apparitions) et « Bar 2 » (direction du rayon) le pilotent toujours, et le marqueur d’interdiction le désactive toujours. Dès que vous le modifiez depuis le chat, les « GM Notes » et les barres vous appartiennent de nouveau.',
          'La version 1 n’affichait les effets que sur la page du ruban des joueurs, et faisait apparaître deux fois les FX personnalisés enregistrés. Les deux problèmes sont corrigés.',
          'Les commandes de la version 1 fonctionnent toujours :',
        ],
        colV1: 'Commande de la version 1',
        colV2: 'Équivaut à',
      },
      troubleshooting: {
        heading: 'Dépannage',
        points: [
          'Un effet ne tourne pas : ouvrez sa fiche. La ligne État indique pourquoi : désactivé, en pause, aucun effet choisi, ne peut pas tourner (avec la raison), ou pas sur une page active (aucun joueur ; activez Aperçu de la page du MJ pour l’essayer).',
          'Vous ne voyez rien : des particules très petites ou très brèves sont difficiles à voir sur une carte chargée. Essayez un préréglage, augmentez l’intensité, ou réduisez la zone.',
          'Les effets paraissent clairsemés : la page atteint peut-être Apparitions max par seconde. Baissez quelques intensités, ou relevez la limite.',
          'Les effets se sont arrêtés après la copie d’une page ou d’une partie : lancez Réexaminer.',
          'Pour tout le reste, consultez le journal de la console API et joignez ses messages quand vous demandez de l’aide.',
        ],
      },
      languages: {
        heading: 'Langues',
        body: 'Choisissez une langue depuis la fiche Réglages, ou avec !pagefx set language. Langues disponibles :',
        colLanguage: 'Langue',
        colNative: 'Nom d’origine',
        colCode: 'Code',
      },
      credits: {
        heading: 'Crédits',
        original: 'Mod original par',
        maintainer: 'Version 2 maintenue par',
        marketplace: 'Les packs graphiques d’Ada sur le Marketplace de Roll20',
        support:
          'Si vous trouvez un bug ou avez une idée, écrivez sur le forum Mod de Roll20 ou ouvrez un ticket sur GitHub, en joignant les messages du journal de la console API.',
      },
    },
    triggers: {
      line: '{when} : {action}',
      eachRound: 'À chaque nouveau round',
      everyRounds: 'Tous les {n} rounds',
      onRound: 'Au round {n}',
      turn: 'Quand le tour de {name} commence',
      enter: 'Quand {who} entre dans {area}',
      leave: 'Quand {who} sort de {area}',
      areaSelf: 'la zone de cet effet',
      areaSelected: 'l’aura du jeton sélectionné',
      areaOf: 'l’aura de {name}',
      unnamed: 'un jeton',
      once: '(première fois seulement)',
      onceUsed: '(première fois seulement, déjà utilisé)',
      who: {
        players: 'un jeton de joueur',
        all: 'n’importe quel jeton',
      },
      action: {
        start: 'le lancer',
        stop: 'l’arrêter',
        toggle: 'l’activer ou le désactiver',
        fire: 'le déclencher une fois',
        burst: 'déclencher une salve de {count}',
      },
      choice: {
        start: 'Lancer',
        stop: 'Arrêter',
        toggle: 'Activer ou désactiver',
        fire: 'Déclencher une fois',
        burst: 'Déclencher une salve',
      },
    },
    packs: {
      weather: 'Météo',
      fire: 'Feu et chaleur',
      water: 'Eau',
      magic: 'Magie et étrange',
      custom: 'D’autres Mods',
    },
    presets: {
      'light-rain': 'Pluie légère',
      'heavy-rain': 'Forte pluie',
      thunderstorm: 'Orage',
      snow: 'Neige',
      blizzard: 'Blizzard',
      hail: 'Grêle',
      sandstorm: 'Tempête de sable',
      fog: 'Volutes de brume',
      embers: 'Braises',
      ash: 'Pluie de cendres',
      magma: 'Magma bouillonnant',
      'lava-spurts': 'Jets de lave',
      sparks: 'Étincelles',
      drips: 'Gouttes de grotte',
      steam: 'Bouches de vapeur',
      geyser: 'Geyser',
      spray: 'Embruns de cascade',
      bubbles: 'Bulles',
      fireflies: 'Lucioles',
      'arcane-motes': 'Particules arcaniques',
      'necrotic-mist': 'Brume nécrotique',
      'holy-glimmer': 'Lueur sacrée',
      'swamp-gas': 'Gaz des marais',
    },
    fx: {
      empty: 'aucun effet n’est défini.',
      badJson: 'la définition du FX personnalisé n’est pas du JSON valide.',
      unknownColour: 'il n’y a pas de couleur intégrée « {colour} ». Couleurs : {colours}.',
      savedMissing: 'il n’y a pas de FX personnalisé enregistré nommé « {name} ».',
      cannotCreate: 'Roll20 a refusé de créer un objet FX personnalisé pour lui.',
      spawnFailed: 'Roll20 a refusé de le faire apparaître ({message}).',
    },
    errors: {
      unknownCommand: 'Commande inconnue : {command}',
      noEffects: 'Sélectionnez un ou plusieurs jetons PageFX, ou donnez leurs ID avec --ids.',
      selectToken: 'Sélectionnez d’abord un ou plusieurs jetons, ou donnez leurs ID avec --ids.',
      unknownIds: 'Ce ne sont pas des effets PageFX : {ids}',
      badSetting: 'Réglage ou valeur inconnus : {setting} {value}',
      noLayer: '« {name} » n’a pas de couche {n}.',
      tooManyLayers: 'Un effet peut avoir au plus {max} couches.',
      layerUsage: 'Utilisez !pagefx layer add [effet] ou !pagefx layer remove <numéro>.',
      nullUsage: 'Utilisez !pagefx null create ou !pagefx null remove.',
      isEffect: '« {name} » est un effet, il ne peut donc pas être aussi une zone sans effet.',
      badInterval:
        'Donnez le délai entre les apparitions en ms, par exemple : !pagefx interval 500 1500',
      badDirection:
        'Donnez random, ou des cases en largeur et en hauteur, par exemple : !pagefx direction 2 -1',
      badArea:
        'Donnez un rayon en unités de la page, et circle ou square, par exemple : !pagefx area 15 circle',
      badIntensity: 'Donnez une intensité supérieure à 0, par exemple : !pagefx intensity 1.5',
      noName: 'Donnez un nom, par exemple : !pagefx name Pluie sur les quais',
      triggerUsage:
        'Utilisez !pagefx trigger add <round|turn|enter|leave> <start|stop|toggle|fire|burst> [every=2] [round=3] [count=5] [who=players|all|named] [names=A;B] [area=self|selected] [once], ou !pagefx trigger remove <numéro>.',
      triggerToken:
        'Sélectionnez d’abord sur la carte le jeton concerné par ce déclencheur, ou donnez token=<id>.',
      triggerNames:
        'Donnez les noms des jetons avec names=, séparés par ; (par exemple names=Goblin;Orc).',
      tooManyTriggers: 'Un effet peut avoir au plus {max} déclencheurs.',
      noTrigger: '« {name} » n’a pas de déclencheur {n}.',
      journalUsage: 'Utilisez !pagefx journal rebuild.',
      unknownPreset: 'Il n’y a pas de préréglage « {id} ». Tapez !pagefx presets pour les voir.',
      unexpected: 'Un problème est survenu : {message}',
    },
  };

  const TRANSLATION$4 = {
    titles: {
      ready: 'PageFX ist bereit.',
      menu: 'PageFX',
      status: 'PageFX-Status',
      settings: 'PageFX-Einstellungen',
      presets: 'PageFX-Vorlagen',
      help: 'PageFX-Befehle',
      effect: 'Effekt: {name}',
    },
    messages: {
      readyHint: 'Gib !pagefx ein, um das Menü zu öffnen.',
      adopted:
        '{effects} Effekt(e) und {nulls} effektfreie(n) Bereich(e) von PageFX-1.x-Tokens übernommen. Sie funktionieren weiter wie bisher.',
      rescanned:
        'Die neue Suche hat {effects} neue(n) Effekt(e) und {nulls} neue(n) effektfreie(n) Bereich(e) gefunden und {dropped} vergessen, deren Tokens gelöscht wurden.',
      allPaused: 'Alle Effekte sind pausiert. Mit !pagefx resume startest du sie wieder.',
      allResumed: 'Die Effekte laufen wieder.',
      turnedOn: 'Eingeschaltet: {count}.',
      turnedOff: 'Ausgeschaltet: {count}.',
      toggled: 'Ein- oder ausgeschaltet: {count}.',
      paused: 'Pausiert: {count}.',
      resumed: 'Fortgesetzt: {count}.',
      fired: '{count} Effekt(e) gespawnt.',
      created:
        'Neue Effekte: {count}. Wähle auf der Infokarte jedes Effekts aus, was er spawnen soll.',
      deleted: 'Effekte entfernt: {count}. Ihre Tokens bleiben auf der Karte.',
      renamed: 'Umbenannt: {count}.',
      fxSet: 'Effekt geändert: {count}.',
      intervalSet: 'Zeitabstand geändert: {count}.',
      directionSet: 'Richtung geändert: {count}.',
      areaSet: 'Bereich geändert: {count}.',
      intensitySet: 'Intensität geändert: {count}.',
      layerAdded: 'Ebene hinzugefügt: {count}.',
      layerRemoved: 'Ebene entfernt: {count}.',
      nullCreated: 'Neue effektfreie Bereiche: {count}.',
      nullRemoved: 'Effektfreie Bereiche entfernt: {count}.',
      presetApplied: '{name} angewendet: {count}.',
      journalRebuilt: 'Die Handouts „{help}“ und „{deck}“ wurden neu erstellt.',
      triggerAdded: 'Auslöser hinzugefügt: {count}.',
      triggerRemoved: 'Auslöser entfernt: {count}.',
      triggersCleared: 'Auslöser von {count} Effekt(en) entfernt.',
      throttled:
        'Die Effekte auf der Seite „{page}“ werden ausgedünnt: Sie wollten mehr als {max} Spawns pro Sekunde. Senke ihre Intensität oder erhöhe das Limit mit !pagefx set maxSpawnsPerSecond.',
      settingChanged: '{setting} ist jetzt {value}.',
      problem: 'Der Effekt „{name}“ kann nicht laufen: {reason}',
    },
    menu: {
      page: 'Seite',
      live: 'Effekte laufen hier',
      notLive: 'keine Spieler hier',
      allPausedNote: 'Alle Effekte sind pausiert.',
      effectsHere: 'Effekte auf dieser Seite',
      noEffectsHere: 'Noch keine Effekte auf dieser Seite.',
      otherPages: 'Andere Seiten',
      effectCount: '{count} Effekt(e)',
      actions: 'Neu',
      selectHint:
        'Wähle zuerst ein Token auf der Karte aus und klicke dann auf Neuer Effekt oder Effektfreier Bereich. Das Token markiert, wo der Effekt erscheint; seine Aura 1 ist der Bereich.',
      state: 'Zustand',
      area: 'Bereich',
      areaValue: '{radius} {units} um das Token herum, {shape}',
      circle: 'Kreis',
      square: 'Quadrat',
      circleOption: 'Kreis',
      squareOption: 'Quadrat',
      layers: 'Ebenen',
      layer: 'Ebene {n}',
      noLayers: 'Keine Ebenen. Füge eine hinzu, um festzulegen, was dieser Effekt spawnt.',
      noFxSet: 'nicht festgelegt',
      timing: 'alle {min}–{max} ms',
      directionRandom: 'zufällige Richtung',
      directionOffset: 'endet {dx}, {dy} Felder entfernt',
      v1Note:
        'Dieser Effekt folgt noch den SL-Notizen („GM Notes“) und Leisten seines Tokens, wie in PageFX 1.x. Wenn du ihn hier änderst, endet das.',
      preset: 'Vorlage',
      presetsHint:
        'Wähle ein oder mehrere Tokens auf der Karte aus und klicke dann auf eine Vorlage. Tokens, die noch keine Effekte sind, werden zu Effekten, und ihre Aura 1 ist der Bereich, den die Vorlage füllt.',
      triggers: 'Auslöser',
      noTriggers: 'Keine Auslöser: Der Effekt läuft immer, wenn Spieler auf seiner Seite sind.',
      triggerHint:
        'Für einen Zug-Auslöser oder den Bereich eines anderen Tokens wähle zuerst dieses Token auf der Karte aus.',
      yes: 'Ja',
      no: 'Nein',
    },
    buttons: {
      edit: 'Bearbeiten',
      show: 'Anzeigen',
      turnOn: 'Einschalten',
      turnOff: 'Ausschalten',
      pause: 'Pausieren',
      resume: 'Fortsetzen',
      fire: 'Abfeuern',
      pauseAll: 'Alle pausieren',
      resumeAll: 'Alle fortsetzen',
      create: 'Neuer Effekt',
      createNull: 'Effektfreier Bereich',
      removeNull: 'Effektfreien Bereich entfernen',
      settings: 'Einstellungen',
      status: 'Status',
      rescan: 'Neu suchen',
      rename: 'Umbenennen',
      area: 'Bereich',
      intensity: 'Intensität',
      builtin: 'Eingebaute FX',
      saved: 'Gespeicherte FX',
      json: 'Eigenes JSON',
      timing: 'Zeitabstand',
      random: 'Zufällige Richtung',
      offset: 'Richtung festlegen',
      addLayer: 'Ebene hinzufügen',
      removeLayer: 'Ebene entfernen',
      delete: 'Effekt löschen',
      preset: 'Vorlage',
      presets: 'Vorlagen',
      remove: 'Entfernen',
      help: 'Hilfe',
      rebuild: 'Handouts neu erstellen',
      onRound: 'Jede Runde',
      onTurn: 'Bei einem Zug',
      onEnter: 'Token betritt',
      onLeave: 'Token verlässt',
      menu: 'Menü',
      change: 'Ändern',
    },
    prompts: {
      type: 'Effekttyp',
      colour: 'Farbe',
      saved: 'Gespeicherte eigene FX',
      json: 'Eigene FX-Definition (JSON)',
      intervalMin: 'Kürzeste Zeit zwischen Spawns in ms',
      intervalMax: 'Längste Zeit zwischen Spawns in ms',
      dx: 'Felder nach rechts bis zum Ende (negativ ist links)',
      dy: 'Felder nach unten bis zum Ende (negativ ist oben)',
      name: 'Name des Effekts',
      radius: 'Radius des Bereichs um das Token in Seiteneinheiten',
      shape: 'Form des Bereichs',
      intensity: 'Intensität ({min} bis {max})',
      maxSpawns: 'Spawns pro Sekunde auf einer Seite (1 bis {max})',
      preset: 'Vorlage',
      then: 'Dann',
      every: 'Alle wie viele Runden',
      who: 'Welche Tokens zählen',
      area: 'Welcher Bereich',
      once: 'Nur beim ersten Mal?',
      confirmDelete: 'Diesen Effekt löschen? Das Token bleibt auf der Karte.',
    },
    settings: {
      language: 'Sprache',
      globalIntensity: 'Intensität für alle Effekte',
      gmPreviewHint:
        'Wenn eingeschaltet, laufen Effekte auch auf der Seite, die sich die SL gerade ansieht, selbst ohne Spieler dort.',
      maxSpawnsHint:
        'Auf einer Seite, die mehr verlangt, werden die Effekte ausgedünnt. Roll20 läuft bis etwa 60 flüssig.',
    },
    status: {
      livePages: 'Aktive Seiten',
      effects: 'Effekte',
      running: 'Läuft',
      globalPause: 'Alle pausiert',
      on: 'An',
      off: 'Aus',
      pausedState: 'Pausiert',
      waiting: 'Nicht auf einer aktiven Seite',
      noFx: 'Kein Effekt gewählt',
      broken: 'Kann nicht laufen',
      nullAreas: 'Effektfreie Bereiche',
      noEffects:
        'Noch keine Effekte. Wähle ein Token aus und gib !pagefx create ein, oder öffne das Menü mit !pagefx.',
      gmPreview: 'SL-Seitenvorschau',
      intensity: 'Intensität',
      maxSpawns: 'Max. Spawns pro Sekunde und Seite',
    },
    help: {
      menu: 'Öffnet das Menü: die Effekte auf deiner Seite und Schaltflächen für alles andere.',
      create:
        'Macht die ausgewählten Tokens zu Effekten. Ihre Aura 1 ist der Bereich; haben sie keine, wird eine hinzugefügt.',
      edit: 'Zeigt die Infokarte jedes ausgewählten Effekts mit Schaltflächen zum Ändern.',
      preset:
        'Gibt den ausgewählten Tokens eine Vorlage und macht sie vorher zu Effekten, falls nötig.',
      presets: 'Listet die Vorlagen nach Paket auf.',
      switches:
        'Schaltet die ausgewählten Effekte ein oder aus oder pausiert sie und setzt sie fort. Ist nichts ausgewählt, starten on und resume alles wieder, und off und pause halten alles an (wie !pageFX on und off in Version 1).',
      fire: 'Spawnt die ausgewählten Effekte jetzt, einmal oder ein paar Mal, zum Ausprobieren.',
      fx: 'Legt fest, was eine Ebene spawnt: einen eingebauten Effekt wie burn-fire, den Namen eines gespeicherten eigenen FX oder eine eigene FX-Definition in JSON.',
      interval:
        'Legt die Zeit zwischen den Spawns einer Ebene in Millisekunden fest. Jede Wartezeit wird zufällig zwischen den beiden Werten gewählt.',
      direction:
        'Legt für strahlartige Effekte fest, wo jeder Spawn endet: zufällig oder so viele Felder nach rechts und unten vom Startpunkt.',
      area: 'Legt den Bereich fest: den Radius der Aura 1 des Tokens in Seiteneinheiten und ihre Form.',
      intensity:
        'Vervielfacht, wie oft die ausgewählten Effekte spawnen (0,1 bis 5). Mit global gilt es für alle Effekte.',
      name: 'Benennt die ausgewählten Effekte um.',
      layer: 'Fügt eine Ebene hinzu, damit ein Effekt mehrere Dinge spawnt, oder entfernt eine.',
      triggerAdd:
        'Fügt einen Auslöser hinzu: bei round, turn, enter oder leave wird start, stop, toggle, fire oder burst ausgeführt. Optionen: every=2, round=3, count=5, who=players|all|named, names=A;B, area=selected, once.',
      triggerRemove: 'Entfernt einen Auslöser oder alle von den ausgewählten Effekten.',
      null: 'Macht die ausgewählten Tokens zu effektfreien Bereichen, in denen nie ein Effekt spawnt, oder hebt das wieder auf.',
      delete: 'Entfernt den Effekt von den ausgewählten Tokens. Die Tokens bleiben auf der Karte.',
      status: 'Listet jeden Effekt auf, mit seiner Seite und ob er läuft.',
      settings: 'Zeigt die Einstellungen.',
      set: 'Ändert eine Einstellung: language, gmPagePreview, intensity oder maxSpawnsPerSecond.',
      rescan:
        'Übernimmt neue Tokens mit dem Namen PageFX oder NullFX und vergisst Effekte, deren Tokens gelöscht wurden.',
      journal: 'Erstellt die Handouts Help und Command Deck neu.',
      help: 'Zeigt diese Liste.',
      handout:
        'Die vollständige Anleitung steht im Handout „{help}“; Schaltflächen für einen Klick findest du in „{deck}“.',
    },
    deck: {
      menuTitle: 'Menü',
      menuDesc: 'Das Hauptmenü listet die Effekte auf deiner Seite auf. Status listet alle auf.',
      newTitle: 'Neu',
      newDesc:
        'Wähle zuerst ein oder mehrere Tokens auf der Karte aus. Ihre Aura 1 wird der Bereich, den der Effekt füllt.',
      selectedTitle: 'Ausgewählte Effekte',
      selectedDesc: 'Wähle Effekt-Tokens auf der Karte aus und klicke dann auf eine Schaltfläche.',
      allTitle: 'Alles',
      allDesc: 'Alle Effekte anhalten oder alle wieder starten.',
      toolsTitle: 'Werkzeuge',
      toolsDesc: 'Kopierte oder gelöschte Tokens erfassen und diese Handouts neu erstellen.',
      footer: 'Die vollständige Anleitung steht im Handout „{help}“.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Wetter- und Atmosphäreeffekte für Roll20-Karten',
      footer: 'Im Handout „{deck}“ findest du Steuerung mit einem Klick.',
      overview: {
        heading: 'Überblick',
        body: 'PageFX füllt einen Bereich der Karte mit fortlaufenden Effekten: Regen, Schnee, Glut, Dampf, Glühwürmchen und mehr. Ein Token markiert den Ort jedes Effekts, und seine Aura 1 ist der Bereich. Effekte laufen auf jeder Seite, auf der Spieler sind, auch auf Seiten, zu denen eine geteilte Gruppe geschickt wurde, und stoppen, wenn die Spieler gehen. Alles wird über Chatmenüs eingestellt, und Auslöser können Effekte starten oder stoppen, wenn Kampfrunden vergehen oder Tokens sich bewegen.',
        demo: 'Kurze Demo ansehen (aus Version 1)',
      },
      quickStart: {
        heading: 'Schnellstart',
        steps: [
          'Setze ein Token dorthin, wo der Effekt sein soll (auf der SL-Ebene bleibt es vor den Spielern verborgen), und wähle es aus.',
          'Gib !pagefx presets ein oder öffne das Command Deck und klicke auf Vorlagen, dann klicke auf eine Vorlage wie Starker Regen.',
          'Ändere die Größe der Aura 1 des Tokens, um den Bereich festzulegen, den der Effekt füllt. Die Aura ist vor den Spielern verborgen.',
          'Verschiebe die Spieler auf die Seite. Der Effekt startet und stoppt wieder, wenn sie gehen.',
          'Gib !pagefx ein, um das Menü zu öffnen, und klicke bei einem Effekt auf Bearbeiten, um ihn zu ändern.',
        ],
      },
      effects: {
        heading: 'Effekte',
        points: [
          'Ein Effekt ist ein Token plus Einstellungen, die PageFX speichert. Verschiebe das Token, um den Effekt zu verschieben, und ändere seine Aura 1, um den Bereich zu ändern. Wird das Token gelöscht, wird auch der Effekt gelöscht.',
          'Jeder Effekt hat eine oder mehrere Ebenen. Jede Ebene spawnt immer wieder ein Ding, mit einer zufälligen Wartezeit zwischen ihrer kürzesten und längsten Zeit.',
          'Eine Ebene kann einen eingebauten Roll20-Effekt spawnen (Typ und Farbe, z. B. burn-fire), einen im Spiel gespeicherten eigenen FX oder eine als JSON eingefügte eigene FX-Definition. Fehlende Werte in einer Definition werden ergänzt, sodass auch eine kurze Definition etwas zeichnet.',
          'Strahlartige Effekte (beam, breath, splatter und eigene FX mit angle -1) werden zwischen zwei Punkten gezeichnet. Ihre Richtung ist zufällig oder eine feste Anzahl Felder nach rechts und unten.',
          'Die Intensität vervielfacht, wie oft ein Effekt spawnt. Die Einstellung intensity vervielfacht alle Effekte.',
          'Aus stoppt einen Effekt, bis er eingeschaltet wird. Pausieren hält ihn an, bis er fortgesetzt wird. Alle pausieren hält jeden Effekt an, ohne ihn zu ändern.',
          'Jumpgate zeichnet eigene FX-Definitionen in Weiß, wenn sie nicht als eigene FX gespeichert sind. Deshalb speichert PageFX seine eigenen als eigene FX mit dem Namen „PageFX: …“. Sie werden entfernt, wenn kein Effekt sie mehr nutzt. Lass sie stehen.',
        ],
      },
      pages: {
        heading: 'Auf welchen Seiten Effekte laufen',
        points: [
          'Effekte laufen auf der Seite mit dem Spielerbanner und auf jeder Seite, auf die ein Spieler einzeln verschoben wurde.',
          'Schalte die SL-Seitenvorschau ein, damit Effekte auch auf der Seite laufen, die sich die SL gerade ansieht, um sie ohne Spieler auszuprobieren.',
          'Jede Seite bekommt höchstens Max. Spawns pro Sekunde (standardmäßig 30). Verlangen die Effekte mehr, werden einige Spawns übersprungen, und die SL wird einmal benachrichtigt.',
          'Wenn ein anderer Mod das Spielerbanner verschiebt oder die Gruppe aufteilt, sagt Roll20 niemandem Bescheid. Deshalb schaut PageFX alle paar Sekunden nach und holt auf.',
        ],
      },
      presets: {
        heading: 'Vorlagen',
        intro:
          'Eine Vorlage gibt einem Effekt eine Reihe fertiger Ebenen. Änderst du danach eine Ebene, wird der Effekt zu deinem eigenen. Andere Mods können mit PageFX.registerPreset Vorlagen hinzufügen.',
        colPack: 'Paket',
        colPresets: 'Vorlagen (Name und ID)',
      },
      triggers: {
        heading: 'Auslöser',
        intro:
          'Ein Auslöser startet, stoppt, schaltet oder feuert einen Effekt ab, wenn etwas passiert. Füge sie auf der Infokarte des Effekts hinzu oder mit !pagefx trigger add.',
        points: [
          'Jede Runde: Roll20 führt keine Rundenzahl, daher beginnt eine Runde, wenn die Zugreihenfolge von ihrem letzten Eintrag wieder nach oben weitergeschaltet wird. Gibt es einen eigenen Eintrag in der Zugreihenfolge namens „Round“, wird stattdessen dieser verwendet. Wähle alle so und so viele Runden oder eine bestimmte Runde. Die erste Runde eines Kampfes zählt nicht als Wechsel.',
          'Bei einem Zug: wenn ein gewähltes Token an die Spitze der Zugreihenfolge rückt. Wähle das Token auf der Karte aus, bevor du auf die Schaltfläche klickst.',
          'Token betritt oder verlässt: wenn ein Token in den Bereich des Effekts hinein- oder aus ihm herausgeht, oder in die Aura 1 eines anderen Tokens, das du auswählst. Standardmäßig zählen nur Tokens, die ein Spieler steuert; wähle beliebige Tokens oder gib Namen an.',
          '„Eine Salve abfeuern“ spawnt den Effekt mehrmals auf einmal. Mit „Nur beim ersten Mal“ greift ein Auslöser nur ein einziges Mal.',
          'Roll20 sagt Mods nichts, wenn ein anderer Mod ein Token bewegt. Mods, die Tokens bewegen, können danach PageFX.checkToken(token) aufrufen.',
        ],
      },
      nullAreas: {
        heading: 'Effektfreie Bereiche',
        points: [
          'Ein effektfreier Bereich ist ein Token, in dem nie ein Effekt spawnt, zum Beispiel das Innere eines Hauses im Sturm. Sein Bereich ist das Token und seine Aura 1.',
          'Wähle das Token aus und klicke im Menü oder im Command Deck auf Effektfreier Bereich. Tokens mit dem Namen NullFX sind wie in Version 1 ebenfalls effektfreie Bereiche.',
        ],
      },
      commands: {
        heading: 'Befehle',
        intro:
          'Nur SLs können diese Befehle verwenden. Sie wirken auf die ausgewählten Tokens oder auf die mit --ids angegebenen Tokens. Ebenen-Befehle wirken auf Ebene 1, wenn --layer nichts anderes sagt. Andere Mods können sie auch senden; die Antworten gehen an die SL.',
        colCommand: 'Befehl',
        colDesc: 'Was er tut',
      },
      settings: {
        heading: 'Einstellungen',
        intro:
          'Ändere Einstellungen auf der Infokarte Einstellungen oder mit !pagefx set. Die Sprache kann auch auf der Einstellungsseite des Mods festgelegt werden.',
        colKey: 'Einstellung',
        colDesc: 'Was sie tut',
        rows: {
          language: 'Die Sprache der Menüs, Meldungen und Handouts von PageFX.',
          gmPagePreview:
            'Effekte auch auf der Seite laufen lassen, die sich die SL gerade ansieht (standardmäßig aus).',
          intensity: 'Vervielfacht, wie oft jeder Effekt spawnt (standardmäßig 1).',
          maxSpawnsPerSecond:
            'Die meisten Spawns auf einer Seite pro Sekunde, 1 bis 60 (standardmäßig 30).',
        },
      },
      api: {
        heading: 'Für andere Mods',
        intro:
          'PageFX stellt ein PageFX-Objekt bereit. Wo eine Funktion ein Token erwartet, funktioniert auch die ID des Tokens.',
        colFunction: 'Funktion',
        colDesc: 'Was sie tut',
        rows: {
          activateAll: 'Setzt alle Effekte fort (Version 1).',
          deactivateAll: 'Pausiert alle Effekte (Version 1).',
          activate: 'Schaltet einen Effekt ein, aus oder um (Version 1).',
          start: 'Schaltet einen Effekt ein oder aus oder pausiert ihn und setzt ihn fort.',
          setIntensity: 'Ändert die Intensität eines Effekts.',
          fire: 'Spawnt einen Effekt sofort.',
          create:
            'Macht ein Token zu einem Effekt, mit den Optionen name, fx, interval, direction und intensity, oder hebt das wieder auf.',
          getEffect:
            'Liest einen Effekt, listet die Effekte (auf einer Seite) auf oder fragt, ob einer läuft.',
          registerPreset: 'Fügt eine Vorlage für diese Sitzung hinzu oder listet sie auf.',
          checkToken:
            'Prüft ein Token, das dein Mod bewegt hat, anhand der Auslöser für Betreten und Verlassen.',
        },
      },
      upgrading: {
        heading: 'Upgrade von Version 1',
        points: [
          'Tokens mit dem Namen PageFX und NullFX werden beim ersten Start übernommen und funktionieren weiter wie bisher.',
          'Bis du einen Effekt über den Chat änderst, steuern ihn weiterhin die SL-Notizen („GM Notes“), Bar 1 (Zeit zwischen Spawns) und Bar 2 (Strahlrichtung) seines Tokens, und der Statusmarker interdiction schaltet ihn weiterhin aus. Sobald du ihn über den Chat änderst, gehören die SL-Notizen und Leisten wieder dir.',
          'Version 1 hat Effekte nur auf der Seite mit dem Spielerbanner gezeichnet und gespeicherte eigene FX doppelt gespawnt. Beides ist behoben.',
          'Die Befehle aus Version 1 funktionieren weiterhin:',
        ],
        colV1: 'Befehl aus Version 1',
        colV2: 'Entspricht',
      },
      troubleshooting: {
        heading: 'Fehlerbehebung',
        points: [
          'Ein Effekt läuft nicht: Öffne seine Infokarte. Die Zeile Zustand sagt, warum: aus, pausiert, kein Effekt gewählt, kann nicht laufen (mit Grund) oder nicht auf einer aktiven Seite (keine Spieler dort; schalte die SL-Seitenvorschau ein, um ihn auszuprobieren).',
          'Du siehst nichts: Sehr kleine oder kurzlebige Partikel sind auf einer vollen Karte schwer zu sehen. Probiere eine Vorlage, erhöhe die Intensität oder verkleinere den Bereich.',
          'Effekte wirken dünn: Die Seite ist vielleicht bei Max. Spawns pro Sekunde angekommen. Senke einige Intensitäten oder erhöhe das Limit.',
          'Effekte stoppen nach dem Kopieren einer Seite oder eines Spiels: Führe Neu suchen aus.',
          'In allen anderen Fällen sieh im API-Konsolenprotokoll nach und füge dessen Meldungen bei, wenn du um Hilfe bittest.',
        ],
      },
      languages: {
        heading: 'Sprachen',
        body: 'Wähle eine Sprache auf der Infokarte Einstellungen oder mit !pagefx set language. Verfügbare Sprachen:',
        colLanguage: 'Sprache',
        colNative: 'Eigenname',
        colCode: 'Code',
      },
      credits: {
        heading: 'Mitwirkende',
        original: 'Ursprünglicher Mod von',
        maintainer: 'Version 2 gepflegt von',
        marketplace: 'Adas Grafikpakete im Roll20 Marketplace',
        support:
          'Wenn du einen Fehler findest oder eine Idee hast, schreib im Roll20-Mod-Forum oder eröffne ein Issue auf GitHub und füge alle Meldungen aus dem API-Konsolenprotokoll bei.',
      },
    },
    triggers: {
      line: '{when}: {action}',
      eachRound: 'Jede neue Runde',
      everyRounds: 'Alle {n} Runden',
      onRound: 'In Runde {n}',
      turn: 'Wenn der Zug von {name} beginnt',
      enter: 'Wenn {who} {area} betritt',
      leave: 'Wenn {who} {area} verlässt',
      areaSelf: 'den Bereich dieses Effekts',
      areaSelected: 'die Aura des ausgewählten Tokens',
      areaOf: 'die Aura von {name}',
      unnamed: 'ein Token',
      once: '(nur beim ersten Mal)',
      onceUsed: '(nur beim ersten Mal, bereits verbraucht)',
      who: {
        players: 'ein Spieler-Token',
        all: 'ein beliebiges Token',
      },
      action: {
        start: 'starten',
        stop: 'stoppen',
        toggle: 'ein- oder ausschalten',
        fire: 'einmal abfeuern',
        burst: 'eine Salve von {count} abfeuern',
      },
      choice: {
        start: 'Starten',
        stop: 'Stoppen',
        toggle: 'Ein- oder ausschalten',
        fire: 'Einmal abfeuern',
        burst: 'Eine Salve abfeuern',
      },
    },
    packs: {
      weather: 'Wetter',
      fire: 'Feuer und Hitze',
      water: 'Wasser',
      magic: 'Magie und Unheimliches',
      custom: 'Aus anderen Mods',
    },
    presets: {
      'light-rain': 'Leichter Regen',
      'heavy-rain': 'Starker Regen',
      thunderstorm: 'Gewitter',
      snow: 'Schnee',
      blizzard: 'Schneesturm',
      hail: 'Hagel',
      sandstorm: 'Sandsturm',
      fog: 'Nebelschwaden',
      embers: 'Glut',
      ash: 'Fallende Asche',
      magma: 'Brodelndes Magma',
      'lava-spurts': 'Lavaspritzer',
      sparks: 'Funken',
      drips: 'Höhlentropfen',
      steam: 'Dampfschlote',
      geyser: 'Geysir',
      spray: 'Wasserfallgischt',
      bubbles: 'Blasen',
      fireflies: 'Glühwürmchen',
      'arcane-motes': 'Arkane Lichtpunkte',
      'necrotic-mist': 'Nekrotischer Nebel',
      'holy-glimmer': 'Heiliger Schimmer',
      'swamp-gas': 'Sumpfgas',
    },
    fx: {
      empty: 'Es ist kein Effekt festgelegt.',
      badJson: 'Die eigene FX-Definition ist kein gültiges JSON.',
      unknownColour: 'Es gibt keine eingebaute Farbe „{colour}“. Farben: {colours}.',
      savedMissing: 'Es gibt keinen gespeicherten eigenen FX namens „{name}“.',
      cannotCreate: 'Roll20 konnte dafür kein eigenes FX-Objekt erstellen.',
      spawnFailed: 'Roll20 konnte ihn nicht spawnen ({message}).',
    },
    errors: {
      unknownCommand: 'Unbekannter Befehl: {command}',
      noEffects: 'Wähle ein oder mehrere PageFX-Tokens aus oder gib ihre IDs mit --ids an.',
      selectToken: 'Wähle zuerst ein oder mehrere Tokens aus oder gib ihre IDs mit --ids an.',
      unknownIds: 'Das sind keine PageFX-Effekte: {ids}',
      badSetting: 'Unbekannte Einstellung oder unbekannter Wert: {setting} {value}',
      noLayer: '„{name}“ hat keine Ebene {n}.',
      tooManyLayers: 'Ein Effekt kann höchstens {max} Ebenen haben.',
      layerUsage: 'Verwende !pagefx layer add [effect] oder !pagefx layer remove <number>.',
      nullUsage: 'Verwende !pagefx null create oder !pagefx null remove.',
      isEffect: '„{name}“ ist ein Effekt und kann daher nicht auch ein effektfreier Bereich sein.',
      badInterval:
        'Gib die Zeit zwischen den Spawns in ms an, zum Beispiel: !pagefx interval 500 1500',
      badDirection:
        'Gib random oder Felder nach rechts und unten an, zum Beispiel: !pagefx direction 2 -1',
      badArea:
        'Gib einen Radius in Seiteneinheiten und circle oder square an, zum Beispiel: !pagefx area 15 circle',
      badIntensity: 'Gib eine Intensität über 0 an, zum Beispiel: !pagefx intensity 1.5',
      noName: 'Gib einen Namen an, zum Beispiel: !pagefx name Regen über den Docks',
      triggerUsage:
        'Verwende !pagefx trigger add <round|turn|enter|leave> <start|stop|toggle|fire|burst> [every=2] [round=3] [count=5] [who=players|all|named] [names=A;B] [area=self|selected] [once] oder !pagefx trigger remove <number>.',
      triggerToken:
        'Wähle zuerst das Token, um das es bei diesem Auslöser geht, auf der Karte aus, oder gib token=<id> an.',
      triggerNames:
        'Gib die Token-Namen mit names= an, getrennt durch ; (zum Beispiel names=Goblin;Orc).',
      tooManyTriggers: 'Ein Effekt kann höchstens {max} Auslöser haben.',
      noTrigger: '„{name}“ hat keinen Auslöser {n}.',
      journalUsage: 'Verwende !pagefx journal rebuild.',
      unknownPreset: 'Es gibt keine Vorlage „{id}“. Gib !pagefx presets ein, um alle zu sehen.',
      unexpected: 'Etwas ist schiefgelaufen: {message}',
    },
  };

  const TRANSLATION$3 = {
    titles: {
      ready: 'Το PageFX είναι έτοιμο.',
      menu: 'PageFX',
      status: 'Κατάσταση PageFX',
      settings: 'Ρυθμίσεις PageFX',
      presets: 'Προρρυθμίσεις PageFX',
      help: 'Εντολές PageFX',
      effect: 'Εφέ: {name}',
    },
    messages: {
      readyHint: 'Πληκτρολογήστε !pagefx για να ανοίξει το μενού.',
      adopted:
        'Αναλήφθηκαν από πιόνια του PageFX 1.x εφέ: {effects}, περιοχές χωρίς εφέ: {nulls}. Συνεχίζουν να λειτουργούν όπως πριν.',
      rescanned:
        'Η νέα σάρωση βρήκε νέα εφέ ({effects}) και νέες περιοχές χωρίς εφέ ({nulls}) και ξέχασε εφέ ({dropped}) των οποίων τα πιόνια διαγράφηκαν.',
      allPaused: 'Όλα τα εφέ είναι σε παύση. Χρησιμοποιήστε !pagefx resume για να ξεκινήσουν ξανά.',
      allResumed: 'Τα εφέ τρέχουν ξανά.',
      turnedOn: 'Ενεργοποιήθηκαν: {count}.',
      turnedOff: 'Απενεργοποιήθηκαν: {count}.',
      toggled: 'Ενεργοποιήθηκαν ή απενεργοποιήθηκαν: {count}.',
      paused: 'Σε παύση: {count}.',
      resumed: 'Συνεχίστηκαν: {count}.',
      fired: 'Εμφανίστηκαν εφέ: {count}.',
      created: 'Νέα εφέ: {count}. Επιλέξτε στην κάρτα του καθενός τι θα εμφανίζει.',
      deleted: 'Αφαιρέθηκαν εφέ: {count}. Τα πιόνια τους παραμένουν στον χάρτη.',
      renamed: 'Μετονομάστηκαν: {count}.',
      fxSet: 'Άλλαξε το εφέ: {count}.',
      intervalSet: 'Άλλαξε ο χρονισμός: {count}.',
      directionSet: 'Άλλαξε η κατεύθυνση: {count}.',
      areaSet: 'Άλλαξε η περιοχή: {count}.',
      intensitySet: 'Άλλαξε η ένταση: {count}.',
      layerAdded: 'Προστέθηκε επίπεδο: {count}.',
      layerRemoved: 'Αφαιρέθηκε επίπεδο: {count}.',
      nullCreated: 'Νέες περιοχές χωρίς εφέ: {count}.',
      nullRemoved: 'Αφαιρέθηκαν περιοχές χωρίς εφέ: {count}.',
      presetApplied: 'Εφαρμόστηκε {name}: {count}.',
      journalRebuilt: 'Τα φυλλάδια «{help}» και «{deck}» δημιουργήθηκαν ξανά.',
      triggerAdded: 'Προστέθηκε έναυσμα: {count}.',
      triggerRemoved: 'Αφαιρέθηκε έναυσμα: {count}.',
      triggersCleared: 'Αφαιρέθηκαν εναύσματα από εφέ: {count}.',
      throttled:
        'Τα εφέ στη σελίδα «{page}» αραιώνονται: ζήτησαν περισσότερες από {max} εμφανίσεις το δευτερόλεπτο. Μειώστε την έντασή τους ή αυξήστε το όριο με !pagefx set maxSpawnsPerSecond.',
      settingChanged: 'Το {setting} είναι τώρα {value}.',
      problem: 'Το εφέ «{name}» δεν μπορεί να τρέξει: {reason}',
    },
    menu: {
      page: 'Σελίδα',
      live: 'τα εφέ τρέχουν εδώ',
      notLive: 'δεν υπάρχουν παίκτες εδώ',
      allPausedNote: 'Όλα τα εφέ είναι σε παύση.',
      effectsHere: 'Εφέ σε αυτή τη σελίδα',
      noEffectsHere: 'Δεν υπάρχουν ακόμη εφέ σε αυτή τη σελίδα.',
      otherPages: 'Άλλες σελίδες',
      effectCount: 'εφέ: {count}',
      actions: 'Νέο',
      selectHint:
        'Επιλέξτε πρώτα ένα πιόνι στον χάρτη και μετά πατήστε Νέο εφέ ή Περιοχή χωρίς εφέ. Το πιόνι δείχνει πού εμφανίζεται το εφέ· η «Aura 1» του είναι η περιοχή.',
      state: 'Κατάσταση',
      area: 'Περιοχή',
      areaValue: '{radius} {units} πέρα από το πιόνι, {shape}',
      circle: 'κύκλος',
      square: 'τετράγωνο',
      circleOption: 'Κύκλος',
      squareOption: 'Τετράγωνο',
      layers: 'Επίπεδα',
      layer: 'Επίπεδο {n}',
      noLayers: 'Κανένα επίπεδο. Προσθέστε ένα για να επιλέξετε τι εμφανίζει αυτό το εφέ.',
      noFxSet: 'δεν έχει οριστεί',
      timing: 'κάθε {min}–{max} ms',
      directionRandom: 'τυχαία κατεύθυνση',
      directionOffset: 'τελειώνει {dx}, {dy} κελιά μακριά',
      v1Note:
        'Αυτό το εφέ ακολουθεί ακόμη τις «GM Notes» και τις μπάρες του πιονιού του, όπως στο PageFX 1.x. Αν το αλλάξετε εδώ, αυτό σταματά.',
      preset: 'Προρρύθμιση',
      presetsHint:
        'Επιλέξτε ένα ή περισσότερα πιόνια στον χάρτη και μετά πατήστε μια προρρύθμιση. Τα πιόνια που δεν είναι ακόμη εφέ γίνονται εφέ, και η «Aura 1» τους είναι η περιοχή που γεμίζει η προρρύθμιση.',
      triggers: 'Εναύσματα',
      noTriggers: 'Κανένα έναυσμα: το εφέ τρέχει όποτε υπάρχουν παίκτες στη σελίδα του.',
      triggerHint:
        'Για έναυσμα σειράς ή για περιοχή άλλου πιονιού, επιλέξτε πρώτα εκείνο το πιόνι στον χάρτη.',
      yes: 'Ναι',
      no: 'Όχι',
    },
    buttons: {
      edit: 'Επεξεργασία',
      show: 'Εμφάνιση',
      turnOn: 'Ενεργοποίηση',
      turnOff: 'Απενεργοποίηση',
      pause: 'Παύση',
      resume: 'Συνέχεια',
      fire: 'Εκτέλεση',
      pauseAll: 'Παύση όλων',
      resumeAll: 'Συνέχεια όλων',
      create: 'Νέο εφέ',
      createNull: 'Περιοχή χωρίς εφέ',
      removeNull: 'Αφαίρεση περιοχής χωρίς εφέ',
      settings: 'Ρυθμίσεις',
      status: 'Κατάσταση',
      rescan: 'Νέα σάρωση',
      rename: 'Μετονομασία',
      area: 'Περιοχή',
      intensity: 'Ένταση',
      builtin: 'Ενσωματωμένα FX',
      saved: 'Αποθηκευμένα FX',
      json: 'Προσαρμοσμένο JSON',
      timing: 'Χρονισμός',
      random: 'Τυχαία κατεύθυνση',
      offset: 'Ορισμός κατεύθυνσης',
      addLayer: 'Προσθήκη επιπέδου',
      removeLayer: 'Αφαίρεση επιπέδου',
      delete: 'Διαγραφή εφέ',
      preset: 'Προρρύθμιση',
      presets: 'Προρρυθμίσεις',
      remove: 'Αφαίρεση',
      help: 'Βοήθεια',
      rebuild: 'Ανανέωση φυλλαδίων',
      onRound: 'Κάθε γύρο',
      onTurn: 'Σε μια σειρά',
      onEnter: 'Είσοδος πιονιού',
      onLeave: 'Έξοδος πιονιού',
      menu: 'Μενού',
      change: 'Αλλαγή',
    },
    prompts: {
      type: 'Τύπος εφέ',
      colour: 'Χρώμα',
      saved: 'Αποθηκευμένο προσαρμοσμένο FX',
      json: 'Ορισμός προσαρμοσμένου FX (JSON)',
      intervalMin: 'Ελάχιστος χρόνος μεταξύ εμφανίσεων σε ms',
      intervalMax: 'Μέγιστος χρόνος μεταξύ εμφανίσεων σε ms',
      dx: 'Κελιά οριζόντια ως το τέλος (αρνητικό προς τα αριστερά)',
      dy: 'Κελιά προς τα κάτω ως το τέλος (αρνητικό προς τα πάνω)',
      name: 'Όνομα εφέ',
      radius: 'Ακτίνα περιοχής πέρα από το πιόνι σε μονάδες σελίδας',
      shape: 'Σχήμα περιοχής',
      intensity: 'Ένταση ({min} έως {max})',
      maxSpawns: 'Εμφανίσεις ανά δευτερόλεπτο σε μία σελίδα (1 έως {max})',
      preset: 'Προρρύθμιση',
      then: 'Μετά',
      every: 'Κάθε πόσους γύρους',
      who: 'Ποια πιόνια μετράνε',
      area: 'Ποια περιοχή',
      once: 'Μόνο την πρώτη φορά;',
      confirmDelete: 'Διαγραφή αυτού του εφέ; Το πιόνι μένει στον χάρτη.',
    },
    settings: {
      language: 'Γλώσσα',
      globalIntensity: 'Ένταση για όλα τα εφέ',
      gmPreviewHint:
        'Όταν είναι ενεργό, τα εφέ τρέχουν και στη σελίδα που κοιτάζει κάθε GM, ακόμη κι αν δεν υπάρχουν παίκτες εκεί.',
      maxSpawnsHint:
        'Σε σελίδα που ζητά περισσότερες, τα εφέ αραιώνονται. Το Roll20 μένει ομαλό μέχρι περίπου 60.',
    },
    status: {
      livePages: 'Ενεργές σελίδες',
      effects: 'Εφέ',
      running: 'Τρέχει',
      globalPause: 'Όλα σε παύση',
      on: 'Ενεργό',
      off: 'Ανενεργό',
      pausedState: 'Σε παύση',
      waiting: 'Όχι σε ενεργή σελίδα',
      noFx: 'Δεν έχει επιλεγεί εφέ',
      broken: 'Δεν μπορεί να τρέξει',
      nullAreas: 'Περιοχές χωρίς εφέ',
      noEffects:
        'Δεν υπάρχουν ακόμη εφέ. Επιλέξτε ένα πιόνι και πληκτρολογήστε !pagefx create, ή ανοίξτε το μενού με !pagefx.',
      gmPreview: 'Προεπισκόπηση σελίδας GM',
      intensity: 'Ένταση',
      maxSpawns: 'Μέγ. εμφανίσεις ανά δευτερόλεπτο ανά σελίδα',
    },
    help: {
      menu: 'Ανοίγει το μενού: τα εφέ στη σελίδα σας και κουμπιά για όλα τα υπόλοιπα.',
      create:
        'Κάνει τα επιλεγμένα πιόνια εφέ. Η «Aura 1» τους είναι η περιοχή· αν δεν έχουν, προστίθεται μία.',
      edit: 'Δείχνει την κάρτα κάθε επιλεγμένου εφέ, με κουμπιά για να το αλλάξετε.',
      preset: 'Δίνει στα επιλεγμένα πιόνια μια προρρύθμιση, κάνοντάς τα πρώτα εφέ αν χρειάζεται.',
      presets: 'Παραθέτει τις προρρυθμίσεις ανά πακέτο.',
      switches:
        'Ενεργοποιεί ή απενεργοποιεί τα επιλεγμένα εφέ, ή τα βάζει σε παύση και τα συνεχίζει. Χωρίς επιλογή, τα on και resume ξεκινούν ξανά τα πάντα και τα off και pause σταματούν τα πάντα (όπως έκαναν τα !pageFX on και off στην έκδοση 1).',
      fire: 'Εμφανίζει τώρα τα επιλεγμένα εφέ, μία ή λίγες φορές, για να τα δοκιμάσετε.',
      fx: 'Ορίζει τι εμφανίζει ένα επίπεδο: ένα ενσωματωμένο εφέ όπως το burn-fire, το όνομα ενός αποθηκευμένου προσαρμοσμένου FX, ή έναν ορισμό προσαρμοσμένου FX σε JSON.',
      interval:
        'Ορίζει τον χρόνο μεταξύ των εμφανίσεων ενός επιπέδου, σε χιλιοστά του δευτερολέπτου. Κάθε αναμονή επιλέγεται τυχαία ανάμεσα στις δύο τιμές.',
      direction:
        'Για εφέ τύπου ακτίνας, ορίζει πού τελειώνει κάθε εμφάνιση: random, ή κελιά οριζόντια και προς τα κάτω από το σημείο έναρξης.',
      area: 'Ορίζει την περιοχή: την ακτίνα της «Aura 1» του πιονιού σε μονάδες σελίδας, και το σχήμα της.',
      intensity:
        'Πολλαπλασιάζει πόσο συχνά εμφανίζονται τα επιλεγμένα εφέ (0,1 έως 5). Με το global, την αλλάζει για όλα τα εφέ.',
      name: 'Μετονομάζει τα επιλεγμένα εφέ.',
      layer: 'Προσθέτει ένα επίπεδο, ώστε ένα εφέ να εμφανίζει πολλά πράγματα, ή αφαιρεί ένα.',
      triggerAdd:
        'Προσθέτει ένα έναυσμα: σε round, turn, enter ή leave, εκτελεί start, stop, toggle, fire ή burst. Επιλογές: every=2, round=3, count=5, who=players|all|named, names=A;B, area=selected, once.',
      triggerRemove: 'Αφαιρεί ένα έναυσμα, ή όλα, από τα επιλεγμένα εφέ.',
      null: 'Κάνει τα επιλεγμένα πιόνια περιοχές χωρίς εφέ, όπου δεν εμφανίζεται ποτέ κανένα εφέ, ή τα επαναφέρει.',
      delete: 'Αφαιρεί το εφέ από τα επιλεγμένα πιόνια. Τα πιόνια μένουν στον χάρτη.',
      status: 'Παραθέτει κάθε εφέ, τη σελίδα του και αν τρέχει.',
      settings: 'Δείχνει τις ρυθμίσεις.',
      set: 'Αλλάζει μια ρύθμιση: language, gmPagePreview, intensity ή maxSpawnsPerSecond.',
      rescan:
        'Αναλαμβάνει νέα πιόνια με όνομα PageFX ή NullFX και ξεχνά εφέ των οποίων τα πιόνια διαγράφηκαν.',
      journal: 'Δημιουργεί ξανά τα φυλλάδια Βοήθειας και Command Deck.',
      help: 'Δείχνει αυτή τη λίστα.',
      handout:
        'Οι πλήρεις οδηγίες βρίσκονται στο φυλλάδιο «{help}»· τα κουμπιά ενός κλικ στο «{deck}».',
    },
    deck: {
      menuTitle: 'Μενού',
      menuDesc: 'Το κύριο μενού δείχνει τα εφέ στη σελίδα σας. Η Κατάσταση τα δείχνει όλα.',
      newTitle: 'Νέο',
      newDesc:
        'Επιλέξτε πρώτα ένα ή περισσότερα πιόνια στον χάρτη. Η «Aura 1» τους γίνεται η περιοχή που γεμίζει το εφέ.',
      selectedTitle: 'Επιλεγμένα εφέ',
      selectedDesc: 'Επιλέξτε πιόνια εφέ στον χάρτη και μετά πατήστε ένα κουμπί.',
      allTitle: 'Όλα',
      allDesc: 'Σταματήστε όλα τα εφέ ή ξεκινήστε τα όλα ξανά.',
      toolsTitle: 'Εργαλεία',
      toolsDesc:
        'Αναλάβετε πιόνια που αντιγράφηκαν, ξεχάστε όσα διαγράφηκαν και ανανεώστε αυτά τα φυλλάδια.',
      footer: 'Δείτε το φυλλάδιο «{help}» για πλήρεις οδηγίες.',
    },
    handout: {
      versionLabel: 'Έκδοση',
      subtitle: 'Καιρικά εφέ και εφέ ατμόσφαιρας για χάρτες του Roll20',
      footer: 'Χρησιμοποιήστε το φυλλάδιο «{deck}» για χειρισμό με ένα κλικ.',
      overview: {
        heading: 'Επισκόπηση',
        body: 'Το PageFX γεμίζει μια περιοχή του χάρτη με εφέ που συνεχίζονται αδιάκοπα: βροχή, χιόνι, θράκα, ατμό, πυγολαμπίδες και άλλα. Ένα πιόνι δείχνει τη θέση κάθε εφέ, και η «Aura 1» του είναι η περιοχή. Τα εφέ τρέχουν σε κάθε σελίδα όπου υπάρχουν παίκτες, ακόμη και σε σελίδες όπου έχει σταλεί μέρος μιας χωρισμένης ομάδας, και σταματούν όταν οι παίκτες φύγουν. Όλα ρυθμίζονται από μενού στη συνομιλία, και τα εναύσματα μπορούν να ξεκινούν ή να σταματούν εφέ καθώς περνούν οι γύροι της μάχης ή καθώς κινούνται τα πιόνια.',
        demo: 'Δείτε ένα σύντομο demo (από την έκδοση 1)',
      },
      quickStart: {
        heading: 'Γρήγορη εκκίνηση',
        steps: [
          'Βάλτε ένα πιόνι εκεί όπου πρέπει να είναι το εφέ (στο επίπεδο GM μένει κρυφό από τους παίκτες) και επιλέξτε το.',
          'Πληκτρολογήστε !pagefx presets, ή ανοίξτε το Command Deck και πατήστε Προρρυθμίσεις, και μετά πατήστε μια προρρύθμιση όπως Δυνατή βροχή.',
          'Αλλάξτε το μέγεθος της «Aura 1» του πιονιού για να ορίσετε την περιοχή που γεμίζει το εφέ. Η αύρα είναι κρυφή από τους παίκτες.',
          'Μεταφέρετε τους παίκτες στη σελίδα. Το εφέ ξεκινά, και σταματά ξανά όταν φύγουν.',
          'Πληκτρολογήστε !pagefx για να ανοίξει το μενού, και πατήστε Επεξεργασία σε ένα εφέ για να το αλλάξετε.',
        ],
      },
      effects: {
        heading: 'Εφέ',
        points: [
          'Ένα εφέ είναι ένα πιόνι μαζί με ρυθμίσεις που κρατά το PageFX. Μετακινήστε το πιόνι για να μετακινήσετε το εφέ, και αλλάξτε την «Aura 1» του για να αλλάξετε την περιοχή. Αν διαγράψετε το πιόνι, διαγράφεται και το εφέ.',
          'Κάθε εφέ έχει ένα ή περισσότερα επίπεδα. Κάθε επίπεδο εμφανίζει ένα πράγμα, ξανά και ξανά, με τυχαία αναμονή ανάμεσα στον ελάχιστο και τον μέγιστο χρόνο του.',
          'Ένα επίπεδο μπορεί να εμφανίζει ένα ενσωματωμένο εφέ του Roll20 (τύπος και χρώμα, όπως burn-fire), ένα προσαρμοσμένο FX αποθηκευμένο στο παιχνίδι, ή έναν ορισμό προσαρμοσμένου FX επικολλημένο ως JSON. Οι τιμές που λείπουν από έναν ορισμό συμπληρώνονται, οπότε και ένας σύντομος ορισμός σχεδιάζεται.',
          'Τα εφέ τύπου ακτίνας (beam, breath, splatter, και προσαρμοσμένα FX με γωνία -1) σχεδιάζονται ανάμεσα σε δύο σημεία. Η κατεύθυνσή τους είναι τυχαία, ή ένας σταθερός αριθμός κελιών οριζόντια και προς τα κάτω.',
          'Η ένταση πολλαπλασιάζει πόσο συχνά εμφανίζεται ένα εφέ. Η ρύθμιση intensity πολλαπλασιάζει κάθε εφέ.',
          'Η απενεργοποίηση σταματά ένα εφέ μέχρι να ενεργοποιηθεί ξανά. Η παύση το κρατά μέχρι να συνεχιστεί. Η Παύση όλων κρατά κάθε εφέ χωρίς να τα αλλάζει.',
          'Το Jumpgate σχεδιάζει τους ορισμούς προσαρμοσμένων FX σε λευκό, εκτός αν είναι αποθηκευμένοι ως προσαρμοσμένα FX, γι’ αυτό το PageFX αποθηκεύει τους δικούς του ως προσαρμοσμένα FX με όνομα «PageFX: …». Αφαιρούνται όταν δεν τα χρησιμοποιεί κανένα εφέ. Αφήστε τα στη θέση τους.',
        ],
      },
      pages: {
        heading: 'Σε ποιες σελίδες τρέχουν',
        points: [
          'Τα εφέ τρέχουν στη σελίδα με την κορδέλα των παικτών και σε κάθε σελίδα όπου έχει μεταφερθεί μεμονωμένα κάποιος παίκτης.',
          'Ενεργοποιήστε την Προεπισκόπηση σελίδας GM ώστε τα εφέ να τρέχουν και στη σελίδα που κοιτάζει κάθε GM, για να τα δοκιμάσετε χωρίς παίκτες.',
          'Κάθε σελίδα παίρνει το πολύ Μέγ. εμφανίσεις ανά δευτερόλεπτο (30 από προεπιλογή). Αν τα εφέ ζητούν περισσότερες, κάποιες εμφανίσεις παραλείπονται και ο GM ενημερώνεται μία φορά.',
          'Όταν ένα άλλο Mod μετακινεί την κορδέλα ή χωρίζει την ομάδα, το Roll20 δεν ειδοποιεί κανέναν, γι’ αυτό το PageFX ελέγχει κάθε λίγα δευτερόλεπτα και ενημερώνεται.',
        ],
      },
      presets: {
        heading: 'Προρρυθμίσεις',
        intro:
          'Μια προρρύθμιση δίνει σε ένα εφέ ένα σύνολο έτοιμων επιπέδων. Αν αλλάξετε ένα επίπεδο αργότερα, το εφέ γίνεται δικό σας. Άλλα Mods μπορούν να προσθέσουν προρρυθμίσεις με το PageFX.registerPreset.',
        colPack: 'Πακέτο',
        colPresets: 'Προρρυθμίσεις (όνομα και ID)',
      },
      triggers: {
        heading: 'Εναύσματα',
        intro:
          'Ένα έναυσμα ξεκινά, σταματά, εναλλάσσει ή εκτελεί ένα εφέ όταν συμβαίνει κάτι. Προσθέστε τα από την κάρτα του εφέ ή με !pagefx trigger add.',
        points: [
          'Κάθε γύρο: το Roll20 δεν κρατά αριθμό γύρου, οπότε ένας γύρος ξεκινά όταν η σειρά πρωτοβουλίας προχωρά από την τελευταία της καταχώριση πίσω στην κορυφή. Αν υπάρχει προσαρμοσμένη καταχώριση με όνομα «Round», χρησιμοποιείται αυτή. Επιλέξτε κάθε πόσους γύρους, ή έναν συγκεκριμένο γύρο. Ο πρώτος γύρος μιας μάχης δεν μετρά ως αλλαγή.',
          'Σε μια σειρά: όταν ένα επιλεγμένο πιόνι φτάνει στην κορυφή της σειράς πρωτοβουλίας. Επιλέξτε το πιόνι στον χάρτη πριν πατήσετε το κουμπί.',
          'Είσοδος ή έξοδος πιονιού: όταν ένα πιόνι μπαίνει ή βγαίνει από την περιοχή του εφέ, ή από την «Aura 1» ενός άλλου πιονιού που επιλέγετε. Από προεπιλογή μετράνε μόνο πιόνια που ελέγχει κάποιος παίκτης· επιλέξτε οποιοδήποτε πιόνι, ή δώστε ονόματα.',
          'Η Εκτέλεση ριπής εμφανίζει το εφέ πολλές φορές μαζί. Το Μόνο την πρώτη φορά κάνει ένα έναυσμα να ενεργοποιηθεί μόνο μία φορά.',
          'Το Roll20 δεν λέει τίποτα στα Mods όταν ένα άλλο Mod μετακινεί ένα πιόνι. Τα Mods που μετακινούν πιόνια μπορούν να καλέσουν μετά το PageFX.checkToken(token).',
        ],
      },
      nullAreas: {
        heading: 'Περιοχές χωρίς εφέ',
        points: [
          'Μια περιοχή χωρίς εφέ είναι ένα πιόνι όπου δεν εμφανίζεται ποτέ κανένα εφέ, όπως το εσωτερικό ενός σπιτιού σε καταιγίδα. Η περιοχή του είναι το πιόνι και η «Aura 1» του.',
          'Επιλέξτε το πιόνι και πατήστε Περιοχή χωρίς εφέ στο μενού ή στο Command Deck. Τα πιόνια με όνομα NullFX, όπως στην έκδοση 1, είναι επίσης περιοχές χωρίς εφέ.',
        ],
      },
      commands: {
        heading: 'Εντολές',
        intro:
          'Μόνο οι GM μπορούν να χρησιμοποιούν αυτές τις εντολές. Δρουν στα επιλεγμένα πιόνια, ή στα πιόνια που δίνονται με --ids. Οι εντολές επιπέδων δρουν στο επίπεδο 1, εκτός αν το --layer ορίζει άλλο. Μπορούν να τις στέλνουν και άλλα Mods· οι απαντήσεις πηγαίνουν στον GM.',
        colCommand: 'Εντολή',
        colDesc: 'Τι κάνει',
      },
      settings: {
        heading: 'Ρυθμίσεις',
        intro:
          'Αλλάξτε τις ρυθμίσεις από την κάρτα Ρυθμίσεις ή με !pagefx set. Η γλώσσα μπορεί επίσης να οριστεί στη σελίδα ρυθμίσεων του Mod.',
        colKey: 'Ρύθμιση',
        colDesc: 'Τι κάνει',
        rows: {
          language: 'Η γλώσσα των μενού, των μηνυμάτων και των φυλλαδίων του PageFX.',
          gmPagePreview:
            'Τρέχει τα εφέ και στη σελίδα που κοιτάζει κάθε GM (ανενεργό από προεπιλογή).',
          intensity: 'Πολλαπλασιάζει πόσο συχνά εμφανίζεται κάθε εφέ (1 από προεπιλογή).',
          maxSpawnsPerSecond:
            'Οι περισσότερες εμφανίσεις σε μία σελίδα ανά δευτερόλεπτο, 1 έως 60 (30 από προεπιλογή).',
        },
      },
      api: {
        heading: 'Για άλλα Mods',
        intro:
          'Το PageFX δημοσιεύει ένα αντικείμενο PageFX. Όπου μια συνάρτηση δέχεται πιόνι, λειτουργεί και το ID του πιονιού.',
        colFunction: 'Συνάρτηση',
        colDesc: 'Τι κάνει',
        rows: {
          activateAll: 'Συνεχίζει κάθε εφέ (έκδοση 1).',
          deactivateAll: 'Βάζει σε παύση κάθε εφέ (έκδοση 1).',
          activate: 'Ενεργοποιεί, απενεργοποιεί ή εναλλάσσει ένα εφέ (έκδοση 1).',
          start: 'Ενεργοποιεί ή απενεργοποιεί ένα εφέ, ή το βάζει σε παύση και το συνεχίζει.',
          setIntensity: 'Αλλάζει την ένταση ενός εφέ.',
          fire: 'Εμφανίζει ένα εφέ τώρα.',
          create:
            'Κάνει ένα πιόνι εφέ, με επιλογές name, fx, interval, direction και intensity· ή αφαιρεί το εφέ.',
          getEffect:
            'Διαβάζει ένα εφέ, παραθέτει τα εφέ (σε μία σελίδα), ή ελέγχει αν ένα εφέ τρέχει.',
          registerPreset: 'Προσθέτει μια προρρύθμιση για αυτή τη συνεδρία, ή τις παραθέτει.',
          checkToken:
            'Ελέγχει ένα πιόνι που μετακίνησε το Mod σας έναντι των εναυσμάτων εισόδου και εξόδου.',
        },
      },
      upgrading: {
        heading: 'Αναβάθμιση από την έκδοση 1',
        points: [
          'Τα πιόνια με όνομα PageFX και NullFX αναλαμβάνονται στην πρώτη εκκίνηση και συνεχίζουν να λειτουργούν όπως πριν.',
          'Μέχρι να αλλάξετε ένα εφέ από τη συνομιλία, το καθοδηγούν ακόμη οι «GM Notes» του πιονιού του, η «Bar 1» (χρόνος μεταξύ εμφανίσεων) και η «Bar 2» (κατεύθυνση ακτίνας), και ο δείκτης interdiction εξακολουθεί να το απενεργοποιεί. Μόλις το αλλάξετε από τη συνομιλία, οι «GM Notes» και οι μπάρες είναι ξανά δικές σας.',
          'Η έκδοση 1 σχεδίαζε εφέ μόνο στη σελίδα με την κορδέλα των παικτών, και εμφάνιζε τα αποθηκευμένα προσαρμοσμένα FX δύο φορές. Και τα δύο έχουν διορθωθεί.',
          'Οι εντολές της έκδοσης 1 λειτουργούν ακόμη:',
        ],
        colV1: 'Εντολή έκδοσης 1',
        colV2: 'Ίδιο με',
      },
      troubleshooting: {
        heading: 'Αντιμετώπιση προβλημάτων',
        points: [
          'Ένα εφέ δεν τρέχει: ανοίξτε την κάρτα του. Η γραμμή Κατάσταση λέει γιατί: ανενεργό, σε παύση, δεν έχει επιλεγεί εφέ, δεν μπορεί να τρέξει (με την αιτία), ή όχι σε ενεργή σελίδα (δεν υπάρχουν παίκτες εκεί· ενεργοποιήστε την Προεπισκόπηση σελίδας GM για να το δοκιμάσετε).',
          'Δεν βλέπετε τίποτα: πολύ μικρά ή βραχύβια σωματίδια δύσκολα φαίνονται σε φορτωμένο χάρτη. Δοκιμάστε μια προρρύθμιση, αυξήστε την ένταση, ή μικρύνετε την περιοχή.',
          'Τα εφέ φαίνονται αραιά: η σελίδα μπορεί να έχει φτάσει τις Μέγ. εμφανίσεις ανά δευτερόλεπτο. Μειώστε κάποιες εντάσεις, ή αυξήστε το όριο.',
          'Τα εφέ σταμάτησαν μετά από αντιγραφή σελίδας ή παιχνιδιού: εκτελέστε Νέα σάρωση.',
          'Για οτιδήποτε άλλο, ελέγξτε το αρχείο καταγραφής της κονσόλας API και συμπεριλάβετε τα μηνύματά του όταν ζητάτε βοήθεια.',
        ],
      },
      languages: {
        heading: 'Γλώσσες',
        body: 'Επιλέξτε γλώσσα από την κάρτα Ρυθμίσεις ή με !pagefx set language. Διαθέσιμες γλώσσες:',
        colLanguage: 'Γλώσσα',
        colNative: 'Εγχώρια ονομασία',
        colCode: 'Κωδικός',
      },
      credits: {
        heading: 'Ευχαριστίες',
        original: 'Αρχικό mod από',
        maintainer: 'Την έκδοση 2 συντηρεί',
        marketplace: 'Τα πακέτα γραφικών της Ada στο Roll20 Marketplace',
        support:
          'Αν βρείτε σφάλμα ή έχετε μια ιδέα, γράψτε στο φόρουμ Roll20 Mod ή ανοίξτε ένα issue στο GitHub, και συμπεριλάβετε τυχόν μηνύματα από το αρχείο καταγραφής της κονσόλας API.',
      },
    },
    triggers: {
      line: '{when}: {action}',
      eachRound: 'Κάθε νέο γύρο',
      everyRounds: 'Κάθε {n} γύρους',
      onRound: 'Στον γύρο {n}',
      turn: 'Όταν ξεκινά η σειρά για {name}',
      enter: 'Όταν {who} μπαίνει σε {area}',
      leave: 'Όταν {who} βγαίνει από {area}',
      areaSelf: 'περιοχή αυτού του εφέ',
      areaSelected: 'αύρα του επιλεγμένου πιονιού',
      areaOf: 'αύρα του {name}',
      unnamed: 'ένα πιόνι',
      once: '(μόνο την πρώτη φορά)',
      onceUsed: '(μόνο την πρώτη φορά, έχει ήδη χρησιμοποιηθεί)',
      who: {
        players: 'ένα πιόνι παίκτη',
        all: 'οποιοδήποτε πιόνι',
      },
      action: {
        start: 'έναρξη',
        stop: 'διακοπή',
        toggle: 'ενεργοποίηση ή απενεργοποίηση',
        fire: 'μία εκτέλεση',
        burst: 'ριπή {count}',
      },
      choice: {
        start: 'Έναρξη',
        stop: 'Διακοπή',
        toggle: 'Ενεργοποίηση ή απενεργοποίηση',
        fire: 'Μία εκτέλεση',
        burst: 'Εκτέλεση ριπής',
      },
    },
    packs: {
      weather: 'Καιρός',
      fire: 'Φωτιά και ζέστη',
      water: 'Νερό',
      magic: 'Μαγεία και απόκοσμα',
      custom: 'Από άλλα Mods',
    },
    presets: {
      'light-rain': 'Ψιχάλα',
      'heavy-rain': 'Δυνατή βροχή',
      thunderstorm: 'Καταιγίδα',
      snow: 'Χιόνι',
      blizzard: 'Χιονοθύελλα',
      hail: 'Χαλάζι',
      sandstorm: 'Αμμοθύελλα',
      fog: 'Τολύπες ομίχλης',
      embers: 'Θράκα',
      ash: 'Στάχτη που πέφτει',
      magma: 'Μάγμα που κοχλάζει',
      'lava-spurts': 'Πίδακες λάβας',
      sparks: 'Σπίθες',
      drips: 'Σταγόνες σπηλιάς',
      steam: 'Ατμίδες',
      geyser: 'Θερμοπίδακας',
      spray: 'Σταγονίδια καταρράκτη',
      bubbles: 'Φυσαλίδες',
      fireflies: 'Πυγολαμπίδες',
      'arcane-motes': 'Απόκρυφα σωματίδια',
      'necrotic-mist': 'Νεκρωτική ομίχλη',
      'holy-glimmer': 'Ιερή λάμψη',
      'swamp-gas': 'Αέριο βάλτου',
    },
    fx: {
      empty: 'δεν έχει οριστεί εφέ.',
      badJson: 'ο ορισμός του προσαρμοσμένου FX δεν είναι έγκυρο JSON.',
      unknownColour: 'δεν υπάρχει ενσωματωμένο χρώμα «{colour}». Χρώματα: {colours}.',
      savedMissing: 'δεν υπάρχει αποθηκευμένο προσαρμοσμένο FX με όνομα «{name}».',
      cannotCreate: 'το Roll20 δεν δημιούργησε αντικείμενο προσαρμοσμένου FX γι’ αυτό.',
      spawnFailed: 'το Roll20 δεν το εμφάνισε ({message}).',
    },
    errors: {
      unknownCommand: 'Άγνωστη εντολή: {command}',
      noEffects: 'Επιλέξτε ένα ή περισσότερα πιόνια PageFX, ή δώστε τα ID τους με --ids.',
      selectToken: 'Επιλέξτε πρώτα ένα ή περισσότερα πιόνια, ή δώστε τα ID τους με --ids.',
      unknownIds: 'Αυτά δεν είναι εφέ PageFX: {ids}',
      badSetting: 'Άγνωστη ρύθμιση ή τιμή: {setting} {value}',
      noLayer: 'Το «{name}» δεν έχει επίπεδο {n}.',
      tooManyLayers: 'Ένα εφέ μπορεί να έχει το πολύ {max} επίπεδα.',
      layerUsage: 'Χρησιμοποιήστε !pagefx layer add [effect] ή !pagefx layer remove <number>.',
      nullUsage: 'Χρησιμοποιήστε !pagefx null create ή !pagefx null remove.',
      isEffect: 'Το «{name}» είναι εφέ, οπότε δεν μπορεί να είναι και περιοχή χωρίς εφέ.',
      badInterval:
        'Δώστε τον χρόνο μεταξύ εμφανίσεων σε ms, για παράδειγμα: !pagefx interval 500 1500',
      badDirection:
        'Δώστε random, ή κελιά οριζόντια και προς τα κάτω, για παράδειγμα: !pagefx direction 2 -1',
      badArea:
        'Δώστε ακτίνα σε μονάδες σελίδας, και circle ή square, για παράδειγμα: !pagefx area 15 circle',
      badIntensity: 'Δώστε ένταση μεγαλύτερη από 0, για παράδειγμα: !pagefx intensity 1.5',
      noName: 'Δώστε ένα όνομα, για παράδειγμα: !pagefx name Βροχή πάνω από το λιμάνι',
      triggerUsage:
        'Χρησιμοποιήστε !pagefx trigger add <round|turn|enter|leave> <start|stop|toggle|fire|burst> [every=2] [round=3] [count=5] [who=players|all|named] [names=A;B] [area=self|selected] [once], ή !pagefx trigger remove <number>.',
      triggerToken:
        'Επιλέξτε πρώτα στον χάρτη το πιόνι που αφορά αυτό το έναυσμα, ή δώστε token=<id>.',
      triggerNames:
        'Δώστε τα ονόματα των πιονιών με names=, χωρισμένα με ; (για παράδειγμα names=Goblin;Orc).',
      tooManyTriggers: 'Ένα εφέ μπορεί να έχει το πολύ {max} εναύσματα.',
      noTrigger: 'Το «{name}» δεν έχει έναυσμα {n}.',
      journalUsage: 'Χρησιμοποιήστε !pagefx journal rebuild.',
      unknownPreset:
        'Δεν υπάρχει προρρύθμιση «{id}». Πληκτρολογήστε !pagefx presets για να τις δείτε.',
      unexpected: 'Κάτι πήγε στραβά: {message}',
    },
  };

  var localeHe = {
    titles: {
      ready: 'PageFX מוכן.',
      menu: 'PageFX',
      status: 'מצב PageFX',
      settings: 'הגדרות PageFX',
      presets: 'תבניות PageFX',
      help: 'פקודות PageFX',
      effect: 'אפקט: {name}',
    },
    messages: {
      readyHint: 'הקלידו !pagefx כדי לפתוח את התפריט.',
      adopted:
        'PageFX קיבל לניהולו {effects} אפקט(ים) ו-{nulls} אזור(ים) ללא אפקטים מאסימוני PageFX 1.x. הם ממשיכים לפעול כמו קודם.',
      rescanned:
        'הסריקה החוזרת מצאה {effects} אפקט(ים) חדש(ים) ו-{nulls} אזור(ים) חדש(ים) ללא אפקטים, ושכחה {dropped} שהאסימונים שלהם נמחקו.',
      allPaused: 'כל האפקטים מושהים. השתמשו ב-!pagefx resume כדי להפעיל אותם שוב.',
      allResumed: 'האפקטים פועלים שוב.',
      turnedOn: 'הופעלו: {count}.',
      turnedOff: 'כובו: {count}.',
      toggled: 'הופעלו או כובו: {count}.',
      paused: 'הושהו: {count}.',
      resumed: 'חודשו: {count}.',
      fired: 'הופקו {count} אפקט(ים).',
      created: 'אפקטים חדשים: {count}. בחרו בכרטיס של כל אחד מה הוא מפיק.',
      deleted: 'אפקטים שהוסרו: {count}. האסימונים שלהם עדיין על המפה.',
      renamed: 'שמות ששונו: {count}.',
      fxSet: 'האפקט שונה: {count}.',
      intervalSet: 'התזמון שונה: {count}.',
      directionSet: 'הכיוון שונה: {count}.',
      areaSet: 'האזור שונה: {count}.',
      intensitySet: 'העוצמה שונתה: {count}.',
      layerAdded: 'נוספה שכבה: {count}.',
      layerRemoved: 'הוסרה שכבה: {count}.',
      nullCreated: 'אזורים חדשים ללא אפקטים: {count}.',
      nullRemoved: 'אזורים ללא אפקטים שהוסרו: {count}.',
      presetApplied: 'התבנית {name} הוחלה: {count}.',
      journalRebuilt: 'דפי המידע "{help}" ו-"{deck}" נבנו מחדש.',
      triggerAdded: 'נוסף טריגר: {count}.',
      triggerRemoved: 'הוסר טריגר: {count}.',
      triggersCleared: 'הטריגרים הוסרו מ-{count} אפקט(ים).',
      throttled:
        'האפקטים בעמוד "{page}" מדוללים: הם ביקשו יותר מ-{max} הופעות בשנייה. הנמיכו את העוצמה שלהם, או העלו את המגבלה עם !pagefx set maxSpawnsPerSecond.',
      settingChanged: '{setting} מוגדר כעת ל-{value}.',
      problem: 'האפקט "{name}" לא יכול לפעול: {reason}',
    },
    menu: {
      page: 'עמוד',
      live: 'האפקטים פועלים כאן',
      notLive: 'אין כאן שחקנים',
      allPausedNote: 'כל האפקטים מושהים.',
      effectsHere: 'אפקטים בעמוד זה',
      noEffectsHere: 'אין עדיין אפקטים בעמוד זה.',
      otherPages: 'עמודים אחרים',
      effectCount: '{count} אפקט(ים)',
      actions: 'חדש',
      selectHint:
        'בחרו תחילה אסימון במפה, ואז לחצו על אפקט חדש או על אזור ללא אפקטים. האסימון מסמן היכן האפקט מופיע; ה-Aura 1 שלו היא האזור.',
      state: 'מצב',
      area: 'אזור',
      areaValue: '{radius} {units} מעבר לאסימון, {shape}',
      circle: 'עיגול',
      square: 'ריבוע',
      circleOption: 'עיגול',
      squareOption: 'ריבוע',
      layers: 'שכבות',
      layer: 'שכבה {n}',
      noLayers: 'אין שכבות. הוסיפו שכבה כדי לבחור מה האפקט הזה מפיק.',
      noFxSet: 'לא הוגדר',
      timing: 'כל {min}–{max} אלפיות שנייה',
      directionRandom: 'כיוון אקראי',
      directionOffset: 'מסתיים במרחק {dx}, {dy} משבצות',
      v1Note:
        'האפקט הזה עדיין פועל לפי הערות המנחה ("GM Notes") והפסים של האסימון שלו, כמו ב-PageFX 1.x. שינוי שלו כאן מפסיק את זה.',
      preset: 'תבנית',
      presetsHint:
        'בחרו אסימון אחד או יותר במפה, ואז לחצו על תבנית. אסימונים שעדיין אינם אפקטים הופכים לאפקטים, וה-Aura 1 שלהם היא האזור שהתבנית ממלאת.',
      triggers: 'טריגרים',
      noTriggers: 'אין טריגרים: האפקט פועל בכל פעם שיש שחקנים בעמוד שלו.',
      triggerHint: 'לטריגר של תור, או לאזור של אסימון אחר, בחרו תחילה את האסימון הזה במפה.',
      yes: 'כן',
      no: 'לא',
    },
    buttons: {
      edit: 'עריכה',
      show: 'הצגה',
      turnOn: 'הפעלה',
      turnOff: 'כיבוי',
      pause: 'השהיה',
      resume: 'המשך',
      fire: 'שיגור',
      pauseAll: 'השהיית הכול',
      resumeAll: 'המשך הכול',
      create: 'אפקט חדש',
      createNull: 'אזור ללא אפקטים',
      removeNull: 'הסרת אזור ללא אפקטים',
      settings: 'הגדרות',
      status: 'מצב',
      rescan: 'סריקה חוזרת',
      rename: 'שינוי שם',
      area: 'אזור',
      intensity: 'עוצמה',
      builtin: 'FX מובנה',
      saved: 'FX שמור',
      json: 'JSON מותאם',
      timing: 'תזמון',
      random: 'כיוון אקראי',
      offset: 'קביעת כיוון',
      addLayer: 'הוספת שכבה',
      removeLayer: 'הסרת שכבה',
      delete: 'מחיקת אפקט',
      preset: 'תבנית',
      presets: 'תבניות',
      remove: 'הסרה',
      help: 'עזרה',
      rebuild: 'בנייה מחדש של דפי המידע',
      onRound: 'בכל סיבוב',
      onTurn: 'בתור מסוים',
      onEnter: 'אסימון נכנס',
      onLeave: 'אסימון יוצא',
      menu: 'תפריט',
      change: 'שינוי',
    },
    prompts: {
      type: 'סוג האפקט',
      colour: 'צבע',
      saved: 'FX מותאם שמור',
      json: 'הגדרת FX מותאמת (JSON)',
      intervalMin: 'הזמן הקצר ביותר בין הופעות, באלפיות שנייה',
      intervalMax: 'הזמן הארוך ביותר בין הופעות, באלפיות שנייה',
      dx: 'משבצות לרוחב עד הסוף (שלילי הוא שמאלה)',
      dy: 'משבצות למטה עד הסוף (שלילי הוא למעלה)',
      name: 'שם האפקט',
      radius: 'רדיוס האזור מעבר לאסימון, ביחידות עמוד',
      shape: 'צורת האזור',
      intensity: 'עוצמה ({min} עד {max})',
      maxSpawns: 'הופעות בשנייה בעמוד אחד (1 עד {max})',
      preset: 'תבנית',
      then: 'ואז',
      every: 'כל כמה סיבובים',
      who: 'אילו אסימונים נחשבים',
      area: 'איזה אזור',
      once: 'רק בפעם הראשונה?',
      confirmDelete: 'למחוק את האפקט הזה? האסימון יישאר על המפה.',
    },
    settings: {
      language: 'שפה',
      globalIntensity: 'עוצמה לכל האפקטים',
      gmPreviewHint:
        'כשהאפשרות פעילה, האפקטים פועלים גם בעמוד שכל מנחה מסתכל בו, גם כשאין שם שחקנים.',
      maxSpawnsHint: 'בעמוד שמבקש יותר, האפקטים מדוללים. Roll20 נשאר חלק עד בערך 60.',
    },
    status: {
      livePages: 'עמודים פעילים',
      effects: 'אפקטים',
      running: 'פועל',
      globalPause: 'הכול מושהה',
      on: 'מופעל',
      off: 'כבוי',
      pausedState: 'מושהה',
      waiting: 'לא בעמוד פעיל',
      noFx: 'לא נבחר אפקט',
      broken: 'לא יכול לפעול',
      nullAreas: 'אזורים ללא אפקטים',
      noEffects:
        'אין עדיין אפקטים. בחרו אסימון והקלידו !pagefx create, או פתחו את התפריט עם !pagefx.',
      gmPreview: 'תצוגה מקדימה בעמוד המנחה',
      intensity: 'עוצמה',
      maxSpawns: 'מקסימום הופעות בשנייה, לכל עמוד',
    },
    help: {
      menu: 'פתיחת התפריט: האפקטים בעמוד שלכם, וכפתורים לכל השאר.',
      create: 'הפיכת האסימונים הנבחרים לאפקטים. ה-Aura 1 שלהם היא האזור; אם אין להם, היא נוספת.',
      edit: 'הצגת הכרטיס של כל אפקט נבחר, עם כפתורים לשינוי שלו.',
      preset: 'החלת תבנית על האסימונים הנבחרים, תוך הפיכתם לאפקטים קודם אם צריך.',
      presets: 'רשימת התבניות, לפי חבילה.',
      switches:
        'הפעלה או כיבוי של האפקטים הנבחרים, או השהיה וחידוש שלהם. כשדבר אינו נבחר, on ו-resume מפעילים הכול מחדש, ו-off ו-pause עוצרים הכול (כמו ש-!pageFX on ו-off עשו בגרסה 1).',
      fire: 'הפקת האפקטים הנבחרים עכשיו, פעם אחת או כמה פעמים, כדי לנסות אותם.',
      fx: 'קביעת מה ששכבה מפיקה: אפקט מובנה כמו burn-fire, שם של FX מותאם שמור, או הגדרת FX מותאמת ב-JSON.',
      interval: 'קביעת הזמן בין הופעות של שכבה, באלפיות שנייה. כל המתנה נבחרת בין שני הערכים.',
      direction:
        'לאפקטים דמויי קרן, קביעת המקום שבו כל הופעה מסתיימת: אקראי (random), או מספר משבצות לרוחב ולמטה מנקודת ההתחלה.',
      area: 'קביעת האזור: הרדיוס של ה-Aura 1 של האסימון ביחידות עמוד, והצורה שלה.',
      intensity:
        'הכפלת התדירות שבה האפקטים הנבחרים מופיעים (0.1 עד 5). עם global, השינוי חל על כל האפקטים.',
      name: 'שינוי השם של האפקטים הנבחרים.',
      layer: 'הוספת שכבה, כך שאפקט אחד יפיק כמה דברים, או הסרת שכבה.',
      triggerAdd:
        'הוספת טריגר: בסיבוב (round), בתור (turn), בכניסה (enter) או ביציאה (leave), לבצע start, stop, toggle, fire או burst. אפשרויות: every=2, round=3, count=5, who=players|all|named, names=A;B, area=selected, once.',
      triggerRemove: 'הסרת טריגר אחד, או את כולם, מהאפקטים הנבחרים.',
      null: 'הפיכת האסימונים הנבחרים לאזורים ללא אפקטים, שבהם אף אפקט לא מופיע לעולם, או ביטול זה.',
      delete: 'הסרת האפקט מהאסימונים הנבחרים. האסימונים נשארים על המפה.',
      status: 'רשימת כל האפקטים, העמוד של כל אחד, והאם הוא פועל.',
      settings: 'הצגת ההגדרות.',
      set: 'שינוי הגדרה: language, gmPagePreview, intensity או maxSpawnsPerSecond.',
      rescan:
        'קבלת אסימונים חדשים בשם PageFX או NullFX לניהול, ושכחת אפקטים שהאסימונים שלהם נמחקו.',
      journal: 'בנייה מחדש של דפי המידע של העזרה ושל ה-Command Deck.',
      help: 'הצגת הרשימה הזו.',
      handout: 'ההוראות המלאות נמצאות בדף המידע "{help}"; כפתורים בלחיצה אחת נמצאים ב-"{deck}".',
    },
    deck: {
      menuTitle: 'תפריט',
      menuDesc: 'התפריט הראשי מציג את האפקטים בעמוד שלכם. מצב מציג את כולם.',
      newTitle: 'חדש',
      newDesc: 'בחרו תחילה אסימון אחד או יותר במפה. ה-Aura 1 שלהם הופכת לאזור שהאפקט ממלא.',
      selectedTitle: 'אפקטים נבחרים',
      selectedDesc: 'בחרו אסימוני אפקט במפה, ואז לחצו על כפתור.',
      allTitle: 'הכול',
      allDesc: 'השהיית כל האפקטים, או הפעלת כולם מחדש.',
      toolsTitle: 'כלים',
      toolsDesc: 'איתור אסימונים שהועתקו או נמחקו, ובנייה מחדש של דפי המידע האלה.',
      footer: 'ההוראות המלאות נמצאות בדף המידע "{help}".',
    },
    handout: {
      versionLabel: 'גרסה',
      subtitle: 'אפקטים של מזג אוויר ואווירה למפות Roll20',
      footer: 'לפקדים בלחיצה אחת, השתמשו בדף המידע "{deck}".',
      overview: {
        heading: 'סקירה כללית',
        body: 'PageFX ממלא אזור במפה באפקטים מתמשכים: גשם, שלג, גחלים, קיטור, גחליליות ועוד. אסימון מסמן את המקום של כל אפקט, וה-Aura 1 שלו היא האזור. האפקטים פועלים בכל עמוד שיש בו שחקנים, כולל עמודים שאליהם נשלח חלק מקבוצה מפוצלת, ונעצרים כשהשחקנים עוזבים. הכול נקבע מתפריטים בצ׳אט, וטריגרים יכולים להפעיל או לעצור אפקטים עם התקדמות סיבובי הקרב או כשאסימונים זזים.',
        demo: 'צפו בהדגמה קצרה (מגרסה 1)',
      },
      quickStart: {
        heading: 'התחלה מהירה',
        steps: [
          'הניחו אסימון במקום שבו האפקט צריך להיות (בשכבת המנחה הוא מוסתר מהשחקנים) ובחרו אותו.',
          'הקלידו !pagefx presets, או פתחו את ה-Command Deck ולחצו על תבניות, ואז לחצו על תבנית כמו גשם כבד.',
          'שנו את הגודל של ה-Aura 1 של האסימון כדי לקבוע את האזור שהאפקט ממלא. ההילה מוסתרת מהשחקנים.',
          'העבירו את השחקנים לעמוד. האפקט מתחיל, ונעצר שוב כשהם עוזבים.',
          'הקלידו !pagefx כדי לפתוח את התפריט, ולחצו על עריכה באפקט כדי לשנות אותו.',
        ],
      },
      effects: {
        heading: 'אפקטים',
        points: [
          'אפקט הוא אסימון ועוד הגדרות ש-PageFX שומר. הזיזו את האסימון כדי להזיז את האפקט, ושנו את ה-Aura 1 שלו כדי לשנות את האזור. מחיקת האסימון מוחקת את האפקט.',
          'לכל אפקט יש שכבה אחת או יותר. כל שכבה מפיקה דבר אחד, שוב ושוב, עם המתנה אקראית בין הזמן הקצר ביותר לזמן הארוך ביותר שלה.',
          'שכבה יכולה להפיק אפקט מובנה של Roll20 (סוג וצבע, כמו burn-fire), FX מותאם השמור במשחק, או הגדרת FX מותאמת שהודבקה כ-JSON. ערכים חסרים בהגדרה מושלמים אוטומטית, כך שגם הגדרה קצרה מצוירת.',
          'אפקטים דמויי קרן (beam, breath, splatter, ו-FX מותאם עם angle -1) מצוירים בין שתי נקודות. הכיוון שלהם אקראי, או מספר קבוע של משבצות לרוחב ולמטה.',
          'העוצמה מכפילה את התדירות שבה אפקט מופיע. הגדרת העוצמה הכללית (intensity) מכפילה את כל האפקטים.',
          'כיבוי עוצר אפקט עד שמפעילים אותו שוב. השהיה מקפיאה אותו עד שממשיכים אותו. השהיית הכול מקפיאה את כל האפקטים בלי לשנות אותם.',
          'Jumpgate מצייר הגדרות FX מותאמות בלבן אלא אם הן שמורות כ-FX מותאם, ולכן PageFX שומר את שלו כ-FX מותאם בשם “PageFX: …”. הם מוסרים כשאף אפקט לא משתמש בהם. השאירו אותם במקומם.',
        ],
      },
      pages: {
        heading: 'באילו עמודים האפקטים פועלים',
        points: [
          'האפקטים פועלים בעמוד שעליו נמצא סרגל השחקנים, ובכל עמוד שאליו הועבר שחקן בנפרד.',
          'הפעילו את "תצוגה מקדימה בעמוד המנחה" כדי שהאפקטים יפעלו גם בעמוד שכל מנחה מסתכל בו, כך שאפשר לנסות אותם בלי שחקנים.',
          'כל עמוד מקבל לכל היותר "מקסימום הופעות בשנייה" (30 כברירת מחדל). אם האפקטים מבקשים יותר, חלק מההופעות מדולגות, והמנחה מקבל על כך הודעה פעם אחת.',
          'כשמוד אחר מזיז את סרגל השחקנים או מפצל את הקבוצה, Roll20 לא מודיע על כך לאף אחד, ולכן PageFX בודק כל כמה שניות ומתעדכן.',
        ],
      },
      presets: {
        heading: 'תבניות',
        intro:
          'תבנית נותנת לאפקט סט של שכבות מוכנות. שינוי שכבה לאחר מכן הופך את האפקט לשלכם. מודים אחרים יכולים להוסיף תבניות עם PageFX.registerPreset.',
        colPack: 'חבילה',
        colPresets: 'תבניות (שם ומזהה)',
      },
      triggers: {
        heading: 'טריגרים',
        intro:
          'טריגר מפעיל, עוצר, מחליף מצב או משגר אפקט כשמשהו קורה. הוסיפו אותם מהכרטיס של האפקט, או עם !pagefx trigger add.',
        points: [
          'בכל סיבוב: Roll20 לא שומר מספר סיבוב, ולכן סיבוב מתחיל כשסדר התורות מתקדם מהרשומה האחרונה שלו חזרה לראש הרשימה. כשיש בסדר התורות רשומה מותאמת בשם “Round”, משתמשים בה במקום זאת. בחרו כל כמה סיבובים, או סיבוב אחד. הסיבוב הראשון של קרב לא נחשב כשינוי.',
          'בתור מסוים: כשאסימון שנבחר מגיע לראש סדר התורות. בחרו את האסימון במפה לפני הלחיצה על הכפתור.',
          'אסימון נכנס או יוצא: כשאסימון נכנס לאזור של האפקט או יוצא ממנו, או ל-Aura 1 של אסימון אחר שתבחרו. כברירת מחדל נחשבים רק אסימונים ששחקן שולט בהם; אפשר לבחור כל אסימון, או לתת שמות.',
          'שיגור מטח מפיק את האפקט כמה פעמים בבת אחת. "רק בפעם הראשונה" גורם לטריגר לפעול פעם אחת בלבד.',
          'Roll20 לא מודיע למודים דבר כשמוד אחר מזיז אסימון. מודים שמזיזים אסימונים יכולים לקרוא אחר כך ל-PageFX.checkToken(token).',
        ],
      },
      nullAreas: {
        heading: 'אזורים ללא אפקטים',
        points: [
          'אזור ללא אפקטים הוא אסימון שבו אף אפקט לא מופיע לעולם, כמו פנים של בית בזמן סערה. האזור שלו הוא האסימון וה-Aura 1 שלו.',
          'בחרו את האסימון ולחצו על אזור ללא אפקטים בתפריט או ב-Command Deck. גם אסימונים בשם NullFX, כמו בגרסה 1, הם אזורים ללא אפקטים.',
        ],
      },
      commands: {
        heading: 'פקודות',
        intro:
          'רק מנחים יכולים להשתמש בפקודות האלה. הן פועלות על האסימונים הנבחרים, או על האסימונים שניתנו עם --ids. פקודות שכבה פועלות על שכבה 1, אלא אם --layer קובע אחרת. גם מודים אחרים יכולים לשלוח אותן; התשובות נשלחות למנחה.',
        colCommand: 'פקודה',
        colDesc: 'מה היא עושה',
      },
      settings: {
        heading: 'הגדרות',
        intro:
          'שנו הגדרות מכרטיס ההגדרות, או עם !pagefx set. את השפה אפשר לקבוע גם בדף ההגדרות של המוד.',
        colKey: 'הגדרה',
        colDesc: 'מה היא עושה',
        rows: {
          language: 'השפה של התפריטים, ההודעות ודפי המידע של PageFX.',
          gmPagePreview: 'הפעלת האפקטים גם בעמוד שכל מנחה מסתכל בו (כבוי כברירת מחדל).',
          intensity: 'מכפילה את התדירות שבה כל אפקט מופיע (1 כברירת מחדל).',
          maxSpawnsPerSecond:
            'המספר המרבי של הופעות בעמוד אחד בכל שנייה, 1 עד 60 (30 כברירת מחדל).',
        },
      },
      api: {
        heading: 'למודים אחרים',
        intro:
          'PageFX מפרסם אובייקט PageFX. כשפונקציה מקבלת אסימון, אפשר לתת גם את המזהה של האסימון.',
        colFunction: 'פונקציה',
        colDesc: 'מה היא עושה',
        rows: {
          activateAll: 'חידוש כל האפקטים (גרסה 1).',
          deactivateAll: 'השהיית כל האפקטים (גרסה 1).',
          activate: 'הפעלה, כיבוי או היפוך מצב של אפקט אחד (גרסה 1).',
          start: 'הפעלה או כיבוי של אפקט אחד, או השהיה וחידוש שלו.',
          setIntensity: 'שינוי העוצמה של אפקט אחד.',
          fire: 'הפקת אפקט אחד עכשיו.',
          create:
            'הפיכת אסימון לאפקט, עם האפשרויות name, fx, interval, direction ו-intensity; או ביטול זה.',
          getEffect: 'קריאת אפקט, רשימת האפקטים (בעמוד אחד), או בדיקה אם אפקט פועל.',
          registerPreset: 'הוספת תבנית לסשן הזה, או רשימת התבניות.',
          checkToken: 'בדיקת אסימון שהמוד שלכם הזיז מול טריגרים של כניסה ויציאה.',
        },
      },
      upgrading: {
        heading: 'שדרוג מגרסה 1',
        points: [
          'אסימונים בשם PageFX ו-NullFX עוברים לניהול בהפעלה הראשונה וממשיכים לפעול כמו קודם.',
          'עד שתשנו אפקט מהצ׳אט, הערות המנחה ("GM Notes"), פס 1 ("Bar 1", הזמן בין הופעות) ופס 2 ("Bar 2", כיוון הקרן) של האסימון שלו עדיין שולטים בו, וסמן האיסור (interdiction) עדיין מכבה אותו. ברגע שתשנו אותו מהצ׳אט, הערות המנחה והפסים שוב שלכם.',
          'גרסה 1 ציירה אפקטים רק בעמוד של סרגל השחקנים, והפיקה FX מותאם שמור פעמיים. שתי הבעיות תוקנו.',
          'הפקודות של גרסה 1 עדיין עובדות:',
        ],
        colV1: 'פקודה בגרסה 1',
        colV2: 'זהה ל-',
      },
      troubleshooting: {
        heading: 'פתרון בעיות',
        points: [
          'אפקט לא פועל: פתחו את הכרטיס שלו. שורת המצב אומרת למה: כבוי, מושהה, לא נבחר אפקט, לא יכול לפעול (עם הסיבה), או לא בעמוד פעיל (אין שם שחקנים; הפעילו את "תצוגה מקדימה בעמוד המנחה" כדי לנסות אותו).',
          'לא רואים כלום: חלקיקים קטנים מאוד או קצרי חיים קשים לראייה במפה עמוסה. נסו תבנית, הגבירו את העוצמה, או הקטינו את האזור.',
          'האפקטים נראים דלילים: ייתכן שהעמוד הגיע ל"מקסימום הופעות בשנייה". הנמיכו חלק מהעוצמות, או העלו את המגבלה.',
          'האפקטים נעצרו אחרי העתקת עמוד או משחק: הריצו סריקה חוזרת.',
          'בכל מקרה אחר, בדקו את יומן קונסולת ה-API וצרפו את ההודעות שלו כשאתם מבקשים עזרה.',
        ],
      },
      languages: {
        heading: 'שפות',
        body: 'בחרו שפה מכרטיס ההגדרות, או עם !pagefx set language. שפות זמינות:',
        colLanguage: 'שפה',
        colNative: 'שם בשפת המקור',
        colCode: 'קוד',
      },
      credits: {
        heading: 'קרדיטים',
        original: 'המוד המקורי מאת',
        maintainer: 'גרסה 2 מתוחזקת על ידי',
        marketplace: 'חבילות האמנות של Ada ב-Roll20 Marketplace',
        support:
          'אם מצאתם באג או שיש לכם רעיון, פרסמו בפורום המודים של Roll20 או פתחו issue ב-GitHub, וצרפו את ההודעות מיומן קונסולת ה-API.',
      },
    },
    triggers: {
      line: '{when}: {action}',
      eachRound: 'בכל סיבוב חדש',
      everyRounds: 'כל {n} סיבובים',
      onRound: 'בסיבוב {n}',
      turn: 'כשהתור של {name} מתחיל',
      enter: 'כאשר {who} נכנס אל {area}',
      leave: 'כאשר {who} יוצא מתוך {area}',
      areaSelf: 'האזור של האפקט הזה',
      areaSelected: 'ההילה של האסימון הנבחר',
      areaOf: 'ההילה של {name}',
      unnamed: 'אסימון',
      once: '(רק בפעם הראשונה)',
      onceUsed: '(רק בפעם הראשונה, כבר נוצל)',
      who: {
        players: 'אסימון של שחקן',
        all: 'כל אסימון',
      },
      action: {
        start: 'להפעיל אותו',
        stop: 'לעצור אותו',
        toggle: 'להפעיל או לכבות אותו',
        fire: 'לשגר אותו פעם אחת',
        burst: 'לשגר מטח של {count}',
      },
      choice: {
        start: 'הפעלה',
        stop: 'עצירה',
        toggle: 'הפעלה או כיבוי',
        fire: 'שיגור פעם אחת',
        burst: 'שיגור מטח',
      },
    },
    packs: {
      weather: 'מזג אוויר',
      fire: 'אש וחום',
      water: 'מים',
      magic: 'קסם ומסתורין',
      custom: 'ממודים אחרים',
    },
    presets: {
      'light-rain': 'גשם קל',
      'heavy-rain': 'גשם כבד',
      thunderstorm: 'סופת רעמים',
      snow: 'שלג',
      blizzard: 'סופת שלגים',
      hail: 'ברד',
      sandstorm: 'סופת חול',
      fog: 'פיסות ערפל',
      embers: 'גחלים',
      ash: 'אפר נופל',
      magma: 'מאגמה מבעבעת',
      'lava-spurts': 'פרצי לבה',
      sparks: 'ניצוצות',
      drips: 'טפטופי מערה',
      steam: 'פתחי קיטור',
      geyser: 'גייזר',
      spray: 'רסס מפל',
      bubbles: 'בועות',
      fireflies: 'גחליליות',
      'arcane-motes': 'חלקיקים קסומים',
      'necrotic-mist': 'ערפל נקרוטי',
      'holy-glimmer': 'נצנוץ קדוש',
      'swamp-gas': 'גז ביצות',
    },
    fx: {
      empty: 'לא הוגדר אפקט.',
      badJson: 'הגדרת ה-FX המותאמת אינה JSON תקין.',
      unknownColour: 'אין צבע מובנה "{colour}". צבעים: {colours}.',
      savedMissing: 'אין FX מותאם שמור בשם "{name}".',
      cannotCreate: 'Roll20 סירב ליצור עבורו אובייקט FX מותאם.',
      spawnFailed: 'Roll20 סירב להפיק אותו ({message}).',
    },
    errors: {
      unknownCommand: 'פקודה לא ידועה: {command}',
      noEffects: 'בחרו אסימון PageFX אחד או יותר, או תנו את המזהים שלהם עם --ids.',
      selectToken: 'בחרו תחילה אסימון אחד או יותר, או תנו את המזהים שלהם עם --ids.',
      unknownIds: 'אלה אינם אפקטים של PageFX: {ids}',
      badSetting: 'הגדרה או ערך לא ידועים: {setting} {value}',
      noLayer: 'ל-"{name}" אין שכבה {n}.',
      tooManyLayers: 'לאפקט יכולות להיות לכל היותר {max} שכבות.',
      layerUsage: 'השתמשו ב-!pagefx layer add [effect] או ב-!pagefx layer remove <number>.',
      nullUsage: 'השתמשו ב-!pagefx null create או ב-!pagefx null remove.',
      isEffect: '"{name}" הוא אפקט, ולכן הוא לא יכול להיות גם אזור ללא אפקטים.',
      badInterval: 'תנו את הזמן בין הופעות באלפיות שנייה, לדוגמה: !pagefx interval 500 1500',
      badDirection: 'תנו random, או מספר משבצות לרוחב ולמטה, לדוגמה: !pagefx direction 2 -1',
      badArea: 'תנו רדיוס ביחידות עמוד, ו-circle או square, לדוגמה: !pagefx area 15 circle',
      badIntensity: 'תנו עוצמה גדולה מ-0, לדוגמה: !pagefx intensity 1.5',
      noName: 'תנו שם, לדוגמה: !pagefx name גשם מעל הרציפים',
      triggerUsage:
        'השתמשו ב-!pagefx trigger add <round|turn|enter|leave> <start|stop|toggle|fire|burst> [every=2] [round=3] [count=5] [who=players|all|named] [names=A;B] [area=self|selected] [once], או ב-!pagefx trigger remove <number>.',
      triggerToken: 'בחרו תחילה במפה את האסימון שהטריגר הזה עוסק בו, או תנו token=<id>.',
      triggerNames: 'תנו את שמות האסימונים עם names=, מופרדים ב-; (לדוגמה names=Goblin;Orc).',
      tooManyTriggers: 'לאפקט יכולים להיות לכל היותר {max} טריגרים.',
      noTrigger: 'ל-"{name}" אין טריגר {n}.',
      journalUsage: 'השתמשו ב-!pagefx journal rebuild.',
      unknownPreset: 'אין תבנית "{id}". הקלידו !pagefx presets כדי לראות אותן.',
      unexpected: 'משהו השתבש: {message}',
    },
  };

  const TRANSLATION$2 = {
    titles: {
      ready: 'A PageFX készen áll.',
      menu: 'PageFX',
      status: 'PageFX állapot',
      settings: 'PageFX beállítások',
      presets: 'PageFX sablonok',
      help: 'PageFX parancsok',
      effect: 'Effekt: {name}',
    },
    messages: {
      readyHint: 'A menü megnyitásához írd be: !pagefx.',
      adopted:
        'Átvett effektek a PageFX 1.x tokenekről: {effects}, effektmentes területek: {nulls}. Ugyanúgy működnek, mint eddig.',
      rescanned:
        'Az újraolvasás új effekteket ({effects}) és új effektmentes területeket ({nulls}) talált, és elfelejtett {dropped} effektet, amelyek tokenjeit törölték.',
      allPaused: 'Minden effekt szünetel. Újraindításukhoz használd a !pagefx resume parancsot.',
      allResumed: 'Az effektek újra futnak.',
      turnedOn: 'Bekapcsolva: {count}.',
      turnedOff: 'Kikapcsolva: {count}.',
      toggled: 'Be- vagy kikapcsolva: {count}.',
      paused: 'Szüneteltetve: {count}.',
      resumed: 'Folytatva: {count}.',
      fired: 'Megjelenített effektek: {count}.',
      created: 'Új effektek: {count}. Mindegyik kártyáján válaszd ki, mit jelenítsen meg.',
      deleted: 'Eltávolított effektek: {count}. A tokenjeik a térképen maradtak.',
      renamed: 'Átnevezve: {count}.',
      fxSet: 'Effekt módosítva: {count}.',
      intervalSet: 'Időzítés módosítva: {count}.',
      directionSet: 'Irány módosítva: {count}.',
      areaSet: 'Terület módosítva: {count}.',
      intensitySet: 'Intenzitás módosítva: {count}.',
      layerAdded: 'Réteg hozzáadva: {count}.',
      layerRemoved: 'Réteg eltávolítva: {count}.',
      nullCreated: 'Új effektmentes területek: {count}.',
      nullRemoved: 'Eltávolított effektmentes területek: {count}.',
      presetApplied: '{name} alkalmazva: {count}.',
      journalRebuilt: 'A „{help}” és a „{deck}” handout újra elkészült.',
      triggerAdded: 'Eseményindító hozzáadva: {count}.',
      triggerRemoved: 'Eseményindító eltávolítva: {count}.',
      triggersCleared: 'Eseményindítók eltávolítva ennyi effektről: {count}.',
      throttled:
        'A(z) „{page}” oldalon az effektek ritkítva futnak: másodpercenként több mint {max} megjelenítést kértek. Csökkentsd az intenzitásukat, vagy emeld a korlátot a !pagefx set maxSpawnsPerSecond paranccsal.',
      settingChanged: '{setting} új értéke: {value}.',
      problem: 'A(z) „{name}” effekt nem tud futni: {reason}',
    },
    menu: {
      page: 'Oldal',
      live: 'itt futnak effektek',
      notLive: 'nincsenek itt játékosok',
      allPausedNote: 'Minden effekt szünetel.',
      effectsHere: 'Effektek ezen az oldalon',
      noEffectsHere: 'Ezen az oldalon még nincsenek effektek.',
      otherPages: 'Más oldalak',
      effectCount: '{count} effekt',
      actions: 'Új',
      selectHint:
        'Előbb jelölj ki egy tokent a térképen, majd nyomd meg az Új effekt vagy az Effektmentes terület gombot. A token jelöli, hol jelenik meg az effekt; az „Aura 1” a terület.',
      state: 'Állapot',
      area: 'Terület',
      areaValue: '{radius} {units} a token szélén túl, {shape}',
      circle: 'kör',
      square: 'négyzet',
      circleOption: 'Kör',
      squareOption: 'Négyzet',
      layers: 'Rétegek',
      layer: '{n}. réteg',
      noLayers:
        'Nincsenek rétegek. Adj hozzá egyet, és válaszd ki, mit jelenítsen meg ez az effekt.',
      noFxSet: 'nincs beállítva',
      timing: '{min}–{max} ms-onként',
      directionRandom: 'véletlen irány',
      directionOffset: '{dx}, {dy} mezővel arrébb ér véget',
      v1Note:
        'Ez az effekt még mindig a tokenje „GM Notes” mezőjét és sávjait követi, mint a PageFX 1.x-ben. Ha itt módosítod, ez megszűnik.',
      preset: 'Sablon',
      presetsHint:
        'Jelölj ki egy vagy több tokent a térképen, majd nyomj meg egy sablont. Azok a tokenek, amelyek még nem effektek, effektté válnak, és az „Aura 1” lesz a terület, amelyet a sablon kitölt.',
      triggers: 'Eseményindítók',
      noTriggers:
        'Nincsenek eseményindítók: az effekt mindig fut, amikor játékosok vannak az oldalán.',
      triggerHint:
        'Köralapú eseményindítóhoz vagy egy másik token területéhez előbb jelöld ki azt a tokent a térképen.',
      yes: 'Igen',
      no: 'Nem',
    },
    buttons: {
      edit: 'Szerkesztés',
      show: 'Mutasd',
      turnOn: 'Bekapcsolás',
      turnOff: 'Kikapcsolás',
      pause: 'Szünet',
      resume: 'Folytatás',
      fire: 'Megjelenítés',
      pauseAll: 'Összes szüneteltetése',
      resumeAll: 'Összes folytatása',
      create: 'Új effekt',
      createNull: 'Effektmentes terület',
      removeNull: 'Effektmentes terület törlése',
      settings: 'Beállítások',
      status: 'Állapot',
      rescan: 'Újraolvasás',
      rename: 'Átnevezés',
      area: 'Terület',
      intensity: 'Intenzitás',
      builtin: 'Beépített FX',
      saved: 'Mentett FX',
      json: 'Egyéni JSON',
      timing: 'Időzítés',
      random: 'Véletlen irány',
      offset: 'Irány megadása',
      addLayer: 'Réteg hozzáadása',
      removeLayer: 'Réteg eltávolítása',
      delete: 'Effekt törlése',
      preset: 'Sablon',
      presets: 'Sablonok',
      remove: 'Eltávolítás',
      help: 'Súgó',
      rebuild: 'Handoutok újraépítése',
      onRound: 'Minden fordulóban',
      onTurn: 'Egy körben',
      onEnter: 'Token belép',
      onLeave: 'Token kilép',
      menu: 'Menü',
      change: 'Módosítás',
    },
    prompts: {
      type: 'Effekt típusa',
      colour: 'Szín',
      saved: 'Mentett egyéni FX',
      json: 'Egyéni FX-definíció (JSON)',
      intervalMin: 'Legrövidebb idő két megjelenítés között (ms)',
      intervalMax: 'Leghosszabb idő két megjelenítés között (ms)',
      dx: 'Mezők jobbra a végpontig (negatív: balra)',
      dy: 'Mezők lefelé a végpontig (negatív: felfelé)',
      name: 'Effekt neve',
      radius: 'A terület sugara a token szélén túl, oldalegységben',
      shape: 'A terület alakja',
      intensity: 'Intenzitás ({min}–{max})',
      maxSpawns: 'Megjelenítés másodpercenként egy oldalon (1–{max})',
      preset: 'Sablon',
      then: 'Utána',
      every: 'Hány fordulónként',
      who: 'Mely tokenek számítanak',
      area: 'Melyik terület',
      once: 'Csak az első alkalommal?',
      confirmDelete: 'Törlöd ezt az effektet? A token a térképen marad.',
    },
    settings: {
      language: 'Nyelv',
      globalIntensity: 'Minden effekt intenzitása',
      gmPreviewHint:
        'Bekapcsolva az effektek azon az oldalon is futnak, amelyet egy KM éppen néz, akkor is, ha nincsenek ott játékosok.',
      maxSpawnsHint:
        'Ha egy oldal ennél többet kér, az effektek ritkítva futnak. A Roll20 nagyjából 60-ig marad gördülékeny.',
    },
    status: {
      livePages: 'Aktív oldalak',
      effects: 'Effektek',
      running: 'Fut',
      globalPause: 'Minden szünetel',
      on: 'Be',
      off: 'Ki',
      pausedState: 'Szünetel',
      waiting: 'Nem aktív oldalon van',
      noFx: 'Nincs kiválasztott effekt',
      broken: 'Nem tud futni',
      nullAreas: 'Effektmentes területek',
      noEffects:
        'Még nincsenek effektek. Jelölj ki egy tokent, és írd be: !pagefx create, vagy nyisd meg a menüt a !pagefx paranccsal.',
      gmPreview: 'KM oldalelőnézet',
      intensity: 'Intenzitás',
      maxSpawns: 'Max. megjelenítés másodpercenként, oldalanként',
    },
    help: {
      menu: 'Megnyitja a menüt: az oldaladon lévő effekteket és gombokat minden máshoz.',
      create: 'Effektté alakítja a kijelölt tokeneket. Az „Aura 1” a terület; ha nincs, létrejön.',
      edit: 'Megmutatja minden kijelölt effekt kártyáját, a módosító gombokkal.',
      preset: 'Sablont ad a kijelölt tokeneknek, és ha kell, előbb effektté alakítja őket.',
      presets: 'Felsorolja a sablonokat csomagok szerint.',
      switches:
        'Be- vagy kikapcsolja, illetve szünetelteti és folytatja a kijelölt effekteket. Ha semmi sincs kijelölve, az on és a resume mindent újraindít, az off és a pause pedig mindent megállít (ahogy a !pageFX on és off az 1. verzióban).',
      fire: 'Azonnal megjeleníti a kijelölt effekteket egyszer vagy néhányszor, hogy kipróbálhasd őket.',
      fx: 'Beállítja, mit jelenít meg egy réteg: beépített effektet (például burn-fire), egy mentett egyéni FX nevét, vagy JSON formátumú egyéni FX-definíciót.',
      interval:
        'Beállítja egy réteg két megjelenítése közötti időt ezredmásodpercben. Minden várakozás a két érték között véletlenszerűen alakul.',
      direction:
        'Sugárszerű effekteknél beállítja, hol érjen véget minden megjelenítés: random, vagy hány mezővel jobbra és lefelé a kiindulási ponttól.',
      area: 'Beállítja a területet: a token „Aura 1” sugarát oldalegységben, és az alakját.',
      intensity:
        'Megszorozza, milyen gyakran jelennek meg a kijelölt effektek (0,1–5). A global kulcsszóval minden effektre érvényes.',
      name: 'Átnevezi a kijelölt effekteket.',
      layer: 'Réteget ad hozzá, hogy egy effekt több dolgot jelenítsen meg, vagy eltávolít egyet.',
      triggerAdd:
        'Eseményindítót ad hozzá: round, turn, enter vagy leave esetén start, stop, toggle, fire vagy burst. Beállítások: every=2, round=3, count=5, who=players|all|named, names=A;B, area=selected, once.',
      triggerRemove: 'Eltávolít egy eseményindítót vagy mindet a kijelölt effektekről.',
      null: 'Effektmentes területté alakítja a kijelölt tokeneket, ahol soha nem jelenik meg effekt, vagy visszavonja ezt.',
      delete: 'Leveszi az effektet a kijelölt tokenekről. A tokenek a térképen maradnak.',
      status: 'Felsorol minden effektet, az oldalát, és hogy fut-e.',
      settings: 'Megmutatja a beállításokat.',
      set: 'Módosít egy beállítást: language, gmPagePreview, intensity vagy maxSpawnsPerSecond.',
      rescan:
        'Átveszi a PageFX vagy NullFX nevű új tokeneket, és elfelejti azokat az effekteket, amelyek tokenjeit törölték.',
      journal: 'Újraépíti a súgó és a Command Deck handoutot.',
      help: 'Megmutatja ezt a listát.',
      handout:
        'A teljes útmutató a „{help}” handoutban van; az egykattintásos gombok a „{deck}” handoutban.',
    },
    deck: {
      menuTitle: 'Menü',
      menuDesc: 'A főmenü az oldaladon lévő effekteket mutatja. Az Állapot mindet felsorolja.',
      newTitle: 'Új',
      newDesc:
        'Előbb jelölj ki egy vagy több tokent a térképen. Az „Aura 1” lesz a terület, amelyet az effekt kitölt.',
      selectedTitle: 'Kijelölt effektek',
      selectedDesc: 'Jelöld ki az effekt-tokeneket a térképen, majd nyomj meg egy gombot.',
      allTitle: 'Minden',
      allDesc: 'Minden effekt megállítása vagy mindegyik újraindítása.',
      toolsTitle: 'Eszközök',
      toolsDesc:
        'Másolt tokenek átvétele, törölt tokenek elfelejtése és ezeknek a handoutoknak az újraépítése.',
      footer: 'A teljes útmutatót a „{help}” handoutban találod.',
    },
    handout: {
      versionLabel: 'Verzió',
      subtitle: 'Időjárás- és környezeti effektek Roll20 térképekhez',
      footer: 'Az egykattintásos vezérléshez használd a „{deck}” handoutot.',
      overview: {
        heading: 'Áttekintés',
        body: 'A PageFX folyamatosan futó effektekkel tölti ki a térkép egy területét: eső, hó, parázs, gőz, szentjánosbogarak és még sok más. Minden effekt helyét egy token jelöli, és az „Aura 1” a terület. Az effektek minden olyan oldalon futnak, ahol játékosok vannak, azokon is, ahová egy kettévált csapat egy részét küldték, és leállnak, amikor a játékosok távoznak. Mindent a csevegő menüiből lehet beállítani, és az eseményindítók elindíthatják vagy leállíthatják az effekteket, ahogy a harci fordulók telnek vagy a tokenek mozognak.',
        demo: 'Nézz meg egy rövid bemutatót (az 1. verzióból)',
      },
      quickStart: {
        heading: 'Gyors kezdés',
        steps: [
          'Tegyél egy tokent oda, ahol az effektnek lennie kell (a KM rétegen rejtve marad a játékosok elől), és jelöld ki.',
          'Írd be: !pagefx presets, vagy nyisd meg a Command Deck handoutot és kattints a Sablonok gombra, majd kattints egy sablonra, például: Felhőszakadás.',
          'Méretezd át a token „Aura 1” auráját, hogy beállítsd a területet, amelyet az effekt kitölt. Az aura rejtve marad a játékosok elől.',
          'Vidd át a játékosokat az oldalra. Az effekt elindul, és újra leáll, amikor távoznak.',
          'Írd be: !pagefx, hogy megnyisd a menüt, és kattints egy effektnél a Szerkesztés gombra a módosításhoz.',
        ],
      },
      effects: {
        heading: 'Effektek',
        points: [
          'Egy effekt egy token, plusz a PageFX által tárolt beállítások. Mozgasd a tokent az effekt mozgatásához, és módosítsd az „Aura 1” méretét a terület módosításához. A token törlése az effektet is törli.',
          'Minden effektnek egy vagy több rétege van. Minden réteg egy dolgot jelenít meg újra és újra, a legrövidebb és a leghosszabb idő közötti véletlenszerű várakozással.',
          'Egy réteg megjeleníthet beépített Roll20 effektet (típus és szín, például burn-fire), a játékban mentett egyéni FX-et, vagy JSON-ként beillesztett egyéni FX-definíciót. A definícióból hiányzó értékek kitöltődnek, így egy rövid definíció is kirajzolódik.',
          'A sugárszerű effektek (beam, breath, splatter, valamint a -1 szögű egyéni FX-ek) két pont között rajzolódnak ki. Az irányuk véletlenszerű, vagy rögzített számú mező jobbra és lefelé.',
          'Az intenzitás megszorozza, milyen gyakran jelenik meg egy effekt. Az intensity beállítás minden effektet megszoroz.',
          'A kikapcsolás addig állítja le az effektet, amíg vissza nem kapcsolod. A szünet addig tartja vissza, amíg nem folytatod. Az Összes szüneteltetése minden effektet visszatart anélkül, hogy módosítaná őket.',
          'A Jumpgate fehérrel rajzolja az egyéni FX-definíciókat, hacsak nincsenek egyéni FX-ként elmentve, ezért a PageFX a sajátjait „PageFX: …” nevű egyéni FX-ként menti. Ezek törlődnek, amikor egyik effekt sem használja őket. Hagyd őket a helyükön.',
        ],
      },
      pages: {
        heading: 'Mely oldalakon futnak az effektek',
        points: [
          'Az effektek a játékos-szalaggal jelölt oldalon futnak, és minden olyan oldalon, ahová egy játékost külön áthelyeztek.',
          'Kapcsold be a KM oldalelőnézet beállítást, hogy az effektek azon az oldalon is fussanak, amelyet egy KM éppen néz, így játékosok nélkül is kipróbálhatod őket.',
          'Minden oldal legfeljebb a Max. megjelenítés másodpercenként értéket kapja (alapértelmezés: 30). Ha az effektek többet kérnek, néhány megjelenítés kimarad, és a KM egyszer értesítést kap.',
          'Amikor egy másik Mod áthelyezi a szalagot vagy szétosztja a csapatot, a Roll20 senkit sem értesít, ezért a PageFX néhány másodpercenként ellenőrzi és utoléri a változást.',
        ],
      },
      presets: {
        heading: 'Sablonok',
        intro:
          'A sablon kész rétegeket ad egy effektnek. Ha utána módosítasz egy réteget, az effekt a sajátod lesz. Más Modok a PageFX.registerPreset segítségével adhatnak hozzá sablonokat.',
        colPack: 'Csomag',
        colPresets: 'Sablonok (név és azonosító)',
      },
      triggers: {
        heading: 'Eseményindítók',
        intro:
          'Az eseményindító elindít, leállít, átkapcsol vagy megjelenít egy effektet, amikor valami történik. Az effekt kártyájáról vagy a !pagefx trigger add paranccsal adhatod hozzá őket.',
        points: [
          'Minden fordulóban: a Roll20 nem tárol fordulószámot, ezért egy forduló akkor kezdődik, amikor a kezdeményezési sorrend az utolsó bejegyzésről visszaugrik az elejére. Ha van „Round” nevű egyéni bejegyzés a sorrendben, akkor az számít. Válassz, hogy hány fordulónként, vagy egy adott fordulóban. A harc első fordulója nem számít változásnak.',
          'Egy körben: amikor egy kiválasztott token a kezdeményezési sorrend élére kerül. A gombra kattintás előtt jelöld ki a tokent a térképen.',
          'Token belép vagy kilép: amikor egy token belép az effekt területére vagy kilép onnan, illetve egy általad kijelölt másik token „Aura 1” aurájába. Alapértelmezés szerint csak a játékosok által irányított tokenek számítanak; választhatsz bármely tokent, vagy megadhatsz neveket.',
          'A Sorozat megjelenítése egyszerre többször jeleníti meg az effektet. A Csak az első alkalommal beállítás miatt az eseményindító csak egyszer lép működésbe.',
          'A Roll20 semmit sem jelez a Modoknak, amikor egy másik Mod mozgat egy tokent. A tokeneket mozgató Modok utána meghívhatják a PageFX.checkToken(token) függvényt.',
        ],
      },
      nullAreas: {
        heading: 'Effektmentes területek',
        points: [
          'Az effektmentes terület egy token, ahol soha nem jelenik meg effekt, például egy ház belseje viharban. A területe maga a token és az „Aura 1”.',
          'Jelöld ki a tokent, és kattints az Effektmentes terület gombra a menüben vagy a Command Deck handoutban. A NullFX nevű tokenek, mint az 1. verzióban, szintén effektmentes területek.',
        ],
      },
      commands: {
        heading: 'Parancsok',
        intro:
          'Ezeket a parancsokat csak a KM-ek használhatják. A kijelölt tokenekre hatnak, vagy a --ids után megadott tokenekre. A rétegparancsok az 1. rétegre hatnak, hacsak a --layer mást nem ad meg. Más Modok is küldhetik őket; a válaszok a KM-hez mennek.',
        colCommand: 'Parancs',
        colDesc: 'Mit csinál',
      },
      settings: {
        heading: 'Beállítások',
        intro:
          'A beállításokat a Beállítások kártyán vagy a !pagefx set paranccsal módosíthatod. A nyelv a Mod beállítási oldalán is megadható.',
        colKey: 'Beállítás',
        colDesc: 'Mit csinál',
        rows: {
          language: 'A PageFX menüinek, üzeneteinek és handoutjainak nyelve.',
          gmPagePreview:
            'Az effektek azon az oldalon is fussanak, amelyet egy KM éppen néz (alapból ki).',
          intensity: 'Megszorozza, milyen gyakran jelenik meg minden effekt (alapból 1).',
          maxSpawnsPerSecond:
            'Legfeljebb ennyi megjelenítés egy oldalon másodpercenként, 1–60 (alapból 30).',
        },
      },
      api: {
        heading: 'Más Modoknak',
        intro:
          'A PageFX közzétesz egy PageFX objektumot. Ahol egy függvény tokent vár, a token azonosítója is működik.',
        colFunction: 'Függvény',
        colDesc: 'Mit csinál',
        rows: {
          activateAll: 'Minden effekt folytatása (1. verzió).',
          deactivateAll: 'Minden effekt szüneteltetése (1. verzió).',
          activate: 'Egy effekt be- vagy kikapcsolása, vagy átváltása (1. verzió).',
          start: 'Egy effekt be- vagy kikapcsolása, illetve szüneteltetése és folytatása.',
          setIntensity: 'Egy effekt intenzitásának módosítása.',
          fire: 'Egy effekt azonnali megjelenítése.',
          create:
            'Effektté alakít egy tokent a name, fx, interval, direction és intensity beállításokkal; vagy leveszi róla az effektet.',
          getEffect:
            'Beolvas egy effektet, felsorolja az effekteket (egy oldalon), vagy megmondja, fut-e egy effekt.',
          registerPreset: 'Sablont ad hozzá erre a munkamenetre, vagy felsorolja a sablonokat.',
          checkToken:
            'Ellenőrzi a Modod által mozgatott tokent a belépési és kilépési eseményindítókkal szemben.',
        },
      },
      upgrading: {
        heading: 'Frissítés az 1. verzióról',
        points: [
          'A PageFX és NullFX nevű tokeneket az első indításkor átveszi, és ugyanúgy működnek, mint eddig.',
          'Amíg nem módosítod az effektet a csevegőből, továbbra is a tokenje „GM Notes” mezője, a „Bar 1” (két megjelenítés közötti idő) és a „Bar 2” (a sugár iránya) vezérli, és az interdiction jelölő továbbra is kikapcsolja. Amint a csevegőből módosítod, a „GM Notes” mező és a sávok újra a tieid.',
          'Az 1. verzió csak a játékos-szalag oldalán rajzolt effekteket, és a mentett egyéni FX-eket kétszer jelenítette meg. Mindkettő javítva van.',
          'Az 1. verzió parancsai továbbra is működnek:',
        ],
        colV1: '1. verziós parancs',
        colV2: 'Megfelelője',
      },
      troubleshooting: {
        heading: 'Hibaelhárítás',
        points: [
          'Egy effekt nem fut: nyisd meg a kártyáját. Az Állapot sor megmondja, miért: ki, szünetel, nincs kiválasztott effekt, nem tud futni (az okkal), vagy nem aktív oldalon van (nincsenek ott játékosok; a kipróbáláshoz kapcsold be a KM oldalelőnézetet).',
          'Nem látsz semmit: a nagyon kicsi vagy rövid életű részecskék nehezen láthatók egy zsúfolt térképen. Próbálj ki egy sablont, növeld az intenzitást, vagy csökkentsd a területet.',
          'Az effektek gyérnek tűnnek: lehet, hogy az oldal elérte a Max. megjelenítés másodpercenként értéket. Csökkents néhány intenzitást, vagy emeld a korlátot.',
          'Az effektek leálltak egy oldal vagy játék másolása után: futtasd az Újraolvasás parancsot.',
          'Minden más esetben nézd meg az API-konzol naplóját, és segítségkéréskor mellékeld az üzeneteit.',
        ],
      },
      languages: {
        heading: 'Nyelvek',
        body: 'Nyelvet a Beállítások kártyán vagy a !pagefx set language paranccsal választhatsz. Elérhető nyelvek:',
        colLanguage: 'Nyelv',
        colNative: 'Eredeti név',
        colCode: 'Kód',
      },
      credits: {
        heading: 'Köszönetnyilvánítás',
        original: 'Az eredeti modot készítette:',
        maintainer: 'A 2. verzió karbantartója:',
        marketplace: 'Ada grafikai csomagjai a Roll20 Marketplace-en',
        support:
          'Ha hibát találsz vagy ötleted van, írj a Roll20 Mod fórumba, vagy nyiss egy issue-t a GitHubon, és mellékeld az API-konzol naplójának üzeneteit.',
      },
    },
    triggers: {
      line: '{when}: {action}',
      eachRound: 'Minden új fordulóban',
      everyRounds: '{n} fordulónként',
      onRound: 'A(z) {n}. fordulóban',
      turn: 'Amikor {name} köre kezdődik',
      enter: 'Amikor {who} belép ({area})',
      leave: 'Amikor {who} kilép ({area})',
      areaSelf: 'ennek az effektnek a területe',
      areaSelected: 'a kijelölt token aurája',
      areaOf: '{name} aurája',
      unnamed: 'egy token',
      once: '(csak az első alkalommal)',
      onceUsed: '(csak az első alkalommal, már lefutott)',
      who: {
        players: 'egy játékos tokenje',
        all: 'bármely token',
      },
      action: {
        start: 'indítás',
        stop: 'leállítás',
        toggle: 'be- vagy kikapcsolás',
        fire: 'egyszeri megjelenítés',
        burst: 'sorozat: {count} megjelenítés',
      },
      choice: {
        start: 'Indítás',
        stop: 'Leállítás',
        toggle: 'Be- vagy kikapcsolás',
        fire: 'Egyszeri megjelenítés',
        burst: 'Sorozat megjelenítése',
      },
    },
    packs: {
      weather: 'Időjárás',
      fire: 'Tűz és hőség',
      water: 'Víz',
      magic: 'Mágia és kísértet',
      custom: 'Más Modokból',
    },
    presets: {
      'light-rain': 'Szemerkélő eső',
      'heavy-rain': 'Felhőszakadás',
      thunderstorm: 'Zivatar',
      snow: 'Hó',
      blizzard: 'Hóvihar',
      hail: 'Jégeső',
      sandstorm: 'Homokvihar',
      fog: 'Ködfoszlányok',
      embers: 'Parázs',
      ash: 'Hulló hamu',
      magma: 'Fortyogó magma',
      'lava-spurts': 'Lávakitörések',
      sparks: 'Szikrák',
      drips: 'Barlangi csepegés',
      steam: 'Gőzkürtők',
      geyser: 'Gejzír',
      spray: 'Vízesés permete',
      bubbles: 'Buborékok',
      fireflies: 'Szentjánosbogarak',
      'arcane-motes': 'Mágikus szemcsék',
      'necrotic-mist': 'Nekrotikus köd',
      'holy-glimmer': 'Szent csillogás',
      'swamp-gas': 'Mocsárgáz',
    },
    fx: {
      empty: 'nincs beállítva effekt.',
      badJson: 'az egyéni FX-definíció nem érvényes JSON.',
      unknownColour: 'nincs „{colour}” nevű beépített szín. Színek: {colours}.',
      savedMissing: 'nincs „{name}” nevű mentett egyéni FX.',
      cannotCreate: 'a Roll20 nem hozott létre hozzá egyéni FX-objektumot.',
      spawnFailed: 'a Roll20 nem jelenítette meg ({message}).',
    },
    errors: {
      unknownCommand: 'Ismeretlen parancs: {command}',
      noEffects:
        'Jelölj ki egy vagy több PageFX tokent, vagy add meg az azonosítóikat a --ids kapcsolóval.',
      selectToken:
        'Előbb jelölj ki egy vagy több tokent, vagy add meg az azonosítóikat a --ids kapcsolóval.',
      unknownIds: 'Ezek nem PageFX effektek: {ids}',
      badSetting: 'Ismeretlen beállítás vagy érték: {setting} {value}',
      noLayer: 'A(z) „{name}” effektnek nincs {n}. rétege.',
      tooManyLayers: 'Egy effektnek legfeljebb {max} rétege lehet.',
      layerUsage: 'Használd: !pagefx layer add [effect] vagy !pagefx layer remove <number>.',
      nullUsage: 'Használd: !pagefx null create vagy !pagefx null remove.',
      isEffect: 'A(z) „{name}” effekt, ezért nem lehet egyben effektmentes terület is.',
      badInterval:
        'Add meg a megjelenítések közötti időt ms-ban, például: !pagefx interval 500 1500',
      badDirection:
        'Add meg: random, vagy a mezők számát jobbra és lefelé, például: !pagefx direction 2 -1',
      badArea:
        'Adj meg egy sugarat oldalegységben, és circle vagy square alakot, például: !pagefx area 15 circle',
      badIntensity: 'Adj meg 0-nál nagyobb intenzitást, például: !pagefx intensity 1.5',
      noName: 'Adj meg egy nevet, például: !pagefx name Eső a kikötő felett',
      triggerUsage:
        'Használd: !pagefx trigger add <round|turn|enter|leave> <start|stop|toggle|fire|burst> [every=2] [round=3] [count=5] [who=players|all|named] [names=A;B] [area=self|selected] [once], vagy !pagefx trigger remove <number>.',
      triggerToken:
        'Előbb jelöld ki a térképen azt a tokent, amelyre ez az eseményindító vonatkozik, vagy add meg: token=<id>.',
      triggerNames:
        'Add meg a tokenek nevét a names= után, pontosvesszővel (;) elválasztva (például names=Goblin;Orc).',
      tooManyTriggers: 'Egy effektnek legfeljebb {max} eseményindítója lehet.',
      noTrigger: 'A(z) „{name}” effektnek nincs {n}. eseményindítója.',
      journalUsage: 'Használd: !pagefx journal rebuild.',
      unknownPreset: 'Nincs „{id}” nevű sablon. A sablonok listájához írd be: !pagefx presets.',
      unexpected: 'Valami hiba történt: {message}',
    },
  };

  const TRANSLATION$1 = {
    titles: {
      ready: 'PageFX è pronto.',
      menu: 'PageFX',
      status: 'Stato di PageFX',
      settings: 'Impostazioni di PageFX',
      presets: 'Preset di PageFX',
      help: 'Comandi di PageFX',
      effect: 'Effetto: {name}',
    },
    messages: {
      readyHint: 'Scrivi !pagefx per aprire il menu.',
      adopted:
        'Presi in carico {effects} effetto/i e {nulls} area/e senza effetti dai token di PageFX 1.x. Continuano a funzionare come prima.',
      rescanned:
        'La nuova scansione ha trovato {effects} nuovo/i effetto/i e {nulls} nuova/e area/e senza effetti, e ha dimenticato {dropped} effetto/i i cui token sono stati eliminati.',
      allPaused: 'Tutti gli effetti sono in pausa. Usa !pagefx resume per farli ripartire.',
      allResumed: 'Gli effetti sono di nuovo in funzione.',
      turnedOn: 'Attivati: {count}.',
      turnedOff: 'Disattivati: {count}.',
      toggled: 'Attivati o disattivati: {count}.',
      paused: 'In pausa: {count}.',
      resumed: 'Ripresi: {count}.',
      fired: 'Generato/i {count} effetto/i.',
      created: 'Nuovi effetti: {count}. Scegli sulla scheda di ciascuno cosa genera.',
      deleted: 'Effetti rimossi: {count}. I loro token restano sulla mappa.',
      renamed: 'Rinominati: {count}.',
      fxSet: 'Effetto cambiato: {count}.',
      intervalSet: 'Tempi cambiati: {count}.',
      directionSet: 'Direzione cambiata: {count}.',
      areaSet: 'Area cambiata: {count}.',
      intensitySet: 'Intensità cambiata: {count}.',
      layerAdded: 'Livello aggiunto: {count}.',
      layerRemoved: 'Livello rimosso: {count}.',
      nullCreated: 'Nuove aree senza effetti: {count}.',
      nullRemoved: 'Aree senza effetti rimosse: {count}.',
      presetApplied: '{name} applicato: {count}.',
      journalRebuilt: 'Le dispense "{help}" e "{deck}" sono state ricostruite.',
      triggerAdded: 'Attivatore aggiunto: {count}.',
      triggerRemoved: 'Attivatore rimosso: {count}.',
      triggersCleared: 'Attivatori rimossi da {count} effetto/i.',
      throttled:
        'Gli effetti sulla pagina "{page}" vengono diradati: chiedevano più di {max} generazioni al secondo. Abbassa la loro intensità, oppure alza il limite con !pagefx set maxSpawnsPerSecond.',
      settingChanged: '{setting} ora è {value}.',
      problem: 'L’effetto "{name}" non può funzionare: {reason}',
    },
    menu: {
      page: 'Pagina',
      live: 'qui gli effetti sono attivi',
      notLive: 'nessun giocatore qui',
      allPausedNote: 'Tutti gli effetti sono in pausa.',
      effectsHere: 'Effetti su questa pagina',
      noEffectsHere: 'Ancora nessun effetto su questa pagina.',
      otherPages: 'Altre pagine',
      effectCount: '{count} effetto/i',
      actions: 'Nuovo',
      selectHint:
        'Seleziona prima un token sulla mappa, poi premi Nuovo effetto o Area senza effetti. Il token indica dove compare l’effetto; la sua "Aura 1" è l’area.',
      state: 'Stato',
      area: 'Area',
      areaValue: '{radius} {units} oltre il token, {shape}',
      circle: 'cerchio',
      square: 'quadrato',
      circleOption: 'Cerchio',
      squareOption: 'Quadrato',
      layers: 'Livelli',
      layer: 'Livello {n}',
      noLayers: 'Nessun livello. Aggiungine uno per scegliere cosa genera questo effetto.',
      noFxSet: 'non impostato',
      timing: 'ogni {min}–{max} ms',
      directionRandom: 'direzione casuale',
      directionOffset: 'finisce a {dx}, {dy} caselle di distanza',
      v1Note:
        'Questo effetto segue ancora le "GM Notes" e le barre del suo token, come in PageFX 1.x. Modificarlo qui interrompe questo comportamento.',
      preset: 'Preset',
      presetsHint:
        'Seleziona uno o più token sulla mappa, poi premi un preset. I token che non sono ancora effetti lo diventano, e la loro "Aura 1" è l’area che il preset riempie.',
      triggers: 'Attivatori',
      noTriggers:
        'Nessun attivatore: l’effetto funziona ogni volta che ci sono giocatori sulla sua pagina.',
      triggerHint:
        'Per un attivatore di turno, o un’area presa da un altro token, seleziona prima quel token sulla mappa.',
      yes: 'Sì',
      no: 'No',
    },
    buttons: {
      edit: 'Modifica',
      show: 'Mostra',
      turnOn: 'Attiva',
      turnOff: 'Disattiva',
      pause: 'Pausa',
      resume: 'Riprendi',
      fire: 'Genera',
      pauseAll: 'Metti tutto in pausa',
      resumeAll: 'Riprendi tutto',
      create: 'Nuovo effetto',
      createNull: 'Area senza effetti',
      removeNull: 'Rimuovi area senza effetti',
      settings: 'Impostazioni',
      status: 'Stato',
      rescan: 'Riscansiona',
      rename: 'Rinomina',
      area: 'Area',
      intensity: 'Intensità',
      builtin: 'FX integrati',
      saved: 'FX salvati',
      json: 'JSON personalizzato',
      timing: 'Tempi',
      random: 'Direzione casuale',
      offset: 'Imposta direzione',
      addLayer: 'Aggiungi livello',
      removeLayer: 'Rimuovi livello',
      delete: 'Elimina effetto',
      preset: 'Preset',
      presets: 'Preset',
      remove: 'Rimuovi',
      help: 'Aiuto',
      rebuild: 'Ricostruisci dispense',
      onRound: 'Ogni round',
      onTurn: 'A un turno',
      onEnter: 'Un token entra',
      onLeave: 'Un token esce',
      menu: 'Menu',
      change: 'Cambia',
    },
    prompts: {
      type: 'Tipo di effetto',
      colour: 'Colore',
      saved: 'FX personalizzato salvato',
      json: 'Definizione dell’FX personalizzato (JSON)',
      intervalMin: 'Tempo minimo tra due generazioni (ms)',
      intervalMax: 'Tempo massimo tra due generazioni (ms)',
      dx: 'Caselle in orizzontale fino alla fine (negativo = sinistra)',
      dy: 'Caselle in verticale fino alla fine (negativo = su)',
      name: 'Nome dell’effetto',
      radius: 'Raggio dell’area oltre il token (unità della pagina)',
      shape: 'Forma dell’area',
      intensity: 'Intensità (da {min} a {max})',
      maxSpawns: 'Generazioni al secondo su una pagina (da 1 a {max})',
      preset: 'Preset',
      then: 'Poi',
      every: 'Ogni quanti round',
      who: 'Quali token contano',
      area: 'Quale area',
      once: 'Solo la prima volta?',
      confirmDelete: 'Eliminare questo effetto? Il token resta sulla mappa.',
    },
    settings: {
      language: 'Lingua',
      globalIntensity: 'Intensità di tutti gli effetti',
      gmPreviewHint:
        'Se attivo, gli effetti funzionano anche sulla pagina che ogni GM sta guardando, anche senza giocatori.',
      maxSpawnsHint:
        'Gli effetti vengono diradati sulle pagine che ne chiedono di più. Roll20 resta fluido fino a circa 60.',
    },
    status: {
      livePages: 'Pagine attive',
      effects: 'Effetti',
      running: 'In funzione',
      globalPause: 'Tutto in pausa',
      on: 'Attivo',
      off: 'Disattivo',
      pausedState: 'In pausa',
      waiting: 'Non su una pagina attiva',
      noFx: 'Nessun effetto scelto',
      broken: 'Non può funzionare',
      nullAreas: 'Aree senza effetti',
      noEffects:
        'Ancora nessun effetto. Seleziona un token e scrivi !pagefx create, oppure apri il menu con !pagefx.',
      gmPreview: 'Anteprima pagina del GM',
      intensity: 'Intensità',
      maxSpawns: 'Generazioni massime al secondo per pagina',
    },
    help: {
      menu: 'Apre il menu: gli effetti della tua pagina e i pulsanti per tutto il resto.',
      create:
        'Trasforma i token selezionati in effetti. La loro "Aura 1" è l’area; se non ce l’hanno, ne viene aggiunta una.',
      edit: 'Mostra la scheda di ogni effetto selezionato, con i pulsanti per modificarlo.',
      preset: 'Applica un preset ai token selezionati, trasformandoli prima in effetti se serve.',
      presets: 'Elenca i preset, per pacchetto.',
      switches:
        'Attiva o disattiva gli effetti selezionati, oppure li mette in pausa e li riprende. Senza selezione, on e resume fanno ripartire tutto e off e pause fermano tutto (come facevano !pageFX on e off nella versione 1).',
      fire: 'Genera subito gli effetti selezionati, una o più volte, per provarli.',
      fx: 'Imposta cosa genera un livello: un effetto integrato come burn-fire, il nome di un FX personalizzato salvato, o una definizione di FX personalizzato in JSON.',
      interval:
        'Imposta il tempo tra le generazioni di un livello, in millisecondi. Ogni attesa viene scelta tra i due valori.',
      direction:
        'Per gli effetti a raggio, imposta dove finisce ogni generazione: a caso, oppure a un certo numero di caselle in orizzontale e in verticale dal punto di partenza.',
      area: 'Imposta l’area: il raggio dell’"Aura 1" del token in unità della pagina, e la sua forma.',
      intensity:
        'Moltiplica la frequenza con cui gli effetti selezionati generano (da 0.1 a 5). Con global la cambia per tutti gli effetti.',
      name: 'Rinomina gli effetti selezionati.',
      layer: 'Aggiunge un livello, così un effetto genera più cose, oppure ne rimuove uno.',
      triggerAdd:
        'Aggiunge un attivatore: su round, turn, enter o leave, esegue start, stop, toggle, fire o burst. Opzioni: every=2, round=3, count=5, who=players|all|named, names=A;B, area=selected, once.',
      triggerRemove: 'Rimuove un attivatore, o tutti, dagli effetti selezionati.',
      null: 'Trasforma i token selezionati in aree senza effetti, dove non compare mai nessun effetto, oppure toglie loro questo ruolo.',
      delete: 'Toglie l’effetto dai token selezionati. I token restano sulla mappa.',
      status: 'Elenca tutti gli effetti, la loro pagina e se sono in funzione.',
      settings: 'Mostra le impostazioni.',
      set: 'Cambia un’impostazione: language, gmPagePreview, intensity o maxSpawnsPerSecond.',
      rescan:
        'Prende in carico i nuovi token chiamati PageFX o NullFX, e dimentica gli effetti i cui token sono stati eliminati.',
      journal: 'Ricostruisce le dispense di aiuto e Command Deck.',
      help: 'Mostra questo elenco.',
      handout:
        'Le istruzioni complete sono nella dispensa "{help}"; i pulsanti a un clic sono in "{deck}".',
    },
    deck: {
      menuTitle: 'Menu',
      menuDesc: 'Il menu principale elenca gli effetti della tua pagina. Stato li elenca tutti.',
      newTitle: 'Nuovo',
      newDesc:
        'Seleziona prima uno o più token sulla mappa. La loro "Aura 1" diventa l’area che l’effetto riempie.',
      selectedTitle: 'Effetti selezionati',
      selectedDesc: 'Seleziona i token degli effetti sulla mappa, poi premi un pulsante.',
      allTitle: 'Tutto',
      allDesc: 'Ferma tutti gli effetti, o falli ripartire tutti.',
      toolsTitle: 'Strumenti',
      toolsDesc: 'Recupera i token copiati o eliminati, e ricostruisci queste dispense.',
      footer: 'Vedi la dispensa "{help}" per le istruzioni complete.',
    },
    handout: {
      versionLabel: 'Versione',
      subtitle: 'Meteo ed effetti d’ambiente per le mappe di Roll20',
      footer: 'Usa la dispensa "{deck}" per i comandi a un clic.',
      overview: {
        heading: 'Panoramica',
        body: 'PageFX riempie un’area della mappa di effetti continui: pioggia, neve, braci, vapore, lucciole e altro. Un token indica la posizione di ogni effetto, e la sua "Aura 1" è l’area. Gli effetti funzionano su ogni pagina in cui ci sono giocatori, comprese quelle dove è stata mandata parte di un gruppo diviso, e si fermano quando i giocatori se ne vanno. Tutto si imposta dai menu in chat, e gli attivatori possono avviare o fermare gli effetti col passare dei round di combattimento o quando i token si muovono.',
        demo: 'Guarda una breve demo (della versione 1)',
      },
      quickStart: {
        heading: 'Per iniziare',
        steps: [
          'Metti un token dove deve trovarsi l’effetto (il livello GM lo nasconde ai giocatori) e selezionalo.',
          'Scrivi !pagefx presets, oppure apri il Command Deck e clicca su Preset, poi clicca su un preset come Pioggia forte.',
          'Ridimensiona l’"Aura 1" del token per impostare l’area che l’effetto riempie. L’aura è nascosta ai giocatori.',
          'Sposta i giocatori sulla pagina. L’effetto parte, e si ferma di nuovo quando se ne vanno.',
          'Scrivi !pagefx per aprire il menu, e clicca su Modifica su un effetto per cambiarlo.',
        ],
      },
      effects: {
        heading: 'Effetti',
        points: [
          'Un effetto è un token più le impostazioni che PageFX conserva. Sposta il token per spostare l’effetto, e cambia la sua "Aura 1" per cambiare l’area. Eliminare il token elimina l’effetto.',
          'Ogni effetto ha uno o più livelli. Ogni livello genera una cosa, più e più volte, con un’attesa casuale tra il suo tempo minimo e massimo.',
          'Un livello può generare un effetto integrato di Roll20 (tipo e colore, come burn-fire), un FX personalizzato salvato nella partita, o una definizione di FX personalizzato incollata in JSON. I valori mancanti di una definizione vengono completati, quindi anche una definizione breve viene disegnata.',
          'Gli effetti a raggio (beam, breath, splatter, e gli FX personalizzati con angolo -1) vengono disegnati tra due punti. La loro direzione è casuale, oppure un numero fisso di caselle in orizzontale e in verticale.',
          'L’intensità moltiplica la frequenza con cui un effetto genera. L’impostazione intensity moltiplica tutti gli effetti.',
          'Disattiva ferma un effetto finché non viene riattivato. Pausa lo sospende finché non viene ripreso. Metti tutto in pausa sospende tutti gli effetti senza modificarli.',
          'Jumpgate disegna in bianco le definizioni di FX personalizzato, a meno che non siano salvate come FX personalizzati, quindi PageFX salva le proprie come FX personalizzati chiamati “PageFX: …”. Vengono rimossi quando nessun effetto li usa più. Lasciali dove sono.',
        ],
      },
      pages: {
        heading: 'Su quali pagine funziona',
        points: [
          'Gli effetti funzionano sulla pagina con il segnalibro dei giocatori e su ogni pagina in cui un giocatore è stato spostato da solo.',
          'Attiva Anteprima pagina del GM per far funzionare gli effetti anche sulla pagina che ogni GM sta guardando, così puoi provarli senza giocatori.',
          'Ogni pagina riceve al massimo Generazioni massime al secondo (30 di default). Se gli effetti ne chiedono di più, alcune generazioni vengono saltate, e il GM viene avvisato una volta.',
          'Quando un’altra Mod sposta il segnalibro o divide il gruppo, Roll20 non avvisa nessuno, quindi PageFX controlla ogni pochi secondi e si aggiorna.',
        ],
      },
      presets: {
        heading: 'Preset',
        intro:
          'Un preset dà a un effetto una serie di livelli già pronti. Modificare un livello in seguito rende l’effetto tuo. Altre Mod possono aggiungere preset con PageFX.registerPreset.',
        colPack: 'Pacchetto',
        colPresets: 'Preset (nome e ID)',
      },
      triggers: {
        heading: 'Attivatori',
        intro:
          'Un attivatore avvia, ferma, alterna o genera un effetto quando succede qualcosa. Aggiungili dalla scheda dell’effetto, o con !pagefx trigger add.',
        points: [
          'Ogni round: Roll20 non tiene il numero del round, quindi un round inizia quando l’ordine di turno passa dall’ultima voce di nuovo alla prima. Se c’è una voce personalizzata chiamata “Round” nell’ordine di turno, viene usata quella. Scegli ogni tot round, oppure un round preciso. Il primo round di un combattimento non conta come cambio.',
          'A un turno: quando un token scelto arriva in cima all’ordine di turno. Seleziona il token sulla mappa prima di cliccare il pulsante.',
          'Un token entra o esce: quando un token entra o esce dall’area dell’effetto, o dall’"Aura 1" di un altro token che selezioni. Di default contano solo i token controllati da un giocatore; scegli qualsiasi token, oppure indica dei nomi.',
          'Genera una raffica genera l’effetto più volte insieme. Solo la prima volta fa scattare un attivatore una volta sola.',
          'Roll20 non dice nulla alle Mod quando un’altra Mod sposta un token. Le Mod che spostano token possono chiamare PageFX.checkToken(token) subito dopo.',
        ],
      },
      nullAreas: {
        heading: 'Aree senza effetti',
        points: [
          'Un’area senza effetti è un token in cui non compare mai nessun effetto, come l’interno di una casa durante una tempesta. La sua area è il token più la sua "Aura 1".',
          'Seleziona il token e clicca su Area senza effetti nel menu o nel Command Deck. Anche i token chiamati NullFX, come nella versione 1, sono aree senza effetti.',
        ],
      },
      commands: {
        heading: 'Comandi',
        intro:
          'Solo i GM possono usare questi comandi. Agiscono sui token selezionati, o sui token indicati con --ids. I comandi di livello agiscono sul livello 1, a meno che --layer non dica altrimenti. Anche altre Mod possono inviarli; le risposte vanno al GM.',
        colCommand: 'Comando',
        colDesc: 'Cosa fa',
      },
      settings: {
        heading: 'Impostazioni',
        intro:
          'Cambia le impostazioni dalla scheda Impostazioni, o con !pagefx set. La lingua si può impostare anche nella pagina delle impostazioni della Mod.',
        colKey: 'Impostazione',
        colDesc: 'Cosa fa',
        rows: {
          language: 'La lingua dei menu, dei messaggi e delle dispense di PageFX.',
          gmPagePreview:
            'Fa funzionare gli effetti anche sulla pagina che ogni GM sta guardando (disattivo di default).',
          intensity: 'Moltiplica la frequenza con cui ogni effetto genera (1 di default).',
          maxSpawnsPerSecond:
            'Il numero massimo di generazioni al secondo su una pagina, da 1 a 60 (30 di default).',
        },
      },
      api: {
        heading: 'Per altre Mod',
        intro:
          'PageFX pubblica un oggetto PageFX. Dove una funzione accetta un token, funziona anche l’ID del token.',
        colFunction: 'Funzione',
        colDesc: 'Cosa fa',
        rows: {
          activateAll: 'Riprende tutti gli effetti (versione 1).',
          deactivateAll: 'Mette in pausa tutti gli effetti (versione 1).',
          activate: 'Attiva, disattiva o inverte lo stato di un effetto (versione 1).',
          start: 'Attiva o disattiva un effetto, oppure lo mette in pausa e lo riprende.',
          setIntensity: 'Cambia l’intensità di un effetto.',
          fire: 'Genera subito un effetto.',
          create:
            'Trasforma un token in effetto, con le opzioni name, fx, interval, direction e intensity; oppure gli toglie l’effetto.',
          getEffect:
            'Legge un effetto, elenca gli effetti (di una pagina), o dice se un effetto è in funzione.',
          registerPreset: 'Aggiunge un preset per questa sessione, o li elenca.',
          checkToken:
            'Controlla un token spostato dalla tua Mod rispetto agli attivatori di entrata e uscita.',
        },
      },
      upgrading: {
        heading: 'Aggiornare dalla versione 1',
        points: [
          'I token chiamati PageFX e NullFX vengono presi in carico al primo avvio e continuano a funzionare come prima.',
          'Finché non modifichi un effetto dalla chat, le "GM Notes" del suo token, "Bar 1" (tempo tra le generazioni) e "Bar 2" (direzione del raggio) continuano a guidarlo, e il segnalino di divieto continua a disattivarlo. Appena lo modifichi dalla chat, le "GM Notes" e le barre tornano a tua disposizione.',
          'La versione 1 disegnava gli effetti solo sulla pagina del segnalibro dei giocatori, e generava due volte gli FX personalizzati salvati. Entrambi i problemi sono risolti.',
          'I comandi della versione 1 funzionano ancora:',
        ],
        colV1: 'Comando della versione 1',
        colV2: 'Equivale a',
      },
      troubleshooting: {
        heading: 'Risoluzione dei problemi',
        points: [
          'Un effetto non funziona: apri la sua scheda. La riga Stato dice perché: disattivo, in pausa, nessun effetto scelto, non può funzionare (con il motivo), o non su una pagina attiva (nessun giocatore lì; attiva Anteprima pagina del GM per provarlo).',
          'Non vedi niente: le particelle molto piccole o di breve durata sono difficili da vedere su una mappa piena di dettagli. Prova un preset, alza l’intensità, o rimpicciolisci l’area.',
          'Gli effetti sembrano radi: la pagina potrebbe essere al limite di Generazioni massime al secondo. Abbassa qualche intensità, oppure alza il limite.',
          'Gli effetti si sono fermati dopo aver copiato una pagina o una partita: esegui Riscansiona.',
          'Per tutto il resto, controlla il log della console API e includi i suoi messaggi quando chiedi aiuto.',
        ],
      },
      languages: {
        heading: 'Lingue',
        body: 'Scegli una lingua dalla scheda Impostazioni, o con !pagefx set language. Lingue disponibili:',
        colLanguage: 'Lingua',
        colNative: 'Nome originale',
        colCode: 'Codice',
      },
      credits: {
        heading: 'Riconoscimenti',
        original: 'Mod originale di',
        maintainer: 'Versione 2 curata da',
        marketplace: 'I pacchetti grafici di Ada sul Marketplace di Roll20',
        support:
          'Se trovi un bug o hai un’idea, scrivi nel forum Mod di Roll20 o apri una issue su GitHub, e includi gli eventuali messaggi del log della console API.',
      },
    },
    triggers: {
      line: '{when}: {action}',
      eachRound: 'A ogni nuovo round',
      everyRounds: 'Ogni {n} round',
      onRound: 'Al round {n}',
      turn: 'Quando inizia il turno di {name}',
      enter: 'Quando {who} entra in {area}',
      leave: 'Quando {who} esce da {area}',
      areaSelf: 'l’area di questo effetto',
      areaSelected: 'l’aura del token selezionato',
      areaOf: 'l’aura di {name}',
      unnamed: 'un token',
      once: '(solo la prima volta)',
      onceUsed: '(solo la prima volta, già usato)',
      who: {
        players: 'un token di un giocatore',
        all: 'qualsiasi token',
      },
      action: {
        start: 'avvialo',
        stop: 'fermalo',
        toggle: 'attivalo o disattivalo',
        fire: 'generalo una volta',
        burst: 'genera una raffica di {count}',
      },
      choice: {
        start: 'Avvia',
        stop: 'Ferma',
        toggle: 'Attiva o disattiva',
        fire: 'Genera una volta',
        burst: 'Genera una raffica',
      },
    },
    packs: {
      weather: 'Meteo',
      fire: 'Fuoco e calore',
      water: 'Acqua',
      magic: 'Magia e mistero',
      custom: 'Da altre Mod',
    },
    presets: {
      'light-rain': 'Pioggia leggera',
      'heavy-rain': 'Pioggia forte',
      thunderstorm: 'Temporale',
      snow: 'Neve',
      blizzard: 'Bufera di neve',
      hail: 'Grandine',
      sandstorm: 'Tempesta di sabbia',
      fog: 'Filamenti di nebbia',
      embers: 'Braci',
      ash: 'Cenere che cade',
      magma: 'Magma ribollente',
      'lava-spurts': 'Schizzi di lava',
      sparks: 'Scintille',
      drips: 'Gocciolio di grotta',
      steam: 'Sfiati di vapore',
      geyser: 'Geyser',
      spray: 'Spruzzi di cascata',
      bubbles: 'Bolle',
      fireflies: 'Lucciole',
      'arcane-motes': 'Granelli arcani',
      'necrotic-mist': 'Nebbia necrotica',
      'holy-glimmer': 'Bagliore sacro',
      'swamp-gas': 'Gas di palude',
    },
    fx: {
      empty: 'nessun effetto impostato.',
      badJson: 'la definizione dell’FX personalizzato non è JSON valido.',
      unknownColour: 'non esiste il colore integrato "{colour}". Colori: {colours}.',
      savedMissing: 'non esiste un FX personalizzato salvato chiamato "{name}".',
      cannotCreate: 'Roll20 non ha voluto creare un oggetto FX personalizzato per esso.',
      spawnFailed: 'Roll20 non ha voluto generarlo ({message}).',
    },
    errors: {
      unknownCommand: 'Comando sconosciuto: {command}',
      noEffects: 'Seleziona uno o più token di PageFX, oppure indica i loro ID con --ids.',
      selectToken: 'Seleziona prima uno o più token, oppure indica i loro ID con --ids.',
      unknownIds: 'Questi non sono effetti di PageFX: {ids}',
      badSetting: 'Impostazione o valore sconosciuto: {setting} {value}',
      noLayer: '"{name}" non ha il livello {n}.',
      tooManyLayers: 'Un effetto può avere al massimo {max} livelli.',
      layerUsage: 'Usa !pagefx layer add [effetto] o !pagefx layer remove <numero>.',
      nullUsage: 'Usa !pagefx null create o !pagefx null remove.',
      isEffect: '"{name}" è un effetto, quindi non può essere anche un’area senza effetti.',
      badInterval:
        'Indica il tempo tra le generazioni in ms, per esempio: !pagefx interval 500 1500',
      badDirection:
        'Indica random, oppure le caselle in orizzontale e in verticale, per esempio: !pagefx direction 2 -1',
      badArea:
        'Indica un raggio in unità della pagina, e circle o square, per esempio: !pagefx area 15 circle',
      badIntensity: 'Indica un’intensità maggiore di 0, per esempio: !pagefx intensity 1.5',
      noName: 'Indica un nome, per esempio: !pagefx name Pioggia sul porto',
      triggerUsage:
        'Usa !pagefx trigger add <round|turn|enter|leave> <start|stop|toggle|fire|burst> [every=2] [round=3] [count=5] [who=players|all|named] [names=A;B] [area=self|selected] [once], oppure !pagefx trigger remove <numero>.',
      triggerToken:
        'Seleziona prima sulla mappa il token a cui si riferisce questo attivatore, oppure indica token=<id>.',
      triggerNames:
        'Indica i nomi dei token con names=, separati da ; (per esempio names=Goblin;Orc).',
      tooManyTriggers: 'Un effetto può avere al massimo {max} attivatori.',
      noTrigger: '"{name}" non ha l’attivatore {n}.',
      journalUsage: 'Usa !pagefx journal rebuild.',
      unknownPreset: 'Non esiste il preset "{id}". Scrivi !pagefx presets per vederli.',
      unexpected: 'Qualcosa è andato storto: {message}',
    },
  };

  var localeJa = {
    titles: {
      ready: 'PageFX の準備ができました。',
      menu: 'PageFX',
      status: 'PageFX ステータス',
      settings: 'PageFX 設定',
      presets: 'PageFX プリセット',
      help: 'PageFX コマンド',
      effect: 'エフェクト: {name}',
    },
    messages: {
      readyHint: '!pagefx と入力するとメニューが開きます。',
      adopted:
        'PageFX 1.x のトークンから、エフェクト {effects} 個とエフェクト除外範囲 {nulls} 個を引き継ぎました。これまでどおり動作します。',
      rescanned:
        '再スキャンで新しいエフェクトを {effects} 個、新しいエフェクト除外範囲を {nulls} 個見つけ、トークンが削除された {dropped} 個を登録から外しました。',
      allPaused:
        'すべてのエフェクトが一時停止中です。再開するには !pagefx resume を使ってください。',
      allResumed: 'エフェクトの実行を再開しました。',
      turnedOn: 'オンにしました: {count}。',
      turnedOff: 'オフにしました: {count}。',
      toggled: 'オン・オフを切り替えました: {count}。',
      paused: '一時停止しました: {count}。',
      resumed: '再開しました: {count}。',
      fired: '{count} 個のエフェクトを発生させました。',
      created: '新しいエフェクト: {count}。それぞれのカードで、何を発生させるか選んでください。',
      deleted: '削除したエフェクト: {count}。トークンはマップ上に残っています。',
      renamed: '名前を変更しました: {count}。',
      fxSet: 'エフェクトを変更しました: {count}。',
      intervalSet: 'タイミングを変更しました: {count}。',
      directionSet: '方向を変更しました: {count}。',
      areaSet: '範囲を変更しました: {count}。',
      intensitySet: '強度を変更しました: {count}。',
      layerAdded: 'レイヤーを追加しました: {count}。',
      layerRemoved: 'レイヤーを削除しました: {count}。',
      nullCreated: '新しいエフェクト除外範囲: {count}。',
      nullRemoved: '解除したエフェクト除外範囲: {count}。',
      presetApplied: '{name} を適用しました: {count}。',
      journalRebuilt: 'ハンドアウト「{help}」と「{deck}」を作り直しました。',
      triggerAdded: 'トリガーを追加しました: {count}。',
      triggerRemoved: 'トリガーを削除しました: {count}。',
      triggersCleared: '{count} 個のエフェクトからトリガーを削除しました。',
      throttled:
        'ページ「{page}」のエフェクトを間引いています。毎秒 {max} 回を超える発生が要求されました。エフェクトの強度を下げるか、!pagefx set maxSpawnsPerSecond で上限を上げてください。',
      settingChanged: '{setting} を {value} にしました。',
      problem: 'エフェクト「{name}」を実行できません: {reason}',
    },
    menu: {
      page: 'ページ',
      live: 'エフェクト実行中',
      notLive: 'プレイヤーがいません',
      allPausedNote: 'すべてのエフェクトが一時停止中です。',
      effectsHere: 'このページのエフェクト',
      noEffectsHere: 'このページにはまだエフェクトがありません。',
      otherPages: '他のページ',
      effectCount: 'エフェクト {count} 個',
      actions: '新規',
      selectHint:
        'まずマップ上でトークンを選択してから、「新しいエフェクト」か「エフェクト除外範囲」を押してください。トークンはエフェクトが現れる位置を示し、その Aura 1 が範囲になります。',
      state: '状態',
      area: '範囲',
      areaValue: 'トークンの外側 {radius} {units}、{shape}',
      circle: '円形',
      square: '正方形',
      circleOption: '円形',
      squareOption: '正方形',
      layers: 'レイヤー',
      layer: 'レイヤー {n}',
      noLayers:
        'レイヤーがありません。レイヤーを追加して、このエフェクトで何を発生させるか選んでください。',
      noFxSet: '未設定',
      timing: '{min}～{max} ミリ秒ごと',
      directionRandom: 'ランダムな方向',
      directionOffset: '横 {dx}・縦 {dy} マス先で終わる',
      v1Note:
        'このエフェクトは PageFX 1.x と同じく、まだトークンの GM Notes とバーに従っています。ここで変更すると、それらには従わなくなります。',
      preset: 'プリセット',
      presetsHint:
        'マップ上でトークンを 1 つ以上選択してから、プリセットを押してください。まだエフェクトでないトークンはエフェクトになり、その Aura 1 がプリセットで満たす範囲になります。',
      triggers: 'トリガー',
      noTriggers: 'トリガーなし: プレイヤーがこのページにいる間、エフェクトは常に実行されます。',
      triggerHint:
        'ターンのトリガーを使う場合や、別のトークンの範囲を使う場合は、先にマップ上でそのトークンを選択してください。',
      yes: 'はい',
      no: 'いいえ',
    },
    buttons: {
      edit: '編集',
      show: '表示',
      turnOn: 'オン',
      turnOff: 'オフ',
      pause: '一時停止',
      resume: '再開',
      fire: '発生',
      pauseAll: 'すべて一時停止',
      resumeAll: 'すべて再開',
      create: '新しいエフェクト',
      createNull: 'エフェクト除外範囲',
      removeNull: 'エフェクト除外範囲を解除',
      settings: '設定',
      status: 'ステータス',
      rescan: '再スキャン',
      rename: '名前を変更',
      area: '範囲',
      intensity: '強度',
      builtin: '組み込み FX',
      saved: '保存済み FX',
      json: 'カスタム JSON',
      timing: 'タイミング',
      random: 'ランダムな方向',
      offset: '方向を指定',
      addLayer: 'レイヤーを追加',
      removeLayer: 'レイヤーを削除',
      delete: 'エフェクトを削除',
      preset: 'プリセット',
      presets: 'プリセット',
      remove: '削除',
      help: 'ヘルプ',
      rebuild: 'ハンドアウトを作り直す',
      onRound: 'ラウンドごと',
      onTurn: 'ターン時',
      onEnter: 'トークンが入る',
      onLeave: 'トークンが出る',
      menu: 'メニュー',
      change: '変更',
    },
    prompts: {
      type: 'エフェクトの種類',
      colour: '色',
      saved: '保存済みのカスタム FX',
      json: 'カスタム FX の定義（JSON）',
      intervalMin: '発生間隔の最短時間（ミリ秒）',
      intervalMax: '発生間隔の最長時間（ミリ秒）',
      dx: '終点までの横方向のマス数（マイナスは左）',
      dy: '終点までの下方向のマス数（マイナスは上）',
      name: 'エフェクト名',
      radius: 'トークンの外側に広がる範囲の半径（ページ単位）',
      shape: '範囲の形',
      intensity: '強度（{min}～{max}）',
      maxSpawns: '1 ページあたりの毎秒の発生数（1～{max}）',
      preset: 'プリセット',
      then: 'そのときの動作',
      every: '何ラウンドごとにしますか？',
      who: '対象にするトークン',
      area: 'どの範囲にしますか？',
      once: '初回のみにしますか？',
      confirmDelete: 'このエフェクトを削除しますか？トークンはマップ上に残ります。',
    },
    settings: {
      language: '言語',
      globalIntensity: 'すべてのエフェクトの強度',
      gmPreviewHint:
        'オンにすると、プレイヤーがいなくても、各 GM が見ているページでエフェクトが実行されます。',
      maxSpawnsHint:
        'これを超える発生を要求するページでは、エフェクトが間引かれます。Roll20 は 60 前後までなら滑らかに動きます。',
    },
    status: {
      livePages: '実行対象のページ',
      effects: 'エフェクト',
      running: '実行中',
      globalPause: 'すべて一時停止中',
      on: 'オン',
      off: 'オフ',
      pausedState: '一時停止中',
      waiting: '実行対象のページにない',
      noFx: 'エフェクト未選択',
      broken: '実行できない',
      nullAreas: 'エフェクト除外範囲',
      noEffects:
        'エフェクトはまだありません。トークンを選択して !pagefx create と入力するか、!pagefx でメニューを開いてください。',
      gmPreview: 'GM ページプレビュー',
      intensity: '強度',
      maxSpawns: 'ページごとの毎秒最大発生数',
    },
    help: {
      menu: 'メニューを開きます。自分のページのエフェクトと、その他すべての操作ボタンが表示されます。',
      create:
        '選択したトークンをエフェクトにします。その Aura 1 が範囲になります。オーラがなければ追加されます。',
      edit: '選択した各エフェクトのカードを、変更用のボタン付きで表示します。',
      preset: '選択したトークンにプリセットを適用します。必要なら先にエフェクトにします。',
      presets: 'プリセットをパック別に一覧表示します。',
      switches:
        '選択したエフェクトをオン・オフにするか、一時停止・再開します。何も選択していない場合、on と resume はすべてを再び動かし、off と pause はすべてを止めます（バージョン 1 の !pageFX on と off と同じです）。',
      fire: '選択したエフェクトを今すぐ 1 回または数回発生させて、試すことができます。',
      fx: 'レイヤーで発生させるものを設定します。burn-fire などの組み込みエフェクト、保存済みカスタム FX の名前、または JSON で書いたカスタム FX の定義を指定できます。',
      interval:
        'レイヤーの発生間隔をミリ秒で設定します。毎回の待ち時間は 2 つの値の間から選ばれます。',
      direction:
        'ビーム状のエフェクトで、各発生の終点を設定します。random か、開始点から横方向と下方向のマス数を指定します。',
      area: '範囲を設定します。トークンの Aura 1 の半径（ページ単位）と、その形を指定します。',
      intensity:
        '選択したエフェクトの発生頻度に倍率を掛けます（0.1～5）。global を付けると、すべてのエフェクトの強度を変更します。',
      name: '選択したエフェクトの名前を変更します。',
      layer:
        'レイヤーを追加して 1 つのエフェクトで複数のものを発生させるか、レイヤーを削除します。',
      triggerAdd:
        'トリガーを追加します。round、turn、enter、leave のときに、start、stop、toggle、fire、burst を行います。オプション: every=2、round=3、count=5、who=players|all|named、names=A;B、area=selected、once。',
      triggerRemove: '選択したエフェクトから、トリガーを 1 つ、またはすべて削除します。',
      null: '選択したトークンを、エフェクトが一切発生しないエフェクト除外範囲にするか、その設定を解除します。',
      delete: '選択したトークンからエフェクトを外します。トークンはマップ上に残ります。',
      status: 'すべてのエフェクトと、そのページ、実行中かどうかを一覧表示します。',
      settings: '設定を表示します。',
      set: '設定を変更します: language、gmPagePreview、intensity、maxSpawnsPerSecond。',
      rescan:
        'PageFX または NullFX という名前の新しいトークンを引き継ぎ、トークンが削除されたエフェクトを登録から外します。',
      journal: 'ヘルプと Command Deck のハンドアウトを作り直します。',
      help: 'この一覧を表示します。',
      handout: '詳しい説明はハンドアウト「{help}」に、ワンクリックのボタンは「{deck}」にあります。',
    },
    deck: {
      menuTitle: 'メニュー',
      menuDesc:
        'メインメニューには自分のページのエフェクトが表示されます。ステータスにはすべてのエフェクトが表示されます。',
      newTitle: '新規',
      newDesc:
        'まずマップ上でトークンを 1 つ以上選択してください。その Aura 1 が、エフェクトで満たす範囲になります。',
      selectedTitle: '選択したエフェクト',
      selectedDesc: 'マップ上でエフェクトのトークンを選択してから、ボタンを押してください。',
      allTitle: 'すべて',
      allDesc: 'すべてのエフェクトを止めるか、すべてを再び動かします。',
      toolsTitle: 'ツール',
      toolsDesc:
        'コピーされたトークンや削除されたトークンを反映し、これらのハンドアウトを作り直します。',
      footer: '詳しい説明はハンドアウト「{help}」をご覧ください。',
    },
    handout: {
      versionLabel: 'バージョン',
      subtitle: 'Roll20 のマップ向けの天候・環境エフェクト',
      footer: 'ワンクリックで操作するには、ハンドアウト「{deck}」を使ってください。',
      overview: {
        heading: '概要',
        body: 'PageFX は、雨、雪、火の粉、蒸気、ホタルなど、途切れずに続くエフェクトでマップの範囲を満たします。各エフェクトの位置はトークンで示し、その Aura 1 が範囲になります。エフェクトはプレイヤーがいるすべてのページで実行され、分かれたパーティーが送られたページも含まれます。プレイヤーが去ると止まります。設定はすべてチャットのメニューから行えます。トリガーを使えば、戦闘のラウンドの経過やトークンの移動に合わせてエフェクトを開始・停止できます。',
        demo: '短いデモを見る（バージョン 1 のもの）',
      },
      quickStart: {
        heading: 'クイックスタート',
        steps: [
          'エフェクトを置きたい場所にトークンを置き（GM レイヤーに置けばプレイヤーには見えません）、選択します。',
          '!pagefx presets と入力するか、Command Deck を開いて「プリセット」をクリックし、「大雨」などのプリセットをクリックします。',
          'トークンの Aura 1 の大きさを変えて、エフェクトで満たす範囲を決めます。オーラはプレイヤーには見えません。',
          'プレイヤーをそのページに移動させます。エフェクトが始まり、プレイヤーが去るとまた止まります。',
          '!pagefx と入力してメニューを開き、エフェクトの「編集」をクリックして変更します。',
        ],
      },
      effects: {
        heading: 'エフェクト',
        points: [
          'エフェクトとは、トークンと、PageFX が保持する設定の組み合わせです。トークンを動かせばエフェクトも動き、Aura 1 を変えれば範囲も変わります。トークンを削除するとエフェクトも削除されます。',
          '各エフェクトには 1 つ以上のレイヤーがあります。各レイヤーは 1 種類のものを繰り返し発生させ、その間隔は最短時間と最長時間の間でランダムに決まります。',
          'レイヤーで発生させられるのは、Roll20 の組み込みエフェクト（burn-fire のような種類と色）、ゲームに保存されたカスタム FX、または JSON として貼り付けたカスタム FX の定義です。定義に足りない値は補われるので、短い定義でも描画されます。',
          'ビーム状のエフェクト（beam、breath、splatter、および angle が -1 のカスタム FX）は 2 点の間に描画されます。方向はランダムか、横方向と下方向に決まったマス数です。',
          '強度は、エフェクトが発生する頻度に掛かる倍率です。設定の intensity は、すべてのエフェクトに掛かります。',
          'オフにしたエフェクトは、オンにするまで止まります。一時停止したエフェクトは、再開するまで止まります。「すべて一時停止」は、個々のエフェクトを変更せずにすべてを止めます。',
          'Jumpgate は、カスタム FX として保存されていないカスタム FX の定義を白で描画します。そのため PageFX は、自分の定義を「PageFX: …」という名前のカスタム FX として保存します。どのエフェクトも使わなくなると削除されるので、そのまま残しておいてください。',
        ],
      },
      pages: {
        heading: 'エフェクトが実行されるページ',
        points: [
          'エフェクトは、プレイヤーリボンのあるページと、プレイヤーが個別に移動させられたすべてのページで実行されます。',
          '「GM ページプレビュー」をオンにすると、各 GM が見ているページでもエフェクトが実行されるので、プレイヤーがいなくても試せます。',
          '各ページの上限は「毎秒最大発生数」（初期値 30）です。エフェクトがそれ以上を要求すると一部の発生が省かれ、GM に一度だけ通知されます。',
          '別の Mod がリボンを動かしたりパーティーを分けたりしても、Roll20 は誰にも知らせません。そのため PageFX は数秒ごとに確認して追いつきます。',
        ],
      },
      presets: {
        heading: 'プリセット',
        intro:
          'プリセットは、エフェクトに出来合いのレイヤー一式を与えます。あとでレイヤーを変更すると、そのエフェクトはあなた独自のものになります。他の Mod は PageFX.registerPreset でプリセットを追加できます。',
        colPack: 'パック',
        colPresets: 'プリセット（名前と ID）',
      },
      triggers: {
        heading: 'トリガー',
        intro:
          'トリガーは、何かが起きたときにエフェクトを開始、停止、切り替え、または発生させます。エフェクトのカードから、または !pagefx trigger add で追加します。',
        points: [
          'ラウンドごと: Roll20 はラウンド数を記録しないため、ターン順が最後の項目から先頭に戻ったときに新しいラウンドが始まるものとします。「Round」という名前のカスタム項目がターン順にある場合は、代わりにそれを使います。何ラウンドごとにするか、または特定の 1 ラウンドを選びます。戦闘の最初のラウンドは、ラウンドの切り替わりとして数えません。',
          'ターン時: 選んだトークンがターン順の先頭に来たとき。ボタンをクリックする前に、マップ上でそのトークンを選択してください。',
          'トークンが入る・出る: トークンがエフェクトの範囲、または選択した別のトークンの Aura 1 に出入りしたとき。初期設定では、プレイヤーが操作するトークンだけが対象です。任意のトークンを選ぶことも、名前を指定することもできます。',
          '「まとめて発生」は、エフェクトを一度に数回発生させます。「初回のみ」にすると、トリガーは一度しか作動しません。',
          '別の Mod がトークンを動かしても、Roll20 は Mod に何も知らせません。トークンを動かす Mod は、その後で PageFX.checkToken(token) を呼び出せます。',
        ],
      },
      nullAreas: {
        heading: 'エフェクト除外範囲',
        points: [
          'エフェクト除外範囲とは、どのエフェクトも発生しないトークンのことで、嵐の中の家の内部などに使います。その範囲は、トークン自体とその Aura 1 です。',
          'トークンを選択し、メニューか Command Deck で「エフェクト除外範囲」をクリックします。バージョン 1 と同じく、NullFX という名前のトークンもエフェクト除外範囲になります。',
        ],
      },
      commands: {
        heading: 'コマンド',
        intro:
          'これらのコマンドを使えるのは GM だけです。コマンドは、選択したトークンか、--ids で指定したトークンに対して働きます。レイヤーのコマンドは、--layer で別の指定をしない限りレイヤー 1 に対して働きます。他の Mod からも送信でき、返信は GM に届きます。',
        colCommand: 'コマンド',
        colDesc: '内容',
      },
      settings: {
        heading: '設定',
        intro:
          '設定は「設定」カードか、!pagefx set で変更します。言語（language）は Mod の設定ページでも設定できます。',
        colKey: '設定',
        colDesc: '内容',
        rows: {
          language: 'PageFX のメニュー、メッセージ、ハンドアウトの言語。',
          gmPagePreview: '各 GM が見ているページでもエフェクトを実行します（初期値はオフ）。',
          intensity: 'すべてのエフェクトの発生頻度に掛かる倍率（初期値は 1）。',
          maxSpawnsPerSecond: '1 ページで 1 秒あたりに発生できる最大数。1～60（初期値は 30）。',
        },
      },
      api: {
        heading: '他の Mod 向け',
        intro:
          'PageFX は PageFX オブジェクトを公開しています。トークンを受け取る関数には、トークンの ID を渡すこともできます。',
        colFunction: '関数',
        colDesc: '内容',
        rows: {
          activateAll: 'すべてのエフェクトを再開します（バージョン 1）。',
          deactivateAll: 'すべてのエフェクトを一時停止します（バージョン 1）。',
          activate: '1 つのエフェクトをオン、オフ、または逆の状態にします（バージョン 1）。',
          start: '1 つのエフェクトをオン・オフにするか、一時停止・再開します。',
          setIntensity: '1 つのエフェクトの強度を変更します。',
          fire: '1 つのエフェクトを今すぐ発生させます。',
          create:
            'トークンをエフェクトにします（オプションは name、fx、interval、direction、intensity）。またはエフェクトを外します。',
          getEffect:
            'エフェクトを読み取るか、（1 ページの）エフェクトを一覧にするか、エフェクトが実行中かどうかを調べます。',
          registerPreset: 'このセッション用にプリセットを追加するか、プリセットの一覧を返します。',
          checkToken:
            '自分の Mod が動かしたトークンについて、「トークンが入る」「トークンが出る」トリガーを確認します。',
        },
      },
      upgrading: {
        heading: 'バージョン 1 からのアップグレード',
        points: [
          'PageFX と NullFX という名前のトークンは、初回起動時に引き継がれ、これまでどおり動作します。',
          'チャットからエフェクトを変更するまでは、トークンの GM Notes、Bar 1（発生間隔）、Bar 2（ビームの方向）が引き続きエフェクトを制御し、interdiction マーカーを付けるとオフになります。チャットから変更すると、GM Notes とバーは再び自由に使えるようになります。',
          'バージョン 1 は、プレイヤーリボンのページにしかエフェクトを描画せず、保存済みのカスタム FX を 2 回ずつ発生させていました。どちらも修正済みです。',
          'バージョン 1 のコマンドも引き続き使えます:',
        ],
        colV1: 'バージョン 1 のコマンド',
        colV2: '同等のコマンド',
      },
      troubleshooting: {
        heading: 'トラブルシューティング',
        points: [
          'エフェクトが実行されない: カードを開いてください。「状態」の行に理由が表示されます。オフ、一時停止中、エフェクト未選択、実行できない（理由付き）、または実行対象のページにない（プレイヤーがいない。試すには「GM ページプレビュー」をオンにしてください）のいずれかです。',
          '何も見えない: とても小さい粒子やすぐに消える粒子は、ごちゃごちゃしたマップでは見えにくくなります。プリセットを試すか、強度を上げるか、範囲を小さくしてください。',
          'エフェクトがまばら: ページが「毎秒最大発生数」に達しているかもしれません。いくつかのエフェクトの強度を下げるか、上限を上げてください。',
          'ページやゲームをコピーした後にエフェクトが止まった: 「再スキャン」を実行してください。',
          'それ以外の場合は、API コンソールのログを確認し、助けを求めるときにそのメッセージを添えてください。',
        ],
      },
      languages: {
        heading: '言語',
        body: '言語は「設定」カードか、!pagefx set language で選びます。利用できる言語:',
        colLanguage: '言語',
        colNative: 'その言語での名前',
        colCode: 'コード',
      },
      credits: {
        heading: 'クレジット',
        original: 'オリジナルの Mod の作者:',
        maintainer: 'バージョン 2 の保守担当:',
        marketplace: 'Roll20 マーケットプレイスの Ada のアートパック',
        support:
          'バグを見つけたり、アイデアがあったりしたら、Roll20 の Mod フォーラムに投稿するか GitHub で issue を作成してください。その際は API コンソールのログにあるメッセージも添えてください。',
      },
    },
    triggers: {
      line: '{when}: {action}',
      eachRound: '新しいラウンドごと',
      everyRounds: '{n} ラウンドごと',
      onRound: '{n} ラウンド目',
      turn: '{name} のターン開始時',
      enter: '{who}が{area}に入ったとき',
      leave: '{who}が{area}から出たとき',
      areaSelf: 'このエフェクトの範囲',
      areaSelected: '選択したトークンのオーラ',
      areaOf: '{name} のオーラ',
      unnamed: 'トークン',
      once: '（初回のみ）',
      onceUsed: '（初回のみ、使用済み）',
      who: {
        players: 'プレイヤーのトークン',
        all: '任意のトークン',
      },
      action: {
        start: '開始する',
        stop: '停止する',
        toggle: 'オン・オフを切り替える',
        fire: '1 回発生させる',
        burst: '{count} 回まとめて発生させる',
      },
      choice: {
        start: '開始',
        stop: '停止',
        toggle: 'オン・オフ切り替え',
        fire: '1 回発生',
        burst: 'まとめて発生',
      },
    },
    packs: {
      weather: '天候',
      fire: '炎と熱',
      water: '水',
      magic: '魔法と怪異',
      custom: '他の Mod から',
    },
    presets: {
      'light-rain': '小雨',
      'heavy-rain': '大雨',
      thunderstorm: '雷雨',
      snow: '雪',
      blizzard: '吹雪',
      hail: '雹',
      sandstorm: '砂嵐',
      fog: '漂う霧',
      embers: '舞う火の粉',
      ash: '降り注ぐ灰',
      magma: '煮えたぎるマグマ',
      'lava-spurts': '噴き出す溶岩',
      sparks: '火花',
      drips: '洞窟のしずく',
      steam: '噴き出す蒸気',
      geyser: '間欠泉',
      spray: '滝のしぶき',
      bubbles: '泡',
      fireflies: 'ホタル',
      'arcane-motes': '魔力の光の粒',
      'necrotic-mist': '死霊の霧',
      'holy-glimmer': '聖なるきらめき',
      'swamp-gas': '沼のガス',
    },
    fx: {
      empty: 'エフェクトが設定されていません。',
      badJson: 'カスタム FX の定義が正しい JSON ではありません。',
      unknownColour: '組み込みの色「{colour}」はありません。使える色: {colours}。',
      savedMissing: '「{name}」という保存済みのカスタム FX はありません。',
      cannotCreate: 'Roll20 がカスタム FX オブジェクトを作成しませんでした。',
      spawnFailed: 'Roll20 が発生させませんでした（{message}）。',
    },
    errors: {
      unknownCommand: '不明なコマンド: {command}',
      noEffects: 'PageFX のトークンを 1 つ以上選択するか、--ids で ID を指定してください。',
      selectToken: '先にトークンを 1 つ以上選択するか、--ids で ID を指定してください。',
      unknownIds: '次のものは PageFX のエフェクトではありません: {ids}',
      badSetting: '不明な設定または値です: {setting} {value}',
      noLayer: '「{name}」にレイヤー {n} はありません。',
      tooManyLayers: '1 つのエフェクトに設定できるレイヤーは最大 {max} 個です。',
      layerUsage:
        '!pagefx layer add [effect] または !pagefx layer remove <number> を使ってください。',
      nullUsage: '!pagefx null create または !pagefx null remove を使ってください。',
      isEffect: '「{name}」はエフェクトなので、エフェクト除外範囲にはできません。',
      badInterval: '発生間隔をミリ秒で指定してください。例: !pagefx interval 500 1500',
      badDirection:
        'random か、横方向と下方向のマス数を指定してください。例: !pagefx direction 2 -1',
      badArea:
        'ページ単位の半径と、circle か square を指定してください。例: !pagefx area 15 circle',
      badIntensity: '0 より大きい強度を指定してください。例: !pagefx intensity 1.5',
      noName: '名前を指定してください。例: !pagefx name 波止場に降る雨',
      triggerUsage:
        '!pagefx trigger add <round|turn|enter|leave> <start|stop|toggle|fire|burst> [every=2] [round=3] [count=5] [who=players|all|named] [names=A;B] [area=self|selected] [once] か、!pagefx trigger remove <number> を使ってください。',
      triggerToken:
        'このトリガーの対象となるトークンを先にマップ上で選択するか、token=<id> を指定してください。',
      triggerNames: 'names= でトークン名を ; で区切って指定してください（例: names=Goblin;Orc）。',
      tooManyTriggers: '1 つのエフェクトに設定できるトリガーは最大 {max} 個です。',
      noTrigger: '「{name}」にトリガー {n} はありません。',
      journalUsage: '!pagefx journal rebuild を使ってください。',
      unknownPreset:
        'プリセット「{id}」はありません。!pagefx presets と入力すると一覧が表示されます。',
      unexpected: '問題が発生しました: {message}',
    },
  };

  var localeKo = {
    titles: {
      ready: 'PageFX가 준비되었습니다.',
      menu: 'PageFX',
      status: 'PageFX 상태',
      settings: 'PageFX 설정',
      presets: 'PageFX 프리셋',
      help: 'PageFX 명령',
      effect: '효과: {name}',
    },
    messages: {
      readyHint: '!pagefx 를 입력하면 메뉴가 열립니다.',
      adopted:
        'PageFX 1.x 토큰에서 효과 {effects}개와 효과 제외 영역 {nulls}개를 넘겨받았습니다. 이전처럼 계속 작동합니다.',
      rescanned:
        '다시 스캔해서 새 효과 {effects}개와 새 효과 제외 영역 {nulls}개를 찾았고, 토큰이 삭제된 {dropped}개는 목록에서 지웠습니다.',
      allPaused:
        '모든 효과가 일시 정지되었습니다. 다시 시작하려면 !pagefx resume 명령을 사용하세요.',
      allResumed: '효과가 다시 실행됩니다.',
      turnedOn: '켬: {count}.',
      turnedOff: '끔: {count}.',
      toggled: '켜기/끄기 전환: {count}.',
      paused: '일시 정지: {count}.',
      resumed: '재개: {count}.',
      fired: '효과 {count}개를 생성했습니다.',
      created: '새 효과: {count}. 각 효과의 카드에서 무엇을 생성할지 고르세요.',
      deleted: '제거한 효과: {count}. 토큰은 지도에 그대로 남아 있습니다.',
      renamed: '이름 변경: {count}.',
      fxSet: '효과 변경: {count}.',
      intervalSet: '타이밍 변경: {count}.',
      directionSet: '방향 변경: {count}.',
      areaSet: '영역 변경: {count}.',
      intensitySet: '강도 변경: {count}.',
      layerAdded: '레이어 추가: {count}.',
      layerRemoved: '레이어 제거: {count}.',
      nullCreated: '새 효과 제외 영역: {count}.',
      nullRemoved: '제거한 효과 제외 영역: {count}.',
      presetApplied: '{name} 적용: {count}.',
      journalRebuilt: '"{help}" 핸드아웃과 "{deck}" 핸드아웃을 다시 만들었습니다.',
      triggerAdded: '트리거 추가: {count}.',
      triggerRemoved: '트리거 제거: {count}.',
      triggersCleared: '효과 {count}개에서 트리거를 제거했습니다.',
      throttled:
        '"{page}" 페이지의 효과를 줄이고 있습니다. 초당 {max}회보다 많은 생성을 요청했기 때문입니다. 효과의 강도를 낮추거나 !pagefx set maxSpawnsPerSecond 명령으로 한도를 올리세요.',
      settingChanged: '{setting} 값이 이제 {value}입니다.',
      problem: '"{name}" 효과를 실행할 수 없습니다: {reason}',
    },
    menu: {
      page: '페이지',
      live: '여기서 효과 실행 중',
      notLive: '여기에 플레이어 없음',
      allPausedNote: '모든 효과가 일시 정지되어 있습니다.',
      effectsHere: '이 페이지의 효과',
      noEffectsHere: '이 페이지에는 아직 효과가 없습니다.',
      otherPages: '다른 페이지',
      effectCount: '효과 {count}개',
      actions: '새로 만들기',
      selectHint:
        '먼저 지도에서 토큰을 선택한 다음 새 효과 또는 효과 제외 영역을 누르세요. 토큰은 효과가 나타나는 위치를 표시하고, 토큰의 Aura 1이 영역이 됩니다.',
      state: '상태',
      area: '영역',
      areaValue: '토큰 바깥으로 {radius} {units}, {shape}',
      circle: '원형',
      square: '사각형',
      circleOption: '원형',
      squareOption: '사각형',
      layers: '레이어',
      layer: '레이어 {n}',
      noLayers: '레이어가 없습니다. 레이어를 추가해서 이 효과가 무엇을 생성할지 고르세요.',
      noFxSet: '설정 안 됨',
      timing: '{min}–{max}ms마다',
      directionRandom: '무작위 방향',
      directionOffset: '가로 {dx}칸, 세로 {dy}칸 떨어진 곳에서 끝남',
      v1Note:
        '이 효과는 PageFX 1.x에서처럼 아직 토큰의 GM 메모("GM Notes")와 바를 따릅니다. 여기서 변경하면 더 이상 따르지 않습니다.',
      preset: '프리셋',
      presetsHint:
        '지도에서 토큰을 하나 이상 선택한 다음 프리셋을 누르세요. 아직 효과가 아닌 토큰은 효과가 되고, 그 토큰의 Aura 1이 프리셋이 채우는 영역이 됩니다.',
      triggers: '트리거',
      noTriggers: '트리거 없음: 플레이어가 이 페이지에 있으면 항상 효과가 실행됩니다.',
      triggerHint:
        '턴 트리거를 만들거나 다른 토큰의 영역을 쓰려면 먼저 지도에서 그 토큰을 선택하세요.',
      yes: '예',
      no: '아니요',
    },
    buttons: {
      edit: '편집',
      show: '보기',
      turnOn: '켜기',
      turnOff: '끄기',
      pause: '일시 정지',
      resume: '재개',
      fire: '발동',
      pauseAll: '모두 일시 정지',
      resumeAll: '모두 재개',
      create: '새 효과',
      createNull: '효과 제외 영역',
      removeNull: '효과 제외 영역 해제',
      settings: '설정',
      status: '상태',
      rescan: '다시 스캔',
      rename: '이름 변경',
      area: '영역',
      intensity: '강도',
      builtin: '내장 FX',
      saved: '저장된 FX',
      json: '사용자 지정 JSON',
      timing: '타이밍',
      random: '무작위 방향',
      offset: '방향 지정',
      addLayer: '레이어 추가',
      removeLayer: '레이어 제거',
      delete: '효과 삭제',
      preset: '프리셋',
      presets: '프리셋',
      remove: '제거',
      help: '도움말',
      rebuild: '핸드아웃 다시 만들기',
      onRound: '라운드마다',
      onTurn: '턴에',
      onEnter: '토큰 진입',
      onLeave: '토큰 이탈',
      menu: '메뉴',
      change: '변경',
    },
    prompts: {
      type: '효과 종류',
      colour: '색상',
      saved: '저장된 사용자 지정 FX',
      json: '사용자 지정 FX 정의(JSON)',
      intervalMin: '생성 사이의 최단 시간(ms)',
      intervalMax: '생성 사이의 최장 시간(ms)',
      dx: '끝점까지 가로 칸 수(음수는 왼쪽)',
      dy: '끝점까지 세로 칸 수(음수는 위쪽)',
      name: '효과 이름',
      radius: '토큰 바깥으로의 영역 반경(페이지 단위)',
      shape: '영역 모양',
      intensity: '강도({min}~{max})',
      maxSpawns: '한 페이지의 초당 생성 수(1~{max})',
      preset: '프리셋',
      then: '그다음',
      every: '몇 라운드마다',
      who: '어떤 토큰을 셀까요',
      area: '어느 영역',
      once: '처음 한 번만 작동할까요?',
      confirmDelete: '이 효과를 삭제할까요? 토큰은 지도에 남습니다.',
    },
    settings: {
      language: '언어',
      globalIntensity: '모든 효과의 강도',
      gmPreviewHint: '켜면 플레이어가 없어도 각 GM이 보고 있는 페이지에서도 효과가 실행됩니다.',
      maxSpawnsHint:
        '이보다 많이 요청하는 페이지에서는 효과를 줄입니다. Roll20은 약 60까지는 부드럽게 동작합니다.',
    },
    status: {
      livePages: '활성 페이지',
      effects: '효과',
      running: '실행 중',
      globalPause: '모두 일시 정지됨',
      on: '켜짐',
      off: '꺼짐',
      pausedState: '일시 정지됨',
      waiting: '활성 페이지에 없음',
      noFx: '선택한 효과 없음',
      broken: '실행할 수 없음',
      nullAreas: '효과 제외 영역',
      noEffects:
        '아직 효과가 없습니다. 토큰을 선택하고 !pagefx create 를 입력하거나, !pagefx 로 메뉴를 여세요.',
      gmPreview: 'GM 페이지 미리 보기',
      intensity: '강도',
      maxSpawns: '페이지당 초당 최대 생성 수',
    },
    help: {
      menu: '메뉴를 엽니다. 내 페이지의 효과와 나머지 모든 기능의 버튼이 나옵니다.',
      create:
        '선택한 토큰을 효과로 만듭니다. 토큰의 Aura 1이 영역이 되며, 없으면 하나를 추가합니다.',
      edit: '선택한 각 효과의 카드를 변경용 버튼과 함께 보여 줍니다.',
      preset: '선택한 토큰에 프리셋을 적용합니다. 필요하면 먼저 효과로 만듭니다.',
      presets: '프리셋을 팩별로 나열합니다.',
      switches:
        '선택한 효과를 켜거나 끄고, 일시 정지하거나 재개합니다. 아무것도 선택하지 않으면 on과 resume은 모든 효과를 다시 시작하고 off와 pause는 모든 효과를 멈춥니다(버전 1에서 !pageFX on 과 off 가 하던 것처럼).',
      fire: '선택한 효과를 지금 한 번 또는 몇 번 생성해서 시험해 봅니다.',
      fx: '레이어가 생성할 것을 지정합니다. burn-fire 같은 내장 효과, 저장된 사용자 지정 FX의 이름, 또는 JSON으로 된 사용자 지정 FX 정의를 쓸 수 있습니다.',
      interval:
        '레이어의 생성 간격을 밀리초 단위로 지정합니다. 매번 두 값 사이에서 대기 시간을 고릅니다.',
      direction:
        '빔 형태의 효과에서 각 생성이 끝나는 곳을 지정합니다. random 또는 시작점에서 가로와 세로로 몇 칸인지를 씁니다.',
      area: '영역을 지정합니다. 토큰의 Aura 1 반경(페이지 단위)과 모양입니다.',
      intensity:
        '선택한 효과의 생성 빈도에 배수를 곱합니다(0.1~5). global을 쓰면 모든 효과에 적용됩니다.',
      name: '선택한 효과의 이름을 바꿉니다.',
      layer: '레이어를 추가해서 한 효과가 여러 가지를 생성하게 하거나, 레이어를 하나 제거합니다.',
      triggerAdd:
        '트리거를 추가합니다. round, turn, enter 또는 leave 때 start, stop, toggle, fire 또는 burst를 실행합니다. 옵션: every=2, round=3, count=5, who=players|all|named, names=A;B, area=selected, once.',
      triggerRemove: '선택한 효과에서 트리거를 하나 또는 모두 제거합니다.',
      null: '선택한 토큰을 어떤 효과도 생성되지 않는 효과 제외 영역으로 만들거나, 효과 제외 영역에서 해제합니다.',
      delete: '선택한 토큰에서 효과를 없앱니다. 토큰은 지도에 남습니다.',
      status: '모든 효과와 그 페이지, 실행 여부를 나열합니다.',
      settings: '설정을 보여 줍니다.',
      set: '설정을 변경합니다: language, gmPagePreview, intensity 또는 maxSpawnsPerSecond.',
      rescan:
        'PageFX 또는 NullFX라는 이름의 새 토큰을 넘겨받고, 토큰이 삭제된 효과는 목록에서 지웁니다.',
      journal: '도움말 핸드아웃과 Command Deck 핸드아웃을 다시 만듭니다.',
      help: '이 목록을 보여 줍니다.',
      handout:
        '전체 설명은 "{help}" 핸드아웃에 있고, 클릭 한 번으로 쓰는 버튼은 "{deck}"에 있습니다.',
    },
    deck: {
      menuTitle: '메뉴',
      menuDesc: '메인 메뉴에는 내 페이지의 효과가 나옵니다. 상태에는 모든 효과가 나옵니다.',
      newTitle: '새로 만들기',
      newDesc:
        '먼저 지도에서 토큰을 하나 이상 선택하세요. 토큰의 Aura 1이 효과가 채우는 영역이 됩니다.',
      selectedTitle: '선택한 효과',
      selectedDesc: '지도에서 효과 토큰을 선택한 다음 버튼을 누르세요.',
      allTitle: '전체',
      allDesc: '모든 효과를 멈추거나 모두 다시 시작합니다.',
      toolsTitle: '도구',
      toolsDesc: '복사되거나 삭제된 토큰을 반영하고, 이 핸드아웃들을 다시 만듭니다.',
      footer: '전체 설명은 "{help}" 핸드아웃을 보세요.',
    },
    handout: {
      versionLabel: '버전',
      subtitle: 'Roll20 지도용 날씨 및 분위기 효과',
      footer: '클릭 한 번으로 조작하려면 "{deck}" 핸드아웃을 사용하세요.',
      overview: {
        heading: '개요',
        body: 'PageFX는 지도의 한 영역을 비, 눈, 불씨, 증기, 반딧불이 같은 계속 이어지는 효과로 채웁니다. 토큰이 각 효과의 위치를 표시하고, 토큰의 Aura 1이 영역이 됩니다. 효과는 플레이어가 있는 모든 페이지에서 실행되며, 파티가 나뉘어 일부가 보내진 페이지도 포함됩니다. 플레이어가 떠나면 효과는 멈춥니다. 모든 설정은 채팅 메뉴에서 하며, 트리거를 쓰면 전투 라운드가 지나거나 토큰이 움직일 때 효과를 시작하거나 멈출 수 있습니다.',
        demo: '짧은 데모 영상 보기(버전 1)',
      },
      quickStart: {
        heading: '빠른 시작',
        steps: [
          '효과가 나타날 곳에 토큰을 놓고(GM 레이어에 두면 플레이어에게 보이지 않습니다) 선택하세요.',
          '!pagefx presets 를 입력하거나 Command Deck을 열어 프리셋을 클릭한 다음, 폭우 같은 프리셋을 클릭하세요.',
          '토큰의 Aura 1 크기를 조절해서 효과가 채울 영역을 정하세요. 오라는 플레이어에게 보이지 않습니다.',
          '플레이어를 그 페이지로 옮기세요. 효과가 시작되고, 플레이어가 떠나면 다시 멈춥니다.',
          '!pagefx 를 입력해서 메뉴를 열고, 효과의 편집을 클릭해서 효과를 변경하세요.',
        ],
      },
      effects: {
        heading: '효과',
        points: [
          '효과는 토큰과 PageFX가 저장하는 설정으로 이루어집니다. 토큰을 옮기면 효과가 옮겨지고, Aura 1을 바꾸면 영역이 바뀝니다. 토큰을 삭제하면 효과도 삭제됩니다.',
          '각 효과에는 레이어가 하나 이상 있습니다. 각 레이어는 한 가지를 계속 반복해서 생성하며, 매번 최단 시간과 최장 시간 사이에서 무작위로 기다립니다.',
          '레이어는 Roll20 내장 효과(burn-fire처럼 종류와 색상), 게임에 저장된 사용자 지정 FX, 또는 JSON으로 붙여 넣은 사용자 지정 FX 정의를 생성할 수 있습니다. 정의에서 빠진 값은 채워 주므로 짧은 정의도 그려집니다.',
          '빔 형태의 효과(beam, breath, splatter, 그리고 angle이 -1인 사용자 지정 FX)는 두 점 사이에 그려집니다. 방향은 무작위이거나, 가로와 세로로 정해진 칸 수만큼입니다.',
          '강도는 효과가 생성되는 빈도에 배수를 곱합니다. intensity 설정은 모든 효과에 배수를 곱합니다.',
          '끄기는 다시 켤 때까지 효과를 멈춥니다. 일시 정지는 재개할 때까지 효과를 멈춰 둡니다. 모두 일시 정지는 효과를 바꾸지 않고 모든 효과를 멈춰 둡니다.',
          'Jumpgate는 사용자 지정 FX로 저장되지 않은 사용자 지정 FX 정의를 흰색으로 그립니다. 그래서 PageFX는 자체 정의를 “PageFX: …”라는 이름의 사용자 지정 FX로 저장합니다. 이 FX는 사용하는 효과가 없으면 제거되니, 그대로 두세요.',
        ],
      },
      pages: {
        heading: '효과가 실행되는 페이지',
        points: [
          '효과는 플레이어 리본이 있는 페이지와, 플레이어가 개별적으로 옮겨진 모든 페이지에서 실행됩니다.',
          'GM 페이지 미리 보기를 켜면 각 GM이 보고 있는 페이지에서도 효과가 실행되므로, 플레이어 없이 효과를 시험해 볼 수 있습니다.',
          '각 페이지는 초당 최대 생성 수(기본값 30)까지만 생성합니다. 효과가 이보다 많이 요청하면 일부 생성을 건너뛰고, GM에게 한 번 알립니다.',
          '다른 Mod가 리본을 옮기거나 파티를 나누면 Roll20이 아무에게도 알리지 않으므로, PageFX가 몇 초마다 확인해서 따라잡습니다.',
        ],
      },
      presets: {
        heading: '프리셋',
        intro:
          '프리셋은 효과에 미리 만들어진 레이어 묶음을 넣어 줍니다. 그 뒤에 레이어를 바꾸면 그 효과는 직접 만든 효과가 됩니다. 다른 Mod는 PageFX.registerPreset으로 프리셋을 추가할 수 있습니다.',
        colPack: '팩',
        colPresets: '프리셋(이름과 ID)',
      },
      triggers: {
        heading: '트리거',
        intro:
          '트리거는 어떤 일이 일어나면 효과를 시작하거나, 멈추거나, 켜고 끄거나, 발동합니다. 효과의 카드에서 추가하거나 !pagefx trigger add 명령으로 추가하세요.',
        points: [
          '라운드마다: Roll20은 라운드 번호를 기록하지 않으므로, 턴 순서가 마지막 항목에서 맨 위로 돌아올 때 새 라운드가 시작됩니다. “Round”라는 이름의 사용자 지정 턴 순서 항목이 있으면 그 항목을 대신 사용합니다. 몇 라운드마다 또는 특정 라운드 한 번을 고를 수 있습니다. 전투의 첫 라운드는 바뀐 것으로 치지 않습니다.',
          '턴에: 선택한 토큰이 턴 순서의 맨 위에 올 때입니다. 버튼을 클릭하기 전에 지도에서 그 토큰을 선택하세요.',
          '토큰 진입 또는 이탈: 토큰이 효과의 영역이나, 선택한 다른 토큰의 Aura 1 안으로 들어오거나 밖으로 나갈 때입니다. 기본적으로 플레이어가 조종하는 토큰만 셉니다. 모든 토큰을 고르거나 이름을 지정할 수도 있습니다.',
          '연속 발동은 효과를 한꺼번에 여러 번 생성합니다. 처음 한 번만을 고르면 트리거가 한 번만 작동합니다.',
          '다른 Mod가 토큰을 옮기면 Roll20은 Mod에 아무것도 알리지 않습니다. 토큰을 옮기는 Mod는 그 뒤에 PageFX.checkToken(token)을 호출하면 됩니다.',
        ],
      },
      nullAreas: {
        heading: '효과 제외 영역',
        points: [
          '효과 제외 영역은 폭풍 속 집 안처럼 어떤 효과도 생성되지 않는 토큰입니다. 영역은 토큰 자체와 그 Aura 1입니다.',
          '토큰을 선택하고 메뉴나 Command Deck에서 효과 제외 영역을 클릭하세요. 버전 1처럼 NullFX라는 이름의 토큰도 효과 제외 영역이 됩니다.',
        ],
      },
      commands: {
        heading: '명령',
        intro:
          '이 명령은 GM만 사용할 수 있습니다. 명령은 선택한 토큰이나 --ids로 지정한 토큰에 적용됩니다. 레이어 명령은 --layer로 따로 지정하지 않으면 레이어 1에 적용됩니다. 다른 Mod도 이 명령을 보낼 수 있으며, 응답은 GM에게 갑니다.',
        colCommand: '명령',
        colDesc: '기능',
      },
      settings: {
        heading: '설정',
        intro:
          '설정 카드에서 또는 !pagefx set 명령으로 설정을 변경하세요. 언어는 Mod 설정 페이지에서도 정할 수 있습니다.',
        colKey: '설정',
        colDesc: '기능',
        rows: {
          language: 'PageFX의 메뉴, 메시지, 핸드아웃 언어입니다.',
          gmPagePreview: '각 GM이 보고 있는 페이지에서도 효과를 실행합니다(기본값 꺼짐).',
          intensity: '모든 효과의 생성 빈도에 곱하는 배수입니다(기본값 1).',
          maxSpawnsPerSecond:
            '한 페이지에서 초당 생성할 수 있는 최대 횟수로, 1~60입니다(기본값 30).',
        },
      },
      api: {
        heading: '다른 Mod용',
        intro: 'PageFX는 PageFX 객체를 공개합니다. 토큰을 받는 함수에는 토큰의 ID를 넘겨도 됩니다.',
        colFunction: '함수',
        colDesc: '기능',
        rows: {
          activateAll: '모든 효과를 재개합니다(버전 1).',
          deactivateAll: '모든 효과를 일시 정지합니다(버전 1).',
          activate: '효과 하나를 켜거나, 끄거나, 반대 상태로 바꿉니다(버전 1).',
          start: '효과 하나를 켜거나 끄고, 일시 정지하거나 재개합니다.',
          setIntensity: '효과 하나의 강도를 변경합니다.',
          fire: '효과 하나를 지금 생성합니다.',
          create:
            '토큰을 효과로 만들거나(옵션: name, fx, interval, direction, intensity) 토큰에서 효과를 없앱니다.',
          getEffect:
            '효과 하나를 읽거나, (한 페이지의) 효과를 나열하거나, 효과가 실행 중인지 확인합니다.',
          registerPreset: '이번 세션에 프리셋을 추가하거나 프리셋을 나열합니다.',
          checkToken: '내 Mod가 옮긴 토큰을 진입 및 이탈 트리거에 대해 확인합니다.',
        },
      },
      upgrading: {
        heading: '버전 1에서 업그레이드',
        points: [
          'PageFX와 NullFX라는 이름의 토큰은 처음 시작할 때 넘겨받으며, 이전처럼 계속 작동합니다.',
          '채팅에서 효과를 변경하기 전까지는 토큰의 GM 메모("GM Notes"), "Bar 1"(생성 간격), "Bar 2"(빔 방향)가 계속 효과를 제어하고, 금지(interdiction) 마커로 여전히 효과를 끌 수 있습니다. 채팅에서 한 번 변경하면 GM 메모와 바는 다시 자유롭게 쓸 수 있습니다.',
          '버전 1은 플레이어 리본 페이지에만 효과를 그렸고, 저장된 사용자 지정 FX를 두 번씩 생성했습니다. 둘 다 고쳐졌습니다.',
          '버전 1 명령도 그대로 작동합니다.',
        ],
        colV1: '버전 1 명령',
        colV2: '같은 명령',
      },
      troubleshooting: {
        heading: '문제 해결',
        points: [
          '효과가 실행되지 않을 때: 효과의 카드를 여세요. 상태 줄에 이유가 나옵니다. 꺼짐, 일시 정지됨, 선택한 효과 없음, 실행할 수 없음(이유 포함), 또는 활성 페이지에 없음(플레이어가 없는 경우로, 시험하려면 GM 페이지 미리 보기를 켜세요)입니다.',
          '아무것도 보이지 않을 때: 아주 작거나 금방 사라지는 입자는 복잡한 지도에서 잘 보이지 않습니다. 프리셋을 써 보거나, 강도를 높이거나, 영역을 더 작게 만드세요.',
          '효과가 듬성듬성해 보일 때: 페이지가 초당 최대 생성 수에 도달했을 수 있습니다. 일부 효과의 강도를 낮추거나 한도를 올리세요.',
          '페이지나 게임을 복사한 뒤 효과가 멈췄을 때: 다시 스캔을 실행하세요.',
          '그 밖의 문제는 API 콘솔 로그를 확인하고, 도움을 요청할 때 로그의 메시지를 함께 알려 주세요.',
        ],
      },
      languages: {
        heading: '언어',
        body: '설정 카드에서 또는 !pagefx set language 명령으로 언어를 고르세요. 사용할 수 있는 언어:',
        colLanguage: '언어',
        colNative: '현지어 이름',
        colCode: '코드',
      },
      credits: {
        heading: '만든 사람',
        original: '원작 Mod 제작:',
        maintainer: '버전 2 관리:',
        marketplace: 'Roll20 마켓플레이스의 Ada 아트 팩',
        support:
          '버그를 발견했거나 아이디어가 있으면 Roll20 Mod 포럼에 글을 올리거나 GitHub에 이슈를 열어 주세요. API 콘솔 로그의 메시지도 함께 알려 주세요.',
      },
    },
    triggers: {
      line: '{when}: {action}',
      eachRound: '새 라운드마다',
      everyRounds: '{n}라운드마다',
      onRound: '{n}라운드에',
      turn: '{name}의 턴이 시작될 때',
      enter: '{who}이(가) {area}에 들어올 때',
      leave: '{who}이(가) {area}에서 나갈 때',
      areaSelf: '이 효과의 영역',
      areaSelected: '선택한 토큰의 오라',
      areaOf: '{name}의 오라',
      unnamed: '토큰',
      once: '(처음 한 번만)',
      onceUsed: '(처음 한 번만, 이미 사용됨)',
      who: {
        players: '플레이어 토큰',
        all: '아무 토큰',
      },
      action: {
        start: '시작',
        stop: '정지',
        toggle: '켜기/끄기 전환',
        fire: '한 번 발동',
        burst: '{count}회 연속 발동',
      },
      choice: {
        start: '시작',
        stop: '정지',
        toggle: '켜기/끄기 전환',
        fire: '한 번 발동',
        burst: '연속 발동',
      },
    },
    packs: {
      weather: '날씨',
      fire: '불과 열기',
      water: '물',
      magic: '마법과 기이함',
      custom: '다른 Mod',
    },
    presets: {
      'light-rain': '가랑비',
      'heavy-rain': '폭우',
      thunderstorm: '뇌우',
      snow: '눈',
      blizzard: '눈보라',
      hail: '우박',
      sandstorm: '모래 폭풍',
      fog: '안개 자락',
      embers: '불씨',
      ash: '떨어지는 재',
      magma: '끓어오르는 마그마',
      'lava-spurts': '용암 분출',
      sparks: '불티',
      drips: '동굴 물방울',
      steam: '증기 분출구',
      geyser: '간헐천',
      spray: '폭포 물보라',
      bubbles: '거품',
      fireflies: '반딧불이',
      'arcane-motes': '비전 입자',
      'necrotic-mist': '사령 안개',
      'holy-glimmer': '신성한 빛',
      'swamp-gas': '늪 가스',
    },
    fx: {
      empty: '설정된 효과가 없습니다.',
      badJson: '사용자 지정 FX 정의가 올바른 JSON이 아닙니다.',
      unknownColour: '"{colour}"라는 내장 색상이 없습니다. 색상: {colours}.',
      savedMissing: '"{name}"라는 이름으로 저장된 사용자 지정 FX가 없습니다.',
      cannotCreate: 'Roll20이 이 효과용 사용자 지정 FX 객체를 만들지 않았습니다.',
      spawnFailed: 'Roll20이 효과를 생성하지 않았습니다({message}).',
    },
    errors: {
      unknownCommand: '알 수 없는 명령: {command}',
      noEffects: 'PageFX 토큰을 하나 이상 선택하거나, --ids로 토큰 ID를 지정하세요.',
      selectToken: '먼저 토큰을 하나 이상 선택하거나, --ids로 토큰 ID를 지정하세요.',
      unknownIds: '다음은 PageFX 효과가 아닙니다: {ids}',
      badSetting: '알 수 없는 설정 또는 값: {setting} {value}',
      noLayer: '"{name}"에는 레이어 {n}이(가) 없습니다.',
      tooManyLayers: '효과 하나에 레이어는 최대 {max}개까지 둘 수 있습니다.',
      layerUsage:
        '!pagefx layer add [effect] 또는 !pagefx layer remove <number> 형식으로 사용하세요.',
      nullUsage: '!pagefx null create 또는 !pagefx null remove 형식으로 사용하세요.',
      isEffect: '"{name}"은(는) 효과이므로 효과 제외 영역이 될 수 없습니다.',
      badInterval: '생성 간격을 ms 단위로 지정하세요. 예: !pagefx interval 500 1500',
      badDirection: 'random 또는 가로와 세로 칸 수를 지정하세요. 예: !pagefx direction 2 -1',
      badArea: '페이지 단위의 반경과 circle 또는 square를 지정하세요. 예: !pagefx area 15 circle',
      badIntensity: '0보다 큰 강도를 지정하세요. 예: !pagefx intensity 1.5',
      noName: '이름을 지정하세요. 예: !pagefx name 부두 위의 비',
      triggerUsage:
        '!pagefx trigger add <round|turn|enter|leave> <start|stop|toggle|fire|burst> [every=2] [round=3] [count=5] [who=players|all|named] [names=A;B] [area=self|selected] [once] 또는 !pagefx trigger remove <number> 형식으로 사용하세요.',
      triggerToken: '먼저 지도에서 이 트리거의 대상 토큰을 선택하거나, token=<id>를 지정하세요.',
      triggerNames: 'names=로 토큰 이름을 지정하고 ;로 구분하세요(예: names=Goblin;Orc).',
      tooManyTriggers: '효과 하나에 트리거는 최대 {max}개까지 둘 수 있습니다.',
      noTrigger: '"{name}"에는 트리거 {n}이(가) 없습니다.',
      journalUsage: '!pagefx journal rebuild 형식으로 사용하세요.',
      unknownPreset: '"{id}" 프리셋이 없습니다. !pagefx presets 를 입력하면 목록을 볼 수 있습니다.',
      unexpected: '문제가 발생했습니다: {message}',
    },
  };

  const TRANSLATION = {
    titles: {
      ready: 'PageFX jest gotowy.',
      menu: 'PageFX',
      status: 'Stan PageFX',
      settings: 'Ustawienia PageFX',
      presets: 'Presety PageFX',
      help: 'Polecenia PageFX',
      effect: 'Efekt: {name}',
    },
    messages: {
      readyHint: 'Wpisz !pagefx, aby otworzyć menu.',
      adopted:
        'Przejęto z żetonów PageFX 1.x efekty ({effects}) i obszary bez efektów ({nulls}). Działają dalej tak jak wcześniej.',
      rescanned:
        'Ponowne skanowanie znalazło nowe efekty ({effects}) i nowe obszary bez efektów ({nulls}) oraz zapomniało efekty ({dropped}), których żetony usunięto.',
      allPaused: 'Wszystkie efekty są wstrzymane. Użyj !pagefx resume, aby uruchomić je ponownie.',
      allResumed: 'Efekty znów działają.',
      turnedOn: 'Włączono: {count}.',
      turnedOff: 'Wyłączono: {count}.',
      toggled: 'Włączono lub wyłączono: {count}.',
      paused: 'Wstrzymano: {count}.',
      resumed: 'Wznowiono: {count}.',
      fired: 'Wywołane efekty: {count}.',
      created: 'Nowe efekty: {count}. Na karcie każdego z nich wybierz, co ma wywoływać.',
      deleted: 'Usunięte efekty: {count}. Ich żetony nadal są na mapie.',
      renamed: 'Zmieniono nazwę: {count}.',
      fxSet: 'Zmieniono efekt: {count}.',
      intervalSet: 'Zmieniono czas: {count}.',
      directionSet: 'Zmieniono kierunek: {count}.',
      areaSet: 'Zmieniono obszar: {count}.',
      intensitySet: 'Zmieniono intensywność: {count}.',
      layerAdded: 'Dodano warstwę: {count}.',
      layerRemoved: 'Usunięto warstwę: {count}.',
      nullCreated: 'Nowe obszary bez efektów: {count}.',
      nullRemoved: 'Usunięte obszary bez efektów: {count}.',
      presetApplied: 'Zastosowano {name}: {count}.',
      journalRebuilt: 'Handouty „{help}” i „{deck}” zostały odbudowane.',
      triggerAdded: 'Dodano wyzwalacz: {count}.',
      triggerRemoved: 'Usunięto wyzwalacz: {count}.',
      triggersCleared: 'Usunięto wyzwalacze z efektów: {count}.',
      throttled:
        'Efekty na stronie „{page}” są przerzedzane: żądały więcej niż {max} wywołań na sekundę. Obniż ich intensywność albo podnieś limit poleceniem !pagefx set maxSpawnsPerSecond.',
      settingChanged: '{setting} ma teraz wartość {value}.',
      problem: 'Efekt „{name}” nie może działać: {reason}',
    },
    menu: {
      page: 'Strona',
      live: 'efekty działają tutaj',
      notLive: 'brak graczy',
      allPausedNote: 'Wszystkie efekty są wstrzymane.',
      effectsHere: 'Efekty na tej stronie',
      noEffectsHere: 'Na tej stronie nie ma jeszcze efektów.',
      otherPages: 'Inne strony',
      effectCount: 'efekty: {count}',
      actions: 'Nowy',
      selectHint:
        'Najpierw zaznacz żeton na mapie, a potem naciśnij Nowy efekt lub Obszar bez efektów. Żeton wyznacza miejsce efektu; jego „Aura 1” to obszar.',
      state: 'Stan',
      area: 'Obszar',
      areaValue: '{radius} {units} poza krawędzią żetonu, {shape}',
      circle: 'koło',
      square: 'kwadrat',
      circleOption: 'Koło',
      squareOption: 'Kwadrat',
      layers: 'Warstwy',
      layer: 'Warstwa {n}',
      noLayers: 'Brak warstw. Dodaj warstwę, aby wybrać, co ten efekt wywołuje.',
      noFxSet: 'nie ustawiono',
      timing: 'co {min}–{max} ms',
      directionRandom: 'losowy kierunek',
      directionOffset: 'kończy się {dx}, {dy} pól dalej',
      v1Note:
        'Ten efekt nadal korzysta z pola „GM Notes” i pasków swojego żetonu, jak w PageFX 1.x. Zmiana tutaj to wyłączy.',
      preset: 'Preset',
      presetsHint:
        'Zaznacz na mapie jeden lub więcej żetonów, a potem naciśnij preset. Żetony, które nie są jeszcze efektami, staną się nimi, a ich „Aura 1” to obszar, który preset wypełni.',
      triggers: 'Wyzwalacze',
      noTriggers: 'Brak wyzwalaczy: efekt działa zawsze, gdy na jego stronie są gracze.',
      triggerHint:
        'Dla wyzwalacza tury lub obszaru innego żetonu najpierw zaznacz ten żeton na mapie.',
      yes: 'Tak',
      no: 'Nie',
    },
    buttons: {
      edit: 'Edytuj',
      show: 'Pokaż',
      turnOn: 'Włącz',
      turnOff: 'Wyłącz',
      pause: 'Wstrzymaj',
      resume: 'Wznów',
      fire: 'Wywołaj',
      pauseAll: 'Wstrzymaj wszystko',
      resumeAll: 'Wznów wszystko',
      create: 'Nowy efekt',
      createNull: 'Obszar bez efektów',
      removeNull: 'Usuń obszar bez efektów',
      settings: 'Ustawienia',
      status: 'Stan',
      rescan: 'Skanuj ponownie',
      rename: 'Zmień nazwę',
      area: 'Obszar',
      intensity: 'Intensywność',
      builtin: 'Wbudowane FX',
      saved: 'Zapisane FX',
      json: 'Własny JSON',
      timing: 'Czas',
      random: 'Losowy kierunek',
      offset: 'Ustaw kierunek',
      addLayer: 'Dodaj warstwę',
      removeLayer: 'Usuń warstwę',
      delete: 'Usuń efekt',
      preset: 'Preset',
      presets: 'Presety',
      remove: 'Usuń',
      help: 'Pomoc',
      rebuild: 'Odbuduj handouty',
      onRound: 'Co rundę',
      onTurn: 'W turze',
      onEnter: 'Żeton wchodzi',
      onLeave: 'Żeton wychodzi',
      menu: 'Menu',
      change: 'Zmień',
    },
    prompts: {
      type: 'Typ efektu',
      colour: 'Kolor',
      saved: 'Zapisane własne FX',
      json: 'Definicja własnego FX (JSON)',
      intervalMin: 'Najkrótszy czas między wywołaniami w ms',
      intervalMax: 'Najdłuższy czas między wywołaniami w ms',
      dx: 'Pola w poziomie do końca (ujemne to w lewo)',
      dy: 'Pola w dół do końca (ujemne to w górę)',
      name: 'Nazwa efektu',
      radius: 'Promień obszaru poza krawędzią żetonu w jednostkach strony',
      shape: 'Kształt obszaru',
      intensity: 'Intensywność ({min} do {max})',
      maxSpawns: 'Wywołania na sekundę na jednej stronie (1 do {max})',
      preset: 'Preset',
      then: 'Następnie',
      every: 'Co ile rund',
      who: 'Które żetony się liczą',
      area: 'Którego obszaru dotyczy',
      once: 'Tylko za pierwszym razem?',
      confirmDelete: 'Usunąć ten efekt? Żeton zostanie na mapie.',
    },
    settings: {
      language: 'Język',
      globalIntensity: 'Intensywność wszystkich efektów',
      gmPreviewHint:
        'Gdy włączone, efekty działają też na stronie, którą ogląda każdy MG, nawet bez graczy.',
      maxSpawnsHint:
        'Na stronie, która żąda więcej, efekty są przerzedzane. Roll20 działa płynnie do około 60.',
    },
    status: {
      livePages: 'Aktywne strony',
      effects: 'Efekty',
      running: 'Działa',
      globalPause: 'Wszystko wstrzymane',
      on: 'Włączony',
      off: 'Wyłączony',
      pausedState: 'Wstrzymany',
      waiting: 'Nie na aktywnej stronie',
      noFx: 'Nie wybrano efektu',
      broken: 'Nie może działać',
      nullAreas: 'Obszary bez efektów',
      noEffects:
        'Brak efektów. Zaznacz żeton i wpisz !pagefx create albo otwórz menu poleceniem !pagefx.',
      gmPreview: 'Podgląd strony MG',
      intensity: 'Intensywność',
      maxSpawns: 'Maks. wywołań na sekundę na stronę',
    },
    help: {
      menu: 'Otwiera menu: efekty na twojej stronie i przyciski do wszystkiego innego.',
      create:
        'Zmienia zaznaczone żetony w efekty. Ich „Aura 1” to obszar; jeśli jej nie mają, zostanie dodana.',
      edit: 'Pokazuje kartę każdego zaznaczonego efektu z przyciskami do zmian.',
      preset:
        'Nadaje zaznaczonym żetonom preset, w razie potrzeby najpierw zmieniając je w efekty.',
      presets: 'Wyświetla presety według pakietów.',
      switches:
        'Włącza lub wyłącza zaznaczone efekty albo je wstrzymuje i wznawia. Gdy nic nie jest zaznaczone, on i resume uruchamiają wszystko ponownie, a off i pause zatrzymują wszystko (jak !pageFX on i off w wersji 1).',
      fire: 'Wywołuje zaznaczone efekty od razu, raz lub kilka razy, aby je wypróbować.',
      fx: 'Ustawia, co warstwa wywołuje: wbudowany efekt, np. burn-fire, nazwę zapisanego własnego FX albo definicję własnego FX w JSON.',
      interval:
        'Ustawia czas między wywołaniami warstwy w milisekundach. Każde oczekiwanie jest losowane między tymi dwiema wartościami.',
      direction:
        'Dla efektów typu promień ustawia, gdzie kończy się każde wywołanie: random albo liczba pól w poziomie i w dół od miejsca startu.',
      area: 'Ustawia obszar: promień „Aura 1” żetonu w jednostkach strony i jej kształt.',
      intensity:
        'Mnoży częstotliwość wywoływania zaznaczonych efektów (0,1 do 5). Z global zmienia ją dla wszystkich efektów.',
      name: 'Zmienia nazwę zaznaczonych efektów.',
      layer: 'Dodaje warstwę, aby jeden efekt wywoływał kilka rzeczy, albo usuwa jedną.',
      triggerAdd:
        'Dodaje wyzwalacz: przy round, turn, enter lub leave wykonuje start, stop, toggle, fire lub burst. Opcje: every=2, round=3, count=5, who=players|all|named, names=A;B, area=selected, once.',
      triggerRemove: 'Usuwa jeden wyzwalacz lub wszystkie z zaznaczonych efektów.',
      null: 'Zmienia zaznaczone żetony w obszary bez efektów, w których nigdy nic się nie pojawia, albo cofa tę zmianę.',
      delete: 'Usuwa efekt z zaznaczonych żetonów. Żetony zostają na mapie.',
      status: 'Wyświetla każdy efekt, jego stronę i to, czy działa.',
      settings: 'Pokazuje ustawienia.',
      set: 'Zmienia ustawienie: language, gmPagePreview, intensity lub maxSpawnsPerSecond.',
      rescan:
        'Przejmuje nowe żetony o nazwie PageFX lub NullFX i zapomina efekty, których żetony usunięto.',
      journal: 'Odbudowuje handouty z pomocą i Command Deck.',
      help: 'Pokazuje tę listę.',
      handout:
        'Pełna instrukcja jest w handoucie „{help}”; przyciski na jedno kliknięcie są w „{deck}”.',
    },
    deck: {
      menuTitle: 'Menu',
      menuDesc: 'Menu główne pokazuje efekty na twojej stronie. Stan pokazuje wszystkie.',
      newTitle: 'Nowy',
      newDesc:
        'Najpierw zaznacz na mapie jeden lub więcej żetonów. Ich „Aura 1” stanie się obszarem, który wypełni efekt.',
      selectedTitle: 'Zaznaczone efekty',
      selectedDesc: 'Zaznacz na mapie żetony efektów, a potem naciśnij przycisk.',
      allTitle: 'Wszystko',
      allDesc: 'Zatrzymaj wszystkie efekty albo uruchom je wszystkie ponownie.',
      toolsTitle: 'Narzędzia',
      toolsDesc: 'Przejmij skopiowane żetony, zapomnij usunięte i odbuduj te handouty.',
      footer: 'Pełną instrukcję znajdziesz w handoucie „{help}”.',
    },
    handout: {
      versionLabel: 'Wersja',
      subtitle: 'Pogoda i efekty otoczenia dla map Roll20',
      footer: 'Sterowanie na jedno kliknięcie znajdziesz w handoucie „{deck}”.',
      overview: {
        heading: 'Przegląd',
        body: 'PageFX wypełnia obszar mapy efektami, które trwają bez przerwy: deszczem, śniegiem, żarem, parą, świetlikami i nie tylko. Żeton wyznacza miejsce każdego efektu, a jego „Aura 1” to obszar. Efekty działają na każdej stronie, na której są gracze, także na stronach, na które wysłano rozdzieloną drużynę, i zatrzymują się, gdy gracze odejdą. Wszystko ustawia się z menu na czacie, a wyzwalacze mogą uruchamiać lub zatrzymywać efekty wraz z kolejnymi rundami walki albo ruchem żetonów.',
        demo: 'Obejrzyj krótkie demo (z wersji 1)',
      },
      quickStart: {
        heading: 'Szybki start',
        steps: [
          'Postaw żeton tam, gdzie ma być efekt (na warstwie MG pozostanie ukryty przed graczami), i zaznacz go.',
          'Wpisz !pagefx presets albo otwórz Command Deck i kliknij Presety, a potem kliknij preset, np. Ulewa.',
          'Zmień rozmiar „Aura 1” żetonu, aby ustawić obszar, który wypełni efekt. Aura jest ukryta przed graczami.',
          'Przenieś graczy na stronę. Efekt się uruchomi i zatrzyma, gdy odejdą.',
          'Wpisz !pagefx, aby otworzyć menu, i kliknij Edytuj przy efekcie, aby go zmienić.',
        ],
      },
      effects: {
        heading: 'Efekty',
        points: [
          'Efekt to żeton plus ustawienia zapamiętane przez PageFX. Przesuń żeton, aby przesunąć efekt, a zmień jego „Aura 1”, aby zmienić obszar. Usunięcie żetonu usuwa efekt.',
          'Każdy efekt ma jedną lub więcej warstw. Każda warstwa wywołuje jedną rzecz, raz po raz, z losową przerwą między najkrótszym a najdłuższym czasem.',
          'Warstwa może wywołać wbudowany efekt Roll20 (typ i kolor, np. burn-fire), własny FX zapisany w grze albo definicję własnego FX wklejoną jako JSON. Brakujące wartości w definicji są uzupełniane, więc nawet krótka definicja się narysuje.',
          'Efekty typu promień (beam, breath, splatter oraz własne FX z kątem -1) są rysowane między dwoma punktami. Ich kierunek jest losowy albo to stała liczba pól w poziomie i w dół.',
          'Intensywność mnoży częstotliwość wywoływania efektu. Ustawienie intensity mnoży wszystkie efekty.',
          'Wyłączenie zatrzymuje efekt, dopóki nie zostanie włączony. Wstrzymanie zatrzymuje go do wznowienia. Wstrzymaj wszystko zatrzymuje wszystkie efekty bez ich zmieniania.',
          'Jumpgate rysuje definicje własnych FX na biało, jeśli nie są zapisane jako własne FX, więc PageFX zapisuje swoje jako własne FX o nazwie „PageFX: …”. Są usuwane, gdy żaden efekt ich nie używa. Zostaw je w spokoju.',
        ],
      },
      pages: {
        heading: 'Na których stronach działają efekty',
        points: [
          'Efekty działają na stronie z zakładką graczy i na każdej stronie, na którą przeniesiono pojedynczego gracza.',
          'Włącz Podgląd strony MG, aby efekty działały też na stronie, którą ogląda każdy MG, i można je było wypróbować bez graczy.',
          'Każda strona dostaje najwyżej Maks. wywołań na sekundę (domyślnie 30). Jeśli efekty żądają więcej, część wywołań jest pomijana, a MG dostaje jedno powiadomienie.',
          'Gdy inny Mod przesunie zakładkę graczy lub rozdzieli drużynę, Roll20 nikogo nie informuje, więc PageFX sprawdza to co kilka sekund i nadrabia zaległości.',
        ],
      },
      presets: {
        heading: 'Presety',
        intro:
          'Preset daje efektowi zestaw gotowych warstw. Późniejsza zmiana warstwy sprawia, że efekt staje się twój. Inne Mody mogą dodawać presety przez PageFX.registerPreset.',
        colPack: 'Pakiet',
        colPresets: 'Presety (nazwa i ID)',
      },
      triggers: {
        heading: 'Wyzwalacze',
        intro:
          'Wyzwalacz uruchamia, zatrzymuje, przełącza lub wywołuje efekt, gdy coś się wydarzy. Dodaj je z karty efektu albo poleceniem !pagefx trigger add.',
        points: [
          'Co rundę: Roll20 nie zapisuje numeru rundy, więc runda zaczyna się, gdy kolejka inicjatywy przejdzie z ostatniej pozycji z powrotem na górę. Jeśli w kolejce jest własna pozycja o nazwie „Round”, używana jest ona. Wybierz co ile rund albo jedną konkretną rundę. Pierwsza runda walki nie liczy się jako zmiana.',
          'W turze: gdy wybrany żeton znajdzie się na górze kolejki inicjatywy. Przed kliknięciem przycisku zaznacz żeton na mapie.',
          'Żeton wchodzi lub wychodzi: gdy żeton wejdzie do obszaru efektu lub z niego wyjdzie albo do „Aura 1” innego zaznaczonego żetonu. Domyślnie liczą się tylko żetony kontrolowane przez graczy; możesz wybrać dowolny żeton albo podać nazwy.',
          'Wywołaj serię wywołuje efekt kilka razy naraz. Tylko za pierwszym razem sprawia, że wyzwalacz zadziała tylko raz.',
          'Roll20 nie informuje Modów, gdy inny Mod przesunie żeton. Mody przesuwające żetony mogą potem wywołać PageFX.checkToken(token).',
        ],
      },
      nullAreas: {
        heading: 'Obszary bez efektów',
        points: [
          'Obszar bez efektów to żeton, w którym nigdy nie pojawia się żaden efekt, np. wnętrze domu podczas burzy. Jego obszar to żeton i jego „Aura 1”.',
          'Zaznacz żeton i kliknij Obszar bez efektów w menu lub w Command Deck. Żetony o nazwie NullFX, jak w wersji 1, też są obszarami bez efektów.',
        ],
      },
      commands: {
        heading: 'Polecenia',
        intro:
          'Tych poleceń mogą używać tylko MG. Działają na zaznaczone żetony albo na żetony podane przez --ids. Polecenia warstw działają na warstwę 1, chyba że --layer wskazuje inaczej. Inne Mody też mogą je wysyłać; odpowiedzi trafiają do MG.',
        colCommand: 'Polecenie',
        colDesc: 'Co robi',
      },
      settings: {
        heading: 'Ustawienia',
        intro:
          'Zmieniaj ustawienia na karcie Ustawienia albo poleceniem !pagefx set. Język można też ustawić na stronie ustawień Moda.',
        colKey: 'Ustawienie',
        colDesc: 'Co robi',
        rows: {
          language: 'Język menu, komunikatów i handoutów PageFX.',
          gmPagePreview:
            'Uruchamia efekty także na stronie, którą ogląda każdy MG (domyślnie wyłączone).',
          intensity: 'Mnoży częstotliwość wywoływania wszystkich efektów (domyślnie 1).',
          maxSpawnsPerSecond:
            'Najwięcej wywołań na jednej stronie na sekundę, od 1 do 60 (domyślnie 30).',
        },
      },
      api: {
        heading: 'Dla innych Modów',
        intro:
          'PageFX udostępnia obiekt PageFX. Gdy funkcja przyjmuje żeton, działa też ID żetonu.',
        colFunction: 'Funkcja',
        colDesc: 'Co robi',
        rows: {
          activateAll: 'Wznawia wszystkie efekty (wersja 1).',
          deactivateAll: 'Wstrzymuje wszystkie efekty (wersja 1).',
          activate: 'Włącza, wyłącza lub przełącza jeden efekt (wersja 1).',
          start: 'Włącza lub wyłącza jeden efekt albo go wstrzymuje i wznawia.',
          setIntensity: 'Zmienia intensywność jednego efektu.',
          fire: 'Od razu wywołuje jeden efekt.',
          create:
            'Zmienia żeton w efekt z opcjami name, fx, interval, direction i intensity; albo usuwa z niego efekt.',
          getEffect:
            'Odczytuje efekt, wyświetla efekty (na jednej stronie) lub sprawdza, czy efekt działa.',
          registerPreset: 'Dodaje preset na tę sesję albo wyświetla presety.',
          checkToken:
            'Sprawdza żeton przesunięty przez twój Mod pod kątem wyzwalaczy wejścia i wyjścia.',
        },
      },
      upgrading: {
        heading: 'Aktualizacja z wersji 1',
        points: [
          'Żetony o nazwie PageFX i NullFX są przejmowane przy pierwszym uruchomieniu i działają dalej tak jak wcześniej.',
          'Dopóki nie zmienisz efektu z czatu, nadal sterują nim pole „GM Notes” jego żetonu, „Bar 1” (czas między wywołaniami) i „Bar 2” (kierunek promienia), a znacznik interdiction nadal go wyłącza. Gdy zmienisz go z czatu, pole „GM Notes” i paski znów należą do ciebie.',
          'Wersja 1 rysowała efekty tylko na stronie z zakładką graczy i wywoływała zapisane własne FX dwukrotnie. Oba błędy są naprawione.',
          'Polecenia z wersji 1 nadal działają:',
        ],
        colV1: 'Polecenie z wersji 1',
        colV2: 'To samo co',
      },
      troubleshooting: {
        heading: 'Rozwiązywanie problemów',
        points: [
          'Efekt nie działa: otwórz jego kartę. Wiersz Stan podaje powód: wyłączony, wstrzymany, nie wybrano efektu, nie może działać (z powodem) albo nie na aktywnej stronie (brak graczy; włącz Podgląd strony MG, aby go wypróbować).',
          'Nic nie widać: bardzo małe lub krótko żyjące cząsteczki trudno dostrzec na zatłoczonej mapie. Wypróbuj preset, zwiększ intensywność albo zmniejsz obszar.',
          'Efekty wyglądają na rzadkie: strona może osiągać Maks. wywołań na sekundę. Obniż niektóre intensywności albo podnieś limit.',
          'Efekty zatrzymały się po skopiowaniu strony lub gry: użyj Skanuj ponownie.',
          'W każdym innym przypadku sprawdź dziennik konsoli API i dołącz jego komunikaty, prosząc o pomoc.',
        ],
      },
      languages: {
        heading: 'Języki',
        body: 'Wybierz język na karcie Ustawienia albo poleceniem !pagefx set language. Dostępne języki:',
        colLanguage: 'Język',
        colNative: 'Nazwa oryginalna',
        colCode: 'Kod',
      },
      credits: {
        heading: 'Podziękowania',
        original: 'Oryginalny mod autorstwa',
        maintainer: 'Wersję 2 utrzymuje',
        marketplace: 'Pakiety grafik Ady w Roll20 Marketplace',
        support:
          'Jeśli znajdziesz błąd lub masz pomysł, napisz na forum Roll20 Mod albo zgłoś issue na GitHub i dołącz komunikaty z dziennika konsoli API.',
      },
    },
    triggers: {
      line: '{when}: {action}',
      eachRound: 'Każda nowa runda',
      everyRounds: 'Co {n} rund',
      onRound: 'W rundzie {n}',
      turn: 'Gdy turę zaczyna {name}',
      enter: 'Gdy {who} wejdzie do {area}',
      leave: 'Gdy {who} wyjdzie z {area}',
      areaSelf: 'obszaru tego efektu',
      areaSelected: 'aury zaznaczonego żetonu',
      areaOf: 'aury żetonu {name}',
      unnamed: 'żeton',
      once: '(tylko za pierwszym razem)',
      onceUsed: '(tylko za pierwszym razem, już użyty)',
      who: {
        players: 'żeton gracza',
        all: 'dowolny żeton',
      },
      action: {
        start: 'uruchom',
        stop: 'zatrzymaj',
        toggle: 'włącz lub wyłącz',
        fire: 'wywołaj raz',
        burst: 'wywołaj serię {count}',
      },
      choice: {
        start: 'Uruchom',
        stop: 'Zatrzymaj',
        toggle: 'Włącz lub wyłącz',
        fire: 'Wywołaj raz',
        burst: 'Wywołaj serię',
      },
    },
    packs: {
      weather: 'Pogoda',
      fire: 'Ogień i żar',
      water: 'Woda',
      magic: 'Magia i groza',
      custom: 'Z innych Modów',
    },
    presets: {
      'light-rain': 'Mżawka',
      'heavy-rain': 'Ulewa',
      thunderstorm: 'Burza z piorunami',
      snow: 'Śnieg',
      blizzard: 'Zamieć',
      hail: 'Grad',
      sandstorm: 'Burza piaskowa',
      fog: 'Smugi mgły',
      embers: 'Żar',
      ash: 'Opadający popiół',
      magma: 'Bulgocząca magma',
      'lava-spurts': 'Wytryski lawy',
      sparks: 'Iskry',
      drips: 'Krople w jaskini',
      steam: 'Wyziewy pary',
      geyser: 'Gejzer',
      spray: 'Mgiełka wodospadu',
      bubbles: 'Bąbelki',
      fireflies: 'Świetliki',
      'arcane-motes': 'Tajemne drobiny',
      'necrotic-mist': 'Nekrotyczna mgła',
      'holy-glimmer': 'Święty blask',
      'swamp-gas': 'Gaz bagienny',
    },
    fx: {
      empty: 'nie ustawiono żadnego efektu.',
      badJson: 'definicja własnego FX nie jest poprawnym JSON.',
      unknownColour: 'nie ma wbudowanego koloru „{colour}”. Kolory: {colours}.',
      savedMissing: 'nie ma zapisanego własnego FX o nazwie „{name}”.',
      cannotCreate: 'Roll20 nie utworzył dla niego obiektu własnego FX.',
      spawnFailed: 'Roll20 nie wywołał go ({message}).',
    },
    errors: {
      unknownCommand: 'Nieznane polecenie: {command}',
      noEffects: 'Zaznacz jeden lub więcej żetonów PageFX albo podaj ich ID przez --ids.',
      selectToken: 'Najpierw zaznacz jeden lub więcej żetonów albo podaj ich ID przez --ids.',
      unknownIds: 'To nie są efekty PageFX: {ids}',
      badSetting: 'Nieznane ustawienie lub wartość: {setting} {value}',
      noLayer: '„{name}” nie ma warstwy {n}.',
      tooManyLayers: 'Efekt może mieć najwyżej {max} warstw.',
      layerUsage: 'Użyj !pagefx layer add [effect] albo !pagefx layer remove <number>.',
      nullUsage: 'Użyj !pagefx null create albo !pagefx null remove.',
      isEffect: '„{name}” jest efektem, więc nie może być też obszarem bez efektów.',
      badInterval: 'Podaj czas między wywołaniami w ms, na przykład: !pagefx interval 500 1500',
      badDirection:
        'Podaj random albo liczbę pól w poziomie i w dół, na przykład: !pagefx direction 2 -1',
      badArea:
        'Podaj promień w jednostkach strony oraz circle lub square, na przykład: !pagefx area 15 circle',
      badIntensity: 'Podaj intensywność większą od 0, na przykład: !pagefx intensity 1.5',
      noName: 'Podaj nazwę, na przykład: !pagefx name Deszcz nad dokami',
      triggerUsage:
        'Użyj !pagefx trigger add <round|turn|enter|leave> <start|stop|toggle|fire|burst> [every=2] [round=3] [count=5] [who=players|all|named] [names=A;B] [area=self|selected] [once] albo !pagefx trigger remove <number>.',
      triggerToken:
        'Najpierw zaznacz na mapie żeton, którego dotyczy ten wyzwalacz, albo podaj token=<id>.',
      triggerNames:
        'Podaj nazwy żetonów przez names=, oddzielone znakiem ; (na przykład names=Goblin;Orc).',
      tooManyTriggers: 'Efekt może mieć najwyżej {max} wyzwalaczy.',
      noTrigger: '„{name}” nie ma wyzwalacza {n}.',
      journalUsage: 'Użyj !pagefx journal rebuild.',
      unknownPreset: 'Nie ma presetu „{id}”. Wpisz !pagefx presets, aby je zobaczyć.',
      unexpected: 'Coś poszło nie tak: {message}',
    },
  };

  var localePtPT = {
    titles: {
      ready: 'O PageFX está pronto.',
      menu: 'PageFX',
      status: 'Estado do PageFX',
      settings: 'Definições do PageFX',
      presets: 'Predefinições do PageFX',
      help: 'Comandos do PageFX',
      effect: 'Efeito: {name}',
    },
    messages: {
      readyHint: 'Escreva !pagefx para abrir o menu.',
      adopted:
        'Foram assumidos {effects} efeito(s) e {nulls} área(s) sem efeitos de tokens do PageFX 1.x. Continuam a funcionar como antes.',
      rescanned:
        'A nova análise encontrou {effects} efeito(s) novo(s) e {nulls} área(s) sem efeitos nova(s), e esqueceu {dropped} cujos tokens foram eliminados.',
      allPaused: 'Todos os efeitos estão em pausa. Use !pagefx resume para os retomar.',
      allResumed: 'Os efeitos voltaram a funcionar.',
      turnedOn: 'Ligados: {count}.',
      turnedOff: 'Desligados: {count}.',
      toggled: 'Ligados ou desligados: {count}.',
      paused: 'Em pausa: {count}.',
      resumed: 'Retomados: {count}.',
      fired: '{count} efeito(s) gerado(s).',
      created: 'Novos efeitos: {count}. Escolha no cartão de cada um o que ele gera.',
      deleted: 'Efeitos removidos: {count}. Os tokens continuam no mapa.',
      renamed: 'Renomeados: {count}.',
      fxSet: 'Efeito alterado: {count}.',
      intervalSet: 'Intervalo alterado: {count}.',
      directionSet: 'Direção alterada: {count}.',
      areaSet: 'Área alterada: {count}.',
      intensitySet: 'Intensidade alterada: {count}.',
      layerAdded: 'Camada adicionada: {count}.',
      layerRemoved: 'Camada removida: {count}.',
      nullCreated: 'Novas áreas sem efeitos: {count}.',
      nullRemoved: 'Áreas sem efeitos removidas: {count}.',
      presetApplied: 'Predefinição {name} aplicada: {count}.',
      journalRebuilt: 'Os folhetos "{help}" e "{deck}" foram recriados.',
      triggerAdded: 'Gatilho adicionado: {count}.',
      triggerRemoved: 'Gatilho removido: {count}.',
      triggersCleared: 'Gatilhos removidos de {count} efeito(s).',
      throttled:
        'Os efeitos da página "{page}" estão a ser reduzidos: pediram mais de {max} aparições por segundo. Baixe a intensidade deles ou aumente o limite com !pagefx set maxSpawnsPerSecond.',
      settingChanged: '{setting} é agora {value}.',
      problem: 'O efeito "{name}" não pode funcionar: {reason}',
    },
    menu: {
      page: 'Página',
      live: 'os efeitos funcionam aqui',
      notLive: 'nenhum jogador aqui',
      allPausedNote: 'Todos os efeitos estão em pausa.',
      effectsHere: 'Efeitos nesta página',
      noEffectsHere: 'Ainda não há efeitos nesta página.',
      otherPages: 'Outras páginas',
      effectCount: '{count} efeito(s)',
      actions: 'Novo',
      selectHint:
        'Selecione primeiro um token no mapa e depois carregue em Novo efeito ou Área sem efeitos. O token marca onde o efeito aparece; a sua Aura 1 é a área.',
      state: 'Estado',
      area: 'Área',
      areaValue: '{radius} {units} para além do token, {shape}',
      circle: 'círculo',
      square: 'quadrado',
      circleOption: 'Círculo',
      squareOption: 'Quadrado',
      layers: 'Camadas',
      layer: 'Camada {n}',
      noLayers: 'Sem camadas. Adicione uma para escolher o que este efeito gera.',
      noFxSet: 'não definido',
      timing: 'a cada {min}–{max} ms',
      directionRandom: 'direção aleatória',
      directionOffset: 'termina a {dx}, {dy} quadrículas de distância',
      v1Note:
        'Este efeito ainda segue as notas do Mestre ("GM Notes") e as barras do seu token, como no PageFX 1.x. Alterá-lo aqui acaba com isso.',
      preset: 'Predefinição',
      presetsHint:
        'Selecione um ou mais tokens no mapa e depois carregue numa predefinição. Os tokens que ainda não são efeitos passam a sê-lo, e a sua Aura 1 é a área que a predefinição preenche.',
      triggers: 'Gatilhos',
      noTriggers: 'Sem gatilhos: o efeito funciona sempre que houver jogadores na sua página.',
      triggerHint:
        'Para um gatilho de turno, ou uma área de outro token, selecione primeiro esse token no mapa.',
      yes: 'Sim',
      no: 'Não',
    },
    buttons: {
      edit: 'Editar',
      show: 'Mostrar',
      turnOn: 'Ligar',
      turnOff: 'Desligar',
      pause: 'Pausar',
      resume: 'Retomar',
      fire: 'Disparar',
      pauseAll: 'Pausar tudo',
      resumeAll: 'Retomar tudo',
      create: 'Novo efeito',
      createNull: 'Área sem efeitos',
      removeNull: 'Remover área sem efeitos',
      settings: 'Definições',
      status: 'Estado',
      rescan: 'Analisar de novo',
      rename: 'Mudar o nome',
      area: 'Área',
      intensity: 'Intensidade',
      builtin: 'FX incorporado',
      saved: 'FX guardado',
      json: 'JSON próprio',
      timing: 'Intervalo',
      random: 'Direção aleatória',
      offset: 'Definir direção',
      addLayer: 'Adicionar camada',
      removeLayer: 'Remover camada',
      delete: 'Eliminar efeito',
      preset: 'Predefinição',
      presets: 'Predefinições',
      remove: 'Remover',
      help: 'Ajuda',
      rebuild: 'Recriar folhetos',
      onRound: 'Cada ronda',
      onTurn: 'Num turno',
      onEnter: 'Token entra',
      onLeave: 'Token sai',
      menu: 'Menu',
      change: 'Alterar',
    },
    prompts: {
      type: 'Tipo de efeito',
      colour: 'Cor',
      saved: 'FX personalizado guardado',
      json: 'Definição de FX personalizado (JSON)',
      intervalMin: 'Tempo mínimo entre aparições, em ms',
      intervalMax: 'Tempo máximo entre aparições, em ms',
      dx: 'Quadrículas na horizontal até ao fim (negativo é para a esquerda)',
      dy: 'Quadrículas para baixo até ao fim (negativo é para cima)',
      name: 'Nome do efeito',
      radius: 'Raio da área para além do token, em unidades da página',
      shape: 'Forma da área',
      intensity: 'Intensidade ({min} a {max})',
      maxSpawns: 'Aparições por segundo numa página (1 a {max})',
      preset: 'Predefinição',
      then: 'Depois',
      every: 'De quantas em quantas rondas',
      who: 'Que tokens contam',
      area: 'Que área',
      once: 'Só na primeira vez?',
      confirmDelete: 'Eliminar este efeito? O token fica no mapa.',
    },
    settings: {
      language: 'Idioma',
      globalIntensity: 'Intensidade de todos os efeitos',
      gmPreviewHint:
        'Quando ligada, os efeitos também funcionam na página que cada Mestre está a ver, mesmo sem jogadores nela.',
      maxSpawnsHint:
        'Os efeitos são reduzidos numa página que pede mais. O Roll20 mantém-se fluido até cerca de 60.',
    },
    status: {
      livePages: 'Páginas ativas',
      effects: 'Efeitos',
      running: 'A funcionar',
      globalPause: 'Tudo em pausa',
      on: 'Ligado',
      off: 'Desligado',
      pausedState: 'Em pausa',
      waiting: 'Não está numa página ativa',
      noFx: 'Nenhum efeito escolhido',
      broken: 'Não pode funcionar',
      nullAreas: 'Áreas sem efeitos',
      noEffects:
        'Ainda não há efeitos. Selecione um token e escreva !pagefx create, ou abra o menu com !pagefx.',
      gmPreview: 'Pré-visualização da página do Mestre',
      intensity: 'Intensidade',
      maxSpawns: 'Máximo de aparições por segundo, por página',
    },
    help: {
      menu: 'Abre o menu: os efeitos da sua página e botões para tudo o resto.',
      create:
        'Transforma os tokens selecionados em efeitos. A sua Aura 1 é a área; é adicionada uma se não tiverem.',
      edit: 'Mostra o cartão de cada efeito selecionado, com botões para o alterar.',
      preset:
        'Dá uma predefinição aos tokens selecionados, transformando-os primeiro em efeitos, se for preciso.',
      presets: 'Lista as predefinições, por pacote.',
      switches:
        'Liga ou desliga os efeitos selecionados, ou põe-nos em pausa e retoma-os. Sem nada selecionado, on e resume põem tudo a funcionar de novo, e off e pause suspendem tudo (como faziam !pageFX on e off na versão 1).',
      fire: 'Gera agora os efeitos selecionados, uma ou algumas vezes, para os experimentar.',
      fx: 'Define o que uma camada gera: um efeito incorporado como burn-fire, o nome de um FX personalizado guardado, ou uma definição de FX personalizado em JSON.',
      interval:
        'Define o tempo entre as aparições de uma camada, em milissegundos. Cada espera é escolhida entre os dois valores.',
      direction:
        'Para efeitos em forma de feixe, define onde termina cada aparição: random, ou quadrículas na horizontal e para baixo a partir de onde começa.',
      area: 'Define a área: o raio da Aura 1 do token em unidades da página, e a sua forma.',
      intensity:
        'Multiplica a frequência com que os efeitos selecionados aparecem (0.1 a 5). Com global, altera-a para todos os efeitos.',
      name: 'Muda o nome dos efeitos selecionados.',
      layer: 'Adiciona uma camada, para que um efeito gere várias coisas, ou remove uma.',
      triggerAdd:
        'Adiciona um gatilho: em round, turn, enter ou leave, faz start, stop, toggle, fire ou burst. Opções: every=2, round=3, count=5, who=players|all|named, names=A;B, area=selected, once.',
      triggerRemove: 'Remove um gatilho, ou todos, dos efeitos selecionados.',
      null: 'Transforma os tokens selecionados em áreas sem efeitos, onde nunca aparece nenhum efeito, ou faz com que deixem de o ser.',
      delete: 'Retira o efeito dos tokens selecionados. Os tokens ficam no mapa.',
      status: 'Lista todos os efeitos, a sua página e se estão a funcionar.',
      settings: 'Mostra as definições.',
      set: 'Altera uma definição: language, gmPagePreview, intensity ou maxSpawnsPerSecond.',
      rescan:
        'Assume os novos tokens chamados PageFX ou NullFX e esquece os efeitos cujos tokens foram eliminados.',
      journal: 'Recria os folhetos de Ajuda e do Command Deck.',
      help: 'Mostra esta lista.',
      handout:
        'As instruções completas estão no folheto "{help}"; os botões de um clique estão em "{deck}".',
    },
    deck: {
      menuTitle: 'Menu',
      menuDesc: 'O menu principal lista os efeitos da sua página. Estado lista-os todos.',
      newTitle: 'Novo',
      newDesc:
        'Selecione primeiro um ou mais tokens no mapa. A sua Aura 1 passa a ser a área que o efeito preenche.',
      selectedTitle: 'Efeitos selecionados',
      selectedDesc: 'Selecione tokens de efeito no mapa e depois carregue num botão.',
      allTitle: 'Tudo',
      allDesc: 'Suspenda todos os efeitos, ou ponha-os todos a funcionar de novo.',
      toolsTitle: 'Ferramentas',
      toolsDesc: 'Assuma tokens copiados ou eliminados, e recrie estes folhetos.',
      footer: 'Consulte o folheto "{help}" para ver as instruções completas.',
    },
    handout: {
      versionLabel: 'Versão',
      subtitle: 'Efeitos meteorológicos e de ambiente para mapas do Roll20',
      footer: 'Use o folheto "{deck}" para ter controlos de um clique.',
      overview: {
        heading: 'Visão geral',
        body: 'O PageFX preenche uma área do mapa com efeitos contínuos: chuva, neve, brasas, vapor, pirilampos e muito mais. Um token marca o lugar de cada efeito, e a sua Aura 1 é a área. Os efeitos funcionam em todas as páginas que têm jogadores, incluindo páginas para onde foi enviada parte de um grupo dividido, e param quando os jogadores saem. Tudo se configura a partir de menus no chat, e os gatilhos podem iniciar ou parar efeitos à medida que passam as rondas de combate ou que os tokens se movem.',
        demo: 'Veja uma pequena demonstração (da versão 1)',
      },
      quickStart: {
        heading: 'Início rápido',
        steps: [
          'Coloque um token onde o efeito deve ficar (a camada do Mestre mantém-no escondido dos jogadores) e selecione-o.',
          'Escreva !pagefx presets, ou abra o Command Deck e clique em Predefinições; depois clique numa predefinição, como Chuva forte.',
          'Redimensione a Aura 1 do token para definir a área que o efeito preenche. A aura está escondida dos jogadores.',
          'Mova os jogadores para a página. O efeito começa, e volta a parar quando eles saem.',
          'Escreva !pagefx para abrir o menu e clique em Editar num efeito para o alterar.',
        ],
      },
      effects: {
        heading: 'Efeitos',
        points: [
          'Um efeito é um token mais as definições que o PageFX guarda. Mova o token para mover o efeito, e altere a sua Aura 1 para alterar a área. Eliminar o token elimina o efeito.',
          'Cada efeito tem uma ou mais camadas. Cada camada gera uma coisa, vezes sem conta, com uma espera aleatória entre o seu tempo mínimo e máximo.',
          'Uma camada pode gerar um efeito incorporado do Roll20 (tipo e cor, como burn-fire), um FX personalizado guardado no jogo, ou uma definição de FX personalizado colada como JSON. Os valores em falta numa definição são preenchidos, por isso uma definição curta continua a ser desenhada.',
          'Os efeitos em forma de feixe (beam, breath, splatter e FX personalizados com ângulo -1) são desenhados entre dois pontos. A sua direção é aleatória, ou um número fixo de quadrículas na horizontal e para baixo.',
          'A intensidade multiplica a frequência com que um efeito aparece. A definição intensity multiplica todos os efeitos.',
          'Desligar para um efeito até ser ligado. Pausar suspende-o até ser retomado. Pausar tudo suspende todos os efeitos sem os alterar.',
          'O Jumpgate desenha as definições de FX personalizado a branco, a não ser que estejam guardadas como FX personalizados, por isso o PageFX guarda as suas como FX personalizados chamados “PageFX: …”. São removidos quando nenhum efeito os usa. Deixe-os ficar.',
        ],
      },
      pages: {
        heading: 'Que páginas funcionam',
        points: [
          'Os efeitos funcionam na página com a fita dos jogadores e em todas as páginas para onde um jogador foi movido individualmente.',
          'Ligue a Pré-visualização da página do Mestre para que os efeitos funcionem também na página que cada Mestre está a ver, para os experimentar sem jogadores.',
          'Cada página recebe no máximo o Máximo de aparições por segundo (30 por omissão). Se os efeitos pedirem mais, algumas aparições são saltadas, e o Mestre é avisado uma vez.',
          'Quando outro Mod move a fita ou divide o grupo, o Roll20 não avisa ninguém, por isso o PageFX verifica a cada poucos segundos e atualiza-se.',
        ],
      },
      presets: {
        heading: 'Predefinições',
        intro:
          'Uma predefinição dá a um efeito um conjunto de camadas já prontas. Alterar uma camada depois torna o efeito seu. Outros Mods podem adicionar predefinições com PageFX.registerPreset.',
        colPack: 'Pacote',
        colPresets: 'Predefinições (nome e ID)',
      },
      triggers: {
        heading: 'Gatilhos',
        intro:
          'Um gatilho inicia, para, alterna ou dispara um efeito quando algo acontece. Adicione-os a partir do cartão do efeito, ou com !pagefx trigger add.',
        points: [
          'Cada ronda: o Roll20 não guarda o número da ronda, por isso uma ronda começa quando a ordem de turnos avança da última entrada de volta ao topo. Se houver uma entrada personalizada na ordem de turnos chamada “Round”, é essa a usada. Escolha de tantas em tantas rondas, ou uma ronda. A primeira ronda de um combate não conta como mudança.',
          'Num turno: quando um token escolhido chega ao topo da ordem de turnos. Selecione o token no mapa antes de clicar no botão.',
          'Token entra ou sai: quando um token entra ou sai da área do efeito, ou da Aura 1 de outro token que selecionar. Por omissão só contam os tokens controlados por um jogador; escolha qualquer token, ou indique nomes.',
          'Disparar uma rajada gera o efeito várias vezes de uma só vez. Só na primeira vez faz com que um gatilho dispare uma única vez.',
          'O Roll20 não avisa os Mods quando outro Mod move um token. Os Mods que movem tokens podem chamar PageFX.checkToken(token) a seguir.',
        ],
      },
      nullAreas: {
        heading: 'Áreas sem efeitos',
        points: [
          'Uma área sem efeitos é um token onde nunca aparece nenhum efeito, como o interior de uma casa durante uma tempestade. A sua área é o token e a sua Aura 1.',
          'Selecione o token e clique em Área sem efeitos no menu ou no Command Deck. Os tokens chamados NullFX, como na versão 1, também são áreas sem efeitos.',
        ],
      },
      commands: {
        heading: 'Comandos',
        intro:
          'Só os Mestres podem usar estes comandos. Atuam sobre os tokens selecionados, ou sobre os tokens indicados com --ids. Os comandos de camada atuam sobre a camada 1, a não ser que --layer diga outra coisa. Outros Mods também os podem enviar; as respostas vão para o Mestre.',
        colCommand: 'Comando',
        colDesc: 'O que faz',
      },
      settings: {
        heading: 'Definições',
        intro:
          'Altere as definições a partir do cartão de Definições, ou com !pagefx set. O idioma também pode ser definido na página de definições do Mod.',
        colKey: 'Definição',
        colDesc: 'O que faz',
        rows: {
          language: 'O idioma dos menus, mensagens e folhetos do PageFX.',
          gmPagePreview:
            'Também põe os efeitos a funcionar na página que cada Mestre está a ver (desligado por omissão).',
          intensity: 'Multiplica a frequência com que cada efeito aparece (1 por omissão).',
          maxSpawnsPerSecond:
            'O máximo de aparições numa página por segundo, de 1 a 60 (30 por omissão).',
        },
      },
      api: {
        heading: 'Para outros Mods',
        intro:
          'O PageFX publica um objeto PageFX. Quando uma função recebe um token, o ID do token também serve.',
        colFunction: 'Função',
        colDesc: 'O que faz',
        rows: {
          activateAll: 'Retoma todos os efeitos (versão 1).',
          deactivateAll: 'Põe todos os efeitos em pausa (versão 1).',
          activate: 'Liga um efeito, desliga-o ou inverte o seu estado (versão 1).',
          start: 'Liga ou desliga um efeito, ou põe-no em pausa e retoma-o.',
          setIntensity: 'Altera a intensidade de um efeito.',
          fire: 'Gera um efeito agora.',
          create:
            'Transforma um token num efeito, com as opções name, fx, interval, direction e intensity; ou retira-lhe o efeito.',
          getEffect:
            'Lê um efeito, lista os efeitos (de uma página) ou pergunta se um está a funcionar.',
          registerPreset: 'Adiciona uma predefinição para esta sessão, ou lista-as.',
          checkToken:
            'Verifica um token que o seu Mod moveu face aos gatilhos de entrada e de saída.',
        },
      },
      upgrading: {
        heading: 'Atualizar a partir da versão 1',
        points: [
          'Os tokens chamados PageFX e NullFX são assumidos no primeiro arranque e continuam a funcionar como antes.',
          'Até alterar um efeito a partir do chat, as notas do Mestre ("GM Notes"), a barra 1 ("Bar 1", tempo entre aparições) e a barra 2 ("Bar 2", direção do feixe) do seu token continuam a controlá-lo, e o marcador de interdição continua a desligá-lo. Assim que o altera a partir do chat, as notas do Mestre e as barras voltam a ser suas.',
          'A versão 1 só desenhava efeitos na página da fita dos jogadores, e gerava duas vezes os FX personalizados guardados. Ambas as coisas foram corrigidas.',
          'Os comandos da versão 1 continuam a funcionar:',
        ],
        colV1: 'Comando da versão 1',
        colV2: 'Equivale a',
      },
      troubleshooting: {
        heading: 'Resolução de problemas',
        points: [
          'Um efeito não funciona: abra o seu cartão. A linha Estado diz porquê: desligado, em pausa, nenhum efeito escolhido, não pode funcionar (com o motivo), ou não está numa página ativa (sem jogadores; ligue a Pré-visualização da página do Mestre para o experimentar).',
          'Não vê nada: partículas muito pequenas ou de vida curta são difíceis de ver num mapa carregado. Experimente uma predefinição, aumente a intensidade ou diminua a área.',
          'Os efeitos parecem escassos: a página pode estar no Máximo de aparições por segundo. Baixe algumas intensidades, ou aumente o limite.',
          'Os efeitos pararam depois de copiar uma página ou um jogo: use Analisar de novo.',
          'Para tudo o resto, consulte o registo da consola da API e inclua as suas mensagens quando pedir ajuda.',
        ],
      },
      languages: {
        heading: 'Idiomas',
        body: 'Escolha um idioma a partir do cartão de Definições, ou com !pagefx set language. Idiomas disponíveis:',
        colLanguage: 'Idioma',
        colNative: 'Nome nativo',
        colCode: 'Código',
      },
      credits: {
        heading: 'Créditos',
        original: 'Mod original de',
        maintainer: 'Versão 2 mantida por',
        marketplace: 'Pacotes de arte da Ada no Marketplace do Roll20',
        support:
          'Se encontrar um erro ou tiver uma ideia, publique no fórum de Mods do Roll20 ou abra uma issue no GitHub, e inclua as mensagens do registo da consola da API.',
      },
    },
    triggers: {
      line: '{when}: {action}',
      eachRound: 'A cada nova ronda',
      everyRounds: 'A cada {n} rondas',
      onRound: 'Na ronda {n}',
      turn: 'Quando começa o turno de {name}',
      enter: 'Quando {who} entra em {area}',
      leave: 'Quando {who} sai de {area}',
      areaSelf: 'a área deste efeito',
      areaSelected: 'a aura do token selecionado',
      areaOf: 'a aura de {name}',
      unnamed: 'um token',
      once: '(só na primeira vez)',
      onceUsed: '(só na primeira vez, já usado)',
      who: {
        players: 'um token de jogador',
        all: 'qualquer token',
      },
      action: {
        start: 'iniciá-lo',
        stop: 'pará-lo',
        toggle: 'ligá-lo ou desligá-lo',
        fire: 'dispará-lo uma vez',
        burst: 'disparar uma rajada de {count}',
      },
      choice: {
        start: 'Iniciar',
        stop: 'Parar',
        toggle: 'Ligar ou desligar',
        fire: 'Disparar uma vez',
        burst: 'Disparar uma rajada',
      },
    },
    packs: {
      weather: 'Meteorologia',
      fire: 'Fogo e calor',
      water: 'Água',
      magic: 'Magia e mistério',
      custom: 'De outros Mods',
    },
    presets: {
      'light-rain': 'Chuva fraca',
      'heavy-rain': 'Chuva forte',
      thunderstorm: 'Trovoada',
      snow: 'Neve',
      blizzard: 'Nevão',
      hail: 'Granizo',
      sandstorm: 'Tempestade de areia',
      fog: 'Farrapos de nevoeiro',
      embers: 'Brasas',
      ash: 'Cinza a cair',
      magma: 'Magma a borbulhar',
      'lava-spurts': 'Jatos de lava',
      sparks: 'Faíscas',
      drips: 'Gotas de gruta',
      steam: 'Saídas de vapor',
      geyser: 'Géiser',
      spray: 'Salpicos de cascata',
      bubbles: 'Bolhas',
      fireflies: 'Pirilampos',
      'arcane-motes': 'Partículas arcanas',
      'necrotic-mist': 'Névoa necrótica',
      'holy-glimmer': 'Brilho sagrado',
      'swamp-gas': 'Gás de pântano',
    },
    fx: {
      empty: 'nenhum efeito está definido.',
      badJson: 'a definição de FX personalizado não é JSON válido.',
      unknownColour: 'não existe a cor incorporada "{colour}". Cores: {colours}.',
      savedMissing: 'não existe nenhum FX personalizado guardado chamado "{name}".',
      cannotCreate: 'o Roll20 não quis criar um objeto de FX personalizado para ele.',
      spawnFailed: 'o Roll20 não o quis gerar ({message}).',
    },
    errors: {
      unknownCommand: 'Comando desconhecido: {command}',
      noEffects: 'Selecione um ou mais tokens do PageFX, ou indique os seus IDs com --ids.',
      selectToken: 'Selecione primeiro um ou mais tokens, ou indique os seus IDs com --ids.',
      unknownIds: 'Estes não são efeitos do PageFX: {ids}',
      badSetting: 'Definição ou valor desconhecido: {setting} {value}',
      noLayer: '"{name}" não tem a camada {n}.',
      tooManyLayers: 'Um efeito pode ter no máximo {max} camadas.',
      layerUsage: 'Use !pagefx layer add [effect] ou !pagefx layer remove <number>.',
      nullUsage: 'Use !pagefx null create ou !pagefx null remove.',
      isEffect: '"{name}" é um efeito, por isso não pode ser também uma área sem efeitos.',
      badInterval: 'Indique o tempo entre aparições em ms, por exemplo: !pagefx interval 500 1500',
      badDirection:
        'Indique random, ou quadrículas na horizontal e para baixo, por exemplo: !pagefx direction 2 -1',
      badArea:
        'Indique um raio em unidades da página, e circle ou square, por exemplo: !pagefx area 15 circle',
      badIntensity: 'Indique uma intensidade acima de 0, por exemplo: !pagefx intensity 1.5',
      noName: 'Indique um nome, por exemplo: !pagefx name Chuva sobre o cais',
      triggerUsage:
        'Use !pagefx trigger add <round|turn|enter|leave> <start|stop|toggle|fire|burst> [every=2] [round=3] [count=5] [who=players|all|named] [names=A;B] [area=self|selected] [once], ou !pagefx trigger remove <number>.',
      triggerToken:
        'Selecione primeiro no mapa o token a que este gatilho se refere, ou indique token=<id>.',
      triggerNames:
        'Indique os nomes dos tokens com names=, separados por ; (por exemplo names=Goblin;Orc).',
      tooManyTriggers: 'Um efeito pode ter no máximo {max} gatilhos.',
      noTrigger: '"{name}" não tem o gatilho {n}.',
      journalUsage: 'Use !pagefx journal rebuild.',
      unknownPreset: 'Não existe a predefinição "{id}". Escreva !pagefx presets para as ver.',
      unexpected: 'Algo correu mal: {message}',
    },
  };

  var localePtBR = {
    titles: {
      ready: 'O PageFX está pronto.',
      menu: 'PageFX',
      status: 'Status do PageFX',
      settings: 'Configurações do PageFX',
      presets: 'Predefinições do PageFX',
      help: 'Comandos do PageFX',
      effect: 'Efeito: {name}',
    },
    messages: {
      readyHint: 'Digite !pagefx para abrir o menu.',
      adopted:
        'Foram assumidos {effects} efeito(s) e {nulls} área(s) sem efeitos de tokens do PageFX 1.x. Eles continuam funcionando como antes.',
      rescanned:
        'A nova varredura encontrou {effects} efeito(s) novo(s) e {nulls} área(s) sem efeitos nova(s), e esqueceu {dropped} cujos tokens foram excluídos.',
      allPaused: 'Todos os efeitos estão pausados. Use !pagefx resume para retomá-los.',
      allResumed: 'Os efeitos estão rodando de novo.',
      turnedOn: 'Ligados: {count}.',
      turnedOff: 'Desligados: {count}.',
      toggled: 'Ligados ou desligados: {count}.',
      paused: 'Pausados: {count}.',
      resumed: 'Retomados: {count}.',
      fired: '{count} efeito(s) gerado(s).',
      created: 'Novos efeitos: {count}. Escolha no cartão de cada um o que ele gera.',
      deleted: 'Efeitos removidos: {count}. Os tokens continuam no mapa.',
      renamed: 'Renomeados: {count}.',
      fxSet: 'Efeito alterado: {count}.',
      intervalSet: 'Intervalo alterado: {count}.',
      directionSet: 'Direção alterada: {count}.',
      areaSet: 'Área alterada: {count}.',
      intensitySet: 'Intensidade alterada: {count}.',
      layerAdded: 'Camada adicionada: {count}.',
      layerRemoved: 'Camada removida: {count}.',
      nullCreated: 'Novas áreas sem efeitos: {count}.',
      nullRemoved: 'Áreas sem efeitos removidas: {count}.',
      presetApplied: 'Predefinição {name} aplicada: {count}.',
      journalRebuilt: 'Os folhetos "{help}" e "{deck}" foram recriados.',
      triggerAdded: 'Gatilho adicionado: {count}.',
      triggerRemoved: 'Gatilho removido: {count}.',
      triggersCleared: 'Gatilhos removidos de {count} efeito(s).',
      throttled:
        'Os efeitos da página "{page}" estão sendo reduzidos: pediram mais de {max} aparições por segundo. Diminua a intensidade deles ou aumente o limite com !pagefx set maxSpawnsPerSecond.',
      settingChanged: '{setting} agora é {value}.',
      problem: 'O efeito "{name}" não pode rodar: {reason}',
    },
    menu: {
      page: 'Página',
      live: 'os efeitos rodam aqui',
      notLive: 'nenhum jogador aqui',
      allPausedNote: 'Todos os efeitos estão pausados.',
      effectsHere: 'Efeitos nesta página',
      noEffectsHere: 'Ainda não há efeitos nesta página.',
      otherPages: 'Outras páginas',
      effectCount: '{count} efeito(s)',
      actions: 'Novo',
      selectHint:
        'Selecione primeiro um token no mapa e depois clique em Novo efeito ou Área sem efeitos. O token marca onde o efeito aparece; a Aura 1 dele é a área.',
      state: 'Estado',
      area: 'Área',
      areaValue: '{radius} {units} além do token, {shape}',
      circle: 'círculo',
      square: 'quadrado',
      circleOption: 'Círculo',
      squareOption: 'Quadrado',
      layers: 'Camadas',
      layer: 'Camada {n}',
      noLayers: 'Nenhuma camada. Adicione uma para escolher o que este efeito gera.',
      noFxSet: 'não definido',
      timing: 'a cada {min}–{max} ms',
      directionRandom: 'direção aleatória',
      directionOffset: 'termina a {dx}, {dy} quadrados de distância',
      v1Note:
        'Este efeito ainda segue as notas do Mestre ("GM Notes") e as barras do token, como no PageFX 1.x. Alterá-lo aqui interrompe isso.',
      preset: 'Predefinição',
      presetsHint:
        'Selecione um ou mais tokens no mapa e depois clique em uma predefinição. Os tokens que ainda não são efeitos viram efeitos, e a Aura 1 deles é a área que a predefinição preenche.',
      triggers: 'Gatilhos',
      noTriggers: 'Sem gatilhos: o efeito roda sempre que houver jogadores na página dele.',
      triggerHint:
        'Para um gatilho de turno, ou uma área de outro token, selecione primeiro esse token no mapa.',
      yes: 'Sim',
      no: 'Não',
    },
    buttons: {
      edit: 'Editar',
      show: 'Mostrar',
      turnOn: 'Ligar',
      turnOff: 'Desligar',
      pause: 'Pausar',
      resume: 'Retomar',
      fire: 'Disparar',
      pauseAll: 'Pausar tudo',
      resumeAll: 'Retomar tudo',
      create: 'Novo efeito',
      createNull: 'Área sem efeitos',
      removeNull: 'Remover área sem efeitos',
      settings: 'Configurações',
      status: 'Status',
      rescan: 'Varrer de novo',
      rename: 'Renomear',
      area: 'Área',
      intensity: 'Intensidade',
      builtin: 'FX embutido',
      saved: 'FX salvo',
      json: 'JSON próprio',
      timing: 'Intervalo',
      random: 'Direção aleatória',
      offset: 'Definir direção',
      addLayer: 'Adicionar camada',
      removeLayer: 'Remover camada',
      delete: 'Excluir efeito',
      preset: 'Predefinição',
      presets: 'Predefinições',
      remove: 'Remover',
      help: 'Ajuda',
      rebuild: 'Recriar folhetos',
      onRound: 'Cada rodada',
      onTurn: 'Em um turno',
      onEnter: 'Token entra',
      onLeave: 'Token sai',
      menu: 'Menu',
      change: 'Alterar',
    },
    prompts: {
      type: 'Tipo de efeito',
      colour: 'Cor',
      saved: 'FX personalizado salvo',
      json: 'Definição de FX personalizado (JSON)',
      intervalMin: 'Menor tempo entre aparições, em ms',
      intervalMax: 'Maior tempo entre aparições, em ms',
      dx: 'Quadrados na horizontal até o fim (negativo é para a esquerda)',
      dy: 'Quadrados para baixo até o fim (negativo é para cima)',
      name: 'Nome do efeito',
      radius: 'Raio da área além do token, em unidades da página',
      shape: 'Formato da área',
      intensity: 'Intensidade ({min} a {max})',
      maxSpawns: 'Aparições por segundo em uma página (1 a {max})',
      preset: 'Predefinição',
      then: 'Então',
      every: 'A cada quantas rodadas',
      who: 'Quais tokens contam',
      area: 'Qual área',
      once: 'Só na primeira vez?',
      confirmDelete: 'Excluir este efeito? O token continua no mapa.',
    },
    settings: {
      language: 'Idioma',
      globalIntensity: 'Intensidade de todos os efeitos',
      gmPreviewHint:
        'Quando ligada, os efeitos também rodam na página que cada Mestre está vendo, mesmo sem jogadores nela.',
      maxSpawnsHint:
        'Os efeitos são reduzidos em uma página que pede mais. O Roll20 continua fluido até cerca de 60.',
    },
    status: {
      livePages: 'Páginas ativas',
      effects: 'Efeitos',
      running: 'Rodando',
      globalPause: 'Tudo pausado',
      on: 'Ligado',
      off: 'Desligado',
      pausedState: 'Pausado',
      waiting: 'Não está em uma página ativa',
      noFx: 'Nenhum efeito escolhido',
      broken: 'Não pode rodar',
      nullAreas: 'Áreas sem efeitos',
      noEffects:
        'Ainda não há efeitos. Selecione um token e digite !pagefx create, ou abra o menu com !pagefx.',
      gmPreview: 'Prévia da página do Mestre',
      intensity: 'Intensidade',
      maxSpawns: 'Máximo de aparições por segundo, por página',
    },
    help: {
      menu: 'Abre o menu: os efeitos da sua página e botões para todo o resto.',
      create:
        'Transforma os tokens selecionados em efeitos. A Aura 1 deles é a área; uma é adicionada se não tiverem.',
      edit: 'Mostra o cartão de cada efeito selecionado, com botões para alterá-lo.',
      preset:
        'Dá uma predefinição aos tokens selecionados, transformando-os em efeitos antes, se necessário.',
      presets: 'Lista as predefinições, por pacote.',
      switches:
        'Liga ou desliga os efeitos selecionados, ou os pausa e retoma. Sem nada selecionado, on e resume colocam tudo para rodar de novo, e off e pause seguram tudo (como !pageFX on e off faziam na versão 1).',
      fire: 'Gera agora os efeitos selecionados, uma ou algumas vezes, para testá-los.',
      fx: 'Define o que uma camada gera: um efeito embutido como burn-fire, o nome de um FX personalizado salvo, ou uma definição de FX personalizado em JSON.',
      interval:
        'Define o tempo entre as aparições de uma camada, em milissegundos. Cada espera é escolhida entre os dois valores.',
      direction:
        'Para efeitos em forma de feixe, define onde cada aparição termina: random, ou quadrados na horizontal e para baixo a partir de onde começa.',
      area: 'Define a área: o raio da Aura 1 do token em unidades da página, e o formato dela.',
      intensity:
        'Multiplica a frequência com que os efeitos selecionados aparecem (0.1 a 5). Com global, altera para todos os efeitos.',
      name: 'Renomeia os efeitos selecionados.',
      layer: 'Adiciona uma camada, para que um efeito gere várias coisas, ou remove uma.',
      triggerAdd:
        'Adiciona um gatilho: em round, turn, enter ou leave, faz start, stop, toggle, fire ou burst. Opções: every=2, round=3, count=5, who=players|all|named, names=A;B, area=selected, once.',
      triggerRemove: 'Remove um gatilho, ou todos, dos efeitos selecionados.',
      null: 'Transforma os tokens selecionados em áreas sem efeitos, onde nenhum efeito jamais aparece, ou faz com que deixem de ser.',
      delete: 'Tira o efeito dos tokens selecionados. Os tokens continuam no mapa.',
      status: 'Lista todos os efeitos, a página de cada um e se está rodando.',
      settings: 'Mostra as configurações.',
      set: 'Altera uma configuração: language, gmPagePreview, intensity ou maxSpawnsPerSecond.',
      rescan:
        'Assume os novos tokens chamados PageFX ou NullFX e esquece os efeitos cujos tokens foram excluídos.',
      journal: 'Recria os folhetos de Ajuda e do Command Deck.',
      help: 'Mostra esta lista.',
      handout:
        'As instruções completas estão no folheto "{help}"; os botões de um clique estão em "{deck}".',
    },
    deck: {
      menuTitle: 'Menu',
      menuDesc: 'O menu principal lista os efeitos da sua página. Status lista todos eles.',
      newTitle: 'Novo',
      newDesc:
        'Selecione primeiro um ou mais tokens no mapa. A Aura 1 deles vira a área que o efeito preenche.',
      selectedTitle: 'Efeitos selecionados',
      selectedDesc: 'Selecione tokens de efeito no mapa e depois clique em um botão.',
      allTitle: 'Tudo',
      allDesc: 'Segure todos os efeitos, ou coloque todos para rodar de novo.',
      toolsTitle: 'Ferramentas',
      toolsDesc: 'Assuma tokens copiados ou excluídos, e recrie estes folhetos.',
      footer: 'Veja o folheto "{help}" para as instruções completas.',
    },
    handout: {
      versionLabel: 'Versão',
      subtitle: 'Efeitos de clima e ambiente para mapas do Roll20',
      footer: 'Use o folheto "{deck}" para controles de um clique.',
      overview: {
        heading: 'Visão geral',
        body: 'O PageFX preenche uma área do mapa com efeitos contínuos: chuva, neve, brasas, vapor, vaga-lumes e mais. Um token marca o lugar de cada efeito, e a Aura 1 dele é a área. Os efeitos rodam em todas as páginas que têm jogadores, inclusive páginas para onde parte de um grupo dividido foi enviada, e param quando os jogadores saem. Tudo é configurado por menus no chat, e os gatilhos podem iniciar ou parar efeitos conforme as rodadas de combate passam ou os tokens se movem.',
        demo: 'Assista a uma demonstração curta (da versão 1)',
      },
      quickStart: {
        heading: 'Início rápido',
        steps: [
          'Coloque um token onde o efeito deve ficar (a camada do Mestre o mantém oculto dos jogadores) e selecione-o.',
          'Digite !pagefx presets, ou abra o Command Deck e clique em Predefinições; depois clique em uma predefinição, como Chuva forte.',
          'Redimensione a Aura 1 do token para definir a área que o efeito preenche. A aura fica oculta dos jogadores.',
          'Mova os jogadores para a página. O efeito começa, e para de novo quando eles saem.',
          'Digite !pagefx para abrir o menu e clique em Editar em um efeito para alterá-lo.',
        ],
      },
      effects: {
        heading: 'Efeitos',
        points: [
          'Um efeito é um token mais as configurações que o PageFX guarda. Mova o token para mover o efeito, e altere a Aura 1 dele para alterar a área. Excluir o token exclui o efeito.',
          'Cada efeito tem uma ou mais camadas. Cada camada gera uma coisa, de novo e de novo, com uma espera aleatória entre o menor e o maior tempo dela.',
          'Uma camada pode gerar um efeito embutido do Roll20 (tipo e cor, como burn-fire), um FX personalizado salvo no jogo, ou uma definição de FX personalizado colada como JSON. Os valores que faltam em uma definição são preenchidos, então uma definição curta ainda é desenhada.',
          'Efeitos em forma de feixe (beam, breath, splatter e FX personalizados com ângulo -1) são desenhados entre dois pontos. A direção deles é aleatória, ou um número fixo de quadrados na horizontal e para baixo.',
          'A intensidade multiplica a frequência com que um efeito aparece. A configuração intensity multiplica todos os efeitos.',
          'Desligar para um efeito até ele ser ligado. Pausar o segura até ele ser retomado. Pausar tudo segura todos os efeitos sem alterá-los.',
          'O Jumpgate desenha definições de FX personalizado em branco a menos que estejam salvas como FX personalizados, então o PageFX salva as suas como FX personalizados chamados “PageFX: …”. Eles são removidos quando nenhum efeito os usa. Deixe-os onde estão.',
        ],
      },
      pages: {
        heading: 'Quais páginas rodam',
        points: [
          'Os efeitos rodam na página com a faixa de jogadores e em toda página para onde um jogador foi movido sozinho.',
          'Ligue a Prévia da página do Mestre para rodar efeitos também na página que cada Mestre está vendo, para testá-los sem jogadores.',
          'Cada página recebe no máximo o Máximo de aparições por segundo (30 por padrão). Se os efeitos pedirem mais, algumas aparições são puladas, e o Mestre é avisado uma vez.',
          'Quando outro Mod move a faixa ou divide o grupo, o Roll20 não avisa ninguém, então o PageFX confere a cada poucos segundos e se atualiza.',
        ],
      },
      presets: {
        heading: 'Predefinições',
        intro:
          'Uma predefinição dá a um efeito um conjunto de camadas prontas. Alterar uma camada depois torna o efeito seu. Outros Mods podem adicionar predefinições com PageFX.registerPreset.',
        colPack: 'Pacote',
        colPresets: 'Predefinições (nome e ID)',
      },
      triggers: {
        heading: 'Gatilhos',
        intro:
          'Um gatilho inicia, para, alterna ou dispara um efeito quando algo acontece. Adicione-os pelo cartão do efeito, ou com !pagefx trigger add.',
        points: [
          'Cada rodada: o Roll20 não guarda número de rodada, então uma rodada começa quando a ordem de turnos avança da última entrada de volta para o topo. Se houver uma entrada personalizada na ordem de turnos chamada “Round”, ela é usada no lugar. Escolha a cada tantas rodadas, ou uma rodada. A primeira rodada de um combate não conta como mudança.',
          'Em um turno: quando um token escolhido chega ao topo da ordem de turnos. Selecione o token no mapa antes de clicar no botão.',
          'Token entra ou sai: quando um token entra ou sai da área do efeito, ou da Aura 1 de outro token que você selecionar. Por padrão só contam os tokens que um jogador controla; escolha qualquer token, ou informe nomes.',
          'Disparar uma rajada gera o efeito várias vezes de uma vez. Só na primeira vez faz um gatilho disparar uma única vez.',
          'O Roll20 não avisa os Mods quando outro Mod move um token. Mods que movem tokens podem chamar PageFX.checkToken(token) depois.',
        ],
      },
      nullAreas: {
        heading: 'Áreas sem efeitos',
        points: [
          'Uma área sem efeitos é um token onde nenhum efeito jamais aparece, como o interior de uma casa durante uma tempestade. A área dela é o token e a Aura 1 dele.',
          'Selecione o token e clique em Área sem efeitos no menu ou no Command Deck. Tokens chamados NullFX, como na versão 1, também são áreas sem efeitos.',
        ],
      },
      commands: {
        heading: 'Comandos',
        intro:
          'Só os Mestres podem usar estes comandos. Eles agem sobre os tokens selecionados, ou sobre os tokens informados com --ids. Os comandos de camada agem sobre a camada 1, a menos que --layer diga outra coisa. Outros Mods também podem enviá-los; as respostas vão para o Mestre.',
        colCommand: 'Comando',
        colDesc: 'O que faz',
      },
      settings: {
        heading: 'Configurações',
        intro:
          'Altere as configurações pelo cartão de Configurações, ou com !pagefx set. O idioma também pode ser definido na página de configurações do Mod.',
        colKey: 'Configuração',
        colDesc: 'O que faz',
        rows: {
          language: 'O idioma dos menus, mensagens e folhetos do PageFX.',
          gmPagePreview:
            'Também roda os efeitos na página que cada Mestre está vendo (desligado por padrão).',
          intensity: 'Multiplica a frequência com que cada efeito aparece (1 por padrão).',
          maxSpawnsPerSecond:
            'O máximo de aparições em uma página a cada segundo, de 1 a 60 (30 por padrão).',
        },
      },
      api: {
        heading: 'Para outros Mods',
        intro:
          'O PageFX publica um objeto PageFX. Onde uma função recebe um token, o ID do token também serve.',
        colFunction: 'Função',
        colDesc: 'O que faz',
        rows: {
          activateAll: 'Retoma todos os efeitos (versão 1).',
          deactivateAll: 'Pausa todos os efeitos (versão 1).',
          activate: 'Liga um efeito, desliga ou inverte o estado dele (versão 1).',
          start: 'Liga ou desliga um efeito, ou o pausa e retoma.',
          setIntensity: 'Altera a intensidade de um efeito.',
          fire: 'Gera um efeito agora.',
          create:
            'Transforma um token em efeito, com as opções name, fx, interval, direction e intensity; ou tira o efeito dele.',
          getEffect:
            'Lê um efeito, lista os efeitos (de uma página) ou pergunta se um está rodando.',
          registerPreset: 'Adiciona uma predefinição para esta sessão, ou lista todas.',
          checkToken: 'Confere um token que o seu Mod moveu contra os gatilhos de entrada e saída.',
        },
      },
      upgrading: {
        heading: 'Atualizando da versão 1',
        points: [
          'Tokens chamados PageFX e NullFX são assumidos na primeira inicialização e continuam funcionando como antes.',
          'Até você alterar um efeito pelo chat, as notas do Mestre ("GM Notes"), a barra 1 ("Bar 1", tempo entre aparições) e a barra 2 ("Bar 2", direção do feixe) do token ainda o controlam, e o marcador de interdição ainda o desliga. Depois que você o altera pelo chat, as notas do Mestre e as barras voltam a ser suas.',
          'A versão 1 só desenhava efeitos na página da faixa de jogadores, e gerava duas vezes os FX personalizados salvos. As duas coisas foram corrigidas.',
          'Os comandos da versão 1 continuam funcionando:',
        ],
        colV1: 'Comando da versão 1',
        colV2: 'Equivale a',
      },
      troubleshooting: {
        heading: 'Solução de problemas',
        points: [
          'Um efeito não roda: abra o cartão dele. A linha Estado diz o motivo: desligado, pausado, nenhum efeito escolhido, não pode rodar (com o motivo), ou não está em uma página ativa (sem jogadores lá; ligue a Prévia da página do Mestre para testar).',
          'Você não vê nada: partículas muito pequenas ou de vida curta são difíceis de ver em um mapa carregado. Teste uma predefinição, aumente a intensidade ou diminua a área.',
          'Os efeitos parecem ralos: a página pode estar no Máximo de aparições por segundo. Diminua algumas intensidades, ou aumente o limite.',
          'Os efeitos pararam depois de copiar uma página ou um jogo: use Varrer de novo.',
          'Para qualquer outra coisa, confira o log do console da API e inclua as mensagens dele ao pedir ajuda.',
        ],
      },
      languages: {
        heading: 'Idiomas',
        body: 'Escolha um idioma pelo cartão de Configurações, ou com !pagefx set language. Idiomas disponíveis:',
        colLanguage: 'Idioma',
        colNative: 'Nome nativo',
        colCode: 'Código',
      },
      credits: {
        heading: 'Créditos',
        original: 'Mod original por',
        maintainer: 'Versão 2 mantida por',
        marketplace: 'Pacotes de arte da Ada no Marketplace do Roll20',
        support:
          'Se você encontrar um bug ou tiver uma ideia, poste no fórum de Mods do Roll20 ou abra uma issue no GitHub, e inclua as mensagens do log do console da API.',
      },
    },
    triggers: {
      line: '{when}: {action}',
      eachRound: 'A cada nova rodada',
      everyRounds: 'A cada {n} rodadas',
      onRound: 'Na rodada {n}',
      turn: 'Quando começa o turno de {name}',
      enter: 'Quando {who} entra em {area}',
      leave: 'Quando {who} sai de {area}',
      areaSelf: 'a área deste efeito',
      areaSelected: 'a aura do token selecionado',
      areaOf: 'a aura de {name}',
      unnamed: 'um token',
      once: '(só na primeira vez)',
      onceUsed: '(só na primeira vez, já usado)',
      who: {
        players: 'um token de jogador',
        all: 'qualquer token',
      },
      action: {
        start: 'iniciá-lo',
        stop: 'pará-lo',
        toggle: 'ligá-lo ou desligá-lo',
        fire: 'dispará-lo uma vez',
        burst: 'disparar uma rajada de {count}',
      },
      choice: {
        start: 'Iniciar',
        stop: 'Parar',
        toggle: 'Ligar ou desligar',
        fire: 'Disparar uma vez',
        burst: 'Disparar uma rajada',
      },
    },
    packs: {
      weather: 'Clima',
      fire: 'Fogo e calor',
      water: 'Água',
      magic: 'Magia e mistério',
      custom: 'De outros Mods',
    },
    presets: {
      'light-rain': 'Chuva fraca',
      'heavy-rain': 'Chuva forte',
      thunderstorm: 'Tempestade com raios',
      snow: 'Neve',
      blizzard: 'Nevasca',
      hail: 'Granizo',
      sandstorm: 'Tempestade de areia',
      fog: 'Fiapos de névoa',
      embers: 'Brasas',
      ash: 'Cinzas caindo',
      magma: 'Magma borbulhante',
      'lava-spurts': 'Jatos de lava',
      sparks: 'Faíscas',
      drips: 'Gotejar de caverna',
      steam: 'Saídas de vapor',
      geyser: 'Gêiser',
      spray: 'Borrifos de cachoeira',
      bubbles: 'Bolhas',
      fireflies: 'Vaga-lumes',
      'arcane-motes': 'Partículas arcanas',
      'necrotic-mist': 'Névoa necrótica',
      'holy-glimmer': 'Brilho sagrado',
      'swamp-gas': 'Gás de pântano',
    },
    fx: {
      empty: 'nenhum efeito está definido.',
      badJson: 'a definição de FX personalizado não é um JSON válido.',
      unknownColour: 'não existe a cor embutida "{colour}". Cores: {colours}.',
      savedMissing: 'não existe um FX personalizado salvo chamado "{name}".',
      cannotCreate: 'o Roll20 não quis criar um objeto de FX personalizado para ele.',
      spawnFailed: 'o Roll20 não quis gerá-lo ({message}).',
    },
    errors: {
      unknownCommand: 'Comando desconhecido: {command}',
      noEffects: 'Selecione um ou mais tokens do PageFX, ou informe os IDs deles com --ids.',
      selectToken: 'Selecione primeiro um ou mais tokens, ou informe os IDs deles com --ids.',
      unknownIds: 'Estes não são efeitos do PageFX: {ids}',
      badSetting: 'Configuração ou valor desconhecido: {setting} {value}',
      noLayer: '"{name}" não tem a camada {n}.',
      tooManyLayers: 'Um efeito pode ter no máximo {max} camadas.',
      layerUsage: 'Use !pagefx layer add [effect] ou !pagefx layer remove <number>.',
      nullUsage: 'Use !pagefx null create ou !pagefx null remove.',
      isEffect: '"{name}" é um efeito, então não pode ser também uma área sem efeitos.',
      badInterval: 'Informe o tempo entre aparições em ms, por exemplo: !pagefx interval 500 1500',
      badDirection:
        'Informe random, ou quadrados na horizontal e para baixo, por exemplo: !pagefx direction 2 -1',
      badArea:
        'Informe um raio em unidades da página, e circle ou square, por exemplo: !pagefx area 15 circle',
      badIntensity: 'Informe uma intensidade acima de 0, por exemplo: !pagefx intensity 1.5',
      noName: 'Informe um nome, por exemplo: !pagefx name Chuva sobre o cais',
      triggerUsage:
        'Use !pagefx trigger add <round|turn|enter|leave> <start|stop|toggle|fire|burst> [every=2] [round=3] [count=5] [who=players|all|named] [names=A;B] [area=self|selected] [once], ou !pagefx trigger remove <number>.',
      triggerToken:
        'Selecione primeiro no mapa o token ao qual este gatilho se refere, ou informe token=<id>.',
      triggerNames:
        'Informe os nomes dos tokens com names=, separados por ; (por exemplo names=Goblin;Orc).',
      tooManyTriggers: 'Um efeito pode ter no máximo {max} gatilhos.',
      noTrigger: '"{name}" não tem o gatilho {n}.',
      journalUsage: 'Use !pagefx journal rebuild.',
      unknownPreset: 'Não existe a predefinição "{id}". Digite !pagefx presets para vê-las.',
      unexpected: 'Algo deu errado: {message}',
    },
  };

  var localeRu = {
    titles: {
      ready: 'PageFX готов к работе.',
      menu: 'PageFX',
      status: 'Состояние PageFX',
      settings: 'Настройки PageFX',
      presets: 'Пресеты PageFX',
      help: 'Команды PageFX',
      effect: 'Эффект: {name}',
    },
    messages: {
      readyHint: 'Введите !pagefx, чтобы открыть меню.',
      adopted:
        'Взято под управление из токенов PageFX 1.x: эффектов — {effects}, областей без эффектов — {nulls}. Они работают как раньше.',
      rescanned:
        'Повторный поиск нашёл новых эффектов: {effects}, новых областей без эффектов: {nulls}, и забыл эффекты с удалёнными токенами: {dropped}.',
      allPaused: 'Все эффекты приостановлены. Введите !pagefx resume, чтобы снова их запустить.',
      allResumed: 'Эффекты снова работают.',
      turnedOn: 'Включено: {count}.',
      turnedOff: 'Выключено: {count}.',
      toggled: 'Включено или выключено: {count}.',
      paused: 'Приостановлено: {count}.',
      resumed: 'Возобновлено: {count}.',
      fired: 'Вызвано эффектов: {count}.',
      created: 'Новых эффектов: {count}. Выберите на карточке каждого, что он создаёт.',
      deleted: 'Удалено эффектов: {count}. Их токены остались на карте.',
      renamed: 'Переименовано: {count}.',
      fxSet: 'Эффект изменён: {count}.',
      intervalSet: 'Время изменено: {count}.',
      directionSet: 'Направление изменено: {count}.',
      areaSet: 'Область изменена: {count}.',
      intensitySet: 'Интенсивность изменена: {count}.',
      layerAdded: 'Слой добавлен: {count}.',
      layerRemoved: 'Слой удалён: {count}.',
      nullCreated: 'Новых областей без эффектов: {count}.',
      nullRemoved: 'Удалено областей без эффектов: {count}.',
      presetApplied: 'Пресет «{name}» применён: {count}.',
      journalRebuilt: 'Раздаточные материалы «{help}» и «{deck}» пересозданы.',
      triggerAdded: 'Триггер добавлен: {count}.',
      triggerRemoved: 'Триггер удалён: {count}.',
      triggersCleared: 'Триггеры удалены у эффектов: {count}.',
      throttled:
        'Эффекты на странице «{page}» прореживаются: они запросили больше {max} появлений в секунду. Снизьте их интенсивность или поднимите предел командой !pagefx set maxSpawnsPerSecond.',
      settingChanged: '{setting} теперь {value}.',
      problem: 'Эффект «{name}» не может работать: {reason}',
    },
    menu: {
      page: 'Страница',
      live: 'эффекты работают здесь',
      notLive: 'здесь нет игроков',
      allPausedNote: 'Все эффекты приостановлены.',
      effectsHere: 'Эффекты на этой странице',
      noEffectsHere: 'На этой странице пока нет эффектов.',
      otherPages: 'Другие страницы',
      effectCount: 'Эффектов: {count}',
      actions: 'Новое',
      selectHint:
        'Сначала выберите токен на карте, затем нажмите «Новый эффект» или «Область без эффектов». Токен отмечает место эффекта, а его Aura 1 — это область.',
      state: 'Состояние',
      area: 'Область',
      areaValue: '{radius} {units} за краем токена, {shape}',
      circle: 'круг',
      square: 'квадрат',
      circleOption: 'Круг',
      squareOption: 'Квадрат',
      layers: 'Слои',
      layer: 'Слой {n}',
      noLayers: 'Слоёв нет. Добавьте слой, чтобы выбрать, что создаёт этот эффект.',
      noFxSet: 'не задано',
      timing: 'каждые {min}–{max} мс',
      directionRandom: 'случайное направление',
      directionOffset: 'смещение конца в клетках: {dx}, {dy}',
      v1Note:
        'Этот эффект всё ещё следует GM Notes и полоскам своего токена, как в PageFX 1.x. Изменение здесь это прекратит.',
      preset: 'Пресет',
      presetsHint:
        'Выберите на карте один или несколько токенов, затем нажмите пресет. Токены, которые ещё не эффекты, станут эффектами, а их Aura 1 — область, которую заполняет пресет.',
      triggers: 'Триггеры',
      noTriggers: 'Триггеров нет: эффект работает, пока на его странице есть игроки.',
      triggerHint:
        'Для триггера хода или области другого токена сначала выберите этот токен на карте.',
      yes: 'Да',
      no: 'Нет',
    },
    buttons: {
      edit: 'Изменить',
      show: 'Показать',
      turnOn: 'Включить',
      turnOff: 'Выключить',
      pause: 'Пауза',
      resume: 'Продолжить',
      fire: 'Вызвать',
      pauseAll: 'Пауза для всех',
      resumeAll: 'Продолжить все',
      create: 'Новый эффект',
      createNull: 'Область без эффектов',
      removeNull: 'Убрать область без эффектов',
      settings: 'Настройки',
      status: 'Состояние',
      rescan: 'Повторный поиск',
      rename: 'Переименовать',
      area: 'Область',
      intensity: 'Интенсивность',
      builtin: 'Встроенные FX',
      saved: 'Сохранённые FX',
      json: 'Свой JSON',
      timing: 'Время',
      random: 'Случайное направление',
      offset: 'Задать направление',
      addLayer: 'Добавить слой',
      removeLayer: 'Удалить слой',
      delete: 'Удалить эффект',
      preset: 'Пресет',
      presets: 'Пресеты',
      remove: 'Удалить',
      help: 'Справка',
      rebuild: 'Пересоздать материалы',
      onRound: 'Каждый раунд',
      onTurn: 'В ход',
      onEnter: 'Токен входит',
      onLeave: 'Токен выходит',
      menu: 'Меню',
      change: 'Изменить',
    },
    prompts: {
      type: 'Тип эффекта',
      colour: 'Цвет',
      saved: 'Сохранённый свой FX',
      json: 'Описание своего FX (JSON)',
      intervalMin: 'Наименьшее время между появлениями в мс',
      intervalMax: 'Наибольшее время между появлениями в мс',
      dx: 'Клеток вбок до конца (минус — влево)',
      dy: 'Клеток вниз до конца (минус — вверх)',
      name: 'Название эффекта',
      radius: 'Радиус области за краем токена в единицах страницы',
      shape: 'Форма области',
      intensity: 'Интенсивность (от {min} до {max})',
      maxSpawns: 'Появлений в секунду на одной странице (от 1 до {max})',
      preset: 'Пресет',
      then: 'Затем',
      every: 'Раз в сколько раундов',
      who: 'Какие токены учитываются',
      area: 'Какая область',
      once: 'Только в первый раз?',
      confirmDelete: 'Удалить этот эффект? Токен останется на карте.',
    },
    settings: {
      language: 'Язык',
      globalIntensity: 'Интенсивность всех эффектов',
      gmPreviewHint:
        'Если включено, эффекты работают и на странице, которую смотрит каждый мастер, даже если там нет игроков.',
      maxSpawnsHint:
        'На странице, которая просит больше, эффекты прореживаются. Roll20 работает плавно примерно до 60.',
    },
    status: {
      livePages: 'Активные страницы',
      effects: 'Эффекты',
      running: 'Работает',
      globalPause: 'Всё на паузе',
      on: 'Вкл.',
      off: 'Выкл.',
      pausedState: 'На паузе',
      waiting: 'Не на активной странице',
      noFx: 'Эффект не выбран',
      broken: 'Не может работать',
      nullAreas: 'Области без эффектов',
      noEffects:
        'Эффектов пока нет. Выберите токен и введите !pagefx create или откройте меню командой !pagefx.',
      gmPreview: 'Просмотр страницы мастера',
      intensity: 'Интенсивность',
      maxSpawns: 'Макс. появлений в секунду на страницу',
    },
    help: {
      menu: 'Открыть меню: эффекты на вашей странице и кнопки для всего остального.',
      create:
        'Сделать выбранные токены эффектами. Их Aura 1 — это область; если ауры нет, она будет добавлена.',
      edit: 'Показать карточку каждого выбранного эффекта с кнопками для его изменения.',
      preset:
        'Применить пресет к выбранным токенам, при необходимости сначала сделав их эффектами.',
      presets: 'Список пресетов по наборам.',
      switches:
        'Включить или выключить выбранные эффекты либо приостановить и возобновить их. Если ничего не выбрано, on и resume снова запускают всё, а off и pause всё останавливают (как !pageFX on и off в версии 1).',
      fire: 'Вызвать выбранные эффекты сейчас, один или несколько раз, чтобы опробовать их.',
      fx: 'Задать, что создаёт слой: встроенный эффект, например burn-fire, имя сохранённого своего FX или описание своего FX в JSON.',
      interval:
        'Задать время между появлениями слоя в миллисекундах. Каждая пауза выбирается между двумя значениями.',
      direction:
        'Для лучевых эффектов задать, где заканчивается каждое появление: случайно или через заданное число клеток вбок и вниз от начала.',
      area: 'Задать область: радиус Aura 1 токена в единицах страницы и её форму.',
      intensity:
        'Умножить частоту появления выбранных эффектов (от 0.1 до 5). С global — изменить её для всех эффектов.',
      name: 'Переименовать выбранные эффекты.',
      layer: 'Добавить слой, чтобы один эффект создавал несколько вещей, или удалить слой.',
      triggerAdd:
        'Добавить триггер: на round, turn, enter или leave выполнить start, stop, toggle, fire или burst. Параметры: every=2, round=3, count=5, who=players|all|named, names=A;B, area=selected, once.',
      triggerRemove: 'Удалить один триггер или все триггеры у выбранных эффектов.',
      null: 'Сделать выбранные токены областями без эффектов, где эффекты никогда не появляются, или отменить это.',
      delete: 'Снять эффект с выбранных токенов. Токены останутся на карте.',
      status: 'Список всех эффектов, их страниц и того, работают ли они.',
      settings: 'Показать настройки.',
      set: 'Изменить настройку: language, gmPagePreview, intensity или maxSpawnsPerSecond.',
      rescan:
        'Взять под управление новые токены с именами PageFX или NullFX и забыть эффекты, чьи токены удалены.',
      journal: 'Пересоздать раздаточные материалы справки и Command Deck.',
      help: 'Показать этот список.',
      handout:
        'Полные инструкции — в раздаточном материале «{help}», кнопки в один щелчок — в «{deck}».',
    },
    deck: {
      menuTitle: 'Меню',
      menuDesc: 'Главное меню показывает эффекты на вашей странице. «Состояние» показывает все.',
      newTitle: 'Новое',
      newDesc:
        'Сначала выберите на карте один или несколько токенов. Их Aura 1 станет областью, которую заполняет эффект.',
      selectedTitle: 'Выбранные эффекты',
      selectedDesc: 'Выберите токены эффектов на карте, затем нажмите кнопку.',
      allTitle: 'Всё сразу',
      allDesc: 'Остановить все эффекты или снова запустить их все.',
      toolsTitle: 'Инструменты',
      toolsDesc: 'Подхватить скопированные или удалённые токены и пересоздать эти материалы.',
      footer: 'Полные инструкции — в раздаточном материале «{help}».',
    },
    handout: {
      versionLabel: 'Версия',
      subtitle: 'Погода и фоновые эффекты для карт Roll20',
      footer: 'Кнопки управления в один щелчок — в раздаточном материале «{deck}».',
      overview: {
        heading: 'Обзор',
        body: 'PageFX заполняет область карты непрерывными эффектами: дождём, снегом, угольками, паром, светлячками и многим другим. Токен отмечает место каждого эффекта, а его Aura 1 — это область. Эффекты работают на каждой странице, где есть игроки, в том числе на страницах, куда отправлена часть разделённой группы, и останавливаются, когда игроки уходят. Всё настраивается через меню в чате, а триггеры могут запускать и останавливать эффекты по ходу боевых раундов или при движении токенов.',
        demo: 'Посмотреть короткую демонстрацию (из версии 1)',
      },
      quickStart: {
        heading: 'Быстрый старт',
        steps: [
          'Поставьте токен туда, где должен быть эффект (на слое мастера он скрыт от игроков), и выберите его.',
          'Введите !pagefx presets или откройте Command Deck и нажмите «Пресеты», затем нажмите пресет, например «Сильный дождь».',
          'Измените размер Aura 1 токена, чтобы задать область, которую заполняет эффект. Аура скрыта от игроков.',
          'Переместите игроков на страницу. Эффект запустится и остановится, когда они уйдут.',
          'Введите !pagefx, чтобы открыть меню, и нажмите «Изменить» у эффекта, чтобы изменить его.',
        ],
      },
      effects: {
        heading: 'Эффекты',
        points: [
          'Эффект — это токен плюс настройки, которые хранит PageFX. Переместите токен, чтобы переместить эффект, и измените его Aura 1, чтобы изменить область. Удаление токена удаляет эффект.',
          'У каждого эффекта один или несколько слоёв. Каждый слой снова и снова создаёт одну вещь со случайной паузой между наименьшим и наибольшим временем.',
          'Слой может создавать встроенный эффект Roll20 (тип и цвет, например burn-fire), свой FX, сохранённый в игре, или описание своего FX, вставленное как JSON. Недостающие значения в описании заполняются, поэтому даже короткое описание рисуется.',
          'Лучевые эффекты (beam, breath, splatter и свои FX с углом -1) рисуются между двумя точками. Их направление случайное или задано числом клеток вбок и вниз.',
          'Интенсивность умножает частоту появления эффекта. Настройка intensity умножает все эффекты.',
          '«Выключить» останавливает эффект, пока его не включат. «Пауза» задерживает его, пока его не возобновят. «Пауза для всех» задерживает все эффекты, не меняя их.',
          'Jumpgate рисует описания своих FX белым цветом, если они не сохранены как свои FX, поэтому PageFX сохраняет свои описания как свои FX с именами «PageFX: …». Они удаляются, когда их не использует ни один эффект. Не трогайте их.',
        ],
      },
      pages: {
        heading: 'На каких страницах работают эффекты',
        points: [
          'Эффекты работают на странице с лентой игроков и на каждой странице, куда игрок был перемещён отдельно.',
          'Включите «Просмотр страницы мастера», чтобы эффекты работали и на странице, которую смотрит каждый мастер, и их можно было опробовать без игроков.',
          'Каждая страница получает не больше «Макс. появлений в секунду» (по умолчанию 30). Если эффекты просят больше, часть появлений пропускается, и мастеру сообщается об этом один раз.',
          'Когда другой мод перемещает ленту или разделяет группу, Roll20 никому об этом не сообщает, поэтому PageFX проверяет это каждые несколько секунд и догоняет.',
        ],
      },
      presets: {
        heading: 'Пресеты',
        intro:
          'Пресет даёт эффекту набор готовых слоёв. Если потом изменить слой, эффект становится вашим собственным. Другие моды могут добавлять пресеты через PageFX.registerPreset.',
        colPack: 'Набор',
        colPresets: 'Пресеты (название и ID)',
      },
      triggers: {
        heading: 'Триггеры',
        intro:
          'Триггер запускает, останавливает, переключает или вызывает эффект, когда что-то происходит. Добавляйте их с карточки эффекта или командой !pagefx trigger add.',
        points: [
          'Каждый раунд: Roll20 не хранит номер раунда, поэтому раунд начинается, когда порядок ходов переходит с последней записи обратно на первую. Если есть своя запись порядка ходов с именем «Round», используется она. Выберите «раз в сколько-то раундов» или один раунд. Первый раунд боя не считается сменой.',
          'В ход: когда выбранный токен оказывается первым в порядке ходов. Перед нажатием кнопки выберите токен на карте.',
          'Токен входит или выходит: когда токен входит в область эффекта или в Aura 1 другого выбранного вами токена либо выходит из неё. По умолчанию учитываются только токены под управлением игроков; можно выбрать любой токен или указать имена.',
          '«Вызвать серию» создаёт эффект несколько раз сразу. «Только в первый раз» заставляет триггер сработать один раз.',
          'Roll20 ничего не сообщает модам, когда другой мод перемещает токен. Моды, которые перемещают токены, могут затем вызвать PageFX.checkToken(token).',
        ],
      },
      nullAreas: {
        heading: 'Области без эффектов',
        points: [
          'Область без эффектов — это токен, где эффекты никогда не появляются, например внутри дома во время бури. Её область — это токен и его Aura 1.',
          'Выберите токен и нажмите «Область без эффектов» в меню или Command Deck. Токены с именем NullFX, как в версии 1, тоже являются областями без эффектов.',
        ],
      },
      commands: {
        heading: 'Команды',
        intro:
          'Эти команды доступны только мастерам. Они действуют на выбранные токены или на токены, указанные через --ids. Команды слоёв действуют на слой 1, если --layer не указывает другой. Другие моды тоже могут их отправлять; ответы приходят мастеру.',
        colCommand: 'Команда',
        colDesc: 'Что делает',
      },
      settings: {
        heading: 'Настройки',
        intro:
          'Меняйте настройки с карточки «Настройки» или командой !pagefx set. Язык также можно задать на странице настроек мода.',
        colKey: 'Настройка',
        colDesc: 'Что делает',
        rows: {
          language: 'Язык меню, сообщений и раздаточных материалов PageFX.',
          gmPagePreview:
            'Также запускать эффекты на странице, которую смотрит каждый мастер (по умолчанию выключено).',
          intensity: 'Умножает частоту появления всех эффектов (по умолчанию 1).',
          maxSpawnsPerSecond:
            'Наибольшее число появлений на одной странице в секунду, от 1 до 60 (по умолчанию 30).',
        },
      },
      api: {
        heading: 'Для других модов',
        intro:
          'PageFX публикует объект PageFX. Там, где функция принимает токен, подойдёт и ID токена.',
        colFunction: 'Функция',
        colDesc: 'Что делает',
        rows: {
          activateAll: 'Возобновить все эффекты (версия 1).',
          deactivateAll: 'Приостановить все эффекты (версия 1).',
          activate: 'Включить, выключить или переключить один эффект (версия 1).',
          start: 'Включить или выключить один эффект либо приостановить и возобновить его.',
          setIntensity: 'Изменить интенсивность одного эффекта.',
          fire: 'Вызвать один эффект сейчас.',
          create:
            'Сделать токен эффектом с параметрами name, fx, interval, direction и intensity или снять с него эффект.',
          getEffect:
            'Прочитать эффект, перечислить эффекты (на одной странице) или узнать, работает ли эффект.',
          registerPreset: 'Добавить пресет на этот сеанс или перечислить пресеты.',
          checkToken: 'Проверить токен, перемещённый вашим модом, на триггеры входа и выхода.',
        },
      },
      upgrading: {
        heading: 'Переход с версии 1',
        points: [
          'Токены с именами PageFX и NullFX берутся под управление при первом запуске и работают как раньше.',
          'Пока вы не измените эффект из чата, им по-прежнему управляют GM Notes, Bar 1 (время между появлениями) и Bar 2 (направление луча) его токена, а маркер «запрет» по-прежнему его выключает. Как только вы измените его из чата, GM Notes и полоски снова в вашем распоряжении.',
          'Версия 1 рисовала эффекты только на странице с лентой игроков и создавала сохранённые свои FX дважды. Обе ошибки исправлены.',
          'Команды версии 1 по-прежнему работают:',
        ],
        colV1: 'Команда версии 1',
        colV2: 'То же, что',
      },
      troubleshooting: {
        heading: 'Решение проблем',
        points: [
          'Эффект не работает: откройте его карточку. Строка «Состояние» объясняет почему: выключен, на паузе, эффект не выбран, не может работать (с причиной) или не на активной странице (там нет игроков; чтобы опробовать, включите «Просмотр страницы мастера»).',
          'Ничего не видно: очень мелкие или быстро исчезающие частицы трудно заметить на пёстрой карте. Попробуйте пресет, поднимите интенсивность или уменьшите область.',
          'Эффекты выглядят жидко: возможно, страница упёрлась в «Макс. появлений в секунду». Снизьте интенсивность некоторых эффектов или поднимите предел.',
          'Эффекты остановились после копирования страницы или игры: нажмите «Повторный поиск».',
          'Во всех остальных случаях проверьте журнал консоли API и приложите его сообщения, когда просите о помощи.',
        ],
      },
      languages: {
        heading: 'Языки',
        body: 'Выберите язык на карточке «Настройки» или командой !pagefx set language. Доступные языки:',
        colLanguage: 'Язык',
        colNative: 'Родное название',
        colCode: 'Код',
      },
      credits: {
        heading: 'Благодарности',
        original: 'Автор оригинального мода:',
        maintainer: 'Версию 2 поддерживает',
        marketplace: 'Наборы рисунков Ada на Roll20 Marketplace',
        support:
          'Если вы нашли ошибку или у вас есть идея, напишите на форуме модов Roll20 или откройте issue на GitHub и приложите сообщения из журнала консоли API.',
      },
    },
    triggers: {
      line: '{when}: {action}',
      eachRound: 'Каждый новый раунд',
      everyRounds: 'Каждый {n}-й раунд',
      onRound: 'В раунде {n}',
      turn: 'Когда начинается ход {name}',
      enter: 'Когда {who} входит в {area}',
      leave: 'Когда {who} покидает {area}',
      areaSelf: 'область этого эффекта',
      areaSelected: 'область ауры выбранного токена',
      areaOf: 'область ауры {name}',
      unnamed: 'токен',
      once: '(только в первый раз)',
      onceUsed: '(только в первый раз, уже сработал)',
      who: {
        players: 'токен игрока',
        all: 'любой токен',
      },
      action: {
        start: 'запустить',
        stop: 'остановить',
        toggle: 'включить или выключить',
        fire: 'вызвать один раз',
        burst: 'вызвать серию из {count}',
      },
      choice: {
        start: 'Запустить',
        stop: 'Остановить',
        toggle: 'Включить или выключить',
        fire: 'Вызвать один раз',
        burst: 'Вызвать серию',
      },
    },
    packs: {
      weather: 'Погода',
      fire: 'Огонь и жар',
      water: 'Вода',
      magic: 'Магия и жуть',
      custom: 'Из других модов',
    },
    presets: {
      'light-rain': 'Слабый дождь',
      'heavy-rain': 'Сильный дождь',
      thunderstorm: 'Гроза',
      snow: 'Снег',
      blizzard: 'Метель',
      hail: 'Град',
      sandstorm: 'Песчаная буря',
      fog: 'Клочья тумана',
      embers: 'Угольки',
      ash: 'Падающий пепел',
      magma: 'Бурлящая магма',
      'lava-spurts': 'Брызги лавы',
      sparks: 'Искры',
      drips: 'Капель в пещере',
      steam: 'Паровые выбросы',
      geyser: 'Гейзер',
      spray: 'Брызги водопада',
      bubbles: 'Пузыри',
      fireflies: 'Светлячки',
      'arcane-motes': 'Магические искорки',
      'necrotic-mist': 'Некротический туман',
      'holy-glimmer': 'Священное мерцание',
      'swamp-gas': 'Болотный газ',
    },
    fx: {
      empty: 'эффект не задан.',
      badJson: 'описание своего FX не является корректным JSON.',
      unknownColour: 'встроенного цвета «{colour}» нет. Цвета: {colours}.',
      savedMissing: 'сохранённого своего FX с именем «{name}» нет.',
      cannotCreate: 'Roll20 не создал для него объект своего FX.',
      spawnFailed: 'Roll20 не смог его создать ({message}).',
    },
    errors: {
      unknownCommand: 'Неизвестная команда: {command}',
      noEffects: 'Выберите один или несколько токенов PageFX или укажите их ID через --ids.',
      selectToken: 'Сначала выберите один или несколько токенов или укажите их ID через --ids.',
      unknownIds: 'Это не эффекты PageFX: {ids}',
      badSetting: 'Неизвестная настройка или значение: {setting} {value}',
      noLayer: 'У «{name}» нет слоя {n}.',
      tooManyLayers: 'У эффекта может быть не больше {max} слоёв.',
      layerUsage: 'Используйте !pagefx layer add [effect] или !pagefx layer remove <number>.',
      nullUsage: 'Используйте !pagefx null create или !pagefx null remove.',
      isEffect: '«{name}» — эффект, поэтому он не может быть ещё и областью без эффектов.',
      badInterval: 'Укажите время между появлениями в мс, например: !pagefx interval 500 1500',
      badDirection: 'Укажите random или число клеток вбок и вниз, например: !pagefx direction 2 -1',
      badArea:
        'Укажите радиус в единицах страницы и circle или square, например: !pagefx area 15 circle',
      badIntensity: 'Укажите интенсивность больше 0, например: !pagefx intensity 1.5',
      noName: 'Укажите название, например: !pagefx name Дождь над причалами',
      triggerUsage:
        'Используйте !pagefx trigger add <round|turn|enter|leave> <start|stop|toggle|fire|burst> [every=2] [round=3] [count=5] [who=players|all|named] [names=A;B] [area=self|selected] [once] или !pagefx trigger remove <number>.',
      triggerToken:
        'Сначала выберите на карте токен, к которому относится этот триггер, или укажите token=<id>.',
      triggerNames:
        'Укажите имена токенов через names=, разделяя их знаком ; (например names=Goblin;Orc).',
      tooManyTriggers: 'У эффекта может быть не больше {max} триггеров.',
      noTrigger: 'У «{name}» нет триггера {n}.',
      journalUsage: 'Используйте !pagefx journal rebuild.',
      unknownPreset: 'Пресета «{id}» нет. Введите !pagefx presets, чтобы увидеть их.',
      unexpected: 'Что-то пошло не так: {message}',
    },
  };

  var localeEs = {
    titles: {
      ready: 'PageFX está listo.',
      menu: 'PageFX',
      status: 'Estado de PageFX',
      settings: 'Ajustes de PageFX',
      presets: 'Preajustes de PageFX',
      help: 'Comandos de PageFX',
      effect: 'Efecto: {name}',
    },
    messages: {
      readyHint: 'Escribe !pagefx para abrir el menú.',
      adopted:
        'Se han adoptado {effects} efecto(s) y {nulls} zona(s) sin efectos de fichas de PageFX 1.x. Siguen funcionando como antes.',
      rescanned:
        'El nuevo escaneo encontró {effects} efecto(s) nuevo(s) y {nulls} zona(s) sin efectos nueva(s), y olvidó {dropped} cuyas fichas se borraron.',
      allPaused: 'Todos los efectos están en pausa. Usa !pagefx resume para reanudarlos.',
      allResumed: 'Los efectos vuelven a funcionar.',
      turnedOn: 'Encendidos: {count}.',
      turnedOff: 'Apagados: {count}.',
      toggled: 'Encendidos o apagados: {count}.',
      paused: 'En pausa: {count}.',
      resumed: 'Reanudados: {count}.',
      fired: 'Se generaron {count} efecto(s).',
      created: 'Efectos nuevos: {count}. Elige en su tarjeta qué genera cada uno.',
      deleted: 'Efectos quitados: {count}. Sus fichas siguen en el mapa.',
      renamed: 'Renombrados: {count}.',
      fxSet: 'Efecto cambiado: {count}.',
      intervalSet: 'Tiempo cambiado: {count}.',
      directionSet: 'Dirección cambiada: {count}.',
      areaSet: 'Área cambiada: {count}.',
      intensitySet: 'Intensidad cambiada: {count}.',
      layerAdded: 'Capa añadida: {count}.',
      layerRemoved: 'Capa quitada: {count}.',
      nullCreated: 'Zonas sin efectos nuevas: {count}.',
      nullRemoved: 'Zonas sin efectos quitadas: {count}.',
      presetApplied: 'Preajuste {name} aplicado: {count}.',
      journalRebuilt: 'Se han reconstruido los folletos "{help}" y "{deck}".',
      triggerAdded: 'Disparador añadido: {count}.',
      triggerRemoved: 'Disparador quitado: {count}.',
      triggersCleared: 'Disparadores quitados de {count} efecto(s).',
      throttled:
        'Los efectos de la página "{page}" se están reduciendo: pedían más de {max} apariciones por segundo. Baja su intensidad o sube el límite con !pagefx set maxSpawnsPerSecond.',
      settingChanged: '{setting} es ahora {value}.',
      problem: 'El efecto "{name}" no puede funcionar: {reason}',
    },
    menu: {
      page: 'Página',
      live: 'aquí funcionan los efectos',
      notLive: 'no hay jugadores aquí',
      allPausedNote: 'Todos los efectos están en pausa.',
      effectsHere: 'Efectos en esta página',
      noEffectsHere: 'Aún no hay efectos en esta página.',
      otherPages: 'Otras páginas',
      effectCount: '{count} efecto(s)',
      actions: 'Nuevo',
      selectHint:
        'Selecciona primero una ficha en el mapa y luego pulsa Nuevo efecto o Zona sin efectos. La ficha marca dónde aparece el efecto; su Aura 1 es el área.',
      state: 'Estado',
      area: 'Área',
      areaValue: '{radius} {units} más allá de la ficha, {shape}',
      circle: 'círculo',
      square: 'cuadrado',
      circleOption: 'Círculo',
      squareOption: 'Cuadrado',
      layers: 'Capas',
      layer: 'Capa {n}',
      noLayers: 'No hay capas. Añade una para elegir qué genera este efecto.',
      noFxSet: 'sin definir',
      timing: 'cada {min}–{max} ms',
      directionRandom: 'dirección aleatoria',
      directionOffset: 'termina a {dx}, {dy} casillas',
      v1Note:
        'Este efecto aún sigue las notas del DJ ("GM Notes") y las barras de su ficha, como en PageFX 1.x. Cambiarlo aquí lo detiene.',
      preset: 'Preajuste',
      presetsHint:
        'Selecciona una o más fichas en el mapa y luego pulsa un preajuste. Las fichas que aún no son efectos se convierten en efectos, y su Aura 1 es el área que llena el preajuste.',
      triggers: 'Disparadores',
      noTriggers: 'Sin disparadores: el efecto funciona siempre que haya jugadores en su página.',
      triggerHint:
        'Para un disparador de turno, o un área de otra ficha, selecciona primero esa ficha en el mapa.',
      yes: 'Sí',
      no: 'No',
    },
    buttons: {
      edit: 'Editar',
      show: 'Mostrar',
      turnOn: 'Encender',
      turnOff: 'Apagar',
      pause: 'Pausar',
      resume: 'Reanudar',
      fire: 'Lanzar',
      pauseAll: 'Pausar todo',
      resumeAll: 'Reanudar todo',
      create: 'Nuevo efecto',
      createNull: 'Zona sin efectos',
      removeNull: 'Quitar zona sin efectos',
      settings: 'Ajustes',
      status: 'Estado',
      rescan: 'Reescanear',
      rename: 'Renombrar',
      area: 'Área',
      intensity: 'Intensidad',
      builtin: 'FX integrado',
      saved: 'FX guardado',
      json: 'JSON propio',
      timing: 'Tiempo',
      random: 'Dirección aleatoria',
      offset: 'Fijar dirección',
      addLayer: 'Añadir capa',
      removeLayer: 'Quitar capa',
      delete: 'Borrar efecto',
      preset: 'Preajuste',
      presets: 'Preajustes',
      remove: 'Quitar',
      help: 'Ayuda',
      rebuild: 'Reconstruir folletos',
      onRound: 'Cada ronda',
      onTurn: 'En un turno',
      onEnter: 'Ficha entra',
      onLeave: 'Ficha sale',
      menu: 'Menú',
      change: 'Cambiar',
    },
    prompts: {
      type: 'Tipo de efecto',
      colour: 'Color',
      saved: 'FX personalizado guardado',
      json: 'Definición de FX personalizado (JSON)',
      intervalMin: 'Tiempo mínimo entre apariciones, en ms',
      intervalMax: 'Tiempo máximo entre apariciones, en ms',
      dx: 'Casillas a lo ancho hasta el final (negativo es a la izquierda)',
      dy: 'Casillas hacia abajo hasta el final (negativo es hacia arriba)',
      name: 'Nombre del efecto',
      radius: 'Radio del área más allá de la ficha, en unidades de página',
      shape: 'Forma del área',
      intensity: 'Intensidad ({min} a {max})',
      maxSpawns: 'Apariciones por segundo en una página (1 a {max})',
      preset: 'Preajuste',
      then: 'Luego',
      every: 'Cada cuántas rondas',
      who: 'Qué fichas cuentan',
      area: 'Qué área',
      once: '¿Solo la primera vez?',
      confirmDelete: '¿Borrar este efecto? La ficha se queda en el mapa.',
    },
    settings: {
      language: 'Idioma',
      globalIntensity: 'Intensidad de todos los efectos',
      gmPreviewHint:
        'Si está activado, los efectos también funcionan en la página que mira cada DJ, aunque no haya jugadores en ella.',
      maxSpawnsHint:
        'Los efectos se reducen en una página que pide más. Roll20 va fluido hasta unos 60.',
    },
    status: {
      livePages: 'Páginas activas',
      effects: 'Efectos',
      running: 'En marcha',
      globalPause: 'Todo en pausa',
      on: 'Encendido',
      off: 'Apagado',
      pausedState: 'En pausa',
      waiting: 'No está en una página activa',
      noFx: 'Ningún efecto elegido',
      broken: 'No puede funcionar',
      nullAreas: 'Zonas sin efectos',
      noEffects:
        'Aún no hay efectos. Selecciona una ficha y escribe !pagefx create, o abre el menú con !pagefx.',
      gmPreview: 'Vista previa de página del DJ',
      intensity: 'Intensidad',
      maxSpawns: 'Máximo de apariciones por segundo, por página',
    },
    help: {
      menu: 'Abre el menú: los efectos de tu página y botones para todo lo demás.',
      create:
        'Convierte las fichas seleccionadas en efectos. Su Aura 1 es el área; se añade una si no tienen.',
      edit: 'Muestra la tarjeta de cada efecto seleccionado, con botones para cambiarlo.',
      preset:
        'Da un preajuste a las fichas seleccionadas, convirtiéndolas antes en efectos si hace falta.',
      presets: 'Lista los preajustes, por paquete.',
      switches:
        'Enciende o apaga los efectos seleccionados, o ponlos en pausa y reanúdalos. Sin nada seleccionado, on y resume lo ponen todo en marcha otra vez, y off y pause lo detienen todo (como hacían !pageFX on y off en la versión 1).',
      fire: 'Genera ahora los efectos seleccionados, una o unas pocas veces, para probarlos.',
      fx: 'Define qué genera una capa: un efecto integrado como burn-fire, el nombre de un FX personalizado guardado, o una definición de FX personalizado en JSON.',
      interval:
        'Define el tiempo entre apariciones de una capa, en milisegundos. Cada espera se elige entre los dos valores.',
      direction:
        'Para efectos tipo haz, define dónde termina cada aparición: random, o casillas a lo ancho y hacia abajo desde donde empieza.',
      area: 'Define el área: el radio del Aura 1 de la ficha en unidades de página, y su forma.',
      intensity:
        'Multiplica la frecuencia con que aparecen los efectos seleccionados (0.1 a 5). Con global, la cambia para todos los efectos.',
      name: 'Cambia el nombre de los efectos seleccionados.',
      layer: 'Añade una capa, para que un efecto genere varias cosas, o quita una.',
      triggerAdd:
        'Añade un disparador: con round, turn, enter o leave, hace start, stop, toggle, fire o burst. Opciones: every=2, round=3, count=5, who=players|all|named, names=A;B, area=selected, once.',
      triggerRemove: 'Quita un disparador, o todos, de los efectos seleccionados.',
      null: 'Convierte las fichas seleccionadas en zonas sin efectos, donde nunca aparece ningún efecto, o deja de hacerlo.',
      delete: 'Quita el efecto de las fichas seleccionadas. Las fichas se quedan en el mapa.',
      status: 'Lista todos los efectos, su página y si están en marcha.',
      settings: 'Muestra los ajustes.',
      set: 'Cambia un ajuste: language, gmPagePreview, intensity o maxSpawnsPerSecond.',
      rescan:
        'Adopta las fichas nuevas llamadas PageFX o NullFX y olvida los efectos cuyas fichas se borraron.',
      journal: 'Reconstruye los folletos de ayuda y de Command Deck.',
      help: 'Muestra esta lista.',
      handout:
        'Las instrucciones completas están en el folleto "{help}"; los botones de un clic están en "{deck}".',
    },
    deck: {
      menuTitle: 'Menú',
      menuDesc: 'El menú principal lista los efectos de tu página. Estado los lista todos.',
      newTitle: 'Nuevo',
      newDesc:
        'Selecciona primero una o más fichas en el mapa. Su Aura 1 se convierte en el área que llena el efecto.',
      selectedTitle: 'Efectos seleccionados',
      selectedDesc: 'Selecciona fichas de efecto en el mapa y luego pulsa un botón.',
      allTitle: 'Todo',
      allDesc: 'Detén todos los efectos o vuelve a ponerlos todos en marcha.',
      toolsTitle: 'Herramientas',
      toolsDesc: 'Recoge fichas copiadas o borradas y reconstruye estos folletos.',
      footer: 'Consulta el folleto "{help}" para ver las instrucciones completas.',
    },
    handout: {
      versionLabel: 'Versión',
      subtitle: 'Efectos meteorológicos y ambientales para mapas de Roll20',
      footer: 'Usa el folleto "{deck}" para tener controles de un clic.',
      overview: {
        heading: 'Descripción general',
        body: 'PageFX llena un área del mapa con efectos continuos: lluvia, nieve, brasas, vapor, luciérnagas y más. Una ficha marca el lugar de cada efecto, y su Aura 1 es el área. Los efectos funcionan en todas las páginas que tienen jugadores, incluidas las páginas a las que se ha enviado parte de un grupo dividido, y se detienen cuando los jugadores se van. Todo se configura desde menús del chat, y los disparadores pueden iniciar o detener efectos a medida que pasan las rondas de combate o se mueven las fichas.',
        demo: 'Ver una breve demostración (de la versión 1)',
      },
      quickStart: {
        heading: 'Inicio rápido',
        steps: [
          'Pon una ficha donde deba estar el efecto (la capa del DJ la mantiene oculta a los jugadores) y selecciónala.',
          'Escribe !pagefx presets, o abre el Command Deck y haz clic en Preajustes; luego haz clic en un preajuste, como Lluvia intensa.',
          'Cambia el tamaño del Aura 1 de la ficha para fijar el área que llena el efecto. El aura está oculta a los jugadores.',
          'Mueve a los jugadores a la página. El efecto empieza, y se detiene de nuevo cuando se van.',
          'Escribe !pagefx para abrir el menú y haz clic en Editar en un efecto para cambiarlo.',
        ],
      },
      effects: {
        heading: 'Efectos',
        points: [
          'Un efecto es una ficha más los ajustes que guarda PageFX. Mueve la ficha para mover el efecto, y cambia su Aura 1 para cambiar el área. Borrar la ficha borra el efecto.',
          'Cada efecto tiene una o más capas. Cada capa genera una cosa, una y otra vez, con una espera aleatoria entre su tiempo mínimo y máximo.',
          'Una capa puede generar un efecto integrado de Roll20 (tipo y color, como burn-fire), un FX personalizado guardado en la partida, o una definición de FX personalizado pegada como JSON. Los valores que faltan en una definición se rellenan, así que una definición corta también se dibuja.',
          'Los efectos tipo haz (beam, breath, splatter y los FX personalizados con ángulo -1) se dibujan entre dos puntos. Su dirección es aleatoria, o un número fijo de casillas a lo ancho y hacia abajo.',
          'La intensidad multiplica la frecuencia con que aparece un efecto. El ajuste intensity multiplica todos los efectos.',
          'Apagar detiene un efecto hasta que se enciende. Pausar lo detiene hasta que se reanuda. Pausar todo detiene todos los efectos sin cambiarlos.',
          'Jumpgate dibuja en blanco las definiciones de FX personalizado a menos que estén guardadas como FX personalizados, así que PageFX guarda las suyas como FX personalizados llamados “PageFX: …”. Se quitan cuando ningún efecto las usa. Déjalas donde están.',
        ],
      },
      pages: {
        heading: 'Qué páginas funcionan',
        points: [
          'Los efectos funcionan en la página con la cinta de jugadores y en cada página a la que se ha movido a un jugador por separado.',
          'Activa Vista previa de página del DJ para que los efectos funcionen también en la página que mira cada DJ, y así probarlos sin jugadores.',
          'Cada página recibe como mucho el Máximo de apariciones por segundo (30 por defecto). Si los efectos piden más, se omiten algunas apariciones y se avisa al DJ una vez.',
          'Cuando otro Mod mueve la cinta o divide al grupo, Roll20 no avisa a nadie, así que PageFX lo comprueba cada pocos segundos y se pone al día.',
        ],
      },
      presets: {
        heading: 'Preajustes',
        intro:
          'Un preajuste da a un efecto un conjunto de capas ya preparadas. Cambiar una capa después hace que el efecto sea tuyo. Otros Mods pueden añadir preajustes con PageFX.registerPreset.',
        colPack: 'Paquete',
        colPresets: 'Preajustes (nombre e ID)',
      },
      triggers: {
        heading: 'Disparadores',
        intro:
          'Un disparador inicia, detiene, alterna o lanza un efecto cuando pasa algo. Añádelos desde la tarjeta del efecto o con !pagefx trigger add.',
        points: [
          'Cada ronda: Roll20 no lleva número de ronda, así que una ronda empieza cuando el orden de turnos avanza desde su última entrada de vuelta al principio. Si hay una entrada personalizada en el orden de turnos llamada “Round”, se usa esa. Elige cada cierto número de rondas, o una ronda concreta. La primera ronda de un combate no cuenta como cambio.',
          'En un turno: cuando una ficha elegida llega al principio del orden de turnos. Selecciona la ficha en el mapa antes de hacer clic en el botón.',
          'Ficha entra o sale: cuando una ficha entra en el área del efecto o sale de ella, o del Aura 1 de otra ficha que selecciones. Por defecto solo cuentan las fichas que controla un jugador; elige cualquier ficha o indica nombres.',
          'Lanzar una ráfaga genera el efecto varias veces a la vez. Solo la primera vez hace que un disparador se active una sola vez.',
          'Roll20 no avisa a los Mods cuando otro Mod mueve una ficha. Los Mods que mueven fichas pueden llamar después a PageFX.checkToken(token).',
        ],
      },
      nullAreas: {
        heading: 'Zonas sin efectos',
        points: [
          'Una zona sin efectos es una ficha donde nunca aparece ningún efecto, como el interior de una casa durante una tormenta. Su área es la ficha y su Aura 1.',
          'Selecciona la ficha y haz clic en Zona sin efectos en el menú o en el Command Deck. Las fichas llamadas NullFX, como en la versión 1, también son zonas sin efectos.',
        ],
      },
      commands: {
        heading: 'Comandos',
        intro:
          'Solo los DJ pueden usar estos comandos. Actúan sobre las fichas seleccionadas, o sobre las fichas indicadas con --ids. Los comandos de capa actúan sobre la capa 1 a menos que --layer diga otra cosa. Otros Mods también pueden enviarlos; las respuestas van al DJ.',
        colCommand: 'Comando',
        colDesc: 'Qué hace',
      },
      settings: {
        heading: 'Ajustes',
        intro:
          'Cambia los ajustes desde la tarjeta de Ajustes o con !pagefx set. El idioma también se puede elegir en la página de ajustes del Mod.',
        colKey: 'Ajuste',
        colDesc: 'Qué hace',
        rows: {
          language: 'El idioma de los menús, mensajes y folletos de PageFX.',
          gmPagePreview:
            'Hace que los efectos funcionen también en la página que mira cada DJ (desactivado por defecto).',
          intensity: 'Multiplica la frecuencia con que aparece cada efecto (1 por defecto).',
          maxSpawnsPerSecond:
            'El máximo de apariciones en una página cada segundo, de 1 a 60 (30 por defecto).',
        },
      },
      api: {
        heading: 'Para otros Mods',
        intro:
          'PageFX publica un objeto PageFX. Cuando una función recibe una ficha, también sirve el ID de la ficha.',
        colFunction: 'Función',
        colDesc: 'Qué hace',
        rows: {
          activateAll: 'Reanuda todos los efectos (versión 1).',
          deactivateAll: 'Pone en pausa todos los efectos (versión 1).',
          activate: 'Enciende un efecto, lo apaga o lo cambia al otro estado (versión 1).',
          start: 'Enciende o apaga un efecto, o lo pone en pausa y lo reanuda.',
          setIntensity: 'Cambia la intensidad de un efecto.',
          fire: 'Genera un efecto ahora.',
          create:
            'Convierte una ficha en un efecto, con las opciones name, fx, interval, direction e intensity; o se lo quita.',
          getEffect:
            'Lee un efecto, lista los efectos (de una página) o pregunta si uno está en marcha.',
          registerPreset: 'Añade un preajuste para esta sesión, o los lista.',
          checkToken:
            'Comprueba una ficha que tu Mod ha movido con los disparadores de entrada y salida.',
        },
      },
      upgrading: {
        heading: 'Actualizar desde la versión 1',
        points: [
          'Las fichas llamadas PageFX y NullFX se adoptan en el primer arranque y siguen funcionando como antes.',
          'Hasta que cambies un efecto desde el chat, las notas del DJ ("GM Notes"), la barra 1 ("Bar 1", tiempo entre apariciones) y la barra 2 ("Bar 2", dirección del haz) de su ficha lo siguen controlando, y el marcador de interdicción sigue apagándolo. Cuando lo cambias desde el chat, las notas del DJ y las barras vuelven a ser tuyas.',
          'La versión 1 solo dibujaba efectos en la página de la cinta de jugadores, y generaba dos veces los FX personalizados guardados. Ambas cosas están corregidas.',
          'Los comandos de la versión 1 siguen funcionando:',
        ],
        colV1: 'Comando de la versión 1',
        colV2: 'Equivale a',
      },
      troubleshooting: {
        heading: 'Solución de problemas',
        points: [
          'Un efecto no funciona: abre su tarjeta. La línea Estado dice por qué: apagado, en pausa, ningún efecto elegido, no puede funcionar (con el motivo) o no está en una página activa (no hay jugadores; activa Vista previa de página del DJ para probarlo).',
          'No ves nada: las partículas muy pequeñas o de vida corta cuestan de ver en un mapa recargado. Prueba un preajuste, sube la intensidad o haz el área más pequeña.',
          'Los efectos se ven escasos: puede que la página esté en el Máximo de apariciones por segundo. Baja algunas intensidades o sube el límite.',
          'Los efectos se detuvieron tras copiar una página o una partida: usa Reescanear.',
          'Para cualquier otra cosa, revisa el registro de la consola de la API e incluye sus mensajes cuando pidas ayuda.',
        ],
      },
      languages: {
        heading: 'Idiomas',
        body: 'Elige un idioma desde la tarjeta de Ajustes o con !pagefx set language. Idiomas disponibles:',
        colLanguage: 'Idioma',
        colNative: 'Nombre nativo',
        colCode: 'Código',
      },
      credits: {
        heading: 'Créditos',
        original: 'Mod original de',
        maintainer: 'Versión 2 mantenida por',
        marketplace: 'Los paquetes de arte de Ada en el Marketplace de Roll20',
        support:
          'Si encuentras un fallo o tienes una idea, publícalo en el foro de Mods de Roll20 o abre una incidencia en GitHub, e incluye los mensajes del registro de la consola de la API.',
      },
    },
    triggers: {
      line: '{when}: {action}',
      eachRound: 'Cada ronda nueva',
      everyRounds: 'Cada {n} rondas',
      onRound: 'En la ronda {n}',
      turn: 'Cuando empieza el turno de {name}',
      enter: 'Cuando {who} entra en {area}',
      leave: 'Cuando {who} sale de {area}',
      areaSelf: 'el área de este efecto',
      areaSelected: 'el aura de la ficha seleccionada',
      areaOf: 'el aura de {name}',
      unnamed: 'una ficha',
      once: '(solo la primera vez)',
      onceUsed: '(solo la primera vez, ya usado)',
      who: {
        players: 'una ficha de jugador',
        all: 'cualquier ficha',
      },
      action: {
        start: 'iniciarlo',
        stop: 'detenerlo',
        toggle: 'encenderlo o apagarlo',
        fire: 'lanzarlo una vez',
        burst: 'lanzar una ráfaga de {count}',
      },
      choice: {
        start: 'Iniciar',
        stop: 'Detener',
        toggle: 'Encender o apagar',
        fire: 'Lanzar una vez',
        burst: 'Lanzar una ráfaga',
      },
    },
    packs: {
      weather: 'Clima',
      fire: 'Fuego y calor',
      water: 'Agua',
      magic: 'Magia y misterio',
      custom: 'De otros Mods',
    },
    presets: {
      'light-rain': 'Lluvia ligera',
      'heavy-rain': 'Lluvia intensa',
      thunderstorm: 'Tormenta eléctrica',
      snow: 'Nieve',
      blizzard: 'Ventisca',
      hail: 'Granizo',
      sandstorm: 'Tormenta de arena',
      fog: 'Jirones de niebla',
      embers: 'Brasas',
      ash: 'Ceniza que cae',
      magma: 'Magma burbujeante',
      'lava-spurts': 'Chorros de lava',
      sparks: 'Chispas',
      drips: 'Goteo de cueva',
      steam: 'Respiraderos de vapor',
      geyser: 'Géiser',
      spray: 'Rocío de cascada',
      bubbles: 'Burbujas',
      fireflies: 'Luciérnagas',
      'arcane-motes': 'Motas arcanas',
      'necrotic-mist': 'Niebla necrótica',
      'holy-glimmer': 'Destello sagrado',
      'swamp-gas': 'Gas de pantano',
    },
    fx: {
      empty: 'no hay ningún efecto definido.',
      badJson: 'la definición de FX personalizado no es JSON válido.',
      unknownColour: 'no hay ningún color integrado "{colour}". Colores: {colours}.',
      savedMissing: 'no hay ningún FX personalizado guardado llamado "{name}".',
      cannotCreate: 'Roll20 no quiso crear un objeto de FX personalizado para él.',
      spawnFailed: 'Roll20 no quiso generarlo ({message}).',
    },
    errors: {
      unknownCommand: 'Comando desconocido: {command}',
      noEffects: 'Selecciona una o más fichas de PageFX, o indica sus ID con --ids.',
      selectToken: 'Selecciona primero una o más fichas, o indica sus ID con --ids.',
      unknownIds: 'Estos no son efectos de PageFX: {ids}',
      badSetting: 'Ajuste o valor desconocido: {setting} {value}',
      noLayer: '"{name}" no tiene capa {n}.',
      tooManyLayers: 'Un efecto puede tener como mucho {max} capas.',
      layerUsage: 'Usa !pagefx layer add [effect] o !pagefx layer remove <number>.',
      nullUsage: 'Usa !pagefx null create o !pagefx null remove.',
      isEffect: '"{name}" es un efecto, así que no puede ser también una zona sin efectos.',
      badInterval:
        'Indica el tiempo entre apariciones en ms, por ejemplo: !pagefx interval 500 1500',
      badDirection:
        'Indica random, o casillas a lo ancho y hacia abajo, por ejemplo: !pagefx direction 2 -1',
      badArea:
        'Indica un radio en unidades de página, y circle o square, por ejemplo: !pagefx area 15 circle',
      badIntensity: 'Indica una intensidad mayor que 0, por ejemplo: !pagefx intensity 1.5',
      noName: 'Indica un nombre, por ejemplo: !pagefx name Lluvia sobre los muelles',
      triggerUsage:
        'Usa !pagefx trigger add <round|turn|enter|leave> <start|stop|toggle|fire|burst> [every=2] [round=3] [count=5] [who=players|all|named] [names=A;B] [area=self|selected] [once], o !pagefx trigger remove <number>.',
      triggerToken:
        'Selecciona primero en el mapa la ficha a la que se refiere este disparador, o indica token=<id>.',
      triggerNames:
        'Indica los nombres de las fichas con names=, separados por ; (por ejemplo names=Goblin;Orc).',
      tooManyTriggers: 'Un efecto puede tener como mucho {max} disparadores.',
      noTrigger: '"{name}" no tiene disparador {n}.',
      journalUsage: 'Usa !pagefx journal rebuild.',
      unknownPreset: 'No hay ningún preajuste "{id}". Escribe !pagefx presets para verlos.',
      unexpected: 'Algo ha fallado: {message}',
    },
  };

  var localeSv = {
    titles: {
      ready: 'PageFX är redo.',
      menu: 'PageFX',
      status: 'PageFX-status',
      settings: 'PageFX-inställningar',
      presets: 'PageFX-förinställningar',
      help: 'PageFX-kommandon',
      effect: 'Effekt: {name}',
    },
    messages: {
      readyHint: 'Skriv !pagefx för att öppna menyn.',
      adopted:
        'Tog över {effects} effekt(er) och {nulls} effektfria område(n) från PageFX 1.x-tokens. De fungerar som tidigare.',
      rescanned:
        'Omsökningen hittade {effects} ny(a) effekt(er) och {nulls} nya effektfria område(n), och glömde {dropped} vars tokens hade raderats.',
      allPaused: 'Alla effekter är pausade. Använd !pagefx resume för att starta dem igen.',
      allResumed: 'Effekterna körs igen.',
      turnedOn: 'Påslagna: {count}.',
      turnedOff: 'Avslagna: {count}.',
      toggled: 'På- eller avslagna: {count}.',
      paused: 'Pausade: {count}.',
      resumed: 'Återupptagna: {count}.',
      fired: 'Spawnade {count} effekt(er).',
      created: 'Nya effekter: {count}. Välj på kortet vad var och en spawnar.',
      deleted: 'Borttagna effekter: {count}. Deras tokens finns kvar på kartan.',
      renamed: 'Omdöpta: {count}.',
      fxSet: 'Ändrad effekt: {count}.',
      intervalSet: 'Ändrad timing: {count}.',
      directionSet: 'Ändrad riktning: {count}.',
      areaSet: 'Ändrat område: {count}.',
      intensitySet: 'Ändrad intensitet: {count}.',
      layerAdded: 'Tillagt lager: {count}.',
      layerRemoved: 'Borttaget lager: {count}.',
      nullCreated: 'Nya effektfria områden: {count}.',
      nullRemoved: 'Borttagna effektfria områden: {count}.',
      presetApplied: 'Förinställningen {name} tillämpad: {count}.',
      journalRebuilt: 'Handouterna "{help}" och "{deck}" har byggts om.',
      triggerAdded: 'Tillagd utlösare: {count}.',
      triggerRemoved: 'Borttagen utlösare: {count}.',
      triggersCleared: 'Utlösare borttagna från {count} effekt(er).',
      throttled:
        'Effekterna på sidan "{page}" glesas ut: de bad om fler än {max} spawns per sekund. Sänk deras intensitet, eller höj gränsen med !pagefx set maxSpawnsPerSecond.',
      settingChanged: '{setting} är nu {value}.',
      problem: 'Effekten "{name}" kan inte köras: {reason}',
    },
    menu: {
      page: 'Sida',
      live: 'effekter körs här',
      notLive: 'inga spelare här',
      allPausedNote: 'Alla effekter är pausade.',
      effectsHere: 'Effekter på den här sidan',
      noEffectsHere: 'Inga effekter på den här sidan än.',
      otherPages: 'Andra sidor',
      effectCount: '{count} effekt(er)',
      actions: 'Ny',
      selectHint:
        'Markera först en token på kartan och tryck sedan på Ny effekt eller Effektfritt område. Tokenen visar var effekten syns; dess Aura 1 är området.',
      state: 'Tillstånd',
      area: 'Område',
      areaValue: '{radius} {units} utanför tokenen, {shape}',
      circle: 'cirkel',
      square: 'kvadrat',
      circleOption: 'Cirkel',
      squareOption: 'Kvadrat',
      layers: 'Lager',
      layer: 'Lager {n}',
      noLayers: 'Inga lager. Lägg till ett för att välja vad effekten spawnar.',
      noFxSet: 'inte vald',
      timing: 'var {min}–{max} ms',
      directionRandom: 'slumpad riktning',
      directionOffset: 'slutar {dx}, {dy} rutor bort',
      v1Note:
        'Den här effekten följer fortfarande tokenens SL-anteckningar ("GM Notes") och staplar, som i PageFX 1.x. Ändrar du den här upphör det.',
      preset: 'Förinställning',
      presetsHint:
        'Markera en eller flera tokens på kartan och tryck sedan på en förinställning. Tokens som inte redan är effekter blir effekter, och deras Aura 1 är området som förinställningen fyller.',
      triggers: 'Utlösare',
      noTriggers: 'Inga utlösare: effekten körs så fort det finns spelare på dess sida.',
      triggerHint:
        'För en turutlösare, eller ett område från en annan token, markera först den tokenen på kartan.',
      yes: 'Ja',
      no: 'Nej',
    },
    buttons: {
      edit: 'Redigera',
      show: 'Visa',
      turnOn: 'Slå på',
      turnOff: 'Slå av',
      pause: 'Pausa',
      resume: 'Återuppta',
      fire: 'Avfyra',
      pauseAll: 'Pausa alla',
      resumeAll: 'Återuppta alla',
      create: 'Ny effekt',
      createNull: 'Effektfritt område',
      removeNull: 'Ta bort effektfritt område',
      settings: 'Inställningar',
      status: 'Status',
      rescan: 'Sök igen',
      rename: 'Byt namn',
      area: 'Område',
      intensity: 'Intensitet',
      builtin: 'Inbyggd FX',
      saved: 'Sparad FX',
      json: 'Egen JSON',
      timing: 'Timing',
      random: 'Slumpad riktning',
      offset: 'Ange riktning',
      addLayer: 'Lägg till lager',
      removeLayer: 'Ta bort lager',
      delete: 'Radera effekt',
      preset: 'Förinställning',
      presets: 'Förinställningar',
      remove: 'Ta bort',
      help: 'Hjälp',
      rebuild: 'Bygg om handouts',
      onRound: 'Varje runda',
      onTurn: 'På en tur',
      onEnter: 'Token går in',
      onLeave: 'Token går ut',
      menu: 'Meny',
      change: 'Ändra',
    },
    prompts: {
      type: 'Effekttyp',
      colour: 'Färg',
      saved: 'Sparad egen FX',
      json: 'Egen FX-definition (JSON)',
      intervalMin: 'Kortaste tid mellan spawns, i ms',
      intervalMax: 'Längsta tid mellan spawns, i ms',
      dx: 'Rutor i sidled till slutet (negativt är vänster)',
      dy: 'Rutor nedåt till slutet (negativt är uppåt)',
      name: 'Effektens namn',
      radius: 'Områdets radie utanför tokenen, i sidenheter',
      shape: 'Områdets form',
      intensity: 'Intensitet ({min} till {max})',
      maxSpawns: 'Spawns per sekund på en sida (1 till {max})',
      preset: 'Förinställning',
      then: 'Sedan',
      every: 'Hur många rundor mellan varje gång',
      who: 'Vilka tokens räknas',
      area: 'Vilket område',
      once: 'Bara första gången?',
      confirmDelete: 'Radera den här effekten? Tokenen blir kvar på kartan.',
    },
    settings: {
      language: 'Språk',
      globalIntensity: 'Intensitet för alla effekter',
      gmPreviewHint:
        'När den är på körs effekter också på sidan som varje SL tittar på, även utan spelare där.',
      maxSpawnsHint:
        'Effekterna glesas ut på en sida som ber om fler. Roll20 flyter på bra upp till ungefär 60.',
    },
    status: {
      livePages: 'Aktiva sidor',
      effects: 'Effekter',
      running: 'Körs',
      globalPause: 'Alla pausade',
      on: 'På',
      off: 'Av',
      pausedState: 'Pausad',
      waiting: 'Inte på en aktiv sida',
      noFx: 'Ingen effekt vald',
      broken: 'Kan inte köras',
      nullAreas: 'Effektfria områden',
      noEffects:
        'Inga effekter än. Markera en token och skriv !pagefx create, eller öppna menyn med !pagefx.',
      gmPreview: 'Förhandsvisning av SL:s sida',
      intensity: 'Intensitet',
      maxSpawns: 'Max spawns per sekund, per sida',
    },
    help: {
      menu: 'Öppna menyn: effekterna på din sida, och knappar för allt annat.',
      create:
        'Gör de markerade tokens till effekter. Deras Aura 1 är området; en läggs till om de saknar en.',
      edit: 'Visa kortet för varje markerad effekt, med knappar för att ändra den.',
      preset:
        'Ge de markerade tokens en förinställning, och gör dem till effekter först vid behov.',
      presets: 'Lista förinställningarna, per paket.',
      switches:
        'Slå på eller av de markerade effekterna, eller pausa och återuppta dem. Med inget markerat startar on och resume allt igen, och off och pause håller allt stilla (som !pageFX on och off gjorde i version 1).',
      fire: 'Spawna de markerade effekterna nu, en eller några gånger, för att prova dem.',
      fx: 'Ange vad ett lager spawnar: en inbyggd effekt som burn-fire, namnet på en sparad egen FX, eller en egen FX-definition i JSON.',
      interval:
        'Ange tiden mellan ett lagers spawns, i millisekunder. Varje väntan väljs mellan de två.',
      direction:
        'För strålliknande effekter, ange var varje spawn slutar: random, eller rutor i sidled och nedåt från där den börjar.',
      area: 'Ange området: radien på tokenens Aura 1 i sidenheter, och dess form.',
      intensity:
        'Multiplicera hur ofta de markerade effekterna spawnar (0.1 till 5). Med global ändras den för alla effekter.',
      name: 'Byt namn på de markerade effekterna.',
      layer: 'Lägg till ett lager, så att en effekt spawnar flera saker, eller ta bort ett.',
      triggerAdd:
        'Lägg till en utlösare: vid round, turn, enter eller leave, gör start, stop, toggle, fire eller burst. Alternativ: every=2, round=3, count=5, who=players|all|named, names=A;B, area=selected, once.',
      triggerRemove: 'Ta bort en utlösare, eller alla, från de markerade effekterna.',
      null: 'Gör de markerade tokens till effektfria områden, där ingen effekt någonsin spawnar, eller sluta låta dem vara det.',
      delete: 'Ta bort effekten från de markerade tokens. Tokens blir kvar på kartan.',
      status: 'Lista alla effekter, deras sida och om de körs.',
      settings: 'Visa inställningarna.',
      set: 'Ändra en inställning: language, gmPagePreview, intensity eller maxSpawnsPerSecond.',
      rescan:
        'Ta över nya tokens med namnet PageFX eller NullFX, och glöm effekter vars tokens har raderats.',
      journal: 'Bygg om handouterna Hjälp och Command Deck.',
      help: 'Visa den här listan.',
      handout:
        'Fullständiga instruktioner finns i handouten "{help}"; knappar med ett klick finns i "{deck}".',
    },
    deck: {
      menuTitle: 'Meny',
      menuDesc: 'Huvudmenyn listar effekterna på din sida. Status listar alla.',
      newTitle: 'Ny',
      newDesc:
        'Markera först en eller flera tokens på kartan. Deras Aura 1 blir området som effekten fyller.',
      selectedTitle: 'Markerade effekter',
      selectedDesc: 'Markera effekttokens på kartan och tryck sedan på en knapp.',
      allTitle: 'Allt',
      allDesc: 'Håll alla effekter stilla, eller starta dem alla igen.',
      toolsTitle: 'Verktyg',
      toolsDesc: 'Plocka upp kopierade eller raderade tokens, och bygg om de här handouterna.',
      footer: 'Se handouten "{help}" för fullständiga instruktioner.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Väder- och stämningseffekter för Roll20-kartor',
      footer: 'Använd handouten "{deck}" för kontroller med ett klick.',
      overview: {
        heading: 'Översikt',
        body: 'PageFX fyller ett område av kartan med effekter som pågår hela tiden: regn, snö, glöd, ånga, eldflugor och mer. En token markerar varje effekts plats, och dess Aura 1 är området. Effekterna körs på varje sida som har spelare, även sidor dit en delad grupp har skickats, och stannar när spelarna lämnar. Allt ställs in från menyer i chatten, och utlösare kan starta eller stoppa effekter när stridsrundor går eller tokens flyttas.',
        demo: 'Se en kort demo (från version 1)',
      },
      quickStart: {
        heading: 'Snabbstart',
        steps: [
          'Placera en token där effekten ska vara (SL-lagret håller den dold för spelarna) och markera den.',
          'Skriv !pagefx presets, eller öppna Command Deck och klicka på Förinställningar, och klicka sedan på en förinställning som Kraftigt regn.',
          'Ändra storlek på tokenens Aura 1 för att ange området som effekten fyller. Auran är dold för spelarna.',
          'Flytta spelarna till sidan. Effekten startar, och stannar igen när de lämnar.',
          'Skriv !pagefx för att öppna menyn, och klicka på Redigera vid en effekt för att ändra den.',
        ],
      },
      effects: {
        heading: 'Effekter',
        points: [
          'En effekt är en token plus inställningar som PageFX sparar. Flytta tokenen för att flytta effekten, och ändra dess Aura 1 för att ändra området. Raderar du tokenen raderas effekten.',
          'Varje effekt har ett eller flera lager. Varje lager spawnar en sak, om och om igen, med en slumpad väntan mellan dess kortaste och längsta tid.',
          'Ett lager kan spawna en inbyggd Roll20-effekt (typ och färg, som burn-fire), en egen FX som sparats i spelet, eller en egen FX-definition inklistrad som JSON. Värden som saknas i en definition fylls i, så även en kort definition ritas.',
          'Strålliknande effekter (beam, breath, splatter och egna FX med vinkel -1) ritas mellan två punkter. Deras riktning är slumpad, eller ett fast antal rutor i sidled och nedåt.',
          'Intensitet multiplicerar hur ofta en effekt spawnar. Inställningen intensity multiplicerar alla effekter.',
          'Av stoppar en effekt tills den slås på. Pausa håller den stilla tills den återupptas. Pausa alla håller alla effekter stilla utan att ändra dem.',
          'Jumpgate ritar egna FX-definitioner i vitt om de inte är sparade som egna FX, så PageFX sparar sina som egna FX med namnet “PageFX: …”. De tas bort när ingen effekt använder dem. Låt dem vara kvar.',
        ],
      },
      pages: {
        heading: 'Vilka sidor som körs',
        points: [
          'Effekter körs på sidan med spelarbandet och på varje sida dit en spelare har flyttats på egen hand.',
          'Slå på Förhandsvisning av SL:s sida för att också köra effekter på sidan som varje SL tittar på, så att du kan prova dem utan spelare där.',
          'Varje sida får högst Max spawns per sekund (30 som standard). Ber effekterna om fler hoppas vissa spawns över, och SL får veta det en gång.',
          'När en annan Mod flyttar bandet eller delar gruppen säger Roll20 inget till någon, så PageFX tittar efter med några sekunders mellanrum och kommer ikapp.',
        ],
      },
      presets: {
        heading: 'Förinställningar',
        intro:
          'En förinställning ger en effekt en uppsättning färdiga lager. Ändrar du ett lager efteråt blir effekten din egen. Andra Mods kan lägga till förinställningar med PageFX.registerPreset.',
        colPack: 'Paket',
        colPresets: 'Förinställningar (namn och ID)',
      },
      triggers: {
        heading: 'Utlösare',
        intro:
          'En utlösare startar, stoppar, växlar eller avfyrar en effekt när något händer. Lägg till dem från effektens kort, eller med !pagefx trigger add.',
        points: [
          'Varje runda: Roll20 håller inget rundnummer, så en runda börjar när turordningen går från sin sista post tillbaka till toppen. Finns det en egen post i turordningen med namnet “Round” används den i stället. Välj var så många rundor, eller en viss runda. Den första rundan i en strid räknas inte som en ändring.',
          'På en tur: när en vald token når toppen av turordningen. Markera tokenen på kartan innan du klickar på knappen.',
          'Token går in eller ut: när en token går in i eller ut ur effektens område, eller Aura 1 hos en annan token som du markerar. Som standard räknas bara tokens som en spelare styr; välj valfri token, eller ange namn.',
          'Avfyra en salva spawnar effekten flera gånger på en gång. Bara första gången gör att en utlösare bara löser ut en gång.',
          'Roll20 säger inget till Mods när en annan Mod flyttar en token. Mods som flyttar tokens kan anropa PageFX.checkToken(token) efteråt.',
        ],
      },
      nullAreas: {
        heading: 'Effektfria områden',
        points: [
          'Ett effektfritt område är en token där ingen effekt någonsin spawnar, som insidan av ett hus under en storm. Dess område är tokenen och dess Aura 1.',
          'Markera tokenen och klicka på Effektfritt område i menyn eller i Command Deck. Tokens med namnet NullFX, som i version 1, är också effektfria områden.',
        ],
      },
      commands: {
        heading: 'Kommandon',
        intro:
          'Bara SL kan använda de här kommandona. De verkar på de markerade tokens, eller på tokens som anges med --ids. Lagerkommandon verkar på lager 1 om inte --layer säger något annat. Andra Mods kan också skicka dem; svaren går till SL.',
        colCommand: 'Kommando',
        colDesc: 'Vad det gör',
      },
      settings: {
        heading: 'Inställningar',
        intro:
          'Ändra inställningar från kortet Inställningar, eller med !pagefx set. Språket kan också ställas in på Modens inställningssida.',
        colKey: 'Inställning',
        colDesc: 'Vad den gör',
        rows: {
          language: 'Språket i PageFX:s menyer, meddelanden och handouts.',
          gmPagePreview: 'Kör också effekter på sidan som varje SL tittar på (av som standard).',
          intensity: 'Multiplicerar hur ofta varje effekt spawnar (1 som standard).',
          maxSpawnsPerSecond: 'Flest spawns på en sida per sekund, 1 till 60 (30 som standard).',
        },
      },
      api: {
        heading: 'För andra Mods',
        intro:
          'PageFX publicerar ett PageFX-objekt. Där en funktion tar en token fungerar också tokenens ID.',
        colFunction: 'Funktion',
        colDesc: 'Vad den gör',
        rows: {
          activateAll: 'Återuppta alla effekter (version 1).',
          deactivateAll: 'Pausa alla effekter (version 1).',
          activate: 'Slå på en effekt, slå av den, eller växla den (version 1).',
          start: 'Slå på eller av en effekt, eller pausa och återuppta den.',
          setIntensity: 'Ändra en effekts intensitet.',
          fire: 'Spawna en effekt nu.',
          create:
            'Gör en token till en effekt, med alternativen name, fx, interval, direction och intensity; eller ta bort effekten.',
          getEffect: 'Läs en effekt, lista effekterna (på en sida), eller fråga om en körs.',
          registerPreset: 'Lägg till en förinställning för den här sessionen, eller lista dem.',
          checkToken: 'Kontrollera en token som din Mod har flyttat mot utlösare för in och ut.',
        },
      },
      upgrading: {
        heading: 'Uppgradera från version 1',
        points: [
          'Tokens med namnen PageFX och NullFX tas över vid första starten och fungerar som tidigare.',
          'Tills du ändrar en effekt från chatten styrs den fortfarande av tokenens SL-anteckningar ("GM Notes"), stapel 1 ("Bar 1", tid mellan spawns) och stapel 2 ("Bar 2", strålens riktning), och interdiction-markören slår fortfarande av den. När du väl har ändrat den från chatten är SL-anteckningarna och staplarna dina igen.',
          'Version 1 ritade bara effekter på spelarbandets sida, och spawnade sparade egna FX två gånger. Båda är åtgärdade.',
          'Kommandona från version 1 fungerar fortfarande:',
        ],
        colV1: 'Kommando i version 1',
        colV2: 'Samma som',
      },
      troubleshooting: {
        heading: 'Felsökning',
        points: [
          'En effekt körs inte: öppna dess kort. Raden Tillstånd säger varför: av, pausad, ingen effekt vald, kan inte köras (med orsaken), eller inte på en aktiv sida (inga spelare där; slå på Förhandsvisning av SL:s sida för att prova).',
          'Du ser ingenting: mycket små eller kortlivade partiklar är svåra att se på en plottrig karta. Prova en förinställning, höj intensiteten eller gör området mindre.',
          'Effekterna ser glesa ut: sidan kan ha nått Max spawns per sekund. Sänk några intensiteter, eller höj gränsen.',
          'Effekterna slutade efter att en sida eller ett spel kopierats: kör Sök igen.',
          'För allt annat, kolla API-konsolens logg och ta med dess meddelanden när du ber om hjälp.',
        ],
      },
      languages: {
        heading: 'Språk',
        body: 'Välj ett språk från kortet Inställningar, eller med !pagefx set language. Tillgängliga språk:',
        colLanguage: 'Språk',
        colNative: 'Eget namn',
        colCode: 'Kod',
      },
      credits: {
        heading: 'Tack',
        original: 'Ursprunglig mod av',
        maintainer: 'Version 2 underhålls av',
        marketplace: 'Adas konstpaket på Roll20 Marketplace',
        support:
          'Hittar du en bugg eller har en idé, skriv i Roll20:s Mod-forum eller öppna ett ärende på GitHub, och ta med eventuella meddelanden från API-konsolens logg.',
      },
    },
    triggers: {
      line: '{when}: {action}',
      eachRound: 'Varje ny runda',
      everyRounds: 'Var {n}:e runda',
      onRound: 'På runda {n}',
      turn: 'När turen för {name} börjar',
      enter: 'När {who} går in i {area}',
      leave: 'När {who} lämnar {area}',
      areaSelf: 'den här effektens område',
      areaSelected: 'den markerade tokenens aura',
      areaOf: 'auran hos {name}',
      unnamed: 'en token',
      once: '(bara första gången)',
      onceUsed: '(bara första gången, redan använd)',
      who: {
        players: 'en spelartoken',
        all: 'valfri token',
      },
      action: {
        start: 'starta den',
        stop: 'stoppa den',
        toggle: 'slå på eller av den',
        fire: 'avfyra den en gång',
        burst: 'avfyra en salva på {count}',
      },
      choice: {
        start: 'Starta',
        stop: 'Stoppa',
        toggle: 'Slå på eller av',
        fire: 'Avfyra en gång',
        burst: 'Avfyra en salva',
      },
    },
    packs: {
      weather: 'Väder',
      fire: 'Eld och hetta',
      water: 'Vatten',
      magic: 'Magi och kusligt',
      custom: 'Från andra Mods',
    },
    presets: {
      'light-rain': 'Lätt regn',
      'heavy-rain': 'Kraftigt regn',
      thunderstorm: 'Åskväder',
      snow: 'Snö',
      blizzard: 'Snöstorm',
      hail: 'Hagel',
      sandstorm: 'Sandstorm',
      fog: 'Dimslöjor',
      embers: 'Glöd',
      ash: 'Fallande aska',
      magma: 'Bubblande magma',
      'lava-spurts': 'Lavasprut',
      sparks: 'Gnistor',
      drips: 'Grottdropp',
      steam: 'Ångventiler',
      geyser: 'Gejser',
      spray: 'Vattenfallsstänk',
      bubbles: 'Bubblor',
      fireflies: 'Eldflugor',
      'arcane-motes': 'Arkana korn',
      'necrotic-mist': 'Nekrotisk dimma',
      'holy-glimmer': 'Heligt skimmer',
      'swamp-gas': 'Sumpgas',
    },
    fx: {
      empty: 'ingen effekt är vald.',
      badJson: 'den egna FX-definitionen är inte giltig JSON.',
      unknownColour: 'det finns ingen inbyggd färg "{colour}". Färger: {colours}.',
      savedMissing: 'det finns ingen sparad egen FX som heter "{name}".',
      cannotCreate: 'Roll20 ville inte skapa ett eget FX-objekt för den.',
      spawnFailed: 'Roll20 ville inte spawna den ({message}).',
    },
    errors: {
      unknownCommand: 'Okänt kommando: {command}',
      noEffects: 'Markera en eller flera PageFX-tokens, eller ange deras ID:n med --ids.',
      selectToken: 'Markera först en eller flera tokens, eller ange deras ID:n med --ids.',
      unknownIds: 'Det här är inte PageFX-effekter: {ids}',
      badSetting: 'Okänd inställning eller okänt värde: {setting} {value}',
      noLayer: '"{name}" har inget lager {n}.',
      tooManyLayers: 'En effekt kan ha högst {max} lager.',
      layerUsage: 'Använd !pagefx layer add [effect] eller !pagefx layer remove <number>.',
      nullUsage: 'Använd !pagefx null create eller !pagefx null remove.',
      isEffect: '"{name}" är en effekt, så den kan inte också vara ett effektfritt område.',
      badInterval: 'Ange tiden mellan spawns i ms, till exempel: !pagefx interval 500 1500',
      badDirection:
        'Ange random, eller rutor i sidled och nedåt, till exempel: !pagefx direction 2 -1',
      badArea:
        'Ange en radie i sidenheter, och circle eller square, till exempel: !pagefx area 15 circle',
      badIntensity: 'Ange en intensitet över 0, till exempel: !pagefx intensity 1.5',
      noName: 'Ange ett namn, till exempel: !pagefx name Regn över kajen',
      triggerUsage:
        'Använd !pagefx trigger add <round|turn|enter|leave> <start|stop|toggle|fire|burst> [every=2] [round=3] [count=5] [who=players|all|named] [names=A;B] [area=self|selected] [once], eller !pagefx trigger remove <number>.',
      triggerToken:
        'Markera först den token som utlösaren gäller på kartan, eller ange token=<id>.',
      triggerNames: 'Ange tokennamnen med names=, åtskilda med ; (till exempel names=Goblin;Orc).',
      tooManyTriggers: 'En effekt kan ha högst {max} utlösare.',
      noTrigger: '"{name}" har ingen utlösare {n}.',
      journalUsage: 'Använd !pagefx journal rebuild.',
      unknownPreset: 'Det finns ingen förinställning "{id}". Skriv !pagefx presets för att se dem.',
      unexpected: 'Något gick fel: {message}',
    },
  };

  var localeTr = {
    titles: {
      ready: 'PageFX hazır.',
      menu: 'PageFX',
      status: 'PageFX Durumu',
      settings: 'PageFX Ayarları',
      presets: 'PageFX Hazır Ayarları',
      help: 'PageFX Komutları',
      effect: 'Efekt: {name}',
    },
    messages: {
      readyHint: 'Menüyü açmak için !pagefx yazın.',
      adopted:
        'PageFX 1.x jetonlarından {effects} efekt ve {nulls} efektsiz alan devralındı. Eskisi gibi çalışmaya devam ediyorlar.',
      rescanned:
        'Yeniden tarama {effects} yeni efekt ve {nulls} yeni efektsiz alan buldu; jetonları silinmiş {dropped} efekti unuttu.',
      allPaused: 'Tüm efektler duraklatıldı. Yeniden başlatmak için !pagefx resume kullanın.',
      allResumed: 'Efektler yeniden çalışıyor.',
      turnedOn: 'Açıldı: {count}.',
      turnedOff: 'Kapatıldı: {count}.',
      toggled: 'Açıldı veya kapatıldı: {count}.',
      paused: 'Duraklatıldı: {count}.',
      resumed: 'Sürdürüldü: {count}.',
      fired: 'Oluşturulan efekt: {count}.',
      created: 'Yeni efekt: {count}. Her birinin ne oluşturacağını kartından seçin.',
      deleted: 'Kaldırılan efekt: {count}. Jetonları hâlâ haritada.',
      renamed: 'Yeniden adlandırıldı: {count}.',
      fxSet: 'Efekt değiştirildi: {count}.',
      intervalSet: 'Zamanlama değiştirildi: {count}.',
      directionSet: 'Yön değiştirildi: {count}.',
      areaSet: 'Alan değiştirildi: {count}.',
      intensitySet: 'Yoğunluk değiştirildi: {count}.',
      layerAdded: 'Katman eklendi: {count}.',
      layerRemoved: 'Katman kaldırıldı: {count}.',
      nullCreated: 'Yeni efektsiz alan: {count}.',
      nullRemoved: 'Kaldırılan efektsiz alan: {count}.',
      presetApplied: '“{name}” uygulandı: {count}.',
      journalRebuilt: '“{help}” ve “{deck}” belgeleri yeniden oluşturuldu.',
      triggerAdded: 'Tetikleyici eklendi: {count}.',
      triggerRemoved: 'Tetikleyici kaldırıldı: {count}.',
      triggersCleared: 'Tetikleyicileri kaldırılan efekt: {count}.',
      throttled:
        '“{page}” sayfasındaki efektler seyreltiliyor: saniyede {max} oluşturmadan fazlasını istediler. Yoğunluklarını düşürün veya sınırı !pagefx set maxSpawnsPerSecond ile yükseltin.',
      settingChanged: '{setting} artık {value}.',
      problem: '“{name}” efekti çalışamıyor: {reason}',
    },
    menu: {
      page: 'Sayfa',
      live: 'efektler burada çalışıyor',
      notLive: 'burada oyuncu yok',
      allPausedNote: 'Tüm efektler duraklatıldı.',
      effectsHere: 'Bu sayfadaki efektler',
      noEffectsHere: 'Bu sayfada henüz efekt yok.',
      otherPages: 'Diğer sayfalar',
      effectCount: '{count} efekt',
      actions: 'Yeni',
      selectHint:
        'Önce haritada bir jeton seçin, sonra “Yeni efekt” veya “Efektsiz alan” düğmesine basın. Jeton efektin nerede görüneceğini belirler; Aura 1’i ise alandır.',
      state: 'Durum',
      area: 'Alan',
      areaValue: 'jetonun {radius} {units} ötesine kadar, {shape}',
      circle: 'daire',
      square: 'kare',
      circleOption: 'Daire',
      squareOption: 'Kare',
      layers: 'Katmanlar',
      layer: 'Katman {n}',
      noLayers: 'Katman yok. Bu efektin ne oluşturacağını seçmek için bir katman ekleyin.',
      noFxSet: 'ayarlanmadı',
      timing: 'her {min}–{max} ms',
      directionRandom: 'rastgele yön',
      directionOffset: 'bitiş noktası {dx}, {dy} kare uzakta',
      v1Note:
        'Bu efekt, PageFX 1.x’te olduğu gibi hâlâ jetonunun GM Notes alanını ve çubuklarını izliyor. Burada değiştirmek bunu sona erdirir.',
      preset: 'Hazır ayar',
      presetsHint:
        'Haritada bir veya daha fazla jeton seçin, sonra bir hazır ayara basın. Henüz efekt olmayan jetonlar efekte dönüşür ve Aura 1’leri hazır ayarın dolduracağı alan olur.',
      triggers: 'Tetikleyiciler',
      noTriggers: 'Tetikleyici yok: efekt, sayfasında oyuncu olduğu sürece çalışır.',
      triggerHint:
        'Sıra tetikleyicisi veya başka bir jetonun alanı için önce o jetonu haritada seçin.',
      yes: 'Evet',
      no: 'Hayır',
    },
    buttons: {
      edit: 'Düzenle',
      show: 'Göster',
      turnOn: 'Aç',
      turnOff: 'Kapat',
      pause: 'Duraklat',
      resume: 'Sürdür',
      fire: 'Ateşle',
      pauseAll: 'Tümünü duraklat',
      resumeAll: 'Tümünü sürdür',
      create: 'Yeni efekt',
      createNull: 'Efektsiz alan',
      removeNull: 'Efektsiz alanı kaldır',
      settings: 'Ayarlar',
      status: 'Durum',
      rescan: 'Yeniden tara',
      rename: 'Yeniden adlandır',
      area: 'Alan',
      intensity: 'Yoğunluk',
      builtin: 'Yerleşik FX',
      saved: 'Kayıtlı FX',
      json: 'Özel JSON',
      timing: 'Zamanlama',
      random: 'Rastgele yön',
      offset: 'Yön belirle',
      addLayer: 'Katman ekle',
      removeLayer: 'Katmanı kaldır',
      delete: 'Efekti sil',
      preset: 'Hazır ayar',
      presets: 'Hazır ayarlar',
      remove: 'Kaldır',
      help: 'Yardım',
      rebuild: 'Belgeleri yenile',
      onRound: 'Her turda',
      onTurn: 'Sırası gelince',
      onEnter: 'Jeton girince',
      onLeave: 'Jeton çıkınca',
      menu: 'Menü',
      change: 'Değiştir',
    },
    prompts: {
      type: 'Efekt türü',
      colour: 'Renk',
      saved: 'Kayıtlı özel FX',
      json: 'Özel FX tanımı (JSON)',
      intervalMin: 'Oluşturmalar arasındaki en kısa süre (ms)',
      intervalMax: 'Oluşturmalar arasındaki en uzun süre (ms)',
      dx: 'Bitişe kadar yatay kare (eksi sola)',
      dy: 'Bitişe kadar aşağı kare (eksi yukarı)',
      name: 'Efekt adı',
      radius: 'Jetonun ötesindeki alan yarıçapı (sayfa birimi)',
      shape: 'Alan şekli',
      intensity: 'Yoğunluk ({min} ile {max} arası)',
      maxSpawns: 'Bir sayfada saniyedeki oluşturma (1 ile {max} arası)',
      preset: 'Hazır ayar',
      then: 'Sonra',
      every: 'Kaç turda bir',
      who: 'Hangi jetonlar sayılsın',
      area: 'Hangi alan',
      once: 'Yalnızca ilk sefer mi?',
      confirmDelete: 'Bu efekt silinsin mi? Jeton haritada kalır.',
    },
    settings: {
      language: 'Dil',
      globalIntensity: 'Tüm efektlerin yoğunluğu',
      gmPreviewHint:
        'Açıkken efektler, orada hiç oyuncu olmasa bile her GM’in baktığı sayfada da çalışır.',
      maxSpawnsHint:
        'Daha fazlasını isteyen bir sayfada efektler seyreltilir. Roll20 yaklaşık 60’a kadar akıcı kalır.',
    },
    status: {
      livePages: 'Etkin sayfalar',
      effects: 'Efektler',
      running: 'Çalışıyor',
      globalPause: 'Tümü duraklatıldı',
      on: 'Açık',
      off: 'Kapalı',
      pausedState: 'Duraklatıldı',
      waiting: 'Etkin bir sayfada değil',
      noFx: 'Efekt seçilmedi',
      broken: 'Çalışamıyor',
      nullAreas: 'Efektsiz alanlar',
      noEffects:
        'Henüz efekt yok. Bir jeton seçip !pagefx create yazın veya menüyü !pagefx ile açın.',
      gmPreview: 'GM sayfa önizlemesi',
      intensity: 'Yoğunluk',
      maxSpawns: 'Sayfa başına saniyede en fazla oluşturma',
    },
    help: {
      menu: 'Menüyü açar: sayfanızdaki efektler ve diğer her şey için düğmeler.',
      create:
        'Seçili jetonları efekte dönüştürür. Aura 1’leri alandır; aurası olmayana bir tane eklenir.',
      edit: 'Seçili her efektin kartını, değiştirme düğmeleriyle birlikte gösterir.',
      preset: 'Seçili jetonlara bir hazır ayar verir; gerekirse önce onları efekte dönüştürür.',
      presets: 'Hazır ayarları paketlere göre listeler.',
      switches:
        'Seçili efektleri açar veya kapatır ya da duraklatıp sürdürür. Hiçbir şey seçili değilse on ve resume her şeyi yeniden başlatır, off ve pause her şeyi bekletir (sürüm 1’deki !pageFX on ve off gibi).',
      fire: 'Seçili efektleri denemek için şimdi bir veya birkaç kez oluşturur.',
      fx: 'Bir katmanın ne oluşturacağını belirler: burn-fire gibi yerleşik bir efekt, kayıtlı bir özel FX’in adı veya JSON biçiminde bir özel FX tanımı.',
      interval:
        'Bir katmanın oluşturmaları arasındaki süreyi milisaniye olarak belirler. Her bekleme bu iki değer arasından seçilir.',
      direction:
        'Işın benzeri efektlerde her oluşturmanın nerede biteceğini belirler: rastgele ya da başladığı yerden yatay ve aşağı doğru kare sayısı.',
      area: 'Alanı belirler: jetonun Aura 1 yarıçapı (sayfa birimi) ve şekli.',
      intensity:
        'Seçili efektlerin oluşturma sıklığını çarpar (0.1 ile 5 arası). global ile her efekt için değiştirir.',
      name: 'Seçili efektleri yeniden adlandırır.',
      layer: 'Bir efektin birkaç şey oluşturması için katman ekler veya bir katmanı kaldırır.',
      triggerAdd:
        'Tetikleyici ekler: round, turn, enter veya leave olduğunda start, stop, toggle, fire veya burst yapar. Seçenekler: every=2, round=3, count=5, who=players|all|named, names=A;B, area=selected, once.',
      triggerRemove: 'Seçili efektlerden bir tetikleyiciyi veya hepsini kaldırır.',
      null: 'Seçili jetonları hiçbir efektin oluşmadığı efektsiz alanlara dönüştürür ya da bu durumu kaldırır.',
      delete: 'Seçili jetonlardaki efekti kaldırır. Jetonlar haritada kalır.',
      status: 'Her efekti, sayfasını ve çalışıp çalışmadığını listeler.',
      settings: 'Ayarları gösterir.',
      set: 'Bir ayarı değiştirir: language, gmPagePreview, intensity veya maxSpawnsPerSecond.',
      rescan:
        'PageFX veya NullFX adlı yeni jetonları devralır ve jetonları silinmiş efektleri unutur.',
      journal: 'Yardım ve Command Deck belgelerini yeniden oluşturur.',
      help: 'Bu listeyi gösterir.',
      handout: 'Tüm talimatlar “{help}” belgesinde, tek tıklamalık düğmeler “{deck}” belgesinde.',
    },
    deck: {
      menuTitle: 'Menü',
      menuDesc: 'Ana menü sayfanızdaki efektleri listeler. “Durum” hepsini listeler.',
      newTitle: 'Yeni',
      newDesc:
        'Önce haritada bir veya daha fazla jeton seçin. Aura 1’leri efektin dolduracağı alan olur.',
      selectedTitle: 'Seçili efektler',
      selectedDesc: 'Haritada efekt jetonlarını seçin, sonra bir düğmeye basın.',
      allTitle: 'Her şey',
      allDesc: 'Tüm efektleri beklet veya hepsini yeniden başlat.',
      toolsTitle: 'Araçlar',
      toolsDesc: 'Kopyalanan veya silinen jetonları algıla ve bu belgeleri yeniden oluştur.',
      footer: 'Tüm talimatlar için “{help}” belgesine bakın.',
    },
    handout: {
      versionLabel: 'Sürüm',
      subtitle: 'Roll20 haritaları için hava durumu ve ortam efektleri',
      footer: 'Tek tıklamalık kontroller için “{deck}” belgesini kullanın.',
      overview: {
        heading: 'Genel Bakış',
        body: 'PageFX haritanın bir alanını süregiden efektlerle doldurur: yağmur, kar, köz, buhar, ateş böcekleri ve daha fazlası. Her efektin yerini bir jeton belirler ve jetonun Aura 1’i alandır. Efektler, bölünmüş bir grubun gönderildiği sayfalar da dahil olmak üzere oyuncu bulunan her sayfada çalışır ve oyuncular ayrılınca durur. Her şey sohbet menülerinden ayarlanır; tetikleyiciler de savaş turları geçtikçe veya jetonlar hareket ettikçe efektleri başlatıp durdurabilir.',
        demo: 'Kısa bir tanıtım videosu izleyin (sürüm 1’den)',
      },
      quickStart: {
        heading: 'Hızlı Başlangıç',
        steps: [
          'Efektin olacağı yere bir jeton koyun (GM katmanı onu oyunculardan gizler) ve seçin.',
          '!pagefx presets yazın veya Command Deck’i açıp “Hazır ayarlar” düğmesine tıklayın, ardından “Şiddetli yağmur” gibi bir hazır ayara tıklayın.',
          'Efektin dolduracağı alanı belirlemek için jetonun Aura 1’ini yeniden boyutlandırın. Aura oyunculardan gizlidir.',
          'Oyuncuları sayfaya taşıyın. Efekt başlar ve onlar ayrılınca yeniden durur.',
          'Menüyü açmak için !pagefx yazın ve bir efekti değiştirmek için “Düzenle” düğmesine tıklayın.',
        ],
      },
      effects: {
        heading: 'Efektler',
        points: [
          'Bir efekt, bir jeton ile PageFX’in sakladığı ayarlardan oluşur. Efekti taşımak için jetonu taşıyın, alanı değiştirmek için Aura 1’ini değiştirin. Jetonu silmek efekti de siler.',
          'Her efektin bir veya daha fazla katmanı vardır. Her katman, en kısa ve en uzun süresi arasında rastgele beklemelerle tek bir şeyi tekrar tekrar oluşturur.',
          'Bir katman yerleşik bir Roll20 efekti (burn-fire gibi tür ve renk), oyunda kayıtlı bir özel FX veya JSON olarak yapıştırılmış bir özel FX tanımı oluşturabilir. Tanımdaki eksik değerler doldurulur, bu yüzden kısa bir tanım da çizilir.',
          'Işın benzeri efektler (beam, breath, splatter ve açısı -1 olan özel FX’ler) iki nokta arasında çizilir. Yönleri rastgeledir ya da sabit sayıda kare yatay ve aşağıdır.',
          'Yoğunluk, bir efektin oluşturma sıklığını çarpar. intensity ayarı her efekti çarpar.',
          '“Kapat” bir efekti yeniden açılana kadar durdurur. “Duraklat” sürdürülene kadar bekletir. “Tümünü duraklat” efektleri değiştirmeden hepsini bekletir.',
          'Jumpgate, özel FX tanımlarını özel FX olarak kaydedilmedikçe beyaz çizer; bu yüzden PageFX kendi tanımlarını “PageFX: …” adlı özel FX’ler olarak kaydeder. Hiçbir efekt kullanmadığında kaldırılırlar. Onlara dokunmayın.',
        ],
      },
      pages: {
        heading: 'Hangi Sayfalar Çalışır',
        points: [
          'Efektler oyuncu şeridinin bulunduğu sayfada ve bir oyuncunun tek başına taşındığı her sayfada çalışır.',
          'Efektleri orada oyuncu olmadan denemek için, her GM’in baktığı sayfada da çalışmaları için “GM sayfa önizlemesi” ayarını açın.',
          'Her sayfa saniyede en fazla “Sayfa başına saniyede en fazla oluşturma” ayarı kadar oluşturma alır (varsayılan 30). Efektler daha fazlasını isterse bazı oluşturmalar atlanır ve GM’e bir kez bildirilir.',
          'Başka bir Mod şeridi taşıdığında veya grubu böldüğünde Roll20 kimseye haber vermez; bu yüzden PageFX birkaç saniyede bir bakar ve durumu yakalar.',
        ],
      },
      presets: {
        heading: 'Hazır Ayarlar',
        intro:
          'Bir hazır ayar, efekte bir dizi hazır katman verir. Sonradan bir katmanı değiştirmek efekti size özel kılar. Diğer Mod’lar PageFX.registerPreset ile hazır ayar ekleyebilir.',
        colPack: 'Paket',
        colPresets: 'Hazır ayarlar (ad ve kimlik)',
      },
      triggers: {
        heading: 'Tetikleyiciler',
        intro:
          'Bir tetikleyici, bir şey olduğunda efekti başlatır, durdurur, açıp kapatır veya ateşler. Tetikleyicileri efektin kartından ya da !pagefx trigger add ile ekleyin.',
        points: [
          'Her turda: Roll20 tur numarası tutmaz; bu yüzden sıra listesi son kayıttan yeniden en üste ilerletildiğinde yeni tur başlar. “Round” adlı özel bir sıra listesi kaydı varsa onun yerine o kullanılır. Kaç turda bir olacağını veya tek bir turu seçin. Bir savaşın ilk turu değişiklik sayılmaz.',
          'Sırası gelince: seçilen bir jeton sıra listesinin en üstüne geldiğinde. Düğmeye tıklamadan önce jetonu haritada seçin.',
          'Jeton girince veya çıkınca: bir jeton efektin alanına ya da seçtiğiniz başka bir jetonun Aura 1’ine girdiğinde veya oradan çıktığında. Varsayılan olarak yalnızca oyuncuların kontrol ettiği jetonlar sayılır; herhangi bir jetonu seçebilir veya adlar verebilirsiniz.',
          '“Art arda ateşle” efekti aynı anda birkaç kez oluşturur. “Yalnızca ilk sefer” tetikleyicinin yalnızca bir kez çalışmasını sağlar.',
          'Başka bir Mod bir jetonu taşıdığında Roll20 Mod’lara hiçbir şey bildirmez. Jeton taşıyan Mod’lar ardından PageFX.checkToken(token) çağırabilir.',
        ],
      },
      nullAreas: {
        heading: 'Efektsiz Alanlar',
        points: [
          'Efektsiz alan, fırtınadaki bir evin içi gibi hiçbir efektin oluşmadığı bir jetondur. Alanı, jetonun kendisi ve Aura 1’idir.',
          'Jetonu seçin ve menüde veya Command Deck’te “Efektsiz alan” düğmesine tıklayın. Sürüm 1’deki gibi NullFX adlı jetonlar da efektsiz alandır.',
        ],
      },
      commands: {
        heading: 'Komutlar',
        intro:
          'Bu komutları yalnızca GM’ler kullanabilir. Seçili jetonlara veya --ids ile verilen jetonlara etki ederler. Katman komutları, --layer aksini belirtmedikçe katman 1’e etki eder. Diğer Mod’lar da bu komutları gönderebilir; yanıtlar GM’e gider.',
        colCommand: 'Komut',
        colDesc: 'Ne yapar',
      },
      settings: {
        heading: 'Ayarlar',
        intro:
          'Ayarları “Ayarlar” kartından veya !pagefx set ile değiştirin. Dil, Mod’un ayarlar sayfasından da ayarlanabilir.',
        colKey: 'Ayar',
        colDesc: 'Ne yapar',
        rows: {
          language: 'PageFX menülerinin, mesajlarının ve belgelerinin dili.',
          gmPagePreview:
            'Efektleri her GM’in baktığı sayfada da çalıştırır (varsayılan olarak kapalı).',
          intensity: 'Her efektin oluşturma sıklığını çarpar (varsayılan 1).',
          maxSpawnsPerSecond:
            'Bir sayfada saniyedeki en fazla oluşturma, 1 ile 60 arası (varsayılan 30).',
        },
      },
      api: {
        heading: 'Diğer Mod’lar İçin',
        intro:
          'PageFX bir PageFX nesnesi yayımlar. Bir işlevin jeton aldığı yerlerde jetonun kimliği de kullanılabilir.',
        colFunction: 'İşlev',
        colDesc: 'Ne yapar',
        rows: {
          activateAll: 'Tüm efektleri sürdürür (sürüm 1).',
          deactivateAll: 'Tüm efektleri duraklatır (sürüm 1).',
          activate: 'Bir efekti açar, kapatır veya tersine çevirir (sürüm 1).',
          start: 'Bir efekti açar veya kapatır ya da duraklatıp sürdürür.',
          setIntensity: 'Bir efektin yoğunluğunu değiştirir.',
          fire: 'Bir efekti şimdi oluşturur.',
          create:
            'Bir jetonu name, fx, interval, direction ve intensity seçenekleriyle efekte dönüştürür ya da efekti kaldırır.',
          getEffect:
            'Bir efekti okur, efektleri (bir sayfadakileri) listeler veya bir efektin çalışıp çalışmadığını sorar.',
          registerPreset: 'Bu oturum için bir hazır ayar ekler veya hazır ayarları listeler.',
          checkToken:
            'Mod’unuzun taşıdığı bir jetonu giriş ve çıkış tetikleyicilerine karşı denetler.',
        },
      },
      upgrading: {
        heading: 'Sürüm 1’den Yükseltme',
        points: [
          'PageFX ve NullFX adlı jetonlar ilk başlatmada devralınır ve eskisi gibi çalışmaya devam eder.',
          'Bir efekti sohbetten değiştirene kadar onu hâlâ jetonunun GM Notes alanı, Bar 1 (oluşturmalar arası süre) ve Bar 2 (ışın yönü) yönetir, yasak işareti de hâlâ onu kapatır. Sohbetten değiştirdiğiniz anda GM Notes ve çubuklar yeniden sizindir.',
          'Sürüm 1 efektleri yalnızca oyuncu şeridi sayfasında çiziyor ve kayıtlı özel FX’leri iki kez oluşturuyordu. İkisi de düzeltildi.',
          'Sürüm 1 komutları hâlâ çalışır:',
        ],
        colV1: 'Sürüm 1 komutu',
        colV2: 'Karşılığı',
      },
      troubleshooting: {
        heading: 'Sorun Giderme',
        points: [
          'Bir efekt çalışmıyor: kartını açın. “Durum” satırı nedenini söyler: kapalı, duraklatıldı, efekt seçilmedi, çalışamıyor (nedeniyle birlikte) veya etkin bir sayfada değil (orada oyuncu yok; denemek için “GM sayfa önizlemesi” ayarını açın).',
          'Hiçbir şey görmüyorsunuz: çok küçük veya kısa ömürlü parçacıklar kalabalık bir haritada zor görülür. Bir hazır ayar deneyin, yoğunluğu artırın veya alanı küçültün.',
          'Efektler seyrek görünüyor: sayfa “Sayfa başına saniyede en fazla oluşturma” sınırına ulaşmış olabilir. Bazı yoğunlukları düşürün veya sınırı yükseltin.',
          'Bir sayfa veya oyun kopyalandıktan sonra efektler durdu: “Yeniden tara” düğmesine basın.',
          'Diğer her durumda API konsol günlüğünü kontrol edin ve yardım isterken oradaki mesajları ekleyin.',
        ],
      },
      languages: {
        heading: 'Diller',
        body: '“Ayarlar” kartından veya !pagefx set language ile bir dil seçin. Kullanılabilir diller:',
        colLanguage: 'Dil',
        colNative: 'Yerel adı',
        colCode: 'Kod',
      },
      credits: {
        heading: 'Emeği Geçenler',
        original: 'Orijinal Mod’un yazarı',
        maintainer: 'Sürüm 2’nin bakımını yapan',
        marketplace: 'Ada’nın Roll20 Marketplace’teki sanat paketleri',
        support:
          'Bir hata bulursanız veya bir fikriniz varsa Roll20 Mod forumunda paylaşın ya da GitHub’da bir issue açın ve API konsol günlüğündeki mesajları ekleyin.',
      },
    },
    triggers: {
      line: '{when}: {action}',
      eachRound: 'Her yeni turda',
      everyRounds: 'Her {n} turda bir',
      onRound: '{n}. turda',
      turn: '{name} jetonunun sırası başladığında',
      enter: '{who} {area} içine girdiğinde',
      leave: '{who} {area} dışına çıktığında',
      areaSelf: 'bu efektin alanı',
      areaSelected: 'seçili jetonun aurası',
      areaOf: '{name} jetonunun aurası',
      unnamed: 'bir jeton',
      once: '(yalnızca ilk sefer)',
      onceUsed: '(yalnızca ilk sefer, zaten kullanıldı)',
      who: {
        players: 'bir oyuncu jetonu',
        all: 'herhangi bir jeton',
      },
      action: {
        start: 'başlat',
        stop: 'durdur',
        toggle: 'aç veya kapat',
        fire: 'bir kez ateşle',
        burst: 'art arda {count} kez ateşle',
      },
      choice: {
        start: 'Başlat',
        stop: 'Durdur',
        toggle: 'Aç veya kapat',
        fire: 'Bir kez ateşle',
        burst: 'Art arda ateşle',
      },
    },
    packs: {
      weather: 'Hava durumu',
      fire: 'Ateş ve sıcaklık',
      water: 'Su',
      magic: 'Büyü ve ürkütücü',
      custom: 'Diğer Mod’lardan',
    },
    presets: {
      'light-rain': 'Hafif yağmur',
      'heavy-rain': 'Şiddetli yağmur',
      thunderstorm: 'Gök gürültülü fırtına',
      snow: 'Kar',
      blizzard: 'Tipi',
      hail: 'Dolu',
      sandstorm: 'Kum fırtınası',
      fog: 'Sis tutamları',
      embers: 'Közler',
      ash: 'Düşen kül',
      magma: 'Kaynayan magma',
      'lava-spurts': 'Lav fışkırmaları',
      sparks: 'Kıvılcımlar',
      drips: 'Mağara damlaları',
      steam: 'Buhar delikleri',
      geyser: 'Gayzer',
      spray: 'Şelale serpintisi',
      bubbles: 'Kabarcıklar',
      fireflies: 'Ateş böcekleri',
      'arcane-motes': 'Gizemli zerreler',
      'necrotic-mist': 'Nekrotik sis',
      'holy-glimmer': 'Kutsal parıltı',
      'swamp-gas': 'Bataklık gazı',
    },
    fx: {
      empty: 'hiçbir efekt ayarlanmadı.',
      badJson: 'özel FX tanımı geçerli bir JSON değil.',
      unknownColour: '“{colour}” adlı yerleşik bir renk yok. Renkler: {colours}.',
      savedMissing: '“{name}” adlı kayıtlı bir özel FX yok.',
      cannotCreate: 'Roll20 bunun için özel FX nesnesi oluşturmadı.',
      spawnFailed: 'Roll20 bunu oluşturmadı ({message}).',
    },
    errors: {
      unknownCommand: 'Bilinmeyen komut: {command}',
      noEffects: 'Bir veya daha fazla PageFX jetonu seçin ya da kimliklerini --ids ile verin.',
      selectToken: 'Önce bir veya daha fazla jeton seçin ya da kimliklerini --ids ile verin.',
      unknownIds: 'Bunlar PageFX efekti değil: {ids}',
      badSetting: 'Bilinmeyen ayar veya değer: {setting} {value}',
      noLayer: '“{name}” efektinde {n}. katman yok.',
      tooManyLayers: 'Bir efektin en fazla {max} katmanı olabilir.',
      layerUsage: '!pagefx layer add [effect] veya !pagefx layer remove <number> kullanın.',
      nullUsage: '!pagefx null create veya !pagefx null remove kullanın.',
      isEffect: '“{name}” bir efekt, bu yüzden aynı zamanda efektsiz alan olamaz.',
      badInterval:
        'Oluşturmalar arasındaki süreyi ms olarak verin, örneğin: !pagefx interval 500 1500',
      badDirection:
        'random ya da yatay ve aşağı kare sayısı verin, örneğin: !pagefx direction 2 -1',
      badArea:
        'Sayfa birimi olarak bir yarıçap ve circle veya square verin, örneğin: !pagefx area 15 circle',
      badIntensity: '0’dan büyük bir yoğunluk verin, örneğin: !pagefx intensity 1.5',
      noName: 'Bir ad verin, örneğin: !pagefx name Rıhtımda yağmur',
      triggerUsage:
        '!pagefx trigger add <round|turn|enter|leave> <start|stop|toggle|fire|burst> [every=2] [round=3] [count=5] [who=players|all|named] [names=A;B] [area=self|selected] [once] veya !pagefx trigger remove <number> kullanın.',
      triggerToken:
        'Önce bu tetikleyicinin ilgili olduğu jetonu haritada seçin ya da token=<id> verin.',
      triggerNames: 'Jeton adlarını names= ile, ; ile ayırarak verin (örneğin names=Goblin;Orc).',
      tooManyTriggers: 'Bir efektin en fazla {max} tetikleyicisi olabilir.',
      noTrigger: '“{name}” efektinde {n}. tetikleyici yok.',
      journalUsage: '!pagefx journal rebuild kullanın.',
      unknownPreset: '“{id}” adlı bir hazır ayar yok. Görmek için !pagefx presets yazın.',
      unexpected: 'Bir şeyler ters gitti: {message}',
    },
  };

  var localeUk = {
    titles: {
      ready: 'PageFX готовий до роботи.',
      menu: 'PageFX',
      status: 'Стан PageFX',
      settings: 'Налаштування PageFX',
      presets: 'Пресети PageFX',
      help: 'Команди PageFX',
      effect: 'Ефект: {name}',
    },
    messages: {
      readyHint: 'Введіть !pagefx, щоб відкрити меню.',
      adopted:
        'Взято під керування з токенів PageFX 1.x: ефектів — {effects}, областей без ефектів — {nulls}. Вони працюють як раніше.',
      rescanned:
        'Повторний пошук знайшов нових ефектів: {effects}, нових областей без ефектів: {nulls}, і забув ефекти з видаленими токенами: {dropped}.',
      allPaused: 'Усі ефекти призупинено. Введіть !pagefx resume, щоб знову їх запустити.',
      allResumed: 'Ефекти знову працюють.',
      turnedOn: 'Увімкнено: {count}.',
      turnedOff: 'Вимкнено: {count}.',
      toggled: 'Увімкнено або вимкнено: {count}.',
      paused: 'Призупинено: {count}.',
      resumed: 'Відновлено: {count}.',
      fired: 'Викликано ефектів: {count}.',
      created: 'Нових ефектів: {count}. Виберіть на картці кожного, що він створює.',
      deleted: 'Видалено ефектів: {count}. Їхні токени залишилися на карті.',
      renamed: 'Перейменовано: {count}.',
      fxSet: 'Ефект змінено: {count}.',
      intervalSet: 'Час змінено: {count}.',
      directionSet: 'Напрямок змінено: {count}.',
      areaSet: 'Область змінено: {count}.',
      intensitySet: 'Інтенсивність змінено: {count}.',
      layerAdded: 'Шар додано: {count}.',
      layerRemoved: 'Шар видалено: {count}.',
      nullCreated: 'Нових областей без ефектів: {count}.',
      nullRemoved: 'Видалено областей без ефектів: {count}.',
      presetApplied: 'Пресет «{name}» застосовано: {count}.',
      journalRebuilt: 'Роздаткові матеріали «{help}» і «{deck}» створено заново.',
      triggerAdded: 'Тригер додано: {count}.',
      triggerRemoved: 'Тригер видалено: {count}.',
      triggersCleared: 'Тригери видалено в ефектів: {count}.',
      throttled:
        'Ефекти на сторінці «{page}» проріджуються: вони запросили більше ніж {max} появ на секунду. Знизьте їхню інтенсивність або підніміть межу командою !pagefx set maxSpawnsPerSecond.',
      settingChanged: '{setting} тепер {value}.',
      problem: 'Ефект «{name}» не може працювати: {reason}',
    },
    menu: {
      page: 'Сторінка',
      live: 'ефекти працюють тут',
      notLive: 'тут немає гравців',
      allPausedNote: 'Усі ефекти призупинено.',
      effectsHere: 'Ефекти на цій сторінці',
      noEffectsHere: 'На цій сторінці ще немає ефектів.',
      otherPages: 'Інші сторінки',
      effectCount: 'Ефектів: {count}',
      actions: 'Нове',
      selectHint:
        'Спершу виберіть токен на карті, потім натисніть «Новий ефект» або «Область без ефектів». Токен позначає місце ефекту, а його Aura 1 — це область.',
      state: 'Стан',
      area: 'Область',
      areaValue: '{radius} {units} за краєм токена, {shape}',
      circle: 'коло',
      square: 'квадрат',
      circleOption: 'Коло',
      squareOption: 'Квадрат',
      layers: 'Шари',
      layer: 'Шар {n}',
      noLayers: 'Шарів немає. Додайте шар, щоб вибрати, що створює цей ефект.',
      noFxSet: 'не задано',
      timing: 'кожні {min}–{max} мс',
      directionRandom: 'випадковий напрямок',
      directionOffset: 'зсув кінця в клітинках: {dx}, {dy}',
      v1Note:
        'Цей ефект досі слідує GM Notes і смугам свого токена, як у PageFX 1.x. Зміна тут це припинить.',
      preset: 'Пресет',
      presetsHint:
        'Виберіть на карті один або кілька токенів, потім натисніть пресет. Токени, які ще не є ефектами, стануть ефектами, а їхня Aura 1 — область, яку заповнює пресет.',
      triggers: 'Тригери',
      noTriggers: 'Тригерів немає: ефект працює, поки на його сторінці є гравці.',
      triggerHint: 'Для тригера ходу або області іншого токена спершу виберіть цей токен на карті.',
      yes: 'Так',
      no: 'Ні',
    },
    buttons: {
      edit: 'Змінити',
      show: 'Показати',
      turnOn: 'Увімкнути',
      turnOff: 'Вимкнути',
      pause: 'Пауза',
      resume: 'Продовжити',
      fire: 'Викликати',
      pauseAll: 'Пауза для всіх',
      resumeAll: 'Продовжити всі',
      create: 'Новий ефект',
      createNull: 'Область без ефектів',
      removeNull: 'Прибрати область без ефектів',
      settings: 'Налаштування',
      status: 'Стан',
      rescan: 'Повторний пошук',
      rename: 'Перейменувати',
      area: 'Область',
      intensity: 'Інтенсивність',
      builtin: 'Вбудовані FX',
      saved: 'Збережені FX',
      json: 'Власний JSON',
      timing: 'Час',
      random: 'Випадковий напрямок',
      offset: 'Задати напрямок',
      addLayer: 'Додати шар',
      removeLayer: 'Видалити шар',
      delete: 'Видалити ефект',
      preset: 'Пресет',
      presets: 'Пресети',
      remove: 'Видалити',
      help: 'Довідка',
      rebuild: 'Оновити матеріали',
      onRound: 'Щораунду',
      onTurn: 'У хід',
      onEnter: 'Токен входить',
      onLeave: 'Токен виходить',
      menu: 'Меню',
      change: 'Змінити',
    },
    prompts: {
      type: 'Тип ефекту',
      colour: 'Колір',
      saved: 'Збережений власний FX',
      json: 'Опис власного FX (JSON)',
      intervalMin: 'Найкоротший час між появами в мс',
      intervalMax: 'Найдовший час між появами в мс',
      dx: 'Клітинок убік до кінця (мінус — уліво)',
      dy: 'Клітинок униз до кінця (мінус — угору)',
      name: 'Назва ефекту',
      radius: 'Радіус області за краєм токена в одиницях сторінки',
      shape: 'Форма області',
      intensity: 'Інтенсивність (від {min} до {max})',
      maxSpawns: 'Появ на секунду на одній сторінці (від 1 до {max})',
      preset: 'Пресет',
      then: 'Потім',
      every: 'Раз на скільки раундів',
      who: 'Які токени враховуються',
      area: 'Яка область',
      once: 'Лише першого разу?',
      confirmDelete: 'Видалити цей ефект? Токен залишиться на карті.',
    },
    settings: {
      language: 'Мова',
      globalIntensity: 'Інтенсивність усіх ефектів',
      gmPreviewHint:
        'Якщо ввімкнено, ефекти працюють і на сторінці, яку переглядає кожен майстер, навіть якщо там немає гравців.',
      maxSpawnsHint:
        'На сторінці, яка просить більше, ефекти проріджуються. Roll20 працює плавно приблизно до 60.',
    },
    status: {
      livePages: 'Активні сторінки',
      effects: 'Ефекти',
      running: 'Працює',
      globalPause: 'Усе на паузі',
      on: 'Увімк.',
      off: 'Вимк.',
      pausedState: 'На паузі',
      waiting: 'Не на активній сторінці',
      noFx: 'Ефект не вибрано',
      broken: 'Не може працювати',
      nullAreas: 'Області без ефектів',
      noEffects:
        'Ефектів ще немає. Виберіть токен і введіть !pagefx create або відкрийте меню командою !pagefx.',
      gmPreview: 'Перегляд сторінки майстра',
      intensity: 'Інтенсивність',
      maxSpawns: 'Макс. появ на секунду на сторінку',
    },
    help: {
      menu: 'Відкрити меню: ефекти на вашій сторінці та кнопки для всього іншого.',
      create:
        'Зробити вибрані токени ефектами. Їхня Aura 1 — це область; якщо аури немає, її буде додано.',
      edit: 'Показати картку кожного вибраного ефекту з кнопками для його зміни.',
      preset: 'Застосувати пресет до вибраних токенів, за потреби спершу зробивши їх ефектами.',
      presets: 'Список пресетів за наборами.',
      switches:
        'Увімкнути або вимкнути вибрані ефекти чи призупинити й відновити їх. Якщо нічого не вибрано, on і resume знову запускають усе, а off і pause усе зупиняють (як !pageFX on і off у версії 1).',
      fire: 'Викликати вибрані ефекти зараз, один або кілька разів, щоб випробувати їх.',
      fx: 'Задати, що створює шар: вбудований ефект, наприклад burn-fire, назву збереженого власного FX або опис власного FX у JSON.',
      interval:
        'Задати час між появами шару в мілісекундах. Кожна пауза вибирається між двома значеннями.',
      direction:
        'Для променевих ефектів задати, де закінчується кожна поява: випадково або через задану кількість клітинок убік і вниз від початку.',
      area: 'Задати область: радіус Aura 1 токена в одиницях сторінки та її форму.',
      intensity:
        'Помножити частоту появи вибраних ефектів (від 0.1 до 5). З global — змінити її для всіх ефектів.',
      name: 'Перейменувати вибрані ефекти.',
      layer: 'Додати шар, щоб один ефект створював кілька речей, або видалити шар.',
      triggerAdd:
        'Додати тригер: на round, turn, enter або leave виконати start, stop, toggle, fire або burst. Параметри: every=2, round=3, count=5, who=players|all|named, names=A;B, area=selected, once.',
      triggerRemove: 'Видалити один тригер або всі тригери у вибраних ефектів.',
      null: 'Зробити вибрані токени областями без ефектів, де ефекти ніколи не з’являються, або скасувати це.',
      delete: 'Зняти ефект із вибраних токенів. Токени залишаться на карті.',
      status: 'Список усіх ефектів, їхніх сторінок і того, чи вони працюють.',
      settings: 'Показати налаштування.',
      set: 'Змінити налаштування: language, gmPagePreview, intensity або maxSpawnsPerSecond.',
      rescan:
        'Взяти під керування нові токени з іменами PageFX або NullFX і забути ефекти, чиї токени видалено.',
      journal: 'Створити заново роздаткові матеріали довідки та Command Deck.',
      help: 'Показати цей список.',
      handout:
        'Повні інструкції — у роздатковому матеріалі «{help}», кнопки в один клік — у «{deck}».',
    },
    deck: {
      menuTitle: 'Меню',
      menuDesc: 'Головне меню показує ефекти на вашій сторінці. «Стан» показує всі.',
      newTitle: 'Нове',
      newDesc:
        'Спершу виберіть на карті один або кілька токенів. Їхня Aura 1 стане областю, яку заповнює ефект.',
      selectedTitle: 'Вибрані ефекти',
      selectedDesc: 'Виберіть токени ефектів на карті, потім натисніть кнопку.',
      allTitle: 'Усе одразу',
      allDesc: 'Зупинити всі ефекти або знову запустити їх усі.',
      toolsTitle: 'Інструменти',
      toolsDesc: 'Підхопити скопійовані або видалені токени та створити ці матеріали заново.',
      footer: 'Повні інструкції — у роздатковому матеріалі «{help}».',
    },
    handout: {
      versionLabel: 'Версія',
      subtitle: 'Погода та фонові ефекти для карт Roll20',
      footer: 'Кнопки керування в один клік — у роздатковому матеріалі «{deck}».',
      overview: {
        heading: 'Огляд',
        body: 'PageFX заповнює область карти безперервними ефектами: дощем, снігом, жаринками, парою, світлячками та багатьом іншим. Токен позначає місце кожного ефекту, а його Aura 1 — це область. Ефекти працюють на кожній сторінці, де є гравці, зокрема на сторінках, куди відправлено частину розділеної групи, і зупиняються, коли гравці йдуть. Усе налаштовується через меню в чаті, а тригери можуть запускати й зупиняти ефекти з плином бойових раундів або під час руху токенів.',
        demo: 'Переглянути коротку демонстрацію (з версії 1)',
      },
      quickStart: {
        heading: 'Швидкий старт',
        steps: [
          'Поставте токен туди, де має бути ефект (на шарі майстра він прихований від гравців), і виберіть його.',
          'Введіть !pagefx presets або відкрийте Command Deck і натисніть «Пресети», потім натисніть пресет, наприклад «Сильний дощ».',
          'Змініть розмір Aura 1 токена, щоб задати область, яку заповнює ефект. Аура прихована від гравців.',
          'Перемістіть гравців на сторінку. Ефект запуститься і зупиниться, коли вони підуть.',
          'Введіть !pagefx, щоб відкрити меню, і натисніть «Змінити» біля ефекту, щоб змінити його.',
        ],
      },
      effects: {
        heading: 'Ефекти',
        points: [
          'Ефект — це токен плюс налаштування, які зберігає PageFX. Перемістіть токен, щоб перемістити ефект, і змініть його Aura 1, щоб змінити область. Видалення токена видаляє ефект.',
          'Кожен ефект має один або кілька шарів. Кожен шар знову й знову створює одну річ із випадковою паузою між найкоротшим і найдовшим часом.',
          'Шар може створювати вбудований ефект Roll20 (тип і колір, наприклад burn-fire), власний FX, збережений у грі, або опис власного FX, вставлений як JSON. Відсутні значення в описі заповнюються, тож навіть короткий опис малюється.',
          'Променеві ефекти (beam, breath, splatter і власні FX із кутом -1) малюються між двома точками. Їхній напрямок випадковий або заданий кількістю клітинок убік і вниз.',
          'Інтенсивність множить частоту появи ефекту. Налаштування intensity множить усі ефекти.',
          '«Вимкнути» зупиняє ефект, доки його не ввімкнуть. «Пауза» затримує його, доки його не відновлять. «Пауза для всіх» затримує всі ефекти, не змінюючи їх.',
          'Jumpgate малює описи власних FX білим кольором, якщо їх не збережено як власні FX, тому PageFX зберігає свої описи як власні FX з іменами «PageFX: …». Їх видаляють, коли жоден ефект їх не використовує. Не чіпайте їх.',
        ],
      },
      pages: {
        heading: 'На яких сторінках працюють ефекти',
        points: [
          'Ефекти працюють на сторінці зі стрічкою гравців і на кожній сторінці, куди гравця було переміщено окремо.',
          'Увімкніть «Перегляд сторінки майстра», щоб ефекти працювали й на сторінці, яку переглядає кожен майстер, і їх можна було випробувати без гравців.',
          'Кожна сторінка отримує не більше «Макс. появ на секунду» (за замовчуванням 30). Якщо ефекти просять більше, частина появ пропускається, і майстру повідомляють про це один раз.',
          'Коли інший мод переміщує стрічку або розділяє групу, Roll20 нікому про це не повідомляє, тому PageFX перевіряє це кожні кілька секунд і надолужує.',
        ],
      },
      presets: {
        heading: 'Пресети',
        intro:
          'Пресет дає ефекту набір готових шарів. Якщо потім змінити шар, ефект стає вашим власним. Інші моди можуть додавати пресети через PageFX.registerPreset.',
        colPack: 'Набір',
        colPresets: 'Пресети (назва та ID)',
      },
      triggers: {
        heading: 'Тригери',
        intro:
          'Тригер запускає, зупиняє, перемикає або викликає ефект, коли щось відбувається. Додавайте їх із картки ефекту або командою !pagefx trigger add.',
        points: [
          'Щораунду: Roll20 не зберігає номер раунду, тому раунд починається, коли порядок ходів переходить з останнього запису знову на перший. Якщо є власний запис порядку ходів з іменем «Round», використовується він. Виберіть «раз на скількись раундів» або один раунд. Перший раунд бою не вважається зміною.',
          'У хід: коли вибраний токен стає першим у порядку ходів. Перед натисканням кнопки виберіть токен на карті.',
          'Токен входить або виходить: коли токен входить в область ефекту або в Aura 1 іншого вибраного вами токена чи виходить із неї. За замовчуванням враховуються лише токени під керуванням гравців; можна вибрати будь-який токен або вказати імена.',
          '«Викликати серію» створює ефект кілька разів одночасно. «Лише першого разу» змушує тригер спрацювати один раз.',
          'Roll20 нічого не повідомляє модам, коли інший мод переміщує токен. Моди, які переміщують токени, можуть потім викликати PageFX.checkToken(token).',
        ],
      },
      nullAreas: {
        heading: 'Області без ефектів',
        points: [
          'Область без ефектів — це токен, де ефекти ніколи не з’являються, наприклад усередині будинку під час бурі. Її область — це токен і його Aura 1.',
          'Виберіть токен і натисніть «Область без ефектів» у меню або Command Deck. Токени з іменем NullFX, як у версії 1, теж є областями без ефектів.',
        ],
      },
      commands: {
        heading: 'Команди',
        intro:
          'Ці команди доступні лише майстрам. Вони діють на вибрані токени або на токени, вказані через --ids. Команди шарів діють на шар 1, якщо --layer не вказує інший. Інші моди теж можуть їх надсилати; відповіді надходять майстру.',
        colCommand: 'Команда',
        colDesc: 'Що робить',
      },
      settings: {
        heading: 'Налаштування',
        intro:
          'Змінюйте налаштування з картки «Налаштування» або командою !pagefx set. Мову також можна задати на сторінці налаштувань мода.',
        colKey: 'Налаштування',
        colDesc: 'Що робить',
        rows: {
          language: 'Мова меню, повідомлень і роздаткових матеріалів PageFX.',
          gmPagePreview:
            'Також запускати ефекти на сторінці, яку переглядає кожен майстер (за замовчуванням вимкнено).',
          intensity: 'Множить частоту появи всіх ефектів (за замовчуванням 1).',
          maxSpawnsPerSecond:
            'Найбільша кількість появ на одній сторінці за секунду, від 1 до 60 (за замовчуванням 30).',
        },
      },
      api: {
        heading: 'Для інших модів',
        intro: 'PageFX публікує об’єкт PageFX. Там, де функція приймає токен, підійде й ID токена.',
        colFunction: 'Функція',
        colDesc: 'Що робить',
        rows: {
          activateAll: 'Відновити всі ефекти (версія 1).',
          deactivateAll: 'Призупинити всі ефекти (версія 1).',
          activate: 'Увімкнути, вимкнути або перемкнути один ефект (версія 1).',
          start: 'Увімкнути або вимкнути один ефект чи призупинити й відновити його.',
          setIntensity: 'Змінити інтенсивність одного ефекту.',
          fire: 'Викликати один ефект зараз.',
          create:
            'Зробити токен ефектом із параметрами name, fx, interval, direction та intensity або зняти з нього ефект.',
          getEffect:
            'Прочитати ефект, перелічити ефекти (на одній сторінці) або дізнатися, чи працює ефект.',
          registerPreset: 'Додати пресет на цей сеанс або перелічити пресети.',
          checkToken: 'Перевірити токен, переміщений вашим модом, на тригери входу та виходу.',
        },
      },
      upgrading: {
        heading: 'Перехід із версії 1',
        points: [
          'Токени з іменами PageFX і NullFX беруться під керування під час першого запуску й працюють як раніше.',
          'Доки ви не зміните ефект із чату, ним і далі керують GM Notes, Bar 1 (час між появами) і Bar 2 (напрямок променя) його токена, а маркер «заборона» і далі його вимикає. Щойно ви зміните його з чату, GM Notes і смуги знову у вашому розпорядженні.',
          'Версія 1 малювала ефекти лише на сторінці зі стрічкою гравців і створювала збережені власні FX двічі. Обидві помилки виправлено.',
          'Команди версії 1 і далі працюють:',
        ],
        colV1: 'Команда версії 1',
        colV2: 'Те саме, що',
      },
      troubleshooting: {
        heading: 'Розв’язання проблем',
        points: [
          'Ефект не працює: відкрийте його картку. Рядок «Стан» пояснює чому: вимкнено, на паузі, ефект не вибрано, не може працювати (з причиною) або не на активній сторінці (там немає гравців; щоб випробувати, увімкніть «Перегляд сторінки майстра»).',
          'Нічого не видно: дуже дрібні або короткочасні частинки важко помітити на строкатій карті. Спробуйте пресет, підніміть інтенсивність або зменште область.',
          'Ефекти виглядають рідкими: можливо, сторінка досягла «Макс. появ на секунду». Знизьте інтенсивність деяких ефектів або підніміть межу.',
          'Ефекти зупинилися після копіювання сторінки або гри: натисніть «Повторний пошук».',
          'У всіх інших випадках перевірте журнал консолі API і додайте його повідомлення, коли просите про допомогу.',
        ],
      },
      languages: {
        heading: 'Мови',
        body: 'Виберіть мову на картці «Налаштування» або командою !pagefx set language. Доступні мови:',
        colLanguage: 'Мова',
        colNative: 'Рідна назва',
        colCode: 'Код',
      },
      credits: {
        heading: 'Подяки',
        original: 'Автор оригінального мода:',
        maintainer: 'Версію 2 підтримує',
        marketplace: 'Набори малюнків Ada на Roll20 Marketplace',
        support:
          'Якщо ви знайшли помилку або маєте ідею, напишіть на форумі модів Roll20 або відкрийте issue на GitHub і додайте повідомлення з журналу консолі API.',
      },
    },
    triggers: {
      line: '{when}: {action}',
      eachRound: 'Кожен новий раунд',
      everyRounds: 'Кожен {n}-й раунд',
      onRound: 'У раунді {n}',
      turn: 'Коли починається хід {name}',
      enter: 'Коли {who} входить в {area}',
      leave: 'Коли {who} залишає {area}',
      areaSelf: 'область цього ефекту',
      areaSelected: 'область аури вибраного токена',
      areaOf: 'область аури {name}',
      unnamed: 'токен',
      once: '(лише першого разу)',
      onceUsed: '(лише першого разу, уже спрацював)',
      who: {
        players: 'токен гравця',
        all: 'будь-який токен',
      },
      action: {
        start: 'запустити',
        stop: 'зупинити',
        toggle: 'увімкнути або вимкнути',
        fire: 'викликати один раз',
        burst: 'викликати серію з {count}',
      },
      choice: {
        start: 'Запустити',
        stop: 'Зупинити',
        toggle: 'Увімкнути або вимкнути',
        fire: 'Викликати один раз',
        burst: 'Викликати серію',
      },
    },
    packs: {
      weather: 'Погода',
      fire: 'Вогонь і жар',
      water: 'Вода',
      magic: 'Магія та моторошне',
      custom: 'З інших модів',
    },
    presets: {
      'light-rain': 'Легкий дощ',
      'heavy-rain': 'Сильний дощ',
      thunderstorm: 'Гроза',
      snow: 'Сніг',
      blizzard: 'Хуртовина',
      hail: 'Град',
      sandstorm: 'Піщана буря',
      fog: 'Пасма туману',
      embers: 'Жаринки',
      ash: 'Падаючий попіл',
      magma: 'Вируюча магма',
      'lava-spurts': 'Бризки лави',
      sparks: 'Іскри',
      drips: 'Краплі в печері',
      steam: 'Парові викиди',
      geyser: 'Гейзер',
      spray: 'Бризки водоспаду',
      bubbles: 'Бульбашки',
      fireflies: 'Світлячки',
      'arcane-motes': 'Магічні іскринки',
      'necrotic-mist': 'Некротичний туман',
      'holy-glimmer': 'Священне мерехтіння',
      'swamp-gas': 'Болотяний газ',
    },
    fx: {
      empty: 'ефект не задано.',
      badJson: 'опис власного FX не є коректним JSON.',
      unknownColour: 'вбудованого кольору «{colour}» немає. Кольори: {colours}.',
      savedMissing: 'збереженого власного FX з назвою «{name}» немає.',
      cannotCreate: 'Roll20 не створив для нього об’єкт власного FX.',
      spawnFailed: 'Roll20 не зміг його створити ({message}).',
    },
    errors: {
      unknownCommand: 'Невідома команда: {command}',
      noEffects: 'Виберіть один або кілька токенів PageFX або вкажіть їхні ID через --ids.',
      selectToken: 'Спершу виберіть один або кілька токенів або вкажіть їхні ID через --ids.',
      unknownIds: 'Це не ефекти PageFX: {ids}',
      badSetting: 'Невідоме налаштування або значення: {setting} {value}',
      noLayer: '«{name}» не має шару {n}.',
      tooManyLayers: 'Ефект може мати не більше {max} шарів.',
      layerUsage: 'Використовуйте !pagefx layer add [effect] або !pagefx layer remove <number>.',
      nullUsage: 'Використовуйте !pagefx null create або !pagefx null remove.',
      isEffect: '«{name}» — ефект, тому він не може бути ще й областю без ефектів.',
      badInterval: 'Вкажіть час між появами в мс, наприклад: !pagefx interval 500 1500',
      badDirection:
        'Вкажіть random або кількість клітинок убік і вниз, наприклад: !pagefx direction 2 -1',
      badArea:
        'Вкажіть радіус в одиницях сторінки та circle або square, наприклад: !pagefx area 15 circle',
      badIntensity: 'Вкажіть інтенсивність більше за 0, наприклад: !pagefx intensity 1.5',
      noName: 'Вкажіть назву, наприклад: !pagefx name Дощ над причалами',
      triggerUsage:
        'Використовуйте !pagefx trigger add <round|turn|enter|leave> <start|stop|toggle|fire|burst> [every=2] [round=3] [count=5] [who=players|all|named] [names=A;B] [area=self|selected] [once] або !pagefx trigger remove <number>.',
      triggerToken:
        'Спершу виберіть на карті токен, якого стосується цей тригер, або вкажіть token=<id>.',
      triggerNames:
        'Вкажіть імена токенів через names=, розділяючи їх знаком ; (наприклад names=Goblin;Orc).',
      tooManyTriggers: 'Ефект може мати не більше {max} тригерів.',
      noTrigger: '«{name}» не має тригера {n}.',
      journalUsage: 'Використовуйте !pagefx journal rebuild.',
      unknownPreset: 'Пресету «{id}» немає. Введіть !pagefx presets, щоб побачити їх.',
      unexpected: 'Щось пішло не так: {message}',
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
    af: TRANSLATION$c,
    ca: TRANSLATION$b,
    'zh-TW': TRANSLATION$a,
    cs: TRANSLATION$9,
    da: TRANSLATION$8,
    nl: TRANSLATION$7,
    'en-US': localeEnUS,
    fi: TRANSLATION$6,
    fr: TRANSLATION$5,
    de: TRANSLATION$4,
    el: TRANSLATION$3,
    he: localeHe,
    hu: TRANSLATION$2,
    it: TRANSLATION$1,
    ja: localeJa,
    ko: localeKo,
    pl: TRANSLATION,
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

  // Persistent state: state.PageFX. v1 kept no state at all; everything lived on
  // the PageFX tokens. v2 keeps each effect's settings here, keyed by the ID of
  // the token that marks its position and area.

  /**
   * @typedef {object} Layer
   * @property {import('./fx.js').FxSpec|null} fx What to spawn.
   * @property {[number, number]} interval Shortest and longest time between spawns, in ms.
   * @property {null|'random'|{dx: number, dy: number}} direction End of beam-like effects, in cells.
   * @property {string|null} error Message key when the effect text could not be read.
   */

  /**
   * @typedef {object} Effect
   * @property {string} id ID of the token marking the effect.
   * @property {string} name Name shown in menus.
   * @property {boolean} enabled False when turned off.
   * @property {boolean} paused True when held until resumed.
   * @property {number} intensity Rate multiplier.
   * @property {Layer[]} layers What it spawns.
   * @property {string|null} preset Preset its layers came from.
   * @property {object[]} triggers Triggers.
   * @property {'v1'|'chat'} source 'v1' while the token's GM Notes and bars still drive it.
   */

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
      paused: false,
      effects: {},
      nullAreas: {},
      ownedFx: {},
      // Tokens the GM took an effect or no-effect area off. They are not taken
      // over again for being named PageFX or NullFX.
      released: {},
      // Combat round, counted from turn order wraps or read from a "Round" entry.
      round: 1,
      notices: { useroptions: {}, adoptedV1: false },
    };
  }

  /**
   * Cleans a stored state, filling in anything missing.
   *
   * @param {*} raw Stored state.
   * @returns {{state: object, fresh: boolean}} Clean state and whether it was new.
   */
  function migrateState(raw) {
    if (!isRecord(raw)) {
      return { state: createDefaultState(), fresh: true };
    }
    const base = createDefaultState();
    const clean = {
      ...base,
      ...raw,
      schemaVersion: SCHEMA_VERSION,
      settings: { ...base.settings, ...(isRecord(raw.settings) ? raw.settings : {}) },
      effects: isRecord(raw.effects) ? raw.effects : {},
      nullAreas: isRecord(raw.nullAreas) ? raw.nullAreas : {},
      ownedFx: isRecord(raw.ownedFx) ? raw.ownedFx : {},
      released: isRecord(raw.released) ? raw.released : {},
      notices: { ...base.notices, ...(isRecord(raw.notices) ? raw.notices : {}) },
      paused: raw.paused === true,
      round: Math.max(1, Math.round(toNumber(raw.round) ?? 1)),
    };
    for (const [id, effect] of Object.entries(clean.effects)) {
      clean.effects[id] = cleanEffect(effect, id);
    }
    return { state: clean, fresh: false };
  }

  /**
   * Cleans one stored effect.
   *
   * @param {*} raw Stored effect.
   * @param {string} id Effect ID.
   * @returns {Effect} Effect.
   */
  function cleanEffect(raw, id) {
    const e = isRecord(raw) ? raw : {};
    return {
      id,
      name: truncate(e.name || 'PageFX', MAX_NAME_LENGTH),
      enabled: e.enabled !== false,
      paused: e.paused === true,
      intensity: clampIntensity(e.intensity),
      layers: (Array.isArray(e.layers) ? e.layers : []).map(cleanLayer),
      preset: typeof e.preset === 'string' ? e.preset : null,
      triggers: (Array.isArray(e.triggers) ? e.triggers : [])
        .map(cleanTrigger)
        .filter(Boolean)
        .slice(0, MAX_TRIGGERS),
      source: e.source === 'v1' ? 'v1' : 'chat',
    };
  }

  const TRIGGER_EVENTS = ['round', 'turn', 'enter', 'leave'];
  const TRIGGER_ACTIONS = ['start', 'stop', 'toggle', 'fire', 'burst'];
  const TRIGGER_WHO = ['players', 'all', 'named'];
  const DEFAULT_BURST = 5;
  const MAX_TRIGGERS = 8;

  /**
   * @typedef {object} Trigger
   * @property {'round'|'turn'|'enter'|'leave'} event What sets it off.
   * @property {'start'|'stop'|'toggle'|'fire'|'burst'} action What it does to the effect.
   * @property {number} count Spawns for a burst.
   * @property {number} every Round triggers: every this many rounds.
   * @property {number|null} round Round triggers: only on this round.
   * @property {string|null} token Turn: whose turn. Enter/leave: the token whose Aura 1
   *   is the area (null: the effect's own area).
   * @property {'players'|'all'|'named'} who Enter/leave: which tokens count.
   * @property {string[]} names Enter/leave with who "named": token names that count.
   * @property {boolean} once Only goes off once.
   * @property {boolean} used A once-only trigger that has gone off.
   */

  /**
   * Cleans a stored or typed trigger.
   *
   * @param {*} raw Trigger.
   * @returns {Trigger|null} Trigger, or null when its event or action is unknown.
   */
  function cleanTrigger(raw) {
    if (!isRecord(raw) || !TRIGGER_EVENTS.includes(raw.event)) {
      return null;
    }
    if (!TRIGGER_ACTIONS.includes(raw.action)) {
      return null;
    }
    const count = Math.round(toNumber(raw.count) ?? DEFAULT_BURST);
    const every = Math.round(toNumber(raw.every) ?? 1);
    const round = toNumber(raw.round);
    return {
      event: raw.event,
      action: raw.action,
      count: Math.min(MAX_FIRE_COUNT, Math.max(1, count)),
      every: Math.max(1, every),
      round: round !== null && round >= 1 ? Math.round(round) : null,
      token: toText(raw.token) || null,
      who: TRIGGER_WHO.includes(raw.who) ? raw.who : 'players',
      names: (Array.isArray(raw.names) ? raw.names : [])
        .map((n) => toText(n))
        .filter(Boolean)
        .slice(0, 20),
      once: raw.once === true,
      used: raw.used === true,
    };
  }

  /**
   * Cleans one stored layer.
   *
   * @param {*} raw Stored layer.
   * @returns {Layer} Layer.
   */
  function cleanLayer(raw) {
    const l = isRecord(raw) ? raw : {};
    return {
      fx: isRecord(l.fx) ? l.fx : null,
      interval: cleanInterval(l.interval),
      direction: cleanDirection(l.direction),
      error: typeof l.error === 'string' ? l.error : null,
    };
  }

  /**
   * Cleans an interval pair.
   *
   * @param {*} raw [low, high] in ms.
   * @returns {[number, number]} Interval.
   */
  function cleanInterval(raw) {
    const [a, b] = Array.isArray(raw) ? raw : [];
    const low = clamp(toNumber(a) ?? DEFAULT_INTERVAL_MS, 1, MAX_INTERVAL_MS);
    const high = clamp(toNumber(b) ?? low, 1, MAX_INTERVAL_MS);
    return low <= high ? [low, high] : [high, low];
  }

  /**
   * Cleans a beam direction.
   *
   * @param {*} raw 'random', {dx, dy} or nothing.
   * @returns {null|'random'|{dx: number, dy: number}} Direction.
   */
  function cleanDirection(raw) {
    if (raw === 'random') {
      return 'random';
    }
    if (isRecord(raw)) {
      return { dx: toNumber(raw.dx) || 0, dy: toNumber(raw.dy) || 0 };
    }
    return null;
  }

  /**
   * Keeps an intensity in range.
   *
   * @param {*} raw Intensity.
   * @returns {number} Intensity between the limits (1 when unreadable).
   */
  function clampIntensity(raw) {
    const n = toNumber(raw);
    return n === null ? 1 : clamp(n, MIN_INTENSITY, MAX_INTENSITY);
  }

  /**
   * Reads an effect the v1 way, from its token: GM Notes hold the effect, Bar 1
   * value and max the interval range in ms, Bar 2 value and max the end offset
   * of beam-like effects (or "random"), and the interdiction marker turns it off.
   *
   * @param {object} token Roll20 graphic.
   * @returns {{layer: Layer, enabled: boolean}} The token's layer and on/off state.
   */
  function readV1Token(token) {
    const parsed = parseFxSpec(decodeNotes(token.get('gmnotes')));
    const low = toNumber(token.get('bar1_value'));
    const high = toNumber(token.get('bar1_max'));
    const dxRaw = toText(token.get('bar2_value'));
    let direction = null;
    if (dxRaw.toLowerCase() === 'random') {
      direction = 'random';
    } else if (dxRaw !== '' || toText(token.get('bar2_max')) !== '') {
      direction = { dx: toNumber(dxRaw) || 0, dy: toNumber(token.get('bar2_max')) || 0 };
    }
    const lowMs = low && low > 0 ? low : DEFAULT_INTERVAL_MS;
    return {
      layer: {
        fx: parsed.ok ? parsed.fx : null,
        interval: cleanInterval([lowMs, high && high > 0 ? high : lowMs]),
        direction,
        error: parsed.ok ? null : parsed.error,
      },
      enabled: !hasMarker(token, V1_DISABLE_MARKER),
    };
  }

  /**
   * Builds a new effect from a v1 token.
   *
   * @param {object} token Roll20 graphic.
   * @returns {Effect} Effect.
   */
  function effectFromV1Token(token) {
    const { layer, enabled } = readV1Token(token);
    return cleanEffect(
      {
        name: layer.fx ? describeFx(layer.fx) : toText(token.get('name')) || 'PageFX',
        enabled,
        layers: [layer],
        source: 'v1',
      },
      token.id
    );
  }

  // ---------------------------------------------------------------------------
  // Live state access (Roll20 sandbox only).

  /**
   * Loads and cleans state.PageFX.
   *
   * @returns {boolean} True when there was no state before (a new install or a v1 game).
   */
  function initialiseState() {
    const { state: clean, fresh } = migrateState(state[STATE_KEY]);
    clean.version = SCRIPT_VERSION;
    state[STATE_KEY] = clean;
    return fresh;
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
    if (key === 'gmPagePreview') {
      if (typeof value !== 'boolean') {
        return false;
      }
      s.gmPagePreview = value;
      return true;
    }
    if (key === 'intensity') {
      const n = toNumber(value);
      if (n === null) {
        return false;
      }
      s.intensity = clampIntensity(n);
      return true;
    }
    if (key === 'maxSpawnsPerSecond') {
      const n = toNumber(value);
      if (n === null || n < 1) {
        return false;
      }
      s.maxSpawnsPerSecond = clamp(Math.round(n), 1, MAX_SPAWNS_PER_SECOND_LIMIT);
      return true;
    }
    return false;
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
    const branch = globalconfig.pagefx || globalconfig[STATE_KEY] || globalconfig['page fx'];
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

  /**
   * Returns every effect.
   *
   * @returns {Record<string, Effect>} Effects by ID.
   */
  function getEffects() {
    return getState().effects;
  }

  /**
   * Returns one effect.
   *
   * @param {string} id Effect ID.
   * @returns {Effect|undefined} Effect.
   */
  function getEffect(id) {
    return getState().effects[id];
  }

  /**
   * Stores an effect.
   *
   * @param {Effect} effect Effect.
   * @returns {Effect} The stored effect.
   */
  function putEffect(effect) {
    getState().effects[effect.id] = effect;
    return effect;
  }

  /**
   * Forgets an effect.
   *
   * @param {string} id Effect ID.
   * @returns {void}
   */
  function deleteEffect(id) {
    delete getState().effects[id];
  }

  /**
   * Returns the tokens the GM took an effect or area off, keyed by token ID.
   *
   * @returns {Record<string, true>} Released token IDs.
   */
  function getReleased() {
    return getState().released;
  }

  /**
   * Returns the no-effect areas, keyed by token ID.
   *
   * @returns {Record<string, {source: string}>} Null areas.
   */
  function getNullAreas() {
    return getState().nullAreas;
  }

  // Runs effects: one timer chain per layer of each running effect.

  /** @type {Map<string, {pageId: string, timers: Array<*>, resolved: Array<*>}>} */
  const running = new Map();
  /** @type {Map<string, Array<{error: string, vars?: object}|null>>} */
  const problems = new Map();
  /** @type {Map<string, number[]>} */
  const recentSpawns = new Map();

  let onThrottle = () => {};
  let onProblem = () => {};

  /**
   * Sets callbacks for things the GM should hear about.
   *
   * @param {object} hooks Callbacks.
   * @param {(pageId: string) => void} [hooks.throttle] A page hit the spawn rate cap.
   * @param {(effectId: string, problem: object) => void} [hooks.problem] An effect layer cannot run.
   * @returns {void}
   */
  function setSchedulerHooks({ throttle, problem } = {}) {
    onThrottle = throttle || (() => {});
    onProblem = problem || (() => {});
  }

  /**
   * Reads the values the area maths needs from a token.
   *
   * @param {object} token Roll20 graphic.
   * @returns {object} Token values.
   */
  function tokenValues(token) {
    return {
      left: token.get('left'),
      top: token.get('top'),
      width: token.get('width'),
      height: token.get('height'),
      aura1_radius: token.get('aura1_radius'),
      aura1_square: token.get('aura1_square'),
    };
  }

  /**
   * Reads the values the area maths needs from a page.
   *
   * @param {object} page Roll20 page.
   * @returns {object} Page values.
   */
  function pageValues(page) {
    return {
      width: page.get('width'),
      height: page.get('height'),
      snapping_increment: page.get('snapping_increment'),
      scale_number: page.get('scale_number'),
    };
  }

  /**
   * Returns the no-effect areas on a page.
   *
   * @param {string} pageId Page ID.
   * @param {import('./geometry.js').PageMetrics} metrics Page metrics.
   * @returns {import('./geometry.js').Area[]} Areas.
   */
  function nullAreasOn(pageId, metrics) {
    const areas = [];
    for (const id of Object.keys(getNullAreas())) {
      const token = getObj('graphic', id);
      if (token && token.get('_pageid') === pageId) {
        areas.push(tokenArea(tokenValues(token), metrics));
      }
    }
    return areas;
  }

  /**
   * Takes one spawn from a page's budget.
   *
   * @param {string} pageId Page ID.
   * @returns {boolean} True when the page may spawn now.
   */
  function takeSpawnBudget(pageId) {
    const t = now();
    const list = (recentSpawns.get(pageId) || []).filter((s) => t - s < RATE_WINDOW_MS);
    if (list.length >= getSettings().maxSpawnsPerSecond) {
      recentSpawns.set(pageId, list);
      onThrottle(pageId);
      return false;
    }
    list.push(t);
    recentSpawns.set(pageId, list);
    return true;
  }

  /**
   * Returns the page an effect's token is on, or null when the token is gone.
   *
   * @param {string} effectId Effect ID.
   * @returns {string|null} Page ID.
   */
  function effectPageId(effectId) {
    const token = getObj('graphic', effectId);
    return token ? token.get('_pageid') : null;
  }

  /**
   * Works out whether an effect should be running now.
   *
   * @param {import('./state.js').Effect} effect Effect.
   * @param {Set<string>} live Live page IDs.
   * @returns {boolean} True when it should run.
   */
  function shouldRun(effect, live) {
    const pageId = effectPageId(effect.id);
    return (
      !!pageId &&
      live.has(pageId) &&
      effect.enabled &&
      !effect.paused &&
      !getState().paused &&
      effect.layers.length > 0
    );
  }

  /**
   * Spawns one effect for a layer, then queues the next.
   *
   * @param {string} effectId Effect ID.
   * @param {number} index Layer number.
   * @returns {void}
   */
  function tick(effectId, index) {
    const run = running.get(effectId);
    const effect = getEffect(effectId);
    const token = getObj('graphic', effectId);
    if (!run || !effect || !token || !effect.layers[index]) {
      stopEffect(effectId);
      return;
    }
    const layer = effect.layers[index];
    const page = getObj('page', token.get('_pageid'));
    if (page) {
      const metrics = pageMetrics(pageValues(page));
      const pt = clampToPage(randomPointIn(tokenArea(tokenValues(token), metrics)), metrics);
      const blocked = nullAreasOn(page.id, metrics).some((area) => isInArea(pt, area));
      if (!blocked && takeSpawnBudget(page.id)) {
        const fx = run.resolved[index];
        const end = fx.beam ? clampToPage(beamEnd(pt, layer.direction, metrics), metrics) : null;
        spawn(fx, pt, end, page.id);
      }
    }
    queue(effectId, index);
  }

  /**
   * Queues a layer's next spawn.
   *
   * @param {string} effectId Effect ID.
   * @param {number} index Layer number.
   * @returns {void}
   */
  function queue(effectId, index) {
    const run = running.get(effectId);
    const effect = getEffect(effectId);
    if (!run || !effect) {
      return;
    }
    const delay = nextDelay(
      effect.layers[index].interval,
      effect.intensity * getSettings().intensity,
      MIN_DELAY_MS
    );
    run.timers[index] = setTimeout(() => {
      try {
        tick(effectId, index);
      } catch (err) {
        log(`PageFX ERROR in effect ${effectId}: ${err?.message || err}`);
        recordProblem(effectId, index, {
          error: 'fx.spawnFailed',
          vars: { message: String(err?.message || err) },
        });
        if (run.timers) {
          run.timers[index] = null;
        }
      }
    }, delay);
  }

  /**
   * Records why a layer cannot run.
   *
   * @param {string} effectId Effect ID.
   * @param {number} index Layer number.
   * @param {{error: string, vars?: object}} problem Problem.
   * @returns {void}
   */
  function recordProblem(effectId, index, problem) {
    const list = problems.get(effectId) || [];
    list[index] = problem;
    problems.set(effectId, list);
    onProblem(effectId, problem);
  }

  /**
   * Starts an effect's timers.
   *
   * @param {string} effectId Effect ID.
   * @returns {boolean} True when at least one layer started.
   */
  function startEffect(effectId) {
    stopEffect(effectId);
    const effect = getEffect(effectId);
    const pageId = effectPageId(effectId);
    if (!effect || !pageId) {
      return false;
    }
    problems.delete(effectId);
    const run = { pageId, timers: [], resolved: [] };
    running.set(effectId, run);
    const owned = getState().ownedFx;
    effect.layers.forEach((layer, index) => {
      if (!layer.fx) {
        if (layer.error) {
          recordProblem(effectId, index, { error: layer.error });
        }
        return;
      }
      const result = resolveFx(layer.fx, {
        owned,
        key: `${effectId}#${index}`,
        label: `${effect.name} ${index + 1}`,
      });
      if (!result.ok) {
        recordProblem(effectId, index, { error: result.error, vars: result.vars });
        return;
      }
      run.resolved[index] = result.fx;
      queue(effectId, index);
    });
    if (run.resolved.filter(Boolean).length === 0) {
      running.delete(effectId);
      return false;
    }
    return true;
  }

  /**
   * Stops an effect's timers.
   *
   * @param {string} effectId Effect ID.
   * @returns {boolean} True when it was running.
   */
  function stopEffect(effectId) {
    const run = running.get(effectId);
    if (!run) {
      return false;
    }
    for (const timer of run.timers) {
      if (timer) {
        clearTimeout(timer);
      }
    }
    running.delete(effectId);
    return true;
  }

  /**
   * Stops everything.
   *
   * @returns {void}
   */
  function stopAll() {
    for (const id of [...running.keys()]) {
      stopEffect(id);
    }
  }

  /**
   * Starts the effects that should run and stops the rest. Called whenever
   * the live pages, an effect or the global pause change.
   *
   * @returns {{started: number, stopped: number}} Counts.
   */
  function syncEffects() {
    const live = getLivePages(getSettings().gmPagePreview);
    lastLiveKey = [...live].sort().join('|');
    let started = 0;
    let stopped = 0;
    for (const id of [...running.keys()]) {
      const effect = getEffect(id);
      if (!effect || !shouldRun(effect, live) || running.get(id).pageId !== effectPageId(id)) {
        stopEffect(id);
        stopped++;
      }
    }
    for (const effect of Object.values(getEffects())) {
      if (!running.has(effect.id) && shouldRun(effect, live) && startEffect(effect.id)) {
        started++;
      }
    }
    return { started, stopped };
  }

  let lastLiveKey = '';
  let watchTimer = null;

  /**
   * Checks the live pages every few seconds and resyncs when they changed.
   * Roll20 raises no change event when another Mod moves the ribbon or splits
   * the party through the API, so events alone would miss those moves.
   *
   * @param {number} ms Check interval.
   * @param {() => void} [extra] Another check to run each time.
   * @returns {void}
   */
  function watchLivePages(ms, extra) {
    if (watchTimer) {
      clearTimeout(watchTimer);
    }
    const check = () => {
      const key = [...getLivePages(getSettings().gmPagePreview)].sort().join('|');
      try {
        if (key !== lastLiveKey) {
          syncEffects();
        }
        extra?.();
      } catch (err) {
        log(`PageFX ERROR in the regular check: ${err?.message || err}`);
      }
      watchTimer = setTimeout(check, ms);
    };
    watchTimer = setTimeout(check, ms);
  }

  /**
   * Restarts one effect after its settings changed (or stops it if it should no longer run).
   *
   * @param {string} effectId Effect ID.
   * @returns {void}
   */
  function refreshEffect(effectId) {
    stopEffect(effectId);
    syncEffects();
  }

  /**
   * Returns true when an effect is running.
   *
   * @param {string} effectId Effect ID.
   * @returns {boolean} True when running.
   */
  function isRunning(effectId) {
    return running.has(effectId);
  }

  /**
   * Returns why an effect's layers cannot run.
   *
   * @param {string} effectId Effect ID.
   * @returns {Array<{error: string, vars?: object}|null>} Problems per layer.
   */
  function getProblems(effectId) {
    return problems.get(effectId) || [];
  }

  /**
   * Spawns an effect once now, wherever it is (for testing an effect).
   *
   * @param {string} effectId Effect ID.
   * @param {number} [count=1] How many times.
   * @returns {number} Spawns made.
   */
  function fireOnce(effectId, count = 1) {
    const effect = getEffect(effectId);
    const token = getObj('graphic', effectId);
    const page = token && getObj('page', token.get('_pageid'));
    if (!effect || !page) {
      return 0;
    }
    const metrics = pageMetrics(pageValues(page));
    const owned = getState().ownedFx;
    let made = 0;
    effect.layers.forEach((layer, index) => {
      if (!layer.fx) {
        return;
      }
      const result = resolveFx(layer.fx, {
        owned,
        key: `${effectId}#${index}`,
        label: `${effect.name} ${index + 1}`,
      });
      if (!result.ok) {
        return;
      }
      for (let i = 0; i < count; i++) {
        const pt = clampToPage(randomPointIn(tokenArea(tokenValues(token), metrics)), metrics);
        const end = result.fx.beam
          ? clampToPage(beamEnd(pt, layer.direction, metrics), metrics)
          : null;
        spawn(result.fx, pt, end, page.id);
        made++;
      }
    });
    return made;
  }

  // Effect lifecycle: adopting v1 tokens and following token changes.

  // Token properties v1 read an effect from.
  const V1_FIELDS = ['gmnotes', 'bar1_value', 'bar1_max', 'bar2_value', 'bar2_max'];

  /**
   * Returns true when a token is named like a v1 effect token.
   *
   * @param {object} token Roll20 graphic.
   * @returns {boolean} True for "PageFX".
   */
  function isV1EffectName(token) {
    return toText(token.get('name')) === V1_EFFECT_NAME;
  }

  /**
   * Returns true when a token is named like a v1 no-effect area.
   *
   * @param {object} token Roll20 graphic.
   * @returns {boolean} True for "NullFX".
   */
  function isV1NullName(token) {
    return toText(token.get('name')) === V1_NULL_NAME;
  }

  /**
   * Takes over one v1-style token if it is not known yet.
   *
   * @param {object} token Roll20 graphic.
   * @returns {'effect'|'null'|null} What it became.
   */
  function adoptToken(token) {
    if (getReleased()[token.id]) {
      return null;
    }
    if (isV1EffectName(token) && !getEffect(token.id)) {
      putEffect(effectFromV1Token(token));
      return 'effect';
    }
    if (isV1NullName(token) && !getNullAreas()[token.id]) {
      getNullAreas()[token.id] = { source: 'v1' };
      return 'null';
    }
    return null;
  }

  /**
   * Takes over every v1-style PageFX and NullFX token in the game, and forgets
   * effects and areas whose tokens are gone.
   *
   * @returns {{effects: number, nulls: number, dropped: number}} Counts.
   */
  function rescanTokens() {
    let effects = 0;
    let nulls = 0;
    for (const token of findObjs({ _type: 'graphic' })) {
      const adopted = adoptToken(token);
      effects += adopted === 'effect' ? 1 : 0;
      nulls += adopted === 'null' ? 1 : 0;
    }
    let dropped = 0;
    for (const id of Object.keys(getEffects())) {
      if (!getObj('graphic', id)) {
        forgetEffect(id);
        dropped++;
      }
    }
    for (const id of Object.keys(getNullAreas())) {
      if (!getObj('graphic', id)) {
        delete getNullAreas()[id];
        dropped++;
      }
    }
    pruneSharedFx(getState().ownedFx, Object.values(getEffects()));
    for (const id of Object.keys(getReleased())) {
      if (!getObj('graphic', id)) {
        delete getReleased()[id];
      }
    }
    return { effects, nulls, dropped };
  }

  /**
   * Stops and forgets an effect, with the custom FX objects made for it.
   *
   * @param {string} id Effect ID.
   * @returns {void}
   */
  function forgetEffect(id) {
    stopEffect(id);
    removeOwnedFx(getState().ownedFx, id);
    deleteEffect(id);
    pruneSharedFx(getState().ownedFx, Object.values(getEffects()));
  }

  /**
   * Makes a token an effect from the chat menu. A token with no name is named
   * "PageFX", and one with no Aura 1 gets a three-cell area, hidden from players.
   * The new effect has one empty layer for the GM to fill in.
   *
   * @param {object} token Roll20 graphic.
   * @param {string} [name] Effect name (default: the token's name).
   * @returns {{effect: object, created: boolean}} The effect, and whether it is new.
   */
  function createEffect(token, name) {
    const existing = getEffect(token.id);
    if (existing) {
      return { effect: existing, created: false };
    }
    delete getReleased()[token.id];
    delete getNullAreas()[token.id];
    const changes = { showplayers_aura1: false };
    if (toText(token.get('name')) === '') {
      changes.name = NEW_EFFECT_NAME;
    }
    if (!(toNumber(token.get('aura1_radius')) > 0)) {
      const page = getObj('page', token.get('_pageid'));
      const scale = toNumber(page?.get('scale_number')) || 1;
      changes.aura1_radius = NEW_EFFECT_AREA_CELLS * scale;
    }
    token.set(changes);
    const effect = putEffect(
      cleanEffect(
        {
          name: truncate(
            toText(name) || toText(token.get('name')) || NEW_EFFECT_NAME,
            MAX_NAME_LENGTH
          ),
          layers: [{ fx: null, interval: NEW_EFFECT_INTERVAL_MS, direction: null }],
          source: 'chat',
        },
        token.id
      )
    );
    return { effect, created: true };
  }

  /**
   * Takes the effect off a token, which stays on the map. The token is not taken
   * over again for being named PageFX.
   *
   * @param {string} id Effect ID.
   * @returns {void}
   */
  function releaseEffect(id) {
    forgetEffect(id);
    if (getObj('graphic', id)) {
      getReleased()[id] = true;
    }
  }

  /**
   * Records that an effect was edited from chat: from now on its token's GM
   * Notes and bars no longer drive it, and custom FX objects its layers no
   * longer use are removed.
   *
   * @param {object} effect Effect.
   * @returns {void}
   */
  function markEdited(effect) {
    effect.source = 'chat';
    pruneOwnedFx(getState().ownedFx, effect);
    pruneSharedFx(getState().ownedFx, Object.values(getEffects()));
  }

  /**
   * Sets the area of an effect or no-effect area: its token's Aura 1, hidden
   * from players.
   *
   * @param {object} token Roll20 graphic.
   * @param {number} radius Radius in page units, beyond the token's edge.
   * @param {boolean|null} square True for a square, false for a circle, null to keep it.
   * @returns {void}
   */
  function setArea(token, radius, square) {
    const changes = { aura1_radius: radius, showplayers_aura1: false };
    if (square !== null) {
      changes.aura1_square = square;
    }
    token.set(changes);
  }

  /**
   * Makes a token a no-effect area.
   *
   * @param {object} token Roll20 graphic.
   * @returns {boolean} False when the token is an effect.
   */
  function createNullArea(token) {
    if (getEffect(token.id)) {
      return false;
    }
    delete getReleased()[token.id];
    getNullAreas()[token.id] = { source: 'chat' };
    return true;
  }

  /**
   * Takes a no-effect area off a token.
   *
   * @param {string} id Token ID.
   * @returns {boolean} True when it was an area.
   */
  function removeNullArea(id) {
    if (!getNullAreas()[id]) {
      return false;
    }
    delete getNullAreas()[id];
    if (getObj('graphic', id)) {
      getReleased()[id] = true;
    }
    return true;
  }

  /**
   * Follows a token change: v1-style edits, the interdiction marker, renames to
   * PageFX/NullFX and moves between pages.
   *
   * @param {object} token Roll20 graphic.
   * @param {object} [prev={}] Previous values.
   * @returns {void}
   */
  function handleGraphicChange(token, prev = {}) {
    const effect = getEffect(token.id);
    if (effect) {
      let changed = false;
      if (effect.source === 'v1' && V1_FIELDS.some((k) => k in prev && prev[k] !== token.get(k))) {
        const { layer } = readV1Token(token);
        effect.layers[0] = layer;
        changed = true;
      }
      if ('statusmarkers' in prev && prev.statusmarkers !== token.get('statusmarkers')) {
        const disabled = hasMarker(token, V1_DISABLE_MARKER);
        const wasDisabled = toText(prev.statusmarkers)
          .split(',')
          .some((m) => m.split('@')[0] === V1_DISABLE_MARKER);
        if (disabled !== wasDisabled) {
          effect.enabled = !disabled;
          changed = true;
        }
      }
      if (changed) {
        refreshEffect(effect.id);
      } else if ('_pageid' in prev && prev._pageid !== token.get('_pageid')) {
        syncEffects();
      }
      // Moving or resizing needs nothing: each spawn reads the token afresh.
    } else if (isV1EffectName(token) && adoptToken(token)) {
      syncEffects();
    }

    const nulls = getNullAreas();
    if (isV1NullName(token)) {
      adoptToken(token);
    } else if (nulls[token.id]?.source === 'v1' && 'name' in prev) {
      delete nulls[token.id];
    }
  }

  /**
   * Takes over a new token named PageFX or NullFX (for example a pasted copy).
   *
   * @param {object} token Roll20 graphic.
   * @returns {void}
   */
  function handleGraphicAdded(token) {
    if (adoptToken(token) === 'effect') {
      syncEffects();
    }
  }

  /**
   * Forgets an effect or area whose token was deleted.
   *
   * @param {object} token Roll20 graphic.
   * @returns {void}
   */
  function handleGraphicDestroyed(token) {
    if (getEffect(token.id)) {
      forgetEffect(token.id);
    }
    delete getNullAreas()[token.id];
    delete getReleased()[token.id];
  }

  // Presets: named sets of layers, grouped in packs. Applying a preset copies
  // its layers into the effect, so a later change to a preset never changes
  // effects already made with it.
  //
  // Custom definitions are drawn through custom FX objects PageFX owns (Jumpgate
  // draws inline definitions in white only). Effects using the same preset share
  // them, named "PageFX: <preset> <layer>".
  //
  // Roll20 particle values: sizes and speeds are in pixels (per frame for
  // speed), lifeSpan and duration in frames, angle in degrees (0 is right, 90 is
  // down, 270 is up; Legacy draws nothing for negative angles), colours [red, green, blue, alpha 0-1].

  /**
   * @typedef {object} PresetLayer
   * @property {string|object} fx Built-in "type-colour", saved custom FX name, or a definition.
   * @property {[number, number]} interval Time between spawns, in ms.
   * @property {'random'|{dx: number, dy: number}} [direction] End of beam-like effects.
   */

  /**
   * @typedef {object} Preset
   * @property {string} id ID used in commands (never translated).
   * @property {string} pack Pack ID.
   * @property {PresetLayer[]} layers Layers.
   * @property {string} [name] Name, for presets registered by other Mods.
   */

  // Particle definitions are written as changes to a base, so each preset only
  // says what makes it different. Tuned by eye in Jumpgate on a light grass map
  // (4 November 2026): small particles need to be about 5 px or more and nearly
  // opaque to be seen; large soft ones an alpha of 0.25 to 0.5 (particles
  // blend brightly). Bursts need a lifeSpan of about 30 frames or more, or they
  // are gone before the eye catches them. An emitter
  // that lasts under about 10 frames (duration) draws next to nothing, so short
  // bursts keep duration 10 and are limited by maxParticles instead.

  /**
   * Builds a complete particle definition.
   *
   * @param {object} values Values that differ from the base.
   * @returns {object} Definition.
   */
  function particles(values) {
    return {
      maxParticles: 20,
      emissionRate: 2,
      duration: 10,
      size: 6,
      sizeRandom: 2,
      lifeSpan: 40,
      lifeSpanRandom: 10,
      speed: 1,
      speedRandom: 0.5,
      angle: 0,
      angleRandom: 360,
      startColour: [255, 255, 255, 1],
      startColourRandom: [0, 0, 0, 0],
      endColour: [255, 255, 255, 0],
      endColourRandom: [0, 0, 0, 0],
      ...values,
    };
  }

  const RAIN = particles({
    maxParticles: 60,
    emissionRate: 10,
    duration: 10,
    size: 6,
    sizeRandom: 2,
    lifeSpan: 28,
    lifeSpanRandom: 8,
    speed: 7,
    speedRandom: 2,
    angle: 100,
    angleRandom: 8,
    startColour: [205, 225, 255, 0.95],
    endColour: [170, 200, 255, 0.15],
  });

  const HEAVY_RAIN = { ...RAIN, maxParticles: 90, emissionRate: 15 };

  const SPLASH = particles({
    maxParticles: 8,
    emissionRate: 8,
    duration: 10,
    size: 5,
    lifeSpan: 26,
    lifeSpanRandom: 6,
    speed: 1,
    speedRandom: 0.8,
    startColour: [215, 235, 255, 0.9],
    endColour: [215, 235, 255, 0],
  });

  const SNOW = particles({
    maxParticles: 30,
    emissionRate: 3,
    duration: 10,
    size: 7,
    sizeRandom: 3,
    lifeSpan: 90,
    lifeSpanRandom: 30,
    speed: 1,
    speedRandom: 0.5,
    angle: 100,
    angleRandom: 30,
    startColour: [255, 255, 255, 1],
    endColour: [240, 245, 255, 0],
  });

  const MIST = particles({
    maxParticles: 4,
    emissionRate: 1,
    duration: 10,
    size: 110,
    sizeRandom: 40,
    lifeSpan: 160,
    lifeSpanRandom: 50,
    speed: 0.4,
    speedRandom: 0.3,
    startColour: [225, 230, 240, 0.25],
    startColourRandom: [0, 0, 0, 0.05],
    endColour: [225, 230, 240, 0],
  });

  const MOTES = particles({
    maxParticles: 3,
    emissionRate: 1,
    duration: 10,
    size: 9,
    sizeRandom: 3,
    lifeSpan: 100,
    lifeSpanRandom: 40,
    speed: 0.5,
    speedRandom: 0.4,
    startColour: [220, 255, 90, 1],
    startColourRandom: [30, 0, 40, 0],
    endColour: [180, 255, 60, 0],
  });

  /** @type {Preset[]} */
  const BUILTIN_PRESETS = [
    // Weather
    {
      id: 'light-rain',
      pack: 'weather',
      layers: [
        { fx: { ...RAIN, size: 5, emissionRate: 6, maxParticles: 40 }, interval: [90, 200] },
      ],
    },
    {
      id: 'heavy-rain',
      pack: 'weather',
      layers: [
        { fx: HEAVY_RAIN, interval: [40, 90] },
        { fx: SPLASH, interval: [150, 350] },
      ],
    },
    {
      id: 'thunderstorm',
      pack: 'weather',
      layers: [
        { fx: HEAVY_RAIN, interval: [40, 90] },
        {
          fx: particles({
            maxParticles: 6,
            emissionRate: 6,
            duration: 10,
            size: 300,
            sizeRandom: 100,
            lifeSpan: 10,
            lifeSpanRandom: 3,
            speed: 0,
            speedRandom: 0,
            startColour: [255, 255, 255, 0.6],
            endColour: [210, 225, 255, 0],
          }),
          interval: [6000, 16000],
        },
      ],
    },
    { id: 'snow', pack: 'weather', layers: [{ fx: SNOW, interval: [150, 350] }] },
    {
      id: 'blizzard',
      pack: 'weather',
      layers: [
        {
          fx: {
            ...SNOW,
            maxParticles: 60,
            emissionRate: 8,
            size: 6,
            lifeSpan: 45,
            lifeSpanRandom: 15,
            speed: 6,
            speedRandom: 2,
            angle: 20,
            angleRandom: 12,
          },
          interval: [50, 110],
        },
        {
          fx: { ...MIST, speed: 3, speedRandom: 1, angle: 15, angleRandom: 10, lifeSpan: 60 },
          interval: [400, 900],
        },
      ],
    },
    {
      id: 'hail',
      pack: 'weather',
      layers: [
        {
          fx: {
            ...RAIN,
            maxParticles: 20,
            emissionRate: 4,
            duration: 10,
            lifeSpan: 16,
            lifeSpanRandom: 4,
            speed: 9,
            angle: 95,
            angleRandom: 5,
            startColour: [240, 248, 255, 1],
            endColour: [215, 230, 255, 0.6],
          },
          interval: [70, 160],
        },
      ],
    },
    {
      id: 'sandstorm',
      pack: 'weather',
      layers: [
        {
          fx: particles({
            maxParticles: 100,
            emissionRate: 10,
            duration: 10,
            size: 5,
            sizeRandom: 3,
            lifeSpan: 40,
            lifeSpanRandom: 15,
            speed: 7,
            speedRandom: 3,
            angle: 0,
            angleRandom: 15,
            startColour: [215, 170, 105, 0.95],
            startColourRandom: [20, 20, 10, 0.05],
            endColour: [185, 140, 80, 0],
          }),
          interval: [50, 110],
        },
        {
          fx: {
            ...MIST,
            size: 90,
            speed: 3,
            speedRandom: 1,
            angleRandom: 10,
            lifeSpan: 70,
            startColour: [205, 165, 105, 0.4],
            endColour: [205, 165, 105, 0],
          },
          interval: [300, 700],
        },
      ],
    },
    { id: 'fog', pack: 'weather', layers: [{ fx: MIST, interval: [600, 1400] }] },

    // Fire and heat
    {
      id: 'embers',
      pack: 'fire',
      layers: [
        {
          fx: particles({
            maxParticles: 15,
            emissionRate: 2,
            duration: 10,
            size: 6,
            sizeRandom: 3,
            lifeSpan: 60,
            lifeSpanRandom: 20,
            speed: 1.5,
            speedRandom: 0.8,
            angle: 270,
            angleRandom: 40,
            startColour: [255, 160, 40, 1],
            startColourRandom: [0, 40, 20, 0],
            endColour: [255, 40, 0, 0],
          }),
          interval: [150, 400],
        },
      ],
    },
    {
      id: 'ash',
      pack: 'fire',
      layers: [
        {
          fx: {
            ...SNOW,
            size: 6,
            speed: 0.8,
            lifeSpan: 100,
            angleRandom: 40,
            startColour: [70, 65, 60, 1],
            startColourRandom: [15, 15, 15, 0.05],
            endColour: [50, 50, 50, 0],
          },
          interval: [200, 500],
        },
      ],
    },
    {
      id: 'magma',
      pack: 'fire',
      layers: [
        { fx: 'bubbling-fire', interval: [300, 900] },
        { fx: 'burn-fire', interval: [1500, 4000] },
      ],
    },
    {
      id: 'lava-spurts',
      pack: 'fire',
      layers: [
        {
          fx: particles({
            maxParticles: 40,
            emissionRate: 20,
            duration: 10,
            size: 10,
            sizeRandom: 4,
            lifeSpan: 28,
            lifeSpanRandom: 8,
            speed: 5,
            speedRandom: 2,
            angle: 270,
            angleRandom: 30,
            startColour: [255, 120, 0, 1],
            startColourRandom: [0, 40, 0, 0],
            endColour: [120, 20, 0, 0],
          }),
          interval: [1200, 3500],
        },
        { fx: 'burst-fire', interval: [2500, 6000] },
      ],
    },
    {
      id: 'sparks',
      pack: 'fire',
      layers: [
        {
          fx: particles({
            // Bold enough to read as a burst beside a token on a busy map
            maxParticles: 70,
            emissionRate: 70,
            duration: 10,
            size: 9,
            sizeRandom: 4,
            lifeSpan: 45,
            lifeSpanRandom: 10,
            speed: 5,
            speedRandom: 2,
            startColour: [255, 235, 130, 1],
            startColourRandom: [0, 20, 40, 0],
            endColour: [255, 120, 0, 0],
          }),
          interval: [500, 1800],
        },
      ],
    },

    // Water
    {
      id: 'drips',
      pack: 'water',
      layers: [
        {
          fx: {
            ...SPLASH,
            maxParticles: 6,
            emissionRate: 6,
            size: 6,
            speed: 0.5,
            speedRandom: 0.4,
            lifeSpan: 45,
            startColour: [150, 195, 255, 1],
            endColour: [150, 195, 255, 0],
          },
          interval: [600, 2000],
        },
      ],
    },
    {
      id: 'steam',
      pack: 'water',
      layers: [
        {
          fx: particles({
            maxParticles: 50,
            emissionRate: 2,
            duration: 25,
            size: 40,
            sizeRandom: 15,
            lifeSpan: 70,
            lifeSpanRandom: 20,
            speed: 1.2,
            speedRandom: 0.5,
            angle: 270,
            angleRandom: 20,
            startColour: [245, 245, 250, 0.5],
            startColourRandom: [0, 0, 0, 0.1],
            endColour: [245, 245, 250, 0],
          }),
          interval: [1500, 4000],
        },
      ],
    },
    {
      id: 'geyser',
      pack: 'water',
      layers: [
        {
          fx: particles({
            maxParticles: 200,
            emissionRate: 12,
            duration: 40,
            size: 16,
            sizeRandom: 8,
            lifeSpan: 35,
            lifeSpanRandom: 10,
            speed: 7,
            speedRandom: 3,
            angle: 270,
            angleRandom: 12,
            startColour: [205, 232, 255, 1],
            endColour: [255, 255, 255, 0],
          }),
          interval: [6000, 15000],
        },
      ],
    },
    {
      id: 'spray',
      pack: 'water',
      layers: [
        {
          fx: {
            ...MIST,
            maxParticles: 40,
            emissionRate: 4,
            duration: 10,
            size: 26,
            sizeRandom: 12,
            lifeSpan: 45,
            lifeSpanRandom: 15,
            speed: 1.5,
            speedRandom: 0.8,
            startColour: [225, 242, 255, 0.55],
            endColour: [225, 242, 255, 0],
          },
          interval: [150, 400],
        },
      ],
    },
    {
      id: 'bubbles',
      pack: 'water',
      layers: [
        {
          fx: {
            ...MOTES,
            maxParticles: 8,
            emissionRate: 2,
            duration: 10,
            size: 8,
            sizeRandom: 4,
            lifeSpan: 55,
            lifeSpanRandom: 20,
            speed: 0.6,
            speedRandom: 0.3,
            angle: 270,
            angleRandom: 30,
            startColour: [185, 232, 255, 0.85],
            startColourRandom: [0, 0, 0, 0.1],
            endColour: [255, 255, 255, 0],
          },
          interval: [300, 800],
        },
        { fx: 'bubbling-water', interval: [2000, 5000] },
      ],
    },

    // Magic and eerie
    { id: 'fireflies', pack: 'magic', layers: [{ fx: MOTES, interval: [100, 300] }] },
    {
      id: 'arcane-motes',
      pack: 'magic',
      layers: [
        {
          fx: {
            ...MOTES,
            speed: 0.8,
            angle: 270,
            angleRandom: 180,
            lifeSpan: 80,
            startColour: [150, 110, 255, 1],
            startColourRandom: [60, 60, 0, 0],
            endColour: [80, 200, 255, 0],
          },
          interval: [100, 300],
        },
      ],
    },
    {
      id: 'necrotic-mist',
      pack: 'magic',
      layers: [
        {
          fx: {
            ...MIST,
            size: 80,
            startColour: [55, 85, 45, 0.5],
            startColourRandom: [10, 20, 10, 0.05],
            endColour: [20, 30, 20, 0],
          },
          interval: [500, 1200],
        },
        { fx: 'glow-death', interval: [4000, 9000] },
      ],
    },
    {
      id: 'holy-glimmer',
      pack: 'magic',
      layers: [
        {
          fx: {
            ...MOTES,
            maxParticles: 6,
            emissionRate: 3,
            duration: 10,
            size: 7,
            speed: 0.3,
            lifeSpan: 45,
            lifeSpanRandom: 15,
            startColour: [255, 245, 190, 1],
            startColourRandom: [0, 10, 40, 0],
            endColour: [255, 255, 255, 0],
          },
          interval: [150, 400],
        },
        { fx: 'glow-holy', interval: [3000, 7000] },
      ],
    },
    {
      id: 'swamp-gas',
      pack: 'magic',
      layers: [
        {
          fx: {
            ...MIST,
            size: 50,
            sizeRandom: 20,
            speed: 0.5,
            angle: 270,
            angleRandom: 60,
            lifeSpan: 110,
            duration: 10,
            startColour: [150, 200, 60, 0.45],
            endColour: [120, 160, 40, 0],
          },
          interval: [600, 1500],
        },
        { fx: 'bubbling-slime', interval: [1500, 4000] },
      ],
    },
  ];

  const PRESET_PACKS = ['weather', 'fire', 'water', 'magic'];
  const REGISTERED_PACK = 'custom';

  /** @type {Map<string, Preset>} Presets other Mods registered this session. */
  const registered = new Map();

  const PRESET_ID = /^[a-z0-9][a-z0-9-]{0,39}$/;

  /**
   * Returns every preset: the built-in ones, then those registered by other Mods.
   *
   * @returns {Preset[]} Presets.
   */
  function allPresets() {
    return [...BUILTIN_PRESETS, ...registered.values()];
  }

  /**
   * Finds a preset by ID, ignoring case.
   *
   * @param {string} id Preset ID.
   * @returns {Preset|undefined} Preset.
   */
  function getPreset(id) {
    const key = toText(id).toLowerCase();
    return allPresets().find((p) => p.id === key);
  }

  /**
   * Returns a preset's name in a language.
   *
   * @param {Preset} preset Preset.
   * @param {string} lang Locale.
   * @returns {string} Name.
   */
  function presetName(preset, lang) {
    return preset.name || t(`presets.${preset.id}`, lang);
  }

  /**
   * Turns a preset layer's effect into a spec.
   *
   * @param {string|object} fx Built-in name, saved FX name, or definition.
   * @param {string} label Name of the custom FX object made for a definition.
   * @returns {{ok: true, fx: object} | {ok: false, error: string, vars?: object}} Spec.
   */
  function layerSpec(fx, label) {
    if (isRecord(fx)) {
      return {
        ok: true,
        fx: { kind: 'custom', value: completeDefinition(fx), shared: truncate(label, 60) },
      };
    }
    return parseFxSpec(fx);
  }

  /**
   * Builds the layers an effect gets from a preset.
   *
   * @param {Preset} preset Preset.
   * @param {string} lang Locale for the custom FX names.
   * @returns {import('./state.js').Layer[]} Layers.
   */
  function presetLayers(preset, lang) {
    const name = presetName(preset, lang);
    return preset.layers.map((layer, index) => {
      const spec = layerSpec(layer.fx, `${name} ${index + 1}`);
      const fx = spec.ok ? spec.fx : null;
      return cleanLayer({
        fx,
        interval: layer.interval,
        direction:
          layer.direction === undefined
            ? fx && isBeamSpec(fx)
              ? 'random'
              : null
            : cleanDirection(layer.direction),
        error: spec.ok ? null : spec.error,
      });
    });
  }

  /**
   * Adds a preset from another Mod, for this session. Built-in presets cannot
   * be replaced; a registered one can.
   *
   * @param {string} id Preset ID: lower-case letters, digits and hyphens.
   * @param {object} definition Preset.
   * @param {string} definition.name Name shown in menus.
   * @param {Array<{fx: string|object, interval?: number|number[], direction?: *}>} definition.layers
   *   Layers (at least one).
   * @returns {{ok: boolean, error?: string}} Result; error is a short reason.
   */
  function registerPreset(id, definition) {
    const key = toText(id).toLowerCase();
    if (!PRESET_ID.test(key)) {
      return { ok: false, error: 'bad id' };
    }
    if (BUILTIN_PRESETS.some((p) => p.id === key)) {
      return { ok: false, error: 'built-in preset' };
    }
    if (!isRecord(definition) || !Array.isArray(definition.layers)) {
      return { ok: false, error: 'no layers' };
    }
    const layers = definition.layers.slice(0, MAX_LAYERS).filter((l) => isRecord(l) && l.fx);
    if (layers.length === 0) {
      return { ok: false, error: 'no layers' };
    }
    for (const layer of layers) {
      if (!isRecord(layer.fx)) {
        const parsed = parseFxSpec(layer.fx);
        if (!parsed.ok) {
          return { ok: false, error: parsed.error };
        }
      }
    }
    registered.set(key, {
      id: key,
      pack: REGISTERED_PACK,
      name: truncate(toText(definition.name) || key, MAX_NAME_LENGTH),
      layers: layers.map((l) => ({
        fx: isRecord(l.fx) ? { ...l.fx } : toText(l.fx),
        interval: cleanInterval([l.interval ?? 500].flat()),
        direction: l.direction,
      })),
    });
    return { ok: true };
  }

  // Journal handouts: the Help handout and the Command Deck. Both are rebuilt on
  // every start and when the language changes, so they always match the
  // installed version.

  // Every command, with the key of its description under help.*. Shared by the
  // chat help card and the Help handout.
  const COMMAND_LIST = [
    ['', 'menu'],
    ['create [name]', 'create'],
    ['edit', 'edit'],
    ['preset <id>', 'preset'],
    ['presets', 'presets'],
    ['on | off | pause | resume | toggle', 'switches'],
    ['fire [count]', 'fire'],
    ['fx <effect>', 'fx'],
    ['interval <shortest> [longest]', 'interval'],
    ['direction random | <across> <down>', 'direction'],
    ['area <radius> [circle|square]', 'area'],
    ['intensity <n> | intensity global <n>', 'intensity'],
    ['name <text>', 'name'],
    ['layer add [effect] | layer remove <n>', 'layer'],
    ['trigger add <event> <action> [options]', 'triggerAdd'],
    ['trigger remove <n> | trigger clear', 'triggerRemove'],
    ['null create | null remove', 'null'],
    ['delete', 'delete'],
    ['status', 'status'],
    ['settings', 'settings'],
    ['set <setting> <value>', 'set'],
    ['rescan', 'rescan'],
    ['journal rebuild', 'journal'],
    ['help', 'help'],
  ];

  const STYLE = {
    outer: `background:${COLOR_CARD_BG_BOTTOM};color:${COLOR_TEXT};padding:14px 18px;border:1px solid ${COLOR_BORDER};border-radius:6px;font-family:Arial,sans-serif;line-height:1.5;`,
    header: `background:${COLOR_HEADER_BG};padding:12px;border-radius:4px;text-align:center;border-bottom:3px solid ${COLOR_ACCENT};margin-bottom:12px;`,
    h1: `color:${COLOR_HEADER_TEXT};margin:0;font-size:1.8em;letter-spacing:0.05em;`,
    subtitle: `color:${COLOR_MUTED};margin:4px 0 0 0;font-size:0.9em;`,
    h2: `color:${COLOR_ACCENT};border-bottom:1px solid ${COLOR_BORDER};padding-bottom:3px;margin:18px 0 8px 0;font-size:1.25em;`,
    p: `color:${COLOR_TEXT};margin:6px 0;`,
    li: `color:${COLOR_TEXT};margin:3px 0;`,
    table: 'width:100%;border-collapse:collapse;margin:6px 0;font-size:0.92em;',
    th: `background:${COLOR_HEADER_BG};color:${COLOR_HEADER_TEXT};padding:5px 8px;text-align:start;border:1px solid ${COLOR_BORDER};`,
    td: `padding:5px 8px;border:1px solid ${COLOR_BORDER};vertical-align:top;color:${COLOR_TEXT};`,
    // Commands read left to right inside right-to-left handouts; without this the "!" of
    // "!pagefx create" moves to the end in Hebrew. inline-block holds even if unicode-bidi is stripped.
    code: 'font-family:monospace;color:#d9c2ff;direction:ltr;unicode-bidi:embed;display:inline-block;',
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
    const h = (key, vars) => escapeHtml(t(`handout.${key}`, lang, vars));
    const raw = (key) => tRaw(`handout.${key}`, lang);
    const code = (text) => `<span style="${STYLE.code}">${escapeHtml(text)}</span>`;
    const p = (key) => `<p style="${STYLE.p}">${h(key)}</p>`;
    const section = (key, body) => `<h2 style="${STYLE.h2}">${h(`${key}.heading`)}</h2>${body}`;

    const commands = COMMAND_LIST.map(([cmd, key]) => [
      code(`${COMMAND} ${cmd}`.trim()),
      escapeHtml(t(`help.${key}`, lang)),
    ]);
    const settings = Object.keys(DEFAULT_SETTINGS).map((key) => [
      code(key),
      escapeHtml(t(`handout.settings.rows.${key}`, lang)),
    ]);
    const presets = PRESET_PACKS.map((pack) => [
      escapeHtml(t(`packs.${pack}`, lang)),
      BUILTIN_PRESETS.filter((preset) => preset.pack === pack)
        .map((preset) => `${escapeHtml(t(`presets.${preset.id}`, lang))} ${code(preset.id)}`)
        .join('<br>'),
    ]);
    const v1 = [
      ['!pageFX on', `${COMMAND} resume`],
      ['!pageFX off', `${COMMAND} pause`],
    ].map(([a, b]) => [code(a), code(b)]);
    const api = [
      ['activateAllEffects()', 'activateAll'],
      ['deactivateAllEffects()', 'deactivateAll'],
      ['activateEffect(token) / deactivateEffect(token) / toggleEffect(token)', 'activate'],
      ['start(token) / stop(token) / pause(token) / resume(token)', 'start'],
      ['setIntensity(token, n)', 'setIntensity'],
      ['fire(token, count)', 'fire'],
      ['create(token, options) / remove(token)', 'create'],
      ['getEffect(token) / listEffects(pageId) / isRunning(token)', 'getEffect'],
      ['registerPreset(id, definition) / listPresets()', 'registerPreset'],
      ['checkToken(token)', 'checkToken'],
    ].map(([fn, key]) => [code(`PageFX.${fn}`), escapeHtml(t(`handout.api.rows.${key}`, lang))]);
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
    ${section('overview', `${p('overview.body')}<p style="${STYLE.p}">${link(DEMO_GIF_URL, t('handout.overview.demo', lang))}</p>`)}
    ${section('quickStart', list(raw('quickStart.steps'), true))}
    ${section('effects', list(raw('effects.points')))}
    ${section('pages', list(raw('pages.points')))}
    ${section('presets', `${p('presets.intro')}${table([t('handout.presets.colPack', lang), t('handout.presets.colPresets', lang)], presets)}`)}
    ${section('triggers', `${p('triggers.intro')}${list(raw('triggers.points'))}`)}
    ${section('nullAreas', list(raw('nullAreas.points')))}
    ${section('commands', `${p('commands.intro')}${table([t('handout.commands.colCommand', lang), t('handout.commands.colDesc', lang)], commands)}`)}
    ${section('settings', `${p('settings.intro')}${table([t('handout.settings.colKey', lang), t('handout.settings.colDesc', lang)], settings)}`)}
    ${section('api', `${p('api.intro')}${table([t('handout.api.colFunction', lang), t('handout.api.colDesc', lang)], api)}`)}
    ${section('upgrading', `${list(raw('upgrading.points'))}${table([t('handout.upgrading.colV1', lang), t('handout.upgrading.colV2', lang)], v1)}`)}
    ${section('troubleshooting', list(raw('troubleshooting.points')))}
    ${section('languages', `${p('languages.body')}${table([t('handout.languages.colLanguage', lang), t('handout.languages.colNative', lang), t('handout.languages.colCode', lang)], locales)}`)}
    ${section(
      'credits',
      `<p style="${STYLE.p}">${h('credits.original')} ${link(original.profile, original.name)} • ${link(original.marketplace, t('handout.credits.marketplace', lang))}</p>
       <p style="${STYLE.p}">${h('credits.maintainer')} ${link(maintainer.profile, maintainer.name)} • ${link(maintainer.github, 'GitHub')}</p>
       ${p('credits.support')}`
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
      <h1 style="${STYLE.h1}">✦ ${SCRIPT_NAME} ✦</h1>
      <p style="${STYLE.subtitle}">${DECK_TITLE} • v${SCRIPT_VERSION}</p>
    </div>
    ${group('deck.menuTitle', 'deck.menuDesc', [btn('menu', ''), btn('status', 'status', true), btn('settings', 'settings', true), btn('help', 'help', true)])}
    ${group('deck.newTitle', 'deck.newDesc', [btn('create', 'create --edit'), btn('presets', 'presets'), btn('createNull', 'null create'), btn('removeNull', 'null remove', true)])}
    ${group('deck.selectedTitle', 'deck.selectedDesc', [btn('edit', 'edit'), btn('fire', 'fire'), btn('turnOn', 'on', true), btn('turnOff', 'off', true), btn('pause', 'pause', true), btn('resume', 'resume', true)])}
    ${group('deck.allTitle', 'deck.allDesc', [btn('pauseAll', 'pause --ids'), btn('resumeAll', 'resume --ids')])}
    ${group('deck.toolsTitle', 'deck.toolsDesc', [btn('rescan', 'rescan', true), btn('rebuild', 'journal rebuild', true)])}
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

  // Chat menus: the main menu, one card per effect, settings and status.
  //
  // Buttons that change an effect name it with --ids, so they work without a
  // token selected, and end with --edit, --menu or --settings so the card they
  // came from is shown again with the change.

  const SMALL_STYLE = `font-size:0.85em;color:${COLOR_MUTED}`;
  const PROBLEM_STYLE = 'font-size:0.85em;color:#fca5a5';

  /**
   * Makes text safe as a roll query prompt or default: the characters that end
   * or split a query are removed.
   *
   * @param {*} text Text.
   * @returns {string} Safe text.
   */
  function queryText(text) {
    return toText(text).replace(/[|{}]/g, '');
  }

  /**
   * Makes text safe as a roll query option. Roll20 reads the entities as the
   * characters, after the query has been split.
   *
   * @param {*} text Option text.
   * @returns {string} Safe text.
   */
  function queryOption(text) {
    return toText(text)
      .replaceAll('&', '&amp;')
      .replaceAll('|', '&#124;')
      .replaceAll(',', '&#44;')
      .replaceAll('}', '&#125;')
      .replaceAll('{', '&#123;');
  }

  /**
   * Builds a roll query: a box to type in, or a list when options are given.
   *
   * @param {string} prompt Question.
   * @param {string|Array<string|[string, string]>} [answer] Default text, or the options
   *   (a [label, value] pair or one text for both).
   * @returns {string} Roll query.
   */
  function query(prompt, answer = '') {
    if (Array.isArray(answer)) {
      const options = answer.map((o) =>
        Array.isArray(o) ? `${queryOption(o[0])},${queryOption(o[1])}` : queryOption(o)
      );
      return `?{${queryText(prompt)}|${options.join('|')}}`;
    }
    const text = queryText(answer);
    return text === '' ? `?{${queryText(prompt)}}` : `?{${queryText(prompt)}|${text}}`;
  }

  /**
   * Returns the name of a page.
   *
   * @param {string} id Page ID.
   * @returns {string} Name.
   */
  function pageName(id) {
    return toText(getObj('page', id)?.get('name')) || id || '-';
  }

  /**
   * Returns the page an effect's token is on.
   *
   * @param {string} id Effect ID.
   * @returns {string} Page ID, or an empty string.
   */
  function effectPage(id) {
    return toText(getObj('graphic', id)?.get('_pageid'));
  }

  /**
   * Says whether an effect is running, and if not, why.
   *
   * @param {object} effect Effect.
   * @param {string} lang Locale.
   * @returns {string} State text.
   */
  function effectStateText(effect, lang) {
    if (isRunning(effect.id)) {
      return t('status.running', lang);
    }
    if (!effect.enabled) {
      return t('status.off', lang);
    }
    if (effect.paused || getState().paused) {
      return t('status.pausedState', lang);
    }
    if (!effect.layers.some((l) => l.fx)) {
      return t('status.noFx', lang);
    }
    if (getProblems(effect.id).some(Boolean)) {
      return t('status.broken', lang);
    }
    return t('status.waiting', lang);
  }

  /**
   * Builds the on/off and pause/resume buttons for an effect.
   *
   * @param {object} effect Effect.
   * @param {string} lang Locale.
   * @param {string} back Flag naming the card to show again.
   * @returns {string} Buttons HTML.
   */
  function switchButtons(effect, lang, back) {
    const ids = `--ids ${effect.id} ${back}`;
    return [
      effect.enabled
        ? buildSecondaryButton(t('buttons.turnOff', lang), `${COMMAND} off ${ids}`)
        : buildButton(t('buttons.turnOn', lang), `${COMMAND} on ${ids}`),
      effect.paused
        ? buildButton(t('buttons.resume', lang), `${COMMAND} resume ${ids}`)
        : buildSecondaryButton(t('buttons.pause', lang), `${COMMAND} pause ${ids}`),
      buildSecondaryButton(t('buttons.fire', lang), `${COMMAND} fire ${ids}`),
    ].join('');
  }

  /**
   * Builds the pause-all or resume-all button.
   *
   * @param {string} lang Locale.
   * @param {string} back Flag naming the card to show again.
   * @returns {string} Button HTML.
   */
  function globalPauseButton(lang, back) {
    return getState().paused
      ? buildButton(t('buttons.resumeAll', lang), `${COMMAND} resume ${back}`)
      : buildSecondaryButton(t('buttons.pauseAll', lang), `${COMMAND} pause ${back}`);
  }

  /**
   * Wraps buttons in a block.
   *
   * @param {string[]} buttons Buttons HTML.
   * @returns {string} HTML.
   */
  function buttonRow(buttons) {
    return `<div style="margin:2px 0">${buttons.filter(Boolean).join('')}</div>`;
  }

  /**
   * Shows the main menu: the effects on one page (the GM's page by default),
   * the other pages with effects, and buttons for new effects and settings.
   *
   * @param {string|null} playerId Who to show it to (null: the GM).
   * @param {string} [pageId] Page to list (default: the page the GM is on).
   * @returns {void}
   */
  function showMainMenu(playerId, pageId) {
    const lang = getLang();
    const live = getLivePages(getSettings().gmPagePreview);
    const here =
      pageId ||
      toText(playerId && getObj('player', playerId)?.get('_lastpage')) ||
      toText(Campaign().get('playerpageid'));
    const byPage = new Map();
    for (const effect of Object.values(getEffects())) {
      const page = effectPage(effect.id);
      if (!byPage.has(page)) {
        byPage.set(page, []);
      }
      byPage.get(page).push(effect);
    }
    const lines = [];
    lines.push(
      buildRow(
        t('menu.page', lang),
        `${escapeHtml(pageName(here))} <span style="${SMALL_STYLE}">(${escapeHtml(
          live.has(here) ? t('menu.live', lang) : t('menu.notLive', lang)
        )})</span>`
      )
    );
    if (getState().paused) {
      lines.push(
        `<div style="${PROBLEM_STYLE}">${escapeHtml(t('menu.allPausedNote', lang))}</div>`
      );
    }
    lines.push(buildSectionLabel(t('menu.effectsHere', lang)));
    const hereEffects = (byPage.get(here) || []).sort((a, b) => a.name.localeCompare(b.name));
    if (hereEffects.length === 0) {
      lines.push(`<div style="${SMALL_STYLE}">${escapeHtml(t('menu.noEffectsHere', lang))}</div>`);
    }
    for (const effect of hereEffects) {
      lines.push(
        `<div style="margin-top:3px"><strong>${escapeHtml(effect.name)}</strong> <span style="${SMALL_STYLE}">${escapeHtml(
          effectStateText(effect, lang)
        )}</span></div>`
      );
      lines.push(
        buttonRow([
          buildButton(t('buttons.edit', lang), `${COMMAND} edit --ids ${effect.id}`),
          switchButtons(effect, lang, '--menu'),
        ])
      );
    }
    const others = [...byPage.keys()].filter((p) => p !== here && p !== '');
    if (others.length > 0) {
      lines.push(buildSectionLabel(t('menu.otherPages', lang)));
      for (const page of others.sort((a, b) => pageName(a).localeCompare(pageName(b)))) {
        const state = live.has(page) ? t('menu.live', lang) : t('menu.notLive', lang);
        lines.push(
          buildRow(
            `${pageName(page)} (${state})`,
            `${escapeHtml(t('menu.effectCount', lang, { count: byPage.get(page).length }))} ${buildSecondaryButton(
              t('buttons.show', lang),
              `${COMMAND} menu ${page}`
            )}`
          )
        );
      }
    }
    lines.push(buildSectionLabel(t('menu.actions', lang)));
    lines.push(
      buttonRow([
        buildButton(t('buttons.create', lang), `${COMMAND} create --edit`),
        buildSecondaryButton(t('buttons.presets', lang), `${COMMAND} presets`),
        buildSecondaryButton(t('buttons.createNull', lang), `${COMMAND} null create --menu`),
        buildSecondaryButton(t('buttons.removeNull', lang), `${COMMAND} null remove --menu`),
      ])
    );
    lines.push(
      buttonRow([
        globalPauseButton(lang, '--menu'),
        buildSecondaryButton(t('buttons.settings', lang), `${COMMAND} settings`),
        buildSecondaryButton(t('buttons.status', lang), `${COMMAND} status`),
        buildSecondaryButton(t('buttons.rescan', lang), `${COMMAND} rescan --menu`),
        buildSecondaryButton(t('buttons.help', lang), `${COMMAND} help`),
      ])
    );
    lines.push(
      `<div style="${SMALL_STYLE};margin-top:3px">${escapeHtml(t('menu.selectHint', lang))}</div>`
    );
    whisper(playerId, `${t('titles.menu', lang)} v${SCRIPT_VERSION}`, lines);
  }

  /**
   * Describes an effect's area: its token's Aura 1.
   *
   * @param {object|undefined} token Roll20 graphic.
   * @param {string} lang Locale.
   * @returns {string} Area text.
   */
  function areaText(token, lang) {
    if (!token) {
      return '-';
    }
    const page = getObj('page', token.get('_pageid'));
    const radius = toNumber(token.get('aura1_radius')) || 0;
    const units = toText(page?.get('scale_units')) || '';
    const shape = token.get('aura1_square') ? t('menu.square', lang) : t('menu.circle', lang);
    return t('menu.areaValue', lang, { radius, units, shape }).trim();
  }

  /**
   * Describes a layer's direction.
   *
   * @param {object} layer Layer.
   * @param {string} lang Locale.
   * @returns {string} Direction text.
   */
  function directionText(layer, lang) {
    if (layer.direction === 'random') {
      return t('menu.directionRandom', lang);
    }
    return t('menu.directionOffset', lang, layer.direction || { dx: 0, dy: 0 });
  }

  /**
   * Builds the rows for one layer of an effect card.
   *
   * @param {object} effect Effect.
   * @param {number} index Layer number (from 0).
   * @param {string[]} savedNames Saved custom FX names in the game.
   * @param {string} lang Locale.
   * @returns {string[]} HTML lines.
   */
  function layerLines(effect, index, savedNames, lang) {
    const layer = effect.layers[index];
    const n = index + 1;
    const flags = `--ids ${effect.id} --layer ${n} --edit`;
    const lines = [];
    const what = layer.fx ? describeFx(layer.fx) : t('menu.noFxSet', lang);
    const beam = isBeamSpec(layer.fx);
    const timing = t('menu.timing', lang, { min: layer.interval[0], max: layer.interval[1] });
    const parts = [timing];
    if (beam) {
      parts.push(directionText(layer, lang));
    }
    lines.push(
      `<div style="margin-top:4px"><strong>${escapeHtml(t('menu.layer', lang, { n }))}</strong> <code>${escapeHtml(
        what
      )}</code></div>`
    );
    lines.push(`<div style="${SMALL_STYLE}">${escapeHtml(parts.join(' · '))}</div>`);
    const problem = getProblems(effect.id)[index] || (layer.error ? { error: layer.error } : null);
    if (problem) {
      lines.push(
        `<div style="${PROBLEM_STYLE}">${escapeHtml(t(problem.error, lang, problem.vars || {}))}</div>`
      );
    }
    const builtin = `${query(t('prompts.type', lang), BUILTIN_TYPES)}-${query(
      t('prompts.colour', lang),
      BUILTIN_COLOURS
    )}`;
    const buttons = [
      buildButton(t('buttons.builtin', lang), `${COMMAND} fx ${builtin} ${flags}`),
      savedNames.length > 0
        ? buildSecondaryButton(
            t('buttons.saved', lang),
            `${COMMAND} fx ${query(t('prompts.saved', lang), savedNames)} ${flags}`
          )
        : '',
      buildSecondaryButton(
        t('buttons.json', lang),
        `${COMMAND} fx ${query(t('prompts.json', lang))} ${flags}`
      ),
      buildSecondaryButton(
        t('buttons.timing', lang),
        `${COMMAND} interval ${query(t('prompts.intervalMin', lang), layer.interval[0])} ${query(
          t('prompts.intervalMax', lang),
          layer.interval[1]
        )} ${flags}`
      ),
    ];
    if (beam) {
      const dx = layer.direction && layer.direction !== 'random' ? layer.direction.dx : 1;
      const dy = layer.direction && layer.direction !== 'random' ? layer.direction.dy : 0;
      buttons.push(
        buildSecondaryButton(t('buttons.random', lang), `${COMMAND} direction random ${flags}`),
        buildSecondaryButton(
          t('buttons.offset', lang),
          `${COMMAND} direction ${query(t('prompts.dx', lang), dx)} ${query(
            t('prompts.dy', lang),
            dy
          )} ${flags}`
        )
      );
    }
    if (effect.layers.length > 1) {
      buttons.push(
        buildSecondaryButton(
          t('buttons.removeLayer', lang),
          `${COMMAND} layer remove ${n} --ids ${effect.id} --edit`
        )
      );
    }
    lines.push(buttonRow(buttons));
    return lines;
  }

  /**
   * Returns a pack's name.
   *
   * @param {string} pack Pack ID.
   * @param {string} lang Locale.
   * @returns {string} Name.
   */
  function packName(pack, lang) {
    return t(`packs.${pack}`, lang);
  }

  /**
   * Lists the presets as roll query options, "Pack: Name".
   *
   * @param {string} lang Locale.
   * @returns {Array<[string, string]>} Options.
   */
  function presetOptions(lang) {
    return allPresets().map((p) => [`${packName(p.pack, lang)}: ${presetName(p, lang)}`, p.id]);
  }

  /**
   * Shows the presets, by pack. Each button gives the selected tokens that
   * preset, making them effects first when they are not.
   *
   * @param {string|null} playerId Who to show it to (null: the GM).
   * @returns {void}
   */
  function showPresets(playerId) {
    const lang = getLang();
    const lines = [`<div style="${SMALL_STYLE}">${escapeHtml(t('menu.presetsHint', lang))}</div>`];
    const presets = allPresets();
    for (const pack of [...PRESET_PACKS, REGISTERED_PACK]) {
      const inPack = presets.filter((p) => p.pack === pack);
      if (inPack.length === 0) {
        continue;
      }
      lines.push(buildSectionLabel(packName(pack, lang)));
      lines.push(
        buttonRow(
          inPack.map((p) =>
            buildSecondaryButton(presetName(p, lang), `${COMMAND} preset ${p.id} --edit`)
          )
        )
      );
    }
    lines.push(buttonRow([buildSecondaryButton(t('buttons.menu', lang), `${COMMAND} menu`)]));
    whisper(playerId, t('titles.presets', lang), lines);
  }

  /**
   * Describes a trigger in a few words.
   *
   * @param {import('./state.js').Trigger} trigger Trigger.
   * @param {string} effectId Effect the trigger belongs to.
   * @param {string} lang Locale.
   * @returns {string} Description.
   */
  function describeTrigger(trigger, effectId, lang) {
    const tokenName = (id) =>
      toText(getObj('graphic', id)?.get('name')) || t('triggers.unnamed', lang);
    let when;
    if (trigger.event === 'round') {
      if (trigger.round !== null) {
        when = t('triggers.onRound', lang, { n: trigger.round });
      } else if (trigger.every > 1) {
        when = t('triggers.everyRounds', lang, { n: trigger.every });
      } else {
        when = t('triggers.eachRound', lang);
      }
    } else if (trigger.event === 'turn') {
      when = t('triggers.turn', lang, { name: tokenName(trigger.token) });
    } else {
      const who =
        trigger.who === 'named' ? trigger.names.join(', ') : t(`triggers.who.${trigger.who}`, lang);
      const area =
        trigger.token && trigger.token !== effectId
          ? t('triggers.areaOf', lang, { name: tokenName(trigger.token) })
          : t('triggers.areaSelf', lang);
      when = t(`triggers.${trigger.event}`, lang, { who, area });
    }
    const action = t(`triggers.action.${trigger.action}`, lang, { count: trigger.count });
    let text = t('triggers.line', lang, { when, action });
    if (trigger.once) {
      text += ` ${t(trigger.used ? 'triggers.onceUsed' : 'triggers.once', lang)}`;
    }
    return text;
  }

  /**
   * Builds the triggers section of an effect card.
   *
   * @param {object} effect Effect.
   * @param {string} lang Locale.
   * @returns {string[]} HTML lines.
   */
  function triggerLines(effect, lang) {
    const ids = `--ids ${effect.id} --edit`;
    const lines = [buildSectionLabel(t('menu.triggers', lang))];
    if (effect.triggers.length === 0) {
      lines.push(`<div style="${SMALL_STYLE}">${escapeHtml(t('menu.noTriggers', lang))}</div>`);
    }
    effect.triggers.forEach((trigger, index) => {
      lines.push(
        `<div style="margin-top:2px">${escapeHtml(`${index + 1}. ${describeTrigger(trigger, effect.id, lang)}`)} ${buildSecondaryButton(
          t('buttons.remove', lang),
          `${COMMAND} trigger remove ${index + 1} ${ids}`
        )}</div>`
      );
    });
    const then = query(
      t('prompts.then', lang),
      TRIGGER_ACTIONS.map((a) => [t(`triggers.choice.${a}`, lang), a])
    );
    const areaQuestions = [
      `who=${query(t('prompts.who', lang), [
        [t('triggers.who.players', lang), 'players'],
        [t('triggers.who.all', lang), 'all'],
      ])}`,
      `area=${query(t('prompts.area', lang), [
        [t('triggers.areaSelf', lang), 'self'],
        [t('triggers.areaSelected', lang), 'selected'],
      ])}`,
      query(t('prompts.once', lang), [
        [t('menu.no', lang), 'always'],
        [t('menu.yes', lang), 'once'],
      ]),
    ].join(' ');
    lines.push(
      buttonRow([
        buildSecondaryButton(
          t('buttons.onRound', lang),
          `${COMMAND} trigger add round ${then} every=${query(t('prompts.every', lang), 1)} ${ids}`
        ),
        buildSecondaryButton(
          t('buttons.onTurn', lang),
          `${COMMAND} trigger add turn ${then} ${ids}`
        ),
        buildSecondaryButton(
          t('buttons.onEnter', lang),
          `${COMMAND} trigger add enter ${then} ${areaQuestions} ${ids}`
        ),
        buildSecondaryButton(
          t('buttons.onLeave', lang),
          `${COMMAND} trigger add leave ${then} ${areaQuestions} ${ids}`
        ),
      ])
    );
    lines.push(`<div style="${SMALL_STYLE}">${escapeHtml(t('menu.triggerHint', lang))}</div>`);
    return lines;
  }

  /**
   * Shows the card for one effect, with buttons to change everything about it.
   *
   * @param {string|null} playerId Who to show it to (null: the GM).
   * @param {object} effect Effect.
   * @returns {void}
   */
  function showEffectCard(playerId, effect) {
    const lang = getLang();
    const token = getObj('graphic', effect.id);
    const ids = `--ids ${effect.id} --edit`;
    const lines = [];
    lines.push(buildRow(t('menu.page', lang), escapeHtml(pageName(effectPage(effect.id)))));
    lines.push(buildRow(t('menu.state', lang), escapeHtml(effectStateText(effect, lang))));
    lines.push(buildRow(t('menu.area', lang), escapeHtml(areaText(token, lang))));
    lines.push(buildRow(t('status.intensity', lang), escapeHtml(String(effect.intensity))));
    const preset = effect.preset && getPreset(effect.preset);
    if (preset) {
      lines.push(buildRow(t('menu.preset', lang), escapeHtml(presetName(preset, lang))));
    }
    if (effect.source === 'v1') {
      lines.push(`<div style="${SMALL_STYLE}">${escapeHtml(t('menu.v1Note', lang))}</div>`);
    }
    const radius = toNumber(token?.get('aura1_radius')) || 0;
    lines.push(
      buttonRow([
        switchButtons(effect, lang, '--edit'),
        buildSecondaryButton(
          t('buttons.rename', lang),
          `${COMMAND} name ${query(t('prompts.name', lang), effect.name)} ${ids}`
        ),
        buildSecondaryButton(
          t('buttons.area', lang),
          `${COMMAND} area ${query(t('prompts.radius', lang), radius)} ${query(
            t('prompts.shape', lang),
            [
              [t('menu.circleOption', lang), 'circle'],
              [t('menu.squareOption', lang), 'square'],
            ]
          )} ${ids}`
        ),
        buildSecondaryButton(
          t('buttons.intensity', lang),
          `${COMMAND} intensity ${query(
            t('prompts.intensity', lang, { min: MIN_INTENSITY, max: MAX_INTENSITY }),
            effect.intensity
          )} ${ids}`
        ),
      ])
    );
    lines.push(buildSectionLabel(t('menu.layers', lang)));
    const savedNames = listSavedFxNames();
    effect.layers.forEach((_, index) => {
      lines.push(...layerLines(effect, index, savedNames, lang));
    });
    if (effect.layers.length === 0) {
      lines.push(`<div style="${SMALL_STYLE}">${escapeHtml(t('menu.noLayers', lang))}</div>`);
    }
    lines.push(...triggerLines(effect, lang));
    lines.push(
      buttonRow([
        buildSecondaryButton(
          t('buttons.preset', lang),
          `${COMMAND} preset ${query(t('prompts.preset', lang), presetOptions(lang))} ${ids}`
        ),
        effect.layers.length < MAX_LAYERS
          ? buildSecondaryButton(t('buttons.addLayer', lang), `${COMMAND} layer add ${ids}`)
          : '',
        buildSecondaryButton(
          t('buttons.delete', lang),
          `${COMMAND} delete ${query(t('prompts.confirmDelete', lang), [
            [t('menu.no', lang), 'no'],
            [t('menu.yes', lang), 'yes'],
          ])} --ids ${effect.id} --menu`
        ),
        buildSecondaryButton(t('buttons.menu', lang), `${COMMAND} menu`),
      ])
    );
    whisper(playerId, t('titles.effect', lang, { name: effect.name }), lines);
  }

  /**
   * Shows the settings card.
   *
   * @param {string|null} playerId Who to show it to (null: the GM).
   * @returns {void}
   */
  function showSettings(playerId) {
    const lang = getLang();
    const s = getSettings();
    const back = '--settings';
    const locale = LOCALE_DEFINITIONS.find((l) => l.code === lang);
    const languages = LOCALE_DEFINITIONS.map((l) => [l.nativeName || l.name, l.code]);
    const onOff = (value) => (value ? t('status.on', lang) : t('status.off', lang));
    const lines = [
      buildRow(
        t('settings.language', lang),
        `${escapeHtml(locale?.nativeName || locale?.name || lang)} ${buildSecondaryButton(
          t('buttons.change', lang),
          `${COMMAND} set language ${query(t('settings.language', lang), languages)} ${back}`
        )}`
      ),
      buildRow(
        t('status.gmPreview', lang),
        `${escapeHtml(onOff(s.gmPagePreview))} ${buildSecondaryButton(
          s.gmPagePreview ? t('buttons.turnOff', lang) : t('buttons.turnOn', lang),
          `${COMMAND} set gmPagePreview ${s.gmPagePreview ? 'off' : 'on'} ${back}`
        )}`
      ),
      `<div style="${SMALL_STYLE}">${escapeHtml(t('settings.gmPreviewHint', lang))}</div>`,
      buildRow(
        t('settings.globalIntensity', lang),
        `${escapeHtml(String(s.intensity))} ${buildSecondaryButton(
          t('buttons.change', lang),
          `${COMMAND} set intensity ${query(
            t('prompts.intensity', lang, { min: MIN_INTENSITY, max: MAX_INTENSITY }),
            s.intensity
          )} ${back}`
        )}`
      ),
      buildRow(
        t('status.maxSpawns', lang),
        `${escapeHtml(String(s.maxSpawnsPerSecond))} ${buildSecondaryButton(
          t('buttons.change', lang),
          `${COMMAND} set maxSpawnsPerSecond ${query(
            t('prompts.maxSpawns', lang, { max: MAX_SPAWNS_PER_SECOND_LIMIT }),
            s.maxSpawnsPerSecond
          )} ${back}`
        )}`
      ),
      `<div style="${SMALL_STYLE}">${escapeHtml(t('settings.maxSpawnsHint', lang))}</div>`,
      buttonRow([buildSecondaryButton(t('buttons.menu', lang), `${COMMAND} menu`)]),
    ];
    whisper(playerId, t('titles.settings', lang), lines);
  }

  /**
   * Shows every effect, what it does and whether it is running.
   *
   * @param {string|null} playerId Who to show it to (null: the GM).
   * @returns {void}
   */
  function showStatus(playerId) {
    const lang = getLang();
    const settings = getSettings();
    const live = getLivePages(settings.gmPagePreview);
    const onOff = (value) => (value ? t('status.on', lang) : t('status.off', lang));
    const lines = [
      buildRow(t('status.livePages', lang), escapeHtml([...live].map(pageName).join(', ') || '-')),
      buildRow(t('status.globalPause', lang), escapeHtml(onOff(getState().paused))),
      buildRow(t('status.gmPreview', lang), escapeHtml(onOff(settings.gmPagePreview))),
      buildRow(t('settings.globalIntensity', lang), escapeHtml(String(settings.intensity))),
      buildRow(t('status.maxSpawns', lang), escapeHtml(String(settings.maxSpawnsPerSecond))),
      buildRow(t('status.nullAreas', lang), escapeHtml(String(Object.keys(getNullAreas()).length))),
      buildSectionLabel(t('status.effects', lang)),
    ];
    const effects = Object.values(getEffects());
    if (effects.length === 0) {
      lines.push(`<div>${escapeHtml(t('status.noEffects', lang))}</div>`);
    }
    for (const effect of effects) {
      const what = effect.layers.map((l) => describeFx(l.fx) || '?').join(' + ');
      lines.push(
        buildRow(
          `${effect.name} (${pageName(effectPage(effect.id))})`,
          `${escapeHtml(effectStateText(effect, lang))} <code>${escapeHtml(what)}</code>`
        )
      );
      for (const problem of getProblems(effect.id).filter(Boolean)) {
        lines.push(
          `<div style="${PROBLEM_STYLE}">${escapeHtml(t(problem.error, lang, problem.vars || {}))}</div>`
        );
      }
    }
    lines.push(
      buttonRow([
        globalPauseButton(lang, '--status'),
        buildSecondaryButton(t('buttons.menu', lang), `${COMMAND} menu`),
      ])
    );
    whisper(playerId, t('titles.status', lang), lines);
  }

  // Triggers: things that happen in the game and start, stop or fire an effect.
  //
  // - round: a new combat round begins. Roll20 keeps no round number, so a
  //   round begins when the turn order is advanced from its last entry back to
  //   its first (the new top entry has a higher initiative than the old one),
  //   or when a custom entry named "Round" changes value.
  // - turn: a chosen token's turn begins (it reaches the top of the turn order).
  // - enter / leave: a token moves into or out of an area: the effect's own
  //   area, or another token's Aura 1.
  //
  // Roll20 raises no event when another Mod changes the turn order or moves a
  // token, so the turn order is also checked every few seconds, and other Mods
  // can call PageFX.checkToken(token) after moving one.

  /** @typedef {import('./state.js').Trigger} Trigger */

  // ---------------------------------------------------------------------------
  // Turn order (pure).

  /**
   * Reads Roll20's turn order.
   *
   * @param {*} raw Campaign turnorder value (JSON text).
   * @returns {Array<{id: string, pr: *, custom: string}>} Entries.
   */
  function readTurnOrder(raw) {
    let list = raw;
    if (typeof raw === 'string') {
      try {
        list = raw.trim() === '' ? [] : JSON.parse(raw);
      } catch {
        list = [];
      }
    }
    return (Array.isArray(list) ? list : []).filter(isRecord).map((e) => ({
      id: toText(e.id),
      pr: e.pr,
      custom: toText(e.custom),
    }));
  }

  /**
   * Finds a custom "Round" entry.
   *
   * @param {Array<{id: string, pr: *, custom: string}>} list Turn order.
   * @returns {{id: string, pr: *, custom: string}|undefined} Entry.
   */
  function roundEntry(list) {
    return list.find((e) => e.id === '-1' && /^round$/i.test(e.custom.trim()));
  }

  /**
   * Works out what a turn order change means.
   *
   * @param {Array<{id: string, pr: *, custom: string}>} prev Turn order before.
   * @param {Array<{id: string, pr: *, custom: string}>} cur Turn order now.
   * @returns {{turn: string|null, newRound: boolean, roundValue: number|null, cleared: boolean}}
   *   Whose turn began (token ID, null when the top did not change), whether a new round
   *   began, the "Round" entry's value when there is one, and whether the order was emptied.
   */
  function readTurnChange(prev, cur) {
    const result = { turn: null, newRound: false, roundValue: null, cleared: false };
    if (cur.length === 0) {
      result.cleared = prev.length > 0;
      return result;
    }
    if (prev.length > 0 && cur[0].id === prev[0].id && cur[0].custom === prev[0].custom);
    else if (prev.length > 0) {
      result.turn = cur[0].id;
    }
    const before = roundEntry(prev);
    const after = roundEntry(cur);
    if (after) {
      const value = toNumber(after.pr);
      result.roundValue = value;
      if (before && value !== null && toNumber(before.pr) !== value) {
        result.newRound = true;
      }
      return result;
    }
    // An advance moves the old top entry to the bottom. It wraps to a new round
    // when the new top entry has a higher initiative than the old one.
    const advanced = prev.length > 1 && cur.length === prev.length && cur.at(-1).id === prev[0].id;
    if (advanced) {
      const was = toNumber(prev[0].pr);
      const now = toNumber(cur[0].pr);
      result.newRound = was !== null && now !== null && now > was;
    }
    return result;
  }

  /**
   * Returns true when a round trigger goes off in a round.
   *
   * @param {Trigger} trigger Trigger.
   * @param {number} round Round that began.
   * @returns {boolean} True when it goes off.
   */
  function roundMatches(trigger, round) {
    if (trigger.round !== null) {
      return round === trigger.round;
    }
    return round % trigger.every === 0;
  }

  // ---------------------------------------------------------------------------
  // Live game.

  /** @type {Map<string, Set<string>>} Tokens inside each area trigger's area. */
  const inside = new Map();
  let lastTurnOrder = null;

  /**
   * Does what a trigger says to its effect.
   *
   * @param {object} effect Effect.
   * @param {Trigger} trigger Trigger.
   * @returns {void}
   */
  function act(effect, trigger) {
    if (trigger.once) {
      if (trigger.used) {
        return;
      }
      trigger.used = true;
    }
    switch (trigger.action) {
      case 'start':
        effect.enabled = true;
        effect.paused = false;
        refreshEffect(effect.id);
        return;
      case 'stop':
        effect.enabled = false;
        refreshEffect(effect.id);
        return;
      case 'toggle':
        effect.enabled = !effect.enabled;
        refreshEffect(effect.id);
        return;
      case 'fire':
        fireOnce(effect.id, 1);
        return;
      case 'burst':
        fireOnce(effect.id, trigger.count);
        return;
    }
  }

  /**
   * Calls a function for every trigger with one of the given events.
   *
   * @param {string[]} events Events.
   * @param {(effect: object, trigger: Trigger, index: number) => void} fn Callback.
   * @returns {void}
   */
  function eachTrigger(events, fn) {
    for (const effect of Object.values(getEffects())) {
      effect.triggers.forEach((trigger, index) => {
        if (events.includes(trigger.event)) {
          fn(effect, trigger, index);
        }
      });
    }
  }

  /**
   * Follows a turn order change, from Roll20's event or the regular check.
   *
   * @param {*} raw Campaign turnorder value.
   * @returns {void}
   */
  function handleTurnOrder(raw) {
    const text = typeof raw === 'string' ? raw : JSON.stringify(raw ?? []);
    if (text === lastTurnOrder) {
      return;
    }
    const prev = readTurnOrder(lastTurnOrder ?? text);
    const first = lastTurnOrder === null;
    lastTurnOrder = text;
    if (first) {
      return;
    }
    const cur = readTurnOrder(text);
    const change = readTurnChange(prev, cur);
    const s = getState();
    if (change.cleared) {
      s.round = 1;
      return;
    }
    if (prev.length === 0) {
      s.round = 1;
    }
    if (change.newRound) {
      s.round = change.roundValue ?? (s.round || 1) + 1;
      eachTrigger(['round'], (effect, trigger) => {
        if (roundMatches(trigger, s.round)) {
          act(effect, trigger);
        }
      });
    } else if (change.roundValue !== null) {
      s.round = change.roundValue;
    }
    if (change.turn) {
      eachTrigger(['turn'], (effect, trigger) => {
        if (trigger.token && trigger.token === change.turn) {
          act(effect, trigger);
        }
      });
    }
  }

  /**
   * Starts following the turn order from its current value, without acting on it.
   *
   * @returns {void}
   */
  function resetTurnOrder() {
    lastTurnOrder = null;
    handleTurnOrder(Campaign().get('turnorder') || '');
  }

  /**
   * Returns true when a token is controlled by a player who is not a GM, or by
   * everyone, directly or through the character it represents.
   *
   * @param {object} token Roll20 graphic.
   * @returns {boolean} True for player tokens.
   */
  function isPlayerToken(token) {
    const controllers = [toText(token.get('controlledby'))];
    const character = token.get('represents') && getObj('character', token.get('represents'));
    if (character) {
      controllers.push(toText(character.get('controlledby')));
    }
    return controllers
      .join(',')
      .split(',')
      .map((id) => id.trim())
      .some((id) => id === 'all' || (id !== '' && !playerIsGM(id)));
  }

  /**
   * Returns true when a token counts for an area trigger.
   *
   * @param {object} token Roll20 graphic.
   * @param {Trigger} trigger Trigger.
   * @returns {boolean} True when it counts.
   */
  function counts(token, trigger) {
    if (token.get('layer') !== 'objects' || getEffects()[token.id] || getNullAreas()[token.id]) {
      return false;
    }
    if (trigger.token === token.id) {
      return false;
    }
    if (trigger.who === 'all') {
      return true;
    }
    if (trigger.who === 'named') {
      const name = toText(token.get('name')).toLowerCase();
      return trigger.names.some((n) => n.toLowerCase() === name);
    }
    return isPlayerToken(token);
  }

  /**
   * Returns an area trigger's area, or null when its token is gone.
   *
   * @param {object} effect Effect.
   * @param {Trigger} trigger Trigger.
   * @returns {{area: object, pageId: string}|null} Area and page.
   */
  function triggerArea(effect, trigger) {
    const token = getObj('graphic', trigger.token || effect.id);
    const page = token && getObj('page', token.get('_pageid'));
    if (!page) {
      return null;
    }
    return { area: tokenArea(tokenValues(token), pageMetrics(pageValues(page))), pageId: page.id };
  }

  /**
   * Returns true when a token's centre is in an area on its page.
   *
   * @param {object} token Roll20 graphic.
   * @param {{area: object, pageId: string}} where Area and page.
   * @returns {boolean} True when inside.
   */
  function isInside(token, where) {
    return (
      token.get('_pageid') === where.pageId &&
      isInArea(
        { x: toNumber(token.get('left')) || 0, y: toNumber(token.get('top')) || 0 },
        where.area
      )
    );
  }

  /**
   * Returns the set of tokens inside an area trigger's area, filling it from the
   * map the first time (without acting) so tokens already there do not count as
   * entering.
   *
   * @param {object} effect Effect.
   * @param {Trigger} trigger Trigger.
   * @param {number} index Trigger number.
   * @returns {Set<string>} Token IDs inside.
   */
  function insideSet(effect, trigger, index, exclude = null) {
    const key = `${effect.id}#${index}`;
    if (!inside.has(key)) {
      const set = new Set();
      const where = triggerArea(effect, trigger);
      if (where) {
        for (const token of findObjs({ _type: 'graphic', _pageid: where.pageId })) {
          if (token.id !== exclude && counts(token, trigger) && isInside(token, where)) {
            set.add(token.id);
          }
        }
      }
      inside.set(key, set);
    }
    return inside.get(key);
  }

  /**
   * Checks whether a token has entered or left any trigger area, and acts.
   * Called when Roll20 reports a move, and by other Mods after moving tokens.
   *
   * @param {object} token Roll20 graphic.
   * @returns {number} Triggers that went off.
   */
  function checkToken(token) {
    let fired = 0;
    eachTrigger(['enter', 'leave'], (effect, trigger, index) => {
      if (!counts(token, trigger)) {
        return;
      }
      // Normally filled already; if not, the token being checked counts as
      // having been outside, so a move into the area is seen as entering.
      const set = insideSet(effect, trigger, index, token.id);
      const where = triggerArea(effect, trigger);
      const now = !!where && isInside(token, where);
      const was = set.has(token.id);
      if (now === was) {
        return;
      }
      if (now) {
        set.add(token.id);
      } else {
        set.delete(token.id);
      }
      if ((now && trigger.event === 'enter') || (!now && trigger.event === 'leave')) {
        act(effect, trigger);
        fired++;
      }
    });
    return fired;
  }

  /**
   * Follows a token change: a move may set off an area trigger. A token that is
   * itself an area moving makes its trigger look again at what is inside.
   *
   * @param {object} token Roll20 graphic.
   * @param {object} [prev={}] Previous values.
   * @returns {void}
   */
  function handleTokenMoved(token, prev = {}) {
    const moved = ['left', 'top', '_pageid', 'layer'].some(
      (k) => k in prev && prev[k] !== token.get(k)
    );
    if (!moved) {
      return;
    }
    // An area that moves starts again from what is inside it now.
    eachTrigger(['enter', 'leave'], (effect, trigger, index) => {
      if ((trigger.token || effect.id) === token.id) {
        inside.delete(`${effect.id}#${index}`);
        insideSet(effect, trigger, index);
      }
    });
    checkToken(token);
  }

  /**
   * Forgets what is inside the areas, for example after triggers changed.
   *
   * @param {string} [effectId] Only this effect's triggers (default: all).
   * @returns {void}
   */
  function forgetInside(effectId) {
    for (const key of [...inside.keys()]) {
      if (!effectId || key.split('#')[0] === effectId) {
        inside.delete(key);
      }
    }
  }

  /**
   * Notes what is inside each area now, without acting, so only later moves
   * count as entering or leaving. Called at startup and when triggers change.
   *
   * @param {string} [effectId] Only this effect's triggers (default: all).
   * @returns {void}
   */
  function primeInside(effectId) {
    forgetInside(effectId);
    eachTrigger(['enter', 'leave'], (effect, trigger, index) => {
      if (!effectId || effect.id === effectId) {
        insideSet(effect, trigger, index);
      }
    });
  }

  /**
   * Forgets a deleted token wherever it was inside an area.
   *
   * @param {string} tokenId Token ID.
   * @returns {void}
   */
  function forgetToken(tokenId) {
    for (const set of inside.values()) {
      set.delete(tokenId);
    }
    forgetInside(tokenId);
  }

  // Chat commands: !pagefx <subcommand>. Matched without regard to case, so the
  // v1 commands `!pageFX on` and `!pageFX off` still work.
  //
  // Commands act on the selected tokens, or on the tokens given with --ids.
  // Layer commands act on layer 1 unless --layer says otherwise. Menu buttons
  // add --edit, --menu, --settings or --status to show their card again.

  // Flags that name the card to show after a change.
  const BACK_FLAGS = ['edit', 'menu', 'settings', 'status'];

  /**
   * Splits command words into plain arguments and flags.
   *
   * @param {string[]} words Words after the subcommand.
   * @returns {{args: string[], ids: string[]|null, layer: number|null, back: string|null}}
   *   Plain arguments, the --ids list, the --layer number and the card to show again.
   */
  function parseArgs(words) {
    const args = [];
    let ids = null;
    let layer = null;
    let back = null;
    for (let i = 0; i < words.length; i++) {
      const word = words[i].toLowerCase();
      if (word === '--ids') {
        ids = [];
        while (i + 1 < words.length && !words[i + 1].startsWith('--')) {
          ids.push(...words[++i].split(',').filter(Boolean));
        }
      } else if (word === '--layer' && i + 1 < words.length) {
        layer = Number.parseInt(words[++i], 10);
      } else if (word.startsWith('--') && BACK_FLAGS.includes(word.slice(2))) {
        back = word.slice(2);
      } else {
        args.push(words[i]);
      }
    }
    return { args, ids, layer, back };
  }

  /**
   * Returns the token IDs a command is for: the --ids list, or the selected tokens.
   *
   * @param {object} ctx Command context.
   * @returns {string[]} Token IDs.
   */
  function targetIds(ctx) {
    return ctx.ids ?? (ctx.msg.selected || []).map((s) => s._id);
  }

  /**
   * Works out which effects a command is for.
   *
   * @param {object} ctx Command context.
   * @returns {{effects: object[], unknown: string[], given: boolean}} Effects, IDs that are
   *   not effects, and whether any tokens were given at all.
   */
  function targetEffects(ctx) {
    const wanted = targetIds(ctx);
    const effects = [];
    const unknown = [];
    for (const id of wanted) {
      const effect = getEffect(id);
      if (effect) {
        effects.push(effect);
      } else {
        unknown.push(id);
      }
    }
    return { effects, unknown, given: wanted.length > 0 };
  }

  /**
   * Returns the effects a command is for, telling the GM when there are none.
   *
   * @param {object} ctx Command context.
   * @returns {object[]} Effects (empty after an error was sent).
   */
  function requireEffects(ctx) {
    const { effects, unknown } = targetEffects(ctx);
    if (unknown.length > 0 && ctx.ids) {
      whisperError(ctx.playerId, t('errors.unknownIds', ctx.lang, { ids: unknown.join(', ') }));
    } else if (effects.length === 0) {
      whisperError(ctx.playerId, t('errors.noEffects', ctx.lang));
    }
    return effects;
  }

  /**
   * Returns the tokens a command is for, telling the GM when there are none.
   *
   * @param {object} ctx Command context.
   * @returns {object[]} Roll20 graphics.
   */
  function requireTokens(ctx) {
    const tokens = targetIds(ctx)
      .map((id) => getObj('graphic', id))
      .filter(Boolean);
    if (tokens.length === 0) {
      whisperError(ctx.playerId, t('errors.selectToken', ctx.lang));
    }
    return tokens;
  }

  /**
   * Sends a short confirmation.
   *
   * @param {string|null} playerId Who to tell.
   * @param {string} text Message.
   * @returns {void}
   */
  function notify(playerId, text) {
    whisper(playerId, SCRIPT_NAME, `<div>${escapeHtml(text)}</div>`);
  }

  /**
   * Shows the cards for some effects.
   *
   * @param {object} ctx Command context.
   * @param {object[]} effects Effects.
   * @returns {void}
   */
  function showCards(ctx, effects) {
    effects.slice(0, MAX_EDIT_CARDS).forEach((e) => showEffectCard(ctx.playerId, e));
  }

  /**
   * Answers a command: shows the card the button came from again, or sends a
   * short confirmation when the command was typed.
   *
   * @param {object} ctx Command context.
   * @param {object[]} effects Effects the command changed.
   * @param {string} key Message key for the confirmation.
   * @param {object} [vars] Message values.
   * @returns {void}
   */
  function reply(ctx, effects, key, vars = {}) {
    switch (ctx.back) {
      case 'edit':
        if (effects.length > 0) {
          showCards(ctx, effects);
        } else {
          showMainMenu(ctx.playerId);
        }
        return;
      case 'menu':
        showMainMenu(ctx.playerId);
        return;
      case 'settings':
        showSettings(ctx.playerId);
        return;
      case 'status':
        showStatus(ctx.playerId);
        return;
      default:
        notify(ctx.playerId, t(key, ctx.lang, { count: effects.length, ...vars }));
    }
  }

  /**
   * Turns, pauses or resumes the targeted effects, or every effect when none
   * are given and the command has a meaning for all of them.
   *
   * @param {object} ctx Command context.
   * @param {object} action What to do.
   * @param {(effect: object) => void} action.each Change for one effect.
   * @param {string} action.done Message key for the count.
   * @param {boolean|null} action.globalPause Global pause value when nothing is targeted
   *   (null: nothing targeted is an error).
   * @returns {void}
   */
  function switchEffects(ctx, { each, done, globalPause }) {
    const { given } = targetEffects(ctx);
    if (!given && globalPause !== null) {
      getState().paused = globalPause;
      syncEffects();
      reply(ctx, [], globalPause ? 'messages.allPaused' : 'messages.allResumed');
      return;
    }
    const effects = requireEffects(ctx);
    if (effects.length === 0) {
      return;
    }
    for (const effect of effects) {
      each(effect);
      refreshEffect(effect.id);
    }
    reply(ctx, effects, done);
  }

  /**
   * Changes the targeted effects. The change returns an error to report, or
   * nothing when it worked.
   *
   * @param {object} ctx Command context.
   * @param {(effect: object) => ({key: string, vars?: object}|null|void)} change Change.
   * @param {string} done Message key for the count.
   * @returns {void}
   */
  function editEffects(ctx, change, done) {
    const effects = requireEffects(ctx);
    const changed = [];
    for (const effect of effects) {
      const problem = change(effect);
      if (problem) {
        whisperError(ctx.playerId, t(problem.key, ctx.lang, problem.vars || {}));
        continue;
      }
      markEdited(effect);
      refreshEffect(effect.id);
      changed.push(effect);
    }
    if (changed.length > 0) {
      reply(ctx, changed, done);
    }
  }

  /**
   * Finds the layer a layer command is for.
   *
   * @param {object} ctx Command context.
   * @param {object} effect Effect.
   * @param {boolean} [create=false] Add layer 1 to an effect that has none.
   * @returns {{layer?: object, error?: {key: string, vars: object}}} Layer, or an error.
   */
  function pickLayer(ctx, effect, create = false) {
    const n = ctx.layer ?? 1;
    if (create && effect.layers.length === 0 && n === 1) {
      effect.layers.push(cleanLayer({ interval: NEW_EFFECT_INTERVAL_MS }));
    }
    const layer = Number.isInteger(n) ? effect.layers[n - 1] : undefined;
    if (!layer) {
      return { error: { key: 'errors.noLayer', vars: { n: String(n), name: effect.name } } };
    }
    return { layer };
  }

  /**
   * Changes one layer of each targeted effect.
   *
   * @param {object} ctx Command context.
   * @param {(layer: object, effect: object) => void} change Change.
   * @param {string} done Message key for the count.
   * @param {boolean} [create=false] Add layer 1 to an effect that has none.
   * @returns {void}
   */
  function editLayers(ctx, change, done, create = false) {
    editEffects(
      ctx,
      (effect) => {
        const picked = pickLayer(ctx, effect, create);
        if (picked.error) {
          return picked.error;
        }
        change(picked.layer, effect);
        return null;
      },
      done
    );
  }

  /**
   * Handles `!pagefx fx <effect>`: a built-in "type-colour", a saved custom FX
   * name, or a custom FX definition in JSON.
   *
   * @param {object} ctx Command context.
   * @returns {void}
   */
  function handleFx(ctx) {
    const parsed = parseFxSpec(ctx.args.join(' '));
    if (!parsed.ok) {
      whisperError(ctx.playerId, t(parsed.error, ctx.lang, parsed.vars || {}));
      return;
    }
    editLayers(
      ctx,
      (layer, effect) => {
        layer.fx = parsed.fx;
        layer.error = null;
        effect.preset = null;
        // Beam-like effects need an end; without one they would be drawn as a dot.
        if (layer.direction === null && isBeamSpec(parsed.fx)) {
          layer.direction = 'random';
        }
      },
      'messages.fxSet',
      true
    );
  }

  /**
   * Handles `!pagefx interval <shortest> [longest]`, in ms.
   *
   * @param {object} ctx Command context.
   * @returns {void}
   */
  function handleInterval(ctx) {
    const low = toNumber(ctx.args[0]);
    const high = ctx.args.length > 1 ? toNumber(ctx.args[1]) : low;
    if (low === null || high === null || low <= 0 || high <= 0) {
      whisperError(ctx.playerId, t('errors.badInterval', ctx.lang));
      return;
    }
    editLayers(
      ctx,
      (layer) => {
        layer.interval = cleanInterval([low, high]);
      },
      'messages.intervalSet'
    );
  }

  /**
   * Handles `!pagefx direction random` and `!pagefx direction <dx> <dy>`, in cells.
   *
   * @param {object} ctx Command context.
   * @returns {void}
   */
  function handleDirection(ctx) {
    let direction;
    if (toText(ctx.args[0]).toLowerCase() === 'random') {
      direction = 'random';
    } else {
      const dx = toNumber(ctx.args[0]);
      const dy = toNumber(ctx.args[1] ?? 0);
      if (dx === null || dy === null) {
        whisperError(ctx.playerId, t('errors.badDirection', ctx.lang));
        return;
      }
      direction = { dx, dy };
    }
    editLayers(
      ctx,
      (layer) => {
        layer.direction = direction;
      },
      'messages.directionSet'
    );
  }

  /**
   * Handles `!pagefx area <radius> [circle|square]`: sets the Aura 1 of effect
   * and no-effect area tokens.
   *
   * @param {object} ctx Command context.
   * @returns {void}
   */
  function handleArea(ctx) {
    const radius = toNumber(ctx.args[0]);
    const shape = toText(ctx.args[1]).toLowerCase();
    if (radius === null || radius < 0 || (shape !== '' && !['circle', 'square'].includes(shape))) {
      whisperError(ctx.playerId, t('errors.badArea', ctx.lang));
      return;
    }
    const square = shape === '' ? null : shape === 'square';
    const given = targetIds(ctx).length > 0;
    const tokens = requireTokens(ctx).filter((tok) => getEffect(tok.id) || getNullAreas()[tok.id]);
    if (tokens.length === 0) {
      if (given) {
        whisperError(ctx.playerId, t('errors.noEffects', ctx.lang));
      }
      return;
    }
    for (const token of tokens) {
      setArea(token, radius, square);
    }
    reply(ctx, tokens.map((tok) => getEffect(tok.id)).filter(Boolean), 'messages.areaSet', {
      count: tokens.length,
    });
  }

  /**
   * Handles `!pagefx layer add [effect]` and `!pagefx layer remove <n>`.
   *
   * @param {object} ctx Command context.
   * @returns {void}
   */
  function handleLayer(ctx) {
    const [action = '', ...rest] = ctx.args;
    if (action.toLowerCase() === 'add') {
      let fx = null;
      if (rest.length > 0) {
        const parsed = parseFxSpec(rest.join(' '));
        if (!parsed.ok) {
          whisperError(ctx.playerId, t(parsed.error, ctx.lang, parsed.vars || {}));
          return;
        }
        fx = parsed.fx;
      }
      editEffects(
        ctx,
        (effect) => {
          if (effect.layers.length >= MAX_LAYERS) {
            return { key: 'errors.tooManyLayers', vars: { max: MAX_LAYERS } };
          }
          const last = effect.layers.at(-1);
          effect.preset = null;
          effect.layers.push(
            cleanLayer({
              fx,
              interval: last ? last.interval : NEW_EFFECT_INTERVAL_MS,
              direction: fx && isBeamSpec(fx) ? 'random' : null,
            })
          );
          return null;
        },
        'messages.layerAdded'
      );
      return;
    }
    if (action.toLowerCase() === 'remove') {
      const raw = rest[0] ?? (ctx.layer === null ? '' : String(ctx.layer));
      const n = Number.parseInt(raw, 10);
      editEffects(
        ctx,
        (effect) => {
          if (!Number.isInteger(n) || !effect.layers[n - 1]) {
            return { key: 'errors.noLayer', vars: { n: raw, name: effect.name } };
          }
          effect.layers.splice(n - 1, 1);
          effect.preset = null;
          return null;
        },
        'messages.layerRemoved'
      );
      return;
    }
    whisperError(ctx.playerId, t('errors.layerUsage', ctx.lang));
  }

  /**
   * Handles `!pagefx create [name]`: makes the selected tokens effects, and
   * shows their cards.
   *
   * @param {object} ctx Command context.
   * @returns {void}
   */
  function handleCreate(ctx) {
    const tokens = requireTokens(ctx);
    if (tokens.length === 0) {
      return;
    }
    const name = ctx.args.join(' ');
    const effects = tokens.map((token) => createEffect(token, name).effect);
    syncEffects();
    if (ctx.back === null) {
      notify(ctx.playerId, t('messages.created', ctx.lang, { count: effects.length }));
    }
    showCards(ctx, effects);
  }

  /**
   * Handles `!pagefx preset <id>`: gives the targeted tokens a preset's layers.
   * Tokens that are not effects yet become effects.
   *
   * @param {object} ctx Command context.
   * @returns {void}
   */
  function handlePreset(ctx) {
    const preset = getPreset(ctx.args[0]);
    if (!preset) {
      whisperError(ctx.playerId, t('errors.unknownPreset', ctx.lang, { id: ctx.args[0] || '' }));
      return;
    }
    const tokens = requireTokens(ctx);
    if (tokens.length === 0) {
      return;
    }
    const name = presetName(preset, ctx.lang);
    const effects = [];
    for (const token of tokens) {
      const { effect, created } = createEffect(token, name);
      effect.layers = presetLayers(preset, ctx.lang);
      effect.preset = preset.id;
      if (!created && effect.name === NEW_EFFECT_NAME) {
        effect.name = name;
      }
      markEdited(effect);
      refreshEffect(effect.id);
      effects.push(effect);
    }
    reply(ctx, effects, 'messages.presetApplied', { name });
  }

  /**
   * Reads trigger options typed as words: key=value pairs, and the words
   * "once" and "always".
   *
   * @param {string[]} words Words after the event and action.
   * @returns {object} Options.
   */
  function parseTriggerOptions(words) {
    const options = {};
    for (const word of words) {
      const lower = word.toLowerCase();
      if (lower === 'once') {
        options.once = true;
      } else if (lower === 'always') {
        options.once = false;
      } else if (word.includes('=')) {
        const [key, ...rest] = word.split('=');
        options[key.toLowerCase()] = rest.join('=');
      }
    }
    return options;
  }

  /**
   * Handles `!pagefx trigger add <event> <action> [options]`. Turn triggers,
   * and area triggers with area=selected, take the selected token (the effect
   * is given with --ids) or token=<id>.
   *
   * @param {object} ctx Command context.
   * @param {string[]} words Words after "add".
   * @returns {void}
   */
  function handleTriggerAdd(ctx, words) {
    const [event = '', action = '', ...rest] = words.map((w, i) => (i < 2 ? w.toLowerCase() : w));
    const options = parseTriggerOptions(rest);
    const selected = (ctx.msg.selected || [])
      .map((sel) => sel._id)
      .find((id) => getObj('graphic', id));
    let token = options.token || null;
    const wantsToken = event === 'turn' || toText(options.area).toLowerCase() === 'selected';
    if (wantsToken && !token) {
      token = selected || null;
      if (!token) {
        whisperError(ctx.playerId, t('errors.triggerToken', ctx.lang));
        return;
      }
    }
    const trigger = cleanTrigger({
      event,
      action,
      count: options.count,
      every: options.every,
      round: options.round,
      token: event === 'round' ? null : token,
      who: toText(options.who).toLowerCase() || 'players',
      names: toText(options.names).split(';'),
      once: options.once === true,
    });
    if (!trigger) {
      whisperError(ctx.playerId, t('errors.triggerUsage', ctx.lang));
      return;
    }
    if (trigger.who === 'named' && trigger.names.length === 0) {
      whisperError(ctx.playerId, t('errors.triggerNames', ctx.lang));
      return;
    }
    editEffects(
      ctx,
      (effect) => {
        if (effect.triggers.length >= MAX_TRIGGERS) {
          return { key: 'errors.tooManyTriggers', vars: { max: MAX_TRIGGERS } };
        }
        if (trigger.token === effect.id && trigger.event !== 'turn') {
          trigger.token = null;
        }
        effect.triggers.push({ ...trigger, names: [...trigger.names] });
        primeInside(effect.id);
        return null;
      },
      'messages.triggerAdded'
    );
  }

  /**
   * Handles `!pagefx trigger add|remove|clear …`.
   *
   * @param {object} ctx Command context.
   * @returns {void}
   */
  function handleTrigger(ctx) {
    const [action = '', ...rest] = ctx.args;
    switch (action.toLowerCase()) {
      case 'add':
        handleTriggerAdd(ctx, rest);
        return;
      case 'remove': {
        const n = Number.parseInt(rest[0], 10);
        editEffects(
          ctx,
          (effect) => {
            if (!Number.isInteger(n) || !effect.triggers[n - 1]) {
              return {
                key: 'errors.noTrigger',
                vars: { n: String(rest[0] ?? ''), name: effect.name },
              };
            }
            effect.triggers.splice(n - 1, 1);
            primeInside(effect.id);
            return null;
          },
          'messages.triggerRemoved'
        );
        return;
      }
      case 'clear':
        editEffects(
          ctx,
          (effect) => {
            effect.triggers = [];
            primeInside(effect.id);
          },
          'messages.triggersCleared'
        );
        return;
      default:
        whisperError(ctx.playerId, t('errors.triggerUsage', ctx.lang));
    }
  }

  /**
   * Handles `!pagefx delete`: takes the effect off the targeted tokens, which
   * stay on the map. Menu buttons ask first and send "no" when the GM backs out.
   *
   * @param {object} ctx Command context.
   * @returns {void}
   */
  function handleDelete(ctx) {
    if (toText(ctx.args[0]).toLowerCase() === 'no') {
      showCards(ctx, targetEffects(ctx).effects);
      return;
    }
    const effects = requireEffects(ctx);
    if (effects.length === 0) {
      return;
    }
    for (const effect of effects) {
      releaseEffect(effect.id);
    }
    syncEffects();
    reply({ ...ctx, back: ctx.back === 'edit' ? 'menu' : ctx.back }, effects, 'messages.deleted');
  }

  /**
   * Handles `!pagefx null create` and `!pagefx null remove`.
   *
   * @param {object} ctx Command context.
   * @returns {void}
   */
  function handleNull(ctx) {
    const action = toText(ctx.args[0]).toLowerCase();
    if (action !== 'create' && action !== 'remove') {
      whisperError(ctx.playerId, t('errors.nullUsage', ctx.lang));
      return;
    }
    const tokens = requireTokens(ctx);
    if (tokens.length === 0) {
      return;
    }
    let count = 0;
    for (const token of tokens) {
      if (action === 'remove') {
        count += removeNullArea(token.id) ? 1 : 0;
      } else if (createNullArea(token)) {
        count++;
      } else {
        whisperError(
          ctx.playerId,
          t('errors.isEffect', ctx.lang, { name: getEffect(token.id)?.name || token.id })
        );
      }
    }
    if (count === 0 && action === 'create') {
      return;
    }
    reply(ctx, [], action === 'create' ? 'messages.nullCreated' : 'messages.nullRemoved', {
      count,
    });
  }

  /**
   * Handles `!pagefx set <setting> <value>`.
   *
   * @param {object} ctx Command context.
   * @returns {void}
   */
  function handleSet(ctx) {
    const keys = {
      language: 'language',
      gmpagepreview: 'gmPagePreview',
      intensity: 'intensity',
      maxspawnspersecond: 'maxSpawnsPerSecond',
    };
    const key = keys[toText(ctx.args[0]).toLowerCase()];
    const raw = ctx.args.slice(1).join(' ');
    const value = key === 'gmPagePreview' ? parseBoolean(raw) : raw;
    if (!key || value === null || !setSetting(key, value)) {
      whisperError(
        ctx.playerId,
        t('errors.badSetting', ctx.lang, { setting: ctx.args[0] || '', value: raw })
      );
      return;
    }
    syncEffects();
    if (key === 'language') {
      installHandouts();
    }
    // A new language applies to the reply too.
    reply({ ...ctx, lang: getLang() }, [], 'messages.settingChanged', {
      setting: key,
      value: String(getSettings()[key]),
    });
  }

  /**
   * Handles `!pagefx intensity <n>` for the targeted effects, and
   * `!pagefx intensity global <n>` for the whole game.
   *
   * @param {object} ctx Command context.
   * @returns {void}
   */
  function handleIntensity(ctx) {
    if (toText(ctx.args[0]).toLowerCase() === 'global') {
      handleSet({ ...ctx, args: ['intensity', ...ctx.args.slice(1)] });
      return;
    }
    const value = toNumber(ctx.args[0]);
    if (value === null || value <= 0) {
      whisperError(ctx.playerId, t('errors.badIntensity', ctx.lang));
      return;
    }
    editEffects(
      ctx,
      (effect) => {
        effect.intensity = clampIntensity(value);
      },
      'messages.intensitySet'
    );
  }

  /**
   * Handles `!pagefx fire [count]`: spawns the targeted effects now.
   *
   * @param {object} ctx Command context.
   * @returns {void}
   */
  function handleFire(ctx) {
    const effects = requireEffects(ctx);
    if (effects.length === 0) {
      return;
    }
    const count = Math.min(MAX_FIRE_COUNT, Math.max(1, Number.parseInt(ctx.args[0], 10) || 1));
    const made = effects.reduce((sum, e) => sum + fireOnce(e.id, count), 0);
    // From a menu button the spawn itself is the answer; a new card would only clutter chat.
    if (ctx.back === null) {
      notify(ctx.playerId, t('messages.fired', ctx.lang, { count: made }));
    }
  }

  /**
   * Handles `!pagefx name <text>`.
   *
   * @param {object} ctx Command context.
   * @returns {void}
   */
  function handleName(ctx) {
    const name = truncate(ctx.args.join(' '), MAX_NAME_LENGTH);
    if (name === '') {
      whisperError(ctx.playerId, t('errors.noName', ctx.lang));
      return;
    }
    editEffects(
      ctx,
      (effect) => {
        effect.name = name;
      },
      'messages.renamed'
    );
  }

  /**
   * Whispers the list of commands.
   *
   * @param {object} ctx Command context.
   * @returns {void}
   */
  function showHelp(ctx) {
    const html = COMMAND_LIST.map(
      ([cmd, key]) =>
        `<div style="margin:2px 0"><code>${escapeHtml(`${COMMAND} ${cmd}`.trim())}</code><br><span style="font-size:0.85em">${escapeHtml(t(`help.${key}`, ctx.lang))}</span></div>`
    ).join('');
    whisper(ctx.playerId, t('titles.help', ctx.lang), [
      html,
      buildDivider(),
      `<div style="font-size:0.85em">${escapeHtml(t('help.handout', ctx.lang, { help: HANDOUT_HELP_NAME, deck: HANDOUT_DECK_NAME }))}</div>`,
    ]);
  }

  /**
   * Handles `!pagefx journal rebuild`.
   *
   * @param {object} ctx Command context.
   * @returns {void}
   */
  function handleJournal(ctx) {
    if (toText(ctx.args[0]).toLowerCase() !== 'rebuild') {
      whisperError(ctx.playerId, t('errors.journalUsage', ctx.lang));
      return;
    }
    installHandouts();
    notify(
      ctx.playerId,
      t('messages.journalRebuilt', ctx.lang, { help: HANDOUT_HELP_NAME, deck: HANDOUT_DECK_NAME })
    );
  }

  const switches = {
    on: { field: 'enabled', value: true, done: 'messages.turnedOn', globalPause: false },
    off: { field: 'enabled', value: false, done: 'messages.turnedOff', globalPause: true },
    pause: { field: 'paused', value: true, done: 'messages.paused', globalPause: true },
    resume: { field: 'paused', value: false, done: 'messages.resumed', globalPause: false },
    toggle: { field: 'enabled', value: null, done: 'messages.toggled', globalPause: null },
  };

  const handlers = {
    create: handleCreate,
    preset: handlePreset,
    trigger: handleTrigger,
    help: showHelp,
    journal: handleJournal,
    presets: (ctx) => showPresets(ctx.playerId),
    delete: handleDelete,
    fire: handleFire,
    name: handleName,
    fx: handleFx,
    interval: handleInterval,
    direction: handleDirection,
    area: handleArea,
    intensity: handleIntensity,
    layer: handleLayer,
    null: handleNull,
    set: handleSet,
    edit: (ctx) => showCards(ctx, requireEffects(ctx)),
    settings: (ctx) => showSettings(ctx.playerId),
    status: (ctx) => {
      syncEffects();
      showStatus(ctx.playerId);
    },
    menu: (ctx) => {
      syncEffects();
      showMainMenu(ctx.playerId, ctx.args[0]);
    },
    rescan: (ctx) => {
      const counts = rescanTokens();
      syncEffects();
      reply(ctx, [], 'messages.rescanned', counts);
    },
  };

  /**
   * Routes a subcommand.
   *
   * @param {object} msg Chat message.
   * @param {string} sub Subcommand.
   * @param {string[]} words Remaining words.
   * @returns {void}
   */
  function routeCommand(msg, sub, words) {
    const ctx = {
      msg,
      playerId: msg.playerid === API_PLAYER_ID ? null : msg.playerid,
      lang: getLang(),
      ...parseArgs(words),
    };
    if (sub in switches) {
      const { field, value, done, globalPause } = switches[sub];
      switchEffects(ctx, {
        each: (e) => {
          e[field] = value === null ? !e[field] : value;
        },
        done,
        globalPause,
      });
      return;
    }
    const handler = handlers[sub === '' ? 'menu' : sub];
    if (handler && Object.hasOwn(handlers, sub === '' ? 'menu' : sub)) {
      handler(ctx);
      return;
    }
    whisperError(
      ctx.playerId,
      t('errors.unknownCommand', ctx.lang, { command: `${COMMAND} ${sub}` })
    );
  }

  /**
   * Handles a chat message.
   *
   * @param {object} msg Roll20 chat message.
   * @returns {void}
   */
  function handleInput(msg) {
    if (msg.type !== 'api') {
      return;
    }
    const content = toText(msg.content);
    const [first = ''] = content.split(/\s+/, 1);
    if (!COMMAND_ALIASES.includes(first.toLowerCase())) {
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
  const warned = new Set();

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
   * Tells the GM once per session about things they should fix.
   *
   * @returns {void}
   */
  function installSchedulerHooks() {
    setSchedulerHooks({
      throttle(pageId) {
        if (warned.has(`rate:${pageId}`)) {
          return;
        }
        warned.add(`rate:${pageId}`);
        const lang = getLang();
        const page = getObj('page', pageId)?.get('name') || pageId;
        whisper(
          null,
          SCRIPT_NAME,
          `<div>${escapeHtml(t('messages.throttled', lang, { page, max: getSettings().maxSpawnsPerSecond }))}</div>`
        );
      },
      problem(effectId, problem) {
        const key = `problem:${effectId}:${problem.error}`;
        if (warned.has(key)) {
          return;
        }
        warned.add(key);
        const lang = getLang();
        const name = getEffect(effectId)?.name || effectId;
        const reason = t(problem.error, lang, problem.vars || {});
        whisper(
          null,
          SCRIPT_NAME,
          `<div>${escapeHtml(t('messages.problem', lang, { name, reason }))}</div>`
        );
      },
    });
  }

  /**
   * Returns the effect ID for a token or ID.
   *
   * @param {object|string} tokenOrId Roll20 graphic or its ID.
   * @returns {string} Effect ID.
   */
  function idOf(tokenOrId) {
    return typeof tokenOrId === 'string' ? tokenOrId : tokenOrId?.id || tokenOrId?.get?.('_id');
  }

  /**
   * Changes one effect from the API.
   *
   * @param {object|string} tokenOrId Roll20 graphic or its ID.
   * @param {(effect: object) => void} change Change.
   * @returns {boolean} True when the effect exists.
   */
  function changeEffect(tokenOrId, change) {
    const effect = ready && getEffect(idOf(tokenOrId));
    if (!effect) {
      return false;
    }
    change(effect);
    refreshEffect(effect.id);
    return true;
  }

  /**
   * Makes a token an effect from another Mod.
   *
   * @param {object|string} tokenOrId Roll20 graphic or its ID.
   * @param {object} [options] What the effect does.
   * @param {string} [options.name] Name shown in menus.
   * @param {string|string[]} [options.fx] Effect for each layer: "type-colour", a saved
   *   custom FX name, or JSON.
   * @param {[number, number]|number} [options.interval] Time between spawns, in ms.
   * @param {'random'|{dx: number, dy: number}} [options.direction] End of beam-like effects.
   * @param {number} [options.intensity] Rate multiplier.
   * @returns {{ok: boolean, id?: string, error?: string}} Result; error is a message key.
   */
  function createFromApi(tokenOrId, options = {}) {
    const token = ready && getObj('graphic', idOf(tokenOrId));
    if (!token) {
      return { ok: false, error: 'errors.selectToken' };
    }
    const specs = [options.fx ?? []].flat();
    const parsed = specs.map((spec) => parseFxSpec(spec));
    const bad = parsed.find((p) => !p.ok);
    if (bad) {
      return { ok: false, error: bad.error };
    }
    const { effect } = createEffect(token, options.name);
    if (parsed.length > 0) {
      const interval =
        options.interval === undefined
          ? effect.layers[0]?.interval
          : cleanInterval([options.interval].flat());
      effect.layers = parsed.map((p) =>
        cleanLayer({
          fx: p.fx,
          interval,
          direction:
            options.direction === undefined
              ? isBeamSpec(p.fx)
                ? 'random'
                : null
              : cleanDirection(options.direction),
        })
      );
    }
    if (options.intensity !== undefined) {
      effect.intensity = clampIntensity(options.intensity);
    }
    markEdited(effect);
    refreshEffect(effect.id);
    return { ok: true, id: effect.id };
  }

  /**
   * Publishes the API other Mods can call. v1 published a global PageFX object
   * with five functions; they keep their names and now work on every live page.
   *
   * @returns {void}
   */
  function publishApi() {
    const setGlobalPause = (paused) => {
      if (ready) {
        getState().paused = paused;
        syncEffects();
      }
    };
    globalThis.PageFX = Object.freeze({
      version: SCRIPT_VERSION,
      /** Starts every effect on the live pages (v1 `!pageFX on`). */
      activateAllEffects: () => setGlobalPause(false),
      /** Stops every effect until activated again (v1 `!pageFX off`). */
      deactivateAllEffects: () => setGlobalPause(true),
      /** Turns one effect on. */
      activateEffect: (token) =>
        changeEffect(token, (e) => {
          e.enabled = true;
          e.paused = false;
        }),
      /** Turns one effect off. */
      deactivateEffect: (token) =>
        changeEffect(token, (e) => {
          e.enabled = false;
        }),
      /** Turns one effect on or off. */
      toggleEffect: (token) =>
        changeEffect(token, (e) => {
          e.enabled = !e.enabled;
        }),
      start: (token) =>
        changeEffect(token, (e) => {
          e.enabled = true;
          e.paused = false;
        }),
      stop: (token) =>
        changeEffect(token, (e) => {
          e.enabled = false;
        }),
      pause: (token) =>
        changeEffect(token, (e) => {
          e.paused = true;
        }),
      resume: (token) =>
        changeEffect(token, (e) => {
          e.paused = false;
        }),
      setIntensity: (token, value) =>
        changeEffect(token, (e) => {
          e.intensity = clampIntensity(value);
        }),
      /** Makes a token an effect (see createFromApi). */
      create: (token, options) => createFromApi(token, options),
      /** Takes the effect off a token; the token stays. */
      remove: (token) => {
        const id = idOf(token);
        if (!ready || !getEffect(id)) {
          return false;
        }
        releaseEffect(id);
        syncEffects();
        return true;
      },
      /** Adds a preset for this session: registerPreset(id, {name, layers: [{fx, interval}]}). */
      registerPreset: (id, definition) => registerPreset(id, definition),
      /** Lists the presets: [{id, name, pack}]. */
      listPresets: () =>
        allPresets().map((p) => ({ id: p.id, name: presetName(p, getLang()), pack: p.pack })),
      /** Checks a token another Mod moved against the enter and leave triggers. */
      checkToken: (token) => {
        const obj = typeof token === 'string' ? getObj('graphic', token) : token;
        return ready && obj ? checkToken(obj) : 0;
      },
      fire: (token, count = 1) =>
        ready ? fireOnce(idOf(token), Math.max(1, Number(count) || 1)) : 0,
      isRunning: (token) => isRunning(idOf(token)),
      getEffect: (token) => {
        const effect = ready && getEffect(idOf(token));
        return effect
          ? JSON.parse(
              JSON.stringify({
                ...effect,
                running: isRunning(effect.id),
                problems: getProblems(effect.id),
              })
            )
          : null;
      },
      listEffects: (pageId) =>
        ready
          ? Object.keys(getEffects()).filter(
              (id) => !pageId || getObj('graphic', id)?.get('_pageid') === pageId
            )
          : [],
    });
  }

  /**
   * Startup: load state, take over v1 tokens, start effects and greet the GM.
   *
   * @returns {void}
   */
  function checkInstall() {
    const fresh = initialiseState();
    applyGlobalConfig();
    installSchedulerHooks();
    const counts = rescanTokens();
    const s = getState();
    ready = true;
    syncEffects();
    resetTurnOrder();
    primeInside();
    try {
      installHandouts();
    } catch (err) {
      log(`${SCRIPT_NAME}: could not write the handouts: ${err?.message || err}`);
    }
    // Other Mods change the turn order without an event, so it is checked with the live pages.
    watchLivePages(LIVE_PAGE_CHECK_MS, () => handleTurnOrder(Campaign().get('turnorder') || ''));

    log(`-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} [Updated: ${SCRIPT_LAST_UPDATED}] <=-`);

    const lang = getLang();
    const lines = [`<div><strong>${escapeHtml(t('titles.ready', lang))}</strong></div>`];
    if (fresh && (counts.effects > 0 || counts.nulls > 0)) {
      lines.push(
        `<div style="margin-top:3px">${escapeHtml(t('messages.adopted', lang, counts))}</div>`
      );
      s.notices.adoptedV1 = true;
    }
    lines.push(
      `<div style="font-size:0.85em;margin-top:3px">${escapeHtml(t('messages.readyHint', lang))}</div>`
    );
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
    const resync = guarded('page change', () => syncEffects());
    on('change:campaign:playerpageid', resync);
    on('change:campaign:playerspecificpages', resync);
    on(
      'change:player:_lastpage',
      guarded('GM page change', () => {
        if (getSettings().gmPagePreview) {
          syncEffects();
        }
      })
    );
    on(
      'change:player:_online',
      guarded('player online', () => {
        if (getSettings().gmPagePreview) {
          syncEffects();
        }
      })
    );
    on('change:graphic', guarded('change:graphic', handleGraphicChange));
    on('change:graphic', guarded('trigger areas', handleTokenMoved));
    on(
      'change:campaign:turnorder',
      guarded('turn order', () => handleTurnOrder(Campaign().get('turnorder') || ''))
    );
    on('add:graphic', guarded('add:graphic', handleGraphicAdded));
    on('destroy:graphic', guarded('destroy:graphic', handleGraphicDestroyed));
    on(
      'destroy:graphic',
      guarded('trigger areas', (token) => forgetToken(token.id))
    );
    on(
      'destroy:page',
      guarded('destroy:page', () => {
        for (const id of Object.keys(getEffects())) {
          if (!getObj('graphic', id)) {
            forgetEffect(id);
          }
        }
      })
    );
  }

  // Stop timers if the sandbox reloads this script in place.
  stopAll();
  registerEventHandlers();
})();
