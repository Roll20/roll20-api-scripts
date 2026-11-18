/**
 * NOTE: GENERATED FILE - DO NOT EDIT DIRECTLY.
 * NOTE: Source files live under src/ and are bundled with `npm run build`.
 * ------------------------------------------------
 * Name: InspirationTracker
 * Script: InspirationTracker.js
 * Version: 1.0.0
 * Built: 2026-11-18T09:00:10.199Z
 */
const InspirationTrackerMod = (() => {
  'use strict';

  // Build-time placeholders replaced by rollup.config.js inject-build-metadata plugin.
  const SCRIPT_NAME = 'InspirationTracker';
  const SCRIPT_VERSION = '1.0.0';
  const SCRIPT_LAST_UPDATED = '2026-11-18T09:00:10.199Z';

  const DEFAULT_LOCALE$1 = 'en-US';

  const STATE_KEY = 'InspirationTracker';
  const SCHEMA_VERSION = 1;
  const COMMAND = '!inspiration';

  // 0.1.x kept its settings here, including a GM-chosen command name.
  const LEGACY_STATE_KEY = 'INSPIRATIONTRACKER';

  // The player ID Roll20 gives chat messages sent by Mods with sendChat.
  const API_PLAYER_ID = 'API';

  const HANDOUT_HELP_NAME = 'InspirationTracker - Help';
  const HANDOUT_DECK_NAME = 'InspirationTracker - Command Deck';
  // Journal icon (the handouts' avatar): the plain InspirationTracker icon in Roll20's
  // file store. Roll20 keeps it as `.../max.webp?<number>`, so an icon is matched
  // on its image path. Only the webp files exist (thumb.png is a 404).
  const HANDOUT_ICON_PATH = '/images/506991612/MVQIb3bWgcO-XABFmcaezw/';
  const HANDOUT_ICON = `https://files.d20.io${HANDOUT_ICON_PATH}thumb.webp`;

  // The token action macro players use to spend inspiration.
  const MACRO_NAME = 'Inspiration';

  const AUTHOR_LINKS = {
    original: {
      name: 'Robin Kuiper',
      profile: 'https://app.roll20.net/users/1226016/robin',
      patreon: 'https://www.patreon.com/robinkuiper',
    },
    maintainer: {
      name: 'MidNiteShadow7',
      profile: 'https://app.roll20.net/users/16506286/midniteshadow7',
      github: 'https://github.com/steverobertsuk',
    },
  };

  // Sheet attribute and item names.
  // The 2014 OGL sheet stores a checkbox attribute ("on" when ticked).
  const LEGACY_ATTRIBUTE = 'inspiration';
  // The D&D 2024 (Beacon) sheet exposes a 0/1 sheet item, kept inside the
  // character's `store` attribute.
  const BEACON_ITEM = 'inspiration';
  const BEACON_STORE_ATTRIBUTE = 'store';

  // Rules editions, used for wording and the 2024 pass-on rule.
  const RULES_2014 = '2014';
  const RULES_2024 = '2024';

  // Option lists for settings.
  const TRACKING_OPTIONS = ['flag', 'pool'];
  const WORDING_OPTIONS = ['auto', RULES_2014, RULES_2024];
  const ANNOUNCE_OPTIONS = ['public', 'gm', 'off'];

  // Roll20's built-in coloured dots. They are not listed in the campaign's
  // token marker sets, so they are offered alongside them.
  const COLOUR_MARKERS = ['red', 'blue', 'green', 'brown', 'purple', 'pink', 'yellow'];

  // The D&D 2024 sheet draws its own condition markers; they are left alone.
  const SHEET_MARKER_PREFIX = 'sheet-';

  // Default configuration for new installs. Upgraded 0.1.x games keep their marker
  // and special effect.
  const DEFAULT_CONFIG = {
    language: DEFAULT_LOCALE$1,
    tracking: 'flag',
    marker: 'black-flag',
    wording: 'auto',
    announce: 'public',
    fx: true,
    fxType: 'nova-holy',
    playerSpend: true,
    playerOverview: false,
    passOn: true,
  };

  // Settings the GM can change on the Mod's page in the API Scripts screen.
  const USEROPTION_KEYS = ['language', 'wording', 'playerOverview'];

  // Settings shown in the settings menu, in order.
  const SETTING_KEYS = [
    'language',
    'tracking',
    'marker',
    'wording',
    'announce',
    'fx',
    'fxType',
    'playerSpend',
    'playerOverview',
    'passOn',
  ];

  // Points pools: counters a GM can award and players can spend, such as a pool
  // of inspiration points, hero points or luck. A pool is kept in the sheet's
  // resource box with the pool's name, or in a plain attribute.
  const POOL_SOURCES = ['resource', 'attribute'];
  const DEFAULT_POOL = {
    id: 'inspiration',
    name: 'Inspiration',
    source: 'resource',
    cost: 1,
    max: 0,
    marker: '',
  };
  const MAX_POOLS = 8;
  const MAX_POINTS = 9999;
  // A pool's plain attribute is its ID with this ending: "inspiration_pool".
  const POOL_ATTRIBUTE_SUFFIX = '_pool';

  // Roll20's built-in special effect names ("type-colour").
  const FX_TYPES = [
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
  const FX_COLOURS = [
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

  // How many spends can be undone, and for how long an offer to pass on
  // Heroic Inspiration stays open.
  const MAX_UNDO = 30;
  const OFFER_LIFETIME_MS = 60 * 60 * 1000;

  // Commands listed by `help` and the Help handout, with their help keys.
  const HELP_COMMANDS = [
    ['', 'menu'],
    ['give', 'give'],
    ['remove', 'remove'],
    ['toggle', 'toggle'],
    ['spend', 'spend'],
    ['party', 'party'],
    ['party add / party remove', 'partyEdit'],
    ['give | remove | toggle | spend --ids <id;id;…>', 'ids'],
    ['give | remove | spend <points>', 'points'],
    ['boost <bonus>', 'boost'],
    ['give | remove | spend | boost | party --pool <name>', 'poolFlag'],
    ['pools', 'pools'],
    ['pool add <name> / pool delete <name>', 'poolEdit'],
    ['pool set <name> <name|source|cost|max|marker> <value>', 'poolSet'],
    ['undo <id>', 'undo'],
    ['macro', 'macro'],
    ['sync', 'sync'],
    ['set [<setting> <value>]', 'set'],
    ['reset', 'reset'],
    ['status', 'status'],
    ['journal rebuild', 'journal'],
    ['help', 'help'],
  ];

  // Colour palette for chat cards and handouts.
  const COLOR_HEADER_BG = '#2a2140';
  const COLOR_HEADER_TEXT = '#f3eefc';
  const COLOR_CARD_BG_TOP = '#3a2d59';
  const COLOR_CARD_BG_BOTTOM = '#1f1830';
  const COLOR_BORDER = '#5b4a85';
  const COLOR_TEXT = '#ece6f7';
  const COLOR_MUTED = '#b3a8cc';
  const COLOR_ACCENT = '#f2c94c';
  const COLOR_BUTTON_BG = '#6a4fb3';
  const COLOR_BUTTON_TEXT = '#ffffff';
  const COLOR_BUTTON_ALT_BG = '#2f2548';
  const COLOR_BUTTON_ALT_BORDER = '#6d5c99';
  const COLOR_WARNING_BG = '#fef3c7';
  const COLOR_WARNING_BORDER = '#92400e';
  const COLOR_WARNING_TEXT = '#92400e';
  const COLOR_ERROR_BG = '#fee2e2';
  const COLOR_ERROR_BORDER = '#991b1b';
  const COLOR_ERROR_TEXT = '#991b1b';

  // The inspiration icon Robin Kuiper's 0.1.x showed on its chat cards.
  const ICON_URL =
    'https://s3.amazonaws.com/files.d20.io/images/39783029/-w45_4ICV9QnFzijBimwKA/max.png';

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
   * Reads a sheet value as inspired or not. The 2014 OGL sheet stores "on" for a
   * ticked box; the 2024 sheet stores 1. Anything else counts as not inspired.
   *
   * @param {*} value Sheet value.
   * @returns {boolean} True when inspired.
   */
  function isInspiredValue(value) {
    if (typeof value === 'number') {
      return value > 0;
    }
    if (typeof value === 'boolean') {
      return value;
    }
    const text = toText(value).toLowerCase();
    if (['on', 'true', 'yes'].includes(text)) {
      return true;
    }
    const n = Number(text);
    return text !== '' && Number.isFinite(n) && n > 0;
  }

  /**
   * Splits command text into words, keeping "double quoted" phrases together.
   * Quotes are removed; an unterminated quote runs to the end of the text.
   *
   * @param {string} text Command text.
   * @returns {string[]} Words in order.
   */
  function tokenize(text) {
    const words = [];
    const pattern = /"([^"]*)"?|(\S+)/g;
    for (const match of toText(text).matchAll(pattern)) {
      words.push(match[1] === undefined ? match[2] : match[1].trim());
    }
    return words;
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
   * Splits a token's status markers into tags, dropping number badges
   * (`red@2` becomes `red`).
   *
   * @param {*} raw statusmarkers value.
   * @returns {string[]} Marker tags.
   */
  function markerTags(raw) {
    return toText(raw)
      .split(',')
      .map((tag) => tag.split('@')[0].trim())
      .filter(Boolean);
  }

  /**
   * Returns true when a statusmarkers value shows a marker.
   *
   * @param {*} raw statusmarkers value.
   * @param {string} marker Marker tag.
   * @returns {boolean} True when shown.
   */
  function hasMarker(raw, marker) {
    return Boolean(marker) && markerTags(raw).includes(marker);
  }

  /**
   * Adds or removes a status marker, keeping the token's other markers (and
   * their number badges) as they were.
   *
   * @param {object} token Roll20 graphic.
   * @param {string} marker Marker tag.
   * @param {boolean} on Add when true, remove when false.
   * @returns {boolean} True when the token changed.
   */
  function setMarker(token, marker, on) {
    const raw = toText(token.get('statusmarkers'));
    if (!marker || hasMarker(raw, marker) === on) {
      return false;
    }
    const markers = raw.split(',').filter((tag) => tag && tag.split('@')[0] !== marker);
    if (on) {
      markers.push(marker);
    }
    token.set('statusmarkers', markers.join(','));
    return true;
  }

  /**
   * Returns the IDs of every GM in the game.
   *
   * @returns {string[]} GM player IDs.
   */
  function getGmPlayerIds() {
    return findObjs({ _type: 'player' })
      .filter((player) => playerIsGM(player.id))
      .map((player) => player.id);
  }

  /**
   * Returns true when a player may act as GM: a real GM, or another Mod
   * sending commands with sendChat.
   *
   * @param {string} playerId Roll20 player ID.
   * @param {string} apiId The ID Roll20 gives Mod messages.
   * @returns {boolean} True for GMs and Mods.
   */
  function isGmOrMod(playerId, apiId) {
    return playerId === apiId || playerIsGM(playerId);
  }

  /**
   * Makes text safe inside a Roll20 roll query option (`?{Q|label,value}`).
   *
   * @param {string} text Text.
   * @returns {string} Text without the characters that end a query option.
   */
  function queryText(text) {
    return toText(text)
      .replaceAll(/[|,{}]/g, ' ')
      .replaceAll(/\s+/g, ' ')
      .trim();
  }

  /**
   * Returns a short random ID for undo entries and offers.
   *
   * @returns {string} ID.
   */
  function shortId() {
    return Math.random().toString(36).slice(2, 8);
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

  // How a button sits in a line of text, and how it fills a cell of a button grid.
  const BUTTON_INLINE_LAYOUT = 'display:inline-block;margin:1px 2px';
  const BUTTON_GRID_LAYOUT = 'display:block;margin:0;text-align:center';

  const BUTTON_STYLE = [
    `background:${COLOR_BUTTON_BG}`,
    `color:${COLOR_BUTTON_TEXT}`,
    // Same width of border as the secondary button, so both are the same height.
    `border:1px solid ${COLOR_BUTTON_BG}`,
    'padding:2px 7px',
    'border-radius:3px',
    'text-decoration:none',
    'font-size:0.9em',
    BUTTON_INLINE_LAYOUT,
  ].join(';');

  const BUTTON_SECONDARY_STYLE = [
    `background:${COLOR_BUTTON_ALT_BG}`,
    `color:${COLOR_TEXT}`,
    `border:1px solid ${COLOR_BUTTON_ALT_BORDER}`,
    'padding:2px 7px',
    'border-radius:3px',
    'text-decoration:none',
    'font-size:0.9em',
    BUTTON_INLINE_LAYOUT,
  ].join(';');

  // Matches the section headings of the Help and Command Deck handouts.
  const SECTION_LABEL_STYLE = [
    `background:${COLOR_HEADER_BG}`,
    `color:${COLOR_ACCENT}`,
    `border-left:3px solid ${COLOR_ACCENT}`,
    'padding:2px 8px',
    'font-variant:small-caps',
    'font-weight:bold',
    'letter-spacing:0.05em',
    'margin:8px 0 3px 0',
  ].join(';');

  // A name inside a section, such as a character or a pool.
  const ITEM_TITLE_STYLE = 'font-weight:bold;margin:6px 0 1px 0';

  // Small print under an item or at the foot of a card.
  const NOTE_STYLE = `color:${COLOR_MUTED};font-size:0.85em;line-height:1.35;margin:2px 0`;

  const DIVIDER_STYLE = `border:none;border-top:1px solid ${COLOR_BORDER};margin:6px 0 4px 0`;

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
   * Sends the same card to several players, once each.
   *
   * @param {string[]} playerIds Roll20 player IDs.
   * @param {string} title Card header text.
   * @param {string|string[]} content HTML body content.
   * @returns {void}
   */
  function whisperEach(playerIds, title, content) {
    for (const id of new Set(playerIds)) {
      whisper(id, title, content);
    }
  }

  /**
   * Sends a styled card to everyone.
   *
   * @param {string} title Card header text.
   * @param {string} body HTML body content.
   * @returns {void}
   */
  function broadcast(title, body) {
    sendChat(SCRIPT_NAME, buildCard(title, body));
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
   * Lays buttons out in equal columns, each button filling its cell, so a set
   * of buttons lines up instead of wrapping wherever the labels happen to end.
   * A button left over on the last row takes the whole row.
   *
   * @param {string[]} buttons Button HTML from buildButton or buildSecondaryButton; empty items are skipped.
   * @param {number} [columns=2] Buttons per row.
   * @returns {string} HTML table, or an empty string when there are no buttons.
   */
  function buildButtonGrid(buttons, columns = 2) {
    const list = buttons.filter(Boolean);
    if (list.length === 0) {
      return '';
    }
    const width = Math.floor(100 / columns);
    const rows = [];
    for (let i = 0; i < list.length; i += columns) {
      const row = list.slice(i, i + columns);
      const span = row.length === 1 && columns > 1 ? ` colspan="${columns}"` : '';
      rows.push(
        `<tr>${row
          .map(
            (button) =>
              `<td${span} style="width:${span ? 100 : width}%;padding:2px">${button.replace(BUTTON_INLINE_LAYOUT, BUTTON_GRID_LAYOUT)}</td>`
          )
          .join('')}</tr>`
      );
    }
    return `<table style="width:100%;border-collapse:collapse;table-layout:fixed;margin:2px 0">${rows.join('')}</table>`;
  }

  /**
   * Builds the name of one item in a section, such as a character, with its
   * value (a tick, or a number of points) at the right-hand edge.
   *
   * @param {string} text Name (escaped).
   * @param {string} [valueHtml=''] Trusted HTML for the right-hand edge.
   * @param {string} [afterHtml=''] Trusted HTML after the name, such as a muted tag.
   * @returns {string} HTML string.
   */
  function buildItemTitle(text, valueHtml = '', afterHtml = '') {
    if (!valueHtml) {
      return `<div style="${ITEM_TITLE_STYLE}">${escapeHtml(text)}${afterHtml}</div>`;
    }
    return [
      `<table style="width:100%;border-collapse:collapse;${ITEM_TITLE_STYLE}"><tr>`,
      `<td style="vertical-align:middle">${escapeHtml(text)}${afterHtml}</td>`,
      `<td style="text-align:right;white-space:nowrap;vertical-align:middle;padding-left:6px">${valueHtml}</td>`,
      '</tr></table>',
    ].join('');
  }

  /**
   * Builds a line of small print.
   *
   * @param {string} text Text (escaped).
   * @returns {string} HTML string.
   */
  function buildNote(text) {
    return `<div style="${NOTE_STYLE}">${escapeHtml(text)}</div>`;
  }

  /**
   * Builds one entry of a command list: the command in the accent colour, with
   * what it does underneath.
   *
   * @param {string} command Command text (escaped).
   * @param {string} description What it does (escaped).
   * @returns {string} HTML string.
   */
  function buildCommandHelp(command, description) {
    return [
      `<div style="margin:7px 0 1px 0;font-family:monospace;font-size:0.85em;color:${COLOR_ACCENT};word-break:break-word">${escapeHtml(command)}</div>`,
      `<div style="font-size:0.9em;line-height:1.35">${escapeHtml(description)}</div>`,
    ].join('');
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
   * @param {boolean} [keepTogether=false] Keeps the value on one line and lets the label take what is left, for a button whose words should not wrap.
   * @returns {string} HTML string.
   */
  function buildRow(label, valueHtml, keepTogether = false) {
    const labelWidth = keepTogether ? '' : 'width:50%;';
    const valueWidth = keepTogether ? 'white-space:nowrap;' : 'width:50%;';
    return [
      '<table style="width:100%;border-collapse:collapse;margin:2px 0"><tr>',
      `<td style="color:${COLOR_MUTED};${labelWidth}font-size:0.9em;vertical-align:middle">${escapeHtml(label)}</td>`,
      `<td style="text-align:right;${valueWidth}vertical-align:middle">${valueHtml}</td>`,
      '</tr></table>',
    ].join('');
  }

  const TRANSLATION$n = {
    terms: {
      heroic: 'Heldhaftige Inspirasie',
      classic: 'Inspirasie',
    },
    titles: {
      ready: 'InspirationTracker is gereed.',
      settings: 'InspirationTracker-instellings',
      help: 'InspirationTracker-opdragte',
      party: 'Groep se inspirasie',
      poolParty: 'Groep se {term}',
      pools: 'Puntepoele',
      yours: 'Jou karakters',
      status: 'InspirationTracker-status',
    },
    messages: {
      gained: '{name} het {term}!',
      spent: '{name} gebruik {term}.',
      spentBy: '{player} het {term} vir {name} gebruik.',
      spentSheet: '{name} het nie meer {term} nie (op die blad of teken verander).',
      restored: '{name} het {term} terug.',
      removed: '{term} van {name} weggeneem.',
      already: '{name} het reeds {term}.',
      none: '{name} het nie {term} nie.',
      busy: '{name} word nog bygewerk. Probeer oor ’n oomblik weer.',
      passOffer:
        '{name} het reeds {term} en kan dit nie twee keer hê nie. Gee dit aan ’n groeplid wat dit nie het nie, of laat dit gaan.',
      passNobody: 'Elke ander groeplid het dit reeds.',
      passAsked: 'Die spelers van {name} is gevra wie die {term} moet kry.',
      passed: '{from} gee {term} aan {to}!',
      passAlready: '{to} het dit reeds. Kies iemand anders.',
      declined: '{name} laat die ekstra {term} gaan.',
      undoAlready: '{name} het dit reeds weer.',
      synced: 'Blaaie gelees: {checked}. Met inspirasie: {inspired}.',
      migrated:
        'Instellings van weergawe 0.1 is behou: merker, spesiale effek en die tipe daarvan. Die nuwe instellings begin by hul verstekwaardes.',
      legacyCommand: 'Jou ou opdrag {command} werk steeds, net soos {main}.',
      macroHint:
        'Voer {command} uit om spelers ’n Gebruik-knoppie te gee. Dit voeg ’n tekenaksie vir almal by.',
      macro:
        'Die "{name}"-makro is gereed: spelers sien dit as ’n tekenaksie wanneer hulle ’n teken kies wat hulle beheer.',
      journal: 'Hulp- en Command Deck-uitdeelstukke is herbou.',
      readyHint: 'Tik {command} vir die kieslys, of maak die Command Deck-uitdeelstuk oop.',
    },
    pool: {
      gained: '{name} kry {amount} {term} ({before} → {after}).',
      spent: '{name} gebruik {amount} {term} ({before} → {after}).',
      boosted: '{name} gebruik {amount} {term} vir +{bonus} op die worp ({before} → {after}).',
      spentBy: '{player} het {amount} {term} vir {name} gebruik.',
      restored: '{name} het {amount} {term} terug ({before} → {after}).',
      removed: '{amount} {term} van {name} weggeneem ({before} → {after}).',
      none: '{name} het geen {term} nie.',
      short: '{name} het {have} {term}, en dit vereis {need}.',
      full: '{name} het reeds die meeste {term} wat toegelaat word ({max}).',
    },
    pools: {
      introFlag:
        'Opsporing is op die blad se inspirasieblokkie gestel. Stel dit op Puntepoel om "{name}" die poel te maak waarop Gee en Gebruik werk. Ander poele word met --pool gebruik.',
      introPool:
        'Gee, Gebruik en Versterk werk op "{name}". Ander poele word vanaf hul Groep-knoppie gebruik, of met --pool.',
      defaultLabel: '{name} (verstek)',
      name: 'Naam',
      source: 'Gehou in',
      cost: 'Punte per +1',
      max: 'Maksimum',
      marker: 'Merker',
      attribute: 'Eienskap wanneer die blad geen blokkie met hierdie naam het nie: {attribute}',
      partyTotal: 'Groeptotaal: {total} {term}.',
      keptBox: 'Blokkie op blad: {name}',
      keptAttribute: 'Eienskap: {attribute}',
      keptNote: '’n Eienskap word nie op die karakterblad gewys nie.',
    },
    prompts: {
      points: 'Punte',
      bonus: 'Bonus op die worp',
      max: 'Meeste punte toegelaat (0 vir geen limiet)',
    },
    errors: {
      unknownPool: 'Daar is geen poel genaamd "{value}" nie.',
      unknownPoolHint: 'Poele: {pools}.',
      badAmount: '"{value}" is nie ’n aantal punte nie.',
      badAmountHint: 'Gebruik ’n heelgetal van 1 tot 9999.',
      boostNoPool: 'Versterk gebruik punte uit ’n poel.',
      poolInvalid: '’n Poel kan nie "{value}" genoem word nie.',
      poolExists: 'Daar is reeds ’n poel genaamd "{value}".',
      poolFull: 'Daar is nie plek vir nog ’n poel nie.',
      poolNameHint:
        'Gebruik ’n naam van tot 40 letters, syfers en spasies wat geen ander poel het nie.',
      poolDefault: 'Die verstekpoel, "{name}", kan nie geskrap word nie. Dit kan hernoem word.',
      poolMarkerHint:
        'Kies ’n merker uit jou merkerstelle wat nie die een in die Merker-instelling is nie.',
      poolSetHint: 'Tik !inspiration pools om elke poel en sy instellings te sien.',
      denied: 'Jy kan dit nie vir {name} doen nie.',
      gmOnly: 'Slegs die GM kan daardie opdrag gebruik.',
      gmOnlyHint: 'Spelers kan spend, party en help gebruik.',
      spendOff: 'Die GM het gebruik deur spelers afgeskakel.',
      noCharacter: 'Hierdie tekens verteenwoordig nie ’n karakter nie: {names}.',
      nothingSelected: 'Kies eers ’n teken.',
      nothingSelectedHint:
        'Kies tekens wat karakters verteenwoordig, of voeg --ids met teken- of karakter-ID’s by.',
      writeFailed: 'Kon nie die blad van {name} verander nie.',
      offerGone: 'Daardie keuse is reeds gemaak, of het verval.',
      passInvalid: 'Kies ’n ander groeplid as die een wat dit het.',
      undoGone: 'Daardie gebruik is reeds ontdoen, of is te oud.',
      unknownMarker: 'Daar is geen tekenmerker genaamd "{value}" nie.',
      unknownMarkerHint:
        'Gebruik die Merker-knoppie in die instellings om een uit jou merkerstelle te kies.',
      badSetting: 'Kan {key} nie op "{value}" stel nie.',
      badSettingHint: 'Tik !inspiration set om elke instelling en sy keuses te sien.',
      unknownCommand: 'Onbekende opdrag: {command}.',
      unknownCommandHint: 'Tik !inspiration help vir die lys opdragte.',
    },
    menu: {
      selected: 'Gekose tekens',
      party: 'Groep',
      tools: 'Gereedskap',
      hint: 'Volledige instruksies is in die "{help}"-uitdeelstuk.',
      noSheet: 'geen blad',
      noneYours: 'Jy beheer geen karakters met ’n blad nie.',
      partyEmpty: 'Jy beheer geen groeplede nie.',
      partyEmptyGm:
        'Niemand is nog in die groep nie. Ken karakters aan spelers toe, of kies tekens en klik Voeg by groep.',
      partyCount: '{count} van {total} het {term}.',
    },
    buttons: {
      menu: 'Kieslys',
      give: 'Gee',
      remove: 'Verwyder',
      toggle: 'Wissel',
      spend: 'Gebruik',
      party: 'Groep',
      partyAdd: 'Voeg by groep',
      partyRemove: 'Verwyder uit groep',
      settings: 'Instellings',
      macro: 'Spelermakro',
      sync: 'Sinchroniseer',
      status: 'Status',
      help: 'Hulp',
      reset: 'Herstel instellings',
      refresh: 'Verfris',
      undo: 'Ontdoen',
      decline: 'Laat gaan',
      boost: 'Versterk',
      pools: 'Poele',
      addPool: 'Voeg poel by',
      deletePool: 'Skrap poel',
    },
    values: {
      on: 'Aan',
      off: 'Af',
      none: 'Geen',
      noLimit: 'Geen limiet',
      tracking: {
        flag: 'Blad se inspirasieblokkie',
        pool: 'Puntepoel',
      },
      source: {
        resource: 'Blad se hulpbronblokkie',
        attribute: 'Eienskap',
      },
      wording: {
        2014: 'Inspirasie (2014)',
        2024: 'Heldhaftige Inspirasie (2024)',
        auto: 'Van die blad',
      },
      announce: {
        public: 'Almal',
        gm: 'GM en eienaars',
        off: 'Niemand',
      },
    },
    settings: {
      language: {
        label: 'Taal',
        desc: 'Taal vir kieslyste, boodskappe en uitdeelstukke.',
      },
      tracking: {
        label: 'Opsporing',
        desc: 'Waarop Gee en Gebruik werk: die inspirasieblokkie op die D&D-blaaie, wat ’n karakter het of nie het nie, of ’n poel punte wat opbou en ’n paar op ’n slag gebruik word.',
      },
      marker: {
        label: 'Merker',
        desc: 'Tekenmerker wat gewys word terwyl ’n karakter inspirasie het. Pasgemaakte merkerstelle word ook gelys.',
      },
      wording: {
        label: 'Bewoording',
        desc: 'Noem dit Inspirasie of Heldhaftige Inspirasie. "Van die blad" gebruik die reëls wat op elke D&D 2024-blad gekies is, en Inspirasie op die 2014-blad.',
      },
      announce: {
        label: 'Aankondig',
        desc: 'Wie die kletsboodskap sien wanneer inspirasie verkry of gebruik word.',
      },
      fx: {
        label: 'Spesiale effek',
        desc: 'Speel ’n spesiale effek op die teken wanneer dit inspirasie kry.',
      },
      fxType: {
        label: 'Effektipe',
        desc: 'Watter effek om te speel, soos nova-holy, of die ID van ’n pasgemaakte effek.',
      },
      playerSpend: {
        label: 'Spelers kan gebruik',
        desc: 'Laat spelers inspirasie gebruik vir die karakters wat hulle beheer. Die GM word ingelig, met ’n Ontdoen-knoppie.',
      },
      playerOverview: {
        label: 'Spelers sien groep',
        desc: 'Laat spelers sien wie in die groep inspirasie het.',
      },
      passOn: {
        label: 'Gee aan (2024)',
        desc: 'Volgens die 2024-reëls mag ’n karakter wat Heldhaftige Inspirasie sou kry terwyl hy dit reeds het, dit aan ’n ander groeplid gee.',
      },
    },
    status: {
      version: 'Weergawe',
      beacon: 'D&D 2024-blaaie',
      legacy: '2014-blaaie',
      none: 'Karakters sonder inspirasieblokkie',
      rules2024: 'Gebruik 2024-reëls',
      party: 'Groeplede',
      tracking: 'Opsporing',
      pools: 'Poele',
      marker: 'Merker',
      fx: 'Spesiale effek',
      legacyCommand: 'Ou opdrag',
    },
    help: {
      menu: 'Wys die kieslys. Met tekens gekies, gee of neem dit inspirasie weg, soos weergawe 0.1 gedoen het.',
      give: 'Gee inspirasie aan die gekose karakters.',
      remove: 'Neem inspirasie van die gekose karakters weg, sonder om dit as gebruik te tel.',
      toggle:
        'Gee inspirasie aan gekose karakters sonder dit, en neem dit weg van dié wat dit het.',
      spend: 'Gebruik inspirasie vir die gekose karakters en lig die GM in.',
      party:
        'Wys wie in die groep inspirasie het, met knoppies om dit te gee, te verwyder of te gebruik.',
      partyEdit: 'Voeg die gekose karakters by die groep, of haal hulle uit.',
      ids: 'Werk op die gegewe teken- of karakter-ID’s in plaas van die gekose tekens.',
      points:
        'Met ’n puntepoel: gee, neem weg of gebruik soveel punte. Sonder ’n getal, 1. remove all neem elke punt weg.',
      boost:
        'Met ’n puntepoel: gebruik punte om daardie bonus by ’n worp te voeg, teen die poel se koste vir elke +1.',
      poolFlag: 'Werk op die genoemde poel in plaas van die verstekpoel.',
      pools: 'Wys die puntepoele en hul instellings.',
      poolEdit: 'Voeg ’n poel by, of skrap een. Die punte op die blaaie bly soos hulle is.',
      poolSet:
        'Verander ’n poel: sy naam, waar dit gehou word (resource of attribute), die punte wat elke +1 kos, die meeste punte toegelaat (0 vir geen limiet), of sy tekenmerker.',
      undo: 'Gee inspirasie terug wat gebruik is. Die ID kom uit die GM-boodskap oor die gebruik.',
      macro: 'Voeg die "Inspiration"-tekenaksie by, wat spelers klik om inspirasie te gebruik.',
      sync: 'Lees elke blad weer en stel die merkers reg.',
      set: 'Wys die instellings, of verander een.',
      reset: 'Stel elke instelling terug na sy verstek, behalwe die taal.',
      status: 'Wys die weergawe, die blaaie wat gevind is en die hoofinstellings.',
      journal: 'Herbou die Hulp- en Command Deck-uitdeelstukke.',
      help: 'Wys hierdie lys.',
    },
    helpPlayer: {
      menu: 'Wys jou karakters en of hulle inspirasie het.',
      spend: 'Gebruik inspirasie vir die gekose karakter.',
      boost: 'Gebruik punte uit ’n poel om daardie bonus by ’n worp te voeg.',
      party: 'Wys die groep, as die GM dit toelaat.',
      help: 'Wys hierdie lys.',
    },
    handout: {
      versionLabel: 'Weergawe',
      subtitle: 'Inspirasie, Heldhaftige Inspirasie en puntepoele vir enige spel',
      overview: {
        heading: 'Oorsig',
        body: 'InspirationTracker hou D&D-inspirasie op die karakterblad, die teken en die klets gelyk. Gee dit vanaf die kieslys, die blad of die tekenmerker, en elke teken vir daardie karakter wys die merker. Spelers kan dit met een klik gebruik, en die GM word ingelig, met ’n Ontdoen-knoppie. Dit werk met die D&D 2024-blad, waar dit Heldhaftige Inspirasie genoem word, en met die 2014 OGL-blad.',
      },
      quickStart: {
        heading: 'Vinnige begin',
        steps: [
          'Maak die Command Deck-uitdeelstuk oop, of tik !inspiration vir die kieslys.',
          'Kies ’n teken en klik Gee. Die karakter kry inspirasie en sy tekens wys die merker.',
          'Klik een keer op Spelermakro, sodat spelers ’n Inspiration-tekenaksie kry om dit te gebruik.',
          'Klik Groep om te sien wie inspirasie het.',
        ],
      },
      sheets: {
        heading: 'Karakterblaaie',
        colSheet: 'Blad',
        colWhere: 'Waar inspirasie gehou word',
        colSheet2014: 'D&D 5E by Roll20 (2014 OGL)',
        where2014: 'Die Inspiration-blokkie, eienskap "inspiration".',
        colSheet2024: 'D&D Fifth Edition (5E & 5.5E, 2024)',
        where2024:
          'Die Heroic Inspiration-blokkie, gelees en geskryf met getSheetItem en setSheetItem.',
        points: [
          'As die blokkie op ’n blad gemerk of skoongemaak word, word dit dadelik opgemerk: die merker volg, en skoonmaak tel as gebruik.',
          'Met Bewoording op "Van die blad" gebruik elke D&D 2024-karakter die reëls wat in sy bladinstellings gekies is: 2024-reëls sê Heldhaftige Inspirasie, 2014-reëls sê Inspirasie.',
          'Karakters met geen van die twee blaaie word met rus gelaat, dus word NPC-tekens nie verander nie.',
        ],
      },
      players: {
        heading: 'Spelers',
        points: [
          'Spelers kan inspirasie gebruik vir karakters wat hulle beheer: klik Gebruik in die klets, of die Inspiration-tekenaksie.',
          'Die GM kry ’n boodskap wat sê wie dit gebruik het, met ’n Ontdoen-knoppie.',
          'Om !inspiration te tik wys ’n speler sy karakters en of hulle inspirasie het.',
          'Skakel Spelers kan gebruik af om gebruik in die GM se hande te hou.',
        ],
      },
      passOn: {
        heading: 'Gee dit aan (2024-reëls)',
        points: [
          '’n Karakter kan nie twee keer Heldhaftige Inspirasie hê nie. Wanneer een wat dit het dit weer sou kry, word sy spelers gevra om dit aan ’n ander groeplid te gee wat dit nie het nie.',
          'Die keuse bied elke groeplid sonder Heldhaftige Inspirasie, en Laat gaan. Dit verval na ’n uur.',
          'Volgens die 2014-reëls word die GM net ingelig dat die karakter reeds Inspirasie het.',
          'Skakel Gee aan af om altyd eerder daardie boodskap te kry.',
        ],
      },
      party: {
        heading: 'Die groep',
        points: [
          'Die groep is elke karakter wat ’n speler beheer. Kies tekens en klik Voeg by groep of Verwyder uit groep om dit te verander.',
          'Die GM se oorsig het Gee-, Verwyder- en Gebruik-knoppies vir elke lid.',
          'Skakel Spelers sien groep aan om spelers ook die oorsig te laat sien. Hulle kry Gebruik-knoppies slegs vir hul eie karakters.',
        ],
      },
      pools: {
        heading: 'Puntepoele',
        points: [
          '’n Puntepoel is ’n getal wat opbou en ’n paar op ’n slag gebruik word: ’n poel inspirasiepunte, heldepunte, geluk, bennies en dies meer. Dit werk met enige karakterblad.',
          'Stel Opsporing op Puntepoel, en Gee, Verwyder en Gebruik werk op die verstekpoel en vra hoeveel punte. Die merker wys terwyl ’n karakter enige punte het.',
          'Versterk gebruik punte om ’n worp te verhoog: tik die bonus wat jy wil hê, en die poel se Punte per +1 bepaal die koste. Teen 2 punte per +1 kos ’n bonus van 4 dus 8 punte. Die Mod kondig die gebruik aan; voeg self die bonus by die worp.',
          '’n Gebruik word geweier wanneer die karakter nie genoeg punte het nie. Die GM word ingelig wie wat gebruik het, met ’n Ontdoen-knoppie.',
          'Gehou in "Blad se hulpbronblokkie" gebruik die hulpbronblokkie op die blad wat die poel se naam het, soos ’n Other Resource-blokkie genaamd Inspiration op die 2014 D&D-blad. Wanneer die blad geen blokkie met daardie naam het nie, of met "Eienskap", word die punte in ’n gewone eienskap gehou, soos inspiration_pool. Die D&D 2024-blad gebruik altyd die eienskap.',
          'Die groepkaart en ’n speler se eie kaart sê waar elke karakter se punte gehou word: die naam van die blokkie op die blad, of die eienskap. ’n Eienskap word nie op die karakterblad gewys nie.',
          'Om die getal met die hand op die blad te verander is in orde: die merker volg.',
          'Klik Poele om die verstekpoel te hernoem, sy koste en maksimum te stel, of nog poele by te voeg. Ander poele word vanaf hul Groep-knoppie gebruik, of deur --pool en die poel se naam by ’n opdrag te voeg.',
          'Bardic Inspiration werk as ’n poel van sy eie: klik Voeg poel by en noem dit Bardic Inspiration, stel sy Maksimum op 1 en kies sy Merker. Die GM gee 1 vanaf daardie poel se Groep-kaart wanneer die bard ’n dobbelsteen uitdeel, en die houer klik Gebruik wanneer hy dit gebruik. Die Mod merk wie ’n dobbelsteen hou; die speler gooi dit self.',
        ],
      },
      markers: {
        heading: 'Tekenmerkers',
        points: [
          'Kies die merker met die Merker-instelling. Roll20 se gekleurde kolletjies, die verstekmerkers en jou pasgemaakte merkerstelle word gelys.',
          'Om die merker met die hand, of met TokenMod, by ’n teken te voeg, gee die karakter inspirasie. Om dit af te haal, gebruik dit.',
          'Om die merker te verander, skuif dit dadelik op elke teken.',
          'Die D&D 2024-blad se eie toestandmerkers word nie aangebied nie, omdat die blad dit self stel.',
        ],
      },
      commands: {
        heading: 'Opdragte',
        intro:
          'Elke opdrag begin met !inspiration. Opdragte werk op die gekose tekens tensy --ids gegee word.',
        mods: 'Ander Mods kan ook hierdie opdragte stuur, byvoorbeeld vanaf ScriptCards. Ander Mods kan ook InspirationTracker.give, spend, remove en isInspired roep.',
        colCommand: 'Opdrag',
        colDesc: 'Wat dit doen',
      },
      settings: {
        heading: 'Instellings',
        intro:
          'Verander dit met die Instellings-knoppie, of tik !inspiration set <setting> <value>.',
        colKey: 'Instelling',
        colName: 'Naam',
        colDesc: 'Wat dit doen',
      },
      upgrading: {
        heading: 'Opgradering van 0.1',
        points: [
          'Die merker, spesiale effek en effektipe van weergawe 0.1 word behou.',
          'As jy in 0.1 jou eie opdrag gekies het, werk dit steeds saam met !inspiration.',
          '!inspiration met tekens gekies gee of neem steeds inspirasie weg.',
        ],
      },
      troubleshooting: {
        heading: 'Probleemoplossing',
        points: [
          'Wys die merker nie op ’n teken nie? Klik Sinchroniseer om elke blad weer te lees.',
          '’n Teken wat nie ’n karakter verteenwoordig nie, kan nie inspirasie hê nie. Koppel dit eers aan ’n karakter.',
          'Gebeur niks wanneer ’n speler Gebruik klik nie? Kyk of die karakter aan daardie speler toegeken is.',
          'Foute word na die API-konsole op die Mod Scripts-bladsy geskryf.',
        ],
      },
      languages: {
        heading: 'Tale',
        body: 'InspirationTracker is in die tale hieronder vertaal. Kies een met die Taal-instelling.',
        colCode: 'Kode',
        colName: 'Taal',
        colNative: 'Eie naam',
      },
      credits: {
        heading: 'Erkennings',
        original: 'Oorspronklike Mod deur',
        maintainer: 'Weergawe 1 onderhou deur',
        support: 'Rapporteer foute en idees op die Roll20 Mod-forum of op GitHub.',
      },
      footer: 'Knoppies vir elke aksie is in die "{deck}"-uitdeelstuk.',
    },
    deck: {
      subtitle: 'Command Deck',
      selectedDesc: 'Kies een of meer tekens, en klik dan.',
      partyDesc: 'Sien wie inspirasie het, en kies wie in die groep is.',
      poolsTitle: 'Puntepoel',
      poolsDesc: 'Met Opsporing op Puntepoel gestel: kies tekens, klik, en tik die getal.',
      toolsDesc: 'Kieslys, instellings, die spelermakro en hulp.',
      footer: 'Volledige instruksies is in die "{help}"-uitdeelstuk.',
    },
  };

  const TRANSLATION$m = {
    terms: {
      heroic: 'Inspiració heroica',
      classic: 'Inspiració',
    },
    titles: {
      ready: 'InspirationTracker està a punt.',
      settings: 'Configuració d’InspirationTracker',
      help: 'Ordres d’InspirationTracker',
      party: 'Inspiració del grup',
      poolParty: '{term} del grup',
      pools: 'Reserves de punts',
      yours: 'Els teus personatges',
      status: 'Estat d’InspirationTracker',
    },
    messages: {
      gained: '{name} té {term}!',
      spent: '{name} fa servir {term}.',
      spentBy: '{player} ha gastat {term} per a {name}.',
      spentSheet: '{name} ja no té {term} (canviat a la fitxa o al testimoni).',
      restored: '{name} torna a tenir {term}.',
      removed: 'S’ha tret {term} a {name}.',
      already: '{name} ja té {term}.',
      none: '{name} no té {term}.',
      busy: '{name} encara s’està actualitzant. Torna-ho a provar d’aquí a un moment.',
      passOffer:
        '{name} ja té {term} i no la pot tenir dues vegades. Dona-la a un membre del grup que no la tingui, o deixa-la anar.',
      passNobody: 'Tots els altres membres del grup ja la tenen.',
      passAsked: 'S’ha preguntat als jugadors de {name} qui ha de rebre la {term}.',
      passed: '{from} dona {term} a {to}!',
      passAlready: '{to} ja la té. Tria algú altre.',
      declined: '{name} deixa anar la {term} sobrant.',
      undoAlready: '{name} ja la torna a tenir.',
      synced: 'Fitxes llegides: {checked}. Amb inspiració: {inspired}.',
      migrated:
        'S’ha conservat la configuració de la versió 0.1: marcador, efecte especial i el seu tipus. Les opcions noves comencen amb els valors per defecte.',
      legacyCommand: 'La teva ordre antiga {command} encara funciona, igual que {main}.',
      macroHint:
        'Per donar als jugadors un botó Gasta, executa {command}. Afegeix una acció de testimoni per a tothom.',
      macro:
        'La macro "{name}" està a punt: els jugadors la veuen com a acció de testimoni quan seleccionen un testimoni que controlen.',
      journal: 'S’han refet els documents d’Ajuda i de Command Deck.',
      readyHint: 'Escriu {command} per al menú, o obre el document Command Deck.',
    },
    pool: {
      gained: '{name} guanya {amount} {term} ({before} → {after}).',
      spent: '{name} gasta {amount} {term} ({before} → {after}).',
      boosted: '{name} gasta {amount} {term} per a +{bonus} a la tirada ({before} → {after}).',
      spentBy: '{player} ha gastat {amount} {term} per a {name}.',
      restored: '{name} recupera {amount} {term} ({before} → {after}).',
      removed: 'S’han tret {amount} {term} a {name} ({before} → {after}).',
      none: '{name} no té {term}.',
      short: '{name} té {have} {term}, i en calen {need}.',
      full: '{name} ja ha arribat al màxim permès ({max}) per a {term}.',
    },
    pools: {
      introFlag:
        'El seguiment està posat a la casella d’inspiració de la fitxa. Posa’l a Reserva de punts perquè "{name}" sigui la reserva sobre la qual actuen Dona i Gasta. Les altres reserves es fan servir amb --pool.',
      introPool:
        'Dona, Gasta i Potencia actuen sobre "{name}". Les altres reserves es fan servir des del seu botó Grup, o amb --pool.',
      defaultLabel: '{name} (per defecte)',
      name: 'Nom',
      source: 'Es guarda a',
      cost: 'Punts per +1',
      max: 'Màxim',
      marker: 'Marcador',
      attribute: 'Atribut quan la fitxa no té cap casella amb aquest nom: {attribute}',
      partyTotal: 'Total del grup: {total} {term}.',
      keptBox: 'Casella de la fitxa: {name}',
      keptAttribute: 'Atribut: {attribute}',
      keptNote: 'Un atribut no es mostra a la fitxa del personatge.',
    },
    prompts: {
      points: 'Punts',
      bonus: 'Bonificació a la tirada',
      max: 'Màxim de punts permès (0 per a sense límit)',
    },
    errors: {
      unknownPool: 'No hi ha cap reserva anomenada "{value}".',
      unknownPoolHint: 'Reserves: {pools}.',
      badAmount: '"{value}" no és un nombre de punts.',
      badAmountHint: 'Fes servir un nombre enter de l’1 al 9999.',
      boostNoPool: 'Potencia gasta punts d’una reserva.',
      poolInvalid: 'Una reserva no es pot anomenar "{value}".',
      poolExists: 'Ja hi ha una reserva anomenada "{value}".',
      poolFull: 'No hi ha lloc per a cap altra reserva.',
      poolNameHint:
        'Fes servir un nom de fins a 40 lletres, xifres i espais que no tingui cap altra reserva.',
      poolDefault:
        'La reserva per defecte, "{name}", no es pot suprimir. Se li pot canviar el nom.',
      poolMarkerHint:
        'Tria un marcador dels teus jocs de marcadors que no sigui el de l’opció Marcador.',
      poolSetHint: 'Escriu !inspiration pools per veure totes les reserves i les seves opcions.',
      denied: 'No pots fer això per a {name}.',
      gmOnly: 'Només el GM pot fer servir aquesta ordre.',
      gmOnlyHint: 'Els jugadors poden fer servir spend, party i help.',
      spendOff: 'El GM ha desactivat que els jugadors gastin.',
      noCharacter: 'Aquests testimonis no representen cap personatge: {names}.',
      nothingSelected: 'Primer selecciona un testimoni.',
      nothingSelectedHint:
        'Selecciona testimonis que representin personatges, o afegeix --ids amb identificadors de testimoni o de personatge.',
      writeFailed: 'No s’ha pogut canviar la fitxa de {name}.',
      offerGone: 'Aquesta elecció ja s’ha fet, o ha caducat.',
      passInvalid: 'Tria un membre del grup diferent del que la té.',
      undoGone: 'Aquesta despesa ja s’ha desfet, o és massa antiga.',
      unknownMarker: 'No hi ha cap marcador de testimoni anomenat "{value}".',
      unknownMarkerHint:
        'Fes servir el botó Marcador de la configuració per triar-ne un dels teus jocs de marcadors.',
      badSetting: 'No es pot posar {key} a "{value}".',
      badSettingHint: 'Escriu !inspiration set per veure totes les opcions i els seus valors.',
      unknownCommand: 'Ordre desconeguda: {command}.',
      unknownCommandHint: 'Escriu !inspiration help per a la llista d’ordres.',
    },
    menu: {
      selected: 'Testimonis seleccionats',
      party: 'Grup',
      tools: 'Eines',
      hint: 'Les instruccions completes són al document "{help}".',
      noSheet: 'sense fitxa',
      noneYours: 'No controles cap personatge amb fitxa.',
      partyEmpty: 'No controles cap membre del grup.',
      partyEmptyGm:
        'Encara no hi ha ningú al grup. Assigna personatges als jugadors, o selecciona testimonis i fes clic a Afegeix al grup.',
      partyCount: '{count} de {total} tenen {term}.',
    },
    buttons: {
      menu: 'Menú',
      give: 'Dona',
      remove: 'Treu',
      toggle: 'Alterna',
      spend: 'Gasta',
      party: 'Grup',
      partyAdd: 'Afegeix al grup',
      partyRemove: 'Treu del grup',
      settings: 'Configuració',
      macro: 'Macro de jugador',
      sync: 'Sincronitza',
      status: 'Estat',
      help: 'Ajuda',
      reset: 'Restableix',
      refresh: 'Actualitza',
      undo: 'Desfés',
      decline: 'Deixa-la anar',
      boost: 'Potencia',
      pools: 'Reserves',
      addPool: 'Afegeix reserva',
      deletePool: 'Suprimeix reserva',
    },
    values: {
      on: 'Activat',
      off: 'Desactivat',
      none: 'Cap',
      noLimit: 'Sense límit',
      tracking: {
        flag: 'Casella d’inspiració de la fitxa',
        pool: 'Reserva de punts',
      },
      source: {
        resource: 'Casella de recurs de la fitxa',
        attribute: 'Atribut',
      },
      wording: {
        2014: 'Inspiració (2014)',
        2024: 'Inspiració heroica (2024)',
        auto: 'Segons la fitxa',
      },
      announce: {
        public: 'Tothom',
        gm: 'GM i propietaris',
        off: 'Ningú',
      },
    },
    settings: {
      language: {
        label: 'Idioma',
        desc: 'Idioma dels menús, missatges i documents.',
      },
      tracking: {
        label: 'Seguiment',
        desc: 'Sobre què actuen Dona i Gasta: la casella d’inspiració de les fitxes de D&D, que un personatge té o no té, o una reserva de punts que s’acumula i es gasta de mica en mica.',
      },
      marker: {
        label: 'Marcador',
        desc: 'Marcador de testimoni que es mostra mentre un personatge té inspiració. També s’hi inclouen els jocs de marcadors personalitzats.',
      },
      wording: {
        label: 'Terminologia',
        desc: 'Anomena-la Inspiració o Inspiració heroica. "Segons la fitxa" fa servir les regles triades a cada fitxa de D&D 2024, i Inspiració a la fitxa de 2014.',
      },
      announce: {
        label: 'Anunci',
        desc: 'Qui veu el missatge al xat quan s’obté o es gasta inspiració.',
      },
      fx: {
        label: 'Efecte especial',
        desc: 'Reprodueix un efecte especial al testimoni quan obté inspiració.',
      },
      fxType: {
        label: 'Tipus d’efecte',
        desc: 'Quin efecte reproduir, com ara nova-holy, o l’ID d’un efecte personalitzat.',
      },
      playerSpend: {
        label: 'Els jugadors poden gastar',
        desc: 'Permet que els jugadors gastin inspiració per als personatges que controlen. S’avisa el GM, amb un botó Desfés.',
      },
      playerOverview: {
        label: 'Els jugadors veuen el grup',
        desc: 'Permet que els jugadors vegin qui del grup té inspiració.',
      },
      passOn: {
        label: 'Passar-la (2024)',
        desc: 'Amb les regles de 2024, un personatge que obtindria Inspiració heroica mentre ja la té la pot donar a un altre membre del grup.',
      },
    },
    status: {
      version: 'Versió',
      beacon: 'Fitxes de D&D 2024',
      legacy: 'Fitxes de 2014',
      none: 'Personatges sense casella d’inspiració',
      rules2024: 'Amb regles de 2024',
      party: 'Membres del grup',
      tracking: 'Seguiment',
      pools: 'Reserves',
      marker: 'Marcador',
      fx: 'Efecte especial',
      legacyCommand: 'Ordre antiga',
    },
    help: {
      menu: 'Mostra el menú. Amb testimonis seleccionats, dona o treu inspiració, com feia la versió 0.1.',
      give: 'Dona inspiració als personatges seleccionats.',
      remove: 'Treu inspiració als personatges seleccionats, sense comptar-la com a gastada.',
      toggle:
        'Dona inspiració als personatges seleccionats que no en tenen, i la treu als que en tenen.',
      spend: 'Gasta inspiració per als personatges seleccionats i avisa el GM.',
      party: 'Mostra qui del grup té inspiració, amb botons per donar-la, treure-la o gastar-la.',
      partyEdit: 'Afegeix els personatges seleccionats al grup, o els en treu.',
      ids: 'Actua sobre els identificadors de testimoni o de personatge indicats en lloc dels testimonis seleccionats.',
      points:
        'Amb una reserva de punts: dona, treu o gasta aquest nombre de punts. Sense nombre, 1. remove all treu tots els punts.',
      boost:
        'Amb una reserva de punts: gasta punts per afegir aquesta bonificació a una tirada, al cost de la reserva per cada +1.',
      poolFlag: 'Actua sobre la reserva indicada en lloc de la reserva per defecte.',
      pools: 'Mostra les reserves de punts i les seves opcions.',
      poolEdit:
        'Afegeix una reserva, o en suprimeix una. Els punts de les fitxes es deixen tal com estan.',
      poolSet:
        'Canvia una reserva: el nom, on es guarda (resource o attribute), els punts que costa cada +1, el màxim de punts permès (0 per a sense límit), o el seu marcador de testimoni.',
      undo: 'Retorna la inspiració gastada. L’ID ve del missatge al GM sobre la despesa.',
      macro:
        'Afegeix l’acció de testimoni "Inspiration", que els jugadors fan clic per gastar inspiració.',
      sync: 'Torna a llegir totes les fitxes i posa bé els marcadors.',
      set: 'Mostra la configuració, o en canvia una opció.',
      reset: 'Torna totes les opcions al valor per defecte, excepte l’idioma.',
      status: 'Mostra la versió, les fitxes trobades i les opcions principals.',
      journal: 'Refà els documents d’Ajuda i de Command Deck.',
      help: 'Mostra aquesta llista.',
    },
    helpPlayer: {
      menu: 'Mostra els teus personatges i si tenen inspiració.',
      spend: 'Gasta inspiració per al personatge seleccionat.',
      boost: 'Gasta punts d’una reserva per afegir aquesta bonificació a una tirada.',
      party: 'Mostra el grup, si el GM ho permet.',
      help: 'Mostra aquesta llista.',
    },
    handout: {
      versionLabel: 'Versió',
      subtitle: 'Inspiració, Inspiració heroica i reserves de punts per a qualsevol joc',
      overview: {
        heading: 'Visió general',
        body: 'InspirationTracker manté sincronitzada la inspiració de D&D entre la fitxa de personatge, el testimoni i el xat. Dona-la des del menú, la fitxa o el marcador del testimoni, i tots els testimonis d’aquell personatge mostren el marcador. Els jugadors la poden gastar amb un clic, i s’avisa el GM, amb un botó Desfés. Funciona amb la fitxa de D&D 2024, on s’anomena Inspiració heroica, i amb la fitxa OGL de 2014.',
      },
      quickStart: {
        heading: 'Inici ràpid',
        steps: [
          'Obre el document Command Deck, o escriu !inspiration per al menú.',
          'Selecciona un testimoni i fes clic a Dona. El personatge obté inspiració i els seus testimonis mostren el marcador.',
          'Fes clic una vegada a Macro de jugador, perquè els jugadors tinguin una acció de testimoni Inspiration per gastar-la.',
          'Fes clic a Grup per veure qui té inspiració.',
        ],
      },
      sheets: {
        heading: 'Fitxes de personatge',
        colSheet: 'Fitxa',
        colWhere: 'On es guarda la inspiració',
        colSheet2014: 'D&D 5E by Roll20 (2014 OGL)',
        where2014: 'La casella Inspiration, atribut "inspiration".',
        colSheet2024: 'D&D Fifth Edition (5E & 5.5E, 2024)',
        where2024:
          'La casella Heroic Inspiration, llegida i escrita amb getSheetItem i setSheetItem.',
        points: [
          'Marcar o desmarcar la casella d’una fitxa es detecta immediatament: el marcador la segueix, i desmarcar-la compta com a gastar-la.',
          'Amb Terminologia a "Segons la fitxa", cada personatge de D&D 2024 fa servir les regles triades a la configuració de la seva fitxa: les regles de 2024 diuen Inspiració heroica, les de 2014 diuen Inspiració.',
          'Els personatges sense cap d’aquestes fitxes no es toquen, de manera que els testimonis de PNJ no canvien.',
        ],
      },
      players: {
        heading: 'Jugadors',
        points: [
          'Els jugadors poden gastar inspiració per als personatges que controlen: fes clic a Gasta al xat, o a l’acció de testimoni Inspiration.',
          'El GM rep un missatge que diu qui l’ha gastada, amb un botó Desfés.',
          'Escriure !inspiration mostra a un jugador els seus personatges i si tenen inspiració.',
          'Desactiva Els jugadors poden gastar per deixar la despesa en mans del GM.',
        ],
      },
      passOn: {
        heading: 'Passar-la (regles de 2024)',
        points: [
          'Un personatge no pot tenir Inspiració heroica dues vegades. Quan un que ja la té l’obtindria de nou, es demana als seus jugadors que la donin a un altre membre del grup que no la tingui.',
          'L’elecció ofereix tots els membres del grup sense Inspiració heroica, i Deixa-la anar. Caduca al cap d’una hora.',
          'Amb les regles de 2014, només s’avisa el GM que el personatge ja té Inspiració.',
          'Desactiva Passar-la per rebre sempre aquest missatge.',
        ],
      },
      party: {
        heading: 'El grup',
        points: [
          'El grup és cada personatge que controla un jugador. Selecciona testimonis i fes clic a Afegeix al grup o Treu del grup per canviar-lo.',
          'La visió general del GM té botons Dona, Treu i Gasta per a cada membre.',
          'Activa Els jugadors veuen el grup perquè els jugadors també vegin la visió general. Només tenen botons Gasta per als seus propis personatges.',
        ],
      },
      pools: {
        heading: 'Reserves de punts',
        points: [
          'Una reserva de punts és un nombre que s’acumula i es gasta de mica en mica: una reserva de punts d’inspiració, punts d’heroi, sort, bennies i similars. Funciona amb qualsevol fitxa de personatge.',
          'Posa Seguiment a Reserva de punts, i Dona, Treu i Gasta actuen sobre la reserva per defecte i demanen quants punts. El marcador es mostra mentre un personatge té algun punt.',
          'Potencia gasta punts per apujar una tirada: escriu la bonificació que vols, i l’opció Punts per +1 de la reserva en decideix el cost. A 2 punts per +1, una bonificació de 4 costa 8 punts. El Mod anuncia la despesa; afegeix tu mateix la bonificació a la tirada.',
          'Una despesa es rebutja quan el personatge no té prou punts. S’avisa el GM de qui ha gastat què, amb un botó Desfés.',
          'Es guarda a "Casella de recurs de la fitxa" fa servir la casella de recurs de la fitxa que té el nom de la reserva, com ara una casella Other Resource anomenada Inspiration a la fitxa de D&D de 2014. Quan la fitxa no té cap casella amb aquest nom, o amb "Atribut", els punts es guarden en un atribut senzill, com ara inspiration_pool. La fitxa de D&D 2024 sempre fa servir l’atribut.',
          "La targeta del grup i la targeta pròpia d'un jugador diuen on es guarden els punts de cada personatge: el nom de la casella de la fitxa, o l'atribut. Un atribut no es mostra a la fitxa del personatge.",
          'Canviar el nombre a la fitxa a mà no és cap problema: el marcador el segueix.',
          'Fes clic a Reserves per canviar el nom de la reserva per defecte, posar-ne el cost i el màxim, o afegir més reserves. Les altres reserves es fan servir des del seu botó Grup, o afegint --pool i el nom de la reserva a una ordre.',
          "Bardic Inspiration funciona com una reserva pròpia: fes clic a Afegeix reserva i anomena-la Bardic Inspiration, posa-hi el Màxim a 1 i tria'n el Marcador. El GM dona 1 des de la targeta Grup d'aquesta reserva quan el bard reparteix un dau, i qui el té fa clic a Gasta quan el fa servir. El Mod marca qui té un dau; el jugador el tira.",
        ],
      },
      markers: {
        heading: 'Marcadors de testimoni',
        points: [
          'Tria el marcador amb l’opció Marcador. S’hi mostren els punts de colors de Roll20, els marcadors per defecte i els teus jocs de marcadors personalitzats.',
          'Afegir el marcador a un testimoni a mà, o amb TokenMod, dona inspiració al personatge. Treure’l la gasta.',
          'Canviar el marcador el mou a tots els testimonis immediatament.',
          'Els marcadors d’estat propis de la fitxa de D&D 2024 no s’ofereixen, perquè la fitxa ja els posa ella mateixa.',
        ],
      },
      commands: {
        heading: 'Ordres',
        intro:
          'Totes les ordres comencen amb !inspiration. Les ordres actuen sobre els testimonis seleccionats tret que s’indiqui --ids.',
        mods: 'Altres Mods també poden enviar aquestes ordres, per exemple des de ScriptCards. Altres Mods també poden cridar InspirationTracker.give, spend, remove i isInspired.',
        colCommand: 'Ordre',
        colDesc: 'Què fa',
      },
      settings: {
        heading: 'Configuració',
        intro: 'Canvia-les amb el botó Configuració, o escriu !inspiration set <setting> <value>.',
        colKey: 'Opció',
        colName: 'Nom',
        colDesc: 'Què fa',
      },
      upgrading: {
        heading: 'Actualitzar des de la 0.1',
        points: [
          'Es conserven el marcador, l’efecte especial i el tipus d’efecte de la versió 0.1.',
          'Si a la 0.1 havies triat una ordre pròpia, encara funciona al costat de !inspiration.',
          '!inspiration amb testimonis seleccionats encara dona o treu inspiració.',
        ],
      },
      troubleshooting: {
        heading: 'Resolució de problemes',
        points: [
          'El marcador no apareix en un testimoni? Fes clic a Sincronitza per tornar a llegir totes les fitxes.',
          'Un testimoni que no representa cap personatge no pot tenir inspiració. Primer vincula’l a un personatge.',
          'No passa res quan un jugador fa clic a Gasta? Comprova que el personatge estigui assignat a aquell jugador.',
          'Els errors s’escriuen a la consola de l’API, a la pàgina Mod Scripts.',
        ],
      },
      languages: {
        heading: 'Idiomes',
        body: 'InspirationTracker està traduït als idiomes següents. Tria’n un amb l’opció Idioma.',
        colCode: 'Codi',
        colName: 'Idioma',
        colNative: 'Nom original',
      },
      credits: {
        heading: 'Crèdits',
        original: 'Mod original de',
        maintainer: 'Versió 1 mantinguda per',
        support: 'Informa d’errors i idees al fòrum de Mods de Roll20 o a GitHub.',
      },
      footer: 'Els botons per a cada acció són al document "{deck}".',
    },
    deck: {
      subtitle: 'Command Deck',
      selectedDesc: 'Selecciona un o més testimonis i després fes clic.',
      partyDesc: 'Mira qui té inspiració, i tria qui és al grup.',
      poolsTitle: 'Reserva de punts',
      poolsDesc:
        'Amb Seguiment a Reserva de punts: selecciona testimonis, fes clic i escriu el nombre.',
      toolsDesc: 'Menú, configuració, la macro de jugador i ajuda.',
      footer: 'Les instruccions completes són al document "{help}".',
    },
  };

  const TRANSLATION$l = {
    terms: {
      heroic: '英雄激勵',
      classic: '激勵',
    },
    titles: {
      ready: 'InspirationTracker 已就緒。',
      settings: 'InspirationTracker 設定',
      help: 'InspirationTracker 指令',
      party: '隊伍激勵',
      poolParty: '隊伍{term}',
      pools: '點數池',
      yours: '你的角色',
      status: 'InspirationTracker 狀態報告',
    },
    messages: {
      gained: '{name} 獲得了{term}！',
      spent: '{name} 使用了{term}。',
      spentBy: '{player} 替 {name} 花費了{term}。',
      spentSheet: '{name} 已不再擁有{term}（在角色卡或棋子上變更）。',
      restored: '{name} 重新獲得了{term}。',
      removed: '已移除 {name} 的{term}。',
      already: '{name} 已經擁有{term}。',
      none: '{name} 沒有{term}。',
      busy: '{name} 仍在更新中，請稍後再試。',
      passOffer: '{name} 已經擁有{term}，無法同時擁有兩份。請將它交給沒有的隊伍成員，或放棄它。',
      passNobody: '其他所有隊伍成員都已經擁有了。',
      passAsked: '已詢問 {name} 的玩家要將{term}交給誰。',
      passed: '{from} 將{term}交給了 {to}！',
      passAlready: '{to} 已經擁有了，請選擇其他人。',
      declined: '{name} 放棄了多出的{term}。',
      undoAlready: '{name} 已經重新擁有了。',
      synced: '已讀取角色卡：{checked}。擁有激勵：{inspired}。',
      migrated: '已保留 0.1 版的設定：標記、特效及其類型。新設定從預設值開始。',
      legacyCommand: '你的舊指令 {command} 仍可使用，{main} 也一樣。',
      macroHint: '若要給玩家一個「花費」按鈕，請執行 {command}。它會為所有人新增一個棋子動作。',
      macro: '巨集「{name}」已就緒：玩家選取自己控制的棋子時，會看到它作為棋子動作。',
      journal: '已重建說明與指令面板講義。',
      readyHint: '輸入 {command} 開啟選單，或打開指令面板講義。',
    },
    pool: {
      gained: '{name} 獲得了 {amount} 點{term}（{before} → {after}）。',
      spent: '{name} 花費了 {amount} 點{term}（{before} → {after}）。',
      boosted: '{name} 花費了 {amount} 點{term}，讓擲骰 +{bonus}（{before} → {after}）。',
      spentBy: '{player} 替 {name} 花費了 {amount} 點{term}。',
      restored: '{name} 拿回了 {amount} 點{term}（{before} → {after}）。',
      removed: '已移除 {name} 的 {amount} 點{term}（{before} → {after}）。',
      none: '{name} 沒有{term}。',
      short: '{name} 只有 {have} 點{term}，但這需要 {need} 點。',
      full: '{name} 的{term}已達上限（{max}）。',
    },
    pools: {
      introFlag:
        '「追蹤方式」目前設為角色卡激勵核取方塊。將它設為「點數池」，「給予」與「花費」就會作用於「{name}」。其他點數池請搭配 --pool 使用。',
      introPool:
        '「給予」、「花費」與「加值」會作用於「{name}」。其他點數池可從各自的「隊伍」按鈕使用，或搭配 --pool。',
      defaultLabel: '{name}（預設）',
      name: '名稱',
      source: '儲存位置',
      cost: '每 +1 所需點數',
      max: '上限',
      marker: '標記',
      attribute: '角色卡上沒有同名欄位時使用的屬性：{attribute}',
      partyTotal: '隊伍合計：{total} 點{term}。',
      keptBox: '角色卡欄位：{name}',
      keptAttribute: '屬性：{attribute}',
      keptNote: '屬性不會顯示在角色卡上。',
    },
    prompts: {
      points: '點數',
      bonus: '擲骰加值',
      max: '點數上限（0 表示無上限）',
    },
    errors: {
      unknownPool: '沒有名為「{value}」的點數池。',
      unknownPoolHint: '點數池：{pools}。',
      badAmount: '「{value}」不是有效的點數。',
      badAmountHint: '請使用 1 到 9999 之間的整數。',
      boostNoPool: '「加值」需要從點數池花費點數。',
      poolInvalid: '點數池不能命名為「{value}」。',
      poolExists: '已經有名為「{value}」的點數池。',
      poolFull: '沒有空間再新增點數池了。',
      poolNameHint: '請使用最多 40 個字母、數字和空格組成，且未被其他點數池使用的名稱。',
      poolDefault: '預設點數池「{name}」無法刪除，但可以重新命名。',
      poolMarkerHint: '請從你的標記組中挑選一個與「標記」設定不同的標記。',
      poolSetHint: '輸入 !inspiration pools 以查看所有點數池及其設定。',
      denied: '你無法對 {name} 執行此操作。',
      gmOnly: '只有 GM 可以使用此指令。',
      gmOnlyHint: '玩家可以使用 spend、party 和 help。',
      spendOff: 'GM 已關閉玩家花費激勵的功能。',
      noCharacter: '這些棋子未代表任何角色：{names}。',
      nothingSelected: '請先選取一個棋子。',
      nothingSelectedHint: '請選取代表角色的棋子，或加上 --ids 並提供棋子或角色 ID。',
      writeFailed: '無法變更 {name} 的角色卡。',
      offerGone: '此選擇已經做出，或已過期。',
      passInvalid: '請選擇擁有者以外的隊伍成員。',
      undoGone: '此次花費已被復原，或時間過久。',
      unknownMarker: '沒有名為「{value}」的棋子標記。',
      unknownMarkerHint: '請使用設定中的「標記」按鈕，從你的標記組中挑選一個。',
      badSetting: '無法將 {key} 設為「{value}」。',
      badSettingHint: '輸入 !inspiration set 以查看所有設定及其選項。',
      unknownCommand: '未知的指令：{command}。',
      unknownCommandHint: '輸入 !inspiration help 以查看指令列表。',
    },
    menu: {
      selected: '已選取的棋子',
      party: '隊伍',
      tools: '工具',
      hint: '完整說明請見「{help}」講義。',
      noSheet: '無角色卡',
      noneYours: '你沒有控制任何具有角色卡的角色。',
      partyEmpty: '你沒有控制任何隊伍成員。',
      partyEmptyGm: '隊伍中還沒有人。請將角色指派給玩家，或選取棋子後點擊「加入隊伍」。',
      partyCount: '{total} 人中有 {count} 人擁有{term}。',
    },
    buttons: {
      menu: '選單',
      give: '給予',
      remove: '移除',
      toggle: '切換',
      spend: '花費',
      party: '隊伍',
      partyAdd: '加入隊伍',
      partyRemove: '移出隊伍',
      settings: '設定',
      macro: '玩家巨集',
      sync: '同步',
      status: '狀態',
      help: '說明',
      reset: '重設設定',
      refresh: '重新整理',
      undo: '復原',
      decline: '放棄',
      boost: '加值',
      pools: '點數池',
      addPool: '新增點數池',
      deletePool: '刪除點數池',
    },
    values: {
      on: '開啟',
      off: '關閉',
      none: '無',
      noLimit: '無上限',
      tracking: {
        flag: '角色卡激勵核取方塊',
        pool: '點數池',
      },
      source: {
        resource: '角色卡資源欄位',
        attribute: '屬性',
      },
      wording: {
        2014: '激勵（2014）',
        2024: '英雄激勵（2024）',
        auto: '依角色卡',
      },
      announce: {
        public: '所有人',
        gm: 'GM 與擁有者',
        off: '無人',
      },
    },
    settings: {
      language: {
        label: '語言',
        desc: '選單、訊息與講義所用的語言。',
      },
      tracking: {
        label: '追蹤方式',
        desc: '「給予」與「花費」作用的對象：D&D 角色卡上的激勵核取方塊（角色只有擁有或沒有兩種狀態），或是可以累積並一次花費幾點的點數池。',
      },
      marker: {
        label: '標記',
        desc: '角色擁有激勵時顯示的棋子標記。自訂標記組也會列出。',
      },
      wording: {
        label: '用語',
        desc: '稱為激勵或英雄激勵。「依角色卡」會採用每張 D&D 2024 角色卡上選擇的規則，2014 角色卡則使用激勵。',
      },
      announce: {
        label: '公告',
        desc: '獲得或花費激勵時，誰能看到聊天訊息。',
      },
      fx: {
        label: '特效',
        desc: '棋子獲得激勵時在其上播放特效。',
      },
      fxType: {
        label: '特效類型',
        desc: '要播放的特效，例如 nova-holy，或自訂特效的 ID。',
      },
      playerSpend: {
        label: '玩家可花費',
        desc: '允許玩家為自己控制的角色花費激勵。GM 會收到通知，並附有「復原」按鈕。',
      },
      playerOverview: {
        label: '玩家可見隊伍',
        desc: '允許玩家查看隊伍中誰擁有激勵。',
      },
      passOn: {
        label: '轉交（2024）',
        desc: '依 2024 規則，已擁有英雄激勵的角色若再次獲得，可以將其交給另一位隊伍成員。',
      },
    },
    status: {
      version: '版本',
      beacon: 'D&D 2024 角色卡',
      legacy: '2014 角色卡',
      none: '沒有激勵欄位的角色',
      rules2024: '使用 2024 規則',
      party: '隊伍成員',
      tracking: '追蹤方式',
      pools: '點數池',
      marker: '標記',
      fx: '特效',
      legacyCommand: '舊指令',
    },
    help: {
      menu: '顯示選單。選取棋子時，會像 0.1 版一樣給予或移除激勵。',
      give: '給予所選角色激勵。',
      remove: '移除所選角色的激勵，不計為花費。',
      toggle: '給予沒有激勵的所選角色激勵，並移除已擁有者的激勵。',
      spend: '為所選角色花費激勵並通知 GM。',
      party: '顯示隊伍中誰擁有激勵，並附有給予、移除或花費的按鈕。',
      partyEdit: '將所選角色加入隊伍，或將其移出。',
      ids: '改為作用於指定的棋子或角色 ID，而非所選棋子。',
      points:
        '使用點數池時：給予、移除或花費指定的點數。未指定數字時為 1。remove all 會移除所有點數。',
      boost: '使用點數池時：花費點數為擲骰加上指定的加值，每 +1 的費用依點數池設定。',
      poolFlag: '改為作用於指定名稱的點數池，而非預設點數池。',
      pools: '顯示點數池及其設定。',
      poolEdit: '新增或刪除點數池。角色卡上的點數會保持原樣。',
      poolSet:
        '變更點數池：名稱、儲存位置（resource 或 attribute）、每 +1 所需點數、點數上限（0 表示無上限），或其棋子標記。',
      undo: '退還已花費的激勵。ID 來自發給 GM 的花費訊息。',
      macro: '新增「Inspiration」棋子動作，玩家點擊即可花費激勵。',
      sync: '重新讀取所有角色卡並校正標記。',
      set: '顯示設定，或變更其中一項。',
      reset: '將所有設定恢復為預設值，語言除外。',
      status: '顯示版本、找到的角色卡及主要設定。',
      journal: '重建說明與指令面板講義。',
      help: '顯示此列表。',
    },
    helpPlayer: {
      menu: '顯示你的角色以及他們是否擁有激勵。',
      spend: '為所選角色花費激勵。',
      boost: '從點數池花費點數，為擲骰加上指定的加值。',
      party: '顯示隊伍（若 GM 允許）。',
      help: '顯示此列表。',
    },
    handout: {
      versionLabel: '版本',
      subtitle: '適用於任何遊戲的激勵、英雄激勵與點數池',
      overview: {
        heading: '概覽',
        body: 'InspirationTracker 讓角色卡、棋子與聊天中的 D&D 激勵保持一致。從選單、角色卡或棋子標記給予激勵，該角色的所有棋子都會顯示標記。玩家只需點擊一次即可花費，GM 會收到通知，並附有「復原」按鈕。它支援 D&D 2024 角色卡（其中稱為英雄激勵）以及 2014 OGL 角色卡。',
      },
      quickStart: {
        heading: '快速入門',
        steps: [
          '打開指令面板講義，或輸入 !inspiration 開啟選單。',
          '選取一個棋子並點擊「給予」。角色獲得激勵，其棋子會顯示標記。',
          '點擊一次「玩家巨集」，讓玩家獲得「Inspiration」棋子動作來花費激勵。',
          '點擊「隊伍」查看誰擁有激勵。',
        ],
      },
      sheets: {
        heading: '角色卡',
        colSheet: '角色卡',
        colWhere: '激勵儲存位置',
        colSheet2014: 'D&D 5E by Roll20 (2014 OGL)',
        where2014: '激勵核取方塊，屬性 "inspiration"。',
        colSheet2024: 'D&D Fifth Edition (5E & 5.5E, 2024)',
        where2024: '英雄激勵核取方塊，透過 getSheetItem 與 setSheetItem 讀取和寫入。',
        points: [
          '在角色卡上勾選或取消勾選會立即被偵測：標記隨之變更，取消勾選即視為花費。',
          '當「用語」設為「依角色卡」時，每個 D&D 2024 角色會採用其角色卡設定中選擇的規則：2024 規則稱為英雄激勵，2014 規則稱為激勵。',
          '沒有上述任一角色卡的角色不會受影響，因此 NPC 棋子不會被變更。',
        ],
      },
      players: {
        heading: '玩家',
        points: [
          '玩家可以為自己控制的角色花費激勵：在聊天中點擊「花費」，或點擊「Inspiration」棋子動作。',
          'GM 會收到一則說明是誰花費的訊息，並附有「復原」按鈕。',
          '玩家輸入 !inspiration 會看到自己的角色以及他們是否擁有激勵。',
          '關閉「玩家可花費」，即可讓花費權只掌握在 GM 手中。',
        ],
      },
      passOn: {
        heading: '轉交（2024 規則）',
        points: [
          '角色無法同時擁有兩份英雄激勵。已擁有者再次獲得時，會詢問其玩家是否要交給另一位沒有的隊伍成員。',
          '選項包含所有沒有英雄激勵的隊伍成員，以及「放棄」。一小時後過期。',
          '依 2014 規則，只會通知 GM 該角色已擁有激勵。',
          '關閉「轉交」即可一律只收到該訊息。',
        ],
      },
      party: {
        heading: '隊伍',
        points: [
          '隊伍包含所有由玩家控制的角色。選取棋子並點擊「加入隊伍」或「移出隊伍」即可變更。',
          'GM 的總覽中每位成員都有「給予」、「移除」和「花費」按鈕。',
          '開啟「玩家可見隊伍」，讓玩家也能看到總覽。他們只會看到自己角色的「花費」按鈕。',
        ],
      },
      pools: {
        heading: '點數池',
        points: [
          '點數池是一個可以累積並一次花費幾點的數字：激勵點數、英雄點數、幸運、bennies 等等。它適用於任何角色卡。',
          '將「追蹤方式」設為「點數池」後，「給予」、「移除」與「花費」會作用於預設點數池，並詢問點數。只要角色還有點數，就會顯示標記。',
          '「加值」會花費點數來提高擲骰：輸入想要的加值，費用由點數池的「每 +1 所需點數」決定。若每 +1 需要 2 點，加值 4 就要花費 8 點。Mod 會公告這次花費；加值請自行加到擲骰上。',
          '角色的點數不足時，花費會被拒絕。GM 會收到誰花費了多少的通知，並附有「復原」按鈕。',
          '儲存位置設為「角色卡資源欄位」時，會使用角色卡上與點數池同名的資源欄位，例如 2014 版 D&D 角色卡上名為 Inspiration 的 Other Resource 欄位。若角色卡上沒有同名欄位，或設為「屬性」，點數會存放在一般屬性中，例如 inspiration_pool。D&D 2024 角色卡一律使用屬性。',
          '隊伍卡片和玩家自己的卡片會標示每個角色的點數存放位置：角色卡欄位的名稱，或屬性。屬性不會顯示在角色卡上。',
          '直接在角色卡上手動修改數字也沒問題：標記會隨之更新。',
          '點擊「點數池」可重新命名預設點數池、設定其費用與上限，或新增更多點數池。其他點數池可從各自的「隊伍」按鈕使用，或在指令中加上 --pool 與點數池名稱。',
          'Bardic Inspiration 可以當作獨立的點數池使用：點擊「新增點數池」並命名為 Bardic Inspiration，將「上限」設為 1，並選擇它的「標記」。吟遊詩人給出骰子時，GM 從該點數池的「隊伍」卡片給予 1 點，持有者使用時點擊「花費」。Mod 只標示誰持有骰子；骰子由玩家自己擲。',
        ],
      },
      markers: {
        heading: '棋子標記',
        points: [
          '使用「標記」設定選擇標記。會列出 Roll20 的彩色圓點、預設標記以及你的自訂標記組。',
          '手動或透過 TokenMod 為棋子加上標記，會給予角色激勵。移除標記則會花費激勵。',
          '變更標記會立即在所有棋子上更換。',
          'D&D 2024 角色卡自己的狀態標記不會列出，因為角色卡會自行設定它們。',
        ],
      },
      commands: {
        heading: '指令',
        intro: '所有指令都以 !inspiration 開頭。除非指定 --ids，否則指令會作用於所選棋子。',
        mods: '其他 Mods 也可以傳送這些指令，例如從 ScriptCards。其他 Mods 也可以呼叫 InspirationTracker.give、spend、remove 和 isInspired。',
        colCommand: '指令',
        colDesc: '功能',
      },
      settings: {
        heading: '設定',
        intro: '使用「設定」按鈕變更，或輸入 !inspiration set <setting> <value>。',
        colKey: '設定',
        colName: '名稱',
        colDesc: '功能',
      },
      upgrading: {
        heading: '從 0.1 升級',
        points: [
          '保留 0.1 版的標記、特效與特效類型。',
          '若你在 0.1 中選擇了自己的指令，它仍可與 !inspiration 並用。',
          '選取棋子時使用 !inspiration 仍會給予或移除激勵。',
        ],
      },
      troubleshooting: {
        heading: '疑難排解',
        points: [
          '棋子上沒有顯示標記？點擊「同步」重新讀取所有角色卡。',
          '未代表角色的棋子無法擁有激勵。請先將它連結到角色。',
          '玩家點擊「花費」時沒有反應？請確認該角色已指派給該玩家。',
          '錯誤會寫入 Mod Scripts 頁面的 API 主控台。',
        ],
      },
      languages: {
        heading: '語言',
        body: 'InspirationTracker 已翻譯為以下語言。請使用「語言」設定選擇。',
        colCode: '代碼',
        colName: '語言',
        colNative: '原文名稱',
      },
      credits: {
        heading: '致謝',
        original: '原始 Mod 作者',
        maintainer: '第 1 版維護者',
        support: '請在 Roll20 Mod 論壇或 GitHub 回報錯誤與想法。',
      },
      footer: '所有操作的按鈕都在「{deck}」講義中。',
    },
    deck: {
      subtitle: '指令面板',
      selectedDesc: '選取一個或多個棋子，然後點擊。',
      partyDesc: '查看誰擁有激勵，並選擇隊伍成員。',
      poolsTitle: '點數池',
      poolsDesc: '「追蹤方式」設為「點數池」時：選取棋子、點擊，然後輸入數字。',
      toolsDesc: '選單、設定、玩家巨集與說明。',
      footer: '完整說明請見「{help}」講義。',
    },
  };

  const TRANSLATION$k = {
    terms: {
      heroic: 'Hrdinská inspirace',
      classic: 'Inspirace',
    },
    titles: {
      ready: 'InspirationTracker je připraven.',
      settings: 'Nastavení InspirationTracker',
      help: 'Příkazy InspirationTracker',
      party: 'Inspirace družiny',
      poolParty: 'Družina: {term}',
      pools: 'Zásoby bodů',
      yours: 'Tvoje postavy',
      status: 'Stav InspirationTracker',
    },
    messages: {
      gained: '{name} získává: {term}!',
      spent: '{name} využívá: {term}.',
      spentBy: '{player} využil(a) pro {name}: {term}.',
      spentSheet: '{name} už nemá: {term} (změněno v deníku nebo na tokenu).',
      restored: '{name} má zpět: {term}.',
      removed: '{name} přichází o: {term}.',
      already: '{name} už má: {term}.',
      none: '{name} nemá: {term}.',
      busy: '{name} se stále aktualizuje. Zkus to za chvíli znovu.',
      passOffer:
        '{name} už má: {term}, a nemůže ji mít dvakrát. Předej ji členovi družiny, který ji nemá, nebo se jí vzdej.',
      passNobody: 'Všichni ostatní členové družiny ji už mají.',
      passAsked: 'Hráči postavy {name} byli dotázáni, kdo má dostat: {term}.',
      passed: '{from} předává {to}: {term}!',
      passAlready: '{to} ji už má. Vyber někoho jiného.',
      declined: '{name} se vzdává nadbytečné inspirace ({term}).',
      undoAlready: '{name} ji už zase má.',
      synced: 'Načtené deníky: {checked}. S inspirací: {inspired}.',
      migrated:
        'Nastavení z verze 0.1 byla zachována: značka, speciální efekt a jeho typ. Nová nastavení začínají na výchozích hodnotách.',
      legacyCommand: 'Tvůj starý příkaz {command} stále funguje, stejně jako {main}.',
      macroHint:
        'Chceš-li dát hráčům tlačítko Využít, spusť {command}. Přidá akci tokenu pro všechny.',
      macro:
        'Makro „{name}“ je připraveno: hráči ho vidí jako akci tokenu, když vyberou token, který ovládají.',
      journal: 'Dokumenty Nápověda a Command Deck byly znovu vytvořeny.',
      readyHint: 'Napiš {command} pro nabídku, nebo otevři dokument Command Deck.',
    },
    pool: {
      gained: '{term}: {name} získává {amount} ({before} → {after}).',
      spent: '{term}: {name} využívá {amount} ({before} → {after}).',
      boosted: '{term}: {name} využívá {amount} za +{bonus} k hodu ({before} → {after}).',
      spentBy: '{term}: {player} využil(a) {amount} pro {name}.',
      restored: '{term}: {name} má {amount} zpět ({before} → {after}).',
      removed: '{term}: {name} přichází o {amount} ({before} → {after}).',
      none: '{term}: {name} nemá žádné body.',
      short: '{term}: {name} má {have}, ale je potřeba {need}.',
      full: '{term}: {name} už má povolené maximum ({max}).',
    },
    pools: {
      introFlag:
        'Sledování je nastaveno na políčko inspirace v deníku. Nastav ho na Zásoba bodů a „{name}“ bude zásobou, se kterou pracují Dát a Využít. Ostatní zásoby se používají pomocí --pool.',
      introPool:
        'Dát, Využít a Posílit pracují se zásobou „{name}“. Ostatní zásoby se používají jejich tlačítkem Družina, nebo pomocí --pool.',
      defaultLabel: '{name} (výchozí)',
      name: 'Název',
      source: 'Uloženo v',
      cost: 'Body za +1',
      max: 'Maximum',
      marker: 'Značka',
      attribute: 'Atribut, když deník nemá políčko s tímto názvem: {attribute}',
      partyTotal: 'Družina celkem: {total} ({term}).',
      keptBox: 'Políčko v deníku: {name}',
      keptAttribute: 'Atribut: {attribute}',
      keptNote: 'Atribut se v deníku postavy nezobrazuje.',
    },
    prompts: {
      points: 'Body',
      bonus: 'Bonus k hodu',
      max: 'Nejvyšší povolený počet bodů (0 = bez omezení)',
    },
    errors: {
      unknownPool: 'Žádná zásoba „{value}“ neexistuje.',
      unknownPoolHint: 'Zásoby: {pools}.',
      badAmount: '„{value}“ není počet bodů.',
      badAmountHint: 'Použij celé číslo od 1 do 9999.',
      boostNoPool: 'Posílit utrácí body ze zásoby.',
      poolInvalid: 'Zásoba se nemůže jmenovat „{value}“.',
      poolExists: 'Zásoba „{value}“ už existuje.',
      poolFull: 'Na další zásobu už není místo.',
      poolNameHint:
        'Použij název o nejvýše 40 písmenech, číslicích a mezerách, který nemá žádná jiná zásoba.',
      poolDefault: 'Výchozí zásobu „{name}“ nelze smazat. Lze ji přejmenovat.',
      poolMarkerHint: 'Vyber ze svých sad značek značku, která není v nastavení Značka.',
      poolSetHint: 'Napiš !inspiration pools a uvidíš všechny zásoby a jejich nastavení.',
      denied: 'Tohle pro {name} udělat nemůžeš.',
      gmOnly: 'Tento příkaz může použít jen GM.',
      gmOnlyHint: 'Hráči mohou použít spend, party a help.',
      spendOff: 'GM vypnul využívání inspirace hráči.',
      noCharacter: 'Tyto tokeny nepředstavují žádnou postavu: {names}.',
      nothingSelected: 'Nejprve vyber token.',
      nothingSelectedHint:
        'Vyber tokeny, které představují postavy, nebo přidej --ids s ID tokenů či postav.',
      writeFailed: 'Deník postavy {name} se nepodařilo změnit.',
      offerGone: 'Tato volba už byla provedena, nebo vypršela.',
      passInvalid: 'Vyber jiného člena družiny než toho, kdo ji má.',
      undoGone: 'Toto využití už bylo vráceno, nebo je příliš staré.',
      unknownMarker: 'Žádná značka tokenu „{value}“ neexistuje.',
      unknownMarkerHint: 'Tlačítkem Značka v nastavení vyber jednu ze svých sad značek.',
      badSetting: '{key} nelze nastavit na „{value}“.',
      badSettingHint: 'Napiš !inspiration set a uvidíš všechna nastavení a jejich možnosti.',
      unknownCommand: 'Neznámý příkaz: {command}.',
      unknownCommandHint: 'Napiš !inspiration help pro seznam příkazů.',
    },
    menu: {
      selected: 'Vybrané tokeny',
      party: 'Družina',
      tools: 'Nástroje',
      hint: 'Úplný návod je v dokumentu „{help}“.',
      noSheet: 'bez deníku',
      noneYours: 'Neovládáš žádné postavy s deníkem.',
      partyEmpty: 'Neovládáš žádné členy družiny.',
      partyEmptyGm:
        'V družině zatím nikdo není. Přiřaď postavy hráčům, nebo vyber tokeny a klikni na Přidat do družiny.',
      partyCount: '{term}: {count} z {total}.',
    },
    buttons: {
      menu: 'Nabídka',
      give: 'Dát',
      remove: 'Odebrat',
      toggle: 'Přepnout',
      spend: 'Využít',
      party: 'Družina',
      partyAdd: 'Přidat do družiny',
      partyRemove: 'Odebrat z družiny',
      settings: 'Nastavení',
      macro: 'Hráčské makro',
      sync: 'Synchronizovat',
      status: 'Stav',
      help: 'Nápověda',
      reset: 'Obnovit nastavení',
      refresh: 'Obnovit',
      undo: 'Vrátit',
      decline: 'Vzdát se',
      boost: 'Posílit',
      pools: 'Zásoby',
      addPool: 'Přidat zásobu',
      deletePool: 'Smazat zásobu',
    },
    values: {
      on: 'Zapnuto',
      off: 'Vypnuto',
      none: 'Žádná',
      noLimit: 'Bez omezení',
      tracking: {
        flag: 'Políčko inspirace v deníku',
        pool: 'Zásoba bodů',
      },
      source: {
        resource: 'Políčko zdroje v deníku',
        attribute: 'Atribut',
      },
      wording: {
        2014: 'Inspirace (2014)',
        2024: 'Hrdinská inspirace (2024)',
        auto: 'Podle deníku',
      },
      announce: {
        public: 'Všichni',
        gm: 'GM a vlastníci',
        off: 'Nikdo',
      },
    },
    settings: {
      language: {
        label: 'Jazyk',
        desc: 'Jazyk nabídek, zpráv a dokumentů.',
      },
      tracking: {
        label: 'Sledování',
        desc: 'S čím pracují Dát a Využít: s políčkem inspirace v denících D&D, kterou postava buď má, nebo nemá, nebo se zásobou bodů, které se hromadí a utrácejí po několika.',
      },
      marker: {
        label: 'Značka',
        desc: 'Značka tokenu zobrazená, dokud má postava inspiraci. Uvedeny jsou i vlastní sady značek.',
      },
      wording: {
        label: 'Název',
        desc: 'Říkat tomu Inspirace, nebo Hrdinská inspirace. „Podle deníku“ použije pravidla zvolená v každém deníku D&D 2024 a v deníku 2014 Inspiraci.',
      },
      announce: {
        label: 'Oznámení',
        desc: 'Kdo vidí zprávu v chatu, když je inspirace získána nebo využita.',
      },
      fx: {
        label: 'Speciální efekt',
        desc: 'Přehrát na tokenu speciální efekt, když získá inspiraci.',
      },
      fxType: {
        label: 'Typ efektu',
        desc: 'Který efekt přehrát, například nova-holy, nebo ID vlastního efektu.',
      },
      playerSpend: {
        label: 'Hráči mohou využít',
        desc: 'Povolit hráčům využít inspiraci pro postavy, které ovládají. GM dostane zprávu s tlačítkem Vrátit.',
      },
      playerOverview: {
        label: 'Hráči vidí družinu',
        desc: 'Povolit hráčům vidět, kdo v družině má inspiraci.',
      },
      passOn: {
        label: 'Předání (2024)',
        desc: 'Podle pravidel 2024 může postava, která by získala Hrdinskou inspiraci, když ji už má, předat ji jinému členovi družiny.',
      },
    },
    status: {
      version: 'Verze',
      beacon: 'Deníky D&D 2024',
      legacy: 'Deníky 2014',
      none: 'Postavy bez políčka inspirace',
      rules2024: 'Používá pravidla 2024',
      party: 'Členové družiny',
      tracking: 'Sledování',
      pools: 'Zásoby',
      marker: 'Značka',
      fx: 'Speciální efekt',
      legacyCommand: 'Starý příkaz',
    },
    help: {
      menu: 'Zobrazí nabídku. S vybranými tokeny dá nebo odebere inspiraci, jako to dělala verze 0.1.',
      give: 'Dá inspiraci vybraným postavám.',
      remove: 'Odebere inspiraci vybraným postavám, aniž by se počítala jako využitá.',
      toggle: 'Dá inspiraci vybraným postavám, které ji nemají, a odebere ji těm, které ji mají.',
      spend: 'Využije inspiraci za vybrané postavy a oznámí to GM.',
      party:
        'Zobrazí, kdo v družině má inspiraci, s tlačítky pro její dání, odebrání nebo využití.',
      partyEdit: 'Přidá vybrané postavy do družiny, nebo je z ní odebere.',
      ids: 'Pracuje se zadanými ID tokenů nebo postav místo vybraných tokenů.',
      points:
        'Se zásobou bodů: dá, odebere nebo využije daný počet bodů. Bez čísla 1. remove all odebere všechny body.',
      boost: 'Se zásobou bodů: utratí body a přidá k hodu daný bonus, za cenu zásoby za každé +1.',
      poolFlag: 'Pracuje se jmenovanou zásobou místo výchozí.',
      pools: 'Zobrazí zásoby bodů a jejich nastavení.',
      poolEdit: 'Přidá zásobu, nebo jednu smaže. Body v denících zůstanou, jak jsou.',
      poolSet:
        'Změní zásobu: její název, kde je uložena (resource nebo attribute), kolik bodů stojí každé +1, nejvyšší povolený počet bodů (0 = bez omezení), nebo její značku tokenu.',
      undo: 'Vrátí využitou inspiraci. ID je ve zprávě pro GM o využití.',
      macro: 'Přidá akci tokenu „Inspiration“, na kterou hráči klikají, aby využili inspiraci.',
      sync: 'Znovu načte všechny deníky a opraví značky.',
      set: 'Zobrazí nastavení, nebo jedno změní.',
      reset: 'Vrátí všechna nastavení na výchozí hodnoty, kromě jazyka.',
      status: 'Zobrazí verzi, nalezené deníky a hlavní nastavení.',
      journal: 'Znovu vytvoří dokumenty Nápověda a Command Deck.',
      help: 'Zobrazí tento seznam.',
    },
    helpPlayer: {
      menu: 'Zobrazí tvé postavy a zda mají inspiraci.',
      spend: 'Využije inspiraci za vybranou postavu.',
      boost: 'Utratí body ze zásoby a přidá k hodu daný bonus.',
      party: 'Zobrazí družinu, pokud to GM dovolí.',
      help: 'Zobrazí tento seznam.',
    },
    handout: {
      versionLabel: 'Verze',
      subtitle: 'Inspirace, Hrdinská inspirace a zásoby bodů pro jakoukoli hru',
      overview: {
        heading: 'Přehled',
        body: 'InspirationTracker udržuje inspiraci v D&D v souladu mezi deníkem postavy, tokenem a chatem. Dej ji z nabídky, z deníku nebo značkou tokenu a každý token dané postavy značku zobrazí. Hráči ji mohou využít jedním kliknutím a GM dostane zprávu s tlačítkem Vrátit. Funguje s deníkem D&D 2024, kde se jmenuje Hrdinská inspirace, a s deníkem 2014 OGL.',
      },
      quickStart: {
        heading: 'Rychlý start',
        steps: [
          'Otevři dokument Command Deck, nebo napiš !inspiration pro nabídku.',
          'Vyber token a klikni na Dát. Postava získá inspiraci a její tokeny zobrazí značku.',
          'Jednou klikni na Hráčské makro, aby hráči dostali akci tokenu Inspiration pro její využití.',
          'Klikni na Družina a uvidíš, kdo má inspiraci.',
        ],
      },
      sheets: {
        heading: 'Deníky postav',
        colSheet: 'Deník',
        colWhere: 'Kde je inspirace uložena',
        colSheet2014: 'D&D 5E by Roll20 (2014 OGL)',
        where2014: 'Políčko Inspiration, atribut "inspiration".',
        colSheet2024: 'D&D Fifth Edition (5E & 5.5E, 2024)',
        where2024:
          'Políčko Heroic Inspiration, čtené a zapisované pomocí getSheetItem a setSheetItem.',
        points: [
          'Zaškrtnutí nebo zrušení políčka v deníku se projeví okamžitě: značka ho následuje a zrušení se počítá jako využití.',
          'Když je Název nastaven na „Podle deníku“, každá postava D&D 2024 použije pravidla zvolená v nastavení svého deníku: pravidla 2024 říkají Hrdinská inspirace, pravidla 2014 Inspirace.',
          'Postav bez kteréhokoli z těchto deníků se nic netýká, takže tokeny CP se nemění.',
        ],
      },
      players: {
        heading: 'Hráči',
        points: [
          'Hráči mohou využít inspiraci pro postavy, které ovládají: kliknutím na Využít v chatu nebo na akci tokenu Inspiration.',
          'GM dostane zprávu, kdo ji využil, s tlačítkem Vrátit.',
          'Když hráč napíše !inspiration, uvidí své postavy a zda mají inspiraci.',
          'Vypni Hráči mohou využít, pokud chceš využívání ponechat v rukou GM.',
        ],
      },
      passOn: {
        heading: 'Předání (pravidla 2024)',
        points: [
          'Postava nemůže mít Hrdinskou inspiraci dvakrát. Když by ji postava, která ji už má, získala znovu, jsou její hráči požádáni, aby ji předali jinému členovi družiny, který ji nemá.',
          'Volba nabízí každého člena družiny bez Hrdinské inspirace a možnost Vzdát se. Vyprší po hodině.',
          'Podle pravidel 2014 dostane GM jen zprávu, že postava už Inspiraci má.',
          'Vypni Předání, pokud chceš vždy dostávat jen tuto zprávu.',
        ],
      },
      party: {
        heading: 'Družina',
        points: [
          'Družinu tvoří každá postava, kterou ovládá hráč. Vyber tokeny a klikni na Přidat do družiny nebo Odebrat z družiny, chceš-li ji změnit.',
          'Přehled GM má pro každého člena tlačítka Dát, Odebrat a Využít.',
          'Zapni Hráči vidí družinu, aby přehled viděli i hráči. Tlačítka Využít dostanou jen pro své vlastní postavy.',
        ],
      },
      pools: {
        heading: 'Zásoby bodů',
        points: [
          'Zásoba bodů je číslo, které se hromadí a utrácí po několika: zásoba bodů inspirace, hrdinských bodů, štěstí, bennies a podobně. Funguje s jakýmkoli deníkem postavy.',
          'Nastav Sledování na Zásoba bodů a Dát, Odebrat a Využít budou pracovat s výchozí zásobou a zeptají se na počet bodů. Značka je vidět, dokud má postava nějaké body.',
          'Posílit utrácí body za zvýšení hodu: napiš požadovaný bonus a cenu určí Body za +1 dané zásoby. Při 2 bodech za +1 stojí bonus 4 celkem 8 bodů. Mod útratu oznámí; bonus si k hodu přičti sám.',
          'Útrata je odmítnuta, když postava nemá dost bodů. GM dostane zprávu, kdo co utratil, s tlačítkem Vrátit.',
          'Uloženo v „Políčko zdroje v deníku“ používá políčko zdroje v deníku, které nese název zásoby, například políčko Other Resource pojmenované Inspiration v deníku D&D 2014. Když deník políčko s tímto názvem nemá, nebo při volbě „Atribut“, jsou body uloženy v obyčejném atributu, například inspiration_pool. Deník D&D 2024 používá atribut vždy.',
          'Karta družiny i hráčova vlastní karta uvádějí, kde jsou body každé postavy uloženy: název políčka v deníku, nebo atribut. Atribut se v deníku postavy nezobrazuje.',
          'Ruční změna čísla v deníku nevadí: značka ji následuje.',
          'Klikni na Zásoby, chceš-li přejmenovat výchozí zásobu, nastavit její cenu a maximum, nebo přidat další zásoby. Ostatní zásoby se používají jejich tlačítkem Družina, nebo přidáním --pool a názvu zásoby k příkazu.',
          'Bardic Inspiration funguje jako samostatná zásoba: klikni na Přidat zásobu a pojmenuj ji Bardic Inspiration, nastav její Maximum na 1 a vyber její Značku. GM dá 1 z karty Družina této zásoby, když bard rozdá kostku, a její držitel klikne na Využít, když ji použije. Mod označuje, kdo kostku drží; hráč si jí hodí sám.',
        ],
      },
      markers: {
        heading: 'Značky tokenů',
        points: [
          'Značku vyber v nastavení Značka. Uvedeny jsou barevné tečky Roll20, výchozí značky a tvé vlastní sady značek.',
          'Přidání značky na token ručně nebo pomocí TokenMod dá postavě inspiraci. Její odebrání ji využije.',
          'Změna značky ji okamžitě přesune na všech tokenech.',
          'Vlastní značky stavů deníku D&D 2024 se nenabízejí, protože je deník nastavuje sám.',
        ],
      },
      commands: {
        heading: 'Příkazy',
        intro:
          'Každý příkaz začíná !inspiration. Příkazy pracují s vybranými tokeny, pokud není zadáno --ids.',
        mods: 'Tyto příkazy mohou posílat i jiné Mods, například ze ScriptCards. Jiné Mods mohou také volat InspirationTracker.give, spend, remove a isInspired.',
        colCommand: 'Příkaz',
        colDesc: 'Co dělá',
      },
      settings: {
        heading: 'Nastavení',
        intro: 'Měň je tlačítkem Nastavení, nebo napiš !inspiration set <setting> <value>.',
        colKey: 'Nastavení',
        colName: 'Název',
        colDesc: 'Co dělá',
      },
      upgrading: {
        heading: 'Přechod z verze 0.1',
        points: [
          'Značka, speciální efekt a typ efektu z verze 0.1 zůstávají zachovány.',
          'Pokud sis ve verzi 0.1 zvolil(a) vlastní příkaz, stále funguje vedle !inspiration.',
          '!inspiration s vybranými tokeny stále dává nebo odebírá inspiraci.',
        ],
      },
      troubleshooting: {
        heading: 'Řešení problémů',
        points: [
          'Značka se na tokenu nezobrazuje? Klikni na Synchronizovat a všechny deníky se znovu načtou.',
          'Token, který nepředstavuje postavu, nemůže mít inspiraci. Nejprve ho propoj s postavou.',
          'Nic se nestane, když hráč klikne na Využít? Zkontroluj, zda je postava přiřazena tomuto hráči.',
          'Chyby se zapisují do konzole API na stránce Mod Scripts.',
        ],
      },
      languages: {
        heading: 'Jazyky',
        body: 'InspirationTracker je přeložen do níže uvedených jazyků. Jeden zvol v nastavení Jazyk.',
        colCode: 'Kód',
        colName: 'Jazyk',
        colNative: 'Původní název',
      },
      credits: {
        heading: 'Poděkování',
        original: 'Původní Mod od',
        maintainer: 'Verzi 1 udržuje',
        support: 'Chyby a nápady hlas na fóru Roll20 pro Mods nebo na GitHubu.',
      },
      footer: 'Tlačítka pro všechny akce jsou v dokumentu „{deck}“.',
    },
    deck: {
      subtitle: 'Command Deck',
      selectedDesc: 'Vyber jeden nebo více tokenů a pak klikni.',
      partyDesc: 'Podívej se, kdo má inspiraci, a urči, kdo je v družině.',
      poolsTitle: 'Zásoba bodů',
      poolsDesc: 'Se Sledováním nastaveným na Zásoba bodů: vyber tokeny, klikni a napiš číslo.',
      toolsDesc: 'Nabídka, nastavení, hráčské makro a nápověda.',
      footer: 'Úplný návod je v dokumentu „{help}“.',
    },
  };

  const TRANSLATION$j = {
    terms: {
      heroic: 'Heroisk inspiration',
      classic: 'Inspiration',
    },
    titles: {
      ready: 'InspirationTracker er klar.',
      settings: 'InspirationTracker-indstillinger',
      help: 'InspirationTracker-kommandoer',
      party: 'Gruppens inspiration',
      poolParty: 'Gruppens {term}',
      pools: 'Pointpuljer',
      yours: 'Dine figurer',
      status: 'InspirationTracker-status',
    },
    messages: {
      gained: '{name} har {term}!',
      spent: '{name} bruger {term}.',
      spentBy: '{player} brugte {term} for {name}.',
      spentSheet: '{name} har ikke længere {term} (ændret på arket eller brikken).',
      restored: '{name} har {term} igen.',
      removed: '{term} er fjernet fra {name}.',
      already: '{name} har allerede {term}.',
      none: '{name} har ikke {term}.',
      busy: '{name} bliver stadig opdateret. Prøv igen om et øjeblik.',
      passOffer:
        '{name} har allerede {term} og kan ikke have den to gange. Giv den til et gruppemedlem, der ikke har den, eller lad den gå.',
      passNobody: 'Alle andre gruppemedlemmer har den allerede.',
      passAsked: 'Spillerne bag {name} er blevet spurgt, hvem der skal have {term}.',
      passed: '{from} giver {term} til {to}!',
      passAlready: '{to} har den allerede. Vælg en anden.',
      declined: '{name} lader den ekstra {term} gå.',
      undoAlready: '{name} har den allerede igen.',
      synced: 'Ark læst: {checked}. Med inspiration: {inspired}.',
      migrated:
        'Indstillinger fra version 0.1 er bevaret: markør, specialeffekt og dens type. De nye indstillinger starter med standardværdier.',
      legacyCommand: 'Din gamle kommando {command} virker stadig, ligesom {main}.',
      macroHint:
        'Kør {command} for at give spillerne en Brug-knap. Den tilføjer en brikhandling for alle.',
      macro:
        'Makroen "{name}" er klar: spillerne ser den som en brikhandling, når de vælger en brik, de styrer.',
      journal: 'Hjælp- og Command Deck-dokumenterne er genopbygget.',
      readyHint: 'Skriv {command} for menuen, eller åbn Command Deck-dokumentet.',
    },
    pool: {
      gained: '{name} får {amount} {term} ({before} → {after}).',
      spent: '{name} bruger {amount} {term} ({before} → {after}).',
      boosted: '{name} bruger {amount} {term} for +{bonus} til slaget ({before} → {after}).',
      spentBy: '{player} brugte {amount} {term} for {name}.',
      restored: '{name} har fået {amount} {term} tilbage ({before} → {after}).',
      removed: '{amount} {term} er fjernet fra {name} ({before} → {after}).',
      none: '{name} har ingen {term}.',
      short: '{name} har {have} {term}, og det kræver {need}.',
      full: '{name} har allerede det højeste tilladte antal {term} ({max}).',
    },
    pools: {
      introFlag:
        'Sporing er sat til arkets inspirationsfelt. Sæt den til Pointpulje for at gøre "{name}" til den pulje, som Giv og Brug virker på. Andre puljer bruges med --pool.',
      introPool:
        'Giv, Brug og Boost virker på "{name}". Andre puljer bruges fra deres Gruppe-knap eller med --pool.',
      defaultLabel: '{name} (standard)',
      name: 'Navn',
      source: 'Gemmes i',
      cost: 'Point pr. +1',
      max: 'Maksimum',
      marker: 'Markør',
      attribute: 'Attribut, når arket ikke har et felt med dette navn: {attribute}',
      partyTotal: 'Gruppen i alt: {total} {term}.',
      keptBox: 'Felt på arket: {name}',
      keptAttribute: 'Attribut: {attribute}',
      keptNote: 'Et attribut vises ikke på figurarket.',
    },
    prompts: {
      points: 'Point',
      bonus: 'Bonus til slaget',
      max: 'Højeste tilladte antal point (0 for ingen grænse)',
    },
    errors: {
      unknownPool: 'Der findes ingen pulje ved navn "{value}".',
      unknownPoolHint: 'Puljer: {pools}.',
      badAmount: '"{value}" er ikke et antal point.',
      badAmountHint: 'Brug et helt tal fra 1 til 9999.',
      boostNoPool: 'Boost bruger point fra en pulje.',
      poolInvalid: 'En pulje kan ikke hedde "{value}".',
      poolExists: 'Der findes allerede en pulje ved navn "{value}".',
      poolFull: 'Der er ikke plads til endnu en pulje.',
      poolNameHint:
        'Brug et navn på op til 40 bogstaver, cifre og mellemrum, som ingen anden pulje har.',
      poolDefault: 'Standardpuljen, "{name}", kan ikke slettes. Den kan omdøbes.',
      poolMarkerHint: 'Vælg en markør fra dine markørsæt, som ikke er den i indstillingen Markør.',
      poolSetHint: 'Skriv !inspiration pools for at se alle puljer og deres indstillinger.',
      denied: 'Det kan du ikke gøre for {name}.',
      gmOnly: 'Kun GM kan bruge den kommando.',
      gmOnlyHint: 'Spillere kan bruge spend, party og help.',
      spendOff: 'GM har slået spillernes brug fra.',
      noCharacter: 'Disse brikker repræsenterer ikke en figur: {names}.',
      nothingSelected: 'Vælg en brik først.',
      nothingSelectedHint:
        'Vælg brikker, der repræsenterer figurer, eller tilføj --ids med brik- eller figur-ID’er.',
      writeFailed: 'Kunne ikke ændre arket for {name}.',
      offerGone: 'Det valg er allerede truffet, eller det er udløbet.',
      passInvalid: 'Vælg et andet gruppemedlem end det, der har den.',
      undoGone: 'Den brug er allerede fortrudt, eller den er for gammel.',
      unknownMarker: 'Der findes ingen brikmarkør ved navn "{value}".',
      unknownMarkerHint:
        'Brug Markør-knappen i indstillingerne til at vælge en fra dine markørsæt.',
      badSetting: 'Kan ikke sætte {key} til "{value}".',
      badSettingHint: 'Skriv !inspiration set for at se alle indstillinger og deres valg.',
      unknownCommand: 'Ukendt kommando: {command}.',
      unknownCommandHint: 'Skriv !inspiration help for listen over kommandoer.',
    },
    menu: {
      selected: 'Valgte brikker',
      party: 'Gruppe',
      tools: 'Værktøjer',
      hint: 'Den fulde vejledning findes i dokumentet "{help}".',
      noSheet: 'intet ark',
      noneYours: 'Du styrer ingen figurer med et ark.',
      partyEmpty: 'Du styrer ingen gruppemedlemmer.',
      partyEmptyGm:
        'Der er ingen i gruppen endnu. Tildel figurer til spillere, eller vælg brikker og klik på Føj til gruppe.',
      partyCount: '{count} af {total} har {term}.',
    },
    buttons: {
      menu: 'Menu',
      give: 'Giv',
      remove: 'Fjern',
      toggle: 'Skift',
      spend: 'Brug',
      party: 'Gruppe',
      partyAdd: 'Føj til gruppe',
      partyRemove: 'Fjern fra gruppe',
      settings: 'Indstillinger',
      macro: 'Spillermakro',
      sync: 'Synkroniser',
      status: 'Status',
      help: 'Hjælp',
      reset: 'Nulstil indstillinger',
      refresh: 'Opdater',
      undo: 'Fortryd',
      decline: 'Lad den gå',
      boost: 'Boost',
      pools: 'Puljer',
      addPool: 'Tilføj pulje',
      deletePool: 'Slet pulje',
    },
    values: {
      on: 'Til',
      off: 'Fra',
      none: 'Ingen',
      noLimit: 'Ingen grænse',
      tracking: {
        flag: 'Arkets inspirationsfelt',
        pool: 'Pointpulje',
      },
      source: {
        resource: 'Arkets ressourcefelt',
        attribute: 'Attribut',
      },
      wording: {
        2014: 'Inspiration (2014)',
        2024: 'Heroisk inspiration (2024)',
        auto: 'Fra arket',
      },
      announce: {
        public: 'Alle',
        gm: 'GM og ejere',
        off: 'Ingen',
      },
    },
    settings: {
      language: {
        label: 'Sprog',
        desc: 'Sprog for menuer, beskeder og dokumenter.',
      },
      tracking: {
        label: 'Sporing',
        desc: 'Hvad Giv og Brug virker på: inspirationsfeltet på D&D-arkene, som en figur enten har eller ikke har, eller en pulje af point, der bygges op og bruges nogle få ad gangen.',
      },
      marker: {
        label: 'Markør',
        desc: 'Brikmarkør, der vises, mens en figur har inspiration. Egne markørsæt vises også.',
      },
      wording: {
        label: 'Ordlyd',
        desc: 'Kald det Inspiration eller Heroisk inspiration. "Fra arket" bruger reglerne valgt på hvert D&D 2024-ark, og Inspiration på 2014-arket.',
      },
      announce: {
        label: 'Meddel',
        desc: 'Hvem der ser chatbeskeden, når inspiration opnås eller bruges.',
      },
      fx: {
        label: 'Specialeffekt',
        desc: 'Afspil en specialeffekt på brikken, når den får inspiration.',
      },
      fxType: {
        label: 'Effekttype',
        desc: 'Hvilken effekt der afspilles, fx nova-holy, eller ID’et på en egen effekt.',
      },
      playerSpend: {
        label: 'Spillere kan bruge',
        desc: 'Lad spillere bruge inspiration for de figurer, de styrer. GM får besked, med en Fortryd-knap.',
      },
      playerOverview: {
        label: 'Spillere ser gruppen',
        desc: 'Lad spillere se, hvem i gruppen der har inspiration.',
      },
      passOn: {
        label: 'Giv videre (2024)',
        desc: 'Efter 2024-reglerne må en figur, der ville få Heroisk inspiration, mens den allerede har den, give den til et andet gruppemedlem.',
      },
    },
    status: {
      version: 'Version',
      beacon: 'D&D 2024-ark',
      legacy: '2014-ark',
      none: 'Figurer uden inspirationsfelt',
      rules2024: 'Bruger 2024-regler',
      party: 'Gruppemedlemmer',
      tracking: 'Sporing',
      pools: 'Puljer',
      marker: 'Markør',
      fx: 'Specialeffekt',
      legacyCommand: 'Gammel kommando',
    },
    help: {
      menu: 'Viser menuen. Med valgte brikker giver eller fjerner den inspiration, som version 0.1 gjorde.',
      give: 'Giver inspiration til de valgte figurer.',
      remove: 'Fjerner inspiration fra de valgte figurer uden at tælle den som brugt.',
      toggle: 'Giver inspiration til valgte figurer uden den, og fjerner den fra dem, der har den.',
      spend: 'Bruger inspiration for de valgte figurer og giver GM besked.',
      party:
        'Viser, hvem i gruppen der har inspiration, med knapper til at give, fjerne eller bruge den.',
      partyEdit: 'Føjer de valgte figurer til gruppen eller fjerner dem.',
      ids: 'Virker på de angivne brik- eller figur-ID’er i stedet for de valgte brikker.',
      points:
        'Med en pointpulje: giver, fjerner eller bruger så mange point. Uden et tal, 1. remove all fjerner alle point.',
      boost:
        'Med en pointpulje: bruger point på at lægge den bonus til et slag, til puljens pris for hver +1.',
      poolFlag: 'Virker på den navngivne pulje i stedet for standardpuljen.',
      pools: 'Viser pointpuljerne og deres indstillinger.',
      poolEdit: 'Tilføjer en pulje eller sletter en. Pointene på arkene lades, som de er.',
      poolSet:
        'Ændrer en pulje: dens navn, hvor den gemmes (resource eller attribute), hvor mange point hver +1 koster, det højeste tilladte antal point (0 for ingen grænse) eller dens brikmarkør.',
      undo: 'Giver brugt inspiration tilbage. ID’et kommer fra GM-beskeden om brugen.',
      macro:
        'Tilføjer brikhandlingen "Inspiration", som spillerne klikker på for at bruge inspiration.',
      sync: 'Læser alle ark igen og retter markørerne.',
      set: 'Viser indstillingerne eller ændrer én.',
      reset: 'Sætter alle indstillinger tilbage til standard, undtagen sproget.',
      status: 'Viser versionen, de fundne ark og de vigtigste indstillinger.',
      journal: 'Genopbygger Hjælp- og Command Deck-dokumenterne.',
      help: 'Viser denne liste.',
    },
    helpPlayer: {
      menu: 'Viser dine figurer, og om de har inspiration.',
      spend: 'Bruger inspiration for den valgte figur.',
      boost: 'Bruger point fra en pulje på at lægge den bonus til et slag.',
      party: 'Viser gruppen, hvis GM tillader det.',
      help: 'Viser denne liste.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Inspiration, Heroisk inspiration og pointpuljer til ethvert spil',
      overview: {
        heading: 'Oversigt',
        body: 'InspirationTracker holder D&D-inspiration i takt på figurarket, brikken og i chatten. Giv den fra menuen, arket eller brikmarkøren, og alle brikker for den figur viser markøren. Spillere kan bruge den med ét klik, og GM får besked, med en Fortryd-knap. Den virker med D&D 2024-arket, hvor den hedder Heroisk inspiration, og med 2014 OGL-arket.',
      },
      quickStart: {
        heading: 'Kom i gang',
        steps: [
          'Åbn Command Deck-dokumentet, eller skriv !inspiration for menuen.',
          'Vælg en brik og klik på Giv. Figuren får inspiration, og dens brikker viser markøren.',
          'Klik én gang på Spillermakro, så spillerne får en Inspiration-brikhandling til at bruge den.',
          'Klik på Gruppe for at se, hvem der har inspiration.',
        ],
      },
      sheets: {
        heading: 'Figurark',
        colSheet: 'Ark',
        colWhere: 'Hvor inspiration gemmes',
        colSheet2014: 'D&D 5E by Roll20 (2014 OGL)',
        where2014: 'Inspiration-feltet, attributten "inspiration".',
        colSheet2024: 'D&D Fifth Edition (5E & 5.5E, 2024)',
        where2024: 'Heroic Inspiration-feltet, læst og skrevet med getSheetItem og setSheetItem.',
        points: [
          'Når feltet på et ark sættes eller ryddes, opdages det med det samme: markøren følger med, og at rydde det tæller som at bruge det.',
          'Med Ordlyd sat til "Fra arket" bruger hver D&D 2024-figur de regler, der er valgt i arkets indstillinger: 2024-regler siger Heroisk inspiration, 2014-regler siger Inspiration.',
          'Figurer uden nogen af arkene lades i fred, så NPC-brikker ændres ikke.',
        ],
      },
      players: {
        heading: 'Spillere',
        points: [
          'Spillere kan bruge inspiration for figurer, de styrer: klik på Brug i chatten eller på brikhandlingen Inspiration.',
          'GM får en besked om, hvem der brugte den, med en Fortryd-knap.',
          'Skriver en spiller !inspiration, ser vedkommende sine figurer, og om de har inspiration.',
          'Slå Spillere kan bruge fra for at holde brugen i GM’s hænder.',
        ],
      },
      passOn: {
        heading: 'Giv den videre (2024-regler)',
        points: [
          'En figur kan ikke have Heroisk inspiration to gange. Når en, der har den, ville få den igen, bliver dens spillere bedt om at give den til et andet gruppemedlem, der ikke har den.',
          'Valget tilbyder alle gruppemedlemmer uden Heroisk inspiration, samt Lad den gå. Det udløber efter en time.',
          'Efter 2014-reglerne får GM bare besked om, at figuren allerede har Inspiration.',
          'Slå Giv videre fra for altid at få den besked i stedet.',
        ],
      },
      party: {
        heading: 'Gruppen',
        points: [
          'Gruppen er alle figurer, som en spiller styrer. Vælg brikker og klik på Føj til gruppe eller Fjern fra gruppe for at ændre den.',
          'GM’s oversigt har Giv-, Fjern- og Brug-knapper for hvert medlem.',
          'Slå Spillere ser gruppen til for også at lade spillerne se oversigten. De får kun Brug-knapper for deres egne figurer.',
        ],
      },
      pools: {
        heading: 'Pointpuljer',
        points: [
          'En pointpulje er et tal, der bygges op og bruges nogle få ad gangen: en pulje af inspirationspoint, heltepoint, held, bennies og lignende. Den virker med ethvert figurark.',
          'Sæt Sporing til Pointpulje, så virker Giv, Fjern og Brug på standardpuljen og spørger, hvor mange point. Markøren vises, så længe en figur har point.',
          'Boost bruger point på at hæve et slag: skriv den ønskede bonus, og puljens Point pr. +1 afgør prisen. Ved 2 point pr. +1 koster en bonus på 4 i alt 8 point. Mod’en meddeler forbruget; læg selv bonussen til slaget.',
          'Et forbrug afvises, når figuren ikke har point nok. GM får besked om, hvem der brugte hvad, med en Fortryd-knap.',
          'Gemmes i "Arkets ressourcefelt" bruger det ressourcefelt på arket, der har puljens navn, fx et Other Resource-felt ved navn Inspiration på 2014 D&D-arket. Når arket ikke har et felt med det navn, eller med "Attribut", gemmes pointene i en almindelig attribut, fx inspiration_pool. D&D 2024-arket bruger altid attributten.',
          'Gruppekortet og en spillers eget kort fortæller, hvor hver figurs point gemmes: navnet på feltet på arket eller attributtet. Et attribut vises ikke på figurarket.',
          'Det er fint at ændre tallet på arket i hånden: markøren følger med.',
          'Klik på Puljer for at omdøbe standardpuljen, sætte dens pris og maksimum eller tilføje flere puljer. Andre puljer bruges fra deres Gruppe-knap eller ved at føje --pool og puljens navn til en kommando.',
          "Bardic Inspiration fungerer som sin egen pulje: klik på Tilføj pulje og kald den Bardic Inspiration, sæt dens Maksimum til 1 og vælg dens Markør. GM'en giver 1 fra den puljes Gruppe-kort, når barden deler en terning ud, og indehaveren klikker på Brug, når den bruges. Mod'et markerer, hvem der har en terning; spilleren slår den selv.",
        ],
      },
      markers: {
        heading: 'Brikmarkører',
        points: [
          'Vælg markøren med indstillingen Markør. Roll20’s farvede prikker, standardmarkørerne og dine egne markørsæt vises.',
          'At sætte markøren på en brik i hånden eller med TokenMod giver figuren inspiration. At fjerne den bruger den.',
          'Når markøren ændres, flyttes den straks på alle brikker.',
          'D&D 2024-arkets egne tilstandsmarkører tilbydes ikke, fordi arket selv sætter dem.',
        ],
      },
      commands: {
        heading: 'Kommandoer',
        intro:
          'Alle kommandoer starter med !inspiration. Kommandoer virker på de valgte brikker, medmindre --ids angives.',
        mods: 'Andre Mods kan også sende disse kommandoer, fx fra ScriptCards. Andre Mods kan også kalde InspirationTracker.give, spend, remove og isInspired.',
        colCommand: 'Kommando',
        colDesc: 'Hvad den gør',
      },
      settings: {
        heading: 'Indstillinger',
        intro:
          'Skift dem med knappen Indstillinger, eller skriv !inspiration set <setting> <value>.',
        colKey: 'Indstilling',
        colName: 'Navn',
        colDesc: 'Hvad den gør',
      },
      upgrading: {
        heading: 'Opgradering fra 0.1',
        points: [
          'Markør, specialeffekt og effekttype fra version 0.1 bevares.',
          'Hvis du valgte din egen kommando i 0.1, virker den stadig sammen med !inspiration.',
          '!inspiration med valgte brikker giver eller fjerner stadig inspiration.',
        ],
      },
      troubleshooting: {
        heading: 'Fejlfinding',
        points: [
          'Vises markøren ikke på en brik? Klik på Synkroniser for at læse alle ark igen.',
          'En brik, der ikke repræsenterer en figur, kan ikke have inspiration. Tilknyt den til en figur først.',
          'Sker der ingenting, når en spiller klikker på Brug? Tjek, at figuren er tildelt den spiller.',
          'Fejl skrives til API-konsollen på siden Mod Scripts.',
        ],
      },
      languages: {
        heading: 'Sprog',
        body: 'InspirationTracker er oversat til sprogene nedenfor. Vælg et med indstillingen Sprog.',
        colCode: 'Kode',
        colName: 'Sprog',
        colNative: 'Eget navn',
      },
      credits: {
        heading: 'Tak til',
        original: 'Oprindelig Mod af',
        maintainer: 'Version 1 vedligeholdes af',
        support: 'Rapportér fejl og idéer på Roll20’s Mod-forum eller på GitHub.',
      },
      footer: 'Knapper til alle handlinger findes i dokumentet "{deck}".',
    },
    deck: {
      subtitle: 'Command Deck',
      selectedDesc: 'Vælg en eller flere brikker, og klik derefter.',
      partyDesc: 'Se, hvem der har inspiration, og vælg, hvem der er i gruppen.',
      poolsTitle: 'Pointpulje',
      poolsDesc: 'Med Sporing sat til Pointpulje: vælg brikker, klik, og skriv tallet.',
      toolsDesc: 'Menu, indstillinger, spillermakroen og hjælp.',
      footer: 'Den fulde vejledning findes i dokumentet "{help}".',
    },
  };

  const TRANSLATION$i = {
    terms: {
      heroic: 'Heroïsche inspiratie',
      classic: 'Inspiratie',
    },
    titles: {
      ready: 'InspirationTracker is klaar.',
      settings: 'InspirationTracker-instellingen',
      help: 'InspirationTracker-commando’s',
      party: 'Inspiratie van de groep',
      poolParty: '{term} van de groep',
      pools: 'Puntenpools',
      yours: 'Jouw personages',
      status: 'InspirationTracker-status',
    },
    messages: {
      gained: '{name} heeft {term}!',
      spent: '{name} gebruikt {term}.',
      spentBy: '{player} heeft {term} gebruikt voor {name}.',
      spentSheet: '{name} heeft geen {term} meer (gewijzigd op het blad of de token).',
      restored: '{name} heeft {term} terug.',
      removed: '{term} afgenomen van {name}.',
      already: '{name} heeft al {term}.',
      none: '{name} heeft geen {term}.',
      busy: '{name} wordt nog bijgewerkt. Probeer het zo meteen opnieuw.',
      passOffer:
        '{name} heeft al {term} en kan die niet twee keer hebben. Geef hem aan een groepslid dat hem niet heeft, of laat hem gaan.',
      passNobody: 'Elk ander groepslid heeft hem al.',
      passAsked: 'De spelers van {name} is gevraagd wie de {term} moet krijgen.',
      passed: '{from} geeft {term} aan {to}!',
      passAlready: '{to} heeft hem al. Kies iemand anders.',
      declined: '{name} laat de extra {term} gaan.',
      undoAlready: '{name} heeft hem alweer.',
      synced: 'Bladen gelezen: {checked}. Met inspiratie: {inspired}.',
      migrated:
        'Instellingen uit versie 0.1 zijn behouden: marker, speciaal effect en het type daarvan. De nieuwe instellingen beginnen op hun standaardwaarden.',
      legacyCommand: 'Je oude commando {command} werkt nog steeds, net als {main}.',
      macroHint:
        'Voer {command} uit om spelers een Gebruik-knop te geven. Het voegt een tokenactie toe voor iedereen.',
      macro:
        'De macro "{name}" is klaar: spelers zien hem als tokenactie wanneer ze een token selecteren die ze besturen.',
      journal: 'De handouts Help en Command Deck zijn opnieuw opgebouwd.',
      readyHint: 'Typ {command} voor het menu, of open de handout Command Deck.',
    },
    pool: {
      gained: '{name} krijgt {amount} {term} ({before} → {after}).',
      spent: '{name} gebruikt {amount} {term} ({before} → {after}).',
      boosted: '{name} gebruikt {amount} {term} voor +{bonus} op de worp ({before} → {after}).',
      spentBy: '{player} heeft {amount} {term} gebruikt voor {name}.',
      restored: '{name} heeft {amount} {term} terug ({before} → {after}).',
      removed: '{amount} {term} afgenomen van {name} ({before} → {after}).',
      none: '{name} heeft geen {term}.',
      short: '{name} heeft {have} {term}, en hiervoor is {need} nodig.',
      full: '{name} heeft al het maximum aan {term} ({max}).',
    },
    pools: {
      introFlag:
        'Bijhouden staat op het inspiratievakje van het blad. Zet het op Puntenpool om van "{name}" de pool te maken waarop Geven en Gebruiken werken. Andere pools gebruik je met --pool.',
      introPool:
        'Geven, Gebruiken en Boost werken op "{name}". Andere pools gebruik je met hun knop Groep, of met --pool.',
      defaultLabel: '{name} (standaard)',
      name: 'Naam',
      source: 'Bewaard in',
      cost: 'Punten per +1',
      max: 'Maximum',
      marker: 'Marker',
      attribute: 'Attribuut als het blad geen vakje met deze naam heeft: {attribute}',
      partyTotal: 'Totaal van de groep: {total} {term}.',
      keptBox: 'Vakje op het blad: {name}',
      keptAttribute: 'Attribuut: {attribute}',
      keptNote: 'Een attribuut wordt niet op het personageblad getoond.',
    },
    prompts: {
      points: 'Punten',
      bonus: 'Bonus op de worp',
      max: 'Maximumaantal punten (0 voor geen limiet)',
    },
    errors: {
      unknownPool: 'Er is geen pool met de naam "{value}".',
      unknownPoolHint: 'Pools: {pools}.',
      badAmount: '"{value}" is geen aantal punten.',
      badAmountHint: 'Gebruik een geheel getal van 1 tot en met 9999.',
      boostNoPool: 'Boost gebruikt punten uit een pool.',
      poolInvalid: 'Een pool kan niet "{value}" heten.',
      poolExists: 'Er is al een pool met de naam "{value}".',
      poolFull: 'Er is geen ruimte voor nog een pool.',
      poolNameHint:
        'Gebruik een naam van hoogstens 40 letters, cijfers en spaties die geen andere pool heeft.',
      poolDefault:
        'De standaardpool, "{name}", kan niet worden verwijderd. Je kunt hem wel hernoemen.',
      poolMarkerHint:
        'Kies een marker uit je markersets die niet de marker van de instelling Marker is.',
      poolSetHint: 'Typ !inspiration pools om elke pool en zijn instellingen te zien.',
      denied: 'Dat kun je niet doen voor {name}.',
      gmOnly: 'Alleen de GM kan dat commando gebruiken.',
      gmOnlyHint: 'Spelers kunnen spend, party en help gebruiken.',
      spendOff: 'De GM heeft gebruik door spelers uitgeschakeld.',
      noCharacter: 'Deze tokens vertegenwoordigen geen personage: {names}.',
      nothingSelected: 'Selecteer eerst een token.',
      nothingSelectedHint:
        'Selecteer tokens die personages vertegenwoordigen, of voeg --ids toe met token- of personage-ID’s.',
      writeFailed: 'Kon het blad van {name} niet wijzigen.',
      offerGone: 'Die keuze is al gemaakt, of is verlopen.',
      passInvalid: 'Kies een ander groepslid dan degene die hem heeft.',
      undoGone: 'Dat gebruik is al ongedaan gemaakt, of is te oud.',
      unknownMarker: 'Er is geen tokenmarker met de naam "{value}".',
      unknownMarkerHint:
        'Gebruik de knop Marker in de instellingen om er een uit je markersets te kiezen.',
      badSetting: 'Kan {key} niet op "{value}" zetten.',
      badSettingHint: 'Typ !inspiration set om elke instelling en de keuzes te zien.',
      unknownCommand: 'Onbekend commando: {command}.',
      unknownCommandHint: 'Typ !inspiration help voor de lijst met commando’s.',
    },
    menu: {
      selected: 'Geselecteerde tokens',
      party: 'Groep',
      tools: 'Hulpmiddelen',
      hint: 'De volledige instructies staan in de handout "{help}".',
      noSheet: 'geen blad',
      noneYours: 'Je bestuurt geen personages met een blad.',
      partyEmpty: 'Je bestuurt geen groepsleden.',
      partyEmptyGm:
        'Er zit nog niemand in de groep. Wijs personages toe aan spelers, of selecteer tokens en klik op Aan groep toevoegen.',
      partyCount: '{count} van {total} hebben {term}.',
    },
    buttons: {
      menu: 'Menu',
      give: 'Geven',
      remove: 'Afnemen',
      toggle: 'Wisselen',
      spend: 'Gebruiken',
      party: 'Groep',
      partyAdd: 'Aan groep toevoegen',
      partyRemove: 'Uit groep halen',
      settings: 'Instellingen',
      macro: 'Spelersmacro',
      sync: 'Synchroniseren',
      status: 'Status',
      help: 'Help',
      reset: 'Instellingen herstellen',
      refresh: 'Vernieuwen',
      undo: 'Ongedaan maken',
      decline: 'Laten gaan',
      boost: 'Boost',
      pools: 'Pools',
      addPool: 'Pool toevoegen',
      deletePool: 'Pool verwijderen',
    },
    values: {
      on: 'Aan',
      off: 'Uit',
      none: 'Geen',
      noLimit: 'Geen limiet',
      tracking: {
        flag: 'Inspiratievakje op het blad',
        pool: 'Puntenpool',
      },
      source: {
        resource: 'Resourcevakje op het blad',
        attribute: 'Attribuut',
      },
      wording: {
        2014: 'Inspiratie (2014)',
        2024: 'Heroïsche inspiratie (2024)',
        auto: 'Volgens het blad',
      },
      announce: {
        public: 'Iedereen',
        gm: 'GM en eigenaars',
        off: 'Niemand',
      },
    },
    settings: {
      language: {
        label: 'Taal',
        desc: 'Taal voor menu’s, berichten en handouts.',
      },
      tracking: {
        label: 'Bijhouden',
        desc: 'Waarop Geven en Gebruiken werken: het inspiratievakje op de D&D-bladen, dat een personage wel of niet heeft, of een pool met punten die oploopt en met een paar punten tegelijk wordt gebruikt.',
      },
      marker: {
        label: 'Marker',
        desc: 'Tokenmarker die getoond wordt zolang een personage inspiratie heeft. Eigen markersets staan er ook bij.',
      },
      wording: {
        label: 'Benaming',
        desc: 'Noem het Inspiratie of Heroïsche inspiratie. "Volgens het blad" gebruikt de regels die op elk D&D 2024-blad gekozen zijn, en Inspiratie op het 2014-blad.',
      },
      announce: {
        label: 'Aankondigen',
        desc: 'Wie het chatbericht ziet wanneer inspiratie wordt verkregen of gebruikt.',
      },
      fx: {
        label: 'Speciaal effect',
        desc: 'Speel een speciaal effect af op de token wanneer die inspiratie krijgt.',
      },
      fxType: {
        label: 'Effecttype',
        desc: 'Welk effect afgespeeld wordt, zoals nova-holy, of de ID van een eigen effect.',
      },
      playerSpend: {
        label: 'Spelers mogen gebruiken',
        desc: 'Laat spelers inspiratie gebruiken voor de personages die ze besturen. De GM krijgt bericht, met een knop Ongedaan maken.',
      },
      playerOverview: {
        label: 'Spelers zien groep',
        desc: 'Laat spelers zien wie in de groep inspiratie heeft.',
      },
      passOn: {
        label: 'Doorgeven (2024)',
        desc: 'Volgens de 2024-regels mag een personage dat Heroïsche inspiratie zou krijgen terwijl het die al heeft, hem aan een ander groepslid geven.',
      },
    },
    status: {
      version: 'Versie',
      beacon: 'D&D 2024-bladen',
      legacy: '2014-bladen',
      none: 'Personages zonder inspiratievakje',
      rules2024: 'Met 2024-regels',
      party: 'Groepsleden',
      tracking: 'Bijhouden',
      pools: 'Pools',
      marker: 'Marker',
      fx: 'Speciaal effect',
      legacyCommand: 'Oud commando',
    },
    help: {
      menu: 'Toont het menu. Met geselecteerde tokens geeft of neemt het inspiratie af, zoals versie 0.1 deed.',
      give: 'Geeft inspiratie aan de geselecteerde personages.',
      remove:
        'Neemt inspiratie af van de geselecteerde personages, zonder dat het als gebruikt telt.',
      toggle:
        'Geeft inspiratie aan geselecteerde personages zonder, en neemt het af van wie het heeft.',
      spend: 'Gebruikt inspiratie voor de geselecteerde personages en laat het de GM weten.',
      party:
        'Toont wie in de groep inspiratie heeft, met knoppen om het te geven, af te nemen of te gebruiken.',
      partyEdit: 'Voegt de geselecteerde personages aan de groep toe, of haalt ze eruit.',
      ids: 'Werkt op de opgegeven token- of personage-ID’s in plaats van de geselecteerde tokens.',
      points:
        'Met een puntenpool: geeft, neemt af of gebruikt dat aantal punten. Zonder getal: 1. remove all neemt alle punten af.',
      boost:
        'Met een puntenpool: gebruikt punten om die bonus bij een worp op te tellen, tegen de kosten van de pool voor elke +1.',
      poolFlag: 'Werkt op de genoemde pool in plaats van de standaardpool.',
      pools: 'Toont de puntenpools en hun instellingen.',
      poolEdit:
        'Voegt een pool toe, of verwijdert er een. De punten op de bladen blijven zoals ze zijn.',
      poolSet:
        'Wijzigt een pool: de naam, waar hij wordt bewaard (resource of attribute), de punten die elke +1 kost, het maximumaantal punten (0 voor geen limiet), of de tokenmarker.',
      undo: 'Geeft gebruikte inspiratie terug. De ID staat in het GM-bericht over het gebruik.',
      macro:
        'Voegt de tokenactie "Inspiration" toe, waarop spelers klikken om inspiratie te gebruiken.',
      sync: 'Leest elk blad opnieuw en zet de markers goed.',
      set: 'Toont de instellingen, of wijzigt er een.',
      reset: 'Zet elke instelling terug op de standaardwaarde, behalve de taal.',
      status: 'Toont de versie, de gevonden bladen en de belangrijkste instellingen.',
      journal: 'Bouwt de handouts Help en Command Deck opnieuw op.',
      help: 'Toont deze lijst.',
    },
    helpPlayer: {
      menu: 'Toont je personages en of ze inspiratie hebben.',
      spend: 'Gebruikt inspiratie voor het geselecteerde personage.',
      boost: 'Gebruikt punten uit een pool om die bonus bij een worp op te tellen.',
      party: 'Toont de groep, als de GM dat toestaat.',
      help: 'Toont deze lijst.',
    },
    handout: {
      versionLabel: 'Versie',
      subtitle: 'Inspiratie, Heroïsche inspiratie en puntenpools voor elk spel',
      overview: {
        heading: 'Overzicht',
        body: 'InspirationTracker houdt D&D-inspiratie op het personageblad, de token en in de chat gelijk. Geef het via het menu, het blad of de tokenmarker, en elke token van dat personage toont de marker. Spelers kunnen het met één klik gebruiken, en de GM krijgt bericht, met een knop Ongedaan maken. Het werkt met het D&D 2024-blad, waar het Heroïsche inspiratie heet, en met het 2014 OGL-blad.',
      },
      quickStart: {
        heading: 'Snel aan de slag',
        steps: [
          'Open de handout Command Deck, of typ !inspiration voor het menu.',
          'Selecteer een token en klik op Geven. Het personage krijgt inspiratie en zijn tokens tonen de marker.',
          'Klik één keer op Spelersmacro, zodat spelers een tokenactie Inspiration krijgen om het te gebruiken.',
          'Klik op Groep om te zien wie inspiratie heeft.',
        ],
      },
      sheets: {
        heading: 'Personagebladen',
        colSheet: 'Blad',
        colWhere: 'Waar inspiratie wordt bijgehouden',
        colSheet2014: 'D&D 5E by Roll20 (2014 OGL)',
        where2014: 'Het vakje Inspiration, attribuut "inspiration".',
        colSheet2024: 'D&D Fifth Edition (5E & 5.5E, 2024)',
        where2024:
          'Het vakje Heroic Inspiration, gelezen en geschreven met getSheetItem en setSheetItem.',
        points: [
          'Het vakje op een blad aan- of uitvinken wordt meteen opgemerkt: de marker volgt, en uitvinken telt als gebruiken.',
          'Met Benaming op "Volgens het blad" gebruikt elk D&D 2024-personage de regels die in de bladinstellingen gekozen zijn: 2024-regels zeggen Heroïsche inspiratie, 2014-regels zeggen Inspiratie.',
          'Personages zonder een van beide bladen blijven ongemoeid, dus NPC-tokens veranderen niet.',
        ],
      },
      players: {
        heading: 'Spelers',
        points: [
          'Spelers kunnen inspiratie gebruiken voor personages die ze besturen: klik op Gebruiken in de chat, of op de tokenactie Inspiration.',
          'De GM krijgt een bericht wie het heeft gebruikt, met een knop Ongedaan maken.',
          'Wie als speler !inspiration typt, ziet zijn personages en of ze inspiratie hebben.',
          'Zet Spelers mogen gebruiken uit om het gebruik in handen van de GM te houden.',
        ],
      },
      passOn: {
        heading: 'Doorgeven (2024-regels)',
        points: [
          'Een personage kan niet twee keer Heroïsche inspiratie hebben. Als een personage dat hem heeft hem opnieuw zou krijgen, wordt zijn spelers gevraagd hem aan een ander groepslid te geven dat hem niet heeft.',
          'De keuze biedt elk groepslid zonder Heroïsche inspiratie, en Laten gaan. Ze verloopt na een uur.',
          'Volgens de 2014-regels krijgt de GM alleen te horen dat het personage al Inspiratie heeft.',
          'Zet Doorgeven uit om altijd dat bericht te krijgen.',
        ],
      },
      party: {
        heading: 'De groep',
        points: [
          'De groep bestaat uit elk personage dat een speler bestuurt. Selecteer tokens en klik op Aan groep toevoegen of Uit groep halen om hem te wijzigen.',
          'Het overzicht van de GM heeft knoppen Geven, Afnemen en Gebruiken voor elk lid.',
          'Zet Spelers zien groep aan om spelers het overzicht ook te laten zien. Ze krijgen alleen knoppen Gebruiken voor hun eigen personages.',
        ],
      },
      pools: {
        heading: 'Puntenpools',
        points: [
          'Een puntenpool is een getal dat oploopt en met een paar punten tegelijk wordt gebruikt: een pool met inspiratiepunten, heldenpunten, geluk, bennies en dergelijke. Het werkt met elk personageblad.',
          'Zet Bijhouden op Puntenpool, en Geven, Afnemen en Gebruiken werken op de standaardpool en vragen om hoeveel punten het gaat. De marker is zichtbaar zolang een personage punten heeft.',
          'Boost gebruikt punten om een worp te verhogen: typ de gewenste bonus, en Punten per +1 van de pool bepaalt de kosten. Bij 2 punten per +1 kost een bonus van 4 dus 8 punten. De Mod kondigt het gebruik aan; tel de bonus zelf bij de worp op.',
          'Gebruik wordt geweigerd als het personage niet genoeg punten heeft. De GM krijgt te horen wie wat heeft gebruikt, met een knop Ongedaan maken.',
          'Bewaard in "Resourcevakje op het blad" gebruikt het resourcevakje op het blad dat de naam van de pool heeft, zoals een vakje Other Resource met de naam Inspiration op het 2014 D&D-blad. Heeft het blad geen vakje met die naam, of staat er "Attribuut", dan worden de punten bewaard in een gewoon attribuut, zoals inspiration_pool. Het D&D 2024-blad gebruikt altijd het attribuut.',
          'De groepskaart en de eigen kaart van een speler zeggen waar de punten van elk personage worden bewaard: de naam van het vakje op het blad, of het attribuut. Een attribuut wordt niet op het personageblad getoond.',
          'Het getal op het blad met de hand wijzigen kan gewoon: de marker volgt.',
          'Klik op Pools om de standaardpool te hernoemen, de kosten en het maximum in te stellen, of meer pools toe te voegen. Andere pools gebruik je met hun knop Groep, of door --pool en de naam van de pool aan een commando toe te voegen.',
          'Bardic Inspiration werkt als een eigen pool: klik op Pool toevoegen en noem hem Bardic Inspiration, zet het Maximum op 1 en kies de Marker. De GM geeft 1 vanaf de Groep-kaart van die pool wanneer de bard een dobbelsteen uitdeelt, en de houder klikt op Gebruiken wanneer hij hem inzet. De Mod markeert wie een dobbelsteen heeft; de speler gooit hem zelf.',
        ],
      },
      markers: {
        heading: 'Tokenmarkers',
        points: [
          'Kies de marker met de instelling Marker. De gekleurde stippen van Roll20, de standaardmarkers en je eigen markersets staan erbij.',
          'De marker met de hand, of met TokenMod, aan een token toevoegen geeft het personage inspiratie. Hem eraf halen gebruikt hem.',
          'Een andere marker kiezen verplaatst hem meteen op elke token.',
          'De eigen conditiemarkers van het D&D 2024-blad worden niet aangeboden, omdat het blad die zelf zet.',
        ],
      },
      commands: {
        heading: 'Commando’s',
        intro:
          'Elk commando begint met !inspiration. Commando’s werken op de geselecteerde tokens, tenzij --ids is opgegeven.',
        mods: 'Andere Mods kunnen deze commando’s ook sturen, bijvoorbeeld vanuit ScriptCards. Andere Mods kunnen ook InspirationTracker.give, spend, remove en isInspired aanroepen.',
        colCommand: 'Commando',
        colDesc: 'Wat het doet',
      },
      settings: {
        heading: 'Instellingen',
        intro: 'Wijzig ze met de knop Instellingen, of typ !inspiration set <setting> <value>.',
        colKey: 'Instelling',
        colName: 'Naam',
        colDesc: 'Wat het doet',
      },
      upgrading: {
        heading: 'Upgraden vanaf 0.1',
        points: [
          'De marker, het speciale effect en het effecttype uit versie 0.1 blijven behouden.',
          'Als je in 0.1 een eigen commando had gekozen, werkt dat nog steeds naast !inspiration.',
          '!inspiration met geselecteerde tokens geeft of neemt nog steeds inspiratie af.',
        ],
      },
      troubleshooting: {
        heading: 'Problemen oplossen',
        points: [
          'Verschijnt de marker niet op een token? Klik op Synchroniseren om elk blad opnieuw te lezen.',
          'Een token die geen personage vertegenwoordigt, kan geen inspiratie hebben. Koppel hem eerst aan een personage.',
          'Gebeurt er niets als een speler op Gebruiken klikt? Controleer of het personage aan die speler is toegewezen.',
          'Fouten worden naar de API-console op de pagina Mod Scripts geschreven.',
        ],
      },
      languages: {
        heading: 'Talen',
        body: 'InspirationTracker is vertaald in de onderstaande talen. Kies er een met de instelling Taal.',
        colCode: 'Code',
        colName: 'Taal',
        colNative: 'Eigen naam',
      },
      credits: {
        heading: 'Met dank aan',
        original: 'Oorspronkelijke Mod door',
        maintainer: 'Versie 1 onderhouden door',
        support: 'Meld bugs en ideeën op het Roll20 Mod-forum of op GitHub.',
      },
      footer: 'Knoppen voor elke actie staan in de handout "{deck}".',
    },
    deck: {
      subtitle: 'Command Deck',
      selectedDesc: 'Selecteer een of meer tokens en klik dan.',
      partyDesc: 'Zie wie inspiratie heeft, en kies wie in de groep zit.',
      poolsTitle: 'Puntenpool',
      poolsDesc: 'Met Bijhouden op Puntenpool: selecteer tokens, klik en typ het aantal.',
      toolsDesc: 'Menu, instellingen, de spelersmacro en help.',
      footer: 'De volledige instructies staan in de handout "{help}".',
    },
  };

  const TRANSLATION$h = {
    terms: {
      heroic: 'Heroic Inspiration',
      classic: 'Inspiration',
    },
    titles: {
      ready: 'InspirationTracker is ready.',
      settings: 'InspirationTracker Settings',
      help: 'InspirationTracker Commands',
      party: 'Party Inspiration',
      poolParty: 'Party {term}',
      pools: 'Points Pools',
      yours: 'Your Characters',
      status: 'InspirationTracker Status',
    },
    messages: {
      gained: '{name} has {term}!',
      spent: '{name} uses {term}.',
      spentBy: '{player} spent {term} for {name}.',
      spentSheet: '{name} no longer has {term} (changed on the sheet or token).',
      restored: '{name} has {term} back.',
      removed: '{term} taken away from {name}.',
      already: '{name} already has {term}.',
      none: '{name} does not have {term}.',
      busy: '{name} is still being updated. Try again in a moment.',
      passOffer:
        '{name} already has {term} and cannot hold it twice. Give it to a party member who does not have it, or let it go.',
      passNobody: 'Every other party member already has it.',
      passAsked: 'Asked the players of {name} who should get the {term}.',
      passed: '{from} gives {term} to {to}!',
      passAlready: '{to} already has it. Choose someone else.',
      declined: '{name} lets the extra {term} go.',
      undoAlready: '{name} already has it again.',
      synced: 'Sheets read: {checked}. With inspiration: {inspired}.',
      migrated:
        'Settings from version 0.1 were kept: marker, special effect and its type. The new settings start at their defaults.',
      legacyCommand: 'Your old command {command} still works, as well as {main}.',
      macroHint:
        'To give players a Spend button, run {command}. It adds a token action for everyone.',
      macro:
        'The "{name}" macro is ready: players see it as a token action when they select a token they control.',
      journal: 'Help and Command Deck handouts rebuilt.',
      readyHint: 'Type {command} for the menu, or open the Command Deck handout.',
    },
    pool: {
      gained: '{name} gains {amount} {term} ({before} → {after}).',
      spent: '{name} spends {amount} {term} ({before} → {after}).',
      boosted: '{name} spends {amount} {term} for +{bonus} to the roll ({before} → {after}).',
      spentBy: '{player} spent {amount} {term} for {name}.',
      restored: '{name} has {amount} {term} back ({before} → {after}).',
      removed: '{amount} {term} taken away from {name} ({before} → {after}).',
      none: '{name} has no {term}.',
      short: '{name} has {have} {term}, and that needs {need}.',
      full: '{name} already has the most {term} allowed ({max}).',
    },
    pools: {
      introFlag:
        'Tracking is set to the sheet inspiration box. Set it to Points pool to make "{name}" the pool that Give and Spend work on. Other pools are used with --pool.',
      introPool:
        'Give, Spend and Boost work on "{name}". Other pools are used from their Party button, or with --pool.',
      defaultLabel: '{name} (default)',
      name: 'Name',
      source: 'Kept in',
      cost: 'Points per +1',
      max: 'Maximum',
      marker: 'Marker',
      attribute: 'Attribute when the sheet has no box with this name: {attribute}',
      partyTotal: 'Party total: {total} {term}.',
      keptBox: 'Sheet box: {name}',
      keptAttribute: 'Attribute: {attribute}',
      keptNote: 'An attribute is not shown on the character sheet.',
    },
    prompts: {
      points: 'Points',
      bonus: 'Bonus to the roll',
      max: 'Most points allowed (0 for no limit)',
    },
    errors: {
      unknownPool: 'There is no pool called "{value}".',
      unknownPoolHint: 'Pools: {pools}.',
      badAmount: '"{value}" is not a number of points.',
      badAmountHint: 'Use a whole number from 1 to 9999.',
      boostNoPool: 'Boost spends points from a pool.',
      poolInvalid: 'A pool cannot be called "{value}".',
      poolExists: 'There is already a pool called "{value}".',
      poolFull: 'There is no room for another pool.',
      poolNameHint: 'Use a name of up to 40 letters, digits and spaces that no other pool has.',
      poolDefault: 'The default pool, "{name}", cannot be deleted. It can be renamed.',
      poolMarkerHint:
        'Pick a marker from your marker sets that is not the one in the Marker setting.',
      poolSetHint: 'Type !inspiration pools to see every pool and its settings.',
      denied: 'You cannot do that for {name}.',
      gmOnly: 'Only the GM can use that command.',
      gmOnlyHint: 'Players can use spend, party and help.',
      spendOff: 'The GM has turned off spending by players.',
      noCharacter: 'These tokens do not represent a character: {names}.',
      nothingSelected: 'Select a token first.',
      nothingSelectedHint:
        'Select tokens that represent characters, or add --ids with token or character IDs.',
      writeFailed: 'Could not change the sheet of {name}.',
      offerGone: 'That choice has already been made, or it has expired.',
      passInvalid: 'Choose a party member other than the one who has it.',
      undoGone: 'That spend has already been undone, or is too old.',
      unknownMarker: 'There is no token marker called "{value}".',
      unknownMarkerHint: 'Use the Marker button in the settings to pick one from your marker sets.',
      badSetting: 'Cannot set {key} to "{value}".',
      badSettingHint: 'Type !inspiration set to see every setting and its choices.',
      unknownCommand: 'Unknown command: {command}.',
      unknownCommandHint: 'Type !inspiration help for the list of commands.',
    },
    menu: {
      selected: 'Selected tokens',
      party: 'Party',
      tools: 'Tools',
      hint: 'Full instructions are in the "{help}" handout.',
      noSheet: 'no sheet',
      noneYours: 'You do not control any characters with a sheet.',
      partyEmpty: 'You do not control any party members.',
      partyEmptyGm:
        'Nobody is in the party yet. Assign characters to players, or select tokens and click Add to Party.',
      partyCount: '{count} of {total} have {term}.',
    },
    buttons: {
      menu: 'Menu',
      give: 'Give',
      remove: 'Remove',
      toggle: 'Toggle',
      spend: 'Spend',
      party: 'Party',
      partyAdd: 'Add to Party',
      partyRemove: 'Remove from Party',
      settings: 'Settings',
      macro: 'Player Macro',
      sync: 'Sync',
      status: 'Status',
      help: 'Help',
      reset: 'Reset Settings',
      refresh: 'Refresh',
      undo: 'Undo',
      decline: 'Let it go',
      boost: 'Boost',
      pools: 'Pools',
      addPool: 'Add Pool',
      deletePool: 'Delete Pool',
    },
    values: {
      on: 'On',
      off: 'Off',
      none: 'None',
      noLimit: 'No limit',
      tracking: {
        flag: 'Sheet inspiration box',
        pool: 'Points pool',
      },
      source: {
        resource: 'Sheet resource box',
        attribute: 'Attribute',
      },
      wording: {
        auto: 'From the sheet',
        2014: 'Inspiration (2014)',
        2024: 'Heroic Inspiration (2024)',
      },
      announce: {
        public: 'Everyone',
        gm: 'GM and owners',
        off: 'Nobody',
      },
    },
    settings: {
      language: {
        label: 'Language',
        desc: 'Language for menus, messages and handouts.',
      },
      tracking: {
        label: 'Tracking',
        desc: 'What Give and Spend work on: the inspiration box on the D&D sheets, which a character has or does not have, or a pool of points that builds up and is spent a few at a time.',
      },
      marker: {
        label: 'Marker',
        desc: 'Token marker shown while a character has inspiration. Custom marker sets are listed too.',
      },
      wording: {
        label: 'Wording',
        desc: 'Call it Inspiration or Heroic Inspiration. "From the sheet" uses the rules chosen on each D&D 2024 sheet, and Inspiration on the 2014 sheet.',
      },
      announce: {
        label: 'Announce',
        desc: 'Who sees the chat message when inspiration is gained or spent.',
      },
      fx: {
        label: 'Special Effect',
        desc: 'Play a special effect on the token when it gains inspiration.',
      },
      fxType: {
        label: 'Effect Type',
        desc: 'Which effect to play, such as nova-holy, or the ID of a custom effect.',
      },
      playerSpend: {
        label: 'Players Can Spend',
        desc: 'Let players spend inspiration for the characters they control. The GM is told, with an Undo button.',
      },
      playerOverview: {
        label: 'Players See Party',
        desc: 'Let players see who in the party has inspiration.',
      },
      passOn: {
        label: 'Pass On (2024)',
        desc: 'Under the 2024 rules, a character who would gain Heroic Inspiration while having it may give it to another party member.',
      },
    },
    status: {
      version: 'Version',
      beacon: 'D&D 2024 sheets',
      legacy: '2014 sheets',
      none: 'Characters with no inspiration box',
      rules2024: 'Using 2024 rules',
      party: 'Party members',
      tracking: 'Tracking',
      pools: 'Pools',
      marker: 'Marker',
      fx: 'Special effect',
      legacyCommand: 'Old command',
    },
    help: {
      menu: 'Shows the menu. With tokens selected, gives or takes away inspiration, as version 0.1 did.',
      give: 'Gives inspiration to the selected characters.',
      remove: 'Takes inspiration away from the selected characters, without counting it as spent.',
      toggle:
        'Gives inspiration to selected characters without it, and takes it from those with it.',
      spend: 'Spends inspiration for the selected characters and tells the GM.',
      party: 'Shows who in the party has inspiration, with buttons to give, remove or spend it.',
      partyEdit: 'Adds the selected characters to the party, or takes them out.',
      ids: 'Works on the token or character IDs given instead of the selected tokens.',
      points:
        'With a points pool: gives, takes away or spends that many points. Without a number, 1. remove all takes every point.',
      boost:
        "With a points pool: spends points to add that bonus to a roll, at the pool's cost for each +1.",
      poolFlag: 'Works on the named pool instead of the default one.',
      pools: 'Shows the points pools and their settings.',
      poolEdit: 'Adds a pool, or deletes one. The points on the sheets are left as they are.',
      poolSet:
        'Changes a pool: its name, where it is kept (resource or attribute), the points each +1 costs, the most points allowed (0 for no limit), or its token marker.',
      undo: 'Gives back inspiration that was spent. The ID comes from the GM message about the spend.',
      macro: 'Adds the "Inspiration" token action, which players click to spend inspiration.',
      sync: 'Reads every sheet again and puts the markers right.',
      set: 'Shows the settings, or changes one.',
      reset: 'Puts every setting back to its default, except the language.',
      status: 'Shows the version, the sheets found and the main settings.',
      journal: 'Rebuilds the Help and Command Deck handouts.',
      help: 'Shows this list.',
    },
    helpPlayer: {
      menu: 'Shows your characters and whether they have inspiration.',
      spend: 'Spends inspiration for the selected character.',
      boost: 'Spends points from a pool to add that bonus to a roll.',
      party: 'Shows the party, if the GM allows it.',
      help: 'Shows this list.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Inspiration, Heroic Inspiration and points pools for any game',
      overview: {
        heading: 'Overview',
        body: 'InspirationTracker keeps D&D inspiration on the character sheet, the token and the chat in step. Give it from the menu, the sheet or the token marker, and every token for that character shows the marker. Players can spend it with one click, and the GM is told, with an Undo button. It works with the D&D 2024 sheet, where it is called Heroic Inspiration, and with the 2014 OGL sheet.',
      },
      quickStart: {
        heading: 'Quick Start',
        steps: [
          'Open the Command Deck handout, or type !inspiration for the menu.',
          'Select a token and click Give. The character gains inspiration and its tokens show the marker.',
          'Click Player Macro once, so players get an Inspiration token action to spend it.',
          'Click Party to see who has inspiration.',
        ],
      },
      sheets: {
        heading: 'Character Sheets',
        colSheet: 'Sheet',
        colWhere: 'Where inspiration is kept',
        colSheet2014: 'D&D 5E by Roll20 (2014 OGL)',
        where2014: 'The Inspiration box, attribute "inspiration".',
        colSheet2024: 'D&D Fifth Edition (5E & 5.5E, 2024)',
        where2024:
          'The Heroic Inspiration box, read and written with getSheetItem and setSheetItem.',
        points: [
          'Ticking or clearing the box on a sheet is noticed straight away: the marker follows, and clearing it counts as spending it.',
          'With Wording set to "From the sheet", each D&D 2024 character uses the rules chosen in its sheet settings: 2024 rules say Heroic Inspiration, 2014 rules say Inspiration.',
          'Characters with neither sheet are left alone, so NPC tokens are not changed.',
        ],
      },
      players: {
        heading: 'Players',
        points: [
          'Players can spend inspiration for characters they control: click Spend in chat, or the Inspiration token action.',
          'The GM gets a message saying who spent it, with an Undo button.',
          'Typing !inspiration shows a player their characters and whether they have inspiration.',
          "Turn Players Can Spend off to keep spending in the GM's hands.",
        ],
      },
      passOn: {
        heading: 'Passing It On (2024 Rules)',
        points: [
          'A character cannot have Heroic Inspiration twice. When one who has it would gain it again, their players are asked to give it to another party member who does not have it.',
          'The choice offers every party member without Heroic Inspiration, and Let it go. It expires after an hour.',
          'Under the 2014 rules, the GM is just told that the character already has Inspiration.',
          'Turn Pass On off to always get that message instead.',
        ],
      },
      party: {
        heading: 'The Party',
        points: [
          'The party is every character a player controls. Select tokens and click Add to Party or Remove from Party to change it.',
          "The GM's overview has Give, Remove and Spend buttons for each member.",
          'Turn Players See Party on to let players see the overview too. They get Spend buttons only for their own characters.',
        ],
      },
      pools: {
        heading: 'Points Pools',
        points: [
          'A points pool is a number that builds up and is spent a few at a time: a pool of inspiration points, hero points, luck, bennies and the like. It works with any character sheet.',
          'Set Tracking to Points pool, and Give, Remove and Spend work on the default pool, asking how many points. The marker shows while a character has any points.',
          "Boost spends points to raise a roll: type the bonus wanted, and the pool's Points per +1 decides the cost. At 2 points per +1, a bonus of 4 costs 8 points. The Mod announces the spend; add the bonus to the roll yourself.",
          'A spend is refused when the character does not have enough points. The GM is told who spent what, with an Undo button.',
          'Kept in "Sheet resource box" uses the resource box on the sheet that has the pool\'s name, such as an Other Resource box named Inspiration on the 2014 D&D sheet. When the sheet has no box with that name, or with "Attribute", the points are kept in a plain attribute, such as inspiration_pool. The D&D 2024 sheet always uses the attribute.',
          "The Party card and a player's own card say where each character's points are kept: the name of the sheet box, or the attribute. An attribute is not shown on the character sheet.",
          'Changing the number on the sheet by hand is fine: the marker follows.',
          "Click Pools to rename the default pool, set its cost and maximum, or add more pools. Other pools are used from their Party button, or by adding --pool and the pool's name to a command.",
          "Bardic Inspiration works as a pool of its own: click Add Pool and name it Bardic Inspiration, set its Maximum to 1 and choose its Marker. The GM gives 1 from that pool's Party card when the bard hands out a die, and the holder clicks Spend when they use it. The Mod marks who holds a die; the player rolls it.",
        ],
      },
      markers: {
        heading: 'Token Markers',
        points: [
          "Choose the marker with the Marker setting. Roll20's coloured dots, the default markers and your custom marker sets are listed.",
          'Adding the marker to a token by hand, or with TokenMod, gives the character inspiration. Taking it off spends it.',
          'Changing the marker moves it on every token straight away.',
          "The D&D 2024 sheet's own condition markers are not offered, because the sheet sets them itself.",
        ],
      },
      commands: {
        heading: 'Commands',
        intro:
          'Every command starts with !inspiration. Commands act on the selected tokens unless --ids is given.',
        mods: 'Other Mods can send these commands too, for example from ScriptCards. Other Mods can also call InspirationTracker.give, spend, remove and isInspired.',
        colCommand: 'Command',
        colDesc: 'What it does',
      },
      settings: {
        heading: 'Settings',
        intro: 'Change these with the Settings button, or type !inspiration set <setting> <value>.',
        colKey: 'Setting',
        colName: 'Name',
        colDesc: 'What it does',
      },
      upgrading: {
        heading: 'Upgrading from 0.1',
        points: [
          'The marker, special effect and effect type from version 0.1 are kept.',
          'If you chose your own command in 0.1, it still works alongside !inspiration.',
          '!inspiration with tokens selected still gives or takes away inspiration.',
        ],
      },
      troubleshooting: {
        heading: 'Troubleshooting',
        points: [
          'Marker not showing on a token? Click Sync to read every sheet again.',
          'A token that does not represent a character cannot have inspiration. Link it to a character first.',
          'Nothing happens when a player clicks Spend? Check that the character is assigned to that player.',
          'Errors are written to the API console on the Mod Scripts page.',
        ],
      },
      languages: {
        heading: 'Languages',
        body: 'InspirationTracker is translated into the languages below. Choose one with the Language setting.',
        colCode: 'Code',
        colName: 'Language',
        colNative: 'Native name',
      },
      credits: {
        heading: 'Credits',
        original: 'Original Mod by',
        maintainer: 'Version 1 maintained by',
        support: 'Report bugs and ideas on the Roll20 Mod forum or on GitHub.',
      },
      footer: 'Buttons for every action are in the "{deck}" handout.',
    },
    deck: {
      subtitle: 'Command Deck',
      selectedDesc: 'Select one or more tokens, then click.',
      partyDesc: 'See who has inspiration, and choose who is in the party.',
      poolsTitle: 'Points pool',
      poolsDesc: 'With Tracking set to Points pool: select tokens, click, and type the number.',
      toolsDesc: 'Menu, settings, the player macro and help.',
      footer: 'Full instructions are in the "{help}" handout.',
    },
  };

  const TRANSLATION$g = {
    terms: {
      heroic: 'Sankarillinen inspiraatio',
      classic: 'Inspiraatio',
    },
    titles: {
      ready: 'InspirationTracker on valmis.',
      settings: 'InspirationTrackerin asetukset',
      help: 'InspirationTrackerin komennot',
      party: 'Seurueen inspiraatio',
      poolParty: 'Seurue: {term}',
      pools: 'Pistevarannot',
      yours: 'Omat hahmosi',
      status: 'InspirationTrackerin tila',
    },
    messages: {
      gained: '{name} sai: {term}!',
      spent: '{name} käyttää: {term}.',
      spentBy: '{player} käytti hahmolle {name}: {term}.',
      spentSheet: 'Hahmolla {name} ei enää ole: {term} (muutettu lomakkeella tai pelimerkissä).',
      restored: '{name} sai takaisin: {term}.',
      removed: '{name} menetti: {term}.',
      already: 'Hahmolla {name} on jo: {term}.',
      none: 'Hahmolla {name} ei ole: {term}.',
      busy: 'Hahmoa {name} päivitetään vielä. Yritä hetken päästä uudelleen.',
      passOffer:
        'Hahmolla {name} on jo: {term}, eikä sitä voi olla kahdesti. Anna se seurueen jäsenelle, jolla sitä ei ole, tai luovu siitä.',
      passNobody: 'Kaikilla muilla seurueen jäsenillä se on jo.',
      passAsked: 'Hahmon {name} pelaajilta kysyttiin, kuka saa: {term}.',
      passed: '{from} antaa hahmolle {to}: {term}!',
      passAlready: 'Hahmolla {to} se on jo. Valitse joku muu.',
      declined: '{name} luopuu ylimääräisestä: {term}.',
      undoAlready: 'Hahmolla {name} se on jo taas.',
      synced: 'Luettuja lomakkeita: {checked}. Inspiraatio: {inspired}.',
      migrated:
        'Version 0.1 asetukset säilytettiin: tunnus, erikoistehoste ja sen tyyppi. Uudet asetukset alkavat oletusarvoista.',
      legacyCommand: 'Vanha komentosi {command} toimii yhä, kuten myös {main}.',
      macroHint:
        'Anna pelaajille Käytä-painike suorittamalla {command}. Se lisää pelimerkkitoiminnon kaikille.',
      macro:
        'Makro "{name}" on valmis: pelaajat näkevät sen pelimerkkitoimintona, kun he valitsevat hallitsemansa pelimerkin.',
      journal: 'Ohje- ja Command Deck -monisteet luotiin uudelleen.',
      readyHint: 'Kirjoita {command} avataksesi valikon, tai avaa Command Deck -moniste.',
    },
    pool: {
      gained: '{name} sai: {amount} {term} ({before} → {after}).',
      spent: '{name} käyttää: {amount} {term} ({before} → {after}).',
      boosted: '{name} käyttää: {amount} {term}, heittoon +{bonus} ({before} → {after}).',
      spentBy: '{player} käytti hahmolle {name}: {amount} {term}.',
      restored: '{name} sai takaisin: {amount} {term} ({before} → {after}).',
      removed: '{name} menetti: {amount} {term} ({before} → {after}).',
      none: 'Hahmolla {name} ei ole pisteitä: {term}.',
      short: 'Hahmolla {name} on {have}, mutta tarvitaan {need}: {term}.',
      full: 'Hahmolla {name} on jo suurin sallittu määrä ({max}): {term}.',
    },
    pools: {
      introFlag:
        'Seuranta on asetettu lomakkeen inspiraatioruutuun. Aseta se arvoon Pistevaranto, niin Anna ja Käytä kohdistuvat varantoon "{name}". Muita varantoja käytetään valitsimella --pool.',
      introPool:
        'Anna, Käytä ja Tehosta kohdistuvat varantoon "{name}". Muita varantoja käytetään niiden Seurue-painikkeesta tai valitsimella --pool.',
      defaultLabel: '{name} (oletus)',
      name: 'Nimi',
      source: 'Säilytyspaikka',
      cost: 'Pisteitä per +1',
      max: 'Enimmäismäärä',
      marker: 'Tunnus',
      attribute: 'Attribuutti, kun lomakkeella ei ole tämän nimistä ruutua: {attribute}',
      partyTotal: 'Seurueella yhteensä: {total} {term}.',
      keptBox: 'Lomakkeen ruutu: {name}',
      keptAttribute: 'Attribuutti: {attribute}',
      keptNote: 'Attribuuttia ei näytetä hahmolomakkeella.',
    },
    prompts: {
      points: 'Pisteet',
      bonus: 'Bonus heittoon',
      max: 'Suurin sallittu pistemäärä (0 = ei rajaa)',
    },
    errors: {
      unknownPool: 'Varantoa nimeltä "{value}" ei ole.',
      unknownPoolHint: 'Varannot: {pools}.',
      badAmount: '"{value}" ei ole pistemäärä.',
      badAmountHint: 'Käytä kokonaislukua väliltä 1–9999.',
      boostNoPool: 'Tehosta käyttää pisteitä varannosta.',
      poolInvalid: 'Varannon nimi ei voi olla "{value}".',
      poolExists: 'Varanto nimeltä "{value}" on jo olemassa.',
      poolFull: 'Uudelle varannolle ei ole tilaa.',
      poolNameHint:
        'Käytä enintään 40 merkin nimeä, jossa on kirjaimia, numeroita ja välilyöntejä ja jota ei ole millään muulla varannolla.',
      poolDefault: 'Oletusvarantoa "{name}" ei voi poistaa. Sen voi nimetä uudelleen.',
      poolMarkerHint: 'Valitse tunnussarjoistasi tunnus, joka ei ole sama kuin Tunnus-asetuksessa.',
      poolSetHint: 'Kirjoita !inspiration pools nähdäksesi kaikki varannot ja niiden asetukset.',
      denied: 'Et voi tehdä sitä hahmolle {name}.',
      gmOnly: 'Vain GM voi käyttää tätä komentoa.',
      gmOnlyHint: 'Pelaajat voivat käyttää komentoja spend, party ja help.',
      spendOff: 'GM on estänyt pelaajia käyttämästä inspiraatiota.',
      noCharacter: 'Nämä pelimerkit eivät edusta hahmoa: {names}.',
      nothingSelected: 'Valitse ensin pelimerkki.',
      nothingSelectedHint:
        'Valitse hahmoja edustavia pelimerkkejä, tai lisää --ids pelimerkkien tai hahmojen ID:illä.',
      writeFailed: 'Hahmon {name} lomaketta ei voitu muuttaa.',
      offerGone: 'Valinta on jo tehty, tai se on vanhentunut.',
      passInvalid: 'Valitse joku muu seurueen jäsen kuin se, jolla se on.',
      undoGone: 'Käyttö on jo peruttu, tai se on liian vanha.',
      unknownMarker: 'Pelimerkin tunnusta nimeltä "{value}" ei ole.',
      unknownMarkerHint: 'Valitse tunnus tunnussarjoistasi asetusten Tunnus-painikkeella.',
      badSetting: 'Asetusta {key} ei voi asettaa arvoon "{value}".',
      badSettingHint:
        'Kirjoita !inspiration set nähdäksesi kaikki asetukset ja niiden vaihtoehdot.',
      unknownCommand: 'Tuntematon komento: {command}.',
      unknownCommandHint: 'Kirjoita !inspiration help nähdäksesi komentoluettelon.',
    },
    menu: {
      selected: 'Valitut pelimerkit',
      party: 'Seurue',
      tools: 'Työkalut',
      hint: 'Täydet ohjeet ovat monisteessa "{help}".',
      noSheet: 'ei lomaketta',
      noneYours: 'Et hallitse yhtään hahmoa, jolla on lomake.',
      partyEmpty: 'Et hallitse yhtään seurueen jäsentä.',
      partyEmptyGm:
        'Seurueessa ei ole vielä ketään. Määritä hahmoja pelaajille, tai valitse pelimerkkejä ja napsauta Lisää seurueeseen.',
      partyCount: '{term}: {count}/{total}.',
    },
    buttons: {
      menu: 'Valikko',
      give: 'Anna',
      remove: 'Poista',
      toggle: 'Vaihda',
      spend: 'Käytä',
      party: 'Seurue',
      partyAdd: 'Lisää seurueeseen',
      partyRemove: 'Poista seurueesta',
      settings: 'Asetukset',
      macro: 'Pelaajan makro',
      sync: 'Synkronoi',
      status: 'Tila',
      help: 'Ohje',
      reset: 'Palauta asetukset',
      refresh: 'Päivitä',
      undo: 'Kumoa',
      decline: 'Luovu',
      boost: 'Tehosta',
      pools: 'Varannot',
      addPool: 'Lisää varanto',
      deletePool: 'Poista varanto',
    },
    values: {
      on: 'Päällä',
      off: 'Pois',
      none: 'Ei mitään',
      noLimit: 'Ei rajaa',
      tracking: {
        flag: 'Lomakkeen inspiraatioruutu',
        pool: 'Pistevaranto',
      },
      source: {
        resource: 'Lomakkeen resurssiruutu',
        attribute: 'Attribuutti',
      },
      wording: {
        2014: 'Inspiraatio (2014)',
        2024: 'Sankarillinen inspiraatio (2024)',
        auto: 'Lomakkeen mukaan',
      },
      announce: {
        public: 'Kaikki',
        gm: 'GM ja omistajat',
        off: 'Ei kukaan',
      },
    },
    settings: {
      language: {
        label: 'Kieli',
        desc: 'Valikkojen, viestien ja monisteiden kieli.',
      },
      tracking: {
        label: 'Seuranta',
        desc: 'Mihin Anna ja Käytä kohdistuvat: D&D-lomakkeiden inspiraatioruutuun, joka hahmolla joko on tai ei ole, vai pistevarantoon, joka karttuu ja jota käytetään muutama piste kerrallaan.',
      },
      marker: {
        label: 'Tunnus',
        desc: 'Pelimerkin tunnus, joka näkyy, kun hahmolla on inspiraatio. Myös omat tunnussarjat näytetään.',
      },
      wording: {
        label: 'Nimitys',
        desc: 'Kutsu sitä nimellä Inspiraatio tai Sankarillinen inspiraatio. "Lomakkeen mukaan" käyttää kunkin D&D 2024 -lomakkeen valittuja sääntöjä, ja 2014-lomakkeella nimitystä Inspiraatio.',
      },
      announce: {
        label: 'Ilmoitus',
        desc: 'Kuka näkee chat-viestin, kun inspiraatio saadaan tai käytetään.',
      },
      fx: {
        label: 'Erikoistehoste',
        desc: 'Toista pelimerkissä erikoistehoste, kun se saa inspiraation.',
      },
      fxType: {
        label: 'Tehosteen tyyppi',
        desc: 'Toistettava tehoste, esimerkiksi nova-holy, tai oman tehosteen ID.',
      },
      playerSpend: {
        label: 'Pelaajat voivat käyttää',
        desc: 'Anna pelaajien käyttää inspiraatiota hallitsemilleen hahmoille. GM saa tiedon ja Kumoa-painikkeen.',
      },
      playerOverview: {
        label: 'Pelaajat näkevät seurueen',
        desc: 'Anna pelaajien nähdä, kenellä seurueessa on inspiraatio.',
      },
      passOn: {
        label: 'Luovuta eteenpäin (2024)',
        desc: 'Vuoden 2024 säännöissä hahmo, joka saisi Sankarillisen inspiraation, vaikka sillä on se jo, voi antaa sen toiselle seurueen jäsenelle.',
      },
    },
    status: {
      version: 'Versio',
      beacon: 'D&D 2024 -lomakkeet',
      legacy: '2014-lomakkeet',
      none: 'Hahmot ilman inspiraatioruutua',
      rules2024: 'Käyttää 2024-sääntöjä',
      party: 'Seurueen jäsenet',
      tracking: 'Seuranta',
      pools: 'Varannot',
      marker: 'Tunnus',
      fx: 'Erikoistehoste',
      legacyCommand: 'Vanha komento',
    },
    help: {
      menu: 'Näyttää valikon. Kun pelimerkkejä on valittu, antaa tai poistaa inspiraation, kuten versio 0.1 teki.',
      give: 'Antaa inspiraation valituille hahmoille.',
      remove: 'Poistaa inspiraation valituilta hahmoilta laskematta sitä käytetyksi.',
      toggle:
        'Antaa inspiraation valituille hahmoille, joilla sitä ei ole, ja poistaa sen niiltä, joilla se on.',
      spend: 'Käyttää valittujen hahmojen inspiraation ja ilmoittaa GM:lle.',
      party:
        'Näyttää, kenellä seurueessa on inspiraatio, ja painikkeet sen antamiseen, poistamiseen tai käyttämiseen.',
      partyEdit: 'Lisää valitut hahmot seurueeseen tai poistaa ne siitä.',
      ids: 'Toimii annetuilla pelimerkkien tai hahmojen ID:illä valittujen pelimerkkien sijaan.',
      points:
        'Pistevarannon kanssa: antaa, poistaa tai käyttää sen verran pisteitä. Ilman lukua 1. remove all poistaa kaikki pisteet.',
      boost:
        'Pistevarannon kanssa: käyttää pisteitä ja lisää heittoon annetun bonuksen; jokainen +1 maksaa varannon hinnan verran.',
      poolFlag: 'Kohdistuu nimettyyn varantoon oletusvarannon sijaan.',
      pools: 'Näyttää pistevarannot ja niiden asetukset.',
      poolEdit: 'Lisää varannon tai poistaa sellaisen. Lomakkeiden pisteet jätetään ennalleen.',
      poolSet:
        'Muuttaa varantoa: sen nimeä, säilytyspaikkaa (resource tai attribute), yhden +1:n pistehintaa, suurinta sallittua pistemäärää (0 = ei rajaa) tai sen pelimerkin tunnusta.',
      undo: 'Palauttaa käytetyn inspiraation. ID löytyy GM:n saamasta käyttöviestistä.',
      macro:
        'Lisää pelimerkkitoiminnon "Inspiration", jota pelaajat napsauttavat käyttääkseen inspiraation.',
      sync: 'Lukee kaikki lomakkeet uudelleen ja korjaa tunnukset.',
      set: 'Näyttää asetukset tai muuttaa yhtä.',
      reset: 'Palauttaa kaikki asetukset oletuksiin kieltä lukuun ottamatta.',
      status: 'Näyttää version, löydetyt lomakkeet ja tärkeimmät asetukset.',
      journal: 'Luo Ohje- ja Command Deck -monisteet uudelleen.',
      help: 'Näyttää tämän luettelon.',
    },
    helpPlayer: {
      menu: 'Näyttää hahmosi ja sen, onko niillä inspiraatio.',
      spend: 'Käyttää valitun hahmon inspiraation.',
      boost: 'Käyttää pisteitä varannosta ja lisää heittoon annetun bonuksen.',
      party: 'Näyttää seurueen, jos GM sallii sen.',
      help: 'Näyttää tämän luettelon.',
    },
    handout: {
      versionLabel: 'Versio',
      subtitle: 'Inspiraatio, Sankarillinen inspiraatio ja pistevarannot mihin tahansa peliin',
      overview: {
        heading: 'Yleiskatsaus',
        body: 'InspirationTracker pitää D&D:n inspiraation ajan tasalla hahmolomakkeella, pelimerkissä ja chatissa. Anna se valikosta, lomakkeelta tai pelimerkin tunnuksella, niin jokainen hahmon pelimerkki näyttää tunnuksen. Pelaajat voivat käyttää sen yhdellä napsautuksella, ja GM saa tiedon ja Kumoa-painikkeen. Se toimii D&D 2024 -lomakkeen kanssa, jossa sitä kutsutaan Sankarilliseksi inspiraatioksi, sekä 2014 OGL -lomakkeen kanssa.',
      },
      quickStart: {
        heading: 'Pikaopas',
        steps: [
          'Avaa Command Deck -moniste, tai kirjoita !inspiration avataksesi valikon.',
          'Valitse pelimerkki ja napsauta Anna. Hahmo saa inspiraation, ja sen pelimerkit näyttävät tunnuksen.',
          'Napsauta kerran Pelaajan makro, jotta pelaajat saavat Inspiration-pelimerkkitoiminnon sen käyttämiseen.',
          'Napsauta Seurue nähdäksesi, kenellä on inspiraatio.',
        ],
      },
      sheets: {
        heading: 'Hahmolomakkeet',
        colSheet: 'Lomake',
        colWhere: 'Missä inspiraatio säilytetään',
        colSheet2014: 'D&D 5E by Roll20 (2014 OGL)',
        where2014: 'Inspiration-ruutu, attribuutti "inspiration".',
        colSheet2024: 'D&D Fifth Edition (5E & 5.5E, 2024)',
        where2024:
          'Heroic Inspiration -ruutu, jota luetaan ja kirjoitetaan getSheetItem- ja setSheetItem-funktioilla.',
        points: [
          'Lomakkeen ruudun valitseminen tai tyhjentäminen huomataan heti: tunnus seuraa perässä, ja tyhjentäminen lasketaan käytöksi.',
          'Kun Nimitys on "Lomakkeen mukaan", kukin D&D 2024 -hahmo käyttää lomakkeensa asetuksissa valittuja sääntöjä: 2024-säännöt sanovat Sankarillinen inspiraatio, 2014-säännöt Inspiraatio.',
          'Hahmoihin, joilla ei ole kumpaakaan lomaketta, ei kosketa, joten NPC-pelimerkit eivät muutu.',
        ],
      },
      players: {
        heading: 'Pelaajat',
        points: [
          'Pelaajat voivat käyttää inspiraation hallitsemilleen hahmoille: napsauta Käytä chatissa tai Inspiration-pelimerkkitoimintoa.',
          'GM saa viestin siitä, kuka sen käytti, ja Kumoa-painikkeen.',
          'Kun pelaaja kirjoittaa !inspiration, hän näkee hahmonsa ja sen, onko niillä inspiraatio.',
          'Kytke Pelaajat voivat käyttää pois, jos haluat käytön pysyvän GM:n käsissä.',
        ],
      },
      passOn: {
        heading: 'Luovuttaminen eteenpäin (2024-säännöt)',
        points: [
          'Hahmolla ei voi olla Sankarillista inspiraatiota kahdesti. Kun hahmo, jolla se on, saisi sen uudelleen, sen pelaajia pyydetään antamaan se toiselle seurueen jäsenelle, jolla sitä ei ole.',
          'Valinnassa tarjotaan jokainen seurueen jäsen, jolla ei ole Sankarillista inspiraatiota, sekä Luovu. Se vanhenee tunnin kuluttua.',
          'Vuoden 2014 säännöissä GM:lle vain ilmoitetaan, että hahmolla on jo Inspiraatio.',
          'Kytke Luovuta eteenpäin pois, jos haluat aina saada vain sen viestin.',
        ],
      },
      party: {
        heading: 'Seurue',
        points: [
          'Seurueeseen kuuluu jokainen hahmo, jota pelaaja hallitsee. Valitse pelimerkkejä ja napsauta Lisää seurueeseen tai Poista seurueesta muuttaaksesi sitä.',
          'GM:n yleiskatsauksessa on Anna-, Poista- ja Käytä-painikkeet jokaiselle jäsenelle.',
          'Kytke Pelaajat näkevät seurueen päälle, jotta myös pelaajat näkevät yleiskatsauksen. He saavat Käytä-painikkeet vain omille hahmoilleen.',
        ],
      },
      pools: {
        heading: 'Pistevarannot',
        points: [
          'Pistevaranto on luku, joka karttuu ja jota käytetään muutama piste kerrallaan: inspiraatiopisteitä, sankaripisteitä, onnea, bennies-pisteitä ja muuta vastaavaa. Se toimii minkä tahansa hahmolomakkeen kanssa.',
          'Aseta Seuranta arvoon Pistevaranto, niin Anna, Poista ja Käytä kohdistuvat oletusvarantoon ja kysyvät pistemäärän. Tunnus näkyy niin kauan kuin hahmolla on pisteitä.',
          'Tehosta käyttää pisteitä heiton korottamiseen: kirjoita haluamasi bonus, ja varannon Pisteitä per +1 -asetus ratkaisee hinnan. Kun +1 maksaa 2 pistettä, bonus 4 maksaa 8 pistettä. Mod ilmoittaa käytöstä; lisää bonus heittoon itse.',
          'Käyttö hylätään, jos hahmolla ei ole tarpeeksi pisteitä. GM saa tiedon siitä, kuka käytti ja mitä, sekä Kumoa-painikkeen.',
          'Säilytyspaikka "Lomakkeen resurssiruutu" käyttää lomakkeen resurssiruutua, jolla on varannon nimi, esimerkiksi Inspiraatio-nimistä Other Resource -ruutua vuoden 2014 D&D-lomakkeella. Jos lomakkeella ei ole sen nimistä ruutua tai valittuna on "Attribuutti", pisteet säilytetään tavallisessa attribuutissa, esimerkiksi inspiration_pool. D&D 2024 -lomake käyttää aina attribuuttia.',
          'Seurueen kortti ja pelaajan oma kortti kertovat, missä kunkin hahmon pisteet säilytetään: lomakkeen ruudun nimi tai attribuutti. Attribuuttia ei näytetä hahmolomakkeella.',
          'Luvun voi hyvin muuttaa lomakkeella käsin: tunnus seuraa perässä.',
          'Napsauta Varannot nimetäksesi oletusvarannon uudelleen, asettaaksesi sen hinnan ja enimmäismäärän tai lisätäksesi varantoja. Muita varantoja käytetään niiden Seurue-painikkeesta tai lisäämällä komentoon --pool ja varannon nimi.',
          'Bardic Inspiration toimii omana varantonaan: napsauta Lisää varanto ja anna nimeksi Bardic Inspiration, aseta Enimmäismäärä arvoon 1 ja valitse Tunnus. GM antaa 1 pisteen kyseisen varannon Seurue-kortista, kun bardi jakaa nopan, ja nopan haltija napsauttaa Käytä, kun käyttää sen. Mod merkitsee, kenellä on noppa; pelaaja heittää sen itse.',
        ],
      },
      markers: {
        heading: 'Pelimerkkien tunnukset',
        points: [
          'Valitse tunnus Tunnus-asetuksella. Roll20:n värilliset pisteet, oletustunnukset ja omat tunnussarjasi näytetään.',
          'Tunnuksen lisääminen pelimerkkiin käsin tai TokenModilla antaa hahmolle inspiraation. Sen poistaminen käyttää sen.',
          'Tunnuksen vaihtaminen siirtää sen heti jokaiseen pelimerkkiin.',
          'D&D 2024 -lomakkeen omia tilatunnuksia ei tarjota, koska lomake asettaa ne itse.',
        ],
      },
      commands: {
        heading: 'Komennot',
        intro:
          'Jokainen komento alkaa sanalla !inspiration. Komennot kohdistuvat valittuihin pelimerkkeihin, ellei --ids ole annettu.',
        mods: 'Myös muut Mods voivat lähettää näitä komentoja, esimerkiksi ScriptCardsista. Muut Mods voivat myös kutsua funktioita InspirationTracker.give, spend, remove ja isInspired.',
        colCommand: 'Komento',
        colDesc: 'Mitä se tekee',
      },
      settings: {
        heading: 'Asetukset',
        intro:
          'Muuta näitä Asetukset-painikkeella, tai kirjoita !inspiration set <setting> <value>.',
        colKey: 'Asetus',
        colName: 'Nimi',
        colDesc: 'Mitä se tekee',
      },
      upgrading: {
        heading: 'Päivitys versiosta 0.1',
        points: [
          'Version 0.1 tunnus, erikoistehoste ja tehosteen tyyppi säilytetään.',
          'Jos valitsit versiossa 0.1 oman komennon, se toimii yhä !inspiration-komennon rinnalla.',
          '!inspiration valittujen pelimerkkien kanssa antaa tai poistaa yhä inspiraation.',
        ],
      },
      troubleshooting: {
        heading: 'Vianmääritys',
        points: [
          'Eikö tunnus näy pelimerkissä? Napsauta Synkronoi lukeaksesi kaikki lomakkeet uudelleen.',
          'Pelimerkillä, joka ei edusta hahmoa, ei voi olla inspiraatiota. Yhdistä se ensin hahmoon.',
          'Eikö mitään tapahdu, kun pelaaja napsauttaa Käytä? Tarkista, että hahmo on määritetty sille pelaajalle.',
          'Virheet kirjoitetaan API-konsoliin Mod Scripts -sivulla.',
        ],
      },
      languages: {
        heading: 'Kielet',
        body: 'InspirationTracker on käännetty alla oleville kielille. Valitse yksi Kieli-asetuksella.',
        colCode: 'Koodi',
        colName: 'Kieli',
        colNative: 'Alkuperäinen nimi',
      },
      credits: {
        heading: 'Tekijät',
        original: 'Alkuperäinen Mod:',
        maintainer: 'Version 1 ylläpitäjä:',
        support: 'Ilmoita virheistä ja ideoista Roll20:n Mod-foorumilla tai GitHubissa.',
      },
      footer: 'Painikkeet kaikkiin toimintoihin ovat monisteessa "{deck}".',
    },
    deck: {
      subtitle: 'Command Deck',
      selectedDesc: 'Valitse yksi tai useampi pelimerkki ja napsauta sitten.',
      partyDesc: 'Katso, kenellä on inspiraatio, ja valitse, ketkä kuuluvat seurueeseen.',
      poolsTitle: 'Pistevaranto',
      poolsDesc: 'Kun Seuranta on Pistevaranto: valitse pelimerkit, napsauta ja kirjoita luku.',
      toolsDesc: 'Valikko, asetukset, pelaajan makro ja ohje.',
      footer: 'Täydet ohjeet ovat monisteessa "{help}".',
    },
  };

  const TRANSLATION$f = {
    terms: {
      heroic: 'Inspiration héroïque',
      classic: 'Inspiration',
    },
    titles: {
      ready: 'InspirationTracker est prêt.',
      settings: "Paramètres d'InspirationTracker",
      help: "Commandes d'InspirationTracker",
      party: 'Inspiration du groupe',
      poolParty: '{term} du groupe',
      pools: 'Réserves de points',
      yours: 'Vos personnages',
      status: "État d'InspirationTracker",
    },
    messages: {
      gained: "{name} reçoit l'{term} !",
      spent: "{name} utilise l'{term}.",
      spentBy: "{player} a dépensé l'{term} de {name}.",
      spentSheet: "{name} n'a plus l'{term} (modifié sur la fiche ou le jeton).",
      restored: "{name} récupère l'{term}.",
      removed: '{term} retirée à {name}.',
      already: "{name} a déjà l'{term}.",
      none: "{name} n'a pas l'{term}.",
      busy: '{name} est encore en cours de mise à jour. Réessayez dans un instant.',
      passOffer:
        "{name} a déjà l'{term} et ne peut pas l'avoir deux fois. Donnez-la à un membre du groupe qui ne l'a pas, ou renoncez-y.",
      passNobody: "Tous les autres membres du groupe l'ont déjà.",
      passAsked: "Les joueurs de {name} ont été invités à choisir qui reçoit l'{term}.",
      passed: "{from} donne l'{term} à {to} !",
      passAlready: "{to} l'a déjà. Choisissez quelqu'un d'autre.",
      declined: "{name} renonce à l'{term} en trop.",
      undoAlready: "{name} l'a déjà de nouveau.",
      synced: 'Fiches lues : {checked}. Avec inspiration : {inspired}.',
      migrated:
        'Les paramètres de la version 0.1 ont été conservés : marqueur, effet spécial et son type. Les nouveaux paramètres prennent leur valeur par défaut.',
      legacyCommand: 'Votre ancienne commande {command} fonctionne toujours, tout comme {main}.',
      macroHint:
        'Pour donner aux joueurs un bouton Dépenser, lancez {command}. Cela ajoute une action de jeton pour tout le monde.',
      macro:
        "La macro « {name} » est prête : les joueurs la voient comme action de jeton quand ils sélectionnent un jeton qu'ils contrôlent.",
      journal: "Documents d'aide et Command Deck reconstruits.",
      readyHint: 'Tapez {command} pour le menu, ou ouvrez le document Command Deck.',
    },
    pool: {
      gained: '{name} gagne {amount} {term} ({before} → {after}).',
      spent: '{name} dépense {amount} {term} ({before} → {after}).',
      boosted: '{name} dépense {amount} {term} pour +{bonus} au jet ({before} → {after}).',
      spentBy: '{player} a dépensé {amount} {term} pour {name}.',
      restored: '{name} récupère {amount} {term} ({before} → {after}).',
      removed: '{amount} {term} en moins pour {name} ({before} → {after}).',
      none: "{name} n'a aucun point ({term}).",
      short: '{name} a {have} {term}, et il en faut {need}.',
      full: '{name} a déjà le maximum autorisé ({term} : {max}).',
    },
    pools: {
      introFlag:
        "Le suivi est réglé sur la case d'inspiration de la fiche. Réglez-le sur Réserve de points pour que Donner et Dépenser agissent sur la réserve « {name} ». Les autres réserves s'utilisent avec --pool.",
      introPool:
        "Donner, Dépenser et Renforcer agissent sur « {name} ». Les autres réserves s'utilisent depuis leur bouton Groupe, ou avec --pool.",
      defaultLabel: '{name} (par défaut)',
      name: 'Nom',
      source: 'Conservé dans',
      cost: 'Points par +1',
      max: 'Maximum',
      marker: 'Marqueur',
      attribute: "Attribut quand la fiche n'a pas de case portant ce nom : {attribute}",
      partyTotal: 'Total du groupe : {total} {term}.',
      keptBox: 'Case de la fiche : {name}',
      keptAttribute: 'Attribut : {attribute}',
      keptNote: "Un attribut n'est pas affiché sur la fiche de personnage.",
    },
    prompts: {
      points: 'Points',
      bonus: 'Bonus au jet',
      max: 'Maximum de points autorisé (0 pour aucune limite)',
    },
    errors: {
      unknownPool: "Il n'existe aucune réserve nommée « {value} ».",
      unknownPoolHint: 'Réserves : {pools}.',
      badAmount: "« {value} » n'est pas un nombre de points.",
      badAmountHint: 'Utilisez un nombre entier de 1 à 9999.',
      boostNoPool: "Renforcer dépense des points d'une réserve.",
      poolInvalid: "Une réserve ne peut pas s'appeler « {value} ».",
      poolExists: 'Il existe déjà une réserve nommée « {value} ».',
      poolFull: "Il n'y a plus de place pour une autre réserve.",
      poolNameHint:
        "Utilisez un nom de 40 lettres, chiffres et espaces au plus, qu'aucune autre réserve ne porte.",
      poolDefault:
        'La réserve par défaut, « {name} », ne peut pas être supprimée. Elle peut être renommée.',
      poolMarkerHint:
        'Choisissez dans vos jeux de marqueurs un marqueur autre que celui du paramètre Marqueur.',
      poolSetHint: 'Tapez !inspiration pools pour voir chaque réserve et ses paramètres.',
      denied: 'Vous ne pouvez pas faire cela pour {name}.',
      gmOnly: 'Seul le MJ peut utiliser cette commande.',
      gmOnlyHint: 'Les joueurs peuvent utiliser spend, party et help.',
      spendOff: 'Le MJ a désactivé la dépense par les joueurs.',
      noCharacter: 'Ces jetons ne représentent pas de personnage : {names}.',
      nothingSelected: "Sélectionnez d'abord un jeton.",
      nothingSelectedHint:
        'Sélectionnez des jetons qui représentent des personnages, ou ajoutez --ids avec des ID de jetons ou de personnages.',
      writeFailed: 'Impossible de modifier la fiche de {name}.',
      offerGone: 'Ce choix a déjà été fait, ou il a expiré.',
      passInvalid: "Choisissez un membre du groupe autre que celui qui l'a.",
      undoGone: 'Cette dépense a déjà été annulée, ou elle est trop ancienne.',
      unknownMarker: "Il n'existe aucun marqueur de jeton nommé « {value} ».",
      unknownMarkerHint:
        'Utilisez le bouton Marqueur dans les paramètres pour en choisir un dans vos jeux de marqueurs.',
      badSetting: 'Impossible de régler {key} sur « {value} ».',
      badSettingHint: 'Tapez !inspiration set pour voir chaque paramètre et ses choix.',
      unknownCommand: 'Commande inconnue : {command}.',
      unknownCommandHint: 'Tapez !inspiration help pour la liste des commandes.',
    },
    menu: {
      selected: 'Jetons sélectionnés',
      party: 'Groupe',
      tools: 'Outils',
      hint: 'Les instructions complètes sont dans le document « {help} ».',
      noSheet: 'pas de fiche',
      noneYours: 'Vous ne contrôlez aucun personnage avec une fiche.',
      partyEmpty: 'Vous ne contrôlez aucun membre du groupe.',
      partyEmptyGm:
        'Le groupe est encore vide. Attribuez des personnages aux joueurs, ou sélectionnez des jetons et cliquez sur Ajouter au groupe.',
      partyCount: "{count} sur {total} ont l'{term}.",
    },
    buttons: {
      menu: 'Menu',
      give: 'Donner',
      remove: 'Retirer',
      toggle: 'Basculer',
      spend: 'Dépenser',
      party: 'Groupe',
      partyAdd: 'Ajouter au groupe',
      partyRemove: 'Retirer du groupe',
      settings: 'Paramètres',
      macro: 'Macro joueurs',
      sync: 'Synchroniser',
      status: 'État',
      help: 'Aide',
      reset: 'Réinitialiser',
      refresh: 'Actualiser',
      undo: 'Annuler',
      decline: 'Y renoncer',
      boost: 'Renforcer',
      pools: 'Réserves',
      addPool: 'Ajouter une réserve',
      deletePool: 'Supprimer la réserve',
    },
    values: {
      on: 'Activé',
      off: 'Désactivé',
      none: 'Aucun',
      noLimit: 'Aucune limite',
      tracking: {
        flag: "Case d'inspiration de la fiche",
        pool: 'Réserve de points',
      },
      source: {
        resource: 'Case de ressource de la fiche',
        attribute: 'Attribut',
      },
      wording: {
        2014: 'Inspiration (2014)',
        2024: 'Inspiration héroïque (2024)',
        auto: 'Selon la fiche',
      },
      announce: {
        public: 'Tout le monde',
        gm: 'MJ et propriétaires',
        off: 'Personne',
      },
    },
    settings: {
      language: {
        label: 'Langue',
        desc: 'Langue des menus, des messages et des documents.',
      },
      tracking: {
        label: 'Suivi',
        desc: "Ce sur quoi agissent Donner et Dépenser : la case d'inspiration des fiches D&D, qu'un personnage a ou n'a pas, ou une réserve de points qui s'accumule et se dépense quelques points à la fois.",
      },
      marker: {
        label: 'Marqueur',
        desc: "Marqueur de jeton affiché tant qu'un personnage a l'inspiration. Les jeux de marqueurs personnalisés sont aussi proposés.",
      },
      wording: {
        label: 'Formulation',
        desc: 'Appeler cela Inspiration ou Inspiration héroïque. « Selon la fiche » utilise les règles choisies sur chaque fiche D&D 2024, et Inspiration sur la fiche 2014.',
      },
      announce: {
        label: 'Annonce',
        desc: "Qui voit le message dans le chat quand l'inspiration est gagnée ou dépensée.",
      },
      fx: {
        label: 'Effet spécial',
        desc: "Joue un effet spécial sur le jeton quand il gagne l'inspiration.",
      },
      fxType: {
        label: "Type d'effet",
        desc: "Quel effet jouer, par exemple nova-holy, ou l'ID d'un effet personnalisé.",
      },
      playerSpend: {
        label: 'Dépense par les joueurs',
        desc: "Permet aux joueurs de dépenser l'inspiration des personnages qu'ils contrôlent. Le MJ est prévenu, avec un bouton Annuler.",
      },
      playerOverview: {
        label: 'Groupe visible des joueurs',
        desc: "Permet aux joueurs de voir qui, dans le groupe, a l'inspiration.",
      },
      passOn: {
        label: 'Transmettre (2024)',
        desc: "Selon les règles 2024, un personnage qui gagnerait l'Inspiration héroïque alors qu'il l'a déjà peut la donner à un autre membre du groupe.",
      },
    },
    status: {
      version: 'Version',
      beacon: 'Fiches D&D 2024',
      legacy: 'Fiches 2014',
      none: "Personnages sans case d'inspiration",
      rules2024: 'Règles 2024 utilisées',
      party: 'Membres du groupe',
      tracking: 'Suivi',
      pools: 'Réserves',
      marker: 'Marqueur',
      fx: 'Effet spécial',
      legacyCommand: 'Ancienne commande',
    },
    help: {
      menu: "Affiche le menu. Avec des jetons sélectionnés, donne ou retire l'inspiration, comme dans la version 0.1.",
      give: "Donne l'inspiration aux personnages sélectionnés.",
      remove: "Retire l'inspiration aux personnages sélectionnés, sans la compter comme dépensée.",
      toggle:
        "Donne l'inspiration aux personnages sélectionnés qui ne l'ont pas, et la retire à ceux qui l'ont.",
      spend: "Dépense l'inspiration des personnages sélectionnés et prévient le MJ.",
      party:
        "Affiche qui, dans le groupe, a l'inspiration, avec des boutons pour la donner, la retirer ou la dépenser.",
      partyEdit: 'Ajoute les personnages sélectionnés au groupe, ou les en retire.',
      ids: 'Agit sur les ID de jetons ou de personnages indiqués au lieu des jetons sélectionnés.',
      points:
        'Avec une réserve de points : donne, retire ou dépense ce nombre de points. Sans nombre, 1. remove all retire tous les points.',
      boost:
        'Avec une réserve de points : dépense des points pour ajouter ce bonus à un jet, au coût de la réserve pour chaque +1.',
      poolFlag: 'Agit sur la réserve nommée au lieu de la réserve par défaut.',
      pools: 'Affiche les réserves de points et leurs paramètres.',
      poolEdit:
        'Ajoute une réserve, ou en supprime une. Les points sur les fiches restent tels quels.',
      poolSet:
        "Modifie une réserve : son nom, l'endroit où elle est conservée (resource ou attribute), les points que coûte chaque +1, le maximum de points autorisé (0 pour aucune limite), ou son marqueur de jeton.",
      undo: "Rend une inspiration dépensée. L'ID figure dans le message envoyé au MJ lors de la dépense.",
      macro:
        "Ajoute l'action de jeton « Inspiration », sur laquelle les joueurs cliquent pour dépenser l'inspiration.",
      sync: 'Relit toutes les fiches et remet les marqueurs en ordre.',
      set: 'Affiche les paramètres, ou en modifie un.',
      reset: 'Remet tous les paramètres à leur valeur par défaut, sauf la langue.',
      status: 'Affiche la version, les fiches trouvées et les principaux paramètres.',
      journal: "Reconstruit les documents d'aide et Command Deck.",
      help: 'Affiche cette liste.',
    },
    helpPlayer: {
      menu: "Affiche vos personnages et indique s'ils ont l'inspiration.",
      spend: "Dépense l'inspiration du personnage sélectionné.",
      boost: "Dépense des points d'une réserve pour ajouter ce bonus à un jet.",
      party: "Affiche le groupe, si le MJ l'autorise.",
      help: 'Affiche cette liste.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Inspiration, Inspiration héroïque et réserves de points pour tous les jeux',
      overview: {
        heading: 'Présentation',
        body: "InspirationTracker synchronise l'inspiration D&D entre la fiche de personnage, le jeton et le chat. Donnez-la depuis le menu, la fiche ou le marqueur de jeton, et tous les jetons de ce personnage affichent le marqueur. Les joueurs peuvent la dépenser en un clic, et le MJ est prévenu, avec un bouton Annuler. Il fonctionne avec la fiche D&D 2024, où elle s'appelle Inspiration héroïque, et avec la fiche OGL 2014.",
      },
      quickStart: {
        heading: 'Démarrage rapide',
        steps: [
          'Ouvrez le document Command Deck, ou tapez !inspiration pour le menu.',
          "Sélectionnez un jeton et cliquez sur Donner. Le personnage gagne l'inspiration et ses jetons affichent le marqueur.",
          'Cliquez une fois sur Macro joueurs, pour que les joueurs aient une action de jeton Inspiration pour la dépenser.',
          "Cliquez sur Groupe pour voir qui a l'inspiration.",
        ],
      },
      sheets: {
        heading: 'Fiches de personnage',
        colSheet: 'Fiche',
        colWhere: "Où l'inspiration est stockée",
        colSheet2014: 'D&D 5E by Roll20 (2014 OGL)',
        where2014: 'La case Inspiration, attribut "inspiration".',
        colSheet2024: 'D&D Fifth Edition (5E & 5.5E, 2024)',
        where2024: 'La case Inspiration héroïque, lue et écrite avec getSheetItem et setSheetItem.',
        points: [
          'Cocher ou décocher la case sur une fiche est détecté immédiatement : le marqueur suit, et décocher compte comme une dépense.',
          'Avec Formulation réglé sur « Selon la fiche », chaque personnage D&D 2024 utilise les règles choisies dans les paramètres de sa fiche : les règles 2024 disent Inspiration héroïque, les règles 2014 disent Inspiration.',
          "Les personnages qui n'ont aucune de ces fiches ne sont pas touchés, donc les jetons de PNJ ne changent pas.",
        ],
      },
      players: {
        heading: 'Joueurs',
        points: [
          "Les joueurs peuvent dépenser l'inspiration des personnages qu'ils contrôlent : cliquez sur Dépenser dans le chat, ou sur l'action de jeton Inspiration.",
          "Le MJ reçoit un message indiquant qui l'a dépensée, avec un bouton Annuler.",
          "Taper !inspiration montre à un joueur ses personnages et s'ils ont l'inspiration.",
          'Désactivez Dépense par les joueurs pour réserver la dépense au MJ.',
        ],
      },
      passOn: {
        heading: 'Transmettre (règles 2024)',
        points: [
          "Un personnage ne peut pas avoir l'Inspiration héroïque deux fois. Quand un personnage qui l'a devrait la gagner à nouveau, ses joueurs sont invités à la donner à un autre membre du groupe qui ne l'a pas.",
          "Le choix propose chaque membre du groupe sans Inspiration héroïque, ainsi que Y renoncer. Il expire au bout d'une heure.",
          "Selon les règles 2014, le MJ est simplement informé que le personnage a déjà l'Inspiration.",
          'Désactivez Transmettre pour toujours recevoir ce message à la place.',
        ],
      },
      party: {
        heading: 'Le groupe',
        points: [
          'Le groupe comprend tous les personnages contrôlés par un joueur. Sélectionnez des jetons et cliquez sur Ajouter au groupe ou Retirer du groupe pour le modifier.',
          "La vue d'ensemble du MJ propose des boutons Donner, Retirer et Dépenser pour chaque membre.",
          "Activez Groupe visible des joueurs pour que les joueurs voient aussi la vue d'ensemble. Ils n'ont des boutons Dépenser que pour leurs propres personnages.",
        ],
      },
      pools: {
        heading: 'Réserves de points',
        points: [
          "Une réserve de points est un nombre qui s'accumule et se dépense quelques points à la fois : une réserve de points d'inspiration, de points d'héroïsme, de chance, de bennies, etc. Elle fonctionne avec n'importe quelle fiche de personnage.",
          "Réglez Suivi sur Réserve de points, et Donner, Retirer et Dépenser agissent sur la réserve par défaut en demandant combien de points. Le marqueur s'affiche tant qu'un personnage a au moins un point.",
          'Renforcer dépense des points pour augmenter un jet : tapez le bonus voulu, et les Points par +1 de la réserve fixent le coût. À 2 points par +1, un bonus de 4 coûte 8 points. Le Mod annonce la dépense ; ajoutez vous-même le bonus au jet.',
          "Une dépense est refusée quand le personnage n'a pas assez de points. Le MJ est informé de qui a dépensé quoi, avec un bouton Annuler.",
          "Conservé dans « Case de ressource de la fiche » utilise la case de ressource de la fiche qui porte le nom de la réserve, par exemple une case Other Resource nommée Inspiration sur la fiche D&D 2014. Quand la fiche n'a pas de case portant ce nom, ou avec « Attribut », les points sont conservés dans un simple attribut, par exemple inspiration_pool. La fiche D&D 2024 utilise toujours l'attribut.",
          "La carte du groupe et la carte personnelle d'un joueur indiquent où sont conservés les points de chaque personnage : le nom de la case de la fiche, ou l'attribut. Un attribut n'est pas affiché sur la fiche de personnage.",
          'Modifier le nombre à la main sur la fiche ne pose aucun problème : le marqueur suit.',
          "Cliquez sur Réserves pour renommer la réserve par défaut, régler son coût et son maximum, ou ajouter d'autres réserves. Les autres réserves s'utilisent depuis leur bouton Groupe, ou en ajoutant --pool et le nom de la réserve à une commande.",
          "Bardic Inspiration fonctionne comme une réserve à part : cliquez sur Ajouter une réserve et nommez-la Bardic Inspiration, réglez son Maximum sur 1 et choisissez son Marqueur. Le MJ donne 1 depuis la carte Groupe de cette réserve quand le barde distribue un dé, et son détenteur clique sur Dépenser quand il l'utilise. Le Mod indique qui détient un dé ; le joueur le lance lui-même.",
        ],
      },
      markers: {
        heading: 'Marqueurs de jeton',
        points: [
          'Choisissez le marqueur avec le paramètre Marqueur. Les points de couleur de Roll20, les marqueurs par défaut et vos jeux de marqueurs personnalisés sont proposés.',
          "Ajouter le marqueur à un jeton à la main, ou avec TokenMod, donne l'inspiration au personnage. Le retirer la dépense.",
          'Changer de marqueur le remplace immédiatement sur tous les jetons.',
          "Les marqueurs d'état propres à la fiche D&D 2024 ne sont pas proposés, car la fiche les gère elle-même.",
        ],
      },
      commands: {
        heading: 'Commandes',
        intro:
          'Chaque commande commence par !inspiration. Les commandes agissent sur les jetons sélectionnés, sauf si --ids est indiqué.',
        mods: "D'autres Mods peuvent aussi envoyer ces commandes, par exemple depuis ScriptCards. D'autres Mods peuvent aussi appeler InspirationTracker.give, spend, remove et isInspired.",
        colCommand: 'Commande',
        colDesc: "Ce qu'elle fait",
      },
      settings: {
        heading: 'Paramètres',
        intro:
          'Modifiez-les avec le bouton Paramètres, ou tapez !inspiration set <setting> <value>.',
        colKey: 'Paramètre',
        colName: 'Nom',
        colDesc: "Ce qu'il fait",
      },
      upgrading: {
        heading: 'Mise à niveau depuis 0.1',
        points: [
          "Le marqueur, l'effet spécial et le type d'effet de la version 0.1 sont conservés.",
          'Si vous aviez choisi votre propre commande en 0.1, elle fonctionne toujours en plus de !inspiration.',
          "!inspiration avec des jetons sélectionnés donne ou retire toujours l'inspiration.",
        ],
      },
      troubleshooting: {
        heading: 'Dépannage',
        points: [
          "Le marqueur ne s'affiche pas sur un jeton ? Cliquez sur Synchroniser pour relire toutes les fiches.",
          "Un jeton qui ne représente pas de personnage ne peut pas avoir l'inspiration. Liez-le d'abord à un personnage.",
          'Rien ne se passe quand un joueur clique sur Dépenser ? Vérifiez que le personnage est attribué à ce joueur.',
          'Les erreurs sont écrites dans la console API de la page Mod Scripts.',
        ],
      },
      languages: {
        heading: 'Langues',
        body: 'InspirationTracker est traduit dans les langues ci-dessous. Choisissez-en une avec le paramètre Langue.',
        colCode: 'Code',
        colName: 'Langue',
        colNative: 'Nom natif',
      },
      credits: {
        heading: 'Crédits',
        original: 'Mod original par',
        maintainer: 'Version 1 maintenue par',
        support: 'Signalez bugs et idées sur le forum Mod de Roll20 ou sur GitHub.',
      },
      footer: 'Des boutons pour chaque action se trouvent dans le document « {deck} ».',
    },
    deck: {
      subtitle: 'Command Deck',
      selectedDesc: 'Sélectionnez un ou plusieurs jetons, puis cliquez.',
      partyDesc: "Voyez qui a l'inspiration, et choisissez qui fait partie du groupe.",
      poolsTitle: 'Réserve de points',
      poolsDesc:
        'Avec Suivi réglé sur Réserve de points : sélectionnez des jetons, cliquez et tapez le nombre.',
      toolsDesc: 'Menu, paramètres, macro joueurs et aide.',
      footer: 'Les instructions complètes sont dans le document « {help} ».',
    },
  };

  const TRANSLATION$e = {
    terms: {
      heroic: 'Heldenhafte Inspiration',
      classic: 'Inspiration',
    },
    titles: {
      ready: 'InspirationTracker ist bereit.',
      settings: 'InspirationTracker-Einstellungen',
      help: 'InspirationTracker-Befehle',
      party: 'Inspiration der Gruppe',
      poolParty: '{term} der Gruppe',
      pools: 'Punktepools',
      yours: 'Deine Charaktere',
      status: 'InspirationTracker-Status',
    },
    messages: {
      gained: '{name} hat {term}!',
      spent: '{name} nutzt {term}.',
      spentBy: '{player} hat {term} für {name} ausgegeben.',
      spentSheet: '{name} hat keine {term} mehr (auf dem Bogen oder Token geändert).',
      restored: '{name} hat {term} zurück.',
      removed: '{term} wurde {name} entzogen.',
      already: '{name} hat bereits {term}.',
      none: '{name} hat keine {term}.',
      busy: '{name} wird noch aktualisiert. Versuche es gleich noch einmal.',
      passOffer:
        '{name} hat bereits {term} und kann sie nicht doppelt haben. Gib sie einem Gruppenmitglied, das sie nicht hat, oder verzichte darauf.',
      passNobody: 'Alle anderen Gruppenmitglieder haben sie bereits.',
      passAsked: 'Die Spieler von {name} wurden gefragt, wer {term} bekommen soll.',
      passed: '{from} gibt {term} an {to}!',
      passAlready: '{to} hat sie bereits. Wähle jemand anderen.',
      declined: '{name} verzichtet auf die zusätzliche {term}.',
      undoAlready: '{name} hat sie bereits wieder.',
      synced: 'Gelesene Bögen: {checked}. Mit Inspiration: {inspired}.',
      migrated:
        'Einstellungen aus Version 0.1 wurden übernommen: Marker, Spezialeffekt und dessen Typ. Die neuen Einstellungen beginnen mit ihren Standardwerten.',
      legacyCommand: 'Dein alter Befehl {command} funktioniert weiterhin, ebenso wie {main}.',
      macroHint:
        'Um Spielern einen Ausgeben-Button zu geben, führe {command} aus. Das fügt für alle eine Token-Aktion hinzu.',
      macro:
        'Das Makro „{name}“ ist bereit: Spieler sehen es als Token-Aktion, wenn sie einen Token auswählen, den sie steuern.',
      journal: 'Hilfe- und Command-Deck-Handouts neu erstellt.',
      readyHint: 'Gib {command} für das Menü ein oder öffne das Command-Deck-Handout.',
    },
    pool: {
      gained: '{name} erhält {amount} {term} ({before} → {after}).',
      spent: '{name} gibt {amount} {term} aus ({before} → {after}).',
      boosted: '{name} gibt {amount} {term} für +{bonus} auf den Wurf aus ({before} → {after}).',
      spentBy: '{player} hat {amount} {term} für {name} ausgegeben.',
      restored: '{name} hat {amount} {term} zurück ({before} → {after}).',
      removed: '{name} wurden {amount} {term} entzogen ({before} → {after}).',
      none: '{name} hat keine {term}.',
      short: '{name} hat {have} {term}, nötig sind {need}.',
      full: '{name} hat bereits das erlaubte Maximum an {term} ({max}).',
    },
    pools: {
      introFlag:
        'Die Erfassung steht auf dem Inspirationsfeld des Bogens. Stelle sie auf Punktepool, damit Geben und Ausgeben auf den Pool „{name}“ wirken. Andere Pools nutzt du mit --pool.',
      introPool:
        'Geben, Ausgeben und Verstärken wirken auf „{name}“. Andere Pools nutzt du über ihren Gruppe-Button oder mit --pool.',
      defaultLabel: '{name} (Standard)',
      name: 'Name',
      source: 'Gespeichert in',
      cost: 'Punkte pro +1',
      max: 'Maximum',
      marker: 'Marker',
      attribute: 'Attribut, wenn der Bogen kein Feld mit diesem Namen hat: {attribute}',
      partyTotal: 'Gruppe gesamt: {total} {term}.',
      keptBox: 'Feld auf dem Bogen: {name}',
      keptAttribute: 'Attribut: {attribute}',
      keptNote: 'Ein Attribut wird auf dem Charakterbogen nicht angezeigt.',
    },
    prompts: {
      points: 'Punkte',
      bonus: 'Bonus auf den Wurf',
      max: 'Höchstzahl an Punkten (0 für kein Limit)',
    },
    errors: {
      unknownPool: 'Es gibt keinen Pool namens „{value}“.',
      unknownPoolHint: 'Pools: {pools}.',
      badAmount: '„{value}“ ist keine Punktzahl.',
      badAmountHint: 'Verwende eine ganze Zahl von 1 bis 9999.',
      boostNoPool: 'Verstärken gibt Punkte aus einem Pool aus.',
      poolInvalid: 'Ein Pool kann nicht „{value}“ heißen.',
      poolExists: 'Es gibt bereits einen Pool namens „{value}“.',
      poolFull: 'Für einen weiteren Pool ist kein Platz.',
      poolNameHint:
        'Verwende einen Namen aus bis zu 40 Buchstaben, Ziffern und Leerzeichen, den kein anderer Pool hat.',
      poolDefault:
        'Der Standardpool „{name}“ kann nicht gelöscht werden. Er lässt sich umbenennen.',
      poolMarkerHint:
        'Wähle einen Marker aus deinen Marker-Sets, der nicht der aus der Einstellung Marker ist.',
      poolSetHint: 'Gib !inspiration pools ein, um alle Pools und ihre Einstellungen zu sehen.',
      denied: 'Das kannst du für {name} nicht tun.',
      gmOnly: 'Nur die SL kann diesen Befehl verwenden.',
      gmOnlyHint: 'Spieler können spend, party und help verwenden.',
      spendOff: 'Die SL hat das Ausgeben durch Spieler deaktiviert.',
      noCharacter: 'Diese Token stellen keinen Charakter dar: {names}.',
      nothingSelected: 'Wähle zuerst einen Token aus.',
      nothingSelectedHint:
        'Wähle Token aus, die Charaktere darstellen, oder füge --ids mit Token- oder Charakter-IDs hinzu.',
      writeFailed: 'Der Bogen von {name} konnte nicht geändert werden.',
      offerGone: 'Diese Wahl wurde bereits getroffen oder ist abgelaufen.',
      passInvalid: 'Wähle ein anderes Gruppenmitglied als das, welches sie hat.',
      undoGone: 'Diese Ausgabe wurde bereits rückgängig gemacht oder ist zu alt.',
      unknownMarker: 'Es gibt keinen Token-Marker namens „{value}“.',
      unknownMarkerHint:
        'Nutze den Marker-Button in den Einstellungen, um einen aus deinen Marker-Sets auszuwählen.',
      badSetting: '{key} kann nicht auf „{value}“ gesetzt werden.',
      badSettingHint: 'Gib !inspiration set ein, um alle Einstellungen und ihre Optionen zu sehen.',
      unknownCommand: 'Unbekannter Befehl: {command}.',
      unknownCommandHint: 'Gib !inspiration help ein, um die Befehlsliste zu sehen.',
    },
    menu: {
      selected: 'Ausgewählte Token',
      party: 'Gruppe',
      tools: 'Werkzeuge',
      hint: 'Die vollständige Anleitung steht im Handout „{help}“.',
      noSheet: 'kein Bogen',
      noneYours: 'Du steuerst keine Charaktere mit Bogen.',
      partyEmpty: 'Du steuerst keine Gruppenmitglieder.',
      partyEmptyGm:
        'Noch ist niemand in der Gruppe. Weise Spielern Charaktere zu, oder wähle Token aus und klicke auf Zur Gruppe hinzufügen.',
      partyCount: '{count} von {total} haben {term}.',
    },
    buttons: {
      menu: 'Menü',
      give: 'Geben',
      remove: 'Entfernen',
      toggle: 'Umschalten',
      spend: 'Ausgeben',
      party: 'Gruppe',
      partyAdd: 'Zur Gruppe hinzufügen',
      partyRemove: 'Aus Gruppe entfernen',
      settings: 'Einstellungen',
      macro: 'Spielermakro',
      sync: 'Synchronisieren',
      status: 'Status',
      help: 'Hilfe',
      reset: 'Einstellungen zurücksetzen',
      refresh: 'Aktualisieren',
      undo: 'Rückgängig',
      decline: 'Verzichten',
      boost: 'Verstärken',
      pools: 'Pools',
      addPool: 'Pool hinzufügen',
      deletePool: 'Pool löschen',
    },
    values: {
      on: 'An',
      off: 'Aus',
      none: 'Keiner',
      noLimit: 'Kein Limit',
      tracking: {
        flag: 'Inspirationsfeld des Bogens',
        pool: 'Punktepool',
      },
      source: {
        resource: 'Ressourcenfeld des Bogens',
        attribute: 'Attribut',
      },
      wording: {
        2014: 'Inspiration (2014)',
        2024: 'Heldenhafte Inspiration (2024)',
        auto: 'Vom Bogen',
      },
      announce: {
        public: 'Alle',
        gm: 'SL und Besitzer',
        off: 'Niemand',
      },
    },
    settings: {
      language: {
        label: 'Sprache',
        desc: 'Sprache für Menüs, Nachrichten und Handouts.',
      },
      tracking: {
        label: 'Erfassung',
        desc: 'Worauf Geben und Ausgeben wirken: auf das Inspirationsfeld der D&D-Bögen, das ein Charakter hat oder nicht hat, oder auf einen Pool aus Punkten, der sich aufbaut und nach und nach ausgegeben wird.',
      },
      marker: {
        label: 'Marker',
        desc: 'Token-Marker, der angezeigt wird, solange ein Charakter Inspiration hat. Eigene Marker-Sets werden ebenfalls aufgeführt.',
      },
      wording: {
        label: 'Bezeichnung',
        desc: 'Inspiration oder Heldenhafte Inspiration nennen. „Vom Bogen“ nutzt die auf jedem D&D-2024-Bogen gewählten Regeln und Inspiration auf dem 2014-Bogen.',
      },
      announce: {
        label: 'Ankündigung',
        desc: 'Wer die Chatnachricht sieht, wenn Inspiration erhalten oder ausgegeben wird.',
      },
      fx: {
        label: 'Spezialeffekt',
        desc: 'Spielt einen Spezialeffekt auf dem Token ab, wenn er Inspiration erhält.',
      },
      fxType: {
        label: 'Effekttyp',
        desc: 'Welcher Effekt abgespielt wird, etwa nova-holy, oder die ID eines eigenen Effekts.',
      },
      playerSpend: {
        label: 'Spieler dürfen ausgeben',
        desc: 'Spieler dürfen Inspiration für die Charaktere ausgeben, die sie steuern. Die SL wird informiert, mit einem Rückgängig-Button.',
      },
      playerOverview: {
        label: 'Spieler sehen Gruppe',
        desc: 'Spieler dürfen sehen, wer in der Gruppe Inspiration hat.',
      },
      passOn: {
        label: 'Weitergeben (2024)',
        desc: 'Nach den Regeln von 2024 darf ein Charakter, der Heldenhafte Inspiration erhalten würde, während er sie schon hat, sie einem anderen Gruppenmitglied geben.',
      },
    },
    status: {
      version: 'Version',
      beacon: 'D&D-2024-Bögen',
      legacy: '2014-Bögen',
      none: 'Charaktere ohne Inspirationsfeld',
      rules2024: 'Regeln von 2024 aktiv',
      party: 'Gruppenmitglieder',
      tracking: 'Erfassung',
      pools: 'Pools',
      marker: 'Marker',
      fx: 'Spezialeffekt',
      legacyCommand: 'Alter Befehl',
    },
    help: {
      menu: 'Zeigt das Menü. Mit ausgewählten Token wird Inspiration gegeben oder entzogen, wie in Version 0.1.',
      give: 'Gibt den ausgewählten Charakteren Inspiration.',
      remove:
        'Entzieht den ausgewählten Charakteren Inspiration, ohne sie als ausgegeben zu zählen.',
      toggle:
        'Gibt ausgewählten Charakteren ohne Inspiration welche und entzieht sie denen, die sie haben.',
      spend: 'Gibt die Inspiration der ausgewählten Charaktere aus und informiert die SL.',
      party:
        'Zeigt, wer in der Gruppe Inspiration hat, mit Buttons zum Geben, Entfernen oder Ausgeben.',
      partyEdit: 'Fügt die ausgewählten Charaktere der Gruppe hinzu oder nimmt sie heraus.',
      ids: 'Wirkt auf die angegebenen Token- oder Charakter-IDs statt auf die ausgewählten Token.',
      points:
        'Mit einem Punktepool: gibt so viele Punkte, entzieht sie oder gibt sie aus. Ohne Zahl: 1. remove all entzieht alle Punkte.',
      boost:
        'Mit einem Punktepool: gibt Punkte aus, um diesen Bonus auf einen Wurf zu addieren, zu den Kosten des Pools für jedes +1.',
      poolFlag: 'Wirkt auf den genannten Pool statt auf den Standardpool.',
      pools: 'Zeigt die Punktepools und ihre Einstellungen.',
      poolEdit:
        'Fügt einen Pool hinzu oder löscht einen. Die Punkte auf den Bögen bleiben, wie sie sind.',
      poolSet:
        'Ändert einen Pool: seinen Namen, wo er gespeichert wird (resource oder attribute), die Punkte, die jedes +1 kostet, die Höchstzahl an Punkten (0 für kein Limit) oder seinen Token-Marker.',
      undo: 'Gibt ausgegebene Inspiration zurück. Die ID steht in der SL-Nachricht zur Ausgabe.',
      macro: 'Fügt die Token-Aktion „Inspiration“ hinzu, mit der Spieler Inspiration ausgeben.',
      sync: 'Liest alle Bögen neu ein und korrigiert die Marker.',
      set: 'Zeigt die Einstellungen oder ändert eine.',
      reset: 'Setzt alle Einstellungen außer der Sprache auf ihre Standardwerte zurück.',
      status: 'Zeigt die Version, die gefundenen Bögen und die wichtigsten Einstellungen.',
      journal: 'Erstellt die Hilfe- und Command-Deck-Handouts neu.',
      help: 'Zeigt diese Liste.',
    },
    helpPlayer: {
      menu: 'Zeigt deine Charaktere und ob sie Inspiration haben.',
      spend: 'Gibt die Inspiration des ausgewählten Charakters aus.',
      boost: 'Gibt Punkte aus einem Pool aus, um diesen Bonus auf einen Wurf zu addieren.',
      party: 'Zeigt die Gruppe, wenn die SL es erlaubt.',
      help: 'Zeigt diese Liste.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Inspiration, Heldenhafte Inspiration und Punktepools für jedes Spiel',
      overview: {
        heading: 'Überblick',
        body: 'InspirationTracker hält D&D-Inspiration auf Charakterbogen, Token und im Chat synchron. Gib sie über das Menü, den Bogen oder den Token-Marker, und jeder Token dieses Charakters zeigt den Marker. Spieler können sie mit einem Klick ausgeben, und die SL wird informiert, mit einem Rückgängig-Button. Es funktioniert mit dem D&D-2024-Bogen, wo sie Heldenhafte Inspiration heißt, und mit dem 2014-OGL-Bogen.',
      },
      quickStart: {
        heading: 'Schnellstart',
        steps: [
          'Öffne das Command-Deck-Handout oder gib !inspiration für das Menü ein.',
          'Wähle einen Token aus und klicke auf Geben. Der Charakter erhält Inspiration und seine Token zeigen den Marker.',
          'Klicke einmal auf Spielermakro, damit Spieler eine Token-Aktion Inspiration zum Ausgeben bekommen.',
          'Klicke auf Gruppe, um zu sehen, wer Inspiration hat.',
        ],
      },
      sheets: {
        heading: 'Charakterbögen',
        colSheet: 'Bogen',
        colWhere: 'Wo Inspiration gespeichert wird',
        colSheet2014: 'D&D 5E by Roll20 (2014 OGL)',
        where2014: 'Das Feld Inspiration, Attribut "inspiration".',
        colSheet2024: 'D&D Fifth Edition (5E & 5.5E, 2024)',
        where2024:
          'Das Feld Heldenhafte Inspiration, gelesen und geschrieben mit getSheetItem und setSheetItem.',
        points: [
          'Das Setzen oder Entfernen des Häkchens auf einem Bogen wird sofort bemerkt: Der Marker folgt, und Entfernen zählt als Ausgeben.',
          'Ist Bezeichnung auf „Vom Bogen“ gesetzt, nutzt jeder D&D-2024-Charakter die in seinen Bogeneinstellungen gewählten Regeln: Die Regeln von 2024 sagen Heldenhafte Inspiration, die von 2014 sagen Inspiration.',
          'Charaktere ohne einen dieser Bögen bleiben unberührt, NSC-Token werden also nicht verändert.',
        ],
      },
      players: {
        heading: 'Spieler',
        points: [
          'Spieler können Inspiration für Charaktere ausgeben, die sie steuern: per Klick auf Ausgeben im Chat oder auf die Token-Aktion Inspiration.',
          'Die SL erhält eine Nachricht, wer sie ausgegeben hat, mit einem Rückgängig-Button.',
          'Mit !inspiration sieht ein Spieler seine Charaktere und ob sie Inspiration haben.',
          'Schalte Spieler dürfen ausgeben aus, damit das Ausgeben in der Hand der SL bleibt.',
        ],
      },
      passOn: {
        heading: 'Weitergeben (Regeln von 2024)',
        points: [
          'Ein Charakter kann Heldenhafte Inspiration nicht doppelt haben. Würde ein Charakter, der sie hat, sie erneut erhalten, werden seine Spieler gefragt, sie einem anderen Gruppenmitglied ohne sie zu geben.',
          'Zur Wahl stehen alle Gruppenmitglieder ohne Heldenhafte Inspiration sowie Verzichten. Die Wahl läuft nach einer Stunde ab.',
          'Nach den Regeln von 2014 wird der SL nur mitgeteilt, dass der Charakter bereits Inspiration hat.',
          'Schalte Weitergeben aus, um stattdessen immer diese Nachricht zu erhalten.',
        ],
      },
      party: {
        heading: 'Die Gruppe',
        points: [
          'Zur Gruppe gehört jeder Charakter, den ein Spieler steuert. Wähle Token aus und klicke auf Zur Gruppe hinzufügen oder Aus Gruppe entfernen, um sie zu ändern.',
          'Die Übersicht der SL hat für jedes Mitglied die Buttons Geben, Entfernen und Ausgeben.',
          'Schalte Spieler sehen Gruppe ein, damit auch Spieler die Übersicht sehen. Ausgeben-Buttons erhalten sie nur für ihre eigenen Charaktere.',
        ],
      },
      pools: {
        heading: 'Punktepools',
        points: [
          'Ein Punktepool ist eine Zahl, die sich aufbaut und nach und nach ausgegeben wird: ein Pool aus Inspirationspunkten, Heldenpunkten, Glück, Bennies und Ähnlichem. Er funktioniert mit jedem Charakterbogen.',
          'Stelle Erfassung auf Punktepool, und Geben, Entfernen und Ausgeben wirken auf den Standardpool und fragen nach der Punktzahl. Der Marker wird angezeigt, solange ein Charakter Punkte hat.',
          'Verstärken gibt Punkte aus, um einen Wurf zu erhöhen: Gib den gewünschten Bonus ein, und Punkte pro +1 des Pools bestimmt die Kosten. Bei 2 Punkten pro +1 kostet ein Bonus von 4 also 8 Punkte. Die Mod kündigt die Ausgabe an; den Bonus addierst du selbst zum Wurf.',
          'Eine Ausgabe wird abgelehnt, wenn der Charakter nicht genug Punkte hat. Die SL erfährt, wer was ausgegeben hat, mit einem Rückgängig-Button.',
          'Gespeichert in „Ressourcenfeld des Bogens“ nutzt das Ressourcenfeld auf dem Bogen, das den Namen des Pools trägt, etwa ein Feld Other Resource namens Inspiration auf dem D&D-Bogen von 2014. Hat der Bogen kein Feld mit diesem Namen, oder bei „Attribut“, werden die Punkte in einem einfachen Attribut gespeichert, etwa inspiration_pool. Der D&D-2024-Bogen nutzt immer das Attribut.',
          'Die Gruppenkarte und die eigene Karte eines Spielers nennen, wo die Punkte jedes Charakters gespeichert sind: der Name des Feldes auf dem Bogen oder das Attribut. Ein Attribut wird auf dem Charakterbogen nicht angezeigt.',
          'Die Zahl von Hand auf dem Bogen zu ändern ist in Ordnung: Der Marker folgt.',
          'Klicke auf Pools, um den Standardpool umzubenennen, seine Kosten und sein Maximum festzulegen oder weitere Pools hinzuzufügen. Andere Pools nutzt du über ihren Gruppe-Button oder indem du --pool und den Namen des Pools an einen Befehl anhängst.',
          'Bardic Inspiration funktioniert als eigener Pool: Klicke auf Pool hinzufügen und nenne ihn Bardic Inspiration, setze sein Maximum auf 1 und wähle seinen Marker. Der GM gibt 1 über die Gruppe-Karte dieses Pools, wenn der Barde einen Würfel vergibt, und wer ihn hält, klickt auf Ausgeben, wenn er ihn einsetzt. Der Mod markiert, wer einen Würfel hält; der Spieler würfelt ihn selbst.',
        ],
      },
      markers: {
        heading: 'Token-Marker',
        points: [
          'Wähle den Marker mit der Einstellung Marker. Die farbigen Punkte von Roll20, die Standardmarker und deine eigenen Marker-Sets werden aufgeführt.',
          'Fügst du einem Token den Marker von Hand oder mit TokenMod hinzu, erhält der Charakter Inspiration. Entfernst du ihn, wird sie ausgegeben.',
          'Wird der Marker geändert, wechselt er sofort auf allen Token.',
          'Die eigenen Zustandsmarker des D&D-2024-Bogens werden nicht angeboten, da der Bogen sie selbst setzt.',
        ],
      },
      commands: {
        heading: 'Befehle',
        intro:
          'Jeder Befehl beginnt mit !inspiration. Befehle wirken auf die ausgewählten Token, sofern nicht --ids angegeben ist.',
        mods: 'Andere Mods können diese Befehle ebenfalls senden, zum Beispiel aus ScriptCards. Andere Mods können auch InspirationTracker.give, spend, remove und isInspired aufrufen.',
        colCommand: 'Befehl',
        colDesc: 'Funktion',
      },
      settings: {
        heading: 'Einstellungen',
        intro:
          'Ändere sie mit dem Button Einstellungen oder gib !inspiration set <setting> <value> ein.',
        colKey: 'Einstellung',
        colName: 'Name',
        colDesc: 'Funktion',
      },
      upgrading: {
        heading: 'Upgrade von 0.1',
        points: [
          'Marker, Spezialeffekt und Effekttyp aus Version 0.1 bleiben erhalten.',
          'Hast du in 0.1 einen eigenen Befehl gewählt, funktioniert er weiterhin neben !inspiration.',
          '!inspiration mit ausgewählten Token gibt oder entzieht weiterhin Inspiration.',
        ],
      },
      troubleshooting: {
        heading: 'Fehlerbehebung',
        points: [
          'Marker erscheint nicht auf einem Token? Klicke auf Synchronisieren, um alle Bögen neu einzulesen.',
          'Ein Token, der keinen Charakter darstellt, kann keine Inspiration haben. Verknüpfe ihn zuerst mit einem Charakter.',
          'Nichts passiert, wenn ein Spieler auf Ausgeben klickt? Prüfe, ob der Charakter diesem Spieler zugewiesen ist.',
          'Fehler werden in die API-Konsole auf der Seite Mod Scripts geschrieben.',
        ],
      },
      languages: {
        heading: 'Sprachen',
        body: 'InspirationTracker ist in die folgenden Sprachen übersetzt. Wähle eine mit der Einstellung Sprache.',
        colCode: 'Code',
        colName: 'Sprache',
        colNative: 'Eigenname',
      },
      credits: {
        heading: 'Danksagung',
        original: 'Ursprüngliche Mod von',
        maintainer: 'Version 1 betreut von',
        support: 'Melde Fehler und Ideen im Roll20-Mod-Forum oder auf GitHub.',
      },
      footer: 'Buttons für jede Aktion findest du im Handout „{deck}“.',
    },
    deck: {
      subtitle: 'Command Deck',
      selectedDesc: 'Wähle einen oder mehrere Token aus und klicke dann.',
      partyDesc: 'Sieh, wer Inspiration hat, und lege fest, wer zur Gruppe gehört.',
      poolsTitle: 'Punktepool',
      poolsDesc:
        'Wenn Erfassung auf Punktepool steht: Token auswählen, klicken und die Zahl eingeben.',
      toolsDesc: 'Menü, Einstellungen, das Spielermakro und Hilfe.',
      footer: 'Die vollständige Anleitung steht im Handout „{help}“.',
    },
  };

  const TRANSLATION$d = {
    terms: {
      heroic: 'Ηρωική Έμπνευση',
      classic: 'Έμπνευση',
    },
    titles: {
      ready: 'Το InspirationTracker είναι έτοιμο.',
      settings: 'Ρυθμίσεις InspirationTracker',
      help: 'Εντολές InspirationTracker',
      party: 'Έμπνευση ομάδας',
      poolParty: 'Ομάδα: {term}',
      pools: 'Αποθέματα πόντων',
      yours: 'Οι χαρακτήρες σου',
      status: 'Κατάσταση InspirationTracker',
    },
    messages: {
      gained: '{name}: απέκτησε {term}!',
      spent: '{name}: χρησιμοποιεί {term}.',
      spentBy: '{player}: ξόδεψε {term} για {name}.',
      spentSheet: '{name}: δεν έχει πια {term} (άλλαξε στο φύλλο ή στο πιόνι).',
      restored: '{name}: έχει ξανά {term}.',
      removed: 'Αφαιρέθηκε {term} από {name}.',
      already: '{name}: έχει ήδη {term}.',
      none: '{name}: δεν έχει {term}.',
      busy: '{name}: ενημερώνεται ακόμα. Δοκίμασε ξανά σε λίγο.',
      passOffer:
        '{name}: έχει ήδη {term} και δεν μπορεί να την έχει δύο φορές. Δώσ’ την σε μέλος της ομάδας που δεν την έχει, ή άφησέ την.',
      passNobody: 'Όλα τα άλλα μέλη της ομάδας την έχουν ήδη.',
      passAsked: 'Ρωτήθηκαν οι παίκτες του {name} ποιος θα πάρει {term}.',
      passed: '{from} δίνει {term} σε {to}!',
      passAlready: '{to}: την έχει ήδη. Διάλεξε κάποιον άλλο.',
      declined: '{name}: αφήνει την επιπλέον {term}.',
      undoAlready: '{name}: την έχει ήδη ξανά.',
      synced: 'Φύλλα που διαβάστηκαν: {checked}. Με έμπνευση: {inspired}.',
      migrated:
        'Οι ρυθμίσεις της έκδοσης 0.1 διατηρήθηκαν: δείκτης, ειδικό εφέ και ο τύπος του. Οι νέες ρυθμίσεις ξεκινούν από τις προεπιλογές τους.',
      legacyCommand: 'Η παλιά σου εντολή {command} λειτουργεί ακόμα, όπως και η {main}.',
      macroHint:
        'Για να δώσεις στους παίκτες κουμπί Ξόδεψε, εκτέλεσε {command}. Προσθέτει μια ενέργεια πιονιού για όλους.',
      macro:
        'Η μακροεντολή «{name}» είναι έτοιμη: οι παίκτες τη βλέπουν ως ενέργεια πιονιού όταν επιλέγουν ένα πιόνι που ελέγχουν.',
      journal: 'Τα έγγραφα Βοήθειας και Command Deck δημιουργήθηκαν ξανά.',
      readyHint: 'Γράψε {command} για το μενού, ή άνοιξε το έγγραφο Command Deck.',
    },
    pool: {
      gained: '{name}: κερδίζει {amount} {term} ({before} → {after}).',
      spent: '{name}: ξοδεύει {amount} {term} ({before} → {after}).',
      boosted: '{name}: ξοδεύει {amount} {term} για +{bonus} στη ζαριά ({before} → {after}).',
      spentBy: '{player}: ξόδεψε {amount} {term} για {name}.',
      restored: '{name}: πήρε πίσω {amount} {term} ({before} → {after}).',
      removed: 'Αφαιρέθηκαν {amount} {term} από {name} ({before} → {after}).',
      none: '{name}: δεν έχει {term}.',
      short: '{name}: έχει {have} {term}, ενώ χρειάζονται {need}.',
      full: '{name}: έχει ήδη το μέγιστο επιτρεπτό ({max}) σε {term}.',
    },
    pools: {
      introFlag:
        'Η Παρακολούθηση είναι ορισμένη στο πεδίο έμπνευσης του φύλλου. Όρισέ τη σε Απόθεμα πόντων ώστε το «{name}» να γίνει το απόθεμα στο οποίο ενεργούν τα Δώσε και Ξόδεψε. Τα άλλα αποθέματα χρησιμοποιούνται με --pool.',
      introPool:
        'Τα Δώσε, Ξόδεψε και Ενίσχυσε ενεργούν στο «{name}». Τα άλλα αποθέματα χρησιμοποιούνται από το κουμπί Ομάδα τους, ή με --pool.',
      defaultLabel: '{name} (προεπιλογή)',
      name: 'Όνομα',
      source: 'Αποθηκεύεται σε',
      cost: 'Πόντοι ανά +1',
      max: 'Μέγιστο',
      marker: 'Δείκτης',
      attribute: 'Χαρακτηριστικό όταν το φύλλο δεν έχει πεδίο με αυτό το όνομα: {attribute}',
      partyTotal: 'Σύνολο ομάδας: {total} {term}.',
      keptBox: 'Πεδίο του φύλλου: {name}',
      keptAttribute: 'Χαρακτηριστικό: {attribute}',
      keptNote: 'Ένα χαρακτηριστικό δεν εμφανίζεται στο φύλλο χαρακτήρα.',
    },
    prompts: {
      points: 'Πόντοι',
      bonus: 'Μπόνους στη ζαριά',
      max: 'Μέγιστοι επιτρεπτοί πόντοι (0 για χωρίς όριο)',
    },
    errors: {
      unknownPool: 'Δεν υπάρχει απόθεμα με όνομα «{value}».',
      unknownPoolHint: 'Αποθέματα: {pools}.',
      badAmount: 'Το «{value}» δεν είναι αριθμός πόντων.',
      badAmountHint: 'Χρησιμοποίησε ακέραιο αριθμό από 1 έως 9999.',
      boostNoPool: 'Το Ενίσχυσε ξοδεύει πόντους από ένα απόθεμα.',
      poolInvalid: 'Ένα απόθεμα δεν μπορεί να ονομάζεται «{value}».',
      poolExists: 'Υπάρχει ήδη απόθεμα με όνομα «{value}».',
      poolFull: 'Δεν υπάρχει χώρος για άλλο απόθεμα.',
      poolNameHint:
        'Χρησιμοποίησε όνομα έως 40 γράμματα, ψηφία και κενά που δεν το έχει άλλο απόθεμα.',
      poolDefault:
        'Το προεπιλεγμένο απόθεμα, «{name}», δεν μπορεί να διαγραφεί. Μπορεί να μετονομαστεί.',
      poolMarkerHint:
        'Διάλεξε από τα σετ δεικτών σου έναν δείκτη διαφορετικό από αυτόν της ρύθμισης Δείκτης.',
      poolSetHint: 'Γράψε !inspiration pools για να δεις κάθε απόθεμα και τις ρυθμίσεις του.',
      denied: 'Δεν μπορείς να το κάνεις αυτό για {name}.',
      gmOnly: 'Μόνο ο GM μπορεί να χρησιμοποιήσει αυτή την εντολή.',
      gmOnlyHint: 'Οι παίκτες μπορούν να χρησιμοποιούν spend, party και help.',
      spendOff: 'Ο GM έχει απενεργοποιήσει το ξόδεμα από τους παίκτες.',
      noCharacter: 'Αυτά τα πιόνια δεν αντιστοιχούν σε χαρακτήρα: {names}.',
      nothingSelected: 'Επίλεξε πρώτα ένα πιόνι.',
      nothingSelectedHint:
        'Επίλεξε πιόνια που αντιστοιχούν σε χαρακτήρες, ή πρόσθεσε --ids με ID πιονιών ή χαρακτήρων.',
      writeFailed: 'Δεν ήταν δυνατή η αλλαγή του φύλλου του {name}.',
      offerGone: 'Αυτή η επιλογή έχει ήδη γίνει ή έχει λήξει.',
      passInvalid: 'Διάλεξε μέλος της ομάδας διαφορετικό από αυτό που την έχει.',
      undoGone: 'Αυτό το ξόδεμα έχει ήδη αναιρεθεί ή είναι πολύ παλιό.',
      unknownMarker: 'Δεν υπάρχει δείκτης πιονιού με όνομα «{value}».',
      unknownMarkerHint:
        'Χρησιμοποίησε το κουμπί Δείκτης στις ρυθμίσεις για να διαλέξεις έναν από τα σετ δεικτών σου.',
      badSetting: 'Δεν είναι δυνατό να οριστεί το {key} σε «{value}».',
      badSettingHint: 'Γράψε !inspiration set για να δεις κάθε ρύθμιση και τις επιλογές της.',
      unknownCommand: 'Άγνωστη εντολή: {command}.',
      unknownCommandHint: 'Γράψε !inspiration help για τη λίστα εντολών.',
    },
    menu: {
      selected: 'Επιλεγμένα πιόνια',
      party: 'Ομάδα',
      tools: 'Εργαλεία',
      hint: 'Πλήρεις οδηγίες υπάρχουν στο έγγραφο «{help}».',
      noSheet: 'χωρίς φύλλο',
      noneYours: 'Δεν ελέγχεις κανέναν χαρακτήρα με φύλλο.',
      partyEmpty: 'Δεν ελέγχεις κανένα μέλος της ομάδας.',
      partyEmptyGm:
        'Δεν υπάρχει ακόμα κανείς στην ομάδα. Ανάθεσε χαρακτήρες σε παίκτες, ή επίλεξε πιόνια και πάτησε Προσθήκη στην ομάδα.',
      partyCount: '{count} από {total} έχουν {term}.',
    },
    buttons: {
      menu: 'Μενού',
      give: 'Δώσε',
      remove: 'Αφαίρεσε',
      toggle: 'Εναλλαγή',
      spend: 'Ξόδεψε',
      party: 'Ομάδα',
      partyAdd: 'Προσθήκη στην ομάδα',
      partyRemove: 'Αφαίρεση από την ομάδα',
      settings: 'Ρυθμίσεις',
      macro: 'Μακροεντολή παικτών',
      sync: 'Συγχρονισμός',
      status: 'Κατάσταση',
      help: 'Βοήθεια',
      reset: 'Επαναφορά ρυθμίσεων',
      refresh: 'Ανανέωση',
      undo: 'Αναίρεση',
      decline: 'Άφησέ την',
      boost: 'Ενίσχυσε',
      pools: 'Αποθέματα',
      addPool: 'Προσθήκη αποθέματος',
      deletePool: 'Διαγραφή αποθέματος',
    },
    values: {
      on: 'Ναι',
      off: 'Όχι',
      none: 'Κανένας',
      noLimit: 'Χωρίς όριο',
      tracking: {
        flag: 'Πεδίο έμπνευσης του φύλλου',
        pool: 'Απόθεμα πόντων',
      },
      source: {
        resource: 'Πεδίο πόρου του φύλλου',
        attribute: 'Χαρακτηριστικό',
      },
      wording: {
        2014: 'Έμπνευση (2014)',
        2024: 'Ηρωική Έμπνευση (2024)',
        auto: 'Από το φύλλο',
      },
      announce: {
        public: 'Όλοι',
        gm: 'GM και ιδιοκτήτες',
        off: 'Κανείς',
      },
    },
    settings: {
      language: {
        label: 'Γλώσσα',
        desc: 'Γλώσσα για μενού, μηνύματα και έγγραφα.',
      },
      tracking: {
        label: 'Παρακολούθηση',
        desc: 'Σε τι ενεργούν τα Δώσε και Ξόδεψε: στο πεδίο έμπνευσης των φύλλων D&D, που ένας χαρακτήρας το έχει ή δεν το έχει, ή σε ένα απόθεμα πόντων που μαζεύονται και ξοδεύονται λίγοι λίγοι.',
      },
      marker: {
        label: 'Δείκτης',
        desc: 'Δείκτης πιονιού που εμφανίζεται όσο ένας χαρακτήρας έχει έμπνευση. Εμφανίζονται και τα προσαρμοσμένα σετ δεικτών.',
      },
      wording: {
        label: 'Ονομασία',
        desc: 'Να λέγεται Έμπνευση ή Ηρωική Έμπνευση. Το «Από το φύλλο» χρησιμοποιεί τους κανόνες που έχουν επιλεγεί σε κάθε φύλλο D&D 2024, και Έμπνευση στο φύλλο 2014.',
      },
      announce: {
        label: 'Ανακοίνωση',
        desc: 'Ποιος βλέπει το μήνυμα στη συνομιλία όταν αποκτάται ή ξοδεύεται έμπνευση.',
      },
      fx: {
        label: 'Ειδικό εφέ',
        desc: 'Παίζει ένα ειδικό εφέ στο πιόνι όταν αποκτά έμπνευση.',
      },
      fxType: {
        label: 'Τύπος εφέ',
        desc: 'Ποιο εφέ θα παίξει, π.χ. nova-holy, ή το ID ενός προσαρμοσμένου εφέ.',
      },
      playerSpend: {
        label: 'Οι παίκτες ξοδεύουν',
        desc: 'Επιτρέπει στους παίκτες να ξοδεύουν έμπνευση για τους χαρακτήρες που ελέγχουν. Ο GM ενημερώνεται, με κουμπί Αναίρεση.',
      },
      playerOverview: {
        label: 'Οι παίκτες βλέπουν την ομάδα',
        desc: 'Επιτρέπει στους παίκτες να βλέπουν ποιος στην ομάδα έχει έμπνευση.',
      },
      passOn: {
        label: 'Μεταβίβαση (2024)',
        desc: 'Με τους κανόνες του 2024, ένας χαρακτήρας που θα αποκτούσε Ηρωική Έμπνευση ενώ την έχει ήδη μπορεί να τη δώσει σε άλλο μέλος της ομάδας.',
      },
    },
    status: {
      version: 'Έκδοση',
      beacon: 'Φύλλα D&D 2024',
      legacy: 'Φύλλα 2014',
      none: 'Χαρακτήρες χωρίς πεδίο έμπνευσης',
      rules2024: 'Με κανόνες 2024',
      party: 'Μέλη ομάδας',
      tracking: 'Παρακολούθηση',
      pools: 'Αποθέματα',
      marker: 'Δείκτης',
      fx: 'Ειδικό εφέ',
      legacyCommand: 'Παλιά εντολή',
    },
    help: {
      menu: 'Εμφανίζει το μενού. Με επιλεγμένα πιόνια, δίνει ή αφαιρεί έμπνευση, όπως η έκδοση 0.1.',
      give: 'Δίνει έμπνευση στους επιλεγμένους χαρακτήρες.',
      remove: 'Αφαιρεί την έμπνευση από τους επιλεγμένους χαρακτήρες, χωρίς να μετρά ως ξόδεμα.',
      toggle:
        'Δίνει έμπνευση στους επιλεγμένους χαρακτήρες που δεν την έχουν, και την αφαιρεί από όσους την έχουν.',
      spend: 'Ξοδεύει την έμπνευση των επιλεγμένων χαρακτήρων και ενημερώνει τον GM.',
      party:
        'Εμφανίζει ποιος στην ομάδα έχει έμπνευση, με κουμπιά για να δοθεί, να αφαιρεθεί ή να ξοδευτεί.',
      partyEdit: 'Προσθέτει τους επιλεγμένους χαρακτήρες στην ομάδα, ή τους αφαιρεί.',
      ids: 'Ενεργεί στα ID πιονιών ή χαρακτήρων που δίνονται αντί για τα επιλεγμένα πιόνια.',
      points:
        'Με απόθεμα πόντων: δίνει, αφαιρεί ή ξοδεύει τόσους πόντους. Χωρίς αριθμό, 1. Το remove all αφαιρεί όλους τους πόντους.',
      boost:
        'Με απόθεμα πόντων: ξοδεύει πόντους για να προσθέσει αυτό το μπόνους σε μια ζαριά, με το κόστος του αποθέματος για κάθε +1.',
      poolFlag: 'Ενεργεί στο απόθεμα που ονομάζεται αντί για το προεπιλεγμένο.',
      pools: 'Εμφανίζει τα αποθέματα πόντων και τις ρυθμίσεις τους.',
      poolEdit: 'Προσθέτει ένα απόθεμα, ή διαγράφει ένα. Οι πόντοι στα φύλλα μένουν όπως είναι.',
      poolSet:
        'Αλλάζει ένα απόθεμα: το όνομά του, πού αποθηκεύεται (resource ή attribute), τους πόντους που κοστίζει κάθε +1, τους μέγιστους επιτρεπτούς πόντους (0 για χωρίς όριο), ή τον δείκτη πιονιού του.',
      undo: 'Επιστρέφει έμπνευση που ξοδεύτηκε. Το ID υπάρχει στο μήνυμα προς τον GM για το ξόδεμα.',
      macro:
        'Προσθέτει την ενέργεια πιονιού «Inspiration», που πατούν οι παίκτες για να ξοδέψουν έμπνευση.',
      sync: 'Διαβάζει ξανά κάθε φύλλο και διορθώνει τους δείκτες.',
      set: 'Εμφανίζει τις ρυθμίσεις, ή αλλάζει μία.',
      reset: 'Επαναφέρει κάθε ρύθμιση στην προεπιλογή της, εκτός από τη γλώσσα.',
      status: 'Εμφανίζει την έκδοση, τα φύλλα που βρέθηκαν και τις κύριες ρυθμίσεις.',
      journal: 'Δημιουργεί ξανά τα έγγραφα Βοήθειας και Command Deck.',
      help: 'Εμφανίζει αυτή τη λίστα.',
    },
    helpPlayer: {
      menu: 'Εμφανίζει τους χαρακτήρες σου και αν έχουν έμπνευση.',
      spend: 'Ξοδεύει την έμπνευση του επιλεγμένου χαρακτήρα.',
      boost: 'Ξοδεύει πόντους από ένα απόθεμα για να προσθέσει αυτό το μπόνους σε μια ζαριά.',
      party: 'Εμφανίζει την ομάδα, αν το επιτρέπει ο GM.',
      help: 'Εμφανίζει αυτή τη λίστα.',
    },
    handout: {
      versionLabel: 'Έκδοση',
      subtitle: 'Έμπνευση, Ηρωική Έμπνευση και αποθέματα πόντων για κάθε παιχνίδι',
      overview: {
        heading: 'Επισκόπηση',
        body: 'Το InspirationTracker κρατά συγχρονισμένη την έμπνευση του D&D στο φύλλο χαρακτήρα, στο πιόνι και στη συνομιλία. Δώσ’ την από το μενού, το φύλλο ή τον δείκτη πιονιού, και κάθε πιόνι του χαρακτήρα δείχνει τον δείκτη. Οι παίκτες μπορούν να την ξοδέψουν με ένα κλικ, και ο GM ενημερώνεται, με κουμπί Αναίρεση. Λειτουργεί με το φύλλο D&D 2024, όπου λέγεται Ηρωική Έμπνευση, και με το φύλλο OGL 2014.',
      },
      quickStart: {
        heading: 'Γρήγορη εκκίνηση',
        steps: [
          'Άνοιξε το έγγραφο Command Deck, ή γράψε !inspiration για το μενού.',
          'Επίλεξε ένα πιόνι και πάτησε Δώσε. Ο χαρακτήρας αποκτά έμπνευση και τα πιόνια του δείχνουν τον δείκτη.',
          'Πάτησε μία φορά Μακροεντολή παικτών, ώστε οι παίκτες να έχουν την ενέργεια πιονιού Inspiration για να την ξοδεύουν.',
          'Πάτησε Ομάδα για να δεις ποιος έχει έμπνευση.',
        ],
      },
      sheets: {
        heading: 'Φύλλα χαρακτήρων',
        colSheet: 'Φύλλο',
        colWhere: 'Πού αποθηκεύεται η έμπνευση',
        colSheet2014: 'D&D 5E by Roll20 (2014 OGL)',
        where2014: 'Το πεδίο Έμπνευση, χαρακτηριστικό "inspiration".',
        colSheet2024: 'D&D Fifth Edition (5E & 5.5E, 2024)',
        where2024:
          'Το πεδίο Ηρωική Έμπνευση, που διαβάζεται και γράφεται με getSheetItem και setSheetItem.',
        points: [
          'Το τσεκάρισμα ή ξετσεκάρισμα του πεδίου σε ένα φύλλο εντοπίζεται αμέσως: ο δείκτης ακολουθεί, και το ξετσεκάρισμα μετρά ως ξόδεμα.',
          'Με την Ονομασία στο «Από το φύλλο», κάθε χαρακτήρας D&D 2024 χρησιμοποιεί τους κανόνες που επιλέχθηκαν στις ρυθμίσεις του φύλλου του: οι κανόνες 2024 λένε Ηρωική Έμπνευση, οι κανόνες 2014 λένε Έμπνευση.',
          'Χαρακτήρες χωρίς κανένα από τα δύο φύλλα μένουν ανέγγιχτοι, οπότε τα πιόνια NPC δεν αλλάζουν.',
        ],
      },
      players: {
        heading: 'Παίκτες',
        points: [
          'Οι παίκτες μπορούν να ξοδεύουν έμπνευση για χαρακτήρες που ελέγχουν: πατώντας Ξόδεψε στη συνομιλία, ή την ενέργεια πιονιού Inspiration.',
          'Ο GM λαμβάνει μήνυμα για το ποιος την ξόδεψε, με κουμπί Αναίρεση.',
          'Γράφοντας !inspiration ένας παίκτης βλέπει τους χαρακτήρες του και αν έχουν έμπνευση.',
          'Απενεργοποίησε το Οι παίκτες ξοδεύουν για να μένει το ξόδεμα στα χέρια του GM.',
        ],
      },
      passOn: {
        heading: 'Μεταβίβαση (κανόνες 2024)',
        points: [
          'Ένας χαρακτήρας δεν μπορεί να έχει Ηρωική Έμπνευση δύο φορές. Όταν κάποιος που την έχει θα την αποκτούσε ξανά, οι παίκτες του καλούνται να τη δώσουν σε άλλο μέλος της ομάδας που δεν την έχει.',
          'Η επιλογή προσφέρει κάθε μέλος της ομάδας χωρίς Ηρωική Έμπνευση, και το Άφησέ την. Λήγει μετά από μία ώρα.',
          'Με τους κανόνες του 2014, ο GM απλώς ενημερώνεται ότι ο χαρακτήρας έχει ήδη Έμπνευση.',
          'Απενεργοποίησε τη Μεταβίβαση για να παίρνεις πάντα αυτό το μήνυμα.',
        ],
      },
      party: {
        heading: 'Η ομάδα',
        points: [
          'Η ομάδα είναι κάθε χαρακτήρας που ελέγχει ένας παίκτης. Επίλεξε πιόνια και πάτησε Προσθήκη στην ομάδα ή Αφαίρεση από την ομάδα για να την αλλάξεις.',
          'Η επισκόπηση του GM έχει κουμπιά Δώσε, Αφαίρεσε και Ξόδεψε για κάθε μέλος.',
          'Ενεργοποίησε το Οι παίκτες βλέπουν την ομάδα για να βλέπουν και οι παίκτες την επισκόπηση. Παίρνουν κουμπιά Ξόδεψε μόνο για τους δικούς τους χαρακτήρες.',
        ],
      },
      pools: {
        heading: 'Αποθέματα πόντων',
        points: [
          'Ένα απόθεμα πόντων είναι ένας αριθμός που μαζεύεται και ξοδεύεται λίγο λίγο: ένα απόθεμα πόντων έμπνευσης, πόντων ήρωα, τύχης, bennies και παρόμοιων. Λειτουργεί με οποιοδήποτε φύλλο χαρακτήρα.',
          'Όρισε την Παρακολούθηση σε Απόθεμα πόντων, και τα Δώσε, Αφαίρεσε και Ξόδεψε ενεργούν στο προεπιλεγμένο απόθεμα, ρωτώντας πόσους πόντους. Ο δείκτης εμφανίζεται όσο ένας χαρακτήρας έχει πόντους.',
          'Το Ενίσχυσε ξοδεύει πόντους για να ανεβάσει μια ζαριά: γράψε το μπόνους που θέλεις, και η ρύθμιση Πόντοι ανά +1 του αποθέματος καθορίζει το κόστος. Με 2 πόντους ανά +1, ένα μπόνους 4 κοστίζει 8 πόντους. Το Mod ανακοινώνει το ξόδεμα· πρόσθεσε εσύ το μπόνους στη ζαριά.',
          'Ένα ξόδεμα απορρίπτεται όταν ο χαρακτήρας δεν έχει αρκετούς πόντους. Ο GM ενημερώνεται για το ποιος ξόδεψε τι, με κουμπί Αναίρεση.',
          'Το Αποθηκεύεται σε «Πεδίο πόρου του φύλλου» χρησιμοποιεί το πεδίο πόρου του φύλλου που έχει το όνομα του αποθέματος, όπως ένα πεδίο Other Resource με όνομα Inspiration στο φύλλο D&D 2014. Όταν το φύλλο δεν έχει πεδίο με αυτό το όνομα, ή με το «Χαρακτηριστικό», οι πόντοι αποθηκεύονται σε ένα απλό χαρακτηριστικό, όπως το inspiration_pool. Το φύλλο D&D 2024 χρησιμοποιεί πάντα το χαρακτηριστικό.',
          'Η κάρτα της ομάδας και η κάρτα του ίδιου του παίκτη δείχνουν πού αποθηκεύονται οι πόντοι κάθε χαρακτήρα: το όνομα του πεδίου του φύλλου ή το χαρακτηριστικό. Ένα χαρακτηριστικό δεν εμφανίζεται στο φύλλο χαρακτήρα.',
          'Η αλλαγή του αριθμού στο φύλλο με το χέρι δεν πειράζει: ο δείκτης ακολουθεί.',
          'Πάτησε Αποθέματα για να μετονομάσεις το προεπιλεγμένο απόθεμα, να ορίσεις το κόστος και το μέγιστό του, ή να προσθέσεις κι άλλα αποθέματα. Τα άλλα αποθέματα χρησιμοποιούνται από το κουμπί Ομάδα τους, ή προσθέτοντας --pool και το όνομα του αποθέματος σε μια εντολή.',
          'Το Bardic Inspiration λειτουργεί ως ξεχωριστό απόθεμα: πάτησε Προσθήκη αποθέματος και ονόμασέ το Bardic Inspiration, όρισε το Μέγιστο στο 1 και διάλεξε τον Δείκτη του. Ο GM δίνει 1 από την κάρτα Ομάδα αυτού του αποθέματος όταν ο βάρδος μοιράζει ένα ζάρι, και όποιος το κρατά πατά Ξόδεψε όταν το χρησιμοποιεί. Το Mod σημειώνει ποιος κρατά ζάρι· ο παίκτης το ρίχνει μόνος του.',
        ],
      },
      markers: {
        heading: 'Δείκτες πιονιών',
        points: [
          'Διάλεξε τον δείκτη με τη ρύθμιση Δείκτης. Εμφανίζονται οι χρωματιστές κουκκίδες του Roll20, οι προεπιλεγμένοι δείκτες και τα προσαρμοσμένα σετ δεικτών σου.',
          'Αν προσθέσεις τον δείκτη σε ένα πιόνι με το χέρι, ή με το TokenMod, ο χαρακτήρας αποκτά έμπνευση. Αν τον αφαιρέσεις, την ξοδεύει.',
          'Η αλλαγή δείκτη τον μεταφέρει αμέσως σε κάθε πιόνι.',
          'Οι δικοί δείκτες καταστάσεων του φύλλου D&D 2024 δεν προσφέρονται, επειδή τους ορίζει το ίδιο το φύλλο.',
        ],
      },
      commands: {
        heading: 'Εντολές',
        intro:
          'Κάθε εντολή ξεκινά με !inspiration. Οι εντολές ενεργούν στα επιλεγμένα πιόνια, εκτός αν δοθεί --ids.',
        mods: 'Άλλα Mods μπορούν επίσης να στέλνουν αυτές τις εντολές, για παράδειγμα από το ScriptCards. Άλλα Mods μπορούν επίσης να καλούν InspirationTracker.give, spend, remove και isInspired.',
        colCommand: 'Εντολή',
        colDesc: 'Τι κάνει',
      },
      settings: {
        heading: 'Ρυθμίσεις',
        intro: 'Άλλαξέ τες με το κουμπί Ρυθμίσεις, ή γράψε !inspiration set <setting> <value>.',
        colKey: 'Ρύθμιση',
        colName: 'Όνομα',
        colDesc: 'Τι κάνει',
      },
      upgrading: {
        heading: 'Αναβάθμιση από την 0.1',
        points: [
          'Ο δείκτης, το ειδικό εφέ και ο τύπος εφέ της έκδοσης 0.1 διατηρούνται.',
          'Αν είχες διαλέξει δική σου εντολή στην 0.1, λειτουργεί ακόμα μαζί με την !inspiration.',
          'Η !inspiration με επιλεγμένα πιόνια εξακολουθεί να δίνει ή να αφαιρεί έμπνευση.',
        ],
      },
      troubleshooting: {
        heading: 'Αντιμετώπιση προβλημάτων',
        points: [
          'Ο δείκτης δεν εμφανίζεται σε ένα πιόνι; Πάτησε Συγχρονισμός για να διαβαστεί ξανά κάθε φύλλο.',
          'Ένα πιόνι που δεν αντιστοιχεί σε χαρακτήρα δεν μπορεί να έχει έμπνευση. Σύνδεσέ το πρώτα με έναν χαρακτήρα.',
          'Δεν συμβαίνει τίποτα όταν ένας παίκτης πατά Ξόδεψε; Έλεγξε ότι ο χαρακτήρας έχει ανατεθεί σε αυτόν τον παίκτη.',
          'Τα σφάλματα γράφονται στην κονσόλα API της σελίδας Mod Scripts.',
        ],
      },
      languages: {
        heading: 'Γλώσσες',
        body: 'Το InspirationTracker έχει μεταφραστεί στις παρακάτω γλώσσες. Διάλεξε μία με τη ρύθμιση Γλώσσα.',
        colCode: 'Κωδικός',
        colName: 'Γλώσσα',
        colNative: 'Εγγενές όνομα',
      },
      credits: {
        heading: 'Συντελεστές',
        original: 'Αρχικό Mod από',
        maintainer: 'Η έκδοση 1 συντηρείται από',
        support: 'Ανέφερε σφάλματα και ιδέες στο φόρουμ Mod του Roll20 ή στο GitHub.',
      },
      footer: 'Κουμπιά για κάθε ενέργεια υπάρχουν στο έγγραφο «{deck}».',
    },
    deck: {
      subtitle: 'Command Deck',
      selectedDesc: 'Επίλεξε ένα ή περισσότερα πιόνια και μετά πάτησε.',
      partyDesc: 'Δες ποιος έχει έμπνευση, και διάλεξε ποιος ανήκει στην ομάδα.',
      poolsTitle: 'Απόθεμα πόντων',
      poolsDesc:
        'Με την Παρακολούθηση σε Απόθεμα πόντων: επίλεξε πιόνια, πάτησε και γράψε τον αριθμό.',
      toolsDesc: 'Μενού, ρυθμίσεις, η μακροεντολή παικτών και βοήθεια.',
      footer: 'Πλήρεις οδηγίες υπάρχουν στο έγγραφο «{help}».',
    },
  };

  const TRANSLATION$c = {
    terms: {
      heroic: 'השראה הרואית',
      classic: 'השראה',
    },
    titles: {
      ready: 'InspirationTracker מוכן.',
      settings: 'הגדרות InspirationTracker',
      help: 'פקודות InspirationTracker',
      party: 'השראה בחבורה',
      poolParty: '{term} בחבורה',
      pools: 'מאגרי נקודות',
      yours: 'הדמויות שלך',
      status: 'מצב InspirationTracker',
    },
    messages: {
      gained: 'ל-{name} יש {term}!',
      spent: '{name} משתמש ב{term}.',
      spentBy: '{player} השתמש ב{term} עבור {name}.',
      spentSheet: 'ל-{name} כבר אין {term} (שונה בגיליון או באסימון).',
      restored: 'ל-{name} יש שוב {term}.',
      removed: '{term} נלקחה מ-{name}.',
      already: 'ל-{name} כבר יש {term}.',
      none: 'ל-{name} אין {term}.',
      busy: '{name} עדיין מתעדכן. נסה שוב בעוד רגע.',
      passOffer:
        'ל-{name} כבר יש {term} ואי אפשר להחזיק בה פעמיים. תן אותה לחבר בחבורה שאין לו, או וותר עליה.',
      passNobody: 'לכל שאר חברי החבורה כבר יש אותה.',
      passAsked: 'השחקנים של {name} נשאלו מי יקבל את ה{term}.',
      passed: '{from} נותן {term} ל-{to}!',
      passAlready: 'ל-{to} כבר יש אותה. בחר מישהו אחר.',
      declined: '{name} מוותר על ה{term} העודפת.',
      undoAlready: 'ל-{name} כבר יש אותה שוב.',
      synced: 'גיליונות שנקראו: {checked}. עם השראה: {inspired}.',
      migrated:
        'ההגדרות מגרסה 0.1 נשמרו: סמן, אפקט מיוחד וסוג האפקט. ההגדרות החדשות מתחילות בערכי ברירת המחדל.',
      legacyCommand: 'הפקודה הישנה שלך {command} עדיין עובדת, וכך גם {main}.',
      macroHint: 'כדי לתת לשחקנים כפתור השתמש, הרץ {command}. זה מוסיף פעולת אסימון לכולם.',
      macro: 'המאקרו "{name}" מוכן: השחקנים רואים אותו כפעולת אסימון כשהם בוחרים אסימון שבשליטתם.',
      journal: 'דפי המידע Help ו-Command Deck נבנו מחדש.',
      readyHint: 'הקלד {command} לתפריט, או פתח את דף המידע Command Deck.',
    },
    pool: {
      gained: '{name} מקבל {amount} {term} ({before} → {after}).',
      spent: '{name} משתמש ב-{amount} {term} ({before} → {after}).',
      boosted: '{name} משתמש ב-{amount} {term} בשביל +{bonus} להטלה ({before} → {after}).',
      spentBy: '{player} השתמש ב-{amount} {term} עבור {name}.',
      restored: '{name} קיבל בחזרה {amount} {term} ({before} → {after}).',
      removed: '{amount} {term} נלקחו מ-{name} ({before} → {after}).',
      none: 'ל-{name} אין {term}.',
      short: 'ל-{name} יש {have} {term}, ונדרשות {need}.',
      full: 'ל-{name} כבר יש את המקסימום המותר של {term} ({max}).',
    },
    pools: {
      introFlag:
        'המעקב מוגדר לתיבת ההשראה בגיליון. הגדר אותו למאגר נקודות כדי ש"{name}" יהיה המאגר שעליו פועלים תן והשתמש. במאגרים אחרים משתמשים עם --pool.',
      introPool:
        'תן, השתמש וחיזוק פועלים על "{name}". במאגרים אחרים משתמשים מכפתור החבורה שלהם, או עם --pool.',
      defaultLabel: '{name} (ברירת מחדל)',
      name: 'שם',
      source: 'מקום שמירה',
      cost: 'נקודות לכל +1',
      max: 'מקסימום',
      marker: 'סמן',
      attribute: 'התכונה כשאין בגיליון תיבה בשם הזה: {attribute}',
      partyTotal: 'סך הכול בחבורה: {total} {term}.',
      keptBox: 'תיבה בגיליון: {name}',
      keptAttribute: 'תכונה: {attribute}',
      keptNote: 'תכונה אינה מוצגת בגיליון הדמות.',
    },
    prompts: {
      points: 'נקודות',
      bonus: 'בונוס להטלה',
      max: 'מספר הנקודות המרבי (0 ללא הגבלה)',
    },
    errors: {
      unknownPool: 'אין מאגר בשם "{value}".',
      unknownPoolHint: 'מאגרים: {pools}.',
      badAmount: '"{value}" אינו מספר נקודות.',
      badAmountHint: 'השתמש במספר שלם מ-1 עד 9999.',
      boostNoPool: 'חיזוק משתמש בנקודות ממאגר.',
      poolInvalid: 'אי אפשר לקרוא למאגר "{value}".',
      poolExists: 'כבר יש מאגר בשם "{value}".',
      poolFull: 'אין מקום למאגר נוסף.',
      poolNameHint: 'השתמש בשם של עד 40 אותיות, ספרות ורווחים שאין לאף מאגר אחר.',
      poolDefault: 'אי אפשר למחוק את מאגר ברירת המחדל, "{name}". אפשר לשנות את שמו.',
      poolMarkerHint: 'בחר ממערכות הסמנים שלך סמן שאינו הסמן שבהגדרה סמן.',
      poolSetHint: 'הקלד !inspiration pools כדי לראות כל מאגר וההגדרות שלו.',
      denied: 'אינך יכול לעשות זאת עבור {name}.',
      gmOnly: 'רק ה-GM יכול להשתמש בפקודה הזו.',
      gmOnlyHint: 'שחקנים יכולים להשתמש ב-spend, party ו-help.',
      spendOff: 'ה-GM כיבה את האפשרות של שחקנים להשתמש בהשראה.',
      noCharacter: 'האסימונים האלה אינם מייצגים דמות: {names}.',
      nothingSelected: 'בחר קודם אסימון.',
      nothingSelectedHint:
        'בחר אסימונים שמייצגים דמויות, או הוסף --ids עם מזהי אסימונים או דמויות.',
      writeFailed: 'לא ניתן היה לשנות את הגיליון של {name}.',
      offerGone: 'הבחירה הזו כבר נעשתה, או שתוקפה פג.',
      passInvalid: 'בחר חבר בחבורה שאינו זה שמחזיק בה.',
      undoGone: 'השימוש הזה כבר בוטל, או שהוא ישן מדי.',
      unknownMarker: 'אין סמן אסימון בשם "{value}".',
      unknownMarkerHint: 'השתמש בכפתור סמן בהגדרות כדי לבחור אחד ממערכות הסמנים שלך.',
      badSetting: 'לא ניתן להגדיר את {key} ל-"{value}".',
      badSettingHint: 'הקלד !inspiration set כדי לראות כל הגדרה והאפשרויות שלה.',
      unknownCommand: 'פקודה לא מוכרת: {command}.',
      unknownCommandHint: 'הקלד !inspiration help לרשימת הפקודות.',
    },
    menu: {
      selected: 'אסימונים נבחרים',
      party: 'חבורה',
      tools: 'כלים',
      hint: 'ההוראות המלאות נמצאות בדף המידע "{help}".',
      noSheet: 'אין גיליון',
      noneYours: 'אינך שולט באף דמות עם גיליון.',
      partyEmpty: 'אינך שולט באף חבר בחבורה.',
      partyEmptyGm:
        'אין עדיין אף אחד בחבורה. הקצה דמויות לשחקנים, או בחר אסימונים ולחץ הוסף לחבורה.',
      partyCount: 'ל-{count} מתוך {total} יש {term}.',
    },
    buttons: {
      menu: 'תפריט',
      give: 'תן',
      remove: 'הסר',
      toggle: 'החלף',
      spend: 'השתמש',
      party: 'חבורה',
      partyAdd: 'הוסף לחבורה',
      partyRemove: 'הסר מהחבורה',
      settings: 'הגדרות',
      macro: 'מאקרו לשחקנים',
      sync: 'סנכרן',
      status: 'מצב',
      help: 'עזרה',
      reset: 'אפס הגדרות',
      refresh: 'רענן',
      undo: 'בטל',
      decline: 'וותר',
      boost: 'חיזוק',
      pools: 'מאגרים',
      addPool: 'הוסף מאגר',
      deletePool: 'מחק מאגר',
    },
    values: {
      on: 'פעיל',
      off: 'כבוי',
      none: 'ללא',
      noLimit: 'ללא הגבלה',
      tracking: {
        flag: 'תיבת ההשראה בגיליון',
        pool: 'מאגר נקודות',
      },
      source: {
        resource: 'תיבת משאב בגיליון',
        attribute: 'תכונה',
      },
      wording: {
        2014: 'השראה (2014)',
        2024: 'השראה הרואית (2024)',
        auto: 'לפי הגיליון',
      },
      announce: {
        public: 'כולם',
        gm: 'GM ובעלים',
        off: 'אף אחד',
      },
    },
    settings: {
      language: {
        label: 'שפה',
        desc: 'השפה של התפריטים, ההודעות ודפי המידע.',
      },
      tracking: {
        label: 'מעקב',
        desc: 'על מה פועלים תן והשתמש: תיבת ההשראה בגיליונות D&D, שלדמות יש או אין, או מאגר נקודות שמצטבר ומנוצל כמה נקודות בכל פעם.',
      },
      marker: {
        label: 'סמן',
        desc: 'סמן האסימון שמוצג כל עוד לדמות יש השראה. גם ערכות סמנים מותאמות אישית מופיעות ברשימה.',
      },
      wording: {
        label: 'ניסוח',
        desc: 'לקרוא לזה השראה או השראה הרואית. "לפי הגיליון" משתמש בכללים שנבחרו בכל גיליון D&D 2024, ובהשראה בגיליון 2014.',
      },
      announce: {
        label: 'הכרזה',
        desc: 'מי רואה את הודעת הצ׳אט כשמתקבלת השראה או כשמשתמשים בה.',
      },
      fx: {
        label: 'אפקט מיוחד',
        desc: 'מציג אפקט מיוחד על האסימון כשהוא מקבל השראה.',
      },
      fxType: {
        label: 'סוג אפקט',
        desc: 'איזה אפקט להציג, למשל nova-holy, או המזהה של אפקט מותאם אישית.',
      },
      playerSpend: {
        label: 'שחקנים יכולים להשתמש',
        desc: 'מאפשר לשחקנים להשתמש בהשראה של הדמויות שבשליטתם. ה-GM מקבל הודעה, עם כפתור בטל.',
      },
      playerOverview: {
        label: 'שחקנים רואים את החבורה',
        desc: 'מאפשר לשחקנים לראות למי בחבורה יש השראה.',
      },
      passOn: {
        label: 'העברה (2024)',
        desc: 'לפי כללי 2024, דמות שאמורה לקבל השראה הרואית כשכבר יש לה אחת יכולה לתת אותה לחבר אחר בחבורה.',
      },
    },
    status: {
      version: 'גרסה',
      beacon: 'גיליונות D&D 2024',
      legacy: 'גיליונות 2014',
      none: 'דמויות ללא תיבת השראה',
      rules2024: 'דמויות לפי כללי 2024',
      party: 'חברי החבורה',
      tracking: 'מעקב',
      pools: 'מאגרים',
      marker: 'סמן',
      fx: 'אפקט מיוחד',
      legacyCommand: 'פקודה ישנה',
    },
    help: {
      menu: 'מציג את התפריט. כשנבחרו אסימונים, נותן או לוקח השראה, כמו בגרסה 0.1.',
      give: 'נותן השראה לדמויות שנבחרו.',
      remove: 'לוקח השראה מהדמויות שנבחרו, בלי לספור זאת כשימוש.',
      toggle: 'נותן השראה לדמויות שנבחרו שאין להן, ולוקח אותה מאלה שיש להן.',
      spend: 'משתמש בהשראה של הדמויות שנבחרו ומודיע ל-GM.',
      party: 'מציג למי בחבורה יש השראה, עם כפתורים לתת, להסיר או להשתמש בה.',
      partyEdit: 'מוסיף את הדמויות שנבחרו לחבורה, או מוציא אותן ממנה.',
      ids: 'פועל על מזהי האסימונים או הדמויות שניתנו במקום על האסימונים שנבחרו.',
      points:
        'עם מאגר נקודות: נותן, לוקח או מנצל את מספר הנקודות הזה. בלי מספר, 1. remove all לוקח את כל הנקודות.',
      boost:
        'עם מאגר נקודות: מנצל נקודות כדי להוסיף את הבונוס הזה להטלה, לפי העלות של המאגר לכל +1.',
      poolFlag: 'פועל על המאגר שצוין במקום על מאגר ברירת המחדל.',
      pools: 'מציג את מאגרי הנקודות וההגדרות שלהם.',
      poolEdit: 'מוסיף מאגר, או מוחק מאגר. הנקודות שבגיליונות נשארות כמו שהן.',
      poolSet:
        'משנה מאגר: השם שלו, היכן הוא נשמר (resource או attribute), כמה נקודות עולה כל +1, מספר הנקודות המרבי (0 ללא הגבלה), או סמן האסימון שלו.',
      undo: 'מחזיר השראה שנוצלה. המזהה מופיע בהודעה ל-GM על השימוש.',
      macro: 'מוסיף את פעולת האסימון "Inspiration", שהשחקנים לוחצים עליה כדי להשתמש בהשראה.',
      sync: 'קורא שוב כל גיליון ומתקן את הסמנים.',
      set: 'מציג את ההגדרות, או משנה אחת מהן.',
      reset: 'מחזיר כל הגדרה לברירת המחדל שלה, מלבד השפה.',
      status: 'מציג את הגרסה, הגיליונות שנמצאו וההגדרות העיקריות.',
      journal: 'בונה מחדש את דפי המידע Help ו-Command Deck.',
      help: 'מציג את הרשימה הזו.',
    },
    helpPlayer: {
      menu: 'מציג את הדמויות שלך והאם יש להן השראה.',
      spend: 'משתמש בהשראה של הדמות שנבחרה.',
      boost: 'מנצל נקודות ממאגר כדי להוסיף את הבונוס הזה להטלה.',
      party: 'מציג את החבורה, אם ה-GM מאפשר זאת.',
      help: 'מציג את הרשימה הזו.',
    },
    handout: {
      versionLabel: 'גרסה',
      subtitle: 'השראה, השראה הרואית ומאגרי נקודות לכל משחק',
      overview: {
        heading: 'סקירה',
        body: 'InspirationTracker שומר על השראת D&D מתואמת בין גיליון הדמות, האסימון והצ׳אט. תן אותה מהתפריט, מהגיליון או מסמן האסימון, וכל אסימון של אותה דמות מציג את הסמן. שחקנים יכולים להשתמש בה בלחיצה אחת, וה-GM מקבל הודעה, עם כפתור בטל. הוא עובד עם גיליון D&D 2024, שבו היא נקראת השראה הרואית, ועם גיליון ה-OGL של 2014.',
      },
      quickStart: {
        heading: 'התחלה מהירה',
        steps: [
          'פתח את דף המידע Command Deck, או הקלד !inspiration לתפריט.',
          'בחר אסימון ולחץ תן. הדמות מקבלת השראה והאסימונים שלה מציגים את הסמן.',
          'לחץ פעם אחת על מאקרו לשחקנים, כדי שלשחקנים תהיה פעולת אסימון Inspiration לשימוש בה.',
          'לחץ חבורה כדי לראות למי יש השראה.',
        ],
      },
      sheets: {
        heading: 'גיליונות דמות',
        colSheet: 'גיליון',
        colWhere: 'היכן נשמרת ההשראה',
        colSheet2014: 'D&D 5E by Roll20 (2014 OGL)',
        where2014: 'תיבת השראה, התכונה "inspiration".',
        colSheet2024: 'D&D Fifth Edition (5E & 5.5E, 2024)',
        where2024: 'תיבת השראה הרואית, שנקראת ונכתבת עם getSheetItem ו-setSheetItem.',
        points: [
          'סימון או ניקוי התיבה בגיליון מזוהה מיד: הסמן מתעדכן בהתאם, וניקוי התיבה נחשב כשימוש.',
          'כשניסוח מוגדר ל"לפי הגיליון", כל דמות D&D 2024 משתמשת בכללים שנבחרו בהגדרות הגיליון שלה: כללי 2024 אומרים השראה הרואית, כללי 2014 אומרים השראה.',
          'דמויות שאין להן אף אחד מהגיליונות לא משתנות, כך שאסימוני דמויות שאינן שחקן לא מושפעים.',
        ],
      },
      players: {
        heading: 'שחקנים',
        points: [
          'שחקנים יכולים להשתמש בהשראה של דמויות שבשליטתם: לחיצה על השתמש בצ׳אט, או על פעולת האסימון Inspiration.',
          'ה-GM מקבל הודעה מי השתמש בה, עם כפתור בטל.',
          'הקלדת !inspiration מציגה לשחקן את הדמויות שלו והאם יש להן השראה.',
          'כבה את שחקנים יכולים להשתמש כדי להשאיר את השימוש בידי ה-GM.',
        ],
      },
      passOn: {
        heading: 'העברה הלאה (כללי 2024)',
        points: [
          'לדמות לא יכולה להיות השראה הרואית פעמיים. כשדמות שיש לה אמורה לקבל אותה שוב, השחקנים שלה מתבקשים לתת אותה לחבר אחר בחבורה שאין לו.',
          'הבחירה מציעה כל חבר בחבורה ללא השראה הרואית, וגם וותר. היא פגה לאחר שעה.',
          'לפי כללי 2014, ה-GM רק מקבל הודעה שלדמות כבר יש השראה.',
          'כבה את העברה כדי לקבל תמיד את ההודעה הזו במקום.',
        ],
      },
      party: {
        heading: 'החבורה',
        points: [
          'החבורה היא כל דמות ששחקן שולט בה. בחר אסימונים ולחץ הוסף לחבורה או הסר מהחבורה כדי לשנות אותה.',
          'בסקירה של ה-GM יש כפתורי תן, הסר והשתמש לכל חבר.',
          'הפעל את שחקנים רואים את החבורה כדי שגם השחקנים יראו את הסקירה. הם מקבלים כפתורי השתמש רק לדמויות שלהם.',
        ],
      },
      pools: {
        heading: 'מאגרי נקודות',
        points: [
          'מאגר נקודות הוא מספר שמצטבר ומנוצל כמה נקודות בכל פעם: מאגר של נקודות השראה, נקודות גיבור, מזל, bennies וכדומה. הוא עובד עם כל גיליון דמות.',
          'הגדר את מעקב למאגר נקודות, ותן, הסר והשתמש יפעלו על מאגר ברירת המחדל וישאלו כמה נקודות. הסמן מוצג כל עוד לדמות יש נקודות.',
          'חיזוק מנצל נקודות כדי להעלות הטלה: הקלד את הבונוס הרצוי, וההגדרה נקודות לכל +1 של המאגר קובעת את העלות. ב-2 נקודות לכל +1, בונוס של 4 עולה 8 נקודות. ה-Mod מכריז על השימוש; את הבונוס הוסף להטלה בעצמך.',
          'שימוש נדחה כשלדמות אין מספיק נקודות. ה-GM מקבל הודעה מי השתמש במה, עם כפתור בטל.',
          'מקום שמירה "תיבת משאב בגיליון" משתמש בתיבת המשאב בגיליון שנושאת את שם המאגר, למשל תיבת Other Resource בשם השראה בגיליון D&D של 2014. כשאין בגיליון תיבה בשם הזה, או עם "תכונה", הנקודות נשמרות בתכונה רגילה, למשל inspiration_pool. גיליון D&D 2024 משתמש תמיד בתכונה.',
          'כרטיס החבורה והכרטיס האישי של שחקן מציינים היכן נשמרות הנקודות של כל דמות: שם התיבה בגיליון, או התכונה. תכונה אינה מוצגת בגיליון הדמות.',
          'אפשר לשנות את המספר בגיליון ידנית: הסמן מתעדכן בהתאם.',
          'לחץ על מאגרים כדי לשנות את שם מאגר ברירת המחדל, לקבוע את העלות והמקסימום שלו, או להוסיף מאגרים. במאגרים אחרים משתמשים מכפתור החבורה שלהם, או על ידי הוספת --pool ושם המאגר לפקודה.',
          'Bardic Inspiration פועל כמאגר נפרד: לחץ על הוסף מאגר וקרא לו Bardic Inspiration, קבע את המקסימום שלו ל-1 ובחר את הסמן שלו. ה-GM נותן 1 מכרטיס החבורה של המאגר הזה כשהפייטן מחלק קובייה, ומי שמחזיק בה לוחץ על השתמש כשהוא משתמש בה. ה-Mod מסמן מי מחזיק קובייה; השחקן מטיל אותה בעצמו.',
        ],
      },
      markers: {
        heading: 'סמני אסימון',
        points: [
          'בחר את הסמן בהגדרה סמן. הנקודות הצבעוניות של Roll20, סמני ברירת המחדל וערכות הסמנים המותאמות שלך מופיעים ברשימה.',
          'הוספת הסמן לאסימון ידנית, או עם TokenMod, נותנת לדמות השראה. הסרתו משתמשת בה.',
          'שינוי הסמן מעביר אותו מיד בכל האסימונים.',
          'סמני המצב של גיליון D&D 2024 עצמו אינם מוצעים, כי הגיליון מגדיר אותם בעצמו.',
        ],
      },
      commands: {
        heading: 'פקודות',
        intro:
          'כל פקודה מתחילה ב-!inspiration. הפקודות פועלות על האסימונים שנבחרו, אלא אם ניתן --ids.',
        mods: 'גם Mods אחרים יכולים לשלוח את הפקודות האלה, למשל מ-ScriptCards. Mods אחרים יכולים גם לקרוא ל-InspirationTracker.give, spend, remove ו-isInspired.',
        colCommand: 'פקודה',
        colDesc: 'מה היא עושה',
      },
      settings: {
        heading: 'הגדרות',
        intro: 'שנה אותן עם כפתור הגדרות, או הקלד !inspiration set <setting> <value>.',
        colKey: 'הגדרה',
        colName: 'שם',
        colDesc: 'מה היא עושה',
      },
      upgrading: {
        heading: 'שדרוג מגרסה 0.1',
        points: [
          'הסמן, האפקט המיוחד וסוג האפקט מגרסה 0.1 נשמרים.',
          'אם בחרת פקודה משלך ב-0.1, היא עדיין עובדת לצד !inspiration.',
          '!inspiration עם אסימונים נבחרים עדיין נותן או לוקח השראה.',
        ],
      },
      troubleshooting: {
        heading: 'פתרון בעיות',
        points: [
          'הסמן לא מופיע על אסימון? לחץ סנכרן כדי לקרוא שוב כל גיליון.',
          'לאסימון שאינו מייצג דמות לא יכולה להיות השראה. קשר אותו קודם לדמות.',
          'לא קורה כלום כששחקן לוחץ השתמש? ודא שהדמות מוקצית לאותו שחקן.',
          'שגיאות נכתבות לקונסולת ה-API בדף Mod Scripts.',
        ],
      },
      languages: {
        heading: 'שפות',
        body: 'InspirationTracker מתורגם לשפות שלהלן. בחר אחת בהגדרה שפה.',
        colCode: 'קוד',
        colName: 'שפה',
        colNative: 'שם מקורי',
      },
      credits: {
        heading: 'קרדיטים',
        original: 'ה-Mod המקורי מאת',
        maintainer: 'גרסה 1 מתוחזקת על ידי',
        support: 'דווח על באגים ורעיונות בפורום ה-Mod של Roll20 או ב-GitHub.',
      },
      footer: 'כפתורים לכל פעולה נמצאים בדף המידע "{deck}".',
    },
    deck: {
      subtitle: 'Command Deck',
      selectedDesc: 'בחר אסימון אחד או יותר, ואז לחץ.',
      partyDesc: 'ראה למי יש השראה, ובחר מי בחבורה.',
      poolsTitle: 'מאגר נקודות',
      poolsDesc: 'כשמעקב מוגדר למאגר נקודות: בחר אסימונים, לחץ והקלד את המספר.',
      toolsDesc: 'תפריט, הגדרות, מאקרו לשחקנים ועזרה.',
      footer: 'ההוראות המלאות נמצאות בדף המידע "{help}".',
    },
  };

  const TRANSLATION$b = {
    terms: {
      heroic: 'Hősi ihlet',
      classic: 'Ihlet',
    },
    titles: {
      ready: 'Az InspirationTracker készen áll.',
      settings: 'InspirationTracker beállítások',
      help: 'InspirationTracker parancsok',
      party: 'A csapat ihlete',
      poolParty: 'Csapat: {term}',
      pools: 'Pontkészletek',
      yours: 'Karaktereid',
      status: 'InspirationTracker állapot',
    },
    messages: {
      gained: '{name} megkapta: {term}!',
      spent: '{name} felhasználja: {term}.',
      spentBy: '{player} felhasználta {name} ihletét ({term}).',
      spentSheet: '{name} már nem rendelkezik ezzel: {term} (a lapon vagy a tokenen módosult).',
      restored: '{name} visszakapta: {term}.',
      removed: '{name} elvesztette: {term}.',
      already: '{name} már rendelkezik ezzel: {term}.',
      none: '{name} nem rendelkezik ezzel: {term}.',
      busy: '{name} frissítése még folyamatban van. Próbáld újra egy pillanat múlva.',
      passOffer:
        '{name} már rendelkezik ezzel: {term}, és nem lehet kétszer. Add oda egy csapattagnak, akinek nincs, vagy mondj le róla.',
      passNobody: 'A csapat minden más tagjának már van.',
      passAsked: '{name} játékosait megkérdeztük, ki kapja ezt: {term}.',
      passed: '{from} átadja {to} részére: {term}!',
      passAlready: '{to} már rendelkezik vele. Válassz valaki mást.',
      declined: '{name} lemond a fölösleges ihletről ({term}).',
      undoAlready: '{name} már ismét rendelkezik vele.',
      synced: 'Beolvasott lapok: {checked}. Ihlettel: {inspired}.',
      migrated:
        'A 0.1-es verzió beállításai megmaradtak: jelölő, különleges effekt és annak típusa. Az új beállítások az alapértékekkel indulnak.',
      legacyCommand: 'A régi {command} parancsod továbbra is működik, ahogy a {main} is.',
      macroHint:
        'Ha Felhasználás gombot szeretnél adni a játékosoknak, futtasd ezt: {command}. Ez mindenkinek hozzáad egy tokenműveletet.',
      macro:
        'A(z) „{name}” makró elkészült: a játékosok tokenműveletként látják, amikor kijelölnek egy általuk irányított tokent.',
      journal: 'A Súgó és a Command Deck segédletek újra elkészültek.',
      readyHint: 'Írd be: {command} a menühöz, vagy nyisd meg a Command Deck segédletet.',
    },
    pool: {
      gained: '{name} kapott: {amount} {term} ({before} → {after}).',
      spent: '{name} felhasznált: {amount} {term} ({before} → {after}).',
      boosted: '{name} felhasznált: {amount} {term}, +{bonus} a dobásra ({before} → {after}).',
      spentBy: '{player} felhasználta {name} nevében: {amount} {term}.',
      restored: '{name} visszakapott: {amount} {term} ({before} → {after}).',
      removed: '{name} elvesztett: {amount} {term} ({before} → {after}).',
      none: '{name} egyetlen ponttal sem rendelkezik: {term}.',
      short: '{name} készlete {have}, de {need} kellene: {term}.',
      full: '{name} már elérte a megengedett legtöbbet ({max}): {term}.',
    },
    pools: {
      introFlag:
        'A nyilvántartás a lap ihletmezőjére van állítva. Állítsd Pontkészletre, hogy az Ad és a Felhasznál a(z) „{name}” készleten működjön. A többi készlet a --pool kapcsolóval használható.',
      introPool:
        'Az Ad, a Felhasznál és az Erősít a(z) „{name}” készleten működik. A többi készlet a saját Csapat gombjáról vagy a --pool kapcsolóval használható.',
      defaultLabel: '{name} (alapértelmezett)',
      name: 'Név',
      source: 'Tárolás helye',
      cost: 'Pont +1-enként',
      max: 'Maximum',
      marker: 'Jelölő',
      attribute: 'Attribútum, ha a lapon nincs ilyen nevű mező: {attribute}',
      partyTotal: 'A csapat összesen: {total} {term}.',
      keptBox: 'Mező a lapon: {name}',
      keptAttribute: 'Attribútum: {attribute}',
      keptNote: 'Az attribútum nem látszik a karakterlapon.',
    },
    prompts: {
      points: 'Pontok',
      bonus: 'Bónusz a dobásra',
      max: 'Legtöbb megengedett pont (0 = nincs korlát)',
    },
    errors: {
      unknownPool: 'Nincs „{value}” nevű készlet.',
      unknownPoolHint: 'Készletek: {pools}.',
      badAmount: 'A(z) „{value}” nem pontszám.',
      badAmountHint: 'Egész számot adj meg 1 és 9999 között.',
      boostNoPool: 'Az Erősít egy készlet pontjait használja fel.',
      poolInvalid: 'Készlet neve nem lehet „{value}”.',
      poolExists: 'Már van „{value}” nevű készlet.',
      poolFull: 'Nincs hely újabb készletnek.',
      poolNameHint:
        'Legfeljebb 40 betűből, számjegyből és szóközből álló nevet adj meg, amelyet más készlet nem visel.',
      poolDefault: 'Az alapértelmezett készlet („{name}”) nem törölhető. Átnevezni lehet.',
      poolMarkerHint:
        'Válassz a jelölőkészleteidből olyan jelölőt, amely nem azonos a Jelölő beállításban megadottal.',
      poolSetHint: 'Írd be: !inspiration pools, hogy lásd az összes készletet és beállításaikat.',
      denied: 'Ezt nem teheted meg {name} esetében.',
      gmOnly: 'Ezt a parancsot csak a KM használhatja.',
      gmOnlyHint: 'A játékosok a spend, party és help parancsokat használhatják.',
      spendOff: 'A KM kikapcsolta, hogy a játékosok ihletet használjanak fel.',
      noCharacter: 'Ezek a tokenek nem képviselnek karaktert: {names}.',
      nothingSelected: 'Előbb jelölj ki egy tokent.',
      nothingSelectedHint:
        'Jelölj ki karaktereket képviselő tokeneket, vagy add meg a --ids kapcsolót token- vagy karakterazonosítókkal.',
      writeFailed: '{name} lapját nem sikerült módosítani.',
      offerGone: 'Ez a választás már megtörtént, vagy lejárt.',
      passInvalid: 'Válassz egy másik csapattagot, ne azt, akinél már megvan.',
      undoGone: 'Ezt a felhasználást már visszavonták, vagy túl régi.',
      unknownMarker: 'Nincs „{value}” nevű tokenjelölő.',
      unknownMarkerHint: 'A beállítások Jelölő gombjával válassz egyet a jelölőkészleteidből.',
      badSetting: 'A(z) {key} nem állítható erre: „{value}”.',
      badSettingHint: 'Írd be: !inspiration set, hogy lásd az összes beállítást és lehetőségeit.',
      unknownCommand: 'Ismeretlen parancs: {command}.',
      unknownCommandHint: 'Írd be: !inspiration help a parancsok listájához.',
    },
    menu: {
      selected: 'Kijelölt tokenek',
      party: 'Csapat',
      tools: 'Eszközök',
      hint: 'A teljes útmutató a(z) „{help}” segédletben található.',
      noSheet: 'nincs lap',
      noneYours: 'Nem irányítasz lappal rendelkező karaktert.',
      partyEmpty: 'Nem irányítasz egyetlen csapattagot sem.',
      partyEmptyGm:
        'Még senki sincs a csapatban. Rendelj karaktereket a játékosokhoz, vagy jelölj ki tokeneket, és kattints a Csapathoz ad gombra.',
      partyCount: '{total} főből {count} rendelkezik ezzel: {term}.',
    },
    buttons: {
      menu: 'Menü',
      give: 'Ad',
      remove: 'Elvesz',
      toggle: 'Átvált',
      spend: 'Felhasznál',
      party: 'Csapat',
      partyAdd: 'Csapathoz ad',
      partyRemove: 'Csapatból kivesz',
      settings: 'Beállítások',
      macro: 'Játékosmakró',
      sync: 'Szinkronizálás',
      status: 'Állapot',
      help: 'Súgó',
      reset: 'Beállítások visszaállítása',
      refresh: 'Frissítés',
      undo: 'Visszavonás',
      decline: 'Lemondok róla',
      boost: 'Erősít',
      pools: 'Készletek',
      addPool: 'Készlet hozzáadása',
      deletePool: 'Készlet törlése',
    },
    values: {
      on: 'Be',
      off: 'Ki',
      none: 'Nincs',
      noLimit: 'Nincs korlát',
      tracking: {
        flag: 'A lap ihletmezője',
        pool: 'Pontkészlet',
      },
      source: {
        resource: 'A lap erőforrásmezője',
        attribute: 'Attribútum',
      },
      wording: {
        2014: 'Ihlet (2014)',
        2024: 'Hősi ihlet (2024)',
        auto: 'A lap szerint',
      },
      announce: {
        public: 'Mindenki',
        gm: 'KM és tulajdonosok',
        off: 'Senki',
      },
    },
    settings: {
      language: {
        label: 'Nyelv',
        desc: 'A menük, üzenetek és segédletek nyelve.',
      },
      tracking: {
        label: 'Nyilvántartás',
        desc: 'Min működik az Ad és a Felhasznál: a D&D lapok ihletmezőjén, amely egy karakternek vagy van, vagy nincs, illetve egy pontkészleten, amely gyűlik, és egyszerre néhány pontonként fogy.',
      },
      marker: {
        label: 'Jelölő',
        desc: 'Tokenjelölő, amely addig látszik, amíg a karakternek ihlete van. Az egyéni jelölőkészletek is szerepelnek a listában.',
      },
      wording: {
        label: 'Megnevezés',
        desc: 'Ihlet vagy Hősi ihlet legyen a neve. „A lap szerint” minden D&D 2024 lapon az ott választott szabályokat használja, a 2014-es lapon pedig az Ihletet.',
      },
      announce: {
        label: 'Bejelentés',
        desc: 'Ki látja a csevegőüzenetet, amikor ihletet szereznek vagy felhasználnak.',
      },
      fx: {
        label: 'Különleges effekt',
        desc: 'Különleges effektet játszik le a tokenen, amikor ihletet kap.',
      },
      fxType: {
        label: 'Effekt típusa',
        desc: 'Melyik effekt fusson le, például nova-holy, vagy egy egyéni effekt azonosítója.',
      },
      playerSpend: {
        label: 'Játékosok felhasználhatják',
        desc: 'A játékosok felhasználhatják az általuk irányított karakterek ihletét. A KM értesítést kap, Visszavonás gombbal.',
      },
      playerOverview: {
        label: 'Játékosok látják a csapatot',
        desc: 'A játékosok láthatják, kinek van ihlete a csapatban.',
      },
      passOn: {
        label: 'Továbbadás (2024)',
        desc: 'A 2024-es szabályok szerint az a karakter, aki Hősi ihletet kapna, miközben már van neki, odaadhatja egy másik csapattagnak.',
      },
    },
    status: {
      version: 'Verzió',
      beacon: 'D&D 2024 lapok',
      legacy: '2014-es lapok',
      none: 'Ihletmező nélküli karakterek',
      rules2024: '2024-es szabályokat használ',
      party: 'Csapattagok',
      tracking: 'Nyilvántartás',
      pools: 'Készletek',
      marker: 'Jelölő',
      fx: 'Különleges effekt',
      legacyCommand: 'Régi parancs',
    },
    help: {
      menu: 'Megjeleníti a menüt. Kijelölt tokenekkel ihletet ad vagy vesz el, ahogy a 0.1-es verzió.',
      give: 'Ihletet ad a kijelölt karaktereknek.',
      remove:
        'Elveszi az ihletet a kijelölt karakterektől, anélkül hogy felhasználásnak számítana.',
      toggle:
        'Ihletet ad azoknak a kijelölt karaktereknek, akiknek nincs, és elveszi azoktól, akiknek van.',
      spend: 'Felhasználja a kijelölt karakterek ihletét, és értesíti a KM-et.',
      party:
        'Megmutatja, kinek van ihlete a csapatban, gombokkal az adáshoz, elvételhez vagy felhasználáshoz.',
      partyEdit: 'Hozzáadja a kijelölt karaktereket a csapathoz, vagy kiveszi őket.',
      ids: 'A megadott token- vagy karakterazonosítókon működik a kijelölt tokenek helyett.',
      points:
        'Pontkészlettel: ennyi pontot ad, vesz el vagy használ fel. Szám nélkül 1. A remove all minden pontot elvesz.',
      boost:
        'Pontkészlettel: pontokat használ fel, hogy ekkora bónuszt adjon egy dobáshoz, a készletben megadott áron minden +1 után.',
      poolFlag: 'A megnevezett készleten működik az alapértelmezett helyett.',
      pools: 'Megjeleníti a pontkészleteket és beállításaikat.',
      poolEdit:
        'Hozzáad egy készletet, vagy töröl egyet. A lapokon lévő pontok érintetlenek maradnak.',
      poolSet:
        'Módosít egy készletet: a nevét, a tárolás helyét (resource vagy attribute), azt, hogy hány pontba kerül minden +1, a legtöbb megengedett pontot (0 = nincs korlát) vagy a tokenjelölőjét.',
      undo: 'Visszaadja a felhasznált ihletet. Az azonosító a KM-nek küldött, felhasználásról szóló üzenetben található.',
      macro:
        'Hozzáadja az „Inspiration” tokenműveletet, amelyre kattintva a játékosok felhasználhatják az ihletet.',
      sync: 'Újra beolvas minden lapot, és helyreigazítja a jelölőket.',
      set: 'Megjeleníti a beállításokat, vagy módosít egyet.',
      reset: 'Minden beállítást visszaállít az alapértékre, a nyelv kivételével.',
      status: 'Megjeleníti a verziót, a talált lapokat és a fő beállításokat.',
      journal: 'Újra elkészíti a Súgó és a Command Deck segédleteket.',
      help: 'Megjeleníti ezt a listát.',
    },
    helpPlayer: {
      menu: 'Megjeleníti a karaktereidet, és hogy van-e ihletük.',
      spend: 'Felhasználja a kijelölt karakter ihletét.',
      boost: 'Egy készlet pontjait használja fel, hogy ekkora bónuszt adjon egy dobáshoz.',
      party: 'Megjeleníti a csapatot, ha a KM engedi.',
      help: 'Megjeleníti ezt a listát.',
    },
    handout: {
      versionLabel: 'Verzió',
      subtitle: 'Ihlet, Hősi ihlet és pontkészletek bármilyen játékhoz',
      overview: {
        heading: 'Áttekintés',
        body: 'Az InspirationTracker összhangban tartja a D&D ihletet a karakterlapon, a tokenen és a csevegőben. Add meg a menüből, a lapról vagy a tokenjelölővel, és a karakter minden tokenje mutatja a jelölőt. A játékosok egy kattintással felhasználhatják, a KM pedig értesítést kap, Visszavonás gombbal. Működik a D&D 2024 lappal, ahol Hősi ihletnek hívják, és a 2014-es OGL lappal.',
      },
      quickStart: {
        heading: 'Gyors kezdés',
        steps: [
          'Nyisd meg a Command Deck segédletet, vagy írd be: !inspiration a menühöz.',
          'Jelölj ki egy tokent, és kattints az Ad gombra. A karakter ihletet kap, és a tokenjein megjelenik a jelölő.',
          'Kattints egyszer a Játékosmakró gombra, hogy a játékosok Inspiration tokenműveletet kapjanak a felhasználáshoz.',
          'Kattints a Csapat gombra, hogy lásd, kinek van ihlete.',
        ],
      },
      sheets: {
        heading: 'Karakterlapok',
        colSheet: 'Lap',
        colWhere: 'Hol tárolódik az ihlet',
        colSheet2014: 'D&D 5E by Roll20 (2014 OGL)',
        where2014: 'Az Ihlet mező, "inspiration" attribútum.',
        colSheet2024: 'D&D Fifth Edition (5E & 5.5E, 2024)',
        where2024: 'A Hősi ihlet mező, amelyet a getSheetItem és a setSheetItem olvas és ír.',
        points: [
          'A mező bejelölése vagy törlése a lapon azonnal észlelhető: a jelölő követi, és a törlés felhasználásnak számít.',
          'Ha a Megnevezés értéke „A lap szerint”, minden D&D 2024 karakter a lapbeállításaiban választott szabályokat használja: a 2024-es szabályok Hősi ihletet, a 2014-esek Ihletet mondanak.',
          'Az egyik lappal sem rendelkező karakterek érintetlenek maradnak, így az NJK-tokenek nem változnak.',
        ],
      },
      players: {
        heading: 'Játékosok',
        points: [
          'A játékosok felhasználhatják az általuk irányított karakterek ihletét: a csevegőben a Felhasznál gombbal, vagy az Inspiration tokenművelettel.',
          'A KM üzenetet kap arról, ki használta fel, Visszavonás gombbal.',
          'A !inspiration beírásával a játékos látja a karaktereit, és hogy van-e ihletük.',
          'Kapcsold ki a Játékosok felhasználhatják beállítást, ha a felhasználást a KM kezében szeretnéd tartani.',
        ],
      },
      passOn: {
        heading: 'Továbbadás (2024-es szabályok)',
        points: [
          'Egy karakternek nem lehet kétszer Hősi ihlete. Ha egy karakter, akinek már van, újra megkapná, a játékosait megkérdezzük, hogy odaadják-e egy másik csapattagnak, akinek nincs.',
          'A választás minden Hősi ihlet nélküli csapattagot felkínál, valamint a Lemondok róla lehetőséget. Egy óra múlva lejár.',
          'A 2014-es szabályok szerint a KM csak értesítést kap, hogy a karakternek már van Ihlete.',
          'Kapcsold ki a Továbbadást, ha mindig inkább ezt az üzenetet szeretnéd kapni.',
        ],
      },
      party: {
        heading: 'A csapat',
        points: [
          'A csapat minden olyan karakter, amelyet egy játékos irányít. Jelölj ki tokeneket, és kattints a Csapathoz ad vagy a Csapatból kivesz gombra a módosításhoz.',
          'A KM áttekintőjében minden tagnál van Ad, Elvesz és Felhasznál gomb.',
          'Kapcsold be a Játékosok látják a csapatot beállítást, hogy a játékosok is lássák az áttekintőt. Felhasznál gombot csak a saját karaktereikhez kapnak.',
        ],
      },
      pools: {
        heading: 'Pontkészletek',
        points: [
          'A pontkészlet egy szám, amely gyűlik, és egyszerre néhány pontonként fogy: ihletpontok, hőspontok, szerencse, bennies és hasonlók készlete. Bármilyen karakterlappal működik.',
          'Állítsd a Nyilvántartást Pontkészletre, és az Ad, az Elvesz és a Felhasznál az alapértelmezett készleten működik, és megkérdezi, hány pontról van szó. A jelölő addig látszik, amíg a karakternek van pontja.',
          'Az Erősít pontokat használ fel egy dobás növelésére: írd be a kívánt bónuszt, és a készlet Pont +1-enként beállítása határozza meg az árát. Ha minden +1 2 pontba kerül, a 4-es bónusz 8 pont. A Mod bejelenti a felhasználást; a bónuszt te add hozzá a dobáshoz.',
          'A rendszer elutasítja a felhasználást, ha a karakternek nincs elég pontja. A KM értesítést kap arról, ki mit használt fel, Visszavonás gombbal.',
          'Ha a Tárolás helye „A lap erőforrásmezője”, a lapnak azt az erőforrásmezőjét használja, amely a készlet nevét viseli, például egy Ihlet nevű Other Resource mezőt a 2014-es D&D lapon. Ha a lapon nincs ilyen nevű mező, vagy a beállítás „Attribútum”, a pontok egy egyszerű attribútumban tárolódnak, például: inspiration_pool. A D&D 2024 lap mindig az attribútumot használja.',
          'A csapat kártyája és a játékos saját kártyája megmutatja, hol tárolódnak az egyes karakterek pontjai: a lapon lévő mező neve vagy az attribútum. Az attribútum nem látszik a karakterlapon.',
          'A számot nyugodtan átírhatod kézzel a lapon: a jelölő követi.',
          'Kattints a Készletek gombra az alapértelmezett készlet átnevezéséhez, árának és maximumának beállításához vagy további készletek hozzáadásához. A többi készlet a saját Csapat gombjáról használható, vagy úgy, hogy a parancshoz hozzáadod a --pool kapcsolót és a készlet nevét.',
          'A Bardic Inspiration saját készletként működik: kattints a Készlet hozzáadása gombra, és nevezd el Bardic Inspiration néven, állítsd a Maximum értékét 1-re, és válaszd ki a Jelölőt. A GM 1 pontot ad a készlet Csapat kártyájáról, amikor a bárd kockát oszt, a birtokosa pedig a Felhasznál gombra kattint, amikor él vele. A Mod jelöli, kinél van kocka; a játékos maga dobja el.',
        ],
      },
      markers: {
        heading: 'Tokenjelölők',
        points: [
          'A jelölőt a Jelölő beállítással választhatod ki. A Roll20 színes pöttyei, az alapértelmezett jelölők és az egyéni jelölőkészleteid szerepelnek a listában.',
          'Ha kézzel vagy TokenModdal teszed fel a jelölőt egy tokenre, a karakter ihletet kap. Ha leveszed, felhasználja.',
          'A jelölő módosítása azonnal áthelyezi minden tokenen.',
          'A D&D 2024 lap saját állapotjelölői nem szerepelnek, mert azokat a lap maga állítja be.',
        ],
      },
      commands: {
        heading: 'Parancsok',
        intro:
          'Minden parancs a !inspiration szóval kezdődik. A parancsok a kijelölt tokenekre hatnak, kivéve, ha meg van adva a --ids.',
        mods: 'Más Modok is küldhetik ezeket a parancsokat, például a ScriptCardsból. Más Modok meghívhatják az InspirationTracker.give, spend, remove és isInspired függvényeket is.',
        colCommand: 'Parancs',
        colDesc: 'Mit csinál',
      },
      settings: {
        heading: 'Beállítások',
        intro:
          'Módosítsd őket a Beállítások gombbal, vagy írd be: !inspiration set <setting> <value>.',
        colKey: 'Beállítás',
        colName: 'Név',
        colDesc: 'Mit csinál',
      },
      upgrading: {
        heading: 'Frissítés a 0.1-es verzióról',
        points: [
          'A 0.1-es verzió jelölője, különleges effektje és effekttípusa megmarad.',
          'Ha a 0.1-ben saját parancsot választottál, az továbbra is működik a !inspiration mellett.',
          'A !inspiration kijelölt tokenekkel továbbra is ihletet ad vagy vesz el.',
        ],
      },
      troubleshooting: {
        heading: 'Hibaelhárítás',
        points: [
          'Nem látszik a jelölő egy tokenen? Kattints a Szinkronizálás gombra, hogy minden lap újra beolvasásra kerüljön.',
          'Egy token, amely nem képvisel karaktert, nem kaphat ihletet. Előbb kapcsold össze egy karakterrel.',
          'Nem történik semmi, amikor egy játékos a Felhasznál gombra kattint? Ellenőrizd, hogy a karakter az adott játékoshoz van-e rendelve.',
          'A hibák a Mod Scripts oldal API-konzoljába kerülnek.',
        ],
      },
      languages: {
        heading: 'Nyelvek',
        body: 'Az InspirationTracker az alábbi nyelvekre van lefordítva. A Nyelv beállítással választhatsz közülük.',
        colCode: 'Kód',
        colName: 'Nyelv',
        colNative: 'Eredeti név',
      },
      credits: {
        heading: 'Készítők',
        original: 'Az eredeti Mod szerzője:',
        maintainer: 'Az 1-es verzió karbantartója:',
        support: 'Hibákat és ötleteket a Roll20 Mod fórumán vagy a GitHubon jelezhetsz.',
      },
      footer: 'Minden művelet gombja a(z) „{deck}” segédletben található.',
    },
    deck: {
      subtitle: 'Command Deck',
      selectedDesc: 'Jelölj ki egy vagy több tokent, majd kattints.',
      partyDesc: 'Nézd meg, kinek van ihlete, és válaszd ki, ki tartozik a csapathoz.',
      poolsTitle: 'Pontkészlet',
      poolsDesc:
        'Ha a Nyilvántartás Pontkészletre van állítva: jelöld ki a tokeneket, kattints, és írd be a számot.',
      toolsDesc: 'Menü, beállítások, a játékosmakró és a súgó.',
      footer: 'A teljes útmutató a(z) „{help}” segédletben található.',
    },
  };

  const TRANSLATION$a = {
    terms: {
      heroic: 'Ispirazione eroica',
      classic: 'Ispirazione',
    },
    titles: {
      ready: 'InspirationTracker è pronto.',
      settings: 'Impostazioni di InspirationTracker',
      help: 'Comandi di InspirationTracker',
      party: 'Ispirazione del gruppo',
      poolParty: '{term} del gruppo',
      pools: 'Riserve di punti',
      yours: 'I tuoi personaggi',
      status: 'Stato di InspirationTracker',
    },
    messages: {
      gained: "{name} ha l'{term}!",
      spent: "{name} usa l'{term}.",
      spentBy: "{player} ha speso l'{term} per {name}.",
      spentSheet: "{name} non ha più l'{term} (modificata sulla scheda o sul token).",
      restored: "{name} ha di nuovo l'{term}.",
      removed: '{term} tolta a {name}.',
      already: "{name} ha già l'{term}.",
      none: "{name} non ha l'{term}.",
      busy: '{name} è ancora in aggiornamento. Riprova tra un momento.',
      passOffer:
        "{name} ha già l'{term} e non può averla due volte. Dalla a un membro del gruppo che non ce l'ha, oppure lasciala perdere.",
      passNobody: "Tutti gli altri membri del gruppo ce l'hanno già.",
      passAsked: "È stato chiesto ai giocatori di {name} chi deve ricevere l'{term}.",
      passed: "{from} dà l'{term} a {to}!",
      passAlready: "{to} ce l'ha già. Scegli qualcun altro.",
      declined: "{name} lascia perdere l'{term} in più.",
      undoAlready: "{name} ce l'ha già di nuovo.",
      synced: 'Schede lette: {checked}. Con ispirazione: {inspired}.',
      migrated:
        'Le impostazioni della versione 0.1 sono state mantenute: segnalino, effetto speciale e il suo tipo. Le nuove impostazioni partono dai valori predefiniti.',
      legacyCommand: 'Il tuo vecchio comando {command} funziona ancora, così come {main}.',
      macroHint:
        "Per dare ai giocatori un pulsante Spendi, esegui {command}. Aggiunge un'azione del token per tutti.",
      macro:
        'La macro «{name}» è pronta: i giocatori la vedono come azione del token quando selezionano un token che controllano.',
      journal: 'Dispense di aiuto e Command Deck ricreate.',
      readyHint: 'Scrivi {command} per il menu, oppure apri la dispensa Command Deck.',
    },
    pool: {
      gained: '{name} ottiene {amount} {term} ({before} → {after}).',
      spent: '{name} spende {amount} {term} ({before} → {after}).',
      boosted: '{name} spende {amount} {term} per +{bonus} al tiro ({before} → {after}).',
      spentBy: '{player} ha speso {amount} {term} per {name}.',
      restored: '{name} riottiene {amount} {term} ({before} → {after}).',
      removed: '{amount} {term} in meno per {name} ({before} → {after}).',
      none: '{name} non ha punti ({term}).',
      short: '{name} ha {have} {term}, e ne servono {need}.',
      full: '{name} ha già il massimo consentito ({term}: {max}).',
    },
    pools: {
      introFlag:
        "Il tracciamento è impostato sulla casella dell'ispirazione della scheda. Impostalo su Riserva di punti per fare di «{name}» la riserva su cui agiscono Dai e Spendi. Le altre riserve si usano con --pool.",
      introPool:
        'Dai, Spendi e Potenzia agiscono su «{name}». Le altre riserve si usano dal loro pulsante Gruppo, oppure con --pool.',
      defaultLabel: '{name} (predefinita)',
      name: 'Nome',
      source: 'Conservata in',
      cost: 'Punti per +1',
      max: 'Massimo',
      marker: 'Segnalino',
      attribute: 'Attributo quando la scheda non ha una casella con questo nome: {attribute}',
      partyTotal: 'Totale del gruppo: {total} {term}.',
      keptBox: 'Casella della scheda: {name}',
      keptAttribute: 'Attributo: {attribute}',
      keptNote: 'Un attributo non è mostrato sulla scheda del personaggio.',
    },
    prompts: {
      points: 'Punti',
      bonus: 'Bonus al tiro',
      max: 'Massimo di punti consentito (0 per nessun limite)',
    },
    errors: {
      unknownPool: 'Non esiste una riserva chiamata «{value}».',
      unknownPoolHint: 'Riserve: {pools}.',
      badAmount: '«{value}» non è un numero di punti.',
      badAmountHint: 'Usa un numero intero da 1 a 9999.',
      boostNoPool: 'Potenzia spende punti da una riserva.',
      poolInvalid: 'Una riserva non può chiamarsi «{value}».',
      poolExists: 'Esiste già una riserva chiamata «{value}».',
      poolFull: "Non c'è spazio per un'altra riserva.",
      poolNameHint:
        "Usa un nome di al massimo 40 lettere, cifre e spazi che nessun'altra riserva abbia.",
      poolDefault:
        'La riserva predefinita, «{name}», non può essere eliminata. Può essere rinominata.',
      poolMarkerHint:
        "Scegli dai tuoi set di segnalini un segnalino diverso da quello dell'impostazione Segnalino.",
      poolSetHint: 'Scrivi !inspiration pools per vedere ogni riserva e le sue impostazioni.',
      denied: 'Non puoi farlo per {name}.',
      gmOnly: 'Solo il GM può usare quel comando.',
      gmOnlyHint: 'I giocatori possono usare spend, party e help.',
      spendOff: 'Il GM ha disattivato la spesa da parte dei giocatori.',
      noCharacter: 'Questi token non rappresentano un personaggio: {names}.',
      nothingSelected: 'Seleziona prima un token.',
      nothingSelectedHint:
        'Seleziona token che rappresentano personaggi, oppure aggiungi --ids con gli ID dei token o dei personaggi.',
      writeFailed: 'Impossibile modificare la scheda di {name}.',
      offerGone: 'Quella scelta è già stata fatta, oppure è scaduta.',
      passInvalid: "Scegli un membro del gruppo diverso da quello che ce l'ha.",
      undoGone: 'Quella spesa è già stata annullata, oppure è troppo vecchia.',
      unknownMarker: 'Non esiste un segnalino chiamato «{value}».',
      unknownMarkerHint:
        'Usa il pulsante Segnalino nelle impostazioni per sceglierne uno dai tuoi set di segnalini.',
      badSetting: 'Impossibile impostare {key} su «{value}».',
      badSettingHint: 'Scrivi !inspiration set per vedere ogni impostazione e le sue opzioni.',
      unknownCommand: 'Comando sconosciuto: {command}.',
      unknownCommandHint: "Scrivi !inspiration help per l'elenco dei comandi.",
    },
    menu: {
      selected: 'Token selezionati',
      party: 'Gruppo',
      tools: 'Strumenti',
      hint: 'Le istruzioni complete sono nella dispensa «{help}».',
      noSheet: 'nessuna scheda',
      noneYours: 'Non controlli nessun personaggio con una scheda.',
      partyEmpty: 'Non controlli nessun membro del gruppo.',
      partyEmptyGm:
        'Il gruppo è ancora vuoto. Assegna i personaggi ai giocatori, oppure seleziona dei token e fai clic su Aggiungi al gruppo.',
      partyCount: "{count} su {total} hanno l'{term}.",
    },
    buttons: {
      menu: 'Menu',
      give: 'Dai',
      remove: 'Togli',
      toggle: 'Alterna',
      spend: 'Spendi',
      party: 'Gruppo',
      partyAdd: 'Aggiungi al gruppo',
      partyRemove: 'Togli dal gruppo',
      settings: 'Impostazioni',
      macro: 'Macro giocatori',
      sync: 'Sincronizza',
      status: 'Stato',
      help: 'Aiuto',
      reset: 'Ripristina impostazioni',
      refresh: 'Aggiorna',
      undo: 'Annulla',
      decline: 'Lascia perdere',
      boost: 'Potenzia',
      pools: 'Riserve',
      addPool: 'Aggiungi riserva',
      deletePool: 'Elimina riserva',
    },
    values: {
      on: 'Attivo',
      off: 'Disattivo',
      none: 'Nessuno',
      noLimit: 'Nessun limite',
      tracking: {
        flag: "Casella dell'ispirazione della scheda",
        pool: 'Riserva di punti',
      },
      source: {
        resource: 'Casella risorsa della scheda',
        attribute: 'Attributo',
      },
      wording: {
        2014: 'Ispirazione (2014)',
        2024: 'Ispirazione eroica (2024)',
        auto: 'Dalla scheda',
      },
      announce: {
        public: 'Tutti',
        gm: 'GM e proprietari',
        off: 'Nessuno',
      },
    },
    settings: {
      language: {
        label: 'Lingua',
        desc: 'Lingua di menu, messaggi e dispense.',
      },
      tracking: {
        label: 'Tracciamento',
        desc: "Su cosa agiscono Dai e Spendi: la casella dell'ispirazione delle schede D&D, che un personaggio ha o non ha, oppure una riserva di punti che si accumula e si spende un po' alla volta.",
      },
      marker: {
        label: 'Segnalino',
        desc: "Segnalino mostrato sul token mentre un personaggio ha l'ispirazione. Sono elencati anche i set di segnalini personalizzati.",
      },
      wording: {
        label: 'Terminologia',
        desc: 'Chiamala Ispirazione o Ispirazione eroica. «Dalla scheda» usa le regole scelte su ogni scheda D&D 2024, e Ispirazione sulla scheda 2014.',
      },
      announce: {
        label: 'Annuncio',
        desc: "Chi vede il messaggio in chat quando l'ispirazione viene ottenuta o spesa.",
      },
      fx: {
        label: 'Effetto speciale',
        desc: "Riproduce un effetto speciale sul token quando ottiene l'ispirazione.",
      },
      fxType: {
        label: 'Tipo di effetto',
        desc: "Quale effetto riprodurre, come nova-holy, oppure l'ID di un effetto personalizzato.",
      },
      playerSpend: {
        label: 'I giocatori possono spendere',
        desc: "Permette ai giocatori di spendere l'ispirazione per i personaggi che controllano. Il GM viene avvisato, con un pulsante Annulla.",
      },
      playerOverview: {
        label: 'I giocatori vedono il gruppo',
        desc: "Permette ai giocatori di vedere chi nel gruppo ha l'ispirazione.",
      },
      passOn: {
        label: 'Passa ad altri (2024)',
        desc: "Con le regole 2024, un personaggio che otterrebbe l'Ispirazione eroica mentre ce l'ha già può darla a un altro membro del gruppo.",
      },
    },
    status: {
      version: 'Versione',
      beacon: 'Schede D&D 2024',
      legacy: 'Schede 2014',
      none: "Personaggi senza casella dell'ispirazione",
      rules2024: 'Regole 2024 in uso',
      party: 'Membri del gruppo',
      tracking: 'Tracciamento',
      pools: 'Riserve',
      marker: 'Segnalino',
      fx: 'Effetto speciale',
      legacyCommand: 'Vecchio comando',
    },
    help: {
      menu: "Mostra il menu. Con dei token selezionati, dà o toglie l'ispirazione, come faceva la versione 0.1.",
      give: "Dà l'ispirazione ai personaggi selezionati.",
      remove: "Toglie l'ispirazione ai personaggi selezionati, senza contarla come spesa.",
      toggle:
        "Dà l'ispirazione ai personaggi selezionati che non ce l'hanno, e la toglie a quelli che ce l'hanno.",
      spend: "Spende l'ispirazione per i personaggi selezionati e avvisa il GM.",
      party:
        "Mostra chi nel gruppo ha l'ispirazione, con pulsanti per darla, toglierla o spenderla.",
      partyEdit: 'Aggiunge i personaggi selezionati al gruppo, oppure li toglie.',
      ids: 'Agisce sugli ID di token o personaggi indicati invece che sui token selezionati.',
      points:
        'Con una riserva di punti: dà, toglie o spende quel numero di punti. Senza numero, 1. remove all toglie tutti i punti.',
      boost:
        'Con una riserva di punti: spende punti per aggiungere quel bonus a un tiro, al costo della riserva per ogni +1.',
      poolFlag: 'Agisce sulla riserva indicata invece che su quella predefinita.',
      pools: 'Mostra le riserve di punti e le loro impostazioni.',
      poolEdit:
        'Aggiunge una riserva, oppure ne elimina una. I punti sulle schede restano come sono.',
      poolSet:
        'Modifica una riserva: il nome, dove è conservata (resource o attribute), i punti che costa ogni +1, il massimo di punti consentito (0 per nessun limite) o il suo segnalino.',
      undo: "Restituisce l'ispirazione spesa. L'ID si trova nel messaggio al GM sulla spesa.",
      macro:
        "Aggiunge l'azione del token «Inspiration», che i giocatori cliccano per spendere l'ispirazione.",
      sync: 'Rilegge ogni scheda e sistema i segnalini.',
      set: 'Mostra le impostazioni, oppure ne cambia una.',
      reset: 'Riporta ogni impostazione al valore predefinito, tranne la lingua.',
      status: 'Mostra la versione, le schede trovate e le impostazioni principali.',
      journal: 'Ricrea le dispense di aiuto e Command Deck.',
      help: 'Mostra questo elenco.',
    },
    helpPlayer: {
      menu: "Mostra i tuoi personaggi e se hanno l'ispirazione.",
      spend: "Spende l'ispirazione per il personaggio selezionato.",
      boost: 'Spende punti da una riserva per aggiungere quel bonus a un tiro.',
      party: 'Mostra il gruppo, se il GM lo consente.',
      help: 'Mostra questo elenco.',
    },
    handout: {
      versionLabel: 'Versione',
      subtitle: 'Ispirazione, Ispirazione eroica e riserve di punti per qualsiasi gioco',
      overview: {
        heading: 'Panoramica',
        body: "InspirationTracker mantiene allineata l'ispirazione di D&D tra scheda del personaggio, token e chat. Dalla dal menu, dalla scheda o dal segnalino del token, e ogni token di quel personaggio mostra il segnalino. I giocatori possono spenderla con un clic, e il GM viene avvisato, con un pulsante Annulla. Funziona con la scheda D&D 2024, dove si chiama Ispirazione eroica, e con la scheda OGL 2014.",
      },
      quickStart: {
        heading: 'Avvio rapido',
        steps: [
          'Apri la dispensa Command Deck, oppure scrivi !inspiration per il menu.',
          "Seleziona un token e fai clic su Dai. Il personaggio ottiene l'ispirazione e i suoi token mostrano il segnalino.",
          "Fai clic una volta su Macro giocatori, così i giocatori hanno un'azione del token Inspiration per spenderla.",
          "Fai clic su Gruppo per vedere chi ha l'ispirazione.",
        ],
      },
      sheets: {
        heading: 'Schede del personaggio',
        colSheet: 'Scheda',
        colWhere: "Dove viene salvata l'ispirazione",
        colSheet2014: 'D&D 5E by Roll20 (2014 OGL)',
        where2014: 'La casella Ispirazione, attributo "inspiration".',
        colSheet2024: 'D&D Fifth Edition (5E & 5.5E, 2024)',
        where2024:
          'La casella Ispirazione eroica, letta e scritta con getSheetItem e setSheetItem.',
        points: [
          'Spuntare o togliere la spunta dalla casella su una scheda viene notato subito: il segnalino segue, e togliere la spunta conta come spenderla.',
          'Con Terminologia impostata su «Dalla scheda», ogni personaggio D&D 2024 usa le regole scelte nelle impostazioni della sua scheda: le regole 2024 dicono Ispirazione eroica, le regole 2014 dicono Ispirazione.',
          'I personaggi senza nessuna delle due schede non vengono toccati, quindi i token dei PNG non cambiano.',
        ],
      },
      players: {
        heading: 'Giocatori',
        points: [
          "I giocatori possono spendere l'ispirazione per i personaggi che controllano: fai clic su Spendi in chat, oppure sull'azione del token Inspiration.",
          "Il GM riceve un messaggio che indica chi l'ha spesa, con un pulsante Annulla.",
          "Scrivendo !inspiration un giocatore vede i suoi personaggi e se hanno l'ispirazione.",
          'Disattiva I giocatori possono spendere per lasciare la spesa nelle mani del GM.',
        ],
      },
      passOn: {
        heading: 'Passarla ad altri (regole 2024)',
        points: [
          "Un personaggio non può avere l'Ispirazione eroica due volte. Quando uno che ce l'ha dovrebbe ottenerla di nuovo, ai suoi giocatori viene chiesto di darla a un altro membro del gruppo che non ce l'ha.",
          "La scelta propone ogni membro del gruppo senza Ispirazione eroica, più Lascia perdere. Scade dopo un'ora.",
          "Con le regole 2014, il GM viene solo avvisato che il personaggio ha già l'Ispirazione.",
          'Disattiva Passa ad altri per ricevere sempre quel messaggio.',
        ],
      },
      party: {
        heading: 'Il gruppo',
        points: [
          'Il gruppo comprende ogni personaggio controllato da un giocatore. Seleziona dei token e fai clic su Aggiungi al gruppo o Togli dal gruppo per modificarlo.',
          'La panoramica del GM ha i pulsanti Dai, Togli e Spendi per ogni membro.',
          'Attiva I giocatori vedono il gruppo per far vedere la panoramica anche ai giocatori. Hanno pulsanti Spendi solo per i propri personaggi.',
        ],
      },
      pools: {
        heading: 'Riserve di punti',
        points: [
          "Una riserva di punti è un numero che si accumula e si spende un po' alla volta: una riserva di punti ispirazione, punti eroe, fortuna, bennies e simili. Funziona con qualsiasi scheda del personaggio.",
          'Imposta Tracciamento su Riserva di punti, e Dai, Togli e Spendi agiscono sulla riserva predefinita, chiedendo quanti punti. Il segnalino resta visibile finché un personaggio ha almeno un punto.',
          'Potenzia spende punti per alzare un tiro: scrivi il bonus desiderato, e i Punti per +1 della riserva stabiliscono il costo. A 2 punti per +1, un bonus di 4 costa 8 punti. La Mod annuncia la spesa; aggiungi tu il bonus al tiro.',
          'Una spesa viene rifiutata quando il personaggio non ha abbastanza punti. Il GM viene avvisato di chi ha speso cosa, con un pulsante Annulla.',
          "Conservata in «Casella risorsa della scheda» usa la casella risorsa della scheda che ha il nome della riserva, come una casella Other Resource chiamata Ispirazione sulla scheda D&D 2014. Quando la scheda non ha una casella con quel nome, oppure con «Attributo», i punti sono conservati in un semplice attributo, come inspiration_pool. La scheda D&D 2024 usa sempre l'attributo.",
          "Il riquadro del gruppo in chat e quello personale di un giocatore dicono dove sono conservati i punti di ogni personaggio: il nome della casella della scheda, oppure l'attributo. Un attributo non è mostrato sulla scheda del personaggio.",
          'Cambiare a mano il numero sulla scheda va benissimo: il segnalino lo segue.',
          'Fai clic su Riserve per rinominare la riserva predefinita, impostarne costo e massimo, o aggiungere altre riserve. Le altre riserve si usano dal loro pulsante Gruppo, oppure aggiungendo --pool e il nome della riserva a un comando.',
          'Bardic Inspiration funziona come una riserva a sé: fai clic su Aggiungi riserva e chiamala Bardic Inspiration, imposta il Massimo a 1 e scegli il Segnalino. Il GM dà 1 dal riquadro Gruppo di quella riserva quando il bardo assegna un dado, e chi lo possiede fa clic su Spendi quando lo usa. Il Mod segna chi possiede un dado; il giocatore lo tira da sé.',
        ],
      },
      markers: {
        heading: 'Segnalini dei token',
        points: [
          "Scegli il segnalino con l'impostazione Segnalino. Sono elencati i punti colorati di Roll20, i segnalini predefiniti e i tuoi set di segnalini personalizzati.",
          "Aggiungere il segnalino a un token a mano, o con TokenMod, dà l'ispirazione al personaggio. Toglierlo la spende.",
          'Cambiare segnalino lo sposta subito su ogni token.',
          'I segnalini di condizione della scheda D&D 2024 non sono proposti, perché è la scheda stessa a impostarli.',
        ],
      },
      commands: {
        heading: 'Comandi',
        intro:
          'Ogni comando inizia con !inspiration. I comandi agiscono sui token selezionati, a meno che non sia indicato --ids.',
        mods: 'Anche altre Mod possono inviare questi comandi, per esempio da ScriptCards. Altre Mod possono anche chiamare InspirationTracker.give, spend, remove e isInspired.',
        colCommand: 'Comando',
        colDesc: 'Cosa fa',
      },
      settings: {
        heading: 'Impostazioni',
        intro:
          'Cambiale con il pulsante Impostazioni, oppure scrivi !inspiration set <setting> <value>.',
        colKey: 'Impostazione',
        colName: 'Nome',
        colDesc: 'Cosa fa',
      },
      upgrading: {
        heading: 'Aggiornamento dalla 0.1',
        points: [
          "Il segnalino, l'effetto speciale e il tipo di effetto della versione 0.1 vengono mantenuti.",
          'Se nella 0.1 avevi scelto un tuo comando, funziona ancora insieme a !inspiration.',
          "!inspiration con dei token selezionati dà o toglie ancora l'ispirazione.",
        ],
      },
      troubleshooting: {
        heading: 'Risoluzione dei problemi',
        points: [
          'Il segnalino non compare su un token? Fai clic su Sincronizza per rileggere ogni scheda.',
          "Un token che non rappresenta un personaggio non può avere l'ispirazione. Collegalo prima a un personaggio.",
          'Non succede nulla quando un giocatore fa clic su Spendi? Controlla che il personaggio sia assegnato a quel giocatore.',
          'Gli errori vengono scritti nella console API della pagina Mod Scripts.',
        ],
      },
      languages: {
        heading: 'Lingue',
        body: "InspirationTracker è tradotto nelle lingue qui sotto. Scegline una con l'impostazione Lingua.",
        colCode: 'Codice',
        colName: 'Lingua',
        colNative: 'Nome originale',
      },
      credits: {
        heading: 'Riconoscimenti',
        original: 'Mod originale di',
        maintainer: 'Versione 1 curata da',
        support: 'Segnala bug e idee sul forum Mod di Roll20 o su GitHub.',
      },
      footer: 'I pulsanti per ogni azione sono nella dispensa «{deck}».',
    },
    deck: {
      subtitle: 'Command Deck',
      selectedDesc: 'Seleziona uno o più token, poi fai clic.',
      partyDesc: "Vedi chi ha l'ispirazione e scegli chi fa parte del gruppo.",
      poolsTitle: 'Riserva di punti',
      poolsDesc:
        'Con Tracciamento impostato su Riserva di punti: seleziona i token, fai clic e scrivi il numero.',
      toolsDesc: 'Menu, impostazioni, la macro giocatori e aiuto.',
      footer: 'Le istruzioni complete sono nella dispensa «{help}».',
    },
  };

  const TRANSLATION$9 = {
    terms: {
      heroic: '英雄的インスピレーション',
      classic: 'インスピレーション',
    },
    titles: {
      ready: 'InspirationTracker の準備ができました。',
      settings: 'InspirationTracker 設定',
      help: 'InspirationTracker コマンド',
      party: 'パーティーのインスピレーション',
      poolParty: 'パーティーの{term}',
      pools: 'ポイントプール',
      yours: 'あなたのキャラクター',
      status: 'InspirationTracker ステータス',
    },
    messages: {
      gained: '{name} は{term}を得た！',
      spent: '{name} は{term}を使用した。',
      spentBy: '{player} が {name} の{term}を使用しました。',
      spentSheet: '{name} はもう{term}を持っていません（シートまたはトークンで変更されました）。',
      restored: '{name} の{term}が戻りました。',
      removed: '{name} から{term}を取り除きました。',
      already: '{name} はすでに{term}を持っています。',
      none: '{name} は{term}を持っていません。',
      busy: '{name} はまだ更新中です。少し待ってからもう一度お試しください。',
      passOffer:
        '{name} はすでに{term}を持っているため、重ねて持つことはできません。持っていないパーティーメンバーに渡すか、手放してください。',
      passNobody: '他のパーティーメンバーは全員すでに持っています。',
      passAsked: '{name} のプレイヤーに、{term}を誰に渡すか尋ねました。',
      passed: '{from} が {to} に{term}を渡した！',
      passAlready: '{to} はすでに持っています。別の人を選んでください。',
      declined: '{name} は余分な{term}を手放した。',
      undoAlready: '{name} はすでに再び持っています。',
      synced: '読み込んだシート: {checked}。インスピレーションあり: {inspired}。',
      migrated:
        'バージョン 0.1 の設定（マーカー、特殊効果とその種類）を引き継ぎました。新しい設定は初期値から始まります。',
      legacyCommand: '以前のコマンド {command} も {main} と同様に引き続き使えます。',
      macroHint:
        'プレイヤーに「使用」ボタンを与えるには {command} を実行してください。全員にトークンアクションが追加されます。',
      macro:
        'マクロ「{name}」の準備ができました。プレイヤーは自分が操作するトークンを選択すると、トークンアクションとして表示されます。',
      journal: 'ヘルプとコマンドデッキのハンドアウトを再作成しました。',
      readyHint:
        '{command} と入力してメニューを開くか、コマンドデッキのハンドアウトを開いてください。',
    },
    pool: {
      gained: '{name} は{term}を {amount} 得た（{before} → {after}）。',
      spent: '{name} は{term}を {amount} 使用した（{before} → {after}）。',
      boosted: '{name} は{term}を {amount} 使用し、ロールに +{bonus}（{before} → {after}）。',
      spentBy: '{player} が {name} の{term}を {amount} 使用しました。',
      restored: '{name} の{term}が {amount} 戻りました（{before} → {after}）。',
      removed: '{name} から{term}を {amount} 取り除きました（{before} → {after}）。',
      none: '{name} は{term}を持っていません。',
      short: '{name} の{term}は {have} で、{need} 必要です。',
      full: '{name} の{term}はすでに上限（{max}）に達しています。',
    },
    pools: {
      introFlag:
        '管理対象はシートのインスピレーション欄になっています。「ポイントプール」に変更すると、「与える」と「使用」は「{name}」プールに対して働きます。他のプールは --pool で使います。',
      introPool:
        '「与える」「使用」「ブースト」は「{name}」に対して働きます。他のプールは、それぞれの「パーティー」ボタンか --pool で使います。',
      defaultLabel: '{name}（既定）',
      name: '名前',
      source: '保存先',
      cost: '+1 あたりのポイント',
      max: '上限',
      marker: 'マーカー',
      attribute: 'シートにこの名前の欄がない場合の属性: {attribute}',
      partyTotal: 'パーティー合計: {term} {total}。',
      keptBox: 'シートの欄: {name}',
      keptAttribute: '属性: {attribute}',
      keptNote: '属性はキャラクターシートには表示されません。',
    },
    prompts: {
      points: 'ポイント',
      bonus: 'ロールへのボーナス',
      max: 'ポイントの上限（0 で無制限）',
    },
    errors: {
      unknownPool: '「{value}」という名前のプールはありません。',
      unknownPoolHint: 'プール: {pools}。',
      badAmount: '「{value}」はポイント数として使えません。',
      badAmountHint: '1 から 9999 までの整数を指定してください。',
      boostNoPool: 'ブーストはプールのポイントを使用します。',
      poolInvalid: 'プールに「{value}」という名前は付けられません。',
      poolExists: '「{value}」という名前のプールはすでにあります。',
      poolFull: 'これ以上プールを追加できません。',
      poolNameHint:
        '文字、数字、スペースで 40 文字以内の、他のプールと重複しない名前を使ってください。',
      poolDefault: '既定のプール「{name}」は削除できません。名前の変更はできます。',
      poolMarkerHint: 'マーカーセットから、「マーカー」設定とは別のマーカーを選んでください。',
      poolSetHint: '!inspiration pools と入力すると、すべてのプールとその設定が表示されます。',
      denied: '{name} に対してその操作はできません。',
      gmOnly: 'そのコマンドは GM のみ使用できます。',
      gmOnlyHint: 'プレイヤーは spend、party、help を使用できます。',
      spendOff: 'GM がプレイヤーによる使用をオフにしています。',
      noCharacter: '次のトークンはキャラクターを表していません: {names}。',
      nothingSelected: '先にトークンを選択してください。',
      nothingSelectedHint:
        'キャラクターを表すトークンを選択するか、トークンまたはキャラクターの ID を指定して --ids を追加してください。',
      writeFailed: '{name} のシートを変更できませんでした。',
      offerGone: 'その選択はすでに行われたか、期限切れです。',
      passInvalid: '持っている本人以外のパーティーメンバーを選んでください。',
      undoGone: 'その使用はすでに取り消されたか、古すぎます。',
      unknownMarker: '「{value}」という名前のトークンマーカーはありません。',
      unknownMarkerHint: '設定の「マーカー」ボタンを使って、マーカーセットから選んでください。',
      badSetting: '{key} を「{value}」に設定できません。',
      badSettingHint: '!inspiration set と入力すると、すべての設定と選択肢が表示されます。',
      unknownCommand: '不明なコマンド: {command}。',
      unknownCommandHint: '!inspiration help と入力するとコマンド一覧が表示されます。',
    },
    menu: {
      selected: '選択中のトークン',
      party: 'パーティー',
      tools: 'ツール',
      hint: '詳しい説明はハンドアウト「{help}」にあります。',
      noSheet: 'シートなし',
      noneYours: 'シートのあるキャラクターを操作していません。',
      partyEmpty: 'パーティーメンバーを操作していません。',
      partyEmptyGm:
        'パーティーにはまだ誰もいません。キャラクターをプレイヤーに割り当てるか、トークンを選択して「パーティーに追加」をクリックしてください。',
      partyCount: '{total} 人中 {count} 人が{term}を持っています。',
    },
    buttons: {
      menu: 'メニュー',
      give: '与える',
      remove: '外す',
      toggle: '切り替え',
      spend: '使用',
      party: 'パーティー',
      partyAdd: 'パーティーに追加',
      partyRemove: 'パーティーから外す',
      settings: '設定',
      macro: 'プレイヤー用マクロ',
      sync: '同期',
      status: 'ステータス',
      help: 'ヘルプ',
      reset: '設定をリセット',
      refresh: '更新',
      undo: '元に戻す',
      decline: '手放す',
      boost: 'ブースト',
      pools: 'プール',
      addPool: 'プールを追加',
      deletePool: 'プールを削除',
    },
    values: {
      on: 'オン',
      off: 'オフ',
      none: 'なし',
      noLimit: '無制限',
      tracking: {
        flag: 'シートのインスピレーション欄',
        pool: 'ポイントプール',
      },
      source: {
        resource: 'シートのリソース欄',
        attribute: '属性',
      },
      wording: {
        2014: 'インスピレーション (2014)',
        2024: '英雄的インスピレーション (2024)',
        auto: 'シートに従う',
      },
      announce: {
        public: '全員',
        gm: 'GM と所有者',
        off: '誰にも見せない',
      },
    },
    settings: {
      language: {
        label: '言語',
        desc: 'メニュー、メッセージ、ハンドアウトの言語。',
      },
      tracking: {
        label: '管理対象',
        desc: '「与える」と「使用」が何に対して働くか。D&D シートのインスピレーション欄（持っているか、いないかのどちらか）、または貯まっていき少しずつ使うポイントのプール。',
      },
      marker: {
        label: 'マーカー',
        desc: 'キャラクターがインスピレーションを持っている間に表示するトークンマーカー。カスタムマーカーセットも一覧に表示されます。',
      },
      wording: {
        label: '呼び方',
        desc: '「インスピレーション」と「英雄的インスピレーション」のどちらで呼ぶか。「シートに従う」では、D&D 2024 シートごとに選ばれたルールを使い、2014 シートではインスピレーションを使います。',
      },
      announce: {
        label: '通知',
        desc: 'インスピレーションの獲得・使用時のチャットメッセージを誰に表示するか。',
      },
      fx: {
        label: '特殊効果',
        desc: 'トークンがインスピレーションを得たときに特殊効果を再生します。',
      },
      fxType: {
        label: '効果の種類',
        desc: '再生する効果（nova-holy など）、またはカスタム効果の ID。',
      },
      playerSpend: {
        label: 'プレイヤーの使用',
        desc: 'プレイヤーが自分の操作するキャラクターのインスピレーションを使用できるようにします。GM には「元に戻す」ボタン付きで通知されます。',
      },
      playerOverview: {
        label: 'プレイヤーのパーティー表示',
        desc: 'パーティーの誰がインスピレーションを持っているかをプレイヤーにも見せます。',
      },
      passOn: {
        label: '譲渡 (2024)',
        desc: '2024 ルールでは、英雄的インスピレーションを持っているキャラクターが再びそれを得る場合、他のパーティーメンバーに渡すことができます。',
      },
    },
    status: {
      version: 'バージョン',
      beacon: 'D&D 2024 シート',
      legacy: '2014 シート',
      none: 'インスピレーション欄のないキャラクター',
      rules2024: '2024 ルールを使用',
      party: 'パーティーメンバー',
      tracking: '管理対象',
      pools: 'プール',
      marker: 'マーカー',
      fx: '特殊効果',
      legacyCommand: '以前のコマンド',
    },
    help: {
      menu: 'メニューを表示します。トークンを選択している場合は、バージョン 0.1 と同様にインスピレーションを与えるか取り除きます。',
      give: '選択したキャラクターにインスピレーションを与えます。',
      remove:
        '選択したキャラクターからインスピレーションを取り除きます（使用扱いにはなりません）。',
      toggle:
        '選択したキャラクターのうち、持っていない者には与え、持っている者からは取り除きます。',
      spend: '選択したキャラクターのインスピレーションを使用し、GM に通知します。',
      party:
        'パーティーの誰がインスピレーションを持っているかを、与える・外す・使用ボタン付きで表示します。',
      partyEdit: '選択したキャラクターをパーティーに追加、またはパーティーから外します。',
      ids: '選択中のトークンの代わりに、指定したトークンまたはキャラクターの ID に対して実行します。',
      points:
        'ポイントプール使用時: その数のポイントを与える、取り除く、または使用します。数を省略すると 1。remove all はすべてのポイントを取り除きます。',
      boost:
        'ポイントプール使用時: ポイントを使用して、そのボーナスをロールに加えます。+1 ごとのコストはプールの設定に従います。',
      poolFlag: '既定のプールの代わりに、指定した名前のプールに対して実行します。',
      pools: 'ポイントプールとその設定を表示します。',
      poolEdit: 'プールを追加、または削除します。シート上のポイントはそのまま残ります。',
      poolSet:
        'プールを変更します: 名前、保存先（resource または attribute）、+1 あたりのポイント、ポイントの上限（0 で無制限）、トークンマーカー。',
      undo: '使用したインスピレーションを戻します。ID は使用時の GM 向けメッセージに記載されています。',
      macro:
        'トークンアクション「Inspiration」を追加します。プレイヤーはこれをクリックしてインスピレーションを使用します。',
      sync: 'すべてのシートを読み直し、マーカーを正しく直します。',
      set: '設定を表示するか、1 つを変更します。',
      reset: '言語以外のすべての設定を初期値に戻します。',
      status: 'バージョン、見つかったシート、主な設定を表示します。',
      journal: 'ヘルプとコマンドデッキのハンドアウトを再作成します。',
      help: 'この一覧を表示します。',
    },
    helpPlayer: {
      menu: 'あなたのキャラクターと、インスピレーションを持っているかを表示します。',
      spend: '選択したキャラクターのインスピレーションを使用します。',
      boost: 'プールのポイントを使用して、そのボーナスをロールに加えます。',
      party: 'GM が許可していれば、パーティーを表示します。',
      help: 'この一覧を表示します。',
    },
    handout: {
      versionLabel: 'バージョン',
      subtitle:
        'あらゆるゲームで使えるインスピレーション、英雄的インスピレーション、ポイントプール',
      overview: {
        heading: '概要',
        body: 'InspirationTracker は、D&D のインスピレーションをキャラクターシート、トークン、チャットの間で常に一致させます。メニュー、シート、トークンマーカーのどこから与えても、そのキャラクターのすべてのトークンにマーカーが表示されます。プレイヤーはワンクリックで使用でき、GM には「元に戻す」ボタン付きで通知されます。英雄的インスピレーションと呼ばれる D&D 2024 シートと、2014 OGL シートの両方に対応しています。',
      },
      quickStart: {
        heading: 'クイックスタート',
        steps: [
          'コマンドデッキのハンドアウトを開くか、!inspiration と入力してメニューを開きます。',
          'トークンを選択して「与える」をクリックします。キャラクターがインスピレーションを得て、そのトークンにマーカーが表示されます。',
          '「プレイヤー用マクロ」を一度クリックすると、プレイヤーはインスピレーションを使うためのトークンアクションを使えるようになります。',
          '「パーティー」をクリックすると、誰がインスピレーションを持っているかが分かります。',
        ],
      },
      sheets: {
        heading: 'キャラクターシート',
        colSheet: 'シート',
        colWhere: 'インスピレーションの保存場所',
        colSheet2014: 'D&D 5E by Roll20 (2014 OGL)',
        where2014: 'インスピレーション欄、属性 "inspiration"。',
        colSheet2024: 'D&D Fifth Edition (5E & 5.5E, 2024)',
        where2024: '英雄的インスピレーション欄。getSheetItem と setSheetItem で読み書きします。',
        points: [
          'シートの欄にチェックを入れたり外したりすると、すぐに検知されます。マーカーも追従し、チェックを外すと使用したものとして扱われます。',
          '「呼び方」が「シートに従う」の場合、各 D&D 2024 キャラクターはシート設定で選ばれたルールに従います。2024 ルールなら英雄的インスピレーション、2014 ルールならインスピレーションと呼びます。',
          'どちらのシートも使っていないキャラクターには手を加えないので、NPC のトークンは変更されません。',
        ],
      },
      players: {
        heading: 'プレイヤー',
        points: [
          'プレイヤーは自分が操作するキャラクターのインスピレーションを使用できます。チャットの「使用」か、トークンアクション「Inspiration」をクリックします。',
          'GM には誰が使用したかを知らせるメッセージが、「元に戻す」ボタン付きで届きます。',
          'プレイヤーが !inspiration と入力すると、自分のキャラクターとインスピレーションの有無が表示されます。',
          '使用を GM だけに任せたい場合は「プレイヤーの使用」をオフにしてください。',
        ],
      },
      passOn: {
        heading: '譲渡（2024 ルール）',
        points: [
          'キャラクターは英雄的インスピレーションを重ねて持つことはできません。持っているキャラクターが再び得る場合、そのプレイヤーは持っていない他のパーティーメンバーに渡すよう求められます。',
          '選択肢には英雄的インスピレーションを持っていないすべてのパーティーメンバーと「手放す」が並びます。1 時間で期限切れになります。',
          '2014 ルールでは、そのキャラクターがすでにインスピレーションを持っていることが GM に通知されるだけです。',
          '常にそのメッセージだけにしたい場合は「譲渡」をオフにしてください。',
        ],
      },
      party: {
        heading: 'パーティー',
        points: [
          'パーティーは、プレイヤーが操作するすべてのキャラクターです。トークンを選択し、「パーティーに追加」または「パーティーから外す」をクリックして変更できます。',
          'GM の一覧には、メンバーごとに「与える」「外す」「使用」ボタンがあります。',
          '「プレイヤーのパーティー表示」をオンにすると、プレイヤーも一覧を見られます。「使用」ボタンは自分のキャラクターにだけ表示されます。',
        ],
      },
      pools: {
        heading: 'ポイントプール',
        points: [
          'ポイントプールは、貯まっていき少しずつ使う数値です。インスピレーションポイント、ヒーローポイント、幸運、bennies などのプールに使えます。どのキャラクターシートでも動作します。',
          '「管理対象」を「ポイントプール」にすると、「与える」「外す」「使用」は既定のプールに対して働き、ポイント数を尋ねます。キャラクターがポイントを持っている間はマーカーが表示されます。',
          '「ブースト」はポイントを使用してロールを上げます。欲しいボーナスを入力すると、プールの「+1 あたりのポイント」でコストが決まります。+1 あたり 2 ポイントなら、ボーナス 4 には 8 ポイントかかります。Mod は使用を通知するだけなので、ボーナスは自分でロールに加えてください。',
          'キャラクターのポイントが足りない場合、使用は拒否されます。GM には誰が何を使用したかが「元に戻す」ボタン付きで通知されます。',
          '保存先が「シートのリソース欄」の場合、シート上でプールと同じ名前を持つリソース欄を使います。たとえば 2014 D&D シートで Inspiration と名付けた Other Resource 欄です。シートにその名前の欄がない場合、または保存先が「属性」の場合、ポイントは inspiration_pool のような単純な属性に保存されます。D&D 2024 シートでは常に属性を使います。',
          'パーティーのカードとプレイヤー自身のカードには、各キャラクターのポイントの保存先（シートの欄の名前、または属性）が表示されます。属性はキャラクターシートには表示されません。',
          'シート上の数値を手で変更しても問題ありません。マーカーも追従します。',
          '「プール」をクリックすると、既定のプールの名前を変更したり、コストと上限を設定したり、プールを追加したりできます。他のプールは、それぞれの「パーティー」ボタンから、またはコマンドに --pool とプール名を追加して使います。',
          'Bardic Inspiration は専用のプールとして扱えます。「プールを追加」をクリックして Bardic Inspiration と名付け、「上限」を 1 にし、「マーカー」を選びます。バードがダイスを与えたら、GM がそのプールの「パーティー」カードから 1 を与え、持っているキャラクターは使うときに「使用」をクリックします。Mod は誰がダイスを持っているかを示すだけで、ダイスはプレイヤーが自分で振ります。',
        ],
      },
      markers: {
        heading: 'トークンマーカー',
        points: [
          '「マーカー」設定でマーカーを選びます。Roll20 の色付きの点、標準マーカー、カスタムマーカーセットが一覧に表示されます。',
          '手動または TokenMod でトークンにマーカーを付けると、キャラクターはインスピレーションを得ます。外すと使用したことになります。',
          'マーカーを変更すると、すべてのトークン上ですぐに置き換わります。',
          'D&D 2024 シート独自の状態マーカーはシート自身が設定するため、選択肢に含まれません。',
        ],
      },
      commands: {
        heading: 'コマンド',
        intro:
          'すべてのコマンドは !inspiration で始まります。--ids を指定しない限り、コマンドは選択中のトークンに対して実行されます。',
        mods: '他の Mod からも、たとえば ScriptCards からこれらのコマンドを送れます。また、他の Mod は InspirationTracker.give、spend、remove、isInspired を呼び出せます。',
        colCommand: 'コマンド',
        colDesc: '内容',
      },
      settings: {
        heading: '設定',
        intro: '「設定」ボタンで変更するか、!inspiration set <setting> <value> と入力します。',
        colKey: '設定キー',
        colName: '名前',
        colDesc: '内容',
      },
      upgrading: {
        heading: '0.1 からのアップグレード',
        points: [
          'バージョン 0.1 のマーカー、特殊効果、効果の種類は引き継がれます。',
          '0.1 で独自のコマンドを選んでいた場合、そのコマンドも !inspiration と並んで引き続き使えます。',
          'トークンを選択した状態の !inspiration は、引き続きインスピレーションを与えるか取り除きます。',
        ],
      },
      troubleshooting: {
        heading: 'トラブルシューティング',
        points: [
          'トークンにマーカーが表示されない場合は、「同期」をクリックしてすべてのシートを読み直してください。',
          'キャラクターを表していないトークンはインスピレーションを持てません。先にキャラクターにリンクしてください。',
          'プレイヤーが「使用」をクリックしても何も起きない場合は、キャラクターがそのプレイヤーに割り当てられているか確認してください。',
          'エラーは Mod Scripts ページの API コンソールに書き出されます。',
        ],
      },
      languages: {
        heading: '言語',
        body: 'InspirationTracker は以下の言語に翻訳されています。「言語」設定で選んでください。',
        colCode: 'コード',
        colName: '言語',
        colNative: '現地語での名前',
      },
      credits: {
        heading: 'クレジット',
        original: 'オリジナル Mod の作者:',
        maintainer: 'バージョン 1 のメンテナー:',
        support: 'バグや要望は Roll20 の Mod フォーラムまたは GitHub でお知らせください。',
      },
      footer: 'すべての操作のボタンはハンドアウト「{deck}」にあります。',
    },
    deck: {
      subtitle: 'コマンドデッキ',
      selectedDesc: 'トークンを 1 つ以上選択してからクリックします。',
      partyDesc: '誰がインスピレーションを持っているかを確認し、パーティーのメンバーを選びます。',
      poolsTitle: 'ポイントプール',
      poolsDesc:
        '「管理対象」が「ポイントプール」の場合: トークンを選択してクリックし、数を入力します。',
      toolsDesc: 'メニュー、設定、プレイヤー用マクロ、ヘルプ。',
      footer: '詳しい説明はハンドアウト「{help}」にあります。',
    },
  };

  const TRANSLATION$8 = {
    terms: {
      heroic: '영웅적 영감',
      classic: '영감',
    },
    titles: {
      ready: 'InspirationTracker가 준비되었습니다.',
      settings: 'InspirationTracker 설정',
      help: 'InspirationTracker 명령어',
      party: '파티 영감',
      poolParty: '파티 {term}',
      pools: '포인트 풀',
      yours: '내 캐릭터',
      status: 'InspirationTracker 상태',
    },
    messages: {
      gained: '{name}: {term} 획득!',
      spent: '{name}: {term} 사용.',
      spentBy: '{player} 님이 {name}의 {term}을(를) 사용했습니다.',
      spentSheet: '{name}에게 더 이상 {term}이(가) 없습니다(시트 또는 토큰에서 변경됨).',
      restored: '{name}의 {term}이(가) 돌아왔습니다.',
      removed: '{name}에게서 {term}을(를) 회수했습니다.',
      already: '{name}은(는) 이미 {term}을(를) 가지고 있습니다.',
      none: '{name}에게는 {term}이(가) 없습니다.',
      busy: '{name}은(는) 아직 갱신 중입니다. 잠시 후 다시 시도하세요.',
      passOffer:
        '{name}은(는) 이미 {term}을(를) 가지고 있어 두 번 가질 수 없습니다. 없는 파티원에게 넘기거나 포기하세요.',
      passNobody: '다른 파티원 모두가 이미 가지고 있습니다.',
      passAsked: '{name}의 플레이어에게 {term}을(를) 누구에게 줄지 물었습니다.',
      passed: '{from}이(가) {to}에게 {term}을(를) 넘겼습니다!',
      passAlready: '{to}은(는) 이미 가지고 있습니다. 다른 사람을 고르세요.',
      declined: '{name}은(는) 남는 {term}을(를) 포기했습니다.',
      undoAlready: '{name}은(는) 이미 다시 가지고 있습니다.',
      synced: '읽은 시트: {checked}. 영감 보유: {inspired}.',
      migrated:
        '버전 0.1의 설정(마커, 특수 효과와 그 종류)을 유지했습니다. 새 설정은 기본값으로 시작합니다.',
      legacyCommand: '예전 명령어 {command}도 {main}과(와) 함께 계속 작동합니다.',
      macroHint:
        '플레이어에게 사용 버튼을 주려면 {command}을(를) 실행하세요. 모두에게 토큰 액션이 추가됩니다.',
      macro:
        '"{name}" 매크로가 준비되었습니다. 플레이어가 자신이 조종하는 토큰을 선택하면 토큰 액션으로 보입니다.',
      journal: '도움말과 명령 데크 핸드아웃을 다시 만들었습니다.',
      readyHint: '메뉴를 보려면 {command}을(를) 입력하거나 명령 데크 핸드아웃을 여세요.',
    },
    pool: {
      gained: '{name}: {term} {amount} 획득 ({before} → {after}).',
      spent: '{name}: {term} {amount} 사용 ({before} → {after}).',
      boosted: '{name}: {term} {amount} 사용, 굴림에 +{bonus} ({before} → {after}).',
      spentBy: '{player} 님이 {name}의 {term}을(를) {amount}만큼 사용했습니다.',
      restored: '{name}: {term} {amount} 복구 ({before} → {after}).',
      removed: '{name}: {term} {amount} 회수 ({before} → {after}).',
      none: '{name}에게는 {term}이(가) 없습니다.',
      short: '{name}: {term} {have} 보유, {need} 필요.',
      full: '{name}은(는) 이미 {term}을(를) 최대치({max})까지 가지고 있습니다.',
    },
    pools: {
      introFlag:
        '추적 대상이 시트의 영감 칸으로 설정되어 있습니다. 포인트 풀로 바꾸면 주기와 사용이 "{name}" 풀에 적용됩니다. 다른 풀은 --pool로 사용합니다.',
      introPool:
        '주기, 사용, 부스트는 "{name}"에 적용됩니다. 다른 풀은 각 풀의 파티 버튼이나 --pool로 사용합니다.',
      defaultLabel: '{name} (기본)',
      name: '이름',
      source: '저장 위치',
      cost: '+1당 포인트',
      max: '최대치',
      marker: '마커',
      attribute: '시트에 이 이름의 칸이 없을 때 쓰는 속성: {attribute}',
      partyTotal: '파티 합계: {term} {total}.',
      keptBox: '시트의 칸: {name}',
      keptAttribute: '속성: {attribute}',
      keptNote: '속성은 캐릭터 시트에 표시되지 않습니다.',
    },
    prompts: {
      points: '포인트',
      bonus: '굴림 보너스',
      max: '포인트 최대치 (0은 제한 없음)',
    },
    errors: {
      unknownPool: '"{value}"(이)라는 풀이 없습니다.',
      unknownPoolHint: '풀: {pools}.',
      badAmount: '"{value}"은(는) 포인트 수가 아닙니다.',
      badAmountHint: '1에서 9999 사이의 정수를 사용하세요.',
      boostNoPool: '부스트는 풀의 포인트를 사용합니다.',
      poolInvalid: '풀 이름을 "{value}"(으)로 지을 수 없습니다.',
      poolExists: '"{value}"(이)라는 풀이 이미 있습니다.',
      poolFull: '풀을 더 추가할 자리가 없습니다.',
      poolNameHint:
        '글자, 숫자, 공백으로 된 40자 이내의 이름 중 다른 풀이 쓰지 않는 이름을 사용하세요.',
      poolDefault: '기본 풀 "{name}"은(는) 삭제할 수 없습니다. 이름은 바꿀 수 있습니다.',
      poolMarkerHint: '마커 세트에서 마커 설정에 쓰인 것과 다른 마커를 고르세요.',
      poolSetHint: '!inspiration pools를 입력하면 모든 풀과 그 설정을 볼 수 있습니다.',
      denied: '{name}에 대해서는 그 작업을 할 수 없습니다.',
      gmOnly: '그 명령어는 GM만 사용할 수 있습니다.',
      gmOnlyHint: '플레이어는 spend, party, help를 사용할 수 있습니다.',
      spendOff: 'GM이 플레이어의 영감 사용을 꺼 두었습니다.',
      noCharacter: '다음 토큰은 캐릭터를 나타내지 않습니다: {names}.',
      nothingSelected: '먼저 토큰을 선택하세요.',
      nothingSelectedHint:
        '캐릭터를 나타내는 토큰을 선택하거나, 토큰 또는 캐릭터 ID와 함께 --ids를 추가하세요.',
      writeFailed: '{name}의 시트를 변경할 수 없습니다.',
      offerGone: '이미 선택이 끝났거나 만료되었습니다.',
      passInvalid: '가지고 있는 캐릭터가 아닌 다른 파티원을 고르세요.',
      undoGone: '그 사용은 이미 취소되었거나 너무 오래되었습니다.',
      unknownMarker: '"{value}"(이)라는 토큰 마커가 없습니다.',
      unknownMarkerHint: '설정의 마커 버튼으로 마커 세트에서 고르세요.',
      badSetting: '{key}을(를) "{value}"(으)로 설정할 수 없습니다.',
      badSettingHint: '!inspiration set을 입력하면 모든 설정과 선택지를 볼 수 있습니다.',
      unknownCommand: '알 수 없는 명령어: {command}.',
      unknownCommandHint: '명령어 목록을 보려면 !inspiration help를 입력하세요.',
    },
    menu: {
      selected: '선택한 토큰',
      party: '파티',
      tools: '도구',
      hint: '자세한 설명은 "{help}" 핸드아웃에 있습니다.',
      noSheet: '시트 없음',
      noneYours: '시트가 있는 캐릭터를 조종하고 있지 않습니다.',
      partyEmpty: '조종하는 파티원이 없습니다.',
      partyEmptyGm:
        '아직 파티에 아무도 없습니다. 캐릭터를 플레이어에게 할당하거나, 토큰을 선택하고 파티에 추가를 클릭하세요.',
      partyCount: '{total}명 중 {count}명이 {term}을(를) 가지고 있습니다.',
    },
    buttons: {
      menu: '메뉴',
      give: '주기',
      remove: '회수',
      toggle: '전환',
      spend: '사용',
      party: '파티',
      partyAdd: '파티에 추가',
      partyRemove: '파티에서 제외',
      settings: '설정',
      macro: '플레이어 매크로',
      sync: '동기화',
      status: '상태',
      help: '도움말',
      reset: '설정 초기화',
      refresh: '새로 고침',
      undo: '되돌리기',
      decline: '포기',
      boost: '부스트',
      pools: '풀',
      addPool: '풀 추가',
      deletePool: '풀 삭제',
    },
    values: {
      on: '켜짐',
      off: '꺼짐',
      none: '없음',
      noLimit: '제한 없음',
      tracking: {
        flag: '시트의 영감 칸',
        pool: '포인트 풀',
      },
      source: {
        resource: '시트의 자원 칸',
        attribute: '속성',
      },
      wording: {
        2014: '영감 (2014)',
        2024: '영웅적 영감 (2024)',
        auto: '시트 따름',
      },
      announce: {
        public: '모두',
        gm: 'GM과 소유자',
        off: '아무도 안 봄',
      },
    },
    settings: {
      language: {
        label: '언어',
        desc: '메뉴, 메시지, 핸드아웃의 언어입니다.',
      },
      tracking: {
        label: '추적 대상',
        desc: '주기와 사용이 적용되는 대상입니다. 캐릭터가 가지고 있거나 없거나 둘 중 하나인 D&D 시트의 영감 칸, 또는 쌓였다가 조금씩 사용하는 포인트 풀 중에서 고릅니다.',
      },
      marker: {
        label: '마커',
        desc: '캐릭터가 영감을 가진 동안 표시할 토큰 마커입니다. 사용자 지정 마커 세트도 목록에 나옵니다.',
      },
      wording: {
        label: '용어',
        desc: '영감과 영웅적 영감 중 어느 쪽으로 부를지 정합니다. "시트 따름"은 D&D 2024 시트마다 선택된 규칙을 따르고, 2014 시트에서는 영감을 씁니다.',
      },
      announce: {
        label: '알림',
        desc: '영감을 얻거나 사용할 때 채팅 메시지를 누가 볼지 정합니다.',
      },
      fx: {
        label: '특수 효과',
        desc: '토큰이 영감을 얻으면 특수 효과를 재생합니다.',
      },
      fxType: {
        label: '효과 종류',
        desc: '재생할 효과(예: nova-holy) 또는 사용자 지정 효과의 ID입니다.',
      },
      playerSpend: {
        label: '플레이어 사용 허용',
        desc: '플레이어가 자신이 조종하는 캐릭터의 영감을 사용할 수 있게 합니다. GM에게는 되돌리기 버튼과 함께 알림이 갑니다.',
      },
      playerOverview: {
        label: '플레이어 파티 보기',
        desc: '파티에서 누가 영감을 가졌는지 플레이어도 볼 수 있게 합니다.',
      },
      passOn: {
        label: '넘겨주기 (2024)',
        desc: '2024 규칙에서는 영웅적 영감을 이미 가진 캐릭터가 다시 얻게 되면 다른 파티원에게 넘겨줄 수 있습니다.',
      },
    },
    status: {
      version: '버전',
      beacon: 'D&D 2024 시트',
      legacy: '2014 시트',
      none: '영감 칸이 없는 캐릭터',
      rules2024: '2024 규칙 사용',
      party: '파티원',
      tracking: '추적 대상',
      pools: '풀',
      marker: '마커',
      fx: '특수 효과',
      legacyCommand: '예전 명령어',
    },
    help: {
      menu: '메뉴를 표시합니다. 토큰을 선택한 상태라면 버전 0.1처럼 영감을 주거나 회수합니다.',
      give: '선택한 캐릭터에게 영감을 줍니다.',
      remove: '선택한 캐릭터에게서 영감을 회수합니다. 사용한 것으로 치지 않습니다.',
      toggle: '선택한 캐릭터 중 영감이 없는 캐릭터에게는 주고, 있는 캐릭터에게서는 회수합니다.',
      spend: '선택한 캐릭터의 영감을 사용하고 GM에게 알립니다.',
      party: '파티에서 누가 영감을 가졌는지 주기, 회수, 사용 버튼과 함께 보여 줍니다.',
      partyEdit: '선택한 캐릭터를 파티에 추가하거나 파티에서 제외합니다.',
      ids: '선택한 토큰 대신 지정한 토큰 또는 캐릭터 ID에 적용합니다.',
      points:
        '포인트 풀 사용 시: 그 수만큼 포인트를 주거나 회수하거나 사용합니다. 숫자가 없으면 1입니다. remove all은 모든 포인트를 회수합니다.',
      boost:
        '포인트 풀 사용 시: 포인트를 사용해 그 보너스를 굴림에 더합니다. +1마다 풀에 정해진 비용이 듭니다.',
      poolFlag: '기본 풀 대신 지정한 이름의 풀에 적용합니다.',
      pools: '포인트 풀과 그 설정을 보여 줍니다.',
      poolEdit: '풀을 추가하거나 삭제합니다. 시트의 포인트는 그대로 둡니다.',
      poolSet:
        '풀을 변경합니다: 이름, 저장 위치(resource 또는 attribute), +1당 포인트, 포인트 최대치(0은 제한 없음), 토큰 마커.',
      undo: '사용한 영감을 되돌려 줍니다. ID는 사용에 관한 GM 메시지에 있습니다.',
      macro: '"Inspiration" 토큰 액션을 추가합니다. 플레이어는 이것을 클릭해 영감을 사용합니다.',
      sync: '모든 시트를 다시 읽고 마커를 바로잡습니다.',
      set: '설정을 보여 주거나 하나를 변경합니다.',
      reset: '언어를 제외한 모든 설정을 기본값으로 되돌립니다.',
      status: '버전, 찾은 시트, 주요 설정을 보여 줍니다.',
      journal: '도움말과 명령 데크 핸드아웃을 다시 만듭니다.',
      help: '이 목록을 보여 줍니다.',
    },
    helpPlayer: {
      menu: '내 캐릭터와 각 캐릭터의 영감 보유 여부를 보여 줍니다.',
      spend: '선택한 캐릭터의 영감을 사용합니다.',
      boost: '풀의 포인트를 사용해 그 보너스를 굴림에 더합니다.',
      party: 'GM이 허용하면 파티를 보여 줍니다.',
      help: '이 목록을 보여 줍니다.',
    },
    handout: {
      versionLabel: '버전',
      subtitle: '모든 게임을 위한 영감, 영웅적 영감, 포인트 풀',
      overview: {
        heading: '개요',
        body: 'InspirationTracker는 D&D 영감을 캐릭터 시트, 토큰, 채팅에서 항상 일치시킵니다. 메뉴, 시트, 토큰 마커 중 어디서 주어도 그 캐릭터의 모든 토큰에 마커가 표시됩니다. 플레이어는 클릭 한 번으로 사용할 수 있고, GM에게는 되돌리기 버튼과 함께 알림이 갑니다. 영웅적 영감이라고 부르는 D&D 2024 시트와 2014 OGL 시트 모두에서 작동합니다.',
      },
      quickStart: {
        heading: '빠른 시작',
        steps: [
          '명령 데크 핸드아웃을 열거나 !inspiration을 입력해 메뉴를 엽니다.',
          '토큰을 선택하고 주기를 클릭합니다. 캐릭터가 영감을 얻고 그 토큰에 마커가 표시됩니다.',
          '플레이어 매크로를 한 번 클릭하면 플레이어가 영감을 사용할 수 있는 Inspiration 토큰 액션이 생깁니다.',
          '파티를 클릭하면 누가 영감을 가졌는지 볼 수 있습니다.',
        ],
      },
      sheets: {
        heading: '캐릭터 시트',
        colSheet: '시트',
        colWhere: '영감이 저장되는 곳',
        colSheet2014: 'D&D 5E by Roll20 (2014 OGL)',
        where2014: '영감 칸, 속성 "inspiration".',
        colSheet2024: 'D&D Fifth Edition (5E & 5.5E, 2024)',
        where2024: '영웅적 영감 칸. getSheetItem과 setSheetItem으로 읽고 씁니다.',
        points: [
          '시트의 칸을 체크하거나 해제하면 바로 감지됩니다. 마커가 따라 바뀌고, 해제하면 사용한 것으로 칩니다.',
          '용어가 "시트 따름"이면 각 D&D 2024 캐릭터는 시트 설정에서 고른 규칙을 따릅니다. 2024 규칙은 영웅적 영감, 2014 규칙은 영감이라고 부릅니다.',
          '두 시트 중 어느 것도 쓰지 않는 캐릭터는 건드리지 않으므로 NPC 토큰은 바뀌지 않습니다.',
        ],
      },
      players: {
        heading: '플레이어',
        points: [
          '플레이어는 자신이 조종하는 캐릭터의 영감을 사용할 수 있습니다. 채팅의 사용 버튼이나 Inspiration 토큰 액션을 클릭하세요.',
          'GM은 누가 사용했는지 알려 주는 메시지를 되돌리기 버튼과 함께 받습니다.',
          '플레이어가 !inspiration을 입력하면 자신의 캐릭터와 영감 보유 여부가 표시됩니다.',
          '영감 사용을 GM만 하게 하려면 플레이어 사용 허용을 끄세요.',
        ],
      },
      passOn: {
        heading: '넘겨주기 (2024 규칙)',
        points: [
          '캐릭터는 영웅적 영감을 두 번 가질 수 없습니다. 이미 가진 캐릭터가 다시 얻게 되면, 그 플레이어에게 영감이 없는 다른 파티원에게 넘겨주라고 묻습니다.',
          '선택지에는 영웅적 영감이 없는 모든 파티원과 포기가 있습니다. 한 시간 뒤에 만료됩니다.',
          '2014 규칙에서는 그 캐릭터가 이미 영감을 가지고 있다고 GM에게 알리기만 합니다.',
          '항상 그 메시지만 받으려면 넘겨주기를 끄세요.',
        ],
      },
      party: {
        heading: '파티',
        points: [
          '파티는 플레이어가 조종하는 모든 캐릭터입니다. 토큰을 선택하고 파티에 추가 또는 파티에서 제외를 클릭해 바꿀 수 있습니다.',
          'GM의 개요에는 파티원마다 주기, 회수, 사용 버튼이 있습니다.',
          '플레이어 파티 보기를 켜면 플레이어도 개요를 볼 수 있습니다. 사용 버튼은 자신의 캐릭터에만 표시됩니다.',
        ],
      },
      pools: {
        heading: '포인트 풀',
        points: [
          '포인트 풀은 쌓였다가 조금씩 사용하는 숫자입니다. 영감 포인트, 히어로 포인트, 행운, bennies 같은 것들의 풀입니다. 어떤 캐릭터 시트와도 작동합니다.',
          '추적 대상을 포인트 풀로 설정하면 주기, 회수, 사용이 기본 풀에 적용되며 포인트 수를 묻습니다. 캐릭터에게 포인트가 있는 동안 마커가 표시됩니다.',
          '부스트는 포인트를 사용해 굴림을 높입니다. 원하는 보너스를 입력하면 풀의 +1당 포인트에 따라 비용이 정해집니다. +1당 2포인트라면 보너스 4에는 8포인트가 듭니다. Mod는 사용을 알리기만 하므로 보너스는 직접 굴림에 더하세요.',
          '캐릭터의 포인트가 모자라면 사용이 거부됩니다. GM에게는 누가 무엇을 사용했는지 되돌리기 버튼과 함께 알림이 갑니다.',
          '저장 위치가 "시트의 자원 칸"이면 시트에서 풀과 같은 이름을 가진 자원 칸을 사용합니다. 예를 들어 2014 D&D 시트에서 Inspiration이라고 이름 붙인 Other Resource 칸입니다. 시트에 그 이름의 칸이 없거나 저장 위치가 "속성"이면 포인트는 inspiration_pool 같은 일반 속성에 저장됩니다. D&D 2024 시트는 항상 속성을 사용합니다.',
          '파티 카드와 플레이어 자신의 카드에는 각 캐릭터의 포인트가 저장된 위치(시트의 칸 이름 또는 속성)가 표시됩니다. 속성은 캐릭터 시트에 표시되지 않습니다.',
          '시트의 숫자를 직접 바꿔도 괜찮습니다. 마커가 따라 바뀝니다.',
          '풀을 클릭하면 기본 풀의 이름을 바꾸고, 비용과 최대치를 정하고, 풀을 더 추가할 수 있습니다. 다른 풀은 각 풀의 파티 버튼으로, 또는 명령어에 --pool과 풀 이름을 덧붙여 사용합니다.',
          'Bardic Inspiration은 별도의 풀로 쓸 수 있습니다. 풀 추가를 클릭해 Bardic Inspiration이라고 이름 붙이고, 최대치를 1로 정하고, 마커를 고릅니다. 바드가 주사위를 나눠 주면 GM이 그 풀의 파티 카드에서 1을 주고, 주사위를 가진 캐릭터는 쓸 때 사용을 클릭합니다. Mod는 누가 주사위를 가졌는지만 표시하며, 주사위는 플레이어가 직접 굴립니다.',
        ],
      },
      markers: {
        heading: '토큰 마커',
        points: [
          '마커 설정에서 마커를 고르세요. Roll20의 색깔 점, 기본 마커, 사용자 지정 마커 세트가 목록에 나옵니다.',
          '직접 또는 TokenMod로 토큰에 마커를 붙이면 캐릭터가 영감을 얻습니다. 떼면 사용한 것으로 칩니다.',
          '마커를 바꾸면 모든 토큰에서 즉시 옮겨집니다.',
          'D&D 2024 시트 자체의 상태 마커는 시트가 직접 설정하므로 선택지에 없습니다.',
        ],
      },
      commands: {
        heading: '명령어',
        intro:
          '모든 명령어는 !inspiration으로 시작합니다. --ids를 주지 않으면 명령어는 선택한 토큰에 적용됩니다.',
        mods: '다른 Mod도 이 명령어를 보낼 수 있습니다(예: ScriptCards). 다른 Mod는 InspirationTracker.give, spend, remove, isInspired를 호출할 수도 있습니다.',
        colCommand: '명령어',
        colDesc: '기능',
      },
      settings: {
        heading: '설정',
        intro: '설정 버튼으로 바꾸거나 !inspiration set <setting> <value>를 입력하세요.',
        colKey: '설정 키',
        colName: '이름',
        colDesc: '기능',
      },
      upgrading: {
        heading: '0.1에서 업그레이드',
        points: [
          '버전 0.1의 마커, 특수 효과, 효과 종류는 유지됩니다.',
          '0.1에서 직접 명령어를 정했다면 그 명령어도 !inspiration과 함께 계속 작동합니다.',
          '토큰을 선택한 상태에서 !inspiration을 입력하면 여전히 영감을 주거나 회수합니다.',
        ],
      },
      troubleshooting: {
        heading: '문제 해결',
        points: [
          '토큰에 마커가 보이지 않나요? 동기화를 클릭해 모든 시트를 다시 읽으세요.',
          '캐릭터를 나타내지 않는 토큰은 영감을 가질 수 없습니다. 먼저 캐릭터에 연결하세요.',
          '플레이어가 사용을 클릭해도 아무 일도 없나요? 캐릭터가 그 플레이어에게 할당되어 있는지 확인하세요.',
          '오류는 Mod Scripts 페이지의 API 콘솔에 기록됩니다.',
        ],
      },
      languages: {
        heading: '언어',
        body: 'InspirationTracker는 아래 언어로 번역되어 있습니다. 언어 설정에서 고르세요.',
        colCode: '코드',
        colName: '언어',
        colNative: '현지어 이름',
      },
      credits: {
        heading: '제작',
        original: '원본 Mod 제작:',
        maintainer: '버전 1 관리:',
        support: '버그와 아이디어는 Roll20 Mod 포럼이나 GitHub에 알려 주세요.',
      },
      footer: '모든 작업의 버튼은 "{deck}" 핸드아웃에 있습니다.',
    },
    deck: {
      subtitle: '명령 데크',
      selectedDesc: '토큰을 하나 이상 선택한 뒤 클릭하세요.',
      partyDesc: '누가 영감을 가졌는지 보고, 파티에 누구를 넣을지 고릅니다.',
      poolsTitle: '포인트 풀',
      poolsDesc: '추적 대상이 포인트 풀일 때: 토큰을 선택하고 클릭한 뒤 숫자를 입력하세요.',
      toolsDesc: '메뉴, 설정, 플레이어 매크로, 도움말.',
      footer: '자세한 설명은 "{help}" 핸드아웃에 있습니다.',
    },
  };

  const TRANSLATION$7 = {
    terms: {
      heroic: 'Bohaterska Inspiracja',
      classic: 'Inspiracja',
    },
    titles: {
      ready: 'InspirationTracker jest gotowy.',
      settings: 'Ustawienia InspirationTracker',
      help: 'Polecenia InspirationTracker',
      party: 'Inspiracja drużyny',
      poolParty: '{term} drużyny',
      pools: 'Pule punktów',
      yours: 'Twoje postacie',
      status: 'Stan InspirationTracker',
    },
    messages: {
      gained: '{name} zyskuje: {term}!',
      spent: '{name} wykorzystuje: {term}.',
      spentBy: '{player} wykorzystuje za postać {name}: {term}.',
      spentSheet: '{name} nie ma już: {term} (zmieniono na karcie lub żetonie).',
      restored: '{name} odzyskuje: {term}.',
      removed: 'Odebrano postaci {name}: {term}.',
      already: '{name} już ma: {term}.',
      none: '{name} nie ma: {term}.',
      busy: '{name} jest jeszcze aktualizowany. Spróbuj ponownie za chwilę.',
      passOffer:
        '{name} już ma: {term} i nie może mieć jej podwójnie. Przekaż ją członkowi drużyny, który jej nie ma, albo z niej zrezygnuj.',
      passNobody: 'Wszyscy pozostali członkowie drużyny już ją mają.',
      passAsked: 'Zapytano graczy postaci {name}, kto ma dostać: {term}.',
      passed: '{from} przekazuje postaci {to}: {term}!',
      passAlready: '{to} już ją ma. Wybierz kogoś innego.',
      declined: '{name} rezygnuje z nadmiarowej inspiracji ({term}).',
      undoAlready: '{name} znowu ją ma.',
      synced: 'Odczytane karty: {checked}. Z inspiracją: {inspired}.',
      migrated:
        'Zachowano ustawienia z wersji 0.1: znacznik, efekt specjalny i jego typ. Nowe ustawienia mają wartości domyślne.',
      legacyCommand: 'Twoje stare polecenie {command} nadal działa, podobnie jak {main}.',
      macroHint:
        'Aby dać graczom przycisk Wykorzystaj, uruchom {command}. Doda to akcję żetonu dla wszystkich.',
      macro:
        'Makro „{name}” jest gotowe: gracze widzą je jako akcję żetonu po zaznaczeniu żetonu, którym sterują.',
      journal: 'Odtworzono notatki Pomocy i Panelu poleceń.',
      readyHint: 'Wpisz {command}, aby otworzyć menu, albo otwórz notatkę Panelu poleceń.',
    },
    pool: {
      gained: '{name} zyskuje: {term} × {amount} ({before} → {after}).',
      spent: '{name} wykorzystuje: {term} × {amount} ({before} → {after}).',
      boosted:
        '{name} wykorzystuje: {term} × {amount}, aby dodać +{bonus} do rzutu ({before} → {after}).',
      spentBy: '{player} wykorzystuje za postać {name}: {term} × {amount}.',
      restored: '{name} odzyskuje: {term} × {amount} ({before} → {after}).',
      removed: 'Odebrano postaci {name}: {term} × {amount} ({before} → {after}).',
      none: '{name} nie ma: {term}.',
      short: '{name} ma: {term} × {have}, a potrzeba {need}.',
      full: '{name} ma już dozwolone maksimum ({max}): {term}.',
    },
    pools: {
      introFlag:
        'Śledzenie jest ustawione na pole inspiracji na karcie. Ustaw je na Pula punktów, aby Daj i Wykorzystaj działały na puli „{name}”. Innych pul używa się z --pool.',
      introPool:
        'Daj, Wykorzystaj i Wzmocnij działają na puli „{name}”. Innych pul używa się przyciskiem Drużyna danej puli albo z --pool.',
      defaultLabel: '{name} (domyślna)',
      name: 'Nazwa',
      source: 'Miejsce zapisu',
      cost: 'Punkty za +1',
      max: 'Maksimum',
      marker: 'Znacznik',
      attribute: 'Atrybut, gdy karta nie ma pola o tej nazwie: {attribute}',
      partyTotal: 'Suma drużyny: {term} × {total}.',
      keptBox: 'Pole na karcie: {name}',
      keptAttribute: 'Atrybut: {attribute}',
      keptNote: 'Atrybut nie jest pokazywany na karcie postaci.',
    },
    prompts: {
      points: 'Punkty',
      bonus: 'Premia do rzutu',
      max: 'Maksymalna liczba punktów (0 – bez limitu)',
    },
    errors: {
      unknownPool: 'Nie ma puli o nazwie „{value}”.',
      unknownPoolHint: 'Pule: {pools}.',
      badAmount: '„{value}” nie jest liczbą punktów.',
      badAmountHint: 'Użyj liczby całkowitej od 1 do 9999.',
      boostNoPool: 'Wzmocnij wydaje punkty z puli.',
      poolInvalid: 'Pula nie może mieć nazwy „{value}”.',
      poolExists: 'Pula o nazwie „{value}” już istnieje.',
      poolFull: 'Nie ma miejsca na kolejną pulę.',
      poolNameHint: 'Użyj nazwy do 40 liter, cyfr i spacji, której nie ma żadna inna pula.',
      poolDefault: 'Domyślnej puli „{name}” nie można usunąć. Można zmienić jej nazwę.',
      poolMarkerHint: 'Wybierz z zestawów znaczników znacznik inny niż ten z ustawienia Znacznik.',
      poolSetHint: 'Wpisz !inspiration pools, aby zobaczyć wszystkie pule i ich ustawienia.',
      denied: 'Nie możesz tego zrobić dla postaci {name}.',
      gmOnly: 'Tylko GM może użyć tego polecenia.',
      gmOnlyHint: 'Gracze mogą używać spend, party i help.',
      spendOff: 'GM wyłączył wykorzystywanie inspiracji przez graczy.',
      noCharacter: 'Te żetony nie reprezentują postaci: {names}.',
      nothingSelected: 'Najpierw zaznacz żeton.',
      nothingSelectedHint:
        'Zaznacz żetony reprezentujące postacie albo dodaj --ids z identyfikatorami żetonów lub postaci.',
      writeFailed: 'Nie udało się zmienić karty postaci {name}.',
      offerGone: 'Ten wybór został już dokonany albo wygasł.',
      passInvalid: 'Wybierz członka drużyny innego niż ten, który ją ma.',
      undoGone: 'To wykorzystanie zostało już cofnięte albo jest zbyt stare.',
      unknownMarker: 'Nie ma znacznika żetonu o nazwie „{value}”.',
      unknownMarkerHint:
        'Użyj przycisku Znacznik w ustawieniach, aby wybrać go z zestawów znaczników.',
      badSetting: 'Nie można ustawić {key} na „{value}”.',
      badSettingHint: 'Wpisz !inspiration set, aby zobaczyć wszystkie ustawienia i ich opcje.',
      unknownCommand: 'Nieznane polecenie: {command}.',
      unknownCommandHint: 'Wpisz !inspiration help, aby zobaczyć listę poleceń.',
    },
    menu: {
      selected: 'Zaznaczone żetony',
      party: 'Drużyna',
      tools: 'Narzędzia',
      hint: 'Pełne instrukcje są w notatce „{help}”.',
      noSheet: 'brak karty',
      noneYours: 'Nie sterujesz żadną postacią z kartą.',
      partyEmpty: 'Nie sterujesz żadnym członkiem drużyny.',
      partyEmptyGm:
        'W drużynie nie ma jeszcze nikogo. Przypisz postacie graczom albo zaznacz żetony i kliknij Dodaj do drużyny.',
      partyCount: '{term}: {count} z {total}.',
    },
    buttons: {
      menu: 'Menu',
      give: 'Daj',
      remove: 'Odbierz',
      toggle: 'Przełącz',
      spend: 'Wykorzystaj',
      party: 'Drużyna',
      partyAdd: 'Dodaj do drużyny',
      partyRemove: 'Usuń z drużyny',
      settings: 'Ustawienia',
      macro: 'Makro gracza',
      sync: 'Synchronizuj',
      status: 'Stan',
      help: 'Pomoc',
      reset: 'Resetuj ustawienia',
      refresh: 'Odśwież',
      undo: 'Cofnij',
      decline: 'Zrezygnuj',
      boost: 'Wzmocnij',
      pools: 'Pule',
      addPool: 'Dodaj pulę',
      deletePool: 'Usuń pulę',
    },
    values: {
      on: 'Wł.',
      off: 'Wył.',
      none: 'Brak',
      noLimit: 'Bez limitu',
      tracking: {
        flag: 'Pole inspiracji na karcie',
        pool: 'Pula punktów',
      },
      source: {
        resource: 'Pole zasobu na karcie',
        attribute: 'Atrybut',
      },
      wording: {
        2014: 'Inspiracja (2014)',
        2024: 'Bohaterska Inspiracja (2024)',
        auto: 'Z karty',
      },
      announce: {
        public: 'Wszyscy',
        gm: 'GM i właściciele',
        off: 'Nikt',
      },
    },
    settings: {
      language: {
        label: 'Język',
        desc: 'Język menu, komunikatów i notatek.',
      },
      tracking: {
        label: 'Śledzenie',
        desc: 'Na czym działają Daj i Wykorzystaj: na polu inspiracji na kartach D&D, którą postać ma albo jej nie ma, czy na puli punktów, które się gromadzi i wydaje po kilka naraz.',
      },
      marker: {
        label: 'Znacznik',
        desc: 'Znacznik żetonu widoczny, gdy postać ma inspirację. Własne zestawy znaczników też są na liście.',
      },
      wording: {
        label: 'Nazewnictwo',
        desc: 'Nazywaj ją Inspiracją lub Bohaterską Inspiracją. „Z karty” używa zasad wybranych na każdej karcie D&D 2024, a na karcie 2014 – Inspiracji.',
      },
      announce: {
        label: 'Ogłaszanie',
        desc: 'Kto widzi wiadomość na czacie, gdy inspiracja zostaje zdobyta lub wykorzystana.',
      },
      fx: {
        label: 'Efekt specjalny',
        desc: 'Odtwarza efekt specjalny na żetonie, gdy zyskuje on inspirację.',
      },
      fxType: {
        label: 'Typ efektu',
        desc: 'Który efekt odtworzyć, np. nova-holy, albo identyfikator własnego efektu.',
      },
      playerSpend: {
        label: 'Gracze mogą wykorzystywać',
        desc: 'Pozwala graczom wykorzystywać inspirację postaci, którymi sterują. GM dostaje powiadomienie z przyciskiem Cofnij.',
      },
      playerOverview: {
        label: 'Gracze widzą drużynę',
        desc: 'Pozwala graczom zobaczyć, kto w drużynie ma inspirację.',
      },
      passOn: {
        label: 'Przekazywanie (2024)',
        desc: 'Według zasad 2024 postać, która ma Bohaterską Inspirację i miałaby ją zyskać ponownie, może przekazać ją innemu członkowi drużyny.',
      },
    },
    status: {
      version: 'Wersja',
      beacon: 'Karty D&D 2024',
      legacy: 'Karty 2014',
      none: 'Postacie bez pola inspiracji',
      rules2024: 'Używają zasad 2024',
      party: 'Członkowie drużyny',
      tracking: 'Śledzenie',
      pools: 'Pule',
      marker: 'Znacznik',
      fx: 'Efekt specjalny',
      legacyCommand: 'Stare polecenie',
    },
    help: {
      menu: 'Pokazuje menu. Przy zaznaczonych żetonach daje lub odbiera inspirację, tak jak w wersji 0.1.',
      give: 'Daje inspirację zaznaczonym postaciom.',
      remove: 'Odbiera inspirację zaznaczonym postaciom, nie licząc tego jako wykorzystania.',
      toggle:
        'Daje inspirację zaznaczonym postaciom, które jej nie mają, i odbiera ją tym, które ją mają.',
      spend: 'Wykorzystuje inspirację zaznaczonych postaci i powiadamia GM.',
      party:
        'Pokazuje, kto w drużynie ma inspirację, z przyciskami do dawania, odbierania i wykorzystania.',
      partyEdit: 'Dodaje zaznaczone postacie do drużyny lub je z niej usuwa.',
      ids: 'Działa na podanych identyfikatorach żetonów lub postaci zamiast na zaznaczonych żetonach.',
      points:
        'Przy puli punktów: daje, odbiera lub wykorzystuje podaną liczbę punktów. Bez liczby: 1. remove all odbiera wszystkie punkty.',
      boost:
        'Przy puli punktów: wydaje punkty, aby dodać podaną premię do rzutu, według kosztu puli za każde +1.',
      poolFlag: 'Działa na wskazanej puli zamiast na domyślnej.',
      pools: 'Pokazuje pule punktów i ich ustawienia.',
      poolEdit: 'Dodaje pulę lub ją usuwa. Punkty na kartach pozostają bez zmian.',
      poolSet:
        'Zmienia pulę: jej nazwę, miejsce zapisu (resource lub attribute), liczbę punktów za każde +1, maksymalną liczbę punktów (0 – bez limitu) albo jej znacznik żetonu.',
      undo: 'Przywraca wykorzystaną inspirację. Identyfikator jest w wiadomości do GM o wykorzystaniu.',
      macro: 'Dodaje akcję żetonu „Inspiration”, którą gracze klikają, aby wykorzystać inspirację.',
      sync: 'Odczytuje ponownie wszystkie karty i poprawia znaczniki.',
      set: 'Pokazuje ustawienia lub zmienia jedno z nich.',
      reset: 'Przywraca wszystkie ustawienia do domyślnych, z wyjątkiem języka.',
      status: 'Pokazuje wersję, znalezione karty i główne ustawienia.',
      journal: 'Odtwarza notatki Pomocy i Panelu poleceń.',
      help: 'Pokazuje tę listę.',
    },
    helpPlayer: {
      menu: 'Pokazuje twoje postacie i to, czy mają inspirację.',
      spend: 'Wykorzystuje inspirację zaznaczonej postaci.',
      boost: 'Wydaje punkty z puli, aby dodać podaną premię do rzutu.',
      party: 'Pokazuje drużynę, jeśli GM na to pozwala.',
      help: 'Pokazuje tę listę.',
    },
    handout: {
      versionLabel: 'Wersja',
      subtitle: 'Inspiracja, Bohaterska Inspiracja i pule punktów do każdej gry',
      overview: {
        heading: 'Przegląd',
        body: 'InspirationTracker utrzymuje zgodność inspiracji D&D na karcie postaci, żetonie i czacie. Daj ją z menu, karty lub znacznika żetonu, a każdy żeton tej postaci pokaże znacznik. Gracze mogą ją wykorzystać jednym kliknięciem, a GM dostaje powiadomienie z przyciskiem Cofnij. Działa z kartą D&D 2024, gdzie nazywa się Bohaterską Inspiracją, oraz z kartą 2014 OGL.',
      },
      quickStart: {
        heading: 'Szybki start',
        steps: [
          'Otwórz notatkę Panelu poleceń albo wpisz !inspiration, aby otworzyć menu.',
          'Zaznacz żeton i kliknij Daj. Postać zyskuje inspirację, a jej żetony pokazują znacznik.',
          'Kliknij raz Makro gracza, aby gracze dostali akcję żetonu Inspiration do jej wykorzystania.',
          'Kliknij Drużyna, aby zobaczyć, kto ma inspirację.',
        ],
      },
      sheets: {
        heading: 'Karty postaci',
        colSheet: 'Karta',
        colWhere: 'Gdzie jest zapisana inspiracja',
        colSheet2014: 'D&D 5E by Roll20 (2014 OGL)',
        where2014: 'Pole Inspiracja, atrybut "inspiration".',
        colSheet2024: 'D&D Fifth Edition (5E & 5.5E, 2024)',
        where2024:
          'Pole Bohaterska Inspiracja, odczytywane i zapisywane przez getSheetItem i setSheetItem.',
        points: [
          'Zaznaczenie lub odznaczenie pola na karcie jest wykrywane od razu: znacznik podąża za nim, a odznaczenie liczy się jako wykorzystanie.',
          'Gdy Nazewnictwo ma wartość „Z karty”, każda postać D&D 2024 używa zasad wybranych w ustawieniach swojej karty: zasady 2024 mówią Bohaterska Inspiracja, zasady 2014 – Inspiracja.',
          'Postacie bez żadnej z tych kart są pomijane, więc żetony NPC nie są zmieniane.',
        ],
      },
      players: {
        heading: 'Gracze',
        points: [
          'Gracze mogą wykorzystywać inspirację postaci, którymi sterują: kliknij Wykorzystaj na czacie lub akcję żetonu Inspiration.',
          'GM dostaje wiadomość, kto ją wykorzystał, z przyciskiem Cofnij.',
          'Wpisanie !inspiration pokazuje graczowi jego postacie i to, czy mają inspirację.',
          'Wyłącz Gracze mogą wykorzystywać, aby wykorzystywanie zostało w rękach GM.',
        ],
      },
      passOn: {
        heading: 'Przekazywanie (zasady 2024)',
        points: [
          'Postać nie może mieć Bohaterskiej Inspiracji podwójnie. Gdy postać, która ją ma, miałaby ją zyskać ponownie, jej gracze są pytani, czy przekazać ją innemu członkowi drużyny, który jej nie ma.',
          'Wybór obejmuje każdego członka drużyny bez Bohaterskiej Inspiracji oraz Zrezygnuj. Wygasa po godzinie.',
          'Według zasad 2014 GM dostaje tylko informację, że postać już ma Inspirację.',
          'Wyłącz Przekazywanie, aby zawsze dostawać tylko tę wiadomość.',
        ],
      },
      party: {
        heading: 'Drużyna',
        points: [
          'Drużyna to wszystkie postacie, którymi sterują gracze. Zaznacz żetony i kliknij Dodaj do drużyny lub Usuń z drużyny, aby ją zmienić.',
          'Przegląd GM ma przyciski Daj, Odbierz i Wykorzystaj dla każdego członka.',
          'Włącz Gracze widzą drużynę, aby gracze też widzieli przegląd. Przyciski Wykorzystaj dostają tylko przy własnych postaciach.',
        ],
      },
      pools: {
        heading: 'Pule punktów',
        points: [
          'Pula punktów to liczba, która rośnie i jest wydawana po kilka punktów naraz: pula punktów inspiracji, punktów bohatera, szczęścia, bennies i tym podobnych. Działa z każdą kartą postaci.',
          'Ustaw Śledzenie na Pula punktów, a Daj, Odbierz i Wykorzystaj będą działać na domyślnej puli i pytać o liczbę punktów. Znacznik jest widoczny, dopóki postać ma jakiekolwiek punkty.',
          'Wzmocnij wydaje punkty, aby podnieść wynik rzutu: wpisz żądaną premię, a o koszcie decyduje ustawienie puli Punkty za +1. Przy 2 punktach za +1 premia 4 kosztuje 8 punktów. Mod ogłasza wydanie punktów; premię dodaj do rzutu samodzielnie.',
          'Wydanie punktów jest odrzucane, gdy postać ma ich za mało. GM dostaje informację, kto co wydał, z przyciskiem Cofnij.',
          'Miejsce zapisu „Pole zasobu na karcie” używa pola zasobu na karcie, które ma nazwę puli, na przykład pola Other Resource nazwanego Inspiration na karcie D&D 2014. Gdy karta nie ma pola o tej nazwie albo wybrano „Atrybut”, punkty są zapisywane w zwykłym atrybucie, takim jak inspiration_pool. Karta D&D 2024 zawsze używa atrybutu.',
          'Przegląd drużyny i własny przegląd gracza podają, gdzie zapisane są punkty każdej postaci: nazwa pola na karcie albo atrybut. Atrybut nie jest pokazywany na karcie postaci.',
          'Liczbę na karcie można zmieniać ręcznie: znacznik podąża za nią.',
          'Kliknij Pule, aby zmienić nazwę domyślnej puli, ustawić jej koszt i maksimum albo dodać kolejne pule. Innych pul używa się przyciskiem Drużyna danej puli albo przez dodanie do polecenia --pool i nazwy puli.',
          'Bardic Inspiration działa jako osobna pula: kliknij Dodaj pulę i nazwij ją Bardic Inspiration, ustaw jej Maksimum na 1 i wybierz jej Znacznik. GM daje 1 z przeglądu Drużyna tej puli, gdy bard rozdaje kość, a jej posiadacz klika Wykorzystaj, gdy jej używa. Mod oznacza, kto ma kość; gracz rzuca nią sam.',
        ],
      },
      markers: {
        heading: 'Znaczniki żetonów',
        points: [
          'Wybierz znacznik w ustawieniu Znacznik. Na liście są kolorowe kropki Roll20, domyślne znaczniki i twoje własne zestawy znaczników.',
          'Dodanie znacznika do żetonu ręcznie lub przez TokenMod daje postaci inspirację. Zdjęcie go oznacza wykorzystanie.',
          'Zmiana znacznika od razu przenosi go na każdym żetonie.',
          'Własne znaczniki stanów karty D&D 2024 nie są oferowane, bo karta ustawia je sama.',
        ],
      },
      commands: {
        heading: 'Polecenia',
        intro:
          'Każde polecenie zaczyna się od !inspiration. Polecenia działają na zaznaczonych żetonach, chyba że podano --ids.',
        mods: 'Inne Mody też mogą wysyłać te polecenia, na przykład ze ScriptCards. Inne Mody mogą także wywoływać InspirationTracker.give, spend, remove i isInspired.',
        colCommand: 'Polecenie',
        colDesc: 'Co robi',
      },
      settings: {
        heading: 'Ustawienia',
        intro: 'Zmieniaj je przyciskiem Ustawienia albo wpisz !inspiration set <setting> <value>.',
        colKey: 'Ustawienie',
        colName: 'Nazwa',
        colDesc: 'Co robi',
      },
      upgrading: {
        heading: 'Aktualizacja z 0.1',
        points: [
          'Znacznik, efekt specjalny i typ efektu z wersji 0.1 zostają zachowane.',
          'Jeśli w 0.1 wybrano własne polecenie, nadal działa obok !inspiration.',
          '!inspiration przy zaznaczonych żetonach nadal daje lub odbiera inspirację.',
        ],
      },
      troubleshooting: {
        heading: 'Rozwiązywanie problemów',
        points: [
          'Znacznik nie pojawia się na żetonie? Kliknij Synchronizuj, aby ponownie odczytać wszystkie karty.',
          'Żeton, który nie reprezentuje postaci, nie może mieć inspiracji. Najpierw połącz go z postacią.',
          'Nic się nie dzieje, gdy gracz klika Wykorzystaj? Sprawdź, czy postać jest przypisana do tego gracza.',
          'Błędy są zapisywane w konsoli API na stronie Mod Scripts.',
        ],
      },
      languages: {
        heading: 'Języki',
        body: 'InspirationTracker jest przetłumaczony na poniższe języki. Wybierz jeden w ustawieniu Język.',
        colCode: 'Kod',
        colName: 'Język',
        colNative: 'Nazwa rodzima',
      },
      credits: {
        heading: 'Autorzy',
        original: 'Autor oryginalnego Moda:',
        maintainer: 'Wersję 1 utrzymuje:',
        support: 'Zgłaszaj błędy i pomysły na forum Mod w Roll20 lub na GitHubie.',
      },
      footer: 'Przyciski do wszystkich działań są w notatce „{deck}”.',
    },
    deck: {
      subtitle: 'Panel poleceń',
      selectedDesc: 'Zaznacz jeden lub więcej żetonów, a potem kliknij.',
      partyDesc: 'Zobacz, kto ma inspirację, i wybierz, kto jest w drużynie.',
      poolsTitle: 'Pula punktów',
      poolsDesc:
        'Gdy Śledzenie jest ustawione na Pula punktów: zaznacz żetony, kliknij i wpisz liczbę.',
      toolsDesc: 'Menu, ustawienia, makro gracza i pomoc.',
      footer: 'Pełne instrukcje są w notatce „{help}”.',
    },
  };

  const TRANSLATION$6 = {
    terms: {
      heroic: 'Inspiração Heroica',
      classic: 'Inspiração',
    },
    titles: {
      ready: 'O InspirationTracker está pronto.',
      settings: 'Definições do InspirationTracker',
      help: 'Comandos do InspirationTracker',
      party: 'Inspiração do Grupo',
      poolParty: '{term} do Grupo',
      pools: 'Reservas de Pontos',
      yours: 'As Suas Personagens',
      status: 'Estado do InspirationTracker',
    },
    messages: {
      gained: '{name} tem {term}!',
      spent: '{name} usa {term}.',
      spentBy: '{player} gastou {term} por {name}.',
      spentSheet: '{name} já não tem {term} (alterado na ficha ou no token).',
      restored: '{name} recuperou {term}.',
      removed: '{term} retirada a {name}.',
      already: '{name} já tem {term}.',
      none: '{name} não tem {term}.',
      busy: '{name} ainda está a ser atualizado. Tente novamente daqui a pouco.',
      passOffer:
        '{name} já tem {term} e não a pode ter duas vezes. Dê-a a um membro do grupo que não a tenha, ou prescinda dela.',
      passNobody: 'Todos os outros membros do grupo já a têm.',
      passAsked: 'Perguntou-se aos jogadores de {name} quem deve receber a {term}.',
      passed: '{from} dá {term} a {to}!',
      passAlready: '{to} já a tem. Escolha outra pessoa.',
      declined: '{name} prescinde da {term} extra.',
      undoAlready: '{name} já a tem novamente.',
      synced: 'Fichas lidas: {checked}. Com inspiração: {inspired}.',
      migrated:
        'As definições da versão 0.1 foram mantidas: marcador, efeito especial e o seu tipo. As novas definições começam com os valores predefinidos.',
      legacyCommand: 'O seu comando antigo {command} continua a funcionar, tal como {main}.',
      macroHint:
        'Para dar aos jogadores um botão Gastar, execute {command}. Isto adiciona uma ação de token para todos.',
      macro:
        'A macro "{name}" está pronta: os jogadores veem-na como ação de token ao selecionarem um token que controlam.',
      journal: 'Folhetos de Ajuda e do Painel de Comandos recriados.',
      readyHint: 'Escreva {command} para abrir o menu, ou abra o folheto do Painel de Comandos.',
    },
    pool: {
      gained: '{name} ganha {amount} de {term} ({before} → {after}).',
      spent: '{name} gasta {amount} de {term} ({before} → {after}).',
      boosted: '{name} gasta {amount} de {term} para +{bonus} no lançamento ({before} → {after}).',
      spentBy: '{player} gastou {amount} de {term} por {name}.',
      restored: '{name} recuperou {amount} de {term} ({before} → {after}).',
      removed: '{amount} de {term} a menos para {name} ({before} → {after}).',
      none: '{name} não tem {term}.',
      short: '{name} tem {have} de {term}, e isso exige {need}.',
      full: '{name} já tem o máximo permitido de {term} ({max}).',
    },
    pools: {
      introFlag:
        'O Controlo está definido para o campo de inspiração da ficha. Mude-o para Reserva de pontos para que Dar e Gastar atuem sobre a reserva "{name}". As outras reservas usam-se com --pool.',
      introPool:
        'Dar, Gastar e Impulsionar atuam sobre "{name}". As outras reservas usam-se a partir do respetivo botão Grupo, ou com --pool.',
      defaultLabel: '{name} (predefinida)',
      name: 'Nome',
      source: 'Guardada em',
      cost: 'Pontos por +1',
      max: 'Máximo',
      marker: 'Marcador',
      attribute: 'Atributo quando a ficha não tem um campo com este nome: {attribute}',
      partyTotal: 'Total do grupo: {total} de {term}.',
      keptBox: 'Campo da ficha: {name}',
      keptAttribute: 'Atributo: {attribute}',
      keptNote: 'Um atributo não é mostrado na ficha da personagem.',
    },
    prompts: {
      points: 'Pontos',
      bonus: 'Bónus no lançamento',
      max: 'Máximo de pontos permitido (0 para sem limite)',
    },
    errors: {
      unknownPool: 'Não existe nenhuma reserva chamada "{value}".',
      unknownPoolHint: 'Reservas: {pools}.',
      badAmount: '"{value}" não é um número de pontos.',
      badAmountHint: 'Use um número inteiro de 1 a 9999.',
      boostNoPool: 'Impulsionar gasta pontos de uma reserva.',
      poolInvalid: 'Uma reserva não se pode chamar "{value}".',
      poolExists: 'Já existe uma reserva chamada "{value}".',
      poolFull: 'Não há espaço para mais uma reserva.',
      poolNameHint:
        'Use um nome com até 40 letras, algarismos e espaços que nenhuma outra reserva tenha.',
      poolDefault:
        'A reserva predefinida, "{name}", não pode ser eliminada. Pode mudar-lhe o nome.',
      poolMarkerHint:
        'Escolha, nos seus conjuntos de marcadores, um marcador diferente do da definição Marcador.',
      poolSetHint: 'Escreva !inspiration pools para ver todas as reservas e as suas definições.',
      denied: 'Não pode fazer isso por {name}.',
      gmOnly: 'Só o Mestre pode usar esse comando.',
      gmOnlyHint: 'Os jogadores podem usar spend, party e help.',
      spendOff: 'O Mestre desativou o gasto pelos jogadores.',
      noCharacter: 'Estes tokens não representam uma personagem: {names}.',
      nothingSelected: 'Selecione primeiro um token.',
      nothingSelectedHint:
        'Selecione tokens que representem personagens, ou adicione --ids com IDs de tokens ou de personagens.',
      writeFailed: 'Não foi possível alterar a ficha de {name}.',
      offerGone: 'Essa escolha já foi feita ou expirou.',
      passInvalid: 'Escolha um membro do grupo que não seja quem já a tem.',
      undoGone: 'Esse gasto já foi anulado ou é demasiado antigo.',
      unknownMarker: 'Não existe nenhum marcador de token chamado "{value}".',
      unknownMarkerHint:
        'Use o botão Marcador nas definições para escolher um dos seus conjuntos de marcadores.',
      badSetting: 'Não é possível definir {key} como "{value}".',
      badSettingHint: 'Escreva !inspiration set para ver todas as definições e as suas opções.',
      unknownCommand: 'Comando desconhecido: {command}.',
      unknownCommandHint: 'Escreva !inspiration help para ver a lista de comandos.',
    },
    menu: {
      selected: 'Tokens selecionados',
      party: 'Grupo',
      tools: 'Ferramentas',
      hint: 'As instruções completas estão no folheto "{help}".',
      noSheet: 'sem ficha',
      noneYours: 'Não controla nenhuma personagem com ficha.',
      partyEmpty: 'Não controla nenhum membro do grupo.',
      partyEmptyGm:
        'Ainda não há ninguém no grupo. Atribua personagens aos jogadores, ou selecione tokens e clique em Adicionar ao Grupo.',
      partyCount: '{count} de {total} têm {term}.',
    },
    buttons: {
      menu: 'Menu',
      give: 'Dar',
      remove: 'Retirar',
      toggle: 'Alternar',
      spend: 'Gastar',
      party: 'Grupo',
      partyAdd: 'Adicionar ao Grupo',
      partyRemove: 'Retirar do Grupo',
      settings: 'Definições',
      macro: 'Macro de Jogador',
      sync: 'Sincronizar',
      status: 'Estado',
      help: 'Ajuda',
      reset: 'Repor Definições',
      refresh: 'Atualizar',
      undo: 'Anular',
      decline: 'Prescindir',
      boost: 'Impulsionar',
      pools: 'Reservas',
      addPool: 'Adicionar Reserva',
      deletePool: 'Eliminar Reserva',
    },
    values: {
      on: 'Ligado',
      off: 'Desligado',
      none: 'Nenhum',
      noLimit: 'Sem limite',
      tracking: {
        flag: 'Campo de inspiração da ficha',
        pool: 'Reserva de pontos',
      },
      source: {
        resource: 'Campo de recurso da ficha',
        attribute: 'Atributo',
      },
      wording: {
        2014: 'Inspiração (2014)',
        2024: 'Inspiração Heroica (2024)',
        auto: 'Da ficha',
      },
      announce: {
        public: 'Todos',
        gm: 'Mestre e donos',
        off: 'Ninguém',
      },
    },
    settings: {
      language: {
        label: 'Idioma',
        desc: 'Idioma dos menus, mensagens e folhetos.',
      },
      tracking: {
        label: 'Controlo',
        desc: 'Aquilo sobre que Dar e Gastar atuam: o campo de inspiração das fichas de D&D, que a personagem tem ou não tem, ou uma reserva de pontos que se vai acumulando e se gasta aos poucos.',
      },
      marker: {
        label: 'Marcador',
        desc: 'Marcador de token mostrado enquanto a personagem tem inspiração. Os conjuntos de marcadores personalizados também aparecem na lista.',
      },
      wording: {
        label: 'Designação',
        desc: 'Chamar-lhe Inspiração ou Inspiração Heroica. "Da ficha" usa as regras escolhidas em cada ficha D&D 2024, e Inspiração na ficha 2014.',
      },
      announce: {
        label: 'Anunciar',
        desc: 'Quem vê a mensagem no chat quando a inspiração é ganha ou gasta.',
      },
      fx: {
        label: 'Efeito Especial',
        desc: 'Reproduz um efeito especial no token quando este ganha inspiração.',
      },
      fxType: {
        label: 'Tipo de Efeito',
        desc: 'Que efeito reproduzir, como nova-holy, ou o ID de um efeito personalizado.',
      },
      playerSpend: {
        label: 'Jogadores Podem Gastar',
        desc: 'Permite aos jogadores gastar a inspiração das personagens que controlam. O Mestre é avisado, com um botão Anular.',
      },
      playerOverview: {
        label: 'Jogadores Veem o Grupo',
        desc: 'Permite aos jogadores ver quem no grupo tem inspiração.',
      },
      passOn: {
        label: 'Passar (2024)',
        desc: 'Segundo as regras de 2024, uma personagem que ganharia Inspiração Heroica quando já a tem pode dá-la a outro membro do grupo.',
      },
    },
    status: {
      version: 'Versão',
      beacon: 'Fichas D&D 2024',
      legacy: 'Fichas 2014',
      none: 'Personagens sem campo de inspiração',
      rules2024: 'A usar as regras de 2024',
      party: 'Membros do grupo',
      tracking: 'Controlo',
      pools: 'Reservas',
      marker: 'Marcador',
      fx: 'Efeito especial',
      legacyCommand: 'Comando antigo',
    },
    help: {
      menu: 'Mostra o menu. Com tokens selecionados, dá ou retira inspiração, como na versão 0.1.',
      give: 'Dá inspiração às personagens selecionadas.',
      remove: 'Retira a inspiração às personagens selecionadas, sem contar como gasta.',
      toggle: 'Dá inspiração às personagens selecionadas que não a têm, e retira-a às que a têm.',
      spend: 'Gasta a inspiração das personagens selecionadas e avisa o Mestre.',
      party: 'Mostra quem no grupo tem inspiração, com botões para a dar, retirar ou gastar.',
      partyEdit: 'Adiciona as personagens selecionadas ao grupo, ou retira-as dele.',
      ids: 'Atua sobre os IDs de token ou de personagem indicados, em vez dos tokens selecionados.',
      points:
        'Com uma reserva de pontos: dá, retira ou gasta esse número de pontos. Sem número, 1. remove all retira todos os pontos.',
      boost:
        'Com uma reserva de pontos: gasta pontos para somar esse bónus a um lançamento, ao custo da reserva por cada +1.',
      poolFlag: 'Atua sobre a reserva indicada em vez da predefinida.',
      pools: 'Mostra as reservas de pontos e as suas definições.',
      poolEdit: 'Adiciona uma reserva, ou elimina uma. Os pontos nas fichas ficam como estão.',
      poolSet:
        'Altera uma reserva: o nome, onde é guardada (resource ou attribute), os pontos que cada +1 custa, o máximo de pontos permitido (0 para sem limite) ou o marcador de token.',
      undo: 'Devolve a inspiração gasta. O ID vem da mensagem ao Mestre sobre o gasto.',
      macro:
        'Adiciona a ação de token "Inspiration", na qual os jogadores clicam para gastar inspiração.',
      sync: 'Lê novamente todas as fichas e corrige os marcadores.',
      set: 'Mostra as definições, ou altera uma.',
      reset: 'Repõe todas as definições nos valores predefinidos, exceto o idioma.',
      status: 'Mostra a versão, as fichas encontradas e as principais definições.',
      journal: 'Recria os folhetos de Ajuda e do Painel de Comandos.',
      help: 'Mostra esta lista.',
    },
    helpPlayer: {
      menu: 'Mostra as suas personagens e se têm inspiração.',
      spend: 'Gasta a inspiração da personagem selecionada.',
      boost: 'Gasta pontos de uma reserva para somar esse bónus a um lançamento.',
      party: 'Mostra o grupo, se o Mestre o permitir.',
      help: 'Mostra esta lista.',
    },
    handout: {
      versionLabel: 'Versão',
      subtitle: 'Inspiração, Inspiração Heroica e reservas de pontos para qualquer jogo',
      overview: {
        heading: 'Visão Geral',
        body: 'O InspirationTracker mantém a inspiração de D&D em sintonia entre a ficha da personagem, o token e o chat. Dê-a pelo menu, pela ficha ou pelo marcador do token, e todos os tokens dessa personagem mostram o marcador. Os jogadores podem gastá-la com um clique, e o Mestre é avisado, com um botão Anular. Funciona com a ficha D&D 2024, onde se chama Inspiração Heroica, e com a ficha 2014 OGL.',
      },
      quickStart: {
        heading: 'Início Rápido',
        steps: [
          'Abra o folheto do Painel de Comandos, ou escreva !inspiration para abrir o menu.',
          'Selecione um token e clique em Dar. A personagem ganha inspiração e os seus tokens mostram o marcador.',
          'Clique uma vez em Macro de Jogador, para que os jogadores tenham uma ação de token Inspiration para a gastar.',
          'Clique em Grupo para ver quem tem inspiração.',
        ],
      },
      sheets: {
        heading: 'Fichas de Personagem',
        colSheet: 'Ficha',
        colWhere: 'Onde a inspiração é guardada',
        colSheet2014: 'D&D 5E by Roll20 (2014 OGL)',
        where2014: 'O campo Inspiração, atributo "inspiration".',
        colSheet2024: 'D&D Fifth Edition (5E & 5.5E, 2024)',
        where2024: 'O campo Inspiração Heroica, lido e escrito com getSheetItem e setSheetItem.',
        points: [
          'Marcar ou desmarcar o campo numa ficha é detetado de imediato: o marcador acompanha, e desmarcar conta como gastar.',
          'Com Designação em "Da ficha", cada personagem D&D 2024 usa as regras escolhidas nas definições da sua ficha: as regras de 2024 dizem Inspiração Heroica, as de 2014 dizem Inspiração.',
          'As personagens sem nenhuma destas fichas são ignoradas, pelo que os tokens de NPC não são alterados.',
        ],
      },
      players: {
        heading: 'Jogadores',
        points: [
          'Os jogadores podem gastar a inspiração das personagens que controlam: cliquem em Gastar no chat, ou na ação de token Inspiration.',
          'O Mestre recebe uma mensagem a dizer quem a gastou, com um botão Anular.',
          'Escrever !inspiration mostra ao jogador as suas personagens e se têm inspiração.',
          'Desligue Jogadores Podem Gastar para deixar o gasto nas mãos do Mestre.',
        ],
      },
      passOn: {
        heading: 'Passar a Outro (Regras de 2024)',
        points: [
          'Uma personagem não pode ter Inspiração Heroica duas vezes. Quando uma que já a tem a ganharia de novo, os seus jogadores são convidados a dá-la a outro membro do grupo que não a tenha.',
          'A escolha apresenta todos os membros do grupo sem Inspiração Heroica, e Prescindir. Expira ao fim de uma hora.',
          'Segundo as regras de 2014, o Mestre é apenas avisado de que a personagem já tem Inspiração.',
          'Desligue Passar para receber sempre essa mensagem.',
        ],
      },
      party: {
        heading: 'O Grupo',
        points: [
          'O grupo é composto por todas as personagens que um jogador controla. Selecione tokens e clique em Adicionar ao Grupo ou Retirar do Grupo para o alterar.',
          'A vista geral do Mestre tem botões Dar, Retirar e Gastar para cada membro.',
          'Ligue Jogadores Veem o Grupo para que os jogadores também vejam a vista geral. Só recebem botões Gastar para as suas próprias personagens.',
        ],
      },
      pools: {
        heading: 'Reservas de Pontos',
        points: [
          'Uma reserva de pontos é um número que se vai acumulando e se gasta aos poucos: uma reserva de pontos de inspiração, pontos de herói, sorte, bennies e afins. Funciona com qualquer ficha de personagem.',
          'Defina Controlo como Reserva de pontos, e Dar, Retirar e Gastar passam a atuar sobre a reserva predefinida, perguntando quantos pontos. O marcador fica visível enquanto a personagem tiver pontos.',
          'Impulsionar gasta pontos para aumentar um lançamento: escreva o bónus pretendido, e o valor de Pontos por +1 da reserva determina o custo. A 2 pontos por +1, um bónus de 4 custa 8 pontos. O Mod anuncia o gasto; some o bónus ao lançamento por si.',
          'Um gasto é recusado quando a personagem não tem pontos suficientes. O Mestre é avisado de quem gastou o quê, com um botão Anular.',
          'Guardada em "Campo de recurso da ficha" usa o campo de recurso da ficha que tem o nome da reserva, como um campo Other Resource chamado Inspiration na ficha D&D 2014. Quando a ficha não tem um campo com esse nome, ou com "Atributo", os pontos são guardados num atributo simples, como inspiration_pool. A ficha D&D 2024 usa sempre o atributo.',
          'O cartão do grupo e o cartão do próprio jogador dizem onde ficam guardados os pontos de cada personagem: o nome do campo da ficha, ou o atributo. Um atributo não é mostrado na ficha da personagem.',
          'Não há problema em alterar à mão o número na ficha: o marcador acompanha.',
          'Clique em Reservas para mudar o nome da reserva predefinida, definir o seu custo e o seu máximo, ou acrescentar mais reservas. As outras reservas usam-se a partir do respetivo botão Grupo, ou acrescentando --pool e o nome da reserva a um comando.',
          'Bardic Inspiration funciona como uma reserva própria: clique em Adicionar Reserva e dê-lhe o nome Bardic Inspiration, defina o Máximo como 1 e escolha o Marcador. O GM dá 1 a partir do cartão Grupo dessa reserva quando o bardo distribui um dado, e quem o tem clica em Gastar quando o usa. O Mod marca quem tem um dado; o jogador lança-o por si.',
        ],
      },
      markers: {
        heading: 'Marcadores de Token',
        points: [
          'Escolha o marcador na definição Marcador. Os pontos coloridos do Roll20, os marcadores predefinidos e os seus conjuntos personalizados aparecem na lista.',
          'Adicionar o marcador a um token à mão, ou com o TokenMod, dá inspiração à personagem. Retirá-lo conta como gastar.',
          'Mudar o marcador move-o de imediato em todos os tokens.',
          'Os marcadores de condição próprios da ficha D&D 2024 não são oferecidos, porque a ficha define-os ela própria.',
        ],
      },
      commands: {
        heading: 'Comandos',
        intro:
          'Todos os comandos começam por !inspiration. Os comandos atuam sobre os tokens selecionados, a menos que se indique --ids.',
        mods: 'Outros Mods também podem enviar estes comandos, por exemplo a partir do ScriptCards. Outros Mods podem ainda chamar InspirationTracker.give, spend, remove e isInspired.',
        colCommand: 'Comando',
        colDesc: 'O que faz',
      },
      settings: {
        heading: 'Definições',
        intro: 'Altere-as com o botão Definições, ou escreva !inspiration set <setting> <value>.',
        colKey: 'Definição',
        colName: 'Nome',
        colDesc: 'O que faz',
      },
      upgrading: {
        heading: 'Atualizar a partir da 0.1',
        points: [
          'O marcador, o efeito especial e o tipo de efeito da versão 0.1 são mantidos.',
          'Se escolheu o seu próprio comando na 0.1, este continua a funcionar a par de !inspiration.',
          '!inspiration com tokens selecionados continua a dar ou retirar inspiração.',
        ],
      },
      troubleshooting: {
        heading: 'Resolução de Problemas',
        points: [
          'O marcador não aparece num token? Clique em Sincronizar para ler novamente todas as fichas.',
          'Um token que não representa uma personagem não pode ter inspiração. Associe-o primeiro a uma personagem.',
          'Não acontece nada quando um jogador clica em Gastar? Verifique se a personagem está atribuída a esse jogador.',
          'Os erros são escritos na consola da API, na página Mod Scripts.',
        ],
      },
      languages: {
        heading: 'Idiomas',
        body: 'O InspirationTracker está traduzido para os idiomas abaixo. Escolha um na definição Idioma.',
        colCode: 'Código',
        colName: 'Idioma',
        colNative: 'Nome nativo',
      },
      credits: {
        heading: 'Créditos',
        original: 'Mod original de',
        maintainer: 'Versão 1 mantida por',
        support: 'Comunique erros e ideias no fórum de Mods do Roll20 ou no GitHub.',
      },
      footer: 'Os botões para todas as ações estão no folheto "{deck}".',
    },
    deck: {
      subtitle: 'Painel de Comandos',
      selectedDesc: 'Selecione um ou mais tokens e depois clique.',
      partyDesc: 'Veja quem tem inspiração e escolha quem faz parte do grupo.',
      poolsTitle: 'Reserva de pontos',
      poolsDesc: 'Com Controlo em Reserva de pontos: selecione tokens, clique e escreva o número.',
      toolsDesc: 'Menu, definições, a macro de jogador e a ajuda.',
      footer: 'As instruções completas estão no folheto "{help}".',
    },
  };

  const TRANSLATION$5 = {
    terms: {
      heroic: 'Inspiração Heroica',
      classic: 'Inspiração',
    },
    titles: {
      ready: 'InspirationTracker está pronto.',
      settings: 'Configurações do InspirationTracker',
      help: 'Comandos do InspirationTracker',
      party: 'Inspiração do Grupo',
      poolParty: '{term} do Grupo',
      pools: 'Reservas de Pontos',
      yours: 'Seus Personagens',
      status: 'Status do InspirationTracker',
    },
    messages: {
      gained: '{name} tem {term}!',
      spent: '{name} usa {term}.',
      spentBy: '{player} gastou {term} por {name}.',
      spentSheet: '{name} não tem mais {term} (alterado na ficha ou no token).',
      restored: '{name} tem {term} de volta.',
      removed: '{term} retirada de {name}.',
      already: '{name} já tem {term}.',
      none: '{name} não tem {term}.',
      busy: '{name} ainda está sendo atualizado. Tente de novo em instantes.',
      passOffer:
        '{name} já tem {term} e não pode tê-la duas vezes. Dê a um membro do grupo que não a tenha, ou abra mão dela.',
      passNobody: 'Todos os outros membros do grupo já a têm.',
      passAsked: 'Os jogadores de {name} foram perguntados sobre quem deve receber a {term}.',
      passed: '{from} dá {term} para {to}!',
      passAlready: '{to} já a tem. Escolha outra pessoa.',
      declined: '{name} abre mão da {term} extra.',
      undoAlready: '{name} já a tem de novo.',
      synced: 'Fichas lidas: {checked}. Com inspiração: {inspired}.',
      migrated:
        'As configurações da versão 0.1 foram mantidas: marcador, efeito especial e seu tipo. As novas configurações começam com os valores padrão.',
      legacyCommand: 'Seu comando antigo {command} ainda funciona, assim como {main}.',
      macroHint:
        'Para dar aos jogadores um botão Gastar, execute {command}. Isso adiciona uma ação de token para todos.',
      macro:
        'A macro "{name}" está pronta: os jogadores a veem como ação de token ao selecionar um token que controlam.',
      journal: 'Handouts de Ajuda e do Painel de Comandos recriados.',
      readyHint: 'Digite {command} para o menu, ou abra o handout do Painel de Comandos.',
    },
    pool: {
      gained: '{name} ganha {amount} de {term} ({before} → {after}).',
      spent: '{name} gasta {amount} de {term} ({before} → {after}).',
      boosted: '{name} gasta {amount} de {term} para +{bonus} na rolagem ({before} → {after}).',
      spentBy: '{player} gastou {amount} de {term} por {name}.',
      restored: '{name} tem {amount} de {term} de volta ({before} → {after}).',
      removed: '{amount} de {term} a menos para {name} ({before} → {after}).',
      none: '{name} não tem {term}.',
      short: '{name} tem {have} de {term}, e isso exige {need}.',
      full: '{name} já tem o máximo permitido de {term} ({max}).',
    },
    pools: {
      introFlag:
        'O Controle está definido como o campo de inspiração da ficha. Mude para Reserva de pontos para que Dar e Gastar ajam sobre a reserva "{name}". As outras reservas são usadas com --pool.',
      introPool:
        'Dar, Gastar e Impulsionar agem sobre "{name}". As outras reservas são usadas pelo botão Grupo de cada uma, ou com --pool.',
      defaultLabel: '{name} (padrão)',
      name: 'Nome',
      source: 'Guardada em',
      cost: 'Pontos por +1',
      max: 'Máximo',
      marker: 'Marcador',
      attribute: 'Atributo quando a ficha não tem um campo com este nome: {attribute}',
      partyTotal: 'Total do grupo: {total} de {term}.',
      keptBox: 'Campo da ficha: {name}',
      keptAttribute: 'Atributo: {attribute}',
      keptNote: 'Um atributo não aparece na ficha do personagem.',
    },
    prompts: {
      points: 'Pontos',
      bonus: 'Bônus na rolagem',
      max: 'Máximo de pontos permitido (0 para sem limite)',
    },
    errors: {
      unknownPool: 'Não existe reserva chamada "{value}".',
      unknownPoolHint: 'Reservas: {pools}.',
      badAmount: '"{value}" não é uma quantidade de pontos.',
      badAmountHint: 'Use um número inteiro de 1 a 9999.',
      boostNoPool: 'Impulsionar gasta pontos de uma reserva.',
      poolInvalid: 'Uma reserva não pode se chamar "{value}".',
      poolExists: 'Já existe uma reserva chamada "{value}".',
      poolFull: 'Não há espaço para mais uma reserva.',
      poolNameHint:
        'Use um nome de até 40 letras, dígitos e espaços que nenhuma outra reserva tenha.',
      poolDefault: 'A reserva padrão, "{name}", não pode ser excluída. Ela pode ser renomeada.',
      poolMarkerHint:
        'Escolha, nos seus conjuntos de marcadores, um marcador diferente do definido na configuração Marcador.',
      poolSetHint: 'Digite !inspiration pools para ver todas as reservas e suas configurações.',
      denied: 'Você não pode fazer isso por {name}.',
      gmOnly: 'Apenas o Mestre pode usar esse comando.',
      gmOnlyHint: 'Os jogadores podem usar spend, party e help.',
      spendOff: 'O Mestre desativou o gasto pelos jogadores.',
      noCharacter: 'Estes tokens não representam um personagem: {names}.',
      nothingSelected: 'Selecione um token primeiro.',
      nothingSelectedHint:
        'Selecione tokens que representem personagens, ou adicione --ids com IDs de tokens ou personagens.',
      writeFailed: 'Não foi possível alterar a ficha de {name}.',
      offerGone: 'Essa escolha já foi feita ou expirou.',
      passInvalid: 'Escolha um membro do grupo diferente de quem já a tem.',
      undoGone: 'Esse gasto já foi desfeito ou é antigo demais.',
      unknownMarker: 'Não existe marcador de token chamado "{value}".',
      unknownMarkerHint:
        'Use o botão Marcador nas configurações para escolher um dos seus conjuntos de marcadores.',
      badSetting: 'Não é possível definir {key} como "{value}".',
      badSettingHint: 'Digite !inspiration set para ver todas as configurações e suas opções.',
      unknownCommand: 'Comando desconhecido: {command}.',
      unknownCommandHint: 'Digite !inspiration help para ver a lista de comandos.',
    },
    menu: {
      selected: 'Tokens selecionados',
      party: 'Grupo',
      tools: 'Ferramentas',
      hint: 'As instruções completas estão no handout "{help}".',
      noSheet: 'sem ficha',
      noneYours: 'Você não controla nenhum personagem com ficha.',
      partyEmpty: 'Você não controla nenhum membro do grupo.',
      partyEmptyGm:
        'Ainda não há ninguém no grupo. Atribua personagens aos jogadores, ou selecione tokens e clique em Adicionar ao Grupo.',
      partyCount: '{count} de {total} têm {term}.',
    },
    buttons: {
      menu: 'Menu',
      give: 'Dar',
      remove: 'Remover',
      toggle: 'Alternar',
      spend: 'Gastar',
      party: 'Grupo',
      partyAdd: 'Adicionar ao Grupo',
      partyRemove: 'Remover do Grupo',
      settings: 'Configurações',
      macro: 'Macro de Jogador',
      sync: 'Sincronizar',
      status: 'Status',
      help: 'Ajuda',
      reset: 'Redefinir Configurações',
      refresh: 'Atualizar',
      undo: 'Desfazer',
      decline: 'Abrir mão',
      boost: 'Impulsionar',
      pools: 'Reservas',
      addPool: 'Adicionar Reserva',
      deletePool: 'Excluir Reserva',
    },
    values: {
      on: 'Ligado',
      off: 'Desligado',
      none: 'Nenhum',
      noLimit: 'Sem limite',
      tracking: {
        flag: 'Campo de inspiração da ficha',
        pool: 'Reserva de pontos',
      },
      source: {
        resource: 'Campo de recurso da ficha',
        attribute: 'Atributo',
      },
      wording: {
        2014: 'Inspiração (2014)',
        2024: 'Inspiração Heroica (2024)',
        auto: 'Da ficha',
      },
      announce: {
        public: 'Todos',
        gm: 'Mestre e donos',
        off: 'Ninguém',
      },
    },
    settings: {
      language: {
        label: 'Idioma',
        desc: 'Idioma dos menus, mensagens e handouts.',
      },
      tracking: {
        label: 'Controle',
        desc: 'Sobre o que Dar e Gastar agem: o campo de inspiração das fichas de D&D, que o personagem tem ou não tem, ou uma reserva de pontos que se acumula e é gasta aos poucos.',
      },
      marker: {
        label: 'Marcador',
        desc: 'Marcador de token exibido enquanto o personagem tem inspiração. Conjuntos de marcadores personalizados também aparecem na lista.',
      },
      wording: {
        label: 'Nomenclatura',
        desc: 'Chamar de Inspiração ou Inspiração Heroica. "Da ficha" usa as regras escolhidas em cada ficha D&D 2024, e Inspiração na ficha 2014.',
      },
      announce: {
        label: 'Anunciar',
        desc: 'Quem vê a mensagem no chat quando a inspiração é ganha ou gasta.',
      },
      fx: {
        label: 'Efeito Especial',
        desc: 'Exibe um efeito especial no token quando ele ganha inspiração.',
      },
      fxType: {
        label: 'Tipo de Efeito',
        desc: 'Qual efeito exibir, como nova-holy, ou o ID de um efeito personalizado.',
      },
      playerSpend: {
        label: 'Jogadores Podem Gastar',
        desc: 'Permite que os jogadores gastem a inspiração dos personagens que controlam. O Mestre é avisado, com um botão Desfazer.',
      },
      playerOverview: {
        label: 'Jogadores Veem o Grupo',
        desc: 'Permite que os jogadores vejam quem no grupo tem inspiração.',
      },
      passOn: {
        label: 'Repassar (2024)',
        desc: 'Pelas regras de 2024, um personagem que ganharia Inspiração Heroica já tendo uma pode dá-la a outro membro do grupo.',
      },
    },
    status: {
      version: 'Versão',
      beacon: 'Fichas D&D 2024',
      legacy: 'Fichas 2014',
      none: 'Personagens sem campo de inspiração',
      rules2024: 'Usando regras de 2024',
      party: 'Membros do grupo',
      tracking: 'Controle',
      pools: 'Reservas',
      marker: 'Marcador',
      fx: 'Efeito especial',
      legacyCommand: 'Comando antigo',
    },
    help: {
      menu: 'Mostra o menu. Com tokens selecionados, dá ou retira inspiração, como na versão 0.1.',
      give: 'Dá inspiração aos personagens selecionados.',
      remove: 'Retira a inspiração dos personagens selecionados, sem contar como gasta.',
      toggle: 'Dá inspiração aos personagens selecionados que não a têm e retira dos que a têm.',
      spend: 'Gasta a inspiração dos personagens selecionados e avisa o Mestre.',
      party: 'Mostra quem no grupo tem inspiração, com botões para dar, remover ou gastar.',
      partyEdit: 'Adiciona os personagens selecionados ao grupo, ou os retira dele.',
      ids: 'Age sobre os IDs de token ou personagem informados em vez dos tokens selecionados.',
      points:
        'Com uma reserva de pontos: dá, retira ou gasta essa quantidade de pontos. Sem número, 1. remove all retira todos os pontos.',
      boost:
        'Com uma reserva de pontos: gasta pontos para somar esse bônus a uma rolagem, pelo custo da reserva para cada +1.',
      poolFlag: 'Age sobre a reserva indicada em vez da padrão.',
      pools: 'Mostra as reservas de pontos e suas configurações.',
      poolEdit: 'Adiciona uma reserva, ou exclui uma. Os pontos nas fichas ficam como estão.',
      poolSet:
        'Altera uma reserva: o nome, onde é guardada (resource ou attribute), os pontos que cada +1 custa, o máximo de pontos permitido (0 para sem limite) ou o marcador de token.',
      undo: 'Devolve a inspiração gasta. O ID vem da mensagem ao Mestre sobre o gasto.',
      macro:
        'Adiciona a ação de token "Inspiration", que os jogadores clicam para gastar inspiração.',
      sync: 'Lê todas as fichas de novo e acerta os marcadores.',
      set: 'Mostra as configurações, ou altera uma.',
      reset: 'Volta todas as configurações ao padrão, exceto o idioma.',
      status: 'Mostra a versão, as fichas encontradas e as principais configurações.',
      journal: 'Recria os handouts de Ajuda e do Painel de Comandos.',
      help: 'Mostra esta lista.',
    },
    helpPlayer: {
      menu: 'Mostra seus personagens e se eles têm inspiração.',
      spend: 'Gasta a inspiração do personagem selecionado.',
      boost: 'Gasta pontos de uma reserva para somar esse bônus a uma rolagem.',
      party: 'Mostra o grupo, se o Mestre permitir.',
      help: 'Mostra esta lista.',
    },
    handout: {
      versionLabel: 'Versão',
      subtitle: 'Inspiração, Inspiração Heroica e reservas de pontos para qualquer jogo',
      overview: {
        heading: 'Visão Geral',
        body: 'O InspirationTracker mantém a inspiração de D&D sincronizada entre a ficha do personagem, o token e o chat. Dê inspiração pelo menu, pela ficha ou pelo marcador do token, e todos os tokens daquele personagem mostram o marcador. Os jogadores podem gastá-la com um clique, e o Mestre é avisado, com um botão Desfazer. Funciona com a ficha D&D 2024, onde se chama Inspiração Heroica, e com a ficha 2014 OGL.',
      },
      quickStart: {
        heading: 'Início Rápido',
        steps: [
          'Abra o handout do Painel de Comandos, ou digite !inspiration para o menu.',
          'Selecione um token e clique em Dar. O personagem ganha inspiração e seus tokens mostram o marcador.',
          'Clique em Macro de Jogador uma vez, para que os jogadores tenham uma ação de token Inspiration para gastá-la.',
          'Clique em Grupo para ver quem tem inspiração.',
        ],
      },
      sheets: {
        heading: 'Fichas de Personagem',
        colSheet: 'Ficha',
        colWhere: 'Onde a inspiração fica guardada',
        colSheet2014: 'D&D 5E by Roll20 (2014 OGL)',
        where2014: 'O campo Inspiração, atributo "inspiration".',
        colSheet2024: 'D&D Fifth Edition (5E & 5.5E, 2024)',
        where2024: 'O campo Inspiração Heroica, lido e gravado com getSheetItem e setSheetItem.',
        points: [
          'Marcar ou desmarcar o campo na ficha é percebido na hora: o marcador acompanha, e desmarcar conta como gastar.',
          'Com Nomenclatura em "Da ficha", cada personagem D&D 2024 usa as regras escolhidas nas configurações da ficha: as regras de 2024 dizem Inspiração Heroica, as de 2014 dizem Inspiração.',
          'Personagens sem nenhuma das duas fichas são ignorados, então tokens de NPC não são alterados.',
        ],
      },
      players: {
        heading: 'Jogadores',
        points: [
          'Os jogadores podem gastar a inspiração dos personagens que controlam: clique em Gastar no chat, ou na ação de token Inspiration.',
          'O Mestre recebe uma mensagem dizendo quem gastou, com um botão Desfazer.',
          'Digitar !inspiration mostra ao jogador seus personagens e se eles têm inspiração.',
          'Desligue Jogadores Podem Gastar para deixar o gasto nas mãos do Mestre.',
        ],
      },
      passOn: {
        heading: 'Repassando (Regras de 2024)',
        points: [
          'Um personagem não pode ter Inspiração Heroica duas vezes. Quando quem já a tem ganharia de novo, seus jogadores são convidados a dá-la a outro membro do grupo que não a tenha.',
          'A escolha oferece todos os membros do grupo sem Inspiração Heroica, e Abrir mão. Expira depois de uma hora.',
          'Pelas regras de 2014, o Mestre só é avisado de que o personagem já tem Inspiração.',
          'Desligue Repassar para receber sempre essa mensagem.',
        ],
      },
      party: {
        heading: 'O Grupo',
        points: [
          'O grupo é todo personagem controlado por um jogador. Selecione tokens e clique em Adicionar ao Grupo ou Remover do Grupo para alterá-lo.',
          'O resumo do Mestre tem botões Dar, Remover e Gastar para cada membro.',
          'Ligue Jogadores Veem o Grupo para que os jogadores também vejam o resumo. Eles só recebem botões Gastar para os próprios personagens.',
        ],
      },
      pools: {
        heading: 'Reservas de Pontos',
        points: [
          'Uma reserva de pontos é um número que se acumula e é gasto aos poucos: uma reserva de pontos de inspiração, pontos de herói, sorte, bennies e afins. Funciona com qualquer ficha de personagem.',
          'Defina Controle como Reserva de pontos, e Dar, Remover e Gastar passam a agir sobre a reserva padrão, perguntando quantos pontos. O marcador aparece enquanto o personagem tiver algum ponto.',
          'Impulsionar gasta pontos para aumentar uma rolagem: digite o bônus desejado, e o valor de Pontos por +1 da reserva decide o custo. A 2 pontos por +1, um bônus de 4 custa 8 pontos. O Mod anuncia o gasto; some o bônus à rolagem você mesmo.',
          'Um gasto é recusado quando o personagem não tem pontos suficientes. O Mestre é avisado de quem gastou o quê, com um botão Desfazer.',
          'Guardada em "Campo de recurso da ficha" usa o campo de recurso da ficha que tem o nome da reserva, como um campo Other Resource chamado Inspiration na ficha D&D 2014. Quando a ficha não tem um campo com esse nome, ou com "Atributo", os pontos ficam guardados em um atributo simples, como inspiration_pool. A ficha D&D 2024 sempre usa o atributo.',
          'O cartão do grupo e o cartão do próprio jogador dizem onde os pontos de cada personagem ficam guardados: o nome do campo da ficha, ou o atributo. Um atributo não aparece na ficha do personagem.',
          'Alterar o número na ficha manualmente não tem problema: o marcador acompanha.',
          'Clique em Reservas para renomear a reserva padrão, definir seu custo e seu máximo, ou adicionar mais reservas. As outras reservas são usadas pelo botão Grupo de cada uma, ou adicionando --pool e o nome da reserva a um comando.',
          'Bardic Inspiration funciona como uma reserva própria: clique em Adicionar Reserva e dê a ela o nome Bardic Inspiration, defina o Máximo como 1 e escolha o Marcador. O GM dá 1 pelo cartão Grupo dessa reserva quando o bardo distribui um dado, e quem o tem clica em Gastar quando o usa. O Mod marca quem tem um dado; o jogador o rola por conta própria.',
        ],
      },
      markers: {
        heading: 'Marcadores de Token',
        points: [
          'Escolha o marcador na configuração Marcador. Os pontos coloridos do Roll20, os marcadores padrão e seus conjuntos personalizados aparecem na lista.',
          'Adicionar o marcador a um token manualmente, ou com o TokenMod, dá inspiração ao personagem. Retirá-lo conta como gastar.',
          'Trocar o marcador o move em todos os tokens na hora.',
          'Os marcadores de condição próprios da ficha D&D 2024 não são oferecidos, porque a ficha os define sozinha.',
        ],
      },
      commands: {
        heading: 'Comandos',
        intro:
          'Todo comando começa com !inspiration. Os comandos agem sobre os tokens selecionados, a menos que --ids seja informado.',
        mods: 'Outros Mods também podem enviar estes comandos, por exemplo pelo ScriptCards. Outros Mods também podem chamar InspirationTracker.give, spend, remove e isInspired.',
        colCommand: 'Comando',
        colDesc: 'O que faz',
      },
      settings: {
        heading: 'Configurações',
        intro: 'Altere-as com o botão Configurações, ou digite !inspiration set <setting> <value>.',
        colKey: 'Configuração',
        colName: 'Nome',
        colDesc: 'O que faz',
      },
      upgrading: {
        heading: 'Atualizando da 0.1',
        points: [
          'O marcador, o efeito especial e o tipo de efeito da versão 0.1 são mantidos.',
          'Se você escolheu seu próprio comando na 0.1, ele continua funcionando junto com !inspiration.',
          '!inspiration com tokens selecionados ainda dá ou retira inspiração.',
        ],
      },
      troubleshooting: {
        heading: 'Solução de Problemas',
        points: [
          'O marcador não aparece em um token? Clique em Sincronizar para ler todas as fichas de novo.',
          'Um token que não representa um personagem não pode ter inspiração. Vincule-o a um personagem primeiro.',
          'Nada acontece quando um jogador clica em Gastar? Verifique se o personagem está atribuído a esse jogador.',
          'Os erros são gravados no console da API na página Mod Scripts.',
        ],
      },
      languages: {
        heading: 'Idiomas',
        body: 'O InspirationTracker está traduzido para os idiomas abaixo. Escolha um na configuração Idioma.',
        colCode: 'Código',
        colName: 'Idioma',
        colNative: 'Nome nativo',
      },
      credits: {
        heading: 'Créditos',
        original: 'Mod original por',
        maintainer: 'Versão 1 mantida por',
        support: 'Relate bugs e ideias no fórum de Mods do Roll20 ou no GitHub.',
      },
      footer: 'Os botões para todas as ações estão no handout "{deck}".',
    },
    deck: {
      subtitle: 'Painel de Comandos',
      selectedDesc: 'Selecione um ou mais tokens e depois clique.',
      partyDesc: 'Veja quem tem inspiração e escolha quem está no grupo.',
      poolsTitle: 'Reserva de pontos',
      poolsDesc: 'Com Controle em Reserva de pontos: selecione tokens, clique e digite o número.',
      toolsDesc: 'Menu, configurações, a macro de jogador e a ajuda.',
      footer: 'As instruções completas estão no handout "{help}".',
    },
  };

  const TRANSLATION$4 = {
    terms: {
      heroic: 'Героическое вдохновение',
      classic: 'Вдохновение',
    },
    titles: {
      ready: 'InspirationTracker готов к работе.',
      settings: 'Настройки InspirationTracker',
      help: 'Команды InspirationTracker',
      party: 'Вдохновение отряда',
      poolParty: 'Отряд: {term}',
      pools: 'Пулы очков',
      yours: 'Ваши персонажи',
      status: 'Состояние InspirationTracker',
    },
    messages: {
      gained: '{name} получает {term}!',
      spent: '{name} использует {term}.',
      spentBy: '{player} потратил {term} за персонажа {name}.',
      spentSheet: '{name} больше не имеет {term} (изменено на листе или жетоне).',
      restored: '{name} снова имеет {term}.',
      removed: '{term} отнято у персонажа {name}.',
      already: '{name} уже имеет {term}.',
      none: '{name} не имеет {term}.',
      busy: '{name} ещё обновляется. Попробуйте снова через мгновение.',
      passOffer:
        '{name} уже имеет {term} и не может иметь его дважды. Передайте его члену отряда, у которого его нет, или откажитесь от него.',
      passNobody: 'У всех остальных членов отряда оно уже есть.',
      passAsked: 'Игрокам персонажа {name} задан вопрос, кому передать {term}.',
      passed: '{from} передаёт {term} персонажу {to}!',
      passAlready: 'У персонажа {to} оно уже есть. Выберите кого-то другого.',
      declined: '{name} отказывается от лишнего: {term}.',
      undoAlready: 'У персонажа {name} оно уже снова есть.',
      synced: 'Прочитано листов: {checked}. С вдохновением: {inspired}.',
      migrated:
        'Настройки версии 0.1 сохранены: маркер, спецэффект и его тип. Новые настройки начинаются со значений по умолчанию.',
      legacyCommand: 'Ваша старая команда {command} по-прежнему работает, как и {main}.',
      macroHint:
        'Чтобы дать игрокам кнопку «Потратить», выполните {command}. Это добавит действие жетона для всех.',
      macro:
        'Макрос «{name}» готов: игроки видят его как действие жетона, когда выбирают жетон, которым управляют.',
      journal: 'Раздаточные материалы справки и командной панели пересозданы.',
      readyHint:
        'Введите {command}, чтобы открыть меню, или откройте раздаточный материал командной панели.',
    },
    pool: {
      gained: '{name} получает {term}: {amount} ({before} → {after}).',
      spent: '{name} тратит {term}: {amount} ({before} → {after}).',
      boosted: '{name} тратит {term}: {amount} — +{bonus} к броску ({before} → {after}).',
      spentBy: '{player} потратил {term} ({amount}) за персонажа {name}.',
      restored: '{name} получает обратно {term}: {amount} ({before} → {after}).',
      removed: '{term}: {amount} отнято у персонажа {name} ({before} → {after}).',
      none: '{name}: нет очков ({term}).',
      short: '{name}: {term} — {have}, а нужно {need}.',
      full: '{name}: {term} уже на максимуме ({max}).',
    },
    pools: {
      introFlag:
        '«Отслеживание» установлено в «Поле вдохновения на листе». Установите «Пул очков», чтобы «Дать» и «Потратить» работали с пулом «{name}». Другие пулы используются через --pool.',
      introPool:
        '«Дать», «Потратить» и «Усилить» работают с пулом «{name}». Другие пулы используются через их кнопку «Отряд» или через --pool.',
      defaultLabel: '{name} (по умолчанию)',
      name: 'Название',
      source: 'Хранится в',
      cost: 'Очков за +1',
      max: 'Максимум',
      marker: 'Маркер',
      attribute: 'Атрибут, если на листе нет поля с таким названием: {attribute}',
      partyTotal: 'Всего у отряда: {term} — {total}.',
      keptBox: 'Поле на листе: {name}',
      keptAttribute: 'Атрибут: {attribute}',
      keptNote: 'Атрибут не показывается на листе персонажа.',
    },
    prompts: {
      points: 'Очки',
      bonus: 'Бонус к броску',
      max: 'Максимум очков (0 — без ограничения)',
    },
    errors: {
      unknownPool: 'Пула с названием «{value}» не существует.',
      unknownPoolHint: 'Пулы: {pools}.',
      badAmount: '«{value}» — не количество очков.',
      badAmountHint: 'Используйте целое число от 1 до 9999.',
      boostNoPool: '«Усилить» тратит очки из пула.',
      poolInvalid: 'Пул нельзя назвать «{value}».',
      poolExists: 'Пул с названием «{value}» уже есть.',
      poolFull: 'Для ещё одного пула нет места.',
      poolNameHint:
        'Используйте название до 40 букв, цифр и пробелов, которого нет у других пулов.',
      poolDefault: 'Пул по умолчанию, «{name}», нельзя удалить. Его можно переименовать.',
      poolMarkerHint:
        'Выберите маркер из ваших наборов маркеров, отличный от выбранного в настройке «Маркер».',
      poolSetHint: 'Введите !inspiration pools, чтобы увидеть все пулы и их настройки.',
      denied: 'Вы не можете сделать это для персонажа {name}.',
      gmOnly: 'Эту команду может использовать только GM.',
      gmOnlyHint: 'Игроки могут использовать spend, party и help.',
      spendOff: 'GM отключил трату вдохновения игроками.',
      noCharacter: 'Эти жетоны не представляют персонажа: {names}.',
      nothingSelected: 'Сначала выберите жетон.',
      nothingSelectedHint:
        'Выберите жетоны, представляющие персонажей, или добавьте --ids с ID жетонов или персонажей.',
      writeFailed: 'Не удалось изменить лист персонажа {name}.',
      offerGone: 'Этот выбор уже сделан или его срок истёк.',
      passInvalid: 'Выберите члена отряда, у которого его нет.',
      undoGone: 'Эта трата уже отменена или слишком старая.',
      unknownMarker: 'Маркера жетона «{value}» не существует.',
      unknownMarkerHint:
        'Используйте кнопку «Маркер» в настройках, чтобы выбрать его из ваших наборов маркеров.',
      badSetting: 'Нельзя установить {key} в «{value}».',
      badSettingHint: 'Введите !inspiration set, чтобы увидеть все настройки и их варианты.',
      unknownCommand: 'Неизвестная команда: {command}.',
      unknownCommandHint: 'Введите !inspiration help, чтобы увидеть список команд.',
    },
    menu: {
      selected: 'Выбранные жетоны',
      party: 'Отряд',
      tools: 'Инструменты',
      hint: 'Полные инструкции — в раздаточном материале «{help}».',
      noSheet: 'нет листа',
      noneYours: 'Вы не управляете ни одним персонажем с листом.',
      partyEmpty: 'Вы не управляете ни одним членом отряда.',
      partyEmptyGm:
        'В отряде пока никого нет. Назначьте персонажей игрокам или выберите жетоны и нажмите «В отряд».',
      partyCount: '{term}: {count} из {total}.',
    },
    buttons: {
      menu: 'Меню',
      give: 'Дать',
      remove: 'Убрать',
      toggle: 'Переключить',
      spend: 'Потратить',
      party: 'Отряд',
      partyAdd: 'В отряд',
      partyRemove: 'Из отряда',
      settings: 'Настройки',
      macro: 'Макрос игрока',
      sync: 'Синхронизировать',
      status: 'Состояние',
      help: 'Справка',
      reset: 'Сбросить настройки',
      refresh: 'Обновить',
      undo: 'Отменить',
      decline: 'Отказаться',
      boost: 'Усилить',
      pools: 'Пулы',
      addPool: 'Добавить пул',
      deletePool: 'Удалить пул',
    },
    values: {
      on: 'Вкл.',
      off: 'Выкл.',
      none: 'Нет',
      noLimit: 'Без ограничения',
      tracking: {
        flag: 'Поле вдохновения на листе',
        pool: 'Пул очков',
      },
      source: {
        resource: 'Поле ресурса на листе',
        attribute: 'Атрибут',
      },
      wording: {
        2014: 'Вдохновение (2014)',
        2024: 'Героическое вдохновение (2024)',
        auto: 'Из листа',
      },
      announce: {
        public: 'Все',
        gm: 'GM и владельцы',
        off: 'Никто',
      },
    },
    settings: {
      language: {
        label: 'Язык',
        desc: 'Язык меню, сообщений и раздаточных материалов.',
      },
      tracking: {
        label: 'Отслеживание',
        desc: 'С чем работают «Дать» и «Потратить»: с полем вдохновения на листах D&D, которое у персонажа либо есть, либо нет, или с пулом очков, которые накапливаются и тратятся понемногу.',
      },
      marker: {
        label: 'Маркер',
        desc: 'Маркер жетона, который показывается, пока у персонажа есть вдохновение. Пользовательские наборы маркеров тоже есть в списке.',
      },
      wording: {
        label: 'Название',
        desc: 'Называть его Вдохновением или Героическим вдохновением. «Из листа» использует правила, выбранные на каждом листе D&D 2024, а на листе 2014 — Вдохновение.',
      },
      announce: {
        label: 'Оповещение',
        desc: 'Кто видит сообщение в чате, когда вдохновение получено или потрачено.',
      },
      fx: {
        label: 'Спецэффект',
        desc: 'Проигрывать спецэффект на жетоне, когда он получает вдохновение.',
      },
      fxType: {
        label: 'Тип эффекта',
        desc: 'Какой эффект проигрывать, например nova-holy, или ID пользовательского эффекта.',
      },
      playerSpend: {
        label: 'Игроки могут тратить',
        desc: 'Позволяет игрокам тратить вдохновение своих персонажей. GM получает уведомление с кнопкой «Отменить».',
      },
      playerOverview: {
        label: 'Игроки видят отряд',
        desc: 'Позволяет игрокам видеть, у кого в отряде есть вдохновение.',
      },
      passOn: {
        label: 'Передача (2024)',
        desc: 'По правилам 2024 года персонаж, который получил бы Героическое вдохновение, уже имея его, может передать его другому члену отряда.',
      },
    },
    status: {
      version: 'Версия',
      beacon: 'Листы D&D 2024',
      legacy: 'Листы 2014',
      none: 'Персонажи без поля вдохновения',
      rules2024: 'По правилам 2024',
      party: 'Члены отряда',
      tracking: 'Отслеживание',
      pools: 'Пулы',
      marker: 'Маркер',
      fx: 'Спецэффект',
      legacyCommand: 'Старая команда',
    },
    help: {
      menu: 'Показывает меню. Если выбраны жетоны, даёт или убирает вдохновение, как в версии 0.1.',
      give: 'Даёт вдохновение выбранным персонажам.',
      remove: 'Убирает вдохновение у выбранных персонажей, не считая это тратой.',
      toggle: 'Даёт вдохновение выбранным персонажам без него и убирает у тех, у кого оно есть.',
      spend: 'Тратит вдохновение выбранных персонажей и сообщает GM.',
      party:
        'Показывает, у кого в отряде есть вдохновение, с кнопками, чтобы дать, убрать или потратить его.',
      partyEdit: 'Добавляет выбранных персонажей в отряд или убирает их из него.',
      ids: 'Работает с указанными ID жетонов или персонажей вместо выбранных жетонов.',
      points:
        'С пулом очков: даёт, убирает или тратит указанное число очков. Без числа — 1. remove all убирает все очки.',
      boost:
        'С пулом очков: тратит очки, чтобы добавить указанный бонус к броску, по цене пула за каждый +1.',
      poolFlag: 'Работает с указанным пулом вместо пула по умолчанию.',
      pools: 'Показывает пулы очков и их настройки.',
      poolEdit: 'Добавляет пул или удаляет его. Очки на листах остаются как есть.',
      poolSet:
        'Изменяет пул: его название, место хранения (resource или attribute), число очков за каждый +1, максимум очков (0 — без ограничения) или его маркер жетона.',
      undo: 'Возвращает потраченное вдохновение. ID берётся из сообщения GM о трате.',
      macro:
        'Добавляет действие жетона «Inspiration», которое игроки нажимают, чтобы потратить вдохновение.',
      sync: 'Заново читает все листы и исправляет маркеры.',
      set: 'Показывает настройки или изменяет одну из них.',
      reset: 'Возвращает все настройки к значениям по умолчанию, кроме языка.',
      status: 'Показывает версию, найденные листы и основные настройки.',
      journal: 'Пересоздаёт раздаточные материалы справки и командной панели.',
      help: 'Показывает этот список.',
    },
    helpPlayer: {
      menu: 'Показывает ваших персонажей и есть ли у них вдохновение.',
      spend: 'Тратит вдохновение выбранного персонажа.',
      boost: 'Тратит очки из пула, чтобы добавить указанный бонус к броску.',
      party: 'Показывает отряд, если GM это разрешает.',
      help: 'Показывает этот список.',
    },
    handout: {
      versionLabel: 'Версия',
      subtitle: 'Вдохновение, Героическое вдохновение и пулы очков для любой игры',
      overview: {
        heading: 'Обзор',
        body: 'InspirationTracker согласует вдохновение D&D между листом персонажа, жетоном и чатом. Дайте его через меню, лист или маркер жетона — и каждый жетон этого персонажа покажет маркер. Игроки могут потратить его одним щелчком, а GM получает уведомление с кнопкой «Отменить». Работает с листом D&D 2024, где оно называется Героическим вдохновением, и с листом 2014 OGL.',
      },
      quickStart: {
        heading: 'Быстрый старт',
        steps: [
          'Откройте раздаточный материал командной панели или введите !inspiration, чтобы открыть меню.',
          'Выберите жетон и нажмите «Дать». Персонаж получает вдохновение, а его жетоны показывают маркер.',
          'Нажмите «Макрос игрока» один раз, чтобы у игроков появилось действие жетона Inspiration для траты вдохновения.',
          'Нажмите «Отряд», чтобы увидеть, у кого есть вдохновение.',
        ],
      },
      sheets: {
        heading: 'Листы персонажей',
        colSheet: 'Лист',
        colWhere: 'Где хранится вдохновение',
        colSheet2014: 'D&D 5E by Roll20 (2014 OGL)',
        where2014: 'Поле «Вдохновение», атрибут "inspiration".',
        colSheet2024: 'D&D Fifth Edition (5E & 5.5E, 2024)',
        where2024:
          'Поле «Героическое вдохновение», читается и записывается через getSheetItem и setSheetItem.',
        points: [
          'Установка или снятие флажка на листе замечается сразу: маркер следует за ним, а снятие считается тратой.',
          'Если «Название» установлено в «Из листа», каждый персонаж D&D 2024 использует правила, выбранные в настройках его листа: по правилам 2024 — Героическое вдохновение, по правилам 2014 — Вдохновение.',
          'Персонажи без обоих листов не затрагиваются, поэтому жетоны NPC не меняются.',
        ],
      },
      players: {
        heading: 'Игроки',
        points: [
          'Игроки могут тратить вдохновение своих персонажей: нажмите «Потратить» в чате или действие жетона Inspiration.',
          'GM получает сообщение о том, кто его потратил, с кнопкой «Отменить».',
          'Ввод !inspiration показывает игроку его персонажей и есть ли у них вдохновение.',
          'Выключите «Игроки могут тратить», чтобы трата оставалась в руках GM.',
        ],
      },
      passOn: {
        heading: 'Передача (правила 2024)',
        points: [
          'Персонаж не может иметь Героическое вдохновение дважды. Когда тот, у кого оно есть, получил бы его снова, его игрокам предлагают передать его другому члену отряда, у которого его нет.',
          'В выборе есть все члены отряда без Героического вдохновения и вариант «Отказаться». Выбор истекает через час.',
          'По правилам 2014 GM просто сообщается, что у персонажа уже есть Вдохновение.',
          'Выключите «Передача», чтобы всегда получать только это сообщение.',
        ],
      },
      party: {
        heading: 'Отряд',
        points: [
          'Отряд — это все персонажи, которыми управляют игроки. Выберите жетоны и нажмите «В отряд» или «Из отряда», чтобы изменить его.',
          'В обзоре GM у каждого члена есть кнопки «Дать», «Убрать» и «Потратить».',
          'Включите «Игроки видят отряд», чтобы игроки тоже видели обзор. Кнопки «Потратить» у них есть только для своих персонажей.',
        ],
      },
      pools: {
        heading: 'Пулы очков',
        points: [
          'Пул очков — это число, которое накапливается и тратится понемногу: очки вдохновения, очки героя, удача, bennies и тому подобное. Он работает с любым листом персонажа.',
          'Установите «Отслеживание» в «Пул очков», и кнопки «Дать», «Убрать» и «Потратить» будут работать с пулом по умолчанию, спрашивая количество очков. Маркер показывается, пока у персонажа есть хотя бы одно очко.',
          '«Усилить» тратит очки, чтобы повысить бросок: введите нужный бонус, а настройка пула «Очков за +1» определит цену. При 2 очках за +1 бонус 4 стоит 8 очков. Mod объявляет трату; бонус к броску добавьте сами.',
          'Трата отклоняется, если у персонажа не хватает очков. GM получает сообщение о том, кто и сколько потратил, с кнопкой «Отменить».',
          'Вариант «Поле ресурса на листе» в настройке «Хранится в» использует поле ресурса на листе, названное так же, как пул, например поле Other Resource с названием Inspiration на листе D&D 2014. Если на листе нет поля с таким названием или выбран вариант «Атрибут», очки хранятся в обычном атрибуте, например inspiration_pool. Лист D&D 2024 всегда использует атрибут.',
          'Карточка отряда и собственная карточка игрока сообщают, где хранятся очки каждого персонажа: название поля на листе или атрибут. Атрибут не показывается на листе персонажа.',
          'Менять число на листе вручную можно: маркер последует за ним.',
          'Нажмите «Пулы», чтобы переименовать пул по умолчанию, задать его цену и максимум или добавить другие пулы. Другие пулы используются через их кнопку «Отряд» или добавлением --pool и названия пула к команде.',
          'Bardic Inspiration работает как отдельный пул: нажмите «Добавить пул» и назовите его Bardic Inspiration, задайте «Максимум» равным 1 и выберите «Маркер». GM даёт 1 с карточки «Отряд» этого пула, когда бард раздаёт кость, а её владелец нажимает «Потратить», когда использует её. Mod отмечает, у кого есть кость; игрок бросает её сам.',
        ],
      },
      markers: {
        heading: 'Маркеры жетонов',
        points: [
          'Выберите маркер в настройке «Маркер». В списке есть цветные точки Roll20, стандартные маркеры и ваши пользовательские наборы маркеров.',
          'Добавление маркера на жетон вручную или через TokenMod даёт персонажу вдохновение. Снятие маркера считается тратой.',
          'Смена маркера сразу переносит его на всех жетонах.',
          'Собственные маркеры состояний листа D&D 2024 не предлагаются, потому что лист ставит их сам.',
        ],
      },
      commands: {
        heading: 'Команды',
        intro:
          'Каждая команда начинается с !inspiration. Команды действуют на выбранные жетоны, если не указан --ids.',
        mods: 'Другие Mods тоже могут отправлять эти команды, например из ScriptCards. Другие Mods также могут вызывать InspirationTracker.give, spend, remove и isInspired.',
        colCommand: 'Команда',
        colDesc: 'Что делает',
      },
      settings: {
        heading: 'Настройки',
        intro: 'Меняйте их кнопкой «Настройки» или введите !inspiration set <setting> <value>.',
        colKey: 'Ключ',
        colName: 'Название',
        colDesc: 'Что делает',
      },
      upgrading: {
        heading: 'Обновление с 0.1',
        points: [
          'Маркер, спецэффект и тип эффекта из версии 0.1 сохраняются.',
          'Если в 0.1 вы выбрали свою команду, она по-прежнему работает наряду с !inspiration.',
          '!inspiration с выбранными жетонами по-прежнему даёт или убирает вдохновение.',
        ],
      },
      troubleshooting: {
        heading: 'Устранение неполадок',
        points: [
          'Маркер не появляется на жетоне? Нажмите «Синхронизировать», чтобы заново прочитать все листы.',
          'Жетон, который не представляет персонажа, не может иметь вдохновение. Сначала свяжите его с персонажем.',
          'Ничего не происходит, когда игрок нажимает «Потратить»? Проверьте, что персонаж назначен этому игроку.',
          'Ошибки записываются в консоль API на странице Mod Scripts.',
        ],
      },
      languages: {
        heading: 'Языки',
        body: 'InspirationTracker переведён на перечисленные ниже языки. Выберите язык в настройке «Язык».',
        colCode: 'Код',
        colName: 'Язык',
        colNative: 'Самоназвание',
      },
      credits: {
        heading: 'Авторы',
        original: 'Автор оригинального Mod:',
        maintainer: 'Версию 1 сопровождает:',
        support: 'Сообщайте об ошибках и идеях на форуме Mod на Roll20 или на GitHub.',
      },
      footer: 'Кнопки для всех действий — в раздаточном материале «{deck}».',
    },
    deck: {
      subtitle: 'Командная панель',
      selectedDesc: 'Выберите один или несколько жетонов, затем нажмите.',
      partyDesc: 'Смотрите, у кого есть вдохновение, и выбирайте, кто в отряде.',
      poolsTitle: 'Пул очков',
      poolsDesc:
        'Когда «Отслеживание» установлено в «Пул очков»: выберите жетоны, нажмите и введите число.',
      toolsDesc: 'Меню, настройки, макрос игрока и справка.',
      footer: 'Полные инструкции — в раздаточном материале «{help}».',
    },
  };

  const TRANSLATION$3 = {
    terms: {
      heroic: 'Inspiración heroica',
      classic: 'Inspiración',
    },
    titles: {
      ready: 'InspirationTracker está listo.',
      settings: 'Ajustes de InspirationTracker',
      help: 'Comandos de InspirationTracker',
      party: 'Inspiración del grupo',
      poolParty: '{term} del grupo',
      pools: 'Reservas de puntos',
      yours: 'Tus personajes',
      status: 'Estado de InspirationTracker',
    },
    messages: {
      gained: '¡{name} tiene {term}!',
      spent: '{name} usa {term}.',
      spentBy: '{player} ha gastado {term} por {name}.',
      spentSheet: '{name} ya no tiene {term} (cambiado en la hoja o en la ficha).',
      restored: '{name} recupera {term}.',
      removed: 'Se ha quitado {term} a {name}.',
      already: '{name} ya tiene {term}.',
      none: '{name} no tiene {term}.',
      busy: '{name} todavía se está actualizando. Inténtalo de nuevo en un momento.',
      passOffer:
        '{name} ya tiene {term} y no puede tenerla dos veces. Dásela a un miembro del grupo que no la tenga, o déjala pasar.',
      passNobody: 'Todos los demás miembros del grupo ya la tienen.',
      passAsked: 'Se ha preguntado a los jugadores de {name} quién debe recibir {term}.',
      passed: '¡{from} da {term} a {to}!',
      passAlready: '{to} ya la tiene. Elige a otra persona.',
      declined: '{name} deja pasar la {term} extra.',
      undoAlready: '{name} ya la vuelve a tener.',
      synced: 'Hojas leídas: {checked}. Con inspiración: {inspired}.',
      migrated:
        'Se han conservado los ajustes de la versión 0.1: marcador, efecto especial y su tipo. Los ajustes nuevos empiezan con sus valores por defecto.',
      legacyCommand: 'Tu antiguo comando {command} sigue funcionando, igual que {main}.',
      macroHint:
        'Para dar a los jugadores un botón Gastar, ejecuta {command}. Añade una acción de ficha para todos.',
      macro:
        'La macro "{name}" está lista: los jugadores la ven como acción de ficha al seleccionar una ficha que controlan.',
      journal: 'Se han reconstruido los folletos de Ayuda y Panel de comandos.',
      readyHint: 'Escribe {command} para ver el menú, o abre el folleto del Panel de comandos.',
    },
    pool: {
      gained: '{name} gana {amount} {term} ({before} → {after}).',
      spent: '{name} gasta {amount} {term} ({before} → {after}).',
      boosted: '{name} gasta {amount} {term} para +{bonus} a la tirada ({before} → {after}).',
      spentBy: '{player} ha gastado {amount} {term} por {name}.',
      restored: '{name} recupera {amount} {term} ({before} → {after}).',
      removed: 'Se han quitado {amount} {term} a {name} ({before} → {after}).',
      none: '{name} no tiene {term}.',
      short: '{name} tiene {have} {term} y hacen falta {need}.',
      full: '{name} ya tiene el máximo de {term} permitido ({max}).',
    },
    pools: {
      introFlag:
        'El seguimiento está en la casilla de inspiración de la hoja. Ponlo en Reserva de puntos para que Dar y Gastar actúen sobre la reserva "{name}". Las demás reservas se usan con --pool.',
      introPool:
        'Dar, Gastar y Potenciar actúan sobre "{name}". Las demás reservas se usan desde su botón Grupo, o con --pool.',
      defaultLabel: '{name} (por defecto)',
      name: 'Nombre',
      source: 'Guardado en',
      cost: 'Puntos por +1',
      max: 'Máximo',
      marker: 'Marcador',
      attribute: 'Atributo cuando la hoja no tiene una casilla con este nombre: {attribute}',
      partyTotal: 'Total del grupo: {total} {term}.',
      keptBox: 'Casilla de la hoja: {name}',
      keptAttribute: 'Atributo: {attribute}',
      keptNote: 'Un atributo no se muestra en la hoja de personaje.',
    },
    prompts: {
      points: 'Puntos',
      bonus: 'Bonificador a la tirada',
      max: 'Máximo de puntos permitido (0 para sin límite)',
    },
    errors: {
      unknownPool: 'No hay ninguna reserva llamada "{value}".',
      unknownPoolHint: 'Reservas: {pools}.',
      badAmount: '"{value}" no es una cantidad de puntos.',
      badAmountHint: 'Usa un número entero del 1 al 9999.',
      boostNoPool: 'Potenciar gasta puntos de una reserva.',
      poolInvalid: 'Una reserva no puede llamarse "{value}".',
      poolExists: 'Ya hay una reserva llamada "{value}".',
      poolFull: 'No hay sitio para otra reserva.',
      poolNameHint:
        'Usa un nombre de hasta 40 letras, cifras y espacios que no tenga ninguna otra reserva.',
      poolDefault:
        'La reserva por defecto, "{name}", no se puede eliminar. Se puede cambiar de nombre.',
      poolMarkerHint:
        'Elige un marcador de tus conjuntos de marcadores que no sea el del ajuste Marcador.',
      poolSetHint: 'Escribe !inspiration pools para ver todas las reservas y sus ajustes.',
      denied: 'No puedes hacer eso con {name}.',
      gmOnly: 'Solo el GM puede usar ese comando.',
      gmOnlyHint: 'Los jugadores pueden usar spend, party y help.',
      spendOff: 'El GM ha desactivado que los jugadores gasten inspiración.',
      noCharacter: 'Estas fichas no representan a ningún personaje: {names}.',
      nothingSelected: 'Selecciona primero una ficha.',
      nothingSelectedHint:
        'Selecciona fichas que representen personajes, o añade --ids con ID de fichas o de personajes.',
      writeFailed: 'No se ha podido cambiar la hoja de {name}.',
      offerGone: 'Esa elección ya se ha hecho o ha caducado.',
      passInvalid: 'Elige un miembro del grupo distinto del que la tiene.',
      undoGone: 'Ese gasto ya se ha deshecho o es demasiado antiguo.',
      unknownMarker: 'No hay ningún marcador de ficha llamado "{value}".',
      unknownMarkerHint:
        'Usa el botón Marcador de los ajustes para elegir uno de tus conjuntos de marcadores.',
      badSetting: 'No se puede poner {key} a "{value}".',
      badSettingHint: 'Escribe !inspiration set para ver todos los ajustes y sus opciones.',
      unknownCommand: 'Comando desconocido: {command}.',
      unknownCommandHint: 'Escribe !inspiration help para ver la lista de comandos.',
    },
    menu: {
      selected: 'Fichas seleccionadas',
      party: 'Grupo',
      tools: 'Herramientas',
      hint: 'Las instrucciones completas están en el folleto "{help}".',
      noSheet: 'sin hoja',
      noneYours: 'No controlas ningún personaje con hoja.',
      partyEmpty: 'No controlas ningún miembro del grupo.',
      partyEmptyGm:
        'Todavía no hay nadie en el grupo. Asigna personajes a los jugadores, o selecciona fichas y pulsa Añadir al grupo.',
      partyCount: '{count} de {total} tienen {term}.',
    },
    buttons: {
      menu: 'Menú',
      give: 'Dar',
      remove: 'Quitar',
      toggle: 'Alternar',
      spend: 'Gastar',
      party: 'Grupo',
      partyAdd: 'Añadir al grupo',
      partyRemove: 'Quitar del grupo',
      settings: 'Ajustes',
      macro: 'Macro de jugador',
      sync: 'Sincronizar',
      status: 'Estado',
      help: 'Ayuda',
      reset: 'Restablecer ajustes',
      refresh: 'Actualizar',
      undo: 'Deshacer',
      decline: 'Dejar pasar',
      boost: 'Potenciar',
      pools: 'Reservas',
      addPool: 'Añadir reserva',
      deletePool: 'Eliminar reserva',
    },
    values: {
      on: 'Activado',
      off: 'Desactivado',
      none: 'Ninguno',
      noLimit: 'Sin límite',
      tracking: {
        flag: 'Casilla de inspiración de la hoja',
        pool: 'Reserva de puntos',
      },
      source: {
        resource: 'Casilla de recurso de la hoja',
        attribute: 'Atributo',
      },
      wording: {
        2014: 'Inspiración (2014)',
        2024: 'Inspiración heroica (2024)',
        auto: 'Según la hoja',
      },
      announce: {
        public: 'Todos',
        gm: 'GM y propietarios',
        off: 'Nadie',
      },
    },
    settings: {
      language: {
        label: 'Idioma',
        desc: 'Idioma de los menús, mensajes y folletos.',
      },
      tracking: {
        label: 'Seguimiento',
        desc: 'Sobre qué actúan Dar y Gastar: la casilla de inspiración de las hojas de D&D, que un personaje tiene o no tiene, o una reserva de puntos que se acumula y se gasta poco a poco.',
      },
      marker: {
        label: 'Marcador',
        desc: 'Marcador de ficha que se muestra mientras un personaje tiene inspiración. También aparecen los conjuntos de marcadores personalizados.',
      },
      wording: {
        label: 'Denominación',
        desc: 'Llamarla Inspiración o Inspiración heroica. "Según la hoja" usa las reglas elegidas en cada hoja de D&D 2024, e Inspiración en la hoja de 2014.',
      },
      announce: {
        label: 'Anunciar',
        desc: 'Quién ve el mensaje del chat cuando se gana o se gasta inspiración.',
      },
      fx: {
        label: 'Efecto especial',
        desc: 'Reproduce un efecto especial en la ficha cuando gana inspiración.',
      },
      fxType: {
        label: 'Tipo de efecto',
        desc: 'Qué efecto reproducir, como nova-holy, o el ID de un efecto personalizado.',
      },
      playerSpend: {
        label: 'Los jugadores pueden gastar',
        desc: 'Permite a los jugadores gastar inspiración de los personajes que controlan. Se avisa al GM, con un botón Deshacer.',
      },
      playerOverview: {
        label: 'Los jugadores ven el grupo',
        desc: 'Permite a los jugadores ver quién del grupo tiene inspiración.',
      },
      passOn: {
        label: 'Pasarla (2024)',
        desc: 'Con las reglas de 2024, un personaje que ganaría Inspiración heroica teniéndola ya puede dársela a otro miembro del grupo.',
      },
    },
    status: {
      version: 'Versión',
      beacon: 'Hojas de D&D 2024',
      legacy: 'Hojas de 2014',
      none: 'Personajes sin casilla de inspiración',
      rules2024: 'Con reglas de 2024',
      party: 'Miembros del grupo',
      tracking: 'Seguimiento',
      pools: 'Reservas',
      marker: 'Marcador',
      fx: 'Efecto especial',
      legacyCommand: 'Comando antiguo',
    },
    help: {
      menu: 'Muestra el menú. Con fichas seleccionadas, da o quita inspiración, como hacía la versión 0.1.',
      give: 'Da inspiración a los personajes seleccionados.',
      remove: 'Quita inspiración a los personajes seleccionados, sin contarla como gastada.',
      toggle:
        'Da inspiración a los personajes seleccionados que no la tienen y se la quita a los que la tienen.',
      spend: 'Gasta la inspiración de los personajes seleccionados y avisa al GM.',
      party:
        'Muestra quién del grupo tiene inspiración, con botones para darla, quitarla o gastarla.',
      partyEdit: 'Añade los personajes seleccionados al grupo, o los saca de él.',
      ids: 'Actúa sobre los ID de fichas o personajes indicados en lugar de las fichas seleccionadas.',
      points:
        'Con una reserva de puntos: da, quita o gasta esa cantidad de puntos. Sin número, 1. remove all quita todos los puntos.',
      boost:
        'Con una reserva de puntos: gasta puntos para sumar ese bonificador a una tirada, al coste de la reserva por cada +1.',
      poolFlag: 'Actúa sobre la reserva indicada en lugar de la reserva por defecto.',
      pools: 'Muestra las reservas de puntos y sus ajustes.',
      poolEdit: 'Añade una reserva, o elimina una. Los puntos de las hojas se dejan como están.',
      poolSet:
        'Cambia una reserva: su nombre, dónde se guarda (resource o attribute), los puntos que cuesta cada +1, el máximo de puntos permitido (0 para sin límite) o su marcador de ficha.',
      undo: 'Devuelve la inspiración que se gastó. El ID viene del mensaje al GM sobre el gasto.',
      macro:
        'Añade la acción de ficha "Inspiration", que los jugadores pulsan para gastar inspiración.',
      sync: 'Vuelve a leer todas las hojas y corrige los marcadores.',
      set: 'Muestra los ajustes, o cambia uno.',
      reset: 'Devuelve todos los ajustes a su valor por defecto, salvo el idioma.',
      status: 'Muestra la versión, las hojas encontradas y los ajustes principales.',
      journal: 'Reconstruye los folletos de Ayuda y Panel de comandos.',
      help: 'Muestra esta lista.',
    },
    helpPlayer: {
      menu: 'Muestra tus personajes y si tienen inspiración.',
      spend: 'Gasta la inspiración del personaje seleccionado.',
      boost: 'Gasta puntos de una reserva para sumar ese bonificador a una tirada.',
      party: 'Muestra el grupo, si el GM lo permite.',
      help: 'Muestra esta lista.',
    },
    handout: {
      versionLabel: 'Versión',
      subtitle: 'Inspiración, Inspiración heroica y reservas de puntos para cualquier juego',
      overview: {
        heading: 'Descripción general',
        body: 'InspirationTracker mantiene sincronizada la inspiración de D&D en la hoja de personaje, la ficha y el chat. Dala desde el menú, la hoja o el marcador de la ficha, y todas las fichas de ese personaje muestran el marcador. Los jugadores pueden gastarla con un clic, y se avisa al GM, con un botón Deshacer. Funciona con la hoja de D&D 2024, donde se llama Inspiración heroica, y con la hoja OGL de 2014.',
      },
      quickStart: {
        heading: 'Inicio rápido',
        steps: [
          'Abre el folleto del Panel de comandos, o escribe !inspiration para ver el menú.',
          'Selecciona una ficha y pulsa Dar. El personaje gana inspiración y sus fichas muestran el marcador.',
          'Pulsa Macro de jugador una vez, para que los jugadores tengan una acción de ficha "Inspiration" con la que gastarla.',
          'Pulsa Grupo para ver quién tiene inspiración.',
        ],
      },
      sheets: {
        heading: 'Hojas de personaje',
        colSheet: 'Hoja',
        colWhere: 'Dónde se guarda la inspiración',
        colSheet2014: 'D&D 5E by Roll20 (2014 OGL)',
        where2014: 'La casilla Inspiración, atributo "inspiration".',
        colSheet2024: 'D&D Fifth Edition (5E & 5.5E, 2024)',
        where2024:
          'La casilla Inspiración heroica, leída y escrita con getSheetItem y setSheetItem.',
        points: [
          'Marcar o desmarcar la casilla en una hoja se detecta al instante: el marcador la sigue, y desmarcarla cuenta como gastarla.',
          'Con Denominación en "Según la hoja", cada personaje de D&D 2024 usa las reglas elegidas en los ajustes de su hoja: las reglas de 2024 dicen Inspiración heroica, las de 2014 dicen Inspiración.',
          'Los personajes sin ninguna de las dos hojas no se tocan, así que las fichas de PNJ no cambian.',
        ],
      },
      players: {
        heading: 'Jugadores',
        points: [
          'Los jugadores pueden gastar inspiración de los personajes que controlan: pulsando Gastar en el chat, o la acción de ficha "Inspiration".',
          'El GM recibe un mensaje que dice quién la gastó, con un botón Deshacer.',
          'Al escribir !inspiration, un jugador ve sus personajes y si tienen inspiración.',
          'Desactiva Los jugadores pueden gastar para que solo el GM gaste inspiración.',
        ],
      },
      passOn: {
        heading: 'Pasarla a otro (reglas de 2024)',
        points: [
          'Un personaje no puede tener Inspiración heroica dos veces. Cuando uno que la tiene fuera a ganarla de nuevo, se pregunta a sus jugadores si quieren dársela a otro miembro del grupo que no la tenga.',
          'La elección ofrece a todos los miembros del grupo sin Inspiración heroica, y Dejar pasar. Caduca al cabo de una hora.',
          'Con las reglas de 2014, simplemente se avisa al GM de que el personaje ya tiene Inspiración.',
          'Desactiva Pasarla para recibir siempre ese mensaje.',
        ],
      },
      party: {
        heading: 'El grupo',
        points: [
          'El grupo son todos los personajes que controla algún jugador. Selecciona fichas y pulsa Añadir al grupo o Quitar del grupo para cambiarlo.',
          'La vista general del GM tiene botones Dar, Quitar y Gastar para cada miembro.',
          'Activa Los jugadores ven el grupo para que los jugadores también vean la vista general. Solo tienen botones Gastar para sus propios personajes.',
        ],
      },
      pools: {
        heading: 'Reservas de puntos',
        points: [
          'Una reserva de puntos es un número que se acumula y se gasta poco a poco: una reserva de puntos de inspiración, puntos de héroe, suerte, bennies y similares. Funciona con cualquier hoja de personaje.',
          'Pon Seguimiento en Reserva de puntos, y Dar, Quitar y Gastar actúan sobre la reserva por defecto y preguntan cuántos puntos. El marcador se muestra mientras un personaje tiene algún punto.',
          'Potenciar gasta puntos para subir una tirada: escribe el bonificador deseado, y los Puntos por +1 de la reserva deciden el coste. A 2 puntos por +1, un bonificador de 4 cuesta 8 puntos. El Mod anuncia el gasto; suma tú el bonificador a la tirada.',
          'Un gasto se rechaza cuando el personaje no tiene puntos suficientes. Se avisa al GM de quién ha gastado qué, con un botón Deshacer.',
          'Con Guardado en "Casilla de recurso de la hoja" se usa la casilla de recurso de la hoja que lleva el nombre de la reserva, como una casilla Other Resource llamada Inspiración en la hoja de D&D de 2014. Cuando la hoja no tiene una casilla con ese nombre, o con "Atributo", los puntos se guardan en un atributo normal, como inspiration_pool. La hoja de D&D 2024 siempre usa el atributo.',
          'La tarjeta del grupo y la tarjeta propia de un jugador dicen dónde se guardan los puntos de cada personaje: el nombre de la casilla de la hoja, o el atributo. Un atributo no se muestra en la hoja de personaje.',
          'Cambiar el número en la hoja a mano no da problemas: el marcador lo sigue.',
          'Pulsa Reservas para cambiar el nombre de la reserva por defecto, fijar su coste y su máximo, o añadir más reservas. Las demás reservas se usan desde su botón Grupo, o añadiendo --pool y el nombre de la reserva a un comando.',
          'Bardic Inspiration funciona como una reserva propia: pulsa Añadir reserva y llámala Bardic Inspiration, pon su Máximo en 1 y elige su Marcador. El GM da 1 desde la tarjeta Grupo de esa reserva cuando el bardo reparte un dado, y quien lo tiene pulsa Gastar cuando lo usa. El Mod marca quién tiene un dado; el jugador lo tira.',
        ],
      },
      markers: {
        heading: 'Marcadores de ficha',
        points: [
          'Elige el marcador con el ajuste Marcador. Aparecen los puntos de colores de Roll20, los marcadores por defecto y tus conjuntos de marcadores personalizados.',
          'Añadir el marcador a una ficha a mano, o con TokenMod, da inspiración al personaje. Quitarlo la gasta.',
          'Cambiar el marcador lo mueve en todas las fichas al instante.',
          'No se ofrecen los marcadores de estado propios de la hoja de D&D 2024, porque la hoja los pone ella misma.',
        ],
      },
      commands: {
        heading: 'Comandos',
        intro:
          'Todos los comandos empiezan por !inspiration. Los comandos actúan sobre las fichas seleccionadas salvo que se indique --ids.',
        mods: 'Otros Mods también pueden enviar estos comandos, por ejemplo desde ScriptCards. Otros Mods también pueden llamar a InspirationTracker.give, spend, remove e isInspired.',
        colCommand: 'Comando',
        colDesc: 'Qué hace',
      },
      settings: {
        heading: 'Ajustes',
        intro: 'Cámbialos con el botón Ajustes, o escribe !inspiration set <setting> <value>.',
        colKey: 'Ajuste',
        colName: 'Nombre',
        colDesc: 'Qué hace',
      },
      upgrading: {
        heading: 'Actualizar desde la 0.1',
        points: [
          'Se conservan el marcador, el efecto especial y el tipo de efecto de la versión 0.1.',
          'Si elegiste tu propio comando en la 0.1, sigue funcionando junto a !inspiration.',
          '!inspiration con fichas seleccionadas sigue dando o quitando inspiración.',
        ],
      },
      troubleshooting: {
        heading: 'Solución de problemas',
        points: [
          '¿El marcador no aparece en una ficha? Pulsa Sincronizar para volver a leer todas las hojas.',
          'Una ficha que no representa a un personaje no puede tener inspiración. Vincúlala primero a un personaje.',
          '¿No pasa nada cuando un jugador pulsa Gastar? Comprueba que el personaje está asignado a ese jugador.',
          'Los errores se escriben en la consola de la API de la página Mod Scripts.',
        ],
      },
      languages: {
        heading: 'Idiomas',
        body: 'InspirationTracker está traducido a los idiomas siguientes. Elige uno con el ajuste Idioma.',
        colCode: 'Código',
        colName: 'Idioma',
        colNative: 'Nombre nativo',
      },
      credits: {
        heading: 'Créditos',
        original: 'Mod original de',
        maintainer: 'Versión 1 mantenida por',
        support: 'Informa de errores e ideas en el foro de Mods de Roll20 o en GitHub.',
      },
      footer: 'Los botones para cada acción están en el folleto "{deck}".',
    },
    deck: {
      subtitle: 'Panel de comandos',
      selectedDesc: 'Selecciona una o más fichas y luego pulsa.',
      partyDesc: 'Mira quién tiene inspiración y elige quién está en el grupo.',
      poolsTitle: 'Reserva de puntos',
      poolsDesc:
        'Con Seguimiento en Reserva de puntos: selecciona fichas, pulsa y escribe el número.',
      toolsDesc: 'Menú, ajustes, la macro de jugador y la ayuda.',
      footer: 'Las instrucciones completas están en el folleto "{help}".',
    },
  };

  const TRANSLATION$2 = {
    terms: {
      heroic: 'Heroisk inspiration',
      classic: 'Inspiration',
    },
    titles: {
      ready: 'InspirationTracker är redo.',
      settings: 'Inställningar för InspirationTracker',
      help: 'Kommandon för InspirationTracker',
      party: 'Gruppens inspiration',
      poolParty: 'Gruppens {term}',
      pools: 'Poängpotter',
      yours: 'Dina rollpersoner',
      status: 'Status för InspirationTracker',
    },
    messages: {
      gained: '{name} har {term}!',
      spent: '{name} använder {term}.',
      spentBy: '{player} använde {term} åt {name}.',
      spentSheet: '{name} har inte längre {term} (ändrat på formuläret eller token).',
      restored: '{name} har {term} igen.',
      removed: '{term} togs bort från {name}.',
      already: '{name} har redan {term}.',
      none: '{name} har inte {term}.',
      busy: '{name} uppdateras fortfarande. Försök igen om en stund.',
      passOffer:
        '{name} har redan {term} och kan inte ha den två gånger. Ge den till en gruppmedlem som inte har den, eller släpp den.',
      passNobody: 'Alla andra gruppmedlemmar har den redan.',
      passAsked: 'Spelarna för {name} har tillfrågats vem som ska få {term}.',
      passed: '{from} ger {term} till {to}!',
      passAlready: '{to} har den redan. Välj någon annan.',
      declined: '{name} släpper den extra {term}.',
      undoAlready: '{name} har den redan igen.',
      synced: 'Formulär lästa: {checked}. Med inspiration: {inspired}.',
      migrated:
        'Inställningarna från version 0.1 behölls: markör, specialeffekt och dess typ. De nya inställningarna börjar på sina standardvärden.',
      legacyCommand: 'Ditt gamla kommando {command} fungerar fortfarande, liksom {main}.',
      macroHint:
        'Kör {command} för att ge spelarna en Använd-knapp. Den lägger till en token-åtgärd för alla.',
      macro:
        'Makrot "{name}" är klart: spelarna ser det som en token-åtgärd när de markerar en token de styr.',
      journal: 'Utdelningarna Hjälp och Kommandopanel har byggts om.',
      readyHint: 'Skriv {command} för menyn, eller öppna utdelningen Kommandopanel.',
    },
    pool: {
      gained: '{name} får {amount} {term} ({before} → {after}).',
      spent: '{name} använder {amount} {term} ({before} → {after}).',
      boosted: '{name} använder {amount} {term} för +{bonus} på slaget ({before} → {after}).',
      spentBy: '{player} använde {amount} {term} åt {name}.',
      restored: '{name} har fått tillbaka {amount} {term} ({before} → {after}).',
      removed: '{amount} {term} togs bort från {name} ({before} → {after}).',
      none: '{name} saknar {term}.',
      short: '{name} har {have} {term}, och det krävs {need}.',
      full: '{name} har redan så mycket {term} som tillåts ({max}).',
    },
    pools: {
      introFlag:
        'Spårning är satt till formulärets inspirationsruta. Sätt den till Poängpott för att göra "{name}" till den pott som Ge och Använd verkar på. Andra potter används med --pool.',
      introPool:
        'Ge, Använd och Förstärk verkar på "{name}". Andra potter används från sin Grupp-knapp, eller med --pool.',
      defaultLabel: '{name} (standard)',
      name: 'Namn',
      source: 'Sparas i',
      cost: 'Poäng per +1',
      max: 'Maximum',
      marker: 'Markör',
      attribute: 'Attribut när formuläret saknar en ruta med det namnet: {attribute}',
      partyTotal: 'Gruppen har totalt: {total} {term}.',
      keptBox: 'Ruta på formuläret: {name}',
      keptAttribute: 'Attribut: {attribute}',
      keptNote: 'Ett attribut visas inte på rollformuläret.',
    },
    prompts: {
      points: 'Poäng',
      bonus: 'Bonus på slaget',
      max: 'Högsta tillåtna poäng (0 för ingen gräns)',
    },
    errors: {
      unknownPool: 'Det finns ingen pott som heter "{value}".',
      unknownPoolHint: 'Potter: {pools}.',
      badAmount: '"{value}" är inte ett antal poäng.',
      badAmountHint: 'Använd ett heltal från 1 till 9999.',
      boostNoPool: 'Förstärk använder poäng från en pott.',
      poolInvalid: 'En pott kan inte heta "{value}".',
      poolExists: 'Det finns redan en pott som heter "{value}".',
      poolFull: 'Det finns inte plats för fler potter.',
      poolNameHint:
        'Använd ett namn på högst 40 bokstäver, siffror och mellanslag som ingen annan pott har.',
      poolDefault: 'Standardpotten, "{name}", kan inte tas bort. Den kan byta namn.',
      poolMarkerHint:
        'Välj en markör ur dina markörsamlingar som inte är den i inställningen Markör.',
      poolSetHint: 'Skriv !inspiration pools för att se alla potter och deras inställningar.',
      denied: 'Du kan inte göra det för {name}.',
      gmOnly: 'Bara GM kan använda det kommandot.',
      gmOnlyHint: 'Spelare kan använda spend, party och help.',
      spendOff: 'GM har stängt av spelarnas möjlighet att använda inspiration.',
      noCharacter: 'Dessa tokens representerar ingen rollperson: {names}.',
      nothingSelected: 'Markera en token först.',
      nothingSelectedHint:
        'Markera tokens som representerar rollpersoner, eller lägg till --ids med token- eller rollperson-ID:n.',
      writeFailed: 'Kunde inte ändra formuläret för {name}.',
      offerGone: 'Det valet har redan gjorts, eller så har det gått ut.',
      passInvalid: 'Välj en annan gruppmedlem än den som har den.',
      undoGone: 'Den användningen har redan ångrats, eller är för gammal.',
      unknownMarker: 'Det finns ingen tokenmarkör som heter "{value}".',
      unknownMarkerHint:
        'Använd knappen Markör i inställningarna för att välja en ur dina markörsamlingar.',
      badSetting: 'Kan inte sätta {key} till "{value}".',
      badSettingHint: 'Skriv !inspiration set för att se alla inställningar och deras val.',
      unknownCommand: 'Okänt kommando: {command}.',
      unknownCommandHint: 'Skriv !inspiration help för listan över kommandon.',
    },
    menu: {
      selected: 'Markerade tokens',
      party: 'Grupp',
      tools: 'Verktyg',
      hint: 'Fullständiga instruktioner finns i utdelningen "{help}".',
      noSheet: 'inget formulär',
      noneYours: 'Du styr inga rollpersoner med formulär.',
      partyEmpty: 'Du styr inga gruppmedlemmar.',
      partyEmptyGm:
        'Ingen är med i gruppen än. Tilldela rollpersoner till spelare, eller markera tokens och klicka på Lägg till i grupp.',
      partyCount: '{count} av {total} har {term}.',
    },
    buttons: {
      menu: 'Meny',
      give: 'Ge',
      remove: 'Ta bort',
      toggle: 'Växla',
      spend: 'Använd',
      party: 'Grupp',
      partyAdd: 'Lägg till i grupp',
      partyRemove: 'Ta bort ur grupp',
      settings: 'Inställningar',
      macro: 'Spelarmakro',
      sync: 'Synka',
      status: 'Status',
      help: 'Hjälp',
      reset: 'Återställ inställningar',
      refresh: 'Uppdatera',
      undo: 'Ångra',
      decline: 'Släpp den',
      boost: 'Förstärk',
      pools: 'Potter',
      addPool: 'Lägg till pott',
      deletePool: 'Ta bort pott',
    },
    values: {
      on: 'På',
      off: 'Av',
      none: 'Ingen',
      noLimit: 'Ingen gräns',
      tracking: {
        flag: 'Formulärets inspirationsruta',
        pool: 'Poängpott',
      },
      source: {
        resource: 'Formulärets resursruta',
        attribute: 'Attribut',
      },
      wording: {
        2014: 'Inspiration (2014)',
        2024: 'Heroisk inspiration (2024)',
        auto: 'Från formuläret',
      },
      announce: {
        public: 'Alla',
        gm: 'GM och ägare',
        off: 'Ingen',
      },
    },
    settings: {
      language: {
        label: 'Språk',
        desc: 'Språk för menyer, meddelanden och utdelningar.',
      },
      tracking: {
        label: 'Spårning',
        desc: 'Vad Ge och Använd verkar på: inspirationsrutan på D&D-formulären, som en rollperson antingen har eller inte har, eller en pott med poäng som byggs upp och används några åt gången.',
      },
      marker: {
        label: 'Markör',
        desc: 'Tokenmarkör som visas medan en rollperson har inspiration. Egna markörsamlingar listas också.',
      },
      wording: {
        label: 'Benämning',
        desc: 'Kalla det Inspiration eller Heroisk inspiration. "Från formuläret" använder reglerna som valts på varje D&D 2024-formulär, och Inspiration på 2014-formuläret.',
      },
      announce: {
        label: 'Meddela',
        desc: 'Vem som ser chattmeddelandet när inspiration fås eller används.',
      },
      fx: {
        label: 'Specialeffekt',
        desc: 'Spela upp en specialeffekt på token när den får inspiration.',
      },
      fxType: {
        label: 'Effekttyp',
        desc: 'Vilken effekt som spelas upp, till exempel nova-holy, eller ID:t för en egen effekt.',
      },
      playerSpend: {
        label: 'Spelare kan använda',
        desc: 'Låt spelare använda inspiration för de rollpersoner de styr. GM meddelas, med en Ångra-knapp.',
      },
      playerOverview: {
        label: 'Spelare ser gruppen',
        desc: 'Låt spelare se vem i gruppen som har inspiration.',
      },
      passOn: {
        label: 'Skicka vidare (2024)',
        desc: 'Enligt 2024 års regler får en rollperson som skulle få Heroisk inspiration medan den redan har den ge den till en annan gruppmedlem.',
      },
    },
    status: {
      version: 'Version',
      beacon: 'D&D 2024-formulär',
      legacy: '2014-formulär',
      none: 'Rollpersoner utan inspirationsruta',
      rules2024: 'Använder 2024 års regler',
      party: 'Gruppmedlemmar',
      tracking: 'Spårning',
      pools: 'Potter',
      marker: 'Markör',
      fx: 'Specialeffekt',
      legacyCommand: 'Gammalt kommando',
    },
    help: {
      menu: 'Visar menyn. Med markerade tokens ger eller tar den bort inspiration, som version 0.1 gjorde.',
      give: 'Ger inspiration till de markerade rollpersonerna.',
      remove:
        'Tar bort inspiration från de markerade rollpersonerna, utan att räkna den som använd.',
      toggle:
        'Ger inspiration till markerade rollpersoner som saknar den, och tar den från dem som har den.',
      spend: 'Använder inspiration för de markerade rollpersonerna och meddelar GM.',
      party:
        'Visar vem i gruppen som har inspiration, med knappar för att ge, ta bort eller använda den.',
      partyEdit: 'Lägger till de markerade rollpersonerna i gruppen, eller tar bort dem ur den.',
      ids: 'Arbetar på de angivna token- eller rollperson-ID:na i stället för de markerade tokens.',
      points:
        'Med en poängpott: ger, tar bort eller använder så många poäng. Utan tal, 1. remove all tar alla poäng.',
      boost:
        'Med en poängpott: använder poäng för att lägga den bonusen på ett slag, till pottens kostnad för varje +1.',
      poolFlag: 'Verkar på den namngivna potten i stället för standardpotten.',
      pools: 'Visar poängpotterna och deras inställningar.',
      poolEdit: 'Lägger till en pott, eller tar bort en. Poängen på formulären lämnas som de är.',
      poolSet:
        'Ändrar en pott: dess namn, var den sparas (resource eller attribute), poängen varje +1 kostar, högsta tillåtna poäng (0 för ingen gräns) eller dess tokenmarkör.',
      undo: 'Ger tillbaka inspiration som använts. ID:t kommer från meddelandet till GM om användningen.',
      macro:
        'Lägger till token-åtgärden "Inspiration", som spelarna klickar på för att använda inspiration.',
      sync: 'Läser alla formulär igen och rättar markörerna.',
      set: 'Visar inställningarna, eller ändrar en.',
      reset: 'Återställer alla inställningar till standard, utom språket.',
      status: 'Visar versionen, hittade formulär och de viktigaste inställningarna.',
      journal: 'Bygger om utdelningarna Hjälp och Kommandopanel.',
      help: 'Visar den här listan.',
    },
    helpPlayer: {
      menu: 'Visar dina rollpersoner och om de har inspiration.',
      spend: 'Använder inspiration för den markerade rollpersonen.',
      boost: 'Använder poäng från en pott för att lägga den bonusen på ett slag.',
      party: 'Visar gruppen, om GM tillåter det.',
      help: 'Visar den här listan.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Inspiration, Heroisk inspiration och poängpotter för alla spel',
      overview: {
        heading: 'Översikt',
        body: 'InspirationTracker håller D&D-inspiration i takt på rollformuläret, token och i chatten. Ge den från menyn, formuläret eller tokenmarkören, så visar alla tokens för den rollpersonen markören. Spelare kan använda den med ett klick, och GM meddelas, med en Ångra-knapp. Det fungerar med D&D 2024-formuläret, där det kallas Heroisk inspiration, och med 2014 OGL-formuläret.',
      },
      quickStart: {
        heading: 'Snabbstart',
        steps: [
          'Öppna utdelningen Kommandopanel, eller skriv !inspiration för menyn.',
          'Markera en token och klicka på Ge. Rollpersonen får inspiration och dess tokens visar markören.',
          'Klicka på Spelarmakro en gång, så att spelarna får token-åtgärden "Inspiration" för att använda den.',
          'Klicka på Grupp för att se vem som har inspiration.',
        ],
      },
      sheets: {
        heading: 'Rollformulär',
        colSheet: 'Formulär',
        colWhere: 'Var inspirationen lagras',
        colSheet2014: 'D&D 5E by Roll20 (2014 OGL)',
        where2014: 'Rutan Inspiration, attributet "inspiration".',
        colSheet2024: 'D&D Fifth Edition (5E & 5.5E, 2024)',
        where2024: 'Rutan Heroisk inspiration, läst och skriven med getSheetItem och setSheetItem.',
        points: [
          'Att kryssa i eller ur rutan på ett formulär märks direkt: markören följer med, och att kryssa ur den räknas som att använda den.',
          'Med Benämning satt till "Från formuläret" använder varje D&D 2024-rollperson reglerna som valts i formulärets inställningar: 2024 års regler säger Heroisk inspiration, 2014 års regler säger Inspiration.',
          'Rollpersoner utan något av formulären lämnas i fred, så SLP-tokens ändras inte.',
        ],
      },
      players: {
        heading: 'Spelare',
        points: [
          'Spelare kan använda inspiration för rollpersoner de styr: klicka på Använd i chatten, eller på token-åtgärden "Inspiration".',
          'GM får ett meddelande om vem som använde den, med en Ångra-knapp.',
          'När en spelare skriver !inspiration visas spelarens rollpersoner och om de har inspiration.',
          'Stäng av Spelare kan använda för att bara GM ska kunna använda inspiration.',
        ],
      },
      passOn: {
        heading: 'Skicka vidare (2024 års regler)',
        points: [
          'En rollperson kan inte ha Heroisk inspiration två gånger. När en som har den skulle få den igen tillfrågas dess spelare om att ge den till en annan gruppmedlem som inte har den.',
          'Valet erbjuder alla gruppmedlemmar utan Heroisk inspiration, samt Släpp den. Det går ut efter en timme.',
          'Enligt 2014 års regler meddelas GM bara att rollpersonen redan har Inspiration.',
          'Stäng av Skicka vidare för att alltid få det meddelandet i stället.',
        ],
      },
      party: {
        heading: 'Gruppen',
        points: [
          'Gruppen är alla rollpersoner som en spelare styr. Markera tokens och klicka på Lägg till i grupp eller Ta bort ur grupp för att ändra den.',
          'GM:s översikt har knapparna Ge, Ta bort och Använd för varje medlem.',
          'Slå på Spelare ser gruppen för att låta spelarna också se översikten. De får bara Använd-knappar för sina egna rollpersoner.',
        ],
      },
      pools: {
        heading: 'Poängpotter',
        points: [
          'En poängpott är ett tal som byggs upp och används några åt gången: en pott med inspirationspoäng, hjältepoäng, tur, bennies och liknande. Den fungerar med alla rollformulär.',
          'Sätt Spårning till Poängpott, så verkar Ge, Ta bort och Använd på standardpotten och frågar hur många poäng. Markören visas så länge rollpersonen har några poäng.',
          'Förstärk använder poäng för att höja ett slag: skriv den bonus du vill ha, så avgör pottens Poäng per +1 kostnaden. Med 2 poäng per +1 kostar en bonus på 4 alltså 8 poäng. Mod meddelar användningen; lägg själv bonusen på slaget.',
          'En användning nekas när rollpersonen inte har tillräckligt med poäng. GM får veta vem som använde vad, med en Ångra-knapp.',
          'Sparas i "Formulärets resursruta" använder den resursruta på formuläret som har pottens namn, till exempel en Other Resource-ruta med namnet Inspiration på D&D 2014-formuläret. När formuläret inte har någon ruta med det namnet, eller med "Attribut", sparas poängen i ett vanligt attribut, till exempel inspiration_pool. D&D 2024-formuläret använder alltid attributet.',
          'Gruppkortet och en spelares eget kort säger var varje rollpersons poäng sparas: namnet på rutan på formuläret, eller attributet. Ett attribut visas inte på rollformuläret.',
          'Det går bra att ändra talet på formuläret för hand: markören följer med.',
          'Klicka på Potter för att byta namn på standardpotten, sätta dess kostnad och maximum, eller lägga till fler potter. Andra potter används från sin Grupp-knapp, eller genom att lägga till --pool och pottens namn i ett kommando.',
          'Bardic Inspiration fungerar som en egen pott: klicka på Lägg till pott och döp den till Bardic Inspiration, sätt dess Maximum till 1 och välj dess Markör. GM ger 1 från den pottens Grupp-kort när barden delar ut en tärning, och den som har tärningen klickar på Använd när den används. Mod:en markerar vem som har en tärning; spelaren slår den själv.',
        ],
      },
      markers: {
        heading: 'Tokenmarkörer',
        points: [
          'Välj markören med inställningen Markör. Roll20:s färgade prickar, standardmarkörerna och dina egna markörsamlingar listas.',
          'Att lägga till markören på en token för hand, eller med TokenMod, ger rollpersonen inspiration. Att ta bort den använder den.',
          'Att byta markör flyttar den på alla tokens direkt.',
          'D&D 2024-formulärets egna tillståndsmarkörer erbjuds inte, eftersom formuläret sätter dem själv.',
        ],
      },
      commands: {
        heading: 'Kommandon',
        intro:
          'Alla kommandon börjar med !inspiration. Kommandon verkar på de markerade tokens om inte --ids anges.',
        mods: 'Andra Mods kan också skicka dessa kommandon, till exempel från ScriptCards. Andra Mods kan också anropa InspirationTracker.give, spend, remove och isInspired.',
        colCommand: 'Kommando',
        colDesc: 'Vad det gör',
      },
      settings: {
        heading: 'Inställningar',
        intro:
          'Ändra dessa med knappen Inställningar, eller skriv !inspiration set <setting> <value>.',
        colKey: 'Inställning',
        colName: 'Namn',
        colDesc: 'Vad den gör',
      },
      upgrading: {
        heading: 'Uppgradera från 0.1',
        points: [
          'Markören, specialeffekten och effekttypen från version 0.1 behålls.',
          'Om du valde ett eget kommando i 0.1 fungerar det fortfarande vid sidan av !inspiration.',
          '!inspiration med markerade tokens ger eller tar fortfarande bort inspiration.',
        ],
      },
      troubleshooting: {
        heading: 'Felsökning',
        points: [
          'Syns inte markören på en token? Klicka på Synka för att läsa alla formulär igen.',
          'En token som inte representerar en rollperson kan inte ha inspiration. Koppla den till en rollperson först.',
          'Händer inget när en spelare klickar på Använd? Kontrollera att rollpersonen är tilldelad den spelaren.',
          'Fel skrivs till API-konsolen på sidan Mod Scripts.',
        ],
      },
      languages: {
        heading: 'Språk',
        body: 'InspirationTracker är översatt till språken nedan. Välj ett med inställningen Språk.',
        colCode: 'Kod',
        colName: 'Språk',
        colNative: 'Eget namn',
      },
      credits: {
        heading: 'Tack till',
        original: 'Ursprunglig Mod av',
        maintainer: 'Version 1 underhålls av',
        support: 'Rapportera buggar och idéer på Roll20:s Mod-forum eller på GitHub.',
      },
      footer: 'Knappar för alla åtgärder finns i utdelningen "{deck}".',
    },
    deck: {
      subtitle: 'Kommandopanel',
      selectedDesc: 'Markera en eller flera tokens och klicka sedan.',
      partyDesc: 'Se vem som har inspiration, och välj vilka som är med i gruppen.',
      poolsTitle: 'Poängpott',
      poolsDesc: 'Med Spårning satt till Poängpott: markera tokens, klicka och skriv antalet.',
      toolsDesc: 'Meny, inställningar, spelarmakrot och hjälp.',
      footer: 'Fullständiga instruktioner finns i utdelningen "{help}".',
    },
  };

  const TRANSLATION$1 = {
    terms: {
      heroic: 'Kahramanlık İlhamı',
      classic: 'İlham',
    },
    titles: {
      ready: 'InspirationTracker hazır.',
      settings: 'InspirationTracker Ayarları',
      help: 'InspirationTracker Komutları',
      party: 'Grup İlhamı',
      poolParty: 'Grup: {term}',
      pools: 'Puan Havuzları',
      yours: 'Karakterlerin',
      status: 'InspirationTracker Durumu',
    },
    messages: {
      gained: '{name}, {term} kazandı!',
      spent: '{name}, {term} kullanıyor.',
      spentBy: '{player}, {name} için {term} harcadı.',
      spentSheet: '{name} artık {term} sahibi değil (sayfada veya jetonda değiştirildi).',
      restored: '{name}, {term} geri kazandı.',
      removed: '{name} için {term} geri alındı.',
      already: '{name} zaten {term} sahibi.',
      none: '{name}: {term} yok.',
      busy: '{name} hâlâ güncelleniyor. Biraz sonra tekrar dene.',
      passOffer:
        '{name} zaten {term} sahibi ve bunu iki kez taşıyamaz. Ona sahip olmayan bir grup üyesine ver ya da bırak.',
      passNobody: 'Diğer tüm grup üyelerinde zaten var.',
      passAsked: '{name} karakterinin oyuncularına {term} kime verilsin diye soruldu.',
      passed: '{from}, {term} hakkını {to} adlı karaktere veriyor!',
      passAlready: '{to} zaten sahip. Başka birini seç.',
      declined: '{name}, fazladan {term} hakkını bırakıyor.',
      undoAlready: '{name} zaten yeniden sahip.',
      synced: 'Okunan sayfalar: {checked}. İlhamı olan: {inspired}.',
      migrated:
        '0.1 sürümündeki ayarlar korundu: işaretçi, özel efekt ve türü. Yeni ayarlar varsayılan değerleriyle başlar.',
      legacyCommand: 'Eski komutun {command}, {main} ile birlikte hâlâ çalışıyor.',
      macroHint:
        'Oyunculara bir Harca düğmesi vermek için {command} çalıştır. Herkes için bir jeton eylemi ekler.',
      macro:
        '"{name}" makrosu hazır: oyuncular kontrol ettikleri bir jetonu seçtiklerinde onu jeton eylemi olarak görür.',
      journal: 'Yardım ve Komut Paneli belgeleri yeniden oluşturuldu.',
      readyHint: 'Menü için {command} yaz veya Komut Paneli belgesini aç.',
    },
    pool: {
      gained: '{name}, {amount} {term} kazandı ({before} → {after}).',
      spent: '{name}, {amount} {term} harcadı ({before} → {after}).',
      boosted: '{name}, zara +{bonus} için {amount} {term} harcadı ({before} → {after}).',
      spentBy: '{player}, {name} için {amount} {term} harcadı.',
      restored: '{name}, {amount} {term} geri kazandı ({before} → {after}).',
      removed: '{name} için {amount} {term} geri alındı ({before} → {after}).',
      none: '{name}: {term} yok.',
      short: '{name}: {term} {have}, gereken {need}.',
      full: '{name}: {term} zaten izin verilen en yüksek değerde ({max}).',
    },
    pools: {
      introFlag:
        'Takip, sayfadaki ilham kutusuna ayarlı. Ver ve Harca düğmelerinin "{name}" havuzunda çalışması için Puan havuzu olarak ayarla. Diğer havuzlar --pool ile kullanılır.',
      introPool:
        'Ver, Harca ve Güçlendir "{name}" havuzunda çalışır. Diğer havuzlar kendi Grup düğmelerinden veya --pool ile kullanılır.',
      defaultLabel: '{name} (varsayılan)',
      name: 'Ad',
      source: 'Tutulduğu yer',
      cost: '+1 başına puan',
      max: 'En fazla',
      marker: 'İşaretçi',
      attribute: 'Sayfada bu adda bir kutu yoksa kullanılan özellik: {attribute}',
      partyTotal: 'Grup toplamı: {total} {term}.',
      keptBox: 'Sayfadaki kutu: {name}',
      keptAttribute: 'Özellik: {attribute}',
      keptNote: 'Bir özellik karakter sayfasında gösterilmez.',
    },
    prompts: {
      points: 'Puan',
      bonus: 'Zar bonusu',
      max: 'İzin verilen en fazla puan (sınırsız için 0)',
    },
    errors: {
      unknownPool: '"{value}" adında bir havuz yok.',
      unknownPoolHint: 'Havuzlar: {pools}.',
      badAmount: '"{value}" geçerli bir puan sayısı değil.',
      badAmountHint: '1 ile 9999 arasında bir tam sayı kullan.',
      boostNoPool: 'Güçlendir, bir havuzdan puan harcar.',
      poolInvalid: 'Bir havuza "{value}" adı verilemez.',
      poolExists: '"{value}" adında bir havuz zaten var.',
      poolFull: 'Yeni bir havuz için yer yok.',
      poolNameHint:
        'Başka hiçbir havuzda olmayan, en fazla 40 harf, rakam ve boşluktan oluşan bir ad kullan.',
      poolDefault: 'Varsayılan havuz "{name}" silinemez. Yeniden adlandırılabilir.',
      poolMarkerHint: 'İşaretçi setlerinden, İşaretçi ayarındakinden farklı bir işaretçi seç.',
      poolSetHint: 'Tüm havuzları ve ayarlarını görmek için !inspiration pools yaz.',
      denied: '{name} için bunu yapamazsın.',
      gmOnly: 'Bu komutu yalnızca GM kullanabilir.',
      gmOnlyHint: 'Oyuncular spend, party ve help kullanabilir.',
      spendOff: 'GM, oyuncuların harcamasını kapattı.',
      noCharacter: 'Bu jetonlar bir karakteri temsil etmiyor: {names}.',
      nothingSelected: 'Önce bir jeton seç.',
      nothingSelectedHint:
        'Karakterleri temsil eden jetonları seç veya jeton ya da karakter kimlikleriyle --ids ekle.',
      writeFailed: 'Sayfa değiştirilemedi: {name}.',
      offerGone: 'Bu seçim zaten yapıldı veya süresi doldu.',
      passInvalid: 'Ona sahip olan dışında bir grup üyesi seç.',
      undoGone: 'Bu harcama zaten geri alındı veya çok eski.',
      unknownMarker: '"{value}" adında bir jeton işaretçisi yok.',
      unknownMarkerHint:
        'İşaretçi setlerinden birini seçmek için ayarlardaki İşaretçi düğmesini kullan.',
      badSetting: '{key} ayarı "{value}" olarak ayarlanamıyor.',
      badSettingHint: 'Tüm ayarları ve seçeneklerini görmek için !inspiration set yaz.',
      unknownCommand: 'Bilinmeyen komut: {command}.',
      unknownCommandHint: 'Komut listesi için !inspiration help yaz.',
    },
    menu: {
      selected: 'Seçili jetonlar',
      party: 'Grup',
      tools: 'Araçlar',
      hint: 'Tüm talimatlar "{help}" belgesinde.',
      noSheet: 'sayfa yok',
      noneYours: 'Sayfası olan hiçbir karakteri kontrol etmiyorsun.',
      partyEmpty: 'Hiçbir grup üyesini kontrol etmiyorsun.',
      partyEmptyGm:
        'Grupta henüz kimse yok. Karakterleri oyunculara ata veya jetonları seçip Gruba Ekle düğmesine tıkla.',
      partyCount: '{count}/{total} karakterde {term} var.',
    },
    buttons: {
      menu: 'Menü',
      give: 'Ver',
      remove: 'Kaldır',
      toggle: 'Değiştir',
      spend: 'Harca',
      party: 'Grup',
      partyAdd: 'Gruba Ekle',
      partyRemove: 'Gruptan Çıkar',
      settings: 'Ayarlar',
      macro: 'Oyuncu Makrosu',
      sync: 'Eşitle',
      status: 'Durum',
      help: 'Yardım',
      reset: 'Ayarları Sıfırla',
      refresh: 'Yenile',
      undo: 'Geri Al',
      decline: 'Bırak',
      boost: 'Güçlendir',
      pools: 'Havuzlar',
      addPool: 'Havuz Ekle',
      deletePool: 'Havuzu Sil',
    },
    values: {
      on: 'Açık',
      off: 'Kapalı',
      none: 'Yok',
      noLimit: 'Sınırsız',
      tracking: {
        flag: 'Sayfadaki ilham kutusu',
        pool: 'Puan havuzu',
      },
      source: {
        resource: 'Sayfadaki kaynak kutusu',
        attribute: 'Özellik',
      },
      wording: {
        2014: 'İlham (2014)',
        2024: 'Kahramanlık İlhamı (2024)',
        auto: 'Sayfadan',
      },
      announce: {
        public: 'Herkes',
        gm: 'GM ve sahipler',
        off: 'Hiç kimse',
      },
    },
    settings: {
      language: {
        label: 'Dil',
        desc: 'Menüler, mesajlar ve belgeler için dil.',
      },
      tracking: {
        label: 'Takip',
        desc: 'Ver ve Harca düğmelerinin neyin üzerinde çalıştığı: D&D sayfalarındaki, bir karakterde ya olan ya da olmayan ilham kutusu veya birikip azar azar harcanan bir puan havuzu.',
      },
      marker: {
        label: 'İşaretçi',
        desc: 'Bir karakterde ilham varken gösterilen jeton işaretçisi. Özel işaretçi setleri de listelenir.',
      },
      wording: {
        label: 'Adlandırma',
        desc: 'İlham ya da Kahramanlık İlhamı olarak adlandır. "Sayfadan", her D&D 2024 sayfasında seçilen kuralları, 2014 sayfasında ise İlham adını kullanır.',
      },
      announce: {
        label: 'Duyur',
        desc: 'İlham kazanıldığında veya harcandığında sohbet mesajını kimin göreceği.',
      },
      fx: {
        label: 'Özel Efekt',
        desc: 'Jeton ilham kazandığında üzerinde özel bir efekt oynat.',
      },
      fxType: {
        label: 'Efekt Türü',
        desc: 'Oynatılacak efekt, örneğin nova-holy, ya da özel bir efektin kimliği.',
      },
      playerSpend: {
        label: 'Oyuncular Harcayabilir',
        desc: 'Oyuncuların kontrol ettikleri karakterler için ilham harcamasına izin ver. GM, bir Geri Al düğmesiyle bilgilendirilir.',
      },
      playerOverview: {
        label: 'Oyuncular Grubu Görür',
        desc: 'Oyuncuların gruptaki kimde ilham olduğunu görmesine izin ver.',
      },
      passOn: {
        label: 'Devret (2024)',
        desc: '2024 kurallarında, zaten Kahramanlık İlhamı olan bir karakter onu yeniden kazanacaksa başka bir grup üyesine verebilir.',
      },
    },
    status: {
      version: 'Sürüm',
      beacon: 'D&D 2024 sayfaları',
      legacy: '2014 sayfaları',
      none: 'İlham kutusu olmayan karakterler',
      rules2024: '2024 kuralları kullanılıyor',
      party: 'Grup üyeleri',
      tracking: 'Takip',
      pools: 'Havuzlar',
      marker: 'İşaretçi',
      fx: 'Özel efekt',
      legacyCommand: 'Eski komut',
    },
    help: {
      menu: 'Menüyü gösterir. Jetonlar seçiliyken, 0.1 sürümündeki gibi ilham verir veya geri alır.',
      give: 'Seçili karakterlere ilham verir.',
      remove: 'Seçili karakterlerden ilhamı, harcanmış saymadan geri alır.',
      toggle: 'İlhamı olmayan seçili karakterlere ilham verir, olanlardan geri alır.',
      spend: "Seçili karakterler için ilham harcar ve GM'e bildirir.",
      party:
        'Gruptaki kimde ilham olduğunu, vermek, kaldırmak veya harcamak için düğmelerle gösterir.',
      partyEdit: 'Seçili karakterleri gruba ekler veya gruptan çıkarır.',
      ids: 'Seçili jetonlar yerine verilen jeton veya karakter kimlikleri üzerinde çalışır.',
      points:
        'Puan havuzuyla: o kadar puan verir, geri alır veya harcar. Sayı verilmezse 1. remove all tüm puanları alır.',
      boost:
        'Puan havuzuyla: bir zara o bonusu eklemek için, havuzun her +1 için belirlediği bedelle puan harcar.',
      poolFlag: 'Varsayılan havuz yerine adı verilen havuz üzerinde çalışır.',
      pools: 'Puan havuzlarını ve ayarlarını gösterir.',
      poolEdit: 'Bir havuz ekler veya siler. Sayfalardaki puanlar olduğu gibi kalır.',
      poolSet:
        'Bir havuzu değiştirir: adını, nerede tutulduğunu (resource veya attribute), her +1 için gereken puanı, izin verilen en fazla puanı (sınırsız için 0) veya jeton işaretçisini.',
      undo: 'Harcanan ilhamı geri verir. Kimlik, harcama hakkındaki GM mesajından gelir.',
      macro: 'Oyuncuların ilham harcamak için tıkladığı "Inspiration" jeton eylemini ekler.',
      sync: 'Tüm sayfaları yeniden okur ve işaretçileri düzeltir.',
      set: 'Ayarları gösterir veya birini değiştirir.',
      reset: 'Dil dışındaki tüm ayarları varsayılana döndürür.',
      status: 'Sürümü, bulunan sayfaları ve temel ayarları gösterir.',
      journal: 'Yardım ve Komut Paneli belgelerini yeniden oluşturur.',
      help: 'Bu listeyi gösterir.',
    },
    helpPlayer: {
      menu: 'Karakterlerini ve ilhamları olup olmadığını gösterir.',
      spend: 'Seçili karakter için ilham harcar.',
      boost: 'Bir zara o bonusu eklemek için bir havuzdan puan harcar.',
      party: 'GM izin veriyorsa grubu gösterir.',
      help: 'Bu listeyi gösterir.',
    },
    handout: {
      versionLabel: 'Sürüm',
      subtitle: 'Her oyun için İlham, Kahramanlık İlhamı ve puan havuzları',
      overview: {
        heading: 'Genel Bakış',
        body: 'InspirationTracker, D&D ilhamını karakter sayfası, jeton ve sohbet arasında uyumlu tutar. Menüden, sayfadan veya jeton işaretçisinden ver; o karakterin tüm jetonları işaretçiyi gösterir. Oyuncular tek tıkla harcayabilir ve GM bir Geri Al düğmesiyle bilgilendirilir. Kahramanlık İlhamı adıyla geçtiği D&D 2024 sayfasıyla ve 2014 OGL sayfasıyla çalışır.',
      },
      quickStart: {
        heading: 'Hızlı Başlangıç',
        steps: [
          'Komut Paneli belgesini aç veya menü için !inspiration yaz.',
          'Bir jeton seç ve Ver düğmesine tıkla. Karakter ilham kazanır ve jetonları işaretçiyi gösterir.',
          'Oyuncuların ilham harcamak için "Inspiration" jeton eylemine sahip olması için Oyuncu Makrosu düğmesine bir kez tıkla.',
          'Kimde ilham olduğunu görmek için Grup düğmesine tıkla.',
        ],
      },
      sheets: {
        heading: 'Karakter Sayfaları',
        colSheet: 'Sayfa',
        colWhere: 'İlhamın tutulduğu yer',
        colSheet2014: 'D&D 5E by Roll20 (2014 OGL)',
        where2014: 'İlham kutusu, "inspiration" özniteliği.',
        colSheet2024: 'D&D Fifth Edition (5E & 5.5E, 2024)',
        where2024: 'Kahramanlık İlhamı kutusu; getSheetItem ve setSheetItem ile okunur ve yazılır.',
        points: [
          'Bir sayfadaki kutunun işaretlenmesi veya temizlenmesi hemen fark edilir: işaretçi de değişir ve kutuyu temizlemek harcama sayılır.',
          'Adlandırma "Sayfadan" olarak ayarlıysa her D&D 2024 karakteri kendi sayfa ayarlarında seçilen kuralları kullanır: 2024 kuralları Kahramanlık İlhamı, 2014 kuralları İlham der.',
          'İki sayfadan hiçbirine sahip olmayan karakterlere dokunulmaz, bu yüzden NPC jetonları değişmez.',
        ],
      },
      players: {
        heading: 'Oyuncular',
        points: [
          'Oyuncular kontrol ettikleri karakterler için ilham harcayabilir: sohbette Harca düğmesine veya "Inspiration" jeton eylemine tıklayarak.',
          'GM, kimin harcadığını bildiren ve bir Geri Al düğmesi içeren bir mesaj alır.',
          'Bir oyuncu !inspiration yazınca karakterlerini ve ilhamları olup olmadığını görür.',
          "Harcamayı yalnızca GM'e bırakmak için Oyuncular Harcayabilir ayarını kapat.",
        ],
      },
      passOn: {
        heading: 'Devretme (2024 Kuralları)',
        points: [
          'Bir karakterde iki kez Kahramanlık İlhamı olamaz. Ona sahip bir karakter yeniden kazanacaksa, oyuncularından onu sahip olmayan başka bir grup üyesine vermeleri istenir.',
          'Seçimde Kahramanlık İlhamı olmayan tüm grup üyeleri ve Bırak seçeneği bulunur. Bir saat sonra süresi dolar.',
          "2014 kurallarında GM'e yalnızca karakterin zaten İlham sahibi olduğu bildirilir.",
          'Her zaman bu mesajı almak için Devret ayarını kapat.',
        ],
      },
      party: {
        heading: 'Grup',
        points: [
          'Grup, bir oyuncunun kontrol ettiği tüm karakterlerdir. Değiştirmek için jetonları seç ve Gruba Ekle veya Gruptan Çıkar düğmesine tıkla.',
          "GM'in genel görünümünde her üye için Ver, Kaldır ve Harca düğmeleri vardır.",
          'Oyuncuların da genel görünümü görmesi için Oyuncular Grubu Görür ayarını aç. Harca düğmelerini yalnızca kendi karakterleri için görürler.',
        ],
      },
      pools: {
        heading: 'Puan Havuzları',
        points: [
          'Puan havuzu, birikip azar azar harcanan bir sayıdır: ilham puanları, kahraman puanları, şans, bennies ve benzeri. Her karakter sayfasıyla çalışır.',
          'Takip ayarını Puan havuzu yap; Ver, Kaldır ve Harca varsayılan havuz üzerinde çalışır ve kaç puan olduğunu sorar. Karakterin puanı olduğu sürece işaretçi görünür.',
          'Güçlendir, bir zarı yükseltmek için puan harcar: istediğin bonusu yaz, bedeli havuzun +1 başına puan ayarı belirler. +1 başına 2 puanda, 4 bonus 8 puana mal olur. Mod harcamayı duyurur; bonusu zara kendin ekle.',
          "Karakterin yeterli puanı yoksa harcama reddedilir. GM'e kimin ne harcadığı bir Geri Al düğmesiyle bildirilir.",
          'Tutulduğu yer ayarındaki "Sayfadaki kaynak kutusu", sayfada havuzun adını taşıyan kaynak kutusunu kullanır; örneğin 2014 D&D sayfasında Inspiration adlı bir Other Resource kutusu. Sayfada bu adda bir kutu yoksa veya "Özellik" seçiliyse puanlar inspiration_pool gibi düz bir özellikte tutulur. D&D 2024 sayfası her zaman özelliği kullanır.',
          'Grup kartı ve oyuncunun kendi kartı, her karakterin puanlarının nerede tutulduğunu söyler: sayfadaki kutunun adı ya da özellik. Bir özellik karakter sayfasında gösterilmez.',
          'Sayfadaki sayıyı elle değiştirmek sorun olmaz: işaretçi buna uyar.',
          'Varsayılan havuzu yeniden adlandırmak, bedelini ve üst sınırını ayarlamak veya başka havuzlar eklemek için Havuzlar düğmesine tıkla. Diğer havuzlar kendi Grup düğmelerinden veya bir komuta --pool ve havuzun adı eklenerek kullanılır.',
          'Bardic Inspiration ayrı bir havuz olarak çalışır: Havuz Ekle düğmesine tıkla ve adını Bardic Inspiration koy, En fazla değerini 1 yap ve İşaretçisini seç. Ozan bir zar verdiğinde GM o havuzun Grup kartından 1 verir, zarı elinde tutan da kullanırken Harca düğmesine tıklar. Mod kimin zar tuttuğunu işaretler; zarı oyuncu kendisi atar.',
        ],
      },
      markers: {
        heading: 'Jeton İşaretçileri',
        points: [
          "İşaretçiyi İşaretçi ayarıyla seç. Roll20'nin renkli noktaları, varsayılan işaretçiler ve özel işaretçi setlerin listelenir.",
          'İşaretçiyi bir jetona elle veya TokenMod ile eklemek karaktere ilham verir. Kaldırmak ilhamı harcar.',
          'İşaretçiyi değiştirmek onu tüm jetonlarda hemen taşır.',
          'D&D 2024 sayfasının kendi durum işaretçileri sunulmaz, çünkü sayfa onları kendisi ayarlar.',
        ],
      },
      commands: {
        heading: 'Komutlar',
        intro:
          'Her komut !inspiration ile başlar. --ids verilmedikçe komutlar seçili jetonlar üzerinde çalışır.',
        mods: "Diğer Mod'lar da bu komutları gönderebilir, örneğin ScriptCards üzerinden. Diğer Mod'lar ayrıca InspirationTracker.give, spend, remove ve isInspired çağırabilir.",
        colCommand: 'Komut',
        colDesc: 'Ne yapar',
      },
      settings: {
        heading: 'Ayarlar',
        intro: 'Bunları Ayarlar düğmesiyle değiştir veya !inspiration set <setting> <value> yaz.',
        colKey: 'Ayar',
        colName: 'Ad',
        colDesc: 'Ne yapar',
      },
      upgrading: {
        heading: '0.1 Sürümünden Yükseltme',
        points: [
          '0.1 sürümündeki işaretçi, özel efekt ve efekt türü korunur.',
          '0.1 sürümünde kendi komutunu seçtiysen, !inspiration ile birlikte hâlâ çalışır.',
          'Jetonlar seçiliyken !inspiration hâlâ ilham verir veya geri alır.',
        ],
      },
      troubleshooting: {
        heading: 'Sorun Giderme',
        points: [
          'İşaretçi bir jetonda görünmüyor mu? Tüm sayfaları yeniden okumak için Eşitle düğmesine tıkla.',
          'Bir karakteri temsil etmeyen jetonda ilham olamaz. Önce onu bir karaktere bağla.',
          'Bir oyuncu Harca düğmesine tıklayınca hiçbir şey olmuyor mu? Karakterin o oyuncuya atandığını kontrol et.',
          'Hatalar Mod Scripts sayfasındaki API konsoluna yazılır.',
        ],
      },
      languages: {
        heading: 'Diller',
        body: 'InspirationTracker aşağıdaki dillere çevrilmiştir. Dil ayarıyla birini seç.',
        colCode: 'Kod',
        colName: 'Dil',
        colNative: 'Yerel adı',
      },
      credits: {
        heading: 'Emeği Geçenler',
        original: 'Özgün Mod yazarı:',
        maintainer: 'Sürüm 1 bakımını yapan:',
        support: "Hataları ve fikirleri Roll20 Mod forumunda veya GitHub'da bildir.",
      },
      footer: 'Her işlem için düğmeler "{deck}" belgesinde.',
    },
    deck: {
      subtitle: 'Komut Paneli',
      selectedDesc: 'Bir veya daha fazla jeton seç, sonra tıkla.',
      partyDesc: 'Kimde ilham olduğunu gör ve grupta kimlerin olacağını seç.',
      poolsTitle: 'Puan havuzu',
      poolsDesc: 'Takip, Puan havuzu olarak ayarlıyken: jetonları seç, tıkla ve sayıyı yaz.',
      toolsDesc: 'Menü, ayarlar, oyuncu makrosu ve yardım.',
      footer: 'Tüm talimatlar "{help}" belgesinde.',
    },
  };

  const TRANSLATION = {
    terms: {
      heroic: 'Героїчне натхнення',
      classic: 'Натхнення',
    },
    titles: {
      ready: 'InspirationTracker готовий.',
      settings: 'Налаштування InspirationTracker',
      help: 'Команди InspirationTracker',
      party: 'Натхнення групи',
      poolParty: 'Група: {term}',
      pools: 'Пули очок',
      yours: 'Ваші персонажі',
      status: 'Стан InspirationTracker',
    },
    messages: {
      gained: '{name} має {term}!',
      spent: '{name} використовує {term}.',
      spentBy: '{player} витратив {term} за {name}.',
      spentSheet: '{name}: {term} більше відсутнє (змінено на аркуші або токені).',
      restored: '{name} знову має {term}.',
      removed: '{term} забрано в {name}.',
      already: '{name} вже має {term}.',
      none: '{name}: {term} відсутнє.',
      busy: '{name} ще оновлюється. Спробуйте ще раз за мить.',
      passOffer:
        '{name} вже має {term} і не може мати його двічі. Передайте його учаснику групи, який його не має, або відмовтеся.',
      passNobody: 'Усі інші учасники групи вже його мають.',
      passAsked: 'Гравців {name} запитали, хто має отримати {term}.',
      passed: '{from} передає {term} для {to}!',
      passAlready: '{to} вже його має. Оберіть когось іншого.',
      declined: '{name} відмовляється від зайвого: {term}.',
      undoAlready: '{name} вже знову його має.',
      synced: 'Прочитано аркушів: {checked}. З натхненням: {inspired}.',
      migrated:
        'Налаштування з версії 0.1 збережено: маркер, спецефект і його тип. Нові налаштування мають типові значення.',
      legacyCommand: 'Ваша стара команда {command} і далі працює, як і {main}.',
      macroHint:
        'Щоб дати гравцям кнопку «Витратити», виконайте {command}. Це додає дію токена для всіх.',
      macro:
        'Макрос "{name}" готовий: гравці бачать його як дію токена, коли вибирають токен під своїм керуванням.',
      journal: 'Роздаткові матеріали «Довідка» і «Панель команд» перебудовано.',
      readyHint:
        'Введіть {command}, щоб відкрити меню, або відкрийте роздатковий матеріал «Панель команд».',
    },
    pool: {
      gained: '{name} отримує {term}: {amount} ({before} → {after}).',
      spent: '{name} витрачає {term}: {amount} ({before} → {after}).',
      boosted: '{name} витрачає {term}: {amount} — +{bonus} до кидка ({before} → {after}).',
      spentBy: '{player} витратив {term} ({amount}) за {name}.',
      restored: '{name} отримує назад {term}: {amount} ({before} → {after}).',
      removed: '{term}: {amount} забрано в {name} ({before} → {after}).',
      none: '{name}: немає очок ({term}).',
      short: '{name}: {term} — {have}, а потрібно {need}.',
      full: '{name}: {term} уже на максимумі ({max}).',
    },
    pools: {
      introFlag:
        '«Відстеження» має значення «Поле натхнення на аркуші». Установіть «Пул очок», щоб «Дати» і «Витратити» працювали з пулом "{name}". Інші пули використовуються через --pool.',
      introPool:
        '«Дати», «Витратити» і «Підсилити» працюють з пулом "{name}". Інші пули використовуються через їхню кнопку «Група» або через --pool.',
      defaultLabel: '{name} (типовий)',
      name: 'Назва',
      source: 'Зберігається в',
      cost: 'Очок за +1',
      max: 'Максимум',
      marker: 'Маркер',
      attribute: 'Атрибут, якщо на аркуші немає поля з такою назвою: {attribute}',
      partyTotal: 'Усього в групи: {term} — {total}.',
      keptBox: 'Поле на аркуші: {name}',
      keptAttribute: 'Атрибут: {attribute}',
      keptNote: 'Атрибут не показується на аркуші персонажа.',
    },
    prompts: {
      points: 'Очки',
      bonus: 'Бонус до кидка',
      max: 'Максимум очок (0 — без обмеження)',
    },
    errors: {
      unknownPool: 'Немає пулу з назвою "{value}".',
      unknownPoolHint: 'Пули: {pools}.',
      badAmount: '"{value}" — не кількість очок.',
      badAmountHint: 'Використовуйте ціле число від 1 до 9999.',
      boostNoPool: '«Підсилити» витрачає очки з пулу.',
      poolInvalid: 'Пул не можна назвати "{value}".',
      poolExists: 'Пул з назвою "{value}" уже є.',
      poolFull: 'Для ще одного пулу немає місця.',
      poolNameHint:
        'Використовуйте назву до 40 літер, цифр і пробілів, якої не має жоден інший пул.',
      poolDefault: 'Типовий пул, "{name}", не можна видалити. Його можна перейменувати.',
      poolMarkerHint:
        'Оберіть маркер з ваших наборів маркерів, інший, ніж у налаштуванні «Маркер».',
      poolSetHint: 'Введіть !inspiration pools, щоб побачити всі пули та їхні налаштування.',
      denied: 'Ви не можете зробити це для {name}.',
      gmOnly: 'Цю команду може використовувати лише GM.',
      gmOnlyHint: 'Гравці можуть використовувати spend, party і help.',
      spendOff: 'GM вимкнув витрачання натхнення гравцями.',
      noCharacter: 'Ці токени не представляють персонажа: {names}.',
      nothingSelected: 'Спершу виберіть токен.',
      nothingSelectedHint:
        'Виберіть токени, що представляють персонажів, або додайте --ids з ID токенів чи персонажів.',
      writeFailed: 'Не вдалося змінити аркуш {name}.',
      offerGone: 'Цей вибір уже зроблено, або його час минув.',
      passInvalid: 'Оберіть іншого учасника групи, не того, хто його має.',
      undoGone: 'Цю витрату вже скасовано, або вона надто стара.',
      unknownMarker: 'Немає маркера токена з назвою "{value}".',
      unknownMarkerHint:
        'Скористайтеся кнопкою «Маркер» у налаштуваннях, щоб вибрати маркер з ваших наборів.',
      badSetting: 'Не можна встановити {key} у значення "{value}".',
      badSettingHint: 'Введіть !inspiration set, щоб побачити всі налаштування та їхні варіанти.',
      unknownCommand: 'Невідома команда: {command}.',
      unknownCommandHint: 'Введіть !inspiration help, щоб побачити список команд.',
    },
    menu: {
      selected: 'Вибрані токени',
      party: 'Група',
      tools: 'Інструменти',
      hint: 'Повні інструкції — у роздатковому матеріалі "{help}".',
      noSheet: 'немає аркуша',
      noneYours: 'Ви не керуєте жодним персонажем з аркушем.',
      partyEmpty: 'Ви не керуєте жодним учасником групи.',
      partyEmptyGm:
        'У групі ще нікого немає. Призначте персонажів гравцям або виберіть токени й натисніть «Додати до групи».',
      partyCount: '{term}: {count} з {total}.',
    },
    buttons: {
      menu: 'Меню',
      give: 'Дати',
      remove: 'Забрати',
      toggle: 'Перемкнути',
      spend: 'Витратити',
      party: 'Група',
      partyAdd: 'Додати до групи',
      partyRemove: 'Вилучити з групи',
      settings: 'Налаштування',
      macro: 'Макрос гравця',
      sync: 'Синхронізувати',
      status: 'Стан',
      help: 'Довідка',
      reset: 'Скинути налаштування',
      refresh: 'Оновити',
      undo: 'Скасувати',
      decline: 'Відмовитися',
      boost: 'Підсилити',
      pools: 'Пули',
      addPool: 'Додати пул',
      deletePool: 'Видалити пул',
    },
    values: {
      on: 'Увімк.',
      off: 'Вимк.',
      none: 'Немає',
      noLimit: 'Без обмеження',
      tracking: {
        flag: 'Поле натхнення на аркуші',
        pool: 'Пул очок',
      },
      source: {
        resource: 'Поле ресурсу на аркуші',
        attribute: 'Атрибут',
      },
      wording: {
        2014: 'Натхнення (2014)',
        2024: 'Героїчне натхнення (2024)',
        auto: 'З аркуша',
      },
      announce: {
        public: 'Усі',
        gm: 'GM і власники',
        off: 'Ніхто',
      },
    },
    settings: {
      language: {
        label: 'Мова',
        desc: 'Мова меню, повідомлень і роздаткових матеріалів.',
      },
      tracking: {
        label: 'Відстеження',
        desc: 'З чим працюють «Дати» і «Витратити»: з полем натхнення на аркушах D&D, яке персонаж або має, або ні, чи з пулом очок, які накопичуються і витрачаються потроху.',
      },
      marker: {
        label: 'Маркер',
        desc: 'Маркер токена, який показується, поки персонаж має натхнення. Власні набори маркерів теж є в списку.',
      },
      wording: {
        label: 'Назва',
        desc: 'Називати його Натхнення чи Героїчне натхнення. «З аркуша» бере правила, обрані на кожному аркуші D&D 2024, і Натхнення на аркуші 2014.',
      },
      announce: {
        label: 'Оголошення',
        desc: 'Хто бачить повідомлення в чаті, коли натхнення отримано або витрачено.',
      },
      fx: {
        label: 'Спецефект',
        desc: 'Показувати спецефект на токені, коли він отримує натхнення.',
      },
      fxType: {
        label: 'Тип ефекту',
        desc: 'Який ефект показувати, наприклад nova-holy, або ID власного ефекту.',
      },
      playerSpend: {
        label: 'Гравці можуть витрачати',
        desc: 'Дозволити гравцям витрачати натхнення персонажів, якими вони керують. GM отримує повідомлення з кнопкою «Скасувати».',
      },
      playerOverview: {
        label: 'Гравці бачать групу',
        desc: 'Дозволити гравцям бачити, хто в групі має натхнення.',
      },
      passOn: {
        label: 'Передати (2024)',
        desc: 'За правилами 2024 року персонаж, який мав би отримати Героїчне натхнення, вже маючи його, може передати його іншому учаснику групи.',
      },
    },
    status: {
      version: 'Версія',
      beacon: 'Аркуші D&D 2024',
      legacy: 'Аркуші 2014',
      none: 'Персонажі без поля натхнення',
      rules2024: 'Діють правила 2024',
      party: 'Учасники групи',
      tracking: 'Відстеження',
      pools: 'Пули',
      marker: 'Маркер',
      fx: 'Спецефект',
      legacyCommand: 'Стара команда',
    },
    help: {
      menu: 'Показує меню. Якщо вибрано токени, дає або забирає натхнення, як у версії 0.1.',
      give: 'Дає натхнення вибраним персонажам.',
      remove: 'Забирає натхнення у вибраних персонажів, не зараховуючи його як витрачене.',
      toggle: 'Дає натхнення вибраним персонажам без нього і забирає в тих, хто його має.',
      spend: 'Витрачає натхнення вибраних персонажів і повідомляє GM.',
      party:
        'Показує, хто в групі має натхнення, з кнопками, щоб дати, забрати або витратити його.',
      partyEdit: 'Додає вибраних персонажів до групи або вилучає їх з неї.',
      ids: 'Працює з указаними ID токенів чи персонажів замість вибраних токенів.',
      points:
        'З пулом очок: дає, забирає або витрачає вказану кількість очок. Без числа — 1. remove all забирає всі очки.',
      boost:
        'З пулом очок: витрачає очки, щоб додати вказаний бонус до кидка, за ціною пулу за кожен +1.',
      poolFlag: 'Працює з указаним пулом замість типового.',
      pools: 'Показує пули очок та їхні налаштування.',
      poolEdit: 'Додає пул або видаляє його. Очки на аркушах залишаються як є.',
      poolSet:
        'Змінює пул: його назву, місце зберігання (resource або attribute), кількість очок за кожен +1, максимум очок (0 — без обмеження) або його маркер токена.',
      undo: 'Повертає витрачене натхнення. ID береться з повідомлення для GM про витрату.',
      macro: 'Додає дію токена "Inspiration", яку гравці натискають, щоб витратити натхнення.',
      sync: 'Знову читає всі аркуші й виправляє маркери.',
      set: 'Показує налаштування або змінює одне з них.',
      reset: 'Повертає всі налаштування до типових, крім мови.',
      status: 'Показує версію, знайдені аркуші й основні налаштування.',
      journal: 'Перебудовує роздаткові матеріали «Довідка» і «Панель команд».',
      help: 'Показує цей список.',
    },
    helpPlayer: {
      menu: 'Показує ваших персонажів і чи мають вони натхнення.',
      spend: 'Витрачає натхнення вибраного персонажа.',
      boost: 'Витрачає очки з пулу, щоб додати вказаний бонус до кидка.',
      party: 'Показує групу, якщо GM дозволяє.',
      help: 'Показує цей список.',
    },
    handout: {
      versionLabel: 'Версія',
      subtitle: 'Натхнення, Героїчне натхнення і пули очок для будь-якої гри',
      overview: {
        heading: 'Огляд',
        body: 'InspirationTracker узгоджує натхнення D&D на аркуші персонажа, токені та в чаті. Давайте його з меню, аркуша або маркером токена, і всі токени цього персонажа показують маркер. Гравці можуть витратити його одним натисканням, а GM отримує повідомлення з кнопкою «Скасувати». Працює з аркушем D&D 2024, де воно називається Героїчне натхнення, і з аркушем 2014 OGL.',
      },
      quickStart: {
        heading: 'Швидкий старт',
        steps: [
          'Відкрийте роздатковий матеріал «Панель команд» або введіть !inspiration, щоб відкрити меню.',
          'Виберіть токен і натисніть «Дати». Персонаж отримує натхнення, а його токени показують маркер.',
          'Натисніть «Макрос гравця» один раз, щоб гравці отримали дію токена "Inspiration" для витрачання.',
          'Натисніть «Група», щоб побачити, хто має натхнення.',
        ],
      },
      sheets: {
        heading: 'Аркуші персонажів',
        colSheet: 'Аркуш',
        colWhere: 'Де зберігається натхнення',
        colSheet2014: 'D&D 5E by Roll20 (2014 OGL)',
        where2014: 'Поле «Натхнення», атрибут "inspiration".',
        colSheet2024: 'D&D Fifth Edition (5E & 5.5E, 2024)',
        where2024:
          'Поле «Героїчне натхнення», читається і записується через getSheetItem і setSheetItem.',
        points: [
          'Позначення чи зняття позначки на аркуші помічається одразу: маркер змінюється слідом, а зняття позначки вважається витратою.',
          'Якщо «Назва» має значення «З аркуша», кожен персонаж D&D 2024 використовує правила, обрані в налаштуваннях його аркуша: за правилами 2024 — Героїчне натхнення, за правилами 2014 — Натхнення.',
          'Персонажів без жодного з цих аркушів не чіпають, тож токени NPC не змінюються.',
        ],
      },
      players: {
        heading: 'Гравці',
        points: [
          'Гравці можуть витрачати натхнення персонажів, якими керують: натиснувши «Витратити» в чаті або дію токена "Inspiration".',
          'GM отримує повідомлення про те, хто його витратив, з кнопкою «Скасувати».',
          'Коли гравець вводить !inspiration, він бачить своїх персонажів і чи мають вони натхнення.',
          'Вимкніть «Гравці можуть витрачати», щоб витрачання залишалося в руках GM.',
        ],
      },
      passOn: {
        heading: 'Передавання (правила 2024)',
        points: [
          'Персонаж не може мати Героїчне натхнення двічі. Коли той, хто його має, мав би отримати його знову, його гравцям пропонують передати його іншому учаснику групи, який його не має.',
          'У виборі є всі учасники групи без Героїчного натхнення, а також «Відмовитися». Пропозиція діє одну годину.',
          'За правилами 2014 GM просто отримує повідомлення, що персонаж уже має Натхнення.',
          'Вимкніть «Передати», щоб завжди отримувати це повідомлення.',
        ],
      },
      party: {
        heading: 'Група',
        points: [
          'Група — це всі персонажі, якими керують гравці. Виберіть токени й натисніть «Додати до групи» або «Вилучити з групи», щоб змінити її.',
          'В огляді GM є кнопки «Дати», «Забрати» і «Витратити» для кожного учасника.',
          'Увімкніть «Гравці бачать групу», щоб гравці теж бачили огляд. Кнопки «Витратити» вони отримують лише для власних персонажів.',
        ],
      },
      pools: {
        heading: 'Пули очок',
        points: [
          'Пул очок — це число, яке накопичується і витрачається потроху: очки натхнення, очки героя, удача, bennies тощо. Він працює з будь-яким аркушем персонажа.',
          'Установіть для «Відстеження» значення «Пул очок», і кнопки «Дати», «Забрати» і «Витратити» працюватимуть з типовим пулом, запитуючи кількість очок. Маркер показується, поки персонаж має хоча б одне очко.',
          '«Підсилити» витрачає очки, щоб підвищити кидок: введіть потрібний бонус, а налаштування пулу «Очок за +1» визначить ціну. При 2 очках за +1 бонус 4 коштує 8 очок. Mod оголошує витрату; бонус до кидка додайте самі.',
          'Витрату буде відхилено, якщо персонаж не має достатньо очок. GM отримує повідомлення про те, хто і скільки витратив, з кнопкою «Скасувати».',
          'Варіант «Поле ресурсу на аркуші» в налаштуванні «Зберігається в» використовує поле ресурсу на аркуші, назване так само, як пул, наприклад поле Other Resource з назвою Inspiration на аркуші D&D 2014. Якщо на аркуші немає поля з такою назвою або вибрано «Атрибут», очки зберігаються у звичайному атрибуті, наприклад inspiration_pool. Аркуш D&D 2024 завжди використовує атрибут.',
          'Картка групи та власна картка гравця повідомляють, де зберігаються очки кожного персонажа: назва поля на аркуші або атрибут. Атрибут не показується на аркуші персонажа.',
          'Змінювати число на аркуші вручну можна: маркер зміниться слідом.',
          'Натисніть «Пули», щоб перейменувати типовий пул, задати його ціну й максимум або додати інші пули. Інші пули використовуються через їхню кнопку «Група» або додаванням --pool і назви пулу до команди.',
          'Bardic Inspiration працює як окремий пул: натисніть «Додати пул» і назвіть його Bardic Inspiration, задайте «Максимум» рівним 1 і виберіть «Маркер». GM дає 1 з картки «Група» цього пулу, коли бард роздає кістку, а її власник натискає «Витратити», коли використовує її. Mod позначає, у кого є кістка; гравець кидає її сам.',
        ],
      },
      markers: {
        heading: 'Маркери токенів',
        points: [
          'Оберіть маркер у налаштуванні «Маркер». У списку є кольорові точки Roll20, типові маркери та ваші власні набори маркерів.',
          'Додавання маркера на токен вручну або через TokenMod дає персонажу натхнення. Зняття маркера витрачає його.',
          'Зміна маркера одразу переносить його на всіх токенах.',
          'Власні маркери станів аркуша D&D 2024 не пропонуються, бо аркуш встановлює їх сам.',
        ],
      },
      commands: {
        heading: 'Команди',
        intro:
          'Кожна команда починається з !inspiration. Команди діють на вибрані токени, якщо не вказано --ids.',
        mods: 'Інші Mods теж можуть надсилати ці команди, наприклад зі ScriptCards. Інші Mods також можуть викликати InspirationTracker.give, spend, remove та isInspired.',
        colCommand: 'Команда',
        colDesc: 'Що робить',
      },
      settings: {
        heading: 'Налаштування',
        intro: 'Змінюйте їх кнопкою «Налаштування» або введіть !inspiration set <setting> <value>.',
        colKey: 'Налаштування',
        colName: 'Назва',
        colDesc: 'Що робить',
      },
      upgrading: {
        heading: 'Оновлення з 0.1',
        points: [
          'Маркер, спецефект і тип ефекту з версії 0.1 зберігаються.',
          'Якщо у 0.1 ви вибрали власну команду, вона і далі працює поряд з !inspiration.',
          '!inspiration з вибраними токенами і далі дає або забирає натхнення.',
        ],
      },
      troubleshooting: {
        heading: 'Усунення несправностей',
        points: [
          'Маркер не з’являється на токені? Натисніть «Синхронізувати», щоб знову прочитати всі аркуші.',
          'Токен, що не представляє персонажа, не може мати натхнення. Спершу пов’яжіть його з персонажем.',
          'Нічого не відбувається, коли гравець натискає «Витратити»? Перевірте, що персонажа призначено цьому гравцю.',
          'Помилки записуються в консоль API на сторінці Mod Scripts.',
        ],
      },
      languages: {
        heading: 'Мови',
        body: 'InspirationTracker перекладено мовами, наведеними нижче. Оберіть мову в налаштуванні «Мова».',
        colCode: 'Код',
        colName: 'Мова',
        colNative: 'Власна назва',
      },
      credits: {
        heading: 'Подяки',
        original: 'Оригінальний Mod створив',
        maintainer: 'Версію 1 підтримує',
        support: 'Повідомляйте про помилки та ідеї на форумі Mod на Roll20 або на GitHub.',
      },
      footer: 'Кнопки для всіх дій — у роздатковому матеріалі "{deck}".',
    },
    deck: {
      subtitle: 'Панель команд',
      selectedDesc: 'Виберіть один або кілька токенів, потім натисніть.',
      partyDesc: 'Подивіться, хто має натхнення, і оберіть, хто входить до групи.',
      poolsTitle: 'Пул очок',
      poolsDesc:
        'Коли «Відстеження» має значення «Пул очок»: виберіть токени, натисніть і введіть число.',
      toolsDesc: 'Меню, налаштування, макрос гравця і довідка.',
      footer: 'Повні інструкції — у роздатковому матеріалі "{help}".',
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

  // ---------------------------------------------------------------------------
  // Value validation (pure)
  // ---------------------------------------------------------------------------

  /**
   * Returns true when text names a built-in special effect ("nova-holy") or
   * looks like the ID of a custom one.
   *
   * @param {string} text Effect name.
   * @returns {boolean} True when usable with spawnFx.
   */
  function isFxType(text) {
    const [type, colour, extra] = text.split('-');
    if (extra === undefined && FX_TYPES.includes(type) && FX_COLOURS.includes(colour)) {
      return true;
    }
    // Custom effects are referred to by their custfx object ID.
    return /^-[\w-]{6,}$/.test(text);
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
    const flag = () => {
      const b = parseBoolean(raw);
      return b === null ? bad : ok(b);
    };

    switch (key) {
      case 'language': {
        const lang = normalizeLocale(raw);
        return lang ? ok(lang) : bad;
      }
      case 'marker': {
        const text = toText(raw);
        return /^[^,@\s][^,@]{0,99}$/.test(text) ? ok(text) : bad;
      }
      case 'tracking':
        return option(TRACKING_OPTIONS);
      case 'wording':
        return option(WORDING_OPTIONS);
      case 'announce':
        return option(ANNOUNCE_OPTIONS);
      case 'fxType': {
        const text = toText(raw);
        return isFxType(text) ? ok(text) : bad;
      }
      case 'fx':
      case 'playerSpend':
      case 'playerOverview':
      case 'passOn':
        return flag();
      default:
        return bad;
    }
  }

  /**
   * Merges a possibly incomplete or invalid config with defaults.
   *
   * @param {object} config Config to merge.
   * @returns {object} Complete config.
   */
  function mergeConfig(config) {
    const c = isRecord(config) ? config : {};
    const merged = {};
    for (const key of Object.keys(DEFAULT_CONFIG)) {
      const result = key in c ? validateConfigValue(key, c[key]) : { valid: false };
      merged[key] = result.valid ? result.value : DEFAULT_CONFIG[key];
    }
    return merged;
  }

  /**
   * Converts 0.1.x settings into the new config. Its command name is kept as
   * an extra command, so the GM's macros keep working.
   *
   * @param {object} legacy state.INSPIRATIONTRACKER.
   * @returns {{config: object, command: string}} Converted settings.
   */
  function convertLegacyConfig(legacy) {
    const old = isRecord(legacy?.config) ? legacy.config : {};
    const config = mergeConfig({
      marker: old.statusmarker,
      fx: old.fx,
      fxType: old.fx_type,
    });
    const command = toText(old.command).replace(/^!/, '');
    return {
      config,
      command: /^[\w-]{1,40}$/.test(command) && command !== 'inspiration' ? command : '',
    };
  }

  // ---------------------------------------------------------------------------
  // Persistent state
  // ---------------------------------------------------------------------------

  /**
   * Builds empty state.
   *
   * @returns {object} State.
   */
  function freshState() {
    return {
      schemaVersion: SCHEMA_VERSION,
      version: SCRIPT_VERSION,
      config: { ...DEFAULT_CONFIG },
      legacyCommand: '',
      known: {},
      pools: [{ ...DEFAULT_POOL }],
      points: {},
      party: { include: [], exclude: [] },
      undo: [],
      offers: {},
      notices: {},
    };
  }

  /**
   * Returns the Mod's state, creating it when missing.
   *
   * @returns {object} State.
   */
  function getState() {
    if (!isRecord(state[STATE_KEY])) {
      state[STATE_KEY] = freshState();
    }
    return state[STATE_KEY];
  }

  /**
   * Returns the current configuration.
   *
   * @returns {object} Config.
   */
  function getConfig() {
    return getState().config;
  }

  /**
   * Creates, repairs or upgrades the state. 0.1.x settings are copied the first
   * time; the old state is left in place so a downgrade still works.
   *
   * @returns {{migrated: boolean, command: string}} Whether 0.1.x settings were taken over.
   */
  function initialiseState() {
    const existing = state[STATE_KEY];
    let migrated = false;
    if (!isRecord(existing)) {
      const s = freshState();
      if (isRecord(state[LEGACY_STATE_KEY])) {
        const converted = convertLegacyConfig(state[LEGACY_STATE_KEY]);
        s.config = converted.config;
        s.legacyCommand = converted.command;
        migrated = true;
      }
      state[STATE_KEY] = s;
    }
    const s = state[STATE_KEY];
    const base = freshState();
    for (const key of Object.keys(base)) {
      if (key === 'config') {
        continue;
      }
      const wantsArray = Array.isArray(base[key]);
      const ok = wantsArray ? Array.isArray(s[key]) : typeof s[key] === typeof base[key];
      if (!ok || (!wantsArray && typeof base[key] === 'object' && !isRecord(s[key]))) {
        s[key] = base[key];
      }
    }
    if (!Array.isArray(s.party.include)) {
      s.party.include = [];
    }
    if (!Array.isArray(s.party.exclude)) {
      s.party.exclude = [];
    }
    s.config = mergeConfig(s.config);
    s.pools = repairPools(s.pools);
    s.schemaVersion = SCHEMA_VERSION;
    s.version = SCRIPT_VERSION;
    pruneOffers();
    return { migrated, command: s.legacyCommand };
  }

  /**
   * Sets one configuration value.
   *
   * @param {string} key Config key.
   * @param {*} raw Raw value.
   * @returns {{valid: boolean, value?: *}} Validation result.
   */
  function setConfigValue(key, raw) {
    const result = validateConfigValue(key, raw);
    if (result.valid) {
      getConfig()[key] = result.value;
    }
    return result;
  }

  /**
   * Puts every setting back to its default, keeping the language.
   *
   * @returns {void}
   */
  function resetConfig() {
    const s = getState();
    s.config = { ...DEFAULT_CONFIG, language: s.config.language };
  }

  /**
   * Applies One-Click useroptions that changed since they were last applied, so
   * a GM's later chat changes are not overwritten on every restart.
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
  // Last known values. The 2024 sheet's change event already carries the new
  // value as "previous", so changes are found by comparing with these.
  // ---------------------------------------------------------------------------

  /**
   * Returns the last inspiration value seen for a character.
   *
   * @param {string} charId Character ID.
   * @returns {boolean|undefined} Last value, or undefined when not seen yet.
   */
  function getKnown(charId) {
    const value = getState().known[charId];
    return typeof value === 'boolean' ? value : undefined;
  }

  /**
   * Records the inspiration value seen for a character.
   *
   * @param {string} charId Character ID.
   * @param {boolean|undefined} inspired Value, or undefined to forget it.
   * @returns {void}
   */
  function setKnown(charId, inspired) {
    if (inspired === undefined) {
      delete getState().known[charId];
    } else {
      getState().known[charId] = Boolean(inspired);
    }
  }

  /**
   * Forgets everything kept about a character that was deleted.
   *
   * @param {string} charId Character ID.
   * @returns {void}
   */
  function forgetCharacter(charId) {
    const s = getState();
    delete s.known[charId];
    for (const values of Object.values(s.points)) {
      if (isRecord(values)) {
        delete values[charId];
      }
    }
    s.party.include = s.party.include.filter((id) => id !== charId);
    s.party.exclude = s.party.exclude.filter((id) => id !== charId);
    for (const [id, offer] of Object.entries(s.offers)) {
      if (offer.charId === charId) {
        delete s.offers[id];
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Points pools
  // ---------------------------------------------------------------------------

  /**
   * Turns a pool name into its ID: lower-case letters, digits and hyphens.
   *
   * @param {string} name Pool name.
   * @returns {string} ID, or an empty string when the name has no letters or digits.
   */
  function poolId(name) {
    return toText(name)
      .toLowerCase()
      .normalize('NFKD')
      .replaceAll(/[^a-z0-9]+/g, '-')
      .replaceAll(/^-+|-+$/g, '')
      .slice(0, 30);
  }

  /**
   * Validates one field of a pool.
   *
   * @param {string} field name | source | cost | max | marker.
   * @param {*} raw Raw value.
   * @returns {{valid: boolean, value?: *}} Result; `value` is the normalised value when valid.
   */
  function validatePoolField(field, raw) {
    const ok = (value) => ({ valid: true, value });
    const bad = { valid: false };
    const text = toText(raw);
    const whole = /^\d{1,4}$/.test(text) ? Number(text) : NaN;
    switch (field) {
      case 'name':
        return /^[^<>{}|@[\]]{1,40}$/.test(text) && poolId(text) ? ok(text) : bad;
      case 'source': {
        const found = POOL_SOURCES.find((o) => o === text.toLowerCase());
        return found ? ok(found) : bad;
      }
      case 'cost':
        return whole >= 1 && whole <= 100 ? ok(whole) : bad;
      case 'max':
        return whole >= 0 && whole <= MAX_POINTS ? ok(whole) : bad;
      case 'marker':
        return text === '' || /^[^,@\s][^,@]{0,99}$/.test(text) ? ok(text) : bad;
      default:
        return bad;
    }
  }

  /**
   * Repairs the stored pools: valid fields, unique IDs, and the default pool
   * first.
   *
   * @param {*} pools Stored pools.
   * @returns {object[]} Pools.
   */
  function repairPools(pools) {
    const repaired = [];
    for (const raw of Array.isArray(pools) ? pools : []) {
      if (!isRecord(raw) || repaired.length >= MAX_POOLS) {
        continue;
      }
      const name = validatePoolField('name', raw.name);
      const id = poolId(raw.id) || (name.valid ? poolId(name.value) : '');
      if (!name.valid || !id || repaired.some((p) => p.id === id)) {
        continue;
      }
      const pool = { ...DEFAULT_POOL, id, name: name.value };
      for (const field of ['source', 'cost', 'max', 'marker']) {
        const result = validatePoolField(field, raw[field]);
        if (result.valid) {
          pool[field] = result.value;
        }
      }
      repaired.push(pool);
    }
    if (repaired.length === 0) {
      repaired.push({ ...DEFAULT_POOL });
    }
    return repaired;
  }

  /**
   * Returns every pool, the default pool first.
   *
   * @returns {object[]} Pools.
   */
  function getPools() {
    return getState().pools;
  }

  /**
   * Returns the default pool: the one used by commands that name no pool while
   * Tracking is set to a points pool.
   *
   * @returns {object} Pool.
   */
  function defaultPool() {
    return getPools()[0];
  }

  /**
   * Finds a pool by its ID or its name, whatever the case.
   *
   * @param {string} text Pool ID or name.
   * @returns {object|undefined} Pool.
   */
  function findPool(text) {
    const wanted = toText(text).toLowerCase();
    const id = poolId(text);
    return getPools().find(
      (p) => p.id === wanted || p.name.toLowerCase() === wanted || p.id === id
    );
  }

  /**
   * Adds a pool.
   *
   * @param {string} name Pool name.
   * @returns {{status: string, pool?: object}} added | invalid | exists | full.
   */
  function addPool(name) {
    const result = validatePoolField('name', name);
    if (!result.valid) {
      return { status: 'invalid' };
    }
    if (findPool(result.value)) {
      return { status: 'exists' };
    }
    const pools = getPools();
    if (pools.length >= MAX_POOLS) {
      return { status: 'full' };
    }
    const pool = { ...DEFAULT_POOL, id: poolId(result.value), name: result.value };
    pools.push(pool);
    return { status: 'added', pool };
  }

  /**
   * Deletes a pool. The default pool stays. The points on the sheets are left
   * as they are.
   *
   * @param {object} pool Pool.
   * @returns {boolean} True when deleted.
   */
  function deletePool(pool) {
    const s = getState();
    const index = s.pools.indexOf(pool);
    if (index <= 0) {
      return false;
    }
    s.pools.splice(index, 1);
    delete s.points[pool.id];
    return true;
  }

  /**
   * Records the points seen for a character in a pool.
   *
   * @param {string} id Pool ID.
   * @param {string} charId Character ID.
   * @param {number} value Points.
   * @returns {void}
   */
  function setPoints(id, charId, value) {
    const points = getState().points;
    if (!isRecord(points[id])) {
      points[id] = {};
    }
    if (value > 0) {
      points[id][charId] = value;
    } else {
      delete points[id][charId];
    }
  }

  // ---------------------------------------------------------------------------
  // Party membership chosen by the GM
  // ---------------------------------------------------------------------------

  /**
   * Adds a character to the party, or takes it out.
   *
   * @param {string} charId Character ID.
   * @param {boolean} member True to add.
   * @returns {void}
   */
  function setPartyMember(charId, member) {
    const party = getState().party;
    party.include = party.include.filter((id) => id !== charId);
    party.exclude = party.exclude.filter((id) => id !== charId);
    (member ? party.include : party.exclude).push(charId);
  }

  /**
   * Returns the GM's party choices.
   *
   * @returns {{include: string[], exclude: string[]}} Choices.
   */
  function getPartyChoices() {
    return getState().party;
  }

  // ---------------------------------------------------------------------------
  // Undo for spends
  // ---------------------------------------------------------------------------

  /**
   * Remembers a spend so the GM can undo it.
   *
   * @param {string} charId Character ID.
   * @param {string} playerId Who spent it.
   * @param {number} now Current time.
   * @param {{poolId: string, amount: number}} [points] The pool and points spent, for a pool spend.
   * @returns {string} Undo ID.
   */
  function pushUndo(charId, playerId, now, points) {
    const s = getState();
    const id = shortId();
    s.undo.push({ id, charId, playerId, at: now, ...(points || {}) });
    while (s.undo.length > MAX_UNDO) {
      s.undo.shift();
    }
    return id;
  }

  /**
   * Takes an undo entry, so each can be used once.
   *
   * @param {string} id Undo ID.
   * @returns {object|null} The entry, or null when unknown.
   */
  function takeUndo(id) {
    const s = getState();
    const index = s.undo.findIndex((entry) => entry.id === id);
    return index < 0 ? null : s.undo.splice(index, 1)[0];
  }

  // ---------------------------------------------------------------------------
  // Offers to pass Heroic Inspiration on (2024 rules)
  // ---------------------------------------------------------------------------

  /**
   * Opens an offer for a character's owner to give Heroic Inspiration away.
   *
   * @param {string} charId Character that would have gained it.
   * @param {number} now Current time.
   * @returns {string} Offer ID.
   */
  function createOffer(charId, now) {
    const id = shortId();
    getState().offers[id] = { charId, at: now };
    return id;
  }

  /**
   * Takes an open offer, so each can be used once.
   *
   * @param {string} id Offer ID.
   * @param {number} now Current time.
   * @returns {object|null} The offer, or null when unknown or expired.
   */
  function takeOffer(id, now) {
    const offers = getState().offers;
    const offer = offers[id];
    delete offers[id];
    return offer && now - offer.at <= OFFER_LIFETIME_MS ? offer : null;
  }

  /**
   * Puts back an offer that could not be used yet.
   *
   * @param {string} id Offer ID.
   * @param {object} offer Offer.
   * @returns {void}
   */
  function restoreOffer(id, offer) {
    getState().offers[id] = offer;
  }

  /**
   * Drops expired offers.
   *
   * @param {number} [now] Current time.
   * @returns {void}
   */
  function pruneOffers(now = Date.now()) {
    const offers = getState().offers;
    for (const [id, offer] of Object.entries(offers)) {
      if (!isRecord(offer) || now - offer.at > OFFER_LIFETIME_MS) {
        delete offers[id];
      }
    }
  }

  /**
   * Returns true the first time it is called for a key, so a hint is shown once.
   *
   * @param {string} key Notice key.
   * @returns {boolean} True the first time.
   */
  function takeNoticeOnce(key) {
    const notices = getState().notices;
    if (notices[key]) {
      return false;
    }
    notices[key] = true;
    return true;
  }

  // Who is in the party, and who may act for a character.

  /**
   * Returns the IDs in a character's "Can Be Edited & Controlled By" list.
   *
   * @param {object} character Roll20 character.
   * @returns {string[]} Player IDs, and `all` when everyone controls it.
   */
  function controllerIds(character) {
    return toText(character?.get('controlledby'))
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
  }

  /**
   * Returns true when a player may spend a character's inspiration: a GM, or a
   * player in the character's controlled-by list (or `all`).
   *
   * @param {string} playerId Roll20 player ID.
   * @param {object} character Roll20 character.
   * @returns {boolean} True when allowed.
   */
  function canControl(playerId, character) {
    if (playerIsGM(playerId)) {
      return true;
    }
    const ids = controllerIds(character);
    return ids.includes('all') || ids.includes(playerId);
  }

  /**
   * Returns the non-GM players who control a character. `all` stands for every
   * player.
   *
   * @param {object} character Roll20 character.
   * @returns {string[]} Player IDs.
   */
  function ownerIds(character) {
    const ids = controllerIds(character);
    const players = ids.includes('all')
      ? findObjs({ _type: 'player' }).map((p) => p.id)
      : ids.filter((id) => getObj('player', id));
    return players.filter((id) => !playerIsGM(id));
  }

  /**
   * Returns true for a character a player controls, which is how the party is
   * found unless the GM adds or removes characters.
   *
   * @param {object} character Roll20 character.
   * @returns {boolean} True when controlled by a player.
   */
  function playerControlled(character) {
    return controllerIds(character).some(
      (id) => id !== 'all' && getObj('player', id) && !playerIsGM(id)
    );
  }

  /**
   * Lists the party: player-controlled characters plus those the GM added,
   * minus those the GM removed. Archived characters are left out.
   *
   * @returns {object[]} Roll20 characters, sorted by name.
   */
  function partyMembers() {
    const { include, exclude } = getPartyChoices();
    return findObjs({ _type: 'character' })
      .filter((c) => !c.get('archived'))
      .filter((c) => include.includes(c.id) || (playerControlled(c) && !exclude.includes(c.id)))
      .sort((a, b) => toText(a.get('name')).localeCompare(toText(b.get('name'))));
  }

  /**
   * Finds the characters behind the selected tokens, or behind token and
   * character IDs given with --ids. Duplicates are dropped.
   *
   * @param {object[]} selected msg.selected entries.
   * @param {string[]} ids Token or character IDs.
   * @returns {{characters: object[], skipped: string[]}} Characters, and the tokens or IDs that gave none.
   */
  function resolveCharacters(selected, ids) {
    const characters = [];
    const skipped = [];
    const add = (character, label) => {
      if (!character) {
        skipped.push(label);
      } else if (!characters.some((c) => c.id === character.id)) {
        characters.push(character);
      }
    };
    for (const entry of selected || []) {
      const token = getObj('graphic', entry._id);
      if (token && isToken(token)) {
        add(getObj('character', token.get('represents')), toText(token.get('name')) || token.id);
      }
    }
    for (const id of ids) {
      const token = getObj('graphic', id);
      const character = token
        ? getObj('character', token.get('represents'))
        : getObj('character', id);
      add(character, id);
    }
    return { characters, skipped };
  }

  /**
   * Returns every token, on every page, that stands for a character.
   *
   * @param {string} charId Character ID.
   * @returns {object[]} Roll20 graphics.
   */
  function tokensFor(charId) {
    return findObjs({ _type: 'graphic', _subtype: 'token', represents: charId });
  }

  // Reading and writing inspiration on both D&D 5e sheets.
  //
  // The 2014 OGL sheet keeps a checkbox attribute, `inspiration`, which
  // findObjs can see. The D&D 2024 sheet is a Beacon sheet: its values are not
  // attribute objects, so 0.1.x never found them. Beacon values are read and
  // written with getSheetItem/setSheetItem; the sheet also keeps them in a
  // `store` attribute, which is read when those functions are not available.

  /**
   * Finds a character's attribute by name, whatever its case.
   *
   * @param {string} charId Character ID.
   * @param {string} name Attribute name.
   * @returns {object|undefined} Roll20 attribute.
   */
  function findAttribute(charId, name) {
    const wanted = name.toLowerCase();
    return findObjs({ _type: 'attribute', _characterid: charId }).find(
      (attr) => toText(attr.get('name')).toLowerCase() === wanted
    );
  }

  /**
   * Returns the parsed `store` of a Beacon character, or null for other sheets.
   *
   * @param {string|object} charOrAttr Character ID, or the store attribute itself.
   * @returns {object|null} Store contents.
   */
  function readStore(charOrAttr) {
    const attr =
      typeof charOrAttr === 'string'
        ? findAttribute(charOrAttr, BEACON_STORE_ATTRIBUTE)
        : charOrAttr;
    if (!attr) {
      return null;
    }
    let value = attr.get('current');
    if (typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch {
        return null;
      }
    }
    return isRecord(value) ? value : null;
  }

  /**
   * Reads inspiration from a Beacon store.
   *
   * @param {object|null} store Store contents.
   * @returns {boolean|undefined} Value, or undefined when the store has none.
   */
  function inspirationFromStore(store) {
    const value = store?.inspiration?.isInspired;
    return value === undefined ? undefined : isInspiredValue(value);
  }

  /**
   * Says which kind of sheet holds a character's inspiration.
   *
   * @param {string} charId Character ID.
   * @returns {'legacy'|'beacon'|'none'} Sheet kind.
   */
  function sheetKind(charId) {
    if (findAttribute(charId, LEGACY_ATTRIBUTE)) {
      return 'legacy';
    }
    return findAttribute(charId, BEACON_STORE_ATTRIBUTE) ? 'beacon' : 'none';
  }

  /**
   * Reads whether a character has inspiration.
   *
   * @param {string} charId Character ID.
   * @returns {Promise<{kind: string, inspired: boolean}>} Sheet kind and value.
   */
  async function readInspiration(charId) {
    const kind = sheetKind(charId);
    if (kind === 'legacy') {
      return {
        kind,
        inspired: isInspiredValue(findAttribute(charId, LEGACY_ATTRIBUTE).get('current')),
      };
    }
    if (kind === 'beacon') {
      if (typeof getSheetItem === 'function') {
        try {
          const value = await getSheetItem(charId, BEACON_ITEM);
          if (value !== undefined && value !== null) {
            return { kind, inspired: isInspiredValue(value) };
          }
        } catch (err) {
          log(`${SCRIPT_NAME}: getSheetItem failed for ${charId}: ${err?.message || err}`);
        }
      }
      return { kind, inspired: inspirationFromStore(readStore(charId)) === true };
    }
    return { kind, inspired: false };
  }

  /**
   * Sets or clears a character's inspiration.
   *
   * A 2014 sheet only creates its attribute when the box is first ticked, so a
   * character with neither attribute nor store gets the attribute created.
   *
   * @param {string} charId Character ID.
   * @param {boolean} inspired New value.
   * @returns {Promise<{ok: boolean, kind: string, error?: string}>} Result.
   */
  async function writeInspiration(charId, inspired) {
    const kind = sheetKind(charId);
    if (kind === 'beacon') {
      if (typeof setSheetItem !== 'function') {
        return { ok: false, kind, error: 'setSheetItem is not available' };
      }
      try {
        await setSheetItem(charId, BEACON_ITEM, inspired ? 1 : 0, 'current', { allowThrow: true });
        return { ok: true, kind };
      } catch (err) {
        const error = String(err?.message || err);
        log(`${SCRIPT_NAME}: setSheetItem failed for ${charId}: ${error}`);
        return { ok: false, kind, error };
      }
    }
    const value = inspired ? 'on' : '0';
    const attr = findAttribute(charId, LEGACY_ATTRIBUTE);
    if (attr) {
      attr.set('current', value);
    } else {
      createObj('attribute', { characterid: charId, name: LEGACY_ATTRIBUTE, current: value });
    }
    return { ok: true, kind: 'legacy' };
  }

  // ---------------------------------------------------------------------------
  // Points pools
  //
  // A pool is kept in the sheet's resource box that carries the pool's name
  // (the 2014 OGL sheet's Class Resource, Other Resource and added resource
  // boxes: an attribute such as `other_resource`, named by `other_resource_name`),
  // or in a plain attribute, `<pool id>_pool`. The D&D 2024 sheet keeps its
  // resources inside its `store`, which a Mod cannot change safely, so its
  // characters always use the plain attribute.
  // ---------------------------------------------------------------------------

  /**
   * Returns the name of a pool's plain attribute.
   *
   * @param {object} pool Pool.
   * @returns {string} Attribute name, such as `inspiration_pool`.
   */
  function poolAttributeName(pool) {
    return `${pool.id.replaceAll('-', '_')}${POOL_ATTRIBUTE_SUFFIX}`;
  }

  /**
   * Returns true when an attribute name could hold a pool: a resource box, its
   * name, or a pool's plain attribute.
   *
   * @param {string} name Attribute name.
   * @returns {boolean} True when worth checking.
   */
  function isPoolAttributeName(name) {
    const text = toText(name).toLowerCase();
    return text.includes('resource') || text.endsWith(POOL_ATTRIBUTE_SUFFIX);
  }

  /**
   * Finds where a character keeps a pool.
   *
   * @param {string} charId Character ID.
   * @param {object} pool Pool.
   * @returns {{where: 'resource'|'attribute', name: string, attr: object|undefined}} Where it is kept, the attribute's name, and the attribute when it exists.
   */
  function locatePool(charId, pool) {
    const attrs = findObjs({ _type: 'attribute', _characterid: charId });
    const named = (name) =>
      attrs.find((attr) => toText(attr.get('name')).toLowerCase() === name.toLowerCase());
    if (pool.source === 'resource') {
      const wanted = pool.name.toLowerCase();
      const label = attrs.find((attr) => {
        const name = toText(attr.get('name')).toLowerCase();
        return (
          name.includes('resource') &&
          name.endsWith('_name') &&
          toText(attr.get('current')).trim().toLowerCase() === wanted
        );
      });
      if (label) {
        const name = toText(label.get('name')).slice(0, -'_name'.length);
        return { where: 'resource', name, attr: named(name) };
      }
    }
    const name = poolAttributeName(pool);
    return { where: 'attribute', name, attr: named(name) };
  }

  /**
   * Reads a character's points in a pool.
   *
   * @param {string} charId Character ID.
   * @param {object} pool Pool.
   * @returns {{where: string, name: string, exists: boolean, value: number}} Where it is kept, the attribute's name, whether anything is stored yet, and the points.
   */
  function readPool(charId, pool) {
    const { where, name, attr } = locatePool(charId, pool);
    const n = Math.floor(Number(attr?.get('current')));
    return { where, name, exists: Boolean(attr), value: Number.isFinite(n) && n > 0 ? n : 0 };
  }

  /**
   * Writes a character's points in a pool, creating the attribute when needed.
   *
   * @param {string} charId Character ID.
   * @param {object} pool Pool.
   * @param {number} value Points.
   * @returns {{where: string}} Where it was written.
   */
  function writePool(charId, pool, value) {
    const { where, name, attr } = locatePool(charId, pool);
    // A sheet's own boxes hold text ("52"), so they are written the way the sheet writes them.
    const current = where === 'resource' ? String(value) : value;
    if (attr) {
      attr.set('current', current);
    } else {
      createObj('attribute', { characterid: charId, name, current });
    }
    return { where };
  }

  /**
   * Returns the rules edition used for a character: the GM's choice, or the
   * 2024 sheet's own setting, or 2014 for the 2014 OGL sheet.
   *
   * @param {string} charId Character ID.
   * @returns {string} RULES_2014 or RULES_2024.
   */
  function rulesFor(charId) {
    const wording = getConfig().wording;
    if (wording === RULES_2014 || wording === RULES_2024) {
      return wording;
    }
    const store = readStore(charId);
    if (!store) {
      return RULES_2014;
    }
    return store.settings?.newRules === false ? RULES_2014 : RULES_2024;
  }

  // Giving, removing, spending and passing on inspiration, and keeping token
  // markers and chat in step with the sheets.

  const observers = [];
  const busy = new Set();

  /**
   * Registers a function called with (token, prev) whenever this Mod changes a
   * token's markers, matching TokenMod's ObserveTokenChange.
   *
   * @param {Function} fn Observer.
   * @returns {void}
   */
  function observeTokenChange(fn) {
    if (typeof fn === 'function') {
      observers.push(fn);
    }
  }

  /**
   * Returns the word for inspiration for a character: "Heroic Inspiration"
   * under the 2024 rules, "Inspiration" under the 2014 rules.
   *
   * @param {string} charId Character ID.
   * @param {string} lang Locale code.
   * @returns {string} Translated term.
   */
  function termFor(charId, lang) {
    const pool = activePool();
    if (pool) {
      return pool.name;
    }
    return t(rulesFor(charId) === RULES_2024 ? 'terms.heroic' : 'terms.classic', lang);
  }

  /**
   * Returns a character's name.
   *
   * @param {object} character Roll20 character.
   * @returns {string} Name.
   */
  function nameOf(character) {
    return toText(character?.get('name')) || toText(character?.id);
  }

  /**
   * Shows or hides the inspiration marker on every token for a character.
   *
   * @param {string} charId Character ID.
   * @param {boolean} inspired Whether to show it.
   * @returns {void}
   */
  function syncTokens(charId, inspired) {
    applyMarker(charId, getConfig().marker, inspired);
  }

  /**
   * Returns the pool that commands naming no pool work on: the default pool
   * while Tracking is set to a points pool, otherwise none (the sheet's
   * inspiration box is used).
   *
   * @returns {object|null} Pool.
   */
  function activePool() {
    return getConfig().tracking === 'pool' ? defaultPool() : null;
  }

  /**
   * Returns the marker shown while a character has points in a pool. The
   * default pool uses the Marker setting while it is the one being tracked;
   * other pools use their own marker, if they have one.
   *
   * @param {object} pool Pool.
   * @returns {string} Marker tag, or an empty string for none.
   */
  function poolMarker(pool) {
    if (pool === defaultPool()) {
      return getConfig().tracking === 'pool' ? getConfig().marker : '';
    }
    return pool.marker === getConfig().marker ? '' : pool.marker;
  }

  /**
   * Reads a character's points in a pool, records them and puts its markers
   * right.
   *
   * @param {string} charId Character ID.
   * @param {object} pool Pool.
   * @returns {{where: string, exists: boolean, value: number}} What was read.
   */
  function syncPool(charId, pool) {
    const read = readPool(charId, pool);
    setPoints(pool.id, charId, read.value);
    applyMarker(charId, poolMarker(pool), read.value > 0);
    return read;
  }

  /**
   * Shows or hides a marker on every token for a character.
   *
   * @param {string} charId Character ID.
   * @param {string} marker Marker tag; nothing happens when empty.
   * @param {boolean} inspired Whether to show it.
   * @returns {void}
   */
  function applyMarker(charId, marker, inspired) {
    if (!marker) {
      return;
    }
    for (const token of tokensFor(charId)) {
      const prev = { ...token.attributes, statusmarkers: token.get('statusmarkers') };
      if (setMarker(token, marker, inspired)) {
        for (const fn of observers) {
          try {
            fn(token, prev);
          } catch (err) {
            log(`${SCRIPT_NAME}: observer failed: ${err?.message || err}`);
          }
        }
      }
    }
  }

  /**
   * Plays the chosen special effect on a character's tokens.
   *
   * @param {string} charId Character ID.
   * @returns {void}
   */
  function playFx(charId) {
    const { fx, fxType } = getConfig();
    if (!fx || typeof spawnFx !== 'function') {
      return;
    }
    for (const token of tokensFor(charId)) {
      if (token.get('layer') === 'gmlayer') {
        continue;
      }
      spawnFx(token.get('left'), token.get('top'), fxType, token.get('_pageid'));
    }
  }

  /**
   * Builds the body of an announcement card.
   *
   * @param {string} text Sentence (escaped).
   * @param {string} [buttons] Button HTML.
   * @returns {string} HTML.
   */
  function announcementBody(text, buttons = '') {
    return [
      '<div style="overflow:hidden;min-height:38px">',
      `<img src="${ICON_URL}" alt="" style="float:right;width:36px;height:36px;margin-left:6px">`,
      `<div>${text}</div>`,
      '</div>',
      buttons ? `<div style="margin-top:4px">${buttons}</div>` : '',
    ].join('');
  }

  /**
   * Sends an announcement the way the GM chose: to everyone, to the GM and the
   * character's players, or not at all.
   *
   * @param {object} character Roll20 character.
   * @param {string} title Card title.
   * @param {string} body Card body.
   * @returns {void}
   */
  function announce(character, title, body) {
    const mode = getConfig().announce;
    if (mode === 'public') {
      broadcast(title, body);
    } else if (mode === 'gm') {
      whisperEach([...getGmPlayerIds(), ...ownerIds(character)], title, body);
    }
  }

  /**
   * Runs an action for one character at a time, so a double-clicked button
   * cannot spend the same inspiration twice.
   *
   * @param {string} charId Character ID.
   * @param {Function} fn Async action.
   * @returns {Promise<object>} The action's result, or `{status: 'busy'}`.
   */
  async function exclusive(charId, fn) {
    if (busy.has(charId)) {
      return { status: 'busy' };
    }
    busy.add(charId);
    try {
      return await fn();
    } finally {
      busy.delete(charId);
    }
  }

  /**
   * Writes a new value, recording it first so the sheet's own change event for
   * this write is not taken for a player's change.
   *
   * @param {string} charId Character ID.
   * @param {boolean} inspired New value.
   * @returns {Promise<{ok: boolean, error?: string}>} Result.
   */
  async function store(charId, inspired) {
    const before = getKnown(charId);
    setKnown(charId, inspired);
    const result = await writeInspiration(charId, inspired);
    if (!result.ok) {
      setKnown(charId, before);
    }
    return result;
  }

  /**
   * Announces that a character gained inspiration, with a Spend button.
   *
   * @param {object} character Roll20 character.
   * @returns {void}
   */
  function announceGain(character) {
    const lang = getConfig().language;
    const term = termFor(character.id, lang);
    const text = escapeHtml(t('messages.gained', lang, { name: nameOf(character), term }));
    const button = getConfig().playerSpend
      ? buildButtonGrid(
          [buildButton(t('buttons.spend', lang), `${COMMAND} spend --ids ${character.id}`)],
          1
        )
      : '';
    announce(character, term, announcementBody(text, button));
  }

  /**
   * Announces a spend, and tells the GM with an Undo button.
   *
   * @param {object} character Roll20 character.
   * @param {string|null} playerId Who spent it, or null for a change on the sheet or token.
   * @returns {void}
   */
  function announceSpend(character, playerId) {
    const lang = getConfig().language;
    const term = termFor(character.id, lang);
    const name = nameOf(character);
    announce(
      character,
      term,
      announcementBody(escapeHtml(t('messages.spent', lang, { name, term })))
    );
    const undoId = pushUndo(character.id, playerId || '', Date.now());
    const who = playerId && getObj('player', playerId)?.get('displayname');
    const line = who
      ? t('messages.spentBy', lang, { name, term, player: who })
      : t('messages.spentSheet', lang, { name, term });
    whisper(
      null,
      SCRIPT_NAME,
      `<div>${escapeHtml(line)}</div>${buildButtonGrid([buildSecondaryButton(t('buttons.undo', lang), `${COMMAND} undo ${undoId}`)], 1)}`
    );
  }

  /**
   * Gives a character inspiration. Under the 2024 rules, a character who
   * already has Heroic Inspiration may give it to another party member instead.
   *
   * @param {object} character Roll20 character.
   * @param {string} actorId Who gave it.
   * @returns {Promise<{status: string, error?: string}>} given | already | offered | failed | busy.
   */
  function give(character, actorId) {
    return exclusive(character.id, async () => {
      const { inspired } = await readInspiration(character.id);
      if (inspired) {
        setKnown(character.id, true);
        syncTokens(character.id, true);
        if (getConfig().passOn && rulesFor(character.id) === RULES_2024) {
          offerPassOn(character, actorId);
          return { status: 'offered' };
        }
        return { status: 'already' };
      }
      const result = await store(character.id, true);
      if (!result.ok) {
        return { status: 'failed', error: result.error };
      }
      syncTokens(character.id, true);
      playFx(character.id);
      announceGain(character);
      return { status: 'given' };
    });
  }

  /**
   * Takes inspiration away without it counting as a spend.
   *
   * @param {object} character Roll20 character.
   * @returns {Promise<{status: string, error?: string}>} removed | none | failed | busy.
   */
  function remove(character) {
    return exclusive(character.id, async () => {
      const { inspired } = await readInspiration(character.id);
      if (!inspired) {
        setKnown(character.id, false);
        syncTokens(character.id, false);
        return { status: 'none' };
      }
      const result = await store(character.id, false);
      if (!result.ok) {
        return { status: 'failed', error: result.error };
      }
      syncTokens(character.id, false);
      return { status: 'removed' };
    });
  }

  /**
   * Spends a character's inspiration.
   *
   * @param {object} character Roll20 character.
   * @param {string} actorId Who is spending it.
   * @returns {Promise<{status: string, error?: string}>} spent | none | denied | failed | busy.
   */
  function spend(character, actorId) {
    const gm = isGmOrMod(actorId, API_PLAYER_ID);
    if (!gm && (!getConfig().playerSpend || !canControl(actorId, character))) {
      return Promise.resolve({ status: 'denied' });
    }
    return exclusive(character.id, async () => {
      const { inspired } = await readInspiration(character.id);
      if (!inspired) {
        setKnown(character.id, false);
        syncTokens(character.id, false);
        return { status: 'none' };
      }
      const result = await store(character.id, false);
      if (!result.ok) {
        return { status: 'failed', error: result.error };
      }
      syncTokens(character.id, false);
      announceSpend(character, actorId === API_PLAYER_ID ? null : actorId);
      return { status: 'spent' };
    });
  }

  /**
   * Gives back inspiration that was spent.
   *
   * @param {string} undoId Undo ID from the GM's spend message.
   * @returns {Promise<{status: string, name?: string, error?: string}>} restored | unknown | already | failed | busy.
   */
  async function undoSpend(undoId) {
    const entry = takeUndo(undoId);
    const character = entry && getObj('character', entry.charId);
    if (!character) {
      return { status: 'unknown' };
    }
    if (entry.poolId) {
      const pool = getPools().find((p) => p.id === entry.poolId);
      return pool ? undoPoolSpend(character, pool, entry.amount) : { status: 'unknown' };
    }
    const result = await exclusive(character.id, async () => {
      const { inspired } = await readInspiration(character.id);
      if (inspired) {
        return { status: 'already' };
      }
      const written = await store(character.id, true);
      if (!written.ok) {
        return { status: 'failed', error: written.error };
      }
      syncTokens(character.id, true);
      return { status: 'restored' };
    });
    if (result.status === 'restored') {
      const lang = getConfig().language;
      const term = termFor(character.id, lang);
      const text = t('messages.restored', lang, { name: nameOf(character), term });
      whisperEach(
        [...getGmPlayerIds(), ...ownerIds(character)],
        term,
        announcementBody(escapeHtml(text))
      );
    }
    return { ...result, name: nameOf(character) };
  }

  // ---------------------------------------------------------------------------
  // Points pools
  // ---------------------------------------------------------------------------

  /**
   * Builds the Spend and Boost buttons shown under a pool announcement.
   *
   * @param {object} character Roll20 character.
   * @param {object} pool Pool.
   * @returns {string} Button HTML, empty when players cannot spend.
   */
  function poolButtons(character, pool) {
    if (!getConfig().playerSpend) {
      return '';
    }
    const lang = getConfig().language;
    const target = `--ids ${character.id} --pool ${pool.id}`;
    return buildButtonGrid([
      buildButton(
        t('buttons.spend', lang),
        `${COMMAND} spend ?{${queryText(t('prompts.points', lang))}|1} ${target}`
      ),
      buildSecondaryButton(
        t('buttons.boost', lang),
        `${COMMAND} boost ?{${queryText(t('prompts.bonus', lang))}|1} ${target}`
      ),
    ]);
  }

  /**
   * Changes a character's points in a pool and puts its markers right.
   *
   * @param {object} character Roll20 character.
   * @param {object} pool Pool.
   * @param {number} after New points.
   * @returns {void}
   */
  function storePool(character, pool, after) {
    setPoints(pool.id, character.id, after);
    writePool(character.id, pool, after);
    applyMarker(character.id, poolMarker(pool), after > 0);
  }

  /**
   * Adds points to a character's pool, up to the pool's maximum.
   *
   * @param {object} character Roll20 character.
   * @param {object} pool Pool.
   * @param {number} amount Points to add.
   * @returns {Promise<object>} `{status}`: given | full | busy, with before, after and amount.
   */
  function poolGive(character, pool, amount) {
    return exclusive(character.id, async () => {
      const before = readPool(character.id, pool).value;
      const after = pool.max > 0 ? Math.min(pool.max, before + amount) : before + amount;
      if (after <= before) {
        syncPool(character.id, pool);
        return { status: 'full', term: pool.name, max: pool.max };
      }
      storePool(character, pool, after);
      playFx(character.id);
      const lang = getConfig().language;
      const vars = {
        name: nameOf(character),
        term: pool.name,
        amount: after - before,
        before,
        after,
      };
      announce(
        character,
        pool.name,
        announcementBody(
          escapeHtml(t('pool.gained', lang, vars)),
          after > 0 ? poolButtons(character, pool) : ''
        )
      );
      return { status: 'given', ...vars };
    });
  }

  /**
   * Takes points away without it counting as a spend.
   *
   * @param {object} character Roll20 character.
   * @param {object} pool Pool.
   * @param {number|'all'} amount Points to take, or `all`.
   * @returns {Promise<object>} `{status}`: poolRemoved | poolNone | busy.
   */
  function poolRemove(character, pool, amount) {
    return exclusive(character.id, async () => {
      const before = readPool(character.id, pool).value;
      if (before === 0) {
        syncPool(character.id, pool);
        return { status: 'poolNone', term: pool.name };
      }
      const taken = amount === 'all' ? before : Math.min(before, amount);
      const after = before - taken;
      storePool(character, pool, after);
      return { status: 'poolRemoved', term: pool.name, amount: taken, before, after };
    });
  }

  /**
   * Spends points from a character's pool. With a bonus, the points bought a
   * bonus to a roll, at the pool's cost per +1.
   *
   * @param {object} character Roll20 character.
   * @param {object} pool Pool.
   * @param {number} amount Points to spend.
   * @param {string} actorId Who is spending them.
   * @param {number} [bonus] The bonus the points buy.
   * @returns {Promise<object>} `{status}`: spent | short | poolNone | denied | busy.
   */
  function poolSpend(character, pool, amount, actorId, bonus = 0) {
    const gm = isGmOrMod(actorId, API_PLAYER_ID);
    if (!gm && (!getConfig().playerSpend || !canControl(actorId, character))) {
      return Promise.resolve({ status: 'denied' });
    }
    return exclusive(character.id, async () => {
      const before = readPool(character.id, pool).value;
      if (before === 0) {
        syncPool(character.id, pool);
        return { status: 'poolNone', term: pool.name };
      }
      if (amount > before) {
        return { status: 'short', term: pool.name, have: before, need: amount };
      }
      const after = before - amount;
      storePool(character, pool, after);
      const lang = getConfig().language;
      const name = nameOf(character);
      const vars = { name, term: pool.name, amount, bonus, before, after };
      announce(
        character,
        pool.name,
        announcementBody(
          escapeHtml(t(bonus > 0 ? 'pool.boosted' : 'pool.spent', lang, vars)),
          after > 0 ? poolButtons(character, pool) : ''
        )
      );
      const playerId = actorId === API_PLAYER_ID ? '' : actorId;
      const undoId = pushUndo(character.id, playerId, Date.now(), { poolId: pool.id, amount });
      const who = playerId && getObj('player', playerId)?.get('displayname');
      const line = t('pool.spentBy', lang, { ...vars, player: who || SCRIPT_NAME });
      whisper(
        null,
        SCRIPT_NAME,
        `<div>${escapeHtml(line)}</div>${buildButtonGrid([buildSecondaryButton(t('buttons.undo', lang), `${COMMAND} undo ${undoId}`)], 1)}`
      );
      return { status: 'spent', ...vars };
    });
  }

  /**
   * Gives back points that were spent.
   *
   * @param {object} character Roll20 character.
   * @param {object} pool Pool.
   * @param {number} amount Points to give back.
   * @returns {Promise<object>} `{status}`: restored | busy, with the character's name.
   */
  async function undoPoolSpend(character, pool, amount) {
    const result = await exclusive(character.id, async () => {
      const before = readPool(character.id, pool).value;
      const after = before + amount;
      storePool(character, pool, after);
      return { status: 'restored', before, after };
    });
    if (result.status === 'restored') {
      const lang = getConfig().language;
      const text = t('pool.restored', lang, {
        name: nameOf(character),
        term: pool.name,
        amount,
        before: result.before,
        after: result.after,
      });
      whisperEach(
        [...getGmPlayerIds(), ...ownerIds(character)],
        pool.name,
        announcementBody(escapeHtml(text))
      );
    }
    return { ...result, name: nameOf(character) };
  }

  /**
   * Reacts to a pool's points being changed on the sheet by hand: the value is
   * recorded and the markers follow.
   *
   * @param {object} attr Roll20 attribute that changed.
   * @returns {void}
   */
  function handlePoolAttribute(attr) {
    const charId = attr.get('_characterid') || attr.get('characterid');
    if (!charId || busy.has(charId)) {
      return;
    }
    for (const pool of getPools()) {
      syncPool(charId, pool);
    }
  }

  /**
   * Asks a character's players (or the GM, when nobody controls it) who should
   * get the Heroic Inspiration it cannot hold twice.
   *
   * @param {object} character Roll20 character that already has it.
   * @param {string} actorId Who tried to give it.
   * @returns {void}
   */
  function offerPassOn(character, actorId) {
    const lang = getConfig().language;
    const term = termFor(character.id, lang);
    const offerId = createOffer(character.id, Date.now());
    const candidates = partyMembers().filter(
      (c) => c.id !== character.id && getKnown(c.id) !== true
    );
    const buttons = candidates.map((c) =>
      buildButton(nameOf(c), `${COMMAND} pass ${offerId} ${c.id}`)
    );
    buttons.push(
      buildSecondaryButton(t('buttons.decline', lang), `${COMMAND} pass ${offerId} none`)
    );
    const body = [
      `<div>${escapeHtml(t('messages.passOffer', lang, { name: nameOf(character), term }))}</div>`,
      candidates.length === 0
        ? `<div style="margin-top:3px;font-size:0.9em">${escapeHtml(t('messages.passNobody', lang))}</div>`
        : '',
      buildButtonGrid(buttons, 2),
    ].join('');
    const owners = ownerIds(character);
    const recipients = owners.length > 0 ? owners : getGmPlayerIds();
    whisperEach(recipients, term, body);
    if (owners.length > 0 && isGmOrMod(actorId, API_PLAYER_ID)) {
      whisper(
        null,
        SCRIPT_NAME,
        escapeHtml(t('messages.passAsked', lang, { name: nameOf(character), term }))
      );
    }
  }

  /**
   * Passes Heroic Inspiration on from an offer, or lets it go.
   *
   * @param {string} offerId Offer ID.
   * @param {string} targetId Character ID, or `none` to let it go.
   * @param {string} actorId Who clicked.
   * @returns {Promise<{status: string, from?: string, to?: string, term?: string, error?: string}>} passed | declined | unknown | denied | invalid | already | failed | busy.
   */
  async function passOn(offerId, targetId, actorId) {
    const now = Date.now();
    const offer = takeOffer(offerId, now);
    const from = offer && getObj('character', offer.charId);
    if (!from) {
      return { status: 'unknown' };
    }
    const putBack = () => restoreOffer(offerId, offer);
    if (!isGmOrMod(actorId, API_PLAYER_ID) && !canControl(actorId, from)) {
      putBack();
      return { status: 'denied' };
    }
    const term = termFor(from.id, getConfig().language);
    if (targetId === 'none') {
      return { status: 'declined', from: nameOf(from), term };
    }
    const target = getObj('character', targetId);
    if (!target || target.id === from.id || !partyMembers().some((c) => c.id === target.id)) {
      putBack();
      return { status: 'invalid' };
    }
    const result = await exclusive(target.id, async () => {
      const { inspired } = await readInspiration(target.id);
      if (inspired) {
        setKnown(target.id, true);
        return { status: 'already' };
      }
      const written = await store(target.id, true);
      return written.ok ? { status: 'passed' } : { status: 'failed', error: written.error };
    });
    if (result.status === 'already' || result.status === 'busy') {
      putBack();
    }
    if (result.status === 'passed') {
      syncTokens(target.id, true);
      playFx(target.id);
      const lang = getConfig().language;
      const term = termFor(target.id, lang);
      const text = t('messages.passed', lang, { from: nameOf(from), to: nameOf(target), term });
      const button = getConfig().playerSpend
        ? buildButton(t('buttons.spend', lang), `${COMMAND} spend --ids ${target.id}`)
        : '';
      announce(target, term, announcementBody(escapeHtml(text), button));
    }
    return { ...result, from: nameOf(from), to: nameOf(target), term };
  }

  /**
   * Reacts to inspiration changed on a sheet by a person. Ticking it counts as
   * a gain and clearing it as a spend, so the GM can undo it.
   *
   * @param {string} charId Character ID.
   * @param {boolean} inspired New value.
   * @returns {void}
   */
  function handleSheetValue(charId, inspired) {
    if (busy.has(charId) || getKnown(charId) === inspired) {
      return;
    }
    // While a points pool is tracked, the sheet's inspiration box is only recorded.
    if (activePool()) {
      setKnown(charId, inspired);
      return;
    }
    const first = getKnown(charId) === undefined;
    setKnown(charId, inspired);
    syncTokens(charId, inspired);
    const character = getObj('character', charId);
    // The first value seen for a character is only recorded.
    if (!character || first) {
      return;
    }
    if (inspired) {
      playFx(charId);
      announceGain(character);
    } else {
      announceSpend(character, null);
    }
  }

  /**
   * Reacts to the inspiration marker being added to or taken off a token by
   * hand or by another Mod: the sheet follows the marker.
   *
   * @param {object} token Roll20 graphic.
   * @param {boolean} shown Whether the marker is now shown.
   * @returns {Promise<void>}
   */
  async function handleMarkerChange(token, shown) {
    const character = getObj('character', token.get('represents'));
    if (!character) {
      return;
    }
    // A pool's marker only shows whether there are points: it is put back.
    const pool = activePool();
    if (pool) {
      syncPool(character.id, pool);
      return;
    }
    if (shown) {
      const result = await give(character, API_PLAYER_ID);
      if (result.status === 'offered' || result.status === 'already') {
        syncTokens(character.id, true);
      }
      return;
    }
    const result = await spend(character, API_PLAYER_ID);
    if (result.status === 'none') {
      syncTokens(character.id, false);
    }
  }

  /**
   * Reads every character once, records the values and puts the markers right.
   *
   * @returns {Promise<{checked: number, inspired: number}>} Counts.
   */
  async function syncAll() {
    let checked = 0;
    let inspired = 0;
    const tracked = activePool();
    for (const character of findObjs({ _type: 'character' })) {
      for (const pool of getPools()) {
        const read = syncPool(character.id, pool);
        if (pool === tracked && read.exists) {
          checked += 1;
          inspired += read.value > 0 ? 1 : 0;
        }
      }
      const value = await readInspiration(character.id);
      if (tracked) {
        if (value.kind !== 'none') {
          setKnown(character.id, value.inspired);
        }
        continue;
      }
      if (value.kind === 'none') {
        continue;
      }
      checked += 1;
      if (value.inspired) {
        inspired += 1;
      }
      setKnown(character.id, value.inspired);
      syncTokens(character.id, value.inspired);
    }
    return { checked, inspired };
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

    const settings = SETTING_KEYS.map((key) => [
      code(key),
      escapeHtml(t(`settings.${key}.label`, lang)),
      escapeHtml(t(`settings.${key}.desc`, lang)),
    ]);

    const sheets = [
      [h('sheets.colSheet2014'), h('sheets.where2014')],
      [h('sheets.colSheet2024'), h('sheets.where2024')],
    ];

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
    ${section('sheets', `${table([t('handout.sheets.colSheet', lang), t('handout.sheets.colWhere', lang)], sheets)}${list(raw('sheets.points'))}`)}
    ${section('players', list(raw('players.points')))}
    ${section('passOn', list(raw('passOn.points')))}
    ${section('party', list(raw('party.points')))}
    ${section('pools', list(raw('pools.points')))}
    ${section('markers', list(raw('markers.points')))}
    ${section('commands', `<p style="${STYLE.p}">${h('commands.intro')}</p><p style="${STYLE.p}">${h('commands.mods')}</p>${table([t('handout.commands.colCommand', lang), t('handout.commands.colDesc', lang)], commands)}`)}
    ${section('settings', `<p style="${STYLE.p}">${h('settings.intro')}</p>${table([t('handout.settings.colKey', lang), t('handout.settings.colName', lang), t('handout.settings.colDesc', lang)], settings)}`)}
    ${section('upgrading', list(raw('upgrading.points')))}
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
    const btn = (key, args, dark = false) =>
      `<a href="${escapeHtml(`${COMMAND} ${args}`.trim())}" style="${dark ? STYLE.btnDark : STYLE.btn}">${escapeHtml(tr(`buttons.${key}`))}</a>`;
    const group = (titleKey, descKey, buttons) =>
      `<div style="${STYLE.section}">${escapeHtml(tr(titleKey))}</div><div style="${STYLE.desc}">${escapeHtml(tr(descKey))}</div><div>${buttons.join('')}</div>`;

    return `<div style="${STYLE.outer}${getDirectionStyle(lang)}">
    <div style="${STYLE.header}">
      <h1 style="${STYLE.h1}">✥ ${SCRIPT_NAME} ✥</h1>
      <p style="${STYLE.subtitle}">${escapeHtml(tr('deck.subtitle'))} • v${SCRIPT_VERSION}</p>
    </div>
    ${group('menu.selected', 'deck.selectedDesc', [btn('give', 'give'), btn('remove', 'remove', true), btn('toggle', 'toggle', true), btn('spend', 'spend', true)])}
    ${group('deck.poolsTitle', 'deck.poolsDesc', [btn('give', `give ?{${queryText(tr('prompts.points'))}|1}`), btn('remove', `remove ?{${queryText(tr('prompts.points'))}|1}`, true), btn('spend', `spend ?{${queryText(tr('prompts.points'))}|1}`, true), btn('boost', `boost ?{${queryText(tr('prompts.bonus'))}|1}`, true), btn('pools', 'pools', true)])}
    ${group('menu.party', 'deck.partyDesc', [btn('party', 'party'), btn('partyAdd', 'party add', true), btn('partyRemove', 'party remove', true)])}
    ${group('menu.tools', 'deck.toolsDesc', [btn('menu', ''), btn('settings', 'set', true), btn('macro', 'macro', true), btn('sync', 'sync', true), btn('status', 'status', true), btn('help', 'help', true)])}
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

  // Token markers: Roll20's coloured dots plus every marker in the game's
  // token marker sets, custom sets included.

  /**
   * Reads the game's token markers. Custom markers have tags like
   * `Heroic::12345`, so they survive being renamed.
   *
   * @returns {{tag: string, name: string, url: string}[]} Markers.
   */
  function readCampaignMarkers() {
    let list = [];
    try {
      list = JSON.parse(Campaign().get('_token_markers') || '[]');
    } catch {
      list = [];
    }
    return (Array.isArray(list) ? list : [])
      .filter((m) => m && typeof m.tag === 'string' && m.tag)
      .map((m) => ({ tag: m.tag, name: toText(m.name) || m.tag, url: toText(m.url) }));
  }

  /**
   * Lists the markers the GM can choose from. The D&D 2024 sheet's own
   * condition markers are left out, because the sheet sets and clears them.
   *
   * @returns {{tag: string, name: string, url: string}[]} Markers.
   */
  function listMarkers() {
    const colours = COLOUR_MARKERS.map((tag) => ({
      tag,
      name: tag.charAt(0).toUpperCase() + tag.slice(1),
      url: '',
    }));
    const seen = new Set(colours.map((m) => m.tag));
    const others = readCampaignMarkers().filter(
      (m) => !m.tag.startsWith(SHEET_MARKER_PREFIX) && !seen.has(m.tag) && seen.add(m.tag)
    );
    return [...colours, ...others];
  }

  /**
   * Finds a marker by its tag or name, whatever its case.
   *
   * @param {string} text Tag or name.
   * @returns {{tag: string, name: string, url: string}|null} Marker, or null when the game has none by that name.
   */
  function resolveMarker(text) {
    const wanted = toText(text);
    if (!wanted) {
      return null;
    }
    const markers = listMarkers();
    const lower = wanted.toLowerCase();
    return (
      markers.find((m) => m.tag === wanted) ||
      markers.find((m) => m.tag.toLowerCase() === lower) ||
      markers.find((m) => m.name.toLowerCase() === lower) ||
      null
    );
  }

  /**
   * Returns a readable name for a marker tag.
   *
   * @param {string} tag Marker tag.
   * @returns {string} Name.
   */
  function markerName(tag) {
    return listMarkers().find((m) => m.tag === tag)?.name || toText(tag).split('::')[0];
  }

  // Chat menus: the GM menu, settings, party overview, the player card,
  // status and help.

  // The settings card's sections: a Help handout heading, and the settings under it.
  const SETTING_GROUPS = [
    ['languages', ['language']],
    ['sheets', ['tracking', 'wording']],
    ['markers', ['marker', 'fx', 'fxType']],
    ['players', ['announce', 'playerSpend', 'playerOverview', 'passOn']],
  ];

  const YES = '✔';
  const NO = '—';

  /**
   * Builds a roll query offering a list of values.
   *
   * @param {string} prompt Prompt text.
   * @param {{label: string, value: string}[]} options Choices.
   * @returns {string} Roll query.
   */
  function query(prompt, options) {
    const choices = options.map((o) => `${queryText(o.label)},${queryText(o.value)}`).join('|');
    return `?{${queryText(prompt)}|${choices}}`;
  }

  /**
   * Returns a translated on/off label.
   *
   * @param {boolean} value Setting.
   * @param {string} lang Locale code.
   * @returns {string} Label.
   */
  function onOff(value, lang) {
    return t(value ? 'values.on' : 'values.off', lang);
  }

  /**
   * Builds a roll query asking for a number.
   *
   * @param {string} key Prompt key under `prompts`.
   * @param {string} lang Locale code.
   * @param {number|string} [value] Value offered.
   * @returns {string} Roll query.
   */
  function ask(key, lang, value = 1) {
    return `?{${queryText(t(`prompts.${key}`, lang))}|${queryText(value)}}`;
  }

  /**
   * Shows the GM menu.
   *
   * @param {string|null} playerId Who asked.
   * @returns {void}
   */
  function showMainMenu(playerId) {
    const lang = getConfig().language;
    const b = (key, args) => buildButton(t(`buttons.${key}`, lang), `${COMMAND} ${args}`.trim());
    const s = (key, args) =>
      buildSecondaryButton(t(`buttons.${key}`, lang), `${COMMAND} ${args}`.trim());
    const selected = activePool()
      ? [
          b('give', `give ${ask('points', lang)}`),
          b('remove', `remove ${ask('points', lang)}`),
          b('spend', `spend ${ask('points', lang)}`),
          b('boost', `boost ${ask('bonus', lang)}`),
        ]
      : [b('give', 'give'), b('remove', 'remove'), b('toggle', 'toggle'), b('spend', 'spend')];
    whisper(playerId, `${SCRIPT_NAME} v${SCRIPT_VERSION}`, [
      buildSectionLabel(t('menu.selected', lang)),
      buildButtonGrid(selected, 2),
      buildSectionLabel(t('menu.party', lang)),
      buildButtonGrid([b('party', 'party')], 1),
      buildButtonGrid([s('partyAdd', 'party add'), s('partyRemove', 'party remove')], 2),
      buildSectionLabel(t('menu.tools', lang)),
      buildButtonGrid(
        [
          s('settings', 'set'),
          s('pools', 'pools'),
          s('macro', 'macro'),
          s('sync', 'sync'),
          s('status', 'status'),
          s('help', 'help'),
        ],
        2
      ),
      buildDivider(),
      buildNote(t('menu.hint', lang, { help: HANDOUT_HELP_NAME })),
    ]);
  }

  /**
   * Builds the value button for one setting.
   *
   * @param {string} key Setting key.
   * @param {string} lang Locale code.
   * @returns {string} Button HTML.
   */
  function settingButton(key, lang) {
    const config = getConfig();
    const value = config[key];
    const set = (label, choices) =>
      buildButton(
        label,
        `${COMMAND} set ${key} ${query(t(`settings.${key}.label`, lang), choices)}`
      );
    switch (key) {
      case 'language':
        return set(
          value,
          LOCALE_DEFINITIONS.map((d) => ({
            label: `${d.nativeName || d.name} (${d.code})`,
            value: d.code,
          }))
        );
      case 'tracking':
        return set(
          t(`values.tracking.${value}`, lang),
          TRACKING_OPTIONS.map((o) => ({ label: t(`values.tracking.${o}`, lang), value: o }))
        );
      case 'marker':
        return set(
          markerName(value),
          listMarkers().map((m) => ({ label: m.name, value: m.tag }))
        );
      case 'wording':
        return set(
          t(`values.wording.${value}`, lang),
          WORDING_OPTIONS.map((o) => ({ label: t(`values.wording.${o}`, lang), value: o }))
        );
      case 'announce':
        return set(
          t(`values.announce.${value}`, lang),
          ANNOUNCE_OPTIONS.map((o) => ({ label: t(`values.announce.${o}`, lang), value: o }))
        );
      case 'fxType':
        return set(
          value,
          FX_TYPES.flatMap((type) => FX_COLOURS.map((colour) => `${type}-${colour}`)).map((v) => ({
            label: v,
            value: v,
          }))
        );
      default:
        return buildButton(onOff(value, lang), `${COMMAND} set ${key} ${value ? 'off' : 'on'}`);
    }
  }

  /**
   * Shows the settings menu.
   *
   * @param {string|null} playerId Who asked.
   * @returns {void}
   */
  function showSettings(playerId) {
    const lang = getConfig().language;
    // Grouped under the headings the Help handout uses for the same subjects
    const rows = SETTING_GROUPS.flatMap(([heading, keys]) => [
      buildSectionLabel(t(`handout.${heading}.heading`, lang)),
      ...keys.map((key) =>
        buildRow(t(`settings.${key}.label`, lang), settingButton(key, lang), true)
      ),
    ]);
    whisper(playerId, t('titles.settings', lang), [
      ...rows,
      buildDivider(),
      buildButtonGrid(
        [
          buildSecondaryButton(t('buttons.menu', lang), COMMAND),
          buildSecondaryButton(t('buttons.pools', lang), `${COMMAND} pools`),
          buildSecondaryButton(t('buttons.reset', lang), `${COMMAND} reset`),
        ],
        2
      ),
    ]);
  }

  /**
   * Shows the points pools, with a button for each of their settings.
   *
   * @param {string|null} playerId Who asked.
   * @returns {void}
   */
  function showPools(playerId) {
    const lang = getConfig().language;
    const body = [
      buildNote(
        t(activePool() ? 'pools.introPool' : 'pools.introFlag', lang, { name: defaultPool().name })
      ),
    ];
    for (const pool of getPools()) {
      const isDefault = pool === defaultPool();
      const set = (field, label, value) =>
        buildRow(
          t(`pools.${field}`, lang),
          buildButton(label, `${COMMAND} pool set ${pool.id} ${field} ${value}`),
          true
        );
      body.push(
        buildSectionLabel(
          isDefault ? t('pools.defaultLabel', lang, { name: pool.name }) : pool.name
        ),
        set('name', pool.name, `?{${queryText(t('pools.name', lang))}|${queryText(pool.name)}}`),
        set(
          'source',
          t(`values.source.${pool.source}`, lang),
          query(
            t('pools.source', lang),
            POOL_SOURCES.map((o) => ({ label: t(`values.source.${o}`, lang), value: o }))
          )
        ),
        set('cost', String(pool.cost), `?{${queryText(t('pools.cost', lang))}|${pool.cost}}`),
        set(
          'max',
          pool.max > 0 ? String(pool.max) : t('values.noLimit', lang),
          `?{${queryText(t('prompts.max', lang))}|${pool.max}}`
        )
      );
      if (!isDefault) {
        body.push(
          set(
            'marker',
            pool.marker ? markerName(pool.marker) : t('values.none', lang),
            query(t('pools.marker', lang), [
              { label: t('values.none', lang), value: 'none' },
              ...listMarkers()
                .filter((m) => m.tag !== getConfig().marker)
                .map((m) => ({ label: m.name, value: m.tag })),
            ])
          )
        );
      }
      body.push(buildNote(t('pools.attribute', lang, { attribute: poolAttributeName(pool) })));
      if (!isDefault) {
        body.push(
          buildButtonGrid(
            [
              buildSecondaryButton(t('buttons.party', lang), `${COMMAND} party --pool ${pool.id}`),
              buildSecondaryButton(
                t('buttons.deletePool', lang),
                `${COMMAND} pool delete ${pool.id}`
              ),
            ],
            2
          )
        );
      }
    }
    body.push(
      buildDivider(),
      buildButtonGrid(
        [
          buildButton(
            t('buttons.addPool', lang),
            `${COMMAND} pool add ?{${queryText(t('pools.name', lang))}}`
          ),
          buildSecondaryButton(t('buttons.settings', lang), `${COMMAND} set`),
          buildSecondaryButton(t('buttons.menu', lang), COMMAND),
        ],
        3
      )
    );
    whisper(playerId, t('titles.pools', lang), body);
  }

  /**
   * Reads the party's inspiration.
   *
   * @param {object[]} characters Roll20 characters.
   * @returns {Promise<{character: object, inspired: boolean, kind: string}[]>} Rows.
   */
  async function readRows(characters) {
    const rows = [];
    for (const character of characters) {
      const value = await readInspiration(character.id);
      rows.push({ character, ...value });
    }
    return rows;
  }

  /**
   * Builds one character's block in an overview: the name with its tick or
   * points at the right-hand edge, where the points are kept, and the buttons
   * in a row of their own underneath.
   *
   * @param {object} row Row from readRows or poolRow.
   * @param {string} lang Locale code.
   * @param {string[]} buttons Button HTML; empty items are skipped.
   * @returns {string} HTML.
   */
  function overviewLine(row, lang, buttons) {
    let mark = row.inspired
      ? `<span style="color:#f2c94c;font-weight:bold">${YES}</span>`
      : `<span style="opacity:0.6">${NO}</span>`;
    if (row.points !== undefined) {
      mark =
        row.points > 0
          ? `<span style="color:#f2c94c;font-weight:bold">${row.points}</span>`
          : '<span style="opacity:0.6">0</span>';
    }
    const sheet =
      row.kind === 'none'
        ? ` <span style="font-size:0.8em;font-weight:normal;opacity:0.7">(${escapeHtml(t('menu.noSheet', lang))})</span>`
        : '';
    const list = buttons.filter(Boolean);
    return [
      buildItemTitle(toText(row.character.get('name')), mark, sheet),
      row.kept ? buildNote(row.kept) : '',
      buildButtonGrid(list, Math.min(Math.max(list.length, 2), 3)),
    ].join('');
  }

  /**
   * Shows the party overview. The GM gets Give and Remove buttons; players get
   * a read-only list (when the GM allows it) with Spend for their own
   * characters.
   *
   * @param {string} playerId Who asked.
   * @param {boolean} gm Whether they act as GM.
   * @param {object|null} [pool] The pool to show; the tracked one when left out.
   * @returns {Promise<void>}
   */
  async function showParty(playerId, gm, pool = null) {
    const config = getConfig();
    const lang = config.language;
    const members = partyMembers();
    const visible =
      gm || config.playerOverview ? members : members.filter((c) => canControl(playerId, c));
    const shown = pool || activePool();
    if (shown) {
      showPoolParty(playerId, gm, shown, visible);
      return;
    }
    const rows = await readRows(visible);
    const lines = rows.map((row) => {
      const id = row.character.id;
      let buttons = [];
      if (gm) {
        buttons = row.inspired
          ? [
              buildSecondaryButton(
                t('buttons.remove', lang),
                `${COMMAND} remove --ids ${id} --party`
              ),
              buildSecondaryButton(
                t('buttons.spend', lang),
                `${COMMAND} spend --ids ${id} --party`
              ),
            ]
          : [buildButton(t('buttons.give', lang), `${COMMAND} give --ids ${id} --party`)];
      } else if (row.inspired && config.playerSpend && canControl(playerId, row.character)) {
        buttons = [buildButton(t('buttons.spend', lang), `${COMMAND} spend --ids ${id} --party`)];
      }
      return overviewLine(row, lang, buttons);
    });
    const count = rows.filter((r) => r.inspired).length;
    const term = rows.length > 0 ? termFor(rows[0].character.id, lang) : t('terms.heroic', lang);
    const body = [
      lines.length > 0
        ? lines.join('')
        : `<div>${escapeHtml(t(gm ? 'menu.partyEmptyGm' : 'menu.partyEmpty', lang))}</div>`,
      buildDivider(),
      `<div style="font-size:0.9em">${escapeHtml(t('menu.partyCount', lang, { count, total: rows.length, term }))}</div>`,
      buildButtonGrid(
        [
          buildSecondaryButton(t('buttons.refresh', lang), `${COMMAND} party`),
          gm ? buildSecondaryButton(t('buttons.menu', lang), COMMAND) : '',
          ...otherPoolButtons(null, lang),
        ],
        2
      ),
    ];
    whisper(playerId, t('titles.party', lang), body);
  }

  /**
   * Builds the buttons a character's pool line gets.
   *
   * @param {string} playerId Who is looking.
   * @param {boolean} gm Whether they act as GM.
   * @param {object} pool Pool.
   * @param {object} character Roll20 character.
   * @param {number} points The character's points.
   * @param {boolean} party Whether to show the party again afterwards.
   * @returns {string[]} Button HTML; empty items stand for buttons that do not apply.
   */
  function poolLineButtons(playerId, gm, pool, character, points, party) {
    const config = getConfig();
    const lang = config.language;
    const target = `--ids ${character.id} --pool ${pool.id}${party ? ' --party' : ''}`;
    const button = (build, key, sub, prompt) =>
      build(t(`buttons.${key}`, lang), `${COMMAND} ${sub} ${ask(prompt, lang)} ${target}`);
    if (gm) {
      return [
        button(buildButton, 'give', 'give', 'points'),
        points > 0 ? button(buildSecondaryButton, 'remove', 'remove', 'points') : '',
        points > 0 ? button(buildSecondaryButton, 'spend', 'spend', 'points') : '',
      ];
    }
    if (points > 0 && config.playerSpend && canControl(playerId, character)) {
      return [
        button(buildButton, 'spend', 'spend', 'points'),
        button(buildSecondaryButton, 'boost', 'boost', 'bonus'),
      ];
    }
    return [];
  }

  /**
   * Reads a character's points in a pool for an overview line, with the words
   * that say where they are kept: the sheet box's name, or the attribute.
   *
   * @param {object} character Roll20 character.
   * @param {object} pool Pool.
   * @param {string} lang Locale code.
   * @returns {{character: object, points: number, kept: string, where: string}} Row.
   */
  function poolRow(character, pool, lang) {
    const { where, name, value } = readPool(character.id, pool);
    const kept =
      where === 'resource'
        ? t('pools.keptBox', lang, { name: pool.name })
        : t('pools.keptAttribute', lang, { attribute: name });
    return { character, points: value, kept, where };
  }

  /**
   * Builds the note that explains an attribute, for a card that lists one.
   *
   * @param {{where: string}[]} rows Rows from poolRow.
   * @param {string} lang Locale code.
   * @returns {string[]} HTML, or nothing when every row is a sheet box.
   */
  function keptNote(rows, lang) {
    return rows.some((row) => row.where === 'attribute')
      ? [buildNote(t('pools.keptNote', lang))]
      : [];
  }

  /**
   * Builds buttons to look at the other pools from an overview.
   *
   * @param {object|null} current The pool being shown, or null for the sheet's inspiration box.
   * @param {string} lang Locale code.
   * @returns {string[]} Button HTML.
   */
  function otherPoolButtons(current, lang) {
    const tracked = activePool();
    const buttons = [];
    if (current && current !== tracked) {
      buttons.push(
        buildSecondaryButton(tracked ? tracked.name : t('terms.classic', lang), `${COMMAND} party`)
      );
    }
    for (const pool of getPools()) {
      if (pool !== current && pool !== tracked && pool !== defaultPool()) {
        buttons.push(buildSecondaryButton(pool.name, `${COMMAND} party --pool ${pool.id}`));
      }
    }
    return buttons;
  }

  /**
   * Shows the party's points in a pool. The GM gets Give, Remove and Spend
   * buttons; players get Spend and Boost for their own characters.
   *
   * @param {string} playerId Who asked.
   * @param {boolean} gm Whether they act as GM.
   * @param {object} pool Pool.
   * @param {object[]} characters Party members the player may see.
   * @returns {void}
   */
  function showPoolParty(playerId, gm, pool, characters) {
    const lang = getConfig().language;
    const rows = characters.map((character) => poolRow(character, pool, lang));
    const total = rows.reduce((sum, row) => sum + row.points, 0);
    const lines = rows.map((row) =>
      overviewLine(row, lang, poolLineButtons(playerId, gm, pool, row.character, row.points, true))
    );
    const flag = pool === activePool() ? '' : ` --pool ${pool.id}`;
    const body = [
      lines.length > 0
        ? lines.join('')
        : `<div>${escapeHtml(t(gm ? 'menu.partyEmptyGm' : 'menu.partyEmpty', lang))}</div>`,
      buildDivider(),
      `<div style="font-size:0.9em">${escapeHtml(t('pools.partyTotal', lang, { total, term: pool.name }))}</div>`,
      ...keptNote(rows, lang),
      buildButtonGrid(
        [
          buildSecondaryButton(t('buttons.refresh', lang), `${COMMAND} party${flag}`),
          gm ? buildSecondaryButton(t('buttons.menu', lang), COMMAND) : '',
          ...otherPoolButtons(pool, lang),
        ],
        2
      ),
    ];
    whisper(playerId, t('titles.poolParty', lang, { term: pool.name }), body);
  }

  /**
   * Shows a player the characters they control, with Spend buttons. The GM
   * can turn the party overview on for players instead.
   *
   * @param {string} playerId Who asked.
   * @returns {Promise<void>}
   */
  async function showPlayerCard(playerId) {
    const config = getConfig();
    if (config.playerOverview) {
      await showParty(playerId, false);
      return;
    }
    const lang = config.language;
    const tracked = activePool();
    const controlled = findObjs({ _type: 'character' })
      .filter((c) => !c.get('archived') && canControl(playerId, c))
      .sort((a, b) => toText(a.get('name')).localeCompare(toText(b.get('name'))));
    const own = controlled.filter((c) => sheetKind(c.id) !== 'none');
    const rows = tracked ? [] : await readRows(own);
    const lines = rows.map((row) =>
      overviewLine(
        row,
        lang,
        row.inspired && config.playerSpend
          ? [buildButton(t('buttons.spend', lang), `${COMMAND} spend --ids ${row.character.id}`)]
          : []
      )
    );
    // The tracked pool, then the GM's other pools, for the characters that are theirs: in the
    // party, or named as theirs. A character everyone controls (a shared helper token) is only
    // listed once it has points.
    const party = partyMembers();
    const theirs = controlled.filter(
      (c) => party.some((m) => m.id === c.id) || controllerIds(c).includes(playerId)
    );
    const pools = getPools().filter((pool) => pool === tracked || pool !== defaultPool());
    const poolRows = [];
    for (const pool of pools) {
      const listed = controlled
        .map((character) => poolRow(character, pool, lang))
        .filter((row) => row.points > 0 || theirs.includes(row.character));
      poolRows.push(...listed);
      if (listed.length > 0 && (pools.length > 1 || !tracked)) {
        lines.push(buildSectionLabel(pool.name));
      }
      for (const row of listed) {
        lines.push(
          overviewLine(
            row,
            lang,
            poolLineButtons(playerId, false, pool, row.character, row.points, false)
          )
        );
      }
    }
    const note = keptNote(poolRows, lang);
    if (note.length > 0) {
      lines.push(buildDivider(), ...note);
    }
    whisper(
      playerId,
      t('titles.yours', lang),
      lines.length > 0 ? lines : [`<div>${escapeHtml(t('menu.noneYours', lang))}</div>`]
    );
  }

  /**
   * Shows the Mod's status.
   *
   * @param {string|null} playerId Who asked.
   * @param {string} legacyCommand 0.1.x command still answered, if any.
   * @returns {void}
   */
  function showStatus(playerId, legacyCommand) {
    const config = getConfig();
    const lang = config.language;
    const characters = findObjs({ _type: 'character' });
    const counts = { legacy: 0, beacon: 0, none: 0 };
    let rules2024 = 0;
    for (const c of characters) {
      const kind = sheetKind(c.id);
      counts[kind] += 1;
      if (kind !== 'none' && rulesFor(c.id) === '2024') {
        rules2024 += 1;
      }
    }
    const row = (key, value) => buildRow(t(`status.${key}`, lang), escapeHtml(String(value)), true);
    whisper(playerId, t('titles.status', lang), [
      row('version', SCRIPT_VERSION),
      row('beacon', counts.beacon),
      row('legacy', counts.legacy),
      row('none', counts.none),
      row('rules2024', rules2024),
      row('party', partyMembers().length),
      row('tracking', t(`values.tracking.${config.tracking}`, lang)),
      row(
        'pools',
        getPools()
          .map((p) => p.name)
          .join(', ')
      ),
      row('marker', markerName(config.marker)),
      row('fx', config.fx ? config.fxType : onOff(false, lang)),
      legacyCommand ? row('legacyCommand', `!${legacyCommand}`) : '',
    ]);
  }

  /**
   * Shows the command list.
   *
   * @param {string|null} playerId Who asked.
   * @param {boolean} gm Whether they act as GM.
   * @returns {void}
   */
  function showHelp(playerId, gm) {
    const lang = getConfig().language;
    const commands = gm
      ? HELP_COMMANDS
      : HELP_COMMANDS.filter(([, key]) =>
          ['menu', 'spend', 'boost', 'party', 'help'].includes(key)
        );
    const lines = commands.map(([text, key]) =>
      buildCommandHelp(
        `${COMMAND} ${text}`.trim(),
        t(gm ? `help.${key}` : `helpPlayer.${key}`, lang)
      )
    );
    if (gm) {
      lines.push(buildDivider(), buildNote(t('menu.hint', lang, { help: HANDOUT_HELP_NAME })));
    }
    whisper(playerId, t('titles.help', lang), lines);
  }

  // Chat command parsing and dispatch.

  /**
   * Splits a chat message into the command word, its arguments and flags.
   *
   * @param {string} content Message text after the command prefix.
   * @returns {{sub: string, args: string[], ids: string[], party: boolean, pool: string}} Parsed command.
   */
  function parseCommand(content) {
    const words = tokenize(content);
    const args = [];
    const ids = [];
    let party = false;
    let pool = '';
    for (let i = 0; i < words.length; i += 1) {
      const word = words[i];
      if (word.toLowerCase() === '--pool') {
        pool = words[i + 1] || '';
        i += 1;
        continue;
      }
      if (word.toLowerCase() === '--ids') {
        const list = words[i + 1] || '';
        i += 1;
        ids.push(
          ...list
            .split(/[;,]/)
            .map((id) => id.trim())
            .filter(Boolean)
        );
      } else if (word.toLowerCase() === '--party') {
        party = true;
      } else {
        args.push(word);
      }
    }
    const sub = (args.shift() || '').toLowerCase();
    return { sub, args, ids, party, pool };
  }

  /**
   * Returns the command prefixes this game answers to: `!inspiration`, plus
   * the command a 0.1.x GM chose.
   *
   * @returns {string[]} Prefixes with the leading "!".
   */
  function prefixes() {
    const legacy = getState().legacyCommand;
    return legacy ? [COMMAND, `!${legacy}`] : [COMMAND];
  }

  /**
   * Tells the GM (or the player who asked) what happened to one character,
   * when the result was not already announced in chat.
   *
   * @param {string} playerId Who asked.
   * @param {object} character Roll20 character.
   * @param {object} result Action result.
   * @returns {void}
   */
  function report(playerId, character, result) {
    const lang = getConfig().language;
    const vars = { name: toText(character.get('name')), term: termFor(character.id, lang) };
    const target = playerId === API_PLAYER_ID ? null : playerId;
    switch (result.status) {
      case 'already':
        whisperWarning(target, t('messages.already', lang, vars));
        break;
      case 'none':
        whisperWarning(target, t('messages.none', lang, vars));
        break;
      case 'removed':
        whisper(target, SCRIPT_NAME, escapeHtml(t('messages.removed', lang, vars)));
        break;
      case 'denied':
        whisperError(target, t('errors.denied', lang, vars));
        break;
      case 'busy':
        whisperWarning(target, t('messages.busy', lang, vars));
        break;
      case 'failed':
        whisperError(target, t('errors.writeFailed', lang, vars), result.error);
        break;
      case 'poolNone':
        whisperWarning(target, t('pool.none', lang, { ...vars, ...result }));
        break;
      case 'poolRemoved':
        whisper(target, SCRIPT_NAME, escapeHtml(t('pool.removed', lang, { ...vars, ...result })));
        break;
      case 'short':
        whisperWarning(target, t('pool.short', lang, { ...vars, ...result }));
        break;
      case 'full':
        whisperWarning(target, t('pool.full', lang, { ...vars, ...result }));
        break;
    }
  }

  /**
   * Tells a player that no pool has the name they gave.
   *
   * @param {string|null} who Who asked.
   * @param {string} value The name given.
   * @returns {void}
   */
  function unknownPool(who, value) {
    const lang = getConfig().language;
    whisperError(
      who,
      t('errors.unknownPool', lang, { value }),
      t('errors.unknownPoolHint', lang, {
        pools: getPools()
          .map((p) => p.name)
          .join(', '),
      })
    );
  }

  /**
   * Finds the pool a command works on: the one named with --pool, or the
   * default pool while Tracking is set to a points pool. An unknown name is
   * reported to the player.
   *
   * @param {object} msg Chat message.
   * @param {object} cmd Parsed command.
   * @returns {{pool: object|null, ok: boolean}} The pool (null for the sheet's inspiration box), and false when the name was unknown.
   */
  function targetPool(msg, cmd) {
    if (!cmd.pool) {
      return { pool: activePool(), ok: true };
    }
    const pool = findPool(cmd.pool);
    if (!pool) {
      unknownPool(msg.playerid === API_PLAYER_ID ? null : msg.playerid, cmd.pool);
    }
    return { pool: pool || null, ok: Boolean(pool) };
  }

  /**
   * Reads the number of points (or the bonus) a command gives.
   *
   * @param {object} msg Chat message.
   * @param {string|undefined} raw The argument.
   * @param {{fallback?: number, all?: boolean}} [options] Value when nothing was typed, and whether "all" is accepted.
   * @returns {number|'all'|null} The amount, or null when it was not a whole number (the player is told).
   */
  function amountArg(msg, raw, options = {}) {
    const text = toText(raw).toLowerCase();
    if (text === '' && options.fallback !== undefined) {
      return options.fallback;
    }
    if (text === 'all' && options.all) {
      return 'all';
    }
    const n = /^\+?\d{1,5}$/.test(text) ? Number(text) : 0;
    if (n < 1 || n > MAX_POINTS) {
      const lang = getConfig().language;
      whisperError(
        msg.playerid === API_PLAYER_ID ? null : msg.playerid,
        t('errors.badAmount', lang, { value: toText(raw) }),
        t('errors.badAmountHint', lang)
      );
      return null;
    }
    return n;
  }

  /**
   * Handles give, remove, spend and boost for a points pool.
   *
   * @param {object} msg Chat message.
   * @param {object} cmd Parsed command.
   * @param {object} pool Pool.
   * @returns {Promise<void>}
   */
  async function handlePoolAction(msg, cmd, pool) {
    const sub = cmd.sub === '' || cmd.sub === 'toggle' ? 'give' : cmd.sub;
    const amount = amountArg(msg, cmd.args[0], {
      fallback: sub === 'boost' ? undefined : 1,
      all: sub === 'remove',
    });
    if (amount === null) {
      return;
    }
    const actions = {
      give: (character) => poolGive(character, pool, amount),
      remove: (character) => poolRemove(character, pool, amount),
      spend: (character, playerId) => poolSpend(character, pool, amount, playerId),
      boost: (character, playerId) =>
        poolSpend(character, pool, amount * pool.cost, playerId, amount),
    };
    await forCharacters(msg, { ...cmd, pool: pool.id }, actions[sub]);
  }

  /**
   * Returns the marker a pool shows on tokens, if any.
   *
   * @param {object} pool Pool.
   * @returns {string} Marker tag, or an empty string.
   */
  function poolMarkerOf(pool) {
    if (pool === defaultPool()) {
      return activePool() ? getConfig().marker : '';
    }
    return pool.marker;
  }

  /**
   * Handles "pool add", "pool delete" and "pool set", then shows the pools.
   *
   * @param {string|null} who Who asked.
   * @param {string[]} args Arguments after "pool".
   * @returns {Promise<void>}
   */
  async function handlePoolEdit(who, args) {
    const lang = getConfig().language;
    const [action = '', ...rest] = args;
    switch (action.toLowerCase()) {
      case 'add': {
        const name = rest.join(' ');
        const result = addPool(name);
        if (result.status !== 'added') {
          const key = { invalid: 'poolInvalid', exists: 'poolExists', full: 'poolFull' }[
            result.status
          ];
          whisperError(
            who,
            t(`errors.${key}`, lang, { value: name }),
            t('errors.poolNameHint', lang)
          );
          return;
        }
        break;
      }
      case 'delete': {
        const pool = findPool(rest.join(' '));
        if (!pool) {
          unknownPool(who, rest.join(' '));
          return;
        }
        const marker = poolMarkerOf(pool);
        if (!deletePool(pool)) {
          whisperError(who, t('errors.poolDefault', lang, { name: pool.name }));
          return;
        }
        stripMarker(marker);
        break;
      }
      case 'set': {
        const [id = '', rawField = '', ...words] = rest;
        const pool = findPool(id);
        if (!pool) {
          unknownPool(who, id);
          return;
        }
        const field = rawField.toLowerCase();
        let value = words.join(' ');
        if (field === 'marker') {
          if (!value || ['none', 'off'].includes(value.toLowerCase())) {
            value = '';
          } else {
            const marker = resolveMarker(value);
            if (!marker || marker.tag === getConfig().marker) {
              whisperError(
                who,
                t('errors.unknownMarker', lang, { value }),
                t('errors.poolMarkerHint', lang)
              );
              return;
            }
            value = marker.tag;
          }
        }
        const result = validatePoolField(field, value);
        const other = field === 'name' && result.valid ? findPool(value) : undefined;
        if (
          !result.valid ||
          (other && other !== pool) ||
          (field === 'marker' && pool === defaultPool())
        ) {
          whisperError(
            who,
            t('errors.badSetting', lang, { key: rawField, value }),
            t('errors.poolSetHint', lang)
          );
          return;
        }
        const oldMarker = poolMarkerOf(pool);
        pool[field] = result.value;
        if (field === 'marker') {
          stripMarker(oldMarker);
        }
        await syncAll();
        break;
      }
    }
    showPools(who);
  }

  /**
   * Runs an action on the selected characters (or those given with --ids).
   *
   * @param {object} msg Chat message.
   * @param {object} cmd Parsed command.
   * @param {Function} action Async action taking (character, playerId).
   * @returns {Promise<void>}
   */
  async function forCharacters(msg, cmd, action) {
    const lang = getConfig().language;
    const { characters, skipped } = resolveCharacters(msg.selected, cmd.ids);
    if (skipped.length > 0) {
      whisperWarning(msg.playerid, t('errors.noCharacter', lang, { names: skipped.join(', ') }));
    }
    if (characters.length === 0) {
      if (skipped.length === 0) {
        whisperError(
          msg.playerid,
          t('errors.nothingSelected', lang),
          t('errors.nothingSelectedHint', lang)
        );
      }
      return;
    }
    for (const character of characters) {
      report(msg.playerid, character, await action(character, msg.playerid));
    }
    if (cmd.party) {
      await showParty(
        msg.playerid,
        isGmOrMod(msg.playerid, API_PLAYER_ID),
        cmd.pool ? findPool(cmd.pool) : null
      );
    }
  }

  /**
   * Toggles a character: gives inspiration when it has none, otherwise takes
   * it away (0.1.x's `!inspiration` with tokens selected).
   *
   * @param {object} character Roll20 character.
   * @param {string} playerId Who asked.
   * @returns {Promise<object>} Action result.
   */
  async function toggle(character, playerId) {
    const { inspired } = await readInspiration(character.id);
    return inspired ? remove(character) : give(character, playerId);
  }

  /**
   * Handles `set`: with no arguments shows the settings, otherwise changes one.
   *
   * @param {string} playerId Who asked.
   * @param {string[]} args Setting key and value.
   * @returns {Promise<void>}
   */
  async function handleSet(playerId, args) {
    const lang = getConfig().language;
    if (args.length === 0) {
      showSettings(playerId);
      return;
    }
    const [rawKey, ...rest] = args;
    const key = Object.keys(getConfig()).find((k) => k.toLowerCase() === rawKey.toLowerCase());
    let value = rest.join(' ');
    if (key === 'marker') {
      const marker = resolveMarker(value);
      if (!marker) {
        whisperError(
          playerId,
          t('errors.unknownMarker', lang, { value }),
          t('errors.unknownMarkerHint', lang)
        );
        return;
      }
      value = marker.tag;
    }
    const oldMarker = getConfig().marker;
    const result = key ? setConfigValue(key, value) : { valid: false };
    if (!result.valid) {
      whisperError(
        playerId,
        t('errors.badSetting', lang, { key: rawKey, value }),
        t('errors.badSettingHint', lang)
      );
      return;
    }
    if (key === 'tracking' || (key === 'marker' && oldMarker !== result.value)) {
      // The marker follows what is tracked: taken off everywhere, then put back
      // on the characters who have inspiration (or points) now.
      stripMarker(oldMarker);
      await syncAll();
    }
    if (key === 'language') {
      installHandouts();
    }
    showSettings(playerId);
  }

  /**
   * Takes a marker off every token.
   *
   * @param {string} oldMarker Marker tag.
   * @returns {void}
   */
  function stripMarker(oldMarker) {
    if (!oldMarker) {
      return;
    }
    for (const token of findObjs({ _type: 'graphic', _subtype: 'token' })) {
      const tags = toText(token.get('statusmarkers')).split(',');
      if (tags.some((tag) => tag.split('@')[0] === oldMarker)) {
        token.set(
          'statusmarkers',
          tags.filter((tag) => tag && tag.split('@')[0] !== oldMarker).join(',')
        );
      }
    }
  }

  /**
   * Creates or updates the token action players click to spend inspiration.
   *
   * @param {string} playerId GM who asked.
   * @returns {void}
   */
  function installMacro(playerId) {
    const lang = getConfig().language;
    const action = `${COMMAND} spend`;
    const creator =
      playerId === API_PLAYER_ID
        ? findObjs({ _type: 'player' }).find((p) => playerIsGM(p.id))?.id
        : playerId;
    const existing = findObjs({ _type: 'macro', name: MACRO_NAME });
    if (existing.length > 0) {
      for (const macro of existing) {
        macro.set({ action, visibleto: 'all', istokenaction: true });
      }
    } else if (creator) {
      createObj('macro', {
        name: MACRO_NAME,
        action,
        visibleto: 'all',
        istokenaction: true,
        playerid: creator,
      });
    }
    whisper(
      playerId === API_PLAYER_ID ? null : playerId,
      SCRIPT_NAME,
      escapeHtml(t('messages.macro', lang, { name: MACRO_NAME }))
    );
  }

  /**
   * Handles commands from players who are not GMs.
   *
   * @param {object} msg Chat message.
   * @param {object} cmd Parsed command.
   * @returns {Promise<void>}
   */
  async function handlePlayer(msg, cmd) {
    const lang = getConfig().language;
    switch (cmd.sub) {
      case '':
      case 'menu':
        await showPlayerCard(msg.playerid);
        return;
      case 'spend':
      case 'boost': {
        if (!getConfig().playerSpend) {
          whisperError(msg.playerid, t('errors.spendOff', lang));
          return;
        }
        const target = targetPool(msg, cmd);
        if (!target.ok) {
          return;
        }
        if (target.pool) {
          await handlePoolAction(msg, cmd, target.pool);
        } else if (cmd.sub === 'boost') {
          whisperError(msg.playerid, t('errors.boostNoPool', lang));
        } else {
          await forCharacters(msg, cmd, spend);
        }
        return;
      }
      case 'party': {
        const target = targetPool(msg, cmd);
        if (target.ok) {
          await showParty(msg.playerid, false, cmd.pool ? target.pool : null);
        }
        return;
      }
      case 'pass':
        await handlePass(msg, cmd);
        return;
      case 'help':
        showHelp(msg.playerid, false);
        return;
      default:
        whisperError(msg.playerid, t('errors.gmOnly', lang), t('errors.gmOnlyHint', lang));
    }
  }

  /**
   * Handles `pass <offer> <character|none>`.
   *
   * @param {object} msg Chat message.
   * @param {object} cmd Parsed command.
   * @returns {Promise<void>}
   */
  async function handlePass(msg, cmd) {
    const lang = getConfig().language;
    const [offerId = '', targetId = ''] = cmd.args;
    const result = await passOn(offerId, targetId, msg.playerid);
    const target = msg.playerid === API_PLAYER_ID ? null : msg.playerid;
    const vars = { from: result.from, to: result.to, name: result.from, term: result.term };
    switch (result.status) {
      case 'unknown':
        whisperWarning(target, t('errors.offerGone', lang));
        break;
      case 'denied':
        whisperError(target, t('errors.denied', lang, vars));
        break;
      case 'invalid':
        whisperError(target, t('errors.passInvalid', lang));
        break;
      case 'already':
        whisperWarning(target, t('messages.passAlready', lang, vars));
        break;
      case 'declined':
        whisper(target, SCRIPT_NAME, escapeHtml(t('messages.declined', lang, vars)));
        break;
      case 'failed':
        whisperError(target, t('errors.writeFailed', lang, { name: result.to }), result.error);
        break;
    }
  }

  /**
   * Handles commands from GMs and other Mods.
   *
   * @param {object} msg Chat message.
   * @param {object} cmd Parsed command.
   * @returns {Promise<void>}
   */
  async function handleGm(msg, cmd) {
    const lang = getConfig().language;
    const who = msg.playerid === API_PLAYER_ID ? null : msg.playerid;
    if (['', 'give', 'remove', 'toggle', 'spend', 'boost'].includes(cmd.sub)) {
      const chosen = (msg.selected || []).length > 0 || cmd.ids.length > 0;
      if (cmd.sub === '' && !chosen) {
        showMainMenu(who);
        return;
      }
      const target = targetPool(msg, cmd);
      if (!target.ok) {
        return;
      }
      if (target.pool) {
        await handlePoolAction(msg, cmd, target.pool);
        return;
      }
      if (cmd.sub === 'boost') {
        whisperError(who, t('errors.boostNoPool', lang));
        return;
      }
    }
    switch (cmd.sub) {
      case '':
        await forCharacters(msg, cmd, toggle);
        return;
      case 'menu':
        showMainMenu(who);
        return;
      case 'give':
        await forCharacters(msg, cmd, give);
        return;
      case 'remove':
        await forCharacters(msg, cmd, remove);
        return;
      case 'toggle':
        await forCharacters(msg, cmd, toggle);
        return;
      case 'spend':
        await forCharacters(msg, cmd, spend);
        return;
      case 'party': {
        const action = (cmd.args[0] || '').toLowerCase();
        if (action === 'add' || action === 'remove') {
          const { characters } = resolveCharacters(msg.selected, cmd.ids);
          if (characters.length === 0) {
            whisperError(
              who,
              t('errors.nothingSelected', lang),
              t('errors.nothingSelectedHint', lang)
            );
            return;
          }
          for (const character of characters) {
            setPartyMember(character.id, action === 'add');
          }
        }
        const target = targetPool(msg, cmd);
        if (target.ok) {
          await showParty(who, true, cmd.pool ? target.pool : null);
        }
        return;
      }
      case 'pools':
        showPools(who);
        return;
      case 'pool':
        await handlePoolEdit(who, cmd.args);
        return;
      case 'pass':
        await handlePass(msg, cmd);
        return;
      case 'undo': {
        const result = await undoSpend(cmd.args[0] || '');
        if (result.status === 'unknown') {
          whisperWarning(who, t('errors.undoGone', lang));
        } else if (result.status === 'already') {
          whisperWarning(who, t('messages.undoAlready', lang, { name: result.name }));
        } else if (result.status === 'failed') {
          whisperError(who, t('errors.writeFailed', lang, { name: result.name }), result.error);
        }
        return;
      }
      case 'macro':
        installMacro(msg.playerid);
        return;
      case 'sync': {
        const counts = await syncAll();
        whisper(who, SCRIPT_NAME, escapeHtml(t('messages.synced', lang, counts)));
        return;
      }
      case 'set':
      case 'settings':
      case 'config':
        await handleSet(who, cmd.sub === 'set' ? cmd.args : []);
        return;
      case 'reset': {
        const marker = getConfig().marker;
        const tracked = getConfig().tracking;
        resetConfig();
        if (marker !== getConfig().marker || tracked !== getConfig().tracking) {
          stripMarker(marker);
          await syncAll();
        }
        showSettings(who);
        return;
      }
      case 'status':
        showStatus(who, getState().legacyCommand);
        return;
      case 'journal':
        installHandouts();
        whisper(who, SCRIPT_NAME, escapeHtml(t('messages.journal', lang)));
        return;
      case 'help':
        showHelp(who, true);
        return;
      default:
        whisperError(
          who,
          t('errors.unknownCommand', lang, { command: cmd.sub }),
          t('errors.unknownCommandHint', lang)
        );
    }
  }

  /**
   * Handles a chat message.
   *
   * @param {object} msg Roll20 chat message.
   * @returns {Promise<void>}
   */
  async function handleInput(msg) {
    if (msg.type !== 'api') {
      return;
    }
    const text = toText(msg.content);
    const prefix = prefixes().find(
      (p) =>
        text.toLowerCase() === p.toLowerCase() ||
        text.toLowerCase().startsWith(`${p.toLowerCase()} `)
    );
    if (!prefix) {
      return;
    }
    const cmd = parseCommand(text.slice(prefix.length));
    if (isGmOrMod(msg.playerid, API_PLAYER_ID)) {
      await handleGm(msg, cmd);
    } else {
      await handlePlayer(msg, cmd);
    }
  }

  let ready = false;

  /**
   * Logs a handler error instead of letting it stop the sandbox.
   *
   * @param {string} label Handler name.
   * @param {*} err Error.
   * @returns {void}
   */
  function logError(label, err) {
    log(`${SCRIPT_NAME} ERROR in ${label}: ${err?.message || err}`);
    if (err?.stack) {
      log(err.stack);
    }
  }

  /**
   * Runs a handler (which may be async) once the Mod is ready, logging errors.
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
        Promise.resolve(fn(...args)).catch((err) => logError(label, err));
      } catch (err) {
        logError(label, err);
      }
    };
  }

  /**
   * Handles a new or changed attribute: the 2014 sheet's `inspiration`, or the
   * 2024 sheet's `store`.
   *
   * @param {object} attr Roll20 attribute.
   * @returns {void}
   */
  function handleAttribute(attr) {
    const name = toText(attr.get('name')).toLowerCase();
    const charId = attr.get('_characterid') || attr.get('characterid');
    if (name === LEGACY_ATTRIBUTE) {
      handleSheetValue(charId, isInspiredValue(attr.get('current')));
    } else if (name === BEACON_STORE_ATTRIBUTE) {
      const value = inspirationFromStore(readStore(attr));
      if (value !== undefined) {
        handleSheetValue(charId, value);
      }
    } else if (isPoolAttributeName(name)) {
      handlePoolAttribute(attr);
    }
  }

  /**
   * Handles a changed token: the marker added or taken off by hand or by
   * another Mod, or the token linked to a different character.
   *
   * @param {object} token Roll20 graphic.
   * @param {object} prev Previous attributes.
   * @returns {Promise<void>}
   */
  async function handleGraphic(token, prev) {
    if (!isToken(token) || !token.get('represents')) {
      return;
    }
    if (prev && prev.represents !== undefined && prev.represents !== token.get('represents')) {
      await markNewToken(token);
      return;
    }
    const marker = getConfig().marker;
    const now = hasMarker(token.get('statusmarkers'), marker);
    const before = hasMarker(prev?.statusmarkers, marker);
    if (now !== before) {
      await handleMarkerChange(token, now);
    }
  }

  /**
   * Shows the marker on a token that was just placed or relinked, when its
   * character has inspiration.
   *
   * @param {object} token Roll20 graphic.
   * @returns {Promise<void>}
   */
  async function markNewToken(token) {
    const charId = token.get('represents');
    if (!isToken(token) || !charId) {
      return;
    }
    for (const pool of getPools()) {
      syncPool(charId, pool);
    }
    if (activePool()) {
      return;
    }
    let inspired = getKnown(charId);
    if (inspired === undefined) {
      const value = await readInspiration(charId);
      if (value.kind === 'none') {
        return;
      }
      inspired = value.inspired;
    }
    syncTokens(charId, inspired);
  }

  /**
   * Registers with TokenMod (if installed), because the API raises no change
   * event when another Mod changes a token's markers.
   *
   * @returns {void}
   */
  function observeOtherMods() {
    if (typeof TokenMod !== 'undefined' && typeof TokenMod?.ObserveTokenChange === 'function') {
      TokenMod.ObserveTokenChange(guarded('TokenMod observer', handleGraphic));
    }
  }

  /**
   * Publishes the API other Mods can call. Character IDs or token IDs work.
   *
   * @returns {void}
   */
  function publishApi() {
    const character = (id) => {
      const token = getObj('graphic', id);
      return getObj('character', token ? token.get('represents') : id);
    };
    const run = async (id, fn) => {
      const c = character(id);
      return c ? (await fn(c, API_PLAYER_ID)).status : 'unknown';
    };
    globalThis.InspirationTracker = Object.freeze({
      version: SCRIPT_VERSION,
      /**
       * Registers a function called with (token, prev) whenever this Mod
       * changes a token's markers.
       *
       * @param {Function} fn Observer.
       * @returns {void}
       */
      ObserveTokenChange(fn) {
        observeTokenChange(fn);
      },
      /**
       * Says whether a character has inspiration.
       *
       * @param {string} id Character or token ID.
       * @returns {Promise<boolean>} True when inspired.
       */
      async isInspired(id) {
        const c = character(id);
        return c ? (await readInspiration(c.id)).inspired : false;
      },
      /**
       * Gives inspiration.
       *
       * @param {string} id Character or token ID.
       * @returns {Promise<string>} Result status.
       */
      give: (id) => run(id, give),
      /**
       * Spends inspiration, announcing it as a player's spend would be.
       *
       * @param {string} id Character or token ID.
       * @returns {Promise<string>} Result status.
       */
      spend: (id) => run(id, spend),
      /**
       * Takes inspiration away quietly.
       *
       * @param {string} id Character or token ID.
       * @returns {Promise<string>} Result status.
       */
      remove: (id) => run(id, (c) => remove(c)),
      /**
       * Returns a character's points in a pool.
       *
       * @param {string} id Character or token ID.
       * @param {string} [pool] Pool name or ID; the default pool when left out.
       * @returns {number} Points, 0 when the character or pool is unknown.
       */
      points(id, pool) {
        const c = character(id);
        const p = pool ? findPool(pool) : getPools()[0];
        return c && p ? readPool(c.id, p).value : 0;
      },
      /**
       * Adds points to a character's pool.
       *
       * @param {string} id Character or token ID.
       * @param {number} amount Points to add.
       * @param {string} [pool] Pool name or ID; the default pool when left out.
       * @returns {Promise<string>} Result status.
       */
      async givePoints(id, amount, pool) {
        const c = character(id);
        const p = pool ? findPool(pool) : getPools()[0];
        const n = Math.floor(Number(amount));
        return c && p && n > 0 ? (await poolGive(c, p, n)).status : 'unknown';
      },
      /**
       * Spends points from a character's pool, announcing it as a player's
       * spend would be.
       *
       * @param {string} id Character or token ID.
       * @param {number} amount Points to spend.
       * @param {string} [pool] Pool name or ID; the default pool when left out.
       * @returns {Promise<string>} Result status.
       */
      async spendPoints(id, amount, pool) {
        const c = character(id);
        const p = pool ? findPool(pool) : getPools()[0];
        const n = Math.floor(Number(amount));
        return c && p && n > 0 ? (await poolSpend(c, p, n, API_PLAYER_ID)).status : 'unknown';
      },
    });
  }

  /**
   * Startup: set up state, handouts and the API, then read every sheet once.
   *
   * @returns {Promise<void>}
   */
  async function checkInstall() {
    const { migrated, command } = initialiseState();
    applyGlobalConfig();
    installHandouts();
    observeOtherMods();
    publishApi();
    ready = true;
    log(`-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} [Updated: ${SCRIPT_LAST_UPDATED}] <=-`);

    const counts = await syncAll();
    const lang = getConfig().language;
    const line = (text) => `<div style="margin-top:3px">${escapeHtml(text)}</div>`;
    const lines = [`<div><strong>${escapeHtml(t('titles.ready', lang))}</strong></div>`];
    lines.push(line(t('messages.synced', lang, counts)));
    if (migrated) {
      lines.push(line(t('messages.migrated', lang)));
      if (command) {
        lines.push(
          line(t('messages.legacyCommand', lang, { command: `!${command}`, main: COMMAND }))
        );
      }
    }
    if (takeNoticeOnce('macroHint')) {
      lines.push(line(t('messages.macroHint', lang, { command: `${COMMAND} macro` })));
    }
    lines.push(
      `<div style="font-size:0.85em;margin-top:3px">${escapeHtml(t('messages.readyHint', lang, { command: COMMAND }))}</div>`
    );
    whisper(null, `${SCRIPT_NAME} v${SCRIPT_VERSION}`, lines);
    if (migrated) {
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
      checkInstall().catch((err) => logError('startup', err));
    });
    on('chat:message', guarded('chat:message', handleInput));
    on('change:attribute', guarded('change:attribute', handleAttribute));
    on('add:attribute', guarded('add:attribute', handleAttribute));
    on('change:graphic', guarded('change:graphic', handleGraphic));
    on('add:graphic', guarded('add:graphic', markNewToken));
    on(
      'destroy:character',
      guarded('destroy:character', (obj) => forgetCharacter(obj.id))
    );
  }

  registerEventHandlers();
})();
