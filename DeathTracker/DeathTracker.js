/**
 * NOTE: GENERATED FILE - DO NOT EDIT DIRECTLY.
 * NOTE: Source files live under src/ and are bundled with `npm run build`.
 * ------------------------------------------------
 * Name: DeathTracker
 * Script: DeathTracker.js
 * Version: 1.0.0
 * Built: 2026-11-10T00:39:42.398Z
 */
const DeathTrackerMod = (() => {
  'use strict';

  // Build-time placeholders replaced by rollup.config.js inject-build-metadata plugin.
  const SCRIPT_NAME = 'DeathTracker';
  const SCRIPT_VERSION = '1.0.0';
  const SCRIPT_LAST_UPDATED = '2026-11-10T00:39:42.398Z';

  const DEFAULT_LOCALE$1 = 'en-US';

  const STATE_KEY = 'DeathTracker';
  // Where 0.1.x kept its settings. Read once to carry them over, then left alone
  // so going back to 0.1.8 still finds them.
  const LEGACY_STATE_KEY = 'DEATHTRACKER';
  const SCHEMA_VERSION = 1;

  // Commands are matched without regard to case. `!dead` was 0.1.x's command.
  const COMMAND = '!deathtracker';
  const COMMAND_ALIASES = ['!deathtracker', '!death-tracker', '!dt', '!dead'];

  // The player ID Roll20 gives chat messages sent by Mods with sendChat.
  const API_PLAYER_ID = 'API';

  const HANDOUT_HELP_NAME = 'DeathTracker - Help';
  // The deck's name is not translated, so it always matches the handout's name.
  const DECK_TITLE = 'Command Deck';
  const HANDOUT_DECK_NAME = `DeathTracker - ${DECK_TITLE}`;
  const MACRO_NAME = 'DeathSaves';
  // Journal icon (the handouts' avatar): the plain DeathTracker icon in Roll20's
  // file store. Roll20 keeps it as `.../max.webp?<number>`, so an icon is matched
  // on its image path. Only the webp files exist (thumb.png is a 404).
  const HANDOUT_ICON_PATH = '/images/506962415/PhsacK45UrgrODYxZHj3Zw/';
  const HANDOUT_ICON = `https://files.d20.io${HANDOUT_ICON_PATH}thumb.webp`;

  const AUTHOR_LINKS = {
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

  // What a token can be. A token with no readable hit points has no status.
  const STATUS = Object.freeze({
    HEALTHY: 'healthy',
    BLOODIED: 'bloodied',
    DYING: 'dying',
    STABLE: 'stable',
    DEAD: 'dead',
  });
  const STATUS_LIST = Object.values(STATUS);

  // The marker setting for each status that has one.
  const STATUS_MARKER_SETTING = Object.freeze({
    bloodied: 'bloodiedMarker',
    dying: 'dyingMarker',
    stable: 'stableMarker',
    dead: 'deadMarker',
  });

  // Roll20's built-in marker tags, used when the game's own list cannot be read.
  const BUILTIN_MARKERS = [
    'red',
    'blue',
    'green',
    'brown',
    'purple',
    'pink',
    'yellow',
    'dead',
    'skull',
    'sleepy',
    'half-heart',
    'half-haze',
    'interdiction',
    'snail',
    'lightning-helix',
    'spanner',
    'chained-heart',
    'chemical-bolt',
    'death-zone',
    'drink-me',
    'edge-crack',
    'ninja-mask',
    'stopwatch',
    'fishing-net',
    'overdrive',
    'strong',
    'fist',
    'padlock',
    'three-leaves',
    'fluffy-wing',
    'pummeled',
    'tread',
    'arrowed',
    'aura',
    'back-pain',
    'black-flag',
    'bleeding-eye',
    'bolt-shield',
    'broken-heart',
    'cobweb',
    'broken-shield',
    'flying-flag',
    'radioactive',
    'trophy',
    'broken-skull',
    'frozen-orb',
    'rolling-bomb',
    'white-tower',
    'grab',
    'screaming',
    'grenade',
    'sentry-gun',
    'all-for-one',
    'angel-outfit',
    'archery-target',
  ];
  // Coloured dots: markers with no picture, so they are listed without a name.
  const COLOUR_MARKERS = ['red', 'blue', 'green', 'brown', 'purple', 'pink', 'yellow'];

  // Roll20's built-in effect types and colours. An effect is written "type-colour".
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
  // Built-in types drawn from one point to another (0.1.x drew every effect this way).
  const BEAM_FX_TYPES = ['beam', 'breath', 'splatter'];

  // Death saves on the D&D 5E (2014) sheet and others that keep them as checkboxes.
  const DEFAULT_SUCCESS_FIELDS = 'deathsave_succ1,deathsave_succ2,deathsave_succ3';
  const DEFAULT_FAILURE_FIELDS = 'deathsave_fail1,deathsave_fail2,deathsave_fail3';
  const DEATH_SAVES_NEEDED = 3;
  // The D&D 2024 (Beacon) sheet keeps everything in one attribute named "store".
  const BEACON_STORE_ATTR = 'store';
  const BEACON_NPC_LAYOUT = 'Stat Block';

  // How often dying characters' death saves are read when no event arrives.
  const DEATH_SAVE_POLL_MS = 3000;

  const SETTING_CHOICES = Object.freeze({
    hpBar: [1, 2, 3],
    pcDetection: ['auto', 'players'],
    deathLayer: ['none', 'gmlayer', 'map'],
    deathTurnOrder: ['keep', 'remove'],
    deathActionsFor: ['npc', 'all'],
    announce: ['off', 'gm', 'controllers'],
  });

  // Default settings for new installs. Whether DeathTracker tints and plays
  // effects at all is chosen with HealthColors (see owners.js).
  const DEFAULT_SETTINGS = {
    language: DEFAULT_LOCALE$1,
    hpBar: 1,
    bloodiedPercent: 50,
    bloodiedMarker: 'red',
    dyingMarker: 'sleepy',
    stableMarker: 'green',
    deadMarker: 'dead',
    pcDetection: 'auto',
    deathSaves: true,
    resetSheetSaves: true,
    successFields: DEFAULT_SUCCESS_FIELDS,
    failureFields: DEFAULT_FAILURE_FIELDS,
    massiveDamage: false,
    announce: 'controllers',
    deathLayer: 'none',
    deathTurnOrder: 'keep',
    deathActionsFor: 'npc',
    tintPlayers: true,
    tintNpcs: true,
    hurtFx: true,
    hurtFxType: 'splatter-blood',
    healFx: false,
    healFxType: 'glow-holy',
  };

  // Settings shown as on/off switches.
  const BOOLEAN_SETTINGS = [
    'deathSaves',
    'resetSheetSaves',
    'massiveDamage',
    'tintPlayers',
    'tintNpcs',
    'hurtFx',
    'healFx',
  ];
  const MARKER_SETTINGS = ['bloodiedMarker', 'dyingMarker', 'stableMarker', 'deadMarker'];

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
  const COLOR_WARNING_BG = '#fef3c7';
  const COLOR_WARNING_BORDER = '#92400e';
  const COLOR_WARNING_TEXT = '#92400e';
  const COLOR_ERROR_BG = '#fee2e2';
  const COLOR_ERROR_BORDER = '#991b1b';
  const COLOR_ERROR_TEXT = '#991b1b';
  // Status colours in menus.
  const STATUS_COLOURS = Object.freeze({
    healthy: '#6fcf97',
    bloodied: '#f2c94c',
    dying: '#f2994a',
    stable: '#56ccf2',
    dead: '#eb5757',
  });

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

  // Characters Roll20's chat would act on: rolls, attribute and ability calls,
  // queries and macros. Sheet values and marker names are shown through this.
  const CHAT_ENTITIES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '[': '&#91;',
    ']': '&#93;',
    '{': '&#123;',
    '}': '&#125;',
    '@': '&#64;',
    '%': '&#37;',
    '?': '&#63;',
    '#': '&#35;',
    '|': '&#124;',
    '`': '&#96;',
    '~': '&#126;',
  };

  /**
   * Escapes text so Roll20's chat shows it as written instead of running it.
   *
   * @param {*} text Text to escape.
   * @returns {string} Escaped text.
   */
  function escapeForChat(text) {
    return String(text).replaceAll(/[&<>"'[\]{}@%?#|`~]/g, (c) => CHAT_ENTITIES[c]);
  }

  /**
   * Parses a number. Roll20 keeps bar values as numbers or as text ("10"), so
   * everything goes through here. Empty text is not a number (0.1.x read an
   * empty bar as 0 and marked the token dead).
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
    if (['on', 'true', 'yes', '1', 'checked'].includes(text)) {
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
   * Splits a comma-separated list, dropping blanks.
   *
   * @param {*} raw List text.
   * @returns {string[]} Items.
   */
  function splitList(raw) {
    return toText(raw)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  /**
   * Converts a hue (0 red to 120 green) to a hex colour at 75% saturation and
   * 50% lightness, as 0.1.x tinted tokens.
   *
   * @param {number} hue Hue in degrees.
   * @returns {string} Colour such as #df2020.
   */
  function hueToHex(hue) {
    const h = (((hue % 360) + 360) % 360) / 360;
    const s = 0.75;
    const l = 0.5;
    const q = l + s - l * s;
    const p = 2 * l - q;
    const channel = (t) => {
      let x = t;
      if (x < 0) {
        x += 1;
      }
      if (x > 1) {
        x -= 1;
      }
      if (x < 1 / 6) {
        return p + (q - p) * 6 * x;
      }
      if (x < 1 / 2) {
        return q;
      }
      if (x < 2 / 3) {
        return p + (q - p) * (2 / 3 - x) * 6;
      }
      return p;
    };
    const hex = (v) =>
      Math.round(v * 255)
        .toString(16)
        .padStart(2, '0');
    return `#${hex(channel(h + 1 / 3))}${hex(channel(h))}${hex(channel(h - 1 / 3))}`;
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

  // What happens to a token when it dies (each optional), and putting it back.

  /**
   * Reads the turn order.
   *
   * @returns {object[]} Entries.
   */
  function readTurnOrder() {
    try {
      const list = JSON.parse(Campaign().get('turnorder') || '[]');
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  /**
   * Writes the turn order.
   *
   * @param {object[]} list Entries.
   * @returns {void}
   */
  function writeTurnOrder(list) {
    Campaign().set('turnorder', JSON.stringify(list));
  }

  /**
   * Runs the on-death actions the GM chose for a token.
   *
   * @param {object} token Roll20 graphic.
   * @param {{deathLayer: string, deathTurnOrder: string}} settings Settings.
   * @returns {object|null} What was done (kept so `restore` can undo it), or null when nothing was.
   */
  function runDeathActions(token, settings) {
    const done = {};
    if (settings.deathLayer !== 'none' && token.get('layer') !== settings.deathLayer) {
      done.layer = token.get('layer');
      token.set('layer', settings.deathLayer);
    }
    if (settings.deathTurnOrder === 'remove') {
      const list = readTurnOrder();
      const index = list.findIndex((e) => e && e.id === token.id);
      if (index >= 0) {
        const entry = list[index];
        done.turn = { pr: entry.pr, custom: toText(entry.custom), index };
        writeTurnOrder(list.filter((e) => !(e && e.id === token.id)));
      }
    }
    return Object.keys(done).length ? done : null;
  }

  /**
   * Undoes the on-death actions: back to the layer it was on, and back into the
   * turn order with the initiative it had (when it is not there already).
   *
   * @param {object} token Roll20 graphic.
   * @param {object|null} done What runDeathActions did.
   * @returns {{layer: boolean, turn: boolean}} What was put back.
   */
  function undoDeathActions(token, done) {
    const out = { layer: false, turn: false };
    if (!done) {
      return out;
    }
    if (done.layer && token.get('layer') !== done.layer) {
      token.set('layer', done.layer);
      out.layer = true;
    }
    if (done.turn) {
      const list = readTurnOrder();
      if (!list.some((e) => e && e.id === token.id)) {
        const entry = {
          id: token.id,
          pr: done.turn.pr,
          custom: done.turn.custom || '',
          _pageid: token.get('_pageid'),
        };
        const at = Math.max(
          0,
          Math.min(list.length, Math.round(toNumber(done.turn.index) ?? list.length))
        );
        list.splice(at, 0, entry);
        writeTurnOrder(list);
        out.turn = true;
      }
    }
    return out;
  }

  // Other Mods: HealthColors, TokenMod, and the 0.1.x observer list that
  // CombatMaster, LazyExperience and StatusInfo use.

  const observers = [];

  /**
   * Says whether HealthColors is installed.
   *
   * @returns {boolean} True when it is.
   */
  function healthColorsInstalled() {
    return typeof HealthColors !== 'undefined' && !!HealthColors;
  }

  /**
   * Says whether HealthColors is also tracking death saves.
   *
   * @returns {boolean} True when its death save markers are on.
   */
  function healthColorsTracksSaves() {
    return (
      healthColorsInstalled() &&
      typeof state !== 'undefined' &&
      isRecord(state.HealthColors) &&
      state.HealthColors.deathSavesOn === true
    );
  }

  /**
   * Adds a 0.1.x observer: called with (token, prev) after DeathTracker handles a
   * hit point change.
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
   * Tells the 0.1.x observers about a change. One failing observer does not stop
   * the others (or DeathTracker).
   *
   * @param {object} token Roll20 graphic.
   * @param {object} prev Previous attributes.
   * @returns {void}
   */
  function notifyObservers(token, prev) {
    for (const fn of observers) {
      try {
        fn(token, prev);
      } catch (e) {
        log(`DeathTracker: a token change observer failed: ${e?.message || e}`);
      }
    }
  }

  // Who handles the things HealthColors and DeathTracker can both do: death
  // saves with the dying, stable and dead markers; health colours; and hurt and
  // heal effects. Each is done by one Mod or by neither. The choice is kept in
  // state.ModOwners, which HealthColors 2.5 and later reads and writes as well,
  // so changing it in either Mod's settings changes it for both.

  const SELF = 'DeathTracker';

  /** Who can handle an area: one of the two Mods, or 'off' for neither. */
  const OWNERS = ['DeathTracker', 'HealthColors', 'off'];

  /** The settings-card keys for the areas. */
  const OWNER_SETTINGS = {
    deathSavesBy: 'deathSaves',
    coloursBy: 'colours',
    effectsBy: 'effects',
  };

  /**
   * Who handles an area until the GM chooses: with HealthColors installed,
   * DeathTracker does death saves and HealthColors the colours and effects;
   * otherwise DeathTracker does them all. HealthColors works this out the same
   * way.
   *
   * @param {string} area One of OWNER_AREAS.
   * @returns {string} One of OWNERS.
   */
  function defaultOwner(area) {
    if (!healthColorsInstalled()) {
      return SELF;
    }
    return area === 'deathSaves' ? SELF : 'HealthColors';
  }

  /**
   * Who handles an area now.
   *
   * @param {string} area One of OWNER_AREAS.
   * @returns {string} One of OWNERS.
   */
  function getOwner(area) {
    const chosen =
      typeof state !== 'undefined' && isRecord(state.ModOwners) ? state.ModOwners[area] : undefined;
    return OWNERS.includes(chosen) ? chosen : defaultOwner(area);
  }

  /**
   * Says whether DeathTracker handles an area.
   *
   * @param {string} area One of OWNER_AREAS.
   * @returns {boolean} True when it does.
   */
  function owns(area) {
    return getOwner(area) === SELF;
  }

  /**
   * Reads an owner typed in chat ("healthcolors", "DeathTracker", "off").
   *
   * @param {*} raw Value as typed.
   * @returns {string|null} One of OWNERS, or null when it is none of them.
   */
  function parseOwner(raw) {
    const value = toText(raw).trim().toLowerCase();
    if (['none', 'disabled', 'disable', 'no'].includes(value)) {
      return 'off';
    }
    return OWNERS.find((o) => o.toLowerCase() === value) || null;
  }

  /**
   * Chooses who handles an area, for both Mods.
   *
   * @param {string} area One of OWNER_AREAS.
   * @param {string} owner One of OWNERS.
   * @returns {void}
   */
  function setOwner(area, owner) {
    if (!isRecord(state.ModOwners)) {
      state.ModOwners = {};
    }
    state.ModOwners[area] = owner;
  }

  /**
   * Says whether the installed HealthColors reads the shared choice (2.5 and
   * later). Older versions do their own thing whatever is chosen.
   *
   * @returns {boolean} True when it does.
   */
  function healthColorsShares() {
    return healthColorsInstalled() && typeof HealthColors.ownersChanged === 'function';
  }

  /**
   * Asks HealthColors to bring its tokens up to date after the choice changed.
   *
   * @returns {void}
   */
  function tellHealthColors() {
    if (!healthColorsShares()) {
      return;
    }
    try {
      HealthColors.ownersChanged();
    } catch (e) {
      log(`DeathTracker: HealthColors could not refresh: ${e?.message || e}`);
    }
  }

  // Reading characters: the D&D 2024 (Beacon) sheet's "store" attribute, plain
  // attributes for other sheets, and who controls a character.
  //
  // Found in Jumpgate on sandbox v1.5 (4 November 2026): the 2024 sheet keeps
  // its data in one attribute named "store" whose current value is an object.
  // store.hitpoints is {currentHP, deathSaves: {successes, failures, open}}.
  // Ticking a death-save box or rolling a save fires change:attribute for it,
  // and writing a changed copy back clears the boxes on the sheet.

  /**
   * Returns a character's attribute by name, ignoring case.
   *
   * @param {string} characterId Character ID.
   * @param {string} name Attribute name.
   * @returns {object|null} Roll20 attribute.
   */
  function findAttribute(characterId, name) {
    const exact = findObjs({ _type: 'attribute', _characterid: characterId, name });
    if (exact.length) {
      return exact[0];
    }
    const lower = name.toLowerCase();
    return (
      findObjs({ _type: 'attribute', _characterid: characterId }).find(
        (a) => toText(a.get('name')).toLowerCase() === lower
      ) || null
    );
  }

  /**
   * Returns the 2024 sheet's store, or null for other sheets.
   *
   * @param {string} characterId Character ID.
   * @returns {object|null} The store object.
   */
  function readStore(characterId) {
    const attr = findObjs({
      _type: 'attribute',
      _characterid: characterId,
      name: BEACON_STORE_ATTR,
    })[0];
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
   * Returns true when a checkbox-style value is ticked. Only clear yes values
   * count, so text Roll20 failed to fill in never counts as a tick.
   *
   * @param {*} raw Attribute value.
   * @returns {boolean} True when ticked.
   */
  function isTicked(raw) {
    if (raw === true) {
      return true;
    }
    const text = toText(raw).toLowerCase();
    if (['on', 'true', 'yes', 'checked'].includes(text)) {
      return true;
    }
    const n = toNumber(text);
    return n !== null && n > 0;
  }

  /**
   * Reads a character's death saves.
   *
   * @param {string} characterId Character ID.
   * @param {{successFields: string, failureFields: string}} settings Field lists for sheets with checkboxes.
   * @returns {{s: number, f: number, source: string}|null} Counts (not capped), or null when the sheet has none.
   */
  function readDeathSaves(characterId, settings) {
    const store = readStore(characterId);
    // The 2024 sheet only adds hitpoints.deathSaves once a save is first ticked
    // or rolled; until then the character has made none.
    const saves = store && isRecord(store.hitpoints) ? store.hitpoints.deathSaves || {} : null;
    if (isRecord(saves)) {
      return {
        s: Math.max(0, Math.round(toNumber(saves.successes) ?? 0)),
        f: Math.max(0, Math.round(toNumber(saves.failures) ?? 0)),
        source: 'store',
      };
    }
    const count = (fields) => {
      let found = false;
      let n = 0;
      for (const name of splitList(fields)) {
        const attr = findAttribute(characterId, name);
        if (attr) {
          found = true;
          if (isTicked(attr.get('current'))) {
            n += 1;
          }
        }
      }
      return found ? n : null;
    };
    const s = count(settings.successFields);
    const f = count(settings.failureFields);
    if (s === null && f === null) {
      return null;
    }
    return { s: s ?? 0, f: f ?? 0, source: 'attributes' };
  }

  /**
   * Clears a character's death saves on the sheet. Works on the 2024 sheet
   * (through its store) and on sheets with checkbox attributes. On the 2024
   * sheet it also shows or hides the death save boxes: the sheet only shows
   * them when hit points reach 0 through its own Damage box, so a PC dropped
   * to 0 from the token bar would otherwise have no boxes to tick.
   *
   * @param {string} characterId Character ID.
   * @param {{successFields: string, failureFields: string}} settings Field lists.
   * @param {boolean} [open] 2024 sheet: show (true) or hide (false) the death save boxes.
   * @returns {boolean} True when the sheet was changed.
   */
  function clearDeathSaves(characterId, settings, open) {
    const attr = findObjs({
      _type: 'attribute',
      _characterid: characterId,
      name: BEACON_STORE_ATTR,
    })[0];
    const store = readStore(characterId);
    if (attr && store && isRecord(store.hitpoints)) {
      const old = isRecord(store.hitpoints.deathSaves) ? store.hitpoints.deathSaves : {};
      const wantOpen = typeof open === 'boolean' ? open : old.open === true;
      if (!toNumber(old.successes) && !toNumber(old.failures) && (old.open === true) === wantOpen) {
        return false;
      }
      // A copy, so Roll20 sees a new value and saves it.
      const copy = JSON.parse(JSON.stringify(store));
      copy.hitpoints.deathSaves = { ...old, successes: 0, failures: 0, open: wantOpen };
      attr.set('current', copy);
      return true;
    }
    let cleared = false;
    for (const name of [
      ...splitList(settings.successFields),
      ...splitList(settings.failureFields),
    ]) {
      const a = findAttribute(characterId, name);
      if (a && isTicked(a.get('current'))) {
        a.set('current', '0');
        cleared = true;
      }
    }
    return cleared;
  }

  /**
   * Caps death-save counts at what the rules allow.
   *
   * @param {{s: number, f: number}} counts Counts.
   * @returns {{s: number, f: number}} Capped counts.
   */
  function capSaves(counts) {
    return {
      s: Math.min(DEATH_SAVES_NEEDED, Math.max(0, counts.s)),
      f: Math.min(DEATH_SAVES_NEEDED, Math.max(0, counts.f)),
    };
  }

  /**
   * Says whether a character's sheet describes a PC or an NPC.
   *
   * @param {string} characterId Character ID.
   * @returns {'pc'|'npc'|null} The sheet's answer, or null when it cannot tell.
   */
  function sheetRole(characterId) {
    const store = readStore(characterId);
    if (store) {
      const layout = isRecord(store.settings) ? toText(store.settings.layoutState) : '';
      const appState = findAttribute(characterId, 'appState');
      if (layout === BEACON_NPC_LAYOUT || toText(appState?.get('current')) === 'npc') {
        return 'npc';
      }
      return layout ? 'pc' : null;
    }
    const npc = findAttribute(characterId, 'npc');
    if (npc) {
      return isTicked(npc.get('current')) ? 'npc' : 'pc';
    }
    return null;
  }

  /**
   * Returns the players named in a controlledby list who are not GMs. "all"
   * counts as a player.
   *
   * @param {*} raw controlledby value.
   * @returns {string[]} Player IDs (or "all").
   */
  function playerControllers(raw) {
    return splitList(raw).filter((id) => id === 'all' || !playerIsGM(id));
  }

  /**
   * Returns the players who control a token, through the token or its character.
   *
   * @param {object} token Roll20 graphic.
   * @returns {string[]} Player IDs (or "all").
   */
  function tokenControllers(token) {
    const character = getCharacter(token);
    return [
      ...new Set([
        ...playerControllers(token.get('controlledby')),
        ...(character ? playerControllers(character.get('controlledby')) : []),
      ]),
    ];
  }

  /**
   * Returns the character a token represents.
   *
   * @param {object} token Roll20 graphic.
   * @returns {object|null} Roll20 character.
   */
  function getCharacter(token) {
    const id = toText(token.get('represents'));
    return id ? getObj('character', id) || null : null;
  }

  /**
   * Returns the Mod sandbox version ("1.0" or "1.5"), or an empty string when
   * Roll20 does not say.
   *
   * @returns {string} Sandbox version.
   */
  function getSandboxVersion() {
    try {
      return toText(Campaign()?.sandboxVersion);
    } catch {
      return '';
    }
  }

  var localeAf = {
    titles: {
      ready: 'DeathTracker is gereed.',
      menu: 'DeathTracker',
      status: 'DeathTracker-status',
      settings: 'DeathTracker-instellings',
      help: 'DeathTracker-opdragte',
      announce: 'DeathTracker',
      markers: 'Tokenmerkers',
    },
    messages: {
      readyHint: 'Tik !deathtracker om die kieslys oop te maak.',
      migrated:
        'Jou DeathTracker 0.1-instellings is oorgedra. !dead werk steeds; !deathtracker is die nuwe opdrag.',
      healthColors:
        'HealthColors is geïnstalleer: DeathTracker hanteer doodsreddingsgooie en die sterwend-, stabiel- en dood-merkers, en HealthColors die gesondheidskleure en seer-/genesingseffekte. Verander in Instellings wie wat hanteer.',
      healthColorsSaves:
        'HealthColors hou ook doodsreddingsgooie dop en sit sterwend-merkers. Skakel een van die twee af (!aura deathsaves off) sodat hulle nie oor merkers baklei nie.',
      settingChanged: '{setting} is nou {value}.',
      settingRejected: '"{value}" is nie ’n geldige waarde vir {setting} nie.',
      unknownSetting: 'Daar is geen instelling met die naam "{setting}" nie.',
      markerUnknown:
        'Hierdie speletjie het geen merker "{marker}" nie, so dit sal nie wys nie. Gebruik !deathtracker markers om die name te sien wat jy kan gebruik.',
      checked: '{count} token(s) nagegaan.',
      cleared: 'DeathTracker-merkers van {count} token(s) verwyder.',
      restored: '{count} token(s) teruggesit.',
      nothingToRestore: 'Geen van daardie tokens is deur DeathTracker geskuif nie.',
      roleSet: '{names}: {role}.',
      stabilised: 'Stabiel: {count}.',
      notDown: 'Geen van daardie tokens is ’n PC met 0 lewenspunte nie.',
      synced: '{name}: {s} sukses(se), {f} mislukking(s).',
      macroCreated:
        'Die tokenaksie "{macro}" is gemaak. ’n Speler kies sy token en klik daarop nadat hy ’n doodsreddingsgooi gegooi het.',
      journalRebuilt: 'Die uitdeelstukke "{help}" en "{deck}" is herbou.',
      resetDone: 'Die instellings is terug op hul verstekwaardes.',
      restartNotNeeded: 'Geen herbegin nodig nie: die nuwe balk word van nou af gebruik.',
    },
    status: {
      healthy: 'Gesond',
      bloodied: 'Bebloed',
      dying: 'Sterwend',
      stable: 'Stabiel',
      dead: 'Dood',
      none: 'Nie dopgehou nie',
      pc: 'PC',
      npc: 'NPC',
      hp: 'LP {hp}/{max}',
      hpNoMax: 'LP {hp}',
      saves: 'Doodsreddingsgooie: {s} sukses(se), {f} mislukking(s)',
      unnamed: '’n Token',
      noneHere: 'Nog geen tokens met lewenspunte op hierdie bladsy nie.',
      page: 'Bladsy: {page}',
      selected: 'Gekose tokens',
      actions: 'Geskuif toe dit gesterf het',
    },
    announce: {
      dying: '{name} is neer en sterwend.',
      stable: '{name} is stabiel.',
      dead: '{name} het gesterf.',
      up: '{name} is weer op die been.',
      savesHint:
        'Doodsreddingsgooie wat op die blad gemerk word, word getel soos hulle gemaak word.',
    },
    menu: {
      summary: 'Op hierdie bladsy',
      down: 'PC’s wat neer is',
      noneDown: 'Geen PC’s is neer nie.',
      tools: 'Gereedskap',
      sandbox: 'Mod-sandbox: {version}',
      sandboxUnknown: 'onbekend',
      hcNote: 'HealthColors is geïnstalleer.',
    },
    buttons: {
      menu: 'Kieslys',
      status: 'Status',
      checkPage: 'Gaan bladsy na',
      check: 'Gaan gekose na',
      settings: 'Instellings',
      help: 'Hulp',
      stable: 'Stabiliseer',
      restore: 'Herstel',
      clear: 'Vee merkers uit',
      pc: 'Maak PC',
      npc: 'Maak NPC',
      auto: 'Besluit outomaties',
      markers: 'Merkers',
      macro: 'Maak doodsreddingsgooi-makro',
      rebuild: 'Herbou uitdeelstukke',
      reset: 'Stel instellings terug',
      on: 'Aan',
      off: 'Af',
      back: 'Terug',
    },
    prompts: {
      marker: 'Merker',
      percent: 'Bebloed op of onder (% van maksimum)',
      fields: 'Veldname geskei deur kommas',
      fx: 'Effek (tipe-kleur)',
      language: 'Taal',
    },
    sections: {
      owners: 'Wie hanteer wat',
      hp: 'Lewenspunte',
      markers: 'Merkers',
      deathSaves: 'Doodsreddingsgooie (PC’s)',
      onDeath: 'Wanneer ’n token sterf',
      looks: 'Tint en effekte',
      general: 'Algemeen',
    },
    settings: {
      deathSavesBy: 'Doodsreddingsgooie en 0-LP-merkers',
      coloursBy: 'Gesondheidskleure',
      effectsBy: 'Seer- en genesingseffekte',
      language: 'Taal',
      hpBar: 'Lewenspuntebalk',
      bloodiedPercent: 'Bebloed op',
      bloodiedMarker: 'Bebloed-merker',
      dyingMarker: 'Sterwend-merker',
      stableMarker: 'Stabiel-merker',
      deadMarker: 'Dood-merker',
      pcDetection: 'Wie is ’n PC',
      deathSaves: 'Hou doodsreddingsgooie dop',
      resetSheetSaves: 'Vee blokkies op blad uit',
      successFields: 'Suksesvelde',
      failureFields: 'Mislukkingvelde',
      massiveDamage: 'Massiewe skade',
      announce: 'Kondig aan',
      deathLayer: 'Skuif die dooies na',
      deathTurnOrder: 'Beurtvolgorde',
      deathActionsFor: 'Geld vir',
      tintPlayers: 'Tint PC’s',
      tintNpcs: 'Tint NPC’s',
      hurtFx: 'Seer-effek',
      hurtFxType: 'Tipe seer-effek',
      healFx: 'Genesingseffek',
      healFxType: 'Tipe genesingseffek',
    },
    choices: {
      hpBar: { 1: 'Balk 1', 2: 'Balk 2', 3: 'Balk 3' },
      pcDetection: { auto: 'Spelers of blad', players: 'Deur ’n speler beheer' },
      deathLayer: { none: 'Bly waar dit is', gmlayer: 'GM-laag', map: 'Kaartlaag' },
      deathTurnOrder: { keep: 'Hou', remove: 'Verwyder' },
      deathActionsFor: { npc: 'NPC’s', all: 'NPC’s en PC’s' },
      announce: { off: 'Af', gm: 'GM', controllers: 'GM en spelers' },
      none: 'Geen',
      notInstalled: 'nie geïnstalleer nie',
    },
    help: {
      menu: 'Maak die kieslys oop.',
      status:
        'Wys die status van die gekose tokens, of van elke token wat op jou bladsy dopgehou word.',
      check: 'Beoordeel die gekose tokens weer (all: elke token op jou bladsy).',
      stable: 'Merk die gekose PC’s met 0 lewenspunte as stabiel.',
      clear: 'Haal DeathTracker se merkers en tint van die gekose tokens af en vergeet hulle.',
      restore:
        'Sit dooie tokens wat DeathTracker geskuif het terug op hul laag en in die beurtvolgorde.',
      role: 'Behandel die karakters van die gekose tokens as PC’s of NPC’s, of laat DeathTracker besluit.',
      markers: 'Lys die merkers wat hierdie speletjie het, met die name om te gebruik.',
      macro:
        'Maak ’n tokenaksie waarop spelers klik om hul doodsreddingsgooie te stuur (vir blaaie wat DeathTracker nie kan lees nie).',
      dsync: 'Gestuur deur die doodsreddingsgooi-makro.',
      settings: 'Maak die instellings oop.',
      set: 'Verander ’n instelling.',
      reset: 'Stel elke instelling terug na sy verstekwaarde.',
      config:
        'Opdragte van weergawe 0.1: maak die instellings oop, of verander een (config bar|2).',
      journal: 'Herbou die Hulp- en Command Deck-uitdeelstukke.',
      help: 'Wys hierdie lys.',
      ids: 'Voeg --ids id1,id2 by om op tokens volgens ID te werk in plaas van die keuse.',
    },
    deck: {
      menuTitle: 'Kieslys',
      menuDesc: 'Die kieslys, status, instellings en hulp.',
      selectedTitle: 'Gekose tokens',
      selectedDesc: 'Kies tokens op die kaart en druk dan ’n knoppie.',
      roleTitle: 'PC of NPC',
      roleDesc: 'Vir die karakters van die gekose tokens.',
      toolsTitle: 'Gereedskap',
      toolsDesc: 'Merkers, die doodsreddingsgooi-makro en hierdie uitdeelstukke.',
      footer: 'Die volledige gids is in die uitdeelstuk "{help}".',
    },
    handout: {
      versionLabel: 'Weergawe',
      subtitle: 'Bebloed, sterwend, stabiel en dood, uit lewenspunte en doodsreddingsgooie',
      footer: 'Knoppies vir elke opdrag is in "{deck}".',
      overview: {
        heading: 'Oorsig',
        body: 'DeathTracker hou die lewenspuntebalk van elke token dop. Dit merk tokens wat bebloed of dood is, hou doodsreddingsgooie dop vir spelerkarakters met 0 lewenspunte, en kan die dooies van die kaart af en uit die beurtvolgorde skuif.',
      },
      quickStart: {
        heading: 'Vinnige begin',
        steps: [
          'Sit lewenspunte in Balk 1 (of kies ’n ander balk in Instellings).',
          'Beskadig ’n token: op die helfte van sy maksimum kry dit die Bebloed-merker; op 0 kry ’n NPC die Dood-merker.',
          '’n PC op 0 kry die Sterwend-merker. Merk doodsreddingsgooie op die blad: drie suksesse maak dit Stabiel, drie mislukkings Dood.',
          'Genees dit bo 0 en die merkers verdwyn.',
          'Tik !deathtracker vir die kieslys.',
        ],
      },
      statuses: {
        heading: 'Statusse',
        points: [
          'Gesond: bo die Bebloed-deel van die maksimum lewenspunte (geen merker).',
          'Bebloed: op of onder daardie deel (50% tensy verander).',
          'Sterwend: ’n PC met 0 lewenspunte wat doodsreddingsgooie maak.',
          'Stabiel: ’n PC op 0 met drie suksesse, of gestabiliseer met die stable-opdrag.',
          'Dood: ’n NPC op 0, ’n PC met drie mislukkings, of ’n PC wat deur massiewe skade gedood is.',
          '’n Leë balk, of een wat nie ’n getal bevat nie, word nooit as 0 gelees nie.',
        ],
      },
      deathSaves: {
        heading: 'Doodsreddingsgooie',
        points: [
          'D&D 2024-blad: gelees van die blad soos blokkies gemerk of gooie gegooi word.',
          'D&D 2014-blad en ander met merkblokkies: gelees uit die sukses- en mislukkingvelde in Instellings.',
          'Die blad hou ou merke ná genesing, so gooie word getel van die oomblik dat die PC tot 0 daal. Met Vee blokkies op blad uit aan, vee DeathTracker die blad se blokkies uit wanneer die PC tot 0 daal en wanneer dit genees word, en wys dit die D&D 2024-blad se doodsreddingsgooi-blokkies wanneer ’n PC via die tokenbalk tot 0 daal.',
          'As die blad nie gelees kan word nie, maak die doodsreddingsgooi-makro (!deathtracker macro): spelers kies hul token en klik daarop ná elke gooi.',
          'Wie is ’n PC: ’n token of karakter wat deur ’n speler beheer word, of (Spelers of blad) een wie se blad sê dit is nie ’n NPC nie. Gebruik Maak PC / Maak NPC om vir ’n karakter te besluit.',
        ],
      },
      onDeath: {
        heading: 'Wanneer ’n token sterf',
        points: [
          'Skuif die dooies na die GM-laag of die Kaartlaag, en haal hulle uit die beurtvolgorde. Albei is aanvanklik af.',
          'Geld net vir NPC’s, tensy dit op NPC’s en PC’s gestel is.',
          'Om ’n dooie token te genees haal sy merkers af, maar skuif dit nie terug nie. Kies dit en gebruik Herstel (dit gaan terug in die beurtvolgorde met sy inisiatief).',
          'Massiewe skade (aanvanklik af): ’n PC wie se balk met minstens sy maksimum onder 0 gaan, sterf dadelik. Die 2024-blad stop by 0, so dit werk net wanneer die waarde onder 0 in die balk getik word.',
        ],
      },
      healthColors: {
        heading: 'HealthColors en ander Mods',
        points: [
          'Wie hanteer wat, in Instellings, bepaal watter Mod doodsreddingsgooie (met die sterwend-, stabiel- en dood-merkers), gesondheidskleure en seer-/genesingseffekte hanteer: DeathTracker, HealthColors of Af. HealthColors 2.5 en later wys dieselfde keuse, en ’n verandering in enige van die twee Mods geld vir albei.',
          'Aanvanklik hanteer DeathTracker doodsreddingsgooie en HealthColors die kleure en effekte. Sonder HealthColors hanteer DeathTracker al drie.',
          'HealthColors voor 2.5 deel nie die keuse nie: skakel sy doodsreddingsgooie af met !aura deathsaves off.',
          'Veranderings wat TokenMod maak, word raakgesien. Ander Mods kan DeathTracker.check(token) roep nadat hulle lewenspunte verander het.',
          'DeathTracker haal net merkers af wat dit self opgesit het.',
        ],
      },
      commands: {
        heading: 'Opdragte',
        intro:
          'Elke opdrag begin met !deathtracker (of !dt, of !dead van weergawe 0.1). Net vir die GM, behalwe die doodsreddingsgooi-makro.',
        colCommand: 'Opdrag',
        colDesc: 'Wat dit doen',
      },
      settings: {
        heading: 'Instellings',
        intro:
          'Verander hulle in die kieslys, met !deathtracker set <setting> <value>, of in die Mod-biblioteek se opsies.',
        colKey: 'Instelling',
        colDesc: 'Wat dit doen',
        rows: {
          deathSavesBy:
            'Wie doodsreddingsgooie dophou en die sterwend-, stabiel- en dood-merkers sit: DeathTracker, HealthColors of off. Gedeel met HealthColors.',
          coloursBy:
            'Wie tokens volgens lewenspunte kleur: DeathTracker (sy tint), HealthColors of off. Gedeel met HealthColors.',
          effectsBy:
            'Wie die seer- en genesingseffekte speel: DeathTracker, HealthColors of off. Gedeel met HealthColors.',
          language: 'Taal van kieslyste, boodskappe en uitdeelstukke.',
          hpBar: 'Die balk wat die lewenspunte hou (1, 2 of 3).',
          bloodiedPercent:
            'Bebloed op of onder hierdie persentasie van die maksimum lewenspunte (0 skakel Bebloed af).',
          bloodiedMarker: 'Merker vir Bebloed (none vir geen merker).',
          dyingMarker: 'Merker vir ’n sterwende PC.',
          stableMarker: 'Merker vir ’n stabiele PC.',
          deadMarker: 'Merker vir die dooies.',
          pcDetection:
            'auto: deur ’n speler beheer of die blad sê PC; players: net deur ’n speler beheer.',
          deathSaves: 'Hou doodsreddingsgooie dop vir PC’s met 0 lewenspunte.',
          resetSheetSaves:
            'Vee die blad se doodsreddingsgooi-blokkies uit wanneer ’n PC tot 0 daal en wanneer dit genees word, en wys hulle op die D&D 2024-blad.',
          successFields: 'Bladvelde wat vir suksesse gemerk word (2014- en ander blaaie).',
          failureFields: 'Bladvelde wat vir mislukkings gemerk word.',
          massiveDamage: '’n PC wie se balk met minstens sy maksimum onder 0 gaan, sterf dadelik.',
          announce:
            'Wie hoor wanneer ’n PC neergaan, stabiel word, sterf of opstaan: off, gm of controllers.',
          deathLayer: 'Skuif die dooies na: none, gmlayer of map.',
          deathTurnOrder: 'keep (hou) of remove (verwyder) die dooies uit die beurtvolgorde.',
          deathActionsFor: 'npc: skuif en beurtvolgorde geld vir NPC’s; all: ook vir PC’s.',
          tintPlayers: 'Tint PC’s van groen na rooi soos hulle lewenspunte verloor.',
          tintNpcs: 'Tint NPC’s op dieselfde manier.',
          hurtFx: 'Speel ’n effek wanneer ’n token lewenspunte verloor.',
          hurtFxType: 'Daardie effek, as tipe-kleur (splatter-blood).',
          healFx: 'Speel ’n effek wanneer ’n token lewenspunte kry.',
          healFxType: 'Daardie effek (glow-holy).',
        },
      },
      api: {
        heading: 'Vir Mod-skrywers',
        intro: 'DeathTracker publiseer ’n DeathTracker-objek.',
        colFunction: 'Funksie',
        colDesc: 'Wat dit doen',
        rows: {
          check: 'Beoordeel ’n token nou (nadat sy lewenspunte vanuit ’n Mod verander is).',
          getStatus: '’n Token se status: healthy, bloodied, dying, stable, dead of null.',
          onStatusChange:
            'Word laat weet wanneer ’n status verander ({token, status, previous, isPc}).',
          observe:
            'Weergawe 0.1: word laat weet (token, prev) nadat DeathTracker ’n lewenspunteverandering hanteer het.',
          managing:
            'True wanneer DeathTracker doodsreddingsgooie dophou: hulle is aan, en DeathTracker is gekies om hulle te hanteer (HealthColors gebruik dit).',
          ownersChanged:
            'Bring tokens op datum nadat verander het wie wat hanteer (HealthColors roep dit).',
        },
      },
      upgrading: {
        heading: 'Opgradering van 0.1',
        points: [
          'Jou instellings vir merkers, balk, tint en effekte word oorgedra.',
          '!dead werk steeds, net soos !dead config en !dead reset.',
          'Die Bewusteloos-merker vir PC’s is nou die Sterwend-merker.',
          'Om die balk te verander, is nie meer ’n herbegin nodig nie.',
        ],
      },
      troubleshooting: {
        heading: 'Probleemoplossing',
        points: [
          'Niks gebeur nie: gaan die lewenspuntebalk in Instellings na, en of die balk ’n getal bevat.',
          '’n PC word as ’n NPC behandel: kies dit en druk Maak PC, of laat ’n speler die karakter beheer.',
          '’n Merker wys nie: gebruik !deathtracker markers en kies ’n naam uit die lys.',
          'Lewenspunte wat deur ’n ander Mod verander is, word nie raakgesien nie: daardie Mod moet DeathTracker.check(token) roep.',
        ],
      },
      languages: {
        heading: 'Tale',
        body: 'Stel die taal met !deathtracker set language <code>.',
        colLanguage: 'Taal',
        colNative: 'Eie naam',
        colCode: 'Kode',
      },
      credits: {
        heading: 'Erkennings',
        original: 'Geskryf deur',
        maintainer: 'Herskryf vir weergawe 1.0 deur',
        support: '’n Probleem gevind of ’n idee? Kontak MidNiteShadow7 op Roll20.',
      },
    },
    errors: {
      gmOnly: 'Net die GM kan daardie DeathTracker-opdrag gebruik.',
      unknownCommand: 'DeathTracker het geen opdrag "{command}" nie.',
      noTokens: 'Kies eers een of meer tokens (of voeg --ids by).',
      notYourToken: 'Jy beheer nie daardie token nie.',
      hint: 'Tik !deathtracker help vir die lys opdragte.',
    },
  };

  var localeCa = {
    titles: {
      ready: 'DeathTracker està a punt.',
      menu: 'DeathTracker',
      status: 'Estat de DeathTracker',
      settings: 'Configuració de DeathTracker',
      help: 'Ordres de DeathTracker',
      announce: 'DeathTracker',
      markers: 'Marcadors de token',
    },
    messages: {
      readyHint: 'Escriu !deathtracker per obrir el menú.',
      migrated:
        'S’ha conservat la teva configuració de DeathTracker 0.1. !dead encara funciona; !deathtracker és l’ordre nova.',
      healthColors:
        'HealthColors està instal·lat: DeathTracker s’encarrega de les salvacions contra la mort i dels marcadors de moribund, estable i mort, i HealthColors dels colors de salut i dels efectes de ferida i curació. Canvia qui s’encarrega de què a Configuració.',
      healthColorsSaves:
        'HealthColors també porta les tirades de salvació contra la mort i posa marcadors de moribund. Desactiva’n un (!aura deathsaves off) perquè no es barallin pels marcadors.',
      settingChanged: '{setting} ara és {value}.',
      settingRejected: '«{value}» no és un valor vàlid per a {setting}.',
      unknownSetting: 'No hi ha cap opció anomenada «{setting}».',
      markerUnknown:
        'Aquesta partida no té el marcador «{marker}», així que no es mostrarà. Fes servir !deathtracker markers per veure els noms que pots fer servir.',
      checked: 'S’han comprovat {count} token(s).',
      cleared: 'S’han tret els marcadors de DeathTracker de {count} token(s).',
      restored: 'S’han tornat a lloc {count} token(s).',
      nothingToRestore: 'DeathTracker no ha mogut cap d’aquests tokens.',
      roleSet: '{names}: {role}.',
      stabilised: 'Estables: {count}.',
      notDown: 'Cap d’aquests tokens és un PJ a 0 punts de cop.',
      synced: '{name}: {s} èxit(s), {f} fracàs/fracassos.',
      macroCreated:
        'S’ha creat l’acció de token «{macro}». Un jugador selecciona el seu token i hi fa clic després de tirar una salvació contra la mort.',
      journalRebuilt: 'S’han refet els handouts «{help}» i «{deck}».',
      resetDone: 'La configuració ha tornat als valors per defecte.',
      restartNotNeeded: 'No cal reiniciar: la barra nova es fa servir a partir d’ara.',
    },
    status: {
      healthy: 'Sa',
      bloodied: 'Ensangonat',
      dying: 'Moribund',
      stable: 'Estable',
      dead: 'Mort',
      none: 'Sense seguiment',
      pc: 'PJ',
      npc: 'PNJ',
      hp: 'PC {hp}/{max}',
      hpNoMax: 'PC {hp}',
      saves: 'Salvacions contra la mort: {s} èxit(s), {f} fracàs/fracassos',
      unnamed: 'Un token',
      noneHere: 'Encara no hi ha tokens amb punts de cop en aquesta pàgina.',
      page: 'Pàgina: {page}',
      selected: 'Tokens seleccionats',
      actions: 'Mogut en morir',
    },
    announce: {
      dying: '{name} ha caigut i s’està morint.',
      stable: '{name} està estable.',
      dead: '{name} ha mort.',
      up: '{name} torna a estar dret.',
      savesHint: 'Les salvacions contra la mort marcades al full es compten a mesura que es fan.',
    },
    menu: {
      summary: 'En aquesta pàgina',
      down: 'PJ caiguts',
      noneDown: 'No hi ha cap PJ caigut.',
      tools: 'Eines',
      sandbox: 'Sandbox de Mods: {version}',
      sandboxUnknown: 'desconeguda',
      hcNote: 'HealthColors està instal·lat.',
    },
    buttons: {
      menu: 'Menú',
      status: 'Estat',
      checkPage: 'Comprova la pàgina',
      check: 'Comprova la selecció',
      settings: 'Configuració',
      help: 'Ajuda',
      stable: 'Estabilitza',
      restore: 'Restaura',
      clear: 'Treu els marcadors',
      pc: 'Fes-lo PJ',
      npc: 'Fes-lo PNJ',
      auto: 'Decideix automàticament',
      markers: 'Marcadors',
      macro: 'Crea la macro de salvació contra la mort',
      rebuild: 'Refés els handouts',
      reset: 'Restableix la configuració',
      on: 'Activat',
      off: 'Desactivat',
      back: 'Enrere',
    },
    prompts: {
      marker: 'Marcador',
      percent: 'Ensangonat a o per sota de (% del màxim)',
      fields: 'Noms de camp separats per comes',
      fx: 'Efecte (tipus-color)',
      language: 'Idioma',
    },
    sections: {
      owners: 'Qui s’encarrega de què',
      hp: 'Punts de cop',
      markers: 'Marcadors',
      deathSaves: 'Salvacions contra la mort (PJ)',
      onDeath: 'Quan un token mor',
      looks: 'Tint i efectes',
      general: 'General',
    },
    settings: {
      deathSavesBy: 'Salvacions i marcadors a 0 PC',
      coloursBy: 'Colors de salut',
      effectsBy: 'Efectes de ferida i curació',
      language: 'Idioma',
      hpBar: 'Barra de punts de cop',
      bloodiedPercent: 'Ensangonat a',
      bloodiedMarker: 'Marcador d’ensangonat',
      dyingMarker: 'Marcador de moribund',
      stableMarker: 'Marcador d’estable',
      deadMarker: 'Marcador de mort',
      pcDetection: 'Qui és un PJ',
      deathSaves: 'Porta les salvacions contra la mort',
      resetSheetSaves: 'Buida les caselles del full',
      successFields: 'Camps d’èxit',
      failureFields: 'Camps de fracàs',
      massiveDamage: 'Dany massiu',
      announce: 'Anuncia',
      deathLayer: 'Mou els morts a',
      deathTurnOrder: 'Ordre de torns',
      deathActionsFor: 'S’aplica a',
      tintPlayers: 'Tenyeix els PJ',
      tintNpcs: 'Tenyeix els PNJ',
      hurtFx: 'Efecte de ferida',
      hurtFxType: 'Tipus d’efecte de ferida',
      healFx: 'Efecte de curació',
      healFxType: 'Tipus d’efecte de curació',
    },
    choices: {
      hpBar: { 1: 'Barra 1', 2: 'Barra 2', 3: 'Barra 3' },
      pcDetection: { auto: 'Jugadors o full', players: 'Controlat per un jugador' },
      deathLayer: { none: 'Es queda on és', gmlayer: 'Capa del DJ', map: 'Capa del mapa' },
      deathTurnOrder: { keep: 'Mantén', remove: 'Treu' },
      deathActionsFor: { npc: 'PNJ', all: 'PNJ i PJ' },
      announce: { off: 'Desactivat', gm: 'DJ', controllers: 'DJ i jugadors' },
      none: 'Cap',
      notInstalled: 'no instal·lat',
    },
    help: {
      menu: 'Obre el menú.',
      status:
        'Mostra l’estat dels tokens seleccionats, o de cada token amb seguiment de la teva pàgina.',
      check: 'Torna a avaluar els tokens seleccionats (all: tots els tokens de la teva pàgina).',
      stable: 'Marca com a estables els PJ seleccionats a 0 punts de cop.',
      clear: 'Treu els marcadors i el tint de DeathTracker dels tokens seleccionats i oblida’ls.',
      restore:
        'Torna els tokens morts que DeathTracker ha mogut a la seva capa i a l’ordre de torns.',
      role: 'Tracta els personatges dels tokens seleccionats com a PJ o PNJ, o deixa que DeathTracker decideixi.',
      markers: 'Llista els marcadors d’aquesta partida, amb els noms que cal fer servir.',
      macro:
        'Crea una acció de token on els jugadors fan clic per enviar les seves salvacions contra la mort (per als fulls que DeathTracker no pot llegir).',
      dsync: 'L’envia la macro de salvació contra la mort.',
      settings: 'Obre la configuració.',
      set: 'Canvia una opció.',
      reset: 'Torna cada opció al seu valor per defecte.',
      config: 'Ordres de la versió 0.1: obre la configuració, o canvia’n una (config bar|2).',
      journal: 'Refés els handouts d’Ajuda i Command Deck.',
      help: 'Mostra aquesta llista.',
      ids: 'Afegeix --ids id1,id2 per treballar amb tokens per ID en lloc de la selecció.',
    },
    deck: {
      menuTitle: 'Menú',
      menuDesc: 'El menú, l’estat, la configuració i l’ajuda.',
      selectedTitle: 'Tokens seleccionats',
      selectedDesc: 'Selecciona tokens al mapa i després prem un botó.',
      roleTitle: 'PJ o PNJ',
      roleDesc: 'Per als personatges dels tokens seleccionats.',
      toolsTitle: 'Eines',
      toolsDesc: 'Els marcadors, la macro de salvació contra la mort i aquests handouts.',
      footer: 'La guia completa és al handout «{help}».',
    },
    handout: {
      versionLabel: 'Versió',
      subtitle:
        'Ensangonat, moribund, estable i mort, a partir dels punts de cop i les salvacions contra la mort',
      footer: 'Hi ha botons per a cada ordre a «{deck}».',
      overview: {
        heading: 'Visió general',
        body: 'DeathTracker vigila la barra de punts de cop de cada token. Marca els tokens que estan ensangonats o morts, porta les tirades de salvació contra la mort dels personatges jugadors a 0 punts de cop, i pot treure els morts del mapa i de l’ordre de torns.',
      },
      quickStart: {
        heading: 'Inici ràpid',
        steps: [
          'Posa els punts de cop a la Barra 1 (o tria una altra barra a Configuració).',
          'Fes mal a un token: a la meitat del seu màxim rep el marcador d’ensangonat; a 0, un PNJ rep el marcador de mort.',
          'Un PJ a 0 rep el marcador de moribund. Marca les salvacions contra la mort al full: tres èxits el deixen Estable, tres fracassos Mort.',
          'Cura’l per sobre de 0 i els marcadors desapareixen.',
          'Escriu !deathtracker per al menú.',
        ],
      },
      statuses: {
        heading: 'Estats',
        points: [
          'Sa: per sobre de la proporció d’ensangonat dels punts de cop màxims (sense marcador).',
          'Ensangonat: en aquesta proporció o per sota (50% si no es canvia).',
          'Moribund: un PJ a 0 punts de cop que fa salvacions contra la mort.',
          'Estable: un PJ a 0 amb tres èxits, o estabilitzat amb l’ordre stable.',
          'Mort: un PNJ a 0, un PJ amb tres fracassos, o un PJ mort per dany massiu.',
          'Una barra buida, o que no conté un nombre, mai no es llegeix com a 0.',
        ],
      },
      deathSaves: {
        heading: 'Salvacions contra la mort',
        points: [
          'Full de D&D 2024: es llegeix del full a mesura que es marquen caselles o es tiren salvacions.',
          'Full de D&D 2014 i altres amb caselles: es llegeix dels camps d’èxit i de fracàs de Configuració.',
          'El full conserva les marques antigues després de curar-se, així que les salvacions es compten des del moment en què el PJ cau a 0. Amb Buida les caselles del full activat, DeathTracker buida les caselles del full quan el PJ cau a 0 i quan es cura, i mostra les caselles de salvació contra la mort del full de D&D 2024 quan un PJ cau a 0 des de la barra del token.',
          'Si el full no es pot llegir, crea la macro de salvació contra la mort (!deathtracker macro): els jugadors seleccionen el seu token i hi fan clic després de cada salvació.',
          'Qui és un PJ: un token o personatge controlat per un jugador, o (Jugadors o full) un el full del qual diu que no és un PNJ. Fes servir Fes-lo PJ / Fes-lo PNJ per decidir-ho per a un personatge.',
        ],
      },
      onDeath: {
        heading: 'Quan un token mor',
        points: [
          'Mou els morts a la capa del DJ o a la capa del mapa, i treu-los de l’ordre de torns. Totes dues opcions estan desactivades al principi.',
          'S’aplica només als PNJ, tret que s’esculli PNJ i PJ.',
          'Curar un token mort li treu els marcadors però no el torna a lloc. Selecciona’l i fes servir Restaura (torna a l’ordre de torns amb la seva iniciativa).',
          'Dany massiu (desactivat al principi): un PJ la barra del qual baixa de 0 en almenys el seu màxim mor a l’acte. El full de 2024 s’atura a 0, així que això només funciona quan s’escriu a la barra un valor per sota de 0.',
        ],
      },
      healthColors: {
        heading: 'HealthColors i altres Mods',
        points: [
          'Qui s’encarrega de què, a Configuració, tria quin Mod porta les salvacions contra la mort (amb els marcadors de moribund, estable i mort), els colors de salut i els efectes de ferida i curació: DeathTracker, HealthColors o Desactivat. HealthColors 2.5 i posteriors mostren la mateixa opció, i canviar-la en qualsevol dels dos Mods la canvia per a tots dos.',
          'Al principi DeathTracker s’encarrega de les salvacions contra la mort i HealthColors dels colors i els efectes. Sense HealthColors, DeathTracker s’encarrega de les tres coses.',
          'HealthColors anterior a la 2.5 no comparteix l’opció: desactiva’n les salvacions contra la mort amb !aura deathsaves off.',
          'Es detecten els canvis fets per TokenMod. Altres Mods poden cridar DeathTracker.check(token) després de canviar els punts de cop.',
          'DeathTracker només treu els marcadors que ha posat ell mateix.',
        ],
      },
      commands: {
        heading: 'Ordres',
        intro:
          'Totes les ordres comencen per !deathtracker (o !dt, o !dead de la versió 0.1). Només per al DJ, excepte la macro de salvació contra la mort.',
        colCommand: 'Ordre',
        colDesc: 'Què fa',
      },
      settings: {
        heading: 'Configuració',
        intro:
          'Canvia-les al menú, amb !deathtracker set <setting> <value>, o a les opcions de la biblioteca de Mods.',
        colKey: 'Opció',
        colDesc: 'Què fa',
        rows: {
          deathSavesBy:
            'Qui porta les salvacions contra la mort i posa els marcadors de moribund, estable i mort: DeathTracker, HealthColors o off. Compartit amb HealthColors.',
          coloursBy:
            'Qui acoloreix els tokens segons els punts de cop: DeathTracker (el seu tint), HealthColors o off. Compartit amb HealthColors.',
          effectsBy:
            'Qui reprodueix els efectes de ferida i curació: DeathTracker, HealthColors o off. Compartit amb HealthColors.',
          language: 'Idioma dels menús, missatges i handouts.',
          hpBar: 'La barra que conté els punts de cop (1, 2 o 3).',
          bloodiedPercent:
            'Ensangonat a o per sota d’aquest percentatge dels punts de cop màxims (0 desactiva Ensangonat).',
          bloodiedMarker: 'Marcador d’ensangonat (none per a cap marcador).',
          dyingMarker: 'Marcador per a un PJ moribund.',
          stableMarker: 'Marcador per a un PJ estable.',
          deadMarker: 'Marcador per als morts.',
          pcDetection:
            'auto: controlat per un jugador o el full diu PJ; players: només controlat per un jugador.',
          deathSaves: 'Porta les salvacions contra la mort dels PJ a 0 punts de cop.',
          resetSheetSaves:
            'Buida les caselles de salvació contra la mort del full quan un PJ cau a 0 i quan es cura, i mostra-les al full de D&D 2024.',
          successFields: 'Camps del full marcats per als èxits (2014 i altres fulls).',
          failureFields: 'Camps del full marcats per als fracassos.',
          massiveDamage: 'Un PJ la barra del qual baixa de 0 en almenys el seu màxim mor a l’acte.',
          announce:
            'A qui s’avisa quan un PJ cau, s’estabilitza, mor o s’aixeca: off, gm o controllers.',
          deathLayer: 'Mou els morts a: none, gmlayer o map.',
          deathTurnOrder: 'Mantén (keep) o treu (remove) els morts de l’ordre de torns.',
          deathActionsFor: 'npc: moure i l’ordre de torns s’apliquen als PNJ; all: també als PJ.',
          tintPlayers: 'Tenyeix els PJ de verd a vermell a mesura que perden punts de cop.',
          tintNpcs: 'Tenyeix els PNJ de la mateixa manera.',
          hurtFx: 'Reprodueix un efecte quan un token perd punts de cop.',
          hurtFxType: 'Aquest efecte, com a tipus-color (splatter-blood).',
          healFx: 'Reprodueix un efecte quan un token guanya punts de cop.',
          healFxType: 'Aquest efecte (glow-holy).',
        },
      },
      api: {
        heading: 'Per als autors de Mods',
        intro: 'DeathTracker publica un objecte DeathTracker.',
        colFunction: 'Funció',
        colDesc: 'Què fa',
        rows: {
          check: 'Avalua un token ara (després de canviar-ne els punts de cop des d’un Mod).',
          getStatus: 'L’estat d’un token: healthy, bloodied, dying, stable, dead o null.',
          onStatusChange: 'Rep un avís quan canvia un estat ({token, status, previous, isPc}).',
          observe:
            'Versió 0.1: rep (token, prev) després que DeathTracker gestioni un canvi de punts de cop.',
          managing:
            'True quan DeathTracker porta les salvacions contra la mort: estan activades i DeathTracker és qui se n’encarrega (HealthColors ho fa servir).',
          ownersChanged:
            'Posa al dia els tokens després que canviï qui s’encarrega de què (HealthColors ho crida).',
        },
      },
      upgrading: {
        heading: 'Actualitzar des de la 0.1',
        points: [
          'Es conserva la teva configuració de marcadors, barra, tint i efectes.',
          '!dead encara funciona, igual que !dead config i !dead reset.',
          'El marcador d’inconscient dels PJ ara és el marcador de moribund.',
          'Canviar la barra ja no requereix reiniciar.',
        ],
      },
      troubleshooting: {
        heading: 'Resolució de problemes',
        points: [
          'No passa res: comprova la barra de punts de cop a Configuració, i que la barra conté un nombre.',
          'Un PJ es tracta com a PNJ: selecciona’l i prem Fes-lo PJ, o deixa que un jugador controli el personatge.',
          'Un marcador no es mostra: fes servir !deathtracker markers i tria un nom de la llista.',
          'No es detecten els punts de cop canviats per un altre Mod: aquest Mod ha de cridar DeathTracker.check(token).',
        ],
      },
      languages: {
        heading: 'Idiomes',
        body: 'Tria l’idioma amb !deathtracker set language <code>.',
        colLanguage: 'Idioma',
        colNative: 'Nom original',
        colCode: 'Codi',
      },
      credits: {
        heading: 'Crèdits',
        original: 'Escrit per',
        maintainer: 'Reescrit per a la versió 1.0 per',
        support: 'Has trobat un problema o tens una idea? Contacta amb MidNiteShadow7 a Roll20.',
      },
    },
    errors: {
      gmOnly: 'Només el DJ pot fer servir aquesta ordre de DeathTracker.',
      unknownCommand: 'DeathTracker no té l’ordre «{command}».',
      noTokens: 'Selecciona primer un o més tokens (o afegeix --ids).',
      notYourToken: 'No controles aquest token.',
      hint: 'Escriu !deathtracker help per veure la llista d’ordres.',
    },
  };

  var localeZhTW = {
    titles: {
      ready: 'DeathTracker 已就緒。',
      menu: 'DeathTracker',
      status: 'DeathTracker 狀態',
      settings: 'DeathTracker 設定',
      help: 'DeathTracker 指令',
      announce: 'DeathTracker',
      markers: '指示物狀態標記',
    },
    messages: {
      readyHint: '輸入 !deathtracker 開啟選單。',
      migrated: '已沿用你的 DeathTracker 0.1 設定。!dead 仍可使用；新指令是 !deathtracker。',
      healthColors:
        '已安裝 HealthColors：DeathTracker 負責死亡豁免檢定與瀕死、穩定、死亡標記，HealthColors 負責生命值顏色與受傷/治療特效。可在設定中變更由誰負責。',
      healthColorsSaves:
        'HealthColors 也在追蹤死亡豁免檢定並設定瀕死標記。請關閉其中一個 (!aura deathsaves off)，以免兩者搶著改標記。',
      settingChanged: '{setting} 已設為 {value}。',
      settingRejected: '「{value}」不是 {setting} 的有效值。',
      unknownSetting: '沒有名為「{setting}」的設定。',
      markerUnknown:
        '本遊戲沒有「{marker}」標記，因此不會顯示。使用 !deathtracker markers 查看可用的名稱。',
      checked: '已檢查 {count} 個指示物。',
      cleared: '已從 {count} 個指示物移除 DeathTracker 標記。',
      restored: '已放回 {count} 個指示物。',
      nothingToRestore: '這些指示物都不是 DeathTracker 移動的。',
      roleSet: '{names}：{role}。',
      stabilised: '穩定：{count}。',
      notDown: '這些指示物中沒有生命值為 0 的 PC。',
      synced: '{name}：成功 {s} 次，失敗 {f} 次。',
      macroCreated:
        '已建立指示物動作「{macro}」。玩家擲完死亡豁免檢定後，選取自己的指示物並點擊它。',
      journalRebuilt: '已重建「{help}」與「{deck}」講義。',
      resetDone: '設定已恢復預設值。',
      restartNotNeeded: '不需要重新啟動：從現在起使用新的數值條。',
    },
    status: {
      healthy: '健康',
      bloodied: '重傷',
      dying: '瀕死',
      stable: '穩定',
      dead: '死亡',
      none: '未追蹤',
      pc: 'PC',
      npc: 'NPC',
      hp: 'HP {hp}/{max}',
      hpNoMax: 'HP {hp}',
      saves: '死亡豁免檢定：成功 {s} 次，失敗 {f} 次',
      unnamed: '一個指示物',
      noneHere: '此頁面上還沒有帶生命值的指示物。',
      page: '頁面：{page}',
      selected: '已選取的指示物',
      actions: '死亡時已移動',
    },
    announce: {
      dying: '{name} 倒下了，正處於瀕死狀態。',
      stable: '{name} 已穩定。',
      dead: '{name} 死亡了。',
      up: '{name} 重新站起來了。',
      savesHint: '角色卡上勾選的死亡豁免檢定會在進行時隨即計入。',
    },
    menu: {
      summary: '此頁面',
      down: '倒下的 PC',
      noneDown: '沒有 PC 倒下。',
      tools: '工具',
      sandbox: 'Mod 沙盒：{version}',
      sandboxUnknown: '未知',
      hcNote: '已安裝 HealthColors。',
    },
    buttons: {
      menu: '選單',
      status: '狀態',
      checkPage: '檢查頁面',
      check: '檢查選取項',
      settings: '設定',
      help: '說明',
      stable: '穩定傷勢',
      restore: '放回',
      clear: '清除標記',
      pc: '設為 PC',
      npc: '設為 NPC',
      auto: '自動判斷',
      markers: '狀態標記',
      macro: '建立死亡豁免巨集',
      rebuild: '重建講義',
      reset: '重設設定',
      on: '開',
      off: '關',
      back: '返回',
    },
    prompts: {
      marker: '狀態標記',
      percent: '重傷門檻 (最大值的 % 或以下)',
      fields: '欄位名稱 (以逗號分隔)',
      fx: '特效 (類型-顏色)',
      language: '語言',
    },
    sections: {
      owners: '由誰負責',
      hp: '生命值',
      markers: '狀態標記',
      deathSaves: '死亡豁免檢定 (PC)',
      onDeath: '指示物死亡時',
      looks: '染色與特效',
      general: '一般',
    },
    settings: {
      deathSavesBy: '死亡豁免與 0 生命值標記',
      coloursBy: '生命值顏色',
      effectsBy: '受傷與治療特效',
      language: '語言',
      hpBar: '生命值數值條',
      bloodiedPercent: '重傷門檻',
      bloodiedMarker: '重傷標記',
      dyingMarker: '瀕死標記',
      stableMarker: '穩定標記',
      deadMarker: '死亡標記',
      pcDetection: '誰是 PC',
      deathSaves: '追蹤死亡豁免檢定',
      resetSheetSaves: '清除角色卡勾選',
      successFields: '成功欄位',
      failureFields: '失敗欄位',
      massiveDamage: '巨量傷害',
      announce: '公告',
      deathLayer: '死者移至',
      deathTurnOrder: '回合順序',
      deathActionsFor: '適用於',
      tintPlayers: '為 PC 染色',
      tintNpcs: '為 NPC 染色',
      hurtFx: '受傷特效',
      hurtFxType: '受傷特效類型',
      healFx: '治療特效',
      healFxType: '治療特效類型',
    },
    choices: {
      hpBar: { 1: '數值條 1', 2: '數值條 2', 3: '數值條 3' },
      pcDetection: { auto: '玩家或角色卡', players: '由玩家控制' },
      deathLayer: { none: '留在原地', gmlayer: 'GM 圖層', map: '地圖圖層' },
      deathTurnOrder: { keep: '保留', remove: '移除' },
      deathActionsFor: { npc: 'NPC', all: 'NPC 與 PC' },
      announce: { off: '關', gm: 'GM', controllers: 'GM 與玩家' },
      none: '無',
      notInstalled: '未安裝',
    },
    help: {
      menu: '開啟選單。',
      status: '顯示已選取指示物的狀態，或你頁面上所有被追蹤指示物的狀態。',
      check: '重新判斷已選取的指示物 (all：你頁面上的所有指示物)。',
      stable: '將已選取、生命值為 0 的 PC 標為穩定。',
      clear: '移除已選取指示物上 DeathTracker 的標記與染色，並不再追蹤它們。',
      restore: '將 DeathTracker 移動過的死亡指示物放回原本的圖層與回合順序。',
      role: '將已選取指示物的角色視為 PC 或 NPC，或交由 DeathTracker 判斷。',
      markers: '列出本遊戲有的狀態標記，以及要使用的名稱。',
      macro:
        '建立一個指示物動作，讓玩家點擊送出死亡豁免檢定 (用於 DeathTracker 無法讀取的角色卡)。',
      dsync: '由死亡豁免巨集送出。',
      settings: '開啟設定。',
      set: '變更一項設定。',
      reset: '將所有設定恢復預設值。',
      config: '0.1 版指令：開啟設定，或變更一項 (config bar|2)。',
      journal: '重建說明與 Command Deck 講義。',
      help: '顯示此列表。',
      ids: '加上 --ids id1,id2 可依 ID 指定指示物，而不是使用選取項。',
    },
    deck: {
      menuTitle: '選單',
      menuDesc: '選單、狀態、設定與說明。',
      selectedTitle: '已選取的指示物',
      selectedDesc: '先在地圖上選取指示物，再按下按鈕。',
      roleTitle: 'PC 或 NPC',
      roleDesc: '套用於已選取指示物的角色。',
      toolsTitle: '工具',
      toolsDesc: '狀態標記、死亡豁免巨集與這些講義。',
      footer: '完整指南在「{help}」講義中。',
    },
    handout: {
      versionLabel: '版本',
      subtitle: '依生命值與死亡豁免檢定判斷重傷、瀕死、穩定與死亡',
      footer: '所有指令的按鈕都在「{deck}」中。',
      overview: {
        heading: '概覽',
        body: 'DeathTracker 監看每個指示物的生命值數值條。它會為重傷或死亡的指示物加上標記，追蹤生命值為 0 的玩家角色的死亡豁免檢定，並可將死者移出地圖與回合順序。',
      },
      quickStart: {
        heading: '快速入門',
        steps: [
          '把生命值放在數值條 1 (或在設定中選擇其他數值條)。',
          '對指示物造成傷害：降到最大值一半時會加上重傷標記；NPC 降到 0 時會加上死亡標記。',
          'PC 降到 0 時會加上瀕死標記。在角色卡上勾選死亡豁免檢定：三次成功即穩定，三次失敗即死亡。',
          '將其治療到 0 以上，標記就會消失。',
          '輸入 !deathtracker 開啟選單。',
        ],
      },
      statuses: {
        heading: '狀態',
        points: [
          '健康：高於最大生命值的重傷比例 (無標記)。',
          '重傷：等於或低於該比例 (未更改時為 50%)。',
          '瀕死：生命值為 0 且正在進行死亡豁免檢定的 PC。',
          '穩定：生命值為 0 且已有三次成功，或以 stable 指令穩定傷勢的 PC。',
          '死亡：生命值為 0 的 NPC、三次失敗的 PC，或因巨量傷害而死的 PC。',
          '空白的數值條，或內容不是數字的數值條，絕不會被當成 0。',
        ],
      },
      deathSaves: {
        heading: '死亡豁免檢定',
        points: [
          'D&D 2024 角色卡：在勾選方格或擲骰時從角色卡讀取。',
          'D&D 2014 角色卡及其他有勾選方格的角色卡：從設定中的成功與失敗欄位讀取。',
          '角色卡在治療後會保留舊的勾選，因此從 PC 降到 0 的那一刻起才開始計算。開啟「清除角色卡勾選」時，DeathTracker 會在 PC 降到 0 及受到治療時清除角色卡的方格，並在 PC 經由指示物數值條降到 0 時顯示 D&D 2024 角色卡的死亡豁免方格。',
          '如果無法讀取角色卡，請建立死亡豁免巨集 (!deathtracker macro)：玩家每次檢定後選取自己的指示物並點擊它。',
          '誰是 PC：由玩家控制的指示物或角色，或 (玩家或角色卡) 角色卡標示為非 NPC 者。使用「設為 PC」/「設為 NPC」為某個角色決定。',
        ],
      },
      onDeath: {
        heading: '指示物死亡時',
        points: [
          '將死者移到 GM 圖層或地圖圖層，並移出回合順序。兩者預設都是關閉的。',
          '只適用於 NPC，除非設為「NPC 與 PC」。',
          '治療死亡的指示物會移除其標記，但不會把它移回原處。選取它並使用「放回」(它會帶著先攻值回到回合順序)。',
          '巨量傷害 (預設關閉)：數值條低於 0 的幅度達到其最大值或以上的 PC 會當場死亡。2024 角色卡在 0 停止，因此只有在數值條直接輸入低於 0 的值時才有效。',
        ],
      },
      healthColors: {
        heading: 'HealthColors 與其他 Mod',
        points: [
          '設定中的「由誰負責」可選擇由哪個 Mod 處理死亡豁免檢定 (含瀕死、穩定與死亡標記)、生命值顏色與受傷/治療特效：DeathTracker、HealthColors 或關。HealthColors 2.5 以上版本會顯示相同的選項，在任一 Mod 中變更都會同時套用到兩者。',
          '預設由 DeathTracker 處理死亡豁免檢定，HealthColors 處理顏色與特效。未安裝 HealthColors 時，三者都由 DeathTracker 處理。',
          'HealthColors 2.5 之前的版本不會共用此選項：請用 !aura deathsaves off 關閉它的死亡豁免檢定。',
          'TokenMod 做的變更會被偵測到。其他 Mod 可以在變更生命值後呼叫 DeathTracker.check(token)。',
          'DeathTracker 只會移除它自己加上的標記。',
        ],
      },
      commands: {
        heading: '指令',
        intro:
          '每個指令都以 !deathtracker 開頭 (或 !dt，或 0.1 版的 !dead)。除死亡豁免巨集外，僅限 GM 使用。',
        colCommand: '指令',
        colDesc: '功能',
      },
      settings: {
        heading: '設定',
        intro: '可在選單中、用 !deathtracker set <setting> <value>，或在 Mod 庫的選項中變更。',
        colKey: '設定',
        colDesc: '功能',
        rows: {
          deathSavesBy:
            '由誰追蹤死亡豁免檢定並設定瀕死、穩定與死亡標記：DeathTracker、HealthColors 或關閉。與 HealthColors 共用。',
          coloursBy:
            '由誰依生命值為指示物上色：DeathTracker (其染色)、HealthColors 或關閉。與 HealthColors 共用。',
          effectsBy:
            '由誰播放受傷與治療特效：DeathTracker、HealthColors 或關閉。與 HealthColors 共用。',
          language: '選單、訊息與講義的語言。',
          hpBar: '存放生命值的數值條 (1、2 或 3)。',
          bloodiedPercent: '等於或低於最大生命值的此百分比時為重傷 (0 會關閉重傷)。',
          bloodiedMarker: '重傷的標記 (none 表示不加標記)。',
          dyingMarker: '瀕死 PC 的標記。',
          stableMarker: '穩定 PC 的標記。',
          deadMarker: '死者的標記。',
          pcDetection: 'auto：由玩家控制，或角色卡標示為 PC；players：僅限由玩家控制。',
          deathSaves: '追蹤生命值為 0 的 PC 的死亡豁免檢定。',
          resetSheetSaves:
            '在 PC 降到 0 及受到治療時清除角色卡的死亡豁免方格，並在 D&D 2024 角色卡上顯示它們。',
          successFields: '成功時勾選的角色卡欄位 (2014 及其他角色卡)。',
          failureFields: '失敗時勾選的角色卡欄位。',
          massiveDamage: '數值條低於 0 的幅度達到其最大值或以上的 PC 會當場死亡。',
          announce: 'PC 倒下、穩定、死亡或站起時通知誰：off、gm 或 controllers。',
          deathLayer: '將死者移至：none、gmlayer 或 map。',
          deathTurnOrder: '將死者在回合順序中 keep (保留) 或 remove (移除)。',
          deathActionsFor: 'npc：移動與回合順序只適用於 NPC；all：也適用於 PC。',
          tintPlayers: 'PC 失去生命值時，將其從綠色染成紅色。',
          tintNpcs: '以同樣方式為 NPC 染色。',
          hurtFx: '指示物失去生命值時播放特效。',
          hurtFxType: '該特效，格式為類型-顏色 (splatter-blood)。',
          healFx: '指示物獲得生命值時播放特效。',
          healFxType: '該特效 (glow-holy)。',
        },
      },
      api: {
        heading: '給 Mod 作者',
        intro: 'DeathTracker 公開一個 DeathTracker 物件。',
        colFunction: '函式',
        colDesc: '功能',
        rows: {
          check: '立即判斷一個指示物 (在 Mod 變更其生命值後)。',
          getStatus: '指示物的狀態：healthy、bloodied、dying、stable、dead 或 null。',
          onStatusChange: '狀態改變時收到通知 ({token, status, previous, isPc})。',
          observe: '0.1 版：DeathTracker 處理生命值變化後，以 (token, prev) 收到通知。',
          managing:
            'DeathTracker 正在追蹤死亡豁免檢定時為 true：檢定已開啟，且選擇由 DeathTracker 處理 (HealthColors 會使用)。',
          ownersChanged: '在「由誰負責」變更後更新指示物 (HealthColors 會呼叫)。',
        },
      },
      upgrading: {
        heading: '從 0.1 升級',
        points: [
          '你的標記、數值條、染色與特效設定都會沿用。',
          '!dead 仍可使用，!dead config 與 !dead reset 也一樣。',
          'PC 的 Unconscious 標記現在是瀕死標記。',
          '變更數值條不再需要重新啟動。',
        ],
      },
      troubleshooting: {
        heading: '疑難排解',
        points: [
          '沒有任何反應：檢查設定中的生命值數值條，以及該數值條是否存有數字。',
          'PC 被當成 NPC：選取它並按「設為 PC」，或讓玩家控制該角色。',
          '標記沒有顯示：使用 !deathtracker markers 並從列表中選一個名稱。',
          '其他 Mod 變更的生命值沒被偵測到：該 Mod 應呼叫 DeathTracker.check(token)。',
        ],
      },
      languages: {
        heading: '語言',
        body: '用 !deathtracker set language <code> 設定語言。',
        colLanguage: '語言',
        colNative: '原文名稱',
        colCode: '代碼',
      },
      credits: {
        heading: '製作人員',
        original: '原作者',
        maintainer: '1.0 版改寫',
        support: '發現問題或有點子嗎？請在 Roll20 聯絡 MidNiteShadow7。',
      },
    },
    errors: {
      gmOnly: '只有 GM 可以使用該 DeathTracker 指令。',
      unknownCommand: 'DeathTracker 沒有「{command}」指令。',
      noTokens: '請先選取一個或多個指示物 (或加上 --ids)。',
      notYourToken: '你沒有控制該指示物。',
      hint: '輸入 !deathtracker help 查看指令列表。',
    },
  };

  var localeCs = {
    titles: {
      ready: 'DeathTracker je připraven.',
      menu: 'DeathTracker',
      status: 'DeathTracker – stav',
      settings: 'DeathTracker – nastavení',
      help: 'DeathTracker – příkazy',
      announce: 'DeathTracker',
      markers: 'Značky tokenů',
    },
    messages: {
      readyHint: 'Napište !deathtracker pro otevření nabídky.',
      migrated:
        'Vaše nastavení z DeathTracker 0.1 bylo převzato. !dead stále funguje; !deathtracker je nový příkaz.',
      healthColors:
        'HealthColors je nainstalován: DeathTracker obsluhuje hody proti smrti a značky umírání, stabilizace a smrti, HealthColors barvy zdraví a efekty zranění/léčení. Kdo co obsluhuje, změníte v Nastavení.',
      healthColorsSaves:
        'HealthColors také sleduje záchranné hody proti smrti a nastavuje značky umírání. Jeden z nich vypněte (!aura deathsaves off), aby se o značky nepřetahovaly.',
      settingChanged: '{setting} je nyní {value}.',
      settingRejected: '"{value}" není platná hodnota pro {setting}.',
      unknownSetting: 'Žádné nastavení s názvem "{setting}" neexistuje.',
      markerUnknown:
        'Tato hra nemá značku "{marker}", takže se nezobrazí. Použijte !deathtracker markers a uvidíte názvy, které můžete použít.',
      checked: 'Zkontrolováno tokenů: {count}.',
      cleared: 'Značky DeathTrackeru odstraněny z tokenů: {count}.',
      restored: 'Vráceno tokenů: {count}.',
      nothingToRestore: 'Žádný z těchto tokenů DeathTracker nepřesunul.',
      roleSet: '{names}: {role}.',
      stabilised: 'Stabilizováno: {count}.',
      notDown: 'Žádný z těchto tokenů není PC s 0 životy.',
      synced: '{name}: úspěchy {s}, neúspěchy {f}.',
      macroCreated:
        'Vytvořena akce tokenu "{macro}". Hráč vybere svůj token a klikne na ni po hodu proti smrti.',
      journalRebuilt: 'Podklady "{help}" a "{deck}" byly znovu sestaveny.',
      resetDone: 'Nastavení je zpět na výchozích hodnotách.',
      restartNotNeeded: 'Restart není potřeba: nová lišta se používá od teď.',
    },
    status: {
      healthy: 'Zdravý',
      bloodied: 'Zakrvácený',
      dying: 'Umírající',
      stable: 'Stabilizovaný',
      dead: 'Mrtvý',
      none: 'Nesledováno',
      pc: 'PC',
      npc: 'NPC',
      hp: 'Životy {hp}/{max}',
      hpNoMax: 'Životy {hp}',
      saves: 'Záchranné hody proti smrti: úspěchy {s}, neúspěchy {f}',
      unnamed: 'Token',
      noneHere: 'Na této stránce zatím nejsou žádné tokeny se životy.',
      page: 'Stránka: {page}',
      selected: 'Vybrané tokeny',
      actions: 'Přesunut po smrti',
    },
    announce: {
      dying: '{name} padl a umírá.',
      stable: '{name} je stabilizovaný.',
      dead: '{name} zemřel.',
      up: '{name} je zpět na nohou.',
      savesHint: 'Záchranné hody proti smrti zaškrtnuté v deníku se počítají průběžně.',
    },
    menu: {
      summary: 'Na této stránce',
      down: 'Padlé PC',
      noneDown: 'Žádná PC nepadla.',
      tools: 'Nástroje',
      sandbox: 'Sandbox Modů: {version}',
      sandboxUnknown: 'neznámý',
      hcNote: 'HealthColors je nainstalován.',
    },
    buttons: {
      menu: 'Nabídka',
      status: 'Stav',
      checkPage: 'Zkontrolovat stránku',
      check: 'Zkontrolovat vybrané',
      settings: 'Nastavení',
      help: 'Nápověda',
      stable: 'Stabilizovat',
      restore: 'Obnovit',
      clear: 'Odstranit značky',
      pc: 'Nastavit jako PC',
      npc: 'Nastavit jako NPC',
      auto: 'Rozhodnout automaticky',
      markers: 'Značky',
      macro: 'Vytvořit makro hodu proti smrti',
      rebuild: 'Znovu sestavit podklady',
      reset: 'Obnovit nastavení',
      on: 'Zap',
      off: 'Vyp',
      back: 'Zpět',
    },
    prompts: {
      marker: 'Značka',
      percent: 'Zakrvácený při nebo pod (% maxima)',
      fields: 'Názvy polí oddělené čárkami',
      fx: 'Efekt (typ-barva)',
      language: 'Jazyk',
    },
    sections: {
      owners: 'Kdo co obsluhuje',
      hp: 'Životy',
      markers: 'Značky',
      deathSaves: 'Záchranné hody proti smrti (PC)',
      onDeath: 'Když token zemře',
      looks: 'Zabarvení a efekty',
      general: 'Obecné',
    },
    settings: {
      deathSavesBy: 'Hody proti smrti a značky při 0 životech',
      coloursBy: 'Barvy zdraví',
      effectsBy: 'Efekty zranění a léčení',
      language: 'Jazyk',
      hpBar: 'Lišta životů',
      bloodiedPercent: 'Zakrvácený při',
      bloodiedMarker: 'Značka zakrvácení',
      dyingMarker: 'Značka umírání',
      stableMarker: 'Značka stabilizace',
      deadMarker: 'Značka smrti',
      pcDetection: 'Kdo je PC',
      deathSaves: 'Sledovat hody proti smrti',
      resetSheetSaves: 'Mazat políčka v deníku',
      successFields: 'Pole úspěchů',
      failureFields: 'Pole neúspěchů',
      massiveDamage: 'Masivní zranění',
      announce: 'Oznamovat',
      deathLayer: 'Přesunout mrtvé do',
      deathTurnOrder: 'Pořadí tahů',
      deathActionsFor: 'Platí pro',
      tintPlayers: 'Zabarvovat PC',
      tintNpcs: 'Zabarvovat NPC',
      hurtFx: 'Efekt zranění',
      hurtFxType: 'Typ efektu zranění',
      healFx: 'Efekt léčení',
      healFxType: 'Typ efektu léčení',
    },
    choices: {
      hpBar: { 1: 'Lišta 1', 2: 'Lišta 2', 3: 'Lišta 3' },
      pcDetection: { auto: 'Hráči nebo deník', players: 'Ovládaný hráčem' },
      deathLayer: { none: 'Zůstat na místě', gmlayer: 'Vrstva PJ', map: 'Vrstva mapy' },
      deathTurnOrder: { keep: 'Ponechat', remove: 'Odebrat' },
      deathActionsFor: { npc: 'NPC', all: 'NPC i PC' },
      announce: { off: 'Vyp', gm: 'PJ', controllers: 'PJ a hráči' },
      none: 'Žádná',
      notInstalled: 'není nainstalován',
    },
    help: {
      menu: 'Otevřít nabídku.',
      status: 'Zobrazit stav vybraných tokenů, nebo všech sledovaných tokenů na vaší stránce.',
      check: 'Znovu posoudit vybrané tokeny (all: všechny tokeny na vaší stránce).',
      stable: 'Označit vybraná PC s 0 životy jako stabilizovaná.',
      clear: 'Sundat z vybraných tokenů značky a zabarvení DeathTrackeru a zapomenout je.',
      restore:
        'Vrátit mrtvé tokeny, které DeathTracker přesunul, do jejich vrstvy a do pořadí tahů.',
      role: 'Považovat postavy vybraných tokenů za PC nebo NPC, nebo nechat rozhodnout DeathTracker.',
      markers: 'Vypsat značky, které tato hra má, s názvy k použití.',
      macro:
        'Vytvořit akci tokenu, na kterou hráči kliknou a pošlou své hody proti smrti (pro deníky, které DeathTracker neumí přečíst).',
      dsync: 'Posíláno makrem hodu proti smrti.',
      settings: 'Otevřít nastavení.',
      set: 'Změnit nastavení.',
      reset: 'Vrátit všechna nastavení na výchozí hodnoty.',
      config: 'Příkazy verze 0.1: otevřít nastavení, nebo jedno změnit (config bar|2).',
      journal: 'Znovu sestavit podklady Help a Command Deck.',
      help: 'Zobrazit tento seznam.',
      ids: 'Přidejte --ids id1,id2 pro práci s tokeny podle ID místo výběru.',
    },
    deck: {
      menuTitle: 'Nabídka',
      menuDesc: 'Nabídka, stav, nastavení a nápověda.',
      selectedTitle: 'Vybrané tokeny',
      selectedDesc: 'Vyberte tokeny na mapě a pak stiskněte tlačítko.',
      roleTitle: 'PC nebo NPC',
      roleDesc: 'Pro postavy vybraných tokenů.',
      toolsTitle: 'Nástroje',
      toolsDesc: 'Značky, makro hodu proti smrti a tyto podklady.',
      footer: 'Úplný návod je v podkladu "{help}".',
    },
    handout: {
      versionLabel: 'Verze',
      subtitle: 'Zakrvácený, umírající, stabilizovaný a mrtvý podle životů a hodů proti smrti',
      footer: 'Tlačítka pro všechny příkazy jsou v "{deck}".',
      overview: {
        heading: 'Přehled',
        body: 'DeathTracker sleduje lištu životů každého tokenu. Označuje tokeny, které jsou zakrvácené nebo mrtvé, sleduje záchranné hody proti smrti hráčských postav s 0 životy a umí přesunout mrtvé z mapy a vyřadit je z pořadí tahů.',
      },
      quickStart: {
        heading: 'Rychlý start',
        steps: [
          'Dejte životy do Lišty 1 (nebo zvolte jinou lištu v Nastavení).',
          'Zraňte token: na polovině maxima dostane značku zakrvácení; na 0 dostane NPC značku smrti.',
          'PC na 0 dostane značku umírání. Zaškrtávejte hody proti smrti v deníku: tři úspěchy ho stabilizují, tři neúspěchy znamenají smrt.',
          'Vyléčte ho nad 0 a značky zmizí.',
          'Napište !deathtracker pro nabídku.',
        ],
      },
      statuses: {
        heading: 'Stavy',
        points: [
          'Zdravý: nad hranicí zakrvácení z maximálních životů (bez značky).',
          'Zakrvácený: na této hranici nebo pod ní (50 %, pokud se nezmění).',
          'Umírající: PC s 0 životy, které hází záchranné hody proti smrti.',
          'Stabilizovaný: PC na 0 se třemi úspěchy, nebo stabilizované příkazem stable.',
          'Mrtvý: NPC na 0, PC se třemi neúspěchy, nebo PC zabité masivním zraněním.',
          'Prázdná lišta, nebo lišta bez čísla, se nikdy nečte jako 0.',
        ],
      },
      deathSaves: {
        heading: 'Záchranné hody proti smrti',
        points: [
          'Deník D&D 2024: čte se z deníku, jak se zaškrtávají políčka nebo hází hody.',
          'Deník D&D 2014 a další se zaškrtávacími políčky: čte se z polí úspěchů a neúspěchů v Nastavení.',
          'Deník si po vyléčení ponechává stará zaškrtnutí, takže se hody počítají od chvíle, kdy PC klesne na 0. Se zapnutým Mazat políčka v deníku DeathTracker vymaže políčka v deníku, když PC klesne na 0 a když je vyléčeno, a zobrazí políčka hodů proti smrti v deníku D&D 2024, když PC klesne na 0 z lišty tokenu.',
          'Pokud deník nelze přečíst, vytvořte makro hodu proti smrti (!deathtracker macro): hráči vyberou svůj token a kliknou na něj po každém hodu.',
          'Kdo je PC: token nebo postava ovládaná hráčem, nebo (Hráči nebo deník) taková, jejíž deník uvádí, že není NPC. Použijte Nastavit jako PC / Nastavit jako NPC pro rozhodnutí u postavy.',
        ],
      },
      onDeath: {
        heading: 'Když token zemře',
        points: [
          'Přesunout mrtvé do vrstvy PJ nebo do vrstvy mapy a vyřadit je z pořadí tahů. Obojí je na začátku vypnuté.',
          'Platí jen pro NPC, pokud není nastaveno NPC i PC.',
          'Vyléčení mrtvého tokenu odstraní jeho značky, ale nepřesune ho zpět. Vyberte ho a použijte Obnovit (vrátí se do pořadí tahů se svou iniciativou).',
          'Masivní zranění (na začátku vypnuté): PC, jehož lišta klesne pod 0 alespoň o jeho maximum, okamžitě zemře. Deník 2024 se zastaví na 0, takže to funguje jen tehdy, když se do lišty zapíše hodnota pod 0.',
        ],
      },
      healthColors: {
        heading: 'HealthColors a další Mody',
        points: [
          'Kdo co obsluhuje (v Nastavení) určuje, který Mod obsluhuje hody proti smrti (se značkami umírání, stabilizace a smrti), barvy zdraví a efekty zranění/léčení: DeathTracker, HealthColors nebo Vyp. HealthColors 2.5 a novější nabízí stejnou volbu a její změna v kterémkoli z obou Modů platí pro oba.',
          'Na začátku obsluhuje DeathTracker hody proti smrti a HealthColors barvy a efekty. Bez HealthColors obsluhuje DeathTracker všechny tři.',
          'HealthColors starší než 2.5 volbu nesdílí: vypněte v něm hody proti smrti příkazem !aura deathsaves off.',
          'Změny provedené TokenModem jsou zachyceny. Ostatní Mody mohou po změně životů zavolat DeathTracker.check(token).',
          'DeathTracker odstraňuje jen značky, které sám nastavil.',
        ],
      },
      commands: {
        heading: 'Příkazy',
        intro:
          'Každý příkaz začíná !deathtracker (nebo !dt, nebo !dead z verze 0.1). Jen pro PJ, kromě makra hodu proti smrti.',
        colCommand: 'Příkaz',
        colDesc: 'Co dělá',
      },
      settings: {
        heading: 'Nastavení',
        intro:
          'Měňte je v nabídce, příkazem !deathtracker set <nastavení> <hodnota>, nebo v možnostech Knihovny Modů.',
        colKey: 'Nastavení',
        colDesc: 'Co dělá',
        rows: {
          deathSavesBy:
            'Kdo sleduje hody proti smrti a nastavuje značky umírání, stabilizace a smrti: DeathTracker, HealthColors nebo off. Sdíleno s HealthColors.',
          coloursBy:
            'Kdo barví tokeny podle životů: DeathTracker (jeho zabarvení), HealthColors nebo off. Sdíleno s HealthColors.',
          effectsBy:
            'Kdo přehrává efekty zranění a léčení: DeathTracker, HealthColors nebo off. Sdíleno s HealthColors.',
          language: 'Jazyk nabídek, zpráv a podkladů.',
          hpBar: 'Lišta, ve které jsou životy (1, 2 nebo 3).',
          bloodiedPercent:
            'Zakrvácený při tomto procentu maximálních životů nebo pod ním (0 zakrvácení vypne).',
          bloodiedMarker: 'Značka zakrvácení (none pro žádnou značku).',
          dyingMarker: 'Značka umírajícího PC.',
          stableMarker: 'Značka stabilizovaného PC.',
          deadMarker: 'Značka mrtvých.',
          pcDetection: 'auto: ovládané hráčem nebo deník uvádí PC; players: jen ovládané hráčem.',
          deathSaves: 'Sledovat záchranné hody proti smrti u PC s 0 životy.',
          resetSheetSaves:
            'Mazat políčka hodů proti smrti v deníku, když PC klesne na 0 a když je vyléčeno, a zobrazit je v deníku D&D 2024.',
          successFields: 'Pole deníku zaškrtávaná za úspěchy (2014 a další deníky).',
          failureFields: 'Pole deníku zaškrtávaná za neúspěchy.',
          massiveDamage: 'PC, jehož lišta klesne pod 0 alespoň o jeho maximum, okamžitě zemře.',
          announce:
            'Komu se oznámí, když PC padne, stabilizuje se, zemře nebo vstane: off, gm nebo controllers.',
          deathLayer: 'Přesunout mrtvé do: none, gmlayer nebo map.',
          deathTurnOrder: 'keep nebo remove mrtvé v pořadí tahů.',
          deathActionsFor: 'npc: přesun a pořadí tahů platí pro NPC; all: i pro PC.',
          tintPlayers: 'Zabarvovat PC od zelené po červenou, jak ztrácejí životy.',
          tintNpcs: 'Zabarvovat NPC stejným způsobem.',
          hurtFx: 'Přehrát efekt, když token ztratí životy.',
          hurtFxType: 'Ten efekt jako typ-barva (splatter-blood).',
          healFx: 'Přehrát efekt, když token získá životy.',
          healFxType: 'Ten efekt (glow-holy).',
        },
      },
      api: {
        heading: 'Pro autory Modů',
        intro: 'DeathTracker zveřejňuje objekt DeathTracker.',
        colFunction: 'Funkce',
        colDesc: 'Co dělá',
        rows: {
          check: 'Posoudit token hned (po změně jeho životů z Modu).',
          getStatus: 'Stav tokenu: healthy, bloodied, dying, stable, dead nebo null.',
          onStatusChange: 'Dostat zprávu, když se stav změní ({token, status, previous, isPc}).',
          observe:
            'Verze 0.1: dostat zprávu (token, prev) poté, co DeathTracker zpracuje změnu životů.',
          managing:
            'True, když DeathTracker sleduje hody proti smrti: jsou zapnuté a jejich obsluhou je pověřen DeathTracker (používá to HealthColors).',
          ownersChanged:
            'Aktualizovat tokeny poté, co se změnilo, kdo co obsluhuje (volá to HealthColors).',
        },
      },
      upgrading: {
        heading: 'Přechod z verze 0.1',
        points: [
          'Vaše nastavení značek, lišty, zabarvení a efektů se převezmou.',
          '!dead stále funguje, stejně jako !dead config a !dead reset.',
          'Značka Unconscious pro PC je nyní značka umírání.',
          'Změna lišty už nevyžaduje restart.',
        ],
      },
      troubleshooting: {
        heading: 'Řešení problémů',
        points: [
          'Nic se neděje: zkontrolujte lištu životů v Nastavení a že lišta obsahuje číslo.',
          'S PC se zachází jako s NPC: vyberte ho a stiskněte Nastavit jako PC, nebo nechte postavu ovládat hráče.',
          'Značka se nezobrazuje: použijte !deathtracker markers a vyberte název ze seznamu.',
          'Životy změněné jiným Modem nejsou zachyceny: ten Mod by měl zavolat DeathTracker.check(token).',
        ],
      },
      languages: {
        heading: 'Jazyky',
        body: 'Nastavte jazyk příkazem !deathtracker set language <kód>.',
        colLanguage: 'Jazyk',
        colNative: 'Původní název',
        colCode: 'Kód',
      },
      credits: {
        heading: 'Autoři',
        original: 'Napsal',
        maintainer: 'Pro verzi 1.0 přepsal',
        support: 'Našli jste problém nebo máte nápad? Kontaktujte MidNiteShadow7 na Roll20.',
      },
    },
    errors: {
      gmOnly: 'Tento příkaz DeathTrackeru může použít jen PJ.',
      unknownCommand: 'DeathTracker nemá příkaz "{command}".',
      noTokens: 'Nejprve vyberte jeden nebo více tokenů (nebo přidejte --ids).',
      notYourToken: 'Tento token neovládáte.',
      hint: 'Napište !deathtracker help pro seznam příkazů.',
    },
  };

  var localeDa = {
    titles: {
      ready: 'DeathTracker er klar.',
      menu: 'DeathTracker',
      status: 'DeathTracker-status',
      settings: 'DeathTracker-indstillinger',
      help: 'DeathTracker-kommandoer',
      announce: 'DeathTracker',
      markers: 'Tokenmarkører',
    },
    messages: {
      readyHint: 'Skriv !deathtracker for at åbne menuen.',
      migrated:
        'Dine indstillinger fra DeathTracker 0.1 er overført. !dead virker stadig; !deathtracker er den nye kommando.',
      healthColors:
        'HealthColors er installeret: DeathTracker håndterer dødsredningsslag og døende-, stabil- og død-markørerne, og HealthColors helbredsfarverne og skade-/helingseffekterne. Skift, hvem der håndterer hvad, under Indstillinger.',
      healthColorsSaves:
        'HealthColors holder også styr på dødsredningsslag og sætter døende-markører. Slå en af dem fra (!aura deathsaves off), så de ikke kæmper om markørerne.',
      settingChanged: '{setting} er nu {value}.',
      settingRejected: '"{value}" er ikke en gyldig værdi for {setting}.',
      unknownSetting: 'Der er ingen indstilling, der hedder "{setting}".',
      markerUnknown:
        'Dette spil har ingen markør "{marker}", så den vises ikke. Brug !deathtracker markers for at se de navne, du kan bruge.',
      checked: 'Tjekkede {count} token(s).',
      cleared: 'Fjernede DeathTracker-markører fra {count} token(s).',
      restored: 'Satte {count} token(s) tilbage.',
      nothingToRestore: 'Ingen af de tokens blev flyttet af DeathTracker.',
      roleSet: '{names}: {role}.',
      stabilised: 'Stabil: {count}.',
      notDown: 'Ingen af de tokens er en PC på 0 livspoint.',
      synced: '{name}: {s} succes(er), {f} fiasko(er).',
      macroCreated:
        'Tokenhandlingen "{macro}" er oprettet. En spiller vælger sin token og klikker på den efter at have slået et dødsredningsslag.',
      journalRebuilt: 'Handouterne "{help}" og "{deck}" er bygget op igen.',
      resetDone: 'Indstillingerne er tilbage på standardværdierne.',
      restartNotNeeded: 'Ingen genstart nødvendig: den nye bjælke bruges fra nu af.',
    },
    status: {
      healthy: 'Rask',
      bloodied: 'Blødende',
      dying: 'Døende',
      stable: 'Stabil',
      dead: 'Død',
      none: 'Ikke fulgt',
      pc: 'PC',
      npc: 'NPC',
      hp: 'LP {hp}/{max}',
      hpNoMax: 'LP {hp}',
      saves: 'Dødsredningsslag: {s} succes(er), {f} fiasko(er)',
      unnamed: 'En token',
      noneHere: 'Ingen tokens med livspoint på denne side endnu.',
      page: 'Side: {page}',
      selected: 'Valgte tokens',
      actions: 'Flyttet, da den døde',
    },
    announce: {
      dying: '{name} er nede og døende.',
      stable: '{name} er stabil.',
      dead: '{name} er død.',
      up: '{name} er på benene igen.',
      savesHint: 'Dødsredningsslag, der krydses af på arket, tælles med, efterhånden som de slås.',
    },
    menu: {
      summary: 'På denne side',
      down: 'PC’er nede',
      noneDown: 'Ingen PC’er er nede.',
      tools: 'Værktøjer',
      sandbox: 'Mod-sandbox: {version}',
      sandboxUnknown: 'ukendt',
      hcNote: 'HealthColors er installeret.',
    },
    buttons: {
      menu: 'Menu',
      status: 'Status',
      checkPage: 'Tjek side',
      check: 'Tjek valgte',
      settings: 'Indstillinger',
      help: 'Hjælp',
      stable: 'Stabilisér',
      restore: 'Gendan',
      clear: 'Ryd markører',
      pc: 'Gør til PC',
      npc: 'Gør til NPC',
      auto: 'Afgør automatisk',
      markers: 'Markører',
      macro: 'Lav dødsredningsslag-makro',
      rebuild: 'Byg handouts igen',
      reset: 'Nulstil indstillinger',
      on: 'Til',
      off: 'Fra',
      back: 'Tilbage',
    },
    prompts: {
      marker: 'Markør',
      percent: 'Blødende ved eller under (% af maksimum)',
      fields: 'Feltnavne adskilt af kommaer',
      fx: 'Effekt (type-farve)',
      language: 'Sprog',
    },
    sections: {
      owners: 'Hvem håndterer hvad',
      hp: 'Livspoint',
      markers: 'Markører',
      deathSaves: 'Dødsredningsslag (PC’er)',
      onDeath: 'Når en token dør',
      looks: 'Farvetone og effekter',
      general: 'Generelt',
    },
    settings: {
      deathSavesBy: 'Dødsredningsslag og 0 LP-markører',
      coloursBy: 'Helbredsfarver',
      effectsBy: 'Skade- og helingseffekter',
      language: 'Sprog',
      hpBar: 'Livspointbjælke',
      bloodiedPercent: 'Blødende ved',
      bloodiedMarker: 'Blødende-markør',
      dyingMarker: 'Døende-markør',
      stableMarker: 'Stabil-markør',
      deadMarker: 'Død-markør',
      pcDetection: 'Hvem er PC',
      deathSaves: 'Følg dødsredningsslag',
      resetSheetSaves: 'Ryd felter på arket',
      successFields: 'Succesfelter',
      failureFields: 'Fiaskofelter',
      massiveDamage: 'Massiv skade',
      announce: 'Annoncér',
      deathLayer: 'Flyt de døde til',
      deathTurnOrder: 'Turrækkefølge',
      deathActionsFor: 'Gælder for',
      tintPlayers: 'Farv PC’er',
      tintNpcs: 'Farv NPC’er',
      hurtFx: 'Skadeeffekt',
      hurtFxType: 'Type af skadeeffekt',
      healFx: 'Helingseffekt',
      healFxType: 'Type af helingseffekt',
    },
    choices: {
      hpBar: { 1: 'Bjælke 1', 2: 'Bjælke 2', 3: 'Bjælke 3' },
      pcDetection: { auto: 'Spillere eller ark', players: 'Styret af en spiller' },
      deathLayer: { none: 'Bliv liggende', gmlayer: 'GM-lag', map: 'Kortlag' },
      deathTurnOrder: { keep: 'Behold', remove: 'Fjern' },
      deathActionsFor: { npc: 'NPC’er', all: 'NPC’er og PC’er' },
      announce: { off: 'Fra', gm: 'GM', controllers: 'GM og spillere' },
      none: 'Ingen',
      notInstalled: 'ikke installeret',
    },
    help: {
      menu: 'Åbn menuen.',
      status: 'Vis status for de valgte tokens, eller for hver fulgt token på din side.',
      check: 'Vurdér de valgte tokens igen (all: hver token på din side).',
      stable: 'Markér de valgte PC’er på 0 livspoint som stabile.',
      clear: 'Tag DeathTrackers markører og farvetone af de valgte tokens, og glem dem.',
      restore:
        'Sæt døde tokens, som DeathTracker har flyttet, tilbage på deres lag og i turrækkefølgen.',
      role: 'Behandl de valgte tokens’ karakterer som PC’er eller NPC’er, eller lad DeathTracker afgøre det.',
      markers: 'Vis de markører, dette spil har, med de navne, der skal bruges.',
      macro:
        'Lav en tokenhandling, som spillerne klikker på for at sende deres dødsredningsslag (til ark, DeathTracker ikke kan læse).',
      dsync: 'Sendt af dødsredningsslag-makroen.',
      settings: 'Åbn indstillingerne.',
      set: 'Skift en indstilling.',
      reset: 'Sæt alle indstillinger tilbage til standard.',
      config: 'Kommandoer fra version 0.1: åbn indstillingerne, eller skift en (config bar|2).',
      journal: 'Byg handouterne Hjælp og Command Deck op igen.',
      help: 'Vis denne liste.',
      ids: 'Tilføj --ids id1,id2 for at arbejde på tokens efter ID i stedet for markeringen.',
    },
    deck: {
      menuTitle: 'Menu',
      menuDesc: 'Menuen, status, indstillinger og hjælp.',
      selectedTitle: 'Valgte tokens',
      selectedDesc: 'Vælg tokens på kortet, og tryk så på en knap.',
      roleTitle: 'PC eller NPC',
      roleDesc: 'For de valgte tokens’ karakterer.',
      toolsTitle: 'Værktøjer',
      toolsDesc: 'Markører, dødsredningsslag-makroen og disse handouts.',
      footer: 'Den fulde vejledning findes i handouten "{help}".',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Blødende, døende, stabil og død, ud fra livspoint og dødsredningsslag',
      footer: 'Knapper til alle kommandoer findes i "{deck}".',
      overview: {
        heading: 'Overblik',
        body: 'DeathTracker holder øje med livspointbjælken på hver token. Den markerer tokens, der er blødende eller døde, holder styr på dødsredningsslag for spillerkarakterer på 0 livspoint og kan flytte de døde væk fra kortet og ud af turrækkefølgen.',
      },
      quickStart: {
        heading: 'Kom hurtigt i gang',
        steps: [
          'Sæt livspoint i Bjælke 1 (eller vælg en anden bjælke under Indstillinger).',
          'Giv en token skade: ved halvdelen af sit maksimum får den Blødende-markøren; ved 0 får en NPC Død-markøren.',
          'En PC på 0 får Døende-markøren. Kryds dødsredningsslag af på arket: tre succeser gør den Stabil, tre fiaskoer Død.',
          'Hel den over 0, og markørerne forsvinder.',
          'Skriv !deathtracker for at få menuen.',
        ],
      },
      statuses: {
        heading: 'Statusser',
        points: [
          'Rask: over Blødende-andelen af de maksimale livspoint (ingen markør).',
          'Blødende: ved eller under den andel (50 %, medmindre den er ændret).',
          'Døende: en PC på 0 livspoint, der slår dødsredningsslag.',
          'Stabil: en PC på 0 med tre succeser, eller stabiliseret med kommandoen stable.',
          'Død: en NPC på 0, en PC med tre fiaskoer, eller en PC dræbt af massiv skade.',
          'En tom bjælke, eller en der ikke indeholder et tal, læses aldrig som 0.',
        ],
      },
      deathSaves: {
        heading: 'Dødsredningsslag',
        points: [
          'D&D 2024-ark: læses fra arket, efterhånden som felter krydses af eller slag slås.',
          'D&D 2014-ark og andre med afkrydsningsfelter: læses fra succes- og fiaskofelterne under Indstillinger.',
          'Arket beholder gamle krydser efter heling, så slag tælles fra det øjeblik, PC’en falder til 0. Med Ryd felter på arket slået til rydder DeathTracker arkets felter, når PC’en falder til 0, og når den heles, og viser D&D 2024-arkets dødsredningsslag-felter, når en PC falder til 0 via tokenbjælken.',
          'Hvis arket ikke kan læses, så lav dødsredningsslag-makroen (!deathtracker macro): spillerne vælger deres token og klikker på den efter hvert slag.',
          'Hvem er PC: en token eller karakter styret af en spiller, eller (Spillere eller ark) en, hvis ark siger, at den ikke er en NPC. Brug Gør til PC / Gør til NPC for at afgøre det for en karakter.',
        ],
      },
      onDeath: {
        heading: 'Når en token dør',
        points: [
          'Flyt de døde til GM-laget eller Kortlaget, og tag dem ud af turrækkefølgen. Begge er slået fra til at begynde med.',
          'Gælder kun for NPC’er, medmindre det er sat til NPC’er og PC’er.',
          'Når en død token heles, fjernes dens markører, men den flyttes ikke tilbage. Vælg den, og brug Gendan (den kommer tilbage i turrækkefølgen med sit initiativ).',
          'Massiv skade (slået fra til at begynde med): en PC, hvis bjælke kommer mindst sit maksimum under 0, dør med det samme. 2024-arket stopper ved 0, så det virker kun, når værdien under 0 skrives i bjælken.',
        ],
      },
      healthColors: {
        heading: 'HealthColors og andre Mods',
        points: [
          'Hvem håndterer hvad, under Indstillinger, vælger, hvilken Mod der står for dødsredningsslag (med døende-, stabil- og død-markørerne), helbredsfarver og skade-/helingseffekter: DeathTracker, HealthColors eller Fra. HealthColors 2.5 og nyere viser samme valg, og ændrer du det i den ene Mod, ændres det i begge.',
          'Fra start håndterer DeathTracker dødsredningsslag og HealthColors farverne og effekterne. Uden HealthColors håndterer DeathTracker alle tre.',
          'HealthColors før 2.5 deler ikke valget: slå dens dødsredningsslag fra med !aura deathsaves off.',
          'Ændringer foretaget af TokenMod opfanges. Andre Mods kan kalde DeathTracker.check(token) efter at have ændret livspoint.',
          'DeathTracker fjerner kun markører, den selv har sat på.',
        ],
      },
      commands: {
        heading: 'Kommandoer',
        intro:
          'Alle kommandoer starter med !deathtracker (eller !dt, eller !dead fra version 0.1). Kun for GM, undtagen dødsredningsslag-makroen.',
        colCommand: 'Kommando',
        colDesc: 'Hvad den gør',
      },
      settings: {
        heading: 'Indstillinger',
        intro:
          'Skift dem i menuen, med !deathtracker set <setting> <value>, eller under indstillingerne i Mod-biblioteket.',
        colKey: 'Indstilling',
        colDesc: 'Hvad den gør',
        rows: {
          deathSavesBy:
            'Hvem der følger dødsredningsslag og sætter døende-, stabil- og død-markørerne: DeathTracker, HealthColors eller off. Delt med HealthColors.',
          coloursBy:
            'Hvem der farver tokens efter livspoint: DeathTracker (dens farvetone), HealthColors eller off. Delt med HealthColors.',
          effectsBy:
            'Hvem der afspiller skade- og helingseffekterne: DeathTracker, HealthColors eller off. Delt med HealthColors.',
          language: 'Sprog for menuer, beskeder og handouts.',
          hpBar: 'Bjælken, der indeholder livspoint (1, 2 eller 3).',
          bloodiedPercent:
            'Blødende ved eller under denne procentdel af de maksimale livspoint (0 slår Blødende fra).',
          bloodiedMarker: 'Markør for Blødende (none for ingen markør).',
          dyingMarker: 'Markør for en døende PC.',
          stableMarker: 'Markør for en stabil PC.',
          deadMarker: 'Markør for de døde.',
          pcDetection:
            'auto: styret af en spiller, eller arket siger PC; players: kun styret af en spiller.',
          deathSaves: 'Følg dødsredningsslag for PC’er på 0 livspoint.',
          resetSheetSaves:
            'Ryd arkets dødsredningsslag-felter, når en PC falder til 0, og når den heles, og vis dem på D&D 2024-arket.',
          successFields: 'Felter på arket, der krydses af for succeser (2014 og andre ark).',
          failureFields: 'Felter på arket, der krydses af for fiaskoer.',
          massiveDamage:
            'En PC, hvis bjælke kommer mindst sit maksimum under 0, dør med det samme.',
          announce:
            'Hvem får besked, når en PC går ned, bliver stabil, dør eller rejser sig: off, gm eller controllers.',
          deathLayer: 'Flyt de døde til: none, gmlayer eller map.',
          deathTurnOrder: 'keep (behold) eller remove (fjern) de døde fra turrækkefølgen.',
          deathActionsFor: 'npc: flytning og turrækkefølge gælder NPC’er; all: også PC’er.',
          tintPlayers: 'Farv PC’er fra grøn til rød, efterhånden som de mister livspoint.',
          tintNpcs: 'Farv NPC’er på samme måde.',
          hurtFx: 'Afspil en effekt, når en token mister livspoint.',
          hurtFxType: 'Den effekt, som type-farve (splatter-blood).',
          healFx: 'Afspil en effekt, når en token får livspoint.',
          healFxType: 'Den effekt (glow-holy).',
        },
      },
      api: {
        heading: 'Til Mod-forfattere',
        intro: 'DeathTracker udgiver et DeathTracker-objekt.',
        colFunction: 'Funktion',
        colDesc: 'Hvad den gør',
        rows: {
          check: 'Vurdér en token nu (efter at have ændret dens livspoint fra en Mod).',
          getStatus: 'En tokens status: healthy, bloodied, dying, stable, dead eller null.',
          onStatusChange: 'Få besked, når en status ændres ({token, status, previous, isPc}).',
          observe:
            'Version 0.1: få besked (token, prev), efter at DeathTracker har håndteret en ændring af livspoint.',
          managing:
            'True, når DeathTracker følger dødsredningsslag: de er slået til, og DeathTracker er valgt til at håndtere dem (HealthColors bruger dette).',
          ownersChanged:
            'Opdatér tokens, efter at det er ændret, hvem der håndterer hvad (HealthColors kalder dette).',
        },
      },
      upgrading: {
        heading: 'Opgradering fra 0.1',
        points: [
          'Dine indstillinger for markører, bjælke, farvetone og effekter overføres.',
          '!dead virker stadig, ligesom !dead config og !dead reset.',
          'Bevidstløs-markøren for PC’er er nu Døende-markøren.',
          'Det kræver ikke længere en genstart at skifte bjælke.',
        ],
      },
      troubleshooting: {
        heading: 'Fejlfinding',
        points: [
          'Der sker ingenting: tjek livspointbjælken under Indstillinger, og at bjælken indeholder et tal.',
          'En PC behandles som en NPC: vælg den, og tryk på Gør til PC, eller lad en spiller styre karakteren.',
          'En markør vises ikke: brug !deathtracker markers, og vælg et navn fra listen.',
          'Livspoint ændret af en anden Mod opfanges ikke: den Mod bør kalde DeathTracker.check(token).',
        ],
      },
      languages: {
        heading: 'Sprog',
        body: 'Vælg sproget med !deathtracker set language <code>.',
        colLanguage: 'Sprog',
        colNative: 'Eget navn',
        colCode: 'Kode',
      },
      credits: {
        heading: 'Tak til',
        original: 'Skrevet af',
        maintainer: 'Omskrevet til version 1.0 af',
        support: 'Har du fundet et problem eller fået en idé? Kontakt MidNiteShadow7 på Roll20.',
      },
    },
    errors: {
      gmOnly: 'Kun GM kan bruge den DeathTracker-kommando.',
      unknownCommand: 'DeathTracker har ingen kommando "{command}".',
      noTokens: 'Vælg en eller flere tokens først (eller tilføj --ids).',
      notYourToken: 'Du styrer ikke den token.',
      hint: 'Skriv !deathtracker help for at se listen over kommandoer.',
    },
  };

  var localeNl = {
    titles: {
      ready: 'DeathTracker is klaar.',
      menu: 'DeathTracker',
      status: 'DeathTracker-status',
      settings: 'DeathTracker-instellingen',
      help: 'DeathTracker-commando’s',
      announce: 'DeathTracker',
      markers: 'Tokenmarkeringen',
    },
    messages: {
      readyHint: 'Typ !deathtracker om het menu te openen.',
      migrated:
        'Je instellingen van DeathTracker 0.1 zijn overgenomen. !dead werkt nog; !deathtracker is het nieuwe commando.',
      healthColors:
        'HealthColors is geïnstalleerd: DeathTracker handelt doodsreddingsworpen en de markeringen Stervend, Stabiel en Dood af, en HealthColors de gezondheidskleuren en schade-/genezingseffecten. Wie wat doet, wijzig je in Instellingen.',
      healthColorsSaves:
        'HealthColors houdt ook doodsreddingsworpen bij en zet stervend-markeringen. Zet een van de twee uit (!aura deathsaves off) zodat ze niet om markeringen vechten.',
      settingChanged: '{setting} is nu {value}.',
      settingRejected: '"{value}" is geen geldige waarde voor {setting}.',
      unknownSetting: 'Er is geen instelling met de naam "{setting}".',
      markerUnknown:
        'Dit spel heeft geen markering "{marker}", dus die wordt niet getoond. Gebruik !deathtracker markers om de namen te zien die je kunt gebruiken.',
      checked: '{count} token(s) gecontroleerd.',
      cleared: 'DeathTracker-markeringen verwijderd van {count} token(s).',
      restored: '{count} token(s) teruggezet.',
      nothingToRestore: 'Geen van die tokens is door DeathTracker verplaatst.',
      roleSet: '{names}: {role}.',
      stabilised: 'Stabiel: {count}.',
      notDown: 'Geen van die tokens is een PC met 0 levenspunten.',
      synced: '{name}: {s} succes(sen), {f} mislukking(en).',
      macroCreated:
        'De tokenactie "{macro}" is gemaakt. Een speler selecteert zijn token en klikt erop na het gooien van een doodsreddingsworp.',
      journalRebuilt: 'De handouts "{help}" en "{deck}" zijn opnieuw opgebouwd.',
      resetDone: 'De instellingen staan weer op hun standaardwaarden.',
      restartNotNeeded: 'Geen herstart nodig: de nieuwe balk wordt vanaf nu gebruikt.',
    },
    status: {
      healthy: 'Gezond',
      bloodied: 'Bebloed',
      dying: 'Stervend',
      stable: 'Stabiel',
      dead: 'Dood',
      none: 'Niet gevolgd',
      pc: 'PC',
      npc: 'NPC',
      hp: 'LP {hp}/{max}',
      hpNoMax: 'LP {hp}',
      saves: 'Doodsreddingsworpen: {s} succes(sen), {f} mislukking(en)',
      unnamed: 'Een token',
      noneHere: 'Nog geen tokens met levenspunten op deze pagina.',
      page: 'Pagina: {page}',
      selected: 'Geselecteerde tokens',
      actions: 'Verplaatst bij overlijden',
    },
    announce: {
      dying: '{name} is neergegaan en stervende.',
      stable: '{name} is stabiel.',
      dead: '{name} is gestorven.',
      up: '{name} staat weer op de been.',
      savesHint: 'Doodsreddingsworpen die op het blad worden aangevinkt, worden meteen meegeteld.',
    },
    menu: {
      summary: 'Op deze pagina',
      down: 'Neergegane PC’s',
      noneDown: 'Er zijn geen PC’s neergegaan.',
      tools: 'Hulpmiddelen',
      sandbox: 'Mod-sandbox: {version}',
      sandboxUnknown: 'onbekend',
      hcNote: 'HealthColors is geïnstalleerd.',
    },
    buttons: {
      menu: 'Menu',
      status: 'Status',
      checkPage: 'Pagina controleren',
      check: 'Selectie controleren',
      settings: 'Instellingen',
      help: 'Help',
      stable: 'Stabiliseren',
      restore: 'Terugzetten',
      clear: 'Markeringen wissen',
      pc: 'Maak PC',
      npc: 'Maak NPC',
      auto: 'Automatisch bepalen',
      markers: 'Markeringen',
      macro: 'Doodsreddingsworp-macro maken',
      rebuild: 'Handouts opnieuw opbouwen',
      reset: 'Instellingen resetten',
      on: 'Aan',
      off: 'Uit',
      back: 'Terug',
    },
    prompts: {
      marker: 'Markering',
      percent: 'Bebloed op of onder (% van maximum)',
      fields: 'Veldnamen gescheiden door komma’s',
      fx: 'Effect (type-kleur)',
      language: 'Taal',
    },
    sections: {
      owners: 'Wie doet wat',
      hp: 'Levenspunten',
      markers: 'Markeringen',
      deathSaves: 'Doodsreddingsworpen (PC’s)',
      onDeath: 'Als een token sterft',
      looks: 'Kleuring en effecten',
      general: 'Algemeen',
    },
    settings: {
      deathSavesBy: 'Doodsreddingsworpen en markeringen bij 0 LP',
      coloursBy: 'Gezondheidskleuren',
      effectsBy: 'Schade- en genezingseffecten',
      language: 'Taal',
      hpBar: 'Levenspuntenbalk',
      bloodiedPercent: 'Bebloed op',
      bloodiedMarker: 'Markering Bebloed',
      dyingMarker: 'Markering Stervend',
      stableMarker: 'Markering Stabiel',
      deadMarker: 'Markering Dood',
      pcDetection: 'Wie is een PC',
      deathSaves: 'Doodsreddingsworpen bijhouden',
      resetSheetSaves: 'Vakjes op blad wissen',
      successFields: 'Succesvelden',
      failureFields: 'Mislukkingsvelden',
      massiveDamage: 'Enorme schade',
      announce: 'Aankondigen',
      deathLayer: 'Doden verplaatsen naar',
      deathTurnOrder: 'Beurtvolgorde',
      deathActionsFor: 'Geldt voor',
      tintPlayers: 'PC’s kleuren',
      tintNpcs: 'NPC’s kleuren',
      hurtFx: 'Schade-effect',
      hurtFxType: 'Type schade-effect',
      healFx: 'Genezingseffect',
      healFxType: 'Type genezingseffect',
    },
    choices: {
      hpBar: { 1: 'Balk 1', 2: 'Balk 2', 3: 'Balk 3' },
      pcDetection: { auto: 'Spelers of blad', players: 'Bestuurd door een speler' },
      deathLayer: { none: 'Blijven liggen', gmlayer: 'GM-laag', map: 'Kaartlaag' },
      deathTurnOrder: { keep: 'Behouden', remove: 'Verwijderen' },
      deathActionsFor: { npc: 'NPC’s', all: 'NPC’s en PC’s' },
      announce: { off: 'Uit', gm: 'GM', controllers: 'GM en spelers' },
      none: 'Geen',
      notInstalled: 'niet geïnstalleerd',
    },
    help: {
      menu: 'Open het menu.',
      status: 'Toon de status van de geselecteerde tokens, of van elk gevolgd token op je pagina.',
      check: 'Beoordeel de geselecteerde tokens opnieuw (all: elk token op je pagina).',
      stable: 'Markeer de geselecteerde PC’s met 0 levenspunten als stabiel.',
      clear:
        'Haal de markeringen en kleuring van DeathTracker van de geselecteerde tokens en vergeet ze.',
      restore:
        'Zet dode tokens die DeathTracker heeft verplaatst terug op hun laag en in de beurtvolgorde.',
      role: 'Behandel de personages van de geselecteerde tokens als PC’s of NPC’s, of laat DeathTracker beslissen.',
      markers: 'Toon de markeringen van dit spel, met de namen die je moet gebruiken.',
      macro:
        'Maak een tokenactie waarop spelers klikken om hun doodsreddingsworpen door te geven (voor bladen die DeathTracker niet kan lezen).',
      dsync: 'Verzonden door de doodsreddingsworp-macro.',
      settings: 'Open de instellingen.',
      set: 'Wijzig een instelling.',
      reset: 'Zet elke instelling terug op de standaardwaarde.',
      config: 'Commando’s van versie 0.1: open de instellingen, of wijzig er een (config bar|2).',
      journal: 'Bouw de handouts Help en Command Deck opnieuw op.',
      help: 'Toon deze lijst.',
      ids: 'Voeg --ids id1,id2 toe om tokens op ID te bewerken in plaats van de selectie.',
    },
    deck: {
      menuTitle: 'Menu',
      menuDesc: 'Het menu, de status, de instellingen en de help.',
      selectedTitle: 'Geselecteerde tokens',
      selectedDesc: 'Selecteer tokens op de kaart en druk dan op een knop.',
      roleTitle: 'PC of NPC',
      roleDesc: 'Voor de personages van de geselecteerde tokens.',
      toolsTitle: 'Hulpmiddelen',
      toolsDesc: 'Markeringen, de doodsreddingsworp-macro en deze handouts.',
      footer: 'De volledige handleiding staat in de handout "{help}".',
    },
    handout: {
      versionLabel: 'Versie',
      subtitle:
        'Bebloed, stervend, stabiel en dood, op basis van levenspunten en doodsreddingsworpen',
      footer: 'Knoppen voor elk commando staan in "{deck}".',
      overview: {
        heading: 'Overzicht',
        body: 'DeathTracker houdt de levenspuntenbalk van elk token in de gaten. Het markeert tokens die bebloed of dood zijn, houdt doodsreddingsworpen bij voor spelerpersonages met 0 levenspunten, en kan de doden van de kaart en uit de beurtvolgorde halen.',
      },
      quickStart: {
        heading: 'Snel aan de slag',
        steps: [
          'Zet de levenspunten in Balk 1 (of kies een andere balk in Instellingen).',
          'Breng een token schade toe: op de helft van zijn maximum krijgt het de markering Bebloed; op 0 krijgt een NPC de markering Dood.',
          'Een PC op 0 krijgt de markering Stervend. Vink doodsreddingsworpen aan op het blad: drie successen maken hem Stabiel, drie mislukkingen Dood.',
          'Genees hem boven 0 en de markeringen verdwijnen.',
          'Typ !deathtracker voor het menu.',
        ],
      },
      statuses: {
        heading: 'Statussen',
        points: [
          'Gezond: boven het Bebloed-deel van de maximale levenspunten (geen markering).',
          'Bebloed: op of onder dat deel (50% tenzij gewijzigd).',
          'Stervend: een PC met 0 levenspunten die doodsreddingsworpen doet.',
          'Stabiel: een PC op 0 met drie successen, of gestabiliseerd met het commando stable.',
          'Dood: een NPC op 0, een PC met drie mislukkingen, of een PC gedood door enorme schade.',
          'Een lege balk, of een balk zonder getal, wordt nooit als 0 gelezen.',
        ],
      },
      deathSaves: {
        heading: 'Doodsreddingsworpen',
        points: [
          'D&D 2024-blad: gelezen van het blad zodra vakjes worden aangevinkt of worpen worden gegooid.',
          'D&D 2014-blad en andere met selectievakjes: gelezen uit de succes- en mislukkingsvelden in Instellingen.',
          'Het blad bewaart oude vinkjes na genezing, dus worpen worden geteld vanaf het moment dat de PC naar 0 gaat. Met Vakjes op blad wissen aan wist DeathTracker de vakjes op het blad wanneer de PC naar 0 gaat en wanneer hij genezen wordt, en toont het de doodsreddingsworp-vakjes van het D&D 2024-blad wanneer een PC via de tokenbalk naar 0 gaat.',
          'Als het blad niet gelezen kan worden, maak dan de doodsreddingsworp-macro (!deathtracker macro): spelers selecteren hun token en klikken erop na elke worp.',
          'Wie is een PC: een token of personage dat door een speler wordt bestuurd, of (Spelers of blad) een waarvan het blad zegt dat het geen NPC is. Gebruik Maak PC / Maak NPC om het voor een personage te bepalen.',
        ],
      },
      onDeath: {
        heading: 'Als een token sterft',
        points: [
          'Verplaats de doden naar de GM-laag of de Kaartlaag, en haal ze uit de beurtvolgorde. Beide staan eerst uit.',
          'Geldt alleen voor NPC’s, tenzij ingesteld op NPC’s en PC’s.',
          'Een dood token genezen haalt zijn markeringen weg, maar verplaatst het niet terug. Selecteer het en gebruik Terugzetten (het komt terug in de beurtvolgorde met zijn initiatief).',
          'Enorme schade (eerst uit): een PC wiens balk minstens zijn maximum onder 0 zakt, sterft meteen. Het 2024-blad stopt bij 0, dus dit werkt alleen als de waarde onder 0 in de balk wordt getypt.',
        ],
      },
      healthColors: {
        heading: 'HealthColors en andere Mods',
        points: [
          'Wie doet wat, in Instellingen, bepaalt welke Mod doodsreddingsworpen (met de markeringen Stervend, Stabiel en Dood), gezondheidskleuren en schade-/genezingseffecten afhandelt: DeathTracker, HealthColors of Uit. HealthColors 2.5 en later toont dezelfde keuze, en een wijziging in de ene Mod geldt ook voor de andere.',
          'Eerst handelt DeathTracker de doodsreddingsworpen af en HealthColors de kleuren en effecten. Zonder HealthColors handelt DeathTracker alle drie af.',
          'HealthColors vóór 2.5 deelt de keuze niet: zet daar de doodsreddingsworpen uit met !aura deathsaves off.',
          'Wijzigingen door TokenMod worden opgemerkt. Andere Mods kunnen DeathTracker.check(token) aanroepen na het wijzigen van levenspunten.',
          'DeathTracker haalt alleen markeringen weg die het zelf heeft gezet.',
        ],
      },
      commands: {
        heading: 'Commando’s',
        intro:
          'Elk commando begint met !deathtracker (of !dt, of !dead uit versie 0.1). Alleen voor de GM, behalve de doodsreddingsworp-macro.',
        colCommand: 'Commando',
        colDesc: 'Wat het doet',
      },
      settings: {
        heading: 'Instellingen',
        intro:
          'Wijzig ze in het menu, met !deathtracker set <setting> <value>, of in de opties van de Mod-bibliotheek.',
        colKey: 'Instelling',
        colDesc: 'Wat het doet',
        rows: {
          deathSavesBy:
            'Wie doodsreddingsworpen bijhoudt en de markeringen Stervend, Stabiel en Dood zet: DeathTracker, HealthColors of off. Gedeeld met HealthColors.',
          coloursBy:
            'Wie tokens kleurt op basis van levenspunten: DeathTracker (zijn kleuring), HealthColors of off. Gedeeld met HealthColors.',
          effectsBy:
            'Wie de schade- en genezingseffecten afspeelt: DeathTracker, HealthColors of off. Gedeeld met HealthColors.',
          language: 'Taal van menu’s, berichten en handouts.',
          hpBar: 'De balk met de levenspunten (1, 2 of 3).',
          bloodiedPercent:
            'Bebloed op of onder dit percentage van de maximale levenspunten (0 zet Bebloed uit).',
          bloodiedMarker: 'Markering voor Bebloed (none voor geen markering).',
          dyingMarker: 'Markering voor een stervende PC.',
          stableMarker: 'Markering voor een stabiele PC.',
          deadMarker: 'Markering voor de doden.',
          pcDetection:
            'auto: bestuurd door een speler of het blad zegt PC; players: alleen bestuurd door een speler.',
          deathSaves: 'Houd doodsreddingsworpen bij voor PC’s met 0 levenspunten.',
          resetSheetSaves:
            'Wis de doodsreddingsworp-vakjes op het blad wanneer een PC naar 0 gaat en wanneer hij genezen wordt, en toon ze op het D&D 2024-blad.',
          successFields: 'Bladvelden die worden aangevinkt bij successen (2014 en andere bladen).',
          failureFields: 'Bladvelden die worden aangevinkt bij mislukkingen.',
          massiveDamage: 'Een PC wiens balk minstens zijn maximum onder 0 zakt, sterft meteen.',
          announce:
            'Wie het hoort wanneer een PC neergaat, stabiel wordt, sterft of opstaat: off, gm of controllers.',
          deathLayer: 'Verplaats de doden naar: none, gmlayer of map.',
          deathTurnOrder: 'keep (behouden) of remove (verwijderen) de doden uit de beurtvolgorde.',
          deathActionsFor:
            'npc: verplaatsen en beurtvolgorde gelden voor NPC’s; all: ook voor PC’s.',
          tintPlayers: 'Kleur PC’s van groen naar rood naarmate ze levenspunten verliezen.',
          tintNpcs: 'Kleur NPC’s op dezelfde manier.',
          hurtFx: 'Speel een effect af wanneer een token levenspunten verliest.',
          hurtFxType: 'Dat effect, als type-kleur (splatter-blood).',
          healFx: 'Speel een effect af wanneer een token levenspunten krijgt.',
          healFxType: 'Dat effect (glow-holy).',
        },
      },
      api: {
        heading: 'Voor Mod-auteurs',
        intro: 'DeathTracker publiceert een DeathTracker-object.',
        colFunction: 'Functie',
        colDesc: 'Wat het doet',
        rows: {
          check: 'Beoordeel een token nu (na het wijzigen van zijn levenspunten vanuit een Mod).',
          getStatus: 'De status van een token: healthy, bloodied, dying, stable, dead of null.',
          onStatusChange:
            'Krijg bericht wanneer een status verandert ({token, status, previous, isPc}).',
          observe:
            'Versie 0.1: krijg (token, prev) nadat DeathTracker een wijziging in levenspunten heeft afgehandeld.',
          managing:
            'True wanneer DeathTracker doodsreddingsworpen bijhoudt: ze staan aan en DeathTracker is gekozen om ze af te handelen (HealthColors gebruikt dit).',
          ownersChanged:
            'Werk tokens bij nadat is gewijzigd wie wat doet (HealthColors roept dit aan).',
        },
      },
      upgrading: {
        heading: 'Upgraden vanaf 0.1',
        points: [
          'Je instellingen voor markeringen, balk, kleuring en effecten worden overgenomen.',
          '!dead werkt nog, net als !dead config en !dead reset.',
          'De markering Bewusteloos voor PC’s is nu de markering Stervend.',
          'Voor het wijzigen van de balk is geen herstart meer nodig.',
        ],
      },
      troubleshooting: {
        heading: 'Problemen oplossen',
        points: [
          'Er gebeurt niets: controleer de levenspuntenbalk in Instellingen, en of de balk een getal bevat.',
          'Een PC wordt als NPC behandeld: selecteer hem en druk op Maak PC, of laat een speler het personage besturen.',
          'Een markering verschijnt niet: gebruik !deathtracker markers en kies een naam uit de lijst.',
          'Levenspunten gewijzigd door een andere Mod worden niet opgemerkt: die Mod moet DeathTracker.check(token) aanroepen.',
        ],
      },
      languages: {
        heading: 'Talen',
        body: 'Stel de taal in met !deathtracker set language <code>.',
        colLanguage: 'Taal',
        colNative: 'Eigen naam',
        colCode: 'Code',
      },
      credits: {
        heading: 'Met dank aan',
        original: 'Geschreven door',
        maintainer: 'Herschreven voor versie 1.0 door',
        support: 'Een probleem gevonden of een idee? Neem contact op met MidNiteShadow7 op Roll20.',
      },
    },
    errors: {
      gmOnly: 'Alleen de GM kan dat DeathTracker-commando gebruiken.',
      unknownCommand: 'DeathTracker heeft geen commando "{command}".',
      noTokens: 'Selecteer eerst een of meer tokens (of voeg --ids toe).',
      notYourToken: 'Je bestuurt dat token niet.',
      hint: 'Typ !deathtracker help voor de lijst met commando’s.',
    },
  };

  var localeEnUS = {
    titles: {
      ready: 'DeathTracker is ready.',
      menu: 'DeathTracker',
      status: 'DeathTracker Status',
      settings: 'DeathTracker Settings',
      help: 'DeathTracker Commands',
      announce: 'DeathTracker',
      markers: 'Token Markers',
    },
    messages: {
      readyHint: 'Type !deathtracker to open the menu.',
      migrated:
        'Your DeathTracker 0.1 settings were carried over. !dead still works; !deathtracker is the new command.',
      healthColors:
        'HealthColors is installed: DeathTracker handles death saves and the dying, stable and dead markers, and HealthColors the health colours and hurt/heal effects. Change who handles what in Settings.',
      healthColorsSaves:
        'HealthColors is also tracking death saves and setting dying markers. Turn one of them off (!aura deathsaves off) so they do not fight over markers.',
      settingChanged: '{setting} is now {value}.',
      settingRejected: '"{value}" is not a valid value for {setting}.',
      unknownSetting: 'There is no setting called "{setting}".',
      markerUnknown:
        'This game has no marker "{marker}", so it will not show. Use !deathtracker markers to see the names you can use.',
      checked: 'Checked {count} token(s).',
      cleared: 'Removed DeathTracker markers from {count} token(s).',
      restored: 'Put back {count} token(s).',
      nothingToRestore: 'None of those tokens were moved by DeathTracker.',
      roleSet: '{names}: {role}.',
      stabilised: 'Stable: {count}.',
      notDown: 'None of those tokens is a PC at 0 hit points.',
      synced: '{name}: {s} success(es), {f} failure(s).',
      macroCreated:
        'Made the token action "{macro}". A player selects their token and clicks it after rolling a death save.',
      journalRebuilt: 'The "{help}" and "{deck}" handouts have been rebuilt.',
      resetDone: 'Settings are back to their defaults.',
      restartNotNeeded: 'No restart needed: the new bar is used from now on.',
    },
    status: {
      healthy: 'Healthy',
      bloodied: 'Bloodied',
      dying: 'Dying',
      stable: 'Stable',
      dead: 'Dead',
      none: 'Not tracked',
      pc: 'PC',
      npc: 'NPC',
      hp: 'HP {hp}/{max}',
      hpNoMax: 'HP {hp}',
      saves: 'Death saves: {s} success(es), {f} failure(s)',
      unnamed: 'A token',
      noneHere: 'No tokens with hit points on this page yet.',
      page: 'Page: {page}',
      selected: 'Selected tokens',
      actions: 'Moved when it died',
    },
    announce: {
      dying: '{name} is down and dying.',
      stable: '{name} is stable.',
      dead: '{name} has died.',
      up: '{name} is back on their feet.',
      savesHint: 'Death saves ticked on the sheet are counted as they are made.',
    },
    menu: {
      summary: 'On this page',
      down: 'PCs down',
      noneDown: 'No PCs are down.',
      tools: 'Tools',
      sandbox: 'Mod sandbox: {version}',
      sandboxUnknown: 'unknown',
      hcNote: 'HealthColors is installed.',
    },
    buttons: {
      menu: 'Menu',
      status: 'Status',
      checkPage: 'Check page',
      check: 'Check selected',
      settings: 'Settings',
      help: 'Help',
      stable: 'Stabilise',
      restore: 'Restore',
      clear: 'Clear markers',
      pc: 'Make PC',
      npc: 'Make NPC',
      auto: 'Decide automatically',
      markers: 'Markers',
      macro: 'Make death save macro',
      rebuild: 'Rebuild handouts',
      reset: 'Reset settings',
      on: 'On',
      off: 'Off',
      back: 'Back',
    },
    prompts: {
      marker: 'Marker',
      percent: 'Bloodied at or below (% of maximum)',
      fields: 'Field names, separated by commas',
      fx: 'Effect (type-colour)',
      language: 'Language',
    },
    sections: {
      owners: 'Who handles what',
      hp: 'Hit points',
      markers: 'Markers',
      deathSaves: 'Death saves (PCs)',
      onDeath: 'When a token dies',
      looks: 'Tint and effects',
      general: 'General',
    },
    settings: {
      deathSavesBy: 'Death saves and 0 HP markers',
      coloursBy: 'Health colours',
      effectsBy: 'Hurt and heal effects',
      language: 'Language',
      hpBar: 'Hit point bar',
      bloodiedPercent: 'Bloodied at',
      bloodiedMarker: 'Bloodied marker',
      dyingMarker: 'Dying marker',
      stableMarker: 'Stable marker',
      deadMarker: 'Dead marker',
      pcDetection: 'Who is a PC',
      deathSaves: 'Track death saves',
      resetSheetSaves: 'Clear sheet boxes',
      successFields: 'Success fields',
      failureFields: 'Failure fields',
      massiveDamage: 'Massive damage',
      announce: 'Announce',
      deathLayer: 'Move the dead to',
      deathTurnOrder: 'Turn order',
      deathActionsFor: 'Applies to',
      tintPlayers: 'Tint PCs',
      tintNpcs: 'Tint NPCs',
      hurtFx: 'Hurt effect',
      hurtFxType: 'Hurt effect type',
      healFx: 'Heal effect',
      healFxType: 'Heal effect type',
    },
    choices: {
      hpBar: { 1: 'Bar 1', 2: 'Bar 2', 3: 'Bar 3' },
      pcDetection: { auto: 'Players or sheet', players: 'Controlled by a player' },
      deathLayer: { none: 'Stay put', gmlayer: 'GM layer', map: 'Map layer' },
      deathTurnOrder: { keep: 'Keep', remove: 'Remove' },
      deathActionsFor: { npc: 'NPCs', all: 'NPCs and PCs' },
      announce: { off: 'Off', gm: 'GM', controllers: 'GM and players' },
      none: 'None',
      notInstalled: 'not installed',
    },
    help: {
      menu: 'Open the menu.',
      status: 'Show the status of the selected tokens, or of every tracked token on your page.',
      check: 'Judge the selected tokens again (all: every token on your page).',
      stable: 'Mark the selected PCs at 0 hit points as stable.',
      clear: "Take DeathTracker's markers and tint off the selected tokens and forget them.",
      restore: 'Put dead tokens DeathTracker moved back on their layer and in the turn order.',
      role: "Treat the selected tokens' characters as PCs or NPCs, or let DeathTracker decide.",
      markers: 'List the markers this game has, with the names to use.',
      macro:
        'Make a token action players click to send their death saves (for sheets DeathTracker cannot read).',
      dsync: 'Sent by the death save macro.',
      settings: 'Open the settings.',
      set: 'Change a setting.',
      reset: 'Put every setting back to its default.',
      config: 'Version 0.1 commands: open the settings, or change one (config bar|2).',
      journal: 'Rebuild the Help and Command Deck handouts.',
      help: 'Show this list.',
      ids: 'Add --ids id1,id2 to work on tokens by ID instead of the selection.',
    },
    deck: {
      menuTitle: 'Menu',
      menuDesc: 'The menu, status, settings and help.',
      selectedTitle: 'Selected tokens',
      selectedDesc: 'Select tokens on the map, then press a button.',
      roleTitle: 'PC or NPC',
      roleDesc: "For the selected tokens' characters.",
      toolsTitle: 'Tools',
      toolsDesc: 'Markers, the death save macro and these handouts.',
      footer: 'The full guide is in the "{help}" handout.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Bloodied, dying, stable and dead, from hit points and death saves',
      footer: 'Buttons for every command are in "{deck}".',
      overview: {
        heading: 'Overview',
        body: 'DeathTracker watches the hit point bar of every token. It marks tokens that are bloodied or dead, tracks death saves for player characters at 0 hit points, and can move the dead off the map and out of the turn order.',
      },
      quickStart: {
        heading: 'Quick start',
        steps: [
          'Put hit points in Bar 1 (or choose another bar in Settings).',
          'Damage a token: at half its maximum it gets the Bloodied marker; at 0 an NPC gets the Dead marker.',
          'A PC at 0 gets the Dying marker. Tick death saves on the sheet: three successes make it Stable, three failures Dead.',
          'Heal it above 0 and the markers go away.',
          'Type !deathtracker for the menu.',
        ],
      },
      statuses: {
        heading: 'Statuses',
        points: [
          'Healthy: above the Bloodied share of maximum hit points (no marker).',
          'Bloodied: at or below that share (50% unless changed).',
          'Dying: a PC at 0 hit points who is making death saves.',
          'Stable: a PC at 0 with three successes, or stabilised with the stable command.',
          'Dead: an NPC at 0, a PC with three failures, or a PC killed by massive damage.',
          'An empty bar, or one that does not hold a number, is never read as 0.',
        ],
      },
      deathSaves: {
        heading: 'Death saves',
        points: [
          'D&D 2024 sheet: read from the sheet as boxes are ticked or saves rolled.',
          'D&D 2014 sheet and others with checkboxes: read from the success and failure fields in Settings.',
          "The sheet keeps old ticks after healing, so saves are counted from the moment the PC drops to 0. With Clear sheet boxes on, DeathTracker clears the sheet's boxes when the PC drops to 0 and when healed, and shows the D&D 2024 sheet's death save boxes when a PC drops to 0 from the token bar.",
          'If the sheet cannot be read, make the death save macro (!deathtracker macro): players select their token and click it after each save.',
          'Who is a PC: a token or character controlled by a player, or (Players or sheet) one whose sheet says it is not an NPC. Use Make PC / Make NPC to decide for a character.',
        ],
      },
      onDeath: {
        heading: 'When a token dies',
        points: [
          'Move the dead to the GM layer or the Map layer, and take them out of the turn order. Both are off at first.',
          'Applies to NPCs only, unless set to NPCs and PCs.',
          'Healing a dead token takes its markers away but does not move it back. Select it and use Restore (it goes back into the turn order with its initiative).',
          'Massive damage (off at first): a PC whose bar goes below 0 by at least its maximum dies outright. The 2024 sheet stops at 0, so this only works when the bar is typed below 0.',
        ],
      },
      healthColors: {
        heading: 'HealthColors and other Mods',
        points: [
          'Who handles what, in Settings, chooses which Mod does death saves (with the dying, stable and dead markers), health colours and hurt/heal effects: DeathTracker, HealthColors or Off. HealthColors 2.5 and later shows the same choice, and changing it in either Mod changes it for both.',
          'At first DeathTracker handles death saves and HealthColors the colours and effects. Without HealthColors, DeathTracker handles all three.',
          'HealthColors before 2.5 does not share the choice: turn its death saves off with !aura deathsaves off.',
          'Changes made by TokenMod are seen. Other Mods can call DeathTracker.check(token) after changing hit points.',
          'DeathTracker only takes away markers it put on itself.',
        ],
      },
      commands: {
        heading: 'Commands',
        intro:
          'Every command starts with !deathtracker (or !dt, or !dead from version 0.1). GM only, except the death save macro.',
        colCommand: 'Command',
        colDesc: 'What it does',
      },
      settings: {
        heading: 'Settings',
        intro:
          'Change them in the menu, with !deathtracker set <setting> <value>, or in the Mod Library options.',
        colKey: 'Setting',
        colDesc: 'What it does',
        rows: {
          deathSavesBy:
            'Who tracks death saves and sets the dying, stable and dead markers: DeathTracker, HealthColors or off. Shared with HealthColors.',
          coloursBy:
            'Who colours tokens by hit points: DeathTracker (its tint), HealthColors or off. Shared with HealthColors.',
          effectsBy:
            'Who plays the hurt and heal effects: DeathTracker, HealthColors or off. Shared with HealthColors.',
          language: 'Language of menus, messages and handouts.',
          hpBar: 'The bar that holds hit points (1, 2 or 3).',
          bloodiedPercent:
            'Bloodied at or below this percentage of maximum hit points (0 turns Bloodied off).',
          bloodiedMarker: 'Marker for Bloodied (none for no marker).',
          dyingMarker: 'Marker for a dying PC.',
          stableMarker: 'Marker for a stable PC.',
          deadMarker: 'Marker for the dead.',
          pcDetection:
            'auto: player-controlled or the sheet says PC; players: player-controlled only.',
          deathSaves: 'Track death saves for PCs at 0 hit points.',
          resetSheetSaves:
            "Clear the sheet's death save boxes when a PC drops to 0 and when healed, and show them on the D&D 2024 sheet.",
          successFields: 'Sheet fields ticked for successes (2014 and other sheets).',
          failureFields: 'Sheet fields ticked for failures.',
          massiveDamage: 'A PC whose bar goes below 0 by at least its maximum dies outright.',
          announce:
            'Who is told when a PC goes down, becomes stable, dies or gets up: off, gm or controllers.',
          deathLayer: 'Move the dead to: none, gmlayer or map.',
          deathTurnOrder: 'keep or remove the dead from the turn order.',
          deathActionsFor: 'npc: moving and turn order apply to NPCs; all: to PCs as well.',
          tintPlayers: 'Tint PCs from green to red as they lose hit points.',
          tintNpcs: 'Tint NPCs the same way.',
          hurtFx: 'Play an effect when a token loses hit points.',
          hurtFxType: 'That effect, as type-colour (splatter-blood).',
          healFx: 'Play an effect when a token gains hit points.',
          healFxType: 'That effect (glow-holy).',
        },
      },
      api: {
        heading: 'For Mod authors',
        intro: 'DeathTracker publishes a DeathTracker object.',
        colFunction: 'Function',
        colDesc: 'What it does',
        rows: {
          check: 'Judge a token now (after changing its hit points from a Mod).',
          getStatus: "A token's status: healthy, bloodied, dying, stable, dead or null.",
          onStatusChange: 'Be told when a status changes ({token, status, previous, isPc}).',
          observe:
            'Version 0.1: be told (token, prev) after DeathTracker handles a hit point change.',
          managing:
            'True when DeathTracker is tracking death saves: they are on, and DeathTracker is chosen to handle them (HealthColors uses this).',
          ownersChanged:
            'Bring tokens up to date after who handles what changed (HealthColors calls this).',
        },
      },
      upgrading: {
        heading: 'Upgrading from 0.1',
        points: [
          'Your markers, bar, tint and effect settings are carried over.',
          '!dead still works, as do !dead config and !dead reset.',
          'The Unconscious marker for PCs is now the Dying marker.',
          'Changing the bar no longer needs a restart.',
        ],
      },
      troubleshooting: {
        heading: 'Troubleshooting',
        points: [
          'Nothing happens: check the hit point bar in Settings, and that the bar holds a number.',
          'A PC is treated as an NPC: select it and press Make PC, or let a player control the character.',
          'A marker does not show: use !deathtracker markers and pick a name from the list.',
          'Hit points changed by another Mod are not seen: that Mod should call DeathTracker.check(token).',
        ],
      },
      languages: {
        heading: 'Languages',
        body: 'Set the language with !deathtracker set language <code>.',
        colLanguage: 'Language',
        colNative: 'Native name',
        colCode: 'Code',
      },
      credits: {
        heading: 'Credits',
        original: 'Written by',
        maintainer: 'Rewritten for version 1.0 by',
        support: 'Found a problem or have an idea? Contact MidNiteShadow7 on Roll20.',
      },
    },
    errors: {
      gmOnly: 'Only the GM can use that DeathTracker command.',
      unknownCommand: 'DeathTracker has no command "{command}".',
      noTokens: 'Select one or more tokens first (or add --ids).',
      notYourToken: 'You do not control that token.',
      hint: 'Type !deathtracker help for the list of commands.',
    },
  };

  var localeFi = {
    titles: {
      ready: 'DeathTracker on valmis.',
      menu: 'DeathTracker',
      status: 'DeathTracker – tila',
      settings: 'DeathTracker – asetukset',
      help: 'DeathTracker – komennot',
      announce: 'DeathTracker',
      markers: 'Nappuloiden merkit',
    },
    messages: {
      readyHint: 'Kirjoita !deathtracker avataksesi valikon.',
      migrated:
        'DeathTracker 0.1:n asetuksesi siirrettiin. !dead toimii yhä; !deathtracker on uusi komento.',
      healthColors:
        'HealthColors on asennettu: DeathTracker hoitaa kuolemanpelastusheitot sekä kuolevan, vakaan ja kuolleen merkit, ja HealthColors terveysvärit sekä vahinko- ja parannustehosteet. Muuta sitä, kuka hoitaa mitä, Asetuksista.',
      healthColorsSaves:
        'Myös HealthColors seuraa kuolemanpelastusheittoja ja asettaa kuolevan merkkejä. Kytke toinen niistä pois (!aura deathsaves off), jotta ne eivät kiistele merkeistä.',
      settingChanged: '{setting} on nyt {value}.',
      settingRejected: '"{value}" ei ole kelvollinen arvo asetukselle {setting}.',
      unknownSetting: 'Asetusta nimeltä "{setting}" ei ole.',
      markerUnknown:
        'Tässä pelissä ei ole merkkiä "{marker}", joten se ei näy. Käytä komentoa !deathtracker markers nähdäksesi käytettävät nimet.',
      checked: 'Tarkistettu {count} nappula(a).',
      cleared: 'DeathTrackerin merkit poistettu {count} nappulasta.',
      restored: 'Palautettu {count} nappula(a).',
      nothingToRestore: 'DeathTracker ei ole siirtänyt yhtäkään näistä nappuloista.',
      roleSet: '{names}: {role}.',
      stabilised: 'Vakaita: {count}.',
      notDown: 'Yksikään näistä nappuloista ei ole PH, jolla on 0 osumapistettä.',
      synced: '{name}: {s} onnistumista, {f} epäonnistumista.',
      macroCreated:
        'Tehtiin nappulatoiminto "{macro}". Pelaaja valitsee nappulansa ja napsauttaa sitä heitettyään kuolemanpelastusheiton.',
      journalRebuilt: 'Monisteet "{help}" ja "{deck}" on rakennettu uudelleen.',
      resetDone: 'Asetukset on palautettu oletuksiin.',
      restartNotNeeded: 'Uudelleenkäynnistystä ei tarvita: uutta palkkia käytetään tästä lähtien.',
    },
    status: {
      healthy: 'Terve',
      bloodied: 'Verinen',
      dying: 'Kuoleva',
      stable: 'Vakaa',
      dead: 'Kuollut',
      none: 'Ei seurannassa',
      pc: 'PH',
      npc: 'EPH',
      hp: 'OP {hp}/{max}',
      hpNoMax: 'OP {hp}',
      saves: 'Kuolemanpelastusheitot: {s} onnistumista, {f} epäonnistumista',
      unnamed: 'Nappula',
      noneHere: 'Tällä sivulla ei vielä ole nappuloita, joilla on osumapisteitä.',
      page: 'Sivu: {page}',
      selected: 'Valitut nappulat',
      actions: 'Siirretty kuollessaan',
    },
    announce: {
      dying: '{name} on kaatunut ja kuolemassa.',
      stable: '{name} on vakaa.',
      dead: '{name} on kuollut.',
      up: '{name} on taas jaloillaan.',
      savesHint:
        'Lomakkeeseen rastitetut kuolemanpelastusheitot lasketaan sitä mukaa kuin niitä tehdään.',
    },
    menu: {
      summary: 'Tällä sivulla',
      down: 'Kaatuneet PH:t',
      noneDown: 'Yksikään PH ei ole kaatunut.',
      tools: 'Työkalut',
      sandbox: 'Mod-hiekkalaatikko: {version}',
      sandboxUnknown: 'tuntematon',
      hcNote: 'HealthColors on asennettu.',
    },
    buttons: {
      menu: 'Valikko',
      status: 'Tila',
      checkPage: 'Tarkista sivu',
      check: 'Tarkista valitut',
      settings: 'Asetukset',
      help: 'Ohje',
      stable: 'Vakauta',
      restore: 'Palauta',
      clear: 'Poista merkit',
      pc: 'Tee PH:ksi',
      npc: 'Tee EPH:ksi',
      auto: 'Päätä automaattisesti',
      markers: 'Merkit',
      macro: 'Tee kuolemanpelastusmakro',
      rebuild: 'Rakenna monisteet uudelleen',
      reset: 'Palauta asetukset',
      on: 'Päällä',
      off: 'Pois',
      back: 'Takaisin',
    },
    prompts: {
      marker: 'Merkki',
      percent: 'Verinen kun enintään (% maksimista)',
      fields: 'Kenttien nimet pilkuilla erotettuina',
      fx: 'Tehoste (tyyppi-väri)',
      language: 'Kieli',
    },
    sections: {
      owners: 'Kuka hoitaa mitä',
      hp: 'Osumapisteet',
      markers: 'Merkit',
      deathSaves: 'Kuolemanpelastusheitot (PH)',
      onDeath: 'Kun nappula kuolee',
      looks: 'Sävytys ja tehosteet',
      general: 'Yleiset',
    },
    settings: {
      deathSavesBy: 'Pelastusheitot ja 0 OP:n merkit',
      coloursBy: 'Terveysvärit',
      effectsBy: 'Vahinko- ja parannustehosteet',
      language: 'Kieli',
      hpBar: 'Osumapistepalkki',
      bloodiedPercent: 'Verinen kun',
      bloodiedMarker: 'Verisen merkki',
      dyingMarker: 'Kuolevan merkki',
      stableMarker: 'Vakaan merkki',
      deadMarker: 'Kuolleen merkki',
      pcDetection: 'Kuka on PH',
      deathSaves: 'Seuraa kuolemanpelastusheittoja',
      resetSheetSaves: 'Tyhjennä lomakkeen ruudut',
      successFields: 'Onnistumiskentät',
      failureFields: 'Epäonnistumiskentät',
      massiveDamage: 'Valtava vahinko',
      announce: 'Ilmoita',
      deathLayer: 'Siirrä kuolleet',
      deathTurnOrder: 'Vuorojärjestys',
      deathActionsFor: 'Koskee',
      tintPlayers: 'Sävytä PH:t',
      tintNpcs: 'Sävytä EPH:t',
      hurtFx: 'Vahinkotehoste',
      hurtFxType: 'Vahinkotehosteen tyyppi',
      healFx: 'Parannustehoste',
      healFxType: 'Parannustehosteen tyyppi',
    },
    choices: {
      hpBar: { 1: 'Palkki 1', 2: 'Palkki 2', 3: 'Palkki 3' },
      pcDetection: { auto: 'Pelaajat tai lomake', players: 'Pelaajan ohjaama' },
      deathLayer: { none: 'Pysyy paikallaan', gmlayer: 'PJ-taso', map: 'Karttataso' },
      deathTurnOrder: { keep: 'Pidä', remove: 'Poista' },
      deathActionsFor: { npc: 'EPH:t', all: 'EPH:t ja PH:t' },
      announce: { off: 'Pois', gm: 'PJ', controllers: 'PJ ja pelaajat' },
      none: 'Ei mitään',
      notInstalled: 'ei asennettu',
    },
    help: {
      menu: 'Avaa valikko.',
      status: 'Näytä valittujen nappuloiden tila tai kaikkien sivusi seurattujen nappuloiden tila.',
      check: 'Arvioi valitut nappulat uudelleen (all: kaikki sivusi nappulat).',
      stable: 'Merkitse valitut PH:t, joilla on 0 osumapistettä, vakaiksi.',
      clear: 'Poista DeathTrackerin merkit ja sävytys valituista nappuloista ja unohda ne.',
      restore:
        'Palauta DeathTrackerin siirtämät kuolleet nappulat omalle tasolleen ja vuorojärjestykseen.',
      role: 'Kohtele valittujen nappuloiden hahmoja PH:inä tai EPH:inä, tai anna DeathTrackerin päättää.',
      markers: 'Luettele tämän pelin merkit ja niissä käytettävät nimet.',
      macro:
        'Tee nappulatoiminto, jota pelaajat napsauttavat lähettääkseen kuolemanpelastusheittonsa (lomakkeille, joita DeathTracker ei osaa lukea).',
      dsync: 'Kuolemanpelastusmakron lähettämä.',
      settings: 'Avaa asetukset.',
      set: 'Muuta asetusta.',
      reset: 'Palauta kaikki asetukset oletuksiin.',
      config: 'Version 0.1 komennot: avaa asetukset tai muuta yhtä (config bar|2).',
      journal: 'Rakenna monisteet Help ja Command Deck uudelleen.',
      help: 'Näytä tämä luettelo.',
      ids: 'Lisää --ids id1,id2 käsitelläksesi nappuloita tunnisteen mukaan valinnan sijaan.',
    },
    deck: {
      menuTitle: 'Valikko',
      menuDesc: 'Valikko, tila, asetukset ja ohje.',
      selectedTitle: 'Valitut nappulat',
      selectedDesc: 'Valitse nappulat kartalta ja paina sitten painiketta.',
      roleTitle: 'PH vai EPH',
      roleDesc: 'Valittujen nappuloiden hahmoille.',
      toolsTitle: 'Työkalut',
      toolsDesc: 'Merkit, kuolemanpelastusmakro ja nämä monisteet.',
      footer: 'Koko opas on monisteessa "{help}".',
    },
    handout: {
      versionLabel: 'Versio',
      subtitle: 'Verinen, kuoleva, vakaa ja kuollut osumapisteistä ja kuolemanpelastusheitoista',
      footer: 'Painikkeet kaikille komennoille ovat monisteessa "{deck}".',
      overview: {
        heading: 'Yleiskatsaus',
        body: 'DeathTracker tarkkailee jokaisen nappulan osumapistepalkkia. Se merkitsee veriset ja kuolleet nappulat, seuraa kuolemanpelastusheittoja pelaajahahmoille, joilla on 0 osumapistettä, ja voi siirtää kuolleet pois kartalta ja vuorojärjestyksestä.',
      },
      quickStart: {
        heading: 'Pikaopas',
        steps: [
          'Laita osumapisteet palkkiin 1 (tai valitse toinen palkki Asetuksista).',
          'Vahingoita nappulaa: puolessa maksimistaan se saa Verisen merkin; nollassa EPH saa Kuolleen merkin.',
          'Nollassa oleva PH saa Kuolevan merkin. Rastita kuolemanpelastusheitot lomakkeeseen: kolme onnistumista tekee siitä Vakaan, kolme epäonnistumista Kuolleen.',
          'Paranna se yli nollan, niin merkit katoavat.',
          'Kirjoita !deathtracker avataksesi valikon.',
        ],
      },
      statuses: {
        heading: 'Tilat',
        points: [
          'Terve: yli Verisen rajan maksimiosumapisteistä (ei merkkiä).',
          'Verinen: rajalla tai sen alla (50 %, ellei muutettu).',
          'Kuoleva: PH, jolla on 0 osumapistettä ja joka heittää kuolemanpelastusheittoja.',
          'Vakaa: nollassa oleva PH, jolla on kolme onnistumista tai joka on vakautettu stable-komennolla.',
          'Kuollut: nollassa oleva EPH, PH, jolla on kolme epäonnistumista, tai valtavan vahingon tappama PH.',
          'Tyhjää palkkia tai palkkia, jossa ei ole lukua, ei koskaan lueta nollaksi.',
        ],
      },
      deathSaves: {
        heading: 'Kuolemanpelastusheitot',
        points: [
          'D&D 2024 -lomake: luetaan lomakkeelta, kun ruutuja rastitetaan tai heittoja heitetään.',
          'D&D 2014 -lomake ja muut valintaruudulliset: luetaan Asetusten onnistumis- ja epäonnistumiskentistä.',
          'Lomake säilyttää vanhat rastit parantamisen jälkeen, joten heitot lasketaan siitä hetkestä, kun PH putoaa nollaan. Kun Tyhjennä lomakkeen ruudut on päällä, DeathTracker tyhjentää lomakkeen ruudut, kun PH putoaa nollaan ja kun se paranee, ja näyttää D&D 2024 -lomakkeen kuolemanpelastusruudut, kun PH putoaa nollaan nappulan palkista.',
          'Jos lomaketta ei voi lukea, tee kuolemanpelastusmakro (!deathtracker macro): pelaajat valitsevat nappulansa ja napsauttavat sitä jokaisen heiton jälkeen.',
          'Kuka on PH: pelaajan ohjaama nappula tai hahmo, tai (Pelaajat tai lomake) sellainen, jonka lomakkeen mukaan se ei ole EPH. Käytä painikkeita Tee PH:ksi / Tee EPH:ksi päättääksesi hahmon puolesta.',
        ],
      },
      onDeath: {
        heading: 'Kun nappula kuolee',
        points: [
          'Siirrä kuolleet PJ-tasolle tai karttatasolle ja poista ne vuorojärjestyksestä. Molemmat ovat aluksi pois päältä.',
          'Koskee vain EPH:ita, ellei asetuksena ole EPH:t ja PH:t.',
          'Kuolleen nappulan parantaminen poistaa sen merkit mutta ei siirrä sitä takaisin. Valitse se ja käytä Palauta (se palaa vuorojärjestykseen aloitteensa kanssa).',
          'Valtava vahinko (aluksi pois päältä): PH, jonka palkki menee alle nollan vähintään maksiminsa verran, kuolee välittömästi. 2024-lomake pysähtyy nollaan, joten tämä toimii vain, kun palkkiin kirjoitetaan arvo alle nollan.',
        ],
      },
      healthColors: {
        heading: 'HealthColors ja muut Modit',
        points: [
          'Asetusten kohdassa Kuka hoitaa mitä valitaan, mikä Mod hoitaa kuolemanpelastusheitot (kuolevan, vakaan ja kuolleen merkkeineen), terveysvärit sekä vahinko- ja parannustehosteet: DeathTracker, HealthColors tai Pois. HealthColors 2.5 ja uudemmat näyttävät saman valinnan, ja sen muuttaminen kummassa tahansa Modissa muuttaa sen molemmissa.',
          'Aluksi DeathTracker hoitaa kuolemanpelastusheitot ja HealthColors värit ja tehosteet. Ilman HealthColorsia DeathTracker hoitaa kaikki kolme.',
          'HealthColorsin 2.5:tä vanhemmat versiot eivät jaa valintaa: kytke niiden kuolemanpelastusheitot pois komennolla !aura deathsaves off.',
          'TokenModin tekemät muutokset huomataan. Muut Modit voivat kutsua DeathTracker.check(token) muutettuaan osumapisteitä.',
          'DeathTracker poistaa vain merkit, jotka se on itse asettanut.',
        ],
      },
      commands: {
        heading: 'Komennot',
        intro:
          'Jokainen komento alkaa !deathtracker (tai !dt, tai !dead versiosta 0.1). Vain PJ:lle, paitsi kuolemanpelastusmakro.',
        colCommand: 'Komento',
        colDesc: 'Mitä se tekee',
      },
      settings: {
        heading: 'Asetukset',
        intro:
          'Muuta niitä valikossa, komennolla !deathtracker set <asetus> <arvo> tai Mod-kirjaston asetuksissa.',
        colKey: 'Asetus',
        colDesc: 'Mitä se tekee',
        rows: {
          deathSavesBy:
            'Kuka seuraa kuolemanpelastusheittoja ja asettaa kuolevan, vakaan ja kuolleen merkit: DeathTracker, HealthColors tai off. Yhteinen HealthColorsin kanssa.',
          coloursBy:
            'Kuka värittää nappulat osumapisteiden mukaan: DeathTracker (sen sävytys), HealthColors tai off. Yhteinen HealthColorsin kanssa.',
          effectsBy:
            'Kuka toistaa vahinko- ja parannustehosteet: DeathTracker, HealthColors tai off. Yhteinen HealthColorsin kanssa.',
          language: 'Valikoiden, viestien ja monisteiden kieli.',
          hpBar: 'Palkki, jossa osumapisteet ovat (1, 2 tai 3).',
          bloodiedPercent:
            'Verinen, kun osumapisteet ovat enintään tämä prosentti maksimista (0 kytkee Verisen pois).',
          bloodiedMarker: 'Verisen merkki (none = ei merkkiä).',
          dyingMarker: 'Kuolevan PH:n merkki.',
          stableMarker: 'Vakaan PH:n merkki.',
          deadMarker: 'Kuolleiden merkki.',
          pcDetection:
            'auto: pelaajan ohjaama tai lomakkeen mukaan PH; players: vain pelaajan ohjaama.',
          deathSaves: 'Seuraa kuolemanpelastusheittoja PH:ille, joilla on 0 osumapistettä.',
          resetSheetSaves:
            'Tyhjennä lomakkeen kuolemanpelastusruudut, kun PH putoaa nollaan ja kun se paranee, ja näytä ne D&D 2024 -lomakkeella.',
          successFields:
            'Lomakkeen kentät, jotka rastitetaan onnistumisista (2014 ja muut lomakkeet).',
          failureFields: 'Lomakkeen kentät, jotka rastitetaan epäonnistumisista.',
          massiveDamage:
            'PH, jonka palkki menee alle nollan vähintään maksiminsa verran, kuolee välittömästi.',
          announce:
            'Kenelle kerrotaan, kun PH kaatuu, vakautuu, kuolee tai nousee: off, gm tai controllers.',
          deathLayer: 'Minne kuolleet siirretään: none, gmlayer tai map.',
          deathTurnOrder: 'keep tai remove kuolleet vuorojärjestyksessä.',
          deathActionsFor: 'npc: siirto ja vuorojärjestys koskevat EPH:ita; all: myös PH:ita.',
          tintPlayers: 'Sävytä PH:t vihreästä punaiseen, kun ne menettävät osumapisteitä.',
          tintNpcs: 'Sävytä EPH:t samalla tavalla.',
          hurtFx: 'Toista tehoste, kun nappula menettää osumapisteitä.',
          hurtFxType: 'Se tehoste muodossa tyyppi-väri (splatter-blood).',
          healFx: 'Toista tehoste, kun nappula saa osumapisteitä.',
          healFxType: 'Se tehoste (glow-holy).',
        },
      },
      api: {
        heading: 'Modien tekijöille',
        intro: 'DeathTracker julkaisee DeathTracker-olion.',
        colFunction: 'Funktio',
        colDesc: 'Mitä se tekee',
        rows: {
          check: 'Arvioi nappula nyt (kun olet muuttanut sen osumapisteitä Modista).',
          getStatus: 'Nappulan tila: healthy, bloodied, dying, stable, dead tai null.',
          onStatusChange: 'Saa tieto, kun tila muuttuu ({token, status, previous, isPc}).',
          observe:
            'Versio 0.1: saa tieto (token, prev), kun DeathTracker on käsitellyt osumapisteiden muutoksen.',
          managing:
            'True, kun DeathTracker seuraa kuolemanpelastusheittoja: ne ovat päällä, ja DeathTracker on valittu hoitamaan ne (HealthColors käyttää tätä).',
          ownersChanged:
            'Päivitä nappulat, kun valinta siitä, kuka hoitaa mitä, on muuttunut (HealthColors kutsuu tätä).',
        },
      },
      upgrading: {
        heading: 'Päivitys versiosta 0.1',
        points: [
          'Merkki-, palkki-, sävytys- ja tehosteasetuksesi siirretään.',
          '!dead toimii yhä, samoin !dead config ja !dead reset.',
          'PH:iden Unconscious-merkki on nyt Kuolevan merkki.',
          'Palkin vaihtaminen ei enää vaadi uudelleenkäynnistystä.',
        ],
      },
      troubleshooting: {
        heading: 'Vianetsintä',
        points: [
          'Mitään ei tapahdu: tarkista osumapistepalkki Asetuksista ja että palkissa on luku.',
          'PH:ta kohdellaan EPH:na: valitse se ja paina Tee PH:ksi, tai anna pelaajan ohjata hahmoa.',
          'Merkki ei näy: käytä komentoa !deathtracker markers ja valitse nimi luettelosta.',
          'Toisen Modin muuttamia osumapisteitä ei huomata: sen Modin pitäisi kutsua DeathTracker.check(token).',
        ],
      },
      languages: {
        heading: 'Kielet',
        body: 'Aseta kieli komennolla !deathtracker set language <koodi>.',
        colLanguage: 'Kieli',
        colNative: 'Oma nimi',
        colCode: 'Koodi',
      },
      credits: {
        heading: 'Tekijät',
        original: 'Kirjoittanut',
        maintainer: 'Versioon 1.0 uudelleenkirjoittanut',
        support:
          'Löysitkö ongelman tai onko sinulla idea? Ota yhteyttä MidNiteShadow7:ään Roll20:ssä.',
      },
    },
    errors: {
      gmOnly: 'Vain PJ voi käyttää tuota DeathTracker-komentoa.',
      unknownCommand: 'DeathTrackerilla ei ole komentoa "{command}".',
      noTokens: 'Valitse ensin yksi tai useampi nappula (tai lisää --ids).',
      notYourToken: 'Et ohjaa tuota nappulaa.',
      hint: 'Kirjoita !deathtracker help nähdäksesi komentoluettelon.',
    },
  };

  var localeFr = {
    titles: {
      ready: 'DeathTracker est prêt.',
      menu: 'DeathTracker',
      status: 'État DeathTracker',
      settings: 'Paramètres DeathTracker',
      help: 'Commandes DeathTracker',
      announce: 'DeathTracker',
      markers: 'Marqueurs de token',
    },
    messages: {
      readyHint: 'Tapez !deathtracker pour ouvrir le menu.',
      migrated:
        'Vos paramètres de DeathTracker 0.1 ont été repris. !dead fonctionne toujours ; !deathtracker est la nouvelle commande.',
      healthColors:
        'HealthColors est installé : DeathTracker gère les jets contre la mort et les marqueurs Mourant, Stable et Mort, et HealthColors les couleurs de santé et les effets de blessure et de soin. Changez qui gère quoi dans les Paramètres.',
      healthColorsSaves:
        'HealthColors suit aussi les jets de sauvegarde contre la mort et pose des marqueurs Mourant. Désactivez l’un des deux (!aura deathsaves off) pour qu’ils ne se disputent pas les marqueurs.',
      settingChanged: '{setting} vaut maintenant {value}.',
      settingRejected: '« {value} » n’est pas une valeur valide pour {setting}.',
      unknownSetting: 'Il n’y a pas de paramètre nommé « {setting} ».',
      markerUnknown:
        'Cette partie n’a pas de marqueur « {marker} », il ne s’affichera donc pas. Utilisez !deathtracker markers pour voir les noms utilisables.',
      checked: '{count} token(s) vérifié(s).',
      cleared: 'Marqueurs DeathTracker retirés de {count} token(s).',
      restored: '{count} token(s) remis en place.',
      nothingToRestore: 'Aucun de ces tokens n’a été déplacé par DeathTracker.',
      roleSet: '{names} : {role}.',
      stabilised: 'Stables : {count}.',
      notDown: 'Aucun de ces tokens n’est un PJ à 0 point de vie.',
      synced: '{name} : {s} réussite(s), {f} échec(s).',
      macroCreated:
        'L’action de token « {macro} » a été créée. Un joueur sélectionne son token et clique dessus après avoir lancé un jet de sauvegarde contre la mort.',
      journalRebuilt: 'Les handouts « {help} » et « {deck} » ont été reconstruits.',
      resetDone: 'Les paramètres sont revenus à leurs valeurs par défaut.',
      restartNotNeeded: 'Pas besoin de redémarrer : la nouvelle barre est utilisée dès maintenant.',
    },
    status: {
      healthy: 'En bonne santé',
      bloodied: 'Ensanglanté',
      dying: 'Mourant',
      stable: 'Stable',
      dead: 'Mort',
      none: 'Non suivi',
      pc: 'PJ',
      npc: 'PNJ',
      hp: 'PV {hp}/{max}',
      hpNoMax: 'PV {hp}',
      saves: 'Jets contre la mort : {s} réussite(s), {f} échec(s)',
      unnamed: 'Un token',
      noneHere: 'Aucun token avec des points de vie sur cette page pour l’instant.',
      page: 'Page : {page}',
      selected: 'Tokens sélectionnés',
      actions: 'Déplacé à sa mort',
    },
    announce: {
      dying: '{name} est à terre et mourant.',
      stable: '{name} est stable.',
      dead: '{name} est mort.',
      up: '{name} est de nouveau sur pied.',
      savesHint:
        'Les jets de sauvegarde contre la mort cochés sur la fiche sont comptés au fur et à mesure.',
    },
    menu: {
      summary: 'Sur cette page',
      down: 'PJ à terre',
      noneDown: 'Aucun PJ n’est à terre.',
      tools: 'Outils',
      sandbox: 'Sandbox des Mods : {version}',
      sandboxUnknown: 'inconnue',
      hcNote: 'HealthColors est installé.',
    },
    buttons: {
      menu: 'Menu',
      status: 'État',
      checkPage: 'Vérifier la page',
      check: 'Vérifier la sélection',
      settings: 'Paramètres',
      help: 'Aide',
      stable: 'Stabiliser',
      restore: 'Remettre en place',
      clear: 'Retirer les marqueurs',
      pc: 'Faire un PJ',
      npc: 'Faire un PNJ',
      auto: 'Décider automatiquement',
      markers: 'Marqueurs',
      macro: 'Créer la macro de jet contre la mort',
      rebuild: 'Reconstruire les handouts',
      reset: 'Réinitialiser les paramètres',
      on: 'Activé',
      off: 'Désactivé',
      back: 'Retour',
    },
    prompts: {
      marker: 'Marqueur',
      percent: 'Ensanglanté à ou sous (% du maximum)',
      fields: 'Noms des champs séparés par des virgules',
      fx: 'Effet (type-couleur)',
      language: 'Langue',
    },
    sections: {
      owners: 'Qui gère quoi',
      hp: 'Points de vie',
      markers: 'Marqueurs',
      deathSaves: 'Jets de sauvegarde contre la mort (PJ)',
      onDeath: 'Quand un token meurt',
      looks: 'Teinte et effets',
      general: 'Général',
    },
    settings: {
      deathSavesBy: 'Jets contre la mort et marqueurs à 0 PV',
      coloursBy: 'Couleurs de santé',
      effectsBy: 'Effets de blessure et de soin',
      language: 'Langue',
      hpBar: 'Barre des points de vie',
      bloodiedPercent: 'Ensanglanté à',
      bloodiedMarker: 'Marqueur Ensanglanté',
      dyingMarker: 'Marqueur Mourant',
      stableMarker: 'Marqueur Stable',
      deadMarker: 'Marqueur Mort',
      pcDetection: 'Qui est un PJ',
      deathSaves: 'Suivre les jets contre la mort',
      resetSheetSaves: 'Vider les cases de la fiche',
      successFields: 'Champs de réussite',
      failureFields: 'Champs d’échec',
      massiveDamage: 'Dégâts massifs',
      announce: 'Annoncer',
      deathLayer: 'Déplacer les morts vers',
      deathTurnOrder: 'Ordre de tour',
      deathActionsFor: 'S’applique à',
      tintPlayers: 'Teinter les PJ',
      tintNpcs: 'Teinter les PNJ',
      hurtFx: 'Effet de blessure',
      hurtFxType: 'Type d’effet de blessure',
      healFx: 'Effet de soin',
      healFxType: 'Type d’effet de soin',
    },
    choices: {
      hpBar: { 1: 'Barre 1', 2: 'Barre 2', 3: 'Barre 3' },
      pcDetection: { auto: 'Joueurs ou fiche', players: 'Contrôlé par un joueur' },
      deathLayer: { none: 'Ne bouge pas', gmlayer: 'Calque MJ', map: 'Calque Carte' },
      deathTurnOrder: { keep: 'Garder', remove: 'Retirer' },
      deathActionsFor: { npc: 'PNJ', all: 'PNJ et PJ' },
      announce: { off: 'Désactivé', gm: 'MJ', controllers: 'MJ et joueurs' },
      none: 'Aucun',
      notInstalled: 'non installé',
    },
    help: {
      menu: 'Ouvrir le menu.',
      status: 'Afficher l’état des tokens sélectionnés, ou de chaque token suivi sur votre page.',
      check: 'Réévaluer les tokens sélectionnés (all : chaque token de votre page).',
      stable: 'Marquer comme stables les PJ sélectionnés à 0 point de vie.',
      clear:
        'Retirer les marqueurs et la teinte de DeathTracker des tokens sélectionnés et les oublier.',
      restore:
        'Remettre les tokens morts déplacés par DeathTracker sur leur calque et dans l’ordre de tour.',
      role: 'Traiter les personnages des tokens sélectionnés comme PJ ou PNJ, ou laisser DeathTracker décider.',
      markers: 'Lister les marqueurs de cette partie, avec les noms à utiliser.',
      macro:
        'Créer une action de token sur laquelle les joueurs cliquent pour envoyer leurs jets contre la mort (pour les fiches que DeathTracker ne sait pas lire).',
      dsync: 'Envoyé par la macro de jet contre la mort.',
      settings: 'Ouvrir les paramètres.',
      set: 'Modifier un paramètre.',
      reset: 'Remettre chaque paramètre à sa valeur par défaut.',
      config:
        'Commandes de la version 0.1 : ouvrir les paramètres, ou en modifier un (config bar|2).',
      journal: 'Reconstruire les handouts Aide et Command Deck.',
      help: 'Afficher cette liste.',
      ids: 'Ajoutez --ids id1,id2 pour agir sur des tokens par ID au lieu de la sélection.',
    },
    deck: {
      menuTitle: 'Menu',
      menuDesc: 'Le menu, l’état, les paramètres et l’aide.',
      selectedTitle: 'Tokens sélectionnés',
      selectedDesc: 'Sélectionnez des tokens sur la carte, puis appuyez sur un bouton.',
      roleTitle: 'PJ ou PNJ',
      roleDesc: 'Pour les personnages des tokens sélectionnés.',
      toolsTitle: 'Outils',
      toolsDesc: 'Les marqueurs, la macro de jet contre la mort et ces handouts.',
      footer: 'Le guide complet se trouve dans le handout « {help} ».',
    },
    handout: {
      versionLabel: 'Version',
      subtitle:
        'Ensanglanté, mourant, stable et mort, d’après les points de vie et les jets contre la mort',
      footer: 'Des boutons pour chaque commande se trouvent dans « {deck} ».',
      overview: {
        heading: 'Présentation',
        body: 'DeathTracker surveille la barre des points de vie de chaque token. Il marque les tokens ensanglantés ou morts, suit les jets de sauvegarde contre la mort des personnages joueurs à 0 point de vie, et peut retirer les morts de la carte et de l’ordre de tour.',
      },
      quickStart: {
        heading: 'Démarrage rapide',
        steps: [
          'Mettez les points de vie dans la Barre 1 (ou choisissez une autre barre dans les Paramètres).',
          'Infligez des dégâts à un token : à la moitié de son maximum, il reçoit le marqueur Ensanglanté ; à 0, un PNJ reçoit le marqueur Mort.',
          'Un PJ à 0 reçoit le marqueur Mourant. Cochez les jets contre la mort sur la fiche : trois réussites le rendent Stable, trois échecs Mort.',
          'Soignez-le au-dessus de 0 et les marqueurs disparaissent.',
          'Tapez !deathtracker pour le menu.',
        ],
      },
      statuses: {
        heading: 'États',
        points: [
          'En bonne santé : au-dessus de la part Ensanglanté des points de vie maximum (aucun marqueur).',
          'Ensanglanté : à cette part ou en dessous (50 % sauf modification).',
          'Mourant : un PJ à 0 point de vie qui fait des jets de sauvegarde contre la mort.',
          'Stable : un PJ à 0 avec trois réussites, ou stabilisé avec la commande stable.',
          'Mort : un PNJ à 0, un PJ avec trois échecs, ou un PJ tué par des dégâts massifs.',
          'Une barre vide, ou qui ne contient pas un nombre, n’est jamais lue comme 0.',
        ],
      },
      deathSaves: {
        heading: 'Jets de sauvegarde contre la mort',
        points: [
          'Fiche D&D 2024 : lue sur la fiche quand les cases sont cochées ou les jets lancés.',
          'Fiche D&D 2014 et autres fiches à cases : lue dans les champs de réussite et d’échec des Paramètres.',
          'La fiche garde les anciennes coches après les soins, donc les jets sont comptés à partir du moment où le PJ tombe à 0. Avec Vider les cases de la fiche activé, DeathTracker vide les cases de la fiche quand le PJ tombe à 0 et quand il est soigné, et affiche les cases de jets contre la mort de la fiche D&D 2024 quand un PJ tombe à 0 depuis la barre du token.',
          'Si la fiche ne peut pas être lue, créez la macro de jet contre la mort (!deathtracker macro) : les joueurs sélectionnent leur token et cliquent dessus après chaque jet.',
          'Qui est un PJ : un token ou un personnage contrôlé par un joueur, ou (Joueurs ou fiche) un personnage dont la fiche indique qu’il n’est pas un PNJ. Utilisez Faire un PJ / Faire un PNJ pour décider pour un personnage.',
        ],
      },
      onDeath: {
        heading: 'Quand un token meurt',
        points: [
          'Déplacer les morts vers le calque MJ ou le calque Carte, et les retirer de l’ordre de tour. Les deux sont désactivés au départ.',
          'S’applique aux PNJ seulement, sauf si réglé sur PNJ et PJ.',
          'Soigner un token mort retire ses marqueurs mais ne le remet pas en place. Sélectionnez-le et utilisez Remettre en place (il revient dans l’ordre de tour avec son initiative).',
          'Dégâts massifs (désactivé au départ) : un PJ dont la barre descend sous 0 d’au moins son maximum meurt sur le coup. La fiche 2024 s’arrête à 0, donc cela ne fonctionne que si la barre est saisie sous 0.',
        ],
      },
      healthColors: {
        heading: 'HealthColors et autres Mods',
        points: [
          'Qui gère quoi, dans les Paramètres, choisit quel Mod s’occupe des jets contre la mort (avec les marqueurs Mourant, Stable et Mort), des couleurs de santé et des effets de blessure et de soin : DeathTracker, HealthColors ou Désactivé. À partir de la version 2.5, HealthColors affiche le même choix, et le modifier dans l’un des deux Mods le modifie pour les deux.',
          'Au départ, DeathTracker gère les jets contre la mort et HealthColors les couleurs et les effets. Sans HealthColors, DeathTracker gère les trois.',
          'Les versions de HealthColors antérieures à 2.5 ne partagent pas ce choix : désactivez leurs jets contre la mort avec !aura deathsaves off.',
          'Les modifications faites par TokenMod sont vues. Les autres Mods peuvent appeler DeathTracker.check(token) après avoir modifié des points de vie.',
          'DeathTracker ne retire que les marqueurs qu’il a posés lui-même.',
        ],
      },
      commands: {
        heading: 'Commandes',
        intro:
          'Chaque commande commence par !deathtracker (ou !dt, ou !dead de la version 0.1). Réservé au MJ, sauf la macro de jet contre la mort.',
        colCommand: 'Commande',
        colDesc: 'Ce qu’elle fait',
      },
      settings: {
        heading: 'Paramètres',
        intro:
          'Modifiez-les dans le menu, avec !deathtracker set <setting> <value>, ou dans les options de la bibliothèque de Mods.',
        colKey: 'Paramètre',
        colDesc: 'Ce qu’il fait',
        rows: {
          deathSavesBy:
            'Qui suit les jets contre la mort et pose les marqueurs Mourant, Stable et Mort : DeathTracker, HealthColors ou off. Partagé avec HealthColors.',
          coloursBy:
            'Qui colore les tokens selon leurs points de vie : DeathTracker (sa teinte), HealthColors ou off. Partagé avec HealthColors.',
          effectsBy:
            'Qui joue les effets de blessure et de soin : DeathTracker, HealthColors ou off. Partagé avec HealthColors.',
          language: 'Langue des menus, des messages et des handouts.',
          hpBar: 'La barre qui contient les points de vie (1, 2 ou 3).',
          bloodiedPercent:
            'Ensanglanté à ou sous ce pourcentage des points de vie maximum (0 désactive Ensanglanté).',
          bloodiedMarker: 'Marqueur pour Ensanglanté (none pour aucun marqueur).',
          dyingMarker: 'Marqueur pour un PJ mourant.',
          stableMarker: 'Marqueur pour un PJ stable.',
          deadMarker: 'Marqueur pour les morts.',
          pcDetection:
            'auto : contrôlé par un joueur ou la fiche indique PJ ; players : contrôlé par un joueur seulement.',
          deathSaves: 'Suivre les jets de sauvegarde contre la mort des PJ à 0 point de vie.',
          resetSheetSaves:
            'Vider les cases de jets contre la mort de la fiche quand un PJ tombe à 0 et quand il est soigné, et les afficher sur la fiche D&D 2024.',
          successFields: 'Champs de la fiche cochés pour les réussites (2014 et autres fiches).',
          failureFields: 'Champs de la fiche cochés pour les échecs.',
          massiveDamage:
            'Un PJ dont la barre descend sous 0 d’au moins son maximum meurt sur le coup.',
          announce:
            'Qui est prévenu quand un PJ tombe, devient stable, meurt ou se relève : off, gm ou controllers.',
          deathLayer: 'Déplacer les morts vers : none, gmlayer ou map.',
          deathTurnOrder: 'Garder (keep) ou retirer (remove) les morts de l’ordre de tour.',
          deathActionsFor:
            'npc : le déplacement et l’ordre de tour s’appliquent aux PNJ ; all : aussi aux PJ.',
          tintPlayers: 'Teinter les PJ du vert au rouge à mesure qu’ils perdent des points de vie.',
          tintNpcs: 'Teinter les PNJ de la même façon.',
          hurtFx: 'Jouer un effet quand un token perd des points de vie.',
          hurtFxType: 'Cet effet, sous la forme type-couleur (splatter-blood).',
          healFx: 'Jouer un effet quand un token gagne des points de vie.',
          healFxType: 'Cet effet (glow-holy).',
        },
      },
      api: {
        heading: 'Pour les auteurs de Mods',
        intro: 'DeathTracker publie un objet DeathTracker.',
        colFunction: 'Fonction',
        colDesc: 'Ce qu’elle fait',
        rows: {
          check:
            'Évaluer un token tout de suite (après avoir modifié ses points de vie depuis un Mod).',
          getStatus: 'L’état d’un token : healthy, bloodied, dying, stable, dead ou null.',
          onStatusChange: 'Être prévenu quand un état change ({token, status, previous, isPc}).',
          observe:
            'Version 0.1 : être prévenu (token, prev) après que DeathTracker a traité un changement de points de vie.',
          managing:
            'True quand DeathTracker suit les jets contre la mort : ils sont activés et DeathTracker est choisi pour les gérer (HealthColors l’utilise).',
          ownersChanged:
            'Mettre les tokens à jour après un changement de qui gère quoi (HealthColors l’appelle).',
        },
      },
      upgrading: {
        heading: 'Mise à niveau depuis 0.1',
        points: [
          'Vos paramètres de marqueurs, de barre, de teinte et d’effets sont repris.',
          '!dead fonctionne toujours, tout comme !dead config et !dead reset.',
          'Le marqueur Inconscient des PJ est maintenant le marqueur Mourant.',
          'Changer de barre ne demande plus de redémarrage.',
        ],
      },
      troubleshooting: {
        heading: 'Dépannage',
        points: [
          'Rien ne se passe : vérifiez la barre des points de vie dans les Paramètres, et que la barre contient un nombre.',
          'Un PJ est traité comme un PNJ : sélectionnez-le et appuyez sur Faire un PJ, ou laissez un joueur contrôler le personnage.',
          'Un marqueur ne s’affiche pas : utilisez !deathtracker markers et choisissez un nom dans la liste.',
          'Les points de vie modifiés par un autre Mod ne sont pas vus : ce Mod doit appeler DeathTracker.check(token).',
        ],
      },
      languages: {
        heading: 'Langues',
        body: 'Choisissez la langue avec !deathtracker set language <code>.',
        colLanguage: 'Langue',
        colNative: 'Nom natif',
        colCode: 'Code',
      },
      credits: {
        heading: 'Crédits',
        original: 'Écrit par',
        maintainer: 'Réécrit pour la version 1.0 par',
        support: 'Un problème ou une idée ? Contactez MidNiteShadow7 sur Roll20.',
      },
    },
    errors: {
      gmOnly: 'Seul le MJ peut utiliser cette commande DeathTracker.',
      unknownCommand: 'DeathTracker n’a pas de commande « {command} ».',
      noTokens: 'Sélectionnez d’abord un ou plusieurs tokens (ou ajoutez --ids).',
      notYourToken: 'Vous ne contrôlez pas ce token.',
      hint: 'Tapez !deathtracker help pour la liste des commandes.',
    },
  };

  var localeDe = {
    titles: {
      ready: 'DeathTracker ist bereit.',
      menu: 'DeathTracker',
      status: 'DeathTracker-Status',
      settings: 'DeathTracker-Einstellungen',
      help: 'DeathTracker-Befehle',
      announce: 'DeathTracker',
      markers: 'Token-Marker',
    },
    messages: {
      readyHint: 'Gib !deathtracker ein, um das Menü zu öffnen.',
      migrated:
        'Deine Einstellungen aus DeathTracker 0.1 wurden übernommen. !dead funktioniert weiterhin; !deathtracker ist der neue Befehl.',
      healthColors:
        'HealthColors ist installiert: DeathTracker übernimmt Todesrettungswürfe und die Sterbend-, Stabil- und Tot-Marker, HealthColors die Gesundheitsfarben und Schadens-/Heileffekte. Wer was übernimmt, änderst du in den Einstellungen.',
      healthColorsSaves:
        'HealthColors verfolgt ebenfalls Todesrettungswürfe und setzt Sterbend-Marker. Schalte eines davon aus (!aura deathsaves off), damit sie sich nicht um die Marker streiten.',
      settingChanged: '{setting} ist jetzt {value}.',
      settingRejected: '„{value}“ ist kein gültiger Wert für {setting}.',
      unknownSetting: 'Es gibt keine Einstellung namens „{setting}“.',
      markerUnknown:
        'Dieses Spiel hat keinen Marker „{marker}“, daher wird er nicht angezeigt. Mit !deathtracker markers siehst du die Namen, die du verwenden kannst.',
      checked: '{count} Token geprüft.',
      cleared: 'DeathTracker-Marker von {count} Token entfernt.',
      restored: '{count} Token zurückgesetzt.',
      nothingToRestore: 'Keiner dieser Token wurde von DeathTracker verschoben.',
      roleSet: '{names}: {role}.',
      stabilised: 'Stabil: {count}.',
      notDown: 'Keiner dieser Token ist ein SC mit 0 Trefferpunkten.',
      synced: '{name}: {s} Erfolg(e), {f} Fehlschlag/Fehlschläge.',
      macroCreated:
        'Die Token-Aktion „{macro}“ wurde erstellt. Ein Spieler wählt seinen Token aus und klickt sie nach einem Todesrettungswurf an.',
      journalRebuilt: 'Die Handouts „{help}“ und „{deck}“ wurden neu erstellt.',
      resetDone: 'Die Einstellungen sind wieder auf ihren Standardwerten.',
      restartNotNeeded: 'Kein Neustart nötig: Die neue Leiste wird ab sofort verwendet.',
    },
    status: {
      healthy: 'Gesund',
      bloodied: 'Angeschlagen',
      dying: 'Sterbend',
      stable: 'Stabil',
      dead: 'Tot',
      none: 'Nicht verfolgt',
      pc: 'SC',
      npc: 'NSC',
      hp: 'TP {hp}/{max}',
      hpNoMax: 'TP {hp}',
      saves: 'Todesrettungswürfe: {s} Erfolg(e), {f} Fehlschlag/Fehlschläge',
      unnamed: 'Ein Token',
      noneHere: 'Auf dieser Seite gibt es noch keine Token mit Trefferpunkten.',
      page: 'Seite: {page}',
      selected: 'Ausgewählte Token',
      actions: 'Beim Tod verschoben',
    },
    announce: {
      dying: '{name} ist zu Boden gegangen und liegt im Sterben.',
      stable: '{name} ist stabil.',
      dead: '{name} ist gestorben.',
      up: '{name} steht wieder auf den Beinen.',
      savesHint:
        'Auf dem Bogen angekreuzte Todesrettungswürfe werden gezählt, sobald sie gemacht werden.',
    },
    menu: {
      summary: 'Auf dieser Seite',
      down: 'SC am Boden',
      noneDown: 'Kein SC ist am Boden.',
      tools: 'Werkzeuge',
      sandbox: 'Mod-Sandbox: {version}',
      sandboxUnknown: 'unbekannt',
      hcNote: 'HealthColors ist installiert.',
    },
    buttons: {
      menu: 'Menü',
      status: 'Status',
      checkPage: 'Seite prüfen',
      check: 'Auswahl prüfen',
      settings: 'Einstellungen',
      help: 'Hilfe',
      stable: 'Stabilisieren',
      restore: 'Zurücksetzen',
      clear: 'Marker entfernen',
      pc: 'Zum SC machen',
      npc: 'Zum NSC machen',
      auto: 'Automatisch entscheiden',
      markers: 'Marker',
      macro: 'Todesrettungswurf-Makro erstellen',
      rebuild: 'Handouts neu erstellen',
      reset: 'Einstellungen zurücksetzen',
      on: 'An',
      off: 'Aus',
      back: 'Zurück',
    },
    prompts: {
      marker: 'Marker',
      percent: 'Angeschlagen bei oder unter (% des Maximums)',
      fields: 'Feldnamen durch Kommas getrennt',
      fx: 'Effekt (Typ-Farbe)',
      language: 'Sprache',
    },
    sections: {
      owners: 'Wer übernimmt was',
      hp: 'Trefferpunkte',
      markers: 'Marker',
      deathSaves: 'Todesrettungswürfe (SC)',
      onDeath: 'Wenn ein Token stirbt',
      looks: 'Tönung und Effekte',
      general: 'Allgemein',
    },
    settings: {
      deathSavesBy: 'Todesrettungswürfe und 0-TP-Marker',
      coloursBy: 'Gesundheitsfarben',
      effectsBy: 'Schadens- und Heileffekte',
      language: 'Sprache',
      hpBar: 'Trefferpunkte-Leiste',
      bloodiedPercent: 'Angeschlagen bei',
      bloodiedMarker: 'Angeschlagen-Marker',
      dyingMarker: 'Sterbend-Marker',
      stableMarker: 'Stabil-Marker',
      deadMarker: 'Tot-Marker',
      pcDetection: 'Wer ist ein SC',
      deathSaves: 'Todesrettungswürfe verfolgen',
      resetSheetSaves: 'Kästchen auf dem Bogen leeren',
      successFields: 'Erfolgsfelder',
      failureFields: 'Fehlschlagfelder',
      massiveDamage: 'Massiver Schaden',
      announce: 'Ankündigen',
      deathLayer: 'Tote verschieben nach',
      deathTurnOrder: 'Zugreihenfolge',
      deathActionsFor: 'Gilt für',
      tintPlayers: 'SC tönen',
      tintNpcs: 'NSC tönen',
      hurtFx: 'Schadenseffekt',
      hurtFxType: 'Art des Schadenseffekts',
      healFx: 'Heileffekt',
      healFxType: 'Art des Heileffekts',
    },
    choices: {
      hpBar: { 1: 'Leiste 1', 2: 'Leiste 2', 3: 'Leiste 3' },
      pcDetection: { auto: 'Spieler oder Bogen', players: 'Von einem Spieler gesteuert' },
      deathLayer: { none: 'Bleibt liegen', gmlayer: 'SL-Ebene', map: 'Kartenebene' },
      deathTurnOrder: { keep: 'Behalten', remove: 'Entfernen' },
      deathActionsFor: { npc: 'NSC', all: 'NSC und SC' },
      announce: { off: 'Aus', gm: 'SL', controllers: 'SL und Spieler' },
      none: 'Keiner',
      notInstalled: 'nicht installiert',
    },
    help: {
      menu: 'Das Menü öffnen.',
      status:
        'Den Status der ausgewählten Token zeigen, oder jedes verfolgten Tokens auf deiner Seite.',
      check: 'Die ausgewählten Token neu beurteilen (all: jeden Token auf deiner Seite).',
      stable: 'Die ausgewählten SC mit 0 Trefferpunkten als stabil markieren.',
      clear:
        'Die Marker und die Tönung von DeathTracker von den ausgewählten Token nehmen und sie vergessen.',
      restore:
        'Tote Token, die DeathTracker verschoben hat, zurück auf ihre Ebene und in die Zugreihenfolge setzen.',
      role: 'Die Charaktere der ausgewählten Token als SC oder NSC behandeln, oder DeathTracker entscheiden lassen.',
      markers: 'Die Marker dieses Spiels mit den zu verwendenden Namen auflisten.',
      macro:
        'Eine Token-Aktion erstellen, die Spieler anklicken, um ihre Todesrettungswürfe zu senden (für Bögen, die DeathTracker nicht lesen kann).',
      dsync: 'Wird vom Todesrettungswurf-Makro gesendet.',
      settings: 'Die Einstellungen öffnen.',
      set: 'Eine Einstellung ändern.',
      reset: 'Jede Einstellung auf ihren Standardwert zurücksetzen.',
      config: 'Befehle aus Version 0.1: die Einstellungen öffnen oder eine ändern (config bar|2).',
      journal: 'Die Handouts Hilfe und Command Deck neu erstellen.',
      help: 'Diese Liste zeigen.',
      ids: 'Füge --ids id1,id2 hinzu, um statt der Auswahl mit Token nach ID zu arbeiten.',
    },
    deck: {
      menuTitle: 'Menü',
      menuDesc: 'Menü, Status, Einstellungen und Hilfe.',
      selectedTitle: 'Ausgewählte Token',
      selectedDesc: 'Wähle Token auf der Karte aus und drücke dann eine Schaltfläche.',
      roleTitle: 'SC oder NSC',
      roleDesc: 'Für die Charaktere der ausgewählten Token.',
      toolsTitle: 'Werkzeuge',
      toolsDesc: 'Marker, das Todesrettungswurf-Makro und diese Handouts.',
      footer: 'Die vollständige Anleitung steht im Handout „{help}“.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle:
        'Angeschlagen, sterbend, stabil und tot, aus Trefferpunkten und Todesrettungswürfen',
      footer: 'Schaltflächen für jeden Befehl gibt es in „{deck}“.',
      overview: {
        heading: 'Überblick',
        body: 'DeathTracker beobachtet die Trefferpunkte-Leiste jedes Tokens. Es markiert Token, die angeschlagen oder tot sind, verfolgt Todesrettungswürfe für Spielercharaktere mit 0 Trefferpunkten und kann Tote von der Karte und aus der Zugreihenfolge nehmen.',
      },
      quickStart: {
        heading: 'Schnellstart',
        steps: [
          'Trage die Trefferpunkte in Leiste 1 ein (oder wähle in den Einstellungen eine andere Leiste).',
          'Füge einem Token Schaden zu: bei der Hälfte seines Maximums bekommt er den Angeschlagen-Marker; bei 0 bekommt ein NSC den Tot-Marker.',
          'Ein SC bei 0 bekommt den Sterbend-Marker. Kreuze Todesrettungswürfe auf dem Bogen an: drei Erfolge machen ihn stabil, drei Fehlschläge tot.',
          'Heile ihn über 0 und die Marker verschwinden.',
          'Gib !deathtracker für das Menü ein.',
        ],
      },
      statuses: {
        heading: 'Zustände',
        points: [
          'Gesund: über dem Angeschlagen-Anteil der maximalen Trefferpunkte (kein Marker).',
          'Angeschlagen: bei oder unter diesem Anteil (50 %, sofern nicht geändert).',
          'Sterbend: ein SC mit 0 Trefferpunkten, der Todesrettungswürfe macht.',
          'Stabil: ein SC bei 0 mit drei Erfolgen, oder mit dem Befehl stable stabilisiert.',
          'Tot: ein NSC bei 0, ein SC mit drei Fehlschlägen oder ein SC, der durch massiven Schaden getötet wurde.',
          'Eine leere Leiste oder eine, die keine Zahl enthält, wird nie als 0 gelesen.',
        ],
      },
      deathSaves: {
        heading: 'Todesrettungswürfe',
        points: [
          'D&D-2024-Bogen: wird vom Bogen gelesen, wenn Kästchen angekreuzt oder Würfe gewürfelt werden.',
          'D&D-2014-Bogen und andere mit Kontrollkästchen: wird aus den Erfolgs- und Fehlschlagfeldern in den Einstellungen gelesen.',
          'Der Bogen behält alte Kreuze nach der Heilung, daher werden Würfe ab dem Moment gezählt, in dem der SC auf 0 fällt. Mit Kästchen auf dem Bogen leeren leert DeathTracker die Kästchen des Bogens, wenn der SC auf 0 fällt und wenn er geheilt wird, und zeigt die Todesrettungswurf-Kästchen des D&D-2024-Bogens, wenn ein SC über die Token-Leiste auf 0 fällt.',
          'Wenn der Bogen nicht gelesen werden kann, erstelle das Todesrettungswurf-Makro (!deathtracker macro): Spieler wählen ihren Token aus und klicken es nach jedem Wurf an.',
          'Wer ist ein SC: ein Token oder Charakter, den ein Spieler steuert, oder (Spieler oder Bogen) einer, dessen Bogen sagt, dass er kein NSC ist. Mit Zum SC machen / Zum NSC machen entscheidest du für einen Charakter.',
        ],
      },
      onDeath: {
        heading: 'Wenn ein Token stirbt',
        points: [
          'Tote auf die SL-Ebene oder die Kartenebene verschieben und aus der Zugreihenfolge nehmen. Beides ist anfangs aus.',
          'Gilt nur für NSC, außer es ist auf NSC und SC gestellt.',
          'Einen toten Token zu heilen, nimmt seine Marker weg, verschiebt ihn aber nicht zurück. Wähle ihn aus und nutze Zurücksetzen (er kommt mit seiner Initiative zurück in die Zugreihenfolge).',
          'Massiver Schaden (anfangs aus): ein SC, dessen Leiste um mindestens sein Maximum unter 0 fällt, stirbt sofort. Der 2024-Bogen hört bei 0 auf, daher funktioniert das nur, wenn die Leiste unter 0 eingetippt wird.',
        ],
      },
      healthColors: {
        heading: 'HealthColors und andere Mods',
        points: [
          '„Wer übernimmt was“ in den Einstellungen legt fest, welcher Mod Todesrettungswürfe (mit den Sterbend-, Stabil- und Tot-Markern), Gesundheitsfarben und Schadens-/Heileffekte übernimmt: DeathTracker, HealthColors oder Aus. HealthColors ab 2.5 zeigt dieselbe Auswahl, und eine Änderung in einem der beiden Mods gilt für beide.',
          'Anfangs übernimmt DeathTracker die Todesrettungswürfe und HealthColors die Farben und Effekte. Ohne HealthColors übernimmt DeathTracker alle drei.',
          'HealthColors vor 2.5 teilt die Auswahl nicht: schalte seine Todesrettungswürfe mit !aura deathsaves off aus.',
          'Änderungen durch TokenMod werden erkannt. Andere Mods können DeathTracker.check(token) aufrufen, nachdem sie Trefferpunkte geändert haben.',
          'DeathTracker entfernt nur Marker, die es selbst gesetzt hat.',
        ],
      },
      commands: {
        heading: 'Befehle',
        intro:
          'Jeder Befehl beginnt mit !deathtracker (oder !dt, oder !dead aus Version 0.1). Nur für den SL, außer dem Todesrettungswurf-Makro.',
        colCommand: 'Befehl',
        colDesc: 'Was er tut',
      },
      settings: {
        heading: 'Einstellungen',
        intro:
          'Ändere sie im Menü, mit !deathtracker set <setting> <value> oder in den Optionen der Mod-Bibliothek.',
        colKey: 'Einstellung',
        colDesc: 'Was sie tut',
        rows: {
          deathSavesBy:
            'Wer Todesrettungswürfe verfolgt und die Sterbend-, Stabil- und Tot-Marker setzt: DeathTracker, HealthColors oder off. Mit HealthColors geteilt.',
          coloursBy:
            'Wer Tokens nach Trefferpunkten färbt: DeathTracker (seine Tönung), HealthColors oder off. Mit HealthColors geteilt.',
          effectsBy:
            'Wer die Schadens- und Heileffekte abspielt: DeathTracker, HealthColors oder off. Mit HealthColors geteilt.',
          language: 'Sprache der Menüs, Nachrichten und Handouts.',
          hpBar: 'Die Leiste mit den Trefferpunkten (1, 2 oder 3).',
          bloodiedPercent:
            'Angeschlagen bei oder unter diesem Prozentsatz der maximalen Trefferpunkte (0 schaltet Angeschlagen aus).',
          bloodiedMarker: 'Marker für Angeschlagen (none für keinen Marker).',
          dyingMarker: 'Marker für einen sterbenden SC.',
          stableMarker: 'Marker für einen stabilen SC.',
          deadMarker: 'Marker für die Toten.',
          pcDetection:
            'auto: von einem Spieler gesteuert oder der Bogen sagt SC; players: nur von einem Spieler gesteuert.',
          deathSaves: 'Todesrettungswürfe für SC mit 0 Trefferpunkten verfolgen.',
          resetSheetSaves:
            'Die Todesrettungswurf-Kästchen des Bogens leeren, wenn ein SC auf 0 fällt und wenn er geheilt wird, und sie auf dem D&D-2024-Bogen zeigen.',
          successFields: 'Bogenfelder, die für Erfolge angekreuzt werden (2014 und andere Bögen).',
          failureFields: 'Bogenfelder, die für Fehlschläge angekreuzt werden.',
          massiveDamage:
            'Ein SC, dessen Leiste um mindestens sein Maximum unter 0 fällt, stirbt sofort.',
          announce:
            'Wer benachrichtigt wird, wenn ein SC zu Boden geht, stabil wird, stirbt oder aufsteht: off, gm oder controllers.',
          deathLayer: 'Tote verschieben nach: none, gmlayer oder map.',
          deathTurnOrder:
            'Tote in der Zugreihenfolge behalten (keep) oder daraus entfernen (remove).',
          deathActionsFor: 'npc: Verschieben und Zugreihenfolge gelten für NSC; all: auch für SC.',
          tintPlayers: 'SC von Grün nach Rot tönen, während sie Trefferpunkte verlieren.',
          tintNpcs: 'NSC auf dieselbe Weise tönen.',
          hurtFx: 'Einen Effekt abspielen, wenn ein Token Trefferpunkte verliert.',
          hurtFxType: 'Dieser Effekt, als Typ-Farbe (splatter-blood).',
          healFx: 'Einen Effekt abspielen, wenn ein Token Trefferpunkte gewinnt.',
          healFxType: 'Dieser Effekt (glow-holy).',
        },
      },
      api: {
        heading: 'Für Mod-Autoren',
        intro: 'DeathTracker stellt ein DeathTracker-Objekt bereit.',
        colFunction: 'Funktion',
        colDesc: 'Was sie tut',
        rows: {
          check:
            'Einen Token sofort beurteilen (nachdem ein Mod seine Trefferpunkte geändert hat).',
          getStatus: 'Der Status eines Tokens: healthy, bloodied, dying, stable, dead oder null.',
          onStatusChange:
            'Benachrichtigt werden, wenn sich ein Status ändert ({token, status, previous, isPc}).',
          observe:
            'Version 0.1: (token, prev) erhalten, nachdem DeathTracker eine Trefferpunkte-Änderung verarbeitet hat.',
          managing:
            'True, wenn DeathTracker Todesrettungswürfe verfolgt: sie sind an, und DeathTracker ist dafür ausgewählt (HealthColors nutzt das).',
          ownersChanged:
            'Tokens aktualisieren, nachdem sich geändert hat, wer was übernimmt (HealthColors ruft das auf).',
        },
      },
      upgrading: {
        heading: 'Aktualisieren von 0.1',
        points: [
          'Deine Einstellungen für Marker, Leiste, Tönung und Effekte werden übernommen.',
          '!dead funktioniert weiterhin, ebenso !dead config und !dead reset.',
          'Der Bewusstlos-Marker für SC ist jetzt der Sterbend-Marker.',
          'Das Ändern der Leiste braucht keinen Neustart mehr.',
        ],
      },
      troubleshooting: {
        heading: 'Fehlerbehebung',
        points: [
          'Nichts passiert: Prüfe die Trefferpunkte-Leiste in den Einstellungen und ob die Leiste eine Zahl enthält.',
          'Ein SC wird als NSC behandelt: Wähle ihn aus und drücke Zum SC machen, oder lass einen Spieler den Charakter steuern.',
          'Ein Marker wird nicht angezeigt: Nutze !deathtracker markers und wähle einen Namen aus der Liste.',
          'Von einem anderen Mod geänderte Trefferpunkte werden nicht erkannt: Dieser Mod sollte DeathTracker.check(token) aufrufen.',
        ],
      },
      languages: {
        heading: 'Sprachen',
        body: 'Stelle die Sprache mit !deathtracker set language <code> ein.',
        colLanguage: 'Sprache',
        colNative: 'Eigenname',
        colCode: 'Code',
      },
      credits: {
        heading: 'Danksagung',
        original: 'Geschrieben von',
        maintainer: 'Für Version 1.0 neu geschrieben von',
        support: 'Ein Problem gefunden oder eine Idee? Kontaktiere MidNiteShadow7 auf Roll20.',
      },
    },
    errors: {
      gmOnly: 'Nur der SL kann diesen DeathTracker-Befehl verwenden.',
      unknownCommand: 'DeathTracker hat keinen Befehl „{command}“.',
      noTokens: 'Wähle zuerst einen oder mehrere Token aus (oder füge --ids hinzu).',
      notYourToken: 'Du steuerst diesen Token nicht.',
      hint: 'Gib !deathtracker help ein, um die Liste der Befehle zu sehen.',
    },
  };

  var localeEl = {
    titles: {
      ready: 'Το DeathTracker είναι έτοιμο.',
      menu: 'DeathTracker',
      status: 'Κατάσταση DeathTracker',
      settings: 'Ρυθμίσεις DeathTracker',
      help: 'Εντολές DeathTracker',
      announce: 'DeathTracker',
      markers: 'Δείκτες πιονιών',
    },
    messages: {
      readyHint: 'Πληκτρολογήστε !deathtracker για να ανοίξει το μενού.',
      migrated:
        'Οι ρυθμίσεις σας από το DeathTracker 0.1 μεταφέρθηκαν. Το !dead λειτουργεί ακόμα· η νέα εντολή είναι !deathtracker.',
      healthColors:
        'Το HealthColors είναι εγκατεστημένο: το DeathTracker χειρίζεται τις ρίψεις διάσωσης θανάτου και τους δείκτες ετοιμοθάνατου, σταθερού και νεκρού, και το HealthColors τα χρώματα υγείας και τα εφέ τραυματισμού και θεραπείας. Αλλάξτε ποιος χειρίζεται τι στις Ρυθμίσεις.',
      healthColorsSaves:
        'Το HealthColors παρακολουθεί κι αυτό τις ρίψεις διάσωσης θανάτου και βάζει δείκτες ετοιμοθάνατου. Απενεργοποιήστε το ένα από τα δύο (!aura deathsaves off) ώστε να μη συγκρούονται για τους δείκτες.',
      settingChanged: 'Η ρύθμιση {setting} είναι τώρα {value}.',
      settingRejected: 'Το «{value}» δεν είναι έγκυρη τιμή για {setting}.',
      unknownSetting: 'Δεν υπάρχει ρύθμιση με όνομα «{setting}».',
      markerUnknown:
        'Αυτό το παιχνίδι δεν έχει δείκτη «{marker}», οπότε δεν θα εμφανίζεται. Χρησιμοποιήστε το !deathtracker markers για να δείτε τα ονόματα που μπορείτε να χρησιμοποιήσετε.',
      checked: 'Ελέγχθηκαν {count} πιόνι(α).',
      cleared: 'Αφαιρέθηκαν οι δείκτες του DeathTracker από {count} πιόνι(α).',
      restored: 'Επαναφέρθηκαν {count} πιόνι(α).',
      nothingToRestore: 'Κανένα από αυτά τα πιόνια δεν μετακινήθηκε από το DeathTracker.',
      roleSet: '{names}: {role}.',
      stabilised: 'Σταθεροποιημένοι: {count}.',
      notDown: 'Κανένα από αυτά τα πιόνια δεν είναι PC με 0 πόντους ζωής.',
      synced: '{name}: {s} επιτυχία(ες), {f} αποτυχία(ες).',
      macroCreated:
        'Δημιουργήθηκε η ενέργεια πιονιού «{macro}». Ο παίκτης επιλέγει το πιόνι του και την πατά αφού ρίξει ρίψη διάσωσης θανάτου.',
      journalRebuilt: 'Τα έντυπα «{help}» και «{deck}» δημιουργήθηκαν ξανά.',
      resetDone: 'Οι ρυθμίσεις επανήλθαν στις προεπιλογές.',
      restartNotNeeded: 'Δεν χρειάζεται επανεκκίνηση: η νέα μπάρα χρησιμοποιείται από τώρα.',
    },
    status: {
      healthy: 'Υγιής',
      bloodied: 'Αιμόφυρτος',
      dying: 'Ετοιμοθάνατος',
      stable: 'Σταθερός',
      dead: 'Νεκρός',
      none: 'Δεν παρακολουθείται',
      pc: 'PC',
      npc: 'NPC',
      hp: 'ΠΖ {hp}/{max}',
      hpNoMax: 'ΠΖ {hp}',
      saves: 'Ρίψεις διάσωσης θανάτου: {s} επιτυχία(ες), {f} αποτυχία(ες)',
      unnamed: 'Ένα πιόνι',
      noneHere: 'Δεν υπάρχουν ακόμα πιόνια με πόντους ζωής σε αυτή τη σελίδα.',
      page: 'Σελίδα: {page}',
      selected: 'Επιλεγμένα πιόνια',
      actions: 'Μετακινήθηκε όταν πέθανε',
    },
    announce: {
      dying: 'Ο/Η {name} έπεσε και πεθαίνει.',
      stable: 'Ο/Η {name} είναι σταθερός/ή.',
      dead: 'Ο/Η {name} πέθανε.',
      up: 'Ο/Η {name} στάθηκε ξανά στα πόδια του/της.',
      savesHint: 'Οι ρίψεις διάσωσης θανάτου που σημειώνονται στο φύλλο μετρώνται καθώς γίνονται.',
    },
    menu: {
      summary: 'Σε αυτή τη σελίδα',
      down: 'Πεσμένοι PC',
      noneDown: 'Κανένας PC δεν έχει πέσει.',
      tools: 'Εργαλεία',
      sandbox: 'Sandbox των Mod: {version}',
      sandboxUnknown: 'άγνωστο',
      hcNote: 'Το HealthColors είναι εγκατεστημένο.',
    },
    buttons: {
      menu: 'Μενού',
      status: 'Κατάσταση',
      checkPage: 'Έλεγχος σελίδας',
      check: 'Έλεγχος επιλεγμένων',
      settings: 'Ρυθμίσεις',
      help: 'Βοήθεια',
      stable: 'Σταθεροποίηση',
      restore: 'Επαναφορά',
      clear: 'Καθαρισμός δεικτών',
      pc: 'Ορισμός ως PC',
      npc: 'Ορισμός ως NPC',
      auto: 'Αυτόματη απόφαση',
      markers: 'Δείκτες',
      macro: 'Δημιουργία μακροεντολής ρίψης διάσωσης θανάτου',
      rebuild: 'Αναδημιουργία εντύπων',
      reset: 'Επαναφορά ρυθμίσεων',
      on: 'Ναι',
      off: 'Όχι',
      back: 'Πίσω',
    },
    prompts: {
      marker: 'Δείκτης',
      percent: 'Αιμόφυρτος σε αυτό ή χαμηλότερα (% του μέγιστου)',
      fields: 'Ονόματα πεδίων χωρισμένα με κόμματα',
      fx: 'Εφέ (τύπος-χρώμα)',
      language: 'Γλώσσα',
    },
    sections: {
      owners: 'Ποιος χειρίζεται τι',
      hp: 'Πόντοι ζωής',
      markers: 'Δείκτες',
      deathSaves: 'Ρίψεις διάσωσης θανάτου (PC)',
      onDeath: 'Όταν ένα πιόνι πεθαίνει',
      looks: 'Χρωματισμός και εφέ',
      general: 'Γενικά',
    },
    settings: {
      deathSavesBy: 'Ρίψεις διάσωσης και δείκτες 0 ΠΖ',
      coloursBy: 'Χρώματα υγείας',
      effectsBy: 'Εφέ τραυματισμού και θεραπείας',
      language: 'Γλώσσα',
      hpBar: 'Μπάρα πόντων ζωής',
      bloodiedPercent: 'Αιμόφυρτος στο',
      bloodiedMarker: 'Δείκτης Αιμόφυρτου',
      dyingMarker: 'Δείκτης Ετοιμοθάνατου',
      stableMarker: 'Δείκτης Σταθερού',
      deadMarker: 'Δείκτης Νεκρού',
      pcDetection: 'Ποιος είναι PC',
      deathSaves: 'Παρακολούθηση ρίψεων διάσωσης θανάτου',
      resetSheetSaves: 'Καθαρισμός κουτιών φύλλου',
      successFields: 'Πεδία επιτυχιών',
      failureFields: 'Πεδία αποτυχιών',
      massiveDamage: 'Τεράστια ζημιά',
      announce: 'Ανακοίνωση',
      deathLayer: 'Μετακίνηση νεκρών σε',
      deathTurnOrder: 'Σειρά γύρου',
      deathActionsFor: 'Ισχύει για',
      tintPlayers: 'Χρωματισμός PC',
      tintNpcs: 'Χρωματισμός NPC',
      hurtFx: 'Εφέ τραυματισμού',
      hurtFxType: 'Τύπος εφέ τραυματισμού',
      healFx: 'Εφέ θεραπείας',
      healFxType: 'Τύπος εφέ θεραπείας',
    },
    choices: {
      hpBar: { 1: 'Μπάρα 1', 2: 'Μπάρα 2', 3: 'Μπάρα 3' },
      pcDetection: { auto: 'Παίκτες ή φύλλο', players: 'Ελέγχεται από παίκτη' },
      deathLayer: { none: 'Μένει στη θέση του', gmlayer: 'Επίπεδο GM', map: 'Επίπεδο χάρτη' },
      deathTurnOrder: { keep: 'Διατήρηση', remove: 'Αφαίρεση' },
      deathActionsFor: { npc: 'NPC', all: 'NPC και PC' },
      announce: { off: 'Όχι', gm: 'GM', controllers: 'GM και παίκτες' },
      none: 'Κανένας',
      notInstalled: 'δεν είναι εγκατεστημένο',
    },
    help: {
      menu: 'Άνοιγμα του μενού.',
      status:
        'Εμφάνιση της κατάστασης των επιλεγμένων πιονιών ή κάθε παρακολουθούμενου πιονιού στη σελίδα σας.',
      check: 'Νέα αξιολόγηση των επιλεγμένων πιονιών (all: κάθε πιόνι στη σελίδα σας).',
      stable: 'Σήμανση των επιλεγμένων PC με 0 πόντους ζωής ως σταθερών.',
      clear:
        'Αφαίρεση των δεικτών και του χρωματισμού του DeathTracker από τα επιλεγμένα πιόνια και διαγραφή τους από τη μνήμη του.',
      restore:
        'Επαναφορά των νεκρών πιονιών που μετακίνησε το DeathTracker στο επίπεδό τους και στη σειρά γύρου.',
      role: 'Οι χαρακτήρες των επιλεγμένων πιονιών αντιμετωπίζονται ως PC ή NPC, ή αποφασίζει το DeathTracker.',
      markers: 'Λίστα των δεικτών του παιχνιδιού, με τα ονόματα που χρησιμοποιούνται.',
      macro:
        'Δημιουργία ενέργειας πιονιού που πατούν οι παίκτες για να στείλουν τις ρίψεις διάσωσης θανάτου τους (για φύλλα που το DeathTracker δεν μπορεί να διαβάσει).',
      dsync: 'Αποστέλλεται από τη μακροεντολή ρίψης διάσωσης θανάτου.',
      settings: 'Άνοιγμα των ρυθμίσεων.',
      set: 'Αλλαγή μιας ρύθμισης.',
      reset: 'Επαναφορά όλων των ρυθμίσεων στις προεπιλογές.',
      config: 'Εντολές της έκδοσης 0.1: άνοιγμα των ρυθμίσεων ή αλλαγή μίας (config bar|2).',
      journal: 'Αναδημιουργία των εντύπων Help και Command Deck.',
      help: 'Εμφάνιση αυτής της λίστας.',
      ids: 'Προσθέστε --ids id1,id2 για να δουλέψετε με πιόνια βάσει ID αντί για την επιλογή.',
    },
    deck: {
      menuTitle: 'Μενού',
      menuDesc: 'Το μενού, η κατάσταση, οι ρυθμίσεις και η βοήθεια.',
      selectedTitle: 'Επιλεγμένα πιόνια',
      selectedDesc: 'Επιλέξτε πιόνια στον χάρτη και πατήστε ένα κουμπί.',
      roleTitle: 'PC ή NPC',
      roleDesc: 'Για τους χαρακτήρες των επιλεγμένων πιονιών.',
      toolsTitle: 'Εργαλεία',
      toolsDesc: 'Δείκτες, η μακροεντολή ρίψης διάσωσης θανάτου και αυτά τα έντυπα.',
      footer: 'Ο πλήρης οδηγός βρίσκεται στο έντυπο «{help}».',
    },
    handout: {
      versionLabel: 'Έκδοση',
      subtitle:
        'Αιμόφυρτος, ετοιμοθάνατος, σταθερός και νεκρός, από τους πόντους ζωής και τις ρίψεις διάσωσης θανάτου',
      footer: 'Κουμπιά για κάθε εντολή υπάρχουν στο «{deck}».',
      overview: {
        heading: 'Επισκόπηση',
        body: 'Το DeathTracker παρακολουθεί τη μπάρα πόντων ζωής κάθε πιονιού. Σημαδεύει τα πιόνια που είναι αιμόφυρτα ή νεκρά, παρακολουθεί τις ρίψεις διάσωσης θανάτου των χαρακτήρων παικτών με 0 πόντους ζωής και μπορεί να μετακινεί τους νεκρούς εκτός χάρτη και εκτός σειράς γύρου.',
      },
      quickStart: {
        heading: 'Γρήγορη εκκίνηση',
        steps: [
          'Βάλτε τους πόντους ζωής στη Μπάρα 1 (ή επιλέξτε άλλη μπάρα στις Ρυθμίσεις).',
          'Προκαλέστε ζημιά σε ένα πιόνι: στο μισό του μέγιστου παίρνει τον δείκτη Αιμόφυρτου· στο 0 ένας NPC παίρνει τον δείκτη Νεκρού.',
          'Ένας PC στο 0 παίρνει τον δείκτη Ετοιμοθάνατου. Σημειώστε τις ρίψεις διάσωσης θανάτου στο φύλλο: τρεις επιτυχίες τον κάνουν Σταθερό, τρεις αποτυχίες Νεκρό.',
          'Θεραπεύστε τον πάνω από το 0 και οι δείκτες φεύγουν.',
          'Πληκτρολογήστε !deathtracker για το μενού.',
        ],
      },
      statuses: {
        heading: 'Καταστάσεις',
        points: [
          'Υγιής: πάνω από το όριο Αιμόφυρτου των μέγιστων πόντων ζωής (χωρίς δείκτη).',
          'Αιμόφυρτος: στο όριο ή χαμηλότερα (50% εκτός αν αλλάξει).',
          'Ετοιμοθάνατος: ένας PC με 0 πόντους ζωής που κάνει ρίψεις διάσωσης θανάτου.',
          'Σταθερός: ένας PC στο 0 με τρεις επιτυχίες ή σταθεροποιημένος με την εντολή stable.',
          'Νεκρός: ένας NPC στο 0, ένας PC με τρεις αποτυχίες ή ένας PC που σκοτώθηκε από τεράστια ζημιά.',
          'Μια άδεια μπάρα, ή μια μπάρα χωρίς αριθμό, δεν διαβάζεται ποτέ ως 0.',
        ],
      },
      deathSaves: {
        heading: 'Ρίψεις διάσωσης θανάτου',
        points: [
          'Φύλλο D&D 2024: διαβάζεται από το φύλλο καθώς σημειώνονται κουτιά ή ρίχνονται ρίψεις διάσωσης.',
          'Φύλλο D&D 2014 και άλλα με κουτάκια: διαβάζεται από τα πεδία επιτυχιών και αποτυχιών των Ρυθμίσεων.',
          'Το φύλλο κρατά τις παλιές σημειώσεις μετά τη θεραπεία, οπότε οι ρίψεις μετρώνται από τη στιγμή που ο PC πέφτει στο 0. Με ενεργό τον Καθαρισμό κουτιών φύλλου, το DeathTracker καθαρίζει τα κουτιά του φύλλου όταν ο PC πέφτει στο 0 και όταν θεραπεύεται, και εμφανίζει τα κουτιά ρίψεων διάσωσης θανάτου του φύλλου D&D 2024 όταν ένας PC πέφτει στο 0 από τη μπάρα του πιονιού.',
          'Αν το φύλλο δεν διαβάζεται, δημιουργήστε τη μακροεντολή ρίψης διάσωσης θανάτου (!deathtracker macro): οι παίκτες επιλέγουν το πιόνι τους και την πατούν μετά από κάθε ρίψη.',
          'Ποιος είναι PC: ένα πιόνι ή χαρακτήρας που ελέγχεται από παίκτη ή (Παίκτες ή φύλλο) ένας του οποίου το φύλλο λέει ότι δεν είναι NPC. Χρησιμοποιήστε το Ορισμός ως PC / Ορισμός ως NPC για να αποφασίσετε για έναν χαρακτήρα.',
        ],
      },
      onDeath: {
        heading: 'Όταν ένα πιόνι πεθαίνει',
        points: [
          'Μετακίνηση των νεκρών στο επίπεδο GM ή στο επίπεδο χάρτη και αφαίρεσή τους από τη σειρά γύρου. Αρχικά και τα δύο είναι ανενεργά.',
          'Ισχύει μόνο για NPC, εκτός αν οριστεί σε NPC και PC.',
          'Η θεραπεία ενός νεκρού πιονιού αφαιρεί τους δείκτες του αλλά δεν το μετακινεί πίσω. Επιλέξτε το και χρησιμοποιήστε την Επαναφορά (επιστρέφει στη σειρά γύρου με την πρωτοβουλία του).',
          'Τεράστια ζημιά (αρχικά ανενεργή): ένας PC του οποίου η μπάρα πέφτει κάτω από το 0 κατά τουλάχιστον το μέγιστό του πεθαίνει αμέσως. Το φύλλο 2024 σταματά στο 0, οπότε αυτό λειτουργεί μόνο όταν στη μπάρα πληκτρολογηθεί τιμή κάτω από 0.',
        ],
      },
      healthColors: {
        heading: 'HealthColors και άλλα Mod',
        points: [
          'Το «Ποιος χειρίζεται τι», στις Ρυθμίσεις, ορίζει ποιο Mod χειρίζεται τις ρίψεις διάσωσης θανάτου (με τους δείκτες ετοιμοθάνατου, σταθερού και νεκρού), τα χρώματα υγείας και τα εφέ τραυματισμού και θεραπείας: DeathTracker, HealthColors ή Όχι. Το HealthColors 2.5 και νεότερο δείχνει την ίδια επιλογή, και η αλλαγή της σε οποιοδήποτε από τα δύο Mod ισχύει και για τα δύο.',
          'Αρχικά το DeathTracker χειρίζεται τις ρίψεις διάσωσης θανάτου και το HealthColors τα χρώματα και τα εφέ. Χωρίς το HealthColors, το DeathTracker χειρίζεται και τα τρία.',
          'Το HealthColors πριν από την 2.5 δεν μοιράζεται την επιλογή: απενεργοποιήστε τις ρίψεις διάσωσης θανάτου του με !aura deathsaves off.',
          'Οι αλλαγές από το TokenMod γίνονται αντιληπτές. Άλλα Mod μπορούν να καλούν το DeathTracker.check(token) αφού αλλάξουν πόντους ζωής.',
          'Το DeathTracker αφαιρεί μόνο δείκτες που έβαλε το ίδιο.',
        ],
      },
      commands: {
        heading: 'Εντολές',
        intro:
          'Κάθε εντολή ξεκινά με !deathtracker (ή !dt, ή !dead από την έκδοση 0.1). Μόνο για τον GM, εκτός από τη μακροεντολή ρίψης διάσωσης θανάτου.',
        colCommand: 'Εντολή',
        colDesc: 'Τι κάνει',
      },
      settings: {
        heading: 'Ρυθμίσεις',
        intro:
          'Αλλάξτε τις στο μενού, με !deathtracker set <setting> <value> ή στις επιλογές της Βιβλιοθήκης Mod.',
        colKey: 'Ρύθμιση',
        colDesc: 'Τι κάνει',
        rows: {
          deathSavesBy:
            'Ποιος παρακολουθεί τις ρίψεις διάσωσης θανάτου και βάζει τους δείκτες ετοιμοθάνατου, σταθερού και νεκρού: DeathTracker, HealthColors ή off. Κοινή με το HealthColors.',
          coloursBy:
            'Ποιος χρωματίζει τα πιόνια ανάλογα με τους πόντους ζωής: DeathTracker (ο χρωματισμός του), HealthColors ή off. Κοινή με το HealthColors.',
          effectsBy:
            'Ποιος αναπαράγει τα εφέ τραυματισμού και θεραπείας: DeathTracker, HealthColors ή off. Κοινή με το HealthColors.',
          language: 'Γλώσσα των μενού, των μηνυμάτων και των εντύπων.',
          hpBar: 'Η μπάρα που κρατά τους πόντους ζωής (1, 2 ή 3).',
          bloodiedPercent:
            'Αιμόφυρτος σε αυτό το ποσοστό των μέγιστων πόντων ζωής ή χαμηλότερα (το 0 απενεργοποιεί το Αιμόφυρτος).',
          bloodiedMarker: 'Δείκτης για Αιμόφυρτο (none για κανέναν δείκτη).',
          dyingMarker: 'Δείκτης για ετοιμοθάνατο PC.',
          stableMarker: 'Δείκτης για σταθερό PC.',
          deadMarker: 'Δείκτης για τους νεκρούς.',
          pcDetection:
            'auto: ελέγχεται από παίκτη ή το φύλλο λέει PC· players: μόνο όσοι ελέγχονται από παίκτη.',
          deathSaves: 'Παρακολούθηση ρίψεων διάσωσης θανάτου για PC με 0 πόντους ζωής.',
          resetSheetSaves:
            'Καθαρισμός των κουτιών ρίψεων διάσωσης θανάτου του φύλλου όταν ένας PC πέφτει στο 0 και όταν θεραπεύεται, και εμφάνισή τους στο φύλλο D&D 2024.',
          successFields: 'Πεδία φύλλου που σημειώνονται για επιτυχίες (φύλλα 2014 και άλλα).',
          failureFields: 'Πεδία φύλλου που σημειώνονται για αποτυχίες.',
          massiveDamage:
            'Ένας PC του οποίου η μπάρα πέφτει κάτω από το 0 κατά τουλάχιστον το μέγιστό του πεθαίνει αμέσως.',
          announce:
            'Ποιος ενημερώνεται όταν ένας PC πέφτει, σταθεροποιείται, πεθαίνει ή σηκώνεται: off, gm ή controllers.',
          deathLayer: 'Μετακίνηση των νεκρών σε: none, gmlayer ή map.',
          deathTurnOrder: 'keep (διατήρηση) ή remove (αφαίρεση) των νεκρών από τη σειρά γύρου.',
          deathActionsFor: 'npc: η μετακίνηση και η σειρά γύρου ισχύουν για NPC· all: και για PC.',
          tintPlayers: 'Χρωματισμός των PC από πράσινο σε κόκκινο καθώς χάνουν πόντους ζωής.',
          tintNpcs: 'Χρωματισμός των NPC με τον ίδιο τρόπο.',
          hurtFx: 'Αναπαραγωγή εφέ όταν ένα πιόνι χάνει πόντους ζωής.',
          hurtFxType: 'Αυτό το εφέ, ως τύπος-χρώμα (splatter-blood).',
          healFx: 'Αναπαραγωγή εφέ όταν ένα πιόνι κερδίζει πόντους ζωής.',
          healFxType: 'Αυτό το εφέ (glow-holy).',
        },
      },
      api: {
        heading: 'Για δημιουργούς Mod',
        intro: 'Το DeathTracker δημοσιεύει ένα αντικείμενο DeathTracker.',
        colFunction: 'Συνάρτηση',
        colDesc: 'Τι κάνει',
        rows: {
          check: 'Αξιολόγηση ενός πιονιού τώρα (αφού αλλάξουν οι πόντοι ζωής του από ένα Mod).',
          getStatus: 'Η κατάσταση ενός πιονιού: healthy, bloodied, dying, stable, dead ή null.',
          onStatusChange:
            'Ειδοποίηση όταν αλλάζει μια κατάσταση ({token, status, previous, isPc}).',
          observe:
            'Έκδοση 0.1: ειδοποίηση (token, prev) αφού το DeathTracker χειριστεί μια αλλαγή πόντων ζωής.',
          managing:
            'True όταν το DeathTracker παρακολουθεί ρίψεις διάσωσης θανάτου: είναι ενεργές και έχει επιλεγεί το DeathTracker για να τις χειρίζεται (το χρησιμοποιεί το HealthColors).',
          ownersChanged:
            'Ενημέρωση των πιονιών αφού αλλάξει ποιος χειρίζεται τι (το καλεί το HealthColors).',
        },
      },
      upgrading: {
        heading: 'Αναβάθμιση από την 0.1',
        points: [
          'Οι ρυθμίσεις δεικτών, μπάρας, χρωματισμού και εφέ μεταφέρθηκαν.',
          'Το !dead λειτουργεί ακόμα, όπως και τα !dead config και !dead reset.',
          'Ο δείκτης Αναίσθητου για τους PC είναι τώρα ο δείκτης Ετοιμοθάνατου.',
          'Η αλλαγή μπάρας δεν χρειάζεται πλέον επανεκκίνηση.',
        ],
      },
      troubleshooting: {
        heading: 'Αντιμετώπιση προβλημάτων',
        points: [
          'Δεν συμβαίνει τίποτα: ελέγξτε τη μπάρα πόντων ζωής στις Ρυθμίσεις και ότι η μπάρα περιέχει αριθμό.',
          'Ένας PC αντιμετωπίζεται ως NPC: επιλέξτε τον και πατήστε Ορισμός ως PC ή αφήστε έναν παίκτη να ελέγχει τον χαρακτήρα.',
          'Ένας δείκτης δεν εμφανίζεται: χρησιμοποιήστε το !deathtracker markers και διαλέξτε ένα όνομα από τη λίστα.',
          'Οι αλλαγές πόντων ζωής από άλλο Mod δεν γίνονται αντιληπτές: εκείνο το Mod πρέπει να καλεί το DeathTracker.check(token).',
        ],
      },
      languages: {
        heading: 'Γλώσσες',
        body: 'Ορίστε τη γλώσσα με !deathtracker set language <code>.',
        colLanguage: 'Γλώσσα',
        colNative: 'Εγχώρια ονομασία',
        colCode: 'Κωδικός',
      },
      credits: {
        heading: 'Συντελεστές',
        original: 'Γράφτηκε από',
        maintainer: 'Ξαναγράφτηκε για την έκδοση 1.0 από',
        support:
          'Βρήκατε πρόβλημα ή έχετε μια ιδέα; Επικοινωνήστε με τον MidNiteShadow7 στο Roll20.',
      },
    },
    errors: {
      gmOnly: 'Μόνο ο GM μπορεί να χρησιμοποιήσει αυτή την εντολή του DeathTracker.',
      unknownCommand: 'Το DeathTracker δεν έχει εντολή «{command}».',
      noTokens: 'Επιλέξτε πρώτα ένα ή περισσότερα πιόνια (ή προσθέστε --ids).',
      notYourToken: 'Δεν ελέγχετε αυτό το πιόνι.',
      hint: 'Πληκτρολογήστε !deathtracker help για τη λίστα εντολών.',
    },
  };

  var localeHe = {
    titles: {
      ready: 'DeathTracker מוכן.',
      menu: 'DeathTracker',
      status: 'מצב DeathTracker',
      settings: 'הגדרות DeathTracker',
      help: 'פקודות DeathTracker',
      announce: 'DeathTracker',
      markers: 'סמני אסימונים',
    },
    messages: {
      readyHint: 'הקלידו !deathtracker כדי לפתוח את התפריט.',
      migrated:
        'ההגדרות שלכם מ-DeathTracker 0.1 הועברו. !dead עדיין עובד; !deathtracker היא הפקודה החדשה.',
      healthColors:
        'HealthColors מותקן: DeathTracker מטפל בהטלות הצלה מפני מוות ובסמני הגוסס, היציב והמת, ו-HealthColors בצבעי הבריאות ובאפקטי הפגיעה והריפוי. שנו מי מטפל במה בהגדרות.',
      healthColorsSaves:
        'גם HealthColors עוקב אחר הטלות הצלה מפני מוות ומציב סמני גסיסה. כבו אחד מהם (!aura deathsaves off) כדי שלא יתחרו על הסמנים.',
      settingChanged: '{setting} הוא עכשיו {value}.',
      settingRejected: '"{value}" אינו ערך תקין עבור {setting}.',
      unknownSetting: 'אין הגדרה בשם "{setting}".',
      markerUnknown:
        'במשחק הזה אין סמן "{marker}", ולכן הוא לא יוצג. השתמשו ב-!deathtracker markers כדי לראות את השמות שאפשר להשתמש בהם.',
      checked: 'נבדקו {count} אסימונים.',
      cleared: 'סמני DeathTracker הוסרו מ-{count} אסימונים.',
      restored: '{count} אסימונים הוחזרו.',
      nothingToRestore: 'אף אחד מהאסימונים האלה לא הוזז על ידי DeathTracker.',
      roleSet: '{names}: {role}.',
      stabilised: 'יציבים: {count}.',
      notDown: 'אף אחד מהאסימונים האלה אינו דמות שחקן ב-0 נקודות פגיעה.',
      synced: '{name}: {s} הצלחות, {f} כישלונות.',
      macroCreated:
        'נוצרה פעולת האסימון "{macro}". שחקן בוחר את האסימון שלו ולוחץ עליה אחרי הטלת הצלה מפני מוות.',
      journalRebuilt: 'דפי המידע "{help}" ו-"{deck}" נבנו מחדש.',
      resetDone: 'ההגדרות חזרו לברירת המחדל.',
      restartNotNeeded: 'אין צורך בהפעלה מחדש: מעכשיו משתמשים בפס החדש.',
    },
    status: {
      healthy: 'בריא',
      bloodied: 'מדמם',
      dying: 'גוסס',
      stable: 'יציב',
      dead: 'מת',
      none: 'לא במעקב',
      pc: 'PC',
      npc: 'NPC',
      hp: 'HP {hp}/{max}',
      hpNoMax: 'HP {hp}',
      saves: 'הטלות הצלה מפני מוות: {s} הצלחות, {f} כישלונות',
      unnamed: 'אסימון',
      noneHere: 'עדיין אין בעמוד הזה אסימונים עם נקודות פגיעה.',
      page: 'עמוד: {page}',
      selected: 'אסימונים נבחרים',
      actions: 'הוזזו כשמתו',
    },
    announce: {
      dying: '{name} נפל וגוסס.',
      stable: '{name} יציב.',
      dead: '{name} מת.',
      up: '{name} שוב על הרגליים.',
      savesHint: 'הטלות הצלה מפני מוות שמסומנות בדף הדמות נספרות בזמן שהן מתבצעות.',
    },
    menu: {
      summary: 'בעמוד הזה',
      down: 'דמויות שחקן שנפלו',
      noneDown: 'אף דמות שחקן לא נפלה.',
      tools: 'כלים',
      sandbox: 'ארגז החול של Mod: {version}',
      sandboxUnknown: 'לא ידוע',
      hcNote: 'HealthColors מותקן.',
    },
    buttons: {
      menu: 'תפריט',
      status: 'מצב',
      checkPage: 'בדיקת העמוד',
      check: 'בדיקת הנבחרים',
      settings: 'הגדרות',
      help: 'עזרה',
      stable: 'ייצוב',
      restore: 'החזרה',
      clear: 'ניקוי סמנים',
      pc: 'הפוך ל-PC',
      npc: 'הפוך ל-NPC',
      auto: 'החלטה אוטומטית',
      markers: 'סמנים',
      macro: 'יצירת מאקרו להטלת הצלה מפני מוות',
      rebuild: 'בנייה מחדש של דפי המידע',
      reset: 'איפוס הגדרות',
      on: 'מופעל',
      off: 'כבוי',
      back: 'חזרה',
    },
    prompts: {
      marker: 'סמן',
      percent: 'מדמם בערך זה או מתחתיו (% מהמקסימום)',
      fields: 'שמות שדות מופרדים בפסיקים',
      fx: 'אפקט (סוג-צבע)',
      language: 'שפה',
    },
    sections: {
      owners: 'מי מטפל במה',
      hp: 'נקודות פגיעה',
      markers: 'סמנים',
      deathSaves: 'הטלות הצלה מפני מוות (PC)',
      onDeath: 'כשאסימון מת',
      looks: 'צביעה ואפקטים',
      general: 'כללי',
    },
    settings: {
      deathSavesBy: 'הטלות הצלה וסמנים ב-0 HP',
      coloursBy: 'צבעי בריאות',
      effectsBy: 'אפקטי פגיעה וריפוי',
      language: 'שפה',
      hpBar: 'פס נקודות הפגיעה',
      bloodiedPercent: 'מדמם החל מ-',
      bloodiedMarker: 'סמן מדמם',
      dyingMarker: 'סמן גוסס',
      stableMarker: 'סמן יציב',
      deadMarker: 'סמן מת',
      pcDetection: 'מי נחשב PC',
      deathSaves: 'מעקב אחר הטלות הצלה מפני מוות',
      resetSheetSaves: 'ניקוי תיבות בדף הדמות',
      successFields: 'שדות הצלחה',
      failureFields: 'שדות כישלון',
      massiveDamage: 'נזק מסיבי',
      announce: 'הכרזה',
      deathLayer: 'להזיז את המתים אל',
      deathTurnOrder: 'סדר התורות',
      deathActionsFor: 'חל על',
      tintPlayers: 'צביעת דמויות שחקן',
      tintNpcs: 'צביעת NPC',
      hurtFx: 'אפקט פגיעה',
      hurtFxType: 'סוג אפקט הפגיעה',
      healFx: 'אפקט ריפוי',
      healFxType: 'סוג אפקט הריפוי',
    },
    choices: {
      hpBar: { 1: 'פס 1', 2: 'פס 2', 3: 'פס 3' },
      pcDetection: { auto: 'שחקנים או דף דמות', players: 'בשליטת שחקן' },
      deathLayer: { none: 'להישאר במקום', gmlayer: 'שכבת GM', map: 'שכבת המפה' },
      deathTurnOrder: { keep: 'להשאיר', remove: 'להסיר' },
      deathActionsFor: { npc: 'NPC', all: 'NPC ו-PC' },
      announce: { off: 'כבוי', gm: 'GM', controllers: 'GM ושחקנים' },
      none: 'ללא',
      notInstalled: 'לא מותקן',
    },
    help: {
      menu: 'פתיחת התפריט.',
      status: 'הצגת המצב של האסימונים הנבחרים, או של כל אסימון במעקב בעמוד שלכם.',
      check: 'שיפוט מחדש של האסימונים הנבחרים (all: כל האסימונים בעמוד שלכם).',
      stable: 'סימון דמויות השחקן הנבחרות ב-0 נקודות פגיעה כיציבות.',
      clear: 'הסרת הסמנים והצביעה של DeathTracker מהאסימונים הנבחרים ושכחתם.',
      restore: 'החזרת אסימונים מתים ש-DeathTracker הזיז לשכבה שלהם ולסדר התורות.',
      role: 'התייחסות לדמויות של האסימונים הנבחרים כ-PC או כ-NPC, או לתת ל-DeathTracker להחליט.',
      markers: 'רשימת הסמנים שיש במשחק הזה, עם השמות לשימוש.',
      macro:
        'יצירת פעולת אסימון ששחקנים לוחצים עליה כדי לשלוח את הטלות ההצלה מפני מוות שלהם (לדפי דמות ש-DeathTracker לא יכול לקרוא).',
      dsync: 'נשלח על ידי מאקרו הטלת ההצלה מפני מוות.',
      settings: 'פתיחת ההגדרות.',
      set: 'שינוי הגדרה.',
      reset: 'החזרת כל ההגדרות לברירת המחדל.',
      config: 'פקודות גרסה 0.1: פתיחת ההגדרות, או שינוי של אחת מהן (config bar|2).',
      journal: 'בנייה מחדש של דפי המידע Help ו-Command Deck.',
      help: 'הצגת הרשימה הזו.',
      ids: 'הוסיפו --ids id1,id2 כדי לפעול על אסימונים לפי מזהה במקום לפי הבחירה.',
    },
    deck: {
      menuTitle: 'תפריט',
      menuDesc: 'התפריט, המצב, ההגדרות והעזרה.',
      selectedTitle: 'אסימונים נבחרים',
      selectedDesc: 'בחרו אסימונים במפה ואז לחצו על כפתור.',
      roleTitle: 'PC או NPC',
      roleDesc: 'עבור הדמויות של האסימונים הנבחרים.',
      toolsTitle: 'כלים',
      toolsDesc: 'סמנים, מאקרו הטלת ההצלה מפני מוות ודפי המידע האלה.',
      footer: 'המדריך המלא נמצא בדף המידע "{help}".',
    },
    handout: {
      versionLabel: 'גרסה',
      subtitle: 'מדמם, גוסס, יציב ומת, לפי נקודות פגיעה והטלות הצלה מפני מוות',
      footer: 'כפתורים לכל פקודה נמצאים ב-"{deck}".',
      overview: {
        heading: 'סקירה',
        body: 'DeathTracker עוקב אחר פס נקודות הפגיעה של כל אסימון. הוא מסמן אסימונים מדממים או מתים, עוקב אחר הטלות הצלה מפני מוות של דמויות שחקן ב-0 נקודות פגיעה, ויכול להזיז את המתים מהמפה ולהוציא אותם מסדר התורות.',
      },
      quickStart: {
        heading: 'התחלה מהירה',
        steps: [
          'שימו את נקודות הפגיעה בפס 1 (או בחרו פס אחר בהגדרות).',
          'גרמו נזק לאסימון: בחצי מהמקסימום שלו הוא מקבל את סמן המדמם; ב-0 NPC מקבל את סמן המת.',
          'PC ב-0 מקבל את סמן הגוסס. סמנו הטלות הצלה מפני מוות בדף הדמות: שלוש הצלחות הופכות אותו ליציב, שלושה כישלונות למת.',
          'רפאו אותו מעל 0 והסמנים נעלמים.',
          'הקלידו !deathtracker לתפריט.',
        ],
      },
      statuses: {
        heading: 'מצבים',
        points: [
          'בריא: מעל חלק המדמם מנקודות הפגיעה המרביות (ללא סמן).',
          'מדמם: בחלק הזה או מתחתיו (50% אלא אם שונה).',
          'גוסס: PC ב-0 נקודות פגיעה שמבצע הטלות הצלה מפני מוות.',
          'יציב: PC ב-0 עם שלוש הצלחות, או שיוצב בפקודה stable.',
          'מת: NPC ב-0, PC עם שלושה כישלונות, או PC שנהרג מנזק מסיבי.',
          'פס ריק, או פס שאין בו מספר, לעולם לא נקרא כ-0.',
        ],
      },
      deathSaves: {
        heading: 'הטלות הצלה מפני מוות',
        points: [
          'דף הדמות של D&D 2024: נקרא מדף הדמות כשמסמנים תיבות או מטילים הטלות.',
          'דף הדמות של D&D 2014 ואחרים עם תיבות סימון: נקרא משדות ההצלחה והכישלון שבהגדרות.',
          'דף הדמות שומר סימונים ישנים אחרי ריפוי, ולכן ההטלות נספרות מהרגע שה-PC יורד ל-0. כש"ניקוי תיבות בדף הדמות" מופעל, DeathTracker מנקה את התיבות בדף הדמות כשה-PC יורד ל-0 וכשהוא מרופא, ומציג את תיבות הטלות ההצלה מפני מוות בדף הדמות של D&D 2024 כש-PC יורד ל-0 דרך פס האסימון.',
          'אם אי אפשר לקרוא את דף הדמות, צרו את מאקרו הטלת ההצלה מפני מוות (!deathtracker macro): שחקנים בוחרים את האסימון שלהם ולוחצים עליו אחרי כל הטלה.',
          'מי נחשב PC: אסימון או דמות בשליטת שחקן, או (שחקנים או דף דמות) כזה שדף הדמות שלו אומר שאינו NPC. השתמשו ב"הפוך ל-PC" / "הפוך ל-NPC" כדי להחליט עבור דמות.',
        ],
      },
      onDeath: {
        heading: 'כשאסימון מת',
        points: [
          'הזזת המתים לשכבת GM או לשכבת המפה, והוצאתם מסדר התורות. שתי האפשרויות כבויות בהתחלה.',
          'חל על NPC בלבד, אלא אם הוגדר "NPC ו-PC".',
          'ריפוי אסימון מת מסיר את הסמנים שלו אבל לא מחזיר אותו למקומו. בחרו אותו והשתמשו ב"החזרה" (הוא חוזר לסדר התורות עם היוזמה שלו).',
          'נזק מסיבי (כבוי בהתחלה): PC שהפס שלו יורד מתחת ל-0 בלפחות המקסימום שלו מת מיד. דף הדמות של 2024 נעצר ב-0, ולכן זה עובד רק כשמקלידים בפס ערך מתחת ל-0.',
        ],
      },
      healthColors: {
        heading: 'HealthColors ו-Mods אחרים',
        points: [
          'האפשרות "מי מטפל במה" בהגדרות קובעת איזה Mod מטפל בהטלות הצלה מפני מוות (כולל סמני הגוסס, היציב והמת), בצבעי הבריאות ובאפקטי הפגיעה והריפוי: DeathTracker, HealthColors או כבוי. HealthColors 2.5 ואילך מציג את אותה בחירה, ושינוי שלה באחד מה-Mods משנה אותה בשניהם.',
          'בהתחלה DeathTracker מטפל בהטלות הצלה מפני מוות ו-HealthColors בצבעים ובאפקטים. בלי HealthColors, DeathTracker מטפל בשלושתם.',
          'גרסאות HealthColors שלפני 2.5 לא משתפות את הבחירה: כבו את הטלות ההצלה מפני מוות שלהן עם !aura deathsaves off.',
          'שינויים שנעשים ב-TokenMod נקלטים. Mods אחרים יכולים לקרוא ל-DeathTracker.check(token) אחרי שינוי נקודות פגיעה.',
          'DeathTracker מסיר רק סמנים שהוא עצמו הציב.',
        ],
      },
      commands: {
        heading: 'פקודות',
        intro:
          'כל פקודה מתחילה ב-!deathtracker (או !dt, או !dead מגרסה 0.1). ל-GM בלבד, מלבד מאקרו הטלת ההצלה מפני מוות.',
        colCommand: 'פקודה',
        colDesc: 'מה היא עושה',
      },
      settings: {
        heading: 'הגדרות',
        intro:
          'שנו אותן בתפריט, עם !deathtracker set <setting> <value>, או באפשרויות של ספריית ה-Mods.',
        colKey: 'הגדרה',
        colDesc: 'מה היא עושה',
        rows: {
          deathSavesBy:
            'מי עוקב אחר הטלות הצלה מפני מוות ומציב את סמני הגוסס, היציב והמת: DeathTracker, HealthColors או off. משותף עם HealthColors.',
          coloursBy:
            'מי צובע אסימונים לפי נקודות הפגיעה: DeathTracker (הצביעה שלו), HealthColors או off. משותף עם HealthColors.',
          effectsBy:
            'מי מפעיל את אפקטי הפגיעה והריפוי: DeathTracker, HealthColors או off. משותף עם HealthColors.',
          language: 'שפת התפריטים, ההודעות ודפי המידע.',
          hpBar: 'הפס שמחזיק את נקודות הפגיעה (1, 2 או 3).',
          bloodiedPercent: 'מדמם באחוז הזה מנקודות הפגיעה המרביות או מתחתיו (0 מכבה את מדמם).',
          bloodiedMarker: 'סמן למדמם (none ללא סמן).',
          dyingMarker: 'סמן ל-PC גוסס.',
          stableMarker: 'סמן ל-PC יציב.',
          deadMarker: 'סמן למתים.',
          pcDetection: 'auto: בשליטת שחקן או שדף הדמות אומר PC; players: בשליטת שחקן בלבד.',
          deathSaves: 'מעקב אחר הטלות הצלה מפני מוות של PC ב-0 נקודות פגיעה.',
          resetSheetSaves:
            'ניקוי תיבות הטלות ההצלה מפני מוות בדף הדמות כש-PC יורד ל-0 וכשהוא מרופא, והצגתן בדף הדמות של D&D 2024.',
          successFields: 'שדות בדף הדמות שמסומנים בהצלחות (2014 ודפי דמות אחרים).',
          failureFields: 'שדות בדף הדמות שמסומנים בכישלונות.',
          massiveDamage: 'PC שהפס שלו יורד מתחת ל-0 בלפחות המקסימום שלו מת מיד.',
          announce: 'למי מודיעים כש-PC נופל, מתייצב, מת או קם: off, gm או controllers.',
          deathLayer: 'להזיז את המתים אל: none, gmlayer או map.',
          deathTurnOrder: 'keep (להשאיר) או remove (להסיר) את המתים מסדר התורות.',
          deathActionsFor: 'npc: הזזה וסדר תורות חלים על NPC; all: גם על PC.',
          tintPlayers: 'צביעת דמויות שחקן מירוק לאדום ככל שהן מאבדות נקודות פגיעה.',
          tintNpcs: 'צביעת NPC באותו אופן.',
          hurtFx: 'הפעלת אפקט כשאסימון מאבד נקודות פגיעה.',
          hurtFxType: 'האפקט הזה, בתור סוג-צבע (splatter-blood).',
          healFx: 'הפעלת אפקט כשאסימון מקבל נקודות פגיעה.',
          healFxType: 'האפקט הזה (glow-holy).',
        },
      },
      api: {
        heading: 'למפתחי Mods',
        intro: 'DeathTracker מפרסם אובייקט DeathTracker.',
        colFunction: 'פונקציה',
        colDesc: 'מה היא עושה',
        rows: {
          check: 'שיפוט אסימון עכשיו (אחרי שינוי נקודות הפגיעה שלו מתוך Mod).',
          getStatus: 'המצב של אסימון: healthy, bloodied, dying, stable, dead או null.',
          onStatusChange: 'קבלת הודעה כשמצב משתנה ({token, status, previous, isPc}).',
          observe:
            'גרסה 0.1: קבלת הודעה (token, prev) אחרי ש-DeathTracker מטפל בשינוי נקודות פגיעה.',
          managing:
            'true כש-DeathTracker עוקב אחר הטלות הצלה מפני מוות: הן מופעלות, ו-DeathTracker נבחר לטפל בהן (HealthColors משתמש בזה).',
          ownersChanged: 'עדכון האסימונים אחרי שינוי של מי מטפל במה (HealthColors קורא לזה).',
        },
      },
      upgrading: {
        heading: 'שדרוג מ-0.1',
        points: [
          'הגדרות הסמנים, הפס, הצביעה והאפקטים שלכם מועברות.',
          '!dead עדיין עובד, וכך גם !dead config ו-!dead reset.',
          'סמן Unconscious של דמויות שחקן הוא עכשיו סמן הגוסס.',
          'שינוי הפס כבר לא דורש הפעלה מחדש.',
        ],
      },
      troubleshooting: {
        heading: 'פתרון בעיות',
        points: [
          'שום דבר לא קורה: בדקו את פס נקודות הפגיעה בהגדרות, ושהפס מחזיק מספר.',
          'PC מטופל כ-NPC: בחרו אותו ולחצו "הפוך ל-PC", או תנו לשחקן לשלוט בדמות.',
          'סמן לא מוצג: השתמשו ב-!deathtracker markers ובחרו שם מהרשימה.',
          'נקודות פגיעה ש-Mod אחר שינה לא נקלטות: ה-Mod הזה צריך לקרוא ל-DeathTracker.check(token).',
        ],
      },
      languages: {
        heading: 'שפות',
        body: 'הגדירו את השפה עם !deathtracker set language <code>.',
        colLanguage: 'שפה',
        colNative: 'שם בשפת המקור',
        colCode: 'קוד',
      },
      credits: {
        heading: 'קרדיטים',
        original: 'נכתב על ידי',
        maintainer: 'נכתב מחדש לגרסה 1.0 על ידי',
        support: 'מצאתם בעיה או יש לכם רעיון? פנו אל MidNiteShadow7 ב-Roll20.',
      },
    },
    errors: {
      gmOnly: 'רק ה-GM יכול להשתמש בפקודת DeathTracker הזו.',
      unknownCommand: 'ל-DeathTracker אין פקודה "{command}".',
      noTokens: 'בחרו קודם אסימון אחד או יותר (או הוסיפו --ids).',
      notYourToken: 'אינכם שולטים באסימון הזה.',
      hint: 'הקלידו !deathtracker help לרשימת הפקודות.',
    },
  };

  var localeHu = {
    titles: {
      ready: 'A DeathTracker készen áll.',
      menu: 'DeathTracker',
      status: 'DeathTracker – állapot',
      settings: 'DeathTracker – beállítások',
      help: 'DeathTracker – parancsok',
      announce: 'DeathTracker',
      markers: 'Tokenjelölők',
    },
    messages: {
      readyHint: 'Írd be: !deathtracker a menü megnyitásához.',
      migrated:
        'A DeathTracker 0.1 beállításaid átkerültek. A !dead továbbra is működik; a !deathtracker az új parancs.',
      healthColors:
        'A HealthColors telepítve van: a DeathTracker kezeli a halál elleni mentődobásokat és a haldokló, stabil és halott jelölőket, a HealthColors pedig az életerő-színeket és a sebződés/gyógyulás effekteket. Hogy ki mit kezel, azt a Beállításokban módosíthatod.',
      healthColorsSaves:
        'A HealthColors is követi a halál elleni mentődobásokat és haldokló jelölőket tesz fel. Kapcsold ki az egyiket (!aura deathsaves off), hogy ne harcoljanak a jelölőkön.',
      settingChanged: '{setting} új értéke: {value}.',
      settingRejected: '"{value}" nem érvényes érték ehhez: {setting}.',
      unknownSetting: 'Nincs "{setting}" nevű beállítás.',
      markerUnknown:
        'Ebben a játékban nincs "{marker}" jelölő, így nem fog látszani. A !deathtracker markers paranccsal láthatod a használható neveket.',
      checked: 'Ellenőrzött tokenek: {count}.',
      cleared: 'DeathTracker-jelölők eltávolítva ennyi tokenről: {count}.',
      restored: 'Visszahelyezett tokenek: {count}.',
      nothingToRestore: 'Ezek közül egyik tokent sem a DeathTracker mozgatta.',
      roleSet: '{names}: {role}.',
      stabilised: 'Stabil: {count}.',
      notDown: 'Ezek közül egyik token sem 0 életerőpontos JK.',
      synced: '{name}: {s} siker, {f} kudarc.',
      macroCreated:
        'Elkészült a(z) "{macro}" tokenművelet. A játékos kijelöli a tokenjét, és halál elleni mentődobás után rákattint.',
      journalRebuilt: 'A(z) "{help}" és "{deck}" segédletek újra elkészültek.',
      resetDone: 'A beállítások visszaálltak az alapértékekre.',
      restartNotNeeded: 'Nincs szükség újraindításra: mostantól az új sáv van használatban.',
    },
    status: {
      healthy: 'Egészséges',
      bloodied: 'Vérző',
      dying: 'Haldokló',
      stable: 'Stabil',
      dead: 'Halott',
      none: 'Nincs követve',
      pc: 'JK',
      npc: 'NJK',
      hp: 'ÉP {hp}/{max}',
      hpNoMax: 'ÉP {hp}',
      saves: 'Halál elleni mentők: {s} siker, {f} kudarc',
      unnamed: 'Egy token',
      noneHere: 'Ezen a lapon még nincs életerőpontos token.',
      page: 'Lap: {page}',
      selected: 'Kijelölt tokenek',
      actions: 'Halálakor áthelyezve',
    },
    announce: {
      dying: '{name} elesett és haldoklik.',
      stable: '{name} stabil.',
      dead: '{name} meghalt.',
      up: '{name} újra talpon van.',
      savesHint: 'A karakterlapon bejelölt halál elleni mentődobásokat menet közben számoljuk.',
    },
    menu: {
      summary: 'Ezen a lapon',
      down: 'Elesett JK-k',
      noneDown: 'Egy JK sem esett el.',
      tools: 'Eszközök',
      sandbox: 'Mod-homokozó: {version}',
      sandboxUnknown: 'ismeretlen',
      hcNote: 'A HealthColors telepítve van.',
    },
    buttons: {
      menu: 'Menü',
      status: 'Állapot',
      checkPage: 'Lap ellenőrzése',
      check: 'Kijelöltek ellenőrzése',
      settings: 'Beállítások',
      help: 'Súgó',
      stable: 'Stabilizálás',
      restore: 'Visszaállítás',
      clear: 'Jelölők törlése',
      pc: 'Legyen JK',
      npc: 'Legyen NJK',
      auto: 'Automatikus döntés',
      markers: 'Jelölők',
      macro: 'Halálmentő makró készítése',
      rebuild: 'Segédletek újraépítése',
      reset: 'Beállítások visszaállítása',
      on: 'Be',
      off: 'Ki',
      back: 'Vissza',
    },
    prompts: {
      marker: 'Jelölő',
      percent: 'Vérző ezen vagy alatta (a maximum %-a)',
      fields: 'Mezőnevek vesszővel elválasztva',
      fx: 'Effekt (típus-szín)',
      language: 'Nyelv',
    },
    sections: {
      owners: 'Ki mit kezel',
      hp: 'Életerőpontok',
      markers: 'Jelölők',
      deathSaves: 'Halál elleni mentődobások (JK)',
      onDeath: 'Amikor egy token meghal',
      looks: 'Színezés és effektek',
      general: 'Általános',
    },
    settings: {
      deathSavesBy: 'Halálmentők és 0 ÉP-s jelölők',
      coloursBy: 'Életerő-színek',
      effectsBy: 'Sebződés/gyógyulás effektek',
      language: 'Nyelv',
      hpBar: 'Életerőpont-sáv',
      bloodiedPercent: 'Vérző ennél',
      bloodiedMarker: 'Vérző jelölő',
      dyingMarker: 'Haldokló jelölő',
      stableMarker: 'Stabil jelölő',
      deadMarker: 'Halott jelölő',
      pcDetection: 'Ki számít JK-nak',
      deathSaves: 'Halálmentők követése',
      resetSheetSaves: 'Karakterlap mezőinek törlése',
      successFields: 'Sikermezők',
      failureFields: 'Kudarcmezők',
      massiveDamage: 'Hatalmas sebzés',
      announce: 'Bejelentés',
      deathLayer: 'Halottak áthelyezése ide',
      deathTurnOrder: 'Körsorrend',
      deathActionsFor: 'Érvényes',
      tintPlayers: 'JK-k színezése',
      tintNpcs: 'NJK-k színezése',
      hurtFx: 'Sebződés effekt',
      hurtFxType: 'Sebződés effekt típusa',
      healFx: 'Gyógyulás effekt',
      healFxType: 'Gyógyulás effekt típusa',
    },
    choices: {
      hpBar: { 1: '1. sáv', 2: '2. sáv', 3: '3. sáv' },
      pcDetection: { auto: 'Játékosok vagy karakterlap', players: 'Játékos irányítja' },
      deathLayer: { none: 'Marad a helyén', gmlayer: 'KM-réteg', map: 'Térképréteg' },
      deathTurnOrder: { keep: 'Megtartás', remove: 'Eltávolítás' },
      deathActionsFor: { npc: 'NJK-k', all: 'NJK-k és JK-k' },
      announce: { off: 'Ki', gm: 'KM', controllers: 'KM és játékosok' },
      none: 'Nincs',
      notInstalled: 'nincs telepítve',
    },
    help: {
      menu: 'Megnyitja a menüt.',
      status:
        'Megmutatja a kijelölt tokenek állapotát, vagy a lapodon lévő összes követett tokenét.',
      check: 'Újraértékeli a kijelölt tokeneket (all: a lapodon lévő összes tokent).',
      stable: 'A kijelölt, 0 életerőpontos JK-kat stabilnak jelöli.',
      clear:
        'Leveszi a kijelölt tokenekről a DeathTracker jelölőit és színezését, és elfelejti őket.',
      restore:
        'A DeathTracker által áthelyezett halott tokeneket visszateszi a rétegükre és a körsorrendbe.',
      role: 'A kijelölt tokenek karaktereit JK-ként vagy NJK-ként kezeli, vagy a DeathTrackerre bízza a döntést.',
      markers: 'Kilistázza a játék jelölőit a használandó nevekkel.',
      macro:
        'Tokenműveletet készít, amelyre a játékosok kattintva elküldhetik halál elleni mentődobásaikat (olyan karakterlapokhoz, amelyeket a DeathTracker nem tud olvasni).',
      dsync: 'A halálmentő makró küldi.',
      settings: 'Megnyitja a beállításokat.',
      set: 'Módosít egy beállítást.',
      reset: 'Minden beállítást visszaállít az alapértékre.',
      config:
        'A 0.1-es verzió parancsai: megnyitja a beállításokat, vagy módosít egyet (config bar|2).',
      journal: 'Újraépíti a Help és Command Deck segédleteket.',
      help: 'Megmutatja ezt a listát.',
      ids: 'Add hozzá: --ids id1,id2, hogy a kijelölés helyett azonosító alapján dolgozz a tokeneken.',
    },
    deck: {
      menuTitle: 'Menü',
      menuDesc: 'A menü, az állapot, a beállítások és a súgó.',
      selectedTitle: 'Kijelölt tokenek',
      selectedDesc: 'Jelölj ki tokeneket a térképen, majd nyomj meg egy gombot.',
      roleTitle: 'JK vagy NJK',
      roleDesc: 'A kijelölt tokenek karaktereihez.',
      toolsTitle: 'Eszközök',
      toolsDesc: 'Jelölők, a halálmentő makró és ezek a segédletek.',
      footer: 'A teljes útmutató a(z) "{help}" segédletben található.',
    },
    handout: {
      versionLabel: 'Verzió',
      subtitle:
        'Vérző, haldokló, stabil és halott, életerőpontok és halál elleni mentődobások alapján',
      footer: 'Minden parancshoz tartozó gomb itt található: "{deck}".',
      overview: {
        heading: 'Áttekintés',
        body: 'A DeathTracker figyeli minden token életerőpont-sávját. Megjelöli a vérző vagy halott tokeneket, követi a 0 életerőpontos játékos karakterek halál elleni mentődobásait, és le tudja venni a halottakat a térképről, illetve ki tudja venni őket a körsorrendből.',
      },
      quickStart: {
        heading: 'Gyors kezdés',
        steps: [
          'Tedd az életerőpontokat az 1. sávba (vagy válassz másik sávot a Beállításokban).',
          'Sebezz meg egy tokent: a maximuma felénél megkapja a Vérző jelölőt; 0-nál egy NJK megkapja a Halott jelölőt.',
          'Egy 0-n lévő JK megkapja a Haldokló jelölőt. Jelöld be a halál elleni mentődobásokat a karakterlapon: három siker Stabillá teszi, három kudarc Halottá.',
          'Gyógyítsd 0 fölé, és a jelölők eltűnnek.',
          'Írd be: !deathtracker a menühöz.',
        ],
      },
      statuses: {
        heading: 'Állapotok',
        points: [
          'Egészséges: a maximális életerőpontok Vérző határa fölött (nincs jelölő).',
          'Vérző: ezen a határon vagy alatta (50%, ha nem változtattad).',
          'Haldokló: 0 életerőpontos JK, aki halál elleni mentődobásokat dob.',
          'Stabil: 0-n lévő JK három sikerrel, vagy a stable paranccsal stabilizálva.',
          'Halott: 0-n lévő NJK, három kudarcot szerzett JK, vagy hatalmas sebzés által megölt JK.',
          'Az üres vagy számot nem tartalmazó sávot soha nem olvassuk 0-nak.',
        ],
      },
      deathSaves: {
        heading: 'Halál elleni mentődobások',
        points: [
          'D&D 2024 karakterlap: a karakterlapról olvassuk, ahogy a mezőket bejelölik vagy a dobásokat dobják.',
          'D&D 2014 karakterlap és más jelölőnégyzetes lapok: a Beállításokban megadott siker- és kudarcmezőkből olvassuk.',
          'A karakterlap gyógyulás után is megtartja a régi jelöléseket, ezért a dobásokat attól a pillanattól számoljuk, amikor a JK 0-ra esik. Ha a Karakterlap mezőinek törlése be van kapcsolva, a DeathTracker törli a karakterlap mezőit, amikor a JK 0-ra esik és amikor meggyógyul, és megjeleníti a D&D 2024 karakterlap halálmentő mezőit, amikor egy JK a tokensávról 0-ra esik.',
          'Ha a karakterlap nem olvasható, készítsd el a halálmentő makrót (!deathtracker macro): a játékosok kijelölik a tokenjüket, és minden dobás után rákattintanak.',
          'Ki számít JK-nak: játékos által irányított token vagy karakter, vagy (Játékosok vagy karakterlap) olyan, amelynek a karakterlapja szerint nem NJK. A Legyen JK / Legyen NJK gombbal dönthetsz egy karakterről.',
        ],
      },
      onDeath: {
        heading: 'Amikor egy token meghal',
        points: [
          'A halottak áthelyezése a KM-rétegre vagy a térképrétegre, és eltávolításuk a körsorrendből. Kezdetben mindkettő ki van kapcsolva.',
          'Csak az NJK-kra érvényes, hacsak nincs NJK-k és JK-k értékre állítva.',
          'Egy halott token gyógyítása leveszi a jelölőit, de nem helyezi vissza. Jelöld ki, és használd a Visszaállítás gombot (a kezdeményezésével együtt visszakerül a körsorrendbe).',
          'Hatalmas sebzés (kezdetben kikapcsolva): az a JK, akinek a sávja legalább a maximumával 0 alá megy, azonnal meghal. A 2024-es karakterlap megáll 0-nál, így ez csak akkor működik, ha a sávba 0 alatti értéket írnak.',
        ],
      },
      healthColors: {
        heading: 'HealthColors és más Modok',
        points: [
          'A Beállítások "Ki mit kezel" része határozza meg, melyik Mod kezeli a halál elleni mentődobásokat (a haldokló, stabil és halott jelölőkkel együtt), az életerő-színeket és a sebződés/gyógyulás effekteket: DeathTracker, HealthColors vagy Ki. A HealthColors 2.5-ös és újabb verziói ugyanezt a választást mutatják, és ha bármelyik Modban módosítod, mindkettőben megváltozik.',
          'Kezdetben a DeathTracker kezeli a halál elleni mentődobásokat, a HealthColors pedig a színeket és az effekteket. HealthColors nélkül a DeathTracker kezeli mindhármat.',
          'A HealthColors 2.5 előtti verziói nem osztják meg a választást: a halálmentőiket a !aura deathsaves off paranccsal kapcsold ki.',
          'A TokenMod által végzett változtatásokat észleli. Más Modok az életerőpontok módosítása után meghívhatják a DeathTracker.check(token) függvényt.',
          'A DeathTracker csak azokat a jelölőket veszi le, amelyeket maga tett fel.',
        ],
      },
      commands: {
        heading: 'Parancsok',
        intro:
          'Minden parancs a !deathtracker előtaggal kezdődik (vagy !dt, vagy a 0.1-es verzióból !dead). Csak a KM használhatja, kivéve a halálmentő makrót.',
        colCommand: 'Parancs',
        colDesc: 'Mit csinál',
      },
      settings: {
        heading: 'Beállítások',
        intro:
          'Módosíthatod őket a menüben, a !deathtracker set <beállítás> <érték> paranccsal, vagy a Mod-könyvtár beállításaiban.',
        colKey: 'Beállítás',
        colDesc: 'Mit csinál',
        rows: {
          deathSavesBy:
            'Ki követi a halál elleni mentődobásokat és teszi fel a haldokló, stabil és halott jelölőket: DeathTracker, HealthColors vagy off. Közös a HealthColors-szal.',
          coloursBy:
            'Ki színezi a tokeneket az életerőpontok szerint: DeathTracker (a saját színezése), HealthColors vagy off. Közös a HealthColors-szal.',
          effectsBy:
            'Ki játssza le a sebződés/gyógyulás effekteket: DeathTracker, HealthColors vagy off. Közös a HealthColors-szal.',
          language: 'A menük, üzenetek és segédletek nyelve.',
          hpBar: 'Az életerőpontokat tartalmazó sáv (1, 2 vagy 3).',
          bloodiedPercent:
            'Vérző a maximális életerőpontok ennyi százalékán vagy alatta (0 kikapcsolja a Vérzőt).',
          bloodiedMarker: 'A Vérző jelölője (none esetén nincs jelölő).',
          dyingMarker: 'A haldokló JK jelölője.',
          stableMarker: 'A stabil JK jelölője.',
          deadMarker: 'A halottak jelölője.',
          pcDetection:
            'auto: játékos irányítja, vagy a karakterlap szerint JK; players: csak ha játékos irányítja.',
          deathSaves: 'A 0 életerőpontos JK-k halál elleni mentődobásainak követése.',
          resetSheetSaves:
            'Törli a karakterlap halálmentő mezőit, amikor egy JK 0-ra esik és amikor meggyógyul, és megjeleníti őket a D&D 2024 karakterlapon.',
          successFields: 'Sikerek esetén bejelölt karakterlapmezők (2014 és más karakterlapok).',
          failureFields: 'Kudarcok esetén bejelölt karakterlapmezők.',
          massiveDamage:
            'Az a JK, akinek a sávja legalább a maximumával 0 alá megy, azonnal meghal.',
          announce:
            'Ki kap értesítést, amikor egy JK elesik, stabil lesz, meghal vagy feláll: off, gm vagy controllers.',
          deathLayer: 'A halottak áthelyezése ide: none, gmlayer vagy map.',
          deathTurnOrder: 'keep vagy remove a halottakat a körsorrendben.',
          deathActionsFor:
            'npc: az áthelyezés és a körsorrend az NJK-kra vonatkozik; all: a JK-kra is.',
          tintPlayers: 'A JK-k színezése zöldtől pirosig, ahogy életerőpontot veszítenek.',
          tintNpcs: 'Az NJK-k színezése ugyanígy.',
          hurtFx: 'Effekt lejátszása, amikor egy token életerőpontot veszít.',
          hurtFxType: 'Ez az effekt típus-szín formában (splatter-blood).',
          healFx: 'Effekt lejátszása, amikor egy token életerőpontot nyer.',
          healFxType: 'Ez az effekt (glow-holy).',
        },
      },
      api: {
        heading: 'Mod-szerzőknek',
        intro: 'A DeathTracker közzétesz egy DeathTracker objektumot.',
        colFunction: 'Függvény',
        colDesc: 'Mit csinál',
        rows: {
          check: 'Azonnal értékel egy tokent (miután egy Modból módosítottad az életerőpontjait).',
          getStatus: 'Egy token állapota: healthy, bloodied, dying, stable, dead vagy null.',
          onStatusChange:
            'Értesítés, amikor egy állapot megváltozik ({token, status, previous, isPc}).',
          observe:
            '0.1-es verzió: értesítés (token, prev) azután, hogy a DeathTracker kezelt egy életerőpont-változást.',
          managing:
            'True, ha a DeathTracker követi a halálmentőket: be vannak kapcsolva, és a DeathTracker van kiválasztva a kezelésükre (a HealthColors használja).',
          ownersChanged:
            'Frissíti a tokeneket, miután megváltozott, hogy ki mit kezel (a HealthColors hívja meg).',
        },
      },
      upgrading: {
        heading: 'Frissítés a 0.1-es verzióról',
        points: [
          'A jelölő-, sáv-, színezés- és effektbeállításaid átkerülnek.',
          'A !dead továbbra is működik, ahogy a !dead config és a !dead reset is.',
          'A JK-k Unconscious jelölője mostantól a Haldokló jelölő.',
          'A sáv módosítása már nem igényel újraindítást.',
        ],
      },
      troubleshooting: {
        heading: 'Hibaelhárítás',
        points: [
          'Semmi sem történik: ellenőrizd az életerőpont-sávot a Beállításokban, és hogy a sáv számot tartalmaz-e.',
          'Egy JK-t NJK-ként kezel: jelöld ki, és nyomd meg a Legyen JK gombot, vagy hagyd, hogy egy játékos irányítsa a karaktert.',
          'Egy jelölő nem látszik: használd a !deathtracker markers parancsot, és válassz nevet a listából.',
          'Egy másik Mod által módosított életerőpontokat nem észleli: annak a Modnak meg kell hívnia a DeathTracker.check(token) függvényt.',
        ],
      },
      languages: {
        heading: 'Nyelvek',
        body: 'A nyelvet a !deathtracker set language <kód> paranccsal állíthatod be.',
        colLanguage: 'Nyelv',
        colNative: 'Saját név',
        colCode: 'Kód',
      },
      credits: {
        heading: 'Készítők',
        original: 'Írta',
        maintainer: 'Az 1.0-s verzióhoz újraírta',
        support: 'Hibát találtál, vagy van egy ötleted? Írj MidNiteShadow7-nek a Roll20-on.',
      },
    },
    errors: {
      gmOnly: 'Ezt a DeathTracker-parancsot csak a KM használhatja.',
      unknownCommand: 'A DeathTrackernek nincs "{command}" parancsa.',
      noTokens: 'Előbb jelölj ki egy vagy több tokent (vagy add meg: --ids).',
      notYourToken: 'Nem te irányítod azt a tokent.',
      hint: 'Írd be: !deathtracker help a parancsok listájához.',
    },
  };

  var localeIt = {
    titles: {
      ready: 'DeathTracker è pronto.',
      menu: 'DeathTracker',
      status: 'Stato di DeathTracker',
      settings: 'Impostazioni di DeathTracker',
      help: 'Comandi di DeathTracker',
      announce: 'DeathTracker',
      markers: 'Segnalini dei token',
    },
    messages: {
      readyHint: 'Scrivi !deathtracker per aprire il menu.',
      migrated:
        'Le tue impostazioni di DeathTracker 0.1 sono state riprese. !dead funziona ancora; !deathtracker è il nuovo comando.',
      healthColors:
        'HealthColors è installato: DeathTracker gestisce i tiri contro morte e i segnalini di morente, stabile e morto, e HealthColors i colori della salute e gli effetti di ferita e cura. Cambia chi gestisce cosa nelle Impostazioni.',
      healthColorsSaves:
        'Anche HealthColors tiene traccia dei tiri salvezza contro morte e mette i segnalini di morente. Disattivane uno (!aura deathsaves off) così non si contendono i segnalini.',
      settingChanged: '{setting} ora è {value}.',
      settingRejected: '«{value}» non è un valore valido per {setting}.',
      unknownSetting: 'Non esiste un’impostazione chiamata «{setting}».',
      markerUnknown:
        'Questa partita non ha il segnalino «{marker}», quindi non verrà mostrato. Usa !deathtracker markers per vedere i nomi che puoi usare.',
      checked: 'Controllati {count} token.',
      cleared: 'Rimossi i segnalini di DeathTracker da {count} token.',
      restored: 'Rimessi a posto {count} token.',
      nothingToRestore: 'Nessuno di quei token è stato spostato da DeathTracker.',
      roleSet: '{names}: {role}.',
      stabilised: 'Stabili: {count}.',
      notDown: 'Nessuno di quei token è un PG a 0 punti ferita.',
      synced: '{name}: {s} successo/i, {f} fallimento/i.',
      macroCreated:
        'Creata l’azione del token «{macro}». Un giocatore seleziona il suo token e la clicca dopo aver tirato un tiro salvezza contro morte.',
      journalRebuilt: 'Gli handout «{help}» e «{deck}» sono stati ricreati.',
      resetDone: 'Le impostazioni sono tornate ai valori predefiniti.',
      restartNotNeeded: 'Non serve riavviare: la nuova barra viene usata da adesso.',
    },
    status: {
      healthy: 'In salute',
      bloodied: 'Sanguinante',
      dying: 'Morente',
      stable: 'Stabile',
      dead: 'Morto',
      none: 'Non tracciato',
      pc: 'PG',
      npc: 'PNG',
      hp: 'PF {hp}/{max}',
      hpNoMax: 'PF {hp}',
      saves: 'Tiri salvezza contro morte: {s} successo/i, {f} fallimento/i',
      unnamed: 'Un token',
      noneHere: 'Ancora nessun token con punti ferita in questa pagina.',
      page: 'Pagina: {page}',
      selected: 'Token selezionati',
      actions: 'Spostato alla morte',
    },
    announce: {
      dying: '{name} è a terra e sta morendo.',
      stable: '{name} è stabile.',
      dead: '{name} è morto.',
      up: '{name} è di nuovo in piedi.',
      savesHint:
        'I tiri salvezza contro morte spuntati sulla scheda vengono contati man mano che si fanno.',
    },
    menu: {
      summary: 'In questa pagina',
      down: 'PG a terra',
      noneDown: 'Nessun PG è a terra.',
      tools: 'Strumenti',
      sandbox: 'Sandbox delle Mod: {version}',
      sandboxUnknown: 'sconosciuta',
      hcNote: 'HealthColors è installato.',
    },
    buttons: {
      menu: 'Menu',
      status: 'Stato',
      checkPage: 'Controlla pagina',
      check: 'Controlla selezione',
      settings: 'Impostazioni',
      help: 'Aiuto',
      stable: 'Stabilizza',
      restore: 'Ripristina',
      clear: 'Togli segnalini',
      pc: 'Rendi PG',
      npc: 'Rendi PNG',
      auto: 'Decidi in automatico',
      markers: 'Segnalini',
      macro: 'Crea macro dei tiri contro morte',
      rebuild: 'Ricrea handout',
      reset: 'Reimposta impostazioni',
      on: 'Attivo',
      off: 'Spento',
      back: 'Indietro',
    },
    prompts: {
      marker: 'Segnalino',
      percent: 'Sanguinante pari o sotto (% del massimo)',
      fields: 'Nomi dei campi separati da virgole',
      fx: 'Effetto (tipo-colore)',
      language: 'Lingua',
    },
    sections: {
      owners: 'Chi gestisce cosa',
      hp: 'Punti ferita',
      markers: 'Segnalini',
      deathSaves: 'Tiri salvezza contro morte (PG)',
      onDeath: 'Quando un token muore',
      looks: 'Tinta ed effetti',
      general: 'Generale',
    },
    settings: {
      deathSavesBy: 'Tiri contro morte e segnalini a 0 PF',
      coloursBy: 'Colori della salute',
      effectsBy: 'Effetti di ferita e cura',
      language: 'Lingua',
      hpBar: 'Barra dei punti ferita',
      bloodiedPercent: 'Sanguinante a',
      bloodiedMarker: 'Segnalino Sanguinante',
      dyingMarker: 'Segnalino Morente',
      stableMarker: 'Segnalino Stabile',
      deadMarker: 'Segnalino Morto',
      pcDetection: 'Chi è un PG',
      deathSaves: 'Traccia i tiri contro morte',
      resetSheetSaves: 'Svuota le caselle della scheda',
      successFields: 'Campi dei successi',
      failureFields: 'Campi dei fallimenti',
      massiveDamage: 'Danni massicci',
      announce: 'Annuncia',
      deathLayer: 'Sposta i morti su',
      deathTurnOrder: 'Ordine dei turni',
      deathActionsFor: 'Si applica a',
      tintPlayers: 'Colora i PG',
      tintNpcs: 'Colora i PNG',
      hurtFx: 'Effetto di ferita',
      hurtFxType: 'Tipo di effetto di ferita',
      healFx: 'Effetto di cura',
      healFxType: 'Tipo di effetto di cura',
    },
    choices: {
      hpBar: { 1: 'Barra 1', 2: 'Barra 2', 3: 'Barra 3' },
      pcDetection: { auto: 'Giocatori o scheda', players: 'Controllato da un giocatore' },
      deathLayer: { none: 'Resta dov’è', gmlayer: 'Livello GM', map: 'Livello mappa' },
      deathTurnOrder: { keep: 'Mantieni', remove: 'Rimuovi' },
      deathActionsFor: { npc: 'PNG', all: 'PNG e PG' },
      announce: { off: 'Spento', gm: 'GM', controllers: 'GM e giocatori' },
      none: 'Nessuno',
      notInstalled: 'non installata',
    },
    help: {
      menu: 'Apri il menu.',
      status: 'Mostra lo stato dei token selezionati, o di ogni token tracciato nella tua pagina.',
      check: 'Valuta di nuovo i token selezionati (all: ogni token della tua pagina).',
      stable: 'Segna come stabili i PG selezionati a 0 punti ferita.',
      clear: 'Togli segnalini e tinta di DeathTracker dai token selezionati e dimenticali.',
      restore:
        'Rimetti i token morti spostati da DeathTracker sul loro livello e nell’ordine dei turni.',
      role: 'Tratta i personaggi dei token selezionati come PG o PNG, o lascia decidere a DeathTracker.',
      markers: 'Elenca i segnalini di questa partita, con i nomi da usare.',
      macro:
        'Crea un’azione del token che i giocatori cliccano per inviare i loro tiri salvezza contro morte (per le schede che DeathTracker non sa leggere).',
      dsync: 'Inviato dalla macro dei tiri contro morte.',
      settings: 'Apri le impostazioni.',
      set: 'Cambia un’impostazione.',
      reset: 'Riporta ogni impostazione al valore predefinito.',
      config: 'Comandi della versione 0.1: apri le impostazioni, o cambiane una (config bar|2).',
      journal: 'Ricrea gli handout Aiuto e Command Deck.',
      help: 'Mostra questo elenco.',
      ids: 'Aggiungi --ids id1,id2 per agire sui token per ID invece che sulla selezione.',
    },
    deck: {
      menuTitle: 'Menu',
      menuDesc: 'Il menu, lo stato, le impostazioni e l’aiuto.',
      selectedTitle: 'Token selezionati',
      selectedDesc: 'Seleziona dei token sulla mappa, poi premi un pulsante.',
      roleTitle: 'PG o PNG',
      roleDesc: 'Per i personaggi dei token selezionati.',
      toolsTitle: 'Strumenti',
      toolsDesc: 'I segnalini, la macro dei tiri contro morte e questi handout.',
      footer: 'La guida completa è nell’handout «{help}».',
    },
    handout: {
      versionLabel: 'Versione',
      subtitle:
        'Sanguinante, morente, stabile e morto, dai punti ferita e dai tiri salvezza contro morte',
      footer: 'I pulsanti per ogni comando sono in «{deck}».',
      overview: {
        heading: 'Panoramica',
        body: 'DeathTracker osserva la barra dei punti ferita di ogni token. Segna i token sanguinanti o morti, tiene traccia dei tiri salvezza contro morte dei personaggi giocanti a 0 punti ferita, e può togliere i morti dalla mappa e dall’ordine dei turni.',
      },
      quickStart: {
        heading: 'Avvio rapido',
        steps: [
          'Metti i punti ferita nella Barra 1 (o scegli un’altra barra nelle Impostazioni).',
          'Danneggia un token: a metà del suo massimo riceve il segnalino Sanguinante; a 0 un PNG riceve il segnalino Morto.',
          'Un PG a 0 riceve il segnalino Morente. Spunta i tiri salvezza contro morte sulla scheda: tre successi lo rendono Stabile, tre fallimenti Morto.',
          'Curalo sopra 0 e i segnalini spariscono.',
          'Scrivi !deathtracker per il menu.',
        ],
      },
      statuses: {
        heading: 'Stati',
        points: [
          'In salute: sopra la quota Sanguinante dei punti ferita massimi (nessun segnalino).',
          'Sanguinante: pari o sotto quella quota (50% salvo modifiche).',
          'Morente: un PG a 0 punti ferita che sta facendo tiri salvezza contro morte.',
          'Stabile: un PG a 0 con tre successi, o stabilizzato con il comando stable.',
          'Morto: un PNG a 0, un PG con tre fallimenti, o un PG ucciso da danni massicci.',
          'Una barra vuota, o che non contiene un numero, non viene mai letta come 0.',
        ],
      },
      deathSaves: {
        heading: 'Tiri salvezza contro morte',
        points: [
          'Scheda D&D 2024: letti dalla scheda man mano che si spuntano le caselle o si tirano i tiri salvezza.',
          'Scheda D&D 2014 e altre con caselle: letti dai campi dei successi e dei fallimenti nelle Impostazioni.',
          'La scheda conserva le vecchie spunte dopo la cura, quindi i tiri vengono contati dal momento in cui il PG scende a 0. Con Svuota le caselle della scheda attivo, DeathTracker svuota le caselle della scheda quando il PG scende a 0 e quando viene curato, e mostra le caselle dei tiri contro morte della scheda D&D 2024 quando un PG scende a 0 dalla barra del token.',
          'Se la scheda non si può leggere, crea la macro dei tiri contro morte (!deathtracker macro): i giocatori selezionano il loro token e la cliccano dopo ogni tiro.',
          'Chi è un PG: un token o personaggio controllato da un giocatore, o (Giocatori o scheda) uno la cui scheda dice che non è un PNG. Usa Rendi PG / Rendi PNG per decidere per un personaggio.',
        ],
      },
      onDeath: {
        heading: 'Quando un token muore',
        points: [
          'Sposta i morti sul livello GM o sul livello mappa, e toglili dall’ordine dei turni. Entrambe le opzioni sono spente all’inizio.',
          'Si applica solo ai PNG, a meno che non sia impostato su PNG e PG.',
          'Curare un token morto gli toglie i segnalini ma non lo rimette a posto. Selezionalo e usa Ripristina (torna nell’ordine dei turni con la sua iniziativa).',
          'Danni massicci (spento all’inizio): un PG la cui barra scende sotto 0 di almeno il suo massimo muore sul colpo. La scheda 2024 si ferma a 0, quindi funziona solo quando nella barra si scrive un valore sotto 0.',
        ],
      },
      healthColors: {
        heading: 'HealthColors e altre Mod',
        points: [
          'Chi gestisce cosa, nelle Impostazioni, sceglie quale Mod si occupa dei tiri contro morte (con i segnalini di morente, stabile e morto), dei colori della salute e degli effetti di ferita e cura: DeathTracker, HealthColors o Spento. HealthColors dalla 2.5 in poi mostra la stessa scelta, e cambiarla in una delle due Mod la cambia per entrambe.',
          'All’inizio DeathTracker gestisce i tiri contro morte e HealthColors i colori e gli effetti. Senza HealthColors, DeathTracker gestisce tutti e tre.',
          'Le versioni di HealthColors precedenti alla 2.5 non condividono la scelta: spegni i loro tiri contro morte con !aura deathsaves off.',
          'Le modifiche fatte da TokenMod vengono viste. Le altre Mod possono chiamare DeathTracker.check(token) dopo aver cambiato i punti ferita.',
          'DeathTracker toglie solo i segnalini che ha messo lui.',
        ],
      },
      commands: {
        heading: 'Comandi',
        intro:
          'Ogni comando inizia con !deathtracker (o !dt, o !dead dalla versione 0.1). Solo per il GM, tranne la macro dei tiri contro morte.',
        colCommand: 'Comando',
        colDesc: 'Cosa fa',
      },
      settings: {
        heading: 'Impostazioni',
        intro:
          'Cambiale nel menu, con !deathtracker set <setting> <value>, o nelle opzioni della libreria delle Mod.',
        colKey: 'Impostazione',
        colDesc: 'Cosa fa',
        rows: {
          deathSavesBy:
            'Chi tiene traccia dei tiri contro morte e mette i segnalini di morente, stabile e morto: DeathTracker, HealthColors o off. Condiviso con HealthColors.',
          coloursBy:
            'Chi colora i token in base ai punti ferita: DeathTracker (la sua tinta), HealthColors o off. Condiviso con HealthColors.',
          effectsBy:
            'Chi riproduce gli effetti di ferita e cura: DeathTracker, HealthColors o off. Condiviso con HealthColors.',
          language: 'Lingua di menu, messaggi e handout.',
          hpBar: 'La barra che contiene i punti ferita (1, 2 o 3).',
          bloodiedPercent:
            'Sanguinante pari o sotto questa percentuale dei punti ferita massimi (0 disattiva Sanguinante).',
          bloodiedMarker: 'Segnalino per Sanguinante (none per nessun segnalino).',
          dyingMarker: 'Segnalino per un PG morente.',
          stableMarker: 'Segnalino per un PG stabile.',
          deadMarker: 'Segnalino per i morti.',
          pcDetection:
            'auto: controllato da un giocatore o la scheda dice PG; players: solo controllato da un giocatore.',
          deathSaves: 'Traccia i tiri salvezza contro morte dei PG a 0 punti ferita.',
          resetSheetSaves:
            'Svuota le caselle dei tiri contro morte della scheda quando un PG scende a 0 e quando viene curato, e mostrale sulla scheda D&D 2024.',
          successFields: 'Campi della scheda spuntati per i successi (2014 e altre schede).',
          failureFields: 'Campi della scheda spuntati per i fallimenti.',
          massiveDamage:
            'Un PG la cui barra scende sotto 0 di almeno il suo massimo muore sul colpo.',
          announce:
            'Chi viene avvisato quando un PG cade, diventa stabile, muore o si rialza: off, gm o controllers.',
          deathLayer: 'Sposta i morti su: none, gmlayer o map.',
          deathTurnOrder: 'Mantieni (keep) o rimuovi (remove) i morti dall’ordine dei turni.',
          deathActionsFor:
            'npc: spostamento e ordine dei turni valgono per i PNG; all: anche per i PG.',
          tintPlayers: 'Colora i PG dal verde al rosso man mano che perdono punti ferita.',
          tintNpcs: 'Colora i PNG allo stesso modo.',
          hurtFx: 'Riproduci un effetto quando un token perde punti ferita.',
          hurtFxType: 'Quell’effetto, come tipo-colore (splatter-blood).',
          healFx: 'Riproduci un effetto quando un token guadagna punti ferita.',
          healFxType: 'Quell’effetto (glow-holy).',
        },
      },
      api: {
        heading: 'Per gli autori di Mod',
        intro: 'DeathTracker pubblica un oggetto DeathTracker.',
        colFunction: 'Funzione',
        colDesc: 'Cosa fa',
        rows: {
          check: 'Valuta subito un token (dopo aver cambiato i suoi punti ferita da una Mod).',
          getStatus: 'Lo stato di un token: healthy, bloodied, dying, stable, dead o null.',
          onStatusChange:
            'Essere avvisati quando cambia uno stato ({token, status, previous, isPc}).',
          observe:
            'Versione 0.1: ricevere (token, prev) dopo che DeathTracker ha gestito un cambio di punti ferita.',
          managing:
            'True quando DeathTracker tiene traccia dei tiri contro morte: sono attivi e DeathTracker è scelto per gestirli (HealthColors lo usa).',
          ownersChanged:
            'Aggiorna i token dopo che è cambiato chi gestisce cosa (HealthColors la chiama).',
        },
      },
      upgrading: {
        heading: 'Aggiornare dalla 0.1',
        points: [
          'Le tue impostazioni di segnalini, barra, tinta ed effetti vengono riprese.',
          '!dead funziona ancora, come !dead config e !dead reset.',
          'Il segnalino Privo di sensi dei PG ora è il segnalino Morente.',
          'Cambiare la barra non richiede più un riavvio.',
        ],
      },
      troubleshooting: {
        heading: 'Risoluzione dei problemi',
        points: [
          'Non succede niente: controlla la barra dei punti ferita nelle Impostazioni, e che la barra contenga un numero.',
          'Un PG viene trattato come PNG: selezionalo e premi Rendi PG, o lascia che un giocatore controlli il personaggio.',
          'Un segnalino non si vede: usa !deathtracker markers e scegli un nome dall’elenco.',
          'I punti ferita cambiati da un’altra Mod non vengono visti: quella Mod deve chiamare DeathTracker.check(token).',
        ],
      },
      languages: {
        heading: 'Lingue',
        body: 'Imposta la lingua con !deathtracker set language <code>.',
        colLanguage: 'Lingua',
        colNative: 'Nome originale',
        colCode: 'Codice',
      },
      credits: {
        heading: 'Riconoscimenti',
        original: 'Scritto da',
        maintainer: 'Riscritto per la versione 1.0 da',
        support: 'Hai trovato un problema o hai un’idea? Contatta MidNiteShadow7 su Roll20.',
      },
    },
    errors: {
      gmOnly: 'Solo il GM può usare quel comando di DeathTracker.',
      unknownCommand: 'DeathTracker non ha il comando «{command}».',
      noTokens: 'Seleziona prima uno o più token (o aggiungi --ids).',
      notYourToken: 'Non controlli quel token.',
      hint: 'Scrivi !deathtracker help per l’elenco dei comandi.',
    },
  };

  var localeJa = {
    titles: {
      ready: 'DeathTracker の準備ができました。',
      menu: 'DeathTracker',
      status: 'DeathTracker の状態',
      settings: 'DeathTracker の設定',
      help: 'DeathTracker のコマンド',
      announce: 'DeathTracker',
      markers: 'トークンマーカー',
    },
    messages: {
      readyHint: '!deathtracker と入力するとメニューが開きます。',
      migrated:
        'DeathTracker 0.1 の設定を引き継ぎました。!dead も引き続き使えますが、新しいコマンドは !deathtracker です。',
      healthColors:
        'HealthColors が導入されています。死亡セーヴと瀕死・安定状態・死亡のマーカーは DeathTracker が、HP に応じた色付けとダメージ/回復エフェクトは HealthColors が担当します。担当は設定で変更できます。',
      healthColorsSaves:
        'HealthColors も死亡セーヴを記録し、瀕死マーカーを付けています。マーカーが競合しないよう、どちらか一方をオフにしてください (!aura deathsaves off)。',
      settingChanged: '{setting} を {value} にしました。',
      settingRejected: '「{value}」は {setting} に使える値ではありません。',
      unknownSetting: '「{setting}」という設定はありません。',
      markerUnknown:
        'このゲームには「{marker}」というマーカーがないため、表示されません。!deathtracker markers で使える名前を確認してください。',
      checked: '{count} 個のトークンを確認しました。',
      cleared: '{count} 個のトークンから DeathTracker のマーカーを外しました。',
      restored: '{count} 個のトークンを元に戻しました。',
      nothingToRestore: 'それらのトークンはどれも DeathTracker が移動したものではありません。',
      roleSet: '{names}: {role}。',
      stabilised: '安定状態: {count}。',
      notDown: 'それらのトークンにヒット・ポイント 0 の PC はいません。',
      synced: '{name}: 成功 {s} 回、失敗 {f} 回。',
      macroCreated:
        'トークンアクション「{macro}」を作成しました。プレイヤーは死亡セーヴを振った後、自分のトークンを選択してこれをクリックします。',
      journalRebuilt: 'ハンドアウト「{help}」と「{deck}」を作り直しました。',
      resetDone: '設定を初期値に戻しました。',
      restartNotNeeded: '再起動は不要です。今から新しいバーが使われます。',
    },
    status: {
      healthy: '健康',
      bloodied: '重傷',
      dying: '瀕死',
      stable: '安定状態',
      dead: '死亡',
      none: '追跡対象外',
      pc: 'PC',
      npc: 'NPC',
      hp: 'HP {hp}/{max}',
      hpNoMax: 'HP {hp}',
      saves: '死亡セーヴ: 成功 {s} 回、失敗 {f} 回',
      unnamed: 'トークン',
      noneHere: 'このページにはまだヒット・ポイントを持つトークンがありません。',
      page: 'ページ: {page}',
      selected: '選択したトークン',
      actions: '死亡時に移動済み',
    },
    announce: {
      dying: '{name} は倒れ、瀕死状態です。',
      stable: '{name} は安定状態になりました。',
      dead: '{name} は死亡しました。',
      up: '{name} は再び立ち上がりました。',
      savesHint: 'シートでチェックされた死亡セーヴは、行われるたびに数えられます。',
    },
    menu: {
      summary: 'このページ',
      down: '倒れている PC',
      noneDown: '倒れている PC はいません。',
      tools: 'ツール',
      sandbox: 'Mod サンドボックス: {version}',
      sandboxUnknown: '不明',
      hcNote: 'HealthColors が導入されています。',
    },
    buttons: {
      menu: 'メニュー',
      status: '状態',
      checkPage: 'ページを確認',
      check: '選択を確認',
      settings: '設定',
      help: 'ヘルプ',
      stable: '容態安定',
      restore: '元に戻す',
      clear: 'マーカーを外す',
      pc: 'PC にする',
      npc: 'NPC にする',
      auto: '自動で判定',
      markers: 'マーカー',
      macro: '死亡セーヴのマクロを作成',
      rebuild: 'ハンドアウトを作り直す',
      reset: '設定をリセット',
      on: 'オン',
      off: 'オフ',
      back: '戻る',
    },
    prompts: {
      marker: 'マーカー',
      percent: '重傷とする値 (最大値に対する % 以下)',
      fields: 'フィールド名 (カンマ区切り)',
      fx: 'エフェクト (種類-色)',
      language: '言語',
    },
    sections: {
      owners: '担当する Mod',
      hp: 'ヒット・ポイント',
      markers: 'マーカー',
      deathSaves: '死亡セーヴ (PC)',
      onDeath: 'トークンが死亡したとき',
      looks: '色付けとエフェクト',
      general: '一般',
    },
    settings: {
      deathSavesBy: '死亡セーヴと HP 0 のマーカー',
      coloursBy: 'HP に応じた色付け',
      effectsBy: 'ダメージと回復のエフェクト',
      language: '言語',
      hpBar: 'ヒット・ポイントのバー',
      bloodiedPercent: '重傷の基準',
      bloodiedMarker: '重傷マーカー',
      dyingMarker: '瀕死マーカー',
      stableMarker: '安定状態マーカー',
      deadMarker: '死亡マーカー',
      pcDetection: 'PC の判定',
      deathSaves: '死亡セーヴを記録',
      resetSheetSaves: 'シートのチェックを消去',
      successFields: '成功のフィールド',
      failureFields: '失敗のフィールド',
      massiveDamage: '大ダメージによる即死',
      announce: '告知',
      deathLayer: '死者の移動先',
      deathTurnOrder: 'ターン順',
      deathActionsFor: '対象',
      tintPlayers: 'PC に色付け',
      tintNpcs: 'NPC に色付け',
      hurtFx: 'ダメージエフェクト',
      hurtFxType: 'ダメージエフェクトの種類',
      healFx: '回復エフェクト',
      healFxType: '回復エフェクトの種類',
    },
    choices: {
      hpBar: { 1: 'バー 1', 2: 'バー 2', 3: 'バー 3' },
      pcDetection: { auto: 'プレイヤーまたはシート', players: 'プレイヤーが操作' },
      deathLayer: { none: '移動しない', gmlayer: 'GM レイヤー', map: 'マップレイヤー' },
      deathTurnOrder: { keep: '残す', remove: '外す' },
      deathActionsFor: { npc: 'NPC', all: 'NPC と PC' },
      announce: { off: 'オフ', gm: 'GM', controllers: 'GM とプレイヤー' },
      none: 'なし',
      notInstalled: '未導入',
    },
    help: {
      menu: 'メニューを開きます。',
      status: '選択したトークン、またはページ上の追跡中の全トークンの状態を表示します。',
      check: '選択したトークンを判定し直します (all: ページ上の全トークン)。',
      stable: '選択した、ヒット・ポイント 0 の PC を安定状態にします。',
      clear: '選択したトークンから DeathTracker のマーカーと色付けを外し、追跡をやめます。',
      restore: 'DeathTracker が移動した死亡トークンを元のレイヤーとターン順に戻します。',
      role: '選択したトークンのキャラクターを PC または NPC として扱うか、DeathTracker に判定させます。',
      markers: 'このゲームにあるマーカーと、使う名前を一覧表示します。',
      macro:
        'プレイヤーがクリックして死亡セーヴを送るトークンアクションを作成します (DeathTracker が読めないシート用)。',
      dsync: '死亡セーヴのマクロから送られます。',
      settings: '設定を開きます。',
      set: '設定を変更します。',
      reset: 'すべての設定を初期値に戻します。',
      config: 'バージョン 0.1 のコマンド: 設定を開くか、1 つ変更します (config bar|2)。',
      journal: 'ヘルプと Command Deck のハンドアウトを作り直します。',
      help: 'この一覧を表示します。',
      ids: '--ids id1,id2 を付けると、選択ではなく ID でトークンを指定できます。',
    },
    deck: {
      menuTitle: 'メニュー',
      menuDesc: 'メニュー、状態、設定、ヘルプ。',
      selectedTitle: '選択したトークン',
      selectedDesc: 'マップ上のトークンを選択してからボタンを押します。',
      roleTitle: 'PC か NPC か',
      roleDesc: '選択したトークンのキャラクターに対して。',
      toolsTitle: 'ツール',
      toolsDesc: 'マーカー、死亡セーヴのマクロ、これらのハンドアウト。',
      footer: '詳しい説明はハンドアウト「{help}」にあります。',
    },
    handout: {
      versionLabel: 'バージョン',
      subtitle: 'ヒット・ポイントと死亡セーヴから、重傷・瀕死・安定状態・死亡を判定',
      footer: '全コマンドのボタンは「{deck}」にあります。',
      overview: {
        heading: '概要',
        body: 'DeathTracker はすべてのトークンのヒット・ポイントのバーを監視します。重傷や死亡のトークンにマーカーを付け、ヒット・ポイント 0 のプレイヤー・キャラクターの死亡セーヴを記録し、死者をマップとターン順から外すこともできます。',
      },
      quickStart: {
        heading: 'クイックスタート',
        steps: [
          'ヒット・ポイントをバー 1 に入れます (設定で別のバーも選べます)。',
          'トークンにダメージを与えます。最大値の半分で重傷マーカーが付き、0 になると NPC には死亡マーカーが付きます。',
          '0 になった PC には瀕死マーカーが付きます。シートで死亡セーヴをチェックします。成功 3 回で安定状態、失敗 3 回で死亡です。',
          '0 より上まで回復するとマーカーは消えます。',
          '!deathtracker と入力するとメニューが開きます。',
        ],
      },
      statuses: {
        heading: '状態',
        points: [
          '健康: 最大ヒット・ポイントに対する重傷の割合より上 (マーカーなし)。',
          '重傷: その割合以下 (変更しなければ 50%)。',
          '瀕死: ヒット・ポイント 0 で死亡セーヴを行っている PC。',
          '安定状態: 成功 3 回となった、または stable コマンドで容態安定させた、ヒット・ポイント 0 の PC。',
          '死亡: ヒット・ポイント 0 の NPC、失敗 3 回の PC、または大ダメージで即死した PC。',
          '空のバーや数値以外が入ったバーが 0 として扱われることはありません。',
        ],
      },
      deathSaves: {
        heading: '死亡セーヴ',
        points: [
          'D&D 2024 シート: チェックやセーヴのロールに合わせてシートから読み取ります。',
          'D&D 2014 シートなどチェックボックスのあるシート: 設定の成功と失敗のフィールドから読み取ります。',
          'シートは回復後も古いチェックを残すため、セーヴは PC が 0 になった時点から数えます。「シートのチェックを消去」がオンなら、PC が 0 になったときと回復したときに DeathTracker がシートのチェックを消去し、トークンのバーから PC が 0 になったときには D&D 2024 シートの死亡セーヴ欄を表示します。',
          'シートを読み取れない場合は死亡セーヴのマクロを作成します (!deathtracker macro)。プレイヤーはセーヴのたびに自分のトークンを選択してこれをクリックします。',
          'PC の判定: プレイヤーが操作するトークンやキャラクター、または (プレイヤーまたはシート) シートで NPC ではないとされているもの。キャラクターごとに決めるには「PC にする」/「NPC にする」を使います。',
        ],
      },
      onDeath: {
        heading: 'トークンが死亡したとき',
        points: [
          '死者を GM レイヤーまたはマップレイヤーに移し、ターン順から外します。どちらも最初はオフです。',
          '「NPC と PC」にしない限り、NPC にのみ適用されます。',
          '死亡したトークンを回復するとマーカーは消えますが、元の位置には戻りません。選択して「元に戻す」を使います (イニシアチブ付きでターン順に戻ります)。',
          '大ダメージによる即死 (最初はオフ): バーが 0 を最大値以上下回った PC は即死します。2024 シートは 0 で止まるため、これはバーに 0 未満の値を直接入力した場合のみ働きます。',
        ],
      },
      healthColors: {
        heading: 'HealthColors とほかの Mod',
        points: [
          '設定の「担当する Mod」で、死亡セーヴ (瀕死・安定状態・死亡のマーカーを含む)、HP に応じた色付け、ダメージ/回復エフェクトをどの Mod が扱うかを選びます: DeathTracker、HealthColors、オフ。HealthColors 2.5 以降にも同じ選択肢があり、どちらの Mod で変更しても両方に反映されます。',
          '最初は死亡セーヴを DeathTracker が、色付けとエフェクトを HealthColors が担当します。HealthColors がなければ、3 つとも DeathTracker が担当します。',
          '2.5 より前の HealthColors はこの選択を共有しません。!aura deathsaves off で HealthColors 側の死亡セーヴをオフにしてください。',
          'TokenMod による変更は検知されます。ほかの Mod はヒット・ポイントを変えた後に DeathTracker.check(token) を呼べます。',
          'DeathTracker は自分が付けたマーカーだけを外します。',
        ],
      },
      commands: {
        heading: 'コマンド',
        intro:
          'すべてのコマンドは !deathtracker (または !dt、バージョン 0.1 からの !dead) で始まります。死亡セーヴのマクロを除き、GM 専用です。',
        colCommand: 'コマンド',
        colDesc: '内容',
      },
      settings: {
        heading: '設定',
        intro:
          'メニュー、!deathtracker set <setting> <value>、または Mod ライブラリのオプションで変更します。',
        colKey: '設定',
        colDesc: '内容',
        rows: {
          deathSavesBy:
            '死亡セーヴを記録し、瀕死・安定状態・死亡のマーカーを付ける Mod: DeathTracker、HealthColors、off。HealthColors と共有します。',
          coloursBy:
            'ヒット・ポイントに応じてトークンを色付けする Mod: DeathTracker (自身の色付け)、HealthColors、off。HealthColors と共有します。',
          effectsBy:
            'ダメージと回復のエフェクトを再生する Mod: DeathTracker、HealthColors、off。HealthColors と共有します。',
          language: 'メニュー、メッセージ、ハンドアウトの言語。',
          hpBar: 'ヒット・ポイントを入れるバー (1、2、3)。',
          bloodiedPercent: '最大ヒット・ポイントに対してこの割合以下で重傷 (0 で重傷はオフ)。',
          bloodiedMarker: '重傷のマーカー (none でマーカーなし)。',
          dyingMarker: '瀕死の PC のマーカー。',
          stableMarker: '安定状態の PC のマーカー。',
          deadMarker: '死者のマーカー。',
          pcDetection:
            'auto: プレイヤーが操作しているか、シートが PC としている。players: プレイヤーが操作している場合のみ。',
          deathSaves: 'ヒット・ポイント 0 の PC の死亡セーヴを記録します。',
          resetSheetSaves:
            'PC が 0 になったときと回復したときにシートの死亡セーヴ欄を消去し、D&D 2024 シートではそれを表示します。',
          successFields: '成功でチェックされるシートのフィールド (2014 などのシート)。',
          failureFields: '失敗でチェックされるシートのフィールド。',
          massiveDamage: 'バーが 0 を最大値以上下回った PC は即死します。',
          announce:
            'PC が倒れた、安定状態になった、死亡した、起き上がったときに誰に知らせるか: off、gm、controllers。',
          deathLayer: '死者の移動先: none、gmlayer、map。',
          deathTurnOrder: '死者をターン順に keep (残す) か remove (外す) か。',
          deathActionsFor: 'npc: 移動とターン順は NPC に適用。all: PC にも適用。',
          tintPlayers: 'ヒット・ポイントが減るにつれて PC を緑から赤に色付けします。',
          tintNpcs: 'NPC も同じように色付けします。',
          hurtFx: 'トークンがヒット・ポイントを失ったときにエフェクトを再生します。',
          hurtFxType: 'そのエフェクト。種類-色の形式 (splatter-blood)。',
          healFx: 'トークンがヒット・ポイントを得たときにエフェクトを再生します。',
          healFxType: 'そのエフェクト (glow-holy)。',
        },
      },
      api: {
        heading: 'Mod 作者向け',
        intro: 'DeathTracker は DeathTracker オブジェクトを公開しています。',
        colFunction: '関数',
        colDesc: '内容',
        rows: {
          check: 'トークンを今すぐ判定します (Mod からヒット・ポイントを変えた後に)。',
          getStatus: 'トークンの状態: healthy、bloodied、dying、stable、dead または null。',
          onStatusChange: '状態が変わったときに通知を受けます ({token, status, previous, isPc})。',
          observe:
            'バージョン 0.1: DeathTracker がヒット・ポイントの変化を処理した後に (token, prev) で通知を受けます。',
          managing:
            'DeathTracker が死亡セーヴを記録しているとき true。死亡セーヴがオンで、担当に DeathTracker が選ばれている場合です (HealthColors が使用)。',
          ownersChanged:
            '担当する Mod が変わった後に、トークンを最新の状態にします (HealthColors が呼び出します)。',
        },
      },
      upgrading: {
        heading: '0.1 からのアップグレード',
        points: [
          'マーカー、バー、色付け、エフェクトの設定は引き継がれます。',
          '!dead は引き続き使え、!dead config と !dead reset も同様です。',
          'PC の Unconscious マーカーは瀕死マーカーになりました。',
          'バーを変えても再起動は不要になりました。',
        ],
      },
      troubleshooting: {
        heading: 'トラブルシューティング',
        points: [
          '何も起きない: 設定のヒット・ポイントのバーと、そのバーに数値が入っているかを確認してください。',
          'PC が NPC として扱われる: 選択して「PC にする」を押すか、キャラクターをプレイヤーに操作させてください。',
          'マーカーが表示されない: !deathtracker markers を使い、一覧から名前を選んでください。',
          'ほかの Mod が変えたヒット・ポイントが検知されない: その Mod が DeathTracker.check(token) を呼ぶ必要があります。',
        ],
      },
      languages: {
        heading: '言語',
        body: '!deathtracker set language <code> で言語を設定します。',
        colLanguage: '言語',
        colNative: '現地語名',
        colCode: 'コード',
      },
      credits: {
        heading: 'クレジット',
        original: '作者',
        maintainer: 'バージョン 1.0 への書き直し',
        support: '問題やアイデアがあれば、Roll20 の MidNiteShadow7 までご連絡ください。',
      },
    },
    errors: {
      gmOnly: 'その DeathTracker コマンドは GM しか使えません。',
      unknownCommand: 'DeathTracker に「{command}」というコマンドはありません。',
      noTokens: '先にトークンを 1 つ以上選択してください (または --ids を付けてください)。',
      notYourToken: 'そのトークンを操作する権限がありません。',
      hint: 'コマンドの一覧は !deathtracker help で確認できます。',
    },
  };

  var localeKo = {
    titles: {
      ready: 'DeathTracker가 준비되었습니다.',
      menu: 'DeathTracker',
      status: 'DeathTracker 상태',
      settings: 'DeathTracker 설정',
      help: 'DeathTracker 명령어',
      announce: 'DeathTracker',
      markers: '토큰 마커',
    },
    messages: {
      readyHint: '!deathtracker를 입력하면 메뉴가 열립니다.',
      migrated:
        'DeathTracker 0.1 설정을 그대로 가져왔습니다. !dead도 계속 쓸 수 있으며, 새 명령어는 !deathtracker입니다.',
      healthColors:
        'HealthColors가 설치되어 있습니다. 죽음 내성 굴림과 빈사·안정·사망 마커는 DeathTracker가, 히트 포인트 색상과 피해/치유 효과는 HealthColors가 맡습니다. 담당 Mod는 설정에서 바꿀 수 있습니다.',
      healthColorsSaves:
        'HealthColors도 죽음 내성 굴림을 추적하고 빈사 마커를 붙이고 있습니다. 마커를 두고 충돌하지 않도록 둘 중 하나를 끄세요 (!aura deathsaves off).',
      settingChanged: '{setting}을(를) {value}(으)로 바꿨습니다.',
      settingRejected: '"{value}"은(는) {setting}에 쓸 수 있는 값이 아닙니다.',
      unknownSetting: '"{setting}"이라는 설정은 없습니다.',
      markerUnknown:
        '이 게임에는 "{marker}" 마커가 없어 표시되지 않습니다. !deathtracker markers로 쓸 수 있는 이름을 확인하세요.',
      checked: '토큰 {count}개를 확인했습니다.',
      cleared: '토큰 {count}개에서 DeathTracker 마커를 제거했습니다.',
      restored: '토큰 {count}개를 되돌렸습니다.',
      nothingToRestore: '그 토큰 중 DeathTracker가 옮긴 것은 없습니다.',
      roleSet: '{names}: {role}.',
      stabilised: '안정: {count}.',
      notDown: '그 토큰 중 히트 포인트가 0인 PC는 없습니다.',
      synced: '{name}: 성공 {s}회, 실패 {f}회.',
      macroCreated:
        '토큰 액션 "{macro}"을(를) 만들었습니다. 플레이어는 죽음 내성 굴림을 굴린 뒤 자기 토큰을 선택하고 이것을 클릭합니다.',
      journalRebuilt: '"{help}" 및 "{deck}" 핸드아웃을 다시 만들었습니다.',
      resetDone: '설정을 기본값으로 되돌렸습니다.',
      restartNotNeeded: '다시 시작할 필요가 없습니다. 지금부터 새 바를 사용합니다.',
    },
    status: {
      healthy: '건강',
      bloodied: '중상',
      dying: '빈사',
      stable: '안정',
      dead: '사망',
      none: '추적 안 함',
      pc: 'PC',
      npc: 'NPC',
      hp: 'HP {hp}/{max}',
      hpNoMax: 'HP {hp}',
      saves: '죽음 내성 굴림: 성공 {s}회, 실패 {f}회',
      unnamed: '토큰',
      noneHere: '이 페이지에는 아직 히트 포인트가 있는 토큰이 없습니다.',
      page: '페이지: {page}',
      selected: '선택한 토큰',
      actions: '사망 시 옮겨짐',
    },
    announce: {
      dying: '{name}이(가) 쓰러져 죽어 가고 있습니다.',
      stable: '{name}이(가) 안정되었습니다.',
      dead: '{name}이(가) 사망했습니다.',
      up: '{name}이(가) 다시 일어섰습니다.',
      savesHint: '시트에 체크한 죽음 내성 굴림은 할 때마다 집계됩니다.',
    },
    menu: {
      summary: '이 페이지',
      down: '쓰러진 PC',
      noneDown: '쓰러진 PC가 없습니다.',
      tools: '도구',
      sandbox: 'Mod 샌드박스: {version}',
      sandboxUnknown: '알 수 없음',
      hcNote: 'HealthColors가 설치되어 있습니다.',
    },
    buttons: {
      menu: '메뉴',
      status: '상태',
      checkPage: '페이지 확인',
      check: '선택 확인',
      settings: '설정',
      help: '도움말',
      stable: '안정화',
      restore: '되돌리기',
      clear: '마커 제거',
      pc: 'PC로 지정',
      npc: 'NPC로 지정',
      auto: '자동으로 판단',
      markers: '마커',
      macro: '죽음 내성 굴림 매크로 만들기',
      rebuild: '핸드아웃 다시 만들기',
      reset: '설정 초기화',
      on: '켜기',
      off: '끄기',
      back: '뒤로',
    },
    prompts: {
      marker: '마커',
      percent: '중상 기준 (최대치의 % 이하)',
      fields: '필드 이름 (쉼표로 구분)',
      fx: '효과 (종류-색상)',
      language: '언어',
    },
    sections: {
      owners: '담당 Mod',
      hp: '히트 포인트',
      markers: '마커',
      deathSaves: '죽음 내성 굴림 (PC)',
      onDeath: '토큰이 사망하면',
      looks: '색조와 효과',
      general: '일반',
    },
    settings: {
      deathSavesBy: '죽음 내성 굴림과 0 HP 마커',
      coloursBy: '히트 포인트 색상',
      effectsBy: '피해와 치유 효과',
      language: '언어',
      hpBar: '히트 포인트 바',
      bloodiedPercent: '중상 기준',
      bloodiedMarker: '중상 마커',
      dyingMarker: '빈사 마커',
      stableMarker: '안정 마커',
      deadMarker: '사망 마커',
      pcDetection: 'PC 판단 기준',
      deathSaves: '죽음 내성 굴림 추적',
      resetSheetSaves: '시트 체크 지우기',
      successFields: '성공 필드',
      failureFields: '실패 필드',
      massiveDamage: '막대한 피해',
      announce: '알림',
      deathLayer: '사망자 이동 위치',
      deathTurnOrder: '턴 순서',
      deathActionsFor: '적용 대상',
      tintPlayers: 'PC 색조',
      tintNpcs: 'NPC 색조',
      hurtFx: '피해 효과',
      hurtFxType: '피해 효과 종류',
      healFx: '치유 효과',
      healFxType: '치유 효과 종류',
    },
    choices: {
      hpBar: { 1: '바 1', 2: '바 2', 3: '바 3' },
      pcDetection: { auto: '플레이어 또는 시트', players: '플레이어가 조종' },
      deathLayer: { none: '그대로 둠', gmlayer: 'GM 레이어', map: '맵 레이어' },
      deathTurnOrder: { keep: '유지', remove: '제거' },
      deathActionsFor: { npc: 'NPC', all: 'NPC와 PC' },
      announce: { off: '끄기', gm: 'GM', controllers: 'GM과 플레이어' },
      none: '없음',
      notInstalled: '설치 안 됨',
    },
    help: {
      menu: '메뉴를 엽니다.',
      status: '선택한 토큰, 또는 페이지에서 추적 중인 모든 토큰의 상태를 보여 줍니다.',
      check: '선택한 토큰을 다시 판단합니다 (all: 페이지의 모든 토큰).',
      stable: '선택한 PC 중 히트 포인트가 0인 PC를 안정 상태로 표시합니다.',
      clear: '선택한 토큰에서 DeathTracker의 마커와 색조를 지우고 추적을 그만둡니다.',
      restore: 'DeathTracker가 옮긴 사망 토큰을 원래 레이어와 턴 순서로 되돌립니다.',
      role: '선택한 토큰의 캐릭터를 PC 또는 NPC로 취급하거나, DeathTracker가 판단하게 합니다.',
      markers: '이 게임에 있는 마커와 사용할 이름을 나열합니다.',
      macro:
        '플레이어가 클릭해 죽음 내성 굴림을 보내는 토큰 액션을 만듭니다 (DeathTracker가 읽을 수 없는 시트용).',
      dsync: '죽음 내성 굴림 매크로가 보냅니다.',
      settings: '설정을 엽니다.',
      set: '설정을 바꿉니다.',
      reset: '모든 설정을 기본값으로 되돌립니다.',
      config: '버전 0.1 명령어: 설정을 열거나 하나를 바꿉니다 (config bar|2).',
      journal: '도움말과 Command Deck 핸드아웃을 다시 만듭니다.',
      help: '이 목록을 보여 줍니다.',
      ids: '--ids id1,id2를 붙이면 선택 대신 ID로 토큰을 지정합니다.',
    },
    deck: {
      menuTitle: '메뉴',
      menuDesc: '메뉴, 상태, 설정, 도움말.',
      selectedTitle: '선택한 토큰',
      selectedDesc: '맵에서 토큰을 선택한 다음 버튼을 누르세요.',
      roleTitle: 'PC 또는 NPC',
      roleDesc: '선택한 토큰의 캐릭터에 적용됩니다.',
      toolsTitle: '도구',
      toolsDesc: '마커, 죽음 내성 굴림 매크로, 그리고 이 핸드아웃들.',
      footer: '전체 안내는 "{help}" 핸드아웃에 있습니다.',
    },
    handout: {
      versionLabel: '버전',
      subtitle: '히트 포인트와 죽음 내성 굴림으로 중상, 빈사, 안정, 사망을 판단',
      footer: '모든 명령어의 버튼은 "{deck}"에 있습니다.',
      overview: {
        heading: '개요',
        body: 'DeathTracker는 모든 토큰의 히트 포인트 바를 지켜봅니다. 중상이거나 사망한 토큰에 마커를 붙이고, 히트 포인트가 0인 플레이어 캐릭터의 죽음 내성 굴림을 추적하며, 사망자를 맵과 턴 순서에서 빼낼 수도 있습니다.',
      },
      quickStart: {
        heading: '빠른 시작',
        steps: [
          '히트 포인트를 바 1에 넣습니다 (설정에서 다른 바를 고를 수도 있습니다).',
          '토큰에 피해를 줍니다. 최대치의 절반이 되면 중상 마커가 붙고, 0이 되면 NPC에는 사망 마커가 붙습니다.',
          '0이 된 PC에는 빈사 마커가 붙습니다. 시트에서 죽음 내성 굴림을 체크하세요. 성공 3회면 안정, 실패 3회면 사망입니다.',
          '0보다 높게 치유하면 마커가 사라집니다.',
          '!deathtracker를 입력하면 메뉴가 열립니다.',
        ],
      },
      statuses: {
        heading: '상태',
        points: [
          '건강: 최대 히트 포인트 중 중상 비율보다 높음 (마커 없음).',
          '중상: 그 비율 이하 (바꾸지 않으면 50%).',
          '빈사: 히트 포인트가 0이고 죽음 내성 굴림을 하고 있는 PC.',
          '안정: 성공 3회를 거두었거나 stable 명령어로 안정화된, 히트 포인트가 0인 PC.',
          '사망: 히트 포인트가 0인 NPC, 실패 3회인 PC, 또는 막대한 피해로 죽은 PC.',
          '비어 있거나 숫자가 아닌 값이 든 바는 절대 0으로 읽지 않습니다.',
        ],
      },
      deathSaves: {
        heading: '죽음 내성 굴림',
        points: [
          'D&D 2024 시트: 칸을 체크하거나 굴림을 할 때 시트에서 읽습니다.',
          'D&D 2014 시트 등 체크 칸이 있는 시트: 설정의 성공 및 실패 필드에서 읽습니다.',
          '시트는 치유된 뒤에도 예전 체크를 남겨 두므로, 굴림은 PC가 0이 된 순간부터 셉니다. 시트 체크 지우기가 켜져 있으면 DeathTracker는 PC가 0이 될 때와 치유될 때 시트의 체크 칸을 지우고, 토큰 바에서 PC가 0이 되면 D&D 2024 시트의 죽음 내성 굴림 칸을 보여 줍니다.',
          '시트를 읽을 수 없으면 죽음 내성 굴림 매크로를 만드세요 (!deathtracker macro). 플레이어는 굴림마다 자기 토큰을 선택하고 이것을 클릭합니다.',
          'PC 판단 기준: 플레이어가 조종하는 토큰이나 캐릭터, 또는 (플레이어 또는 시트) 시트에 NPC가 아니라고 되어 있는 것. 캐릭터별로 정하려면 PC로 지정 / NPC로 지정을 쓰세요.',
        ],
      },
      onDeath: {
        heading: '토큰이 사망하면',
        points: [
          '사망자를 GM 레이어나 맵 레이어로 옮기고 턴 순서에서 뺍니다. 둘 다 처음에는 꺼져 있습니다.',
          'NPC와 PC로 설정하지 않는 한 NPC에만 적용됩니다.',
          '사망한 토큰을 치유하면 마커는 사라지지만 원래 자리로 돌아가지는 않습니다. 선택하고 되돌리기를 쓰세요 (우선권 값과 함께 턴 순서로 돌아갑니다).',
          '막대한 피해 (처음에는 꺼짐): 바가 0 아래로 최대치 이상 내려간 PC는 즉사합니다. 2024 시트는 0에서 멈추므로, 바에 0 미만 값을 직접 입력할 때만 작동합니다.',
        ],
      },
      healthColors: {
        heading: 'HealthColors와 다른 Mod',
        points: [
          '설정의 담당 Mod에서 죽음 내성 굴림(빈사, 안정, 사망 마커 포함), 히트 포인트 색상, 피해/치유 효과를 어느 Mod가 맡을지 고릅니다: DeathTracker, HealthColors 또는 끄기. HealthColors 2.5 이상에도 같은 선택지가 있으며, 어느 Mod에서 바꾸든 양쪽에 함께 적용됩니다.',
          '처음에는 죽음 내성 굴림은 DeathTracker가, 색상과 효과는 HealthColors가 맡습니다. HealthColors가 없으면 DeathTracker가 세 가지를 모두 맡습니다.',
          'HealthColors 2.5 이전 버전은 이 선택을 공유하지 않습니다. !aura deathsaves off로 HealthColors 쪽의 죽음 내성 굴림을 끄세요.',
          'TokenMod가 바꾼 내용은 감지됩니다. 다른 Mod는 히트 포인트를 바꾼 뒤 DeathTracker.check(token)을 호출할 수 있습니다.',
          'DeathTracker는 자신이 붙인 마커만 제거합니다.',
        ],
      },
      commands: {
        heading: '명령어',
        intro:
          '모든 명령어는 !deathtracker (또는 !dt, 버전 0.1부터 쓰던 !dead)로 시작합니다. 죽음 내성 굴림 매크로를 빼면 GM 전용입니다.',
        colCommand: '명령어',
        colDesc: '기능',
      },
      settings: {
        heading: '설정',
        intro:
          '메뉴에서, !deathtracker set <setting> <value>로, 또는 Mod 라이브러리 옵션에서 바꿉니다.',
        colKey: '설정',
        colDesc: '기능',
        rows: {
          deathSavesBy:
            '죽음 내성 굴림을 추적하고 빈사, 안정, 사망 마커를 붙일 Mod: DeathTracker, HealthColors 또는 off. HealthColors와 공유됩니다.',
          coloursBy:
            '히트 포인트에 따라 토큰에 색을 입힐 Mod: DeathTracker(자체 색조), HealthColors 또는 off. HealthColors와 공유됩니다.',
          effectsBy:
            '피해와 치유 효과를 재생할 Mod: DeathTracker, HealthColors 또는 off. HealthColors와 공유됩니다.',
          language: '메뉴, 메시지, 핸드아웃의 언어.',
          hpBar: '히트 포인트를 담는 바 (1, 2 또는 3).',
          bloodiedPercent: '최대 히트 포인트의 이 비율 이하이면 중상 (0이면 중상을 끔).',
          bloodiedMarker: '중상 마커 (none이면 마커 없음).',
          dyingMarker: '빈사 PC의 마커.',
          stableMarker: '안정 PC의 마커.',
          deadMarker: '사망자의 마커.',
          pcDetection:
            'auto: 플레이어가 조종하거나 시트에 PC로 되어 있음. players: 플레이어가 조종하는 경우만.',
          deathSaves: '히트 포인트가 0인 PC의 죽음 내성 굴림을 추적합니다.',
          resetSheetSaves:
            'PC가 0이 될 때와 치유될 때 시트의 죽음 내성 굴림 칸을 지우고, D&D 2024 시트에서는 그 칸을 보여 줍니다.',
          successFields: '성공 시 체크되는 시트 필드 (2014 및 기타 시트).',
          failureFields: '실패 시 체크되는 시트 필드.',
          massiveDamage: '바가 0 아래로 최대치 이상 내려간 PC는 즉사합니다.',
          announce:
            'PC가 쓰러지거나, 안정되거나, 사망하거나, 일어설 때 알릴 대상: off, gm 또는 controllers.',
          deathLayer: '사망자를 옮길 곳: none, gmlayer 또는 map.',
          deathTurnOrder: '사망자를 턴 순서에 keep(유지) 또는 remove(제거).',
          deathActionsFor: 'npc: 이동과 턴 순서는 NPC에 적용. all: PC에도 적용.',
          tintPlayers: '히트 포인트가 줄어들수록 PC를 초록에서 빨강으로 물들입니다.',
          tintNpcs: 'NPC도 같은 방식으로 물들입니다.',
          hurtFx: '토큰이 히트 포인트를 잃으면 효과를 재생합니다.',
          hurtFxType: '그 효과, 종류-색상 형식 (splatter-blood).',
          healFx: '토큰이 히트 포인트를 얻으면 효과를 재생합니다.',
          healFxType: '그 효과 (glow-holy).',
        },
      },
      api: {
        heading: 'Mod 제작자용',
        intro: 'DeathTracker는 DeathTracker 객체를 공개합니다.',
        colFunction: '함수',
        colDesc: '기능',
        rows: {
          check: '토큰을 지금 판단합니다 (Mod로 히트 포인트를 바꾼 뒤).',
          getStatus: '토큰의 상태: healthy, bloodied, dying, stable, dead 또는 null.',
          onStatusChange: '상태가 바뀌면 알림을 받습니다 ({token, status, previous, isPc}).',
          observe:
            '버전 0.1: DeathTracker가 히트 포인트 변화를 처리한 뒤 (token, prev)로 알림을 받습니다.',
          managing:
            'DeathTracker가 죽음 내성 굴림을 추적 중이면 true: 추적이 켜져 있고 DeathTracker가 담당으로 선택된 경우 (HealthColors가 사용).',
          ownersChanged: '담당 Mod가 바뀐 뒤 토큰을 최신 상태로 맞춥니다 (HealthColors가 호출).',
        },
      },
      upgrading: {
        heading: '0.1에서 업그레이드',
        points: [
          '마커, 바, 색조, 효과 설정은 그대로 이어집니다.',
          '!dead는 계속 작동하며, !dead config와 !dead reset도 마찬가지입니다.',
          'PC용 Unconscious 마커는 이제 빈사 마커입니다.',
          '바를 바꿔도 더 이상 다시 시작할 필요가 없습니다.',
        ],
      },
      troubleshooting: {
        heading: '문제 해결',
        points: [
          '아무 일도 일어나지 않음: 설정의 히트 포인트 바와, 그 바에 숫자가 들어 있는지 확인하세요.',
          'PC가 NPC로 취급됨: 선택하고 PC로 지정을 누르거나, 플레이어가 캐릭터를 조종하게 하세요.',
          '마커가 보이지 않음: !deathtracker markers를 쓰고 목록에서 이름을 고르세요.',
          '다른 Mod가 바꾼 히트 포인트가 감지되지 않음: 그 Mod가 DeathTracker.check(token)을 호출해야 합니다.',
        ],
      },
      languages: {
        heading: '언어',
        body: '!deathtracker set language <code>로 언어를 설정합니다.',
        colLanguage: '언어',
        colNative: '현지어 이름',
        colCode: '코드',
      },
      credits: {
        heading: '만든 사람',
        original: '원작자',
        maintainer: '버전 1.0 재작성',
        support: '문제를 발견했거나 아이디어가 있나요? Roll20의 MidNiteShadow7에게 연락하세요.',
      },
    },
    errors: {
      gmOnly: '그 DeathTracker 명령어는 GM만 쓸 수 있습니다.',
      unknownCommand: 'DeathTracker에는 "{command}" 명령어가 없습니다.',
      noTokens: '먼저 토큰을 하나 이상 선택하세요 (또는 --ids를 붙이세요).',
      notYourToken: '그 토큰을 조종할 권한이 없습니다.',
      hint: '명령어 목록은 !deathtracker help를 입력하세요.',
    },
  };

  var localePl = {
    titles: {
      ready: 'DeathTracker jest gotowy.',
      menu: 'DeathTracker',
      status: 'DeathTracker – stan',
      settings: 'DeathTracker – ustawienia',
      help: 'DeathTracker – polecenia',
      announce: 'DeathTracker',
      markers: 'Znaczniki żetonów',
    },
    messages: {
      readyHint: 'Wpisz !deathtracker, aby otworzyć menu.',
      migrated:
        'Twoje ustawienia z DeathTracker 0.1 zostały przeniesione. !dead nadal działa; !deathtracker to nowe polecenie.',
      healthColors:
        'HealthColors jest zainstalowany: DeathTracker obsługuje rzuty obronne przed śmiercią oraz znaczniki umierania, stabilności i śmierci, a HealthColors kolory zdrowia i efekty obrażeń/leczenia. Zmień, kto czym się zajmuje, w Ustawieniach.',
      healthColorsSaves:
        'HealthColors również śledzi rzuty obronne przed śmiercią i ustawia znaczniki umierania. Wyłącz jeden z nich (!aura deathsaves off), aby nie walczyły o znaczniki.',
      settingChanged: '{setting} ma teraz wartość {value}.',
      settingRejected: '"{value}" nie jest prawidłową wartością dla {setting}.',
      unknownSetting: 'Nie ma ustawienia o nazwie "{setting}".',
      markerUnknown:
        'Ta gra nie ma znacznika "{marker}", więc nie będzie widoczny. Użyj !deathtracker markers, aby zobaczyć nazwy, których możesz użyć.',
      checked: 'Sprawdzono żetony: {count}.',
      cleared: 'Usunięto znaczniki DeathTrackera z żetonów: {count}.',
      restored: 'Przywrócono żetony: {count}.',
      nothingToRestore: 'Żaden z tych żetonów nie został przeniesiony przez DeathTracker.',
      roleSet: '{names}: {role}.',
      stabilised: 'Stabilni: {count}.',
      notDown: 'Żaden z tych żetonów nie jest BG z 0 punktów wytrzymałości.',
      synced: '{name}: sukcesy {s}, porażki {f}.',
      macroCreated:
        'Utworzono akcję żetonu "{macro}". Gracz zaznacza swój żeton i klika ją po rzucie obronnym przed śmiercią.',
      journalRebuilt: 'Notatki "{help}" i "{deck}" zostały odbudowane.',
      resetDone: 'Ustawienia przywrócono do domyślnych.',
      restartNotNeeded: 'Restart nie jest potrzebny: nowy pasek jest używany od teraz.',
    },
    status: {
      healthy: 'Zdrowy',
      bloodied: 'Zakrwawiony',
      dying: 'Umierający',
      stable: 'Stabilny',
      dead: 'Martwy',
      none: 'Nieśledzony',
      pc: 'BG',
      npc: 'BN',
      hp: 'PW {hp}/{max}',
      hpNoMax: 'PW {hp}',
      saves: 'Rzuty obronne przed śmiercią: sukcesy {s}, porażki {f}',
      unnamed: 'Żeton',
      noneHere: 'Na tej stronie nie ma jeszcze żetonów z punktami wytrzymałości.',
      page: 'Strona: {page}',
      selected: 'Zaznaczone żetony',
      actions: 'Przeniesiony po śmierci',
    },
    announce: {
      dying: '{name} pada i umiera.',
      stable: '{name} jest w stanie stabilnym.',
      dead: '{name} nie żyje.',
      up: '{name} znów stoi na nogach.',
      savesHint: 'Rzuty obronne przed śmiercią zaznaczone na karcie są liczone na bieżąco.',
    },
    menu: {
      summary: 'Na tej stronie',
      down: 'Powaleni BG',
      noneDown: 'Żaden BG nie jest powalony.',
      tools: 'Narzędzia',
      sandbox: 'Piaskownica Modów: {version}',
      sandboxUnknown: 'nieznana',
      hcNote: 'HealthColors jest zainstalowany.',
    },
    buttons: {
      menu: 'Menu',
      status: 'Stan',
      checkPage: 'Sprawdź stronę',
      check: 'Sprawdź zaznaczone',
      settings: 'Ustawienia',
      help: 'Pomoc',
      stable: 'Ustabilizuj',
      restore: 'Przywróć',
      clear: 'Usuń znaczniki',
      pc: 'Ustaw jako BG',
      npc: 'Ustaw jako BN',
      auto: 'Decyduj automatycznie',
      markers: 'Znaczniki',
      macro: 'Utwórz makro rzutów przed śmiercią',
      rebuild: 'Odbuduj notatki',
      reset: 'Resetuj ustawienia',
      on: 'Wł.',
      off: 'Wył.',
      back: 'Wstecz',
    },
    prompts: {
      marker: 'Znacznik',
      percent: 'Zakrwawiony przy lub poniżej (% maksimum)',
      fields: 'Nazwy pól oddzielone przecinkami',
      fx: 'Efekt (typ-kolor)',
      language: 'Język',
    },
    sections: {
      owners: 'Kto czym się zajmuje',
      hp: 'Punkty wytrzymałości',
      markers: 'Znaczniki',
      deathSaves: 'Rzuty obronne przed śmiercią (BG)',
      onDeath: 'Gdy żeton umiera',
      looks: 'Zabarwienie i efekty',
      general: 'Ogólne',
    },
    settings: {
      deathSavesBy: 'Rzuty przed śmiercią i znaczniki przy 0 PW',
      coloursBy: 'Kolory zdrowia',
      effectsBy: 'Efekty obrażeń i leczenia',
      language: 'Język',
      hpBar: 'Pasek punktów wytrzymałości',
      bloodiedPercent: 'Zakrwawiony przy',
      bloodiedMarker: 'Znacznik zakrwawienia',
      dyingMarker: 'Znacznik umierania',
      stableMarker: 'Znacznik stabilności',
      deadMarker: 'Znacznik śmierci',
      pcDetection: 'Kto jest BG',
      deathSaves: 'Śledź rzuty przed śmiercią',
      resetSheetSaves: 'Czyść pola na karcie',
      successFields: 'Pola sukcesów',
      failureFields: 'Pola porażek',
      massiveDamage: 'Ogromne obrażenia',
      announce: 'Ogłaszaj',
      deathLayer: 'Przenoś martwych na',
      deathTurnOrder: 'Kolejność tur',
      deathActionsFor: 'Dotyczy',
      tintPlayers: 'Barw BG',
      tintNpcs: 'Barw BN',
      hurtFx: 'Efekt obrażeń',
      hurtFxType: 'Typ efektu obrażeń',
      healFx: 'Efekt leczenia',
      healFxType: 'Typ efektu leczenia',
    },
    choices: {
      hpBar: { 1: 'Pasek 1', 2: 'Pasek 2', 3: 'Pasek 3' },
      pcDetection: { auto: 'Gracze lub karta', players: 'Kontrolowany przez gracza' },
      deathLayer: { none: 'Zostaje na miejscu', gmlayer: 'Warstwa MG', map: 'Warstwa mapy' },
      deathTurnOrder: { keep: 'Zachowaj', remove: 'Usuń' },
      deathActionsFor: { npc: 'BN', all: 'BN i BG' },
      announce: { off: 'Wył.', gm: 'MG', controllers: 'MG i gracze' },
      none: 'Brak',
      notInstalled: 'nie zainstalowano',
    },
    help: {
      menu: 'Otwórz menu.',
      status:
        'Pokaż stan zaznaczonych żetonów albo wszystkich śledzonych żetonów na twojej stronie.',
      check: 'Oceń ponownie zaznaczone żetony (all: wszystkie żetony na twojej stronie).',
      stable: 'Oznacz zaznaczonych BG z 0 punktów wytrzymałości jako stabilnych.',
      clear:
        'Zdejmij znaczniki i zabarwienie DeathTrackera z zaznaczonych żetonów i zapomnij o nich.',
      restore:
        'Przywróć martwe żetony przeniesione przez DeathTracker na ich warstwę i do kolejności tur.',
      role: 'Traktuj postacie zaznaczonych żetonów jako BG lub BN albo pozwól zdecydować DeathTrackerowi.',
      markers: 'Wypisz znaczniki dostępne w tej grze wraz z nazwami do użycia.',
      macro:
        'Utwórz akcję żetonu, którą gracze klikają, aby wysłać swoje rzuty obronne przed śmiercią (dla kart, których DeathTracker nie potrafi odczytać).',
      dsync: 'Wysyłane przez makro rzutów przed śmiercią.',
      settings: 'Otwórz ustawienia.',
      set: 'Zmień ustawienie.',
      reset: 'Przywróć wszystkie ustawienia do domyślnych.',
      config: 'Polecenia z wersji 0.1: otwórz ustawienia lub zmień jedno (config bar|2).',
      journal: 'Odbuduj notatki Help i Command Deck.',
      help: 'Pokaż tę listę.',
      ids: 'Dodaj --ids id1,id2, aby działać na żetonach według ID zamiast zaznaczenia.',
    },
    deck: {
      menuTitle: 'Menu',
      menuDesc: 'Menu, stan, ustawienia i pomoc.',
      selectedTitle: 'Zaznaczone żetony',
      selectedDesc: 'Zaznacz żetony na mapie, a następnie naciśnij przycisk.',
      roleTitle: 'BG czy BN',
      roleDesc: 'Dla postaci zaznaczonych żetonów.',
      toolsTitle: 'Narzędzia',
      toolsDesc: 'Znaczniki, makro rzutów przed śmiercią i te notatki.',
      footer: 'Pełny przewodnik znajduje się w notatce "{help}".',
    },
    handout: {
      versionLabel: 'Wersja',
      subtitle:
        'Zakrwawiony, umierający, stabilny i martwy na podstawie punktów wytrzymałości i rzutów przed śmiercią',
      footer: 'Przyciski dla wszystkich poleceń są w "{deck}".',
      overview: {
        heading: 'Przegląd',
        body: 'DeathTracker obserwuje pasek punktów wytrzymałości każdego żetonu. Oznacza żetony zakrwawione lub martwe, śledzi rzuty obronne przed śmiercią bohaterów graczy z 0 punktów wytrzymałości i może usuwać martwych z mapy oraz z kolejności tur.',
      },
      quickStart: {
        heading: 'Szybki start',
        steps: [
          'Umieść punkty wytrzymałości w Pasku 1 (lub wybierz inny pasek w Ustawieniach).',
          'Zadaj żetonowi obrażenia: przy połowie maksimum dostaje znacznik zakrwawienia; przy 0 BN dostaje znacznik śmierci.',
          'BG z 0 dostaje znacznik umierania. Zaznaczaj rzuty obronne przed śmiercią na karcie: trzy sukcesy czynią go Stabilnym, trzy porażki Martwym.',
          'Ulecz go powyżej 0, a znaczniki znikną.',
          'Wpisz !deathtracker, aby otworzyć menu.',
        ],
      },
      statuses: {
        heading: 'Stany',
        points: [
          'Zdrowy: powyżej progu zakrwawienia maksymalnych punktów wytrzymałości (bez znacznika).',
          'Zakrwawiony: na tym progu lub poniżej (50%, jeśli nie zmieniono).',
          'Umierający: BG z 0 punktów wytrzymałości, który wykonuje rzuty obronne przed śmiercią.',
          'Stabilny: BG z 0 z trzema sukcesami albo ustabilizowany poleceniem stable.',
          'Martwy: BN z 0, BG z trzema porażkami albo BG zabity przez ogromne obrażenia.',
          'Pusty pasek lub taki, który nie zawiera liczby, nigdy nie jest odczytywany jako 0.',
        ],
      },
      deathSaves: {
        heading: 'Rzuty obronne przed śmiercią',
        points: [
          'Karta D&D 2024: odczytywane z karty, gdy pola są zaznaczane lub rzuty wykonywane.',
          'Karta D&D 2014 i inne z polami wyboru: odczytywane z pól sukcesów i porażek podanych w Ustawieniach.',
          'Karta zachowuje stare zaznaczenia po leczeniu, więc rzuty są liczone od chwili, gdy BG spada do 0. Gdy Czyść pola na karcie jest włączone, DeathTracker czyści pola na karcie, gdy BG spada do 0 i gdy zostaje uleczony, a także pokazuje pola rzutów przed śmiercią na karcie D&D 2024, gdy BG spada do 0 z paska żetonu.',
          'Jeśli karty nie da się odczytać, utwórz makro rzutów przed śmiercią (!deathtracker macro): gracze zaznaczają swój żeton i klikają je po każdym rzucie.',
          'Kto jest BG: żeton lub postać kontrolowana przez gracza albo (Gracze lub karta) taka, której karta mówi, że nie jest BN. Użyj Ustaw jako BG / Ustaw jako BN, aby zdecydować dla postaci.',
        ],
      },
      onDeath: {
        heading: 'Gdy żeton umiera',
        points: [
          'Przenoś martwych na warstwę MG lub warstwę mapy i usuwaj ich z kolejności tur. Obie opcje są początkowo wyłączone.',
          'Dotyczy tylko BN, chyba że ustawiono BN i BG.',
          'Uleczenie martwego żetonu usuwa jego znaczniki, ale nie przenosi go z powrotem. Zaznacz go i użyj Przywróć (wraca do kolejności tur ze swoją inicjatywą).',
          'Ogromne obrażenia (początkowo wyłączone): BG, którego pasek spada poniżej 0 o co najmniej swoje maksimum, ginie na miejscu. Karta 2024 zatrzymuje się na 0, więc działa to tylko, gdy w pasku wpisze się wartość poniżej 0.',
        ],
      },
      healthColors: {
        heading: 'HealthColors i inne Mody',
        points: [
          'Kto czym się zajmuje, w Ustawieniach, określa, który Mod obsługuje rzuty przed śmiercią (wraz ze znacznikami umierania, stabilności i śmierci), kolory zdrowia oraz efekty obrażeń/leczenia: DeathTracker, HealthColors lub Wył. HealthColors 2.5 i nowsze pokazują ten sam wybór, a zmiana w jednym Modzie zmienia go w obu.',
          'Na początku DeathTracker obsługuje rzuty przed śmiercią, a HealthColors kolory i efekty. Bez HealthColors DeathTracker obsługuje wszystkie trzy.',
          'HealthColors w wersji starszej niż 2.5 nie współdzieli tego wyboru: wyłącz w nim rzuty przed śmiercią poleceniem !aura deathsaves off.',
          'Zmiany wprowadzone przez TokenMod są widoczne. Inne Mody mogą wywołać DeathTracker.check(token) po zmianie punktów wytrzymałości.',
          'DeathTracker usuwa tylko znaczniki, które sam nałożył.',
        ],
      },
      commands: {
        heading: 'Polecenia',
        intro:
          'Każde polecenie zaczyna się od !deathtracker (lub !dt, lub !dead z wersji 0.1). Tylko dla MG, z wyjątkiem makra rzutów przed śmiercią.',
        colCommand: 'Polecenie',
        colDesc: 'Co robi',
      },
      settings: {
        heading: 'Ustawienia',
        intro:
          'Zmieniaj je w menu, poleceniem !deathtracker set <ustawienie> <wartość> lub w opcjach Biblioteki Modów.',
        colKey: 'Ustawienie',
        colDesc: 'Co robi',
        rows: {
          deathSavesBy:
            'Kto śledzi rzuty przed śmiercią i nakłada znaczniki umierania, stabilności i śmierci: DeathTracker, HealthColors lub off. Wspólne z HealthColors.',
          coloursBy:
            'Kto barwi żetony według punktów wytrzymałości: DeathTracker (jego zabarwienie), HealthColors lub off. Wspólne z HealthColors.',
          effectsBy:
            'Kto odtwarza efekty obrażeń i leczenia: DeathTracker, HealthColors lub off. Wspólne z HealthColors.',
          language: 'Język menu, komunikatów i notatek.',
          hpBar: 'Pasek z punktami wytrzymałości (1, 2 lub 3).',
          bloodiedPercent:
            'Zakrwawiony przy tym procencie maksymalnych punktów wytrzymałości lub poniżej (0 wyłącza zakrwawienie).',
          bloodiedMarker: 'Znacznik zakrwawienia (none oznacza brak znacznika).',
          dyingMarker: 'Znacznik umierającego BG.',
          stableMarker: 'Znacznik stabilnego BG.',
          deadMarker: 'Znacznik martwych.',
          pcDetection:
            'auto: kontrolowany przez gracza lub karta wskazuje BG; players: tylko kontrolowany przez gracza.',
          deathSaves: 'Śledź rzuty obronne przed śmiercią BG z 0 punktów wytrzymałości.',
          resetSheetSaves:
            'Czyść pola rzutów przed śmiercią na karcie, gdy BG spada do 0 i gdy zostaje uleczony, i pokazuj je na karcie D&D 2024.',
          successFields: 'Pola karty zaznaczane przy sukcesach (2014 i inne karty).',
          failureFields: 'Pola karty zaznaczane przy porażkach.',
          massiveDamage:
            'BG, którego pasek spada poniżej 0 o co najmniej swoje maksimum, ginie na miejscu.',
          announce:
            'Kto jest powiadamiany, gdy BG pada, stabilizuje się, umiera lub wstaje: off, gm lub controllers.',
          deathLayer: 'Przenoś martwych na: none, gmlayer lub map.',
          deathTurnOrder: 'keep lub remove martwych z kolejności tur.',
          deathActionsFor: 'npc: przenoszenie i kolejność tur dotyczą BN; all: także BG.',
          tintPlayers: 'Barw BG od zieleni do czerwieni w miarę utraty punktów wytrzymałości.',
          tintNpcs: 'Barw BN w ten sam sposób.',
          hurtFx: 'Odtwórz efekt, gdy żeton traci punkty wytrzymałości.',
          hurtFxType: 'Ten efekt jako typ-kolor (splatter-blood).',
          healFx: 'Odtwórz efekt, gdy żeton odzyskuje punkty wytrzymałości.',
          healFxType: 'Ten efekt (glow-holy).',
        },
      },
      api: {
        heading: 'Dla autorów Modów',
        intro: 'DeathTracker udostępnia obiekt DeathTracker.',
        colFunction: 'Funkcja',
        colDesc: 'Co robi',
        rows: {
          check: 'Oceń żeton teraz (po zmianie jego punktów wytrzymałości z poziomu Moda).',
          getStatus: 'Stan żetonu: healthy, bloodied, dying, stable, dead lub null.',
          onStatusChange:
            'Otrzymuj powiadomienie, gdy stan się zmienia ({token, status, previous, isPc}).',
          observe:
            'Wersja 0.1: otrzymuj powiadomienie (token, prev) po obsłużeniu przez DeathTracker zmiany punktów wytrzymałości.',
          managing:
            'True, gdy DeathTracker śledzi rzuty przed śmiercią: są włączone, a do ich obsługi wybrano DeathTracker (używa tego HealthColors).',
          ownersChanged:
            'Zaktualizuj żetony po zmianie tego, kto czym się zajmuje (wywołuje to HealthColors).',
        },
      },
      upgrading: {
        heading: 'Aktualizacja z wersji 0.1',
        points: [
          'Twoje ustawienia znaczników, paska, zabarwienia i efektów zostają przeniesione.',
          '!dead nadal działa, podobnie jak !dead config i !dead reset.',
          'Znacznik Unconscious dla BG to teraz znacznik umierania.',
          'Zmiana paska nie wymaga już restartu.',
        ],
      },
      troubleshooting: {
        heading: 'Rozwiązywanie problemów',
        points: [
          'Nic się nie dzieje: sprawdź pasek punktów wytrzymałości w Ustawieniach i czy pasek zawiera liczbę.',
          'BG jest traktowany jak BN: zaznacz go i naciśnij Ustaw jako BG albo pozwól graczowi kontrolować postać.',
          'Znacznik się nie wyświetla: użyj !deathtracker markers i wybierz nazwę z listy.',
          'Zmiany punktów wytrzymałości dokonane przez inny Mod nie są widoczne: ten Mod powinien wywołać DeathTracker.check(token).',
        ],
      },
      languages: {
        heading: 'Języki',
        body: 'Ustaw język poleceniem !deathtracker set language <kod>.',
        colLanguage: 'Język',
        colNative: 'Nazwa rodzima',
        colCode: 'Kod',
      },
      credits: {
        heading: 'Autorzy',
        original: 'Autor',
        maintainer: 'Przepisane na wersję 1.0 przez',
        support: 'Znalazłeś problem lub masz pomysł? Skontaktuj się z MidNiteShadow7 na Roll20.',
      },
    },
    errors: {
      gmOnly: 'Tylko MG może używać tego polecenia DeathTrackera.',
      unknownCommand: 'DeathTracker nie ma polecenia "{command}".',
      noTokens: 'Najpierw zaznacz jeden lub więcej żetonów (albo dodaj --ids).',
      notYourToken: 'Nie kontrolujesz tego żetonu.',
      hint: 'Wpisz !deathtracker help, aby zobaczyć listę poleceń.',
    },
  };

  var localePtPT = {
    titles: {
      ready: 'O DeathTracker está pronto.',
      menu: 'DeathTracker',
      status: 'Estado do DeathTracker',
      settings: 'Definições do DeathTracker',
      help: 'Comandos do DeathTracker',
      announce: 'DeathTracker',
      markers: 'Marcadores de token',
    },
    messages: {
      readyHint: 'Escreva !deathtracker para abrir o menu.',
      migrated:
        'As suas definições do DeathTracker 0.1 foram mantidas. !dead continua a funcionar; !deathtracker é o novo comando.',
      healthColors:
        'O HealthColors está instalado: o DeathTracker trata dos testes contra a morte e dos marcadores de a morrer, estável e morto, e o HealthColors das cores de vida e dos efeitos de dano/cura. Altere quem trata do quê nas Definições.',
      healthColorsSaves:
        'O HealthColors também está a seguir os testes contra a morte e a colocar marcadores de a morrer. Desligue um deles (!aura deathsaves off) para que não disputem os marcadores.',
      settingChanged: '{setting} passa a ser {value}.',
      settingRejected: '"{value}" não é um valor válido para {setting}.',
      unknownSetting: 'Não existe nenhuma definição chamada "{setting}".',
      markerUnknown:
        'Este jogo não tem o marcador "{marker}", por isso não vai aparecer. Use !deathtracker markers para ver os nomes que pode usar.',
      checked: '{count} token(s) verificado(s).',
      cleared: 'Marcadores do DeathTracker retirados de {count} token(s).',
      restored: '{count} token(s) reposto(s).',
      nothingToRestore: 'Nenhum destes tokens foi movido pelo DeathTracker.',
      roleSet: '{names}: {role}.',
      stabilised: 'Estável: {count}.',
      notDown: 'Nenhum destes tokens é um PJ com 0 pontos de vida.',
      synced: '{name}: {s} sucesso(s), {f} falha(s).',
      macroCreated:
        'Foi criada a ação de token "{macro}". Um jogador seleciona o seu token e carrega nela depois de lançar um teste contra a morte.',
      journalRebuilt: 'Os folhetos "{help}" e "{deck}" foram recriados.',
      resetDone: 'As definições voltaram aos valores predefinidos.',
      restartNotNeeded:
        'Não é preciso reiniciar: a nova barra passa a ser usada a partir de agora.',
    },
    status: {
      healthy: 'Saudável',
      bloodied: 'Ensanguentado',
      dying: 'A morrer',
      stable: 'Estável',
      dead: 'Morto',
      none: 'Não seguido',
      pc: 'PJ',
      npc: 'PNJ',
      hp: 'PV {hp}/{max}',
      hpNoMax: 'PV {hp}',
      saves: 'Testes contra a morte: {s} sucesso(s), {f} falha(s)',
      unnamed: 'Um token',
      noneHere: 'Ainda não há tokens com pontos de vida nesta página.',
      page: 'Página: {page}',
      selected: 'Tokens selecionados',
      actions: 'Movido quando morreu',
    },
    announce: {
      dying: '{name} caiu e está a morrer.',
      stable: '{name} está estável.',
      dead: '{name} morreu.',
      up: '{name} voltou a pôr-se de pé.',
      savesHint:
        'Os testes contra a morte assinalados na ficha são contados à medida que são feitos.',
    },
    menu: {
      summary: 'Nesta página',
      down: 'PJs caídos',
      noneDown: 'Nenhum PJ está caído.',
      tools: 'Ferramentas',
      sandbox: 'Sandbox de Mods: {version}',
      sandboxUnknown: 'desconhecida',
      hcNote: 'O HealthColors está instalado.',
    },
    buttons: {
      menu: 'Menu',
      status: 'Estado',
      checkPage: 'Verificar página',
      check: 'Verificar selecionados',
      settings: 'Definições',
      help: 'Ajuda',
      stable: 'Estabilizar',
      restore: 'Repor',
      clear: 'Limpar marcadores',
      pc: 'Tornar PJ',
      npc: 'Tornar PNJ',
      auto: 'Decidir automaticamente',
      markers: 'Marcadores',
      macro: 'Criar macro de teste contra a morte',
      rebuild: 'Recriar folhetos',
      reset: 'Repor definições',
      on: 'Ligado',
      off: 'Desligado',
      back: 'Voltar',
    },
    prompts: {
      marker: 'Marcador',
      percent: 'Ensanguentado até (% do máximo)',
      fields: 'Nomes dos campos separados por vírgulas',
      fx: 'Efeito (tipo-cor)',
      language: 'Idioma',
    },
    sections: {
      owners: 'Quem trata do quê',
      hp: 'Pontos de vida',
      markers: 'Marcadores',
      deathSaves: 'Testes contra a morte (PJs)',
      onDeath: 'Quando um token morre',
      looks: 'Tonalidade e efeitos',
      general: 'Geral',
    },
    settings: {
      deathSavesBy: 'Testes contra a morte e marcadores a 0 PV',
      coloursBy: 'Cores de vida',
      effectsBy: 'Efeitos de dano e cura',
      language: 'Idioma',
      hpBar: 'Barra de pontos de vida',
      bloodiedPercent: 'Ensanguentado a',
      bloodiedMarker: 'Marcador de ensanguentado',
      dyingMarker: 'Marcador de a morrer',
      stableMarker: 'Marcador de estável',
      deadMarker: 'Marcador de morto',
      pcDetection: 'Quem é PJ',
      deathSaves: 'Seguir testes contra a morte',
      resetSheetSaves: 'Limpar caixas da ficha',
      successFields: 'Campos de sucesso',
      failureFields: 'Campos de falha',
      massiveDamage: 'Dano massivo',
      announce: 'Anunciar',
      deathLayer: 'Mover os mortos para',
      deathTurnOrder: 'Ordem de turnos',
      deathActionsFor: 'Aplica-se a',
      tintPlayers: 'Tingir PJs',
      tintNpcs: 'Tingir PNJs',
      hurtFx: 'Efeito de dano',
      hurtFxType: 'Tipo do efeito de dano',
      healFx: 'Efeito de cura',
      healFxType: 'Tipo do efeito de cura',
    },
    choices: {
      hpBar: { 1: 'Barra 1', 2: 'Barra 2', 3: 'Barra 3' },
      pcDetection: { auto: 'Jogadores ou ficha', players: 'Controlado por um jogador' },
      deathLayer: { none: 'Fica onde está', gmlayer: 'Camada do MJ', map: 'Camada do mapa' },
      deathTurnOrder: { keep: 'Manter', remove: 'Retirar' },
      deathActionsFor: { npc: 'PNJs', all: 'PNJs e PJs' },
      announce: { off: 'Desligado', gm: 'MJ', controllers: 'MJ e jogadores' },
      none: 'Nenhum',
      notInstalled: 'não instalado',
    },
    help: {
      menu: 'Abre o menu.',
      status:
        'Mostra o estado dos tokens selecionados, ou de todos os tokens seguidos na sua página.',
      check: 'Avalia de novo os tokens selecionados (all: todos os tokens na sua página).',
      stable: 'Marca os PJs selecionados com 0 pontos de vida como estáveis.',
      clear:
        'Retira os marcadores e a tonalidade do DeathTracker dos tokens selecionados e esquece-os.',
      restore:
        'Repõe os tokens mortos que o DeathTracker moveu na sua camada e na ordem de turnos.',
      role: 'Trata as personagens dos tokens selecionados como PJs ou PNJs, ou deixa o DeathTracker decidir.',
      markers: 'Lista os marcadores deste jogo, com os nomes a usar.',
      macro:
        'Cria uma ação de token em que os jogadores carregam para enviar os seus testes contra a morte (para fichas que o DeathTracker não consegue ler).',
      dsync: 'Enviado pela macro de teste contra a morte.',
      settings: 'Abre as definições.',
      set: 'Altera uma definição.',
      reset: 'Repõe todas as definições nos valores predefinidos.',
      config: 'Comandos da versão 0.1: abre as definições, ou altera uma (config bar|2).',
      journal: 'Recria os folhetos de Ajuda e do Command Deck.',
      help: 'Mostra esta lista.',
      ids: 'Acrescente --ids id1,id2 para atuar em tokens por ID em vez da seleção.',
    },
    deck: {
      menuTitle: 'Menu',
      menuDesc: 'O menu, o estado, as definições e a ajuda.',
      selectedTitle: 'Tokens selecionados',
      selectedDesc: 'Selecione tokens no mapa e depois carregue num botão.',
      roleTitle: 'PJ ou PNJ',
      roleDesc: 'Para as personagens dos tokens selecionados.',
      toolsTitle: 'Ferramentas',
      toolsDesc: 'Marcadores, a macro de teste contra a morte e estes folhetos.',
      footer: 'O guia completo está no folheto "{help}".',
    },
    handout: {
      versionLabel: 'Versão',
      subtitle:
        'Ensanguentado, a morrer, estável e morto, a partir dos pontos de vida e dos testes contra a morte',
      footer: 'Há botões para todos os comandos em "{deck}".',
      overview: {
        heading: 'Visão geral',
        body: 'O DeathTracker vigia a barra de pontos de vida de todos os tokens. Marca os tokens que estão ensanguentados ou mortos, segue os testes de salvaguarda contra a morte das personagens dos jogadores com 0 pontos de vida e pode tirar os mortos do mapa e da ordem de turnos.',
      },
      quickStart: {
        heading: 'Início rápido',
        steps: [
          'Coloque os pontos de vida na Barra 1 (ou escolha outra barra nas Definições).',
          'Cause dano a um token: a metade do máximo recebe o marcador de Ensanguentado; a 0 um PNJ recebe o marcador de Morto.',
          'Um PJ a 0 recebe o marcador de A morrer. Assinale os testes contra a morte na ficha: três sucessos deixam-no Estável, três falhas Morto.',
          'Cure-o acima de 0 e os marcadores desaparecem.',
          'Escreva !deathtracker para abrir o menu.',
        ],
      },
      statuses: {
        heading: 'Estados',
        points: [
          'Saudável: acima da fração de Ensanguentado dos pontos de vida máximos (sem marcador).',
          'Ensanguentado: nessa fração ou abaixo dela (50% se não for alterada).',
          'A morrer: um PJ com 0 pontos de vida que está a fazer testes contra a morte.',
          'Estável: um PJ a 0 com três sucessos, ou estabilizado com o comando stable.',
          'Morto: um PNJ a 0, um PJ com três falhas ou um PJ morto por dano massivo.',
          'Uma barra vazia, ou que não contém um número, nunca é lida como 0.',
        ],
      },
      deathSaves: {
        heading: 'Testes contra a morte',
        points: [
          'Ficha de D&D 2024: lida da ficha à medida que as caixas são assinaladas ou os testes lançados.',
          'Ficha de D&D 2014 e outras com caixas de verificação: lidas dos campos de sucesso e de falha nas Definições.',
          'A ficha guarda as marcas antigas depois da cura, por isso os testes são contados a partir do momento em que o PJ cai para 0. Com Limpar caixas da ficha ligado, o DeathTracker limpa as caixas da ficha quando o PJ cai para 0 e quando é curado, e mostra as caixas de teste contra a morte da ficha de D&D 2024 quando um PJ cai para 0 pela barra do token.',
          'Se a ficha não puder ser lida, crie a macro de teste contra a morte (!deathtracker macro): os jogadores selecionam o seu token e carregam nela depois de cada teste.',
          'Quem é PJ: um token ou personagem controlado por um jogador, ou (Jogadores ou ficha) um cuja ficha diz que não é PNJ. Use Tornar PJ / Tornar PNJ para decidir por uma personagem.',
        ],
      },
      onDeath: {
        heading: 'Quando um token morre',
        points: [
          'Mova os mortos para a Camada do MJ ou para a Camada do mapa, e retire-os da ordem de turnos. As duas opções começam desligadas.',
          'Aplica-se só a PNJs, a não ser que esteja definido como PNJs e PJs.',
          'Curar um token morto retira-lhe os marcadores, mas não o move de volta. Selecione-o e use Repor (volta à ordem de turnos com a sua iniciativa).',
          'Dano massivo (desligado de início): um PJ cuja barra desce abaixo de 0 em pelo menos o seu máximo morre de imediato. A ficha de 2024 para em 0, por isso isto só funciona quando o valor abaixo de 0 é escrito na barra.',
        ],
      },
      healthColors: {
        heading: 'HealthColors e outros Mods',
        points: [
          'Quem trata do quê, nas Definições, escolhe que Mod trata dos testes contra a morte (com os marcadores de a morrer, estável e morto), das cores de vida e dos efeitos de dano/cura: DeathTracker, HealthColors ou Desligado. O HealthColors 2.5 ou posterior mostra a mesma escolha, e alterá-la num dos Mods altera-a nos dois.',
          'De início, o DeathTracker trata dos testes contra a morte e o HealthColors das cores e dos efeitos. Sem o HealthColors, o DeathTracker trata dos três.',
          'O HealthColors anterior à 2.5 não partilha a escolha: desligue os testes contra a morte dele com !aura deathsaves off.',
          'As alterações feitas pelo TokenMod são detetadas. Outros Mods podem chamar DeathTracker.check(token) depois de alterar os pontos de vida.',
          'O DeathTracker só retira os marcadores que ele próprio colocou.',
        ],
      },
      commands: {
        heading: 'Comandos',
        intro:
          'Todos os comandos começam por !deathtracker (ou !dt, ou !dead da versão 0.1). Só para o MJ, exceto a macro de teste contra a morte.',
        colCommand: 'Comando',
        colDesc: 'O que faz',
      },
      settings: {
        heading: 'Definições',
        intro:
          'Altere-as no menu, com !deathtracker set <setting> <value>, ou nas opções da Biblioteca de Mods.',
        colKey: 'Definição',
        colDesc: 'O que faz',
        rows: {
          deathSavesBy:
            'Quem segue os testes contra a morte e coloca os marcadores de a morrer, estável e morto: DeathTracker, HealthColors ou off. Partilhado com o HealthColors.',
          coloursBy:
            'Quem tinge os tokens consoante os pontos de vida: DeathTracker (a sua tonalidade), HealthColors ou off. Partilhado com o HealthColors.',
          effectsBy:
            'Quem mostra os efeitos de dano e cura: DeathTracker, HealthColors ou off. Partilhado com o HealthColors.',
          language: 'Idioma dos menus, mensagens e folhetos.',
          hpBar: 'A barra que contém os pontos de vida (1, 2 ou 3).',
          bloodiedPercent:
            'Ensanguentado a esta percentagem dos pontos de vida máximos ou abaixo (0 desliga Ensanguentado).',
          bloodiedMarker: 'Marcador de Ensanguentado (none para nenhum marcador).',
          dyingMarker: 'Marcador de um PJ a morrer.',
          stableMarker: 'Marcador de um PJ estável.',
          deadMarker: 'Marcador dos mortos.',
          pcDetection:
            'auto: controlado por um jogador ou a ficha diz PJ; players: só controlado por um jogador.',
          deathSaves: 'Segue os testes contra a morte dos PJs com 0 pontos de vida.',
          resetSheetSaves:
            'Limpa as caixas de teste contra a morte da ficha quando um PJ cai para 0 e quando é curado, e mostra-as na ficha de D&D 2024.',
          successFields: 'Campos da ficha assinalados para sucessos (fichas de 2014 e outras).',
          failureFields: 'Campos da ficha assinalados para falhas.',
          massiveDamage:
            'Um PJ cuja barra desce abaixo de 0 em pelo menos o seu máximo morre de imediato.',
          announce:
            'Quem é avisado quando um PJ cai, fica estável, morre ou se levanta: off, gm ou controllers.',
          deathLayer: 'Mover os mortos para: none, gmlayer ou map.',
          deathTurnOrder: 'keep (manter) ou remove (retirar) os mortos da ordem de turnos.',
          deathActionsFor: 'npc: mover e ordem de turnos aplicam-se a PNJs; all: também a PJs.',
          tintPlayers: 'Tinge os PJs de verde a vermelho à medida que perdem pontos de vida.',
          tintNpcs: 'Tinge os PNJs da mesma forma.',
          hurtFx: 'Mostra um efeito quando um token perde pontos de vida.',
          hurtFxType: 'Esse efeito, como tipo-cor (splatter-blood).',
          healFx: 'Mostra um efeito quando um token ganha pontos de vida.',
          healFxType: 'Esse efeito (glow-holy).',
        },
      },
      api: {
        heading: 'Para autores de Mods',
        intro: 'O DeathTracker publica um objeto DeathTracker.',
        colFunction: 'Função',
        colDesc: 'O que faz',
        rows: {
          check:
            'Avalia um token agora (depois de alterar os seus pontos de vida a partir de um Mod).',
          getStatus: 'O estado de um token: healthy, bloodied, dying, stable, dead ou null.',
          onStatusChange: 'Avisa quando um estado muda ({token, status, previous, isPc}).',
          observe:
            'Versão 0.1: avisa (token, prev) depois de o DeathTracker tratar uma alteração de pontos de vida.',
          managing:
            'Verdadeiro quando o DeathTracker está a seguir os testes contra a morte: estão ligados e o DeathTracker foi escolhido para tratar deles (o HealthColors usa isto).',
          ownersChanged:
            'Atualiza os tokens depois de mudar quem trata do quê (o HealthColors chama isto).',
        },
      },
      upgrading: {
        heading: 'Atualizar a partir da 0.1',
        points: [
          'As suas definições de marcadores, barra, tonalidade e efeitos são mantidas.',
          '!dead continua a funcionar, tal como !dead config e !dead reset.',
          'O marcador Inconsciente para PJs passa a ser o marcador de A morrer.',
          'Mudar a barra já não exige reiniciar.',
        ],
      },
      troubleshooting: {
        heading: 'Resolução de problemas',
        points: [
          'Não acontece nada: verifique a barra de pontos de vida nas Definições, e se a barra contém um número.',
          'Um PJ é tratado como PNJ: selecione-o e carregue em Tornar PJ, ou deixe um jogador controlar a personagem.',
          'Um marcador não aparece: use !deathtracker markers e escolha um nome da lista.',
          'Os pontos de vida alterados por outro Mod não são detetados: esse Mod deve chamar DeathTracker.check(token).',
        ],
      },
      languages: {
        heading: 'Idiomas',
        body: 'Defina o idioma com !deathtracker set language <code>.',
        colLanguage: 'Idioma',
        colNative: 'Nome nativo',
        colCode: 'Código',
      },
      credits: {
        heading: 'Créditos',
        original: 'Escrito por',
        maintainer: 'Reescrito para a versão 1.0 por',
        support: 'Encontrou um problema ou tem uma ideia? Contacte MidNiteShadow7 no Roll20.',
      },
    },
    errors: {
      gmOnly: 'Só o MJ pode usar esse comando do DeathTracker.',
      unknownCommand: 'O DeathTracker não tem o comando "{command}".',
      noTokens: 'Selecione primeiro um ou mais tokens (ou acrescente --ids).',
      notYourToken: 'Não controla esse token.',
      hint: 'Escreva !deathtracker help para ver a lista de comandos.',
    },
  };

  var localePtBR = {
    titles: {
      ready: 'O DeathTracker está pronto.',
      menu: 'DeathTracker',
      status: 'Estado do DeathTracker',
      settings: 'Configurações do DeathTracker',
      help: 'Comandos do DeathTracker',
      announce: 'DeathTracker',
      markers: 'Marcadores de token',
    },
    messages: {
      readyHint: 'Digite !deathtracker para abrir o menu.',
      migrated:
        'Suas configurações do DeathTracker 0.1 foram mantidas. !dead ainda funciona; !deathtracker é o novo comando.',
      healthColors:
        'O HealthColors está instalado: o DeathTracker cuida dos testes contra a morte e dos marcadores de morrendo, estável e morto, e o HealthColors das cores de vida e dos efeitos de dano/cura. Mude quem cuida do quê nas Configurações.',
      healthColorsSaves:
        'O HealthColors também está acompanhando os testes contra a morte e colocando marcadores de morrendo. Desligue um deles (!aura deathsaves off) para que não briguem pelos marcadores.',
      settingChanged: '{setting} agora é {value}.',
      settingRejected: '"{value}" não é um valor válido para {setting}.',
      unknownSetting: 'Não existe uma configuração chamada "{setting}".',
      markerUnknown:
        'Este jogo não tem o marcador "{marker}", então ele não vai aparecer. Use !deathtracker markers para ver os nomes que você pode usar.',
      checked: '{count} token(s) verificado(s).',
      cleared: 'Marcadores do DeathTracker removidos de {count} token(s).',
      restored: '{count} token(s) devolvido(s).',
      nothingToRestore: 'Nenhum desses tokens foi movido pelo DeathTracker.',
      roleSet: '{names}: {role}.',
      stabilised: 'Estável: {count}.',
      notDown: 'Nenhum desses tokens é um PJ com 0 pontos de vida.',
      synced: '{name}: {s} sucesso(s), {f} falha(s).',
      macroCreated:
        'A ação de token "{macro}" foi criada. O jogador seleciona seu token e clica nela depois de rolar um teste contra a morte.',
      journalRebuilt: 'Os folhetos "{help}" e "{deck}" foram recriados.',
      resetDone: 'As configurações voltaram ao padrão.',
      restartNotNeeded: 'Não é preciso reiniciar: a nova barra já é usada a partir de agora.',
    },
    status: {
      healthy: 'Saudável',
      bloodied: 'Ensanguentado',
      dying: 'Morrendo',
      stable: 'Estável',
      dead: 'Morto',
      none: 'Não acompanhado',
      pc: 'PJ',
      npc: 'PdM',
      hp: 'PV {hp}/{max}',
      hpNoMax: 'PV {hp}',
      saves: 'Testes contra a morte: {s} sucesso(s), {f} falha(s)',
      unnamed: 'Um token',
      noneHere: 'Ainda não há tokens com pontos de vida nesta página.',
      page: 'Página: {page}',
      selected: 'Tokens selecionados',
      actions: 'Movido ao morrer',
    },
    announce: {
      dying: '{name} caiu e está morrendo.',
      stable: '{name} está estável.',
      dead: '{name} morreu.',
      up: '{name} está de pé outra vez.',
      savesHint: 'Os testes contra a morte marcados na ficha são contados à medida que são feitos.',
    },
    menu: {
      summary: 'Nesta página',
      down: 'PJs caídos',
      noneDown: 'Nenhum PJ está caído.',
      tools: 'Ferramentas',
      sandbox: 'Sandbox de Mods: {version}',
      sandboxUnknown: 'desconhecida',
      hcNote: 'O HealthColors está instalado.',
    },
    buttons: {
      menu: 'Menu',
      status: 'Estado',
      checkPage: 'Verificar página',
      check: 'Verificar selecionados',
      settings: 'Configurações',
      help: 'Ajuda',
      stable: 'Estabilizar',
      restore: 'Restaurar',
      clear: 'Limpar marcadores',
      pc: 'Tornar PJ',
      npc: 'Tornar PdM',
      auto: 'Decidir automaticamente',
      markers: 'Marcadores',
      macro: 'Criar macro de teste contra a morte',
      rebuild: 'Recriar folhetos',
      reset: 'Redefinir configurações',
      on: 'Ligado',
      off: 'Desligado',
      back: 'Voltar',
    },
    prompts: {
      marker: 'Marcador',
      percent: 'Ensanguentado com até (% do máximo)',
      fields: 'Nomes dos campos separados por vírgulas',
      fx: 'Efeito (tipo-cor)',
      language: 'Idioma',
    },
    sections: {
      owners: 'Quem cuida do quê',
      hp: 'Pontos de vida',
      markers: 'Marcadores',
      deathSaves: 'Testes contra a morte (PJs)',
      onDeath: 'Quando um token morre',
      looks: 'Tonalidade e efeitos',
      general: 'Geral',
    },
    settings: {
      deathSavesBy: 'Testes contra a morte e marcadores de 0 PV',
      coloursBy: 'Cores de vida',
      effectsBy: 'Efeitos de dano e cura',
      language: 'Idioma',
      hpBar: 'Barra de pontos de vida',
      bloodiedPercent: 'Ensanguentado com',
      bloodiedMarker: 'Marcador de ensanguentado',
      dyingMarker: 'Marcador de morrendo',
      stableMarker: 'Marcador de estável',
      deadMarker: 'Marcador de morto',
      pcDetection: 'Quem é PJ',
      deathSaves: 'Acompanhar testes contra a morte',
      resetSheetSaves: 'Limpar caixas da ficha',
      successFields: 'Campos de sucesso',
      failureFields: 'Campos de falha',
      massiveDamage: 'Dano massivo',
      announce: 'Anunciar',
      deathLayer: 'Mover os mortos para',
      deathTurnOrder: 'Ordem de turno',
      deathActionsFor: 'Aplica-se a',
      tintPlayers: 'Tingir PJs',
      tintNpcs: 'Tingir PdMs',
      hurtFx: 'Efeito de dano',
      hurtFxType: 'Tipo do efeito de dano',
      healFx: 'Efeito de cura',
      healFxType: 'Tipo do efeito de cura',
    },
    choices: {
      hpBar: { 1: 'Barra 1', 2: 'Barra 2', 3: 'Barra 3' },
      pcDetection: { auto: 'Jogadores ou ficha', players: 'Controlado por um jogador' },
      deathLayer: { none: 'Ficar no lugar', gmlayer: 'Camada do Mestre', map: 'Camada do mapa' },
      deathTurnOrder: { keep: 'Manter', remove: 'Remover' },
      deathActionsFor: { npc: 'PdMs', all: 'PdMs e PJs' },
      announce: { off: 'Desligado', gm: 'Mestre', controllers: 'Mestre e jogadores' },
      none: 'Nenhum',
      notInstalled: 'não instalado',
    },
    help: {
      menu: 'Abre o menu.',
      status:
        'Mostra o estado dos tokens selecionados, ou de todos os tokens acompanhados na sua página.',
      check: 'Avalia de novo os tokens selecionados (all: todos os tokens na sua página).',
      stable: 'Marca os PJs selecionados com 0 pontos de vida como estáveis.',
      clear:
        'Tira os marcadores e a tonalidade do DeathTracker dos tokens selecionados e os esquece.',
      restore:
        'Devolve os tokens mortos que o DeathTracker moveu para sua camada e para a ordem de turno.',
      role: 'Trata os personagens dos tokens selecionados como PJs ou PdMs, ou deixa o DeathTracker decidir.',
      markers: 'Lista os marcadores deste jogo, com os nomes a usar.',
      macro:
        'Cria uma ação de token que os jogadores clicam para enviar seus testes contra a morte (para fichas que o DeathTracker não consegue ler).',
      dsync: 'Enviado pela macro de teste contra a morte.',
      settings: 'Abre as configurações.',
      set: 'Altera uma configuração.',
      reset: 'Volta todas as configurações ao padrão.',
      config: 'Comandos da versão 0.1: abre as configurações, ou altera uma (config bar|2).',
      journal: 'Recria os folhetos de Ajuda e do Command Deck.',
      help: 'Mostra esta lista.',
      ids: 'Adicione --ids id1,id2 para agir em tokens por ID em vez da seleção.',
    },
    deck: {
      menuTitle: 'Menu',
      menuDesc: 'O menu, o estado, as configurações e a ajuda.',
      selectedTitle: 'Tokens selecionados',
      selectedDesc: 'Selecione tokens no mapa e depois clique em um botão.',
      roleTitle: 'PJ ou PdM',
      roleDesc: 'Para os personagens dos tokens selecionados.',
      toolsTitle: 'Ferramentas',
      toolsDesc: 'Marcadores, a macro de teste contra a morte e estes folhetos.',
      footer: 'O guia completo está no folheto "{help}".',
    },
    handout: {
      versionLabel: 'Versão',
      subtitle:
        'Ensanguentado, morrendo, estável e morto, a partir dos pontos de vida e dos testes contra a morte',
      footer: 'Há botões para todos os comandos em "{deck}".',
      overview: {
        heading: 'Visão geral',
        body: 'O DeathTracker observa a barra de pontos de vida de todos os tokens. Ele marca os tokens que estão ensanguentados ou mortos, acompanha os testes de resistência contra a morte dos personagens dos jogadores com 0 pontos de vida e pode tirar os mortos do mapa e da ordem de turno.',
      },
      quickStart: {
        heading: 'Início rápido',
        steps: [
          'Coloque os pontos de vida na Barra 1 (ou escolha outra barra nas Configurações).',
          'Cause dano a um token: com metade do máximo ele recebe o marcador de Ensanguentado; com 0 um PdM recebe o marcador de Morto.',
          'Um PJ com 0 recebe o marcador de Morrendo. Marque os testes contra a morte na ficha: três sucessos o deixam Estável, três falhas Morto.',
          'Cure-o acima de 0 e os marcadores somem.',
          'Digite !deathtracker para abrir o menu.',
        ],
      },
      statuses: {
        heading: 'Estados',
        points: [
          'Saudável: acima da parcela de Ensanguentado dos pontos de vida máximos (sem marcador).',
          'Ensanguentado: nessa parcela ou abaixo dela (50% se não for alterada).',
          'Morrendo: um PJ com 0 pontos de vida que está fazendo testes contra a morte.',
          'Estável: um PJ com 0 e três sucessos, ou estabilizado com o comando stable.',
          'Morto: um PdM com 0, um PJ com três falhas ou um PJ morto por dano massivo.',
          'Uma barra vazia, ou que não contém um número, nunca é lida como 0.',
        ],
      },
      deathSaves: {
        heading: 'Testes contra a morte',
        points: [
          'Ficha de D&D 2024: lida da ficha à medida que as caixas são marcadas ou os testes rolados.',
          'Ficha de D&D 2014 e outras com caixas de seleção: lidas dos campos de sucesso e de falha nas Configurações.',
          'A ficha guarda as marcações antigas depois da cura, por isso os testes são contados a partir do momento em que o PJ cai a 0. Com Limpar caixas da ficha ligado, o DeathTracker limpa as caixas da ficha quando o PJ cai a 0 e quando é curado, e mostra as caixas de teste contra a morte da ficha de D&D 2024 quando um PJ cai a 0 pela barra do token.',
          'Se a ficha não puder ser lida, crie a macro de teste contra a morte (!deathtracker macro): os jogadores selecionam seu token e clicam nela depois de cada teste.',
          'Quem é PJ: um token ou personagem controlado por um jogador, ou (Jogadores ou ficha) um cuja ficha diz que não é PdM. Use Tornar PJ / Tornar PdM para decidir por um personagem.',
        ],
      },
      onDeath: {
        heading: 'Quando um token morre',
        points: [
          'Mova os mortos para a Camada do Mestre ou para a Camada do mapa, e tire-os da ordem de turno. As duas opções começam desligadas.',
          'Aplica-se só a PdMs, a menos que esteja definido como PdMs e PJs.',
          'Curar um token morto tira seus marcadores, mas não o move de volta. Selecione-o e use Restaurar (ele volta para a ordem de turno com sua iniciativa).',
          'Dano massivo (desligado no início): um PJ cuja barra fica abaixo de 0 em pelo menos o seu máximo morre na hora. A ficha de 2024 para em 0, então isso só funciona quando o valor abaixo de 0 é digitado na barra.',
        ],
      },
      healthColors: {
        heading: 'HealthColors e outros Mods',
        points: [
          'Quem cuida do quê, nas Configurações, escolhe qual Mod cuida dos testes contra a morte (com os marcadores de morrendo, estável e morto), das cores de vida e dos efeitos de dano/cura: DeathTracker, HealthColors ou Desligado. O HealthColors 2.5 ou mais recente mostra a mesma escolha, e mudá-la em um dos Mods muda nos dois.',
          'No início, o DeathTracker cuida dos testes contra a morte e o HealthColors das cores e efeitos. Sem o HealthColors, o DeathTracker cuida dos três.',
          'O HealthColors anterior à 2.5 não compartilha a escolha: desligue os testes contra a morte dele com !aura deathsaves off.',
          'As mudanças feitas pelo TokenMod são percebidas. Outros Mods podem chamar DeathTracker.check(token) depois de mudar os pontos de vida.',
          'O DeathTracker só remove os marcadores que ele mesmo colocou.',
        ],
      },
      commands: {
        heading: 'Comandos',
        intro:
          'Todo comando começa com !deathtracker (ou !dt, ou !dead da versão 0.1). Só para o Mestre, exceto a macro de teste contra a morte.',
        colCommand: 'Comando',
        colDesc: 'O que faz',
      },
      settings: {
        heading: 'Configurações',
        intro:
          'Altere-as no menu, com !deathtracker set <setting> <value>, ou nas opções da Biblioteca de Mods.',
        colKey: 'Configuração',
        colDesc: 'O que faz',
        rows: {
          deathSavesBy:
            'Quem acompanha os testes contra a morte e coloca os marcadores de morrendo, estável e morto: DeathTracker, HealthColors ou off. Compartilhado com o HealthColors.',
          coloursBy:
            'Quem tinge os tokens conforme os pontos de vida: DeathTracker (sua tonalidade), HealthColors ou off. Compartilhado com o HealthColors.',
          effectsBy:
            'Quem mostra os efeitos de dano e cura: DeathTracker, HealthColors ou off. Compartilhado com o HealthColors.',
          language: 'Idioma dos menus, mensagens e folhetos.',
          hpBar: 'A barra que contém os pontos de vida (1, 2 ou 3).',
          bloodiedPercent:
            'Ensanguentado com esta porcentagem dos pontos de vida máximos ou menos (0 desliga Ensanguentado).',
          bloodiedMarker: 'Marcador de Ensanguentado (none para nenhum marcador).',
          dyingMarker: 'Marcador de um PJ morrendo.',
          stableMarker: 'Marcador de um PJ estável.',
          deadMarker: 'Marcador dos mortos.',
          pcDetection:
            'auto: controlado por um jogador ou a ficha diz PJ; players: só controlado por um jogador.',
          deathSaves: 'Acompanha os testes contra a morte dos PJs com 0 pontos de vida.',
          resetSheetSaves:
            'Limpa as caixas de teste contra a morte da ficha quando um PJ cai a 0 e quando é curado, e as mostra na ficha de D&D 2024.',
          successFields: 'Campos da ficha marcados para sucessos (fichas de 2014 e outras).',
          failureFields: 'Campos da ficha marcados para falhas.',
          massiveDamage:
            'Um PJ cuja barra fica abaixo de 0 em pelo menos o seu máximo morre na hora.',
          announce:
            'Quem é avisado quando um PJ cai, fica estável, morre ou se levanta: off, gm ou controllers.',
          deathLayer: 'Mover os mortos para: none, gmlayer ou map.',
          deathTurnOrder: 'keep (manter) ou remove (tirar) os mortos da ordem de turno.',
          deathActionsFor: 'npc: mover e ordem de turno valem para PdMs; all: também para PJs.',
          tintPlayers: 'Tinge os PJs de verde a vermelho conforme perdem pontos de vida.',
          tintNpcs: 'Tinge os PdMs da mesma forma.',
          hurtFx: 'Mostra um efeito quando um token perde pontos de vida.',
          hurtFxType: 'Esse efeito, como tipo-cor (splatter-blood).',
          healFx: 'Mostra um efeito quando um token ganha pontos de vida.',
          healFxType: 'Esse efeito (glow-holy).',
        },
      },
      api: {
        heading: 'Para autores de Mods',
        intro: 'O DeathTracker publica um objeto DeathTracker.',
        colFunction: 'Função',
        colDesc: 'O que faz',
        rows: {
          check: 'Avalia um token agora (depois de mudar seus pontos de vida a partir de um Mod).',
          getStatus: 'O estado de um token: healthy, bloodied, dying, stable, dead ou null.',
          onStatusChange: 'Avisa quando um estado muda ({token, status, previous, isPc}).',
          observe:
            'Versão 0.1: avisa (token, prev) depois que o DeathTracker trata uma mudança de pontos de vida.',
          managing:
            'Verdadeiro quando o DeathTracker está acompanhando os testes contra a morte: estão ligados e o DeathTracker foi escolhido para cuidar deles (o HealthColors usa isso).',
          ownersChanged:
            'Atualiza os tokens depois que muda quem cuida do quê (o HealthColors chama isso).',
        },
      },
      upgrading: {
        heading: 'Atualizando a partir da 0.1',
        points: [
          'Suas configurações de marcadores, barra, tonalidade e efeitos são mantidas.',
          '!dead ainda funciona, assim como !dead config e !dead reset.',
          'O marcador Inconsciente para PJs agora é o marcador de Morrendo.',
          'Mudar a barra não precisa mais de reinício.',
        ],
      },
      troubleshooting: {
        heading: 'Solução de problemas',
        points: [
          'Nada acontece: confira a barra de pontos de vida nas Configurações e se a barra contém um número.',
          'Um PJ é tratado como PdM: selecione-o e clique em Tornar PJ, ou deixe um jogador controlar o personagem.',
          'Um marcador não aparece: use !deathtracker markers e escolha um nome da lista.',
          'Pontos de vida alterados por outro Mod não são percebidos: esse Mod deve chamar DeathTracker.check(token).',
        ],
      },
      languages: {
        heading: 'Idiomas',
        body: 'Defina o idioma com !deathtracker set language <code>.',
        colLanguage: 'Idioma',
        colNative: 'Nome nativo',
        colCode: 'Código',
      },
      credits: {
        heading: 'Créditos',
        original: 'Escrito por',
        maintainer: 'Reescrito para a versão 1.0 por',
        support: 'Encontrou um problema ou tem uma ideia? Fale com MidNiteShadow7 no Roll20.',
      },
    },
    errors: {
      gmOnly: 'Só o Mestre pode usar esse comando do DeathTracker.',
      unknownCommand: 'O DeathTracker não tem o comando "{command}".',
      noTokens: 'Selecione um ou mais tokens primeiro (ou adicione --ids).',
      notYourToken: 'Você não controla esse token.',
      hint: 'Digite !deathtracker help para ver a lista de comandos.',
    },
  };

  var localeRu = {
    titles: {
      ready: 'DeathTracker готов.',
      menu: 'DeathTracker',
      status: 'Состояние DeathTracker',
      settings: 'Настройки DeathTracker',
      help: 'Команды DeathTracker',
      announce: 'DeathTracker',
      markers: 'Маркеры жетонов',
    },
    messages: {
      readyHint: 'Введите !deathtracker, чтобы открыть меню.',
      migrated:
        'Ваши настройки DeathTracker 0.1 перенесены. !dead по-прежнему работает; новая команда — !deathtracker.',
      healthColors:
        'Установлен HealthColors: DeathTracker ведёт спасброски от смерти и маркеры «При смерти», «Стабилен» и «Мёртв», а HealthColors — цвета здоровья и эффекты урона и лечения. Кто чем занимается, можно изменить в настройках.',
      healthColorsSaves:
        'HealthColors тоже отслеживает спасброски от смерти и ставит маркеры умирающих. Выключите один из них (!aura deathsaves off), чтобы они не спорили из-за маркеров.',
      settingChanged: '{setting} теперь {value}.',
      settingRejected: '«{value}» — недопустимое значение для {setting}.',
      unknownSetting: 'Настройки «{setting}» нет.',
      markerUnknown:
        'В этой игре нет маркера «{marker}», поэтому он не будет виден. Введите !deathtracker markers, чтобы увидеть доступные названия.',
      checked: 'Проверено жетонов: {count}.',
      cleared: 'Маркеры DeathTracker сняты с жетонов: {count}.',
      restored: 'Возвращено жетонов: {count}.',
      nothingToRestore: 'Ни один из этих жетонов не был перемещён DeathTracker.',
      roleSet: '{names}: {role}.',
      stabilised: 'Стабилизированы: {count}.',
      notDown: 'Ни один из этих жетонов не является ИП с 0 хитов.',
      synced: '{name}: успехов {s}, провалов {f}.',
      macroCreated:
        'Создано действие жетона «{macro}». Игрок выбирает свой жетон и нажимает его после спасброска от смерти.',
      journalRebuilt: 'Раздаточные материалы «{help}» и «{deck}» пересозданы.',
      resetDone: 'Настройки возвращены к значениям по умолчанию.',
      restartNotNeeded: 'Перезапуск не нужен: новая полоса используется уже сейчас.',
    },
    status: {
      healthy: 'Здоров',
      bloodied: 'Окровавлен',
      dying: 'При смерти',
      stable: 'Стабилен',
      dead: 'Мёртв',
      none: 'Не отслеживается',
      pc: 'ИП',
      npc: 'НИП',
      hp: 'Хиты {hp}/{max}',
      hpNoMax: 'Хиты {hp}',
      saves: 'Спасброски от смерти: успехов {s}, провалов {f}',
      unnamed: 'Жетон',
      noneHere: 'На этой странице пока нет жетонов с хитами.',
      page: 'Страница: {page}',
      selected: 'Выбранные жетоны',
      actions: 'Перемещён после смерти',
    },
    announce: {
      dying: '{name} падает и умирает.',
      stable: '{name} стабилизирован.',
      dead: '{name} погибает.',
      up: '{name} снова на ногах.',
      savesHint: 'Спасброски от смерти, отмеченные в листе, учитываются по мере выполнения.',
    },
    menu: {
      summary: 'На этой странице',
      down: 'Павшие ИП',
      noneDown: 'Павших ИП нет.',
      tools: 'Инструменты',
      sandbox: 'Песочница Модов: {version}',
      sandboxUnknown: 'неизвестно',
      hcNote: 'Установлен HealthColors.',
    },
    buttons: {
      menu: 'Меню',
      status: 'Состояние',
      checkPage: 'Проверить страницу',
      check: 'Проверить выбранные',
      settings: 'Настройки',
      help: 'Справка',
      stable: 'Стабилизировать',
      restore: 'Вернуть',
      clear: 'Снять маркеры',
      pc: 'Сделать ИП',
      npc: 'Сделать НИП',
      auto: 'Определять автоматически',
      markers: 'Маркеры',
      macro: 'Создать макрос спасброска от смерти',
      rebuild: 'Пересоздать раздаточные материалы',
      reset: 'Сбросить настройки',
      on: 'Вкл.',
      off: 'Выкл.',
      back: 'Назад',
    },
    prompts: {
      marker: 'Маркер',
      percent: 'Окровавлен при этом значении или ниже (% от максимума)',
      fields: 'Названия полей через запятую',
      fx: 'Эффект (тип-цвет)',
      language: 'Язык',
    },
    sections: {
      owners: 'Кто чем занимается',
      hp: 'Хиты',
      markers: 'Маркеры',
      deathSaves: 'Спасброски от смерти (ИП)',
      onDeath: 'Когда жетон умирает',
      looks: 'Окраска и эффекты',
      general: 'Общие',
    },
    settings: {
      deathSavesBy: 'Спасброски и маркеры 0 хитов',
      coloursBy: 'Цвета здоровья',
      effectsBy: 'Эффекты урона и лечения',
      language: 'Язык',
      hpBar: 'Полоса хитов',
      bloodiedPercent: 'Окровавлен при',
      bloodiedMarker: 'Маркер «Окровавлен»',
      dyingMarker: 'Маркер «При смерти»',
      stableMarker: 'Маркер «Стабилен»',
      deadMarker: 'Маркер «Мёртв»',
      pcDetection: 'Кто считается ИП',
      deathSaves: 'Отслеживать спасброски от смерти',
      resetSheetSaves: 'Очищать ячейки листа',
      successFields: 'Поля успехов',
      failureFields: 'Поля провалов',
      massiveDamage: 'Огромный урон',
      announce: 'Объявлять',
      deathLayer: 'Перемещать мёртвых на',
      deathTurnOrder: 'Порядок ходов',
      deathActionsFor: 'Применяется к',
      tintPlayers: 'Окрашивать ИП',
      tintNpcs: 'Окрашивать НИП',
      hurtFx: 'Эффект урона',
      hurtFxType: 'Тип эффекта урона',
      healFx: 'Эффект лечения',
      healFxType: 'Тип эффекта лечения',
    },
    choices: {
      hpBar: { 1: 'Полоса 1', 2: 'Полоса 2', 3: 'Полоса 3' },
      pcDetection: { auto: 'Игроки или лист', players: 'Под управлением игрока' },
      deathLayer: { none: 'Оставить на месте', gmlayer: 'Слой Мастера', map: 'Слой карты' },
      deathTurnOrder: { keep: 'Оставить', remove: 'Убрать' },
      deathActionsFor: { npc: 'НИП', all: 'НИП и ИП' },
      announce: { off: 'Выкл.', gm: 'Мастеру', controllers: 'Мастеру и игрокам' },
      none: 'Нет',
      notInstalled: 'не установлен',
    },
    help: {
      menu: 'Открыть меню.',
      status:
        'Показать состояние выбранных жетонов или всех отслеживаемых жетонов на вашей странице.',
      check: 'Заново оценить выбранные жетоны (all: все жетоны на вашей странице).',
      stable: 'Отметить выбранных ИП с 0 хитов как стабилизированных.',
      clear: 'Снять маркеры и окраску DeathTracker с выбранных жетонов и забыть о них.',
      restore: 'Вернуть мёртвые жетоны, перемещённые DeathTracker, на их слой и в порядок ходов.',
      role: 'Считать персонажей выбранных жетонов ИП или НИП либо доверить решение DeathTracker.',
      markers: 'Показать маркеры этой игры с названиями для использования.',
      macro:
        'Создать действие жетона, которое игроки нажимают, чтобы отправить спасброски от смерти (для листов, которые DeathTracker не может прочитать).',
      dsync: 'Отправляется макросом спасброска от смерти.',
      settings: 'Открыть настройки.',
      set: 'Изменить настройку.',
      reset: 'Вернуть все настройки к значениям по умолчанию.',
      config: 'Команды версии 0.1: открыть настройки или изменить одну (config bar|2).',
      journal: 'Пересоздать раздаточные материалы «Help» и «Command Deck».',
      help: 'Показать этот список.',
      ids: 'Добавьте --ids id1,id2, чтобы работать с жетонами по ID вместо выбранных.',
    },
    deck: {
      menuTitle: 'Меню',
      menuDesc: 'Меню, состояние, настройки и справка.',
      selectedTitle: 'Выбранные жетоны',
      selectedDesc: 'Выберите жетоны на карте, затем нажмите кнопку.',
      roleTitle: 'ИП или НИП',
      roleDesc: 'Для персонажей выбранных жетонов.',
      toolsTitle: 'Инструменты',
      toolsDesc: 'Маркеры, макрос спасброска от смерти и эти раздаточные материалы.',
      footer: 'Полное руководство — в раздаточном материале «{help}».',
    },
    handout: {
      versionLabel: 'Версия',
      subtitle: 'Окровавлен, при смерти, стабилен и мёртв — по хитам и спасброскам от смерти',
      footer: 'Кнопки для всех команд — в «{deck}».',
      overview: {
        heading: 'Обзор',
        body: 'DeathTracker следит за полосой хитов каждого жетона. Он отмечает окровавленные и мёртвые жетоны, отслеживает спасброски от смерти персонажей игроков с 0 хитов и может убирать мёртвых с карты и из порядка ходов.',
      },
      quickStart: {
        heading: 'Быстрый старт',
        steps: [
          'Укажите хиты в полосе 1 (или выберите другую полосу в настройках).',
          'Нанесите жетону урон: на половине максимума он получает маркер «Окровавлен»; на 0 НИП получает маркер «Мёртв».',
          'ИП на 0 получает маркер «При смерти». Отмечайте спасброски от смерти в листе: три успеха делают его стабильным, три провала — мёртвым.',
          'Вылечите его выше 0, и маркеры исчезнут.',
          'Введите !deathtracker, чтобы открыть меню.',
        ],
      },
      statuses: {
        heading: 'Состояния',
        points: [
          'Здоров: выше порога «Окровавлен» от максимума хитов (без маркера).',
          'Окровавлен: на пороге или ниже (50%, если не изменено).',
          'При смерти: ИП с 0 хитов, который совершает спасброски от смерти.',
          'Стабилен: ИП с 0 хитов и тремя успехами или стабилизированный командой stable.',
          'Мёртв: НИП с 0 хитов, ИП с тремя провалами или ИП, убитый огромным уроном.',
          'Пустая полоса или полоса без числа никогда не считается за 0.',
        ],
      },
      deathSaves: {
        heading: 'Спасброски от смерти',
        points: [
          'Лист D&D 2024: читается из листа, когда отмечаются ячейки или бросаются спасброски.',
          'Лист D&D 2014 и другие с флажками: читается из полей успехов и провалов, заданных в настройках.',
          'Лист хранит старые отметки после лечения, поэтому спасброски считаются с момента, когда ИП падает до 0. При включённой настройке «Очищать ячейки листа» DeathTracker очищает ячейки листа, когда ИП падает до 0 и когда его лечат, и показывает ячейки спасбросков от смерти листа D&D 2024, когда ИП падает до 0 через полосу жетона.',
          'Если лист не читается, создайте макрос спасброска от смерти (!deathtracker macro): игроки выбирают свой жетон и нажимают его после каждого спасброска.',
          'Кто считается ИП: жетон или персонаж под управлением игрока или (Игроки или лист) тот, чей лист говорит, что это не НИП. Используйте «Сделать ИП» / «Сделать НИП», чтобы решить за персонажа.',
        ],
      },
      onDeath: {
        heading: 'Когда жетон умирает',
        points: [
          'Перемещать мёртвых на слой Мастера или слой карты и убирать их из порядка ходов. Изначально оба выключены.',
          'Применяется только к НИП, если не выбрано «НИП и ИП».',
          'Лечение мёртвого жетона снимает его маркеры, но не возвращает его на место. Выберите его и нажмите «Вернуть» (он вернётся в порядок ходов со своей инициативой).',
          'Огромный урон (изначально выключен): ИП, чья полоса опускается ниже 0 хотя бы на его максимум, сразу умирает. Лист 2024 не опускается ниже 0, поэтому это работает, только если в полосу вписано значение меньше 0.',
        ],
      },
      healthColors: {
        heading: 'HealthColors и другие Моды',
        points: [
          '«Кто чем занимается» в настройках определяет, какой Мод ведёт спасброски от смерти (с маркерами «При смерти», «Стабилен» и «Мёртв»), цвета здоровья и эффекты урона и лечения: DeathTracker, HealthColors или «Выкл.». HealthColors 2.5 и новее показывает тот же выбор, и изменение в любом из Модов меняет его для обоих.',
          'Изначально DeathTracker ведёт спасброски от смерти, а HealthColors — цвета и эффекты. Без HealthColors DeathTracker занимается всеми тремя.',
          'HealthColors до версии 2.5 не разделяет этот выбор: выключите в нём спасброски от смерти командой !aura deathsaves off.',
          'Изменения, сделанные TokenMod, видны. Другие Моды могут вызывать DeathTracker.check(token) после изменения хитов.',
          'DeathTracker снимает только те маркеры, которые поставил сам.',
        ],
      },
      commands: {
        heading: 'Команды',
        intro:
          'Каждая команда начинается с !deathtracker (или !dt, или !dead из версии 0.1). Только для Мастера, кроме макроса спасброска от смерти.',
        colCommand: 'Команда',
        colDesc: 'Что делает',
      },
      settings: {
        heading: 'Настройки',
        intro:
          'Меняйте их в меню, командой !deathtracker set <setting> <value> или в параметрах библиотеки Модов.',
        colKey: 'Настройка',
        colDesc: 'Что делает',
        rows: {
          deathSavesBy:
            'Кто отслеживает спасброски от смерти и ставит маркеры «При смерти», «Стабилен» и «Мёртв»: DeathTracker, HealthColors или никто. Общая с HealthColors.',
          coloursBy:
            'Кто окрашивает жетоны по хитам: DeathTracker (своей окраской), HealthColors или никто. Общая с HealthColors.',
          effectsBy:
            'Кто показывает эффекты урона и лечения: DeathTracker, HealthColors или никто. Общая с HealthColors.',
          language: 'Язык меню, сообщений и раздаточных материалов.',
          hpBar: 'Полоса, в которой хранятся хиты (1, 2 или 3).',
          bloodiedPercent:
            'Окровавлен при этом проценте от максимума хитов или ниже (0 выключает «Окровавлен»).',
          bloodiedMarker: 'Маркер для «Окровавлен» (none — без маркера).',
          dyingMarker: 'Маркер для умирающего ИП.',
          stableMarker: 'Маркер для стабильного ИП.',
          deadMarker: 'Маркер для мёртвых.',
          pcDetection:
            'auto: под управлением игрока или лист указывает ИП; players: только под управлением игрока.',
          deathSaves: 'Отслеживать спасброски от смерти для ИП с 0 хитов.',
          resetSheetSaves:
            'Очищать ячейки спасбросков от смерти в листе, когда ИП падает до 0 и когда его лечат, и показывать их в листе D&D 2024.',
          successFields: 'Поля листа, отмечаемые при успехах (листы 2014 и другие).',
          failureFields: 'Поля листа, отмечаемые при провалах.',
          massiveDamage: 'ИП, чья полоса опускается ниже 0 хотя бы на его максимум, сразу умирает.',
          announce:
            'Кому сообщать, когда ИП падает, стабилизируется, умирает или встаёт: off, gm или controllers.',
          deathLayer: 'Куда перемещать мёртвых: none, gmlayer или map.',
          deathTurnOrder: 'keep (оставить) или remove (убрать) мёртвых в порядке ходов.',
          deathActionsFor: 'npc: перемещение и порядок ходов применяются к НИП; all: также к ИП.',
          tintPlayers: 'Окрашивать ИП от зелёного к красному по мере потери хитов.',
          tintNpcs: 'Так же окрашивать НИП.',
          hurtFx: 'Показывать эффект, когда жетон теряет хиты.',
          hurtFxType: 'Этот эффект в виде тип-цвет (splatter-blood).',
          healFx: 'Показывать эффект, когда жетон получает хиты.',
          healFxType: 'Этот эффект (glow-holy).',
        },
      },
      api: {
        heading: 'Для авторов Модов',
        intro: 'DeathTracker публикует объект DeathTracker.',
        colFunction: 'Функция',
        colDesc: 'Что делает',
        rows: {
          check: 'Оценить жетон сейчас (после изменения его хитов из Мода).',
          getStatus: 'Состояние жетона: healthy, bloodied, dying, stable, dead или null.',
          onStatusChange:
            'Получать уведомление при смене состояния ({token, status, previous, isPc}).',
          observe:
            'Версия 0.1: получать (token, prev) после того, как DeathTracker обработает изменение хитов.',
          managing:
            'True, когда DeathTracker отслеживает спасброски от смерти: они включены, и вести их выбран DeathTracker (это использует HealthColors).',
          ownersChanged:
            'Обновить жетоны после того, как изменилось, кто чем занимается (это вызывает HealthColors).',
        },
      },
      upgrading: {
        heading: 'Переход с 0.1',
        points: [
          'Ваши настройки маркеров, полосы, окраски и эффектов перенесены.',
          '!dead по-прежнему работает, как и !dead config и !dead reset.',
          'Маркер «Без сознания» для ИП теперь стал маркером «При смерти».',
          'Смена полосы больше не требует перезапуска.',
        ],
      },
      troubleshooting: {
        heading: 'Решение проблем',
        points: [
          'Ничего не происходит: проверьте полосу хитов в настройках и что в полосе записано число.',
          'ИП считается НИП: выберите его и нажмите «Сделать ИП» или дайте игроку управлять персонажем.',
          'Маркер не виден: введите !deathtracker markers и выберите название из списка.',
          'Изменения хитов другим Модом не видны: этот Мод должен вызывать DeathTracker.check(token).',
        ],
      },
      languages: {
        heading: 'Языки',
        body: 'Выберите язык командой !deathtracker set language <code>.',
        colLanguage: 'Язык',
        colNative: 'Самоназвание',
        colCode: 'Код',
      },
      credits: {
        heading: 'Авторы',
        original: 'Автор',
        maintainer: 'Переписал для версии 1.0',
        support: 'Нашли проблему или есть идея? Напишите MidNiteShadow7 на Roll20.',
      },
    },
    errors: {
      gmOnly: 'Эту команду DeathTracker может использовать только Мастер.',
      unknownCommand: 'У DeathTracker нет команды «{command}».',
      noTokens: 'Сначала выберите один или несколько жетонов (или добавьте --ids).',
      notYourToken: 'Вы не управляете этим жетоном.',
      hint: 'Введите !deathtracker help, чтобы увидеть список команд.',
    },
  };

  var localeEs = {
    titles: {
      ready: 'DeathTracker está listo.',
      menu: 'DeathTracker',
      status: 'Estado de DeathTracker',
      settings: 'Ajustes de DeathTracker',
      help: 'Comandos de DeathTracker',
      announce: 'DeathTracker',
      markers: 'Marcadores de token',
    },
    messages: {
      readyHint: 'Escribe !deathtracker para abrir el menú.',
      migrated:
        'Se han conservado tus ajustes de DeathTracker 0.1. !dead sigue funcionando; !deathtracker es el nuevo comando.',
      healthColors:
        'HealthColors está instalado: DeathTracker se encarga de las salvaciones de muerte y de los marcadores de moribundo, estable y muerto, y HealthColors de los colores de salud y los efectos de daño y curación. Cambia quién se encarga de qué en Ajustes.',
      healthColorsSaves:
        'HealthColors también lleva las tiradas de salvación de muerte y pone marcadores de moribundo. Desactiva uno de los dos (!aura deathsaves off) para que no se peleen por los marcadores.',
      settingChanged: '{setting} ahora es {value}.',
      settingRejected: '«{value}» no es un valor válido para {setting}.',
      unknownSetting: 'No hay ningún ajuste llamado «{setting}».',
      markerUnknown:
        'Esta partida no tiene el marcador «{marker}», así que no se mostrará. Usa !deathtracker markers para ver los nombres que puedes usar.',
      checked: 'Comprobados {count} token(s).',
      cleared: 'Quitados los marcadores de DeathTracker de {count} token(s).',
      restored: 'Devueltos {count} token(s) a su sitio.',
      nothingToRestore: 'DeathTracker no ha movido ninguno de esos tokens.',
      roleSet: '{names}: {role}.',
      stabilised: 'Estables: {count}.',
      notDown: 'Ninguno de esos tokens es un PJ a 0 puntos de golpe.',
      synced: '{name}: {s} éxito(s), {f} fallo(s).',
      macroCreated:
        'Se ha creado la acción de token «{macro}». Un jugador selecciona su token y hace clic en ella después de tirar una salvación de muerte.',
      journalRebuilt: 'Se han reconstruido los handouts «{help}» y «{deck}».',
      resetDone: 'Los ajustes han vuelto a sus valores predeterminados.',
      restartNotNeeded: 'No hace falta reiniciar: la nueva barra se usa a partir de ahora.',
    },
    status: {
      healthy: 'Sano',
      bloodied: 'Ensangrentado',
      dying: 'Moribundo',
      stable: 'Estable',
      dead: 'Muerto',
      none: 'Sin seguimiento',
      pc: 'PJ',
      npc: 'PNJ',
      hp: 'PG {hp}/{max}',
      hpNoMax: 'PG {hp}',
      saves: 'Salvaciones de muerte: {s} éxito(s), {f} fallo(s)',
      unnamed: 'Un token',
      noneHere: 'Todavía no hay tokens con puntos de golpe en esta página.',
      page: 'Página: {page}',
      selected: 'Tokens seleccionados',
      actions: 'Movido al morir',
    },
    announce: {
      dying: '{name} ha caído y se está muriendo.',
      stable: '{name} está estable.',
      dead: '{name} ha muerto.',
      up: '{name} vuelve a estar en pie.',
      savesHint: 'Las salvaciones de muerte marcadas en la hoja se cuentan a medida que se hacen.',
    },
    menu: {
      summary: 'En esta página',
      down: 'PJ caídos',
      noneDown: 'No hay ningún PJ caído.',
      tools: 'Herramientas',
      sandbox: 'Sandbox de Mods: {version}',
      sandboxUnknown: 'desconocida',
      hcNote: 'HealthColors está instalado.',
    },
    buttons: {
      menu: 'Menú',
      status: 'Estado',
      checkPage: 'Comprobar página',
      check: 'Comprobar selección',
      settings: 'Ajustes',
      help: 'Ayuda',
      stable: 'Estabilizar',
      restore: 'Restaurar',
      clear: 'Quitar marcadores',
      pc: 'Hacer PJ',
      npc: 'Hacer PNJ',
      auto: 'Decidir automáticamente',
      markers: 'Marcadores',
      macro: 'Crear macro de salvación de muerte',
      rebuild: 'Reconstruir handouts',
      reset: 'Restablecer ajustes',
      on: 'Activado',
      off: 'Desactivado',
      back: 'Volver',
    },
    prompts: {
      marker: 'Marcador',
      percent: 'Ensangrentado en o por debajo de (% del máximo)',
      fields: 'Nombres de campo separados por comas',
      fx: 'Efecto (tipo-color)',
      language: 'Idioma',
    },
    sections: {
      owners: 'Quién se encarga de qué',
      hp: 'Puntos de golpe',
      markers: 'Marcadores',
      deathSaves: 'Salvaciones de muerte (PJ)',
      onDeath: 'Cuando un token muere',
      looks: 'Tinte y efectos',
      general: 'General',
    },
    settings: {
      deathSavesBy: 'Salvaciones y marcadores a 0 PG',
      coloursBy: 'Colores de salud',
      effectsBy: 'Efectos de daño y curación',
      language: 'Idioma',
      hpBar: 'Barra de puntos de golpe',
      bloodiedPercent: 'Ensangrentado en',
      bloodiedMarker: 'Marcador de ensangrentado',
      dyingMarker: 'Marcador de moribundo',
      stableMarker: 'Marcador de estable',
      deadMarker: 'Marcador de muerto',
      pcDetection: 'Quién es un PJ',
      deathSaves: 'Llevar salvaciones de muerte',
      resetSheetSaves: 'Vaciar casillas de la hoja',
      successFields: 'Campos de éxito',
      failureFields: 'Campos de fallo',
      massiveDamage: 'Daño masivo',
      announce: 'Anunciar',
      deathLayer: 'Mover a los muertos a',
      deathTurnOrder: 'Orden de turnos',
      deathActionsFor: 'Se aplica a',
      tintPlayers: 'Teñir PJ',
      tintNpcs: 'Teñir PNJ',
      hurtFx: 'Efecto de daño',
      hurtFxType: 'Tipo de efecto de daño',
      healFx: 'Efecto de curación',
      healFxType: 'Tipo de efecto de curación',
    },
    choices: {
      hpBar: { 1: 'Barra 1', 2: 'Barra 2', 3: 'Barra 3' },
      pcDetection: { auto: 'Jugadores u hoja', players: 'Controlado por un jugador' },
      deathLayer: { none: 'Se queda', gmlayer: 'Capa del DJ', map: 'Capa de mapa' },
      deathTurnOrder: { keep: 'Mantener', remove: 'Quitar' },
      deathActionsFor: { npc: 'PNJ', all: 'PNJ y PJ' },
      announce: { off: 'Desactivado', gm: 'DJ', controllers: 'DJ y jugadores' },
      none: 'Ninguno',
      notInstalled: 'no instalado',
    },
    help: {
      menu: 'Abrir el menú.',
      status:
        'Mostrar el estado de los tokens seleccionados, o de todos los tokens con seguimiento en tu página.',
      check: 'Volver a evaluar los tokens seleccionados (all: todos los tokens de tu página).',
      stable: 'Marcar como estables los PJ seleccionados a 0 puntos de golpe.',
      clear:
        'Quitar los marcadores y el tinte de DeathTracker de los tokens seleccionados y olvidarlos.',
      restore: 'Devolver los tokens muertos que movió DeathTracker a su capa y al orden de turnos.',
      role: 'Tratar a los personajes de los tokens seleccionados como PJ o PNJ, o dejar que decida DeathTracker.',
      markers: 'Listar los marcadores de esta partida, con los nombres que hay que usar.',
      macro:
        'Crear una acción de token en la que los jugadores hacen clic para enviar sus salvaciones de muerte (para hojas que DeathTracker no puede leer).',
      dsync: 'La envía la macro de salvación de muerte.',
      settings: 'Abrir los ajustes.',
      set: 'Cambiar un ajuste.',
      reset: 'Devolver todos los ajustes a su valor predeterminado.',
      config: 'Comandos de la versión 0.1: abrir los ajustes, o cambiar uno (config bar|2).',
      journal: 'Reconstruir los handouts de Ayuda y Command Deck.',
      help: 'Mostrar esta lista.',
      ids: 'Añade --ids id1,id2 para trabajar con tokens por ID en lugar de con la selección.',
    },
    deck: {
      menuTitle: 'Menú',
      menuDesc: 'El menú, el estado, los ajustes y la ayuda.',
      selectedTitle: 'Tokens seleccionados',
      selectedDesc: 'Selecciona tokens en el mapa y pulsa un botón.',
      roleTitle: 'PJ o PNJ',
      roleDesc: 'Para los personajes de los tokens seleccionados.',
      toolsTitle: 'Herramientas',
      toolsDesc: 'Los marcadores, la macro de salvación de muerte y estos handouts.',
      footer: 'La guía completa está en el handout «{help}».',
    },
    handout: {
      versionLabel: 'Versión',
      subtitle:
        'Ensangrentado, moribundo, estable y muerto, según los puntos de golpe y las salvaciones de muerte',
      footer: 'Hay botones para cada comando en «{deck}».',
      overview: {
        heading: 'Descripción general',
        body: 'DeathTracker vigila la barra de puntos de golpe de cada token. Marca los tokens que están ensangrentados o muertos, lleva las tiradas de salvación de muerte de los personajes jugadores a 0 puntos de golpe, y puede quitar a los muertos del mapa y del orden de turnos.',
      },
      quickStart: {
        heading: 'Inicio rápido',
        steps: [
          'Pon los puntos de golpe en la Barra 1 (o elige otra barra en Ajustes).',
          'Haz daño a un token: a la mitad de su máximo recibe el marcador de ensangrentado; a 0, un PNJ recibe el marcador de muerto.',
          'Un PJ a 0 recibe el marcador de moribundo. Marca las salvaciones de muerte en la hoja: tres éxitos lo dejan Estable, tres fallos Muerto.',
          'Cúralo por encima de 0 y los marcadores desaparecen.',
          'Escribe !deathtracker para el menú.',
        ],
      },
      statuses: {
        heading: 'Estados',
        points: [
          'Sano: por encima de la proporción de ensangrentado de los puntos de golpe máximos (sin marcador).',
          'Ensangrentado: en esa proporción o por debajo (50 % salvo que se cambie).',
          'Moribundo: un PJ a 0 puntos de golpe que está haciendo salvaciones de muerte.',
          'Estable: un PJ a 0 con tres éxitos, o estabilizado con el comando stable.',
          'Muerto: un PNJ a 0, un PJ con tres fallos, o un PJ muerto por daño masivo.',
          'Una barra vacía, o que no contiene un número, nunca se lee como 0.',
        ],
      },
      deathSaves: {
        heading: 'Salvaciones de muerte',
        points: [
          'Hoja de D&D 2024: se lee de la hoja a medida que se marcan casillas o se tiran salvaciones.',
          'Hoja de D&D 2014 y otras con casillas: se lee de los campos de éxito y de fallo de Ajustes.',
          'La hoja conserva las marcas antiguas tras curarse, así que las salvaciones se cuentan desde el momento en que el PJ cae a 0. Con Vaciar casillas de la hoja activado, DeathTracker vacía las casillas de la hoja cuando el PJ cae a 0 y cuando se cura, y muestra las casillas de salvación de muerte de la hoja de D&D 2024 cuando un PJ cae a 0 desde la barra del token.',
          'Si no se puede leer la hoja, crea la macro de salvación de muerte (!deathtracker macro): los jugadores seleccionan su token y hacen clic en ella después de cada salvación.',
          'Quién es un PJ: un token o personaje controlado por un jugador, o (Jugadores u hoja) uno cuya hoja dice que no es un PNJ. Usa Hacer PJ / Hacer PNJ para decidirlo para un personaje.',
        ],
      },
      onDeath: {
        heading: 'Cuando un token muere',
        points: [
          'Mover a los muertos a la capa del DJ o a la capa de mapa, y quitarlos del orden de turnos. Ambas opciones están desactivadas al principio.',
          'Se aplica solo a los PNJ, salvo que se elija PNJ y PJ.',
          'Curar un token muerto le quita los marcadores pero no lo devuelve a su sitio. Selecciónalo y usa Restaurar (vuelve al orden de turnos con su iniciativa).',
          'Daño masivo (desactivado al principio): un PJ cuya barra baja de 0 en al menos su máximo muere en el acto. La hoja de 2024 se detiene en 0, así que esto solo funciona cuando se escribe en la barra un valor por debajo de 0.',
        ],
      },
      healthColors: {
        heading: 'HealthColors y otros Mods',
        points: [
          'Quién se encarga de qué, en Ajustes, elige qué Mod lleva las salvaciones de muerte (con los marcadores de moribundo, estable y muerto), los colores de salud y los efectos de daño y curación: DeathTracker, HealthColors o Desactivado. HealthColors 2.5 o posterior muestra la misma elección, y cambiarla en cualquiera de los dos Mods la cambia en ambos.',
          'Al principio, DeathTracker se encarga de las salvaciones de muerte y HealthColors de los colores y los efectos. Sin HealthColors, DeathTracker se encarga de las tres cosas.',
          'Las versiones de HealthColors anteriores a la 2.5 no comparten la elección: desactiva sus salvaciones de muerte con !aura deathsaves off.',
          'Se detectan los cambios hechos por TokenMod. Otros Mods pueden llamar a DeathTracker.check(token) después de cambiar los puntos de golpe.',
          'DeathTracker solo quita los marcadores que ha puesto él mismo.',
        ],
      },
      commands: {
        heading: 'Comandos',
        intro:
          'Todos los comandos empiezan por !deathtracker (o !dt, o !dead de la versión 0.1). Solo para el DJ, salvo la macro de salvación de muerte.',
        colCommand: 'Comando',
        colDesc: 'Qué hace',
      },
      settings: {
        heading: 'Ajustes',
        intro:
          'Cámbialos en el menú, con !deathtracker set <setting> <value>, o en las opciones de la biblioteca de Mods.',
        colKey: 'Ajuste',
        colDesc: 'Qué hace',
        rows: {
          deathSavesBy:
            'Quién lleva las salvaciones de muerte y pone los marcadores de moribundo, estable y muerto: DeathTracker, HealthColors u off. Compartido con HealthColors.',
          coloursBy:
            'Quién colorea los tokens según sus puntos de golpe: DeathTracker (su tinte), HealthColors u off. Compartido con HealthColors.',
          effectsBy:
            'Quién reproduce los efectos de daño y curación: DeathTracker, HealthColors u off. Compartido con HealthColors.',
          language: 'Idioma de los menús, mensajes y handouts.',
          hpBar: 'La barra que contiene los puntos de golpe (1, 2 o 3).',
          bloodiedPercent:
            'Ensangrentado en o por debajo de este porcentaje de los puntos de golpe máximos (0 desactiva Ensangrentado).',
          bloodiedMarker: 'Marcador de ensangrentado (none para ningún marcador).',
          dyingMarker: 'Marcador de un PJ moribundo.',
          stableMarker: 'Marcador de un PJ estable.',
          deadMarker: 'Marcador de los muertos.',
          pcDetection:
            'auto: controlado por un jugador o la hoja dice PJ; players: solo controlado por un jugador.',
          deathSaves: 'Llevar las salvaciones de muerte de los PJ a 0 puntos de golpe.',
          resetSheetSaves:
            'Vaciar las casillas de salvación de muerte de la hoja cuando un PJ cae a 0 y cuando se cura, y mostrarlas en la hoja de D&D 2024.',
          successFields: 'Campos de la hoja marcados para los éxitos (2014 y otras hojas).',
          failureFields: 'Campos de la hoja marcados para los fallos.',
          massiveDamage: 'Un PJ cuya barra baja de 0 en al menos su máximo muere en el acto.',
          announce:
            'A quién se avisa cuando un PJ cae, se estabiliza, muere o se levanta: off, gm o controllers.',
          deathLayer: 'Mover a los muertos a: none, gmlayer o map.',
          deathTurnOrder: 'Mantener (keep) o quitar (remove) a los muertos del orden de turnos.',
          deathActionsFor:
            'npc: mover y el orden de turnos se aplican a los PNJ; all: también a los PJ.',
          tintPlayers: 'Teñir a los PJ de verde a rojo a medida que pierden puntos de golpe.',
          tintNpcs: 'Teñir a los PNJ de la misma forma.',
          hurtFx: 'Reproducir un efecto cuando un token pierde puntos de golpe.',
          hurtFxType: 'Ese efecto, como tipo-color (splatter-blood).',
          healFx: 'Reproducir un efecto cuando un token gana puntos de golpe.',
          healFxType: 'Ese efecto (glow-holy).',
        },
      },
      api: {
        heading: 'Para autores de Mods',
        intro: 'DeathTracker publica un objeto DeathTracker.',
        colFunction: 'Función',
        colDesc: 'Qué hace',
        rows: {
          check: 'Evaluar un token ahora (después de cambiar sus puntos de golpe desde un Mod).',
          getStatus: 'El estado de un token: healthy, bloodied, dying, stable, dead o null.',
          onStatusChange:
            'Recibir aviso cuando cambia un estado ({token, status, previous, isPc}).',
          observe:
            'Versión 0.1: recibir (token, prev) después de que DeathTracker procese un cambio de puntos de golpe.',
          managing:
            'True cuando DeathTracker lleva las salvaciones de muerte: están activadas y DeathTracker es quien se encarga de ellas (HealthColors lo usa).',
          ownersChanged:
            'Poner los tokens al día después de cambiar quién se encarga de qué (HealthColors lo llama).',
        },
      },
      upgrading: {
        heading: 'Actualizar desde 0.1',
        points: [
          'Se conservan tus ajustes de marcadores, barra, tinte y efectos.',
          '!dead sigue funcionando, igual que !dead config y !dead reset.',
          'El marcador de inconsciente de los PJ ahora es el marcador de moribundo.',
          'Cambiar la barra ya no requiere reiniciar.',
        ],
      },
      troubleshooting: {
        heading: 'Solución de problemas',
        points: [
          'No pasa nada: comprueba la barra de puntos de golpe en Ajustes, y que la barra contiene un número.',
          'Un PJ se trata como PNJ: selecciónalo y pulsa Hacer PJ, o deja que un jugador controle el personaje.',
          'Un marcador no se muestra: usa !deathtracker markers y elige un nombre de la lista.',
          'No se detectan los puntos de golpe cambiados por otro Mod: ese Mod debe llamar a DeathTracker.check(token).',
        ],
      },
      languages: {
        heading: 'Idiomas',
        body: 'Elige el idioma con !deathtracker set language <code>.',
        colLanguage: 'Idioma',
        colNative: 'Nombre nativo',
        colCode: 'Código',
      },
      credits: {
        heading: 'Créditos',
        original: 'Escrito por',
        maintainer: 'Reescrito para la versión 1.0 por',
        support:
          '¿Has encontrado un problema o tienes una idea? Contacta con MidNiteShadow7 en Roll20.',
      },
    },
    errors: {
      gmOnly: 'Solo el DJ puede usar ese comando de DeathTracker.',
      unknownCommand: 'DeathTracker no tiene el comando «{command}».',
      noTokens: 'Selecciona primero uno o más tokens (o añade --ids).',
      notYourToken: 'No controlas ese token.',
      hint: 'Escribe !deathtracker help para ver la lista de comandos.',
    },
  };

  var localeSv = {
    titles: {
      ready: 'DeathTracker är redo.',
      menu: 'DeathTracker',
      status: 'DeathTracker-status',
      settings: 'DeathTracker-inställningar',
      help: 'DeathTracker-kommandon',
      announce: 'DeathTracker',
      markers: 'Tokenmarkörer',
    },
    messages: {
      readyHint: 'Skriv !deathtracker för att öppna menyn.',
      migrated:
        'Dina inställningar från DeathTracker 0.1 har förts över. !dead fungerar fortfarande; !deathtracker är det nya kommandot.',
      healthColors:
        'HealthColors är installerat: DeathTracker sköter dödsräddningsslag och markörerna för döende, stabil och död, och HealthColors sköter hälsofärgerna och skade-/läkeeffekterna. Ändra vem som sköter vad i Inställningar.',
      healthColorsSaves:
        'HealthColors följer också dödsräddningsslag och sätter markörer för döende. Stäng av ett av dem (!aura deathsaves off) så att de inte bråkar om markörerna.',
      settingChanged: '{setting} är nu {value}.',
      settingRejected: '"{value}" är inte ett giltigt värde för {setting}.',
      unknownSetting: 'Det finns ingen inställning som heter "{setting}".',
      markerUnknown:
        'Det här spelet har ingen markör "{marker}", så den kommer inte att synas. Använd !deathtracker markers för att se vilka namn du kan använda.',
      checked: 'Kontrollerade {count} token(s).',
      cleared: 'Tog bort DeathTrackers markörer från {count} token(s).',
      restored: 'Flyttade tillbaka {count} token(s).',
      nothingToRestore: 'Ingen av de tokens har flyttats av DeathTracker.',
      roleSet: '{names}: {role}.',
      stabilised: 'Stabila: {count}.',
      notDown: 'Ingen av de tokens är en RP med 0 träffpoäng.',
      synced: '{name}: {s} lyckade, {f} misslyckade.',
      macroCreated:
        'Skapade tokenåtgärden "{macro}". En spelare markerar sin token och klickar på den efter att ha slagit ett dödsräddningsslag.',
      journalRebuilt: 'Handouterna "{help}" och "{deck}" har byggts om.',
      resetDone: 'Inställningarna är återställda till standard.',
      restartNotNeeded: 'Ingen omstart behövs: den nya mätaren används från och med nu.',
    },
    status: {
      healthy: 'Frisk',
      bloodied: 'Blödande',
      dying: 'Döende',
      stable: 'Stabil',
      dead: 'Död',
      none: 'Följs inte',
      pc: 'RP',
      npc: 'SLP',
      hp: 'TP {hp}/{max}',
      hpNoMax: 'TP {hp}',
      saves: 'Dödsräddningsslag: {s} lyckade, {f} misslyckade',
      unnamed: 'En token',
      noneHere: 'Inga tokens med träffpoäng på den här sidan än.',
      page: 'Sida: {page}',
      selected: 'Markerade tokens',
      actions: 'Flyttad när den dog',
    },
    announce: {
      dying: '{name} har fallit och är döende.',
      stable: '{name} är stabil.',
      dead: '{name} har dött.',
      up: '{name} är på fötter igen.',
      savesHint: 'Dödsräddningsslag som bockas i på formuläret räknas allteftersom de görs.',
    },
    menu: {
      summary: 'På den här sidan',
      down: 'Fallna RP',
      noneDown: 'Inga RP har fallit.',
      tools: 'Verktyg',
      sandbox: 'Mod-sandlåda: {version}',
      sandboxUnknown: 'okänd',
      hcNote: 'HealthColors är installerat.',
    },
    buttons: {
      menu: 'Meny',
      status: 'Status',
      checkPage: 'Kontrollera sidan',
      check: 'Kontrollera markerade',
      settings: 'Inställningar',
      help: 'Hjälp',
      stable: 'Stabilisera',
      restore: 'Återställ',
      clear: 'Rensa markörer',
      pc: 'Gör till RP',
      npc: 'Gör till SLP',
      auto: 'Avgör automatiskt',
      markers: 'Markörer',
      macro: 'Skapa makro för dödsräddningsslag',
      rebuild: 'Bygg om handouts',
      reset: 'Återställ inställningar',
      on: 'På',
      off: 'Av',
      back: 'Tillbaka',
    },
    prompts: {
      marker: 'Markör',
      percent: 'Blödande vid eller under (% av max)',
      fields: 'Fältnamn åtskilda med kommatecken',
      fx: 'Effekt (typ-färg)',
      language: 'Språk',
    },
    sections: {
      owners: 'Vem sköter vad',
      hp: 'Träffpoäng',
      markers: 'Markörer',
      deathSaves: 'Dödsräddningsslag (RP)',
      onDeath: 'När en token dör',
      looks: 'Färgton och effekter',
      general: 'Allmänt',
    },
    settings: {
      deathSavesBy: 'Dödsräddningsslag och markörer vid 0 TP',
      coloursBy: 'Hälsofärger',
      effectsBy: 'Skade- och läkeeffekter',
      language: 'Språk',
      hpBar: 'Mätare för träffpoäng',
      bloodiedPercent: 'Blödande vid',
      bloodiedMarker: 'Markör för blödande',
      dyingMarker: 'Markör för döende',
      stableMarker: 'Markör för stabil',
      deadMarker: 'Markör för död',
      pcDetection: 'Vem är en RP',
      deathSaves: 'Följ dödsräddningsslag',
      resetSheetSaves: 'Rensa formulärets rutor',
      successFields: 'Fält för lyckade',
      failureFields: 'Fält för misslyckade',
      massiveDamage: 'Massiv skada',
      announce: 'Meddela',
      deathLayer: 'Flytta de döda till',
      deathTurnOrder: 'Turordning',
      deathActionsFor: 'Gäller för',
      tintPlayers: 'Färgtona RP',
      tintNpcs: 'Färgtona SLP',
      hurtFx: 'Skadeeffekt',
      hurtFxType: 'Typ av skadeeffekt',
      healFx: 'Läkeeffekt',
      healFxType: 'Typ av läkeeffekt',
    },
    choices: {
      hpBar: { 1: 'Mätare 1', 2: 'Mätare 2', 3: 'Mätare 3' },
      pcDetection: { auto: 'Spelare eller formulär', players: 'Styrs av en spelare' },
      deathLayer: { none: 'Stanna kvar', gmlayer: 'SL-lagret', map: 'Kartlagret' },
      deathTurnOrder: { keep: 'Behåll', remove: 'Ta bort' },
      deathActionsFor: { npc: 'SLP', all: 'SLP och RP' },
      announce: { off: 'Av', gm: 'SL', controllers: 'SL och spelare' },
      none: 'Ingen',
      notInstalled: 'inte installerat',
    },
    help: {
      menu: 'Öppna menyn.',
      status: 'Visa status för de markerade tokens, eller för alla följda tokens på din sida.',
      check: 'Bedöm de markerade tokens igen (all: alla tokens på din sida).',
      stable: 'Markera de markerade RP med 0 träffpoäng som stabila.',
      clear: 'Ta bort DeathTrackers markörer och färgton från de markerade tokens och glöm dem.',
      restore:
        'Flytta tillbaka döda tokens som DeathTracker flyttat till sitt lager och in i turordningen.',
      role: 'Behandla de markerade tokens rollpersoner som RP eller SLP, eller låt DeathTracker avgöra.',
      markers: 'Lista markörerna i det här spelet, med namnen som ska användas.',
      macro:
        'Skapa en tokenåtgärd som spelare klickar på för att skicka sina dödsräddningsslag (för formulär som DeathTracker inte kan läsa).',
      dsync: 'Skickas av makrot för dödsräddningsslag.',
      settings: 'Öppna inställningarna.',
      set: 'Ändra en inställning.',
      reset: 'Återställ alla inställningar till standard.',
      config: 'Kommandon från version 0.1: öppna inställningarna eller ändra en (config bar|2).',
      journal: 'Bygg om handouterna Help och Command Deck.',
      help: 'Visa den här listan.',
      ids: 'Lägg till --ids id1,id2 för att arbeta med tokens via ID i stället för markeringen.',
    },
    deck: {
      menuTitle: 'Meny',
      menuDesc: 'Menyn, status, inställningar och hjälp.',
      selectedTitle: 'Markerade tokens',
      selectedDesc: 'Markera tokens på kartan och tryck sedan på en knapp.',
      roleTitle: 'RP eller SLP',
      roleDesc: 'För de markerade tokens rollpersoner.',
      toolsTitle: 'Verktyg',
      toolsDesc: 'Markörer, makrot för dödsräddningsslag och de här handouterna.',
      footer: 'Den fullständiga guiden finns i handouten "{help}".',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Blödande, döende, stabil och död, utifrån träffpoäng och dödsräddningsslag',
      footer: 'Knappar för alla kommandon finns i "{deck}".',
      overview: {
        heading: 'Översikt',
        body: 'DeathTracker bevakar träffpoängsmätaren på varje token. Den markerar tokens som är blödande eller döda, följer dödsräddningsslag för rollpersoner med 0 träffpoäng och kan flytta de döda bort från kartan och ut ur turordningen.',
      },
      quickStart: {
        heading: 'Snabbstart',
        steps: [
          'Lägg träffpoängen i Mätare 1 (eller välj en annan mätare i Inställningar).',
          'Skada en token: vid hälften av sitt max får den markören för blödande; vid 0 får en SLP markören för död.',
          'En RP vid 0 får markören för döende. Bocka i dödsräddningsslag på formuläret: tre lyckade gör den Stabil, tre misslyckade Död.',
          'Läk den över 0 så försvinner markörerna.',
          'Skriv !deathtracker för menyn.',
        ],
      },
      statuses: {
        heading: 'Statusar',
        points: [
          'Frisk: över gränsen för Blödande av max träffpoäng (ingen markör).',
          'Blödande: vid eller under den gränsen (50 % om inget annat valts).',
          'Döende: en RP med 0 träffpoäng som slår dödsräddningsslag.',
          'Stabil: en RP vid 0 med tre lyckade, eller stabiliserad med kommandot stable.',
          'Död: en SLP vid 0, en RP med tre misslyckade, eller en RP som dödats av massiv skada.',
          'En tom mätare, eller en som inte innehåller ett tal, läses aldrig som 0.',
        ],
      },
      deathSaves: {
        heading: 'Dödsräddningsslag',
        points: [
          'D&D 2024-formulär: läses från formuläret när rutor bockas i eller slag slås.',
          'D&D 2014-formulär och andra med kryssrutor: läses från fälten för lyckade och misslyckade i Inställningar.',
          'Formuläret behåller gamla bockar efter läkning, så slagen räknas från det ögonblick RP:n faller till 0. Med Rensa formulärets rutor påslaget rensar DeathTracker formulärets rutor när RP:n faller till 0 och när den läks, och visar D&D 2024-formulärets rutor för dödsräddningsslag när en RP faller till 0 via tokenmätaren.',
          'Om formuläret inte kan läsas, skapa makrot för dödsräddningsslag (!deathtracker macro): spelarna markerar sin token och klickar på det efter varje slag.',
          'Vem är en RP: en token eller rollperson som styrs av en spelare, eller (Spelare eller formulär) en vars formulär säger att den inte är en SLP. Använd Gör till RP / Gör till SLP för att bestämma för en rollperson.',
        ],
      },
      onDeath: {
        heading: 'När en token dör',
        points: [
          'Flytta de döda till SL-lagret eller kartlagret och ta bort dem ur turordningen. Båda är avstängda från början.',
          'Gäller bara SLP, om det inte är inställt på SLP och RP.',
          'Att läka en död token tar bort dess markörer men flyttar inte tillbaka den. Markera den och använd Återställ (den kommer tillbaka in i turordningen med sitt initiativ).',
          'Massiv skada (avstängd från början): en RP vars mätare går under 0 med minst sitt max dör direkt. 2024-formuläret stannar vid 0, så detta fungerar bara när ett värde under 0 skrivs in i mätaren.',
        ],
      },
      healthColors: {
        heading: 'HealthColors och andra Mods',
        points: [
          'Vem sköter vad, i Inställningar, väljer vilken Mod som sköter dödsräddningsslag (med markörerna för döende, stabil och död), hälsofärger och skade-/läkeeffekter: DeathTracker, HealthColors eller Av. HealthColors 2.5 och senare visar samma val, och en ändring i någon av dem gäller för båda.',
          'Från början sköter DeathTracker dödsräddningsslag och HealthColors färgerna och effekterna. Utan HealthColors sköter DeathTracker alla tre.',
          'HealthColors före 2.5 delar inte valet: stäng av dess dödsräddningsslag med !aura deathsaves off.',
          'Ändringar gjorda av TokenMod uppfattas. Andra Mods kan anropa DeathTracker.check(token) efter att ha ändrat träffpoäng.',
          'DeathTracker tar bara bort markörer som den själv har satt.',
        ],
      },
      commands: {
        heading: 'Kommandon',
        intro:
          'Alla kommandon börjar med !deathtracker (eller !dt, eller !dead från version 0.1). Bara för SL, utom makrot för dödsräddningsslag.',
        colCommand: 'Kommando',
        colDesc: 'Vad det gör',
      },
      settings: {
        heading: 'Inställningar',
        intro:
          'Ändra dem i menyn, med !deathtracker set <inställning> <värde>, eller i alternativen i Mod-biblioteket.',
        colKey: 'Inställning',
        colDesc: 'Vad den gör',
        rows: {
          deathSavesBy:
            'Vem som följer dödsräddningsslag och sätter markörerna för döende, stabil och död: DeathTracker, HealthColors eller av. Delas med HealthColors.',
          coloursBy:
            'Vem som färgar tokens efter träffpoäng: DeathTracker (dess färgton), HealthColors eller av. Delas med HealthColors.',
          effectsBy:
            'Vem som spelar skade- och läkeeffekterna: DeathTracker, HealthColors eller av. Delas med HealthColors.',
          language: 'Språk för menyer, meddelanden och handouts.',
          hpBar: 'Mätaren som innehåller träffpoängen (1, 2 eller 3).',
          bloodiedPercent:
            'Blödande vid eller under denna procent av max träffpoäng (0 stänger av Blödande).',
          bloodiedMarker: 'Markör för Blödande (none för ingen markör).',
          dyingMarker: 'Markör för en döende RP.',
          stableMarker: 'Markör för en stabil RP.',
          deadMarker: 'Markör för de döda.',
          pcDetection:
            'auto: styrs av en spelare eller formuläret säger RP; players: bara om den styrs av en spelare.',
          deathSaves: 'Följ dödsräddningsslag för RP med 0 träffpoäng.',
          resetSheetSaves:
            'Rensa formulärets rutor för dödsräddningsslag när en RP faller till 0 och när den läks, och visa dem på D&D 2024-formuläret.',
          successFields: 'Formulärfält som bockas i för lyckade (2014 och andra formulär).',
          failureFields: 'Formulärfält som bockas i för misslyckade.',
          massiveDamage: 'En RP vars mätare går under 0 med minst sitt max dör direkt.',
          announce:
            'Vem som får veta när en RP faller, blir stabil, dör eller reser sig: off, gm eller controllers.',
          deathLayer: 'Flytta de döda till: none, gmlayer eller map.',
          deathTurnOrder: 'keep eller remove de döda i turordningen.',
          deathActionsFor: 'npc: flytt och turordning gäller SLP; all: även RP.',
          tintPlayers: 'Färgtona RP från grönt till rött när de förlorar träffpoäng.',
          tintNpcs: 'Färgtona SLP på samma sätt.',
          hurtFx: 'Spela en effekt när en token förlorar träffpoäng.',
          hurtFxType: 'Den effekten, som typ-färg (splatter-blood).',
          healFx: 'Spela en effekt när en token får träffpoäng.',
          healFxType: 'Den effekten (glow-holy).',
        },
      },
      api: {
        heading: 'För Mod-utvecklare',
        intro: 'DeathTracker publicerar ett DeathTracker-objekt.',
        colFunction: 'Funktion',
        colDesc: 'Vad den gör',
        rows: {
          check: 'Bedöm en token nu (efter att ha ändrat dess träffpoäng från en Mod).',
          getStatus: 'En tokens status: healthy, bloodied, dying, stable, dead eller null.',
          onStatusChange: 'Få veta när en status ändras ({token, status, previous, isPc}).',
          observe:
            'Version 0.1: få veta (token, prev) efter att DeathTracker har hanterat en ändring av träffpoäng.',
          managing:
            'True när DeathTracker följer dödsräddningsslag: de är på och DeathTracker är vald att sköta dem (HealthColors använder detta).',
          ownersChanged:
            'Uppdatera tokens efter att vem som sköter vad har ändrats (HealthColors anropar detta).',
        },
      },
      upgrading: {
        heading: 'Uppgradera från 0.1',
        points: [
          'Dina inställningar för markörer, mätare, färgton och effekter förs över.',
          '!dead fungerar fortfarande, liksom !dead config och !dead reset.',
          'Markören Unconscious för RP är nu markören för döende.',
          'Att byta mätare kräver inte längre en omstart.',
        ],
      },
      troubleshooting: {
        heading: 'Felsökning',
        points: [
          'Inget händer: kontrollera mätaren för träffpoäng i Inställningar, och att mätaren innehåller ett tal.',
          'En RP behandlas som en SLP: markera den och tryck på Gör till RP, eller låt en spelare styra rollpersonen.',
          'En markör syns inte: använd !deathtracker markers och välj ett namn från listan.',
          'Träffpoäng som ändrats av en annan Mod uppfattas inte: den Modden bör anropa DeathTracker.check(token).',
        ],
      },
      languages: {
        heading: 'Språk',
        body: 'Ställ in språket med !deathtracker set language <kod>.',
        colLanguage: 'Språk',
        colNative: 'Eget namn',
        colCode: 'Kod',
      },
      credits: {
        heading: 'Tack',
        original: 'Skriven av',
        maintainer: 'Omskriven för version 1.0 av',
        support: 'Hittat ett problem eller har en idé? Kontakta MidNiteShadow7 på Roll20.',
      },
    },
    errors: {
      gmOnly: 'Bara SL kan använda det DeathTracker-kommandot.',
      unknownCommand: 'DeathTracker har inget kommando "{command}".',
      noTokens: 'Markera en eller flera tokens först (eller lägg till --ids).',
      notYourToken: 'Du styr inte den token.',
      hint: 'Skriv !deathtracker help för listan med kommandon.',
    },
  };

  var localeTr = {
    titles: {
      ready: 'DeathTracker hazır.',
      menu: 'DeathTracker',
      status: 'DeathTracker Durumu',
      settings: 'DeathTracker Ayarları',
      help: 'DeathTracker Komutları',
      announce: 'DeathTracker',
      markers: 'Jeton İşaretçileri',
    },
    messages: {
      readyHint: 'Menüyü açmak için !deathtracker yazın.',
      migrated:
        'DeathTracker 0.1 ayarlarınız aktarıldı. !dead hâlâ çalışıyor; yeni komut !deathtracker.',
      healthColors:
        'HealthColors kurulu: ölüm kurtarma atışlarını ve ölmekte, stabil ve ölü işaretçilerini DeathTracker, sağlık renklerini ve hasar/iyileşme efektlerini HealthColors yönetiyor. Neyi kimin yöneteceğini Ayarlar’dan değiştirin.',
      healthColorsSaves:
        'HealthColors da ölüm kurtarma atışlarını izliyor ve ölmekte işaretçileri koyuyor. İşaretçiler için çakışmamaları adına birini kapatın (!aura deathsaves off).',
      settingChanged: '{setting} artık {value}.',
      settingRejected: '“{value}”, {setting} için geçerli bir değer değil.',
      unknownSetting: '“{setting}” adında bir ayar yok.',
      markerUnknown:
        'Bu oyunda “{marker}” işaretçisi yok, bu yüzden görünmeyecek. Kullanabileceğiniz adları görmek için !deathtracker markers yazın.',
      checked: '{count} jeton kontrol edildi.',
      cleared: '{count} jetondan DeathTracker işaretçileri kaldırıldı.',
      restored: '{count} jeton geri konuldu.',
      nothingToRestore: 'Bu jetonların hiçbiri DeathTracker tarafından taşınmadı.',
      roleSet: '{names}: {role}.',
      stabilised: 'Stabil: {count}.',
      notDown: 'Bu jetonların hiçbiri 0 can puanında bir PC değil.',
      synced: '{name}: {s} başarı, {f} başarısızlık.',
      macroCreated:
        '“{macro}” jeton eylemi oluşturuldu. Oyuncu ölüm kurtarma atışı yaptıktan sonra jetonunu seçip buna tıklar.',
      journalRebuilt: '“{help}” ve “{deck}” belgeleri yeniden oluşturuldu.',
      resetDone: 'Ayarlar varsayılanlarına döndü.',
      restartNotNeeded: 'Yeniden başlatma gerekmez: yeni çubuk bundan sonra kullanılır.',
    },
    status: {
      healthy: 'Sağlıklı',
      bloodied: 'Kanlı',
      dying: 'Ölmekte',
      stable: 'Stabil',
      dead: 'Ölü',
      none: 'İzlenmiyor',
      pc: 'PC',
      npc: 'NPC',
      hp: 'CP {hp}/{max}',
      hpNoMax: 'CP {hp}',
      saves: 'Ölüm kurtarma atışları: {s} başarı, {f} başarısızlık',
      unnamed: 'Bir jeton',
      noneHere: 'Bu sayfada henüz can puanı olan jeton yok.',
      page: 'Sayfa: {page}',
      selected: 'Seçili jetonlar',
      actions: 'Öldüğünde taşındı',
    },
    announce: {
      dying: '{name} yere düştü ve ölüyor.',
      stable: '{name} stabil.',
      dead: '{name} öldü.',
      up: '{name} yeniden ayakta.',
      savesHint: 'Sayfada işaretlenen ölüm kurtarma atışları yapıldıkça sayılır.',
    },
    menu: {
      summary: 'Bu sayfada',
      down: 'Düşen PC’ler',
      noneDown: 'Düşen PC yok.',
      tools: 'Araçlar',
      sandbox: 'Mod sandbox’ı: {version}',
      sandboxUnknown: 'bilinmiyor',
      hcNote: 'HealthColors kurulu.',
    },
    buttons: {
      menu: 'Menü',
      status: 'Durum',
      checkPage: 'Sayfayı kontrol et',
      check: 'Seçilileri kontrol et',
      settings: 'Ayarlar',
      help: 'Yardım',
      stable: 'Stabilize et',
      restore: 'Geri getir',
      clear: 'İşaretçileri temizle',
      pc: 'PC yap',
      npc: 'NPC yap',
      auto: 'Otomatik karar ver',
      markers: 'İşaretçiler',
      macro: 'Ölüm kurtarma atışı makrosu oluştur',
      rebuild: 'Belgeleri yeniden oluştur',
      reset: 'Ayarları sıfırla',
      on: 'Açık',
      off: 'Kapalı',
      back: 'Geri',
    },
    prompts: {
      marker: 'İşaretçi',
      percent: 'Bu değerde veya altında Kanlı (maksimumun yüzdesi)',
      fields: 'Virgülle ayrılmış alan adları',
      fx: 'Efekt (tür-renk)',
      language: 'Dil',
    },
    sections: {
      owners: 'Kim neyi yönetir',
      hp: 'Can puanları',
      markers: 'İşaretçiler',
      deathSaves: 'Ölüm kurtarma atışları (PC’ler)',
      onDeath: 'Bir jeton öldüğünde',
      looks: 'Renklendirme ve efektler',
      general: 'Genel',
    },
    settings: {
      deathSavesBy: 'Ölüm kurtarma ve 0 CP işaretçileri',
      coloursBy: 'Sağlık renkleri',
      effectsBy: 'Hasar ve iyileşme efektleri',
      language: 'Dil',
      hpBar: 'Can puanı çubuğu',
      bloodiedPercent: 'Kanlı eşiği',
      bloodiedMarker: 'Kanlı işaretçisi',
      dyingMarker: 'Ölmekte işaretçisi',
      stableMarker: 'Stabil işaretçisi',
      deadMarker: 'Ölü işaretçisi',
      pcDetection: 'Kim PC sayılır',
      deathSaves: 'Ölüm kurtarma atışlarını izle',
      resetSheetSaves: 'Sayfa kutularını temizle',
      successFields: 'Başarı alanları',
      failureFields: 'Başarısızlık alanları',
      massiveDamage: 'Büyük hasar',
      announce: 'Duyur',
      deathLayer: 'Ölüleri taşı',
      deathTurnOrder: 'Tur sırası',
      deathActionsFor: 'Uygulandığı',
      tintPlayers: 'PC’leri renklendir',
      tintNpcs: 'NPC’leri renklendir',
      hurtFx: 'Hasar efekti',
      hurtFxType: 'Hasar efekti türü',
      healFx: 'İyileşme efekti',
      healFxType: 'İyileşme efekti türü',
    },
    choices: {
      hpBar: { 1: 'Çubuk 1', 2: 'Çubuk 2', 3: 'Çubuk 3' },
      pcDetection: { auto: 'Oyuncular veya sayfa', players: 'Bir oyuncunun kontrolünde' },
      deathLayer: { none: 'Yerinde kalsın', gmlayer: 'GM katmanı', map: 'Harita katmanı' },
      deathTurnOrder: { keep: 'Tut', remove: 'Çıkar' },
      deathActionsFor: { npc: 'NPC’ler', all: 'NPC’ler ve PC’ler' },
      announce: { off: 'Kapalı', gm: 'GM', controllers: 'GM ve oyuncular' },
      none: 'Yok',
      notInstalled: 'kurulu değil',
    },
    help: {
      menu: 'Menüyü açar.',
      status: 'Seçili jetonların ya da sayfanızdaki izlenen her jetonun durumunu gösterir.',
      check: 'Seçili jetonları yeniden değerlendirir (all: sayfanızdaki her jeton).',
      stable: '0 can puanındaki seçili PC’leri stabil olarak işaretler.',
      clear:
        'DeathTracker’ın işaretçilerini ve renklendirmesini seçili jetonlardan kaldırır ve onları unutur.',
      restore: 'DeathTracker’ın taşıdığı ölü jetonları katmanlarına ve tur sırasına geri koyar.',
      role: 'Seçili jetonların karakterlerini PC veya NPC sayar ya da kararı DeathTracker’a bırakır.',
      markers: 'Bu oyundaki işaretçileri, kullanılacak adlarıyla listeler.',
      macro:
        'Oyuncuların ölüm kurtarma atışlarını göndermek için tıkladığı bir jeton eylemi oluşturur (DeathTracker’ın okuyamadığı sayfalar için).',
      dsync: 'Ölüm kurtarma atışı makrosu tarafından gönderilir.',
      settings: 'Ayarları açar.',
      set: 'Bir ayarı değiştirir.',
      reset: 'Tüm ayarları varsayılanlarına döndürür.',
      config: 'Sürüm 0.1 komutları: ayarları açar veya birini değiştirir (config bar|2).',
      journal: 'Help ve Command Deck belgelerini yeniden oluşturur.',
      help: 'Bu listeyi gösterir.',
      ids: 'Seçim yerine ID ile jetonlar üzerinde çalışmak için --ids id1,id2 ekleyin.',
    },
    deck: {
      menuTitle: 'Menü',
      menuDesc: 'Menü, durum, ayarlar ve yardım.',
      selectedTitle: 'Seçili jetonlar',
      selectedDesc: 'Haritada jetonları seçin, sonra bir düğmeye basın.',
      roleTitle: 'PC veya NPC',
      roleDesc: 'Seçili jetonların karakterleri için.',
      toolsTitle: 'Araçlar',
      toolsDesc: 'İşaretçiler, ölüm kurtarma atışı makrosu ve bu belgeler.',
      footer: 'Tam kılavuz “{help}” belgesinde.',
    },
    handout: {
      versionLabel: 'Sürüm',
      subtitle: 'Can puanlarından ve ölüm kurtarma atışlarından kanlı, ölmekte, stabil ve ölü',
      footer: 'Her komutun düğmesi “{deck}” içinde.',
      overview: {
        heading: 'Genel bakış',
        body: 'DeathTracker her jetonun can puanı çubuğunu izler. Kanlı veya ölü jetonları işaretler, 0 can puanındaki oyuncu karakterlerinin ölüm kurtarma atışlarını izler ve ölüleri haritadan ve tur sırasından çıkarabilir.',
      },
      quickStart: {
        heading: 'Hızlı başlangıç',
        steps: [
          'Can puanlarını Çubuk 1’e koyun (veya Ayarlar’dan başka bir çubuk seçin).',
          'Bir jetona hasar verin: maksimumunun yarısında Kanlı işaretçisini alır; 0’da bir NPC Ölü işaretçisini alır.',
          '0’daki bir PC Ölmekte işaretçisini alır. Ölüm kurtarma atışlarını sayfada işaretleyin: üç başarı onu Stabil, üç başarısızlık Ölü yapar.',
          'Onu 0’ın üstüne iyileştirin, işaretçiler kalkar.',
          'Menü için !deathtracker yazın.',
        ],
      },
      statuses: {
        heading: 'Durumlar',
        points: [
          'Sağlıklı: maksimum can puanının Kanlı eşiğinin üstünde (işaretçi yok).',
          'Kanlı: o eşikte veya altında (değiştirilmediyse %50).',
          'Ölmekte: 0 can puanında, ölüm kurtarma atışları yapan bir PC.',
          'Stabil: üç başarısı olan 0’daki bir PC ya da stable komutuyla stabilize edilmiş bir PC.',
          'Ölü: 0’daki bir NPC, üç başarısızlığı olan bir PC ya da büyük hasarla ölen bir PC.',
          'Boş bir çubuk ya da sayı içermeyen bir çubuk asla 0 olarak okunmaz.',
        ],
      },
      deathSaves: {
        heading: 'Ölüm kurtarma atışları',
        points: [
          'D&D 2024 sayfası: kutular işaretlendikçe veya atışlar yapıldıkça sayfadan okunur.',
          'D&D 2014 sayfası ve onay kutulu diğerleri: Ayarlar’daki başarı ve başarısızlık alanlarından okunur.',
          'Sayfa iyileşmeden sonra eski işaretleri tutar, bu yüzden atışlar PC’nin 0’a düştüğü andan itibaren sayılır. Sayfa kutularını temizle açıkken DeathTracker, PC 0’a düştüğünde ve iyileştiğinde sayfanın kutularını temizler ve bir PC jeton çubuğundan 0’a düştüğünde D&D 2024 sayfasının ölüm kurtarma atışı kutularını gösterir.',
          'Sayfa okunamıyorsa ölüm kurtarma atışı makrosunu oluşturun (!deathtracker macro): oyuncular her atıştan sonra jetonlarını seçip ona tıklar.',
          'Kim PC sayılır: bir oyuncunun kontrol ettiği bir jeton veya karakter ya da (Oyuncular veya sayfa) sayfası NPC olmadığını söyleyen biri. Bir karakter için karar vermek üzere PC yap / NPC yap kullanın.',
        ],
      },
      onDeath: {
        heading: 'Bir jeton öldüğünde',
        points: [
          'Ölüleri GM katmanına veya Harita katmanına taşır ve tur sırasından çıkarır. İkisi de başta kapalıdır.',
          'NPC’ler ve PC’ler olarak ayarlanmadıkça yalnızca NPC’lere uygulanır.',
          'Ölü bir jetonu iyileştirmek işaretçilerini kaldırır ama onu geri taşımaz. Onu seçip Geri getir’i kullanın (inisiyatifiyle birlikte tur sırasına geri döner).',
          'Büyük hasar (başta kapalı): çubuğu en az maksimumu kadar 0’ın altına inen bir PC anında ölür. 2024 sayfası 0’da durur, bu yüzden bu yalnızca çubuğa 0’ın altında bir değer yazıldığında çalışır.',
        ],
      },
      healthColors: {
        heading: 'HealthColors ve diğer Mod’lar',
        points: [
          'Ayarlar’daki Kim neyi yönetir bölümü, ölüm kurtarma atışlarını (ölmekte, stabil ve ölü işaretçileriyle birlikte), sağlık renklerini ve hasar/iyileşme efektlerini hangi Mod’un yöneteceğini seçer: DeathTracker, HealthColors veya Kapalı. HealthColors 2.5 ve sonrası aynı seçimi gösterir; iki Mod’dan birinde değiştirmek ikisinde de değiştirir.',
          'Başlangıçta ölüm kurtarma atışlarını DeathTracker, renkleri ve efektleri HealthColors yönetir. HealthColors yoksa üçünü de DeathTracker yönetir.',
          '2.5’ten önceki HealthColors bu seçimi paylaşmaz: onun ölüm kurtarma atışlarını !aura deathsaves off ile kapatın.',
          'TokenMod’un yaptığı değişiklikler görülür. Diğer Mod’lar can puanlarını değiştirdikten sonra DeathTracker.check(token) çağırabilir.',
          'DeathTracker yalnızca kendi koyduğu işaretçileri kaldırır.',
        ],
      },
      commands: {
        heading: 'Komutlar',
        intro:
          'Her komut !deathtracker ile başlar (veya !dt ya da sürüm 0.1’den kalma !dead). Ölüm kurtarma atışı makrosu dışında yalnızca GM içindir.',
        colCommand: 'Komut',
        colDesc: 'Ne yapar',
      },
      settings: {
        heading: 'Ayarlar',
        intro:
          'Bunları menüden, !deathtracker set <setting> <value> ile veya Mod Kütüphanesi seçeneklerinden değiştirin.',
        colKey: 'Ayar',
        colDesc: 'Ne yapar',
        rows: {
          deathSavesBy:
            'Ölüm kurtarma atışlarını kimin izleyip ölmekte, stabil ve ölü işaretçilerini koyacağı: DeathTracker, HealthColors veya kapalı. HealthColors ile ortaktır.',
          coloursBy:
            'Jetonları can puanına göre kimin renklendireceği: DeathTracker (kendi renklendirmesi), HealthColors veya kapalı. HealthColors ile ortaktır.',
          effectsBy:
            'Hasar ve iyileşme efektlerini kimin oynatacağı: DeathTracker, HealthColors veya kapalı. HealthColors ile ortaktır.',
          language: 'Menülerin, mesajların ve belgelerin dili.',
          hpBar: 'Can puanlarını tutan çubuk (1, 2 veya 3).',
          bloodiedPercent:
            'Maksimum can puanının bu yüzdesinde veya altında Kanlı (0, Kanlı’yı kapatır).',
          bloodiedMarker: 'Kanlı için işaretçi (işaretçi olmaması için none).',
          dyingMarker: 'Ölmekte olan bir PC için işaretçi.',
          stableMarker: 'Stabil bir PC için işaretçi.',
          deadMarker: 'Ölüler için işaretçi.',
          pcDetection:
            'auto: oyuncu kontrolünde veya sayfa PC diyor; players: yalnızca oyuncu kontrolünde.',
          deathSaves: '0 can puanındaki PC’ler için ölüm kurtarma atışlarını izler.',
          resetSheetSaves:
            'Bir PC 0’a düştüğünde ve iyileştiğinde sayfanın ölüm kurtarma atışı kutularını temizler ve bunları D&D 2024 sayfasında gösterir.',
          successFields: 'Başarılar için işaretlenen sayfa alanları (2014 ve diğer sayfalar).',
          failureFields: 'Başarısızlıklar için işaretlenen sayfa alanları.',
          massiveDamage: 'Çubuğu en az maksimumu kadar 0’ın altına inen bir PC anında ölür.',
          announce:
            'Bir PC düştüğünde, stabil olduğunda, öldüğünde veya ayağa kalktığında kime bildirilir: off, gm veya controllers.',
          deathLayer: 'Ölülerin taşınacağı yer: none, gmlayer veya map.',
          deathTurnOrder: 'Ölüleri tur sırasında keep (tut) veya remove (çıkar).',
          deathActionsFor: 'npc: taşıma ve tur sırası NPC’lere uygulanır; all: PC’lere de.',
          tintPlayers: 'PC’leri can puanı kaybettikçe yeşilden kırmızıya renklendirir.',
          tintNpcs: 'NPC’leri de aynı şekilde renklendirir.',
          hurtFx: 'Bir jeton can puanı kaybettiğinde efekt oynatır.',
          hurtFxType: 'O efekt, tür-renk olarak (splatter-blood).',
          healFx: 'Bir jeton can puanı kazandığında efekt oynatır.',
          healFxType: 'O efekt (glow-holy).',
        },
      },
      api: {
        heading: 'Mod yazarları için',
        intro: 'DeathTracker bir DeathTracker nesnesi yayımlar.',
        colFunction: 'Fonksiyon',
        colDesc: 'Ne yapar',
        rows: {
          check:
            'Bir jetonu şimdi değerlendirir (bir Mod’dan can puanlarını değiştirdikten sonra).',
          getStatus: 'Bir jetonun durumu: healthy, bloodied, dying, stable, dead veya null.',
          onStatusChange:
            'Bir durum değiştiğinde bildirim alırsınız ({token, status, previous, isPc}).',
          observe:
            'Sürüm 0.1: DeathTracker bir can puanı değişikliğini işledikten sonra (token, prev) bildirimi alırsınız.',
          managing:
            'DeathTracker ölüm kurtarma atışlarını izliyorsa true: atışlar açıktır ve onları yönetmek için DeathTracker seçilmiştir (HealthColors bunu kullanır).',
          ownersChanged:
            'Neyi kimin yöneteceği değiştikten sonra jetonları günceller (HealthColors bunu çağırır).',
        },
      },
      upgrading: {
        heading: '0.1’den yükseltme',
        points: [
          'İşaretçi, çubuk, renklendirme ve efekt ayarlarınız aktarılır.',
          '!dead hâlâ çalışır; !dead config ve !dead reset de öyle.',
          'PC’ler için Bilinçsiz işaretçisi artık Ölmekte işaretçisidir.',
          'Çubuğu değiştirmek artık yeniden başlatma gerektirmez.',
        ],
      },
      troubleshooting: {
        heading: 'Sorun giderme',
        points: [
          'Hiçbir şey olmuyor: Ayarlar’daki can puanı çubuğunu ve çubuğun bir sayı içerdiğini kontrol edin.',
          'Bir PC, NPC gibi davranılıyor: onu seçip PC yap’a basın ya da karakteri bir oyuncunun kontrol etmesini sağlayın.',
          'Bir işaretçi görünmüyor: !deathtracker markers kullanın ve listeden bir ad seçin.',
          'Başka bir Mod’un değiştirdiği can puanları görülmüyor: o Mod DeathTracker.check(token) çağırmalıdır.',
        ],
      },
      languages: {
        heading: 'Diller',
        body: 'Dili !deathtracker set language <code> ile ayarlayın.',
        colLanguage: 'Dil',
        colNative: 'Yerel adı',
        colCode: 'Kod',
      },
      credits: {
        heading: 'Emeği geçenler',
        original: 'Yazan',
        maintainer: 'Sürüm 1.0 için yeniden yazan',
        support:
          'Bir sorun mu buldunuz ya da bir fikriniz mi var? Roll20’de MidNiteShadow7 ile iletişime geçin.',
      },
    },
    errors: {
      gmOnly: 'Bu DeathTracker komutunu yalnızca GM kullanabilir.',
      unknownCommand: 'DeathTracker’ın “{command}” adında bir komutu yok.',
      noTokens: 'Önce bir veya daha fazla jeton seçin (ya da --ids ekleyin).',
      notYourToken: 'O jetonu siz kontrol etmiyorsunuz.',
      hint: 'Komut listesi için !deathtracker help yazın.',
    },
  };

  var localeUk = {
    titles: {
      ready: 'DeathTracker готовий.',
      menu: 'DeathTracker',
      status: 'Стан DeathTracker',
      settings: 'Налаштування DeathTracker',
      help: 'Команди DeathTracker',
      announce: 'DeathTracker',
      markers: 'Маркери жетонів',
    },
    messages: {
      readyHint: 'Введіть !deathtracker, щоб відкрити меню.',
      migrated:
        'Ваші налаштування DeathTracker 0.1 перенесено. !dead і далі працює; нова команда — !deathtracker.',
      healthColors:
        'Встановлено HealthColors: DeathTracker веде рятівні кидки від смерті та маркери «При смерті», «Стабільний» і «Мертвий», а HealthColors — кольори здоров’я та ефекти поранення й лікування. Хто чим займається, можна змінити в налаштуваннях.',
      healthColorsSaves:
        'HealthColors теж відстежує рятівні кидки від смерті та ставить маркери вмираючих. Вимкніть один із них (!aura deathsaves off), щоб вони не змагалися за маркери.',
      settingChanged: '{setting} тепер {value}.',
      settingRejected: '«{value}» — неприпустиме значення для {setting}.',
      unknownSetting: 'Налаштування «{setting}» немає.',
      markerUnknown:
        'У цій грі немає маркера «{marker}», тому його не буде видно. Введіть !deathtracker markers, щоб побачити доступні назви.',
      checked: 'Перевірено жетонів: {count}.',
      cleared: 'Маркери DeathTracker знято з жетонів: {count}.',
      restored: 'Повернуто жетонів: {count}.',
      nothingToRestore: 'Жоден із цих жетонів не було переміщено DeathTracker.',
      roleSet: '{names}: {role}.',
      stabilised: 'Стабілізовано: {count}.',
      notDown: 'Жоден із цих жетонів не є ПГ із 0 хітів.',
      synced: '{name}: успіхів {s}, провалів {f}.',
      macroCreated:
        'Створено дію жетона «{macro}». Гравець вибирає свій жетон і натискає її після рятівного кидка від смерті.',
      journalRebuilt: 'Роздаткові матеріали «{help}» і «{deck}» створено заново.',
      resetDone: 'Налаштування повернуто до типових.',
      restartNotNeeded: 'Перезапуск не потрібен: нова смуга використовується вже зараз.',
    },
    status: {
      healthy: 'Здоровий',
      bloodied: 'Закривавлений',
      dying: 'При смерті',
      stable: 'Стабільний',
      dead: 'Мертвий',
      none: 'Не відстежується',
      pc: 'ПГ',
      npc: 'НІП',
      hp: 'Хіти {hp}/{max}',
      hpNoMax: 'Хіти {hp}',
      saves: 'Рятівні кидки від смерті: успіхів {s}, провалів {f}',
      unnamed: 'Жетон',
      noneHere: 'На цій сторінці ще немає жетонів із хітами.',
      page: 'Сторінка: {page}',
      selected: 'Вибрані жетони',
      actions: 'Переміщено після смерті',
    },
    announce: {
      dying: '{name} падає і вмирає.',
      stable: '{name} стабілізовано.',
      dead: '{name} гине.',
      up: '{name} знову на ногах.',
      savesHint: 'Рятівні кидки від смерті, позначені в аркуші, враховуються одразу.',
    },
    menu: {
      summary: 'На цій сторінці',
      down: 'Повалені ПГ',
      noneDown: 'Повалених ПГ немає.',
      tools: 'Інструменти',
      sandbox: 'Пісочниця Модів: {version}',
      sandboxUnknown: 'невідомо',
      hcNote: 'Встановлено HealthColors.',
    },
    buttons: {
      menu: 'Меню',
      status: 'Стан',
      checkPage: 'Перевірити сторінку',
      check: 'Перевірити вибрані',
      settings: 'Налаштування',
      help: 'Довідка',
      stable: 'Стабілізувати',
      restore: 'Повернути',
      clear: 'Зняти маркери',
      pc: 'Зробити ПГ',
      npc: 'Зробити НІП',
      auto: 'Визначати автоматично',
      markers: 'Маркери',
      macro: 'Створити макрос рятівного кидка від смерті',
      rebuild: 'Створити роздаткові матеріали заново',
      reset: 'Скинути налаштування',
      on: 'Увімк.',
      off: 'Вимк.',
      back: 'Назад',
    },
    prompts: {
      marker: 'Маркер',
      percent: 'Закривавлений на цьому значенні або нижче (% від максимуму)',
      fields: 'Назви полів через кому',
      fx: 'Ефект (тип-колір)',
      language: 'Мова',
    },
    sections: {
      owners: 'Хто чим займається',
      hp: 'Хіти',
      markers: 'Маркери',
      deathSaves: 'Рятівні кидки від смерті (ПГ)',
      onDeath: 'Коли жетон гине',
      looks: 'Забарвлення та ефекти',
      general: 'Загальні',
    },
    settings: {
      deathSavesBy: 'Рятівні кидки й маркери 0 хітів',
      coloursBy: 'Кольори здоров’я',
      effectsBy: 'Ефекти поранення й лікування',
      language: 'Мова',
      hpBar: 'Смуга хітів',
      bloodiedPercent: 'Закривавлений на',
      bloodiedMarker: 'Маркер «Закривавлений»',
      dyingMarker: 'Маркер «При смерті»',
      stableMarker: 'Маркер «Стабільний»',
      deadMarker: 'Маркер «Мертвий»',
      pcDetection: 'Хто вважається ПГ',
      deathSaves: 'Відстежувати рятівні кидки від смерті',
      resetSheetSaves: 'Очищати клітинки аркуша',
      successFields: 'Поля успіхів',
      failureFields: 'Поля провалів',
      massiveDamage: 'Величезна шкода',
      announce: 'Оголошувати',
      deathLayer: 'Переміщати мертвих на',
      deathTurnOrder: 'Порядок ходів',
      deathActionsFor: 'Застосовується до',
      tintPlayers: 'Забарвлювати ПГ',
      tintNpcs: 'Забарвлювати НІП',
      hurtFx: 'Ефект поранення',
      hurtFxType: 'Тип ефекту поранення',
      healFx: 'Ефект лікування',
      healFxType: 'Тип ефекту лікування',
    },
    choices: {
      hpBar: { 1: 'Смуга 1', 2: 'Смуга 2', 3: 'Смуга 3' },
      pcDetection: { auto: 'Гравці або аркуш', players: 'Під керуванням гравця' },
      deathLayer: { none: 'Залишити на місці', gmlayer: 'Шар Майстра', map: 'Шар мапи' },
      deathTurnOrder: { keep: 'Залишити', remove: 'Прибрати' },
      deathActionsFor: { npc: 'НІП', all: 'НІП і ПГ' },
      announce: { off: 'Вимк.', gm: 'Майстру', controllers: 'Майстру та гравцям' },
      none: 'Немає',
      notInstalled: 'не встановлено',
    },
    help: {
      menu: 'Відкрити меню.',
      status: 'Показати стан вибраних жетонів або всіх відстежуваних жетонів на вашій сторінці.',
      check: 'Знову оцінити вибрані жетони (all: усі жетони на вашій сторінці).',
      stable: 'Позначити вибраних ПГ із 0 хітів як стабілізованих.',
      clear: 'Зняти маркери та забарвлення DeathTracker із вибраних жетонів і забути їх.',
      restore: 'Повернути мертві жетони, переміщені DeathTracker, на їхній шар і в порядок ходів.',
      role: 'Вважати персонажів вибраних жетонів ПГ або НІП чи довірити рішення DeathTracker.',
      markers: 'Показати маркери цієї гри з назвами для використання.',
      macro:
        'Створити дію жетона, яку гравці натискають, щоб надіслати рятівні кидки від смерті (для аркушів, які DeathTracker не може прочитати).',
      dsync: 'Надсилається макросом рятівного кидка від смерті.',
      settings: 'Відкрити налаштування.',
      set: 'Змінити налаштування.',
      reset: 'Повернути всі налаштування до типових.',
      config: 'Команди версії 0.1: відкрити налаштування або змінити одне (config bar|2).',
      journal: 'Створити заново роздаткові матеріали «Help» і «Command Deck».',
      help: 'Показати цей список.',
      ids: 'Додайте --ids id1,id2, щоб працювати з жетонами за ID замість вибраних.',
    },
    deck: {
      menuTitle: 'Меню',
      menuDesc: 'Меню, стан, налаштування та довідка.',
      selectedTitle: 'Вибрані жетони',
      selectedDesc: 'Виберіть жетони на мапі, потім натисніть кнопку.',
      roleTitle: 'ПГ або НІП',
      roleDesc: 'Для персонажів вибраних жетонів.',
      toolsTitle: 'Інструменти',
      toolsDesc: 'Маркери, макрос рятівного кидка від смерті та ці роздаткові матеріали.',
      footer: 'Повний посібник — у роздатковому матеріалі «{help}».',
    },
    handout: {
      versionLabel: 'Версія',
      subtitle:
        'Закривавлений, при смерті, стабільний і мертвий — за хітами та рятівними кидками від смерті',
      footer: 'Кнопки для всіх команд — у «{deck}».',
      overview: {
        heading: 'Огляд',
        body: 'DeathTracker стежить за смугою хітів кожного жетона. Він позначає закривавлені та мертві жетони, відстежує рятівні кидки від смерті персонажів гравців із 0 хітів і може прибирати мертвих із мапи та з порядку ходів.',
      },
      quickStart: {
        heading: 'Швидкий старт',
        steps: [
          'Вкажіть хіти в смузі 1 (або виберіть іншу смугу в налаштуваннях).',
          'Завдайте жетону шкоди: на половині максимуму він отримує маркер «Закривавлений»; на 0 НІП отримує маркер «Мертвий».',
          'ПГ на 0 отримує маркер «При смерті». Позначайте рятівні кидки від смерті в аркуші: три успіхи роблять його стабільним, три провали — мертвим.',
          'Вилікуйте його вище 0, і маркери зникнуть.',
          'Введіть !deathtracker, щоб відкрити меню.',
        ],
      },
      statuses: {
        heading: 'Стани',
        points: [
          'Здоровий: вище порогу «Закривавлений» від максимуму хітів (без маркера).',
          'Закривавлений: на порозі або нижче (50%, якщо не змінено).',
          'При смерті: ПГ із 0 хітів, який робить рятівні кидки від смерті.',
          'Стабільний: ПГ із 0 хітів і трьома успіхами або стабілізований командою stable.',
          'Мертвий: НІП із 0 хітів, ПГ із трьома провалами або ПГ, убитий величезною шкодою.',
          'Порожня смуга або смуга без числа ніколи не вважається за 0.',
        ],
      },
      deathSaves: {
        heading: 'Рятівні кидки від смерті',
        points: [
          'Аркуш D&D 2024: зчитується з аркуша, коли позначаються клітинки або кидаються рятівні кидки.',
          'Аркуш D&D 2014 та інші з прапорцями: зчитується з полів успіхів і провалів, заданих у налаштуваннях.',
          'Аркуш зберігає старі позначки після лікування, тому рятівні кидки рахуються з моменту, коли ПГ падає до 0. Коли ввімкнено «Очищати клітинки аркуша», DeathTracker очищає клітинки аркуша, коли ПГ падає до 0 і коли його лікують, і показує клітинки рятівних кидків від смерті аркуша D&D 2024, коли ПГ падає до 0 через смугу жетона.',
          'Якщо аркуш не зчитується, створіть макрос рятівного кидка від смерті (!deathtracker macro): гравці вибирають свій жетон і натискають його після кожного кидка.',
          'Хто вважається ПГ: жетон або персонаж під керуванням гравця, або (Гравці або аркуш) той, чий аркуш каже, що це не НІП. Використовуйте «Зробити ПГ» / «Зробити НІП», щоб вирішити за персонажа.',
        ],
      },
      onDeath: {
        heading: 'Коли жетон гине',
        points: [
          'Переміщати мертвих на шар Майстра або шар мапи та прибирати їх із порядку ходів. Спочатку обидва вимкнено.',
          'Застосовується лише до НІП, якщо не вибрано «НІП і ПГ».',
          'Лікування мертвого жетона знімає його маркери, але не повертає його назад. Виберіть його й натисніть «Повернути» (він повернеться в порядок ходів зі своєю ініціативою).',
          'Величезна шкода (спочатку вимкнено): ПГ, чия смуга опускається нижче 0 щонайменше на його максимум, гине одразу. Аркуш 2024 зупиняється на 0, тому це працює, лише коли в смугу вписано значення нижче 0.',
        ],
      },
      healthColors: {
        heading: 'HealthColors та інші Моди',
        points: [
          '«Хто чим займається» в налаштуваннях визначає, який Мод веде рятівні кидки від смерті (з маркерами «При смерті», «Стабільний» і «Мертвий»), кольори здоров’я та ефекти поранення й лікування: DeathTracker, HealthColors або «Вимк.». HealthColors 2.5 і новіші показують той самий вибір, і зміна в будь-якому з Модів змінює його для обох.',
          'Спочатку DeathTracker веде рятівні кидки від смерті, а HealthColors — кольори та ефекти. Без HealthColors DeathTracker займається всіма трьома.',
          'HealthColors до версії 2.5 не поділяє цей вибір: вимкніть у ньому рятівні кидки від смерті командою !aura deathsaves off.',
          'Зміни, зроблені TokenMod, видно. Інші Моди можуть викликати DeathTracker.check(token) після зміни хітів.',
          'DeathTracker знімає лише ті маркери, які поставив сам.',
        ],
      },
      commands: {
        heading: 'Команди',
        intro:
          'Кожна команда починається з !deathtracker (або !dt, або !dead із версії 0.1). Лише для Майстра, крім макросу рятівного кидка від смерті.',
        colCommand: 'Команда',
        colDesc: 'Що робить',
      },
      settings: {
        heading: 'Налаштування',
        intro:
          'Змінюйте їх у меню, командою !deathtracker set <setting> <value> або в параметрах бібліотеки Модів.',
        colKey: 'Налаштування',
        colDesc: 'Що робить',
        rows: {
          deathSavesBy:
            'Хто відстежує рятівні кидки від смерті й ставить маркери «При смерті», «Стабільний» і «Мертвий»: DeathTracker, HealthColors або ніхто. Спільна з HealthColors.',
          coloursBy:
            'Хто забарвлює жетони за хітами: DeathTracker (своїм забарвленням), HealthColors або ніхто. Спільна з HealthColors.',
          effectsBy:
            'Хто показує ефекти поранення й лікування: DeathTracker, HealthColors або ніхто. Спільна з HealthColors.',
          language: 'Мова меню, повідомлень і роздаткових матеріалів.',
          hpBar: 'Смуга, у якій зберігаються хіти (1, 2 або 3).',
          bloodiedPercent:
            'Закривавлений на цьому відсотку від максимуму хітів або нижче (0 вимикає «Закривавлений»).',
          bloodiedMarker: 'Маркер для «Закривавлений» (none — без маркера).',
          dyingMarker: 'Маркер для ПГ при смерті.',
          stableMarker: 'Маркер для стабільного ПГ.',
          deadMarker: 'Маркер для мертвих.',
          pcDetection:
            'auto: під керуванням гравця або аркуш вказує ПГ; players: лише під керуванням гравця.',
          deathSaves: 'Відстежувати рятівні кидки від смерті для ПГ із 0 хітів.',
          resetSheetSaves:
            'Очищати клітинки рятівних кидків від смерті в аркуші, коли ПГ падає до 0 і коли його лікують, і показувати їх в аркуші D&D 2024.',
          successFields: 'Поля аркуша, що позначаються при успіхах (аркуші 2014 та інші).',
          failureFields: 'Поля аркуша, що позначаються при провалах.',
          massiveDamage:
            'ПГ, чия смуга опускається нижче 0 щонайменше на його максимум, гине одразу.',
          announce:
            'Кому повідомляти, коли ПГ падає, стабілізується, гине або встає: off, gm або controllers.',
          deathLayer: 'Куди переміщати мертвих: none, gmlayer або map.',
          deathTurnOrder: 'keep (залишити) або remove (прибрати) мертвих у порядку ходів.',
          deathActionsFor: 'npc: переміщення та порядок ходів стосуються НІП; all: також ПГ.',
          tintPlayers: 'Забарвлювати ПГ від зеленого до червоного, коли вони втрачають хіти.',
          tintNpcs: 'Так само забарвлювати НІП.',
          hurtFx: 'Показувати ефект, коли жетон втрачає хіти.',
          hurtFxType: 'Цей ефект у вигляді тип-колір (splatter-blood).',
          healFx: 'Показувати ефект, коли жетон отримує хіти.',
          healFxType: 'Цей ефект (glow-holy).',
        },
      },
      api: {
        heading: 'Для авторів Модів',
        intro: 'DeathTracker публікує об’єкт DeathTracker.',
        colFunction: 'Функція',
        colDesc: 'Що робить',
        rows: {
          check: 'Оцінити жетон зараз (після зміни його хітів із Мода).',
          getStatus: 'Стан жетона: healthy, bloodied, dying, stable, dead або null.',
          onStatusChange:
            'Отримувати сповіщення про зміну стану ({token, status, previous, isPc}).',
          observe:
            'Версія 0.1: отримувати (token, prev) після того, як DeathTracker обробить зміну хітів.',
          managing:
            'True, коли DeathTracker відстежує рятівні кидки від смерті: їх увімкнено, і вести їх обрано DeathTracker (це використовує HealthColors).',
          ownersChanged:
            'Оновити жетони після того, як змінилося, хто чим займається (це викликає HealthColors).',
        },
      },
      upgrading: {
        heading: 'Перехід із 0.1',
        points: [
          'Ваші налаштування маркерів, смуги, забарвлення та ефектів перенесено.',
          '!dead і далі працює, як і !dead config та !dead reset.',
          'Маркер «Непритомний» для ПГ тепер став маркером «При смерті».',
          'Зміна смуги більше не потребує перезапуску.',
        ],
      },
      troubleshooting: {
        heading: 'Розв’язання проблем',
        points: [
          'Нічого не відбувається: перевірте смугу хітів у налаштуваннях і те, що в смузі записано число.',
          'ПГ вважається НІП: виберіть його й натисніть «Зробити ПГ» або дайте гравцеві керувати персонажем.',
          'Маркер не видно: введіть !deathtracker markers і виберіть назву зі списку.',
          'Зміни хітів іншим Модом не видно: цей Мод має викликати DeathTracker.check(token).',
        ],
      },
      languages: {
        heading: 'Мови',
        body: 'Виберіть мову командою !deathtracker set language <code>.',
        colLanguage: 'Мова',
        colNative: 'Власна назва',
        colCode: 'Код',
      },
      credits: {
        heading: 'Автори',
        original: 'Автор',
        maintainer: 'Переписав для версії 1.0',
        support: 'Знайшли проблему або маєте ідею? Напишіть MidNiteShadow7 на Roll20.',
      },
    },
    errors: {
      gmOnly: 'Цю команду DeathTracker може використовувати лише Майстер.',
      unknownCommand: 'DeathTracker не має команди «{command}».',
      noTokens: 'Спершу виберіть один або кілька жетонів (або додайте --ids).',
      notYourToken: 'Ви не керуєте цим жетоном.',
      hint: 'Введіть !deathtracker help, щоб побачити список команд.',
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

  // Status markers: the game's marker list, finding a marker by name or tag, and
  // changing a token's markers without touching ones DeathTracker did not add.

  /**
   * @typedef {object} MarkerInfo
   * @property {string} tag What goes in statusmarkers (custom markers look like Name::1234).
   * @property {string} name Name shown to people.
   */

  /**
   * Lists every marker in the game: libTokenMarkers' list when it is installed,
   * otherwise the campaign's token_markers plus the coloured dots.
   *
   * @returns {MarkerInfo[]} Markers.
   */
  function listMarkers() {
    const seen = new Map();
    const add = (tag, name) => {
      const t = toText(tag);
      if (t && !seen.has(t)) {
        seen.set(t, { tag: t, name: toText(name) || t });
      }
    };
    try {
      if (
        typeof libTokenMarkers !== 'undefined' &&
        typeof libTokenMarkers.getOrderedList === 'function'
      ) {
        for (const m of libTokenMarkers.getOrderedList()) {
          add(m.tag, m.name);
        }
      }
    } catch {
      // Fall back to the campaign's own list.
    }
    if (!seen.size) {
      for (const tag of COLOUR_MARKERS) {
        add(tag, tag);
      }
      let custom = [];
      try {
        custom = JSON.parse(Campaign().get('token_markers') || '[]');
      } catch {
        custom = [];
      }
      for (const m of Array.isArray(custom) ? custom : []) {
        add(m?.tag, m?.name);
      }
      for (const tag of BUILTIN_MARKERS) {
        add(tag, tag);
      }
    }
    return [...seen.values()];
  }

  /**
   * Finds a marker by tag or name. Tags are matched exactly first, then without
   * regard to case; names without regard to case. A leading "status_" is ignored.
   *
   * @param {*} raw What the GM typed.
   * @param {MarkerInfo[]} [markers] Marker list (read from the game when omitted).
   * @returns {{tag: string, known: boolean}|null} The tag ('' for none), whether the game has it; null when nothing was typed.
   */
  function resolveMarker(raw, markers = listMarkers()) {
    const text = toText(raw).replace(/^status_/, '');
    if (!text) {
      return null;
    }
    if (['none', 'off', '-'].includes(text.toLowerCase())) {
      return { tag: '', known: true };
    }
    const lower = text.toLowerCase();
    const hit =
      markers.find((m) => m.tag === text) ||
      markers.find((m) => m.tag.toLowerCase() === lower) ||
      markers.find((m) => m.name.toLowerCase() === lower) ||
      markers.find((m) => m.tag.split('::')[0].toLowerCase() === lower);
    return hit ? { tag: hit.tag, known: true } : { tag: text, known: false };
  }

  /**
   * Returns the name of a marker for menus.
   *
   * @param {string} tag Marker tag.
   * @param {MarkerInfo[]} [markers] Marker list.
   * @returns {string} Name, or the tag when the game has no such marker.
   */
  function markerName(tag, markers = listMarkers()) {
    if (!tag) {
      return '';
    }
    return markers.find((m) => m.tag === tag)?.name || tag;
  }

  /**
   * Splits a token's statusmarkers into entries (tag with any @badge).
   *
   * @param {object} token Roll20 graphic.
   * @returns {string[]} Entries.
   */
  function markerEntries(token) {
    return toText(token.get('statusmarkers'))
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);
  }

  /**
   * Works out a token's new statusmarkers.
   *
   * @param {string[]} entries Current entries.
   * @param {string[]} add Tags to show.
   * @param {string[]} remove Tags to take away.
   * @returns {string[]} New entries.
   */
  function editEntries(entries, add, remove) {
    const out = entries.filter((m) => !remove.includes(m.split('@')[0]));
    for (const tag of add) {
      if (tag && !out.some((m) => m.split('@')[0] === tag)) {
        out.push(tag);
      }
    }
    return out;
  }

  /**
   * Shows the wanted markers and takes away the ones DeathTracker added before
   * that are no longer wanted. Markers the GM or other Mods put on are left.
   *
   * @param {object} token Roll20 graphic.
   * @param {string[]} owned Tags DeathTracker added earlier.
   * @param {string[]} wanted Tags that should show now.
   * @returns {string[]} Tags DeathTracker owns afterwards.
   */
  function applyMarkers(token, owned, wanted) {
    const entries = markerEntries(token);
    const want = wanted.filter(Boolean);
    const remove = owned.filter((tag) => !want.includes(tag));
    const add = want.filter((tag) => !entries.some((m) => m.split('@')[0] === tag));
    const next = editEntries(entries, add, remove);
    if (next.join(',') !== entries.join(',')) {
      token.set('statusmarkers', next.join(','));
    }
    // Only what DeathTracker put there itself is its to take away later.
    return [...new Set([...owned.filter((tag) => want.includes(tag)), ...add])];
  }

  // Persistent state: state.DeathTracker. Settings, one small record per token
  // DeathTracker has judged, PC/NPC choices per character and one-time notices.

  /**
   * @typedef {object} TokenRecord
   * @property {string|null} status Last status DeathTracker gave the token.
   * @property {number|null} hp Hit points when last judged.
   * @property {{s: number, f: number}|null} base Sheet death-save counts when the token dropped to 0.
   * @property {{s: number, f: number}|null} saves Death saves counted since then.
   * @property {string[]} markers Marker tags DeathTracker added (only these are ever removed).
   * @property {string|null} tint The token's own tint, kept while DeathTracker tints it.
   * @property {object|null} actions What was done when it died, so `restore` can undo it.
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
      tokens: {},
      // GM choices of PC or NPC, by character ID (or token ID for tokens with no character).
      roles: {},
      notices: { useroptions: {}, healthColors: false, migrated: false },
    };
  }

  /**
   * Cleans one stored token record.
   *
   * @param {*} raw Stored record.
   * @returns {TokenRecord} Clean record.
   */
  function cleanRecord(raw) {
    const r = isRecord(raw) ? raw : {};
    const counts = (c) =>
      isRecord(c)
        ? {
            s: clamp(Math.round(toNumber(c.s) ?? 0), 0, 99),
            f: clamp(Math.round(toNumber(c.f) ?? 0), 0, 99),
          }
        : null;
    return {
      status: STATUS_LIST.includes(r.status) ? r.status : null,
      hp: toNumber(r.hp),
      base: counts(r.base),
      saves: counts(r.saves),
      markers: Array.isArray(r.markers) ? r.markers.map(toText).filter(Boolean) : [],
      tint: typeof r.tint === 'string' ? r.tint : null,
      actions: isRecord(r.actions) ? r.actions : null,
    };
  }

  /**
   * Carries 0.1.x settings (state.DEATHTRACKER.config) over to 1.0 names.
   *
   * @param {*} legacy The old state branch.
   * @returns {object} Settings found, by 1.0 name.
   */
  function readLegacySettings(legacy) {
    const c = isRecord(legacy) && isRecord(legacy.config) ? legacy.config : null;
    if (!c) {
      return {};
    }
    const out = {};
    const marker = (v) => {
      const s = toText(v);
      return s === '' ? null : s;
    };
    if (marker(c.death_statusmarker)) {
      out.deadMarker = marker(c.death_statusmarker);
    }
    if (marker(c.half_statusmarker)) {
      out.bloodiedMarker = marker(c.half_statusmarker);
    }
    if (marker(c.pc_unconscious_statusmarker)) {
      out.dyingMarker = marker(c.pc_unconscious_statusmarker);
    }
    const bar = toNumber(c.bar);
    if (SETTING_CHOICES.hpBar.includes(bar)) {
      out.hpBar = bar;
    }
    for (const [from, to] of [
      ['change_player_tint', 'tintPlayers'],
      ['change_npc_tint', 'tintNpcs'],
      ['fx', 'hurtFx'],
      ['heal_fx', 'healFx'],
    ]) {
      const b = parseBoolean(c[from]);
      if (b !== null) {
        out[to] = b;
      }
    }
    if (isFxName(c.fx_type)) {
      out.hurtFxType = toText(c.fx_type).toLowerCase();
    }
    if (isFxName(c.heal_fx_type)) {
      out.healFxType = toText(c.heal_fx_type).toLowerCase();
    }
    const command = toText(c.command).replace(/^!/, '').toLowerCase();
    if (command && !/\s/.test(command)) {
      out.legacyCommand = command;
    }
    return out;
  }

  /**
   * Returns true for a built-in effect name such as "splatter-blood".
   *
   * @param {*} raw Effect name.
   * @returns {boolean} True when Roll20 knows the effect.
   */
  function isFxName(raw) {
    const [type, colour, extra] = toText(raw).toLowerCase().split('-');
    return FX_TYPES.includes(type) && FX_COLOURS.includes(colour) && extra === undefined;
  }

  /**
   * Cleans a stored state, filling in anything missing.
   *
   * @param {*} raw Stored state.
   * @param {*} [legacy] The 0.1.x state branch, read when there is no 1.0 state yet.
   * @returns {{state: object, fresh: boolean, migrated: boolean}} Clean state, whether it is new, and whether 0.1.x settings were carried over.
   */
  function migrateState(raw, legacy) {
    const base = createDefaultState();
    if (!isRecord(raw)) {
      const old = readLegacySettings(legacy);
      const migrated = Object.keys(old).length > 0;
      const { legacyCommand, ...settings } = old;
      base.settings = { ...base.settings, ...settings };
      if (legacyCommand) {
        base.legacyCommand = legacyCommand;
      }
      base.notices.migrated = migrated;
      return { state: base, fresh: !migrated, migrated };
    }
    const clean = {
      ...base,
      ...raw,
      schemaVersion: SCHEMA_VERSION,
      settings: { ...base.settings, ...(isRecord(raw.settings) ? raw.settings : {}) },
      tokens: {},
      roles: {},
      notices: { ...base.notices, ...(isRecord(raw.notices) ? raw.notices : {}) },
    };
    for (const [id, rec] of Object.entries(isRecord(raw.tokens) ? raw.tokens : {})) {
      clean.tokens[id] = cleanRecord(rec);
    }
    for (const [id, role] of Object.entries(isRecord(raw.roles) ? raw.roles : {})) {
      if (role === 'pc' || role === 'npc') {
        clean.roles[id] = role;
      }
    }
    // Anything a hand edit broke goes back to its default.
    for (const key of Object.keys(DEFAULT_SETTINGS)) {
      if (!checkSetting(key, clean.settings[key]).ok) {
        clean.settings[key] = DEFAULT_SETTINGS[key];
      }
    }
    for (const key of Object.keys(clean.settings)) {
      if (!(key in DEFAULT_SETTINGS)) {
        delete clean.settings[key];
      }
    }
    return { state: clean, fresh: false, migrated: false };
  }

  /**
   * Loads and cleans state.DeathTracker.
   *
   * @returns {{fresh: boolean, migrated: boolean}} Whether this is a new install, and whether 0.1.x settings were carried over.
   */
  function initialiseState() {
    const {
      state: clean,
      fresh,
      migrated,
    } = migrateState(state[STATE_KEY], state[LEGACY_STATE_KEY]);
    clean.version = SCRIPT_VERSION;
    state[STATE_KEY] = clean;
    return { fresh, migrated };
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
   * Checks and cleans a setting value.
   *
   * @param {string} key Setting name.
   * @param {*} value Proposed value.
   * @returns {{ok: boolean, value?: *}} The clean value when accepted.
   */
  function checkSetting(key, value) {
    if (!(key in DEFAULT_SETTINGS)) {
      return { ok: false };
    }
    if (key === 'language') {
      return { ok: true, value: getLocale(value) };
    }
    if (BOOLEAN_SETTINGS.includes(key)) {
      const b = parseBoolean(value);
      return b === null ? { ok: false } : { ok: true, value: b };
    }
    if (key === 'hpBar') {
      const n = toNumber(toText(value).replace(/^bar/i, ''));
      return SETTING_CHOICES.hpBar.includes(n) ? { ok: true, value: n } : { ok: false };
    }
    if (key === 'bloodiedPercent') {
      const n = toNumber(toText(value).replace(/%$/, ''));
      return n === null || n < 0 || n >= 100 ? { ok: false } : { ok: true, value: Math.round(n) };
    }
    if (key in SETTING_CHOICES) {
      const v = toText(value).toLowerCase();
      return SETTING_CHOICES[key].includes(v) ? { ok: true, value: v } : { ok: false };
    }
    if (MARKER_SETTINGS.includes(key)) {
      // Markers are checked against the game's list by the caller; here only
      // the shape is checked. An empty value means "no marker".
      const v = toText(value);
      return /[,\s]/.test(v) ? { ok: false } : { ok: true, value: v };
    }
    if (key === 'hurtFxType' || key === 'healFxType') {
      return isFxName(value) ? { ok: true, value: toText(value).toLowerCase() } : { ok: false };
    }
    if (key === 'successFields' || key === 'failureFields') {
      const list = splitList(value);
      return list.length && list.every((f) => /^[\w-]+$/.test(f))
        ? { ok: true, value: list.join(',') }
        : { ok: false };
    }
    return { ok: false };
  }

  /**
   * Changes a setting after checking its value.
   *
   * @param {string} key Setting name.
   * @param {*} value New value.
   * @returns {boolean} True when the value was accepted.
   */
  function setSetting(key, value) {
    const checked = checkSetting(key, value);
    if (!checked.ok) {
      return false;
    }
    getSettings()[key] = checked.value;
    return true;
  }

  /**
   * Finds the One-Click useroptions branch for this Mod. Roll20 keys it by the
   * lower-cased script name.
   *
   * @returns {object|null} The options, or null when there are none.
   */
  function oneClickOptions() {
    if (typeof globalconfig === 'undefined' || !isRecord(globalconfig)) {
      return null;
    }
    const key = Object.keys(globalconfig).find(
      (k) => k.toLowerCase().replaceAll(/[^a-z]/g, '') === 'deathtracker'
    );
    const branch = key ? globalconfig[key] : null;
    if (!isRecord(branch)) {
      return null;
    }
    return isRecord(branch.useroptions) ? branch.useroptions : branch;
  }

  /**
   * Applies the One-Click useroptions the GM has changed since they were last
   * applied, so settings changed in chat survive a restart.
   *
   * @returns {string[]} Settings changed.
   */
  function applyGlobalConfig() {
    const options = oneClickOptions();
    if (!options) {
      return [];
    }
    const s = getState();
    const applied = isRecord(s.notices.useroptions) ? s.notices.useroptions : {};
    const changed = [];
    for (const key of Object.keys(DEFAULT_SETTINGS)) {
      if (!(key in options)) {
        continue;
      }
      // An unticked checkbox arrives as false; a ticked one as its value string.
      const raw = options[key] === false && BOOLEAN_SETTINGS.includes(key) ? 'off' : options[key];
      if (raw === applied[key]) {
        continue;
      }
      applied[key] = raw;
      const value = MARKER_SETTINGS.includes(key) ? (resolveMarker(raw)?.tag ?? raw) : raw;
      if (setSetting(key, value)) {
        changed.push(key);
      }
    }
    s.notices.useroptions = applied;
    return changed;
  }

  /**
   * Returns a token's record, creating it when asked.
   *
   * @param {string} id Token ID.
   * @param {boolean} [create=false] Make an empty record when there is none.
   * @returns {TokenRecord|null} Record.
   */
  function getRecord(id, create = false) {
    const tokens = getState().tokens;
    if (!tokens[id] && create) {
      tokens[id] = cleanRecord({});
    }
    return tokens[id] || null;
  }

  /**
   * Forgets a token.
   *
   * @param {string} id Token ID.
   * @returns {void}
   */
  function dropRecord(id) {
    delete getState().tokens[id];
  }

  /**
   * Returns the GM's PC/NPC choice for a character or token.
   *
   * @param {string} id Character ID, or token ID for a token with no character.
   * @returns {'pc'|'npc'|null} The choice, or null for "decide automatically".
   */
  function getRole(id) {
    return getState().roles[id] || null;
  }

  /**
   * Sets or clears the GM's PC/NPC choice.
   *
   * @param {string} id Character or token ID.
   * @param {'pc'|'npc'|null} role Choice, or null to decide automatically.
   * @returns {void}
   */
  function setRole(id, role) {
    if (role === 'pc' || role === 'npc') {
      getState().roles[id] = role;
    } else {
      delete getState().roles[id];
    }
  }

  // The rules that turn hit points and death saves into a status. Nothing here
  // touches Roll20, so it is easy to test.

  /**
   * @typedef {object} Judgement
   * @property {number|null} hp Current hit points.
   * @property {number|null} max Maximum hit points.
   * @property {boolean} isPc True for player characters.
   * @property {string|null} previous Status before this change.
   * @property {{s: number, f: number}|null} saves Death saves counted since the drop to 0.
   * @property {boolean} deathSaves True when PCs at 0 make death saves.
   * @property {number} bloodiedPercent Bloodied at or below this share of maximum.
   * @property {boolean} massive True when the hit that dropped the PC to 0 was massive damage.
   */

  /**
   * Decides a token's status.
   *
   * @param {Judgement} j What is known.
   * @returns {string|null} Status, or null when the hit points cannot be read (leave the token alone).
   */
  function decideStatus(j) {
    if (j.hp === null || j.hp === undefined) {
      return null;
    }
    if (j.hp > 0) {
      if (j.max && j.bloodiedPercent > 0 && j.hp <= (j.max * j.bloodiedPercent) / 100) {
        return STATUS.BLOODIED;
      }
      return STATUS.HEALTHY;
    }
    if (!j.isPc) {
      return STATUS.DEAD;
    }
    // A dead PC stays dead at 0 until healed.
    if (j.previous === STATUS.DEAD || j.massive) {
      return STATUS.DEAD;
    }
    if (!j.deathSaves) {
      return STATUS.DYING;
    }
    const saves = j.saves || { s: 0, f: 0 };
    if (saves.f >= DEATH_SAVES_NEEDED) {
      return STATUS.DEAD;
    }
    if (saves.s >= DEATH_SAVES_NEEDED) {
      return STATUS.STABLE;
    }
    // Stabilised by hand (the stable command, a Medicine check) stays stable
    // until the PC fails a save again.
    if (j.previous === STATUS.STABLE && saves.f === 0) {
      return STATUS.STABLE;
    }
    return STATUS.DYING;
  }

  /**
   * Counts the death saves made since the drop to 0. The sheet keeps old ticks
   * (the 2024 sheet never clears them on healing), so they are counted from the
   * values seen at the drop. When the sheet's count goes down (someone cleared
   * the boxes), the starting point goes down with it.
   *
   * @param {{s: number, f: number}} sheet Counts on the sheet now.
   * @param {{s: number, f: number}|null} base Counts at the drop to 0.
   * @returns {{base: {s: number, f: number}, saves: {s: number, f: number}}} New starting point and counted saves.
   */
  function countSaves(sheet, base) {
    const b = base || { s: 0, f: 0 };
    const nextBase = { s: Math.min(b.s, sheet.s), f: Math.min(b.f, sheet.f) };
    return {
      base: nextBase,
      saves: {
        s: Math.min(DEATH_SAVES_NEEDED, sheet.s - nextBase.s),
        f: Math.min(DEATH_SAVES_NEEDED, sheet.f - nextBase.f),
      },
    };
  }

  /**
   * Applies the massive damage rule: damage left over after dropping to 0 that
   * is at least the maximum kills outright. DeathTracker only sees the leftover
   * when the bar goes below 0.
   *
   * @param {number|null} hp Hit points now.
   * @param {number|null} max Maximum.
   * @returns {boolean} True when the PC dies outright.
   */
  function isMassiveDamage(hp, max) {
    return hp !== null && max !== null && max > 0 && hp < 0 && -hp >= max;
  }

  /**
   * Picks the tint colour for a share of hit points: green when full, red at 0.
   *
   * @param {number} hp Hit points.
   * @param {number} max Maximum.
   * @returns {number} Hue (0 red to 120 green).
   */
  function tintHue(hp, max) {
    const share = Math.max(0, Math.min(1, hp / max));
    return share * 120;
  }

  // Tint by hit points and the hurt and heal effects (0.1.x features, fixed).

  /**
   * Tints a token from green (full) to red (0), or gives it back its own tint
   * when it is at full hit points again.
   *
   * @param {object} token Roll20 graphic.
   * @param {import('./state.js').TokenRecord} record Token record (its own tint is kept here).
   * @param {number} hp Hit points.
   * @param {number|null} max Maximum.
   * @returns {void}
   */
  function applyTint(token, record, hp, max) {
    if (!max) {
      return;
    }
    if (hp >= max) {
      clearTint(token, record);
      return;
    }
    if (record.tint === null) {
      record.tint = token.get('tint_color') || 'transparent';
    }
    const colour = hueToHex(tintHue(hp, max));
    if (token.get('tint_color') !== colour) {
      token.set('tint_color', colour);
    }
  }

  /**
   * Gives a token back the tint it had before DeathTracker tinted it.
   *
   * @param {object} token Roll20 graphic.
   * @param {import('./state.js').TokenRecord} record Token record.
   * @returns {void}
   */
  function clearTint(token, record) {
    if (record.tint === null) {
      return;
    }
    if (token.get('tint_color') !== record.tint) {
      token.set('tint_color', record.tint);
    }
    record.tint = null;
  }

  /**
   * Plays a built-in effect on a token, on the token's own page.
   *
   * @param {object} token Roll20 graphic.
   * @param {string} type Effect name such as "splatter-blood".
   * @returns {void}
   */
  function playFx(token, type) {
    const x = toNumber(token.get('left'));
    const y = toNumber(token.get('top'));
    if (x === null || y === null || !type) {
      return;
    }
    const pageId = token.get('_pageid');
    if (BEAM_FX_TYPES.includes(type.split('-')[0])) {
      spawnFxBetweenPoints({ x, y }, { x, y }, type, pageId);
    } else {
      spawnFx(x, y, type, pageId);
    }
  }

  // Hit points from the bar the GM chose. A linked bar whose maximum is empty
  // gets its maximum from the linked attribute.

  /**
   * @typedef {object} HitPoints
   * @property {number|null} value Current hit points, or null when the bar is empty or not a number.
   * @property {number|null} max Maximum, or null when unknown.
   * @property {string} link Name or ID of the attribute the bar is linked to ('' when not linked).
   */

  /**
   * Reads a token's hit points.
   *
   * @param {object} token Roll20 graphic.
   * @param {number} bar Bar number (1 to 3).
   * @returns {HitPoints} Hit points.
   */
  function readHp(token, bar) {
    const value = toNumber(token.get(`bar${bar}_value`));
    let max = toNumber(token.get(`bar${bar}_max`));
    const link = toText(token.get(`bar${bar}_link`));
    if ((max === null || max <= 0) && link) {
      max = linkedMax(token, link);
    }
    return { value, max: max !== null && max > 0 ? max : null, link };
  }

  /**
   * Reads the maximum of the attribute a bar is linked to. Legacy sheets link by
   * attribute ID; the 2024 sheet links by name.
   *
   * @param {object} token Roll20 graphic.
   * @param {string} link Bar link.
   * @returns {number|null} Maximum.
   */
  function linkedMax(token, link) {
    const byId = getObj('attribute', link);
    if (byId) {
      return toNumber(byId.get('max'));
    }
    const characterId = toText(token.get('represents'));
    if (!characterId) {
      return null;
    }
    const attr = findAttribute(characterId, link);
    return attr ? toNumber(attr.get('max')) : null;
  }

  /**
   * Returns the bar value a change event saw before, as a number.
   *
   * @param {object|null} prev Previous attributes from a change event.
   * @param {number} bar Bar number.
   * @returns {number|null} Previous hit points.
   */
  function previousHp(prev, bar) {
    return prev ? toNumber(prev[`bar${bar}_value`]) : null;
  }

  // The heart of DeathTracker: judge a token from its hit points (and a PC's
  // death saves), show the right marker, tint and effects, and run the on-death
  // actions.

  const statusListeners = [];

  // A character's tokens on other pages change with it, so the same news can
  // come from several tokens at once: tell it once per character.
  const ANNOUNCE_REPEAT_MS = 5000;
  const lastAnnounced = new Map();

  /**
   * Registers a function called whenever a token's status changes.
   *
   * @param {Function} fn Called with {token, status, previous, isPc}.
   * @returns {void}
   */
  function onStatusChange(fn) {
    if (typeof fn === 'function') {
      statusListeners.push(fn);
    }
  }

  /**
   * Says whether a token is a player character: the GM's choice for its
   * character (or the token) first, then whether a player controls it, then
   * (when PC detection is "auto") what its sheet says.
   *
   * @param {object} token Roll20 graphic.
   * @param {object|null} [character] Its character.
   * @returns {boolean} True for a PC.
   */
  function isPc(token, character = getCharacter(token)) {
    const role = getRole(character ? character.id : token.id);
    if (role) {
      return role === 'pc';
    }
    if (tokenControllers(token).length) {
      return true;
    }
    if (character && getSettings().pcDetection === 'auto') {
      return sheetRole(character.id) === 'pc';
    }
    return false;
  }

  /**
   * Returns the marker tag for a status ('' for none).
   *
   * @param {string|null} status Status.
   * @param {object} settings Settings.
   * @returns {string} Marker tag.
   */
  function markerFor(status, settings) {
    const key = STATUS_MARKER_SETTING[status];
    return key ? toText(settings[key]) : '';
  }

  /**
   * Judges a token and brings its markers, tint and actions up to date.
   *
   * @param {object} token Roll20 graphic.
   * @param {object} [options] Options.
   * @param {number|null} [options.prevHp] Hit points before this change (from a change event).
   * @param {boolean} [options.event=false] True when hit points changed just now (plays effects).
   * @param {string|null} [options.force] Status to set by hand (only 'stable' is used).
   * @returns {{status: string|null, previous: string|null, changed: boolean, isPc: boolean, saves: object|null}} Outcome.
   */
  function judge(token, { prevHp = null, event = false, force = null } = {}) {
    const settings = getSettings();
    const { value: hp, max } = readHp(token, settings.hpBar);
    const record = getRecord(token.id, true);
    const previous = record.status;
    if (hp === null) {
      return { status: previous, previous, changed: false, isPc: false, saves: record.saves };
    }
    const character = getCharacter(token);
    const pc = isPc(token, character);
    // HealthColors may be the one handling death saves, colours or effects.
    const ownSaves = owns('deathSaves');
    const deathSaves = settings.deathSaves && ownSaves;
    const before = record.hp ?? prevHp;
    const wasDown = [STATUS.DYING, STATUS.STABLE, STATUS.DEAD].includes(previous);
    const dropped = hp <= 0 && (before === null ? false : before > 0) && !wasDown;
    const healed = hp > 0 && (wasDown || (before !== null && before <= 0));

    if (healed) {
      record.base = null;
      record.saves = null;
      if (pc && character && ownSaves && settings.resetSheetSaves) {
        clearDeathSaves(character.id, settings, false);
      }
    }

    let massive = false;
    if (pc && hp <= 0) {
      if (dropped) {
        massive = settings.massiveDamage && isMassiveDamage(hp, max);
        record.saves = null;
        record.base = { s: 0, f: 0 };
        if (character && deathSaves) {
          if (settings.resetSheetSaves) {
            clearDeathSaves(character.id, settings, true);
            record.base = { s: 0, f: 0 };
          } else {
            const now = readDeathSaves(character.id, settings);
            record.base = now ? { s: now.s, f: now.f } : { s: 0, f: 0 };
          }
        }
      }
      if (character && deathSaves) {
        const sheet = readDeathSaves(character.id, settings);
        if (sheet) {
          const counted = countSaves(sheet, record.base);
          record.base = counted.base;
          record.saves = counted.saves;
        }
      }
    }

    let status = decideStatus({
      hp,
      max,
      isPc: pc,
      previous,
      saves: record.saves ? capSaves(record.saves) : null,
      deathSaves,
      bloodiedPercent: settings.bloodiedPercent,
      massive,
    });
    if (force === STATUS.STABLE && pc && hp <= 0 && status !== STATUS.DEAD) {
      status = STATUS.STABLE;
    }

    // The dying, stable and dead markers go with death saves.
    const down = [STATUS.DYING, STATUS.STABLE, STATUS.DEAD].includes(status);
    const marker = down && !ownSaves ? '' : markerFor(status, settings);
    record.markers = applyMarkers(token, record.markers, [marker]);
    if (owns('colours') && (pc ? settings.tintPlayers : settings.tintNpcs)) {
      applyTint(token, record, hp, max);
    } else {
      clearTint(token, record);
    }
    if (event && prevHp !== null && hp !== prevHp && owns('effects')) {
      if (hp < prevHp && settings.hurtFx) {
        playFx(token, settings.hurtFxType);
      } else if (hp > prevHp && settings.healFx) {
        playFx(token, settings.healFxType);
      }
    }

    record.hp = hp;
    record.status = status;
    const changed = status !== previous;
    if (changed) {
      if (status === STATUS.DEAD && (!pc || settings.deathActionsFor === 'all')) {
        const done = runDeathActions(token, settings);
        if (done) {
          record.actions = { ...done, ...(record.actions || {}) };
        }
      }
      announce(token, status, previous, pc, record.saves, event);
      for (const fn of statusListeners) {
        try {
          fn({ token, status, previous, isPc: pc });
        } catch (e) {
          log(`DeathTracker: a status listener failed: ${e?.message || e}`);
        }
      }
    }
    return { status, previous, changed, isPc: pc, saves: record.saves };
  }

  /**
   * Tells the GM (and the PC's players, when set) that a PC went down, became
   * stable, died or got back up.
   *
   * @param {object} token Roll20 graphic.
   * @param {string} status New status.
   * @param {string|null} previous Old status.
   * @param {boolean} pc True for a PC.
   * @param {{s: number, f: number}|null} saves Death saves counted.
   * @param {boolean} event True when hit points changed just now.
   * @returns {void}
   */
  function announce(token, status, previous, pc, saves, event) {
    const settings = getSettings();
    // A token first seen by `check` is not news; one just hit is. When
    // HealthColors (or nobody) handles death saves, it is not DeathTracker's news.
    if (
      !pc ||
      settings.announce === 'off' ||
      (previous === null && !event) ||
      !owns('deathSaves')
    ) {
      return;
    }
    const down = [STATUS.DYING, STATUS.STABLE, STATUS.DEAD];
    let key = null;
    if (down.includes(status)) {
      key = status;
    } else if (down.includes(previous)) {
      key = 'up';
    }
    if (!key) {
      return;
    }
    const who = toText(token.get('represents')) || token.id;
    const now = Date.now();
    const last = lastAnnounced.get(who);
    if (last && last.key === key && now - last.at < ANNOUNCE_REPEAT_MS) {
      return;
    }
    lastAnnounced.set(who, { key, at: now });
    const lang = getLang();
    const name = escapeHtml(toText(token.get('name')) || t('status.unnamed', lang));
    let body = escapeHtml(t(`announce.${key}`, lang, { name: '\u0000' })).replace(
      '\u0000',
      `<strong>${name}</strong>`
    );
    if (key === 'dying' && settings.deathSaves) {
      body += `<div style="font-size:0.9em">${escapeHtml(t('announce.savesHint', lang))}</div>`;
    }
    if (key === 'stable' && saves) {
      body += `<div style="font-size:0.9em">${escapeHtml(t('status.saves', lang, { s: saves.s, f: saves.f }))}</div>`;
    }
    const title = t('titles.announce', lang);
    const controllers = settings.announce === 'controllers' ? tokenControllers(token) : [];
    if (controllers.includes('all')) {
      broadcast(title, body);
      return;
    }
    whisper(null, title, body);
    for (const id of controllers) {
      whisper(id, title, body);
    }
  }

  // Keeping dying PCs up to date: sheet changes, a slow poll as a fallback, and
  // the death save macro for sheets DeathTracker cannot read.

  /**
   * Returns the tokens DeathTracker has as dying or stable.
   *
   * @param {string} [characterId] Only tokens of this character.
   * @returns {object[]} Roll20 graphics.
   */
  function downedTokens(characterId) {
    const out = [];
    for (const [id, rec] of Object.entries(getState().tokens)) {
      if (rec.status !== STATUS.DYING && rec.status !== STATUS.STABLE) {
        continue;
      }
      const token = getObj('graphic', id);
      if (token && (!characterId || token.get('represents') === characterId)) {
        out.push(token);
      }
    }
    return out;
  }

  /**
   * Handles a changed attribute: the 2024 sheet's store, or a death save field.
   *
   * @param {object} attr Roll20 attribute.
   * @returns {void}
   */
  function handleAttributeChange(attr) {
    const settings = getSettings();
    if (!settings.deathSaves || !owns('deathSaves')) {
      return;
    }
    const name = toText(attr.get('name')).toLowerCase();
    const fields = [...splitList(settings.successFields), ...splitList(settings.failureFields)].map(
      (f) => f.toLowerCase()
    );
    if (name !== 'store' && !fields.includes(name)) {
      return;
    }
    for (const token of downedTokens(attr.get('_characterid'))) {
      judge(token);
    }
  }

  /**
   * Starts the poll that re-reads dying PCs' death saves.
   *
   * @returns {void}
   */
  function startPoll() {
    const tick = () => {
      try {
        if (getSettings().deathSaves && owns('deathSaves')) {
          for (const token of downedTokens()) {
            judge(token);
          }
        }
      } catch (e) {
        log(`DeathTracker: death save check failed: ${e?.message || e}`);
      }
      setTimeout(tick, DEATH_SAVE_POLL_MS);
    };
    setTimeout(tick, DEATH_SAVE_POLL_MS);
  }

  /**
   * Builds the death save macro's action. Roll20's chat fills in the
   * @{selected|...} values when a player clicks it.
   *
   * @returns {string} Macro action.
   */
  function macroAction() {
    const s = getSettings();
    const refs = (fields) =>
      splitList(fields)
        .map((f) => `@{selected|${f}}`)
        .join(',');
    return `${COMMAND} dsync @{selected|token_id} s=${refs(s.successFields)} f=${refs(s.failureFields)}`;
  }

  /**
   * Creates or updates the death save macro as a token action everyone can use.
   *
   * @param {string} playerId GM's player ID (the macro's owner).
   * @returns {void}
   */
  function installMacro(playerId) {
    const action = macroAction();
    const [macro] = findObjs({ _type: 'macro', name: MACRO_NAME });
    if (macro) {
      macro.set({ action, istokenaction: true, visibleto: 'all' });
    } else {
      createObj('macro', {
        _playerid: playerId,
        name: MACRO_NAME,
        action,
        istokenaction: true,
        visibleto: 'all',
      });
    }
  }

  /**
   * Reads the macro's "s=1,0,on f=0,0,0" values.
   *
   * @param {string[]} args Words after the token ID.
   * @returns {{s: number, f: number}} Ticked boxes.
   */
  function parseSyncArgs(args) {
    const out = { s: 0, f: 0 };
    for (const arg of args) {
      const m = /^([sf])=(.*)$/i.exec(arg);
      if (m) {
        out[m[1].toLowerCase()] = m[2].split(',').filter(isTicked).length;
      }
    }
    return out;
  }

  /**
   * Stores death saves sent by the macro, for a sheet DeathTracker cannot read.
   *
   * @param {object} token Roll20 graphic.
   * @param {{s: number, f: number}} counts Ticked boxes.
   * @returns {object} Outcome of judging the token.
   */
  function syncSaves(token, counts) {
    const rec = getRecord(token.id, true);
    const counted = countSaves(counts, rec.base);
    rec.base = counted.base;
    rec.saves = counted.saves;
    return judge(token);
  }

  // Chat cards: the main menu, status, settings, markers and help.

  // Every command, with the key of its description under help.*. Shared by the
  // help card and the Help handout.
  const COMMAND_LIST = [
    ['', 'menu'],
    ['status [all]', 'status'],
    ['check [all]', 'check'],
    ['stable', 'stable'],
    ['restore', 'restore'],
    ['clear', 'clear'],
    ['pc | npc | auto', 'role'],
    ['markers', 'markers'],
    ['macro', 'macro'],
    ['settings', 'settings'],
    ['set <setting> <value>', 'set'],
    ['reset', 'reset'],
    ['config [setting|value]', 'config'],
    ['journal rebuild', 'journal'],
    ['help', 'help'],
  ];

  /**
   * Turns text into something safe inside a roll query option.
   *
   * @param {string} text Text.
   * @returns {string} Text without characters a query would split on.
   */
  function queryText(text) {
    return toText(text)
      .replaceAll(/[|,{}]/g, ' ')
      .replaceAll(/\s+/g, ' ')
      .trim();
  }

  /**
   * Returns the GM's current page ID.
   *
   * @param {string} playerId GM's player ID.
   * @returns {string} Page ID.
   */
  function gmPageId(playerId) {
    const player = getObj('player', playerId);
    return (player && player.get('_lastpage')) || Campaign().get('playerpageid');
  }

  /**
   * Lists the tokens on a page that have readable hit points.
   *
   * @param {string} pageId Page ID.
   * @returns {object[]} Roll20 graphics.
   */
  function tokensWithHp(pageId) {
    const bar = getSettings().hpBar;
    return findObjs({ _type: 'graphic', _pageid: pageId, _subtype: 'token' }).filter(
      (tok) => readHp(tok, bar).value !== null
    );
  }

  /**
   * Builds a coloured status label.
   *
   * @param {string|null} status Status.
   * @param {string} lang Locale.
   * @returns {string} HTML.
   */
  function statusLabel(status, lang) {
    const colour = STATUS_COLOURS[status] || '#a99fc9';
    return `<span style="color:${colour};font-weight:bold">${escapeHtml(t(`status.${status || 'none'}`, lang))}</span>`;
  }

  /**
   * Builds one token's status line.
   *
   * @param {object} token Roll20 graphic.
   * @param {string} lang Locale.
   * @returns {string} HTML.
   */
  function tokenLine(token, lang) {
    const rec = getRecord(token.id);
    const { value, max } = readHp(token, getSettings().hpBar);
    const name = escapeForChat(truncate(token.get('name') || t('status.unnamed', lang), 32));
    const hp =
      value === null
        ? ''
        : t(max ? 'status.hp' : 'status.hpNoMax', lang, { hp: value, max: max ?? '' });
    const role = t(isPc(token) ? 'status.pc' : 'status.npc', lang);
    let extra = '';
    if (rec?.saves && [STATUS.DYING, STATUS.STABLE].includes(rec.status)) {
      extra = `<div style="font-size:0.85em;margin-left:8px">${escapeHtml(t('status.saves', lang, rec.saves))}</div>`;
    }
    if (rec?.actions) {
      extra += `<div style="font-size:0.85em;margin-left:8px">${escapeHtml(t('status.actions', lang))}</div>`;
    }
    return `<div><strong>${name}</strong> <span style="font-size:0.85em">(${escapeHtml(role)}, ${escapeHtml(hp)})</span> ${statusLabel(rec?.status ?? null, lang)}${extra}</div>`;
  }

  /**
   * Sends the main menu.
   *
   * @param {string} playerId GM's player ID.
   * @returns {void}
   */
  function showMenu(playerId) {
    const lang = getLang();
    const pageId = gmPageId(playerId);
    const tokens = tokensWithHp(pageId);
    const counts = {};
    const down = [];
    for (const tok of tokens) {
      const rec = getRecord(tok.id);
      const status = rec?.status;
      if (status) {
        counts[status] = (counts[status] || 0) + 1;
        if ([STATUS.DYING, STATUS.STABLE, STATUS.DEAD].includes(status) && isPc(tok)) {
          down.push(tok);
        }
      }
    }
    const page = getObj('page', pageId);
    const summary = [STATUS.HEALTHY, STATUS.BLOODIED, STATUS.DYING, STATUS.STABLE, STATUS.DEAD]
      .filter((s) => counts[s])
      .map((s) => `${statusLabel(s, lang)} ${counts[s]}`)
      .join(' • ');
    const sandbox = getSandboxVersion() || t('menu.sandboxUnknown', lang);
    whisper(playerId, t('titles.menu', lang), [
      `<div style="font-size:0.85em">${escapeHtml(t('status.page', lang, { page: escapeForChat(page?.get('name') || '') }))}</div>`,
      buildSectionLabel(t('menu.summary', lang)),
      `<div>${summary || escapeHtml(t('status.noneHere', lang))}</div>`,
      buildSectionLabel(t('menu.down', lang)),
      down.length
        ? down.map((tok) => tokenLine(tok, lang)).join('')
        : `<div>${escapeHtml(t('menu.noneDown', lang))}</div>`,
      buildDivider(),
      buildButton(t('buttons.checkPage', lang), `${COMMAND} check all`),
      buildButton(t('buttons.status', lang), `${COMMAND} status`),
      buildSecondaryButton(t('buttons.check', lang), `${COMMAND} check`),
      buildSecondaryButton(t('buttons.stable', lang), `${COMMAND} stable`),
      buildSecondaryButton(t('buttons.restore', lang), `${COMMAND} restore`),
      buildSecondaryButton(t('buttons.clear', lang), `${COMMAND} clear`),
      buildSectionLabel(t('menu.tools', lang)),
      buildSecondaryButton(t('buttons.pc', lang), `${COMMAND} pc`),
      buildSecondaryButton(t('buttons.npc', lang), `${COMMAND} npc`),
      buildSecondaryButton(t('buttons.auto', lang), `${COMMAND} auto`),
      buildSecondaryButton(t('buttons.markers', lang), `${COMMAND} markers`),
      buildButton(t('buttons.settings', lang), `${COMMAND} settings`),
      buildSecondaryButton(t('buttons.help', lang), `${COMMAND} help`),
      buildDivider(),
      `<div style="font-size:0.8em;color:#a99fc9">v${SCRIPT_VERSION} • ${escapeHtml(t('menu.sandbox', lang, { version: sandbox }))}${healthColorsInstalled() ? ` • ${escapeHtml(t('menu.hcNote', lang))}` : ''}</div>`,
    ]);
  }

  /**
   * Sends the status of some tokens.
   *
   * @param {string} playerId Player to tell.
   * @param {object[]} tokens Tokens.
   * @returns {void}
   */
  function showStatus(playerId, tokens) {
    const lang = getLang();
    const lines = tokens.map((tok) => tokenLine(tok, lang));
    whisper(playerId, t('titles.status', lang), [
      lines.length ? lines.join('') : `<div>${escapeHtml(t('status.noneHere', lang))}</div>`,
      buildDivider(),
      buildSecondaryButton(t('buttons.menu', lang), COMMAND),
    ]);
  }

  /**
   * Describes a setting's value for the settings card.
   *
   * @param {string} key Setting.
   * @param {*} value Value.
   * @param {string} lang Locale.
   * @returns {string} Text.
   */
  function describeValue(key, value, lang) {
    if (key in OWNER_SETTINGS) {
      if (value === 'off') {
        return t('buttons.off', lang);
      }
      const missing =
        (value === 'HealthColors' && !healthColorsShares()) ||
        (value !== 'HealthColors' && value !== 'DeathTracker');
      return missing ? `${value} (${t('choices.notInstalled', lang)})` : value;
    }
    if (BOOLEAN_SETTINGS.includes(key)) {
      return t(value ? 'buttons.on' : 'buttons.off', lang);
    }
    if (MARKER_SETTINGS.includes(key)) {
      return value ? markerName(value) : t('choices.none', lang);
    }
    if (key in SETTING_CHOICES) {
      return t(`choices.${key}.${value}`, lang);
    }
    if (key === 'bloodiedPercent') {
      return value > 0 ? `${value}%` : t('choices.none', lang);
    }
    if (key === 'language') {
      return LOCALE_DEFINITIONS.find((d) => d.code === value)?.nativeName || value;
    }
    return toText(value);
  }

  /**
   * Builds the command a setting's button runs (with a query for its value).
   *
   * @param {string} key Setting.
   * @param {*} value Current value.
   * @param {string} lang Locale.
   * @returns {string} Command.
   */
  function settingCommand(key, value, lang) {
    const set = `${COMMAND} set ${key}`;
    if (key in OWNER_SETTINGS) {
      return `${set} ?{${queryText(t(`settings.${key}`, lang))}|DeathTracker|HealthColors|${queryText(t('buttons.off', lang))},off} --settings`;
    }
    if (BOOLEAN_SETTINGS.includes(key)) {
      return `${set} ${value ? 'off' : 'on'} --settings`;
    }
    if (key in SETTING_CHOICES) {
      const options = SETTING_CHOICES[key]
        .map((v) => `${queryText(t(`choices.${key}.${v}`, lang))},${v}`)
        .join('|');
      return `${set} ?{${queryText(t(`settings.${key}`, lang))}|${options}} --settings`;
    }
    if (MARKER_SETTINGS.includes(key)) {
      const options = [
        `${queryText(t('choices.none', lang))},none`,
        ...listMarkers().map((m) => `${queryText(m.name)},${m.tag}`),
      ].join('|');
      return `${set} ?{${queryText(t('prompts.marker', lang))}|${options}} --settings`;
    }
    if (key === 'bloodiedPercent') {
      return `${set} ?{${queryText(t('prompts.percent', lang))}|${value}} --settings`;
    }
    if (key === 'hurtFxType' || key === 'healFxType') {
      const options = FX_TYPES.flatMap((type) => FX_COLOURS.map((c) => `${type}-${c}`))
        .map((fx) => `${fx},${fx}`)
        .join('|');
      return `${set} ?{${queryText(t('prompts.fx', lang))}|${value},${value}|${options}} --settings`;
    }
    if (key === 'successFields' || key === 'failureFields') {
      return `${set} ?{${queryText(t('prompts.fields', lang))}|${value}} --settings`;
    }
    if (key === 'language') {
      const options = LOCALE_DEFINITIONS.map(
        (d) => `${queryText(d.nativeName || d.name)},${d.code}`
      ).join('|');
      return `${set} ?{${queryText(t('prompts.language', lang))}|${options}} --settings`;
    }
    return set;
  }

  // The settings card's sections and what is in each.
  const SETTING_SECTIONS = [
    ['owners', Object.keys(OWNER_SETTINGS)],
    ['hp', ['hpBar', 'bloodiedPercent', 'pcDetection']],
    ['markers', ['bloodiedMarker', 'dyingMarker', 'stableMarker', 'deadMarker']],
    [
      'deathSaves',
      [
        'deathSaves',
        'resetSheetSaves',
        'successFields',
        'failureFields',
        'massiveDamage',
        'announce',
      ],
    ],
    ['onDeath', ['deathLayer', 'deathTurnOrder', 'deathActionsFor']],
    ['looks', ['tintPlayers', 'tintNpcs', 'hurtFx', 'hurtFxType', 'healFx', 'healFxType']],
    ['general', ['language']],
  ];

  /**
   * Sends the settings card.
   *
   * @param {string} playerId GM's player ID.
   * @returns {void}
   */
  function showSettings(playerId) {
    const lang = getLang();
    const s = getSettings();
    const parts = [];
    for (const [section, keys] of SETTING_SECTIONS) {
      parts.push(buildSectionLabel(t(`sections.${section}`, lang)));
      for (const key of keys) {
        const value = key in OWNER_SETTINGS ? getOwner(OWNER_SETTINGS[key]) : s[key];
        const label = describeValue(key, value, lang);
        parts.push(
          buildRow(
            t(`settings.${key}`, lang),
            buildSecondaryButton(truncate(label, 24), settingCommand(key, value, lang))
          )
        );
      }
    }
    parts.push(buildDivider());
    parts.push(buildSecondaryButton(t('buttons.macro', lang), `${COMMAND} macro`));
    parts.push(buildSecondaryButton(t('buttons.rebuild', lang), `${COMMAND} journal rebuild`));
    parts.push(buildSecondaryButton(t('buttons.reset', lang), `${COMMAND} reset`));
    parts.push(buildButton(t('buttons.back', lang), COMMAND));
    whisper(playerId, t('titles.settings', lang), parts);
  }

  /**
   * Sends the list of markers in the game.
   *
   * @param {string} playerId GM's player ID.
   * @returns {void}
   */
  function showMarkers(playerId) {
    const lang = getLang();
    const rows = listMarkers().map(
      (m) =>
        `<div style="font-size:0.9em">${escapeForChat(m.name)}${m.name === m.tag ? '' : ` <span style="color:#a99fc9">(${escapeForChat(m.tag)})</span>`}</div>`
    );
    whisper(playerId, t('titles.markers', lang), [
      ...rows,
      buildDivider(),
      buildButton(t('buttons.settings', lang), `${COMMAND} settings`),
    ]);
  }

  /**
   * Sends the list of commands.
   *
   * @param {string} playerId Player to tell.
   * @returns {void}
   */
  function showHelp(playerId) {
    const lang = getLang();
    const rows = COMMAND_LIST.map(
      ([cmd, key]) =>
        `<div style="margin:2px 0"><code>${escapeForChat(`${COMMAND} ${cmd}`.trim())}</code><div style="font-size:0.85em;margin-left:8px">${escapeHtml(t(`help.${key}`, lang))}</div></div>`
    );
    whisper(playerId, t('titles.help', lang), [
      ...rows,
      `<div style="font-size:0.85em">${escapeHtml(t('help.ids', lang))}</div>`,
      buildDivider(),
      buildButton(t('buttons.menu', lang), COMMAND),
    ]);
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
    const h = (key, vars) => escapeHtml(t(`handout.${key}`, lang, vars));
    const raw = (key) => tRaw(`handout.${key}`, lang);
    const code = (text) => `<span style="${STYLE.code}">${escapeHtml(text)}</span>`;
    const p = (key) => `<p style="${STYLE.p}">${h(key)}</p>`;
    const section = (key, body) => `<h2 style="${STYLE.h2}">${h(`${key}.heading`)}</h2>${body}`;

    const commands = COMMAND_LIST.map(([cmd, key]) => [
      code(`${COMMAND} ${cmd}`.trim()),
      escapeHtml(t(`help.${key}`, lang)),
    ]);
    commands.push([code('--ids id1,id2'), escapeHtml(t('help.ids', lang))]);
    const settings = [...Object.keys(OWNER_SETTINGS), ...Object.keys(DEFAULT_SETTINGS)].map(
      (key) => [code(key), escapeHtml(t(`handout.settings.rows.${key}`, lang))]
    );
    const api = [
      ['check(token)', 'check'],
      ['getStatus(token)', 'getStatus'],
      ['onStatusChange(fn)', 'onStatusChange'],
      ['ObserveTokenChange(fn)', 'observe'],
      ['isManagingDeathSaves()', 'managing'],
      ['ownersChanged()', 'ownersChanged'],
    ].map(([fn, key]) => [
      code(`DeathTracker.${fn}`),
      escapeHtml(t(`handout.api.rows.${key}`, lang)),
    ]);
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
    ${section('statuses', list(raw('statuses.points')))}
    ${section('deathSaves', list(raw('deathSaves.points')))}
    ${section('onDeath', list(raw('onDeath.points')))}
    ${section('healthColors', list(raw('healthColors.points')))}
    ${section('commands', `${p('commands.intro')}${table([t('handout.commands.colCommand', lang), t('handout.commands.colDesc', lang)], commands)}`)}
    ${section('settings', `${p('settings.intro')}${table([t('handout.settings.colKey', lang), t('handout.settings.colDesc', lang)], settings)}`)}
    ${section('api', `${p('api.intro')}${table([t('handout.api.colFunction', lang), t('handout.api.colDesc', lang)], api)}`)}
    ${section('upgrading', list(raw('upgrading.points')))}
    ${section('troubleshooting', list(raw('troubleshooting.points')))}
    ${section('languages', `${p('languages.body')}${table([t('handout.languages.colLanguage', lang), t('handout.languages.colNative', lang), t('handout.languages.colCode', lang)], locales)}`)}
    ${section(
      'credits',
      `<p style="${STYLE.p}">${h('credits.original')} ${link(original.profile, original.name)} • ${link(original.github, 'GitHub')} • ${link(original.patreon, 'Patreon')}</p>
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
    ${group('deck.menuTitle', 'deck.menuDesc', [btn('menu', ''), btn('status', 'status all', true), btn('checkPage', 'check all', true), btn('settings', 'settings', true), btn('help', 'help', true)])}
    ${group('deck.selectedTitle', 'deck.selectedDesc', [btn('check', 'check'), btn('stable', 'stable'), btn('restore', 'restore'), btn('clear', 'clear', true)])}
    ${group('deck.roleTitle', 'deck.roleDesc', [btn('pc', 'pc'), btn('npc', 'npc'), btn('auto', 'auto', true)])}
    ${group('deck.toolsTitle', 'deck.toolsDesc', [btn('markers', 'markers', true), btn('macro', 'macro', true), btn('rebuild', 'journal rebuild', true)])}
    <div style="${STYLE.footer}">${escapeHtml(tr('deck.footer', { help: HANDOUT_HELP_NAME }))}</div>
  </div>`;
  }

  /**
   * Creates or updates a handout, removing duplicates with the same name. The
   * handout gets DeathTracker's journal icon, which is also put back on older
   * handouts that have no icon or another one.
   *
   * @param {string} name Handout name.
   * @param {string} html Handout notes HTML.
   * @returns {void}
   */
  function upsertHandout(name, html) {
    const [primary, ...duplicates] = findObjs({ _type: 'handout', name });
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
   * Creates or refreshes the Help and Command Deck handouts in the GM's language.
   *
   * @returns {void}
   */
  function installHandouts() {
    const lang = getLang();
    upsertHandout(HANDOUT_HELP_NAME, buildHelpHtml(lang));
    upsertHandout(HANDOUT_DECK_NAME, buildDeckHtml(lang));
  }

  // Chat commands: !deathtracker (and !dt, !dead) with their subcommands.

  // 0.1.x `!dead config key|value` names.
  const LEGACY_CONFIG_KEYS = {
    death_statusmarker: 'deadMarker',
    half_statusmarker: 'bloodiedMarker',
    pc_unconscious_statusmarker: 'dyingMarker',
    bar: 'hpBar',
    change_player_tint: 'tintPlayers',
    change_npc_tint: 'tintNpcs',
    fx: 'hurtFx',
    fx_type: 'hurtFxType',
    heal_fx: 'healFx',
    heal_fx_type: 'healFxType',
  };

  // Settings whose change alters how tokens already judged should look.
  const REJUDGE_SETTINGS = [
    'hpBar',
    'bloodiedPercent',
    'bloodiedMarker',
    'dyingMarker',
    'stableMarker',
    'deadMarker',
    'pcDetection',
    'deathSaves',
    'tintPlayers',
    'tintNpcs',
  ];

  /**
   * Splits a command line into words, keeping --flags apart.
   *
   * @param {string} content Message text.
   * @returns {{command: string, words: string[], flags: Record<string, string|true>}} Parts.
   */
  function parseCommand(content) {
    const parts = toText(content).split(/\s+/);
    const command = (parts.shift() || '').toLowerCase();
    const words = [];
    const flags = {};
    for (let i = 0; i < parts.length; i += 1) {
      const p = parts[i];
      if (p.startsWith('--')) {
        const name = p.slice(2).toLowerCase();
        if (name === 'ids' && parts[i + 1] && !parts[i + 1].startsWith('--')) {
          flags.ids = parts[i + 1];
          i += 1;
        } else {
          flags[name] = true;
        }
      } else if (p) {
        words.push(p);
      }
    }
    return { command, words, flags };
  }

  /**
   * Says whether a message is a DeathTracker command.
   *
   * @param {string} command First word, lower-cased.
   * @returns {boolean} True when it is.
   */
  function isOurCommand(command) {
    if (COMMAND_ALIASES.includes(command)) {
      return true;
    }
    const legacy = getState().legacyCommand;
    return !!legacy && command === `!${legacy}`;
  }

  /**
   * Returns the tokens a command works on: --ids, else the selection.
   *
   * @param {object} msg Chat message.
   * @param {object} flags Parsed flags.
   * @returns {object[]} Roll20 graphics.
   */
  function targets(msg, flags) {
    if (typeof flags.ids === 'string') {
      return flags.ids
        .split(',')
        .map((id) => getObj('graphic', id.trim()))
        .filter(Boolean);
    }
    return (msg.selected || [])
      .filter((s) => s._type === 'graphic')
      .map((s) => getObj('graphic', s._id))
      .filter(Boolean);
  }

  /**
   * Judges every token DeathTracker has a record for again.
   *
   * @returns {number} Tokens judged.
   */
  function rejudgeAll() {
    let n = 0;
    for (const id of Object.keys(getState().tokens)) {
      const token = getObj('graphic', id);
      if (token) {
        judge(token);
        n += 1;
      } else {
        dropRecord(id);
      }
    }
    return n;
  }

  /**
   * Brings tokens up to date after the choice of who handles death saves,
   * colours and effects changed: every token DeathTracker knows, and the tokens
   * on the players' page.
   *
   * @returns {void}
   */
  function refreshForOwners() {
    rejudgeAll();
    const known = getState().tokens;
    for (const tok of tokensWithHp(Campaign().get('playerpageid'))) {
      if (!known[tok.id]) {
        judge(tok);
      }
    }
  }

  /**
   * Chooses who handles death saves, colours or effects (for HealthColors too)
   * and reports the result.
   *
   * @param {string} playerId GM's player ID.
   * @param {string} key One of the OWNER_SETTINGS keys.
   * @param {string} rawValue Value as typed.
   * @param {boolean} showCard Show the settings card afterwards.
   * @returns {void}
   */
  function changeOwner(playerId, key, rawValue, showCard) {
    const lang = getLang();
    const owner = parseOwner(rawValue);
    if (!owner) {
      whisperError(
        playerId,
        t('messages.settingRejected', lang, { setting: key, value: rawValue })
      );
      return;
    }
    setOwner(OWNER_SETTINGS[key], owner);
    refreshForOwners();
    tellHealthColors();
    if (showCard) {
      showSettings(playerId);
      return;
    }
    const text = t('messages.settingChanged', lang, {
      setting: t(`settings.${key}`, lang),
      value: describeValue(key, owner, lang),
    });
    whisper(playerId, t('titles.settings', lang), escapeForChat(text));
  }

  /**
   * Changes a setting from chat and reports the result.
   *
   * @param {string} playerId GM's player ID.
   * @param {string} rawKey Setting name as typed.
   * @param {string} rawValue Value as typed.
   * @param {boolean} showCard Show the settings card afterwards.
   * @returns {void}
   */
  function changeSetting(playerId, rawKey, rawValue, showCard) {
    const lang = getLang();
    const ownerKey = Object.keys(OWNER_SETTINGS).find(
      (k) => k.toLowerCase() === toText(rawKey).toLowerCase()
    );
    if (ownerKey) {
      changeOwner(playerId, ownerKey, rawValue, showCard);
      return;
    }
    const key = Object.keys(DEFAULT_SETTINGS).find(
      (k) => k.toLowerCase() === toText(rawKey).toLowerCase()
    );
    if (!key) {
      whisperError(
        playerId,
        t('messages.unknownSetting', lang, { setting: rawKey }),
        t('errors.hint', lang)
      );
      return;
    }
    let value = rawValue;
    if (MARKER_SETTINGS.includes(key)) {
      const found = resolveMarker(rawValue);
      if (found && !found.known) {
        whisperWarning(playerId, t('messages.markerUnknown', lang, { marker: rawValue }));
      }
      value = found ? found.tag : rawValue;
    }
    const before = getSettings()[key];
    if (!setSetting(key, value)) {
      whisperError(
        playerId,
        t('messages.settingRejected', lang, { setting: key, value: rawValue })
      );
      return;
    }
    const after = getSettings()[key];
    if (key === 'language') {
      installHandouts();
    }
    if (REJUDGE_SETTINGS.includes(key) && after !== before) {
      // Markers DeathTracker put on with the old setting are its to take off.
      rejudgeAll();
    }
    if (showCard) {
      showSettings(playerId);
      return;
    }
    const newLang = getLang();
    let text = t('messages.settingChanged', newLang, {
      setting: t(`settings.${key}`, newLang),
      value: describeValue(key, after, newLang),
    });
    if (key === 'hpBar') {
      text += ` ${t('messages.restartNotNeeded', newLang)}`;
    }
    whisper(playerId, t('titles.settings', newLang), escapeForChat(text));
  }

  /**
   * Handles the player-usable death save macro.
   *
   * @param {object} msg Chat message.
   * @param {string[]} words Words after "dsync".
   * @returns {void}
   */
  function handleSync(msg, words) {
    const lang = getLang();
    const token = getObj('graphic', toText(words[0]));
    if (!token) {
      whisperError(msg.playerid, t('errors.noTokens', lang));
      return;
    }
    const gm = playerIsGM(msg.playerid) || msg.playerid === API_PLAYER_ID;
    const controllers = tokenControllers(token);
    if (!gm && !controllers.includes(msg.playerid) && !controllers.includes('all')) {
      whisperError(msg.playerid, t('errors.notYourToken', lang));
      return;
    }
    const counts = parseSyncArgs(words.slice(1));
    const result = syncSaves(token, counts);
    const saves = result.saves || counts;
    whisper(
      msg.playerid,
      t('titles.announce', lang),
      escapeForChat(
        t('messages.synced', lang, {
          name: token.get('name') || t('status.unnamed', lang),
          s: saves.s,
          f: saves.f,
        })
      )
    );
  }

  /**
   * Handles a chat message.
   *
   * @param {object} msg Roll20 chat message.
   * @returns {void}
   */
  function handleChat(msg) {
    if (msg.type !== 'api') {
      return;
    }
    const { command, words, flags } = parseCommand(msg.content);
    if (!isOurCommand(command)) {
      return;
    }
    const sub = (words.shift() || 'menu').toLowerCase();
    const playerId = msg.playerid;
    const lang = getLang();
    if (sub === 'dsync') {
      handleSync(msg, words);
      return;
    }
    if (!playerIsGM(playerId) && playerId !== API_PLAYER_ID) {
      whisperError(playerId, t('errors.gmOnly', lang));
      return;
    }
    // Replies to another Mod go to the GM.
    const replyTo = playerId === API_PLAYER_ID ? null : playerId;
    const tokens = () => targets(msg, flags);
    const needTokens = (list) => {
      if (!list.length) {
        whisperError(replyTo, t('errors.noTokens', lang));
        return false;
      }
      return true;
    };

    switch (sub) {
      case 'menu':
        showMenu(playerId);
        return;
      case 'help':
        showHelp(replyTo);
        return;
      case 'status': {
        let list = tokens();
        if (!list.length || words[0] === 'all') {
          list = tokensWithHp(gmPageId(playerId)).filter((tok) => getRecord(tok.id));
        }
        showStatus(replyTo, list);
        return;
      }
      case 'check': {
        const list = words[0] === 'all' ? tokensWithHp(gmPageId(playerId)) : tokens();
        if (!needTokens(list)) {
          return;
        }
        list.forEach((tok) => judge(tok));
        whisper(
          replyTo,
          t('titles.menu', lang),
          t('messages.checked', lang, { count: list.length })
        );
        return;
      }
      case 'stable': {
        const list = tokens();
        if (!needTokens(list)) {
          return;
        }
        const n = list.filter(
          (tok) => judge(tok, { force: STATUS.STABLE }).status === STATUS.STABLE
        ).length;
        whisper(
          replyTo,
          t('titles.menu', lang),
          t(n ? 'messages.stabilised' : 'messages.notDown', lang, { count: n })
        );
        return;
      }
      case 'clear': {
        const list = tokens();
        if (!needTokens(list)) {
          return;
        }
        for (const tok of list) {
          const rec = getRecord(tok.id);
          if (rec) {
            applyMarkers(tok, rec.markers, []);
            clearTint(tok, rec);
            dropRecord(tok.id);
          }
        }
        whisper(
          replyTo,
          t('titles.menu', lang),
          t('messages.cleared', lang, { count: list.length })
        );
        return;
      }
      case 'restore': {
        const list = tokens();
        if (!needTokens(list)) {
          return;
        }
        let n = 0;
        for (const tok of list) {
          const rec = getRecord(tok.id);
          if (rec?.actions) {
            const back = undoDeathActions(tok, rec.actions);
            rec.actions = null;
            if (back.layer || back.turn) {
              n += 1;
            }
          }
        }
        whisper(
          replyTo,
          t('titles.menu', lang),
          t(n ? 'messages.restored' : 'messages.nothingToRestore', lang, { count: n })
        );
        return;
      }
      case 'pc':
      case 'npc':
      case 'auto': {
        const list = tokens();
        if (!needTokens(list)) {
          return;
        }
        const names = new Set();
        for (const tok of list) {
          const character = getCharacter(tok);
          setRole(character ? character.id : tok.id, sub === 'auto' ? null : sub);
          names.add(
            character ? character.get('name') : tok.get('name') || t('status.unnamed', lang)
          );
        }
        list.forEach((tok) => judge(tok));
        const role = sub === 'auto' ? t('buttons.auto', lang) : t(`status.${sub}`, lang);
        whisper(
          replyTo,
          t('titles.menu', lang),
          escapeForChat(t('messages.roleSet', lang, { names: [...names].join(', '), role }))
        );
        return;
      }
      case 'markers':
        showMarkers(playerId);
        return;
      case 'macro':
        installMacro(playerId);
        whisper(
          replyTo,
          t('titles.menu', lang),
          t('messages.macroCreated', lang, { macro: MACRO_NAME })
        );
        return;
      case 'settings':
        showSettings(playerId);
        return;
      case 'set':
        if (words.length < 2) {
          showSettings(playerId);
          return;
        }
        changeSetting(replyTo, words[0], words.slice(1).join(' '), !!flags.settings && !!replyTo);
        return;
      case 'reset': {
        const language = getSettings().language;
        getState().settings = { ...DEFAULT_SETTINGS, language };
        rejudgeAll();
        whisper(replyTo, t('titles.settings', lang), t('messages.resetDone', lang));
        if (replyTo) {
          showSettings(playerId);
        }
        return;
      }
      case 'config': {
        // 0.1.x: `!dead config` showed the settings; `!dead config key|value` changed one.
        if (!words.length) {
          showSettings(playerId);
          return;
        }
        const [oldKey, ...rest] = words.join(' ').split('|');
        const key = LEGACY_CONFIG_KEYS[toText(oldKey).toLowerCase()] || oldKey;
        changeSetting(replyTo, key, rest.join('|'), !!replyTo);
        return;
      }
      case 'journal':
      case 'handouts':
        installHandouts();
        whisper(
          replyTo,
          t('titles.menu', lang),
          escapeForChat(
            t('messages.journalRebuilt', lang, { help: HANDOUT_HELP_NAME, deck: HANDOUT_DECK_NAME })
          )
        );
        return;
      default:
        whisperError(
          replyTo,
          t('errors.unknownCommand', lang, { command: sub }),
          t('errors.hint', lang)
        );
    }
  }

  // DeathTracker: start-up, event wiring and the public DeathTracker object.

  let started = false;

  /**
   * Wraps an event handler so one failure is logged instead of stopping the sandbox.
   *
   * @param {string} label Where the failure happened.
   * @param {Function} fn Handler.
   * @returns {Function} Wrapped handler.
   */
  function guarded(label, fn) {
    return (...args) => {
      try {
        fn(...args);
      } catch (e) {
        log(`DeathTracker: ${label} failed: ${e?.stack || e}`);
      }
    };
  }

  /**
   * Handles a token change: judges it when its hit point bar changed.
   *
   * @param {object} token Roll20 graphic.
   * @param {object} prev Previous attributes.
   * @returns {void}
   */
  function handleTokenChange(token, prev) {
    if (!token || token.get('_subtype') !== 'token') {
      return;
    }
    const bar = getSettings().hpBar;
    const key = `bar${bar}_value`;
    const maxKey = `bar${bar}_max`;
    if (prev && token.get(key) === prev[key] && token.get(maxKey) === prev[maxKey]) {
      return;
    }
    try {
      judge(token, { prevHp: previousHp(prev, bar), event: true });
    } catch (e) {
      log(`DeathTracker: could not judge ${token.id}: ${e?.stack || e}`);
    }
    notifyObservers(token, prev);
  }

  /**
   * Judges a token now. For other Mods that change hit points (API changes
   * raise no events).
   *
   * @param {object|string} token Roll20 graphic or its ID.
   * @returns {string|null} The token's status.
   */
  function check(token) {
    const obj = typeof token === 'string' ? getObj('graphic', token) : token;
    return obj ? judge(obj).status : null;
  }

  /**
   * Returns a token's status.
   *
   * @param {object|string} token Roll20 graphic or its ID.
   * @returns {string|null} Status, or null when DeathTracker has not judged it.
   */
  function getStatus(token) {
    const id = typeof token === 'string' ? token : token?.id;
    return (id && getRecord(id)?.status) || null;
  }

  /**
   * Starts DeathTracker once Roll20 is ready.
   *
   * @returns {void}
   */
  function start() {
    if (started) {
      return;
    }
    started = true;
    const { fresh, migrated } = initialiseState();
    const s = getState();
    applyGlobalConfig();
    const lang = getLang();
    on('chat:message', guarded('chat:message', handleChat));
    on('change:graphic', handleTokenChange);
    on(
      'destroy:graphic',
      guarded('destroy:graphic', (token) => dropRecord(token.id))
    );
    on('change:attribute', guarded('change:attribute', handleAttributeChange));
    if (typeof TokenMod !== 'undefined' && typeof TokenMod.ObserveTokenChange === 'function') {
      TokenMod.ObserveTokenChange(handleTokenChange);
    }
    startPoll();
    installHandouts();

    const sandbox = getSandboxVersion();
    log(
      `-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} [Updated: ${SCRIPT_LAST_UPDATED}] <=- ${sandbox ? `Mod Script Sandbox v${sandbox}` : ''}`
    );
    if (fresh || migrated) {
      const lines = [t('messages.readyHint', lang)];
      if (migrated) {
        lines.push(t('messages.migrated', lang));
      }
      if (fresh && healthColorsShares()) {
        lines.push(t('messages.healthColors', lang));
      }
      whisper(null, t('titles.ready', lang), lines.map((l) => `<div>${l}</div>`).join(''));
    }
    // HealthColors before 2.5 does not read who handles what, so it may track
    // death saves as well.
    if (
      !healthColorsShares() &&
      healthColorsTracksSaves() &&
      getSettings().deathSaves &&
      !s.notices.healthColors
    ) {
      s.notices.healthColors = true;
      whisperWarning(null, t('messages.healthColorsSaves', lang));
    }
  }

  on('ready', start);

  /**
   * The public DeathTracker object. 0.1.x's PascalCase functions are kept for
   * the Mods that call them.
   */
  const api = {
    version: SCRIPT_VERSION,
    check,
    getStatus,
    onStatusChange,
    observeTokenChange,
    isManagingDeathSaves: () => getSettings().deathSaves === true && owns('deathSaves'),
    ownersChanged: refreshForOwners,
    ObserveTokenChange: observeTokenChange,
    CheckInstall: () => {},
    RegisterEventHandlers: () => {},
  };

  globalThis.DeathTracker = api;
})();
