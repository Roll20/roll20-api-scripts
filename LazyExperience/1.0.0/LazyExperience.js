/**
 * NOTE: GENERATED FILE - DO NOT EDIT DIRECTLY.
 * NOTE: Source files live under src/ and are bundled with `npm run build`.
 * ------------------------------------------------
 * Name: LazyExperience
 * Script: LazyExperience.js
 * Version: 1.0.0
 * Built: 2026-11-13T20:01:12.897Z
 */
const LazyExperienceMod = (() => {
  'use strict';

  // Build-time placeholders replaced by rollup.config.js inject-build-metadata plugin.
  const SCRIPT_NAME = 'LazyExperience';
  const SCRIPT_VERSION = '1.0.0';
  const SCRIPT_LAST_UPDATED = '2026-11-13T20:01:12.897Z';

  const DEFAULT_LOCALE$1 = 'en-US';

  const STATE_KEY = 'LazyExperience';
  // Where 0.1.x kept its state. Read once for migration and left in place so a rollback works.
  const LEGACY_STATE_KEY = 'LAZYEXPERIENCE';
  const SCHEMA_VERSION = 1;

  const COMMAND = '!lazyxp';
  const LONG_COMMAND = '!lazyexperience';
  // 0.1.x answered to !xp. EasyExperience and ExperienceTracker use it too, so it is
  // only an alias while neither of them is installed.
  const SHORT_ALIAS = '!xp';
  const CONFLICTING_GLOBALS = ['EASYEXPERIENCE', 'EXPERIENCETRACKER'];

  // The player ID Roll20 gives chat messages sent by Mods with sendChat.
  const API_PLAYER_ID = 'API';

  const HANDOUT_HELP_NAME = 'LazyExperience - Help';
  // The deck's name is not translated, so it always matches the handout's name.
  const DECK_TITLE = 'Command Deck';
  const HANDOUT_DECK_NAME = `LazyExperience - ${DECK_TITLE}`;
  // Journal icon (the handouts' avatar): the plain LazyExperience icon in Roll20's
  // file store. Roll20 keeps it as `.../max.webp?<number>`, so an icon is matched
  // on its image path. Only the webp files exist (thumb.png is a 404).
  const HANDOUT_ICON_PATH = '/images/506991614/emQ4__XezYV7Y1Zl9wDy8g/';
  const HANDOUT_ICON = `https://files.d20.io${HANDOUT_ICON_PATH}thumb.webp`;
  const HANDOUT_LOG_NAME = 'LazyExperience - Session Log';

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

  // Option lists for settings.
  const PAYOUT_OPTIONS = ['end', 'instant'];
  const ROSTER_OPTIONS = ['auto', 'party', 'players', 'manual'];
  const KILL_MODE_OPTIONS = ['prompt', 'auto', 'off'];
  const NOTICE_OPTIONS = ['public', 'whisper', 'gm', 'off'];
  const BAR_OPTIONS = [1, 2, 3];

  // Default configuration for new installs. Migrated 0.1.x games keep their own values.
  const DEFAULT_CONFIG = {
    language: DEFAULT_LOCALE$1,
    payout: 'end',
    updateSheets: true,
    system: 'auto',
    roster: 'auto',
    absentShare: 0,
    extraShares: 0,
    killMode: 'prompt',
    killBar: true,
    hpBar: 1,
    killMarker: true,
    marker: 'dead',
    killDeathTracker: true,
    announce: 'public',
    levelNotice: 'public',
    customXp: 'experience',
    customLevel: 'level',
    customNpcXp: 'npc_xp',
    customNpcCr: 'npc_challenge',
    customLevels: '',
  };

  // Settings shown on the settings card, in order, and how each one is edited.
  const SETTING_TYPES = {
    language: 'locale',
    payout: PAYOUT_OPTIONS,
    updateSheets: 'boolean',
    system: 'system',
    roster: ROSTER_OPTIONS,
    absentShare: 'share',
    extraShares: 'count',
    killMode: KILL_MODE_OPTIONS,
    killBar: 'boolean',
    hpBar: BAR_OPTIONS,
    killMarker: 'boolean',
    marker: 'marker',
    killDeathTracker: 'boolean',
    announce: NOTICE_OPTIONS,
    levelNotice: NOTICE_OPTIONS,
    customXp: 'field',
    customLevel: 'field',
    customNpcXp: 'field',
    customNpcCr: 'field',
    customLevels: 'levels',
  };

  // Limits that keep a single command sensible.
  const MAX_XP = 10000000;
  const MAX_EXTRA_SHARES = 20;
  const MAX_REASON_LENGTH = 120;
  const MAX_LOGGED_SESSIONS = 50;
  const MAX_AWARDS_PER_SESSION = 500;

  // How long a token handled through change:attribute is ignored by change:graphic, so
  // one HP drop is not seen twice.
  const RECENT_ATTR_MS = 250;

  // Built-in Roll20 status markers (without the status_ prefix).
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

  // Colour palette for chat cards and handouts: parchment gold on deep violet.
  const COLOR_HEADER_BG = '#2a1d3d';
  const COLOR_HEADER_TEXT = '#f2deb0';
  const COLOR_CARD_BG_TOP = '#33264a';
  const COLOR_CARD_BG_BOTTOM = '#1e1530';
  const COLOR_BORDER = '#5a4680';
  const COLOR_TEXT = '#ebe4f5';
  const COLOR_MUTED = '#b3a7c9';
  const COLOR_ACCENT = '#e3b04b';
  const COLOR_BUTTON_BG = '#b8862b';
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
   * Escapes text that came from a sheet or a name before it goes to chat. On top of
   * HTML escaping, it stops Roll20 running rolls, attribute calls, macros and queries
   * hidden in the text.
   *
   * @param {*} text Text to escape.
   * @returns {string} Safe text.
   */
  function escapeForChat(text) {
    return escapeHtml(text).replace(/[[\]{}@%?#|~`\\]/g, (ch) => `&#${ch.codePointAt(0)};`);
  }

  /**
   * Parses a whole number, rejecting anything that is not entirely digits
   * (with an optional leading sign).
   *
   * @param {*} raw Raw input.
   * @returns {number|null} Parsed integer, or null when invalid.
   */
  function parseStrictInt(raw) {
    const text = toText(raw).replaceAll(',', '');
    return /^[-+]?\d+$/.test(text) ? Number(text) : null;
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
   * Reads an XP value from sheet text. Sheets hold numbers, "1,800", "33000 or 41000 in
   * lair", "450 XP" or placeholders such as "---"; the first number wins.
   *
   * @param {*} raw Sheet value.
   * @returns {number|null} Whole XP, or null when there is no number.
   */
  function parseXpText(raw) {
    if (typeof raw === 'number') {
      return Number.isFinite(raw) && raw >= 0 ? Math.floor(raw) : null;
    }
    const match = toText(raw).match(/\d[\d,.\s]*/);
    if (!match) {
      return null;
    }
    let digits = match[0].replace(/[,\s]/g, '').replace(/\.$/, '');
    // "1.800" and "1.800.000" use dots as thousands separators; "2.5" is a decimal.
    digits = /^\d{1,3}(\.\d{3})+$/.test(digits) ? digits.replaceAll('.', '') : digits.split('.')[0];
    const value = Number(digits);
    return Number.isFinite(value) ? value : null;
  }

  /**
   * Parses a challenge rating such as "1/4", "0.5", "½" or "CR 3".
   *
   * @param {*} raw Sheet value.
   * @returns {number|null} Challenge rating, or null when not a rating.
   */
  function parseChallenge(raw) {
    const text = toText(raw)
      .replace(/^cr\s*/i, '')
      .replace('½', '1/2')
      .replace('¼', '1/4')
      .replace('⅛', '1/8');
    const fraction = text.match(/^(\d+)\s*\/\s*(\d+)/);
    if (fraction) {
      const denominator = Number(fraction[2]);
      return denominator > 0 ? Number(fraction[1]) / denominator : null;
    }
    const number = text.match(/^\d+(\.\d+)?/);
    return number ? Number(number[0]) : null;
  }

  /**
   * Formats a whole number with thousands separators, the same in every sandbox.
   *
   * @param {number} value Number to format.
   * @returns {string} Formatted number.
   */
  function formatNumber(value) {
    const n = Math.round(Number(value) || 0);
    const sign = n < 0 ? '-' : '';
    return sign + String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /**
   * Splits a comma or space separated list, dropping blanks and repeats.
   *
   * @param {*} raw Raw list.
   * @returns {string[]} Items.
   */
  function splitList(raw) {
    return [
      ...new Set(
        toText(raw)
          .split(/[\s,]+/)
          .map((s) => s.trim())
          .filter(Boolean)
      ),
    ];
  }

  /**
   * Returns true when the game runs on Jumpgate.
   *
   * @returns {boolean} True on Jumpgate.
   */
  function isJumpgate() {
    return Campaign()?.get?.('_release') === 'jumpgate';
  }

  /**
   * Returns the Mod Script sandbox version ("1.0", "1.5") when Roll20 reports it.
   *
   * @returns {string} Sandbox version, or an empty string.
   */
  function getSandboxVersion() {
    return toText(Campaign()?.sandboxVersion);
  }

  /**
   * Returns true when the sandbox can read and write Beacon sheets.
   *
   * @returns {boolean} True when getSheetItem and setSheetItem work.
   */
  function canUseBeacon() {
    const version = getSandboxVersion();
    return (
      typeof getSheetItem === 'function' &&
      typeof setSheetItem === 'function' &&
      (version === '' || Number(version) >= 1.5)
    );
  }

  /**
   * Makes a short random ID for awards and prompts.
   *
   * @returns {string} ID.
   */
  function makeId() {
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
    'background:#3b2d57',
    `color:${COLOR_TEXT}`,
    'border:1px solid #6a5590',
    'padding:2px 7px',
    'border-radius:3px',
    'text-decoration:none',
    'font-size:0.9em',
    'display:inline-block',
    'margin:1px 2px',
  ].join(';');

  // The same section bar as the handouts, so a card's sections stand out.
  const SECTION_LABEL_STYLE = [
    `background:${COLOR_HEADER_BG}`,
    `color:${COLOR_ACCENT}`,
    `border-left:3px solid ${COLOR_ACCENT}`,
    'padding:2px 6px',
    'font-variant:small-caps',
    'font-weight:bold',
    'letter-spacing:0.05em',
    'margin:6px 0 3px 0',
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
      `<td style="color:${COLOR_MUTED};width:50%;font-size:0.9em">${escapeForChat(label)}</td>`,
      `<td style="text-align:right;width:50%">${valueHtml}</td>`,
      '</tr></table>',
    ].join('');
  }

  /**
   * Sends a card the way an announce-style setting says: to everyone ('public'), to
   * the players concerned and the GM ('whisper'), to the GM only ('gm'), or not at all.
   *
   * @param {string} mode 'public', 'whisper', 'gm' or 'off'.
   * @param {string[]} playerIds Players concerned (for 'whisper').
   * @param {string} title Card header text.
   * @param {string|string[]} content HTML body content.
   * @returns {void}
   */
  function announce(mode, playerIds, title, content) {
    const body = Array.isArray(content) ? content.join('') : content;
    if (mode === 'off') {
      return;
    }
    if (mode === 'public') {
      broadcast(title, body);
      return;
    }
    if (mode === 'whisper') {
      for (const id of new Set(playerIds)) {
        whisper(id, title, body);
      }
    }
    whisper(null, title, body);
  }

  /**
   * Builds a small line of muted text.
   *
   * @param {string} html Trusted HTML.
   * @returns {string} HTML string.
   */
  function buildNote(html) {
    return `<div style="color:${COLOR_MUTED};font-size:0.85em;margin-top:3px">${html}</div>`;
  }

  var localeAf = {
    titles: {
      ready: 'LazyExperience is gereed.',
      help: 'LazyExperience Hulp',
      settings: 'LazyExperience Instellings',
      status: 'LazyExperience Status',
      roster: 'Groep',
      language: 'Taal',
      levelUp: 'Vlakstyging!',
      defeated: 'Wese verslaan',
      xpAwarded: 'Ervaring toegeken',
      sessionEnded: 'Sessie {number} beëindig',
      yourXp: 'Jou ervaring',
      pool: 'Sessie-XP',
      bonus: 'Bonus-XP',
      undo: 'Ontdoen',
      log: 'Sessielogboek',
      partyXp: 'Groep se ervaring',
    },
    menu: {
      session: 'Sessie',
      pool: 'Sessie-XP',
      payout: 'Uitbetaal',
      shares: 'Aandele',
      perShare: 'XP per aandeel',
      party: 'Groep ({source})',
      noParty: 'Niemand is nog in die groep nie. Maak die groepkaart oop om karakters by te voeg.',
      absentTag: '(afwesig)',
      bonusTag: '(+{xp} bonus)',
      levelTag: 'Vlak {level}',
      shareTag: 'Aandeel {share}',
      rosterSource: 'Groep vanaf',
      excluded: 'Uitgelaat',
      blank: '(leeg)',
      groupXp: 'Ervaring',
      groupParty: 'Groep',
      groupKills: 'Verslane wesens',
      groupSheet: 'Karakterblad',
    },
    buttons: {
      menu: 'Kieslys',
      help: 'Hulp',
      settings: 'Instellings',
      status: 'Status',
      roster: 'Groep',
      addXp: 'Voeg XP by',
      killSelected: 'Verslaan: Gekiesde',
      bonusSelected: 'Bonus: Gekiesde',
      giveSelected: 'Gee nou: Gekiesde',
      endSession: 'Beëindig sessie',
      undo: 'Ontdoen',
      show: 'Groep se XP',
      log: 'Sessielogboek',
      absent: 'Afwesig',
      present: 'Teenwoordig',
      share: 'Aandeel',
      exclude: 'Laat uit',
      include: 'Sluit in',
      partyAdd: 'Voeg gekiesde by groep',
      partyRemove: 'Verwyder gekiesde',
      addKill: 'Voeg {xp} XP by',
      otherXp: 'Ander hoeveelheid',
      ignore: 'Ignoreer',
    },
    prompts: {
      xp: 'XP',
      reason: 'Rede (opsioneel)',
      share: 'Aandeel (1 = volle, 0,5 = half)',
      confirmEnd: 'Die sessie beëindig en die XP uitdeel?',
    },
    options: {
      yesNo: { yes: 'Ja', no: 'Nee' },
      payout: { end: 'Aan die einde van die sessie', instant: 'Dadelik' },
      roster: {
        auto: 'Outomaties',
        party: 'Roll20-groep',
        players: 'Spelers se karakters',
        manual: 'Deur die speleier gekies',
      },
      killMode: { prompt: 'Vra die speleier', auto: 'Voeg outomaties by', off: 'Af' },
      announce: {
        public: 'Almal',
        whisper: 'Die betrokke spelers',
        gm: 'Slegs speleier',
        off: 'Af',
      },
      levelNotice: {
        public: 'Almal',
        whisper: 'Die speler en speleier',
        gm: 'Slegs speleier',
        off: 'Af',
      },
      system: { auto: 'Bespeur vanaf die blad' },
    },
    settings: {
      language: { label: 'Taal', desc: 'Taal vir klets-kaarte en handouts.' },
      payout: {
        label: 'Betaal XP',
        desc: 'end: XP versamel in die sessiepot en word uitgedeel wanneer die sessie eindig. instant: elke toekenning word verdeel en dadelik uitbetaal.',
      },
      updateSheets: {
        label: 'Dateer blaaie op',
        desc: 'Skryf die XP na die karakterblaaie. Wanneer dit af is, word slegs die totale aangekondig.',
      },
      system: {
        label: 'Speelstelsel',
        desc: 'Watter bladvelde XP en vlak bevat. auto kies die profiel vanaf elke karakter se blad; custom gebruik die instellings vir eie velde.',
      },
      roster: {
        label: 'Groep vanaf',
        desc: 'auto: die Roll20-groep as iemand daarin is, anders karakters wat deur spelers beheer word. party, players of manual kies een daarvan.',
      },
      absentShare: {
        label: 'Afwesige se aandeel',
        desc: "Deel van 'n aandeel wat 'n afwesige karakter steeds kry, van 0% (geen) tot 100% (volle).",
      },
      extraShares: {
        label: 'Ekstra aandele',
        desc: "Aandele vir metgeselle of huurlinge wat nie op 'n blad is nie. Hul XP word aan niemand uitbetaal nie.",
      },
      killMode: {
        label: 'Verslane wesens',
        desc: "prompt: vra die speleier voordat 'n wese se XP bygevoeg word. auto: voeg dadelik by. off: moenie tokens dophou nie.",
      },
      killBar: {
        label: 'Hou HP-balk dop',
        desc: "Tel 'n wese as verslaan wanneer sy HP-balk tot 0 of laer daal.",
      },
      hpBar: { label: 'HP-balk', desc: 'Watter token-balk (1, 2 of 3) die lewenspunte bevat.' },
      killMarker: {
        label: 'Hou merker dop',
        desc: "Tel 'n wese as verslaan wanneer die verslaan-merker op sy token geplaas word.",
      },
      marker: {
        label: 'Verslaan-merker',
        desc: "Die merker wat verslaan beteken: 'n ingeboude naam soos dead, of die naam van 'n eie merker.",
      },
      killDeathTracker: {
        label: 'Gebruik DeathTracker',
        desc: "Tel 'n wese as verslaan wanneer DeathTracker 1.0 of nuuer dit as dood merk.",
      },
      announce: {
        label: 'XP-boodskappe',
        desc: 'Wie XP-toekennings en die opsomming aan die einde van die sessie sien: public, whisper (betrokke spelers en speleier), gm of off.',
      },
      levelNotice: {
        label: 'Vlakstygingkennisgewings',
        desc: 'Wie vlakstygingkennisgewings sien: public, whisper (die speler en speleier), gm of off.',
      },
      customXp: {
        label: 'Eie XP-veld',
        desc: "Bladveld vir 'n karakter se XP wanneer Speelstelsel custom is. 'n Lys probeer elke naam om die beurt.",
      },
      customLevel: { label: 'Eie vlakveld', desc: "Bladveld vir 'n karakter se vlak." },
      customNpcXp: {
        label: 'Eie wese-XP-veld',
        desc: "Bladveld vir die XP wat 'n wese werd is.",
      },
      customNpcCr: {
        label: 'Eie uitdagingsveld',
        desc: "Bladveld vir 'n wese se uitdagingsgraad, gebruik wanneer dit geen XP-waarde het nie.",
      },
      customLevels: {
        label: 'Eie vlaktabel',
        desc: 'XP benodig vir elke vlak, vanaf vlak 1, soos 0,300,900,2700. Leeg skakel vlakstygingkennisgewings af vir eie blaaie.',
      },
    },
    roster: {
      explain: {
        party: 'Karakters wat in Roll20 as Party Member gemerk is, deel die XP.',
        players:
          "Karakters wat deur 'n speler beheer word, deel die XP. Merk Party Member op karakters om eerder die Roll20-groep te gebruik.",
        manual: 'Slegs karakters wat jy insluit, deel die XP.',
      },
      selectHint: 'Kies eers tokens om hulle by die groep te voeg of te verwyder.',
    },
    kills: {
      prompt: '{name} is verslaan. Voeg {xp} XP by die sessie?',
      noXp: '{name} is verslaan, maar sy blad het geen XP-waarde nie.',
      reason: 'Het {name} verslaan',
      result: {
        prompted: 'gevra',
        added: 'bygevoeg',
        counted: 'reeds hierdie sessie getel',
        noXp: 'geen XP op die blad nie: gebruik --xp',
        notCreature: "nie 'n wese nie (geen blad, of in die groep)",
      },
    },
    levels: {
      reached: '{name} het genoeg XP vir vlak {level}!',
      sheetButton: 'Gebruik die vlakstygingknoppie op die karakterblad.',
      updateSheet: 'Dateer die vlak op die karakterblad op.',
      pf2: 'Verhoog die vlak op die blad en trek 1 000 van die XP af.',
      spend: 'Bestee die XP en verhoog die vlak op die blad.',
    },
    instant: {
      everyone: 'Almal in die groep kry {xp} XP.',
      bonus: '{names} kry {xp} XP.',
    },
    end: {
      nothing: 'Geen XP is hierdie sessie toegeken nie.',
      playerLine: '{name} kry {xp} XP hierdie sessie.',
      playerLineTotal: '{name} kry {xp} XP hierdie sessie, altesaam {total} XP.',
      levelLine: '{name} het vlak {level} bereik.',
      remainder:
        '{xp} XP kon nie gelykop verdeel word nie en word na die volgende sessie oorgedra.',
    },
    show: {
      noXp: 'geen XP op die blad nie',
      next: 'volgende vlak by {xp}',
    },
    awardKinds: { pool: 'Sessie-XP', bonus: 'Bonus-XP', give: 'XP gegee' },
    messages: {
      saved: 'Gestoor.',
      commands: 'Bevele: {commands}',
      aliasTaken: '{alias} word aan {mods} oorgelaat. Gebruik !lazyxp.',
      migrated: 'Jou LazyExperience 0.1-instellings, sessie-XP en ekstra XP is oorgedra.',
      handouts: 'Die Hulp-, Command Deck- en Sessielogboek-handouts is herbou.',
      noLog: 'Nog geen sessie het geëindig nie, so daar is geen sessielogboek nie.',
      poolAdded: '{xp} XP by die sessie gevoeg.',
      bonusAdded: '{xp} bonus-XP vir {names}.',
      killAdded: '{xp} XP vir {name} by die sessie gevoeg.',
      killGone: 'Daardie oorwinning is reeds bygevoeg of hang nie meer nie.',
      undone: '{xp} XP teruggeneem ({reason}).',
      nothingToUndo: 'Daar is niks om hierdie sessie te ontdoen nie.',
      nothingToUndoInstant:
        "XP is reeds uitbetaal. Gebruik give met 'n negatiewe bedrag om dit reg te stel.",
      sessionReset: 'Die sessie-XP en bonusse is uitgevee. Niks is uitbetaal nie.',
      absent: 'Hierdie sessie as afwesig gemerk: {names}.',
      present: 'As teenwoordig gemerk: {names}.',
      party: {
        add: 'By die groep gevoeg: {names}.',
        remove: 'Uit die groep verwyder: {names}.',
      },
    },
    warnings: {
      sandbox:
        "Sommige karakters gebruik 'n Beacon-blad (soos D&D 2024), wat die Mod sandbox net op v1.5 kan lees en skryf. Kies sandbox v1.5 in die spel se Mod-instellings.",
      partyLegacy:
        "Die Roll20-groep is 'n Jumpgate-kenmerk; in hierdie spel hou die mod sy eie groeplys.",
      nobodyToPay: 'Niemand is in die groep nie, so {xp} XP word vir later bewaar.',
      write: {
        zero: "{name}: die blad kan nie vanaf 'n Mod op 0 XP gestel word nie. Verander dit op die blad.",
        sandbox: '{name}: hierdie blad het Mod sandbox v1.5 nodig om XP op te dateer.',
        xpless: '{name}: hierdie speelstelsel gebruik nie XP nie (of die blad bereken dit self).',
        noField:
          '{name}: geen XP-veld is vir hierdie blad bekend nie. Stel Speelstelsel op custom en noem die veld.',
        error: '{name}: die blad kon nie met {xp} XP opgedateer word nie. Kyk na die Mod-konsole.',
      },
    },
    errors: {
      gmOnly: 'Slegs die speleier kan LazyExperience-bevele gebruik.',
      failed: 'Iets het skeefgeloop: {message}',
      unknownCommand: 'Onbekende bevel "{name}".',
      helpHint: 'Tik {command} help vir die bevele.',
      unknownSetting: 'Onbekende instelling "{name}".',
      settingsHint: 'Maak die instellingskaart oop om die instellings te sien.',
      badValue: '"{value}" is nie \'n geldige waarde vir {name} nie.',
      badXp: "Gee die XP as 'n heelgetal, soos 250.",
      badShare: "Gee die aandeel as 'n getal van 0 tot 10, soos 0,5 of 50%.",
      noCharacters: 'Kies tokens wat karakters verteenwoordig, of gebruik --ids.',
      noTokens: 'Kies eers die verslane tokens, of gebruik --ids.',
    },
    status: {
      version: 'Weergawe',
      sandbox: 'Mod sandbox',
      beacon: 'Beacon-blaaie leesbaar',
      commands: 'Bevele',
      profiles: 'Speelstelsels in gebruik',
      characters: '{count} karakters',
      handouts: 'Sien die {help}- en {deck}-handouts.',
    },
    log: {
      title: 'Sessielogboek',
      sessionHeading: 'Sessie {number} — {date}',
      colCharacter: 'Karakter',
      colXp: 'XP',
      awards: 'Toekennings',
      levelUps: 'Vlakke:',
      empty: 'Nog geen sessie het geëindig nie.',
    },
    help: {
      menu: 'Wys die hoofkieslys.',
      add: "Voeg XP by die sessiepot, met 'n opsionele rede.",
      bonus: 'Gee die gekiesde karakters bonus-XP bo-op hul aandeel.',
      give: 'Betaal XP dadelik aan die gekiesde karakters uit.',
      kill: 'Tel die gekiesde tokens as verslaan en voeg hul XP by.',
      killConfirm:
        "Voeg 'n verslane wese se XP by (die knoppie van die vraag), opsioneel met 'n ander bedrag.",
      absent: 'Merk die gekiesde karakters as afwesig vir hierdie sessie.',
      present: 'Merk die gekiesde karakters weer as teenwoordig.',
      share: 'Stel die gekiesde karakters se aandeel (1 = volle).',
      exclude: 'Laat karakters uit die groep, of sluit hulle weer in.',
      undo: 'Neem die laaste toekenning terug wat nog nie uitbetaal is nie.',
      end: 'Beëindig die sessie: betaal die XP uit, kondig dit aan en teken dit aan.',
      resetSession: 'Vee die sessie-XP uit sonder om dit uit te betaal.',
      show: 'Wys elke groeplid se XP en vlak vanaf die blad.',
      roster: 'Wys die groepkaart.',
      party: 'Merk of ontmerk Roll20 se Party Member-blokkie vir die gekiesde karakters.',
      settings: 'Wys die instellingskaart.',
      set: "Verander 'n instelling.",
      lang: 'Kies die taal.',
      status: 'Wys die sandbox, bevele en speelstelsels in gebruik.',
      log: 'Skakel na die Sessielogboek-handout.',
      journal: 'Herbou die handouts.',
      help: 'Wys hierdie hulp.',
      handouts: 'Meer in die {help}- en {deck}-handouts.',
    },
    deck: {
      session: 'Sessie',
      sessionDesc: 'Voeg XP by die sessie, kyk na die groep en beëindig die sessie.',
      selected: 'Gekiesde tokens',
      selectedDesc: 'Kies eers tokens op die kaart.',
      party: 'Groep',
      partyDesc: 'Wie die XP deel.',
      tools: 'Gereedskap',
      toolsDesc: 'Instellings, status en hulp.',
      footer: 'Knoppies voer LazyExperience-bevele uit. Sien die {help}-handout vir besonderhede.',
    },
    handout: {
      versionLabel: 'Weergawe',
      subtitle: 'Sessie-ervaring, regverdig verdeel, op enige blad',
      footer: 'Knoppies vir elke bevel is in die {deck}-handout.',
      overview: {
        heading: 'Oorsig',
        body: "LazyExperience versamel die ervaringspunte wat gedurende 'n sessie verdien word, verdeel dit onder die groep en skryf dit na die karakterblaaie. Dit lees en skryf die D&D 2024-blad sowel as ouer en ander blaaie, gebruik Roll20 se eie groep, merk verslane wesens op, hanteer afwesige spelers en bonus-XP, kondig vlakstygings aan en hou 'n logboek van elke sessie.",
      },
      quickStart: {
        heading: 'Vinnige begin',
        steps: [
          'Merk Party Member op elke spelerkarakter (in die karaktervenster se instellings), of laat dit: karakters wat deur spelers beheer word, word gebruik.',
          'Tik !lazyxp om die kieslys oop te maak.',
          "Wanneer die groep 'n wese verslaan, vra die stelsel of jy sy XP wil byvoeg wanneer sy HP-balk 0 bereik. Jy kan ook tokens kies en op Verslaan: Gekiesde druk.",
          'Voeg XP vir enigiets anders by met Voeg XP by, en bonus-XP vir een karakter met Bonus: Gekiesde.',
          'Merk spelers wat die sessie gemis het as Afwesig.',
          'Druk Beëindig sessie. Almal se aandeel word na hul blaaie geskryf, aangekondig en by die Sessielogboek-handout gevoeg.',
        ],
      },
      commands: {
        heading: 'Bevele',
        intro:
          'Elke bevel begin met !lazyxp; {long} werk ook, en so ook {short} solank geen ander XP-Mod dit gebruik nie. Slegs die speleier kan hulle gebruik.',
        targets:
          "Bevele vir karakters gebruik die gekiesde tokens, of --ids gevolg deur karakter- of token-ID's geskei deur kommas.",
        colCommand: 'Bevel',
        colDesc: 'Wat dit doen',
      },
      party: {
        heading: 'Die groep',
        points: [
          "Outomaties: wanneer enige karakter in Roll20 (Jumpgate) as Party Member gemerk is, deel die Roll20-groep die XP; anders doen elke karakter wat deur 'n speler beheer word dit.",
          'Karakters wat slegs deur "All players" beheer word, soos helper-tokens, word nie getel nie.',
          'Groep voeg by en Groep verwyder merk of ontmerk Party Member vir die gekiesde karakters.',
          "Laat uit haal 'n karakter vir goed uit die groep; Sluit in sit dit terug.",
          "'n Karakter wat deur verskeie spelers beheer word, tel een keer.",
        ],
      },
      splitting: {
        heading: 'Verdeling van die XP',
        points: [
          'Die sessie-XP word gedeel deur die aantal aandele: een per groeplid, plus enige ekstra aandele.',
          'Afwesige karakters kry die instelling Afwesige se aandeel (standaard 0%). Afwesigheid duur een sessie.',
          "'n Karakter kan 'n ander aandeel hê, soos 0,5 vir 'n hulpmaat.",
          'Bonus-XP gaan na die gekiesde karakters bo-op hul aandeel.',
          'XP wat nie gelykop verdeel kan word nie, word na die volgende sessie oorgedra.',
          'Met Betaal XP op instant word elke toekenning dadelik verdeel en uitbetaal.',
        ],
      },
      kills: {
        heading: 'Verslane wesens',
        points: [
          "'n Wese tel as verslaan wanneer sy HP-balk tot 0 daal, wanneer die verslaan-merker aangesit word, of wanneer DeathTracker dit as dood merk.",
          'Veranderinge deur TokenMod, deur die blad of deur ander Mods via die gekoppelde attribuut word ook opgemerk.',
          'Slegs tokens vir karakters buite die groep wat geen speler beheer nie, word getel, en elke token net een keer per sessie.',
          'Die XP kom van die blad: die wese se XP-waarde, of sy uitdagingsgraad.',
          "Vra die speleier (die standaard) fluister 'n vraag met Voeg by, Ander hoeveelheid en Ignoreer. Voeg outomaties by slaan die vraag oor.",
        ],
      },
      levels: {
        heading: 'Vlakstygings',
        points: [
          "Nadat XP geskryf is, kontroleer LazyExperience die stelsel se vlaktabel en kondig aan wanneer 'n karakter genoeg XP vir 'n nuwe vlak het.",
          'Op die D&D 2024-blad druk die speler dan die blad se vlakstygingknoppie.',
        ],
      },
      systems: {
        heading: 'Speelstelsels',
        intro:
          "LazyExperience kies 'n profiel vanaf elke karakter se blad. Stel Speelstelsel om een af te dwing, of op custom om self die velde te noem.",
        colSystem: 'Stelsel',
        colId: 'ID',
        colSheets: 'Blaaie',
        colChecked: 'Nagegaan',
        verified: {
          live: 'In Roll20 getoets',
          partial: 'Gedeeltelik getoets in Roll20',
          source: 'Uit die blad se bronkode',
          none: '—',
        },
        points: [
          'Kies die blad volgens sy naam in die spel se Instellings. Blaaie wat nie gelys is nie, gebruik die algemene veldname experience, xp en level, of stel Speelstelsel op custom.',
          "Getoets in Roll20 beteken XP is in 'n Jumpgate-speletjie na daardie blad geskryf, die blad se eie berekeninge het gewerk, en verslane wesens en vlakstygingkennisgewings is nagegaan.",
          "Beacon-blaaie soos D&D 2024 het Mod sandbox v1.5 nodig, en 'n Mod kan hulle nie op 0 XP stel nie.",
          'Pathfinder 1E en Starfinder gebruik die blad se XP-vir-volgende-vlak-blokkie vir vlakstygingkennisgewings. Wanneer dit leeg is, gebruik Pathfinder die medium-baan en Starfinder sy eie tabel.',
          "WFRP 4E: elke toekenning word as 'n ry by die blad se Experience-lys gevoeg, maar die blad het sy XP-totale nie tydens toetsing herbereken nie, so gaan dit op die blad na.",
          "Savage Worlds, 13th Age, Cosmere en Call of Cthulhu het geen XP vir 'n Mod om te skryf nie.",
        ],
      },
      settings: {
        heading: 'Instellings',
        intro:
          'Verander instellings op die instellingskaart, of met !lazyxp set <setting> <value>.',
        colKey: 'Instelling',
        colName: 'Naam',
        colDesc: 'Wat dit doen',
      },
      upgrading: {
        heading: 'Opgradering vanaf 0.1',
        points: [
          'Instellings, sessie-XP en ekstra XP per karakter van 0.1 word oorgedra die eerste keer wat 1.0 begin.',
          'Spelers of karakters wat nie aktief was nie, word uit die groep gelaat.',
          "'n Eie bevelnaam van 0.1 bly werk.",
          'Die ou bevele werk steeds:',
        ],
        colV1: '0.1',
        colV2: '1.0',
      },
      troubleshooting: {
        heading: 'Probleemoplossing',
        points: [
          'Niks word na D&D 2024-blaaie geskryf nie: kontroleer dat die spel Mod sandbox v1.5 gebruik (!lazyxp status).',
          "'n Wese gee 0 XP: sy blad het geen XP of uitdagingsgraad nie. Gebruik Ander hoeveelheid, of !lazyxp kill --xp 100.",
          'Oorwinnings word nie opgemerk nie: kontroleer dat HP-balk die balk is wat lewenspunte bevat.',
          "!xp doen niks: 'n ander XP-Mod gebruik dit. Gebruik !lazyxp.",
        ],
      },
      languages: {
        heading: 'Tale',
        body: "Kies 'n taal met !lazyxp lang. Klets-kaarte en handouts verander dadelik.",
        colLanguage: 'Taal',
        colNative: 'Naam',
        colCode: 'Kode',
      },
      credits: {
        heading: 'Erkennings',
        original: 'Geskep deur',
        maintainer: 'Herskryf en onderhou deur',
        support: 'Foutverslae en idees is welkom op die Roll20-forum.',
      },
    },
  };

  var localeCa = {
    titles: {
      ready: 'LazyExperience està a punt.',
      help: 'Ajuda de LazyExperience',
      settings: 'Configuració de LazyExperience',
      status: 'Estat de LazyExperience',
      roster: 'Grup',
      language: 'Llengua',
      levelUp: 'Has pujat de nivell!',
      defeated: 'Criatura derrotada',
      xpAwarded: 'Experiència atorgada',
      sessionEnded: 'Sessió {number} acabada',
      yourXp: 'La teva experiència',
      pool: 'XP de la sessió',
      bonus: 'XP de bonificació',
      undo: 'Desfés',
      log: 'Registre de la sessió',
      partyXp: 'Experiència del grup',
    },
    menu: {
      session: 'Sessió',
      pool: 'XP de la sessió',
      payout: 'Pagat',
      shares: 'Parts',
      perShare: 'XP per part',
      party: 'Grup ({source})',
      noParty: 'Encara no hi ha ningú al grup. Obre la targeta del Grup per afegir-hi personatges.',
      absentTag: '(absent)',
      bonusTag: '(+{xp} de bonificació)',
      levelTag: 'Nivell {level}',
      shareTag: 'Part {share}',
      rosterSource: 'Grup de',
      excluded: 'Exclosos',
      blank: '(buit)',
      groupXp: 'Experiència',
      groupParty: 'Grup',
      groupKills: 'Criatures derrotades',
      groupSheet: 'Fitxa de personatge',
    },
    buttons: {
      menu: 'Menú',
      help: 'Ajuda',
      settings: 'Configuració',
      status: 'Estat',
      roster: 'Grup',
      addXp: 'Afegeix XP',
      killSelected: 'Derrotat: seleccionats',
      bonusSelected: 'Bonificació: seleccionats',
      giveSelected: 'Dona ara: seleccionats',
      endSession: 'Acaba la sessió',
      undo: 'Desfés',
      show: 'XP del grup',
      log: 'Registre de la sessió',
      absent: 'Absent',
      present: 'Present',
      share: 'Part',
      exclude: 'Exclou',
      include: 'Inclou',
      partyAdd: 'Afegeix els seleccionats al grup',
      partyRemove: 'Treu els seleccionats',
      addKill: 'Afegeix {xp} XP',
      otherXp: 'Una altra quantitat',
      ignore: 'Ignora',
    },
    prompts: {
      xp: 'XP',
      reason: 'Motiu (opcional)',
      share: 'Part (1 = completa, 0,5 = meitat)',
      confirmEnd: "Vols acabar la sessió i repartir l'XP?",
    },
    options: {
      yesNo: { yes: 'Sí', no: 'No' },
      payout: { end: 'Al final de la sessió', instant: 'Immediatament' },
      roster: {
        auto: 'Automàtic',
        party: 'Grup de Roll20',
        players: 'Personatges dels jugadors',
        manual: 'Triat pel DJ',
      },
      killMode: { prompt: 'Pregunta al DJ', auto: 'Afegeix automàticament', off: 'Desactivat' },
      announce: {
        public: 'Tothom',
        whisper: 'Els jugadors afectats',
        gm: 'Només el DJ',
        off: 'Desactivat',
      },
      levelNotice: {
        public: 'Tothom',
        whisper: 'El jugador i el DJ',
        gm: 'Només el DJ',
        off: 'Desactivat',
      },
      system: { auto: 'Detecta-ho per la fitxa' },
    },
    settings: {
      language: { label: 'Llengua', desc: 'Llengua de les targetes del xat i dels handouts.' },
      payout: {
        label: "Paga l'XP",
        desc: "end: l'XP s'acumula al fons de la sessió i es reparteix quan aquesta acaba. instant: cada premi es divideix i es paga a l'acte.",
      },
      updateSheets: {
        label: 'Actualitza les fitxes',
        desc: "Escriu l'XP a les fitxes dels personatges. Si està desactivat, els totals només s'anuncien.",
      },
      system: {
        label: 'Sistema de joc',
        desc: "Quins camps de la fitxa contenen l'XP i el nivell. auto tria el perfil segons la fitxa de cada personatge; custom fa servir la configuració dels camps personalitzats.",
      },
      roster: {
        label: 'Grup de',
        desc: 'auto: el grup de Roll20 si hi ha algú, i si no, els personatges controlats per jugadors. party, players o manual en trien un.',
      },
      absentShare: {
        label: 'Part dels absents',
        desc: "Part d'una part que un personatge absent encara rep, del 0% (res) al 100% (completa).",
      },
      extraShares: {
        label: 'Parts addicionals',
        desc: 'Parts per a companys o mercenaris que no tenen fitxa. El seu XP no es paga a ningú.',
      },
      killMode: {
        label: 'Criatures derrotades',
        desc: "prompt: pregunta al DJ abans d'afegir l'XP d'una criatura. auto: l'afegeix a l'acte. off: no vigila els tokens.",
      },
      killBar: {
        label: 'Vigila la barra de PV',
        desc: 'Considera derrotada una criatura quan la seva barra de PV baixa a 0 o menys.',
      },
      hpBar: {
        label: 'Barra de PV',
        desc: 'Quina barra del token (1, 2 o 3) conté els punts de vida.',
      },
      killMarker: {
        label: 'Vigila el marcador',
        desc: 'Considera derrotada una criatura quan es posa el marcador de derrotat al seu token.',
      },
      marker: {
        label: 'Marcador de derrotat',
        desc: "El marcador que vol dir derrotat: un nom integrat, com dead, o el nom d'un marcador personalitzat.",
      },
      killDeathTracker: {
        label: 'Fes servir DeathTracker',
        desc: 'Considera derrotada una criatura quan DeathTracker 1.0 o posterior la marca com a morta.',
      },
      announce: {
        label: "Missatges d'XP",
        desc: "Qui veu els premis d'XP i el resum de final de sessió: public, whisper (jugadors afectats i DJ), gm o off.",
      },
      levelNotice: {
        label: 'Avisos de nivell',
        desc: 'Qui veu els avisos de pujada de nivell: public, whisper (el jugador i el DJ), gm o off.',
      },
      customXp: {
        label: "Camp d'XP personalitzat",
        desc: "Camp de la fitxa per a l'XP d'un personatge quan el Sistema de joc és custom. Una llista prova cada nom per ordre.",
      },
      customLevel: {
        label: 'Camp de nivell personalitzat',
        desc: "Camp de la fitxa per al nivell d'un personatge.",
      },
      customNpcXp: {
        label: "Camp d'XP de criatura personalitzat",
        desc: "Camp de la fitxa per a l'XP que val una criatura.",
      },
      customNpcCr: {
        label: 'Camp de repte personalitzat',
        desc: "Camp de la fitxa per al grau de repte d'una criatura, que s'usa quan no té valor d'XP.",
      },
      customLevels: {
        label: 'Taula de nivells personalitzada',
        desc: 'XP necessari per a cada nivell, des del nivell 1, com ara 0,300,900,2700. Si es deixa en blanc, es desactiven els avisos de nivell per a les fitxes custom.',
      },
    },
    roster: {
      explain: {
        party: "Els personatges marcats com a Party Member a Roll20 comparteixen l'XP.",
        players:
          "Els personatges controlats per un jugador comparteixen l'XP. Marca Party Member als personatges per fer servir el grup de Roll20.",
        manual: "Només els personatges que hi incloguis comparteixen l'XP.",
      },
      selectHint: "Selecciona primer els tokens per afegir-los al grup o treure'ls.",
    },
    kills: {
      prompt: '{name} ha estat derrotat. Vols afegir {xp} XP a la sessió?',
      noXp: "{name} ha estat derrotat, però la seva fitxa no té valor d'XP.",
      reason: 'Ha derrotat {name}',
      result: {
        prompted: 'preguntat',
        added: 'afegit',
        counted: 'ja comptat en aquesta sessió',
        noXp: 'sense XP a la fitxa: fes servir --xp',
        notCreature: 'no és una criatura (sense fitxa, o és al grup)',
      },
    },
    levels: {
      reached: '{name} té prou XP per al nivell {level}!',
      sheetButton: 'Fes servir el botó de pujar de nivell de la fitxa del personatge.',
      updateSheet: 'Actualitza el nivell a la fitxa del personatge.',
      pf2: "Puja el nivell a la fitxa i resta 1.000 de l'XP.",
      spend: "Gasta l'XP i puja el nivell a la fitxa.",
    },
    instant: {
      everyone: 'Tothom al grup guanya {xp} XP.',
      bonus: '{names} guanyen {xp} XP.',
    },
    end: {
      nothing: "En aquesta sessió no s'ha atorgat cap XP.",
      playerLine: '{name} guanya {xp} XP en aquesta sessió.',
      playerLineTotal: '{name} guanya {xp} XP en aquesta sessió, fins a un total de {total} XP.',
      levelLine: '{name} ha arribat al nivell {level}.',
      remainder: "{xp} XP no s'han pogut dividir per igual i passen a la sessió següent.",
    },
    show: {
      noXp: 'sense XP a la fitxa',
      next: 'nivell següent als {xp}',
    },
    awardKinds: { pool: 'XP de la sessió', bonus: 'XP de bonificació', give: 'XP donat' },
    messages: {
      saved: 'Desat.',
      commands: 'Ordres: {commands}',
      aliasTaken: '{alias} el fa servir {mods}. Fes servir !lazyxp.',
      migrated:
        "S'han recuperat la configuració, l'XP de la sessió i l'XP addicional del teu LazyExperience 0.1.",
      handouts: "S'han tornat a crear els handouts Help, Command Deck i Session Log.",
      noLog: 'Encara no ha acabat cap sessió, així que no hi ha registre de la sessió.',
      poolAdded: "S'han afegit {xp} XP a la sessió.",
      bonusAdded: '{xp} XP de bonificació per a {names}.',
      killAdded: "S'han afegit a la sessió {xp} XP per {name}.",
      killGone: "Aquesta derrota ja s'ha afegit o ja no està pendent.",
      undone: "S'han retirat {xp} XP ({reason}).",
      nothingToUndo: 'No hi ha res per desfer en aquesta sessió.',
      nothingToUndoInstant:
        "L'XP ja s'ha pagat. Fes servir give amb una quantitat negativa per corregir-ho.",
      sessionReset: "S'han esborrat l'XP de la sessió i les bonificacions. No s'ha pagat res.",
      absent: 'Marcats com a absents en aquesta sessió: {names}.',
      present: 'Marcats com a presents: {names}.',
      party: {
        add: 'Afegits al grup: {names}.',
        remove: 'Retirats del grup: {names}.',
      },
    },
    warnings: {
      sandbox:
        'Alguns personatges fan servir una fitxa Beacon (com la de D&D 2024), que el Mod sandbox només pot llegir i escriure a la v1.5. Tria el sandbox v1.5 a la configuració de Mods de la partida.',
      partyLegacy:
        'El grup de Roll20 és una funció de Jumpgate; en aquesta partida el mod manté la seva pròpia llista de grup.',
      nobodyToPay: 'No hi ha ningú al grup, així que {xp} XP es guarden per a més endavant.',
      write: {
        zero: '{name}: un Mod no pot posar la fitxa a 0 XP. Canvia-ho a la fitxa.',
        sandbox: "{name}: aquesta fitxa necessita el Mod sandbox v1.5 per actualitzar l'XP.",
        xpless:
          '{name}: aquest sistema de joc no fa servir XP (o la fitxa el calcula ella mateixa).',
        noField:
          "{name}: no es coneix cap camp d'XP per a aquesta fitxa. Posa el Sistema de joc a custom i indica el camp.",
        error: "{name}: no s'ha pogut actualitzar la fitxa amb {xp} XP. Mira la consola de Mods.",
      },
    },
    errors: {
      gmOnly: 'Només el DJ pot fer servir les ordres de LazyExperience.',
      failed: 'Alguna cosa ha anat malament: {message}',
      unknownCommand: 'Ordre desconeguda «{name}».',
      helpHint: 'Escriu {command} help per veure les ordres.',
      unknownSetting: 'Opció de configuració desconeguda «{name}».',
      settingsHint: 'Obre la targeta de configuració per veure les opcions.',
      badValue: '«{value}» no és un valor vàlid per a {name}.',
      badXp: "Indica l'XP com un nombre enter, com ara 250.",
      badShare: 'Indica la part com un nombre de 0 a 10, com ara 0,5 o 50%.',
      noCharacters: 'Selecciona tokens que representin personatges, o fes servir --ids.',
      noTokens: 'Selecciona primer els tokens derrotats, o fes servir --ids.',
    },
    status: {
      version: 'Versió',
      sandbox: 'Mod sandbox',
      beacon: 'Fitxes Beacon llegibles',
      commands: 'Ordres',
      profiles: 'Sistemes de joc en ús',
      characters: '{count} personatges',
      handouts: 'Consulta els handouts {help} i {deck}.',
    },
    log: {
      title: 'Registre de la sessió',
      sessionHeading: 'Sessió {number} — {date}',
      colCharacter: 'Personatge',
      colXp: 'XP',
      awards: 'Premis',
      levelUps: 'Nivells:',
      empty: 'Encara no ha acabat cap sessió.',
    },
    help: {
      menu: 'Mostra el menú principal.',
      add: 'Afegeix XP al fons de la sessió, amb un motiu opcional.',
      bonus: 'Dona XP de bonificació als personatges seleccionats, a més de la seva part.',
      give: "Paga XP a l'acte als personatges seleccionats.",
      kill: 'Compta els tokens seleccionats com a derrotats i afegeix el seu XP.',
      killConfirm:
        "Afegeix l'XP d'una criatura derrotada (el botó de l'avís), opcionalment amb una altra quantitat.",
      absent: 'Marca els personatges seleccionats com a absents en aquesta sessió.',
      present: 'Torna a marcar els personatges seleccionats com a presents.',
      share: 'Defineix la part dels personatges seleccionats (1 = completa).',
      exclude: "Exclou personatges del grup, o torna a incloure'ls.",
      undo: "Desfà l'últim premi que encara no s'ha pagat.",
      end: "Acaba la sessió: paga l'XP, l'anuncia i el registra.",
      resetSession: "Esborra l'XP de la sessió sense pagar-lo.",
      show: "Mostra l'XP i el nivell de cada membre del grup segons la fitxa.",
      roster: 'Mostra la targeta del grup.',
      party: 'Marca o desmarca la casella Party Member de Roll20 per als personatges seleccionats.',
      settings: 'Mostra la targeta de configuració.',
      set: 'Canvia una opció de configuració.',
      lang: 'Tria la llengua.',
      status: 'Mostra el sandbox, les ordres i els sistemes de joc en ús.',
      log: 'Enllaç al handout Session Log.',
      journal: 'Torna a crear els handouts.',
      help: 'Mostra aquesta ajuda.',
      handouts: 'Més informació als handouts {help} i {deck}.',
    },
    deck: {
      session: 'Sessió',
      sessionDesc: 'Afegeix XP a la sessió, mira el grup i acaba la sessió.',
      selected: 'Tokens seleccionats',
      selectedDesc: 'Selecciona primer els tokens al mapa.',
      party: 'Grup',
      partyDesc: "Qui comparteix l'XP.",
      tools: 'Eines',
      toolsDesc: 'Configuració, estat i ajuda.',
      footer:
        'Els botons executen ordres de LazyExperience. Consulta el handout {help} per als detalls.',
    },
    handout: {
      versionLabel: 'Versió',
      subtitle: "L'experiència de la sessió, repartida amb justícia, a qualsevol fitxa",
      footer: 'Els botons de totes les ordres són al handout {deck}.',
      overview: {
        heading: 'Visió general',
        body: "LazyExperience recull els punts d'experiència guanyats durant una sessió, els reparteix entre el grup i els escriu a les fitxes dels personatges. Llegeix i escriu la fitxa de D&D 2024 i també fitxes més antigues i d'altres sistemes, fa servir el grup de Roll20, s'adona de les criatures derrotades, gestiona els jugadors absents i l'XP de bonificació, anuncia les pujades de nivell i en porta un registre de cada sessió.",
      },
      quickStart: {
        heading: 'Inici ràpid',
        steps: [
          'Marca Party Member a cada personatge de jugador (a la configuració de la finestra del personatge), o deixa-ho així: es fan servir els personatges controlats per jugadors.',
          'Escriu !lazyxp per obrir el menú.',
          "Quan el grup derrota una criatura, la barra de PV que arriba a 0 et pregunta si en vols afegir l'XP. També pots seleccionar tokens i prémer Derrotat: seleccionats.",
          "Afegeix l'XP de qualsevol altra cosa amb Afegeix XP, i l'XP de bonificació d'un personatge amb Bonificació: seleccionats.",
          'Marca com a Absent els jugadors que no han vingut a la sessió.',
          "Prem Acaba la sessió. La part de cadascú s'escriu a les fitxes, s'anuncia i s'afegeix al handout Session Log.",
        ],
      },
      commands: {
        heading: 'Ordres',
        intro:
          "Totes les ordres comencen amb !lazyxp; {long} també funciona, i {short} també mentre cap altre Mod d'XP el faci servir. Només les pot fer servir el DJ.",
        targets:
          "Les ordres per a personatges fan servir els tokens seleccionats, o --ids seguit d'identificadors de personatges o de tokens separats per comes.",
        colCommand: 'Ordre',
        colDesc: 'Què fa',
      },
      party: {
        heading: 'El grup',
        points: [
          "Automàtic: quan algun personatge està marcat com a Party Member a Roll20 (Jumpgate), el grup de Roll20 comparteix l'XP; si no, ho fa cada personatge controlat per un jugador.",
          "Els personatges controlats només per «Tots els jugadors», com els tokens d'ajuda, no es compten.",
          'Afegeix al grup i Treu del grup marquen o desmarquen Party Member als personatges seleccionats.',
          'Exclou treu un personatge del grup definitivament; Inclou el hi torna a posar.',
          'Un personatge controlat per diversos jugadors compta una sola vegada.',
        ],
      },
      splitting: {
        heading: "Com es reparteix l'XP",
        points: [
          "L'XP de la sessió es divideix pel nombre de parts: una per cada membre del grup, més les parts addicionals.",
          "Els personatges absents reben el valor de la configuració Part dels absents (0% per defecte). L'absència dura una sessió.",
          'Un personatge pot tenir una part diferent, com ara 0,5 per a un ajudant.',
          "L'XP de bonificació va als personatges triats, a més de la seva part.",
          "L'XP que no es pot dividir per igual passa a la sessió següent.",
          "Amb Paga l'XP en instant, cada premi es divideix i es paga a l'acte.",
        ],
      },
      kills: {
        heading: 'Criatures derrotades',
        points: [
          'Una criatura compta com a derrotada quan la seva barra de PV baixa a 0, quan se li posa el marcador de derrotat o quan DeathTracker la marca com a morta.',
          "També es detecten els canvis fets per TokenMod, per la fitxa o per altres Mods mitjançant l'atribut enllaçat.",
          'Només es compten els tokens de personatges de fora del grup que cap jugador controla, i cada token una sola vegada per sessió.',
          "L'XP surt de la fitxa: el valor d'XP de la criatura o el seu grau de repte.",
          "Pregunta al DJ (el valor per defecte) xiuxiueja un avís amb Afegeix, Una altra quantitat i Ignora. Afegeix automàticament se salta l'avís.",
        ],
      },
      levels: {
        heading: 'Pujades de nivell',
        points: [
          "Després d'escriure l'XP, LazyExperience consulta la taula de nivells del sistema i avisa quan un personatge té prou XP per a un nivell nou.",
          'A la fitxa de D&D 2024, el jugador prem llavors el botó de pujar de nivell de la fitxa.',
        ],
      },
      systems: {
        heading: 'Sistemes de joc',
        intro:
          'LazyExperience tria un perfil segons la fitxa de cada personatge. Defineix el Sistema de joc per forçar-ne un, o custom per indicar tu mateix els camps.',
        colSystem: 'Sistema',
        colId: 'ID',
        colSheets: 'Fitxes',
        colChecked: 'Comprovat',
        verified: {
          live: 'Provat a Roll20',
          partial: 'Provat parcialment a Roll20',
          source: 'Del codi de la fitxa',
          none: '—',
        },
        points: [
          'Tria la fitxa pel seu nom a la Configuració de la partida. Les fitxes que no surten a la llista fan servir els noms de camp habituals experience, xp i level, o defineix el Sistema de joc com a custom.',
          "Provat a Roll20 vol dir que s'ha escrit XP en aquesta fitxa en una partida Jumpgate, que s'han executat els càlculs propis de la fitxa, i que s'han comprovat les criatures derrotades i els avisos de nivell.",
          'Les fitxes Beacon com la de D&D 2024 necessiten el Mod sandbox v1.5, i un Mod no les pot posar a 0 XP.',
          "Pathfinder 1E i Starfinder fan servir la casella d'XP per al nivell següent de la fitxa per als avisos de nivell. Si està en blanc, Pathfinder usa la progressió mitjana i Starfinder la seva pròpia taula.",
          "WFRP 4E: cada atorgament s'afegeix com a fila a la llista Experience de la fitxa, però en les proves la fitxa no va recalcular els seus totals d'XP, així que comprova'ls a la fitxa.",
          'Savage Worlds, 13th Age, Cosmere i Call of Cthulhu no tenen XP que un Mod pugui escriure.',
        ],
      },
      settings: {
        heading: 'Configuració',
        intro:
          'Canvia la configuració a la targeta de configuració, o amb !lazyxp set <setting> <value>.',
        colKey: 'Opció',
        colName: 'Nom',
        colDesc: 'Què fa',
      },
      upgrading: {
        heading: 'Actualització des de la 0.1',
        points: [
          "La configuració, l'XP de la sessió i l'XP addicional per personatge de la 0.1 es recuperen la primera vegada que s'inicia la 1.0.",
          'Els jugadors o personatges que no eren actius queden fora del grup.',
          "Un nom d'ordre personalitzat de la 0.1 continua funcionant.",
          'Les ordres antigues continuen funcionant:',
        ],
        colV1: '0.1',
        colV2: '1.0',
      },
      troubleshooting: {
        heading: 'Resolució de problemes',
        points: [
          "No s'escriu res a les fitxes de D&D 2024: comprova que la partida fa servir el Mod sandbox v1.5 (!lazyxp status).",
          'Una criatura dona 0 XP: la seva fitxa no té XP ni grau de repte. Fes servir Una altra quantitat, o !lazyxp kill --xp 100.',
          'No es detecten les derrotes: comprova que la Barra de PV és la barra que conté els punts de vida.',
          "!xp no fa res: un altre Mod d'XP el fa servir. Fes servir !lazyxp.",
        ],
      },
      languages: {
        heading: 'Llengües',
        body: "Tria una llengua amb !lazyxp lang. Les targetes del xat i els handouts canvien a l'acte.",
        colLanguage: 'Llengua',
        colNative: 'Nom',
        colCode: 'Codi',
      },
      credits: {
        heading: 'Crèdits',
        original: 'Creat per',
        maintainer: 'Reescrit i mantingut per',
        support: "Els informes d'errors i les idees són benvinguts al fòrum de Roll20.",
      },
    },
  };

  var localeZhTW = {
    titles: {
      ready: 'LazyExperience 已就緒。',
      help: 'LazyExperience 說明',
      settings: 'LazyExperience 設定',
      status: 'LazyExperience 狀態',
      roster: '隊伍',
      language: '語言',
      levelUp: '升級!',
      defeated: '生物已擊敗',
      xpAwarded: '已發放經驗值',
      sessionEnded: '第 {number} 場次結束',
      yourXp: '你的經驗值',
      pool: '場次 XP',
      bonus: '額外 XP',
      undo: '復原',
      log: '場次紀錄',
      partyXp: '隊伍經驗值',
    },
    menu: {
      session: '場次',
      pool: '場次 XP',
      payout: '發放',
      shares: '份數',
      perShare: '每份 XP',
      party: '隊伍({source})',
      noParty: '隊伍中還沒有人。請開啟隊伍卡片來新增角色。',
      absentTag: '(缺席)',
      bonusTag: '(+{xp} 額外)',
      levelTag: '等級 {level}',
      shareTag: '份數 {share}',
      rosterSource: '隊伍來源',
      excluded: '已排除',
      blank: '(空白)',
      groupXp: '經驗值',
      groupParty: '隊伍',
      groupKills: '已擊敗的生物',
      groupSheet: '角色卡',
    },
    buttons: {
      menu: '選單',
      help: '說明',
      settings: '設定',
      status: '狀態',
      roster: '隊伍',
      addXp: '新增 XP',
      killSelected: '擊敗:已選取',
      bonusSelected: '額外:已選取',
      giveSelected: '立即發放:已選取',
      endSession: '結束場次',
      undo: '復原',
      show: '隊伍 XP',
      log: '場次紀錄',
      absent: '缺席',
      present: '出席',
      share: '份數',
      exclude: '排除',
      include: '納入',
      partyAdd: '將已選取者加入隊伍',
      partyRemove: '移除已選取者',
      addKill: '新增 {xp} XP',
      otherXp: '其他數值',
      ignore: '忽略',
    },
    prompts: {
      xp: 'XP',
      reason: '原因(選填)',
      share: '份數(1 = 全額,0.5 = 一半)',
      confirmEnd: '要結束場次並發放 XP 嗎?',
    },
    options: {
      yesNo: { yes: '是', no: '否' },
      payout: { end: '場次結束時', instant: '立即' },
      roster: {
        auto: '自動',
        party: 'Roll20 隊伍',
        players: '玩家的角色',
        manual: '由 GM 選擇',
      },
      killMode: { prompt: '詢問 GM', auto: '自動新增', off: '關閉' },
      announce: { public: '所有人', whisper: '相關玩家', gm: '僅 GM', off: '關閉' },
      levelNotice: {
        public: '所有人',
        whisper: '該玩家與 GM',
        gm: '僅 GM',
        off: '關閉',
      },
      system: { auto: '依角色卡偵測' },
    },
    settings: {
      language: { label: '語言', desc: '聊天卡片與講義所使用的語言。' },
      payout: {
        label: '發放 XP',
        desc: 'end:XP 累積在場次池中,於場次結束時發放。instant:每次發放都會立即分配並支付。',
      },
      updateSheets: {
        label: '更新角色卡',
        desc: '將 XP 寫入角色卡。關閉時,只會公告總數。',
      },
      system: {
        label: '遊戲系統',
        desc: '角色卡上存放 XP 與等級的欄位。auto 會依各角色的角色卡選擇設定檔;custom 則使用自訂欄位設定。',
      },
      roster: {
        label: '隊伍來源',
        desc: 'auto:若 Roll20 隊伍中有人就用該隊伍,否則使用由玩家控制的角色。party、players 或 manual 可指定其中一種。',
      },
      absentShare: {
        label: '缺席份數',
        desc: '缺席角色仍可獲得的份數比例,從 0%(無)到 100%(全額)。',
      },
      extraShares: {
        label: '額外份數',
        desc: '給沒有角色卡的同伴或僱傭兵的份數。他們的 XP 不會發給任何人。',
      },
      killMode: {
        label: '已擊敗的生物',
        desc: 'prompt:新增生物的 XP 前先詢問 GM。auto:立即新增。off:不監看權標。',
      },
      killBar: {
        label: '監看 HP 條',
        desc: '當生物的 HP 條降到 0 或以下時,視為已擊敗。',
      },
      hpBar: { label: 'HP 條', desc: '存放生命值的權標條(1、2 或 3)。' },
      killMarker: {
        label: '監看標記',
        desc: '當權標被放上已擊敗標記時,視為已擊敗。',
      },
      marker: {
        label: '已擊敗標記',
        desc: '代表已擊敗的標記:內建名稱(如 dead),或自訂標記的名稱。',
      },
      killDeathTracker: {
        label: '使用 DeathTracker',
        desc: '當 DeathTracker 1.0 或更新版本將生物標為死亡時,視為已擊敗。',
      },
      announce: {
        label: 'XP 訊息',
        desc: '誰能看到 XP 發放與場次結束摘要:public、whisper(相關玩家與 GM)、gm 或 off。',
      },
      levelNotice: {
        label: '升級通知',
        desc: '誰能看到升級通知:public、whisper(該玩家與 GM)、gm 或 off。',
      },
      customXp: {
        label: '自訂 XP 欄位',
        desc: '遊戲系統為 custom 時,角色 XP 所在的角色卡欄位。若為清單,會依序嘗試每個名稱。',
      },
      customLevel: { label: '自訂等級欄位', desc: '角色等級所在的角色卡欄位。' },
      customNpcXp: {
        label: '自訂生物 XP 欄位',
        desc: '生物價值 XP 所在的角色卡欄位。',
      },
      customNpcCr: {
        label: '自訂挑戰欄位',
        desc: '生物挑戰等級所在的角色卡欄位,在沒有 XP 值時使用。',
      },
      customLevels: {
        label: '自訂等級表',
        desc: '從 1 級開始,每個等級所需的 XP,例如 0,300,900,2700。留空則會關閉自訂角色卡的升級通知。',
      },
    },
    roster: {
      explain: {
        party: '在 Roll20 中勾選為隊伍成員的角色會分享 XP。',
        players: '由玩家控制的角色會分享 XP。若要改用 Roll20 隊伍,請在角色上勾選隊伍成員。',
        manual: '只有你納入的角色會分享 XP。',
      },
      selectHint: '請先選取權標,再將它們加入或移出隊伍。',
    },
    kills: {
      prompt: '{name} 已被擊敗。要將 {xp} XP 加入場次嗎?',
      noXp: '{name} 已被擊敗,但其角色卡上沒有 XP 值。',
      reason: '擊敗 {name}',
      result: {
        prompted: '已詢問',
        added: '已新增',
        counted: '本場次已計算過',
        noXp: '角色卡上沒有 XP:請使用 --xp',
        notCreature: '不是生物(沒有角色卡,或屬於隊伍)',
      },
    },
    levels: {
      reached: '{name} 的 XP 已足夠升到 {level} 級!',
      sheetButton: '請使用角色卡上的升級按鈕。',
      updateSheet: '請更新角色卡上的等級。',
      pf2: '請提升角色卡上的等級,並從 XP 中扣除 1,000。',
      spend: '請消耗 XP,並提升角色卡上的等級。',
    },
    instant: {
      everyone: '隊伍中的每個人都獲得 {xp} XP。',
      bonus: '{names} 獲得 {xp} XP。',
    },
    end: {
      nothing: '本場次沒有發放任何 XP。',
      playerLine: '{name} 在本場次獲得 {xp} XP。',
      playerLineTotal: '{name} 在本場次獲得 {xp} XP,累計共 {total} XP。',
      levelLine: '{name} 達到 {level} 級。',
      remainder: '有 {xp} XP 無法平均分配,將留到下一場次。',
    },
    show: {
      noXp: '角色卡上沒有 XP',
      next: '下一級需要 {xp}',
    },
    awardKinds: { pool: '場次 XP', bonus: '額外 XP', give: '已給予的 XP' },
    messages: {
      saved: '已儲存。',
      commands: '指令:{commands}',
      aliasTaken: '{alias} 已由 {mods} 使用。請改用 !lazyxp。',
      migrated: '已帶入你的 LazyExperience 0.1 設定、場次 XP 與額外 XP。',
      handouts: '說明、指令面板與場次紀錄講義已重新建立。',
      noLog: '還沒有結束的場次,因此沒有場次紀錄。',
      poolAdded: '已將 {xp} XP 加入場次。',
      bonusAdded: '{names} 獲得 {xp} 額外 XP。',
      killAdded: '已將 {name} 的 {xp} XP 加入場次。',
      killGone: '該次擊敗已被新增,或不再待處理。',
      undone: '已收回 {xp} XP({reason})。',
      nothingToUndo: '本場次沒有可復原的項目。',
      nothingToUndoInstant: 'XP 已經發放。請用負數的 give 來更正。',
      sessionReset: '已清除場次 XP 與額外 XP,沒有發放任何東西。',
      absent: '本場次已標記為缺席:{names}。',
      present: '已標記為出席:{names}。',
      party: {
        add: '已加入隊伍:{names}。',
        remove: '已移出隊伍:{names}。',
      },
    },
    warnings: {
      sandbox:
        '部分角色使用 Beacon 角色卡(例如 D&D 2024),Mod sandbox 只有在 v1.5 才能讀寫。請在遊戲的 Mod 設定中選擇 sandbox v1.5。',
      partyLegacy: 'Roll20 隊伍是 Jumpgate 的功能;在這個遊戲中,Mod 會自行維護隊伍清單。',
      nobodyToPay: '隊伍中沒有人,因此 {xp} XP 會保留到之後。',
      write: {
        zero: '{name}:Mod 無法把角色卡設為 0 XP。請在角色卡上自行修改。',
        sandbox: '{name}:這張角色卡需要 Mod sandbox v1.5 才能更新 XP。',
        xpless: '{name}:此遊戲系統不使用 XP(或由角色卡自行計算)。',
        noField: '{name}:不知道這張角色卡的 XP 欄位。請將遊戲系統設為 custom 並指定欄位名稱。',
        error: '{name}:無法將角色卡更新為 {xp} XP。請查看 Mod 主控台。',
      },
    },
    errors: {
      gmOnly: '只有 GM 可以使用 LazyExperience 指令。',
      failed: '發生錯誤:{message}',
      unknownCommand: '未知的指令「{name}」。',
      helpHint: '輸入 {command} help 查看指令。',
      unknownSetting: '未知的設定「{name}」。',
      settingsHint: '開啟設定卡片來查看各項設定。',
      badValue: '「{value}」不是 {name} 的有效值。',
      badXp: 'XP 請輸入整數,例如 250。',
      badShare: '份數請輸入 0 到 10 之間的數字,例如 0.5 或 50%。',
      noCharacters: '請選取代表角色的權標,或使用 --ids。',
      noTokens: '請先選取已擊敗的權標,或使用 --ids。',
    },
    status: {
      version: '版本',
      sandbox: 'Mod sandbox',
      beacon: '可讀取 Beacon 角色卡',
      commands: '指令',
      profiles: '使用中的遊戲系統',
      characters: '{count} 個角色',
      handouts: '請參閱 {help} 與 {deck} 講義。',
    },
    log: {
      title: '場次紀錄',
      sessionHeading: '第 {number} 場次 — {date}',
      colCharacter: '角色',
      colXp: 'XP',
      awards: '發放項目',
      levelUps: '等級:',
      empty: '還沒有結束的場次。',
    },
    help: {
      menu: '顯示主選單。',
      add: '將 XP 加入場次池,可附上原因。',
      bonus: '除了原有份數外,另外給予選取的角色額外 XP。',
      give: '立即發放 XP 給選取的角色。',
      kill: '將選取的權標視為已擊敗,並加入其 XP。',
      killConfirm: '新增已擊敗生物的 XP(提示訊息上的按鈕),也可改用其他數值。',
      absent: '將選取的角色標記為本場次缺席。',
      present: '將選取的角色重新標記為出席。',
      share: '設定選取角色的份數(1 = 全額)。',
      exclude: '將角色排除在隊伍之外,或重新納入。',
      undo: '收回最後一筆尚未發放的獎勵。',
      end: '結束場次:發放 XP、公告並記錄。',
      resetSession: '清除場次 XP,但不發放。',
      show: '顯示角色卡上每位隊伍成員的 XP 與等級。',
      roster: '顯示隊伍卡片。',
      party: '為選取的角色勾選或取消勾選 Roll20 的隊伍成員欄位。',
      settings: '顯示設定卡片。',
      set: '更改設定。',
      lang: '選擇語言。',
      status: '顯示 sandbox、指令與使用中的遊戲系統。',
      log: '連結到場次紀錄講義。',
      journal: '重新建立講義。',
      help: '顯示此說明。',
      handouts: '更多內容請見 {help} 與 {deck} 講義。',
    },
    deck: {
      session: '場次',
      sessionDesc: '為場次新增 XP、查看隊伍並結束場次。',
      selected: '已選取的權標',
      selectedDesc: '請先在地圖上選取權標。',
      party: '隊伍',
      partyDesc: '誰分享 XP。',
      tools: '工具',
      toolsDesc: '設定、狀態與說明。',
      footer: '按鈕會執行 LazyExperience 指令。詳情請見 {help} 講義。',
    },
    handout: {
      versionLabel: '版本',
      subtitle: '場次經驗值,任何角色卡都能公平分配',
      footer: '每個指令的按鈕都在 {deck} 講義中。',
      overview: {
        heading: '概要',
        body: 'LazyExperience 會收集場次中獲得的經驗值,分配給隊伍,並寫入角色卡。它能讀寫 D&D 2024 角色卡,也支援舊版與其他角色卡;使用 Roll20 自己的隊伍、偵測被擊敗的生物、處理缺席玩家與額外 XP、公告升級,並為每個場次保留紀錄。',
      },
      quickStart: {
        heading: '快速開始',
        steps: [
          '在每個玩家角色上勾選隊伍成員(角色視窗的設定),也可以不勾:預設會使用由玩家控制的角色。',
          '輸入 !lazyxp 開啟選單。',
          '當隊伍擊敗生物、其 HP 條降到 0 時,會詢問你是否新增其 XP。你也可以選取權標後按「擊敗:已選取」。',
          '其他來源的 XP 用「新增 XP」,給單一角色的額外 XP 則用「額外:已選取」。',
          '將缺席場次的玩家標記為缺席。',
          '按「結束場次」。每個人的份數會寫入角色卡、公告,並加入場次紀錄講義。',
        ],
      },
      commands: {
        heading: '指令',
        intro:
          '所有指令都以 !lazyxp; 開頭,{long} 也可以;在沒有其他 XP Mod 使用時,{short} 也能用。只有 GM 可以使用。',
        targets: '針對角色的指令會使用選取的權標,或使用 --ids 後面接以逗號分隔的角色或權標 ID。',
        colCommand: '指令',
        colDesc: '功能',
      },
      party: {
        heading: '隊伍',
        points: [
          '自動:當 Roll20(Jumpgate)中有任何角色被勾選為隊伍成員時,由 Roll20 隊伍分享 XP;否則由所有玩家控制的角色分享。',
          '只由「所有玩家」控制的角色(例如輔助權標)不會計入。',
          '加入隊伍與移出隊伍會為選取的角色勾選或取消勾選隊伍成員。',
          '「排除」會讓角色長期退出隊伍;「納入」則將其放回。',
          '由多位玩家控制的角色只算一次。',
        ],
      },
      splitting: {
        heading: '分配 XP',
        points: [
          '場次 XP 會除以份數:每位隊伍成員一份,再加上任何額外份數。',
          '缺席角色會依「缺席份數」設定(預設 0%)計算。缺席只持續一個場次。',
          '角色可以有不同的份數,例如隨從可設為 0.5。',
          '額外 XP 會在原有份數之外,發給指定的角色。',
          '無法平均分配的 XP 會留到下一場次。',
          '將「發放 XP」設為 instant 時,每次發放都會立即分配並支付。',
        ],
      },
      kills: {
        heading: '已擊敗的生物',
        points: [
          '當生物的 HP 條降到 0、被放上已擊敗標記,或被 DeathTracker 標為死亡時,視為已擊敗。',
          'TokenMod、角色卡或其他 Mod 透過連結屬性所做的變更也會被偵測到。',
          '只計算不在隊伍中、且沒有玩家控制的角色權標,而且每個權標每個場次只計一次。',
          'XP 來自角色卡:生物的 XP 值,或其挑戰等級。',
          '「詢問 GM」(預設)會私訊一則提示,附有新增、其他數值與忽略按鈕。「自動新增」則略過提示。',
        ],
      },
      levels: {
        heading: '升級',
        points: [
          '寫入 XP 後,LazyExperience 會檢查該系統的等級表,並在角色的 XP 足以升級時公告。',
          '在 D&D 2024 角色卡上,玩家接著按下角色卡的升級按鈕。',
        ],
      },
      systems: {
        heading: '遊戲系統',
        intro:
          'LazyExperience 會依各角色的角色卡選擇設定檔。你可以設定遊戲系統來強制指定,或設為 custom 自行指定欄位。',
        colSystem: '系統',
        colId: 'ID',
        colSheets: '角色卡',
        colChecked: '驗證狀態',
        verified: {
          live: '已在 Roll20 測試',
          partial: '已部分在 Roll20 測試',
          source: '依角色卡原始碼',
          none: '—',
        },
        points: [
          '請在遊戲的設定中依名稱選擇角色卡。未列出的角色卡會使用常見的欄位名稱 experience、xp 與 level,或將遊戲系統設為 custom。',
          '已在 Roll20 測試表示曾在 Jumpgate 遊戲中將 XP 寫入該角色卡、角色卡本身的計算正常執行,並檢查過已擊敗的生物與升級通知。',
          '像 D&D 2024 這類 Beacon 角色卡需要 Mod sandbox v1.5,且 Mod 無法將它們設為 0 XP。',
          'Pathfinder 1E 與 Starfinder 使用角色卡上的「下一級所需 XP」欄位來發出升級通知。該欄位空白時,Pathfinder 使用中速進度,Starfinder 使用自己的表格。',
          'WFRP 4E:每次獎勵都會在角色卡的 Experience 清單中新增一列,但測試中角色卡並未重新計算 XP 總計,請在角色卡上自行檢查。',
          'Savage Worlds、13th Age、Cosmere 與 Call of Cthulhu 沒有可供 Mod 寫入的 XP。',
        ],
      },
      settings: {
        heading: '設定',
        intro: '在設定卡片上更改設定,或使用 !lazyxp set <setting> <value>。',
        colKey: '設定',
        colName: '名稱',
        colDesc: '功能',
      },
      upgrading: {
        heading: '從 0.1 升級',
        points: [
          '0.1 的設定、場次 XP 與各角色的額外 XP,會在 1.0 首次啟動時帶入。',
          '先前未啟用的玩家或角色會被排除在隊伍之外。',
          '0.1 的自訂指令名稱仍可使用。',
          '舊指令仍可使用:',
        ],
        colV1: '0.1',
        colV2: '1.0',
      },
      troubleshooting: {
        heading: '疑難排解',
        points: [
          'D&D 2024 角色卡沒有寫入任何東西:請確認遊戲使用 Mod sandbox v1.5(!lazyxp status)。',
          '生物只給 0 XP:其角色卡沒有 XP 或挑戰等級。請使用「其他數值」,或 !lazyxp kill --xp 100。',
          '沒有偵測到擊敗:請確認 HP 條是存放生命值的那一條。',
          '!xp 沒有反應:另一個 XP Mod 正在使用它。請改用 !lazyxp。',
        ],
      },
      languages: {
        heading: '語言',
        body: '用 !lazyxp lang 選擇語言。聊天卡片與講義會立即變更。',
        colLanguage: '語言',
        colNative: '名稱',
        colCode: '代碼',
      },
      credits: {
        heading: '致謝',
        original: '原作者',
        maintainer: '重寫與維護者',
        support: '歡迎到 Roll20 論壇回報錯誤與提出想法。',
      },
    },
  };

  var localeCs = {
    titles: {
      ready: 'LazyExperience je připraven.',
      help: 'Nápověda LazyExperience',
      settings: 'Nastavení LazyExperience',
      status: 'Stav LazyExperience',
      roster: 'Družina',
      language: 'Jazyk',
      levelUp: 'Nová úroveň!',
      defeated: 'Tvor poražen',
      xpAwarded: 'Zkušenosti uděleny',
      sessionEnded: 'Seance {number} skončila',
      yourXp: 'Tvé zkušenosti',
      pool: 'XP seance',
      bonus: 'Bonusové XP',
      undo: 'Zpět',
      log: 'Záznam seancí',
      partyXp: 'Zkušenosti družiny',
    },
    menu: {
      session: 'Seance',
      pool: 'XP seance',
      payout: 'Vyplaceno',
      shares: 'Podíly',
      perShare: 'XP na podíl',
      party: 'Družina ({source})',
      noParty: 'V družině zatím nikdo není. Otevři kartu Družina a přidej postavy.',
      absentTag: '(nepřítomen)',
      bonusTag: '(+{xp} bonus)',
      levelTag: 'Úroveň {level}',
      shareTag: 'Podíl {share}',
      rosterSource: 'Družina z',
      excluded: 'Vynechaní',
      blank: '(prázdné)',
      groupXp: 'Zkušenosti',
      groupParty: 'Družina',
      groupKills: 'Poražení tvorové',
      groupSheet: 'Karta postavy',
    },
    buttons: {
      menu: 'Menu',
      help: 'Nápověda',
      settings: 'Nastavení',
      status: 'Stav',
      roster: 'Družina',
      addXp: 'Přidat XP',
      killSelected: 'Poraženi: vybraní',
      bonusSelected: 'Bonus: vybraní',
      giveSelected: 'Udělit hned: vybraní',
      endSession: 'Ukončit seanci',
      undo: 'Zpět',
      show: 'XP družiny',
      log: 'Záznam seancí',
      absent: 'Nepřítomen',
      present: 'Přítomen',
      share: 'Podíl',
      exclude: 'Vynechat',
      include: 'Zahrnout',
      partyAdd: 'Přidat vybrané do družiny',
      partyRemove: 'Odebrat vybrané',
      addKill: 'Přidat {xp} XP',
      otherXp: 'Jiná hodnota',
      ignore: 'Ignorovat',
    },
    prompts: {
      xp: 'XP',
      reason: 'Důvod (volitelný)',
      share: 'Podíl (1 = plný, 0,5 = poloviční)',
      confirmEnd: 'Ukončit seanci a rozdělit XP?',
    },
    options: {
      yesNo: { yes: 'Ano', no: 'Ne' },
      payout: { end: 'Na konci seance', instant: 'Okamžitě' },
      roster: {
        auto: 'Automaticky',
        party: 'Družina Roll20',
        players: 'Postavy hráčů',
        manual: 'Vybrané PJ',
      },
      killMode: { prompt: 'Zeptat se PJ', auto: 'Přidávat automaticky', off: 'Vypnuto' },
      announce: { public: 'Všichni', whisper: 'Dotčení hráči', gm: 'Jen PJ', off: 'Vypnuto' },
      levelNotice: {
        public: 'Všichni',
        whisper: 'Hráč a PJ',
        gm: 'Jen PJ',
        off: 'Vypnuto',
      },
      system: { auto: 'Zjistit z karty' },
    },
    settings: {
      language: { label: 'Jazyk', desc: 'Jazyk karet v chatu a handoutů.' },
      payout: {
        label: 'Výplata XP',
        desc: 'end: XP se shromažďují ve fondu seance a rozdělí se po jejím skončení. instant: každá odměna se hned rozdělí a vyplatí.',
      },
      updateSheets: {
        label: 'Aktualizovat karty',
        desc: 'Zapisuje XP na karty postav. Když je vypnuto, součty se jen oznámí.',
      },
      system: {
        label: 'Herní systém',
        desc: 'Která pole karty obsahují XP a úroveň. auto vybere profil podle karty každé postavy; custom použije vlastní nastavení polí.',
      },
      roster: {
        label: 'Družina z',
        desc: 'auto: družina Roll20, pokud v ní někdo je, jinak postavy ovládané hráči. party, players nebo manual vyberou jednu z možností.',
      },
      absentShare: {
        label: 'Podíl nepřítomných',
        desc: 'Část podílu, kterou nepřítomná postava přesto dostane, od 0 % (nic) do 100 % (celý).',
      },
      extraShares: {
        label: 'Další podíly',
        desc: 'Podíly pro společníky nebo najatce, kteří nemají kartu. Jejich XP se nikomu nevyplácí.',
      },
      killMode: {
        label: 'Poražení tvorové',
        desc: 'prompt: zeptat se PJ před přidáním XP tvora. auto: přidat hned. off: nesledovat žetony.',
      },
      killBar: {
        label: 'Sledovat lištu HP',
        desc: 'Tvor se počítá jako poražený, když jeho lišta HP klesne na 0 nebo méně.',
      },
      hpBar: { label: 'Lišta HP', desc: 'Která lišta žetonu (1, 2 nebo 3) obsahuje životy.' },
      killMarker: {
        label: 'Sledovat značku',
        desc: 'Tvor se počítá jako poražený, když se na jeho žeton nasadí značka poražení.',
      },
      marker: {
        label: 'Značka poražení',
        desc: 'Značka znamenající poražení: vestavěný název, například dead, nebo název vlastní značky.',
      },
      killDeathTracker: {
        label: 'Použít DeathTracker',
        desc: 'Tvor se počítá jako poražený, když ho DeathTracker 1.0 nebo novější označí za mrtvého.',
      },
      announce: {
        label: 'Zprávy o XP',
        desc: 'Kdo vidí udělení XP a shrnutí na konci seance: public (všichni), whisper (dotčení hráči a PJ), gm nebo off.',
      },
      levelNotice: {
        label: 'Oznámení o postupu',
        desc: 'Kdo vidí oznámení o postupu na novou úroveň: public (všichni), whisper (hráč a PJ), gm nebo off.',
      },
      customXp: {
        label: 'Vlastní pole XP',
        desc: 'Pole karty s XP postavy, když je Herní systém custom. Seznam zkouší jednotlivé názvy postupně.',
      },
      customLevel: { label: 'Vlastní pole úrovně', desc: 'Pole karty s úrovní postavy.' },
      customNpcXp: {
        label: 'Vlastní pole XP tvora',
        desc: 'Pole karty s hodnotou XP tvora.',
      },
      customNpcCr: {
        label: 'Vlastní pole výzvy',
        desc: 'Pole karty s úrovní výzvy tvora, použije se, když tvor nemá hodnotu XP.',
      },
      customLevels: {
        label: 'Vlastní tabulka úrovní',
        desc: 'XP potřebné pro každou úroveň od úrovně 1, například 0,300,900,2700. Prázdné vypne oznámení o postupu pro vlastní karty.',
      },
    },
    roster: {
      explain: {
        party: 'XP se dělí mezi postavy označené v Roll20 jako Party Member.',
        players:
          'XP se dělí mezi postavy ovládané hráčem. Chceš-li použít družinu Roll20, označ u postav Party Member.',
        manual: 'XP se dělí jen mezi postavy, které zahrneš.',
      },
      selectHint: 'Nejprve vyber žetony, abys je mohl přidat do družiny nebo odebrat.',
    },
    kills: {
      prompt: '{name} byl poražen. Přidat {xp} XP do seance?',
      noXp: '{name} byl poražen, ale jeho karta nemá hodnotu XP.',
      reason: 'Poražen: {name}',
      result: {
        prompted: 'dotázáno',
        added: 'přidáno',
        counted: 'už započteno v této seanci',
        noXp: 'na kartě nejsou XP: použij --xp',
        notCreature: 'není tvor (bez karty, nebo je v družině)',
      },
    },
    levels: {
      reached: '{name} má dost XP na úroveň {level}!',
      sheetButton: 'Použij tlačítko Level Up na kartě postavy.',
      updateSheet: 'Aktualizuj úroveň na kartě postavy.',
      pf2: 'Zvyš úroveň na kartě a odečti 1000 od XP.',
      spend: 'Utrať XP a zvyš úroveň na kartě.',
    },
    instant: {
      everyone: 'Celá družina získává {xp} XP.',
      bonus: '{names} získávají {xp} XP.',
    },
    end: {
      nothing: 'V této seanci nebyly uděleny žádné XP.',
      playerLine: '{name} získává v této seanci {xp} XP.',
      playerLineTotal: '{name} získává v této seanci {xp} XP, celkem {total} XP.',
      levelLine: '{name} dosáhl úrovně {level}.',
      remainder: '{xp} XP nešlo rozdělit rovnoměrně a přenáší se do další seance.',
    },
    show: {
      noXp: 'na kartě nejsou XP',
      next: 'další úroveň při {xp}',
    },
    awardKinds: { pool: 'XP seance', bonus: 'Bonusové XP', give: 'Udělené XP' },
    messages: {
      saved: 'Uloženo.',
      commands: 'Příkazy: {commands}',
      aliasTaken: '{alias} používá {mods}. Použij !lazyxp.',
      migrated: 'Nastavení, XP seance a dodatečné XP z LazyExperience 0.1 byly převzaty.',
      handouts: 'Handouty Nápověda, Command Deck a Záznam seancí byly znovu vytvořeny.',
      noLog: 'Zatím neskončila žádná seance, takže neexistuje Záznam seancí.',
      poolAdded: 'Do seance přidáno {xp} XP.',
      bonusAdded: '{xp} bonusových XP pro: {names}.',
      killAdded: 'Do seance přidáno {xp} XP za: {name}.',
      killGone: 'Toto poražení už bylo přidáno nebo už nečeká na rozhodnutí.',
      undone: 'Vzato zpět {xp} XP ({reason}).',
      nothingToUndo: 'V této seanci není co vracet.',
      nothingToUndoInstant: 'XP už byly vyplaceny. Oprav to příkazem give se zápornou hodnotou.',
      sessionReset: 'XP seance a bonusy byly vymazány. Nic nebylo vyplaceno.',
      absent: 'Označeni jako nepřítomní v této seanci: {names}.',
      present: 'Označeni jako přítomní: {names}.',
      party: {
        add: 'Přidáni do družiny: {names}.',
        remove: 'Odebráni z družiny: {names}.',
      },
    },
    warnings: {
      sandbox:
        'Některé postavy používají kartu Beacon (například D&D 2024), kterou Mod sandbox umí číst a zapisovat jen ve verzi v1.5. V nastavení Modů hry vyber sandbox v1.5.',
      partyLegacy:
        'Družina Roll20 je funkce Jumpgate; v této hře si mod vede vlastní seznam družiny.',
      nobodyToPay: 'V družině nikdo není, takže {xp} XP zůstává na později.',
      write: {
        zero: '{name}: Mod nemůže nastavit kartu na 0 XP. Změň to na kartě.',
        sandbox: '{name}: tato karta potřebuje k aktualizaci XP Mod sandbox v1.5.',
        xpless: '{name}: tento herní systém XP nepoužívá (nebo si je karta počítá sama).',
        noField:
          '{name}: pro tuto kartu není známo pole XP. Nastav Herní systém na custom a zadej název pole.',
        error: '{name}: kartu se nepodařilo aktualizovat o {xp} XP. Podívej se do konzole Modů.',
      },
    },
    errors: {
      gmOnly: 'Příkazy LazyExperience může používat jen PJ.',
      failed: 'Něco se pokazilo: {message}',
      unknownCommand: 'Neznámý příkaz "{name}".',
      helpHint: 'Příkazy zobrazíš zadáním {command} help.',
      unknownSetting: 'Neznámé nastavení "{name}".',
      settingsHint: 'Nastavení zobrazíš otevřením karty nastavení.',
      badValue: '"{value}" není platná hodnota pro {name}.',
      badXp: 'Zadej XP jako celé číslo, například 250.',
      badShare: 'Zadej podíl jako číslo od 0 do 10, například 0.5 nebo 50%.',
      noCharacters: 'Vyber žetony představující postavy, nebo použij --ids.',
      noTokens: 'Nejprve vyber poražené žetony, nebo použij --ids.',
    },
    status: {
      version: 'Verze',
      sandbox: 'Mod sandbox',
      beacon: 'Karty Beacon lze číst',
      commands: 'Příkazy',
      profiles: 'Používané herní systémy',
      characters: 'Postav: {count}',
      handouts: 'Viz handouty {help} a {deck}.',
    },
    log: {
      title: 'Záznam seancí',
      sessionHeading: 'Seance {number} — {date}',
      colCharacter: 'Postava',
      colXp: 'XP',
      awards: 'Odměny',
      levelUps: 'Úrovně:',
      empty: 'Zatím neskončila žádná seance.',
    },
    help: {
      menu: 'Zobrazí hlavní menu.',
      add: 'Přidá XP do fondu seance, volitelně s důvodem.',
      bonus: 'Udělí vybraným postavám bonusové XP navíc ke svému podílu.',
      give: 'Okamžitě vyplatí XP vybraným postavám.',
      kill: 'Započítá vybrané žetony jako poražené a přidá jejich XP.',
      killConfirm: 'Přidá XP poraženého tvora (tlačítko z dotazu), volitelně s jinou hodnotou.',
      absent: 'Označí vybrané postavy jako nepřítomné v této seanci.',
      present: 'Označí vybrané postavy znovu jako přítomné.',
      share: 'Nastaví podíl vybraných postav (1 = plný).',
      exclude: 'Vynechá postavy z družiny, nebo je znovu zahrne.',
      undo: 'Vezme zpět poslední odměnu, která ještě nebyla vyplacena.',
      end: 'Ukončí seanci: vyplatí XP, oznámí je a zapíše do záznamu.',
      resetSession: 'Vymaže XP seance bez vyplacení.',
      show: 'Zobrazí XP a úroveň každého člena družiny z karty.',
      roster: 'Zobrazí kartu družiny.',
      party: 'Zaškrtne nebo odškrtne políčko Party Member v Roll20 u vybraných postav.',
      settings: 'Zobrazí kartu nastavení.',
      set: 'Změní nastavení.',
      lang: 'Vybere jazyk.',
      status: 'Zobrazí sandbox, příkazy a používané herní systémy.',
      log: 'Odkaz na handout Záznam seancí.',
      journal: 'Znovu vytvoří handouty.',
      help: 'Zobrazí tuto nápovědu.',
      handouts: 'Více v handoutech {help} a {deck}.',
    },
    deck: {
      session: 'Seance',
      sessionDesc: 'Přidej XP do seance, zkontroluj družinu a ukonči seanci.',
      selected: 'Vybrané žetony',
      selectedDesc: 'Nejprve vyber žetony na mapě.',
      party: 'Družina',
      partyDesc: 'Kdo dělí XP.',
      tools: 'Nástroje',
      toolsDesc: 'Nastavení, stav a nápověda.',
      footer: 'Tlačítka spouštějí příkazy LazyExperience. Podrobnosti v handoutu {help}.',
    },
    handout: {
      versionLabel: 'Verze',
      subtitle: 'Zkušenosti ze seance, spravedlivě rozdělené, na jakékoli kartě',
      footer: 'Tlačítka pro všechny příkazy jsou v handoutu {deck}.',
      overview: {
        heading: 'Přehled',
        body: 'LazyExperience shromažďuje zkušenostní body získané během seance, rozděluje je mezi družinu a zapisuje je na karty postav. Čte a zapisuje kartu D&D 2024 i starší a jiné karty, využívá družinu Roll20, všímá si poražených tvorů, zvládá nepřítomné hráče a bonusové XP, oznamuje postup na novou úroveň a vede záznam o každé seanci.',
      },
      quickStart: {
        heading: 'Rychlý start',
        steps: [
          'Zaškrtni Party Member u každé hráčské postavy (v nastavení okna postavy), nebo to nech: použijí se postavy ovládané hráči.',
          'Menu otevřeš zadáním !lazyxp.',
          'Když družina porazí tvora, pokles jeho lišty HP na 0 vyvolá dotaz, zda přidat jeho XP. Můžeš také vybrat žetony a stisknout Poraženi: vybraní.',
          'XP za cokoli jiného přidáš tlačítkem Přidat XP a bonusové XP pro jednu postavu tlačítkem Bonus: vybraní.',
          'Hráče, kteří seanci zameškali, označ jako Nepřítomen.',
          'Stiskni Ukončit seanci. Podíl každého se zapíše na jeho kartu, oznámí se a přidá do handoutu Záznam seancí.',
        ],
      },
      commands: {
        heading: 'Příkazy',
        intro:
          'Každý příkaz začíná !lazyxp; funguje i {long} a také {short}, pokud ho nepoužívá jiný Mod pro XP. Smí je používat jen PJ.',
        targets:
          'Příkazy pro postavy používají vybrané žetony, nebo --ids následované ID postav či žetonů oddělenými čárkami.',
        colCommand: 'Příkaz',
        colDesc: 'Co dělá',
      },
      party: {
        heading: 'Družina',
        points: [
          'Automaticky: když je jakákoli postava v Roll20 (Jumpgate) označena jako Party Member, XP se dělí mezi družinu Roll20; jinak mezi všechny postavy ovládané hráčem.',
          'Postavy ovládané pouze skupinou "All players", například pomocné žetony, se nepočítají.',
          'Přidání do družiny a odebrání z družiny zaškrtne nebo odškrtne Party Member u vybraných postav.',
          'Vynechat odebere postavu z družiny natrvalo; Zahrnout ji vrátí.',
          'Postava ovládaná více hráči se počítá jednou.',
        ],
      },
      splitting: {
        heading: 'Dělení XP',
        points: [
          'XP seance se dělí počtem podílů: jeden na člena družiny plus případné další podíly.',
          'Nepřítomné postavy dostanou hodnotu nastavení Podíl nepřítomných (ve výchozím stavu 0 %). Nepřítomnost platí jednu seanci.',
          'Postava může mít jiný podíl, například 0,5 pro pomocníka.',
          'Bonusové XP jde vybraným postavám navíc ke svému podílu.',
          'XP, které nejde rozdělit rovnoměrně, se přenáší do další seance.',
          'Při Výplatě XP nastavené na instant se každá odměna rozdělí a vyplatí hned.',
        ],
      },
      kills: {
        heading: 'Poražení tvorové',
        points: [
          'Tvor se počítá jako poražený, když jeho lišta HP klesne na 0, když se nasadí značka poražení, nebo když ho DeathTracker označí za mrtvého.',
          'Zaznamenají se i změny provedené přes TokenMod, kartu nebo jiné Mody pomocí propojeného atributu.',
          'Počítají se jen žetony postav mimo družinu, které žádný hráč neovládá, a každý žeton jen jednou za seanci.',
          'XP se berou z karty: hodnota XP tvora nebo jeho úroveň výzvy.',
          'Zeptat se PJ (výchozí) pošle šeptem dotaz s tlačítky Přidat, Jiná hodnota a Ignorovat. Přidávat automaticky dotaz přeskočí.',
        ],
      },
      levels: {
        heading: 'Postup na vyšší úroveň',
        points: [
          'Po zapsání XP LazyExperience zkontroluje tabulku úrovní systému a oznámí, když má postava dost XP na novou úroveň.',
          'Na kartě D&D 2024 pak hráč stiskne tlačítko Level Up na kartě.',
        ],
      },
      systems: {
        heading: 'Herní systémy',
        intro:
          'LazyExperience vybírá profil podle karty každé postavy. Nastav Herní systém, abys jeden vynutil, nebo custom, abys pole pojmenoval sám.',
        colSystem: 'Systém',
        colId: 'ID',
        colSheets: 'Karty',
        colChecked: 'Ověřeno',
        verified: {
          live: 'Otestováno v Roll20',
          partial: 'Částečně otestováno v Roll20',
          source: 'Ze zdroje karty',
          none: '—',
        },
        points: [
          'Kartu vyber podle jejího názvu v Nastavení hry. Karty, které nejsou na seznamu, používají běžné názvy polí experience, xp a level, nebo nastav Herní systém na custom.',
          'Otestováno v Roll20 znamená, že se XP zapsaly na tu kartu ve hře Jumpgate, proběhly vlastní výpočty karty a ověřilo se, jak fungují poražení tvorové a oznámení o postupu.',
          'Karty Beacon, například D&D 2024, vyžadují Mod sandbox v1.5 a Mod je nemůže nastavit na 0 XP.',
          'Pathfinder 1E a Starfinder používají pro oznámení o postupu políčko karty s XP do další úrovně. Když je prázdné, Pathfinder použije střední postup a Starfinder vlastní tabulku.',
          'WFRP 4E: každá odměna se přidá jako řádek do seznamu Experience na kartě, ale karta si při testování nepřepočítala součty XP, proto je zkontroluj na kartě.',
          'Savage Worlds, 13th Age, Cosmere a Call of Cthulhu nemají žádné XP, které by Mod mohl zapsat.',
        ],
      },
      settings: {
        heading: 'Nastavení',
        intro: 'Nastavení měň na kartě nastavení nebo příkazem !lazyxp set <setting> <value>.',
        colKey: 'Nastavení',
        colName: 'Název',
        colDesc: 'Co dělá',
      },
      upgrading: {
        heading: 'Přechod z verze 0.1',
        points: [
          'Nastavení, XP seance a dodatečné XP jednotlivých postav z verze 0.1 se převezmou při prvním spuštění verze 1.0.',
          'Hráči nebo postavy, kteří nebyli aktivní, se z družiny vynechají.',
          'Vlastní název příkazu z verze 0.1 dál funguje.',
          'Staré příkazy dál fungují:',
        ],
        colV1: '0.1',
        colV2: '1.0',
      },
      troubleshooting: {
        heading: 'Řešení problémů',
        points: [
          'Na karty D&D 2024 se nic nezapisuje: zkontroluj, že hra používá Mod sandbox v1.5 (!lazyxp status).',
          'Tvor dává 0 XP: jeho karta nemá XP ani úroveň výzvy. Použij Jiná hodnota, nebo !lazyxp kill --xp 100.',
          'Poražení se nezaznamenávají: zkontroluj, že Lišta HP je lišta, která obsahuje životy.',
          '!xp nic nedělá: používá ho jiný Mod pro XP. Použij !lazyxp.',
        ],
      },
      languages: {
        heading: 'Jazyky',
        body: 'Jazyk vybereš příkazem !lazyxp lang. Karty v chatu a handouty se změní okamžitě.',
        colLanguage: 'Jazyk',
        colNative: 'Název',
        colCode: 'Kód',
      },
      credits: {
        heading: 'Autoři',
        original: 'Vytvořil',
        maintainer: 'Přepsal a udržuje',
        support: 'Hlášení chyb a nápady jsou vítány na fóru Roll20.',
      },
    },
  };

  var localeDa = {
    titles: {
      ready: 'LazyExperience er klar.',
      help: 'LazyExperience Hjælp',
      settings: 'LazyExperience Indstillinger',
      status: 'LazyExperience Status',
      roster: 'Gruppen',
      language: 'Sprog',
      levelUp: 'Niveaustigning!',
      defeated: 'Væsen besejret',
      xpAwarded: 'Erfaring tildelt',
      sessionEnded: 'Session {number} afsluttet',
      yourXp: 'Din erfaring',
      pool: 'Sessionens XP',
      bonus: 'Bonus-XP',
      undo: 'Fortryd',
      log: 'Sessionslog',
      partyXp: 'Gruppens erfaring',
    },
    menu: {
      session: 'Session',
      pool: 'Sessionens XP',
      payout: 'Udbetalt',
      shares: 'Andele',
      perShare: 'XP pr. andel',
      party: 'Gruppe ({source})',
      noParty: 'Ingen er med i gruppen endnu. Åbn gruppekortet for at tilføje karakterer.',
      absentTag: '(fraværende)',
      bonusTag: '(+{xp} bonus)',
      levelTag: 'Niveau {level}',
      shareTag: 'Andel {share}',
      rosterSource: 'Gruppe fra',
      excluded: 'Udeladt',
      blank: '(tom)',
      groupXp: 'Erfaring',
      groupParty: 'Gruppe',
      groupKills: 'Besejrede væsener',
      groupSheet: 'Karakterark',
    },
    buttons: {
      menu: 'Menu',
      help: 'Hjælp',
      settings: 'Indstillinger',
      status: 'Status',
      roster: 'Gruppe',
      addXp: 'Tilføj XP',
      killSelected: 'Besejret: Valgte',
      bonusSelected: 'Bonus: Valgte',
      giveSelected: 'Giv nu: Valgte',
      endSession: 'Afslut session',
      undo: 'Fortryd',
      show: 'Gruppens XP',
      log: 'Sessionslog',
      absent: 'Fraværende',
      present: 'Til stede',
      share: 'Andel',
      exclude: 'Udelad',
      include: 'Tag med',
      partyAdd: 'Tilføj valgte til gruppen',
      partyRemove: 'Fjern valgte',
      addKill: 'Tilføj {xp} XP',
      otherXp: 'Andet beløb',
      ignore: 'Ignorer',
    },
    prompts: {
      xp: 'XP',
      reason: 'Årsag (valgfri)',
      share: 'Andel (1 = hel, 0,5 = halv)',
      confirmEnd: 'Afslutte sessionen og dele XP ud?',
    },
    options: {
      yesNo: { yes: 'Ja', no: 'Nej' },
      payout: { end: 'Ved sessionens slutning', instant: 'Med det samme' },
      roster: {
        auto: 'Automatisk',
        party: 'Roll20-gruppe',
        players: 'Spillernes karakterer',
        manual: 'Valgt af spilleder',
      },
      killMode: { prompt: 'Spørg spilleder', auto: 'Tilføj automatisk', off: 'Fra' },
      announce: { public: 'Alle', whisper: 'Berørte spillere', gm: 'Kun spilleder', off: 'Fra' },
      levelNotice: {
        public: 'Alle',
        whisper: 'Spilleren og spilleder',
        gm: 'Kun spilleder',
        off: 'Fra',
      },
      system: { auto: 'Find ud fra arket' },
    },
    settings: {
      language: { label: 'Sprog', desc: 'Sprog til chatkort og handouts.' },
      payout: {
        label: 'Udbetal XP',
        desc: 'end: XP samles i sessionens pulje og deles ud, når sessionen slutter. instant: hver tildeling deles og udbetales med det samme.',
      },
      updateSheets: {
        label: 'Opdater ark',
        desc: 'Skriv XP til karakterarkene. Når det er slået fra, meldes kun totalerne.',
      },
      system: {
        label: 'Spilsystem',
        desc: 'Hvilke arkfelter der indeholder XP og niveau. auto vælger profilen ud fra hver karakters ark; custom bruger indstillingerne for egne felter.',
      },
      roster: {
        label: 'Gruppe fra',
        desc: 'auto: Roll20-gruppen, hvis nogen er med i den, ellers karakterer styret af spillere. party, players eller manual vælger én af dem.',
      },
      absentShare: {
        label: 'Fraværsandel',
        desc: 'Den del af en andel, en fraværende karakter stadig får, fra 0 % (ingen) til 100 % (hel).',
      },
      extraShares: {
        label: 'Ekstra andele',
        desc: 'Andele til ledsagere eller lejesvende, som ikke står på et ark. Deres XP udbetales ikke til nogen.',
      },
      killMode: {
        label: 'Besejrede væsener',
        desc: 'prompt: spørg spilleder, før et væsens XP tilføjes. auto: tilføj med det samme. off: overvåg ikke tokens.',
      },
      killBar: {
        label: 'Overvåg HP-bjælke',
        desc: 'Tæl et væsen som besejret, når dets HP-bjælke falder til 0 eller derunder.',
      },
      hpBar: {
        label: 'HP-bjælke',
        desc: 'Hvilken token-bjælke (1, 2 eller 3) der indeholder hitpoint.',
      },
      killMarker: {
        label: 'Overvåg markør',
        desc: 'Tæl et væsen som besejret, når markøren for besejret sættes på dets token.',
      },
      marker: {
        label: 'Markør for besejret',
        desc: 'Markøren, der betyder besejret: et indbygget navn som dead eller navnet på en egen markør.',
      },
      killDeathTracker: {
        label: 'Brug DeathTracker',
        desc: 'Tæl et væsen som besejret, når DeathTracker 1.0 eller nyere markerer det som dødt.',
      },
      announce: {
        label: 'XP-beskeder',
        desc: 'Hvem der ser XP-tildelinger og opsummeringen ved sessionens slutning: public, whisper (berørte spillere og spilleder), gm eller off.',
      },
      levelNotice: {
        label: 'Niveaumeddelelser',
        desc: 'Hvem der ser niveaumeddelelser: public, whisper (spilleren og spilleder), gm eller off.',
      },
      customXp: {
        label: 'Eget XP-felt',
        desc: 'Arkfelt til en karakters XP, når Spilsystem er custom. En liste prøver hvert navn efter tur.',
      },
      customLevel: { label: 'Eget niveaufelt', desc: 'Arkfelt til en karakters niveau.' },
      customNpcXp: {
        label: 'Eget XP-felt for væsener',
        desc: 'Arkfelt til den XP, et væsen er værd.',
      },
      customNpcCr: {
        label: 'Eget udfordringsfelt',
        desc: 'Arkfelt til et væsens udfordringsgrad, som bruges, når det ikke har nogen XP-værdi.',
      },
      customLevels: {
        label: 'Egen niveautabel',
        desc: 'XP, der skal til for hvert niveau, fra niveau 1, fx 0,300,900,2700. Tom slår niveaumeddelelser fra for egne ark.',
      },
    },
    roster: {
      explain: {
        party: 'Karakterer, der er afkrydset som Party Member i Roll20, deler XP.',
        players:
          'Karakterer, der styres af en spiller, deler XP. Sæt kryds ved Party Member på karakterer for at bruge Roll20-gruppen i stedet.',
        manual: 'Kun karakterer, du tager med, deler XP.',
      },
      selectHint: 'Vælg tokens først for at tilføje dem til gruppen eller fjerne dem.',
    },
    kills: {
      prompt: '{name} blev besejret. Tilføje {xp} XP til sessionen?',
      noXp: '{name} blev besejret, men dets ark har ingen XP-værdi.',
      reason: 'Besejrede {name}',
      result: {
        prompted: 'spurgt',
        added: 'tilføjet',
        counted: 'allerede talt med i denne session',
        noXp: 'ingen XP på arket: brug --xp',
        notCreature: 'ikke et væsen (intet ark, eller med i gruppen)',
      },
    },
    levels: {
      reached: '{name} har nok XP til niveau {level}!',
      sheetButton: 'Brug knappen til niveaustigning på karakterarket.',
      updateSheet: 'Opdater niveauet på karakterarket.',
      pf2: 'Hæv niveauet på arket, og træk 1.000 fra XP.',
      spend: 'Brug XP, og hæv niveauet på arket.',
    },
    instant: {
      everyone: 'Alle i gruppen får {xp} XP.',
      bonus: '{names} får {xp} XP.',
    },
    end: {
      nothing: 'Der blev ikke uddelt XP i denne session.',
      playerLine: '{name} får {xp} XP i denne session.',
      playerLineTotal: '{name} får {xp} XP i denne session, i alt {total} XP.',
      levelLine: '{name} nåede niveau {level}.',
      remainder: '{xp} XP kunne ikke deles jævnt og overføres til næste session.',
    },
    show: {
      noXp: 'ingen XP på arket',
      next: 'næste niveau ved {xp}',
    },
    awardKinds: { pool: 'Sessionens XP', bonus: 'Bonus-XP', give: 'Givet XP' },
    messages: {
      saved: 'Gemt.',
      commands: 'Kommandoer: {commands}',
      aliasTaken: '{alias} er overladt til {mods}. Brug !lazyxp.',
      migrated:
        'Dine indstillinger, sessions-XP og ekstra XP fra LazyExperience 0.1 er blevet overført.',
      handouts: 'Handouts til Hjælp, Command Deck og Sessionslog er blevet bygget om.',
      noLog: 'Ingen session er afsluttet endnu, så der er ingen sessionslog.',
      poolAdded: '{xp} XP tilføjet til sessionen.',
      bonusAdded: '{xp} bonus-XP til {names}.',
      killAdded: '{xp} XP for {name} tilføjet til sessionen.',
      killGone: 'Det nederlag er allerede tilføjet eller afventer ikke længere.',
      undone: 'Tog {xp} XP tilbage ({reason}).',
      nothingToUndo: 'Der er intet at fortryde i denne session.',
      nothingToUndoInstant:
        'XP er allerede udbetalt. Brug give med et negativt beløb for at rette det.',
      sessionReset: 'Sessionens XP og bonusser blev ryddet. Intet blev udbetalt.',
      absent: 'Markeret som fraværende i denne session: {names}.',
      present: 'Markeret som til stede: {names}.',
      party: {
        add: 'Tilføjet til gruppen: {names}.',
        remove: 'Fjernet fra gruppen: {names}.',
      },
    },
    warnings: {
      sandbox:
        'Nogle karakterer bruger et Beacon-ark (fx D&D 2024), som Mod sandbox kun kan læse og skrive på v1.5. Vælg sandbox v1.5 i spillets Mod-indstillinger.',
      partyLegacy:
        'Roll20-gruppen er en Jumpgate-funktion; i dette spil har moddet sin egen gruppeliste.',
      nobodyToPay: 'Ingen er med i gruppen, så {xp} XP gemmes til senere.',
      write: {
        zero: '{name}: arket kan ikke sættes til 0 XP fra et Mod. Ret det på arket.',
        sandbox: '{name}: dette ark kræver Mod sandbox v1.5 for at opdatere XP.',
        xpless: '{name}: dette spilsystem bruger ikke XP (eller arket regner det selv ud).',
        noField:
          '{name}: intet XP-felt er kendt for dette ark. Sæt Spilsystem til custom, og angiv feltet.',
        error: '{name}: arket kunne ikke opdateres med {xp} XP. Se Mod-konsollen.',
      },
    },
    errors: {
      gmOnly: 'Kun spilleder kan bruge LazyExperience-kommandoer.',
      failed: 'Noget gik galt: {message}',
      unknownCommand: 'Ukendt kommando "{name}".',
      helpHint: 'Skriv {command} help for at se kommandoerne.',
      unknownSetting: 'Ukendt indstilling "{name}".',
      settingsHint: 'Åbn indstillingskortet for at se indstillingerne.',
      badValue: '"{value}" er ikke en gyldig værdi for {name}.',
      badXp: 'Angiv XP som et helt tal, fx 250.',
      badShare: 'Angiv andelen som et tal fra 0 til 10, fx 0,5 eller 50 %.',
      noCharacters: 'Vælg tokens, der står for karakterer, eller brug --ids.',
      noTokens: 'Vælg de besejrede tokens først, eller brug --ids.',
    },
    status: {
      version: 'Version',
      sandbox: 'Mod sandbox',
      beacon: 'Beacon-ark kan læses',
      commands: 'Kommandoer',
      profiles: 'Spilsystemer i brug',
      characters: '{count} karakterer',
      handouts: 'Se handouts {help} og {deck}.',
    },
    log: {
      title: 'Sessionslog',
      sessionHeading: 'Session {number} — {date}',
      colCharacter: 'Karakter',
      colXp: 'XP',
      awards: 'Tildelinger',
      levelUps: 'Niveauer:',
      empty: 'Ingen session er afsluttet endnu.',
    },
    help: {
      menu: 'Vis hovedmenuen.',
      add: 'Tilføj XP til sessionens pulje, med en valgfri årsag.',
      bonus: 'Giv de valgte karakterer bonus-XP oveni deres andel.',
      give: 'Udbetal XP til de valgte karakterer med det samme.',
      kill: 'Tæl de valgte tokens som besejret, og tilføj deres XP.',
      killConfirm:
        'Tilføj et besejret væsens XP (knappen i spørgsmålet), eventuelt med et andet beløb.',
      absent: 'Markér de valgte karakterer som fraværende i denne session.',
      present: 'Markér de valgte karakterer som til stede igen.',
      share: 'Angiv de valgte karakterers andel (1 = hel).',
      exclude: 'Udelad karakterer fra gruppen, eller tag dem med igen.',
      undo: 'Tag den seneste tildeling tilbage, som ikke er udbetalt.',
      end: 'Afslut sessionen: udbetal XP, meld det og log det.',
      resetSession: 'Ryd sessionens XP uden at udbetale den.',
      show: 'Vis hvert gruppemedlems XP og niveau fra arket.',
      roster: 'Vis gruppekortet.',
      party: 'Sæt eller fjern kryds i Roll20s felt Party Member for de valgte karakterer.',
      settings: 'Vis indstillingskortet.',
      set: 'Ændr en indstilling.',
      lang: 'Vælg sprog.',
      status: 'Vis sandbox, kommandoer og spilsystemer i brug.',
      log: 'Link til handouten Sessionslog.',
      journal: 'Byg handouts om.',
      help: 'Vis denne hjælp.',
      handouts: 'Mere i handouts {help} og {deck}.',
    },
    deck: {
      session: 'Session',
      sessionDesc: 'Tilføj XP til sessionen, tjek gruppen, og afslut sessionen.',
      selected: 'Valgte tokens',
      selectedDesc: 'Vælg først tokens på kortet.',
      party: 'Gruppe',
      partyDesc: 'Hvem der deler XP.',
      tools: 'Værktøjer',
      toolsDesc: 'Indstillinger, status og hjælp.',
      footer: 'Knapperne kører LazyExperience-kommandoer. Se handouten {help} for detaljer.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Sessionens erfaring, fordelt retfærdigt, på ethvert ark',
      footer: 'Knapper til alle kommandoer findes i handouten {deck}.',
      overview: {
        heading: 'Overblik',
        body: 'LazyExperience samler de erfaringspoint, der optjenes i løbet af en session, deler dem mellem gruppen og skriver dem til karakterarkene. Det læser og skriver D&D 2024-arket såvel som ældre og andre ark, bruger Roll20s egen gruppe, bemærker besejrede væsener, håndterer fraværende spillere og bonus-XP, melder niveaustigninger og fører log over hver session.',
      },
      quickStart: {
        heading: 'Hurtig start',
        steps: [
          'Sæt kryds ved Party Member på hver spillerkarakter (i karaktervinduets indstillinger), eller lad være: karakterer styret af spillere bruges.',
          'Skriv !lazyxp for at åbne menuen.',
          'Når gruppen besejrer et væsen, spørger systemet, om du vil tilføje dets XP, når dets HP-bjælke når 0. Du kan også vælge tokens og trykke på Besejret: Valgte.',
          'Tilføj XP for alt andet med Tilføj XP, og bonus-XP til én karakter med Bonus: Valgte.',
          'Markér spillere, der missede sessionen, som Fraværende.',
          'Tryk på Afslut session. Alles andel skrives til deres ark, meldes og tilføjes til handouten Sessionslog.',
        ],
      },
      commands: {
        heading: 'Kommandoer',
        intro:
          'Hver kommando begynder med !lazyxp; {long} virker også, og det gør {short}, så længe intet andet XP-Mod bruger det. Kun spilleder kan bruge dem.',
        targets:
          "Kommandoer til karakterer bruger de valgte tokens, eller --ids efterfulgt af karakter- eller token-ID'er adskilt af kommaer.",
        colCommand: 'Kommando',
        colDesc: 'Hvad den gør',
      },
      party: {
        heading: 'Gruppen',
        points: [
          'Automatisk: når en karakter er afkrydset som Party Member i Roll20 (Jumpgate), deler Roll20-gruppen XP; ellers gør hver karakter, der styres af en spiller, det.',
          'Karakterer, der kun styres af "All players", fx hjælpetokens, tælles ikke med.',
          'Gruppe tilføj og Gruppe fjern sætter eller fjerner kryds i Party Member for de valgte karakterer.',
          'Udelad tager en karakter ud af gruppen for godt; Tag med sætter den tilbage.',
          'En karakter, der styres af flere spillere, tæller én gang.',
        ],
      },
      splitting: {
        heading: 'Deling af XP',
        points: [
          'Sessionens XP deles med antallet af andele: én pr. gruppemedlem plus eventuelle ekstra andele.',
          'Fraværende karakterer får indstillingen Fraværsandel (0 % som standard). Fravær varer én session.',
          'En karakter kan have en anden andel, fx 0,5 til en hjælper.',
          'Bonus-XP går til de valgte karakterer oveni deres andel.',
          'XP, der ikke kan deles jævnt, overføres til næste session.',
          'Med Udbetal XP sat til instant deles og udbetales hver tildeling med det samme.',
        ],
      },
      kills: {
        heading: 'Besejrede væsener',
        points: [
          'Et væsen tæller som besejret, når dets HP-bjælke falder til 0, når markøren for besejret sættes på, eller når DeathTracker markerer det som dødt.',
          'Ændringer foretaget af TokenMod, af arket eller af andre Mods via den tilknyttede attribut opdages også.',
          'Kun tokens for karakterer uden for gruppen, som ingen spiller styrer, tælles, og hver token kun én gang pr. session.',
          'XP kommer fra arket: væsnets XP-værdi eller dets udfordringsgrad.',
          'Spørg spilleder (standard) hvisker et spørgsmål med Tilføj, Andet beløb og Ignorer. Tilføj automatisk springer spørgsmålet over.',
        ],
      },
      levels: {
        heading: 'Niveaustigninger',
        points: [
          'Når XP er skrevet, tjekker LazyExperience systemets niveautabel og melder, når en karakter har nok XP til et nyt niveau.',
          'På D&D 2024-arket trykker spilleren derefter på arkets knap til niveaustigning.',
        ],
      },
      systems: {
        heading: 'Spilsystemer',
        intro:
          'LazyExperience vælger en profil ud fra hver karakters ark. Sæt Spilsystem for at tvinge én, eller til custom for selv at angive felterne.',
        colSystem: 'System',
        colId: 'ID',
        colSheets: 'Ark',
        colChecked: 'Kontrolleret',
        verified: {
          live: 'Testet i Roll20',
          partial: 'Delvist testet i Roll20',
          source: 'Fra arkets kildekode',
          none: '—',
        },
        points: [
          'Vælg arket ud fra dets navn i spillets Indstillinger. Ark, der ikke er på listen, bruger de almindelige feltnavne experience, xp og level, eller sæt Spilsystem til custom.',
          'Testet i Roll20 betyder, at XP blev skrevet til det ark i et Jumpgate-spil, arkets egne beregninger kørte, og besejrede væsener og niveaumeddelelser blev kontrolleret.',
          'Beacon-ark som D&D 2024 kræver Mod sandbox v1.5, og et Mod kan ikke sætte dem til 0 XP.',
          'Pathfinder 1E og Starfinder bruger arkets felt for XP til næste niveau til niveaumeddelelser. Når det er tomt, bruger Pathfinder det mellemste forløb, og Starfinder sin egen tabel.',
          'WFRP 4E: hver tildeling tilføjes som en række i arkets Experience-liste, men arket genberegnede ikke sine XP-totaler under test, så tjek dem på arket.',
          'Savage Worlds, 13th Age, Cosmere og Call of Cthulhu har ingen XP, som et Mod kan skrive.',
        ],
      },
      settings: {
        heading: 'Indstillinger',
        intro: 'Ændr indstillinger på indstillingskortet, eller med !lazyxp set <setting> <value>.',
        colKey: 'Indstilling',
        colName: 'Navn',
        colDesc: 'Hvad den gør',
      },
      upgrading: {
        heading: 'Opgradering fra 0.1',
        points: [
          'Indstillinger, sessions-XP og ekstra XP pr. karakter fra 0.1 overføres, første gang 1.0 starter.',
          'Spillere eller karakterer, der ikke var aktive, udelades fra gruppen.',
          'Et eget kommandonavn fra 0.1 bliver ved med at virke.',
          'De gamle kommandoer virker stadig:',
        ],
        colV1: '0.1',
        colV2: '1.0',
      },
      troubleshooting: {
        heading: 'Fejlfinding',
        points: [
          'Der skrives intet til D&D 2024-ark: tjek, at spillet bruger Mod sandbox v1.5 (!lazyxp status).',
          'Et væsen giver 0 XP: dets ark har hverken XP eller udfordringsgrad. Brug Andet beløb, eller !lazyxp kill --xp 100.',
          'Nederlag opdages ikke: tjek, at HP-bjælke er den bjælke, der indeholder hitpoint.',
          '!xp gør ingenting: et andet XP-Mod bruger det. Brug !lazyxp.',
        ],
      },
      languages: {
        heading: 'Sprog',
        body: 'Vælg sprog med !lazyxp lang. Chatkort og handouts skifter med det samme.',
        colLanguage: 'Sprog',
        colNative: 'Navn',
        colCode: 'Kode',
      },
      credits: {
        heading: 'Tak til',
        original: 'Skabt af',
        maintainer: 'Omskrevet og vedligeholdt af',
        support: 'Fejlrapporter og idéer er velkomne på Roll20-forummet.',
      },
    },
  };

  var localeNl = {
    titles: {
      ready: 'LazyExperience is klaar.',
      help: 'LazyExperience-help',
      settings: 'LazyExperience-instellingen',
      status: 'LazyExperience-status',
      roster: 'Groep',
      language: 'Taal',
      levelUp: 'Niveau omhoog!',
      defeated: 'Wezen verslagen',
      xpAwarded: 'Ervaring toegekend',
      sessionEnded: 'Sessie {number} afgelopen',
      yourXp: 'Jouw ervaring',
      pool: 'Sessie-XP',
      bonus: 'Bonus-XP',
      undo: 'Ongedaan maken',
      log: 'Sessielogboek',
      partyXp: 'Groepservaring',
    },
    menu: {
      session: 'Sessie',
      pool: 'Sessie-XP',
      payout: 'Uitbetaald',
      shares: 'Aandelen',
      perShare: 'XP per aandeel',
      party: 'Groep ({source})',
      noParty: 'Er zit nog niemand in de groep. Open de groepskaart om personages toe te voegen.',
      absentTag: '(afwezig)',
      bonusTag: '(+{xp} bonus)',
      levelTag: 'Niveau {level}',
      shareTag: 'Aandeel {share}',
      rosterSource: 'Groep uit',
      excluded: 'Uitgesloten',
      blank: '(leeg)',
      groupXp: 'Ervaring',
      groupParty: 'Groep',
      groupKills: 'Verslagen wezens',
      groupSheet: 'Personagesheet',
    },
    buttons: {
      menu: 'Menu',
      help: 'Help',
      settings: 'Instellingen',
      status: 'Status',
      roster: 'Groep',
      addXp: 'XP toevoegen',
      killSelected: 'Verslagen: geselecteerd',
      bonusSelected: 'Bonus: geselecteerd',
      giveSelected: 'Nu geven: geselecteerd',
      endSession: 'Sessie afronden',
      undo: 'Ongedaan maken',
      show: 'Groeps-XP',
      log: 'Sessielogboek',
      absent: 'Afwezig',
      present: 'Aanwezig',
      share: 'Aandeel',
      exclude: 'Uitsluiten',
      include: 'Opnemen',
      partyAdd: 'Selectie aan groep toevoegen',
      partyRemove: 'Selectie verwijderen',
      addKill: '{xp} XP toevoegen',
      otherXp: 'Ander bedrag',
      ignore: 'Negeren',
    },
    prompts: {
      xp: 'XP',
      reason: 'Reden (optioneel)',
      share: 'Aandeel (1 = volledig, 0,5 = half)',
      confirmEnd: 'De sessie afronden en de XP uitdelen?',
    },
    options: {
      yesNo: { yes: 'Ja', no: 'Nee' },
      payout: { end: 'Aan het einde van de sessie', instant: 'Meteen' },
      roster: {
        auto: 'Automatisch',
        party: 'Roll20-groep',
        players: 'Personages van spelers',
        manual: 'Gekozen door de SL',
      },
      killMode: { prompt: 'Vraag de SL', auto: 'Automatisch toevoegen', off: 'Uit' },
      announce: {
        public: 'Iedereen',
        whisper: 'De betrokken spelers',
        gm: 'Alleen SL',
        off: 'Uit',
      },
      levelNotice: {
        public: 'Iedereen',
        whisper: 'De speler en SL',
        gm: 'Alleen SL',
        off: 'Uit',
      },
      system: { auto: 'Herkennen aan de sheet' },
    },
    settings: {
      language: { label: 'Taal', desc: 'Taal voor chatkaarten en handouts.' },
      payout: {
        label: 'XP uitbetalen',
        desc: 'end: XP verzamelt zich in de sessiepot en wordt uitgedeeld als de sessie eindigt. instant: elke toekenning wordt meteen verdeeld en uitbetaald.',
      },
      updateSheets: {
        label: 'Sheets bijwerken',
        desc: 'Schrijf de XP naar de personagesheets. Staat dit uit, dan worden de totalen alleen aangekondigd.',
      },
      system: {
        label: 'Spelsysteem',
        desc: 'Welke sheetvelden XP en niveau bevatten. auto kiest het profiel op basis van de sheet van elk personage; custom gebruikt de instellingen voor eigen velden.',
      },
      roster: {
        label: 'Groep uit',
        desc: 'auto: de Roll20-groep als daar iemand in zit, anders personages die door spelers worden bestuurd. party, players of manual kiest er één.',
      },
      absentShare: {
        label: 'Aandeel afwezigen',
        desc: 'Het deel van een aandeel dat een afwezig personage nog krijgt, van 0% (niets) tot 100% (volledig).',
      },
      extraShares: {
        label: 'Extra aandelen',
        desc: 'Aandelen voor metgezellen of huurlingen die geen sheet hebben. Hun XP wordt aan niemand uitbetaald.',
      },
      killMode: {
        label: 'Verslagen wezens',
        desc: 'prompt: vraag de SL voordat de XP van een wezen wordt toegevoegd. auto: meteen toevoegen. off: tokens niet in de gaten houden.',
      },
      killBar: {
        label: 'HP-balk bewaken',
        desc: 'Beschouw een wezen als verslagen wanneer zijn HP-balk op 0 of lager komt.',
      },
      hpBar: { label: 'HP-balk', desc: 'Welke tokenbalk (1, 2 of 3) de hitpoints bevat.' },
      killMarker: {
        label: 'Markering bewaken',
        desc: 'Beschouw een wezen als verslagen wanneer de verslagen-markering op zijn token wordt gezet.',
      },
      marker: {
        label: 'Verslagen-markering',
        desc: 'De markering die verslagen betekent: een ingebouwde naam zoals dead, of de naam van een eigen markering.',
      },
      killDeathTracker: {
        label: 'DeathTracker gebruiken',
        desc: 'Beschouw een wezen als verslagen wanneer DeathTracker 1.0 of nieuwer het als dood markeert.',
      },
      announce: {
        label: 'XP-berichten',
        desc: 'Wie XP-toekenningen en de samenvatting aan het einde van de sessie ziet: public, whisper (betrokken spelers en SL), gm of off.',
      },
      levelNotice: {
        label: 'Niveaumeldingen',
        desc: 'Wie meldingen van een niveau omhoog ziet: public, whisper (de speler en SL), gm of off.',
      },
      customXp: {
        label: 'Eigen XP-veld',
        desc: 'Sheetveld voor de XP van een personage als het Spelsysteem custom is. Bij een lijst wordt elke naam om de beurt geprobeerd.',
      },
      customLevel: {
        label: 'Eigen niveauveld',
        desc: 'Sheetveld voor het niveau van een personage.',
      },
      customNpcXp: {
        label: 'Eigen XP-veld voor wezens',
        desc: 'Sheetveld voor de XP die een wezen waard is.',
      },
      customNpcCr: {
        label: 'Eigen uitdagingsveld',
        desc: 'Sheetveld voor de uitdagingsgraad van een wezen, gebruikt als het geen XP-waarde heeft.',
      },
      customLevels: {
        label: 'Eigen niveautabel',
        desc: 'XP die nodig is voor elk niveau, vanaf niveau 1, zoals 0,300,900,2700. Leeg laten schakelt niveaumeldingen uit voor custom sheets.',
      },
    },
    roster: {
      explain: {
        party: 'Personages die in Roll20 als Party Member zijn aangevinkt, delen de XP.',
        players:
          'Personages die door een speler worden bestuurd, delen de XP. Vink Party Member aan bij personages om in plaats daarvan de Roll20-groep te gebruiken.',
        manual: 'Alleen personages die je opneemt, delen de XP.',
      },
      selectHint: 'Selecteer eerst tokens om ze aan de groep toe te voegen of eruit te halen.',
    },
    kills: {
      prompt: '{name} is verslagen. {xp} XP aan de sessie toevoegen?',
      noXp: '{name} is verslagen, maar de sheet heeft geen XP-waarde.',
      reason: '{name} verslagen',
      result: {
        prompted: 'gevraagd',
        added: 'toegevoegd',
        counted: 'al geteld deze sessie',
        noXp: 'geen XP op de sheet: gebruik --xp',
        notCreature: 'geen wezen (geen sheet, of in de groep)',
      },
    },
    levels: {
      reached: '{name} heeft genoeg XP voor niveau {level}!',
      sheetButton: 'Gebruik de niveau-omhoogknop op de personagesheet.',
      updateSheet: 'Werk het niveau op de personagesheet bij.',
      pf2: 'Verhoog het niveau op de sheet en trek 1.000 af van de XP.',
      spend: 'Geef de XP uit en verhoog het niveau op de sheet.',
    },
    instant: {
      everyone: 'Iedereen in de groep krijgt {xp} XP.',
      bonus: '{names} krijgen {xp} XP.',
    },
    end: {
      nothing: 'Er is deze sessie geen XP toegekend.',
      playerLine: '{name} krijgt deze sessie {xp} XP.',
      playerLineTotal: '{name} krijgt deze sessie {xp} XP, samen goed voor {total} XP.',
      levelLine: '{name} heeft niveau {level} bereikt.',
      remainder: '{xp} XP konden niet gelijk verdeeld worden en gaan mee naar de volgende sessie.',
    },
    show: {
      noXp: 'geen XP op de sheet',
      next: 'volgend niveau bij {xp}',
    },
    awardKinds: { pool: 'Sessie-XP', bonus: 'Bonus-XP', give: 'Gegeven XP' },
    messages: {
      saved: 'Opgeslagen.',
      commands: 'Commando’s: {commands}',
      aliasTaken: '{alias} is in gebruik door {mods}. Gebruik !lazyxp.',
      migrated: 'Je instellingen, sessie-XP en extra XP van LazyExperience 0.1 zijn overgenomen.',
      handouts: 'De handouts Help, Command Deck en Session Log zijn opnieuw opgebouwd.',
      noLog: 'Er is nog geen sessie afgelopen, dus er is geen sessielogboek.',
      poolAdded: '{xp} XP aan de sessie toegevoegd.',
      bonusAdded: '{xp} bonus-XP voor {names}.',
      killAdded: '{xp} XP voor {name} aan de sessie toegevoegd.',
      killGone: 'Die overwinning is al toegevoegd of staat niet meer open.',
      undone: '{xp} XP teruggenomen ({reason}).',
      nothingToUndo: 'Er is deze sessie niets om ongedaan te maken.',
      nothingToUndoInstant:
        'De XP is al uitbetaald. Gebruik give met een negatief bedrag om dit te corrigeren.',
      sessionReset: 'De sessie-XP en bonussen zijn gewist. Er is niets uitbetaald.',
      absent: 'Deze sessie als afwezig gemarkeerd: {names}.',
      present: 'Als aanwezig gemarkeerd: {names}.',
      party: {
        add: 'Aan de groep toegevoegd: {names}.',
        remove: 'Uit de groep gehaald: {names}.',
      },
    },
    warnings: {
      sandbox:
        'Sommige personages gebruiken een Beacon-sheet (zoals D&D 2024), die de Mod sandbox alleen op v1.5 kan lezen en schrijven. Kies sandbox v1.5 in de Mod-instellingen van het spel.',
      partyLegacy:
        'De Roll20-groep is een Jumpgate-functie; in dit spel houdt de mod een eigen groepslijst bij.',
      nobodyToPay: 'Er zit niemand in de groep, dus {xp} XP wordt bewaard voor later.',
      write: {
        zero: '{name}: de sheet kan vanuit een Mod niet op 0 XP worden gezet. Pas het op de sheet aan.',
        sandbox: '{name}: deze sheet heeft Mod sandbox v1.5 nodig om XP bij te werken.',
        xpless: '{name}: dit spelsysteem gebruikt geen XP (of de sheet rekent het zelf uit).',
        noField:
          '{name}: voor deze sheet is geen XP-veld bekend. Zet Spelsysteem op custom en geef het veld op.',
        error: '{name}: de sheet kon niet worden bijgewerkt met {xp} XP. Zie de Mod-console.',
      },
    },
    errors: {
      gmOnly: 'Alleen de SL kan LazyExperience-commando’s gebruiken.',
      failed: 'Er ging iets mis: {message}',
      unknownCommand: 'Onbekend commando “{name}”.',
      helpHint: 'Typ {command} help voor de commando’s.',
      unknownSetting: 'Onbekende instelling “{name}”.',
      settingsHint: 'Open de instellingenkaart om de instellingen te zien.',
      badValue: '“{value}” is geen geldige waarde voor {name}.',
      badXp: 'Geef de XP op als geheel getal, zoals 250.',
      badShare: 'Geef het aandeel op als getal van 0 tot 10, zoals 0,5 of 50%.',
      noCharacters: 'Selecteer tokens die personages voorstellen, of gebruik --ids.',
      noTokens: 'Selecteer eerst de verslagen tokens, of gebruik --ids.',
    },
    status: {
      version: 'Versie',
      sandbox: 'Mod sandbox',
      beacon: 'Beacon-sheets leesbaar',
      commands: 'Commando’s',
      profiles: 'Gebruikte spelsystemen',
      characters: '{count} personages',
      handouts: 'Zie de handouts {help} en {deck}.',
    },
    log: {
      title: 'Sessielogboek',
      sessionHeading: 'Sessie {number} — {date}',
      colCharacter: 'Personage',
      colXp: 'XP',
      awards: 'Toekenningen',
      levelUps: 'Niveaus:',
      empty: 'Er is nog geen sessie afgelopen.',
    },
    help: {
      menu: 'Toon het hoofdmenu.',
      add: 'Voeg XP toe aan de sessiepot, met een optionele reden.',
      bonus: 'Geef de geselecteerde personages bonus-XP bovenop hun aandeel.',
      give: 'Betaal XP meteen uit aan de geselecteerde personages.',
      kill: 'Tel de geselecteerde tokens als verslagen en voeg hun XP toe.',
      killConfirm:
        'Voeg de XP van een verslagen wezen toe (de knop van de melding), eventueel met een ander bedrag.',
      absent: 'Markeer de geselecteerde personages als afwezig voor deze sessie.',
      present: 'Markeer de geselecteerde personages weer als aanwezig.',
      share: 'Stel het aandeel van de geselecteerde personages in (1 = volledig).',
      exclude: 'Sluit personages uit de groep uit, of neem ze weer op.',
      undo: 'Neem de laatste toekenning terug die nog niet is uitbetaald.',
      end: 'Rond de sessie af: betaal de XP uit, kondig het aan en log het.',
      resetSession: 'Wis de sessie-XP zonder die uit te betalen.',
      show: 'Toon de XP en het niveau van elk groepslid volgens de sheet.',
      roster: 'Toon de groepskaart.',
      party: 'Vink het vakje Party Member van Roll20 aan of uit voor de geselecteerde personages.',
      settings: 'Toon de instellingenkaart.',
      set: 'Wijzig een instelling.',
      lang: 'Kies de taal.',
      status: 'Toon de sandbox, de commando’s en de gebruikte spelsystemen.',
      log: 'Link naar de handout Session Log.',
      journal: 'Bouw de handouts opnieuw op.',
      help: 'Toon deze help.',
      handouts: 'Meer in de handouts {help} en {deck}.',
    },
    deck: {
      session: 'Sessie',
      sessionDesc: 'Voeg XP aan de sessie toe, bekijk de groep en rond de sessie af.',
      selected: 'Geselecteerde tokens',
      selectedDesc: 'Selecteer eerst tokens op de kaart.',
      party: 'Groep',
      partyDesc: 'Wie de XP deelt.',
      tools: 'Hulpmiddelen',
      toolsDesc: 'Instellingen, status en help.',
      footer: 'Knoppen voeren LazyExperience-commando’s uit. Zie de handout {help} voor details.',
    },
    handout: {
      versionLabel: 'Versie',
      subtitle: 'Sessie-ervaring, eerlijk verdeeld, op elke sheet',
      footer: 'Knoppen voor alle commando’s staan in de handout {deck}.',
      overview: {
        heading: 'Overzicht',
        body: 'LazyExperience verzamelt de ervaringspunten die tijdens een sessie zijn verdiend, verdeelt ze over de groep en schrijft ze naar de personagesheets. Het leest en schrijft de D&D 2024-sheet en ook oudere en andere sheets, gebruikt de eigen groep van Roll20, merkt verslagen wezens op, regelt afwezige spelers en bonus-XP, kondigt niveaus omhoog aan en houdt een logboek bij van elke sessie.',
      },
      quickStart: {
        heading: 'Snel aan de slag',
        steps: [
          'Vink Party Member aan bij elk spelerspersonage (in de instellingen van het personagevenster), of laat het zo: personages die door spelers worden bestuurd, worden gebruikt.',
          'Typ !lazyxp om het menu te openen.',
          'Als de groep een wezen verslaat, vraagt de HP-balk die 0 bereikt of je de XP wilt toevoegen. Je kunt ook tokens selecteren en op Verslagen: geselecteerd drukken.',
          'Voeg XP voor al het andere toe met XP toevoegen, en bonus-XP voor één personage met Bonus: geselecteerd.',
          'Markeer spelers die de sessie hebben gemist als Afwezig.',
          'Druk op Sessie afronden. Ieders aandeel wordt naar de sheets geschreven, aangekondigd en toegevoegd aan de handout Session Log.',
        ],
      },
      commands: {
        heading: 'Commando’s',
        intro:
          'Elk commando begint met !lazyxp; {long} werkt ook, en {short} ook zolang geen andere XP-Mod het gebruikt. Alleen de SL kan ze gebruiken.',
        targets:
          'Commando’s voor personages gebruiken de geselecteerde tokens, of --ids gevolgd door personage- of token-ID’s gescheiden door komma’s.',
        colCommand: 'Commando',
        colDesc: 'Wat het doet',
      },
      party: {
        heading: 'De groep',
        points: [
          'Automatisch: als een personage in Roll20 (Jumpgate) als Party Member is aangevinkt, deelt de Roll20-groep de XP; anders doet elk personage dat door een speler wordt bestuurd.',
          'Personages die alleen door “Alle spelers” worden bestuurd, zoals hulptokens, tellen niet mee.',
          'Aan groep toevoegen en Uit groep halen vinken Party Member aan of uit voor de geselecteerde personages.',
          'Uitsluiten haalt een personage definitief uit de groep; Opnemen zet het terug.',
          'Een personage dat door meerdere spelers wordt bestuurd, telt één keer.',
        ],
      },
      splitting: {
        heading: 'De XP verdelen',
        points: [
          'De sessie-XP wordt gedeeld door het aantal aandelen: één per groepslid, plus eventuele extra aandelen.',
          'Afwezige personages krijgen de instelling Aandeel afwezigen (standaard 0%). Afwezigheid geldt voor één sessie.',
          'Een personage kan een ander aandeel hebben, zoals 0,5 voor een sidekick.',
          'Bonus-XP gaat naar de gekozen personages bovenop hun aandeel.',
          'XP die niet gelijk te verdelen is, gaat mee naar de volgende sessie.',
          'Met XP uitbetalen op instant wordt elke toekenning meteen verdeeld en uitbetaald.',
        ],
      },
      kills: {
        heading: 'Verslagen wezens',
        points: [
          'Een wezen telt als verslagen wanneer zijn HP-balk op 0 komt, wanneer de verslagen-markering erop gaat, of wanneer DeathTracker het als dood markeert.',
          'Wijzigingen door TokenMod, door de sheet of door andere Mods via het gekoppelde attribuut worden ook opgemerkt.',
          'Alleen tokens van personages buiten de groep die door geen enkele speler worden bestuurd, tellen mee, en elke token maar één keer per sessie.',
          'De XP komt van de sheet: de XP-waarde van het wezen, of zijn uitdagingsgraad.',
          'Vraag de SL (de standaard) fluistert een melding met Toevoegen, Ander bedrag en Negeren. Automatisch toevoegen slaat de melding over.',
        ],
      },
      levels: {
        heading: 'Niveaustijgingen',
        points: [
          'Nadat de XP is geschreven, controleert LazyExperience de niveautabel van het systeem en meldt het wanneer een personage genoeg XP heeft voor een nieuw niveau.',
          'Op de D&D 2024-sheet drukt de speler dan op de niveau-omhoogknop van de sheet.',
        ],
      },
      systems: {
        heading: 'Spelsystemen',
        intro:
          'LazyExperience kiest een profiel op basis van de sheet van elk personage. Stel Spelsysteem in om er een af te dwingen, of op custom om zelf de velden op te geven.',
        colSystem: 'Systeem',
        colId: 'ID',
        colSheets: 'Sheets',
        colChecked: 'Gecontroleerd',
        verified: {
          live: 'Getest in Roll20',
          partial: 'Gedeeltelijk getest in Roll20',
          source: 'Uit de broncode van de sheet',
          none: '—',
        },
        points: [
          'Kies de sheet op naam in de Instellingen van het spel. Sheets die niet in de lijst staan, gebruiken de gangbare veldnamen experience, xp en level, of stel Spelsysteem in op custom.',
          'Getest in Roll20 betekent dat XP in een Jumpgate-spel naar die sheet is geschreven, de eigen berekeningen van de sheet zijn uitgevoerd, en verslagen wezens en niveaumeldingen zijn gecontroleerd.',
          'Beacon-sheets zoals D&D 2024 hebben Mod sandbox v1.5 nodig, en een Mod kan ze niet op 0 XP zetten.',
          'Pathfinder 1E en Starfinder gebruiken het vak voor XP tot het volgende niveau op de sheet voor niveaumeldingen. Als het leeg is, gebruikt Pathfinder het gemiddelde traject en Starfinder een eigen tabel.',
          'WFRP 4E: elke toekenning wordt als rij toegevoegd aan de Experience-lijst van de sheet, maar de sheet herberekende zijn XP-totalen niet tijdens het testen, dus controleer ze op de sheet.',
          'Savage Worlds, 13th Age, Cosmere en Call of Cthulhu hebben geen XP die een Mod kan schrijven.',
        ],
      },
      settings: {
        heading: 'Instellingen',
        intro: 'Wijzig instellingen op de instellingenkaart, of met !lazyxp set <setting> <value>.',
        colKey: 'Instelling',
        colName: 'Naam',
        colDesc: 'Wat het doet',
      },
      upgrading: {
        heading: 'Upgraden vanaf 0.1',
        points: [
          'Instellingen, sessie-XP en extra XP per personage uit 0.1 worden overgenomen de eerste keer dat 1.0 start.',
          'Spelers of personages die niet actief waren, blijven buiten de groep.',
          'Een eigen commandonaam uit 0.1 blijft werken.',
          'De oude commando’s werken nog steeds:',
        ],
        colV1: '0.1',
        colV2: '1.0',
      },
      troubleshooting: {
        heading: 'Problemen oplossen',
        points: [
          'Er wordt niets naar D&D 2024-sheets geschreven: controleer of het spel Mod sandbox v1.5 gebruikt (!lazyxp status).',
          'Een wezen geeft 0 XP: de sheet heeft geen XP of uitdagingsgraad. Gebruik Ander bedrag, of !lazyxp kill --xp 100.',
          'Verslagen wezens worden niet opgemerkt: controleer of HP-balk de balk is met de hitpoints.',
          '!xp doet niets: een andere XP-Mod gebruikt het. Gebruik !lazyxp.',
        ],
      },
      languages: {
        heading: 'Talen',
        body: 'Kies een taal met !lazyxp lang. Chatkaarten en handouts veranderen meteen.',
        colLanguage: 'Taal',
        colNative: 'Naam',
        colCode: 'Code',
      },
      credits: {
        heading: 'Dankwoord',
        original: 'Gemaakt door',
        maintainer: 'Herschreven en onderhouden door',
        support: 'Bugmeldingen en ideeën zijn welkom op het Roll20-forum.',
      },
    },
  };

  var localeEnUS = {
    titles: {
      ready: 'LazyExperience is ready.',
      help: 'LazyExperience Help',
      settings: 'LazyExperience Settings',
      status: 'LazyExperience Status',
      roster: 'Party',
      language: 'Language',
      levelUp: 'Level Up!',
      defeated: 'Creature Defeated',
      xpAwarded: 'Experience Awarded',
      sessionEnded: 'Session {number} Ended',
      yourXp: 'Your Experience',
      pool: 'Session XP',
      bonus: 'Bonus XP',
      undo: 'Undo',
      log: 'Session Log',
      partyXp: 'Party Experience',
    },
    menu: {
      session: 'Session',
      pool: 'Session XP',
      payout: 'Paid',
      shares: 'Shares',
      perShare: 'XP per share',
      party: 'Party ({source})',
      noParty: 'Nobody is in the party yet. Open the Party card to add characters.',
      absentTag: '(absent)',
      bonusTag: '(+{xp} bonus)',
      levelTag: 'Level {level}',
      shareTag: 'Share {share}',
      rosterSource: 'Party from',
      excluded: 'Left out',
      blank: '(blank)',
      groupXp: 'Experience',
      groupParty: 'Party',
      groupKills: 'Defeated creatures',
      groupSheet: 'Character sheet',
    },
    buttons: {
      menu: 'Menu',
      help: 'Help',
      settings: 'Settings',
      status: 'Status',
      roster: 'Party',
      addXp: 'Add XP',
      killSelected: 'Defeated: Selected',
      bonusSelected: 'Bonus: Selected',
      giveSelected: 'Give Now: Selected',
      endSession: 'End Session',
      undo: 'Undo',
      show: 'Party XP',
      log: 'Session Log',
      absent: 'Absent',
      present: 'Present',
      share: 'Share',
      exclude: 'Leave Out',
      include: 'Include',
      partyAdd: 'Add Selected to Party',
      partyRemove: 'Remove Selected',
      addKill: 'Add {xp} XP',
      otherXp: 'Other Amount',
      ignore: 'Ignore',
    },
    prompts: {
      xp: 'XP',
      reason: 'Reason (optional)',
      share: 'Share (1 = full, 0.5 = half)',
      confirmEnd: 'End the session and hand out the XP?',
    },
    options: {
      yesNo: { yes: 'Yes', no: 'No' },
      payout: { end: 'At the end of the session', instant: 'Straight away' },
      roster: {
        auto: 'Automatic',
        party: 'Roll20 party',
        players: "Players' characters",
        manual: 'Chosen by the GM',
      },
      killMode: { prompt: 'Ask the GM', auto: 'Add automatically', off: 'Off' },
      announce: { public: 'Everyone', whisper: 'The players concerned', gm: 'GM only', off: 'Off' },
      levelNotice: {
        public: 'Everyone',
        whisper: 'The player and GM',
        gm: 'GM only',
        off: 'Off',
      },
      system: { auto: 'Detect from the sheet' },
    },
    settings: {
      language: { label: 'Language', desc: 'Language for chat cards and handouts.' },
      payout: {
        label: 'Pay XP',
        desc: 'end: XP collects in the session pool and is handed out when the session ends. instant: every award is split and paid straight away.',
      },
      updateSheets: {
        label: 'Update sheets',
        desc: 'Write the XP to the character sheets. When off, the totals are only announced.',
      },
      system: {
        label: 'Game system',
        desc: 'Which sheet fields hold XP and level. auto picks the profile from each character’s sheet; custom uses the custom field settings.',
      },
      roster: {
        label: 'Party from',
        desc: 'auto: the Roll20 party if anyone is in it, otherwise characters controlled by players. party, players or manual pick one.',
      },
      absentShare: {
        label: 'Absent share',
        desc: 'Part of a share an absent character still gets, from 0% (none) to 100% (full).',
      },
      extraShares: {
        label: 'Extra shares',
        desc: 'Shares for companions or hirelings who are not on a sheet. Their XP is not paid to anyone.',
      },
      killMode: {
        label: 'Defeated creatures',
        desc: 'prompt: ask the GM before adding a creature’s XP. auto: add it straight away. off: do not watch tokens.',
      },
      killBar: {
        label: 'Watch HP bar',
        desc: 'Count a creature as defeated when its HP bar drops to 0 or below.',
      },
      hpBar: { label: 'HP bar', desc: 'Which token bar (1, 2 or 3) holds hit points.' },
      killMarker: {
        label: 'Watch marker',
        desc: 'Count a creature as defeated when the defeated marker is put on its token.',
      },
      marker: {
        label: 'Defeated marker',
        desc: 'The marker that means defeated: a built-in name such as dead, or a custom marker’s name.',
      },
      killDeathTracker: {
        label: 'Use DeathTracker',
        desc: 'Count a creature as defeated when DeathTracker 1.0 or later marks it dead.',
      },
      announce: {
        label: 'XP messages',
        desc: 'Who sees XP awards and the end-of-session summary: public, whisper (players concerned and GM), gm or off.',
      },
      levelNotice: {
        label: 'Level-up notices',
        desc: 'Who sees level-up notices: public, whisper (the player and GM), gm or off.',
      },
      customXp: {
        label: 'Custom XP field',
        desc: 'Sheet field for a character’s XP when Game system is custom. A list tries each name in turn.',
      },
      customLevel: { label: 'Custom level field', desc: 'Sheet field for a character’s level.' },
      customNpcXp: {
        label: 'Custom creature XP field',
        desc: 'Sheet field for the XP a creature is worth.',
      },
      customNpcCr: {
        label: 'Custom challenge field',
        desc: 'Sheet field for a creature’s challenge rating, used when it has no XP value.',
      },
      customLevels: {
        label: 'Custom level table',
        desc: 'XP needed for each level, from level 1, such as 0,300,900,2700. Blank turns level-up notices off for custom sheets.',
      },
    },
    roster: {
      explain: {
        party: 'Characters ticked as Party Member in Roll20 share the XP.',
        players:
          'Characters controlled by a player share the XP. Tick Party Member on characters to use the Roll20 party instead.',
        manual: 'Only characters you include share the XP.',
      },
      selectHint: 'Select tokens first to add them to the party or remove them.',
    },
    kills: {
      prompt: '{name} was defeated. Add {xp} XP to the session?',
      noXp: '{name} was defeated, but its sheet has no XP value.',
      reason: 'Defeated {name}',
      result: {
        prompted: 'asked',
        added: 'added',
        counted: 'already counted this session',
        noXp: 'no XP on the sheet: use --xp',
        notCreature: 'not a creature (no sheet, or in the party)',
      },
    },
    levels: {
      reached: '{name} has enough XP for level {level}!',
      sheetButton: 'Use the Level Up button on the character sheet.',
      updateSheet: 'Update the level on the character sheet.',
      pf2: 'Raise the level on the sheet and take 1,000 off the XP.',
      spend: 'Spend the XP and raise the level on the sheet.',
    },
    instant: {
      everyone: 'Everyone in the party gains {xp} XP.',
      bonus: '{names} gain {xp} XP.',
    },
    end: {
      nothing: 'No XP was awarded this session.',
      playerLine: '{name} gains {xp} XP this session.',
      playerLineTotal: '{name} gains {xp} XP this session, for {total} XP in total.',
      levelLine: '{name} reached level {level}.',
      remainder: '{xp} XP could not be split evenly and carries over to the next session.',
    },
    show: {
      noXp: 'no XP on the sheet',
      next: 'next level at {xp}',
    },
    awardKinds: { pool: 'Session XP', bonus: 'Bonus XP', give: 'XP given' },
    messages: {
      saved: 'Saved.',
      commands: 'Commands: {commands}',
      aliasTaken: '{alias} is left to {mods}. Use !lazyxp.',
      migrated:
        'Your LazyExperience 0.1 settings, session XP and extra XP have been brought across.',
      handouts: 'The Help, Command Deck and Session Log handouts have been rebuilt.',
      noLog: 'No session has ended yet, so there is no Session Log.',
      poolAdded: '{xp} XP added to the session.',
      bonusAdded: '{xp} bonus XP for {names}.',
      killAdded: '{xp} XP for {name} added to the session.',
      killGone: 'That defeat has already been added or is no longer pending.',
      undone: 'Took back {xp} XP ({reason}).',
      nothingToUndo: 'There is nothing to undo this session.',
      nothingToUndoInstant:
        'XP has already been paid. Use give with a negative amount to correct it.',
      sessionReset: 'The session XP and bonuses were cleared. Nothing was paid.',
      absent: 'Marked absent this session: {names}.',
      present: 'Marked present: {names}.',
      party: {
        add: 'Added to the party: {names}.',
        remove: 'Removed from the party: {names}.',
      },
    },
    warnings: {
      sandbox:
        'Some characters use a Beacon sheet (such as D&D 2024), which the Mod sandbox can only read and write on v1.5. Choose sandbox v1.5 in the game’s Mod settings.',
      partyLegacy:
        'The Roll20 party is a Jumpgate feature; in this game the mod keeps its own party list.',
      nobodyToPay: 'Nobody is in the party, so {xp} XP is kept for later.',
      write: {
        zero: '{name}: the sheet cannot be set to 0 XP from a Mod. Change it on the sheet.',
        sandbox: '{name}: this sheet needs Mod sandbox v1.5 to update XP.',
        xpless: '{name}: this game system does not use XP (or the sheet works it out itself).',
        noField:
          '{name}: no XP field is known for this sheet. Set Game system to custom and name the field.',
        error: '{name}: the sheet could not be updated with {xp} XP. See the Mod console.',
      },
    },
    errors: {
      gmOnly: 'Only the GM can use LazyExperience commands.',
      failed: 'Something went wrong: {message}',
      unknownCommand: 'Unknown command "{name}".',
      helpHint: 'Type {command} help for the commands.',
      unknownSetting: 'Unknown setting "{name}".',
      settingsHint: 'Open the settings card to see the settings.',
      badValue: '"{value}" is not a valid value for {name}.',
      badXp: 'Give the XP as a whole number, such as 250.',
      badShare: 'Give the share as a number from 0 to 10, such as 0.5 or 50%.',
      noCharacters: 'Select tokens that stand for characters, or use --ids.',
      noTokens: 'Select the defeated tokens first, or use --ids.',
    },
    status: {
      version: 'Version',
      sandbox: 'Mod sandbox',
      beacon: 'Beacon sheets readable',
      commands: 'Commands',
      profiles: 'Game systems in use',
      characters: '{count} characters',
      handouts: 'See the {help} and {deck} handouts.',
    },
    log: {
      title: 'Session Log',
      sessionHeading: 'Session {number} — {date}',
      colCharacter: 'Character',
      colXp: 'XP',
      awards: 'Awards',
      levelUps: 'Levels:',
      empty: 'No session has ended yet.',
    },
    help: {
      menu: 'Show the main menu.',
      add: 'Add XP to the session pool, with an optional reason.',
      bonus: 'Give the selected characters bonus XP on top of their share.',
      give: 'Pay XP to the selected characters straight away.',
      kill: 'Count the selected tokens as defeated and add their XP.',
      killConfirm:
        'Add a defeated creature’s XP (the prompt’s button), optionally with another amount.',
      absent: 'Mark the selected characters absent for this session.',
      present: 'Mark the selected characters present again.',
      share: 'Set the selected characters’ share (1 = full).',
      exclude: 'Leave characters out of the party, or include them again.',
      undo: 'Take back the last award that has not been paid.',
      end: 'End the session: pay the XP, announce it and log it.',
      resetSession: 'Clear the session XP without paying it.',
      show: 'Show each party member’s XP and level from the sheet.',
      roster: 'Show the party card.',
      party: 'Tick or untick Roll20’s Party Member box for the selected characters.',
      settings: 'Show the settings card.',
      set: 'Change a setting.',
      lang: 'Choose the language.',
      status: 'Show the sandbox, commands and game systems in use.',
      log: 'Link to the Session Log handout.',
      journal: 'Rebuild the handouts.',
      help: 'Show this help.',
      handouts: 'More in the {help} and {deck} handouts.',
    },
    deck: {
      session: 'Session',
      sessionDesc: 'Add XP to the session, check the party and end the session.',
      selected: 'Selected tokens',
      selectedDesc: 'Select tokens on the map first.',
      party: 'Party',
      partyDesc: 'Who shares the XP.',
      tools: 'Tools',
      toolsDesc: 'Settings, status and help.',
      footer: 'Buttons run LazyExperience commands. See the {help} handout for details.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Session experience, split fairly, on any sheet',
      footer: 'Buttons for every command are in the {deck} handout.',
      overview: {
        heading: 'Overview',
        body: 'LazyExperience collects the experience points earned during a session, splits them between the party and writes them to the character sheets. It reads and writes the D&D 2024 sheet as well as older and other sheets, uses Roll20’s own party, notices defeated creatures, handles absent players and bonus XP, announces level-ups and keeps a log of every session.',
      },
      quickStart: {
        heading: 'Quick start',
        steps: [
          'Tick Party Member on each player character (the character window’s settings), or leave it: characters controlled by players are used.',
          'Type !lazyxp to open the menu.',
          'When the party defeats a creature, its HP bar reaching 0 asks you whether to add its XP. You can also select tokens and press Defeated: Selected.',
          'Add XP for anything else with Add XP, and bonus XP for one character with Bonus: Selected.',
          'Mark players who missed the session as Absent.',
          'Press End Session. Everyone’s share is written to their sheets, announced and added to the Session Log handout.',
        ],
      },
      commands: {
        heading: 'Commands',
        intro:
          'Every command starts with !lazyxp; {long} works too, and so does {short} while no other XP Mod uses it. Only the GM can use them.',
        targets:
          'Commands for characters use the selected tokens, or --ids followed by character or token IDs separated by commas.',
        colCommand: 'Command',
        colDesc: 'What it does',
      },
      party: {
        heading: 'The party',
        points: [
          'Automatic: when any character is ticked as Party Member in Roll20 (Jumpgate), the Roll20 party shares the XP; otherwise every character controlled by a player does.',
          'Characters controlled by "All players" only, such as helper tokens, are not counted.',
          'Party add and Party remove tick or untick Party Member for the selected characters.',
          'Leave Out takes a character out of the party for good; Include puts it back.',
          'A character controlled by several players counts once.',
        ],
      },
      splitting: {
        heading: 'Splitting the XP',
        points: [
          'The session XP is divided by the number of shares: one per party member, plus any extra shares.',
          'Absent characters get the Absent share setting (0% by default). Absence lasts one session.',
          'A character can have a different share, such as 0.5 for a sidekick.',
          'Bonus XP goes to the chosen characters on top of their share.',
          'XP that does not divide evenly carries over to the next session.',
          'With Pay XP set to instant, each award is split and paid at once.',
        ],
      },
      kills: {
        heading: 'Defeated creatures',
        points: [
          'A creature counts as defeated when its HP bar drops to 0, when the defeated marker goes on, or when DeathTracker marks it dead.',
          'Changes made by TokenMod, by the sheet or by other Mods through the linked attribute are noticed too.',
          'Only tokens for characters outside the party that no player controls are counted, and each token only once per session.',
          'The XP comes from the sheet: the creature’s XP value, or its challenge rating.',
          'Ask the GM (the default) whispers a prompt with Add, Other Amount and Ignore. Add automatically skips the prompt.',
        ],
      },
      levels: {
        heading: 'Level-ups',
        points: [
          'After XP is written, LazyExperience checks the system’s level table and announces when a character has enough XP for a new level.',
          'On the D&D 2024 sheet the player then presses the sheet’s Level Up button.',
        ],
      },
      systems: {
        heading: 'Game systems',
        intro:
          'LazyExperience picks a profile from each character’s sheet. Set Game system to force one, or to custom to name the fields yourself.',
        colSystem: 'System',
        colId: 'ID',
        colSheets: 'Sheets',
        colChecked: 'Checked',
        verified: {
          live: 'Tested in Roll20',
          partial: 'Partly tested in Roll20',
          source: 'From the sheet’s source',
          none: '—',
        },
        points: [
          'Pick the sheet by its name in the game’s Settings. Sheets not listed use the common field names experience, xp and level, or set Game system to custom.',
          'Tested in Roll20 means XP was written to that sheet in a Jumpgate game, the sheet’s own calculations ran, and defeated creatures and level-up notices were checked.',
          'Beacon sheets such as D&D 2024 need Mod sandbox v1.5, and a Mod cannot set them to 0 XP.',
          'Pathfinder 1E and Starfinder use the sheet’s XP-for-next-level box for level-up notices. When it is blank, Pathfinder uses the medium track and Starfinder its own table.',
          'WFRP 4E: each award is added as a row in the sheet’s Experience list, but the sheet did not recalculate its XP totals in testing, so check them on the sheet.',
          'Savage Worlds, 13th Age, Cosmere and Call of Cthulhu have no XP for a Mod to write.',
        ],
      },
      settings: {
        heading: 'Settings',
        intro: 'Change settings on the settings card, or with !lazyxp set <setting> <value>.',
        colKey: 'Setting',
        colName: 'Name',
        colDesc: 'What it does',
      },
      upgrading: {
        heading: 'Upgrading from 0.1',
        points: [
          'Settings, session XP and per-character extra XP from 0.1 are brought across the first time 1.0 starts.',
          'Players or characters that were not active are left out of the party.',
          'A custom command name from 0.1 keeps working.',
          'The old commands still work:',
        ],
        colV1: '0.1',
        colV2: '1.0',
      },
      troubleshooting: {
        heading: 'Troubleshooting',
        points: [
          'Nothing is written to D&D 2024 sheets: check the game uses Mod sandbox v1.5 (!lazyxp status).',
          'A creature gives 0 XP: its sheet has no XP or challenge rating. Use Other Amount, or !lazyxp kill --xp 100.',
          'Defeats are not noticed: check HP bar is the bar that holds hit points.',
          '!xp does nothing: another XP Mod uses it. Use !lazyxp.',
        ],
      },
      languages: {
        heading: 'Languages',
        body: 'Choose a language with !lazyxp lang. Chat cards and handouts change at once.',
        colLanguage: 'Language',
        colNative: 'Name',
        colCode: 'Code',
      },
      credits: {
        heading: 'Credits',
        original: 'Created by',
        maintainer: 'Rewritten and maintained by',
        support: 'Bug reports and ideas are welcome on the Roll20 forum.',
      },
    },
  };

  var localeFi = {
    titles: {
      ready: 'LazyExperience on valmis.',
      help: 'LazyExperience Ohje',
      settings: 'LazyExperience Asetukset',
      status: 'LazyExperience Tila',
      roster: 'Seurue',
      language: 'Kieli',
      levelUp: 'Tasonnousu!',
      defeated: 'Olento kukistettu',
      xpAwarded: 'Kokemus myönnetty',
      sessionEnded: 'Pelisessio {number} päättyi',
      yourXp: 'Kokemuksesi',
      pool: 'Session XP',
      bonus: 'Bonus-XP',
      undo: 'Kumoa',
      log: 'Sessiologi',
      partyXp: 'Seurueen kokemus',
    },
    menu: {
      session: 'Sessio',
      pool: 'Session XP',
      payout: 'Maksettu',
      shares: 'Osuudet',
      perShare: 'XP osuutta kohti',
      party: 'Seurue ({source})',
      noParty: 'Kukaan ei ole vielä seurueessa. Avaa seuruekortti lisätäksesi hahmoja.',
      absentTag: '(poissa)',
      bonusTag: '(+{xp} bonus)',
      levelTag: 'Taso {level}',
      shareTag: 'Osuus {share}',
      rosterSource: 'Seurue lähteestä',
      excluded: 'Jätetty pois',
      blank: '(tyhjä)',
      groupXp: 'Kokemus',
      groupParty: 'Seurue',
      groupKills: 'Kukistetut olennot',
      groupSheet: 'Hahmolomake',
    },
    buttons: {
      menu: 'Valikko',
      help: 'Ohje',
      settings: 'Asetukset',
      status: 'Tila',
      roster: 'Seurue',
      addXp: 'Lisää XP',
      killSelected: 'Kukistettu: Valitut',
      bonusSelected: 'Bonus: Valitut',
      giveSelected: 'Anna nyt: Valitut',
      endSession: 'Päätä sessio',
      undo: 'Kumoa',
      show: 'Seurueen XP',
      log: 'Sessiologi',
      absent: 'Poissa',
      present: 'Paikalla',
      share: 'Osuus',
      exclude: 'Jätä pois',
      include: 'Ota mukaan',
      partyAdd: 'Lisää valitut seurueeseen',
      partyRemove: 'Poista valitut',
      addKill: 'Lisää {xp} XP',
      otherXp: 'Muu määrä',
      ignore: 'Ohita',
    },
    prompts: {
      xp: 'XP',
      reason: 'Syy (valinnainen)',
      share: 'Osuus (1 = koko, 0,5 = puolikas)',
      confirmEnd: 'Päätetäänkö sessio ja jaetaanko XP?',
    },
    options: {
      yesNo: { yes: 'Kyllä', no: 'Ei' },
      payout: { end: 'Session lopussa', instant: 'Heti' },
      roster: {
        auto: 'Automaattinen',
        party: 'Roll20-seurue',
        players: 'Pelaajien hahmot',
        manual: 'Pelinjohtajan valitsema',
      },
      killMode: { prompt: 'Kysy pelinjohtajalta', auto: 'Lisää automaattisesti', off: 'Pois' },
      announce: {
        public: 'Kaikki',
        whisper: 'Asianomaiset pelaajat',
        gm: 'Vain pelinjohtaja',
        off: 'Pois',
      },
      levelNotice: {
        public: 'Kaikki',
        whisper: 'Pelaaja ja pelinjohtaja',
        gm: 'Vain pelinjohtaja',
        off: 'Pois',
      },
      system: { auto: 'Tunnista lomakkeesta' },
    },
    settings: {
      language: { label: 'Kieli', desc: 'Chat-korttien ja handoutien kieli.' },
      payout: {
        label: 'Maksa XP',
        desc: 'end: XP kertyy session pottiin ja jaetaan session päättyessä. instant: jokainen palkkio jaetaan ja maksetaan heti.',
      },
      updateSheets: {
        label: 'Päivitä lomakkeet',
        desc: 'Kirjoita XP hahmolomakkeisiin. Kun tämä on pois päältä, vain kokonaismäärät ilmoitetaan.',
      },
      system: {
        label: 'Pelijärjestelmä',
        desc: 'Mitkä lomakekentät sisältävät XP:n ja tason. auto valitsee profiilin kunkin hahmon lomakkeesta; custom käyttää omien kenttien asetuksia.',
      },
      roster: {
        label: 'Seurue lähteestä',
        desc: 'auto: Roll20-seurue, jos joku on siinä, muuten pelaajien ohjaamat hahmot. party, players tai manual valitsee yhden niistä.',
      },
      absentShare: {
        label: 'Poissaolijan osuus',
        desc: 'Osa osuudesta, jonka poissa oleva hahmo silti saa, 0 %:sta (ei mitään) 100 %:iin (koko osuus).',
      },
      extraShares: {
        label: 'Lisäosuudet',
        desc: 'Osuudet kumppaneille tai palkkalaisille, joita ei ole lomakkeella. Heidän XP:tään ei makseta kenellekään.',
      },
      killMode: {
        label: 'Kukistetut olennot',
        desc: 'prompt: kysy pelinjohtajalta ennen olennon XP:n lisäämistä. auto: lisää heti. off: älä seuraa pelinappuloita.',
      },
      killBar: {
        label: 'Seuraa HP-palkkia',
        desc: 'Laske olento kukistetuksi, kun sen HP-palkki putoaa nollaan tai alle.',
      },
      hpBar: {
        label: 'HP-palkki',
        desc: 'Mikä nappulan palkki (1, 2 tai 3) sisältää osumapisteet.',
      },
      killMarker: {
        label: 'Seuraa merkkiä',
        desc: 'Laske olento kukistetuksi, kun kukistettu-merkki asetetaan sen nappulaan.',
      },
      marker: {
        label: 'Kukistettu-merkki',
        desc: 'Merkki, joka tarkoittaa kukistettua: sisäänrakennettu nimi kuten dead tai oman merkin nimi.',
      },
      killDeathTracker: {
        label: 'Käytä DeathTrackeria',
        desc: 'Laske olento kukistetuksi, kun DeathTracker 1.0 tai uudempi merkitsee sen kuolleeksi.',
      },
      announce: {
        label: 'XP-viestit',
        desc: 'Kuka näkee XP-palkkiot ja session lopun yhteenvedon: public, whisper (asianomaiset pelaajat ja pelinjohtaja), gm tai off.',
      },
      levelNotice: {
        label: 'Tasonnousuilmoitukset',
        desc: 'Kuka näkee tasonnousuilmoitukset: public, whisper (pelaaja ja pelinjohtaja), gm tai off.',
      },
      customXp: {
        label: 'Oma XP-kenttä',
        desc: 'Lomakekenttä hahmon XP:lle, kun Pelijärjestelmä on custom. Lista kokeilee jokaista nimeä vuorotellen.',
      },
      customLevel: { label: 'Oma tasokenttä', desc: 'Lomakekenttä hahmon tasolle.' },
      customNpcXp: {
        label: 'Oma olentojen XP-kenttä',
        desc: 'Lomakekenttä sille XP:lle, jonka olento on arvoinen.',
      },
      customNpcCr: {
        label: 'Oma haastekenttä',
        desc: 'Lomakekenttä olennon haastetasolle, jota käytetään, kun sillä ei ole XP-arvoa.',
      },
      customLevels: {
        label: 'Oma tasotaulukko',
        desc: 'Kutakin tasoa varten tarvittava XP tasosta 1 alkaen, esimerkiksi 0,300,900,2700. Tyhjä poistaa tasonnousuilmoitukset käytöstä omilla lomakkeilla.',
      },
    },
    roster: {
      explain: {
        party: 'Roll20:ssa Party Member -merkityt hahmot jakavat XP:n.',
        players:
          'Pelaajan ohjaamat hahmot jakavat XP:n. Merkitse hahmoille Party Member käyttääksesi sen sijaan Roll20-seuruetta.',
        manual: 'Vain mukaan ottamasi hahmot jakavat XP:n.',
      },
      selectHint: 'Valitse ensin nappulat lisätäksesi ne seurueeseen tai poistaaksesi ne.',
    },
    kills: {
      prompt: '{name} kukistettiin. Lisätäänkö {xp} XP sessioon?',
      noXp: '{name} kukistettiin, mutta sen lomakkeella ei ole XP-arvoa.',
      reason: 'Kukisti: {name}',
      result: {
        prompted: 'kysytty',
        added: 'lisätty',
        counted: 'laskettu jo tässä sessiossa',
        noXp: 'lomakkeella ei XP:tä: käytä --xp',
        notCreature: 'ei olento (ei lomaketta, tai seurueessa)',
      },
    },
    levels: {
      reached: '{name} on saanut tarpeeksi XP:tä tasolle {level}!',
      sheetButton: 'Käytä hahmolomakkeen tasonnousupainiketta.',
      updateSheet: 'Päivitä taso hahmolomakkeeseen.',
      pf2: 'Nosta taso lomakkeella ja vähennä XP:stä 1 000.',
      spend: 'Käytä XP ja nosta taso lomakkeella.',
    },
    instant: {
      everyone: 'Kaikki seurueessa saavat {xp} XP.',
      bonus: '{names} saavat {xp} XP.',
    },
    end: {
      nothing: 'XP:tä ei jaettu tässä sessiossa.',
      playerLine: '{name} saa {xp} XP tässä sessiossa.',
      playerLineTotal: '{name} saa {xp} XP tässä sessiossa, yhteensä {total} XP.',
      levelLine: '{name} saavutti tason {level}.',
      remainder: '{xp} XP:tä ei voitu jakaa tasan, ja se siirtyy seuraavaan sessioon.',
    },
    show: {
      noXp: 'lomakkeella ei XP:tä',
      next: 'seuraava taso kohdassa {xp}',
    },
    awardKinds: { pool: 'Session XP', bonus: 'Bonus-XP', give: 'Annettu XP' },
    messages: {
      saved: 'Tallennettu.',
      commands: 'Komennot: {commands}',
      aliasTaken: '{alias} on jätetty modille {mods}. Käytä !lazyxp.',
      migrated: 'LazyExperience 0.1:n asetukset, session XP ja lisä-XP on siirretty.',
      handouts: 'Ohjeen, Command Deckin ja Sessiologin handoutit on rakennettu uudelleen.',
      noLog: 'Yhtään sessiota ei ole vielä päätetty, joten sessiologia ei ole.',
      poolAdded: '{xp} XP lisätty sessioon.',
      bonusAdded: '{xp} bonus-XP: {names}.',
      killAdded: '{xp} XP olennosta {name} lisätty sessioon.',
      killGone: 'Tuo kukistus on jo lisätty tai ei ole enää odottamassa.',
      undone: 'Otettiin takaisin {xp} XP ({reason}).',
      nothingToUndo: 'Tässä sessiossa ei ole mitään kumottavaa.',
      nothingToUndoInstant:
        'XP on jo maksettu. Korjaa se käyttämällä give-komentoa negatiivisella määrällä.',
      sessionReset: 'Session XP ja bonukset tyhjennettiin. Mitään ei maksettu.',
      absent: 'Merkitty poissaoleviksi tässä sessiossa: {names}.',
      present: 'Merkitty paikalla oleviksi: {names}.',
      party: {
        add: 'Lisätty seurueeseen: {names}.',
        remove: 'Poistettu seurueesta: {names}.',
      },
    },
    warnings: {
      sandbox:
        'Jotkin hahmot käyttävät Beacon-lomaketta (kuten D&D 2024), jota Mod sandbox voi lukea ja kirjoittaa vain versiossa v1.5. Valitse sandbox v1.5 pelin Mod-asetuksista.',
      partyLegacy:
        'Roll20-seurue on Jumpgate-ominaisuus; tässä pelissä modi pitää omaa seurueluetteloaan.',
      nobodyToPay: 'Kukaan ei ole seurueessa, joten {xp} XP säilytetään myöhemmäksi.',
      write: {
        zero: '{name}: lomaketta ei voi asettaa 0 XP:hen modista. Muuta se lomakkeella.',
        sandbox: '{name}: tämä lomake tarvitsee Mod sandbox v1.5:n XP:n päivittämiseen.',
        xpless: '{name}: tämä pelijärjestelmä ei käytä XP:tä (tai lomake laskee sen itse).',
        noField:
          '{name}: tälle lomakkeelle ei tunneta XP-kenttää. Aseta Pelijärjestelmäksi custom ja nimeä kenttä.',
        error: '{name}: lomaketta ei voitu päivittää {xp} XP:llä. Katso Mod-konsoli.',
      },
    },
    errors: {
      gmOnly: 'Vain pelinjohtaja voi käyttää LazyExperience-komentoja.',
      failed: 'Jokin meni pieleen: {message}',
      unknownCommand: 'Tuntematon komento "{name}".',
      helpHint: 'Kirjoita {command} help nähdäksesi komennot.',
      unknownSetting: 'Tuntematon asetus "{name}".',
      settingsHint: 'Avaa asetuskortti nähdäksesi asetukset.',
      badValue: '"{value}" ei ole kelvollinen arvo asetukselle {name}.',
      badXp: 'Anna XP kokonaislukuna, esimerkiksi 250.',
      badShare: 'Anna osuus lukuna 0–10, esimerkiksi 0,5 tai 50 %.',
      noCharacters: 'Valitse hahmoja esittävät nappulat tai käytä --ids.',
      noTokens: 'Valitse ensin kukistetut nappulat tai käytä --ids.',
    },
    status: {
      version: 'Versio',
      sandbox: 'Mod sandbox',
      beacon: 'Beacon-lomakkeet luettavissa',
      commands: 'Komennot',
      profiles: 'Käytössä olevat pelijärjestelmät',
      characters: '{count} hahmoa',
      handouts: 'Katso handoutit {help} ja {deck}.',
    },
    log: {
      title: 'Sessiologi',
      sessionHeading: 'Sessio {number} — {date}',
      colCharacter: 'Hahmo',
      colXp: 'XP',
      awards: 'Palkkiot',
      levelUps: 'Tasot:',
      empty: 'Yhtään sessiota ei ole vielä päätetty.',
    },
    help: {
      menu: 'Näytä päävalikko.',
      add: 'Lisää XP session pottiin valinnaisella syyllä.',
      bonus: 'Anna valituille hahmoille bonus-XP osuuden lisäksi.',
      give: 'Maksa XP valituille hahmoille heti.',
      kill: 'Laske valitut nappulat kukistetuiksi ja lisää niiden XP.',
      killConfirm:
        'Lisää kukistetun olennon XP (kehotteen painike), tarvittaessa toisella määrällä.',
      absent: 'Merkitse valitut hahmot poissaoleviksi tässä sessiossa.',
      present: 'Merkitse valitut hahmot taas paikalla oleviksi.',
      share: 'Aseta valittujen hahmojen osuus (1 = koko).',
      exclude: 'Jätä hahmoja pois seurueesta tai ota ne takaisin mukaan.',
      undo: 'Ota takaisin viimeisin palkkio, jota ei ole maksettu.',
      end: 'Päätä sessio: maksa XP, ilmoita siitä ja kirjaa se lokiin.',
      resetSession: 'Tyhjennä session XP maksamatta sitä.',
      show: 'Näytä kunkin seurueen jäsenen XP ja taso lomakkeelta.',
      roster: 'Näytä seuruekortti.',
      party: 'Merkitse tai poista merkintä Roll20:n Party Member -ruudusta valituille hahmoille.',
      settings: 'Näytä asetuskortti.',
      set: 'Muuta asetusta.',
      lang: 'Valitse kieli.',
      status: 'Näytä sandbox, komennot ja käytössä olevat pelijärjestelmät.',
      log: 'Linkki Sessiologi-handoutiin.',
      journal: 'Rakenna handoutit uudelleen.',
      help: 'Näytä tämä ohje.',
      handouts: 'Lisää handouteissa {help} ja {deck}.',
    },
    deck: {
      session: 'Sessio',
      sessionDesc: 'Lisää XP sessioon, tarkista seurue ja päätä sessio.',
      selected: 'Valitut nappulat',
      selectedDesc: 'Valitse ensin nappulat kartalta.',
      party: 'Seurue',
      partyDesc: 'Ketkä jakavat XP:n.',
      tools: 'Työkalut',
      toolsDesc: 'Asetukset, tila ja ohje.',
      footer: 'Painikkeet ajavat LazyExperience-komentoja. Katso lisätiedot handoutista {help}.',
    },
    handout: {
      versionLabel: 'Versio',
      subtitle: 'Session kokemus, jaettuna reilusti, millä lomakkeella tahansa',
      footer: 'Painikkeet kaikille komennoille ovat handoutissa {deck}.',
      overview: {
        heading: 'Yleiskatsaus',
        body: 'LazyExperience kerää session aikana ansaitut kokemuspisteet, jakaa ne seurueen kesken ja kirjoittaa ne hahmolomakkeisiin. Se lukee ja kirjoittaa D&D 2024 -lomaketta sekä vanhempia ja muita lomakkeita, käyttää Roll20:n omaa seuruetta, huomaa kukistetut olennot, hoitaa poissaolevat pelaajat ja bonus-XP:n, ilmoittaa tasonnousut ja pitää lokia jokaisesta sessiosta.',
      },
      quickStart: {
        heading: 'Pikaopas',
        steps: [
          'Merkitse Party Member jokaiselle pelaajahahmolle (hahmoikkunan asetuksista) tai jätä väliin: pelaajien ohjaamia hahmoja käytetään.',
          'Kirjoita !lazyxp avataksesi valikon.',
          'Kun seurue kukistaa olennon, sen HP-palkin saavuttaessa nollan järjestelmä kysyy, lisätäänkö sen XP. Voit myös valita nappuloita ja painaa Kukistettu: Valitut.',
          'Lisää XP kaikesta muusta painikkeella Lisää XP ja bonus-XP yhdelle hahmolle painikkeella Bonus: Valitut.',
          'Merkitse sessiosta pois jääneet pelaajat Poissa-tilaan.',
          'Paina Päätä sessio. Jokaisen osuus kirjoitetaan heidän lomakkeisiinsa, ilmoitetaan ja lisätään Sessiologi-handoutiin.',
        ],
      },
      commands: {
        heading: 'Komennot',
        intro:
          'Jokainen komento alkaa merkinnällä !lazyxp; myös {long} toimii, samoin {short}, kunhan mikään muu XP-modi ei käytä sitä. Vain pelinjohtaja voi käyttää niitä.',
        targets:
          'Hahmoja koskevat komennot käyttävät valittuja nappuloita tai --ids-valitsinta, jota seuraavat pilkuilla erotetut hahmo- tai nappulatunnisteet.',
        colCommand: 'Komento',
        colDesc: 'Mitä se tekee',
      },
      party: {
        heading: 'Seurue',
        points: [
          'Automaattinen: kun jokin hahmo on merkitty Party Member -hahmoksi Roll20:ssa (Jumpgate), Roll20-seurue jakaa XP:n; muuten sen jakaa jokainen pelaajan ohjaama hahmo.',
          'Hahmoja, joita ohjaa vain "All players", kuten apunappuloita, ei lasketa.',
          'Seurue lisää ja Seurue poista merkitsevät tai poistavat Party Member -merkinnän valituilta hahmoilta.',
          'Jätä pois poistaa hahmon seurueesta pysyvästi; Ota mukaan palauttaa sen.',
          'Usean pelaajan ohjaama hahmo lasketaan kerran.',
        ],
      },
      splitting: {
        heading: 'XP:n jako',
        points: [
          'Session XP jaetaan osuuksien määrällä: yksi kutakin seurueen jäsentä kohti sekä mahdolliset lisäosuudet.',
          'Poissa olevat hahmot saavat asetuksen Poissaolijan osuus mukaisen osuuden (oletuksena 0 %). Poissaolo kestää yhden session.',
          'Hahmolla voi olla eri osuus, esimerkiksi 0,5 apuriksi.',
          'Bonus-XP menee valituille hahmoille osuuden lisäksi.',
          'XP, jota ei voi jakaa tasan, siirtyy seuraavaan sessioon.',
          'Kun Maksa XP on instant, jokainen palkkio jaetaan ja maksetaan heti.',
        ],
      },
      kills: {
        heading: 'Kukistetut olennot',
        points: [
          'Olento lasketaan kukistetuksi, kun sen HP-palkki putoaa nollaan, kun kukistettu-merkki asetetaan tai kun DeathTracker merkitsee sen kuolleeksi.',
          'TokenModin, lomakkeen tai muiden modien linkitetyn attribuutin kautta tekemät muutokset huomataan myös.',
          'Vain sellaisten seurueen ulkopuolisten hahmojen nappulat lasketaan, joita ei ohjaa yksikään pelaaja, ja kukin nappula vain kerran sessiossa.',
          'XP tulee lomakkeelta: olennon XP-arvo tai sen haastetaso.',
          'Kysy pelinjohtajalta (oletus) kuiskaa kehotteen, jossa on Lisää, Muu määrä ja Ohita. Lisää automaattisesti ohittaa kehotteen.',
        ],
      },
      levels: {
        heading: 'Tason nousut',
        points: [
          'XP:n kirjoittamisen jälkeen LazyExperience tarkistaa järjestelmän tasotaulukon ja ilmoittaa, kun hahmolla on tarpeeksi XP:tä uuteen tasoon.',
          'D&D 2024 -lomakkeella pelaaja painaa sitten lomakkeen tasonnousupainiketta.',
        ],
      },
      systems: {
        heading: 'Pelijärjestelmät',
        intro:
          'LazyExperience valitsee profiilin kunkin hahmon lomakkeesta. Aseta Pelijärjestelmä pakottaaksesi yhden tai arvoon custom nimetäksesi kentät itse.',
        colSystem: 'Järjestelmä',
        colId: 'Tunniste',
        colSheets: 'Lomakkeet',
        colChecked: 'Tarkistettu',
        verified: {
          live: 'Testattu Roll20:ssa',
          partial: 'Osittain testattu Roll20:ssa',
          source: 'Lomakkeen lähdekoodista',
          none: '—',
        },
        points: [
          'Valitse lomake sen nimellä pelin Asetuksista. Luettelossa olemattomat lomakkeet käyttävät yleisiä kenttänimiä experience, xp ja level, tai aseta Pelijärjestelmä arvoon custom.',
          'Testattu Roll20:ssa tarkoittaa, että XP kirjoitettiin kyseiseen lomakkeeseen Jumpgate-pelissä, lomakkeen omat laskutoimitukset suoritettiin ja kukistetut olennot sekä tasonnousuilmoitukset tarkistettiin.',
          'Beacon-lomakkeet kuten D&D 2024 tarvitsevat Mod sandbox v1.5:n, eikä Modi voi asettaa niitä 0 XP:hen.',
          'Pathfinder 1E ja Starfinder käyttävät tasonnousuilmoituksiin lomakkeen kenttää, jossa on XP seuraavaan tasoon. Kun se on tyhjä, Pathfinder käyttää keskinopeaa etenemistä ja Starfinder omaa taulukkoaan.',
          'WFRP 4E: jokainen palkinto lisätään riviksi lomakkeen Experience-luetteloon, mutta lomake ei laskenut XP-summiaan uudelleen testauksessa, joten tarkista ne lomakkeelta.',
          'Savage Worlds, 13th Age, Cosmere ja Call of Cthulhu eivät käytä XP:tä, jonka Modi voisi kirjoittaa.',
        ],
      },
      settings: {
        heading: 'Asetukset',
        intro: 'Muuta asetuksia asetuskortilla tai komennolla !lazyxp set <setting> <value>.',
        colKey: 'Asetus',
        colName: 'Nimi',
        colDesc: 'Mitä se tekee',
      },
      upgrading: {
        heading: 'Päivitys versiosta 0.1',
        points: [
          'Asetukset, session XP ja hahmokohtainen lisä-XP versiosta 0.1 siirretään, kun 1.0 käynnistyy ensimmäisen kerran.',
          'Pelaajat tai hahmot, jotka eivät olleet aktiivisia, jätetään pois seurueesta.',
          'Versiosta 0.1 peräisin oleva oma komennon nimi toimii edelleen.',
          'Vanhat komennot toimivat yhä:',
        ],
        colV1: '0.1',
        colV2: '1.0',
      },
      troubleshooting: {
        heading: 'Vianetsintä',
        points: [
          'D&D 2024 -lomakkeisiin ei kirjoiteta mitään: tarkista, että peli käyttää Mod sandbox v1.5:tä (!lazyxp status).',
          'Olento antaa 0 XP: sen lomakkeella ei ole XP:tä eikä haastetasoa. Käytä Muu määrä -painiketta tai !lazyxp kill --xp 100.',
          'Kukistuksia ei huomata: tarkista, että HP-palkki on se palkki, joka sisältää osumapisteet.',
          '!xp ei tee mitään: toinen XP-modi käyttää sitä. Käytä !lazyxp.',
        ],
      },
      languages: {
        heading: 'Kielet',
        body: 'Valitse kieli komennolla !lazyxp lang. Chat-kortit ja handoutit vaihtuvat heti.',
        colLanguage: 'Kieli',
        colNative: 'Nimi',
        colCode: 'Koodi',
      },
      credits: {
        heading: 'Kiitokset',
        original: 'Luonut',
        maintainer: 'Uudelleenkirjoittanut ja ylläpitäjä',
        support: 'Vikailmoitukset ja ideat ovat tervetulleita Roll20-foorumille.',
      },
    },
  };

  var localeFr = {
    titles: {
      ready: 'LazyExperience est prêt.',
      help: 'Aide de LazyExperience',
      settings: 'Réglages de LazyExperience',
      status: 'État de LazyExperience',
      roster: 'Groupe',
      language: 'Langue',
      levelUp: 'Niveau supérieur !',
      defeated: 'Créature vaincue',
      xpAwarded: 'Expérience attribuée',
      sessionEnded: 'Séance {number} terminée',
      yourXp: 'Votre expérience',
      pool: 'PX de la séance',
      bonus: 'PX bonus',
      undo: 'Annuler',
      log: 'Journal de séance',
      partyXp: 'Expérience du groupe',
    },
    menu: {
      session: 'Séance',
      pool: 'PX de la séance',
      payout: 'Versé',
      shares: 'Parts',
      perShare: 'PX par part',
      party: 'Groupe ({source})',
      noParty:
        'Personne n’est encore dans le groupe. Ouvrez la fiche Groupe pour ajouter des personnages.',
      absentTag: '(absent)',
      bonusTag: '(+{xp} de bonus)',
      levelTag: 'Niveau {level}',
      shareTag: 'Part {share}',
      rosterSource: 'Groupe issu de',
      excluded: 'Exclus',
      blank: '(vide)',
      groupXp: 'Expérience',
      groupParty: 'Groupe',
      groupKills: 'Créatures vaincues',
      groupSheet: 'Fiche de personnage',
    },
    buttons: {
      menu: 'Menu',
      help: 'Aide',
      settings: 'Réglages',
      status: 'État',
      roster: 'Groupe',
      addXp: 'Ajouter des PX',
      killSelected: 'Vaincus : sélection',
      bonusSelected: 'Bonus : sélection',
      giveSelected: 'Donner maintenant : sélection',
      endSession: 'Terminer la séance',
      undo: 'Annuler',
      show: 'PX du groupe',
      log: 'Journal de séance',
      absent: 'Absent',
      present: 'Présent',
      share: 'Part',
      exclude: 'Exclure',
      include: 'Inclure',
      partyAdd: 'Ajouter la sélection au groupe',
      partyRemove: 'Retirer la sélection',
      addKill: 'Ajouter {xp} PX',
      otherXp: 'Autre montant',
      ignore: 'Ignorer',
    },
    prompts: {
      xp: 'PX',
      reason: 'Raison (facultatif)',
      share: 'Part (1 = complète, 0,5 = moitié)',
      confirmEnd: 'Terminer la séance et distribuer les PX ?',
    },
    options: {
      yesNo: { yes: 'Oui', no: 'Non' },
      payout: { end: 'À la fin de la séance', instant: 'Immédiatement' },
      roster: {
        auto: 'Automatique',
        party: 'Groupe Roll20',
        players: 'Personnages des joueurs',
        manual: 'Choisi par le MJ',
      },
      killMode: { prompt: 'Demander au MJ', auto: 'Ajouter automatiquement', off: 'Désactivé' },
      announce: {
        public: 'Tout le monde',
        whisper: 'Les joueurs concernés',
        gm: 'MJ uniquement',
        off: 'Désactivé',
      },
      levelNotice: {
        public: 'Tout le monde',
        whisper: 'Le joueur et le MJ',
        gm: 'MJ uniquement',
        off: 'Désactivé',
      },
      system: { auto: 'Détecter d’après la fiche' },
    },
    settings: {
      language: { label: 'Langue', desc: 'Langue des cartes de chat et des handouts.' },
      payout: {
        label: 'Versement des PX',
        desc: 'end : les PX s’accumulent dans la réserve de la séance et sont distribués à la fin de la séance. instant : chaque attribution est partagée et versée immédiatement.',
      },
      updateSheets: {
        label: 'Mettre à jour les fiches',
        desc: 'Écrit les PX sur les fiches de personnage. Désactivé, les totaux sont seulement annoncés.',
      },
      system: {
        label: 'Système de jeu',
        desc: 'Quels champs de la fiche contiennent les PX et le niveau. auto choisit le profil d’après la fiche de chaque personnage ; custom utilise les réglages de champs personnalisés.',
      },
      roster: {
        label: 'Groupe issu de',
        desc: 'auto : le groupe Roll20 s’il contient quelqu’un, sinon les personnages contrôlés par des joueurs. party, players ou manual en imposent un.',
      },
      absentShare: {
        label: 'Part des absents',
        desc: 'Fraction de part qu’un personnage absent reçoit tout de même, de 0 % (rien) à 100 % (complète).',
      },
      extraShares: {
        label: 'Parts supplémentaires',
        desc: 'Parts pour les compagnons ou les mercenaires qui n’ont pas de fiche. Leurs PX ne sont versés à personne.',
      },
      killMode: {
        label: 'Créatures vaincues',
        desc: 'prompt : demander au MJ avant d’ajouter les PX d’une créature. auto : les ajouter immédiatement. off : ne pas surveiller les pions.',
      },
      killBar: {
        label: 'Surveiller la jauge de PV',
        desc: 'Considère une créature comme vaincue quand sa jauge de PV tombe à 0 ou moins.',
      },
      hpBar: {
        label: 'Jauge de PV',
        desc: 'Quelle jauge du pion (1, 2 ou 3) contient les points de vie.',
      },
      killMarker: {
        label: 'Surveiller le marqueur',
        desc: 'Considère une créature comme vaincue quand le marqueur de défaite est posé sur son pion.',
      },
      marker: {
        label: 'Marqueur de défaite',
        desc: 'Le marqueur qui signifie vaincu : un nom intégré comme dead, ou le nom d’un marqueur personnalisé.',
      },
      killDeathTracker: {
        label: 'Utiliser DeathTracker',
        desc: 'Considère une créature comme vaincue quand DeathTracker 1.0 ou ultérieur la marque comme morte.',
      },
      announce: {
        label: 'Messages de PX',
        desc: 'Qui voit les attributions de PX et le résumé de fin de séance : public, whisper (joueurs concernés et MJ), gm ou off.',
      },
      levelNotice: {
        label: 'Annonces de niveau',
        desc: 'Qui voit les annonces de montée de niveau : public, whisper (le joueur et le MJ), gm ou off.',
      },
      customXp: {
        label: 'Champ de PX personnalisé',
        desc: 'Champ de la fiche pour les PX d’un personnage quand le système de jeu est custom. Une liste essaie chaque nom à tour de rôle.',
      },
      customLevel: {
        label: 'Champ de niveau personnalisé',
        desc: 'Champ de la fiche pour le niveau d’un personnage.',
      },
      customNpcXp: {
        label: 'Champ de PX de créature personnalisé',
        desc: 'Champ de la fiche pour les PX que vaut une créature.',
      },
      customNpcCr: {
        label: 'Champ de dangerosité personnalisé',
        desc: 'Champ de la fiche pour l’indice de dangerosité d’une créature, utilisé quand elle n’a pas de valeur de PX.',
      },
      customLevels: {
        label: 'Table de niveaux personnalisée',
        desc: 'PX nécessaires pour chaque niveau, à partir du niveau 1, par exemple 0,300,900,2700. Vide, les annonces de niveau sont désactivées pour les fiches personnalisées.',
      },
    },
    roster: {
      explain: {
        party: 'Les personnages cochés Party Member dans Roll20 se partagent les PX.',
        players:
          'Les personnages contrôlés par un joueur se partagent les PX. Cochez Party Member sur des personnages pour utiliser plutôt le groupe Roll20.',
        manual: 'Seuls les personnages que vous incluez se partagent les PX.',
      },
      selectHint: 'Sélectionnez d’abord des pions pour les ajouter au groupe ou les en retirer.',
    },
    kills: {
      prompt: '{name} a été vaincu. Ajouter {xp} PX à la séance ?',
      noXp: '{name} a été vaincu, mais sa fiche n’indique aucune valeur de PX.',
      reason: '{name} vaincu',
      result: {
        prompted: 'demandé',
        added: 'ajouté',
        counted: 'déjà compté pendant cette séance',
        noXp: 'aucun PX sur la fiche : utilisez --xp',
        notCreature: 'pas une créature (aucune fiche, ou dans le groupe)',
      },
    },
    levels: {
      reached: '{name} a assez de PX pour le niveau {level} !',
      sheetButton: 'Utilisez le bouton Level Up de la fiche de personnage.',
      updateSheet: 'Mettez à jour le niveau sur la fiche de personnage.',
      pf2: 'Augmentez le niveau sur la fiche et retirez 1 000 PX.',
      spend: 'Dépensez les PX et augmentez le niveau sur la fiche.',
    },
    instant: {
      everyone: 'Tout le groupe gagne {xp} PX.',
      bonus: '{names} gagnent {xp} PX.',
    },
    end: {
      nothing: 'Aucun PX n’a été attribué pendant cette séance.',
      playerLine: '{name} gagne {xp} PX pendant cette séance.',
      playerLineTotal: '{name} gagne {xp} PX pendant cette séance, soit {total} PX au total.',
      levelLine: '{name} a atteint le niveau {level}.',
      remainder:
        '{xp} PX n’ont pas pu être partagés équitablement et sont reportés à la séance suivante.',
    },
    show: {
      noXp: 'aucun PX sur la fiche',
      next: 'niveau suivant à {xp}',
    },
    awardKinds: { pool: 'PX de la séance', bonus: 'PX bonus', give: 'PX donnés' },
    messages: {
      saved: 'Enregistré.',
      commands: 'Commandes : {commands}',
      aliasTaken: '{alias} est réservé à {mods}. Utilisez !lazyxp.',
      migrated:
        'Vos réglages, les PX de séance et les PX supplémentaires de LazyExperience 0.1 ont été repris.',
      handouts: 'Les handouts Help, Command Deck et Session Log ont été reconstruits.',
      noLog: 'Aucune séance n’est encore terminée, donc il n’y a pas de Session Log.',
      poolAdded: '{xp} PX ajoutés à la séance.',
      bonusAdded: '{xp} PX bonus pour {names}.',
      killAdded: '{xp} PX pour {name} ajoutés à la séance.',
      killGone: 'Cette victoire a déjà été ajoutée ou n’est plus en attente.',
      undone: '{xp} PX retirés ({reason}).',
      nothingToUndo: 'Il n’y a rien à annuler pendant cette séance.',
      nothingToUndoInstant:
        'Les PX ont déjà été versés. Utilisez give avec un montant négatif pour corriger.',
      sessionReset: 'Les PX de séance et les bonus ont été effacés. Rien n’a été versé.',
      absent: 'Marqués absents pour cette séance : {names}.',
      present: 'Marqués présents : {names}.',
      party: {
        add: 'Ajoutés au groupe : {names}.',
        remove: 'Retirés du groupe : {names}.',
      },
    },
    warnings: {
      sandbox:
        'Certains personnages utilisent une fiche Beacon (comme D&D 2024), que le Mod sandbox ne peut lire et écrire qu’en v1.5. Choisissez Mod sandbox v1.5 dans les réglages Mod de la partie.',
      partyLegacy:
        'Le groupe Roll20 est une fonctionnalité de Jumpgate ; dans cette partie, le Mod garde sa propre liste de groupe.',
      nobodyToPay: 'Personne n’est dans le groupe, donc {xp} PX sont gardés pour plus tard.',
      write: {
        zero: '{name} : la fiche ne peut pas être mise à 0 PX depuis un Mod. Modifiez-la sur la fiche.',
        sandbox: '{name} : cette fiche nécessite Mod sandbox v1.5 pour mettre à jour les PX.',
        xpless:
          '{name} : ce système de jeu n’utilise pas de PX (ou la fiche les calcule elle-même).',
        noField:
          '{name} : aucun champ de PX n’est connu pour cette fiche. Réglez le système de jeu sur custom et indiquez le champ.',
        error:
          '{name} : la fiche n’a pas pu être mise à jour avec {xp} PX. Consultez la console du Mod.',
      },
    },
    errors: {
      gmOnly: 'Seul le MJ peut utiliser les commandes de LazyExperience.',
      failed: 'Une erreur est survenue : {message}',
      unknownCommand: 'Commande inconnue « {name} ».',
      helpHint: 'Tapez {command} help pour voir les commandes.',
      unknownSetting: 'Réglage inconnu « {name} ».',
      settingsHint: 'Ouvrez la carte des réglages pour les voir.',
      badValue: '« {value} » n’est pas une valeur valide pour {name}.',
      badXp: 'Indiquez les PX sous forme de nombre entier, par exemple 250.',
      badShare: 'Indiquez la part sous forme de nombre de 0 à 10, par exemple 0.5 ou 50 %.',
      noCharacters: 'Sélectionnez des pions qui représentent des personnages, ou utilisez --ids.',
      noTokens: 'Sélectionnez d’abord les pions vaincus, ou utilisez --ids.',
    },
    status: {
      version: 'Version',
      sandbox: 'Mod sandbox',
      beacon: 'Fiches Beacon lisibles',
      commands: 'Commandes',
      profiles: 'Systèmes de jeu utilisés',
      characters: '{count} personnages',
      handouts: 'Voir les handouts {help} et {deck}.',
    },
    log: {
      title: 'Journal de séance',
      sessionHeading: 'Séance {number} — {date}',
      colCharacter: 'Personnage',
      colXp: 'PX',
      awards: 'Attributions',
      levelUps: 'Niveaux :',
      empty: 'Aucune séance n’est encore terminée.',
    },
    help: {
      menu: 'Affiche le menu principal.',
      add: 'Ajoute des PX à la réserve de la séance, avec une raison facultative.',
      bonus: 'Donne des PX bonus aux personnages sélectionnés, en plus de leur part.',
      give: 'Verse immédiatement des PX aux personnages sélectionnés.',
      kill: 'Compte les pions sélectionnés comme vaincus et ajoute leurs PX.',
      killConfirm:
        'Ajoute les PX d’une créature vaincue (le bouton de l’invite), éventuellement avec un autre montant.',
      absent: 'Marque les personnages sélectionnés comme absents pour cette séance.',
      present: 'Marque de nouveau les personnages sélectionnés comme présents.',
      share: 'Définit la part des personnages sélectionnés (1 = complète).',
      exclude: 'Exclut des personnages du groupe, ou les inclut de nouveau.',
      undo: 'Annule la dernière attribution qui n’a pas été versée.',
      end: 'Termine la séance : verse les PX, les annonce et les consigne.',
      resetSession: 'Efface les PX de la séance sans les verser.',
      show: 'Affiche les PX et le niveau de chaque membre du groupe d’après la fiche.',
      roster: 'Affiche la carte du groupe.',
      party: 'Coche ou décoche la case Party Member de Roll20 pour les personnages sélectionnés.',
      settings: 'Affiche la carte des réglages.',
      set: 'Modifie un réglage.',
      lang: 'Choisit la langue.',
      status: 'Affiche le sandbox, les commandes et les systèmes de jeu utilisés.',
      log: 'Lien vers le handout Session Log.',
      journal: 'Reconstruit les handouts.',
      help: 'Affiche cette aide.',
      handouts: 'Plus de détails dans les handouts {help} et {deck}.',
    },
    deck: {
      session: 'Séance',
      sessionDesc: 'Ajoutez des PX à la séance, vérifiez le groupe et terminez la séance.',
      selected: 'Pions sélectionnés',
      selectedDesc: 'Sélectionnez d’abord des pions sur la carte.',
      party: 'Groupe',
      partyDesc: 'Qui se partage les PX.',
      tools: 'Outils',
      toolsDesc: 'Réglages, état et aide.',
      footer:
        'Les boutons lancent des commandes LazyExperience. Voir le handout {help} pour les détails.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'L’expérience de séance, partagée équitablement, sur n’importe quelle fiche',
      footer: 'Les boutons de toutes les commandes se trouvent dans le handout {deck}.',
      overview: {
        heading: 'Présentation',
        body: 'LazyExperience collecte les points d’expérience gagnés pendant une séance, les répartit entre le groupe et les écrit sur les fiches de personnage. Il lit et écrit la fiche D&D 2024 ainsi que les fiches plus anciennes ou différentes, utilise le groupe propre à Roll20, repère les créatures vaincues, gère les joueurs absents et les PX bonus, annonce les montées de niveau et tient un journal de chaque séance.',
      },
      quickStart: {
        heading: 'Démarrage rapide',
        steps: [
          'Cochez Party Member sur chaque personnage joueur (dans les réglages de la fenêtre du personnage), ou laissez tel quel : les personnages contrôlés par des joueurs sont utilisés.',
          'Tapez !lazyxp pour ouvrir le menu.',
          'Quand le groupe vainc une créature, sa jauge de PV qui atteint 0 vous demande s’il faut ajouter ses PX. Vous pouvez aussi sélectionner des pions et appuyer sur Vaincus : sélection.',
          'Ajoutez des PX pour tout le reste avec Ajouter des PX, et des PX bonus pour un personnage avec Bonus : sélection.',
          'Marquez Absent les joueurs qui ont manqué la séance.',
          'Appuyez sur Terminer la séance. La part de chacun est écrite sur sa fiche, annoncée et ajoutée au handout Session Log.',
        ],
      },
      commands: {
        heading: 'Commandes',
        intro:
          'Chaque commande commence par !lazyxp; {long} fonctionne aussi, et {short} également tant qu’aucun autre Mod de PX ne l’utilise. Seul le MJ peut les utiliser.',
        targets:
          'Les commandes pour les personnages utilisent les pions sélectionnés, ou --ids suivi d’identifiants de personnages ou de pions séparés par des virgules.',
        colCommand: 'Commande',
        colDesc: 'Ce qu’elle fait',
      },
      party: {
        heading: 'Le groupe',
        points: [
          'Automatique : quand un personnage est coché Party Member dans Roll20 (Jumpgate), le groupe Roll20 se partage les PX ; sinon, c’est chaque personnage contrôlé par un joueur.',
          'Les personnages contrôlés uniquement par « Tous les joueurs », comme les pions d’aide, ne sont pas comptés.',
          'Ajouter au groupe et Retirer du groupe cochent ou décochent Party Member pour les personnages sélectionnés.',
          'Exclure retire définitivement un personnage du groupe ; Inclure le remet.',
          'Un personnage contrôlé par plusieurs joueurs ne compte qu’une fois.',
        ],
      },
      splitting: {
        heading: 'Partage des PX',
        points: [
          'Les PX de la séance sont divisés par le nombre de parts : une par membre du groupe, plus les parts supplémentaires.',
          'Les personnages absents reçoivent le réglage Part des absents (0 % par défaut). L’absence dure une séance.',
          'Un personnage peut avoir une part différente, par exemple 0.5 pour un acolyte.',
          'Les PX bonus vont aux personnages choisis, en plus de leur part.',
          'Les PX qui ne se divisent pas équitablement sont reportés à la séance suivante.',
          'Avec le versement des PX réglé sur instant, chaque attribution est partagée et versée immédiatement.',
        ],
      },
      kills: {
        heading: 'Créatures vaincues',
        points: [
          'Une créature est considérée comme vaincue quand sa jauge de PV tombe à 0, quand le marqueur de défaite est posé, ou quand DeathTracker la marque comme morte.',
          'Les changements faits par TokenMod, par la fiche ou par d’autres Mods via l’attribut lié sont aussi repérés.',
          'Seuls les pions de personnages hors du groupe qu’aucun joueur ne contrôle sont comptés, et chaque pion une seule fois par séance.',
          'Les PX viennent de la fiche : la valeur de PX de la créature, ou son indice de dangerosité.',
          'Demander au MJ (par défaut) envoie en chuchotement une invite avec Ajouter, Autre montant et Ignorer. Ajouter automatiquement évite l’invite.',
        ],
      },
      levels: {
        heading: 'Montées de niveau',
        points: [
          'Une fois les PX écrits, LazyExperience consulte la table de niveaux du système et annonce quand un personnage a assez de PX pour un nouveau niveau.',
          'Sur la fiche D&D 2024, le joueur appuie ensuite sur le bouton Level Up de la fiche.',
        ],
      },
      systems: {
        heading: 'Systèmes de jeu',
        intro:
          'LazyExperience choisit un profil d’après la fiche de chaque personnage. Réglez le système de jeu pour en imposer un, ou sur custom pour nommer vous-même les champs.',
        colSystem: 'Système',
        colId: 'ID',
        colSheets: 'Fiches',
        colChecked: 'Vérifié',
        verified: {
          live: 'Testé dans Roll20',
          partial: 'Partiellement testé dans Roll20',
          source: 'D’après la source de la fiche',
          none: '—',
        },
        points: [
          'Choisissez la fiche par son nom dans les Réglages de la partie. Les fiches non listées utilisent les noms de champ courants experience, xp et level, ou réglez le système de jeu sur custom.',
          'Testé dans Roll20 signifie que des PX ont été écrits sur cette fiche dans une partie Jumpgate, que les calculs propres à la fiche ont tourné, et que les créatures vaincues et les annonces de niveau ont été vérifiées.',
          'Les fiches Beacon comme D&D 2024 nécessitent Mod sandbox v1.5, et un Mod ne peut pas les mettre à 0 PX.',
          'Pathfinder 1E et Starfinder utilisent la case de PX pour le niveau suivant de la fiche pour les annonces de niveau. Quand elle est vide, Pathfinder utilise la progression moyenne et Starfinder sa propre table.',
          'WFRP 4E : chaque attribution est ajoutée comme une ligne dans la liste Experience de la fiche, mais lors des tests la fiche n’a pas recalculé ses totaux de PX ; vérifiez-les sur la fiche.',
          'Savage Worlds, 13th Age, Cosmere et Call of Cthulhu n’ont pas de PX qu’un Mod puisse écrire.',
        ],
      },
      settings: {
        heading: 'Réglages',
        intro:
          'Modifiez les réglages sur la carte des réglages, ou avec !lazyxp set <réglage> <valeur>.',
        colKey: 'Réglage',
        colName: 'Nom',
        colDesc: 'Ce qu’il fait',
      },
      upgrading: {
        heading: 'Passer de la version 0.1',
        points: [
          'Les réglages, les PX de séance et les PX supplémentaires par personnage de la 0.1 sont repris au premier démarrage de la 1.0.',
          'Les joueurs ou personnages qui n’étaient pas actifs sont exclus du groupe.',
          'Un nom de commande personnalisé de la 0.1 continue de fonctionner.',
          'Les anciennes commandes fonctionnent toujours :',
        ],
        colV1: '0.1',
        colV2: '1.0',
      },
      troubleshooting: {
        heading: 'Dépannage',
        points: [
          'Rien n’est écrit sur les fiches D&D 2024 : vérifiez que la partie utilise Mod sandbox v1.5 (!lazyxp status).',
          'Une créature donne 0 PX : sa fiche n’a ni PX ni indice de dangerosité. Utilisez Autre montant, ou !lazyxp kill --xp 100.',
          'Les victoires ne sont pas repérées : vérifiez que la jauge de PV est bien celle qui contient les points de vie.',
          '!xp ne fait rien : un autre Mod de PX l’utilise. Utilisez !lazyxp.',
        ],
      },
      languages: {
        heading: 'Langues',
        body: 'Choisissez une langue avec !lazyxp lang. Les cartes de chat et les handouts changent aussitôt.',
        colLanguage: 'Langue',
        colNative: 'Nom',
        colCode: 'Code',
      },
      credits: {
        heading: 'Crédits',
        original: 'Créé par',
        maintainer: 'Réécrit et maintenu par',
        support: 'Les rapports de bogues et les idées sont les bienvenus sur le forum Roll20.',
      },
    },
  };

  var localeDe = {
    titles: {
      ready: 'LazyExperience ist bereit.',
      help: 'LazyExperience-Hilfe',
      settings: 'LazyExperience-Einstellungen',
      status: 'LazyExperience-Status',
      roster: 'Gruppe',
      language: 'Sprache',
      levelUp: 'Stufenaufstieg!',
      defeated: 'Kreatur besiegt',
      xpAwarded: 'Erfahrung vergeben',
      sessionEnded: 'Sitzung {number} beendet',
      yourXp: 'Deine Erfahrung',
      pool: 'Sitzungs-EP',
      bonus: 'Bonus-EP',
      undo: 'Rückgängig',
      log: 'Sitzungsprotokoll',
      partyXp: 'Gruppenerfahrung',
    },
    menu: {
      session: 'Sitzung',
      pool: 'Sitzungs-EP',
      payout: 'Ausgezahlt',
      shares: 'Anteile',
      perShare: 'EP pro Anteil',
      party: 'Gruppe ({source})',
      noParty:
        'Noch niemand ist in der Gruppe. Öffne die Gruppenkarte, um Charaktere hinzuzufügen.',
      absentTag: '(abwesend)',
      bonusTag: '(+{xp} Bonus)',
      levelTag: 'Stufe {level}',
      shareTag: 'Anteil {share}',
      rosterSource: 'Gruppe aus',
      excluded: 'Ausgeschlossen',
      blank: '(leer)',
      groupXp: 'Erfahrung',
      groupParty: 'Gruppe',
      groupKills: 'Besiegte Kreaturen',
      groupSheet: 'Charakterbogen',
    },
    buttons: {
      menu: 'Menü',
      help: 'Hilfe',
      settings: 'Einstellungen',
      status: 'Status',
      roster: 'Gruppe',
      addXp: 'EP hinzufügen',
      killSelected: 'Besiegt: Auswahl',
      bonusSelected: 'Bonus: Auswahl',
      giveSelected: 'Jetzt geben: Auswahl',
      endSession: 'Sitzung beenden',
      undo: 'Rückgängig',
      show: 'Gruppen-EP',
      log: 'Sitzungsprotokoll',
      absent: 'Abwesend',
      present: 'Anwesend',
      share: 'Anteil',
      exclude: 'Ausschließen',
      include: 'Einschließen',
      partyAdd: 'Auswahl zur Gruppe hinzufügen',
      partyRemove: 'Auswahl entfernen',
      addKill: '{xp} EP hinzufügen',
      otherXp: 'Anderer Betrag',
      ignore: 'Ignorieren',
    },
    prompts: {
      xp: 'EP',
      reason: 'Grund (optional)',
      share: 'Anteil (1 = voll, 0,5 = halb)',
      confirmEnd: 'Die Sitzung beenden und die EP verteilen?',
    },
    options: {
      yesNo: { yes: 'Ja', no: 'Nein' },
      payout: { end: 'Am Ende der Sitzung', instant: 'Sofort' },
      roster: {
        auto: 'Automatisch',
        party: 'Roll20-Gruppe',
        players: 'Charaktere der Spieler',
        manual: 'Vom SL gewählt',
      },
      killMode: { prompt: 'SL fragen', auto: 'Automatisch hinzufügen', off: 'Aus' },
      announce: { public: 'Alle', whisper: 'Die betroffenen Spieler', gm: 'Nur SL', off: 'Aus' },
      levelNotice: {
        public: 'Alle',
        whisper: 'Der Spieler und der SL',
        gm: 'Nur SL',
        off: 'Aus',
      },
      system: { auto: 'Aus dem Charakterbogen erkennen' },
    },
    settings: {
      language: { label: 'Sprache', desc: 'Sprache für Chatkarten und Handouts.' },
      payout: {
        label: 'EP auszahlen',
        desc: 'end: Die EP sammeln sich im Sitzungspool und werden am Ende der Sitzung verteilt. instant: Jede Vergabe wird sofort aufgeteilt und ausgezahlt.',
      },
      updateSheets: {
        label: 'Charakterbögen aktualisieren',
        desc: 'Schreibt die EP in die Charakterbögen. Ist die Option aus, werden die Summen nur verkündet.',
      },
      system: {
        label: 'Spielsystem',
        desc: 'Welche Bogenfelder EP und Stufe enthalten. auto wählt das Profil anhand des Bogens jedes Charakters; custom nutzt die eigenen Feldeinstellungen.',
      },
      roster: {
        label: 'Gruppe aus',
        desc: 'auto: die Roll20-Gruppe, wenn jemand darin ist, sonst von Spielern gesteuerte Charaktere. party, players oder manual wählen eine Quelle fest.',
      },
      absentShare: {
        label: 'Anteil für Abwesende',
        desc: 'Teil eines Anteils, den ein abwesender Charakter trotzdem erhält, von 0 % (nichts) bis 100 % (voll).',
      },
      extraShares: {
        label: 'Zusätzliche Anteile',
        desc: 'Anteile für Gefährten oder Gefolgsleute ohne Charakterbogen. Ihre EP werden an niemanden ausgezahlt.',
      },
      killMode: {
        label: 'Besiegte Kreaturen',
        desc: 'prompt: den SL fragen, bevor die EP einer Kreatur hinzugefügt werden. auto: sofort hinzufügen. off: Spielfiguren nicht überwachen.',
      },
      killBar: {
        label: 'TP-Balken überwachen',
        desc: 'Eine Kreatur gilt als besiegt, wenn ihr TP-Balken auf 0 oder darunter fällt.',
      },
      hpBar: {
        label: 'TP-Balken',
        desc: 'Welcher Balken der Spielfigur (1, 2 oder 3) die Trefferpunkte enthält.',
      },
      killMarker: {
        label: 'Marker überwachen',
        desc: 'Eine Kreatur gilt als besiegt, wenn der Besiegt-Marker auf ihre Spielfigur gesetzt wird.',
      },
      marker: {
        label: 'Besiegt-Marker',
        desc: 'Der Marker, der „besiegt“ bedeutet: ein eingebauter Name wie dead oder der Name eines eigenen Markers.',
      },
      killDeathTracker: {
        label: 'DeathTracker verwenden',
        desc: 'Eine Kreatur gilt als besiegt, wenn DeathTracker 1.0 oder neuer sie als tot markiert.',
      },
      announce: {
        label: 'EP-Nachrichten',
        desc: 'Wer EP-Vergaben und die Zusammenfassung am Sitzungsende sieht: public, whisper (betroffene Spieler und SL), gm oder off.',
      },
      levelNotice: {
        label: 'Stufenaufstiegs-Hinweise',
        desc: 'Wer Stufenaufstiegs-Hinweise sieht: public, whisper (der Spieler und der SL), gm oder off.',
      },
      customXp: {
        label: 'Eigenes EP-Feld',
        desc: 'Bogenfeld für die EP eines Charakters, wenn das Spielsystem custom ist. Bei einer Liste wird jeder Name der Reihe nach versucht.',
      },
      customLevel: {
        label: 'Eigenes Stufenfeld',
        desc: 'Bogenfeld für die Stufe eines Charakters.',
      },
      customNpcXp: {
        label: 'Eigenes Kreatur-EP-Feld',
        desc: 'Bogenfeld für die EP, die eine Kreatur wert ist.',
      },
      customNpcCr: {
        label: 'Eigenes Herausforderungsfeld',
        desc: 'Bogenfeld für den Herausforderungsgrad einer Kreatur, verwendet, wenn sie keinen EP-Wert hat.',
      },
      customLevels: {
        label: 'Eigene Stufentabelle',
        desc: 'Benötigte EP für jede Stufe, ab Stufe 1, zum Beispiel 0,300,900,2700. Leer schaltet die Stufenaufstiegs-Hinweise für eigene Bögen aus.',
      },
    },
    roster: {
      explain: {
        party: 'Charaktere, bei denen in Roll20 Party Member angehakt ist, teilen sich die EP.',
        players:
          'Von einem Spieler gesteuerte Charaktere teilen sich die EP. Hake bei Charakteren Party Member an, um stattdessen die Roll20-Gruppe zu verwenden.',
        manual: 'Nur Charaktere, die du einschließt, teilen sich die EP.',
      },
      selectHint:
        'Wähle zuerst Spielfiguren aus, um sie zur Gruppe hinzuzufügen oder zu entfernen.',
    },
    kills: {
      prompt: '{name} wurde besiegt. {xp} EP zur Sitzung hinzufügen?',
      noXp: '{name} wurde besiegt, aber sein Bogen hat keinen EP-Wert.',
      reason: '{name} besiegt',
      result: {
        prompted: 'nachgefragt',
        added: 'hinzugefügt',
        counted: 'in dieser Sitzung bereits gezählt',
        noXp: 'keine EP auf dem Bogen: --xp verwenden',
        notCreature: 'keine Kreatur (kein Bogen oder in der Gruppe)',
      },
    },
    levels: {
      reached: '{name} hat genug EP für Stufe {level}!',
      sheetButton: 'Nutze die Schaltfläche Level Up auf dem Charakterbogen.',
      updateSheet: 'Aktualisiere die Stufe auf dem Charakterbogen.',
      pf2: 'Erhöhe die Stufe auf dem Bogen und ziehe 1.000 EP ab.',
      spend: 'Gib die EP aus und erhöhe die Stufe auf dem Bogen.',
    },
    instant: {
      everyone: 'Alle in der Gruppe erhalten {xp} EP.',
      bonus: '{names} erhalten {xp} EP.',
    },
    end: {
      nothing: 'In dieser Sitzung wurden keine EP vergeben.',
      playerLine: '{name} erhält in dieser Sitzung {xp} EP.',
      playerLineTotal: '{name} erhält in dieser Sitzung {xp} EP, insgesamt also {total} EP.',
      levelLine: '{name} hat Stufe {level} erreicht.',
      remainder:
        '{xp} EP ließen sich nicht gleichmäßig aufteilen und werden in die nächste Sitzung übernommen.',
    },
    show: {
      noXp: 'keine EP auf dem Bogen',
      next: 'nächste Stufe bei {xp}',
    },
    awardKinds: { pool: 'Sitzungs-EP', bonus: 'Bonus-EP', give: 'Vergebene EP' },
    messages: {
      saved: 'Gespeichert.',
      commands: 'Befehle: {commands}',
      aliasTaken: '{alias} ist {mods} überlassen. Verwende !lazyxp.',
      migrated:
        'Deine Einstellungen, Sitzungs-EP und zusätzlichen EP aus LazyExperience 0.1 wurden übernommen.',
      handouts: 'Die Handouts Help, Command Deck und Session Log wurden neu aufgebaut.',
      noLog: 'Es wurde noch keine Sitzung beendet, daher gibt es kein Session Log.',
      poolAdded: '{xp} EP zur Sitzung hinzugefügt.',
      bonusAdded: '{xp} Bonus-EP für {names}.',
      killAdded: '{xp} EP für {name} zur Sitzung hinzugefügt.',
      killGone: 'Dieser Sieg wurde bereits hinzugefügt oder steht nicht mehr aus.',
      undone: '{xp} EP zurückgenommen ({reason}).',
      nothingToUndo: 'In dieser Sitzung gibt es nichts rückgängig zu machen.',
      nothingToUndoInstant:
        'Die EP wurden bereits ausgezahlt. Korrigiere sie mit give und einem negativen Betrag.',
      sessionReset: 'Die Sitzungs-EP und Boni wurden gelöscht. Es wurde nichts ausgezahlt.',
      absent: 'In dieser Sitzung als abwesend markiert: {names}.',
      present: 'Als anwesend markiert: {names}.',
      party: {
        add: 'Zur Gruppe hinzugefügt: {names}.',
        remove: 'Aus der Gruppe entfernt: {names}.',
      },
    },
    warnings: {
      sandbox:
        'Einige Charaktere nutzen einen Beacon-Bogen (etwa D&D 2024), den die Mod sandbox nur ab v1.5 lesen und schreiben kann. Wähle Mod sandbox v1.5 in den Mod-Einstellungen des Spiels.',
      partyLegacy:
        'Die Roll20-Gruppe ist eine Jumpgate-Funktion; in diesem Spiel führt der Mod eine eigene Gruppenliste.',
      nobodyToPay: 'Niemand ist in der Gruppe, daher werden {xp} EP für später aufbewahrt.',
      write: {
        zero: '{name}: Der Bogen kann von einem Mod nicht auf 0 EP gesetzt werden. Ändere es auf dem Bogen.',
        sandbox: '{name}: Dieser Bogen benötigt Mod sandbox v1.5, um die EP zu aktualisieren.',
        xpless:
          '{name}: Dieses Spielsystem verwendet keine EP (oder der Bogen berechnet sie selbst).',
        noField:
          '{name}: Für diesen Bogen ist kein EP-Feld bekannt. Setze das Spielsystem auf custom und gib das Feld an.',
        error:
          '{name}: Der Bogen konnte nicht mit {xp} EP aktualisiert werden. Siehe die Mod-Konsole.',
      },
    },
    errors: {
      gmOnly: 'Nur der SL kann LazyExperience-Befehle verwenden.',
      failed: 'Etwas ist schiefgelaufen: {message}',
      unknownCommand: 'Unbekannter Befehl „{name}“.',
      helpHint: 'Gib {command} help ein, um die Befehle zu sehen.',
      unknownSetting: 'Unbekannte Einstellung „{name}“.',
      settingsHint: 'Öffne die Einstellungskarte, um die Einstellungen zu sehen.',
      badValue: '„{value}“ ist kein gültiger Wert für {name}.',
      badXp: 'Gib die EP als ganze Zahl an, zum Beispiel 250.',
      badShare: 'Gib den Anteil als Zahl von 0 bis 10 an, zum Beispiel 0.5 oder 50 %.',
      noCharacters: 'Wähle Spielfiguren aus, die für Charaktere stehen, oder verwende --ids.',
      noTokens: 'Wähle zuerst die besiegten Spielfiguren aus oder verwende --ids.',
    },
    status: {
      version: 'Version',
      sandbox: 'Mod sandbox',
      beacon: 'Beacon-Bögen lesbar',
      commands: 'Befehle',
      profiles: 'Verwendete Spielsysteme',
      characters: '{count} Charaktere',
      handouts: 'Siehe die Handouts {help} und {deck}.',
    },
    log: {
      title: 'Sitzungsprotokoll',
      sessionHeading: 'Sitzung {number} — {date}',
      colCharacter: 'Charakter',
      colXp: 'EP',
      awards: 'Vergaben',
      levelUps: 'Stufen:',
      empty: 'Es wurde noch keine Sitzung beendet.',
    },
    help: {
      menu: 'Zeigt das Hauptmenü.',
      add: 'Fügt dem Sitzungspool EP hinzu, optional mit einem Grund.',
      bonus: 'Gibt den ausgewählten Charakteren Bonus-EP zusätzlich zu ihrem Anteil.',
      give: 'Zahlt den ausgewählten Charakteren sofort EP aus.',
      kill: 'Zählt die ausgewählten Spielfiguren als besiegt und fügt ihre EP hinzu.',
      killConfirm:
        'Fügt die EP einer besiegten Kreatur hinzu (die Schaltfläche der Abfrage), optional mit einem anderen Betrag.',
      absent: 'Markiert die ausgewählten Charaktere für diese Sitzung als abwesend.',
      present: 'Markiert die ausgewählten Charaktere wieder als anwesend.',
      share: 'Legt den Anteil der ausgewählten Charaktere fest (1 = voll).',
      exclude: 'Schließt Charaktere aus der Gruppe aus oder nimmt sie wieder auf.',
      undo: 'Nimmt die letzte noch nicht ausgezahlte Vergabe zurück.',
      end: 'Beendet die Sitzung: zahlt die EP aus, verkündet sie und protokolliert sie.',
      resetSession: 'Löscht die Sitzungs-EP, ohne sie auszuzahlen.',
      show: 'Zeigt EP und Stufe jedes Gruppenmitglieds aus dem Bogen.',
      roster: 'Zeigt die Gruppenkarte.',
      party:
        'Hakt das Kästchen Party Member von Roll20 für die ausgewählten Charaktere an oder ab.',
      settings: 'Zeigt die Einstellungskarte.',
      set: 'Ändert eine Einstellung.',
      lang: 'Wählt die Sprache.',
      status: 'Zeigt Sandbox, Befehle und verwendete Spielsysteme.',
      log: 'Link zum Handout Session Log.',
      journal: 'Baut die Handouts neu auf.',
      help: 'Zeigt diese Hilfe.',
      handouts: 'Mehr in den Handouts {help} und {deck}.',
    },
    deck: {
      session: 'Sitzung',
      sessionDesc: 'EP zur Sitzung hinzufügen, die Gruppe prüfen und die Sitzung beenden.',
      selected: 'Ausgewählte Spielfiguren',
      selectedDesc: 'Wähle zuerst Spielfiguren auf der Karte aus.',
      party: 'Gruppe',
      partyDesc: 'Wer sich die EP teilt.',
      tools: 'Werkzeuge',
      toolsDesc: 'Einstellungen, Status und Hilfe.',
      footer:
        'Die Schaltflächen führen LazyExperience-Befehle aus. Einzelheiten im Handout {help}.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Sitzungserfahrung, fair aufgeteilt, auf jedem Charakterbogen',
      footer: 'Schaltflächen für alle Befehle findest du im Handout {deck}.',
      overview: {
        heading: 'Überblick',
        body: 'LazyExperience sammelt die in einer Sitzung verdienten Erfahrungspunkte, teilt sie unter der Gruppe auf und schreibt sie in die Charakterbögen. Es liest und schreibt den D&D-2024-Bogen sowie ältere und andere Bögen, nutzt die Gruppe von Roll20 selbst, bemerkt besiegte Kreaturen, kümmert sich um abwesende Spieler und Bonus-EP, verkündet Stufenaufstiege und führt ein Protokoll jeder Sitzung.',
      },
      quickStart: {
        heading: 'Schnellstart',
        steps: [
          'Hake bei jedem Spielercharakter Party Member an (in den Einstellungen des Charakterfensters) oder lass es bleiben: Dann werden von Spielern gesteuerte Charaktere verwendet.',
          'Gib !lazyxp ein, um das Menü zu öffnen.',
          'Wenn die Gruppe eine Kreatur besiegt, fragt dich ihr auf 0 fallender TP-Balken, ob ihre EP hinzugefügt werden sollen. Du kannst auch Spielfiguren auswählen und Besiegt: Auswahl drücken.',
          'Füge EP für alles andere mit EP hinzufügen hinzu und Bonus-EP für einen Charakter mit Bonus: Auswahl.',
          'Markiere Spieler, die die Sitzung verpasst haben, als Abwesend.',
          'Drücke Sitzung beenden. Der Anteil jedes Spielers wird in seinen Bogen geschrieben, verkündet und dem Handout Session Log hinzugefügt.',
        ],
      },
      commands: {
        heading: 'Befehle',
        intro:
          'Jeder Befehl beginnt mit !lazyxp; {long} funktioniert ebenfalls, ebenso {short}, solange kein anderer EP-Mod es verwendet. Nur der SL kann sie nutzen.',
        targets:
          'Befehle für Charaktere verwenden die ausgewählten Spielfiguren oder --ids gefolgt von durch Kommas getrennten Charakter- oder Spielfigur-IDs.',
        colCommand: 'Befehl',
        colDesc: 'Was er tut',
      },
      party: {
        heading: 'Die Gruppe',
        points: [
          'Automatisch: Ist in Roll20 (Jumpgate) irgendein Charakter als Party Member angehakt, teilt sich die Roll20-Gruppe die EP; andernfalls jeder von einem Spieler gesteuerte Charakter.',
          'Charaktere, die nur von „Allen Spielern“ gesteuert werden, etwa Hilfsfiguren, werden nicht mitgezählt.',
          'Gruppe hinzufügen und Gruppe entfernen haken Party Member für die ausgewählten Charaktere an oder ab.',
          'Ausschließen nimmt einen Charakter dauerhaft aus der Gruppe; Einschließen holt ihn zurück.',
          'Ein Charakter, der von mehreren Spielern gesteuert wird, zählt nur einmal.',
        ],
      },
      splitting: {
        heading: 'Die EP aufteilen',
        points: [
          'Die Sitzungs-EP werden durch die Anzahl der Anteile geteilt: einer pro Gruppenmitglied plus eventuelle zusätzliche Anteile.',
          'Abwesende Charaktere erhalten die Einstellung Anteil für Abwesende (standardmäßig 0 %). Abwesenheit gilt für eine Sitzung.',
          'Ein Charakter kann einen anderen Anteil haben, zum Beispiel 0.5 für einen Gefährten.',
          'Bonus-EP gehen zusätzlich zu ihrem Anteil an die gewählten Charaktere.',
          'EP, die sich nicht gleichmäßig teilen lassen, werden in die nächste Sitzung übernommen.',
          'Ist EP auszahlen auf instant gestellt, wird jede Vergabe sofort aufgeteilt und ausgezahlt.',
        ],
      },
      kills: {
        heading: 'Besiegte Kreaturen',
        points: [
          'Eine Kreatur gilt als besiegt, wenn ihr TP-Balken auf 0 fällt, wenn der Besiegt-Marker gesetzt wird oder wenn DeathTracker sie als tot markiert.',
          'Änderungen durch TokenMod, den Bogen oder andere Mods über das verknüpfte Attribut werden ebenfalls bemerkt.',
          'Nur Spielfiguren von Charakteren außerhalb der Gruppe, die kein Spieler steuert, werden gezählt, und jede Spielfigur nur einmal pro Sitzung.',
          'Die EP stammen aus dem Bogen: dem EP-Wert der Kreatur oder ihrem Herausforderungsgrad.',
          'SL fragen (die Voreinstellung) flüstert eine Abfrage mit Hinzufügen, Anderer Betrag und Ignorieren. Automatisch hinzufügen überspringt die Abfrage.',
        ],
      },
      levels: {
        heading: 'Stufenaufstiege',
        points: [
          'Nachdem EP geschrieben wurden, prüft LazyExperience die Stufentabelle des Systems und verkündet, wenn ein Charakter genug EP für eine neue Stufe hat.',
          'Auf dem D&D-2024-Bogen drückt der Spieler dann die Schaltfläche Level Up des Bogens.',
        ],
      },
      systems: {
        heading: 'Spielsysteme',
        intro:
          'LazyExperience wählt ein Profil anhand des Bogens jedes Charakters. Stelle das Spielsystem ein, um eines zu erzwingen, oder auf custom, um die Felder selbst zu benennen.',
        colSystem: 'System',
        colId: 'ID',
        colSheets: 'Bögen',
        colChecked: 'Geprüft',
        verified: {
          live: 'In Roll20 getestet',
          partial: 'Teilweise in Roll20 getestet',
          source: 'Aus dem Quellcode des Bogens',
          none: '—',
        },
        points: [
          'Wähle den Bogen über seinen Namen in den Einstellungen des Spiels. Nicht aufgeführte Bögen verwenden die gängigen Feldnamen experience, xp und level, oder stelle das Spielsystem auf custom.',
          'In Roll20 getestet heißt: In einem Jumpgate-Spiel wurden EP auf diesen Bogen geschrieben, die eigenen Berechnungen des Bogens liefen, und besiegte Kreaturen sowie Stufenaufstiegs-Hinweise wurden geprüft.',
          'Beacon-Bögen wie D&D 2024 benötigen Mod sandbox v1.5, und ein Mod kann sie nicht auf 0 EP setzen.',
          'Pathfinder 1E und Starfinder nutzen für Stufenaufstiegs-Hinweise das Feld des Bogens für die EP bis zur nächsten Stufe. Ist es leer, verwendet Pathfinder die mittlere Aufstiegsgeschwindigkeit und Starfinder seine eigene Tabelle.',
          'WFRP 4E: Jede Vergabe wird als Zeile in die Experience-Liste des Bogens eingetragen, aber der Bogen hat seine EP-Summen beim Testen nicht neu berechnet; prüfe sie daher auf dem Bogen.',
          'Savage Worlds, 13th Age, Cosmere und Call of Cthulhu haben keine EP, die ein Mod schreiben könnte.',
        ],
      },
      settings: {
        heading: 'Einstellungen',
        intro:
          'Ändere Einstellungen auf der Einstellungskarte oder mit !lazyxp set <Einstellung> <Wert>.',
        colKey: 'Einstellung',
        colName: 'Name',
        colDesc: 'Was sie tut',
      },
      upgrading: {
        heading: 'Update von 0.1',
        points: [
          'Einstellungen, Sitzungs-EP und zusätzliche EP pro Charakter aus 0.1 werden beim ersten Start von 1.0 übernommen.',
          'Spieler oder Charaktere, die nicht aktiv waren, werden aus der Gruppe ausgeschlossen.',
          'Ein eigener Befehlsname aus 0.1 funktioniert weiter.',
          'Die alten Befehle funktionieren weiterhin:',
        ],
        colV1: '0.1',
        colV2: '1.0',
      },
      troubleshooting: {
        heading: 'Fehlerbehebung',
        points: [
          'Es wird nichts in D&D-2024-Bögen geschrieben: Prüfe, ob das Spiel Mod sandbox v1.5 verwendet (!lazyxp status).',
          'Eine Kreatur gibt 0 EP: Ihr Bogen hat weder EP noch Herausforderungsgrad. Nutze Anderer Betrag oder !lazyxp kill --xp 100.',
          'Siege werden nicht bemerkt: Prüfe, ob der TP-Balken der Balken mit den Trefferpunkten ist.',
          '!xp tut nichts: Ein anderer EP-Mod verwendet es. Nutze !lazyxp.',
        ],
      },
      languages: {
        heading: 'Sprachen',
        body: 'Wähle mit !lazyxp lang eine Sprache. Chatkarten und Handouts ändern sich sofort.',
        colLanguage: 'Sprache',
        colNative: 'Name',
        colCode: 'Code',
      },
      credits: {
        heading: 'Danksagung',
        original: 'Erstellt von',
        maintainer: 'Neu geschrieben und gepflegt von',
        support: 'Fehlermeldungen und Ideen sind im Roll20-Forum willkommen.',
      },
    },
  };

  var localeEl = {
    titles: {
      ready: 'Το LazyExperience είναι έτοιμο.',
      help: 'Βοήθεια LazyExperience',
      settings: 'Ρυθμίσεις LazyExperience',
      status: 'Κατάσταση LazyExperience',
      roster: 'Ομάδα',
      language: 'Γλώσσα',
      levelUp: 'Νέο επίπεδο!',
      defeated: 'Το πλάσμα νικήθηκε',
      xpAwarded: 'Απονομή εμπειρίας',
      sessionEnded: 'Η συνεδρία {number} ολοκληρώθηκε',
      yourXp: 'Η εμπειρία σας',
      pool: 'XP συνεδρίας',
      bonus: 'Μπόνους XP',
      undo: 'Αναίρεση',
      log: 'Αρχείο συνεδριών',
      partyXp: 'Εμπειρία ομάδας',
    },
    menu: {
      session: 'Συνεδρία',
      pool: 'XP συνεδρίας',
      payout: 'Πληρώθηκε',
      shares: 'Μερίδια',
      perShare: 'XP ανά μερίδιο',
      party: 'Ομάδα ({source})',
      noParty:
        'Δεν υπάρχει κανείς στην ομάδα ακόμη. Ανοίξτε την κάρτα Ομάδα για να προσθέσετε χαρακτήρες.',
      absentTag: '(απών)',
      bonusTag: '(+{xp} μπόνους)',
      levelTag: 'Επίπεδο {level}',
      shareTag: 'Μερίδιο {share}',
      rosterSource: 'Ομάδα από',
      excluded: 'Εξαιρούνται',
      blank: '(κενό)',
      groupXp: 'Εμπειρία',
      groupParty: 'Ομάδα',
      groupKills: 'Πλάσματα που νικήθηκαν',
      groupSheet: 'Φύλλο χαρακτήρα',
    },
    buttons: {
      menu: 'Μενού',
      help: 'Βοήθεια',
      settings: 'Ρυθμίσεις',
      status: 'Κατάσταση',
      roster: 'Ομάδα',
      addXp: 'Προσθήκη XP',
      killSelected: 'Νικήθηκαν: επιλεγμένα',
      bonusSelected: 'Μπόνους: επιλεγμένα',
      giveSelected: 'Άμεση απονομή: επιλεγμένα',
      endSession: 'Λήξη συνεδρίας',
      undo: 'Αναίρεση',
      show: 'XP ομάδας',
      log: 'Αρχείο συνεδριών',
      absent: 'Απών',
      present: 'Παρών',
      share: 'Μερίδιο',
      exclude: 'Εξαίρεση',
      include: 'Συμπερίληψη',
      partyAdd: 'Προσθήκη επιλεγμένων στην ομάδα',
      partyRemove: 'Αφαίρεση επιλεγμένων',
      addKill: 'Προσθήκη {xp} XP',
      otherXp: 'Άλλο ποσό',
      ignore: 'Παράβλεψη',
    },
    prompts: {
      xp: 'XP',
      reason: 'Αιτία (προαιρετικά)',
      share: 'Μερίδιο (1 = πλήρες, 0.5 = μισό)',
      confirmEnd: 'Να λήξει η συνεδρία και να μοιραστούν τα XP;',
    },
    options: {
      yesNo: { yes: 'Ναι', no: 'Όχι' },
      payout: { end: 'Στο τέλος της συνεδρίας', instant: 'Αμέσως' },
      roster: {
        auto: 'Αυτόματα',
        party: 'Ομάδα του Roll20',
        players: 'Χαρακτήρες των παικτών',
        manual: 'Επιλογή από τον GM',
      },
      killMode: { prompt: 'Ερώτηση στον GM', auto: 'Αυτόματη προσθήκη', off: 'Ανενεργό' },
      announce: {
        public: 'Όλοι',
        whisper: 'Οι εμπλεκόμενοι παίκτες',
        gm: 'Μόνο ο GM',
        off: 'Ανενεργό',
      },
      levelNotice: {
        public: 'Όλοι',
        whisper: 'Ο παίκτης και ο GM',
        gm: 'Μόνο ο GM',
        off: 'Ανενεργό',
      },
      system: { auto: 'Ανίχνευση από το φύλλο' },
    },
    settings: {
      language: { label: 'Γλώσσα', desc: 'Γλώσσα για τις κάρτες συνομιλίας και τα handouts.' },
      payout: {
        label: 'Πληρωμή XP',
        desc: 'end: τα XP συγκεντρώνονται στο απόθεμα της συνεδρίας και μοιράζονται όταν λήξει. instant: κάθε απονομή μοιράζεται και πληρώνεται αμέσως.',
      },
      updateSheets: {
        label: 'Ενημέρωση φύλλων',
        desc: 'Εγγραφή των XP στα φύλλα χαρακτήρων. Όταν είναι ανενεργό, τα σύνολα μόνο ανακοινώνονται.',
      },
      system: {
        label: 'Σύστημα παιχνιδιού',
        desc: 'Ποια πεδία του φύλλου περιέχουν τα XP και το επίπεδο. Το auto επιλέγει προφίλ από το φύλλο κάθε χαρακτήρα· το custom χρησιμοποιεί τα προσαρμοσμένα πεδία.',
      },
      roster: {
        label: 'Ομάδα από',
        desc: 'auto: η ομάδα του Roll20 αν υπάρχει κάποιος σε αυτήν, αλλιώς οι χαρακτήρες που ελέγχονται από παίκτες. Τα party, players ή manual επιλέγουν ένα από αυτά.',
      },
      absentShare: {
        label: 'Μερίδιο απόντων',
        desc: 'Το μέρος του μεριδίου που παίρνει ακόμη ένας απών χαρακτήρας, από 0% (κανένα) έως 100% (πλήρες).',
      },
      extraShares: {
        label: 'Επιπλέον μερίδια',
        desc: 'Μερίδια για συντρόφους ή μισθοφόρους που δεν έχουν φύλλο. Τα XP τους δεν πληρώνονται σε κανέναν.',
      },
      killMode: {
        label: 'Πλάσματα που νικήθηκαν',
        desc: 'prompt: ρώτα τον GM πριν προστεθούν τα XP ενός πλάσματος. auto: προσθήκη αμέσως. off: δεν παρακολουθούνται τα tokens.',
      },
      killBar: {
        label: 'Παρακολούθηση μπάρας HP',
        desc: 'Θεωρείται ότι ένα πλάσμα νικήθηκε όταν η μπάρα HP του πέσει στο 0 ή χαμηλότερα.',
      },
      hpBar: {
        label: 'Μπάρα HP',
        desc: 'Ποια μπάρα του token (1, 2 ή 3) περιέχει τους πόντους ζωής.',
      },
      killMarker: {
        label: 'Παρακολούθηση δείκτη',
        desc: 'Θεωρείται ότι ένα πλάσμα νικήθηκε όταν μπει ο δείκτης ήττας στο token του.',
      },
      marker: {
        label: 'Δείκτης ήττας',
        desc: 'Ο δείκτης που σημαίνει ήττα: ένα ενσωματωμένο όνομα όπως dead ή το όνομα ενός προσαρμοσμένου δείκτη.',
      },
      killDeathTracker: {
        label: 'Χρήση του DeathTracker',
        desc: 'Θεωρείται ότι ένα πλάσμα νικήθηκε όταν το DeathTracker 1.0 ή νεότερο το σημειώσει ως νεκρό.',
      },
      announce: {
        label: 'Μηνύματα XP',
        desc: 'Ποιος βλέπει τις απονομές XP και τη σύνοψη λήξης συνεδρίας: public (όλοι), whisper (οι εμπλεκόμενοι παίκτες και ο GM), gm ή off.',
      },
      levelNotice: {
        label: 'Ειδοποιήσεις νέου επιπέδου',
        desc: 'Ποιος βλέπει τις ειδοποιήσεις νέου επιπέδου: public (όλοι), whisper (ο παίκτης και ο GM), gm ή off.',
      },
      customXp: {
        label: 'Προσαρμοσμένο πεδίο XP',
        desc: 'Πεδίο του φύλλου για τα XP ενός χαρακτήρα όταν το σύστημα παιχνιδιού είναι custom. Μια λίστα δοκιμάζει κάθε όνομα με τη σειρά.',
      },
      customLevel: {
        label: 'Προσαρμοσμένο πεδίο επιπέδου',
        desc: 'Πεδίο του φύλλου για το επίπεδο ενός χαρακτήρα.',
      },
      customNpcXp: {
        label: 'Προσαρμοσμένο πεδίο XP πλάσματος',
        desc: 'Πεδίο του φύλλου για τα XP που αξίζει ένα πλάσμα.',
      },
      customNpcCr: {
        label: 'Προσαρμοσμένο πεδίο πρόκλησης',
        desc: 'Πεδίο του φύλλου για τον βαθμό πρόκλησης ενός πλάσματος, που χρησιμοποιείται όταν δεν έχει τιμή XP.',
      },
      customLevels: {
        label: 'Προσαρμοσμένος πίνακας επιπέδων',
        desc: 'Τα XP που χρειάζονται για κάθε επίπεδο, από το επίπεδο 1, π.χ. 0,300,900,2700. Αν μείνει κενό, οι ειδοποιήσεις νέου επιπέδου απενεργοποιούνται για τα προσαρμοσμένα φύλλα.',
      },
    },
    roster: {
      explain: {
        party: 'Οι χαρακτήρες που έχουν επιλεγεί ως Party Member στο Roll20 μοιράζονται τα XP.',
        players:
          'Οι χαρακτήρες που ελέγχονται από παίκτη μοιράζονται τα XP. Επιλέξτε Party Member στους χαρακτήρες για να χρησιμοποιήσετε αντ’ αυτού την ομάδα του Roll20.',
        manual: 'Μόνο οι χαρακτήρες που συμπεριλαμβάνετε μοιράζονται τα XP.',
      },
      selectHint: 'Επιλέξτε πρώτα tokens για να τα προσθέσετε στην ομάδα ή να τα αφαιρέσετε.',
    },
    kills: {
      prompt: 'Το πλάσμα {name} νικήθηκε. Να προστεθούν {xp} XP στη συνεδρία;',
      noXp: 'Το πλάσμα {name} νικήθηκε, αλλά το φύλλο του δεν έχει τιμή XP.',
      reason: 'Νικήθηκε: {name}',
      result: {
        prompted: 'ερωτήθηκε',
        added: 'προστέθηκε',
        counted: 'έχει ήδη μετρηθεί σε αυτή τη συνεδρία',
        noXp: 'δεν υπάρχουν XP στο φύλλο: χρησιμοποιήστε --xp',
        notCreature: 'δεν είναι πλάσμα (χωρίς φύλλο ή μέλος της ομάδας)',
      },
    },
    levels: {
      reached: 'Ο/Η {name} έχει αρκετά XP για το επίπεδο {level}!',
      sheetButton: 'Χρησιμοποιήστε το κουμπί αύξησης επιπέδου στο φύλλο χαρακτήρα.',
      updateSheet: 'Ενημερώστε το επίπεδο στο φύλλο χαρακτήρα.',
      pf2: 'Αυξήστε το επίπεδο στο φύλλο και αφαιρέστε 1.000 από τα XP.',
      spend: 'Ξοδέψτε τα XP και αυξήστε το επίπεδο στο φύλλο.',
    },
    instant: {
      everyone: 'Όλοι στην ομάδα κερδίζουν {xp} XP.',
      bonus: 'Οι {names} κερδίζουν {xp} XP.',
    },
    end: {
      nothing: 'Δεν απονεμήθηκαν XP σε αυτή τη συνεδρία.',
      playerLine: 'Ο/Η {name} κερδίζει {xp} XP σε αυτή τη συνεδρία.',
      playerLineTotal: 'Ο/Η {name} κερδίζει {xp} XP σε αυτή τη συνεδρία, συνολικά {total} XP.',
      levelLine: 'Ο/Η {name} έφτασε στο επίπεδο {level}.',
      remainder: 'Τα {xp} XP δεν μοιράστηκαν ακριβώς και μεταφέρονται στην επόμενη συνεδρία.',
    },
    show: {
      noXp: 'δεν υπάρχουν XP στο φύλλο',
      next: 'επόμενο επίπεδο στα {xp}',
    },
    awardKinds: { pool: 'XP συνεδρίας', bonus: 'Μπόνους XP', give: 'XP που δόθηκαν' },
    messages: {
      saved: 'Αποθηκεύτηκε.',
      commands: 'Εντολές: {commands}',
      aliasTaken: 'Το {alias} έχει παραχωρηθεί στο {mods}. Χρησιμοποιήστε το !lazyxp.',
      migrated:
        'Οι ρυθμίσεις, τα XP συνεδρίας και τα επιπλέον XP του LazyExperience 0.1 μεταφέρθηκαν.',
      handouts: 'Τα handouts Help, Command Deck και Session Log ξαναδημιουργήθηκαν.',
      noLog: 'Καμία συνεδρία δεν έχει ολοκληρωθεί ακόμη, οπότε δεν υπάρχει αρχείο συνεδριών.',
      poolAdded: 'Προστέθηκαν {xp} XP στη συνεδρία.',
      bonusAdded: '{xp} μπόνους XP για {names}.',
      killAdded: 'Προστέθηκαν {xp} XP για το πλάσμα {name} στη συνεδρία.',
      killGone: 'Αυτή η νίκη έχει ήδη προστεθεί ή δεν εκκρεμεί πια.',
      undone: 'Αναιρέθηκαν {xp} XP ({reason}).',
      nothingToUndo: 'Δεν υπάρχει τίποτα να αναιρεθεί σε αυτή τη συνεδρία.',
      nothingToUndoInstant:
        'Τα XP έχουν ήδη πληρωθεί. Χρησιμοποιήστε το give με αρνητικό ποσό για διόρθωση.',
      sessionReset: 'Τα XP συνεδρίας και τα μπόνους μηδενίστηκαν. Δεν πληρώθηκε τίποτα.',
      absent: 'Σημειώθηκαν ως απόντες σε αυτή τη συνεδρία: {names}.',
      present: 'Σημειώθηκαν ως παρόντες: {names}.',
      party: {
        add: 'Προστέθηκαν στην ομάδα: {names}.',
        remove: 'Αφαιρέθηκαν από την ομάδα: {names}.',
      },
    },
    warnings: {
      sandbox:
        'Ορισμένοι χαρακτήρες χρησιμοποιούν φύλλο Beacon (όπως το D&D 2024), το οποίο το Mod sandbox μπορεί να διαβάσει και να γράψει μόνο στην έκδοση v1.5. Επιλέξτε Mod sandbox v1.5 στις ρυθμίσεις Mod του παιχνιδιού.',
      partyLegacy:
        'Η ομάδα του Roll20 είναι δυνατότητα του Jumpgate· σε αυτό το παιχνίδι το mod κρατά τη δική του λίστα ομάδας.',
      nobodyToPay: 'Δεν υπάρχει κανείς στην ομάδα, οπότε τα {xp} XP φυλάσσονται για αργότερα.',
      write: {
        zero: '{name}: το φύλλο δεν μπορεί να οριστεί στα 0 XP από ένα Mod. Αλλάξτε το στο ίδιο το φύλλο.',
        sandbox: '{name}: αυτό το φύλλο χρειάζεται Mod sandbox v1.5 για να ενημερωθούν τα XP.',
        xpless:
          '{name}: αυτό το σύστημα παιχνιδιού δεν χρησιμοποιεί XP (ή το φύλλο τα υπολογίζει μόνο του).',
        noField:
          '{name}: δεν είναι γνωστό πεδίο XP για αυτό το φύλλο. Ορίστε το Σύστημα παιχνιδιού σε custom και ονομάστε το πεδίο.',
        error: '{name}: το φύλλο δεν μπόρεσε να ενημερωθεί με {xp} XP. Δείτε την κονσόλα των Mod.',
      },
    },
    errors: {
      gmOnly: 'Μόνο ο GM μπορεί να χρησιμοποιεί τις εντολές του LazyExperience.',
      failed: 'Κάτι πήγε στραβά: {message}',
      unknownCommand: 'Άγνωστη εντολή "{name}".',
      helpHint: 'Πληκτρολογήστε {command} help για τις εντολές.',
      unknownSetting: 'Άγνωστη ρύθμιση "{name}".',
      settingsHint: 'Ανοίξτε την κάρτα ρυθμίσεων για να δείτε τις ρυθμίσεις.',
      badValue: 'Το "{value}" δεν είναι έγκυρη τιμή για το {name}.',
      badXp: 'Δώστε τα XP ως ακέραιο αριθμό, π.χ. 250.',
      badShare: 'Δώστε το μερίδιο ως αριθμό από 0 έως 10, π.χ. 0.5 ή 50%.',
      noCharacters: 'Επιλέξτε tokens που αντιπροσωπεύουν χαρακτήρες ή χρησιμοποιήστε --ids.',
      noTokens: 'Επιλέξτε πρώτα τα tokens που νικήθηκαν ή χρησιμοποιήστε --ids.',
    },
    status: {
      version: 'Έκδοση',
      sandbox: 'Mod sandbox',
      beacon: 'Αναγνώσιμα φύλλα Beacon',
      commands: 'Εντολές',
      profiles: 'Συστήματα παιχνιδιού σε χρήση',
      characters: '{count} χαρακτήρες',
      handouts: 'Δείτε τα handouts {help} και {deck}.',
    },
    log: {
      title: 'Αρχείο συνεδριών',
      sessionHeading: 'Συνεδρία {number} — {date}',
      colCharacter: 'Χαρακτήρας',
      colXp: 'XP',
      awards: 'Απονομές',
      levelUps: 'Επίπεδα:',
      empty: 'Καμία συνεδρία δεν έχει ολοκληρωθεί ακόμη.',
    },
    help: {
      menu: 'Εμφάνιση του κύριου μενού.',
      add: 'Προσθήκη XP στο απόθεμα της συνεδρίας, με προαιρετική αιτία.',
      bonus: 'Δίνει στους επιλεγμένους χαρακτήρες μπόνους XP επιπλέον του μεριδίου τους.',
      give: 'Πληρώνει XP αμέσως στους επιλεγμένους χαρακτήρες.',
      kill: 'Θεωρεί τα επιλεγμένα tokens νικημένα και προσθέτει τα XP τους.',
      killConfirm:
        'Προσθέτει τα XP ενός πλάσματος που νικήθηκε (το κουμπί της ερώτησης), προαιρετικά με άλλο ποσό.',
      absent: 'Σημειώνει τους επιλεγμένους χαρακτήρες ως απόντες για αυτή τη συνεδρία.',
      present: 'Σημειώνει ξανά τους επιλεγμένους χαρακτήρες ως παρόντες.',
      share: 'Ορίζει το μερίδιο των επιλεγμένων χαρακτήρων (1 = πλήρες).',
      exclude: 'Εξαιρεί χαρακτήρες από την ομάδα ή τους συμπεριλαμβάνει ξανά.',
      undo: 'Αναιρεί την τελευταία απονομή που δεν έχει πληρωθεί.',
      end: 'Λήξη συνεδρίας: πληρωμή των XP, ανακοίνωση και καταγραφή.',
      resetSession: 'Μηδενίζει τα XP συνεδρίας χωρίς να τα πληρώσει.',
      show: 'Εμφανίζει τα XP και το επίπεδο κάθε μέλους της ομάδας από το φύλλο.',
      roster: 'Εμφανίζει την κάρτα της ομάδας.',
      party:
        'Επιλέγει ή αποεπιλέγει το πλαίσιο Party Member του Roll20 για τους επιλεγμένους χαρακτήρες.',
      settings: 'Εμφανίζει την κάρτα ρυθμίσεων.',
      set: 'Αλλάζει μια ρύθμιση.',
      lang: 'Επιλογή γλώσσας.',
      status: 'Εμφανίζει το sandbox, τις εντολές και τα συστήματα παιχνιδιού σε χρήση.',
      log: 'Σύνδεσμος προς το handout του αρχείου συνεδριών.',
      journal: 'Ξαναδημιουργεί τα handouts.',
      help: 'Εμφανίζει αυτή τη βοήθεια.',
      handouts: 'Περισσότερα στα handouts {help} και {deck}.',
    },
    deck: {
      session: 'Συνεδρία',
      sessionDesc: 'Προσθέστε XP στη συνεδρία, ελέγξτε την ομάδα και λήξτε τη συνεδρία.',
      selected: 'Επιλεγμένα tokens',
      selectedDesc: 'Επιλέξτε πρώτα tokens στον χάρτη.',
      party: 'Ομάδα',
      partyDesc: 'Ποιοι μοιράζονται τα XP.',
      tools: 'Εργαλεία',
      toolsDesc: 'Ρυθμίσεις, κατάσταση και βοήθεια.',
      footer:
        'Τα κουμπιά εκτελούν εντολές του LazyExperience. Δείτε το handout {help} για λεπτομέρειες.',
    },
    handout: {
      versionLabel: 'Έκδοση',
      subtitle: 'Η εμπειρία της συνεδρίας, μοιρασμένη δίκαια, σε οποιοδήποτε φύλλο',
      footer: 'Κουμπιά για κάθε εντολή υπάρχουν στο handout {deck}.',
      overview: {
        heading: 'Επισκόπηση',
        body: 'Το LazyExperience συγκεντρώνει τους πόντους εμπειρίας που κερδίζονται κατά τη διάρκεια μιας συνεδρίας, τους μοιράζει στην ομάδα και τους γράφει στα φύλλα χαρακτήρων. Διαβάζει και γράφει το φύλλο D&D 2024 καθώς και παλαιότερα και άλλα φύλλα, χρησιμοποιεί τη δική του ομάδα του Roll20, εντοπίζει τα πλάσματα που νικήθηκαν, διαχειρίζεται τους απόντες παίκτες και τα μπόνους XP, ανακοινώνει τις ανόδους επιπέδου και κρατά αρχείο κάθε συνεδρίας.',
      },
      quickStart: {
        heading: 'Γρήγορη εκκίνηση',
        steps: [
          'Επιλέξτε Party Member σε κάθε χαρακτήρα παίκτη (στις ρυθμίσεις του παραθύρου χαρακτήρα) ή παραλείψτε το: χρησιμοποιούνται οι χαρακτήρες που ελέγχονται από παίκτες.',
          'Πληκτρολογήστε !lazyxp για να ανοίξει το μενού.',
          'Όταν η ομάδα νικά ένα πλάσμα, η μπάρα HP του που φτάνει στο 0 σας ρωτά αν θα προστεθούν τα XP του. Μπορείτε επίσης να επιλέξετε tokens και να πατήσετε «Νικήθηκαν: επιλεγμένα».',
          'Προσθέστε XP για οτιδήποτε άλλο με «Προσθήκη XP» και μπόνους XP για έναν χαρακτήρα με «Μπόνους: επιλεγμένα».',
          'Σημειώστε τους παίκτες που έλειψαν από τη συνεδρία ως «Απών».',
          'Πατήστε «Λήξη συνεδρίας». Το μερίδιο του καθενός γράφεται στο φύλλο του, ανακοινώνεται και προστίθεται στο handout του αρχείου συνεδριών.',
        ],
      },
      commands: {
        heading: 'Εντολές',
        intro:
          'Κάθε εντολή ξεκινά με !lazyxp; λειτουργεί και το {long}, όπως και το {short} όσο δεν το χρησιμοποιεί άλλο Mod XP. Μπορεί να τις χρησιμοποιήσει μόνο ο GM.',
        targets:
          'Οι εντολές για χαρακτήρες χρησιμοποιούν τα επιλεγμένα tokens ή το --ids ακολουθούμενο από IDs χαρακτήρων ή tokens χωρισμένα με κόμματα.',
        colCommand: 'Εντολή',
        colDesc: 'Τι κάνει',
      },
      party: {
        heading: 'Η ομάδα',
        points: [
          'Αυτόματα: όταν οποιοσδήποτε χαρακτήρας έχει επιλεγεί ως Party Member στο Roll20 (Jumpgate), τα XP μοιράζονται στην ομάδα του Roll20· διαφορετικά, σε κάθε χαρακτήρα που ελέγχεται από παίκτη.',
          'Οι χαρακτήρες που ελέγχονται μόνο από «All players», όπως τα tokens βοηθητικού χαρακτήρα, δεν υπολογίζονται.',
          'Οι ενέργειες προσθήκης και αφαίρεσης από την ομάδα επιλέγουν ή αποεπιλέγουν το Party Member για τους επιλεγμένους χαρακτήρες.',
          'Το «Εξαίρεση» βγάζει έναν χαρακτήρα από την ομάδα μόνιμα· το «Συμπερίληψη» τον επαναφέρει.',
          'Ένας χαρακτήρας που ελέγχεται από πολλούς παίκτες μετράει μία φορά.',
        ],
      },
      splitting: {
        heading: 'Μοίρασμα των XP',
        points: [
          'Τα XP της συνεδρίας διαιρούνται με τον αριθμό των μεριδίων: ένα για κάθε μέλος της ομάδας, συν τυχόν επιπλέον μερίδια.',
          'Οι απόντες χαρακτήρες παίρνουν το ποσοστό της ρύθμισης «Μερίδιο απόντων» (0% από προεπιλογή). Η απουσία διαρκεί μία συνεδρία.',
          'Ένας χαρακτήρας μπορεί να έχει διαφορετικό μερίδιο, π.χ. 0.5 για έναν βοηθό.',
          'Τα μπόνους XP πηγαίνουν στους επιλεγμένους χαρακτήρες επιπλέον του μεριδίου τους.',
          'Τα XP που δεν μοιράζονται ακριβώς μεταφέρονται στην επόμενη συνεδρία.',
          'Με την «Πληρωμή XP» στο instant, κάθε απονομή μοιράζεται και πληρώνεται αμέσως.',
        ],
      },
      kills: {
        heading: 'Πλάσματα που νικήθηκαν',
        points: [
          'Ένα πλάσμα θεωρείται νικημένο όταν η μπάρα HP του πέσει στο 0, όταν μπει ο δείκτης ήττας ή όταν το DeathTracker το σημειώσει ως νεκρό.',
          'Εντοπίζονται επίσης οι αλλαγές από το TokenMod, το φύλλο ή άλλα Mods μέσω του συνδεδεμένου χαρακτηριστικού.',
          'Μετρούν μόνο tokens χαρακτήρων εκτός ομάδας που δεν ελέγχονται από κανέναν παίκτη, και κάθε token μόνο μία φορά ανά συνεδρία.',
          'Τα XP προέρχονται από το φύλλο: η τιμή XP του πλάσματος ή ο βαθμός πρόκλησής του.',
          'Η επιλογή «Ερώτηση στον GM» (η προεπιλογή) στέλνει ψιθυριστά μια ερώτηση με «Προσθήκη», «Άλλο ποσό» και «Παράβλεψη». Η «Αυτόματη προσθήκη» παραλείπει την ερώτηση.',
        ],
      },
      levels: {
        heading: 'Ανεβάσματα επιπέδου',
        points: [
          'Μετά την εγγραφή των XP, το LazyExperience ελέγχει τον πίνακα επιπέδων του συστήματος και ανακοινώνει όταν ένας χαρακτήρας έχει αρκετά XP για νέο επίπεδο.',
          'Στο φύλλο D&D 2024, ο παίκτης πατά στη συνέχεια το κουμπί αύξησης επιπέδου του φύλλου.',
        ],
      },
      systems: {
        heading: 'Συστήματα παιχνιδιού',
        intro:
          'Το LazyExperience επιλέγει προφίλ από το φύλλο κάθε χαρακτήρα. Ορίστε το Σύστημα παιχνιδιού για να επιβάλετε ένα, ή το custom για να ονομάσετε εσείς τα πεδία.',
        colSystem: 'Σύστημα',
        colId: 'ID',
        colSheets: 'Φύλλα',
        colChecked: 'Έλεγχος',
        verified: {
          live: 'Δοκιμάστηκε στο Roll20',
          partial: 'Δοκιμάστηκε εν μέρει στο Roll20',
          source: 'Από τον πηγαίο κώδικα του φύλλου',
          none: '—',
        },
        points: [
          'Επιλέξτε το φύλλο με το όνομά του στις Ρυθμίσεις του παιχνιδιού. Τα φύλλα που δεν αναφέρονται χρησιμοποιούν τα κοινά ονόματα πεδίων experience, xp και level, ή ορίστε το Σύστημα παιχνιδιού σε custom.',
          'Το «Δοκιμάστηκε στο Roll20» σημαίνει ότι γράφτηκαν XP σε εκείνο το φύλλο σε παιχνίδι Jumpgate, εκτελέστηκαν οι δικοί του υπολογισμοί και ελέγχθηκαν τα πλάσματα που νικήθηκαν και οι ειδοποιήσεις νέου επιπέδου.',
          'Τα φύλλα Beacon, όπως το D&D 2024, χρειάζονται Mod sandbox v1.5 και ένα Mod δεν μπορεί να τα ορίσει στα 0 XP.',
          'Το Pathfinder 1E και το Starfinder χρησιμοποιούν το πλαίσιο XP για το επόμενο επίπεδο του φύλλου για τις ειδοποιήσεις νέου επιπέδου. Όταν είναι κενό, το Pathfinder χρησιμοποιεί τον μεσαίο ρυθμό και το Starfinder τον δικό του πίνακα.',
          'WFRP 4E: κάθε απονομή προστίθεται ως γραμμή στη λίστα Experience του φύλλου, αλλά στις δοκιμές το φύλλο δεν ξαναυπολόγισε τα σύνολα XP του, γι’ αυτό ελέγξτε τα στο φύλλο.',
          'Στα Savage Worlds, 13th Age, Cosmere και Call of Cthulhu δεν υπάρχουν XP για να γράψει ένα Mod.',
        ],
      },
      settings: {
        heading: 'Ρυθμίσεις',
        intro: 'Αλλάξτε ρυθμίσεις στην κάρτα ρυθμίσεων ή με !lazyxp set <ρύθμιση> <τιμή>.',
        colKey: 'Ρύθμιση',
        colName: 'Όνομα',
        colDesc: 'Τι κάνει',
      },
      upgrading: {
        heading: 'Αναβάθμιση από το 0.1',
        points: [
          'Οι ρυθμίσεις, τα XP συνεδρίας και τα επιπλέον XP ανά χαρακτήρα από το 0.1 μεταφέρονται την πρώτη φορά που ξεκινά το 1.0.',
          'Οι παίκτες ή οι χαρακτήρες που δεν ήταν ενεργοί εξαιρούνται από την ομάδα.',
          'Ένα προσαρμοσμένο όνομα εντολής από το 0.1 εξακολουθεί να λειτουργεί.',
          'Οι παλιές εντολές εξακολουθούν να λειτουργούν:',
        ],
        colV1: '0.1',
        colV2: '1.0',
      },
      troubleshooting: {
        heading: 'Αντιμετώπιση προβλημάτων',
        points: [
          'Δεν γράφεται τίποτα στα φύλλα D&D 2024: ελέγξτε ότι το παιχνίδι χρησιμοποιεί Mod sandbox v1.5 (!lazyxp status).',
          'Ένα πλάσμα δίνει 0 XP: το φύλλο του δεν έχει XP ή βαθμό πρόκλησης. Χρησιμοποιήστε το «Άλλο ποσό» ή !lazyxp kill --xp 100.',
          'Οι νίκες δεν εντοπίζονται: ελέγξτε ότι η «Μπάρα HP» είναι η μπάρα που περιέχει τους πόντους ζωής.',
          'Το !xp δεν κάνει τίποτα: το χρησιμοποιεί άλλο Mod XP. Χρησιμοποιήστε το !lazyxp.',
        ],
      },
      languages: {
        heading: 'Γλώσσες',
        body: 'Επιλέξτε γλώσσα με !lazyxp lang. Οι κάρτες συνομιλίας και τα handouts αλλάζουν αμέσως.',
        colLanguage: 'Γλώσσα',
        colNative: 'Όνομα',
        colCode: 'Κωδικός',
      },
      credits: {
        heading: 'Συντελεστές',
        original: 'Δημιουργήθηκε από',
        maintainer: 'Ξαναγράφτηκε και συντηρείται από',
        support: 'Αναφορές σφαλμάτων και ιδέες είναι ευπρόσδεκτες στο φόρουμ του Roll20.',
      },
    },
  };

  var localeHe = {
    titles: {
      ready: 'LazyExperience מוכן.',
      help: 'עזרה של LazyExperience',
      settings: 'הגדרות LazyExperience',
      status: 'מצב LazyExperience',
      roster: 'קבוצה',
      language: 'שפה',
      levelUp: 'עלייה ברמה!',
      defeated: 'יצור הובס',
      xpAwarded: 'ניסיון הוענק',
      sessionEnded: 'מפגש {number} הסתיים',
      yourXp: 'הניסיון שלך',
      pool: 'XP של המפגש',
      bonus: 'XP בונוס',
      undo: 'ביטול',
      log: 'יומן מפגשים',
      partyXp: 'ניסיון הקבוצה',
    },
    menu: {
      session: 'מפגש',
      pool: 'XP של המפגש',
      payout: 'שולם',
      shares: 'חלקים',
      perShare: 'XP לכל חלק',
      party: 'קבוצה ({source})',
      noParty: 'אין עדיין אף אחד בקבוצה. פתחו את כרטיס הקבוצה כדי להוסיף דמויות.',
      absentTag: '(נעדר)',
      bonusTag: '(+{xp} בונוס)',
      levelTag: 'רמה {level}',
      shareTag: 'חלק {share}',
      rosterSource: 'הקבוצה לפי',
      excluded: 'מוחרגים',
      blank: '(ריק)',
      groupXp: 'ניסיון',
      groupParty: 'קבוצה',
      groupKills: 'יצורים שהובסו',
      groupSheet: 'דף דמות',
    },
    buttons: {
      menu: 'תפריט',
      help: 'עזרה',
      settings: 'הגדרות',
      status: 'מצב',
      roster: 'קבוצה',
      addXp: 'הוספת XP',
      killSelected: 'הובסו: הנבחרים',
      bonusSelected: 'בונוס: הנבחרים',
      giveSelected: 'מתן מיידי: הנבחרים',
      endSession: 'סיום המפגש',
      undo: 'ביטול',
      show: 'XP הקבוצה',
      log: 'יומן מפגשים',
      absent: 'נעדר',
      present: 'נוכח',
      share: 'חלק',
      exclude: 'החרגה',
      include: 'הכללה',
      partyAdd: 'הוספת הנבחרים לקבוצה',
      partyRemove: 'הסרת הנבחרים',
      addKill: 'הוספת {xp} XP',
      otherXp: 'כמות אחרת',
      ignore: 'התעלמות',
    },
    prompts: {
      xp: 'XP',
      reason: 'סיבה (לא חובה)',
      share: 'חלק (1 = מלא, 0.5 = חצי)',
      confirmEnd: 'לסיים את המפגש ולחלק את ה-XP?',
    },
    options: {
      yesNo: { yes: 'כן', no: 'לא' },
      payout: { end: 'בסוף המפגש', instant: 'מיד' },
      roster: {
        auto: 'אוטומטי',
        party: 'הקבוצה של Roll20',
        players: 'דמויות השחקנים',
        manual: 'נבחר על ידי המנחה',
      },
      killMode: { prompt: 'לשאול את המנחה', auto: 'הוספה אוטומטית', off: 'כבוי' },
      announce: { public: 'כולם', whisper: 'השחקנים הרלוונטיים', gm: 'המנחה בלבד', off: 'כבוי' },
      levelNotice: {
        public: 'כולם',
        whisper: 'השחקן והמנחה',
        gm: 'המנחה בלבד',
        off: 'כבוי',
      },
      system: { auto: 'זיהוי לפי הדף' },
    },
    settings: {
      language: { label: 'שפה', desc: 'השפה של כרטיסי הצ׳אט וה-handouts.' },
      payout: {
        label: 'תשלום XP',
        desc: 'end: ה-XP נאסף במאגר המפגש ומחולק בסיומו. instant: כל הענקה מחולקת ומשולמת מיד.',
      },
      updateSheets: {
        label: 'עדכון דפי דמות',
        desc: 'כתיבת ה-XP לדפי הדמות. כשכבוי, הסכומים רק מוכרזים.',
      },
      system: {
        label: 'מערכת משחק',
        desc: 'אילו שדות בדף מכילים XP ורמה. auto בוחר פרופיל לפי הדף של כל דמות; custom משתמש בשדות המותאמים.',
      },
      roster: {
        label: 'הקבוצה לפי',
        desc: 'auto: הקבוצה של Roll20 אם יש בה מישהו, אחרת דמויות שנשלטות על ידי שחקנים. party, players או manual בוחרים אפשרות אחת.',
      },
      absentShare: {
        label: 'חלק של נעדרים',
        desc: 'החלק מתוך חלק מלא שדמות נעדרת עדיין מקבלת, מ-0% (כלום) עד 100% (מלא).',
      },
      extraShares: {
        label: 'חלקים נוספים',
        desc: 'חלקים עבור מלווים או שכירים שאינם בדף דמות. ה-XP שלהם אינו משולם לאיש.',
      },
      killMode: {
        label: 'יצורים שהובסו',
        desc: 'prompt: לשאול את המנחה לפני הוספת ה-XP של יצור. auto: להוסיף מיד. off: לא לעקוב אחר טוקנים.',
      },
      killBar: {
        label: 'מעקב אחר פס HP',
        desc: 'לספור יצור כמובס כשפס ה-HP שלו יורד ל-0 או נמוך יותר.',
      },
      hpBar: { label: 'פס HP', desc: 'איזה פס של הטוקן (1, 2 או 3) מכיל את נקודות החיים.' },
      killMarker: {
        label: 'מעקב אחר סמן',
        desc: 'לספור יצור כמובס כשסמן ההבסה מונח על הטוקן שלו.',
      },
      marker: {
        label: 'סמן הבסה',
        desc: 'הסמן שמשמעותו הובס: שם מובנה כמו dead, או שם של סמן מותאם.',
      },
      killDeathTracker: {
        label: 'שימוש ב-DeathTracker',
        desc: 'לספור יצור כמובס כש-DeathTracker 1.0 ומעלה מסמן אותו כמת.',
      },
      announce: {
        label: 'הודעות XP',
        desc: 'מי רואה הענקות XP וסיכום סוף מפגש: public (כולם), whisper (השחקנים הרלוונטיים והמנחה), gm או off.',
      },
      levelNotice: {
        label: 'הודעות עלייה ברמה',
        desc: 'מי רואה הודעות עלייה ברמה: public (כולם), whisper (השחקן והמנחה), gm או off.',
      },
      customXp: {
        label: 'שדה XP מותאם',
        desc: 'השדה בדף עבור ה-XP של דמות כשמערכת המשחק היא custom. ברשימה, כל שם נבדק לפי הסדר.',
      },
      customLevel: { label: 'שדה רמה מותאם', desc: 'השדה בדף עבור הרמה של דמות.' },
      customNpcXp: {
        label: 'שדה XP מותאם ליצור',
        desc: 'השדה בדף עבור ה-XP ששווה יצור.',
      },
      customNpcCr: {
        label: 'שדה אתגר מותאם',
        desc: 'השדה בדף עבור דרגת האתגר של יצור, בשימוש כשאין לו ערך XP.',
      },
      customLevels: {
        label: 'טבלת רמות מותאמת',
        desc: 'ה-XP הדרוש לכל רמה, החל מרמה 1, למשל 0,300,900,2700. אם ריק, הודעות העלייה ברמה כבויות עבור דפים מותאמים.',
      },
    },
    roster: {
      explain: {
        party: 'דמויות שסומנו כ-Party Member ב-Roll20 חולקות את ה-XP.',
        players:
          'דמויות שנשלטות על ידי שחקן חולקות את ה-XP. סמנו Party Member בדמויות כדי להשתמש בקבוצה של Roll20 במקום זאת.',
        manual: 'רק דמויות שהכללתם חולקות את ה-XP.',
      },
      selectHint: 'בחרו קודם טוקנים כדי להוסיף אותם לקבוצה או להסיר אותם.',
    },
    kills: {
      prompt: '{name} הובס. להוסיף {xp} XP למפגש?',
      noXp: '{name} הובס, אבל אין ערך XP בדף שלו.',
      reason: 'הובס: {name}',
      result: {
        prompted: 'נשאלה שאלה',
        added: 'נוסף',
        counted: 'כבר נספר במפגש הזה',
        noXp: 'אין XP בדף: השתמשו ב---xp',
        notCreature: 'לא יצור (אין דף, או שהוא בקבוצה)',
      },
    },
    levels: {
      reached: 'ל-{name} יש מספיק XP לרמה {level}!',
      sheetButton: 'השתמשו בכפתור העלייה ברמה בדף הדמות.',
      updateSheet: 'עדכנו את הרמה בדף הדמות.',
      pf2: 'העלו את הרמה בדף והפחיתו 1,000 מה-XP.',
      spend: 'הוציאו את ה-XP והעלו את הרמה בדף.',
    },
    instant: {
      everyone: 'כל חברי הקבוצה מקבלים {xp} XP.',
      bonus: '{names} מקבלים {xp} XP.',
    },
    end: {
      nothing: 'לא הוענק XP במפגש הזה.',
      playerLine: '{name} מקבל {xp} XP במפגש הזה.',
      playerLineTotal: '{name} מקבל {xp} XP במפגש הזה, בסך הכול {total} XP.',
      levelLine: '{name} הגיע לרמה {level}.',
      remainder: '{xp} XP לא התחלקו בצורה שווה ועוברים למפגש הבא.',
    },
    show: {
      noXp: 'אין XP בדף',
      next: 'הרמה הבאה ב-{xp}',
    },
    awardKinds: { pool: 'XP של המפגש', bonus: 'XP בונוס', give: 'XP שניתן' },
    messages: {
      saved: 'נשמר.',
      commands: 'פקודות: {commands}',
      aliasTaken: '{alias} שמור ל-{mods}. השתמשו ב-!lazyxp.',
      migrated: 'ההגדרות, ה-XP של המפגש וה-XP הנוסף מ-LazyExperience 0.1 הועברו.',
      handouts: 'ה-handouts Help, Command Deck ו-Session Log נבנו מחדש.',
      noLog: 'עדיין לא הסתיים אף מפגש, ולכן אין יומן מפגשים.',
      poolAdded: '{xp} XP נוספו למפגש.',
      bonusAdded: '{xp} XP בונוס עבור {names}.',
      killAdded: '{xp} XP עבור {name} נוספו למפגש.',
      killGone: 'ההבסה הזו כבר נוספה או שאינה ממתינה עוד.',
      undone: '{xp} XP בוטלו ({reason}).',
      nothingToUndo: 'אין מה לבטל במפגש הזה.',
      nothingToUndoInstant: 'ה-XP כבר שולם. השתמשו ב-give עם כמות שלילית כדי לתקן.',
      sessionReset: 'ה-XP והבונוסים של המפגש נוקו. דבר לא שולם.',
      absent: 'סומנו כנעדרים במפגש הזה: {names}.',
      present: 'סומנו כנוכחים: {names}.',
      party: {
        add: 'נוספו לקבוצה: {names}.',
        remove: 'הוסרו מהקבוצה: {names}.',
      },
    },
    warnings: {
      sandbox:
        'חלק מהדמויות משתמשות בדף Beacon (כמו D&D 2024), ש-Mod sandbox יכול לקרוא ולכתוב רק בגרסה v1.5. בחרו Mod sandbox v1.5 בהגדרות ה-Mod של המשחק.',
      partyLegacy: 'הקבוצה של Roll20 היא יכולת של Jumpgate; במשחק הזה המוד מנהל רשימת קבוצה משלו.',
      nobodyToPay: 'אין אף אחד בקבוצה, ולכן {xp} XP נשמרים לאחר כך.',
      write: {
        zero: '{name}: אי אפשר להגדיר את הדף ל-0 XP מתוך Mod. שנו זאת בדף עצמו.',
        sandbox: '{name}: הדף הזה צריך Mod sandbox v1.5 כדי לעדכן XP.',
        xpless: '{name}: מערכת המשחק הזו אינה משתמשת ב-XP (או שהדף מחשב אותו בעצמו).',
        noField:
          '{name}: לא ידוע שדה XP עבור הדף הזה. הגדירו את מערכת המשחק ל-custom וציינו את שם השדה.',
        error: '{name}: לא ניתן היה לעדכן את הדף ב-{xp} XP. עיינו בקונסולת ה-Mod.',
      },
    },
    errors: {
      gmOnly: 'רק המנחה יכול להשתמש בפקודות של LazyExperience.',
      failed: 'משהו השתבש: {message}',
      unknownCommand: 'פקודה לא מוכרת “{name}”.',
      helpHint: 'הקלידו {command} help לרשימת הפקודות.',
      unknownSetting: 'הגדרה לא מוכרת “{name}”.',
      settingsHint: 'פתחו את כרטיס ההגדרות כדי לראות את ההגדרות.',
      badValue: '“{value}” אינו ערך תקין עבור {name}.',
      badXp: 'ציינו את ה-XP כמספר שלם, למשל 250.',
      badShare: 'ציינו את החלק כמספר בין 0 ל-10, למשל 0.5 או 50%.',
      noCharacters: 'בחרו טוקנים שמייצגים דמויות, או השתמשו ב---ids.',
      noTokens: 'בחרו קודם את הטוקנים שהובסו, או השתמשו ב---ids.',
    },
    status: {
      version: 'גרסה',
      sandbox: 'Mod sandbox',
      beacon: 'דפי Beacon קריאים',
      commands: 'פקודות',
      profiles: 'מערכות משחק בשימוש',
      characters: '{count} דמויות',
      handouts: 'ראו את ה-handouts {help} ו-{deck}.',
    },
    log: {
      title: 'יומן מפגשים',
      sessionHeading: 'מפגש {number} — {date}',
      colCharacter: 'דמות',
      colXp: 'XP',
      awards: 'הענקות',
      levelUps: 'רמות:',
      empty: 'עדיין לא הסתיים אף מפגש.',
    },
    help: {
      menu: 'הצגת התפריט הראשי.',
      add: 'הוספת XP למאגר המפגש, עם סיבה לא חובה.',
      bonus: 'מתן XP בונוס לדמויות הנבחרות, מעבר לחלק שלהן.',
      give: 'תשלום XP מיד לדמויות הנבחרות.',
      kill: 'ספירת הטוקנים הנבחרים כמובסים והוספת ה-XP שלהם.',
      killConfirm: 'הוספת ה-XP של יצור שהובס (כפתור השאלה), אפשר עם כמות אחרת.',
      absent: 'סימון הדמויות הנבחרות כנעדרות במפגש הזה.',
      present: 'סימון הדמויות הנבחרות כנוכחות שוב.',
      share: 'קביעת החלק של הדמויות הנבחרות (1 = מלא).',
      exclude: 'החרגת דמויות מהקבוצה, או הכללתן מחדש.',
      undo: 'ביטול ההענקה האחרונה שטרם שולמה.',
      end: 'סיום המפגש: תשלום ה-XP, הכרזה ורישום ביומן.',
      resetSession: 'ניקוי ה-XP של המפגש בלי לשלם אותו.',
      show: 'הצגת ה-XP והרמה של כל חבר בקבוצה מתוך הדף.',
      roster: 'הצגת כרטיס הקבוצה.',
      party: 'סימון או ביטול סימון של התיבה Party Member ב-Roll20 עבור הדמויות הנבחרות.',
      settings: 'הצגת כרטיס ההגדרות.',
      set: 'שינוי הגדרה.',
      lang: 'בחירת שפה.',
      status: 'הצגת ה-sandbox, הפקודות ומערכות המשחק בשימוש.',
      log: 'קישור ל-handout של יומן המפגשים.',
      journal: 'בנייה מחדש של ה-handouts.',
      help: 'הצגת העזרה הזו.',
      handouts: 'עוד ב-handouts {help} ו-{deck}.',
    },
    deck: {
      session: 'מפגש',
      sessionDesc: 'הוסיפו XP למפגש, בדקו את הקבוצה וסיימו את המפגש.',
      selected: 'טוקנים נבחרים',
      selectedDesc: 'בחרו קודם טוקנים על המפה.',
      party: 'קבוצה',
      partyDesc: 'מי חולק את ה-XP.',
      tools: 'כלים',
      toolsDesc: 'הגדרות, מצב ועזרה.',
      footer: 'הכפתורים מריצים פקודות של LazyExperience. פרטים ב-handout {help}.',
    },
    handout: {
      versionLabel: 'גרסה',
      subtitle: 'ניסיון מפגש, מחולק בהגינות, על כל דף דמות',
      footer: 'כפתורים לכל פקודה נמצאים ב-handout {deck}.',
      overview: {
        heading: 'סקירה',
        body: 'LazyExperience אוסף את נקודות הניסיון שהושגו במהלך מפגש, מחלק אותן בין חברי הקבוצה וכותב אותן לדפי הדמויות. הוא קורא וכותב את דף D&D 2024 וכן דפים ישנים יותר ואחרים, משתמש בקבוצה של Roll20 עצמו, מזהה יצורים שהובסו, מטפל בשחקנים נעדרים וב-XP בונוס, מכריז על עליות ברמה ומנהל יומן של כל מפגש.',
      },
      quickStart: {
        heading: 'התחלה מהירה',
        steps: [
          'סמנו Party Member בכל דמות של שחקן (בהגדרות חלון הדמות), או דלגו על כך: אז נעשה שימוש בדמויות שנשלטות על ידי שחקנים.',
          'הקלידו !lazyxp כדי לפתוח את התפריט.',
          'כשהקבוצה מביסה יצור, ירידת פס ה-HP שלו ל-0 תשאל אתכם אם להוסיף את ה-XP שלו. אפשר גם לבחור טוקנים וללחוץ על ״הובסו: הנבחרים״.',
          'הוסיפו XP על כל דבר אחר באמצעות ״הוספת XP״, ו-XP בונוס לדמות אחת באמצעות ״בונוס: הנבחרים״.',
          'סמנו שחקנים שהחמיצו את המפגש כ״נעדר״.',
          'לחצו על ״סיום המפגש״. החלק של כל אחד נכתב לדף שלו, מוכרז ונוסף ל-handout של יומן המפגשים.',
        ],
      },
      commands: {
        heading: 'פקודות',
        intro:
          'כל פקודה מתחילה ב-!lazyxp; גם {long} עובד, וכך גם {short} כל עוד אף Mod XP אחר אינו משתמש בו. רק המנחה יכול להשתמש בהן.',
        targets:
          'פקודות לדמויות משתמשות בטוקנים הנבחרים, או ב---ids ואחריו מזהים של דמויות או טוקנים מופרדים בפסיקים.',
        colCommand: 'פקודה',
        colDesc: 'מה היא עושה',
      },
      party: {
        heading: 'הקבוצה',
        points: [
          'אוטומטי: כשדמות כלשהי מסומנת כ-Party Member ב-Roll20 (Jumpgate), הקבוצה של Roll20 חולקת את ה-XP; אחרת, כל דמות שנשלטת על ידי שחקן.',
          'דמויות שנשלטות על ידי ״כל השחקנים״ בלבד, כמו טוקני עזר, אינן נספרות.',
          'הוספה לקבוצה והסרה מהקבוצה מסמנות או מבטלות סימון של Party Member עבור הדמויות הנבחרות.',
          '״החרגה״ מוציאה דמות מהקבוצה לצמיתות; ״הכללה״ מחזירה אותה.',
          'דמות שנשלטת על ידי כמה שחקנים נספרת פעם אחת.',
        ],
      },
      splitting: {
        heading: 'חלוקת ה-XP',
        points: [
          'ה-XP של המפגש מחולק במספר החלקים: אחד לכל חבר בקבוצה, ועוד חלקים נוספים אם יש.',
          'דמויות נעדרות מקבלות את ההגדרה ״חלק של נעדרים״ (0% כברירת מחדל). היעדרות נמשכת מפגש אחד.',
          'לדמות יכול להיות חלק שונה, למשל 0.5 עבור עוזר.',
          'XP בונוס מגיע לדמויות שנבחרו, מעבר לחלק שלהן.',
          'XP שאינו מתחלק בצורה שווה עובר למפגש הבא.',
          'כש״תשלום XP״ מוגדר ל-instant, כל הענקה מחולקת ומשולמת מיד.',
        ],
      },
      kills: {
        heading: 'יצורים שהובסו',
        points: [
          'יצור נחשב כמובס כשפס ה-HP שלו יורד ל-0, כשסמן ההבסה מונח עליו, או כש-DeathTracker מסמן אותו כמת.',
          'שינויים שנעשו על ידי TokenMod, על ידי הדף או על ידי Mods אחרים דרך התכונה המקושרת מזוהים גם הם.',
          'נספרים רק טוקנים של דמויות שמחוץ לקבוצה ושאף שחקן אינו שולט בהן, וכל טוקן פעם אחת בלבד למפגש.',
          'ה-XP נלקח מהדף: ערך ה-XP של היצור, או דרגת האתגר שלו.',
          'האפשרות ״לשאול את המנחה״ (ברירת המחדל) שולחת בלחישה שאלה עם ״הוספה״, ״כמות אחרת״ ו״התעלמות״. ״הוספה אוטומטית״ מדלגת על השאלה.',
        ],
      },
      levels: {
        heading: 'עליות רמה',
        points: [
          'לאחר כתיבת ה-XP, LazyExperience בודק את טבלת הרמות של המערכת ומכריז כשלדמות יש מספיק XP לרמה חדשה.',
          'בדף D&D 2024 השחקן לוחץ אז על כפתור העלייה ברמה של הדף.',
        ],
      },
      systems: {
        heading: 'מערכות משחק',
        intro:
          'LazyExperience בוחר פרופיל לפי הדף של כל דמות. הגדירו מערכת משחק כדי לכפות אחת, או custom כדי לציין את השדות בעצמכם.',
        colSystem: 'מערכת',
        colId: 'ID',
        colSheets: 'דפים',
        colChecked: 'נבדק',
        verified: {
          live: 'נבדק ב-Roll20',
          partial: 'נבדק חלקית ב-Roll20',
          source: 'מקוד המקור של הדף',
          none: '—',
        },
        points: [
          'בחרו את הדף לפי שמו בהגדרות של המשחק. דפים שאינם ברשימה משתמשים בשמות השדות הנפוצים experience, xp ו-level, או הגדירו מערכת משחק כ-custom.',
          'נבדק ב-Roll20 פירושו שנכתב XP לדף הזה במשחק Jumpgate, החישובים של הדף עצמו רצו, ויצורים שהובסו והודעות עלייה ברמה נבדקו.',
          'דפי Beacon כמו D&D 2024 דורשים Mod sandbox v1.5, ואי אפשר להגדיר אותם ל-0 XP מתוך Mod.',
          'Pathfinder 1E ו-Starfinder משתמשים בתיבת ה-XP לרמה הבאה שבדף עבור הודעות עלייה ברמה. כשהיא ריקה, Pathfinder משתמש במסלול הבינוני ו-Starfinder בטבלה משלו.',
          'WFRP 4E: כל הענקה מתווספת כשורה ברשימת Experience שבדף, אבל בבדיקות הדף לא חישב מחדש את סכומי ה-XP שלו, לכן בדקו אותם בדף.',
          'ל-Savage Worlds, 13th Age, Cosmere ו-Call of Cthulhu אין XP ש-Mod יכול לכתוב.',
        ],
      },
      settings: {
        heading: 'הגדרות',
        intro: 'שנו הגדרות בכרטיס ההגדרות, או באמצעות !lazyxp set <הגדרה> <ערך>.',
        colKey: 'הגדרה',
        colName: 'שם',
        colDesc: 'מה היא עושה',
      },
      upgrading: {
        heading: 'שדרוג מ-0.1',
        points: [
          'הגדרות, XP של המפגש ו-XP נוסף לכל דמות מ-0.1 מועברים בפעם הראשונה ש-1.0 מופעל.',
          'שחקנים או דמויות שלא היו פעילים מוחרגים מהקבוצה.',
          'שם פקודה מותאם מ-0.1 ממשיך לעבוד.',
          'הפקודות הישנות עדיין עובדות:',
        ],
        colV1: '0.1',
        colV2: '1.0',
      },
      troubleshooting: {
        heading: 'פתרון בעיות',
        points: [
          'לא נכתב דבר לדפי D&D 2024: ודאו שהמשחק משתמש ב-Mod sandbox v1.5 (!lazyxp status).',
          'יצור נותן 0 XP: אין בדף שלו XP או דרגת אתגר. השתמשו ב״כמות אחרת״ או ב-!lazyxp kill --xp 100.',
          'הבסות אינן מזוהות: ודאו ש״פס HP״ הוא הפס שמכיל את נקודות החיים.',
          '!xp לא עושה כלום: Mod XP אחר משתמש בו. השתמשו ב-!lazyxp.',
        ],
      },
      languages: {
        heading: 'שפות',
        body: 'בחרו שפה באמצעות !lazyxp lang. כרטיסי הצ׳אט וה-handouts משתנים מיד.',
        colLanguage: 'שפה',
        colNative: 'שם',
        colCode: 'קוד',
      },
      credits: {
        heading: 'קרדיטים',
        original: 'נוצר על ידי',
        maintainer: 'נכתב מחדש ומתוחזק על ידי',
        support: 'דיווחי באגים ורעיונות מתקבלים בברכה בפורום של Roll20.',
      },
    },
  };

  var localeHu = {
    titles: {
      ready: 'A LazyExperience készen áll.',
      help: 'LazyExperience súgó',
      settings: 'LazyExperience beállítások',
      status: 'LazyExperience állapot',
      roster: 'Csapat',
      language: 'Nyelv',
      levelUp: 'Szintlépés!',
      defeated: 'Lény legyőzve',
      xpAwarded: 'Tapasztalat odaítélve',
      sessionEnded: '{number}. játékalkalom vége',
      yourXp: 'A te tapasztalatod',
      pool: 'Alkalom XP',
      bonus: 'Bónusz XP',
      undo: 'Visszavonás',
      log: 'Alkalomnapló',
      partyXp: 'A csapat tapasztalata',
    },
    menu: {
      session: 'Játékalkalom',
      pool: 'Alkalom XP',
      payout: 'Kifizetve',
      shares: 'Részek',
      perShare: 'XP részenként',
      party: 'Csapat ({source})',
      noParty: 'Még senki sincs a csapatban. Nyisd meg a Csapat kártyát karakterek hozzáadásához.',
      absentTag: '(távol)',
      bonusTag: '(+{xp} bónusz)',
      levelTag: '{level}. szint',
      shareTag: 'Rész: {share}',
      rosterSource: 'Csapat forrása',
      excluded: 'Kihagyva',
      blank: '(üres)',
      groupXp: 'Tapasztalat',
      groupParty: 'Csapat',
      groupKills: 'Legyőzött lények',
      groupSheet: 'Karakterlap',
    },
    buttons: {
      menu: 'Menü',
      help: 'Súgó',
      settings: 'Beállítások',
      status: 'Állapot',
      roster: 'Csapat',
      addXp: 'XP hozzáadása',
      killSelected: 'Legyőzve: kijelöltek',
      bonusSelected: 'Bónusz: kijelöltek',
      giveSelected: 'Azonnali adás: kijelöltek',
      endSession: 'Alkalom lezárása',
      undo: 'Visszavonás',
      show: 'Csapat XP',
      log: 'Alkalomnapló',
      absent: 'Távol',
      present: 'Jelen',
      share: 'Rész',
      exclude: 'Kihagyás',
      include: 'Felvétel',
      partyAdd: 'Kijelöltek a csapatba',
      partyRemove: 'Kijelöltek eltávolítása',
      addKill: '{xp} XP hozzáadása',
      otherXp: 'Más mennyiség',
      ignore: 'Mellőzés',
    },
    prompts: {
      xp: 'XP',
      reason: 'Indok (nem kötelező)',
      share: 'Rész (1 = teljes, 0,5 = fél)',
      confirmEnd: 'Lezárod az alkalmat és kiosztod az XP-t?',
    },
    options: {
      yesNo: { yes: 'Igen', no: 'Nem' },
      payout: { end: 'Az alkalom végén', instant: 'Azonnal' },
      roster: {
        auto: 'Automatikus',
        party: 'Roll20 csapat',
        players: 'A játékosok karakterei',
        manual: 'A játékmester választja',
      },
      killMode: { prompt: 'Rákérdez a játékmesternél', auto: 'Automatikus hozzáadás', off: 'Ki' },
      announce: {
        public: 'Mindenki',
        whisper: 'Az érintett játékosok',
        gm: 'Csak a játékmester',
        off: 'Ki',
      },
      levelNotice: {
        public: 'Mindenki',
        whisper: 'A játékos és a játékmester',
        gm: 'Csak a játékmester',
        off: 'Ki',
      },
      system: { auto: 'Felismerés a karakterlapból' },
    },
    settings: {
      language: { label: 'Nyelv', desc: 'A csevegőkártyák és a handoutok nyelve.' },
      payout: {
        label: 'XP kifizetése',
        desc: 'end: az XP az alkalom készletében gyűlik, és az alkalom végén osztják szét. instant: minden jutalom azonnal elosztásra és kifizetésre kerül.',
      },
      updateSheets: {
        label: 'Karakterlapok frissítése',
        desc: 'Az XP-t ráírja a karakterlapokra. Kikapcsolva az összegeket csak bejelenti.',
      },
      system: {
        label: 'Játékrendszer',
        desc: 'Mely lapmezők tartalmazzák az XP-t és a szintet. Az auto minden karakter lapja alapján választ profilt; a custom az egyéni mezőbeállításokat használja.',
      },
      roster: {
        label: 'Csapat forrása',
        desc: 'auto: a Roll20 csapat, ha van benne valaki, különben a játékosok által irányított karakterek. A party, players vagy manual egyet kiválaszt.',
      },
      absentShare: {
        label: 'Távollévők része',
        desc: 'A részesedés azon hányada, amelyet a távol lévő karakter is megkap, 0% (semmi) és 100% (teljes) között.',
      },
      extraShares: {
        label: 'Extra részek',
        desc: 'Részek olyan társaknak vagy zsoldosoknak, akiknek nincs karakterlapjuk. Az ő XP-jüket senkinek sem fizetik ki.',
      },
      killMode: {
        label: 'Legyőzött lények',
        desc: 'prompt: rákérdez a játékmesternél, mielőtt hozzáadja a lény XP-jét. auto: azonnal hozzáadja. off: nem figyeli a tokeneket.',
      },
      killBar: {
        label: 'HP-sáv figyelése',
        desc: 'A lényt legyőzöttnek számítja, ha a HP-sávja 0-ra vagy az alá csökken.',
      },
      hpBar: {
        label: 'HP-sáv',
        desc: 'A token melyik sávja (1, 2 vagy 3) tartalmazza az életerőpontokat.',
      },
      killMarker: {
        label: 'Jelölő figyelése',
        desc: 'A lényt legyőzöttnek számítja, ha a tokenjére felkerül a legyőzött jelölő.',
      },
      marker: {
        label: 'Legyőzött jelölő',
        desc: 'A legyőzöttet jelentő jelölő: beépített név, például dead, vagy egyéni jelölő neve.',
      },
      killDeathTracker: {
        label: 'DeathTracker használata',
        desc: 'A lényt legyőzöttnek számítja, ha a DeathTracker 1.0 vagy újabb halottnak jelöli.',
      },
      announce: {
        label: 'XP-üzenetek',
        desc: 'Ki látja az XP-jutalmakat és az alkalom végi összegzést: public (mindenki), whisper (az érintett játékosok és a játékmester), gm vagy off.',
      },
      levelNotice: {
        label: 'Szintlépési értesítések',
        desc: 'Ki látja a szintlépési értesítéseket: public (mindenki), whisper (a játékos és a játékmester), gm vagy off.',
      },
      customXp: {
        label: 'Egyéni XP-mező',
        desc: 'A karakter XP-jét tartalmazó lapmező, ha a Játékrendszer custom. A lista a neveket sorban kipróbálja.',
      },
      customLevel: { label: 'Egyéni szintmező', desc: 'A karakter szintjét tartalmazó lapmező.' },
      customNpcXp: {
        label: 'Egyéni lény-XP-mező',
        desc: 'A lény XP-értékét tartalmazó lapmező.',
      },
      customNpcCr: {
        label: 'Egyéni kihívásmező',
        desc: 'A lény kihívási értékét tartalmazó lapmező, akkor használatos, ha a lénynek nincs XP-értéke.',
      },
      customLevels: {
        label: 'Egyéni szinttáblázat',
        desc: 'Az egyes szintekhez szükséges XP az 1. szinttől, például 0,300,900,2700. Üresen az egyéni lapoknál kikapcsolja a szintlépési értesítéseket.',
      },
    },
    roster: {
      explain: {
        party:
          'Az XP-n azok a karakterek osztoznak, akiket a Roll20-ban Party Member-nek jelöltek.',
        players:
          'Az XP-n a játékos által irányított karakterek osztoznak. A Roll20 csapat használatához jelöld be a Party Member-t a karaktereknél.',
        manual: 'Az XP-n csak a felvett karakterek osztoznak.',
      },
      selectHint:
        'Először jelölj ki tokeneket, hogy hozzáadhasd őket a csapathoz, vagy eltávolítsd őket.',
    },
    kills: {
      prompt: '{name} legyőzve. Hozzáadsz {xp} XP-t az alkalomhoz?',
      noXp: '{name} legyőzve, de a lapján nincs XP-érték.',
      reason: 'Legyőzve: {name}',
      result: {
        prompted: 'rákérdezve',
        added: 'hozzáadva',
        counted: 'ebben az alkalomban már beszámítva',
        noXp: 'nincs XP a lapon: használd a --xp kapcsolót',
        notCreature: 'nem lény (nincs lapja, vagy a csapat tagja)',
      },
    },
    levels: {
      reached: '{name} elég XP-vel rendelkezik a(z) {level}. szinthez!',
      sheetButton: 'Használd a karakterlap Level Up gombját.',
      updateSheet: 'Frissítsd a szintet a karakterlapon.',
      pf2: 'Emeld a szintet a lapon, és vonj le 1000-et az XP-ből.',
      spend: 'Költsd el az XP-t, és emeld a szintet a lapon.',
    },
    instant: {
      everyone: 'A csapat minden tagja {xp} XP-t kap.',
      bonus: '{names} {xp} XP-t kap.',
    },
    end: {
      nothing: 'Ebben az alkalomban nem ítéltek oda XP-t.',
      playerLine: '{name} {xp} XP-t kap ebben az alkalomban.',
      playerLineTotal: '{name} {xp} XP-t kap ebben az alkalomban, összesen {total} XP-vel.',
      levelLine: '{name} elérte a(z) {level}. szintet.',
      remainder: '{xp} XP nem osztható egyenlően, ezért átkerül a következő alkalomra.',
    },
    show: {
      noXp: 'nincs XP a lapon',
      next: 'következő szint: {xp}',
    },
    awardKinds: { pool: 'Alkalom XP', bonus: 'Bónusz XP', give: 'Adott XP' },
    messages: {
      saved: 'Mentve.',
      commands: 'Parancsok: {commands}',
      aliasTaken: 'Az {alias} a következőé: {mods}. Használd a !lazyxp parancsot.',
      migrated: 'A LazyExperience 0.1 beállításai, alkalom-XP-je és extra XP-je átkerült.',
      handouts: 'A Súgó, a Command Deck és az Alkalomnapló handoutok újra elkészültek.',
      noLog: 'Még nem ért véget alkalom, ezért nincs Alkalomnapló.',
      poolAdded: '{xp} XP hozzáadva az alkalomhoz.',
      bonusAdded: '{xp} bónusz XP: {names}.',
      killAdded: '{xp} XP hozzáadva az alkalomhoz ({name}).',
      killGone: 'Ezt a legyőzést már hozzáadták, vagy már nincs függőben.',
      undone: 'Visszavonva {xp} XP ({reason}).',
      nothingToUndo: 'Ebben az alkalomban nincs mit visszavonni.',
      nothingToUndoInstant:
        'Az XP már ki lett fizetve. A javításhoz használd a give parancsot negatív értékkel.',
      sessionReset: 'Az alkalom XP-je és a bónuszok törölve. Semmi sem lett kifizetve.',
      absent: 'Ebben az alkalomban távolinak jelölve: {names}.',
      present: 'Jelenlévőnek jelölve: {names}.',
      party: {
        add: 'Hozzáadva a csapathoz: {names}.',
        remove: 'Eltávolítva a csapatból: {names}.',
      },
    },
    warnings: {
      sandbox:
        'Egyes karakterek Beacon lapot használnak (például D&D 2024), amelyet a Mod sandbox csak v1.5-ben tud olvasni és írni. Válaszd a sandbox v1.5-öt a játék Mod beállításaiban.',
      partyLegacy:
        'A Roll20 csapat Jumpgate-funkció; ebben a játékban a mod saját csapatlistát vezet.',
      nobodyToPay: 'Senki sincs a csapatban, ezért {xp} XP később kerül felhasználásra.',
      write: {
        zero: '{name}: a lapot Modból nem lehet 0 XP-re állítani. Módosítsd a lapon.',
        sandbox: '{name}: ennek a lapnak az XP frissítéséhez Mod sandbox v1.5 szükséges.',
        xpless: '{name}: ez a játékrendszer nem használ XP-t (vagy a lap maga számolja ki).',
        noField:
          '{name}: ehhez a laphoz nem ismert XP-mező. Állítsd a Játékrendszert custom-ra, és add meg a mező nevét.',
        error: '{name}: a lapot nem sikerült {xp} XP-vel frissíteni. Nézd meg a Mod konzolt.',
      },
    },
    errors: {
      gmOnly: 'A LazyExperience parancsait csak a játékmester használhatja.',
      failed: 'Valami hiba történt: {message}',
      unknownCommand: 'Ismeretlen parancs: "{name}".',
      helpHint: 'A parancsokért írd be: {command} help.',
      unknownSetting: 'Ismeretlen beállítás: "{name}".',
      settingsHint: 'A beállítások megtekintéséhez nyisd meg a beállításkártyát.',
      badValue: '"{value}" nem érvényes érték ehhez: {name}.',
      badXp: 'Az XP-t egész számként add meg, például 250.',
      badShare: 'A részt 0 és 10 közötti számként add meg, például 0.5 vagy 50%.',
      noCharacters: 'Jelölj ki karaktereket ábrázoló tokeneket, vagy használd a --ids kapcsolót.',
      noTokens: 'Először jelöld ki a legyőzött tokeneket, vagy használd a --ids kapcsolót.',
    },
    status: {
      version: 'Verzió',
      sandbox: 'Mod sandbox',
      beacon: 'Beacon lapok olvashatók',
      commands: 'Parancsok',
      profiles: 'Használt játékrendszerek',
      characters: '{count} karakter',
      handouts: 'Lásd a {help} és a {deck} handoutot.',
    },
    log: {
      title: 'Alkalomnapló',
      sessionHeading: '{number}. alkalom — {date}',
      colCharacter: 'Karakter',
      colXp: 'XP',
      awards: 'Jutalmak',
      levelUps: 'Szintek:',
      empty: 'Még nem ért véget alkalom.',
    },
    help: {
      menu: 'A főmenü megjelenítése.',
      add: 'XP hozzáadása az alkalom készletéhez, igény szerint indoklással.',
      bonus: 'Bónusz XP a kijelölt karaktereknek a részesedésükön felül.',
      give: 'XP azonnali kifizetése a kijelölt karaktereknek.',
      kill: 'A kijelölt tokenek legyőzöttnek számítanak, és az XP-jük hozzáadódik.',
      killConfirm:
        'Egy legyőzött lény XP-jének hozzáadása (a kérdés gombja), igény szerint más mennyiséggel.',
      absent: 'A kijelölt karakterek távolinak jelölése ebben az alkalomban.',
      present: 'A kijelölt karakterek újra jelenlévőnek jelölése.',
      share: 'A kijelölt karakterek részének beállítása (1 = teljes).',
      exclude: 'Karakterek kihagyása a csapatból, vagy újbóli felvétele.',
      undo: 'Az utolsó, még ki nem fizetett jutalom visszavonása.',
      end: 'Az alkalom lezárása: az XP kifizetése, bejelentése és naplózása.',
      resetSession: 'Az alkalom XP-jének törlése kifizetés nélkül.',
      show: 'A csapat minden tagjának XP-je és szintje a lapról.',
      roster: 'A csapatkártya megjelenítése.',
      party:
        'A Roll20 Party Member jelölőnégyzetének be- vagy kikapcsolása a kijelölt karaktereknél.',
      settings: 'A beállításkártya megjelenítése.',
      set: 'Beállítás módosítása.',
      lang: 'Nyelv kiválasztása.',
      status: 'A sandbox, a parancsok és a használt játékrendszerek megjelenítése.',
      log: 'Hivatkozás az Alkalomnapló handoutra.',
      journal: 'A handoutok újraépítése.',
      help: 'Ennek a súgónak a megjelenítése.',
      handouts: 'Bővebben a {help} és a {deck} handoutban.',
    },
    deck: {
      session: 'Játékalkalom',
      sessionDesc: 'XP hozzáadása az alkalomhoz, a csapat ellenőrzése és az alkalom lezárása.',
      selected: 'Kijelölt tokenek',
      selectedDesc: 'Először jelölj ki tokeneket a térképen.',
      party: 'Csapat',
      partyDesc: 'Kik osztoznak az XP-n.',
      tools: 'Eszközök',
      toolsDesc: 'Beállítások, állapot és súgó.',
      footer:
        'A gombok LazyExperience parancsokat futtatnak. A részletekért lásd a {help} handoutot.',
    },
    handout: {
      versionLabel: 'Verzió',
      subtitle: 'Alkalmankénti tapasztalat, igazságosan elosztva, bármilyen karakterlapon',
      footer: 'Az összes parancs gombjai a {deck} handoutban vannak.',
      overview: {
        heading: 'Áttekintés',
        body: 'A LazyExperience összegyűjti az alkalom során szerzett tapasztalati pontokat, elosztja őket a csapat tagjai között, és ráírja a karakterlapokra. Olvassa és írja a D&D 2024 lapot, valamint a régebbi és más lapokat, használja a Roll20 saját csapatát, észreveszi a legyőzött lényeket, kezeli a távollévő játékosokat és a bónusz XP-t, bejelenti a szintlépéseket, és naplót vezet minden alkalomról.',
      },
      quickStart: {
        heading: 'Gyors kezdés',
        steps: [
          'Jelöld be a Party Member-t minden játékoskarakternél (a karakterablak beállításaiban), vagy hagyd: ilyenkor a játékosok által irányított karaktereket használja.',
          'A menü megnyitásához írd be: !lazyxp.',
          'Ha a csapat legyőz egy lényt, a HP-sávjának 0-ra csökkenése rákérdez, hogy hozzáadod-e az XP-jét. Tokeneket is kijelölhetsz, és megnyomhatod a Legyőzve: kijelöltek gombot.',
          'Bármi másért az XP hozzáadása gombbal adhatsz XP-t, egy karakternek pedig a Bónusz: kijelöltek gombbal bónusz XP-t.',
          'Jelöld Távol-nak azokat a játékosokat, akik kihagyták az alkalmat.',
          'Nyomd meg az Alkalom lezárása gombot. Mindenki része rákerül a lapjára, bejelentésre kerül, és bekerül az Alkalomnapló handoutba.',
        ],
      },
      commands: {
        heading: 'Parancsok',
        intro:
          'Minden parancs ezzel kezdődik: !lazyxp; a {long} is működik, és a {short} is, amíg más XP Mod nem használja. Csak a játékmester használhatja őket.',
        targets:
          'A karakterekre vonatkozó parancsok a kijelölt tokeneket használják, vagy a --ids kapcsolót, amelyet vesszővel elválasztott karakter- vagy tokenazonosítók követnek.',
        colCommand: 'Parancs',
        colDesc: 'Mit csinál',
      },
      party: {
        heading: 'A csapat',
        points: [
          'Automatikus: ha bármelyik karaktert Party Member-nek jelölték a Roll20-ban (Jumpgate), az XP-n a Roll20 csapat osztozik; különben minden, játékos által irányított karakter.',
          'Azok a karakterek, amelyeket csak az "All players" irányít, például segédtokenek, nem számítanak.',
          'A csapathoz adás és a csapatból eltávolítás be- vagy kikapcsolja a Party Member jelölést a kijelölt karaktereknél.',
          'A Kihagyás végleg kiveszi a karaktert a csapatból; a Felvétel visszateszi.',
          'A több játékos által irányított karakter egyszer számít.',
        ],
      },
      splitting: {
        heading: 'Az XP elosztása',
        points: [
          'Az alkalom XP-jét a részek számával osztja el: csapattagonként egy, plusz az esetleges extra részek.',
          'A távollévő karakterek a Távollévők része beállítás szerinti hányadot kapják (alapértelmezés szerint 0%). A távollét egy alkalomig tart.',
          'Egy karakternek lehet más része is, például 0,5 egy segédnek.',
          'A bónusz XP a kiválasztott karaktereknek jár a részesedésükön felül.',
          'Az egyenlően nem osztható XP átkerül a következő alkalomra.',
          'Ha az XP kifizetése instant, minden jutalom azonnal szétosztásra és kifizetésre kerül.',
        ],
      },
      kills: {
        heading: 'Legyőzött lények',
        points: [
          'Egy lény legyőzöttnek számít, ha a HP-sávja 0-ra csökken, ha felkerül a legyőzött jelölő, vagy ha a DeathTracker halottnak jelöli.',
          'A TokenMod, a karakterlap vagy más Modok által a kapcsolt attribútumon keresztül végzett változásokat is észreveszi.',
          'Csak a csapaton kívüli, játékos által nem irányított karakterek tokenjei számítanak, és minden token alkalmanként csak egyszer.',
          'Az XP a lapról származik: a lény XP-értéke vagy a kihívási értéke.',
          'A Rákérdez a játékmesternél (alapértelmezés) suttogva küld egy kérdést Hozzáadás, Más mennyiség és Mellőzés gombokkal. Az Automatikus hozzáadás kihagyja a kérdést.',
        ],
      },
      levels: {
        heading: 'Szintlépések',
        points: [
          'Az XP beírása után a LazyExperience ellenőrzi a rendszer szinttáblázatát, és bejelenti, ha egy karakternek elég XP-je van egy új szinthez.',
          'A D&D 2024 lapon a játékos ekkor megnyomja a lap Level Up gombját.',
        ],
      },
      systems: {
        heading: 'Játékrendszerek',
        intro:
          'A LazyExperience minden karakter lapja alapján választ profilt. Állítsd be a Játékrendszert egy kikényszerítéséhez, vagy custom-ra, ha a mezőket magad nevezed meg.',
        colSystem: 'Rendszer',
        colId: 'ID',
        colSheets: 'Lapok',
        colChecked: 'Ellenőrizve',
        verified: {
          live: 'Roll20-ban tesztelve',
          partial: 'Roll20-ban részben tesztelve',
          source: 'A lap forrásából',
          none: '—',
        },
        points: [
          'A lapot a neve alapján válaszd ki a játék Beállításaiban. A listán nem szereplő lapok a gyakori experience, xp és level mezőneveket használják, vagy állítsd a Játékrendszert custom-ra.',
          'A „Roll20-ban tesztelve” azt jelenti, hogy XP-t írtak arra a lapra egy Jumpgate-játékban, lefutottak a lap saját számításai, és ellenőrizték a legyőzött lényeket és a szintlépési értesítéseket.',
          'A Beacon lapokhoz, például a D&D 2024-hez, Mod sandbox v1.5 kell, és Modból nem lehet őket 0 XP-re állítani.',
          'A Pathfinder 1E és a Starfinder a lap „XP a következő szintig” mezőjét használja a szintlépési értesítésekhez. Ha az üres, a Pathfinder a közepes haladási ütemet, a Starfinder a saját táblázatát használja.',
          'WFRP 4E: minden jutalom egy sorként kerül a lap Experience listájára, de a lap tesztelés közben nem számolta újra az XP-összegeit, ezért ellenőrizd őket a lapon.',
          'A Savage Worlds, a 13th Age, a Cosmere és a Call of Cthulhu esetében nincs XP, amit egy Mod írhatna.',
        ],
      },
      settings: {
        heading: 'Beállítások',
        intro:
          'A beállításokat a beállításkártyán vagy a !lazyxp set <setting> <value> paranccsal módosíthatod.',
        colKey: 'Beállítás',
        colName: 'Név',
        colDesc: 'Mit csinál',
      },
      upgrading: {
        heading: 'Frissítés a 0.1-ről',
        points: [
          'A 0.1 beállításai, alkalom-XP-je és karakterenkénti extra XP-je az 1.0 első indításakor átkerülnek.',
          'A nem aktív játékosok vagy karakterek kimaradnak a csapatból.',
          'A 0.1 egyéni parancsneve továbbra is működik.',
          'A régi parancsok továbbra is működnek:',
        ],
        colV1: '0.1',
        colV2: '1.0',
      },
      troubleshooting: {
        heading: 'Hibaelhárítás',
        points: [
          'A D&D 2024 lapokra nem íródik semmi: ellenőrizd, hogy a játék Mod sandbox v1.5-öt használ-e (!lazyxp status).',
          'Egy lény 0 XP-t ad: a lapján nincs XP vagy kihívási érték. Használd a Más mennyiség gombot, vagy a !lazyxp kill --xp 100 parancsot.',
          'A legyőzéseket nem veszi észre: ellenőrizd, hogy a HP-sáv az életerőpontokat tartalmazó sáv-e.',
          'A !xp nem csinál semmit: egy másik XP Mod használja. Használd a !lazyxp parancsot.',
        ],
      },
      languages: {
        heading: 'Nyelvek',
        body: 'A nyelvet a !lazyxp lang paranccsal választhatod. A csevegőkártyák és a handoutok azonnal változnak.',
        colLanguage: 'Nyelv',
        colNative: 'Név',
        colCode: 'Kód',
      },
      credits: {
        heading: 'Közreműködők',
        original: 'Készítette',
        maintainer: 'Átírta és karbantartja',
        support: 'Hibajelentéseket és ötleteket szívesen fogadunk a Roll20 fórumán.',
      },
    },
  };

  var localeIt = {
    titles: {
      ready: 'LazyExperience è pronto.',
      help: 'Guida di LazyExperience',
      settings: 'Impostazioni di LazyExperience',
      status: 'Stato di LazyExperience',
      roster: 'Gruppo',
      language: 'Lingua',
      levelUp: 'Salto di livello!',
      defeated: 'Creatura sconfitta',
      xpAwarded: 'Esperienza assegnata',
      sessionEnded: 'Sessione {number} terminata',
      yourXp: 'La tua esperienza',
      pool: 'PE della sessione',
      bonus: 'PE bonus',
      undo: 'Annulla',
      log: 'Registro della sessione',
      partyXp: 'Esperienza del gruppo',
    },
    menu: {
      session: 'Sessione',
      pool: 'PE della sessione',
      payout: 'Pagati',
      shares: 'Quote',
      perShare: 'PE per quota',
      party: 'Gruppo ({source})',
      noParty: 'Nessuno è ancora nel gruppo. Apri la scheda Gruppo per aggiungere personaggi.',
      absentTag: '(assente)',
      bonusTag: '(+{xp} bonus)',
      levelTag: 'Livello {level}',
      shareTag: 'Quota {share}',
      rosterSource: 'Gruppo da',
      excluded: 'Esclusi',
      blank: '(vuoto)',
      groupXp: 'Esperienza',
      groupParty: 'Gruppo',
      groupKills: 'Creature sconfitte',
      groupSheet: 'Scheda del personaggio',
    },
    buttons: {
      menu: 'Menu',
      help: 'Guida',
      settings: 'Impostazioni',
      status: 'Stato',
      roster: 'Gruppo',
      addXp: 'Aggiungi PE',
      killSelected: 'Sconfitti: selezione',
      bonusSelected: 'Bonus: selezione',
      giveSelected: 'Dai ora: selezione',
      endSession: 'Termina sessione',
      undo: 'Annulla',
      show: 'PE del gruppo',
      log: 'Registro della sessione',
      absent: 'Assente',
      present: 'Presente',
      share: 'Quota',
      exclude: 'Escludi',
      include: 'Includi',
      partyAdd: 'Aggiungi selezione al gruppo',
      partyRemove: 'Rimuovi selezione',
      addKill: 'Aggiungi {xp} PE',
      otherXp: 'Altro importo',
      ignore: 'Ignora',
    },
    prompts: {
      xp: 'PE',
      reason: 'Motivo (facoltativo)',
      share: 'Quota (1 = intera, 0,5 = metà)',
      confirmEnd: 'Terminare la sessione e distribuire i PE?',
    },
    options: {
      yesNo: { yes: 'Sì', no: 'No' },
      payout: { end: 'Alla fine della sessione', instant: 'Subito' },
      roster: {
        auto: 'Automatico',
        party: 'Gruppo di Roll20',
        players: 'Personaggi dei giocatori',
        manual: 'Scelto dal GM',
      },
      killMode: { prompt: 'Chiedi al GM', auto: 'Aggiungi automaticamente', off: 'Disattivato' },
      announce: {
        public: 'Tutti',
        whisper: 'I giocatori interessati',
        gm: 'Solo GM',
        off: 'Disattivato',
      },
      levelNotice: {
        public: 'Tutti',
        whisper: 'Il giocatore e il GM',
        gm: 'Solo GM',
        off: 'Disattivato',
      },
      system: { auto: 'Rileva dalla scheda' },
    },
    settings: {
      language: { label: 'Lingua', desc: 'Lingua per le schede della chat e i handout.' },
      payout: {
        label: 'Pagamento dei PE',
        desc: 'end: i PE si accumulano nella riserva della sessione e vengono distribuiti al termine della sessione. instant: ogni assegnazione viene divisa e pagata subito.',
      },
      updateSheets: {
        label: 'Aggiorna le schede',
        desc: 'Scrive i PE sulle schede dei personaggi. Se disattivato, i totali vengono solo annunciati.',
      },
      system: {
        label: 'Sistema di gioco',
        desc: 'Quali campi della scheda contengono PE e livello. auto sceglie il profilo dalla scheda di ciascun personaggio; custom usa le impostazioni dei campi personalizzati.',
      },
      roster: {
        label: 'Gruppo da',
        desc: 'auto: il gruppo di Roll20 se c’è qualcuno, altrimenti i personaggi controllati dai giocatori. party, players o manual ne fissano uno.',
      },
      absentShare: {
        label: 'Quota degli assenti',
        desc: 'Parte di una quota che un personaggio assente riceve comunque, da 0% (niente) a 100% (intera).',
      },
      extraShares: {
        label: 'Quote extra',
        desc: 'Quote per compagni o mercenari che non hanno una scheda. I loro PE non vengono pagati a nessuno.',
      },
      killMode: {
        label: 'Creature sconfitte',
        desc: 'prompt: chiedi al GM prima di aggiungere i PE di una creatura. auto: aggiungili subito. off: non controllare i token.',
      },
      killBar: {
        label: 'Controlla barra PF',
        desc: 'Considera sconfitta una creatura quando la sua barra dei PF scende a 0 o meno.',
      },
      hpBar: {
        label: 'Barra PF',
        desc: 'Quale barra del token (1, 2 o 3) contiene i punti ferita.',
      },
      killMarker: {
        label: 'Controlla indicatore',
        desc: 'Considera sconfitta una creatura quando l’indicatore di sconfitta viene messo sul suo token.',
      },
      marker: {
        label: 'Indicatore di sconfitta',
        desc: 'L’indicatore che significa sconfitto: un nome integrato come dead, oppure il nome di un indicatore personalizzato.',
      },
      killDeathTracker: {
        label: 'Usa DeathTracker',
        desc: 'Considera sconfitta una creatura quando DeathTracker 1.0 o successivo la segna come morta.',
      },
      announce: {
        label: 'Messaggi dei PE',
        desc: 'Chi vede le assegnazioni di PE e il riepilogo di fine sessione: public, whisper (giocatori interessati e GM), gm oppure off.',
      },
      levelNotice: {
        label: 'Avvisi di salto di livello',
        desc: 'Chi vede gli avvisi di salto di livello: public, whisper (il giocatore e il GM), gm oppure off.',
      },
      customXp: {
        label: 'Campo PE personalizzato',
        desc: 'Campo della scheda per i PE di un personaggio quando il sistema di gioco è custom. Con un elenco, ogni nome viene provato a turno.',
      },
      customLevel: {
        label: 'Campo livello personalizzato',
        desc: 'Campo della scheda per il livello di un personaggio.',
      },
      customNpcXp: {
        label: 'Campo PE creatura personalizzato',
        desc: 'Campo della scheda per i PE che vale una creatura.',
      },
      customNpcCr: {
        label: 'Campo sfida personalizzato',
        desc: 'Campo della scheda per il grado di sfida di una creatura, usato quando non ha un valore di PE.',
      },
      customLevels: {
        label: 'Tabella livelli personalizzata',
        desc: 'PE necessari per ogni livello, a partire dal livello 1, ad esempio 0,300,900,2700. Se vuoto, gli avvisi di salto di livello sono disattivati per le schede personalizzate.',
      },
    },
    roster: {
      explain: {
        party: 'I personaggi con Party Member spuntato in Roll20 si dividono i PE.',
        players:
          'I personaggi controllati da un giocatore si dividono i PE. Spunta Party Member sui personaggi per usare invece il gruppo di Roll20.',
        manual: 'Solo i personaggi che includi si dividono i PE.',
      },
      selectHint: 'Seleziona prima dei token per aggiungerli al gruppo o rimuoverli.',
    },
    kills: {
      prompt: '{name} è stato sconfitto. Aggiungere {xp} PE alla sessione?',
      noXp: '{name} è stato sconfitto, ma la sua scheda non ha un valore di PE.',
      reason: '{name} sconfitto',
      result: {
        prompted: 'richiesto',
        added: 'aggiunto',
        counted: 'già conteggiato in questa sessione',
        noXp: 'nessun PE sulla scheda: usa --xp',
        notCreature: 'non è una creatura (nessuna scheda, o nel gruppo)',
      },
    },
    levels: {
      reached: '{name} ha PE sufficienti per il livello {level}!',
      sheetButton: 'Usa il pulsante Level Up sulla scheda del personaggio.',
      updateSheet: 'Aggiorna il livello sulla scheda del personaggio.',
      pf2: 'Aumenta il livello sulla scheda e sottrai 1.000 dai PE.',
      spend: 'Spendi i PE e aumenta il livello sulla scheda.',
    },
    instant: {
      everyone: 'Tutto il gruppo guadagna {xp} PE.',
      bonus: '{names} guadagnano {xp} PE.',
    },
    end: {
      nothing: 'In questa sessione non sono stati assegnati PE.',
      playerLine: '{name} guadagna {xp} PE in questa sessione.',
      playerLineTotal: '{name} guadagna {xp} PE in questa sessione, per un totale di {total} PE.',
      levelLine: '{name} ha raggiunto il livello {level}.',
      remainder:
        '{xp} PE non si sono potuti dividere in parti uguali e passano alla sessione successiva.',
    },
    show: {
      noXp: 'nessun PE sulla scheda',
      next: 'prossimo livello a {xp}',
    },
    awardKinds: { pool: 'PE della sessione', bonus: 'PE bonus', give: 'PE dati' },
    messages: {
      saved: 'Salvato.',
      commands: 'Comandi: {commands}',
      aliasTaken: '{alias} è riservato a {mods}. Usa !lazyxp.',
      migrated:
        'Le tue impostazioni, i PE di sessione e i PE extra di LazyExperience 0.1 sono stati importati.',
      handouts: 'I handout Help, Command Deck e Session Log sono stati ricostruiti.',
      noLog: 'Nessuna sessione è ancora terminata, quindi non c’è un Session Log.',
      poolAdded: '{xp} PE aggiunti alla sessione.',
      bonusAdded: '{xp} PE bonus per {names}.',
      killAdded: '{xp} PE per {name} aggiunti alla sessione.',
      killGone: 'Quella sconfitta è già stata aggiunta o non è più in attesa.',
      undone: 'Ritirati {xp} PE ({reason}).',
      nothingToUndo: 'Non c’è nulla da annullare in questa sessione.',
      nothingToUndoInstant:
        'I PE sono già stati pagati. Usa give con un importo negativo per correggere.',
      sessionReset: 'I PE di sessione e i bonus sono stati azzerati. Non è stato pagato nulla.',
      absent: 'Segnati come assenti in questa sessione: {names}.',
      present: 'Segnati come presenti: {names}.',
      party: {
        add: 'Aggiunti al gruppo: {names}.',
        remove: 'Rimossi dal gruppo: {names}.',
      },
    },
    warnings: {
      sandbox:
        'Alcuni personaggi usano una scheda Beacon (come D&D 2024), che il Mod sandbox può leggere e scrivere solo dalla v1.5. Scegli Mod sandbox v1.5 nelle impostazioni Mod della partita.',
      partyLegacy:
        'Il gruppo di Roll20 è una funzione di Jumpgate; in questa partita il Mod mantiene un proprio elenco del gruppo.',
      nobodyToPay: 'Nessuno è nel gruppo, quindi {xp} PE vengono conservati per dopo.',
      write: {
        zero: '{name}: un Mod non può impostare la scheda a 0 PE. Modificalo sulla scheda.',
        sandbox: '{name}: questa scheda richiede Mod sandbox v1.5 per aggiornare i PE.',
        xpless: '{name}: questo sistema di gioco non usa i PE (o la scheda li calcola da sola).',
        noField:
          '{name}: per questa scheda non è noto alcun campo PE. Imposta il sistema di gioco su custom e indica il campo.',
        error:
          '{name}: non è stato possibile aggiornare la scheda con {xp} PE. Vedi la console del Mod.',
      },
    },
    errors: {
      gmOnly: 'Solo il GM può usare i comandi di LazyExperience.',
      failed: 'Qualcosa è andato storto: {message}',
      unknownCommand: 'Comando sconosciuto «{name}».',
      helpHint: 'Digita {command} help per vedere i comandi.',
      unknownSetting: 'Impostazione sconosciuta «{name}».',
      settingsHint: 'Apri la scheda delle impostazioni per vederle.',
      badValue: '«{value}» non è un valore valido per {name}.',
      badXp: 'Indica i PE come numero intero, ad esempio 250.',
      badShare: 'Indica la quota come numero da 0 a 10, ad esempio 0.5 o 50%.',
      noCharacters: 'Seleziona token che rappresentano personaggi, oppure usa --ids.',
      noTokens: 'Seleziona prima i token sconfitti, oppure usa --ids.',
    },
    status: {
      version: 'Versione',
      sandbox: 'Mod sandbox',
      beacon: 'Schede Beacon leggibili',
      commands: 'Comandi',
      profiles: 'Sistemi di gioco in uso',
      characters: '{count} personaggi',
      handouts: 'Vedi i handout {help} e {deck}.',
    },
    log: {
      title: 'Registro della sessione',
      sessionHeading: 'Sessione {number} — {date}',
      colCharacter: 'Personaggio',
      colXp: 'PE',
      awards: 'Assegnazioni',
      levelUps: 'Livelli:',
      empty: 'Nessuna sessione è ancora terminata.',
    },
    help: {
      menu: 'Mostra il menu principale.',
      add: 'Aggiunge PE alla riserva della sessione, con un motivo facoltativo.',
      bonus: 'Dà PE bonus ai personaggi selezionati oltre alla loro quota.',
      give: 'Paga subito PE ai personaggi selezionati.',
      kill: 'Conta i token selezionati come sconfitti e aggiunge i loro PE.',
      killConfirm:
        'Aggiunge i PE di una creatura sconfitta (il pulsante della richiesta), facoltativamente con un altro importo.',
      absent: 'Segna i personaggi selezionati come assenti in questa sessione.',
      present: 'Segna di nuovo come presenti i personaggi selezionati.',
      share: 'Imposta la quota dei personaggi selezionati (1 = intera).',
      exclude: 'Esclude personaggi dal gruppo, o li include di nuovo.',
      undo: 'Annulla l’ultima assegnazione non ancora pagata.',
      end: 'Termina la sessione: paga i PE, li annuncia e li registra.',
      resetSession: 'Azzera i PE della sessione senza pagarli.',
      show: 'Mostra i PE e il livello di ogni membro del gruppo dalla scheda.',
      roster: 'Mostra la scheda del gruppo.',
      party: 'Spunta o deseleziona la casella Party Member di Roll20 per i personaggi selezionati.',
      settings: 'Mostra la scheda delle impostazioni.',
      set: 'Cambia un’impostazione.',
      lang: 'Sceglie la lingua.',
      status: 'Mostra il sandbox, i comandi e i sistemi di gioco in uso.',
      log: 'Collegamento al handout Session Log.',
      journal: 'Ricostruisce i handout.',
      help: 'Mostra questa guida.',
      handouts: 'Maggiori informazioni nei handout {help} e {deck}.',
    },
    deck: {
      session: 'Sessione',
      sessionDesc: 'Aggiungi PE alla sessione, controlla il gruppo e termina la sessione.',
      selected: 'Token selezionati',
      selectedDesc: 'Seleziona prima dei token sulla mappa.',
      party: 'Gruppo',
      partyDesc: 'Chi si divide i PE.',
      tools: 'Strumenti',
      toolsDesc: 'Impostazioni, stato e guida.',
      footer:
        'I pulsanti eseguono comandi di LazyExperience. Vedi il handout {help} per i dettagli.',
    },
    handout: {
      versionLabel: 'Versione',
      subtitle: 'L’esperienza di sessione, divisa equamente, su qualsiasi scheda',
      footer: 'I pulsanti per ogni comando si trovano nel handout {deck}.',
      overview: {
        heading: 'Panoramica',
        body: 'LazyExperience raccoglie i punti esperienza guadagnati durante una sessione, li divide tra il gruppo e li scrive sulle schede dei personaggi. Legge e scrive la scheda di D&D 2024 oltre a schede più vecchie e di altri sistemi, usa il gruppo di Roll20, si accorge delle creature sconfitte, gestisce i giocatori assenti e i PE bonus, annuncia i salti di livello e tiene un registro di ogni sessione.',
      },
      quickStart: {
        heading: 'Avvio rapido',
        steps: [
          'Spunta Party Member su ogni personaggio giocante (nelle impostazioni della finestra del personaggio), oppure lascia stare: vengono usati i personaggi controllati dai giocatori.',
          'Digita !lazyxp per aprire il menu.',
          'Quando il gruppo sconfigge una creatura, la sua barra dei PF che arriva a 0 ti chiede se aggiungere i suoi PE. Puoi anche selezionare dei token e premere Sconfitti: selezione.',
          'Aggiungi PE per qualsiasi altra cosa con Aggiungi PE, e PE bonus per un personaggio con Bonus: selezione.',
          'Segna come Assente i giocatori che hanno saltato la sessione.',
          'Premi Termina sessione. La quota di ciascuno viene scritta sulla sua scheda, annunciata e aggiunta al handout Session Log.',
        ],
      },
      commands: {
        heading: 'Comandi',
        intro:
          'Ogni comando inizia con !lazyxp; funziona anche {long}, e così {short} finché nessun altro Mod di PE lo usa. Solo il GM può usarli.',
        targets:
          'I comandi per i personaggi usano i token selezionati, oppure --ids seguito da ID di personaggi o token separati da virgole.',
        colCommand: 'Comando',
        colDesc: 'Cosa fa',
      },
      party: {
        heading: 'Il gruppo',
        points: [
          'Automatico: quando un personaggio è spuntato come Party Member in Roll20 (Jumpgate), il gruppo di Roll20 si divide i PE; altrimenti lo fa ogni personaggio controllato da un giocatore.',
          'I personaggi controllati solo da «Tutti i giocatori», come i token di supporto, non vengono contati.',
          'Aggiungi al gruppo e Rimuovi dal gruppo spuntano o deselezionano Party Member per i personaggi selezionati.',
          'Escludi toglie un personaggio dal gruppo in modo permanente; Includi lo rimette.',
          'Un personaggio controllato da più giocatori conta una volta sola.',
        ],
      },
      splitting: {
        heading: 'Divisione dei PE',
        points: [
          'I PE della sessione vengono divisi per il numero di quote: una per membro del gruppo, più le eventuali quote extra.',
          'I personaggi assenti ricevono l’impostazione Quota degli assenti (0% per impostazione predefinita). L’assenza dura una sessione.',
          'Un personaggio può avere una quota diversa, ad esempio 0.5 per un aiutante.',
          'I PE bonus vanno ai personaggi scelti oltre alla loro quota.',
          'I PE che non si dividono in parti uguali passano alla sessione successiva.',
          'Con Pagamento dei PE impostato su instant, ogni assegnazione viene divisa e pagata subito.',
        ],
      },
      kills: {
        heading: 'Creature sconfitte',
        points: [
          'Una creatura conta come sconfitta quando la sua barra dei PF scende a 0, quando viene messo l’indicatore di sconfitta, o quando DeathTracker la segna come morta.',
          'Vengono rilevate anche le modifiche fatte da TokenMod, dalla scheda o da altri Mod tramite l’attributo collegato.',
          'Vengono contati solo i token dei personaggi fuori dal gruppo che nessun giocatore controlla, e ogni token una sola volta per sessione.',
          'I PE provengono dalla scheda: il valore di PE della creatura, o il suo grado di sfida.',
          'Chiedi al GM (l’impostazione predefinita) sussurra una richiesta con Aggiungi, Altro importo e Ignora. Aggiungi automaticamente salta la richiesta.',
        ],
      },
      levels: {
        heading: 'Avanzamenti di livello',
        points: [
          'Dopo aver scritto i PE, LazyExperience controlla la tabella dei livelli del sistema e annuncia quando un personaggio ha PE sufficienti per un nuovo livello.',
          'Sulla scheda di D&D 2024 il giocatore preme poi il pulsante Level Up della scheda.',
        ],
      },
      systems: {
        heading: 'Sistemi di gioco',
        intro:
          'LazyExperience sceglie un profilo dalla scheda di ciascun personaggio. Imposta il sistema di gioco per forzarne uno, oppure su custom per indicare tu stesso i campi.',
        colSystem: 'Sistema',
        colId: 'ID',
        colSheets: 'Schede',
        colChecked: 'Verificato',
        verified: {
          live: 'Testato in Roll20',
          partial: 'Testato in parte in Roll20',
          source: 'Dal codice della scheda',
          none: '—',
        },
        points: [
          'Scegli la scheda dal suo nome nelle Impostazioni della partita. Le schede non elencate usano i nomi di campo comuni experience, xp e level, oppure imposta il sistema di gioco su custom.',
          'Testato in Roll20 significa che i PE sono stati scritti su quella scheda in una partita Jumpgate, i calcoli propri della scheda sono stati eseguiti e sono state verificate le creature sconfitte e gli avvisi di salto di livello.',
          'Le schede Beacon come D&D 2024 richiedono Mod sandbox v1.5 e un Mod non può impostarle a 0 PE.',
          'Pathfinder 1E e Starfinder usano la casella dei PE per il livello successivo della scheda per gli avvisi di salto di livello. Se è vuota, Pathfinder usa la progressione media e Starfinder una tabella propria.',
          "WFRP 4E: ogni assegnazione viene aggiunta come riga nell'elenco Experience della scheda, ma nei test la scheda non ha ricalcolato i totali di PE, quindi controllali sulla scheda.",
          'Savage Worlds, 13th Age, Cosmere e Call of Cthulhu non hanno PE che un Mod possa scrivere.',
        ],
      },
      settings: {
        heading: 'Impostazioni',
        intro:
          'Cambia le impostazioni nella scheda delle impostazioni, oppure con !lazyxp set <impostazione> <valore>.',
        colKey: 'Impostazione',
        colName: 'Nome',
        colDesc: 'Cosa fa',
      },
      upgrading: {
        heading: 'Aggiornamento dalla 0.1',
        points: [
          'Le impostazioni, i PE di sessione e i PE extra per personaggio della 0.1 vengono importati al primo avvio della 1.0.',
          'I giocatori o i personaggi che non erano attivi restano fuori dal gruppo.',
          'Un nome di comando personalizzato della 0.1 continua a funzionare.',
          'I vecchi comandi funzionano ancora:',
        ],
        colV1: '0.1',
        colV2: '1.0',
      },
      troubleshooting: {
        heading: 'Risoluzione dei problemi',
        points: [
          'Non viene scritto nulla sulle schede di D&D 2024: controlla che la partita usi Mod sandbox v1.5 (!lazyxp status).',
          'Una creatura dà 0 PE: la sua scheda non ha PE né grado di sfida. Usa Altro importo, oppure !lazyxp kill --xp 100.',
          'Le sconfitte non vengono rilevate: controlla che la barra PF sia quella che contiene i punti ferita.',
          '!xp non fa nulla: un altro Mod di PE lo usa. Usa !lazyxp.',
        ],
      },
      languages: {
        heading: 'Lingue',
        body: 'Scegli una lingua con !lazyxp lang. Le schede della chat e i handout cambiano subito.',
        colLanguage: 'Lingua',
        colNative: 'Nome',
        colCode: 'Codice',
      },
      credits: {
        heading: 'Crediti',
        original: 'Creato da',
        maintainer: 'Riscritto e mantenuto da',
        support: 'Segnalazioni di bug e idee sono benvenute sul forum di Roll20.',
      },
    },
  };

  var localeJa = {
    titles: {
      ready: 'LazyExperience の準備ができました。',
      help: 'LazyExperience ヘルプ',
      settings: 'LazyExperience 設定',
      status: 'LazyExperience ステータス',
      roster: 'パーティ',
      language: '言語',
      levelUp: 'レベルアップ!',
      defeated: 'クリーチャー撃破',
      xpAwarded: '経験値を付与しました',
      sessionEnded: 'セッション {number} 終了',
      yourXp: 'あなたの経験値',
      pool: 'セッション XP',
      bonus: 'ボーナス XP',
      undo: '取り消し',
      log: 'セッションログ',
      partyXp: 'パーティの経験値',
    },
    menu: {
      session: 'セッション',
      pool: 'セッション XP',
      payout: '支払い',
      shares: '配分',
      perShare: '1配分あたりの XP',
      party: 'パーティ({source})',
      noParty: 'まだ誰もパーティにいません。パーティカードを開いてキャラクターを追加してください。',
      absentTag: '(欠席)',
      bonusTag: '(+{xp} ボーナス)',
      levelTag: 'レベル {level}',
      shareTag: '配分 {share}',
      rosterSource: 'パーティの取得元',
      excluded: '除外中',
      blank: '(空白)',
      groupXp: '経験値',
      groupParty: 'パーティ',
      groupKills: '撃破したクリーチャー',
      groupSheet: 'キャラクターシート',
    },
    buttons: {
      menu: 'メニュー',
      help: 'ヘルプ',
      settings: '設定',
      status: 'ステータス',
      roster: 'パーティ',
      addXp: 'XP を追加',
      killSelected: '撃破: 選択中',
      bonusSelected: 'ボーナス: 選択中',
      giveSelected: '今すぐ付与: 選択中',
      endSession: 'セッション終了',
      undo: '取り消し',
      show: 'パーティ XP',
      log: 'セッションログ',
      absent: '欠席',
      present: '出席',
      share: '配分',
      exclude: '除外',
      include: '含める',
      partyAdd: '選択中をパーティに追加',
      partyRemove: '選択中を削除',
      addKill: '{xp} XP を追加',
      otherXp: 'その他の数値',
      ignore: '無視',
    },
    prompts: {
      xp: 'XP',
      reason: '理由(任意)',
      share: '配分(1 = 全額、0.5 = 半分)',
      confirmEnd: 'セッションを終了して XP を配布しますか?',
    },
    options: {
      yesNo: { yes: 'はい', no: 'いいえ' },
      payout: { end: 'セッション終了時', instant: 'すぐに' },
      roster: {
        auto: '自動',
        party: 'Roll20 のパーティ',
        players: 'プレイヤーのキャラクター',
        manual: 'GM が選択',
      },
      killMode: { prompt: 'GM に確認', auto: '自動で追加', off: 'オフ' },
      announce: { public: '全員', whisper: '該当するプレイヤー', gm: 'GM のみ', off: 'オフ' },
      levelNotice: {
        public: '全員',
        whisper: 'プレイヤーと GM',
        gm: 'GM のみ',
        off: 'オフ',
      },
      system: { auto: 'シートから検出' },
    },
    settings: {
      language: { label: '言語', desc: 'チャットカードとハンドアウトの言語。' },
      payout: {
        label: 'XP の支払い',
        desc: 'end: XP はセッションプールに貯まり、セッション終了時に配布されます。instant: 付与のたびにすぐ分配して支払います。',
      },
      updateSheets: {
        label: 'シートを更新',
        desc: 'XP をキャラクターシートに書き込みます。オフの場合、合計は通知されるだけです。',
      },
      system: {
        label: 'ゲームシステム',
        desc: 'XP とレベルを保持するシートのフィールド。auto は各キャラクターのシートからプロファイルを選びます。custom はカスタムフィールド設定を使います。',
      },
      roster: {
        label: 'パーティの取得元',
        desc: 'auto: Roll20 のパーティに誰かいればそれを使い、いなければプレイヤーが操作するキャラクターを使います。party、players、manual で固定できます。',
      },
      absentShare: {
        label: '欠席者の配分',
        desc: '欠席したキャラクターがそれでも受け取る配分の割合。0%(なし)から 100%(全額)まで。',
      },
      extraShares: {
        label: '追加配分',
        desc: 'シートのない仲間や雇い人のための配分。その XP は誰にも支払われません。',
      },
      killMode: {
        label: '撃破したクリーチャー',
        desc: 'prompt: クリーチャーの XP を追加する前に GM に確認します。auto: すぐに追加します。off: トークンを監視しません。',
      },
      killBar: {
        label: 'HP バーを監視',
        desc: 'HP バーが 0 以下になったクリーチャーを撃破とみなします。',
      },
      hpBar: { label: 'HP バー', desc: 'ヒットポイントを保持するトークンバー(1、2、3)。' },
      killMarker: {
        label: 'マーカーを監視',
        desc: '撃破マーカーがトークンに付けられたクリーチャーを撃破とみなします。',
      },
      marker: {
        label: '撃破マーカー',
        desc: '撃破を意味するマーカー。dead などの標準名、またはカスタムマーカーの名前。',
      },
      killDeathTracker: {
        label: 'DeathTracker を使用',
        desc: 'DeathTracker 1.0 以降がクリーチャーを死亡としたとき、撃破とみなします。',
      },
      announce: {
        label: 'XP メッセージ',
        desc: 'XP の付与とセッション終了時のまとめを見られる人: public、whisper(該当するプレイヤーと GM)、gm、off。',
      },
      levelNotice: {
        label: 'レベルアップ通知',
        desc: 'レベルアップ通知を見られる人: public、whisper(そのプレイヤーと GM)、gm、off。',
      },
      customXp: {
        label: 'カスタム XP フィールド',
        desc: 'ゲームシステムが custom のときの、キャラクターの XP のシートフィールド。リストの場合は順に試します。',
      },
      customLevel: {
        label: 'カスタムレベルフィールド',
        desc: 'キャラクターのレベルのシートフィールド。',
      },
      customNpcXp: {
        label: 'カスタムクリーチャー XP フィールド',
        desc: 'クリーチャーが持つ XP 値のシートフィールド。',
      },
      customNpcCr: {
        label: 'カスタム脅威度フィールド',
        desc: 'クリーチャーの脅威度のシートフィールド。XP 値がない場合に使用します。',
      },
      customLevels: {
        label: 'カスタムレベル表',
        desc: 'レベル1から始まる各レベルに必要な XP(例: 0,300,900,2700)。空白にすると、カスタムシートのレベルアップ通知はオフになります。',
      },
    },
    roster: {
      explain: {
        party: 'Roll20 で「パーティメンバー」にチェックされたキャラクターが XP を分け合います。',
        players:
          'プレイヤーが操作するキャラクターが XP を分け合います。代わりに Roll20 のパーティを使うには、キャラクターの「パーティメンバー」にチェックを入れてください。',
        manual: '含めたキャラクターだけが XP を分け合います。',
      },
      selectHint: 'パーティへの追加や削除をするには、先にトークンを選択してください。',
    },
    kills: {
      prompt: '{name} を撃破しました。セッションに {xp} XP を追加しますか?',
      noXp: '{name} を撃破しましたが、シートに XP 値がありません。',
      reason: '{name} を撃破',
      result: {
        prompted: '確認済み',
        added: '追加済み',
        counted: 'このセッションで集計済み',
        noXp: 'シートに XP なし: --xp を使用',
        notCreature: 'クリーチャーではありません(シートなし、またはパーティ所属)',
      },
    },
    levels: {
      reached: '{name} はレベル {level} に必要な XP に達しました!',
      sheetButton: 'キャラクターシートのレベルアップボタンを使用してください。',
      updateSheet: 'キャラクターシートのレベルを更新してください。',
      pf2: 'シートのレベルを上げ、XP から 1,000 を引いてください。',
      spend: 'XP を消費して、シートのレベルを上げてください。',
    },
    instant: {
      everyone: 'パーティ全員が {xp} XP を獲得しました。',
      bonus: '{names} が {xp} XP を獲得しました。',
    },
    end: {
      nothing: 'このセッションでは XP が付与されませんでした。',
      playerLine: '{name} はこのセッションで {xp} XP を獲得しました。',
      playerLineTotal: '{name} はこのセッションで {xp} XP を獲得し、合計 {total} XP になりました。',
      levelLine: '{name} はレベル {level} に到達しました。',
      remainder: '{xp} XP は均等に分けられなかったため、次のセッションに繰り越されます。',
    },
    show: {
      noXp: 'シートに XP なし',
      next: '次のレベルまで {xp}',
    },
    awardKinds: { pool: 'セッション XP', bonus: 'ボーナス XP', give: '付与した XP' },
    messages: {
      saved: '保存しました。',
      commands: 'コマンド: {commands}',
      aliasTaken: '{alias} は {mods} が使用しています。!lazyxp を使ってください。',
      migrated: 'LazyExperience 0.1 の設定、セッション XP、追加 XP を引き継ぎました。',
      handouts: 'ヘルプ、コマンドデッキ、セッションログのハンドアウトを再構築しました。',
      noLog: 'まだ終了したセッションがないため、セッションログはありません。',
      poolAdded: 'セッションに {xp} XP を追加しました。',
      bonusAdded: '{names} に {xp} ボーナス XP。',
      killAdded: '{name} の {xp} XP をセッションに追加しました。',
      killGone: 'その撃破はすでに追加されたか、保留中ではなくなりました。',
      undone: '{xp} XP を取り消しました({reason})。',
      nothingToUndo: 'このセッションで取り消せるものはありません。',
      nothingToUndoInstant:
        'XP はすでに支払われています。修正するには、負の数値で give を使ってください。',
      sessionReset: 'セッション XP とボーナスをクリアしました。支払いは行われていません。',
      absent: 'このセッションの欠席に設定: {names}。',
      present: '出席に設定: {names}。',
      party: {
        add: 'パーティに追加: {names}。',
        remove: 'パーティから削除: {names}。',
      },
    },
    warnings: {
      sandbox:
        '一部のキャラクターは Beacon シート(D&D 2024 など)を使用しており、Mod sandbox は v1.5 でのみ読み書きできます。ゲームの Mod 設定で sandbox v1.5 を選択してください。',
      partyLegacy:
        'Roll20 のパーティは Jumpgate の機能です。このゲームでは、Mod が独自のパーティリストを保持します。',
      nobodyToPay: 'パーティに誰もいないため、{xp} XP は後のために保留されます。',
      write: {
        zero: '{name}: Mod からシートを 0 XP にすることはできません。シートで変更してください。',
        sandbox: '{name}: このシートの XP を更新するには Mod sandbox v1.5 が必要です。',
        xpless: '{name}: このゲームシステムは XP を使用しません(またはシートが自動計算します)。',
        noField:
          '{name}: このシートの XP フィールドが不明です。ゲームシステムを custom にして、フィールド名を指定してください。',
        error:
          '{name}: シートを {xp} XP で更新できませんでした。Mod コンソールを確認してください。',
      },
    },
    errors: {
      gmOnly: 'LazyExperience のコマンドは GM のみ使用できます。',
      failed: '問題が発生しました: {message}',
      unknownCommand: '不明なコマンド「{name}」。',
      helpHint: 'コマンドの一覧は {command} help と入力してください。',
      unknownSetting: '不明な設定「{name}」。',
      settingsHint: '設定カードを開いて設定を確認してください。',
      badValue: '「{value}」は {name} の有効な値ではありません。',
      badXp: 'XP は 250 のような整数で指定してください。',
      badShare: '配分は 0 から 10 までの数値で、0.5 や 50% のように指定してください。',
      noCharacters: 'キャラクターを表すトークンを選択するか、--ids を使ってください。',
      noTokens: '先に撃破したトークンを選択するか、--ids を使ってください。',
    },
    status: {
      version: 'バージョン',
      sandbox: 'Mod sandbox',
      beacon: 'Beacon シートの読み取り',
      commands: 'コマンド',
      profiles: '使用中のゲームシステム',
      characters: '{count} キャラクター',
      handouts: '{help} と {deck} のハンドアウトを参照してください。',
    },
    log: {
      title: 'セッションログ',
      sessionHeading: 'セッション {number} — {date}',
      colCharacter: 'キャラクター',
      colXp: 'XP',
      awards: '付与',
      levelUps: 'レベル:',
      empty: 'まだ終了したセッションがありません。',
    },
    help: {
      menu: 'メインメニューを表示します。',
      add: 'セッションプールに XP を追加します。理由は任意です。',
      bonus: '選択したキャラクターに、配分に加えてボーナス XP を与えます。',
      give: '選択したキャラクターにすぐ XP を支払います。',
      kill: '選択したトークンを撃破として扱い、その XP を追加します。',
      killConfirm:
        '撃破したクリーチャーの XP(確認メッセージのボタン)を追加します。別の数値も指定できます。',
      absent: '選択したキャラクターをこのセッションの欠席にします。',
      present: '選択したキャラクターを再び出席にします。',
      share: '選択したキャラクターの配分を設定します(1 = 全額)。',
      exclude: 'キャラクターをパーティから除外、または再び含めます。',
      undo: 'まだ支払われていない直近の付与を取り消します。',
      end: 'セッションを終了します: XP の支払い、通知、記録を行います。',
      resetSession: '支払わずにセッション XP をクリアします。',
      show: 'シートにある各パーティメンバーの XP とレベルを表示します。',
      roster: 'パーティカードを表示します。',
      party: '選択したキャラクターの Roll20「パーティメンバー」欄のオンとオフを切り替えます。',
      settings: '設定カードを表示します。',
      set: '設定を変更します。',
      lang: '言語を選択します。',
      status: 'sandbox、コマンド、使用中のゲームシステムを表示します。',
      log: 'セッションログのハンドアウトへのリンク。',
      journal: 'ハンドアウトを再構築します。',
      help: 'このヘルプを表示します。',
      handouts: '詳細は {help} と {deck} のハンドアウトを参照してください。',
    },
    deck: {
      session: 'セッション',
      sessionDesc: 'セッションに XP を追加し、パーティを確認して、セッションを終了します。',
      selected: '選択中のトークン',
      selectedDesc: '先にマップ上のトークンを選択してください。',
      party: 'パーティ',
      partyDesc: 'XP を分け合うメンバー。',
      tools: 'ツール',
      toolsDesc: '設定、ステータス、ヘルプ。',
      footer:
        'ボタンは LazyExperience のコマンドを実行します。詳細は {help} ハンドアウトを参照してください。',
    },
    handout: {
      versionLabel: 'バージョン',
      subtitle: 'セッションの経験値を、どのシートでも公平に分配',
      footer: 'すべてのコマンドのボタンは {deck} ハンドアウトにあります。',
      overview: {
        heading: '概要',
        body: 'LazyExperience は、セッション中に獲得した経験値を集め、パーティに分配して、キャラクターシートに書き込みます。D&D 2024 シートのほか、旧版やその他のシートも読み書きでき、Roll20 のパーティを利用し、撃破したクリーチャーを検知し、欠席者やボーナス XP を扱い、レベルアップを通知し、すべてのセッションのログを残します。',
      },
      quickStart: {
        heading: 'クイックスタート',
        steps: [
          '各プレイヤーキャラクターの「パーティメンバー」にチェックを入れます(キャラクターウィンドウの設定)。チェックしなくても、プレイヤーが操作するキャラクターが使われます。',
          '!lazyxp と入力してメニューを開きます。',
          'パーティがクリーチャーを倒して HP バーが 0 になると、その XP を追加するか確認されます。トークンを選択して「撃破: 選択中」を押すこともできます。',
          'それ以外の XP は「XP を追加」で、特定のキャラクターへのボーナス XP は「ボーナス: 選択中」で追加します。',
          'セッションを欠席したプレイヤーを「欠席」にします。',
          '「セッション終了」を押します。全員の配分がシートに書き込まれ、通知され、セッションログのハンドアウトに追加されます。',
        ],
      },
      commands: {
        heading: 'コマンド',
        intro:
          'コマンドはすべて !lazyxp; で始まります({long} も同様)。ほかの XP Mod が使っていなければ {short} も使えます。使用できるのは GM のみです。',
        targets:
          'キャラクター向けのコマンドは、選択したトークンを対象にするか、--ids のあとにキャラクターまたはトークンの ID をコンマ区切りで指定します。',
        colCommand: 'コマンド',
        colDesc: '内容',
      },
      party: {
        heading: 'パーティ',
        points: [
          '自動: Roll20(Jumpgate)で「パーティメンバー」にチェックされたキャラクターがいれば、Roll20 のパーティが XP を分け合います。いなければ、プレイヤーが操作するすべてのキャラクターが分け合います。',
          '「全プレイヤー」だけが操作するキャラクター(補助トークンなど)は数えません。',
          'パーティ追加とパーティ削除は、選択したキャラクターの「パーティメンバー」のオンとオフを切り替えます。',
          '「除外」はキャラクターをパーティから恒久的に外し、「含める」で元に戻します。',
          '複数のプレイヤーが操作するキャラクターは1人として数えます。',
        ],
      },
      splitting: {
        heading: 'XP の分配',
        points: [
          'セッション XP は配分の数で割られます。配分は、パーティメンバー1人につき1つに、追加配分を足したものです。',
          '欠席したキャラクターには「欠席者の配分」の設定(初期値は 0%)が適用されます。欠席は1セッションのみ有効です。',
          'キャラクターごとに異なる配分を設定できます。たとえば従者には 0.5 など。',
          'ボーナス XP は、選んだキャラクターに配分とは別に与えられます。',
          '均等に割り切れない XP は次のセッションに繰り越されます。',
          '「XP の支払い」を instant にすると、付与のたびにすぐ分配して支払われます。',
        ],
      },
      kills: {
        heading: '撃破したクリーチャー',
        points: [
          'HP バーが 0 になったとき、撃破マーカーが付いたとき、または DeathTracker が死亡としたときに、クリーチャーを撃破とみなします。',
          'TokenMod、シート、他の Mod がリンクされた属性を通じて行った変更も検知します。',
          'パーティ外で、プレイヤーが操作していないキャラクターのトークンだけが対象で、各トークンは1セッションにつき1回のみ数えます。',
          'XP はシートから取得します: クリーチャーの XP 値、または脅威度です。',
          '「GM に確認」(初期値)では、追加、その他の数値、無視のあるメッセージが GM にささやきで届きます。「自動で追加」では確認を省略します。',
        ],
      },
      levels: {
        heading: 'レベルアップ',
        points: [
          'XP の書き込み後、LazyExperience はシステムのレベル表を確認し、新しいレベルに必要な XP に達したキャラクターを通知します。',
          'D&D 2024 シートでは、その後プレイヤーがシートのレベルアップボタンを押します。',
        ],
      },
      systems: {
        heading: 'ゲームシステム',
        intro:
          'LazyExperience は各キャラクターのシートからプロファイルを選びます。ゲームシステムを設定して固定したり、custom にして自分でフィールドを指定したりできます。',
        colSystem: 'システム',
        colId: 'ID',
        colSheets: 'シート',
        colChecked: '確認状況',
        verified: {
          live: 'Roll20 でテスト済み',
          partial: 'Roll20 で一部テスト済み',
          source: 'シートのソースから',
          none: '—',
        },
        points: [
          'シートは、ゲームの設定にある名前で選びます。一覧にないシートは、一般的なフィールド名 experience、xp、level を使います。または、ゲームシステムを custom に設定してください。',
          '「Roll20 でテスト済み」とは、Jumpgate のゲームでそのシートに XP が書き込まれ、シート自身の計算が実行され、撃破したクリーチャーとレベルアップ通知が確認されたことを意味します。',
          'D&D 2024 のような Beacon シートには Mod sandbox v1.5 が必要で、Mod から 0 XP に設定することはできません。',
          'Pathfinder 1E と Starfinder は、レベルアップ通知にシートの「次のレベルまでの XP」欄を使います。空欄の場合、Pathfinder は中速の成長曲線を、Starfinder は独自の表を使います。',
          'WFRP 4E: 付与のたびにシートの Experience リストに1行追加されますが、テストではシートが XP の合計を再計算しなかったため、シートで確認してください。',
          'Savage Worlds、13th Age、Cosmere、Call of Cthulhu には Mod が書き込める XP がありません。',
        ],
      },
      settings: {
        heading: '設定',
        intro: '設定は設定カード、または !lazyxp set <setting> <value> で変更します。',
        colKey: '設定',
        colName: '名前',
        colDesc: '内容',
      },
      upgrading: {
        heading: '0.1 からのアップグレード',
        points: [
          '0.1 の設定、セッション XP、キャラクターごとの追加 XP は、1.0 の初回起動時に引き継がれます。',
          'アクティブでなかったプレイヤーやキャラクターはパーティから除外されます。',
          '0.1 のカスタムコマンド名もそのまま使えます。',
          '従来のコマンドも引き続き使えます:',
        ],
        colV1: '0.1',
        colV2: '1.0',
      },
      troubleshooting: {
        heading: 'トラブルシューティング',
        points: [
          'D&D 2024 シートに何も書き込まれない: ゲームが Mod sandbox v1.5 を使っているか確認してください(!lazyxp status)。',
          'クリーチャーの XP が 0: シートに XP も脅威度もありません。「その他の数値」か、!lazyxp kill --xp 100 を使ってください。',
          '撃破が検知されない: HP バーがヒットポイントを保持するバーになっているか確認してください。',
          '!xp が反応しない: 別の XP Mod が使用しています。!lazyxp を使ってください。',
        ],
      },
      languages: {
        heading: '言語',
        body: '!lazyxp lang で言語を選択します。チャットカードとハンドアウトはすぐに切り替わります。',
        colLanguage: '言語',
        colNative: '名前',
        colCode: 'コード',
      },
      credits: {
        heading: 'クレジット',
        original: '作成',
        maintainer: '書き直しと保守',
        support: 'バグ報告やアイデアは Roll20 フォーラムで歓迎します。',
      },
    },
  };

  var localeKo = {
    titles: {
      ready: 'LazyExperience가 준비되었습니다.',
      help: 'LazyExperience 도움말',
      settings: 'LazyExperience 설정',
      status: 'LazyExperience 상태',
      roster: '파티',
      language: '언어',
      levelUp: '레벨 업!',
      defeated: '크리처 처치',
      xpAwarded: '경험치 지급',
      sessionEnded: '세션 {number} 종료',
      yourXp: '내 경험치',
      pool: '세션 XP',
      bonus: '보너스 XP',
      undo: '되돌리기',
      log: '세션 기록',
      partyXp: '파티 경험치',
    },
    menu: {
      session: '세션',
      pool: '세션 XP',
      payout: '지급',
      shares: '몫',
      perShare: '몫당 XP',
      party: '파티 ({source})',
      noParty: '아직 파티에 아무도 없습니다. 파티 카드를 열어 캐릭터를 추가하세요.',
      absentTag: '(결석)',
      bonusTag: '(+{xp} 보너스)',
      levelTag: '레벨 {level}',
      shareTag: '몫 {share}',
      rosterSource: '파티 출처',
      excluded: '제외됨',
      blank: '(비어 있음)',
      groupXp: '경험치',
      groupParty: '파티',
      groupKills: '처치한 크리처',
      groupSheet: '캐릭터 시트',
    },
    buttons: {
      menu: '메뉴',
      help: '도움말',
      settings: '설정',
      status: '상태',
      roster: '파티',
      addXp: 'XP 추가',
      killSelected: '처치: 선택됨',
      bonusSelected: '보너스: 선택됨',
      giveSelected: '즉시 지급: 선택됨',
      endSession: '세션 종료',
      undo: '되돌리기',
      show: '파티 XP',
      log: '세션 기록',
      absent: '결석',
      present: '출석',
      share: '몫',
      exclude: '제외',
      include: '포함',
      partyAdd: '선택 항목을 파티에 추가',
      partyRemove: '선택 항목 제거',
      addKill: '{xp} XP 추가',
      otherXp: '다른 수치',
      ignore: '무시',
    },
    prompts: {
      xp: 'XP',
      reason: '사유 (선택)',
      share: '몫 (1 = 전체, 0.5 = 절반)',
      confirmEnd: '세션을 종료하고 XP를 나눠 줄까요?',
    },
    options: {
      yesNo: { yes: '예', no: '아니요' },
      payout: { end: '세션 종료 시', instant: '즉시' },
      roster: {
        auto: '자동',
        party: 'Roll20 파티',
        players: '플레이어의 캐릭터',
        manual: 'GM이 선택',
      },
      killMode: { prompt: 'GM에게 묻기', auto: '자동으로 추가', off: '끔' },
      announce: { public: '모두', whisper: '해당 플레이어', gm: 'GM만', off: '끔' },
      levelNotice: {
        public: '모두',
        whisper: '해당 플레이어와 GM',
        gm: 'GM만',
        off: '끔',
      },
      system: { auto: '시트에서 감지' },
    },
    settings: {
      language: { label: '언어', desc: '채팅 카드와 핸드아웃에 쓰는 언어입니다.' },
      payout: {
        label: 'XP 지급',
        desc: 'end: XP가 세션 풀에 모였다가 세션이 끝날 때 지급됩니다. instant: 지급할 때마다 바로 나누어 줍니다.',
      },
      updateSheets: {
        label: '시트 갱신',
        desc: 'XP를 캐릭터 시트에 기록합니다. 끄면 합계만 알립니다.',
      },
      system: {
        label: '게임 시스템',
        desc: 'XP와 레벨이 들어 있는 시트 필드입니다. auto는 각 캐릭터의 시트에서 프로필을 고르고, custom은 사용자 지정 필드 설정을 사용합니다.',
      },
      roster: {
        label: '파티 출처',
        desc: 'auto: Roll20 파티에 누군가 있으면 그 파티를, 없으면 플레이어가 조종하는 캐릭터를 사용합니다. party, players, manual로 하나를 고정할 수 있습니다.',
      },
      absentShare: {
        label: '결석자 몫',
        desc: '결석한 캐릭터가 그래도 받는 몫의 비율입니다. 0%(없음)부터 100%(전체)까지.',
      },
      extraShares: {
        label: '추가 몫',
        desc: '시트가 없는 동료나 고용인을 위한 몫입니다. 이들의 XP는 누구에게도 지급되지 않습니다.',
      },
      killMode: {
        label: '처치한 크리처',
        desc: 'prompt: 크리처의 XP를 추가하기 전에 GM에게 묻습니다. auto: 바로 추가합니다. off: 토큰을 감시하지 않습니다.',
      },
      killBar: {
        label: 'HP 바 감시',
        desc: 'HP 바가 0 이하로 떨어진 크리처를 처치된 것으로 칩니다.',
      },
      hpBar: { label: 'HP 바', desc: '체력(HP)이 들어 있는 토큰 바(1, 2, 3)입니다.' },
      killMarker: {
        label: '마커 감시',
        desc: '처치 마커가 토큰에 붙은 크리처를 처치된 것으로 칩니다.',
      },
      marker: {
        label: '처치 마커',
        desc: '처치를 뜻하는 마커입니다. dead 같은 기본 이름이나 사용자 지정 마커의 이름을 씁니다.',
      },
      killDeathTracker: {
        label: 'DeathTracker 사용',
        desc: 'DeathTracker 1.0 이상이 크리처를 사망으로 표시하면 처치된 것으로 칩니다.',
      },
      announce: {
        label: 'XP 메시지',
        desc: 'XP 지급과 세션 종료 요약을 볼 사람: public, whisper(해당 플레이어와 GM), gm 또는 off.',
      },
      levelNotice: {
        label: '레벨 업 알림',
        desc: '레벨 업 알림을 볼 사람: public, whisper(해당 플레이어와 GM), gm 또는 off.',
      },
      customXp: {
        label: '사용자 지정 XP 필드',
        desc: '게임 시스템이 custom일 때 캐릭터의 XP가 들어 있는 시트 필드입니다. 목록이면 이름을 차례로 시도합니다.',
      },
      customLevel: {
        label: '사용자 지정 레벨 필드',
        desc: '캐릭터의 레벨이 들어 있는 시트 필드입니다.',
      },
      customNpcXp: {
        label: '사용자 지정 크리처 XP 필드',
        desc: '크리처가 주는 XP가 들어 있는 시트 필드입니다.',
      },
      customNpcCr: {
        label: '사용자 지정 도전 지수 필드',
        desc: '크리처의 도전 지수(CR)가 들어 있는 시트 필드로, XP 값이 없을 때 사용합니다.',
      },
      customLevels: {
        label: '사용자 지정 레벨 표',
        desc: '레벨 1부터 각 레벨에 필요한 XP입니다(예: 0,300,900,2700). 비워 두면 사용자 지정 시트의 레벨 업 알림이 꺼집니다.',
      },
    },
    roster: {
      explain: {
        party: 'Roll20에서 파티 구성원으로 체크된 캐릭터가 XP를 나눠 가집니다.',
        players:
          '플레이어가 조종하는 캐릭터가 XP를 나눠 가집니다. 대신 Roll20 파티를 쓰려면 캐릭터의 파티 구성원을 체크하세요.',
        manual: '포함한 캐릭터만 XP를 나눠 가집니다.',
      },
      selectHint: '파티에 추가하거나 제거하려면 먼저 토큰을 선택하세요.',
    },
    kills: {
      prompt: '{name}을(를) 처치했습니다. 세션에 {xp} XP를 추가할까요?',
      noXp: '{name}을(를) 처치했지만 시트에 XP 값이 없습니다.',
      reason: '{name} 처치',
      result: {
        prompted: '물어봄',
        added: '추가됨',
        counted: '이번 세션에 이미 집계됨',
        noXp: '시트에 XP 없음: --xp 사용',
        notCreature: '크리처가 아님 (시트 없음 또는 파티 소속)',
      },
    },
    levels: {
      reached: '{name}이(가) 레벨 {level}에 필요한 XP를 모았습니다!',
      sheetButton: '캐릭터 시트의 레벨 업 버튼을 사용하세요.',
      updateSheet: '캐릭터 시트의 레벨을 갱신하세요.',
      pf2: '시트의 레벨을 올리고 XP에서 1,000을 빼세요.',
      spend: 'XP를 소모하고 시트의 레벨을 올리세요.',
    },
    instant: {
      everyone: '파티원 모두가 {xp} XP를 얻었습니다.',
      bonus: '{names}이(가) {xp} XP를 얻었습니다.',
    },
    end: {
      nothing: '이번 세션에는 지급된 XP가 없습니다.',
      playerLine: '{name}이(가) 이번 세션에서 {xp} XP를 얻었습니다.',
      playerLineTotal: '{name}이(가) 이번 세션에서 {xp} XP를 얻어 총 {total} XP가 되었습니다.',
      levelLine: '{name}이(가) 레벨 {level}에 도달했습니다.',
      remainder: '{xp} XP는 똑같이 나눌 수 없어 다음 세션으로 이월됩니다.',
    },
    show: {
      noXp: '시트에 XP 없음',
      next: '다음 레벨까지 {xp}',
    },
    awardKinds: { pool: '세션 XP', bonus: '보너스 XP', give: '지급한 XP' },
    messages: {
      saved: '저장했습니다.',
      commands: '명령어: {commands}',
      aliasTaken: '{alias}은(는) {mods}이(가) 사용 중입니다. !lazyxp를 사용하세요.',
      migrated: 'LazyExperience 0.1의 설정, 세션 XP, 추가 XP를 가져왔습니다.',
      handouts: '도움말, 명령 덱, 세션 기록 핸드아웃을 다시 만들었습니다.',
      noLog: '아직 끝난 세션이 없어 세션 기록이 없습니다.',
      poolAdded: '세션에 {xp} XP를 추가했습니다.',
      bonusAdded: '{names}에게 보너스 XP {xp}.',
      killAdded: '{name}의 {xp} XP를 세션에 추가했습니다.',
      killGone: '그 처치는 이미 추가되었거나 더 이상 대기 중이 아닙니다.',
      undone: '{xp} XP를 되돌렸습니다 ({reason}).',
      nothingToUndo: '이번 세션에는 되돌릴 것이 없습니다.',
      nothingToUndoInstant: 'XP는 이미 지급되었습니다. 바로잡으려면 음수 값으로 give를 사용하세요.',
      sessionReset: '세션 XP와 보너스를 지웠습니다. 지급된 것은 없습니다.',
      absent: '이번 세션 결석으로 표시: {names}.',
      present: '출석으로 표시: {names}.',
      party: {
        add: '파티에 추가됨: {names}.',
        remove: '파티에서 제거됨: {names}.',
      },
    },
    warnings: {
      sandbox:
        '일부 캐릭터가 Beacon 시트(D&D 2024 등)를 사용하는데, Mod sandbox는 v1.5에서만 읽고 쓸 수 있습니다. 게임의 Mod 설정에서 sandbox v1.5를 선택하세요.',
      partyLegacy:
        'Roll20 파티는 Jumpgate 기능입니다. 이 게임에서는 Mod가 자체 파티 목록을 유지합니다.',
      nobodyToPay: '파티에 아무도 없어서 {xp} XP는 나중을 위해 보관됩니다.',
      write: {
        zero: '{name}: Mod에서는 시트를 0 XP로 설정할 수 없습니다. 시트에서 직접 바꾸세요.',
        sandbox: '{name}: 이 시트의 XP를 갱신하려면 Mod sandbox v1.5가 필요합니다.',
        xpless: '{name}: 이 게임 시스템은 XP를 사용하지 않습니다(또는 시트가 직접 계산합니다).',
        noField:
          '{name}: 이 시트의 XP 필드를 알 수 없습니다. 게임 시스템을 custom으로 설정하고 필드 이름을 지정하세요.',
        error: '{name}: 시트를 {xp} XP로 갱신하지 못했습니다. Mod 콘솔을 확인하세요.',
      },
    },
    errors: {
      gmOnly: 'GM만 LazyExperience 명령어를 사용할 수 있습니다.',
      failed: '문제가 발생했습니다: {message}',
      unknownCommand: '알 수 없는 명령어 "{name}".',
      helpHint: '명령어 목록은 {command} help를 입력하세요.',
      unknownSetting: '알 수 없는 설정 "{name}".',
      settingsHint: '설정 카드를 열어 설정을 확인하세요.',
      badValue: '"{value}"은(는) {name}에 올바른 값이 아닙니다.',
      badXp: 'XP는 250처럼 정수로 입력하세요.',
      badShare: '몫은 0.5나 50%처럼 0에서 10 사이의 숫자로 입력하세요.',
      noCharacters: '캐릭터를 나타내는 토큰을 선택하거나 --ids를 사용하세요.',
      noTokens: '먼저 처치한 토큰을 선택하거나 --ids를 사용하세요.',
    },
    status: {
      version: '버전',
      sandbox: 'Mod sandbox',
      beacon: 'Beacon 시트 읽기 가능',
      commands: '명령어',
      profiles: '사용 중인 게임 시스템',
      characters: '캐릭터 {count}명',
      handouts: '{help} 및 {deck} 핸드아웃을 참고하세요.',
    },
    log: {
      title: '세션 기록',
      sessionHeading: '세션 {number} — {date}',
      colCharacter: '캐릭터',
      colXp: 'XP',
      awards: '지급 내역',
      levelUps: '레벨:',
      empty: '아직 끝난 세션이 없습니다.',
    },
    help: {
      menu: '메인 메뉴를 표시합니다.',
      add: '세션 풀에 XP를 추가합니다. 사유는 선택입니다.',
      bonus: '선택한 캐릭터에게 몫과 별도로 보너스 XP를 줍니다.',
      give: '선택한 캐릭터에게 XP를 즉시 지급합니다.',
      kill: '선택한 토큰을 처치한 것으로 치고 해당 XP를 추가합니다.',
      killConfirm:
        '처치한 크리처의 XP(확인 메시지의 버튼)를 추가합니다. 다른 수치를 지정할 수도 있습니다.',
      absent: '선택한 캐릭터를 이번 세션 결석으로 표시합니다.',
      present: '선택한 캐릭터를 다시 출석으로 표시합니다.',
      share: '선택한 캐릭터의 몫을 설정합니다(1 = 전체).',
      exclude: '캐릭터를 파티에서 제외하거나 다시 포함합니다.',
      undo: '아직 지급되지 않은 마지막 지급을 되돌립니다.',
      end: '세션을 종료합니다: XP를 지급하고, 알리고, 기록합니다.',
      resetSession: '지급하지 않고 세션 XP를 지웁니다.',
      show: '시트에 있는 각 파티원의 XP와 레벨을 표시합니다.',
      roster: '파티 카드를 표시합니다.',
      party: '선택한 캐릭터의 Roll20 파티 구성원 체크를 켜거나 끕니다.',
      settings: '설정 카드를 표시합니다.',
      set: '설정을 바꿉니다.',
      lang: '언어를 선택합니다.',
      status: 'sandbox, 명령어, 사용 중인 게임 시스템을 표시합니다.',
      log: '세션 기록 핸드아웃으로 연결합니다.',
      journal: '핸드아웃을 다시 만듭니다.',
      help: '이 도움말을 표시합니다.',
      handouts: '더 자세한 내용은 {help} 및 {deck} 핸드아웃에 있습니다.',
    },
    deck: {
      session: '세션',
      sessionDesc: '세션에 XP를 추가하고, 파티를 확인하고, 세션을 종료합니다.',
      selected: '선택한 토큰',
      selectedDesc: '먼저 맵에서 토큰을 선택하세요.',
      party: '파티',
      partyDesc: 'XP를 나눠 가질 구성원.',
      tools: '도구',
      toolsDesc: '설정, 상태, 도움말.',
      footer:
        '버튼은 LazyExperience 명령어를 실행합니다. 자세한 내용은 {help} 핸드아웃을 참고하세요.',
    },
    handout: {
      versionLabel: '버전',
      subtitle: '어떤 시트에서든 세션 경험치를 공평하게 나눕니다',
      footer: '모든 명령어의 버튼은 {deck} 핸드아웃에 있습니다.',
      overview: {
        heading: '개요',
        body: 'LazyExperience는 세션 중에 얻은 경험치를 모아 파티에 나누고 캐릭터 시트에 기록합니다. D&D 2024 시트는 물론 이전 시트와 다른 시트도 읽고 쓰며, Roll20 자체 파티를 사용하고, 처치된 크리처를 알아채고, 결석자와 보너스 XP를 처리하고, 레벨 업을 알리고, 모든 세션의 기록을 남깁니다.',
      },
      quickStart: {
        heading: '빠른 시작',
        steps: [
          '각 플레이어 캐릭터에서 파티 구성원을 체크하세요(캐릭터 창의 설정). 체크하지 않아도 플레이어가 조종하는 캐릭터가 사용됩니다.',
          '!lazyxp를 입력해 메뉴를 엽니다.',
          '파티가 크리처를 처치해 HP 바가 0이 되면 그 XP를 추가할지 묻습니다. 토큰을 선택하고 처치: 선택됨을 눌러도 됩니다.',
          '그 밖의 XP는 XP 추가로, 한 캐릭터에게 주는 보너스 XP는 보너스: 선택됨으로 추가합니다.',
          '세션에 빠진 플레이어는 결석으로 표시하세요.',
          '세션 종료를 누릅니다. 모두의 몫이 시트에 기록되고, 알려지고, 세션 기록 핸드아웃에 추가됩니다.',
        ],
      },
      commands: {
        heading: '명령어',
        intro:
          '모든 명령어는 !lazyxp; 로 시작합니다({long}도 가능). 다른 XP Mod가 사용하지 않는다면 {short}도 쓸 수 있습니다. GM만 사용할 수 있습니다.',
        targets:
          '캐릭터에 대한 명령어는 선택한 토큰을 대상으로 하거나, --ids 뒤에 캐릭터 또는 토큰 ID를 쉼표로 구분해 적습니다.',
        colCommand: '명령어',
        colDesc: '기능',
      },
      party: {
        heading: '파티',
        points: [
          '자동: Roll20(Jumpgate)에서 파티 구성원으로 체크된 캐릭터가 있으면 Roll20 파티가 XP를 나눠 가지고, 없으면 플레이어가 조종하는 모든 캐릭터가 나눠 가집니다.',
          '도우미 토큰처럼 "모든 플레이어"만 조종하는 캐릭터는 세지 않습니다.',
          '파티 추가와 파티 제거는 선택한 캐릭터의 파티 구성원 체크를 켜거나 끕니다.',
          '제외는 캐릭터를 파티에서 계속 빼 두고, 포함은 다시 넣습니다.',
          '여러 플레이어가 조종하는 캐릭터는 한 명으로 셉니다.',
        ],
      },
      splitting: {
        heading: 'XP 나누기',
        points: [
          '세션 XP는 몫의 수로 나뉩니다. 파티원 한 명당 하나에 추가 몫을 더한 수입니다.',
          '결석한 캐릭터는 결석자 몫 설정(기본 0%)을 받습니다. 결석은 한 세션 동안만 유지됩니다.',
          '동료 캐릭터에게 0.5를 주는 것처럼 캐릭터마다 몫을 다르게 정할 수 있습니다.',
          '보너스 XP는 선택한 캐릭터에게 몫과 별도로 갑니다.',
          '똑같이 나눠 떨어지지 않는 XP는 다음 세션으로 이월됩니다.',
          'XP 지급을 instant로 설정하면 지급할 때마다 바로 나누어 줍니다.',
        ],
      },
      kills: {
        heading: '처치한 크리처',
        points: [
          'HP 바가 0이 되거나, 처치 마커가 붙거나, DeathTracker가 사망으로 표시하면 크리처가 처치된 것으로 칩니다.',
          'TokenMod, 시트, 다른 Mod가 연결된 속성을 통해 바꾼 내용도 감지합니다.',
          '파티 밖에 있고 플레이어가 조종하지 않는 캐릭터의 토큰만 집계하며, 각 토큰은 세션당 한 번만 집계합니다.',
          'XP는 시트에서 가져옵니다: 크리처의 XP 값 또는 도전 지수입니다.',
          'GM에게 묻기(기본값)는 추가, 다른 수치, 무시 버튼이 있는 귓속말 확인 메시지를 보냅니다. 자동으로 추가는 확인을 건너뜁니다.',
        ],
      },
      levels: {
        heading: '레벨 업',
        points: [
          'XP를 기록한 뒤 LazyExperience는 시스템의 레벨 표를 확인하고, 새 레벨에 필요한 XP를 모은 캐릭터를 알립니다.',
          'D&D 2024 시트에서는 이후 플레이어가 시트의 레벨 업 버튼을 누릅니다.',
        ],
      },
      systems: {
        heading: '게임 시스템',
        intro:
          'LazyExperience는 각 캐릭터의 시트에서 프로필을 고릅니다. 게임 시스템을 설정해 하나로 고정하거나, custom으로 두고 필드를 직접 지정할 수 있습니다.',
        colSystem: '시스템',
        colId: 'ID',
        colSheets: '시트',
        colChecked: '확인 상태',
        verified: {
          live: 'Roll20에서 테스트함',
          partial: 'Roll20에서 일부 테스트함',
          source: '시트 소스 기준',
          none: '—',
        },
        points: [
          '시트는 게임 설정에 있는 이름으로 고릅니다. 목록에 없는 시트는 흔히 쓰는 필드 이름 experience, xp, level을 사용하며, 게임 시스템을 custom으로 설정할 수도 있습니다.',
          'Roll20에서 테스트함은 Jumpgate 게임에서 해당 시트에 XP를 기록했고, 시트 자체 계산이 실행되었으며, 처치한 크리처와 레벨 업 알림을 확인했다는 뜻입니다.',
          'D&D 2024 같은 Beacon 시트에는 Mod sandbox v1.5가 필요하며, Mod에서는 0 XP로 설정할 수 없습니다.',
          'Pathfinder 1E와 Starfinder는 레벨 업 알림에 시트의 다음 레벨까지 필요한 XP 칸을 사용합니다. 비어 있으면 Pathfinder는 중간 진행 속도를, Starfinder는 자체 표를 사용합니다.',
          'WFRP 4E: 지급할 때마다 시트의 Experience 목록에 행이 하나씩 추가되지만, 테스트에서 시트가 XP 합계를 다시 계산하지 않았으므로 시트에서 확인하세요.',
          'Savage Worlds, 13th Age, Cosmere, Call of Cthulhu에는 Mod가 기록할 XP가 없습니다.',
        ],
      },
      settings: {
        heading: '설정',
        intro: '설정은 설정 카드에서 바꾸거나 !lazyxp set <setting> <value>로 바꿉니다.',
        colKey: '설정',
        colName: '이름',
        colDesc: '기능',
      },
      upgrading: {
        heading: '0.1에서 업그레이드',
        points: [
          '0.1의 설정, 세션 XP, 캐릭터별 추가 XP는 1.0이 처음 시작될 때 가져옵니다.',
          '활동하지 않던 플레이어나 캐릭터는 파티에서 제외됩니다.',
          '0.1의 사용자 지정 명령어 이름도 계속 작동합니다.',
          '예전 명령어도 계속 작동합니다:',
        ],
        colV1: '0.1',
        colV2: '1.0',
      },
      troubleshooting: {
        heading: '문제 해결',
        points: [
          'D&D 2024 시트에 아무것도 기록되지 않음: 게임이 Mod sandbox v1.5를 사용하는지 확인하세요(!lazyxp status).',
          '크리처가 0 XP를 줌: 시트에 XP나 도전 지수가 없습니다. 다른 수치를 사용하거나 !lazyxp kill --xp 100을 사용하세요.',
          '처치가 감지되지 않음: HP 바가 체력이 들어 있는 바로 설정되어 있는지 확인하세요.',
          '!xp가 아무 반응이 없음: 다른 XP Mod가 사용 중입니다. !lazyxp를 사용하세요.',
        ],
      },
      languages: {
        heading: '언어',
        body: '!lazyxp lang으로 언어를 선택합니다. 채팅 카드와 핸드아웃이 바로 바뀝니다.',
        colLanguage: '언어',
        colNative: '이름',
        colCode: '코드',
      },
      credits: {
        heading: '제작진',
        original: '제작',
        maintainer: '다시 작성 및 유지 관리',
        support: '버그 신고와 아이디어는 Roll20 포럼에서 환영합니다.',
      },
    },
  };

  var localePl = {
    titles: {
      ready: 'LazyExperience jest gotowy.',
      help: 'Pomoc LazyExperience',
      settings: 'Ustawienia LazyExperience',
      status: 'Stan LazyExperience',
      roster: 'Drużyna',
      language: 'Język',
      levelUp: 'Nowy poziom!',
      defeated: 'Stworzenie pokonane',
      xpAwarded: 'Przyznano doświadczenie',
      sessionEnded: 'Sesja {number} zakończona',
      yourXp: 'Twoje doświadczenie',
      pool: 'XP sesji',
      bonus: 'Bonusowe XP',
      undo: 'Cofnij',
      log: 'Dziennik sesji',
      partyXp: 'Doświadczenie drużyny',
    },
    menu: {
      session: 'Sesja',
      pool: 'XP sesji',
      payout: 'Wypłata',
      shares: 'Udziały',
      perShare: 'XP na udział',
      party: 'Drużyna ({source})',
      noParty: 'W drużynie nikogo jeszcze nie ma. Otwórz kartę Drużyna, aby dodać postacie.',
      absentTag: '(nieobecny)',
      bonusTag: '(+{xp} bonusu)',
      levelTag: 'Poziom {level}',
      shareTag: 'Udział {share}',
      rosterSource: 'Drużyna z',
      excluded: 'Pominięci',
      blank: '(puste)',
      groupXp: 'Doświadczenie',
      groupParty: 'Drużyna',
      groupKills: 'Pokonane stworzenia',
      groupSheet: 'Karta postaci',
    },
    buttons: {
      menu: 'Menu',
      help: 'Pomoc',
      settings: 'Ustawienia',
      status: 'Stan',
      roster: 'Drużyna',
      addXp: 'Dodaj XP',
      killSelected: 'Pokonani: zaznaczeni',
      bonusSelected: 'Bonus: zaznaczeni',
      giveSelected: 'Przyznaj teraz: zaznaczeni',
      endSession: 'Zakończ sesję',
      undo: 'Cofnij',
      show: 'XP drużyny',
      log: 'Dziennik sesji',
      absent: 'Nieobecny',
      present: 'Obecny',
      share: 'Udział',
      exclude: 'Pomiń',
      include: 'Uwzględnij',
      partyAdd: 'Dodaj zaznaczonych do drużyny',
      partyRemove: 'Usuń zaznaczonych',
      addKill: 'Dodaj {xp} XP',
      otherXp: 'Inna wartość',
      ignore: 'Zignoruj',
    },
    prompts: {
      xp: 'XP',
      reason: 'Powód (opcjonalnie)',
      share: 'Udział (1 = pełny, 0,5 = połowa)',
      confirmEnd: 'Zakończyć sesję i rozdać XP?',
    },
    options: {
      yesNo: { yes: 'Tak', no: 'Nie' },
      payout: { end: 'Na koniec sesji', instant: 'Od razu' },
      roster: {
        auto: 'Automatycznie',
        party: 'Drużyna Roll20',
        players: 'Postacie graczy',
        manual: 'Wybrane przez MG',
      },
      killMode: { prompt: 'Zapytaj MG', auto: 'Dodawaj automatycznie', off: 'Wyłączone' },
      announce: {
        public: 'Wszyscy',
        whisper: 'Zainteresowani gracze',
        gm: 'Tylko MG',
        off: 'Wyłączone',
      },
      levelNotice: {
        public: 'Wszyscy',
        whisper: 'Gracz i MG',
        gm: 'Tylko MG',
        off: 'Wyłączone',
      },
      system: { auto: 'Wykryj z karty postaci' },
    },
    settings: {
      language: { label: 'Język', desc: 'Język kart na czacie i handoutów.' },
      payout: {
        label: 'Wypłata XP',
        desc: 'end: XP gromadzi się w puli sesji i jest rozdawane po jej zakończeniu. instant: każda nagroda jest od razu dzielona i wypłacana.',
      },
      updateSheets: {
        label: 'Aktualizuj karty',
        desc: 'Zapisuje XP na kartach postaci. Gdy wyłączone, sumy są tylko ogłaszane.',
      },
      system: {
        label: 'System gry',
        desc: 'Które pola karty zawierają XP i poziom. auto dobiera profil na podstawie karty każdej postaci; custom używa własnych ustawień pól.',
      },
      roster: {
        label: 'Drużyna z',
        desc: 'auto: drużyna Roll20, jeśli ktoś w niej jest, w przeciwnym razie postacie kontrolowane przez graczy. party, players lub manual wybierają jedną z opcji.',
      },
      absentShare: {
        label: 'Udział nieobecnych',
        desc: 'Część udziału, którą nieobecna postać nadal otrzymuje, od 0% (nic) do 100% (cały).',
      },
      extraShares: {
        label: 'Dodatkowe udziały',
        desc: 'Udziały dla towarzyszy lub najemników, którzy nie mają karty. Ich XP nie trafia do nikogo.',
      },
      killMode: {
        label: 'Pokonane stworzenia',
        desc: 'prompt: zapytaj MG przed dodaniem XP stworzenia. auto: dodaj od razu. off: nie obserwuj tokenów.',
      },
      killBar: {
        label: 'Obserwuj pasek HP',
        desc: 'Uznaje stworzenie za pokonane, gdy jego pasek HP spadnie do 0 lub niżej.',
      },
      hpBar: { label: 'Pasek HP', desc: 'Który pasek tokena (1, 2 lub 3) zawiera punkty życia.' },
      killMarker: {
        label: 'Obserwuj znacznik',
        desc: 'Uznaje stworzenie za pokonane, gdy na jego tokenie pojawi się znacznik pokonania.',
      },
      marker: {
        label: 'Znacznik pokonania',
        desc: 'Znacznik oznaczający pokonanie: wbudowana nazwa, np. dead, lub nazwa własnego znacznika.',
      },
      killDeathTracker: {
        label: 'Użyj DeathTracker',
        desc: 'Uznaje stworzenie za pokonane, gdy DeathTracker 1.0 lub nowszy oznaczy je jako martwe.',
      },
      announce: {
        label: 'Wiadomości o XP',
        desc: 'Kto widzi nagrody XP i podsumowanie końca sesji: public (wszyscy), whisper (zainteresowani gracze i MG), gm lub off.',
      },
      levelNotice: {
        label: 'Powiadomienia o awansie',
        desc: 'Kto widzi powiadomienia o awansie: public (wszyscy), whisper (gracz i MG), gm lub off.',
      },
      customXp: {
        label: 'Własne pole XP',
        desc: 'Pole karty z XP postaci, gdy System gry to custom. Lista wypróbowuje kolejne nazwy.',
      },
      customLevel: { label: 'Własne pole poziomu', desc: 'Pole karty z poziomem postaci.' },
      customNpcXp: {
        label: 'Własne pole XP stworzenia',
        desc: 'Pole karty z wartością XP stworzenia.',
      },
      customNpcCr: {
        label: 'Własne pole wyzwania',
        desc: 'Pole karty z poziomem wyzwania stworzenia, używane, gdy nie ma ono wartości XP.',
      },
      customLevels: {
        label: 'Własna tabela poziomów',
        desc: 'XP potrzebne na każdy poziom, od poziomu 1, np. 0,300,900,2700. Puste wyłącza powiadomienia o awansie dla własnych kart.',
      },
    },
    roster: {
      explain: {
        party: 'XP dzielą postacie zaznaczone w Roll20 jako Party Member.',
        players:
          'XP dzielą postacie kontrolowane przez gracza. Zaznacz Party Member przy postaciach, aby użyć drużyny Roll20.',
        manual: 'XP dzielą tylko postacie, które uwzględnisz.',
      },
      selectHint: 'Najpierw zaznacz tokeny, aby dodać je do drużyny lub je usunąć.',
    },
    kills: {
      prompt: '{name} został pokonany. Dodać {xp} XP do sesji?',
      noXp: '{name} został pokonany, ale jego karta nie ma wartości XP.',
      reason: 'Pokonano: {name}',
      result: {
        prompted: 'zapytano',
        added: 'dodano',
        counted: 'już policzono w tej sesji',
        noXp: 'brak XP na karcie: użyj --xp',
        notCreature: 'to nie stworzenie (brak karty lub należy do drużyny)',
      },
    },
    levels: {
      reached: '{name} ma dość XP na poziom {level}!',
      sheetButton: 'Użyj przycisku Level Up na karcie postaci.',
      updateSheet: 'Zaktualizuj poziom na karcie postaci.',
      pf2: 'Podnieś poziom na karcie i odejmij 1000 od XP.',
      spend: 'Wydaj XP i podnieś poziom na karcie.',
    },
    instant: {
      everyone: 'Cała drużyna zyskuje {xp} XP.',
      bonus: '{names} zyskują {xp} XP.',
    },
    end: {
      nothing: 'W tej sesji nie przyznano XP.',
      playerLine: '{name} zyskuje {xp} XP w tej sesji.',
      playerLineTotal: '{name} zyskuje {xp} XP w tej sesji, łącznie {total} XP.',
      levelLine: '{name} osiąga poziom {level}.',
      remainder: '{xp} XP nie dało się podzielić równo i przechodzi na następną sesję.',
    },
    show: {
      noXp: 'brak XP na karcie',
      next: 'następny poziom przy {xp}',
    },
    awardKinds: { pool: 'XP sesji', bonus: 'Bonusowe XP', give: 'Przyznane XP' },
    messages: {
      saved: 'Zapisano.',
      commands: 'Polecenia: {commands}',
      aliasTaken: '{alias} zajmuje {mods}. Użyj !lazyxp.',
      migrated: 'Ustawienia, XP sesji i dodatkowe XP z LazyExperience 0.1 zostały przeniesione.',
      handouts: 'Handouty Pomoc, Command Deck i Dziennik sesji zostały odbudowane.',
      noLog: 'Żadna sesja jeszcze się nie zakończyła, więc nie ma Dziennika sesji.',
      poolAdded: 'Dodano {xp} XP do sesji.',
      bonusAdded: '{xp} bonusowych XP dla: {names}.',
      killAdded: 'Dodano do sesji {xp} XP za: {name}.',
      killGone: 'To pokonanie zostało już dodane lub nie oczekuje na decyzję.',
      undone: 'Cofnięto {xp} XP ({reason}).',
      nothingToUndo: 'W tej sesji nie ma nic do cofnięcia.',
      nothingToUndoInstant:
        'XP zostało już wypłacone. Użyj give z ujemną wartością, aby to poprawić.',
      sessionReset: 'XP sesji i bonusy zostały wyczyszczone. Nic nie wypłacono.',
      absent: 'Oznaczono jako nieobecnych w tej sesji: {names}.',
      present: 'Oznaczono jako obecnych: {names}.',
      party: {
        add: 'Dodano do drużyny: {names}.',
        remove: 'Usunięto z drużyny: {names}.',
      },
    },
    warnings: {
      sandbox:
        'Niektóre postacie używają karty Beacon (np. D&D 2024), którą Mod sandbox potrafi odczytać i zapisać tylko w wersji v1.5. Wybierz sandbox v1.5 w ustawieniach Modów gry.',
      partyLegacy:
        'Drużyna Roll20 to funkcja Jumpgate; w tej grze mod prowadzi własną listę drużyny.',
      nobodyToPay: 'W drużynie nikogo nie ma, więc {xp} XP zostaje na później.',
      write: {
        zero: '{name}: Mod nie może ustawić na karcie 0 XP. Zmień to na karcie.',
        sandbox: '{name}: ta karta wymaga Mod sandbox v1.5, aby zaktualizować XP.',
        xpless: '{name}: ten system gry nie używa XP (lub karta sama je oblicza).',
        noField:
          '{name}: dla tej karty nie jest znane pole XP. Ustaw System gry na custom i podaj nazwę pola.',
        error: '{name}: nie udało się zaktualizować karty o {xp} XP. Zajrzyj do konsoli Modów.',
      },
    },
    errors: {
      gmOnly: 'Tylko MG może używać poleceń LazyExperience.',
      failed: 'Coś poszło nie tak: {message}',
      unknownCommand: 'Nieznane polecenie "{name}".',
      helpHint: 'Wpisz {command} help, aby zobaczyć polecenia.',
      unknownSetting: 'Nieznane ustawienie "{name}".',
      settingsHint: 'Otwórz kartę ustawień, aby zobaczyć ustawienia.',
      badValue: '"{value}" nie jest prawidłową wartością dla {name}.',
      badXp: 'Podaj XP jako liczbę całkowitą, np. 250.',
      badShare: 'Podaj udział jako liczbę od 0 do 10, np. 0.5 lub 50%.',
      noCharacters: 'Zaznacz tokeny reprezentujące postacie lub użyj --ids.',
      noTokens: 'Najpierw zaznacz pokonane tokeny lub użyj --ids.',
    },
    status: {
      version: 'Wersja',
      sandbox: 'Mod sandbox',
      beacon: 'Karty Beacon możliwe do odczytu',
      commands: 'Polecenia',
      profiles: 'Używane systemy gry',
      characters: 'Postaci: {count}',
      handouts: 'Zobacz handouty {help} i {deck}.',
    },
    log: {
      title: 'Dziennik sesji',
      sessionHeading: 'Sesja {number} — {date}',
      colCharacter: 'Postać',
      colXp: 'XP',
      awards: 'Nagrody',
      levelUps: 'Poziomy:',
      empty: 'Żadna sesja jeszcze się nie zakończyła.',
    },
    help: {
      menu: 'Pokaż menu główne.',
      add: 'Dodaj XP do puli sesji, opcjonalnie z powodem.',
      bonus: 'Przyznaj zaznaczonym postaciom bonusowe XP ponad ich udział.',
      give: 'Wypłać XP zaznaczonym postaciom od razu.',
      kill: 'Uznaj zaznaczone tokeny za pokonane i dodaj ich XP.',
      killConfirm:
        'Dodaj XP pokonanego stworzenia (przycisk z zapytania), opcjonalnie z inną wartością.',
      absent: 'Oznacz zaznaczone postacie jako nieobecne w tej sesji.',
      present: 'Oznacz zaznaczone postacie ponownie jako obecne.',
      share: 'Ustaw udział zaznaczonych postaci (1 = pełny).',
      exclude: 'Pomiń postacie w drużynie lub ponownie je uwzględnij.',
      undo: 'Cofnij ostatnią nagrodę, która nie została jeszcze wypłacona.',
      end: 'Zakończ sesję: wypłać XP, ogłoś je i zapisz w dzienniku.',
      resetSession: 'Wyczyść XP sesji bez wypłacania.',
      show: 'Pokaż XP i poziom każdego członka drużyny z karty.',
      roster: 'Pokaż kartę drużyny.',
      party: 'Zaznacz lub odznacz pole Party Member w Roll20 dla zaznaczonych postaci.',
      settings: 'Pokaż kartę ustawień.',
      set: 'Zmień ustawienie.',
      lang: 'Wybierz język.',
      status: 'Pokaż sandbox, polecenia i używane systemy gry.',
      log: 'Odnośnik do handoutu Dziennik sesji.',
      journal: 'Odbuduj handouty.',
      help: 'Pokaż tę pomoc.',
      handouts: 'Więcej w handoutach {help} i {deck}.',
    },
    deck: {
      session: 'Sesja',
      sessionDesc: 'Dodaj XP do sesji, sprawdź drużynę i zakończ sesję.',
      selected: 'Zaznaczone tokeny',
      selectedDesc: 'Najpierw zaznacz tokeny na mapie.',
      party: 'Drużyna',
      partyDesc: 'Kto dzieli XP.',
      tools: 'Narzędzia',
      toolsDesc: 'Ustawienia, stan i pomoc.',
      footer: 'Przyciski uruchamiają polecenia LazyExperience. Szczegóły w handoucie {help}.',
    },
    handout: {
      versionLabel: 'Wersja',
      subtitle: 'Doświadczenie sesji, sprawiedliwie podzielone, na każdej karcie',
      footer: 'Przyciski do każdego polecenia znajdziesz w handoucie {deck}.',
      overview: {
        heading: 'Przegląd',
        body: 'LazyExperience zbiera punkty doświadczenia zdobyte podczas sesji, dzieli je między drużynę i zapisuje na kartach postaci. Czyta i zapisuje kartę D&D 2024 oraz starsze i inne karty, korzysta z drużyny Roll20, zauważa pokonane stworzenia, obsługuje nieobecnych graczy i bonusowe XP, ogłasza awanse i prowadzi dziennik każdej sesji.',
      },
      quickStart: {
        heading: 'Szybki start',
        steps: [
          'Zaznacz Party Member przy każdej postaci gracza (w ustawieniach okna postaci) lub pomiń to: użyte zostaną postacie kontrolowane przez graczy.',
          'Wpisz !lazyxp, aby otworzyć menu.',
          'Gdy drużyna pokona stworzenie, spadek jego paska HP do 0 wywoła pytanie, czy dodać jego XP. Możesz też zaznaczyć tokeny i nacisnąć Pokonani: zaznaczeni.',
          'Dodaj XP za cokolwiek innego przyciskiem Dodaj XP, a bonusowe XP dla jednej postaci przyciskiem Bonus: zaznaczeni.',
          'Graczy, którzy ominęli sesję, oznacz jako Nieobecny.',
          'Naciśnij Zakończ sesję. Udział każdego zostanie zapisany na kartach, ogłoszony i dodany do handoutu Dziennik sesji.',
        ],
      },
      commands: {
        heading: 'Polecenia',
        intro:
          'Każde polecenie zaczyna się od !lazyxp; działa też {long}, a także {short}, o ile żaden inny Mod XP go nie używa. Mogą ich używać tylko MG.',
        targets:
          'Polecenia dla postaci używają zaznaczonych tokenów albo --ids z identyfikatorami postaci lub tokenów oddzielonymi przecinkami.',
        colCommand: 'Polecenie',
        colDesc: 'Co robi',
      },
      party: {
        heading: 'Drużyna',
        points: [
          'Automatycznie: gdy jakakolwiek postać jest zaznaczona w Roll20 (Jumpgate) jako Party Member, XP dzieli drużyna Roll20; w przeciwnym razie każda postać kontrolowana przez gracza.',
          'Postacie kontrolowane wyłącznie przez "All players", np. tokeny pomocnicze, nie są liczone.',
          'Dodanie do drużyny i usunięcie z drużyny zaznacza lub odznacza Party Member dla zaznaczonych postaci.',
          'Pomiń wyłącza postać z drużyny na stałe; Uwzględnij przywraca ją.',
          'Postać kontrolowana przez kilku graczy liczy się raz.',
        ],
      },
      splitting: {
        heading: 'Dzielenie XP',
        points: [
          'XP sesji jest dzielone przez liczbę udziałów: jeden na członka drużyny plus ewentualne dodatkowe udziały.',
          'Nieobecne postacie otrzymują wartość ustawienia Udział nieobecnych (domyślnie 0%). Nieobecność trwa jedną sesję.',
          'Postać może mieć inny udział, np. 0,5 dla pomocnika.',
          'Bonusowe XP trafia do wybranych postaci ponad ich udział.',
          'XP, którego nie da się podzielić równo, przechodzi na następną sesję.',
          'Przy Wypłacie XP ustawionej na instant każda nagroda jest dzielona i wypłacana od razu.',
        ],
      },
      kills: {
        heading: 'Pokonane stworzenia',
        points: [
          'Stworzenie uznaje się za pokonane, gdy jego pasek HP spadnie do 0, gdy pojawi się znacznik pokonania lub gdy DeathTracker oznaczy je jako martwe.',
          'Zmiany wykonane przez TokenMod, kartę lub inne Mody przez powiązany atrybut też są zauważane.',
          'Liczone są tylko tokeny postaci spoza drużyny, których nie kontroluje żaden gracz, każdy token tylko raz na sesję.',
          'XP pochodzi z karty: wartość XP stworzenia lub jego poziom wyzwania.',
          'Zapytaj MG (domyślnie) wysyła szeptem pytanie z przyciskami Dodaj, Inna wartość i Zignoruj. Dodawaj automatycznie pomija pytanie.',
        ],
      },
      levels: {
        heading: 'Awanse na poziom',
        points: [
          'Po zapisaniu XP LazyExperience sprawdza tabelę poziomów systemu i ogłasza, gdy postać ma dość XP na nowy poziom.',
          'Na karcie D&D 2024 gracz naciska wtedy przycisk Level Up na karcie.',
        ],
      },
      systems: {
        heading: 'Systemy gry',
        intro:
          'LazyExperience dobiera profil na podstawie karty każdej postaci. Ustaw System gry, aby wymusić jeden, lub custom, aby samemu nazwać pola.',
        colSystem: 'System',
        colId: 'ID',
        colSheets: 'Karty',
        colChecked: 'Sprawdzono',
        verified: {
          live: 'Przetestowano w Roll20',
          partial: 'Częściowo przetestowano w Roll20',
          source: 'Ze źródła karty',
          none: '—',
        },
        points: [
          'Wybierz kartę po jej nazwie w Ustawieniach gry. Karty spoza listy używają popularnych nazw pól experience, xp i level, albo ustaw System gry na custom.',
          'Przetestowano w Roll20 oznacza, że w grze Jumpgate zapisano XP na tej karcie, zadziałały jej własne obliczenia oraz sprawdzono pokonane stworzenia i powiadomienia o awansie.',
          'Karty Beacon, takie jak D&D 2024, wymagają Mod sandbox v1.5, a Mod nie może ustawić na nich 0 XP.',
          'Pathfinder 1E i Starfinder używają do powiadomień o awansie pola karty z XP do następnego poziomu. Gdy jest puste, Pathfinder korzysta ze średniego tempa, a Starfinder z własnej tabeli.',
          'WFRP 4E: każda nagroda jest dodawana jako wiersz na liście Experience na karcie, ale podczas testów karta nie przeliczyła swoich sum XP, więc sprawdź je na karcie.',
          'Savage Worlds, 13th Age, Cosmere i Call of Cthulhu nie mają XP, które mógłby zapisać Mod.',
        ],
      },
      settings: {
        heading: 'Ustawienia',
        intro:
          'Zmieniaj ustawienia na karcie ustawień lub poleceniem !lazyxp set <setting> <value>.',
        colKey: 'Ustawienie',
        colName: 'Nazwa',
        colDesc: 'Co robi',
      },
      upgrading: {
        heading: 'Aktualizacja z wersji 0.1',
        points: [
          'Ustawienia, XP sesji i dodatkowe XP poszczególnych postaci z wersji 0.1 są przenoszone przy pierwszym uruchomieniu wersji 1.0.',
          'Gracze lub postacie, które nie były aktywne, są pomijane w drużynie.',
          'Własna nazwa polecenia z wersji 0.1 nadal działa.',
          'Stare polecenia nadal działają:',
        ],
        colV1: '0.1',
        colV2: '1.0',
      },
      troubleshooting: {
        heading: 'Rozwiązywanie problemów',
        points: [
          'Nic nie zapisuje się na kartach D&D 2024: sprawdź, czy gra używa Mod sandbox v1.5 (!lazyxp status).',
          'Stworzenie daje 0 XP: jego karta nie ma XP ani poziomu wyzwania. Użyj Inna wartość lub !lazyxp kill --xp 100.',
          'Pokonania nie są zauważane: sprawdź, czy Pasek HP to pasek z punktami życia.',
          '!xp nic nie robi: używa go inny Mod XP. Użyj !lazyxp.',
        ],
      },
      languages: {
        heading: 'Języki',
        body: 'Wybierz język poleceniem !lazyxp lang. Karty na czacie i handouty zmieniają się od razu.',
        colLanguage: 'Język',
        colNative: 'Nazwa',
        colCode: 'Kod',
      },
      credits: {
        heading: 'Autorzy',
        original: 'Stworzył',
        maintainer: 'Przepisał i utrzymuje',
        support: 'Zgłoszenia błędów i pomysły są mile widziane na forum Roll20.',
      },
    },
  };

  var localePtPT = {
    titles: {
      ready: 'O LazyExperience está pronto.',
      help: 'Ajuda do LazyExperience',
      settings: 'Definições do LazyExperience',
      status: 'Estado do LazyExperience',
      roster: 'Grupo',
      language: 'Idioma',
      levelUp: 'Subiu de nível!',
      defeated: 'Criatura derrotada',
      xpAwarded: 'Experiência atribuída',
      sessionEnded: 'Sessão {number} terminada',
      yourXp: 'A sua experiência',
      pool: 'XP da sessão',
      bonus: 'XP de bónus',
      undo: 'Anular',
      log: 'Registo da sessão',
      partyXp: 'Experiência do grupo',
    },
    menu: {
      session: 'Sessão',
      pool: 'XP da sessão',
      payout: 'Pago',
      shares: 'Quotas',
      perShare: 'XP por quota',
      party: 'Grupo ({source})',
      noParty: 'Ainda não há ninguém no grupo. Abra o cartão do Grupo para adicionar personagens.',
      absentTag: '(ausente)',
      bonusTag: '(+{xp} de bónus)',
      levelTag: 'Nível {level}',
      shareTag: 'Quota {share}',
      rosterSource: 'Grupo de',
      excluded: 'Excluídos',
      blank: '(vazio)',
      groupXp: 'Experiência',
      groupParty: 'Grupo',
      groupKills: 'Criaturas derrotadas',
      groupSheet: 'Ficha de personagem',
    },
    buttons: {
      menu: 'Menu',
      help: 'Ajuda',
      settings: 'Definições',
      status: 'Estado',
      roster: 'Grupo',
      addXp: 'Adicionar XP',
      killSelected: 'Derrotado: selecionados',
      bonusSelected: 'Bónus: selecionados',
      giveSelected: 'Dar agora: selecionados',
      endSession: 'Terminar sessão',
      undo: 'Anular',
      show: 'XP do grupo',
      log: 'Registo da sessão',
      absent: 'Ausente',
      present: 'Presente',
      share: 'Quota',
      exclude: 'Excluir',
      include: 'Incluir',
      partyAdd: 'Adicionar selecionados ao grupo',
      partyRemove: 'Remover selecionados',
      addKill: 'Adicionar {xp} XP',
      otherXp: 'Outro valor',
      ignore: 'Ignorar',
    },
    prompts: {
      xp: 'XP',
      reason: 'Motivo (opcional)',
      share: 'Quota (1 = inteira, 0,5 = metade)',
      confirmEnd: 'Terminar a sessão e distribuir o XP?',
    },
    options: {
      yesNo: { yes: 'Sim', no: 'Não' },
      payout: { end: 'No fim da sessão', instant: 'De imediato' },
      roster: {
        auto: 'Automático',
        party: 'Grupo do Roll20',
        players: 'Personagens dos jogadores',
        manual: 'Escolhido pelo mestre',
      },
      killMode: {
        prompt: 'Perguntar ao mestre',
        auto: 'Adicionar automaticamente',
        off: 'Desligado',
      },
      announce: {
        public: 'Todos',
        whisper: 'Os jogadores envolvidos',
        gm: 'Só o mestre',
        off: 'Desligado',
      },
      levelNotice: {
        public: 'Todos',
        whisper: 'O jogador e o mestre',
        gm: 'Só o mestre',
        off: 'Desligado',
      },
      system: { auto: 'Detetar pela ficha' },
    },
    settings: {
      language: { label: 'Idioma', desc: 'Idioma dos cartões do chat e dos handouts.' },
      payout: {
        label: 'Pagar XP',
        desc: 'end: o XP acumula-se na reserva da sessão e é distribuído quando esta termina. instant: cada recompensa é dividida e paga de imediato.',
      },
      updateSheets: {
        label: 'Atualizar fichas',
        desc: 'Grava o XP nas fichas dos personagens. Se estiver desligado, os totais são apenas anunciados.',
      },
      system: {
        label: 'Sistema de jogo',
        desc: 'Que campos da ficha guardam o XP e o nível. auto escolhe o perfil pela ficha de cada personagem; custom usa as definições de campos personalizados.',
      },
      roster: {
        label: 'Grupo de',
        desc: 'auto: o grupo do Roll20, se houver alguém nele; caso contrário, os personagens controlados por jogadores. party, players ou manual escolhem uma das opções.',
      },
      absentShare: {
        label: 'Quota de ausentes',
        desc: 'Parte da quota que um personagem ausente ainda recebe, de 0% (nada) a 100% (inteira).',
      },
      extraShares: {
        label: 'Quotas extra',
        desc: 'Quotas para companheiros ou contratados que não têm ficha. O XP deles não é pago a ninguém.',
      },
      killMode: {
        label: 'Criaturas derrotadas',
        desc: 'prompt: pergunta ao mestre antes de adicionar o XP de uma criatura. auto: adiciona de imediato. off: não vigia os tokens.',
      },
      killBar: {
        label: 'Vigiar barra de PV',
        desc: 'Considera uma criatura derrotada quando a sua barra de PV desce para 0 ou menos.',
      },
      hpBar: {
        label: 'Barra de PV',
        desc: 'Qual a barra do token (1, 2 ou 3) que guarda os pontos de vida.',
      },
      killMarker: {
        label: 'Vigiar marcador',
        desc: 'Considera uma criatura derrotada quando o marcador de derrotado é colocado no seu token.',
      },
      marker: {
        label: 'Marcador de derrotado',
        desc: 'O marcador que significa derrotado: um nome incorporado, como dead, ou o nome de um marcador personalizado.',
      },
      killDeathTracker: {
        label: 'Usar o DeathTracker',
        desc: 'Considera uma criatura derrotada quando o DeathTracker 1.0 ou posterior a marca como morta.',
      },
      announce: {
        label: 'Mensagens de XP',
        desc: 'Quem vê as recompensas de XP e o resumo de fim de sessão: public, whisper (jogadores envolvidos e mestre), gm ou off.',
      },
      levelNotice: {
        label: 'Avisos de nível',
        desc: 'Quem vê os avisos de subida de nível: public, whisper (o jogador e o mestre), gm ou off.',
      },
      customXp: {
        label: 'Campo de XP personalizado',
        desc: 'Campo da ficha com o XP do personagem quando o Sistema de jogo é custom. Uma lista tenta cada nome por ordem.',
      },
      customLevel: {
        label: 'Campo de nível personalizado',
        desc: 'Campo da ficha com o nível do personagem.',
      },
      customNpcXp: {
        label: 'Campo de XP de criatura personalizado',
        desc: 'Campo da ficha com o XP que uma criatura vale.',
      },
      customNpcCr: {
        label: 'Campo de desafio personalizado',
        desc: 'Campo da ficha com o nível de desafio da criatura, usado quando esta não tem valor de XP.',
      },
      customLevels: {
        label: 'Tabela de níveis personalizada',
        desc: 'XP necessário para cada nível, a partir do nível 1, como 0,300,900,2700. Se ficar em branco, desliga os avisos de nível nas fichas custom.',
      },
    },
    roster: {
      explain: {
        party: 'Os personagens assinalados como Party Member no Roll20 dividem o XP.',
        players:
          'Os personagens controlados por um jogador dividem o XP. Assinale Party Member nos personagens para usar o grupo do Roll20.',
        manual: 'Só os personagens que incluir dividem o XP.',
      },
      selectHint: 'Selecione primeiro os tokens para os adicionar ao grupo ou os remover.',
    },
    kills: {
      prompt: '{name} foi derrotado. Adicionar {xp} XP à sessão?',
      noXp: '{name} foi derrotado, mas a ficha não tem valor de XP.',
      reason: 'Derrotou {name}',
      result: {
        prompted: 'perguntado',
        added: 'adicionado',
        counted: 'já contado nesta sessão',
        noXp: 'sem XP na ficha: use --xp',
        notCreature: 'não é uma criatura (sem ficha ou está no grupo)',
      },
    },
    levels: {
      reached: '{name} tem XP suficiente para o nível {level}!',
      sheetButton: 'Use o botão de subir de nível na ficha do personagem.',
      updateSheet: 'Atualize o nível na ficha do personagem.',
      pf2: 'Suba o nível na ficha e retire 1000 do XP.',
      spend: 'Gaste o XP e suba o nível na ficha.',
    },
    instant: {
      everyone: 'Todos os membros do grupo ganham {xp} XP.',
      bonus: '{names} ganham {xp} XP.',
    },
    end: {
      nothing: 'Não foi atribuído nenhum XP nesta sessão.',
      playerLine: '{name} ganha {xp} XP nesta sessão.',
      playerLineTotal: '{name} ganha {xp} XP nesta sessão, perfazendo {total} XP no total.',
      levelLine: '{name} chegou ao nível {level}.',
      remainder: '{xp} XP não puderam ser divididos por igual e transitam para a próxima sessão.',
    },
    show: {
      noXp: 'sem XP na ficha',
      next: 'próximo nível aos {xp}',
    },
    awardKinds: { pool: 'XP da sessão', bonus: 'XP de bónus', give: 'XP dado' },
    messages: {
      saved: 'Guardado.',
      commands: 'Comandos: {commands}',
      aliasTaken: '{alias} está reservado a {mods}. Use !lazyxp.',
      migrated:
        'As definições, o XP da sessão e o XP extra do seu LazyExperience 0.1 foram trazidos.',
      handouts: 'Os handouts Help, Command Deck e Session Log foram reconstruídos.',
      noLog: 'Ainda não terminou nenhuma sessão, por isso não há Registo da sessão.',
      poolAdded: '{xp} XP adicionados à sessão.',
      bonusAdded: '{xp} XP de bónus para {names}.',
      killAdded: '{xp} XP de {name} adicionados à sessão.',
      killGone: 'Essa derrota já foi adicionada ou já não está pendente.',
      undone: '{xp} XP anulados ({reason}).',
      nothingToUndo: 'Não há nada para anular nesta sessão.',
      nothingToUndoInstant: 'O XP já foi pago. Use give com um valor negativo para corrigir.',
      sessionReset: 'O XP da sessão e os bónus foram limpos. Nada foi pago.',
      absent: 'Marcados como ausentes nesta sessão: {names}.',
      present: 'Marcados como presentes: {names}.',
      party: {
        add: 'Adicionados ao grupo: {names}.',
        remove: 'Removidos do grupo: {names}.',
      },
    },
    warnings: {
      sandbox:
        'Alguns personagens usam uma ficha Beacon (como a de D&D 2024), que o Mod sandbox só consegue ler e gravar na v1.5. Escolha o sandbox v1.5 nas definições de Mods do jogo.',
      partyLegacy:
        'O grupo do Roll20 é uma funcionalidade do Jumpgate; neste jogo o mod mantém a sua própria lista de grupo.',
      nobodyToPay: 'Não há ninguém no grupo, por isso {xp} XP ficam guardados para mais tarde.',
      write: {
        zero: '{name}: a ficha não pode ser definida com 0 XP por um Mod. Altere-a na ficha.',
        sandbox: '{name}: esta ficha precisa do Mod sandbox v1.5 para atualizar o XP.',
        xpless: '{name}: este sistema de jogo não usa XP (ou a própria ficha calcula-o).',
        noField:
          '{name}: não se conhece nenhum campo de XP para esta ficha. Defina o Sistema de jogo como custom e indique o campo.',
        error:
          '{name}: não foi possível atualizar a ficha com {xp} XP. Consulte a consola de Mods.',
      },
    },
    errors: {
      gmOnly: 'Só o mestre pode usar os comandos do LazyExperience.',
      failed: 'Algo correu mal: {message}',
      unknownCommand: 'Comando desconhecido “{name}”.',
      helpHint: 'Escreva {command} help para ver os comandos.',
      unknownSetting: 'Definição desconhecida “{name}”.',
      settingsHint: 'Abra o cartão de definições para ver as opções.',
      badValue: '“{value}” não é um valor válido para {name}.',
      badXp: 'Indique o XP como um número inteiro, como 250.',
      badShare: 'Indique a quota como um número de 0 a 10, como 0,5 ou 50%.',
      noCharacters: 'Selecione tokens que representem personagens ou use --ids.',
      noTokens: 'Selecione primeiro os tokens derrotados ou use --ids.',
    },
    status: {
      version: 'Versão',
      sandbox: 'Mod sandbox',
      beacon: 'Fichas Beacon legíveis',
      commands: 'Comandos',
      profiles: 'Sistemas de jogo em uso',
      characters: '{count} personagens',
      handouts: 'Consulte os handouts {help} e {deck}.',
    },
    log: {
      title: 'Registo da sessão',
      sessionHeading: 'Sessão {number} — {date}',
      colCharacter: 'Personagem',
      colXp: 'XP',
      awards: 'Recompensas',
      levelUps: 'Níveis:',
      empty: 'Ainda não terminou nenhuma sessão.',
    },
    help: {
      menu: 'Mostra o menu principal.',
      add: 'Adiciona XP à reserva da sessão, com um motivo opcional.',
      bonus: 'Dá XP de bónus aos personagens selecionados, além da quota deles.',
      give: 'Paga XP de imediato aos personagens selecionados.',
      kill: 'Conta os tokens selecionados como derrotados e adiciona o XP deles.',
      killConfirm:
        'Adiciona o XP de uma criatura derrotada (o botão do aviso), opcionalmente com outro valor.',
      absent: 'Marca os personagens selecionados como ausentes nesta sessão.',
      present: 'Volta a marcar os personagens selecionados como presentes.',
      share: 'Define a quota dos personagens selecionados (1 = inteira).',
      exclude: 'Exclui personagens do grupo ou volta a incluí-los.',
      undo: 'Anula a última recompensa que ainda não foi paga.',
      end: 'Termina a sessão: paga o XP, anuncia-o e regista-o.',
      resetSession: 'Limpa o XP da sessão sem o pagar.',
      show: 'Mostra o XP e o nível de cada membro do grupo, segundo a ficha.',
      roster: 'Mostra o cartão do grupo.',
      party:
        'Assinala ou desassinala a caixa Party Member do Roll20 para os personagens selecionados.',
      settings: 'Mostra o cartão de definições.',
      set: 'Altera uma definição.',
      lang: 'Escolhe o idioma.',
      status: 'Mostra o sandbox, os comandos e os sistemas de jogo em uso.',
      log: 'Ligação para o handout Session Log.',
      journal: 'Reconstrói os handouts.',
      help: 'Mostra esta ajuda.',
      handouts: 'Mais nos handouts {help} e {deck}.',
    },
    deck: {
      session: 'Sessão',
      sessionDesc: 'Adicione XP à sessão, consulte o grupo e termine a sessão.',
      selected: 'Tokens selecionados',
      selectedDesc: 'Selecione primeiro os tokens no mapa.',
      party: 'Grupo',
      partyDesc: 'Quem divide o XP.',
      tools: 'Ferramentas',
      toolsDesc: 'Definições, estado e ajuda.',
      footer:
        'Os botões executam comandos do LazyExperience. Consulte o handout {help} para mais detalhes.',
    },
    handout: {
      versionLabel: 'Versão',
      subtitle: 'Experiência da sessão, dividida com justiça, em qualquer ficha',
      footer: 'Os botões de todos os comandos estão no handout {deck}.',
      overview: {
        heading: 'Visão geral',
        body: 'O LazyExperience reúne os pontos de experiência ganhos durante uma sessão, divide-os pelo grupo e grava-os nas fichas dos personagens. Lê e grava a ficha de D&D 2024, bem como fichas mais antigas e de outros sistemas, usa o próprio grupo do Roll20, repara nas criaturas derrotadas, trata dos jogadores ausentes e do XP de bónus, anuncia subidas de nível e mantém um registo de cada sessão.',
      },
      quickStart: {
        heading: 'Início rápido',
        steps: [
          'Assinale Party Member em cada personagem de jogador (nas definições da janela do personagem) ou deixe como está: são usados os personagens controlados por jogadores.',
          'Escreva !lazyxp para abrir o menu.',
          'Quando o grupo derrota uma criatura, a barra de PV a chegar a 0 pergunta-lhe se quer adicionar o XP dela. Também pode selecionar tokens e carregar em Derrotado: selecionados.',
          'Adicione XP por qualquer outra coisa com Adicionar XP e XP de bónus para um personagem com Bónus: selecionados.',
          'Marque como Ausente os jogadores que faltaram à sessão.',
          'Carregue em Terminar sessão. A quota de cada um é gravada nas fichas, anunciada e adicionada ao handout Session Log.',
        ],
      },
      commands: {
        heading: 'Comandos',
        intro:
          'Todos os comandos começam por !lazyxp; {long} também funciona, tal como {short} enquanto nenhum outro Mod de XP o usar. Só o mestre os pode usar.',
        targets:
          'Os comandos para personagens usam os tokens selecionados, ou --ids seguido de IDs de personagens ou tokens separados por vírgulas.',
        colCommand: 'Comando',
        colDesc: 'O que faz',
      },
      party: {
        heading: 'O grupo',
        points: [
          'Automático: quando algum personagem está assinalado como Party Member no Roll20 (Jumpgate), o grupo do Roll20 divide o XP; caso contrário, divide-o todo o personagem controlado por um jogador.',
          'Os personagens controlados apenas por “Todos os jogadores”, como tokens auxiliares, não contam.',
          'Adicionar ao grupo e Remover do grupo assinalam ou desassinalam Party Member nos personagens selecionados.',
          'Excluir tira um personagem do grupo em definitivo; Incluir volta a pô-lo lá.',
          'Um personagem controlado por vários jogadores conta uma só vez.',
        ],
      },
      splitting: {
        heading: 'Divisão do XP',
        points: [
          'O XP da sessão é dividido pelo número de quotas: uma por membro do grupo, mais as quotas extra.',
          'Os personagens ausentes recebem a definição Quota de ausentes (0% por predefinição). A ausência dura uma sessão.',
          'Um personagem pode ter uma quota diferente, como 0,5 para um ajudante.',
          'O XP de bónus vai para os personagens escolhidos, além da quota deles.',
          'O XP que não se divide por igual transita para a próxima sessão.',
          'Com Pagar XP em instant, cada recompensa é dividida e paga logo.',
        ],
      },
      kills: {
        heading: 'Criaturas derrotadas',
        points: [
          'Uma criatura conta como derrotada quando a sua barra de PV desce a 0, quando o marcador de derrotado é colocado ou quando o DeathTracker a marca como morta.',
          'As alterações feitas pelo TokenMod, pela ficha ou por outros Mods através do atributo ligado também são detetadas.',
          'Só contam os tokens de personagens fora do grupo que nenhum jogador controla, e cada token apenas uma vez por sessão.',
          'O XP vem da ficha: o valor de XP da criatura ou o seu nível de desafio.',
          'Perguntar ao mestre (a predefinição) sussurra um aviso com Adicionar, Outro valor e Ignorar. Adicionar automaticamente dispensa o aviso.',
        ],
      },
      levels: {
        heading: 'Subidas de nível',
        points: [
          'Depois de o XP ser gravado, o LazyExperience consulta a tabela de níveis do sistema e avisa quando um personagem tem XP suficiente para um novo nível.',
          'Na ficha de D&D 2024, o jogador carrega então no botão de subir de nível da ficha.',
        ],
      },
      systems: {
        heading: 'Sistemas de jogo',
        intro:
          'O LazyExperience escolhe um perfil pela ficha de cada personagem. Defina o Sistema de jogo para forçar um, ou custom para indicar você mesmo os campos.',
        colSystem: 'Sistema',
        colId: 'ID',
        colSheets: 'Fichas',
        colChecked: 'Verificado',
        verified: {
          live: 'Testado no Roll20',
          partial: 'Testado parcialmente no Roll20',
          source: 'Do código da ficha',
          none: '—',
        },
        points: [
          'Escolha a ficha pelo nome nas Definições do jogo. As fichas que não constam da lista usam os nomes de campo comuns experience, xp e level, ou defina o Sistema de jogo como custom.',
          'Testado no Roll20 significa que o XP foi escrito nessa ficha num jogo Jumpgate, os cálculos da própria ficha correram, e as criaturas derrotadas e os avisos de nível foram verificados.',
          'As fichas Beacon, como a de D&D 2024, exigem o Mod sandbox v1.5, e um Mod não as pode definir com 0 XP.',
          'Pathfinder 1E e Starfinder usam a caixa de XP para o nível seguinte da ficha para os avisos de nível. Quando está vazia, o Pathfinder usa a progressão média e o Starfinder a sua própria tabela.',
          'WFRP 4E: cada atribuição é adicionada como uma linha na lista Experience da ficha, mas nos testes a ficha não recalculou os totais de XP, por isso verifique-os na ficha.',
          'Savage Worlds, 13th Age, Cosmere e Call of Cthulhu não têm XP para um Mod escrever.',
        ],
      },
      settings: {
        heading: 'Definições',
        intro: 'Altere as definições no cartão de definições ou com !lazyxp set <setting> <value>.',
        colKey: 'Definição',
        colName: 'Nome',
        colDesc: 'O que faz',
      },
      upgrading: {
        heading: 'Atualizar a partir da 0.1',
        points: [
          'As definições, o XP da sessão e o XP extra por personagem da 0.1 são trazidos na primeira vez que a 1.0 arranca.',
          'Os jogadores ou personagens que não estavam ativos ficam de fora do grupo.',
          'Um nome de comando personalizado da 0.1 continua a funcionar.',
          'Os comandos antigos continuam a funcionar:',
        ],
        colV1: '0.1',
        colV2: '1.0',
      },
      troubleshooting: {
        heading: 'Resolução de problemas',
        points: [
          'Nada é gravado nas fichas de D&D 2024: verifique se o jogo usa o Mod sandbox v1.5 (!lazyxp status).',
          'Uma criatura dá 0 XP: a ficha dela não tem XP nem nível de desafio. Use Outro valor ou !lazyxp kill --xp 100.',
          'As derrotas não são detetadas: verifique se a Barra de PV é a barra que guarda os pontos de vida.',
          '!xp não faz nada: outro Mod de XP usa-o. Use !lazyxp.',
        ],
      },
      languages: {
        heading: 'Idiomas',
        body: 'Escolha um idioma com !lazyxp lang. Os cartões do chat e os handouts mudam logo.',
        colLanguage: 'Idioma',
        colNative: 'Nome',
        colCode: 'Código',
      },
      credits: {
        heading: 'Créditos',
        original: 'Criado por',
        maintainer: 'Reescrito e mantido por',
        support: 'Relatos de erros e ideias são bem-vindos no fórum do Roll20.',
      },
    },
  };

  var localePtBR = {
    titles: {
      ready: 'O LazyExperience está pronto.',
      help: 'Ajuda do LazyExperience',
      settings: 'Configurações do LazyExperience',
      status: 'Status do LazyExperience',
      roster: 'Grupo',
      language: 'Idioma',
      levelUp: 'Subiu de nível!',
      defeated: 'Criatura derrotada',
      xpAwarded: 'Experiência concedida',
      sessionEnded: 'Sessão {number} encerrada',
      yourXp: 'Sua experiência',
      pool: 'XP da sessão',
      bonus: 'XP bônus',
      undo: 'Desfazer',
      log: 'Registro da sessão',
      partyXp: 'Experiência do grupo',
    },
    menu: {
      session: 'Sessão',
      pool: 'XP da sessão',
      payout: 'Pago',
      shares: 'Cotas',
      perShare: 'XP por cota',
      party: 'Grupo ({source})',
      noParty: 'Ninguém está no grupo ainda. Abra o cartão do Grupo para adicionar personagens.',
      absentTag: '(ausente)',
      bonusTag: '(+{xp} de bônus)',
      levelTag: 'Nível {level}',
      shareTag: 'Cota {share}',
      rosterSource: 'Grupo de',
      excluded: 'Excluídos',
      blank: '(vazio)',
      groupXp: 'Experiência',
      groupParty: 'Grupo',
      groupKills: 'Criaturas derrotadas',
      groupSheet: 'Ficha de personagem',
    },
    buttons: {
      menu: 'Menu',
      help: 'Ajuda',
      settings: 'Configurações',
      status: 'Status',
      roster: 'Grupo',
      addXp: 'Adicionar XP',
      killSelected: 'Derrotado: selecionados',
      bonusSelected: 'Bônus: selecionados',
      giveSelected: 'Dar agora: selecionados',
      endSession: 'Encerrar sessão',
      undo: 'Desfazer',
      show: 'XP do grupo',
      log: 'Registro da sessão',
      absent: 'Ausente',
      present: 'Presente',
      share: 'Cota',
      exclude: 'Excluir',
      include: 'Incluir',
      partyAdd: 'Adicionar selecionados ao grupo',
      partyRemove: 'Remover selecionados',
      addKill: 'Adicionar {xp} XP',
      otherXp: 'Outro valor',
      ignore: 'Ignorar',
    },
    prompts: {
      xp: 'XP',
      reason: 'Motivo (opcional)',
      share: 'Cota (1 = inteira, 0,5 = metade)',
      confirmEnd: 'Encerrar a sessão e distribuir o XP?',
    },
    options: {
      yesNo: { yes: 'Sim', no: 'Não' },
      payout: { end: 'No fim da sessão', instant: 'Imediatamente' },
      roster: {
        auto: 'Automático',
        party: 'Grupo do Roll20',
        players: 'Personagens dos jogadores',
        manual: 'Escolhido pelo mestre',
      },
      killMode: {
        prompt: 'Perguntar ao mestre',
        auto: 'Adicionar automaticamente',
        off: 'Desligado',
      },
      announce: {
        public: 'Todos',
        whisper: 'Os jogadores envolvidos',
        gm: 'Só o mestre',
        off: 'Desligado',
      },
      levelNotice: {
        public: 'Todos',
        whisper: 'O jogador e o mestre',
        gm: 'Só o mestre',
        off: 'Desligado',
      },
      system: { auto: 'Detectar pela ficha' },
    },
    settings: {
      language: { label: 'Idioma', desc: 'Idioma dos cartões do chat e dos handouts.' },
      payout: {
        label: 'Pagar XP',
        desc: 'end: o XP se acumula na reserva da sessão e é distribuído quando ela termina. instant: cada recompensa é dividida e paga imediatamente.',
      },
      updateSheets: {
        label: 'Atualizar fichas',
        desc: 'Grava o XP nas fichas dos personagens. Se desligado, os totais são apenas anunciados.',
      },
      system: {
        label: 'Sistema de jogo',
        desc: 'Quais campos da ficha guardam XP e nível. auto escolhe o perfil pela ficha de cada personagem; custom usa as configurações de campos personalizados.',
      },
      roster: {
        label: 'Grupo de',
        desc: 'auto: o grupo do Roll20, se houver alguém nele; senão, os personagens controlados por jogadores. party, players ou manual escolhem uma das opções.',
      },
      absentShare: {
        label: 'Cota de ausentes',
        desc: 'Parte da cota que um personagem ausente ainda recebe, de 0% (nada) a 100% (inteira).',
      },
      extraShares: {
        label: 'Cotas extras',
        desc: 'Cotas para companheiros ou contratados que não têm ficha. O XP deles não é pago a ninguém.',
      },
      killMode: {
        label: 'Criaturas derrotadas',
        desc: 'prompt: pergunta ao mestre antes de adicionar o XP de uma criatura. auto: adiciona imediatamente. off: não observa tokens.',
      },
      killBar: {
        label: 'Observar barra de PV',
        desc: 'Considera uma criatura derrotada quando sua barra de PV chega a 0 ou menos.',
      },
      hpBar: {
        label: 'Barra de PV',
        desc: 'Qual barra do token (1, 2 ou 3) guarda os pontos de vida.',
      },
      killMarker: {
        label: 'Observar marcador',
        desc: 'Considera uma criatura derrotada quando o marcador de derrotado é colocado no token dela.',
      },
      marker: {
        label: 'Marcador de derrotado',
        desc: 'O marcador que significa derrotado: um nome embutido, como dead, ou o nome de um marcador personalizado.',
      },
      killDeathTracker: {
        label: 'Usar DeathTracker',
        desc: 'Considera uma criatura derrotada quando o DeathTracker 1.0 ou posterior a marca como morta.',
      },
      announce: {
        label: 'Mensagens de XP',
        desc: 'Quem vê as recompensas de XP e o resumo de fim de sessão: public, whisper (jogadores envolvidos e mestre), gm ou off.',
      },
      levelNotice: {
        label: 'Avisos de nível',
        desc: 'Quem vê os avisos de subida de nível: public, whisper (o jogador e o mestre), gm ou off.',
      },
      customXp: {
        label: 'Campo de XP personalizado',
        desc: 'Campo da ficha com o XP do personagem quando o Sistema de jogo é custom. Uma lista tenta cada nome em ordem.',
      },
      customLevel: {
        label: 'Campo de nível personalizado',
        desc: 'Campo da ficha com o nível do personagem.',
      },
      customNpcXp: {
        label: 'Campo de XP de criatura personalizado',
        desc: 'Campo da ficha com o XP que uma criatura vale.',
      },
      customNpcCr: {
        label: 'Campo de desafio personalizado',
        desc: 'Campo da ficha com o nível de desafio da criatura, usado quando ela não tem valor de XP.',
      },
      customLevels: {
        label: 'Tabela de níveis personalizada',
        desc: 'XP necessário para cada nível, a partir do nível 1, como 0,300,900,2700. Em branco, desliga os avisos de nível nas fichas custom.',
      },
    },
    roster: {
      explain: {
        party: 'Os personagens marcados como Party Member no Roll20 dividem o XP.',
        players:
          'Os personagens controlados por um jogador dividem o XP. Marque Party Member nos personagens para usar o grupo do Roll20.',
        manual: 'Só os personagens que você incluir dividem o XP.',
      },
      selectHint: 'Selecione tokens primeiro para adicioná-los ao grupo ou removê-los.',
    },
    kills: {
      prompt: '{name} foi derrotado. Adicionar {xp} XP à sessão?',
      noXp: '{name} foi derrotado, mas a ficha não tem valor de XP.',
      reason: 'Derrotou {name}',
      result: {
        prompted: 'perguntado',
        added: 'adicionado',
        counted: 'já contado nesta sessão',
        noXp: 'sem XP na ficha: use --xp',
        notCreature: 'não é uma criatura (sem ficha ou está no grupo)',
      },
    },
    levels: {
      reached: '{name} tem XP suficiente para o nível {level}!',
      sheetButton: 'Use o botão de subir de nível na ficha do personagem.',
      updateSheet: 'Atualize o nível na ficha do personagem.',
      pf2: 'Suba o nível na ficha e tire 1.000 do XP.',
      spend: 'Gaste o XP e suba o nível na ficha.',
    },
    instant: {
      everyone: 'Todos no grupo ganham {xp} XP.',
      bonus: '{names} ganham {xp} XP.',
    },
    end: {
      nothing: 'Nenhum XP foi concedido nesta sessão.',
      playerLine: '{name} ganha {xp} XP nesta sessão.',
      playerLineTotal: '{name} ganha {xp} XP nesta sessão, totalizando {total} XP.',
      levelLine: '{name} chegou ao nível {level}.',
      remainder: '{xp} XP não puderam ser divididos igualmente e passam para a próxima sessão.',
    },
    show: {
      noXp: 'sem XP na ficha',
      next: 'próximo nível em {xp}',
    },
    awardKinds: { pool: 'XP da sessão', bonus: 'XP bônus', give: 'XP dado' },
    messages: {
      saved: 'Salvo.',
      commands: 'Comandos: {commands}',
      aliasTaken: '{alias} está reservado a {mods}. Use !lazyxp.',
      migrated:
        'As configurações, o XP da sessão e o XP extra do seu LazyExperience 0.1 foram trazidos.',
      handouts: 'Os handouts Help, Command Deck e Session Log foram reconstruídos.',
      noLog: 'Nenhuma sessão terminou ainda, então não há Registro da sessão.',
      poolAdded: '{xp} XP adicionados à sessão.',
      bonusAdded: '{xp} XP de bônus para {names}.',
      killAdded: '{xp} XP de {name} adicionados à sessão.',
      killGone: 'Essa derrota já foi adicionada ou não está mais pendente.',
      undone: '{xp} XP desfeitos ({reason}).',
      nothingToUndo: 'Não há nada para desfazer nesta sessão.',
      nothingToUndoInstant: 'O XP já foi pago. Use give com um valor negativo para corrigir.',
      sessionReset: 'O XP da sessão e os bônus foram apagados. Nada foi pago.',
      absent: 'Marcados como ausentes nesta sessão: {names}.',
      present: 'Marcados como presentes: {names}.',
      party: {
        add: 'Adicionados ao grupo: {names}.',
        remove: 'Removidos do grupo: {names}.',
      },
    },
    warnings: {
      sandbox:
        'Alguns personagens usam uma ficha Beacon (como D&D 2024), que o Mod sandbox só consegue ler e gravar na v1.5. Escolha o sandbox v1.5 nas configurações de Mod do jogo.',
      partyLegacy:
        'O grupo do Roll20 é um recurso do Jumpgate; neste jogo o mod mantém sua própria lista de grupo.',
      nobodyToPay: 'Ninguém está no grupo, então {xp} XP foram guardados para depois.',
      write: {
        zero: '{name}: a ficha não pode ser definida com 0 XP por um Mod. Altere na ficha.',
        sandbox: '{name}: esta ficha precisa do Mod sandbox v1.5 para atualizar o XP.',
        xpless: '{name}: este sistema de jogo não usa XP (ou a própria ficha calcula).',
        noField:
          '{name}: nenhum campo de XP é conhecido para esta ficha. Defina Sistema de jogo como custom e informe o campo.',
        error: '{name}: não foi possível atualizar a ficha com {xp} XP. Veja o console de Mods.',
      },
    },
    errors: {
      gmOnly: 'Só o mestre pode usar os comandos do LazyExperience.',
      failed: 'Algo deu errado: {message}',
      unknownCommand: 'Comando desconhecido “{name}”.',
      helpHint: 'Digite {command} help para ver os comandos.',
      unknownSetting: 'Configuração desconhecida “{name}”.',
      settingsHint: 'Abra o cartão de configurações para ver as opções.',
      badValue: '“{value}” não é um valor válido para {name}.',
      badXp: 'Informe o XP como um número inteiro, como 250.',
      badShare: 'Informe a cota como um número de 0 a 10, como 0,5 ou 50%.',
      noCharacters: 'Selecione tokens que representem personagens ou use --ids.',
      noTokens: 'Selecione primeiro os tokens derrotados ou use --ids.',
    },
    status: {
      version: 'Versão',
      sandbox: 'Mod sandbox',
      beacon: 'Fichas Beacon legíveis',
      commands: 'Comandos',
      profiles: 'Sistemas de jogo em uso',
      characters: '{count} personagens',
      handouts: 'Veja os handouts {help} e {deck}.',
    },
    log: {
      title: 'Registro da sessão',
      sessionHeading: 'Sessão {number} — {date}',
      colCharacter: 'Personagem',
      colXp: 'XP',
      awards: 'Recompensas',
      levelUps: 'Níveis:',
      empty: 'Nenhuma sessão terminou ainda.',
    },
    help: {
      menu: 'Mostra o menu principal.',
      add: 'Adiciona XP à reserva da sessão, com um motivo opcional.',
      bonus: 'Dá XP de bônus aos personagens selecionados, além da cota deles.',
      give: 'Paga XP imediatamente aos personagens selecionados.',
      kill: 'Conta os tokens selecionados como derrotados e adiciona o XP deles.',
      killConfirm:
        'Adiciona o XP de uma criatura derrotada (o botão do aviso), opcionalmente com outro valor.',
      absent: 'Marca os personagens selecionados como ausentes nesta sessão.',
      present: 'Marca os personagens selecionados como presentes de novo.',
      share: 'Define a cota dos personagens selecionados (1 = inteira).',
      exclude: 'Exclui personagens do grupo ou os inclui de novo.',
      undo: 'Desfaz a última recompensa que ainda não foi paga.',
      end: 'Encerra a sessão: paga o XP, anuncia e registra.',
      resetSession: 'Apaga o XP da sessão sem pagá-lo.',
      show: 'Mostra o XP e o nível de cada membro do grupo, conforme a ficha.',
      roster: 'Mostra o cartão do grupo.',
      party: 'Marca ou desmarca a caixa Party Member do Roll20 para os personagens selecionados.',
      settings: 'Mostra o cartão de configurações.',
      set: 'Altera uma configuração.',
      lang: 'Escolhe o idioma.',
      status: 'Mostra o sandbox, os comandos e os sistemas de jogo em uso.',
      log: 'Link para o handout Session Log.',
      journal: 'Reconstrói os handouts.',
      help: 'Mostra esta ajuda.',
      handouts: 'Mais nos handouts {help} e {deck}.',
    },
    deck: {
      session: 'Sessão',
      sessionDesc: 'Adicione XP à sessão, confira o grupo e encerre a sessão.',
      selected: 'Tokens selecionados',
      selectedDesc: 'Selecione primeiro os tokens no mapa.',
      party: 'Grupo',
      partyDesc: 'Quem divide o XP.',
      tools: 'Ferramentas',
      toolsDesc: 'Configurações, status e ajuda.',
      footer: 'Os botões executam comandos do LazyExperience. Veja o handout {help} para detalhes.',
    },
    handout: {
      versionLabel: 'Versão',
      subtitle: 'Experiência da sessão, dividida com justiça, em qualquer ficha',
      footer: 'Os botões de todos os comandos estão no handout {deck}.',
      overview: {
        heading: 'Visão geral',
        body: 'O LazyExperience reúne os pontos de experiência ganhos durante uma sessão, divide-os entre o grupo e os grava nas fichas dos personagens. Ele lê e grava a ficha de D&D 2024, além de fichas antigas e de outros sistemas, usa o próprio grupo do Roll20, percebe criaturas derrotadas, trata jogadores ausentes e XP de bônus, anuncia subidas de nível e mantém um registro de cada sessão.',
      },
      quickStart: {
        heading: 'Início rápido',
        steps: [
          'Marque Party Member em cada personagem de jogador (nas configurações da janela do personagem) ou deixe assim: os personagens controlados por jogadores são usados.',
          'Digite !lazyxp para abrir o menu.',
          'Quando o grupo derrota uma criatura, a barra de PV chegando a 0 pergunta se você quer adicionar o XP dela. Você também pode selecionar tokens e clicar em Derrotado: selecionados.',
          'Adicione XP por qualquer outra coisa com Adicionar XP e XP de bônus para um personagem com Bônus: selecionados.',
          'Marque como Ausente os jogadores que faltaram à sessão.',
          'Clique em Encerrar sessão. A cota de cada um é gravada nas fichas, anunciada e adicionada ao handout Session Log.',
        ],
      },
      commands: {
        heading: 'Comandos',
        intro:
          'Todo comando começa com !lazyxp; {long} também funciona, assim como {short} enquanto nenhum outro Mod de XP o usar. Só o mestre pode usá-los.',
        targets:
          'Os comandos para personagens usam os tokens selecionados, ou --ids seguido de IDs de personagens ou tokens separados por vírgulas.',
        colCommand: 'Comando',
        colDesc: 'O que faz',
      },
      party: {
        heading: 'O grupo',
        points: [
          'Automático: quando algum personagem está marcado como Party Member no Roll20 (Jumpgate), o grupo do Roll20 divide o XP; senão, todo personagem controlado por um jogador divide.',
          'Personagens controlados apenas por “Todos os jogadores”, como tokens auxiliares, não são contados.',
          'Adicionar ao grupo e Remover do grupo marcam ou desmarcam Party Member nos personagens selecionados.',
          'Excluir tira um personagem do grupo em definitivo; Incluir o traz de volta.',
          'Um personagem controlado por vários jogadores conta uma só vez.',
        ],
      },
      splitting: {
        heading: 'Divisão do XP',
        points: [
          'O XP da sessão é dividido pelo número de cotas: uma por membro do grupo, mais as cotas extras.',
          'Personagens ausentes recebem a configuração Cota de ausentes (0% por padrão). A ausência vale por uma sessão.',
          'Um personagem pode ter uma cota diferente, como 0,5 para um ajudante.',
          'O XP de bônus vai para os personagens escolhidos, além da cota deles.',
          'O XP que não se divide igualmente passa para a próxima sessão.',
          'Com Pagar XP em instant, cada recompensa é dividida e paga na hora.',
        ],
      },
      kills: {
        heading: 'Criaturas derrotadas',
        points: [
          'Uma criatura conta como derrotada quando sua barra de PV chega a 0, quando o marcador de derrotado é colocado ou quando o DeathTracker a marca como morta.',
          'Mudanças feitas pelo TokenMod, pela ficha ou por outros Mods por meio do atributo vinculado também são percebidas.',
          'Só contam os tokens de personagens fora do grupo que nenhum jogador controla, e cada token uma única vez por sessão.',
          'O XP vem da ficha: o valor de XP da criatura ou seu nível de desafio.',
          'Perguntar ao mestre (o padrão) sussurra um aviso com Adicionar, Outro valor e Ignorar. Adicionar automaticamente dispensa o aviso.',
        ],
      },
      levels: {
        heading: 'Subidas de nível',
        points: [
          'Depois que o XP é gravado, o LazyExperience consulta a tabela de níveis do sistema e avisa quando um personagem tem XP suficiente para um novo nível.',
          'Na ficha de D&D 2024, o jogador então clica no botão de subir de nível da ficha.',
        ],
      },
      systems: {
        heading: 'Sistemas de jogo',
        intro:
          'O LazyExperience escolhe um perfil pela ficha de cada personagem. Defina Sistema de jogo para forçar um, ou custom para informar os campos você mesmo.',
        colSystem: 'Sistema',
        colId: 'ID',
        colSheets: 'Fichas',
        colChecked: 'Verificado',
        verified: {
          live: 'Testado no Roll20',
          partial: 'Parcialmente testado no Roll20',
          source: 'Do código da ficha',
          none: '—',
        },
        points: [
          'Escolha a ficha pelo nome nas Configurações do jogo. As fichas não listadas usam os nomes de campo comuns experience, xp e level, ou defina o Sistema de jogo como custom.',
          'Testado no Roll20 significa que o XP foi escrito nessa ficha em um jogo Jumpgate, os cálculos da própria ficha rodaram, e as criaturas derrotadas e os avisos de nível foram verificados.',
          'Fichas Beacon, como a de D&D 2024, exigem o Mod sandbox v1.5, e um Mod não pode defini-las com 0 XP.',
          'Pathfinder 1E e Starfinder usam a caixa de XP para o próximo nível da ficha nos avisos de nível. Quando ela está vazia, o Pathfinder usa a progressão média e o Starfinder a sua própria tabela.',
          'WFRP 4E: cada concessão é adicionada como uma linha na lista Experience da ficha, mas nos testes a ficha não recalculou os totais de XP, então confira-os na ficha.',
          'Savage Worlds, 13th Age, Cosmere e Call of Cthulhu não têm XP para um Mod escrever.',
        ],
      },
      settings: {
        heading: 'Configurações',
        intro:
          'Altere as configurações no cartão de configurações ou com !lazyxp set <setting> <value>.',
        colKey: 'Configuração',
        colName: 'Nome',
        colDesc: 'O que faz',
      },
      upgrading: {
        heading: 'Atualizando da 0.1',
        points: [
          'As configurações, o XP da sessão e o XP extra por personagem da 0.1 são trazidos na primeira vez que a 1.0 inicia.',
          'Jogadores ou personagens que não estavam ativos ficam de fora do grupo.',
          'Um nome de comando personalizado da 0.1 continua funcionando.',
          'Os comandos antigos ainda funcionam:',
        ],
        colV1: '0.1',
        colV2: '1.0',
      },
      troubleshooting: {
        heading: 'Solução de problemas',
        points: [
          'Nada é gravado nas fichas de D&D 2024: verifique se o jogo usa o Mod sandbox v1.5 (!lazyxp status).',
          'Uma criatura dá 0 XP: a ficha dela não tem XP nem nível de desafio. Use Outro valor ou !lazyxp kill --xp 100.',
          'Derrotas não são percebidas: verifique se Barra de PV é a barra que guarda os pontos de vida.',
          '!xp não faz nada: outro Mod de XP o usa. Use !lazyxp.',
        ],
      },
      languages: {
        heading: 'Idiomas',
        body: 'Escolha um idioma com !lazyxp lang. Os cartões do chat e os handouts mudam na hora.',
        colLanguage: 'Idioma',
        colNative: 'Nome',
        colCode: 'Código',
      },
      credits: {
        heading: 'Créditos',
        original: 'Criado por',
        maintainer: 'Reescrito e mantido por',
        support: 'Relatos de erros e ideias são bem-vindos no fórum do Roll20.',
      },
    },
  };

  var localeRu = {
    titles: {
      ready: 'LazyExperience готов к работе.',
      help: 'Справка LazyExperience',
      settings: 'Настройки LazyExperience',
      status: 'Состояние LazyExperience',
      roster: 'Группа',
      language: 'Язык',
      levelUp: 'Новый уровень!',
      defeated: 'Существо побеждено',
      xpAwarded: 'Опыт начислен',
      sessionEnded: 'Сессия {number} завершена',
      yourXp: 'Ваш опыт',
      pool: 'Опыт сессии',
      bonus: 'Бонусный опыт',
      undo: 'Отмена',
      log: 'Журнал сессий',
      partyXp: 'Опыт группы',
    },
    menu: {
      session: 'Сессия',
      pool: 'Опыт сессии',
      payout: 'Выплачено',
      shares: 'Доли',
      perShare: 'XP на долю',
      party: 'Группа ({source})',
      noParty: 'В группе пока никого нет. Откройте карточку «Группа», чтобы добавить персонажей.',
      absentTag: '(отсутствует)',
      bonusTag: '(+{xp} бонус)',
      levelTag: 'Уровень {level}',
      shareTag: 'Доля {share}',
      rosterSource: 'Состав группы',
      excluded: 'Исключены',
      blank: '(пусто)',
      groupXp: 'Опыт',
      groupParty: 'Группа',
      groupKills: 'Побеждённые существа',
      groupSheet: 'Лист персонажа',
    },
    buttons: {
      menu: 'Меню',
      help: 'Справка',
      settings: 'Настройки',
      status: 'Состояние',
      roster: 'Группа',
      addXp: 'Добавить XP',
      killSelected: 'Побеждены: выбранные',
      bonusSelected: 'Бонус: выбранным',
      giveSelected: 'Выдать сразу: выбранным',
      endSession: 'Завершить сессию',
      undo: 'Отменить',
      show: 'XP группы',
      log: 'Журнал сессий',
      absent: 'Отсутствует',
      present: 'Присутствует',
      share: 'Доля',
      exclude: 'Исключить',
      include: 'Вернуть',
      partyAdd: 'Добавить выбранных в группу',
      partyRemove: 'Убрать выбранных',
      addKill: 'Добавить {xp} XP',
      otherXp: 'Другое количество',
      ignore: 'Игнорировать',
    },
    prompts: {
      xp: 'XP',
      reason: 'Причина (необязательно)',
      share: 'Доля (1 = полная, 0.5 = половина)',
      confirmEnd: 'Завершить сессию и раздать XP?',
    },
    options: {
      yesNo: { yes: 'Да', no: 'Нет' },
      payout: { end: 'В конце сессии', instant: 'Сразу' },
      roster: {
        auto: 'Автоматически',
        party: 'Группа Roll20',
        players: 'Персонажи игроков',
        manual: 'Выбирает ГМ',
      },
      killMode: { prompt: 'Спросить ГМ', auto: 'Добавлять автоматически', off: 'Выключено' },
      announce: {
        public: 'Все',
        whisper: 'Заинтересованные игроки',
        gm: 'Только ГМ',
        off: 'Выключено',
      },
      levelNotice: {
        public: 'Все',
        whisper: 'Игрок и ГМ',
        gm: 'Только ГМ',
        off: 'Выключено',
      },
      system: { auto: 'Определять по листу' },
    },
    settings: {
      language: { label: 'Язык', desc: 'Язык карточек в чате и хэндаутов.' },
      payout: {
        label: 'Выплата XP',
        desc: 'end: XP копится в опыте сессии и раздаётся по её завершении. instant: каждая награда делится и выплачивается сразу.',
      },
      updateSheets: {
        label: 'Обновлять листы',
        desc: 'Записывать XP в листы персонажей. Если выключено, итоги только объявляются.',
      },
      system: {
        label: 'Игровая система',
        desc: 'В каких полях листа хранятся XP и уровень. auto выбирает профиль по листу каждого персонажа; custom использует пользовательские поля.',
      },
      roster: {
        label: 'Состав группы',
        desc: 'auto: группа Roll20, если в ней кто-то есть, иначе персонажи, которыми управляют игроки. party, players или manual выбирают один вариант.',
      },
      absentShare: {
        label: 'Доля отсутствующих',
        desc: 'Часть доли, которую всё равно получает отсутствующий персонаж: от 0% (ничего) до 100% (полная доля).',
      },
      extraShares: {
        label: 'Дополнительные доли',
        desc: 'Доли для спутников и наёмников, которых нет на листе. Их XP никому не выплачивается.',
      },
      killMode: {
        label: 'Побеждённые существа',
        desc: 'prompt: спросить ГМ, прежде чем добавлять XP существа. auto: добавлять сразу. off: не следить за токенами.',
      },
      killBar: {
        label: 'Следить за шкалой хитов',
        desc: 'Считать существо побеждённым, когда его шкала хитов опускается до 0 или ниже.',
      },
      hpBar: { label: 'Шкала хитов', desc: 'Какая шкала токена (1, 2 или 3) хранит хиты.' },
      killMarker: {
        label: 'Следить за маркером',
        desc: 'Считать существо побеждённым, когда на его токен ставится маркер поражения.',
      },
      marker: {
        label: 'Маркер поражения',
        desc: 'Маркер, означающий поражение: встроенное имя, например dead, или имя пользовательского маркера.',
      },
      killDeathTracker: {
        label: 'Использовать DeathTracker',
        desc: 'Считать существо побеждённым, когда DeathTracker 1.0 или новее отмечает его мёртвым.',
      },
      announce: {
        label: 'Сообщения об XP',
        desc: 'Кто видит награды XP и итоги сессии: public (все), whisper (заинтересованные игроки и ГМ), gm или off.',
      },
      levelNotice: {
        label: 'Уведомления о новом уровне',
        desc: 'Кто видит уведомления о новом уровне: public (все), whisper (игрок и ГМ), gm или off.',
      },
      customXp: {
        label: 'Пользовательское поле XP',
        desc: 'Поле листа с XP персонажа, когда игровая система — custom. В списке имена пробуются по очереди.',
      },
      customLevel: {
        label: 'Пользовательское поле уровня',
        desc: 'Поле листа с уровнем персонажа.',
      },
      customNpcXp: {
        label: 'Пользовательское поле XP существа',
        desc: 'Поле листа с XP, которые стоит существо.',
      },
      customNpcCr: {
        label: 'Пользовательское поле опасности',
        desc: 'Поле листа с показателем опасности существа; используется, если XP не указаны.',
      },
      customLevels: {
        label: 'Пользовательская таблица уровней',
        desc: 'XP, нужные для каждого уровня, начиная с 1-го, например 0,300,900,2700. Если пусто, уведомления о новом уровне для пользовательских листов выключены.',
      },
    },
    roster: {
      explain: {
        party: 'XP делят персонажи, отмеченные в Roll20 как член группы (Party Member).',
        players:
          'XP делят персонажи, которыми управляет игрок. Чтобы использовать группу Roll20, отметьте у персонажей Party Member.',
        manual: 'XP делят только персонажи, которых вы включили.',
      },
      selectHint: 'Сначала выберите токены, чтобы добавить их в группу или убрать.',
    },
    kills: {
      prompt: '{name} побеждён. Добавить {xp} XP к сессии?',
      noXp: '{name} побеждён, но на его листе не указаны XP.',
      reason: 'Побеждён {name}',
      result: {
        prompted: 'спросили',
        added: 'добавлено',
        counted: 'уже учтено в этой сессии',
        noXp: 'на листе нет XP: используйте --xp',
        notCreature: 'не существо (нет листа или состоит в группе)',
      },
    },
    levels: {
      reached: 'У {name} достаточно XP для уровня {level}!',
      sheetButton: 'Нажмите кнопку повышения уровня на листе персонажа.',
      updateSheet: 'Обновите уровень на листе персонажа.',
      pf2: 'Повысьте уровень на листе и вычтите 1 000 XP.',
      spend: 'Потратьте XP и повысьте уровень на листе.',
    },
    instant: {
      everyone: 'Каждый в группе получает {xp} XP.',
      bonus: '{names} получают {xp} XP.',
    },
    end: {
      nothing: 'В этой сессии XP не начислялись.',
      playerLine: '{name} получает {xp} XP за эту сессию.',
      playerLineTotal: '{name} получает {xp} XP за эту сессию, всего {total} XP.',
      levelLine: '{name} достигает уровня {level}.',
      remainder: '{xp} XP не удалось разделить поровну, они переходят на следующую сессию.',
    },
    show: {
      noXp: 'на листе нет XP',
      next: 'следующий уровень при {xp}',
    },
    awardKinds: { pool: 'Опыт сессии', bonus: 'Бонусный опыт', give: 'Выданный опыт' },
    messages: {
      saved: 'Сохранено.',
      commands: 'Команды: {commands}',
      aliasTaken: '{alias} занят модулем {mods}. Используйте !lazyxp.',
      migrated: 'Ваши настройки LazyExperience 0.1, опыт сессии и дополнительный опыт перенесены.',
      handouts: 'Хэндауты Help, Command Deck и Session Log пересозданы.',
      noLog: 'Ни одна сессия ещё не завершена, поэтому журнала сессий нет.',
      poolAdded: '{xp} XP добавлено к сессии.',
      bonusAdded: '{xp} бонусных XP для {names}.',
      killAdded: '{xp} XP за {name} добавлено к сессии.',
      killGone: 'Эта победа уже добавлена или больше не ожидает решения.',
      undone: 'Отменено {xp} XP ({reason}).',
      nothingToUndo: 'В этой сессии нечего отменять.',
      nothingToUndoInstant:
        'XP уже выплачены. Чтобы исправить, используйте give с отрицательным значением.',
      sessionReset: 'Опыт сессии и бонусы сброшены. Ничего не выплачено.',
      absent: 'Отмечены отсутствующими в этой сессии: {names}.',
      present: 'Отмечены присутствующими: {names}.',
      party: {
        add: 'Добавлены в группу: {names}.',
        remove: 'Убраны из группы: {names}.',
      },
    },
    warnings: {
      sandbox:
        'Некоторые персонажи используют лист Beacon (например, D&D 2024), который Mod sandbox может читать и записывать только в версии v1.5. Выберите Mod sandbox v1.5 в настройках модов игры.',
      partyLegacy:
        'Группа Roll20 — функция Jumpgate; в этой игре модуль ведёт собственный список группы.',
      nobodyToPay: 'В группе никого нет, поэтому {xp} XP сохранены на потом.',
      write: {
        zero: '{name}: модуль не может установить на листе 0 XP. Измените значение на самом листе.',
        sandbox: '{name}: для обновления XP этому листу нужен Mod sandbox v1.5.',
        xpless: '{name}: эта игровая система не использует XP (или лист считает их сам).',
        noField:
          '{name}: для этого листа неизвестно поле XP. Выберите игровую систему custom и укажите поле.',
        error: '{name}: не удалось обновить лист на {xp} XP. Смотрите консоль модов.',
      },
    },
    errors: {
      gmOnly: 'Команды LazyExperience доступны только ГМ.',
      failed: 'Что-то пошло не так: {message}',
      unknownCommand: 'Неизвестная команда «{name}».',
      helpHint: 'Введите {command} help, чтобы увидеть команды.',
      unknownSetting: 'Неизвестная настройка «{name}».',
      settingsHint: 'Откройте карточку настроек, чтобы увидеть список настроек.',
      badValue: '«{value}» — недопустимое значение для {name}.',
      badXp: 'Укажите XP целым числом, например 250.',
      badShare: 'Укажите долю числом от 0 до 10, например 0.5 или 50%.',
      noCharacters: 'Выберите токены персонажей или используйте --ids.',
      noTokens: 'Сначала выберите токены побеждённых существ или используйте --ids.',
    },
    status: {
      version: 'Версия',
      sandbox: 'Mod sandbox',
      beacon: 'Листы Beacon доступны для чтения',
      commands: 'Команды',
      profiles: 'Используемые игровые системы',
      characters: 'Персонажей: {count}',
      handouts: 'См. хэндауты {help} и {deck}.',
    },
    log: {
      title: 'Журнал сессий',
      sessionHeading: 'Сессия {number} — {date}',
      colCharacter: 'Персонаж',
      colXp: 'XP',
      awards: 'Награды',
      levelUps: 'Уровни:',
      empty: 'Ни одна сессия ещё не завершена.',
    },
    help: {
      menu: 'Показать главное меню.',
      add: 'Добавить XP к опыту сессии, при желании с причиной.',
      bonus: 'Дать выбранным персонажам бонусные XP сверх их доли.',
      give: 'Сразу выплатить XP выбранным персонажам.',
      kill: 'Считать выбранные токены побеждёнными и добавить их XP.',
      killConfirm:
        'Добавить XP побеждённого существа (кнопка запроса), при желании в другом количестве.',
      absent: 'Отметить выбранных персонажей отсутствующими в этой сессии.',
      present: 'Снова отметить выбранных персонажей присутствующими.',
      share: 'Задать долю выбранных персонажей (1 = полная).',
      exclude: 'Исключить персонажей из группы или вернуть их.',
      undo: 'Отменить последнюю ещё не выплаченную награду.',
      end: 'Завершить сессию: выплатить XP, объявить об этом и записать в журнал.',
      resetSession: 'Сбросить опыт сессии без выплаты.',
      show: 'Показать XP и уровень каждого члена группы по листу.',
      roster: 'Показать карточку группы.',
      party: 'Поставить или снять отметку Party Member в Roll20 у выбранных персонажей.',
      settings: 'Показать карточку настроек.',
      set: 'Изменить настройку.',
      lang: 'Выбрать язык.',
      status: 'Показать sandbox, команды и используемые игровые системы.',
      log: 'Ссылка на хэндаут «Журнал сессий».',
      journal: 'Пересоздать хэндауты.',
      help: 'Показать эту справку.',
      handouts: 'Подробнее в хэндаутах {help} и {deck}.',
    },
    deck: {
      session: 'Сессия',
      sessionDesc: 'Добавляйте XP к сессии, проверяйте группу и завершайте сессию.',
      selected: 'Выбранные токены',
      selectedDesc: 'Сначала выберите токены на карте.',
      party: 'Группа',
      partyDesc: 'Кто делит XP.',
      tools: 'Инструменты',
      toolsDesc: 'Настройки, состояние и справка.',
      footer: 'Кнопки запускают команды LazyExperience. Подробности в хэндауте {help}.',
    },
    handout: {
      versionLabel: 'Версия',
      subtitle: 'Опыт сессии, справедливо поделённый, на любом листе',
      footer: 'Кнопки для всех команд есть в хэндауте {deck}.',
      overview: {
        heading: 'Обзор',
        body: 'LazyExperience собирает очки опыта, заработанные за сессию, делит их между членами группы и записывает в листы персонажей. Он читает и записывает лист D&D 2024, а также старые и другие листы, использует собственную группу Roll20, замечает побеждённых существ, учитывает отсутствующих игроков и бонусные XP, объявляет о новых уровнях и ведёт журнал каждой сессии.',
      },
      quickStart: {
        heading: 'Быстрый старт',
        steps: [
          'Отметьте Party Member у каждого персонажа игрока (в настройках окна персонажа) или пропустите этот шаг: тогда используются персонажи, которыми управляют игроки.',
          'Введите !lazyxp, чтобы открыть меню.',
          'Когда группа побеждает существо и его шкала хитов опускается до 0, вас спросят, добавлять ли его XP. Можно также выбрать токены и нажать «Побеждены: выбранные».',
          'Добавляйте XP за всё остальное кнопкой «Добавить XP», а бонусные XP одному персонажу — кнопкой «Бонус: выбранным».',
          'Отметьте игроков, пропустивших сессию, как «Отсутствует».',
          'Нажмите «Завершить сессию». Доля каждого будет записана в его лист, объявлена и добавлена в хэндаут «Журнал сессий».',
        ],
      },
      commands: {
        heading: 'Команды',
        intro:
          'Каждая команда начинается с !lazyxp; работает и {long}, а также {short}, пока его не использует другой модуль XP. Использовать их может только ГМ.',
        targets:
          'Команды для персонажей используют выбранные токены или --ids, за которым через запятую указаны ID персонажей или токенов.',
        colCommand: 'Команда',
        colDesc: 'Что делает',
      },
      party: {
        heading: 'Группа',
        points: [
          'Автоматически: если в Roll20 (Jumpgate) хотя бы у одного персонажа отмечено Party Member, XP делит группа Roll20; иначе — все персонажи, которыми управляет игрок.',
          'Персонажи, которыми управляют только «Все игроки», например вспомогательные токены, не учитываются.',
          'Добавление в группу и удаление из группы ставят или снимают отметку Party Member у выбранных персонажей.',
          '«Исключить» навсегда убирает персонажа из группы; «Вернуть» возвращает его.',
          'Персонаж, которым управляют несколько игроков, учитывается один раз.',
        ],
      },
      splitting: {
        heading: 'Деление XP',
        points: [
          'Опыт сессии делится на число долей: по одной на члена группы плюс дополнительные доли.',
          'Отсутствующие персонажи получают долю по настройке «Доля отсутствующих» (по умолчанию 0%). Отсутствие действует одну сессию.',
          'У персонажа может быть другая доля, например 0.5 для помощника.',
          'Бонусные XP достаются выбранным персонажам сверх их доли.',
          'XP, которые не делятся поровну, переходят на следующую сессию.',
          'Если «Выплата XP» установлена в instant, каждая награда делится и выплачивается сразу.',
        ],
      },
      kills: {
        heading: 'Побеждённые существа',
        points: [
          'Существо считается побеждённым, когда его шкала хитов опускается до 0, когда ставится маркер поражения или когда DeathTracker отмечает его мёртвым.',
          'Изменения, сделанные через TokenMod, лист или другие моды по связанному атрибуту, тоже замечаются.',
          'Учитываются только токены персонажей вне группы, которыми не управляет ни один игрок, и каждый токен — только один раз за сессию.',
          'XP берутся с листа: стоимость существа в XP или его показатель опасности.',
          'Вариант «Спросить ГМ» (по умолчанию) отправляет шёпотом запрос с кнопками «Добавить», «Другое количество» и «Игнорировать». «Добавлять автоматически» пропускает запрос.',
        ],
      },
      levels: {
        heading: 'Повышение уровня',
        points: [
          'После записи XP LazyExperience проверяет таблицу уровней системы и сообщает, когда у персонажа достаточно XP для нового уровня.',
          'На листе D&D 2024 игрок затем нажимает кнопку повышения уровня на листе.',
        ],
      },
      systems: {
        heading: 'Игровые системы',
        intro:
          'LazyExperience выбирает профиль по листу каждого персонажа. Задайте игровую систему, чтобы принудительно выбрать профиль, или custom, чтобы указать поля самостоятельно.',
        colSystem: 'Система',
        colId: 'ID',
        colSheets: 'Листы',
        colChecked: 'Проверено',
        verified: {
          live: 'Проверено в Roll20',
          partial: 'Частично проверено в Roll20',
          source: 'По исходному коду листа',
          none: '—',
        },
        points: [
          'Выберите лист по его названию в Настройках игры. Листы, которых нет в списке, используют распространённые поля experience, xp и level, или задайте игровую систему как custom.',
          '«Проверено в Roll20» означает, что XP записали в этот лист в игре Jumpgate, собственные расчёты листа сработали, а побеждённые существа и уведомления о новом уровне проверили.',
          'Листам Beacon, например D&D 2024, нужен Mod sandbox v1.5, а мод не может установить им 0 XP.',
          'Pathfinder 1E и Starfinder берут для уведомлений о новом уровне поле листа с XP до следующего уровня. Если оно пусто, Pathfinder использует средний темп, а Starfinder — собственную таблицу.',
          'WFRP 4E: каждая награда добавляется строкой в список Experience листа, но при тестировании лист не пересчитал суммы XP, поэтому проверьте их на листе.',
          'В Savage Worlds, 13th Age, Cosmere и Call of Cthulhu нет XP, которые мог бы записать мод.',
        ],
      },
      settings: {
        heading: 'Настройки',
        intro:
          'Меняйте настройки в карточке настроек или командой !lazyxp set <настройка> <значение>.',
        colKey: 'Настройка',
        colName: 'Название',
        colDesc: 'Что делает',
      },
      upgrading: {
        heading: 'Обновление с 0.1',
        points: [
          'Настройки, опыт сессии и дополнительный опыт персонажей из 0.1 переносятся при первом запуске 1.0.',
          'Неактивные игроки и персонажи не включаются в группу.',
          'Пользовательское имя команды из 0.1 продолжает работать.',
          'Старые команды по-прежнему работают:',
        ],
        colV1: '0.1',
        colV2: '1.0',
      },
      troubleshooting: {
        heading: 'Устранение неполадок',
        points: [
          'В листы D&D 2024 ничего не записывается: проверьте, что в игре используется Mod sandbox v1.5 (!lazyxp status).',
          'Существо даёт 0 XP: на его листе нет XP или показателя опасности. Используйте «Другое количество» или !lazyxp kill --xp 100.',
          'Победы не замечаются: проверьте, что «Шкала хитов» — это шкала, хранящая хиты.',
          '!xp ничего не делает: эту команду использует другой модуль XP. Используйте !lazyxp.',
        ],
      },
      languages: {
        heading: 'Языки',
        body: 'Выберите язык командой !lazyxp lang. Карточки в чате и хэндауты меняются сразу.',
        colLanguage: 'Язык',
        colNative: 'Название',
        colCode: 'Код',
      },
      credits: {
        heading: 'Авторы',
        original: 'Создал',
        maintainer: 'Переписал и поддерживает',
        support: 'Сообщения об ошибках и идеи приветствуются на форуме Roll20.',
      },
    },
  };

  var localeEs = {
    titles: {
      ready: 'LazyExperience está listo.',
      help: 'Ayuda de LazyExperience',
      settings: 'Ajustes de LazyExperience',
      status: 'Estado de LazyExperience',
      roster: 'Grupo',
      language: 'Idioma',
      levelUp: '¡Subida de nivel!',
      defeated: 'Criatura derrotada',
      xpAwarded: 'Experiencia otorgada',
      sessionEnded: 'Sesión {number} terminada',
      yourXp: 'Tu experiencia',
      pool: 'PX de la sesión',
      bonus: 'PX extra',
      undo: 'Deshacer',
      log: 'Registro de sesión',
      partyXp: 'Experiencia del grupo',
    },
    menu: {
      session: 'Sesión',
      pool: 'PX de la sesión',
      payout: 'Pagado',
      shares: 'Partes',
      perShare: 'PX por parte',
      party: 'Grupo ({source})',
      noParty: 'Todavía no hay nadie en el grupo. Abre la tarjeta Grupo para añadir personajes.',
      absentTag: '(ausente)',
      bonusTag: '(+{xp} extra)',
      levelTag: 'Nivel {level}',
      shareTag: 'Parte {share}',
      rosterSource: 'Grupo según',
      excluded: 'Excluidos',
      blank: '(vacío)',
      groupXp: 'Experiencia',
      groupParty: 'Grupo',
      groupKills: 'Criaturas derrotadas',
      groupSheet: 'Hoja de personaje',
    },
    buttons: {
      menu: 'Menú',
      help: 'Ayuda',
      settings: 'Ajustes',
      status: 'Estado',
      roster: 'Grupo',
      addXp: 'Añadir PX',
      killSelected: 'Derrotados: selección',
      bonusSelected: 'Extra: selección',
      giveSelected: 'Dar ahora: selección',
      endSession: 'Terminar sesión',
      undo: 'Deshacer',
      show: 'PX del grupo',
      log: 'Registro de sesión',
      absent: 'Ausente',
      present: 'Presente',
      share: 'Parte',
      exclude: 'Excluir',
      include: 'Incluir',
      partyAdd: 'Añadir selección al grupo',
      partyRemove: 'Quitar selección',
      addKill: 'Añadir {xp} PX',
      otherXp: 'Otra cantidad',
      ignore: 'Ignorar',
    },
    prompts: {
      xp: 'PX',
      reason: 'Motivo (opcional)',
      share: 'Parte (1 = completa, 0,5 = mitad)',
      confirmEnd: '¿Terminar la sesión y repartir los PX?',
    },
    options: {
      yesNo: { yes: 'Sí', no: 'No' },
      payout: { end: 'Al final de la sesión', instant: 'De inmediato' },
      roster: {
        auto: 'Automático',
        party: 'Grupo de Roll20',
        players: 'Personajes de los jugadores',
        manual: 'Elegido por el DJ',
      },
      killMode: { prompt: 'Preguntar al DJ', auto: 'Añadir automáticamente', off: 'Desactivado' },
      announce: {
        public: 'Todos',
        whisper: 'Los jugadores implicados',
        gm: 'Solo el DJ',
        off: 'Desactivado',
      },
      levelNotice: {
        public: 'Todos',
        whisper: 'El jugador y el DJ',
        gm: 'Solo el DJ',
        off: 'Desactivado',
      },
      system: { auto: 'Detectar según la hoja' },
    },
    settings: {
      language: { label: 'Idioma', desc: 'Idioma de las tarjetas de chat y los handouts.' },
      payout: {
        label: 'Pagar PX',
        desc: 'end: los PX se acumulan en la reserva de la sesión y se reparten al terminar la sesión. instant: cada premio se divide y se paga de inmediato.',
      },
      updateSheets: {
        label: 'Actualizar hojas',
        desc: 'Escribe los PX en las hojas de personaje. Si está desactivado, los totales solo se anuncian.',
      },
      system: {
        label: 'Sistema de juego',
        desc: 'Qué campos de la hoja contienen los PX y el nivel. auto elige el perfil según la hoja de cada personaje; custom usa los ajustes de campos personalizados.',
      },
      roster: {
        label: 'Grupo según',
        desc: 'auto: el grupo de Roll20 si hay alguien en él; si no, los personajes controlados por jugadores. party, players o manual fijan una opción.',
      },
      absentShare: {
        label: 'Parte de ausentes',
        desc: 'Fracción de una parte que un personaje ausente recibe igualmente, de 0 % (nada) a 100 % (completa).',
      },
      extraShares: {
        label: 'Partes adicionales',
        desc: 'Partes para compañeros o sirvientes que no tienen hoja. Sus PX no se pagan a nadie.',
      },
      killMode: {
        label: 'Criaturas derrotadas',
        desc: 'prompt: preguntar al DJ antes de añadir los PX de una criatura. auto: añadirlos de inmediato. off: no vigilar las fichas.',
      },
      killBar: {
        label: 'Vigilar barra de PG',
        desc: 'Cuenta una criatura como derrotada cuando su barra de PG baja a 0 o menos.',
      },
      hpBar: {
        label: 'Barra de PG',
        desc: 'Qué barra de la ficha (1, 2 o 3) contiene los puntos de golpe.',
      },
      killMarker: {
        label: 'Vigilar marcador',
        desc: 'Cuenta una criatura como derrotada cuando se pone el marcador de derrotado en su ficha.',
      },
      marker: {
        label: 'Marcador de derrotado',
        desc: 'El marcador que significa derrotado: un nombre integrado como dead, o el nombre de un marcador personalizado.',
      },
      killDeathTracker: {
        label: 'Usar DeathTracker',
        desc: 'Cuenta una criatura como derrotada cuando DeathTracker 1.0 o posterior la marca como muerta.',
      },
      announce: {
        label: 'Mensajes de PX',
        desc: 'Quién ve los premios de PX y el resumen de fin de sesión: public, whisper (jugadores implicados y DJ), gm u off.',
      },
      levelNotice: {
        label: 'Avisos de subida de nivel',
        desc: 'Quién ve los avisos de subida de nivel: public, whisper (el jugador y el DJ), gm u off.',
      },
      customXp: {
        label: 'Campo de PX personalizado',
        desc: 'Campo de la hoja para los PX de un personaje cuando el sistema de juego es custom. Con una lista se prueba cada nombre por turno.',
      },
      customLevel: {
        label: 'Campo de nivel personalizado',
        desc: 'Campo de la hoja para el nivel de un personaje.',
      },
      customNpcXp: {
        label: 'Campo de PX de criatura personalizado',
        desc: 'Campo de la hoja para los PX que vale una criatura.',
      },
      customNpcCr: {
        label: 'Campo de desafío personalizado',
        desc: 'Campo de la hoja para el valor de desafío de una criatura, usado cuando no tiene valor de PX.',
      },
      customLevels: {
        label: 'Tabla de niveles personalizada',
        desc: 'PX necesarios para cada nivel, desde el nivel 1, por ejemplo 0,300,900,2700. En blanco desactiva los avisos de subida de nivel para hojas personalizadas.',
      },
    },
    roster: {
      explain: {
        party: 'Los personajes marcados como Party Member en Roll20 se reparten los PX.',
        players:
          'Los personajes controlados por un jugador se reparten los PX. Marca Party Member en los personajes para usar en su lugar el grupo de Roll20.',
        manual: 'Solo los personajes que incluyas se reparten los PX.',
      },
      selectHint: 'Selecciona primero fichas para añadirlas al grupo o quitarlas.',
    },
    kills: {
      prompt: '{name} fue derrotado. ¿Añadir {xp} PX a la sesión?',
      noXp: '{name} fue derrotado, pero su hoja no tiene valor de PX.',
      reason: '{name} derrotado',
      result: {
        prompted: 'preguntado',
        added: 'añadido',
        counted: 'ya contado en esta sesión',
        noXp: 'sin PX en la hoja: usa --xp',
        notCreature: 'no es una criatura (sin hoja, o en el grupo)',
      },
    },
    levels: {
      reached: '¡{name} tiene PX suficientes para el nivel {level}!',
      sheetButton: 'Usa el botón Level Up de la hoja de personaje.',
      updateSheet: 'Actualiza el nivel en la hoja de personaje.',
      pf2: 'Sube el nivel en la hoja y réstale 1000 a los PX.',
      spend: 'Gasta los PX y sube el nivel en la hoja.',
    },
    instant: {
      everyone: 'Todo el grupo gana {xp} PX.',
      bonus: '{names} ganan {xp} PX.',
    },
    end: {
      nothing: 'No se otorgaron PX en esta sesión.',
      playerLine: '{name} gana {xp} PX en esta sesión.',
      playerLineTotal: '{name} gana {xp} PX en esta sesión, con un total de {total} PX.',
      levelLine: '{name} alcanzó el nivel {level}.',
      remainder: '{xp} PX no se pudieron repartir por igual y pasan a la próxima sesión.',
    },
    show: {
      noXp: 'sin PX en la hoja',
      next: 'siguiente nivel en {xp}',
    },
    awardKinds: { pool: 'PX de la sesión', bonus: 'PX extra', give: 'PX entregados' },
    messages: {
      saved: 'Guardado.',
      commands: 'Comandos: {commands}',
      aliasTaken: '{alias} está reservado para {mods}. Usa !lazyxp.',
      migrated:
        'Se han traído tus ajustes, los PX de sesión y los PX adicionales de LazyExperience 0.1.',
      handouts: 'Se han reconstruido los handouts Help, Command Deck y Session Log.',
      noLog: 'Aún no ha terminado ninguna sesión, así que no hay Session Log.',
      poolAdded: '{xp} PX añadidos a la sesión.',
      bonusAdded: '{xp} PX extra para {names}.',
      killAdded: '{xp} PX por {name} añadidos a la sesión.',
      killGone: 'Esa derrota ya se añadió o ya no está pendiente.',
      undone: 'Se retiraron {xp} PX ({reason}).',
      nothingToUndo: 'No hay nada que deshacer en esta sesión.',
      nothingToUndoInstant:
        'Los PX ya se han pagado. Usa give con una cantidad negativa para corregirlo.',
      sessionReset: 'Se borraron los PX de sesión y los extras. No se pagó nada.',
      absent: 'Marcados como ausentes en esta sesión: {names}.',
      present: 'Marcados como presentes: {names}.',
      party: {
        add: 'Añadidos al grupo: {names}.',
        remove: 'Quitados del grupo: {names}.',
      },
    },
    warnings: {
      sandbox:
        'Algunos personajes usan una hoja Beacon (como D&D 2024), que el Mod sandbox solo puede leer y escribir en v1.5. Elige Mod sandbox v1.5 en los ajustes de Mod de la partida.',
      partyLegacy:
        'El grupo de Roll20 es una función de Jumpgate; en esta partida el Mod mantiene su propia lista de grupo.',
      nobodyToPay: 'No hay nadie en el grupo, así que {xp} PX se guardan para más tarde.',
      write: {
        zero: '{name}: un Mod no puede poner la hoja a 0 PX. Cámbialo en la hoja.',
        sandbox: '{name}: esta hoja necesita Mod sandbox v1.5 para actualizar los PX.',
        xpless: '{name}: este sistema de juego no usa PX (o la hoja los calcula sola).',
        noField:
          '{name}: no se conoce ningún campo de PX para esta hoja. Pon el sistema de juego en custom e indica el campo.',
        error: '{name}: no se pudo actualizar la hoja con {xp} PX. Consulta la consola del Mod.',
      },
    },
    errors: {
      gmOnly: 'Solo el DJ puede usar los comandos de LazyExperience.',
      failed: 'Algo salió mal: {message}',
      unknownCommand: 'Comando desconocido «{name}».',
      helpHint: 'Escribe {command} help para ver los comandos.',
      unknownSetting: 'Ajuste desconocido «{name}».',
      settingsHint: 'Abre la tarjeta de ajustes para verlos.',
      badValue: '«{value}» no es un valor válido para {name}.',
      badXp: 'Indica los PX como un número entero, por ejemplo 250.',
      badShare: 'Indica la parte como un número de 0 a 10, por ejemplo 0.5 o 50 %.',
      noCharacters: 'Selecciona fichas que representen personajes, o usa --ids.',
      noTokens: 'Selecciona primero las fichas derrotadas, o usa --ids.',
    },
    status: {
      version: 'Versión',
      sandbox: 'Mod sandbox',
      beacon: 'Hojas Beacon legibles',
      commands: 'Comandos',
      profiles: 'Sistemas de juego en uso',
      characters: '{count} personajes',
      handouts: 'Consulta los handouts {help} y {deck}.',
    },
    log: {
      title: 'Registro de sesión',
      sessionHeading: 'Sesión {number} — {date}',
      colCharacter: 'Personaje',
      colXp: 'PX',
      awards: 'Premios',
      levelUps: 'Niveles:',
      empty: 'Aún no ha terminado ninguna sesión.',
    },
    help: {
      menu: 'Muestra el menú principal.',
      add: 'Añade PX a la reserva de la sesión, con un motivo opcional.',
      bonus: 'Da PX extra a los personajes seleccionados además de su parte.',
      give: 'Paga PX de inmediato a los personajes seleccionados.',
      kill: 'Cuenta las fichas seleccionadas como derrotadas y añade sus PX.',
      killConfirm:
        'Añade los PX de una criatura derrotada (el botón de la consulta), opcionalmente con otra cantidad.',
      absent: 'Marca a los personajes seleccionados como ausentes en esta sesión.',
      present: 'Vuelve a marcar como presentes a los personajes seleccionados.',
      share: 'Fija la parte de los personajes seleccionados (1 = completa).',
      exclude: 'Excluye personajes del grupo o los vuelve a incluir.',
      undo: 'Deshace el último premio que no se ha pagado.',
      end: 'Termina la sesión: paga los PX, los anuncia y los registra.',
      resetSession: 'Borra los PX de la sesión sin pagarlos.',
      show: 'Muestra los PX y el nivel de cada miembro del grupo según la hoja.',
      roster: 'Muestra la tarjeta del grupo.',
      party:
        'Marca o desmarca la casilla Party Member de Roll20 para los personajes seleccionados.',
      settings: 'Muestra la tarjeta de ajustes.',
      set: 'Cambia un ajuste.',
      lang: 'Elige el idioma.',
      status: 'Muestra el sandbox, los comandos y los sistemas de juego en uso.',
      log: 'Enlace al handout Session Log.',
      journal: 'Reconstruye los handouts.',
      help: 'Muestra esta ayuda.',
      handouts: 'Más información en los handouts {help} y {deck}.',
    },
    deck: {
      session: 'Sesión',
      sessionDesc: 'Añade PX a la sesión, revisa el grupo y termina la sesión.',
      selected: 'Fichas seleccionadas',
      selectedDesc: 'Selecciona primero fichas en el mapa.',
      party: 'Grupo',
      partyDesc: 'Quién se reparte los PX.',
      tools: 'Herramientas',
      toolsDesc: 'Ajustes, estado y ayuda.',
      footer:
        'Los botones ejecutan comandos de LazyExperience. Consulta el handout {help} para más detalles.',
    },
    handout: {
      versionLabel: 'Versión',
      subtitle: 'La experiencia de la sesión, repartida con justicia, en cualquier hoja',
      footer: 'Los botones de todos los comandos están en el handout {deck}.',
      overview: {
        heading: 'Descripción general',
        body: 'LazyExperience recoge los puntos de experiencia ganados durante una sesión, los reparte entre el grupo y los escribe en las hojas de personaje. Lee y escribe la hoja de D&D 2024 así como hojas más antiguas y de otros sistemas, usa el grupo propio de Roll20, detecta las criaturas derrotadas, gestiona jugadores ausentes y PX extra, anuncia las subidas de nivel y guarda un registro de cada sesión.',
      },
      quickStart: {
        heading: 'Inicio rápido',
        steps: [
          'Marca Party Member en cada personaje jugador (en los ajustes de la ventana del personaje), o déjalo así: se usan los personajes controlados por jugadores.',
          'Escribe !lazyxp para abrir el menú.',
          'Cuando el grupo derrote a una criatura, su barra de PG al llegar a 0 te preguntará si añadir sus PX. También puedes seleccionar fichas y pulsar Derrotados: selección.',
          'Añade PX por cualquier otra cosa con Añadir PX, y PX extra para un personaje con Extra: selección.',
          'Marca como Ausente a los jugadores que faltaron a la sesión.',
          'Pulsa Terminar sesión. La parte de cada uno se escribe en su hoja, se anuncia y se añade al handout Session Log.',
        ],
      },
      commands: {
        heading: 'Comandos',
        intro:
          'Todos los comandos empiezan por !lazyxp; {long} también funciona, y {short} igualmente mientras ningún otro Mod de PX lo use. Solo el DJ puede usarlos.',
        targets:
          'Los comandos para personajes usan las fichas seleccionadas, o --ids seguido de ID de personajes o fichas separados por comas.',
        colCommand: 'Comando',
        colDesc: 'Qué hace',
      },
      party: {
        heading: 'El grupo',
        points: [
          'Automático: cuando algún personaje está marcado como Party Member en Roll20 (Jumpgate), el grupo de Roll20 se reparte los PX; si no, lo hace cada personaje controlado por un jugador.',
          'Los personajes controlados solo por «Todos los jugadores», como las fichas auxiliares, no se cuentan.',
          'Añadir al grupo y Quitar del grupo marcan o desmarcan Party Member en los personajes seleccionados.',
          'Excluir saca a un personaje del grupo de forma permanente; Incluir lo devuelve.',
          'Un personaje controlado por varios jugadores cuenta una sola vez.',
        ],
      },
      splitting: {
        heading: 'Reparto de los PX',
        points: [
          'Los PX de la sesión se dividen entre el número de partes: una por miembro del grupo, más las partes adicionales.',
          'Los personajes ausentes reciben el ajuste Parte de ausentes (0 % por defecto). La ausencia dura una sesión.',
          'Un personaje puede tener una parte distinta, como 0.5 para un acompañante.',
          'Los PX extra van a los personajes elegidos además de su parte.',
          'Los PX que no se dividen por igual pasan a la próxima sesión.',
          'Con Pagar PX en instant, cada premio se divide y se paga al momento.',
        ],
      },
      kills: {
        heading: 'Criaturas derrotadas',
        points: [
          'Una criatura cuenta como derrotada cuando su barra de PG baja a 0, cuando se pone el marcador de derrotado o cuando DeathTracker la marca como muerta.',
          'También se detectan los cambios hechos por TokenMod, por la hoja o por otros Mods mediante el atributo enlazado.',
          'Solo se cuentan las fichas de personajes fuera del grupo que ningún jugador controla, y cada ficha una sola vez por sesión.',
          'Los PX salen de la hoja: el valor de PX de la criatura o su valor de desafío.',
          'Preguntar al DJ (el valor por defecto) susurra una consulta con Añadir, Otra cantidad e Ignorar. Añadir automáticamente se salta la consulta.',
        ],
      },
      levels: {
        heading: 'Subidas de nivel',
        points: [
          'Tras escribir los PX, LazyExperience consulta la tabla de niveles del sistema y anuncia cuándo un personaje tiene PX suficientes para un nuevo nivel.',
          'En la hoja de D&D 2024, el jugador pulsa entonces el botón Level Up de la hoja.',
        ],
      },
      systems: {
        heading: 'Sistemas de juego',
        intro:
          'LazyExperience elige un perfil según la hoja de cada personaje. Fija el sistema de juego para forzar uno, o ponlo en custom para indicar tú mismo los campos.',
        colSystem: 'Sistema',
        colId: 'ID',
        colSheets: 'Hojas',
        colChecked: 'Comprobado',
        verified: {
          live: 'Probado en Roll20',
          partial: 'Probado en parte en Roll20',
          source: 'Del código de la hoja',
          none: '—',
        },
        points: [
          'Elige la hoja por su nombre en los Ajustes de la partida. Las hojas que no figuran usan los nombres de campo habituales experience, xp y level, o fija el sistema de juego en custom.',
          'Probado en Roll20 significa que se escribieron PX en esa hoja en una partida de Jumpgate, se ejecutaron los cálculos propios de la hoja y se comprobaron las criaturas derrotadas y los avisos de subida de nivel.',
          'Las hojas Beacon como D&D 2024 necesitan Mod sandbox v1.5, y un Mod no puede ponerlas a 0 PX.',
          'Pathfinder 1E y Starfinder usan la casilla de PX para el siguiente nivel de la hoja en los avisos de subida de nivel. Si está vacía, Pathfinder usa la progresión media y Starfinder su propia tabla.',
          'WFRP 4E: cada concesión se añade como una fila en la lista Experience de la hoja, pero en las pruebas la hoja no recalculó sus totales de PX, así que compruébalos en la hoja.',
          'Savage Worlds, 13th Age, Cosmere y Call of Cthulhu no tienen PX que un Mod pueda escribir.',
        ],
      },
      settings: {
        heading: 'Ajustes',
        intro: 'Cambia los ajustes en la tarjeta de ajustes, o con !lazyxp set <ajuste> <valor>.',
        colKey: 'Ajuste',
        colName: 'Nombre',
        colDesc: 'Qué hace',
      },
      upgrading: {
        heading: 'Actualizar desde 0.1',
        points: [
          'Los ajustes, los PX de sesión y los PX adicionales por personaje de 0.1 se traen la primera vez que arranca 1.0.',
          'Los jugadores o personajes que no estaban activos quedan fuera del grupo.',
          'Un nombre de comando personalizado de 0.1 sigue funcionando.',
          'Los comandos antiguos siguen funcionando:',
        ],
        colV1: '0.1',
        colV2: '1.0',
      },
      troubleshooting: {
        heading: 'Solución de problemas',
        points: [
          'No se escribe nada en las hojas de D&D 2024: comprueba que la partida usa Mod sandbox v1.5 (!lazyxp status).',
          'Una criatura da 0 PX: su hoja no tiene PX ni valor de desafío. Usa Otra cantidad, o !lazyxp kill --xp 100.',
          'No se detectan las derrotas: comprueba que la barra de PG es la que contiene los puntos de golpe.',
          '!xp no hace nada: otro Mod de PX lo usa. Usa !lazyxp.',
        ],
      },
      languages: {
        heading: 'Idiomas',
        body: 'Elige un idioma con !lazyxp lang. Las tarjetas de chat y los handouts cambian al instante.',
        colLanguage: 'Idioma',
        colNative: 'Nombre',
        colCode: 'Código',
      },
      credits: {
        heading: 'Créditos',
        original: 'Creado por',
        maintainer: 'Reescrito y mantenido por',
        support: 'Los informes de errores y las ideas son bienvenidos en el foro de Roll20.',
      },
    },
  };

  var localeSv = {
    titles: {
      ready: 'LazyExperience är redo.',
      help: 'LazyExperience Hjälp',
      settings: 'LazyExperience Inställningar',
      status: 'LazyExperience Status',
      roster: 'Gruppen',
      language: 'Språk',
      levelUp: 'Nivåhöjning!',
      defeated: 'Varelse besegrad',
      xpAwarded: 'Erfarenhet tilldelad',
      sessionEnded: 'Spelmöte {number} avslutat',
      yourXp: 'Din erfarenhet',
      pool: 'Spelmötets XP',
      bonus: 'Bonus-XP',
      undo: 'Ångra',
      log: 'Spelmötslogg',
      partyXp: 'Gruppens erfarenhet',
    },
    menu: {
      session: 'Spelmöte',
      pool: 'Spelmötets XP',
      payout: 'Utbetalt',
      shares: 'Andelar',
      perShare: 'XP per andel',
      party: 'Grupp ({source})',
      noParty: 'Ingen är med i gruppen ännu. Öppna gruppkortet för att lägga till karaktärer.',
      absentTag: '(frånvarande)',
      bonusTag: '(+{xp} bonus)',
      levelTag: 'Nivå {level}',
      shareTag: 'Andel {share}',
      rosterSource: 'Grupp från',
      excluded: 'Utelämnade',
      blank: '(tomt)',
      groupXp: 'Erfarenhet',
      groupParty: 'Grupp',
      groupKills: 'Besegrade varelser',
      groupSheet: 'Karaktärsblad',
    },
    buttons: {
      menu: 'Meny',
      help: 'Hjälp',
      settings: 'Inställningar',
      status: 'Status',
      roster: 'Grupp',
      addXp: 'Lägg till XP',
      killSelected: 'Besegrad: Valda',
      bonusSelected: 'Bonus: Valda',
      giveSelected: 'Ge nu: Valda',
      endSession: 'Avsluta spelmöte',
      undo: 'Ångra',
      show: 'Gruppens XP',
      log: 'Spelmötslogg',
      absent: 'Frånvarande',
      present: 'Närvarande',
      share: 'Andel',
      exclude: 'Utelämna',
      include: 'Ta med',
      partyAdd: 'Lägg valda i gruppen',
      partyRemove: 'Ta bort valda',
      addKill: 'Lägg till {xp} XP',
      otherXp: 'Annat belopp',
      ignore: 'Ignorera',
    },
    prompts: {
      xp: 'XP',
      reason: 'Orsak (valfritt)',
      share: 'Andel (1 = hel, 0,5 = halv)',
      confirmEnd: 'Avsluta spelmötet och dela ut XP?',
    },
    options: {
      yesNo: { yes: 'Ja', no: 'Nej' },
      payout: { end: 'Vid spelmötets slut', instant: 'Direkt' },
      roster: {
        auto: 'Automatiskt',
        party: 'Roll20-grupp',
        players: 'Spelarnas karaktärer',
        manual: 'Valda av spelledaren',
      },
      killMode: { prompt: 'Fråga spelledaren', auto: 'Lägg till automatiskt', off: 'Av' },
      announce: { public: 'Alla', whisper: 'Berörda spelare', gm: 'Endast spelledaren', off: 'Av' },
      levelNotice: {
        public: 'Alla',
        whisper: 'Spelaren och spelledaren',
        gm: 'Endast spelledaren',
        off: 'Av',
      },
      system: { auto: 'Identifiera från bladet' },
    },
    settings: {
      language: { label: 'Språk', desc: 'Språk för chattkort och handouts.' },
      payout: {
        label: 'Utbetala XP',
        desc: 'end: XP samlas i spelmötets pott och delas ut när spelmötet avslutas. instant: varje tilldelning delas upp och betalas ut direkt.',
      },
      updateSheets: {
        label: 'Uppdatera blad',
        desc: 'Skriv XP till karaktärsbladen. När detta är av tillkännages bara summorna.',
      },
      system: {
        label: 'Spelsystem',
        desc: 'Vilka bladfält som innehåller XP och nivå. auto väljer profil från varje karaktärs blad; custom använder inställningarna för egna fält.',
      },
      roster: {
        label: 'Grupp från',
        desc: 'auto: Roll20-gruppen om någon är med i den, annars karaktärer som styrs av spelare. party, players eller manual väljer en av dem.',
      },
      absentShare: {
        label: 'Frånvaroandel',
        desc: 'Den del av en andel som en frånvarande karaktär ändå får, från 0 % (ingen) till 100 % (hel).',
      },
      extraShares: {
        label: 'Extra andelar',
        desc: 'Andelar för följeslagare eller legohjon som inte finns på något blad. Deras XP betalas inte ut till någon.',
      },
      killMode: {
        label: 'Besegrade varelser',
        desc: 'prompt: fråga spelledaren innan en varelses XP läggs till. auto: lägg till direkt. off: bevaka inte pjäser.',
      },
      killBar: {
        label: 'Bevaka HP-fältet',
        desc: 'Räkna en varelse som besegrad när dess HP-fält sjunker till 0 eller lägre.',
      },
      hpBar: {
        label: 'HP-fält',
        desc: 'Vilket pjäsfält (1, 2 eller 3) som innehåller träffpoäng.',
      },
      killMarker: {
        label: 'Bevaka markör',
        desc: 'Räkna en varelse som besegrad när markören för besegrad sätts på dess pjäs.',
      },
      marker: {
        label: 'Markör för besegrad',
        desc: 'Markören som betyder besegrad: ett inbyggt namn som dead, eller namnet på en egen markör.',
      },
      killDeathTracker: {
        label: 'Använd DeathTracker',
        desc: 'Räkna en varelse som besegrad när DeathTracker 1.0 eller senare markerar den som död.',
      },
      announce: {
        label: 'XP-meddelanden',
        desc: 'Vem som ser XP-tilldelningar och sammanfattningen vid spelmötets slut: public, whisper (berörda spelare och spelledaren), gm eller off.',
      },
      levelNotice: {
        label: 'Nivåmeddelanden',
        desc: 'Vem som ser nivåmeddelanden: public, whisper (spelaren och spelledaren), gm eller off.',
      },
      customXp: {
        label: 'Eget XP-fält',
        desc: 'Bladfält för en karaktärs XP när Spelsystem är custom. En lista provar varje namn i tur och ordning.',
      },
      customLevel: { label: 'Eget nivåfält', desc: 'Bladfält för en karaktärs nivå.' },
      customNpcXp: {
        label: 'Eget XP-fält för varelser',
        desc: 'Bladfält för hur mycket XP en varelse är värd.',
      },
      customNpcCr: {
        label: 'Eget utmaningsfält',
        desc: 'Bladfält för en varelses utmaningsgrad, som används när den saknar XP-värde.',
      },
      customLevels: {
        label: 'Egen nivåtabell',
        desc: 'XP som krävs för varje nivå, från nivå 1, till exempel 0,300,900,2700. Tomt stänger av nivåmeddelanden för egna blad.',
      },
    },
    roster: {
      explain: {
        party: 'Karaktärer som är markerade som Party Member i Roll20 delar på XP.',
        players:
          'Karaktärer som styrs av en spelare delar på XP. Markera Party Member på karaktärer för att använda Roll20-gruppen i stället.',
        manual: 'Bara karaktärer som du tar med delar på XP.',
      },
      selectHint: 'Markera pjäser först för att lägga till dem i gruppen eller ta bort dem.',
    },
    kills: {
      prompt: '{name} besegrades. Lägga till {xp} XP i spelmötet?',
      noXp: '{name} besegrades, men dess blad har inget XP-värde.',
      reason: 'Besegrade {name}',
      result: {
        prompted: 'tillfrågad',
        added: 'tillagd',
        counted: 'redan räknad i detta spelmöte',
        noXp: 'ingen XP på bladet: använd --xp',
        notCreature: 'ingen varelse (inget blad, eller med i gruppen)',
      },
    },
    levels: {
      reached: '{name} har tillräckligt med XP för nivå {level}!',
      sheetButton: 'Använd knappen för nivåhöjning på karaktärsbladet.',
      updateSheet: 'Uppdatera nivån på karaktärsbladet.',
      pf2: 'Höj nivån på bladet och dra bort 1 000 från XP.',
      spend: 'Spendera XP och höj nivån på bladet.',
    },
    instant: {
      everyone: 'Alla i gruppen får {xp} XP.',
      bonus: '{names} får {xp} XP.',
    },
    end: {
      nothing: 'Ingen XP delades ut i detta spelmöte.',
      playerLine: '{name} får {xp} XP i detta spelmöte.',
      playerLineTotal: '{name} får {xp} XP i detta spelmöte, totalt {total} XP.',
      levelLine: '{name} nådde nivå {level}.',
      remainder: '{xp} XP gick inte att dela jämnt och förs över till nästa spelmöte.',
    },
    show: {
      noXp: 'ingen XP på bladet',
      next: 'nästa nivå vid {xp}',
    },
    awardKinds: { pool: 'Spelmötets XP', bonus: 'Bonus-XP', give: 'Given XP' },
    messages: {
      saved: 'Sparat.',
      commands: 'Kommandon: {commands}',
      aliasTaken: '{alias} är upptaget av {mods}. Använd !lazyxp.',
      migrated:
        'Dina inställningar, spelmötes-XP och extra XP från LazyExperience 0.1 har förts över.',
      handouts: 'Handouts för Hjälp, Command Deck och Spelmötslogg har byggts om.',
      noLog: 'Inget spelmöte har avslutats ännu, så det finns ingen spelmötslogg.',
      poolAdded: '{xp} XP lades till i spelmötet.',
      bonusAdded: '{xp} bonus-XP till {names}.',
      killAdded: '{xp} XP för {name} lades till i spelmötet.',
      killGone: 'Den segern har redan lagts till eller väntar inte längre.',
      undone: 'Tog tillbaka {xp} XP ({reason}).',
      nothingToUndo: 'Det finns inget att ångra i detta spelmöte.',
      nothingToUndoInstant:
        'XP har redan betalats ut. Använd give med ett negativt belopp för att rätta till det.',
      sessionReset: 'Spelmötets XP och bonusar rensades. Inget betalades ut.',
      absent: 'Markerade som frånvarande i detta spelmöte: {names}.',
      present: 'Markerade som närvarande: {names}.',
      party: {
        add: 'Lades till i gruppen: {names}.',
        remove: 'Togs bort från gruppen: {names}.',
      },
    },
    warnings: {
      sandbox:
        'Vissa karaktärer använder ett Beacon-blad (som D&D 2024), som Mod sandbox bara kan läsa och skriva på v1.5. Välj sandbox v1.5 i spelets Mod-inställningar.',
      partyLegacy:
        'Roll20-gruppen är en Jumpgate-funktion; i det här spelet för modden sin egen grupplista.',
      nobodyToPay: 'Ingen är med i gruppen, så {xp} XP sparas till senare.',
      write: {
        zero: '{name}: bladet kan inte sättas till 0 XP från en Mod. Ändra det på bladet.',
        sandbox: '{name}: det här bladet kräver Mod sandbox v1.5 för att uppdatera XP.',
        xpless:
          '{name}: det här spelsystemet använder inte XP (eller så räknar bladet ut det själv).',
        noField:
          '{name}: inget XP-fält är känt för det här bladet. Sätt Spelsystem till custom och ange fältet.',
        error: '{name}: bladet kunde inte uppdateras med {xp} XP. Se Mod-konsolen.',
      },
    },
    errors: {
      gmOnly: 'Bara spelledaren kan använda LazyExperience-kommandon.',
      failed: 'Något gick fel: {message}',
      unknownCommand: 'Okänt kommando "{name}".',
      helpHint: 'Skriv {command} help för kommandona.',
      unknownSetting: 'Okänd inställning "{name}".',
      settingsHint: 'Öppna inställningskortet för att se inställningarna.',
      badValue: '"{value}" är inte ett giltigt värde för {name}.',
      badXp: 'Ange XP som ett heltal, till exempel 250.',
      badShare: 'Ange andelen som ett tal från 0 till 10, till exempel 0,5 eller 50 %.',
      noCharacters: 'Markera pjäser som representerar karaktärer, eller använd --ids.',
      noTokens: 'Markera de besegrade pjäserna först, eller använd --ids.',
    },
    status: {
      version: 'Version',
      sandbox: 'Mod sandbox',
      beacon: 'Beacon-blad kan läsas',
      commands: 'Kommandon',
      profiles: 'Spelsystem som används',
      characters: '{count} karaktärer',
      handouts: 'Se handouts {help} och {deck}.',
    },
    log: {
      title: 'Spelmötslogg',
      sessionHeading: 'Spelmöte {number} — {date}',
      colCharacter: 'Karaktär',
      colXp: 'XP',
      awards: 'Tilldelningar',
      levelUps: 'Nivåer:',
      empty: 'Inget spelmöte har avslutats ännu.',
    },
    help: {
      menu: 'Visa huvudmenyn.',
      add: 'Lägg till XP i spelmötets pott, med en valfri orsak.',
      bonus: 'Ge de valda karaktärerna bonus-XP utöver deras andel.',
      give: 'Betala ut XP till de valda karaktärerna direkt.',
      kill: 'Räkna de valda pjäserna som besegrade och lägg till deras XP.',
      killConfirm:
        'Lägg till en besegrad varelses XP (knappen i frågan), eventuellt med ett annat belopp.',
      absent: 'Markera de valda karaktärerna som frånvarande i detta spelmöte.',
      present: 'Markera de valda karaktärerna som närvarande igen.',
      share: 'Ange de valda karaktärernas andel (1 = hel).',
      exclude: 'Utelämna karaktärer från gruppen, eller ta med dem igen.',
      undo: 'Ta tillbaka den senaste tilldelningen som inte har betalats ut.',
      end: 'Avsluta spelmötet: betala ut XP, tillkännage det och logga det.',
      resetSession: 'Rensa spelmötets XP utan att betala ut den.',
      show: 'Visa varje gruppmedlems XP och nivå från bladet.',
      roster: 'Visa gruppkortet.',
      party: 'Kryssa i eller ur Roll20:s ruta Party Member för de valda karaktärerna.',
      settings: 'Visa inställningskortet.',
      set: 'Ändra en inställning.',
      lang: 'Välj språk.',
      status: 'Visa sandbox, kommandon och använda spelsystem.',
      log: 'Länk till handouten Spelmötslogg.',
      journal: 'Bygg om handouts.',
      help: 'Visa den här hjälpen.',
      handouts: 'Mer i handouts {help} och {deck}.',
    },
    deck: {
      session: 'Spelmöte',
      sessionDesc: 'Lägg till XP i spelmötet, kontrollera gruppen och avsluta spelmötet.',
      selected: 'Valda pjäser',
      selectedDesc: 'Markera pjäser på kartan först.',
      party: 'Grupp',
      partyDesc: 'Vem som delar på XP.',
      tools: 'Verktyg',
      toolsDesc: 'Inställningar, status och hjälp.',
      footer: 'Knapparna kör LazyExperience-kommandon. Se handouten {help} för detaljer.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Spelmötets erfarenhet, rättvist fördelad, på vilket blad som helst',
      footer: 'Knappar för alla kommandon finns i handouten {deck}.',
      overview: {
        heading: 'Översikt',
        body: 'LazyExperience samlar ihop de erfarenhetspoäng som tjänas under ett spelmöte, delar dem mellan gruppen och skriver dem till karaktärsbladen. Det läser och skriver D&D 2024-bladet såväl som äldre och andra blad, använder Roll20:s egen grupp, märker när varelser besegras, hanterar frånvarande spelare och bonus-XP, tillkännager nivåhöjningar och för logg över varje spelmöte.',
      },
      quickStart: {
        heading: 'Snabbstart',
        steps: [
          'Markera Party Member på varje spelarkaraktär (i karaktärsfönstrets inställningar), eller låt bli: karaktärer som styrs av spelare används.',
          'Skriv !lazyxp för att öppna menyn.',
          'När gruppen besegrar en varelse frågar systemet om du vill lägga till dess XP när dess HP-fält når 0. Du kan också markera pjäser och trycka på Besegrad: Valda.',
          'Lägg till XP för allt annat med Lägg till XP, och bonus-XP för en karaktär med Bonus: Valda.',
          'Markera spelare som missade spelmötet som Frånvarande.',
          'Tryck på Avsluta spelmöte. Allas andel skrivs till deras blad, tillkännages och läggs till i handouten Spelmötslogg.',
        ],
      },
      commands: {
        heading: 'Kommandon',
        intro:
          'Varje kommando börjar med !lazyxp; {long} fungerar också, och det gör {short} så länge ingen annan XP-Mod använder det. Bara spelledaren kan använda dem.',
        targets:
          'Kommandon för karaktärer använder de valda pjäserna, eller --ids följt av karaktärs- eller pjäs-ID:n åtskilda med kommatecken.',
        colCommand: 'Kommando',
        colDesc: 'Vad det gör',
      },
      party: {
        heading: 'Gruppen',
        points: [
          'Automatiskt: när någon karaktär är markerad som Party Member i Roll20 (Jumpgate) delar Roll20-gruppen på XP; annars gör varje karaktär som styrs av en spelare det.',
          'Karaktärer som bara styrs av "All players", till exempel hjälppjäser, räknas inte.',
          'Grupp lägg till och Grupp ta bort kryssar i eller ur Party Member för de valda karaktärerna.',
          'Utelämna tar bort en karaktär från gruppen för gott; Ta med sätter tillbaka den.',
          'En karaktär som styrs av flera spelare räknas en gång.',
        ],
      },
      splitting: {
        heading: 'Fördela XP',
        points: [
          'Spelmötets XP delas med antalet andelar: en per gruppmedlem, plus eventuella extra andelar.',
          'Frånvarande karaktärer får inställningen Frånvaroandel (0 % som standard). Frånvaron gäller ett spelmöte.',
          'En karaktär kan ha en annan andel, till exempel 0,5 för en hjälte-assistent.',
          'Bonus-XP går till de valda karaktärerna utöver deras andel.',
          'XP som inte går att dela jämnt förs över till nästa spelmöte.',
          'Med Utbetala XP satt till instant delas och betalas varje tilldelning ut direkt.',
        ],
      },
      kills: {
        heading: 'Besegrade varelser',
        points: [
          'En varelse räknas som besegrad när dess HP-fält sjunker till 0, när markören för besegrad sätts på, eller när DeathTracker markerar den som död.',
          'Ändringar som görs av TokenMod, av bladet eller av andra Mods via det länkade attributet märks också.',
          'Bara pjäser för karaktärer utanför gruppen som ingen spelare styr räknas, och varje pjäs bara en gång per spelmöte.',
          'XP kommer från bladet: varelsens XP-värde, eller dess utmaningsgrad.',
          'Fråga spelledaren (standard) viskar en fråga med Lägg till, Annat belopp och Ignorera. Lägg till automatiskt hoppar över frågan.',
        ],
      },
      levels: {
        heading: 'Nivåhöjningar',
        points: [
          'När XP har skrivits kontrollerar LazyExperience systemets nivåtabell och tillkännager när en karaktär har tillräckligt med XP för en ny nivå.',
          'På D&D 2024-bladet trycker spelaren sedan på bladets knapp för nivåhöjning.',
        ],
      },
      systems: {
        heading: 'Spelsystem',
        intro:
          'LazyExperience väljer en profil från varje karaktärs blad. Sätt Spelsystem för att tvinga fram en, eller till custom för att ange fälten själv.',
        colSystem: 'System',
        colId: 'ID',
        colSheets: 'Blad',
        colChecked: 'Kontrollerat',
        verified: {
          live: 'Testat i Roll20',
          partial: 'Delvis testat i Roll20',
          source: 'Från bladets källkod',
          none: '—',
        },
        points: [
          'Välj bladet efter dess namn i spelets Inställningar. Blad som inte finns i listan använder de vanliga fältnamnen experience, xp och level, eller sätt Spelsystem till custom.',
          'Testat i Roll20 betyder att XP skrevs till det bladet i ett Jumpgate-spel, bladets egna beräkningar kördes, och besegrade varelser och nivåmeddelanden kontrollerades.',
          'Beacon-blad som D&D 2024 kräver Mod sandbox v1.5, och en Mod kan inte sätta dem till 0 XP.',
          'Pathfinder 1E och Starfinder använder bladets ruta för XP till nästa nivå för nivåmeddelanden. När den är tom använder Pathfinder den medelsnabba banan och Starfinder sin egen tabell.',
          'WFRP 4E: varje tilldelning läggs till som en rad i bladets Experience-lista, men bladet räknade inte om sina XP-summor under testningen, så kontrollera dem på bladet.',
          'Savage Worlds, 13th Age, Cosmere och Call of Cthulhu har ingen XP som en Mod kan skriva.',
        ],
      },
      settings: {
        heading: 'Inställningar',
        intro:
          'Ändra inställningar på inställningskortet, eller med !lazyxp set <setting> <value>.',
        colKey: 'Inställning',
        colName: 'Namn',
        colDesc: 'Vad det gör',
      },
      upgrading: {
        heading: 'Uppgradera från 0.1',
        points: [
          'Inställningar, spelmötes-XP och extra XP per karaktär från 0.1 förs över första gången 1.0 startar.',
          'Spelare eller karaktärer som inte var aktiva utelämnas från gruppen.',
          'Ett eget kommandonamn från 0.1 fortsätter att fungera.',
          'De gamla kommandona fungerar fortfarande:',
        ],
        colV1: '0.1',
        colV2: '1.0',
      },
      troubleshooting: {
        heading: 'Felsökning',
        points: [
          'Inget skrivs till D&D 2024-blad: kontrollera att spelet använder Mod sandbox v1.5 (!lazyxp status).',
          'En varelse ger 0 XP: dess blad har varken XP eller utmaningsgrad. Använd Annat belopp, eller !lazyxp kill --xp 100.',
          'Segrar märks inte: kontrollera att HP-fält är det fält som innehåller träffpoäng.',
          '!xp gör ingenting: en annan XP-Mod använder det. Använd !lazyxp.',
        ],
      },
      languages: {
        heading: 'Språk',
        body: 'Välj språk med !lazyxp lang. Chattkort och handouts ändras direkt.',
        colLanguage: 'Språk',
        colNative: 'Namn',
        colCode: 'Kod',
      },
      credits: {
        heading: 'Tack till',
        original: 'Skapad av',
        maintainer: 'Omskriven och underhållen av',
        support: 'Felrapporter och idéer är välkomna på Roll20-forumet.',
      },
    },
  };

  var localeTr = {
    titles: {
      ready: 'LazyExperience hazır.',
      help: 'LazyExperience Yardım',
      settings: 'LazyExperience Ayarları',
      status: 'LazyExperience Durumu',
      roster: 'Grup',
      language: 'Dil',
      levelUp: 'Seviye Atlama!',
      defeated: 'Yaratık Yenildi',
      xpAwarded: 'Deneyim Verildi',
      sessionEnded: '{number}. Oturum Bitti',
      yourXp: 'Deneyimin',
      pool: 'Oturum XP',
      bonus: 'Bonus XP',
      undo: 'Geri Al',
      log: 'Oturum Günlüğü',
      partyXp: 'Grup Deneyimi',
    },
    menu: {
      session: 'Oturum',
      pool: 'Oturum XP',
      payout: 'Ödenen',
      shares: 'Paylar',
      perShare: 'Pay başına XP',
      party: 'Grup ({source})',
      noParty: 'Grupta henüz kimse yok. Karakter eklemek için Grup kartını aç.',
      absentTag: '(yok)',
      bonusTag: '(+{xp} bonus)',
      levelTag: 'Seviye {level}',
      shareTag: 'Pay {share}',
      rosterSource: 'Grubun kaynağı',
      excluded: 'Dışarıda bırakılanlar',
      blank: '(boş)',
      groupXp: 'Deneyim',
      groupParty: 'Grup',
      groupKills: 'Yenilen yaratıklar',
      groupSheet: 'Karakter kâğıdı',
    },
    buttons: {
      menu: 'Menü',
      help: 'Yardım',
      settings: 'Ayarlar',
      status: 'Durum',
      roster: 'Grup',
      addXp: 'XP Ekle',
      killSelected: 'Yenildi: Seçililer',
      bonusSelected: 'Bonus: Seçililer',
      giveSelected: 'Hemen Ver: Seçililer',
      endSession: 'Oturumu Bitir',
      undo: 'Geri Al',
      show: 'Grup XP',
      log: 'Oturum Günlüğü',
      absent: 'Yok',
      present: 'Var',
      share: 'Pay',
      exclude: 'Dışarıda Bırak',
      include: 'Dahil Et',
      partyAdd: 'Seçilileri Gruba Ekle',
      partyRemove: 'Seçilileri Çıkar',
      addKill: '{xp} XP Ekle',
      otherXp: 'Başka Miktar',
      ignore: 'Yoksay',
    },
    prompts: {
      xp: 'XP',
      reason: 'Neden (isteğe bağlı)',
      share: 'Pay (1 = tam, 0,5 = yarım)',
      confirmEnd: 'Oturum bitirilsin ve XP dağıtılsın mı?',
    },
    options: {
      yesNo: { yes: 'Evet', no: 'Hayır' },
      payout: { end: 'Oturum sonunda', instant: 'Hemen' },
      roster: {
        auto: 'Otomatik',
        party: 'Roll20 grubu',
        players: 'Oyuncuların karakterleri',
        manual: 'Oyun Yöneticisi seçer',
      },
      killMode: { prompt: 'Oyun Yöneticisine sor', auto: 'Otomatik ekle', off: 'Kapalı' },
      announce: {
        public: 'Herkes',
        whisper: 'İlgili oyuncular',
        gm: 'Yalnızca Oyun Yöneticisi',
        off: 'Kapalı',
      },
      levelNotice: {
        public: 'Herkes',
        whisper: 'Oyuncu ve Oyun Yöneticisi',
        gm: 'Yalnızca Oyun Yöneticisi',
        off: 'Kapalı',
      },
      system: { auto: 'Karakter kâğıdından algıla' },
    },
    settings: {
      language: { label: 'Dil', desc: 'Sohbet kartları ve handout’lar için dil.' },
      payout: {
        label: 'XP ödemesi',
        desc: 'end: XP oturum havuzunda birikir ve oturum bitince dağıtılır. instant: her ödül hemen bölünür ve ödenir.',
      },
      updateSheets: {
        label: 'Kâğıtları güncelle',
        desc: 'XP’yi karakter kâğıtlarına yazar. Kapalıyken toplamlar yalnızca duyurulur.',
      },
      system: {
        label: 'Oyun sistemi',
        desc: 'Hangi kâğıt alanlarının XP ve seviyeyi tuttuğu. auto, her karakterin kâğıdına göre profil seçer; custom, özel alan ayarlarını kullanır.',
      },
      roster: {
        label: 'Grubun kaynağı',
        desc: 'auto: içinde biri varsa Roll20 grubu, yoksa oyuncuların kontrol ettiği karakterler. party, players veya manual birini seçer.',
      },
      absentShare: {
        label: 'Yoklarının payı',
        desc: 'Olmayan bir karakterin yine de aldığı payın oranı, 0% (hiç) ile 100% (tam) arasında.',
      },
      extraShares: {
        label: 'Ek paylar',
        desc: 'Kâğıdı olmayan yoldaşlar veya kiralık adamlar için paylar. Onların XP’si kimseye ödenmez.',
      },
      killMode: {
        label: 'Yenilen yaratıklar',
        desc: 'prompt: bir yaratığın XP’sini eklemeden önce Oyun Yöneticisine sor. auto: hemen ekle. off: token’ları izleme.',
      },
      killBar: {
        label: 'HP çubuğunu izle',
        desc: 'HP çubuğu 0 veya altına düşen yaratığı yenilmiş sayar.',
      },
      hpBar: {
        label: 'HP çubuğu',
        desc: 'Hangi token çubuğunun (1, 2 veya 3) can puanını tuttuğu.',
      },
      killMarker: {
        label: 'İşaretçiyi izle',
        desc: 'Token’ına yenildi işaretçisi konan yaratığı yenilmiş sayar.',
      },
      marker: {
        label: 'Yenildi işaretçisi',
        desc: 'Yenilmiş anlamına gelen işaretçi: dead gibi yerleşik bir ad veya özel bir işaretçinin adı.',
      },
      killDeathTracker: {
        label: 'DeathTracker kullan',
        desc: 'DeathTracker 1.0 veya üstü bir yaratığı ölü olarak işaretlediğinde onu yenilmiş sayar.',
      },
      announce: {
        label: 'XP mesajları',
        desc: 'XP ödüllerini ve oturum sonu özetini kimin gördüğü: public (herkes), whisper (ilgili oyuncular ve Oyun Yöneticisi), gm veya off.',
      },
      levelNotice: {
        label: 'Seviye atlama bildirimleri',
        desc: 'Seviye atlama bildirimlerini kimin gördüğü: public (herkes), whisper (oyuncu ve Oyun Yöneticisi), gm veya off.',
      },
      customXp: {
        label: 'Özel XP alanı',
        desc: 'Oyun sistemi custom olduğunda karakterin XP’si için kâğıt alanı. Liste, adları sırayla dener.',
      },
      customLevel: { label: 'Özel seviye alanı', desc: 'Karakterin seviyesi için kâğıt alanı.' },
      customNpcXp: {
        label: 'Özel yaratık XP alanı',
        desc: 'Bir yaratığın değerindeki XP için kâğıt alanı.',
      },
      customNpcCr: {
        label: 'Özel meydan okuma alanı',
        desc: 'Yaratığın meydan okuma derecesi için kâğıt alanı; XP değeri yoksa kullanılır.',
      },
      customLevels: {
        label: 'Özel seviye tablosu',
        desc: '1. seviyeden başlayarak her seviye için gereken XP, örneğin 0,300,900,2700. Boş bırakılırsa özel kâğıtlar için seviye atlama bildirimleri kapanır.',
      },
    },
    roster: {
      explain: {
        party: 'Roll20’de Party Member olarak işaretlenen karakterler XP’yi paylaşır.',
        players:
          'Bir oyuncunun kontrol ettiği karakterler XP’yi paylaşır. Roll20 grubunu kullanmak için karakterlerde Party Member’ı işaretle.',
        manual: 'XP’yi yalnızca dahil ettiğin karakterler paylaşır.',
      },
      selectHint: 'Gruba eklemek veya çıkarmak için önce token’ları seç.',
    },
    kills: {
      prompt: '{name} yenildi. Oturuma {xp} XP eklensin mi?',
      noXp: '{name} yenildi ama kâğıdında XP değeri yok.',
      reason: 'Yenilen: {name}',
      result: {
        prompted: 'soruldu',
        added: 'eklendi',
        counted: 'bu oturumda zaten sayıldı',
        noXp: 'kâğıtta XP yok: --xp kullan',
        notCreature: 'yaratık değil (kâğıdı yok veya grupta)',
      },
    },
    levels: {
      reached: '{name}, {level}. seviye için yeterli XP’ye sahip!',
      sheetButton: 'Karakter kâğıdındaki Level Up düğmesini kullan.',
      updateSheet: 'Karakter kâğıdındaki seviyeyi güncelle.',
      pf2: 'Kâğıttaki seviyeyi yükselt ve XP’den 1.000 düş.',
      spend: 'XP’yi harca ve kâğıttaki seviyeyi yükselt.',
    },
    instant: {
      everyone: 'Gruptaki herkes {xp} XP kazanır.',
      bonus: '{names} {xp} XP kazanır.',
    },
    end: {
      nothing: 'Bu oturumda XP verilmedi.',
      playerLine: '{name} bu oturumda {xp} XP kazanır.',
      playerLineTotal: '{name} bu oturumda {xp} XP kazanır, toplam {total} XP olur.',
      levelLine: '{name}, {level}. seviyeye ulaştı.',
      remainder: '{xp} XP eşit bölünemedi ve sonraki oturuma devrediyor.',
    },
    show: {
      noXp: 'kâğıtta XP yok',
      next: 'sonraki seviye: {xp}',
    },
    awardKinds: { pool: 'Oturum XP', bonus: 'Bonus XP', give: 'Verilen XP' },
    messages: {
      saved: 'Kaydedildi.',
      commands: 'Komutlar: {commands}',
      aliasTaken: '{alias}, {mods} tarafından kullanılıyor. !lazyxp kullan.',
      migrated: 'LazyExperience 0.1 ayarların, oturum XP’n ve ek XP’n taşındı.',
      handouts: 'Yardım, Command Deck ve Oturum Günlüğü handout’ları yeniden oluşturuldu.',
      noLog: 'Henüz biten bir oturum yok, bu yüzden Oturum Günlüğü yok.',
      poolAdded: 'Oturuma {xp} XP eklendi.',
      bonusAdded: '{names} için {xp} bonus XP.',
      killAdded: '{name} için {xp} XP oturuma eklendi.',
      killGone: 'Bu yenilgi zaten eklendi veya artık beklemede değil.',
      undone: '{xp} XP geri alındı ({reason}).',
      nothingToUndo: 'Bu oturumda geri alınacak bir şey yok.',
      nothingToUndoInstant:
        'XP zaten ödendi. Düzeltmek için give komutunu negatif bir miktarla kullan.',
      sessionReset: 'Oturum XP’si ve bonuslar temizlendi. Hiçbir şey ödenmedi.',
      absent: 'Bu oturum için yok olarak işaretlendi: {names}.',
      present: 'Var olarak işaretlendi: {names}.',
      party: {
        add: 'Gruba eklendi: {names}.',
        remove: 'Gruptan çıkarıldı: {names}.',
      },
    },
    warnings: {
      sandbox:
        'Bazı karakterler Beacon kâğıdı kullanıyor (D&D 2024 gibi); Mod sandbox bunu yalnızca v1.5’te okuyup yazabilir. Oyunun Mod ayarlarında sandbox v1.5’i seç.',
      partyLegacy:
        'Roll20 grubu bir Jumpgate özelliğidir; bu oyunda mod kendi grup listesini tutar.',
      nobodyToPay: 'Grupta kimse yok, bu yüzden {xp} XP sonrası için saklanıyor.',
      write: {
        zero: '{name}: kâğıt bir Mod’dan 0 XP’ye ayarlanamaz. Kâğıt üzerinde değiştir.',
        sandbox: '{name}: bu kâğıdın XP’sini güncellemek için Mod sandbox v1.5 gerekir.',
        xpless: '{name}: bu oyun sistemi XP kullanmıyor (veya kâğıt kendisi hesaplıyor).',
        noField:
          '{name}: bu kâğıt için bilinen bir XP alanı yok. Oyun sistemini custom yap ve alanın adını ver.',
        error: '{name}: kâğıt {xp} XP ile güncellenemedi. Mod konsoluna bak.',
      },
    },
    errors: {
      gmOnly: 'LazyExperience komutlarını yalnızca Oyun Yöneticisi kullanabilir.',
      failed: 'Bir şeyler ters gitti: {message}',
      unknownCommand: 'Bilinmeyen komut "{name}".',
      helpHint: 'Komutlar için {command} help yaz.',
      unknownSetting: 'Bilinmeyen ayar "{name}".',
      settingsHint: 'Ayarları görmek için ayarlar kartını aç.',
      badValue: '"{value}", {name} için geçerli bir değer değil.',
      badXp: 'XP’yi 250 gibi bir tam sayı olarak ver.',
      badShare: 'Payı 0 ile 10 arasında, 0.5 veya 50% gibi bir sayı olarak ver.',
      noCharacters: 'Karakterleri temsil eden token’ları seç veya --ids kullan.',
      noTokens: 'Önce yenilen token’ları seç veya --ids kullan.',
    },
    status: {
      version: 'Sürüm',
      sandbox: 'Mod sandbox',
      beacon: 'Beacon kâğıtları okunabiliyor',
      commands: 'Komutlar',
      profiles: 'Kullanılan oyun sistemleri',
      characters: '{count} karakter',
      handouts: '{help} ve {deck} handout’larına bak.',
    },
    log: {
      title: 'Oturum Günlüğü',
      sessionHeading: '{number}. Oturum — {date}',
      colCharacter: 'Karakter',
      colXp: 'XP',
      awards: 'Ödüller',
      levelUps: 'Seviyeler:',
      empty: 'Henüz biten bir oturum yok.',
    },
    help: {
      menu: 'Ana menüyü göster.',
      add: 'Oturum havuzuna XP ekle, isteğe bağlı bir nedenle.',
      bonus: 'Seçili karakterlere paylarına ek olarak bonus XP ver.',
      give: 'Seçili karakterlere XP’yi hemen öde.',
      kill: 'Seçili token’ları yenilmiş say ve XP’lerini ekle.',
      killConfirm:
        'Yenilen bir yaratığın XP’sini ekle (soru kartındaki düğme), isteğe bağlı olarak başka bir miktarla.',
      absent: 'Seçili karakterleri bu oturum için yok olarak işaretle.',
      present: 'Seçili karakterleri yeniden var olarak işaretle.',
      share: 'Seçili karakterlerin payını ayarla (1 = tam).',
      exclude: 'Karakterleri gruptan dışarıda bırak veya yeniden dahil et.',
      undo: 'Henüz ödenmemiş son ödülü geri al.',
      end: 'Oturumu bitir: XP’yi öde, duyur ve günlüğe kaydet.',
      resetSession: 'Oturum XP’sini ödemeden temizle.',
      show: 'Her grup üyesinin kâğıttaki XP ve seviyesini göster.',
      roster: 'Grup kartını göster.',
      party:
        'Seçili karakterler için Roll20’nin Party Member kutusunu işaretle veya işaretini kaldır.',
      settings: 'Ayarlar kartını göster.',
      set: 'Bir ayarı değiştir.',
      lang: 'Dili seç.',
      status: 'Sandbox’ı, komutları ve kullanılan oyun sistemlerini göster.',
      log: 'Oturum Günlüğü handout’una bağlantı.',
      journal: 'Handout’ları yeniden oluştur.',
      help: 'Bu yardımı göster.',
      handouts: '{help} ve {deck} handout’larında daha fazlası var.',
    },
    deck: {
      session: 'Oturum',
      sessionDesc: 'Oturuma XP ekle, grubu kontrol et ve oturumu bitir.',
      selected: 'Seçili token’lar',
      selectedDesc: 'Önce haritadan token’ları seç.',
      party: 'Grup',
      partyDesc: 'XP’yi kimlerin paylaştığı.',
      tools: 'Araçlar',
      toolsDesc: 'Ayarlar, durum ve yardım.',
      footer:
        'Düğmeler LazyExperience komutlarını çalıştırır. Ayrıntılar için {help} handout’una bak.',
    },
    handout: {
      versionLabel: 'Sürüm',
      subtitle: 'Oturum deneyimi, her kâğıtta adil şekilde bölünür',
      footer: 'Her komutun düğmeleri {deck} handout’unda.',
      overview: {
        heading: 'Genel bakış',
        body: 'LazyExperience, bir oturum boyunca kazanılan deneyim puanlarını toplar, grup arasında böler ve karakter kâğıtlarına yazar. D&D 2024 kâğıdını, eski ve diğer kâğıtları okur ve yazar, Roll20’nin kendi grubunu kullanır, yenilen yaratıkları fark eder, olmayan oyuncuları ve bonus XP’yi yönetir, seviye atlamaları duyurur ve her oturumun günlüğünü tutar.',
      },
      quickStart: {
        heading: 'Hızlı başlangıç',
        steps: [
          'Her oyuncu karakterinde Party Member’ı işaretle (karakter penceresinin ayarlarında) ya da boş bırak: oyuncuların kontrol ettiği karakterler kullanılır.',
          'Menüyü açmak için !lazyxp yaz.',
          'Grup bir yaratığı yendiğinde HP çubuğunun 0’a düşmesi, XP’sinin eklenip eklenmeyeceğini sorar. Ayrıca token’ları seçip Yenildi: Seçililer düğmesine basabilirsin.',
          'Başka her şey için XP Ekle ile XP ekle, tek bir karaktere bonus XP için Bonus: Seçililer’i kullan.',
          'Oturuma gelmeyen oyuncuları Yok olarak işaretle.',
          'Oturumu Bitir’e bas. Herkesin payı kâğıtlarına yazılır, duyurulur ve Oturum Günlüğü handout’una eklenir.',
        ],
      },
      commands: {
        heading: 'Komutlar',
        intro:
          'Her komut şununla başlar: !lazyxp; {long} da çalışır, başka bir XP Mod’u kullanmadığı sürece {short} da çalışır. Yalnızca Oyun Yöneticisi kullanabilir.',
        targets:
          'Karakter komutları seçili token’ları kullanır ya da virgülle ayrılmış karakter veya token kimliklerinin izlediği --ids kullanılır.',
        colCommand: 'Komut',
        colDesc: 'Ne yapar',
      },
      party: {
        heading: 'Grup',
        points: [
          'Otomatik: Roll20’de (Jumpgate) herhangi bir karakter Party Member olarak işaretliyse XP’yi Roll20 grubu paylaşır; değilse oyuncuların kontrol ettiği her karakter paylaşır.',
          'Yalnızca "All players" tarafından kontrol edilen karakterler, örneğin yardımcı token’lar, sayılmaz.',
          'Gruba ekle ve Gruptan çıkar, seçili karakterler için Party Member’ı işaretler veya işaretini kaldırır.',
          'Dışarıda Bırak bir karakteri gruptan kalıcı olarak çıkarır; Dahil Et geri koyar.',
          'Birden fazla oyuncunun kontrol ettiği karakter bir kez sayılır.',
        ],
      },
      splitting: {
        heading: 'XP’yi bölme',
        points: [
          'Oturum XP’si pay sayısına bölünür: grup üyesi başına bir pay, artı varsa ek paylar.',
          'Olmayan karakterler Yoklarının payı ayarını alır (varsayılan 0%). Yokluk bir oturum sürer.',
          'Bir karakterin farklı bir payı olabilir, örneğin yardımcı için 0,5.',
          'Bonus XP, seçilen karakterlere paylarına ek olarak gider.',
          'Eşit bölünemeyen XP sonraki oturuma devreder.',
          'XP ödemesi instant olduğunda her ödül hemen bölünür ve ödenir.',
        ],
      },
      kills: {
        heading: 'Yenilen yaratıklar',
        points: [
          'Bir yaratık, HP çubuğu 0’a düştüğünde, yenildi işaretçisi konduğunda veya DeathTracker onu ölü olarak işaretlediğinde yenilmiş sayılır.',
          'TokenMod, kâğıt veya diğer Mod’lar tarafından bağlı öznitelik üzerinden yapılan değişiklikler de fark edilir.',
          'Yalnızca grup dışındaki ve hiçbir oyuncunun kontrol etmediği karakterlerin token’ları sayılır ve her token oturum başına yalnızca bir kez.',
          'XP kâğıttan gelir: yaratığın XP değeri veya meydan okuma derecesi.',
          'Oyun Yöneticisine sor (varsayılan), Ekle, Başka Miktar ve Yoksay düğmeleriyle fısıltıyla bir soru gönderir. Otomatik ekle soruyu atlar.',
        ],
      },
      levels: {
        heading: 'Seviye atlama',
        points: [
          'XP yazıldıktan sonra LazyExperience sistemin seviye tablosunu kontrol eder ve bir karakter yeni seviye için yeterli XP’ye sahip olduğunda duyurur.',
          'D&D 2024 kâğıdında oyuncu bunun üzerine kâğıttaki Level Up düğmesine basar.',
        ],
      },
      systems: {
        heading: 'Oyun sistemleri',
        intro:
          'LazyExperience her karakterin kâğıdına göre bir profil seçer. Birini zorlamak için Oyun sistemini ayarla; alanları kendin adlandırmak için custom yap.',
        colSystem: 'Sistem',
        colId: 'ID',
        colSheets: 'Kâğıtlar',
        colChecked: 'Kontrol edildi',
        verified: {
          live: 'Roll20’de test edildi',
          partial: 'Roll20’de kısmen test edildi',
          source: 'Kâğıdın kaynağından',
          none: '—',
        },
        points: [
          'Kâğıdı, oyunun Ayarlar bölümündeki adıyla seç. Listede olmayan kâğıtlar yaygın alan adları olan experience, xp ve level’i kullanır; ya da Oyun sistemini custom yap.',
          'Roll20’de test edildi, XP’nin o kâğıda bir Jumpgate oyununda yazıldığı, kâğıdın kendi hesaplamalarının çalıştığı ve yenilen yaratıklarla seviye atlama bildirimlerinin kontrol edildiği anlamına gelir.',
          'D&D 2024 gibi Beacon kâğıtları Mod sandbox v1.5 gerektirir ve bir Mod tarafından 0 XP’ye ayarlanamaz.',
          'Pathfinder 1E ve Starfinder, seviye atlama bildirimleri için kâğıdın sonraki seviye XP kutusunu kullanır. Boşsa Pathfinder orta ilerleme hızını, Starfinder ise kendi tablosunu kullanır.',
          'WFRP 4E: her ödül kâğıdın Experience listesine bir satır olarak eklenir, ancak testte kâğıt XP toplamlarını yeniden hesaplamadı; bu yüzden onları kâğıt üzerinden kontrol et.',
          'Savage Worlds, 13th Age, Cosmere ve Call of Cthulhu’da bir Mod’un yazabileceği XP yoktur.',
        ],
      },
      settings: {
        heading: 'Ayarlar',
        intro: 'Ayarları ayarlar kartından veya !lazyxp set <setting> <value> ile değiştir.',
        colKey: 'Ayar',
        colName: 'Ad',
        colDesc: 'Ne yapar',
      },
      upgrading: {
        heading: '0.1’den yükseltme',
        points: [
          '0.1’deki ayarlar, oturum XP’si ve karakter başına ek XP, 1.0 ilk başladığında taşınır.',
          'Etkin olmayan oyuncular veya karakterler gruptan çıkarılır.',
          '0.1’deki özel komut adı çalışmaya devam eder.',
          'Eski komutlar hâlâ çalışır:',
        ],
        colV1: '0.1',
        colV2: '1.0',
      },
      troubleshooting: {
        heading: 'Sorun giderme',
        points: [
          'D&D 2024 kâğıtlarına hiçbir şey yazılmıyor: oyunun Mod sandbox v1.5 kullandığını kontrol et (!lazyxp status).',
          'Bir yaratık 0 XP veriyor: kâğıdında XP veya meydan okuma derecesi yok. Başka Miktar’ı veya !lazyxp kill --xp 100 komutunu kullan.',
          'Yenilgiler fark edilmiyor: HP çubuğunun can puanını tutan çubuk olduğunu kontrol et.',
          '!xp bir şey yapmıyor: başka bir XP Mod’u kullanıyor. !lazyxp kullan.',
        ],
      },
      languages: {
        heading: 'Diller',
        body: '!lazyxp lang ile dil seç. Sohbet kartları ve handout’lar hemen değişir.',
        colLanguage: 'Dil',
        colNative: 'Ad',
        colCode: 'Kod',
      },
      credits: {
        heading: 'Emeği geçenler',
        original: 'Oluşturan',
        maintainer: 'Yeniden yazan ve sürdüren',
        support: 'Hata bildirimleri ve fikirler Roll20 forumunda memnuniyetle karşılanır.',
      },
    },
  };

  var localeUk = {
    titles: {
      ready: 'LazyExperience готовий до роботи.',
      help: 'Довідка LazyExperience',
      settings: 'Налаштування LazyExperience',
      status: 'Стан LazyExperience',
      roster: 'Група',
      language: 'Мова',
      levelUp: 'Новий рівень!',
      defeated: 'Істоту переможено',
      xpAwarded: 'Досвід нараховано',
      sessionEnded: 'Сесію {number} завершено',
      yourXp: 'Ваш досвід',
      pool: 'Досвід сесії',
      bonus: 'Бонусний досвід',
      undo: 'Скасування',
      log: 'Журнал сесій',
      partyXp: 'Досвід групи',
    },
    menu: {
      session: 'Сесія',
      pool: 'Досвід сесії',
      payout: 'Виплачено',
      shares: 'Частки',
      perShare: 'XP на частку',
      party: 'Група ({source})',
      noParty: 'У групі поки нікого немає. Відкрийте картку «Група», щоб додати персонажів.',
      absentTag: '(відсутній)',
      bonusTag: '(+{xp} бонус)',
      levelTag: 'Рівень {level}',
      shareTag: 'Частка {share}',
      rosterSource: 'Склад групи',
      excluded: 'Виключені',
      blank: '(порожньо)',
      groupXp: 'Досвід',
      groupParty: 'Група',
      groupKills: 'Переможені істоти',
      groupSheet: 'Аркуш персонажа',
    },
    buttons: {
      menu: 'Меню',
      help: 'Довідка',
      settings: 'Налаштування',
      status: 'Стан',
      roster: 'Група',
      addXp: 'Додати XP',
      killSelected: 'Переможені: вибрані',
      bonusSelected: 'Бонус: вибраним',
      giveSelected: 'Видати одразу: вибраним',
      endSession: 'Завершити сесію',
      undo: 'Скасувати',
      show: 'XP групи',
      log: 'Журнал сесій',
      absent: 'Відсутній',
      present: 'Присутній',
      share: 'Частка',
      exclude: 'Виключити',
      include: 'Повернути',
      partyAdd: 'Додати вибраних до групи',
      partyRemove: 'Прибрати вибраних',
      addKill: 'Додати {xp} XP',
      otherXp: 'Інша кількість',
      ignore: 'Ігнорувати',
    },
    prompts: {
      xp: 'XP',
      reason: 'Причина (необов’язково)',
      share: 'Частка (1 = повна, 0.5 = половина)',
      confirmEnd: 'Завершити сесію та роздати XP?',
    },
    options: {
      yesNo: { yes: 'Так', no: 'Ні' },
      payout: { end: 'Наприкінці сесії', instant: 'Одразу' },
      roster: {
        auto: 'Автоматично',
        party: 'Група Roll20',
        players: 'Персонажі гравців',
        manual: 'Обирає ГМ',
      },
      killMode: { prompt: 'Запитати ГМ', auto: 'Додавати автоматично', off: 'Вимкнено' },
      announce: { public: 'Усі', whisper: 'Причетні гравці', gm: 'Лише ГМ', off: 'Вимкнено' },
      levelNotice: {
        public: 'Усі',
        whisper: 'Гравець і ГМ',
        gm: 'Лише ГМ',
        off: 'Вимкнено',
      },
      system: { auto: 'Визначати за аркушем' },
    },
    settings: {
      language: { label: 'Мова', desc: 'Мова карток у чаті та хендаутів.' },
      payout: {
        label: 'Виплата XP',
        desc: 'end: XP збирається в досвіді сесії та роздається після її завершення. instant: кожна нагорода ділиться й виплачується одразу.',
      },
      updateSheets: {
        label: 'Оновлювати аркуші',
        desc: 'Записувати XP в аркуші персонажів. Якщо вимкнено, підсумки лише оголошуються.',
      },
      system: {
        label: 'Ігрова система',
        desc: 'У яких полях аркуша зберігаються XP та рівень. auto вибирає профіль за аркушем кожного персонажа; custom використовує власні поля.',
      },
      roster: {
        label: 'Склад групи',
        desc: 'auto: група Roll20, якщо в ній хтось є, інакше персонажі, якими керують гравці. party, players або manual вибирають один варіант.',
      },
      absentShare: {
        label: 'Частка відсутніх',
        desc: 'Частина частки, яку відсутній персонаж усе одно отримує: від 0% (нічого) до 100% (повна частка).',
      },
      extraShares: {
        label: 'Додаткові частки',
        desc: 'Частки для супутників і найманців, яких немає на аркуші. Їхній XP нікому не виплачується.',
      },
      killMode: {
        label: 'Переможені істоти',
        desc: 'prompt: запитати ГМ, перш ніж додавати XP істоти. auto: додавати одразу. off: не стежити за токенами.',
      },
      killBar: {
        label: 'Стежити за шкалою хітів',
        desc: 'Вважати істоту переможеною, коли її шкала хітів опускається до 0 або нижче.',
      },
      hpBar: { label: 'Шкала хітів', desc: 'Яка шкала токена (1, 2 або 3) зберігає хіти.' },
      killMarker: {
        label: 'Стежити за маркером',
        desc: 'Вважати істоту переможеною, коли на її токен ставиться маркер поразки.',
      },
      marker: {
        label: 'Маркер поразки',
        desc: 'Маркер, що означає поразку: вбудована назва, наприклад dead, або назва власного маркера.',
      },
      killDeathTracker: {
        label: 'Використовувати DeathTracker',
        desc: 'Вважати істоту переможеною, коли DeathTracker 1.0 або новіший позначає її мертвою.',
      },
      announce: {
        label: 'Повідомлення про XP',
        desc: 'Хто бачить нагороди XP та підсумок сесії: public (усі), whisper (причетні гравці та ГМ), gm або off.',
      },
      levelNotice: {
        label: 'Сповіщення про новий рівень',
        desc: 'Хто бачить сповіщення про новий рівень: public (усі), whisper (гравець і ГМ), gm або off.',
      },
      customXp: {
        label: 'Власне поле XP',
        desc: 'Поле аркуша з XP персонажа, коли ігрова система — custom. У списку назви пробуються по черзі.',
      },
      customLevel: { label: 'Власне поле рівня', desc: 'Поле аркуша з рівнем персонажа.' },
      customNpcXp: {
        label: 'Власне поле XP істоти',
        desc: 'Поле аркуша з XP, яких вартує істота.',
      },
      customNpcCr: {
        label: 'Власне поле небезпеки',
        desc: 'Поле аркуша з рейтингом небезпеки істоти; використовується, якщо XP не вказано.',
      },
      customLevels: {
        label: 'Власна таблиця рівнів',
        desc: 'XP, потрібні для кожного рівня, починаючи з 1-го, наприклад 0,300,900,2700. Якщо порожньо, сповіщення про новий рівень для власних аркушів вимкнено.',
      },
    },
    roster: {
      explain: {
        party: 'XP ділять персонажі, позначені в Roll20 як член групи (Party Member).',
        players:
          'XP ділять персонажі, якими керує гравець. Щоб використовувати групу Roll20, позначте в персонажів Party Member.',
        manual: 'XP ділять лише персонажі, яких ви включили.',
      },
      selectHint: 'Спершу виберіть токени, щоб додати їх до групи або прибрати.',
    },
    kills: {
      prompt: '{name} переможено. Додати {xp} XP до сесії?',
      noXp: '{name} переможено, але на його аркуші немає XP.',
      reason: 'Переможено {name}',
      result: {
        prompted: 'запитали',
        added: 'додано',
        counted: 'уже враховано в цій сесії',
        noXp: 'на аркуші немає XP: використайте --xp',
        notCreature: 'не істота (немає аркуша або входить до групи)',
      },
    },
    levels: {
      reached: 'У {name} достатньо XP для рівня {level}!',
      sheetButton: 'Натисніть кнопку підвищення рівня на аркуші персонажа.',
      updateSheet: 'Оновіть рівень на аркуші персонажа.',
      pf2: 'Підвищте рівень на аркуші та відніміть 1 000 XP.',
      spend: 'Витратьте XP та підвищте рівень на аркуші.',
    },
    instant: {
      everyone: 'Кожен у групі отримує {xp} XP.',
      bonus: '{names} отримують {xp} XP.',
    },
    end: {
      nothing: 'У цій сесії XP не нараховувався.',
      playerLine: '{name} отримує {xp} XP за цю сесію.',
      playerLineTotal: '{name} отримує {xp} XP за цю сесію, усього {total} XP.',
      levelLine: '{name} досягає рівня {level}.',
      remainder: '{xp} XP не вдалося поділити порівну, вони переходять на наступну сесію.',
    },
    show: {
      noXp: 'на аркуші немає XP',
      next: 'наступний рівень при {xp}',
    },
    awardKinds: { pool: 'Досвід сесії', bonus: 'Бонусний досвід', give: 'Виданий досвід' },
    messages: {
      saved: 'Збережено.',
      commands: 'Команди: {commands}',
      aliasTaken: '{alias} зайнятий модом {mods}. Використовуйте !lazyxp.',
      migrated:
        'Ваші налаштування LazyExperience 0.1, досвід сесії та додатковий досвід перенесено.',
      handouts: 'Хендаути Help, Command Deck і Session Log перебудовано.',
      noLog: 'Жодну сесію ще не завершено, тому журналу сесій немає.',
      poolAdded: '{xp} XP додано до сесії.',
      bonusAdded: '{xp} бонусних XP для {names}.',
      killAdded: '{xp} XP за {name} додано до сесії.',
      killGone: 'Цю перемогу вже додано, або вона більше не очікує рішення.',
      undone: 'Скасовано {xp} XP ({reason}).',
      nothingToUndo: 'У цій сесії нічого скасовувати.',
      nothingToUndoInstant:
        'XP уже виплачено. Щоб виправити, використайте give з від’ємним значенням.',
      sessionReset: 'Досвід сесії та бонуси скинуто. Нічого не виплачено.',
      absent: 'Позначено відсутніми в цій сесії: {names}.',
      present: 'Позначено присутніми: {names}.',
      party: {
        add: 'Додано до групи: {names}.',
        remove: 'Прибрано з групи: {names}.',
      },
    },
    warnings: {
      sandbox:
        'Деякі персонажі використовують аркуш Beacon (наприклад, D&D 2024), який Mod sandbox може читати й записувати лише у версії v1.5. Виберіть Mod sandbox v1.5 у налаштуваннях модів гри.',
      partyLegacy: 'Група Roll20 — це функція Jumpgate; у цій грі мод веде власний список групи.',
      nobodyToPay: 'У групі нікого немає, тому {xp} XP збережено на потім.',
      write: {
        zero: '{name}: мод не може встановити на аркуші 0 XP. Змініть значення на самому аркуші.',
        sandbox: '{name}: для оновлення XP цьому аркушу потрібен Mod sandbox v1.5.',
        xpless: '{name}: ця ігрова система не використовує XP (або аркуш рахує їх сам).',
        noField:
          '{name}: для цього аркуша невідоме поле XP. Виберіть ігрову систему custom і вкажіть поле.',
        error: '{name}: не вдалося оновити аркуш на {xp} XP. Дивіться консоль модів.',
      },
    },
    errors: {
      gmOnly: 'Команди LazyExperience доступні лише ГМ.',
      failed: 'Щось пішло не так: {message}',
      unknownCommand: 'Невідома команда «{name}».',
      helpHint: 'Введіть {command} help, щоб побачити команди.',
      unknownSetting: 'Невідоме налаштування «{name}».',
      settingsHint: 'Відкрийте картку налаштувань, щоб побачити список налаштувань.',
      badValue: '«{value}» — недопустиме значення для {name}.',
      badXp: 'Вкажіть XP цілим числом, наприклад 250.',
      badShare: 'Вкажіть частку числом від 0 до 10, наприклад 0.5 або 50%.',
      noCharacters: 'Виберіть токени персонажів або використайте --ids.',
      noTokens: 'Спершу виберіть токени переможених істот або використайте --ids.',
    },
    status: {
      version: 'Версія',
      sandbox: 'Mod sandbox',
      beacon: 'Аркуші Beacon доступні для читання',
      commands: 'Команди',
      profiles: 'Використовувані ігрові системи',
      characters: 'Персонажів: {count}',
      handouts: 'Див. хендаути {help} і {deck}.',
    },
    log: {
      title: 'Журнал сесій',
      sessionHeading: 'Сесія {number} — {date}',
      colCharacter: 'Персонаж',
      colXp: 'XP',
      awards: 'Нагороди',
      levelUps: 'Рівні:',
      empty: 'Жодну сесію ще не завершено.',
    },
    help: {
      menu: 'Показати головне меню.',
      add: 'Додати XP до досвіду сесії, за бажанням із причиною.',
      bonus: 'Дати вибраним персонажам бонусні XP понад їхню частку.',
      give: 'Одразу виплатити XP вибраним персонажам.',
      kill: 'Вважати вибрані токени переможеними та додати їхні XP.',
      killConfirm: 'Додати XP переможеної істоти (кнопка запиту), за бажанням в іншій кількості.',
      absent: 'Позначити вибраних персонажів відсутніми в цій сесії.',
      present: 'Знову позначити вибраних персонажів присутніми.',
      share: 'Задати частку вибраних персонажів (1 = повна).',
      exclude: 'Виключити персонажів із групи або повернути їх.',
      undo: 'Скасувати останню ще не виплачену нагороду.',
      end: 'Завершити сесію: виплатити XP, оголосити про це й записати в журнал.',
      resetSession: 'Скинути досвід сесії без виплати.',
      show: 'Показати XP та рівень кожного члена групи за аркушем.',
      roster: 'Показати картку групи.',
      party: 'Поставити або зняти позначку Party Member у Roll20 для вибраних персонажів.',
      settings: 'Показати картку налаштувань.',
      set: 'Змінити налаштування.',
      lang: 'Вибрати мову.',
      status: 'Показати sandbox, команди та використовувані ігрові системи.',
      log: 'Посилання на хендаут «Журнал сесій».',
      journal: 'Перебудувати хендаути.',
      help: 'Показати цю довідку.',
      handouts: 'Докладніше в хендаутах {help} і {deck}.',
    },
    deck: {
      session: 'Сесія',
      sessionDesc: 'Додавайте XP до сесії, перевіряйте групу та завершуйте сесію.',
      selected: 'Вибрані токени',
      selectedDesc: 'Спершу виберіть токени на мапі.',
      party: 'Група',
      partyDesc: 'Хто ділить XP.',
      tools: 'Інструменти',
      toolsDesc: 'Налаштування, стан і довідка.',
      footer: 'Кнопки запускають команди LazyExperience. Подробиці в хендауті {help}.',
    },
    handout: {
      versionLabel: 'Версія',
      subtitle: 'Досвід сесії, справедливо поділений, на будь-якому аркуші',
      footer: 'Кнопки для всіх команд є в хендауті {deck}.',
      overview: {
        heading: 'Огляд',
        body: 'LazyExperience збирає очки досвіду, зароблені за сесію, ділить їх між членами групи й записує в аркуші персонажів. Він читає та записує аркуш D&D 2024, а також старіші й інші аркуші, використовує власну групу Roll20, помічає переможених істот, враховує відсутніх гравців і бонусні XP, оголошує про нові рівні та веде журнал кожної сесії.',
      },
      quickStart: {
        heading: 'Швидкий старт',
        steps: [
          'Позначте Party Member у кожного персонажа гравця (у налаштуваннях вікна персонажа) або пропустіть цей крок: тоді використовуються персонажі, якими керують гравці.',
          'Введіть !lazyxp, щоб відкрити меню.',
          'Коли група перемагає істоту і її шкала хітів опускається до 0, вас запитають, чи додавати її XP. Можна також вибрати токени й натиснути «Переможені: вибрані».',
          'Додавайте XP за все інше кнопкою «Додати XP», а бонусні XP одному персонажу — кнопкою «Бонус: вибраним».',
          'Позначте гравців, які пропустили сесію, як «Відсутній».',
          'Натисніть «Завершити сесію». Частка кожного буде записана в його аркуш, оголошена та додана до хендауту «Журнал сесій».',
        ],
      },
      commands: {
        heading: 'Команди',
        intro:
          'Кожна команда починається з !lazyxp; працює і {long}, а також {short}, поки його не використовує інший мод XP. Використовувати їх може лише ГМ.',
        targets:
          'Команди для персонажів використовують вибрані токени або --ids, після якого через кому вказано ID персонажів чи токенів.',
        colCommand: 'Команда',
        colDesc: 'Що робить',
      },
      party: {
        heading: 'Група',
        points: [
          'Автоматично: якщо в Roll20 (Jumpgate) принаймні в одного персонажа позначено Party Member, XP ділить група Roll20; інакше — усі персонажі, якими керує гравець.',
          'Персонажі, якими керують лише «Усі гравці», наприклад допоміжні токени, не враховуються.',
          'Додавання до групи та вилучення з групи ставлять або знімають позначку Party Member у вибраних персонажів.',
          '«Виключити» назавжди прибирає персонажа з групи; «Повернути» повертає його.',
          'Персонаж, яким керують кілька гравців, враховується один раз.',
        ],
      },
      splitting: {
        heading: 'Поділ XP',
        points: [
          'Досвід сесії ділиться на кількість часток: по одній на члена групи плюс додаткові частки.',
          'Відсутні персонажі отримують частку за налаштуванням «Частка відсутніх» (типово 0%). Відсутність діє одну сесію.',
          'Персонаж може мати іншу частку, наприклад 0.5 для помічника.',
          'Бонусні XP дістаються вибраним персонажам понад їхню частку.',
          'XP, які не діляться порівну, переходять на наступну сесію.',
          'Якщо «Виплата XP» встановлена в instant, кожна нагорода ділиться й виплачується одразу.',
        ],
      },
      kills: {
        heading: 'Переможені істоти',
        points: [
          'Істота вважається переможеною, коли її шкала хітів опускається до 0, коли ставиться маркер поразки або коли DeathTracker позначає її мертвою.',
          'Зміни, зроблені через TokenMod, аркуш або інші моди за пов’язаним атрибутом, теж помічаються.',
          'Враховуються лише токени персонажів поза групою, якими не керує жоден гравець, і кожен токен — лише один раз за сесію.',
          'XP беруться з аркуша: вартість істоти в XP або її рейтинг небезпеки.',
          'Варіант «Запитати ГМ» (типовий) надсилає пошепки запит із кнопками «Додати», «Інша кількість» та «Ігнорувати». «Додавати автоматично» пропускає запит.',
        ],
      },
      levels: {
        heading: 'Підвищення рівня',
        points: [
          'Після запису XP LazyExperience перевіряє таблицю рівнів системи й повідомляє, коли в персонажа достатньо XP для нового рівня.',
          'На аркуші D&D 2024 гравець потім натискає кнопку підвищення рівня на аркуші.',
        ],
      },
      systems: {
        heading: 'Ігрові системи',
        intro:
          'LazyExperience вибирає профіль за аркушем кожного персонажа. Задайте ігрову систему, щоб примусово вибрати профіль, або custom, щоб указати поля самостійно.',
        colSystem: 'Система',
        colId: 'ID',
        colSheets: 'Аркуші',
        colChecked: 'Перевірено',
        verified: {
          live: 'Перевірено в Roll20',
          partial: 'Частково перевірено в Roll20',
          source: 'За вихідним кодом аркуша',
          none: '—',
        },
        points: [
          'Виберіть аркуш за його назвою в Налаштуваннях гри. Аркуші, яких немає в списку, використовують поширені поля experience, xp і level, або задайте ігрову систему як custom.',
          '«Перевірено в Roll20» означає, що XP записали в цей аркуш у грі Jumpgate, власні обчислення аркуша спрацювали, а переможених істот і сповіщення про новий рівень перевірили.',
          'Аркушам Beacon, наприклад D&D 2024, потрібен Mod sandbox v1.5, а мод не може встановити їм 0 XP.',
          'Pathfinder 1E і Starfinder беруть для сповіщень про новий рівень поле аркуша з XP до наступного рівня. Якщо воно порожнє, Pathfinder використовує середній темп, а Starfinder — власну таблицю.',
          'WFRP 4E: кожна нагорода додається рядком до списку Experience аркуша, але під час тестування аркуш не перерахував суми XP, тож перевірте їх на аркуші.',
          'У Savage Worlds, 13th Age, Cosmere і Call of Cthulhu немає XP, які міг би записати мод.',
        ],
      },
      settings: {
        heading: 'Налаштування',
        intro:
          'Змінюйте налаштування в картці налаштувань або командою !lazyxp set <налаштування> <значення>.',
        colKey: 'Налаштування',
        colName: 'Назва',
        colDesc: 'Що робить',
      },
      upgrading: {
        heading: 'Оновлення з 0.1',
        points: [
          'Налаштування, досвід сесії та додатковий досвід персонажів із 0.1 переносяться під час першого запуску 1.0.',
          'Неактивні гравці та персонажі не включаються до групи.',
          'Власна назва команди з 0.1 продовжує працювати.',
          'Старі команди й надалі працюють:',
        ],
        colV1: '0.1',
        colV2: '1.0',
      },
      troubleshooting: {
        heading: 'Усунення несправностей',
        points: [
          'В аркуші D&D 2024 нічого не записується: перевірте, що в грі використовується Mod sandbox v1.5 (!lazyxp status).',
          'Істота дає 0 XP: на її аркуші немає XP чи рейтингу небезпеки. Використайте «Інша кількість» або !lazyxp kill --xp 100.',
          'Перемоги не помічаються: перевірте, що «Шкала хітів» — це шкала, яка зберігає хіти.',
          '!xp нічого не робить: цю команду використовує інший мод XP. Використовуйте !lazyxp.',
        ],
      },
      languages: {
        heading: 'Мови',
        body: 'Виберіть мову командою !lazyxp lang. Картки в чаті та хендаути змінюються одразу.',
        colLanguage: 'Мова',
        colNative: 'Назва',
        colCode: 'Код',
      },
      credits: {
        heading: 'Автори',
        original: 'Створив',
        maintainer: 'Переписав і підтримує',
        support: 'Повідомлення про помилки та ідеї вітаються на форумі Roll20.',
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

  // Persistent state: defaults, migration from 0.1.x and One-Click options.

  /**
   * Makes an empty session.
   *
   * @param {number} number Session number.
   * @returns {object} Session record.
   */
  function newSession(number) {
    return {
      number,
      started: Date.now(),
      pool: 0,
      carried: 0,
      bonuses: {},
      kills: {},
      awards: [],
      paid: {},
      levelUps: [],
    };
  }

  /**
   * Returns the mod's state, creating it when missing.
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
   * Returns the configuration.
   *
   * @returns {object} Config.
   */
  function getConfig() {
    return getState().config;
  }

  /**
   * Returns the current session.
   *
   * @returns {object} Session.
   */
  function getSession() {
    return getState().session;
  }

  /**
   * Returns the stored record for a character, creating it when missing.
   *
   * @param {string} characterId Character ID.
   * @returns {{member: boolean, excluded: boolean, absent: boolean, share: number, level: number|null, notified: number|null}} Record.
   */
  function getCharacterRecord(characterId) {
    const chars = getState().characters;
    if (!isRecord(chars[characterId])) {
      chars[characterId] = {
        member: false,
        excluded: false,
        absent: false,
        share: 1,
        level: null,
        notified: null,
      };
    }
    return chars[characterId];
  }

  /**
   * Builds a brand-new state.
   *
   * @returns {object} State.
   */
  function freshState() {
    return {
      schemaVersion: SCHEMA_VERSION,
      version: SCRIPT_VERSION,
      config: { ...DEFAULT_CONFIG },
      characters: {},
      session: newSession(1),
      aliases: [],
      history: [],
      globalconfigCache: { lastsaved: 0 },
      warned: {},
    };
  }

  /**
   * Converts 0.1.x state into the 1.0 shape. 0.1.x is left in place so a rollback works.
   *
   * @param {object} old The 0.1.x state.
   * @returns {object} New state.
   */
  function migrateLegacy(old) {
    const next = freshState();
    const cfg = isRecord(old.config) ? old.config : {};
    const command = toText(cfg.command).replace(/^!/, '');
    if (command && !['xp', 'lazyxp', 'lazyexperience'].includes(command.toLowerCase())) {
      next.aliases.push(`!${command}`);
    }
    if (toText(cfg.marker) && toText(cfg.marker) !== '-') {
      next.config.marker = toText(cfg.marker);
    }
    const xpName = toText(cfg.experience_attribute_name);
    const npcName = toText(cfg.npc_experience_attribute_name);
    if ((xpName && xpName !== 'experience') || (npcName && npcName !== 'npc_xp')) {
      next.config.system = 'custom';
      next.config.customXp = xpName || DEFAULT_CONFIG.customXp;
      next.config.customNpcXp = npcName || DEFAULT_CONFIG.customNpcXp;
    }
    next.config.payout = cfg.directxp === true ? 'instant' : 'end';
    // 0.1.x only wrote sheets when asked to.
    next.config.updateSheets = cfg.updatesheet === true;
    next.config.extraShares = clampShares(parseStrictInt(old.extra_players) ?? 0);
    next.session.pool = Math.max(0, Math.floor(Number(old.session_experience) || 0));

    const players = isRecord(old.players) ? old.players : {};
    for (const player of Object.values(players)) {
      if (!isRecord(player) || !Array.isArray(player.characters)) {
        continue;
      }
      for (const character of player.characters) {
        if (!isRecord(character) || !toText(character.id)) {
          continue;
        }
        const rec = next.characters[character.id] || {
          member: false,
          excluded: false,
          absent: false,
          share: 1,
          level: null,
          notified: null,
        };
        // 0.1.x "not active" left the player or character out of every share.
        if (player.active === false || character.active === false) {
          rec.excluded = true;
        }
        next.characters[character.id] = rec;
        const extra = Math.floor(Number(character.experience) || 0);
        if (extra > 0) {
          next.session.bonuses[character.id] = (next.session.bonuses[character.id] || 0) + extra;
        }
      }
    }
    next.migratedFrom = '0.1';
    return next;
  }

  /**
   * Keeps extra shares within limits.
   *
   * @param {number} value Raw value.
   * @returns {number} Clamped value.
   */
  function clampShares(value) {
    return Math.min(MAX_EXTRA_SHARES, Math.max(0, Math.floor(Number(value) || 0)));
  }

  /**
   * Creates or upgrades the state. Returns '0.1' when 0.1.x state was migrated.
   *
   * @returns {string|null} The version migrated from, or null.
   */
  function initialiseState() {
    let migrated = null;
    if (!isRecord(state[STATE_KEY])) {
      if (isRecord(state[LEGACY_STATE_KEY])) {
        state[STATE_KEY] = migrateLegacy(state[LEGACY_STATE_KEY]);
        migrated = '0.1';
      } else {
        state[STATE_KEY] = freshState();
      }
    }
    const s = state[STATE_KEY];
    s.config = { ...DEFAULT_CONFIG, ...(isRecord(s.config) ? s.config : {}) };
    for (const key of Object.keys(s.config)) {
      if (!(key in DEFAULT_CONFIG)) {
        delete s.config[key];
      }
    }
    if (!isRecord(s.characters)) s.characters = {};
    if (!isRecord(s.session)) s.session = newSession(1);
    const fresh = newSession(s.session.number || 1);
    for (const key of Object.keys(fresh)) {
      if (s.session[key] === undefined) s.session[key] = fresh[key];
    }
    if (!Array.isArray(s.aliases)) s.aliases = [];
    if (!Array.isArray(s.history)) s.history = [];
    if (!isRecord(s.globalconfigCache)) s.globalconfigCache = { lastsaved: 0 };
    if (!isRecord(s.warned)) s.warned = {};
    s.schemaVersion = SCHEMA_VERSION;
    s.version = SCRIPT_VERSION;
    return migrated;
  }

  /**
   * Coerces a raw setting value to the type of its default. Returns undefined when the
   * value cannot be used.
   *
   * @param {string} key Setting name.
   * @param {*} raw Raw value.
   * @returns {*} Value, or undefined.
   */
  function coerceSetting(key, raw) {
    const fallback = DEFAULT_CONFIG[key];
    if (typeof fallback === 'boolean') {
      return parseBoolean(raw) ?? undefined;
    }
    if (typeof fallback === 'number') {
      const text = toText(raw).replace('%', '');
      const value = Number(text);
      if (!Number.isFinite(value)) {
        return undefined;
      }
      return toText(raw).endsWith('%') ? value / 100 : value;
    }
    return toText(raw);
  }

  /**
   * Applies One-Click install options when they are newer than the last ones applied,
   * so changes made in game survive restarts (the TokenMod pattern).
   *
   * @param {object} [validate] Function (key, value) => value|undefined that checks a value.
   * @returns {string[]} Keys that changed.
   */
  function applyGlobalConfig(validate = (k, v) => v) {
    const gc = typeof globalconfig === 'object' && globalconfig ? globalconfig : {};
    const branchKey = Object.keys(gc).find(
      (k) => k.toLowerCase().replace(/[^a-z]/g, '') === 'lazyexperience'
    );
    const branch = branchKey ? gc[branchKey] : null;
    const s = getState();
    if (!isRecord(branch) || !(Number(branch.lastsaved) > Number(s.globalconfigCache.lastsaved))) {
      return [];
    }
    const changed = [];
    for (const key of Object.keys(DEFAULT_CONFIG)) {
      if (!(key in branch)) {
        continue;
      }
      // Unticked checkboxes arrive as false; ticked ones as their value text.
      const raw = typeof DEFAULT_CONFIG[key] === 'boolean' ? branch[key] !== false : branch[key];
      const value = validate(key, coerceSetting(key, raw));
      if (value !== undefined && value !== s.config[key]) {
        s.config[key] = value;
        changed.push(key);
      }
    }
    s.globalconfigCache = { lastsaved: Number(branch.lastsaved) };
    return changed;
  }

  // Game-system profiles: which sheet fields hold XP, level and monster XP, and the
  // XP tables each system uses. A profile is picked per character from the name of its
  // sheet, so games that mix sheets work.
  //
  // Field lists are tried in order. On legacy (attribute) sheets every name is looked
  // up quietly, so several candidates are fine. On Beacon sheets an unknown name logs a
  // sandbox error, so Beacon profiles list only names the sheet is known to have.

  // XP needed to reach each level (index 0 = level 1). D&D 5e 2014 and 2024 share it.
  const DND5E_LEVELS = [
    0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000,
    165000, 195000, 225000, 265000, 305000, 355000,
  ];

  // D&D 5e XP by challenge rating.
  const DND5E_CR_XP = {
    0: 10,
    0.125: 25,
    0.25: 50,
    0.5: 100,
    1: 200,
    2: 450,
    3: 700,
    4: 1100,
    5: 1800,
    6: 2300,
    7: 2900,
    8: 3900,
    9: 5000,
    10: 5900,
    11: 7200,
    12: 8400,
    13: 10000,
    14: 11500,
    15: 13000,
    16: 15000,
    17: 18000,
    18: 20000,
    19: 22000,
    20: 25000,
    21: 33000,
    22: 41000,
    23: 50000,
    24: 62000,
    25: 75000,
    26: 90000,
    27: 105000,
    28: 120000,
    29: 135000,
    30: 155000,
  };

  // Pathfinder 1e XP to reach each level, by advancement track.
  const PF1_LEVELS = {
    medium: [
      0, 2000, 5000, 9000, 15000, 23000, 35000, 51000, 75000, 105000, 155000, 220000, 315000,
      445000, 635000, 890000, 1300000, 1800000, 2550000, 3600000,
    ],
    fast: [
      0, 1300, 3300, 6000, 10000, 15000, 23000, 34000, 50000, 71000, 105000, 145000, 210000, 295000,
      425000, 600000, 850000, 1200000, 1700000, 2400000,
    ],
  };

  // Pathfinder 1e XP by CR (also used by Starfinder 1e).
  const PF1_CR_XP = {
    0.125: 50,
    0.167: 65,
    0.25: 100,
    0.333: 135,
    0.5: 200,
    1: 400,
    2: 600,
    3: 800,
    4: 1200,
    5: 1600,
    6: 2400,
    7: 3200,
    8: 4800,
    9: 6400,
    10: 9600,
    11: 12800,
    12: 19200,
    13: 25600,
    14: 38400,
    15: 51200,
    16: 76800,
    17: 102400,
    18: 153600,
    19: 204800,
    20: 307200,
    21: 409600,
    22: 614400,
    23: 819200,
    24: 1228800,
    25: 1638400,
  };

  // Pathfinder 2e XP for a creature, by its level minus the party level (Core Rulebook).
  const PF2_CREATURE_XP = {
    '-4': 10,
    '-3': 15,
    '-2': 20,
    '-1': 30,
    0: 40,
    1: 60,
    2: 80,
    3: 120,
    4: 160,
  };

  /**
   * Looks up XP for a challenge rating in a table, matching fractions loosely.
   *
   * @param {object} table CR → XP.
   * @param {*} raw Challenge rating text.
   * @returns {number|null} XP, or null.
   */
  function lookupCr(table, raw) {
    const cr = parseChallenge(raw);
    if (cr === null) {
      return null;
    }
    const key = Object.keys(table).find((k) => Math.abs(Number(k) - cr) < 0.01);
    return key === undefined ? null : table[key];
  }

  /**
   * Pathfinder 2e creature XP, from its level and the party's level.
   *
   * @param {*} creatureLevel Creature level.
   * @param {number} partyLevel Party level.
   * @returns {number|null} XP for the whole party, or null.
   */
  function pf2CreatureXp(creatureLevel, partyLevel) {
    const level = Number(toText(creatureLevel));
    if (!Number.isFinite(level) || !Number.isFinite(partyLevel)) {
      return null;
    }
    const diff = Math.round(level - partyLevel);
    if (diff < -4) return 0;
    if (diff > 4) return 160;
    return PF2_CREATURE_XP[String(diff)];
  }

  /**
   * The built-in profiles. `sheets` are the sheet names Roll20 uses (the values of the
   * Character Sheet Template list in Game Settings, which characters report as
   * `_charactersheetname`). `fingerprint` attributes pick a profile when the name is not
   * listed, for example on copies of a sheet.
   */
  const PROFILES = [
    {
      id: 'dnd2024',
      label: 'D&D 5E (2024 / 5.5E) by Roll20',
      sheets: ['dnd2024byroll20'],
      roll20Name: 'D&D Fifth Edition (5E & 5.5E)',
      access: 'beacon',
      pc: { xp: ['experience'], level: ['level'] },
      npc: { xp: ['npc_xp'], cr: ['npc_challenge'] },
      levels: DND5E_LEVELS,
      crXp: (cr) => lookupCr(DND5E_CR_XP, cr),
      levelUpHint: 'sheetButton',
      verified: 'live',
    },
    {
      id: 'dnd2014',
      label: 'D&D 5E (2014) by Roll20',
      sheets: ['ogl5e'],
      roll20Name: 'D&D 5E (Classic)',
      fingerprint: ['npc_challenge', 'base_level'],
      access: 'legacy',
      pc: { xp: ['experience'], level: ['level'] },
      npc: { xp: ['npc_xp'], cr: ['npc_challenge'] },
      levels: DND5E_LEVELS,
      crXp: (cr) => lookupCr(DND5E_CR_XP, cr),
      verified: 'live',
    },
    {
      id: 'shaped5e',
      label: 'D&D 5E Shaped',
      sheets: ['dnd5eshaped2'],
      roll20Name: 'D&D 5E (Shaped)',
      fingerprint: ['xp_next_level', 'xp_readable'],
      access: 'legacy',
      pc: { xp: ['xp'], level: ['level'], next: ['xp_next_level'] },
      npc: { xp: ['xp'], cr: ['challenge'] },
      levels: DND5E_LEVELS,
      crXp: (cr) => lookupCr(DND5E_CR_XP, cr),
      verified: 'live',
    },
    {
      id: 'pf1',
      label: 'Pathfinder (1E) by Roll20',
      sheets: ['pathfinderofficial'],
      roll20Name: 'Pathfinder',
      fingerprint: ['npc_cr', 'class1_level'],
      access: 'legacy',
      pc: { xp: ['xp'], level: ['level'], next: ['xp_max'] },
      npc: { xp: ['xp'], cr: ['npc_cr'] },
      // The sheet has no track setting, so the medium track is the fallback when xp_max is blank.
      levels: PF1_LEVELS.medium,
      crXp: (cr) => lookupCr(PF1_CR_XP, cr),
      verified: 'live',
    },
    {
      id: 'pf1community',
      label: 'Pathfinder (1E) Community',
      sheets: ['pathfinderneceros'],
      roll20Name: 'Pathfinder Community',
      fingerprint: ['npc-cr', 'npc-xp', 'experience_max'],
      access: 'legacy',
      pc: { xp: ['experience'], level: ['level'], next: ['experience_max'] },
      npc: { xp: ['npc-xp'], cr: ['npc-cr'] },
      levels: PF1_LEVELS.medium,
      crXp: (cr) => lookupCr(PF1_CR_XP, cr),
      verified: 'live',
    },
    {
      id: 'pf2',
      label: 'Pathfinder Second Edition by Roll20',
      sheets: ['pathfinder2eofficial'],
      roll20Name: 'Pathfinder 2e (Demiplane Optional)',
      access: 'legacy',
      pc: { xp: ['xp'], level: ['level'] },
      npc: { level: ['level'] },
      // PF2 characters level at 1000 XP and then take 1000 off; the sheet does not do it.
      nextXp: () => 1000,
      levelUpHint: 'pf2',
      creatureXp: pf2CreatureXp,
      verified: 'live',
    },
    {
      id: 'sf1',
      label: 'Starfinder by Roll20',
      sheets: ['starfinder'],
      roll20Name: 'Starfinder',
      fingerprint: ['character_level'],
      access: 'legacy',
      pc: { xp: ['xp'], level: ['character_level'], next: ['xp_max'] },
      npc: { xp: ['xp'], cr: ['character_level'] },
      // Starfinder uses the Pathfinder fast track.
      levels: PF1_LEVELS.fast,
      crXp: (cr) => lookupCr(PF1_CR_XP, cr),
      verified: 'live',
    },
    {
      id: 'ose',
      label: 'Old-School Essentials',
      sheets: ['oldschoolessentialsaac'],
      roll20Name: 'Old School Essentials by Necrotic Gnome',
      fingerprint: ['ExpPercentage'],
      access: 'legacy',
      pc: { xp: ['XP'], level: ['level'], next: ['Next'] },
      npc: { xp: ['XP'] },
      levels: null,
      verified: 'live',
    },
    {
      id: 'dcc',
      label: 'Dungeon Crawl Classics',
      sheets: ['dccofficial', 'dcc'],
      roll20Name: 'Dungeon Crawl Classics by Goodman Games',
      fingerprint: ['xp_mod'],
      access: 'legacy',
      pc: { xp: ['xp'], level: ['level'] },
      npc: { xp: ['xp'] },
      levels: [0, 10, 50, 110, 190, 290, 410, 550, 710, 890, 1090],
      firstLevel: 0,
      verified: 'live',
    },
    {
      id: 'dungeonworld',
      label: 'Dungeon World',
      sheets: ['dungeonworldofficial'],
      roll20Name: 'Dungeon World by Roll20',
      fingerprint: ['isNPC', 'calc_isNPC'],
      access: 'legacy',
      pc: { xp: ['xp'], level: ['level'] },
      npc: {},
      // Level up at level + 7 XP, spending the XP.
      nextXp: (level) => level + 7,
      levelUpHint: 'spend',
      verified: 'live',
    },
    {
      id: 'wfrp4',
      label: 'Warhammer Fantasy Roleplay 4E',
      sheets: ['wfrp4official'],
      roll20Name: 'Warhammer Fantasy Roleplay 4e Official by Cubicle 7',
      fingerprint: ['current_xp', 'spent_xp'],
      access: 'legacy',
      pc: { xp: ['current_xp'], level: [] },
      npc: {},
      // The sheet adds up an XP ledger, so awards are new ledger rows.
      write: {
        kind: 'repeatingRow',
        section: 'experience',
        amount: 'experience_amount',
        note: 'experience_desc',
      },
      verified: 'partial',
    },
    {
      id: 'shadowrun5',
      label: 'Shadowrun 5E (karma)',
      sheets: ['shadowrun5thedition'],
      roll20Name: 'Shadowrun 5th Edition',
      fingerprint: ['total karma'],
      access: 'legacy',
      pc: { xp: ['karma'], level: [] },
      npc: {},
      alsoAdd: ['total karma'],
      unit: 'karma',
      verified: 'live',
    },
    {
      id: 'shadowrun6',
      label: 'Shadowrun 6E (karma)',
      sheets: ['shadowrun6world'],
      roll20Name: 'Shadowrun, Sixth World',
      fingerprint: ['total_karma'],
      access: 'legacy',
      pc: { xp: ['karma'], level: [] },
      npc: {},
      alsoAdd: ['total_karma'],
      unit: 'karma',
      verified: 'live',
    },
    {
      id: 'cypher',
      label: 'Cypher System',
      sheets: ['cypherstemsr20'],
      roll20Name: 'Cypher Systems',
      fingerprint: ['sheet_style'],
      access: 'legacy',
      pc: { xp: ['xp'], level: ['tier'] },
      npc: {},
      levels: null,
      verified: 'live',
    },
    {
      id: 'swade',
      label: 'Savage Worlds (advances)',
      sheets: ['savageworldsofficial'],
      roll20Name: 'Official Savage Worlds by Pinnacle',
      fingerprint: ['manualAdvance', 'setadvance'],
      access: 'legacy',
      pc: { xp: [], level: ['rank'] },
      npc: {},
      // The sheet counts Advances from its Edges list; XP cannot be written.
      xpless: true,
      verified: 'live',
    },
    {
      id: 'levelonly',
      label: '13th Age, Cosmere and other level-only sheets',
      sheets: ['official13thage', 'cosmereofficial'],
      roll20Name: '13th Age; Cosmere RPG (Demiplane Optional)',
      fingerprint: ['is_adversary'],
      access: 'legacy',
      pc: { xp: [], level: ['level'] },
      npc: {},
      xpless: true,
      verified: 'live',
    },
    {
      id: 'cthulhu',
      label: 'Call of Cthulhu 7E (no XP)',
      sheets: ['coc7e', 'callofcthulu'],
      roll20Name: 'Call of Cthulhu 7th Edition',
      access: 'legacy',
      pc: { xp: [], level: [] },
      npc: {},
      xpless: true,
      verified: 'live',
    },
    {
      id: 'generic',
      label: 'Other sheet (common names)',
      sheets: [],
      access: 'legacy',
      pc: {
        xp: ['experience', 'xp', 'exp', 'experience_points'],
        level: ['level', 'lvl', 'character_level'],
      },
      npc: { xp: ['npc_xp', 'xp', 'experience'], cr: ['npc_challenge', 'challenge', 'cr'] },
      levels: null,
      crXp: null,
      verified: 'none',
    },
    {
      id: 'custom',
      label: 'Custom fields',
      sheets: [],
      access: 'auto',
      pc: null,
      npc: null,
      levels: null,
      crXp: null,
      verified: 'none',
    },
  ];

  /**
   * Returns a profile by ID.
   *
   * @param {string} id Profile ID.
   * @returns {object|undefined} Profile.
   */
  function getProfileById(id) {
    return PROFILES.find((p) => p.id === id);
  }

  /**
   * Lists the IDs a GM can choose for the system setting.
   *
   * @returns {string[]} IDs, auto first.
   */
  function systemIds() {
    return ['auto', ...PROFILES.map((p) => p.id)];
  }

  /**
   * Parses the custom level table setting ("0,300,900,…").
   *
   * @param {string} text Setting text.
   * @returns {number[]|null} XP to reach each level, or null when blank or invalid.
   */
  function parseLevelTable(text) {
    const items = splitList(text).map((s) => Number(s.replaceAll('_', '')));
    if (items.length < 2 || items.some((n) => !Number.isFinite(n) || n < 0)) {
      return null;
    }
    return items.every((n, i) => i === 0 || n > items[i - 1]) ? items : null;
  }

  /**
   * Builds the custom profile from the settings.
   *
   * @param {object} config Mod settings.
   * @param {string} access 'beacon' or 'legacy'.
   * @returns {object} Profile.
   */
  function customProfile(config, access) {
    const base = getProfileById('custom');
    const list = (v) => splitList(v);
    return {
      ...base,
      access,
      pc: { xp: list(config.customXp), level: list(config.customLevel) },
      npc: { xp: list(config.customNpcXp), cr: list(config.customNpcCr) },
      levels: parseLevelTable(config.customLevels),
    };
  }

  /**
   * Picks the profile for a sheet name.
   *
   * @param {string} sheetName The character's `_charactersheetname`.
   * @returns {object} Profile (the generic one when nothing matches).
   */
  function detectProfile(sheetName, character = null) {
    const name = toText(sheetName).toLowerCase();
    const byName = PROFILES.find(
      (p) => p.sheets.includes(name) || (p.match instanceof RegExp && name && p.match.test(name))
    );
    if (byName) {
      return byName;
    }
    // Sheet names are not documented, so look for attributes only one sheet has.
    if (character) {
      const names = new Set(
        findObjs({ _type: 'attribute', _characterid: character.id }).map((a) =>
          toText(a.get('name')).toLowerCase()
        )
      );
      const byAttrs = PROFILES.find((p) =>
        (p.fingerprint || []).some((f) => names.has(f.toLowerCase()))
      );
      if (byAttrs) {
        return byAttrs;
      }
    }
    return getProfileById('generic');
  }

  /**
   * Returns the profile to use for a character.
   *
   * @param {object} character Roll20 character.
   * @param {object} config Mod settings.
   * @param {boolean} beaconAvailable Whether the sandbox can use Beacon sheets.
   * @returns {object} Profile.
   */
  function profileForCharacter(character, config, beaconAvailable) {
    const sheetName =
      toText(character?.get?.('_charactersheetname')) || toText(Campaign()?.sheetName);
    if (config.system === 'custom') {
      const beaconSheet = detectProfile(sheetName, character).access === 'beacon';
      return customProfile(config, beaconSheet && beaconAvailable ? 'beacon' : 'legacy');
    }
    if (config.system && config.system !== 'auto') {
      return getProfileById(config.system) || detectProfile(sheetName, character);
    }
    return detectProfile(sheetName, character);
  }

  /**
   * Works out the level a total XP reaches on a level table.
   *
   * @param {number[]|null} table XP to reach each level.
   * @param {number} xp Total XP.
   * @returns {number|null} Level, or null without a table.
   */
  function levelForXp(table, xp, firstLevel = 1) {
    if (!Array.isArray(table) || table.length === 0) {
      return null;
    }
    let level = firstLevel;
    for (let i = 0; i < table.length; i++) {
      if (xp >= table[i]) level = i + firstLevel;
    }
    return level;
  }

  /**
   * XP needed to reach the next level.
   *
   * @param {number[]|null} table XP to reach each level.
   * @param {number} level Current level.
   * @returns {number|null} XP, or null at the top of the table or without one.
   */
  function xpForNextLevel(table, level, firstLevel = 1) {
    const index = level - firstLevel + 1;
    return Array.isArray(table) && index >= 1 && index < table.length ? table[index] : null;
  }

  // Journal handouts: Help, Command Deck and the Session Log.

  const STYLE = {
    outer: `background:${COLOR_CARD_BG_BOTTOM};color:${COLOR_TEXT};padding:14px 18px;border:1px solid ${COLOR_BORDER};border-radius:6px;font-family:Arial,sans-serif;line-height:1.5;`,
    header: `background:${COLOR_HEADER_BG};padding:12px;border-radius:4px;text-align:center;border-bottom:3px solid ${COLOR_ACCENT};margin-bottom:12px;`,
    h1: `color:${COLOR_HEADER_TEXT};margin:0;font-size:1.8em;letter-spacing:0.05em;`,
    subtitle: `color:${COLOR_MUTED};margin:4px 0 0 0;font-size:0.9em;`,
    h2: `color:${COLOR_ACCENT};border-bottom:1px solid ${COLOR_BORDER};padding-bottom:3px;margin:18px 0 8px 0;font-size:1.25em;`,
    h3: `color:${COLOR_HEADER_TEXT};margin:12px 0 4px 0;font-size:1.05em;`,
    p: `color:${COLOR_TEXT};margin:6px 0;`,
    li: `color:${COLOR_TEXT};margin:3px 0;`,
    table: 'width:100%;border-collapse:collapse;margin:6px 0;font-size:0.92em;',
    th: `background:${COLOR_HEADER_BG};color:${COLOR_HEADER_TEXT};padding:5px 8px;text-align:left;border:1px solid ${COLOR_BORDER};`,
    td: `padding:5px 8px;border:1px solid ${COLOR_BORDER};vertical-align:top;color:${COLOR_TEXT};`,
    code: 'font-family:monospace;color:#f3d48b;white-space:nowrap;',
    link: `color:${COLOR_ACCENT};`,
    footer: `color:${COLOR_MUTED};font-size:0.85em;text-align:center;margin-top:16px;border-top:1px solid ${COLOR_BORDER};padding-top:8px;`,
    btn: `background:${COLOR_BUTTON_BG};color:${COLOR_BUTTON_TEXT};padding:3px 9px;border-radius:3px;text-decoration:none;font-size:0.9em;display:inline-block;margin:2px 3px;font-weight:bold;`,
    btnDark: `background:#3b2d57;color:${COLOR_TEXT};border:1px solid #6a5590;padding:3px 9px;border-radius:3px;text-decoration:none;font-size:0.9em;display:inline-block;margin:2px 3px;`,
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

    const commands = [
      ['', 'menu'],
      ['add <xp> [reason]', 'add'],
      ['bonus <xp> [reason] [--ids …]', 'bonus'],
      ['give <xp> [reason] [--ids …]', 'give'],
      ['kill [--xp <n>]', 'kill'],
      ['kill confirm <token> [xp]', 'killConfirm'],
      ['absent [--ids …]', 'absent'],
      ['present [--ids …]', 'present'],
      ['share <n> [--ids …]', 'share'],
      ['exclude | include [--ids …]', 'exclude'],
      ['undo', 'undo'],
      ['end', 'end'],
      ['reset session', 'resetSession'],
      ['show', 'show'],
      ['roster', 'roster'],
      ['party add | remove', 'party'],
      ['settings', 'settings'],
      ['set <setting> <value>', 'set'],
      ['lang [code]', 'lang'],
      ['status', 'status'],
      ['log', 'log'],
      ['journal', 'journal'],
      ['help', 'help'],
    ].map(([cmd, key]) => [code(`${COMMAND} ${cmd}`.trim()), escapeHtml(t(`help.${key}`, lang))]);

    const settings = Object.keys(DEFAULT_CONFIG).map((key) => [
      code(key),
      escapeHtml(t(`settings.${key}.label`, lang)),
      escapeHtml(t(`settings.${key}.desc`, lang)),
    ]);

    // Long sheet names must wrap, or the table is wider than the handout.
    const wrapCode = (text) =>
      `<span style="${STYLE.code.replace('white-space:nowrap;', 'word-break:break-all;')}">${escapeHtml(text)}</span>`;
    const systems = PROFILES.map((p) => [
      escapeHtml(p.label),
      wrapCode(p.id),
      // Roll20's name for the sheet (as in Game Settings), then the name Mods see.
      p.roll20Name
        ? `${escapeHtml(p.roll20Name)}<br>${wrapCode(p.sheets.join(', '))}`
        : escapeHtml(p.sheets.join(', ') || '—'),
      escapeHtml(t(`handout.systems.verified.${p.verified}`, lang)),
    ]);

    const legacyCommands = [
      ['!xp add session <xp>', `${COMMAND} add <xp>`],
      ['!xp add <characterid> <xp>', `${COMMAND} bonus <xp> --ids <characterid>`],
      ['!xp end', `${COMMAND} end`],
      ['!xp resetxp', `${COMMAND} reset session`],
      ['!xp config', `${COMMAND} settings`],
      ['!xp refresh', `${COMMAND} roster`],
    ].map(([v1, v2]) => [code(v1), code(v2)]);

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
    ${section('overview', `<p style="${STYLE.p}">${h('overview.body')}</p>`)}
    ${section('quickStart', list(raw('quickStart.steps'), true))}
    ${section('commands', `<p style="${STYLE.p}">${h('commands.intro', { long: LONG_COMMAND, short: SHORT_ALIAS })}</p><p style="${STYLE.p}">${h('commands.targets')}</p>${table([t('handout.commands.colCommand', lang), t('handout.commands.colDesc', lang)], commands)}`)}
    ${section('party', list(raw('party.points')))}
    ${section('splitting', list(raw('splitting.points')))}
    ${section('kills', list(raw('kills.points')))}
    ${section('levels', list(raw('levels.points')))}
    ${section('systems', `<p style="${STYLE.p}">${h('systems.intro')}</p>${table([t('handout.systems.colSystem', lang), t('handout.systems.colId', lang), t('handout.systems.colSheets', lang), t('handout.systems.colChecked', lang)], systems)}${list(raw('systems.points'))}`)}
    ${section('settings', `<p style="${STYLE.p}">${h('settings.intro')}</p>${table([t('handout.settings.colKey', lang), t('handout.settings.colName', lang), t('handout.settings.colDesc', lang)], settings)}`)}
    ${section('upgrading', `${list(raw('upgrading.points'))}${table([t('handout.upgrading.colV1', lang), t('handout.upgrading.colV2', lang)], legacyCommands)}`)}
    ${section('troubleshooting', list(raw('troubleshooting.points')))}
    ${section('languages', `<p style="${STYLE.p}">${h('languages.body')}</p>${table([t('handout.languages.colLanguage', lang), t('handout.languages.colNative', lang), t('handout.languages.colCode', lang)], locales)}`)}
    ${section(
      'credits',
      `<p style="${STYLE.p}">${h('credits.original')} ${link(original.profile, original.name)} • ${link(original.github, 'GitHub')} • ${link(original.patreon, 'Patreon')}</p>
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
    const xp = `?{${tr('prompts.xp')}}`;
    const reason = `?{${tr('prompts.reason')}| }`;

    return `<div style="${STYLE.outer}${getDirectionStyle(lang)}">
    <div style="${STYLE.header}">
      <h1 style="${STYLE.h1}">✦ ${SCRIPT_NAME} ✦</h1>
      <p style="${STYLE.subtitle}">${DECK_TITLE} • v${SCRIPT_VERSION}</p>
    </div>
    ${group('deck.session', 'deck.sessionDesc', [btn('menu', ''), btn('addXp', `add ${xp} ${reason}`), btn('undo', 'undo', true), btn('show', 'show', true), btn('endSession', `end ?{${tr('prompts.confirmEnd')}|${tr('options.yesNo.yes')},yes|${tr('options.yesNo.no')},no}`)])}
    ${group('deck.selected', 'deck.selectedDesc', [btn('killSelected', 'kill'), btn('bonusSelected', `bonus ${xp} ${reason}`), btn('giveSelected', `give ${xp} ${reason}`, true), btn('absent', 'absent', true), btn('present', 'present', true)])}
    ${group('deck.party', 'deck.partyDesc', [btn('roster', 'roster'), btn('partyAdd', 'party add', true), btn('partyRemove', 'party remove', true)])}
    ${group('deck.tools', 'deck.toolsDesc', [btn('settings', 'settings', true), btn('status', 'status', true), btn('log', 'log', true), btn('help', 'help', true)])}
    <div style="${STYLE.footer}">${escapeHtml(tr('deck.footer', { help: HANDOUT_HELP_NAME }))}</div>
  </div>`;
  }

  /**
   * Builds the HTML for one logged session.
   *
   * @param {object} entry Logged session.
   * @param {string} lang Locale code.
   * @returns {string} HTML string.
   */
  function sessionHtml(entry, lang) {
    const tr = (key, vars) => t(key, lang, vars);
    const date = new Date(entry.ended).toISOString().slice(0, 16).replace('T', ' ');
    const parts = [
      `<h3 style="${STYLE.h3}">${escapeHtml(tr('log.sessionHeading', { number: entry.number, date }))}</h3>`,
    ];
    if (entry.totals.length > 0) {
      parts.push(
        table(
          [tr('log.colCharacter'), tr('log.colXp')],
          entry.totals.map((r) => [escapeForChat(r.name), formatNumber(r.xp)])
        )
      );
    } else {
      parts.push(`<p style="${STYLE.p}">${escapeHtml(tr('end.nothing'))}</p>`);
    }
    if (entry.awards.length > 0) {
      parts.push(
        `<p style="${STYLE.p}"><strong>${escapeHtml(tr('log.awards'))}</strong></p>`,
        `<ul>${entry.awards
          .map(
            (a) =>
              `<li style="${STYLE.li}">${formatNumber(a.xp)} XP — ${escapeForChat(a.reason || tr(`awardKinds.${a.kind}`))}${a.names ? ` (${escapeForChat(a.names)})` : ''}</li>`
          )
          .join('')}</ul>`
      );
    }
    if (entry.levelUps.length > 0) {
      parts.push(
        `<p style="${STYLE.p}"><strong>${escapeHtml(tr('log.levelUps'))}</strong> ${entry.levelUps
          .map((u) => escapeForChat(tr('end.levelLine', { name: u.name, level: u.level })))
          .join('; ')}</p>`
      );
    }
    if (entry.remainder > 0) {
      parts.push(
        `<p style="${STYLE.desc}">${escapeHtml(tr('end.remainder', { xp: formatNumber(entry.remainder) }))}</p>`
      );
    }
    return parts.join('');
  }

  /**
   * Builds the Session Log handout HTML.
   *
   * @param {string} locale Locale code.
   * @returns {string} HTML string.
   */
  function buildLogHtml(locale) {
    const lang = getLocale(locale);
    const history = getState().history || [];
    const body =
      history.length > 0
        ? history
            .map((entry) => sessionHtml(entry, lang))
            .join(`<hr style="border:none;border-top:1px solid ${COLOR_BORDER}">`)
        : `<p style="${STYLE.p}">${escapeHtml(t('log.empty', lang))}</p>`;
    return `<div style="${STYLE.outer}${getDirectionStyle(lang)}">
    <div style="${STYLE.header}">
      <h1 style="${STYLE.h1}">✦ ${escapeHtml(t('log.title', lang))} ✦</h1>
      <p style="${STYLE.subtitle}">${SCRIPT_NAME} v${SCRIPT_VERSION}</p>
    </div>
    ${body}
  </div>`;
  }

  /**
   * Adds an ended session to the history (newest first) and rewrites the Session Log.
   *
   * @param {object} summary Session summary from endSession.
   * @returns {void}
   */
  function logSession(summary) {
    const s = getState();
    if (!Array.isArray(s.history)) s.history = [];
    s.history.unshift({
      number: summary.number,
      ended: summary.ended,
      totals: summary.totals.map((r) => ({ name: r.name, xp: r.xp })),
      awards: summary.awards.map((a) => ({
        xp: a.xp,
        kind: a.kind,
        reason: a.reason,
        names: a.targets
          ? a.targets.map((id) => getObj('character', id)?.get('name') || id).join(', ')
          : '',
      })),
      levelUps: summary.levelUps.map((u) => ({ name: u.name, level: u.level })),
      remainder: summary.remainder,
    });
    s.history.splice(MAX_LOGGED_SESSIONS);
    upsertHandout(HANDOUT_LOG_NAME, buildLogHtml(getConfig().language));
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
   * Creates or refreshes the handouts in the current language.
   *
   * @returns {void}
   */
  function installHandouts() {
    const lang = getConfig().language;
    upsertHandout(HANDOUT_HELP_NAME, buildHelpHtml(lang));
    upsertHandout(HANDOUT_DECK_NAME, buildDeckHtml(lang));
    if ((getState().history || []).length > 0) {
      upsertHandout(HANDOUT_LOG_NAME, buildLogHtml(lang));
    }
  }

  // Who shares the XP: Roll20's own party, the players' characters, or a hand-picked list.

  /**
   * Returns the non-GM player IDs that control a character. "all" is not a player.
   *
   * @param {object} character Roll20 character.
   * @returns {string[]} Player IDs.
   */
  function controllingPlayers(character) {
    return splitList(character.get('controlledby')).filter(
      (id) => id !== 'all' && getObj('player', id) && !playerIsGM(id)
    );
  }

  /**
   * Returns true when a character is in Roll20's party (Jumpgate "Party Member").
   *
   * @param {object} character Roll20 character.
   * @returns {boolean} True when in the party.
   */
  function inRoll20Party(character) {
    return character.get('inParty') === true || toText(character.get('inParty')) === 'true';
  }

  /**
   * Returns true when any character is in Roll20's party.
   *
   * @returns {boolean} True when the party is in use.
   */
  function roll20PartyInUse() {
    return findObjs({ _type: 'character' }).some(inRoll20Party);
  }

  /**
   * Works out which roster source applies now.
   *
   * @returns {'party'|'players'|'manual'} Source.
   */
  function rosterSource() {
    const setting = getConfig().roster;
    if (setting === 'auto') {
      return roll20PartyInUse() ? 'party' : 'players';
    }
    return setting;
  }

  /**
   * Returns the characters on the roster, sorted by name. Archived and excluded
   * characters are left out; absent ones are kept (they may get a share).
   *
   * @returns {object[]} Roll20 characters.
   */
  function getRoster() {
    const source = rosterSource();
    return findObjs({ _type: 'character' })
      .filter((c) => c.get('archived') !== true)
      .filter((c) => {
        const rec = getCharacterRecord(c.id);
        if (rec.excluded) {
          return false;
        }
        if (source === 'party') return inRoll20Party(c);
        if (source === 'manual') return rec.member === true;
        return controllingPlayers(c).length > 0;
      })
      .sort((a, b) => toText(a.get('name')).localeCompare(toText(b.get('name'))));
  }

  /**
   * Returns true when a character is on the roster.
   *
   * @param {string} characterId Character ID.
   * @returns {boolean} True when on the roster.
   */
  function isOnRoster(characterId) {
    return getRoster().some((c) => c.id === characterId);
  }

  /**
   * Returns a character's share of the pool: 0 to 1 for absent characters (the
   * Absent Share setting), otherwise its own share (default 1).
   *
   * @param {string} characterId Character ID.
   * @returns {number} Share.
   */
  function shareOf(characterId) {
    const rec = getCharacterRecord(characterId);
    if (rec.absent) {
      return Math.max(0, Math.min(1, Number(getConfig().absentShare) || 0));
    }
    const share = Number(rec.share);
    return Number.isFinite(share) && share >= 0 ? share : 1;
  }

  /**
   * Splits an amount of XP between the roster.
   *
   * @param {number} amount XP to split.
   * @param {object[]} [roster] Characters (defaults to the roster).
   * @returns {{perShare: number, shares: number, remainder: number, rows: {id: string, name: string, share: number, xp: number}[]}} Split.
   */
  function splitXp(amount, roster = getRoster()) {
    const extra = Math.max(0, Number(getConfig().extraShares) || 0);
    const rows = roster.map((c) => ({
      id: c.id,
      name: c.get('name'),
      share: shareOf(c.id),
      xp: 0,
    }));
    const shares = rows.reduce((sum, r) => sum + r.share, 0) + extra;
    if (shares <= 0 || amount <= 0) {
      return { perShare: 0, shares, remainder: Math.max(0, amount), rows };
    }
    const perShare = amount / shares;
    let given = 0;
    for (const row of rows) {
      row.xp = Math.floor(perShare * row.share);
      given += row.xp;
    }
    // Extra shares (companions, hirelings) take their XP out of the pool.
    const extraXp = Math.floor(perShare * extra);
    return {
      perShare: Math.floor(perShare),
      shares,
      remainder: Math.max(0, amount - given - extraXp),
      rows,
    };
  }

  /**
   * Returns the average level of the roster from tracked levels, for systems whose
   * monster XP depends on it.
   *
   * @returns {number|null} Average level, or null when none is known.
   */
  function averagePartyLevel() {
    const levels = getRoster()
      .map((c) => getCharacterRecord(c.id).level)
      .filter((n) => Number.isFinite(n) && n > 0);
    if (levels.length === 0) {
      return null;
    }
    return Math.round(levels.reduce((a, b) => a + b, 0) / levels.length);
  }

  // Reading and writing XP and levels on character sheets. Beacon sheets (D&D 2024)
  // are read with getSheetItem and written with setSheetItem; other sheets use legacy
  // attributes. Every function returns a promise.

  // One read-modify-write at a time per character, so two awards cannot overwrite
  // each other.
  const queues = new Map();

  /**
   * Runs a task after any earlier task for the same character.
   *
   * @param {string} characterId Character ID.
   * @param {Function} task Async task.
   * @returns {Promise<*>} The task's result.
   */
  function serialise(characterId, task) {
    const previous = queues.get(characterId) || Promise.resolve();
    const next = previous.then(task, task);
    queues.set(
      characterId,
      next.catch(() => {})
    );
    return next;
  }

  /**
   * Returns the profile for a character with the current settings.
   *
   * @param {object} character Roll20 character.
   * @returns {object} Profile.
   */
  function getProfile(character) {
    return profileForCharacter(character, getConfig(), canUseBeacon());
  }

  /**
   * Finds a legacy attribute by name (case-insensitive).
   *
   * @param {string} characterId Character ID.
   * @param {string} name Attribute name.
   * @returns {object|undefined} Attribute.
   */
  function findAttribute(characterId, name) {
    const lower = name.toLowerCase();
    return findObjs(
      { _type: 'attribute', _characterid: characterId },
      { caseInsensitive: true }
    ).find((a) => toText(a.get('name')).toLowerCase() === lower);
  }

  /**
   * Reads the first field in a list that has a value.
   *
   * @param {object} character Roll20 character.
   * @param {string[]} names Field names, in order.
   * @param {string} access 'beacon' or 'legacy'.
   * @returns {Promise<{name: string, value: *}|null>} Field and value, or null.
   */
  async function readField(character, names, access) {
    const id = character.id;
    for (const name of names || []) {
      if (access === 'beacon') {
        if (!canUseBeacon()) {
          return null;
        }
        try {
          const value = await getSheetItem(id, name);
          if (value !== undefined && value !== null && toText(value) !== '') {
            return { name, value };
          }
        } catch {
          // Unknown field: try the next name.
        }
      } else {
        const attr = findAttribute(id, name);
        if (attr && toText(attr.get('current')) !== '') {
          return { name, value: attr.get('current') };
        }
      }
    }
    return null;
  }

  /**
   * Reads a character's XP and level.
   *
   * @param {object} character Roll20 character.
   * @returns {Promise<{xp: number|null, level: number|null, field: string|null, profile: object}>} Values.
   */
  async function readProgress(character) {
    const profile = getProfile(character);
    const xpField = await readField(character, profile.pc?.xp, profile.access);
    const levelField = await readField(character, profile.pc?.level, profile.access);
    const nextField = await readField(character, profile.pc?.next, profile.access);
    const level = levelField ? parseStrictInt(String(levelField.value).replace(/\D.*$/, '')) : null;
    let next = nextField ? parseXpText(nextField.value) : null;
    if (next === null && typeof profile.nextXp === 'function' && Number.isFinite(level)) {
      next = profile.nextXp(level);
    }
    return {
      xp: xpField ? parseXpText(xpField.value) : null,
      level,
      next: next > 0 ? next : null,
      field: xpField?.name || null,
      profile,
    };
  }

  /**
   * Writes a value to a character's XP field.
   *
   * @param {object} character Roll20 character.
   * @param {object} profile Profile.
   * @param {string|null} field Field read before, if any.
   * @param {number} value New XP.
   * @returns {Promise<{ok: boolean, reason?: string}>} Result.
   */
  async function writeXp(character, profile, field, value, amount) {
    if (profile.write?.kind === 'repeatingRow') {
      addLedgerRow(character, profile.write, amount);
      return { ok: true };
    }
    const name = field || profile.pc?.xp?.[0];
    if (!name) {
      return { ok: false, reason: 'noField' };
    }
    if (profile.access === 'beacon') {
      if (!canUseBeacon()) {
        return { ok: false, reason: 'sandbox' };
      }
      // Beacon sheets ignore a write of 0 (seen on the D&D 2024 sheet, sandbox 1.5).
      if (value <= 0) {
        return { ok: false, reason: 'zero' };
      }
      await setSheetItem(character.id, name, value);
      return { ok: true };
    }
    setLegacy(character, findAttribute(character.id, name), name, value);
    // Karma-style sheets keep a running total next to the spendable amount.
    for (const total of profile.alsoAdd || []) {
      const totalAttr = findAttribute(character.id, total);
      const current = parseXpText(totalAttr?.get('current')) ?? 0;
      setLegacy(character, totalAttr, total, Math.max(0, current + amount));
    }
    return { ok: true };
  }

  /**
   * Sets a legacy attribute through the sheet workers, creating it when missing.
   *
   * @param {object} character Roll20 character.
   * @param {object|undefined} attr Existing attribute.
   * @param {string} name Attribute name.
   * @param {*} value New value.
   * @returns {void}
   */
  function setLegacy(character, attr, name, value) {
    if (!attr) {
      const created = createObj('attribute', { characterid: character.id, name, current: '' });
      attr = created;
    }
    // Sheets hold what players type, which is text; some sheet workers fail on numbers
    // (the D&D 5E 2014 sheet's sanitizeXP calls trim()). setWithWorker lets the sheet's
    // own workers update level and totals.
    const text = String(value);
    if (typeof attr.setWithWorker === 'function') {
      attr.setWithWorker({ current: text });
    } else {
      attr.set('current', text);
    }
  }

  /**
   * Makes a Roll20 repeating-row ID (a time-based, sortable 20-character ID).
   *
   * @returns {string} Row ID.
   */
  function makeRowId() {
    const chars = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';
    let time = Date.now();
    let id = '';
    for (let i = 0; i < 8; i++) {
      id = chars.charAt(time % 64) + id;
      time = Math.floor(time / 64);
    }
    for (let i = 0; i < 12; i++) {
      id += chars.charAt(Math.floor(Math.random() * 64));
    }
    return id;
  }

  /**
   * Adds an XP ledger row (sheets such as WFRP 4E add their rows up themselves).
   *
   * @param {object} character Roll20 character.
   * @param {{section: string, amount: string, note: string}} write Row layout.
   * @param {number} amount XP.
   * @returns {void}
   */
  function addLedgerRow(character, write, amount) {
    const prefix = `repeating_${write.section}_${makeRowId()}_`;
    setLegacy(character, undefined, `${prefix}${write.note}`, 'LazyExperience');
    setLegacy(character, undefined, `${prefix}${write.amount}`, amount);
  }

  /**
   * Adds (or with a negative amount, takes away) XP on a character's sheet.
   *
   * @param {object} character Roll20 character.
   * @param {number} amount XP to add.
   * @returns {Promise<{ok: boolean, reason?: string, before?: number, after?: number, level?: number|null, profile?: object}>} Result.
   */
  function addXp(character, amount) {
    return serialise(character.id, async () => {
      const progress = await readProgress(character);
      if (progress.profile.access === 'beacon' && !canUseBeacon()) {
        return { ok: false, reason: 'sandbox', profile: progress.profile };
      }
      if (progress.profile.xpless) {
        return { ok: false, reason: 'xpless', profile: progress.profile };
      }
      const before = progress.xp ?? 0;
      const after = Math.max(0, before + amount);
      if (after === before) {
        return {
          ok: true,
          before,
          after,
          level: progress.level,
          next: progress.next,
          profile: progress.profile,
        };
      }
      const result = await writeXp(
        character,
        progress.profile,
        progress.field,
        after,
        after - before
      );
      return {
        ...result,
        before,
        after,
        level: progress.level,
        next: progress.next,
        profile: progress.profile,
      };
    });
  }

  /**
   * Reads the XP a defeated creature is worth.
   *
   * @param {object} character The creature's character.
   * @param {number|null} partyLevel Average party level, for systems that need it.
   * @returns {Promise<number|null>} XP, or null when the sheet has none.
   */
  async function readCreatureXp(character, partyLevel) {
    const profile = getProfile(character);
    if (typeof profile.creatureXp === 'function') {
      const level = await readField(character, profile.npc?.level, profile.access);
      return profile.creatureXp(level?.value, partyLevel);
    }
    const xp = await readField(character, profile.npc?.xp, profile.access);
    const parsed = xp ? parseXpText(xp.value) : null;
    if (parsed !== null && parsed > 0) {
      return parsed;
    }
    if (typeof profile.crXp === 'function') {
      const cr = await readField(character, profile.npc?.cr, profile.access);
      return cr ? profile.crXp(cr.value) : null;
    }
    return null;
  }

  // Level-up notices.

  const levelObservers = [];

  /**
   * Registers a function called with {character, level} when a character levels.
   *
   * @param {Function} fn Observer.
   * @returns {void}
   */
  function onLevelUp(fn) {
    if (typeof fn === 'function') {
      levelObservers.push(fn);
    }
  }

  /**
   * Tells observers about a level-up. An observer error never stops the mod.
   *
   * @param {object} event Event.
   * @returns {void}
   */
  function notifyObservers(event) {
    for (const fn of levelObservers) {
      try {
        fn(event);
      } catch (err) {
        log(`${SCRIPT_NAME}: a level-up observer failed: ${err?.message || err}`);
      }
    }
  }

  /**
   * Announces that a character reached a level.
   *
   * @param {object} character Roll20 character.
   * @param {number} level New level.
   * @returns {void}
   */
  function announceLevel(character, level) {
    const lang = getConfig().language;
    const profile = getProfile(character);
    const name = escapeForChat(character.get('name'));
    const lines = [
      `<div>${t('levels.reached', lang, { name: `<strong>${name}</strong>`, level })}</div>`,
    ];
    const hint = { sheetButton: 'levels.sheetButton', pf2: 'levels.pf2', spend: 'levels.spend' }[
      profile.levelUpHint
    ];
    lines.push(buildNote(escapeForChat(t(hint || 'levels.updateSheet', lang))));
    announce(
      getConfig().levelNotice,
      controllingPlayers(character),
      t('titles.levelUp', lang),
      lines
    );
    getSession().levelUps.push({ id: character.id, name: character.get('name'), level });
    notifyObservers({ character, level });
  }

  /**
   * Checks whether an XP award took a character to a new level, and announces it once.
   *
   * @param {object} character Roll20 character.
   * @param {{after: number, level: number|null, profile: object}} result Result of addXp.
   * @returns {number|null} The new level announced, or null.
   */
  function checkLevelUp(character, result) {
    const rec = getCharacterRecord(character.id);
    if (Number.isFinite(result.level) && result.level > 0) {
      rec.level = result.level;
    }
    const profile = result.profile || {};
    const first = profile.firstLevel ?? 1;
    // A sheet's own "XP for next level" field (or the system's rule for it) comes first,
    // because the GM may have chosen another track; the profile's table is the fallback.
    let reached = null;
    if (Number.isFinite(result.next) && Number.isFinite(result.level)) {
      reached = result.after >= result.next ? result.level + 1 : result.level;
    } else {
      reached = levelForXp(profile.levels, result.after, first);
    }
    if (reached === null) {
      return null;
    }
    const known = Math.max(result.level ?? first, rec.notified ?? first, first);
    if (reached <= known) {
      return null;
    }
    rec.notified = reached;
    announceLevel(character, reached);
    return reached;
  }

  // The session: the XP pool, bonuses, awards, paying out and ending a session.

  const awardObservers = [];
  const sessionEndListeners = [];

  /**
   * Registers a function called with each award ({kind, xp, reason, targets}).
   *
   * @param {Function} fn Observer.
   * @returns {void}
   */
  function onAward(fn) {
    if (typeof fn === 'function') {
      awardObservers.push(fn);
    }
  }

  /**
   * Registers a function called with the summary when a session ends (used by the log).
   *
   * @param {Function} fn Listener.
   * @returns {void}
   */
  function onSessionEnd(fn) {
    sessionEndListeners.push(fn);
  }

  /**
   * Calls each function with an event, logging instead of stopping on errors.
   *
   * @param {Function[]} list Functions.
   * @param {*} event Event.
   * @returns {void}
   */
  function emit(list, event) {
    for (const fn of list) {
      try {
        fn(event);
      } catch (err) {
        log(`${SCRIPT_NAME}: an observer failed: ${err?.message || err}`);
      }
    }
  }

  /**
   * Checks an XP amount. Negative amounts are allowed only for corrections.
   *
   * @param {*} xp Amount.
   * @param {boolean} [allowNegative=false] Accept amounts below 0.
   * @returns {number|null} Whole XP, or null when invalid.
   */
  function validXp(xp, allowNegative = false) {
    const n = Number(xp);
    if (!Number.isFinite(n) || !Number.isInteger(n) || n === 0 || Math.abs(n) > MAX_XP) {
      return null;
    }
    return n < 0 && !allowNegative ? null : n;
  }

  /**
   * Trims a reason to a sensible length.
   *
   * @param {*} reason Reason text.
   * @returns {string} Reason.
   */
  function cleanReason(reason) {
    return toText(reason).slice(0, MAX_REASON_LENGTH);
  }

  /**
   * Records an award in the session.
   *
   * @param {object} award Award.
   * @returns {object} The award.
   */
  function record(award) {
    const session = getSession();
    session.awards.push(award);
    if (session.awards.length > MAX_AWARDS_PER_SESSION) {
      session.awards.splice(0, session.awards.length - MAX_AWARDS_PER_SESSION);
    }
    emit(awardObservers, { ...award });
    return award;
  }

  /**
   * Pays XP to characters now: writes the sheets (when that setting is on), adds to the
   * session's paid totals and checks for level-ups.
   *
   * @param {{id: string, xp: number}[]} rows Who gets what.
   * @returns {Promise<{id: string, name: string, xp: number, ok: boolean, reason?: string, after?: number}[]>} Results.
   */
  async function pay(rows) {
    const config = getConfig();
    const session = getSession();
    const results = [];
    for (const row of rows) {
      const character = getObj('character', row.id);
      if (!character || !row.xp) {
        continue;
      }
      session.paid[row.id] = (session.paid[row.id] || 0) + row.xp;
      if (!config.updateSheets) {
        results.push({
          id: row.id,
          name: character.get('name'),
          xp: row.xp,
          ok: true,
          sheet: false,
        });
        continue;
      }
      try {
        const result = await addXp(character, row.xp);
        if (result.ok) {
          checkLevelUp(character, result);
        } else if (result.reason === 'xpless') {
          // A system without XP (Savage Worlds, 13th Age…): nothing was given, so the
          // summary must not say otherwise.
          session.paid[row.id] -= row.xp;
          if (session.paid[row.id] === 0) delete session.paid[row.id];
        }
        results.push({
          id: row.id,
          name: character.get('name'),
          xp: row.xp,
          ...result,
          sheet: true,
        });
      } catch (err) {
        log(`${SCRIPT_NAME}: could not update ${character.get('name')}: ${err?.message || err}`);
        results.push({
          id: row.id,
          name: character.get('name'),
          xp: row.xp,
          ok: false,
          reason: 'error',
        });
      }
    }
    reportProblems(results);
    return results;
  }

  /**
   * Tells the GM about sheets that could not be updated.
   *
   * @param {object[]} results Pay results.
   * @returns {void}
   */
  function reportProblems(results) {
    const lang = getConfig().language;
    for (const r of results.filter((x) => !x.ok)) {
      whisperWarning(
        null,
        t(`warnings.write.${r.reason || 'error'}`, lang, { name: r.name, xp: formatNumber(r.xp) })
      );
    }
  }

  /**
   * Adds XP to the session pool, or pays it straight away in instant mode.
   *
   * @param {number} xp XP.
   * @param {string} [reason] Why.
   * @param {object} [meta] Extra details (source, tokenId).
   * @returns {Promise<object|null>} The award, or null when refused.
   */
  async function addToPool(xp, reason = '', meta = {}) {
    const amount = validXp(xp, true);
    if (amount === null) {
      return null;
    }
    const config = getConfig();
    const session = getSession();
    const award = record({
      id: makeId(),
      kind: 'pool',
      xp: amount,
      reason: cleanReason(reason),
      at: Date.now(),
      source: meta.source || 'manual',
      tokenId: meta.tokenId || null,
      paid: false,
    });
    if (config.payout === 'instant') {
      const split = splitXp(amount + session.carried);
      session.carried = split.remainder;
      award.paid = true;
      award.split = split.rows.map((r) => ({ id: r.id, xp: r.xp }));
      const results = await pay(split.rows);
      if (split.rows.length === 0 || split.perShare <= 0) {
        whisperWarning(
          null,
          t('warnings.nobodyToPay', config.language, { xp: formatNumber(split.remainder) })
        );
      } else {
        announceInstant(award, split, results);
      }
    } else {
      session.pool = Math.max(0, session.pool + amount);
    }
    return award;
  }

  /**
   * Gives bonus XP to some characters on top of their share.
   *
   * @param {string[]} characterIds Characters.
   * @param {number} xp XP each (negative to correct a mistake).
   * @param {string} [reason] Why.
   * @returns {Promise<object|null>} The award, or null when refused.
   */
  async function addBonus(characterIds, xp, reason = '') {
    const amount = validXp(xp, true);
    if (amount === null || characterIds.length === 0) {
      return null;
    }
    const config = getConfig();
    const session = getSession();
    const award = record({
      id: makeId(),
      kind: 'bonus',
      xp: amount,
      reason: cleanReason(reason),
      targets: [...characterIds],
      at: Date.now(),
      paid: false,
    });
    if (config.payout === 'instant') {
      award.paid = true;
      const results = await pay(characterIds.map((id) => ({ id, xp: amount })));
      announceBonus(award, results);
    } else {
      for (const id of characterIds) {
        session.bonuses[id] = (session.bonuses[id] || 0) + amount;
      }
    }
    return award;
  }

  /**
   * Takes back the last award that has not been paid yet.
   *
   * @returns {object|null} The award taken back, or null.
   */
  function undoLast() {
    const session = getSession();
    let index = -1;
    for (let i = session.awards.length - 1; i >= 0 && index < 0; i--) {
      if (!session.awards[i].paid && !session.awards[i].undone) index = i;
    }
    if (index < 0) {
      return null;
    }
    const award = session.awards[index];
    award.undone = true;
    if (award.kind === 'pool') {
      session.pool = Math.max(0, session.pool - award.xp);
      if (award.tokenId && session.kills[award.tokenId]) {
        session.kills[award.tokenId].status = 'ignored';
      }
    } else if (award.kind === 'bonus') {
      for (const id of award.targets) {
        session.bonuses[id] = (session.bonuses[id] || 0) - award.xp;
        if (session.bonuses[id] === 0) delete session.bonuses[id];
      }
    }
    return award;
  }

  /**
   * Works out what each character would get if the session ended now.
   *
   * @returns {{split: object, rows: {id: string, name: string, share: number, xp: number, bonus: number, total: number}[]}} Preview.
   */
  function previewPayout() {
    const session = getSession();
    const roster = getRoster();
    const split = splitXp(session.pool + session.carried, roster);
    const ids = new Set(split.rows.map((r) => r.id));
    const rows = split.rows.map((r) => ({
      ...r,
      bonus: session.bonuses[r.id] || 0,
      total: r.xp + (session.bonuses[r.id] || 0),
    }));
    // Bonus XP for a character no longer on the roster is still paid.
    for (const [id, bonus] of Object.entries(session.bonuses)) {
      const character = getObj('character', id);
      if (!ids.has(id) && character && bonus) {
        rows.push({ id, name: character.get('name'), share: 0, xp: 0, bonus, total: bonus });
      }
    }
    return { split, rows };
  }

  /**
   * Ends the session: pays the pool and bonuses (unless already paid instantly),
   * announces the results, logs the session and starts the next one.
   *
   * @returns {Promise<object>} Summary of the session.
   */
  async function endSession() {
    const config = getConfig();
    const lang = config.language;
    const session = getSession();
    const s = getState();
    let rows = [];
    let results = [];
    let split = null;
    if (config.payout === 'end') {
      const preview = previewPayout();
      split = preview.split;
      rows = preview.rows;
      results = await pay(rows.map((r) => ({ id: r.id, xp: r.total })));
    }
    const totals = Object.entries(session.paid)
      .map(([id, xp]) => ({ id, name: getObj('character', id)?.get('name') || id, xp }))
      .sort((a, b) => a.name.localeCompare(b.name));
    const summary = {
      number: session.number,
      started: session.started,
      ended: Date.now(),
      payout: config.payout,
      pool: session.pool,
      awards: session.awards.filter((a) => !a.undone),
      kills: Object.values(session.kills).filter((k) => k.status === 'added'),
      totals,
      levelUps: [...session.levelUps],
      remainder: split ? split.remainder : session.carried,
      results,
    };

    announceEnd(summary);
    for (const row of totals) {
      const character = getObj('character', row.id);
      const result = results.find((r) => r.id === row.id);
      if (character) {
        const owners = controllingPlayers(character);
        const after = result?.after !== undefined ? formatNumber(result.after) : null;
        const text = after
          ? t('end.playerLineTotal', lang, {
              name: escapeForChat(row.name),
              xp: formatNumber(row.xp),
              total: after,
            })
          : t('end.playerLine', lang, { name: escapeForChat(row.name), xp: formatNumber(row.xp) });
        for (const id of owners) {
          whisper(id, t('titles.yourXp', lang), `<div>${text}</div>`);
        }
      }
    }

    emit(sessionEndListeners, summary);
    // Absence is for one session only.
    for (const rec of Object.values(s.characters)) {
      rec.absent = false;
    }
    const next = newSession(session.number + 1);
    next.carried = summary.remainder;
    s.session = next;
    return summary;
  }

  /**
   * Starts a new session without paying anything (the pool and bonuses are dropped).
   *
   * @returns {void}
   */
  function resetSession() {
    const s = getState();
    s.session = newSession(s.session.number);
  }

  /**
   * Announces an instant award.
   *
   * @param {object} award Award.
   * @param {object} split Split.
   * @param {object[]} results Pay results.
   * @returns {void}
   */
  function announceInstant(award, split, results) {
    const lang = getConfig().language;
    const lines = [
      `<div>${t('instant.everyone', lang, { xp: `<strong>${formatNumber(split.perShare)}</strong>` })}</div>`,
    ];
    if (award.reason) {
      lines.push(buildNote(escapeForChat(award.reason)));
    }
    const owners = results.flatMap((r) => {
      const c = getObj('character', r.id);
      return c ? controllingPlayers(c) : [];
    });
    announce(getConfig().announce, owners, t('titles.xpAwarded', lang), lines);
  }

  /**
   * Announces an instant bonus.
   *
   * @param {object} award Award.
   * @param {object[]} results Pay results.
   * @returns {void}
   */
  function announceBonus(award, results) {
    const lang = getConfig().language;
    const names = results.map((r) => escapeForChat(r.name)).join(', ');
    const lines = [
      `<div>${t('instant.bonus', lang, { names: `<strong>${names}</strong>`, xp: formatNumber(award.xp) })}</div>`,
    ];
    if (award.reason) {
      lines.push(buildNote(escapeForChat(award.reason)));
    }
    const owners = award.targets.flatMap((id) => {
      const c = getObj('character', id);
      return c ? controllingPlayers(c) : [];
    });
    announce(getConfig().announce, owners, t('titles.xpAwarded', lang), lines);
  }

  /**
   * Announces the end of a session.
   *
   * @param {object} summary Session summary.
   * @returns {void}
   */
  function announceEnd(summary) {
    const lang = getConfig().language;
    const lines = [];
    if (summary.totals.length === 0) {
      lines.push(`<div>${escapeForChat(t('end.nothing', lang))}</div>`);
    }
    for (const row of summary.totals) {
      lines.push(
        `<div>${escapeForChat(row.name)}: <strong>${formatNumber(row.xp)}</strong> XP</div>`
      );
    }
    const owners = summary.totals.flatMap((r) => {
      const c = getObj('character', r.id);
      return c ? controllingPlayers(c) : [];
    });
    announce(
      getConfig().announce,
      owners,
      t('titles.sessionEnded', lang, { number: summary.number }),
      lines
    );
    if (summary.remainder > 0) {
      whisper(
        null,
        t('titles.sessionEnded', lang, { number: summary.number }),
        buildNote(escapeForChat(t('end.remainder', lang, { xp: formatNumber(summary.remainder) })))
      );
    }
  }

  /**
   * Marks characters absent or present for this session.
   *
   * @param {string[]} characterIds Characters.
   * @param {boolean} absent Absent?
   * @returns {void}
   */
  function setAbsent(characterIds, absent) {
    for (const id of characterIds) {
      getCharacterRecord(id).absent = absent;
    }
  }

  // Noticing defeated creatures, modelled on HealthColors: the HP bar dropping to 0 on
  // the token (change:graphic), on its linked attribute (change:attribute) or through
  // TokenMod, a marker going on, or DeathTracker 1.0 reporting a death. Each token
  // counts once per session.

  // Tokens just handled through change:attribute, so change:graphic does not see them twice.
  const recentAttrTokens = new Set();

  /**
   * Reads a previous value from a Roll20 prev snapshot or from another Mod's object.
   *
   * @param {object} prev Snapshot.
   * @param {string} key Property.
   * @returns {*} Value, or undefined.
   */
  function prevValue(prev, key) {
    if (!prev) return undefined;
    if (isRecord(prev) && Object.hasOwn(prev, key)) return prev[key];
    if (typeof prev.get === 'function') return prev.get(key);
    return undefined;
  }

  /**
   * Parses an HP bar value. Blank or text values are not numbers.
   *
   * @param {*} raw Bar value.
   * @returns {number|null} HP, or null.
   */
  function parseHp(raw) {
    const text = toText(raw);
    return /^-?\d+(\.\d+)?$/.test(text) ? Number(text) : null;
  }

  /**
   * Returns the statusmarkers of a token or snapshot as a list of tags.
   *
   * @param {*} raw statusmarkers text.
   * @returns {string[]} Tags (with any @number badge removed).
   */
  function markerTags(raw) {
    return toText(raw)
      .split(',')
      .map((m) => m.split('@')[0].trim())
      .filter(Boolean);
  }

  /**
   * Returns true when the configured marker is on in a marker list. Built-in names and
   * custom set names (without the ::id) both match.
   *
   * @param {string[]} tags Marker tags.
   * @param {string} marker Configured marker.
   * @returns {boolean} True when present.
   */
  function hasMarker(tags, marker) {
    const want = toText(marker).replace(/^status_/, '');
    if (!want) return false;
    const wantName = want.split('::')[0].toLowerCase();
    return tags.some((tag) => tag === want || tag.split('::')[0].toLowerCase() === wantName);
  }

  /**
   * Returns the character a token stands for, when it can be defeated for XP: not on
   * the roster and not controlled by a player.
   *
   * @param {object} token Roll20 graphic.
   * @returns {object|null} Character, or null.
   */
  function creatureFor(token) {
    if (!token || token.get('_subtype') === 'card') return null;
    const character = getObj('character', toText(token.get('represents')));
    if (!character) return null;
    if (isOnRoster(character.id) || controllingPlayers(character).length > 0) return null;
    return character;
  }

  /**
   * Looks at a token change and reports whether it is a defeat.
   *
   * @param {object} token Roll20 graphic.
   * @param {object} prev Previous values.
   * @returns {'bar'|'marker'|null} What showed the defeat.
   */
  function defeatSource(token, prev) {
    const config = getConfig();
    if (config.killBar) {
      const key = `bar${config.hpBar}_value`;
      const now = parseHp(token.get(key));
      const before = parseHp(prevValue(prev, key));
      if (now !== null && now <= 0 && before !== null && before > 0) {
        return 'bar';
      }
    }
    if (config.killMarker) {
      const now = hasMarker(markerTags(token.get('statusmarkers')), config.marker);
      const before = hasMarker(markerTags(prevValue(prev, 'statusmarkers')), config.marker);
      if (now && !before) {
        return 'marker';
      }
    }
    return null;
  }

  /**
   * Handles a token change from Roll20 or from another Mod's observer.
   *
   * @param {object} token Roll20 graphic.
   * @param {object} prev Previous values.
   * @returns {void}
   */
  function handleTokenChange(token, prev) {
    if (getConfig().killMode === 'off') return;
    if (recentAttrTokens.has(token.id)) return;
    if (defeatSource(token, prev)) {
      void noticeDefeat(token);
    }
  }

  /**
   * Handles a change to an attribute linked to a token's HP bar. Sheets and Mods that
   * change the attribute do not always raise a token change with the old value.
   *
   * @param {object} attr Roll20 attribute.
   * @param {object} prev Previous values.
   * @returns {void}
   */
  function handleAttributeChange(attr, prev) {
    const config = getConfig();
    if (config.killMode === 'off' || !config.killBar) return;
    const now = parseHp(attr.get('current'));
    const before = parseHp(prevValue(prev, 'current'));
    if (now === null || before === null || !(now <= 0 && before > 0)) return;
    const linkKey = `bar${config.hpBar}_link`;
    for (const token of findObjs({ _type: 'graphic', represents: attr.get('_characterid') })) {
      if (token.get(linkKey) !== attr.id) continue;
      recentAttrTokens.add(token.id);
      setTimeout(() => recentAttrTokens.delete(token.id), RECENT_ATTR_MS);
      void noticeDefeat(token);
    }
  }

  /**
   * Handles DeathTracker 1.0's status events.
   *
   * @param {{token: object, status: string}} event DeathTracker event.
   * @returns {void}
   */
  function handleDeathTrackerStatus(event) {
    const config = getConfig();
    if (config.killMode === 'off' || !config.killDeathTracker) return;
    if (event?.status === 'dead' && event.token) {
      void noticeDefeat(event.token);
    }
  }

  /**
   * Works out a creature's XP and records the defeat: prompts the GM, or adds it to
   * the pool straight away in automatic mode. Does nothing for a token already counted
   * this session.
   *
   * @param {object} token Roll20 graphic.
   * @param {object} [options] Options.
   * @param {number|null} [options.xp] XP to use instead of the sheet's.
   * @param {boolean} [options.manual] Started by the GM (adds without a prompt).
   * @returns {Promise<string>} What happened: 'prompted', 'added', 'counted', 'noXp', 'notCreature'.
   */
  async function noticeDefeat(token, { xp = null, manual = false } = {}) {
    const config = getConfig();
    const session = getSession();
    const character = creatureFor(token);
    if (!character) return 'notCreature';
    const existing = session.kills[token.id];
    // Seen again by itself: already counted. The GM can still add a pending or ignored one.
    if (existing && (existing.status === 'added' || existing.status === 'reading' || !manual)) {
      return 'counted';
    }
    // Hold the token while its XP is read, so a second event for the same drop waits.
    session.kills[token.id] = { tokenId: token.id, status: 'reading', at: Date.now() };

    let value = xp;
    if (value === null) {
      try {
        value = await readCreatureXp(character, averagePartyLevel());
      } catch (err) {
        log(
          `${SCRIPT_NAME}: could not read XP for ${character.get('name')}: ${err?.message || err}`
        );
        value = null;
      }
    }
    const name = toText(token.get('name')) || toText(character.get('name'));
    const kill = {
      tokenId: token.id,
      characterId: character.id,
      name,
      xp: Number.isFinite(value) ? value : 0,
      status: 'pending',
      at: Date.now(),
    };
    session.kills[token.id] = kill;

    if ((manual || config.killMode === 'auto') && kill.xp > 0) {
      return confirmKill(token.id, kill.xp) ? 'added' : 'noXp';
    }
    promptGm(kill);
    return kill.xp > 0 ? 'prompted' : 'noXp';
  }

  /**
   * Whispers the GM a defeat prompt with Add / other amount / Ignore buttons.
   *
   * @param {object} kill Kill record.
   * @returns {void}
   */
  function promptGm(kill) {
    const lang = getConfig().language;
    const name = escapeForChat(kill.name);
    const lines = [];
    if (kill.xp > 0) {
      lines.push(
        `<div>${t('kills.prompt', lang, { name: `<strong>${name}</strong>`, xp: `<strong>${formatNumber(kill.xp)}</strong>` })}</div>`
      );
      lines.push(
        `<div style="margin-top:4px">${buildButton(t('buttons.addKill', lang, { xp: formatNumber(kill.xp) }), `${COMMAND} kill confirm ${kill.tokenId}`)}${buildSecondaryButton(t('buttons.otherXp', lang), `${COMMAND} kill confirm ${kill.tokenId} ?{${t('prompts.xp', lang)}|${kill.xp}}`)}${buildSecondaryButton(t('buttons.ignore', lang), `${COMMAND} kill ignore ${kill.tokenId}`)}</div>`
      );
    } else {
      lines.push(`<div>${t('kills.noXp', lang, { name: `<strong>${name}</strong>` })}</div>`);
      lines.push(
        `<div style="margin-top:4px">${buildButton(t('buttons.otherXp', lang), `${COMMAND} kill confirm ${kill.tokenId} ?{${t('prompts.xp', lang)}}`)}${buildSecondaryButton(t('buttons.ignore', lang), `${COMMAND} kill ignore ${kill.tokenId}`)}</div>`
      );
    }
    whisper(null, t('titles.defeated', lang), lines);
  }

  /**
   * Adds a recorded defeat to the pool.
   *
   * @param {string} tokenId Token ID.
   * @param {number} [xp] XP (defaults to the recorded amount).
   * @returns {boolean} True when added.
   */
  function confirmKill(tokenId, xp) {
    const kill = getSession().kills[tokenId];
    if (!kill || kill.status === 'added') return false;
    const amount = Number.isFinite(xp) ? xp : kill.xp;
    if (!(amount > 0)) return false;
    kill.xp = amount;
    kill.status = 'added';
    void addToPool(amount, t('kills.reason', getConfig().language, { name: kill.name }), {
      source: 'kill',
      tokenId,
    });
    return true;
  }

  /**
   * Ignores a recorded defeat.
   *
   * @param {string} tokenId Token ID.
   * @returns {boolean} True when there was a pending defeat.
   */
  function ignoreKill(tokenId) {
    const kill = getSession().kills[tokenId];
    if (!kill || kill.status !== 'pending') return false;
    kill.status = 'ignored';
    return true;
  }

  // Chat menus: the main card, the roster card, settings and status.

  /**
   * Returns the language and a translate shortcut.
   *
   * @returns {{lang: string, tr: Function}} Helpers.
   */
  function helpers() {
    const lang = getConfig().language;
    return { lang, tr: (key, vars) => t(key, lang, vars) };
  }

  /**
   * Shows the main menu to the GM.
   *
   * @param {string|null} playerId GM to whisper.
   * @returns {void}
   */
  function showMainMenu(playerId) {
    const { tr } = helpers();
    const config = getConfig();
    const session = getSession();
    const lines = [];
    lines.push(buildRow(tr('menu.session'), `<strong>${session.number}</strong>`));
    const { split, rows } = previewPayout();
    lines.push(
      buildRow(
        tr('menu.pool'),
        `<strong>${formatNumber(session.pool)}</strong>${session.carried ? ` (+${formatNumber(session.carried)})` : ''}`
      ),
      buildRow(tr('menu.payout'), escapeForChat(tr(`options.payout.${config.payout}`))),
      // Half shares are common, so shares keep up to two decimals (3.5, not 4).
      buildRow(
        tr('menu.shares'),
        Number.isInteger(split.shares)
          ? formatNumber(split.shares)
          : String(Math.round(split.shares * 100) / 100)
      ),
      buildRow(tr('menu.perShare'), formatNumber(split.perShare))
    );
    lines.push(
      buildSectionLabel(tr('menu.party', { source: tr(`options.roster.${rosterSource()}`) }))
    );
    if (rows.length === 0) {
      lines.push(buildNote(escapeForChat(tr('menu.noParty'))));
    }
    for (const row of rows) {
      const rec = getCharacterRecord(row.id);
      const toggle = rec.absent
        ? buildSecondaryButton(tr('buttons.present'), `${COMMAND} present --ids ${row.id} --menu`)
        : buildSecondaryButton(tr('buttons.absent'), `${COMMAND} absent --ids ${row.id} --menu`);
      const detail = [
        config.payout === 'end' ? formatNumber(row.total) : formatNumber(session.paid[row.id] || 0),
        rec.absent ? tr('menu.absentTag') : '',
        row.bonus ? tr('menu.bonusTag', { xp: formatNumber(row.bonus) }) : '',
      ]
        .filter(Boolean)
        .join(' ');
      lines.push(
        buildRow(
          row.name,
          `${escapeForChat(detail)} ${buildSecondaryButton('+', `${COMMAND} bonus ?{${tr('prompts.xp')}} --ids ${row.id} --menu`)}${toggle}`
        )
      );
    }
    lines.push(buildDivider());
    lines.push(
      `<div>${buildButton(tr('buttons.addXp'), `${COMMAND} add ?{${tr('prompts.xp')}} ?{${tr('prompts.reason')}| } --menu`)}${buildButton(tr('buttons.killSelected'), `${COMMAND} kill --menu`)}${buildButton(tr('buttons.bonusSelected'), `${COMMAND} bonus ?{${tr('prompts.xp')}} --menu`)}</div>`,
      `<div>${buildButton(tr('buttons.endSession'), `${COMMAND} end ?{${tr('prompts.confirmEnd')}|${tr('options.yesNo.yes')},yes|${tr('options.yesNo.no')},no}`)}${buildSecondaryButton(tr('buttons.undo'), `${COMMAND} undo --menu`)}</div>`
    );
    lines.push(
      `<div>${buildSecondaryButton(tr('buttons.roster'), `${COMMAND} roster`)}${buildSecondaryButton(tr('buttons.settings'), `${COMMAND} settings`)}${buildSecondaryButton(tr('buttons.status'), `${COMMAND} status`)}${buildSecondaryButton(tr('buttons.help'), `${COMMAND} help`)}</div>`
    );
    whisper(playerId, `${SCRIPT_NAME} v${SCRIPT_VERSION}`, lines);
  }

  /**
   * Shows the roster card: who is in the party, shares and absence.
   *
   * @param {string|null} playerId GM to whisper.
   * @returns {void}
   */
  function showRoster(playerId) {
    const { tr } = helpers();
    const config = getConfig();
    const source = rosterSource();
    const lines = [
      buildRow(tr('menu.rosterSource'), escapeForChat(tr(`options.roster.${config.roster}`))),
      buildNote(escapeForChat(tr(`roster.explain.${source}`))),
    ];
    const roster = getRoster();
    if (roster.length === 0) {
      lines.push(buildNote(escapeForChat(tr('menu.noParty'))));
    }
    for (const c of roster) {
      const rec = getCharacterRecord(c.id);
      // Name and share on one line, the buttons under it: three buttons do not fit beside
      // a name in the chat panel.
      const tags = [
        tr('menu.shareTag', { share: shareOf(c.id) }),
        rec.absent ? tr('menu.absentTag') : '',
      ]
        .filter(Boolean)
        .join(' ');
      lines.push(
        `<div style="margin:4px 0 2px 0"><strong>${escapeForChat(c.get('name'))}</strong> <span style="font-size:0.85em">${escapeForChat(tags)}</span></div>`,
        `<div>${buildSecondaryButton(tr('buttons.share'), `${COMMAND} share ?{${tr('prompts.share')}|1} --ids ${c.id} --roster`)}${buildSecondaryButton(rec.absent ? tr('buttons.present') : tr('buttons.absent'), `${COMMAND} ${rec.absent ? 'present' : 'absent'} --ids ${c.id} --roster`)}${buildSecondaryButton(tr('buttons.exclude'), `${COMMAND} exclude --ids ${c.id} --roster`)}</div>`
      );
    }
    const excluded = Object.entries(getState().characters)
      .filter(([, rec]) => rec.excluded)
      .map(([id]) => getObj('character', id))
      .filter(Boolean);
    if (excluded.length > 0) {
      lines.push(buildSectionLabel(tr('menu.excluded')));
      for (const c of excluded) {
        lines.push(
          buildRow(
            c.get('name'),
            buildSecondaryButton(tr('buttons.include'), `${COMMAND} include --ids ${c.id} --roster`)
          )
        );
      }
    }
    lines.push(buildDivider());
    lines.push(
      `<div>${buildButton(tr('buttons.partyAdd'), `${COMMAND} party add --roster`)}${buildSecondaryButton(tr('buttons.partyRemove'), `${COMMAND} party remove --roster`)}${buildSecondaryButton(tr('buttons.menu'), COMMAND)}</div>`,
      buildNote(escapeForChat(tr('roster.selectHint')))
    );
    whisper(playerId, tr('titles.roster'), lines);
  }

  /**
   * Builds the edit button for one setting.
   *
   * @param {string} key Setting name.
   * @returns {string} Button HTML.
   */
  function settingButton(key) {
    const { tr } = helpers();
    const config = getConfig();
    const type = SETTING_TYPES[key];
    const value = config[key];
    const cmd = (v) => `${COMMAND} set ${key} ${v} --settings`;
    if (type === 'boolean') {
      return buildSecondaryButton(
        value ? tr('options.yesNo.yes') : tr('options.yesNo.no'),
        cmd(!value)
      );
    }
    if (Array.isArray(type)) {
      const label = typeof type[0] === 'number' ? String(value) : tr(`options.${key}.${value}`);
      const query = type
        .map(
          (v) =>
            `${typeof v === 'number' ? v : tr(`options.${key}.${v}`).replace(/[,|}]/g, ' ')},${v}`
        )
        .join('|');
      return buildSecondaryButton(label, cmd(`?{${tr(`settings.${key}.label`)}|${query}}`));
    }
    if (type === 'system') {
      const query = systemIds()
        // Commas and pipes would split a Roll20 query option.
        .map(
          (id) =>
            `${(id === 'auto' ? tr('options.system.auto') : getProfileById(id).label).replace(/[,|]/g, ' /')},${id}`
        )
        .join('|');
      const label =
        value === 'auto' ? tr('options.system.auto') : getProfileById(value)?.label || value;
      return buildSecondaryButton(label, cmd(`?{${tr('settings.system.label')}|${query}}`));
    }
    if (type === 'locale') {
      const locale = LOCALE_DEFINITIONS.find((d) => d.code === getLocale(value));
      return buildSecondaryButton(
        locale?.nativeName || locale?.name || value,
        `${COMMAND} lang`,
        buildLocaleFlag(locale)
      );
    }
    if (type === 'share') {
      return buildSecondaryButton(
        `${Math.round(Number(value) * 100)}%`,
        cmd(`?{${tr('settings.absentShare.label')}|${Math.round(Number(value) * 100)}%}`)
      );
    }
    const shown = String(value) === '' ? tr('menu.blank') : String(value);
    return buildSecondaryButton(shown, cmd(`?{${tr(`settings.${key}.label`)}|${value}}`));
  }

  /**
   * Shows the settings card.
   *
   * @param {string|null} playerId GM to whisper.
   * @returns {void}
   */
  function showSettings(playerId) {
    const { tr } = helpers();
    const config = getConfig();
    const groups = [
      ['menu.groupXp', ['language', 'payout', 'updateSheets', 'announce', 'levelNotice']],
      ['menu.groupParty', ['roster', 'absentShare', 'extraShares']],
      [
        'menu.groupKills',
        ['killMode', 'killBar', 'hpBar', 'killMarker', 'marker', 'killDeathTracker'],
      ],
      ['menu.groupSheet', ['system']],
    ];
    if (config.system === 'custom') {
      groups[3][1].push('customXp', 'customLevel', 'customNpcXp', 'customNpcCr', 'customLevels');
    }
    const lines = [];
    for (const [title, keys] of groups) {
      lines.push(buildSectionLabel(tr(title)));
      for (const key of keys) {
        lines.push(buildRow(tr(`settings.${key}.label`), settingButton(key)));
      }
    }
    lines.push(buildDivider());
    lines.push(
      `<div>${buildSecondaryButton(tr('buttons.menu'), COMMAND)}${buildSecondaryButton(tr('buttons.status'), `${COMMAND} status`)}</div>`
    );
    whisper(playerId, tr('titles.settings'), lines);
  }

  /**
   * Shows the status card: sandbox, sheet profiles in use and aliases.
   *
   * @param {string|null} playerId GM to whisper.
   * @param {string[]} aliases Command aliases in use.
   * @returns {void}
   */
  function showStatus(playerId, aliases) {
    const { tr } = helpers();
    const profiles = new Map();
    for (const c of findObjs({ _type: 'character' })) {
      const p = getProfile(c);
      profiles.set(p.id, (profiles.get(p.id) || 0) + 1);
    }
    const lines = [
      buildRow(tr('status.version'), `${SCRIPT_VERSION}`),
      buildRow(tr('status.sandbox'), escapeForChat(getSandboxVersion() || '?')),
      buildRow(
        tr('status.beacon'),
        escapeForChat(canUseBeacon() ? tr('options.yesNo.yes') : tr('options.yesNo.no'))
      ),
      buildRow(tr('status.commands'), escapeForChat([COMMAND, ...aliases].join(' '))),
      buildSectionLabel(tr('status.profiles')),
    ];
    for (const [id, count] of profiles) {
      const p = getProfileById(id);
      lines.push(buildRow(p?.label || id, escapeForChat(tr('status.characters', { count }))));
    }
    lines.push(
      buildNote(
        escapeForChat(tr('status.handouts', { help: HANDOUT_HELP_NAME, deck: HANDOUT_DECK_NAME }))
      )
    );
    whisper(playerId, tr('titles.status'), lines);
  }

  /**
   * Shows the language picker.
   *
   * @param {string|null} playerId GM to whisper.
   * @returns {void}
   */
  function showLanguages(playerId) {
    const { tr } = helpers();
    const buttons = LOCALE_DEFINITIONS.map((d) =>
      buildSecondaryButton(
        d.nativeName || d.name,
        `${COMMAND} set language ${d.code} --settings`,
        buildLocaleFlag(d)
      )
    );
    whisper(playerId, tr('titles.language'), `<div>${buttons.join('')}</div>`);
  }

  // Chat command parsing and handling.

  /**
   * Returns the command words this game answers to.
   *
   * @returns {string[]} Commands, the main one first.
   */
  function activeCommands() {
    const list = [COMMAND, LONG_COMMAND, ...getState().aliases];
    if (shortAliasAllowed()) {
      list.push(SHORT_ALIAS);
    }
    return [...new Set(list.map((c) => c.toLowerCase()))];
  }

  /**
   * Returns true when !xp can be used: no other XP mod that answers to it is installed.
   *
   * @returns {boolean} True when !xp is free.
   */
  function shortAliasAllowed() {
    return CONFLICTING_GLOBALS.every((name) => typeof globalThis[name] === 'undefined');
  }

  /**
   * Splits a command line into words, keeping "quoted text" together.
   *
   * @param {string} text Command text.
   * @returns {string[]} Words.
   */
  function tokenize(text) {
    const words = [];
    const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      words.push(m[1] ?? m[2] ?? m[3]);
    }
    return words;
  }

  /**
   * Pulls --flags out of a word list.
   *
   * @param {string[]} words Words.
   * @returns {{args: string[], flags: Record<string, string|true>}} Arguments and flags.
   */
  function parseFlags(words) {
    const args = [];
    const flags = {};
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      if (/^--[a-z]/i.test(w)) {
        const key = w.slice(2).toLowerCase();
        const next = words[i + 1];
        if (['ids', 'xp'].includes(key) && next !== undefined && !next.startsWith('--')) {
          flags[key] = next;
          i++;
        } else {
          flags[key] = true;
        }
      } else {
        args.push(w);
      }
    }
    return { args, flags };
  }

  /**
   * Works out the characters a command is for: --ids (character or token IDs), else
   * the selected tokens.
   *
   * @param {object} msg Chat message.
   * @param {object} flags Flags.
   * @returns {object[]} Roll20 characters.
   */
  function targetCharacters(msg, flags) {
    const ids = typeof flags.ids === 'string' ? splitList(flags.ids) : [];
    const found = new Map();
    const addFromToken = (token) => {
      const c = token && getObj('character', toText(token.get('represents')));
      if (c) found.set(c.id, c);
    };
    if (ids.length > 0) {
      for (const id of ids) {
        const c = getObj('character', id);
        if (c) found.set(c.id, c);
        else addFromToken(getObj('graphic', id));
      }
    } else {
      for (const sel of msg.selected || []) {
        addFromToken(getObj('graphic', sel._id));
      }
    }
    return [...found.values()];
  }

  /**
   * Returns the selected tokens (or --ids tokens).
   *
   * @param {object} msg Chat message.
   * @param {object} flags Flags.
   * @returns {object[]} Roll20 graphics.
   */
  function targetTokens(msg, flags) {
    const ids =
      typeof flags.ids === 'string' ? splitList(flags.ids) : (msg.selected || []).map((s) => s._id);
    return ids.map((id) => getObj('graphic', id)).filter(Boolean);
  }

  /**
   * Re-shows the card a button came from.
   *
   * @param {string} who GM to whisper.
   * @param {object} flags Flags.
   * @returns {void}
   */
  function reshow(who, flags) {
    if (flags.menu) showMainMenu(who);
    if (flags.roster) showRoster(who);
    if (flags.settings) showSettings(who);
  }

  /**
   * Validates a setting value. Returns undefined when it cannot be used.
   *
   * @param {string} key Setting name.
   * @param {*} value Value (already coerced to the setting's type).
   * @returns {*} Value to store, or undefined.
   */
  function validateSetting(key, value) {
    const type = SETTING_TYPES[key];
    if (value === undefined || value === null) return undefined;
    if (type === 'locale') return normalizeLocale(value) || undefined;
    if (type === 'boolean') return typeof value === 'boolean' ? value : undefined;
    if (Array.isArray(type)) {
      const match = type.find((v) => String(v).toLowerCase() === String(value).toLowerCase());
      return match === undefined ? undefined : match;
    }
    if (type === 'system') return systemIds().includes(String(value)) ? String(value) : undefined;
    if (type === 'share') {
      const n = Number(value);
      return Number.isFinite(n) && n >= 0 && n <= 1 ? n : undefined;
    }
    if (type === 'count') {
      const n = Number(value);
      return Number.isInteger(n) && n >= 0 && n <= MAX_EXTRA_SHARES ? n : undefined;
    }
    if (type === 'marker') return resolveMarker(value);
    if (type === 'levels') {
      const text = toText(value);
      return text === '' || parseLevelTable(text) ? text : undefined;
    }
    if (type === 'field') {
      const text = toText(value);
      return /^[\w\-.,\s]{0,120}$/.test(text) ? splitList(text).join(',') : undefined;
    }
    return value;
  }

  /**
   * Turns a marker name or tag into the tag Roll20 stores (custom markers are "Name::id").
   *
   * @param {*} raw Marker name or tag.
   * @returns {string|undefined} Tag, or undefined when unknown.
   */
  function resolveMarker(raw) {
    const text = toText(raw).replace(/^status_/, '');
    if (!text) return undefined;
    if (BUILTIN_MARKERS.includes(text.toLowerCase())) return text.toLowerCase();
    let custom = [];
    try {
      custom = JSON.parse(
        Campaign().get('_token_markers') || Campaign().get('token_markers') || '[]'
      );
    } catch {
      custom = [];
    }
    const lower = text.toLowerCase();
    const found = custom.find(
      (m) =>
        toText(m.tag) === text ||
        toText(m.name).toLowerCase() === lower ||
        toText(m.tag).split('::')[0].toLowerCase() === lower
    );
    return found ? toText(found.tag) : undefined;
  }

  /**
   * Handles `set <setting> <value>`.
   *
   * @param {string} who GM.
   * @param {string[]} args Arguments.
   * @returns {boolean} True when a setting changed.
   */
  function handleSet(who, args) {
    const lang = getConfig().language;
    const key = Object.keys(DEFAULT_CONFIG).find(
      (k) => k.toLowerCase() === toText(args[0]).toLowerCase()
    );
    if (!key) {
      whisperError(
        who,
        t('errors.unknownSetting', lang, { name: toText(args[0]) }),
        t('errors.settingsHint', lang)
      );
      return false;
    }
    const raw = args.slice(1).join(' ');
    const value = validateSetting(key, coerceSetting(key, raw));
    if (value === undefined) {
      whisperError(
        who,
        t('errors.badValue', lang, { name: key, value: raw }),
        t(`settings.${key}.desc`, lang)
      );
      return false;
    }
    getConfig()[key] = value;
    if (key === 'language') {
      installHandouts();
    }
    return true;
  }

  /**
   * Shows each party member's sheet XP and level.
   *
   * @param {string} who GM.
   * @returns {Promise<void>}
   */
  async function showXp(who) {
    const lang = getConfig().language;
    const lines = [];
    const roster = getRoster();
    if (roster.length === 0) {
      lines.push(buildNote(escapeForChat(t('menu.noParty', lang))));
    }
    for (const c of roster) {
      const p = await readProgress(c);
      const level = p.level ?? levelForXp(p.profile.levels, p.xp ?? 0);
      const next = level ? xpForNextLevel(p.profile.levels, level) : null;
      const parts = [
        p.xp === null ? t('show.noXp', lang) : `${formatNumber(p.xp)} XP`,
        level ? t('menu.levelTag', lang, { level }) : '',
        next ? t('show.next', lang, { xp: formatNumber(next) }) : '',
      ].filter(Boolean);
      lines.push(buildRow(c.get('name'), escapeForChat(parts.join(' • '))));
    }
    whisper(who, t('titles.partyXp', lang), lines);
  }

  /**
   * Shows the short help card.
   *
   * @param {string} who GM.
   * @returns {void}
   */
  function showHelp(who) {
    const lang = getConfig().language;
    const rows = [
      ['', 'menu'],
      ['add <xp> [reason]', 'add'],
      ['bonus <xp> [--ids]', 'bonus'],
      ['give <xp> [--ids]', 'give'],
      ['kill [--xp n]', 'kill'],
      ['absent | present [--ids]', 'absent'],
      ['end', 'end'],
      ['undo', 'undo'],
      ['show', 'show'],
      ['roster', 'roster'],
      ['party add | remove', 'party'],
      ['settings', 'settings'],
      ['set <setting> <value>', 'set'],
      ['status', 'status'],
      ['help', 'help'],
    ].map(([cmd, key]) =>
      buildRow(`${COMMAND} ${cmd}`.trim(), escapeForChat(t(`help.${key}`, lang)))
    );
    rows.push(
      buildNote(
        escapeForChat(
          t('help.handouts', lang, { help: HANDOUT_HELP_NAME, deck: HANDOUT_DECK_NAME })
        )
      )
    );
    whisper(who, t('titles.help', lang), rows);
  }

  /**
   * Handles a chat message.
   *
   * @param {object} msg Roll20 chat message.
   * @returns {void}
   */
  function handleInput(msg) {
    if (msg.type !== 'api') return;
    const words = tokenize(toText(msg.content));
    const head = toText(words.shift()).toLowerCase();
    if (!activeCommands().includes(head)) return;
    const fromApi = msg.playerid === API_PLAYER_ID;
    if (!fromApi && !playerIsGM(msg.playerid)) {
      whisperError(msg.playerid, t('errors.gmOnly', getConfig().language));
      return;
    }
    const who = fromApi ? null : msg.playerid;
    void run(msg, who, words).catch((err) => {
      log(`LazyExperience ERROR: ${err?.stack || err}`);
      whisperError(
        who,
        t('errors.failed', getConfig().language, { message: err?.message || String(err) })
      );
    });
  }

  /**
   * Runs a subcommand.
   *
   * @param {object} msg Chat message.
   * @param {string|null} who GM to answer.
   * @param {string[]} words Words after the command.
   * @returns {Promise<void>}
   */
  async function run(msg, who, words) {
    const config = getConfig();
    const lang = config.language;
    const { args, flags } = parseFlags(words);
    const sub = toText(args.shift()).toLowerCase();

    switch (sub) {
      case '':
      case 'menu':
        showMainMenu(who);
        return;
      case 'help':
        showHelp(who);
        return;
      case 'config':
      case 'settings':
        showSettings(who);
        return;
      case 'status':
        showStatus(who, activeCommands().slice(1));
        return;
      case 'lang':
      case 'language':
        if (args[0]) {
          if (handleSet(who, ['language', args[0]])) showSettings(who);
        } else {
          showLanguages(who);
        }
        return;
      case 'set':
        if (handleSet(who, args)) {
          if (!flags.settings)
            whisper(
              who,
              t('titles.settings', getConfig().language),
              escapeForChat(t('messages.saved', getConfig().language))
            );
          reshow(who, flags);
        }
        return;
      case 'roster':
      case 'refresh':
      case 'refreshcharacters':
        showRoster(who);
        return;
      case 'show':
        await showXp(who);
        return;
      case 'journal':
        installHandouts();
        whisper(who, t('titles.help', lang), escapeForChat(t('messages.handouts', lang)));
        return;
      case 'log': {
        const handout = findObjs({ _type: 'handout', name: HANDOUT_LOG_NAME })[0];
        whisper(
          who,
          t('titles.log', lang),
          handout
            ? `<a href="http://journal.roll20.net/handout/${handout.id}">${escapeForChat(HANDOUT_LOG_NAME)}</a>`
            : escapeForChat(t('messages.noLog', lang))
        );
        return;
      }
      case 'add': {
        // 0.1.x: "add session <xp>" and "add <characterid> <xp>".
        if (toText(args[0]).toLowerCase() === 'session') args.shift();
        const maybeChar = getObj('character', toText(args[0]));
        if (maybeChar) {
          args.shift();
          const xp = validXp(parseStrictInt(args.shift()), true);
          if (xp === null) return whisperError(who, t('errors.badXp', lang));
          await addBonus([maybeChar.id], xp, args.join(' '));
          if (config.payout === 'end')
            whisper(
              who,
              t('titles.bonus', lang),
              escapeForChat(
                t('messages.bonusAdded', lang, {
                  xp: formatNumber(xp),
                  names: maybeChar.get('name'),
                })
              )
            );
          reshow(who, flags);
          return;
        }
        const xp = validXp(parseStrictInt(args.shift()), true);
        if (xp === null) return whisperError(who, t('errors.badXp', lang));
        await addToPool(xp, args.join(' ').trim());
        if (config.payout === 'end' && !flags.menu)
          whisper(
            who,
            t('titles.pool', lang),
            escapeForChat(t('messages.poolAdded', lang, { xp: formatNumber(xp) }))
          );
        reshow(who, flags);
        return;
      }
      case 'bonus': {
        const xp = validXp(parseStrictInt(args.shift()), true);
        if (xp === null) return whisperError(who, t('errors.badXp', lang));
        const chars = targetCharacters(msg, flags);
        if (chars.length === 0) return whisperError(who, t('errors.noCharacters', lang));
        await addBonus(
          chars.map((c) => c.id),
          xp,
          args.join(' ').trim()
        );
        if (config.payout === 'end' && !flags.menu)
          whisper(
            who,
            t('titles.bonus', lang),
            escapeForChat(
              t('messages.bonusAdded', lang, {
                xp: formatNumber(xp),
                names: chars.map((c) => c.get('name')).join(', '),
              })
            )
          );
        reshow(who, flags);
        return;
      }
      case 'give': {
        const xp = validXp(parseStrictInt(args.shift()), true);
        if (xp === null) return whisperError(who, t('errors.badXp', lang));
        const chars = targetCharacters(msg, flags);
        if (chars.length === 0) return whisperError(who, t('errors.noCharacters', lang));
        const reason = args.join(' ').trim();
        const results = await pay(chars.map((c) => ({ id: c.id, xp })));
        const names = results.map((r) => escapeForChat(r.name)).join(', ');
        const lines = [
          `<div>${t('instant.bonus', lang, { names: `<strong>${names}</strong>`, xp: formatNumber(xp) })}</div>`,
        ];
        if (reason) lines.push(buildNote(escapeForChat(reason)));
        announce(
          config.announce,
          chars.flatMap((c) => controllingPlayers(c)),
          t('titles.xpAwarded', lang),
          lines
        );
        reshow(who, flags);
        return;
      }
      case 'absent':
      case 'present': {
        const chars = targetCharacters(msg, flags);
        if (chars.length === 0) return whisperError(who, t('errors.noCharacters', lang));
        setAbsent(
          chars.map((c) => c.id),
          sub === 'absent'
        );
        if (!flags.menu && !flags.roster)
          whisper(
            who,
            t('titles.roster', lang),
            escapeForChat(
              t(`messages.${sub}`, lang, { names: chars.map((c) => c.get('name')).join(', ') })
            )
          );
        reshow(who, flags);
        return;
      }
      case 'share': {
        const share =
          Number(toText(args[0]).replace('%', '')) / (toText(args[0]).endsWith('%') ? 100 : 1);
        if (!Number.isFinite(share) || share < 0 || share > 10)
          return whisperError(who, t('errors.badShare', lang));
        const chars = targetCharacters(msg, flags);
        if (chars.length === 0) return whisperError(who, t('errors.noCharacters', lang));
        for (const c of chars) getCharacterRecord(c.id).share = share;
        reshow(who, flags.roster || flags.menu ? flags : { roster: true });
        return;
      }
      case 'exclude':
      case 'include': {
        const chars = targetCharacters(msg, flags);
        if (chars.length === 0) return whisperError(who, t('errors.noCharacters', lang));
        for (const c of chars) {
          const rec = getCharacterRecord(c.id);
          rec.excluded = sub === 'exclude';
          if (sub === 'include' && config.roster === 'manual') rec.member = true;
        }
        reshow(who, flags.roster || flags.menu ? flags : { roster: true });
        return;
      }
      case 'party':
        await handleParty(msg, who, args, flags);
        return;
      case 'kill':
        await handleKill(msg, who, args, flags);
        return;
      case 'undo': {
        const award = undoLast();
        whisper(
          who,
          t('titles.undo', lang),
          escapeForChat(
            award
              ? t('messages.undone', lang, {
                  xp: formatNumber(award.xp),
                  reason: award.reason || t(`awardKinds.${award.kind}`, lang),
                })
              : t(
                  config.payout === 'instant'
                    ? 'messages.nothingToUndoInstant'
                    : 'messages.nothingToUndo',
                  lang
                )
          )
        );
        reshow(who, flags);
        return;
      }
      case 'end': {
        if (toText(args[0]).toLowerCase() === 'no') return;
        await endSession();
        return;
      }
      case 'resetxp':
        resetSession();
        whisper(who, t('titles.pool', lang), escapeForChat(t('messages.sessionReset', lang)));
        reshow(who, flags.menu ? flags : { menu: true });
        return;
      case 'reset': {
        const what = toText(args[0]).toLowerCase();
        if (what === 'session') {
          resetSession();
          whisper(who, t('titles.pool', lang), escapeForChat(t('messages.sessionReset', lang)));
          return;
        }
        // 0.1.x "reset" reset the configuration.
        getState().config = { ...DEFAULT_CONFIG, language: config.language };
        installHandouts();
        showSettings(who);
        return;
      }
      default:
        whisperError(
          who,
          t('errors.unknownCommand', lang, { name: sub }),
          t('errors.helpHint', lang, { command: COMMAND })
        );
    }
  }

  /**
   * Handles `party add|remove`, which ticks Roll20's own Party Member box.
   *
   * @param {object} msg Chat message.
   * @param {string|null} who GM.
   * @param {string[]} args Arguments.
   * @param {object} flags Flags.
   * @returns {Promise<void>}
   */
  async function handleParty(msg, who, args, flags) {
    const lang = getConfig().language;
    const action = toText(args[0]).toLowerCase();
    if (!['add', 'remove'].includes(action)) {
      showRoster(who);
      return;
    }
    const chars = targetCharacters(msg, flags);
    if (chars.length === 0) return whisperError(who, t('errors.noCharacters', lang));
    for (const c of chars) {
      c.set('inParty', action === 'add');
      const rec = getCharacterRecord(c.id);
      rec.member = action === 'add';
      if (action === 'add') rec.excluded = false;
    }
    if (!isJumpgate()) whisperWarning(who, t('warnings.partyLegacy', lang));
    if (!flags.roster)
      whisper(
        who,
        t('titles.roster', lang),
        escapeForChat(
          t(`messages.party.${action}`, lang, { names: chars.map((c) => c.get('name')).join(', ') })
        )
      );
    reshow(who, flags);
  }

  /**
   * Handles `kill`, `kill confirm <token> [xp]` and `kill ignore <token>`.
   *
   * @param {object} msg Chat message.
   * @param {string|null} who GM.
   * @param {string[]} args Arguments.
   * @param {object} flags Flags.
   * @returns {Promise<void>}
   */
  async function handleKill(msg, who, args, flags) {
    const config = getConfig();
    const lang = config.language;
    const action = toText(args[0]).toLowerCase();
    if (action === 'confirm') {
      const xp = args[2] === undefined ? undefined : parseStrictInt(args[2]);
      if (args[2] !== undefined && !(xp > 0)) return whisperError(who, t('errors.badXp', lang));
      if (confirmKill(toText(args[1]), xp ?? undefined)) {
        const kill = getSession().kills[toText(args[1])];
        whisper(
          who,
          t('titles.defeated', lang),
          escapeForChat(
            t('messages.killAdded', lang, { name: kill.name, xp: formatNumber(kill.xp) })
          )
        );
      } else {
        whisperWarning(who, t('messages.killGone', lang));
      }
      return;
    }
    if (action === 'ignore') {
      ignoreKill(toText(args[1]));
      return;
    }
    const tokens = targetTokens(msg, flags);
    if (tokens.length === 0) return whisperError(who, t('errors.noTokens', lang));
    const xp = flags.xp === undefined ? null : parseStrictInt(flags.xp);
    if (flags.xp !== undefined && !(xp > 0)) return whisperError(who, t('errors.badXp', lang));
    const outcomes = [];
    for (const token of tokens) {
      const result = await noticeDefeat(token, { xp, manual: true });
      outcomes.push(
        `${escapeForChat(toText(token.get('name')) || '?')}: ${escapeForChat(t(`kills.result.${result}`, lang))}`
      );
    }
    whisper(who, t('titles.defeated', lang), outcomes.map((o) => `<div>${o}</div>`).join(''));
    reshow(who, flags);
  }

  let ready = false;

  /**
   * Wraps an event handler so an error is logged instead of stopping the sandbox.
   *
   * @param {string} label Handler name for the log.
   * @param {Function} fn Handler.
   * @returns {Function} Wrapped handler.
   */
  function guarded(label, fn) {
    return (...args) => {
      if (!ready) return;
      try {
        fn(...args);
      } catch (err) {
        log(`${SCRIPT_NAME} ERROR in ${label}: ${err?.message || err}`);
        if (err?.stack) log(err.stack);
      }
    };
  }

  /**
   * Registers with TokenMod and DeathTracker when they are installed. Changes made by
   * other Mods raise no Roll20 events.
   *
   * @returns {string[]} Names of the Mods observed.
   */
  function observeOtherMods() {
    const observed = [];
    if (typeof TokenMod !== 'undefined' && typeof TokenMod?.ObserveTokenChange === 'function') {
      TokenMod.ObserveTokenChange(guarded('TokenMod observer', handleTokenChange));
      observed.push('TokenMod');
    }
    const dt = typeof DeathTracker !== 'undefined' ? DeathTracker : globalThis.DeathTracker;
    if (dt && typeof dt.onStatusChange === 'function') {
      // DeathTracker 1.0 reports deaths itself, so its token observer is not needed too.
      dt.onStatusChange(guarded('DeathTracker status', handleDeathTrackerStatus));
      observed.push('DeathTracker');
    } else if (dt && typeof dt.ObserveTokenChange === 'function') {
      dt.ObserveTokenChange(guarded('DeathTracker observer', handleTokenChange));
      observed.push('DeathTracker');
    }
    return observed;
  }

  /**
   * Resolves a character from an object or ID.
   *
   * @param {object|string} characterOrId Character or ID.
   * @returns {object|undefined} Character.
   */
  function toCharacter(characterOrId) {
    return typeof characterOrId === 'string' ? getObj('character', characterOrId) : characterOrId;
  }

  /**
   * Publishes the API other Mods can call. 0.1.x's CheckInstall and RegisterEventHandlers
   * stay, as no-ops, for scripts that still call them.
   *
   * @returns {void}
   */
  function publishApi() {
    globalThis.LazyExperience = Object.freeze({
      version: SCRIPT_VERSION,
      /** Adds XP to the session pool (or pays it now in instant mode). */
      addToPool: (xp, reason = '') =>
        ready ? addToPool(Number(xp), reason, { source: 'api' }) : Promise.resolve(null),
      /** Gives bonus XP to a character on top of its share. */
      award: (characterOrId, xp, reason = '') => {
        const c = toCharacter(characterOrId);
        return ready && c ? addBonus([c.id], Number(xp), reason) : Promise.resolve(null);
      },
      /** Pays XP to a character now, whatever the payout setting. */
      give: (characterOrId, xp) => {
        const c = toCharacter(characterOrId);
        return ready && c ? pay([{ id: c.id, xp: Number(xp) }]) : Promise.resolve([]);
      },
      /** Records a defeated creature token, as if its HP had dropped to 0. */
      recordKill: (tokenOrId, xp = null) => {
        const token = typeof tokenOrId === 'string' ? getObj('graphic', tokenOrId) : tokenOrId;
        return ready && token ? noticeDefeat(token, { xp }) : Promise.resolve('notCreature');
      },
      /** Adds a recorded defeat to the pool (the prompt's Add button). */
      confirmKill: (tokenId, xp) => (ready ? confirmKill(tokenId, xp) : false),
      /** Returns a copy of the current session. */
      getSession: () => JSON.parse(JSON.stringify(getSession())),
      /** Returns the game-system profile used for a character. */
      getSystem: (characterOrId) => {
        const c = toCharacter(characterOrId);
        return c ? getProfile(c).id : null;
      },
      /** Calls fn({kind, xp, reason, targets}) after each award. */
      onAward,
      /** Calls fn({character, level}) after each level-up notice. */
      onLevelUp,
      CheckInstall: () => {},
      RegisterEventHandlers: () => {},
    });
  }

  /**
   * Startup: migrate state, apply One-Click options, install handouts and greet the GM.
   *
   * @returns {void}
   */
  function checkInstall() {
    const migratedFrom = initialiseState();
    applyGlobalConfig(validateSetting);
    installHandouts();
    const observed = observeOtherMods();
    onSessionEnd(logSession);
    publishApi();
    ready = true;

    const sandbox = getSandboxVersion();
    log(
      `-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} [Updated: ${SCRIPT_LAST_UPDATED}] (${isJumpgate() ? 'Jumpgate' : 'Legacy'}, sandbox ${sandbox || '?'}) <=-`
    );
    if (observed.length > 0) log(`${SCRIPT_NAME}: observing ${observed.join(', ')}`);

    const lang = getConfig().language;
    const lines = [`<div><strong>${escapeForChat(t('titles.ready', lang))}</strong></div>`];
    lines.push(
      buildNote(
        escapeForChat(t('messages.commands', lang, { commands: activeCommands().join(' ') }))
      )
    );
    if (!shortAliasAllowed()) {
      const other = CONFLICTING_GLOBALS.filter((n) => typeof globalThis[n] !== 'undefined')
        .map((n) => (n === 'EASYEXPERIENCE' ? 'EasyExperience' : 'ExperienceTracker'))
        .join(', ');
      lines.push(
        buildNote(
          escapeForChat(t('messages.aliasTaken', lang, { alias: SHORT_ALIAS, mods: other }))
        )
      );
    }
    if (migratedFrom) {
      lines.push(
        `<div style="margin-top:3px">${escapeForChat(t('messages.migrated', lang))}</div>`
      );
    }
    whisper(null, `${SCRIPT_NAME} v${SCRIPT_VERSION}`, lines);

    const beaconChars = findObjs({ _type: 'character' }).filter(
      (c) => getProfile(c).access === 'beacon'
    );
    if (beaconChars.length > 0 && !canUseBeacon() && !getState().warned.sandbox) {
      getState().warned.sandbox = true;
      whisperWarning(null, t('warnings.sandbox', lang));
    }
    if (migratedFrom) showMainMenu(null);
  }

  /**
   * Registers the Roll20 event handlers.
   *
   * @returns {void}
   */
  function registerEventHandlers() {
    on('ready', () => {
      try {
        checkInstall();
      } catch (err) {
        log(`${SCRIPT_NAME} ERROR during startup: ${err?.message || err}`);
        if (err?.stack) log(err.stack);
      }
    });
    on('chat:message', guarded('chat:message', handleInput));
    on('change:graphic', guarded('change:graphic', handleTokenChange));
    on('change:attribute', guarded('change:attribute', handleAttributeChange));
  }

  registerEventHandlers();
})();
