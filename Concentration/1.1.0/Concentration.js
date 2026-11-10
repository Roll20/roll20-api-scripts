/**
 * NOTE: GENERATED FILE - DO NOT EDIT DIRECTLY.
 * NOTE: Source files live under src/ and are bundled with `npm run build`.
 * ------------------------------------------------
 * Name: Concentration
 * Script: Concentration.js
 * Version: 1.1.0
 * Built: 2026-11-10T00:57:19.293Z
 */
const ConcentrationMod = (() => {
  'use strict';

  // Build-time placeholders replaced by rollup.config.js inject-build-metadata plugin.
  const SCRIPT_NAME = 'Concentration';
  const SCRIPT_VERSION = '1.1.0';
  const SCRIPT_LAST_UPDATED = '2026-11-10T00:57:19.293Z';

  const DEFAULT_LOCALE$1 = 'en-US';

  // Version 1.0 kept its settings here, so the key is unchanged.
  const STATE_KEY = 'CONCENTRATION';
  const SCHEMA_VERSION = 2;

  // The command word without "!". The GM can change it with the `command` setting.
  const DEFAULT_COMMAND = 'concentration';

  // The player ID Roll20 gives chat messages sent by Mods with sendChat.
  const API_PLAYER_ID = 'API';

  const HANDOUT_HELP_NAME = 'Concentration - Help';
  const HANDOUT_DECK_NAME = 'Concentration - Command Deck';
  // Journal icon (the handouts' avatar): the plain Concentration icon in Roll20's
  // file store. Roll20 keeps it as `.../max.webp?<number>`, so an icon is matched
  // on its image path. Only the webp files exist (thumb.png is a 404).
  const HANDOUT_ICON_PATH = '/images/506991604/a1UiVOI8fGKK8iOrNd_Cdw/';
  const HANDOUT_ICON = `https://files.d20.io${HANDOUT_ICON_PATH}thumb.webp`;

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

  // Who sees concentration notices and saves.
  const SEND_TO_OPTIONS = ['everyone', 'character', 'gm'];
  const SUPPORT_MODE_OPTIONS = ['basic', 'detailed'];
  const BAR_OPTIONS = [1, 2, 3];

  // Default configuration. Keys keep version 1.0's names so existing macros such
  // as `!concentration config auto_roll_save|false` keep working.
  const DEFAULT_CONFIG = {
    language: DEFAULT_LOCALE$1,
    command: DEFAULT_COMMAND,
    statusmarker: 'stopwatch',
    bar: 1,
    send_reminder_to: 'everyone',
    auto_add_concentration_marker: true,
    auto_roll_save: true,
    show_roll_button: true,
    end_at_zero: true,
    bonus_attribute: 'constitution_save_mod',
    debug: false,
    support_mode: 'basic',
  };

  // Settings that take true or false.
  const TOGGLE_KEYS = [
    'auto_add_concentration_marker',
    'auto_roll_save',
    'show_roll_button',
    'end_at_zero',
    'debug',
  ];

  // Settings the GM can change on the Mod's page in the API Scripts screen.
  const USEROPTION_KEYS = [
    'language',
    'command',
    'statusmarker',
    'bar',
    'send_reminder_to',
    'auto_add_concentration_marker',
    'auto_roll_save',
    'end_at_zero',
    'bonus_attribute',
  ];

  // Rules for concentration saves: DC 10 or half the damage, up to DC 30.
  const MIN_SAVE_DC = 10;
  const MAX_SAVE_DC = 30;

  // Roll and Advantage buttons stop working after this long.
  const PENDING_ROLL_TTL_MS = 10 * 60 * 1000;
  const MAX_PENDING_ROLLS = 100;

  // Linked bars change every token of a character at once; damage seen again
  // for the same character within this time is the same hit.
  const DAMAGE_DEBOUNCE_MS = 1000;

  // Limits on text typed into commands.
  const MAX_SPELL_LENGTH = 80;
  const MAX_ATTRIBUTE_LENGTH = 80;

  // Version 1.0's marker names, offered when the game has no custom token markers.
  const DEFAULT_MARKERS = [
    'blue',
    'brown',
    'green',
    'pink',
    'purple',
    'red',
    'yellow',
    'all-for-one',
    'angel-outfit',
    'archery-target',
    'arrowed',
    'aura',
    'back-pain',
    'black-flag',
    'bleeding-eye',
    'bolt-shield',
    'broken-heart',
    'broken-shield',
    'broken-skull',
    'chained-heart',
    'chemical-bolt',
    'cobweb',
    'dead',
    'death-zone',
    'drink-me',
    'edge-crack',
    'fishing-net',
    'fist',
    'fluffy-wing',
    'flying-flag',
    'frozen-orb',
    'grab',
    'grenade',
    'half-haze',
    'half-heart',
    'interdiction',
    'lightning-helix',
    'ninja-mask',
    'overdrive',
    'padlock',
    'pummeled',
    'radioactive',
    'rolling-tomb',
    'screaming',
    'sentry-gun',
    'skull',
    'sleepy',
    'snail',
    'spanner',
    'stopwatch',
    'strong',
    'three-leaves',
    'tread',
    'trophy',
    'white-tower',
  ];

  // Commands listed by `help` and the Help handout, with their help keys.
  const HELP_COMMANDS = [
    ['', 'menu'],
    ['<spell>', 'toggle'],
    ['end', 'end'],
    ['status', 'status'],
    ['config [<setting>|<value>]', 'config'],
    ['advantage-menu', 'advantageMenu'],
    ['toggle-advantage <character id>', 'toggleAdvantage'],
    ['roll <id> / advantage <id>', 'roll'],
    ['journal', 'journal'],
    ['reset', 'reset'],
    ['help', 'help'],
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
  const COLOR_SUCCESS = '#4ade80';
  const COLOR_FAILURE = '#f87171';
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
   * Escapes text for an HTML attribute such as a button's href. Roll20 queries
   * (?{...}) must survive, so only HTML characters are encoded.
   *
   * @param {*} text Text to escape.
   * @returns {string} Escaped text.
   */
  function escapeAttr(text) {
    return String(text ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  /**
   * Escapes text for display. Roll20 syntax characters are encoded too:
   * sendChat resolves @{...} and %{...} and rolls [[...]] even in a Mod's
   * whispers, and drops the whole message when a reference cannot be found.
   *
   * @param {*} text Text to escape.
   * @returns {string} Escaped text.
   */
  function escapeHtml(text) {
    return escapeAttr(text)
      .replaceAll('@', '&#64;')
      .replaceAll('%', '&#37;')
      .replaceAll('[', '&#91;')
      .replaceAll(']', '&#93;')
      .replaceAll('{', '&#123;')
      .replaceAll('}', '&#125;');
  }

  /**
   * Decodes the handful of HTML entities Roll20 puts into chat content.
   *
   * @param {string} text HTML text.
   * @returns {string} Decoded text.
   */
  function decodeEntities(text) {
    return toText(text)
      .replaceAll(/&nbsp;/gi, ' ')
      .replaceAll(/&quot;/gi, '"')
      .replaceAll(/&#0?39;/g, "'")
      .replaceAll(/&lt;/gi, '<')
      .replaceAll(/&gt;/gi, '>')
      .replaceAll(/&amp;/gi, '&');
  }

  /**
   * Shortens text to a maximum length.
   *
   * @param {*} value Text.
   * @param {number} maxLength Maximum length.
   * @returns {string} Text, cut short with "..." when too long.
   */
  function truncate(value, maxLength) {
    const text = toText(value);
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
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
   * Parses a number from a bar or attribute value.
   *
   * @param {*} raw Raw value.
   * @returns {number|null} Number, or null when it is not one.
   */
  function parseNumber(raw) {
    if (typeof raw === 'number') {
      return Number.isFinite(raw) ? raw : null;
    }
    const text = toText(raw);
    if (!/^[+-]?\d+(\.\d+)?$/.test(text)) {
      return null;
    }
    return Number(text);
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
   * Cleans a spell name typed into a command: no HTML or Roll20 syntax
   * characters, and a sensible length.
   *
   * @param {*} raw Raw text.
   * @param {number} maxLength Maximum length.
   * @returns {string} Clean spell name (may be empty).
   */
  function cleanSpellName(raw, maxLength) {
    return truncate(
      toText(raw)
        .replaceAll(/[<>|{}[\]@%\\]/g, '')
        .replaceAll(/\s+/g, ' '),
      maxLength
    );
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
   * Returns true when a statusmarkers string holds a marker, with or without a
   * number badge (`stopwatch@3`).
   *
   * @param {string} statusmarkers Comma-separated markers.
   * @param {string} marker Marker tag.
   * @returns {boolean} True when present.
   */
  function hasMarkerIn(statusmarkers, marker) {
    return toText(statusmarkers)
      .split(',')
      .some((tag) => tag && tag.split('@')[0] === marker);
  }

  /**
   * Returns true when a token has a marker.
   *
   * @param {object} token Roll20 graphic.
   * @param {string} marker Marker tag.
   * @returns {boolean} True when present.
   */
  function hasMarker(token, marker) {
    return hasMarkerIn(token?.get('statusmarkers'), marker);
  }

  /**
   * Adds or removes a status marker, keeping the token's other markers.
   *
   * @param {object} token Roll20 graphic.
   * @param {string} marker Marker tag.
   * @param {boolean} on Add when true, remove when false.
   * @returns {boolean} True when the token changed.
   */
  function setMarker(token, marker, on) {
    if (hasMarker(token, marker) === on) {
      return false;
    }
    const markers = toText(token.get('statusmarkers'))
      .split(',')
      .filter((tag) => tag && tag.split('@')[0] !== marker);
    if (on) {
      markers.push(marker);
    }
    token.set('statusmarkers', markers.join(','));
    return true;
  }

  /**
   * Returns a token's display name, falling back to its character's name.
   *
   * @param {object|null} token Roll20 graphic.
   * @returns {string} Name (may be empty).
   */
  function tokenName(token) {
    const name = toText(token?.get('name'));
    if (name) {
      return name;
    }
    const characterId = toText(token?.get('represents'));
    const character = characterId ? getObj('character', characterId) : null;
    return toText(character?.get('name'));
  }

  /**
   * Returns the IDs in a comma-separated controlledby list.
   *
   * @param {*} raw controlledby value.
   * @returns {string[]} Player IDs (and "all").
   */
  function splitControllers(raw) {
    return toText(raw)
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
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

  const CHAT_SUBTITLE_STYLE = `color:${COLOR_MUTED};font-size:0.8em;font-variant:normal;font-weight:normal;letter-spacing:0`;

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
   * Keeps chat HTML on one line. Roll20 only whispers the first line of a
   * message and posts the rest publicly, so a stray line break would leak the
   * end of a whispered card to everyone.
   *
   * @param {string} html Chat HTML.
   * @returns {string} The same HTML without line breaks.
   */
  function oneLine(html) {
    return String(html).replaceAll(/\r?\n/g, ' ');
  }

  /**
   * Returns the whisper target for a player, falling back to all GMs.
   * Double quotes are stripped so the name is safe inside /w "name".
   *
   * @param {string} [playerId] Roll20 player ID.
   * @returns {string} Whisper target text.
   */
  function playerTarget(playerId) {
    const player = playerId ? getObj('player', playerId) : null;
    if (!player) {
      return 'gm';
    }
    return `"${String(player.get('displayname') || playerId).replaceAll('"', '')}"`;
  }

  /**
   * Returns the whisper target for a character's players: Roll20 whispers to
   * a character by name reach everyone who controls it.
   *
   * @param {string} name Character name.
   * @returns {string} Whisper target text.
   */
  function characterTarget(name) {
    const clean = toText(name).replaceAll('"', '');
    return clean ? `"${clean}"` : 'gm';
  }

  /**
   * Sends HTML to a target: '' for everyone, otherwise a whisper.
   *
   * @param {string} target Whisper target, or '' for everyone.
   * @param {string} html Chat HTML.
   * @returns {void}
   */
  function sendTo(target, html) {
    const text = oneLine(html);
    if (target) {
      sendChat(SCRIPT_NAME, `/w ${target} ${text}`, null, { noarchive: true });
    } else {
      sendChat(SCRIPT_NAME, text);
    }
  }

  /**
   * Builds a styled chat card.
   *
   * @param {string} title Header text (escaped).
   * @param {string} body Body HTML (trusted).
   * @param {string} [subtitle] Second header line (escaped).
   * @param {string} [dirStyle] Text direction CSS for right-to-left languages.
   * @returns {string} HTML string.
   */
  function buildCard(title, body, subtitle = '', dirStyle = '') {
    const sub = subtitle
      ? `<br><span style="${CHAT_SUBTITLE_STYLE}">${escapeHtml(subtitle)}</span>`
      : '';
    return [
      `<div style="${CHAT_CARD_STYLE}">`,
      `<div style="${CHAT_HEADER_STYLE}">${escapeHtml(title)}${sub}</div>`,
      `<div style="${CHAT_CONTENT_STYLE}${dirStyle ? `;${dirStyle}` : ''}">${body}</div>`,
      '</div>',
    ].join('');
  }

  /**
   * Sends a styled card whispered to a player, or to every GM when no player is given.
   *
   * @param {string|null} playerId Roll20 player ID.
   * @param {string} title Card header text.
   * @param {string|string[]} content HTML body content.
   * @param {string} [dirStyle] Text direction CSS.
   * @returns {void}
   */
  function whisper(playerId, title, content, dirStyle = '') {
    const body = Array.isArray(content) ? content.join('') : content;
    sendTo(playerTarget(playerId), buildCard(title, body, '', dirStyle));
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
    sendTo(playerTarget(playerId), `<div style="${style}">${escapeHtml(message)}</div>`);
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
    sendTo(
      playerTarget(playerId),
      `<div style="${style}"><strong>${escapeHtml(message)}</strong>${hintHtml}</div>`
    );
  }

  /**
   * Builds a primary action button.
   *
   * @param {string} label Button label.
   * @param {string} command Chat command the button runs.
   * @returns {string} HTML anchor.
   */
  function buildButton(label, command) {
    return `<a href="${escapeAttr(command)}" style="${BUTTON_STYLE}">${escapeHtml(label)}</a>`;
  }

  /**
   * Builds a secondary action button.
   *
   * @param {string} label Button label.
   * @param {string} command Chat command the button runs.
   * @returns {string} HTML anchor.
   */
  function buildSecondaryButton(label, command) {
    return `<a href="${escapeAttr(command)}" style="${BUTTON_SECONDARY_STYLE}">${escapeHtml(label)}</a>`;
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
   * @param {string} [hint] Small text under the label (escaped).
   * @returns {string} HTML string.
   */
  function buildRow(label, valueHtml, hint = '') {
    const hintHtml = hint
      ? `<div style="font-size:0.8em;color:${COLOR_MUTED};line-height:1.2">${escapeHtml(hint)}</div>`
      : '';
    return [
      '<table style="width:100%;border-collapse:collapse;margin:1px 0"><tr>',
      `<td style="color:${COLOR_MUTED};width:55%;font-size:0.9em;vertical-align:middle">${escapeHtml(label)}${hintHtml}</td>`,
      `<td style="text-align:right;width:45%;vertical-align:middle">${valueHtml}</td>`,
      '</tr></table>',
    ].join('');
  }

  const TRANSLATION$n = {
    titles: {
      ready: 'Konsentrasie is gereed.',
      menu: 'Konsentrasie-instellings',
      help: 'Konsentrasie opdragte',
      status: 'Wie konsentreer',
      advantage: 'Voordeel op konsentrasiebesparings',
      reset: 'Stel konsentrasie terug',
      concentration: 'Konsentrasie',
      save: 'Konsentrasie Stoor',
      check: 'Konsentrasiekontrole',
    },
    messages: {
      migrated:
        "Opgegradeer vanaf weergawe 1.0. Jou instellings en voordelelys is gehou, en jou ou makro's werk steeds.",
      reconciled:
        'Opgevang met die kaart: konsentreer-tokens gevind {added}, ou inskrywings is verwyder {dropped}.',
      readyHint: 'Tik {command} vir die instellings, of maak die Command Deck-uitdeelstuk oop.',
      settingChanged: '{setting} is nou {value}.',
      confirmReset:
        'Stel elke instelling terug na sy verstek en maak die voordeellys skoon? Konsentrasiemerkers op die kaart bly.',
      reset: 'Instellings teruggestel na hul verstekke.',
      journal: 'Uitdeelstukke herbou: {help} en {deck}.',
    },
    notices: {
      started: '{name} konsentreer nou op {spell}.',
      startedNoSpell: '{name} konsentreer nou.',
      switched: '{name} hou op om op {old} te konsentreer en konsentreer nou op {spell}.',
      switchedNoSpell: '{name} konsentreer nou.',
      ended: '{name} konsentreer nie meer op {spell} nie.',
      endedNoSpell: '{name} konsentreer nie meer nie.',
      lost: '{name} verloor konsentrasie op {spell}.',
      lostNoSpell: '{name} verloor konsentrasie.',
      kept: '{name} hou aan konsentreer op {spell}.',
      keptNoSpell: '{name} hou aan konsentreer.',
      zeroHp: '{name} daal tot 0 trefpunte en verloor konsentrasie op {spell}.',
      zeroHpNoSpell: '{name} daal tot 0 trefpunte en verloor konsentrasie.',
      checkNeeded: "{name} moet 'n Grondwet-spaargooi maak om aan te hou konsentreer: {dc}.",
    },
    save: {
      dc: 'DC',
      dcValue: 'DC {dc}',
      modifier: 'Wysiger',
      roll: 'Rol',
      advantageRoll: '{first} en {second} (voordeel)',
      success: 'Sukses',
      failure: 'Mislukking',
    },
    menu: {
      concentratingCount: 'Konsentreer nou: {count}',
      settings: 'Instellings',
      footer:
        'Tik {command} om hierheen terug te kom. Elke knoppie is ook in die "{deck}"-uitdeelstuk.',
    },
    status: {
      none: 'Niemand konsentreer nie.',
    },
    advantage: {
      intro:
        'Karakters ingestel op Aan rol hul konsentrasie spaar met voordeel, soos met die War Caster-prestasie. Dit geld vir outomatiese stoor.',
      none: 'Daar is geen karakters in hierdie speletjie nie.',
    },
    buttons: {
      roll: 'Rol',
      advantage: 'Voordeel',
      status: 'Status',
      advantageMenu: 'Voordeel spyskaart',
      help: 'Help',
      reset: 'Stel terug',
      confirmReset: 'Stel instellings terug',
      end: 'Einde',
      menu: 'Spyskaart',
      concentrate: 'Konsentreer op...',
      toggle: 'Wissel',
      journal: 'Herbou uitdeelstukke',
    },
    prompts: {
      spell: 'Spel',
    },
    values: {
      on: 'Aan',
      off: 'Af',
      bar: 'Staaf {bar}',
      unnamed: 'Naamloos',
      sendTo: {
        everyone: 'Almal',
        character: 'Karakter',
        gm: 'GM',
      },
      supportMode: {
        basic: 'Basies',
        detailed: 'Gedetailleerd',
      },
    },
    settings: {
      language: {
        label: 'Taal',
        desc: 'Die taal van kletsboodskappe en uitdeelstukke.',
      },
      command: {
        label: 'Bevel',
        desc: 'Die kletsopdrag, sonder die "!". Weergawe 1.0 makro\'s gebruik konsentrasie.',
      },
      statusmarker: {
        label: 'Status Merker',
        desc: 'Die tekenmerker wat konsentrasie toon. Gepasmaakte tekenmerkers kan gebruik word.',
      },
      bar: {
        label: 'HP Bar',
        desc: "Die tekenbalk wat trefpunte bevat. Skade daaraan verg 'n konsentrasiebesparing.",
      },
      send_reminder_to: {
        label: 'Stuur herinnering aan',
        desc: "Wie konsentrasieboodskappe sien en stoor: almal, die GM, of die karakter se spelers (die GM kry 'n kopie).",
      },
      auto_add_concentration_marker: {
        label: 'Auto Voeg Con. Merker',
        desc: "Voeg die merker by wanneer 'n konsentrasiespel uit 'n vel gegooi word.",
        hint: 'D&D 5e 2014 (OGL) en 2024-blaaie.',
      },
      auto_roll_save: {
        label: 'Stoor outomaties',
        desc: "Rol die stoor sodra 'n konsentreerteken skade opdoen. As dit af is, het die herinnering Rol- en Advantage-knoppies.",
      },
      show_roll_button: {
        label: 'Rol knoppie',
        desc: 'Voeg Roll- en Advantage-knoppies by die herinnering wanneer Auto Roll Save af is.',
      },
      end_at_zero: {
        label: 'Eindig by 0 HP',
        desc: "Beëindig konsentrasie sonder 'n stoor wanneer 'n teken tot 0 trefpunte daal.",
      },
      bonus_attribute: {
        label: 'Bonus kenmerk',
        desc: 'Die lakkenmerk wat by konsentrasie gevoeg word, spaar. constitution_save_mod werk op D&D 5e 2014 en 2024-blaaie.',
      },
      debug: {
        label: 'Ontfoutmodus',
        desc: 'Skryf notas oor spelbespeuring en stoor na die API-konsole, vir ondersteuningsversoeke.',
      },
      support_mode: {
        label: 'Ondersteuningsmodus',
        desc: 'Hoeveel Debug Mode skryf: Basies (kort) of Gedetailleerd.',
      },
    },
    help: {
      menu: 'Met niks gekies nie (GM): maak die instellings oop. Met tekens gekies: begin- of eindkonsentrasie.',
      toggle:
        "Begin konsentreer op 'n towerspel met die geselekteerde tekens. Noem 'n ander spel om oor te skakel; hardloop dit weer om te eindig.",
      end: 'Eindkonsentrasie vir die geselekteerde tokens.',
      status: 'Lys wie konsentreer, met Einde-knoppies.',
      config: "Verander 'n instelling, byvoorbeeld config auto_roll_save|false.",
      advantageMenu: 'Kies watter karakters rolkonsentrasie spaar met voordeel.',
      toggleAdvantage: 'Skakel voordeel aan of af vir een karakter.',
      roll: "Rol 'n stoor vanaf 'n herinnering se Roll of Advantage-knoppie.",
      journal: 'Herbou die hulp- en beveldek-uitdeelstukke.',
      reset: 'Stel elke instelling terug na sy verstek.',
      help: 'Wys hierdie lys.',
      footer:
        'Volledige instruksies is in die "{help}"-uitdeelstuk; knoppies is in die "{deck}"-uitdeelstuk.',
      playerFooter: 'Kies eers jou teken.',
    },
    errors: {
      noSelection: "Kies eers 'n teken.",
      notYours: 'Jy kan net konsentrasie verander vir tekens wat jy beheer.',
      gmOnly: 'Slegs die GM kan daardie opdrag gebruik.',
      notConcentrating: 'Daardie teken konsentreer nie.',
      unknownSetting: 'Daar is geen instelling genaamd "{key}" nie.',
      badSettingValue: '"{value}" is nie \'n geldige waarde vir {key} nie.',
      rollExpired: 'Daardie knoppie het verval.',
      unknownCharacter: 'Daardie karakter bestaan ​​nie meer nie.',
      internal: 'Iets het verkeerd geloop. Die API-konsole het die besonderhede.',
    },
    hints: {
      noSelection: 'Kies die rolspeler se teken en voer dan die opdrag weer uit.',
      rollExpired:
        "Knoppies werk een keer en vir 10 minute. Beskadig die teken weer vir 'n nuwe een.",
      unknownSetting: 'Tik die opdrag met niks gekies om die instellings te sien nie.',
    },
    warnings: {
      unknownMarker:
        'Die statusmerker "{marker}" is nie een van hierdie speletjie se merkers nie. Kies \'n ander in die instellings.',
    },
    deck: {
      subtitle: 'Beveldek',
      selected: 'Geselekteerde tokens',
      selectedDesc: 'Kies eers die rolspeler se token.',
      table: 'Die Tafel',
      tableDesc: 'Kyk wie konsentreer, en wie het voordeel op hul besparings.',
      tools: 'Gereedskap',
      toolsDesc: 'Instellings, die opdraglys en die uitdeelstukke.',
      footer: 'Volledige instruksies is in die "{help}"-uitdeelstuk.',
    },
    handout: {
      versionLabel: 'Weergawe',
      subtitle: 'Konsentrasiemerkers, aanmanings en stoor vir D&D 5e',
      overview: {
        heading: 'Oorsig',
        body: "Konsentrasie hou tred met wie op watter spel konsentreer. Dit plaas 'n merker op die rolspeler se teken, rol (of vra vir) 'n Grondwet stoor wanneer daardie teken skade opdoen, en vertel die tafel wanneer konsentrasie eindig.",
      },
      quickStart: {
        heading: 'Vinnige begin',
        steps: [
          'Kies die rolspeler se teken en tik !konsentrasie gevolg deur die towerspel, byvoorbeeld !konsentrasie Bless.',
          "Verander die teken se trefpunte in sy staafborrel. 'n Save word gerol teen DC 10, of die helfte van die skade as dit hoër is.",
          'Voer dieselfde opdrag weer uit, of haal die merker af, om konsentrasie te beëindig.',
          'Tik !konsentrasie met niks gekies om die instellings oop te maak nie.',
        ],
      },
      concentrating: {
        heading: 'Konsentreer',
        points: [
          "Deur 'n ander towerspreuk te benoem, verander konsentrasie daarna, soos om 'n nuwe konsentrasiespel te doen.",
          "Deur die merker met die hand op 'n teken te plaas, begin konsentrasie sonder 'n spel; dit afneem, of die teken uitvee, beëindig dit.",
          "'n Nuwe gekoppelde teken van 'n konsentrerende karakter kry die merker, en 'n geplakte teken wat die merker dra, word nagespoor.",
          "Tekens van een karakter met 'n gekoppelde trefferpuntstaafdeelkonsentrasie. Ontkoppelde tekens, soos 'n pak kabouters van een laken, konsentreer op hul eie.",
          "Almal sien 'n boodskap wanneer konsentrasie begin, oorskakel of eindig, tensy Stuur herinnering aan anders sê.",
        ],
      },
      saves: {
        heading: 'Konsentrasie spaar',
        points: [
          'Die DC is 10 of die helfte van die skade wat geneem is, wat ook al die hoogste is, tot DC 30.',
          "Die wysiger kom van die Bonuskenmerk op die karakter se blad; 'n ontbrekende waarde tel as 0.",
          'Outo-rol Stoor rolle gelyktydig. Wanneer dit af is, het die herinnering Roll- en Advantage-knoppies vir die speler of GM.',
          "'n Mislukte stoor beëindig konsentrasie. Met Einde op 0 HP aan, eindig dit sonder 'n stoor as u na 0 trefpunte daal.",
          "Die Advantage Menu gee 'n karaktervoordeel op outomatiese stoor, soos die War Caster-prestasie doen.",
        ],
      },
      automatic: {
        heading: "Towerspreuke uit 'n blad gegooi",
        points: [
          "Met Auto Add Con. Merker op, gooi 'n konsentrasie toor uit 'n D&D 5e 2014 (OGL) of 2024 blad voeg die merker by.",
          'Die rolspeler se tokens op die bladsy wat hulle bekyk, is gemerk; as daar geen is nie, is tekens op enige bladsy.',
          "Slegs kaarte van die GM, 'n ander Mod of een van die karakter se spelers tel. Om weer dieselfde towerspel uit te spreek verander niks nie.",
          "'n D&D 2024-kaart wat net konsentrasie in sy teks noem, soos die War Caster-prestasie, kan konsentrasie begin, maar vervang nooit 'n towerspreuk nie.",
          "D&D 2024-blaaie benodig dalk die eksperimentele API-bediener. Skakel Ontfoutmodus aan om te sien hoekom 'n towerspreuk bespeur is of nie.",
        ],
      },
      players: {
        heading: 'Spelers',
        points: [
          'Spelers kan konsentrasie begin en beëindig vir tekens wat hulle beheer, en Roll- en Advantage-knoppies gebruik op hul eie stoor.',
          'Met Stuur herinnering Om op Karakter te stel, word boodskappe aan die karakter se spelers en aan die GM gefluister.',
        ],
      },
      commands: {
        heading: 'Opdragte',
        intro: 'Ander mods, soos ScriptCards, kan ook hierdie opdragte stuur.',
        colCommand: 'Bevel',
        colDesc: 'Wat dit doen',
      },
      settings: {
        heading: 'Instellings',
        intro:
          'Verander instellings met die knoppies in die instellingskaart, of met config <sleutel>|<waarde>. Sommige kan ook op die Mod se bladsy ingestel word.',
        colKey: 'Sleutel',
        colName: 'Naam',
        colDesc: 'Wat dit doen',
      },
      upgrading: {
        heading: 'Opgradering vanaf weergawe 1.0',
        points: [
          'Instellings, die voordelelys en elke opdrag bly werk.',
          'Boodskappe sê nou wanneer konsentrasie eindig, en op watter spel.',
          'Tokens wat reeds die merker dra, word opgetel wanneer dit begin word.',
        ],
      },
      troubleshooting: {
        heading: 'Probleemoplossing',
        points: [
          'Geen stoor wanneer trefpunte daal nie: maak seker dat die teken die merker het en dat HP Bar die balk is wat jy verander het. Veranderinge wat deur ander Mods deur die API gemaak word, veroorsaak nie gebeurtenisse nie, dus word hulle nie gesien nie.',
          'Die wysiger is 0: kontroleer die bonuskenmerk teen die karakter se blad.',
          'Spele wat uit die blad gegooi word, word nie bespeur nie: skakel Ontfoutmodus aan, spel weer uit en lees die API-konsole.',
          "Twee karakters deel 'n naam: opsporing gebruik die eerste pasmaat. Gee karakters unieke name.",
        ],
      },
      languages: {
        heading: 'Tale',
        body: 'Konsentrasie word in die tale hieronder vertaal. Kies een met die Taalinstelling.',
        colCode: 'Kode',
        colName: 'Taal',
        colNative: 'Inheemse naam',
      },
      credits: {
        heading: 'Krediete',
        original: 'Oorspronklike mod deur',
        maintainer: 'Onderhou deur',
        support: 'Rapporteer foute en idees op die Roll20 Mod-forum of op GitHub.',
      },
      footer: 'Knoppies vir elke handeling is in die "{deck}"-uitdeelstuk.',
    },
  };

  const TRANSLATION$m = {
    titles: {
      ready: 'La concentració està a punt.',
      menu: 'Configuració de concentració',
      help: 'Ordres de concentració',
      status: 'Qui es concentra',
      advantage: "Avantatge en l'estalvi de concentració",
      reset: 'Restableix la concentració',
      concentration: 'Concentració',
      save: 'Estalvi de concentració',
      check: 'Control de concentració',
    },
    messages: {
      migrated:
        "Actualitzat des de la versió 1.0. La vostra configuració i la vostra llista d'avantatges es van mantenir i les vostres macros antigues encara funcionen.",
      reconciled:
        "S'han posat al dia amb el mapa: s'han trobat fitxes de concentració {added}, s'han eliminat entrades antigues {dropped}.",
      readyHint: 'Escriviu {command} per a la configuració o obriu el fullet de comandaments.',
      settingChanged: '{setting} és ara {value}.',
      confirmReset:
        "Voleu tornar cada paràmetre al seu valor predeterminat i esborrar la llista d'avantatges? Els marcadors de concentració queden al mapa.",
      reset: 'La configuració torna als seus valors predeterminats.',
      journal: 'Fullets reconstruïts: {help} i {deck}.',
    },
    notices: {
      started: '{name} ara es concentra en {spell}.',
      startedNoSpell: "{name} ara s'està concentrant.",
      switched: '{name} deixa de concentrar-se en {old} i ara es concentra en {spell}.',
      switchedNoSpell: "{name} ara s'està concentrant.",
      ended: '{name} ja no es concentra en {spell}.',
      endedNoSpell: '{name} ja no es concentra.',
      lost: '{name} perd la concentració en {spell}.',
      lostNoSpell: '{name} perd la concentració.',
      kept: '{name} continua concentrant-se en {spell}.',
      keptNoSpell: '{name} es manté concentrat.',
      zeroHp: '{name} baixa a 0 punts de vida i perd la concentració a {spell}.',
      zeroHpNoSpell: '{name} baixa a 0 punts de vida i perd la concentració.',
      checkNeeded:
        '{name} ha de fer una tirada de salvació de la Constitució per mantenir la concentració: {dc}.',
    },
    save: {
      dc: 'DC',
      dcValue: 'DC {dc}',
      modifier: 'Modificador',
      roll: 'Rotlla',
      advantageRoll: '{first} i {second} (avantatge)',
      success: 'Èxit',
      failure: 'Fracàs',
    },
    menu: {
      concentratingCount: 'Concentrant-se ara: {count}',
      settings: 'Configuració',
      footer:
        'Escriviu {command} per tornar aquí. Tots els botons també es troben al fullet "{deck}".',
    },
    status: {
      none: 'Ningú es concentra.',
    },
    advantage: {
      intro:
        "Els personatges establerts a On roll, la seva concentració salva amb avantatge, com amb la proesa War Caster. Això s'aplica als desats automàtics.",
      none: 'No hi ha personatges en aquest joc.',
    },
    buttons: {
      roll: 'Rotlla',
      advantage: 'Avantatge',
      status: 'Estat',
      advantageMenu: 'Menú Avantatge',
      help: 'Ajuda',
      reset: 'Restableix',
      confirmReset: 'Restableix la configuració',
      end: 'Final',
      menu: 'Menú',
      concentrate: "Concentra't en…",
      toggle: 'Commuta',
      journal: 'Reconstrueix els fullets',
    },
    prompts: {
      spell: 'Encanteri',
    },
    values: {
      on: 'Encès',
      off: 'Apagat',
      bar: 'Barra {bar}',
      unnamed: 'Sense nom',
      sendTo: {
        everyone: 'Tothom',
        character: 'Caràcter',
        gm: 'GM',
      },
      supportMode: {
        basic: 'Bàsica',
        detailed: 'Detallat',
      },
    },
    settings: {
      language: {
        label: 'Llengua',
        desc: "L'idioma dels missatges de xat i fullets.",
      },
      command: {
        label: 'Comandament',
        desc: 'L\'ordre de xat, sense "!". Les macros de la versió 1.0 utilitzen concentració.',
      },
      statusmarker: {
        label: "Marcador d'estat",
        desc: 'El marcador que mostra la concentració. Es poden utilitzar marcadors de testimoni personalitzats.',
      },
      bar: {
        label: 'HP Bar',
        desc: 'La barra de fitxes que conté els punts de vida. El dany al mateix requereix una estalvi de concentració.',
      },
      send_reminder_to: {
        label: 'Enviar recordatori a',
        desc: "Qui veu missatges de concentració i salva: tothom, el GM o els jugadors del personatge (el GM n'obté una còpia).",
      },
      auto_add_concentration_marker: {
        label: 'Afegeix automàticament Con. Marcador',
        desc: "Afegiu el marcador quan es faci un encanteri de concentració des d'un full.",
        hint: 'Fulls D&D 5e 2014 (OGL) i 2024.',
      },
      auto_roll_save: {
        label: 'Desar automàticament',
        desc: 'Tira la salva tan bon punt una fitxa de concentració pateix danys. Quan està desactivat, el recordatori té els botons Roll i Avantatge.',
      },
      show_roll_button: {
        label: 'Botó Roll',
        desc: "Afegeix els botons Roll i Advantage al recordatori quan l'opció Auto Roll Save està desactivada.",
      },
      end_at_zero: {
        label: 'Finalitza a 0 HP',
        desc: 'Finalitza la concentració sense salvar quan una fitxa baixa a 0 punts de vida.',
      },
      bonus_attribute: {
        label: 'Atribut de bonificació',
        desc: "L'atribut de full afegit a la concentració estalvia. constitution_save_mod funciona en fulls D&D 5e 2014 i 2024.",
      },
      debug: {
        label: 'Mode de depuració',
        desc: "Escriu notes sobre la detecció d'ortografia i desa-les a la consola de l'API, per a sol·licituds d'assistència.",
      },
      support_mode: {
        label: 'Mode de suport',
        desc: 'Quant escriu el mode de depuració: bàsic (curt) o detallat.',
      },
    },
    help: {
      menu: 'Sense res seleccionat (GM): obriu la configuració. Amb fitxes seleccionades: iniciar o acabar la concentració.',
      toggle:
        'Comenceu a concentrar-vos en un encanteri amb les fitxes seleccionades. Anomena un encanteri diferent per canviar; torna a executar-lo per acabar.',
      end: 'Finalitzar la concentració de les fitxes seleccionades.',
      status: "Llista qui s'està concentrant, amb els botons Finalitzar.",
      config: 'Canvieu una configuració, per exemple config auto_roll_save|false.',
      advantageMenu: "Trieu quins personatges s'estalvia la concentració de tirades amb avantatge.",
      toggleAdvantage: "Activa o desactiva l'avantatge d'un personatge.",
      roll: "Tira una desada des del botó Tira o Avantatge d'un recordatori.",
      journal: "Reconstruïu els fulls d'ajuda i de comandaments.",
      reset: 'Torneu a posar cada paràmetre al seu valor predeterminat.',
      help: 'Mostra aquesta llista.',
      footer:
        'Les instruccions completes es troben al fullet "{help}"; els botons es troben al fullet "{deck}".',
      playerFooter: 'Seleccioneu primer el vostre testimoni.',
    },
    errors: {
      noSelection: 'Seleccioneu primer un testimoni.',
      notYours: 'Només podeu canviar la concentració per a fitxes que controleu.',
      gmOnly: 'Només el GM pot utilitzar aquesta ordre.',
      notConcentrating: 'Aquest testimoni no es concentra.',
      unknownSetting: 'No hi ha cap configuració anomenada "{key}".',
      badSettingValue: '"{value}" no és un valor vàlid per a {key}.',
      rollExpired: 'Aquest botó ha caducat.',
      unknownCharacter: 'Aquest personatge ja no existeix.',
      internal: "Alguna cosa va fallar. La consola de l'API té els detalls.",
    },
    hints: {
      noSelection:
        "Seleccioneu el testimoni del llançador i, a continuació, torneu a executar l'ordre.",
      rollExpired:
        'Els botons funcionen una vegada i durant 10 minuts. Torneu a danyar el testimoni per fer-ne un de nou.',
      unknownSetting: "Escriviu l'ordre sense seleccionar res per veure la configuració.",
    },
    warnings: {
      unknownMarker:
        'El marcador d\'estat "{marker}" no és un dels marcadors d\'aquest joc. Trieu-ne un altre a la configuració.',
    },
    deck: {
      subtitle: 'Comandament de la plataforma',
      selected: 'Fitxes seleccionades',
      selectedDesc: 'Seleccioneu primer el testimoni del llançador.',
      table: 'La Taula',
      tableDesc: 'Mireu qui es concentra i qui té avantatge en les seves parades.',
      tools: 'Eines',
      toolsDesc: "Configuració, la llista d'ordres i els fullets.",
      footer: 'Les instruccions completes es troben al fullet "{help}".',
    },
    handout: {
      versionLabel: 'Versió',
      subtitle: 'Marcadors de concentració, recordatoris i estalvis per a D&D 5e',
      overview: {
        heading: 'Visió general',
        body: 'La concentració fa un seguiment de qui es concentra en quin encanteri. Posa un marcador a la fitxa del llançador, tira (o demana) una salvació de Constitució quan aquesta fitxa rep dany i indica a la taula quan acaba la concentració.',
      },
      quickStart: {
        heading: 'Inici ràpid',
        steps: [
          "Seleccioneu la fitxa del llançador i escriviu !concentration seguit de l'encanteri, per exemple !concentration Bless.",
          "Canvia els punts d'impacte de la fitxa a la seva bombolla de barra. Es tira una salvació amb CD 10, o la meitat del dany si és més gran.",
          'Torneu a executar la mateixa ordre o traieu el marcador per acabar la concentració.',
          'Escriviu !concentration sense seleccionar res per obrir la configuració.',
        ],
      },
      concentrating: {
        heading: 'Concentrant-se',
        points: [
          'Anomenar un encanteri diferent canvia la concentració, com ho fa llançar un nou encanteri de concentració.',
          "Posar el marcador en una fitxa amb la mà comença la concentració sense encanteri; treure'l, o suprimir el testimoni, l'acaba.",
          "Una nova fitxa enllaçada d'un personatge que es concentra obté el marcador i es fa un seguiment d'una fitxa enganxada que porta el marcador.",
          "Les fitxes d'un personatge amb una barra de punts de visita enllaçada comparteixen concentració. Les fitxes no enllaçades, com ara un paquet de follets d'un full, es concentren soles.",
          'Tothom veu un missatge quan comença, canvia o acaba la concentració, tret que Envia recordatori a digui el contrari.',
        ],
      },
      saves: {
        heading: 'La concentració salva',
        points: [
          'La CD és 10 o la meitat del dany rebut, el que sigui més gran, fins a 30 CD.',
          "El modificador prové de l'atribut de bonificació del full del personatge; un valor que falta compta com a 0.",
          'Rotlla automàtica Desa rotlles alhora. Quan està desactivat, el recordatori té botons Roll i Avantatge per al jugador o GM.',
          "Una parada fallida acaba amb la concentració. Amb End a 0 HP activat, baixar a 0 punts de vida s'acaba sense salvar.",
          'El menú Avantatges ofereix un avantatge de personatge en els desats automàtics, com ho fa la gesta de War Caster.',
        ],
      },
      automatic: {
        heading: "Encanteris fets des d'un llençol",
        points: [
          "Amb Auto Add Con. Marcador activat, llançant un encanteri de concentració des d'un full de D&D 5e 2014 (OGL) o 2024 afegeix el marcador.",
          "Les fitxes del llançador a la pàgina que està veient estan marcades; si no n'hi ha, hi ha fitxes de qualsevol pàgina.",
          'Només compten les cartes del GM, un altre mod o un dels jugadors del personatge. Tornar a llançar el mateix encanteri no canvia res.',
          'Una targeta de D&D 2024 que només esmenta la concentració al seu text, com ara la gesta de War Caster, pot iniciar la concentració però mai substitueix un encanteri.',
          "És possible que els fulls D&D 2024 necessitin el servidor de l'API experimental. Activa el mode de depuració per veure per què s'ha detectat o no un encanteri.",
        ],
      },
      players: {
        heading: 'Jugadors',
        points: [
          "Els jugadors poden iniciar i finalitzar la concentració de fitxes que controlen, i utilitzar els botons de tirar i d'avantatge en els seus propis desats.",
          'Amb Enviar recordatori per configurar-lo com a Caràcter, els missatges es xiuxiuegen als jugadors del personatge i al GM.',
        ],
      },
      commands: {
        heading: 'Ordres',
        intro: 'Altres mods, com ara ScriptCards, també poden enviar aquestes ordres.',
        colCommand: 'Comandament',
        colDesc: 'Què fa',
      },
      settings: {
        heading: 'Configuració',
        intro:
          'Canvieu la configuració amb els botons de la targeta de configuració o amb la configuració <clau>|<valor>. Alguns també es poden configurar a la pàgina del mod.',
        colKey: 'clau',
        colName: 'Nom',
        colDesc: 'Què fa',
      },
      upgrading: {
        heading: 'Actualització de la versió 1.0',
        points: [
          "La configuració, la llista d'avantatges i cada comanda segueixen funcionant.",
          'Els missatges ara diuen quan acaba la concentració i en quin encanteri.',
          "Les fitxes que ja porten el marcador es recullen a l'inici.",
        ],
      },
      troubleshooting: {
        heading: 'Resolució de problemes',
        points: [
          "No hi ha cap desa quan baixen els punts de vida: comproveu que la fitxa tingui el marcador i que la barra d'HP sigui la barra que heu canviat. Els canvis fets per altres mods mitjançant l'API no generen esdeveniments, de manera que no es veuen.",
          "El modificador és 0: comproveu l'atribut de bonificació amb el full del personatge.",
          "Els encanteris llançats des del full no es detecten: activeu el mode de depuració, torneu a fer l'encanteri i llegiu la consola de l'API.",
          'Dos personatges comparteixen un nom: la detecció utilitza la primera coincidència. Doneu als personatges noms únics.',
        ],
      },
      languages: {
        heading: 'Idiomes',
        body: "La concentració es tradueix als idiomes següents. Trieu-ne un amb la configuració d'Idioma.",
        colCode: 'Codi',
        colName: 'Llengua',
        colNative: 'Nom nadiu',
      },
      credits: {
        heading: 'Crèdits',
        original: 'Mod original de',
        maintainer: 'Mantingut per',
        support: "Informa d'errors i idees al fòrum Roll20 Mod o a GitHub.",
      },
      footer: 'Els botons per a cada acció es troben al fullet "{deck}".',
    },
  };

  const TRANSLATION$l = {
    titles: {
      ready: '濃度準備好了。',
      menu: '濃度設定',
      help: '集中命令',
      status: '誰在集中精力',
      advantage: '集中撲救的優勢',
      reset: '重置濃度',
      concentration: '專注',
      save: '集中保存',
      check: '濃度檢查',
    },
    messages: {
      migrated: '從1.0版本升級。您的設定和優勢清單已保留，並且您的舊巨集仍然有效。',
      reconciled: '趕上地圖：找到 {added} 集中標記，刪除舊條目 {dropped}。',
      readyHint: '輸入 {command} 進行設置，或開啟 Command Deck 講義。',
      settingChanged: '{setting} 現在是 {value}。',
      confirmReset: '將所有設定恢復為預設值並清除優勢清單？地图上的集中标记保持不变。',
      reset: '設定恢復為預設值。',
      journal: '重建講義：{help} 和 {deck}。',
    },
    notices: {
      started: '{name} 現在專注於 {spell}。',
      startedNoSpell: '{name} 現在正在集中註意力。',
      switched: '{name} 停止專注於 {old}，現在專注於 {spell}。',
      switchedNoSpell: '{name} 現在正在集中註意力。',
      ended: '{name} 不再專注於 {spell}。',
      endedNoSpell: '{name} 不再集中註意力。',
      lost: '{name} 失去對 {spell} 的注意力。',
      lostNoSpell: '{name} 失去注意力。',
      kept: '{name} 繼續專注於 {spell}。',
      keptNoSpell: '{name} 繼續集中註意力。',
      zeroHp: '{name} 生命值降至 0 並失去對 {spell} 的注意力。',
      zeroHpNoSpell: '{name} 生命值降至 0 並失去注意力。',
      checkNeeded: '{name} 必須進行一次體質豁免才能保持專注：{dc}。',
    },
    save: {
      dc: '直流',
      dcValue: '直流 {dc}',
      modifier: '修飾符',
      roll: '卷',
      advantageRoll: '{first} 和 {second} （優點）',
      success: '成功',
      failure: '失敗',
    },
    menu: {
      concentratingCount: '現在集中註意力：{count}',
      settings: '設定',
      footer: '輸入 {command} 返回此處。每個按鈕也都在「{deck}」講義中。',
    },
    status: {
      none: '沒有人集中註意力。',
    },
    advantage: {
      intro:
        '角色設定為在滾動時集中註意力，以節省優勢，就像戰爭施法者的專長一樣。這適用於自動保存。',
      none: '這個遊戲中沒有角色。',
    },
    buttons: {
      roll: '卷',
      advantage: '優勢',
      status: '地位',
      advantageMenu: '優勢選單',
      help: '幫助',
      reset: '重置',
      confirmReset: '重置設定',
      end: '結尾',
      menu: '選單',
      concentrate: '專注於…',
      toggle: '切換',
      journal: '重建講義',
    },
    prompts: {
      spell: '拼字',
    },
    values: {
      on: '在',
      off: '離開',
      bar: '欄 {bar}',
      unnamed: '未命名',
      sendTo: {
        everyone: '每個人',
        character: '特點',
        gm: '通用汽車',
      },
      supportMode: {
        basic: '基本的',
        detailed: '詳細的',
      },
    },
    settings: {
      language: {
        label: '語言',
        desc: '聊天訊息和講義的語言。',
      },
      command: {
        label: '命令',
        desc: '聊天指令，不帶「！」。 1.0 版宏使用集中。',
      },
      statusmarker: {
        label: '狀態標記',
        desc: '顯示濃度的標記標記。可以使用自訂令牌標記。',
      },
      bar: {
        label: '血量條',
        desc: '保存生命值的令牌欄。對它造成傷害需要集中豁免。',
      },
      send_reminder_to: {
        label: '發送提醒至',
        desc: '誰看到集中訊息並保存：每個人、GM 或角色的玩家（GM 獲得副本）。',
      },
      auto_add_concentration_marker: {
        label: '自動添加Con。標記',
        desc: '當從紙上施放集中咒語時添加標記。',
        hint: 'D&D 5e 2014 (OGL) 和 2024 張。',
      },
      auto_roll_save: {
        label: '自動卷保存',
        desc: '一旦集中標記受到傷害，就立即進行豁免。關閉時，提醒具有滾動和優勢按鈕。',
      },
      show_roll_button: {
        label: '捲動按鈕',
        desc: '當自動滾動儲存關閉時，將滾動和優勢按鈕新增至提醒。',
      },
      end_at_zero: {
        label: '以 0 HP 結束',
        desc: '當標記的生命值降至 0 時，無需儲存即可結束集中。',
      },
      bonus_attribute: {
        label: '加成屬性',
        desc: '新增到集中保存的工作表屬性。 titution_save_mod 適用於 D&D 5e 2014 和 2024 圖紙。',
      },
      debug: {
        label: '偵錯模式',
        desc: '編寫有關拼字偵測的註解並儲存到 API 控制台，以用於支援請求。',
      },
      support_mode: {
        label: '支持方式',
        desc: '調試模式寫入多少：基本（簡短）或詳細。',
      },
    },
    help: {
      menu: '未選擇任何內容 (GM)：開啟設定。選擇標記後：開始或結束集中。',
      toggle: '開始用選定的標記專注於咒語。命名一個不同的咒語來切換；再次運行即可結束。',
      end: '選定代幣的結束集中度。',
      status: '使用「結束」按鈕列出正在集中註意力的人員。',
      config: '更改設置，例如 config auto_roll_save|false。',
      advantageMenu: '選擇哪些角色滾動集中可以節省優勢。',
      toggleAdvantage: '打開或關閉一個角色的優勢。',
      roll: '透過提醒的“滾動”或“優勢”按鈕滾動儲存。',
      journal: '重建幫助和命令平台講義。',
      reset: '將每個設定恢復為預設值。',
      help: '顯示此清單。',
      footer: '完整說明位於「{help}」講義中；按鈕位於「{deck}」講義中。',
      playerFooter: '首先選擇您的令牌。',
    },
    errors: {
      noSelection: '首先選擇一個令牌。',
      notYours: '您只能更改您控制的代幣的濃度。',
      gmOnly: '只有 GM 可以使用該指令。',
      notConcentrating: '那個令牌不集中。',
      unknownSetting: '沒有名為「{key}」的設定。',
      badSettingValue: '“{value}”對於 {key} 不是有效值。',
      rollExpired: '該按鈕已過期。',
      unknownCharacter: '那個角色已經不存在了。',
      internal: '出了點問題。 API 控制台有詳細資訊。',
    },
    hints: {
      noSelection: '選擇施法者的令牌，然後再次執行指令。',
      rollExpired: '按鈕工作一次，持續 10 分鐘。再次損壞令牌以取得新令牌。',
      unknownSetting: '在未選擇任何內容的情況下鍵入命令以查看設定。',
    },
    warnings: {
      unknownMarker: '狀態標記「{marker}」不是該遊戲的標記之一。在設定中選擇另一個。',
    },
    deck: {
      subtitle: '指揮台',
      selected: '選定的代幣',
      selectedDesc: '首先選擇施法者的令牌。',
      table: '桌子',
      tableDesc: '看看誰的注意力集中，誰的撲救具有優勢。',
      tools: '工具',
      toolsDesc: '設定、指令清單和講義。',
      footer: '完整說明位於「{help}」講義。',
    },
    handout: {
      versionLabel: '版本',
      subtitle: 'D&D 5e 的集中標記、提醒與保存',
      overview: {
        heading: '概述',
        body: '專注力可以追蹤誰正在專注於哪個咒語。它在施法者的標記上放置一個標記，當該標記受到傷害時進行（或要求）憲法豁免，並在集中結束時告訴桌子。',
      },
      quickStart: {
        heading: '快速啟動',
        steps: [
          '選擇施法者的標記並輸入 !concentration 後面跟著咒語，例如 !concentration Bless。',
          '更改令牌在其氣泡條中的生命值。豁免以 DC 10 進行擲骰，如果傷害更高，則傷害減半。',
          '再次執行相同的命令，或取下標記，以結束集中。',
          '鍵入 !concentration，不選擇任何內容來開啟設定。',
        ],
      },
      concentrating: {
        heading: '集中精力',
        points: [
          '命名不同的法術會切換到它的注意力，就像施展新的專注法術一樣。',
          '用手將標記放在標記上即可開始集中註意力，無需咒語；把它取下來，或者刪除令牌，就結束了。',
          '集中角色的新連結令牌獲取標記，並且追蹤攜帶該標記的貼上令牌。',
          '具有連結生命值欄的一個角色的標記會共享集中度。未連結的令牌，例如一張紙上的一群妖精，專注於自己的令牌。',
          '當注意力開始、切換或結束時，每個人都會看到一則訊息，除非「發送提醒至」另有說明。',
        ],
      },
      saves: {
        heading: '集中精力保存',
        points: [
          'DC 為所受傷害的 10 或一半，以較高者為準，最高可達 DC 30。',
          '修正值來自角色表上的加成屬性；缺失值計為 0。',
          '自動滾動 立即儲存滾動。當它關閉時，提醒會為玩家或 GM 提供滾動和優勢按鈕。',
          '保存失敗會結束專注。當生命值為 0 時結束時，生命值降至 0 時將結束且無需保存。',
          '優勢選單在自動儲存時提供角色優勢，就像戰爭施法者專長一樣。',
        ],
      },
      automatic: {
        heading: '從一張紙上施放的咒語',
        points: [
          '具有自動添加功能。打開標記，從 D&D 5e 2014 (OGL) 或 2024 表中施放集中咒語會添加標記。',
          '施法者正在查看的頁面上的令牌被標記；如果沒有，則任何頁面上的令牌都是。',
          '只有來自 GM、其他 Mod 或角色玩家之一的牌才算在內。再次施放相同的咒語不會改變任何事情。',
          '僅在文字中提到專注的《D&D 2024》卡牌（例如戰爭施法者專長）可以啟動專注，但永遠不會取代咒語。',
          'D&D 2024 工作表可能需要實驗 API 伺服器。打開調試模式以查看檢測到或未檢測到咒語的原因。',
        ],
      },
      players: {
        heading: '玩家',
        points: [
          '玩家可以開始和結束他們控制的令牌的集中度，並在自己的保存中使用「滾動」和「優勢」按鈕。',
          '將「發送提醒」設定為「角色」後，訊息會悄悄傳送給角色的玩家和 GM。',
        ],
      },
      commands: {
        heading: '命令',
        intro: '其他 Mod，例如 ScriptCard，也可以發送這些命令。',
        colCommand: '命令',
        colDesc: '它的作用',
      },
      settings: {
        heading: '設定',
        intro: '使用設定卡中的按鈕或使用配置 <鍵>|<值> 變更設定。有些也可以在 Mod 頁面上設定。',
        colKey: '鑰匙',
        colName: '姓名',
        colDesc: '它的作用',
      },
      upgrading: {
        heading: '從1.0版本升級',
        points: [
          '設定、優勢列表和每個命令都保持有效。',
          '現在，訊息會顯示專注何時結束以及哪個咒語結束。',
          '啟動時會拾取已帶有標記的令牌。',
        ],
      },
      troubleshooting: {
        heading: '故障排除',
        points: [
          '生命值下降時不儲存：檢查令牌是否有標記，HP條是否是您更改的條。其他 Mod 透過 API 所做的變更不會引發事件，因此不會被看到。',
          '修正值為 0：對照角色表檢查獎勵屬性。',
          '未偵測到從工作表施放的咒語：開啟偵錯模式，再次施放咒語並讀取 API 控制台。',
          '兩個字元共享一個名稱：檢測使用第一個匹配項。給角色取獨特的名字。',
        ],
      },
      languages: {
        heading: '語言',
        body: '《濃度》被翻譯成以下語言。透過語言設定選擇一種。',
        colCode: '程式碼',
        colName: '語言',
        colNative: '原生名',
      },
      credits: {
        heading: '製作人員',
        original: '原始模組由',
        maintainer: '維護者',
        support: '在 Roll20 Mod 論壇或 GitHub 上報告錯誤和想法。',
      },
      footer: '每個操作的按鈕都在「{deck}」講義中。',
    },
  };

  const TRANSLATION$k = {
    titles: {
      ready: 'Soustředění je připraveno.',
      menu: 'Nastavení koncentrace',
      help: 'Příkazy koncentrace',
      status: 'Kdo se soustředí',
      advantage: 'Výhoda v oblasti úspory koncentrace',
      reset: 'Resetovat koncentraci',
      concentration: 'Koncentrace',
      save: 'Koncentrace Uložit',
      check: 'Kontrola koncentrace',
    },
    messages: {
      migrated:
        'Upgradováno z verze 1.0. Vaše nastavení a seznam výhod byly zachovány a vaše stará makra stále fungují.',
      reconciled:
        'Dohozeno s mapou: nalezeny koncentrační tokeny {added}, staré záznamy odstraněny {dropped}.',
      readyHint: 'Zadejte {command} pro nastavení nebo otevřete leták Command Deck.',
      settingChanged: '{setting} je nyní {value}.',
      confirmReset:
        'Vrátit všechna nastavení zpět na výchozí hodnoty a vymazat seznam výhod? Značky koncentrace na mapě zůstávají.',
      reset: 'Nastavení se vrátí na výchozí hodnoty.',
      journal: 'Přepracované podklady: {help} a {deck}.',
    },
    notices: {
      started: '{name} se nyní soustředí na {spell}.',
      startedNoSpell: '{name} se nyní soustředí.',
      switched: '{name} se přestane soustředit na {old} a nyní se soustředí na {spell}.',
      switchedNoSpell: '{name} se nyní soustředí.',
      ended: '{name} se již nesoustředí na {spell}.',
      endedNoSpell: '{name} se již nesoustředí.',
      lost: '{name} ztrácí koncentraci na {spell}.',
      lostNoSpell: '{name} ztrácí koncentraci.',
      kept: '{name} se stále soustředí na {spell}.',
      keptNoSpell: '{name} se stále soustředí.',
      zeroHp: '{name} klesne na 0 životů a ztratí koncentraci na {spell}.',
      zeroHpNoSpell: '{name} klesá na 0 životů a ztrácí koncentraci.',
      checkNeeded: '{name} musí provést záchranný hod Ústavy, aby se mohl dále soustředit: {dc}.',
    },
    save: {
      dc: 'DC',
      dcValue: 'DC {dc}',
      modifier: 'Modifikátor',
      roll: 'Role',
      advantageRoll: '{first} a {second} (výhoda)',
      success: 'Úspěch',
      failure: 'Selhání',
    },
    menu: {
      concentratingCount: 'Právě se soustředím: {count}',
      settings: 'Nastavení',
      footer:
        'Chcete-li se sem vrátit, zadejte {command}. Každé tlačítko je také v letáku „{deck}“.',
    },
    status: {
      none: 'Nikdo se nesoustředí.',
    },
    advantage: {
      intro:
        'Postavám nastaveným na On roll se jejich koncentrace s výhodou šetří, jako u featu War Caster. To platí pro automatické ukládání.',
      none: 'V této hře nejsou žádné postavy.',
    },
    buttons: {
      roll: 'Role',
      advantage: 'Výhoda',
      status: 'Postavení',
      advantageMenu: 'Nabídka výhod',
      help: 'Pomoc',
      reset: 'Resetovat',
      confirmReset: 'Obnovit nastavení',
      end: 'Konec',
      menu: 'Menu',
      concentrate: 'Soustřeďte se na…',
      toggle: 'Přepnout',
      journal: 'Znovu sestavit podklady',
    },
    prompts: {
      spell: 'Kouzlo',
    },
    values: {
      on: 'Na',
      off: 'Vypnuto',
      bar: 'Bar {bar}',
      unnamed: 'Nejmenovaný',
      sendTo: {
        everyone: 'Každý',
        character: 'Charakter',
        gm: 'GM',
      },
      supportMode: {
        basic: 'Základní',
        detailed: 'Detailní',
      },
    },
    settings: {
      language: {
        label: 'Jazyk',
        desc: 'Jazyk chatových zpráv a letáků.',
      },
      command: {
        label: 'Příkaz',
        desc: 'Příkaz chatu bez "!". Makra verze 1.0 používají koncentraci.',
      },
      statusmarker: {
        label: 'Značka stavu',
        desc: 'Značka tokenu, která ukazuje koncentraci. Lze použít vlastní značky tokenů.',
      },
      bar: {
        label: 'HP Bar',
        desc: 'Token bar, který obsahuje životy. Poškození vyžaduje soustředění.',
      },
      send_reminder_to: {
        label: 'Odeslat připomenutí',
        desc: 'Kdo vidí zprávy o koncentraci a ukládá: všichni, GM nebo hráči postavy (GM dostane kopii).',
      },
      auto_add_concentration_marker: {
        label: 'Auto Add Con. Marker',
        desc: 'Přidejte značku, když je z listu sesláno kouzlo koncentrace.',
        hint: 'D&D 5e 2014 (OGL) a 2024 listů.',
      },
      auto_roll_save: {
        label: 'Auto Roll Save',
        desc: 'Hoďte záchranu, jakmile koncentrující se žeton utrpí poškození. Když je připomenutí vypnuto, má tlačítka Roll a Advantage.',
      },
      show_roll_button: {
        label: 'Tlačítko Roll',
        desc: 'Když je funkce Auto Roll Save vypnutá, přidejte k připomenutí tlačítka Roll a Advantage.',
      },
      end_at_zero: {
        label: 'Konec na 0 HP',
        desc: 'Ukončete koncentraci bez uložení, když žeton klesne na 0 životů.',
      },
      bonus_attribute: {
        label: 'Bonusový atribut',
        desc: 'Atribut listu přidaný k uložení koncentrace. constitution_save_mod funguje na listech D&D 5e 2014 a 2024.',
      },
      debug: {
        label: 'Režim ladění',
        desc: 'Pište poznámky o detekci pravopisu a ukládání do konzole API pro žádosti o podporu.',
      },
      support_mode: {
        label: 'Režim podpory',
        desc: 'Kolik režim ladění zapisuje: Základní (krátký) nebo Podrobný.',
      },
    },
    help: {
      menu: 'Není-li vybráno nic (GM): otevřete nastavení. S vybranými žetony: začátek nebo konec koncentrace.',
      toggle:
        'Začněte se soustředit na kouzlo s vybranými žetony. Pojmenujte jiné kouzlo, které chcete přepnout; run it again to end.',
      end: 'Konec koncentrace pro vybrané tokeny.',
      status: 'Seznamte, kdo se soustředí, pomocí tlačítek Konec.',
      config: 'Změňte nastavení, například config auto_roll_save|false.',
      advantageMenu: 'Vyberte si, které postavy při hodu šetří s výhodou.',
      toggleAdvantage: 'Zapněte nebo vypněte výhodu pro jednu postavu.',
      roll: 'Roll uložení pomocí tlačítka Roll nebo Advantage připomenutí.',
      journal: 'Znovu sestavte podklady pro balíček nápovědy a příkazů.',
      reset: 'Vraťte všechna nastavení zpět na výchozí hodnoty.',
      help: 'Zobrazit tento seznam.',
      footer: 'Úplné pokyny jsou v letáku „{help}“; tlačítka jsou v letáku „{deck}“.',
      playerFooter: 'Nejprve vyberte svůj token.',
    },
    errors: {
      noSelection: 'Nejprve vyberte token.',
      notYours: 'Koncentraci můžete měnit pouze u žetonů, které ovládáte.',
      gmOnly: 'Tento příkaz může použít pouze GM.',
      notConcentrating: 'Tento token se nesoustředí.',
      unknownSetting: 'Neexistuje žádné nastavení s názvem „{key}“.',
      badSettingValue: '„{value}“ není platná hodnota pro {key}.',
      rollExpired: 'Platnost tohoto tlačítka vypršela.',
      unknownCharacter: 'Ta postava už neexistuje.',
      internal: 'Něco se pokazilo. Konzole API má podrobnosti.',
    },
    hints: {
      noSelection: 'Vyberte token sesilatele a spusťte příkaz znovu.',
      rollExpired: 'Tlačítka fungují jednou a po dobu 10 minut. Poškoďte žeton znovu za nový.',
      unknownSetting: 'Chcete-li zobrazit nastavení, zadejte příkaz bez výběru.',
    },
    warnings: {
      unknownMarker:
        'Značka stavu „{marker}“ není jednou ze značek této hry. V nastavení vyberte jiný.',
    },
    deck: {
      subtitle: 'Velitelský balíček',
      selected: 'Vybrané tokeny',
      selectedDesc: 'Nejprve vyberte sesilatelův žeton.',
      table: 'Stůl',
      tableDesc: 'Podívejte se, kdo se soustředí a kdo má výhodu ve svých úsporách.',
      tools: 'Nástroje',
      toolsDesc: 'Nastavení, seznam příkazů a letáky.',
      footer: 'Úplné pokyny jsou v letáku „{help}“.',
    },
    handout: {
      versionLabel: 'Verze',
      subtitle: 'Značky koncentrace, upomínky a ukládání pro D&D 5e',
      overview: {
        heading: 'Přehled',
        body: 'Koncentrace sleduje, kdo se na které kouzlo soustředí. Umístí žeton na sesilatelův žeton, hodí (nebo požádá) o záchranu Ústavy, když žeton utrpí poškození, a oznámí stolu, když koncentrace skončí.',
      },
      quickStart: {
        heading: 'Rychlý start',
        steps: [
          'Vyberte sesilatelův žeton a napište !koncentrace následované kouzlem, například !koncentrace Bless.',
          'Změňte životy žetonu v jeho barové bublině. Záchrana je hozena na 10 DC nebo poloviční poškození, pokud je vyšší.',
          'Spusťte znovu stejný příkaz nebo sejměte značku, abyste ukončili koncentraci.',
          'Chcete-li otevřít nastavení, zadejte !concentration bez výběru.',
        ],
      },
      concentrating: {
        heading: 'Soustředění',
        points: [
          'Pojmenováním jiného kouzla se na něj přepne koncentrace, stejně jako seslání nového kouzla koncentrace.',
          'Ruční položení žetonu na žeton spustí koncentraci bez kouzla; jeho odebráním nebo smazáním tokenu končí.',
          'Nový propojený token soustředící se postavy získá značku a vložený token, který nese značku, je sledován.',
          'Žetony jedné postavy s propojenou lištou životů sdílejí koncentraci. Nepropojené žetony, jako je balíček goblinů z jednoho listu, se soustředí samy na sebe.',
          'Každý vidí zprávu, když koncentrace začíná, přepíná nebo končí, pokud Send Reminder To neříká jinak.',
        ],
      },
      saves: {
        heading: 'Koncentrace šetří',
        points: [
          'DC je 10 nebo polovina utrženého poškození, podle toho, co je vyšší, až do DC 30.',
          'Modifikátor pochází z bonusového atributu na listu postavy; chybějící hodnota se počítá jako 0.',
          'Auto Roll Uložte role najednou. Když je vypnutá, připomenutí má tlačítka Roll a Advantage pro hráče nebo GM.',
          'Neúspěšné uložení ukončí soustředění. Když je End na 0 HP zapnutý, pokles na 0 životů to ukončí bez uložení.',
          'Nabídka Advantage poskytuje postavě výhodu při automatickém ukládání, jako to dělá feat War Caster.',
        ],
      },
      automatic: {
        heading: 'Kouzla seslaná z listu',
        points: [
          'S Auto Add Con. Značka zapnuta, seslání koncentračního kouzla z listu D&D 5e 2014 (OGL) nebo 2024 přidá značku.',
          'Tokeny sesilatele na stránce, kterou si prohlížejí, jsou označeny; pokud žádné nejsou, tokeny na jakékoli stránce ano.',
          'Počítají se pouze karty od GM, jiného modu nebo jednoho z hráčů postavy. Opětovné seslání stejného kouzla nic nezmění.',
          'Karta D&D 2024, která ve svém textu zmiňuje pouze koncentraci, jako je například feat War Caster, může zahájit koncentraci, ale nikdy nenahradí kouzlo.',
          'Listy D&D 2024 mohou vyžadovat server Experimental API. Zapněte režim ladění, abyste viděli, proč kouzlo bylo nebo nebylo detekováno.',
        ],
      },
      players: {
        heading: 'Hráči',
        points: [
          'Hráči mohou začít a ukončit koncentraci pro žetony, které ovládají, a používat tlačítka Roll a Advantage na své vlastní ukládání.',
          'S Send Reminder Chcete-li nastavit na Character, zprávy jsou šeptány hráčům postavy a GM.',
        ],
      },
      commands: {
        heading: 'Příkazy',
        intro: 'Jiné mody, jako jsou ScriptCards, mohou také odesílat tyto příkazy.',
        colCommand: 'Příkaz',
        colDesc: 'Co to dělá',
      },
      settings: {
        heading: 'Nastavení',
        intro:
          'Změňte nastavení pomocí tlačítek na kartě nastavení nebo pomocí config <klíč>|<hodnota>. Některé lze také nastavit na stránce Modu.',
        colKey: 'Klíč',
        colName: 'Jméno',
        colDesc: 'Co to dělá',
      },
      upgrading: {
        heading: 'Upgrade z verze 1.0',
        points: [
          'Nastavení, seznam výhod a každý příkaz fungují dál.',
          'Zprávy nyní říkají, kdy koncentrace končí a na které kouzlo.',
          'Žetony, které již nesou značku, se vyzvednou při spuštění.',
        ],
      },
      troubleshooting: {
        heading: 'Odstraňování problémů',
        points: [
          'Žádné uložení při poklesu životů: zkontrolujte, že žeton má značku a že pruh HP je pruh, který jste změnili. Změny provedené jinými mody prostřednictvím API nevyvolávají události, takže nejsou vidět.',
          'Modifikátor je 0: zkontrolujte bonusový atribut proti listu postavy.',
          'Kouzla seslaná z listu nejsou detekována: zapněte režim ladění, sešlete kouzlo znovu a přečtěte si konzolu API.',
          'Dva znaky sdílejí jméno: detekce používá první shodu. Dejte postavám jedinečná jména.',
        ],
      },
      languages: {
        heading: 'Jazyky',
        body: 'Koncentrace je přeložena do níže uvedených jazyků. Vyberte jeden pomocí nastavení Jazyk.',
        colCode: 'Kód',
        colName: 'Jazyk',
        colNative: 'Rodné jméno',
      },
      credits: {
        heading: 'Kredity',
        original: 'Původní mod od',
        maintainer: 'Udržovaný',
        support: 'Nahlaste chyby a nápady na fóru Roll20 Mod nebo na GitHubu.',
      },
      footer: 'Tlačítka pro každou akci jsou v letáku „{deck}“.',
    },
  };

  const TRANSLATION$j = {
    titles: {
      ready: 'Koncentrationen er klar.',
      menu: 'Koncentrationsindstillinger',
      help: 'Koncentrationskommandoer',
      status: 'Hvem koncentrerer sig',
      advantage: 'Fordel ved koncentrationsbesparelser',
      reset: 'Nulstil koncentration',
      concentration: 'Koncentration',
      save: 'Koncentration Gem',
      check: 'Kontrol af koncentration',
    },
    messages: {
      migrated:
        'Opgraderet fra version 1.0. Dine indstillinger og fordelsliste blev bevaret, og dine gamle makroer fungerer stadig.',
      reconciled:
        'Indhentet kortet: Koncentrerende tokens fundet {added}, gamle poster fjernet {dropped}.',
      readyHint: 'Skriv {command} for indstillingerne, eller åbn Command Deck-uddelingskopien.',
      settingChanged: '{setting} er nu {value}.',
      confirmReset:
        'Vil du sætte alle indstillinger tilbage til deres standard og rydde fordelslisten? Koncentrationsmarkører på kortet bliver.',
      reset: 'Indstillinger sættes tilbage til deres standardindstillinger.',
      journal: 'Handouts genopbygget: {help} og {deck}.',
    },
    notices: {
      started: '{name} koncentrerer sig nu om {spell}.',
      startedNoSpell: '{name} koncentrerer sig nu.',
      switched:
        '{name} holder op med at koncentrere sig om {old} og koncentrerer sig nu om {spell}.',
      switchedNoSpell: '{name} koncentrerer sig nu.',
      ended: '{name} koncentrerer sig ikke længere om {spell}.',
      endedNoSpell: '{name} koncentrerer sig ikke længere.',
      lost: '{name} mister koncentrationen på {spell}.',
      lostNoSpell: '{name} mister koncentrationen.',
      kept: '{name} bliver ved med at koncentrere sig om {spell}.',
      keptNoSpell: '{name} bliver ved med at koncentrere sig.',
      zeroHp: '{name} falder til 0 hitpoint og mister koncentrationen på {spell}.',
      zeroHpNoSpell: '{name} falder til 0 hitpoint og mister koncentrationen.',
      checkNeeded:
        '{name} skal lave et Constitution-sparekast for at blive ved med at koncentrere sig: {dc}.',
    },
    save: {
      dc: 'DC',
      dcValue: 'DC {dc}',
      modifier: 'Modifikator',
      roll: 'Rulle',
      advantageRoll: '{first} og {second} (fordel)',
      success: 'Succes',
      failure: 'Fiasko',
    },
    menu: {
      concentratingCount: 'Koncentrerer sig nu: {count}',
      settings: 'Indstillinger',
      footer:
        'Skriv {command} for at komme tilbage hertil. Hver knap er også i "{deck}" uddelingsark.',
    },
    status: {
      none: 'Ingen koncentrerer sig.',
    },
    advantage: {
      intro:
        'Karakterer indstillet til On roll deres koncentrationsredninger med fordel, som med War Caster-bedriften. Dette gælder for automatiske gemmer.',
      none: 'Der er ingen karakterer i dette spil.',
    },
    buttons: {
      roll: 'Rulle',
      advantage: 'Fordel',
      status: 'Status',
      advantageMenu: 'Fordel menu',
      help: 'Hjælp',
      reset: 'Nulstil',
      confirmReset: 'Nulstil indstillinger',
      end: 'Ende',
      menu: 'Menu',
      concentrate: 'Koncentrer dig om…',
      toggle: 'Skift',
      journal: 'Genopbyg uddelingsark',
    },
    prompts: {
      spell: 'Fortryllelse',
    },
    values: {
      on: 'På',
      off: 'Slukket',
      bar: 'Søjle {bar}',
      unnamed: 'Unavngivet',
      sendTo: {
        everyone: 'Alle sammen',
        character: 'Karakter',
        gm: 'GM',
      },
      supportMode: {
        basic: 'Grundlæggende',
        detailed: 'Detaljeret',
      },
    },
    settings: {
      language: {
        label: 'Sprog',
        desc: 'Sproget i chatbeskeder og uddelingskopier.',
      },
      command: {
        label: 'Kommando',
        desc: 'Chatkommandoen uden "!". Version 1.0 makroer bruger koncentration.',
      },
      statusmarker: {
        label: 'Statusmarkør',
        desc: 'Token-markøren, der viser koncentration. Brugerdefinerede token-markører kan bruges.',
      },
      bar: {
        label: 'HP Bar',
        desc: 'Token-bjælken, der indeholder hitpoints. Skader på det kræver en koncentrationsbesparelse.',
      },
      send_reminder_to: {
        label: 'Send påmindelse til',
        desc: 'Hvem ser koncentrationsbeskeder og gemmer: alle, GM eller karakterens spillere (GM får en kopi).',
      },
      auto_add_concentration_marker: {
        label: 'Auto Add Con. Markør',
        desc: 'Tilføj markøren, når en koncentrationsbesværgelse er kastet fra et ark.',
        hint: 'D&D 5e 2014 (OGL) og 2024 ark.',
      },
      auto_roll_save: {
        label: 'Auto Roll Gem',
        desc: 'Rul saven, så snart et koncentrerende token tager skade. Når den er slukket, har påmindelsen Roll- og Advantage-knapper.',
      },
      show_roll_button: {
        label: 'Rulleknap',
        desc: 'Tilføj Roll og Advantage-knapper til påmindelsen, når Auto Roll Save er slået fra.',
      },
      end_at_zero: {
        label: 'Slut ved 0 HK',
        desc: 'Slut koncentrationen uden en redning, når en token falder til 0 hitpoint.',
      },
      bonus_attribute: {
        label: 'Bonus egenskab',
        desc: 'Arkattributten tilføjet til koncentration sparer. constitution_save_mod fungerer på D&D 5e 2014 og 2024 ark.',
      },
      debug: {
        label: 'Fejlretningstilstand',
        desc: 'Skriv noter om staveregistrering og lagring til API-konsollen for supportanmodninger.',
      },
      support_mode: {
        label: 'Supporttilstand',
        desc: 'Hvor meget Debug Mode skriver: Grundlæggende (kort) eller Detaljeret.',
      },
    },
    help: {
      menu: 'Med intet valgt (GM): Åbn indstillingerne. Med tokens valgt: start- eller slutkoncentration.',
      toggle:
        'Begynd at koncentrere dig om en besværgelse med de valgte tokens. Navngiv en anden besværgelse at skifte; køre det igen for at afslutte.',
      end: 'Slutkoncentration for de valgte tokens.',
      status: 'List, hvem der koncentrerer sig, med Afslut-knapper.',
      config: 'Skift en indstilling, for eksempel config auto_roll_save|false.',
      advantageMenu: 'Vælg med fordel, hvilke karakterer rullekoncentrationen sparer.',
      toggleAdvantage: 'Slå fordel til eller fra for én karakter.',
      roll: 'Rul en gem fra en påmindelses rulle eller fordel-knap.',
      journal: 'Genopbyg hjælpe- og kommandodækket-uddelingsarkene.',
      reset: 'Sæt alle indstillinger tilbage til deres standard.',
      help: 'Vis denne liste.',
      footer:
        'Fuldstændige instruktioner findes i "{help}" uddelingsark; knapperne er i "{deck}" uddelingsark.',
      playerFooter: 'Vælg dit token først.',
    },
    errors: {
      noSelection: 'Vælg først et token.',
      notYours: 'Du kan kun ændre koncentrationen for tokens, du kontrollerer.',
      gmOnly: 'Kun GM kan bruge denne kommando.',
      notConcentrating: 'Det token koncentrerer sig ikke.',
      unknownSetting: 'Der er ingen indstilling kaldet "{key}".',
      badSettingValue: '"{value}" er ikke en gyldig værdi for {key}.',
      rollExpired: 'Den knap er udløbet.',
      unknownCharacter: 'Den karakter eksisterer ikke længere.',
      internal: 'Noget gik galt. API-konsollen har detaljerne.',
    },
    hints: {
      noSelection: 'Vælg casterens token, og kør derefter kommandoen igen.',
      rollExpired: 'Knapper virker én gang og i 10 minutter. Beskadig tokenet igen for et nyt.',
      unknownSetting: 'Indtast kommandoen med intet valgt for at se indstillingerne.',
    },
    warnings: {
      unknownMarker:
        'Statusmarkøren "{marker}" er ikke en af ​​dette spils markører. Vælg en anden i indstillingerne.',
    },
    deck: {
      subtitle: 'Kommandodæk',
      selected: 'Udvalgte tokens',
      selectedDesc: 'Vælg casterens token først.',
      table: 'Bordet',
      tableDesc: 'Se, hvem der koncentrerer sig, og hvem der har fordel på deres redninger.',
      tools: 'Værktøjer',
      toolsDesc: 'Indstillinger, kommandolisten og uddelingskopierne.',
      footer: 'Fuldstændige instruktioner findes i "{help}" uddelingsark.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Koncentrationsmarkører, påmindelser og gemmer til D&D 5e',
      overview: {
        heading: 'Oversigt',
        body: 'Koncentration holder styr på, hvem der koncentrerer sig om hvilken besværgelse. Den sætter en markør på kasterens token, ruller (eller beder om) en Constitution save, når den token tager skade, og fortæller bordet, hvornår koncentrationen slutter.',
      },
      quickStart: {
        heading: 'Hurtig start',
        steps: [
          'Vælg casterens token og skriv !koncentration efterfulgt af besværgelsen, for eksempel !koncentration Bless.',
          'Skift tokens hitpunkter i dens stangboble. En save rulles ved DC 10, eller halvdelen af ​​skaden, hvis den er højere.',
          'Kør den samme kommando igen, eller tag markøren af ​​for at afslutte koncentrationen.',
          'Skriv !koncentration med intet valgt for at åbne indstillingerne.',
        ],
      },
      concentrating: {
        heading: 'Koncentrerer sig',
        points: [
          'Navngivning af en anden besværgelse ændrer koncentrationen til den, som en ny koncentrationsbesværgelse gør.',
          'At sætte markøren på en token i hånden starter koncentrationen uden en besværgelse; at tage den af ​​eller slette tokenet, afslutter den.',
          'Et nyt linket token af ​​en koncentrerende karakter får markøren, og et indsat token, der bærer markøren, spores.',
          'Tokens af én karakter med en linket hit point bar deler koncentration. Ikke-forbundne tokens, såsom en pakke nisser fra ét ark, koncentrerer sig om deres egen.',
          'Alle ser en besked, når koncentrationen starter, skifter eller slutter, medmindre Send påmindelse til siger andet.',
        ],
      },
      saves: {
        heading: 'Koncentration sparer',
        points: [
          'DC er 10 eller halvdelen af ​​skaden, alt efter hvad der er størst, op til DC 30.',
          'Modifikatoren kommer fra bonusattributten på karakterens ark; en manglende værdi tæller som 0.',
          'Auto Roll Gem ruller på én gang. Når den er slukket, har påmindelsen Roll- og Advantage-knapper til afspilleren eller GM.',
          'En mislykket redning stopper koncentrationen. Med End på 0 HP tændt, vil faldet til 0 hitpoint afsluttes uden en redning.',
          'Advantage-menuen giver en karakterfordel ved automatiske lagringer, som War Caster-bedriften gør.',
        ],
      },
      automatic: {
        heading: 'Besværgelser afgivet fra et ark',
        points: [
          'Med Auto Add Con. Markør på, kaster en koncentrationsbesværgelse fra et D&D 5e 2014 (OGL) eller 2024 ark tilføjer markøren.',
          'Casterens tokens på den side, de ser, er markeret; hvis der ikke er nogen, er tokens på enhver side.',
          'Kun kort fra GM, en anden Mod eller en af ​​karakterens spillere tæller. At kaste den samme besværgelse igen ændrer intet.',
          'Et D&D 2024-kort, der kun nævner koncentration i sin tekst, såsom War Caster-bedriften, kan starte koncentration, men erstatter aldrig en besværgelse.',
          'D&D 2024-ark skal muligvis bruge Experimental API-serveren. Slå fejlretningstilstand til for at se, hvorfor en besværgelse blev eller ikke blev opdaget.',
        ],
      },
      players: {
        heading: 'Spillere',
        points: [
          'Spillere kan starte og afslutte koncentrationen for tokens, de kontrollerer, og bruge Roll- og Advantage-knapperne på deres egne gemmer.',
          'Med Send Reminder For at indstille til Character, hviskes beskeder til karakterens spillere og til GM.',
        ],
      },
      commands: {
        heading: 'Kommandoer',
        intro: 'Andre Mods, såsom ScriptCards, kan også sende disse kommandoer.',
        colCommand: 'Kommando',
        colDesc: 'Hvad den gør',
      },
      settings: {
        heading: 'Indstillinger',
        intro:
          "Skift indstillinger med knapperne på indstillingskortet eller med config <key>|<value>. Nogle kan også indstilles på Mod's side.",
        colKey: 'Nøgle',
        colName: 'Navn',
        colDesc: 'Hvad den gør',
      },
      upgrading: {
        heading: 'Opgradering fra version 1.0',
        points: [
          'Indstillinger, fordelslisten og hver kommando fortsætter med at fungere.',
          'Beskeder siger nu, hvornår koncentrationen ophører, og på hvilken besværgelse.',
          'Poletter, der allerede bærer markøren, samles op ved opstart.',
        ],
      },
      troubleshooting: {
        heading: 'Fejlfinding',
        points: [
          "Ingen lagring, når hitpoint falder: Tjek, at tokenet har markøren, og at HP Bar er den bjælke, du har ændret. Ændringer foretaget af andre Mods gennem API'et rejser ikke begivenheder, så de bliver ikke set.",
          'Modifikatoren er 0: Tjek bonusattributten mod karakterens ark.',
          'Besværgelser, der kastes fra arket, registreres ikke: Aktiver Fejlretningstilstand, cast trylleformularen igen, og læs API-konsollen.',
          'To tegn deler et navn: Detektion bruger det første match. Giv karakterer unikke navne.',
        ],
      },
      languages: {
        heading: 'Sprog',
        body: 'Koncentration er oversat til sprogene nedenfor. Vælg en med sprogindstillingen.',
        colCode: 'Kode',
        colName: 'Sprog',
        colNative: 'Indfødt navn',
      },
      credits: {
        heading: 'Credits',
        original: 'Original Mod af',
        maintainer: 'Vedligeholdes af',
        support: 'Rapporter fejl og ideer på Roll20 Mod-forummet eller på GitHub.',
      },
      footer: 'Knapper for hver handling er i "{deck}" uddelingsark.',
    },
  };

  const TRANSLATION$i = {
    titles: {
      ready: 'Concentratie is klaar.',
      menu: 'Concentratie-instellingen',
      help: "Concentratie commando's",
      status: 'Wie concentreert zich',
      advantage: 'Voordeel op concentratiebesparing',
      reset: 'Concentratie opnieuw instellen',
      concentration: 'Concentratie',
      save: 'Concentratie Opslaan',
      check: 'Concentratiecontrole',
    },
    messages: {
      migrated:
        "Geüpgraded vanaf versie 1.0. Je instellingen en voordelenlijst zijn behouden en je oude macro's werken nog steeds.",
      reconciled:
        'Op de hoogte van de kaart: geconcentreerde tokens gevonden {added}, oude vermeldingen verwijderd {dropped}.',
      readyHint: 'Typ {command} voor de instellingen, of open de Command Deck-handout.',
      settingChanged: '{setting} is nu {value}.',
      confirmReset:
        'Elke instelling terugzetten naar de standaardwaarde en de voordelenlijst wissen? Concentratiemarkeringen op de kaart blijven staan.',
      reset: 'Instellingen teruggezet naar hun standaardwaarden.',
      journal: 'Hand-outs herbouwd: {help} en {deck}.',
    },
    notices: {
      started: '{name} concentreert zich nu op {spell}.',
      startedNoSpell: '{name} concentreert zich nu.',
      switched: '{name} concentreert zich niet meer op {old} en concentreert zich nu op {spell}.',
      switchedNoSpell: '{name} concentreert zich nu.',
      ended: '{name} concentreert zich niet langer op {spell}.',
      endedNoSpell: '{name} concentreert zich niet meer.',
      lost: '{name} verliest concentratie op {spell}.',
      lostNoSpell: '{name} verliest concentratie.',
      kept: '{name} blijft zich concentreren op {spell}.',
      keptNoSpell: '{name} blijft zich concentreren.',
      zeroHp: '{name} zakt naar 0 hitpoints en verliest de concentratie op {spell}.',
      zeroHpNoSpell: '{name} zakt naar 0 hitpoints en verliest zijn concentratie.',
      checkNeeded:
        '{name} moet een Constitution-besparende worp maken om zich te kunnen blijven concentreren: {dc}.',
    },
    save: {
      dc: 'gelijkstroom',
      dcValue: 'DC {dc}',
      modifier: 'Wijziger',
      roll: 'Rollen',
      advantageRoll: '{first} en {second} (voordeel)',
      success: 'Succes',
      failure: 'Mislukking',
    },
    menu: {
      concentratingCount: 'Nu concentreren: {count}',
      settings: 'Instellingen',
      footer:
        'Typ {command} om hier terug te komen. Elke knop staat ook in de uitreikblad "{deck}".',
    },
    status: {
      none: 'Niemand concentreert zich.',
    },
    advantage: {
      intro:
        'Personages die op On roll zijn ingesteld, besparen hun concentratie met voordeel, zoals bij de War Caster-prestatie. Dit geldt voor automatisch opslaan.',
      none: 'Er zijn geen personages in dit spel.',
    },
    buttons: {
      roll: 'Rollen',
      advantage: 'Voordeel',
      status: 'Status',
      advantageMenu: 'Voordeelmenu',
      help: 'Hulp',
      reset: 'Opnieuw instellen',
      confirmReset: 'Instellingen resetten',
      end: 'Einde',
      menu: 'Menu',
      concentrate: 'Concentreer je op…',
      toggle: 'Schakelaar',
      journal: 'Hand-outs opnieuw opbouwen',
    },
    prompts: {
      spell: 'Spellen',
    },
    values: {
      on: 'Op',
      off: 'Uit',
      bar: 'Staaf {bar}',
      unnamed: 'Naamloos',
      sendTo: {
        everyone: 'Iedereen',
        character: 'Karakter',
        gm: 'GM',
      },
      supportMode: {
        basic: 'Basis',
        detailed: 'Gedetailleerd',
      },
    },
    settings: {
      language: {
        label: 'Taal',
        desc: 'De taal van chatberichten en hand-outs.',
      },
      command: {
        label: 'Commando',
        desc: 'Het chatcommando, zonder de "!". Macro\'s van versie 1.0 gebruiken concentratie.',
      },
      statusmarker: {
        label: 'Statusmarkering',
        desc: 'De tokenmarker die concentratie aangeeft. Er kunnen aangepaste tokenmarkeringen worden gebruikt.',
      },
      bar: {
        label: 'HP-balk',
        desc: 'De tokenbalk die hitpoints bevat. Schade daaraan vereist concentratie.',
      },
      send_reminder_to: {
        label: 'Herinnering verzenden naar',
        desc: 'Wie concentratieberichten ziet en opslaat: iedereen, de GM of de spelers van het personage (de GM krijgt een kopie).',
      },
      auto_add_concentration_marker: {
        label: 'Automatisch toevoegen Con. Markering',
        desc: 'Voeg de markering toe wanneer een concentratiespreuk van een blad wordt uitgesproken.',
        hint: 'D&D 5e 2014 (OGL) en 2024-bladen.',
      },
      auto_roll_save: {
        label: 'Automatische rolbesparing',
        desc: 'Gooi de save zodra een concentrerend token schade oploopt. Als de herinnering is uitgeschakeld, heeft deze de knoppen Roll en Advantage.',
      },
      show_roll_button: {
        label: 'Rolknop',
        desc: 'Voeg de knoppen Roll en Advantage toe aan de herinnering wanneer Auto Roll Save is uitgeschakeld.',
      },
      end_at_zero: {
        label: 'Eindig bij 0 PK',
        desc: 'Eindconcentratie zonder opslaan wanneer een token naar 0 hitpoints zakt.',
      },
      bonus_attribute: {
        label: 'Bonuskenmerk',
        desc: 'Het bladattribuut toegevoegd aan concentratiebesparingen. constitution_save_mod werkt op D&D 5e 2014 en 2024-bladen.',
      },
      debug: {
        label: 'Foutopsporingsmodus',
        desc: 'Schrijf notities over spellingdetectie en opslag naar de API-console, voor ondersteuningsverzoeken.',
      },
      support_mode: {
        label: 'Ondersteuningsmodus',
        desc: 'Hoeveel Debug-modus schrijft: Basis (kort) of Gedetailleerd.',
      },
    },
    help: {
      menu: 'Met niets geselecteerd (GM): open de instellingen. Met geselecteerde tokens: start- of eindconcentratie.',
      toggle:
        'Begin je te concentreren op een spreuk met de geselecteerde tokens. Noem een ​​andere spreuk om te wisselen; voer het opnieuw uit om te eindigen.',
      end: 'Eindconcentratie voor de geselecteerde tokens.',
      status: 'Maak een lijst van wie zich concentreert, met de knoppen Einde.',
      config: 'Wijzig een instelling, bijvoorbeeld config auto_roll_save|false.',
      advantageMenu: 'Kies welke karakters concentratie besparen met voordeel.',
      toggleAdvantage: 'Schakel het voordeel voor één personage in of uit.',
      roll: 'Voer een save uit via de Roll- of Advantage-knop van een herinnering.',
      journal: 'Herbouw de Help- en Command Deck-hand-outs.',
      reset: 'Zet elke instelling terug naar de standaardwaarde.',
      help: 'Laat deze lijst zien.',
      footer:
        'Volledige instructies vindt u in de hand-out "{help}"; De knoppen staan ​​in de uitreikblad "{deck}".',
      playerFooter: 'Selecteer eerst uw token.',
    },
    errors: {
      noSelection: 'Selecteer eerst een token.',
      notYours: 'Je kunt alleen de concentratie veranderen voor tokens die je beheert.',
      gmOnly: 'Alleen de GM kan dat commando gebruiken.',
      notConcentrating: 'Dat teken concentreert zich niet.',
      unknownSetting: 'Er is geen instelling genaamd "{key}".',
      badSettingValue: '"{value}" is geen geldige waarde voor {key}.',
      rollExpired: 'Die knop is verlopen.',
      unknownCharacter: 'Dat karakter bestaat niet meer.',
      internal: 'Er is iets misgegaan. De API-console bevat de details.',
    },
    hints: {
      noSelection: 'Selecteer het token van de caster en voer de opdracht opnieuw uit.',
      rollExpired:
        'Knoppen werken eenmalig en gedurende 10 minuten. Beschadig het token opnieuw voor een nieuw exemplaar.',
      unknownSetting:
        'Typ de opdracht terwijl er niets is geselecteerd om de instellingen te bekijken.',
    },
    warnings: {
      unknownMarker:
        'De statusmarkering "{marker}" is niet een van de markeringen van dit spel. Kies een andere in de instellingen.',
    },
    deck: {
      subtitle: 'Commandodek',
      selected: 'Geselecteerde tokens',
      selectedDesc: 'Selecteer eerst het token van de caster.',
      table: 'De tafel',
      tableDesc: 'Kijk wie zich concentreert en wie voordeel heeft bij zijn reddingen.',
      tools: 'Hulpmiddelen',
      toolsDesc: 'Instellingen, de commandolijst en de hand-outs.',
      footer: 'Volledige instructies vindt u in de hand-out "{help}".',
    },
    handout: {
      versionLabel: 'Versie',
      subtitle: 'Concentratiemarkeringen, herinneringen en opslag voor D&D 5e',
      overview: {
        heading: 'Overzicht',
        body: 'Concentratie houdt bij wie zich op welke spreuk concentreert. Het plaatst een marker op het token van de caster, gooit (of vraagt ​​om) een Constitution Save wanneer dat token schade oploopt, en vertelt de tafel wanneer de concentratie eindigt.',
      },
      quickStart: {
        heading: 'Snel beginnen',
        steps: [
          'Selecteer het token van de caster en typ !concentration gevolgd door de spreuk, bijvoorbeeld !concentration Bless.',
          'Verander de hitpoints van het token in de staafbel. Een save wordt gegooid bij DC 10, of de helft van de schade als die hoger is.',
          'Voer hetzelfde commando nogmaals uit, of verwijder de marker, om de concentratie te beëindigen.',
          'Typ !concentration terwijl er niets is geselecteerd om de instellingen te openen.',
        ],
      },
      concentrating: {
        heading: 'Concentreren',
        points: [
          'Het benoemen van een andere spreuk verandert de concentratie ernaar, zoals het uitspreken van een nieuwe concentratiespreuk dat doet.',
          'Door de marker met de hand op een fiche te plaatsen, wordt de concentratie zonder spreuk gestart; het verwijderen of verwijderen van het token beëindigt het.',
          'Een nieuw gekoppeld token van een concentrerend personage krijgt de marker, en een geplakt token dat de marker draagt, wordt gevolgd.',
          'Tokens van één personage met een gekoppelde hitpoint-balk delen de concentratie. Niet-gekoppelde tokens, zoals een pakket goblins van één vel, concentreren zich op hun eigen tokens.',
          'Iedereen ziet een bericht wanneer de concentratie begint, schakelt of eindigt, tenzij Send Reminder To anders zegt.',
        ],
      },
      saves: {
        heading: 'Concentratie bespaart',
        points: [
          'De DC is 10 of de helft van de opgelopen schade, afhankelijk van wat het hoogste is, tot DC 30.',
          'De modifier komt van het bonuskenmerk op het blad van het personage; een ontbrekende waarde telt als 0.',
          'Automatische rol Sla rollen in één keer op. Als de herinnering is uitgeschakeld, heeft de herinnering Roll- en Advantage-knoppen voor de speler of GM.',
          'Een mislukte redding maakt een einde aan de concentratie. Als Einde bij 0 HP is ingeschakeld, wordt het spel beëindigd zonder een save als je naar 0 hitpoints gaat.',
          'Het Advantage-menu geeft een karaktervoordeel bij automatisch opslaan, net als de War Caster-prestatie.',
        ],
      },
      automatic: {
        heading: 'Spreuken uit een laken',
        points: [
          'Met automatisch toevoegen Con. Markering ingeschakeld, door een concentratiespreuk uit een D&D 5e 2014 (OGL) of 2024-blad uit te spreken, wordt de markering toegevoegd.',
          'De tokens van de caster op de pagina die hij bekijkt, zijn gemarkeerd; als er geen zijn, zijn tokens op elke pagina dat wel.',
          'Alleen kaarten van de GM, een andere Mod of een van de spelers van het personage tellen. Het opnieuw uitspreken van dezelfde spreuk verandert niets.',
          'Een D&D 2024-kaart die alleen concentratie in de tekst vermeldt, zoals de War Caster-prestatie, kan de concentratie starten, maar vervangt nooit een spreuk.',
          'D&D 2024-bladen hebben mogelijk de Experimentele API-server nodig. Schakel de foutopsporingsmodus in om te zien waarom een ​​spreuk wel of niet is gedetecteerd.',
        ],
      },
      players: {
        heading: 'Spelers',
        points: [
          'Spelers kunnen de concentratie starten en beëindigen voor tokens die zij beheren, en de Roll- en Advantage-knoppen gebruiken bij hun eigen saves.',
          'Met Herinnering verzenden Als je het personage instelt, worden er berichten gefluisterd naar de spelers van het personage en naar de GM.',
        ],
      },
      commands: {
        heading: "Commando's",
        intro: 'Andere Mods, zoals ScriptCards, kunnen deze opdrachten ook verzenden.',
        colCommand: 'Commando',
        colDesc: 'Wat het doet',
      },
      settings: {
        heading: 'Instellingen',
        intro:
          'Wijzig instellingen met de knoppen op de instellingenkaart, of met config <key>|<value>. Sommige kunnen ook worden ingesteld op de Mod-pagina.',
        colKey: 'Sleutel',
        colName: 'Naam',
        colDesc: 'Wat het doet',
      },
      upgrading: {
        heading: 'Upgraden vanaf versie 1.0',
        points: [
          'Instellingen, de voordelenlijst en elke opdracht blijven werken.',
          'Berichten zeggen nu wanneer de concentratie eindigt, en op welke spreuk.',
          'Tokens die de marker al dragen, worden bij het opstarten opgehaald.',
        ],
      },
      troubleshooting: {
        heading: 'Problemen oplossen',
        points: [
          'Geen opslag als de hitpoints vallen: controleer of het token de markering heeft en dat HP Bar de balk is die je hebt gewijzigd. Wijzigingen die door andere Mods via de API zijn aangebracht, veroorzaken geen gebeurtenissen en worden dus niet gezien.',
          'De modifier is 0: controleer het bonuskenmerk op het blad van het personage.',
          'Spreuken uit het blad worden niet gedetecteerd: schakel de foutopsporingsmodus in, spreek de spreuk opnieuw uit en lees de API-console.',
          'Twee karakters delen een naam: detectie gebruikt de eerste match. Geef karakters unieke namen.',
        ],
      },
      languages: {
        heading: 'Talen',
        body: 'Concentratie wordt vertaald in de onderstaande talen. Kies er een met de taalinstelling.',
        colCode: 'Code',
        colName: 'Taal',
        colNative: 'Inheemse naam',
      },
      credits: {
        heading: 'Kredieten',
        original: 'Originele mod door',
        maintainer: 'Onderhouden door',
        support: 'Rapporteer bugs en ideeën op het Roll20 Mod-forum of op GitHub.',
      },
      footer: 'Knoppen voor elke actie staan ​​in de hand-out "{deck}".',
    },
  };

  const TRANSLATION$h = {
    titles: {
      ready: 'Concentration is ready.',
      menu: 'Concentration Settings',
      help: 'Concentration Commands',
      status: 'Who Is Concentrating',
      advantage: 'Advantage on Concentration Saves',
      reset: 'Reset Concentration',
      concentration: 'Concentration',
      save: 'Concentration Save',
      check: 'Concentration Check',
    },
    messages: {
      migrated:
        'Upgraded from version 1.0. Your settings and advantage list were kept, and your old macros still work.',
      reconciled:
        'Caught up with the map: concentrating tokens found {added}, old entries removed {dropped}.',
      readyHint: 'Type {command} for the settings, or open the Command Deck handout.',
      settingChanged: '{setting} is now {value}.',
      confirmReset:
        'Put every setting back to its default and clear the advantage list? Concentration markers on the map stay.',
      reset: 'Settings put back to their defaults.',
      journal: 'Handouts rebuilt: {help} and {deck}.',
    },
    notices: {
      started: '{name} is now concentrating on {spell}.',
      startedNoSpell: '{name} is now concentrating.',
      switched: '{name} stops concentrating on {old} and is now concentrating on {spell}.',
      switchedNoSpell: '{name} is now concentrating.',
      ended: '{name} is no longer concentrating on {spell}.',
      endedNoSpell: '{name} is no longer concentrating.',
      lost: '{name} loses concentration on {spell}.',
      lostNoSpell: '{name} loses concentration.',
      kept: '{name} keeps concentrating on {spell}.',
      keptNoSpell: '{name} keeps concentrating.',
      zeroHp: '{name} drops to 0 hit points and loses concentration on {spell}.',
      zeroHpNoSpell: '{name} drops to 0 hit points and loses concentration.',
      checkNeeded: '{name} must make a Constitution saving throw to keep concentrating: {dc}.',
    },
    save: {
      dc: 'DC',
      dcValue: 'DC {dc}',
      modifier: 'Modifier',
      roll: 'Roll',
      advantageRoll: '{first} and {second} (advantage)',
      success: 'Success',
      failure: 'Failure',
    },
    menu: {
      concentratingCount: 'Concentrating now: {count}',
      settings: 'Settings',
      footer: 'Type {command} to come back here. Every button is also in the "{deck}" handout.',
    },
    status: {
      none: 'Nobody is concentrating.',
    },
    advantage: {
      intro:
        'Characters set to On roll their concentration saves with advantage, as with the War Caster feat. This applies to automatic saves.',
      none: 'There are no characters in this game.',
    },
    buttons: {
      roll: 'Roll',
      advantage: 'Advantage',
      status: 'Status',
      advantageMenu: 'Advantage Menu',
      help: 'Help',
      reset: 'Reset',
      confirmReset: 'Reset Settings',
      end: 'End',
      menu: 'Menu',
      concentrate: 'Concentrate on…',
      toggle: 'Toggle',
      journal: 'Rebuild Handouts',
    },
    prompts: {
      spell: 'Spell',
    },
    values: {
      on: 'On',
      off: 'Off',
      bar: 'Bar {bar}',
      unnamed: 'Unnamed',
      sendTo: {
        everyone: 'Everyone',
        character: 'Character',
        gm: 'GM',
      },
      supportMode: {
        basic: 'Basic',
        detailed: 'Detailed',
      },
    },
    settings: {
      language: {
        label: 'Language',
        desc: 'The language of chat messages and handouts.',
      },
      command: {
        label: 'Command',
        desc: 'The chat command, without the "!". Version 1.0 macros use concentration.',
      },
      statusmarker: {
        label: 'Status Marker',
        desc: 'The token marker that shows concentration. Custom token markers can be used.',
      },
      bar: {
        label: 'HP Bar',
        desc: 'The token bar that holds hit points. Damage to it calls for a concentration save.',
      },
      send_reminder_to: {
        label: 'Send Reminder To',
        desc: 'Who sees concentration messages and saves: everyone, the GM, or the character’s players (the GM gets a copy).',
      },
      auto_add_concentration_marker: {
        label: 'Auto Add Con. Marker',
        desc: 'Add the marker when a concentration spell is cast from a sheet.',
        hint: 'D&D 5e 2014 (OGL) and 2024 sheets.',
      },
      auto_roll_save: {
        label: 'Auto Roll Save',
        desc: 'Roll the save as soon as a concentrating token takes damage. When off, the reminder has Roll and Advantage buttons.',
      },
      show_roll_button: {
        label: 'Roll Button',
        desc: 'Add Roll and Advantage buttons to the reminder when Auto Roll Save is off.',
      },
      end_at_zero: {
        label: 'End at 0 HP',
        desc: 'End concentration without a save when a token drops to 0 hit points.',
      },
      bonus_attribute: {
        label: 'Bonus Attribute',
        desc: 'The sheet attribute added to concentration saves. constitution_save_mod works on D&D 5e 2014 and 2024 sheets.',
      },
      debug: {
        label: 'Debug Mode',
        desc: 'Write notes about spell detection and saves to the API console, for support requests.',
      },
      support_mode: {
        label: 'Support Mode',
        desc: 'How much Debug Mode writes: Basic (short) or Detailed.',
      },
    },
    help: {
      menu: 'With nothing selected (GM): open the settings. With tokens selected: start or end concentration.',
      toggle:
        'Start concentrating on a spell with the selected tokens. Name a different spell to switch; run it again to end.',
      end: 'End concentration for the selected tokens.',
      status: 'List who is concentrating, with End buttons.',
      config: 'Change a setting, for example config auto_roll_save|false.',
      advantageMenu: 'Choose which characters roll concentration saves with advantage.',
      toggleAdvantage: 'Switch advantage on or off for one character.',
      roll: 'Roll a save from a reminder’s Roll or Advantage button.',
      journal: 'Rebuild the Help and Command Deck handouts.',
      reset: 'Put every setting back to its default.',
      help: 'Show this list.',
      footer: 'Full instructions are in the "{help}" handout; buttons are in the "{deck}" handout.',
      playerFooter: 'Select your token first.',
    },
    errors: {
      noSelection: 'Select a token first.',
      notYours: 'You can only change concentration for tokens you control.',
      gmOnly: 'Only the GM can use that command.',
      notConcentrating: 'That token is not concentrating.',
      unknownSetting: 'There is no setting called "{key}".',
      badSettingValue: '"{value}" is not a valid value for {key}.',
      rollExpired: 'That button has expired.',
      unknownCharacter: 'That character no longer exists.',
      internal: 'Something went wrong. The API console has the details.',
    },
    hints: {
      noSelection: 'Select the caster’s token, then run the command again.',
      rollExpired: 'Buttons work once and for 10 minutes. Damage the token again for a new one.',
      unknownSetting: 'Type the command with nothing selected to see the settings.',
    },
    warnings: {
      unknownMarker:
        'The status marker "{marker}" is not one of this game’s markers. Choose another in the settings.',
    },
    deck: {
      subtitle: 'Command Deck',
      selected: 'Selected Tokens',
      selectedDesc: 'Select the caster’s token first.',
      table: 'The Table',
      tableDesc: 'See who is concentrating, and who has advantage on their saves.',
      tools: 'Tools',
      toolsDesc: 'Settings, the command list and the handouts.',
      footer: 'Full instructions are in the "{help}" handout.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Concentration markers, reminders and saves for D&D 5e',
      overview: {
        heading: 'Overview',
        body: 'Concentration keeps track of who is concentrating on which spell. It puts a marker on the caster’s token, rolls (or asks for) a Constitution save when that token takes damage, and tells the table when concentration ends.',
      },
      quickStart: {
        heading: 'Quick start',
        steps: [
          'Select the caster’s token and type !concentration followed by the spell, for example !concentration Bless.',
          'Change the token’s hit points in its bar bubble. A save is rolled at DC 10, or half the damage if that is higher.',
          'Run the same command again, or take the marker off, to end concentration.',
          'Type !concentration with nothing selected to open the settings.',
        ],
      },
      concentrating: {
        heading: 'Concentrating',
        points: [
          'Naming a different spell switches concentration to it, as casting a new concentration spell does.',
          'Putting the marker on a token by hand starts concentration without a spell; taking it off, or deleting the token, ends it.',
          'A new linked token of a concentrating character gets the marker, and a pasted token that carries the marker is tracked.',
          'Tokens of one character with a linked hit point bar share concentration. Unlinked tokens, such as a pack of goblins from one sheet, concentrate on their own.',
          'Everyone sees a message when concentration starts, switches or ends, unless Send Reminder To says otherwise.',
        ],
      },
      saves: {
        heading: 'Concentration saves',
        points: [
          'The DC is 10 or half the damage taken, whichever is higher, up to DC 30.',
          'The modifier comes from the Bonus Attribute on the character’s sheet; a missing value counts as 0.',
          'Auto Roll Save rolls at once. When it is off, the reminder has Roll and Advantage buttons for the player or GM.',
          'A failed save ends concentration. With End at 0 HP on, dropping to 0 hit points ends it without a save.',
          'The Advantage Menu gives a character advantage on automatic saves, as the War Caster feat does.',
        ],
      },
      automatic: {
        heading: 'Spells cast from a sheet',
        points: [
          'With Auto Add Con. Marker on, casting a concentration spell from a D&D 5e 2014 (OGL) or 2024 sheet adds the marker.',
          'The caster’s tokens on the page they are viewing are marked; if there are none, tokens on any page are.',
          'Only cards from the GM, another Mod or one of the character’s players count. Casting the same spell again changes nothing.',
          'A D&D 2024 card that only mentions concentration in its text, such as the War Caster feat, can start concentration but never replaces a spell.',
          'D&D 2024 sheets may need the Experimental API server. Turn on Debug Mode to see why a spell was or was not detected.',
        ],
      },
      players: {
        heading: 'Players',
        points: [
          'Players can start and end concentration for tokens they control, and use Roll and Advantage buttons on their own saves.',
          'With Send Reminder To set to Character, messages are whispered to the character’s players and to the GM.',
        ],
      },
      commands: {
        heading: 'Commands',
        intro: 'Other Mods, such as ScriptCards, can send these commands too.',
        colCommand: 'Command',
        colDesc: 'What it does',
      },
      settings: {
        heading: 'Settings',
        intro:
          'Change settings with the buttons in the settings card, or with config <key>|<value>. Some can also be set on the Mod’s page.',
        colKey: 'Key',
        colName: 'Name',
        colDesc: 'What it does',
      },
      upgrading: {
        heading: 'Upgrading from version 1.0',
        points: [
          'Settings, the advantage list and every command keep working.',
          'Messages now say when concentration ends, and on which spell.',
          'Tokens that already carry the marker are picked up on startup.',
        ],
      },
      troubleshooting: {
        heading: 'Troubleshooting',
        points: [
          'No save when hit points drop: check that the token has the marker and that HP Bar is the bar you changed. Changes made by other Mods through the API do not raise events, so they are not seen.',
          'The modifier is 0: check the Bonus Attribute against the character’s sheet.',
          'Spells cast from the sheet are not detected: turn on Debug Mode, cast the spell again and read the API console.',
          'Two characters share a name: detection uses the first match. Give characters unique names.',
        ],
      },
      languages: {
        heading: 'Languages',
        body: 'Concentration is translated into the languages below. Choose one with the Language setting.',
        colCode: 'Code',
        colName: 'Language',
        colNative: 'Native name',
      },
      credits: {
        heading: 'Credits',
        original: 'Original Mod by',
        maintainer: 'Maintained by',
        support: 'Report bugs and ideas on the Roll20 Mod forum or on GitHub.',
      },
      footer: 'Buttons for every action are in the "{deck}" handout.',
    },
  };

  const TRANSLATION$g = {
    titles: {
      ready: 'Keskittyminen on valmis.',
      menu: 'Keskittymisasetukset',
      help: 'Keskittymiskomennot',
      status: 'Kuka keskittyy',
      advantage: 'Keskittymisen etu Säästää',
      reset: 'Palauta keskittyminen',
      concentration: 'Keskittyminen',
      save: 'Keskittyminen Tallenna',
      check: 'Pitoisuuden tarkistus',
    },
    messages: {
      migrated:
        'Päivitetty versiosta 1.0. Asetuksesi ja etuluettelosi säilytettiin, ja vanhat makrosi toimivat edelleen.',
      reconciled:
        'Kartan perässä: keskitettyjä tokeneja löydetty {added}, vanhat merkinnät poistettu {dropped}.',
      readyHint: 'Kirjoita asetukset {command} tai avaa Command Deck -moniste.',
      settingChanged: '{setting} on nyt {value}.',
      confirmReset:
        'Haluatko palauttaa kaikki asetukset oletusarvoihinsa ja tyhjentää etuluettelon? Keskittymismerkit kartalla pysyvät.',
      reset: 'Asetukset palautetaan oletusarvoihinsa.',
      journal: 'Uudelleen rakennetut monisteet: {help} ja {deck}.',
    },
    notices: {
      started: '{name} keskittyy nyt paikkaan {spell}.',
      startedNoSpell: '{name} keskittyy nyt.',
      switched: '{name} lakkaa keskittymästä kohtaan {old} ja keskittyy nyt kohtaan {spell}.',
      switchedNoSpell: '{name} keskittyy nyt.',
      ended: '{name} ei enää keskity kohtaan {spell}.',
      endedNoSpell: '{name} ei enää keskity.',
      lost: '{name} menettää keskittymiskykynsä kohtaan {spell}.',
      lostNoSpell: '{name} menettää keskittymiskykynsä.',
      kept: '{name} keskittyy edelleen paikkaan {spell}.',
      keptNoSpell: '{name} jatkaa keskittymistä.',
      zeroHp: '{name} putoaa 0 osumapisteeseen ja menettää keskittymiskykynsä {spell}.',
      zeroHpNoSpell: '{name} putoaa 0 osumapisteeseen ja menettää keskittymiskykynsä.',
      checkNeeded:
        '{name} täytyy tehdä perustuslakia säästävä heitto jatkaakseen keskittymistä: {dc}.',
    },
    save: {
      dc: 'DC',
      dcValue: 'DC {dc}',
      modifier: 'Muokkaus',
      roll: 'Rullaa',
      advantageRoll: '{first} ja {second} (etu)',
      success: 'Menestys',
      failure: 'Epäonnistuminen',
    },
    menu: {
      concentratingCount: 'Keskity nyt: {count}',
      settings: 'Asetukset',
      footer:
        'Kirjoita {command} palataksesi tänne. Jokainen painike on myös monisteessa "{deck}".',
    },
    status: {
      none: 'Kukaan ei keskity.',
    },
    advantage: {
      intro:
        'Päälle asetettujen hahmojen keskittyminen pelastaa hyödyllisesti, kuten War Caster -pelissä. Tämä koskee automaattista tallennusta.',
      none: 'Tässä pelissä ei ole hahmoja.',
    },
    buttons: {
      roll: 'Rullaa',
      advantage: 'Etu',
      status: 'Status',
      advantageMenu: 'Edut-valikko',
      help: 'Auttaa',
      reset: 'Nollaa',
      confirmReset: 'Palauta asetukset',
      end: 'Loppu',
      menu: 'Valikko',
      concentrate: 'Keskity…',
      toggle: 'Vaihda',
      journal: 'Rakenna monisteet uudelleen',
    },
    prompts: {
      spell: 'Spell',
    },
    values: {
      on: 'Päällä',
      off: 'Pois',
      bar: 'Palkki {bar}',
      unnamed: 'Nimetön',
      sendTo: {
        everyone: 'Kaikki',
        character: 'Merkki',
        gm: 'GM',
      },
      supportMode: {
        basic: 'Perus',
        detailed: 'Yksityiskohtainen',
      },
    },
    settings: {
      language: {
        label: 'Kieli',
        desc: 'Chat-viestien ja monisteen kieli.',
      },
      command: {
        label: 'Komento',
        desc: 'Chat-komento ilman "!". Version 1.0 makrot käyttävät keskittymistä.',
      },
      statusmarker: {
        label: 'Tilan merkki',
        desc: 'Merkkimerkki, joka osoittaa keskittymistä. Mukautettuja merkkimerkkejä voidaan käyttää.',
      },
      bar: {
        label: 'HP baari',
        desc: 'Tunnuspalkki, joka sisältää osumapisteitä. Sen vaurioituminen vaatii keskittymistä.',
      },
      send_reminder_to: {
        label: 'Lähetä muistutus osoitteeseen',
        desc: 'Kuka näkee keskittymisviestit ja säästää: kaikki, GM tai hahmon pelaajat (GM saa kopion).',
      },
      auto_add_concentration_marker: {
        label: 'Auto Add Con. Merkki',
        desc: 'Lisää merkki, kun keskitysloitsu heitetään arkilta.',
        hint: 'D&D 5e 2014 (OGL) ja 2024 arkit.',
      },
      auto_roll_save: {
        label: 'Automaattinen rullan tallennus',
        desc: 'Pyöritä säästöä heti, kun keskittymismerkki vahingoittuu. Kun muistutus on pois päältä, siinä on Roll- ja Advantage-painikkeet.',
      },
      show_roll_button: {
        label: 'Roll-painike',
        desc: 'Lisää rulla- ja etupainikkeet muistutukseen, kun automaattinen rullatallennus on pois päältä.',
      },
      end_at_zero: {
        label: 'Loppuun 0 HP',
        desc: 'Lopeta keskittyminen ilman pelastusta, kun merkki putoaa 0 osumapisteeseen.',
      },
      bonus_attribute: {
        label: 'Bonusominaisuus',
        desc: 'Keskittymiseen lisätty arkkiattribuutti säästää. constitution_save_mod toimii D&D 5e 2014 ja 2024 arkeilla.',
      },
      debug: {
        label: 'Virheenkorjaustila',
        desc: 'Kirjoita muistiinpanoja oikeinkirjoituksen havaitsemisesta ja tallennuksista API-konsoliin tukipyyntöjä varten.',
      },
      support_mode: {
        label: 'Tukitila',
        desc: 'Kuinka paljon Debug Mode kirjoittaa: Perus (lyhyt) tai Yksityiskohtainen.',
      },
    },
    help: {
      menu: 'Kun mitään ei ole valittu (GM): avaa asetukset. Kun merkit on valittu: aloita tai lopeta keskittyminen.',
      toggle:
        'Aloita keskittyminen loitsuun valituilla rahakkeilla. Nimeä toinen loitsu vaihtaaksesi; suorita se uudelleen loppuun.',
      end: 'Valittujen tokenien loppupitoisuus.',
      status: 'Listaa, kuka keskittyy, lopetuspainikkeilla.',
      config: 'Muuta asetusta, esimerkiksi config auto_roll_save|false.',
      advantageMenu: 'Valitse, mitkä hahmot rullaa keskittyminen säästää.',
      toggleAdvantage: 'Ota etu käyttöön tai poista se käytöstä yhdelle hahmolle.',
      roll: 'Rullaa tallenne muistutuksen Roll- tai Advantage-painikkeesta.',
      journal: 'Rakenna Ohje- ja komentokansion monisteet uudelleen.',
      reset: 'Palauta kaikki asetukset oletusarvoihinsa.',
      help: 'Näytä tämä luettelo.',
      footer: 'Täydelliset ohjeet ovat monisteessa "{help}". painikkeet ovat monisteessa "{deck}".',
      playerFooter: 'Valitse ensin tunnus.',
    },
    errors: {
      noSelection: 'Valitse ensin tunnus.',
      notYours: 'Voit muuttaa keskittymistä vain hallitsemillesi tokeneille.',
      gmOnly: 'Vain GM voi käyttää tätä komentoa.',
      notConcentrating: 'Se merkki ei keskitä.',
      unknownSetting: 'Ei ole asetusta nimeltä "{key}".',
      badSettingValue: '"{value}" ei ole kelvollinen arvo kohteelle {key}.',
      rollExpired: 'Painike on vanhentunut.',
      unknownCharacter: 'Sitä hahmoa ei ole enää olemassa.',
      internal: 'Jotain meni pieleen. API-konsolissa on tiedot.',
    },
    hints: {
      noSelection: 'Valitse pyörän tunnus ja suorita komento uudelleen.',
      rollExpired:
        'Painikkeet toimivat kerran ja 10 minuuttia. Vahvista merkki uudelleen uutta varten.',
      unknownSetting: 'Näet asetukset kirjoittamalla komento ilman mitään valittuna.',
    },
    warnings: {
      unknownMarker:
        'Tilamerkki "{marker}" ei ole yksi tämän pelin merkeistä. Valitse asetuksista toinen.',
    },
    deck: {
      subtitle: 'Command Deck',
      selected: 'Valitut tokenit',
      selectedDesc: 'Valitse ensin pyörän tunnus.',
      table: 'Taulukko',
      tableDesc: 'Katso kuka keskittyy ja kenellä on etua säästöissään.',
      tools: 'Työkalut',
      toolsDesc: 'Asetukset, komentoluettelo ja monisteet.',
      footer: 'Täydelliset ohjeet ovat monisteessa "{help}".',
    },
    handout: {
      versionLabel: 'Versio',
      subtitle: 'Keskittymismerkit, muistutukset ja säästöt D&D 5e:lle',
      overview: {
        heading: 'Yleiskatsaus',
        body: 'Keskittyminen pitää kirjaa siitä, kuka keskittyy mihinkin loitsuun. Se asettaa merkin heittäjän merkkiin, heittää (tai pyytää) perustuslain, paitsi jos se vahingoittaa, ja kertoo pöydälle, kun keskittyminen päättyy.',
      },
      quickStart: {
        heading: 'Pika aloitus',
        steps: [
          'Valitse pyörän tunnus ja kirjoita !concentration ja sen jälkeen loitsu, esimerkiksi !concentration Bless.',
          'Muuta tunnuksen osumapisteitä sen palkkikuplassa. Säästö heitetään DC 10:llä tai puolella vahingosta, jos se on suurempi.',
          'Suorita sama komento uudelleen tai poista merkintä lopettaaksesi keskittymisen.',
          'Avaa asetukset kirjoittamalla !concentration ilman mitään valittuna.',
        ],
      },
      concentrating: {
        heading: 'Keskittyminen',
        points: [
          'Toisen loitsun nimeäminen siirtää keskittymisen siihen, kuten uuden keskittymisloitsun heittäminen.',
          'Merkin laittaminen tokeniin käsin aloittaa keskittymisen ilman loitsua; sen poistaminen tai tunnuksen poistaminen lopettaa sen.',
          'Keskittyvän hahmon uusi linkitetty merkki saa merkin, ja liimattua merkkiä, joka kuljettaa merkkiä, seurataan.',
          'Yhden hahmon merkit, joihin on linkitetty osumapistepalkki, jakavat keskittymisen. Linkittämättömät rahakkeet, kuten yhdeltä arkilta sijoittuva peikkopaketti, keskittyvät omikseen.',
          'Kaikki näkevät viestin, kun keskittyminen alkaa, vaihtuu tai loppuu, ellei Lähetä muistutus toisin sano.',
        ],
      },
      saves: {
        heading: 'Keskittyminen säästää',
        points: [
          'DC on 10 tai puolet aiheutuneesta vahingosta, sen mukaan kumpi on suurempi, DC 30 asti.',
          'Muokkaus tulee hahmon arkin bonusmääritteestä; puuttuva arvo lasketaan 0:ksi.',
          'Auto Roll Save rolls at once. Kun se on pois päältä, muistutuksessa on Roll- ja Advantage-painikkeet soittimelle tai GM:lle.',
          'Epäonnistunut torjunta lopettaa keskittymisen. Kun End at 0 HP on päällä, osumapisteen pudottaminen 0:aan lopettaa sen ilman tallentamista.',
          'Advantage Menu tarjoaa hahmoetua automaattisissa tallennuksissa, kuten War Caster feat tekee.',
        ],
      },
      automatic: {
        heading: 'Loitsuja levyltä',
        points: [
          'Auto Add Con. Merkki päälle, keskittymisloitsu D&D 5e 2014 (OGL) tai 2024 arkista lisää merkin.',
          'Pyörien tunnukset sivulla, jota he katselevat, on merkitty; jos niitä ei ole, millä tahansa sivulla olevat merkit ovat.',
          'Vain GM:n, toisen modin tai jonkun hahmon pelaajien kortit lasketaan. Saman loitsun toistaminen ei muuta mitään.',
          'D&D 2024 -kortti, joka mainitsee vain keskittymisen tekstissään, kuten War Caster feat, voi aloittaa keskittymisen, mutta ei koskaan korvaa loitsua.',
          'D&D 2024 -arkit saattavat tarvita Experimental API -palvelimen. Ota virheenkorjaustila käyttöön nähdäksesi, miksi oikeinkirjoitus havaittiin tai ei.',
        ],
      },
      players: {
        heading: 'Pelaajat',
        points: [
          'Pelaajat voivat aloittaa ja lopettaa keskittymisen hallitsemiinsa tokeneihin ja käyttää Roll- ja Advantage-painikkeita omissa tallennuksissaan.',
          'Kun lähetä muistutus Jos haluat asettaa hahmon, viestit kuiskataan hahmon pelaajille ja GM:lle.',
        ],
      },
      commands: {
        heading: 'komennot',
        intro: 'Muut modit, kuten ScriptCards, voivat myös lähettää näitä komentoja.',
        colCommand: 'Komento',
        colDesc: 'Mitä se tekee',
      },
      settings: {
        heading: 'Asetukset',
        intro:
          'Muuta asetuksia asetuskortin painikkeilla tai konfiguraatiolla <key>|<arvo>. Jotkut voidaan asettaa myös Modin sivulla.',
        colKey: 'Avain',
        colName: 'Nimi',
        colDesc: 'Mitä se tekee',
      },
      upgrading: {
        heading: 'Päivitys versiosta 1.0',
        points: [
          'Asetukset, etuluettelo ja kaikki komennot toimivat edelleen.',
          'Viestit kertovat nyt, milloin keskittyminen loppuu ja mihin loitsuun.',
          'Tokenit, joissa on jo merkki, noudetaan käynnistyksen yhteydessä.',
        ],
      },
      troubleshooting: {
        heading: 'Vianetsintä',
        points: [
          'Ei tallennusta, kun osumapisteet putoavat: tarkista, että tunnuksessa on merkintä ja että HP Bar on se palkki, jonka muutit. Muiden modien API:n kautta tekemät muutokset eivät aiheuta tapahtumia, joten niitä ei näytetä.',
          'Muutos on 0: tarkista bonusominaisuus hahmon arkkia vastaan.',
          'Arkista lähetettyjä loitsuja ei havaita: ota virheenkorjaustila käyttöön, loitsu uudelleen ja lue API-konsoli.',
          'Kahdella hahmolla on yhteinen nimi: tunnistus käyttää ensimmäistä vastaavuutta. Anna hahmoille yksilölliset nimet.',
        ],
      },
      languages: {
        heading: 'Kielet',
        body: 'Keskittyminen on käännetty alla oleville kielille. Valitse yksi Kieli-asetuksista.',
        colCode: 'Koodi',
        colName: 'Kieli',
        colNative: 'Alkuperäinen nimi',
      },
      credits: {
        heading: 'Krediitit',
        original: 'Alkuperäinen mod',
        maintainer: 'Ylläpitäjä',
        support: 'Ilmoita virheistä ja ideoista Roll20 Mod -foorumilla tai GitHubissa.',
      },
      footer: 'Jokaisen toiminnon painikkeet ovat monisteessa "{deck}".',
    },
  };

  const TRANSLATION$f = {
    titles: {
      ready: 'La concentration est prête.',
      menu: 'Paramètres de concentration',
      help: 'Commandes de concentration',
      status: 'Qui se concentre',
      advantage: 'Avantage sur les économies de concentration',
      reset: 'Réinitialiser la concentration',
      concentration: 'Concentration',
      save: 'Économie de concentration',
      check: 'Vérification des concentrations',
    },
    messages: {
      migrated:
        "Mis à jour à partir de la version 1.0. Vos paramètres et votre liste d'avantages ont été conservés et vos anciennes macros fonctionnent toujours.",
      reconciled:
        'Rattrapé par la carte : jetons de concentration trouvés {added}, anciennes entrées supprimées {dropped}.',
      readyHint: 'Tapez {command} pour les paramètres ou ouvrez le document Command Deck.',
      settingChanged: '{setting} est désormais {value}.',
      confirmReset:
        'Remettre chaque paramètre à sa valeur par défaut et effacer la liste des avantages ? Les marqueurs de concentration restent sur la carte.',
      reset: 'Paramètres remis à leurs valeurs par défaut.',
      journal: 'Documents reconstruits : {help} et {deck}.',
    },
    notices: {
      started: '{name} se concentre désormais sur {spell}.',
      startedNoSpell: '{name} se concentre maintenant.',
      switched: '{name} cesse de se concentrer sur {old} et se concentre désormais sur {spell}.',
      switchedNoSpell: '{name} se concentre maintenant.',
      ended: '{name} ne se concentre plus sur {spell}.',
      endedNoSpell: '{name} ne se concentre plus.',
      lost: '{name} perd sa concentration sur {spell}.',
      lostNoSpell: '{name} perd sa concentration.',
      kept: '{name} continue de se concentrer sur {spell}.',
      keptNoSpell: '{name} continue de se concentrer.',
      zeroHp: '{name} tombe à 0 point de vie et perd sa concentration sur {spell}.',
      zeroHpNoSpell: '{name} tombe à 0 point de vie et perd sa concentration.',
      checkNeeded:
        '{name} doit réussir un jet de sauvegarde de Constitution pour continuer à se concentrer : {dc}.',
    },
    save: {
      dc: 'CC',
      dcValue: 'DC {dc}',
      modifier: 'Modificateur',
      roll: 'Rouler',
      advantageRoll: '{first} et {second} (avantage)',
      success: 'Succès',
      failure: 'Échec',
    },
    menu: {
      concentratingCount: 'Je me concentre maintenant : {count}',
      settings: 'Paramètres',
      footer:
        'Tapez {command} pour revenir ici. Chaque bouton se trouve également dans le document « {deck} ».',
    },
    status: {
      none: "Personne n'est concentré.",
    },
    advantage: {
      intro:
        "Les personnages réglés sur On lancent leurs sauvegardes de concentration avec avantage, comme avec le don War Caster. Cela s'applique aux sauvegardes automatiques.",
      none: "Il n'y a aucun personnage dans ce jeu.",
    },
    buttons: {
      roll: 'Rouler',
      advantage: 'Avantage',
      status: 'Statut',
      advantageMenu: 'Menu Avantage',
      help: 'Aide',
      reset: 'Réinitialiser',
      confirmReset: 'Réinitialiser les paramètres',
      end: 'Fin',
      menu: 'Menu',
      concentrate: 'Concentrez-vous sur…',
      toggle: 'Basculer',
      journal: 'Reconstruire les documents',
    },
    prompts: {
      spell: 'Épeler',
    },
    values: {
      on: 'Sur',
      off: 'Désactivé',
      bar: 'Barre {bar}',
      unnamed: 'Anonyme',
      sendTo: {
        everyone: 'Tout le monde',
        character: 'Personnage',
        gm: 'Directeur général',
      },
      supportMode: {
        basic: 'Basique',
        detailed: 'Détaillé',
      },
    },
    settings: {
      language: {
        label: 'Langue',
        desc: 'La langue des messages de discussion et des documents.',
      },
      command: {
        label: 'Commande',
        desc: 'La commande de chat, sans le "!". Les macros de la version 1.0 utilisent la concentration.',
      },
      statusmarker: {
        label: "Marqueur d'état",
        desc: 'Le marqueur symbolique qui montre la concentration. Des marqueurs de jetons personnalisés peuvent être utilisés.',
      },
      bar: {
        label: 'Barre HP',
        desc: 'La barre de jetons qui contient les points de vie. Les dégâts qui lui sont causés nécessitent une sauvegarde de concentration.',
      },
      send_reminder_to: {
        label: 'Envoyer un rappel à',
        desc: 'Qui voit les messages de concentration et sauvegarde : tout le monde, le MJ ou les joueurs du personnage (le MJ en obtient une copie).',
      },
      auto_add_concentration_marker: {
        label: 'Ajout automatique de con. Marqueur',
        desc: "Ajoutez le marqueur lorsqu'un sort de concentration est lancé depuis une feuille.",
        hint: 'Feuilles D&D 5e 2014 (OGL) et 2024.',
      },
      auto_roll_save: {
        label: 'Sauvegarde automatique du rouleau',
        desc: "Lancez la sauvegarde dès qu'un jeton de concentration subit des dégâts. Lorsqu'il est désactivé, le rappel comporte des boutons Roll et Advantage.",
      },
      show_roll_button: {
        label: 'Bouton de rouleau',
        desc: 'Ajoutez les boutons Roll et Advantage au rappel lorsque la fonction Auto Roll Save est désactivée.',
      },
      end_at_zero: {
        label: 'Terminer à 0 HP',
        desc: "Mettez fin à la concentration sans sauvegarde lorsqu'un jeton tombe à 0 point de vie.",
      },
      bonus_attribute: {
        label: 'Attribut bonus',
        desc: "L'attribut de feuille ajouté à la concentration enregistre. constitution_save_mod fonctionne sur les feuilles D&D 5e 2014 et 2024.",
      },
      debug: {
        label: 'Mode débogage',
        desc: "Rédigez des notes sur la détection orthographique et enregistrez-les sur la console API, pour les demandes d'assistance.",
      },
      support_mode: {
        label: "Mode d'assistance",
        desc: "Combien d'écritures en mode débogage : basique (court) ou détaillé.",
      },
    },
    help: {
      menu: 'Sans rien sélectionné (GM) : ouvrez les paramètres. Avec jetons sélectionnés : début ou fin de la concentration.',
      toggle:
        'Commencez à vous concentrer sur un sort avec les jetons sélectionnés. Nommez un sort différent à changer ; exécutez-le à nouveau pour terminer.',
      end: 'Terminez la concentration pour les jetons sélectionnés.',
      status: 'Liste qui se concentre, avec les boutons Fin.',
      config: 'Modifiez un paramètre, par exemple config auto_roll_save|false.',
      advantageMenu:
        'Choisissez quels personnages lancent des sauvegardes de concentration avec avantage.',
      toggleAdvantage: "Activez ou désactivez l'avantage pour un personnage.",
      roll: 'Lancez une sauvegarde à partir du bouton Roll ou Advantage d’un rappel.',
      journal: "Reconstruisez les documents d'aide et de commande.",
      reset: 'Remettez chaque paramètre à sa valeur par défaut.',
      help: 'Montrez cette liste.',
      footer:
        'Les instructions complètes se trouvent dans le document « {help} » ; les boutons se trouvent dans le document « {deck} ».',
      playerFooter: "Sélectionnez d'abord votre jeton.",
    },
    errors: {
      noSelection: "Sélectionnez d'abord un jeton.",
      notYours: 'Vous ne pouvez modifier la concentration que pour les jetons que vous contrôlez.',
      gmOnly: 'Seul le MJ peut utiliser cette commande.',
      notConcentrating: 'Ce jeton ne se concentre pas.',
      unknownSetting: 'Il n\'existe aucun paramètre appelé "{key}".',
      badSettingValue: '"{value}" n\'est pas une valeur valide pour {key}.',
      rollExpired: 'Ce bouton a expiré.',
      unknownCharacter: "Ce personnage n'existe plus.",
      internal: "Quelque chose s'est mal passé. La console API contient les détails.",
    },
    hints: {
      noSelection: 'Sélectionnez le jeton du lanceur, puis exécutez à nouveau la commande.',
      rollExpired:
        'Les boutons fonctionnent une fois et pendant 10 minutes. Endommagez à nouveau le jeton pour en obtenir un nouveau.',
      unknownSetting: 'Tapez la commande sans rien sélectionné pour voir les paramètres.',
    },
    warnings: {
      unknownMarker:
        'Le marqueur de statut « {marker} » ne fait pas partie des marqueurs de ce jeu. Choisissez-en un autre dans les paramètres.',
    },
    deck: {
      subtitle: 'Pont de commandement',
      selected: 'Jetons sélectionnés',
      selectedDesc: 'Sélectionnez d’abord le jeton du lanceur.',
      table: 'Le tableau',
      tableDesc: 'Voyez qui se concentre et qui a l’avantage sur ses sauvegardes.',
      tools: 'Outils',
      toolsDesc: 'Paramètres, la liste des commandes et les documents.',
      footer: 'Les instructions complètes se trouvent dans le document « {help} ».',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Marqueurs de concentration, rappels et sauvegardes pour D&D 5e',
      overview: {
        heading: 'Aperçu',
        body: 'La concentration permet de savoir qui se concentre sur quel sort. Il place un marqueur sur le jeton du lanceur, lance (ou demande) une sauvegarde de Constitution lorsque ce jeton subit des dégâts et indique à la table quand la concentration se termine.',
      },
      quickStart: {
        heading: 'Démarrage rapide',
        steps: [
          'Sélectionnez le jeton du lanceur et tapez !concentration suivi du sort, par exemple !concentration Bless.',
          'Modifiez les points de vie du jeton dans sa bulle de barre. Une sauvegarde est lancée à un DD de 10, ou à la moitié des dégâts si ce chiffre est plus élevé.',
          'Exécutez à nouveau la même commande ou retirez le marqueur pour mettre fin à la concentration.',
          'Tapez !concentration sans rien sélectionné pour ouvrir les paramètres.',
        ],
      },
      concentrating: {
        heading: 'Se concentrer',
        points: [
          "Nommer un sort différent change la concentration, comme le fait le lancement d'un nouveau sort de concentration.",
          'Placer le marqueur sur un jeton à la main démarre la concentration sans sort ; le retirer ou supprimer le jeton y met fin.',
          "Un nouveau jeton lié d'un personnage concentré obtient le marqueur, et un jeton collé qui porte le marqueur est suivi.",
          "Les jetons d'un personnage avec une barre de points de vie liée partagent la concentration. Les jetons non liés, comme un groupe de gobelins d'une seule feuille, se concentrent sur eux-mêmes.",
          'Tout le monde voit un message lorsque la concentration commence, change ou se termine, sauf indication contraire de Send Reminder To.',
        ],
      },
      saves: {
        heading: "La concentration permet d'économiser",
        points: [
          "Le DD est de 10 ou la moitié des dégâts subis, selon le montant le plus élevé, jusqu'à DD 30.",
          'Le modificateur vient de l’Attribut Bonus sur la fiche du personnage ; une valeur manquante compte pour 0.',
          "Auto Roll Enregistrez les rouleaux en même temps. Lorsqu'il est désactivé, le rappel comporte des boutons Roll et Advantage pour le joueur ou le MJ.",
          'Une sauvegarde ratée met fin à la concentration. Avec Fin à 0 HP activé, tomber à 0 point de vie met fin sans sauvegarde.',
          'Le menu Avantage donne un avantage au personnage sur les sauvegardes automatiques, comme le fait le don War Caster.',
        ],
      },
      automatic: {
        heading: 'Sorts lancés depuis une feuille',
        points: [
          "Avec ajout automatique de con. Marqueur activé, lancer un sort de concentration à partir d'une feuille D&D 5e 2014 (OGL) ou 2024 ajoute le marqueur.",
          "Les jetons du lanceur de sorts sur la page qu'il consulte sont marqués ; s'il n'y en a pas, les jetons sur n'importe quelle page le sont.",
          'Seules les cartes du MJ, d’un autre Mod ou d’un des joueurs du personnage comptent. Relancer le même sort ne change rien.',
          'Une carte D&D 2024 qui ne mentionne que la concentration dans son texte, comme le don War Caster, peut démarrer la concentration mais ne remplace jamais un sort.',
          "Les feuilles D&D 2024 peuvent nécessiter le serveur API expérimentale. Activez le mode débogage pour voir pourquoi un sort a été ou n'a pas été détecté.",
        ],
      },
      players: {
        heading: 'Joueurs',
        points: [
          "Les joueurs peuvent démarrer et terminer la concentration des jetons qu'ils contrôlent et utiliser les boutons Roll et Advantage sur leurs propres sauvegardes.",
          'Avec Envoyer un rappel pour être réglé sur Personnage, les messages sont chuchotés aux joueurs du personnage et au MJ.',
        ],
      },
      commands: {
        heading: 'Commandes',
        intro: "D'autres mods, tels que les ScriptCards, peuvent également envoyer ces commandes.",
        colCommand: 'Commande',
        colDesc: 'Ce que ça fait',
      },
      settings: {
        heading: 'Paramètres',
        intro:
          'Modifiez les paramètres avec les boutons de la carte des paramètres ou avec config <key>|<value>. Certains peuvent également être définis sur la page du Mod.',
        colKey: 'Clé',
        colName: 'Nom',
        colDesc: 'Ce que ça fait',
      },
      upgrading: {
        heading: 'Mise à niveau à partir de la version 1.0',
        points: [
          'Les paramètres, la liste des avantages et chaque commande continuent de fonctionner.',
          'Les messages indiquent désormais quand la concentration se termine et sur quel sort.',
          'Les jetons qui portent déjà le marqueur sont récupérés au démarrage.',
        ],
      },
      troubleshooting: {
        heading: 'Dépannage',
        points: [
          "Pas de sauvegarde lorsque les points de vie chutent : vérifiez que le jeton porte le marqueur et que la barre HP est bien la barre que vous avez modifiée. Les modifications apportées par d'autres mods via l'API ne déclenchent pas d'événements, elles ne sont donc pas visibles.",
          'Le modificateur est 0 : vérifiez l’attribut bonus par rapport à la feuille du personnage.',
          'Les sorts lancés depuis la feuille ne sont pas détectés : activez le mode débogage, lancez à nouveau le sort et lisez la console API.',
          'Deux personnages partagent un nom : la détection utilise la première correspondance. Donnez aux personnages des noms uniques.',
        ],
      },
      languages: {
        heading: 'Langues',
        body: 'La concentration est traduite dans les langues ci-dessous. Choisissez-en un avec le paramètre Langue.',
        colCode: 'Code',
        colName: 'Langue',
        colNative: 'Nom natif',
      },
      credits: {
        heading: 'Crédits',
        original: 'Mod original par',
        maintainer: 'Entretenu par',
        support: 'Signalez des bugs et des idées sur le forum Roll20 Mod ou sur GitHub.',
      },
      footer: 'Les boutons pour chaque action se trouvent dans le document « {deck} ».',
    },
  };

  const TRANSLATION$e = {
    titles: {
      ready: 'Konzentration ist fertig.',
      menu: 'Konzentrationseinstellungen',
      help: 'Konzentrationsbefehle',
      status: 'Wer konzentriert sich?',
      advantage: 'Vorteil durch Konzentrationseinsparungen',
      reset: 'Konzentration zurücksetzen',
      concentration: 'Konzentration',
      save: 'Konzentration speichern',
      check: 'Konzentrationskontrolle',
    },
    messages: {
      migrated:
        'Von Version 1.0 aktualisiert. Ihre Einstellungen und Vorteilsliste wurden beibehalten und Ihre alten Makros funktionieren weiterhin.',
      reconciled:
        'Habe die Karte eingeholt: Konzentrierte Token gefunden {added}, alte Einträge entfernt {dropped}.',
      readyHint:
        'Geben Sie {command} für die Einstellungen ein oder öffnen Sie das Command Deck-Handout.',
      settingChanged: '{setting} ist jetzt {value}.',
      confirmReset:
        'Alle Einstellungen auf die Standardeinstellungen zurücksetzen und die Vorteilsliste löschen? Konzentrationsmarkierungen auf der Karte bleiben erhalten.',
      reset: 'Die Einstellungen werden auf ihre Standardwerte zurückgesetzt.',
      journal: 'Handouts neu erstellt: {help} und {deck}.',
    },
    notices: {
      started: '{name} konzentriert sich jetzt auf {spell}.',
      startedNoSpell: '{name} konzentriert sich jetzt.',
      switched:
        '{name} konzentriert sich nicht mehr auf {old} und konzentriert sich jetzt auf {spell}.',
      switchedNoSpell: '{name} konzentriert sich jetzt.',
      ended: '{name} konzentriert sich nicht mehr auf {spell}.',
      endedNoSpell: '{name} konzentriert sich nicht mehr.',
      lost: '{name} verliert die Konzentration auf {spell}.',
      lostNoSpell: '{name} verliert die Konzentration.',
      kept: '{name} konzentriert sich weiterhin auf {spell}.',
      keptNoSpell: '{name} konzentriert sich weiter.',
      zeroHp: '{name} sinkt auf 0 Trefferpunkte und verliert die Konzentration auf {spell}.',
      zeroHpNoSpell: '{name} sinkt auf 0 Trefferpunkte und verliert die Konzentration.',
      checkNeeded:
        '{name} muss einen konstitutionsrettenden Wurf machen, um konzentriert zu bleiben: {dc}.',
    },
    save: {
      dc: 'Gleichstrom',
      dcValue: 'DC {dc}',
      modifier: 'Modifikator',
      roll: 'Rollen',
      advantageRoll: '{first} und {second} (Vorteil)',
      success: 'Erfolg',
      failure: 'Versagen',
    },
    menu: {
      concentratingCount: 'Jetzt konzentrieren: {count}',
      settings: 'Einstellungen',
      footer:
        'Geben Sie {command} ein, um hierher zurückzukehren. Jeder Button ist auch im Handout „{deck}“ enthalten.',
    },
    status: {
      none: 'Niemand konzentriert sich.',
    },
    advantage: {
      intro:
        'Charaktere, die auf „Ein“ eingestellt sind, würfeln ihre Konzentrationswürfe mit Vorteil, wie beim War Caster-Talent. Dies gilt für automatische Speicherungen.',
      none: 'In diesem Spiel gibt es keine Charaktere.',
    },
    buttons: {
      roll: 'Rollen',
      advantage: 'Vorteil',
      status: 'Status',
      advantageMenu: 'Vorteilsmenü',
      help: 'Helfen',
      reset: 'Zurücksetzen',
      confirmReset: 'Einstellungen zurücksetzen',
      end: 'Ende',
      menu: 'Speisekarte',
      concentrate: 'Konzentrieren Sie sich auf…',
      toggle: 'Umschalten',
      journal: 'Handouts neu erstellen',
    },
    prompts: {
      spell: 'Fluch',
    },
    values: {
      on: 'An',
      off: 'Aus',
      bar: 'Balken {bar}',
      unnamed: 'Unbenannt',
      sendTo: {
        everyone: 'Alle',
        character: 'Charakter',
        gm: 'GM',
      },
      supportMode: {
        basic: 'Basic',
        detailed: 'Ausführlich',
      },
    },
    settings: {
      language: {
        label: 'Sprache',
        desc: 'Die Sprache von Chat-Nachrichten und Handouts.',
      },
      command: {
        label: 'Befehl',
        desc: 'Der Chat-Befehl, ohne das „!“. Makros der Version 1.0 verwenden Konzentration.',
      },
      statusmarker: {
        label: 'Statusmarkierung',
        desc: 'Der Token-Marker, der die Konzentration anzeigt. Es können benutzerdefinierte Token-Marker verwendet werden.',
      },
      bar: {
        label: 'HP-Leiste',
        desc: 'Die Token-Leiste, die Trefferpunkte enthält. Schäden daran erfordern einen Konzentrationswurf.',
      },
      send_reminder_to: {
        label: 'Erinnerung senden an',
        desc: 'Wer Konzentrationsnachrichten sieht und speichert: jeder, der GM oder die Spieler des Charakters (der GM erhält eine Kopie).',
      },
      auto_add_concentration_marker: {
        label: 'Con automatisch hinzufügen. Marker',
        desc: 'Fügen Sie die Markierung hinzu, wenn ein Konzentrationszauber von einem Blatt aus gewirkt wird.',
        hint: 'D&D 5e 2014 (OGL) und 2024 Blätter.',
      },
      auto_roll_save: {
        label: 'Automatische Rollenspeicherung',
        desc: 'Würfeln Sie den Rettungswurf, sobald ein Konzentrationsmarker Schaden erleidet. Wenn die Erinnerung deaktiviert ist, verfügt sie über die Schaltflächen „Rollen“ und „Vorteil“.',
      },
      show_roll_button: {
        label: 'Roll-Taste',
        desc: 'Fügen Sie der Erinnerung die Schaltflächen „Rolle“ und „Vorteil“ hinzu, wenn die automatische Rollspeicherung deaktiviert ist.',
      },
      end_at_zero: {
        label: 'Ende bei 0 PS',
        desc: 'Beenden Sie die Konzentration ohne Speichern, wenn ein Token auf 0 Trefferpunkte fällt.',
      },
      bonus_attribute: {
        label: 'Bonusattribut',
        desc: 'Das zu Konzentrationsspeichern hinzugefügte Blattattribut. Constitution_save_mod funktioniert auf D&D 5e 2014- und 2024-Blättern.',
      },
      debug: {
        label: 'Debug-Modus',
        desc: 'Schreiben Sie Notizen zur Zaubererkennung und zum Speichern in der API-Konsole für Supportanfragen.',
      },
      support_mode: {
        label: 'Support-Modus',
        desc: 'Wie viel Debug-Modus schreibt: Einfach (kurz) oder Ausführlich.',
      },
    },
    help: {
      menu: 'Wenn nichts ausgewählt ist (GM): Öffnen Sie die Einstellungen. Bei ausgewählten Token: Konzentration starten oder beenden.',
      toggle:
        'Konzentrieren Sie sich auf einen Zauberspruch mit den ausgewählten Spielsteinen. Nennen Sie einen anderen Zauberspruch, den Sie wechseln möchten. Führen Sie es erneut aus, um es zu beenden.',
      end: 'Endkonzentration für die ausgewählten Token.',
      status: 'Listen Sie mit den Schaltflächen „Beenden“ auf, wer sich konzentriert.',
      config: 'Ändern Sie eine Einstellung, zum Beispiel config auto_roll_save|false.',
      advantageMenu: 'Wählen Sie aus, welche Charaktere mit Vorteil Konzentrationswürfe erzielen.',
      toggleAdvantage: 'Schalten Sie den Vorteil für einen Charakter ein oder aus.',
      roll: 'Führen Sie einen Rettungswurf über die Schaltfläche „Würfen“ oder „Vorteil“ einer Erinnerung aus.',
      journal: 'Erstellen Sie die Handzettel für das Hilfe- und Befehlsdeck neu.',
      reset: 'Setzen Sie alle Einstellungen auf die Standardeinstellungen zurück.',
      help: 'Diese Liste anzeigen.',
      footer:
        'Vollständige Anweisungen finden Sie im Handout „{help}“. Schaltflächen finden Sie im Handout „{deck}“.',
      playerFooter: 'Wählen Sie zuerst Ihren Token aus.',
    },
    errors: {
      noSelection: 'Wählen Sie zunächst einen Token aus.',
      notYours: 'Du kannst die Konzentration nur für Spielsteine ​​ändern, die du kontrollierst.',
      gmOnly: 'Nur der GM kann diesen Befehl verwenden.',
      notConcentrating: 'Dieses Zeichen konzentriert sich nicht.',
      unknownSetting: 'Es gibt keine Einstellung namens „{key}“.',
      badSettingValue: '„{value}“ ist kein gültiger Wert für {key}.',
      rollExpired: 'Diese Schaltfläche ist abgelaufen.',
      unknownCharacter: 'Dieser Charakter existiert nicht mehr.',
      internal: 'Etwas ist schief gelaufen. Die API-Konsole enthält die Details.',
    },
    hints: {
      noSelection: 'Wählen Sie den Token des Zauberers aus und führen Sie den Befehl erneut aus.',
      rollExpired:
        'Die Tasten funktionieren einmal und 10 Minuten lang. Beschädigen Sie den Token erneut, um einen neuen zu erhalten.',
      unknownSetting:
        'Geben Sie den Befehl ein, ohne dass etwas ausgewählt ist, um die Einstellungen anzuzeigen.',
    },
    warnings: {
      unknownMarker:
        'Der Statusmarker „{marker}“ gehört nicht zu den Markern dieses Spiels. Wählen Sie in den Einstellungen eine andere aus.',
    },
    deck: {
      subtitle: 'Kommandodeck',
      selected: 'Ausgewählte Token',
      selectedDesc: 'Wählen Sie zuerst den Spielstein des Zaubernden aus.',
      table: 'Der Tisch',
      tableDesc: 'Sehen Sie, wer konzentriert ist und wer bei seinen Paraden im Vorteil ist.',
      tools: 'Werkzeuge',
      toolsDesc: 'Einstellungen, die Befehlsliste und die Handouts.',
      footer: 'Vollständige Anweisungen finden Sie im Handout „{help}“.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Konzentrationsmarkierungen, Erinnerungen und Speicherungen für D&D 5e',
      overview: {
        heading: 'Überblick',
        body: 'Konzentration verfolgt, wer sich auf welchen Zauber konzentriert. Es setzt einen Marker auf den Marker des Zauberers, führt einen Konstitutionswurf durch (oder fordert ihn dazu auf), wenn dieser Marker Schaden erleidet, und teilt dem Tisch mit, wann die Konzentration endet.',
      },
      quickStart: {
        heading: 'Schnellstart',
        steps: [
          'Wählen Sie den Spielstein des Zauberers aus und geben Sie „!concentration“ gefolgt vom Zauber ein, zum Beispiel „!concentration Bless“.',
          'Ändern Sie die Trefferpunkte des Tokens in seiner Balkenblase. Ein Rettungswurf wird mit SG 10 gewürfelt, oder mit der Hälfte des Schadens, wenn dieser höher ist.',
          'Führen Sie denselben Befehl noch einmal aus oder nehmen Sie den Marker ab, um die Konzentration zu beenden.',
          'Geben Sie !concentration ein, ohne dass etwas ausgewählt ist, um die Einstellungen zu öffnen.',
        ],
      },
      concentrating: {
        heading: 'Konzentrieren',
        points: [
          'Das Benennen eines anderen Zaubers verlagert die Konzentration darauf, ebenso wie das Wirken eines neuen Konzentrationszaubers.',
          'Wenn man den Marker mit der Hand auf einen Spielstein legt, beginnt die Konzentration ohne Zauber; Durch Entfernen oder Löschen des Tokens wird es beendet.',
          'Ein neu verknüpfter Token eines sich konzentrierenden Charakters erhält die Markierung, und ein eingefügter Token, der die Markierung trägt, wird verfolgt.',
          'Token eines Charakters mit verknüpfter Trefferpunktleiste teilen sich die Konzentration. Nicht verbundene Spielsteine, wie zum Beispiel ein Rudel Kobolde auf einem Blatt, konzentrieren sich auf sich allein.',
          'Jeder sieht eine Nachricht, wenn die Konzentration beginnt, wechselt oder endet, es sei denn, „Erinnerung senden an“ sagt etwas anderes.',
        ],
      },
      saves: {
        heading: 'Konzentration spart',
        points: [
          'Der SG beträgt 10 oder die Hälfte des erlittenen Schadens, je nachdem, welcher Wert höher ist, bis zu SG 30.',
          'Der Modifikator stammt aus dem Bonusattribut auf dem Charakterbogen; ein fehlender Wert zählt als 0.',
          'Auto Roll Save rollt auf einmal. Wenn sie ausgeschaltet ist, verfügt die Erinnerung über Würfel- und Vorteilsschaltflächen für den Spieler oder GM.',
          'Ein fehlgeschlagener Rettungswurf beendet die Konzentration. Wenn „Ende bei 0 HP“ aktiviert ist, endet es ohne Speicherung, wenn es auf 0 Trefferpunkte fällt.',
          'Das Vorteilsmenü verschafft dem Charakter einen Vorteil bei automatischen Speicherungen, wie es auch das Talent War Caster tut.',
        ],
      },
      automatic: {
        heading: 'Von einem Blatt gewirkte Zauber',
        points: [
          'Mit Auto Add Con. Markierung an, das Wirken eines Konzentrationszaubers von einem D&D 5e 2014 (OGL)- oder 2024-Blatt fügt die Markierung hinzu.',
          'Die Token des Zaubernden auf der Seite, die er gerade betrachtet, sind markiert; Wenn es keine gibt, sind es Token auf jeder Seite.',
          'Es zählen nur Karten des GM, eines anderen Mods oder eines Spielers des Charakters. Das erneute Wirken desselben Zaubers ändert nichts.',
          'Eine D&D 2024-Karte, in deren Text nur von Konzentration die Rede ist, wie zum Beispiel das Talent War Caster, kann zwar Konzentration anregen, ersetzt aber niemals einen Zauber.',
          'Für D&D 2024-Blätter ist möglicherweise der experimentelle API-Server erforderlich. Aktivieren Sie den Debug-Modus, um zu sehen, warum ein Zauber erkannt wurde oder nicht.',
        ],
      },
      players: {
        heading: 'Spieler',
        points: [
          'Spieler können die Konzentration für von ihnen kontrollierte Spielsteine ​​starten und beenden und die Würfel- und Vorteilsschaltflächen für ihre eigenen Spielstände verwenden.',
          'Wenn „Erinnerung senden“ auf „Charakter“ eingestellt ist, werden Nachrichten an die Spieler des Charakters und an den GM geflüstert.',
        ],
      },
      commands: {
        heading: 'Befehle',
        intro: 'Andere Mods, wie zum Beispiel ScriptCards, können diese Befehle ebenfalls senden.',
        colCommand: 'Befehl',
        colDesc: 'Was es bewirkt',
      },
      settings: {
        heading: 'Einstellungen',
        intro:
          'Ändern Sie die Einstellungen mit den Schaltflächen in der Einstellungskarte oder mit config <key>|<value>. Einige können auch auf der Mod-Seite eingestellt werden.',
        colKey: 'Schlüssel',
        colName: 'Name',
        colDesc: 'Was es bewirkt',
      },
      upgrading: {
        heading: 'Upgrade von Version 1.0',
        points: [
          'Die Einstellungen, die Vorteilsliste und alle Befehle funktionieren weiterhin.',
          'Nachrichten sagen jetzt, wann die Konzentration endet und bei welchem ​​Zauberspruch.',
          'Token, die bereits den Marker tragen, werden beim Start aufgenommen.',
        ],
      },
      troubleshooting: {
        heading: 'Fehlerbehebung',
        points: [
          'Kein Speichern, wenn Trefferpunkte sinken: Überprüfen Sie, ob der Marker die Markierung hat und ob der HP-Balken der Balken ist, den Sie geändert haben. Von anderen Mods über die API vorgenommene Änderungen lösen keine Ereignisse aus und werden daher nicht angezeigt.',
          'Der Modifikator ist 0: Vergleichen Sie das Bonusattribut mit dem Blatt des Charakters.',
          'Vom Blatt aus gewirkte Zauber werden nicht erkannt: Aktivieren Sie den Debug-Modus, wirken Sie den Zauber erneut und lesen Sie die API-Konsole.',
          'Zwei Zeichen teilen sich einen Namen: Bei der Erkennung wird die erste Übereinstimmung verwendet. Geben Sie den Charakteren eindeutige Namen.',
        ],
      },
      languages: {
        heading: 'Sprachen',
        body: 'Konzentration wird in die folgenden Sprachen übersetzt. Wählen Sie eine mit der Spracheinstellung aus.',
        colCode: 'Code',
        colName: 'Sprache',
        colNative: 'Einheimischer Name',
      },
      credits: {
        heading: 'Credits',
        original: 'Original Mod von',
        maintainer: 'Verwaltet von',
        support: 'Melden Sie Fehler und Ideen im Roll20 Mod-Forum oder auf GitHub.',
      },
      footer: 'Schaltflächen für jede Aktion finden Sie im Handout „{deck}“.',
    },
  };

  const TRANSLATION$d = {
    titles: {
      ready: 'Η συγκέντρωση είναι έτοιμη.',
      menu: 'Ρυθμίσεις συγκέντρωσης',
      help: 'Εντολές συγκέντρωσης',
      status: 'Ποιος Συγκεντρώνεται',
      advantage: 'Πλεονέκτημα στην εξοικονόμηση συγκέντρωσης',
      reset: 'Επαναφορά συγκέντρωσης',
      concentration: 'Συγκέντρωση',
      save: 'Εξοικονόμηση συγκέντρωσης',
      check: 'Έλεγχος συγκέντρωσης',
    },
    messages: {
      migrated:
        'Αναβαθμίστηκε από την έκδοση 1.0. Οι ρυθμίσεις και η λίστα πλεονεκτημάτων σας διατηρήθηκαν και οι παλιές σας μακροεντολές εξακολουθούν να λειτουργούν.',
      reconciled:
        'Ενημέρωση με τον χάρτη: συγκέντρωση διακριτικών βρέθηκαν {added}, οι παλιές καταχωρίσεις καταργήθηκαν {dropped}.',
      readyHint: 'Πληκτρολογήστε {command} για τις ρυθμίσεις ή ανοίξτε το φυλλάδιο Command Deck.',
      settingChanged: 'Το {setting} είναι πλέον {value}.',
      confirmReset:
        'Επαναφέρετε κάθε ρύθμιση στην προεπιλογή της και διαγράψτε τη λίστα πλεονεκτημάτων; Οι δείκτες συγκέντρωσης στον χάρτη παραμένουν.',
      reset: 'Οι ρυθμίσεις επανέρχονται στις προεπιλογές τους.',
      journal: 'Ανακατασκευή φυλλαδίων: {help} και {deck}.',
    },
    notices: {
      started: 'Ο {name} συγκεντρώνεται τώρα στον {spell}.',
      startedNoSpell: 'Το {name} συγκεντρώνεται τώρα.',
      switched:
        'Το {name} σταματά να συγκεντρώνεται στο {old} και τώρα συγκεντρώνεται στο {spell}.',
      switchedNoSpell: 'Το {name} συγκεντρώνεται τώρα.',
      ended: 'Ο {name} δεν συγκεντρώνεται πλέον στον {spell}.',
      endedNoSpell: 'Το {name} δεν συγκεντρώνεται πλέον.',
      lost: 'Ο {name} χάνει τη συγκέντρωση του στο {spell}.',
      lostNoSpell: 'Ο {name} χάνει τη συγκέντρωση του.',
      kept: 'Ο {name} συνεχίζει να συγκεντρώνεται στο {spell}.',
      keptNoSpell: 'Το {name} συνεχίζει να συγκεντρώνεται.',
      zeroHp: 'Το {name} πέφτει σε 0 πόντους επιτυχίας και χάνει τη συγκέντρωση στο {spell}.',
      zeroHpNoSpell: 'Το {name} πέφτει στα 0 χτυπήματα και χάνει τη συγκέντρωση.',
      checkNeeded: 'Ο {name} πρέπει να κάνει μια σωτηρία για να συνεχίσει να συγκεντρώνεται: {dc}.',
    },
    save: {
      dc: 'DC',
      dcValue: 'DC {dc}',
      modifier: 'Τροποποιητής',
      roll: 'Ρολό',
      advantageRoll: '{first} και {second} (πλεονέκτημα)',
      success: 'Επιτυχία',
      failure: 'Αποτυχία',
    },
    menu: {
      concentratingCount: 'Συγκεντρώνομαι τώρα: {count}',
      settings: 'Ρυθμίσεις',
      footer:
        'Πληκτρολογήστε {command} για να επιστρέψετε εδώ. Κάθε κουμπί βρίσκεται επίσης στο φυλλάδιο "{deck}".',
    },
    status: {
      none: 'Κανείς δεν συγκεντρώνεται.',
    },
    advantage: {
      intro:
        'Οι χαρακτήρες που έχουν οριστεί σε On roll, η συγκέντρωσή τους αποταμιεύει με πλεονέκτημα, όπως με το κατόρθωμα του War Caster. Αυτό ισχύει για τις αυτόματες αποθηκεύσεις.',
      none: 'Δεν υπάρχουν χαρακτήρες σε αυτό το παιχνίδι.',
    },
    buttons: {
      roll: 'Ρολό',
      advantage: 'Πλεονέκτημα',
      status: 'Κατάσταση',
      advantageMenu: 'Μενού Advantage',
      help: 'Βοήθεια',
      reset: 'Επαναφορά',
      confirmReset: 'Επαναφορά ρυθμίσεων',
      end: 'Τέλος',
      menu: 'Μενού',
      concentrate: 'Επικεντρωθείτε στο…',
      toggle: 'Μπαρέτα',
      journal: 'Ανοικοδόμηση φυλλαδίων',
    },
    prompts: {
      spell: 'Σημαίνω',
    },
    values: {
      on: 'Επί',
      off: 'Μακριά από',
      bar: 'Μπάρα {bar}',
      unnamed: 'Ανώνυμος',
      sendTo: {
        everyone: 'Καθένας',
        character: 'Χαρακτήρας',
        gm: 'GM',
      },
      supportMode: {
        basic: 'Βασικός',
        detailed: 'Λεπτομερής',
      },
    },
    settings: {
      language: {
        label: 'Γλώσσα',
        desc: 'Η γλώσσα των μηνυμάτων συνομιλίας και των φυλλαδίων.',
      },
      command: {
        label: 'Εντολή',
        desc: 'Η εντολή συνομιλίας, χωρίς το "!". Οι μακροεντολές έκδοσης 1.0 χρησιμοποιούν συγκέντρωση.',
      },
      statusmarker: {
        label: 'Δείκτης κατάστασης',
        desc: 'Ο δείκτης που δείχνει συγκέντρωση. Μπορούν να χρησιμοποιηθούν προσαρμοσμένοι δείκτες διακριτικών.',
      },
      bar: {
        label: 'Μπάρα HP',
        desc: 'Η μπάρα διακριτικών που συγκρατεί πόντους επιτυχίας. Η ζημιά του απαιτεί εξοικονόμηση συγκέντρωσης.',
      },
      send_reminder_to: {
        label: 'Αποστολή υπενθύμισης σε',
        desc: 'Ποιος βλέπει μηνύματα συγκέντρωσης και αποθηκεύει: όλοι, ο GM ή οι παίκτες του χαρακτήρα (ο GM λαμβάνει ένα αντίγραφο).',
      },
      auto_add_concentration_marker: {
        label: 'Auto Add Con. Σημάδι',
        desc: 'Προσθέστε το δείκτη όταν ένα ξόρκι συγκέντρωσης εκτελείται από ένα φύλλο.',
        hint: 'Φύλλα D&D 5e 2014 (OGL) και 2024.',
      },
      auto_roll_save: {
        label: 'Αυτόματη αποθήκευση σε ρολό',
        desc: 'Κυλήστε το save μόλις ένα κουπόνι συγκέντρωσης υποστεί ζημιά. Όταν είναι απενεργοποιημένη, η υπενθύμιση έχει τα κουμπιά Roll και Advantage.',
      },
      show_roll_button: {
        label: 'Κουμπί ρολού',
        desc: 'Προσθέστε τα κουμπιά Roll και Advantage στην υπενθύμιση όταν η Auto Roll Save είναι απενεργοποιημένη.',
      },
      end_at_zero: {
        label: 'Τέλος στα 0 HP',
        desc: 'Τερματίστε τη συγκέντρωση χωρίς απόκρουση όταν ένα διακριτικό πέσει στους 0 πόντους χτυπήματος.',
      },
      bonus_attribute: {
        label: 'Ιδιότητα Μπόνους',
        desc: 'Το χαρακτηριστικό φύλλου που προστέθηκε στη συγκέντρωση αποθηκεύει. constitution_save_mod λειτουργεί σε φύλλα D&D 5e 2014 και 2024.',
      },
      debug: {
        label: 'Λειτουργία εντοπισμού σφαλμάτων',
        desc: 'Γράψτε σημειώσεις σχετικά με τον εντοπισμό ορθογραφίας και τις αποθηκεύσεις στην κονσόλα API, για αιτήματα υποστήριξης.',
      },
      support_mode: {
        label: 'Λειτουργία υποστήριξης',
        desc: 'Πόσο γράφει η λειτουργία εντοπισμού σφαλμάτων: Βασική (σύντομη) ή Λεπτομερής.',
      },
    },
    help: {
      menu: 'Χωρίς επιλεγμένο τίποτα (GM): ανοίξτε τις ρυθμίσεις. Με επιλεγμένα διακριτικά: συγκέντρωση έναρξης ή λήξης.',
      toggle:
        'Αρχίστε να συγκεντρώνεστε σε ένα ξόρκι με τα επιλεγμένα διακριτικά. Ονομάστε ένα διαφορετικό ξόρκι για αλλαγή. τρέξτε το ξανά για να τελειώσετε.',
      end: 'Τελική συγκέντρωση για τα επιλεγμένα διακριτικά.',
      status: 'Καταγράψτε ποιος συγκεντρώνεται, με τα κουμπιά Τέλος.',
      config: 'Αλλάξτε μια ρύθμιση, για παράδειγμα config auto_roll_save|false.',
      advantageMenu: 'Επιλέξτε ποιοι χαρακτήρες ρολό εξοικονομεί συγκέντρωση με πλεονέκτημα.',
      toggleAdvantage: 'Ενεργοποιήστε ή απενεργοποιήστε το πλεονέκτημα για έναν χαρακτήρα.',
      roll: 'Αποθήκευση από το κουμπί Roll ή Advantage μιας υπενθύμισης.',
      journal: 'Αναδημιουργήστε τα φυλλάδια Help and Command Deck.',
      reset: 'Επαναφέρετε κάθε ρύθμιση στην προεπιλογή της.',
      help: 'Εμφάνιση αυτής της λίστας.',
      footer:
        'Πλήρεις οδηγίες βρίσκονται στο φυλλάδιο "{help}". Τα κουμπιά βρίσκονται στο φυλλάδιο "{deck}".',
      playerFooter: 'Επιλέξτε πρώτα το διακριτικό σας.',
    },
    errors: {
      noSelection: 'Επιλέξτε πρώτα ένα διακριτικό.',
      notYours: 'Μπορείτε να αλλάξετε τη συγκέντρωση μόνο για μάρκες που ελέγχετε.',
      gmOnly: 'Μόνο ο GM μπορεί να χρησιμοποιήσει αυτήν την εντολή.',
      notConcentrating: 'Αυτό το διακριτικό δεν συγκεντρώνεται.',
      unknownSetting: 'Δεν υπάρχει ρύθμιση με το όνομα "{key}".',
      badSettingValue: 'Το "{value}" δεν είναι έγκυρη τιμή για {key}.',
      rollExpired: 'Αυτό το κουμπί έχει λήξει.',
      unknownCharacter: 'Αυτός ο χαρακτήρας δεν υπάρχει πια.',
      internal: 'Κάτι πήγε στραβά. Η κονσόλα API έχει τις λεπτομέρειες.',
    },
    hints: {
      noSelection:
        'Επιλέξτε το διακριτικό του caster και, στη συνέχεια, εκτελέστε ξανά την εντολή.',
      rollExpired:
        'Τα κουμπιά λειτουργούν μία φορά και για 10 λεπτά. Καταστρέψτε ξανά το κουπόνι για νέο.',
      unknownSetting:
        'Πληκτρολογήστε την εντολή χωρίς να επιλέξετε τίποτα για να δείτε τις ρυθμίσεις.',
    },
    warnings: {
      unknownMarker:
        'Ο δείκτης κατάστασης "{marker}" δεν είναι ένας από τους δείκτες αυτού του παιχνιδιού. Επιλέξτε άλλο στις ρυθμίσεις.',
    },
    deck: {
      subtitle: 'Κατάστρωμα εντολών',
      selected: 'Επιλεγμένα διακριτικά',
      selectedDesc: 'Επιλέξτε πρώτα το διακριτικό του κάστερ.',
      table: 'Το τραπέζι',
      tableDesc:
        'Δείτε ποιος είναι συγκεντρωμένος και ποιος έχει πλεονέκτημα στις αποκρούσεις του.',
      tools: 'Εργαλεία',
      toolsDesc: 'Ρυθμίσεις, η λίστα εντολών και τα φυλλάδια.',
      footer: 'Πλήρεις οδηγίες βρίσκονται στο φυλλάδιο "{help}".',
    },
    handout: {
      versionLabel: 'Εκδοχή',
      subtitle: 'Δείκτες συγκέντρωσης, υπενθυμίσεις και αποθηκεύσεις για το D&D 5e',
      overview: {
        heading: 'Επισκόπηση',
        body: 'Η συγκέντρωση παρακολουθεί ποιος επικεντρώνεται σε ποιο ξόρκι. Βάζει ένα μαρκαδόρο στη μάρκα του κάστερ, ρίχνει (ή ζητά) ένα Σύνταγμα εκτός όταν αυτό το κουπόνι πάθει ζημιά και λέει στον πίνακα πότε τελειώνει η συγκέντρωση.',
      },
      quickStart: {
        heading: 'Γρήγορη εκκίνηση',
        steps: [
          'Επιλέξτε το διακριτικό του caster και πληκτρολογήστε !concentration ακολουθούμενο από το ξόρκι, για παράδειγμα !concentration Bless.',
          'Αλλάξτε τα σημεία επιτυχίας του διακριτικού στο συννεφάκι ράβδων του. Μια αποταμίευση σημειώνεται στο DC 10, ή η μισή ζημιά, αν είναι υψηλότερη.',
          'Εκτελέστε ξανά την ίδια εντολή ή αφαιρέστε το δείκτη, για να τερματίσετε τη συγκέντρωση.',
          'Πληκτρολογήστε !concentration χωρίς να επιλέξετε τίποτα για να ανοίξετε τις ρυθμίσεις.',
        ],
      },
      concentrating: {
        heading: 'Συγκεντρωτικός',
        points: [
          'Η ονομασία ενός διαφορετικού ξόρκι αλλάζει τη συγκέντρωση σε αυτό, όπως κάνει η ρίψη ενός νέου ξόρκι συγκέντρωσης.',
          'Η τοποθέτηση του δείκτη σε ένα κουπόνι με το χέρι ξεκινά τη συγκέντρωση χωρίς ξόρκι. αφαιρώντας το ή διαγράφοντας το διακριτικό, το τερματίζει.',
          'Ένα νέο συνδεδεμένο διακριτικό ενός συγκεντρωτικού χαρακτήρα παίρνει τον δείκτη και ένα επικολλημένο διακριτικό που φέρει τον δείκτη παρακολουθείται.',
          'Τα διακριτικά ενός χαρακτήρα με μια συνδεδεμένη γραμμή σημείων επιτυχίας μοιράζονται τη συγκέντρωση. Τα μη συνδεδεμένα μάρκες, όπως ένα πακέτο καλικάντζαρων από ένα φύλλο, συγκεντρώνονται μόνα τους.',
          'Όλοι βλέπουν ένα μήνυμα όταν ξεκινά, αλλάζει ή τελειώνει η συγκέντρωση, εκτός εάν λέει διαφορετικά η Αποστολή υπενθύμισης.',
        ],
      },
      saves: {
        heading: 'Η συγκέντρωση σώζει',
        points: [
          'Το DC είναι το 10 ή το ήμισυ της ζημιάς που έχει γίνει, όποιο είναι υψηλότερο, μέχρι το DC 30.',
          'Ο τροποποιητής προέρχεται από το Bonus Attribute στο φύλλο του χαρακτήρα. μια τιμή που λείπει μετράει ως 0.',
          'Auto Roll Αποθήκευση ρόλων ταυτόχρονα. Όταν είναι απενεργοποιημένη, η υπενθύμιση έχει τα κουμπιά Roll και Advantage για τη συσκευή αναπαραγωγής ή τη GM.',
          'Μια αποτυχημένη αποθήκευση τερματίζει τη συγκέντρωση. Με το End at 0 HP ενεργοποιημένο, η πτώση στους 0 πόντους επιτυχίας τερματίζει χωρίς αποθήκευση.',
          'Το Advantage Menu δίνει ένα πλεονέκτημα χαρακτήρων στις αυτόματες αποθηκεύσεις, όπως κάνει το κατόρθωμα War Caster.',
        ],
      },
      automatic: {
        heading: 'Ξόρκια από φύλλο',
        points: [
          'Με Auto Add Con. Ο δείκτης ενεργοποιείται, η ρίψη ενός ξόρκι συγκέντρωσης από ένα φύλλο D&D 5e 2014 (OGL) ή 2024 προσθέτει τον δείκτη.',
          'Τα διακριτικά του κάστερ στη σελίδα που προβάλλει επισημαίνονται. Εάν δεν υπάρχει κανένα, υπάρχουν διακριτικά σε οποιαδήποτε σελίδα.',
          'Μετρούν μόνο κάρτες από τον GM, έναν άλλο Mod ή έναν από τους παίκτες του χαρακτήρα. Κάνοντας ξανά το ίδιο ξόρκι δεν αλλάζει τίποτα.',
          'Μια κάρτα D&D 2024 που αναφέρει μόνο τη συγκέντρωση στο κείμενό της, όπως το κατόρθωμα του War Caster, μπορεί να ξεκινήσει τη συγκέντρωση αλλά ποτέ δεν αντικαθιστά ένα ξόρκι.',
          'Τα φύλλα D&D 2024 ενδέχεται να χρειάζονται τον διακομιστή πειραματικού API. Ενεργοποιήστε τη λειτουργία εντοπισμού σφαλμάτων για να δείτε γιατί εντοπίστηκε ή δεν εντοπίστηκε ένα ξόρκι.',
        ],
      },
      players: {
        heading: 'Παίκτες',
        points: [
          'Οι παίκτες μπορούν να ξεκινήσουν και να τερματίσουν τη συγκέντρωση για τα διακριτικά που ελέγχουν και να χρησιμοποιήσουν τα κουμπιά Roll και Advantage στις δικές τους αποθηκευμένες ρυθμίσεις.',
          'Με την επιλογή Αποστολή υπενθύμισης Για να οριστεί σε Χαρακτήρα, τα μηνύματα ψιθυρίζονται στους παίκτες του χαρακτήρα και στον GM.',
        ],
      },
      commands: {
        heading: 'Εντολές',
        intro: 'Άλλα Mods, όπως οι ScriptCards, μπορούν επίσης να στείλουν αυτές τις εντολές.',
        colCommand: 'Εντολή',
        colDesc: 'Τι κάνει',
      },
      settings: {
        heading: 'Ρυθμίσεις',
        intro:
          'Αλλάξτε τις ρυθμίσεις με τα κουμπιά στην κάρτα ρυθμίσεων ή με το config <key>|<value>. Μερικά μπορούν επίσης να οριστούν στη σελίδα του Mod.',
        colKey: 'Κλειδί',
        colName: 'Ονομα',
        colDesc: 'Τι κάνει',
      },
      upgrading: {
        heading: 'Αναβάθμιση από την έκδοση 1.0',
        points: [
          'Οι ρυθμίσεις, η λίστα πλεονεκτημάτων και κάθε εντολή συνεχίζουν να λειτουργούν.',
          'Τα μηνύματα λένε τώρα πότε τελειώνει η συγκέντρωση και σε ποιο ξόρκι.',
          'Τα διακριτικά που φέρουν ήδη τον δείκτη παραλαμβάνονται κατά την εκκίνηση.',
        ],
      },
      troubleshooting: {
        heading: 'Αντιμετώπιση προβλημάτων',
        points: [
          'Χωρίς αποθήκευση όταν πέφτουν τα σημεία επιτυχίας: ελέγξτε ότι το διακριτικό έχει τον δείκτη και ότι η γραμμή HP είναι η γραμμή που αλλάξατε. Οι αλλαγές που γίνονται από άλλα Mods μέσω του API δεν δημιουργούν συμβάντα, επομένως δεν εμφανίζονται.',
          'Ο τροποποιητής είναι 0: ελέγξτε το Χαρακτηριστικό Μπόνους στο φύλλο του χαρακτήρα.',
          'Τα ξόρκια από το φύλλο δεν εντοπίζονται: ενεργοποιήστε τη λειτουργία εντοπισμού σφαλμάτων, κάντε ξανά το ξόρκι και διαβάστε την κονσόλα API.',
          'Δύο χαρακτήρες μοιράζονται ένα όνομα: η ανίχνευση χρησιμοποιεί την πρώτη αντιστοίχιση. Δώστε στους χαρακτήρες μοναδικά ονόματα.',
        ],
      },
      languages: {
        heading: 'Γλώσσες',
        body: 'Η συγκέντρωση μεταφράζεται στις παρακάτω γλώσσες. Επιλέξτε ένα με τη ρύθμιση Γλώσσα.',
        colCode: 'Κώδικας',
        colName: 'Γλώσσα',
        colNative: 'Εγγενές όνομα',
      },
      credits: {
        heading: 'Πιστώσεις',
        original: 'Original Mod by',
        maintainer: 'Συντηρείται από',
        support: 'Αναφέρετε σφάλματα και ιδέες στο φόρουμ Roll20 Mod ή στο GitHub.',
      },
      footer: 'Τα κουμπιά για κάθε ενέργεια βρίσκονται στο φυλλάδιο "{deck}".',
    },
  };

  const TRANSLATION$c = {
    titles: {
      ready: 'הריכוז מוכן.',
      menu: 'הגדרות ריכוז',
      help: 'פקודות ריכוז',
      status: 'מי מתרכז',
      advantage: 'יתרון בחיסכון בריכוז',
      reset: 'אפס את הריכוז',
      concentration: 'ריכוז',
      save: 'ריכוז שמור',
      check: 'בדיקת ריכוז',
    },
    messages: {
      migrated:
        'שודרג מגרסה 1.0. ההגדרות ורשימת היתרונות שלך נשמרו, ופקודות המאקרו הישנות שלך עדיין פועלות.',
      reconciled: 'התעדכן במפה: נמצאו אסימוני ריכוז {added}, ערכים ישנים הוסרו {dropped}.',
      readyHint: 'הקלד {command} עבור ההגדרות, או פתח את דף הפקודה.',
      settingChanged: '{setting} הוא כעת {value}.',
      confirmReset:
        'להחזיר כל הגדרה לברירת המחדל שלה ולנקות את רשימת היתרונות? סמני הריכוז במפה נשארים.',
      reset: 'ההגדרות הוחזרו לברירות המחדל שלהן.',
      journal: 'דפי מידע שנבנו מחדש: {help} ו-{deck}.',
    },
    notices: {
      started: '{name} מתרכז כעת ב-{spell}.',
      startedNoSpell: '{name} מתרכז כעת.',
      switched: '{name} מפסיק להתרכז ב-{old} וכעת הוא מתרכז ב-{spell}.',
      switchedNoSpell: '{name} מתרכז כעת.',
      ended: '{name} כבר לא מתרכז ב-{spell}.',
      endedNoSpell: '{name} כבר לא מתרכז.',
      lost: '{name} מאבד ריכוז ב-{spell}.',
      lostNoSpell: '{name} מאבד ריכוז.',
      kept: '{name} ממשיך להתרכז ב-{spell}.',
      keptNoSpell: '{name} ממשיך להתרכז.',
      zeroHp: '{name} יורד ל-0 נקודות פגיעה ומאבד ריכוז ב-{spell}.',
      zeroHpNoSpell: '{name} יורד ל-0 נקודות פגיעה ומאבד ריכוז.',
      checkNeeded: '{name} חייב לבצע זריקת חיסכון בחוקה כדי להמשיך להתרכז: {dc}.',
    },
    save: {
      dc: 'זֶרֶם יָשָׁר',
      dcValue: 'DC {dc}',
      modifier: 'מַתקֵן',
      roll: 'גָלִיל',
      advantageRoll: '{first} ו-{second} (יתרון)',
      success: 'הַצלָחָה',
      failure: 'כֶּשֶׁל',
    },
    menu: {
      concentratingCount: 'מתרכז עכשיו: {count}',
      settings: 'הגדרות',
      footer: 'הקלד {command} כדי לחזור לכאן. כל כפתור נמצא גם בדף "{deck}".',
    },
    status: {
      none: 'אף אחד לא מתרכז.',
    },
    advantage: {
      intro:
        'דמויות שמוגדרות ל-On roll, חוסכות את הריכוז שלהן עם יתרון, כמו עם הישג ה-War Caster. זה חל על שמירות אוטומטיות.',
      none: 'אין דמויות במשחק הזה.',
    },
    buttons: {
      roll: 'גָלִיל',
      advantage: 'יִתרוֹן',
      status: 'סטָטוּס',
      advantageMenu: 'תפריט יתרון',
      help: 'עֶזרָה',
      reset: 'אִתחוּל',
      confirmReset: 'אפס את ההגדרות',
      end: 'סוֹף',
      menu: 'תַפרִיט',
      concentrate: 'תתרכז ב…',
      toggle: 'לְמַתֵג',
      journal: 'בנייה מחדש של דפי מידע',
    },
    prompts: {
      spell: 'לַחַשׁ',
    },
    values: {
      on: 'עַל',
      off: 'כבוי',
      bar: 'סרגל {bar}',
      unnamed: 'ללא שם',
      sendTo: {
        everyone: 'כֹּל אֶחָד',
        character: 'אוֹפִי',
        gm: 'GM',
      },
      supportMode: {
        basic: 'בְּסִיסִי',
        detailed: 'מְפוֹרָט',
      },
    },
    settings: {
      language: {
        label: 'שָׂפָה',
        desc: "שפת הודעות הצ'אט והדפים.",
      },
      command: {
        label: 'פְּקוּדָה',
        desc: 'פקודת הצ\'אט, ללא ה"!". פקודות מאקרו בגרסה 1.0 משתמשות בריכוז.',
      },
      statusmarker: {
        label: 'סמן סטטוס',
        desc: 'סמן האסימון שמראה ריכוז. ניתן להשתמש בסמני אסימונים מותאמים אישית.',
      },
      bar: {
        label: 'בר HP',
        desc: 'סרגל האסימונים שמחזיק נקודות פגיעה. פגיעה בו דורשת הצלת ריכוז.',
      },
      send_reminder_to: {
        label: 'שלח תזכורת אל',
        desc: 'מי שרואה הודעות ריכוז ושומר: כולם, ה-GM או השחקנים של הדמות (ה-GM מקבל עותק).',
      },
      auto_add_concentration_marker: {
        label: 'Auto Add Con. סַמָן',
        desc: 'הוסף את הסמן כאשר כישוף ריכוז מוטל מגיליון.',
        hint: 'D&D 5e 2014 (OGL) ו-2024 גיליונות.',
      },
      auto_roll_save: {
        label: 'שמירה אוטומטית של גליל',
        desc: 'גלגל את השמירה ברגע שאסימון ריכוז לוקח נזק. כשהתזכורת כבויה, יש לחצני Roll ו-Advantage.',
      },
      show_roll_button: {
        label: 'כפתור גלגול',
        desc: 'הוסף לחצני Roll ו-Advantage לתזכורת כאשר Auto Roll Save כבוי.',
      },
      end_at_zero: {
        label: 'מסתיים ב-0 HP',
        desc: 'סיים ריכוז ללא שמירה כאשר אסימון יורד ל-0 נקודות פגיעה.',
      },
      bonus_attribute: {
        label: 'תכונת בונוס',
        desc: 'תכונת הגיליון שנוספה לריכוז חוסכת. constitution_save_mod עובד על גיליונות D&D 5e 2014 ו-2024.',
      },
      debug: {
        label: 'מצב ניפוי באגים',
        desc: 'כתוב הערות לגבי זיהוי איות ושמירה בקונסולת ה-API, עבור בקשות תמיכה.',
      },
      support_mode: {
        label: 'מצב תמיכה',
        desc: 'כמה מצב Debug כותב: בסיסי (קצר) או מפורט.',
      },
    },
    help: {
      menu: 'עם שום דבר לא נבחר (GM): פתח את ההגדרות. עם אסימונים נבחרים: ריכוז התחלה או סוף.',
      toggle:
        'התחל להתרכז בלחש עם האסימונים שנבחרו. תן שם לחש אחר למעבר; להפעיל אותו שוב כדי להסתיים.',
      end: 'ריכוז סיום עבור האסימונים שנבחרו.',
      status: 'רשום מי מתרכז, עם כפתורי סיום.',
      config: 'שנה הגדרה, למשל config auto_roll_save|false.',
      advantageMenu: 'בחר אילו דמויות ריכוז גליל חוסך ביתרון.',
      toggleAdvantage: 'הפעל או כבה יתרון עבור דמות אחת.',
      roll: 'גלגל שמירה מהלחצן Roll או Advantage של תזכורת.',
      journal: 'בנה מחדש את דפי העזרה והפקודה.',
      reset: 'החזר כל הגדרה לברירת המחדל שלה.',
      help: 'הצג רשימה זו.',
      footer: 'ההנחיות המלאות נמצאות בדף "{help}"; הלחצנים נמצאים בתוסף "{deck}".',
      playerFooter: 'בחר תחילה את האסימון שלך.',
    },
    errors: {
      noSelection: 'תחילה בחר אסימון.',
      notYours: 'אתה יכול לשנות את הריכוז רק עבור אסימונים שאתה שולט בהם.',
      gmOnly: 'רק ה-GM יכול להשתמש בפקודה הזו.',
      notConcentrating: 'האסימון הזה לא מתרכז.',
      unknownSetting: 'אין הגדרה בשם "{key}".',
      badSettingValue: '"{value}" אינו ערך חוקי עבור {key}.',
      rollExpired: 'פג תוקף הכפתור הזה.',
      unknownCharacter: 'הדמות הזו כבר לא קיימת.',
      internal: 'משהו השתבש. למסוף ה-API יש את הפרטים.',
    },
    hints: {
      noSelection: 'בחר את האסימון של הגלגל, ולאחר מכן הפעל את הפקודה שוב.',
      rollExpired: 'הכפתורים פועלים פעם אחת ולמשך 10 דקות. פגום שוב את האסימון עבור אחד חדש.',
      unknownSetting: 'הקלד את הפקודה בלי לבחור כלום כדי לראות את ההגדרות.',
    },
    warnings: {
      unknownMarker: 'סמן הסטטוס "{marker}" אינו אחד מהסמנים של המשחק הזה. בחר אחר בהגדרות.',
    },
    deck: {
      subtitle: 'סיפון פיקוד',
      selected: 'אסימונים נבחרים',
      selectedDesc: 'תחילה בחר את האסימון של הגלגל.',
      table: 'השולחן',
      tableDesc: 'ראה מי מתרכז, ולמי יש יתרון בהצלות שלו.',
      tools: 'כְּלֵי עֲבוֹדָה',
      toolsDesc: 'הגדרות, רשימת הפקודות והדפים.',
      footer: 'ההנחיות המלאות נמצאות בדף "{help}".',
    },
    handout: {
      versionLabel: 'גִרְסָה',
      subtitle: 'סמני ריכוז, תזכורות ושמירה עבור D&D 5e',
      overview: {
        heading: 'סקירה כללית',
        body: 'ריכוז עוקב אחר מי מתרכז באיזה כישוף. זה שם סמן על האסימון של המטיל, מגלגל (או מבקש) שמירה על חוקה כאשר האסימון הזה גוזל נזק, ואומר לטבלה מתי הריכוז מסתיים.',
      },
      quickStart: {
        heading: 'התחלה מהירה',
        steps: [
          'בחר את האסימון של המטיל והקלד !ריכוז ואחריו הלחש, למשל !ריכוז ברך.',
          'שנה את נקודות הפגיעה של האסימון בבועת הבר שלו. שמירה מתגלגלת ב-DC 10, או חצי מהנזק אם זה גבוה יותר.',
          'הפעל שוב את אותה פקודה, או הסר את הסמן, כדי לסיים את הריכוז.',
          'הקלד !concentration עם שום דבר לא נבחר כדי לפתוח את ההגדרות.',
        ],
      },
      concentrating: {
        heading: 'מתרכז',
        points: [
          'מתן שם של לחש אחר מחליף אליו את הריכוז, כפי שהטלת לחש ריכוז חדש עושה.',
          'הנחת הסמן על אסימון ביד מתחילה ריכוז ללא כישוף; הסרתו, או מחיקת האסימון, מסיימת אותו.',
          'אסימון מקושר חדש של דמות מרוכזת מקבל את הסמן, ועוקב אחר אסימון מודבק הנושא את הסמן.',
          'אסימונים של דמות אחת עם סרגל נקודות פגיעה מקושר שיתוף ריכוז. אסימונים לא מקושרים, כמו חבילת גובלינים מגיליון אחד, מתרכזים בעצמם.',
          'כולם רואים הודעה כאשר הריכוז מתחיל, עובר או מסתיים, אלא אם כן שלח תזכורת אל אומר אחרת.',
        ],
      },
      saves: {
        heading: 'ריכוז חוסך',
        points: [
          'ה-DC הוא 10 או מחצית מהנזק שנגרם, הגבוה מביניהם, עד DC 30.',
          'השינוי מגיע מתכונת הבונוס על הגיליון של הדמות; ערך חסר נחשב כ-0.',
          'רול אוטומטי שמור לחמניות בבת אחת. כאשר היא כבויה, לתזכורת יש כפתורי Roll ו-Advantage עבור הנגן או ה-GM.',
          'שמירה כושלת מסיימת את הריכוז. כאשר סוף ב-0 HP פועל, ירידה ל-0 נקודות פגיעה מסיימת אותו ללא שמירה.',
          'תפריט Advantage נותן יתרון אופי בשמירה אוטומטית, כפי שעושה הישג ה-War Caster.',
        ],
      },
      automatic: {
        heading: 'כישופים שהוטלו מגיליון',
        points: [
          'עם Auto Add Con. מרקר על, הטלת כישוף ריכוז מגיליון D&D 5e 2014 (OGL) או 2024 מוסיפה את הסמן.',
          'האסימונים של המטיל בעמוד שבו הם צופים מסומנים; אם אין כאלה, אסימונים בכל דף כן.',
          'רק קלפים מה-GM, ממוד אחר או אחד משחקני הדמות נחשבים. הטלת אותו כישוף שוב לא משנה דבר.',
          'כרטיס D&D 2024 שמזכיר רק ריכוז בטקסט שלו, כמו הישג ה-War Caster, יכול להתחיל ריכוז אבל לעולם לא מחליף לחש.',
          'גיליונות D&D 2024 עשויים להזדקק לשרת ה-API הניסיוני. הפעל את מצב ניפוי באגים כדי לראות מדוע זוהה או לא זוהה כישוף.',
        ],
      },
      players: {
        heading: 'שחקנים',
        points: [
          'שחקנים יכולים להתחיל ולסיים ריכוז עבור אסימונים שהם שולטים בהם, ולהשתמש בכפתורי Roll ו-Advantage בשמירה שלהם.',
          'עם שלח תזכורת כדי להגדיר לדמות, הודעות נלחשות לשחקני הדמות ול-GM.',
        ],
      },
      commands: {
        heading: 'פקודות',
        intro: 'מודים אחרים, כגון ScriptCards, יכולים לשלוח גם פקודות אלה.',
        colCommand: 'פְּקוּדָה',
        colDesc: 'מה זה עושה',
      },
      settings: {
        heading: 'הגדרות',
        intro:
          'שנה הגדרות באמצעות הכפתורים בכרטיס ההגדרות, או עם תצורה <key>|<value>. חלקם יכולים גם להיות מוגדרים בדף של המוד.',
        colKey: 'מַפְתֵחַ',
        colName: 'שֵׁם',
        colDesc: 'מה זה עושה',
      },
      upgrading: {
        heading: 'משדרג מגרסה 1.0',
        points: [
          'ההגדרות, רשימת היתרונות וכל פקודה ממשיכים לעבוד.',
          'הודעות עכשיו אומרות מתי הריכוז מסתיים, ובאיזה לחש.',
          'אסימונים שכבר נושאים את הסמן נאספים בעת ההפעלה.',
        ],
      },
      troubleshooting: {
        heading: 'פתרון בעיות',
        points: [
          'אין שמירה כאשר נקודות הפגיעה יורדות: בדוק שלאסימון יש את הסמן וש-HP Bar הוא הסרגל ששינית. שינויים שבוצעו על ידי מודים אחרים דרך ה-API לא מעלים אירועים, ולכן הם לא נראים.',
          'השינוי הוא 0: בדוק את תכונת הבונוס מול הגיליון של הדמות.',
          'קסמים שהוטלו מהגיליון אינם מזוהים: הפעל את מצב ניפוי באגים, הטיל את הלחש שוב וקרא את מסוף ה-API.',
          'שתי תווים חולקים שם: זיהוי משתמש בהתאמה הראשונה. תן לדמויות שמות ייחודיים.',
        ],
      },
      languages: {
        heading: 'שפות',
        body: 'ריכוז מתורגם לשפות למטה. בחר אחד עם הגדרת השפה.',
        colCode: 'קוד',
        colName: 'שָׂפָה',
        colNative: 'שם יליד',
      },
      credits: {
        heading: 'קרדיטים',
        original: 'מוד מקורי מאת',
        maintainer: 'מתוחזק על ידי',
        support: 'דווח על באגים ורעיונות בפורום Roll20 Mod או ב-GitHub.',
      },
      footer: 'הלחצנים לכל פעולה נמצאים בדף "{deck}".',
    },
  };

  const TRANSLATION$b = {
    titles: {
      ready: 'A koncentráció készen áll.',
      menu: 'Koncentráció beállításai',
      help: 'Koncentrációs parancsok',
      status: 'Aki Koncentrál',
      advantage: 'Koncentráció-megtakarítás',
      reset: 'Koncentráció visszaállítása',
      concentration: 'Koncentráció',
      save: 'Koncentráció Mentés',
      check: 'Koncentráció ellenőrzése',
    },
    messages: {
      migrated:
        'Frissítve az 1.0-s verzióról. A beállítások és az előnyök listája megmaradt, és a régi makrók továbbra is működnek.',
      reconciled:
        'Utolérte a térképet: koncentráló tokenek találhatók {added}, régi bejegyzések eltávolítva {dropped}.',
      readyHint:
        'A beállításokhoz írja be: {command}, vagy nyissa meg a Command Deck tájékoztatót.',
      settingChanged: '{setting} mostantól {value}.',
      confirmReset:
        'Minden beállítást visszaállít az alapértelmezettre, és törli az előnyök listáját? A koncentrációjelzők a térképen maradnak.',
      reset: 'A beállítások visszaállnak az alapértelmezett értékekre.',
      journal: 'Átépített tájékoztatók: {help} és {deck}.',
    },
    notices: {
      started: '{name} most a következőre koncentrál: {spell}.',
      startedNoSpell: '{name} most koncentrál.',
      switched: '{name} már nem a {old}-ra koncentrál, és most a {spell}-ra koncentrál.',
      switchedNoSpell: '{name} most koncentrál.',
      ended: '{name} már nem a {spell}-ra koncentrál.',
      endedNoSpell: '{name} már nem koncentrál.',
      lost: '{name} elveszti a koncentrációt a {spell}-ra.',
      lostNoSpell: '{name} elveszti a koncentrációt.',
      kept: '{name} továbbra is a {spell}-ra koncentrál.',
      keptNoSpell: '{name} folyamatosan koncentrál.',
      zeroHp: '{name} 0 életpontra esik, és elveszíti a koncentrációját a {spell}-ra.',
      zeroHpNoSpell: '{name} 0 életpontra esik, és elveszti a koncentrációt.',
      checkNeeded:
        '{name} Alkotmánymentő dobást kell tennie, hogy továbbra is koncentrálhasson: {dc}.',
    },
    save: {
      dc: 'DC',
      dcValue: 'DC {dc}',
      modifier: 'Módosító',
      roll: 'Tekercs',
      advantageRoll: '{first} és {second} (előny)',
      success: 'Siker',
      failure: 'Hiba',
    },
    menu: {
      concentratingCount: 'Most koncentrál: {count}',
      settings: 'Beállítások elemre',
      footer:
        'Írja be a következőt: {command}, hogy visszatérjen ide. Minden gomb a „{deck}” tájékoztatóban is megtalálható.',
    },
    status: {
      none: 'Senki sem koncentrál.',
    },
    advantage: {
      intro:
        'Az On-ra beállított karakterek koncentrációjuk előnnyel ment, mint a War Caster feat esetében. Ez az automatikus mentésekre vonatkozik.',
      none: 'Ebben a játékban nincsenek karakterek.',
    },
    buttons: {
      roll: 'Tekercs',
      advantage: 'Előny',
      status: 'Állapot',
      advantageMenu: 'Előny menü',
      help: 'Segítség',
      reset: 'Reset',
      confirmReset: 'Beállítások visszaállítása',
      end: 'Vége',
      menu: 'Menü',
      concentrate: 'Koncentrálj a…',
      toggle: 'Váltás',
      journal: 'Rebuild Handouts',
    },
    prompts: {
      spell: 'Varázslat',
    },
    values: {
      on: 'On',
      off: 'Le',
      bar: 'Bar {bar}',
      unnamed: 'Névtelen',
      sendTo: {
        everyone: 'Mindenki',
        character: 'Karakter',
        gm: 'GM',
      },
      supportMode: {
        basic: 'Alapvető',
        detailed: 'Részletes',
      },
    },
    settings: {
      language: {
        label: 'Nyelv',
        desc: 'A csevegőüzenetek és tájékoztatók nyelve.',
      },
      command: {
        label: 'Parancs',
        desc: 'A chat parancs, a "!" nélkül. Az 1.0-s verzió makrók koncentrációt használnak.',
      },
      statusmarker: {
        label: 'Állapotjelző',
        desc: 'A token marker, amely a koncentrációt mutatja. Egyéni token markerek használhatók.',
      },
      bar: {
        label: 'HP bár',
        desc: 'Az elütési pontokat tároló jelzősáv. Károsodása koncentrációs mentést igényel.',
      },
      send_reminder_to: {
        label: 'Emlékeztető küldése a címre',
        desc: 'Aki látja a koncentrációs üzeneteket és menti: mindenki, a GM vagy a karakter játékosai (a GM kap egy példányt).',
      },
      auto_add_concentration_marker: {
        label: 'Auto Add Con. Jelző',
        desc: 'Adja hozzá a jelölőt, amikor koncentrációs varázslatot vet ki egy lapról.',
        hint: 'D&D 5e 2014 (OGL) és 2024 lapok.',
      },
      auto_roll_save: {
        label: 'Automatikus tekercsmentés',
        desc: 'Dobd a mentést, amint egy koncentráló jelző sebzést szenved. Ha ki van kapcsolva, az emlékeztetőn Roll és Advantage gombok találhatók.',
      },
      show_roll_button: {
        label: 'Roll gomb',
        desc: 'Adja hozzá a Roll és Advantage gombokat az emlékeztetőhöz, ha az Automatikus tekercsmentés ki van kapcsolva.',
      },
      end_at_zero: {
        label: 'Vége 0 HP-nál',
        desc: 'Fejezze be a koncentrációt mentés nélkül, amikor egy token 0 életpontra esik.',
      },
      bonus_attribute: {
        label: 'Bónusz attribútum',
        desc: 'A koncentráció mentéshez hozzáadott lapattribútum. A constitution_save_mod a D&D 5e 2014 és 2024 lapokon működik.',
      },
      debug: {
        label: 'Hibakeresési mód',
        desc: 'Írjon megjegyzéseket a helyesírás-észlelésről és a mentésekről az API-konzolra támogatási kérésekhez.',
      },
      support_mode: {
        label: 'Támogatási mód',
        desc: 'Mennyit ír a Debug Mode: Basic (rövid) vagy Detailed.',
      },
    },
    help: {
      menu: 'Nincs kiválasztva (GM): nyissa meg a beállításokat. Kiválasztott jelzőkkel: kezdő vagy végkoncentráció.',
      toggle:
        'Kezdj el egy varázslatra koncentrálni a kiválasztott jelzőkkel. A váltáshoz nevezzen el egy másik varázslatot; futtassa újra a végére.',
      end: 'Végkoncentráció a kiválasztott tokenekhez.',
      status: 'Listázza ki, aki koncentrál, a Vége gombokkal.',
      config: 'Módosítson egy beállítást, például config auto_roll_save|false.',
      advantageMenu: 'Válassza ki, mely karakterek dobáskoncentrációja takarít meg előnyt.',
      toggleAdvantage: 'Kapcsolja be vagy ki az előnyt egy karakterhez.',
      roll: 'Mentsen egy emlékeztető Roll vagy Advantage gombjával.',
      journal: 'Építse újra a Help és Command Deck segédanyagait.',
      reset: 'Állítson vissza minden beállítást az alapértelmezettre.',
      help: 'Mutasd ezt a listát.',
      footer:
        'A teljes utasítás a "{help}" tájékoztatóban található; gombok a "{deck}" tájékoztatóban találhatók.',
      playerFooter: 'Először válassza ki a tokent.',
    },
    errors: {
      noSelection: 'Először válasszon ki egy tokent.',
      notYours: 'Csak az általad irányított tokenek koncentrációját módosíthatod.',
      gmOnly: 'Csak a GM használhatja ezt a parancsot.',
      notConcentrating: 'Ez a jelző nem koncentrál.',
      unknownSetting: 'Nincs "{key}" nevű beállítás.',
      badSettingValue: 'A „{value}” nem érvényes érték a következőhöz: {key}.',
      rollExpired: 'Ez a gomb lejárt.',
      unknownCharacter: 'Ez a karakter már nem létezik.',
      internal: 'Valami elromlott. Az API-konzol tartalmazza a részleteket.',
    },
    hints: {
      noSelection: 'Válassza ki a görgő tokent, majd futtassa újra a parancsot.',
      rollExpired: 'A gombok egyszer és 10 percig működnek. Sérítse meg újra a tokent egy újért.',
      unknownSetting:
        'A beállítások megtekintéséhez írja be a parancsot úgy, hogy nincs kiválasztva.',
    },
    warnings: {
      unknownMarker:
        'A „{marker}” állapotjelző nem tartozik a játék jelzői közé. Válasszon másikat a beállításokban.',
    },
    deck: {
      subtitle: 'Command Deck',
      selected: 'Kiválasztott tokenek',
      selectedDesc: 'Először válassza ki a görgő tokent.',
      table: 'A táblázat',
      tableDesc: 'Nézze meg, ki koncentrál, és kinek van előnye a mentésekben.',
      tools: 'Eszközök',
      toolsDesc: 'Beállítások, parancslista és segédanyagok.',
      footer: 'A teljes utasítás a „{help}” tájékoztatóban található.',
    },
    handout: {
      versionLabel: 'Változat',
      subtitle: 'Koncentrációjelzők, emlékeztetők és mentések a D&D 5e számára',
      overview: {
        heading: 'Áttekintés',
        body: 'A koncentráció nyomon követi, hogy ki melyik varázslatra koncentrál. Jelzőt tesz a dobó jelzőjére, eldob (vagy kér) egy Alkotmányt, kivéve, ha a jelző sebzést szenved, és közli az asztallal, ha a koncentráció véget ér.',
      },
      quickStart: {
        heading: 'Gyors kezdés',
        steps: [
          'Válassza ki a görgő tokent, és írja be a !concentration szót, majd a varázslatot, például !concentration Bless.',
          'Módosítsa a token elütési pontjait a sávbuborékban. A mentést DC 10-nél dobják, vagy a sebzés felénél, ha ez magasabb.',
          'Futtassa újra ugyanazt a parancsot, vagy vegye le a jelölőt a koncentráció befejezéséhez.',
          'A beállítások megnyitásához írja be a !concentration parancsot úgy, hogy nincs kiválasztva.',
        ],
      },
      concentrating: {
        heading: 'Koncentrálva',
        points: [
          'Egy másik varázslat elnevezése átkapcsolja a koncentrációt, akárcsak egy új koncentrációs varázslat varázslása.',
          'A marker kézzel történő felhelyezése varázslat nélkül elindítja a koncentrációt; levétele vagy a token törlése véget ér.',
          'Egy koncentráló karakter új linkelt tokenje megkapja a jelölőt, és a jelölőt hordozó beillesztett token nyomon követhető.',
          'Az egy karakterből álló tokenek egy kapcsolt találati sávval megosztják a koncentrációt. A nem összekapcsolt tokenek, például egy lapon lévő goblincsomag, magukra koncentrálnak.',
          'Mindenki lát üzenetet, amikor a koncentráció elkezdődik, átkapcsol vagy véget ér, hacsak az Emlékeztető küldése mást nem mond.',
        ],
      },
      saves: {
        heading: 'A koncentráció megment',
        points: [
          'A DC 10 vagy az elszenvedett sebzés fele, amelyik nagyobb, DC 30-ig.',
          'A módosító a karakter lapján található bónuszattribútumból származik; a hiányzó érték 0-nak számít.',
          'Automatikus tekercs A tekercsek mentése egyszerre. Ha ki van kapcsolva, az emlékeztetőn Roll és Advantage gombok találhatók a lejátszóhoz vagy a GM-hez.',
          'A sikertelen mentés véget vet a koncentrációnak. Ha az End at 0 HP be van kapcsolva, a 0 életpontra csökkenés mentés nélkül fejeződik be.',
          'Az Advantage Menu karakterelőnyt biztosít az automatikus mentéseknél, akárcsak a War Caster.',
        ],
      },
      automatic: {
        heading: 'Lapról varázsolt varázslatok',
        points: [
          'Auto Add Con. A jelölő bekapcsolása, a koncentrációs varázslat egy D&D 5e 2014 (OGL) vagy 2024 lapról hozzáadja a jelölőt.',
          'A görgők jelzői az általuk megtekintett oldalon meg vannak jelölve; ha nincsenek, akkor bármelyik oldalon lévő tokenek vannak.',
          'Csak a GM, egy másik mod vagy a karakter játékosainak kártyái számítanak. Ugyanannak a varázslatnak az ismételt leadása semmit sem változtat.',
          'Egy D&D 2024 kártya, amely csak a szövegében említi a koncentrációt, mint például a War Caster feat, elindíthatja a koncentrációt, de soha nem helyettesíti a varázslatot.',
          'A D&D 2024 lapokhoz szükség lehet a Kísérleti API-kiszolgálóra. Kapcsolja be a hibakeresési módot, hogy megtudja, miért észlelt vagy nem észlelt egy varázslatot.',
        ],
      },
      players: {
        heading: 'Játékosok',
        points: [
          'A játékosok elkezdhetik és befejezhetik a koncentrációt az általuk irányított jelzőkkel, és használhatják a Roll és az Advantage gombokat saját mentéseikhez.',
          'Az Emlékeztető küldése funkcióval Karakterre állítva az üzeneteket a rendszer suttogja a karakter játékosainak és a GM-nek.',
        ],
      },
      commands: {
        heading: 'Parancsok',
        intro: 'Más modok, például a ScriptCards is elküldhetik ezeket a parancsokat.',
        colCommand: 'Parancs',
        colDesc: 'Mit csinál',
      },
      settings: {
        heading: 'Beállítások elemre',
        intro:
          'Módosítsa a beállításokat a beállítási kártya gombjaival vagy a config <key>|<value> segítségével. Néhányat a Mod oldalán is be lehet állítani.',
        colKey: 'Kulcsfontosságú',
        colName: 'Név',
        colDesc: 'Mit csinál',
      },
      upgrading: {
        heading: 'Frissítés az 1.0-s verzióról',
        points: [
          'A beállítások, az előnylista és minden parancs továbbra is működik.',
          'Az üzenetek most azt mondják, hogy mikor ér véget a koncentráció, és melyik varázslatra.',
          'A jelzőt már hordozó tokeneket a rendszer indításkor veszi fel.',
        ],
      },
      troubleshooting: {
        heading: 'Hibaelhárítás',
        points: [
          'Nincs mentés, ha a találati pontok csökkennek: ellenőrizze, hogy a tokenben van-e a jelölő, és hogy a HP Bar az a sáv, amelyet megváltoztatott. Más Modok által az API-n keresztül végrehajtott módosítások nem okoznak eseményeket, így nem láthatók.',
          'A módosító 0: ellenőrizze a bónusz attribútumot a karakter lapjával.',
          'A lapról leadott varázslatok nem észlelhetők: kapcsolja be a hibakeresési módot, hajtsa végre újra a varázslatot, és olvassa el az API-konzolt.',
          'Két karakternek közös a neve: az észlelés az első egyezést használja. Adjon egyedi neveket a karaktereknek.',
        ],
      },
      languages: {
        heading: 'Nyelvek',
        body: 'A Concentration az alábbi nyelvekre van lefordítva. Válasszon egyet a Nyelv beállítással.',
        colCode: 'Kód',
        colName: 'Nyelv',
        colNative: 'Natív név',
      },
      credits: {
        heading: 'Kredit',
        original: 'Eredeti Mod by',
        maintainer: 'által karbantartott',
        support: 'Jelentse be a hibákat és ötleteket a Roll20 Mod fórumon vagy a GitHubon.',
      },
      footer: 'Minden művelet gombja a „{deck}” tájékoztatóban található.',
    },
  };

  const TRANSLATION$a = {
    titles: {
      ready: 'La concentrazione è pronta.',
      menu: 'Impostazioni di concentrazione',
      help: 'Comandi di concentrazione',
      status: 'Chi si sta concentrando',
      advantage: 'Vantaggio sui tiri salvezza sulla concentrazione',
      reset: 'Ripristina la concentrazione',
      concentration: 'Concentrazione',
      save: 'Salvataggio della concentrazione',
      check: 'Controllo della concentrazione',
    },
    messages: {
      migrated:
        "Aggiornato dalla versione 1.0. Le tue impostazioni e l'elenco dei vantaggi sono stati mantenuti e le tue vecchie macro funzionano ancora.",
      reconciled:
        'Intrappolato nella mappa: concentrazione dei gettoni trovati {added}, vecchie voci rimosse {dropped}.',
      readyHint: 'Digita {command} per le impostazioni o apri il volantino del mazzo di comandi.',
      settingChanged: '{setting} ora è {value}.',
      confirmReset:
        "Riportare tutte le impostazioni ai valori predefiniti e cancellare l'elenco dei vantaggi? Gli indicatori di concentrazione sulla mappa rimangono.",
      reset: 'Le impostazioni vengono riportate ai valori predefiniti.',
      journal: 'Schede ricostruite: {help} e {deck}.',
    },
    notices: {
      started: '{name} ora si sta concentrando su {spell}.',
      startedNoSpell: '{name} ora si sta concentrando.',
      switched: '{name} smette di concentrarsi su {old} e ora si concentra su {spell}.',
      switchedNoSpell: '{name} ora si sta concentrando.',
      ended: '{name} non si concentra più su {spell}.',
      endedNoSpell: '{name} non si concentra più.',
      lost: '{name} perde la concentrazione su {spell}.',
      lostNoSpell: '{name} perde la concentrazione.',
      kept: '{name} continua a concentrarsi su {spell}.',
      keptNoSpell: '{name} continua a concentrarsi.',
      zeroHp: '{name} scende a 0 punti ferita e perde la concentrazione su {spell}.',
      zeroHpNoSpell: '{name} scende a 0 punti ferita e perde concentrazione.',
      checkNeeded:
        '{name} deve effettuare un tiro salvezza su Costituzione per continuare a concentrarsi: {dc}.',
    },
    save: {
      dc: 'DC',
      dcValue: 'CC {dc}',
      modifier: 'Modificatore',
      roll: 'Rotolo',
      advantageRoll: '{first} e {second} (vantaggio)',
      success: 'Successo',
      failure: 'Fallimento',
    },
    menu: {
      concentratingCount: 'Adesso mi concentro: {count}',
      settings: 'Impostazioni',
      footer:
        'Digita {command} per tornare qui. Ogni pulsante si trova anche nel volantino "{deck}".',
    },
    status: {
      none: 'Nessuno si sta concentrando.',
    },
    advantage: {
      intro:
        'I personaggi impostati sul tiro di concentrazione ottengono un vantaggio, come nel caso del talento Incantatore di Guerra. Questo vale per i salvataggi automatici.',
      none: 'Non ci sono personaggi in questo gioco.',
    },
    buttons: {
      roll: 'Rotolo',
      advantage: 'Vantaggio',
      status: 'Stato',
      advantageMenu: 'Menù vantaggi',
      help: 'Aiuto',
      reset: 'Reset',
      confirmReset: 'Ripristina impostazioni',
      end: 'FINE',
      menu: 'Menu',
      concentrate: 'Concentrati su…',
      toggle: 'Attiva/disattiva',
      journal: 'Ricostruisci le dispense',
    },
    prompts: {
      spell: 'Sillabare',
    },
    values: {
      on: 'SU',
      off: 'Spento',
      bar: 'Barra {bar}',
      unnamed: 'Senza nome',
      sendTo: {
        everyone: 'Tutti',
        character: 'Carattere',
        gm: 'GM',
      },
      supportMode: {
        basic: 'Di base',
        detailed: 'Dettagliato',
      },
    },
    settings: {
      language: {
        label: 'Lingua',
        desc: 'La lingua dei messaggi di chat e dei volantini.',
      },
      command: {
        label: 'Comando',
        desc: 'Il comando chat, senza il "!". Le macro della versione 1.0 utilizzano la concentrazione.',
      },
      statusmarker: {
        label: 'Indicatore di stato',
        desc: 'Il segnalino gettone che mostra la concentrazione. È possibile utilizzare marcatori di token personalizzati.',
      },
      bar: {
        label: 'Barra HP',
        desc: 'La barra dei gettoni che contiene i punti ferita. Il danno ad esso richiede un tiro salvezza sulla concentrazione.',
      },
      send_reminder_to: {
        label: 'Invia promemoria a',
        desc: 'Chi vede i messaggi di concentrazione e salva: tutti, il GM, o i giocatori del personaggio (il GM ne riceve una copia).',
      },
      auto_add_concentration_marker: {
        label: 'Aggiunta automatica cont. Marcatore',
        desc: 'Aggiungi il segnalino quando un incantesimo di concentrazione viene lanciato da un foglio.',
        hint: 'Fogli D&D 5e 2014 (OGL) e 2024.',
      },
      auto_roll_save: {
        label: 'Salvataggio automatico',
        desc: 'Effettua il tiro salvezza non appena un segnalino concentrazione subisce danni. Quando è disattivato, il promemoria dispone dei pulsanti Roll e Advantage.',
      },
      show_roll_button: {
        label: 'Pulsante Rotolo',
        desc: 'Aggiungi i pulsanti Roll e Advantage al promemoria quando il salvataggio automatico del roll è disattivato.',
      },
      end_at_zero: {
        label: 'Termina a 0 HP',
        desc: 'Termina la concentrazione senza effettuare un tiro salvezza quando un gettone scende a 0 punti ferita.',
      },
      bonus_attribute: {
        label: 'Attributo bonus',
        desc: "L'attributo del foglio aggiunto alla concentrazione viene salvato. constitution_save_mod funziona sui fogli D&D 5e 2014 e 2024.",
      },
      debug: {
        label: 'Modalità di debug',
        desc: "Scrivi note sul rilevamento dell'ortografia e sui salvataggi nella console API, per richieste di supporto.",
      },
      support_mode: {
        label: 'Modalità di supporto',
        desc: 'Quanto scrive la modalità Debug: Base (breve) o Dettagliata.',
      },
    },
    help: {
      menu: 'Con nulla selezionato (GM): aprire le impostazioni. Con gettoni selezionati: inizio o fine concentrazione.',
      toggle:
        'Inizia a concentrarti su un incantesimo con i gettoni selezionati. Assegna un nome a un incantesimo diverso da cambiare; eseguilo di nuovo per terminare.',
      end: 'Termina la concentrazione per i token selezionati.',
      status: 'Elenca chi si sta concentrando, con i pulsanti Fine.',
      config: "Modificare un'impostazione, ad esempio config auto_roll_save|false.",
      advantageMenu:
        'Scegli quali personaggi tirano il tiro salvezza sulla concentrazione con vantaggio.',
      toggleAdvantage: 'Attiva o disattiva il vantaggio per un personaggio.',
      roll: 'Effettua un salvataggio dal pulsante Tiro o Vantaggio di un promemoria.',
      journal: 'Ricostruisci le dispense del mazzo di aiuto e di comando.',
      reset: 'Riporta ogni impostazione ai valori predefiniti.',
      help: 'Mostra questo elenco.',
      footer:
        'Le istruzioni complete si trovano nel volantino "{help}"; i pulsanti si trovano nel volantino "{deck}".',
      playerFooter: 'Seleziona prima il tuo token.',
    },
    errors: {
      noSelection: 'Seleziona prima un token.',
      notYours: 'Puoi modificare la concentrazione solo per i segnalini che controlli.',
      gmOnly: 'Solo il GM può usare quel comando.',
      notConcentrating: 'Quel token non è concentrato.',
      unknownSetting: 'Non esiste alcuna impostazione chiamata "{key}".',
      badSettingValue: '"{value}" non è un valore valido per {key}.',
      rollExpired: 'Quel pulsante è scaduto.',
      unknownCharacter: 'Quel personaggio non esiste più.',
      internal: 'Qualcosa è andato storto. La console API contiene i dettagli.',
    },
    hints: {
      noSelection: "Seleziona il token dell'incantatore, quindi esegui nuovamente il comando.",
      rollExpired:
        'I pulsanti funzionano una volta e per 10 minuti. Danneggia nuovamente il token per ottenerne uno nuovo.',
      unknownSetting: 'Digita il comando senza selezionare nulla per visualizzare le impostazioni.',
    },
    warnings: {
      unknownMarker:
        'L\'indicatore di stato "{marker}" non è uno degli indicatori di questo gioco. Scegline un altro nelle impostazioni.',
    },
    deck: {
      subtitle: 'Mazzo di comando',
      selected: 'Gettoni selezionati',
      selectedDesc: "Seleziona prima il gettone dell'incantatore.",
      table: 'Il tavolo',
      tableDesc: 'Scopri chi si concentra e chi ha vantaggio nelle parate.',
      tools: 'Utensili',
      toolsDesc: "Impostazioni, l'elenco dei comandi e le dispense.",
      footer: 'Le istruzioni complete si trovano nel volantino "{help}".',
    },
    handout: {
      versionLabel: 'Versione',
      subtitle: 'Indicatori di concentrazione, promemoria e salvataggi per D&D 5e',
      overview: {
        heading: 'Panoramica',
        body: "La concentrazione tiene traccia di chi si sta concentrando su quale incantesimo. Mette un segnalino sul segnalino dell'incantatore, lancia (o richiede) un tiro salvezza sulla Costituzione quando quel segnalino subisce danni e indica alla tabella quando la concentrazione termina.",
      },
      quickStart: {
        heading: 'Avvio rapido',
        steps: [
          "Seleziona il gettone dell'incantatore e digita !concentrazione seguito dall'incantesimo, ad esempio !concentrazione Benedici.",
          'Cambia i punti ferita del gettone nella sua bolla della barra. Si effettua un tiro salvezza con CD 10, o metà del danno se questo è più alto.',
          'Esegui nuovamente lo stesso comando o rimuovi il segnalino per terminare la concentrazione.',
          'Digita !concentrazione senza nulla selezionato per aprire le impostazioni.',
        ],
      },
      concentrating: {
        heading: 'Concentrarsi',
        points: [
          'Dare un nome a un incantesimo diverso trasferisce la concentrazione su di esso, come fa lanciare un nuovo incantesimo di concentrazione.',
          'Mettendo manualmente il segnalino su un gettone si avvia la concentrazione senza incantesimo; toglierlo o eliminare il token lo termina.',
          'Un nuovo segnalino collegato di un personaggio che si concentra riceve il segnalino, e viene tracciato un segnalino incollato che porta il segnalino.',
          'I gettoni di un personaggio con una barra dei punti ferita collegata condividono la concentrazione. I segnalini non collegati, come un branco di goblin da un foglio, si concentrano da soli.',
          'Tutti vedono un messaggio quando la concentrazione inizia, cambia o finisce, a meno che Invia promemoria a non dica diversamente.',
        ],
      },
      saves: {
        heading: 'La concentrazione salva',
        points: [
          'La CD è pari a 10 o alla metà del danno subito, qualunque sia il valore più alto, fino a un massimo di CD 30.',
          'Il modificatore deriva dall’Attributo Bonus sulla scheda del personaggio; un valore mancante conta come 0.',
          'Rotolo automatico Salva i rotoli contemporaneamente. Quando è disattivato, il promemoria presenta i pulsanti Lancio e Vantaggio per il giocatore o il GM.',
          'Un tiro salvezza fallito pone fine alla concentrazione. Con End at 0 HP attivo, scendere a 0 punti ferita termina senza salvare.',
          'Il menu Vantaggio dà un vantaggio al personaggio sui salvataggi automatici, come fa il talento War Caster.',
        ],
      },
      automatic: {
        heading: 'Incantesimi lanciati da un foglio',
        points: [
          "Con aggiunta automatica Con. Indicatore attivo, lanciare un incantesimo di concentrazione da un foglio di D&D 5e 2014 (OGL) o 2024 aggiunge l'indicatore.",
          "I segnalini dell'incantatore sulla pagina che stanno visualizzando sono contrassegnati; se non ce ne sono, i token su qualsiasi pagina lo sono.",
          'Contano solo le carte del GM, di un altro Mod o di uno dei giocatori del personaggio. Lanciare nuovamente lo stesso incantesimo non cambia nulla.',
          'Una carta di D&D 2024 che menziona solo la concentrazione nel suo testo, come il talento Incantatore di Guerra, può avviare la concentrazione ma non sostituisce mai un incantesimo.',
          'I fogli di D&D 2024 potrebbero richiedere il server API sperimentale. Attiva la modalità Debug per vedere perché un incantesimo è stato o meno rilevato.',
        ],
      },
      players: {
        heading: 'Giocatori',
        points: [
          'I giocatori possono iniziare e terminare la concentrazione per i gettoni che controllano e utilizzare i pulsanti Lancio e Vantaggio nei propri salvataggi.',
          'Con Invia promemoria impostato su Personaggio, i messaggi vengono sussurrati ai giocatori del personaggio e al GM.',
        ],
      },
      commands: {
        heading: 'Comandi',
        intro: 'Anche altri Mod, come ScriptCards, possono inviare questi comandi.',
        colCommand: 'Comando',
        colDesc: 'Cosa fa',
      },
      settings: {
        heading: 'Impostazioni',
        intro:
          'Modificare le impostazioni con i pulsanti nella scheda delle impostazioni o con config <chiave>|<valore>. Alcuni possono anche essere impostati nella pagina del Mod.',
        colKey: 'Chiave',
        colName: 'Nome',
        colDesc: 'Cosa fa',
      },
      upgrading: {
        heading: 'Aggiornamento dalla versione 1.0',
        points: [
          "Le impostazioni, l'elenco dei vantaggi e ogni comando continuano a funzionare.",
          'I messaggi ora dicono quando termina la concentrazione e su quale incantesimo.',
          "I gettoni che già portano il segnalino vengono raccolti all'avvio.",
        ],
      },
      troubleshooting: {
        heading: 'Risoluzione dei problemi',
        points: [
          "Nessun salvataggio quando i punti ferita scendono: controlla che il gettone abbia il segnalino e che la Barra HP sia la barra che hai modificato. Le modifiche apportate da altri Mod tramite l'API non generano eventi, quindi non vengono visualizzate.",
          'Il modificatore è 0: controlla l’Attributo Bonus sulla scheda del personaggio.',
          "Gli incantesimi lanciati dal foglio non vengono rilevati: attiva la modalità Debug, lancia nuovamente l'incantesimo e leggi la console API.",
          'Due caratteri condividono un nome: il rilevamento utilizza la prima corrispondenza. Assegna nomi univoci ai personaggi.',
        ],
      },
      languages: {
        heading: 'Lingue',
        body: "La concentrazione è tradotta nelle lingue seguenti. Scegline uno con l'impostazione Lingua.",
        colCode: 'Codice',
        colName: 'Lingua',
        colNative: 'Nome nativo',
      },
      credits: {
        heading: 'Crediti',
        original: 'Mod originale di',
        maintainer: 'Mantenuto da',
        support: 'Segnala bug e idee sul forum Roll20 Mod o su GitHub.',
      },
      footer: 'I pulsanti per ogni azione si trovano nel volantino "{deck}".',
    },
  };

  const TRANSLATION$9 = {
    titles: {
      ready: '集中力の準備は完了です。',
      menu: '濃度設定',
      help: '集中コマンド',
      status: '集中しているのは誰ですか',
      advantage: '集中力セーブの利点',
      reset: '集中力のリセット',
      concentration: '集中',
      save: '集中セーブ',
      check: '集中力チェック',
    },
    messages: {
      migrated:
        'バージョン1.0からアップグレードしました。設定と利点のリストは保持され、古いマクロは引き続き機能します。',
      reconciled:
        'マップに追いつきました: 集中トークンが {added} で見つかり、古いエントリが {dropped} から削除されました。',
      readyHint: '設定として「{command}」と入力するか、配布資料のコマンドデッキを開いてください。',
      settingChanged: '{setting} は {value} になりました。',
      confirmReset:
        'すべての設定をデフォルトに戻し、利点リストをクリアしますか?地図上の濃度マーカーはそのまま残ります。',
      reset: '設定をデフォルトに戻します。',
      journal: '再構築された配布資料: {help} および {deck}。',
    },
    notices: {
      started: '{name} は現在、{spell} に集中しています。',
      startedNoSpell: '{name} は現在集中しています。',
      switched: '{name} は {old} に集中するのをやめ、現在は {spell} に集中しています。',
      switchedNoSpell: '{name} は現在集中しています。',
      ended: '{name} は {spell} に集中していません。',
      endedNoSpell: '{name} はもう集中していません。',
      lost: '{name} は {spell} への集中力を失います。',
      lostNoSpell: '{name} は集中力を失います。',
      kept: '{name} は {spell} に集中し続けます。',
      keptNoSpell: '{name} は集中し続けています。',
      zeroHp: '{name} はヒット ポイントが 0 に低下し、{spell} への集中力を失います。',
      zeroHpNoSpell: '{name} はヒット ポイントが 0 になり、集中力を失います。',
      checkNeeded:
        '{name} は集中力を維持するために憲法セーヴィング スローを行う必要があります: {dc}。',
    },
    save: {
      dc: '直流',
      dcValue: 'DC {dc}',
      modifier: '修飾子',
      roll: 'ロール',
      advantageRoll: '{first} および {second} (利点)',
      success: '成功',
      failure: '失敗',
    },
    menu: {
      concentratingCount: '現在集中中: {count}',
      settings: '設定',
      footer:
        'ここに戻るには、「{command}」と入力してください。すべてのボタンは配布資料「{deck}」にも記載されています。',
    },
    status: {
      none: '誰も集中していない。',
    },
    advantage: {
      intro:
        'オンに設定されたキャラクターは、ウォーキャスター特技と同様に、集中セーヴを有利にロールします。これは自動保存に適用されます。',
      none: 'このゲームにはキャラクターは存在しません。',
    },
    buttons: {
      roll: 'ロール',
      advantage: 'アドバンテージ',
      status: '状態',
      advantageMenu: 'アドバンテージメニュー',
      help: 'ヘルプ',
      reset: 'リセット',
      confirmReset: '設定をリセットする',
      end: '終わり',
      menu: 'メニュー',
      concentrate: '集中して…',
      toggle: 'トグル',
      journal: '配布資料を再構築する',
    },
    prompts: {
      spell: 'スペル',
    },
    values: {
      on: 'の上',
      off: 'オフ',
      bar: 'バー {bar}',
      unnamed: '無名',
      sendTo: {
        everyone: 'みんな',
        character: 'キャラクター',
        gm: 'GM',
      },
      supportMode: {
        basic: '基本',
        detailed: '詳細',
      },
    },
    settings: {
      language: {
        label: '言語',
        desc: 'チャット メッセージと配布資料の言語。',
      },
      command: {
        label: '指示',
        desc: '「!」のないチャット コマンド。バージョン 1.0 マクロは集中を使用します。',
      },
      statusmarker: {
        label: 'ステータスマーカー',
        desc: '集中力を示すトークンマーカー。カスタム トークン マーカーを使用できます。',
      },
      bar: {
        label: 'HPバー',
        desc: 'ヒットポイントを保持するトークンバー。それにダメージを与えるには集中力の節約が必要です。',
      },
      send_reminder_to: {
        label: 'リマインダーの送信先',
        desc: '集中メッセージを見て保存する人: 全員、GM、またはキャラクターのプレイヤー (GM がコピーを受け取ります)。',
      },
      auto_add_concentration_marker: {
        label: '自動追加コン。マーカー',
        desc: '集中呪文がシートからキャストされたときにマーカーを追加します。',
        hint: 'D&D 5e 2014 (OGL) および 2024 シート。',
      },
      auto_roll_save: {
        label: '自動ロール保存',
        desc: '集中トークンがダメージを受けるとすぐにセーブをロールします。オフの場合、リマインダーには [ロール] ボタンと [アドバンテージ] ボタンが表示されます。',
      },
      show_roll_button: {
        label: 'ロールボタン',
        desc: '自動ロール保存がオフの場合、ロールボタンとアドバンテージボタンをリマインダーに追加します。',
      },
      end_at_zero: {
        label: 'HP0で終了',
        desc: 'トークンがヒット ポイント 0 になった場合、セーブせずに集中を終了します。',
      },
      bonus_attribute: {
        label: 'ボーナス属性',
        desc: '集中保存にシート属性を追加しました。 constitution_save_mod は、D&D 5e 2014 および 2024 シートで動作します。',
      },
      debug: {
        label: 'デバッグモード',
        desc: 'サポート リクエスト用に、スペル検出に関するメモを作成し、API コンソールに保存します。',
      },
      support_mode: {
        label: 'サポートモード',
        desc: 'デバッグ モードで書き込む量: 基本 (短い) または詳細。',
      },
    },
    help: {
      menu: '何も選択されていない状態 (GM): 設定を開きます。トークンが選択されている場合: 集中を開始または終了します。',
      toggle:
        '選択したトークンを使用して呪文に集中し始めます。切り替える別の呪文に名前を付けます。もう一度実行して終了します。',
      end: '選択したトークンの集中を終了します。',
      status: '集中している人をリストし、終了ボタンを使用します。',
      config: '設定を変更します (例: config auto_roll_save|false)。',
      advantageMenu: 'どのキャラクターのロール集中が有利かを選択してください。',
      toggleAdvantage: '1 人のキャラクターのアドバンテージをオンまたはオフに切り替えます。',
      roll: 'リマインダーのロールまたはアドバンテージボタンから保存をロールします。',
      journal: 'ヘルプとコマンドデッキの配布資料を再構築します。',
      reset: 'すべての設定をデフォルトに戻します。',
      help: 'このリストを表示します。',
      footer:
        '完全な手順は配布資料「{help}」に記載されています。ボタンは配布資料「{deck}」にあります。',
      playerFooter: '最初にトークンを選択します。',
    },
    errors: {
      noSelection: '最初にトークンを選択します。',
      notYours: '濃度を変更できるのは、自分がコントロールするトークンの場合のみです。',
      gmOnly: 'そのコマンドを使用できるのは GM だけです。',
      notConcentrating: 'そのトークンは集中していません。',
      unknownSetting: '「{key}」という設定はありません。',
      badSettingValue: '「{value}」は、{key} の有効な値ではありません。',
      rollExpired: 'そのボタンの有効期限が切れています。',
      unknownCharacter: 'そのキャラクターはもう存在しません。',
      internal: '何か問題が発生しました。 API コンソールに詳細が記載されています。',
    },
    hints: {
      noSelection: 'キャスターのトークンを選択し、コマンドを再度実行します。',
      rollExpired:
        'ボタンは 1 回、10 分間機能します。トークンに再度ダメージを与えると、新しいトークンが得られます。',
      unknownSetting: '何も選択せずにコマンドを入力すると、設定が表示されます。',
    },
    warnings: {
      unknownMarker:
        'ステータス マーカー「{marker}」は、このゲームのマーカーではありません。設定で別のものを選択してください。',
    },
    deck: {
      subtitle: 'コマンドデッキ',
      selected: '選択されたトークン',
      selectedDesc: '最初に術者のトークンを選択します。',
      table: 'テーブル',
      tableDesc: '誰が集中しているか、誰がセーブで有利かを確認します。',
      tools: 'ツール',
      toolsDesc: '設定、コマンドリスト、配布資料。',
      footer: '完全な手順は配布資料「{help}」に記載されています。',
    },
    handout: {
      versionLabel: 'バージョン',
      subtitle: 'D&D 5e の集中マーカー、リマインダー、保存',
      overview: {
        heading: '概要',
        body: '集中力は、誰がどの呪文に集中しているかを追跡します。術者のトークンにマーカーを置き、そのトークンがダメージを受けたときに憲法セーブをロール（または要求）し、集中が終了したときにテーブルに通知します。',
      },
      quickStart: {
        heading: 'クイックスタート',
        steps: [
          '術者のトークンを選択し、「!concentration」と入力してから呪文を入力します (例:「!concentration Bless」)。',
          'バーバブル内のトークンのヒットポイントを変更します。セーブは難易度 10、またはそれが高い場合はダメージの半分でロールされます。',
          '同じコマンドを再度実行するか、マーカーを外して集中を終了します。',
          '何も選択せずに「!concentration」と入力して設定を開きます。',
        ],
      },
      concentrating: {
        heading: '集中中',
        points: [
          '別の呪文に名前を付けると、新しい集中呪文を唱えるのと同様に、集中がその呪文に切り替わります。',
          'トークンにマーカーを手で置くと、呪文なしで集中力が始まります。トークンを削除するか削除すると終了します。',
          '集中しているキャラクターの新しいリンクされたトークンがマーカーを取得し、マーカーを保持する貼り付けられたトークンが追跡されます。',
          'リンクされたヒット ポイント バーを持つ 1 人のキャラクターのトークンは集中力を共有します。 1 枚のシートからのゴブリンの群れなど、リンクされていないトークンは、それ自体に集中します。',
          '[リマインダーの送信先] に別の指示がない限り、集中の開始時、切り替え時、終了時にメッセージが全員に表示されます。',
        ],
      },
      saves: {
        heading: '集中力が節約できる',
        points: [
          '難易度は 10 または受けたダメージの半分のいずれか大きい方で、最大難易度は 30 です。',
          'モディファイアは、キャラクターのシート上のボーナス属性から取得されます。欠損値は 0 としてカウントされます。',
          '自動ロール ロールを一度に保存します。オフの場合、リマインダーにはプレーヤーまたは GM 用のロール ボタンとアドバンテージ ボタンが表示されます。',
          '保存に失敗すると集中力が終了します。 「HP 0 で終了」がオンの場合、ヒット ポイントが 0 になるとセーブせずに終了します。',
          'アドバンテージ メニューは、ウォー キャスターの特技と同様に、自動セーブでキャラクターにアドバンテージを与えます。',
        ],
      },
      automatic: {
        heading: 'シートから唱える呪文',
        points: [
          '自動追加コンあり。マーカーをオンにすると、D&D 5e 2014 (OGL) または 2024 シートから集中呪文を唱えるとマーカーが追加されます。',
          '閲覧しているページ上のキャスターのトークンにはマークが付けられます。何もない場合は、どのページにもトークンがあります。',
          'GM、別の Mod、またはキャラクターのプレイヤーのカードのみがカウントされます。同じ呪文をもう一度唱えても何も変わりません。',
          'ウォーキャスター特技など、テキストで集中力についてのみ言及している D&D 2024 カードは、集中力を開始できますが、呪文を置き換えることはできません。',
          'D&D 2024 シートには実験用 API サーバーが必要な場合があります。デバッグ モードをオンにして、呪文が検出された、または検出されなかった理由を確認します。',
        ],
      },
      players: {
        heading: '選手',
        points: [
          'プレイヤーは自分がコントロールするトークンの集中を開始および終了することができ、自分のセーブでロールボタンとアドバンテージボタンを使用できます。',
          '「リマインダーを送信」をキャラクターに設定すると、キャラクターのプレイヤーと GM にメッセージがささやかれます。',
        ],
      },
      commands: {
        heading: 'コマンド',
        intro: 'ScriptCard などの他の Mod もこれらのコマンドを送信できます。',
        colCommand: '指示',
        colDesc: '何をするのか',
      },
      settings: {
        heading: '設定',
        intro:
          '設定カードのボタンを使用するか、config <key>|<value> を使用して設定を変更します。一部は Mod のページでも設定できます。',
        colKey: '鍵',
        colName: '名前',
        colDesc: '何をするのか',
      },
      upgrading: {
        heading: 'バージョン1.0からのアップグレード',
        points: [
          '設定、利点リスト、およびすべてのコマンドは引き続き機能します。',
          'メッセージには、集中がいつ終了するか、どの呪文が終了するかが表示されるようになりました。',
          'すでにマーカーが付いているトークンは起動時に取得されます。',
        ],
      },
      troubleshooting: {
        heading: 'トラブルシューティング',
        points: [
          'ヒット ポイントが低下すると保存されません。トークンにマーカーがあること、および HP バーが変更したバーであることを確認してください。 API を介して他の Mod によって行われた変更はイベントを発生させないため、表示されません。',
          '修飾子は 0 です。キャラクターのシートに対してボーナス属性を確認します。',
          'シートから唱えた呪文は検出されません。デバッグ モードをオンにして、もう一度呪文を唱え、API コンソールを読み取ります。',
          '2 つの文字は名前を共有します。検出では最初の一致が使用されます。キャラクターに一意の名前を付けます。',
        ],
      },
      languages: {
        heading: '言語',
        body: '集中力は以下の言語に翻訳されています。言語設定でいずれかを選択します。',
        colCode: 'コード',
        colName: '言語',
        colNative: 'ネイティブネーム',
      },
      credits: {
        heading: 'クレジット',
        original: 'オリジナルModによる',
        maintainer: 'によって保守されています',
        support: 'バグやアイデアは Roll20 Mod フォーラムまたは GitHub で報告してください。',
      },
      footer: 'すべてのアクションのボタンは配布資料「{deck}」にあります。',
    },
  };

  const TRANSLATION$8 = {
    titles: {
      ready: '집중이 준비되었습니다.',
      menu: '농도 설정',
      help: '집중 명령',
      status: '누가 집중하고 있는가',
      advantage: '집중 저장에 대한 이점',
      reset: '집중력 재설정',
      concentration: '집중',
      save: '집중저장',
      check: '집중력체크',
    },
    messages: {
      migrated:
        '버전 1.0에서 업그레이드되었습니다. 귀하의 설정과 이점 목록은 그대로 유지되었으며 이전 매크로도 여전히 작동합니다.',
      reconciled:
        '지도를 따라잡았습니다. 집중 토큰이 {added}에서 발견되었으며, 이전 항목이 {dropped}에서 제거되었습니다.',
      readyHint: '설정에 {command}을 입력하거나 Command Deck 유인물을 엽니다.',
      settingChanged: '{setting}은(는) 이제 {value}입니다.',
      confirmReset:
        '모든 설정을 기본값으로 되돌리고 이점 목록을 삭제하시겠습니까? 지도의 집중 표시가 유지됩니다.',
      reset: '설정이 기본값으로 돌아갑니다.',
      journal: '유인물이 재구성되었습니다: {help} 및 {deck}.',
    },
    notices: {
      started: '{name}은(는) 현재 {spell}에 집중하고 있습니다.',
      startedNoSpell: '{name}은(는) 지금 집중 중입니다.',
      switched: '{name}은(는) {old}에 집중하는 것을 멈추고 이제 {spell}에 집중하고 있습니다.',
      switchedNoSpell: '{name}은(는) 지금 집중 중입니다.',
      ended: '{name}은(는) 더 이상 {spell}에 집중하지 않습니다.',
      endedNoSpell: '{name}은(는) 더 이상 집중하지 않습니다.',
      lost: '{name}은(는) {spell}에 대한 집중력을 잃습니다.',
      lostNoSpell: '{name}이(가) 집중력을 잃습니다.',
      kept: '{name}은(는) {spell}에 계속 집중하고 있습니다.',
      keptNoSpell: '{name}은(는) 계속 집중하고 있습니다.',
      zeroHp: '{name}은 체력이 0으로 떨어지고 {spell}에 대한 집중력을 잃습니다.',
      zeroHpNoSpell: '{name}의 체력이 0으로 떨어지고 집중력을 잃습니다.',
      checkNeeded: '{name}은(는) 계속 집중하기 위해 체질 내성 굴림을 해야 합니다: {dc}.',
    },
    save: {
      dc: 'DC',
      dcValue: 'DC {dc}',
      modifier: '수정자',
      roll: '연타',
      advantageRoll: '{first} 및 {second}(장점)',
      success: '성공',
      failure: '실패',
    },
    menu: {
      concentratingCount: '지금 집중 중: {count}',
      settings: '설정',
      footer: '여기로 돌아오려면 {command}을 입력하세요. 모든 버튼은 "{deck}" 유인물에도 있습니다.',
    },
    status: {
      none: '아무도 집중하지 않습니다.',
    },
    advantage: {
      intro:
        'On Roll로 설정된 캐릭터는 War Caster feat와 마찬가지로 집중력을 유리하게 저장합니다. 이는 자동 저장에 적용됩니다.',
      none: '이 게임에는 캐릭터가 없습니다.',
    },
    buttons: {
      roll: '연타',
      advantage: '이점',
      status: '상태',
      advantageMenu: '장점 메뉴',
      help: '돕다',
      reset: '다시 놓기',
      confirmReset: '설정 재설정',
      end: '끝',
      menu: '메뉴',
      concentrate: '집중하다…',
      toggle: '비녀장',
      journal: '유인물 다시 작성',
    },
    prompts: {
      spell: '주문',
    },
    values: {
      on: '~에',
      off: '끄다',
      bar: '바 {bar}',
      unnamed: '이름 없음',
      sendTo: {
        everyone: '모든 사람',
        character: '성격',
        gm: 'GM',
      },
      supportMode: {
        basic: '기초적인',
        detailed: '상세한',
      },
    },
    settings: {
      language: {
        label: '언어',
        desc: '채팅 메시지 및 유인물의 언어입니다.',
      },
      command: {
        label: '명령',
        desc: '"!"가 없는 채팅 명령입니다. 버전 1.0 매크로는 집중을 사용합니다.',
      },
      statusmarker: {
        label: '상태 마커',
        desc: '집중력을 나타내는 토큰 마커입니다. 사용자 정의 토큰 마커를 사용할 수 있습니다.',
      },
      bar: {
        label: 'HP 바',
        desc: '체력을 보유하는 토큰 바입니다. 손상을 입으면 집중 저장이 필요합니다.',
      },
      send_reminder_to: {
        label: '알림 보내기',
        desc: '집중 메시지를 보고 저장하는 사람: 모든 사람, GM 또는 캐릭터의 플레이어(GM이 사본을 얻습니다).',
      },
      auto_add_concentration_marker: {
        label: '자동 추가 연결 채점자',
        desc: '시트에서 집중 주문을 시전할 때 마커를 추가합니다.',
        hint: 'D&D 5e 2014(OGL) 및 2024 시트.',
      },
      auto_roll_save: {
        label: '자동 롤 저장',
        desc: '집중 토큰이 피해를 입는 즉시 저장을 굴립니다. 꺼져 있으면 알림에 Roll 및 Advantage 버튼이 있습니다.',
      },
      show_roll_button: {
        label: '롤 버튼',
        desc: '자동 롤 저장이 꺼진 경우 알림에 롤 및 이점 버튼을 추가합니다.',
      },
      end_at_zero: {
        label: '0HP에서 종료',
        desc: '토큰의 체력이 0으로 떨어지면 저장하지 않고 집중을 종료합니다.',
      },
      bonus_attribute: {
        label: '보너스 속성',
        desc: '집중에 추가된 시트 속성이 저장됩니다. Constitution_save_mod는 D&D 5e 2014 및 2024 시트에서 작동합니다.',
      },
      debug: {
        label: '디버그 모드',
        desc: '지원 요청을 위해 철자 감지에 대한 메모를 작성하고 API 콘솔에 저장합니다.',
      },
      support_mode: {
        label: '지원 모드',
        desc: '디버그 모드에서 쓰는 양: 기본(간단) 또는 상세.',
      },
    },
    help: {
      menu: '아무것도 선택하지 않은 상태(GM): 설정을 엽니다. 토큰을 선택한 경우: 집중 시작 또는 종료.',
      toggle:
        '선택한 토큰으로 주문에 집중하세요. 전환할 다른 주문의 이름을 지정하세요. 다시 실행하여 종료하세요.',
      end: '선택한 토큰에 대한 최종 집중입니다.',
      status: '집중하고 있는 사람을 종료 버튼으로 나열하세요.',
      config: '설정을 변경합니다(예: config auto_roll_save|false).',
      advantageMenu: '어떤 캐릭터의 롤 집중이 유리하게 저장되는지 선택하십시오.',
      toggleAdvantage: '한 캐릭터의 장점을 켜거나 끕니다.',
      roll: '미리 알림의 Roll 또는 Advantage 버튼에서 저장을 굴립니다.',
      journal: '도움말 및 명령 데크 유인물을 재구성합니다.',
      reset: '모든 설정을 기본값으로 되돌립니다.',
      help: '이 목록을 보여주세요.',
      footer: '전체 지침은 "{help}" 유인물에 있습니다. 버튼은 "{deck}" 유인물에 있습니다.',
      playerFooter: '먼저 토큰을 선택하세요.',
    },
    errors: {
      noSelection: '먼저 토큰을 선택하세요.',
      notYours: '당신이 조종하는 토큰의 농도만 변경할 수 있습니다.',
      gmOnly: 'GM만이 해당 명령을 사용할 수 있습니다.',
      notConcentrating: '그 토큰은 집중하고 있지 않습니다.',
      unknownSetting: '"{key}"이라는 설정이 없습니다.',
      badSettingValue: '"{value}"은(는) {key}에 유효한 값이 아닙니다.',
      rollExpired: '해당 버튼은 만료되었습니다.',
      unknownCharacter: '해당 캐릭터는 더 이상 존재하지 않습니다.',
      internal: '문제가 발생했습니다. API 콘솔에 세부정보가 있습니다.',
    },
    hints: {
      noSelection: '시전자의 토큰을 선택한 후 명령을 다시 실행하십시오.',
      rollExpired:
        '버튼은 한 번에 10분 동안 작동합니다. 새 토큰을 위해 토큰을 다시 손상시키십시오.',
      unknownSetting: '설정을 보려면 아무것도 선택하지 않고 명령을 입력하십시오.',
    },
    warnings: {
      unknownMarker:
        '상태 마커 "{marker}"은(는) 이 게임의 마커 중 하나가 아닙니다. 설정에서 다른 것을 선택하세요.',
    },
    deck: {
      subtitle: '커맨드 덱',
      selected: '선택된 토큰',
      selectedDesc: '시전자의 토큰을 먼저 선택하세요.',
      table: '테이블',
      tableDesc: '누가 집중하고 있는지, 누가 저장에 유리한지 확인하세요.',
      tools: '도구',
      toolsDesc: '설정, 명령 목록 및 유인물.',
      footer: '전체 지침은 "{help}" 유인물에 있습니다.',
    },
    handout: {
      versionLabel: '버전',
      subtitle: 'D&D 5e의 집중력 표시, 알림 및 저장',
      overview: {
        heading: '개요',
        body: '집중은 누가 어떤 주문에 집중하고 있는지 추적합니다. 시전자의 토큰에 마커를 놓고 해당 토큰이 피해를 입으면 건강 내성을 굴리고(또는 요청하고) 집중이 끝나면 테이블에 알립니다.',
      },
      quickStart: {
        heading: '빠른 시작',
        steps: [
          '시전자의 토큰을 선택하고 !concentration을 입력한 다음 주문을 입력합니다(예: !concentration Bless).',
          '막대 버블에서 토큰의 체력을 변경합니다. 세이브는 DC 10에서 굴리며, DC 10이 높으면 데미지의 절반입니다.',
          '집중을 종료하려면 동일한 명령을 다시 실행하거나 마커를 제거하세요.',
          '설정을 열려면 아무것도 선택하지 않은 상태에서 !concentration을 입력하세요.',
        ],
      },
      concentrating: {
        heading: '집중하다',
        points: [
          '새로운 집중 주문을 시전하는 것처럼 다른 주문의 이름을 지정하면 집중이 해당 주문으로 전환됩니다.',
          '손으로 토큰에 마커를 놓으면 주문 없이 집중이 시작됩니다. 떼어내거나 토큰을 삭제하면 종료됩니다.',
          '집중하는 캐릭터의 새로운 연결된 토큰이 마커를 가져오고, 마커를 운반하는 붙여넣은 토큰이 추적됩니다.',
          '연결된 체력 막대가 있는 한 캐릭터의 토큰은 집중을 공유합니다. 한 장의 고블린 무리와 같이 연결되지 않은 토큰은 자체적으로 집중됩니다.',
          'Send Reminder To(알림 보내기)가 달리 명시되지 않는 한 집중이 시작, 전환 또는 종료될 때 모든 사람이 메시지를 봅니다.',
        ],
      },
      saves: {
        heading: '집중력이 절약됩니다',
        points: [
          'DC는 10 또는 받은 피해의 절반 중 더 높은 값이며 최대 DC 30입니다.',
          '수정자는 캐릭터 시트의 보너스 속성에서 나옵니다. 누락된 값은 0으로 계산됩니다.',
          '자동 롤 저장 롤을 한 번에 저장합니다. 꺼져 있으면 알림에 플레이어나 GM을 위한 Roll 및 Advantage 버튼이 있습니다.',
          '저장에 실패하면 집중력이 종료됩니다. End at 0 HP를 켜면 체력이 0으로 떨어지면 세이브 없이 종료됩니다.',
          '장점 메뉴는 War Caster 업적과 마찬가지로 자동 저장 시 캐릭터 이점을 제공합니다.',
        ],
      },
      automatic: {
        heading: '시트에서 시전되는 주문',
        points: [
          '자동 추가 연결 포함. 마커를 켜면 D&D 5e 2014(OGL) 또는 2024 시트에서 집중 주문을 시전하면 마커가 추가됩니다.',
          '보고 있는 페이지에 시전자의 토큰이 표시됩니다. 토큰이 없으면 모든 페이지에 토큰이 있습니다.',
          'GM, 다른 모드 또는 캐릭터 플레이어 중 한 명의 카드만 계산됩니다. 같은 주문을 다시 시전해도 아무런 변화가 없습니다.',
          'War Caster 업적과 같이 텍스트에서 집중만 언급하는 D&D 2024 카드는 집중을 시작할 수 있지만 주문을 대체할 수는 없습니다.',
          'D&D 2024 시트에는 실험적 API 서버가 필요할 수 있습니다. 디버그 모드를 켜서 주문이 감지되거나 감지되지 않은 이유를 확인하세요.',
        ],
      },
      players: {
        heading: '플레이어',
        points: [
          '플레이어는 자신이 제어하는 ​​토큰에 대해 집중을 시작하고 종료할 수 있으며, 자신의 저장 시 Roll 및 Advantage 버튼을 사용할 수 있습니다.',
          '알림 보내기를 사용하면 캐릭터로 설정하면 해당 캐릭터의 플레이어와 GM에게 메시지가 귓속말로 전달됩니다.',
        ],
      },
      commands: {
        heading: '명령',
        intro: 'ScriptCard와 같은 다른 Mod도 이러한 명령을 보낼 수 있습니다.',
        colCommand: '명령',
        colDesc: '기능',
      },
      settings: {
        heading: '설정',
        intro:
          '설정 카드의 버튼을 사용하거나 config <key>|<value>를 사용하여 설정을 변경합니다. 일부는 Mod 페이지에서 설정할 수도 있습니다.',
        colKey: '열쇠',
        colName: '이름',
        colDesc: '기능',
      },
      upgrading: {
        heading: '버전 1.0에서 업그레이드',
        points: [
          '설정, 이점 목록 및 모든 명령이 계속 작동합니다.',
          '이제 집중이 언제 끝나는지, 어떤 주문이 ​​적용되는지 메시지가 표시됩니다.',
          '이미 마커가 있는 토큰은 시작 시 선택됩니다.',
        ],
      },
      troubleshooting: {
        heading: '문제 해결',
        points: [
          '체력이 떨어지면 저장되지 않습니다. 토큰에 마커가 있고 HP 바가 변경한 바인지 확인하세요. API를 통해 다른 Mod에 의해 변경된 사항은 이벤트를 발생시키지 않으므로 표시되지 않습니다.',
          '수정자는 0입니다. 캐릭터 시트와 비교하여 보너스 속성을 확인하세요.',
          '시트에서 시전된 주문은 감지되지 않습니다. 디버그 모드를 켜고 다시 주문을 시전한 후 API 콘솔을 읽으세요.',
          '두 문자가 이름을 공유합니다. 감지에서는 첫 번째 일치 항목을 사용합니다. 캐릭터에게 고유한 이름을 부여하세요.',
        ],
      },
      languages: {
        heading: '언어',
        body: '농도는 아래 언어로 번역됩니다. 언어 설정이 있는 것을 선택하세요.',
        colCode: '암호',
        colName: '언어',
        colNative: '본명',
      },
      credits: {
        heading: '크레딧',
        original: '원본 모드 작성자:',
        maintainer: '유지관리자',
        support: 'Roll20 Mod 포럼이나 GitHub에 버그와 아이디어를 보고하세요.',
      },
      footer: '모든 작업에 대한 버튼은 "{deck}" 유인물에 있습니다.',
    },
  };

  const TRANSLATION$7 = {
    titles: {
      ready: 'Koncentracja gotowa.',
      menu: 'Ustawienia stężenia',
      help: 'Polecenia koncentracji',
      status: 'Kto się koncentruje',
      advantage: 'Zaleta oszczędzania koncentracji',
      reset: 'Zresetuj koncentrację',
      concentration: 'Stężenie',
      save: 'Oszczędność koncentracji',
      check: 'Kontrola koncentracji',
    },
    messages: {
      migrated:
        'Aktualizacja z wersji 1.0. Twoje ustawienia i lista zalet zostały zachowane, a stare makra nadal działają.',
      reconciled:
        'Dogoniony z mapą: znaleziono koncentrację tokenów {added}, usunięto stare wpisy {dropped}.',
      readyHint:
        'Wpisz {command}, aby wyświetlić ustawienia, lub otwórz ulotkę dotyczącą talii poleceń.',
      settingChanged: '{setting} to teraz {value}.',
      confirmReset:
        'Przywrócić wszystkie ustawienia do wartości domyślnych i wyczyścić listę zalet? Znaczniki koncentracji na mapie pozostają.',
      reset: 'Ustawienia przywrócone do wartości domyślnych.',
      journal: 'Przebudowano materiały informacyjne: {help} i {deck}.',
    },
    notices: {
      started: '{name} koncentruje się teraz na {spell}.',
      startedNoSpell: '{name} jest teraz skoncentrowany.',
      switched: '{name} przestaje koncentrować się na {old} i koncentruje się teraz na {spell}.',
      switchedNoSpell: '{name} jest teraz skoncentrowany.',
      ended: '{name} nie koncentruje się już na {spell}.',
      endedNoSpell: '{name} nie jest już skoncentrowany.',
      lost: '{name} traci koncentrację na {spell}.',
      lostNoSpell: '{name} traci koncentrację.',
      kept: '{name} cały czas koncentruje się na {spell}.',
      keptNoSpell: '{name} ciągle się koncentruje.',
      zeroHp: '{name} spada do 0 punktów wytrzymałości i traci koncentrację na {spell}.',
      zeroHpNoSpell: '{name} spada do 0 punktów wytrzymałości i traci koncentrację.',
      checkNeeded: '{name} musi wykonać rzut obronny na Kondycję, aby zachować koncentrację: {dc}.',
    },
    save: {
      dc: 'DC',
      dcValue: 'DC {dc}',
      modifier: 'Modyfikator',
      roll: 'Rolka',
      advantageRoll: '{first} i {second} (zaleta)',
      success: 'Sukces',
      failure: 'Awaria',
    },
    menu: {
      concentratingCount: 'Koncentruję się teraz: {count}',
      settings: 'Ustawienia',
      footer:
        'Wpisz {command}, aby tu wrócić. Każdy przycisk znajduje się także w ulotce „{deck}”.',
    },
    status: {
      none: 'Nikt się nie koncentruje.',
    },
    advantage: {
      intro:
        'Postacie ustawione na Rzut na koncentrację oszczędzają z korzyścią, tak jak w przypadku atutu Wojenny Czarodziej. Dotyczy to automatycznych zapisów.',
      none: 'W tej grze nie ma żadnych postaci.',
    },
    buttons: {
      roll: 'Rolka',
      advantage: 'Korzyść',
      status: 'Status',
      advantageMenu: 'Menu korzyści',
      help: 'Pomoc',
      reset: 'Nastawić',
      confirmReset: 'Zresetuj ustawienia',
      end: 'Koniec',
      menu: 'Menu',
      concentrate: 'Skoncentruj się na…',
      toggle: 'Dźwignia kolankowa',
      journal: 'Odbuduj materiały informacyjne',
    },
    prompts: {
      spell: 'Zaklęcie',
    },
    values: {
      on: 'NA',
      off: 'Wyłączony',
      bar: 'Pasek {bar}',
      unnamed: 'Anonimowy',
      sendTo: {
        everyone: 'Wszyscy',
        character: 'Charakter',
        gm: 'GM',
      },
      supportMode: {
        basic: 'Podstawowy',
        detailed: 'Szczegółowy',
      },
    },
    settings: {
      language: {
        label: 'Język',
        desc: 'Język wiadomości na czacie i materiałów informacyjnych.',
      },
      command: {
        label: 'Rozkaz',
        desc: 'Polecenie czatu bez znaku „!”. Makra w wersji 1.0 wykorzystują koncentrację.',
      },
      statusmarker: {
        label: 'Znacznik stanu',
        desc: 'Znacznik żetonowy pokazujący koncentrację. Można używać niestandardowych znaczników tokenów.',
      },
      bar: {
        label: 'Pasek HP',
        desc: 'Pasek żetonów przechowujący punkty wytrzymałości. Uszkodzenie go wymaga rzutu obronnego na koncentrację.',
      },
      send_reminder_to: {
        label: 'Wyślij przypomnienie do',
        desc: 'Kto widzi komunikaty o koncentracji i zapisuje: wszyscy, MG lub gracze postaci (MG otrzymuje kopię).',
      },
      auto_add_concentration_marker: {
        label: 'Automatyczne dodawanie połączenia Znacznik',
        desc: 'Dodaj znacznik, gdy zaklęcie koncentracji jest rzucane z arkusza.',
        hint: 'Arkusze D&D 5e 2014 (OGL) i 2024.',
      },
      auto_roll_save: {
        label: 'Automatyczne zapisywanie rolki',
        desc: 'Rzuć rzut obronny, gdy tylko żeton koncentracji otrzyma obrażenia. Gdy jest wyłączone, przypomnienie ma przyciski Roll i Advantage.',
      },
      show_roll_button: {
        label: 'Przycisk Rolki',
        desc: 'Dodaj przyciski Roll i Advantage do przypomnienia, gdy funkcja Auto Roll Save jest wyłączona.',
      },
      end_at_zero: {
        label: 'Zakończ przy 0 HP',
        desc: 'Zakończ koncentrację bez rzutu obronnego, gdy żeton spadnie do 0 punktów wytrzymałości.',
      },
      bonus_attribute: {
        label: 'Atrybut bonusowy',
        desc: 'Atrybut arkusza dodany do zapisów koncentracji. Constitution_save_mod działa na arkuszach D&D 5e 2014 i 2024.',
      },
      debug: {
        label: 'Tryb debugowania',
        desc: 'Napisz notatki na temat wykrywania pisowni i zapisów w konsoli API w celu uzyskania pomocy technicznej.',
      },
      support_mode: {
        label: 'Tryb wsparcia',
        desc: 'Ile zapisuje tryb debugowania: podstawowy (krótki) lub szczegółowy.',
      },
    },
    help: {
      menu: 'Bez zaznaczenia niczego (GM): otwórz ustawienia. Po wybraniu żetonów: koncentracja początkowa lub końcowa.',
      toggle:
        'Zacznij koncentrować się na zaklęciu z wybranymi żetonami. Nazwij inne zaklęcie do przełączenia; uruchom go ponownie, aby zakończyć.',
      end: 'Zakończ koncentrację dla wybranych tokenów.',
      status: 'Lista osób skoncentrowanych za pomocą przycisków Zakończ.',
      config: 'Zmień ustawienie, na przykład config auto_roll_save|false.',
      advantageMenu:
        'Wybierz, które postacie będą korzystniej rzucać rzutami obronnymi na koncentrację.',
      toggleAdvantage: 'Włącz lub wyłącz przewagę dla jednej postaci.',
      roll: 'Rzuć zapis za pomocą przycisku Rzut lub Przewaga przypomnienia.',
      journal: 'Odbuduj materiały informacyjne dotyczące talii pomocy i dowodzenia.',
      reset: 'Przywróć każde ustawienie do wartości domyślnych.',
      help: 'Pokaż tę listę.',
      footer:
        'Pełne instrukcje znajdują się w ulotce „{help}”; przyciski znajdują się w ulotce „{deck}”.',
      playerFooter: 'Najpierw wybierz swój token.',
    },
    errors: {
      noSelection: 'Najpierw wybierz token.',
      notYours: 'Możesz zmienić koncentrację tylko dla żetonów, które kontrolujesz.',
      gmOnly: 'Tylko MG może użyć tej komendy.',
      notConcentrating: 'Ten znak nie jest skoncentrowany.',
      unknownSetting: 'Nie ma ustawienia o nazwie „{key}”.',
      badSettingValue: '„{value}” nie jest prawidłową wartością dla {key}.',
      rollExpired: 'Ten przycisk wygasł.',
      unknownCharacter: 'Ta postać już nie istnieje.',
      internal: 'Coś poszło nie tak. Konsola API zawiera szczegółowe informacje.',
    },
    hints: {
      noSelection: 'Wybierz token rzucającego, a następnie uruchom komendę ponownie.',
      rollExpired: 'Przyciski działają raz na 10 minut. Ponownie zniszcz token, aby uzyskać nowy.',
      unknownSetting: 'Wpisz polecenie bez zaznaczenia niczego, aby zobaczyć ustawienia.',
    },
    warnings: {
      unknownMarker:
        'Znacznik stanu „{marker}” nie jest jednym ze znaczników tej gry. Wybierz inny w ustawieniach.',
    },
    deck: {
      subtitle: 'Pokład dowodzenia',
      selected: 'Wybrane tokeny',
      selectedDesc: 'Najpierw wybierz żeton rzucającego.',
      table: 'Stół',
      tableDesc: 'Zobacz, kto się koncentruje, a kto ma przewagę po swoich interwencjach.',
      tools: 'Narzędzia',
      toolsDesc: 'Ustawienia, lista poleceń i materiały informacyjne.',
      footer: 'Pełne instrukcje znajdują się w ulotce „{help}”.',
    },
    handout: {
      versionLabel: 'Wersja',
      subtitle: 'Znaczniki koncentracji, przypomnienia i zapisy dla D&D 5e',
      overview: {
        heading: 'Przegląd',
        body: 'Koncentracja rejestruje, kto koncentruje się na jakim zaklęciu. Umieszcza znacznik na żetonie rzucającego, rzuca (lub prosi) o rzut obronny na Kondycję, gdy ten żeton otrzyma obrażenia, i informuje stół o zakończeniu koncentracji.',
      },
      quickStart: {
        heading: 'Szybki start',
        steps: [
          'Wybierz żeton rzucającego i wpisz !concentration, a następnie zaklęcie, na przykład !concentration Bless.',
          'Zmień punkty wytrzymałości żetonu w bańce na pasku. Rzut obronny wynosi ST 10 lub połowę obrażeń, jeśli jest wyższa.',
          'Uruchom ponownie tę samą komendę lub zdejmij znacznik, aby zakończyć koncentrację.',
          'Wpisz !concentration bez zaznaczenia żadnej opcji, aby otworzyć ustawienia.',
        ],
      },
      concentrating: {
        heading: 'Koncentrując się',
        points: [
          'Nazwanie innego zaklęcia przełącza na nie koncentrację, tak jak robi to rzucenie nowego zaklęcia skupiającego.',
          'Ręczne umieszczenie znacznika na żetonie rozpoczyna koncentrację bez zaklęcia; jego zdjęcie lub usunięcie tokena kończy go.',
          'Nowy połączony żeton koncentrującej się postaci otrzymuje znacznik, a wklejony żeton niosący znacznik jest śledzony.',
          'Żetony jednej postaci z powiązanym paskiem punktów wytrzymałości mają wspólną koncentrację. Niepowiązane żetony, takie jak stado goblinów z jednego arkusza, skupiają się na sobie.',
          'Każdy widzi komunikat o rozpoczęciu, przełączeniu lub zakończeniu koncentracji, chyba że opcja Wyślij przypomnienie do mówi inaczej.',
        ],
      },
      saves: {
        heading: 'Koncentracja oszczędza',
        points: [
          'ST wynosi 10 lub połowę otrzymanych obrażeń, w zależności od tego, która wartość jest wyższa, aż do ST 30.',
          'Modyfikator pochodzi z Atrybutu Bonusowego na karcie postaci; brakująca wartość liczy się jako 0.',
          'Funkcja automatycznego zapisu rolki rzuca na raz. Gdy jest wyłączone, przypomnienie ma przyciski Rzut i Przewaga dla gracza lub MG.',
          'Nieudany zapis kończy koncentrację. Przy włączonej opcji End przy 0 HP, spadek do 0 punktów wytrzymałości kończy grę bez rzutu obronnego.',
          'Menu Przewagi zapewnia postaci przewagę przy automatycznych zapisach, tak jak ma to miejsce w przypadku atutu Wojennego Czarownika.',
        ],
      },
      automatic: {
        heading: 'Zaklęcia rzucane z prześcieradła',
        points: [
          'Z funkcją automatycznego dodawania. Znacznik włączony, rzucenie zaklęcia koncentracji z arkusza D&D 5e 2014 (OGL) lub 2024 dodaje znacznik.',
          'Żetony rzucającego na stronie, którą przegląda, są oznaczone; jeśli ich nie ma, to są to żetony na dowolnej stronie.',
          'Liczą się tylko karty od MG, innego Modu lub jednego z graczy postaci. Ponowne rzucenie tego samego zaklęcia nic nie zmienia.',
          'Karta D&D 2024, która w swoim tekście wspomina jedynie o koncentracji, np. atut Wojenny, może rozpocząć koncentrację, ale nigdy nie zastępuje zaklęcia.',
          'Arkusze D&D 2024 mogą wymagać serwera Experimental API. Włącz tryb debugowania, aby zobaczyć, dlaczego zaklęcie zostało wykryte lub nie.',
        ],
      },
      players: {
        heading: 'Gracze',
        points: [
          'Gracze mogą rozpoczynać i kończyć koncentrację dla kontrolowanych przez siebie żetonów oraz używać przycisków Rzut i Przewaga podczas własnych zapisów.',
          'Opcja Wyślij przypomnienie Aby ustawić postać, wiadomości będą szeptane do graczy danej postaci i do MG.',
        ],
      },
      commands: {
        heading: 'Polecenia',
        intro: 'Inne mody, takie jak ScriptCards, również mogą wysyłać te polecenia.',
        colCommand: 'Rozkaz',
        colDesc: 'Co to robi',
      },
      settings: {
        heading: 'Ustawienia',
        intro:
          'Zmień ustawienia za pomocą przycisków na karcie ustawień lub za pomocą konfiguracji <klucz>|<wartość>. Niektóre można również ustawić na stronie moda.',
        colKey: 'Klawisz',
        colName: 'Nazwa',
        colDesc: 'Co to robi',
      },
      upgrading: {
        heading: 'Aktualizacja z wersji 1.0',
        points: [
          'Ustawienia, lista zalet i każde polecenie działają.',
          'Wiadomości mówią teraz, kiedy kończy się koncentracja i na którym zaklęciu.',
          'Tokeny, które już noszą znacznik, są odbierane podczas uruchamiania.',
        ],
      },
      troubleshooting: {
        heading: 'Rozwiązywanie problemów',
        points: [
          'Brak zapisu po spadku punktów wytrzymałości: sprawdź, czy żeton ma znacznik i czy pasek HP to pasek, który zmieniłeś. Zmiany dokonane przez innych Modów za pośrednictwem API nie wywołują zdarzeń, więc nie są widoczne.',
          'Modyfikator wynosi 0: sprawdź atrybut bonusowy na karcie postaci.',
          'Czary rzucane z arkusza nie są wykrywane: włącz tryb debugowania, rzuć zaklęcie ponownie i przeczytaj konsolę API.',
          'Dwie postacie mają wspólną nazwę: wykrywanie wykorzystuje pierwsze dopasowanie. Nadaj postaciom unikalne imiona.',
        ],
      },
      languages: {
        heading: 'Języki',
        body: 'Koncentracja została przetłumaczona na poniższe języki. Wybierz ten z ustawieniem Język.',
        colCode: 'Kod',
        colName: 'Język',
        colNative: 'Imię rodzime',
      },
      credits: {
        heading: 'Kredyty',
        original: 'Oryginalny mod autorstwa',
        maintainer: 'Utrzymywany przez',
        support: 'Zgłaszaj błędy i pomysły na forum Roll20 Mod lub na GitHubie.',
      },
      footer: 'Przyciski dla każdej akcji znajdują się w ulotce „{deck}”.',
    },
  };

  const TRANSLATION$6 = {
    titles: {
      ready: 'A concentração está pronta.',
      menu: 'Configurações de concentração',
      help: 'Comandos de concentração',
      status: 'Quem está a concentrar-se',
      advantage: 'Vantagem em economia de concentração',
      reset: 'Redefinir concentração',
      concentration: 'Concentração',
      save: 'Economia de concentração',
      check: 'Verificação da concentração',
    },
    messages: {
      migrated:
        'Atualizado a partir da versão 1.0. As suas definições e lista de vantagens foram mantidas e as suas macros antigas ainda funcionam.',
      reconciled:
        'Alcançado o mapa: tokens de concentração encontrados {added}, entradas antigas removidas {dropped}.',
      readyHint: 'Introduza {command} para as definições ou abra o folheto Command Deck.',
      settingChanged: '{setting} é agora {value}.',
      confirmReset:
        'Colocar todas as definições de volta no padrão e limpar a lista de vantagens? Os marcadores de concentração no mapa mantêm-se.',
      reset: 'As definições voltam aos seus padrões.',
      journal: 'Apostilas reconstruídas: {help} e {deck}.',
    },
    notices: {
      started: '{name} está agora concentrado em {spell}.',
      startedNoSpell: '{name} está agora a concentrar-se.',
      switched: '{name} deixa de se concentrar em {old} e está agora a concentrar-se em {spell}.',
      switchedNoSpell: '{name} está agora a concentrar-se.',
      ended: '{name} já não está concentrado em {spell}.',
      endedNoSpell: '{name} já não se está a concentrar.',
      lost: '{name} perde a concentração em {spell}.',
      lostNoSpell: '{name} perde a concentração.',
      kept: '{name} continua concentrado em {spell}.',
      keptNoSpell: '{name} continua concentrado.',
      zeroHp: '{name} desce para 0 pontos de vida e perde a concentração em {spell}.',
      zeroHpNoSpell: '{name} desce para 0 pontos de vida e perde a concentração.',
      checkNeeded:
        '{name} deve fazer um teste de resistência de Constituição para continuar a concentrar-se: {dc}.',
    },
    save: {
      dc: 'CC',
      dcValue: 'DC {dc}',
      modifier: 'Modificador',
      roll: 'Rolo',
      advantageRoll: '{first} e {second} (vantagem)',
      success: 'Sucesso',
      failure: 'Falha',
    },
    menu: {
      concentratingCount: 'Concentrando-se agora: {count}',
      settings: 'Configurações',
      footer: 'Introduza {command} para voltar aqui. Cada botão está também no folheto "{deck}".',
    },
    status: {
      none: 'Ninguém está concentrado.',
    },
    advantage: {
      intro:
        'Personagens configuradas para ativar os seus testes de concentração com vantagem, como acontece com o talento War Caster. Isto aplica-se a salvamentos automáticos.',
      none: 'Não existem personagens neste jogo.',
    },
    buttons: {
      roll: 'Rolo',
      advantage: 'Vantagem',
      status: 'Estatuto',
      advantageMenu: 'Menu Vantagem',
      help: 'Ajuda',
      reset: 'Reiniciar',
      confirmReset: 'Redefinir as configurações',
      end: 'Fim',
      menu: 'Menu',
      concentrate: 'Concentre-se em…',
      toggle: 'Alternar',
      journal: 'Reconstruir folhetos',
    },
    prompts: {
      spell: 'Feitiço',
    },
    values: {
      on: 'Em',
      off: 'Desligado',
      bar: 'Barra {bar}',
      unnamed: 'Sem nome',
      sendTo: {
        everyone: 'Toda a gente',
        character: 'Personagem',
        gm: 'GM',
      },
      supportMode: {
        basic: 'Básico',
        detailed: 'Detalhado',
      },
    },
    settings: {
      language: {
        label: 'Idioma',
        desc: 'O idioma das mensagens de chat e dos folhetos.',
      },
      command: {
        label: 'Comando',
        desc: 'O comando chat, sem o comando "!". As macros da versão 1.0 utilizam a concentração.',
      },
      statusmarker: {
        label: 'Marcador de estado',
        desc: 'O marcador simbólico que mostra concentração. Podem ser utilizados marcadores de token personalizados.',
      },
      bar: {
        label: 'Barra de HP',
        desc: 'A barra de tokens que contém pontos de vida. Os danos nele exigem uma economia de concentração.',
      },
      send_reminder_to: {
        label: 'Enviar lembrete para',
        desc: 'Quem vê as mensagens de concentração e guarda: todos, o GM ou os jogadores da personagem (o GM recebe uma cópia).',
      },
      auto_add_concentration_marker: {
        label: 'Adicionar Con automaticamente. Marcador',
        desc: 'Adicione o marcador quando um feitiço de concentração é lançado a partir de uma folha.',
        hint: 'D&D 5e 2014 (OGL) e 2024 folhas.',
      },
      auto_roll_save: {
        label: 'Guardar rolagem automática',
        desc: 'Faz o salvamento assim que uma ficha de concentração sofrer dano. Quando desativado, o lembrete possui botões Roll e Advantage.',
      },
      show_roll_button: {
        label: 'Botão Rolar',
        desc: 'Adicione os botões Roll e Advantage ao lembrete quando o Auto Roll Save estiver desativado.',
      },
      end_at_zero: {
        label: 'Termina em 0 HP',
        desc: 'Termina a concentração sem guardar quando uma ficha atinge 0 pontos de vida.',
      },
      bonus_attribute: {
        label: 'Atributo bónus',
        desc: 'O atributo de folha adicionado aos salvamentos de concentração. Constitution_save_mod funciona nas folhas de cálculo D&D 5e 2014 e 2024.',
      },
      debug: {
        label: 'Modo de depuração',
        desc: 'Escreva notas sobre deteção ortográfica e salvamentos na consola da API, para pedidos de suporte.',
      },
      support_mode: {
        label: 'Modo de suporte',
        desc: 'Quanto o modo de depuração grava: Básico (curto) ou Detalhado.',
      },
    },
    help: {
      menu: 'Sem nada selecionado (GM): abra as definições. Com tokens selecionados: inicia ou termina a concentração.',
      toggle:
        'Comece a concentrar-se num feitiço com as fichas selecionadas. Nomeie um feitiço diferente para trocar; execute-o novamente para terminar.',
      end: 'Concentração final para os tokens selecionados.',
      status: 'Liste quem se está a concentrar, com os botões Encerrar.',
      config: 'Altere uma configuração, por exemplo config auto_roll_save|false.',
      advantageMenu:
        'Escolha quais as personagens que realizam os testes de concentração com vantagem.',
      toggleAdvantage: 'Ative ou desative a vantagem de uma personagem.',
      roll: 'Faça um guardar a partir do botão Rolar ou Vantagem de um lembrete.',
      journal: 'Reconstrua os folhetos da Ajuda e da Plataforma de Comando.',
      reset: 'Coloque todas as definições de volta ao padrão.',
      help: 'Mostre esta lista.',
      footer:
        'As instruções completas estão no folheto "{help}"; os botões estão no folheto "{deck}".',
      playerFooter: 'Selecione primeiro o seu token.',
    },
    errors: {
      noSelection: 'Selecione primeiro um token.',
      notYours: 'Só pode alterar a concentração das fichas que controla.',
      gmOnly: 'Apenas o GM pode usar este comando.',
      notConcentrating: 'Esse token não está a concentrar-se.',
      unknownSetting: 'Não existe nenhuma configuração chamada "{key}".',
      badSettingValue: '"{value}" não é um valor válido para {key}.',
      rollExpired: 'Esse botão expirou.',
      unknownCharacter: 'Esse personagem já não existe.',
      internal: 'Algo correu mal. A consola da API contém os detalhes.',
    },
    hints: {
      noSelection: 'Selecione o token do lançador e execute novamente o comando.',
      rollExpired:
        'Os botões funcionam uma vez e durante 10 minutos. Danifique novamente o token para obter um novo.',
      unknownSetting: 'Introduza o comando sem nada selecionado para ver as definições.',
    },
    warnings: {
      unknownMarker:
        'O marcador de estado "{marker}" não é um dos marcadores deste jogo. Escolha outro nas definições.',
    },
    deck: {
      subtitle: 'Convés de comando',
      selected: 'Tokens Selecionados',
      selectedDesc: 'Selecione primeiro a ficha do lançador.',
      table: 'A mesa',
      tableDesc: 'Veja quem está concentrado e quem tem vantagem nas defesas.',
      tools: 'Ferramentas',
      toolsDesc: 'Definições, a lista de comandos e os folhetos.',
      footer: 'As instruções completas estão no folheto "{help}".',
    },
    handout: {
      versionLabel: 'Versão',
      subtitle: 'Marcadores de concentração, lembretes e salvamentos para D&D 5e',
      overview: {
        heading: 'Visão geral',
        body: 'A concentração monitoriza quem se está a concentrar em qual feitiço. Coloca um marcador na ficha do conjurador, lança (ou pede) um salvamento de Constituição quando essa ficha sofre dano e informa a mesa quando a concentração termina.',
      },
      quickStart: {
        heading: 'Início rápido',
        steps: [
          'Selecione o token do lançador e digite !concentration seguido do feitiço, por exemplo !concentration Bless.',
          'Altere os pontos de vida do token na bolha da barra. Um teste de resistência é lançado com CD 10, ou metade do dano, se for superior.',
          'Execute novamente o mesmo comando ou retire o marcador para terminar a concentração.',
          'Digite !concentration sem nada selecionado para abrir as definições.',
        ],
      },
      concentrating: {
        heading: 'Concentrando-se',
        points: [
          'Nomear um feitiço diferente muda a concentração para ele, tal como lançar um novo feitiço de concentração faz.',
          'Colocar o marcador numa ficha manualmente inicia a concentração sem feitiço; retirá-lo ou apagar o token encerra tudo.',
          'Um novo token ligado de um personagem concentrador obtém o marcador, e um token colado que transporta o marcador é rastreado.',
          'Os tokens de uma personagem com uma barra de pontos de vida ligada partilham a concentração. As fichas não ligadas, como um bando de duendes de uma folha, concentram-se em si mesmas.',
          'Todos veem uma mensagem quando a concentração começa, muda ou termina, a menos que Enviar lembrete para diga o contrário.',
        ],
      },
      saves: {
        heading: 'Concentração salva',
        points: [
          'A CD é 10 ou metade do dano sofrido, consoante o que for mais elevado, até CD 30.',
          'O modificador vem do Atributo Bónus na ficha da personagem; um valor em falta conta como 0.',
          'Auto Roll Guarde os rolos de uma só vez. Quando está desligado, o lembrete tem botões Roll e Advantage para o jogador ou GM.',
          'Uma falha no salvamento termina a concentração. Com End at 0 HP activado, descer para 0 pontos de vida termina sem guardar.',
          'O Menu Vantagem dá vantagem à personagem nos auto-saves, tal como faz o talento War Caster.',
        ],
      },
      automatic: {
        heading: 'Feitiços lançados de uma folha',
        points: [
          'Com adição automática. Marcador ativado, lançar um feitiço de concentração de uma folha D&D 5e 2014 (OGL) ou 2024 adiciona o marcador.',
          'Os marcadores do conjurador na página que está a visualizar são marcados; se não houver nenhum, os tokens em qualquer página serão.',
          'Apenas as cartas do GM, de outro Mod ou de um dos jogadores da personagem contam. Lançar novamente o mesmo feitiço não muda nada.',
          'Uma carta D&D 2024 que apenas menciona concentração no seu texto, como o talento War Caster, pode iniciar a concentração, mas nunca substitui um feitiço.',
          'As folhas de cálculo D&D 2024 podem necessitar do servidor API Experimental. Ative o modo de depuração para ver porque é que um feitiço foi ou não detetado.',
        ],
      },
      players: {
        heading: 'Jogadores',
        points: [
          'Os jogadores podem iniciar e terminar a concentração dos tokens que controlam e utilizar os botões Roll e Advantage nos seus próprios saves.',
          'Com Enviar lembrete para definir como Personagem, as mensagens são sussurradas aos jogadores da personagem e ao Mestre.',
        ],
      },
      commands: {
        heading: 'Comandos',
        intro: 'Outros Mods, como os ScriptCards, também podem enviar estes comandos.',
        colCommand: 'Comando',
        colDesc: 'O que faz',
      },
      settings: {
        heading: 'Configurações',
        intro:
          'Altere as definições com os botões do cartão de definições ou com config <key>|<value>. Alguns também podem ser configurados na página Mod.',
        colKey: 'Chave',
        colName: 'Nome',
        colDesc: 'O que faz',
      },
      upgrading: {
        heading: 'Atualização da versão 1.0',
        points: [
          'As definições, a lista de vantagens e todos os comandos continuam a funcionar.',
          'As mensagens informam agora quando a concentração termina e em que feitiço.',
          'Os tokens que já carregam o marcador são recolhidos no arranque.',
        ],
      },
      troubleshooting: {
        heading: 'Solução de problemas',
        points: [
          'Não é possível guardar quando os pontos de vida caem: verifique se o token tem o marcador e se a Barra de HP é a barra que alterou. As alterações efetuadas por outros Mods através da API não geram eventos, pelo que não são visualizadas.',
          'O modificador é 0: compare o Atributo Bónus com a ficha da personagem.',
          'Os feitiços lançados a partir da folha de cálculo não são detetados: ative o modo de depuração, lance o feitiço novamente e leia a consola da API.',
          'Dois caracteres partilham um nome: a deteção utiliza a primeira correspondência. Dê nomes únicos às personagens.',
        ],
      },
      languages: {
        heading: 'Idiomas',
        body: 'A concentração está traduzida para as línguas abaixo. Escolha um com a definição de idioma.',
        colCode: 'Código',
        colName: 'Idioma',
        colNative: 'Nome nativo',
      },
      credits: {
        heading: 'Créditos',
        original: 'Mod original de',
        maintainer: 'Mantido por',
        support: 'Reporte bugs e ideias no fórum Roll20 Mod ou no GitHub.',
      },
      footer: 'Os botões de cada ação estão no folheto "{deck}".',
    },
  };

  const TRANSLATION$5 = {
    titles: {
      ready: 'A concentração está pronta.',
      menu: 'Configurações de concentração',
      help: 'Comandos de concentração',
      status: 'Quem está se concentrando',
      advantage: 'Vantagem em economia de concentração',
      reset: 'Redefinir concentração',
      concentration: 'Concentração',
      save: 'Economia de concentração',
      check: 'Verificação de concentração',
    },
    messages: {
      migrated:
        'Atualizado da versão 1.0. Suas configurações e lista de vantagens foram mantidas e suas macros antigas ainda funcionam.',
      reconciled:
        'Alcançado o mapa: tokens de concentração encontrados {added}, entradas antigas removidas {dropped}.',
      readyHint: 'Digite {command} para as configurações ou abra o folheto Command Deck.',
      settingChanged: '{setting} agora é {value}.',
      confirmReset:
        'Colocar todas as configurações de volta no padrão e limpar a lista de vantagens? Os marcadores de concentração no mapa permanecem.',
      reset: 'As configurações voltam aos seus padrões.',
      journal: 'Apostilas reconstruídas: {help} e {deck}.',
    },
    notices: {
      started: '{name} agora está concentrado em {spell}.',
      startedNoSpell: '{name} agora está se concentrando.',
      switched: '{name} para de se concentrar em {old} e agora está se concentrando em {spell}.',
      switchedNoSpell: '{name} agora está se concentrando.',
      ended: '{name} não está mais concentrado em {spell}.',
      endedNoSpell: '{name} não está mais se concentrando.',
      lost: '{name} perde a concentração em {spell}.',
      lostNoSpell: '{name} perde a concentração.',
      kept: '{name} continua concentrado em {spell}.',
      keptNoSpell: '{name} continua concentrado.',
      zeroHp: '{name} cai para 0 pontos de vida e perde a concentração em {spell}.',
      zeroHpNoSpell: '{name} cai para 0 pontos de vida e perde a concentração.',
      checkNeeded:
        '{name} deve fazer um teste de resistência de Constituição para continuar se concentrando: {dc}.',
    },
    save: {
      dc: 'CC',
      dcValue: 'DC {dc}',
      modifier: 'Modificador',
      roll: 'Rolar',
      advantageRoll: '{first} e {second} (vantagem)',
      success: 'Sucesso',
      failure: 'Falha',
    },
    menu: {
      concentratingCount: 'Concentrando-se agora: {count}',
      settings: 'Configurações',
      footer: 'Digite {command} para voltar aqui. Cada botão também está no folheto "{deck}".',
    },
    status: {
      none: 'Ninguém está concentrado.',
    },
    advantage: {
      intro:
        'Personagens configurados para ativar seus testes de concentração com vantagem, como acontece com o talento War Caster. Isso se aplica a salvamentos automáticos.',
      none: 'Não há personagens neste jogo.',
    },
    buttons: {
      roll: 'Rolar',
      advantage: 'Vantagem',
      status: 'Status',
      advantageMenu: 'Menu Vantagem',
      help: 'Ajuda',
      reset: 'Reiniciar',
      confirmReset: 'Redefinir configurações',
      end: 'Fim',
      menu: 'Menu',
      concentrate: 'Concentre-se em…',
      toggle: 'Alternar',
      journal: 'Reconstruir folhetos',
    },
    prompts: {
      spell: 'Soletrar',
    },
    values: {
      on: 'Sobre',
      off: 'Desligado',
      bar: 'Barra {bar}',
      unnamed: 'Sem nome',
      sendTo: {
        everyone: 'Todos',
        character: 'Personagem',
        gm: 'GM',
      },
      supportMode: {
        basic: 'Básico',
        detailed: 'Detalhado',
      },
    },
    settings: {
      language: {
        label: 'Linguagem',
        desc: 'O idioma das mensagens de bate-papo e folhetos.',
      },
      command: {
        label: 'Comando',
        desc: 'O comando chat, sem o "!". As macros da versão 1.0 usam concentração.',
      },
      statusmarker: {
        label: 'Marcador de status',
        desc: 'O marcador simbólico que mostra concentração. Marcadores de token personalizados podem ser usados.',
      },
      bar: {
        label: 'Barra de HP',
        desc: 'A barra de tokens que contém pontos de vida. Danos a ele exigem uma economia de concentração.',
      },
      send_reminder_to: {
        label: 'Enviar lembrete para',
        desc: 'Quem vê as mensagens de concentração e salva: todos, o GM ou os jogadores do personagem (o GM recebe uma cópia).',
      },
      auto_add_concentration_marker: {
        label: 'Adicionar Con automaticamente. Marcador',
        desc: 'Adicione o marcador quando um feitiço de concentração for lançado de uma folha.',
        hint: 'D&D 5e 2014 (OGL) e 2024 folhas.',
      },
      auto_roll_save: {
        label: 'Salvar rolagem automática',
        desc: 'Faça o salvamento assim que uma ficha de concentração sofrer dano. Quando desativado, o lembrete possui botões Roll e Advantage.',
      },
      show_roll_button: {
        label: 'Botão Rolar',
        desc: 'Adicione os botões Roll e Advantage ao lembrete quando o Auto Roll Save estiver desativado.',
      },
      end_at_zero: {
        label: 'Termina em 0 HP',
        desc: 'Finaliza a concentração sem salvar quando uma ficha chega a 0 pontos de vida.',
      },
      bonus_attribute: {
        label: 'Atributo bônus',
        desc: 'O atributo de folha adicionado aos salvamentos de concentração. Constitution_save_mod funciona nas planilhas D&D 5e 2014 e 2024.',
      },
      debug: {
        label: 'Modo de depuração',
        desc: 'Escreva notas sobre detecção ortográfica e salvamentos no console da API, para solicitações de suporte.',
      },
      support_mode: {
        label: 'Modo de suporte',
        desc: 'Quanto o modo de depuração grava: Básico (curto) ou Detalhado.',
      },
    },
    help: {
      menu: 'Sem nada selecionado (GM): abra as configurações. Com tokens selecionados: inicia ou finaliza a concentração.',
      toggle:
        'Comece a se concentrar em um feitiço com as fichas selecionadas. Nomeie um feitiço diferente para trocar; execute-o novamente para terminar.',
      end: 'Concentração final para os tokens selecionados.',
      status: 'Liste quem está se concentrando, com os botões Encerrar.',
      config: 'Altere uma configuração, por exemplo config auto_roll_save|false.',
      advantageMenu: 'Escolha quais personagens rolam os testes de concentração com vantagem.',
      toggleAdvantage: 'Ative ou desative a vantagem de um personagem.',
      roll: 'Faça um salvamento a partir do botão Rolar ou Vantagem de um lembrete.',
      journal: 'Reconstrua os folhetos da Ajuda e da Plataforma de Comando.',
      reset: 'Coloque todas as configurações de volta ao padrão.',
      help: 'Mostre esta lista.',
      footer:
        'As instruções completas estão no folheto "{help}"; os botões estão no folheto "{deck}".',
      playerFooter: 'Selecione seu token primeiro.',
    },
    errors: {
      noSelection: 'Selecione um token primeiro.',
      notYours: 'Você só pode alterar a concentração das fichas que você controla.',
      gmOnly: 'Somente o GM pode usar esse comando.',
      notConcentrating: 'Esse token não está se concentrando.',
      unknownSetting: 'Não há configuração chamada "{key}".',
      badSettingValue: '"{value}" não é um valor válido para {key}.',
      rollExpired: 'Esse botão expirou.',
      unknownCharacter: 'Esse personagem não existe mais.',
      internal: 'Algo deu errado. O console da API contém os detalhes.',
    },
    hints: {
      noSelection: 'Selecione o token do lançador e execute o comando novamente.',
      rollExpired:
        'Os botões funcionam uma vez e por 10 minutos. Danifique o token novamente para obter um novo.',
      unknownSetting: 'Digite o comando sem nada selecionado para ver as configurações.',
    },
    warnings: {
      unknownMarker:
        'O marcador de status "{marker}" não é um dos marcadores deste jogo. Escolha outro nas configurações.',
    },
    deck: {
      subtitle: 'Convés de comando',
      selected: 'Tokens Selecionados',
      selectedDesc: 'Selecione primeiro a ficha do lançador.',
      table: 'A mesa',
      tableDesc: 'Veja quem está concentrado e quem tem vantagem nas defesas.',
      tools: 'Ferramentas',
      toolsDesc: 'Configurações, a lista de comandos e os folhetos.',
      footer: 'As instruções completas estão no folheto "{help}".',
    },
    handout: {
      versionLabel: 'Versão',
      subtitle: 'Marcadores de concentração, lembretes e salvamentos para D&D 5e',
      overview: {
        heading: 'Visão geral',
        body: 'A concentração monitora quem está se concentrando em qual feitiço. Ele coloca um marcador na ficha do conjurador, rola (ou pede) um salvamento de Constituição quando aquela ficha sofre dano e informa à mesa quando a concentração termina.',
      },
      quickStart: {
        heading: 'Início rápido',
        steps: [
          'Selecione o token do lançador e digite !concentration seguido do feitiço, por exemplo !concentration Bless.',
          'Altere os pontos de vida do token na bolha da barra. Um teste de resistência é rolado com CD 10, ou metade do dano, se for maior.',
          'Execute o mesmo comando novamente ou retire o marcador para encerrar a concentração.',
          'Digite !concentration sem nada selecionado para abrir as configurações.',
        ],
      },
      concentrating: {
        heading: 'Concentrando-se',
        points: [
          'Nomear um feitiço diferente muda a concentração para ele, assim como lançar um novo feitiço de concentração faz.',
          'Colocar o marcador em uma ficha manualmente inicia a concentração sem feitiço; retirá-lo ou excluir o token encerra tudo.',
          'Um novo token vinculado de um personagem concentrador obtém o marcador, e um token colado que carrega o marcador é rastreado.',
          'Tokens de um personagem com uma barra de pontos de vida vinculada compartilham concentração. Fichas não vinculadas, como um bando de goblins de uma folha, concentram-se em si mesmas.',
          'Todos veem uma mensagem quando a concentração começa, muda ou termina, a menos que Enviar lembrete para diga o contrário.',
        ],
      },
      saves: {
        heading: 'Concentração salva',
        points: [
          'A CD é 10 ou metade do dano sofrido, o que for maior, até CD 30.',
          'O modificador vem do Atributo Bônus na ficha do personagem; um valor ausente conta como 0.',
          'Auto Roll Salve rolos de uma só vez. Quando está desligado, o lembrete possui botões Roll e Advantage para o jogador ou GM.',
          'Uma falha no salvamento encerra a concentração. Com End at 0 HP ativado, cair para 0 pontos de vida encerra sem salvar.',
          'O Menu Vantagem dá vantagem ao personagem em salvamentos automáticos, como faz o talento War Caster.',
        ],
      },
      automatic: {
        heading: 'Feitiços lançados de uma folha',
        points: [
          'Com adição automática. Marcador ativado, lançar um feitiço de concentração de uma folha D&D 5e 2014 (OGL) ou 2024 adiciona o marcador.',
          'Os marcadores do conjurador na página que ele está visualizando são marcados; se não houver nenhum, os tokens em qualquer página serão.',
          'Apenas cartas do GM, de outro Mod ou de um dos jogadores do personagem contam. Lançar o mesmo feitiço novamente não muda nada.',
          'Uma carta D&D 2024 que apenas menciona concentração em seu texto, como o talento War Caster, pode iniciar a concentração, mas nunca substitui um feitiço.',
          'As planilhas D&D 2024 podem precisar do servidor API Experimental. Ative o modo de depuração para ver por que um feitiço foi ou não detectado.',
        ],
      },
      players: {
        heading: 'Jogadores',
        points: [
          'Os jogadores podem iniciar e encerrar a concentração dos tokens que controlam e usar os botões Roll e Advantage em seus próprios salvamentos.',
          'Com Enviar lembrete para definir como Personagem, as mensagens são sussurradas para os jogadores do personagem e para o Mestre.',
        ],
      },
      commands: {
        heading: 'Comandos',
        intro: 'Outros Mods, como ScriptCards, também podem enviar esses comandos.',
        colCommand: 'Comando',
        colDesc: 'O que isso faz',
      },
      settings: {
        heading: 'Configurações',
        intro:
          'Altere as configurações com os botões no cartão de configurações ou com config <key>|<value>. Alguns também podem ser configurados na página do Mod.',
        colKey: 'Chave',
        colName: 'Nome',
        colDesc: 'O que isso faz',
      },
      upgrading: {
        heading: 'Atualizando da versão 1.0',
        points: [
          'As configurações, a lista de vantagens e todos os comandos continuam funcionando.',
          'As mensagens agora informam quando a concentração termina e em qual feitiço.',
          'Os tokens que já carregam o marcador são recolhidos na inicialização.',
        ],
      },
      troubleshooting: {
        heading: 'Solução de problemas',
        points: [
          'Não é possível salvar quando os pontos de vida caem: verifique se o token possui o marcador e se a Barra de HP é a barra que você alterou. Alterações feitas por outros Mods através da API não geram eventos, portanto não são visualizadas.',
          'O modificador é 0: compare o Atributo Bônus com a ficha do personagem.',
          'Os feitiços lançados da planilha não são detectados: ative o modo de depuração, lance o feitiço novamente e leia o console da API.',
          'Dois caracteres compartilham um nome: a detecção usa a primeira correspondência. Dê nomes exclusivos aos personagens.',
        ],
      },
      languages: {
        heading: 'Idiomas',
        body: 'A concentração está traduzida para os idiomas abaixo. Escolha um com a configuração de idioma.',
        colCode: 'Código',
        colName: 'Linguagem',
        colNative: 'Nome nativo',
      },
      credits: {
        heading: 'Créditos',
        original: 'Mod original por',
        maintainer: 'Mantido por',
        support: 'Relate bugs e ideias no fórum Roll20 Mod ou no GitHub.',
      },
      footer: 'Os botões para cada ação estão no folheto "{deck}".',
    },
  };

  const TRANSLATION$4 = {
    titles: {
      ready: 'Концентрация готова.',
      menu: 'Настройки концентрации',
      help: 'Команды концентрации',
      status: 'Кто концентрируется',
      advantage: 'Преимущество в спасбросках по концентрации',
      reset: 'Сбросить концентрацию',
      concentration: 'Концентрация',
      save: 'Концентрация Сохранить',
      check: 'Проверка концентрации',
    },
    messages: {
      migrated:
        'Обновлён с версии 1.0. Ваши настройки и список преимуществ были сохранены, а старые макросы по-прежнему работают.',
      reconciled:
        'Догнал карту: найдены концентрирующие токены {added}, старые записи удалены {dropped}.',
      readyHint: 'Введите {command} для настроек или откройте раздаточный материал Command Deck.',
      settingChanged: '{setting} теперь {value}.',
      confirmReset:
        'Вернуть все настройки к значениям по умолчанию и очистить список преимуществ? Маркеры концентрации на карте остаются.',
      reset: 'Настройки вернулись к значениям по умолчанию.',
      journal: 'Перестроены раздаточные материалы: {help} и {deck}.',
    },
    notices: {
      started: '{name} сейчас концентрируется на {spell}.',
      startedNoSpell: '{name} сейчас концентрируется.',
      switched: '{name} перестает концентрироваться на {old} и теперь концентрируется на {spell}.',
      switchedNoSpell: '{name} сейчас концентрируется.',
      ended: '{name} больше не концентрируется на {spell}.',
      endedNoSpell: '{name} больше не концентрируется.',
      lost: '{name} теряет концентрацию на {spell}.',
      lostNoSpell: '{name} теряет концентрацию.',
      kept: '{name} продолжает концентрироваться на {spell}.',
      keptNoSpell: '{name} продолжает концентрироваться.',
      zeroHp: 'Здоровье {name} падает до 0 и теряет концентрацию на {spell}.',
      zeroHpNoSpell: 'Здоровье {name} падает до 0 и теряет концентрацию.',
      checkNeeded:
        '{name} должен совершить спасбросок Телосложения, чтобы продолжать концентрироваться: {dc}.',
    },
    save: {
      dc: 'округ Колумбия',
      dcValue: 'DC {dc}',
      modifier: 'Модификатор',
      roll: 'Рулон',
      advantageRoll: '{first} и {second} (преимущество)',
      success: 'Успех',
      failure: 'Отказ',
    },
    menu: {
      concentratingCount: 'Сейчас концентрируюсь: {count}',
      settings: 'Настройки',
      footer:
        'Введите {command}, чтобы вернуться сюда. Каждая кнопка также присутствует в раздаточном материале «{deck}».',
    },
    status: {
      none: 'Никто не концентрируется.',
    },
    advantage: {
      intro:
        'Персонажи, настроенные на бросок концентрации, получают преимущество, как и в случае с умением War Caster. Это касается автоматического сохранения.',
      none: 'В этой игре нет персонажей.',
    },
    buttons: {
      roll: 'Рулон',
      advantage: 'Преимущество',
      status: 'Статус',
      advantageMenu: 'Меню преимуществ',
      help: 'Помощь',
      reset: 'Перезагрузить',
      confirmReset: 'Сбросить настройки',
      end: 'Конец',
      menu: 'Меню',
      concentrate: 'Сосредоточьтесь на…',
      toggle: 'Переключать',
      journal: 'Восстановить раздаточные материалы',
    },
    prompts: {
      spell: 'Заклинание',
    },
    values: {
      on: 'На',
      off: 'Выключенный',
      bar: 'Бар {bar}',
      unnamed: 'Безымянный',
      sendTo: {
        everyone: 'Каждый',
        character: 'Характер',
        gm: 'ГМ',
      },
      supportMode: {
        basic: 'Базовый',
        detailed: 'Подробный',
      },
    },
    settings: {
      language: {
        label: 'Язык',
        desc: 'Язык сообщений чата и раздаточных материалов.',
      },
      command: {
        label: 'Команда',
        desc: 'Команда чата без знака "!". Макросы версии 1.0 используют концентрацию.',
      },
      statusmarker: {
        label: 'Маркер статуса',
        desc: 'Маркер-жетон, показывающий концентрацию. Можно использовать собственные маркеры токенов.',
      },
      bar: {
        label: 'полоска HP',
        desc: 'Панель жетонов, содержащая очки жизни. Повреждение его требует спасброска по концентрации.',
      },
      send_reminder_to: {
        label: 'Отправить напоминание',
        desc: 'Кто видит сообщения о концентрации и сохраняет: все, ГМ или игроки персонажа (ГМ получает копию).',
      },
      auto_add_concentration_marker: {
        label: 'Автоматическое добавление Con. Маркер',
        desc: 'Добавьте маркер, когда заклинание концентрации произносится с листа.',
        hint: 'Листы D&D 5e 2014 (OGL) и 2024 года.',
      },
      auto_roll_save: {
        label: 'Автоматическое сохранение рулона',
        desc: 'Сделайте бросок спасброска, как только жетон концентрации получит урон. В выключенном состоянии напоминание имеет кнопки «Перевернуть» и «Преимущество».',
      },
      show_roll_button: {
        label: 'Кнопка прокрутки',
        desc: 'Добавьте кнопки «Бросить» и «Преимущество» в напоминание, если автоматическое сохранение рулона отключено.',
      },
      end_at_zero: {
        label: 'Конец при 0 HP',
        desc: 'Завершите концентрацию без сохранения, когда хиты жетона упадут до 0.',
      },
      bonus_attribute: {
        label: 'Бонусный атрибут',
        desc: 'Атрибут листа добавлен к сохранениям концентрации. конституция_save_mod работает на листах D&D 5e 2014 и 2024 годов.',
      },
      debug: {
        label: 'Режим отладки',
        desc: 'Пишите заметки об обнаружении заклинаний и сохраняйте их в консоли API для запросов в службу поддержки.',
      },
      support_mode: {
        label: 'Режим поддержки',
        desc: 'Сколько пишет Debug Mode: Basic (короткий) или Detailed.',
      },
    },
    help: {
      menu: 'Ничего не выбрано (GM): откройте настройки. С выбранными жетонами: начать или закончить концентрацию.',
      toggle:
        'Начните концентрироваться на заклинании с выбранными жетонами. Назовите другое заклинание для переключения; запустите его еще раз, чтобы закончить.',
      end: 'Конечная концентрация для выбранных токенов.',
      status: 'Список тех, кто концентрируется, с помощью кнопок «Завершить».',
      config: 'Измените настройку, например, config auto_roll_save|false.',
      advantageMenu:
        'Выберите, какие персонажи совершают спасброски по концентрации с преимуществом.',
      toggleAdvantage: 'Включите или выключите преимущество для одного персонажа.',
      roll: 'Сделайте спасбросок с помощью кнопки «Бросок» или «Преимущество» в напоминании.',
      journal: 'Восстановите раздаточные материалы «Помощь» и «Командная колода».',
      reset: 'Верните все настройки к значениям по умолчанию.',
      help: 'Покажите этот список.',
      footer:
        'Полные инструкции находятся в раздаточном материале «{help}»; кнопки находятся в раздаточном материале "{deck}".',
      playerFooter: 'Сначала выберите свой токен.',
    },
    errors: {
      noSelection: 'Сначала выберите токен.',
      notYours: 'Вы можете изменить концентрацию только для жетонов, которые вы контролируете.',
      gmOnly: 'Только GM может использовать эту команду.',
      notConcentrating: 'Этот жетон не концентрируется.',
      unknownSetting: 'Нет настройки под названием «{key}».',
      badSettingValue: '«{value}» не является допустимым значением для {key}.',
      rollExpired: 'Срок действия этой кнопки истек.',
      unknownCharacter: 'Того персонажа больше нет.',
      internal: 'Что-то пошло не так. Консоль API содержит подробную информацию.',
    },
    hints: {
      noSelection: 'Выберите жетон заклинателя, затем снова запустите команду.',
      rollExpired:
        'Кнопки срабатывают один раз и на 10 минут. Повредите жетон еще раз, чтобы получить новый.',
      unknownSetting: 'Введите команду, ничего не выбрав, чтобы просмотреть настройки.',
    },
    warnings: {
      unknownMarker:
        'Маркер статуса «{marker}» не является одним из маркеров этой игры. Выберите другой в настройках.',
    },
    deck: {
      subtitle: 'Командная колода',
      selected: 'Выбранные токены',
      selectedDesc: 'Сначала выберите жетон заклинателя.',
      table: 'Стол',
      tableDesc: 'Посмотрите, кто концентрируется и у кого есть преимущество в своих сейвах.',
      tools: 'Инструменты',
      toolsDesc: 'Настройки, список команд и раздаточные материалы.',
      footer: 'Полные инструкции приведены в раздаточном материале «{help}».',
    },
    handout: {
      versionLabel: 'Версия',
      subtitle: 'Маркеры концентрации, напоминания и сохранения для D&D 5e',
      overview: {
        heading: 'Обзор',
        body: 'Концентрация отслеживает, кто на каком заклинании концентрируется. Он помещает маркер на жетон заклинателя, бросает (или запрашивает) спасбросок Телосложения, когда этот жетон получает урон, и сообщает таблице, когда концентрация заканчивается.',
      },
      quickStart: {
        heading: 'Быстрый старт',
        steps: [
          'Выберите жетон заклинателя и введите !concentration, а затем заклинание, например !concentration Bless.',
          'Измените количество очков жизни жетона в его полоске. Спасбросок делается при DC 10 или половине урона, если он выше.',
          'Запустите ту же команду еще раз или снимите маркер, чтобы прекратить концентрацию.',
          'Введите !concentration, ничего не выбрав, чтобы открыть настройки.',
        ],
      },
      concentrating: {
        heading: 'Концентрация',
        points: [
          'Присвоение имени другому заклинанию переключает на него концентрацию, как это происходит при произнесении нового заклинания концентрации.',
          'Помещение маркера на жетон вручную запускает концентрацию без заклинания; снятие его или удаление токена завершает его.',
          'Новый связанный жетон концентрирующегося персонажа получает маркер, а вставленный жетон, несущий маркер, отслеживается.',
          'Жетоны одного персонажа со связанной полосой здоровья разделяют концентрацию. Несвязанные жетоны, такие как стая гоблинов с одного листа, концентрируются самостоятельно.',
          'Каждый видит сообщение, когда концентрация начинается, переключается или заканчивается, если в «Отправить напоминание» не указано иное.',
        ],
      },
      saves: {
        heading: 'Концентрация спасает',
        points: [
          'DC равен 10 или половине получаемого урона, в зависимости от того, что больше, вплоть до DC 30.',
          'Модификатор берется из Бонусного Атрибута на листе персонажа; пропущенное значение считается 0.',
          'Auto Roll Сохраняйте рулоны сразу. Когда оно выключено, в напоминании есть кнопки «Бросить» и «Преимущество» для игрока или GM.',
          'Неудачное сохранение прекращает концентрацию. При включенном параметре End at 0 HP падение хитов до 0 завершает его без сохранения.',
          'Меню преимуществ дает персонажу преимущество при автоматических сохранениях, как это делает умение War Caster.',
        ],
      },
      automatic: {
        heading: 'Заклинания, произнесенные с листа',
        points: [
          'С автоматическим добавлением Con. При включении маркера применение заклинания концентрации с листа D&D 5e 2014 (OGL) или 2024 добавляет маркер.',
          'Токены заклинателя на просматриваемой странице отмечены; если их нет, то есть токены на любой странице.',
          'Учитываются только карты от ГМ, другого Модификатора или одного из игроков персонажа. Повторное использование того же заклинания ничего не меняет.',
          'Карта D&D 2024, в тексте которой упоминается только концентрация, например умение Заклинатель войны, может начать концентрацию, но никогда не заменяет заклинание.',
          'Листам D&D 2024 может потребоваться экспериментальный сервер API. Включите режим отладки, чтобы узнать, почему заклинание было или не обнаружено.',
        ],
      },
      players: {
        heading: 'Игроки',
        points: [
          'Игроки могут начинать и заканчивать концентрацию с помощью жетонов, которые они контролируют, а также использовать кнопки «Бросок» и «Преимущество» в своих собственных сохранениях.',
          'При отправке напоминаний. Чтобы установить значение «Персонаж», сообщения будут пересылаться шепотом игрокам персонажа и GM.',
        ],
      },
      commands: {
        heading: 'Команды',
        intro: 'Другие моды, такие как ScriptCards, также могут отправлять эти команды.',
        colCommand: 'Команда',
        colDesc: 'Что он делает',
      },
      settings: {
        heading: 'Настройки',
        intro:
          'Измените настройки кнопками в карточке настроек или с помощью конфига <ключ>|<значение>. Некоторые из них также можно установить на странице мода.',
        colKey: 'Ключ',
        colName: 'Имя',
        colDesc: 'Что он делает',
      },
      upgrading: {
        heading: 'Обновление с версии 1.0',
        points: [
          'Настройки, список преимуществ и все команды продолжают работать.',
          'В сообщениях теперь указывается, когда заканчивается концентрация и на каком заклинании.',
          'Токены, на которых уже есть маркер, подбираются при запуске.',
        ],
      },
      troubleshooting: {
        heading: 'Поиск неисправностей',
        points: [
          'Нет сохранения, когда очки жизни падают: убедитесь, что на жетоне есть маркер и что полоса HP — это полоска, которую вы изменили. Изменения, внесенные другими модами через API, не вызывают событий, поэтому они не видны.',
          'Модификатор равен 0: проверьте бонусный атрибут на листе персонажа.',
          'Заклинания, произнесенные с листа, не обнаруживаются: включите Режим отладки, произнесите заклинание еще раз и прочитайте консоль API.',
          'Два символа имеют одно и то же имя: при обнаружении используется первое совпадение. Дайте персонажам уникальные имена.',
        ],
      },
      languages: {
        heading: 'Языки',
        body: 'Концентрация переведена на языки ниже. Выберите один с настройкой «Язык».',
        colCode: 'Код',
        colName: 'Язык',
        colNative: 'Родное имя',
      },
      credits: {
        heading: 'Кредиты',
        original: 'Оригинальный мод от',
        maintainer: 'Поддерживается',
        support: 'Сообщайте об ошибках и идеях на форуме модов Roll20 или на GitHub.',
      },
      footer: 'Кнопки для каждого действия находятся в раздаточном материале «{deck}».',
    },
  };

  const TRANSLATION$3 = {
    titles: {
      ready: 'La concentración está lista.',
      menu: 'Configuración de concentración',
      help: 'Comandos de concentración',
      status: '¿Quién se está concentrando?',
      advantage: 'Ventaja en ahorros de concentración',
      reset: 'Restablecer concentración',
      concentration: 'Concentración',
      save: 'Ahorro de concentración',
      check: 'Control de concentración',
    },
    messages: {
      migrated:
        'Actualizado desde la versión 1.0. Se conservaron sus configuraciones y lista de ventajas, y sus macros antiguas aún funcionan.',
      reconciled:
        'Al día con el mapa: se encontraron tokens de concentración {added}, se eliminaron entradas antiguas {dropped}.',
      readyHint: 'Escriba {command} para la configuración o abra el folleto Command Deck.',
      settingChanged: '{setting} ahora es {value}.',
      confirmReset:
        '¿Volver a poner cada configuración a su valor predeterminado y borrar la lista de ventajas? Los marcadores de concentración en el mapa permanecen.',
      reset: 'La configuración vuelve a sus valores predeterminados.',
      journal: 'Documentos reconstruidos: {help} y {deck}.',
    },
    notices: {
      started: '{name} ahora se concentra en {spell}.',
      startedNoSpell: '{name} ahora se está concentrando.',
      switched: '{name} deja de concentrarse en {old} y ahora se concentra en {spell}.',
      switchedNoSpell: '{name} ahora se está concentrando.',
      ended: '{name} ya no se concentra en {spell}.',
      endedNoSpell: '{name} ya no se concentra.',
      lost: '{name} pierde la concentración en {spell}.',
      lostNoSpell: '{name} pierde la concentración.',
      kept: '{name} sigue concentrándose en {spell}.',
      keptNoSpell: '{name} sigue concentrándose.',
      zeroHp: '{name} cae a 0 puntos de vida y pierde la concentración en {spell}.',
      zeroHpNoSpell: '{name} cae a 0 puntos de vida y pierde la concentración.',
      checkNeeded:
        '{name} debe realizar una tirada de salvación de Constitución para seguir concentrándose: {dc}.',
    },
    save: {
      dc: 'corriente continua',
      dcValue: 'CC {dc}',
      modifier: 'Modificador',
      roll: 'Rollo',
      advantageRoll: '{first} y {second} (ventaja)',
      success: 'Éxito',
      failure: 'Falla',
    },
    menu: {
      concentratingCount: 'Concentrándonos ahora: {count}',
      settings: 'Ajustes',
      footer:
        'Escriba {command} para volver aquí. Cada botón también se encuentra en el folleto "{deck}".',
    },
    status: {
      none: 'Nadie se está concentrando.',
    },
    advantage: {
      intro:
        'Los personajes configurados para activar sus salvaciones de concentración con ventaja, como ocurre con la hazaña War Caster. Esto se aplica a los guardados automáticos.',
      none: 'No hay personajes en este juego.',
    },
    buttons: {
      roll: 'Rollo',
      advantage: 'Ventaja',
      status: 'Estado',
      advantageMenu: 'Menú de ventajas',
      help: 'Ayuda',
      reset: 'Reiniciar',
      confirmReset: 'Restablecer configuración',
      end: 'Fin',
      menu: 'Menú',
      concentrate: 'Concéntrate en…',
      toggle: 'Palanca',
      journal: 'Reconstruir folletos',
    },
    prompts: {
      spell: 'Deletrear',
    },
    values: {
      on: 'En',
      off: 'Apagado',
      bar: 'Barra {bar}',
      unnamed: 'Sin nombre',
      sendTo: {
        everyone: 'Todos',
        character: 'Personaje',
        gm: 'GM',
      },
      supportMode: {
        basic: 'Básico',
        detailed: 'Detallado',
      },
    },
    settings: {
      language: {
        label: 'Idioma',
        desc: 'El idioma de los mensajes de chat y los folletos.',
      },
      command: {
        label: 'Dominio',
        desc: 'El comando de chat, sin el "!". Las macros de la versión 1.0 usan concentración.',
      },
      statusmarker: {
        label: 'Marcador de estado',
        desc: 'El marcador simbólico que muestra concentración. Se pueden utilizar marcadores de tokens personalizados.',
      },
      bar: {
        label: 'Barra de HP',
        desc: 'La barra de fichas que contiene puntos de vida. Dañarlo exige una salvación de concentración.',
      },
      send_reminder_to: {
        label: 'Enviar recordatorio a',
        desc: 'Quién ve los mensajes de concentración y guarda: todos, el DJ o los jugadores del personaje (el DJ recibe una copia).',
      },
      auto_add_concentration_marker: {
        label: 'Agregar configuración automática. Marcador',
        desc: 'Añade el marcador cuando se lanza un hechizo de concentración desde una hoja.',
        hint: 'D&D 5e 2014 (OGL) y hojas 2024.',
      },
      auto_roll_save: {
        label: 'Guardar rollo automático',
        desc: 'Tira la salvación tan pronto como una ficha de concentración sufra daño. Cuando está apagado, el recordatorio tiene botones Roll y Advantage.',
      },
      show_roll_button: {
        label: 'Botón de rollo',
        desc: 'Agregue los botones Roll y Advantage al recordatorio cuando Auto Roll Save esté desactivado.',
      },
      end_at_zero: {
        label: 'Terminar en 0 HP',
        desc: 'Finaliza la concentración sin guardar cuando una ficha cae a 0 puntos de vida.',
      },
      bonus_attribute: {
        label: 'Atributo de bonificación',
        desc: 'El atributo de hoja agregado a los guardados de concentración. Constitution_save_mod funciona en hojas de D&D 5e 2014 y 2024.',
      },
      debug: {
        label: 'Modo de depuración',
        desc: 'Escriba notas sobre la detección ortográfica y guárdelas en la consola API para solicitudes de soporte.',
      },
      support_mode: {
        label: 'Modo de soporte',
        desc: 'Cuánto escribe el modo de depuración: básico (corto) o detallado.',
      },
    },
    help: {
      menu: 'Sin nada seleccionado (GM): abre la configuración. Con fichas seleccionadas: inicio o fin de la concentración.',
      toggle:
        'Comienza a concentrarte en un hechizo con las fichas seleccionadas. Nombra un hechizo diferente para cambiar; ejecútelo nuevamente para finalizar.',
      end: 'Finalizar la concentración de los tokens seleccionados.',
      status: 'Enumere quién se está concentrando, con los botones Finalizar.',
      config: 'Cambie una configuración, por ejemplo config auto_roll_save|false.',
      advantageMenu: 'Elige qué personajes tiran las salvaciones de concentración con ventaja.',
      toggleAdvantage: 'Activa o desactiva la ventaja para un personaje.',
      roll: 'Tira una partida guardada desde el botón Tirar o Ventaja de un recordatorio.',
      journal: 'Reconstruya los folletos de la plataforma de ayuda y comando.',
      reset: 'Vuelva a poner cada configuración en su valor predeterminado.',
      help: 'Muestra esta lista.',
      footer:
        'Las instrucciones completas se encuentran en el folleto "{help}"; Los botones se encuentran en el folleto "{deck}".',
      playerFooter: 'Seleccione su token primero.',
    },
    errors: {
      noSelection: 'Seleccione un token primero.',
      notYours: 'Sólo puedes cambiar la concentración de las fichas que controlas.',
      gmOnly: 'Sólo el DJ puede usar ese comando.',
      notConcentrating: 'Esa ficha no se está concentrando.',
      unknownSetting: 'No hay ninguna configuración llamada "{key}".',
      badSettingValue: '"{value}" no es un valor válido para {key}.',
      rollExpired: 'Ese botón ha caducado.',
      unknownCharacter: 'Ese personaje ya no existe.',
      internal: 'Algo salió mal. La consola API tiene los detalles.',
    },
    hints: {
      noSelection: 'Seleccione la ficha del lanzador y luego ejecute el comando nuevamente.',
      rollExpired:
        'Los botones funcionan una vez y durante 10 minutos. Daña la ficha nuevamente para obtener una nueva.',
      unknownSetting: 'Escriba el comando sin nada seleccionado para ver la configuración.',
    },
    warnings: {
      unknownMarker:
        'El marcador de estado "{marker}" no es uno de los marcadores de este juego. Elige otro en la configuración.',
    },
    deck: {
      subtitle: 'Cubierta de mando',
      selected: 'Fichas seleccionadas',
      selectedDesc: 'Primero selecciona la ficha del lanzador.',
      table: 'la mesa',
      tableDesc: 'Vea quién se está concentrando y quién tiene ventaja en sus paradas.',
      tools: 'Herramientas',
      toolsDesc: 'Configuración, la lista de comandos y los folletos.',
      footer: 'Las instrucciones completas se encuentran en el folleto "{help}".',
    },
    handout: {
      versionLabel: 'Versión',
      subtitle: 'Marcadores de concentración, recordatorios y guardados para D&D 5e',
      overview: {
        heading: 'Descripción general',
        body: 'La concentración realiza un seguimiento de quién se concentra en qué hechizo. Pone un marcador en la ficha del lanzador, tira (o solicita) una salvación de Constitución cuando esa ficha sufre daño y le dice a la mesa cuándo termina la concentración.',
      },
      quickStart: {
        heading: 'Inicio rápido',
        steps: [
          'Selecciona la ficha del lanzador y escribe !concentración seguido del hechizo, por ejemplo !concentración Bendecir.',
          'Cambia los puntos de vida del token en su burbuja de barra. Se obtiene una salvación con CD 10, o la mitad del daño si es mayor.',
          'Ejecute el mismo comando nuevamente o retire el marcador para finalizar la concentración.',
          'Escribe !concentración sin nada seleccionado para abrir la configuración.',
        ],
      },
      concentrating: {
        heading: 'Concentrarse',
        points: [
          'Nombrar un hechizo diferente cambia la concentración, como lo hace lanzar un nuevo hechizo de concentración.',
          'Poner el marcador en una ficha con la mano inicia la concentración sin un hechizo; quitarlo o eliminar el token lo finaliza.',
          'Una nueva ficha vinculada de un personaje concentrado obtiene el marcador, y se rastrea una ficha pegada que lleva el marcador.',
          'Las fichas de un personaje con una barra de puntos de vida vinculada comparten concentración. Las fichas no vinculadas, como un grupo de duendes de una hoja, se concentran solas.',
          'Todos ven un mensaje cuando la concentración comienza, cambia o termina, a menos que Enviar recordatorio a indique lo contrario.',
        ],
      },
      saves: {
        heading: 'La concentración salva',
        points: [
          'La CD es 10 o la mitad del daño recibido, lo que sea mayor, hasta CD 30.',
          'El modificador proviene del Atributo Bonus en la hoja del personaje; un valor faltante cuenta como 0.',
          'Rollo automático Guarda rollos a la vez. Cuando está desactivado, el recordatorio tiene botones Roll y Advantage para el jugador o GM.',
          'Una salvación fallida pone fin a la concentración. Con End at 0 HP activado, bajar a 0 puntos de vida termina sin guardar.',
          'El menú de ventajas le da al personaje una ventaja en las partidas guardadas automáticamente, como lo hace la hazaña War Caster.',
        ],
      },
      automatic: {
        heading: 'Hechizos lanzados desde una hoja',
        points: [
          'Con Auto Agregar Con. Marcador encendido, lanzar un hechizo de concentración desde una hoja de D&D 5e 2014 (OGL) o 2024 agrega el marcador.',
          'Las fichas del lanzador en la página que está viendo están marcadas; si no hay ninguno, los tokens de cualquier página sí lo son.',
          'Sólo cuentan las cartas del DJ, de otro Mod o de uno de los jugadores del personaje. Lanzar el mismo hechizo nuevamente no cambia nada.',
          'Una carta de D&D 2024 que solo menciona la concentración en su texto, como la hazaña War Caster, puede iniciar la concentración pero nunca reemplaza un hechizo.',
          'Es posible que las hojas de D&D 2024 necesiten el servidor API experimental. Activa el modo de depuración para ver por qué se detectó o no un hechizo.',
        ],
      },
      players: {
        heading: 'Jugadores',
        points: [
          'Los jugadores pueden iniciar y finalizar la concentración de las fichas que controlan y usar los botones Tirar y Ventaja en sus propias partidas guardadas.',
          'Con Enviar recordatorio para configurar en Personaje, los mensajes se susurran a los jugadores del personaje y al DJ.',
        ],
      },
      commands: {
        heading: 'Comandos',
        intro: 'Otros Mods, como ScriptCards, también pueden enviar estos comandos.',
        colCommand: 'Dominio',
        colDesc: 'que hace',
      },
      settings: {
        heading: 'Ajustes',
        intro:
          'Cambie la configuración con los botones en la tarjeta de configuración o con config <clave>|<valor>. Algunos también se pueden configurar en la página del Mod.',
        colKey: 'Llave',
        colName: 'Nombre',
        colDesc: 'que hace',
      },
      upgrading: {
        heading: 'Actualización desde la versión 1.0',
        points: [
          'La configuración, la lista de ventajas y todos los comandos siguen funcionando.',
          'Los mensajes ahora dicen cuándo termina la concentración y en qué hechizo.',
          'Las fichas que ya llevan el marcador se recogen al inicio.',
        ],
      },
      troubleshooting: {
        heading: 'Solución de problemas',
        points: [
          'No guardar cuando los puntos de vida caen: verifica que la ficha tenga el marcador y que la barra de HP sea la barra que cambiaste. Los cambios realizados por otros Mods a través de la API no generan eventos, por lo que no se ven.',
          'El modificador es 0: compara el Atributo de Bonificación con la hoja del personaje.',
          'Los hechizos lanzados desde la hoja no se detectan: active el modo de depuración, vuelva a lanzar el hechizo y lea la consola API.',
          'Dos personajes comparten un nombre: la detección utiliza la primera coincidencia. Dale a los personajes nombres únicos.',
        ],
      },
      languages: {
        heading: 'Idiomas',
        body: 'La concentración está traducida a los siguientes idiomas. Elija uno con la configuración de Idioma.',
        colCode: 'Código',
        colName: 'Idioma',
        colNative: 'nombre nativo',
      },
      credits: {
        heading: 'Créditos',
        original: 'Mod original de',
        maintainer: 'Mantenido por',
        support: 'Informe errores e ideas en el foro Roll20 Mod o en GitHub.',
      },
      footer: 'Los botones para cada acción se encuentran en el folleto "{deck}".',
    },
  };

  const TRANSLATION$2 = {
    titles: {
      ready: 'Koncentrationen är klar.',
      menu: 'Koncentrationsinställningar',
      help: 'Koncentrationskommandon',
      status: 'Vem koncentrerar sig',
      advantage: 'Fördel på koncentrationsbesparingar',
      reset: 'Återställ koncentration',
      concentration: 'Koncentration',
      save: 'Koncentration Spara',
      check: 'Koncentrationskontroll',
    },
    messages: {
      migrated:
        'Uppgraderad från version 1.0. Dina inställningar och fördelar behölls, och dina gamla makron fungerar fortfarande.',
      reconciled:
        'Kom ikapp kartan: koncentrerade tokens hittades {added}, gamla poster borttagna {dropped}.',
      readyHint: 'Skriv {command} för inställningarna, eller öppna handouten för kommandodäck.',
      settingChanged: '{setting} är nu {value}.',
      confirmReset:
        'Vill du återställa alla inställningar till standardinställningarna och rensa fördelarlistan? Koncentrationsmarkörer på kartan stannar.',
      reset: 'Inställningarna återställs till sina standardinställningar.',
      journal: 'Handouts ombyggda: {help} och {deck}.',
    },
    notices: {
      started: '{name} koncentrerar sig nu på {spell}.',
      startedNoSpell: '{name} koncentrerar sig nu.',
      switched: '{name} slutar koncentrera sig på {old} och koncentrerar sig nu på {spell}.',
      switchedNoSpell: '{name} koncentrerar sig nu.',
      ended: '{name} koncentrerar sig inte längre på {spell}.',
      endedNoSpell: '{name} koncentrerar sig inte längre.',
      lost: '{name} tappar koncentrationen på {spell}.',
      lostNoSpell: '{name} tappar koncentrationen.',
      kept: '{name} fortsätter att koncentrera sig på {spell}.',
      keptNoSpell: '{name} fortsätter att koncentrera sig.',
      zeroHp: '{name} sjunker till 0 träffpoäng och tappar koncentrationen på {spell}.',
      zeroHpNoSpell: '{name} sjunker till 0 träffpoäng och tappar koncentrationen.',
      checkNeeded:
        '{name} måste göra en konstitutionsräddning för att fortsätta koncentrera sig: {dc}.',
    },
    save: {
      dc: 'DC',
      dcValue: 'DC {dc}',
      modifier: 'Modifierare',
      roll: 'Rulla',
      advantageRoll: '{first} och {second} (fördel)',
      success: 'Framgång',
      failure: 'Fel',
    },
    menu: {
      concentratingCount: 'Koncentrerar dig nu: {count}',
      settings: 'Inställningar',
      footer:
        'Skriv {command} för att komma tillbaka hit. Varje knapp finns också i "{deck}"-handouten.',
    },
    status: {
      none: 'Ingen koncentrerar sig.',
    },
    advantage: {
      intro:
        'Karaktärer inställda på On roll deras koncentrationsräddningar med fördel, som med War Caster-bedriften. Detta gäller automatiska besparingar.',
      none: 'Det finns inga karaktärer i det här spelet.',
    },
    buttons: {
      roll: 'Rulla',
      advantage: 'Fördel',
      status: 'Status',
      advantageMenu: 'Fördelsmeny',
      help: 'Hjälp',
      reset: 'Återställa',
      confirmReset: 'Återställ inställningar',
      end: 'Avsluta',
      menu: 'Meny',
      concentrate: 'Koncentrera dig på…',
      toggle: 'Växla',
      journal: 'Bygg om åhörarkopior',
    },
    prompts: {
      spell: 'Stava',
    },
    values: {
      on: 'På',
      off: 'Av',
      bar: 'Stapel {bar}',
      unnamed: 'Namnlös',
      sendTo: {
        everyone: 'Alla',
        character: 'Karaktär',
        gm: 'GM',
      },
      supportMode: {
        basic: 'Grundläggande',
        detailed: 'Detaljerad',
      },
    },
    settings: {
      language: {
        label: 'Språk',
        desc: 'Språket för chattmeddelanden och åhörarkopior.',
      },
      command: {
        label: 'Kommando',
        desc: 'Chattkommandot, utan "!". Makro i version 1.0 använder koncentration.',
      },
      statusmarker: {
        label: 'Statusmarkör',
        desc: 'Tokenmarkören som visar koncentration. Anpassade tokenmarkörer kan användas.',
      },
      bar: {
        label: 'HP Bar',
        desc: 'Tokenstapeln som håller träffpoäng. Skador på den kräver en koncentrationsräddning.',
      },
      send_reminder_to: {
        label: 'Skicka påminnelse till',
        desc: 'Vem ser koncentrationsmeddelanden och sparar: alla, GM eller karaktärens spelare (GM får en kopia).',
      },
      auto_add_concentration_marker: {
        label: 'Auto Add Con. Markör',
        desc: 'Lägg till markören när en koncentrationsbesvärjelse gjuts från ett ark.',
        hint: 'D&D 5e 2014 (OGL) och 2024 blad.',
      },
      auto_roll_save: {
        label: 'Spara automatiskt',
        desc: 'Rulla räddningen så fort en koncentrerad token tar skada. När den är avstängd har påminnelsen Roll- och Advantage-knappar.',
      },
      show_roll_button: {
        label: 'Rullknapp',
        desc: 'Lägg till knapparna Roll och Advantage till påminnelsen när Auto Roll Save är avstängt.',
      },
      end_at_zero: {
        label: 'Slutar på 0 hk',
        desc: 'Avsluta koncentrationen utan en räddning när en token sjunker till 0 träffpoäng.',
      },
      bonus_attribute: {
        label: 'Bonusattribut',
        desc: 'Arkattributet som läggs till koncentration sparar. constitution_save_mod fungerar på D&D 5e 2014 och 2024 ark.',
      },
      debug: {
        label: 'Felsökningsläge',
        desc: 'Skriv anteckningar om stavningsdetektering och sparar till API-konsolen för supportförfrågningar.',
      },
      support_mode: {
        label: 'Supportläge',
        desc: 'Hur mycket Debug Mode skriver: Grundläggande (kort) eller Detaljerad.',
      },
    },
    help: {
      menu: 'Med ingenting valt (GM): öppna inställningarna. Med tokens valda: start- eller slutkoncentration.',
      toggle:
        'Börja koncentrera dig på en besvärjelse med de valda tokens. Namnge en annan besvärjelse att byta; kör det igen för att avsluta.',
      end: 'Slutkoncentration för de valda tokens.',
      status: 'Lista vem som koncentrerar sig, med Avsluta-knapparna.',
      config: 'Ändra en inställning, till exempel config auto_roll_save|false.',
      advantageMenu: 'Välj med fördel vilka karaktärer som rullkoncentrationen sparar.',
      toggleAdvantage: 'Slå på eller av fördel för en karaktär.',
      roll: 'Rulla en spara från en påminnelse Roll eller Advantage-knapp.',
      journal: 'Bygg om hjälp- och kommandodäcken.',
      reset: 'Återställ varje inställning till standardinställningen.',
      help: 'Visa den här listan.',
      footer:
        'Fullständiga instruktioner finns i "{help}"-handouten; knappar finns i "{deck}"-utdelningsbladet.',
      playerFooter: 'Välj din token först.',
    },
    errors: {
      noSelection: 'Välj en token först.',
      notYours: 'Du kan bara ändra koncentrationen för tokens du kontrollerar.',
      gmOnly: 'Endast GM kan använda det kommandot.',
      notConcentrating: 'Den token koncentrerar sig inte.',
      unknownSetting: 'Det finns ingen inställning som heter "{key}".',
      badSettingValue: '"{value}" är inte ett giltigt värde för {key}.',
      rollExpired: 'Den knappen har gått ut.',
      unknownCharacter: 'Den karaktären finns inte längre.',
      internal: 'Något gick fel. API-konsolen har detaljerna.',
    },
    hints: {
      noSelection: 'Välj casterns token och kör sedan kommandot igen.',
      rollExpired: 'Knappar fungerar en gång och i 10 minuter. Skada token igen för en ny.',
      unknownSetting: 'Skriv kommandot med inget markerat för att se inställningarna.',
    },
    warnings: {
      unknownMarker:
        'Statusmarkören "{marker}" är inte en av detta spels markörer. Välj en annan i inställningarna.',
    },
    deck: {
      subtitle: 'Kommandodäck',
      selected: 'Valda tokens',
      selectedDesc: 'Välj casterns token först.',
      table: 'Tabellen',
      tableDesc: 'Se vem som koncentrerar sig och vem som har fördel på sina räddningar.',
      tools: 'Verktyg',
      toolsDesc: 'Inställningar, kommandolistan och åhörarkopiorna.',
      footer: 'Fullständiga instruktioner finns i "{help}" handout.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Koncentrationsmarkörer, påminnelser och sparningar för D&D 5e',
      overview: {
        heading: 'Översikt',
        body: 'Koncentration håller reda på vem som koncentrerar sig på vilken besvärjelse. Den sätter en markör på kastarens token, rullar (eller ber om) en konstitutionsräddning när den poletten tar skada och talar om för bordet när koncentrationen tar slut.',
      },
      quickStart: {
        heading: 'Snabbstart',
        steps: [
          'Välj casterns token och skriv !koncentration följt av besvärjelsen, till exempel !koncentration Välsigna.',
          'Ändra tokens träffpunkter i dess barbubbla. En räddning rullas på DC 10, eller halva skadan om den är högre.',
          'Kör samma kommando igen, eller ta av markören, för att avsluta koncentrationen.',
          'Skriv !koncentration med ingenting markerat för att öppna inställningarna.',
        ],
      },
      concentrating: {
        heading: 'Koncentrerar sig',
        points: [
          'Genom att namnge en annan besvärjelse ändras koncentrationen till den, som en ny koncentrationsbesvärjelse gör.',
          'Att sätta markören på en token för hand startar koncentrationen utan en besvärjelse; ta bort den eller radera token, avslutar den.',
          'En ny länkad token av en koncentrerande karaktär får markören, och en inklistrad token som bär markören spåras.',
          'Tokens av en karaktär med en länkad träffpunktstapel delar koncentration. Olänkade tokens, till exempel ett paket troll från ett ark, koncentrerar sig på egen hand.',
          'Alla ser ett meddelande när koncentrationen börjar, växlar eller slutar, om inte Skicka påminnelse till säger något annat.',
        ],
      },
      saves: {
        heading: 'Koncentration räddar',
        points: [
          'DC är 10 eller hälften av skadan, beroende på vilket som är högst, upp till DC 30.',
          'Modifieraren kommer från bonusattributet på karaktärens ark; ett saknat värde räknas som 0.',
          'Auto Roll Spara rullar på en gång. När den är avstängd har påminnelsen Roll- och Advantage-knappar för spelaren eller GM.',
          'En misslyckad räddning gör slut på koncentrationen. Med End at 0 HP på, sjunker till 0 träffpoäng slutar det utan räddning.',
          'Advantage-menyn ger en karaktärsfördel vid automatiska räddningar, som War Caster-bedriften gör.',
        ],
      },
      automatic: {
        heading: 'Trollformler gjutna från ett ark',
        points: [
          'Med Auto Add Con. Markör på, kasta en koncentrationsbesvärjelse från ett D&D 5e 2014 (OGL) eller 2024 ark lägger till markören.',
          'Castarens tokens på sidan de tittar på är markerade; om det inte finns några, är tokens på vilken sida som helst.',
          'Endast kort från GM, en annan Mod eller en av karaktärens spelare räknas. Att kasta samma besvärjelse igen förändrar ingenting.',
          'Ett D&D 2024-kort som bara nämner koncentration i sin text, till exempel War Caster-bedriften, kan starta koncentration men ersätter aldrig en besvärjelse.',
          'D&D 2024-ark kan behöva Experimental API-servern. Aktivera felsökningsläget för att se varför en besvärjelse upptäcktes eller inte.',
        ],
      },
      players: {
        heading: 'Spelare',
        points: [
          'Spelare kan börja och avsluta koncentrationen för tokens de kontrollerar och använda knapparna Roll och Advantage på sina egna räddningar.',
          'Med Skicka påminnelse För att ställa in på Karaktär viskas meddelanden till karaktärens spelare och till GM.',
        ],
      },
      commands: {
        heading: 'Kommandon',
        intro: 'Andra Mods, som ScriptCards, kan också skicka dessa kommandon.',
        colCommand: 'Kommando',
        colDesc: 'Vad den gör',
      },
      settings: {
        heading: 'Inställningar',
        intro:
          'Ändra inställningar med knapparna på inställningskortet, eller med config <nyckel>|<värde>. Vissa kan också ställas in på Mods sida.',
        colKey: 'Nyckel',
        colName: 'Namn',
        colDesc: 'Vad den gör',
      },
      upgrading: {
        heading: 'Uppgraderar från version 1.0',
        points: [
          'Inställningar, fördelslistan och varje kommando fortsätter att fungera.',
          'Meddelanden säger nu när koncentrationen upphör och på vilken besvärjelse.',
          'Polletter som redan bär markören plockas upp vid start.',
        ],
      },
      troubleshooting: {
        heading: 'Felsökning',
        points: [
          'Ingen räddning när träffpunkterna faller: kontrollera att token har markören och att HP Bar är stapeln du ändrade. Ändringar som görs av andra Mods via API:n skapar inga händelser, så de syns inte.',
          'Modifieraren är 0: kontrollera bonusattributet mot karaktärens ark.',
          'Besvärjelser som kastas från arket upptäcks inte: aktivera felsökningsläge, trollformel igen och läs API-konsolen.',
          'Två tecken delar ett namn: detektion använder den första matchningen. Ge karaktärer unika namn.',
        ],
      },
      languages: {
        heading: 'Språk',
        body: 'Koncentration översätts till språken nedan. Välj en med språkinställningen.',
        colCode: 'Koda',
        colName: 'Språk',
        colNative: 'Inhemskt namn',
      },
      credits: {
        heading: 'Krediter',
        original: 'Original Mod av',
        maintainer: 'Underhålls av',
        support: 'Rapportera buggar och idéer på Roll20 Mod-forumet eller på GitHub.',
      },
      footer: 'Knappar för varje åtgärd finns i utdelningsbladet "{deck}".',
    },
  };

  const TRANSLATION$1 = {
    titles: {
      ready: 'Konsantrasyon hazır.',
      menu: 'Konsantrasyon Ayarları',
      help: 'Konsantrasyon Komutları',
      status: 'Kim Konsantre Oluyor',
      advantage: 'Konsantrasyon Tasarrufu Avantajı',
      reset: 'Konsantrasyonu Sıfırla',
      concentration: 'Konsantrasyon',
      save: 'Konsantrasyon Tasarrufu',
      check: 'Konsantrasyon Kontrolü',
    },
    messages: {
      migrated:
        '1.0 sürümünden yükseltildi. Ayarlarınız ve avantaj listeniz tutuldu ve eski makrolarınız hala çalışıyor.',
      reconciled:
        'Haritayı yakaladım: konsantre jetonlar bulundu {added}, eski girişler kaldırıldı {dropped}.',
      readyHint: 'Ayarlar için {command} yazın veya Command Deck broşürünü açın.',
      settingChanged: '{setting} artık {value} oldu.',
      confirmReset:
        'Her ayarı varsayılan ayarlarına döndürüp avantaj listesini temizlemek mi istiyorsunuz? Haritadaki konsantrasyon işaretleri kalıyor.',
      reset: 'Ayarlar varsayılan değerlerine geri döndürülür.',
      journal: 'Dinleyici notları yeniden oluşturuldu: {help} ve {deck}.',
    },
    notices: {
      started: '{name} şimdi {spell} üzerinde yoğunlaşıyor.',
      startedNoSpell: '{name} şimdi konsantre oluyor.',
      switched:
        '{name}, {old} üzerinde yoğunlaşmayı bırakıyor ve şimdi {spell} üzerinde yoğunlaşıyor.',
      switchedNoSpell: '{name} şimdi konsantre oluyor.',
      ended: '{name} artık {spell} üzerinde yoğunlaşmıyor.',
      endedNoSpell: '{name} artık konsantre değil.',
      lost: '{name}, {spell} üzerindeki konsantrasyonunu kaybediyor.',
      lostNoSpell: '{name} konsantrasyonunu kaybediyor.',
      kept: '{name}, {spell} üzerinde yoğunlaşmaya devam ediyor.',
      keptNoSpell: '{name} konsantre olmaya devam ediyor.',
      zeroHp: '{name} 0 can puanına düşer ve {spell} üzerindeki konsantrasyonunu kaybeder.',
      zeroHpNoSpell: '{name} 0 can puanına düşer ve konsantrasyonunu kaybeder.',
      checkNeeded:
        '{name} konsantre olmaya devam etmek için Anayasa kurtarıcı atışı yapmalı: {dc}.',
    },
    save: {
      dc: 'DC',
      dcValue: 'DC {dc}',
      modifier: 'Değiştirici',
      roll: 'Rulo',
      advantageRoll: '{first} ve {second} (avantaj)',
      success: 'Başarı',
      failure: 'Arıza',
    },
    menu: {
      concentratingCount: 'Şimdi konsantre oluyorum: {count}',
      settings: 'Ayarlar',
      footer:
        'Buraya geri dönmek için {command} yazın. Her düğme aynı zamanda "{deck}" broşüründe de bulunmaktadır.',
    },
    status: {
      none: 'Kimse konsantre olmuyor.',
    },
    advantage: {
      intro:
        'Yuvarlanmada olarak ayarlanan karakterler, War Caster becerisinde olduğu gibi konsantrasyonlarını avantajlı bir şekilde kurtarır. Bu otomatik kaydetmeler için geçerlidir.',
      none: 'Bu oyunda karakter yok.',
    },
    buttons: {
      roll: 'Rulo',
      advantage: 'Avantaj',
      status: 'Durum',
      advantageMenu: 'Avantaj Menüsü',
      help: 'Yardım',
      reset: 'Sıfırla',
      confirmReset: 'Ayarları Sıfırla',
      end: 'Son',
      menu: 'Menü',
      concentrate: 'Şuna konsantre olun…',
      toggle: 'Değiştir',
      journal: 'Ödevleri Yeniden Oluştur',
    },
    prompts: {
      spell: 'Hecelemek',
    },
    values: {
      on: 'Açık',
      off: 'Kapalı',
      bar: 'Çubuk {bar}',
      unnamed: 'İsimsiz',
      sendTo: {
        everyone: 'Herkes',
        character: 'Karakter',
        gm: 'GM',
      },
      supportMode: {
        basic: 'Temel',
        detailed: 'Ayrıntılı',
      },
    },
    settings: {
      language: {
        label: 'Dil',
        desc: 'Sohbet mesajlarının ve bildirilerin dili.',
      },
      command: {
        label: 'Emretmek',
        desc: '"!" olmadan sohbet komutu. Sürüm 1.0 makroları konsantrasyonu kullanır.',
      },
      statusmarker: {
        label: 'Durum İşaretleyicisi',
        desc: 'Konsantrasyonu gösteren belirteç işaretçisi. Özel jeton işaretleyicileri kullanılabilir.',
      },
      bar: {
        label: 'HP Çubuğu',
        desc: 'Can puanlarını tutan jeton çubuğu. Hasar görmesi, konsantrasyon tasarrufu gerektirir.',
      },
      send_reminder_to: {
        label: 'Hatırlatıcı Gönder',
        desc: 'Konsantrasyon mesajlarını kim görür ve kaydeder: herkes, GM veya karakterin oyuncuları (GM bir kopya alır).',
      },
      auto_add_concentration_marker: {
        label: 'Otomatik Bağlantı Ekle işaretleyici',
        desc: 'Bir sayfadan konsantrasyon büyüsü yapıldığında işaretçiyi ekleyin.',
        hint: 'D&D 5e 2014 (OGL) ve 2024 sayfaları.',
      },
      auto_roll_save: {
        label: 'Otomatik Rulo Kaydetme',
        desc: 'Konsantre jeton hasar alır almaz kurtarma işlemini gerçekleştirin. Kapalıyken hatırlatıcının Döndür ve Avantaj düğmeleri bulunur.',
      },
      show_roll_button: {
        label: 'Rulo Düğmesi',
        desc: 'Otomatik Rulo Kaydetme kapalıyken hatırlatıcıya Rulo ve Avantaj düğmelerini ekleyin.',
      },
      end_at_zero: {
        label: "0 HP'de son",
        desc: 'Bir jeton 0 can puanına düştüğünde, kaydetmeden konsantrasyonu sonlandırın.',
      },
      bonus_attribute: {
        label: 'Bonus Özelliği',
        desc: 'Konsantrasyon kayıtlarına eklenen sayfa özelliği. anayasa_save_mod, D&D 5e 2014 ve 2024 sayfalarında çalışır.',
      },
      debug: {
        label: 'Hata Ayıklama Modu',
        desc: 'Destek istekleri için yazım algılama ve API konsoluna kaydetme hakkında notlar yazın.',
      },
      support_mode: {
        label: 'Destek Modu',
        desc: 'Hata Ayıklama Modu ne kadar yazar: Temel (kısa) veya Ayrıntılı.',
      },
    },
    help: {
      menu: 'Hiçbir şey seçili değilken (GM): ayarları açın. Belirteçler seçiliyken: konsantrasyonu başlatın veya sonlandırın.',
      toggle:
        'Seçilen jetonlarla büyüye odaklanmaya başlayın. Değiştirilecek farklı bir büyüye isim verin; bitirmek için tekrar çalıştırın.',
      end: 'Seçilen tokenlar için konsantrasyonu sonlandırın.',
      status: 'Bitir düğmeleriyle kimin konsantre olduğunu listeleyin.',
      config: 'Bir ayarı değiştirin, örneğin config auto_roll_save|false.',
      advantageMenu: 'Rulo konsantrasyonunun hangi karakterleri avantajla kurtaracağını seçin.',
      toggleAdvantage: 'Bir karakter için avantajı açın veya kapatın.',
      roll: 'Bir hatırlatıcının Döndür veya Avantaj düğmesinden bir kaydetme yapın.',
      journal: 'Yardım ve Komut Paneli bildirilerini yeniden oluşturun.',
      reset: 'Her ayarı varsayılana geri döndürün.',
      help: 'Bu listeyi göster.',
      footer:
        'Talimatların tamamı "{help}" broşüründe yer almaktadır; düğmeler "{deck}" broşüründedir.',
      playerFooter: 'Önce jetonunuzu seçin.',
    },
    errors: {
      noSelection: 'Önce bir jeton seçin.',
      notYours: 'Yalnızca kontrol ettiğiniz tokenların konsantrasyonunu değiştirebilirsiniz.',
      gmOnly: 'Bu komutu yalnızca GM kullanabilir.',
      notConcentrating: 'Bu jeton yoğunlaşmıyor.',
      unknownSetting: '"{key}" adında bir ayar yoktur.',
      badSettingValue: '"{value}", {key} için geçerli bir değer değil.',
      rollExpired: 'Bu düğmenin süresi doldu.',
      unknownCharacter: 'O karakter artık yok.',
      internal: 'Bir şeyler ters gitti. API konsolu ayrıntılara sahiptir.',
    },
    hints: {
      noSelection: 'Tekerin jetonunu seçin ve ardından komutu tekrar çalıştırın.',
      rollExpired:
        'Düğmeler bir kez ve 10 dakika süreyle çalışır. Yenisini almak için jetona tekrar zarar verin.',
      unknownSetting: 'Ayarları görmek için hiçbir şey seçili değilken komutu yazın.',
    },
    warnings: {
      unknownMarker:
        '"{marker}" durum işaretçisi bu oyunun işaretçilerinden biri değil. Ayarlardan başka bir tane seçin.',
    },
    deck: {
      subtitle: 'Komut Güvertesi',
      selected: 'Seçilen Tokenlar',
      selectedDesc: 'Önce uygulayıcının jetonunu seçin.',
      table: 'Masa',
      tableDesc: 'Kimin konsantre olduğunu ve kurtarışlarında kimin avantajlı olduğunu görün.',
      tools: 'Aletler',
      toolsDesc: 'Ayarlar, komut listesi ve bildiriler.',
      footer: 'Talimatların tamamı "{help}" broşüründe yer almaktadır.',
    },
    handout: {
      versionLabel: 'Sürüm',
      subtitle: 'D&D 5e için konsantrasyon işaretleri, hatırlatıcılar ve kayıtlar',
      overview: {
        heading: 'Genel Bakış',
        body: 'Konsantrasyon kimin hangi büyüye konsantre olduğunu takip eder. Kullananın jetonunun üzerine bir işaret koyar, jeton hasar aldığında bir Anayasa tasarrufu atar (veya ister) ve konsantrasyonun ne zaman sona erdiğini masaya bildirir.',
      },
      quickStart: {
        heading: 'Hızlı başlangıç',
        steps: [
          'Büyücünün jetonunu seçin ve !concentration yazın ve ardından büyüyü yapın, örneğin !concentration Bless.',
          "Çubuk balonundaki jetonun can puanlarını değiştirin. DC 10'da bir kurtarma veya daha yüksekse hasarın yarısı alınır.",
          'Konsantrasyonu sonlandırmak için aynı komutu tekrar çalıştırın veya işaretçiyi çıkarın.',
          'Ayarları açmak için hiçbir şey seçili değilken !concentration yazın.',
        ],
      },
      concentrating: {
        heading: 'Konsantre olma',
        points: [
          'Farklı bir büyüyü adlandırmak, yeni bir konsantrasyon büyüsü yapmakta olduğu gibi konsantrasyonu ona değiştirir.',
          'İşaretçiyi bir jetonun üzerine elle koymak, büyü olmadan konsantrasyonu başlatır; onu çıkarmak veya jetonu silmek onu sona erdirir.',
          'Konsantre karakterin yeni bağlantılı jetonu işaretçiyi alır ve işaretçiyi taşıyan yapıştırılmış jeton izlenir.',
          'Bağlantılı can puanı çubuğu payı konsantrasyonuna sahip bir karakterin jetonları. Bir sayfadaki goblin paketi gibi bağlantısız jetonlar kendi başlarına yoğunlaşır.',
          'Hatırlatıcıyı Gönder aksi belirtilmediği sürece konsantrasyon başladığında, değiştiğinde veya sona erdiğinde herkes bir mesaj görür.',
        ],
      },
      saves: {
        heading: 'Konsantrasyon kaydeder',
        points: [
          "DC, DC 30'a kadar, hangisi daha yüksekse, alınan hasarın 10'u veya yarısı kadardır.",
          'Değiştirici, karakterin sayfasındaki Bonus Özelliğinden gelir; eksik bir değer 0 olarak sayılır.',
          'Otomatik Rulo Ruloları bir kerede kaydedin. Kapalı olduğunda, hatırlatıcının oyuncu veya GM için Roll ve Advantage düğmeleri bulunur.',
          "Başarısız bir kaydetme konsantrasyonu sona erdirir. 0 HP'de Son açıkken, 0 can puanına düşmek kaydetmeden sona erer.",
          "Avantaj Menüsü, War Caster'ın yaptığı gibi, otomatik kaydetmelerde karakter avantajı sağlar.",
        ],
      },
      automatic: {
        heading: 'Bir sayfadan yapılan büyüler',
        points: [
          'Otomatik Ekleme ile. İşaret açıkken, D&D 5e 2014 (OGL) veya 2024 sayfasından konsantrasyon büyüsü yapmak işaretleyiciyi ekler.',
          'Sunucunun görüntüledikleri sayfadaki jetonları işaretlenmiştir; hiçbiri yoksa, herhangi bir sayfadaki jetonlar vardır.',
          "Yalnızca GM'den, başka bir Moddan veya karakterin oyuncularından birinin kartları sayılır. Aynı büyüyü tekrar yapmak hiçbir şeyi değiştirmez.",
          'War Caster becerisi gibi metninde yalnızca konsantrasyondan bahseden bir D&D 2024 kartı, konsantrasyonu başlatabilir ancak hiçbir zaman bir büyünün yerini almaz.',
          'D&D 2024 sayfaları Experimental API sunucusuna ihtiyaç duyabilir. Bir büyünün neden algılandığını veya algılanmadığını görmek için Hata Ayıklama Modunu açın.',
        ],
      },
      players: {
        heading: 'Oyuncular',
        points: [
          'Oyuncular, kontrol ettikleri jetonlar için konsantrasyonu başlatabilir ve sonlandırabilir ve kendi kayıtlarında Roll ve Advantage düğmelerini kullanabilirler.',
          "Hatırlatma Gönderimi Karakter olarak ayarlandığında, mesajlar karakterin oyuncularına ve GM'ye fısıldanır.",
        ],
      },
      commands: {
        heading: 'Komutlar',
        intro: "ScriptCard'lar gibi diğer Modlar da bu komutları gönderebilir.",
        colCommand: 'Emretmek',
        colDesc: 'Ne işe yarar',
      },
      settings: {
        heading: 'Ayarlar',
        intro:
          'Ayarları, ayarlar kartındaki düğmelerle veya config <anahtar>|<değer> ile değiştirin. Bazıları Modun sayfasında da ayarlanabilir.',
        colKey: 'Anahtar',
        colName: 'İsim',
        colDesc: 'Ne işe yarar',
      },
      upgrading: {
        heading: "Sürüm 1.0'dan yükseltme",
        points: [
          'Ayarlar, avantaj listesi ve her komut çalışmaya devam ediyor.',
          'Mesajlarda artık konsantrasyonun ne zaman ve hangi büyüde biteceği belirtiliyor.',
          'Zaten işaretçiyi taşıyan jetonlar başlangıçta alınır.',
        ],
      },
      troubleshooting: {
        heading: 'Sorun giderme',
        points: [
          'Can puanları düştüğünde kaydetme yok: jetonda işaret bulunduğunu ve HP Çubuğunun değiştirdiğiniz çubuk olup olmadığını kontrol edin. API aracılığıyla diğer Modlar tarafından yapılan değişiklikler olayları artırmaz, dolayısıyla görülmezler.',
          "Değiştirici 0'dır: Bonus Niteliğini karakterin sayfasına göre kontrol edin.",
          'Sayfadan yapılan büyüler algılanmıyor: Hata Ayıklama Modunu açın, büyüyü tekrar yapın ve API konsolunu okuyun.',
          'İki karakter aynı adı paylaşır: algılama ilk eşleşmeyi kullanır. Karakterlere benzersiz adlar verin.',
        ],
      },
      languages: {
        heading: 'Diller',
        body: 'Konsantrasyon aşağıdaki dillere çevrilmiştir. Dil ayarına sahip birini seçin.',
        colCode: 'Kod',
        colName: 'Dil',
        colNative: 'Yerel ad',
      },
      credits: {
        heading: 'Kredi',
        original: 'Orijinal Mod:',
        maintainer: 'Tarafından sürdürülüyor',
        support: "Hataları ve fikirleri Roll20 Mod forumunda veya GitHub'da bildirin.",
      },
      footer: 'Her eyleme ilişkin düğmeler "{deck}" broşüründe yer almaktadır.',
    },
  };

  const TRANSLATION = {
    titles: {
      ready: 'Концентрація готова.',
      menu: 'Налаштування концентрації',
      help: 'Команди концентрації',
      status: 'Хто концентрується',
      advantage: 'Перевага на збереження концентрації',
      reset: 'Скинути концентрацію',
      concentration: 'Концентрація',
      save: 'Збереження концентрації',
      check: 'Перевірка концентрації',
    },
    messages: {
      migrated:
        'Оновлено з версії 1.0. Ваші налаштування та список переваг збережено, а ваші старі макроси все ще працюють.',
      reconciled:
        'Нагнали карту: маркери концентрації знайдено {added}, старі записи видалено {dropped}.',
      readyHint:
        'Введіть {command} для налаштувань або відкрийте роздатковий матеріал Command Deck.',
      settingChanged: '{setting} тепер {value}.',
      confirmReset:
        'Повернути всі налаштування до стандартних і очистити список переваг? Маркери концентрації на карті залишаються.',
      reset: 'Налаштування повертаються до стандартних.',
      journal: 'Роздаткові матеріали перебудовано: {help} та {deck}.',
    },
    notices: {
      started: '{name} зараз зосереджується на {spell}.',
      startedNoSpell: '{name} зараз зосереджується.',
      switched: '{name} перестає зосереджуватися на {old} і тепер зосереджується на {spell}.',
      switchedNoSpell: '{name} зараз зосереджується.',
      ended: '{name} більше не зосереджується на {spell}.',
      endedNoSpell: '{name} більше не зосереджується.',
      lost: '{name} втрачає концентрацію на {spell}.',
      lostNoSpell: '{name} втрачає концентрацію.',
      kept: '{name} продовжує зосереджуватися на {spell}.',
      keptNoSpell: '{name} продовжує зосереджуватися.',
      zeroHp: '{name} падає до 0 очок життя та втрачає концентрацію на {spell}.',
      zeroHpNoSpell: '{name} падає до 0 очок життя та втрачає концентрацію.',
      checkNeeded: '{name} повинен зробити рятувальний кидок Конституції, щоб зосередитися: {dc}.',
    },
    save: {
      dc: 'DC',
      dcValue: 'DC {dc}',
      modifier: 'Модифікатор',
      roll: 'рулет',
      advantageRoll: '{first} та {second} (перевага)',
      success: 'Успіх',
      failure: 'провал',
    },
    menu: {
      concentratingCount: 'Зараз концентруюся: {count}',
      settings: 'Налаштування',
      footer:
        'Введіть {command}, щоб повернутися сюди. Кожна кнопка також є в роздатковому матеріалі "{deck}".',
    },
    status: {
      none: 'Ніхто не зосереджується.',
    },
    advantage: {
      intro:
        'Персонажі, налаштовані на On roll, зберігають свою концентрацію з перевагою, як у випадку з War Caster feat. Це стосується автоматичного збереження.',
      none: 'У цій грі немає персонажів.',
    },
    buttons: {
      roll: 'рулет',
      advantage: 'Перевага',
      status: 'Статус',
      advantageMenu: 'Меню переваг',
      help: 'Довідка',
      reset: 'Скинути',
      confirmReset: 'Скинути налаштування',
      end: 'Кінець',
      menu: 'Меню',
      concentrate: 'Зосередьтеся на…',
      toggle: 'Перемикач',
      journal: 'Перебудуйте роздаткові матеріали',
    },
    prompts: {
      spell: 'Заклинання',
    },
    values: {
      on: 'Увімкнено',
      off: 'Вимкнено',
      bar: 'Бар {bar}',
      unnamed: 'Без назви',
      sendTo: {
        everyone: 'Всі',
        character: 'характер',
        gm: 'GM',
      },
      supportMode: {
        basic: 'Базовий',
        detailed: 'Детальний',
      },
    },
    settings: {
      language: {
        label: 'Мова',
        desc: 'Мова повідомлень чату та роздаткових матеріалів.',
      },
      command: {
        label: 'Команда',
        desc: 'Команда чату без "!". Макроси версії 1.0 використовують концентрацію.',
      },
      statusmarker: {
        label: 'Маркер стану',
        desc: 'Маркер маркера, який показує концентрацію. Можна використовувати власні маркери маркерів.',
      },
      bar: {
        label: 'Панель HP',
        desc: 'Панель жетонів, яка містить очки життя. Його пошкодження вимагає збереження концентрації.',
      },
      send_reminder_to: {
        label: 'Надіслати нагадування',
        desc: 'Хто бачить повідомлення концентрації та рятує: усі, GM або гравці персонажа (GM отримує копію).',
      },
      auto_add_concentration_marker: {
        label: 'Автоматичне додавання кон. Маркер',
        desc: 'Додайте маркер, коли заклинання концентрації кидається з аркуша.',
        hint: 'D&D 5e 2014 (OGL) та 2024 арк.',
      },
      auto_roll_save: {
        label: 'Автоматичне збереження рулону',
        desc: 'Киньте збереження, як тільки жетон концентрації отримає пошкодження. Якщо вимкнено, нагадування має кнопки «Киток» і «Перевага».',
      },
      show_roll_button: {
        label: 'Рулонна кнопка',
        desc: 'Додайте кнопки Roll і Advantage до нагадування, коли Auto Roll Save вимкнено.',
      },
      end_at_zero: {
        label: 'Кінець при 0 HP',
        desc: 'Припиніть концентрацію без збереження, коли фішка впаде до 0 очок життя.',
      },
      bonus_attribute: {
        label: 'Бонусний атрибут',
        desc: 'Атрибут аркуша, доданий до концентрації, зберігає. constitution_save_mod працює на аркушах D&D 5e 2014 та 2024.',
      },
      debug: {
        label: 'Режим налагодження',
        desc: 'Напишіть примітки про виявлення орфографії та збереження на консолі API для запитів на підтримку.',
      },
      support_mode: {
        label: 'Режим підтримки',
        desc: 'Скільки записує режим налагодження: базовий (короткий) або докладний.',
      },
    },
    help: {
      menu: 'Якщо нічого не вибрано (GM): відкрийте налаштування. З вибраними жетонами: почати або завершити концентрацію.',
      toggle:
        'Почніть зосереджуватися на заклинанні з вибраними жетонами. Назвіть інше заклинання для перемикання; запустіть його знову, щоб завершити.',
      end: 'Кінцева концентрація для вибраних токенів.',
      status: 'Список тих, хто зосереджений, за допомогою кнопок «Завершити».',
      config: 'Змініть налаштування, наприклад config auto_roll_save|false.',
      advantageMenu: 'Виберіть, яких персонажів концентрація кидка зберігає з перевагою.',
      toggleAdvantage: 'Увімкніть або вимкніть перевагу для одного персонажа.',
      roll: 'Зробіть сейв із нагадування, натиснувши кнопку Кинути або Переваги.',
      journal: 'Перебудуйте роздаткові матеріали довідки та командної колоди.',
      reset: 'Поверніть усі налаштування до стандартних.',
      help: 'Покажіть цей список.',
      footer:
        'Повні інструкції наведено в роздатковому матеріалі "{help}"; кнопки знаходяться в роздатковому матеріалі "{deck}".',
      playerFooter: 'Спочатку виберіть свій маркер.',
    },
    errors: {
      noSelection: 'Спочатку виберіть маркер.',
      notYours: 'Ви можете змінити концентрацію лише для токенів, якими ви керуєте.',
      gmOnly: 'Тільки GM може використовувати цю команду.',
      notConcentrating: 'Цей маркер не концентрується.',
      unknownSetting: 'Немає параметра під назвою "{key}".',
      badSettingValue: '"{value}" не є дійсним значенням для {key}.',
      rollExpired: 'Термін дії кнопки закінчився.',
      unknownCharacter: 'Цього персонажа більше не існує.',
      internal: 'Щось пішло не так. У консолі API є деталі.',
    },
    hints: {
      noSelection: 'Виберіть жетон заклинача, а потім знову виконайте команду.',
      rollExpired:
        'Кнопки працюють один раз і 10 хвилин. Знову пошкодіть жетон, щоб отримати новий.',
      unknownSetting: 'Введіть команду, не виділивши нічого, щоб переглянути налаштування.',
    },
    warnings: {
      unknownMarker:
        'Маркер статусу "{marker}" не є одним із маркерів цієї гри. Виберіть інший в налаштуваннях.',
    },
    deck: {
      subtitle: 'Командна колода',
      selected: 'Вибрані токени',
      selectedDesc: 'Спочатку виберіть жетон заклинача.',
      table: 'Таблиця',
      tableDesc: 'Подивіться, хто зосереджений, а хто має перевагу на своїх сейвах.',
      tools: 'Інструменти',
      toolsDesc: 'Налаштування, список команд і роздаткові матеріали.',
      footer: 'Повні інструкції наведено в роздатковому матеріалі "{help}".',
    },
    handout: {
      versionLabel: 'Версія',
      subtitle: 'Маркери концентрації, нагадування та збереження для D&D 5e',
      overview: {
        heading: 'Огляд',
        body: 'Концентрація відстежує, хто на якому заклинанні зосереджується. Він поміщає маркер на жетон заклинача, кидає (або запитує) збереження конституції, коли цей жетон отримує пошкодження, і повідомляє стіл, коли концентрація закінчується.',
      },
      quickStart: {
        heading: 'Швидкий старт',
        steps: [
          'Виберіть жетон заклинателя та введіть !concentration, а потім заклинання, наприклад !concentration Bless.',
          'Змініть очки життя жетона в його стовпчику. Збереження скидається на DC 10 або половині шкоди, якщо вона більша.',
          'Виконайте ту саму команду ще раз або зніміть маркер, щоб завершити концентрацію.',
          'Введіть !concentration, не вибравши нічого, щоб відкрити налаштування.',
        ],
      },
      concentrating: {
        heading: 'Концентрація',
        points: [
          'Назви іншого заклинання перемикають концентрацію на нього, як і використання нового заклинання концентрації.',
          'Нанесення маркера на жетон рукою запускає концентрацію без заклинання; зняття або видалення маркера завершує його.',
          'Новий пов’язаний токен концентраційного символу отримує маркер, а вставлений токен, який містить маркер, відстежується.',
          "Жетони одного персонажа зі зв’язаною шкалою життєвих точок ділять концентрацію. Незв'язані жетони, наприклад зграя гоблінів з одного аркуша, концентруються самі по собі.",
          'Усі бачать повідомлення, коли концентрація починається, перемикається або закінчується, якщо в розділі «Надіслати нагадування» не зазначено інше.',
        ],
      },
      saves: {
        heading: 'Рятує концентрація',
        points: [
          'DC становить 10 або половину отриманої шкоди, залежно від того, що більше, до DC 30.',
          'Модифікатор походить від бонусного атрибута на аркуші персонажа; відсутнє значення вважається 0.',
          'Auto Roll Зберігайте рулони одразу. Коли його вимкнено, нагадування має кнопки «Киток» і «Перевага» для гравця або GM.',
          'Невдале збереження закінчує концентрацію. Якщо ввімкнути End at 0 HP, падіння до 0 очок здоров’я завершує це без збереження.',
          'Меню переваг дає перевагу персонажам при автоматичних збереженнях, як це робить бойовий заклинач.',
        ],
      },
      automatic: {
        heading: 'Привороти з простирадла',
        points: [
          'З автоматичним додаванням Con. Маркер увімкнено, використання заклинання концентрації з аркуша D&D 5e 2014 (OGL) або 2024 додає маркер.',
          'Жетони заклинача на сторінці, яку вони переглядають, позначені; якщо їх немає, маркери на будь-якій сторінці є.',
          'Враховуються лише карти від GM, іншого мода або одного з гравців персонажа. Повторне використання того самого заклинання нічого не змінює.',
          'Картка D&D 2024, у тексті якої згадується лише концентрація, як-от уміння War Caster, може почати концентрацію, але ніколи не замінить заклинання.',
          'Для аркушів D&D 2024 може знадобитися експериментальний сервер API. Увімкніть режим налагодження, щоб дізнатися, чому заклинання виявлено або не виявлено.',
        ],
      },
      players: {
        heading: 'Гравці',
        points: [
          'Гравці можуть починати та завершувати концентрацію для жетонів, які вони контролюють, і використовувати кнопки «Киток» і «Перевага» під час власних збереження.',
          'З параметром «Надіслати нагадування», щоб вибрати «Персонаж», повідомлення шепочуться гравцям персонажа та GM.',
        ],
      },
      commands: {
        heading: 'Команди',
        intro: 'Інші моди, такі як ScriptCards, також можуть надсилати ці команди.',
        colCommand: 'Команда',
        colDesc: 'Що воно робить',
      },
      settings: {
        heading: 'Налаштування',
        intro:
          'Змінюйте налаштування за допомогою кнопок у картці налаштувань або за допомогою config <key>|<value>. Деякі також можна встановити на сторінці мода.',
        colKey: 'ключ',
        colName: "Ім'я",
        colDesc: 'Що воно робить',
      },
      upgrading: {
        heading: 'Оновлення з версії 1.0',
        points: [
          'Налаштування, список переваг і кожна команда продовжують працювати.',
          'У повідомленнях тепер повідомляється, коли закінчується концентрація та яке заклинання.',
          'Жетони, які вже містять маркер, підбираються під час запуску.',
        ],
      },
      troubleshooting: {
        heading: 'Усунення несправностей',
        points: [
          'Немає збереження при падінні життєвих очок: перевірте, чи маркер має маркер і чи змінена панель HP. Зміни, внесені іншими модами через API, не викликають подій, тому їх не видно.',
          'Модифікатор дорівнює 0: перевірте бонусний атрибут на аркуші персонажа.',
          'Заклинання, зроблені з аркуша, не розпізнаються: увімкніть режим налагодження, повторіть заклинання та прочитайте консоль API.',
          'Два символи мають спільну назву: для виявлення використовується перший збіг. Дайте персонажам унікальні імена.',
        ],
      },
      languages: {
        heading: 'Мови',
        body: 'Concentration перекладено на наведені нижче мови. Виберіть один із налаштуваннями мови.',
        colCode: 'Код',
        colName: 'Мова',
        colNative: 'Рідна назва',
      },
      credits: {
        heading: 'Кредити',
        original: 'Оригінальний мод від',
        maintainer: 'Підтримується',
        support: 'Повідомляйте про помилки та ідеї на форумі Roll20 Mod або на GitHub.',
      },
      footer: 'Кнопки для кожної дії є в роздатковому матеріалі "{deck}".',
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
      const displayName =
        locale.nativeName && locale.nativeName !== locale.name
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

  // Persistent state: settings, who is concentrating on what, advantage and
  // pending save buttons.

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
      const found = list.find((o) => String(o).toLowerCase() === text);
      return found === undefined ? bad : ok(found);
    };

    if (TOGGLE_KEYS.includes(key)) {
      const value = parseBoolean(raw);
      return value === null ? bad : ok(value);
    }

    switch (key) {
      case 'language': {
        const lang = normalizeLocale(raw);
        return lang ? ok(lang) : bad;
      }
      case 'command': {
        const text = toText(raw).replace(/^!/, '');
        return /^[A-Za-z0-9_-]{1,32}$/.test(text) ? ok(text) : bad;
      }
      case 'statusmarker': {
        const text = toText(raw);
        return /^[\w:-]{1,80}$/.test(text) ? ok(text) : bad;
      }
      case 'bar': {
        const text = toText(raw).replace(/^bar\s*/i, '');
        return BAR_OPTIONS.map(String).includes(text) ? ok(Number(text)) : bad;
      }
      case 'send_reminder_to':
        return option(SEND_TO_OPTIONS);
      case 'support_mode':
        return option(SUPPORT_MODE_OPTIONS);
      case 'bonus_attribute': {
        const text = toText(raw);
        return /^[\w.-]{1,80}$/.test(text) ? ok(truncate(text, MAX_ATTRIBUTE_LENGTH)) : bad;
      }
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
   * Creates a fresh state branch.
   *
   * @returns {object} State.
   */
  function createDefaultState() {
    return {
      schemaVersion: SCHEMA_VERSION,
      version: SCRIPT_VERSION,
      config: { ...DEFAULT_CONFIG },
      concentrating: {},
      advantages: {},
      pendingRolls: {},
      notices: {},
    };
  }

  /**
   * Cleans one concentration record.
   *
   * @param {*} raw Stored record.
   * @returns {object|null} Record, or null when it is not valid.
   */
  function normaliseRecord(raw) {
    if (!isRecord(raw)) {
      return null;
    }
    return {
      spell: cleanSpellName(raw.spell, MAX_SPELL_LENGTH),
      name: truncate(raw.name, 100),
      since: Number.isFinite(raw.since) ? raw.since : 0,
    };
  }

  /**
   * Brings stored state up to the current schema. Version 1.0 had no schema
   * number; its settings and advantage list are kept.
   *
   * @param {*} raw Stored state.
   * @returns {{state: object, migratedFrom: number|null}} Clean state and the old schema, if any.
   */
  function migrateState(raw) {
    const clean = createDefaultState();
    if (!isRecord(raw) || Object.keys(raw).length === 0) {
      return { state: clean, migratedFrom: null };
    }
    const migratedFrom = raw.schemaVersion === SCHEMA_VERSION ? null : raw.schemaVersion || 1;

    clean.config = mergeConfig(raw.config);
    if (isRecord(raw.advantages)) {
      for (const [id, on] of Object.entries(raw.advantages)) {
        if (on === true) {
          clean.advantages[id] = true;
        }
      }
    }
    if (isRecord(raw.concentrating)) {
      for (const [key, record] of Object.entries(raw.concentrating)) {
        const value = normaliseRecord(record);
        if (value) {
          clean.concentrating[key] = value;
        }
      }
    }
    if (isRecord(raw.pendingRolls)) {
      clean.pendingRolls = raw.pendingRolls;
    }
    if (isRecord(raw.notices)) {
      clean.notices = raw.notices;
    }
    // Version 1.0 showed its menu on the first start and remembered it here.
    if (migratedFrom === 1 && isRecord(raw.config) && 'firsttime' in raw.config) {
      clean.notices.welcomed = true;
    }
    return { state: clean, migratedFrom };
  }

  /**
   * Loads, migrates and validates the persistent state. Call once on ready.
   *
   * @returns {number|null} The schema migrated from, or null.
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
   * Puts every setting back to its default and forgets advantage and pending
   * saves. Who is concentrating is kept, since their markers stay on the map.
   *
   * @returns {void}
   */
  function resetState() {
    const s = getState();
    const concentrating = s.concentrating;
    const fresh = createDefaultState();
    fresh.concentrating = concentrating;
    fresh.notices.welcomed = true;
    state[STATE_KEY] = fresh;
  }

  /**
   * Returns the configuration.
   *
   * @returns {object} Config.
   */
  function getConfig() {
    return getState().config;
  }

  /**
   * Sets one configuration value.
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
   * Imports Roll20 One-Click useroptions into the stored config. Options are
   * only applied again when the GM changes them, so chat changes survive restarts.
   *
   * @returns {void}
   */
  function applyGlobalConfig() {
    if (typeof globalconfig === 'undefined' || !isRecord(globalconfig)) {
      return;
    }
    const branch = globalconfig[SCRIPT_NAME.toLowerCase()] || globalconfig[SCRIPT_NAME];
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

  /**
   * Returns whether a one-time notice has been shown, and marks it shown.
   *
   * @param {string} key Notice key.
   * @returns {boolean} True the first time it is called for a key.
   */
  function takeNotice(key) {
    const notices = getState().notices;
    if (notices[key]) {
      return false;
    }
    notices[key] = true;
    return true;
  }

  // ---------------------------------------------------------------------------
  // Concentration records, keyed by character ID (or token ID for tokens that
  // represent no character)
  // ---------------------------------------------------------------------------

  /**
   * Returns every concentration record.
   *
   * @returns {Object<string, {spell: string, name: string, since: number}>} Records by key.
   */
  function getRecords() {
    return getState().concentrating;
  }

  /**
   * Returns the record for a key.
   *
   * @param {string} key Character or token ID.
   * @returns {{spell: string, name: string, since: number}|null} Record, or null.
   */
  function getRecord(key) {
    return getRecords()[key] || null;
  }

  /**
   * Stores who is concentrating on what.
   *
   * @param {string} key Character or token ID.
   * @param {string} spell Spell name (may be empty).
   * @param {string} name Name shown in chat.
   * @returns {void}
   */
  function setRecord(key, spell, name) {
    getRecords()[key] = {
      spell: cleanSpellName(spell, MAX_SPELL_LENGTH),
      name: truncate(name, 100),
      since: Date.now(),
    };
  }

  /**
   * Forgets a record.
   *
   * @param {string} key Character or token ID.
   * @returns {object|null} The record that was removed, or null.
   */
  function clearRecord(key) {
    const records = getRecords();
    const record = records[key] || null;
    delete records[key];
    return record;
  }

  // ---------------------------------------------------------------------------
  // Advantage
  // ---------------------------------------------------------------------------

  /**
   * Returns true when a character rolls concentration saves with advantage.
   *
   * @param {string} characterId Character ID.
   * @returns {boolean} True with advantage.
   */
  function hasAdvantage(characterId) {
    return Boolean(characterId) && getState().advantages[characterId] === true;
  }

  /**
   * Switches advantage for a character.
   *
   * @param {string} characterId Character ID.
   * @returns {boolean} The new setting.
   */
  function toggleAdvantage(characterId) {
    const advantages = getState().advantages;
    if (advantages[characterId]) {
      delete advantages[characterId];
      return false;
    }
    advantages[characterId] = true;
    return true;
  }

  // ---------------------------------------------------------------------------
  // Pending saves (Roll and Advantage buttons)
  // ---------------------------------------------------------------------------

  /**
   * Forgets pending saves that have expired, and the oldest when there are too many.
   *
   * @returns {void}
   */
  function prunePendingRolls() {
    const pending = getState().pendingRolls;
    const now = Date.now();
    for (const [id, roll] of Object.entries(pending)) {
      if (
        !isRecord(roll) ||
        !Number.isFinite(roll.createdAt) ||
        now - roll.createdAt > PENDING_ROLL_TTL_MS
      ) {
        delete pending[id];
      }
    }
    const ids = Object.keys(pending).sort((a, b) => pending[a].createdAt - pending[b].createdAt);
    for (const id of ids.slice(0, Math.max(0, ids.length - MAX_PENDING_ROLLS))) {
      delete pending[id];
    }
  }

  /**
   * Stores a save to be rolled from a button.
   *
   * @param {object} roll Save details.
   * @returns {string} ID for the buttons.
   */
  function addPendingRoll(roll) {
    prunePendingRolls();
    const id = `pr_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    getState().pendingRolls[id] = { ...roll, createdAt: Date.now() };
    return id;
  }

  /**
   * Returns a pending save without using it up.
   *
   * @param {string} id Pending save ID.
   * @returns {object|null} Save details, or null when unknown or expired.
   */
  function getPendingRoll(id) {
    prunePendingRolls();
    const pending = getState().pendingRolls;
    return /^pr_\d+_[a-z0-9]+$/.test(toText(id)) && pending[id] ? pending[id] : null;
  }

  /**
   * Takes a pending save, so each button works once.
   *
   * @param {string} id Pending save ID.
   * @returns {object|null} Save details, or null when unknown or expired.
   */
  function takePendingRoll(id) {
    prunePendingRolls();
    const pending = getState().pendingRolls;
    if (!/^pr_\d+_[a-z0-9]+$/.test(toText(id)) || !pending[id]) {
      return null;
    }
    const roll = pending[id];
    delete pending[id];
    return roll;
  }

  // Debug Mode: notes in the API console for support requests. They stay in
  // English so they can be shared on the forums.

  const FIELD_LABELS = {
    source: 'Detection Path',
    messageType: 'Message Type',
    template: 'Roll Template',
    spellName: 'Spell',
    caster: 'Caster',
    status: 'Result',
    preview: 'Message Preview',
    reason: 'Reason',
    warning: 'Warning',
    characterId: 'Character ID',
    characterName: 'Character Name',
    attribute: 'Attribute',
    value: 'Value',
    error: 'Error',
    pageId: 'Page ID',
    scope: 'Scope',
    represents: 'Represents',
    tokenId: 'Token ID',
    pendingRollId: 'Pending Roll ID',
  };

  const REASON_LABELS = {
    'not-legacy-spell-rolltemplate': 'Not a legacy spell card message',
    'legacy-spell-not-concentration': 'Legacy spell card found, but concentration was not marked',
    'legacy-spell-missing-character-or-spell':
      'Legacy spell card was missing character or spell details',
    'legacy-spell-detected': 'Legacy spell card already matched',
    'not-beacon-advancedroll': 'Not a Beacon advanced roll message',
    'advancedroll-does-not-look-like-spell-card': 'Advanced roll did not look like a spell card',
    'beacon-spell-not-concentration': 'Beacon spell card found, but concentration was not marked',
    'beacon-spell-missing-spell-name': 'Beacon spell card was missing spell name',
    'beacon-spell-missing-character': 'Beacon spell card was missing caster details',
  };

  // Fields shown in Basic support mode, in order.
  const BASIC_KEYS = [
    'reason',
    'warning',
    'error',
    'spellName',
    'caster',
    'characterName',
    'attribute',
    'value',
  ];

  /**
   * Turns markup into short readable text.
   *
   * @param {*} value Text or HTML.
   * @param {number} [maxLength] Maximum length.
   * @returns {string} Plain text.
   */
  function plainText(value, maxLength = 240) {
    const text = decodeEntities(String(value ?? '').replaceAll(/<[^>]*>/g, ' '))
      .replaceAll(/\s+/g, ' ')
      .trim();
    return truncate(text || '(empty)', maxLength);
  }

  /**
   * Makes a slug such as "missing-player" readable.
   *
   * @param {*} value Slug.
   * @returns {string} Words.
   */
  function humanise(value) {
    return String(value ?? '')
      .replaceAll(/[_-]+/g, ' ')
      .replaceAll(/\s+/g, ' ')
      .trim();
  }

  /**
   * Describes one field value.
   *
   * @param {string} key Field key.
   * @param {*} value Field value.
   * @returns {string} Text.
   */
  function describe(key, value) {
    if (value === null || value === undefined || value === '') {
      return 'n/a';
    }
    if (key === 'source') {
      return { legacy: 'Legacy sheet', beacon: 'Beacon sheet' }[value] || 'No match';
    }
    if (key === 'status') {
      return value === 'detected'
        ? 'Concentration spell detected'
        : `Skipped: ${describe('reason', value)}`;
    }
    if (key === 'reason') {
      return String(value)
        .split(';')
        .map((r) => r.trim())
        .filter(Boolean)
        .map((r) => REASON_LABELS[r] || humanise(r))
        .join('; ');
    }
    if (key === 'warning') {
      return humanise(value);
    }
    if (Array.isArray(value)) {
      return truncate(value.map((v) => describe('', v)).join(', '), 200);
    }
    if (typeof value === 'object') {
      return '[details]';
    }
    return plainText(value, 200);
  }

  /**
   * Formats a details object for the log.
   *
   * @param {string} label Event label.
   * @param {*} data Details.
   * @param {boolean} detailed Detailed support mode.
   * @returns {string} Text.
   */
  function formatDetails(label, data, detailed) {
    if (data === undefined) {
      return '';
    }
    if (typeof data !== 'object' || data === null) {
      return plainText(data, detailed ? 240 : 140);
    }
    if (!detailed && label === 'Spell detection') {
      if (data.status === 'detected') {
        return [
          'Concentration spell detected',
          data.spellName ? `Spell: ${describe('spellName', data.spellName)}` : '',
          data.caster ? `Caster: ${describe('caster', data.caster)}` : '',
          data.source ? `Path: ${describe('source', data.source)}` : '',
        ]
          .filter(Boolean)
          .join(' | ');
      }
      return `Skipped: ${describe('reason', data.status)}`;
    }
    let keys = Object.keys(data);
    if (!detailed) {
      const preferred = BASIC_KEYS.filter((key) => Object.hasOwn(data, key));
      keys = preferred.length > 0 ? preferred : keys.slice(0, 2);
    }
    return keys
      .map((key) => `${FIELD_LABELS[key] || humanise(key)}: ${describe(key, data[key])}`)
      .join(' | ');
  }

  /**
   * Writes a debug note to the API console when Debug Mode is on.
   *
   * @param {string} label What happened.
   * @param {*} [data] Details.
   * @returns {void}
   */
  function debugLog(label, data) {
    const config = getConfig();
    if (!config.debug) {
      return;
    }
    let details = '';
    try {
      details = formatDetails(label, data, config.support_mode === 'detailed');
    } catch (err) {
      details = `(could not format details: ${err?.message || err})`;
    }
    log(`[${SCRIPT_NAME} v${SCRIPT_VERSION}] ${label}${details ? `: ${details}` : ''}`);
  }

  // Finds concentration spells in sheet chat output: the 5e OGL (2014) `spell`
  // roll template and D&D 2024 (Beacon) `advancedroll` spell cards.

  /**
   * @typedef {object} SpellCast
   * @property {'legacy'|'beacon'} sheetType Sheet output that matched.
   * @property {string|null} characterName Caster's name, when the card shows it.
   * @property {string|null} characterId Caster's character ID, when known.
   * @property {string} spellName Spell name.
   * @property {boolean} [weak] Matched only by the word "concentration" in the card.
   */

  /**
   * Returns the first capture group any pattern finds.
   *
   * @param {string} content Text to search.
   * @param {RegExp[]} patterns Patterns with one capture group.
   * @returns {string|null} Decoded match, or null.
   */
  function firstMatch(content, patterns) {
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match?.[1]) {
        return decodeEntities(match[1]) || null;
      }
    }
    return null;
  }

  /**
   * Looks for a concentration spell on the 5e OGL `spell` roll template.
   *
   * @param {object} msg Roll20 chat message.
   * @returns {{spellCast: SpellCast|null, reason: string|null}} Result.
   */
  function detectLegacySpellCast(msg) {
    if (msg?.rolltemplate !== 'spell' || !msg?.content) {
      return { spellCast: null, reason: 'not-legacy-spell-rolltemplate' };
    }
    if (!msg.content.includes('{{concentration=1}}')) {
      return { spellCast: null, reason: 'legacy-spell-not-concentration' };
    }
    const characterName = firstMatch(msg.content, [/charname=([^\n{}]*[^"\n{}])/i]);
    // "name=" also appears inside "charname=", so the field's own braces come first.
    const spellName = firstMatch(msg.content, [
      /\{\{name=([^\n{}]*[^"\n{}])/i,
      /(?<!char)name=([^\n{}]*[^"\n{}])/i,
    ]);
    if (!characterName || !spellName) {
      return { spellCast: null, reason: 'legacy-spell-missing-character-or-spell' };
    }
    return {
      spellCast: { sheetType: 'legacy', characterName, characterId: null, spellName },
      reason: null,
    };
  }

  /**
   * Looks for a concentration spell on a D&D 2024 (Beacon) spell card.
   *
   * @param {object} msg Roll20 chat message.
   * @returns {{spellCast: SpellCast|null, reason: string|null}} Result.
   */
  function detectBeaconSpellCast(msg) {
    if (msg?.type !== 'advancedroll' || !msg?.content) {
      return { spellCast: null, reason: 'not-beacon-advancedroll' };
    }
    const content = msg.content;
    const looksLikeSpellCard = [
      /header__title/i,
      /header__subtitle/i,
      /meta__character/i,
      /data-character-name/i,
      /spell/i,
    ].some((pattern) => pattern.test(content));
    if (!looksLikeSpellCard) {
      return { spellCast: null, reason: 'advancedroll-does-not-look-like-spell-card' };
    }
    // A concentration chip or data attribute is a sure match; the bare word is
    // weak, as feat cards such as War Caster mention concentration too.
    const strong = [
      /data-chip\s*=\s*["']?concentration["']?/i,
      /data-[a-z-]*\s*=\s*["']?concentration["']?/i,
    ].some((pattern) => pattern.test(content));
    const weak = !strong && /\bconcentration\b/i.test(content);
    if (!strong && !weak) {
      return { spellCast: null, reason: 'beacon-spell-not-concentration' };
    }
    const spellName = firstMatch(content, [
      /header__title[^>]*>\s*([^<]+?)\s*</i,
      /data-title\s*=\s*["']([^"']+)["']/i,
      /aria-label\s*=\s*["']([^"']+)["']/i,
    ]);
    const characterName = firstMatch(content, [
      /meta__character[^>]*>\s*([^<]+?)\s*</i,
      /data-character-name\s*=\s*["']([^"']+)["']/i,
    ]);
    // Beacon messages carry the character's ID; older cards only had it in the markup.
    const characterId =
      toText(msg.characterId) ||
      toText(msg.rolledByCharacterId) ||
      firstMatch(content, [
        /data-character-id\s*=\s*["']([^"']+)["']/i,
        /data-characterid\s*=\s*["']([^"']+)["']/i,
        /characterid\s*=\s*["']([^"']+)["']/i,
      ]);
    if (!spellName) {
      return { spellCast: null, reason: 'beacon-spell-missing-spell-name' };
    }
    if (!characterName && !characterId) {
      return { spellCast: null, reason: 'beacon-spell-missing-character' };
    }
    return {
      spellCast: {
        sheetType: 'beacon',
        characterName,
        characterId: characterId || null,
        spellName,
        weak,
      },
      reason: null,
    };
  }

  /**
   * Looks for a concentration spell in any supported sheet output, writing
   * what it found to the log in Debug Mode.
   *
   * @param {object} msg Roll20 chat message.
   * @returns {SpellCast|null} The spell cast, or null.
   */
  function detectSpellCast(msg) {
    const legacy = detectLegacySpellCast(msg);
    const beacon = legacy.spellCast
      ? { spellCast: null, reason: 'legacy-spell-detected' }
      : detectBeaconSpellCast(msg);
    const spellCast = legacy.spellCast || beacon.spellCast;

    // Skip unrelated chat so the log stays readable.
    if (spellCast || msg?.rolltemplate === 'spell' || msg?.type === 'advancedroll') {
      let source = 'none';
      if (legacy.spellCast) {
        source = 'legacy';
      } else if (beacon.spellCast) {
        source = 'beacon';
      }
      debugLog('Spell detection', {
        source,
        messageType: msg?.type || null,
        template: msg?.rolltemplate || null,
        spellName: spellCast?.spellName || null,
        caster: spellCast?.characterName || spellCast?.characterId || null,
        status: spellCast ? 'detected' : [legacy.reason, beacon.reason].filter(Boolean).join('; '),
        preview: plainText(msg?.content, 160),
      });
    }
    return spellCast;
  }

  /**
   * Finds the character who cast a spell: by ID first, then by exact name.
   *
   * @param {SpellCast} spellCast Spell cast.
   * @returns {{character: object|null, warning: string|null}} Character, and a note when unsure.
   */
  function resolveCaster(spellCast) {
    let warning = null;
    let character = null;
    if (spellCast.characterId) {
      character = getObj('character', spellCast.characterId) || null;
      if (!character) {
        warning = `character-id-not-found: ${truncate(spellCast.characterId, 80)}`;
      }
    }
    if (!character && spellCast.characterName) {
      const matches = findObjs({ _type: 'character', name: spellCast.characterName });
      if (matches.length > 1) {
        warning = `duplicate-character-name: ${truncate(spellCast.characterName, 80)}`;
      }
      character = matches[0] || null;
    }
    return { character, warning };
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
    return `<a href="${escapeAttr(url)}" style="${STYLE.link}">${escapeHtml(label)}</a>`;
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
    return `<img src="${escapeAttr(url)}" alt="${label}" title="${label}" style="width:1.1em;height:1.1em;vertical-align:-0.15em;margin-right:4px;" />`;
  }

  /**
   * Builds the Help handout HTML.
   *
   * @param {string} locale Locale code.
   * @param {string} command The command word, without "!".
   * @returns {string} HTML string.
   */
  function buildHelpHtml(locale, command) {
    const lang = getLocale(locale);
    const prefix = `!${command}`;
    const h = (key, vars) => escapeHtml(t(`handout.${key}`, lang, vars));
    const raw = (key) => tRaw(`handout.${key}`, lang);
    const code = (text) => `<span style="${STYLE.code}">${escapeHtml(text)}</span>`;
    const section = (key, body) => `<h2 style="${STYLE.h2}">${h(`${key}.heading`)}</h2>${body}`;

    const commands = HELP_COMMANDS.map(([text, key]) => [
      code(`${prefix} ${text}`.trim()),
      escapeHtml(t(`help.${key}`, lang)),
    ]);
    const settings = Object.keys(DEFAULT_CONFIG).map((key) => [
      code(key),
      escapeHtml(t(`settings.${key}.label`, lang)),
      escapeHtml(t(`settings.${key}.desc`, lang)),
    ]);
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
    ${section('concentrating', list(raw('concentrating.points')))}
    ${section('saves', list(raw('saves.points')))}
    ${section('automatic', list(raw('automatic.points')))}
    ${section('players', list(raw('players.points')))}
    ${section('commands', `<p style="${STYLE.p}">${h('commands.intro')}</p>${table([t('handout.commands.colCommand', lang), t('handout.commands.colDesc', lang)], commands)}`)}
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
   * @param {string} command The command word, without "!".
   * @returns {string} HTML string.
   */
  function buildDeckHtml(locale, command) {
    const lang = getLocale(locale);
    const tr = (key, vars) => t(key, lang, vars);
    const q = (key) => `?{${tr(key).replaceAll(/[|}]/g, '')}}`;
    const btn = (key, args, dark = false) =>
      `<a href="${escapeAttr(`!${command} ${args}`.trim())}" style="${dark ? STYLE.btnDark : STYLE.btn}">${escapeHtml(tr(`buttons.${key}`))}</a>`;
    const group = (titleKey, descKey, buttons) =>
      `<div style="${STYLE.section}">${escapeHtml(tr(titleKey))}</div><div style="${STYLE.desc}">${escapeHtml(tr(descKey))}</div><div>${buttons.join('')}</div>`;

    return `<div style="${STYLE.outer}${getDirectionStyle(lang)}">
    <div style="${STYLE.header}">
      <h1 style="${STYLE.h1}">✥ ${SCRIPT_NAME} ✥</h1>
      <p style="${STYLE.subtitle}">${escapeHtml(tr('deck.subtitle'))} • v${SCRIPT_VERSION}</p>
    </div>
    ${group('deck.selected', 'deck.selectedDesc', [btn('concentrate', q('prompts.spell')), btn('toggle', ''), btn('end', 'end', true)])}
    ${group('deck.table', 'deck.tableDesc', [btn('status', 'status'), btn('advantageMenu', 'advantage-menu')])}
    ${group('deck.tools', 'deck.toolsDesc', [btn('menu', 'menu', true), btn('help', 'help', true), btn('journal', 'journal', true)])}
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
    const { language, command } = getConfig();
    upsertHandout(HANDOUT_HELP_NAME, buildHelpHtml(language, command));
    upsertHandout(HANDOUT_DECK_NAME, buildDeckHtml(language, command));
  }

  // Translation helpers bound to the language chosen in the settings.

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
   * Translates a key into HTML: the text is escaped and each {placeholder} is
   * replaced by its value in bold (also escaped).
   *
   * @param {string} key Translation key.
   * @param {object} [vars] Interpolation variables.
   * @returns {string} HTML.
   */
  function rich(key, vars = {}) {
    const template = t(key, lang());
    return template
      .split(/(\{\w+\})/)
      .map((part) => {
        const name = part.match(/^\{(\w+)\}$/)?.[1];
        if (name && name in vars) {
          return `<strong>${escapeHtml(vars[name])}</strong>`;
        }
        return escapeHtml(part);
      })
      .join('');
  }

  /**
   * Returns the text direction CSS for the active locale.
   *
   * @returns {string} CSS declarations, empty for left-to-right languages.
   */
  function dirStyle() {
    return getDirectionStyle(lang());
  }

  // Who is concentrating on what: starting, switching and ending concentration,
  // keeping the marker on the map in step, and telling the table.

  /**
   * Returns the character a token represents.
   *
   * @param {object} token Roll20 graphic.
   * @returns {object|null} Character, or null.
   */
  function characterOf(token) {
    const id = toText(token?.get('represents'));
    return id ? getObj('character', id) || null : null;
  }

  /**
   * Returns true when a token's hit point bar is linked to its character, so
   * every token of that character shares one hit point total.
   *
   * @param {object} token Roll20 graphic.
   * @returns {boolean} True when linked.
   */
  function isLinked(token) {
    return Boolean(toText(token.get(`bar${getConfig().bar}_link`)));
  }

  /**
   * Returns the key concentration is stored under. Tokens of one character with
   * a linked hit point bar (player characters, named NPCs) share it; other
   * tokens (a pack of goblins from one sheet) each concentrate on their own.
   *
   * @param {object} token Roll20 graphic.
   * @returns {string} Character or token ID.
   */
  function keyOf(token) {
    const characterId = toText(token.get('represents'));
    return characterId && isLinked(token) ? characterId : token.id;
  }

  /**
   * Returns the tokens that show concentration for a key.
   *
   * @param {string} key Character or token ID.
   * @returns {object[]} Tokens.
   */
  function tokensFor(key) {
    const token = getObj('graphic', key);
    if (token) {
      return [token];
    }
    return findObjs({ _type: 'graphic', represents: key }).filter((t) => isToken(t) && isLinked(t));
  }

  /**
   * Returns the name shown in chat for a key.
   *
   * @param {string} key Character or token ID.
   * @param {object} [token] A token for the key, when known.
   * @returns {string} Name.
   */
  function nameFor(key, token) {
    const character = getObj('character', key);
    return (
      toText(character?.get('name')) ||
      tokenName(token || tokensFor(key)[0]) ||
      getRecord(key)?.name ||
      tr('values.unnamed')
    );
  }

  /**
   * Works out who sees messages about a key, following Send Reminder To.
   * Whispers to a character also go to the GM, who may not control it.
   *
   * @param {string} key Character or token ID.
   * @param {object} [token] A token for the key.
   * @returns {string[]} Whisper targets ('' for everyone).
   */
  function audienceFor(key, token) {
    const mode = getConfig().send_reminder_to;
    if (mode === 'everyone') {
      return [''];
    }
    if (mode === 'character') {
      const character = getObj('character', key) || characterOf(token || tokensFor(key)[0]);
      return character ? [characterTarget(character.get('name')), 'gm'] : ['gm'];
    }
    return ['gm'];
  }

  /**
   * Sends a card to everyone who should see messages about a key.
   *
   * @param {string} key Character or token ID.
   * @param {object|undefined} token A token for the key.
   * @param {string} title Card title.
   * @param {string} body Card body HTML.
   * @param {string} [subtitle] Second header line.
   * @returns {void}
   */
  function sendAbout(key, token, title, body, subtitle = '') {
    const card = buildCard(title, body, subtitle, dirStyle());
    for (const target of audienceFor(key, token)) {
      sendTo(target, card);
    }
  }

  /**
   * Announces a change in concentration.
   *
   * @param {string} key Character or token ID.
   * @param {object|undefined} token A token for the key.
   * @param {string} notice Key under `notices.` (with a `NoSpell` variant).
   * @param {object} vars Values: name, spell, old.
   * @returns {void}
   */
  function announce(key, token, notice, vars) {
    const variant = vars.spell ? notice : `${notice}NoSpell`;
    sendAbout(
      key,
      token,
      tr('titles.concentration'),
      `<div>${rich(`notices.${variant}`, vars)}</div>`
    );
  }

  /**
   * Puts the marker on (or takes it off) every token for a key.
   *
   * @param {string} key Character or token ID.
   * @param {boolean} on Add when true.
   * @returns {void}
   */
  function markAll(key, on) {
    const marker = getConfig().statusmarker;
    for (const token of tokensFor(key)) {
      setMarker(token, marker, on);
    }
  }

  /**
   * Returns true when a key is concentrating.
   *
   * @param {string} key Character or token ID.
   * @returns {boolean} True when concentrating.
   */
  function isConcentrating(key) {
    return Boolean(getRecord(key));
  }

  /**
   * Returns what a token is concentrating on.
   *
   * @param {object} token Roll20 graphic.
   * @returns {{spell: string, name: string, since: number}|null} Record, or null.
   */
  function getRecordFor(token) {
    return getRecord(keyOf(token));
  }

  /**
   * Starts concentration, or switches it to a new spell.
   *
   * @param {object} token A token for the caster.
   * @param {string} spell Spell name (may be empty).
   * @param {object} [options] Options.
   * @param {boolean} [options.announce=true] Tell the table.
   * @returns {void}
   */
  function startConcentration(token, spell, { announce: tell = true } = {}) {
    const key = keyOf(token);
    const previous = getRecord(key);
    const name = nameFor(key, token);
    // The same spell again (a repeated sheet card, such as Moonbeam's damage each
    // round) changes nothing.
    if (previous && toText(spell) && previous.spell.toLowerCase() === toText(spell).toLowerCase()) {
      markAll(key, true);
      return;
    }
    setRecord(key, spell, name);
    markAll(key, true);
    const record = getRecord(key);
    if (!tell) {
      return;
    }
    if (
      previous?.spell &&
      record.spell &&
      previous.spell.toLowerCase() !== record.spell.toLowerCase()
    ) {
      announce(key, token, 'switched', { name, spell: record.spell, old: previous.spell });
    } else {
      announce(key, token, 'started', { name, spell: record.spell });
    }
  }

  /**
   * Ends concentration.
   *
   * @param {string} key Character or token ID.
   * @param {'ended'|'lost'|'zeroHp'} reason Why it ended.
   * @param {object} [options] Options.
   * @param {boolean} [options.announce=true] Tell the table.
   * @param {object} [options.token] A token for the key.
   * @returns {boolean} True when the key was concentrating.
   */
  function endConcentration(key, reason, { announce: tell = true, token } = {}) {
    const name = nameFor(key, token);
    const record = clearRecord(key);
    markAll(key, false);
    if (!record) {
      return false;
    }
    debugLog('Concentration ended', {
      scope: reason,
      characterName: name,
      spellName: record.spell,
    });
    if (tell) {
      announce(key, token, reason, { name, spell: record.spell });
    }
    return true;
  }

  /**
   * `!concentration [spell]` on a token: starts concentration, switches to a
   * different spell, or ends it.
   *
   * @param {object} token Roll20 graphic.
   * @param {string} spell Spell typed after the command (may be empty).
   * @returns {void}
   */
  function toggleConcentration(token, spell) {
    const key = keyOf(token);
    const record = getRecord(key);
    if (!record) {
      startConcentration(token, spell);
      return;
    }
    if (spell && spell.toLowerCase() !== record.spell.toLowerCase()) {
      startConcentration(token, spell);
      return;
    }
    endConcentration(key, 'ended', { token });
  }

  /**
   * Returns true when a player may change a token's concentration: the GM,
   * other Mods, or someone who controls the token or its character.
   *
   * @param {object} token Roll20 graphic.
   * @param {string} playerId Player ID.
   * @returns {boolean} True when allowed.
   */
  function canControl(token, playerId) {
    if (playerId === 'API' || playerIsGM(playerId)) {
      return true;
    }
    const controllers = [
      ...splitControllers(token.get('controlledby')),
      ...splitControllers(characterOf(token)?.get('controlledby')),
    ];
    return controllers.includes(playerId) || controllers.includes('all');
  }

  /**
   * Follows the marker being put on or taken off a token by hand.
   *
   * @param {object} token Roll20 graphic.
   * @param {object} prev Previous attributes.
   * @returns {void}
   */
  function handleMarkerChange(token, prev) {
    const marker = getConfig().statusmarker;
    const had = hasMarker({ get: (k) => prev?.[k] }, marker);
    const has = hasMarker(token, marker);
    if (had === has) {
      return;
    }
    const key = keyOf(token);
    if (has && !isConcentrating(key)) {
      startConcentration(token, '');
    } else if (!has && isConcentrating(key)) {
      endConcentration(key, 'ended', { token });
    }
  }

  /**
   * Ends concentration when its last token is deleted: a token that
   * concentrated on its own, or the last linked token of a character.
   *
   * @param {object} token Roll20 graphic (already removed).
   * @returns {void}
   */
  function handleTokenDestroyed(token) {
    if (getRecord(token.id)) {
      endConcentration(token.id, 'ended', { token });
      return;
    }
    const characterId = toText(token.get('represents'));
    if (characterId && getRecord(characterId)) {
      const remaining = tokensFor(characterId).filter((t) => t.id !== token.id);
      if (remaining.length === 0) {
        endConcentration(characterId, 'ended', { token });
      }
    }
  }

  /**
   * Keeps one token in step with the records: a new linked token of a
   * concentrating character gets the marker, and a marked token with no record
   * (pasted, or moved between keys by a bar link change) gets one, keeping the
   * spell stored under its other key. Nothing is announced.
   *
   * @param {object} token Roll20 graphic.
   * @returns {void}
   */
  function syncToken(token) {
    if (!isToken(token)) {
      return;
    }
    const marker = getConfig().statusmarker;
    const key = keyOf(token);
    const records = getRecords();
    if (records[key]) {
      setMarker(token, marker, true);
      if (key !== token.id) {
        delete records[token.id];
      }
      return;
    }
    if (!hasMarker(token, marker)) {
      return;
    }
    const characterId = toText(token.get('represents'));
    const old = records[token.id] || (characterId ? records[characterId] : null);
    setRecord(key, old?.spell || '', nameFor(key, token));
    if (old && records[token.id] && key !== token.id) {
      delete records[token.id];
    }
  }

  /**
   * Marks the caster of an automatically detected concentration spell.
   *
   * @param {object} msg Roll20 chat message.
   * @param {import('./detect.js').SpellCast} spellCast The spell cast.
   * @returns {void}
   */
  function handleSpellCast(msg, spellCast) {
    const { character, warning } = resolveCaster(spellCast);
    if (warning) {
      debugLog('Character resolution warning', {
        warning,
        characterName: spellCast.characterName,
        characterId: spellCast.characterId,
      });
    }
    if (!character) {
      debugLog('Spell cast aborted', {
        reason: 'unresolved-character',
        characterName: spellCast.characterName,
        spellName: spellCast.spellName,
      });
      return;
    }
    const all = findObjs({ _type: 'graphic', represents: character.id }).filter(isToken);
    const pageId = toText(getObj('player', msg.playerid)?.get('_lastpage'));
    const onPage = all.filter((t) => t.get('_pageid') === pageId);
    const tokens = onPage.length > 0 ? onPage : all;
    if (tokens.length === 0) {
      debugLog('No represented tokens found for spell cast', {
        characterName: character.get('name'),
        spellName: spellCast.spellName,
        pageId,
      });
      return;
    }
    // Anyone can post a spell card naming any character, so only the GM, other
    // Mods and the character's own players count.
    const allowed = tokens.filter((token) => canControl(token, msg.playerid));
    if (allowed.length === 0) {
      debugLog('Spell cast aborted', {
        reason: 'sender-does-not-control-caster',
        characterName: character.get('name'),
        spellName: spellCast.spellName,
      });
      return;
    }
    const done = new Set();
    for (const token of allowed) {
      const key = keyOf(token);
      if (done.has(key)) {
        continue;
      }
      done.add(key);
      // A card matched only by the word "concentration" (a feat such as War
      // Caster mentions it) may start concentration but never replaces a spell.
      if (spellCast.weak && getRecord(key)?.spell) {
        debugLog('Spell cast ignored', {
          reason: 'weak-match-while-concentrating',
          characterName: character.get('name'),
          spellName: spellCast.spellName,
        });
        continue;
      }
      startConcentration(token, spellCast.spellName);
    }
  }

  /**
   * Brings the records in line with the map after a restart: tokens that carry
   * the marker are concentrating, and records with no marked token are dropped.
   *
   * After a setting change (`keepUnmatched`), only records whose concentration
   * moved to another key are dropped, so nothing ends without a message.
   *
   * @param {object} [options] Options.
   * @param {boolean} [options.keepUnmatched=false] Keep records with no marked token.
   * @returns {{added: number, dropped: number}} Changes made.
   */
  function reconcile({ keepUnmatched = false } = {}) {
    const marker = getConfig().statusmarker;
    const records = getRecords();
    const marked = findObjs({ _type: 'graphic' }).filter((t) => isToken(t) && hasMarker(t, marker));
    const seen = new Set();
    const moved = new Set();
    let added = 0;
    for (const token of marked) {
      const key = keyOf(token);
      seen.add(key);
      if (!records[key]) {
        // A changed HP Bar can move a token between character and token keys;
        // keep the spell it was stored with.
        const characterId = toText(token.get('represents'));
        const oldKey = records[token.id]
          ? token.id
          : characterId && records[characterId]
            ? characterId
            : '';
        setRecord(key, oldKey ? records[oldKey].spell : '', nameFor(key, token));
        if (oldKey) {
          moved.add(oldKey);
        } else {
          added += 1;
        }
      }
    }
    let dropped = 0;
    for (const key of Object.keys(records)) {
      if (!seen.has(key) && (!keepUnmatched || moved.has(key))) {
        delete records[key];
        dropped += 1;
      }
    }
    return { added, dropped };
  }

  /**
   * Lists who is concentrating, for the status card and the API.
   *
   * @returns {{key: string, name: string, spell: string, since: number}[]} Entries by name.
   */
  function listConcentrating() {
    return Object.entries(getRecords())
      .map(([key, record]) => ({ key, ...record, name: nameFor(key) }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  // Concentration saves: noticing damage, working out the DC, rolling the save
  // (or offering Roll and Advantage buttons) and ending concentration on a failure.

  // When each key last took damage, so one hit on linked tokens is checked once.
  const lastHit = new Map();

  /**
   * Works out the DC of a concentration save.
   *
   * @param {number} damage Damage taken.
   * @returns {number} DC 10 or half the damage (rounded down), up to DC 30.
   */
  function saveDc(damage) {
    return clamp(Math.floor(damage / 2), MIN_SAVE_DC, MAX_SAVE_DC);
  }

  /**
   * Formats a modifier with its sign.
   *
   * @param {number} mod Modifier.
   * @returns {string} "+3" or "-1".
   */
  function signed(mod) {
    return mod < 0 ? String(mod) : `+${mod}`;
  }

  /**
   * Reads a character's concentration save modifier from the Bonus Attribute.
   * D&D 2024 (Beacon) sheets are read with getSheetItem, other sheets with
   * getAttrByName. A missing or non-numeric value counts as 0.
   *
   * @param {string} characterId Character ID.
   * @returns {Promise<number>} Modifier.
   */
  async function getSaveModifier(characterId) {
    const attribute = getConfig().bonus_attribute;
    if (!characterId) {
      debugLog('Missing character for save modifier', { attribute });
      return 0;
    }
    let raw = null;
    if (typeof getSheetItem === 'function') {
      try {
        raw = await getSheetItem(characterId, attribute);
      } catch (err) {
        debugLog('getSheetItem failed', {
          characterId,
          attribute,
          error: err?.message || String(err),
        });
      }
    }
    if ((raw === null || raw === undefined || raw === '') && typeof getAttrByName === 'function') {
      try {
        raw = getAttrByName(characterId, attribute, 'current');
      } catch (err) {
        debugLog('getAttrByName failed', {
          characterId,
          attribute,
          error: err?.message || String(err),
        });
      }
    }
    const value = parseNumber(raw);
    if (value === null) {
      debugLog('Missing or non-numeric concentration modifier', {
        characterId,
        attribute,
        value: raw,
      });
      return 0;
    }
    return Math.trunc(value);
  }

  /**
   * Rolls two d20s with Roll20's dice roller.
   *
   * @returns {Promise<number[]>} The two results.
   */
  function rollTwoD20() {
    return new Promise((resolve) => {
      sendChat('', '[[1d20]] [[1d20]]', (results) => {
        const rolls = results?.[0]?.inlinerolls || [];
        const value = (i) => {
          const total = Number(rolls[i]?.results?.total);
          return Number.isFinite(total) ? total : randomInteger(20);
        };
        resolve([value(0), value(1)]);
      });
    });
  }

  /**
   * Builds the Concentration Save card body.
   *
   * @param {object} save Save details.
   * @returns {string} HTML.
   */
  function buildSaveBody(save) {
    const { dc, mod, dice, advantage, total, success, spell, name } = save;
    const colour = success ? COLOR_SUCCESS : COLOR_FAILURE;
    const rollText = advantage
      ? tr('save.advantageRoll', { first: dice[0], second: dice[1] })
      : String(dice[0]);
    const vars = { name, spell };
    const outcome = success ? 'kept' : 'lost';
    return [
      buildRow(tr('save.dc'), `<strong>${dc}</strong>`),
      buildRow(tr('save.modifier'), escapeHtml(signed(mod))),
      buildRow(tr('save.roll'), escapeHtml(rollText)),
      `<div style="text-align:center;margin:6px 0 2px 0"><span style="display:inline-block;min-width:2.2em;padding:2px 8px;border:2px solid ${colour};border-radius:4px;font-size:1.6em;font-weight:bold">${total}</span></div>`,
      `<div style="text-align:center;font-weight:bold;color:${colour};font-size:1.1em">${escapeHtml(tr(success ? 'save.success' : 'save.failure'))}</div>`,
      `<div style="border-top:1px solid ${COLOR_BORDER};margin-top:4px;padding-top:3px">${rich(`notices.${spell ? outcome : `${outcome}NoSpell`}`, vars)}</div>`,
    ].join('');
  }

  /**
   * Rolls a concentration save and reports it. A failed save ends concentration.
   *
   * @param {object} details Save details.
   * @param {string} details.key Character or token ID.
   * @param {string} [details.tokenId] Token that took the damage.
   * @param {number} details.dc DC.
   * @param {number} details.mod Modifier.
   * @param {string} details.name Name shown on the card.
   * @param {boolean} details.advantage Roll with advantage.
   * @returns {Promise<void>}
   */
  async function rollSave({ key, tokenId, dc, mod, name, advantage }) {
    const dice = await rollTwoD20();
    const natural = advantage ? Math.max(dice[0], dice[1]) : dice[0];
    const total = natural + mod;
    const success = total >= dc;
    const token = tokenId ? getObj('graphic', tokenId) : undefined;
    const spell = getRecord(key)?.spell || '';
    sendAbout(
      key,
      token,
      tr('titles.save'),
      buildSaveBody({ dc, mod, dice, advantage, total, success, spell, name }),
      name
    );
    if (!success) {
      endConcentration(key, 'lost', { announce: false, token });
    }
  }

  /**
   * Sends the "make a concentration save" reminder, with Roll and Advantage
   * buttons when Roll Button is on.
   *
   * @param {object} details Save details (see rollSave).
   * @param {object} token Token that took the damage.
   * @returns {void}
   */
  function sendReminder(details, token) {
    const { dc, name, key } = details;
    const lines = [
      `<div>${rich('notices.checkNeeded', { name, dc: tr('save.dcValue', { dc }) })}</div>`,
    ];
    if (getConfig().show_roll_button) {
      const id = addPendingRoll({ ...details, advantage: false });
      const command = `!${getConfig().command}`;
      lines.push(
        `<div style="text-align:center;margin-top:4px">${buildButton(tr('buttons.roll'), `${command} roll ${id}`)}${buildSecondaryButton(tr('buttons.advantage'), `${command} advantage ${id}`)}</div>`
      );
    }
    sendAbout(key, token, tr('titles.check'), lines.join(''), name);
  }

  /**
   * Handles a change to a token's hit point bar: damage to a concentrating
   * token calls for a save, and 0 hit points ends concentration.
   *
   * @param {object} token Roll20 graphic.
   * @param {object} prev Previous attributes.
   * @returns {Promise<void>}
   */
  async function handleDamage(token, prev) {
    const bar = `bar${getConfig().bar}_value`;
    const before = parseNumber(prev?.[bar]);
    const after = parseNumber(token.get(bar));
    if (before === null || after === null || after >= before) {
      return;
    }
    const key = keyOf(token);
    if (!isConcentrating(key)) {
      return;
    }
    const config = getConfig();
    if (config.end_at_zero && after <= 0) {
      endConcentration(key, 'zeroHp', { token });
      return;
    }
    // A linked bar changes every token of the character, each with the same
    // before and after; only the first of those echoes is a hit.
    const now = Date.now();
    const hit = `${before}>${after}`;
    const last = lastHit.get(key);
    if (last && last.hit === hit && now - last.at < DAMAGE_DEBOUNCE_MS) {
      return;
    }
    lastHit.set(key, { hit, at: now });
    const characterId = toText(characterOf(token)?.id);
    const details = {
      key,
      tokenId: token.id,
      dc: saveDc(before - after),
      mod: await getSaveModifier(characterId),
      name: tokenName(token) || tr('values.unnamed'),
    };
    if (config.auto_roll_save) {
      await rollSave({ ...details, advantage: hasAdvantage(characterId) });
    } else {
      sendReminder(details, token);
    }
  }

  /**
   * Rolls a save from a Roll or Advantage button.
   *
   * @param {string} id Pending save ID.
   * @param {boolean} advantage Roll with advantage.
   * @param {string} playerId Who clicked.
   * @returns {Promise<'rolled'|'expired'|'denied'>} What happened.
   */
  async function rollPending(id, advantage, playerId) {
    const pending = getPendingRoll(id);
    if (!pending) {
      return 'expired';
    }
    // Someone else's click leaves the button working for the right player; with
    // the token gone, only the GM (or another Mod) may roll.
    const token = pending.tokenId ? getObj('graphic', pending.tokenId) : null;
    const gm = playerId === 'API' || playerIsGM(playerId);
    if (token ? !canControl(token, playerId) : !gm) {
      return 'denied';
    }
    takePendingRoll(id);
    // Concentration that has ended since the reminder needs no save.
    if (!isConcentrating(pending.key)) {
      return 'expired';
    }
    await rollSave({ ...pending, advantage });
    return 'rolled';
  }

  // Chat commands: `!concentration [spell]`, the settings menu and GM tools.

  // Subcommands players may use on tokens they control. Everything else is GM only.
  const PLAYER_COMMANDS = new Set(['', 'end', 'roll', 'advantage', 'help']);

  // Words that are subcommands rather than spell names.
  const SUBCOMMANDS = new Set([
    'menu',
    'config',
    'reset',
    'end',
    'status',
    'help',
    'journal',
    'advantage-menu',
    'toggle-advantage',
    'roll',
    'advantage',
  ]);

  // Settings in the order the menu shows them.
  const SETTING_ROWS = [
    'statusmarker',
    'bar',
    'send_reminder_to',
    'auto_add_concentration_marker',
    'auto_roll_save',
    'show_roll_button',
    'end_at_zero',
    'bonus_attribute',
    'command',
    'language',
    'debug',
    'support_mode',
  ];

  /**
   * Builds a command line from the configured command and arguments.
   *
   * @param {string} args Arguments.
   * @returns {string} Command.
   */
  function cmd(args) {
    return `!${getConfig().command} ${args}`.trim();
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
    const hint = tr(`hints.${key}`, vars);
    whisperError(playerId, tr(`errors.${key}`, vars), hint === `hints.${key}` ? '' : hint);
  }

  /**
   * Formats a setting value for display.
   *
   * @param {string} key Setting key.
   * @param {*} value Setting value.
   * @returns {string} Display text.
   */
  function formatValue(key, value) {
    if (TOGGLE_KEYS.includes(key)) {
      return tr(value ? 'values.on' : 'values.off');
    }
    switch (key) {
      case 'language':
        return LOCALE_LABELS[value] || value;
      case 'bar':
        return tr('values.bar', { bar: value });
      case 'command':
        return `!${value}`;
      case 'send_reminder_to':
        return tr(`values.sendTo.${value}`);
      case 'support_mode':
        return tr(`values.supportMode.${value}`);
      default:
        return String(value);
    }
  }

  /**
   * Builds a Roll20 query. Options are [label, value] pairs.
   *
   * @param {string} label Prompt label.
   * @param {Array<[string, string]>|null} options Choices, or null for free text.
   * @param {*} [current] Current value, offered as the default for free text.
   * @returns {string} Query text.
   */
  function query(label, options, current) {
    const safe = (text) => String(text).replaceAll(/[|},]/g, '');
    if (options) {
      return `?{${safe(label)}|${options.map(([l, v]) => `${safe(l)},${safe(v)}`).join('|')}}`;
    }
    const shown = current === null || current === undefined ? '' : safe(current);
    return `?{${safe(label)}|${shown}}`;
  }

  /**
   * Returns the marker tags offered in the menu: the game's custom token
   * markers, then Roll20's built-in markers.
   *
   * @returns {string[]} Marker tags.
   */
  function markerChoices() {
    let custom = [];
    try {
      const parsed = JSON.parse(Campaign().get('_token_markers') || '[]');
      custom = Array.isArray(parsed) ? parsed.map((m) => toText(m?.tag)).filter(Boolean) : [];
    } catch {
      custom = [];
    }
    return [...new Set([...custom, ...DEFAULT_MARKERS])];
  }

  /**
   * Returns the button command that changes a setting.
   *
   * @param {string} key Setting key.
   * @returns {string} Command.
   */
  function settingCommand(key) {
    const config = getConfig();
    const label = tr(`settings.${key}.label`);
    if (TOGGLE_KEYS.includes(key)) {
      return cmd(`config ${key}|${!config[key]}`);
    }
    const options = {
      statusmarker: markerChoices().map((m) => [m, m]),
      bar: [1, 2, 3].map((b) => [tr('values.bar', { bar: b }), String(b)]),
      send_reminder_to: SEND_TO_OPTIONS.map((o) => [tr(`values.sendTo.${o}`), o]),
      support_mode: SUPPORT_MODE_OPTIONS.map((o) => [tr(`values.supportMode.${o}`), o]),
      language: SUPPORTED_LOCALES.map((l) => [LOCALE_LABELS[l] || l, l]),
    }[key];
    return cmd(`config ${key}|${query(label, options || null, config[key])}`);
  }

  /**
   * Shows the settings menu to the GM.
   *
   * @param {string|null} playerId Player ID.
   * @param {string} [noteHtml] A line shown above the settings, such as a confirmation.
   * @returns {void}
   */
  function showMenu(playerId, noteHtml = '') {
    const config = getConfig();
    const lines = [];
    if (noteHtml) {
      lines.push(`<div style="margin-bottom:4px">${noteHtml}</div>`, buildDivider());
    }
    const count = Object.keys(getRecords()).length;
    lines.push(
      `<div style="font-size:0.9em">${escapeHtml(tr('menu.concentratingCount', { count }))}</div>`
    );
    lines.push(buildSectionLabel(tr('menu.settings')));
    for (const key of SETTING_ROWS) {
      if (key === 'show_roll_button' && config.auto_roll_save) {
        continue;
      }
      const hint = tr(`settings.${key}.hint`);
      lines.push(
        buildRow(
          tr(`settings.${key}.label`),
          buildSecondaryButton(formatValue(key, config[key]), settingCommand(key)),
          hint === `settings.${key}.hint` ? '' : hint
        )
      );
    }
    lines.push(
      buildDivider(),
      `<div style="text-align:center">${[
        buildButton(tr('buttons.status'), cmd('status')),
        buildButton(tr('buttons.advantageMenu'), cmd('advantage-menu')),
        buildSecondaryButton(tr('buttons.help'), cmd('help')),
        buildSecondaryButton(tr('buttons.reset'), cmd('reset')),
      ].join('')}</div>`,
      `<div style="font-size:0.8em;margin-top:4px">${escapeHtml(tr('menu.footer', { command: cmd(''), deck: HANDOUT_DECK_NAME }))}</div>`
    );
    whisper(playerId, tr('titles.menu'), lines, dirStyle());
  }

  /**
   * Shows the command list.
   *
   * @param {string} playerId Player ID.
   * @returns {void}
   */
  function showHelp(playerId) {
    const gm = playerId === API_PLAYER_ID || playerIsGM(playerId);
    const rows = HELP_COMMANDS.filter(([text]) => gm || ['', '<spell>', 'end'].includes(text)).map(
      ([text, key]) => buildRow(cmd(text), escapeHtml(tr(`help.${key}`)))
    );
    rows.push(
      `<div style="font-size:0.85em;margin-top:4px">${escapeHtml(tr(gm ? 'help.footer' : 'help.playerFooter', { help: HANDOUT_HELP_NAME, deck: HANDOUT_DECK_NAME }))}</div>`
    );
    whisper(playerId, tr('titles.help'), rows, dirStyle());
  }

  /**
   * Shows who is concentrating, with an End button for each.
   *
   * @param {string} playerId Player ID.
   * @returns {void}
   */
  function showStatus(playerId) {
    const entries = listConcentrating();
    const lines =
      entries.length === 0
        ? [`<div>${escapeHtml(tr('status.none'))}</div>`]
        : entries.map((entry) =>
            buildRow(
              entry.spell ? `${entry.name}: ${entry.spell}` : entry.name,
              buildSecondaryButton(tr('buttons.end'), cmd(`end ${entry.key}`))
            )
          );
    lines.push(buildDivider(), buildSecondaryButton(tr('buttons.menu'), cmd('')));
    whisper(playerId, tr('titles.status'), lines, dirStyle());
  }

  /**
   * Shows the characters and whether they roll concentration saves with advantage.
   *
   * @param {string} playerId Player ID.
   * @returns {void}
   */
  function showAdvantageMenu(playerId) {
    const characters = findObjs({ _type: 'character' }).sort((a, b) =>
      toText(a.get('name')).localeCompare(toText(b.get('name')))
    );
    const lines = [`<div style="font-size:0.9em">${escapeHtml(tr('advantage.intro'))}</div>`];
    if (characters.length === 0) {
      lines.push(`<div>${escapeHtml(tr('advantage.none'))}</div>`);
    }
    for (const character of characters) {
      const on = hasAdvantage(character.id);
      const button = on ? buildButton : buildSecondaryButton;
      lines.push(
        buildRow(
          toText(character.get('name')) || tr('values.unnamed'),
          button(tr(on ? 'values.on' : 'values.off'), cmd(`toggle-advantage ${character.id}`))
        )
      );
    }
    lines.push(buildDivider(), buildSecondaryButton(tr('buttons.menu'), cmd('')));
    whisper(playerId, tr('titles.advantage'), lines, dirStyle());
  }

  /**
   * Returns the selected tokens.
   *
   * @param {object} msg Chat message.
   * @returns {object[]} Tokens.
   */
  function selectedTokens(msg) {
    return (msg.selected || [])
      .map((s) => getObj('graphic', s._id))
      .filter((token) => isToken(token));
  }

  /**
   * `!concentration [spell]` with tokens selected: start, switch or end.
   *
   * @param {object} msg Chat message.
   * @param {string} spell Spell typed after the command.
   * @returns {void}
   */
  function commandToggle(msg, spell) {
    const tokens = selectedTokens(msg);
    if (tokens.length === 0) {
      fail(msg.playerid, 'noSelection');
      return;
    }
    const allowed = tokens.filter((token) => canControl(token, msg.playerid));
    if (allowed.length < tokens.length) {
      fail(msg.playerid, 'notYours');
    }
    const done = new Set();
    for (const token of allowed) {
      const key = keyOf(token);
      if (!done.has(key)) {
        done.add(key);
        toggleConcentration(token, spell);
      }
    }
  }

  /**
   * `end [<id>]`: ends concentration on the selected tokens, or on a character
   * or token ID (from the status card).
   *
   * @param {object} msg Chat message.
   * @param {string} ref Character or token ID, if given.
   * @returns {void}
   */
  function commandEnd(msg, ref) {
    if (ref) {
      if (!playerIsGM(msg.playerid) && msg.playerid !== API_PLAYER_ID) {
        fail(msg.playerid, 'gmOnly');
        return;
      }
      if (!endConcentration(ref, 'ended')) {
        fail(msg.playerid, 'notConcentrating');
      }
      return;
    }
    const tokens = selectedTokens(msg).filter((token) => canControl(token, msg.playerid));
    if (tokens.length === 0) {
      fail(msg.playerid, 'noSelection');
      return;
    }
    const keys = new Set(tokens.map((token) => keyOf(token)));
    let ended = 0;
    for (const key of keys) {
      const token = tokens.find((t) => keyOf(t) === key);
      ended += endConcentration(key, 'ended', { token }) ? 1 : 0;
    }
    if (ended === 0) {
      fail(msg.playerid, 'notConcentrating');
    }
  }

  /**
   * Moves every concentration marker from one marker to another.
   *
   * @param {string} from Old marker.
   * @param {string} to New marker.
   * @returns {void}
   */
  function moveMarkers(from, to) {
    for (const key of Object.keys(getRecords())) {
      for (const token of tokensFor(key)) {
        setMarker(token, from, false);
        setMarker(token, to, true);
      }
    }
  }

  /**
   * `config [<key>|<value>]` (also `config <key> <value>`): changes a setting
   * and shows the menu again.
   *
   * @param {object} msg Chat message.
   * @param {string} rest Text after `config`.
   * @returns {void}
   */
  function commandConfig(msg, rest) {
    const text = toText(rest);
    if (!text) {
      showMenu(msg.playerid);
      return;
    }
    const split = text.includes('|') ? text.indexOf('|') : text.search(/\s/);
    const rawKey = split === -1 ? text : text.slice(0, split);
    const rawValue = split === -1 ? '' : text.slice(split + 1).trim();
    const key = Object.keys(DEFAULT_CONFIG).find((k) => k.toLowerCase() === rawKey.toLowerCase());
    if (!key) {
      fail(msg.playerid, 'unknownSetting', { key: rawKey });
      return;
    }
    const before = getConfig()[key];
    const result = setConfigValue(key, rawValue);
    if (!result.valid) {
      fail(msg.playerid, 'badSettingValue', { key, value: rawValue });
      return;
    }
    if (key === 'statusmarker' && before !== result.value) {
      moveMarkers(before, result.value);
    }
    if (key === 'bar') {
      reconcile({ keepUnmatched: true });
    }
    if (key === 'language' || key === 'command') {
      installHandouts();
    }
    showMenu(
      msg.playerid,
      rich('messages.settingChanged', {
        setting: tr(`settings.${key}.label`),
        value: formatValue(key, result.value),
      })
    );
  }

  /**
   * `reset [confirm]`: puts the settings back to their defaults.
   *
   * @param {object} msg Chat message.
   * @param {string} rest Text after `reset`.
   * @returns {void}
   */
  function commandReset(msg, rest) {
    if (toText(rest).toLowerCase() !== 'confirm') {
      whisper(
        msg.playerid,
        tr('titles.reset'),
        [
          `<div>${escapeHtml(tr('messages.confirmReset'))}</div>`,
          `<div style="text-align:center;margin-top:4px">${buildButton(tr('buttons.confirmReset'), cmd('reset confirm'))}${buildSecondaryButton(tr('buttons.menu'), cmd(''))}</div>`,
        ],
        dirStyle()
      );
      return;
    }
    const marker = getConfig().statusmarker;
    resetState();
    if (marker !== getConfig().statusmarker) {
      moveMarkers(marker, getConfig().statusmarker);
    }
    reconcile({ keepUnmatched: true });
    installHandouts();
    showMenu(msg.playerid, escapeHtml(tr('messages.reset')));
  }

  /**
   * `roll <id>` / `advantage <id>`: rolls a save from its button.
   *
   * @param {object} msg Chat message.
   * @param {string} id Pending save ID.
   * @param {boolean} advantage Roll with advantage.
   * @returns {Promise<void>}
   */
  async function commandRoll(msg, id, advantage) {
    const result = await rollPending(id, advantage, msg.playerid);
    if (result === 'expired') {
      fail(msg.playerid, 'rollExpired');
    } else if (result === 'denied') {
      fail(msg.playerid, 'notYours');
    }
  }

  /**
   * Routes a command once the prefix has been matched.
   *
   * @param {object} msg Chat message.
   * @param {string} sub Subcommand (lower case), or '' for none.
   * @param {string} rest Text after the subcommand.
   * @param {string} all Text after the prefix.
   * @returns {Promise<void>|void}
   */
  function routeCommand(msg, sub, rest, all) {
    const gm = msg.playerid === API_PLAYER_ID || playerIsGM(msg.playerid);
    const isSub = SUBCOMMANDS.has(sub);
    if (isSub && !gm && !PLAYER_COMMANDS.has(sub)) {
      fail(msg.playerid, 'gmOnly');
      return undefined;
    }
    if (!isSub) {
      if (!all && gm && selectedTokens(msg).length === 0) {
        showMenu(msg.playerid);
        return undefined;
      }
      commandToggle(msg, cleanSpellName(all, MAX_SPELL_LENGTH));
      return undefined;
    }
    const word = toText(rest).split(/\s+/)[0] || '';
    switch (sub) {
      case 'menu':
        showMenu(msg.playerid);
        break;
      case 'config':
        commandConfig(msg, rest);
        break;
      case 'reset':
        commandReset(msg, rest);
        break;
      case 'end':
        commandEnd(msg, word);
        break;
      case 'status':
        showStatus(msg.playerid);
        break;
      case 'help':
        showHelp(msg.playerid);
        break;
      case 'journal':
        installHandouts();
        whisper(
          msg.playerid,
          SCRIPT_NAME,
          `<div>${escapeHtml(tr('messages.journal', { help: HANDOUT_HELP_NAME, deck: HANDOUT_DECK_NAME }))}</div>`,
          dirStyle()
        );
        break;
      case 'advantage-menu':
        showAdvantageMenu(msg.playerid);
        break;
      case 'toggle-advantage':
        if (!getObj('character', word)) {
          fail(msg.playerid, 'unknownCharacter');
          break;
        }
        toggleAdvantage(word);
        showAdvantageMenu(msg.playerid);
        break;
      case 'roll':
      case 'advantage':
        return commandRoll(msg, word, sub === 'advantage');
    }
    return undefined;
  }

  /**
   * Handles a chat message: spell cards for automatic concentration, and
   * `!concentration` commands.
   *
   * @param {object} msg Roll20 chat message.
   * @returns {void}
   */
  function handleInput(msg) {
    if (!isRecord(msg)) {
      return;
    }
    const config = getConfig();
    if (msg.type !== 'api') {
      if (config.auto_add_concentration_marker) {
        const spellCast = detectSpellCast(msg);
        if (spellCast) {
          handleSpellCast(msg, spellCast);
        }
      }
      return;
    }
    const content = toText(msg.content);
    const prefix = content.split(/\s+/)[0];
    if (prefix.toLowerCase() !== `!${config.command}`.toLowerCase()) {
      return;
    }
    const all = content.slice(prefix.length).trim();
    const sub = all.split(/\s+/)[0].toLowerCase();
    const rest = all.slice(sub.length).trim();
    const run = async () => {
      try {
        await routeCommand(msg, sub, rest, all);
      } catch (err) {
        log(`${SCRIPT_NAME} ERROR handling "${content}": ${err?.message || err}`);
        if (err?.stack) {
          log(err.stack);
        }
        fail(msg.playerid, 'internal');
      }
    };
    run();
  }

  /**
   * Warns the GM when a setting looks wrong for this game.
   *
   * @returns {void}
   */
  function checkSetup() {
    const marker = getConfig().statusmarker;
    if (!markerChoices().includes(marker)) {
      whisperWarning(null, tr('warnings.unknownMarker', { marker }));
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
      const report = (err) => {
        log(`${SCRIPT_NAME} ERROR in ${label}: ${err?.message || err}`);
        if (err?.stack) {
          log(err.stack);
        }
      };
      try {
        const result = fn(...args);
        if (result && typeof result.catch === 'function') {
          result.catch(report);
        }
      } catch (err) {
        report(err);
      }
    };
  }

  /**
   * Handles a changed graphic: hit point damage and the concentration marker.
   *
   * @param {object} obj Roll20 graphic.
   * @param {object} prev Previous attributes.
   * @returns {Promise<void>|void}
   */
  function handleGraphicChange(obj, prev) {
    if (!isToken(obj)) {
      return undefined;
    }
    if (prev?.statusmarkers !== obj.get('statusmarkers')) {
      handleMarkerChange(obj, prev);
    }
    // Linking or unlinking the HP bar, or changing what the token represents,
    // moves it between character and token keys.
    const link = `bar${getConfig().bar}_link`;
    if (prev?.[link] !== obj.get(link) || prev?.represents !== obj.get('represents')) {
      syncToken(obj);
    }
    const bar = `bar${getConfig().bar}_value`;
    if (String(prev?.[bar]) !== String(obj.get(bar))) {
      return handleDamage(obj, prev);
    }
    return undefined;
  }

  /**
   * Publishes the API other Mods can call.
   *
   * @returns {void}
   */
  function publishApi() {
    globalThis.Concentration = Object.freeze({
      version: SCRIPT_VERSION,
      /**
       * Returns true when a token is concentrating.
       *
       * @param {string} tokenId Token ID.
       * @returns {boolean} True when concentrating.
       */
      isConcentrating(tokenId) {
        const token = getObj('graphic', tokenId);
        return Boolean(ready && token && isConcentrating(keyOf(token)));
      },
      /**
       * Returns the spell a token is concentrating on.
       *
       * @param {string} tokenId Token ID.
       * @returns {string|null} Spell ('' when none was named), or null when not concentrating.
       */
      spellOf(tokenId) {
        const token = getObj('graphic', tokenId);
        const record = token ? getRecordFor(token) : null;
        return record ? record.spell : null;
      },
      /**
       * Starts (or switches) concentration on a token.
       *
       * @param {string} tokenId Token ID.
       * @param {string} [spell] Spell name.
       * @returns {boolean} True when the token exists.
       */
      start(tokenId, spell = '') {
        const token = getObj('graphic', tokenId);
        if (!ready || !isToken(token)) {
          return false;
        }
        startConcentration(token, cleanSpellName(spell, 80));
        return true;
      },
      /**
       * Ends concentration on a token.
       *
       * @param {string} tokenId Token ID.
       * @returns {boolean} True when it was concentrating.
       */
      end(tokenId) {
        const token = getObj('graphic', tokenId);
        return Boolean(ready && token && endConcentration(keyOf(token), 'ended', { token }));
      },
      /**
       * Lists who is concentrating.
       *
       * @returns {{key: string, name: string, spell: string, since: number}[]} Entries.
       */
      list() {
        return ready ? listConcentrating() : [];
      },
    });
  }

  /**
   * Startup: migrate state, catch up with the map, install handouts and greet the GM.
   *
   * @returns {void}
   */
  function checkInstall() {
    const migratedFrom = initialiseState();
    applyGlobalConfig();
    prunePendingRolls();
    const { added, dropped } = reconcile();
    installHandouts();
    publishApi();
    ready = true;

    log(`-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} [Updated: ${SCRIPT_LAST_UPDATED}] <=-`);

    const line = (text) => `<div style="margin-top:3px">${escapeHtml(text)}</div>`;
    const lines = [`<div><strong>${escapeHtml(tr('titles.ready'))}</strong></div>`];
    if (migratedFrom === 1) {
      lines.push(line(tr('messages.migrated')));
    }
    if (added + dropped > 0) {
      lines.push(line(tr('messages.reconciled', { added, dropped })));
    }
    lines.push(
      `<div style="font-size:0.85em;margin-top:3px">${escapeHtml(tr('messages.readyHint', { command: `!${getConfig().command}` }))}</div>`
    );
    whisper(null, `${SCRIPT_NAME} v${SCRIPT_VERSION}`, lines, dirStyle());
    checkSetup();
    if (takeNotice('welcomed')) {
      showMenu(null);
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
    on('chat:message', guarded('chat:message', handleInput));
    on('change:graphic', guarded('change:graphic', handleGraphicChange));
    on('destroy:graphic', guarded('destroy:graphic', handleTokenDestroyed));
    // Roll20 fills in a new token's properties just after add:graphic, so wait a moment.
    on(
      'add:graphic',
      guarded('add:graphic', (obj) =>
        setTimeout(
          guarded('add:graphic', () => syncToken(obj)),
          250
        )
      )
    );
  }

  registerEventHandlers();
})();
