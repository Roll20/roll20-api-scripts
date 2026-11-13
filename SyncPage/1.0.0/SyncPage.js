/**
 * NOTE: GENERATED FILE - DO NOT EDIT DIRECTLY.
 * NOTE: Source files live under src/ and are bundled with `npm run build`.
 * ------------------------------------------------
 * Name: SyncPage
 * Script: SyncPage.js
 * Version: 1.0.0
 * Built: 2026-11-10T00:57:50.117Z
 */
const SyncPageMod = (() => {
  'use strict';

  // Build-time placeholders replaced by rollup.config.js inject-build-metadata plugin.
  const SCRIPT_NAME = 'SyncPage';
  const SCRIPT_VERSION = '1.0.0';
  const SCRIPT_LAST_UPDATED = '2026-11-10T00:57:50.117Z';

  const DEFAULT_LOCALE$1 = 'en-US';

  const STATE_KEY = 'SyncPage';
  // Where 0.1.x kept its settings and links. Read once to carry them over, then
  // left alone so going back to 0.1.9 still finds them.
  const LEGACY_STATE_KEY = 'SYNCPAGE';
  const SCHEMA_VERSION = 1;

  // Commands are matched without regard to case. `!sync` was 0.1.x's command.
  const COMMAND = '!syncpage';
  const COMMAND_ALIASES = ['!syncpage', '!sync-page', '!sync'];

  const HANDOUT_HELP_NAME = 'SyncPage - Help';
  // The deck's name is not translated, so it always matches the handout's name.
  const DECK_TITLE = 'Command Deck';
  const HANDOUT_DECK_NAME = `SyncPage - ${DECK_TITLE}`;
  // Journal icon (the handouts' avatar): the plain SyncPage icon in Roll20's
  // file store. Roll20 keeps it as `.../max.webp?<number>`, so an icon is matched
  // on its image path. Only the webp files exist (thumb.png is a 404).
  const HANDOUT_ICON_PATH = '/images/506991624/5G6swsn3lbW42tzyylIiPg/';
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

  // Object types SyncPage mirrors. Jumpgate lights are graphics, so they need no
  // type of their own; fog masks are not API objects and stay per page.
  const SYNC_TYPES = ['graphic', 'text', 'path', 'pathv2', 'door', 'window'];
  const LAYERS = ['map', 'objects', 'gmlayer', 'foreground', 'walls'];
  const HIDDEN_LAYER = 'gmlayer';

  // Keys never copied or compared, whatever the type.
  const NEVER_SYNC_KEYS = ['pageid', 'id', 'type'];
  // Keys left out when matching objects or looking for drift. Roll20's Duplicate
  // Page gives drawings to the GM and recolours doors and windows.
  const IGNORE_FOR_MATCH = {
    graphic: [],
    text: ['controlledby'],
    path: ['controlledby'],
    pathv2: ['controlledby'],
    door: ['color'],
    window: ['color'],
  };

  // Groups of token properties a GM can keep per page (setting localProps).
  // Entries ending in * match every key with that start.
  const PROP_SETS = Object.freeze({
    gmnotes: ['gmnotes'],
    name: [
      'name',
      'showname',
      'showplayers_name',
      'playersedit_name',
      'tooltip',
      'show_tooltip',
      'gm_only_tooltip',
    ],
    bars: [
      'bar1_*',
      'bar2_*',
      'bar3_*',
      'bar4_*',
      'showplayers_bar*',
      'playersedit_bar*',
      'bar_location',
      'compact_bar',
    ],
    markers: ['statusmarkers'],
    tint: ['tint_color'],
    aura: ['aura1_*', 'aura2_*', 'showplayers_aura*', 'playersedit_aura*'],
    vision: [
      'light_hassight',
      'has_bright_light_vision',
      'has_night_vision',
      'night_vision_*',
      'has_limit_field_of_vision',
      'limit_field_of_vision_*',
      'has_limit_field_of_night_vision',
      'limit_field_of_night_vision_*',
      'adv_fow_view_distance',
      'light_sensitivity_multiplier',
      'light_losangle',
    ],
    light: [
      'light_radius',
      'light_dimradius',
      'light_otherplayers',
      'light_angle',
      'light_multiplier',
      'emits_*',
      'bright_light_distance',
      'low_light_distance',
      'has_directional_*',
      'directional_*',
      'dim_light_opacity',
      'lightColor',
    ],
    controlledby: ['controlledby'],
  });

  // Groups of page settings a GM can keep per page (setting localPageSettings).
  const PAGE_SETS = Object.freeze({
    lighting: [
      'dynamic_lighting_enabled',
      'showlighting',
      'showdarkness',
      'lightenforcelos',
      'lightrestrictmove',
      'lightglobalillum',
      'lightupdatedrop',
    ],
    daylight: ['daylight_mode_enabled', 'daylightModeOpacity', 'darknessEffect'],
    explorer: ['explorer_mode', 'adv_fow_enabled', 'adv_fow_dim_reveals', 'adv_fow_show_grid'],
    fog: ['fog_opacity'],
    grid: [
      'showgrid',
      'grid_type',
      'grid_opacity',
      'gridcolor',
      'gridlabels',
      'snapping_increment',
      'grid_offset_x',
      'grid_offset_y',
      'diagonaltype',
    ],
    background: ['background_color', 'useAutoWrapper', 'wrapperColor'],
    scale: ['scale_number', 'scale_units', 'width', 'height'],
    jukebox: ['jukeboxtrigger'],
  });
  // Page keys never mirrored: the name is the page's own, archiving one copy
  // must not archive the rest, and force_lighting_refresh is a one-off trigger.
  const PAGE_NEVER_SYNC = ['name', 'archived', 'force_lighting_refresh'];

  /**
   * The settings table. It drives the settings card, `set` checking, One-Click
   * user options and the Help handout. Scope `group` settings can be
   * overridden per sync group; `global` ones cannot.
   */
  const SETTINGS = Object.freeze([
    {
      key: 'deleteMode',
      type: 'choice',
      options: ['all', 'source', 'unlink', 'ask'],
      default: 'all',
      scope: 'group',
    },
    {
      key: 'hideMode',
      type: 'choice',
      options: ['gmlayer', 'remove'],
      default: 'gmlayer',
      scope: 'group',
    },
    {
      key: 'pairLeftovers',
      type: 'choice',
      options: ['ask', 'copy', 'leave'],
      default: 'ask',
      scope: 'group',
    },
    {
      key: 'newObjects',
      type: 'choice',
      options: ['mirror', 'sourceOnly'],
      default: 'mirror',
      scope: 'group',
    },
    {
      key: 'localProps',
      type: 'multi',
      options: Object.keys(PROP_SETS),
      default: [],
      scope: 'group',
    },
    {
      key: 'localPageSettings',
      type: 'multi',
      options: Object.keys(PAGE_SETS),
      default: [],
      scope: 'group',
    },
    { key: 'excludeLayers', type: 'multi', options: LAYERS, default: [], scope: 'group' },
    { key: 'syncPageSettings', type: 'boolean', default: true, scope: 'group' },
    {
      key: 'repairOnStart',
      type: 'choice',
      options: ['quiet', 'report', 'off'],
      default: 'quiet',
      scope: 'global',
    },
    {
      key: 'playerMenu',
      type: 'choice',
      options: ['gm', 'players'],
      default: 'gm',
      scope: 'global',
    },
    { key: 'recycleSize', type: 'number', min: 1, max: 100, default: 25, scope: 'global' },
    { key: 'language', type: 'locale', default: DEFAULT_LOCALE$1, scope: 'global' },
  ]);
  SETTINGS.map((s) => s.key);

  // Timings.
  // New objects are collected this long before copying, so a paste or a
  // Duplicate Page burst is handled together and property changes that follow
  // the add event have landed.
  const ADD_DEBOUNCE_MS = 250;
  // Objects handled per slice of a big job, with a pause between slices so the
  // sandbox does not time out.
  const BATCH_SIZE = 50;
  const BATCH_PAUSE_MS = 10;
  // How long a write SyncPage made is expected to come back from the client.
  // Doors and pages echo API changes about a second later.
  const ECHO_TTL_MS = 5000;
  // Buttons that carry a request ID stop working after this long.
  const REQUEST_TTL_MS = 10 * 60 * 1000;
  // Housekeeping runs at most this often (on chat activity).
  const SWEEP_EVERY_MS = 15000;

  // Colour palette for chat cards and handouts (shared with the other house Mods).
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
  const COLOR_SHOWN = '#6fcf97';
  const COLOR_HIDDEN = '#eb5757';

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
   * Makes text safe as a roll-query option or default: Roll20 splits queries
   * on `|`, `,` and `}`.
   *
   * @param {*} text Text.
   * @returns {string} Text with those characters replaced.
   */
  function queryText(text) {
    return toText(text)
      .replaceAll(/[|,}{]/g, ' ')
      .replaceAll('"', "'");
  }

  /**
   * Parses a number.
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
   * Compares two Roll20 property values. Objects (door paths) are compared by
   * their JSON.
   *
   * @param {*} a First value.
   * @param {*} b Second value.
   * @returns {boolean} True when equal.
   */
  function sameValue(a, b) {
    if (a === b) {
      return true;
    }
    if (typeof a === 'object' || typeof b === 'object') {
      return JSON.stringify(a) === JSON.stringify(b);
    }
    return false;
  }

  let idCounter = 0;

  /**
   * Makes a short ID: a prefix, the time in base 36 and a counter.
   *
   * @param {string} prefix Prefix such as `g` (group), `l` (link) or `r` (request).
   * @returns {string} ID.
   */
  function makeId(prefix) {
    idCounter = (idCounter + 1) % 1296;
    return `${prefix}${Date.now().toString(36)}${idCounter.toString(36).padStart(2, '0')}${Math.floor(
      Math.random() * 1296
    )
      .toString(36)
      .padStart(2, '0')}`;
  }

  /**
   * Returns true when a key matches a key list in which entries ending in `*`
   * match every key with that start.
   *
   * @param {string} key Property key.
   * @param {string[]} list Key list.
   * @returns {boolean} True when listed.
   */
  function keyInList(key, list) {
    return list.some((entry) =>
      entry.endsWith('*') ? key.startsWith(entry.slice(0, -1)) : key === entry
    );
  }

  /**
   * Splits chat command text into words, keeping "double quoted" phrases whole.
   *
   * @param {string} text Command text.
   * @returns {string[]} Words.
   */
  function splitWords(text) {
    const words = [];
    const re = /"([^"]*)"|(\S+)/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      words.push(m[1] !== undefined ? m[1] : m[2]);
    }
    return words;
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

  var localeAf = {
    titles: {
      ready: 'SyncPage is gereed.',
      group: 'Sinchroniseergroep: {name}',
      players: 'Spelers: {name}',
      settings: 'SyncPage-instellings',
      groupSettings: 'Instellings vir {name}',
      status: 'SyncPage-status',
      recycle: 'Herwinningsblik: {name}',
      dryRun: 'Voorskou van herstel: {name}',
      repaired: 'Herstel: {name}',
      repairedOnStart: 'SyncPage het u groepe herstel',
      help: 'SyncPage-opdragte',
      deleted: 'Op een bladsy geskrap',
      leftovers: 'Objekte sonder eweknie',
      warning: 'SyncPage',
    },
    messages: {
      readyHint: 'Tik !syncpage om die kieslys oop te maak.',
      migrated:
        'U SyncPage 0.1-opstelling is oorgedra: {groups} groep(e), {links} skakel(s) behou, {hidden} versteekte kopie(ë). Bladsye waarvan die naam op “_synced” eindig, kan nou hernoem word.',
      trueCopyGone:
        'Die ou funksie “True Copy” bestaan nie meer nie: gebruik Roll20 se eie “Dupliseer bladsy” en voeg dan die kopie by ’n groep.',
      groupCreated:
        'Groep “{name}” is van {page} gemaak, met {count} objek(te). Dupliseer die bladsy en voeg dan die kopie by met “Voeg hierdie bladsy by ’n groep”.',
      pageAdded:
        '{page} het by “{name}” aangesluit: {paired} gepaar, {copied} gekopieer, {failed} kon nie gekopieer word nie, {leftovers} sonder eweknie.',
      pageRemoved: '{page} het “{name}” verlaat. Die objekte bly, ontkoppel.',
      groupDeleted: 'Groep “{name}” is geskrap. Die objekte bly op hul bladsye.',
      notConfirmed: 'Niks is verander nie (nie bevestig nie).',
      hidden: '{count} kopie(ë) versteek. {skipped} objek(te) is nie gekoppel nie.',
      shown: '{count} kopie(ë) gewys. {skipped} objek(te) is nie gekoppel nie.',
      hideFallback:
        '{count} kopie(ë) gebruik ’n prent wat die API nie kan herskep nie. Hulle is daarom na die SL-laag geskuif in plaas daarvan om verwyder te word.',
      deletedAsk: '{name} is op {page} geskrap. Die kopieë op die ander bladsye is nog daar.',
      deletedEverywhere: '{count} ander kopie(ë) geskrap. “Ontdoen” sit hulle terug.',
      keptOthers: 'Die ander kopieë bly.',
      restored: '{count} objek(te) teruggesit. {failed} kon nie teruggesit word nie.',
      nothingToUndo: 'Daar is niks om te ontdoen nie.',
      recycleEmptied: 'Die herwinningsblik is leeg.',
      leftovers:
        '{count} objek(te) op {page} pas by niks in die groep nie. Kopieer hulle na die ander bladsye, of hou hulle net op hierdie bladsy?',
      andMore: '…en nog {count}.',
      leftoversCopied: '{count} objek(te) na die ander bladsye gekopieer.',
      leftoversKept: '{count} objek(te) net op hul eie bladsy gehou.',
      imageNotCopied:
        '{name} op {page} gebruik ’n prent wat die API nie kan kopieer nie (Marketplace-kuns). Gebruik Roll20 se “Dupliseer bladsy” om kopieë daarmee te maak en voeg dan die kopie by die groep.',
      moved: '{player} is na {page} geskuif.',
      movedAll: '{count} speler(s) na {page} geskuif. “Herstel uitleg” sit hulle terug.',
      layoutSaved: 'Onthou waar {count} speler(s) is.',
      layoutRestored: '{count} speler(s) teruggeskuif.',
      layoutReset: 'Die onthoude uitleg is uitgevee.',
      unlinked: '{count} objek(te) ontkoppel. Hulle bly net op hierdie bladsy.',
      paused:
        'Weerspieëling vir “{name}” is gepouseer. Veranderinge bly op die bladsy waar hulle gemaak word totdat u hervat.',
      resumed: 'Weerspieëling vir “{name}” is weer aan. {count} verskil(le) gevind.',
      settingsReset: 'Instellings is na hul verstekwaardes teruggestel.',
      resetMoved: 'Gebruik {command} om die verstekinstellings terug te stel.',
      handouts: 'Die uitdeelstukke Help en Command Deck is herbou.',
      pruned: 'Opgeruim: {links} leë skakel(s), {pages} ontbrekende bladsy(e).',
      startRepair:
        '{name}: {drifted} afgewyk, {recreated} herskep, {removed} verwyder, {mirrored} nuwe objek(te) gekopieer.',
    },
    errors: {
      hint: 'Tik {command} help vir die opdragte.',
      gmOnly: 'Net die spelleier kan SyncPage gebruik.',
      unknownCommand: 'Onbekende opdrag: {command}.',
      unknownSetting: 'Onbekende instelling: {key}.',
      badValue: '“{value}” is nie ’n geldige waarde vir {key} nie.',
      globalOnly: '{key} geld vir elke groep en kan nie vir een groep verander word nie.',
      noGroup: 'Geen sinchroniseergroep vir “{name}” gevind nie.',
      groupExists: 'Daar is reeds ’n groep met die naam “{name}”.',
      noName: 'Gee ’n naam.',
      pageInGroup: '{page} is reeds in die groep “{group}”.',
      pageNotInGroup: '{page} is nie in die groep “{name}” nie.',
      nothingSelected: 'Kies eers een of meer objekte.',
      noPage: 'Geen bladsy vir “{page}” gevind nie.',
      noPlayer: 'Geen speler vir “{player}” gevind nie.',
      requestExpired: 'Daardie knoppie het verval. Maak die kaart weer oop.',
      requestUnknown: 'Daardie knoppie is reeds gebruik.',
    },
    menu: {
      thisPage: 'Hierdie bladsy',
      group: 'Groep',
      source: 'bron',
      copy: 'kopie',
      paused: 'Gepouseer',
      notInGroup: 'Hierdie bladsy is nie in ’n sinchroniseergroep nie.',
      duplicateHint:
        'Wenk: maak ’n groep van u kaartbladsy, gebruik Roll20 se “Dupliseer bladsy” daarop, gaan na die kopie en voeg dit by die groep. So behou kopieë hul Marketplace-kuns.',
      selectedHint: 'Versteek en Wys werk op die gekose objekte.',
      groups: 'Groepe',
    },
    group: {
      pages: 'Bladsye (★ = bron)',
      playersCount: '{count} speler(s)',
      sourceHint: 'Die bronbladsy is die verwysing vir herstel.',
      summary: 'Opsomming',
      links: 'Gekoppelde objekte',
      hidden: 'Versteekte kopieë',
      recycle: 'In die herwinningsblik',
      overrides: 'Eie instellings',
      none: 'geen',
      lastRepair: 'Laaste herstel {when}: {drifted} afgewyk, {recreated} herskep.',
    },
    players: {
      none: 'Daar is nog geen spelers in hierdie spel nie.',
      elsewhere: 'nie in hierdie groep nie',
      visibility: 'Gekose objekte: klik om op ’n bladsy te versteek of te wys',
      selectHint:
        'Kies tokens en maak hierdie kaart weer oop om hulle bladsy vir bladsy te versteek of te wys.',
      shown: 'gewys',
      hidden: 'versteek',
      layoutSaved: '’n Uitleg van {count} speler(s) word onthou.',
      youAreOn: 'U is op {page}.',
    },
    status: {
      notLinked: 'nie gekoppel nie',
      pageOnly: 'net op hierdie bladsy gehou',
      missing: 'ontbreek',
    },
    recycle: {
      empty: 'Die herwinningsblik is leeg.',
      reasons: {
        delete: 'Geskrap',
        repair: 'Herstel',
        exclude: 'Uitgeslote laag',
        group: 'Groep verwyder',
      },
    },
    repair: {
      drifted: 'Kopieë wat afgewyk het',
      recreated: 'Ontbrekende kopieë herskep',
      removed: 'Kopieë verwyder (bron geskrap)',
      dropped: 'Leë skakels laat val',
      mirrored: 'Nuwe objekte gekopieer',
      leftovers: 'Nuwe objekte op kopieë',
      pageSettings: 'Bladsye met ander instellings',
      dryRunNote: 'Niks is nog verander nie.',
      doneNote: 'Klaar. Verwyderde objekte is in die herwinningsblik.',
    },
    age: {
      now: 'netnou',
      minutes: '{count} min gelede',
      hours: '{count} h gelede',
      days: '{count} dae gelede',
    },
    types: {
      graphic: 'Token',
      text: 'Teks',
      path: 'Tekening',
      pathv2: 'Tekening',
      door: 'Deur',
      window: 'Venster',
    },
    values: {
      on: 'Aan',
      off: 'Af',
      none: 'Geen',
    },
    queries: {
      group: 'Groep',
      groupName: 'Groepnaam',
      deleteGroup: 'Skrap die groep {name}? Objekte bly op hul bladsye.',
      resetSettings: 'Stel die verstekinstellings terug?',
      emptyRecycle: 'Maak die herwinningsblik leeg? Dit kan nie ontdoen word nie.',
      yes: 'Ja',
      no: 'Nee',
    },
    buttons: {
      menu: 'Kieslys',
      group: 'Groep',
      players: 'Spelers',
      repair: 'Herstel',
      repairNow: 'Herstel nou',
      dryRun: 'Voorskou herstel',
      pause: 'Pouseer',
      resume: 'Hervat',
      status: 'Status',
      hideHere: 'Versteek hier',
      showHere: 'Wys hier',
      hideOthers: 'Versteek elders',
      showOthers: 'Wys elders',
      createGroup: 'Maak ’n groep van hierdie bladsy',
      addToGroup: 'Voeg hierdie bladsy by ’n groep',
      removePage: 'Haal uit groep',
      makeSource: 'Maak bron',
      settings: 'Instellings',
      groupSettings: 'Groepinstellings',
      recycle: 'Herwinningsblik',
      undo: 'Ontdoen',
      help: 'Hulp',
      rename: 'Hernoem',
      deleteGroup: 'Skrap groep',
      everyoneTo: 'Almal na {page}',
      saveLayout: 'Stoor uitleg',
      restoreLayout: 'Herstel uitleg',
      useGlobal: 'Gebruik globaal',
      reset: 'Stel terug',
      restore: 'Sit terug',
      emptyRecycle: 'Maak leeg',
      deleteEverywhere: 'Skrap oral',
      keepOthers: 'Hou die ander',
      copy: 'Kopieer',
      keepHere: 'Hou hier',
      copyAll: 'Kopieer alles',
      keepAll: 'Hou alles hier',
      unlink: 'Ontkoppel',
      rebuild: 'Herbou uitdeelstukke',
    },
    settings: {
      deleteMode: 'Wanneer ’n objek geskrap word',
      hideMode: 'Hoe kopieë versteek word',
      pairLeftovers: 'Objekte sonder eweknie',
      newObjects: 'Nuwe objekte',
      localProps: 'Per bladsy gehou (tokens)',
      localPageSettings: 'Per bladsy gehou (bladsy-instellings)',
      excludeLayers: 'Lae wat nie gesinchroniseer word nie',
      syncPageSettings: 'Weerspieël bladsy-instellings',
      repairOnStart: 'Herstel by begin',
      playerMenu: 'Wie die spelerskaart mag oopmaak',
      recycleSize: 'Grootte van herwinningsblik',
      language: 'Taal',
      groupHint:
        'Hierdie instellings geld net vir hierdie groep. “Gebruik globaal” gaan terug na die hoofinstelling.',
      override: 'hierdie groep',
      global: 'globaal',
    },
    settingsHelp: {
      deleteMode:
        'Oral: skrap op enige bladsy skrap elke kopie. Net bronbladsy: net skrappings op die bronbladsy word versprei. Ontkoppel: nooit versprei nie. Vra: ’n keuse word gefluister.',
      hideMode:
        'SL-laag: die kopie skuif na die SL-laag. Verwyder: die kopie word geskrap en weer gemaak wanneer dit gewys word, sodat spelers niks kan vind nie.',
      pairLeftovers:
        'Wanneer ’n bladsy by ’n groep aansluit of herstel word: vra, kopieer hulle na die ander bladsye, of los hulle op hul bladsy.',
      newObjects:
        'Weerspieël: objekte wat op enige bladsy gemaak word, word gekopieer. Net bron: net objekte wat op die bronbladsy gemaak word, word gekopieer.',
      localProps: 'Token-eienskappe wat elke bladsy vir homself hou, soos visie vir een speler.',
      localPageSettings:
        'Bladsy-instellings wat elke bladsy vir homself hou, soos donkerte vir een groep spelers.',
      excludeLayers: 'Objekte op hierdie lae bly op hul eie bladsy.',
      syncPageSettings:
        'Kopieer bladsy-instellings (beligting, rooster, grootte…) tussen die groep se bladsye.',
      repairOnStart:
        'Wanneer die sandbox begin: herstel stil, herstel en rapporteer, of doen niks.',
      playerMenu: 'Net SL, of spelers mag vra op watter bladsy hulle is.',
      recycleSize: 'Hoeveel verwyderings elke groep vir “Ontdoen” hou.',
      language: 'Taal van kieslyste, boodskappe en uitdeelstukke.',
    },
    options: {
      deleteMode: { all: 'Oral', source: 'Net bronbladsy', unlink: 'Ontkoppel', ask: 'Vra' },
      hideMode: { gmlayer: 'SL-laag', remove: 'Verwyder' },
      pairLeftovers: { ask: 'Vra', copy: 'Kopieer', leave: 'Los' },
      newObjects: { mirror: 'Weerspieël', sourceOnly: 'Net bron' },
      localProps: {
        gmnotes: 'SL-notas',
        name: 'Naam',
        bars: 'Stawe',
        markers: 'Merkers',
        tint: 'Tint',
        aura: 'Auras',
        vision: 'Visie',
        light: 'Lig',
        controlledby: 'Beheer deur',
      },
      localPageSettings: {
        lighting: 'Beligting',
        daylight: 'Daglig',
        explorer: 'Verkennermodus',
        fog: 'Mis',
        grid: 'Rooster',
        background: 'Agtergrond',
        scale: 'Grootte en skaal',
        jukebox: 'Jukebox',
      },
      excludeLayers: {
        map: 'Kaart',
        objects: 'Tokens',
        gmlayer: 'SL',
        foreground: 'Voorgrond',
        walls: 'Mure',
      },
      repairOnStart: { quiet: 'Stil', report: 'En rapporteer', off: 'Af' },
      playerMenu: { gm: 'Net SL', players: 'Spelers ook' },
    },
    help: {
      menu: 'Maak die kieslys oop.',
      groupCreate: 'Maak ’n sinchroniseergroep van hierdie bladsy.',
      groupAdd:
        'Voeg hierdie bladsy by ’n groep: passende objekte word gepaar, ontbrekendes gekopieer.',
      groupRemove: 'Haal hierdie bladsy uit sy groep. Objekte bly, ontkoppel.',
      groupShow: 'Wys ’n groep se kaart.',
      groupRename: 'Hernoem ’n groep.',
      groupSource: 'Maak hierdie bladsy die groep se bron (die verwysing vir herstel).',
      groupDelete: 'Skrap ’n groep (vra eers). Objekte bly.',
      players:
        'Wys wie op watter bladsy is, met knoppies om hulle te skuif en om die gekose tokens per bladsy te versteek of te wys.',
      move: 'Skuif een speler na ’n bladsy (verdeel die groep).',
      moveAll: 'Skuif elke speler in die groep na een bladsy en onthou waar hulle was.',
      layout: 'Onthou of herstel op watter bladsy elke speler is.',
      hide: 'Versteek die gekose objekte se kopieë: hier, op die ander bladsye, oral, of op genoemde bladsye.',
      show: 'Wys versteekte kopieë weer.',
      status: 'Wys die gekose objekte se skakels en waar hulle versteek is.',
      unlink: 'Hou die gekose objekte net op hierdie bladsy.',
      repair: 'Bring kopieë weer in pas met die bronbladsy. --dry-run rapporteer net.',
      pause: 'Stop die weerspieëling van ’n groep vir ’n rukkie.',
      resume: 'Weerspieël weer; wys wat verskil.',
      undo: 'Sit die laaste verwydering terug.',
      recycle: 'Lys verwyderings en sit enige daarvan terug.',
      settings: 'Wys die instellings, globaal of vir een groep.',
      set: 'Verander ’n instelling. Lyste neem +name of -name.',
      settingsReset: 'Stel die verstekinstellings terug (vra eers).',
      handouts: 'Herbou die uitdeelstukke Help en Command Deck.',
      help: 'Wys hierdie lys.',
      ids: 'Werk op hierdie objekte in plaas van die gekose objekte.',
      page: 'Werk op hierdie bladsy in plaas van die een wat u bekyk.',
      footer: 'Die uitdeelstuk {help} verduidelik alles; {deck} het knoppies.',
    },
    deck: {
      menuTitle: 'Kieslys',
      menuDesc: 'Die hoofkieslys, spelers en instellings.',
      groupsTitle: 'Groepe',
      groupsDesc: 'Maak ’n groep van die bladsy waarop u is, of voeg hierdie bladsy by ’n groep.',
      selectedTitle: 'Gekose objekte',
      selectedDesc: 'Versteek of wys die gekose objekte se kopieë.',
      toolsTitle: 'Gereedskap',
      toolsDesc: 'Herstel, ontdoen, pouseer en uitdeelstukke.',
      footer: 'Sien {help} vir hoe SyncPage werk.',
    },
    handout: {
      versionLabel: 'Weergawe',
      subtitle: 'Gekoppelde bladsye vir verdeelde groepe',
      footer: 'Maak {deck} oop vir knoppies.',
      overview: {
        heading: 'Oorsig',
        body: 'SyncPage hou bladsye in pas. Bladsye in ’n sinchroniseergroep deel hul tokens, tekeninge, mure, deure, vensters, teks en bladsy-instellings: wat ook al op een bladsy verander, verander op die ander. Met Roll20 se groepverdeling (split party) plaas u spelers op verskillende kopieë en versteek of wys dan dinge per kopie, sodat elke speler net sien wat sy karakter behoort te sien.',
        why: 'Roll20 kan nie ’n objek op een bladsy vir net sommige spelers versteek nie. Dinamiese beligting gee elke token sy eie visie, maar nie “hierdie NPC is net vir die skelm onsigbaar” nie. Weerspieëlde bladsye doen dit.',
      },
      quickStart: {
        heading: 'Vinnige begin',
        steps: [
          'Gaan na u kaartbladsy en tik !syncpage, klik dan op “Maak ’n groep van hierdie bladsy”.',
          'Gebruik Roll20 se “Dupliseer bladsy” op daardie bladsy (die bladsykaart se kieslys). Dit kopieer Marketplace-kuns, wat die API nie kan nie.',
          'Gaan na die kopie en klik op “Voeg hierdie bladsy by ’n groep”. SyncPage paar die objekte wat ooreenstem en kopieer enigiets wat ontbreek.',
          'Maak Spelers oop om spelers na die kopie te skuif, kies dan tokens en versteek hulle op een bladsy.',
        ],
      },
      mirroring: {
        heading: 'Wat weerspieël word',
        points: [
          'Tokens (insluitend Jumpgate-ligte), teks, Legacy- en Jumpgate-tekeninge, mure van elke soort, deure en vensters.',
          'Nuwe objekte, veranderinge en skrappings, in albei rigtings. Skrappings volg die instelling “Wanneer ’n objek geskrap word”.',
          'Bladsy-instellings soos beligting, rooster en grootte, tensy afgeskakel of per bladsy gehou.',
          'Lae kan per groep uitgesluit word, en token-eienskappe soos visie kan per bladsy gehou word.',
          'Veranderinge wat ander Mods deur TokenMod maak, word ook weerspieël. Ander Mods kan SyncPage.notify roep; herstel vang die res.',
        ],
      },
      visibility: {
        heading: 'Versteek per bladsy',
        points: [
          'Kies tokens en gebruik Versteek hier, Versteek elders, of die rooster op die Spelers-kaart.',
          'Net daardie bladsy se kopie word versteek. Veranderinge van ander bladsye maak die versteek nooit ongedaan nie.',
          'Die SL-laag-modus skuif die kopie na die SL-laag. Die Verwyder-modus skrap dit en maak dit weer wanneer dit gewys word, sodat niks op die bladsy oorbly vir spelers om te vind nie.',
        ],
      },
      players: {
        heading: 'Spelers',
        points: [
          'Die Spelers-kaart lys elke speler en die bladsy waarop hulle is, met ’n knoppie per bladsy om hulle te skuif (verdeel die groep).',
          '“Almal na” bring die spelers op een bladsy bymekaar en onthou waar hulle was; “Herstel uitleg” sit hulle terug.',
        ],
      },
      repair: {
        heading: 'Herstel',
        points: [
          'Herstel bring die kopieë weer in pas met die bronbladsy: eienskappe wat afgewyk het, ontbrekende kopieë, objekte wat geskrap of gemaak is terwyl SyncPage nie gekyk het nie.',
          'Voorskou herstel wys wat sou verander sonder om iets te verander. ’n Herstel wat baie objekte sou verander, vra eers.',
          'Herstel loop stil wanneer die sandbox begin (instelling). Objek-ID’s bly dieselfde, anders as by 0.1.',
        ],
      },
      memory: {
        heading: 'Wat SyncPage onthou',
        points: [
          '’n Herwinningsblik per groep: elke skrapping wat versprei en elke opruiming kan met Ontdoen teruggesit word.',
          'Waar elke speler was, sodat ’n verdeling herstel kan word.',
          'Die laaste groep wat u gebruik het, die laaste herstel en die resultate daarvan.',
          'Knoppies wat data nodig het, dra ’n kort kode; hulle werk een keer en verval na 10 minute.',
        ],
      },
      commands: {
        heading: 'Opdragte',
        intro: 'Net vir die SL. !sync werk ook.',
        colCommand: 'Opdrag',
        colDesc: 'Wat dit doen',
      },
      settings: {
        heading: 'Instellings',
        intro:
          'Verander instellings op die instellingskaart of met !syncpage set. Groepinstellings kan vir een groep op sy kaart verander word.',
        colKey: 'Sleutel',
        colName: 'Instelling',
        colDesc: 'Betekenis',
        colScope: 'Omvang',
        scopeGroup: 'Per groep',
        scopeGlobal: 'Globaal',
      },
      api: {
        heading: 'Vir ander Mods',
        intro: 'Die globale SyncPage-objek:',
        colFunction: 'Funksie',
        colDesc: 'Wat dit doen',
        rows: {
          getGroup: 'Die groep waarin ’n bladsy is: id, naam, bron en bladsye.',
          getLinked: 'Die gekoppelde kopieë van ’n objek, per bladsy.',
          notify:
            'Weerspieël ’n verandering wat u Mod gemaak het (API-veranderinge veroorsaak geen gebeurtenisse nie).',
          isHidden: 'Of ’n objek se kopie op ’n bladsy versteek is.',
          onSync: 'Word ingelig oor elke weerspieëlde skepping, verandering en skrapping.',
          repair: 'Herstel ’n groep; { dryRun: true } tel net.',
        },
      },
      upgrading: {
        heading: 'Opgradering vanaf 0.1',
        points: [
          '’n Bladsy waarvan die naam op “_synced” eindig, sluit by ’n groep aan saam met die bladsy met dieselfde naam daarsonder, wat die bron word. U kan die bladsye daarna hernoem.',
          'Ou skakels word behou; alles anders word volgens posisie en prent gepaar.',
          'Show/Hide-merkers in SL-notas word versteekte kopieë, en die merkerteks word uit die SL-notas verwyder.',
          '’n Pasgemaakte opdrag uit die ou konfigurasie werk steeds. “True Copy” bestaan nie meer nie: gebruik “Dupliseer bladsy”.',
        ],
      },
      troubleshooting: {
        heading: 'Probleemoplossing',
        points: [
          '’n Token is met die verkeerde prent gekopieer: die API kan nie Marketplace-kuns kopieer nie. Maak die kopie met “Dupliseer bladsy” en voeg dit by die groep.',
          'Kopieë is uit pas nadat ’n ander Mod dinge verander het: voer Herstel uit, of vra daardie Mod se outeur om SyncPage.notify te roep.',
          'Wil u een kopie doelbewus anders rangskik? Pouseer die groep, maak die veranderinge, klik dan op Hervat en kies om nie te herstel nie.',
        ],
      },
      languages: {
        heading: 'Tale',
        body: 'Stel die taal op die instellingskaart. Kieslyste, boodskappe en hierdie uitdeelstukke volg dit.',
        colLanguage: 'Taal',
        colNative: 'Eie naam',
        colCode: 'Kode',
      },
      credits: {
        heading: 'Erkennings',
        original: 'Oorspronklike Mod deur',
        maintainer: 'Herskryf en onderhou deur',
        support: 'Rapporteer asseblief probleme op die Roll20-forum of GitHub.',
      },
    },
  };

  var localeCa = {
    titles: {
      ready: 'SyncPage està a punt.',
      group: 'Grup de sincronització: {name}',
      players: 'Jugadors: {name}',
      settings: 'Paràmetres de SyncPage',
      groupSettings: 'Paràmetres de {name}',
      status: 'Estat de SyncPage',
      recycle: 'Paperera: {name}',
      dryRun: 'Previsualització de la reparació: {name}',
      repaired: 'Reparat: {name}',
      repairedOnStart: 'SyncPage ha reparat els teus grups',
      help: 'Ordres de SyncPage',
      deleted: 'Suprimit en una pàgina',
      leftovers: 'Objectes sense parella',
      warning: 'SyncPage',
    },
    messages: {
      readyHint: 'Escriu !syncpage per obrir el menú.',
      migrated:
        "S'ha conservat la teva configuració de SyncPage 0.1: {groups} grup(s), {links} enllaç(os) mantingut(s), {hidden} còpia(es) amagada(es). Ara ja pots canviar el nom de les pàgines que acaben en «_synced».",
      trueCopyGone:
        "L'antiga funció «True Copy» ja no existeix: fes servir Duplica la pàgina de Roll20 i després afegeix la còpia a un grup.",
      groupCreated:
        'Grup «{name}» creat a partir de {page}, amb {count} objecte(s). Duplica la pàgina i després afegeix la còpia amb «Afegeix aquesta pàgina a un grup».',
      pageAdded:
        "{page} s'ha unit a «{name}»: {paired} aparellat(s), {copied} copiat(s), {failed} no s'han pogut copiar, {leftovers} sense parella.",
      pageRemoved: "{page} ha sortit de «{name}». Els seus objectes s'hi queden, desenllaçats.",
      groupDeleted: "S'ha suprimit el grup «{name}». Els objectes es queden a les seves pàgines.",
      notConfirmed: "No s'ha canviat res (no s'ha confirmat).",
      hidden: "S'han amagat {count} còpia(es). {skipped} objecte(s) no estan enllaçats.",
      shown: "S'han mostrat {count} còpia(es). {skipped} objecte(s) no estan enllaçats.",
      hideFallback:
        "{count} còpia(es) fan servir una imatge que l'API no pot tornar a crear, així que s'han mogut a la capa del DJ en lloc de suprimir-les.",
      deletedAsk:
        "{name} s'ha suprimit a {page}. Les seves còpies a les altres pàgines encara hi són.",
      deletedEverywhere: "S'han suprimit {count} còpia(es) més. Desfés les recupera.",
      keptOthers: 'Les altres còpies es queden.',
      restored: "S'han restaurat {count} objecte(s). {failed} no s'han pogut restaurar.",
      nothingToUndo: 'No hi ha res per desfer.',
      recycleEmptied: 'La paperera és buida.',
      leftovers:
        '{count} objecte(s) de {page} no coincideixen amb res del grup. Vols copiar-los a les altres pàgines o deixar-los només en aquesta pàgina?',
      andMore: '…i {count} més.',
      leftoversCopied: "S'han copiat {count} objecte(s) a les altres pàgines.",
      leftoversKept: "S'han deixat {count} objecte(s) només a la seva pàgina.",
      imageNotCopied:
        "{name} a {page} fa servir una imatge que l'API no pot copiar (art del Marketplace). Fes servir Duplica la pàgina de Roll20 per fer-ne còpies i després afegeix la còpia al grup.",
      moved: "{player} s'ha mogut a {page}.",
      movedAll:
        "{count} jugador(s) s'han mogut a {page}. «Restaura la distribució» els torna on eren.",
      layoutSaved: "S'ha recordat on són {count} jugador(s).",
      layoutRestored: "S'han tornat {count} jugador(s) on eren.",
      layoutReset: "S'ha esborrat la distribució recordada.",
      unlinked: "S'han desenllaçat {count} objecte(s). Es queden només en aquesta pàgina.",
      paused:
        'La rèplica de «{name}» està en pausa. Els canvis es queden a la pàgina on es fan fins que la reprenguis.',
      resumed: "La rèplica de «{name}» torna a estar activa. S'han trobat {count} diferència(es).",
      settingsReset: "S'han restablert els paràmetres per defecte.",
      resetMoved: 'Fes servir {command} per restablir els paràmetres per defecte.',
      handouts: "S'han refet els fullets d'ajuda i d'ordres.",
      pruned: 'Neteja feta: {links} enllaç(os) buit(s), {pages} pàgina(es) que faltaven.',
      startRepair:
        '{name}: {drifted} desajustat(s), {recreated} recreat(s), {removed} suprimit(s), {mirrored} objecte(s) nou(s) copiat(s).',
    },
    errors: {
      hint: 'Escriu {command} help per veure les ordres.',
      gmOnly: 'Només el DJ pot fer servir SyncPage.',
      unknownCommand: 'Ordre desconeguda: {command}.',
      unknownSetting: 'Paràmetre desconegut: {key}.',
      badValue: '«{value}» no és un valor vàlid per a {key}.',
      globalOnly: "{key} s'aplica a tots els grups i no es pot canviar per a un de sol.",
      noGroup: "No s'ha trobat cap grup de sincronització per a «{name}».",
      groupExists: 'Ja hi ha un grup que es diu «{name}».',
      noName: 'Indica un nom.',
      pageInGroup: '{page} ja és al grup «{group}».',
      pageNotInGroup: '{page} no és al grup «{name}».',
      nothingSelected: 'Primer selecciona un o més objectes.',
      noPage: "No s'ha trobat cap pàgina per a «{page}».",
      noPlayer: "No s'ha trobat cap jugador per a «{player}».",
      requestExpired: 'Aquest botó ha caducat. Torna a obrir la targeta.',
      requestUnknown: "Aquest botó ja s'ha fet servir.",
    },
    menu: {
      thisPage: 'Aquesta pàgina',
      group: 'Grup',
      source: 'origen',
      copy: 'còpia',
      paused: 'En pausa',
      notInGroup: 'Aquesta pàgina no és a cap grup de sincronització.',
      duplicateHint:
        "Consell: crea un grup amb la pàgina del teu mapa, fes-hi servir Duplica la pàgina de Roll20, ves a la còpia i afegeix-la al grup. Així les còpies conserven l'art del Marketplace.",
      selectedHint: 'Amaga i Mostra actuen sobre els objectes seleccionats.',
      groups: 'Grups',
    },
    group: {
      pages: 'Pàgines (★ = origen)',
      playersCount: '{count} jugador(s)',
      sourceHint: "La pàgina d'origen és la referència per a les reparacions.",
      summary: 'Resum',
      links: 'Objectes enllaçats',
      hidden: 'Còpies amagades',
      recycle: 'A la paperera',
      overrides: 'Paràmetres propis',
      none: 'cap',
      lastRepair: 'Última reparació {when}: {drifted} desajustat(s), {recreated} recreat(s).',
    },
    players: {
      none: 'Encara no hi ha jugadors en aquesta partida.',
      elsewhere: "fora d'aquest grup",
      visibility: 'Objectes seleccionats: fes clic per amagar-los o mostrar-los en una pàgina',
      selectHint:
        'Selecciona fitxes i torna a obrir aquesta targeta per amagar-les o mostrar-les pàgina a pàgina.',
      shown: 'visible',
      hidden: 'amagat',
      layoutSaved: 'Hi ha una distribució de {count} jugador(s) recordada.',
      youAreOn: 'Ets a {page}.',
    },
    status: {
      notLinked: 'no enllaçat',
      pageOnly: 'només en aquesta pàgina',
      missing: 'falta',
    },
    recycle: {
      empty: 'La paperera és buida.',
      reasons: {
        delete: 'Suprimit',
        repair: 'Reparació',
        exclude: 'Capa exclosa',
        group: 'Grup suprimit',
      },
    },
    repair: {
      drifted: 'Còpies desajustades',
      recreated: 'Còpies que faltaven recreades',
      removed: 'Còpies suprimides (origen suprimit)',
      dropped: 'Enllaços buits eliminats',
      mirrored: 'Objectes nous copiats',
      leftovers: 'Objectes nous a les còpies',
      pageSettings: 'Pàgines amb altres paràmetres',
      dryRunNote: "Encara no s'ha canviat res.",
      doneNote: 'Fet. Els objectes suprimits són a la paperera.',
    },
    age: {
      now: 'ara mateix',
      minutes: 'fa {count} min',
      hours: 'fa {count} h',
      days: 'fa {count} dies',
    },
    types: {
      graphic: 'Fitxa',
      text: 'Text',
      path: 'Dibuix',
      pathv2: 'Dibuix',
      door: 'Porta',
      window: 'Finestra',
    },
    values: {
      on: 'Sí',
      off: 'No',
      none: 'Cap',
    },
    queries: {
      group: 'Grup',
      groupName: 'Nom del grup',
      deleteGroup: 'Vols suprimir el grup {name}? Els objectes es queden a les seves pàgines.',
      resetSettings: 'Vols restablir els paràmetres per defecte?',
      emptyRecycle: 'Vols buidar la paperera? No es pot desfer.',
      yes: 'Sí',
      no: 'No',
    },
    buttons: {
      menu: 'Menú',
      group: 'Grup',
      players: 'Jugadors',
      repair: 'Repara',
      repairNow: 'Repara ara',
      dryRun: 'Previsualitza',
      pause: 'Pausa',
      resume: 'Reprèn',
      status: 'Estat',
      hideHere: 'Amaga aquí',
      showHere: 'Mostra aquí',
      hideOthers: 'Amaga a les altres',
      showOthers: 'Mostra a les altres',
      createGroup: 'Crea un grup amb aquesta pàgina',
      addToGroup: 'Afegeix aquesta pàgina a un grup',
      removePage: 'Treu del grup',
      makeSource: 'Fes-la origen',
      settings: 'Paràmetres',
      groupSettings: 'Paràmetres del grup',
      recycle: 'Paperera',
      undo: 'Desfés',
      help: 'Ajuda',
      rename: 'Canvia el nom',
      deleteGroup: 'Suprimeix el grup',
      everyoneTo: 'Tothom a {page}',
      saveLayout: 'Desa la distribució',
      restoreLayout: 'Restaura la distribució',
      useGlobal: 'Usa el global',
      reset: 'Restableix',
      restore: 'Restaura',
      emptyRecycle: 'Buida',
      deleteEverywhere: 'Suprimeix a totes',
      keepOthers: 'Conserva les altres',
      copy: 'Copia',
      keepHere: 'Deixa aquí',
      copyAll: 'Copia-ho tot',
      keepAll: 'Deixa-ho tot aquí',
      unlink: 'Desenllaça',
      rebuild: 'Refés els fullets',
    },
    settings: {
      deleteMode: 'Quan se suprimeix un objecte',
      hideMode: "Com s'amaguen les còpies",
      pairLeftovers: 'Objectes sense parella',
      newObjects: 'Objectes nous',
      localProps: 'Propi de cada pàgina (fitxes)',
      localPageSettings: 'Propi de cada pàgina (paràmetres de pàgina)',
      excludeLayers: 'Capes sense sincronitzar',
      syncPageSettings: 'Replica els paràmetres de pàgina',
      repairOnStart: 'Repara en iniciar',
      playerMenu: 'Qui pot obrir la targeta de jugadors',
      recycleSize: 'Mida de la paperera',
      language: 'Idioma',
      groupHint:
        "Aquests paràmetres només s'apliquen a aquest grup. «Usa el global» torna al paràmetre general.",
      override: 'aquest grup',
      global: 'global',
    },
    settingsHelp: {
      deleteMode:
        "A totes: suprimir en qualsevol pàgina suprimeix totes les còpies. Només pàgina d'origen: només s'estenen les supressions a la pàgina d'origen. Desenllaçar: no s'estenen mai. Preguntar: xiuxiueja una tria.",
      hideMode:
        'Capa del DJ: la còpia passa a la capa del DJ. Treure: la còpia se suprimeix i es torna a crear quan es mostra, així que no queda res que els jugadors puguin trobar.',
      pairLeftovers:
        "Quan una pàgina s'uneix a un grup o es repara: preguntar, copiar-los a les altres pàgines o deixar-los a la seva pàgina.",
      newObjects:
        "Replicar: es copien els objectes creats a qualsevol pàgina. Només origen: només es copien els objectes creats a la pàgina d'origen.",
      localProps:
        'Propietats de fitxa que cada pàgina conserva per a si mateixa, com la visió per a un jugador.',
      localPageSettings:
        'Paràmetres de pàgina que cada pàgina conserva per a si mateixa, com la foscor per a un grup de jugadors.',
      excludeLayers: "Els objectes d'aquestes capes es queden a la seva pròpia pàgina.",
      syncPageSettings:
        'Copia els paràmetres de pàgina (il·luminació, quadrícula, mida…) entre les pàgines del grup.',
      repairOnStart:
        "Quan s'inicia el sandbox: reparar en silenci, reparar i informar, o no fer res.",
      playerMenu: 'Només el DJ, o també els jugadors poden preguntar en quina pàgina són.',
      recycleSize: 'Quantes supressions guarda cada grup per a Desfés.',
      language: 'Idioma dels menús, els missatges i els fullets.',
    },
    options: {
      deleteMode: {
        all: 'A totes',
        source: "Només pàgina d'origen",
        unlink: 'Desenllaçar',
        ask: 'Preguntar',
      },
      hideMode: { gmlayer: 'Capa del DJ', remove: 'Treure' },
      pairLeftovers: { ask: 'Preguntar', copy: 'Copiar', leave: 'Deixar' },
      newObjects: { mirror: 'Replicar', sourceOnly: 'Només origen' },
      localProps: {
        gmnotes: 'Notes del DJ',
        name: 'Nom',
        bars: 'Barres',
        markers: 'Marcadors',
        tint: 'Tint',
        aura: 'Aures',
        vision: 'Visió',
        light: 'Llum',
        controlledby: 'Controlat per',
      },
      localPageSettings: {
        lighting: 'Il·luminació',
        daylight: 'Llum de dia',
        explorer: 'Mode explorador',
        fog: 'Boira',
        grid: 'Quadrícula',
        background: 'Fons',
        scale: 'Mida i escala',
        jukebox: 'Jukebox',
      },
      excludeLayers: {
        map: 'Mapa',
        objects: 'Fitxes',
        gmlayer: 'DJ',
        foreground: 'Primer pla',
        walls: 'Murs',
      },
      repairOnStart: { quiet: 'En silenci', report: 'I informar', off: 'No' },
      playerMenu: { gm: 'Només el DJ', players: 'També jugadors' },
    },
    help: {
      menu: 'Obre el menú.',
      groupCreate: 'Crea un grup de sincronització amb aquesta pàgina.',
      groupAdd:
        "Afegeix aquesta pàgina a un grup: els objectes que coincideixen s'aparellen i els que falten es copien.",
      groupRemove: "Treu aquesta pàgina del seu grup. Els objectes s'hi queden, desenllaçats.",
      groupShow: "Mostra la targeta d'un grup.",
      groupRename: "Canvia el nom d'un grup.",
      groupSource: "Fa d'aquesta pàgina l'origen del grup (la referència per a les reparacions).",
      groupDelete: 'Suprimeix un grup (pregunta abans). Els objectes es queden.',
      players:
        "Mostra qui és a cada pàgina, amb botons per moure'ls i per amagar o mostrar les fitxes seleccionades per pàgina.",
      move: 'Mou un jugador a una pàgina (dividir el grup).',
      moveAll: 'Mou tots els jugadors del grup a una pàgina i recorda on eren.',
      layout: 'Recorda o restaura en quina pàgina és cada jugador.',
      hide: 'Amaga les còpies dels objectes seleccionats: aquí, a les altres pàgines, a totes o a les pàgines indicades.',
      show: 'Torna a mostrar les còpies amagades.',
      status: 'Mostra els enllaços dels objectes seleccionats i on estan amagats.',
      unlink: 'Deixa els objectes seleccionats només en aquesta pàgina.',
      repair: "Torna a posar les còpies al dia amb la pàgina d'origen. --dry-run només informa.",
      pause: "Atura la rèplica d'un grup una estona.",
      resume: 'Torna a replicar; mostra les diferències.',
      undo: "Recupera l'última supressió.",
      recycle: 'Llista les supressions i en restaura qualsevol.',
      settings: "Mostra els paràmetres, globals o d'un grup.",
      set: 'Canvia un paràmetre. Les llistes admeten +name o -name.',
      settingsReset: 'Restableix els paràmetres per defecte (pregunta abans).',
      handouts: "Refà els fullets d'ajuda i d'ordres.",
      help: 'Mostra aquesta llista.',
      ids: 'Actua sobre aquests objectes en lloc dels seleccionats.',
      page: 'Actua sobre aquesta pàgina en lloc de la que estàs veient.',
      footer: 'El fullet {help} ho explica tot; {deck} té botons.',
    },
    deck: {
      menuTitle: 'Menú',
      menuDesc: 'El menú principal, els jugadors i els paràmetres.',
      groupsTitle: 'Grups',
      groupsDesc: 'Crea un grup amb la pàgina on ets o afegeix aquesta pàgina a un grup.',
      selectedTitle: 'Objectes seleccionats',
      selectedDesc: 'Amaga o mostra les còpies dels objectes seleccionats.',
      toolsTitle: 'Eines',
      toolsDesc: 'Reparar, desfer, posar en pausa i fullets.',
      footer: 'Consulta {help} per saber com funciona SyncPage.',
    },
    handout: {
      versionLabel: 'Versió',
      subtitle: 'Pàgines enllaçades per a grups dividits',
      footer: 'Obre {deck} per veure els botons.',
      overview: {
        heading: 'Visió general',
        body: "SyncPage manté les pàgines al dia entre si. Les pàgines d'un grup de sincronització comparteixen fitxes, dibuixos, murs, portes, finestres, textos i paràmetres de pàgina: el que canvia en una pàgina canvia a les altres. Amb la funció de dividir el grup de Roll20 poses els jugadors en còpies diferents i després amagues o mostres coses a cada còpia, perquè cada jugador vegi només el que ha de veure el seu personatge.",
        why: 'Roll20 no pot amagar un objecte només a alguns jugadors en una mateixa pàgina. La il·luminació dinàmica dona a cada fitxa la seva pròpia visió, però no permet «aquest PNJ és invisible només per al lladre». Les pàgines replicades sí que ho permeten.',
      },
      quickStart: {
        heading: 'Inici ràpid',
        steps: [
          'Ves a la pàgina del teu mapa i escriu !syncpage; després fes clic a «Crea un grup amb aquesta pàgina».',
          "Fes servir Duplica la pàgina de Roll20 en aquesta pàgina (el menú de la targeta de la pàgina). Copia l'art del Marketplace, cosa que l'API no pot fer.",
          'Ves a la còpia i fes clic a «Afegeix aquesta pàgina a un grup». SyncPage aparella els objectes que coincideixen i copia tot el que falti.',
          'Obre Jugadors per moure els jugadors a la còpia; després selecciona fitxes i amaga-les en una pàgina.',
        ],
      },
      mirroring: {
        heading: 'Què es replica',
        points: [
          'Fitxes (incloses les llums de Jumpgate), textos, dibuixos Legacy i de Jumpgate, murs de tota mena, portes i finestres.',
          'Objectes nous, canvis i supressions, en tots dos sentits. Les supressions segueixen el paràmetre «Quan se suprimeix un objecte».',
          'Paràmetres de pàgina com la il·luminació, la quadrícula i la mida, tret que es desactivin o es mantinguin per pàgina.',
          'Es poden excloure capes per grup, i les propietats de fitxa com la visió es poden mantenir per pàgina.',
          "També es repliquen els canvis que altres Mods fan mitjançant TokenMod. Altres Mods poden cridar SyncPage.notify; la reparació s'encarrega de la resta.",
        ],
      },
      visibility: {
        heading: 'Amagar per pàgina',
        points: [
          'Selecciona fitxes i fes servir Amaga aquí, Amaga a les altres o la quadrícula de la targeta de Jugadors.',
          "Només s'amaga la còpia d'aquella pàgina. Els canvis d'altres pàgines no desfan mai l'ocultació.",
          'El mode Capa del DJ mou la còpia a la capa del DJ. El mode Treure la suprimeix i la torna a crear quan es mostra, així que no queda res a la pàgina que els jugadors puguin trobar.',
        ],
      },
      players: {
        heading: 'Jugadors',
        points: [
          "La targeta de Jugadors mostra cada jugador i la pàgina on és, amb un botó per pàgina per moure'l (dividir el grup).",
          '«Tothom a» reuneix els jugadors en una pàgina i recorda on eren; «Restaura la distribució» els torna on eren.',
        ],
      },
      repair: {
        heading: 'Reparació',
        points: [
          "La reparació torna a posar les còpies al dia amb la pàgina d'origen: propietats desajustades, còpies que falten i objectes suprimits o creats mentre SyncPage no vigilava.",
          'Previsualitza mostra què canviaria sense canviar res. Una reparació que canviaria molts objectes pregunta abans.',
          "La reparació s'executa en silenci quan s'inicia el sandbox (paràmetre). Els ID dels objectes no canvien, a diferència de la 0.1.",
        ],
      },
      memory: {
        heading: 'Què recorda SyncPage',
        points: [
          'Una paperera per grup: cada supressió estesa i cada neteja es pot recuperar amb Desfés.',
          'On era cada jugador, per poder restaurar una divisió.',
          "L'últim grup que vas fer servir, l'última reparació i els seus resultats.",
          'Els botons que necessiten dades porten un codi curt; funcionen una vegada i caduquen al cap de 10 minuts.',
        ],
      },
      commands: {
        heading: 'Ordres',
        intro: 'Només per al DJ. !sync també funciona.',
        colCommand: 'Ordre',
        colDesc: 'Què fa',
      },
      settings: {
        heading: 'Paràmetres',
        intro:
          'Canvia els paràmetres a la targeta de paràmetres o amb !syncpage set. Els paràmetres de grup es poden canviar per a un sol grup a la seva targeta.',
        colKey: 'Clau',
        colName: 'Paràmetre',
        colDesc: 'Significat',
        colScope: 'Abast',
        scopeGroup: 'Per grup',
        scopeGlobal: 'Global',
      },
      api: {
        heading: 'Per a altres Mods',
        intro: "L'objecte global SyncPage:",
        colFunction: 'Funció',
        colDesc: 'Què fa',
        rows: {
          getGroup: 'El grup on és una pàgina: id, nom, origen i pàgines.',
          getLinked: "Les còpies enllaçades d'un objecte, per pàgina.",
          notify:
            "Replica un canvi fet pel teu Mod (els canvis de l'API no generen esdeveniments).",
          isHidden: "Si la còpia d'un objecte està amagada en una pàgina.",
          onSync: 'Rep avís de cada creació, canvi i supressió replicats.',
          repair: 'Repara un grup; { dryRun: true } només compta.',
        },
      },
      upgrading: {
        heading: 'Actualitzar des de la 0.1',
        points: [
          "Una pàgina el nom de la qual acaba en «_synced» s'uneix a un grup amb la pàgina del mateix nom sense aquest sufix, que passa a ser l'origen. Després pots canviar el nom de les pàgines.",
          "Els enllaços antics es conserven; tota la resta s'aparella per posició i imatge.",
          'Les marques Show/Hide de les Notes del DJ passen a ser còpies amagades, i el text de la marca es treu de les Notes del DJ.',
          'Una ordre personalitzada de la configuració antiga continua funcionant. «True Copy» ja no existeix: fes servir Duplica la pàgina.',
        ],
      },
      troubleshooting: {
        heading: 'Resolució de problemes',
        points: [
          "Una fitxa copiada amb la imatge equivocada: l'API no pot copiar l'art del Marketplace. Fes la còpia amb Duplica la pàgina i afegeix-la al grup.",
          "Còpies desajustades després que un altre Mod canviés coses: executa Repara o demana a l'autor d'aquell Mod que cridi SyncPage.notify.",
          'Vols reorganitzar una còpia expressament? Posa el grup en pausa, fes els canvis i després reprèn-lo i tria no reparar.',
        ],
      },
      languages: {
        heading: 'Idiomes',
        body: "Tria l'idioma a la targeta de paràmetres. Els menús, els missatges i aquests fullets el segueixen.",
        colLanguage: 'Idioma',
        colNative: 'Nom natiu',
        colCode: 'Codi',
      },
      credits: {
        heading: 'Crèdits',
        original: 'Mod original de',
        maintainer: 'Reescrit i mantingut per',
        support: 'Informa dels problemes al fòrum de Roll20 o a GitHub.',
      },
    },
  };

  var localeZhTW = {
    titles: {
      ready: 'SyncPage 已準備就緒。',
      group: '同步群組：{name}',
      players: '玩家：{name}',
      settings: 'SyncPage 設定',
      groupSettings: '{name} 的設定',
      status: 'SyncPage 狀態',
      recycle: '資源回收筒：{name}',
      dryRun: '修復預覽：{name}',
      repaired: '已修復：{name}',
      repairedOnStart: 'SyncPage 已修復你的群組',
      help: 'SyncPage 指令',
      deleted: '已在一個頁面上刪除',
      leftovers: '沒有對應的物件',
      warning: 'SyncPage',
    },
    messages: {
      readyHint: '輸入 !syncpage 開啟選單。',
      migrated:
        '已沿用你的 SyncPage 0.1 設定：{groups} 個群組，保留 {links} 個連結，{hidden} 個隱藏的副本。名稱以「_synced」結尾的頁面現在可以重新命名。',
      trueCopyGone:
        '舊的「True Copy」功能已移除：請使用 Roll20 本身的「複製頁面」，再把副本加入群組。',
      groupCreated:
        '已從 {page} 建立群組「{name}」，含 {count} 個物件。請複製該頁面，再用「將此頁面加入群組」加入副本。',
      pageAdded:
        '{page} 已加入「{name}」：配對 {paired} 個，複製 {copied} 個，{failed} 個無法複製，{leftovers} 個沒有對應。',
      pageRemoved: '{page} 已離開「{name}」。其物件會保留，但不再連結。',
      groupDeleted: '已刪除群組「{name}」。物件仍保留在各自的頁面上。',
      notConfirmed: '沒有任何變更（未確認）。',
      hidden: '已隱藏 {count} 個副本。{skipped} 個物件沒有連結。',
      shown: '已顯示 {count} 個副本。{skipped} 個物件沒有連結。',
      hideFallback:
        '{count} 個副本使用的圖片無法由 API 重新建立，因此改為移到 GM 圖層，而不是移除。',
      deletedAsk: '{name} 已在 {page} 上刪除。其他頁面上的副本仍在。',
      deletedEverywhere: '已刪除其他 {count} 個副本。「復原」可以把它們放回來。',
      keptOthers: '其他副本會保留。',
      restored: '已還原 {count} 個物件。{failed} 個無法還原。',
      nothingToUndo: '沒有可以復原的動作。',
      recycleEmptied: '資源回收筒是空的。',
      leftovers:
        '{page} 上有 {count} 個物件在群組中沒有對應。要將它們複製到其他頁面，還是只保留在這個頁面上？',
      andMore: '…還有 {count} 個。',
      leftoversCopied: '已將 {count} 個物件複製到其他頁面。',
      leftoversKept: '已將 {count} 個物件只保留在原本的頁面上。',
      imageNotCopied:
        '{page} 上的 {name} 使用了 API 無法複製的圖片（市集美術素材）。請用 Roll20 的「複製頁面」建立含有該圖片的副本，再把副本加入群組。',
      moved: '{player} 已移到 {page}。',
      movedAll: '已將 {count} 位玩家移到 {page}。「還原配置」可以把他們移回去。',
      layoutSaved: '已記住 {count} 位玩家所在的位置。',
      layoutRestored: '已將 {count} 位玩家移回原處。',
      layoutReset: '已清除記住的配置。',
      unlinked: '已取消 {count} 個物件的連結。它們只會保留在這個頁面上。',
      paused: '「{name}」的鏡像同步已暫停。在你繼續之前，變更只會留在進行變更的頁面上。',
      resumed: '「{name}」的鏡像同步已重新開啟。找到 {count} 處差異。',
      settingsReset: '設定已還原為預設值。',
      resetMoved: '請使用 {command} 還原預設設定。',
      handouts: '已重建「說明」和「指令面板」講義。',
      pruned: '已整理：{links} 個空連結，{pages} 個不存在的頁面。',
      startRepair:
        '{name}：{drifted} 個偏移，{recreated} 個重建，{removed} 個移除，複製了 {mirrored} 個新物件。',
    },
    errors: {
      hint: '輸入 {command} help 查看指令。',
      gmOnly: '只有 GM 可以使用 SyncPage。',
      unknownCommand: '未知的指令：{command}。',
      unknownSetting: '未知的設定：{key}。',
      badValue: '「{value}」不是 {key} 的有效值。',
      globalOnly: '{key} 套用於所有群組，無法只為單一群組變更。',
      noGroup: '找不到「{name}」的同步群組。',
      groupExists: '已經有名為「{name}」的群組。',
      noName: '請輸入名稱。',
      pageInGroup: '{page} 已在群組「{group}」中。',
      pageNotInGroup: '{page} 不在群組「{name}」中。',
      nothingSelected: '請先選取一個或多個物件。',
      noPage: '找不到「{page}」頁面。',
      noPlayer: '找不到玩家「{player}」。',
      requestExpired: '這個按鈕已過期。請重新開啟卡片。',
      requestUnknown: '這個按鈕已經使用過了。',
    },
    menu: {
      thisPage: '此頁面',
      group: '群組',
      source: '來源',
      copy: '副本',
      paused: '已暫停',
      notInGroup: '此頁面不在任何同步群組中。',
      duplicateHint:
        '提示：從你的地圖頁面建立群組，對它使用 Roll20 的「複製頁面」，前往副本並將它加入群組。這樣副本會保留市集美術素材。',
      selectedHint: '「隱藏」和「顯示」會作用於選取的物件。',
      groups: '群組',
    },
    group: {
      pages: '頁面（★ = 來源）',
      playersCount: '{count} 位玩家',
      sourceHint: '來源頁面是修復時的依據。',
      summary: '摘要',
      links: '已連結的物件',
      hidden: '隱藏的副本',
      recycle: '在資源回收筒中',
      overrides: '自訂設定',
      none: '無',
      lastRepair: '上次修復 {when}：{drifted} 個偏移，{recreated} 個重建。',
    },
    players: {
      none: '這個遊戲還沒有玩家。',
      elsewhere: '不在此群組',
      visibility: '選取的物件：點選以在各頁面隱藏或顯示',
      selectHint: '選取標記後再次開啟此卡片，即可逐頁隱藏或顯示它們。',
      shown: '顯示',
      hidden: '隱藏',
      layoutSaved: '已記住 {count} 位玩家的配置。',
      youAreOn: '你目前在 {page}。',
    },
    status: {
      notLinked: '未連結',
      pageOnly: '只保留在此頁面',
      missing: '遺失',
    },
    recycle: {
      empty: '資源回收筒是空的。',
      reasons: {
        delete: '已刪除',
        repair: '修復',
        exclude: '排除的圖層',
        group: '已移除群組',
      },
    },
    repair: {
      drifted: '偏移的副本',
      recreated: '重建的遺失副本',
      removed: '移除的副本（來源已刪除）',
      dropped: '清除的空連結',
      mirrored: '複製的新物件',
      leftovers: '副本上的新物件',
      pageSettings: '設定不同的頁面',
      dryRunNote: '目前尚未變更任何內容。',
      doneNote: '完成。移除的物件在資源回收筒中。',
    },
    age: {
      now: '剛剛',
      minutes: '{count} 分鐘前',
      hours: '{count} 小時前',
      days: '{count} 天前',
    },
    types: {
      graphic: '標記',
      text: '文字',
      path: '繪圖',
      pathv2: '繪圖',
      door: '門',
      window: '窗',
    },
    values: {
      on: '開啟',
      off: '關閉',
      none: '無',
    },
    queries: {
      group: '群組',
      groupName: '群組名稱',
      deleteGroup: '要刪除群組 {name} 嗎？物件會保留在各自的頁面上。',
      resetSettings: '要還原預設設定嗎？',
      emptyRecycle: '要清空資源回收筒嗎？此動作無法復原。',
      yes: '是',
      no: '否',
    },
    buttons: {
      menu: '選單',
      group: '群組',
      players: '玩家',
      repair: '修復',
      repairNow: '立即修復',
      dryRun: '預覽修復',
      pause: '暫停',
      resume: '繼續',
      status: '狀態',
      hideHere: '在此隱藏',
      showHere: '在此顯示',
      hideOthers: '在其他頁面隱藏',
      showOthers: '在其他頁面顯示',
      createGroup: '從此頁面建立群組',
      addToGroup: '將此頁面加入群組',
      removePage: '從群組移除',
      makeSource: '設為來源',
      settings: '設定',
      groupSettings: '群組設定',
      recycle: '資源回收筒',
      undo: '復原',
      help: '說明',
      rename: '重新命名',
      deleteGroup: '刪除群組',
      everyoneTo: '全員到 {page}',
      saveLayout: '儲存配置',
      restoreLayout: '還原配置',
      useGlobal: '使用全域設定',
      reset: '重設設定',
      restore: '還原',
      emptyRecycle: '清空',
      deleteEverywhere: '全部刪除',
      keepOthers: '保留其他',
      copy: '複製',
      keepHere: '保留在此',
      copyAll: '全部複製',
      keepAll: '全部保留在此',
      unlink: '取消連結',
      rebuild: '重建講義',
    },
    settings: {
      deleteMode: '刪除物件時',
      hideMode: '副本的隱藏方式',
      pairLeftovers: '沒有對應的物件',
      newObjects: '新物件',
      localProps: '每頁各自保留（標記）',
      localPageSettings: '每頁各自保留（頁面設定）',
      excludeLayers: '不同步的圖層',
      syncPageSettings: '鏡像同步頁面設定',
      repairOnStart: '啟動時修復',
      playerMenu: '誰可以開啟玩家卡片',
      recycleSize: '資源回收筒大小',
      language: '語言',
      groupHint: '這裡的設定只套用於此群組。「使用全域設定」會改回主要設定。',
      override: '此群組',
      global: '全域',
    },
    settingsHelp: {
      deleteMode:
        '所有頁面：在任一頁面刪除都會刪除所有副本。僅來源頁面：只有在來源頁面上的刪除會擴散。取消連結：永不擴散。詢問：以密語傳送選項。',
      hideMode:
        'GM 圖層：副本會移到 GM 圖層。移除：副本會被刪除，顯示時再重新建立，玩家什麼都找不到。',
      pairLeftovers: '當頁面加入群組或進行修復時：詢問、複製到其他頁面，或留在原本的頁面上。',
      newObjects:
        '鏡像：在任一頁面建立的物件都會被複製。僅來源：只有在來源頁面建立的物件會被複製。',
      localProps: '每個頁面各自保留的標記屬性，例如給單一玩家的視野。',
      localPageSettings: '每個頁面各自保留的頁面設定，例如給一組玩家的黑暗程度。',
      excludeLayers: '這些圖層上的物件只會留在自己的頁面上。',
      syncPageSettings: '在群組的頁面之間複製頁面設定（照明、格線、尺寸…）。',
      repairOnStart: '沙盒啟動時：安靜修復、修復並回報，或不做任何事。',
      playerMenu: '僅限 GM，或玩家也可以查詢自己在哪個頁面。',
      recycleSize: '每個群組為「復原」保留多少筆移除紀錄。',
      language: '選單、訊息和講義使用的語言。',
    },
    options: {
      deleteMode: { all: '所有頁面', source: '僅來源頁面', unlink: '取消連結', ask: '詢問' },
      hideMode: { gmlayer: 'GM 圖層', remove: '移除' },
      pairLeftovers: { ask: '詢問', copy: '複製', leave: '保留' },
      newObjects: { mirror: '鏡像', sourceOnly: '僅來源' },
      localProps: {
        gmnotes: 'GM 筆記',
        name: '名稱',
        bars: '數值條',
        markers: '狀態標示',
        tint: '色調',
        aura: '光環',
        vision: '視野',
        light: '光源',
        controlledby: '控制者',
      },
      localPageSettings: {
        lighting: '照明',
        daylight: '日光',
        explorer: '探索模式',
        fog: '迷霧',
        grid: '格線',
        background: '背景',
        scale: '尺寸與比例',
        jukebox: '點唱機',
      },
      excludeLayers: {
        map: '地圖',
        objects: '標記',
        gmlayer: 'GM',
        foreground: '前景',
        walls: '牆',
      },
      repairOnStart: { quiet: '安靜', report: '並回報', off: '關閉' },
      playerMenu: { gm: '僅限 GM', players: '玩家也可' },
    },
    help: {
      menu: '開啟選單。',
      groupCreate: '從此頁面建立同步群組。',
      groupAdd: '將此頁面加入群組：對應的物件會配對，缺少的會複製過來。',
      groupRemove: '將此頁面移出群組。物件會保留，但不再連結。',
      groupShow: '顯示群組的卡片。',
      groupRename: '重新命名群組。',
      groupSource: '將此頁面設為群組的來源（修復時的依據）。',
      groupDelete: '刪除群組（會先詢問）。物件會保留。',
      players: '顯示誰在哪個頁面，並提供按鈕來移動玩家，以及逐頁隱藏或顯示選取的標記。',
      move: '將一位玩家移到某個頁面（分隊）。',
      moveAll: '將群組中的所有玩家移到同一個頁面，並記住他們原本的位置。',
      layout: '記住或還原每位玩家所在的頁面。',
      hide: '隱藏選取物件的副本：此頁面、其他頁面、所有頁面，或指定的頁面。',
      show: '重新顯示隱藏的副本。',
      status: '顯示選取物件的連結，以及它們在哪裡被隱藏。',
      unlink: '讓選取的物件只保留在此頁面。',
      repair: '讓副本重新與來源頁面一致。--dry-run 只會回報。',
      pause: '暫時停止群組的鏡像同步。',
      resume: '重新開始鏡像同步，並顯示有哪些差異。',
      undo: '放回最後一次移除的內容。',
      recycle: '列出移除紀錄，並可還原其中任何一筆。',
      settings: '顯示全域設定或單一群組的設定。',
      set: '變更設定。清單可使用 +name 或 -name。',
      settingsReset: '還原預設設定（會先詢問）。',
      handouts: '重建「說明」和「指令面板」講義。',
      help: '顯示此清單。',
      ids: '作用於這些物件，而不是選取的物件。',
      page: '作用於此頁面，而不是你正在檢視的頁面。',
      footer: '{help} 講義說明所有內容；{deck} 提供按鈕。',
    },
    deck: {
      menuTitle: '選單',
      menuDesc: '主選單、玩家和設定。',
      groupsTitle: '群組',
      groupsDesc: '從你所在的頁面建立群組，或將此頁面加入群組。',
      selectedTitle: '選取的物件',
      selectedDesc: '隱藏或顯示選取物件的副本。',
      toolsTitle: '工具',
      toolsDesc: '修復、復原、暫停和講義。',
      footer: '請參閱 {help} 了解 SyncPage 的運作方式。',
    },
    handout: {
      versionLabel: '版本',
      subtitle: '為分隊而連結的頁面',
      footer: '開啟 {deck} 使用按鈕。',
      overview: {
        heading: '概覽',
        body: 'SyncPage 讓多個頁面保持一致。同步群組中的頁面共用標記、繪圖、牆、門、窗、文字和頁面設定：一個頁面上的任何變更，都會同樣出現在其他頁面上。搭配 Roll20 的分隊功能，你可以把玩家放在不同的副本上，再逐一副本隱藏或顯示東西，讓每位玩家只看到自己角色該看到的內容。',
        why: 'Roll20 無法在同一個頁面上只對部分玩家隱藏物件。動態光照讓每個標記有自己的視野，但做不到「這個 NPC 只對盜賊隱形」。鏡像頁面可以做到。',
      },
      quickStart: {
        heading: '快速入門',
        steps: [
          '前往你的地圖頁面並輸入 !syncpage，然後點選「從此頁面建立群組」。',
          '對該頁面使用 Roll20 的「複製頁面」（在頁面卡片的選單中）。它會複製市集美術素材，這是 API 做不到的。',
          '前往副本並點選「將此頁面加入群組」。SyncPage 會配對相符的物件，並複製缺少的內容。',
          '開啟「玩家」將玩家移到副本，然後選取標記，在其中一個頁面上隱藏它們。',
        ],
      },
      mirroring: {
        heading: '鏡像同步的內容',
        points: [
          '標記（包括 Jumpgate 光源）、文字、舊版和 Jumpgate 繪圖、各種牆、門和窗。',
          '新物件、變更和刪除，雙向同步。刪除會依照「刪除物件時」設定處理。',
          '照明、格線和尺寸等頁面設定，除非已關閉或設為每頁各自保留。',
          '可以依群組排除圖層，也可以讓視野等標記屬性每頁各自保留。',
          '其他 Mod 透過 TokenMod 所做的變更也會鏡像同步。其他 Mod 可以呼叫 SyncPage.notify；其餘的由修復處理。',
        ],
      },
      visibility: {
        heading: '逐頁隱藏',
        points: [
          '選取標記並使用「在此隱藏」、「在其他頁面隱藏」，或玩家卡片上的表格。',
          '只有該頁面的副本會被隱藏。來自其他頁面的變更永遠不會取消隱藏。',
          'GM 圖層模式會把副本移到 GM 圖層。移除模式會刪除副本，顯示時再重新建立，所以頁面上不會留下任何東西讓玩家找到。',
        ],
      },
      players: {
        heading: '玩家',
        points: [
          '玩家卡片列出每位玩家和他們所在的頁面，每個頁面都有一個按鈕可移動他們（分隊）。',
          '「全員到…」會把玩家集合到同一個頁面，並記住他們原本的位置；「還原配置」可以把他們移回去。',
        ],
      },
      repair: {
        heading: '修復',
        points: [
          '修復會讓副本重新與來源頁面一致：偏移的屬性、遺失的副本，以及在 SyncPage 沒有監看時被刪除或建立的物件。',
          '「預覽修復」會顯示將變更的內容，但不會實際變更。會變更大量物件的修復會先詢問。',
          '沙盒啟動時會安靜地執行修復（可設定）。與 0.1 不同，物件 ID 會維持不變。',
        ],
      },
      memory: {
        heading: 'SyncPage 會記住的內容',
        points: [
          '每個群組一個資源回收筒：每次擴散的刪除和每次整理，都可以用「復原」放回來。',
          '每位玩家原本所在的位置，以便還原分隊。',
          '你上次使用的群組、上次修復及其結果。',
          '需要資料的按鈕帶有一段短代碼；它們只能使用一次，並在 10 分鐘後過期。',
        ],
      },
      commands: {
        heading: '指令',
        intro: '僅限 GM。也可以使用 !sync。',
        colCommand: '指令',
        colDesc: '用途',
      },
      settings: {
        heading: '設定',
        intro:
          '在設定卡片上或使用 !syncpage set 變更設定。群組設定可以在群組的卡片上為單一群組變更。',
        colKey: '鍵',
        colName: '設定',
        colDesc: '說明',
        colScope: '範圍',
        scopeGroup: '每個群組',
        scopeGlobal: '全域',
      },
      api: {
        heading: '給其他 Mod',
        intro: '全域 SyncPage 物件：',
        colFunction: '函式',
        colDesc: '用途',
        rows: {
          getGroup: '頁面所屬的群組：ID、名稱、來源和頁面。',
          getLinked: '物件已連結的副本，依頁面列出。',
          notify: '鏡像同步你的 Mod 所做的變更（API 變更不會觸發事件）。',
          isHidden: '物件的副本是否在某個頁面上被隱藏。',
          onSync: '接收每一次鏡像同步的建立、變更和刪除通知。',
          repair: '修復群組；{ dryRun: true } 只會計數。',
        },
      },
      upgrading: {
        heading: '從 0.1 升級',
        points: [
          '名稱以「_synced」結尾的頁面，會與去掉該字尾的同名頁面組成群組，後者成為來源。之後你可以重新命名這些頁面。',
          '舊的連結會保留；其餘的依位置和圖片配對。',
          'GM 筆記中的 Show/Hide 旗標會變成隱藏的副本，旗標文字會從 GM 筆記中移除。',
          '舊設定檔中的自訂指令仍然可用。「True Copy」已移除：請使用「複製頁面」。',
        ],
      },
      troubleshooting: {
        heading: '疑難排解',
        points: [
          '標記複製後圖片不對：API 無法複製市集美術素材。請用「複製頁面」建立副本，再加入群組。',
          '其他 Mod 變更內容後副本不一致：執行修復，或請該 Mod 的作者呼叫 SyncPage.notify。',
          '想刻意重新排列某個副本嗎？先暫停群組，進行變更，然後按「繼續」並選擇不修復。',
        ],
      },
      languages: {
        heading: '語言',
        body: '在設定卡片上設定語言。選單、訊息和這些講義都會跟著變更。',
        colLanguage: '語言',
        colNative: '原文名稱',
        colCode: '代碼',
      },
      credits: {
        heading: '致謝',
        original: '原始 Mod 作者：',
        maintainer: '改寫與維護：',
        support: '如有問題，請到 Roll20 論壇或 GitHub 回報。',
      },
    },
  };

  var localeCs = {
    titles: {
      ready: 'SyncPage je připraven.',
      group: 'Skupina synchronizace: {name}',
      players: 'Hráči: {name}',
      settings: 'Nastavení SyncPage',
      groupSettings: 'Nastavení pro {name}',
      status: 'Stav SyncPage',
      recycle: 'Koš: {name}',
      dryRun: 'Náhled opravy: {name}',
      repaired: 'Opraveno: {name}',
      repairedOnStart: 'SyncPage opravil vaše skupiny',
      help: 'Příkazy SyncPage',
      deleted: 'Smazáno na jedné stránce',
      leftovers: 'Objekty bez protějšku',
      warning: 'SyncPage',
    },
    messages: {
      readyHint: 'Nabídku otevřete příkazem !syncpage.',
      migrated:
        'Vaše nastavení SyncPage 0.1 bylo převzato: skupiny: {groups}, zachované vazby: {links}, skryté kopie: {hidden}. Stránky, jejichž názvy končí na „_synced“, teď můžete přejmenovat.',
      trueCopyGone:
        'Stará funkce „True Copy“ už neexistuje: použijte funkci Roll20 Duplikovat stránku a pak přidejte kopii do skupiny.',
      groupCreated:
        'Skupina „{name}“ vytvořena ze stránky {page}, počet objektů: {count}. Duplikujte stránku a pak přidejte kopii tlačítkem „Přidat tuto stránku do skupiny“.',
      pageAdded:
        'Stránka {page} se připojila ke skupině „{name}“: spárováno: {paired}, zkopírováno: {copied}, nelze zkopírovat: {failed}, bez protějšku: {leftovers}.',
      pageRemoved: 'Stránka {page} opustila skupinu „{name}“. Její objekty zůstávají, bez vazby.',
      groupDeleted: 'Skupina „{name}“ smazána. Objekty zůstávají na svých stránkách.',
      notConfirmed: 'Nic se nezměnilo (nepotvrzeno).',
      hidden: 'Skryté kopie: {count}. Nepropojené objekty: {skipped}.',
      shown: 'Zobrazené kopie: {count}. Nepropojené objekty: {skipped}.',
      hideFallback:
        'Kopie přesunuté do vrstvy PJ místo odstranění: {count}. Používají obrázek, který API nedokáže znovu vytvořit.',
      deletedAsk: '{name}: smazáno na stránce {page}. Kopie na ostatních stránkách tam stále jsou.',
      deletedEverywhere: 'Smazané ostatní kopie: {count}. Tlačítko Zpět je vrátí.',
      keptOthers: 'Ostatní kopie zůstávají.',
      restored: 'Obnovené objekty: {count}. Nelze obnovit: {failed}.',
      nothingToUndo: 'Není co vrátit.',
      recycleEmptied: 'Koš je prázdný.',
      leftovers:
        'Objekty na stránce {page} bez protějšku ve skupině: {count}. Zkopírovat je na ostatní stránky, nebo je ponechat jen na této stránce?',
      andMore: '…a ještě {count}.',
      leftoversCopied: 'Objekty zkopírované na ostatní stránky: {count}.',
      leftoversKept: 'Objekty ponechané jen na své stránce: {count}.',
      imageNotCopied:
        '{name} na stránce {page} používá obrázek, který API nedokáže zkopírovat (grafika z marketplace). Kopie s ním vytvořte funkcí Roll20 Duplikovat stránku a pak kopii přidejte do skupiny.',
      moved: 'Hráč {player} je teď na stránce {page}.',
      movedAll: 'Hráči přesunutí na stránku {page}: {count}. „Obnovit rozložení“ je vrátí zpět.',
      layoutSaved: 'Uloženo umístění hráčů: {count}.',
      layoutRestored: 'Hráči vrácení zpět: {count}.',
      layoutReset: 'Zapamatované rozložení bylo vymazáno.',
      unlinked: 'Odpojené objekty: {count}. Zůstávají jen na této stránce.',
      paused:
        'Zrcadlení skupiny „{name}“ je pozastaveno. Změny zůstávají na stránce, kde vznikly, dokud ho neobnovíte.',
      resumed: 'Zrcadlení skupiny „{name}“ opět běží. Nalezené rozdíly: {count}.',
      settingsReset: 'Nastavení bylo obnoveno na výchozí hodnoty.',
      resetMoved: 'Výchozí nastavení obnovíte příkazem {command}.',
      handouts: 'Dokumenty s nápovědou a panelem příkazů byly znovu vytvořeny.',
      pruned: 'Uklizeno: prázdné vazby: {links}, chybějící stránky: {pages}.',
      startRepair:
        '{name}: odchýlené: {drifted}, znovu vytvořené: {recreated}, odstraněné: {removed}, zkopírované nové objekty: {mirrored}.',
    },
    errors: {
      hint: 'Seznam příkazů zobrazíte pomocí {command} help.',
      gmOnly: 'SyncPage může používat jen PJ.',
      unknownCommand: 'Neznámý příkaz: {command}.',
      unknownSetting: 'Neznámé nastavení: {key}.',
      badValue: '„{value}“ není platná hodnota pro {key}.',
      globalOnly: '{key} platí pro všechny skupiny a nelze ho změnit pro jednu.',
      noGroup: 'Pro „{name}“ nebyla nalezena žádná skupina synchronizace.',
      groupExists: 'Skupina s názvem „{name}“ už existuje.',
      noName: 'Zadejte název.',
      pageInGroup: 'Stránka {page} už je ve skupině „{group}“.',
      pageNotInGroup: 'Stránka {page} není ve skupině „{name}“.',
      nothingSelected: 'Nejprve vyberte jeden nebo více objektů.',
      noPage: 'Pro „{page}“ nebyla nalezena žádná stránka.',
      noPlayer: 'Pro „{player}“ nebyl nalezen žádný hráč.',
      requestExpired: 'Platnost tlačítka vypršela. Otevřete kartu znovu.',
      requestUnknown: 'Toto tlačítko už bylo použito.',
    },
    menu: {
      thisPage: 'Tato stránka',
      group: 'Skupina',
      source: 'zdroj',
      copy: 'kopie',
      paused: 'Pozastaveno',
      notInGroup: 'Tato stránka není v žádné skupině synchronizace.',
      duplicateHint:
        'Tip: vytvořte skupinu ze stránky s mapou, použijte na ni funkci Roll20 Duplikovat stránku, přejděte na kopii a přidejte ji do skupiny. Kopie tak zachovají grafiku z marketplace.',
      selectedHint: 'Skrýt a Zobrazit působí na vybrané objekty.',
      groups: 'Skupiny',
    },
    group: {
      pages: 'Stránky (★ = zdroj)',
      playersCount: 'Hráči: {count}',
      sourceHint: 'Zdrojová stránka je vzorem pro opravy.',
      summary: 'Souhrn',
      links: 'Propojené objekty',
      hidden: 'Skryté kopie',
      recycle: 'V koši',
      overrides: 'Vlastní nastavení',
      none: 'žádné',
      lastRepair: 'Poslední oprava {when}: odchýlené: {drifted}, znovu vytvořené: {recreated}.',
    },
    players: {
      none: 'V této hře zatím nejsou žádní hráči.',
      elsewhere: 'mimo tuto skupinu',
      visibility: 'Vybrané objekty: kliknutím je na stránce skryjete nebo zobrazíte',
      selectHint:
        'Vyberte tokeny a otevřete tuto kartu znovu, abyste je mohli skrývat nebo zobrazovat stránku po stránce.',
      shown: 'zobrazeno',
      hidden: 'skryto',
      layoutSaved: 'Uložené rozložení hráčů: {count}.',
      youAreOn: 'Jste na stránce {page}.',
    },
    status: {
      notLinked: 'nepropojeno',
      pageOnly: 'jen na této stránce',
      missing: 'chybí',
    },
    recycle: {
      empty: 'Koš je prázdný.',
      reasons: {
        delete: 'Smazání',
        repair: 'Oprava',
        exclude: 'Vyloučená vrstva',
        group: 'Odstraněná skupina',
      },
    },
    repair: {
      drifted: 'Odchýlené kopie',
      recreated: 'Znovu vytvořené chybějící kopie',
      removed: 'Odstraněné kopie (zdroj smazán)',
      dropped: 'Odstraněné prázdné vazby',
      mirrored: 'Zkopírované nové objekty',
      leftovers: 'Nové objekty na kopiích',
      pageSettings: 'Stránky s jiným nastavením',
      dryRunNote: 'Zatím se nic nezměnilo.',
      doneNote: 'Hotovo. Odstraněné objekty jsou v koši.',
    },
    age: {
      now: 'právě teď',
      minutes: 'před {count} min',
      hours: 'před {count} h',
      days: 'před {count} d',
    },
    types: {
      graphic: 'Token',
      text: 'Text',
      path: 'Kresba',
      pathv2: 'Kresba',
      door: 'Dveře',
      window: 'Okno',
    },
    values: {
      on: 'Zapnuto',
      off: 'Vypnuto',
      none: 'Žádné',
    },
    queries: {
      group: 'Skupina',
      groupName: 'Název skupiny',
      deleteGroup: 'Smazat skupinu {name}? Objekty zůstanou na svých stránkách.',
      resetSettings: 'Obnovit výchozí nastavení?',
      emptyRecycle: 'Vysypat koš? Tuto akci nelze vrátit.',
      yes: 'Ano',
      no: 'Ne',
    },
    buttons: {
      menu: 'Nabídka',
      group: 'Skupina',
      players: 'Hráči',
      repair: 'Opravit',
      repairNow: 'Opravit teď',
      dryRun: 'Náhled opravy',
      pause: 'Pozastavit',
      resume: 'Pokračovat',
      status: 'Stav',
      hideHere: 'Skrýt zde',
      showHere: 'Zobrazit zde',
      hideOthers: 'Skrýt na ostatních stránkách',
      showOthers: 'Zobrazit na ostatních stránkách',
      createGroup: 'Vytvořit skupinu z této stránky',
      addToGroup: 'Přidat tuto stránku do skupiny',
      removePage: 'Odebrat ze skupiny',
      makeSource: 'Nastavit jako zdroj',
      settings: 'Nastavení',
      groupSettings: 'Nastavení skupiny',
      recycle: 'Koš',
      undo: 'Zpět',
      help: 'Nápověda',
      rename: 'Přejmenovat',
      deleteGroup: 'Smazat skupinu',
      everyoneTo: 'Všichni na {page}',
      saveLayout: 'Uložit rozložení',
      restoreLayout: 'Obnovit rozložení',
      useGlobal: 'Použít globální',
      reset: 'Obnovit nastavení',
      restore: 'Obnovit',
      emptyRecycle: 'Vysypat',
      deleteEverywhere: 'Smazat všude',
      keepOthers: 'Ponechat ostatní',
      copy: 'Kopírovat',
      keepHere: 'Ponechat zde',
      copyAll: 'Kopírovat vše',
      keepAll: 'Ponechat vše zde',
      unlink: 'Odpojit',
      rebuild: 'Obnovit dokumenty',
    },
    settings: {
      deleteMode: 'Při smazání objektu',
      hideMode: 'Způsob skrývání kopií',
      pairLeftovers: 'Objekty bez protějšku',
      newObjects: 'Nové objekty',
      localProps: 'Vlastní pro stránku (tokeny)',
      localPageSettings: 'Vlastní pro stránku (nastavení stránky)',
      excludeLayers: 'Nesynchronizované vrstvy',
      syncPageSettings: 'Zrcadlit nastavení stránky',
      repairOnStart: 'Oprava při spuštění',
      playerMenu: 'Kdo smí otevřít kartu hráčů',
      recycleSize: 'Velikost koše',
      language: 'Jazyk',
      groupHint:
        'Tato nastavení platí jen pro tuto skupinu. „Použít globální“ se vrátí k hlavnímu nastavení.',
      override: 'tato skupina',
      global: 'globální',
    },
    settingsHelp: {
      deleteMode:
        'Všude: smazání na kterékoli stránce smaže všechny kopie. Jen zdrojová stránka: šíří se jen smazání na zdrojové stránce. Odpojit: nic se nešíří. Zeptat se: pošle volbu šeptem.',
      hideMode:
        'Vrstva PJ: kopie se přesune do vrstvy PJ. Odstranit: kopie se smaže a při zobrazení se vytvoří znovu, takže hráči nemají co najít.',
      pairLeftovers:
        'Když se stránka připojí ke skupině nebo se opravuje: zeptat se, zkopírovat je na ostatní stránky, nebo je nechat na jejich stránce.',
      newObjects:
        'Zrcadlit: kopírují se objekty vytvořené na kterékoli stránce. Jen zdroj: kopírují se jen objekty vytvořené na zdrojové stránce.',
      localProps:
        'Vlastnosti tokenů, které si každá stránka drží sama, například vidění pro jednoho hráče.',
      localPageSettings:
        'Nastavení stránky, která si každá stránka drží sama, například tma pro jednu skupinu hráčů.',
      excludeLayers: 'Objekty v těchto vrstvách zůstávají na své stránce.',
      syncPageSettings:
        'Kopírovat nastavení stránky (osvětlení, mřížka, velikost…) mezi stránkami skupiny.',
      repairOnStart: 'Při spuštění sandboxu: opravit potichu, opravit a ohlásit, nebo nedělat nic.',
      playerMenu: 'Jen PJ, nebo se i hráči mohou zeptat, na které stránce jsou.',
      recycleSize: 'Kolik odstranění si každá skupina uchová pro Zpět.',
      language: 'Jazyk nabídek, zpráv a dokumentů.',
    },
    options: {
      deleteMode: {
        all: 'Všude',
        source: 'Jen zdrojová stránka',
        unlink: 'Odpojit',
        ask: 'Zeptat se',
      },
      hideMode: { gmlayer: 'Vrstva PJ', remove: 'Odstranit' },
      pairLeftovers: { ask: 'Zeptat se', copy: 'Kopírovat', leave: 'Nechat' },
      newObjects: { mirror: 'Zrcadlit', sourceOnly: 'Jen zdroj' },
      localProps: {
        gmnotes: 'Poznámky PJ',
        name: 'Jméno',
        bars: 'Ukazatele',
        markers: 'Značky',
        tint: 'Tónování',
        aura: 'Aury',
        vision: 'Vidění',
        light: 'Světlo',
        controlledby: 'Ovládá',
      },
      localPageSettings: {
        lighting: 'Osvětlení',
        daylight: 'Denní světlo',
        explorer: 'Režim průzkumníka',
        fog: 'Mlha',
        grid: 'Mřížka',
        background: 'Pozadí',
        scale: 'Velikost a měřítko',
        jukebox: 'Jukebox',
      },
      excludeLayers: {
        map: 'Mapa',
        objects: 'Tokeny',
        gmlayer: 'PJ',
        foreground: 'Popředí',
        walls: 'Zdi',
      },
      repairOnStart: { quiet: 'Potichu', report: 'S hlášením', off: 'Vypnuto' },
      playerMenu: { gm: 'Jen PJ', players: 'I hráči' },
    },
    help: {
      menu: 'Otevře nabídku.',
      groupCreate: 'Vytvoří skupinu synchronizace z této stránky.',
      groupAdd:
        'Přidá tuto stránku do skupiny: odpovídající objekty se spárují, chybějící se zkopírují.',
      groupRemove: 'Vyjme tuto stránku z její skupiny. Objekty zůstanou, bez vazby.',
      groupShow: 'Zobrazí kartu skupiny.',
      groupRename: 'Přejmenuje skupinu.',
      groupSource: 'Nastaví tuto stránku jako zdroj skupiny (vzor pro opravy).',
      groupDelete: 'Smaže skupinu (nejprve se zeptá). Objekty zůstanou.',
      players:
        'Ukáže, kdo je na které stránce, s tlačítky pro přesun hráčů a pro skrytí nebo zobrazení vybraných tokenů na jednotlivých stránkách.',
      move: 'Přesune jednoho hráče na stránku (rozdělení družiny).',
      moveAll: 'Přesune všechny hráče ve skupině na jednu stránku a zapamatuje si, kde byli.',
      layout: 'Uloží nebo obnoví, na které stránce je každý hráč.',
      hide: 'Skryje kopie vybraných objektů: zde, na ostatních stránkách, všude nebo na zadaných stránkách.',
      show: 'Znovu zobrazí skryté kopie.',
      status: 'Ukáže vazby vybraných objektů a kde jsou skryté.',
      unlink: 'Ponechá vybrané objekty jen na této stránce.',
      repair: 'Srovná kopie se zdrojovou stránkou. --dry-run jen podá hlášení.',
      pause: 'Na čas zastaví zrcadlení skupiny.',
      resume: 'Znovu zapne zrcadlení; ukáže rozdíly.',
      undo: 'Vrátí poslední odstranění.',
      recycle: 'Vypíše odstranění a obnoví kterékoli z nich.',
      settings: 'Zobrazí nastavení, globální nebo pro jednu skupinu.',
      set: 'Změní nastavení. Seznamy přijímají +name nebo -name.',
      settingsReset: 'Obnoví výchozí nastavení (nejprve se zeptá).',
      handouts: 'Znovu vytvoří dokumenty s nápovědou a panelem příkazů.',
      help: 'Zobrazí tento seznam.',
      ids: 'Působí na tyto objekty místo vybraných.',
      page: 'Působí na tuto stránku místo té, kterou si prohlížíte.',
      footer: 'Dokument {help} vysvětluje vše; {deck} obsahuje tlačítka.',
    },
    deck: {
      menuTitle: 'Nabídka',
      menuDesc: 'Hlavní nabídka, hráči a nastavení.',
      groupsTitle: 'Skupiny',
      groupsDesc:
        'Vytvořte skupinu ze stránky, na které jste, nebo tuto stránku přidejte do skupiny.',
      selectedTitle: 'Vybrané objekty',
      selectedDesc: 'Skrytí nebo zobrazení kopií vybraných objektů.',
      toolsTitle: 'Nástroje',
      toolsDesc: 'Oprava, vrácení, pozastavení a dokumenty.',
      footer: 'Jak SyncPage funguje, najdete v {help}.',
    },
    handout: {
      versionLabel: 'Verze',
      subtitle: 'Propojené stránky pro rozdělenou družinu',
      footer: 'Tlačítka najdete v {deck}.',
      overview: {
        heading: 'Přehled',
        body: 'SyncPage udržuje stránky v souladu. Stránky ve skupině synchronizace sdílejí tokeny, kresby, zdi, dveře, okna, texty a nastavení stránky: co se změní na jedné stránce, změní se i na ostatních. Pomocí funkce Roll20 pro rozdělení družiny dáte hráče na různé kopie a pak na každé kopii zvlášť skryjete nebo zobrazíte věci, takže každý hráč vidí jen to, co má vidět jeho postava.',
        why: 'Roll20 neumí na jedné stránce skrýt objekt jen před některými hráči. Dynamické osvětlení dá každému tokenu vlastní vidění, ale ne „toto NPC je neviditelné jen pro zloděje“. Zrcadlené stránky to umí.',
      },
      quickStart: {
        heading: 'Rychlý start',
        steps: [
          'Přejděte na stránku s mapou, napište !syncpage a klikněte na „Vytvořit skupinu z této stránky“.',
          'Použijte na tu stránku funkci Roll20 Duplikovat stránku (nabídka karty stránky). Zkopíruje grafiku z marketplace, což API neumí.',
          'Přejděte na kopii a klikněte na „Přidat tuto stránku do skupiny“. SyncPage spáruje odpovídající objekty a zkopíruje vše, co chybí.',
          'Otevřete kartu Hráči a přesuňte hráče na kopii, pak vyberte tokeny a skryjte je na jedné stránce.',
        ],
      },
      mirroring: {
        heading: 'Co se zrcadlí',
        points: [
          'Tokeny (včetně světel Jumpgate), texty, kresby Legacy i Jumpgate, zdi všech druhů, dveře a okna.',
          'Nové objekty, změny a smazání, oběma směry. Smazání se řídí nastavením „Při smazání objektu“.',
          'Nastavení stránky, jako osvětlení, mřížka a velikost, pokud nejsou vypnutá nebo vlastní pro stránku.',
          'Vrstvy lze pro skupinu vynechat a vlastnosti tokenů, jako vidění, lze držet zvlášť pro každou stránku.',
          'Zrcadlí se i změny, které jiné Mody provedou přes TokenMod. Jiné Mody mohou volat SyncPage.notify; zbytek zachytí oprava.',
        ],
      },
      visibility: {
        heading: 'Skrývání po stránkách',
        points: [
          'Vyberte tokeny a použijte Skrýt zde, Skrýt na ostatních stránkách nebo mřížku na kartě Hráči.',
          'Skryje se jen kopie na té stránce. Změny z jiných stránek skrytí nikdy nezruší.',
          'Režim Vrstva PJ přesune kopii do vrstvy PJ. Režim Odstranit ji smaže a při zobrazení vytvoří znovu, takže na stránce nezůstane nic, co by hráči mohli najít.',
        ],
      },
      players: {
        heading: 'Hráči',
        points: [
          'Karta Hráči uvádí každého hráče a stránku, na které je, s tlačítkem pro každou stránku k jeho přesunu (rozdělení družiny).',
          '„Všichni na“ shromáždí hráče na jedné stránce a zapamatuje si, kde byli; „Obnovit rozložení“ je vrátí zpět.',
        ],
      },
      repair: {
        heading: 'Oprava',
        points: [
          'Oprava srovná kopie se zdrojovou stránkou: odchýlené vlastnosti, chybějící kopie, objekty smazané nebo vytvořené, když SyncPage nesledoval.',
          'Náhled opravy ukáže, co by se změnilo, aniž by cokoli měnil. Oprava, která by změnila mnoho objektů, se nejprve zeptá.',
          'Oprava proběhne potichu při spuštění sandboxu (nastavení). ID objektů zůstávají stejná, na rozdíl od 0.1.',
        ],
      },
      memory: {
        heading: 'Co si SyncPage pamatuje',
        points: [
          'Koš pro každou skupinu: každé šířené smazání a každý úklid lze vrátit tlačítkem Zpět.',
          'Kde byl každý hráč, aby šlo rozdělení obnovit.',
          'Naposledy použitou skupinu, poslední opravu a její výsledky.',
          'Tlačítka, která potřebují data, nesou krátký kód; fungují jednou a po 10 minutách vyprší.',
        ],
      },
      commands: {
        heading: 'Příkazy',
        intro: 'Jen pro PJ. Funguje i !sync.',
        colCommand: 'Příkaz',
        colDesc: 'Co dělá',
      },
      settings: {
        heading: 'Nastavení',
        intro:
          'Nastavení měňte na kartě nastavení nebo příkazem !syncpage set. Skupinová nastavení lze změnit pro jednu skupinu na její kartě.',
        colKey: 'Klíč',
        colName: 'Nastavení',
        colDesc: 'Význam',
        colScope: 'Rozsah',
        scopeGroup: 'Pro skupinu',
        scopeGlobal: 'Globální',
      },
      api: {
        heading: 'Pro jiné Mody',
        intro: 'Globální objekt SyncPage:',
        colFunction: 'Funkce',
        colDesc: 'Co dělá',
        rows: {
          getGroup: 'Skupina, ve které je stránka: id, název, zdroj a stránky.',
          getLinked: 'Propojené kopie objektu podle stránek.',
          notify: 'Zrcadlí změnu provedenou vaším Modem (změny přes API nevyvolávají události).',
          isHidden: 'Zda je kopie objektu na stránce skrytá.',
          onSync: 'Upozorní na každé zrcadlené vytvoření, změnu a smazání.',
          repair: 'Opraví skupinu; { dryRun: true } jen počítá.',
        },
      },
      upgrading: {
        heading: 'Přechod z 0.1',
        points: [
          'Stránka, jejíž název končí na „_synced“, se připojí do skupiny se stránkou stejného názvu bez této koncovky, která se stane zdrojem. Stránky pak můžete přejmenovat.',
          'Staré vazby zůstanou zachovány; vše ostatní se spáruje podle polohy a obrázku.',
          'Příznaky Show/Hide v Poznámkách PJ se stanou skrytými kopiemi a text příznaku se z Poznámek PJ odstraní.',
          'Vlastní příkaz ze staré konfigurace stále funguje. „True Copy“ už neexistuje: použijte Duplikovat stránku.',
        ],
      },
      troubleshooting: {
        heading: 'Řešení potíží',
        points: [
          'Token zkopírovaný se špatným obrázkem: API neumí kopírovat grafiku z marketplace. Vytvořte kopii funkcí Duplikovat stránku a přidejte ji do skupiny.',
          'Kopie se rozešly poté, co jiný Mod něco změnil: spusťte Opravit, nebo požádejte autora toho Modu, aby volal SyncPage.notify.',
          'Chcete záměrně přeuspořádat jednu kopii? Pozastavte skupinu, proveďte změny, pak klikněte na Pokračovat a zvolte, že opravovat nechcete.',
        ],
      },
      languages: {
        heading: 'Jazyky',
        body: 'Jazyk nastavte na kartě nastavení. Nabídky, zprávy a tyto dokumenty se jím řídí.',
        colLanguage: 'Jazyk',
        colNative: 'Původní název',
        colCode: 'Kód',
      },
      credits: {
        heading: 'Poděkování',
        original: 'Původní Mod od',
        maintainer: 'Přepsal a udržuje',
        support: 'Problémy prosím hlaste na fóru Roll20 nebo na GitHubu.',
      },
    },
  };

  var localeDa = {
    titles: {
      ready: 'SyncPage er klar.',
      group: 'Synkgruppe: {name}',
      players: 'Spillere: {name}',
      settings: 'SyncPage-indstillinger',
      groupSettings: 'Indstillinger for {name}',
      status: 'SyncPage-status',
      recycle: 'Papirkurv: {name}',
      dryRun: 'Forhåndsvisning af reparation: {name}',
      repaired: 'Repareret: {name}',
      repairedOnStart: 'SyncPage reparerede dine grupper',
      help: 'SyncPage-kommandoer',
      deleted: 'Slettet på én side',
      leftovers: 'Objekter uden modstykke',
      warning: 'SyncPage',
    },
    messages: {
      readyHint: 'Skriv !syncpage for at åbne menuen.',
      migrated:
        'Din SyncPage 0.1-opsætning blev overført: {groups} gruppe(r), {links} link(s) bevaret, {hidden} skjult(e) kopi(er). Sider, hvis navn ender på "_synced", kan nu omdøbes.',
      trueCopyGone:
        'Den gamle funktion "True Copy" findes ikke længere: brug Roll20\'s egen Dupliker side, og føj derefter kopien til en gruppe.',
      groupCreated:
        'Gruppen "{name}" blev lavet ud fra {page} med {count} objekt(er). Dupliker siden, og tilføj derefter kopien med "Føj siden til en gruppe".',
      pageAdded:
        '{page} kom med i "{name}": {paired} parret, {copied} kopieret, {failed} kunne ikke kopieres, {leftovers} uden modstykke.',
      pageRemoved: '{page} forlod "{name}". Dens objekter bliver, uden link.',
      groupDeleted: 'Gruppen "{name}" blev slettet. Objekterne bliver på deres sider.',
      notConfirmed: 'Intet blev ændret (ikke bekræftet).',
      hidden: 'Skjulte {count} kopi(er). {skipped} objekt(er) er ikke linket.',
      shown: 'Viste {count} kopi(er). {skipped} objekt(er) er ikke linket.',
      hideFallback:
        "{count} kopi(er) bruger et billede, som API'et ikke kan genskabe, så de blev flyttet til SL-laget i stedet for at blive fjernet.",
      deletedAsk: '{name} blev slettet på {page}. Kopierne på de andre sider er der stadig.',
      deletedEverywhere: 'Slettede {count} andre kopi(er). Fortryd lægger dem tilbage.',
      keptOthers: 'De andre kopier bliver.',
      restored: 'Gendannede {count} objekt(er). {failed} kunne ikke gendannes.',
      nothingToUndo: 'Der er intet at fortryde.',
      recycleEmptied: 'Papirkurven er tom.',
      leftovers:
        '{count} objekt(er) på {page} svarer ikke til noget i gruppen. Kopiere dem til de andre sider, eller beholde dem kun på denne side?',
      andMore: '…og {count} mere.',
      leftoversCopied: 'Kopierede {count} objekt(er) til de andre sider.',
      leftoversKept: 'Beholdt {count} objekt(er) kun på deres side.',
      imageNotCopied:
        "{name} på {page} bruger et billede, som API'et ikke kan kopiere (grafik fra markedspladsen). Brug Roll20's Dupliker side til at lave kopier med det, og føj derefter kopien til gruppen.",
      moved: '{player} blev flyttet til {page}.',
      movedAll:
        '{count} spiller(e) blev flyttet til {page}. "Gendan fordeling" flytter dem tilbage.',
      layoutSaved: 'Gemte, hvor {count} spiller(e) er.',
      layoutRestored: 'Flyttede {count} spiller(e) tilbage.',
      layoutReset: 'Den gemte fordeling blev ryddet.',
      unlinked: '{count} objekt(er) blev frakoblet. De bliver kun på denne side.',
      paused:
        'Spejlingen for "{name}" er sat på pause. Ændringer bliver på den side, hvor de laves, indtil du fortsætter.',
      resumed: 'Spejlingen for "{name}" er slået til igen. {count} forskel(le) fundet.',
      settingsReset: 'Indstillingerne er sat tilbage til standard.',
      resetMoved: 'Brug {command} for at gendanne standardindstillingerne.',
      handouts: 'Handouts Hjælp og Kommandopanel blev genopbygget.',
      pruned: 'Ryddet op: {links} tomme link(s), {pages} manglende side(r).',
      startRepair:
        '{name}: {drifted} afveget, {recreated} genskabt, {removed} fjernet, {mirrored} nye objekt(er) kopieret.',
    },
    errors: {
      hint: 'Skriv {command} help for at se kommandoerne.',
      gmOnly: 'Kun SL kan bruge SyncPage.',
      unknownCommand: 'Ukendt kommando: {command}.',
      unknownSetting: 'Ukendt indstilling: {key}.',
      badValue: '"{value}" er ikke en gyldig værdi for {key}.',
      globalOnly: '{key} gælder for alle grupper og kan ikke ændres for én enkelt.',
      noGroup: 'Ingen synkgruppe fundet for "{name}".',
      groupExists: 'Der findes allerede en gruppe ved navn "{name}".',
      noName: 'Angiv et navn.',
      pageInGroup: '{page} er allerede i gruppen "{group}".',
      pageNotInGroup: '{page} er ikke i gruppen "{name}".',
      nothingSelected: 'Vælg et eller flere objekter først.',
      noPage: 'Ingen side fundet for "{page}".',
      noPlayer: 'Ingen spiller fundet for "{player}".',
      requestExpired: 'Den knap er udløbet. Åbn kortet igen.',
      requestUnknown: 'Den knap er allerede brugt.',
    },
    menu: {
      thisPage: 'Denne side',
      group: 'Gruppe',
      source: 'kilde',
      copy: 'kopi',
      paused: 'På pause',
      notInGroup: 'Denne side er ikke i en synkgruppe.',
      duplicateHint:
        "Tip: lav en gruppe ud fra din kortside, brug Roll20's Dupliker side på den, gå til kopien og føj den til gruppen. Så beholder kopierne grafik fra markedspladsen.",
      selectedHint: 'Skjul og Vis virker på de valgte objekter.',
      groups: 'Grupper',
    },
    group: {
      pages: 'Sider (★ = kilde)',
      playersCount: '{count} spiller(e)',
      sourceHint: 'Kildesiden er referencen ved reparationer.',
      summary: 'Oversigt',
      links: 'Linkede objekter',
      hidden: 'Skjulte kopier',
      recycle: 'I papirkurven',
      overrides: 'Egne indstillinger',
      none: 'ingen',
      lastRepair: 'Seneste reparation {when}: {drifted} afveget, {recreated} genskabt.',
    },
    players: {
      none: 'Der er ingen spillere i dette spil endnu.',
      elsewhere: 'ikke i denne gruppe',
      visibility: 'Valgte objekter: klik for at skjule eller vise på en side',
      selectHint: 'Vælg tokens, og åbn dette kort igen for at skjule eller vise dem side for side.',
      shown: 'vist',
      hidden: 'skjult',
      layoutSaved: 'En fordeling med {count} spiller(e) er gemt.',
      youAreOn: 'Du er på {page}.',
    },
    status: {
      notLinked: 'ikke linket',
      pageOnly: 'kun på denne side',
      missing: 'mangler',
    },
    recycle: {
      empty: 'Papirkurven er tom.',
      reasons: {
        delete: 'Slettet',
        repair: 'Reparation',
        exclude: 'Udeladt lag',
        group: 'Gruppe fjernet',
      },
    },
    repair: {
      drifted: 'Kopier, der er afveget',
      recreated: 'Manglende kopier genskabt',
      removed: 'Kopier fjernet (kilde slettet)',
      dropped: 'Tomme links fjernet',
      mirrored: 'Nye objekter kopieret',
      leftovers: 'Nye objekter på kopier',
      pageSettings: 'Sider med andre indstillinger',
      dryRunNote: 'Intet er ændret endnu.',
      doneNote: 'Færdig. Fjernede objekter ligger i papirkurven.',
    },
    age: {
      now: 'lige nu',
      minutes: 'for {count} min. siden',
      hours: 'for {count} t. siden',
      days: 'for {count} dage siden',
    },
    types: {
      graphic: 'Token',
      text: 'Tekst',
      path: 'Tegning',
      pathv2: 'Tegning',
      door: 'Dør',
      window: 'Vindue',
    },
    values: {
      on: 'Til',
      off: 'Fra',
      none: 'Ingen',
    },
    queries: {
      group: 'Gruppe',
      groupName: 'Gruppenavn',
      deleteGroup: 'Slet gruppen {name}? Objekterne bliver på deres sider.',
      resetSettings: 'Gendan standardindstillingerne?',
      emptyRecycle: 'Tøm papirkurven? Det kan ikke fortrydes.',
      yes: 'Ja',
      no: 'Nej',
    },
    buttons: {
      menu: 'Menu',
      group: 'Gruppe',
      players: 'Spillere',
      repair: 'Reparer',
      repairNow: 'Reparer nu',
      dryRun: 'Forhåndsvis',
      pause: 'Pause',
      resume: 'Fortsæt',
      status: 'Status',
      hideHere: 'Skjul her',
      showHere: 'Vis her',
      hideOthers: 'Skjul på andre sider',
      showOthers: 'Vis på andre sider',
      createGroup: 'Lav gruppe af siden',
      addToGroup: 'Føj siden til en gruppe',
      removePage: 'Fjern fra gruppe',
      makeSource: 'Gør til kilde',
      settings: 'Indstillinger',
      groupSettings: 'Gruppeindstillinger',
      recycle: 'Papirkurv',
      undo: 'Fortryd',
      help: 'Hjælp',
      rename: 'Omdøb',
      deleteGroup: 'Slet gruppe',
      everyoneTo: 'Alle til {page}',
      saveLayout: 'Gem fordeling',
      restoreLayout: 'Gendan fordeling',
      useGlobal: 'Brug global',
      reset: 'Nulstil indstillinger',
      restore: 'Gendan',
      emptyRecycle: 'Tøm',
      deleteEverywhere: 'Slet overalt',
      keepOthers: 'Behold de andre',
      copy: 'Kopier',
      keepHere: 'Behold her',
      copyAll: 'Kopier alle',
      keepAll: 'Behold alle her',
      unlink: 'Frakobl',
      rebuild: 'Genopbyg handouts',
    },
    settings: {
      deleteMode: 'Når et objekt slettes',
      hideMode: 'Hvordan kopier skjules',
      pairLeftovers: 'Objekter uden modstykke',
      newObjects: 'Nye objekter',
      localProps: 'Pr. side (tokens)',
      localPageSettings: 'Pr. side (sideindstillinger)',
      excludeLayers: 'Lag der ikke synkes',
      syncPageSettings: 'Spejl sideindstillinger',
      repairOnStart: 'Reparer ved start',
      playerMenu: 'Hvem må åbne spillerkortet',
      recycleSize: 'Papirkurvens størrelse',
      language: 'Sprog',
      groupHint:
        'Indstillingerne her gælder kun for denne gruppe. "Brug global" går tilbage til hovedindstillingen.',
      override: 'denne gruppe',
      global: 'global',
    },
    settingsHelp: {
      deleteMode:
        'Overalt: sletter du på en side, slettes alle kopier. Kun kildesiden: kun sletninger på kildesiden spredes. Frakobl: spredes aldrig. Spørg: hvisker et valg.',
      hideMode:
        'SL-lag: kopien flyttes til SL-laget. Fjern: kopien slettes og laves igen, når den vises, så der intet er tilbage, som spillerne kan finde.',
      pairLeftovers:
        'Når en side kommer med i en gruppe eller repareres: spørg, kopier dem til de andre sider, eller lad dem blive på deres side.',
      newObjects:
        'Spejl: objekter, der laves på en side, kopieres. Kun kilden: kun objekter, der laves på kildesiden, kopieres.',
      localProps:
        'Token-egenskaber, som hver side beholder for sig selv, for eksempel syn for én spiller.',
      localPageSettings:
        'Sideindstillinger, som hver side beholder for sig selv, for eksempel mørke for én gruppe spillere.',
      excludeLayers: 'Objekter på disse lag bliver på deres egen side.',
      syncPageSettings: 'Kopier sideindstillinger (lys, gitter, størrelse…) mellem gruppens sider.',
      repairOnStart:
        'Når sandkassen starter: reparer stille, reparer og rapporter, eller gør intet.',
      playerMenu: 'Kun SL, eller spillere må spørge, hvilken side de er på.',
      recycleSize: 'Hvor mange fjernelser hver gruppe gemmer til Fortryd.',
      language: 'Sprog for menuer, beskeder og handouts.',
    },
    options: {
      deleteMode: { all: 'Overalt', source: 'Kun kildesiden', unlink: 'Frakobl', ask: 'Spørg' },
      hideMode: { gmlayer: 'SL-lag', remove: 'Fjern' },
      pairLeftovers: { ask: 'Spørg', copy: 'Kopier', leave: 'Lad blive' },
      newObjects: { mirror: 'Spejl', sourceOnly: 'Kun kilden' },
      localProps: {
        gmnotes: 'SL-noter',
        name: 'Navn',
        bars: 'Bjælker',
        markers: 'Markører',
        tint: 'Farvetone',
        aura: 'Auraer',
        vision: 'Syn',
        light: 'Lys',
        controlledby: 'Styres af',
      },
      localPageSettings: {
        lighting: 'Belysning',
        daylight: 'Dagslys',
        explorer: 'Opdagelsestilstand',
        fog: 'Tåge',
        grid: 'Gitter',
        background: 'Baggrund',
        scale: 'Størrelse og skala',
        jukebox: 'Jukeboks',
      },
      excludeLayers: {
        map: 'Kort',
        objects: 'Tokens',
        gmlayer: 'SL',
        foreground: 'Forgrund',
        walls: 'Vægge',
      },
      repairOnStart: { quiet: 'Stille', report: 'Med rapport', off: 'Fra' },
      playerMenu: { gm: 'Kun SL', players: 'Også spillere' },
    },
    help: {
      menu: 'Åbn menuen.',
      groupCreate: 'Lav en synkgruppe ud fra denne side.',
      groupAdd: 'Føj denne side til en gruppe: matchende objekter parres, manglende kopieres.',
      groupRemove: 'Tag denne side ud af sin gruppe. Objekterne bliver, uden link.',
      groupShow: 'Vis en gruppes kort.',
      groupRename: 'Omdøb en gruppe.',
      groupSource: 'Gør denne side til gruppens kilde (referencen ved reparationer).',
      groupDelete: 'Slet en gruppe (spørger først). Objekterne bliver.',
      players:
        'Vis, hvem der er på hvilken side, med knapper til at flytte dem og til at skjule eller vise de valgte tokens pr. side.',
      move: 'Flyt én spiller til en side (del gruppen).',
      moveAll: 'Flyt alle spillere i gruppen til én side, og husk, hvor de var.',
      layout: 'Husk eller gendan, hvilken side hver spiller er på.',
      hide: 'Skjul de valgte objekters kopier: her, på de andre sider, overalt eller på navngivne sider.',
      show: 'Vis skjulte kopier igen.',
      status: 'Vis de valgte objekters links, og hvor de er skjult.',
      unlink: 'Behold de valgte objekter kun på denne side.',
      repair: 'Bring kopierne i takt med kildesiden igen. --dry-run rapporterer kun.',
      pause: 'Stop spejlingen af en gruppe et stykke tid.',
      resume: 'Spejl igen; viser, hvad der er forskelligt.',
      undo: 'Læg den seneste fjernelse tilbage.',
      recycle: 'Vis fjernelser, og gendan en hvilken som helst af dem.',
      settings: 'Vis indstillingerne, globalt eller for én gruppe.',
      set: 'Skift en indstilling. Lister tager +name eller -name.',
      settingsReset: 'Gendan standardindstillingerne (spørger først).',
      handouts: 'Genopbyg handouts Hjælp og Kommandopanel.',
      help: 'Vis denne liste.',
      ids: 'Arbejd på disse objekter i stedet for de valgte.',
      page: 'Arbejd på denne side i stedet for den, du ser på.',
      footer: 'Handoutet {help} forklarer alt; {deck} har knapper.',
    },
    deck: {
      menuTitle: 'Menu',
      menuDesc: 'Hovedmenuen, spillere og indstillinger.',
      groupsTitle: 'Grupper',
      groupsDesc: 'Lav en gruppe ud fra den side, du er på, eller føj denne side til en gruppe.',
      selectedTitle: 'Valgte objekter',
      selectedDesc: 'Skjul eller vis de valgte objekters kopier.',
      toolsTitle: 'Værktøjer',
      toolsDesc: 'Reparation, fortryd, pause og handouts.',
      footer: 'Se {help} for, hvordan SyncPage virker.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Linkede sider til delte grupper',
      footer: 'Åbn {deck} for knapper.',
      overview: {
        heading: 'Oversigt',
        body: "SyncPage holder sider i takt. Sider i en synkgruppe deler tokens, tegninger, vægge, døre, vinduer, tekst og sideindstillinger: det, der ændres på én side, ændres på de andre. Med Roll20's del gruppen sætter du spillere på forskellige kopier og skjuler eller viser så ting pr. kopi, så hver spiller kun ser det, deres karakter skal se.",
        why: 'Roll20 kan ikke skjule et objekt for kun nogle spillere på én side. Dynamisk lys giver hver token sit eget syn, men ikke "denne NPC er usynlig kun for tyven". Spejlede sider kan det.',
      },
      quickStart: {
        heading: 'Kom hurtigt i gang',
        steps: [
          'Gå til din kortside, skriv !syncpage, og klik på "Lav gruppe af siden".',
          "Brug Roll20's Dupliker side på den side (sidekortets menu). Den kopierer grafik fra markedspladsen, hvilket API'et ikke kan.",
          'Gå til kopien, og klik på "Føj siden til en gruppe". SyncPage parrer de objekter, der matcher, og kopierer alt, der mangler.',
          'Åbn Spillere for at flytte spillere til kopien, vælg så tokens, og skjul dem på én side.',
        ],
      },
      mirroring: {
        heading: 'Hvad der spejles',
        points: [
          'Tokens (også Jumpgate-lys), tekst, Legacy- og Jumpgate-tegninger, vægge af alle slags, døre og vinduer.',
          'Nye objekter, ændringer og sletninger, begge veje. Sletninger følger indstillingen "Når et objekt slettes".',
          'Sideindstillinger som lys, gitter og størrelse, medmindre de er slået fra eller beholdes pr. side.',
          'Lag kan udelades pr. gruppe, og token-egenskaber som syn kan beholdes pr. side.',
          'Ændringer, som andre Mods laver via TokenMod, spejles også. Andre Mods kan kalde SyncPage.notify; reparation fanger resten.',
        ],
      },
      visibility: {
        heading: 'Skjul pr. side',
        points: [
          'Vælg tokens, og brug Skjul her, Skjul på andre sider eller gitteret på Spillere-kortet.',
          'Kun den sides kopi skjules. Ændringer fra andre sider ophæver aldrig skjulningen.',
          'Tilstanden SL-lag flytter kopien til SL-laget. Tilstanden Fjern sletter den og laver den igen, når den vises, så der intet er tilbage på siden, som spillerne kan finde.',
        ],
      },
      players: {
        heading: 'Spillere',
        points: [
          'Spillere-kortet viser hver spiller og den side, de er på, med en knap pr. side til at flytte dem (del gruppen).',
          '"Alle til" samler spillerne på én side og husker, hvor de var; "Gendan fordeling" flytter dem tilbage.',
        ],
      },
      repair: {
        heading: 'Reparation',
        points: [
          'Reparation bringer kopierne i takt med kildesiden igen: afvigende egenskaber, manglende kopier, objekter slettet eller lavet, mens SyncPage ikke holdt øje.',
          'Forhåndsvis viser, hvad der ville blive ændret, uden at ændre noget. En reparation, der ville ændre mange objekter, spørger først.',
          "Reparation kører stille, når sandkassen starter (indstilling). Objekt-id'er forbliver de samme, i modsætning til 0.1.",
        ],
      },
      memory: {
        heading: 'Hvad SyncPage husker',
        points: [
          'En papirkurv pr. gruppe: hver sletning, der spredes, og hver oprydning kan lægges tilbage med Fortryd.',
          'Hvor hver spiller var, så en opdeling kan gendannes.',
          'Den seneste gruppe, du brugte, den seneste reparation og dens resultater.',
          'Knapper, der skal bruge data, har en kort kode; de virker én gang og udløber efter 10 minutter.',
        ],
      },
      commands: {
        heading: 'Kommandoer',
        intro: 'Kun SL. !sync virker også.',
        colCommand: 'Kommando',
        colDesc: 'Hvad den gør',
      },
      settings: {
        heading: 'Indstillinger',
        intro:
          'Skift indstillinger på indstillingskortet eller med !syncpage set. Gruppeindstillinger kan ændres for én gruppe på dens kort.',
        colKey: 'Nøgle',
        colName: 'Indstilling',
        colDesc: 'Betydning',
        colScope: 'Omfang',
        scopeGroup: 'Pr. gruppe',
        scopeGlobal: 'Global',
      },
      api: {
        heading: 'Til andre Mods',
        intro: 'Det globale SyncPage-objekt:',
        colFunction: 'Funktion',
        colDesc: 'Hvad den gør',
        rows: {
          getGroup: 'Den gruppe, en side er i: id, navn, kilde og sider.',
          getLinked: 'Et objekts linkede kopier, pr. side.',
          notify:
            'Spejl en ændring, som dit Mod har lavet (API-ændringer udløser ingen hændelser).',
          isHidden: 'Om et objekts kopi er skjult på en side.',
          onSync: 'Få besked om hver spejlet oprettelse, ændring og sletning.',
          repair: 'Reparer en gruppe; { dryRun: true } tæller kun.',
        },
      },
      upgrading: {
        heading: 'Opgradering fra 0.1',
        points: [
          'En side, hvis navn ender på "_synced", kommer i gruppe med siden med samme navn uden endelsen, og den bliver kilden. Du kan omdøbe siderne bagefter.',
          'Gamle links bevares; alt andet parres efter placering og billede.',
          'Show/Hide-flag i SL-noter bliver til skjulte kopier, og flagteksten fjernes fra SL-noterne.',
          'En egen kommando fra den gamle konfiguration virker stadig. "True Copy" findes ikke længere: brug Dupliker side.',
        ],
      },
      troubleshooting: {
        heading: 'Fejlfinding',
        points: [
          "En token blev kopieret med det forkerte billede: API'et kan ikke kopiere grafik fra markedspladsen. Lav kopien med Dupliker side, og føj den til gruppen.",
          'Kopier ude af takt, efter et andet Mod har ændret noget: kør Reparer, eller bed det Mods forfatter om at kalde SyncPage.notify.',
          'Vil du med vilje ændre én kopi? Sæt gruppen på pause, lav ændringerne, vælg så Fortsæt, og vælg ikke at reparere.',
        ],
      },
      languages: {
        heading: 'Sprog',
        body: 'Vælg sproget på indstillingskortet. Menuer, beskeder og disse handouts følger det.',
        colLanguage: 'Sprog',
        colNative: 'Eget navn',
        colCode: 'Kode',
      },
      credits: {
        heading: 'Tak til',
        original: 'Oprindeligt Mod af',
        maintainer: 'Omskrevet og vedligeholdt af',
        support: 'Rapporter problemer på Roll20-forummet eller GitHub.',
      },
    },
  };

  var localeNl = {
    titles: {
      ready: 'SyncPage is klaar.',
      group: 'Sync-groep: {name}',
      players: 'Spelers: {name}',
      settings: 'SyncPage-instellingen',
      groupSettings: 'Instellingen voor {name}',
      status: 'SyncPage-status',
      recycle: 'Prullenbak: {name}',
      dryRun: 'Voorbeeld van herstel: {name}',
      repaired: 'Hersteld: {name}',
      repairedOnStart: 'SyncPage heeft uw groepen hersteld',
      help: 'SyncPage-opdrachten',
      deleted: 'Verwijderd op één pagina',
      leftovers: 'Objecten zonder tegenhanger',
      warning: 'SyncPage',
    },
    messages: {
      readyHint: 'Typ !syncpage om het menu te openen.',
      migrated:
        'Uw instellingen van SyncPage 0.1 zijn overgenomen: {groups} groep(en), {links} koppeling(en) behouden, {hidden} verborgen kopie(ën). Pagina\'s waarvan de naam eindigt op "_synced" kunnen nu worden hernoemd.',
      trueCopyGone:
        'De oude functie "True Copy" bestaat niet meer: gebruik "Pagina dupliceren" van Roll20 en voeg de kopie daarna toe aan een groep.',
      groupCreated:
        'Groep "{name}" gemaakt van {page}, met {count} object(en). Dupliceer de pagina en voeg de kopie daarna toe met "Deze pagina aan een groep toevoegen".',
      pageAdded:
        '{page} is bij "{name}" gekomen: {paired} gekoppeld, {copied} gekopieerd, {failed} niet te kopiëren, {leftovers} zonder tegenhanger.',
      pageRemoved: '{page} heeft "{name}" verlaten. De objecten blijven, ontkoppeld.',
      groupDeleted: 'Groep "{name}" verwijderd. De objecten blijven op hun pagina\'s.',
      notConfirmed: 'Er is niets gewijzigd (niet bevestigd).',
      hidden: '{count} kopie(ën) verborgen. {skipped} object(en) zijn niet gekoppeld.',
      shown: '{count} kopie(ën) getoond. {skipped} object(en) zijn niet gekoppeld.',
      hideFallback:
        '{count} kopie(ën) gebruiken een afbeelding die de API niet opnieuw kan maken. Ze zijn daarom naar de SL-laag verplaatst in plaats van verwijderd.',
      deletedAsk: "{name} is verwijderd op {page}. De kopieën op de andere pagina's zijn er nog.",
      deletedEverywhere: '{count} andere kopie(ën) verwijderd. "Ongedaan maken" zet ze terug.',
      keptOthers: 'De andere kopieën blijven.',
      restored: '{count} object(en) teruggezet. {failed} konden niet worden teruggezet.',
      nothingToUndo: 'Er is niets om ongedaan te maken.',
      recycleEmptied: 'De prullenbak is leeg.',
      leftovers:
        "{count} object(en) op {page} hebben geen tegenhanger in de groep. Naar de andere pagina's kopiëren of alleen op deze pagina houden?",
      andMore: '…en nog {count}.',
      leftoversCopied: "{count} object(en) naar de andere pagina's gekopieerd.",
      leftoversKept: '{count} object(en) alleen op hun eigen pagina gehouden.',
      imageNotCopied:
        '{name} op {page} gebruikt een afbeelding die de API niet kan kopiëren (Marketplace-afbeelding). Gebruik "Pagina dupliceren" van Roll20 om er kopieën mee te maken en voeg de kopie daarna toe aan de groep.',
      moved: '{player} is naar {page} verplaatst.',
      movedAll: '{count} speler(s) naar {page} verplaatst. "Indeling herstellen" zet ze terug.',
      layoutSaved: 'Onthouden waar {count} speler(s) zijn.',
      layoutRestored: '{count} speler(s) teruggezet.',
      layoutReset: 'De onthouden indeling is gewist.',
      unlinked: '{count} object(en) ontkoppeld. Ze blijven alleen op deze pagina.',
      paused:
        'Spiegelen voor "{name}" is gepauzeerd. Wijzigingen blijven op de pagina waar ze worden gemaakt totdat u hervat.',
      resumed: 'Spiegelen voor "{name}" staat weer aan. {count} verschil(len) gevonden.',
      settingsReset: 'Instellingen teruggezet naar de standaardwaarden.',
      resetMoved: 'Gebruik {command} om de standaardinstellingen terug te zetten.',
      handouts: 'De handouts Help en Command Deck zijn opnieuw opgebouwd.',
      pruned: "Opgeruimd: {links} lege koppeling(en), {pages} ontbrekende pagina('s).",
      startRepair:
        '{name}: {drifted} afgeweken, {recreated} opnieuw gemaakt, {removed} verwijderd, {mirrored} nieuw(e) object(en) gekopieerd.',
    },
    errors: {
      hint: 'Typ {command} help voor de opdrachten.',
      gmOnly: 'Alleen de spelleider kan SyncPage gebruiken.',
      unknownCommand: 'Onbekende opdracht: {command}.',
      unknownSetting: 'Onbekende instelling: {key}.',
      badValue: '"{value}" is geen geldige waarde voor {key}.',
      globalOnly: '{key} geldt voor alle groepen en kan niet voor één groep worden gewijzigd.',
      noGroup: 'Geen sync-groep gevonden voor "{name}".',
      groupExists: 'Er is al een groep met de naam "{name}".',
      noName: 'Geef een naam op.',
      pageInGroup: '{page} zit al in de groep "{group}".',
      pageNotInGroup: '{page} zit niet in de groep "{name}".',
      nothingSelected: 'Selecteer eerst een of meer objecten.',
      noPage: 'Geen pagina gevonden voor "{page}".',
      noPlayer: 'Geen speler gevonden voor "{player}".',
      requestExpired: 'Die knop is verlopen. Open de kaart opnieuw.',
      requestUnknown: 'Die knop is al gebruikt.',
    },
    menu: {
      thisPage: 'Deze pagina',
      group: 'Groep',
      source: 'bron',
      copy: 'kopie',
      paused: 'Gepauzeerd',
      notInGroup: 'Deze pagina zit niet in een sync-groep.',
      duplicateHint:
        'Tip: maak een groep van uw kaartpagina, gebruik daarop "Pagina dupliceren" van Roll20, ga naar de kopie en voeg die toe aan de groep. Zo behouden kopieën hun Marketplace-afbeeldingen.',
      selectedHint: 'Verbergen en Tonen werken op de geselecteerde objecten.',
      groups: 'Groepen',
    },
    group: {
      pages: "Pagina's (★ = bron)",
      playersCount: '{count} speler(s)',
      sourceHint: 'De bronpagina is de referentie voor herstel.',
      summary: 'Overzicht',
      links: 'Gekoppelde objecten',
      hidden: 'Verborgen kopieën',
      recycle: 'In de prullenbak',
      overrides: 'Eigen instellingen',
      none: 'geen',
      lastRepair: 'Laatste herstel {when}: {drifted} afgeweken, {recreated} opnieuw gemaakt.',
    },
    players: {
      none: 'Er zijn nog geen spelers in dit spel.',
      elsewhere: 'niet in deze groep',
      visibility: 'Geselecteerde objecten: klik om op een pagina te verbergen of te tonen',
      selectHint:
        'Selecteer tokens en open deze kaart opnieuw om ze per pagina te verbergen of te tonen.',
      shown: 'getoond',
      hidden: 'verborgen',
      layoutSaved: 'Een indeling van {count} speler(s) is onthouden.',
      youAreOn: 'U bent op {page}.',
    },
    status: {
      notLinked: 'niet gekoppeld',
      pageOnly: 'alleen op deze pagina',
      missing: 'ontbreekt',
    },
    recycle: {
      empty: 'De prullenbak is leeg.',
      reasons: {
        delete: 'Verwijderd',
        repair: 'Herstel',
        exclude: 'Uitgesloten laag',
        group: 'Groep verwijderd',
      },
    },
    repair: {
      drifted: 'Afgeweken kopieën',
      recreated: 'Ontbrekende kopieën opnieuw gemaakt',
      removed: 'Kopieën verwijderd (bron verwijderd)',
      dropped: 'Lege koppelingen opgeruimd',
      mirrored: 'Nieuwe objecten gekopieerd',
      leftovers: 'Nieuwe objecten op kopieën',
      pageSettings: "Pagina's met andere instellingen",
      dryRunNote: 'Er is nog niets gewijzigd.',
      doneNote: 'Klaar. Verwijderde objecten staan in de prullenbak.',
    },
    age: {
      now: 'zojuist',
      minutes: '{count} min geleden',
      hours: '{count} u geleden',
      days: '{count} dagen geleden',
    },
    types: {
      graphic: 'Token',
      text: 'Tekst',
      path: 'Tekening',
      pathv2: 'Tekening',
      door: 'Deur',
      window: 'Raam',
    },
    values: {
      on: 'Aan',
      off: 'Uit',
      none: 'Geen',
    },
    queries: {
      group: 'Groep',
      groupName: 'Groepsnaam',
      deleteGroup: "De groep {name} verwijderen? De objecten blijven op hun pagina's.",
      resetSettings: 'De standaardinstellingen terugzetten?',
      emptyRecycle: 'De prullenbak legen? Dit kan niet ongedaan worden gemaakt.',
      yes: 'Ja',
      no: 'Nee',
    },
    buttons: {
      menu: 'Menu',
      group: 'Groep',
      players: 'Spelers',
      repair: 'Herstellen',
      repairNow: 'Nu herstellen',
      dryRun: 'Voorbeeld herstel',
      pause: 'Pauzeren',
      resume: 'Hervatten',
      status: 'Status',
      hideHere: 'Hier verbergen',
      showHere: 'Hier tonen',
      hideOthers: 'Elders verbergen',
      showOthers: 'Elders tonen',
      createGroup: 'Groep van deze pagina maken',
      addToGroup: 'Deze pagina aan een groep toevoegen',
      removePage: 'Uit groep halen',
      makeSource: 'Bron maken',
      settings: 'Instellingen',
      groupSettings: 'Groepsinstellingen',
      recycle: 'Prullenbak',
      undo: 'Ongedaan maken',
      help: 'Help',
      rename: 'Hernoemen',
      deleteGroup: 'Groep verwijderen',
      everyoneTo: 'Iedereen naar {page}',
      saveLayout: 'Indeling opslaan',
      restoreLayout: 'Indeling herstellen',
      useGlobal: 'Globaal gebruiken',
      reset: 'Instellingen resetten',
      restore: 'Terugzetten',
      emptyRecycle: 'Legen',
      deleteEverywhere: 'Overal verwijderen',
      keepOthers: 'Andere houden',
      copy: 'Kopiëren',
      keepHere: 'Hier houden',
      copyAll: 'Alles kopiëren',
      keepAll: 'Alles hier houden',
      unlink: 'Ontkoppelen',
      rebuild: 'Handouts herbouwen',
    },
    settings: {
      deleteMode: 'Als een object wordt verwijderd',
      hideMode: 'Hoe kopieën worden verborgen',
      pairLeftovers: 'Objecten zonder tegenhanger',
      newObjects: 'Nieuwe objecten',
      localProps: 'Per pagina behouden (tokens)',
      localPageSettings: 'Per pagina behouden (pagina-instellingen)',
      excludeLayers: 'Niet gesynchroniseerde lagen',
      syncPageSettings: 'Pagina-instellingen spiegelen',
      repairOnStart: 'Herstellen bij opstarten',
      playerMenu: 'Wie de spelerskaart mag openen',
      recycleSize: 'Grootte van de prullenbak',
      language: 'Taal',
      groupHint:
        'Deze instellingen gelden alleen voor deze groep. "Globaal gebruiken" gaat terug naar de hoofdinstelling.',
      override: 'deze groep',
      global: 'globaal',
    },
    settingsHelp: {
      deleteMode:
        'Overal: verwijderen op een willekeurige pagina verwijdert elke kopie. Alleen bronpagina: alleen verwijderingen op de bronpagina worden doorgegeven. Ontkoppelen: nooit doorgeven. Vragen: een keuze wordt gefluisterd.',
      hideMode:
        'SL-laag: de kopie gaat naar de SL-laag. Verwijderen: de kopie wordt verwijderd en bij tonen opnieuw gemaakt, zodat spelers niets kunnen vinden.',
      pairLeftovers:
        "Als een pagina bij een groep komt of wordt hersteld: vragen, naar de andere pagina's kopiëren of op hun pagina laten.",
      newObjects:
        'Spiegelen: objecten die op een willekeurige pagina worden gemaakt, worden gekopieerd. Alleen bron: alleen objecten van de bronpagina worden gekopieerd.',
      localProps:
        'Token-eigenschappen die elke pagina voor zichzelf houdt, zoals het zicht voor één speler.',
      localPageSettings:
        'Pagina-instellingen die elke pagina voor zichzelf houdt, zoals de duisternis voor één groep spelers.',
      excludeLayers: 'Objecten op deze lagen blijven op hun eigen pagina.',
      syncPageSettings:
        "Pagina-instellingen (belichting, raster, grootte…) kopiëren tussen de pagina's van de groep.",
      repairOnStart: 'Als de sandbox start: stil herstellen, herstellen en melden, of niets doen.',
      playerMenu: 'Alleen SL, of spelers mogen vragen op welke pagina ze zijn.',
      recycleSize: 'Hoeveel verwijderingen elke groep bewaart voor "Ongedaan maken".',
      language: "Taal van menu's, berichten en handouts.",
    },
    options: {
      deleteMode: {
        all: 'Overal',
        source: 'Alleen bronpagina',
        unlink: 'Ontkoppelen',
        ask: 'Vragen',
      },
      hideMode: { gmlayer: 'SL-laag', remove: 'Verwijderen' },
      pairLeftovers: { ask: 'Vragen', copy: 'Kopiëren', leave: 'Laten' },
      newObjects: { mirror: 'Spiegelen', sourceOnly: 'Alleen bron' },
      localProps: {
        gmnotes: 'SL-notities',
        name: 'Naam',
        bars: 'Balken',
        markers: 'Markeringen',
        tint: 'Tint',
        aura: "Aura's",
        vision: 'Zicht',
        light: 'Licht',
        controlledby: 'Bestuurd door',
      },
      localPageSettings: {
        lighting: 'Belichting',
        daylight: 'Daglicht',
        explorer: 'Verkenningsmodus',
        fog: 'Mist',
        grid: 'Raster',
        background: 'Achtergrond',
        scale: 'Grootte en schaal',
        jukebox: 'Jukebox',
      },
      excludeLayers: {
        map: 'Kaart',
        objects: 'Tokens',
        gmlayer: 'SL',
        foreground: 'Voorgrond',
        walls: 'Muren',
      },
      repairOnStart: { quiet: 'Stil', report: 'Met melding', off: 'Uit' },
      playerMenu: { gm: 'Alleen SL', players: 'Ook spelers' },
    },
    help: {
      menu: 'Het menu openen.',
      groupCreate: 'Een sync-groep van deze pagina maken.',
      groupAdd:
        'Deze pagina aan een groep toevoegen: passende objecten worden gekoppeld, ontbrekende gekopieerd.',
      groupRemove: 'Deze pagina uit haar groep halen. De objecten blijven, ontkoppeld.',
      groupShow: 'De kaart van een groep tonen.',
      groupRename: 'Een groep hernoemen.',
      groupSource: 'Deze pagina de bron van de groep maken (de referentie voor herstel).',
      groupDelete: 'Een groep verwijderen (vraagt eerst). De objecten blijven.',
      players:
        'Tonen wie op welke pagina is, met knoppen om spelers te verplaatsen en om de geselecteerde tokens per pagina te verbergen of te tonen.',
      move: 'Eén speler naar een pagina verplaatsen (groep splitsen).',
      moveAll: 'Alle spelers van de groep naar één pagina verplaatsen en onthouden waar ze waren.',
      layout: 'Onthouden of herstellen op welke pagina elke speler is.',
      hide: "De kopieën van de geselecteerde objecten verbergen: hier, op de andere pagina's, overal of op genoemde pagina's.",
      show: 'Verborgen kopieën weer tonen.',
      status: 'De koppelingen van de geselecteerde objecten tonen en waar ze verborgen zijn.',
      unlink: 'De geselecteerde objecten alleen op deze pagina houden.',
      repair: 'Kopieën weer gelijktrekken met de bronpagina. --dry-run meldt alleen.',
      pause: 'Het spiegelen van een groep een tijdje stoppen.',
      resume: 'Weer spiegelen; toont wat verschilt.',
      undo: 'De laatste verwijdering terugzetten.',
      recycle: 'Verwijderingen tonen en er een willekeurige van terugzetten.',
      settings: 'De instellingen tonen, globaal of voor één groep.',
      set: 'Een instelling wijzigen. Lijsten accepteren +name of -name.',
      settingsReset: 'De standaardinstellingen terugzetten (vraagt eerst).',
      handouts: 'De handouts Help en Command Deck opnieuw opbouwen.',
      help: 'Deze lijst tonen.',
      ids: 'Op deze objecten werken in plaats van op de geselecteerde.',
      page: 'Op deze pagina werken in plaats van op de pagina die u bekijkt.',
      footer: 'De handout {help} legt alles uit; {deck} heeft knoppen.',
    },
    deck: {
      menuTitle: 'Menu',
      menuDesc: 'Het hoofdmenu, de spelers en de instellingen.',
      groupsTitle: 'Groepen',
      groupsDesc:
        'Een groep maken van de pagina waarop u bent, of deze pagina aan een groep toevoegen.',
      selectedTitle: 'Geselecteerde objecten',
      selectedDesc: 'De kopieën van de geselecteerde objecten verbergen of tonen.',
      toolsTitle: 'Hulpmiddelen',
      toolsDesc: 'Herstellen, ongedaan maken, pauzeren en handouts.',
      footer: 'Zie {help} voor hoe SyncPage werkt.',
    },
    handout: {
      versionLabel: 'Versie',
      subtitle: "Gekoppelde pagina's voor gesplitste groepen",
      footer: 'Open {deck} voor knoppen.',
      overview: {
        heading: 'Overzicht',
        body: "SyncPage houdt pagina's gelijk. Pagina's in een sync-groep delen hun tokens, tekeningen, muren, deuren, ramen, tekst en pagina-instellingen: wat op één pagina verandert, verandert op de andere. Met de functie split party van Roll20 zet u spelers op verschillende kopieën en verbergt of toont u dingen per kopie, zodat elke speler alleen ziet wat zijn personage hoort te zien.",
        why: 'Roll20 kan op één pagina een object niet voor slechts enkele spelers verbergen. Dynamische belichting geeft elk token zijn eigen zicht, maar niet "deze NPC is alleen voor de schurk onzichtbaar". Gespiegelde pagina\'s kunnen dat wel.',
      },
      quickStart: {
        heading: 'Snel aan de slag',
        steps: [
          'Ga naar uw kaartpagina, typ !syncpage en klik daarna op "Groep van deze pagina maken".',
          'Gebruik "Pagina dupliceren" van Roll20 op die pagina (het menu van de paginakaart). Dat kopieert Marketplace-afbeeldingen, wat de API niet kan.',
          'Ga naar de kopie en klik op "Deze pagina aan een groep toevoegen". SyncPage koppelt de objecten die overeenkomen en kopieert alles wat ontbreekt.',
          'Open Spelers om spelers naar de kopie te verplaatsen. Selecteer daarna tokens en verberg ze op één pagina.',
        ],
      },
      mirroring: {
        heading: 'Wat wordt gespiegeld',
        points: [
          'Tokens (ook Jumpgate-lichten), tekst, Legacy- en Jumpgate-tekeningen, muren van elke soort, deuren en ramen.',
          'Nieuwe objecten, wijzigingen en verwijderingen, in beide richtingen. Verwijderingen volgen de instelling "Als een object wordt verwijderd".',
          'Pagina-instellingen zoals belichting, raster en grootte, tenzij uitgeschakeld of per pagina behouden.',
          'Lagen kunnen per groep worden uitgesloten, en token-eigenschappen zoals zicht kunnen per pagina worden behouden.',
          'Wijzigingen die andere Mods via TokenMod maken, worden ook gespiegeld. Andere Mods kunnen SyncPage.notify aanroepen; herstel vangt de rest op.',
        ],
      },
      visibility: {
        heading: 'Verbergen per pagina',
        points: [
          'Selecteer tokens en gebruik Hier verbergen, Elders verbergen of het raster op de spelerskaart.',
          "Alleen de kopie op die pagina wordt verborgen. Wijzigingen van andere pagina's maken het verbergen nooit ongedaan.",
          'De modus SL-laag verplaatst de kopie naar de SL-laag. De modus Verwijderen verwijdert de kopie en maakt die bij tonen opnieuw, zodat spelers niets op de pagina kunnen vinden.',
        ],
      },
      players: {
        heading: 'Spelers',
        points: [
          'De spelerskaart toont elke speler en de pagina waarop die is, met een knop per pagina om hem te verplaatsen (groep splitsen).',
          '"Iedereen naar" brengt de spelers samen op één pagina en onthoudt waar ze waren; "Indeling herstellen" zet ze terug.',
        ],
      },
      repair: {
        heading: 'Herstel',
        points: [
          'Herstel trekt de kopieën weer gelijk met de bronpagina: afgeweken eigenschappen, ontbrekende kopieën, objecten die werden verwijderd of gemaakt terwijl SyncPage niet meekeek.',
          'Voorbeeld herstel toont wat er zou veranderen, zonder iets te veranderen. Een herstel dat veel objecten zou wijzigen, vraagt eerst.',
          "Herstel draait stil als de sandbox start (instelling). Object-ID's blijven hetzelfde, anders dan bij 0.1.",
        ],
      },
      memory: {
        heading: 'Wat SyncPage onthoudt',
        points: [
          'Een prullenbak per groep: elke doorgegeven verwijdering en elke opruiming kan met "Ongedaan maken" worden teruggezet.',
          'Waar elke speler was, zodat een splitsing kan worden hersteld.',
          'De laatst gebruikte groep, het laatste herstel en de resultaten ervan.',
          'Knoppen die gegevens nodig hebben, dragen een korte code; ze werken één keer en verlopen na 10 minuten.',
        ],
      },
      commands: {
        heading: 'Opdrachten',
        intro: 'Alleen voor de SL. !sync werkt ook.',
        colCommand: 'Opdracht',
        colDesc: 'Wat het doet',
      },
      settings: {
        heading: 'Instellingen',
        intro:
          'Wijzig instellingen op de instellingenkaart of met !syncpage set. Groepsinstellingen kunnen op de kaart van een groep voor alleen die groep worden gewijzigd.',
        colKey: 'Sleutel',
        colName: 'Instelling',
        colDesc: 'Betekenis',
        colScope: 'Bereik',
        scopeGroup: 'Per groep',
        scopeGlobal: 'Globaal',
      },
      api: {
        heading: 'Voor andere Mods',
        intro: 'Het globale object SyncPage:',
        colFunction: 'Functie',
        colDesc: 'Wat het doet',
        rows: {
          getGroup: "De groep waarin een pagina zit: id, naam, bron en pagina's.",
          getLinked: 'De gekoppelde kopieën van een object, per pagina.',
          notify:
            'Een wijziging van uw Mod spiegelen (API-wijzigingen veroorzaken geen gebeurtenissen).',
          isHidden: 'Of de kopie van een object op een pagina verborgen is.',
          onSync: 'Een melding krijgen van elke gespiegelde aanmaak, wijziging en verwijdering.',
          repair: 'Een groep herstellen; { dryRun: true } telt alleen.',
        },
      },
      upgrading: {
        heading: 'Upgraden vanaf 0.1',
        points: [
          'Een pagina waarvan de naam eindigt op "_synced" komt in een groep met de pagina met dezelfde naam zonder die toevoeging, die de bron wordt. U kunt de pagina\'s daarna hernoemen.',
          'Oude koppelingen blijven behouden; al het andere wordt gekoppeld op positie en afbeelding.',
          'Show/Hide-markeringen in de SL-notities worden verborgen kopieën, en de markeringstekst wordt uit de SL-notities verwijderd.',
          'Een eigen opdracht uit de oude configuratie werkt nog steeds. "True Copy" bestaat niet meer: gebruik "Pagina dupliceren".',
        ],
      },
      troubleshooting: {
        heading: 'Problemen oplossen',
        points: [
          'Een token is met de verkeerde afbeelding gekopieerd: de API kan geen Marketplace-afbeeldingen kopiëren. Maak de kopie met "Pagina dupliceren" en voeg die toe aan de groep.',
          'Kopieën lopen niet meer gelijk nadat een andere Mod iets heeft gewijzigd: voer Herstellen uit, of vraag de auteur van die Mod om SyncPage.notify aan te roepen.',
          'Wilt u één kopie bewust anders indelen? Pauzeer de groep, breng de wijzigingen aan, klik daarna op Hervatten en kies om niet te herstellen.',
        ],
      },
      languages: {
        heading: 'Talen',
        body: "Stel de taal in op de instellingenkaart. Menu's, berichten en deze handouts volgen die.",
        colLanguage: 'Taal',
        colNative: 'Eigen naam',
        colCode: 'Code',
      },
      credits: {
        heading: 'Met dank aan',
        original: 'Oorspronkelijke Mod door',
        maintainer: 'Herschreven en onderhouden door',
        support: 'Meld problemen op het Roll20-forum of op GitHub.',
      },
    },
  };

  var localeEnUS = {
    titles: {
      ready: 'SyncPage is ready.',
      group: 'Sync group: {name}',
      players: 'Players: {name}',
      settings: 'SyncPage Settings',
      groupSettings: 'Settings for {name}',
      status: 'SyncPage Status',
      recycle: 'Recycle bin: {name}',
      dryRun: 'Repair preview: {name}',
      repaired: 'Repaired: {name}',
      repairedOnStart: 'SyncPage repaired your groups',
      help: 'SyncPage Commands',
      deleted: 'Deleted on one page',
      leftovers: 'Objects with no match',
      warning: 'SyncPage',
    },
    messages: {
      readyHint: 'Type !syncpage to open the menu.',
      migrated:
        'Your SyncPage 0.1 set-up was carried over: {groups} group(s), {links} link(s) kept, {hidden} hidden copy(ies). Pages whose names end in "_synced" can now be renamed.',
      trueCopyGone:
        'The old "True Copy" feature is gone: use Roll20\'s own Duplicate Page, then add the copy to a group.',
      groupCreated:
        'Group "{name}" made from {page}, with {count} object(s). Duplicate the page, then add the copy with "Add this page to a group".',
      pageAdded:
        '{page} joined "{name}": {paired} paired, {copied} copied, {failed} could not be copied, {leftovers} with no match.',
      pageRemoved: '{page} left "{name}". Its objects stay, unlinked.',
      groupDeleted: 'Group "{name}" deleted. The objects stay on their pages.',
      notConfirmed: 'Nothing was changed (not confirmed).',
      hidden: 'Hidden {count} copy(ies). {skipped} object(s) are not linked.',
      shown: 'Shown {count} copy(ies). {skipped} object(s) are not linked.',
      hideFallback:
        '{count} copy(ies) use a picture the API cannot recreate, so they were moved to the GM layer instead of removed.',
      deletedAsk: '{name} was deleted on {page}. Its copies on the other pages are still there.',
      deletedEverywhere: 'Deleted {count} other copy(ies). Undo puts them back.',
      keptOthers: 'The other copies stay.',
      restored: 'Restored {count} object(s). {failed} could not be restored.',
      nothingToUndo: 'There is nothing to undo.',
      recycleEmptied: 'The recycle bin is empty.',
      leftovers:
        '{count} object(s) on {page} match nothing in the group. Copy them to the other pages, or keep them on this page only?',
      andMore: '…and {count} more.',
      leftoversCopied: 'Copied {count} object(s) to the other pages.',
      leftoversKept: 'Kept {count} object(s) on their page only.',
      imageNotCopied:
        "{name} on {page} uses a picture the API cannot copy (marketplace art). Use Roll20's Duplicate Page to make copies with it, then add the copy to the group.",
      moved: '{player} moved to {page}.',
      movedAll: '{count} player(s) moved to {page}. "Restore layout" puts them back.',
      layoutSaved: 'Remembered where {count} player(s) are.',
      layoutRestored: 'Moved {count} player(s) back.',
      layoutReset: 'The remembered layout was cleared.',
      unlinked: '{count} object(s) unlinked. They stay on this page only.',
      paused:
        'Mirroring for "{name}" is paused. Changes stay on the page where they are made until you resume.',
      resumed: 'Mirroring for "{name}" is on again. {count} difference(s) found.',
      settingsReset: 'Settings restored to their defaults.',
      resetMoved: 'Use {command} to restore the default settings.',
      handouts: 'The Help and Command Deck handouts were rebuilt.',
      pruned: 'Tidied up: {links} empty link(s), {pages} missing page(s).',
      startRepair:
        '{name}: {drifted} drifted, {recreated} recreated, {removed} removed, {mirrored} new object(s) copied.',
    },
    errors: {
      hint: 'Type {command} help for the commands.',
      gmOnly: 'Only the GM can use SyncPage.',
      unknownCommand: 'Unknown command: {command}.',
      unknownSetting: 'Unknown setting: {key}.',
      badValue: '"{value}" is not a valid value for {key}.',
      globalOnly: '{key} applies to every group and cannot be changed for one.',
      noGroup: 'No sync group found for "{name}".',
      groupExists: 'There is already a group called "{name}".',
      noName: 'Give a name.',
      pageInGroup: '{page} is already in the group "{group}".',
      pageNotInGroup: '{page} is not in the group "{name}".',
      nothingSelected: 'Select one or more objects first.',
      noPage: 'No page found for "{page}".',
      noPlayer: 'No player found for "{player}".',
      requestExpired: 'That button has expired. Open the card again.',
      requestUnknown: 'That button was already used.',
    },
    menu: {
      thisPage: 'This page',
      group: 'Group',
      source: 'source',
      copy: 'copy',
      paused: 'Paused',
      notInGroup: 'This page is not in a sync group.',
      duplicateHint:
        "Tip: make a group from your map page, use Roll20's Duplicate Page on it, go to the copy and add it to the group. Copies keep marketplace art that way.",
      selectedHint: 'Hide and Show act on the selected objects.',
      groups: 'Groups',
    },
    group: {
      pages: 'Pages (★ = source)',
      playersCount: '{count} player(s)',
      sourceHint: 'The source page is the reference for repairs.',
      summary: 'Summary',
      links: 'Linked objects',
      hidden: 'Hidden copies',
      recycle: 'In the recycle bin',
      overrides: 'Own settings',
      none: 'none',
      lastRepair: 'Last repair {when}: {drifted} drifted, {recreated} recreated.',
    },
    players: {
      none: 'There are no players in this game yet.',
      elsewhere: 'not in this group',
      visibility: 'Selected objects: click to hide or show on a page',
      selectHint: 'Select tokens and open this card again to hide or show them page by page.',
      shown: 'shown',
      hidden: 'hidden',
      layoutSaved: 'A layout of {count} player(s) is remembered.',
      youAreOn: 'You are on {page}.',
    },
    status: {
      notLinked: 'not linked',
      pageOnly: 'kept on this page only',
      missing: 'missing',
    },
    recycle: {
      empty: 'The recycle bin is empty.',
      reasons: {
        delete: 'Deleted',
        repair: 'Repair',
        exclude: 'Excluded layer',
        group: 'Group removed',
      },
    },
    repair: {
      drifted: 'Copies that drifted',
      recreated: 'Missing copies recreated',
      removed: 'Copies removed (source deleted)',
      dropped: 'Empty links dropped',
      mirrored: 'New objects copied',
      leftovers: 'New objects on copies',
      pageSettings: 'Pages with other settings',
      dryRunNote: 'Nothing has been changed yet.',
      doneNote: 'Done. Removed objects are in the recycle bin.',
    },
    age: {
      now: 'just now',
      minutes: '{count} min ago',
      hours: '{count} h ago',
      days: '{count} days ago',
    },
    types: {
      graphic: 'Token',
      text: 'Text',
      path: 'Drawing',
      pathv2: 'Drawing',
      door: 'Door',
      window: 'Window',
    },
    values: {
      on: 'On',
      off: 'Off',
      none: 'None',
    },
    queries: {
      group: 'Group',
      groupName: 'Group name',
      deleteGroup: 'Delete the group {name}? Objects stay on their pages.',
      resetSettings: 'Restore the default settings?',
      emptyRecycle: 'Empty the recycle bin? This cannot be undone.',
      yes: 'Yes',
      no: 'No',
    },
    buttons: {
      menu: 'Menu',
      group: 'Group',
      players: 'Players',
      repair: 'Repair',
      repairNow: 'Repair now',
      dryRun: 'Preview repair',
      pause: 'Pause',
      resume: 'Resume',
      status: 'Status',
      hideHere: 'Hide here',
      showHere: 'Show here',
      hideOthers: 'Hide on other pages',
      showOthers: 'Show on other pages',
      createGroup: 'Make a group from this page',
      addToGroup: 'Add this page to a group',
      removePage: 'Remove from group',
      makeSource: 'Make source',
      settings: 'Settings',
      groupSettings: 'Group settings',
      recycle: 'Recycle bin',
      undo: 'Undo',
      help: 'Help',
      rename: 'Rename',
      deleteGroup: 'Delete group',
      everyoneTo: 'Everyone to {page}',
      saveLayout: 'Save layout',
      restoreLayout: 'Restore layout',
      useGlobal: 'Use global',
      reset: 'Reset settings',
      restore: 'Restore',
      emptyRecycle: 'Empty',
      deleteEverywhere: 'Delete everywhere',
      keepOthers: 'Keep the others',
      copy: 'Copy',
      keepHere: 'Keep here',
      copyAll: 'Copy all',
      keepAll: 'Keep all here',
      unlink: 'Unlink',
      rebuild: 'Rebuild handouts',
    },
    settings: {
      deleteMode: 'When an object is deleted',
      hideMode: 'How copies are hidden',
      pairLeftovers: 'Objects that match nothing',
      newObjects: 'New objects',
      localProps: 'Kept per page (tokens)',
      localPageSettings: 'Kept per page (page settings)',
      excludeLayers: 'Layers not synced',
      syncPageSettings: 'Mirror page settings',
      repairOnStart: 'Repair on start',
      playerMenu: 'Who may open the player card',
      recycleSize: 'Recycle bin size',
      language: 'Language',
      groupHint:
        'Settings here apply to this group only. "Use global" goes back to the main setting.',
      override: 'this group',
      global: 'global',
    },
    settingsHelp: {
      deleteMode:
        'Everywhere: deleting on any page deletes every copy. Source page only: only deletes on the source page spread. Unlink: never spread. Ask: whisper a choice.',
      hideMode:
        'GM layer: the copy moves to the GM layer. Remove: the copy is deleted and made again when shown, so nothing is left for players to find.',
      pairLeftovers:
        'When a page joins a group or is repaired: ask, copy them to the other pages, or leave them on their page.',
      newObjects:
        'Mirror: objects made on any page are copied. Source only: only objects made on the source page are copied.',
      localProps: 'Token properties each page keeps for itself, such as vision for one player.',
      localPageSettings:
        'Page settings each page keeps for itself, such as darkness for one group of players.',
      excludeLayers: 'Objects on these layers stay on their own page.',
      syncPageSettings: "Copy page settings (lighting, grid, size…) between the group's pages.",
      repairOnStart: 'When the sandbox starts: repair quietly, repair and report, or do nothing.',
      playerMenu: 'GM only, or players may ask which page they are on.',
      recycleSize: 'How many removals each group keeps for Undo.',
      language: 'Language of menus, messages and handouts.',
    },
    options: {
      deleteMode: { all: 'Everywhere', source: 'Source page only', unlink: 'Unlink', ask: 'Ask' },
      hideMode: { gmlayer: 'GM layer', remove: 'Remove' },
      pairLeftovers: { ask: 'Ask', copy: 'Copy', leave: 'Leave' },
      newObjects: { mirror: 'Mirror', sourceOnly: 'Source only' },
      localProps: {
        gmnotes: 'GM Notes',
        name: 'Name',
        bars: 'Bars',
        markers: 'Markers',
        tint: 'Tint',
        aura: 'Auras',
        vision: 'Vision',
        light: 'Light',
        controlledby: 'Controlled by',
      },
      localPageSettings: {
        lighting: 'Lighting',
        daylight: 'Daylight',
        explorer: 'Explorer mode',
        fog: 'Fog',
        grid: 'Grid',
        background: 'Background',
        scale: 'Size and scale',
        jukebox: 'Jukebox',
      },
      excludeLayers: {
        map: 'Map',
        objects: 'Tokens',
        gmlayer: 'GM',
        foreground: 'Foreground',
        walls: 'Walls',
      },
      repairOnStart: { quiet: 'Quietly', report: 'And report', off: 'Off' },
      playerMenu: { gm: 'GM only', players: 'Players too' },
    },
    help: {
      menu: 'Open the menu.',
      groupCreate: 'Make a sync group from this page.',
      groupAdd: 'Add this page to a group: matching objects are paired, missing ones copied.',
      groupRemove: 'Take this page out of its group. Objects stay, unlinked.',
      groupShow: "Show a group's card.",
      groupRename: 'Rename a group.',
      groupSource: "Make this page the group's source (the reference for repairs).",
      groupDelete: 'Delete a group (asks first). Objects stay.',
      players:
        'Show who is on which page, with buttons to move them and to hide or show the selected tokens per page.',
      move: 'Move one player to a page (split party).',
      moveAll: 'Move every player in the group to one page, remembering where they were.',
      layout: 'Remember or restore which page each player is on.',
      hide: "Hide the selected objects' copies: here, on the other pages, everywhere, or on named pages.",
      show: 'Show hidden copies again.',
      status: "Show the selected objects' links and where they are hidden.",
      unlink: 'Keep the selected objects on this page only.',
      repair: 'Bring copies back in step with the source page. --dry-run only reports.',
      pause: 'Stop mirroring a group for a while.',
      resume: 'Mirror again; shows what differs.',
      undo: 'Put back the last removal.',
      recycle: 'List removals and restore any of them.',
      settings: 'Show the settings, globally or for one group.',
      set: 'Change a setting. Lists take +name or -name.',
      settingsReset: 'Restore the default settings (asks first).',
      handouts: 'Rebuild the Help and Command Deck handouts.',
      help: 'Show this list.',
      ids: 'Act on these objects instead of the selected ones.',
      page: 'Act on this page instead of the one you are viewing.',
      footer: 'The {help} handout explains everything; {deck} has buttons.',
    },
    deck: {
      menuTitle: 'Menu',
      menuDesc: 'The main menu, players and settings.',
      groupsTitle: 'Groups',
      groupsDesc: 'Make a group from the page you are on, or add this page to a group.',
      selectedTitle: 'Selected objects',
      selectedDesc: "Hide or show the selected objects' copies.",
      toolsTitle: 'Tools',
      toolsDesc: 'Repair, undo, pause and handouts.',
      footer: 'See {help} for how SyncPage works.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Linked pages for split parties',
      footer: 'Open {deck} for buttons.',
      overview: {
        heading: 'Overview',
        body: "SyncPage keeps pages in step. Pages in a sync group share their tokens, drawings, walls, doors, windows, text and page settings: whatever changes on one page changes on the others. With Roll20's split party you put players on different copies, then hide or show things per copy, so each player sees only what their character should.",
        why: 'Roll20 cannot hide an object from only some players on one page. Dynamic lighting gives each token its own vision, but not "this NPC is invisible to the rogue only". Mirrored pages do that.',
      },
      quickStart: {
        heading: 'Quick start',
        steps: [
          'Go to your map page and type !syncpage, then click "Make a group from this page".',
          "Use Roll20's Duplicate Page on that page (the page card's menu). It copies marketplace art, which the API cannot.",
          'Go to the copy and click "Add this page to a group". SyncPage pairs the objects that match and copies anything missing.',
          'Open Players to move players to the copy, then select tokens and hide them on one page.',
        ],
      },
      mirroring: {
        heading: 'What is mirrored',
        points: [
          'Tokens (including Jumpgate lights), text, Legacy and Jumpgate drawings, walls of every kind, doors and windows.',
          'New objects, changes and deletes, in both directions. Deletes follow the "When an object is deleted" setting.',
          'Page settings such as lighting, grid and size, unless switched off or kept per page.',
          'Layers can be left out per group, and token properties such as vision can be kept per page.',
          'Changes other Mods make through TokenMod are mirrored too. Other Mods can call SyncPage.notify; repair catches the rest.',
        ],
      },
      visibility: {
        heading: 'Hiding per page',
        points: [
          'Select tokens and use Hide here, Hide on other pages, or the grid on the Players card.',
          "Only that page's copy is hidden. Changes from other pages never undo the hide.",
          'GM layer mode moves the copy to the GM layer. Remove mode deletes it and makes it again when shown, so nothing is left on the page for players to find.',
        ],
      },
      players: {
        heading: 'Players',
        points: [
          'The Players card lists each player and the page they are on, with a button per page to move them (split party).',
          '"Everyone to" gathers the players on one page and remembers where they were; "Restore layout" puts them back.',
        ],
      },
      repair: {
        heading: 'Repair',
        points: [
          'Repair brings the copies back in step with the source page: drifted properties, missing copies, objects deleted or made while SyncPage was not watching.',
          'Preview repair shows what would change without changing anything. A repair that would change many objects asks first.',
          'Repair runs quietly when the sandbox starts (setting). Object IDs stay the same, unlike 0.1.',
        ],
      },
      memory: {
        heading: 'What SyncPage remembers',
        points: [
          'A recycle bin per group: every delete that spreads and every clean-up can be put back with Undo.',
          'Where each player was, so a split can be restored.',
          'The last group you used, the last repair and its results.',
          'Buttons that need data carry a short code; they work once and expire after 10 minutes.',
        ],
      },
      commands: {
        heading: 'Commands',
        intro: 'GM only. !sync works too.',
        colCommand: 'Command',
        colDesc: 'What it does',
      },
      settings: {
        heading: 'Settings',
        intro:
          'Change settings on the settings card or with !syncpage set. Group settings can be changed for one group on its card.',
        colKey: 'Key',
        colName: 'Setting',
        colDesc: 'Meaning',
        colScope: 'Scope',
        scopeGroup: 'Per group',
        scopeGlobal: 'Global',
      },
      api: {
        heading: 'For other Mods',
        intro: 'The global SyncPage object:',
        colFunction: 'Function',
        colDesc: 'What it does',
        rows: {
          getGroup: 'The group a page is in: id, name, source and pages.',
          getLinked: 'The linked copies of an object, by page.',
          notify: 'Mirror a change your Mod made (API changes raise no events).',
          isHidden: "Whether an object's copy is hidden on a page.",
          onSync: 'Be told about every mirrored create, change and delete.',
          repair: 'Repair a group; { dryRun: true } only counts.',
        },
      },
      upgrading: {
        heading: 'Upgrading from 0.1',
        points: [
          'A page whose name ends in "_synced" joins a group with the page of the same name without it, which becomes the source. You can rename the pages afterwards.',
          'Old links are kept; everything else is paired by position and picture.',
          'Show/Hide flags in GM Notes become hidden copies, and the flag text is removed from GM Notes.',
          'A custom command from the old config still works. "True Copy" is gone: use Duplicate Page.',
        ],
      },
      troubleshooting: {
        heading: 'Troubleshooting',
        points: [
          'A token copied with the wrong picture: the API cannot copy marketplace art. Make the copy with Duplicate Page and add it to the group.',
          "Copies out of step after another Mod changed things: run Repair, or ask that Mod's author to call SyncPage.notify.",
          'Want to rearrange one copy on purpose? Pause the group, make the changes, then Resume and choose not to repair.',
        ],
      },
      languages: {
        heading: 'Languages',
        body: 'Set the language on the settings card. Menus, messages and these handouts follow it.',
        colLanguage: 'Language',
        colNative: 'Native name',
        colCode: 'Code',
      },
      credits: {
        heading: 'Credits',
        original: 'Original Mod by',
        maintainer: 'Rewritten and maintained by',
        support: 'Please report problems on the Roll20 forum or GitHub.',
      },
    },
  };

  var localeFi = {
    titles: {
      ready: 'SyncPage on valmis.',
      group: 'Synkronointiryhmä: {name}',
      players: 'Pelaajat: {name}',
      settings: 'SyncPage-asetukset',
      groupSettings: 'Asetukset: {name}',
      status: 'SyncPage-tila',
      recycle: 'Roskakori: {name}',
      dryRun: 'Korjauksen esikatselu: {name}',
      repaired: 'Korjattu: {name}',
      repairedOnStart: 'SyncPage korjasi ryhmäsi',
      help: 'SyncPage-komennot',
      deleted: 'Poistettu yhdeltä sivulta',
      leftovers: 'Objektit ilman vastinetta',
      warning: 'SyncPage',
    },
    messages: {
      readyHint: 'Avaa valikko kirjoittamalla !syncpage.',
      migrated:
        'SyncPage 0.1 -asetuksesi siirrettiin: ryhmiä {groups}, linkkejä säilytetty {links}, piilotettuja kopioita {hidden}. Sivut, joiden nimi päättyy "_synced", voi nyt nimetä uudelleen.',
      trueCopyGone:
        'Vanha "True Copy" -toiminto on poistettu: käytä Roll20:n omaa Monista sivu -toimintoa ja lisää kopio sitten ryhmään.',
      groupCreated:
        'Ryhmä "{name}" luotiin sivusta {page}, objekteja {count}. Monista sivu ja lisää kopio sitten painikkeella "Lisää sivu ryhmään".',
      pageAdded:
        'Sivu {page} liittyi ryhmään "{name}": paritettu {paired}, kopioitu {copied}, ei voitu kopioida {failed}, ilman vastinetta {leftovers}.',
      pageRemoved: 'Sivu {page} poistui ryhmästä "{name}". Sen objektit jäävät, ilman linkkiä.',
      groupDeleted: 'Ryhmä "{name}" poistettiin. Objektit jäävät sivuilleen.',
      notConfirmed: 'Mitään ei muutettu (ei vahvistettu).',
      hidden: 'Piilotettu kopioita: {count}. Linkittämättömiä objekteja: {skipped}.',
      shown: 'Näytetty kopioita: {count}. Linkittämättömiä objekteja: {skipped}.',
      hideFallback:
        'Kopioita {count} käyttää kuvaa, jota API ei voi luoda uudelleen, joten ne siirrettiin PJ-tasolle poistamisen sijaan.',
      deletedAsk:
        '{name} poistettiin sivulta {page}. Sen kopiot muilla sivuilla ovat yhä tallella.',
      deletedEverywhere: 'Poistettu muita kopioita: {count}. Kumoa palauttaa ne.',
      keptOthers: 'Muut kopiot jäävät.',
      restored: 'Palautettu objekteja: {count}. Ei voitu palauttaa: {failed}.',
      nothingToUndo: 'Ei mitään kumottavaa.',
      recycleEmptied: 'Roskakori on tyhjä.',
      leftovers:
        'Sivulla {page} on {count} objektia, joille ei ole vastinetta ryhmässä. Kopioidaanko ne muille sivuille vai pidetäänkö ne vain tällä sivulla?',
      andMore: '…ja vielä {count}.',
      leftoversCopied: 'Kopioitu objekteja muille sivuille: {count}.',
      leftoversKept: 'Pidetty objekteja vain omalla sivullaan: {count}.',
      imageNotCopied:
        '{name} sivulla {page} käyttää kuvaa, jota API ei voi kopioida (kauppapaikan kuva). Tee kopiot Roll20:n Monista sivu -toiminnolla ja lisää kopio sitten ryhmään.',
      moved: '{player} siirrettiin sivulle {page}.',
      movedAll:
        'Pelaajia siirrettiin sivulle {page}: {count}. "Palauta sijoittelu" siirtää heidät takaisin.',
      layoutSaved: 'Tallennettu, missä {count} pelaajaa ovat.',
      layoutRestored: 'Siirretty takaisin pelaajia: {count}.',
      layoutReset: 'Tallennettu sijoittelu tyhjennettiin.',
      unlinked: 'Linkitys purettu objekteilta: {count}. Ne jäävät vain tälle sivulle.',
      paused:
        'Ryhmän "{name}" peilaus on keskeytetty. Muutokset jäävät sille sivulle, jolla ne tehdään, kunnes jatkat.',
      resumed: 'Ryhmän "{name}" peilaus on taas päällä. Eroja löytyi: {count}.',
      settingsReset: 'Asetukset palautettiin oletuksiin.',
      resetMoved: 'Palauta oletusasetukset komennolla {command}.',
      handouts: 'Ohje- ja Komentopaneeli-monisteet rakennettiin uudelleen.',
      pruned: 'Siivottu: tyhjiä linkkejä {links}, puuttuvia sivuja {pages}.',
      startRepair:
        '{name}: poikennut {drifted}, luotu uudelleen {recreated}, poistettu {removed}, uusia objekteja kopioitu {mirrored}.',
    },
    errors: {
      hint: 'Näet komennot kirjoittamalla {command} help.',
      gmOnly: 'Vain PJ voi käyttää SyncPagea.',
      unknownCommand: 'Tuntematon komento: {command}.',
      unknownSetting: 'Tuntematon asetus: {key}.',
      badValue: '"{value}" ei ole kelvollinen arvo asetukselle {key}.',
      globalOnly: 'Asetus {key} koskee kaikkia ryhmiä, eikä sitä voi muuttaa yhdelle ryhmälle.',
      noGroup: 'Synkronointiryhmää ei löytynyt nimellä "{name}".',
      groupExists: 'Ryhmä nimeltä "{name}" on jo olemassa.',
      noName: 'Anna nimi.',
      pageInGroup: 'Sivu {page} on jo ryhmässä "{group}".',
      pageNotInGroup: 'Sivu {page} ei ole ryhmässä "{name}".',
      nothingSelected: 'Valitse ensin yksi tai useampi objekti.',
      noPage: 'Sivua ei löytynyt nimellä "{page}".',
      noPlayer: 'Pelaajaa ei löytynyt nimellä "{player}".',
      requestExpired: 'Painike on vanhentunut. Avaa kortti uudelleen.',
      requestUnknown: 'Painiketta on jo käytetty.',
    },
    menu: {
      thisPage: 'Tämä sivu',
      group: 'Ryhmä',
      source: 'lähde',
      copy: 'kopio',
      paused: 'Keskeytetty',
      notInGroup: 'Tämä sivu ei ole missään synkronointiryhmässä.',
      duplicateHint:
        'Vinkki: luo ryhmä karttasivustasi, käytä sille Roll20:n Monista sivu -toimintoa, siirry kopioon ja lisää se ryhmään. Näin kopiot säilyttävät kauppapaikan kuvat.',
      selectedHint: 'Piilota ja Näytä koskevat valittuja objekteja.',
      groups: 'Ryhmät',
    },
    group: {
      pages: 'Sivut (★ = lähde)',
      playersCount: 'Pelaajia: {count}',
      sourceHint: 'Lähdesivu on korjausten vertailukohta.',
      summary: 'Yhteenveto',
      links: 'Linkitetyt objektit',
      hidden: 'Piilotetut kopiot',
      recycle: 'Roskakorissa',
      overrides: 'Omat asetukset',
      none: 'ei mitään',
      lastRepair: 'Viimeisin korjaus {when}: poikennut {drifted}, luotu uudelleen {recreated}.',
    },
    players: {
      none: 'Tässä pelissä ei ole vielä pelaajia.',
      elsewhere: 'ei tässä ryhmässä',
      visibility: 'Valitut objektit: napsauta piilottaaksesi tai näyttääksesi sivulla',
      selectHint:
        'Valitse tokenit ja avaa tämä kortti uudelleen piilottaaksesi tai näyttääksesi ne sivu kerrallaan.',
      shown: 'näkyvissä',
      hidden: 'piilossa',
      layoutSaved: 'Sijoittelu tallennettu, pelaajia: {count}.',
      youAreOn: 'Olet sivulla {page}.',
    },
    status: {
      notLinked: 'ei linkitetty',
      pageOnly: 'vain tällä sivulla',
      missing: 'puuttuu',
    },
    recycle: {
      empty: 'Roskakori on tyhjä.',
      reasons: {
        delete: 'Poistettu',
        repair: 'Korjaus',
        exclude: 'Pois jätetty taso',
        group: 'Ryhmä poistettu',
      },
    },
    repair: {
      drifted: 'Poikenneet kopiot',
      recreated: 'Puuttuvat kopiot luotu uudelleen',
      removed: 'Kopiot poistettu (lähde poistettu)',
      dropped: 'Tyhjät linkit poistettu',
      mirrored: 'Uudet objektit kopioitu',
      leftovers: 'Uudet objektit kopioilla',
      pageSettings: 'Sivut, joilla on muut asetukset',
      dryRunNote: 'Mitään ei ole vielä muutettu.',
      doneNote: 'Valmis. Poistetut objektit ovat roskakorissa.',
    },
    age: {
      now: 'juuri nyt',
      minutes: '{count} min sitten',
      hours: '{count} t sitten',
      days: '{count} päivää sitten',
    },
    types: {
      graphic: 'Tokeni',
      text: 'Teksti',
      path: 'Piirros',
      pathv2: 'Piirros',
      door: 'Ovi',
      window: 'Ikkuna',
    },
    values: {
      on: 'Päällä',
      off: 'Pois',
      none: 'Ei mitään',
    },
    queries: {
      group: 'Ryhmä',
      groupName: 'Ryhmän nimi',
      deleteGroup: 'Poistetaanko ryhmä {name}? Objektit jäävät sivuilleen.',
      resetSettings: 'Palautetaanko oletusasetukset?',
      emptyRecycle: 'Tyhjennetäänkö roskakori? Tätä ei voi kumota.',
      yes: 'Kyllä',
      no: 'Ei',
    },
    buttons: {
      menu: 'Valikko',
      group: 'Ryhmä',
      players: 'Pelaajat',
      repair: 'Korjaa',
      repairNow: 'Korjaa nyt',
      dryRun: 'Esikatsele',
      pause: 'Keskeytä',
      resume: 'Jatka',
      status: 'Tila',
      hideHere: 'Piilota tässä',
      showHere: 'Näytä tässä',
      hideOthers: 'Piilota muilla sivuilla',
      showOthers: 'Näytä muilla sivuilla',
      createGroup: 'Luo ryhmä sivusta',
      addToGroup: 'Lisää sivu ryhmään',
      removePage: 'Poista ryhmästä',
      makeSource: 'Tee lähteeksi',
      settings: 'Asetukset',
      groupSettings: 'Ryhmän asetukset',
      recycle: 'Roskakori',
      undo: 'Kumoa',
      help: 'Ohje',
      rename: 'Nimeä',
      deleteGroup: 'Poista ryhmä',
      everyoneTo: 'Kaikki sivulle {page}',
      saveLayout: 'Tallenna sijoittelu',
      restoreLayout: 'Palauta sijoittelu',
      useGlobal: 'Käytä yleistä',
      reset: 'Nollaa asetukset',
      restore: 'Palauta',
      emptyRecycle: 'Tyhjennä',
      deleteEverywhere: 'Poista kaikkialta',
      keepOthers: 'Pidä muut',
      copy: 'Kopioi',
      keepHere: 'Pidä tässä',
      copyAll: 'Kopioi kaikki',
      keepAll: 'Pidä kaikki tässä',
      unlink: 'Pura linkitys',
      rebuild: 'Rakenna monisteet',
    },
    settings: {
      deleteMode: 'Kun objekti poistetaan',
      hideMode: 'Miten kopiot piilotetaan',
      pairLeftovers: 'Objektit ilman vastinetta',
      newObjects: 'Uudet objektit',
      localProps: 'Sivukohtaiset (tokenit)',
      localPageSettings: 'Sivukohtaiset (sivun asetukset)',
      excludeLayers: 'Tasot joita ei synkronoida',
      syncPageSettings: 'Peilaa sivun asetukset',
      repairOnStart: 'Korjaa käynnistyessä',
      playerMenu: 'Kuka saa avata pelaajakortin',
      recycleSize: 'Roskakorin koko',
      language: 'Kieli',
      groupHint: 'Nämä asetukset koskevat vain tätä ryhmää. "Käytä yleistä" palaa pääasetukseen.',
      override: 'tämä ryhmä',
      global: 'yleinen',
    },
    settingsHelp: {
      deleteMode:
        'Kaikkialta: poisto millä tahansa sivulla poistaa kaikki kopiot. Vain lähdesivu: vain lähdesivun poistot leviävät. Pura linkitys: ei leviä koskaan. Kysy: kuiskaa valinnan.',
      hideMode:
        'PJ-taso: kopio siirretään PJ-tasolle. Poista: kopio poistetaan ja luodaan uudelleen, kun se näytetään, joten pelaajille ei jää mitään löydettävää.',
      pairLeftovers:
        'Kun sivu liittyy ryhmään tai korjataan: kysy, kopioi ne muille sivuille tai jätä ne omalle sivulleen.',
      newObjects:
        'Peilaa: millä tahansa sivulla luodut objektit kopioidaan. Vain lähde: vain lähdesivulla luodut objektit kopioidaan.',
      localProps:
        'Tokenin ominaisuudet, jotka kukin sivu pitää omanaan, esimerkiksi näkö yhdelle pelaajalle.',
      localPageSettings:
        'Sivun asetukset, jotka kukin sivu pitää omanaan, esimerkiksi pimeys yhdelle pelaajaryhmälle.',
      excludeLayers: 'Näiden tasojen objektit pysyvät omalla sivullaan.',
      syncPageSettings:
        'Kopioi sivun asetukset (valaistus, ruudukko, koko…) ryhmän sivujen välillä.',
      repairOnStart:
        'Kun hiekkalaatikko käynnistyy: korjaa hiljaa, korjaa ja raportoi tai älä tee mitään.',
      playerMenu: 'Vain PJ, tai pelaajat saavat kysyä, millä sivulla he ovat.',
      recycleSize: 'Kuinka monta poistoa kukin ryhmä säilyttää Kumoa-toimintoa varten.',
      language: 'Valikkojen, viestien ja monisteiden kieli.',
    },
    options: {
      deleteMode: {
        all: 'Kaikkialta',
        source: 'Vain lähdesivu',
        unlink: 'Pura linkitys',
        ask: 'Kysy',
      },
      hideMode: { gmlayer: 'PJ-taso', remove: 'Poista' },
      pairLeftovers: { ask: 'Kysy', copy: 'Kopioi', leave: 'Jätä' },
      newObjects: { mirror: 'Peilaa', sourceOnly: 'Vain lähde' },
      localProps: {
        gmnotes: 'PJ:n muistiinpanot',
        name: 'Nimi',
        bars: 'Palkit',
        markers: 'Merkit',
        tint: 'Sävy',
        aura: 'Aurat',
        vision: 'Näkö',
        light: 'Valo',
        controlledby: 'Ohjaaja',
      },
      localPageSettings: {
        lighting: 'Valaistus',
        daylight: 'Päivänvalo',
        explorer: 'Tutkijatila',
        fog: 'Sumu',
        grid: 'Ruudukko',
        background: 'Tausta',
        scale: 'Koko ja mittakaava',
        jukebox: 'Jukeboksi',
      },
      excludeLayers: {
        map: 'Kartta',
        objects: 'Tokenit',
        gmlayer: 'PJ',
        foreground: 'Etuala',
        walls: 'Seinät',
      },
      repairOnStart: { quiet: 'Hiljaa', report: 'Raportoiden', off: 'Pois' },
      playerMenu: { gm: 'Vain PJ', players: 'Myös pelaajat' },
    },
    help: {
      menu: 'Avaa valikko.',
      groupCreate: 'Luo synkronointiryhmä tästä sivusta.',
      groupAdd: 'Lisää tämä sivu ryhmään: vastaavat objektit paritetaan, puuttuvat kopioidaan.',
      groupRemove: 'Poista tämä sivu ryhmästään. Objektit jäävät, ilman linkkiä.',
      groupShow: 'Näytä ryhmän kortti.',
      groupRename: 'Nimeä ryhmä uudelleen.',
      groupSource: 'Tee tästä sivusta ryhmän lähde (korjausten vertailukohta).',
      groupDelete: 'Poista ryhmä (kysyy ensin). Objektit jäävät.',
      players:
        'Näytä, kuka on millä sivulla, ja painikkeet heidän siirtämiseensä sekä valittujen tokenien piilottamiseen tai näyttämiseen sivuittain.',
      move: 'Siirrä yksi pelaaja sivulle (ryhmän jakaminen).',
      moveAll: 'Siirrä kaikki ryhmän pelaajat yhdelle sivulle ja muista, missä he olivat.',
      layout: 'Muista tai palauta, millä sivulla kukin pelaaja on.',
      hide: 'Piilota valittujen objektien kopiot: tässä, muilla sivuilla, kaikkialla tai nimetyillä sivuilla.',
      show: 'Näytä piilotetut kopiot taas.',
      status: 'Näytä valittujen objektien linkit ja missä ne on piilotettu.',
      unlink: 'Pidä valitut objektit vain tällä sivulla.',
      repair: 'Tuo kopiot taas lähdesivun tahtiin. --dry-run vain raportoi.',
      pause: 'Lopeta ryhmän peilaus hetkeksi.',
      resume: 'Peilaa taas; näyttää, mikä eroaa.',
      undo: 'Palauta viimeisin poisto.',
      recycle: 'Luettele poistot ja palauta mikä tahansa niistä.',
      settings: 'Näytä asetukset, yleisesti tai yhdelle ryhmälle.',
      set: 'Muuta asetusta. Luetteloille annetaan +name tai -name.',
      settingsReset: 'Palauta oletusasetukset (kysyy ensin).',
      handouts: 'Rakenna Ohje- ja Komentopaneeli-monisteet uudelleen.',
      help: 'Näytä tämä luettelo.',
      ids: 'Käsittele näitä objekteja valittujen sijaan.',
      page: 'Käsittele tätä sivua katsomasi sivun sijaan.',
      footer: 'Moniste {help} selittää kaiken; monisteessa {deck} on painikkeet.',
    },
    deck: {
      menuTitle: 'Valikko',
      menuDesc: 'Päävalikko, pelaajat ja asetukset.',
      groupsTitle: 'Ryhmät',
      groupsDesc: 'Luo ryhmä sivusta, jolla olet, tai lisää tämä sivu ryhmään.',
      selectedTitle: 'Valitut objektit',
      selectedDesc: 'Piilota tai näytä valittujen objektien kopiot.',
      toolsTitle: 'Työkalut',
      toolsDesc: 'Korjaus, kumoa, keskeytys ja monisteet.',
      footer: 'Katso monisteesta {help}, miten SyncPage toimii.',
    },
    handout: {
      versionLabel: 'Versio',
      subtitle: 'Linkitetyt sivut jaetuille ryhmille',
      footer: 'Painikkeet ovat monisteessa {deck}.',
      overview: {
        heading: 'Yleiskatsaus',
        body: 'SyncPage pitää sivut tahdissa. Synkronointiryhmän sivut jakavat tokenit, piirrokset, seinät, ovet, ikkunat, tekstit ja sivun asetukset: mikä muuttuu yhdellä sivulla, muuttuu muillakin. Roll20:n ryhmän jakamisella sijoitat pelaajat eri kopioille ja piilotat tai näytät asioita kopiokohtaisesti, joten kukin pelaaja näkee vain sen, mitä hänen hahmonsa kuuluu nähdä.',
        why: 'Roll20 ei voi piilottaa objektia vain joiltakin pelaajilta yhdellä sivulla. Dynaaminen valaistus antaa kullekin tokenille oman näön, mutta ei "tämä NPC on näkymätön vain varkaalle". Peilatut sivut tekevät sen.',
      },
      quickStart: {
        heading: 'Pikaopas',
        steps: [
          'Siirry karttasivullesi, kirjoita !syncpage ja napsauta "Luo ryhmä sivusta".',
          'Käytä sivulle Roll20:n Monista sivu -toimintoa (sivukortin valikosta). Se kopioi kauppapaikan kuvat, mihin API ei pysty.',
          'Siirry kopioon ja napsauta "Lisää sivu ryhmään". SyncPage parittaa vastaavat objektit ja kopioi kaiken puuttuvan.',
          'Avaa Pelaajat siirtääksesi pelaajia kopioon, valitse sitten tokenit ja piilota ne yhdellä sivulla.',
        ],
      },
      mirroring: {
        heading: 'Mitä peilataan',
        points: [
          'Tokenit (myös Jumpgate-valot), tekstit, Legacy- ja Jumpgate-piirrokset, kaikenlaiset seinät, ovet ja ikkunat.',
          'Uudet objektit, muutokset ja poistot, molempiin suuntiin. Poistot noudattavat asetusta "Kun objekti poistetaan".',
          'Sivun asetukset, kuten valaistus, ruudukko ja koko, ellei niitä ole kytketty pois tai pidetä sivukohtaisina.',
          'Tasoja voi jättää pois ryhmäkohtaisesti, ja tokenin ominaisuudet, kuten näkö, voi pitää sivukohtaisina.',
          'Myös muiden Modien TokenModin kautta tekemät muutokset peilataan. Muut Modit voivat kutsua SyncPage.notify; korjaus hoitaa loput.',
        ],
      },
      visibility: {
        heading: 'Piilottaminen sivuittain',
        points: [
          'Valitse tokenit ja käytä painikkeita Piilota tässä tai Piilota muilla sivuilla, tai Pelaajat-kortin ruudukkoa.',
          'Vain kyseisen sivun kopio piilotetaan. Muiden sivujen muutokset eivät koskaan kumoa piilotusta.',
          'PJ-taso-tila siirtää kopion PJ-tasolle. Poista-tila poistaa sen ja luo sen uudelleen, kun se näytetään, joten sivulle ei jää pelaajille mitään löydettävää.',
        ],
      },
      players: {
        heading: 'Pelaajat',
        points: [
          'Pelaajat-kortti luettelee jokaisen pelaajan ja sivun, jolla hän on, sekä painikkeen sivua kohden hänen siirtämiseensä (ryhmän jakaminen).',
          '"Kaikki sivulle" kokoaa pelaajat yhdelle sivulle ja muistaa, missä he olivat; "Palauta sijoittelu" siirtää heidät takaisin.',
        ],
      },
      repair: {
        heading: 'Korjaus',
        points: [
          'Korjaus tuo kopiot taas lähdesivun tahtiin: poikenneet ominaisuudet, puuttuvat kopiot sekä objektit, jotka poistettiin tai luotiin, kun SyncPage ei ollut valvomassa.',
          'Esikatsele näyttää, mitä muuttuisi, muuttamatta mitään. Korjaus, joka muuttaisi monta objektia, kysyy ensin.',
          'Korjaus ajetaan hiljaa, kun hiekkalaatikko käynnistyy (asetus). Objektien tunnisteet pysyvät samoina, toisin kuin versiossa 0.1.',
        ],
      },
      memory: {
        heading: 'Mitä SyncPage muistaa',
        points: [
          'Roskakorin ryhmää kohden: jokaisen leviävän poiston ja jokaisen siivouksen voi palauttaa Kumoa-toiminnolla.',
          'Missä kukin pelaaja oli, jotta jako voidaan palauttaa.',
          'Viimeksi käyttämäsi ryhmän, viimeisimmän korjauksen ja sen tulokset.',
          'Dataa tarvitsevissa painikkeissa on lyhyt koodi; ne toimivat kerran ja vanhenevat 10 minuutin kuluttua.',
        ],
      },
      commands: {
        heading: 'Komennot',
        intro: 'Vain PJ. Myös !sync toimii.',
        colCommand: 'Komento',
        colDesc: 'Mitä se tekee',
      },
      settings: {
        heading: 'Asetukset',
        intro:
          'Muuta asetuksia asetuskortilla tai komennolla !syncpage set. Ryhmäasetuksia voi muuttaa yhdelle ryhmälle sen kortilla.',
        colKey: 'Avain',
        colName: 'Asetus',
        colDesc: 'Merkitys',
        colScope: 'Laajuus',
        scopeGroup: 'Ryhmäkohtainen',
        scopeGlobal: 'Yleinen',
      },
      api: {
        heading: 'Muille Modeille',
        intro: 'Yleinen SyncPage-objekti:',
        colFunction: 'Funktio',
        colDesc: 'Mitä se tekee',
        rows: {
          getGroup: 'Ryhmä, jossa sivu on: tunniste, nimi, lähde ja sivut.',
          getLinked: 'Objektin linkitetyt kopiot sivuittain.',
          notify: 'Peilaa Modisi tekemä muutos (API-muutokset eivät laukaise tapahtumia).',
          isHidden: 'Onko objektin kopio piilotettu sivulla.',
          onSync: 'Saa tieto jokaisesta peilatusta luonnista, muutoksesta ja poistosta.',
          repair: 'Korjaa ryhmä; { dryRun: true } vain laskee.',
        },
      },
      upgrading: {
        heading: 'Päivitys versiosta 0.1',
        points: [
          'Sivu, jonka nimi päättyy "_synced", liittyy ryhmään saman nimisen sivun kanssa ilman päätettä, ja siitä tulee lähde. Voit nimetä sivut uudelleen jälkeenpäin.',
          'Vanhat linkit säilytetään; kaikki muu paritetaan sijainnin ja kuvan mukaan.',
          'PJ:n muistiinpanojen Show/Hide-liput muuttuvat piilotetuiksi kopioiksi, ja lipun teksti poistetaan muistiinpanoista.',
          'Vanhan asetuksen oma komento toimii yhä. "True Copy" on poistettu: käytä Monista sivu -toimintoa.',
        ],
      },
      troubleshooting: {
        heading: 'Vianetsintä',
        points: [
          'Token kopioitui väärällä kuvalla: API ei voi kopioida kauppapaikan kuvia. Tee kopio Monista sivu -toiminnolla ja lisää se ryhmään.',
          'Kopiot epätahdissa, kun toinen Mod muutti jotain: aja Korjaa tai pyydä kyseisen Modin tekijää kutsumaan SyncPage.notify.',
          'Haluatko muuttaa yhtä kopiota tarkoituksella? Keskeytä ryhmä, tee muutokset, valitse sitten Jatka ja valitse, ettei korjata.',
        ],
      },
      languages: {
        heading: 'Kielet',
        body: 'Valitse kieli asetuskortilla. Valikot, viestit ja nämä monisteet noudattavat sitä.',
        colLanguage: 'Kieli',
        colNative: 'Oma nimi',
        colCode: 'Koodi',
      },
      credits: {
        heading: 'Tekijät',
        original: 'Alkuperäisen Modin teki',
        maintainer: 'Uudelleenkirjoittanut ja ylläpitää',
        support: 'Ilmoita ongelmista Roll20-foorumilla tai GitHubissa.',
      },
    },
  };

  var localeFr = {
    titles: {
      ready: 'SyncPage est prêt.',
      group: 'Groupe de synchronisation : {name}',
      players: 'Joueurs : {name}',
      settings: 'Paramètres de SyncPage',
      groupSettings: 'Paramètres de {name}',
      status: 'État de SyncPage',
      recycle: 'Corbeille : {name}',
      dryRun: 'Aperçu de la réparation : {name}',
      repaired: 'Réparé : {name}',
      repairedOnStart: 'SyncPage a réparé vos groupes',
      help: 'Commandes de SyncPage',
      deleted: 'Supprimé sur une page',
      leftovers: 'Objets sans correspondance',
      warning: 'SyncPage',
    },
    messages: {
      readyHint: 'Tapez !syncpage pour ouvrir le menu.',
      migrated:
        'Votre configuration SyncPage 0.1 a été reprise : {groups} groupe(s), {links} lien(s) conservé(s), {hidden} copie(s) masquée(s). Les pages dont le nom se termine par « _synced » peuvent maintenant être renommées.',
      trueCopyGone:
        "L'ancienne fonction « True Copy » n'existe plus : utilisez « Dupliquer la page » de Roll20, puis ajoutez la copie à un groupe.",
      groupCreated:
        'Groupe « {name} » créé à partir de {page}, avec {count} objet(s). Dupliquez la page, puis ajoutez la copie avec « Ajouter cette page à un groupe ».',
      pageAdded:
        '{page} a rejoint « {name} » : {paired} associé(s), {copied} copié(s), {failed} impossible(s) à copier, {leftovers} sans correspondance.',
      pageRemoved: '{page} a quitté « {name} ». Ses objets restent, sans lien.',
      groupDeleted: 'Groupe « {name} » supprimé. Les objets restent sur leurs pages.',
      notConfirmed: "Rien n'a été modifié (non confirmé).",
      hidden: '{count} copie(s) masquée(s). {skipped} objet(s) non lié(s).',
      shown: '{count} copie(s) affichée(s). {skipped} objet(s) non lié(s).',
      hideFallback:
        "{count} copie(s) utilisent une image que l'API ne peut pas recréer : elles ont été déplacées sur le calque MJ au lieu d'être supprimées.",
      deletedAsk:
        '{name} a été supprimé sur {page}. Ses copies sur les autres pages sont toujours là.',
      deletedEverywhere: '{count} autre(s) copie(s) supprimée(s). « Annuler » les remet en place.',
      keptOthers: 'Les autres copies restent.',
      restored: '{count} objet(s) restauré(s). {failed} impossible(s) à restaurer.',
      nothingToUndo: "Il n'y a rien à annuler.",
      recycleEmptied: 'La corbeille est vide.',
      leftovers:
        '{count} objet(s) sur {page} ne correspondent à rien dans le groupe. Les copier sur les autres pages, ou les garder sur cette page seulement ?',
      andMore: '…et {count} de plus.',
      leftoversCopied: '{count} objet(s) copié(s) sur les autres pages.',
      leftoversKept: '{count} objet(s) gardé(s) sur leur page seulement.',
      imageNotCopied:
        "{name} sur {page} utilise une image que l'API ne peut pas copier (illustration du marketplace). Utilisez « Dupliquer la page » de Roll20 pour faire des copies avec cette image, puis ajoutez la copie au groupe.",
      moved: '{player} a été déplacé vers {page}.',
      movedAll:
        '{count} joueur(s) déplacé(s) vers {page}. « Rétablir la disposition » les remet en place.',
      layoutSaved: 'Position de {count} joueur(s) mémorisée.',
      layoutRestored: '{count} joueur(s) remis en place.',
      layoutReset: 'La disposition mémorisée a été effacée.',
      unlinked: '{count} objet(s) délié(s). Ils restent sur cette page seulement.',
      paused:
        "La réplication de « {name} » est en pause. Les modifications restent sur la page où elles sont faites jusqu'à la reprise.",
      resumed: 'La réplication de « {name} » est réactivée. {count} différence(s) trouvée(s).',
      settingsReset: 'Paramètres remis à leurs valeurs par défaut.',
      resetMoved: 'Utilisez {command} pour rétablir les paramètres par défaut.',
      handouts: 'Les aides de jeu « Help » et « Command Deck » ont été reconstruites.',
      pruned: 'Nettoyage : {links} lien(s) vide(s), {pages} page(s) manquante(s).',
      startRepair:
        '{name} : {drifted} décalé(s), {recreated} recréé(s), {removed} supprimé(s), {mirrored} objet(s) nouveau(x) copié(s).',
    },
    errors: {
      hint: 'Tapez {command} help pour voir les commandes.',
      gmOnly: 'Seul le MJ peut utiliser SyncPage.',
      unknownCommand: 'Commande inconnue : {command}.',
      unknownSetting: 'Paramètre inconnu : {key}.',
      badValue: "« {value} » n'est pas une valeur valide pour {key}.",
      globalOnly: "{key} s'applique à tous les groupes et ne peut pas être modifié pour un seul.",
      noGroup: 'Aucun groupe de synchronisation trouvé pour « {name} ».',
      groupExists: 'Il existe déjà un groupe nommé « {name} ».',
      noName: 'Indiquez un nom.',
      pageInGroup: '{page} est déjà dans le groupe « {group} ».',
      pageNotInGroup: "{page} n'est pas dans le groupe « {name} ».",
      nothingSelected: "Sélectionnez d'abord un ou plusieurs objets.",
      noPage: 'Aucune page trouvée pour « {page} ».',
      noPlayer: 'Aucun joueur trouvé pour « {player} ».',
      requestExpired: 'Ce bouton a expiré. Rouvrez la carte.',
      requestUnknown: 'Ce bouton a déjà été utilisé.',
    },
    menu: {
      thisPage: 'Cette page',
      group: 'Groupe',
      source: 'source',
      copy: 'copie',
      paused: 'En pause',
      notInGroup: "Cette page n'est dans aucun groupe de synchronisation.",
      duplicateHint:
        'Astuce : créez un groupe à partir de votre page de carte, utilisez « Dupliquer la page » de Roll20 sur celle-ci, allez sur la copie et ajoutez-la au groupe. Ainsi, les copies gardent les illustrations du marketplace.',
      selectedHint: 'Masquer et Afficher agissent sur les objets sélectionnés.',
      groups: 'Groupes',
    },
    group: {
      pages: 'Pages (★ = source)',
      playersCount: '{count} joueur(s)',
      sourceHint: 'La page source sert de référence pour les réparations.',
      summary: 'Résumé',
      links: 'Objets liés',
      hidden: 'Copies masquées',
      recycle: 'Dans la corbeille',
      overrides: 'Paramètres propres',
      none: 'aucun',
      lastRepair: 'Dernière réparation {when} : {drifted} décalé(s), {recreated} recréé(s).',
    },
    players: {
      none: "Il n'y a encore aucun joueur dans cette partie.",
      elsewhere: 'pas dans ce groupe',
      visibility: 'Objets sélectionnés : cliquez pour masquer ou afficher sur une page',
      selectHint:
        'Sélectionnez des jetons et rouvrez cette carte pour les masquer ou les afficher page par page.',
      shown: 'affiché',
      hidden: 'masqué',
      layoutSaved: 'Une disposition de {count} joueur(s) est mémorisée.',
      youAreOn: 'Vous êtes sur {page}.',
    },
    status: {
      notLinked: 'non lié',
      pageOnly: 'gardé sur cette page seulement',
      missing: 'manquant',
    },
    recycle: {
      empty: 'La corbeille est vide.',
      reasons: {
        delete: 'Supprimé',
        repair: 'Réparation',
        exclude: 'Calque exclu',
        group: 'Groupe retiré',
      },
    },
    repair: {
      drifted: 'Copies décalées',
      recreated: 'Copies manquantes recréées',
      removed: 'Copies supprimées (source supprimée)',
      dropped: 'Liens vides retirés',
      mirrored: 'Nouveaux objets copiés',
      leftovers: 'Nouveaux objets sur les copies',
      pageSettings: "Pages avec d'autres paramètres",
      dryRunNote: "Rien n'a encore été modifié.",
      doneNote: 'Terminé. Les objets supprimés sont dans la corbeille.',
    },
    age: {
      now: "à l'instant",
      minutes: 'il y a {count} min',
      hours: 'il y a {count} h',
      days: 'il y a {count} jours',
    },
    types: {
      graphic: 'Jeton',
      text: 'Texte',
      path: 'Dessin',
      pathv2: 'Dessin',
      door: 'Porte',
      window: 'Fenêtre',
    },
    values: {
      on: 'Activé',
      off: 'Désactivé',
      none: 'Aucun',
    },
    queries: {
      group: 'Groupe',
      groupName: 'Nom du groupe',
      deleteGroup: 'Supprimer le groupe {name} ? Les objets restent sur leurs pages.',
      resetSettings: 'Rétablir les paramètres par défaut ?',
      emptyRecycle: 'Vider la corbeille ? Cette action est irréversible.',
      yes: 'Oui',
      no: 'Non',
    },
    buttons: {
      menu: 'Menu',
      group: 'Groupe',
      players: 'Joueurs',
      repair: 'Réparer',
      repairNow: 'Réparer maintenant',
      dryRun: 'Aperçu réparation',
      pause: 'Pause',
      resume: 'Reprendre',
      status: 'État',
      hideHere: 'Masquer ici',
      showHere: 'Afficher ici',
      hideOthers: 'Masquer ailleurs',
      showOthers: 'Afficher ailleurs',
      createGroup: 'Créer un groupe avec cette page',
      addToGroup: 'Ajouter cette page à un groupe',
      removePage: 'Retirer du groupe',
      makeSource: 'Définir comme source',
      settings: 'Paramètres',
      groupSettings: 'Paramètres du groupe',
      recycle: 'Corbeille',
      undo: 'Annuler',
      help: 'Aide',
      rename: 'Renommer',
      deleteGroup: 'Supprimer le groupe',
      everyoneTo: 'Tous vers {page}',
      saveLayout: 'Mémoriser la disposition',
      restoreLayout: 'Rétablir la disposition',
      useGlobal: 'Valeur globale',
      reset: 'Réinitialiser',
      restore: 'Restaurer',
      emptyRecycle: 'Vider',
      deleteEverywhere: 'Supprimer partout',
      keepOthers: 'Garder les autres',
      copy: 'Copier',
      keepHere: 'Garder ici',
      copyAll: 'Tout copier',
      keepAll: 'Tout garder ici',
      unlink: 'Délier',
      rebuild: 'Reconstruire les aides',
    },
    settings: {
      deleteMode: 'Quand un objet est supprimé',
      hideMode: 'Comment les copies sont masquées',
      pairLeftovers: 'Objets sans correspondance',
      newObjects: 'Nouveaux objets',
      localProps: 'Propres à chaque page (jetons)',
      localPageSettings: 'Propres à chaque page (paramètres de page)',
      excludeLayers: 'Calques non synchronisés',
      syncPageSettings: 'Répliquer les paramètres de page',
      repairOnStart: 'Réparer au démarrage',
      playerMenu: 'Qui peut ouvrir la carte des joueurs',
      recycleSize: 'Taille de la corbeille',
      language: 'Langue',
      groupHint:
        "Les paramètres ici s'appliquent à ce groupe seulement. « Valeur globale » revient au paramètre principal.",
      override: 'ce groupe',
      global: 'global',
    },
    settingsHelp: {
      deleteMode:
        "Partout : supprimer sur n'importe quelle page supprime toutes les copies. Page source seule : seules les suppressions sur la page source se propagent. Délier : aucune propagation. Demander : un choix est chuchoté.",
      hideMode:
        'Calque MJ : la copie passe sur le calque MJ. Supprimer : la copie est supprimée puis recréée quand elle est affichée, pour que les joueurs ne trouvent rien.',
      pairLeftovers:
        'Quand une page rejoint un groupe ou est réparée : demander, les copier sur les autres pages, ou les laisser sur leur page.',
      newObjects:
        "Répliquer : les objets créés sur n'importe quelle page sont copiés. Source seule : seuls les objets créés sur la page source sont copiés.",
      localProps:
        'Propriétés de jeton que chaque page garde pour elle, comme la vision pour un joueur.',
      localPageSettings:
        "Paramètres de page que chaque page garde pour elle, comme l'obscurité pour un groupe de joueurs.",
      excludeLayers: 'Les objets sur ces calques restent sur leur propre page.',
      syncPageSettings:
        'Copier les paramètres de page (éclairage, grille, taille…) entre les pages du groupe.',
      repairOnStart:
        'Au démarrage du sandbox : réparer discrètement, réparer avec un rapport, ou ne rien faire.',
      playerMenu: 'MJ seulement, ou les joueurs peuvent demander sur quelle page ils sont.',
      recycleSize: 'Nombre de suppressions que chaque groupe garde pour « Annuler ».',
      language: 'Langue des menus, des messages et des aides de jeu.',
    },
    options: {
      deleteMode: {
        all: 'Partout',
        source: 'Page source seule',
        unlink: 'Délier',
        ask: 'Demander',
      },
      hideMode: { gmlayer: 'Calque MJ', remove: 'Supprimer' },
      pairLeftovers: { ask: 'Demander', copy: 'Copier', leave: 'Laisser' },
      newObjects: { mirror: 'Répliquer', sourceOnly: 'Source seule' },
      localProps: {
        gmnotes: 'Notes du MJ',
        name: 'Nom',
        bars: 'Barres',
        markers: 'Marqueurs',
        tint: 'Teinte',
        aura: 'Auras',
        vision: 'Vision',
        light: 'Lumière',
        controlledby: 'Contrôlé par',
      },
      localPageSettings: {
        lighting: 'Éclairage',
        daylight: 'Lumière du jour',
        explorer: 'Mode explorateur',
        fog: 'Brouillard',
        grid: 'Grille',
        background: 'Arrière-plan',
        scale: 'Taille et échelle',
        jukebox: 'Jukebox',
      },
      excludeLayers: {
        map: 'Carte',
        objects: 'Jetons',
        gmlayer: 'MJ',
        foreground: 'Premier plan',
        walls: 'Murs',
      },
      repairOnStart: { quiet: 'Discrètement', report: 'Avec rapport', off: 'Désactivé' },
      playerMenu: { gm: 'MJ seulement', players: 'Joueurs aussi' },
    },
    help: {
      menu: 'Ouvrir le menu.',
      groupCreate: 'Créer un groupe de synchronisation à partir de cette page.',
      groupAdd:
        'Ajouter cette page à un groupe : les objets correspondants sont associés, les manquants sont copiés.',
      groupRemove: 'Retirer cette page de son groupe. Les objets restent, sans lien.',
      groupShow: "Afficher la carte d'un groupe.",
      groupRename: 'Renommer un groupe.',
      groupSource: 'Faire de cette page la source du groupe (la référence pour les réparations).',
      groupDelete: "Supprimer un groupe (demande d'abord). Les objets restent.",
      players:
        'Montrer qui est sur quelle page, avec des boutons pour déplacer les joueurs et pour masquer ou afficher les jetons sélectionnés par page.',
      move: 'Déplacer un joueur vers une page (séparation du groupe).',
      moveAll: 'Déplacer tous les joueurs du groupe vers une page, en mémorisant où ils étaient.',
      layout: 'Mémoriser ou rétablir la page de chaque joueur.',
      hide: 'Masquer les copies des objets sélectionnés : ici, sur les autres pages, partout, ou sur des pages nommées.',
      show: 'Afficher à nouveau les copies masquées.',
      status: 'Afficher les liens des objets sélectionnés et où ils sont masqués.',
      unlink: 'Garder les objets sélectionnés sur cette page seulement.',
      repair:
        'Remettre les copies en accord avec la page source. --dry-run fait seulement un rapport.',
      pause: "Arrêter la réplication d'un groupe pour un temps.",
      resume: 'Répliquer à nouveau ; montre les différences.',
      undo: 'Remettre en place la dernière suppression.',
      recycle: "Lister les suppressions et restaurer n'importe laquelle.",
      settings: 'Afficher les paramètres, globaux ou pour un groupe.',
      set: 'Modifier un paramètre. Les listes acceptent +name ou -name.',
      settingsReset: "Rétablir les paramètres par défaut (demande d'abord).",
      handouts: 'Reconstruire les aides de jeu « Help » et « Command Deck ».',
      help: 'Afficher cette liste.',
      ids: 'Agir sur ces objets au lieu des objets sélectionnés.',
      page: 'Agir sur cette page au lieu de celle que vous regardez.',
      footer: "L'aide de jeu {help} explique tout ; {deck} contient des boutons.",
    },
    deck: {
      menuTitle: 'Menu',
      menuDesc: 'Le menu principal, les joueurs et les paramètres.',
      groupsTitle: 'Groupes',
      groupsDesc:
        'Créer un groupe à partir de la page où vous êtes, ou ajouter cette page à un groupe.',
      selectedTitle: 'Objets sélectionnés',
      selectedDesc: 'Masquer ou afficher les copies des objets sélectionnés.',
      toolsTitle: 'Outils',
      toolsDesc: 'Réparation, annulation, pause et aides de jeu.',
      footer: 'Voir {help} pour comprendre le fonctionnement de SyncPage.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Pages liées pour groupes séparés',
      footer: 'Ouvrez {deck} pour les boutons.',
      overview: {
        heading: 'Présentation',
        body: "SyncPage garde les pages en accord. Les pages d'un groupe de synchronisation partagent leurs jetons, dessins, murs, portes, fenêtres, textes et paramètres de page : tout ce qui change sur une page change sur les autres. Avec la séparation du groupe de Roll20, vous placez les joueurs sur différentes copies, puis vous masquez ou affichez des éléments par copie, pour que chaque joueur ne voie que ce que son personnage doit voir.",
        why: "Roll20 ne peut pas masquer un objet à certains joueurs seulement sur une même page. L'éclairage dynamique donne à chaque jeton sa propre vision, mais pas « ce PNJ est invisible pour le roublard seulement ». Les pages répliquées le permettent.",
      },
      quickStart: {
        heading: 'Démarrage rapide',
        steps: [
          'Allez sur votre page de carte et tapez !syncpage, puis cliquez sur « Créer un groupe avec cette page ».',
          "Utilisez « Dupliquer la page » de Roll20 sur cette page (menu de la vignette de la page). Cela copie les illustrations du marketplace, ce que l'API ne peut pas faire.",
          'Allez sur la copie et cliquez sur « Ajouter cette page à un groupe ». SyncPage associe les objets qui correspondent et copie tout ce qui manque.',
          'Ouvrez Joueurs pour déplacer les joueurs vers la copie, puis sélectionnez des jetons et masquez-les sur une page.',
        ],
      },
      mirroring: {
        heading: 'Ce qui est répliqué',
        points: [
          'Jetons (y compris les lumières Jumpgate), textes, dessins Legacy et Jumpgate, murs de tous types, portes et fenêtres.',
          'Les nouveaux objets, modifications et suppressions, dans les deux sens. Les suppressions suivent le paramètre « Quand un objet est supprimé ».',
          "Les paramètres de page comme l'éclairage, la grille et la taille, sauf s'ils sont désactivés ou propres à chaque page.",
          'Des calques peuvent être exclus par groupe, et des propriétés de jeton comme la vision peuvent rester propres à chaque page.',
          "Les modifications que d'autres Mods font via TokenMod sont aussi répliquées. D'autres Mods peuvent appeler SyncPage.notify ; la réparation rattrape le reste.",
        ],
      },
      visibility: {
        heading: 'Masquer par page',
        points: [
          'Sélectionnez des jetons et utilisez Masquer ici, Masquer ailleurs, ou la grille de la carte Joueurs.',
          "Seule la copie de cette page est masquée. Les modifications venant d'autres pages n'annulent jamais le masquage.",
          'Le mode Calque MJ déplace la copie sur le calque MJ. Le mode Supprimer la supprime puis la recrée quand elle est affichée, pour que les joueurs ne trouvent rien sur la page.',
        ],
      },
      players: {
        heading: 'Joueurs',
        points: [
          'La carte Joueurs liste chaque joueur et la page où il se trouve, avec un bouton par page pour le déplacer (séparation du groupe).',
          '« Tous vers » rassemble les joueurs sur une page et mémorise où ils étaient ; « Rétablir la disposition » les remet en place.',
        ],
      },
      repair: {
        heading: 'Réparation',
        points: [
          'La réparation remet les copies en accord avec la page source : propriétés décalées, copies manquantes, objets supprimés ou créés pendant que SyncPage ne surveillait pas.',
          "L'aperçu de la réparation montre ce qui changerait sans rien changer. Une réparation qui changerait beaucoup d'objets demande d'abord.",
          'La réparation se fait discrètement au démarrage du sandbox (paramètre). Les identifiants des objets restent les mêmes, contrairement à la 0.1.',
        ],
      },
      memory: {
        heading: 'Ce que SyncPage mémorise',
        points: [
          'Une corbeille par groupe : chaque suppression propagée et chaque nettoyage peut être annulé avec « Annuler ».',
          "La page de chaque joueur, pour qu'une séparation puisse être rétablie.",
          'Le dernier groupe utilisé, la dernière réparation et ses résultats.',
          'Les boutons qui ont besoin de données portent un code court ; ils fonctionnent une fois et expirent après 10 minutes.',
        ],
      },
      commands: {
        heading: 'Commandes',
        intro: 'MJ seulement. !sync fonctionne aussi.',
        colCommand: 'Commande',
        colDesc: 'Effet',
      },
      settings: {
        heading: 'Paramètres',
        intro:
          'Modifiez les paramètres sur la carte des paramètres ou avec !syncpage set. Les paramètres de groupe peuvent être modifiés pour un seul groupe sur sa carte.',
        colKey: 'Clé',
        colName: 'Paramètre',
        colDesc: 'Signification',
        colScope: 'Portée',
        scopeGroup: 'Par groupe',
        scopeGlobal: 'Global',
      },
      api: {
        heading: 'Pour les autres Mods',
        intro: "L'objet global SyncPage :",
        colFunction: 'Fonction',
        colDesc: 'Effet',
        rows: {
          getGroup: "Le groupe d'une page : id, nom, source et pages.",
          getLinked: "Les copies liées d'un objet, par page.",
          notify:
            "Répliquer une modification faite par votre Mod (les modifications par l'API ne déclenchent aucun événement).",
          isHidden: "Indique si la copie d'un objet est masquée sur une page.",
          onSync: 'Être averti de chaque création, modification et suppression répliquée.',
          repair: 'Réparer un groupe ; { dryRun: true } compte seulement.',
        },
      },
      upgrading: {
        heading: 'Mise à niveau depuis 0.1',
        points: [
          'Une page dont le nom se termine par « _synced » rejoint un groupe avec la page du même nom sans ce suffixe, qui devient la source. Vous pouvez renommer les pages ensuite.',
          'Les anciens liens sont conservés ; tout le reste est associé par position et par image.',
          'Les indicateurs Show/Hide dans les Notes du MJ deviennent des copies masquées, et leur texte est retiré des Notes du MJ.',
          "Une commande personnalisée de l'ancienne configuration fonctionne toujours. « True Copy » n'existe plus : utilisez « Dupliquer la page ».",
        ],
      },
      troubleshooting: {
        heading: 'Dépannage',
        points: [
          "Un jeton copié avec la mauvaise image : l'API ne peut pas copier les illustrations du marketplace. Faites la copie avec « Dupliquer la page » et ajoutez-la au groupe.",
          "Des copies désaccordées après qu'un autre Mod a modifié des éléments : lancez Réparer, ou demandez à l'auteur de ce Mod d'appeler SyncPage.notify.",
          'Vous voulez réorganiser une copie volontairement ? Mettez le groupe en pause, faites les modifications, puis cliquez sur Reprendre et choisissez de ne pas réparer.',
        ],
      },
      languages: {
        heading: 'Langues',
        body: 'Choisissez la langue sur la carte des paramètres. Les menus, les messages et ces aides de jeu la suivent.',
        colLanguage: 'Langue',
        colNative: 'Nom natif',
        colCode: 'Code',
      },
      credits: {
        heading: 'Crédits',
        original: 'Mod original par',
        maintainer: 'Réécrit et maintenu par',
        support: 'Merci de signaler les problèmes sur le forum Roll20 ou sur GitHub.',
      },
    },
  };

  var localeDe = {
    titles: {
      ready: 'SyncPage ist bereit.',
      group: 'Sync-Gruppe: {name}',
      players: 'Spieler: {name}',
      settings: 'SyncPage-Einstellungen',
      groupSettings: 'Einstellungen für {name}',
      status: 'SyncPage-Status',
      recycle: 'Papierkorb: {name}',
      dryRun: 'Reparaturvorschau: {name}',
      repaired: 'Repariert: {name}',
      repairedOnStart: 'SyncPage hat Ihre Gruppen repariert',
      help: 'SyncPage-Befehle',
      deleted: 'Auf einer Seite gelöscht',
      leftovers: 'Objekte ohne Gegenstück',
      warning: 'SyncPage',
    },
    messages: {
      readyHint: 'Geben Sie !syncpage ein, um das Menü zu öffnen.',
      migrated:
        'Ihre Einrichtung von SyncPage 0.1 wurde übernommen: {groups} Gruppe(n), {links} Verknüpfung(en) behalten, {hidden} ausgeblendete Kopie(n). Seiten, deren Name auf „_synced“ endet, können jetzt umbenannt werden.',
      trueCopyGone:
        'Die alte Funktion „True Copy“ gibt es nicht mehr: Verwenden Sie „Seite duplizieren“ von Roll20 und fügen Sie die Kopie dann einer Gruppe hinzu.',
      groupCreated:
        'Gruppe „{name}“ aus {page} erstellt, mit {count} Objekt(en). Duplizieren Sie die Seite und fügen Sie die Kopie dann mit „Diese Seite einer Gruppe hinzufügen“ hinzu.',
      pageAdded:
        '{page} ist „{name}“ beigetreten: {paired} zugeordnet, {copied} kopiert, {failed} nicht kopierbar, {leftovers} ohne Gegenstück.',
      pageRemoved: '{page} hat „{name}“ verlassen. Die Objekte bleiben, ohne Verknüpfung.',
      groupDeleted: 'Gruppe „{name}“ gelöscht. Die Objekte bleiben auf ihren Seiten.',
      notConfirmed: 'Nichts wurde geändert (nicht bestätigt).',
      hidden: '{count} Kopie(n) ausgeblendet. {skipped} Objekt(e) sind nicht verknüpft.',
      shown: '{count} Kopie(n) eingeblendet. {skipped} Objekt(e) sind nicht verknüpft.',
      hideFallback:
        '{count} Kopie(n) verwenden ein Bild, das die API nicht neu erstellen kann. Sie wurden deshalb auf die SL-Ebene verschoben statt entfernt.',
      deletedAsk:
        '{name} wurde auf {page} gelöscht. Die Kopien auf den anderen Seiten sind noch da.',
      deletedEverywhere: '{count} weitere Kopie(n) gelöscht. „Rückgängig“ stellt sie wieder her.',
      keptOthers: 'Die anderen Kopien bleiben.',
      restored:
        '{count} Objekt(e) wiederhergestellt. {failed} konnten nicht wiederhergestellt werden.',
      nothingToUndo: 'Es gibt nichts rückgängig zu machen.',
      recycleEmptied: 'Der Papierkorb ist leer.',
      leftovers:
        '{count} Objekt(e) auf {page} haben kein Gegenstück in der Gruppe. Auf die anderen Seiten kopieren oder nur auf dieser Seite behalten?',
      andMore: '…und {count} weitere.',
      leftoversCopied: '{count} Objekt(e) auf die anderen Seiten kopiert.',
      leftoversKept: '{count} Objekt(e) nur auf ihrer Seite behalten.',
      imageNotCopied:
        '{name} auf {page} verwendet ein Bild, das die API nicht kopieren kann (Marketplace-Grafik). Erstellen Sie Kopien damit über „Seite duplizieren“ von Roll20 und fügen Sie die Kopie dann der Gruppe hinzu.',
      moved: '{player} wurde nach {page} verschoben.',
      movedAll:
        '{count} Spieler nach {page} verschoben. „Aufteilung wiederherstellen“ bringt sie zurück.',
      layoutSaved: 'Gemerkt, wo {count} Spieler sind.',
      layoutRestored: '{count} Spieler zurückverschoben.',
      layoutReset: 'Die gemerkte Aufteilung wurde gelöscht.',
      unlinked: '{count} Objekt(e) entkoppelt. Sie bleiben nur auf dieser Seite.',
      paused:
        'Die Spiegelung für „{name}“ ist pausiert. Änderungen bleiben auf der Seite, auf der sie gemacht werden, bis Sie fortsetzen.',
      resumed: 'Die Spiegelung für „{name}“ ist wieder aktiv. {count} Unterschied(e) gefunden.',
      settingsReset: 'Einstellungen auf die Standardwerte zurückgesetzt.',
      resetMoved: 'Verwenden Sie {command}, um die Standardeinstellungen wiederherzustellen.',
      handouts: 'Die Handouts Help und Command Deck wurden neu erstellt.',
      pruned: 'Aufgeräumt: {links} leere Verknüpfung(en), {pages} fehlende Seite(n).',
      startRepair:
        '{name}: {drifted} abgewichen, {recreated} neu erstellt, {removed} entfernt, {mirrored} neue(s) Objekt(e) kopiert.',
    },
    errors: {
      hint: 'Geben Sie {command} help ein, um die Befehle zu sehen.',
      gmOnly: 'Nur die Spielleitung kann SyncPage verwenden.',
      unknownCommand: 'Unbekannter Befehl: {command}.',
      unknownSetting: 'Unbekannte Einstellung: {key}.',
      badValue: '„{value}“ ist kein gültiger Wert für {key}.',
      globalOnly: '{key} gilt für alle Gruppen und kann nicht für eine einzelne geändert werden.',
      noGroup: 'Keine Sync-Gruppe für „{name}“ gefunden.',
      groupExists: 'Es gibt bereits eine Gruppe namens „{name}“.',
      noName: 'Geben Sie einen Namen an.',
      pageInGroup: '{page} ist bereits in der Gruppe „{group}“.',
      pageNotInGroup: '{page} ist nicht in der Gruppe „{name}“.',
      nothingSelected: 'Wählen Sie zuerst ein oder mehrere Objekte aus.',
      noPage: 'Keine Seite für „{page}“ gefunden.',
      noPlayer: 'Kein Spieler für „{player}“ gefunden.',
      requestExpired: 'Diese Schaltfläche ist abgelaufen. Öffnen Sie die Karte erneut.',
      requestUnknown: 'Diese Schaltfläche wurde bereits verwendet.',
    },
    menu: {
      thisPage: 'Diese Seite',
      group: 'Gruppe',
      source: 'Quelle',
      copy: 'Kopie',
      paused: 'Pausiert',
      notInGroup: 'Diese Seite ist in keiner Sync-Gruppe.',
      duplicateHint:
        'Tipp: Erstellen Sie eine Gruppe aus Ihrer Kartenseite, wenden Sie „Seite duplizieren“ von Roll20 darauf an, wechseln Sie zur Kopie und fügen Sie sie der Gruppe hinzu. So behalten Kopien ihre Marketplace-Grafiken.',
      selectedHint: 'Ausblenden und Einblenden wirken auf die ausgewählten Objekte.',
      groups: 'Gruppen',
    },
    group: {
      pages: 'Seiten (★ = Quelle)',
      playersCount: '{count} Spieler',
      sourceHint: 'Die Quellseite ist die Referenz für Reparaturen.',
      summary: 'Übersicht',
      links: 'Verknüpfte Objekte',
      hidden: 'Ausgeblendete Kopien',
      recycle: 'Im Papierkorb',
      overrides: 'Eigene Einstellungen',
      none: 'keine',
      lastRepair: 'Letzte Reparatur {when}: {drifted} abgewichen, {recreated} neu erstellt.',
    },
    players: {
      none: 'In diesem Spiel gibt es noch keine Spieler.',
      elsewhere: 'nicht in dieser Gruppe',
      visibility: 'Ausgewählte Objekte: klicken, um sie auf einer Seite aus- oder einzublenden',
      selectHint:
        'Wählen Sie Token aus und öffnen Sie diese Karte erneut, um sie Seite für Seite aus- oder einzublenden.',
      shown: 'sichtbar',
      hidden: 'ausgeblendet',
      layoutSaved: 'Eine Aufteilung von {count} Spieler(n) ist gemerkt.',
      youAreOn: 'Sie sind auf {page}.',
    },
    status: {
      notLinked: 'nicht verknüpft',
      pageOnly: 'nur auf dieser Seite',
      missing: 'fehlt',
    },
    recycle: {
      empty: 'Der Papierkorb ist leer.',
      reasons: {
        delete: 'Gelöscht',
        repair: 'Reparatur',
        exclude: 'Ausgeschlossene Ebene',
        group: 'Gruppe entfernt',
      },
    },
    repair: {
      drifted: 'Abgewichene Kopien',
      recreated: 'Fehlende Kopien neu erstellt',
      removed: 'Kopien entfernt (Quelle gelöscht)',
      dropped: 'Leere Verknüpfungen entfernt',
      mirrored: 'Neue Objekte kopiert',
      leftovers: 'Neue Objekte auf Kopien',
      pageSettings: 'Seiten mit anderen Einstellungen',
      dryRunNote: 'Es wurde noch nichts geändert.',
      doneNote: 'Fertig. Entfernte Objekte liegen im Papierkorb.',
    },
    age: {
      now: 'gerade eben',
      minutes: 'vor {count} Min.',
      hours: 'vor {count} Std.',
      days: 'vor {count} Tagen',
    },
    types: {
      graphic: 'Token',
      text: 'Text',
      path: 'Zeichnung',
      pathv2: 'Zeichnung',
      door: 'Tür',
      window: 'Fenster',
    },
    values: {
      on: 'An',
      off: 'Aus',
      none: 'Keine',
    },
    queries: {
      group: 'Gruppe',
      groupName: 'Gruppenname',
      deleteGroup: 'Gruppe {name} löschen? Die Objekte bleiben auf ihren Seiten.',
      resetSettings: 'Standardeinstellungen wiederherstellen?',
      emptyRecycle: 'Papierkorb leeren? Dies kann nicht rückgängig gemacht werden.',
      yes: 'Ja',
      no: 'Nein',
    },
    buttons: {
      menu: 'Menü',
      group: 'Gruppe',
      players: 'Spieler',
      repair: 'Reparieren',
      repairNow: 'Jetzt reparieren',
      dryRun: 'Reparaturvorschau',
      pause: 'Pausieren',
      resume: 'Fortsetzen',
      status: 'Status',
      hideHere: 'Hier ausblenden',
      showHere: 'Hier einblenden',
      hideOthers: 'Anderswo ausblenden',
      showOthers: 'Anderswo einblenden',
      createGroup: 'Gruppe aus Seite erstellen',
      addToGroup: 'Diese Seite einer Gruppe hinzufügen',
      removePage: 'Aus Gruppe entfernen',
      makeSource: 'Zur Quelle machen',
      settings: 'Einstellungen',
      groupSettings: 'Gruppeneinstellungen',
      recycle: 'Papierkorb',
      undo: 'Rückgängig',
      help: 'Hilfe',
      rename: 'Umbenennen',
      deleteGroup: 'Gruppe löschen',
      everyoneTo: 'Alle nach {page}',
      saveLayout: 'Aufteilung merken',
      restoreLayout: 'Aufteilung wiederherstellen',
      useGlobal: 'Global verwenden',
      reset: 'Zurücksetzen',
      restore: 'Wiederherstellen',
      emptyRecycle: 'Leeren',
      deleteEverywhere: 'Überall löschen',
      keepOthers: 'Andere behalten',
      copy: 'Kopieren',
      keepHere: 'Hier behalten',
      copyAll: 'Alle kopieren',
      keepAll: 'Alle hier behalten',
      unlink: 'Entkoppeln',
      rebuild: 'Handouts neu erstellen',
    },
    settings: {
      deleteMode: 'Wenn ein Objekt gelöscht wird',
      hideMode: 'Wie Kopien ausgeblendet werden',
      pairLeftovers: 'Objekte ohne Gegenstück',
      newObjects: 'Neue Objekte',
      localProps: 'Pro Seite behalten (Token)',
      localPageSettings: 'Pro Seite behalten (Seiteneinstellungen)',
      excludeLayers: 'Nicht synchronisierte Ebenen',
      syncPageSettings: 'Seiteneinstellungen spiegeln',
      repairOnStart: 'Beim Start reparieren',
      playerMenu: 'Wer die Spielerkarte öffnen darf',
      recycleSize: 'Größe des Papierkorbs',
      language: 'Sprache',
      groupHint:
        'Diese Einstellungen gelten nur für diese Gruppe. „Global verwenden“ kehrt zur Haupteinstellung zurück.',
      override: 'diese Gruppe',
      global: 'global',
    },
    settingsHelp: {
      deleteMode:
        'Überall: Löschen auf einer beliebigen Seite löscht jede Kopie. Nur Quellseite: Nur Löschungen auf der Quellseite werden übertragen. Entkoppeln: nie übertragen. Fragen: eine Auswahl wird zugeflüstert.',
      hideMode:
        'SL-Ebene: Die Kopie wird auf die SL-Ebene verschoben. Entfernen: Die Kopie wird gelöscht und beim Einblenden neu erstellt, sodass die Spieler nichts finden können.',
      pairLeftovers:
        'Wenn eine Seite einer Gruppe beitritt oder repariert wird: fragen, auf die anderen Seiten kopieren oder auf ihrer Seite lassen.',
      newObjects:
        'Spiegeln: Objekte, die auf einer beliebigen Seite erstellt werden, werden kopiert. Nur Quelle: Nur Objekte von der Quellseite werden kopiert.',
      localProps:
        'Token-Eigenschaften, die jede Seite für sich behält, etwa die Sicht für einen Spieler.',
      localPageSettings:
        'Seiteneinstellungen, die jede Seite für sich behält, etwa die Dunkelheit für eine Spielergruppe.',
      excludeLayers: 'Objekte auf diesen Ebenen bleiben auf ihrer eigenen Seite.',
      syncPageSettings:
        'Seiteneinstellungen (Beleuchtung, Raster, Größe…) zwischen den Seiten der Gruppe kopieren.',
      repairOnStart:
        'Beim Start der Sandbox: still reparieren, reparieren und berichten oder nichts tun.',
      playerMenu: 'Nur SL, oder Spieler dürfen fragen, auf welcher Seite sie sind.',
      recycleSize: 'Wie viele Entfernungen jede Gruppe für „Rückgängig“ aufbewahrt.',
      language: 'Sprache der Menüs, Meldungen und Handouts.',
    },
    options: {
      deleteMode: { all: 'Überall', source: 'Nur Quellseite', unlink: 'Entkoppeln', ask: 'Fragen' },
      hideMode: { gmlayer: 'SL-Ebene', remove: 'Entfernen' },
      pairLeftovers: { ask: 'Fragen', copy: 'Kopieren', leave: 'Lassen' },
      newObjects: { mirror: 'Spiegeln', sourceOnly: 'Nur Quelle' },
      localProps: {
        gmnotes: 'SL-Notizen',
        name: 'Name',
        bars: 'Leisten',
        markers: 'Marker',
        tint: 'Färbung',
        aura: 'Auren',
        vision: 'Sicht',
        light: 'Licht',
        controlledby: 'Gesteuert von',
      },
      localPageSettings: {
        lighting: 'Beleuchtung',
        daylight: 'Tageslicht',
        explorer: 'Erkundungsmodus',
        fog: 'Nebel',
        grid: 'Raster',
        background: 'Hintergrund',
        scale: 'Größe und Maßstab',
        jukebox: 'Jukebox',
      },
      excludeLayers: {
        map: 'Karte',
        objects: 'Token',
        gmlayer: 'SL',
        foreground: 'Vordergrund',
        walls: 'Wände',
      },
      repairOnStart: { quiet: 'Still', report: 'Mit Bericht', off: 'Aus' },
      playerMenu: { gm: 'Nur SL', players: 'Auch Spieler' },
    },
    help: {
      menu: 'Das Menü öffnen.',
      groupCreate: 'Eine Sync-Gruppe aus dieser Seite erstellen.',
      groupAdd:
        'Diese Seite einer Gruppe hinzufügen: passende Objekte werden zugeordnet, fehlende kopiert.',
      groupRemove: 'Diese Seite aus ihrer Gruppe nehmen. Die Objekte bleiben, ohne Verknüpfung.',
      groupShow: 'Die Karte einer Gruppe anzeigen.',
      groupRename: 'Eine Gruppe umbenennen.',
      groupSource: 'Diese Seite zur Quelle der Gruppe machen (die Referenz für Reparaturen).',
      groupDelete: 'Eine Gruppe löschen (fragt vorher). Die Objekte bleiben.',
      players:
        'Zeigen, wer auf welcher Seite ist, mit Schaltflächen zum Verschieben und zum Aus- oder Einblenden der ausgewählten Token pro Seite.',
      move: 'Einen Spieler auf eine Seite verschieben (Gruppe aufteilen).',
      moveAll: 'Alle Spieler der Gruppe auf eine Seite verschieben und merken, wo sie waren.',
      layout: 'Merken oder wiederherstellen, auf welcher Seite jeder Spieler ist.',
      hide: 'Die Kopien der ausgewählten Objekte ausblenden: hier, auf den anderen Seiten, überall oder auf benannten Seiten.',
      show: 'Ausgeblendete Kopien wieder einblenden.',
      status: 'Die Verknüpfungen der ausgewählten Objekte zeigen und wo sie ausgeblendet sind.',
      unlink: 'Die ausgewählten Objekte nur auf dieser Seite behalten.',
      repair: 'Kopien wieder mit der Quellseite abgleichen. --dry-run berichtet nur.',
      pause: 'Die Spiegelung einer Gruppe eine Weile anhalten.',
      resume: 'Wieder spiegeln; zeigt die Unterschiede.',
      undo: 'Die letzte Entfernung zurücknehmen.',
      recycle: 'Entfernungen auflisten und beliebige davon wiederherstellen.',
      settings: 'Die Einstellungen anzeigen, global oder für eine Gruppe.',
      set: 'Eine Einstellung ändern. Listen nehmen +name oder -name an.',
      settingsReset: 'Die Standardeinstellungen wiederherstellen (fragt vorher).',
      handouts: 'Die Handouts Help und Command Deck neu erstellen.',
      help: 'Diese Liste anzeigen.',
      ids: 'Auf diese Objekte statt auf die ausgewählten wirken.',
      page: 'Auf diese Seite statt auf die angezeigte wirken.',
      footer: 'Das Handout {help} erklärt alles; {deck} hat Schaltflächen.',
    },
    deck: {
      menuTitle: 'Menü',
      menuDesc: 'Das Hauptmenü, die Spieler und die Einstellungen.',
      groupsTitle: 'Gruppen',
      groupsDesc:
        'Eine Gruppe aus der aktuellen Seite erstellen oder diese Seite einer Gruppe hinzufügen.',
      selectedTitle: 'Ausgewählte Objekte',
      selectedDesc: 'Die Kopien der ausgewählten Objekte aus- oder einblenden.',
      toolsTitle: 'Werkzeuge',
      toolsDesc: 'Reparieren, rückgängig machen, pausieren und Handouts.',
      footer: 'Wie SyncPage funktioniert, steht in {help}.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Verknüpfte Seiten für aufgeteilte Gruppen',
      footer: 'Öffnen Sie {deck} für Schaltflächen.',
      overview: {
        heading: 'Überblick',
        body: 'SyncPage hält Seiten im Gleichschritt. Seiten in einer Sync-Gruppe teilen ihre Token, Zeichnungen, Wände, Türen, Fenster, Texte und Seiteneinstellungen: Was sich auf einer Seite ändert, ändert sich auf den anderen. Mit der Gruppenaufteilung (Split Party) von Roll20 setzen Sie Spieler auf verschiedene Kopien und blenden dann Dinge pro Kopie aus oder ein, sodass jeder Spieler nur sieht, was sein Charakter sehen soll.',
        why: 'Roll20 kann ein Objekt auf einer Seite nicht nur vor einigen Spielern verbergen. Dynamische Beleuchtung gibt jedem Token seine eigene Sicht, aber nicht „dieser NSC ist nur für den Schurken unsichtbar“. Gespiegelte Seiten können das.',
      },
      quickStart: {
        heading: 'Schnellstart',
        steps: [
          'Gehen Sie auf Ihre Kartenseite, geben Sie !syncpage ein und klicken Sie dann auf „Gruppe aus Seite erstellen“.',
          'Wenden Sie „Seite duplizieren“ von Roll20 auf diese Seite an (im Menü der Seitenkarte). Damit werden Marketplace-Grafiken kopiert, was die API nicht kann.',
          'Gehen Sie zur Kopie und klicken Sie auf „Diese Seite einer Gruppe hinzufügen“. SyncPage ordnet passende Objekte zu und kopiert alles, was fehlt.',
          'Öffnen Sie Spieler, um Spieler auf die Kopie zu verschieben. Wählen Sie dann Token aus und blenden Sie sie auf einer Seite aus.',
        ],
      },
      mirroring: {
        heading: 'Was gespiegelt wird',
        points: [
          'Token (auch Jumpgate-Lichter), Texte, Legacy- und Jumpgate-Zeichnungen, Wände jeder Art, Türen und Fenster.',
          'Neue Objekte, Änderungen und Löschungen, in beide Richtungen. Löschungen folgen der Einstellung „Wenn ein Objekt gelöscht wird“.',
          'Seiteneinstellungen wie Beleuchtung, Raster und Größe, sofern nicht ausgeschaltet oder pro Seite behalten.',
          'Ebenen lassen sich pro Gruppe ausschließen, und Token-Eigenschaften wie die Sicht lassen sich pro Seite behalten.',
          'Änderungen, die andere Mods über TokenMod vornehmen, werden ebenfalls gespiegelt. Andere Mods können SyncPage.notify aufrufen; die Reparatur erfasst den Rest.',
        ],
      },
      visibility: {
        heading: 'Ausblenden pro Seite',
        points: [
          'Wählen Sie Token aus und verwenden Sie Hier ausblenden, Anderswo ausblenden oder das Raster auf der Spielerkarte.',
          'Nur die Kopie dieser Seite wird ausgeblendet. Änderungen von anderen Seiten heben das Ausblenden nie auf.',
          'Der Modus SL-Ebene verschiebt die Kopie auf die SL-Ebene. Der Modus Entfernen löscht sie und erstellt sie beim Einblenden neu, sodass die Spieler nichts auf der Seite finden können.',
        ],
      },
      players: {
        heading: 'Spieler',
        points: [
          'Die Spielerkarte listet jeden Spieler und seine Seite auf, mit einer Schaltfläche pro Seite zum Verschieben (Gruppe aufteilen).',
          '„Alle nach“ versammelt die Spieler auf einer Seite und merkt sich, wo sie waren; „Aufteilung wiederherstellen“ bringt sie zurück.',
        ],
      },
      repair: {
        heading: 'Reparatur',
        points: [
          'Die Reparatur gleicht die Kopien wieder mit der Quellseite ab: abgewichene Eigenschaften, fehlende Kopien, Objekte, die gelöscht oder erstellt wurden, während SyncPage nicht aufgepasst hat.',
          'Die Reparaturvorschau zeigt, was sich ändern würde, ohne etwas zu ändern. Eine Reparatur, die viele Objekte ändern würde, fragt vorher.',
          'Die Reparatur läuft beim Start der Sandbox still (Einstellung). Objekt-IDs bleiben gleich, anders als bei 0.1.',
        ],
      },
      memory: {
        heading: 'Was sich SyncPage merkt',
        points: [
          'Einen Papierkorb pro Gruppe: Jede übertragene Löschung und jedes Aufräumen lässt sich mit „Rückgängig“ zurücknehmen.',
          'Wo jeder Spieler war, damit eine Aufteilung wiederhergestellt werden kann.',
          'Die zuletzt verwendete Gruppe, die letzte Reparatur und ihre Ergebnisse.',
          'Schaltflächen, die Daten brauchen, tragen einen kurzen Code; sie funktionieren einmal und laufen nach 10 Minuten ab.',
        ],
      },
      commands: {
        heading: 'Befehle',
        intro: 'Nur für die SL. !sync funktioniert auch.',
        colCommand: 'Befehl',
        colDesc: 'Wirkung',
      },
      settings: {
        heading: 'Einstellungen',
        intro:
          'Ändern Sie Einstellungen auf der Einstellungskarte oder mit !syncpage set. Gruppeneinstellungen lassen sich auf der Karte einer Gruppe nur für diese ändern.',
        colKey: 'Schlüssel',
        colName: 'Einstellung',
        colDesc: 'Bedeutung',
        colScope: 'Geltung',
        scopeGroup: 'Pro Gruppe',
        scopeGlobal: 'Global',
      },
      api: {
        heading: 'Für andere Mods',
        intro: 'Das globale Objekt SyncPage:',
        colFunction: 'Funktion',
        colDesc: 'Wirkung',
        rows: {
          getGroup: 'Die Gruppe einer Seite: ID, Name, Quelle und Seiten.',
          getLinked: 'Die verknüpften Kopien eines Objekts, nach Seite.',
          notify: 'Eine Änderung Ihres Mods spiegeln (API-Änderungen lösen keine Ereignisse aus).',
          isHidden: 'Ob die Kopie eines Objekts auf einer Seite ausgeblendet ist.',
          onSync: 'Über jedes gespiegelte Erstellen, Ändern und Löschen informiert werden.',
          repair: 'Eine Gruppe reparieren; { dryRun: true } zählt nur.',
        },
      },
      upgrading: {
        heading: 'Umstieg von 0.1',
        points: [
          'Eine Seite, deren Name auf „_synced“ endet, bildet eine Gruppe mit der gleichnamigen Seite ohne diese Endung, die zur Quelle wird. Sie können die Seiten danach umbenennen.',
          'Alte Verknüpfungen bleiben erhalten; alles andere wird nach Position und Bild zugeordnet.',
          'Show/Hide-Markierungen in den SL-Notizen werden zu ausgeblendeten Kopien, und der Markierungstext wird aus den SL-Notizen entfernt.',
          'Ein eigener Befehl aus der alten Konfiguration funktioniert weiterhin. „True Copy“ gibt es nicht mehr: Verwenden Sie „Seite duplizieren“.',
        ],
      },
      troubleshooting: {
        heading: 'Fehlerbehebung',
        points: [
          'Ein Token wurde mit dem falschen Bild kopiert: Die API kann keine Marketplace-Grafiken kopieren. Erstellen Sie die Kopie mit „Seite duplizieren“ und fügen Sie sie der Gruppe hinzu.',
          'Kopien sind nicht mehr abgeglichen, nachdem ein anderer Mod etwas geändert hat: Führen Sie Reparieren aus oder bitten Sie den Autor dieses Mods, SyncPage.notify aufzurufen.',
          'Sie möchten eine Kopie absichtlich umgestalten? Pausieren Sie die Gruppe, nehmen Sie die Änderungen vor, klicken Sie dann auf Fortsetzen und wählen Sie, nicht zu reparieren.',
        ],
      },
      languages: {
        heading: 'Sprachen',
        body: 'Stellen Sie die Sprache auf der Einstellungskarte ein. Menüs, Meldungen und diese Handouts richten sich danach.',
        colLanguage: 'Sprache',
        colNative: 'Eigenname',
        colCode: 'Code',
      },
      credits: {
        heading: 'Danksagung',
        original: 'Ursprünglicher Mod von',
        maintainer: 'Neu geschrieben und gepflegt von',
        support: 'Bitte melden Sie Probleme im Roll20-Forum oder auf GitHub.',
      },
    },
  };

  var localeEl = {
    titles: {
      ready: 'Το SyncPage είναι έτοιμο.',
      group: 'Ομάδα συγχρονισμού: {name}',
      players: 'Παίκτες: {name}',
      settings: 'Ρυθμίσεις SyncPage',
      groupSettings: 'Ρυθμίσεις για {name}',
      status: 'Κατάσταση SyncPage',
      recycle: 'Κάδος: {name}',
      dryRun: 'Προεπισκόπηση επιδιόρθωσης: {name}',
      repaired: 'Επιδιορθώθηκε: {name}',
      repairedOnStart: 'Το SyncPage επιδιόρθωσε τις ομάδες σας',
      help: 'Εντολές SyncPage',
      deleted: 'Διαγράφηκε σε μία σελίδα',
      leftovers: 'Αντικείμενα χωρίς ταίρι',
      warning: 'SyncPage',
    },
    messages: {
      readyHint: 'Γράψτε !syncpage για να ανοίξει το μενού.',
      migrated:
        'Η διαμόρφωση του SyncPage 0.1 μεταφέρθηκε. Ομάδες: {groups}, συνδέσεις που κρατήθηκαν: {links}, κρυμμένα αντίγραφα: {hidden}. Οι σελίδες με όνομα που τελειώνει σε "_synced" μπορούν πλέον να μετονομαστούν.',
      trueCopyGone:
        'Η παλιά λειτουργία «True Copy» καταργήθηκε: χρησιμοποιήστε το «Διπλασιασμός σελίδας» του Roll20 και μετά προσθέστε το αντίγραφο σε μια ομάδα.',
      groupCreated:
        'Η ομάδα «{name}» δημιουργήθηκε από τη σελίδα {page}. Αντικείμενα: {count}. Διπλασιάστε τη σελίδα και μετά προσθέστε το αντίγραφο με το «Προσθήκη σελίδας σε ομάδα».',
      pageAdded:
        'Η σελίδα {page} μπήκε στην «{name}». Ζευγαρώθηκαν: {paired}, αντιγράφηκαν: {copied}, δεν αντιγράφηκαν: {failed}, χωρίς ταίρι: {leftovers}.',
      pageRemoved:
        'Η σελίδα {page} βγήκε από την «{name}». Τα αντικείμενά της μένουν, χωρίς σύνδεση.',
      groupDeleted: 'Η ομάδα «{name}» διαγράφηκε. Τα αντικείμενα μένουν στις σελίδες τους.',
      notConfirmed: 'Δεν άλλαξε τίποτα (δεν επιβεβαιώθηκε).',
      hidden: 'Κρυμμένα αντίγραφα: {count}. Αντικείμενα χωρίς σύνδεση: {skipped}.',
      shown: 'Εμφανισμένα αντίγραφα: {count}. Αντικείμενα χωρίς σύνδεση: {skipped}.',
      hideFallback:
        'Αντίγραφα με εικόνα που το API δεν μπορεί να ξαναδημιουργήσει: {count}. Μεταφέρθηκαν στο επίπεδο Αφηγητή αντί να αφαιρεθούν.',
      deletedAsk:
        'Το {name} διαγράφηκε στη σελίδα {page}. Τα αντίγραφά του στις άλλες σελίδες υπάρχουν ακόμη.',
      deletedEverywhere: 'Διαγράφηκαν άλλα αντίγραφα: {count}. Η Αναίρεση τα επαναφέρει.',
      keptOthers: 'Τα άλλα αντίγραφα μένουν.',
      restored: 'Αντικείμενα που επανήλθαν: {count}. Δεν επανήλθαν: {failed}.',
      nothingToUndo: 'Δεν υπάρχει κάτι για αναίρεση.',
      recycleEmptied: 'Ο κάδος άδειασε.',
      leftovers:
        'Αντικείμενα στη σελίδα {page} χωρίς ταίρι στην ομάδα: {count}. Να αντιγραφούν στις άλλες σελίδες ή να μείνουν μόνο σε αυτή;',
      andMore: '…και {count} ακόμη.',
      leftoversCopied: 'Αντικείμενα που αντιγράφηκαν στις άλλες σελίδες: {count}.',
      leftoversKept: 'Αντικείμενα που έμειναν μόνο στη σελίδα τους: {count}.',
      imageNotCopied:
        'Το {name} στη σελίδα {page} χρησιμοποιεί εικόνα που το API δεν μπορεί να αντιγράψει (γραφικά από το Marketplace). Φτιάξτε αντίγραφα με το «Διπλασιασμός σελίδας» του Roll20 και μετά προσθέστε το αντίγραφο στην ομάδα.',
      moved: 'Ο παίκτης {player} μετακινήθηκε στη σελίδα {page}.',
      movedAll:
        'Παίκτες που μετακινήθηκαν στη σελίδα {page}: {count}. Το «Επαναφορά διάταξης» τους γυρίζει πίσω.',
      layoutSaved: 'Η θέση των παικτών αποθηκεύτηκε. Παίκτες: {count}.',
      layoutRestored: 'Παίκτες που γύρισαν πίσω: {count}.',
      layoutReset: 'Η αποθηκευμένη διάταξη διαγράφηκε.',
      unlinked: 'Αποσυνδέθηκαν αντικείμενα: {count}. Μένουν μόνο σε αυτή τη σελίδα.',
      paused:
        'Ο κατοπτρισμός για την «{name}» είναι σε παύση. Οι αλλαγές μένουν στη σελίδα όπου γίνονται μέχρι να τον συνεχίσετε.',
      resumed: 'Ο κατοπτρισμός για την «{name}» λειτουργεί ξανά. Διαφορές που βρέθηκαν: {count}.',
      settingsReset: 'Οι ρυθμίσεις επανήλθαν στις προεπιλογές.',
      resetMoved: 'Χρησιμοποιήστε {command} για επαναφορά των προεπιλεγμένων ρυθμίσεων.',
      handouts: 'Τα φυλλάδια Βοήθειας και Πίνακα εντολών ξαναφτιάχτηκαν.',
      pruned: 'Τακτοποίηση: κενές συνδέσεις {links}, σελίδες που λείπουν {pages}.',
      startRepair:
        '{name}: μετατοπισμένα {drifted}, ξαναδημιουργημένα {recreated}, αφαιρεμένα {removed}, νέα αντικείμενα που αντιγράφηκαν {mirrored}.',
    },
    errors: {
      hint: 'Γράψτε {command} help για τις εντολές.',
      gmOnly: 'Μόνο ο Αφηγητής μπορεί να χρησιμοποιήσει το SyncPage.',
      unknownCommand: 'Άγνωστη εντολή: {command}.',
      unknownSetting: 'Άγνωστη ρύθμιση: {key}.',
      badValue: 'Το «{value}» δεν είναι έγκυρη τιμή για {key}.',
      globalOnly: 'Το {key} ισχύει για όλες τις ομάδες και δεν αλλάζει για μία μόνο.',
      noGroup: 'Δεν βρέθηκε ομάδα συγχρονισμού για «{name}».',
      groupExists: 'Υπάρχει ήδη ομάδα με όνομα «{name}».',
      noName: 'Δώστε ένα όνομα.',
      pageInGroup: 'Η σελίδα {page} είναι ήδη στην ομάδα «{group}».',
      pageNotInGroup: 'Η σελίδα {page} δεν είναι στην ομάδα «{name}».',
      nothingSelected: 'Επιλέξτε πρώτα ένα ή περισσότερα αντικείμενα.',
      noPage: 'Δεν βρέθηκε σελίδα για «{page}».',
      noPlayer: 'Δεν βρέθηκε παίκτης για «{player}».',
      requestExpired: 'Αυτό το κουμπί έληξε. Ανοίξτε ξανά την κάρτα.',
      requestUnknown: 'Αυτό το κουμπί έχει ήδη χρησιμοποιηθεί.',
    },
    menu: {
      thisPage: 'Αυτή η σελίδα',
      group: 'Ομάδα',
      source: 'πηγή',
      copy: 'αντίγραφο',
      paused: 'Σε παύση',
      notInGroup: 'Αυτή η σελίδα δεν ανήκει σε ομάδα συγχρονισμού.',
      duplicateHint:
        'Συμβουλή: φτιάξτε μια ομάδα από τη σελίδα του χάρτη σας, εφαρμόστε της το «Διπλασιασμός σελίδας» του Roll20, πηγαίνετε στο αντίγραφο και προσθέστε το στην ομάδα. Έτσι τα αντίγραφα κρατούν τα γραφικά του Marketplace.',
      selectedHint: 'Η Απόκρυψη και η Εμφάνιση αφορούν τα επιλεγμένα αντικείμενα.',
      groups: 'Ομάδες',
    },
    group: {
      pages: 'Σελίδες (★ = πηγή)',
      playersCount: 'Παίκτες: {count}',
      sourceHint: 'Η σελίδα-πηγή είναι το πρότυπο για τις επιδιορθώσεις.',
      summary: 'Σύνοψη',
      links: 'Συνδεδεμένα αντικείμενα',
      hidden: 'Κρυμμένα αντίγραφα',
      recycle: 'Στον κάδο',
      overrides: 'Δικές της ρυθμίσεις',
      none: 'καμία',
      lastRepair:
        'Τελευταία επιδιόρθωση {when}: μετατοπισμένα {drifted}, ξαναδημιουργημένα {recreated}.',
    },
    players: {
      none: 'Δεν υπάρχουν ακόμη παίκτες σε αυτό το παιχνίδι.',
      elsewhere: 'όχι σε αυτή την ομάδα',
      visibility: 'Επιλεγμένα αντικείμενα: πατήστε για απόκρυψη ή εμφάνιση σε μια σελίδα',
      selectHint:
        'Επιλέξτε πιόνια και ανοίξτε ξανά αυτή την κάρτα για να τα κρύψετε ή να τα εμφανίσετε ανά σελίδα.',
      shown: 'ορατό',
      hidden: 'κρυφό',
      layoutSaved: 'Υπάρχει αποθηκευμένη διάταξη. Παίκτες: {count}.',
      youAreOn: 'Είστε στη σελίδα {page}.',
    },
    status: {
      notLinked: 'χωρίς σύνδεση',
      pageOnly: 'μόνο σε αυτή τη σελίδα',
      missing: 'λείπει',
    },
    recycle: {
      empty: 'Ο κάδος είναι άδειος.',
      reasons: {
        delete: 'Διαγραφή',
        repair: 'Επιδιόρθωση',
        exclude: 'Εξαιρούμενο επίπεδο',
        group: 'Η ομάδα αφαιρέθηκε',
      },
    },
    repair: {
      drifted: 'Αντίγραφα που μετατοπίστηκαν',
      recreated: 'Αντίγραφα που έλειπαν και ξαναδημιουργήθηκαν',
      removed: 'Αντίγραφα που αφαιρέθηκαν (η πηγή διαγράφηκε)',
      dropped: 'Κενές συνδέσεις που αφαιρέθηκαν',
      mirrored: 'Νέα αντικείμενα που αντιγράφηκαν',
      leftovers: 'Νέα αντικείμενα στα αντίγραφα',
      pageSettings: 'Σελίδες με άλλες ρυθμίσεις',
      dryRunNote: 'Δεν έχει αλλάξει τίποτα ακόμη.',
      doneNote: 'Έγινε. Τα αντικείμενα που αφαιρέθηκαν είναι στον κάδο.',
    },
    age: {
      now: 'μόλις τώρα',
      minutes: 'πριν από {count} λεπ.',
      hours: 'πριν από {count} ώρ.',
      days: 'πριν από {count} ημ.',
    },
    types: {
      graphic: 'Πιόνι',
      text: 'Κείμενο',
      path: 'Σχέδιο',
      pathv2: 'Σχέδιο',
      door: 'Πόρτα',
      window: 'Παράθυρο',
    },
    values: {
      on: 'Ναι',
      off: 'Όχι',
      none: 'Κανένα',
    },
    queries: {
      group: 'Ομάδα',
      groupName: 'Όνομα ομάδας',
      deleteGroup: 'Διαγραφή της ομάδας {name}; Τα αντικείμενα μένουν στις σελίδες τους.',
      resetSettings: 'Επαναφορά των προεπιλεγμένων ρυθμίσεων;',
      emptyRecycle: 'Άδειασμα του κάδου; Δεν αναιρείται.',
      yes: 'Ναι',
      no: 'Όχι',
    },
    buttons: {
      menu: 'Μενού',
      group: 'Ομάδα',
      players: 'Παίκτες',
      repair: 'Επιδιόρθωση',
      repairNow: 'Επιδιόρθωση τώρα',
      dryRun: 'Προεπισκόπηση',
      pause: 'Παύση',
      resume: 'Συνέχεια',
      status: 'Κατάσταση',
      hideHere: 'Απόκρυψη εδώ',
      showHere: 'Εμφάνιση εδώ',
      hideOthers: 'Απόκρυψη αλλού',
      showOthers: 'Εμφάνιση αλλού',
      createGroup: 'Ομάδα από τη σελίδα',
      addToGroup: 'Προσθήκη σελίδας σε ομάδα',
      removePage: 'Αφαίρεση από ομάδα',
      makeSource: 'Ορισμός ως πηγή',
      settings: 'Ρυθμίσεις',
      groupSettings: 'Ρυθμίσεις ομάδας',
      recycle: 'Κάδος',
      undo: 'Αναίρεση',
      help: 'Βοήθεια',
      rename: 'Μετονομασία',
      deleteGroup: 'Διαγραφή ομάδας',
      everyoneTo: 'Όλοι σε {page}',
      saveLayout: 'Αποθήκευση διάταξης',
      restoreLayout: 'Επαναφορά διάταξης',
      useGlobal: 'Γενική ρύθμιση',
      reset: 'Επαναφορά ρυθμίσεων',
      restore: 'Επαναφορά',
      emptyRecycle: 'Άδειασμα',
      deleteEverywhere: 'Διαγραφή παντού',
      keepOthers: 'Κράτα τα άλλα',
      copy: 'Αντιγραφή',
      keepHere: 'Κράτα εδώ',
      copyAll: 'Αντιγραφή όλων',
      keepAll: 'Κράτα όλα εδώ',
      unlink: 'Αποσύνδεση',
      rebuild: 'Νέα φυλλάδια',
    },
    settings: {
      deleteMode: 'Όταν διαγράφεται αντικείμενο',
      hideMode: 'Πώς κρύβονται τα αντίγραφα',
      pairLeftovers: 'Αντικείμενα χωρίς ταίρι',
      newObjects: 'Νέα αντικείμενα',
      localProps: 'Ανά σελίδα (πιόνια)',
      localPageSettings: 'Ανά σελίδα (ρυθμίσεις σελίδας)',
      excludeLayers: 'Επίπεδα χωρίς συγχρονισμό',
      syncPageSettings: 'Κατοπτρισμός ρυθμίσεων σελίδας',
      repairOnStart: 'Επιδιόρθωση στην εκκίνηση',
      playerMenu: 'Ποιος ανοίγει την κάρτα παικτών',
      recycleSize: 'Μέγεθος κάδου',
      language: 'Γλώσσα',
      groupHint:
        'Οι ρυθμίσεις εδώ ισχύουν μόνο για αυτή την ομάδα. Το «Γενική ρύθμιση» επιστρέφει στην κύρια ρύθμιση.',
      override: 'αυτή η ομάδα',
      global: 'γενική',
    },
    settingsHelp: {
      deleteMode:
        'Παντού: η διαγραφή σε οποιαδήποτε σελίδα διαγράφει όλα τα αντίγραφα. Μόνο σελίδα-πηγή: διαδίδονται μόνο οι διαγραφές στη σελίδα-πηγή. Αποσύνδεση: δεν διαδίδονται ποτέ. Ερώτηση: ψιθυρίζεται μια επιλογή.',
      hideMode:
        'Επίπεδο Αφηγητή: το αντίγραφο πηγαίνει στο επίπεδο Αφηγητή. Αφαίρεση: το αντίγραφο διαγράφεται και ξαναφτιάχνεται όταν εμφανιστεί, ώστε να μη μένει τίποτα για να βρουν οι παίκτες.',
      pairLeftovers:
        'Όταν μια σελίδα μπαίνει σε ομάδα ή επιδιορθώνεται: ερώτηση, αντιγραφή στις άλλες σελίδες ή παραμονή στη σελίδα τους.',
      newObjects:
        'Κατοπτρισμός: αντιγράφονται τα αντικείμενα που φτιάχνονται σε οποιαδήποτε σελίδα. Μόνο πηγή: αντιγράφονται μόνο όσα φτιάχνονται στη σελίδα-πηγή.',
      localProps:
        'Ιδιότητες πιονιών που κάθε σελίδα κρατά για τον εαυτό της, όπως η όραση για έναν παίκτη.',
      localPageSettings:
        'Ρυθμίσεις που κάθε σελίδα κρατά για τον εαυτό της, όπως το σκοτάδι για μια ομάδα παικτών.',
      excludeLayers: 'Τα αντικείμενα σε αυτά τα επίπεδα μένουν στη σελίδα τους.',
      syncPageSettings:
        'Αντιγραφή ρυθμίσεων σελίδας (φωτισμός, πλέγμα, μέγεθος…) μεταξύ των σελίδων της ομάδας.',
      repairOnStart:
        'Όταν ξεκινά το sandbox: αθόρυβη επιδιόρθωση, επιδιόρθωση με αναφορά ή τίποτα.',
      playerMenu: 'Μόνο ο Αφηγητής ή και οι παίκτες, για να ρωτήσουν σε ποια σελίδα είναι.',
      recycleSize: 'Πόσες αφαιρέσεις κρατά κάθε ομάδα για την Αναίρεση.',
      language: 'Γλώσσα των μενού, των μηνυμάτων και των φυλλαδίων.',
    },
    options: {
      deleteMode: {
        all: 'Παντού',
        source: 'Μόνο σελίδα-πηγή',
        unlink: 'Αποσύνδεση',
        ask: 'Ερώτηση',
      },
      hideMode: { gmlayer: 'Επίπεδο Αφηγητή', remove: 'Αφαίρεση' },
      pairLeftovers: { ask: 'Ερώτηση', copy: 'Αντιγραφή', leave: 'Παραμονή' },
      newObjects: { mirror: 'Κατοπτρισμός', sourceOnly: 'Μόνο πηγή' },
      localProps: {
        gmnotes: 'Σημειώσεις Αφηγητή',
        name: 'Όνομα',
        bars: 'Μπάρες',
        markers: 'Σημάδια',
        tint: 'Απόχρωση',
        aura: 'Αύρες',
        vision: 'Όραση',
        light: 'Φως',
        controlledby: 'Ελέγχεται από',
      },
      localPageSettings: {
        lighting: 'Φωτισμός',
        daylight: 'Φως ημέρας',
        explorer: 'Λειτουργία εξερεύνησης',
        fog: 'Ομίχλη',
        grid: 'Πλέγμα',
        background: 'Φόντο',
        scale: 'Μέγεθος και κλίμακα',
        jukebox: 'Jukebox',
      },
      excludeLayers: {
        map: 'Χάρτης',
        objects: 'Πιόνια',
        gmlayer: 'Αφηγητής',
        foreground: 'Προσκήνιο',
        walls: 'Τοίχοι',
      },
      repairOnStart: { quiet: 'Αθόρυβα', report: 'Με αναφορά', off: 'Όχι' },
      playerMenu: { gm: 'Μόνο Αφηγητής', players: 'Και οι παίκτες' },
    },
    help: {
      menu: 'Άνοιγμα του μενού.',
      groupCreate: 'Δημιουργία ομάδας συγχρονισμού από αυτή τη σελίδα.',
      groupAdd:
        'Προσθήκη αυτής της σελίδας σε ομάδα: τα αντικείμενα που ταιριάζουν ζευγαρώνονται και όσα λείπουν αντιγράφονται.',
      groupRemove:
        'Αφαίρεση αυτής της σελίδας από την ομάδα της. Τα αντικείμενα μένουν, χωρίς σύνδεση.',
      groupShow: 'Εμφάνιση της κάρτας μιας ομάδας.',
      groupRename: 'Μετονομασία ομάδας.',
      groupSource:
        'Ορισμός αυτής της σελίδας ως πηγής της ομάδας (το πρότυπο για τις επιδιορθώσεις).',
      groupDelete: 'Διαγραφή ομάδας (με ερώτηση πρώτα). Τα αντικείμενα μένουν.',
      players:
        'Δείχνει ποιος είναι σε ποια σελίδα, με κουμπιά για μετακίνηση και για απόκρυψη ή εμφάνιση των επιλεγμένων πιονιών ανά σελίδα.',
      move: 'Μετακίνηση ενός παίκτη σε μια σελίδα (χωρισμός της παρέας).',
      moveAll:
        'Μετακίνηση όλων των παικτών της ομάδας σε μία σελίδα, με απομνημόνευση του πού ήταν.',
      layout: 'Αποθήκευση ή επαναφορά της σελίδας κάθε παίκτη.',
      hide: 'Απόκρυψη των αντιγράφων των επιλεγμένων αντικειμένων: εδώ, στις άλλες σελίδες, παντού ή σε σελίδες με όνομα.',
      show: 'Εμφάνιση ξανά των κρυμμένων αντιγράφων.',
      status: 'Εμφάνιση των συνδέσεων των επιλεγμένων αντικειμένων και του πού είναι κρυμμένα.',
      unlink: 'Διατήρηση των επιλεγμένων αντικειμένων μόνο σε αυτή τη σελίδα.',
      repair:
        'Επαναφέρει τα αντίγραφα σε συμφωνία με τη σελίδα-πηγή. Το --dry-run κάνει μόνο αναφορά.',
      pause: 'Προσωρινή διακοπή του κατοπτρισμού μιας ομάδας.',
      resume: 'Ξανά κατοπτρισμός· δείχνει τι διαφέρει.',
      undo: 'Επαναφορά της τελευταίας αφαίρεσης.',
      recycle: 'Λίστα αφαιρέσεων και επαναφορά οποιασδήποτε.',
      settings: 'Εμφάνιση των ρυθμίσεων, γενικά ή για μία ομάδα.',
      set: 'Αλλαγή ρύθμισης. Οι λίστες δέχονται +name ή -name.',
      settingsReset: 'Επαναφορά των προεπιλεγμένων ρυθμίσεων (με ερώτηση πρώτα).',
      handouts: 'Νέα δημιουργία των φυλλαδίων Βοήθειας και Πίνακα εντολών.',
      help: 'Εμφάνιση αυτής της λίστας.',
      ids: 'Ενέργεια σε αυτά τα αντικείμενα αντί για τα επιλεγμένα.',
      page: 'Ενέργεια σε αυτή τη σελίδα αντί για αυτήν που βλέπετε.',
      footer: 'Το φυλλάδιο {help} εξηγεί τα πάντα· το {deck} έχει κουμπιά.',
    },
    deck: {
      menuTitle: 'Μενού',
      menuDesc: 'Το κύριο μενού, οι παίκτες και οι ρυθμίσεις.',
      groupsTitle: 'Ομάδες',
      groupsDesc: 'Φτιάξτε ομάδα από τη σελίδα όπου βρίσκεστε ή προσθέστε αυτή τη σελίδα σε ομάδα.',
      selectedTitle: 'Επιλεγμένα αντικείμενα',
      selectedDesc: 'Απόκρυψη ή εμφάνιση των αντιγράφων των επιλεγμένων αντικειμένων.',
      toolsTitle: 'Εργαλεία',
      toolsDesc: 'Επιδιόρθωση, αναίρεση, παύση και φυλλάδια.',
      footer: 'Δείτε το {help} για το πώς λειτουργεί το SyncPage.',
    },
    handout: {
      versionLabel: 'Έκδοση',
      subtitle: 'Συνδεδεμένες σελίδες για χωρισμένες παρέες',
      footer: 'Ανοίξτε το {deck} για κουμπιά.',
      overview: {
        heading: 'Επισκόπηση',
        body: 'Το SyncPage κρατά τις σελίδες σε συμφωνία. Οι σελίδες μιας ομάδας συγχρονισμού μοιράζονται πιόνια, σχέδια, τοίχους, πόρτες, παράθυρα, κείμενο και ρυθμίσεις σελίδας: ό,τι αλλάζει σε μία σελίδα αλλάζει και στις άλλες. Με τον χωρισμό της παρέας του Roll20 βάζετε τους παίκτες σε διαφορετικά αντίγραφα και μετά κρύβετε ή εμφανίζετε πράγματα ανά αντίγραφο, ώστε κάθε παίκτης να βλέπει μόνο ό,τι πρέπει να βλέπει ο χαρακτήρας του.',
        why: 'Το Roll20 δεν μπορεί να κρύψει ένα αντικείμενο μόνο από κάποιους παίκτες σε μία σελίδα. Ο δυναμικός φωτισμός δίνει σε κάθε πιόνι τη δική του όραση, αλλά όχι «αυτός ο NPC είναι αόρατος μόνο για τον κλέφτη». Οι κατοπτρισμένες σελίδες το κάνουν αυτό.',
      },
      quickStart: {
        heading: 'Γρήγορη εκκίνηση',
        steps: [
          'Πηγαίνετε στη σελίδα του χάρτη σας, γράψτε !syncpage και πατήστε «Ομάδα από τη σελίδα».',
          'Εφαρμόστε το «Διπλασιασμός σελίδας» του Roll20 σε εκείνη τη σελίδα (από το μενού της κάρτας σελίδας). Αντιγράφει τα γραφικά του Marketplace, κάτι που το API δεν μπορεί.',
          'Πηγαίνετε στο αντίγραφο και πατήστε «Προσθήκη σελίδας σε ομάδα». Το SyncPage ζευγαρώνει τα αντικείμενα που ταιριάζουν και αντιγράφει όσα λείπουν.',
          'Ανοίξτε τους Παίκτες για να μετακινήσετε παίκτες στο αντίγραφο, μετά επιλέξτε πιόνια και κρύψτε τα σε μία σελίδα.',
        ],
      },
      mirroring: {
        heading: 'Τι κατοπτρίζεται',
        points: [
          'Πιόνια (μαζί με τα φώτα του Jumpgate), κείμενο, σχέδια Legacy και Jumpgate, τοίχοι κάθε είδους, πόρτες και παράθυρα.',
          'Νέα αντικείμενα, αλλαγές και διαγραφές, προς τις δύο κατευθύνσεις. Οι διαγραφές ακολουθούν τη ρύθμιση «Όταν διαγράφεται αντικείμενο».',
          'Ρυθμίσεις σελίδας όπως φωτισμός, πλέγμα και μέγεθος, εκτός αν είναι απενεργοποιημένες ή κρατούνται ανά σελίδα.',
          'Επίπεδα μπορούν να εξαιρεθούν ανά ομάδα, και ιδιότητες πιονιών όπως η όραση μπορούν να κρατηθούν ανά σελίδα.',
          'Οι αλλαγές που κάνουν άλλα Mod μέσω του TokenMod κατοπτρίζονται κι αυτές. Άλλα Mod μπορούν να καλούν το SyncPage.notify· η επιδιόρθωση πιάνει τα υπόλοιπα.',
        ],
      },
      visibility: {
        heading: 'Απόκρυψη ανά σελίδα',
        points: [
          'Επιλέξτε πιόνια και χρησιμοποιήστε το «Απόκρυψη εδώ», το «Απόκρυψη αλλού» ή το πλέγμα στην κάρτα Παικτών.',
          'Κρύβεται μόνο το αντίγραφο εκείνης της σελίδας. Οι αλλαγές από άλλες σελίδες δεν αναιρούν ποτέ την απόκρυψη.',
          'Η λειτουργία «Επίπεδο Αφηγητή» μεταφέρει το αντίγραφο στο επίπεδο Αφηγητή. Η λειτουργία «Αφαίρεση» το διαγράφει και το ξαναφτιάχνει όταν εμφανιστεί, ώστε να μη μένει τίποτα στη σελίδα για να βρουν οι παίκτες.',
        ],
      },
      players: {
        heading: 'Παίκτες',
        points: [
          'Η κάρτα Παικτών δείχνει κάθε παίκτη και τη σελίδα του, με ένα κουμπί ανά σελίδα για να τον μετακινήσετε (χωρισμός της παρέας).',
          'Το «Όλοι σε» μαζεύει τους παίκτες σε μία σελίδα και θυμάται πού ήταν· το «Επαναφορά διάταξης» τους γυρίζει πίσω.',
        ],
      },
      repair: {
        heading: 'Επιδιόρθωση',
        points: [
          'Η επιδιόρθωση φέρνει τα αντίγραφα ξανά σε συμφωνία με τη σελίδα-πηγή: μετατοπισμένες ιδιότητες, αντίγραφα που λείπουν, αντικείμενα που διαγράφηκαν ή φτιάχτηκαν όσο το SyncPage δεν παρακολουθούσε.',
          'Η Προεπισκόπηση δείχνει τι θα άλλαζε χωρίς να αλλάξει τίποτα. Μια επιδιόρθωση που θα άλλαζε πολλά αντικείμενα ρωτά πρώτα.',
          'Η επιδιόρθωση τρέχει αθόρυβα όταν ξεκινά το sandbox (ρύθμιση). Τα ID των αντικειμένων μένουν ίδια, σε αντίθεση με το 0.1.',
        ],
      },
      memory: {
        heading: 'Τι θυμάται το SyncPage',
        points: [
          'Έναν κάδο ανά ομάδα: κάθε διαγραφή που διαδίδεται και κάθε τακτοποίηση μπορεί να επανέλθει με την Αναίρεση.',
          'Πού ήταν κάθε παίκτης, ώστε να μπορεί να επανέλθει ένας χωρισμός.',
          'Την τελευταία ομάδα που χρησιμοποιήσατε, την τελευταία επιδιόρθωση και τα αποτελέσματά της.',
          'Τα κουμπιά που χρειάζονται δεδομένα φέρουν έναν σύντομο κωδικό· λειτουργούν μία φορά και λήγουν μετά από 10 λεπτά.',
        ],
      },
      commands: {
        heading: 'Εντολές',
        intro: 'Μόνο για τον Αφηγητή. Λειτουργεί και το !sync.',
        colCommand: 'Εντολή',
        colDesc: 'Τι κάνει',
      },
      settings: {
        heading: 'Ρυθμίσεις',
        intro:
          'Αλλάξτε τις ρυθμίσεις στην κάρτα ρυθμίσεων ή με το !syncpage set. Οι ρυθμίσεις ομάδας μπορούν να αλλάξουν για μία ομάδα στην κάρτα της.',
        colKey: 'Κλειδί',
        colName: 'Ρύθμιση',
        colDesc: 'Σημασία',
        colScope: 'Εμβέλεια',
        scopeGroup: 'Ανά ομάδα',
        scopeGlobal: 'Γενική',
      },
      api: {
        heading: 'Για άλλα Mod',
        intro: 'Το γενικό αντικείμενο SyncPage:',
        colFunction: 'Συνάρτηση',
        colDesc: 'Τι κάνει',
        rows: {
          getGroup: 'Η ομάδα όπου ανήκει μια σελίδα: id, όνομα, πηγή και σελίδες.',
          getLinked: 'Τα συνδεδεμένα αντίγραφα ενός αντικειμένου, ανά σελίδα.',
          notify:
            'Κατοπτρισμός μιας αλλαγής που έκανε το Mod σας (οι αλλαγές μέσω API δεν προκαλούν συμβάντα).',
          isHidden: 'Αν το αντίγραφο ενός αντικειμένου είναι κρυμμένο σε μια σελίδα.',
          onSync: 'Ειδοποίηση για κάθε κατοπτρισμένη δημιουργία, αλλαγή και διαγραφή.',
          repair: 'Επιδιόρθωση ομάδας· το { dryRun: true } μόνο μετρά.',
        },
      },
      upgrading: {
        heading: 'Αναβάθμιση από το 0.1',
        points: [
          'Μια σελίδα με όνομα που τελειώνει σε "_synced" μπαίνει σε ομάδα με τη σελίδα που έχει το ίδιο όνομα χωρίς αυτή την κατάληξη, η οποία γίνεται η πηγή. Μπορείτε να μετονομάσετε τις σελίδες μετά.',
          'Οι παλιές συνδέσεις κρατιούνται· όλα τα άλλα ζευγαρώνονται με βάση τη θέση και την εικόνα.',
          'Οι σημαίες Show/Hide στις Σημειώσεις Αφηγητή γίνονται κρυμμένα αντίγραφα και το κείμενο της σημαίας αφαιρείται από τις Σημειώσεις Αφηγητή.',
          'Μια προσαρμοσμένη εντολή από την παλιά διαμόρφωση λειτουργεί ακόμη. Το «True Copy» καταργήθηκε: χρησιμοποιήστε το «Διπλασιασμός σελίδας».',
        ],
      },
      troubleshooting: {
        heading: 'Αντιμετώπιση προβλημάτων',
        points: [
          'Ένα πιόνι αντιγράφηκε με λάθος εικόνα: το API δεν μπορεί να αντιγράψει γραφικά του Marketplace. Φτιάξτε το αντίγραφο με το «Διπλασιασμός σελίδας» και προσθέστε το στην ομάδα.',
          'Αντίγραφα εκτός συμφωνίας αφού ένα άλλο Mod άλλαξε πράγματα: εκτελέστε Επιδιόρθωση ή ζητήστε από τον δημιουργό εκείνου του Mod να καλεί το SyncPage.notify.',
          'Θέλετε να αλλάξετε επίτηδες τη διάταξη ενός αντιγράφου; Βάλτε την ομάδα σε παύση, κάντε τις αλλαγές, μετά πατήστε Συνέχεια και επιλέξτε να μη γίνει επιδιόρθωση.',
        ],
      },
      languages: {
        heading: 'Γλώσσες',
        body: 'Ορίστε τη γλώσσα στην κάρτα ρυθμίσεων. Τα μενού, τα μηνύματα και αυτά τα φυλλάδια την ακολουθούν.',
        colLanguage: 'Γλώσσα',
        colNative: 'Τοπικό όνομα',
        colCode: 'Κωδικός',
      },
      credits: {
        heading: 'Συντελεστές',
        original: 'Αρχικό Mod από',
        maintainer: 'Ξαναγράφτηκε και συντηρείται από',
        support: 'Αναφέρετε προβλήματα στο φόρουμ του Roll20 ή στο GitHub.',
      },
    },
  };

  var localeHe = {
    titles: {
      ready: 'SyncPage מוכן.',
      group: 'קבוצת סנכרון: {name}',
      players: 'שחקנים: {name}',
      settings: 'הגדרות SyncPage',
      groupSettings: 'הגדרות עבור {name}',
      status: 'מצב SyncPage',
      recycle: 'סל המחזור: {name}',
      dryRun: 'תצוגה מקדימה של תיקון: {name}',
      repaired: 'תוקן: {name}',
      repairedOnStart: 'SyncPage תיקן את הקבוצות שלך',
      help: 'פקודות SyncPage',
      deleted: 'נמחק בדף אחד',
      leftovers: 'אובייקטים ללא התאמה',
      warning: 'SyncPage',
    },
    messages: {
      readyHint: 'הקלידו !syncpage כדי לפתוח את התפריט.',
      migrated:
        'ההגדרות שלך מ-SyncPage 0.1 הועברו: {groups} קבוצות, {links} קישורים נשמרו, {hidden} עותקים מוסתרים. מעכשיו אפשר לשנות את שמם של דפים ששמם מסתיים ב-"_synced".',
      trueCopyGone:
        'התכונה הישנה "True Copy" הוסרה: השתמשו ב"שכפול דף" של Roll20 עצמו, ואז הוסיפו את העותק לקבוצה.',
      groupCreated:
        'הקבוצה "{name}" נוצרה מ-{page}, עם {count} אובייקטים. שכפלו את הדף, ואז הוסיפו את העותק בעזרת "הוספת הדף הזה לקבוצה".',
      pageAdded:
        '{page} הצטרף ל-"{name}": {paired} הותאמו, {copied} הועתקו, {failed} לא ניתן היה להעתיק, {leftovers} ללא התאמה.',
      pageRemoved: '{page} עזב את "{name}". האובייקטים שלו נשארים, ללא קישור.',
      groupDeleted: 'הקבוצה "{name}" נמחקה. האובייקטים נשארים בדפים שלהם.',
      notConfirmed: 'שום דבר לא שונה (לא אושר).',
      hidden: '{count} עותקים הוסתרו. {skipped} אובייקטים אינם מקושרים.',
      shown: '{count} עותקים הוצגו. {skipped} אובייקטים אינם מקושרים.',
      hideFallback:
        '{count} עותקים משתמשים בתמונה שה-API אינו יכול ליצור מחדש, ולכן הם הועברו לשכבת ה-GM במקום להיות מוסרים.',
      deletedAsk: '{name} נמחק ב-{page}. העותקים שלו בדפים האחרים עדיין שם.',
      deletedEverywhere: '{count} עותקים אחרים נמחקו. "ביטול" מחזיר אותם.',
      keptOthers: 'העותקים האחרים נשארים.',
      restored: '{count} אובייקטים שוחזרו. {failed} לא ניתן היה לשחזר.',
      nothingToUndo: 'אין מה לבטל.',
      recycleEmptied: 'סל המחזור ריק.',
      leftovers:
        '{count} אובייקטים ב-{page} אינם תואמים לשום דבר בקבוצה. להעתיק אותם לדפים האחרים, או להשאיר אותם רק בדף הזה?',
      andMore: '…ועוד {count}.',
      leftoversCopied: '{count} אובייקטים הועתקו לדפים האחרים.',
      leftoversKept: '{count} אובייקטים נשארו רק בדף שלהם.',
      imageNotCopied:
        '{name} ב-{page} משתמש בתמונה שה-API אינו יכול להעתיק (אמנות מהמרקטפלייס). השתמשו ב"שכפול דף" של Roll20 כדי ליצור עותקים איתה, ואז הוסיפו את העותק לקבוצה.',
      moved: '{player} הועבר אל {page}.',
      movedAll: '{count} שחקנים הועברו אל {page}. "שחזור פריסה" מחזיר אותם.',
      layoutSaved: 'נשמר המיקום של {count} שחקנים.',
      layoutRestored: '{count} שחקנים הוחזרו למקומם.',
      layoutReset: 'הפריסה השמורה נמחקה.',
      unlinked: 'הקישור של {count} אובייקטים בוטל. הם נשארים רק בדף הזה.',
      paused: 'השיקוף עבור "{name}" מושהה. שינויים נשארים בדף שבו נעשו עד שתמשיכו.',
      resumed: 'השיקוף עבור "{name}" פועל שוב. נמצאו {count} הבדלים.',
      settingsReset: 'ההגדרות הוחזרו לברירת המחדל.',
      resetMoved: 'השתמשו ב-{command} כדי להחזיר את הגדרות ברירת המחדל.',
      handouts: 'דפי המידע "עזרה" ו"חפיסת פקודות" נבנו מחדש.',
      pruned: 'בוצע ניקוי: {links} קישורים ריקים, {pages} דפים חסרים.',
      startRepair:
        '{name}: {drifted} סטו, {recreated} נוצרו מחדש, {removed} הוסרו, {mirrored} אובייקטים חדשים הועתקו.',
    },
    errors: {
      hint: 'הקלידו {command} help לרשימת הפקודות.',
      gmOnly: 'רק מנחה המשחק יכול להשתמש ב-SyncPage.',
      unknownCommand: 'פקודה לא מוכרת: {command}.',
      unknownSetting: 'הגדרה לא מוכרת: {key}.',
      badValue: '"{value}" אינו ערך תקין עבור {key}.',
      globalOnly: '{key} חל על כל הקבוצות ולא ניתן לשנות אותו עבור קבוצה אחת.',
      noGroup: 'לא נמצאה קבוצת סנכרון עבור "{name}".',
      groupExists: 'כבר קיימת קבוצה בשם "{name}".',
      noName: 'יש לתת שם.',
      pageInGroup: '{page} כבר נמצא בקבוצה "{group}".',
      pageNotInGroup: '{page} אינו בקבוצה "{name}".',
      nothingSelected: 'בחרו קודם אובייקט אחד או יותר.',
      noPage: 'לא נמצא דף עבור "{page}".',
      noPlayer: 'לא נמצא שחקן עבור "{player}".',
      requestExpired: 'תוקף הכפתור הזה פג. פתחו את הכרטיס שוב.',
      requestUnknown: 'כבר נעשה שימוש בכפתור הזה.',
    },
    menu: {
      thisPage: 'הדף הזה',
      group: 'קבוצה',
      source: 'מקור',
      copy: 'עותק',
      paused: 'מושהה',
      notInGroup: 'הדף הזה אינו בקבוצת סנכרון.',
      duplicateHint:
        'טיפ: צרו קבוצה מדף המפה שלכם, השתמשו עליו ב"שכפול דף" של Roll20, עברו לעותק והוסיפו אותו לקבוצה. כך העותקים שומרים על אמנות מהמרקטפלייס.',
      selectedHint: '"הסתרה" ו"הצגה" פועלות על האובייקטים הנבחרים.',
      groups: 'קבוצות',
    },
    group: {
      pages: 'דפים (★ = מקור)',
      playersCount: '{count} שחקנים',
      sourceHint: 'דף המקור הוא נקודת הייחוס לתיקונים.',
      summary: 'סיכום',
      links: 'אובייקטים מקושרים',
      hidden: 'עותקים מוסתרים',
      recycle: 'בסל המחזור',
      overrides: 'הגדרות משלה',
      none: 'אין',
      lastRepair: 'תיקון אחרון {when}: {drifted} סטו, {recreated} נוצרו מחדש.',
    },
    players: {
      none: 'עדיין אין שחקנים במשחק הזה.',
      elsewhere: 'לא בקבוצה הזו',
      visibility: 'אובייקטים נבחרים: לחצו כדי להסתיר או להציג בדף',
      selectHint: 'בחרו טוקנים ופתחו את הכרטיס הזה שוב כדי להסתיר או להציג אותם דף אחר דף.',
      shown: 'מוצג',
      hidden: 'מוסתר',
      layoutSaved: 'שמורה פריסה של {count} שחקנים.',
      youAreOn: 'אתם נמצאים ב-{page}.',
    },
    status: {
      notLinked: 'לא מקושר',
      pageOnly: 'נשמר רק בדף הזה',
      missing: 'חסר',
    },
    recycle: {
      empty: 'סל המחזור ריק.',
      reasons: {
        delete: 'נמחק',
        repair: 'תיקון',
        exclude: 'שכבה מוחרגת',
        group: 'הקבוצה הוסרה',
      },
    },
    repair: {
      drifted: 'עותקים שסטו',
      recreated: 'עותקים חסרים שנוצרו מחדש',
      removed: 'עותקים שהוסרו (המקור נמחק)',
      dropped: 'קישורים ריקים שהוסרו',
      mirrored: 'אובייקטים חדשים שהועתקו',
      leftovers: 'אובייקטים חדשים בעותקים',
      pageSettings: 'דפים עם הגדרות שונות',
      dryRunNote: 'עדיין לא שונה דבר.',
      doneNote: 'בוצע. אובייקטים שהוסרו נמצאים בסל המחזור.',
    },
    age: {
      now: 'הרגע',
      minutes: 'לפני {count} דק׳',
      hours: 'לפני {count} שע׳',
      days: 'לפני {count} ימים',
    },
    types: {
      graphic: 'טוקן',
      text: 'טקסט',
      path: 'ציור',
      pathv2: 'ציור',
      door: 'דלת',
      window: 'חלון',
    },
    values: {
      on: 'פועל',
      off: 'כבוי',
      none: 'אין',
    },
    queries: {
      group: 'קבוצה',
      groupName: 'שם הקבוצה',
      deleteGroup: 'למחוק את הקבוצה {name}? האובייקטים נשארים בדפים שלהם.',
      resetSettings: 'להחזיר את הגדרות ברירת המחדל?',
      emptyRecycle: 'לרוקן את סל המחזור? אי אפשר לבטל זאת.',
      yes: 'כן',
      no: 'לא',
    },
    buttons: {
      menu: 'תפריט',
      group: 'קבוצה',
      players: 'שחקנים',
      repair: 'תיקון',
      repairNow: 'תיקון עכשיו',
      dryRun: 'תצוגה מקדימה',
      pause: 'השהיה',
      resume: 'המשך',
      status: 'מצב',
      hideHere: 'הסתרה כאן',
      showHere: 'הצגה כאן',
      hideOthers: 'הסתרה בדפים אחרים',
      showOthers: 'הצגה בדפים אחרים',
      createGroup: 'יצירת קבוצה מהדף הזה',
      addToGroup: 'הוספת הדף הזה לקבוצה',
      removePage: 'הסרה מהקבוצה',
      makeSource: 'הגדרה כמקור',
      settings: 'הגדרות',
      groupSettings: 'הגדרות קבוצה',
      recycle: 'סל המחזור',
      undo: 'ביטול',
      help: 'עזרה',
      rename: 'שינוי שם',
      deleteGroup: 'מחיקת קבוצה',
      everyoneTo: 'כולם אל {page}',
      saveLayout: 'שמירת פריסה',
      restoreLayout: 'שחזור פריסה',
      useGlobal: 'שימוש בכללי',
      reset: 'איפוס הגדרות',
      restore: 'שחזור',
      emptyRecycle: 'ריקון',
      deleteEverywhere: 'מחיקה בכל מקום',
      keepOthers: 'השארת האחרים',
      copy: 'העתקה',
      keepHere: 'השארה כאן',
      copyAll: 'העתקת הכול',
      keepAll: 'השארת הכול כאן',
      unlink: 'ביטול קישור',
      rebuild: 'בניית דפי המידע מחדש',
    },
    settings: {
      deleteMode: 'כשאובייקט נמחק',
      hideMode: 'איך עותקים מוסתרים',
      pairLeftovers: 'אובייקטים ללא התאמה',
      newObjects: 'אובייקטים חדשים',
      localProps: 'נשמר לכל דף (טוקנים)',
      localPageSettings: 'נשמר לכל דף (הגדרות דף)',
      excludeLayers: 'שכבות שאינן מסונכרנות',
      syncPageSettings: 'שיקוף הגדרות דף',
      repairOnStart: 'תיקון בהפעלה',
      playerMenu: 'מי רשאי לפתוח את כרטיס השחקנים',
      recycleSize: 'גודל סל המחזור',
      language: 'שפה',
      groupHint: 'ההגדרות כאן חלות רק על הקבוצה הזו. "שימוש בכללי" חוזר להגדרה הראשית.',
      override: 'הקבוצה הזו',
      global: 'כללי',
    },
    settingsHelp: {
      deleteMode:
        'בכל מקום: מחיקה בכל דף מוחקת את כל העותקים. דף המקור בלבד: רק מחיקות בדף המקור מתפשטות. ביטול קישור: לעולם לא מתפשט. שאלה: שולח בחירה בלחישה.',
      hideMode:
        'שכבת ה-GM: העותק עובר לשכבת ה-GM. הסרה: העותק נמחק ונוצר מחדש כשהוא מוצג, כך שלא נשאר דבר שהשחקנים יכולים למצוא.',
      pairLeftovers:
        'כשדף מצטרף לקבוצה או עובר תיקון: לשאול, להעתיק אותם לדפים האחרים, או להשאיר אותם בדף שלהם.',
      newObjects:
        'שיקוף: אובייקטים שנוצרים בכל דף מועתקים. מקור בלבד: רק אובייקטים שנוצרים בדף המקור מועתקים.',
      localProps: 'מאפייני טוקן שכל דף שומר לעצמו, למשל ראייה עבור שחקן אחד.',
      localPageSettings: 'הגדרות דף שכל דף שומר לעצמו, למשל חשכה עבור קבוצת שחקנים אחת.',
      excludeLayers: 'אובייקטים בשכבות האלה נשארים בדף שלהם.',
      syncPageSettings: 'העתקת הגדרות דף (תאורה, רשת, גודל…) בין דפי הקבוצה.',
      repairOnStart: 'כשארגז החול מופעל: תיקון בשקט, תיקון ודיווח, או כלום.',
      playerMenu: 'מנחה המשחק בלבד, או שגם שחקנים יכולים לשאול באיזה דף הם נמצאים.',
      recycleSize: 'כמה הסרות כל קבוצה שומרת עבור "ביטול".',
      language: 'שפת התפריטים, ההודעות ודפי המידע.',
    },
    options: {
      deleteMode: { all: 'בכל מקום', source: 'דף המקור בלבד', unlink: 'ביטול קישור', ask: 'שאלה' },
      hideMode: { gmlayer: 'שכבת ה-GM', remove: 'הסרה' },
      pairLeftovers: { ask: 'שאלה', copy: 'העתקה', leave: 'השארה' },
      newObjects: { mirror: 'שיקוף', sourceOnly: 'מקור בלבד' },
      localProps: {
        gmnotes: 'הערות GM',
        name: 'שם',
        bars: 'פסים',
        markers: 'סמנים',
        tint: 'גוון',
        aura: 'הילות',
        vision: 'ראייה',
        light: 'אור',
        controlledby: 'נשלט על ידי',
      },
      localPageSettings: {
        lighting: 'תאורה',
        daylight: 'אור יום',
        explorer: 'מצב חוקר',
        fog: 'ערפל',
        grid: 'רשת',
        background: 'רקע',
        scale: 'גודל וקנה מידה',
        jukebox: 'תיבת נגינה',
      },
      excludeLayers: {
        map: 'מפה',
        objects: 'טוקנים',
        gmlayer: 'GM',
        foreground: 'חזית',
        walls: 'קירות',
      },
      repairOnStart: { quiet: 'בשקט', report: 'עם דיווח', off: 'כבוי' },
      playerMenu: { gm: 'GM בלבד', players: 'גם שחקנים' },
    },
    help: {
      menu: 'פתיחת התפריט.',
      groupCreate: 'יצירת קבוצת סנכרון מהדף הזה.',
      groupAdd: 'הוספת הדף הזה לקבוצה: אובייקטים תואמים מוצמדים, וחסרים מועתקים.',
      groupRemove: 'הוצאת הדף הזה מהקבוצה שלו. האובייקטים נשארים, ללא קישור.',
      groupShow: 'הצגת הכרטיס של קבוצה.',
      groupRename: 'שינוי שם של קבוצה.',
      groupSource: 'הגדרת הדף הזה כמקור של הקבוצה (נקודת הייחוס לתיקונים).',
      groupDelete: 'מחיקת קבוצה (שואל קודם). האובייקטים נשארים.',
      players:
        'הצגה של מי נמצא באיזה דף, עם כפתורים להעביר אותם ולהסתיר או להציג את הטוקנים הנבחרים בכל דף.',
      move: 'העברת שחקן אחד לדף (פיצול החבורה).',
      moveAll: 'העברת כל השחקנים בקבוצה לדף אחד, תוך שמירת המקום שבו היו.',
      layout: 'שמירה או שחזור של הדף שבו נמצא כל שחקן.',
      hide: 'הסתרת העותקים של האובייקטים הנבחרים: כאן, בדפים האחרים, בכל מקום, או בדפים בשם.',
      show: 'הצגה מחדש של עותקים מוסתרים.',
      status: 'הצגת הקישורים של האובייקטים הנבחרים והיכן הם מוסתרים.',
      unlink: 'השארת האובייקטים הנבחרים רק בדף הזה.',
      repair: 'החזרת העותקים להתאמה עם דף המקור. --dry-run רק מדווח.',
      pause: 'עצירת השיקוף של קבוצה לזמן מה.',
      resume: 'חידוש השיקוף; מציג מה שונה.',
      undo: 'החזרת ההסרה האחרונה.',
      recycle: 'רשימת ההסרות ושחזור כל אחת מהן.',
      settings: 'הצגת ההגדרות, הכלליות או של קבוצה אחת.',
      set: 'שינוי הגדרה. רשימות מקבלות +name או -name.',
      settingsReset: 'החזרת הגדרות ברירת המחדל (שואל קודם).',
      handouts: 'בניית דפי המידע "עזרה" ו"חפיסת פקודות" מחדש.',
      help: 'הצגת הרשימה הזו.',
      ids: 'פעולה על האובייקטים האלה במקום על הנבחרים.',
      page: 'פעולה על הדף הזה במקום על הדף שאתם צופים בו.',
      footer: 'דף המידע {help} מסביר הכול; ב-{deck} יש כפתורים.',
    },
    deck: {
      menuTitle: 'תפריט',
      menuDesc: 'התפריט הראשי, השחקנים וההגדרות.',
      groupsTitle: 'קבוצות',
      groupsDesc: 'יצירת קבוצה מהדף שבו אתם נמצאים, או הוספת הדף הזה לקבוצה.',
      selectedTitle: 'אובייקטים נבחרים',
      selectedDesc: 'הסתרה או הצגה של העותקים של האובייקטים הנבחרים.',
      toolsTitle: 'כלים',
      toolsDesc: 'תיקון, ביטול, השהיה ודפי מידע.',
      footer: 'ראו את {help} כדי להבין איך SyncPage עובד.',
    },
    handout: {
      versionLabel: 'גרסה',
      subtitle: 'דפים מקושרים לחבורות מפוצלות',
      footer: 'פתחו את {deck} לכפתורים.',
      overview: {
        heading: 'סקירה',
        body: 'SyncPage שומר על דפים מתואמים. דפים בקבוצת סנכרון חולקים את הטוקנים, הציורים, הקירות, הדלתות, החלונות, הטקסט והגדרות הדף שלהם: כל מה שמשתנה בדף אחד משתנה גם באחרים. בעזרת פיצול החבורה של Roll20 אתם מציבים שחקנים בעותקים שונים, ואז מסתירים או מציגים דברים בכל עותק, כך שכל שחקן רואה רק את מה שהדמות שלו אמורה לראות.',
        why: 'Roll20 אינו יכול להסתיר אובייקט רק מחלק מהשחקנים בדף אחד. תאורה דינמית נותנת לכל טוקן ראייה משלו, אבל לא "ה-NPC הזה בלתי נראה רק לנוכל". דפים משוקפים עושים זאת.',
      },
      quickStart: {
        heading: 'התחלה מהירה',
        steps: [
          'עברו לדף המפה שלכם והקלידו !syncpage, ואז לחצו על "יצירת קבוצה מהדף הזה".',
          'השתמשו ב"שכפול דף" של Roll20 על הדף הזה (בתפריט של כרטיס הדף). הוא מעתיק אמנות מהמרקטפלייס, דבר שה-API אינו יכול לעשות.',
          'עברו לעותק ולחצו על "הוספת הדף הזה לקבוצה". SyncPage מצמיד את האובייקטים התואמים ומעתיק כל מה שחסר.',
          'פתחו את "שחקנים" כדי להעביר שחקנים לעותק, ואז בחרו טוקנים והסתירו אותם בדף אחד.',
        ],
      },
      mirroring: {
        heading: 'מה משוקף',
        points: [
          'טוקנים (כולל אורות של Jumpgate), טקסט, ציורים מהגרסה הישנה ומ-Jumpgate, קירות מכל הסוגים, דלתות וחלונות.',
          'אובייקטים חדשים, שינויים ומחיקות, בשני הכיוונים. מחיקות פועלות לפי ההגדרה "כשאובייקט נמחק".',
          'הגדרות דף כמו תאורה, רשת וגודל, אלא אם כובו או נשמרו לכל דף.',
          'אפשר להחריג שכבות לכל קבוצה, ולשמור מאפייני טוקן כמו ראייה לכל דף.',
          'שינויים שמודים אחרים עושים דרך TokenMod משוקפים גם הם. מודים אחרים יכולים לקרוא ל-SyncPage.notify; התיקון תופס את השאר.',
        ],
      },
      visibility: {
        heading: 'הסתרה לפי דף',
        points: [
          'בחרו טוקנים והשתמשו ב"הסתרה כאן", ב"הסתרה בדפים אחרים", או בטבלה שבכרטיס השחקנים.',
          'רק העותק של אותו דף מוסתר. שינויים מדפים אחרים לעולם אינם מבטלים את ההסתרה.',
          'מצב שכבת ה-GM מעביר את העותק לשכבת ה-GM. מצב הסרה מוחק אותו ויוצר אותו מחדש כשהוא מוצג, כך שלא נשאר בדף דבר שהשחקנים יכולים למצוא.',
        ],
      },
      players: {
        heading: 'שחקנים',
        points: [
          'כרטיס השחקנים מציג כל שחקן ואת הדף שבו הוא נמצא, עם כפתור לכל דף כדי להעביר אותו (פיצול החבורה).',
          '"כולם אל…" מאסף את השחקנים בדף אחד ושומר היכן היו; "שחזור פריסה" מחזיר אותם.',
        ],
      },
      repair: {
        heading: 'תיקון',
        points: [
          'תיקון מחזיר את העותקים להתאמה עם דף המקור: מאפיינים שסטו, עותקים חסרים, ואובייקטים שנמחקו או נוצרו כש-SyncPage לא עקב.',
          'תצוגה מקדימה של תיקון מראה מה ישתנה בלי לשנות דבר. תיקון שישנה אובייקטים רבים שואל קודם.',
          'התיקון רץ בשקט כשארגז החול מופעל (הגדרה). מזהי האובייקטים נשארים זהים, בניגוד ל-0.1.',
        ],
      },
      memory: {
        heading: 'מה SyncPage זוכר',
        points: [
          'סל מחזור לכל קבוצה: כל מחיקה שמתפשטת וכל ניקוי אפשר להחזיר בעזרת "ביטול".',
          'היכן היה כל שחקן, כדי שאפשר יהיה לשחזר פיצול.',
          'הקבוצה האחרונה שבה השתמשתם, התיקון האחרון ותוצאותיו.',
          'כפתורים שצריכים נתונים נושאים קוד קצר; הם פועלים פעם אחת ותוקפם פג אחרי 10 דקות.',
        ],
      },
      commands: {
        heading: 'פקודות',
        intro: 'למנחה המשחק בלבד. גם !sync עובד.',
        colCommand: 'פקודה',
        colDesc: 'מה היא עושה',
      },
      settings: {
        heading: 'הגדרות',
        intro:
          'שנו הגדרות בכרטיס ההגדרות או בעזרת !syncpage set. אפשר לשנות הגדרות קבוצה עבור קבוצה אחת בכרטיס שלה.',
        colKey: 'מפתח',
        colName: 'הגדרה',
        colDesc: 'משמעות',
        colScope: 'תחום',
        scopeGroup: 'לכל קבוצה',
        scopeGlobal: 'כללי',
      },
      api: {
        heading: 'למודים אחרים',
        intro: 'האובייקט הגלובלי SyncPage:',
        colFunction: 'פונקציה',
        colDesc: 'מה היא עושה',
        rows: {
          getGroup: 'הקבוצה שבה נמצא דף: מזהה, שם, מקור ודפים.',
          getLinked: 'העותקים המקושרים של אובייקט, לפי דף.',
          notify: 'שיקוף שינוי שהמוד שלכם עשה (שינויי API אינם מעוררים אירועים).',
          isHidden: 'האם העותק של אובייקט מוסתר בדף.',
          onSync: 'קבלת הודעה על כל יצירה, שינוי ומחיקה משוקפים.',
          repair: 'תיקון קבוצה; { dryRun: true } רק סופר.',
        },
      },
      upgrading: {
        heading: 'שדרוג מ-0.1',
        points: [
          'דף ששמו מסתיים ב-"_synced" מצטרף לקבוצה עם הדף בעל אותו שם בלי הסיומת, שהופך למקור. אפשר לשנות את שמות הדפים אחר כך.',
          'קישורים ישנים נשמרים; כל השאר מוצמד לפי מיקום ותמונה.',
          'דגלי Show/Hide בהערות GM הופכים לעותקים מוסתרים, וטקסט הדגל מוסר מהערות GM.',
          'פקודה מותאמת מההגדרות הישנות עדיין עובדת. "True Copy" הוסר: השתמשו ב"שכפול דף".',
        ],
      },
      troubleshooting: {
        heading: 'פתרון בעיות',
        points: [
          'טוקן הועתק עם תמונה שגויה: ה-API אינו יכול להעתיק אמנות מהמרקטפלייס. צרו את העותק בעזרת "שכפול דף" והוסיפו אותו לקבוצה.',
          'עותקים לא מתואמים אחרי שמוד אחר שינה דברים: הריצו תיקון, או בקשו מכותב המוד לקרוא ל-SyncPage.notify.',
          'רוצים לסדר עותק אחד מחדש בכוונה? השהו את הקבוצה, בצעו את השינויים, ואז לחצו "המשך" ובחרו לא לתקן.',
        ],
      },
      languages: {
        heading: 'שפות',
        body: 'הגדירו את השפה בכרטיס ההגדרות. התפריטים, ההודעות ודפי המידע האלה עוברים אליה.',
        colLanguage: 'שפה',
        colNative: 'שם בשפת המקור',
        colCode: 'קוד',
      },
      credits: {
        heading: 'קרדיטים',
        original: 'המוד המקורי מאת',
        maintainer: 'נכתב מחדש ומתוחזק על ידי',
        support: 'אנא דווחו על בעיות בפורום של Roll20 או ב-GitHub.',
      },
    },
  };

  var localeHu = {
    titles: {
      ready: 'A SyncPage készen áll.',
      group: 'Szinkroncsoport: {name}',
      players: 'Játékosok: {name}',
      settings: 'SyncPage beállítások',
      groupSettings: 'Beállítások: {name}',
      status: 'SyncPage állapot',
      recycle: 'Lomtár: {name}',
      dryRun: 'Javítás előnézete: {name}',
      repaired: 'Javítva: {name}',
      repairedOnStart: 'A SyncPage megjavította a csoportjaidat',
      help: 'SyncPage parancsok',
      deleted: 'Törölve egy oldalon',
      leftovers: 'Párosítatlan objektumok',
      warning: 'SyncPage',
    },
    messages: {
      readyHint: 'A menü megnyitásához írd be: !syncpage',
      migrated:
        'A SyncPage 0.1 beállításaid átkerültek: {groups} csoport, {links} megtartott kapcsolat, {hidden} rejtett másolat. A „_synced” végű nevű oldalak most már átnevezhetők.',
      trueCopyGone:
        'A régi „True Copy” funkció megszűnt: használd a Roll20 Oldal duplikálása funkcióját, majd add hozzá a másolatot egy csoporthoz.',
      groupCreated:
        '„{name}” csoport létrehozva ({page} oldal, {count} objektum). Duplikáld az oldalt, majd add hozzá a másolatot az „Oldal hozzáadása csoporthoz” gombbal.',
      pageAdded:
        '{page} oldal bekerült a(z) „{name}” csoportba: párosítva {paired}, másolva {copied}, nem másolható {failed}, párosítatlan {leftovers}.',
      pageRemoved:
        '{page} oldal kikerült a(z) „{name}” csoportból. Az objektumai maradnak, kapcsolat nélkül.',
      groupDeleted: '„{name}” csoport törölve. Az objektumok az oldalukon maradnak.',
      notConfirmed: 'Semmi sem változott (nincs megerősítve).',
      hidden: '{count} másolat elrejtve. {skipped} objektum nincs összekapcsolva.',
      shown: '{count} másolat megjelenítve. {skipped} objektum nincs összekapcsolva.',
      hideFallback:
        '{count} másolat olyan képet használ, amelyet az API nem tud újra létrehozni, ezért eltávolítás helyett a KM rétegre került.',
      deletedAsk:
        '{name} törölve ezen az oldalon: {page}. A többi oldalon lévő másolatai még megvannak.',
      deletedEverywhere: '{count} további másolat törölve. A Visszavonás visszahozza őket.',
      keptOthers: 'A többi másolat megmarad.',
      restored: '{count} objektum visszaállítva. {failed} nem állítható vissza.',
      nothingToUndo: 'Nincs mit visszavonni.',
      recycleEmptied: 'A lomtár üres.',
      leftovers:
        '{count} objektum ezen az oldalon ({page}) semmivel sem párosítható a csoportban. Átmásolod őket a többi oldalra, vagy csak ezen az oldalon maradjanak?',
      andMore: '…és még {count}.',
      leftoversCopied: '{count} objektum átmásolva a többi oldalra.',
      leftoversKept: '{count} objektum csak a saját oldalán maradt.',
      imageNotCopied:
        '{name} ({page}) olyan képet használ, amelyet az API nem tud másolni (Marketplace-grafika). Készíts vele másolatot a Roll20 Oldal duplikálása funkciójával, majd add hozzá a másolatot a csoporthoz.',
      moved: '{player} áthelyezve ide: {page}.',
      movedAll:
        '{count} játékos áthelyezve ide: {page}. Az „Elrendezés visszaállítása” visszaviszi őket.',
      layoutSaved: '{count} játékos helye megjegyezve.',
      layoutRestored: '{count} játékos visszahelyezve.',
      layoutReset: 'A megjegyzett elrendezés törölve.',
      unlinked: '{count} objektum leválasztva. Csak ezen az oldalon maradnak meg.',
      paused:
        'A(z) „{name}” tükrözése szünetel. A változások azon az oldalon maradnak, ahol készültek, amíg nem folytatod.',
      resumed: 'A(z) „{name}” tükrözése újra fut. {count} eltérés található.',
      settingsReset: 'A beállítások visszaálltak az alapértelmezettre.',
      resetMoved: 'Az alapértelmezett beállítások visszaállításához használd ezt: {command}.',
      handouts: 'A súgó- és parancspult-segédletek újra elkészültek.',
      pruned: 'Rendrakás: {links} üres kapcsolat, {pages} hiányzó oldal.',
      startRepair:
        '{name}: {drifted} elcsúszott, {recreated} újra létrehozva, {removed} eltávolítva, {mirrored} új objektum másolva.',
    },
    errors: {
      hint: 'A parancsokért írd be: {command} help.',
      gmOnly: 'A SyncPage-et csak a KM használhatja.',
      unknownCommand: 'Ismeretlen parancs: {command}.',
      unknownSetting: 'Ismeretlen beállítás: {key}.',
      badValue: '„{value}” nem érvényes érték ehhez: {key}.',
      globalOnly: '{key} minden csoportra vonatkozik, egyetlen csoportra nem módosítható.',
      noGroup: 'Nem található szinkroncsoport ehhez: „{name}”.',
      groupExists: 'Már van „{name}” nevű csoport.',
      noName: 'Adj meg egy nevet.',
      pageInGroup: '{page} már benne van a(z) „{group}” csoportban.',
      pageNotInGroup: '{page} nincs benne a(z) „{name}” csoportban.',
      nothingSelected: 'Előbb jelölj ki egy vagy több objektumot.',
      noPage: 'Nem található oldal ehhez: „{page}”.',
      noPlayer: 'Nem található játékos ehhez: „{player}”.',
      requestExpired: 'Ez a gomb lejárt. Nyisd meg újra a kártyát.',
      requestUnknown: 'Ezt a gombot már használták.',
    },
    menu: {
      thisPage: 'Ez az oldal',
      group: 'Csoport',
      source: 'forrás',
      copy: 'másolat',
      paused: 'Szüneteltetve',
      notInGroup: 'Ez az oldal nincs szinkroncsoportban.',
      duplicateHint:
        'Tipp: készíts csoportot a térképoldaladból, használd rajta a Roll20 Oldal duplikálása funkcióját, menj a másolatra, és add hozzá a csoporthoz. Így a másolatok megtartják a Marketplace-grafikát.',
      selectedHint: 'Az Elrejtés és a Megjelenítés a kijelölt objektumokra hat.',
      groups: 'Csoportok',
    },
    group: {
      pages: 'Oldalak (★ = forrás)',
      playersCount: '{count} játékos',
      sourceHint: 'A forrásoldal a javítások mintája.',
      summary: 'Összegzés',
      links: 'Összekapcsolt objektumok',
      hidden: 'Rejtett másolatok',
      recycle: 'A lomtárban',
      overrides: 'Saját beállítások',
      none: 'nincs',
      lastRepair: 'Utolsó javítás {when}: {drifted} elcsúszott, {recreated} újra létrehozva.',
    },
    players: {
      none: 'Ebben a játékban még nincsenek játékosok.',
      elsewhere: 'nincs ebben a csoportban',
      visibility: 'Kijelölt objektumok: kattints az elrejtéshez vagy megjelenítéshez egy oldalon',
      selectHint:
        'Jelölj ki tokeneket, és nyisd meg újra ezt a kártyát, hogy oldalanként elrejtsd vagy megjelenítsd őket.',
      shown: 'látható',
      hidden: 'rejtett',
      layoutSaved: '{count} játékos elrendezése megjegyezve.',
      youAreOn: 'Ezen az oldalon vagy: {page}.',
    },
    status: {
      notLinked: 'nincs összekapcsolva',
      pageOnly: 'csak ezen az oldalon',
      missing: 'hiányzik',
    },
    recycle: {
      empty: 'A lomtár üres.',
      reasons: {
        delete: 'Törlés',
        repair: 'Javítás',
        exclude: 'Kizárt réteg',
        group: 'Csoport eltávolítva',
      },
    },
    repair: {
      drifted: 'Elcsúszott másolatok',
      recreated: 'Újra létrehozott hiányzó másolatok',
      removed: 'Eltávolított másolatok (forrás törölve)',
      dropped: 'Eldobott üres kapcsolatok',
      mirrored: 'Másolt új objektumok',
      leftovers: 'Új objektumok a másolatokon',
      pageSettings: 'Eltérő beállítású oldalak',
      dryRunNote: 'Még semmi sem változott.',
      doneNote: 'Kész. Az eltávolított objektumok a lomtárban vannak.',
    },
    age: {
      now: 'épp most',
      minutes: '{count} perce',
      hours: '{count} órája',
      days: '{count} napja',
    },
    types: {
      graphic: 'Token',
      text: 'Szöveg',
      path: 'Rajz',
      pathv2: 'Rajz',
      door: 'Ajtó',
      window: 'Ablak',
    },
    values: {
      on: 'Be',
      off: 'Ki',
      none: 'Nincs',
    },
    queries: {
      group: 'Csoport',
      groupName: 'Csoport neve',
      deleteGroup: 'Törlöd a(z) {name} csoportot? Az objektumok az oldalukon maradnak.',
      resetSettings: 'Visszaállítod az alapértelmezett beállításokat?',
      emptyRecycle: 'Kiüríted a lomtárat? Ez nem vonható vissza.',
      yes: 'Igen',
      no: 'Nem',
    },
    buttons: {
      menu: 'Menü',
      group: 'Csoport',
      players: 'Játékosok',
      repair: 'Javítás',
      repairNow: 'Javítás most',
      dryRun: 'Javítás előnézete',
      pause: 'Szünet',
      resume: 'Folytatás',
      status: 'Állapot',
      hideHere: 'Elrejtés itt',
      showHere: 'Megjelenítés itt',
      hideOthers: 'Elrejtés a többi oldalon',
      showOthers: 'Megjelenítés a többi oldalon',
      createGroup: 'Csoport ebből az oldalból',
      addToGroup: 'Oldal hozzáadása csoporthoz',
      removePage: 'Eltávolítás a csoportból',
      makeSource: 'Legyen forrás',
      settings: 'Beállítások',
      groupSettings: 'Csoportbeállítások',
      recycle: 'Lomtár',
      undo: 'Visszavonás',
      help: 'Súgó',
      rename: 'Átnevezés',
      deleteGroup: 'Csoport törlése',
      everyoneTo: 'Mindenki ide: {page}',
      saveLayout: 'Elrendezés mentése',
      restoreLayout: 'Elrendezés visszaállítása',
      useGlobal: 'Globális használata',
      reset: 'Alapbeállítások',
      restore: 'Visszaállítás',
      emptyRecycle: 'Ürítés',
      deleteEverywhere: 'Törlés mindenhol',
      keepOthers: 'A többi marad',
      copy: 'Másolás',
      keepHere: 'Marad itt',
      copyAll: 'Összes másolása',
      keepAll: 'Mind marad itt',
      unlink: 'Leválasztás',
      rebuild: 'Segédletek újraépítése',
    },
    settings: {
      deleteMode: 'Objektum törlésekor',
      hideMode: 'Másolatok elrejtésének módja',
      pairLeftovers: 'Párosítatlan objektumok',
      newObjects: 'Új objektumok',
      localProps: 'Oldalanként külön (tokenek)',
      localPageSettings: 'Oldalanként külön (oldalbeállítások)',
      excludeLayers: 'Nem szinkronizált rétegek',
      syncPageSettings: 'Oldalbeállítások tükrözése',
      repairOnStart: 'Javítás indításkor',
      playerMenu: 'Ki nyithatja meg a játékoskártyát',
      recycleSize: 'Lomtár mérete',
      language: 'Nyelv',
      groupHint:
        'Ezek a beállítások csak erre a csoportra vonatkoznak. A „Globális használata” visszatér a fő beállításhoz.',
      override: 'ez a csoport',
      global: 'globális',
    },
    settingsHelp: {
      deleteMode:
        'Mindenhol: bármely oldalon történő törlés minden másolatot töröl. Csak forrásoldal: csak a forrásoldali törlések terjednek tovább. Leválasztás: semmi sem terjed. Kérdezés: suttogva felkínálja a választást.',
      hideMode:
        'KM réteg: a másolat a KM rétegre kerül. Eltávolítás: a másolat törlődik, és megjelenítéskor újra létrejön, így a játékosok semmit sem találhatnak.',
      pairLeftovers:
        'Amikor egy oldal csoporthoz csatlakozik vagy javítás fut: kérdezés, átmásolás a többi oldalra, vagy a saját oldalukon hagyás.',
      newObjects:
        'Tükrözés: bármely oldalon készült objektumok másolódnak. Csak forrás: csak a forrásoldalon készült objektumok másolódnak.',
      localProps:
        'Tokentulajdonságok, amelyeket minden oldal magának tart meg, például egy játékos látása.',
      localPageSettings:
        'Oldalbeállítások, amelyeket minden oldal magának tart meg, például a sötétség egy játékoscsoport számára.',
      excludeLayers: 'Az ezeken a rétegeken lévő objektumok a saját oldalukon maradnak.',
      syncPageSettings:
        'Az oldalbeállítások (fények, rács, méret…) másolása a csoport oldalai között.',
      repairOnStart: 'Amikor a sandbox elindul: csendes javítás, javítás jelentéssel, vagy semmi.',
      playerMenu: 'Csak a KM, vagy a játékosok is megkérdezhetik, melyik oldalon vannak.',
      recycleSize: 'Hány eltávolítást őriz meg csoportonként a Visszavonás számára.',
      language: 'A menük, üzenetek és segédletek nyelve.',
    },
    options: {
      deleteMode: {
        all: 'Mindenhol',
        source: 'Csak forrásoldal',
        unlink: 'Leválasztás',
        ask: 'Kérdezés',
      },
      hideMode: { gmlayer: 'KM réteg', remove: 'Eltávolítás' },
      pairLeftovers: { ask: 'Kérdezés', copy: 'Másolás', leave: 'Hagyás' },
      newObjects: { mirror: 'Tükrözés', sourceOnly: 'Csak forrás' },
      localProps: {
        gmnotes: 'KM jegyzetek',
        name: 'Név',
        bars: 'Sávok',
        markers: 'Jelölők',
        tint: 'Színezés',
        aura: 'Aurák',
        vision: 'Látás',
        light: 'Fény',
        controlledby: 'Irányítja',
      },
      localPageSettings: {
        lighting: 'Megvilágítás',
        daylight: 'Nappali fény',
        explorer: 'Felfedező mód',
        fog: 'Köd',
        grid: 'Rács',
        background: 'Háttér',
        scale: 'Méret és lépték',
        jukebox: 'Zenegép',
      },
      excludeLayers: {
        map: 'Térkép',
        objects: 'Tokenek',
        gmlayer: 'KM',
        foreground: 'Előtér',
        walls: 'Falak',
      },
      repairOnStart: { quiet: 'Csendben', report: 'Jelentéssel', off: 'Ki' },
      playerMenu: { gm: 'Csak KM', players: 'Játékosok is' },
    },
    help: {
      menu: 'Megnyitja a menüt.',
      groupCreate: 'Szinkroncsoportot készít ebből az oldalból.',
      groupAdd:
        'Hozzáadja ezt az oldalt egy csoporthoz: az egyező objektumok párosulnak, a hiányzók másolódnak.',
      groupRemove:
        'Kiveszi ezt az oldalt a csoportjából. Az objektumok maradnak, kapcsolat nélkül.',
      groupShow: 'Megmutatja egy csoport kártyáját.',
      groupRename: 'Átnevez egy csoportot.',
      groupSource: 'Ezt az oldalt teszi a csoport forrásává (a javítások mintájává).',
      groupDelete: 'Töröl egy csoportot (előbb rákérdez). Az objektumok maradnak.',
      players:
        'Megmutatja, ki melyik oldalon van, gombokkal az áthelyezésükhöz és a kijelölt tokenek oldalankénti elrejtéséhez vagy megjelenítéséhez.',
      move: 'Egy játékost áthelyez egy oldalra (csapat szétválasztása).',
      moveAll: 'A csoport minden játékosát egy oldalra helyezi, és megjegyzi, hol voltak.',
      layout: 'Megjegyzi vagy visszaállítja, melyik játékos melyik oldalon van.',
      hide: 'Elrejti a kijelölt objektumok másolatait: itt, a többi oldalon, mindenhol vagy a megnevezett oldalakon.',
      show: 'Újra megjeleníti a rejtett másolatokat.',
      status: 'Megmutatja a kijelölt objektumok kapcsolatait, és hogy hol vannak elrejtve.',
      unlink: 'A kijelölt objektumokat csak ezen az oldalon tartja.',
      repair: 'Összhangba hozza a másolatokat a forrásoldallal. A --dry-run csak jelent.',
      pause: 'Egy időre leállítja egy csoport tükrözését.',
      resume: 'Újra tükröz; megmutatja az eltéréseket.',
      undo: 'Visszahozza az utolsó eltávolítást.',
      recycle: 'Felsorolja az eltávolításokat, és bármelyiket visszaállítja.',
      settings: 'Megmutatja a beállításokat, globálisan vagy egy csoportra.',
      set: 'Módosít egy beállítást. A listák +name vagy -name formát fogadnak.',
      settingsReset: 'Visszaállítja az alapértelmezett beállításokat (előbb rákérdez).',
      handouts: 'Újraépíti a súgó- és parancspult-segédleteket.',
      help: 'Megmutatja ezt a listát.',
      ids: 'Ezekre az objektumokra hat a kijelöltek helyett.',
      page: 'Erre az oldalra hat ahelyett, amelyiket nézed.',
      footer: 'A(z) {help} segédlet mindent elmagyaráz; a(z) {deck} gombokat tartalmaz.',
    },
    deck: {
      menuTitle: 'Menü',
      menuDesc: 'A főmenü, a játékosok és a beállítások.',
      groupsTitle: 'Csoportok',
      groupsDesc:
        'Készíts csoportot abból az oldalból, amelyen vagy, vagy add hozzá ezt az oldalt egy csoporthoz.',
      selectedTitle: 'Kijelölt objektumok',
      selectedDesc: 'A kijelölt objektumok másolatainak elrejtése vagy megjelenítése.',
      toolsTitle: 'Eszközök',
      toolsDesc: 'Javítás, visszavonás, szünet és segédletek.',
      footer: 'A SyncPage működéséről lásd: {help}.',
    },
    handout: {
      versionLabel: 'Verzió',
      subtitle: 'Összekapcsolt oldalak szétválasztott csapatokhoz',
      footer: 'A gombokért nyisd meg: {deck}.',
      overview: {
        heading: 'Áttekintés',
        body: 'A SyncPage összhangban tartja az oldalakat. Egy szinkroncsoport oldalai közösen használják a tokeneket, rajzokat, falakat, ajtókat, ablakokat, szövegeket és oldalbeállításokat: ami az egyik oldalon változik, az a többin is. A Roll20 csapat-szétválasztásával a játékosokat különböző másolatokra teszed, majd másolatonként elrejtesz vagy megjelenítesz dolgokat, így mindenki csak azt látja, amit a karakterének látnia kell.',
        why: 'A Roll20 egy oldalon nem tud egy objektumot csak néhány játékos elől elrejteni. A dinamikus megvilágítás minden tokennek saját látást ad, de olyat nem, hogy „ez az NJK csak a tolvaj számára láthatatlan”. A tükrözött oldalak ezt megoldják.',
      },
      quickStart: {
        heading: 'Gyors kezdés',
        steps: [
          'Menj a térképoldaladra, írd be: !syncpage, majd kattints a „Csoport ebből az oldalból” gombra.',
          'Használd azon az oldalon a Roll20 Oldal duplikálása funkcióját (az oldalkártya menüjében). Ez a Marketplace-grafikát is másolja, amit az API nem tud.',
          'Menj a másolatra, és kattints az „Oldal hozzáadása csoporthoz” gombra. A SyncPage párosítja az egyező objektumokat, és átmásol mindent, ami hiányzik.',
          'Nyisd meg a Játékosok kártyát, helyezd át a játékosokat a másolatra, majd jelölj ki tokeneket, és rejtsd el őket egy oldalon.',
        ],
      },
      mirroring: {
        heading: 'Mi tükröződik',
        points: [
          'Tokenek (a Jumpgate fényekkel együtt), szövegek, Legacy és Jumpgate rajzok, mindenféle fal, ajtók és ablakok.',
          'Új objektumok, változások és törlések, mindkét irányban. A törlések az „Objektum törlésekor” beállítást követik.',
          'Oldalbeállítások, például megvilágítás, rács és méret, hacsak nincsenek kikapcsolva vagy oldalanként külön tartva.',
          'Rétegek csoportonként kihagyhatók, és a tokentulajdonságok, például a látás, oldalanként külön tarthatók.',
          'A más Modok által a TokenMod segítségével végzett változások is tükröződnek. Más Modok meghívhatják a SyncPage.notify függvényt; a többit a javítás elkapja.',
        ],
      },
      visibility: {
        heading: 'Elrejtés oldalanként',
        points: [
          'Jelölj ki tokeneket, és használd az Elrejtés itt vagy az Elrejtés a többi oldalon gombot, vagy a Játékosok kártya rácsát.',
          'Csak annak az oldalnak a másolata rejtődik el. Más oldalak változásai sosem vonják vissza az elrejtést.',
          'A KM réteg mód a KM rétegre teszi a másolatot. Az Eltávolítás mód törli, és megjelenítéskor újra létrehozza, így az oldalon nem marad semmi, amit a játékosok megtalálhatnának.',
        ],
      },
      players: {
        heading: 'Játékosok',
        points: [
          'A Játékosok kártya felsorolja a játékosokat és az oldalt, amelyen vannak, oldalanként egy gombbal az áthelyezésükhöz (csapat szétválasztása).',
          'A „Mindenki ide” egy oldalra gyűjti a játékosokat, és megjegyzi, hol voltak; az „Elrendezés visszaállítása” visszaviszi őket.',
        ],
      },
      repair: {
        heading: 'Javítás',
        points: [
          'A javítás összhangba hozza a másolatokat a forrásoldallal: elcsúszott tulajdonságok, hiányzó másolatok, olyan objektumok, amelyeket akkor töröltek vagy hoztak létre, amikor a SyncPage nem figyelt.',
          'A Javítás előnézete megmutatja, mi változna, anélkül, hogy bármit módosítana. Ha egy javítás sok objektumot változtatna, előbb rákérdez.',
          'A javítás csendben lefut a sandbox indulásakor (beállítás). Az objektumazonosítók változatlanok maradnak, a 0.1-gyel ellentétben.',
        ],
      },
      memory: {
        heading: 'Mit jegyez meg a SyncPage',
        points: [
          'Csoportonként egy lomtárat: minden továbbterjedő törlés és minden rendrakás visszahozható a Visszavonással.',
          'Hogy ki hol volt, így a szétválasztás visszaállítható.',
          'Az utoljára használt csoportot, az utolsó javítást és annak eredményeit.',
          'Az adatot igénylő gombok rövid kódot hordoznak; egyszer működnek, és 10 perc után lejárnak.',
        ],
      },
      commands: {
        heading: 'Parancsok',
        intro: 'Csak a KM számára. A !sync is működik.',
        colCommand: 'Parancs',
        colDesc: 'Mit csinál',
      },
      settings: {
        heading: 'Beállítások',
        intro:
          'A beállításokat a beállításkártyán vagy a !syncpage set paranccsal módosíthatod. A csoportbeállítások egy-egy csoportra a csoport kártyáján módosíthatók.',
        colKey: 'Kulcs',
        colName: 'Beállítás',
        colDesc: 'Jelentés',
        colScope: 'Hatókör',
        scopeGroup: 'Csoportonként',
        scopeGlobal: 'Globális',
      },
      api: {
        heading: 'Más Modoknak',
        intro: 'A globális SyncPage objektum:',
        colFunction: 'Függvény',
        colDesc: 'Mit csinál',
        rows: {
          getGroup: 'A csoport, amelyben egy oldal van: id, név, forrás és oldalak.',
          getLinked: 'Egy objektum összekapcsolt másolatai oldalanként.',
          notify:
            'Tükrözi a Modod által végzett változást (az API-változások nem váltanak ki eseményt).',
          isHidden: 'El van-e rejtve egy objektum másolata egy oldalon.',
          onSync: 'Értesítést kapsz minden tükrözött létrehozásról, változásról és törlésről.',
          repair: 'Csoport javítása; a { dryRun: true } csak számol.',
        },
      },
      upgrading: {
        heading: 'Frissítés a 0.1-ről',
        points: [
          'A „_synced” végű nevű oldal csoportba kerül az ugyanilyen nevű, de e végződés nélküli oldallal, amely a forrás lesz. Utána átnevezheted az oldalakat.',
          'A régi kapcsolatok megmaradnak; minden más pozíció és kép alapján párosul.',
          'A KM jegyzetekben lévő Show/Hide jelölők rejtett másolatokká válnak, a jelölő szövege pedig törlődik a KM jegyzetekből.',
          'A régi konfiguráció egyéni parancsa továbbra is működik. A „True Copy” megszűnt: használd az Oldal duplikálása funkciót.',
        ],
      },
      troubleshooting: {
        heading: 'Hibaelhárítás',
        points: [
          'Rossz képpel másolt token: az API nem tudja másolni a Marketplace-grafikát. Készítsd el a másolatot az Oldal duplikálása funkcióval, és add hozzá a csoporthoz.',
          'A másolatok elcsúsztak, miután egy másik Mod változtatott valamit: futtass Javítást, vagy kérd meg a Mod szerzőjét, hogy hívja meg a SyncPage.notify függvényt.',
          'Szándékosan át akarsz rendezni egy másolatot? Szüneteltesd a csoportot, végezd el a változtatásokat, majd a Folytatás után válaszd, hogy nem javítasz.',
        ],
      },
      languages: {
        heading: 'Nyelvek',
        body: 'A nyelvet a beállításkártyán állíthatod be. A menük, az üzenetek és ezek a segédletek ezt követik.',
        colLanguage: 'Nyelv',
        colNative: 'Saját név',
        colCode: 'Kód',
      },
      credits: {
        heading: 'Köszönet',
        original: 'Eredeti Mod szerzője:',
        maintainer: 'Újraírta és karbantartja:',
        support: 'A hibákat a Roll20 fórumán vagy a GitHubon jelentsd.',
      },
    },
  };

  var localeIt = {
    titles: {
      ready: 'SyncPage è pronto.',
      group: 'Gruppo sincronizzato: {name}',
      players: 'Giocatori: {name}',
      settings: 'Impostazioni di SyncPage',
      groupSettings: 'Impostazioni di {name}',
      status: 'Stato di SyncPage',
      recycle: 'Cestino: {name}',
      dryRun: 'Anteprima riparazione: {name}',
      repaired: 'Riparato: {name}',
      repairedOnStart: 'SyncPage ha riparato i tuoi gruppi',
      help: 'Comandi di SyncPage',
      deleted: 'Eliminato su una pagina',
      leftovers: 'Oggetti senza corrispondenza',
      warning: 'SyncPage',
    },
    messages: {
      readyHint: 'Scrivi !syncpage per aprire il menu.',
      migrated:
        'La configurazione di SyncPage 0.1 è stata trasferita: gruppi: {groups}, collegamenti mantenuti: {links}, copie nascoste: {hidden}. Ora puoi rinominare le pagine il cui nome finisce con «_synced».',
      trueCopyGone:
        'La vecchia funzione «True Copy» non esiste più: usa Duplica pagina di Roll20, poi aggiungi la copia a un gruppo.',
      groupCreated:
        'Gruppo «{name}» creato da {page}, oggetti: {count}. Duplica la pagina, poi aggiungi la copia con «Aggiungi questa pagina a un gruppo».',
      pageAdded:
        '{page} è entrata in «{name}»: abbinati {paired}, copiati {copied}, non copiabili {failed}, senza corrispondenza {leftovers}.',
      pageRemoved: '{page} è uscita da «{name}». I suoi oggetti restano, scollegati.',
      groupDeleted: 'Gruppo «{name}» eliminato. Gli oggetti restano sulle loro pagine.',
      notConfirmed: 'Non è stato cambiato nulla (non confermato).',
      hidden: 'Copie nascoste: {count}. Oggetti non collegati: {skipped}.',
      shown: 'Copie mostrate: {count}. Oggetti non collegati: {skipped}.',
      hideFallback:
        "Copie spostate nel livello GM invece che rimosse: {count}. Usano un'immagine che l'API non può ricreare.",
      deletedAsk:
        '{name} è stato eliminato su {page}. Le sue copie sulle altre pagine ci sono ancora.',
      deletedEverywhere: 'Altre copie eliminate: {count}. Annulla le rimette al loro posto.',
      keptOthers: 'Le altre copie restano.',
      restored: 'Oggetti ripristinati: {count}. Non ripristinabili: {failed}.',
      nothingToUndo: "Non c'è nulla da annullare.",
      recycleEmptied: 'Il cestino è vuoto.',
      leftovers:
        'Oggetti su {page} senza corrispondenza nel gruppo: {count}. Copiarli sulle altre pagine o tenerli solo su questa pagina?',
      andMore: '…e altri {count}.',
      leftoversCopied: 'Oggetti copiati sulle altre pagine: {count}.',
      leftoversKept: 'Oggetti tenuti solo sulla loro pagina: {count}.',
      imageNotCopied:
        "{name} su {page} usa un'immagine che l'API non può copiare (arte del marketplace). Usa Duplica pagina di Roll20 per fare copie che la includano, poi aggiungi la copia al gruppo.",
      moved: '{player} ora è su {page}.',
      movedAll:
        'Giocatori spostati su {page}: {count}. «Ripristina disposizione» li riporta indietro.',
      layoutSaved: 'Memorizzata la pagina dei giocatori: {count}.',
      layoutRestored: 'Giocatori riportati indietro: {count}.',
      layoutReset: 'La disposizione memorizzata è stata cancellata.',
      unlinked: 'Oggetti scollegati: {count}. Restano solo su questa pagina.',
      paused:
        'Il rispecchiamento di «{name}» è in pausa. Le modifiche restano sulla pagina in cui sono fatte finché non riprendi.',
      resumed: 'Il rispecchiamento di «{name}» è di nuovo attivo. Differenze trovate: {count}.',
      settingsReset: 'Impostazioni riportate ai valori predefiniti.',
      resetMoved: 'Usa {command} per ripristinare le impostazioni predefinite.',
      handouts: 'Le dispense di aiuto e dei comandi sono state ricreate.',
      pruned: 'Pulizia: collegamenti vuoti {links}, pagine mancanti {pages}.',
      startRepair:
        '{name}: disallineati {drifted}, ricreati {recreated}, rimossi {removed}, nuovi oggetti copiati {mirrored}.',
    },
    errors: {
      hint: 'Scrivi {command} help per i comandi.',
      gmOnly: 'Solo il Master può usare SyncPage.',
      unknownCommand: 'Comando sconosciuto: {command}.',
      unknownSetting: 'Impostazione sconosciuta: {key}.',
      badValue: '«{value}» non è un valore valido per {key}.',
      globalOnly: '{key} vale per tutti i gruppi e non si può cambiare per uno solo.',
      noGroup: 'Nessun gruppo sincronizzato trovato per «{name}».',
      groupExists: 'Esiste già un gruppo chiamato «{name}».',
      noName: 'Indica un nome.',
      pageInGroup: '{page} è già nel gruppo «{group}».',
      pageNotInGroup: '{page} non è nel gruppo «{name}».',
      nothingSelected: 'Seleziona prima uno o più oggetti.',
      noPage: 'Nessuna pagina trovata per «{page}».',
      noPlayer: 'Nessun giocatore trovato per «{player}».',
      requestExpired: 'Questo pulsante è scaduto. Riapri la scheda.',
      requestUnknown: 'Questo pulsante è già stato usato.',
    },
    menu: {
      thisPage: 'Questa pagina',
      group: 'Gruppo',
      source: 'origine',
      copy: 'copia',
      paused: 'In pausa',
      notInGroup: 'Questa pagina non è in un gruppo sincronizzato.',
      duplicateHint:
        "Suggerimento: crea un gruppo dalla pagina della mappa, usa Duplica pagina di Roll20 su di essa, vai alla copia e aggiungila al gruppo. Così le copie mantengono l'arte del marketplace.",
      selectedHint: 'Nascondi e Mostra agiscono sugli oggetti selezionati.',
      groups: 'Gruppi',
    },
    group: {
      pages: 'Pagine (★ = origine)',
      playersCount: 'Giocatori: {count}',
      sourceHint: 'La pagina di origine è il riferimento per le riparazioni.',
      summary: 'Riepilogo',
      links: 'Oggetti collegati',
      hidden: 'Copie nascoste',
      recycle: 'Nel cestino',
      overrides: 'Impostazioni proprie',
      none: 'nessuno',
      lastRepair: 'Ultima riparazione {when}: disallineati {drifted}, ricreati {recreated}.',
    },
    players: {
      none: 'In questa partita non ci sono ancora giocatori.',
      elsewhere: 'non in questo gruppo',
      visibility: 'Oggetti selezionati: clicca per nascondere o mostrare su una pagina',
      selectHint:
        'Seleziona dei token e riapri questa scheda per nasconderli o mostrarli pagina per pagina.',
      shown: 'visibile',
      hidden: 'nascosto',
      layoutSaved: 'È memorizzata una disposizione dei giocatori: {count}.',
      youAreOn: 'Sei su {page}.',
    },
    status: {
      notLinked: 'non collegato',
      pageOnly: 'tenuto solo su questa pagina',
      missing: 'mancante',
    },
    recycle: {
      empty: 'Il cestino è vuoto.',
      reasons: {
        delete: 'Eliminato',
        repair: 'Riparazione',
        exclude: 'Livello escluso',
        group: 'Gruppo rimosso',
      },
    },
    repair: {
      drifted: 'Copie disallineate',
      recreated: 'Copie mancanti ricreate',
      removed: 'Copie rimosse (origine eliminata)',
      dropped: 'Collegamenti vuoti eliminati',
      mirrored: 'Nuovi oggetti copiati',
      leftovers: 'Nuovi oggetti sulle copie',
      pageSettings: 'Pagine con impostazioni diverse',
      dryRunNote: 'Non è ancora stato cambiato nulla.',
      doneNote: 'Fatto. Gli oggetti rimossi sono nel cestino.',
    },
    age: {
      now: 'proprio ora',
      minutes: '{count} min fa',
      hours: '{count} h fa',
      days: '{count} g fa',
    },
    types: {
      graphic: 'Token',
      text: 'Testo',
      path: 'Disegno',
      pathv2: 'Disegno',
      door: 'Porta',
      window: 'Finestra',
    },
    values: {
      on: 'Attivo',
      off: 'Disattivo',
      none: 'Nessuno',
    },
    queries: {
      group: 'Gruppo',
      groupName: 'Nome del gruppo',
      deleteGroup: 'Eliminare il gruppo {name}? Gli oggetti restano sulle loro pagine.',
      resetSettings: 'Ripristinare le impostazioni predefinite?',
      emptyRecycle: 'Svuotare il cestino? Non si può annullare.',
      yes: 'Sì',
      no: 'No',
    },
    buttons: {
      menu: 'Menu',
      group: 'Gruppo',
      players: 'Giocatori',
      repair: 'Ripara',
      repairNow: 'Ripara ora',
      dryRun: 'Anteprima riparazione',
      pause: 'Pausa',
      resume: 'Riprendi',
      status: 'Stato',
      hideHere: 'Nascondi qui',
      showHere: 'Mostra qui',
      hideOthers: 'Nascondi sulle altre pagine',
      showOthers: 'Mostra sulle altre pagine',
      createGroup: 'Crea un gruppo da questa pagina',
      addToGroup: 'Aggiungi questa pagina a un gruppo',
      removePage: 'Togli dal gruppo',
      makeSource: 'Rendi origine',
      settings: 'Impostazioni',
      groupSettings: 'Impostazioni gruppo',
      recycle: 'Cestino',
      undo: 'Annulla',
      help: 'Aiuto',
      rename: 'Rinomina',
      deleteGroup: 'Elimina gruppo',
      everyoneTo: 'Tutti su {page}',
      saveLayout: 'Salva disposizione',
      restoreLayout: 'Ripristina disposizione',
      useGlobal: 'Usa globale',
      reset: 'Ripristina impostazioni',
      restore: 'Ripristina',
      emptyRecycle: 'Svuota',
      deleteEverywhere: 'Elimina ovunque',
      keepOthers: 'Tieni le altre',
      copy: 'Copia',
      keepHere: 'Tieni qui',
      copyAll: 'Copia tutti',
      keepAll: 'Tieni tutti qui',
      unlink: 'Scollega',
      rebuild: 'Ricrea dispense',
    },
    settings: {
      deleteMode: 'Quando un oggetto è eliminato',
      hideMode: 'Come si nascondono le copie',
      pairLeftovers: 'Oggetti senza corrispondenza',
      newObjects: 'Nuovi oggetti',
      localProps: 'Per pagina (token)',
      localPageSettings: 'Per pagina (impostazioni pagina)',
      excludeLayers: 'Livelli non sincronizzati',
      syncPageSettings: 'Rispecchia impostazioni pagina',
      repairOnStart: "Ripara all'avvio",
      playerMenu: 'Chi può aprire la scheda giocatori',
      recycleSize: 'Dimensione del cestino',
      language: 'Lingua',
      groupHint:
        "Queste impostazioni valgono solo per questo gruppo. «Usa globale» torna all'impostazione principale.",
      override: 'questo gruppo',
      global: 'globale',
    },
    settingsHelp: {
      deleteMode:
        'Ovunque: eliminare su qualsiasi pagina elimina ogni copia. Solo pagina origine: si propagano solo le eliminazioni sulla pagina di origine. Scollega: nessuna propagazione. Chiedi: sussurra una scelta.',
      hideMode:
        'Livello GM: la copia passa al livello GM. Rimuovi: la copia viene eliminata e ricreata quando la mostri, così ai giocatori non resta nulla da trovare.',
      pairLeftovers:
        'Quando una pagina entra in un gruppo o viene riparata: chiedi, copiali sulle altre pagine o lasciali sulla loro pagina.',
      newObjects:
        'Rispecchia: gli oggetti creati su qualsiasi pagina vengono copiati. Solo origine: vengono copiati solo gli oggetti creati sulla pagina di origine.',
      localProps:
        'Proprietà dei token che ogni pagina tiene per sé, come la visione per un solo giocatore.',
      localPageSettings:
        "Impostazioni di pagina che ogni pagina tiene per sé, come l'oscurità per un gruppo di giocatori.",
      excludeLayers: 'Gli oggetti su questi livelli restano sulla propria pagina.',
      syncPageSettings:
        'Copia le impostazioni di pagina (luci, griglia, dimensioni…) tra le pagine del gruppo.',
      repairOnStart:
        "All'avvio della sandbox: ripara in silenzio, ripara e riferisci, oppure non fare nulla.",
      playerMenu:
        'Solo il Master, oppure anche i giocatori possono chiedere su quale pagina si trovano.',
      recycleSize: 'Quante rimozioni ogni gruppo conserva per Annulla.',
      language: 'Lingua di menu, messaggi e dispense.',
    },
    options: {
      deleteMode: {
        all: 'Ovunque',
        source: 'Solo pagina origine',
        unlink: 'Scollega',
        ask: 'Chiedi',
      },
      hideMode: { gmlayer: 'Livello GM', remove: 'Rimuovi' },
      pairLeftovers: { ask: 'Chiedi', copy: 'Copia', leave: 'Lascia' },
      newObjects: { mirror: 'Rispecchia', sourceOnly: 'Solo origine' },
      localProps: {
        gmnotes: 'Note del GM',
        name: 'Nome',
        bars: 'Barre',
        markers: 'Segnalini',
        tint: 'Tinta',
        aura: 'Aure',
        vision: 'Visione',
        light: 'Luce',
        controlledby: 'Controllato da',
      },
      localPageSettings: {
        lighting: 'Illuminazione',
        daylight: 'Luce diurna',
        explorer: 'Modalità esploratore',
        fog: 'Nebbia',
        grid: 'Griglia',
        background: 'Sfondo',
        scale: 'Dimensioni e scala',
        jukebox: 'Jukebox',
      },
      excludeLayers: {
        map: 'Mappa',
        objects: 'Token',
        gmlayer: 'GM',
        foreground: 'Primo piano',
        walls: 'Muri',
      },
      repairOnStart: { quiet: 'In silenzio', report: 'E riferisci', off: 'Disattivo' },
      playerMenu: { gm: 'Solo il Master', players: 'Anche i giocatori' },
    },
    help: {
      menu: 'Apre il menu.',
      groupCreate: 'Crea un gruppo sincronizzato da questa pagina.',
      groupAdd:
        'Aggiunge questa pagina a un gruppo: gli oggetti corrispondenti vengono abbinati, quelli mancanti copiati.',
      groupRemove: 'Toglie questa pagina dal suo gruppo. Gli oggetti restano, scollegati.',
      groupShow: 'Mostra la scheda di un gruppo.',
      groupRename: 'Rinomina un gruppo.',
      groupSource: "Rende questa pagina l'origine del gruppo (il riferimento per le riparazioni).",
      groupDelete: 'Elimina un gruppo (chiede prima). Gli oggetti restano.',
      players:
        'Mostra chi è su quale pagina, con pulsanti per spostare i giocatori e per nascondere o mostrare i token selezionati pagina per pagina.',
      move: 'Sposta un giocatore su una pagina (party diviso).',
      moveAll: 'Sposta tutti i giocatori del gruppo su una pagina, ricordando dove si trovavano.',
      layout: 'Memorizza o ripristina su quale pagina si trova ogni giocatore.',
      hide: 'Nasconde le copie degli oggetti selezionati: qui, sulle altre pagine, ovunque o sulle pagine indicate.',
      show: 'Mostra di nuovo le copie nascoste.',
      status: 'Mostra i collegamenti degli oggetti selezionati e dove sono nascosti.',
      unlink: 'Tiene gli oggetti selezionati solo su questa pagina.',
      repair: 'Riallinea le copie alla pagina di origine. --dry-run si limita a riferire.',
      pause: "Sospende per un po' il rispecchiamento di un gruppo.",
      resume: 'Riprende il rispecchiamento; mostra cosa è diverso.',
      undo: "Rimette a posto l'ultima rimozione.",
      recycle: 'Elenca le rimozioni e ne ripristina una qualsiasi.',
      settings: 'Mostra le impostazioni, globali o di un gruppo.',
      set: "Cambia un'impostazione. Le liste accettano +name o -name.",
      settingsReset: 'Ripristina le impostazioni predefinite (chiede prima).',
      handouts: 'Ricrea le dispense di aiuto e dei comandi.',
      help: 'Mostra questo elenco.',
      ids: 'Agisce su questi oggetti invece che su quelli selezionati.',
      page: 'Agisce su questa pagina invece che su quella che stai guardando.',
      footer: 'La dispensa {help} spiega tutto; {deck} ha i pulsanti.',
    },
    deck: {
      menuTitle: 'Menu',
      menuDesc: 'Il menu principale, i giocatori e le impostazioni.',
      groupsTitle: 'Gruppi',
      groupsDesc:
        'Crea un gruppo dalla pagina in cui ti trovi, o aggiungi questa pagina a un gruppo.',
      selectedTitle: 'Oggetti selezionati',
      selectedDesc: 'Nascondi o mostra le copie degli oggetti selezionati.',
      toolsTitle: 'Strumenti',
      toolsDesc: 'Riparazione, annullamento, pausa e dispense.',
      footer: 'Vedi {help} per sapere come funziona SyncPage.',
    },
    handout: {
      versionLabel: 'Versione',
      subtitle: 'Pagine collegate per party divisi',
      footer: 'Apri {deck} per i pulsanti.',
      overview: {
        heading: 'Panoramica',
        body: 'SyncPage mantiene le pagine allineate. Le pagine di un gruppo sincronizzato condividono token, disegni, muri, porte, finestre, testi e impostazioni di pagina: ciò che cambia su una pagina cambia sulle altre. Con la funzione di Roll20 per dividere il party metti i giocatori su copie diverse, poi nascondi o mostri gli elementi copia per copia, così ogni giocatore vede solo ciò che dovrebbe vedere il suo personaggio.',
        why: "Roll20 non può nascondere un oggetto solo ad alcuni giocatori su una pagina. L'illuminazione dinamica dà a ogni token la propria visione, ma non «questo PNG è invisibile solo al ladro». Le pagine rispecchiate lo fanno.",
      },
      quickStart: {
        heading: 'Guida rapida',
        steps: [
          'Vai alla pagina della mappa e scrivi !syncpage, poi clicca «Crea un gruppo da questa pagina».',
          "Usa Duplica pagina di Roll20 su quella pagina (dal menu della scheda della pagina). Copia l'arte del marketplace, cosa che l'API non può fare.",
          'Vai alla copia e clicca «Aggiungi questa pagina a un gruppo». SyncPage abbina gli oggetti corrispondenti e copia ciò che manca.',
          'Apri Giocatori per spostare i giocatori sulla copia, poi seleziona dei token e nascondili su una pagina.',
        ],
      },
      mirroring: {
        heading: 'Cosa viene rispecchiato',
        points: [
          'Token (comprese le luci di Jumpgate), testi, disegni Legacy e Jumpgate, muri di ogni tipo, porte e finestre.',
          "Nuovi oggetti, modifiche ed eliminazioni, in entrambe le direzioni. Le eliminazioni seguono l'impostazione «Quando un oggetto è eliminato».",
          'Impostazioni di pagina come illuminazione, griglia e dimensioni, a meno che non siano disattivate o tenute per pagina.',
          'Si possono escludere dei livelli per gruppo, e proprietà dei token come la visione possono essere tenute per pagina.',
          'Anche le modifiche che altre Mod fanno tramite TokenMod vengono rispecchiate. Le altre Mod possono chiamare SyncPage.notify; la riparazione sistema il resto.',
        ],
      },
      visibility: {
        heading: 'Nascondere per pagina',
        points: [
          'Seleziona dei token e usa Nascondi qui, Nascondi sulle altre pagine o la griglia della scheda Giocatori.',
          "Viene nascosta solo la copia di quella pagina. Le modifiche dalle altre pagine non annullano mai l'occultamento.",
          'La modalità Livello GM sposta la copia nel livello GM. La modalità Rimuovi la elimina e la ricrea quando viene mostrata, così sulla pagina non resta nulla da trovare per i giocatori.',
        ],
      },
      players: {
        heading: 'Giocatori',
        points: [
          'La scheda Giocatori elenca ogni giocatore e la pagina in cui si trova, con un pulsante per pagina per spostarlo (party diviso).',
          '«Tutti su» riunisce i giocatori su una pagina e ricorda dove si trovavano; «Ripristina disposizione» li riporta indietro.',
        ],
      },
      repair: {
        heading: 'Riparazione',
        points: [
          'La riparazione riallinea le copie alla pagina di origine: proprietà disallineate, copie mancanti, oggetti eliminati o creati mentre SyncPage non osservava.',
          'Anteprima riparazione mostra cosa cambierebbe senza cambiare nulla. Una riparazione che cambierebbe molti oggetti chiede prima.',
          "La riparazione viene eseguita in silenzio all'avvio della sandbox (impostazione). Gli ID degli oggetti restano gli stessi, a differenza della 0.1.",
        ],
      },
      memory: {
        heading: 'Cosa ricorda SyncPage',
        points: [
          'Un cestino per gruppo: ogni eliminazione propagata e ogni pulizia si può annullare con Annulla.',
          'Dove si trovava ogni giocatore, così una divisione si può ripristinare.',
          "L'ultimo gruppo usato, l'ultima riparazione e i suoi risultati.",
          'I pulsanti che richiedono dati portano un breve codice; funzionano una volta e scadono dopo 10 minuti.',
        ],
      },
      commands: {
        heading: 'Comandi',
        intro: 'Solo per il Master. Funziona anche !sync.',
        colCommand: 'Comando',
        colDesc: 'Cosa fa',
      },
      settings: {
        heading: 'Impostazioni',
        intro:
          'Cambia le impostazioni nella scheda delle impostazioni o con !syncpage set. Le impostazioni di gruppo si possono cambiare per un singolo gruppo nella sua scheda.',
        colKey: 'Chiave',
        colName: 'Impostazione',
        colDesc: 'Significato',
        colScope: 'Ambito',
        scopeGroup: 'Per gruppo',
        scopeGlobal: 'Globale',
      },
      api: {
        heading: 'Per altre Mod',
        intro: "L'oggetto globale SyncPage:",
        colFunction: 'Funzione',
        colDesc: 'Cosa fa',
        rows: {
          getGroup: 'Il gruppo di una pagina: id, nome, origine e pagine.',
          getLinked: 'Le copie collegate di un oggetto, per pagina.',
          notify:
            'Rispecchia una modifica fatta dalla tua Mod (le modifiche via API non generano eventi).',
          isHidden: 'Se la copia di un oggetto è nascosta su una pagina.',
          onSync: 'Ricevi un avviso per ogni creazione, modifica ed eliminazione rispecchiata.',
          repair: 'Ripara un gruppo; { dryRun: true } si limita a contare.',
        },
      },
      upgrading: {
        heading: 'Aggiornare dalla 0.1',
        points: [
          "Una pagina il cui nome finisce con «_synced» entra in un gruppo con la pagina dallo stesso nome senza il suffisso, che diventa l'origine. Dopo puoi rinominare le pagine.",
          'I vecchi collegamenti vengono mantenuti; tutto il resto viene abbinato per posizione e immagine.',
          'I flag Show/Hide nelle Note del GM diventano copie nascoste, e il testo del flag viene tolto dalle Note del GM.',
          "Un comando personalizzato della vecchia configurazione funziona ancora. «True Copy» non c'è più: usa Duplica pagina.",
        ],
      },
      troubleshooting: {
        heading: 'Risoluzione dei problemi',
        points: [
          "Un token copiato con l'immagine sbagliata: l'API non può copiare l'arte del marketplace. Crea la copia con Duplica pagina e aggiungila al gruppo.",
          "Copie disallineate dopo che un'altra Mod ha cambiato qualcosa: esegui Ripara, o chiedi all'autore di quella Mod di chiamare SyncPage.notify.",
          'Vuoi riorganizzare apposta una copia? Metti in pausa il gruppo, fai le modifiche, poi Riprendi e scegli di non riparare.',
        ],
      },
      languages: {
        heading: 'Lingue',
        body: 'Imposta la lingua nella scheda delle impostazioni. Menu, messaggi e queste dispense la seguono.',
        colLanguage: 'Lingua',
        colNative: 'Nome nativo',
        colCode: 'Codice',
      },
      credits: {
        heading: 'Riconoscimenti',
        original: 'Mod originale di',
        maintainer: 'Riscritta e mantenuta da',
        support: 'Segnala i problemi sul forum di Roll20 o su GitHub.',
      },
    },
  };

  var localeJa = {
    titles: {
      ready: 'SyncPage の準備ができました。',
      group: '同期グループ：{name}',
      players: 'プレイヤー：{name}',
      settings: 'SyncPage の設定',
      groupSettings: '{name} の設定',
      status: 'SyncPage の状態',
      recycle: 'ごみ箱：{name}',
      dryRun: '修復のプレビュー：{name}',
      repaired: '修復しました：{name}',
      repairedOnStart: 'SyncPage がグループを修復しました',
      help: 'SyncPage のコマンド',
      deleted: '1つのページで削除されました',
      leftovers: '対応するもののないオブジェクト',
      warning: 'SyncPage',
    },
    messages: {
      readyHint: '!syncpage と入力するとメニューが開きます。',
      migrated:
        'SyncPage 0.1 の設定を引き継ぎました：グループ {groups} 件、リンク {links} 件を保持、非表示のコピー {hidden} 件。名前が「_synced」で終わるページは、名前を変更できるようになりました。',
      trueCopyGone:
        '以前の「True Copy」機能はなくなりました。Roll20 の「ページを複製」を使い、そのコピーをグループに追加してください。',
      groupCreated:
        '{page} からグループ「{name}」を作成しました（オブジェクト {count} 個）。ページを複製し、「このページをグループに追加」でコピーを追加してください。',
      pageAdded:
        '{page} が「{name}」に参加しました：ペア化 {paired}、コピー {copied}、コピー失敗 {failed}、対応なし {leftovers}。',
      pageRemoved: '{page} が「{name}」から外れました。オブジェクトはリンクを解除して残ります。',
      groupDeleted: 'グループ「{name}」を削除しました。オブジェクトは各ページに残ります。',
      notConfirmed: '何も変更していません（確認されませんでした）。',
      hidden:
        'コピー {count} 個を非表示にしました。{skipped} 個のオブジェクトはリンクされていません。',
      shown: 'コピー {count} 個を表示しました。{skipped} 個のオブジェクトはリンクされていません。',
      hideFallback:
        'コピー {count} 個は API で再作成できない画像を使っているため、削除せずに GM レイヤーへ移動しました。',
      deletedAsk: '{name} が {page} で削除されました。ほかのページのコピーはまだ残っています。',
      deletedEverywhere: 'ほかのコピー {count} 個を削除しました。「元に戻す」で復元できます。',
      keptOthers: 'ほかのコピーは残します。',
      restored: 'オブジェクト {count} 個を復元しました。{failed} 個は復元できませんでした。',
      nothingToUndo: '元に戻すものはありません。',
      recycleEmptied: 'ごみ箱は空です。',
      leftovers:
        '{page} のオブジェクト {count} 個は、グループ内のどれとも対応しません。ほかのページへコピーしますか？それともこのページだけに残しますか？',
      andMore: '…ほか {count} 個。',
      leftoversCopied: 'オブジェクト {count} 個をほかのページへコピーしました。',
      leftoversKept: 'オブジェクト {count} 個を元のページだけに残しました。',
      imageNotCopied:
        '{page} の {name} は API でコピーできない画像（マーケットプレイスのアート）を使っています。Roll20 の「ページを複製」でコピーを作り、そのコピーをグループに追加してください。',
      moved: '{player} を {page} へ移動しました。',
      movedAll: 'プレイヤー {count} 人を {page} へ移動しました。「配置を復元」で元に戻せます。',
      layoutSaved: 'プレイヤー {count} 人の現在の位置を記録しました。',
      layoutRestored: 'プレイヤー {count} 人を元の位置へ戻しました。',
      layoutReset: '記録した配置を消去しました。',
      unlinked: 'オブジェクト {count} 個のリンクを解除しました。このページだけに残ります。',
      paused:
        '「{name}」のミラーリングを一時停止しました。再開するまで、変更は行ったページだけに残ります。',
      resumed: '「{name}」のミラーリングを再開しました。差異が {count} 件見つかりました。',
      settingsReset: '設定を初期値に戻しました。',
      resetMoved: '初期設定に戻すには {command} を使ってください。',
      handouts: 'ヘルプとコマンドデッキのハンドアウトを再作成しました。',
      pruned: '整理しました：空のリンク {links} 件、存在しないページ {pages} 件。',
      startRepair:
        '{name}：ずれ {drifted}、再作成 {recreated}、削除 {removed}、新しいオブジェクトのコピー {mirrored}。',
    },
    errors: {
      hint: 'コマンドの一覧は {command} help で表示できます。',
      gmOnly: 'SyncPage を使えるのは GM だけです。',
      unknownCommand: '不明なコマンドです：{command}。',
      unknownSetting: '不明な設定です：{key}。',
      badValue: '「{value}」は {key} に使える値ではありません。',
      globalOnly: '{key} はすべてのグループに適用されるため、グループごとには変更できません。',
      noGroup: '「{name}」の同期グループが見つかりません。',
      groupExists: '「{name}」という名前のグループはすでにあります。',
      noName: '名前を入力してください。',
      pageInGroup: '{page} はすでにグループ「{group}」に入っています。',
      pageNotInGroup: '{page} はグループ「{name}」に入っていません。',
      nothingSelected: '先にオブジェクトを1つ以上選択してください。',
      noPage: '「{page}」のページが見つかりません。',
      noPlayer: '「{player}」のプレイヤーが見つかりません。',
      requestExpired: 'このボタンは期限切れです。カードをもう一度開いてください。',
      requestUnknown: 'このボタンはすでに使われています。',
    },
    menu: {
      thisPage: 'このページ',
      group: 'グループ',
      source: '元',
      copy: 'コピー',
      paused: '一時停止中',
      notInGroup: 'このページは同期グループに入っていません。',
      duplicateHint:
        'ヒント：マップのページからグループを作り、そのページで Roll20 の「ページを複製」を使います。コピーへ移動して、グループに追加してください。この方法ならマーケットプレイスのアートもコピーに残ります。',
      selectedHint: '「非表示」と「表示」は選択中のオブジェクトに働きます。',
      groups: 'グループ',
    },
    group: {
      pages: 'ページ（★ = 元ページ）',
      playersCount: 'プレイヤー {count} 人',
      sourceHint: '元ページは修復の基準になります。',
      summary: '概要',
      links: 'リンクされたオブジェクト',
      hidden: '非表示のコピー',
      recycle: 'ごみ箱の中',
      overrides: '独自の設定',
      none: 'なし',
      lastRepair: '前回の修復 {when}：ずれ {drifted}、再作成 {recreated}。',
    },
    players: {
      none: 'このゲームにはまだプレイヤーがいません。',
      elsewhere: 'このグループ外',
      visibility: '選択中のオブジェクト：クリックしてページごとに非表示・表示',
      selectHint:
        'トークンを選択してからこのカードをもう一度開くと、ページごとに非表示・表示できます。',
      shown: '表示',
      hidden: '非表示',
      layoutSaved: 'プレイヤー {count} 人の配置を記録しています。',
      youAreOn: '現在のページは {page} です。',
    },
    status: {
      notLinked: 'リンクなし',
      pageOnly: 'このページだけに保持',
      missing: '見つかりません',
    },
    recycle: {
      empty: 'ごみ箱は空です。',
      reasons: {
        delete: '削除',
        repair: '修復',
        exclude: '除外レイヤー',
        group: 'グループ削除',
      },
    },
    repair: {
      drifted: 'ずれたコピー',
      recreated: '再作成した欠けていたコピー',
      removed: '削除したコピー（元が削除済み）',
      dropped: '取り除いた空のリンク',
      mirrored: 'コピーした新しいオブジェクト',
      leftovers: 'コピー側の新しいオブジェクト',
      pageSettings: '設定が異なるページ',
      dryRunNote: 'まだ何も変更していません。',
      doneNote: '完了しました。削除したオブジェクトはごみ箱にあります。',
    },
    age: {
      now: 'たった今',
      minutes: '{count} 分前',
      hours: '{count} 時間前',
      days: '{count} 日前',
    },
    types: {
      graphic: 'トークン',
      text: 'テキスト',
      path: '描画',
      pathv2: '描画',
      door: 'ドア',
      window: '窓',
    },
    values: {
      on: 'オン',
      off: 'オフ',
      none: 'なし',
    },
    queries: {
      group: 'グループ',
      groupName: 'グループ名',
      deleteGroup: 'グループ {name} を削除しますか？オブジェクトは各ページに残ります。',
      resetSettings: '設定を初期値に戻しますか？',
      emptyRecycle: 'ごみ箱を空にしますか？元に戻せません。',
      yes: 'はい',
      no: 'いいえ',
    },
    buttons: {
      menu: 'メニュー',
      group: 'グループ',
      players: 'プレイヤー',
      repair: '修復',
      repairNow: '今すぐ修復',
      dryRun: '修復をプレビュー',
      pause: '一時停止',
      resume: '再開',
      status: '状態',
      hideHere: 'ここで非表示',
      showHere: 'ここで表示',
      hideOthers: 'ほかのページで非表示',
      showOthers: 'ほかのページで表示',
      createGroup: 'このページからグループを作成',
      addToGroup: 'このページをグループに追加',
      removePage: 'グループから外す',
      makeSource: '元ページにする',
      settings: '設定',
      groupSettings: 'グループ設定',
      recycle: 'ごみ箱',
      undo: '元に戻す',
      help: 'ヘルプ',
      rename: '名前を変更',
      deleteGroup: 'グループを削除',
      everyoneTo: '全員を {page} へ',
      saveLayout: '配置を記録',
      restoreLayout: '配置を復元',
      useGlobal: '全体設定を使う',
      reset: '設定をリセット',
      restore: '復元',
      emptyRecycle: '空にする',
      deleteEverywhere: 'すべて削除',
      keepOthers: 'ほかは残す',
      copy: 'コピー',
      keepHere: 'ここに残す',
      copyAll: 'すべてコピー',
      keepAll: 'すべてここに残す',
      unlink: 'リンク解除',
      rebuild: 'ハンドアウトを再作成',
    },
    settings: {
      deleteMode: 'オブジェクトが削除されたとき',
      hideMode: 'コピーの隠し方',
      pairLeftovers: '対応するもののないオブジェクト',
      newObjects: '新しいオブジェクト',
      localProps: 'ページごとに保持（トークン）',
      localPageSettings: 'ページごとに保持（ページ設定）',
      excludeLayers: '同期しないレイヤー',
      syncPageSettings: 'ページ設定をミラーリング',
      repairOnStart: '起動時に修復',
      playerMenu: 'プレイヤーカードを開ける人',
      recycleSize: 'ごみ箱のサイズ',
      language: '言語',
      groupHint:
        'ここでの設定はこのグループだけに適用されます。「全体設定を使う」でメインの設定に戻ります。',
      override: 'このグループ',
      global: '全体',
    },
    settingsHelp: {
      deleteMode:
        'すべて：どのページで削除しても、すべてのコピーが削除されます。元ページのみ：元ページでの削除だけが広がります。リンク解除：削除は広がりません。確認：選択肢をウィスパーで送ります。',
      hideMode:
        'GM レイヤー：コピーを GM レイヤーへ移動します。削除：コピーを削除し、表示するときに作り直します。プレイヤーが見つけられるものは何も残りません。',
      pairLeftovers:
        'ページがグループに参加したときや修復したとき：確認する、ほかのページへコピーする、または元のページに残します。',
      newObjects:
        'ミラー：どのページで作ったオブジェクトもコピーされます。元ページのみ：元ページで作ったオブジェクトだけがコピーされます。',
      localProps:
        '各ページが独自に保持するトークンのプロパティです（例：1人のプレイヤー用の視界）。',
      localPageSettings: '各ページが独自に保持するページ設定です（例：一部のプレイヤー用の暗さ）。',
      excludeLayers: 'これらのレイヤーのオブジェクトは元のページだけに残ります。',
      syncPageSettings: 'グループのページ間でページ設定（照明、グリッド、サイズ…）をコピーします。',
      repairOnStart: 'サンドボックスの起動時：静かに修復、修復して報告、または何もしません。',
      playerMenu: 'GM のみ、またはプレイヤーも自分のいるページを確認できます。',
      recycleSize: '「元に戻す」用に各グループが保持する削除の数です。',
      language: 'メニュー、メッセージ、ハンドアウトの言語です。',
    },
    options: {
      deleteMode: { all: 'すべて', source: '元ページのみ', unlink: 'リンク解除', ask: '確認' },
      hideMode: { gmlayer: 'GM レイヤー', remove: '削除' },
      pairLeftovers: { ask: '確認', copy: 'コピー', leave: '残す' },
      newObjects: { mirror: 'ミラー', sourceOnly: '元ページのみ' },
      localProps: {
        gmnotes: 'GM メモ',
        name: '名前',
        bars: 'バー',
        markers: 'マーカー',
        tint: '色合い',
        aura: 'オーラ',
        vision: '視界',
        light: '光源',
        controlledby: '操作者',
      },
      localPageSettings: {
        lighting: '照明',
        daylight: '日光',
        explorer: '探索モード',
        fog: '霧',
        grid: 'グリッド',
        background: '背景',
        scale: 'サイズと縮尺',
        jukebox: 'ジュークボックス',
      },
      excludeLayers: {
        map: 'マップ',
        objects: 'トークン',
        gmlayer: 'GM',
        foreground: '前景',
        walls: '壁',
      },
      repairOnStart: { quiet: '静かに', report: '報告あり', off: 'オフ' },
      playerMenu: { gm: 'GM のみ', players: 'プレイヤーも' },
    },
    help: {
      menu: 'メニューを開きます。',
      groupCreate: 'このページから同期グループを作ります。',
      groupAdd:
        'このページをグループに追加します。対応するオブジェクトはペアにし、足りないものはコピーします。',
      groupRemove: 'このページをグループから外します。オブジェクトはリンクを解除して残ります。',
      groupShow: 'グループのカードを表示します。',
      groupRename: 'グループの名前を変更します。',
      groupSource: 'このページをグループの元ページ（修復の基準）にします。',
      groupDelete: 'グループを削除します（先に確認します）。オブジェクトは残ります。',
      players:
        '誰がどのページにいるかを表示します。移動用のボタンと、選択中のトークンをページごとに非表示・表示するボタンがあります。',
      move: 'プレイヤー1人をページへ移動します（パーティー分割）。',
      moveAll: 'グループの全プレイヤーを1つのページへ移動し、元の位置を記録します。',
      layout: '各プレイヤーがいるページを記録または復元します。',
      hide: '選択中のオブジェクトのコピーを非表示にします：ここ、ほかのページ、すべて、または指定したページ。',
      show: '非表示のコピーを再び表示します。',
      status: '選択中のオブジェクトのリンクと、どこで非表示になっているかを表示します。',
      unlink: '選択中のオブジェクトをこのページだけに残します。',
      repair: 'コピーを元ページに合わせて戻します。--dry-run は報告だけを行います。',
      pause: 'グループのミラーリングをしばらく止めます。',
      resume: 'ミラーリングを再開し、違いを表示します。',
      undo: '最後の削除を元に戻します。',
      recycle: '削除の一覧を表示し、どれでも復元できます。',
      settings: '全体またはグループごとの設定を表示します。',
      set: '設定を変更します。リストには +name または -name を使います。',
      settingsReset: '設定を初期値に戻します（先に確認します）。',
      handouts: 'ヘルプとコマンドデッキのハンドアウトを再作成します。',
      help: 'この一覧を表示します。',
      ids: '選択中のものではなく、これらのオブジェクトに対して実行します。',
      page: '表示中のページではなく、このページに対して実行します。',
      footer: '{help} ハンドアウトにすべての説明があります。{deck} にはボタンがあります。',
    },
    deck: {
      menuTitle: 'メニュー',
      menuDesc: 'メインメニュー、プレイヤー、設定。',
      groupsTitle: 'グループ',
      groupsDesc: '今いるページからグループを作るか、このページをグループに追加します。',
      selectedTitle: '選択中のオブジェクト',
      selectedDesc: '選択中のオブジェクトのコピーを非表示・表示します。',
      toolsTitle: 'ツール',
      toolsDesc: '修復、元に戻す、一時停止、ハンドアウト。',
      footer: 'SyncPage のしくみは {help} を参照してください。',
    },
    handout: {
      versionLabel: 'バージョン',
      subtitle: 'パーティー分割のためのリンクされたページ',
      footer: 'ボタンは {deck} を開いてください。',
      overview: {
        heading: '概要',
        body: 'SyncPage はページの内容をそろえます。同期グループのページは、トークン、描画、壁、ドア、窓、テキスト、ページ設定を共有します。1つのページで変わったものは、ほかのページでも変わります。Roll20 のパーティー分割でプレイヤーを別々のコピーに置き、コピーごとに物を非表示・表示すれば、各プレイヤーには自分のキャラクターが見るべきものだけが見えます。',
        why: 'Roll20 では、1つのページで一部のプレイヤーにだけオブジェクトを隠すことはできません。ダイナミック・ライティングは各トークンに独自の視界を与えますが、「この NPC はローグにだけ見えない」という設定はできません。ミラーリングされたページならそれができます。',
      },
      quickStart: {
        heading: 'クイックスタート',
        steps: [
          'マップのページへ移動して !syncpage と入力し、「このページからグループを作成」をクリックします。',
          'そのページで Roll20 の「ページを複製」（ページカードのメニュー）を使います。API ではできないマーケットプレイスのアートもコピーされます。',
          'コピーへ移動して「このページをグループに追加」をクリックします。SyncPage は対応するオブジェクトをペアにし、足りないものをコピーします。',
          '「プレイヤー」を開いてプレイヤーをコピーへ移動し、トークンを選択して1つのページで非表示にします。',
        ],
      },
      mirroring: {
        heading: 'ミラーリングされるもの',
        points: [
          'トークン（Jumpgate の光源を含む）、テキスト、レガシーと Jumpgate の描画、あらゆる種類の壁、ドア、窓。',
          '新しいオブジェクト、変更、削除を双方向に。削除は「オブジェクトが削除されたとき」の設定に従います。',
          '照明、グリッド、サイズなどのページ設定（オフにした場合やページごとに保持する場合を除く）。',
          'レイヤーはグループごとに除外でき、視界などのトークンのプロパティはページごとに保持できます。',
          'ほかの Mod が TokenMod を通して行った変更もミラーリングされます。ほかの Mod は SyncPage.notify を呼び出せます。それ以外は修復で補えます。',
        ],
      },
      visibility: {
        heading: 'ページごとの非表示',
        points: [
          'トークンを選択し、「ここで非表示」「ほかのページで非表示」、またはプレイヤーカードの表を使います。',
          '非表示になるのはそのページのコピーだけです。ほかのページからの変更で非表示が解除されることはありません。',
          'GM レイヤーモードではコピーを GM レイヤーへ移動します。削除モードではコピーを削除し、表示するときに作り直すので、プレイヤーが見つけられるものはページに何も残りません。',
        ],
      },
      players: {
        heading: 'プレイヤー',
        points: [
          'プレイヤーカードには、各プレイヤーと今いるページが表示され、ページごとに移動用のボタンがあります（パーティー分割）。',
          '「全員を…へ」はプレイヤーを1つのページに集め、元の位置を記録します。「配置を復元」で元に戻せます。',
        ],
      },
      repair: {
        heading: '修復',
        points: [
          '修復はコピーを元ページに合わせて戻します：ずれたプロパティ、欠けたコピー、SyncPage が見ていない間に削除または作成されたオブジェクト。',
          '「修復をプレビュー」は何も変更せずに、変わる内容を表示します。多くのオブジェクトを変える修復は、先に確認します。',
          '修復はサンドボックスの起動時に静かに実行されます（設定）。0.1 とは異なり、オブジェクトの ID は変わりません。',
        ],
      },
      memory: {
        heading: 'SyncPage が記録するもの',
        points: [
          'グループごとのごみ箱：広がった削除と整理は、すべて「元に戻す」で復元できます。',
          '各プレイヤーがいた場所。分割した配置を復元できます。',
          '最後に使ったグループ、前回の修復とその結果。',
          'データが必要なボタンには短いコードが付いています。1回だけ使え、10 分で期限が切れます。',
        ],
      },
      commands: {
        heading: 'コマンド',
        intro: 'GM 専用です。!sync も使えます。',
        colCommand: 'コマンド',
        colDesc: '働き',
      },
      settings: {
        heading: '設定',
        intro:
          '設定は設定カードか !syncpage set で変更します。グループ設定は、そのグループのカードでグループごとに変更できます。',
        colKey: 'キー',
        colName: '設定',
        colDesc: '意味',
        colScope: '範囲',
        scopeGroup: 'グループごと',
        scopeGlobal: '全体',
      },
      api: {
        heading: 'ほかの Mod 向け',
        intro: 'グローバルな SyncPage オブジェクト：',
        colFunction: '関数',
        colDesc: '働き',
        rows: {
          getGroup: 'ページが属するグループ：ID、名前、元ページ、ページ。',
          getLinked: 'オブジェクトのリンクされたコピー（ページごと）。',
          notify:
            'Mod が行った変更をミラーリングします（API による変更はイベントを発生させません）。',
          isHidden: 'オブジェクトのコピーがページで非表示かどうか。',
          onSync: 'ミラーリングされた作成、変更、削除をすべて通知します。',
          repair: 'グループを修復します。{ dryRun: true } は数えるだけです。',
        },
      },
      upgrading: {
        heading: '0.1 からのアップグレード',
        points: [
          '名前が「_synced」で終わるページは、それを除いた同じ名前のページとグループになり、そちらが元ページになります。ページの名前は後で変更できます。',
          '古いリンクは保持されます。それ以外は位置と画像でペアにします。',
          'GM メモの Show/Hide フラグは非表示のコピーになり、フラグの文字は GM メモから削除されます。',
          '古い設定のカスタムコマンドも引き続き使えます。「True Copy」はなくなりました。「ページを複製」を使ってください。',
        ],
      },
      troubleshooting: {
        heading: 'トラブルシューティング',
        points: [
          'トークンが違う画像でコピーされた：API はマーケットプレイスのアートをコピーできません。「ページを複製」でコピーを作り、グループに追加してください。',
          'ほかの Mod が変更した後でコピーがずれた：修復を実行するか、その Mod の作者に SyncPage.notify を呼び出すよう依頼してください。',
          '1つのコピーをわざと並べ替えたいとき：グループを一時停止して変更し、「再開」で修復しないほうを選びます。',
        ],
      },
      languages: {
        heading: '言語',
        body: '言語は設定カードで選びます。メニュー、メッセージ、これらのハンドアウトがその言語になります。',
        colLanguage: '言語',
        colNative: '現地語での名前',
        colCode: 'コード',
      },
      credits: {
        heading: 'クレジット',
        original: 'オリジナルの Mod の作者：',
        maintainer: '書き直しと保守：',
        support: '問題は Roll20 フォーラムか GitHub に報告してください。',
      },
    },
  };

  var localeKo = {
    titles: {
      ready: 'SyncPage가 준비되었습니다.',
      group: '동기화 그룹: {name}',
      players: '플레이어: {name}',
      settings: 'SyncPage 설정',
      groupSettings: '{name} 설정',
      status: 'SyncPage 상태',
      recycle: '휴지통: {name}',
      dryRun: '복구 미리보기: {name}',
      repaired: '복구 완료: {name}',
      repairedOnStart: 'SyncPage가 그룹을 복구했습니다',
      help: 'SyncPage 명령어',
      deleted: '한 페이지에서 삭제됨',
      leftovers: '짝이 없는 오브젝트',
      warning: 'SyncPage',
    },
    messages: {
      readyHint: '메뉴를 열려면 !syncpage를 입력하세요.',
      migrated:
        'SyncPage 0.1 설정을 가져왔습니다: 그룹 {groups}개, 링크 {links}개 유지, 숨긴 사본 {hidden}개. 이름이 "_synced"로 끝나는 페이지는 이제 이름을 바꿀 수 있습니다.',
      trueCopyGone:
        '예전의 "True Copy" 기능은 없어졌습니다. Roll20의 페이지 복제를 사용한 뒤 사본을 그룹에 추가하세요.',
      groupCreated:
        '{page}에서 그룹 "{name}"을(를) 만들었습니다. 오브젝트 {count}개. 페이지를 복제한 뒤 "이 페이지를 그룹에 추가"로 사본을 추가하세요.',
      pageAdded:
        '{page}이(가) "{name}"에 들어왔습니다: 짝지음 {paired}, 복사 {copied}, 복사 실패 {failed}, 짝 없음 {leftovers}.',
      pageRemoved: '{page}이(가) "{name}"에서 빠졌습니다. 오브젝트는 링크 없이 남습니다.',
      groupDeleted: '그룹 "{name}"을(를) 삭제했습니다. 오브젝트는 각 페이지에 남습니다.',
      notConfirmed: '아무것도 바뀌지 않았습니다(확인되지 않음).',
      hidden: '사본 {count}개를 숨겼습니다. 오브젝트 {skipped}개는 링크되어 있지 않습니다.',
      shown: '사본 {count}개를 표시했습니다. 오브젝트 {skipped}개는 링크되어 있지 않습니다.',
      hideFallback:
        '사본 {count}개는 API가 다시 만들 수 없는 이미지를 사용하므로, 제거하는 대신 GM 레이어로 옮겼습니다.',
      deletedAsk:
        '{name}이(가) {page}에서 삭제되었습니다. 다른 페이지의 사본은 아직 남아 있습니다.',
      deletedEverywhere: '다른 사본 {count}개를 삭제했습니다. 실행 취소로 되돌릴 수 있습니다.',
      keptOthers: '다른 사본은 남겨 둡니다.',
      restored: '오브젝트 {count}개를 복원했습니다. {failed}개는 복원하지 못했습니다.',
      nothingToUndo: '실행 취소할 것이 없습니다.',
      recycleEmptied: '휴지통이 비어 있습니다.',
      leftovers:
        '{page}의 오브젝트 {count}개가 그룹의 어떤 것과도 짝이 맞지 않습니다. 다른 페이지로 복사할까요, 아니면 이 페이지에만 둘까요?',
      andMore: '…외 {count}개.',
      leftoversCopied: '오브젝트 {count}개를 다른 페이지로 복사했습니다.',
      leftoversKept: '오브젝트 {count}개를 원래 페이지에만 남겼습니다.',
      imageNotCopied:
        '{page}의 {name}은(는) API가 복사할 수 없는 이미지(마켓플레이스 아트)를 사용합니다. Roll20의 페이지 복제로 사본을 만든 뒤 그 사본을 그룹에 추가하세요.',
      moved: '{player}을(를) {page}(으)로 옮겼습니다.',
      movedAll: '플레이어 {count}명을 {page}(으)로 옮겼습니다. "배치 복원"으로 되돌릴 수 있습니다.',
      layoutSaved: '플레이어 {count}명의 위치를 기억했습니다.',
      layoutRestored: '플레이어 {count}명을 원래 위치로 되돌렸습니다.',
      layoutReset: '기억한 배치를 지웠습니다.',
      unlinked: '오브젝트 {count}개의 링크를 해제했습니다. 이 페이지에만 남습니다.',
      paused:
        '"{name}"의 미러링이 일시 중지되었습니다. 다시 시작할 때까지 변경 사항은 변경한 페이지에만 남습니다.',
      resumed: '"{name}"의 미러링이 다시 켜졌습니다. 차이 {count}개를 찾았습니다.',
      settingsReset: '설정을 기본값으로 되돌렸습니다.',
      resetMoved: '기본 설정으로 되돌리려면 {command}을(를) 사용하세요.',
      handouts: '도움말과 명령 덱 핸드아웃을 다시 만들었습니다.',
      pruned: '정리했습니다: 빈 링크 {links}개, 없는 페이지 {pages}개.',
      startRepair:
        '{name}: 어긋남 {drifted}, 다시 만듦 {recreated}, 제거 {removed}, 새 오브젝트 복사 {mirrored}.',
    },
    errors: {
      hint: '명령어 목록은 {command} help를 입력하세요.',
      gmOnly: 'SyncPage는 GM만 사용할 수 있습니다.',
      unknownCommand: '알 수 없는 명령어: {command}.',
      unknownSetting: '알 수 없는 설정: {key}.',
      badValue: '"{value}"은(는) {key}에 쓸 수 없는 값입니다.',
      globalOnly: '{key}은(는) 모든 그룹에 적용되므로 한 그룹만 따로 바꿀 수 없습니다.',
      noGroup: '"{name}"에 해당하는 동기화 그룹이 없습니다.',
      groupExists: '"{name}"(이)라는 그룹이 이미 있습니다.',
      noName: '이름을 입력하세요.',
      pageInGroup: '{page}은(는) 이미 그룹 "{group}"에 있습니다.',
      pageNotInGroup: '{page}은(는) 그룹 "{name}"에 없습니다.',
      nothingSelected: '먼저 오브젝트를 하나 이상 선택하세요.',
      noPage: '"{page}"에 해당하는 페이지가 없습니다.',
      noPlayer: '"{player}"에 해당하는 플레이어가 없습니다.',
      requestExpired: '이 버튼은 만료되었습니다. 카드를 다시 여세요.',
      requestUnknown: '이 버튼은 이미 사용되었습니다.',
    },
    menu: {
      thisPage: '이 페이지',
      group: '그룹',
      source: '원본',
      copy: '사본',
      paused: '일시 중지됨',
      notInGroup: '이 페이지는 동기화 그룹에 속해 있지 않습니다.',
      duplicateHint:
        '팁: 맵 페이지로 그룹을 만들고, 그 페이지에 Roll20의 페이지 복제를 사용한 뒤, 사본으로 가서 그룹에 추가하세요. 이렇게 하면 사본에 마켓플레이스 아트가 그대로 남습니다.',
      selectedHint: '숨기기와 표시는 선택한 오브젝트에 적용됩니다.',
      groups: '그룹',
    },
    group: {
      pages: '페이지 (★ = 원본)',
      playersCount: '플레이어 {count}명',
      sourceHint: '원본 페이지는 복구의 기준입니다.',
      summary: '요약',
      links: '링크된 오브젝트',
      hidden: '숨긴 사본',
      recycle: '휴지통에 있음',
      overrides: '자체 설정',
      none: '없음',
      lastRepair: '마지막 복구 {when}: 어긋남 {drifted}, 다시 만듦 {recreated}.',
    },
    players: {
      none: '이 게임에는 아직 플레이어가 없습니다.',
      elsewhere: '이 그룹에 없음',
      visibility: '선택한 오브젝트: 클릭하여 페이지별로 숨기기 또는 표시',
      selectHint: '토큰을 선택하고 이 카드를 다시 열면 페이지별로 숨기거나 표시할 수 있습니다.',
      shown: '표시됨',
      hidden: '숨김',
      layoutSaved: '플레이어 {count}명의 배치를 기억하고 있습니다.',
      youAreOn: '현재 {page}에 있습니다.',
    },
    status: {
      notLinked: '링크 안 됨',
      pageOnly: '이 페이지에만 유지',
      missing: '없음',
    },
    recycle: {
      empty: '휴지통이 비어 있습니다.',
      reasons: {
        delete: '삭제됨',
        repair: '복구',
        exclude: '제외된 레이어',
        group: '그룹 제거됨',
      },
    },
    repair: {
      drifted: '어긋난 사본',
      recreated: '다시 만든 빠진 사본',
      removed: '제거한 사본 (원본 삭제됨)',
      dropped: '버린 빈 링크',
      mirrored: '복사한 새 오브젝트',
      leftovers: '사본에 있는 새 오브젝트',
      pageSettings: '설정이 다른 페이지',
      dryRunNote: '아직 아무것도 바뀌지 않았습니다.',
      doneNote: '완료했습니다. 제거한 오브젝트는 휴지통에 있습니다.',
    },
    age: {
      now: '방금',
      minutes: '{count}분 전',
      hours: '{count}시간 전',
      days: '{count}일 전',
    },
    types: {
      graphic: '토큰',
      text: '텍스트',
      path: '그리기',
      pathv2: '그리기',
      door: '문',
      window: '창문',
    },
    values: {
      on: '켜짐',
      off: '꺼짐',
      none: '없음',
    },
    queries: {
      group: '그룹',
      groupName: '그룹 이름',
      deleteGroup: '그룹 {name}을(를) 삭제할까요? 오브젝트는 각 페이지에 남습니다.',
      resetSettings: '기본 설정으로 되돌릴까요?',
      emptyRecycle: '휴지통을 비울까요? 되돌릴 수 없습니다.',
      yes: '예',
      no: '아니요',
    },
    buttons: {
      menu: '메뉴',
      group: '그룹',
      players: '플레이어',
      repair: '복구',
      repairNow: '지금 복구',
      dryRun: '복구 미리보기',
      pause: '일시 중지',
      resume: '다시 시작',
      status: '상태',
      hideHere: '여기서 숨기기',
      showHere: '여기서 표시',
      hideOthers: '다른 페이지에서 숨기기',
      showOthers: '다른 페이지에서 표시',
      createGroup: '이 페이지로 그룹 만들기',
      addToGroup: '이 페이지를 그룹에 추가',
      removePage: '그룹에서 빼기',
      makeSource: '원본으로 지정',
      settings: '설정',
      groupSettings: '그룹 설정',
      recycle: '휴지통',
      undo: '실행 취소',
      help: '도움말',
      rename: '이름 바꾸기',
      deleteGroup: '그룹 삭제',
      everyoneTo: '모두 {page}(으)로',
      saveLayout: '배치 저장',
      restoreLayout: '배치 복원',
      useGlobal: '전체 설정 사용',
      reset: '설정 초기화',
      restore: '복원',
      emptyRecycle: '비우기',
      deleteEverywhere: '모두 삭제',
      keepOthers: '나머지 유지',
      copy: '복사',
      keepHere: '여기에 두기',
      copyAll: '모두 복사',
      keepAll: '모두 여기에 두기',
      unlink: '링크 해제',
      rebuild: '핸드아웃 다시 만들기',
    },
    settings: {
      deleteMode: '오브젝트가 삭제될 때',
      hideMode: '사본을 숨기는 방법',
      pairLeftovers: '짝이 없는 오브젝트',
      newObjects: '새 오브젝트',
      localProps: '페이지별 유지 (토큰)',
      localPageSettings: '페이지별 유지 (페이지 설정)',
      excludeLayers: '동기화하지 않는 레이어',
      syncPageSettings: '페이지 설정 미러링',
      repairOnStart: '시작 시 복구',
      playerMenu: '플레이어 카드를 열 수 있는 사람',
      recycleSize: '휴지통 크기',
      language: '언어',
      groupHint:
        '여기의 설정은 이 그룹에만 적용됩니다. "전체 설정 사용"을 누르면 기본 설정으로 돌아갑니다.',
      override: '이 그룹',
      global: '전체',
    },
    settingsHelp: {
      deleteMode:
        '모든 곳: 어느 페이지에서 삭제하든 모든 사본이 삭제됩니다. 원본 페이지만: 원본 페이지에서 한 삭제만 퍼집니다. 링크 해제: 절대 퍼지지 않습니다. 묻기: 선택지를 귓속말로 보냅니다.',
      hideMode:
        'GM 레이어: 사본이 GM 레이어로 옮겨집니다. 제거: 사본을 삭제하고 표시할 때 다시 만듭니다. 플레이어가 찾을 수 있는 것이 남지 않습니다.',
      pairLeftovers:
        '페이지가 그룹에 들어오거나 복구될 때: 묻기, 다른 페이지로 복사, 또는 원래 페이지에 두기.',
      newObjects:
        '미러: 어느 페이지에서 만든 오브젝트든 복사됩니다. 원본만: 원본 페이지에서 만든 오브젝트만 복사됩니다.',
      localProps: '각 페이지가 따로 유지하는 토큰 속성입니다. 예: 한 플레이어를 위한 시야.',
      localPageSettings:
        '각 페이지가 따로 유지하는 페이지 설정입니다. 예: 한 플레이어 그룹을 위한 어둠.',
      excludeLayers: '이 레이어의 오브젝트는 자기 페이지에만 남습니다.',
      syncPageSettings: '그룹의 페이지끼리 페이지 설정(조명, 격자, 크기…)을 복사합니다.',
      repairOnStart: '샌드박스가 시작될 때: 조용히 복구, 복구 후 보고, 또는 아무것도 하지 않음.',
      playerMenu: 'GM만, 또는 플레이어도 자신이 어느 페이지에 있는지 물어볼 수 있습니다.',
      recycleSize: '실행 취소를 위해 각 그룹이 보관하는 제거 기록 수입니다.',
      language: '메뉴, 메시지, 핸드아웃의 언어입니다.',
    },
    options: {
      deleteMode: { all: '모든 곳', source: '원본 페이지만', unlink: '링크 해제', ask: '묻기' },
      hideMode: { gmlayer: 'GM 레이어', remove: '제거' },
      pairLeftovers: { ask: '묻기', copy: '복사', leave: '두기' },
      newObjects: { mirror: '미러', sourceOnly: '원본만' },
      localProps: {
        gmnotes: 'GM 메모',
        name: '이름',
        bars: '바',
        markers: '마커',
        tint: '색조',
        aura: '오라',
        vision: '시야',
        light: '빛',
        controlledby: '조종자',
      },
      localPageSettings: {
        lighting: '조명',
        daylight: '주광',
        explorer: '탐험 모드',
        fog: '안개',
        grid: '격자',
        background: '배경',
        scale: '크기와 축척',
        jukebox: '주크박스',
      },
      excludeLayers: {
        map: '맵',
        objects: '토큰',
        gmlayer: 'GM',
        foreground: '전경',
        walls: '벽',
      },
      repairOnStart: { quiet: '조용히', report: '보고와 함께', off: '끔' },
      playerMenu: { gm: 'GM만', players: '플레이어도' },
    },
    help: {
      menu: '메뉴를 엽니다.',
      groupCreate: '이 페이지로 동기화 그룹을 만듭니다.',
      groupAdd: '이 페이지를 그룹에 추가합니다. 맞는 오브젝트는 짝짓고 빠진 것은 복사합니다.',
      groupRemove: '이 페이지를 그룹에서 뺍니다. 오브젝트는 링크 없이 남습니다.',
      groupShow: '그룹 카드를 표시합니다.',
      groupRename: '그룹 이름을 바꿉니다.',
      groupSource: '이 페이지를 그룹의 원본(복구 기준)으로 지정합니다.',
      groupDelete: '그룹을 삭제합니다(먼저 묻습니다). 오브젝트는 남습니다.',
      players:
        '누가 어느 페이지에 있는지 보여 줍니다. 플레이어를 옮기는 버튼과 선택한 토큰을 페이지별로 숨기거나 표시하는 버튼이 있습니다.',
      move: '플레이어 한 명을 페이지로 옮깁니다(파티 분할).',
      moveAll: '그룹의 모든 플레이어를 한 페이지로 옮기고 원래 위치를 기억합니다.',
      layout: '각 플레이어가 있는 페이지를 기억하거나 복원합니다.',
      hide: '선택한 오브젝트의 사본을 숨깁니다: 여기, 다른 페이지, 모든 곳, 또는 지정한 페이지.',
      show: '숨긴 사본을 다시 표시합니다.',
      status: '선택한 오브젝트의 링크와 숨겨진 위치를 보여 줍니다.',
      unlink: '선택한 오브젝트를 이 페이지에만 둡니다.',
      repair: '사본을 원본 페이지와 다시 맞춥니다. --dry-run은 보고만 합니다.',
      pause: '그룹의 미러링을 잠시 멈춥니다.',
      resume: '미러링을 다시 시작하고 달라진 점을 보여 줍니다.',
      undo: '마지막 제거를 되돌립니다.',
      recycle: '제거 목록을 보여 주고 원하는 것을 복원합니다.',
      settings: '전체 설정이나 한 그룹의 설정을 보여 줍니다.',
      set: '설정을 바꿉니다. 목록에는 +name 또는 -name을 씁니다.',
      settingsReset: '기본 설정으로 되돌립니다(먼저 묻습니다).',
      handouts: '도움말과 명령 덱 핸드아웃을 다시 만듭니다.',
      help: '이 목록을 보여 줍니다.',
      ids: '선택한 오브젝트 대신 이 오브젝트들에 적용합니다.',
      page: '보고 있는 페이지 대신 이 페이지에 적용합니다.',
      footer: '{help} 핸드아웃에 모든 설명이 있고, {deck}에는 버튼이 있습니다.',
    },
    deck: {
      menuTitle: '메뉴',
      menuDesc: '메인 메뉴, 플레이어, 설정.',
      groupsTitle: '그룹',
      groupsDesc: '지금 있는 페이지로 그룹을 만들거나 이 페이지를 그룹에 추가합니다.',
      selectedTitle: '선택한 오브젝트',
      selectedDesc: '선택한 오브젝트의 사본을 숨기거나 표시합니다.',
      toolsTitle: '도구',
      toolsDesc: '복구, 실행 취소, 일시 중지, 핸드아웃.',
      footer: 'SyncPage의 작동 방식은 {help}을(를) 보세요.',
    },
    handout: {
      versionLabel: '버전',
      subtitle: '파티 분할을 위한 연결된 페이지',
      footer: '버튼은 {deck}을(를) 여세요.',
      overview: {
        heading: '개요',
        body: 'SyncPage는 페이지를 서로 맞춰 둡니다. 동기화 그룹의 페이지는 토큰, 그리기, 벽, 문, 창문, 텍스트, 페이지 설정을 공유합니다. 한 페이지에서 바뀐 것은 다른 페이지에서도 바뀝니다. Roll20의 파티 분할로 플레이어를 서로 다른 사본에 두고 사본마다 물건을 숨기거나 표시하면, 각 플레이어는 자기 캐릭터가 봐야 할 것만 봅니다.',
        why: 'Roll20은 한 페이지에서 일부 플레이어에게만 오브젝트를 숨길 수 없습니다. 동적 조명은 토큰마다 시야를 따로 주지만 "이 NPC는 로그에게만 보이지 않는다"는 할 수 없습니다. 미러링된 페이지는 이것을 할 수 있습니다.',
      },
      quickStart: {
        heading: '빠른 시작',
        steps: [
          '맵 페이지로 가서 !syncpage를 입력한 뒤 "이 페이지로 그룹 만들기"를 클릭합니다.',
          '그 페이지에 Roll20의 페이지 복제(페이지 카드의 메뉴)를 사용합니다. API로는 할 수 없는 마켓플레이스 아트도 복사됩니다.',
          '사본으로 가서 "이 페이지를 그룹에 추가"를 클릭합니다. SyncPage가 맞는 오브젝트를 짝짓고 빠진 것을 복사합니다.',
          '플레이어를 열어 플레이어를 사본으로 옮긴 뒤, 토큰을 선택해 한 페이지에서 숨깁니다.',
        ],
      },
      mirroring: {
        heading: '미러링되는 것',
        points: [
          '토큰(Jumpgate 조명 포함), 텍스트, 레거시와 Jumpgate 그리기, 모든 종류의 벽, 문과 창문.',
          '새 오브젝트, 변경, 삭제를 양방향으로. 삭제는 "오브젝트가 삭제될 때" 설정을 따릅니다.',
          '조명, 격자, 크기 같은 페이지 설정. 꺼 두거나 페이지별로 유지하는 경우는 제외합니다.',
          '레이어는 그룹별로 제외할 수 있고, 시야 같은 토큰 속성은 페이지별로 유지할 수 있습니다.',
          '다른 Mod가 TokenMod를 통해 한 변경도 미러링됩니다. 다른 Mod는 SyncPage.notify를 호출할 수 있고, 나머지는 복구가 잡아냅니다.',
        ],
      },
      visibility: {
        heading: '페이지별 숨기기',
        points: [
          '토큰을 선택하고 여기서 숨기기, 다른 페이지에서 숨기기, 또는 플레이어 카드의 표를 사용합니다.',
          '그 페이지의 사본만 숨겨집니다. 다른 페이지의 변경이 숨김을 풀지 않습니다.',
          'GM 레이어 모드는 사본을 GM 레이어로 옮깁니다. 제거 모드는 사본을 삭제하고 표시할 때 다시 만들므로, 페이지에 플레이어가 찾을 수 있는 것이 남지 않습니다.',
        ],
      },
      players: {
        heading: '플레이어',
        points: [
          '플레이어 카드는 각 플레이어와 그가 있는 페이지를 보여 주며, 페이지마다 옮기는 버튼이 있습니다(파티 분할).',
          '"모두 …(으)로" 버튼은 플레이어를 한 페이지에 모으고 원래 위치를 기억합니다. "배치 복원"으로 되돌릴 수 있습니다.',
        ],
      },
      repair: {
        heading: '복구',
        points: [
          '복구는 사본을 원본 페이지와 다시 맞춥니다: 어긋난 속성, 빠진 사본, SyncPage가 지켜보지 않는 동안 삭제되거나 만들어진 오브젝트.',
          '복구 미리보기는 아무것도 바꾸지 않고 바뀔 내용을 보여 줍니다. 많은 오브젝트를 바꾸는 복구는 먼저 묻습니다.',
          '샌드박스가 시작될 때 복구가 조용히 실행됩니다(설정). 0.1과 달리 오브젝트 ID는 그대로입니다.',
        ],
      },
      memory: {
        heading: 'SyncPage가 기억하는 것',
        points: [
          '그룹별 휴지통: 퍼진 삭제와 정리는 모두 실행 취소로 되돌릴 수 있습니다.',
          '각 플레이어가 있던 곳. 분할한 배치를 복원할 수 있습니다.',
          '마지막으로 사용한 그룹, 마지막 복구와 그 결과.',
          '데이터가 필요한 버튼에는 짧은 코드가 붙습니다. 한 번만 작동하며 10분 뒤 만료됩니다.',
        ],
      },
      commands: {
        heading: '명령어',
        intro: 'GM 전용입니다. !sync도 쓸 수 있습니다.',
        colCommand: '명령어',
        colDesc: '하는 일',
      },
      settings: {
        heading: '설정',
        intro:
          '설정은 설정 카드나 !syncpage set으로 바꿉니다. 그룹 설정은 그룹 카드에서 한 그룹만 따로 바꿀 수 있습니다.',
        colKey: '키',
        colName: '설정',
        colDesc: '의미',
        colScope: '범위',
        scopeGroup: '그룹별',
        scopeGlobal: '전체',
      },
      api: {
        heading: '다른 Mod를 위해',
        intro: '전역 SyncPage 오브젝트:',
        colFunction: '함수',
        colDesc: '하는 일',
        rows: {
          getGroup: '페이지가 속한 그룹: ID, 이름, 원본, 페이지.',
          getLinked: '오브젝트의 링크된 사본, 페이지별.',
          notify: '내 Mod가 한 변경을 미러링합니다(API 변경은 이벤트를 일으키지 않습니다).',
          isHidden: '오브젝트의 사본이 페이지에서 숨겨져 있는지 여부.',
          onSync: '미러링된 모든 생성, 변경, 삭제를 알림받습니다.',
          repair: '그룹을 복구합니다. { dryRun: true }는 세기만 합니다.',
        },
      },
      upgrading: {
        heading: '0.1에서 업그레이드',
        points: [
          '이름이 "_synced"로 끝나는 페이지는 그것을 뺀 같은 이름의 페이지와 그룹이 되고, 그 페이지가 원본이 됩니다. 나중에 페이지 이름을 바꿀 수 있습니다.',
          '예전 링크는 유지되고, 나머지는 위치와 이미지로 짝을 짓습니다.',
          'GM 메모의 Show/Hide 플래그는 숨긴 사본이 되며, 플래그 문구는 GM 메모에서 지워집니다.',
          '예전 설정의 사용자 지정 명령어는 계속 작동합니다. "True Copy"는 없어졌으니 페이지 복제를 사용하세요.',
        ],
      },
      troubleshooting: {
        heading: '문제 해결',
        points: [
          '토큰이 잘못된 이미지로 복사됨: API는 마켓플레이스 아트를 복사할 수 없습니다. 페이지 복제로 사본을 만들어 그룹에 추가하세요.',
          '다른 Mod가 무언가를 바꾼 뒤 사본이 어긋남: 복구를 실행하거나, 그 Mod의 제작자에게 SyncPage.notify를 호출해 달라고 요청하세요.',
          '사본 하나만 일부러 다시 배치하고 싶나요? 그룹을 일시 중지하고 변경한 뒤, 다시 시작에서 복구하지 않기를 고르세요.',
        ],
      },
      languages: {
        heading: '언어',
        body: '언어는 설정 카드에서 정합니다. 메뉴, 메시지, 이 핸드아웃이 그 언어를 따릅니다.',
        colLanguage: '언어',
        colNative: '고유 이름',
        colCode: '코드',
      },
      credits: {
        heading: '만든 사람',
        original: '원작 Mod 제작:',
        maintainer: '재작성 및 유지 관리:',
        support: '문제는 Roll20 포럼이나 GitHub에 알려 주세요.',
      },
    },
  };

  var localePl = {
    titles: {
      ready: 'SyncPage jest gotowy.',
      group: 'Grupa synchronizacji: {name}',
      players: 'Gracze: {name}',
      settings: 'Ustawienia SyncPage',
      groupSettings: 'Ustawienia: {name}',
      status: 'Stan SyncPage',
      recycle: 'Kosz: {name}',
      dryRun: 'Podgląd naprawy: {name}',
      repaired: 'Naprawiono: {name}',
      repairedOnStart: 'SyncPage naprawił Twoje grupy',
      help: 'Polecenia SyncPage',
      deleted: 'Usunięto na jednej stronie',
      leftovers: 'Obiekty bez dopasowania',
      warning: 'SyncPage',
    },
    messages: {
      readyHint: 'Wpisz !syncpage, aby otworzyć menu.',
      migrated:
        'Przeniesiono konfigurację SyncPage 0.1: grupy: {groups}, zachowane powiązania: {links}, ukryte kopie: {hidden}. Nazwy stron kończące się na „_synced” można teraz zmienić.',
      trueCopyGone:
        'Stara funkcja „True Copy” została usunięta: użyj opcji Roll20 Duplikuj stronę, a potem dodaj kopię do grupy.',
      groupCreated:
        'Utworzono grupę „{name}” ze strony {page}, obiekty: {count}. Zduplikuj stronę, a potem dodaj kopię przyciskiem „Dodaj tę stronę do grupy”.',
      pageAdded:
        'Strona {page} dołączyła do „{name}”: sparowane: {paired}, skopiowane: {copied}, nieskopiowane: {failed}, bez dopasowania: {leftovers}.',
      pageRemoved: 'Strona {page} opuściła „{name}”. Jej obiekty zostają, bez powiązań.',
      groupDeleted: 'Usunięto grupę „{name}”. Obiekty zostają na swoich stronach.',
      notConfirmed: 'Nic nie zmieniono (brak potwierdzenia).',
      hidden: 'Ukryte kopie: {count}. Niepowiązane obiekty: {skipped}.',
      shown: 'Pokazane kopie: {count}. Niepowiązane obiekty: {skipped}.',
      hideFallback:
        'Kopie przeniesione na warstwę MG zamiast usunięcia: {count}. Używają obrazu, którego API nie potrafi odtworzyć.',
      deletedAsk: 'Usunięto {name} na stronie {page}. Kopie na innych stronach nadal istnieją.',
      deletedEverywhere: 'Usunięte pozostałe kopie: {count}. Przycisk Cofnij je przywróci.',
      keptOthers: 'Pozostałe kopie zostają.',
      restored: 'Przywrócone obiekty: {count}. Nie udało się przywrócić: {failed}.',
      nothingToUndo: 'Nie ma nic do cofnięcia.',
      recycleEmptied: 'Kosz jest pusty.',
      leftovers:
        'Obiekty na stronie {page} bez dopasowania w grupie: {count}. Skopiować je na inne strony czy zostawić tylko na tej stronie?',
      andMore: '…i jeszcze {count}.',
      leftoversCopied: 'Obiekty skopiowane na inne strony: {count}.',
      leftoversKept: 'Obiekty pozostawione tylko na swojej stronie: {count}.',
      imageNotCopied:
        '{name} na stronie {page} używa obrazu, którego API nie potrafi skopiować (grafika z marketplace). Użyj opcji Roll20 Duplikuj stronę, aby zrobić kopie z tym obrazem, a potem dodaj kopię do grupy.',
      moved: 'Gracz {player} jest teraz na stronie {page}.',
      movedAll:
        'Gracze przeniesieni na stronę {page}: {count}. „Przywróć układ” odsyła ich z powrotem.',
      layoutSaved: 'Zapamiętano, gdzie są gracze (liczba: {count}).',
      layoutRestored: 'Gracze przeniesieni z powrotem: {count}.',
      layoutReset: 'Zapamiętany układ został wyczyszczony.',
      unlinked: 'Odłączone obiekty: {count}. Zostają tylko na tej stronie.',
      paused:
        'Odzwierciedlanie grupy „{name}” jest wstrzymane. Zmiany zostają na stronie, na której je wprowadzono, dopóki go nie wznowisz.',
      resumed: 'Odzwierciedlanie grupy „{name}” znów działa. Znalezione różnice: {count}.',
      settingsReset: 'Przywrócono domyślne ustawienia.',
      resetMoved: 'Użyj {command}, aby przywrócić domyślne ustawienia.',
      handouts: 'Odtworzono notatki z pomocą i panelem poleceń.',
      pruned: 'Uporządkowano: puste powiązania: {links}, brakujące strony: {pages}.',
      startRepair:
        '{name}: rozsynchronizowane: {drifted}, odtworzone: {recreated}, usunięte: {removed}, skopiowane nowe obiekty: {mirrored}.',
    },
    errors: {
      hint: 'Wpisz {command} help, aby zobaczyć polecenia.',
      gmOnly: 'Tylko MG może używać SyncPage.',
      unknownCommand: 'Nieznane polecenie: {command}.',
      unknownSetting: 'Nieznane ustawienie: {key}.',
      badValue: '„{value}” nie jest prawidłową wartością dla {key}.',
      globalOnly: '{key} dotyczy wszystkich grup i nie można go zmienić dla jednej.',
      noGroup: 'Nie znaleziono grupy synchronizacji dla „{name}”.',
      groupExists: 'Grupa o nazwie „{name}” już istnieje.',
      noName: 'Podaj nazwę.',
      pageInGroup: 'Strona {page} jest już w grupie „{group}”.',
      pageNotInGroup: 'Strona {page} nie należy do grupy „{name}”.',
      nothingSelected: 'Najpierw zaznacz co najmniej jeden obiekt.',
      noPage: 'Nie znaleziono strony dla „{page}”.',
      noPlayer: 'Nie znaleziono gracza dla „{player}”.',
      requestExpired: 'Ten przycisk wygasł. Otwórz kartę ponownie.',
      requestUnknown: 'Ten przycisk został już użyty.',
    },
    menu: {
      thisPage: 'Ta strona',
      group: 'Grupa',
      source: 'źródło',
      copy: 'kopia',
      paused: 'Wstrzymane',
      notInGroup: 'Ta strona nie należy do grupy synchronizacji.',
      duplicateHint:
        'Wskazówka: utwórz grupę ze strony mapy, użyj na niej opcji Roll20 Duplikuj stronę, przejdź do kopii i dodaj ją do grupy. W ten sposób kopie zachowują grafiki z marketplace.',
      selectedHint: 'Ukryj i Pokaż działają na zaznaczone obiekty.',
      groups: 'Grupy',
    },
    group: {
      pages: 'Strony (★ = źródło)',
      playersCount: 'Gracze: {count}',
      sourceHint: 'Strona źródłowa jest wzorcem dla napraw.',
      summary: 'Podsumowanie',
      links: 'Powiązane obiekty',
      hidden: 'Ukryte kopie',
      recycle: 'W koszu',
      overrides: 'Własne ustawienia',
      none: 'brak',
      lastRepair:
        'Ostatnia naprawa {when}: rozsynchronizowane: {drifted}, odtworzone: {recreated}.',
    },
    players: {
      none: 'W tej grze nie ma jeszcze graczy.',
      elsewhere: 'poza tą grupą',
      visibility: 'Zaznaczone obiekty: kliknij, aby ukryć lub pokazać na stronie',
      selectHint:
        'Zaznacz tokeny i otwórz tę kartę ponownie, aby ukrywać lub pokazywać je strona po stronie.',
      shown: 'widoczne',
      hidden: 'ukryte',
      layoutSaved: 'Zapamiętano układ graczy (liczba: {count}).',
      youAreOn: 'Jesteś na stronie {page}.',
    },
    status: {
      notLinked: 'niepowiązany',
      pageOnly: 'tylko na tej stronie',
      missing: 'brak',
    },
    recycle: {
      empty: 'Kosz jest pusty.',
      reasons: {
        delete: 'Usunięcie',
        repair: 'Naprawa',
        exclude: 'Wykluczona warstwa',
        group: 'Usunięta grupa',
      },
    },
    repair: {
      drifted: 'Rozsynchronizowane kopie',
      recreated: 'Odtworzone brakujące kopie',
      removed: 'Usunięte kopie (usunięto źródło)',
      dropped: 'Usunięte puste powiązania',
      mirrored: 'Skopiowane nowe obiekty',
      leftovers: 'Nowe obiekty na kopiach',
      pageSettings: 'Strony z innymi ustawieniami',
      dryRunNote: 'Jeszcze nic nie zmieniono.',
      doneNote: 'Gotowe. Usunięte obiekty są w koszu.',
    },
    age: {
      now: 'przed chwilą',
      minutes: '{count} min temu',
      hours: '{count} godz. temu',
      days: '{count} d temu',
    },
    types: {
      graphic: 'Token',
      text: 'Tekst',
      path: 'Rysunek',
      pathv2: 'Rysunek',
      door: 'Drzwi',
      window: 'Okno',
    },
    values: {
      on: 'Włączone',
      off: 'Wyłączone',
      none: 'Brak',
    },
    queries: {
      group: 'Grupa',
      groupName: 'Nazwa grupy',
      deleteGroup: 'Usunąć grupę {name}? Obiekty zostaną na swoich stronach.',
      resetSettings: 'Przywrócić domyślne ustawienia?',
      emptyRecycle: 'Opróżnić kosz? Tego nie można cofnąć.',
      yes: 'Tak',
      no: 'Nie',
    },
    buttons: {
      menu: 'Menu',
      group: 'Grupa',
      players: 'Gracze',
      repair: 'Napraw',
      repairNow: 'Napraw teraz',
      dryRun: 'Podgląd naprawy',
      pause: 'Wstrzymaj',
      resume: 'Wznów',
      status: 'Stan',
      hideHere: 'Ukryj tutaj',
      showHere: 'Pokaż tutaj',
      hideOthers: 'Ukryj na innych stronach',
      showOthers: 'Pokaż na innych stronach',
      createGroup: 'Utwórz grupę z tej strony',
      addToGroup: 'Dodaj tę stronę do grupy',
      removePage: 'Usuń z grupy',
      makeSource: 'Ustaw jako źródło',
      settings: 'Ustawienia',
      groupSettings: 'Ustawienia grupy',
      recycle: 'Kosz',
      undo: 'Cofnij',
      help: 'Pomoc',
      rename: 'Zmień nazwę',
      deleteGroup: 'Usuń grupę',
      everyoneTo: 'Wszyscy na {page}',
      saveLayout: 'Zapisz układ',
      restoreLayout: 'Przywróć układ',
      useGlobal: 'Użyj globalnych',
      reset: 'Resetuj ustawienia',
      restore: 'Przywróć',
      emptyRecycle: 'Opróżnij',
      deleteEverywhere: 'Usuń wszędzie',
      keepOthers: 'Zostaw pozostałe',
      copy: 'Kopiuj',
      keepHere: 'Zostaw tutaj',
      copyAll: 'Kopiuj wszystkie',
      keepAll: 'Zostaw wszystkie tutaj',
      unlink: 'Odłącz',
      rebuild: 'Odtwórz notatki',
    },
    settings: {
      deleteMode: 'Gdy obiekt zostanie usunięty',
      hideMode: 'Sposób ukrywania kopii',
      pairLeftovers: 'Obiekty bez dopasowania',
      newObjects: 'Nowe obiekty',
      localProps: 'Osobne dla strony (tokeny)',
      localPageSettings: 'Osobne dla strony (ustawienia strony)',
      excludeLayers: 'Warstwy bez synchronizacji',
      syncPageSettings: 'Odzwierciedlaj ustawienia strony',
      repairOnStart: 'Naprawa przy starcie',
      playerMenu: 'Kto może otworzyć kartę graczy',
      recycleSize: 'Rozmiar kosza',
      language: 'Język',
      groupHint:
        'Te ustawienia dotyczą tylko tej grupy. „Użyj globalnych” wraca do głównego ustawienia.',
      override: 'ta grupa',
      global: 'globalne',
    },
    settingsHelp: {
      deleteMode:
        'Wszędzie: usunięcie na dowolnej stronie usuwa każdą kopię. Tylko strona źródłowa: rozchodzą się tylko usunięcia ze strony źródłowej. Odłącz: nic się nie rozchodzi. Pytaj: wysyła wybór szeptem.',
      hideMode:
        'Warstwa MG: kopia przechodzi na warstwę MG. Usuń: kopia jest usuwana i tworzona na nowo przy pokazaniu, więc gracze nie mają czego znaleźć.',
      pairLeftovers:
        'Gdy strona dołącza do grupy lub jest naprawiana: pytaj, skopiuj je na inne strony albo zostaw na ich stronie.',
      newObjects:
        'Odzwierciedlaj: kopiowane są obiekty utworzone na dowolnej stronie. Tylko źródło: kopiowane są tylko obiekty utworzone na stronie źródłowej.',
      localProps:
        'Właściwości tokenów, które każda strona zachowuje dla siebie, np. widzenie dla jednego gracza.',
      localPageSettings:
        'Ustawienia strony, które każda strona zachowuje dla siebie, np. ciemność dla jednej grupy graczy.',
      excludeLayers: 'Obiekty na tych warstwach zostają na swojej stronie.',
      syncPageSettings:
        'Kopiuj ustawienia strony (oświetlenie, siatka, rozmiar…) między stronami grupy.',
      repairOnStart: 'Przy starcie sandboksa: napraw po cichu, napraw i zgłoś albo nic nie rób.',
      playerMenu: 'Tylko MG albo gracze też mogą sprawdzić, na której stronie są.',
      recycleSize: 'Ile usunięć każda grupa przechowuje dla funkcji Cofnij.',
      language: 'Język menu, komunikatów i notatek.',
    },
    options: {
      deleteMode: {
        all: 'Wszędzie',
        source: 'Tylko strona źródłowa',
        unlink: 'Odłącz',
        ask: 'Pytaj',
      },
      hideMode: { gmlayer: 'Warstwa MG', remove: 'Usuń' },
      pairLeftovers: { ask: 'Pytaj', copy: 'Kopiuj', leave: 'Zostaw' },
      newObjects: { mirror: 'Odzwierciedlaj', sourceOnly: 'Tylko źródło' },
      localProps: {
        gmnotes: 'Notatki MG',
        name: 'Nazwa',
        bars: 'Paski',
        markers: 'Znaczniki',
        tint: 'Zabarwienie',
        aura: 'Aury',
        vision: 'Widzenie',
        light: 'Światło',
        controlledby: 'Kontrolowany przez',
      },
      localPageSettings: {
        lighting: 'Oświetlenie',
        daylight: 'Światło dzienne',
        explorer: 'Tryb odkrywcy',
        fog: 'Mgła',
        grid: 'Siatka',
        background: 'Tło',
        scale: 'Rozmiar i skala',
        jukebox: 'Jukebox',
      },
      excludeLayers: {
        map: 'Mapa',
        objects: 'Tokeny',
        gmlayer: 'MG',
        foreground: 'Pierwszy plan',
        walls: 'Ściany',
      },
      repairOnStart: { quiet: 'Po cichu', report: 'Ze zgłoszeniem', off: 'Wyłączone' },
      playerMenu: { gm: 'Tylko MG', players: 'Też gracze' },
    },
    help: {
      menu: 'Otwiera menu.',
      groupCreate: 'Tworzy grupę synchronizacji z tej strony.',
      groupAdd: 'Dodaje tę stronę do grupy: pasujące obiekty są parowane, brakujące kopiowane.',
      groupRemove: 'Wyjmuje tę stronę z jej grupy. Obiekty zostają, bez powiązań.',
      groupShow: 'Pokazuje kartę grupy.',
      groupRename: 'Zmienia nazwę grupy.',
      groupSource: 'Ustawia tę stronę jako źródło grupy (wzorzec dla napraw).',
      groupDelete: 'Usuwa grupę (najpierw pyta). Obiekty zostają.',
      players:
        'Pokazuje, kto jest na której stronie, z przyciskami do przenoszenia graczy oraz ukrywania i pokazywania zaznaczonych tokenów na każdej stronie.',
      move: 'Przenosi jednego gracza na stronę (rozdzielenie drużyny).',
      moveAll: 'Przenosi wszystkich graczy z grupy na jedną stronę i zapamiętuje, gdzie byli.',
      layout: 'Zapamiętuje lub przywraca, na której stronie jest każdy gracz.',
      hide: 'Ukrywa kopie zaznaczonych obiektów: tutaj, na innych stronach, wszędzie lub na wskazanych stronach.',
      show: 'Ponownie pokazuje ukryte kopie.',
      status: 'Pokazuje powiązania zaznaczonych obiektów i miejsca, gdzie są ukryte.',
      unlink: 'Zostawia zaznaczone obiekty tylko na tej stronie.',
      repair: 'Wyrównuje kopie ze stroną źródłową. --dry-run tylko raportuje.',
      pause: 'Wstrzymuje na jakiś czas odzwierciedlanie grupy.',
      resume: 'Wznawia odzwierciedlanie; pokazuje różnice.',
      undo: 'Przywraca ostatnie usunięcie.',
      recycle: 'Wyświetla usunięcia i przywraca dowolne z nich.',
      settings: 'Pokazuje ustawienia, globalne lub jednej grupy.',
      set: 'Zmienia ustawienie. Listy przyjmują +name lub -name.',
      settingsReset: 'Przywraca domyślne ustawienia (najpierw pyta).',
      handouts: 'Odtwarza notatki z pomocą i panelem poleceń.',
      help: 'Pokazuje tę listę.',
      ids: 'Działa na tych obiektach zamiast na zaznaczonych.',
      page: 'Działa na tej stronie zamiast na tej, którą oglądasz.',
      footer: 'Notatka {help} wyjaśnia wszystko; {deck} ma przyciski.',
    },
    deck: {
      menuTitle: 'Menu',
      menuDesc: 'Główne menu, gracze i ustawienia.',
      groupsTitle: 'Grupy',
      groupsDesc: 'Utwórz grupę ze strony, na której jesteś, lub dodaj tę stronę do grupy.',
      selectedTitle: 'Zaznaczone obiekty',
      selectedDesc: 'Ukryj lub pokaż kopie zaznaczonych obiektów.',
      toolsTitle: 'Narzędzia',
      toolsDesc: 'Naprawa, cofanie, wstrzymanie i notatki.',
      footer: 'Zobacz {help}, aby dowiedzieć się, jak działa SyncPage.',
    },
    handout: {
      versionLabel: 'Wersja',
      subtitle: 'Połączone strony dla rozdzielonej drużyny',
      footer: 'Otwórz {deck}, aby użyć przycisków.',
      overview: {
        heading: 'Przegląd',
        body: 'SyncPage utrzymuje strony w zgodzie. Strony w grupie synchronizacji współdzielą tokeny, rysunki, ściany, drzwi, okna, teksty i ustawienia strony: co zmienia się na jednej stronie, zmienia się na pozostałych. Dzięki funkcji Roll20 rozdzielania drużyny umieszczasz graczy na różnych kopiach, a potem ukrywasz lub pokazujesz elementy na każdej kopii osobno, tak aby każdy gracz widział tylko to, co powinna widzieć jego postać.',
        why: 'Roll20 nie potrafi ukryć obiektu tylko przed niektórymi graczami na jednej stronie. Dynamiczne oświetlenie daje każdemu tokenowi własne widzenie, ale nie „ten BN jest niewidzialny tylko dla łotrzyka”. Odzwierciedlone strony to umożliwiają.',
      },
      quickStart: {
        heading: 'Szybki start',
        steps: [
          'Przejdź do strony mapy i wpisz !syncpage, a potem kliknij „Utwórz grupę z tej strony”.',
          'Użyj na tej stronie opcji Roll20 Duplikuj stronę (menu karty strony). Kopiuje ona grafiki z marketplace, czego API nie potrafi.',
          'Przejdź do kopii i kliknij „Dodaj tę stronę do grupy”. SyncPage paruje pasujące obiekty i kopiuje wszystko, czego brakuje.',
          'Otwórz kartę Gracze, aby przenieść graczy na kopię, a potem zaznacz tokeny i ukryj je na jednej stronie.',
        ],
      },
      mirroring: {
        heading: 'Co jest odzwierciedlane',
        points: [
          'Tokeny (w tym światła Jumpgate), teksty, rysunki Legacy i Jumpgate, ściany każdego rodzaju, drzwi i okna.',
          'Nowe obiekty, zmiany i usunięcia, w obu kierunkach. Usunięcia działają według ustawienia „Gdy obiekt zostanie usunięty”.',
          'Ustawienia strony, takie jak oświetlenie, siatka i rozmiar, chyba że są wyłączone lub zachowane osobno dla strony.',
          'Warstwy można wyłączyć dla grupy, a właściwości tokenów, takie jak widzenie, można zachować osobno dla każdej strony.',
          'Zmiany, które inne Mody wprowadzają przez TokenMod, też są odzwierciedlane. Inne Mody mogą wywołać SyncPage.notify; naprawa wyłapie resztę.',
        ],
      },
      visibility: {
        heading: 'Ukrywanie na stronach',
        points: [
          'Zaznacz tokeny i użyj Ukryj tutaj, Ukryj na innych stronach lub siatki na karcie Gracze.',
          'Ukrywana jest tylko kopia z tej strony. Zmiany z innych stron nigdy nie cofają ukrycia.',
          'Tryb Warstwa MG przenosi kopię na warstwę MG. Tryb Usuń usuwa ją i tworzy na nowo przy pokazaniu, więc na stronie nie zostaje nic, co gracze mogliby znaleźć.',
        ],
      },
      players: {
        heading: 'Gracze',
        points: [
          'Karta Gracze wymienia każdego gracza i stronę, na której jest, z przyciskiem dla każdej strony, aby go przenieść (rozdzielenie drużyny).',
          '„Wszyscy na” zbiera graczy na jednej stronie i zapamiętuje, gdzie byli; „Przywróć układ” odsyła ich z powrotem.',
        ],
      },
      repair: {
        heading: 'Naprawa',
        points: [
          'Naprawa wyrównuje kopie ze stroną źródłową: rozsynchronizowane właściwości, brakujące kopie, obiekty usunięte lub utworzone, gdy SyncPage nie obserwował.',
          'Podgląd naprawy pokazuje, co by się zmieniło, niczego nie zmieniając. Naprawa, która zmieniłaby wiele obiektów, najpierw pyta.',
          'Naprawa działa po cichu przy starcie sandboksa (ustawienie). Identyfikatory obiektów pozostają te same, inaczej niż w 0.1.',
        ],
      },
      memory: {
        heading: 'Co pamięta SyncPage',
        points: [
          'Kosz dla każdej grupy: każde rozchodzące się usunięcie i każde porządkowanie można cofnąć przyciskiem Cofnij.',
          'Gdzie był każdy gracz, aby można było przywrócić podział.',
          'Ostatnio używaną grupę, ostatnią naprawę i jej wyniki.',
          'Przyciski potrzebujące danych niosą krótki kod; działają raz i wygasają po 10 minutach.',
        ],
      },
      commands: {
        heading: 'Polecenia',
        intro: 'Tylko dla MG. Działa też !sync.',
        colCommand: 'Polecenie',
        colDesc: 'Co robi',
      },
      settings: {
        heading: 'Ustawienia',
        intro:
          'Zmieniaj ustawienia na karcie ustawień lub poleceniem !syncpage set. Ustawienia grupowe można zmienić dla jednej grupy na jej karcie.',
        colKey: 'Klucz',
        colName: 'Ustawienie',
        colDesc: 'Znaczenie',
        colScope: 'Zakres',
        scopeGroup: 'Na grupę',
        scopeGlobal: 'Globalne',
      },
      api: {
        heading: 'Dla innych Modów',
        intro: 'Globalny obiekt SyncPage:',
        colFunction: 'Funkcja',
        colDesc: 'Co robi',
        rows: {
          getGroup: 'Grupa, do której należy strona: id, nazwa, źródło i strony.',
          getLinked: 'Powiązane kopie obiektu, według strony.',
          notify:
            'Odzwierciedla zmianę wprowadzoną przez Twój Mod (zmiany przez API nie wywołują zdarzeń).',
          isHidden: 'Czy kopia obiektu jest ukryta na stronie.',
          onSync: 'Powiadamia o każdym odzwierciedlonym utworzeniu, zmianie i usunięciu.',
          repair: 'Naprawia grupę; { dryRun: true } tylko liczy.',
        },
      },
      upgrading: {
        heading: 'Aktualizacja z 0.1',
        points: [
          'Strona, której nazwa kończy się na „_synced”, dołącza do grupy razem ze stroną o tej samej nazwie bez tej końcówki, która staje się źródłem. Potem można zmienić nazwy stron.',
          'Stare powiązania zostają zachowane; wszystko inne jest parowane według położenia i obrazu.',
          'Flagi Show/Hide w Notatkach MG stają się ukrytymi kopiami, a tekst flagi jest usuwany z Notatek MG.',
          'Własne polecenie ze starej konfiguracji nadal działa. „True Copy” zostało usunięte: użyj opcji Duplikuj stronę.',
        ],
      },
      troubleshooting: {
        heading: 'Rozwiązywanie problemów',
        points: [
          'Token skopiowany z niewłaściwym obrazem: API nie potrafi kopiować grafik z marketplace. Zrób kopię opcją Duplikuj stronę i dodaj ją do grupy.',
          'Kopie rozsynchronizowane po zmianach innego Moda: uruchom Napraw albo poproś autora tego Moda o wywołanie SyncPage.notify.',
          'Chcesz celowo przestawić jedną kopię? Wstrzymaj grupę, wprowadź zmiany, potem kliknij Wznów i nie wybieraj naprawy.',
        ],
      },
      languages: {
        heading: 'Języki',
        body: 'Ustaw język na karcie ustawień. Menu, komunikaty i te notatki będą go używać.',
        colLanguage: 'Język',
        colNative: 'Nazwa rodzima',
        colCode: 'Kod',
      },
      credits: {
        heading: 'Podziękowania',
        original: 'Oryginalny Mod autorstwa',
        maintainer: 'Przepisany i utrzymywany przez',
        support: 'Problemy zgłaszaj na forum Roll20 lub na GitHubie.',
      },
    },
  };

  var localePtPT = {
    titles: {
      ready: 'O SyncPage está pronto.',
      group: 'Grupo de sincronização: {name}',
      players: 'Jogadores: {name}',
      settings: 'Definições do SyncPage',
      groupSettings: 'Definições de {name}',
      status: 'Estado do SyncPage',
      recycle: 'Reciclagem: {name}',
      dryRun: 'Pré-visualização da reparação: {name}',
      repaired: 'Reparado: {name}',
      repairedOnStart: 'O SyncPage reparou os teus grupos',
      help: 'Comandos do SyncPage',
      deleted: 'Eliminado numa página',
      leftovers: 'Objetos sem correspondência',
      warning: 'SyncPage',
    },
    messages: {
      readyHint: 'Escreve !syncpage para abrir o menu.',
      migrated:
        'A tua configuração do SyncPage 0.1 foi mantida: {groups} grupo(s), {links} vínculo(s) mantido(s), {hidden} cópia(s) oculta(s). Já podes mudar o nome das páginas que terminam em «_synced».',
      trueCopyGone:
        'A antiga funcionalidade «True Copy» deixou de existir: usa a opção Duplicar página do Roll20 e depois adiciona a cópia a um grupo.',
      groupCreated:
        'Grupo «{name}» criado a partir de {page}, com {count} objeto(s). Duplica a página e depois adiciona a cópia com «Adicionar esta página a um grupo».',
      pageAdded:
        '{page} juntou-se a «{name}»: {paired} emparelhado(s), {copied} copiado(s), {failed} não puderam ser copiados, {leftovers} sem correspondência.',
      pageRemoved: '{page} saiu de «{name}». Os objetos ficam, desvinculados.',
      groupDeleted: 'Grupo «{name}» eliminado. Os objetos ficam nas suas páginas.',
      notConfirmed: 'Nada foi alterado (não confirmado).',
      hidden: '{count} cópia(s) ocultada(s). {skipped} objeto(s) não estão vinculados.',
      shown: '{count} cópia(s) mostrada(s). {skipped} objeto(s) não estão vinculados.',
      hideFallback:
        '{count} cópia(s) usam uma imagem que a API não consegue recriar, por isso foram movidas para a camada do Mestre em vez de removidas.',
      deletedAsk: '{name} foi eliminado em {page}. As suas cópias nas outras páginas continuam lá.',
      deletedEverywhere: 'Foram eliminadas mais {count} cópia(s). Anular repõe-nas.',
      keptOthers: 'As outras cópias ficam.',
      restored: '{count} objeto(s) reposto(s). {failed} não puderam ser repostos.',
      nothingToUndo: 'Não há nada para anular.',
      recycleEmptied: 'A reciclagem está vazia.',
      leftovers:
        '{count} objeto(s) em {page} não correspondem a nada no grupo. Copiá-los para as outras páginas ou mantê-los só nesta página?',
      andMore: '…e mais {count}.',
      leftoversCopied: '{count} objeto(s) copiado(s) para as outras páginas.',
      leftoversKept: '{count} objeto(s) mantido(s) só na sua página.',
      imageNotCopied:
        '{name} em {page} usa uma imagem que a API não consegue copiar (arte do Marketplace). Usa a opção Duplicar página do Roll20 para fazer cópias com ela e depois adiciona a cópia ao grupo.',
      moved: '{player} foi movido para {page}.',
      movedAll:
        '{count} jogador(es) movido(s) para {page}. «Repor disposição» volta a colocá-los onde estavam.',
      layoutSaved: 'Foi memorizado onde estão {count} jogador(es).',
      layoutRestored: '{count} jogador(es) voltaram para onde estavam.',
      layoutReset: 'A disposição memorizada foi apagada.',
      unlinked: '{count} objeto(s) desvinculado(s). Ficam só nesta página.',
      paused:
        'O espelhamento de «{name}» está em pausa. As alterações ficam na página onde são feitas até o retomares.',
      resumed: 'O espelhamento de «{name}» está de novo ativo. Encontrada(s) {count} diferença(s).',
      settingsReset: 'As definições foram repostas para as predefinições.',
      resetMoved: 'Usa {command} para repor as definições predefinidas.',
      handouts: 'Os folhetos de ajuda e de comandos foram reconstruídos.',
      pruned: 'Limpeza feita: {links} vínculo(s) vazio(s), {pages} página(s) em falta.',
      startRepair:
        '{name}: {drifted} dessincronizado(s), {recreated} recriado(s), {removed} removido(s), {mirrored} objeto(s) novo(s) copiado(s).',
    },
    errors: {
      hint: 'Escreve {command} help para ver os comandos.',
      gmOnly: 'Só o Mestre pode usar o SyncPage.',
      unknownCommand: 'Comando desconhecido: {command}.',
      unknownSetting: 'Definição desconhecida: {key}.',
      badValue: '«{value}» não é um valor válido para {key}.',
      globalOnly: '{key} aplica-se a todos os grupos e não pode ser alterada só para um.',
      noGroup: 'Não foi encontrado nenhum grupo de sincronização para «{name}».',
      groupExists: 'Já existe um grupo chamado «{name}».',
      noName: 'Indica um nome.',
      pageInGroup: '{page} já está no grupo «{group}».',
      pageNotInGroup: '{page} não está no grupo «{name}».',
      nothingSelected: 'Seleciona primeiro um ou mais objetos.',
      noPage: 'Não foi encontrada nenhuma página para «{page}».',
      noPlayer: 'Não foi encontrado nenhum jogador para «{player}».',
      requestExpired: 'Esse botão expirou. Abre o cartão outra vez.',
      requestUnknown: 'Esse botão já foi usado.',
    },
    menu: {
      thisPage: 'Esta página',
      group: 'Grupo',
      source: 'origem',
      copy: 'cópia',
      paused: 'Em pausa',
      notInGroup: 'Esta página não está em nenhum grupo de sincronização.',
      duplicateHint:
        'Dica: cria um grupo a partir da página do teu mapa, usa nela a opção Duplicar página do Roll20, vai à cópia e adiciona-a ao grupo. Assim as cópias mantêm a arte do Marketplace.',
      selectedHint: 'Ocultar e Mostrar atuam sobre os objetos selecionados.',
      groups: 'Grupos',
    },
    group: {
      pages: 'Páginas (★ = origem)',
      playersCount: '{count} jogador(es)',
      sourceHint: 'A página de origem é a referência para as reparações.',
      summary: 'Resumo',
      links: 'Objetos vinculados',
      hidden: 'Cópias ocultas',
      recycle: 'Na reciclagem',
      overrides: 'Definições próprias',
      none: 'nenhum',
      lastRepair: 'Última reparação {when}: {drifted} dessincronizado(s), {recreated} recriado(s).',
    },
    players: {
      none: 'Ainda não há jogadores neste jogo.',
      elsewhere: 'fora deste grupo',
      visibility: 'Objetos selecionados: clica para ocultar ou mostrar numa página',
      selectHint:
        'Seleciona tokens e abre este cartão outra vez para os ocultares ou mostrares página a página.',
      shown: 'visível',
      hidden: 'oculto',
      layoutSaved: 'Está memorizada uma disposição de {count} jogador(es).',
      youAreOn: 'Estás em {page}.',
    },
    status: {
      notLinked: 'não vinculado',
      pageOnly: 'só nesta página',
      missing: 'em falta',
    },
    recycle: {
      empty: 'A reciclagem está vazia.',
      reasons: {
        delete: 'Eliminado',
        repair: 'Reparação',
        exclude: 'Camada excluída',
        group: 'Grupo eliminado',
      },
    },
    repair: {
      drifted: 'Cópias dessincronizadas',
      recreated: 'Cópias em falta recriadas',
      removed: 'Cópias removidas (origem eliminada)',
      dropped: 'Vínculos vazios descartados',
      mirrored: 'Objetos novos copiados',
      leftovers: 'Objetos novos nas cópias',
      pageSettings: 'Páginas com outras definições',
      dryRunNote: 'Ainda não foi alterado nada.',
      doneNote: 'Feito. Os objetos removidos estão na reciclagem.',
    },
    age: {
      now: 'agora mesmo',
      minutes: 'há {count} min',
      hours: 'há {count} h',
      days: 'há {count} dias',
    },
    types: {
      graphic: 'Token',
      text: 'Texto',
      path: 'Desenho',
      pathv2: 'Desenho',
      door: 'Porta',
      window: 'Janela',
    },
    values: {
      on: 'Sim',
      off: 'Não',
      none: 'Nenhum',
    },
    queries: {
      group: 'Grupo',
      groupName: 'Nome do grupo',
      deleteGroup: 'Eliminar o grupo {name}? Os objetos ficam nas suas páginas.',
      resetSettings: 'Repor as definições predefinidas?',
      emptyRecycle: 'Esvaziar a reciclagem? Não é possível anular.',
      yes: 'Sim',
      no: 'Não',
    },
    buttons: {
      menu: 'Menu',
      group: 'Grupo',
      players: 'Jogadores',
      repair: 'Reparar',
      repairNow: 'Reparar já',
      dryRun: 'Pré-visualizar',
      pause: 'Pausar',
      resume: 'Retomar',
      status: 'Estado',
      hideHere: 'Ocultar aqui',
      showHere: 'Mostrar aqui',
      hideOthers: 'Ocultar nas outras',
      showOthers: 'Mostrar nas outras',
      createGroup: 'Criar grupo com esta página',
      addToGroup: 'Adicionar esta página a um grupo',
      removePage: 'Remover do grupo',
      makeSource: 'Tornar origem',
      settings: 'Definições',
      groupSettings: 'Definições do grupo',
      recycle: 'Reciclagem',
      undo: 'Anular',
      help: 'Ajuda',
      rename: 'Mudar o nome',
      deleteGroup: 'Eliminar grupo',
      everyoneTo: 'Todos para {page}',
      saveLayout: 'Guardar disposição',
      restoreLayout: 'Repor disposição',
      useGlobal: 'Usar global',
      reset: 'Repor definições',
      restore: 'Repor',
      emptyRecycle: 'Esvaziar',
      deleteEverywhere: 'Eliminar em todas',
      keepOthers: 'Manter as outras',
      copy: 'Copiar',
      keepHere: 'Manter aqui',
      copyAll: 'Copiar tudo',
      keepAll: 'Manter tudo aqui',
      unlink: 'Desvincular',
      rebuild: 'Reconstruir folhetos',
    },
    settings: {
      deleteMode: 'Quando um objeto é eliminado',
      hideMode: 'Como as cópias são ocultadas',
      pairLeftovers: 'Objetos sem correspondência',
      newObjects: 'Objetos novos',
      localProps: 'Próprio de cada página (tokens)',
      localPageSettings: 'Próprio de cada página (definições da página)',
      excludeLayers: 'Camadas não sincronizadas',
      syncPageSettings: 'Espelhar definições da página',
      repairOnStart: 'Reparar ao iniciar',
      playerMenu: 'Quem pode abrir o cartão de jogadores',
      recycleSize: 'Tamanho da reciclagem',
      language: 'Idioma',
      groupHint:
        'Estas definições aplicam-se só a este grupo. «Usar global» volta à definição principal.',
      override: 'este grupo',
      global: 'global',
    },
    settingsHelp: {
      deleteMode:
        'Em todas: eliminar em qualquer página elimina todas as cópias. Só página de origem: só as eliminações na página de origem se propagam. Desvincular: nunca se propagam. Perguntar: sussurra uma escolha.',
      hideMode:
        'Camada do Mestre: a cópia passa para a camada do Mestre. Remover: a cópia é eliminada e criada de novo quando é mostrada, por isso não fica nada que os jogadores possam encontrar.',
      pairLeftovers:
        'Quando uma página entra num grupo ou é reparada: perguntar, copiá-los para as outras páginas ou deixá-los na sua página.',
      newObjects:
        'Espelhar: os objetos criados em qualquer página são copiados. Só origem: só são copiados os objetos criados na página de origem.',
      localProps:
        'Propriedades dos tokens que cada página guarda para si, como a visão para um jogador.',
      localPageSettings:
        'Definições da página que cada página guarda para si, como a escuridão para um grupo de jogadores.',
      excludeLayers: 'Os objetos nestas camadas ficam na sua própria página.',
      syncPageSettings:
        'Copia as definições da página (iluminação, grelha, tamanho…) entre as páginas do grupo.',
      repairOnStart:
        'Quando o sandbox arranca: reparar em silêncio, reparar e informar, ou não fazer nada.',
      playerMenu: 'Só o Mestre, ou os jogadores também podem perguntar em que página estão.',
      recycleSize: 'Quantas remoções cada grupo guarda para Anular.',
      language: 'Idioma dos menus, mensagens e folhetos.',
    },
    options: {
      deleteMode: {
        all: 'Em todas',
        source: 'Só página de origem',
        unlink: 'Desvincular',
        ask: 'Perguntar',
      },
      hideMode: { gmlayer: 'Camada do Mestre', remove: 'Remover' },
      pairLeftovers: { ask: 'Perguntar', copy: 'Copiar', leave: 'Deixar' },
      newObjects: { mirror: 'Espelhar', sourceOnly: 'Só origem' },
      localProps: {
        gmnotes: 'Notas do Mestre',
        name: 'Nome',
        bars: 'Barras',
        markers: 'Marcadores',
        tint: 'Tonalidade',
        aura: 'Auras',
        vision: 'Visão',
        light: 'Luz',
        controlledby: 'Controlado por',
      },
      localPageSettings: {
        lighting: 'Iluminação',
        daylight: 'Luz do dia',
        explorer: 'Modo explorador',
        fog: 'Nevoeiro',
        grid: 'Grelha',
        background: 'Fundo',
        scale: 'Tamanho e escala',
        jukebox: 'Jukebox',
      },
      excludeLayers: {
        map: 'Mapa',
        objects: 'Tokens',
        gmlayer: 'Mestre',
        foreground: 'Primeiro plano',
        walls: 'Paredes',
      },
      repairOnStart: { quiet: 'Em silêncio', report: 'E informar', off: 'Não' },
      playerMenu: { gm: 'Só o Mestre', players: 'Jogadores também' },
    },
    help: {
      menu: 'Abre o menu.',
      groupCreate: 'Cria um grupo de sincronização a partir desta página.',
      groupAdd:
        'Adiciona esta página a um grupo: os objetos correspondentes são emparelhados e os que faltam são copiados.',
      groupRemove: 'Retira esta página do seu grupo. Os objetos ficam, desvinculados.',
      groupShow: 'Mostra o cartão de um grupo.',
      groupRename: 'Muda o nome de um grupo.',
      groupSource: 'Torna esta página a origem do grupo (a referência para as reparações).',
      groupDelete: 'Elimina um grupo (pergunta primeiro). Os objetos ficam.',
      players:
        'Mostra quem está em cada página, com botões para os mover e para ocultar ou mostrar os tokens selecionados por página.',
      move: 'Move um jogador para uma página (dividir o grupo).',
      moveAll: 'Move todos os jogadores do grupo para uma página e memoriza onde estavam.',
      layout: 'Memoriza ou repõe a página em que está cada jogador.',
      hide: 'Oculta as cópias dos objetos selecionados: aqui, nas outras páginas, em todas ou nas páginas indicadas.',
      show: 'Mostra outra vez as cópias ocultas.',
      status: 'Mostra os vínculos dos objetos selecionados e onde estão ocultos.',
      unlink: 'Mantém os objetos selecionados só nesta página.',
      repair: 'Volta a sincronizar as cópias com a página de origem. --dry-run só informa.',
      pause: 'Para o espelhamento de um grupo durante algum tempo.',
      resume: 'Volta a espelhar; mostra as diferenças.',
      undo: 'Repõe a última remoção.',
      recycle: 'Lista as remoções e repõe qualquer uma delas.',
      settings: 'Mostra as definições, globais ou de um grupo.',
      set: 'Altera uma definição. As listas aceitam +name ou -name.',
      settingsReset: 'Repõe as definições predefinidas (pergunta primeiro).',
      handouts: 'Reconstrói os folhetos de ajuda e de comandos.',
      help: 'Mostra esta lista.',
      ids: 'Atua sobre estes objetos em vez dos selecionados.',
      page: 'Atua sobre esta página em vez da que estás a ver.',
      footer: 'O folheto {help} explica tudo; {deck} tem botões.',
    },
    deck: {
      menuTitle: 'Menu',
      menuDesc: 'O menu principal, os jogadores e as definições.',
      groupsTitle: 'Grupos',
      groupsDesc:
        'Cria um grupo a partir da página em que estás ou adiciona esta página a um grupo.',
      selectedTitle: 'Objetos selecionados',
      selectedDesc: 'Oculta ou mostra as cópias dos objetos selecionados.',
      toolsTitle: 'Ferramentas',
      toolsDesc: 'Reparar, anular, pausar e folhetos.',
      footer: 'Consulta {help} para saberes como funciona o SyncPage.',
    },
    handout: {
      versionLabel: 'Versão',
      subtitle: 'Páginas vinculadas para grupos divididos',
      footer: 'Abre {deck} para veres os botões.',
      overview: {
        heading: 'Visão geral',
        body: 'O SyncPage mantém as páginas sincronizadas. As páginas de um grupo de sincronização partilham os seus tokens, desenhos, paredes, portas, janelas, textos e definições da página: o que muda numa página muda nas outras. Com a funcionalidade de dividir o grupo do Roll20 colocas os jogadores em cópias diferentes e depois ocultas ou mostras coisas em cada cópia, para que cada jogador veja só o que a sua personagem deve ver.',
        why: 'O Roll20 não consegue ocultar um objeto só a alguns jogadores na mesma página. A iluminação dinâmica dá a cada token a sua própria visão, mas não permite «este PNJ é invisível só para o ladino». As páginas espelhadas permitem.',
      },
      quickStart: {
        heading: 'Início rápido',
        steps: [
          'Vai à página do teu mapa e escreve !syncpage; depois clica em «Criar grupo com esta página».',
          'Usa a opção Duplicar página do Roll20 nessa página (o menu do cartão da página). Copia a arte do Marketplace, o que a API não consegue fazer.',
          'Vai à cópia e clica em «Adicionar esta página a um grupo». O SyncPage emparelha os objetos que correspondem e copia tudo o que falta.',
          'Abre Jogadores para mover os jogadores para a cópia; depois seleciona tokens e oculta-os numa página.',
        ],
      },
      mirroring: {
        heading: 'O que é espelhado',
        points: [
          'Tokens (incluindo as luzes do Jumpgate), textos, desenhos Legacy e do Jumpgate, paredes de todos os tipos, portas e janelas.',
          'Objetos novos, alterações e eliminações, nos dois sentidos. As eliminações seguem a definição «Quando um objeto é eliminado».',
          'Definições da página como a iluminação, a grelha e o tamanho, a não ser que sejam desativadas ou mantidas por página.',
          'É possível excluir camadas por grupo, e propriedades dos tokens como a visão podem ser mantidas por página.',
          'As alterações que outros Mods fazem através do TokenMod também são espelhadas. Outros Mods podem chamar SyncPage.notify; a reparação trata do resto.',
        ],
      },
      visibility: {
        heading: 'Ocultar por página',
        points: [
          'Seleciona tokens e usa Ocultar aqui, Ocultar nas outras ou a grelha do cartão Jogadores.',
          'Só a cópia dessa página é ocultada. As alterações vindas de outras páginas nunca desfazem a ocultação.',
          'O modo Camada do Mestre move a cópia para a camada do Mestre. O modo Remover elimina-a e cria-a de novo quando é mostrada, por isso não fica nada na página que os jogadores possam encontrar.',
        ],
      },
      players: {
        heading: 'Jogadores',
        points: [
          'O cartão Jogadores lista cada jogador e a página em que está, com um botão por página para o mover (dividir o grupo).',
          '«Todos para» reúne os jogadores numa página e memoriza onde estavam; «Repor disposição» volta a colocá-los onde estavam.',
        ],
      },
      repair: {
        heading: 'Reparação',
        points: [
          'A reparação volta a sincronizar as cópias com a página de origem: propriedades dessincronizadas, cópias em falta e objetos eliminados ou criados enquanto o SyncPage não estava a vigiar.',
          'Pré-visualizar mostra o que mudaria sem alterar nada. Uma reparação que alteraria muitos objetos pergunta primeiro.',
          'A reparação corre em silêncio quando o sandbox arranca (definição). Os IDs dos objetos mantêm-se, ao contrário da 0.1.',
        ],
      },
      memory: {
        heading: 'O que o SyncPage memoriza',
        points: [
          'Uma reciclagem por grupo: cada eliminação propagada e cada limpeza pode ser reposta com Anular.',
          'Onde estava cada jogador, para que uma divisão possa ser reposta.',
          'O último grupo que usaste, a última reparação e os seus resultados.',
          'Os botões que precisam de dados levam um código curto; funcionam uma vez e expiram ao fim de 10 minutos.',
        ],
      },
      commands: {
        heading: 'Comandos',
        intro: 'Só para o Mestre. !sync também funciona.',
        colCommand: 'Comando',
        colDesc: 'O que faz',
      },
      settings: {
        heading: 'Definições',
        intro:
          'Altera as definições no cartão de definições ou com !syncpage set. As definições de grupo podem ser alteradas só para um grupo no respetivo cartão.',
        colKey: 'Chave',
        colName: 'Definição',
        colDesc: 'Significado',
        colScope: 'Âmbito',
        scopeGroup: 'Por grupo',
        scopeGlobal: 'Global',
      },
      api: {
        heading: 'Para outros Mods',
        intro: 'O objeto global SyncPage:',
        colFunction: 'Função',
        colDesc: 'O que faz',
        rows: {
          getGroup: 'O grupo em que está uma página: id, nome, origem e páginas.',
          getLinked: 'As cópias vinculadas de um objeto, por página.',
          notify:
            'Espelha uma alteração feita pelo teu Mod (as alterações da API não geram eventos).',
          isHidden: 'Se a cópia de um objeto está oculta numa página.',
          onSync: 'Recebe aviso de cada criação, alteração e eliminação espelhadas.',
          repair: 'Repara um grupo; { dryRun: true } só conta.',
        },
      },
      upgrading: {
        heading: 'Atualizar a partir da 0.1',
        points: [
          'Uma página cujo nome termina em «_synced» junta-se a um grupo com a página do mesmo nome sem esse sufixo, que passa a ser a origem. Depois podes mudar o nome das páginas.',
          'Os vínculos antigos são mantidos; tudo o resto é emparelhado por posição e imagem.',
          'As marcas Show/Hide nas Notas do Mestre passam a cópias ocultas, e o texto da marca é retirado das Notas do Mestre.',
          'Um comando personalizado da configuração antiga continua a funcionar. «True Copy» deixou de existir: usa Duplicar página.',
        ],
      },
      troubleshooting: {
        heading: 'Resolução de problemas',
        points: [
          'Um token copiado com a imagem errada: a API não consegue copiar a arte do Marketplace. Faz a cópia com Duplicar página e adiciona-a ao grupo.',
          'Cópias dessincronizadas depois de outro Mod alterar coisas: executa Reparar ou pede ao autor desse Mod que chame SyncPage.notify.',
          'Queres reorganizar uma cópia de propósito? Pausa o grupo, faz as alterações e depois retoma-o e escolhe não reparar.',
        ],
      },
      languages: {
        heading: 'Idiomas',
        body: 'Escolhe o idioma no cartão de definições. Os menus, as mensagens e estes folhetos seguem-no.',
        colLanguage: 'Idioma',
        colNative: 'Nome nativo',
        colCode: 'Código',
      },
      credits: {
        heading: 'Créditos',
        original: 'Mod original de',
        maintainer: 'Reescrito e mantido por',
        support: 'Comunica os problemas no fórum do Roll20 ou no GitHub.',
      },
    },
  };

  var localePtBR = {
    titles: {
      ready: 'O SyncPage está pronto.',
      group: 'Grupo de sincronização: {name}',
      players: 'Jogadores: {name}',
      settings: 'Configurações do SyncPage',
      groupSettings: 'Configurações de {name}',
      status: 'Status do SyncPage',
      recycle: 'Lixeira: {name}',
      dryRun: 'Prévia do reparo: {name}',
      repaired: 'Reparado: {name}',
      repairedOnStart: 'O SyncPage reparou seus grupos',
      help: 'Comandos do SyncPage',
      deleted: 'Excluído em uma página',
      leftovers: 'Objetos sem correspondência',
      warning: 'SyncPage',
    },
    messages: {
      readyHint: 'Digite !syncpage para abrir o menu.',
      migrated:
        'Sua configuração do SyncPage 0.1 foi mantida: {groups} grupo(s), {links} vínculo(s) mantido(s), {hidden} cópia(s) oculta(s). Agora você pode renomear as páginas cujo nome termina em “_synced”.',
      trueCopyGone:
        'O antigo recurso “True Copy” não existe mais: use o Duplicar página do próprio Roll20 e depois adicione a cópia a um grupo.',
      groupCreated:
        'Grupo “{name}” criado a partir de {page}, com {count} objeto(s). Duplique a página e depois adicione a cópia com “Adicionar esta página a um grupo”.',
      pageAdded:
        '{page} entrou em “{name}”: {paired} pareado(s), {copied} copiado(s), {failed} não puderam ser copiados, {leftovers} sem correspondência.',
      pageRemoved: '{page} saiu de “{name}”. Os objetos dela continuam lá, desvinculados.',
      groupDeleted: 'Grupo “{name}” excluído. Os objetos continuam nas suas páginas.',
      notConfirmed: 'Nada foi alterado (não confirmado).',
      hidden: '{count} cópia(s) ocultada(s). {skipped} objeto(s) não estão vinculados.',
      shown: '{count} cópia(s) exibida(s). {skipped} objeto(s) não estão vinculados.',
      hideFallback:
        '{count} cópia(s) usam uma imagem que a API não consegue recriar, então foram movidas para a camada do Mestre em vez de removidas.',
      deletedAsk: '{name} foi excluído em {page}. As cópias dele nas outras páginas continuam lá.',
      deletedEverywhere: 'Mais {count} cópia(s) excluída(s). Desfazer traz de volta.',
      keptOthers: 'As outras cópias continuam.',
      restored: '{count} objeto(s) restaurado(s). {failed} não puderam ser restaurados.',
      nothingToUndo: 'Não há nada para desfazer.',
      recycleEmptied: 'A lixeira está vazia.',
      leftovers:
        '{count} objeto(s) em {page} não correspondem a nada no grupo. Copiar para as outras páginas ou manter só nesta página?',
      andMore: '…e mais {count}.',
      leftoversCopied: '{count} objeto(s) copiado(s) para as outras páginas.',
      leftoversKept: '{count} objeto(s) mantido(s) só na sua página.',
      imageNotCopied:
        '{name} em {page} usa uma imagem que a API não consegue copiar (arte do Marketplace). Use o Duplicar página do Roll20 para fazer cópias com ela e depois adicione a cópia ao grupo.',
      moved: '{player} foi movido para {page}.',
      movedAll:
        '{count} jogador(es) movido(s) para {page}. “Restaurar posições” leva todos de volta.',
      layoutSaved: 'A posição de {count} jogador(es) foi salva.',
      layoutRestored: '{count} jogador(es) levado(s) de volta.',
      layoutReset: 'As posições salvas foram apagadas.',
      unlinked: '{count} objeto(s) desvinculado(s). Eles ficam só nesta página.',
      paused:
        'O espelhamento de “{name}” está pausado. As alterações ficam na página em que foram feitas até você retomar.',
      resumed: 'O espelhamento de “{name}” está ativo de novo. {count} diferença(s) encontrada(s).',
      settingsReset: 'As configurações voltaram ao padrão.',
      resetMoved: 'Use {command} para restaurar as configurações padrão.',
      handouts: 'Os folhetos de ajuda e de comandos foram recriados.',
      pruned: 'Limpeza feita: {links} vínculo(s) vazio(s), {pages} página(s) inexistente(s).',
      startRepair:
        '{name}: {drifted} dessincronizado(s), {recreated} recriado(s), {removed} removido(s), {mirrored} objeto(s) novo(s) copiado(s).',
    },
    errors: {
      hint: 'Digite {command} help para ver os comandos.',
      gmOnly: 'Só o Mestre pode usar o SyncPage.',
      unknownCommand: 'Comando desconhecido: {command}.',
      unknownSetting: 'Configuração desconhecida: {key}.',
      badValue: '“{value}” não é um valor válido para {key}.',
      globalOnly: '{key} vale para todos os grupos e não pode ser alterada para um só.',
      noGroup: 'Nenhum grupo de sincronização encontrado para “{name}”.',
      groupExists: 'Já existe um grupo chamado “{name}”.',
      noName: 'Informe um nome.',
      pageInGroup: '{page} já está no grupo “{group}”.',
      pageNotInGroup: '{page} não está no grupo “{name}”.',
      nothingSelected: 'Selecione um ou mais objetos primeiro.',
      noPage: 'Nenhuma página encontrada para “{page}”.',
      noPlayer: 'Nenhum jogador encontrado para “{player}”.',
      requestExpired: 'Esse botão expirou. Abra o cartão de novo.',
      requestUnknown: 'Esse botão já foi usado.',
    },
    menu: {
      thisPage: 'Esta página',
      group: 'Grupo',
      source: 'origem',
      copy: 'cópia',
      paused: 'Pausado',
      notInGroup: 'Esta página não está em nenhum grupo de sincronização.',
      duplicateHint:
        'Dica: crie um grupo a partir da página do seu mapa, use o Duplicar página do Roll20 nela, vá até a cópia e adicione-a ao grupo. Assim as cópias mantêm a arte do Marketplace.',
      selectedHint: 'Ocultar e Exibir agem sobre os objetos selecionados.',
      groups: 'Grupos',
    },
    group: {
      pages: 'Páginas (★ = origem)',
      playersCount: '{count} jogador(es)',
      sourceHint: 'A página de origem é a referência para os reparos.',
      summary: 'Resumo',
      links: 'Objetos vinculados',
      hidden: 'Cópias ocultas',
      recycle: 'Na lixeira',
      overrides: 'Configurações próprias',
      none: 'nenhum',
      lastRepair: 'Último reparo {when}: {drifted} dessincronizado(s), {recreated} recriado(s).',
    },
    players: {
      none: 'Ainda não há jogadores neste jogo.',
      elsewhere: 'fora deste grupo',
      visibility: 'Objetos selecionados: clique para ocultar ou exibir em uma página',
      selectHint:
        'Selecione tokens e abra este cartão de novo para ocultá-los ou exibi-los página por página.',
      shown: 'visível',
      hidden: 'oculto',
      layoutSaved: 'As posições de {count} jogador(es) estão salvas.',
      youAreOn: 'Você está em {page}.',
    },
    status: {
      notLinked: 'não vinculado',
      pageOnly: 'só nesta página',
      missing: 'ausente',
    },
    recycle: {
      empty: 'A lixeira está vazia.',
      reasons: {
        delete: 'Excluído',
        repair: 'Reparo',
        exclude: 'Camada excluída',
        group: 'Grupo removido',
      },
    },
    repair: {
      drifted: 'Cópias dessincronizadas',
      recreated: 'Cópias ausentes recriadas',
      removed: 'Cópias removidas (origem excluída)',
      dropped: 'Vínculos vazios descartados',
      mirrored: 'Objetos novos copiados',
      leftovers: 'Objetos novos nas cópias',
      pageSettings: 'Páginas com outras configurações',
      dryRunNote: 'Nada foi alterado ainda.',
      doneNote: 'Pronto. Os objetos removidos estão na lixeira.',
    },
    age: {
      now: 'agora mesmo',
      minutes: 'há {count} min',
      hours: 'há {count} h',
      days: 'há {count} dias',
    },
    types: {
      graphic: 'Token',
      text: 'Texto',
      path: 'Desenho',
      pathv2: 'Desenho',
      door: 'Porta',
      window: 'Janela',
    },
    values: {
      on: 'Ligado',
      off: 'Desligado',
      none: 'Nenhum',
    },
    queries: {
      group: 'Grupo',
      groupName: 'Nome do grupo',
      deleteGroup: 'Excluir o grupo {name}? Os objetos continuam nas suas páginas.',
      resetSettings: 'Restaurar as configurações padrão?',
      emptyRecycle: 'Esvaziar a lixeira? Isso não pode ser desfeito.',
      yes: 'Sim',
      no: 'Não',
    },
    buttons: {
      menu: 'Menu',
      group: 'Grupo',
      players: 'Jogadores',
      repair: 'Reparar',
      repairNow: 'Reparar agora',
      dryRun: 'Prévia do reparo',
      pause: 'Pausar',
      resume: 'Retomar',
      status: 'Status',
      hideHere: 'Ocultar aqui',
      showHere: 'Exibir aqui',
      hideOthers: 'Ocultar nas outras',
      showOthers: 'Exibir nas outras',
      createGroup: 'Criar grupo com esta página',
      addToGroup: 'Adicionar esta página a um grupo',
      removePage: 'Remover do grupo',
      makeSource: 'Tornar origem',
      settings: 'Configurações',
      groupSettings: 'Configurações do grupo',
      recycle: 'Lixeira',
      undo: 'Desfazer',
      help: 'Ajuda',
      rename: 'Renomear',
      deleteGroup: 'Excluir grupo',
      everyoneTo: 'Todos para {page}',
      saveLayout: 'Salvar posições',
      restoreLayout: 'Restaurar posições',
      useGlobal: 'Usar global',
      reset: 'Redefinir',
      restore: 'Restaurar',
      emptyRecycle: 'Esvaziar',
      deleteEverywhere: 'Excluir em todas',
      keepOthers: 'Manter as outras',
      copy: 'Copiar',
      keepHere: 'Manter aqui',
      copyAll: 'Copiar tudo',
      keepAll: 'Manter tudo aqui',
      unlink: 'Desvincular',
      rebuild: 'Recriar folhetos',
    },
    settings: {
      deleteMode: 'Quando um objeto é excluído',
      hideMode: 'Como as cópias são ocultadas',
      pairLeftovers: 'Objetos sem correspondência',
      newObjects: 'Objetos novos',
      localProps: 'Próprio de cada página (tokens)',
      localPageSettings: 'Próprio de cada página (configurações da página)',
      excludeLayers: 'Camadas não sincronizadas',
      syncPageSettings: 'Espelhar configurações da página',
      repairOnStart: 'Reparar ao iniciar',
      playerMenu: 'Quem pode abrir o cartão de jogadores',
      recycleSize: 'Tamanho da lixeira',
      language: 'Idioma',
      groupHint:
        'Estas configurações valem só para este grupo. “Usar global” volta à configuração principal.',
      override: 'este grupo',
      global: 'global',
    },
    settingsHelp: {
      deleteMode:
        'Em todas: excluir em qualquer página exclui todas as cópias. Só página de origem: só as exclusões na página de origem se propagam. Desvincular: nunca se propagam. Perguntar: sussurra uma escolha.',
      hideMode:
        'Camada do Mestre: a cópia vai para a camada do Mestre. Remover: a cópia é excluída e criada de novo quando exibida, então não sobra nada para os jogadores encontrarem.',
      pairLeftovers:
        'Quando uma página entra em um grupo ou é reparada: perguntar, copiar para as outras páginas ou deixar na página deles.',
      newObjects:
        'Espelhar: objetos criados em qualquer página são copiados. Só origem: só os objetos criados na página de origem são copiados.',
      localProps:
        'Propriedades de token que cada página mantém para si, como a visão para um jogador.',
      localPageSettings:
        'Configurações que cada página mantém para si, como a escuridão para um grupo de jogadores.',
      excludeLayers: 'Os objetos nestas camadas ficam na sua própria página.',
      syncPageSettings:
        'Copia as configurações da página (iluminação, grade, tamanho…) entre as páginas do grupo.',
      repairOnStart:
        'Quando o sandbox inicia: reparar em silêncio, reparar e avisar, ou não fazer nada.',
      playerMenu: 'Só o Mestre, ou os jogadores também podem perguntar em que página estão.',
      recycleSize: 'Quantas remoções cada grupo guarda para o Desfazer.',
      language: 'Idioma dos menus, mensagens e folhetos.',
    },
    options: {
      deleteMode: {
        all: 'Em todas',
        source: 'Só página de origem',
        unlink: 'Desvincular',
        ask: 'Perguntar',
      },
      hideMode: { gmlayer: 'Camada do Mestre', remove: 'Remover' },
      pairLeftovers: { ask: 'Perguntar', copy: 'Copiar', leave: 'Deixar' },
      newObjects: { mirror: 'Espelhar', sourceOnly: 'Só origem' },
      localProps: {
        gmnotes: 'Notas do Mestre',
        name: 'Nome',
        bars: 'Barras',
        markers: 'Marcadores',
        tint: 'Tonalidade',
        aura: 'Auras',
        vision: 'Visão',
        light: 'Luz',
        controlledby: 'Controlado por',
      },
      localPageSettings: {
        lighting: 'Iluminação',
        daylight: 'Luz do dia',
        explorer: 'Modo explorador',
        fog: 'Névoa',
        grid: 'Grade',
        background: 'Fundo',
        scale: 'Tamanho e escala',
        jukebox: 'Jukebox',
      },
      excludeLayers: {
        map: 'Mapa',
        objects: 'Tokens',
        gmlayer: 'Mestre',
        foreground: 'Primeiro plano',
        walls: 'Paredes',
      },
      repairOnStart: { quiet: 'Em silêncio', report: 'E avisar', off: 'Desligado' },
      playerMenu: { gm: 'Só o Mestre', players: 'Jogadores também' },
    },
    help: {
      menu: 'Abre o menu.',
      groupCreate: 'Cria um grupo de sincronização a partir desta página.',
      groupAdd:
        'Adiciona esta página a um grupo: os objetos correspondentes são pareados e os que faltam são copiados.',
      groupRemove: 'Tira esta página do grupo dela. Os objetos continuam, desvinculados.',
      groupShow: 'Exibe o cartão de um grupo.',
      groupRename: 'Renomeia um grupo.',
      groupSource: 'Torna esta página a origem do grupo (a referência para os reparos).',
      groupDelete: 'Exclui um grupo (pergunta antes). Os objetos continuam.',
      players:
        'Mostra quem está em cada página, com botões para mover os jogadores e para ocultar ou exibir os tokens selecionados por página.',
      move: 'Move um jogador para uma página (dividir o grupo).',
      moveAll: 'Move todos os jogadores do grupo para uma página, guardando onde eles estavam.',
      layout: 'Salva ou restaura a página em que cada jogador está.',
      hide: 'Oculta as cópias dos objetos selecionados: aqui, nas outras páginas, em todas ou nas páginas indicadas.',
      show: 'Exibe de novo as cópias ocultas.',
      status: 'Mostra os vínculos dos objetos selecionados e onde eles estão ocultos.',
      unlink: 'Mantém os objetos selecionados só nesta página.',
      repair: 'Sincroniza de novo as cópias com a página de origem. --dry-run só informa.',
      pause: 'Interrompe o espelhamento de um grupo por um tempo.',
      resume: 'Volta a espelhar; mostra o que está diferente.',
      undo: 'Traz de volta a última remoção.',
      recycle: 'Lista as remoções e restaura qualquer uma delas.',
      settings: 'Mostra as configurações, globais ou de um grupo.',
      set: 'Altera uma configuração. Listas aceitam +name ou -name.',
      settingsReset: 'Restaura as configurações padrão (pergunta antes).',
      handouts: 'Recria os folhetos de ajuda e de comandos.',
      help: 'Mostra esta lista.',
      ids: 'Age sobre estes objetos em vez dos selecionados.',
      page: 'Age sobre esta página em vez da que você está vendo.',
      footer: 'O folheto {help} explica tudo; {deck} tem botões.',
    },
    deck: {
      menuTitle: 'Menu',
      menuDesc: 'O menu principal, os jogadores e as configurações.',
      groupsTitle: 'Grupos',
      groupsDesc:
        'Crie um grupo a partir da página em que você está ou adicione esta página a um grupo.',
      selectedTitle: 'Objetos selecionados',
      selectedDesc: 'Oculte ou exiba as cópias dos objetos selecionados.',
      toolsTitle: 'Ferramentas',
      toolsDesc: 'Reparar, desfazer, pausar e folhetos.',
      footer: 'Veja {help} para saber como o SyncPage funciona.',
    },
    handout: {
      versionLabel: 'Versão',
      subtitle: 'Páginas vinculadas para grupos divididos',
      footer: 'Abra {deck} para ver os botões.',
      overview: {
        heading: 'Visão geral',
        body: 'O SyncPage mantém as páginas sincronizadas. As páginas de um grupo de sincronização compartilham seus tokens, desenhos, paredes, portas, janelas, textos e configurações da página: o que muda em uma página muda nas outras. Com o recurso de dividir o grupo do Roll20, você coloca os jogadores em cópias diferentes e depois oculta ou exibe coisas em cada cópia, para que cada jogador veja só o que o personagem dele deve ver.',
        why: 'O Roll20 não consegue ocultar um objeto só de alguns jogadores na mesma página. A iluminação dinâmica dá a cada token sua própria visão, mas não permite “este NPC é invisível só para o ladino”. Páginas espelhadas permitem.',
      },
      quickStart: {
        heading: 'Início rápido',
        steps: [
          'Vá até a página do seu mapa e digite !syncpage; depois clique em “Criar grupo com esta página”.',
          'Use o Duplicar página do Roll20 nessa página (no menu do cartão da página). Ele copia a arte do Marketplace, o que a API não consegue.',
          'Vá até a cópia e clique em “Adicionar esta página a um grupo”. O SyncPage pareia os objetos que correspondem e copia tudo o que estiver faltando.',
          'Abra Jogadores para mover os jogadores para a cópia; depois selecione tokens e oculte-os em uma página.',
        ],
      },
      mirroring: {
        heading: 'O que é espelhado',
        points: [
          'Tokens (incluindo as luzes do Jumpgate), textos, desenhos Legacy e do Jumpgate, paredes de todo tipo, portas e janelas.',
          'Objetos novos, alterações e exclusões, nos dois sentidos. As exclusões seguem a configuração “Quando um objeto é excluído”.',
          'Configurações da página como iluminação, grade e tamanho, a menos que estejam desligadas ou mantidas por página.',
          'Dá para deixar camadas de fora por grupo, e propriedades de token como a visão podem ser mantidas por página.',
          'Alterações que outros Mods fazem pelo TokenMod também são espelhadas. Outros Mods podem chamar SyncPage.notify; o reparo cuida do resto.',
        ],
      },
      visibility: {
        heading: 'Ocultar por página',
        points: [
          'Selecione tokens e use Ocultar aqui, Ocultar nas outras ou a grade do cartão Jogadores.',
          'Só a cópia daquela página fica oculta. Alterações vindas de outras páginas nunca desfazem a ocultação.',
          'O modo Camada do Mestre move a cópia para a camada do Mestre. O modo Remover exclui a cópia e a cria de novo quando exibida, então não sobra nada na página para os jogadores encontrarem.',
        ],
      },
      players: {
        heading: 'Jogadores',
        points: [
          'O cartão Jogadores lista cada jogador e a página em que ele está, com um botão por página para movê-lo (dividir o grupo).',
          '“Todos para” reúne os jogadores em uma página e guarda onde eles estavam; “Restaurar posições” leva todos de volta.',
        ],
      },
      repair: {
        heading: 'Reparo',
        points: [
          'O reparo sincroniza de novo as cópias com a página de origem: propriedades dessincronizadas, cópias ausentes, objetos excluídos ou criados enquanto o SyncPage não estava observando.',
          'A prévia do reparo mostra o que mudaria sem mudar nada. Um reparo que alteraria muitos objetos pergunta antes.',
          'O reparo roda em silêncio quando o sandbox inicia (configuração). Os IDs dos objetos continuam os mesmos, ao contrário da 0.1.',
        ],
      },
      memory: {
        heading: 'O que o SyncPage guarda',
        points: [
          'Uma lixeira por grupo: toda exclusão propagada e toda limpeza podem ser desfeitas com Desfazer.',
          'Onde cada jogador estava, para que uma divisão possa ser restaurada.',
          'O último grupo que você usou, o último reparo e os resultados dele.',
          'Botões que precisam de dados levam um código curto; eles funcionam uma vez e expiram depois de 10 minutos.',
        ],
      },
      commands: {
        heading: 'Comandos',
        intro: 'Só para o Mestre. !sync também funciona.',
        colCommand: 'Comando',
        colDesc: 'O que faz',
      },
      settings: {
        heading: 'Configurações',
        intro:
          'Altere as configurações no cartão de configurações ou com !syncpage set. As configurações de grupo podem ser alteradas para um só grupo no cartão dele.',
        colKey: 'Chave',
        colName: 'Configuração',
        colDesc: 'Significado',
        colScope: 'Escopo',
        scopeGroup: 'Por grupo',
        scopeGlobal: 'Global',
      },
      api: {
        heading: 'Para outros Mods',
        intro: 'O objeto global SyncPage:',
        colFunction: 'Função',
        colDesc: 'O que faz',
        rows: {
          getGroup: 'O grupo em que uma página está: id, nome, origem e páginas.',
          getLinked: 'As cópias vinculadas de um objeto, por página.',
          notify:
            'Espelha uma alteração feita pelo seu Mod (alterações via API não geram eventos).',
          isHidden: 'Se a cópia de um objeto está oculta em uma página.',
          onSync: 'Recebe aviso de cada criação, alteração e exclusão espelhada.',
          repair: 'Repara um grupo; { dryRun: true } só conta.',
        },
      },
      upgrading: {
        heading: 'Atualizando da 0.1',
        points: [
          'Uma página cujo nome termina em “_synced” entra em um grupo com a página de mesmo nome sem esse sufixo, que vira a origem. Depois você pode renomear as páginas.',
          'Os vínculos antigos são mantidos; todo o resto é pareado por posição e imagem.',
          'As marcações Show/Hide nas Notas do Mestre viram cópias ocultas, e o texto da marcação é removido das Notas do Mestre.',
          'Um comando personalizado da configuração antiga continua funcionando. “True Copy” não existe mais: use Duplicar página.',
        ],
      },
      troubleshooting: {
        heading: 'Solução de problemas',
        points: [
          'Um token copiado com a imagem errada: a API não consegue copiar a arte do Marketplace. Faça a cópia com Duplicar página e adicione-a ao grupo.',
          'Cópias dessincronizadas depois que outro Mod alterou coisas: rode Reparar ou peça ao autor desse Mod que chame SyncPage.notify.',
          'Quer reorganizar uma cópia de propósito? Pause o grupo, faça as alterações, depois clique em Retomar e escolha não reparar.',
        ],
      },
      languages: {
        heading: 'Idiomas',
        body: 'Escolha o idioma no cartão de configurações. Menus, mensagens e estes folhetos seguem essa escolha.',
        colLanguage: 'Idioma',
        colNative: 'Nome nativo',
        colCode: 'Código',
      },
      credits: {
        heading: 'Créditos',
        original: 'Mod original de',
        maintainer: 'Reescrito e mantido por',
        support: 'Relate problemas no fórum do Roll20 ou no GitHub.',
      },
    },
  };

  var localeRu = {
    titles: {
      ready: 'SyncPage готов.',
      group: 'Группа синхронизации: {name}',
      players: 'Игроки: {name}',
      settings: 'Настройки SyncPage',
      groupSettings: 'Настройки для {name}',
      status: 'Состояние SyncPage',
      recycle: 'Корзина: {name}',
      dryRun: 'Предпросмотр исправления: {name}',
      repaired: 'Исправлено: {name}',
      repairedOnStart: 'SyncPage исправил ваши группы',
      help: 'Команды SyncPage',
      deleted: 'Удалено на одной странице',
      leftovers: 'Объекты без пары',
      warning: 'SyncPage',
    },
    messages: {
      readyHint: 'Введите !syncpage, чтобы открыть меню.',
      migrated:
        'Ваша настройка SyncPage 0.1 перенесена. Групп: {groups}, сохранено связей: {links}, скрытых копий: {hidden}. Страницы, чьи имена оканчиваются на "_synced", теперь можно переименовать.',
      trueCopyGone:
        'Старой функции «True Copy» больше нет: используйте «Дублировать страницу» в Roll20, затем добавьте копию в группу.',
      groupCreated:
        'Группа «{name}» создана из страницы {page}. Объектов: {count}. Дублируйте страницу, затем добавьте копию кнопкой «Добавить страницу в группу».',
      pageAdded:
        'Страница {page} добавлена в «{name}». Связано: {paired}, скопировано: {copied}, не удалось скопировать: {failed}, без пары: {leftovers}.',
      pageRemoved: 'Страница {page} вышла из группы «{name}». Её объекты остаются, но без связей.',
      groupDeleted: 'Группа «{name}» удалена. Объекты остаются на своих страницах.',
      notConfirmed: 'Ничего не изменено (нет подтверждения).',
      hidden: 'Скрыто копий: {count}. Объектов без связи: {skipped}.',
      shown: 'Показано копий: {count}. Объектов без связи: {skipped}.',
      hideFallback:
        'Копий с изображением, которое API не может воссоздать: {count}. Они перенесены на слой Мастера, а не удалены.',
      deletedAsk:
        'Объект {name} удалён на странице {page}. Его копии на других страницах остались.',
      deletedEverywhere: 'Удалено других копий: {count}. «Отменить» вернёт их.',
      keptOthers: 'Остальные копии остаются.',
      restored: 'Восстановлено объектов: {count}. Не удалось восстановить: {failed}.',
      nothingToUndo: 'Отменять нечего.',
      recycleEmptied: 'Корзина очищена.',
      leftovers:
        'Объектов на странице {page} без пары в группе: {count}. Скопировать их на другие страницы или оставить только на этой?',
      andMore: '…и ещё {count}.',
      leftoversCopied: 'Скопировано объектов на другие страницы: {count}.',
      leftoversKept: 'Оставлено объектов только на своей странице: {count}.',
      imageNotCopied:
        'Объект {name} на странице {page} использует изображение, которое API не может скопировать (арт из магазина). Сделайте копии через «Дублировать страницу» в Roll20, затем добавьте копию в группу.',
      moved: 'Игрок {player} перемещён на {page}.',
      movedAll: 'Игроков перемещено на {page}: {count}. «Вернуть расстановку» вернёт их обратно.',
      layoutSaved: 'Расстановка запомнена. Игроков: {count}.',
      layoutRestored: 'Возвращено игроков: {count}.',
      layoutReset: 'Запомненная расстановка удалена.',
      unlinked: 'Отвязано объектов: {count}. Они остаются только на этой странице.',
      paused:
        'Зеркалирование для «{name}» приостановлено. Изменения остаются на той странице, где сделаны, пока вы его не возобновите.',
      resumed: 'Зеркалирование для «{name}» снова включено. Найдено различий: {count}.',
      settingsReset: 'Восстановлены настройки по умолчанию.',
      resetMoved: 'Чтобы вернуть настройки по умолчанию, используйте {command}.',
      handouts: 'Раздаточные материалы справки и панели команд пересозданы.',
      pruned: 'Наведён порядок. Пустых связей: {links}, отсутствующих страниц: {pages}.',
      startRepair:
        '{name}: смещено {drifted}, воссоздано {recreated}, удалено {removed}, скопировано новых объектов {mirrored}.',
    },
    errors: {
      hint: 'Введите {command} help, чтобы увидеть команды.',
      gmOnly: 'Пользоваться SyncPage может только Мастер.',
      unknownCommand: 'Неизвестная команда: {command}.',
      unknownSetting: 'Неизвестная настройка: {key}.',
      badValue: '«{value}» — недопустимое значение для {key}.',
      globalOnly: '{key} действует на все группы и не меняется для одной группы.',
      noGroup: 'Группа синхронизации для «{name}» не найдена.',
      groupExists: 'Группа «{name}» уже существует.',
      noName: 'Укажите имя.',
      pageInGroup: 'Страница {page} уже в группе «{group}».',
      pageNotInGroup: 'Страница {page} не входит в группу «{name}».',
      nothingSelected: 'Сначала выберите один или несколько объектов.',
      noPage: 'Страница «{page}» не найдена.',
      noPlayer: 'Игрок «{player}» не найден.',
      requestExpired: 'Срок действия кнопки истёк. Откройте карточку снова.',
      requestUnknown: 'Эта кнопка уже использована.',
    },
    menu: {
      thisPage: 'Эта страница',
      group: 'Группа',
      source: 'источник',
      copy: 'копия',
      paused: 'Пауза',
      notInGroup: 'Эта страница не входит в группу синхронизации.',
      duplicateHint:
        'Совет: создайте группу из страницы с картой, примените к ней «Дублировать страницу» в Roll20, перейдите на копию и добавьте её в группу. Так копии сохраняют арт из магазина.',
      selectedHint: '«Скрыть» и «Показать» действуют на выбранные объекты.',
      groups: 'Группы',
    },
    group: {
      pages: 'Страницы (★ = источник)',
      playersCount: 'Игроков: {count}',
      sourceHint: 'Страница-источник служит образцом для исправлений.',
      summary: 'Сводка',
      links: 'Связанные объекты',
      hidden: 'Скрытые копии',
      recycle: 'В корзине',
      overrides: 'Свои настройки',
      none: 'нет',
      lastRepair: 'Последнее исправление {when}: смещено {drifted}, воссоздано {recreated}.',
    },
    players: {
      none: 'В этой игре пока нет игроков.',
      elsewhere: 'не в этой группе',
      visibility: 'Выбранные объекты: нажмите, чтобы скрыть или показать на странице',
      selectHint:
        'Выберите токены и снова откройте эту карточку, чтобы скрывать или показывать их по страницам.',
      shown: 'виден',
      hidden: 'скрыт',
      layoutSaved: 'Запомнена расстановка. Игроков: {count}.',
      youAreOn: 'Вы на странице {page}.',
    },
    status: {
      notLinked: 'без связи',
      pageOnly: 'только на этой странице',
      missing: 'отсутствует',
    },
    recycle: {
      empty: 'Корзина пуста.',
      reasons: {
        delete: 'Удаление',
        repair: 'Исправление',
        exclude: 'Исключённый слой',
        group: 'Группа удалена',
      },
    },
    repair: {
      drifted: 'Сместившиеся копии',
      recreated: 'Воссозданные недостающие копии',
      removed: 'Удалённые копии (источник удалён)',
      dropped: 'Убранные пустые связи',
      mirrored: 'Скопированные новые объекты',
      leftovers: 'Новые объекты на копиях',
      pageSettings: 'Страницы с другими настройками',
      dryRunNote: 'Пока ничего не изменено.',
      doneNote: 'Готово. Удалённые объекты лежат в корзине.',
    },
    age: {
      now: 'только что',
      minutes: '{count} мин назад',
      hours: '{count} ч назад',
      days: '{count} дн. назад',
    },
    types: {
      graphic: 'Токен',
      text: 'Текст',
      path: 'Рисунок',
      pathv2: 'Рисунок',
      door: 'Дверь',
      window: 'Окно',
    },
    values: {
      on: 'Вкл',
      off: 'Выкл',
      none: 'Нет',
    },
    queries: {
      group: 'Группа',
      groupName: 'Имя группы',
      deleteGroup: 'Удалить группу {name}? Объекты останутся на своих страницах.',
      resetSettings: 'Вернуть настройки по умолчанию?',
      emptyRecycle: 'Очистить корзину? Это нельзя отменить.',
      yes: 'Да',
      no: 'Нет',
    },
    buttons: {
      menu: 'Меню',
      group: 'Группа',
      players: 'Игроки',
      repair: 'Исправить',
      repairNow: 'Исправить сейчас',
      dryRun: 'Предпросмотр',
      pause: 'Пауза',
      resume: 'Продолжить',
      status: 'Состояние',
      hideHere: 'Скрыть здесь',
      showHere: 'Показать здесь',
      hideOthers: 'Скрыть на других',
      showOthers: 'Показать на других',
      createGroup: 'Создать группу из страницы',
      addToGroup: 'Добавить страницу в группу',
      removePage: 'Убрать из группы',
      makeSource: 'Сделать источником',
      settings: 'Настройки',
      groupSettings: 'Настройки группы',
      recycle: 'Корзина',
      undo: 'Отменить',
      help: 'Справка',
      rename: 'Переименовать',
      deleteGroup: 'Удалить группу',
      everyoneTo: 'Все на {page}',
      saveLayout: 'Запомнить расстановку',
      restoreLayout: 'Вернуть расстановку',
      useGlobal: 'Общая настройка',
      reset: 'Сбросить настройки',
      restore: 'Восстановить',
      emptyRecycle: 'Очистить',
      deleteEverywhere: 'Удалить везде',
      keepOthers: 'Оставить остальные',
      copy: 'Копировать',
      keepHere: 'Оставить здесь',
      copyAll: 'Копировать все',
      keepAll: 'Оставить все здесь',
      unlink: 'Отвязать',
      rebuild: 'Пересоздать материалы',
    },
    settings: {
      deleteMode: 'При удалении объекта',
      hideMode: 'Как скрываются копии',
      pairLeftovers: 'Объекты без пары',
      newObjects: 'Новые объекты',
      localProps: 'Свои для страницы (токены)',
      localPageSettings: 'Свои для страницы (настройки страницы)',
      excludeLayers: 'Несинхронизируемые слои',
      syncPageSettings: 'Зеркалировать настройки страницы',
      repairOnStart: 'Исправлять при запуске',
      playerMenu: 'Кто может открыть карточку игроков',
      recycleSize: 'Размер корзины',
      language: 'Язык',
      groupHint:
        'Эти настройки действуют только на эту группу. «Общая настройка» возвращает основное значение.',
      override: 'эта группа',
      global: 'общая',
    },
    settingsHelp: {
      deleteMode:
        'Везде: удаление на любой странице удаляет все копии. Только источник: распространяются лишь удаления на странице-источнике. Отвязать: удаления не распространяются. Спросить: выбор приходит шёпотом.',
      hideMode:
        'Слой Мастера: копия переносится на слой Мастера. Удалить: копия удаляется и создаётся заново при показе, так что игрокам нечего найти.',
      pairLeftovers:
        'Когда страница входит в группу или исправляется: спросить, скопировать их на другие страницы или оставить на своей странице.',
      newObjects:
        'Зеркалировать: копируются объекты, созданные на любой странице. Только источник: копируются только объекты, созданные на странице-источнике.',
      localProps:
        'Свойства токенов, которые каждая страница хранит отдельно, например зрение для одного игрока.',
      localPageSettings:
        'Настройки, которые каждая страница хранит отдельно, например темнота для одной группы игроков.',
      excludeLayers: 'Объекты на этих слоях остаются на своей странице.',
      syncPageSettings:
        'Копировать настройки страницы (освещение, сетка, размер…) между страницами группы.',
      repairOnStart:
        'При запуске песочницы: тихо исправить, исправить с отчётом или ничего не делать.',
      playerMenu: 'Только Мастер или ещё и игроки, чтобы узнать, на какой они странице.',
      recycleSize: 'Сколько удалений каждая группа хранит для отмены.',
      language: 'Язык меню, сообщений и раздаточных материалов.',
    },
    options: {
      deleteMode: { all: 'Везде', source: 'Только источник', unlink: 'Отвязать', ask: 'Спросить' },
      hideMode: { gmlayer: 'Слой Мастера', remove: 'Удалить' },
      pairLeftovers: { ask: 'Спросить', copy: 'Копировать', leave: 'Оставить' },
      newObjects: { mirror: 'Зеркалировать', sourceOnly: 'Только источник' },
      localProps: {
        gmnotes: 'Заметки Мастера',
        name: 'Имя',
        bars: 'Полосы',
        markers: 'Маркеры',
        tint: 'Оттенок',
        aura: 'Ауры',
        vision: 'Зрение',
        light: 'Свет',
        controlledby: 'Кто управляет',
      },
      localPageSettings: {
        lighting: 'Освещение',
        daylight: 'Дневной свет',
        explorer: 'Режим исследователя',
        fog: 'Туман',
        grid: 'Сетка',
        background: 'Фон',
        scale: 'Размер и масштаб',
        jukebox: 'Музыка',
      },
      excludeLayers: {
        map: 'Карта',
        objects: 'Токены',
        gmlayer: 'Мастер',
        foreground: 'Передний план',
        walls: 'Стены',
      },
      repairOnStart: { quiet: 'Тихо', report: 'С отчётом', off: 'Выкл' },
      playerMenu: { gm: 'Только Мастер', players: 'И игроки' },
    },
    help: {
      menu: 'Открыть меню.',
      groupCreate: 'Создать группу синхронизации из этой страницы.',
      groupAdd:
        'Добавить эту страницу в группу: совпадающие объекты связываются, недостающие копируются.',
      groupRemove: 'Убрать эту страницу из её группы. Объекты остаются без связей.',
      groupShow: 'Показать карточку группы.',
      groupRename: 'Переименовать группу.',
      groupSource: 'Сделать эту страницу источником группы (образцом для исправлений).',
      groupDelete: 'Удалить группу (с подтверждением). Объекты остаются.',
      players:
        'Показать, кто на какой странице, с кнопками для перемещения и для скрытия или показа выбранных токенов по страницам.',
      move: 'Переместить одного игрока на страницу (разделение отряда).',
      moveAll: 'Переместить всех игроков группы на одну страницу и запомнить, где они были.',
      layout: 'Запомнить или вернуть, на какой странице каждый игрок.',
      hide: 'Скрыть копии выбранных объектов: здесь, на других страницах, везде или на указанных страницах.',
      show: 'Снова показать скрытые копии.',
      status: 'Показать связи выбранных объектов и где они скрыты.',
      unlink: 'Оставить выбранные объекты только на этой странице.',
      repair: 'Вернуть копии в соответствие со страницей-источником. --dry-run только сообщает.',
      pause: 'Временно остановить зеркалирование группы.',
      resume: 'Снова зеркалировать; показывает различия.',
      undo: 'Вернуть последнее удаление.',
      recycle: 'Список удалений; любое из них можно восстановить.',
      settings: 'Показать настройки: общие или для одной группы.',
      set: 'Изменить настройку. Списки принимают +name или -name.',
      settingsReset: 'Вернуть настройки по умолчанию (с подтверждением).',
      handouts: 'Пересоздать раздаточные материалы справки и панели команд.',
      help: 'Показать этот список.',
      ids: 'Действовать на эти объекты вместо выбранных.',
      page: 'Действовать на эту страницу вместо той, которую вы смотрите.',
      footer: 'Материал {help} объясняет всё; в {deck} есть кнопки.',
    },
    deck: {
      menuTitle: 'Меню',
      menuDesc: 'Главное меню, игроки и настройки.',
      groupsTitle: 'Группы',
      groupsDesc: 'Создайте группу из текущей страницы или добавьте эту страницу в группу.',
      selectedTitle: 'Выбранные объекты',
      selectedDesc: 'Скрыть или показать копии выбранных объектов.',
      toolsTitle: 'Инструменты',
      toolsDesc: 'Исправление, отмена, пауза и раздаточные материалы.',
      footer: 'Как работает SyncPage, читайте в {help}.',
    },
    handout: {
      versionLabel: 'Версия',
      subtitle: 'Связанные страницы для разделённого отряда',
      footer: 'Кнопки находятся в {deck}.',
      overview: {
        heading: 'Обзор',
        body: 'SyncPage держит страницы в согласии. Страницы одной группы синхронизации делят токены, рисунки, стены, двери, окна, текст и настройки страницы: что меняется на одной странице, меняется и на других. С разделением отряда в Roll20 вы ставите игроков на разные копии, а затем скрываете или показываете что-то на каждой копии отдельно, и каждый игрок видит только то, что должен видеть его персонаж.',
        why: 'Roll20 не умеет скрыть объект на одной странице только от части игроков. Динамическое освещение даёт каждому токену своё зрение, но не «этот NPC невидим только для плута». Зеркальные страницы это умеют.',
      },
      quickStart: {
        heading: 'Быстрый старт',
        steps: [
          'Перейдите на страницу с картой, введите !syncpage и нажмите «Создать группу из страницы».',
          'Примените к этой странице «Дублировать страницу» в Roll20 (меню карточки страницы). Так копируется арт из магазина, чего API не умеет.',
          'Перейдите на копию и нажмите «Добавить страницу в группу». SyncPage свяжет совпадающие объекты и скопирует недостающие.',
          'Откройте «Игроки», чтобы переместить игроков на копию, затем выберите токены и скройте их на одной странице.',
        ],
      },
      mirroring: {
        heading: 'Что зеркалируется',
        points: [
          'Токены (включая источники света Jumpgate), текст, рисунки Legacy и Jumpgate, стены всех видов, двери и окна.',
          'Новые объекты, изменения и удаления, в обе стороны. Удаления следуют настройке «При удалении объекта».',
          'Настройки страницы, например освещение, сетка и размер, если они не отключены и не хранятся для каждой страницы отдельно.',
          'Слои можно исключить для группы, а свойства токенов, например зрение, хранить для каждой страницы отдельно.',
          'Изменения, которые другие моды делают через TokenMod, тоже зеркалируются. Другие моды могут вызывать SyncPage.notify; остальное поймает исправление.',
        ],
      },
      visibility: {
        heading: 'Скрытие по страницам',
        points: [
          'Выберите токены и используйте «Скрыть здесь», «Скрыть на других» или сетку на карточке «Игроки».',
          'Скрывается только копия на этой странице. Изменения с других страниц никогда не отменяют скрытие.',
          'Режим «Слой Мастера» переносит копию на слой Мастера. Режим «Удалить» удаляет её и создаёт заново при показе, так что игрокам нечего найти на странице.',
        ],
      },
      players: {
        heading: 'Игроки',
        points: [
          'Карточка «Игроки» показывает каждого игрока и его страницу, а также кнопку для каждой страницы, чтобы переместить игрока (разделение отряда).',
          '«Все на» собирает игроков на одной странице и запоминает, где они были; «Вернуть расстановку» возвращает их обратно.',
        ],
      },
      repair: {
        heading: 'Исправление',
        points: [
          'Исправление возвращает копии в соответствие со страницей-источником: сместившиеся свойства, недостающие копии, объекты, удалённые или созданные, пока SyncPage не следил.',
          '«Предпросмотр» показывает, что изменится, ничего не меняя. Если исправление затронет много объектов, сначала будет вопрос.',
          'Исправление тихо выполняется при запуске песочницы (настройка). ID объектов не меняются, в отличие от 0.1.',
        ],
      },
      memory: {
        heading: 'Что запоминает SyncPage',
        points: [
          'Корзину для каждой группы: любое распространённое удаление и любую чистку можно вернуть кнопкой «Отменить».',
          'Где был каждый игрок, чтобы разделение можно было восстановить.',
          'Последнюю использованную группу, последнее исправление и его итоги.',
          'Кнопки, которым нужны данные, несут короткий код; они срабатывают один раз и истекают через 10 минут.',
        ],
      },
      commands: {
        heading: 'Команды',
        intro: 'Только для Мастера. Работает и !sync.',
        colCommand: 'Команда',
        colDesc: 'Что делает',
      },
      settings: {
        heading: 'Настройки',
        intro:
          'Меняйте настройки на карточке настроек или командой !syncpage set. Настройки группы можно изменить для одной группы на её карточке.',
        colKey: 'Ключ',
        colName: 'Настройка',
        colDesc: 'Значение',
        colScope: 'Область',
        scopeGroup: 'Для группы',
        scopeGlobal: 'Общая',
      },
      api: {
        heading: 'Для других модов',
        intro: 'Глобальный объект SyncPage:',
        colFunction: 'Функция',
        colDesc: 'Что делает',
        rows: {
          getGroup: 'Группа, в которой страница: id, имя, источник и страницы.',
          getLinked: 'Связанные копии объекта по страницам.',
          notify:
            'Зеркалировать изменение, сделанное вашим модом (изменения через API не вызывают событий).',
          isHidden: 'Скрыта ли копия объекта на странице.',
          onSync: 'Получать уведомление о каждом зеркальном создании, изменении и удалении.',
          repair: 'Исправить группу; { dryRun: true } только подсчитывает.',
        },
      },
      upgrading: {
        heading: 'Переход с 0.1',
        points: [
          'Страница, чьё имя оканчивается на "_synced", входит в группу со страницей с тем же именем без этого окончания, и та становится источником. Потом страницы можно переименовать.',
          'Старые связи сохраняются; всё остальное связывается по положению и изображению.',
          'Флаги Show/Hide в заметках Мастера становятся скрытыми копиями, а текст флага удаляется из заметок Мастера.',
          'Своя команда из старой конфигурации по-прежнему работает. «True Copy» больше нет: используйте «Дублировать страницу».',
        ],
      },
      troubleshooting: {
        heading: 'Решение проблем',
        points: [
          'Токен скопирован с неверным изображением: API не может копировать арт из магазина. Сделайте копию через «Дублировать страницу» и добавьте её в группу.',
          'Копии разошлись после изменений другого мода: запустите исправление или попросите автора этого мода вызывать SyncPage.notify.',
          'Хотите намеренно переставить что-то на одной копии? Поставьте группу на паузу, внесите изменения, затем нажмите «Продолжить» и откажитесь от исправления.',
        ],
      },
      languages: {
        heading: 'Языки',
        body: 'Язык задаётся на карточке настроек. Меню, сообщения и эти материалы следуют ему.',
        colLanguage: 'Язык',
        colNative: 'Родное название',
        colCode: 'Код',
      },
      credits: {
        heading: 'Авторы',
        original: 'Автор оригинального мода:',
        maintainer: 'Переписал и сопровождает:',
        support: 'Сообщайте о проблемах на форуме Roll20 или на GitHub.',
      },
    },
  };

  var localeEs = {
    titles: {
      ready: 'SyncPage está listo.',
      group: 'Grupo de sincronización: {name}',
      players: 'Jugadores: {name}',
      settings: 'Ajustes de SyncPage',
      groupSettings: 'Ajustes de {name}',
      status: 'Estado de SyncPage',
      recycle: 'Papelera: {name}',
      dryRun: 'Vista previa de la reparación: {name}',
      repaired: 'Reparado: {name}',
      repairedOnStart: 'SyncPage ha reparado tus grupos',
      help: 'Comandos de SyncPage',
      deleted: 'Eliminado en una página',
      leftovers: 'Objetos sin pareja',
      warning: 'SyncPage',
    },
    messages: {
      readyHint: 'Escribe !syncpage para abrir el menú.',
      migrated:
        'Se ha conservado tu configuración de SyncPage 0.1: {groups} grupo(s), {links} vínculo(s) mantenido(s), {hidden} copia(s) oculta(s). Ya puedes cambiar el nombre de las páginas que terminan en «_synced».',
      trueCopyGone:
        'La antigua función «True Copy» ya no existe: usa Duplicar página de Roll20 y luego añade la copia a un grupo.',
      groupCreated:
        'Grupo «{name}» creado a partir de {page}, con {count} objeto(s). Duplica la página y luego añade la copia con «Añadir esta página a un grupo».',
      pageAdded:
        '{page} se ha unido a «{name}»: {paired} emparejado(s), {copied} copiado(s), {failed} no se pudieron copiar, {leftovers} sin pareja.',
      pageRemoved: '{page} ha salido de «{name}». Sus objetos se quedan, desvinculados.',
      groupDeleted: 'Grupo «{name}» eliminado. Los objetos se quedan en sus páginas.',
      notConfirmed: 'No se ha cambiado nada (sin confirmar).',
      hidden: '{count} copia(s) oculta(s). {skipped} objeto(s) no están vinculados.',
      shown: '{count} copia(s) mostrada(s). {skipped} objeto(s) no están vinculados.',
      hideFallback:
        '{count} copia(s) usan una imagen que la API no puede volver a crear, así que se han movido a la capa del DJ en lugar de eliminarse.',
      deletedAsk: '{name} se ha eliminado en {page}. Sus copias en las otras páginas siguen ahí.',
      deletedEverywhere: 'Se han eliminado {count} copia(s) más. Deshacer las recupera.',
      keptOthers: 'Las otras copias se quedan.',
      restored: 'Se han restaurado {count} objeto(s). {failed} no se pudieron restaurar.',
      nothingToUndo: 'No hay nada que deshacer.',
      recycleEmptied: 'La papelera está vacía.',
      leftovers:
        '{count} objeto(s) de {page} no coinciden con nada del grupo. ¿Copiarlos a las otras páginas o dejarlos solo en esta página?',
      andMore: '…y {count} más.',
      leftoversCopied: 'Se han copiado {count} objeto(s) a las otras páginas.',
      leftoversKept: 'Se han dejado {count} objeto(s) solo en su página.',
      imageNotCopied:
        '{name} en {page} usa una imagen que la API no puede copiar (arte del Marketplace). Usa Duplicar página de Roll20 para hacer copias con ella y luego añade la copia al grupo.',
      moved: '{player} se ha movido a {page}.',
      movedAll: '{count} jugador(es) movido(s) a {page}. «Restaurar distribución» los devuelve.',
      layoutSaved: 'Se ha recordado dónde están {count} jugador(es).',
      layoutRestored: 'Se han devuelto {count} jugador(es).',
      layoutReset: 'Se ha borrado la distribución recordada.',
      unlinked: '{count} objeto(s) desvinculado(s). Se quedan solo en esta página.',
      paused:
        'La réplica de «{name}» está en pausa. Los cambios se quedan en la página donde se hacen hasta que la reanudes.',
      resumed:
        'La réplica de «{name}» vuelve a estar activa. Se han encontrado {count} diferencia(s).',
      settingsReset: 'Se han restablecido los ajustes predeterminados.',
      resetMoved: 'Usa {command} para restablecer los ajustes predeterminados.',
      handouts: 'Se han reconstruido los folletos de ayuda y de comandos.',
      pruned: 'Limpieza hecha: {links} vínculo(s) vacío(s), {pages} página(s) que faltaban.',
      startRepair:
        '{name}: {drifted} desajustado(s), {recreated} recreado(s), {removed} eliminado(s), {mirrored} objeto(s) nuevo(s) copiado(s).',
    },
    errors: {
      hint: 'Escribe {command} help para ver los comandos.',
      gmOnly: 'Solo el DJ puede usar SyncPage.',
      unknownCommand: 'Comando desconocido: {command}.',
      unknownSetting: 'Ajuste desconocido: {key}.',
      badValue: '«{value}» no es un valor válido para {key}.',
      globalOnly: '{key} se aplica a todos los grupos y no se puede cambiar para uno solo.',
      noGroup: 'No se ha encontrado ningún grupo de sincronización para «{name}».',
      groupExists: 'Ya hay un grupo llamado «{name}».',
      noName: 'Indica un nombre.',
      pageInGroup: '{page} ya está en el grupo «{group}».',
      pageNotInGroup: '{page} no está en el grupo «{name}».',
      nothingSelected: 'Primero selecciona uno o más objetos.',
      noPage: 'No se ha encontrado ninguna página para «{page}».',
      noPlayer: 'No se ha encontrado ningún jugador para «{player}».',
      requestExpired: 'Ese botón ha caducado. Vuelve a abrir la tarjeta.',
      requestUnknown: 'Ese botón ya se ha usado.',
    },
    menu: {
      thisPage: 'Esta página',
      group: 'Grupo',
      source: 'origen',
      copy: 'copia',
      paused: 'En pausa',
      notInGroup: 'Esta página no está en ningún grupo de sincronización.',
      duplicateHint:
        'Consejo: crea un grupo con la página de tu mapa, usa Duplicar página de Roll20 en ella, ve a la copia y añádela al grupo. Así las copias conservan el arte del Marketplace.',
      selectedHint: 'Ocultar y Mostrar actúan sobre los objetos seleccionados.',
      groups: 'Grupos',
    },
    group: {
      pages: 'Páginas (★ = origen)',
      playersCount: '{count} jugador(es)',
      sourceHint: 'La página de origen es la referencia para las reparaciones.',
      summary: 'Resumen',
      links: 'Objetos vinculados',
      hidden: 'Copias ocultas',
      recycle: 'En la papelera',
      overrides: 'Ajustes propios',
      none: 'ninguno',
      lastRepair: 'Última reparación {when}: {drifted} desajustado(s), {recreated} recreado(s).',
    },
    players: {
      none: 'Todavía no hay jugadores en esta partida.',
      elsewhere: 'fuera de este grupo',
      visibility: 'Objetos seleccionados: haz clic para ocultar o mostrar en una página',
      selectHint:
        'Selecciona fichas y vuelve a abrir esta tarjeta para ocultarlas o mostrarlas página a página.',
      shown: 'visible',
      hidden: 'oculto',
      layoutSaved: 'Hay una distribución de {count} jugador(es) recordada.',
      youAreOn: 'Estás en {page}.',
    },
    status: {
      notLinked: 'sin vincular',
      pageOnly: 'solo en esta página',
      missing: 'falta',
    },
    recycle: {
      empty: 'La papelera está vacía.',
      reasons: {
        delete: 'Eliminado',
        repair: 'Reparación',
        exclude: 'Capa excluida',
        group: 'Grupo eliminado',
      },
    },
    repair: {
      drifted: 'Copias desajustadas',
      recreated: 'Copias que faltaban recreadas',
      removed: 'Copias eliminadas (origen eliminado)',
      dropped: 'Vínculos vacíos quitados',
      mirrored: 'Objetos nuevos copiados',
      leftovers: 'Objetos nuevos en las copias',
      pageSettings: 'Páginas con otros ajustes',
      dryRunNote: 'Todavía no se ha cambiado nada.',
      doneNote: 'Hecho. Los objetos eliminados están en la papelera.',
    },
    age: {
      now: 'ahora mismo',
      minutes: 'hace {count} min',
      hours: 'hace {count} h',
      days: 'hace {count} días',
    },
    types: {
      graphic: 'Ficha',
      text: 'Texto',
      path: 'Dibujo',
      pathv2: 'Dibujo',
      door: 'Puerta',
      window: 'Ventana',
    },
    values: {
      on: 'Sí',
      off: 'No',
      none: 'Ninguno',
    },
    queries: {
      group: 'Grupo',
      groupName: 'Nombre del grupo',
      deleteGroup: '¿Eliminar el grupo {name}? Los objetos se quedan en sus páginas.',
      resetSettings: '¿Restablecer los ajustes predeterminados?',
      emptyRecycle: '¿Vaciar la papelera? No se puede deshacer.',
      yes: 'Sí',
      no: 'No',
    },
    buttons: {
      menu: 'Menú',
      group: 'Grupo',
      players: 'Jugadores',
      repair: 'Reparar',
      repairNow: 'Reparar ya',
      dryRun: 'Previsualizar',
      pause: 'Pausar',
      resume: 'Reanudar',
      status: 'Estado',
      hideHere: 'Ocultar aquí',
      showHere: 'Mostrar aquí',
      hideOthers: 'Ocultar en las demás',
      showOthers: 'Mostrar en las demás',
      createGroup: 'Crear grupo con esta página',
      addToGroup: 'Añadir esta página a un grupo',
      removePage: 'Quitar del grupo',
      makeSource: 'Hacer origen',
      settings: 'Ajustes',
      groupSettings: 'Ajustes del grupo',
      recycle: 'Papelera',
      undo: 'Deshacer',
      help: 'Ayuda',
      rename: 'Renombrar',
      deleteGroup: 'Eliminar grupo',
      everyoneTo: 'Todos a {page}',
      saveLayout: 'Guardar distribución',
      restoreLayout: 'Restaurar distribución',
      useGlobal: 'Usar global',
      reset: 'Restablecer',
      restore: 'Restaurar',
      emptyRecycle: 'Vaciar',
      deleteEverywhere: 'Eliminar en todas',
      keepOthers: 'Conservar las demás',
      copy: 'Copiar',
      keepHere: 'Dejar aquí',
      copyAll: 'Copiar todo',
      keepAll: 'Dejar todo aquí',
      unlink: 'Desvincular',
      rebuild: 'Reconstruir folletos',
    },
    settings: {
      deleteMode: 'Al eliminar un objeto',
      hideMode: 'Cómo se ocultan las copias',
      pairLeftovers: 'Objetos sin pareja',
      newObjects: 'Objetos nuevos',
      localProps: 'Propio de cada página (fichas)',
      localPageSettings: 'Propio de cada página (ajustes de página)',
      excludeLayers: 'Capas sin sincronizar',
      syncPageSettings: 'Replicar ajustes de página',
      repairOnStart: 'Reparar al iniciar',
      playerMenu: 'Quién puede abrir la tarjeta de jugadores',
      recycleSize: 'Tamaño de la papelera',
      language: 'Idioma',
      groupHint:
        'Estos ajustes solo se aplican a este grupo. «Usar global» vuelve al ajuste general.',
      override: 'este grupo',
      global: 'global',
    },
    settingsHelp: {
      deleteMode:
        'En todas: eliminar en cualquier página elimina todas las copias. Solo página de origen: solo se extienden las eliminaciones en la página de origen. Desvincular: nunca se extienden. Preguntar: susurra una elección.',
      hideMode:
        'Capa del DJ: la copia pasa a la capa del DJ. Quitar: la copia se elimina y se vuelve a crear al mostrarla, así que no queda nada que los jugadores puedan encontrar.',
      pairLeftovers:
        'Cuando una página se une a un grupo o se repara: preguntar, copiarlos a las otras páginas o dejarlos en su página.',
      newObjects:
        'Replicar: se copian los objetos creados en cualquier página. Solo origen: solo se copian los objetos creados en la página de origen.',
      localProps:
        'Propiedades de ficha que cada página conserva para sí, como la visión para un jugador.',
      localPageSettings:
        'Ajustes de página que cada página conserva para sí, como la oscuridad para un grupo de jugadores.',
      excludeLayers: 'Los objetos de estas capas se quedan en su propia página.',
      syncPageSettings:
        'Copia los ajustes de página (iluminación, cuadrícula, tamaño…) entre las páginas del grupo.',
      repairOnStart:
        'Cuando se inicia el sandbox: reparar en silencio, reparar e informar, o no hacer nada.',
      playerMenu: 'Solo el DJ, o también los jugadores pueden preguntar en qué página están.',
      recycleSize: 'Cuántas eliminaciones guarda cada grupo para Deshacer.',
      language: 'Idioma de los menús, mensajes y folletos.',
    },
    options: {
      deleteMode: {
        all: 'En todas',
        source: 'Solo página de origen',
        unlink: 'Desvincular',
        ask: 'Preguntar',
      },
      hideMode: { gmlayer: 'Capa del DJ', remove: 'Quitar' },
      pairLeftovers: { ask: 'Preguntar', copy: 'Copiar', leave: 'Dejar' },
      newObjects: { mirror: 'Replicar', sourceOnly: 'Solo origen' },
      localProps: {
        gmnotes: 'Notas del DJ',
        name: 'Nombre',
        bars: 'Barras',
        markers: 'Marcadores',
        tint: 'Tinte',
        aura: 'Auras',
        vision: 'Visión',
        light: 'Luz',
        controlledby: 'Controlado por',
      },
      localPageSettings: {
        lighting: 'Iluminación',
        daylight: 'Luz diurna',
        explorer: 'Modo explorador',
        fog: 'Niebla',
        grid: 'Cuadrícula',
        background: 'Fondo',
        scale: 'Tamaño y escala',
        jukebox: 'Jukebox',
      },
      excludeLayers: {
        map: 'Mapa',
        objects: 'Fichas',
        gmlayer: 'DJ',
        foreground: 'Primer plano',
        walls: 'Muros',
      },
      repairOnStart: { quiet: 'En silencio', report: 'E informar', off: 'No' },
      playerMenu: { gm: 'Solo el DJ', players: 'También jugadores' },
    },
    help: {
      menu: 'Abre el menú.',
      groupCreate: 'Crea un grupo de sincronización con esta página.',
      groupAdd:
        'Añade esta página a un grupo: los objetos que coinciden se emparejan y los que faltan se copian.',
      groupRemove: 'Saca esta página de su grupo. Los objetos se quedan, desvinculados.',
      groupShow: 'Muestra la tarjeta de un grupo.',
      groupRename: 'Cambia el nombre de un grupo.',
      groupSource:
        'Convierte esta página en el origen del grupo (la referencia para las reparaciones).',
      groupDelete: 'Elimina un grupo (pregunta antes). Los objetos se quedan.',
      players:
        'Muestra quién está en cada página, con botones para moverlos y para ocultar o mostrar las fichas seleccionadas por página.',
      move: 'Mueve a un jugador a una página (dividir el grupo).',
      moveAll: 'Mueve a todos los jugadores del grupo a una página y recuerda dónde estaban.',
      layout: 'Recuerda o restaura en qué página está cada jugador.',
      hide: 'Oculta las copias de los objetos seleccionados: aquí, en las otras páginas, en todas o en las páginas indicadas.',
      show: 'Vuelve a mostrar las copias ocultas.',
      status: 'Muestra los vínculos de los objetos seleccionados y dónde están ocultos.',
      unlink: 'Deja los objetos seleccionados solo en esta página.',
      repair: 'Vuelve a poner las copias al día con la página de origen. --dry-run solo informa.',
      pause: 'Detiene la réplica de un grupo durante un rato.',
      resume: 'Vuelve a replicar; muestra las diferencias.',
      undo: 'Recupera la última eliminación.',
      recycle: 'Lista las eliminaciones y restaura cualquiera de ellas.',
      settings: 'Muestra los ajustes, globales o de un grupo.',
      set: 'Cambia un ajuste. Las listas admiten +name o -name.',
      settingsReset: 'Restablece los ajustes predeterminados (pregunta antes).',
      handouts: 'Reconstruye los folletos de ayuda y de comandos.',
      help: 'Muestra esta lista.',
      ids: 'Actúa sobre estos objetos en lugar de los seleccionados.',
      page: 'Actúa sobre esta página en lugar de la que estás viendo.',
      footer: 'El folleto {help} lo explica todo; {deck} tiene botones.',
    },
    deck: {
      menuTitle: 'Menú',
      menuDesc: 'El menú principal, los jugadores y los ajustes.',
      groupsTitle: 'Grupos',
      groupsDesc: 'Crea un grupo con la página en la que estás o añade esta página a un grupo.',
      selectedTitle: 'Objetos seleccionados',
      selectedDesc: 'Oculta o muestra las copias de los objetos seleccionados.',
      toolsTitle: 'Herramientas',
      toolsDesc: 'Reparar, deshacer, pausar y folletos.',
      footer: 'Consulta {help} para saber cómo funciona SyncPage.',
    },
    handout: {
      versionLabel: 'Versión',
      subtitle: 'Páginas vinculadas para grupos divididos',
      footer: 'Abre {deck} para ver los botones.',
      overview: {
        heading: 'Descripción general',
        body: 'SyncPage mantiene las páginas al día entre sí. Las páginas de un grupo de sincronización comparten sus fichas, dibujos, muros, puertas, ventanas, textos y ajustes de página: lo que cambia en una página cambia en las demás. Con la función de dividir el grupo de Roll20 pones a los jugadores en copias distintas y luego ocultas o muestras cosas en cada copia, para que cada jugador vea solo lo que debe ver su personaje.',
        why: 'Roll20 no puede ocultar un objeto solo a algunos jugadores en una misma página. La iluminación dinámica da a cada ficha su propia visión, pero no permite «este PNJ es invisible solo para el pícaro». Las páginas replicadas sí lo permiten.',
      },
      quickStart: {
        heading: 'Inicio rápido',
        steps: [
          'Ve a la página de tu mapa y escribe !syncpage; luego haz clic en «Crear grupo con esta página».',
          'Usa Duplicar página de Roll20 en esa página (el menú de la tarjeta de la página). Copia el arte del Marketplace, algo que la API no puede hacer.',
          'Ve a la copia y haz clic en «Añadir esta página a un grupo». SyncPage empareja los objetos que coinciden y copia lo que falte.',
          'Abre Jugadores para mover a los jugadores a la copia; luego selecciona fichas y ocúltalas en una página.',
        ],
      },
      mirroring: {
        heading: 'Qué se replica',
        points: [
          'Fichas (incluidas las luces de Jumpgate), textos, dibujos Legacy y de Jumpgate, muros de todo tipo, puertas y ventanas.',
          'Objetos nuevos, cambios y eliminaciones, en ambos sentidos. Las eliminaciones siguen el ajuste «Al eliminar un objeto».',
          'Ajustes de página como la iluminación, la cuadrícula y el tamaño, salvo que se desactiven o se mantengan por página.',
          'Se pueden excluir capas por grupo, y propiedades de ficha como la visión se pueden mantener por página.',
          'También se replican los cambios que otros Mods hacen mediante TokenMod. Otros Mods pueden llamar a SyncPage.notify; la reparación se encarga del resto.',
        ],
      },
      visibility: {
        heading: 'Ocultar por página',
        points: [
          'Selecciona fichas y usa Ocultar aquí, Ocultar en las demás o la cuadrícula de la tarjeta de Jugadores.',
          'Solo se oculta la copia de esa página. Los cambios de otras páginas nunca deshacen la ocultación.',
          'El modo Capa del DJ mueve la copia a la capa del DJ. El modo Quitar la elimina y la vuelve a crear al mostrarla, así que no queda nada en la página que los jugadores puedan encontrar.',
        ],
      },
      players: {
        heading: 'Jugadores',
        points: [
          'La tarjeta de Jugadores muestra cada jugador y la página en la que está, con un botón por página para moverlo (dividir el grupo).',
          '«Todos a» reúne a los jugadores en una página y recuerda dónde estaban; «Restaurar distribución» los devuelve.',
        ],
      },
      repair: {
        heading: 'Reparación',
        points: [
          'La reparación vuelve a poner las copias al día con la página de origen: propiedades desajustadas, copias que faltan y objetos eliminados o creados mientras SyncPage no estaba atento.',
          'Previsualizar muestra lo que cambiaría sin cambiar nada. Una reparación que cambiaría muchos objetos pregunta antes.',
          'La reparación se ejecuta en silencio al iniciarse el sandbox (ajuste). Los ID de los objetos no cambian, a diferencia de la 0.1.',
        ],
      },
      memory: {
        heading: 'Qué recuerda SyncPage',
        points: [
          'Una papelera por grupo: cada eliminación extendida y cada limpieza se puede recuperar con Deshacer.',
          'Dónde estaba cada jugador, para poder restaurar una división.',
          'El último grupo que usaste, la última reparación y sus resultados.',
          'Los botones que necesitan datos llevan un código corto; funcionan una vez y caducan a los 10 minutos.',
        ],
      },
      commands: {
        heading: 'Comandos',
        intro: 'Solo para el DJ. !sync también funciona.',
        colCommand: 'Comando',
        colDesc: 'Qué hace',
      },
      settings: {
        heading: 'Ajustes',
        intro:
          'Cambia los ajustes en la tarjeta de ajustes o con !syncpage set. Los ajustes de grupo se pueden cambiar para un solo grupo en su tarjeta.',
        colKey: 'Clave',
        colName: 'Ajuste',
        colDesc: 'Significado',
        colScope: 'Ámbito',
        scopeGroup: 'Por grupo',
        scopeGlobal: 'Global',
      },
      api: {
        heading: 'Para otros Mods',
        intro: 'El objeto global SyncPage:',
        colFunction: 'Función',
        colDesc: 'Qué hace',
        rows: {
          getGroup: 'El grupo en el que está una página: id, nombre, origen y páginas.',
          getLinked: 'Las copias vinculadas de un objeto, por página.',
          notify: 'Replica un cambio hecho por tu Mod (los cambios de la API no generan eventos).',
          isHidden: 'Si la copia de un objeto está oculta en una página.',
          onSync: 'Recibe aviso de cada creación, cambio y eliminación replicados.',
          repair: 'Repara un grupo; { dryRun: true } solo cuenta.',
        },
      },
      upgrading: {
        heading: 'Actualizar desde la 0.1',
        points: [
          'Una página cuyo nombre termina en «_synced» se une a un grupo con la página del mismo nombre sin ese sufijo, que pasa a ser el origen. Después puedes cambiar el nombre de las páginas.',
          'Los vínculos antiguos se conservan; todo lo demás se empareja por posición e imagen.',
          'Las marcas Show/Hide de las Notas del DJ pasan a ser copias ocultas, y el texto de la marca se quita de las Notas del DJ.',
          'Un comando personalizado de la configuración antigua sigue funcionando. «True Copy» ya no existe: usa Duplicar página.',
        ],
      },
      troubleshooting: {
        heading: 'Solución de problemas',
        points: [
          'Una ficha copiada con la imagen equivocada: la API no puede copiar el arte del Marketplace. Haz la copia con Duplicar página y añádela al grupo.',
          'Copias desajustadas después de que otro Mod cambiara cosas: ejecuta Reparar o pide al autor de ese Mod que llame a SyncPage.notify.',
          '¿Quieres reorganizar una copia a propósito? Pausa el grupo, haz los cambios y luego reanúdalo y elige no reparar.',
        ],
      },
      languages: {
        heading: 'Idiomas',
        body: 'Elige el idioma en la tarjeta de ajustes. Los menús, los mensajes y estos folletos lo siguen.',
        colLanguage: 'Idioma',
        colNative: 'Nombre nativo',
        colCode: 'Código',
      },
      credits: {
        heading: 'Créditos',
        original: 'Mod original de',
        maintainer: 'Reescrito y mantenido por',
        support: 'Informa de los problemas en el foro de Roll20 o en GitHub.',
      },
    },
  };

  var localeSv = {
    titles: {
      ready: 'SyncPage är redo.',
      group: 'Synkgrupp: {name}',
      players: 'Spelare: {name}',
      settings: 'SyncPage-inställningar',
      groupSettings: 'Inställningar för {name}',
      status: 'SyncPage-status',
      recycle: 'Papperskorg: {name}',
      dryRun: 'Förhandsvisning av reparation: {name}',
      repaired: 'Reparerad: {name}',
      repairedOnStart: 'SyncPage reparerade dina grupper',
      help: 'SyncPage-kommandon',
      deleted: 'Raderat på en sida',
      leftovers: 'Objekt utan motsvarighet',
      warning: 'SyncPage',
    },
    messages: {
      readyHint: 'Skriv !syncpage för att öppna menyn.',
      migrated:
        'Din SyncPage 0.1-uppsättning fördes över: {groups} grupp(er), {links} länk(ar) behölls, {hidden} dold(a) kopia(or). Sidor vars namn slutar på "_synced" kan nu döpas om.',
      trueCopyGone:
        'Den gamla funktionen "True Copy" finns inte längre: använd Roll20:s egen Duplicera sida och lägg sedan till kopian i en grupp.',
      groupCreated:
        'Gruppen "{name}" skapades från {page}, med {count} objekt. Duplicera sidan och lägg sedan till kopian med "Lägg till sidan i en grupp".',
      pageAdded:
        '{page} gick med i "{name}": {paired} parade, {copied} kopierade, {failed} kunde inte kopieras, {leftovers} utan motsvarighet.',
      pageRemoved: '{page} lämnade "{name}". Dess objekt finns kvar, utan länk.',
      groupDeleted: 'Gruppen "{name}" raderades. Objekten finns kvar på sina sidor.',
      notConfirmed: 'Inget ändrades (inte bekräftat).',
      hidden: 'Dolde {count} kopia(or). {skipped} objekt är inte länkade.',
      shown: 'Visade {count} kopia(or). {skipped} objekt är inte länkade.',
      hideFallback:
        '{count} kopia(or) använder en bild som API:et inte kan återskapa, så de flyttades till SL-lagret i stället för att tas bort.',
      deletedAsk: '{name} raderades på {page}. Dess kopior på de andra sidorna finns kvar.',
      deletedEverywhere: 'Raderade {count} andra kopia(or). Ångra lägger tillbaka dem.',
      keptOthers: 'De andra kopiorna finns kvar.',
      restored: 'Återställde {count} objekt. {failed} kunde inte återställas.',
      nothingToUndo: 'Det finns inget att ångra.',
      recycleEmptied: 'Papperskorgen är tom.',
      leftovers:
        '{count} objekt på {page} motsvarar inget i gruppen. Kopiera dem till de andra sidorna, eller behålla dem bara på den här sidan?',
      andMore: '…och {count} till.',
      leftoversCopied: 'Kopierade {count} objekt till de andra sidorna.',
      leftoversKept: 'Behöll {count} objekt bara på sin sida.',
      imageNotCopied:
        '{name} på {page} använder en bild som API:et inte kan kopiera (bild från marknadsplatsen). Använd Roll20:s Duplicera sida för att göra kopior med den och lägg sedan till kopian i gruppen.',
      moved: '{player} flyttades till {page}.',
      movedAll:
        '{count} spelare flyttades till {page}. "Återställ fördelning" flyttar tillbaka dem.',
      layoutSaved: 'Sparade var {count} spelare är.',
      layoutRestored: 'Flyttade tillbaka {count} spelare.',
      layoutReset: 'Den sparade fördelningen rensades.',
      unlinked: '{count} objekt avlänkades. De finns bara kvar på den här sidan.',
      paused:
        'Speglingen för "{name}" är pausad. Ändringar stannar på sidan där de görs tills du fortsätter.',
      resumed: 'Speglingen för "{name}" är på igen. {count} skillnad(er) hittades.',
      settingsReset: 'Inställningarna har återställts till standard.',
      resetMoved: 'Använd {command} för att återställa standardinställningarna.',
      handouts: 'Handouterna Hjälp och Kommandopanel byggdes om.',
      pruned: 'Städat: {links} tomma länk(ar), {pages} saknade sida(or).',
      startRepair:
        '{name}: {drifted} avvikande, {recreated} återskapade, {removed} borttagna, {mirrored} nya objekt kopierade.',
    },
    errors: {
      hint: 'Skriv {command} help för kommandona.',
      gmOnly: 'Bara SL kan använda SyncPage.',
      unknownCommand: 'Okänt kommando: {command}.',
      unknownSetting: 'Okänd inställning: {key}.',
      badValue: '"{value}" är inte ett giltigt värde för {key}.',
      globalOnly: '{key} gäller alla grupper och kan inte ändras för en enda.',
      noGroup: 'Ingen synkgrupp hittades för "{name}".',
      groupExists: 'Det finns redan en grupp som heter "{name}".',
      noName: 'Ange ett namn.',
      pageInGroup: '{page} finns redan i gruppen "{group}".',
      pageNotInGroup: '{page} finns inte i gruppen "{name}".',
      nothingSelected: 'Markera ett eller flera objekt först.',
      noPage: 'Ingen sida hittades för "{page}".',
      noPlayer: 'Ingen spelare hittades för "{player}".',
      requestExpired: 'Den knappen har gått ut. Öppna kortet igen.',
      requestUnknown: 'Den knappen har redan använts.',
    },
    menu: {
      thisPage: 'Den här sidan',
      group: 'Grupp',
      source: 'källa',
      copy: 'kopia',
      paused: 'Pausad',
      notInGroup: 'Den här sidan finns inte i någon synkgrupp.',
      duplicateHint:
        'Tips: skapa en grupp från din kartsida, använd Roll20:s Duplicera sida på den, gå till kopian och lägg till den i gruppen. Då behåller kopiorna bilder från marknadsplatsen.',
      selectedHint: 'Dölj och Visa gäller de markerade objekten.',
      groups: 'Grupper',
    },
    group: {
      pages: 'Sidor (★ = källa)',
      playersCount: '{count} spelare',
      sourceHint: 'Källsidan är referensen vid reparationer.',
      summary: 'Sammanfattning',
      links: 'Länkade objekt',
      hidden: 'Dolda kopior',
      recycle: 'I papperskorgen',
      overrides: 'Egna inställningar',
      none: 'inga',
      lastRepair: 'Senaste reparation {when}: {drifted} avvikande, {recreated} återskapade.',
    },
    players: {
      none: 'Det finns inga spelare i det här spelet än.',
      elsewhere: 'inte i den här gruppen',
      visibility: 'Markerade objekt: klicka för att dölja eller visa på en sida',
      selectHint:
        'Markera tokens och öppna kortet igen för att dölja eller visa dem sida för sida.',
      shown: 'visas',
      hidden: 'dold',
      layoutSaved: 'En fördelning med {count} spelare är sparad.',
      youAreOn: 'Du är på {page}.',
    },
    status: {
      notLinked: 'inte länkad',
      pageOnly: 'bara på den här sidan',
      missing: 'saknas',
    },
    recycle: {
      empty: 'Papperskorgen är tom.',
      reasons: {
        delete: 'Raderad',
        repair: 'Reparation',
        exclude: 'Undantaget lager',
        group: 'Grupp borttagen',
      },
    },
    repair: {
      drifted: 'Kopior som avvikit',
      recreated: 'Saknade kopior återskapade',
      removed: 'Kopior borttagna (källan raderad)',
      dropped: 'Tomma länkar borttagna',
      mirrored: 'Nya objekt kopierade',
      leftovers: 'Nya objekt på kopior',
      pageSettings: 'Sidor med andra inställningar',
      dryRunNote: 'Inget har ändrats än.',
      doneNote: 'Klart. Borttagna objekt finns i papperskorgen.',
    },
    age: {
      now: 'nyss',
      minutes: 'för {count} min sedan',
      hours: 'för {count} h sedan',
      days: 'för {count} dagar sedan',
    },
    types: {
      graphic: 'Token',
      text: 'Text',
      path: 'Ritning',
      pathv2: 'Ritning',
      door: 'Dörr',
      window: 'Fönster',
    },
    values: {
      on: 'På',
      off: 'Av',
      none: 'Ingen',
    },
    queries: {
      group: 'Grupp',
      groupName: 'Gruppnamn',
      deleteGroup: 'Radera gruppen {name}? Objekten finns kvar på sina sidor.',
      resetSettings: 'Återställa standardinställningarna?',
      emptyRecycle: 'Töm papperskorgen? Det går inte att ångra.',
      yes: 'Ja',
      no: 'Nej',
    },
    buttons: {
      menu: 'Meny',
      group: 'Grupp',
      players: 'Spelare',
      repair: 'Reparera',
      repairNow: 'Reparera nu',
      dryRun: 'Förhandsvisa',
      pause: 'Pausa',
      resume: 'Fortsätt',
      status: 'Status',
      hideHere: 'Dölj här',
      showHere: 'Visa här',
      hideOthers: 'Dölj på andra sidor',
      showOthers: 'Visa på andra sidor',
      createGroup: 'Skapa grupp av sidan',
      addToGroup: 'Lägg till sidan i en grupp',
      removePage: 'Ta bort ur grupp',
      makeSource: 'Gör till källa',
      settings: 'Inställningar',
      groupSettings: 'Gruppinställningar',
      recycle: 'Papperskorg',
      undo: 'Ångra',
      help: 'Hjälp',
      rename: 'Byt namn',
      deleteGroup: 'Radera grupp',
      everyoneTo: 'Alla till {page}',
      saveLayout: 'Spara fördelning',
      restoreLayout: 'Återställ fördelning',
      useGlobal: 'Använd global',
      reset: 'Nollställ inställningar',
      restore: 'Återställ',
      emptyRecycle: 'Töm',
      deleteEverywhere: 'Radera överallt',
      keepOthers: 'Behåll de andra',
      copy: 'Kopiera',
      keepHere: 'Behåll här',
      copyAll: 'Kopiera alla',
      keepAll: 'Behåll alla här',
      unlink: 'Avlänka',
      rebuild: 'Bygg om handouts',
    },
    settings: {
      deleteMode: 'När ett objekt raderas',
      hideMode: 'Hur kopior döljs',
      pairLeftovers: 'Objekt utan motsvarighet',
      newObjects: 'Nya objekt',
      localProps: 'Per sida (tokens)',
      localPageSettings: 'Per sida (sidinställningar)',
      excludeLayers: 'Lager som inte synkas',
      syncPageSettings: 'Spegla sidinställningar',
      repairOnStart: 'Reparera vid start',
      playerMenu: 'Vem får öppna spelarkortet',
      recycleSize: 'Papperskorgens storlek',
      language: 'Språk',
      groupHint:
        'Inställningarna här gäller bara den här gruppen. "Använd global" går tillbaka till huvudinställningen.',
      override: 'den här gruppen',
      global: 'global',
    },
    settingsHelp: {
      deleteMode:
        'Överallt: raderar du på en sida raderas alla kopior. Bara källsidan: bara raderingar på källsidan sprids. Avlänka: sprids aldrig. Fråga: viskar ett val.',
      hideMode:
        'SL-lager: kopian flyttas till SL-lagret. Ta bort: kopian raderas och skapas igen när den visas, så inget finns kvar för spelarna att hitta.',
      pairLeftovers:
        'När en sida går med i en grupp eller repareras: fråga, kopiera dem till de andra sidorna eller lämna dem på sin sida.',
      newObjects:
        'Spegla: objekt som skapas på en sida kopieras. Bara källan: bara objekt som skapas på källsidan kopieras.',
      localProps:
        'Token-egenskaper som varje sida behåller för sig, till exempel syn för en spelare.',
      localPageSettings:
        'Sidinställningar som varje sida behåller för sig, till exempel mörker för en grupp spelare.',
      excludeLayers: 'Objekt på dessa lager stannar på sin egen sida.',
      syncPageSettings:
        'Kopiera sidinställningar (belysning, rutnät, storlek…) mellan gruppens sidor.',
      repairOnStart:
        'När sandlådan startar: reparera tyst, reparera och rapportera, eller gör inget.',
      playerMenu: 'Bara SL, eller så får spelare fråga vilken sida de är på.',
      recycleSize: 'Hur många borttagningar varje grupp sparar för Ångra.',
      language: 'Språk för menyer, meddelanden och handouts.',
    },
    options: {
      deleteMode: { all: 'Överallt', source: 'Bara källsidan', unlink: 'Avlänka', ask: 'Fråga' },
      hideMode: { gmlayer: 'SL-lager', remove: 'Ta bort' },
      pairLeftovers: { ask: 'Fråga', copy: 'Kopiera', leave: 'Lämna' },
      newObjects: { mirror: 'Spegla', sourceOnly: 'Bara källan' },
      localProps: {
        gmnotes: 'SL-anteckningar',
        name: 'Namn',
        bars: 'Mätare',
        markers: 'Markörer',
        tint: 'Färgton',
        aura: 'Auror',
        vision: 'Syn',
        light: 'Ljus',
        controlledby: 'Styrs av',
      },
      localPageSettings: {
        lighting: 'Belysning',
        daylight: 'Dagsljus',
        explorer: 'Utforskarläge',
        fog: 'Dimma',
        grid: 'Rutnät',
        background: 'Bakgrund',
        scale: 'Storlek och skala',
        jukebox: 'Jukebox',
      },
      excludeLayers: {
        map: 'Karta',
        objects: 'Tokens',
        gmlayer: 'SL',
        foreground: 'Förgrund',
        walls: 'Väggar',
      },
      repairOnStart: { quiet: 'Tyst', report: 'Med rapport', off: 'Av' },
      playerMenu: { gm: 'Bara SL', players: 'Även spelare' },
    },
    help: {
      menu: 'Öppna menyn.',
      groupCreate: 'Skapa en synkgrupp från den här sidan.',
      groupAdd:
        'Lägg till den här sidan i en grupp: matchande objekt paras ihop, saknade kopieras.',
      groupRemove: 'Ta ut den här sidan ur sin grupp. Objekten finns kvar, utan länk.',
      groupShow: 'Visa en grupps kort.',
      groupRename: 'Byt namn på en grupp.',
      groupSource: 'Gör den här sidan till gruppens källa (referensen vid reparationer).',
      groupDelete: 'Radera en grupp (frågar först). Objekten finns kvar.',
      players:
        'Visa vem som är på vilken sida, med knappar för att flytta dem och för att dölja eller visa de markerade tokens per sida.',
      move: 'Flytta en spelare till en sida (dela upp gruppen).',
      moveAll: 'Flytta alla spelare i gruppen till en sida och kom ihåg var de var.',
      layout: 'Kom ihåg eller återställ vilken sida varje spelare är på.',
      hide: 'Dölj de markerade objektens kopior: här, på de andra sidorna, överallt eller på namngivna sidor.',
      show: 'Visa dolda kopior igen.',
      status: 'Visa de markerade objektens länkar och var de är dolda.',
      unlink: 'Behåll de markerade objekten bara på den här sidan.',
      repair: 'Gör kopiorna lika källsidan igen. --dry-run rapporterar bara.',
      pause: 'Sluta spegla en grupp en stund.',
      resume: 'Spegla igen; visar vad som skiljer sig.',
      undo: 'Lägg tillbaka den senaste borttagningen.',
      recycle: 'Lista borttagningar och återställ någon av dem.',
      settings: 'Visa inställningarna, globalt eller för en grupp.',
      set: 'Ändra en inställning. Listor tar +name eller -name.',
      settingsReset: 'Återställ standardinställningarna (frågar först).',
      handouts: 'Bygg om handouterna Hjälp och Kommandopanel.',
      help: 'Visa den här listan.',
      ids: 'Agera på dessa objekt i stället för de markerade.',
      page: 'Agera på den här sidan i stället för den du tittar på.',
      footer: 'Handouten {help} förklarar allt; {deck} har knappar.',
    },
    deck: {
      menuTitle: 'Meny',
      menuDesc: 'Huvudmenyn, spelare och inställningar.',
      groupsTitle: 'Grupper',
      groupsDesc: 'Skapa en grupp från sidan du är på, eller lägg till sidan i en grupp.',
      selectedTitle: 'Markerade objekt',
      selectedDesc: 'Dölj eller visa de markerade objektens kopior.',
      toolsTitle: 'Verktyg',
      toolsDesc: 'Reparera, ångra, pausa och handouts.',
      footer: 'Se {help} för hur SyncPage fungerar.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Länkade sidor för uppdelade grupper',
      footer: 'Öppna {deck} för knappar.',
      overview: {
        heading: 'Översikt',
        body: 'SyncPage håller sidor i takt. Sidor i en synkgrupp delar tokens, ritningar, väggar, dörrar, fönster, text och sidinställningar: det som ändras på en sida ändras på de andra. Med Roll20:s dela upp gruppen placerar du spelare på olika kopior och döljer eller visar sedan saker per kopia, så att varje spelare bara ser det deras rollperson ska se.',
        why: 'Roll20 kan inte dölja ett objekt för bara vissa spelare på en sida. Dynamisk belysning ger varje token egen syn, men inte "den här SLP:n är osynlig bara för tjuven". Speglade sidor gör det.',
      },
      quickStart: {
        heading: 'Snabbstart',
        steps: [
          'Gå till din kartsida och skriv !syncpage, klicka sedan på "Skapa grupp av sidan".',
          'Använd Roll20:s Duplicera sida på den sidan (sidkortets meny). Den kopierar bilder från marknadsplatsen, vilket API:et inte kan.',
          'Gå till kopian och klicka på "Lägg till sidan i en grupp". SyncPage parar ihop objekten som matchar och kopierar det som saknas.',
          'Öppna Spelare för att flytta spelare till kopian, markera sedan tokens och dölj dem på en sida.',
        ],
      },
      mirroring: {
        heading: 'Vad som speglas',
        points: [
          'Tokens (även Jumpgate-ljus), text, Legacy- och Jumpgate-ritningar, väggar av alla slag, dörrar och fönster.',
          'Nya objekt, ändringar och raderingar, åt båda hållen. Raderingar följer inställningen "När ett objekt raderas".',
          'Sidinställningar som belysning, rutnät och storlek, om de inte är avstängda eller behålls per sida.',
          'Lager kan undantas per grupp, och token-egenskaper som syn kan behållas per sida.',
          'Ändringar som andra Mods gör via TokenMod speglas också. Andra Mods kan anropa SyncPage.notify; reparation fångar resten.',
        ],
      },
      visibility: {
        heading: 'Dölja per sida',
        points: [
          'Markera tokens och använd Dölj här, Dölj på andra sidor eller rutnätet på Spelare-kortet.',
          'Bara den sidans kopia döljs. Ändringar från andra sidor tar aldrig bort döljandet.',
          'Läget SL-lager flyttar kopian till SL-lagret. Läget Ta bort raderar den och skapar den igen när den visas, så inget finns kvar på sidan för spelarna att hitta.',
        ],
      },
      players: {
        heading: 'Spelare',
        points: [
          'Spelare-kortet listar varje spelare och sidan de är på, med en knapp per sida för att flytta dem (dela upp gruppen).',
          '"Alla till" samlar spelarna på en sida och kommer ihåg var de var; "Återställ fördelning" flyttar tillbaka dem.',
        ],
      },
      repair: {
        heading: 'Reparation',
        points: [
          'Reparation gör kopiorna lika källsidan igen: avvikande egenskaper, saknade kopior, objekt som raderats eller skapats medan SyncPage inte bevakade.',
          'Förhandsvisa visar vad som skulle ändras utan att ändra något. En reparation som skulle ändra många objekt frågar först.',
          'Reparation körs tyst när sandlådan startar (inställning). Objekt-ID:n förblir desamma, till skillnad från 0.1.',
        ],
      },
      memory: {
        heading: 'Vad SyncPage kommer ihåg',
        points: [
          'En papperskorg per grupp: varje radering som sprids och varje städning kan läggas tillbaka med Ångra.',
          'Var varje spelare var, så att en uppdelning kan återställas.',
          'Den senaste gruppen du använde, den senaste reparationen och dess resultat.',
          'Knappar som behöver data bär en kort kod; de fungerar en gång och går ut efter 10 minuter.',
        ],
      },
      commands: {
        heading: 'Kommandon',
        intro: 'Bara SL. !sync fungerar också.',
        colCommand: 'Kommando',
        colDesc: 'Vad det gör',
      },
      settings: {
        heading: 'Inställningar',
        intro:
          'Ändra inställningar på inställningskortet eller med !syncpage set. Gruppinställningar kan ändras för en grupp på dess kort.',
        colKey: 'Nyckel',
        colName: 'Inställning',
        colDesc: 'Betydelse',
        colScope: 'Omfång',
        scopeGroup: 'Per grupp',
        scopeGlobal: 'Global',
      },
      api: {
        heading: 'För andra Mods',
        intro: 'Det globala SyncPage-objektet:',
        colFunction: 'Funktion',
        colDesc: 'Vad den gör',
        rows: {
          getGroup: 'Gruppen en sida finns i: id, namn, källa och sidor.',
          getLinked: 'Ett objekts länkade kopior, per sida.',
          notify: 'Spegla en ändring som din Mod gjort (API-ändringar utlöser inga händelser).',
          isHidden: 'Om ett objekts kopia är dold på en sida.',
          onSync: 'Få besked om varje speglad skapelse, ändring och radering.',
          repair: 'Reparera en grupp; { dryRun: true } räknar bara.',
        },
      },
      upgrading: {
        heading: 'Uppgradera från 0.1',
        points: [
          'En sida vars namn slutar på "_synced" går med i en grupp med sidan som har samma namn utan det, och den blir källan. Du kan döpa om sidorna efteråt.',
          'Gamla länkar behålls; allt annat paras ihop efter position och bild.',
          'Show/Hide-flaggor i SL-anteckningar blir dolda kopior, och flaggtexten tas bort från SL-anteckningarna.',
          'Ett eget kommando från den gamla konfigurationen fungerar fortfarande. "True Copy" finns inte längre: använd Duplicera sida.',
        ],
      },
      troubleshooting: {
        heading: 'Felsökning',
        points: [
          'En token kopierades med fel bild: API:et kan inte kopiera bilder från marknadsplatsen. Gör kopian med Duplicera sida och lägg till den i gruppen.',
          'Kopior ur takt efter att en annan Mod ändrat saker: kör Reparera, eller be upphovspersonen till den Moden att anropa SyncPage.notify.',
          'Vill du ändra en kopia med flit? Pausa gruppen, gör ändringarna, välj sedan Fortsätt och välj att inte reparera.',
        ],
      },
      languages: {
        heading: 'Språk',
        body: 'Välj språk på inställningskortet. Menyer, meddelanden och dessa handouts följer det.',
        colLanguage: 'Språk',
        colNative: 'Eget namn',
        colCode: 'Kod',
      },
      credits: {
        heading: 'Tack till',
        original: 'Ursprunglig Mod av',
        maintainer: 'Omskriven och underhållen av',
        support: 'Rapportera problem på Roll20-forumet eller GitHub.',
      },
    },
  };

  var localeTr = {
    titles: {
      ready: 'SyncPage hazır.',
      group: 'Eşitleme grubu: {name}',
      players: 'Oyuncular: {name}',
      settings: 'SyncPage Ayarları',
      groupSettings: '{name} ayarları',
      status: 'SyncPage Durumu',
      recycle: 'Çöp kutusu: {name}',
      dryRun: 'Onarım önizlemesi: {name}',
      repaired: 'Onarıldı: {name}',
      repairedOnStart: 'SyncPage gruplarınızı onardı',
      help: 'SyncPage Komutları',
      deleted: 'Bir sayfada silindi',
      leftovers: 'Eşi olmayan nesneler',
      warning: 'SyncPage',
    },
    messages: {
      readyHint: 'Menüyü açmak için !syncpage yazın.',
      migrated:
        'SyncPage 0.1 kurulumunuz aktarıldı: {groups} grup, {links} bağlantı korundu, {hidden} gizli kopya. Adı "_synced" ile biten sayfalar artık yeniden adlandırılabilir.',
      trueCopyGone:
        'Eski "True Copy" özelliği kaldırıldı: Roll20\'nin kendi "Sayfayı Çoğalt" komutunu kullanın, sonra kopyayı bir gruba ekleyin.',
      groupCreated:
        '"{name}" grubu {page} sayfasından {count} nesneyle oluşturuldu. Sayfayı çoğaltın, sonra kopyayı "Sayfayı bir gruba ekle" ile ekleyin.',
      pageAdded:
        '{page} sayfası "{name}" grubuna katıldı: {paired} eşlendi, {copied} kopyalandı, {failed} kopyalanamadı, {leftovers} eşsiz kaldı.',
      pageRemoved: '{page} sayfası "{name}" grubundan çıktı. Nesneleri bağlantısız olarak kalır.',
      groupDeleted: '"{name}" grubu silindi. Nesneler kendi sayfalarında kalır.',
      notConfirmed: 'Hiçbir şey değişmedi (onaylanmadı).',
      hidden: '{count} kopya gizlendi. {skipped} nesne bağlı değil.',
      shown: '{count} kopya gösterildi. {skipped} nesne bağlı değil.',
      hideFallback:
        "{count} kopya, API'nin yeniden oluşturamadığı bir resim kullanıyor; bu yüzden kaldırılmak yerine GM katmanına taşındılar.",
      deletedAsk: '{name}, {page} sayfasında silindi. Diğer sayfalardaki kopyaları hâlâ duruyor.',
      deletedEverywhere: 'Diğer {count} kopya silindi. Geri Al onları geri getirir.',
      keptOthers: 'Diğer kopyalar kalıyor.',
      restored: '{count} nesne geri yüklendi. {failed} nesne geri yüklenemedi.',
      nothingToUndo: 'Geri alınacak bir şey yok.',
      recycleEmptied: 'Çöp kutusu boşaltıldı.',
      leftovers:
        '{page} sayfasındaki {count} nesnenin grupta eşi yok. Diğer sayfalara kopyalansın mı, yoksa yalnızca bu sayfada mı kalsın?',
      andMore: '…ve {count} tane daha.',
      leftoversCopied: '{count} nesne diğer sayfalara kopyalandı.',
      leftoversKept: '{count} nesne yalnızca kendi sayfasında tutuldu.',
      imageNotCopied:
        '{page} sayfasındaki {name}, API\'nin kopyalayamadığı bir resim kullanıyor (mağaza görseli). Bununla kopya yapmak için Roll20\'nin "Sayfayı Çoğalt" komutunu kullanın, sonra kopyayı gruba ekleyin.',
      moved: '{player}, {page} sayfasına taşındı.',
      movedAll: '{count} oyuncu {page} sayfasına taşındı. "Düzeni geri yükle" onları geri götürür.',
      layoutSaved: '{count} oyuncunun yeri hatırlandı.',
      layoutRestored: '{count} oyuncu geri taşındı.',
      layoutReset: 'Hatırlanan düzen silindi.',
      unlinked: '{count} nesnenin bağlantısı kaldırıldı. Yalnızca bu sayfada kalırlar.',
      paused:
        '"{name}" için yansıtma duraklatıldı. Siz devam ettirene kadar değişiklikler yapıldıkları sayfada kalır.',
      resumed: '"{name}" için yansıtma yeniden açık. {count} fark bulundu.',
      settingsReset: 'Ayarlar varsayılanlarına döndürüldü.',
      resetMoved: 'Varsayılan ayarlara dönmek için {command} kullanın.',
      handouts: 'Yardım ve Komut Paneli notları yeniden oluşturuldu.',
      pruned: 'Toparlandı: {links} boş bağlantı, {pages} eksik sayfa.',
      startRepair:
        '{name}: {drifted} kaymış, {recreated} yeniden oluşturuldu, {removed} kaldırıldı, {mirrored} yeni nesne kopyalandı.',
    },
    errors: {
      hint: 'Komutlar için {command} help yazın.',
      gmOnly: "SyncPage'i yalnızca Oyun Yöneticisi kullanabilir.",
      unknownCommand: 'Bilinmeyen komut: {command}.',
      unknownSetting: 'Bilinmeyen ayar: {key}.',
      badValue: '"{value}", {key} için geçerli bir değer değil.',
      globalOnly: '{key} her grup için geçerlidir ve tek bir grup için değiştirilemez.',
      noGroup: '"{name}" için eşitleme grubu bulunamadı.',
      groupExists: '"{name}" adında bir grup zaten var.',
      noName: 'Bir ad verin.',
      pageInGroup: '{page} sayfası zaten "{group}" grubunda.',
      pageNotInGroup: '{page} sayfası "{name}" grubunda değil.',
      nothingSelected: 'Önce bir veya daha fazla nesne seçin.',
      noPage: '"{page}" için sayfa bulunamadı.',
      noPlayer: '"{player}" için oyuncu bulunamadı.',
      requestExpired: 'Bu düğmenin süresi doldu. Kartı yeniden açın.',
      requestUnknown: 'Bu düğme zaten kullanıldı.',
    },
    menu: {
      thisPage: 'Bu sayfa',
      group: 'Grup',
      source: 'kaynak',
      copy: 'kopya',
      paused: 'Duraklatıldı',
      notInGroup: 'Bu sayfa bir eşitleme grubunda değil.',
      duplicateHint:
        'İpucu: harita sayfanızdan bir grup oluşturun, ona Roll20\'nin "Sayfayı Çoğalt" komutunu uygulayın, kopyaya gidin ve onu gruba ekleyin. Kopyalar mağaza görsellerini böyle korur.',
      selectedHint: 'Gizle ve Göster seçili nesnelere uygulanır.',
      groups: 'Gruplar',
    },
    group: {
      pages: 'Sayfalar (★ = kaynak)',
      playersCount: '{count} oyuncu',
      sourceHint: 'Kaynak sayfa onarımlar için referanstır.',
      summary: 'Özet',
      links: 'Bağlı nesneler',
      hidden: 'Gizli kopyalar',
      recycle: 'Çöp kutusunda',
      overrides: 'Kendi ayarları',
      none: 'yok',
      lastRepair: 'Son onarım {when}: {drifted} kaymış, {recreated} yeniden oluşturuldu.',
    },
    players: {
      none: 'Bu oyunda henüz oyuncu yok.',
      elsewhere: 'bu grupta değil',
      visibility: 'Seçili nesneler: bir sayfada gizlemek veya göstermek için tıklayın',
      selectHint:
        "Token'ları sayfa sayfa gizlemek veya göstermek için onları seçin ve bu kartı yeniden açın.",
      shown: 'görünür',
      hidden: 'gizli',
      layoutSaved: '{count} oyuncunun düzeni hatırlanıyor.',
      youAreOn: '{page} sayfasındasınız.',
    },
    status: {
      notLinked: 'bağlı değil',
      pageOnly: 'yalnızca bu sayfada tutuluyor',
      missing: 'eksik',
    },
    recycle: {
      empty: 'Çöp kutusu boş.',
      reasons: {
        delete: 'Silindi',
        repair: 'Onarım',
        exclude: 'Hariç katman',
        group: 'Grup kaldırıldı',
      },
    },
    repair: {
      drifted: 'Kaymış kopyalar',
      recreated: 'Yeniden oluşturulan eksik kopyalar',
      removed: 'Kaldırılan kopyalar (kaynak silindi)',
      dropped: 'Atılan boş bağlantılar',
      mirrored: 'Kopyalanan yeni nesneler',
      leftovers: 'Kopyalardaki yeni nesneler',
      pageSettings: 'Farklı ayarlı sayfalar',
      dryRunNote: 'Henüz hiçbir şey değişmedi.',
      doneNote: 'Tamam. Kaldırılan nesneler çöp kutusunda.',
    },
    age: {
      now: 'az önce',
      minutes: '{count} dk önce',
      hours: '{count} sa önce',
      days: '{count} gün önce',
    },
    types: {
      graphic: 'Token',
      text: 'Metin',
      path: 'Çizim',
      pathv2: 'Çizim',
      door: 'Kapı',
      window: 'Pencere',
    },
    values: {
      on: 'Açık',
      off: 'Kapalı',
      none: 'Yok',
    },
    queries: {
      group: 'Grup',
      groupName: 'Grup adı',
      deleteGroup: '{name} grubu silinsin mi? Nesneler kendi sayfalarında kalır.',
      resetSettings: 'Varsayılan ayarlara dönülsün mü?',
      emptyRecycle: 'Çöp kutusu boşaltılsın mı? Bu geri alınamaz.',
      yes: 'Evet',
      no: 'Hayır',
    },
    buttons: {
      menu: 'Menü',
      group: 'Grup',
      players: 'Oyuncular',
      repair: 'Onar',
      repairNow: 'Şimdi onar',
      dryRun: 'Onarım önizle',
      pause: 'Duraklat',
      resume: 'Devam et',
      status: 'Durum',
      hideHere: 'Burada gizle',
      showHere: 'Burada göster',
      hideOthers: 'Diğerlerinde gizle',
      showOthers: 'Diğerlerinde göster',
      createGroup: 'Bu sayfadan grup oluştur',
      addToGroup: 'Sayfayı bir gruba ekle',
      removePage: 'Gruptan çıkar',
      makeSource: 'Kaynak yap',
      settings: 'Ayarlar',
      groupSettings: 'Grup ayarları',
      recycle: 'Çöp kutusu',
      undo: 'Geri al',
      help: 'Yardım',
      rename: 'Yeniden adlandır',
      deleteGroup: 'Grubu sil',
      everyoneTo: 'Herkes: {page}',
      saveLayout: 'Düzeni kaydet',
      restoreLayout: 'Düzeni geri yükle',
      useGlobal: 'Geneli kullan',
      reset: 'Ayarları sıfırla',
      restore: 'Geri yükle',
      emptyRecycle: 'Boşalt',
      deleteEverywhere: 'Her yerde sil',
      keepOthers: 'Diğerlerini tut',
      copy: 'Kopyala',
      keepHere: 'Burada tut',
      copyAll: 'Hepsini kopyala',
      keepAll: 'Hepsini burada tut',
      unlink: 'Bağlantıyı kaldır',
      rebuild: 'Notları yenile',
    },
    settings: {
      deleteMode: 'Bir nesne silindiğinde',
      hideMode: 'Kopyalar nasıl gizlenir',
      pairLeftovers: 'Eşi olmayan nesneler',
      newObjects: 'Yeni nesneler',
      localProps: "Sayfaya özel (token'lar)",
      localPageSettings: 'Sayfaya özel (sayfa ayarları)',
      excludeLayers: 'Eşitlenmeyen katmanlar',
      syncPageSettings: 'Sayfa ayarlarını yansıt',
      repairOnStart: 'Başlangıçta onar',
      playerMenu: 'Oyuncu kartını kim açabilir',
      recycleSize: 'Çöp kutusu boyutu',
      language: 'Dil',
      groupHint:
        'Buradaki ayarlar yalnızca bu grup için geçerlidir. "Geneli kullan" ana ayara geri döner.',
      override: 'bu grup',
      global: 'genel',
    },
    settingsHelp: {
      deleteMode:
        'Her yerde: herhangi bir sayfada silmek tüm kopyaları siler. Yalnızca kaynak sayfa: yalnızca kaynak sayfadaki silmeler yayılır. Bağlantıyı kaldır: hiç yayılmaz. Sor: seçenek fısıltıyla gelir.',
      hideMode:
        'GM katmanı: kopya GM katmanına taşınır. Kaldır: kopya silinir ve gösterildiğinde yeniden oluşturulur; böylece oyuncuların bulacağı bir şey kalmaz.',
      pairLeftovers:
        'Bir sayfa gruba katıldığında veya onarıldığında: sor, diğer sayfalara kopyala ya da kendi sayfalarında bırak.',
      newObjects:
        'Yansıt: herhangi bir sayfada oluşturulan nesneler kopyalanır. Yalnızca kaynak: yalnızca kaynak sayfada oluşturulan nesneler kopyalanır.',
      localProps:
        'Her sayfanın kendine sakladığı token özellikleri, örneğin tek bir oyuncu için görüş.',
      localPageSettings:
        'Her sayfanın kendine sakladığı sayfa ayarları, örneğin bir oyuncu grubu için karanlık.',
      excludeLayers: 'Bu katmanlardaki nesneler kendi sayfalarında kalır.',
      syncPageSettings:
        'Sayfa ayarlarını (aydınlatma, ızgara, boyut…) grubun sayfaları arasında kopyala.',
      repairOnStart: 'Sandbox başladığında: sessizce onar, onar ve bildir ya da hiçbir şey yapma.',
      playerMenu:
        'Yalnızca Oyun Yöneticisi ya da oyuncular da hangi sayfada olduklarını sorabilir.',
      recycleSize: 'Her grubun Geri Al için sakladığı kaldırma sayısı.',
      language: 'Menülerin, mesajların ve notların dili.',
    },
    options: {
      deleteMode: {
        all: 'Her yerde',
        source: 'Yalnızca kaynak sayfa',
        unlink: 'Bağlantıyı kaldır',
        ask: 'Sor',
      },
      hideMode: { gmlayer: 'GM katmanı', remove: 'Kaldır' },
      pairLeftovers: { ask: 'Sor', copy: 'Kopyala', leave: 'Bırak' },
      newObjects: { mirror: 'Yansıt', sourceOnly: 'Yalnızca kaynak' },
      localProps: {
        gmnotes: 'GM Notları',
        name: 'Ad',
        bars: 'Çubuklar',
        markers: 'İşaretler',
        tint: 'Renk tonu',
        aura: 'Auralar',
        vision: 'Görüş',
        light: 'Işık',
        controlledby: 'Kontrol eden',
      },
      localPageSettings: {
        lighting: 'Aydınlatma',
        daylight: 'Gün ışığı',
        explorer: 'Kâşif modu',
        fog: 'Sis',
        grid: 'Izgara',
        background: 'Arka plan',
        scale: 'Boyut ve ölçek',
        jukebox: 'Müzik kutusu',
      },
      excludeLayers: {
        map: 'Harita',
        objects: "Token'lar",
        gmlayer: 'GM',
        foreground: 'Ön plan',
        walls: 'Duvarlar',
      },
      repairOnStart: { quiet: 'Sessizce', report: 'Ve bildir', off: 'Kapalı' },
      playerMenu: { gm: 'Yalnızca GM', players: 'Oyuncular da' },
    },
    help: {
      menu: 'Menüyü açar.',
      groupCreate: 'Bu sayfadan bir eşitleme grubu oluşturur.',
      groupAdd: 'Bu sayfayı bir gruba ekler: eşleşen nesneler eşlenir, eksik olanlar kopyalanır.',
      groupRemove: 'Bu sayfayı grubundan çıkarır. Nesneler bağlantısız olarak kalır.',
      groupShow: 'Bir grubun kartını gösterir.',
      groupRename: 'Bir grubu yeniden adlandırır.',
      groupSource: 'Bu sayfayı grubun kaynağı yapar (onarımlar için referans).',
      groupDelete: 'Bir grubu siler (önce sorar). Nesneler kalır.',
      players:
        "Kimin hangi sayfada olduğunu gösterir; oyuncuları taşımak ve seçili token'ları sayfa başına gizlemek veya göstermek için düğmeler içerir.",
      move: 'Bir oyuncuyu bir sayfaya taşır (ekibi bölme).',
      moveAll: 'Gruptaki tüm oyuncuları tek bir sayfaya taşır ve nerede olduklarını hatırlar.',
      layout: 'Her oyuncunun hangi sayfada olduğunu hatırlar veya geri yükler.',
      hide: 'Seçili nesnelerin kopyalarını gizler: burada, diğer sayfalarda, her yerde veya adı verilen sayfalarda.',
      show: 'Gizli kopyaları yeniden gösterir.',
      status: 'Seçili nesnelerin bağlantılarını ve nerede gizli olduklarını gösterir.',
      unlink: 'Seçili nesneleri yalnızca bu sayfada tutar.',
      repair:
        'Kopyaları kaynak sayfayla yeniden uyumlu hâle getirir. --dry-run yalnızca rapor verir.',
      pause: 'Bir grubun yansıtmasını bir süreliğine durdurur.',
      resume: 'Yeniden yansıtır; farkları gösterir.',
      undo: 'Son kaldırmayı geri getirir.',
      recycle: 'Kaldırmaları listeler ve herhangi birini geri yükler.',
      settings: 'Ayarları genel olarak veya bir grup için gösterir.',
      set: 'Bir ayarı değiştirir. Listeler +name veya -name alır.',
      settingsReset: 'Varsayılan ayarlara döner (önce sorar).',
      handouts: 'Yardım ve Komut Paneli notlarını yeniden oluşturur.',
      help: 'Bu listeyi gösterir.',
      ids: 'Seçili nesneler yerine bu nesnelere uygular.',
      page: 'Baktığınız sayfa yerine bu sayfaya uygular.',
      footer: '{help} notu her şeyi açıklar; {deck} düğmeler içerir.',
    },
    deck: {
      menuTitle: 'Menü',
      menuDesc: 'Ana menü, oyuncular ve ayarlar.',
      groupsTitle: 'Gruplar',
      groupsDesc: 'Bulunduğunuz sayfadan bir grup oluşturun veya bu sayfayı bir gruba ekleyin.',
      selectedTitle: 'Seçili nesneler',
      selectedDesc: 'Seçili nesnelerin kopyalarını gizleyin veya gösterin.',
      toolsTitle: 'Araçlar',
      toolsDesc: 'Onarım, geri alma, duraklatma ve notlar.',
      footer: "SyncPage'in nasıl çalıştığı için {help} notuna bakın.",
    },
    handout: {
      versionLabel: 'Sürüm',
      subtitle: 'Bölünmüş ekipler için bağlı sayfalar',
      footer: 'Düğmeler için {deck} notunu açın.',
      overview: {
        heading: 'Genel bakış',
        body: "SyncPage sayfaları uyum içinde tutar. Bir eşitleme grubundaki sayfalar token'larını, çizimlerini, duvarlarını, kapılarını, pencerelerini, metinlerini ve sayfa ayarlarını paylaşır: bir sayfada ne değişirse diğerlerinde de değişir. Roll20'nin ekibi bölme özelliğiyle oyuncuları farklı kopyalara koyar, sonra her kopyada bir şeyleri gizler veya gösterirsiniz; böylece her oyuncu yalnızca karakterinin görmesi gerekeni görür.",
        why: 'Roll20 tek bir sayfadaki bir nesneyi yalnızca bazı oyunculardan gizleyemez. Dinamik aydınlatma her token\'a kendi görüşünü verir ama "bu NPC yalnızca hırsıza görünmez" diyemez. Yansıtılmış sayfalar bunu yapar.',
      },
      quickStart: {
        heading: 'Hızlı başlangıç',
        steps: [
          'Harita sayfanıza gidin ve !syncpage yazın, sonra "Bu sayfadan grup oluştur" düğmesine tıklayın.',
          'O sayfada Roll20\'nin "Sayfayı Çoğalt" komutunu kullanın (sayfa kartının menüsünde). Bu komut, API\'nin yapamadığı şekilde mağaza görsellerini de kopyalar.',
          'Kopyaya gidin ve "Sayfayı bir gruba ekle" düğmesine tıklayın. SyncPage eşleşen nesneleri eşler ve eksik olanları kopyalar.',
          "Oyuncuları kopyaya taşımak için Oyuncular'ı açın, sonra token'ları seçin ve bir sayfada gizleyin.",
        ],
      },
      mirroring: {
        heading: 'Neler yansıtılır',
        points: [
          "Token'lar (Jumpgate ışıkları dahil), metin, Legacy ve Jumpgate çizimleri, her türden duvar, kapılar ve pencereler.",
          'Yeni nesneler, değişiklikler ve silmeler, her iki yönde. Silmeler "Bir nesne silindiğinde" ayarına uyar.',
          'Aydınlatma, ızgara ve boyut gibi sayfa ayarları; kapatılmadıkça veya sayfaya özel tutulmadıkça.',
          'Katmanlar grup başına hariç tutulabilir; görüş gibi token özellikleri sayfaya özel tutulabilir.',
          "Diğer Mod'ların TokenMod üzerinden yaptığı değişiklikler de yansıtılır. Diğer Mod'lar SyncPage.notify çağırabilir; gerisini onarım yakalar.",
        ],
      },
      visibility: {
        heading: 'Sayfa başına gizleme',
        points: [
          "Token'ları seçin ve Burada gizle, Diğerlerinde gizle ya da Oyuncular kartındaki tabloyu kullanın.",
          'Yalnızca o sayfanın kopyası gizlenir. Diğer sayfalardan gelen değişiklikler gizlemeyi asla geri almaz.',
          'GM katmanı modu kopyayı GM katmanına taşır. Kaldır modu onu siler ve gösterildiğinde yeniden oluşturur; böylece sayfada oyuncuların bulacağı bir şey kalmaz.',
        ],
      },
      players: {
        heading: 'Oyuncular',
        points: [
          'Oyuncular kartı her oyuncuyu ve bulunduğu sayfayı listeler; onu taşımak için her sayfaya bir düğme vardır (ekibi bölme).',
          '"Herkes" düğmesi oyuncuları tek bir sayfada toplar ve nerede olduklarını hatırlar; "Düzeni geri yükle" onları geri götürür.',
        ],
      },
      repair: {
        heading: 'Onarım',
        points: [
          'Onarım kopyaları kaynak sayfayla yeniden uyumlu hâle getirir: kaymış özellikler, eksik kopyalar, SyncPage izlemiyorken silinen veya oluşturulan nesneler.',
          'Onarım önizlemesi hiçbir şeyi değiştirmeden neyin değişeceğini gösterir. Çok sayıda nesneyi değiştirecek bir onarım önce sorar.',
          "Onarım sandbox başladığında sessizce çalışır (ayar). Nesne kimlikleri 0.1'den farklı olarak aynı kalır.",
        ],
      },
      memory: {
        heading: 'SyncPage neleri hatırlar',
        points: [
          'Grup başına bir çöp kutusu: yayılan her silme ve her temizlik Geri Al ile geri getirilebilir.',
          'Her oyuncunun nerede olduğu; böylece bir bölünme geri yüklenebilir.',
          'Kullandığınız son grup, son onarım ve sonuçları.',
          'Veri gerektiren düğmeler kısa bir kod taşır; bir kez çalışır ve 10 dakika sonra süresi dolar.',
        ],
      },
      commands: {
        heading: 'Komutlar',
        intro: 'Yalnızca Oyun Yöneticisi. !sync de çalışır.',
        colCommand: 'Komut',
        colDesc: 'Ne yapar',
      },
      settings: {
        heading: 'Ayarlar',
        intro:
          'Ayarları ayarlar kartında veya !syncpage set ile değiştirin. Grup ayarları bir grup için o grubun kartında değiştirilebilir.',
        colKey: 'Anahtar',
        colName: 'Ayar',
        colDesc: 'Anlamı',
        colScope: 'Kapsam',
        scopeGroup: 'Grup başına',
        scopeGlobal: 'Genel',
      },
      api: {
        heading: "Diğer Mod'lar için",
        intro: 'Genel SyncPage nesnesi:',
        colFunction: 'Fonksiyon',
        colDesc: 'Ne yapar',
        rows: {
          getGroup: 'Bir sayfanın bulunduğu grup: id, ad, kaynak ve sayfalar.',
          getLinked: 'Bir nesnenin bağlı kopyaları, sayfaya göre.',
          notify:
            "Mod'unuzun yaptığı bir değişikliği yansıtır (API değişiklikleri olay tetiklemez).",
          isHidden: 'Bir nesnenin kopyasının bir sayfada gizli olup olmadığı.',
          onSync: 'Yansıtılan her oluşturma, değişiklik ve silmeden haberdar olun.',
          repair: 'Bir grubu onarır; { dryRun: true } yalnızca sayar.',
        },
      },
      upgrading: {
        heading: "0.1'den yükseltme",
        points: [
          'Adı "_synced" ile biten bir sayfa, bu ek olmadan aynı ada sahip sayfayla bir gruba katılır ve o sayfa kaynak olur. Sayfaları sonradan yeniden adlandırabilirsiniz.',
          'Eski bağlantılar korunur; geri kalan her şey konuma ve resme göre eşlenir.',
          "GM Notları'ndaki Show/Hide işaretleri gizli kopyalara dönüşür ve işaret metni GM Notları'ndan kaldırılır.",
          'Eski yapılandırmadaki özel komut hâlâ çalışır. "True Copy" kaldırıldı: "Sayfayı Çoğalt" komutunu kullanın.',
        ],
      },
      troubleshooting: {
        heading: 'Sorun giderme',
        points: [
          'Bir token yanlış resimle kopyalandı: API mağaza görsellerini kopyalayamaz. Kopyayı "Sayfayı Çoğalt" ile yapın ve gruba ekleyin.',
          "Başka bir Mod bir şeyleri değiştirdikten sonra kopyalar uyumsuz: Onar'ı çalıştırın ya da o Mod'un yazarından SyncPage.notify çağırmasını isteyin.",
          "Bir kopyayı bilerek mi düzenlemek istiyorsunuz? Grubu duraklatın, değişiklikleri yapın, sonra Devam et'e basın ve onarmamayı seçin.",
        ],
      },
      languages: {
        heading: 'Diller',
        body: 'Dili ayarlar kartında seçin. Menüler, mesajlar ve bu notlar onu izler.',
        colLanguage: 'Dil',
        colNative: 'Yerel adı',
        colCode: 'Kod',
      },
      credits: {
        heading: 'Emeği geçenler',
        original: 'Özgün Mod:',
        maintainer: 'Yeniden yazan ve bakımını yapan:',
        support: "Lütfen sorunları Roll20 forumunda veya GitHub'da bildirin.",
      },
    },
  };

  var localeUk = {
    titles: {
      ready: 'SyncPage готовий.',
      group: 'Група синхронізації: {name}',
      players: 'Гравці: {name}',
      settings: 'Налаштування SyncPage',
      groupSettings: 'Налаштування для {name}',
      status: 'Стан SyncPage',
      recycle: 'Кошик: {name}',
      dryRun: 'Попередній перегляд виправлення: {name}',
      repaired: 'Виправлено: {name}',
      repairedOnStart: 'SyncPage виправив ваші групи',
      help: 'Команди SyncPage',
      deleted: 'Видалено на одній сторінці',
      leftovers: 'Обʼєкти без пари',
      warning: 'SyncPage',
    },
    messages: {
      readyHint: 'Введіть !syncpage, щоб відкрити меню.',
      migrated:
        'Ваше налаштування SyncPage 0.1 перенесено. Груп: {groups}, збережено звʼязків: {links}, прихованих копій: {hidden}. Сторінки, чиї назви закінчуються на "_synced", тепер можна перейменувати.',
      trueCopyGone:
        'Старої функції «True Copy» більше немає: скористайтеся «Дублювати сторінку» в Roll20, а потім додайте копію до групи.',
      groupCreated:
        'Групу «{name}» створено зі сторінки {page}. Обʼєктів: {count}. Дублюйте сторінку, а потім додайте копію кнопкою «Додати сторінку до групи».',
      pageAdded:
        'Сторінку {page} додано до «{name}». Повʼязано: {paired}, скопійовано: {copied}, не вдалося скопіювати: {failed}, без пари: {leftovers}.',
      pageRemoved:
        'Сторінка {page} вийшла з групи «{name}». Її обʼєкти залишаються, але без звʼязків.',
      groupDeleted: 'Групу «{name}» видалено. Обʼєкти залишаються на своїх сторінках.',
      notConfirmed: 'Нічого не змінено (немає підтвердження).',
      hidden: 'Приховано копій: {count}. Обʼєктів без звʼязку: {skipped}.',
      shown: 'Показано копій: {count}. Обʼєктів без звʼязку: {skipped}.',
      hideFallback:
        'Копій із зображенням, яке API не може відтворити: {count}. Їх перенесено на шар Майстра, а не видалено.',
      deletedAsk:
        'Обʼєкт {name} видалено на сторінці {page}. Його копії на інших сторінках залишилися.',
      deletedEverywhere: 'Видалено інших копій: {count}. «Скасувати» поверне їх.',
      keptOthers: 'Інші копії залишаються.',
      restored: 'Відновлено обʼєктів: {count}. Не вдалося відновити: {failed}.',
      nothingToUndo: 'Немає чого скасовувати.',
      recycleEmptied: 'Кошик очищено.',
      leftovers:
        'Обʼєктів на сторінці {page} без пари в групі: {count}. Скопіювати їх на інші сторінки чи залишити лише на цій?',
      andMore: '…і ще {count}.',
      leftoversCopied: 'Скопійовано обʼєктів на інші сторінки: {count}.',
      leftoversKept: 'Залишено обʼєктів лише на своїй сторінці: {count}.',
      imageNotCopied:
        'Обʼєкт {name} на сторінці {page} використовує зображення, яке API не може скопіювати (арт із крамниці). Зробіть копії через «Дублювати сторінку» в Roll20, а потім додайте копію до групи.',
      moved: 'Гравця {player} переміщено на {page}.',
      movedAll: 'Гравців переміщено на {page}: {count}. «Повернути розстановку» поверне їх назад.',
      layoutSaved: 'Розстановку запамʼятовано. Гравців: {count}.',
      layoutRestored: 'Повернуто гравців: {count}.',
      layoutReset: 'Запамʼятовану розстановку видалено.',
      unlinked: 'Відвʼязано обʼєктів: {count}. Вони залишаються лише на цій сторінці.',
      paused:
        'Дзеркалення для «{name}» призупинено. Зміни залишаються на тій сторінці, де їх зроблено, доки ви його не відновите.',
      resumed: 'Дзеркалення для «{name}» знову ввімкнено. Знайдено відмінностей: {count}.',
      settingsReset: 'Відновлено типові налаштування.',
      resetMoved: 'Щоб повернути типові налаштування, скористайтеся {command}.',
      handouts: 'Роздаткові матеріали довідки та панелі команд створено заново.',
      pruned: 'Наведено лад. Порожніх звʼязків: {links}, відсутніх сторінок: {pages}.',
      startRepair:
        '{name}: зміщено {drifted}, відтворено {recreated}, видалено {removed}, скопійовано нових обʼєктів {mirrored}.',
    },
    errors: {
      hint: 'Введіть {command} help, щоб побачити команди.',
      gmOnly: 'Користуватися SyncPage може лише Майстер.',
      unknownCommand: 'Невідома команда: {command}.',
      unknownSetting: 'Невідоме налаштування: {key}.',
      badValue: '«{value}» — неприпустиме значення для {key}.',
      globalOnly: '{key} діє на всі групи і не змінюється для однієї групи.',
      noGroup: 'Групу синхронізації для «{name}» не знайдено.',
      groupExists: 'Група «{name}» уже існує.',
      noName: 'Вкажіть назву.',
      pageInGroup: 'Сторінка {page} уже в групі «{group}».',
      pageNotInGroup: 'Сторінка {page} не входить до групи «{name}».',
      nothingSelected: 'Спочатку виберіть один або кілька обʼєктів.',
      noPage: 'Сторінку «{page}» не знайдено.',
      noPlayer: 'Гравця «{player}» не знайдено.',
      requestExpired: 'Термін дії кнопки минув. Відкрийте картку знову.',
      requestUnknown: 'Цю кнопку вже використано.',
    },
    menu: {
      thisPage: 'Ця сторінка',
      group: 'Група',
      source: 'джерело',
      copy: 'копія',
      paused: 'Пауза',
      notInGroup: 'Ця сторінка не входить до групи синхронізації.',
      duplicateHint:
        'Порада: створіть групу зі сторінки з мапою, застосуйте до неї «Дублювати сторінку» в Roll20, перейдіть на копію і додайте її до групи. Так копії зберігають арт із крамниці.',
      selectedHint: '«Приховати» і «Показати» діють на вибрані обʼєкти.',
      groups: 'Групи',
    },
    group: {
      pages: 'Сторінки (★ = джерело)',
      playersCount: 'Гравців: {count}',
      sourceHint: 'Сторінка-джерело є зразком для виправлень.',
      summary: 'Підсумок',
      links: 'Повʼязані обʼєкти',
      hidden: 'Приховані копії',
      recycle: 'У кошику',
      overrides: 'Власні налаштування',
      none: 'немає',
      lastRepair: 'Останнє виправлення {when}: зміщено {drifted}, відтворено {recreated}.',
    },
    players: {
      none: 'У цій грі ще немає гравців.',
      elsewhere: 'не в цій групі',
      visibility: 'Вибрані обʼєкти: натисніть, щоб приховати чи показати на сторінці',
      selectHint:
        'Виберіть токени і знову відкрийте цю картку, щоб приховувати чи показувати їх посторінково.',
      shown: 'видно',
      hidden: 'приховано',
      layoutSaved: 'Розстановку запамʼятовано. Гравців: {count}.',
      youAreOn: 'Ви на сторінці {page}.',
    },
    status: {
      notLinked: 'без звʼязку',
      pageOnly: 'лише на цій сторінці',
      missing: 'відсутній',
    },
    recycle: {
      empty: 'Кошик порожній.',
      reasons: {
        delete: 'Видалення',
        repair: 'Виправлення',
        exclude: 'Виключений шар',
        group: 'Групу видалено',
      },
    },
    repair: {
      drifted: 'Зміщені копії',
      recreated: 'Відтворені відсутні копії',
      removed: 'Видалені копії (джерело видалено)',
      dropped: 'Прибрані порожні звʼязки',
      mirrored: 'Скопійовані нові обʼєкти',
      leftovers: 'Нові обʼєкти на копіях',
      pageSettings: 'Сторінки з іншими налаштуваннями',
      dryRunNote: 'Поки нічого не змінено.',
      doneNote: 'Готово. Видалені обʼєкти лежать у кошику.',
    },
    age: {
      now: 'щойно',
      minutes: '{count} хв тому',
      hours: '{count} год тому',
      days: '{count} дн. тому',
    },
    types: {
      graphic: 'Токен',
      text: 'Текст',
      path: 'Малюнок',
      pathv2: 'Малюнок',
      door: 'Двері',
      window: 'Вікно',
    },
    values: {
      on: 'Увімк.',
      off: 'Вимк.',
      none: 'Немає',
    },
    queries: {
      group: 'Група',
      groupName: 'Назва групи',
      deleteGroup: 'Видалити групу {name}? Обʼєкти залишаться на своїх сторінках.',
      resetSettings: 'Повернути типові налаштування?',
      emptyRecycle: 'Очистити кошик? Це не можна скасувати.',
      yes: 'Так',
      no: 'Ні',
    },
    buttons: {
      menu: 'Меню',
      group: 'Група',
      players: 'Гравці',
      repair: 'Виправити',
      repairNow: 'Виправити зараз',
      dryRun: 'Попередній перегляд',
      pause: 'Пауза',
      resume: 'Продовжити',
      status: 'Стан',
      hideHere: 'Приховати тут',
      showHere: 'Показати тут',
      hideOthers: 'Приховати на інших',
      showOthers: 'Показати на інших',
      createGroup: 'Створити групу зі сторінки',
      addToGroup: 'Додати сторінку до групи',
      removePage: 'Прибрати з групи',
      makeSource: 'Зробити джерелом',
      settings: 'Налаштування',
      groupSettings: 'Налаштування групи',
      recycle: 'Кошик',
      undo: 'Скасувати',
      help: 'Довідка',
      rename: 'Перейменувати',
      deleteGroup: 'Видалити групу',
      everyoneTo: 'Усі на {page}',
      saveLayout: 'Запамʼятати розстановку',
      restoreLayout: 'Повернути розстановку',
      useGlobal: 'Загальне',
      reset: 'Скинути налаштування',
      restore: 'Відновити',
      emptyRecycle: 'Очистити',
      deleteEverywhere: 'Видалити всюди',
      keepOthers: 'Залишити інші',
      copy: 'Копіювати',
      keepHere: 'Залишити тут',
      copyAll: 'Копіювати всі',
      keepAll: 'Залишити всі тут',
      unlink: 'Відвʼязати',
      rebuild: 'Оновити матеріали',
    },
    settings: {
      deleteMode: 'Коли обʼєкт видалено',
      hideMode: 'Як приховуються копії',
      pairLeftovers: 'Обʼєкти без пари',
      newObjects: 'Нові обʼєкти',
      localProps: 'Свої для сторінки (токени)',
      localPageSettings: 'Свої для сторінки (налаштування сторінки)',
      excludeLayers: 'Шари без синхронізації',
      syncPageSettings: 'Дзеркалити налаштування сторінки',
      repairOnStart: 'Виправляти під час запуску',
      playerMenu: 'Хто може відкрити картку гравців',
      recycleSize: 'Розмір кошика',
      language: 'Мова',
      groupHint: 'Ці налаштування діють лише на цю групу. «Загальне» повертає основне значення.',
      override: 'ця група',
      global: 'загальне',
    },
    settingsHelp: {
      deleteMode:
        'Всюди: видалення на будь-якій сторінці видаляє всі копії. Лише джерело: поширюються тільки видалення на сторінці-джерелі. Відвʼязати: видалення не поширюються. Запитати: вибір надходить шепотом.',
      hideMode:
        'Шар Майстра: копія переходить на шар Майстра. Видалити: копія видаляється і створюється знову під час показу, тож гравцям нічого знайти.',
      pairLeftovers:
        'Коли сторінка входить до групи або виправляється: запитати, скопіювати їх на інші сторінки чи залишити на своїй сторінці.',
      newObjects:
        'Дзеркалити: копіюються обʼєкти, створені на будь-якій сторінці. Лише джерело: копіюються тільки обʼєкти, створені на сторінці-джерелі.',
      localProps:
        'Властивості токенів, які кожна сторінка зберігає окремо, наприклад зір для одного гравця.',
      localPageSettings:
        'Налаштування, які кожна сторінка зберігає окремо, наприклад темрява для однієї групи гравців.',
      excludeLayers: 'Обʼєкти на цих шарах залишаються на своїй сторінці.',
      syncPageSettings:
        'Копіювати налаштування сторінки (освітлення, сітка, розмір…) між сторінками групи.',
      repairOnStart:
        'Під час запуску пісочниці: тихо виправити, виправити зі звітом або нічого не робити.',
      playerMenu: 'Лише Майстер або також гравці, щоб дізнатися, на якій вони сторінці.',
      recycleSize: 'Скільки видалень кожна група зберігає для скасування.',
      language: 'Мова меню, повідомлень і роздаткових матеріалів.',
    },
    options: {
      deleteMode: { all: 'Всюди', source: 'Лише джерело', unlink: 'Відвʼязати', ask: 'Запитати' },
      hideMode: { gmlayer: 'Шар Майстра', remove: 'Видалити' },
      pairLeftovers: { ask: 'Запитати', copy: 'Копіювати', leave: 'Залишити' },
      newObjects: { mirror: 'Дзеркалити', sourceOnly: 'Лише джерело' },
      localProps: {
        gmnotes: 'Нотатки Майстра',
        name: 'Імʼя',
        bars: 'Смуги',
        markers: 'Маркери',
        tint: 'Відтінок',
        aura: 'Аури',
        vision: 'Зір',
        light: 'Світло',
        controlledby: 'Хто керує',
      },
      localPageSettings: {
        lighting: 'Освітлення',
        daylight: 'Денне світло',
        explorer: 'Режим дослідника',
        fog: 'Туман',
        grid: 'Сітка',
        background: 'Тло',
        scale: 'Розмір і масштаб',
        jukebox: 'Музика',
      },
      excludeLayers: {
        map: 'Мапа',
        objects: 'Токени',
        gmlayer: 'Майстер',
        foreground: 'Передній план',
        walls: 'Стіни',
      },
      repairOnStart: { quiet: 'Тихо', report: 'Зі звітом', off: 'Вимк.' },
      playerMenu: { gm: 'Лише Майстер', players: 'І гравці' },
    },
    help: {
      menu: 'Відкрити меню.',
      groupCreate: 'Створити групу синхронізації з цієї сторінки.',
      groupAdd: 'Додати цю сторінку до групи: збіжні обʼєкти повʼязуються, відсутні копіюються.',
      groupRemove: 'Вивести цю сторінку з її групи. Обʼєкти залишаються без звʼязків.',
      groupShow: 'Показати картку групи.',
      groupRename: 'Перейменувати групу.',
      groupSource: 'Зробити цю сторінку джерелом групи (зразком для виправлень).',
      groupDelete: 'Видалити групу (з підтвердженням). Обʼєкти залишаються.',
      players:
        'Показати, хто на якій сторінці, з кнопками, щоб переміщувати гравців і приховувати чи показувати вибрані токени посторінково.',
      move: 'Перемістити одного гравця на сторінку (розділення загону).',
      moveAll: 'Перемістити всіх гравців групи на одну сторінку і запамʼятати, де вони були.',
      layout: 'Запамʼятати або повернути, на якій сторінці кожен гравець.',
      hide: 'Приховати копії вибраних обʼєктів: тут, на інших сторінках, всюди або на вказаних сторінках.',
      show: 'Знову показати приховані копії.',
      status: 'Показати звʼязки вибраних обʼєктів і де вони приховані.',
      unlink: 'Залишити вибрані обʼєкти лише на цій сторінці.',
      repair: 'Повернути копії у відповідність до сторінки-джерела. --dry-run лише звітує.',
      pause: 'Тимчасово зупинити дзеркалення групи.',
      resume: 'Знову дзеркалити; показує відмінності.',
      undo: 'Повернути останнє видалення.',
      recycle: 'Список видалень; будь-яке з них можна відновити.',
      settings: 'Показати налаштування: загальні або для однієї групи.',
      set: 'Змінити налаштування. Списки приймають +name або -name.',
      settingsReset: 'Повернути типові налаштування (з підтвердженням).',
      handouts: 'Створити заново роздаткові матеріали довідки та панелі команд.',
      help: 'Показати цей список.',
      ids: 'Діяти на ці обʼєкти замість вибраних.',
      page: 'Діяти на цю сторінку замість тієї, яку ви переглядаєте.',
      footer: 'Матеріал {help} пояснює все; у {deck} є кнопки.',
    },
    deck: {
      menuTitle: 'Меню',
      menuDesc: 'Головне меню, гравці та налаштування.',
      groupsTitle: 'Групи',
      groupsDesc: 'Створіть групу з поточної сторінки або додайте цю сторінку до групи.',
      selectedTitle: 'Вибрані обʼєкти',
      selectedDesc: 'Приховати чи показати копії вибраних обʼєктів.',
      toolsTitle: 'Інструменти',
      toolsDesc: 'Виправлення, скасування, пауза і роздаткові матеріали.',
      footer: 'Як працює SyncPage, читайте в {help}.',
    },
    handout: {
      versionLabel: 'Версія',
      subtitle: 'Повʼязані сторінки для розділеного загону',
      footer: 'Кнопки є в {deck}.',
      overview: {
        heading: 'Огляд',
        body: 'SyncPage тримає сторінки в узгодженому стані. Сторінки однієї групи синхронізації мають спільні токени, малюнки, стіни, двері, вікна, текст і налаштування сторінки: що змінюється на одній сторінці, змінюється й на інших. Завдяки розділенню загону в Roll20 ви ставите гравців на різні копії, а потім приховуєте чи показуєте щось на кожній копії окремо, і кожен гравець бачить лише те, що має бачити його персонаж.',
        why: 'Roll20 не вміє приховати обʼєкт на одній сторінці лише від частини гравців. Динамічне освітлення дає кожному токену власний зір, але не «цей NPC невидимий лише для пройдисвіта». Дзеркальні сторінки це вміють.',
      },
      quickStart: {
        heading: 'Швидкий старт',
        steps: [
          'Перейдіть на сторінку з мапою, введіть !syncpage і натисніть «Створити групу зі сторінки».',
          'Застосуйте до цієї сторінки «Дублювати сторінку» в Roll20 (меню картки сторінки). Так копіюється арт із крамниці, чого API не вміє.',
          'Перейдіть на копію і натисніть «Додати сторінку до групи». SyncPage повʼяже збіжні обʼєкти і скопіює відсутні.',
          'Відкрийте «Гравці», щоб перемістити гравців на копію, потім виберіть токени і приховайте їх на одній сторінці.',
        ],
      },
      mirroring: {
        heading: 'Що дзеркалиться',
        points: [
          'Токени (зокрема джерела світла Jumpgate), текст, малюнки Legacy і Jumpgate, стіни всіх видів, двері та вікна.',
          'Нові обʼєкти, зміни та видалення, в обидва боки. Видалення відбуваються згідно з налаштуванням «Коли обʼєкт видалено».',
          'Налаштування сторінки, як-от освітлення, сітка і розмір, якщо їх не вимкнено і не зберігають окремо для кожної сторінки.',
          'Шари можна виключити для групи, а властивості токенів, як-от зір, зберігати окремо для кожної сторінки.',
          'Зміни, які інші моди роблять через TokenMod, теж дзеркаляться. Інші моди можуть викликати SyncPage.notify; решту виловить виправлення.',
        ],
      },
      visibility: {
        heading: 'Приховування посторінково',
        points: [
          'Виберіть токени і скористайтеся «Приховати тут», «Приховати на інших» або сіткою на картці «Гравці».',
          'Приховується лише копія на цій сторінці. Зміни з інших сторінок ніколи не скасовують приховування.',
          'Режим «Шар Майстра» переносить копію на шар Майстра. Режим «Видалити» видаляє її і створює знову під час показу, тож гравцям нічого знайти на сторінці.',
        ],
      },
      players: {
        heading: 'Гравці',
        points: [
          'Картка «Гравці» показує кожного гравця і його сторінку, а також кнопку для кожної сторінки, щоб перемістити гравця (розділення загону).',
          '«Усі на» збирає гравців на одній сторінці і запамʼятовує, де вони були; «Повернути розстановку» повертає їх назад.',
        ],
      },
      repair: {
        heading: 'Виправлення',
        points: [
          'Виправлення повертає копії у відповідність до сторінки-джерела: зміщені властивості, відсутні копії, обʼєкти, видалені чи створені, поки SyncPage не стежив.',
          '«Попередній перегляд» показує, що зміниться, нічого не змінюючи. Якщо виправлення зачепить багато обʼєктів, спершу буде запитання.',
          'Виправлення тихо виконується під час запуску пісочниці (налаштування). ID обʼєктів не змінюються, на відміну від 0.1.',
        ],
      },
      memory: {
        heading: 'Що SyncPage запамʼятовує',
        points: [
          'Кошик для кожної групи: будь-яке поширене видалення і будь-яке прибирання можна повернути кнопкою «Скасувати».',
          'Де був кожен гравець, щоб розділення можна було відновити.',
          'Останню використану групу, останнє виправлення та його результати.',
          'Кнопки, яким потрібні дані, мають короткий код; вони спрацьовують один раз і стають недійсними через 10 хвилин.',
        ],
      },
      commands: {
        heading: 'Команди',
        intro: 'Лише для Майстра. Працює і !sync.',
        colCommand: 'Команда',
        colDesc: 'Що робить',
      },
      settings: {
        heading: 'Налаштування',
        intro:
          'Змінюйте налаштування на картці налаштувань або командою !syncpage set. Налаштування групи можна змінити для однієї групи на її картці.',
        colKey: 'Ключ',
        colName: 'Налаштування',
        colDesc: 'Значення',
        colScope: 'Область',
        scopeGroup: 'Для групи',
        scopeGlobal: 'Загальне',
      },
      api: {
        heading: 'Для інших модів',
        intro: 'Глобальний обʼєкт SyncPage:',
        colFunction: 'Функція',
        colDesc: 'Що робить',
        rows: {
          getGroup: 'Група, до якої належить сторінка: id, назва, джерело і сторінки.',
          getLinked: 'Повʼязані копії обʼєкта за сторінками.',
          notify: 'Дзеркалити зміну, зроблену вашим модом (зміни через API не викликають подій).',
          isHidden: 'Чи прихована копія обʼєкта на сторінці.',
          onSync: 'Отримувати сповіщення про кожне дзеркальне створення, зміну і видалення.',
          repair: 'Виправити групу; { dryRun: true } лише підраховує.',
        },
      },
      upgrading: {
        heading: 'Перехід із 0.1',
        points: [
          'Сторінка, чия назва закінчується на "_synced", входить до групи зі сторінкою з тією самою назвою без цього закінчення, і та стає джерелом. Потім сторінки можна перейменувати.',
          'Старі звʼязки зберігаються; усе інше повʼязується за положенням і зображенням.',
          'Позначки Show/Hide у нотатках Майстра стають прихованими копіями, а текст позначки видаляється з нотаток Майстра.',
          'Власна команда зі старої конфігурації й далі працює. «True Copy» більше немає: скористайтеся «Дублювати сторінку».',
        ],
      },
      troubleshooting: {
        heading: 'Розвʼязання проблем',
        points: [
          'Токен скопійовано з неправильним зображенням: API не може копіювати арт із крамниці. Зробіть копію через «Дублювати сторінку» і додайте її до групи.',
          'Копії розійшлися після змін іншого мода: запустіть виправлення або попросіть автора цього мода викликати SyncPage.notify.',
          'Хочете навмисно переставити щось на одній копії? Поставте групу на паузу, внесіть зміни, потім натисніть «Продовжити» і відмовтеся від виправлення.',
        ],
      },
      languages: {
        heading: 'Мови',
        body: 'Мову вибирають на картці налаштувань. Меню, повідомлення і ці матеріали відповідають їй.',
        colLanguage: 'Мова',
        colNative: 'Власна назва',
        colCode: 'Код',
      },
      credits: {
        heading: 'Автори',
        original: 'Автор оригінального мода:',
        maintainer: 'Переписав і супроводжує:',
        support: 'Повідомляйте про проблеми на форумі Roll20 або на GitHub.',
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

  // Persistent state: state.SyncPage. Settings, sync groups (pages, links,
  // hidden copies, player layout, recycle bin, repair log), each GM's last
  // choices, pending button requests and one-time notices.

  /**
   * @typedef {object} Link
   * @property {string} type Roll20 object type.
   * @property {Record<string, string>} objects Object ID by page ID.
   * @property {string} [print] Fingerprint of the source object when last matched.
   */

  /**
   * @typedef {object} Group
   * @property {string} id Group ID.
   * @property {string} name Name the GM gave it.
   * @property {string} source Source page ID (the reference for repair).
   * @property {string[]} pages Page IDs, source first.
   * @property {object} overrides Settings changed for this group only.
   * @property {Record<string, Link>} links Linked objects by link ID.
   * @property {Record<string, Record<string, {layer: string, snapshot?: object}>>} hidden
   *   Hidden copies: by link ID, then page ID.
   * @property {Record<string, string>} layout Remembered page for each player.
   * @property {object[]} recycle Snapshots of removed objects, newest first.
   * @property {object|null} repairLog The last repair.
   * @property {string[]} pageOnly Objects the GM chose to keep on one page.
   * @property {boolean} paused True while mirroring is paused.
   */

  /**
   * Returns the default value of every setting.
   *
   * @returns {object} Settings.
   */
  function defaultSettings() {
    const out = {};
    for (const s of SETTINGS) {
      out[s.key] = Array.isArray(s.default) ? [...s.default] : s.default;
    }
    return out;
  }

  /**
   * Returns a fresh, empty state.
   *
   * @returns {object} State.
   */
  function createDefaultState() {
    return {
      schemaVersion: SCHEMA_VERSION,
      version: SCRIPT_VERSION,
      settings: defaultSettings(),
      groups: {},
      gm: {},
      requests: {},
      aliases: [],
      notices: { useroptions: {}, migrated: false, trueCopy: false },
    };
  }

  /**
   * Returns the setting definition for a key.
   *
   * @param {string} key Setting key.
   * @returns {object|undefined} Definition.
   */
  function settingDef(key) {
    return SETTINGS.find((s) => s.key === key);
  }

  /**
   * Finds a setting key, ignoring case.
   *
   * @param {string} raw Typed key.
   * @returns {string|null} Key, or null when unknown.
   */
  function findSettingKey(raw) {
    const text = toText(raw).toLowerCase();
    return SETTINGS.find((s) => s.key.toLowerCase() === text)?.key || null;
  }

  /**
   * Checks and converts a setting value.
   *
   * @param {object} def Setting definition.
   * @param {*} raw Raw value. For multi settings, a list (`a,b`), or changes to
   *   `current` such as `+vision -gmnotes`.
   * @param {*} [current] Current value, for multi-setting changes.
   * @returns {{ok: boolean, value?: *}} Result.
   */
  function normaliseSetting(def, raw, current) {
    if (!def) {
      return { ok: false };
    }
    if (def.type === 'boolean') {
      const value = parseBoolean(raw);
      return value === null ? { ok: false } : { ok: true, value };
    }
    if (def.type === 'number') {
      const n = toNumber(raw);
      return n === null
        ? { ok: false }
        : { ok: true, value: clamp(Math.round(n), def.min, def.max) };
    }
    if (def.type === 'locale') {
      const value = normalizeLocale(toText(raw));
      return value ? { ok: true, value } : { ok: false };
    }
    if (def.type === 'choice') {
      const text = toText(raw).toLowerCase();
      const value = def.options.find((o) => o.toLowerCase() === text);
      return value ? { ok: true, value } : { ok: false };
    }
    if (def.type === 'multi') {
      const words = Array.isArray(raw)
        ? raw.map(toText)
        : toText(raw)
            .split(/[\s,]+/)
            .filter(Boolean);
      const find = (w) => def.options.find((o) => o.toLowerCase() === w.toLowerCase());
      const relative = words.length > 0 && words.every((w) => /^[+-]/.test(w));
      if (words.length === 1 && ['none', '-', 'clear'].includes(words[0].toLowerCase())) {
        return { ok: true, value: [] };
      }
      const set = new Set(relative && Array.isArray(current) ? current : []);
      for (const w of words) {
        const name = find(w.replace(/^[+-]/, ''));
        if (!name) {
          return { ok: false };
        }
        if (w.startsWith('-')) {
          set.delete(name);
        } else {
          set.add(name);
        }
      }
      return { ok: true, value: def.options.filter((o) => set.has(o)) };
    }
    return { ok: false };
  }

  /**
   * Cleans a stored settings object, keeping only valid values.
   *
   * @param {*} raw Stored settings.
   * @param {boolean} [partial=false] Keep only keys present (group overrides).
   * @returns {object} Clean settings.
   */
  function cleanSettings(raw, partial = false) {
    const src = isRecord(raw) ? raw : {};
    const out = partial ? {} : defaultSettings();
    for (const def of SETTINGS) {
      if (!(def.key in src)) {
        continue;
      }
      if (partial && def.scope !== 'group') {
        continue;
      }
      const result = normaliseSetting(def, src[def.key]);
      if (result.ok) {
        out[def.key] = result.value;
      }
    }
    return out;
  }

  /**
   * Cleans one stored group.
   *
   * @param {string} id Group ID.
   * @param {*} raw Stored group.
   * @returns {Group|null} Clean group, or null when it is not usable.
   */
  function cleanGroup(id, raw) {
    if (!isRecord(raw)) {
      return null;
    }
    const pages = Array.isArray(raw.pages)
      ? [...new Set(raw.pages.map(toText).filter(Boolean))]
      : [];
    const source = pages.includes(raw.source) ? raw.source : pages[0];
    if (!source) {
      return null;
    }
    const links = {};
    for (const [linkId, link] of Object.entries(isRecord(raw.links) ? raw.links : {})) {
      if (!isRecord(link) || !SYNC_TYPES.includes(link.type) || !isRecord(link.objects)) {
        continue;
      }
      const objects = {};
      for (const [pageId, objId] of Object.entries(link.objects)) {
        if (pages.includes(pageId) && toText(objId)) {
          objects[pageId] = toText(objId);
        }
      }
      links[linkId] = {
        type: link.type,
        objects,
        ...(link.print ? { print: toText(link.print) } : {}),
      };
    }
    const hidden = {};
    for (const [linkId, byPage] of Object.entries(isRecord(raw.hidden) ? raw.hidden : {})) {
      if (!links[linkId] || !isRecord(byPage)) {
        continue;
      }
      for (const [pageId, h] of Object.entries(byPage)) {
        if (!pages.includes(pageId) || !isRecord(h)) {
          continue;
        }
        hidden[linkId] = hidden[linkId] || {};
        hidden[linkId][pageId] = {
          layer: LAYERS.includes(h.layer) ? h.layer : 'objects',
          ...(isRecord(h.snapshot) ? { snapshot: h.snapshot } : {}),
        };
      }
    }
    const layout = {};
    for (const [playerId, pageId] of Object.entries(isRecord(raw.layout) ? raw.layout : {})) {
      if (toText(pageId)) {
        layout[playerId] = toText(pageId);
      }
    }
    return {
      id,
      name: toText(raw.name) || id,
      source,
      pages: [source, ...pages.filter((p) => p !== source)],
      overrides: cleanSettings(raw.overrides, true),
      links,
      hidden,
      layout,
      recycle: Array.isArray(raw.recycle) ? raw.recycle.filter(isRecord) : [],
      repairLog: isRecord(raw.repairLog) ? raw.repairLog : null,
      pageOnly: Array.isArray(raw.pageOnly)
        ? [...new Set(raw.pageOnly.map(toText).filter(Boolean))]
        : [],
      paused: raw.paused === true,
    };
  }

  /**
   * Coerces a stored state into the current shape, filling defaults. Runs after
   * any stepped schema migration, so a hand-edited or half-written state still
   * loads.
   *
   * @param {*} raw Stored state.
   * @returns {object} Clean state.
   */
  function cleanState(raw) {
    const src = isRecord(raw) ? raw : {};
    const base = createDefaultState();
    const groups = {};
    for (const [id, g] of Object.entries(isRecord(src.groups) ? src.groups : {})) {
      const clean = cleanGroup(id, g);
      if (clean) {
        groups[id] = clean;
      }
    }
    const gm = {};
    for (const [playerId, rec] of Object.entries(isRecord(src.gm) ? src.gm : {})) {
      if (isRecord(rec)) {
        gm[playerId] = {
          lastGroup: toText(rec.lastGroup) || null,
          lastPages: Array.isArray(rec.lastPages) ? rec.lastPages.map(toText).filter(Boolean) : [],
        };
      }
    }
    const requests = {};
    for (const [id, r] of Object.entries(isRecord(src.requests) ? src.requests : {})) {
      if (isRecord(r) && toText(r.kind) && Number.isFinite(r.at)) {
        requests[id] = { kind: r.kind, gm: toText(r.gm), at: r.at, payload: r.payload ?? null };
      }
    }
    const notices = isRecord(src.notices) ? src.notices : {};
    return {
      ...base,
      settings: cleanSettings(src.settings),
      groups,
      gm,
      requests,
      aliases: Array.isArray(src.aliases)
        ? src.aliases.map((a) => toText(a).toLowerCase()).filter((a) => /^![a-z0-9_-]+$/.test(a))
        : [],
      notices: {
        useroptions: isRecord(notices.useroptions) ? notices.useroptions : {},
        migrated: notices.migrated === true,
        trueCopy: notices.trueCopy === true,
      },
    };
  }

  /**
   * Returns the live state, creating it when missing.
   *
   * @returns {object} State.
   */
  function getState() {
    if (!isRecord(state[STATE_KEY])) {
      state[STATE_KEY] = createDefaultState();
    }
    return state[STATE_KEY];
  }

  /**
   * Loads and cleans the state on start.
   *
   * @returns {{fresh: boolean}} Whether this is a new install.
   */
  function initialiseState() {
    const fresh = !isRecord(state[STATE_KEY]);
    state[STATE_KEY] = cleanState(state[STATE_KEY]);
    state[STATE_KEY].schemaVersion = SCHEMA_VERSION;
    state[STATE_KEY].version = SCRIPT_VERSION;
    return { fresh };
  }

  /**
   * Returns the GM-facing language.
   *
   * @returns {string} Locale code.
   */
  function getLang() {
    return getLocale(getState().settings.language);
  }

  /**
   * Returns a setting's value, using the group's override when there is one.
   *
   * @param {string} key Setting key.
   * @param {Group|string|null} [group] Group or group ID.
   * @returns {*} Value.
   */
  function getSetting(key, group) {
    const s = getState();
    const g = typeof group === 'string' ? s.groups[group] : group;
    if (g && isRecord(g.overrides) && key in g.overrides) {
      return g.overrides[key];
    }
    if (key in s.settings) {
      return s.settings[key];
    }
    return settingDef(key)?.default;
  }

  /**
   * Changes a setting globally or for one group.
   *
   * @param {string} key Setting key.
   * @param {*} raw Raw value; `default` clears a group override.
   * @param {Group|null} [group] Group, for a group override.
   * @returns {{ok: boolean, value?: *, cleared?: boolean, reason?: string}} Result.
   */
  function setSetting(key, raw, group = null) {
    const def = settingDef(key);
    if (!def) {
      return { ok: false, reason: 'unknownSetting' };
    }
    if (group && def.scope !== 'group') {
      return { ok: false, reason: 'globalOnly' };
    }
    if (group && ['default', 'global', 'inherit'].includes(toText(raw).toLowerCase())) {
      delete group.overrides[key];
      return { ok: true, cleared: true, value: getSetting(key) };
    }
    const result = normaliseSetting(def, raw, getSetting(key, group));
    if (!result.ok) {
      return { ok: false, reason: 'badValue' };
    }
    if (group) {
      group.overrides[key] = result.value;
    } else {
      getState().settings[key] = result.value;
    }
    return { ok: true, value: result.value };
  }

  /**
   * Restores every setting to its default, globally or for one group.
   *
   * @param {Group|null} [group] Group.
   * @returns {void}
   */
  function resetSettings(group = null) {
    if (group) {
      group.overrides = {};
    } else {
      getState().settings = { ...defaultSettings(), language: getState().settings.language };
    }
  }

  /**
   * Finds the One-Click useroptions branch for this Mod. Roll20 keys it by the
   * script name.
   *
   * @returns {object|null} The options, or null when there are none.
   */
  function oneClickOptions() {
    if (typeof globalconfig === 'undefined' || !isRecord(globalconfig)) {
      return null;
    }
    const key = Object.keys(globalconfig).find(
      (k) => k.toLowerCase().replaceAll(/[^a-z]/g, '') === 'syncpage'
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
    const applied = s.notices.useroptions;
    const changed = [];
    for (const def of SETTINGS) {
      if (!(def.key in options)) {
        continue;
      }
      // An unticked checkbox arrives as false; multi settings arrive as text.
      let raw = options[def.key];
      if (raw === false && def.type === 'boolean') {
        raw = 'off';
      }
      if (def.type === 'multi') {
        raw = splitList(raw).join(',') || 'none';
      }
      if (raw === applied[def.key]) {
        continue;
      }
      applied[def.key] = raw;
      if (setSetting(def.key, raw).ok) {
        changed.push(def.key);
      }
    }
    return changed;
  }

  /**
   * Returns a GM's remembered choices, creating the record.
   *
   * @param {string} playerId Player ID.
   * @returns {{lastGroup: string|null, lastPages: string[]}} Record.
   */
  function gmMemory(playerId) {
    const s = getState();
    if (!isRecord(s.gm[playerId])) {
      s.gm[playerId] = { lastGroup: null, lastPages: [] };
    }
    return s.gm[playerId];
  }

  // Sync groups: which pages are kept in step, and which objects are linked.
  // A reverse index (object ID → group and link) is rebuilt on start and kept
  // up to date, so an event only ever touches its own link.

  /** @type {Map<string, {groupId: string, linkId: string}>} */
  const index = new Map();

  /**
   * Returns every group.
   *
   * @returns {object[]} Groups, by name.
   */
  function listGroups() {
    return Object.values(getState().groups).sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Rebuilds the reverse index from state.
   *
   * @returns {void}
   */
  function rebuildIndex() {
    index.clear();
    for (const group of Object.values(getState().groups)) {
      for (const [linkId, link] of Object.entries(group.links)) {
        for (const objId of Object.values(link.objects)) {
          index.set(objId, { groupId: group.id, linkId });
        }
      }
    }
  }

  /**
   * Returns the group a page belongs to.
   *
   * @param {string} pageId Page ID.
   * @returns {object|null} Group.
   */
  function groupOfPage(pageId) {
    if (!pageId) {
      return null;
    }
    return Object.values(getState().groups).find((g) => g.pages.includes(pageId)) || null;
  }

  /**
   * Finds a group by ID or name (ignoring case).
   *
   * @param {string} ref ID or name.
   * @returns {object|null} Group.
   */
  function findGroup(ref) {
    const text = toText(ref);
    if (!text) {
      return null;
    }
    const groups = getState().groups;
    if (groups[text]) {
      return groups[text];
    }
    const lower = text.toLowerCase();
    return Object.values(groups).find((g) => g.name.toLowerCase() === lower) || null;
  }

  /**
   * Returns a page's name.
   *
   * @param {string} pageId Page ID.
   * @returns {string} Name, or the ID when the page is gone.
   */
  function pageName(pageId) {
    const page = getObj('page', pageId);
    return page ? toText(page.get('name')) || pageId : pageId;
  }

  /**
   * Finds a page by ID or name (ignoring case), optionally within a group.
   *
   * @param {string} ref ID or name.
   * @param {object} [group] Only look at this group's pages.
   * @returns {string|null} Page ID.
   */
  function findPage(ref, group) {
    const text = toText(ref);
    if (!text) {
      return null;
    }
    const ids = group ? group.pages : findObjs({ _type: 'page' }).map((p) => p.id);
    if (ids.includes(text)) {
      return text;
    }
    const lower = text.toLowerCase();
    return ids.find((id) => pageName(id).toLowerCase() === lower) || null;
  }

  /**
   * Makes a new group from a source page.
   *
   * @param {string} name Group name.
   * @param {string} sourcePageId Source page ID.
   * @returns {object} The group.
   */
  function createGroup(name, sourcePageId) {
    const id = makeId('g');
    const group = {
      id,
      name: toText(name) || pageName(sourcePageId),
      source: sourcePageId,
      pages: [sourcePageId],
      overrides: {},
      links: {},
      hidden: {},
      layout: {},
      recycle: [],
      repairLog: null,
      pageOnly: [],
      paused: false,
    };
    getState().groups[id] = group;
    return group;
  }

  /**
   * Removes a group. Objects stay on their pages, unlinked.
   *
   * @param {object} group Group.
   * @returns {void}
   */
  function deleteGroup(group) {
    for (const link of Object.values(group.links)) {
      for (const objId of Object.values(link.objects)) {
        index.delete(objId);
      }
    }
    delete getState().groups[group.id];
  }

  /**
   * Makes a new link.
   *
   * @param {object} group Group.
   * @param {string} type Object type.
   * @param {Record<string, string>} objects Object ID by page ID.
   * @param {string} [print] Fingerprint.
   * @returns {string} Link ID.
   */
  function newLink(group, type, objects, print) {
    const linkId = makeId('l');
    group.links[linkId] = { type, objects: { ...objects }, ...(print ? { print } : {}) };
    for (const objId of Object.values(objects)) {
      index.set(objId, { groupId: group.id, linkId });
      unmarkPageOnly(group, objId);
    }
    return linkId;
  }

  /**
   * Returns the link an object belongs to.
   *
   * @param {string} objId Object ID.
   * @returns {{group: object, linkId: string, link: object}|null} Link.
   */
  function linkOf(objId) {
    const entry = index.get(objId);
    if (!entry) {
      return null;
    }
    const group = getState().groups[entry.groupId];
    const link = group?.links[entry.linkId];
    if (!link) {
      index.delete(objId);
      return null;
    }
    return { group, linkId: entry.linkId, link };
  }

  /**
   * Puts an object into a link on a page (replacing any object there).
   *
   * @param {object} group Group.
   * @param {string} linkId Link ID.
   * @param {string} pageId Page ID.
   * @param {string} objId Object ID.
   * @returns {void}
   */
  function setLinkObject(group, linkId, pageId, objId) {
    const link = group.links[linkId];
    if (!link) {
      return;
    }
    const old = link.objects[pageId];
    if (old && old !== objId) {
      index.delete(old);
    }
    link.objects[pageId] = objId;
    index.set(objId, { groupId: group.id, linkId });
    unmarkPageOnly(group, objId);
  }

  /**
   * Takes a page's object out of a link. Drops the link when nothing is left.
   *
   * @param {object} group Group.
   * @param {string} linkId Link ID.
   * @param {string} pageId Page ID.
   * @returns {void}
   */
  function unlinkPage(group, linkId, pageId) {
    const link = group.links[linkId];
    if (!link) {
      return;
    }
    const objId = link.objects[pageId];
    if (objId) {
      index.delete(objId);
    }
    delete link.objects[pageId];
    if (group.hidden[linkId]) {
      delete group.hidden[linkId][pageId];
      if (Object.keys(group.hidden[linkId]).length === 0) {
        delete group.hidden[linkId];
      }
    }
    if (Object.keys(link.objects).length === 0 && !group.hidden[linkId]) {
      delete group.links[linkId];
    }
  }

  /**
   * Drops a whole link. Its objects stay, unlinked.
   *
   * @param {object} group Group.
   * @param {string} linkId Link ID.
   * @returns {void}
   */
  function dropLink(group, linkId) {
    const link = group.links[linkId];
    if (!link) {
      return;
    }
    for (const objId of Object.values(link.objects)) {
      index.delete(objId);
    }
    delete group.links[linkId];
    delete group.hidden[linkId];
  }

  /**
   * Adds a page to a group.
   *
   * @param {object} group Group.
   * @param {string} pageId Page ID.
   * @returns {void}
   */
  function addPage(group, pageId) {
    if (!group.pages.includes(pageId)) {
      group.pages.push(pageId);
    }
  }

  /**
   * Takes a page out of a group. Its objects stay, unlinked. When the source
   * goes, the next page becomes the source; a group with no pages left is
   * deleted.
   *
   * @param {object} group Group.
   * @param {string} pageId Page ID.
   * @returns {boolean} True when the group still exists.
   */
  function removePage(group, pageId) {
    for (const linkId of Object.keys(group.links)) {
      unlinkPage(group, linkId, pageId);
    }
    group.pages = group.pages.filter((p) => p !== pageId);
    for (const [playerId, p] of Object.entries(group.layout)) {
      if (p === pageId) {
        delete group.layout[playerId];
      }
    }
    if (group.pages.length === 0) {
      deleteGroup(group);
      return false;
    }
    if (group.source === pageId) {
      group.source = group.pages[0];
    }
    // A link left with one object no longer joins anything, but it is kept: a
    // page added later gets a copy.
    return true;
  }

  /**
   * Makes a page the group's source.
   *
   * @param {object} group Group.
   * @param {string} pageId Page ID.
   * @returns {void}
   */
  function setSource(group, pageId) {
    if (group.pages.includes(pageId)) {
      group.source = pageId;
      group.pages = [pageId, ...group.pages.filter((p) => p !== pageId)];
    }
  }

  /**
   * Marks an object as kept on its own page (never copied, never asked about).
   *
   * @param {object} group Group.
   * @param {string} objId Object ID.
   * @returns {void}
   */
  function markPageOnly(group, objId) {
    if (!group.pageOnly.includes(objId)) {
      group.pageOnly.push(objId);
    }
  }

  /**
   * Clears the page-only mark.
   *
   * @param {object} group Group.
   * @param {string} objId Object ID.
   * @returns {void}
   */
  function unmarkPageOnly(group, objId) {
    const i = group.pageOnly.indexOf(objId);
    if (i >= 0) {
      group.pageOnly.splice(i, 1);
    }
  }

  /**
   * Returns every synced-type object on a page.
   *
   * @param {string} pageId Page ID.
   * @returns {object[]} Objects.
   */
  function objectsOnPage(pageId) {
    const out = [];
    for (const type of SYNC_TYPES) {
      out.push(...findObjs({ _type: type, _pageid: pageId }));
    }
    return out;
  }

  /**
   * Finds a synced-type object by ID without knowing its type.
   *
   * @param {string} id Object ID.
   * @param {string} [type] Type, when known.
   * @returns {object|undefined} Object.
   */
  function findAny(id, type) {
    if (type) {
      return getObj(type, id);
    }
    for (const t of SYNC_TYPES) {
      const obj = getObj(t, id);
      if (obj) {
        return obj;
      }
    }
    return undefined;
  }

  /**
   * Drops index entries, links, layouts and page-only marks that point at
   * objects, pages or players that no longer exist.
   *
   * @returns {{links: number, pages: number}} What was removed.
   */
  function prune() {
    const removed = { links: 0, pages: 0 };
    for (const group of Object.values(getState().groups)) {
      for (const pageId of [...group.pages]) {
        if (!getObj('page', pageId)) {
          removed.pages += 1;
          if (!removePage(group, pageId)) {
            break;
          }
        }
      }
      if (!getState().groups[group.id]) {
        continue;
      }
      for (const [linkId, link] of Object.entries(group.links)) {
        for (const [pageId, objId] of Object.entries(link.objects)) {
          if (!getObj(link.type, objId)) {
            // A copy hidden by removal has no object on purpose.
            if (group.hidden[linkId]?.[pageId]?.snapshot) {
              continue;
            }
            delete link.objects[pageId];
            index.delete(objId);
          }
        }
        if (Object.keys(link.objects).length === 0 && !group.hidden[linkId]) {
          delete group.links[linkId];
          removed.links += 1;
        }
      }
      group.pageOnly = group.pageOnly.filter((id) => findAny(id));
      for (const playerId of Object.keys(group.layout)) {
        if (!getObj('player', playerId)) {
          delete group.layout[playerId];
        }
      }
    }
    rebuildIndex();
    return removed;
  }

  // Players and pages: who is on which page, moving players with split party
  // (playerspecificpages), and each group's remembered layout.

  /**
   * Returns the split-party map. Roll20 gives `false` when no one is split.
   *
   * @returns {Record<string, string>} Page ID by player ID.
   */
  function readSplit() {
    const raw = Campaign().get('playerspecificpages');
    if (isRecord(raw)) {
      return { ...raw };
    }
    if (typeof raw === 'string' && raw.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(raw);
        return isRecord(parsed) ? parsed : {};
      } catch {
        return {};
      }
    }
    return {};
  }

  /**
   * Writes the split-party map. It is cleared first, so Roll20 sees the change.
   *
   * @param {Record<string, string>} split Page ID by player ID.
   * @returns {void}
   */
  function writeSplit(split) {
    Campaign().set('playerspecificpages', false);
    if (Object.keys(split).length) {
      Campaign().set('playerspecificpages', split);
    }
  }

  /**
   * Returns the players who are not GMs.
   *
   * @returns {object[]} Players, by name.
   */
  function listPlayers() {
    return findObjs({ _type: 'player' })
      .filter((p) => !playerIsGM(p.id))
      .sort((a, b) => toText(a.get('displayname')).localeCompare(toText(b.get('displayname'))));
  }

  /**
   * Returns the page a player is on.
   *
   * @param {string} playerId Player ID.
   * @returns {string} Page ID.
   */
  function pageOfPlayer(playerId) {
    return readSplit()[playerId] || Campaign().get('playerpageid');
  }

  /**
   * Moves one player to a page.
   *
   * @param {string} playerId Player ID.
   * @param {string} pageId Page ID.
   * @returns {void}
   */
  function movePlayer(playerId, pageId) {
    const split = readSplit();
    if (pageId === Campaign().get('playerpageid')) {
      delete split[playerId];
    } else {
      split[playerId] = pageId;
    }
    writeSplit(split);
  }

  /**
   * Moves several players at once.
   *
   * @param {Record<string, string>} moves Page ID by player ID.
   * @returns {void}
   */
  function movePlayers(moves) {
    const split = readSplit();
    const ribbon = Campaign().get('playerpageid');
    for (const [playerId, pageId] of Object.entries(moves)) {
      if (pageId === ribbon) {
        delete split[playerId];
      } else {
        split[playerId] = pageId;
      }
    }
    writeSplit(split);
  }

  /**
   * Returns the players on each of a group's pages.
   *
   * @param {object} group Group.
   * @returns {Record<string, object[]>} Players by page ID.
   */
  function playersByPage(group) {
    const out = Object.fromEntries(group.pages.map((p) => [p, []]));
    for (const player of listPlayers()) {
      const page = pageOfPlayer(player.id);
      if (out[page]) {
        out[page].push(player);
      }
    }
    return out;
  }

  /**
   * Remembers where the group's players are now.
   *
   * @param {object} group Group.
   * @returns {number} Players remembered.
   */
  function saveLayout(group) {
    group.layout = {};
    for (const [pageId, players] of Object.entries(playersByPage(group))) {
      for (const player of players) {
        group.layout[player.id] = pageId;
      }
    }
    return Object.keys(group.layout).length;
  }

  /**
   * Puts players back where the group remembered them.
   *
   * @param {object} group Group.
   * @returns {number} Players moved.
   */
  function restoreLayout(group) {
    const moves = {};
    for (const [playerId, pageId] of Object.entries(group.layout)) {
      if (group.pages.includes(pageId) && getObj('player', playerId)) {
        moves[playerId] = pageId;
      }
    }
    if (Object.keys(moves).length) {
      movePlayers(moves);
    }
    return Object.keys(moves).length;
  }

  /**
   * Moves every player on the group's pages to one page, remembering the
   * layout first (unless everyone is already on that page).
   *
   * @param {object} group Group.
   * @param {string} pageId Page ID.
   * @returns {number} Players moved.
   */
  function gatherPlayers(group, pageId) {
    const byPage = playersByPage(group);
    // Remember the layout unless everyone is already there (that would forget it).
    const someoneMoves = Object.entries(byPage).some(([p, list]) => p !== pageId && list.length);
    if (someoneMoves) {
      saveLayout(group);
    }
    const moves = {};
    for (const players of Object.values(byPage)) {
      for (const player of players) {
        moves[player.id] = pageId;
      }
    }
    movePlayers(moves);
    return Object.keys(moves).length;
  }

  // Echo guard. SyncPage's own set() calls raise no events for graphics and
  // text, but doors and pages come back from the client about a second later
  // as change events. Every write is recorded with the values written; an event
  // whose changed values all match a recorded write is SyncPage's own echo.

  /** @type {Map<string, {until: number, props: Record<string, *>}>} */
  const writes = new Map();
  /** @type {Map<string, number>} */
  const removals = new Map();

  /**
   * Drops records that are too old.
   *
   * @returns {void}
   */
  function expire() {
    const now = Date.now();
    for (const [id, w] of writes) {
      if (w.until < now) {
        writes.delete(id);
      }
    }
    for (const [id, until] of removals) {
      if (until < now) {
        removals.delete(id);
      }
    }
  }

  /**
   * Records values SyncPage is writing to an object.
   *
   * @param {string} id Object ID.
   * @param {Record<string, *>} props Properties written.
   * @returns {void}
   */
  function expectWrite(id, props) {
    expire();
    const w = writes.get(id) || { until: 0, props: {} };
    Object.assign(w.props, props);
    w.until = Date.now() + ECHO_TTL_MS;
    writes.set(id, w);
  }

  /**
   * Records that SyncPage is removing an object.
   *
   * @param {string} id Object ID.
   * @returns {void}
   */
  function expectRemove(id) {
    expire();
    removals.set(id, Date.now() + ECHO_TTL_MS);
  }

  /**
   * Returns true (once) when a destroy event is SyncPage's own removal.
   *
   * @param {string} id Object ID.
   * @returns {boolean} True for an own removal.
   */
  function isOwnRemoval(id) {
    expire();
    if (removals.has(id)) {
      removals.delete(id);
      return true;
    }
    return false;
  }

  /**
   * Removes the keys of a change that SyncPage itself wrote.
   *
   * @param {object} obj Changed object.
   * @param {string[]} keys Changed keys.
   * @returns {string[]} Keys changed by someone else.
   */
  function filterEcho(obj, keys) {
    expire();
    const w = writes.get(obj.id);
    if (!w) {
      return keys;
    }
    const left = [];
    for (const key of keys) {
      if (key in w.props && sameValue(obj.get(key), w.props[key])) {
        continue;
      }
      // Someone changed it again: it is theirs now.
      delete w.props[key];
      left.push(key);
    }
    return left;
  }

  // Reading, writing and creating copies of objects.

  /**
   * Cleans an image URL for createObj. Roll20 only accepts its own library
   * images, as the `thumb` size; marketplace images cannot be used at all.
   *
   * @param {*} url Image URL.
   * @returns {{url: string, ok: boolean}} Clean URL, and whether the API can use it.
   */
  function cleanImgsrc(url) {
    const text = toText(url);
    if (!text) {
      return { url: '', ok: false };
    }
    if (/\/marketplace\//i.test(text)) {
      return { url: text, ok: false };
    }
    if (text.startsWith('/')) {
      // Roll20's own pictures, such as the Jumpgate light's torch.
      return { url: text, ok: true };
    }
    const m = text.match(/^(.*\/images\/.*\/)(thumb|med|original|max)(\.[a-z0-9]+)(\?.*)?$/i);
    if (m) {
      return { url: `${m[1]}thumb${m[3]}${m[4] || `?${Date.now()}`}`, ok: true };
    }
    return { url: text, ok: /files\.d20\.io\/images\//i.test(text) };
  }

  /**
   * Returns an image's identity: its path without the size word or query.
   *
   * @param {*} url Image URL.
   * @returns {string} Identity.
   */
  function imageKey(url) {
    return toText(url)
      .replace(/\?.*$/, '')
      .replace(/\/(thumb|med|original|max)(\.[a-z0-9]+)$/i, '/$2');
  }

  /**
   * Reads an object's copyable properties.
   *
   * @param {object} obj Roll20 object.
   * @returns {object} Properties (no IDs, no read-only keys).
   */
  function readProps(obj) {
    const json = obj.toJSON ? obj.toJSON() : obj;
    const props = {};
    for (const [key, value] of Object.entries(json)) {
      if (key.startsWith('_') || NEVER_SYNC_KEYS.includes(key)) {
        continue;
      }
      props[key] = value;
    }
    // A Legacy path's shape reads back as the read-only _path but is written as path.
    if (json._type === 'path' && json._path !== undefined) {
      props.path = json._path;
    }
    return props;
  }

  /**
   * Returns the property keys a group keeps per page.
   *
   * @param {object} group Group.
   * @returns {string[]} Key list (entries ending in * match by start).
   */
  function localKeys(group) {
    const sets = getSetting('localProps', group) || [];
    return sets.flatMap((name) => PROP_SETS[name] || []);
  }

  /**
   * Picks the properties to mirror from a set of changed keys.
   *
   * @param {object} obj Changed object.
   * @param {string[]} keys Changed keys.
   * @param {object} group Group.
   * @returns {object} Properties to write to the copies.
   */
  function syncableChanges(obj, keys, group) {
    const local = localKeys(group);
    const type = obj.get('_type');
    const out = {};
    for (const key of keys) {
      if (key.startsWith('_') || NEVER_SYNC_KEYS.includes(key) || keyInList(key, local)) {
        continue;
      }
      if (type === 'graphic' && key === 'imgsrc') {
        const img = cleanImgsrc(obj.get('imgsrc'));
        if (!img.ok) {
          continue;
        }
        out.imgsrc = img.url;
        continue;
      }
      out[key] = obj.get(key);
    }
    return out;
  }

  /**
   * Takes the per-page keys out of a full property set.
   *
   * @param {object} props Properties.
   * @param {object} group Group.
   * @returns {object} Properties without the group's local keys.
   */
  function withoutLocal(props, group) {
    const local = localKeys(group);
    const out = {};
    for (const [key, value] of Object.entries(props)) {
      if (!keyInList(key, local)) {
        out[key] = value;
      }
    }
    return out;
  }

  /**
   * Writes properties that differ, recording them for the echo guard.
   *
   * @param {object} obj Roll20 object.
   * @param {object} props Properties.
   * @returns {number} How many properties changed.
   */
  function applyProps(obj, props) {
    const diff = {};
    for (const [key, value] of Object.entries(props)) {
      if (key === 'path' && obj.get('_type') === 'path') {
        continue;
      }
      if (!sameValue(obj.get(key), value)) {
        diff[key] = value;
      }
    }
    const n = Object.keys(diff).length;
    if (n > 0) {
      expectWrite(obj.id, diff);
      obj.set(diff);
    }
    return n;
  }

  /**
   * Creates a copy of an object on a page.
   *
   * @param {string} type Object type.
   * @param {object} props Properties (as from readProps).
   * @param {string} pageId Page ID.
   * @returns {{obj: object|null, reason?: string}} The copy, or why there is none.
   */
  function createCopy(type, props, pageId) {
    const attrs = { ...props, pageid: pageId };
    if (type === 'graphic') {
      const img = cleanImgsrc(props.imgsrc);
      if (!img.ok) {
        return { obj: null, reason: 'image' };
      }
      attrs.imgsrc = img.url;
    }
    let obj = null;
    try {
      obj = createObj(type, attrs) || null;
    } catch (e) {
      log(`SyncPage: could not create a ${type} copy: ${e?.message || e}`);
    }
    return obj ? { obj } : { obj: null, reason: 'create' };
  }

  /**
   * Returns true when the API can create this object again (marketplace images
   * cannot be).
   *
   * @param {string} type Object type.
   * @param {object} props Properties.
   * @returns {boolean} True when it can be recreated.
   */
  function canRecreate(type, props) {
    return type !== 'graphic' || cleanImgsrc(props.imgsrc).ok;
  }

  const round = (v) => Math.round(Number(v) || 0);

  /**
   * Builds an object's fingerprint: what stays the same when Roll20 copies a
   * page (type, layer, place, size, name, image or shape).
   *
   * @param {string} type Object type.
   * @param {object} props Properties.
   * @returns {string} Fingerprint.
   */
  function fingerprint(type, props) {
    const p = props || {};
    switch (type) {
      case 'graphic':
        return [
          'graphic',
          p.layer,
          round(p.left),
          round(p.top),
          round(p.width),
          round(p.height),
          toText(p.name),
          imageKey(p.imgsrc),
        ].join('|');
      case 'text':
        return ['text', p.layer, round(p.left), round(p.top), toText(p.text)].join('|');
      case 'path':
        return [
          'path',
          p.layer,
          round(p.left),
          round(p.top),
          round(p.width),
          round(p.height),
          toText(p.path ?? p._path).length,
        ].join('|');
      case 'pathv2':
        return ['pathv2', p.layer, round(p.x), round(p.y), toText(p.shape), toText(p.points)].join(
          '|'
        );
      case 'door':
      case 'window':
        return [type, round(p.x), round(p.y), JSON.stringify(p.path || {})].join('|');
      default:
        return `${type}|?`;
    }
  }

  /**
   * Returns the properties that differ between two objects of one type,
   * ignoring the keys Roll20 changes when it copies a page and the group's
   * per-page keys.
   *
   * @param {string} type Object type.
   * @param {object} want Wanted properties.
   * @param {object} have Current properties.
   * @param {object} group Group.
   * @returns {object} Properties to write.
   */
  function drift(type, want, have, group) {
    const local = localKeys(group);
    const ignore = IGNORE_FOR_MATCH[type] || [];
    const out = {};
    for (const [key, value] of Object.entries(want)) {
      if (keyInList(key, local) || ignore.includes(key) || (key === 'path' && type === 'path')) {
        continue;
      }
      if (type === 'graphic' && key === 'imgsrc') {
        if (imageKey(value) !== imageKey(have.imgsrc)) {
          const img = cleanImgsrc(value);
          if (img.ok) {
            out.imgsrc = img.url;
          }
        }
        continue;
      }
      if (!sameValue(value, have[key])) {
        out[key] = value;
      }
    }
    return out;
  }

  // Hiding and showing one page's copy of a linked object. Hidden copies are
  // recorded in state, so changes from other pages never undo a hide.
  //   gmlayer: the copy moves to the GM layer; its wanted layer is remembered.
  //   remove:  the copy is deleted and kept as a snapshot, and created again on show.

  /**
   * Returns a copy's hidden record.
   *
   * @param {object} group Group.
   * @param {string} linkId Link ID.
   * @param {string} pageId Page ID.
   * @returns {{layer: string, snapshot?: object}|null} Record.
   */
  function hiddenOn(group, linkId, pageId) {
    return group.hidden[linkId]?.[pageId] || null;
  }

  /**
   * Reads the turn order.
   *
   * @returns {object[]} Entries.
   */
  function readTurnOrder() {
    try {
      const raw = Campaign().get('turnorder');
      const list = typeof raw === 'string' && raw ? JSON.parse(raw) : raw;
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  /**
   * Takes an object's entries out of the turn order.
   *
   * @param {string} objId Object ID.
   * @returns {object[]} The entries removed, with their places.
   */
  function takeTurns(objId) {
    const list = readTurnOrder();
    const taken = [];
    list.forEach((entry, i) => {
      if (isRecord(entry) && entry.id === objId) {
        taken.push({ index: i, entry });
      }
    });
    if (taken.length) {
      Campaign().set(
        'turnorder',
        JSON.stringify(list.filter((e) => !(isRecord(e) && e.id === objId)))
      );
    }
    return taken;
  }

  /**
   * Puts turn order entries back for a recreated object.
   *
   * @param {object[]} taken Entries from takeTurns.
   * @param {string} newId The new object's ID.
   * @returns {void}
   */
  function returnTurns(taken, newId) {
    if (!Array.isArray(taken) || !taken.length) {
      return;
    }
    const list = readTurnOrder();
    for (const { index, entry } of taken) {
      list.splice(Math.min(index, list.length), 0, { ...entry, id: newId });
    }
    Campaign().set('turnorder', JSON.stringify(list));
  }

  /**
   * Hides one page's copy of a link.
   *
   * @param {object} group Group.
   * @param {string} linkId Link ID.
   * @param {string} pageId Page ID.
   * @returns {{ok: boolean, mode?: string, fallback?: boolean, reason?: string}} Result.
   */
  function hideCopy(group, linkId, pageId) {
    const link = group.links[linkId];
    if (!link) {
      return { ok: false, reason: 'notLinked' };
    }
    if (hiddenOn(group, linkId, pageId)) {
      return { ok: true, mode: 'already' };
    }
    const obj = link.objects[pageId] ? getObj(link.type, link.objects[pageId]) : null;
    if (!obj) {
      return { ok: false, reason: 'noCopy' };
    }
    const layer = obj.get('layer') || 'objects';
    group.hidden[linkId] = group.hidden[linkId] || {};
    let mode = getSetting('hideMode', group);
    let fallback = false;
    if (mode === 'remove' && !canRecreate(link.type, readProps(obj))) {
      mode = 'gmlayer';
      fallback = true;
    }
    if (mode === 'remove') {
      const props = readProps(obj);
      const turns = takeTurns(obj.id);
      group.hidden[linkId][pageId] = { layer, snapshot: { props, turns } };
      delete link.objects[pageId];
      expectRemove(obj.id);
      obj.remove();
      return { ok: true, mode };
    }
    group.hidden[linkId][pageId] = { layer };
    if (layer !== HIDDEN_LAYER) {
      applyProps(obj, { layer: HIDDEN_LAYER });
    }
    return { ok: true, mode, fallback };
  }

  /**
   * Shows one page's hidden copy again.
   *
   * @param {object} group Group.
   * @param {string} linkId Link ID.
   * @param {string} pageId Page ID.
   * @returns {{ok: boolean, reason?: string}} Result.
   */
  function showCopy(group, linkId, pageId) {
    const link = group.links[linkId];
    const h = hiddenOn(group, linkId, pageId);
    if (!link || !h) {
      return { ok: true };
    }
    if (h.snapshot) {
      const { obj, reason } = createCopy(
        link.type,
        { ...h.snapshot.props, layer: h.layer },
        pageId
      );
      if (!obj) {
        return { ok: false, reason };
      }
      setLinkObject(group, linkId, pageId, obj.id);
      returnTurns(h.snapshot.turns, obj.id);
    } else {
      const obj = link.objects[pageId] ? getObj(link.type, link.objects[pageId]) : null;
      if (obj) {
        applyProps(obj, { layer: h.layer });
      }
    }
    delete group.hidden[linkId][pageId];
    if (Object.keys(group.hidden[linkId]).length === 0) {
      delete group.hidden[linkId];
    }
    return { ok: true };
  }

  /**
   * Applies changes from another page to a hidden copy: the layer becomes its
   * wanted layer, and a removed copy's snapshot is updated.
   *
   * @param {object} group Group.
   * @param {string} linkId Link ID.
   * @param {string} pageId Page ID.
   * @param {object} props Changed properties.
   * @returns {object} The properties still to write to a GM-layer copy.
   */
  function absorbIntoHidden(group, linkId, pageId, props) {
    const h = hiddenOn(group, linkId, pageId);
    if (!h) {
      return props;
    }
    const rest = { ...props };
    if ('layer' in rest) {
      h.layer = rest.layer;
      delete rest.layer;
    }
    if (h.snapshot) {
      Object.assign(h.snapshot.props, rest);
      return {};
    }
    return rest;
  }

  // Chat cards: main menu, group card, players, settings, status, recycle bin
  // and repair reports. Every card is whispered to the GM who asked.

  // Commands for the Help handout and `help`, with their help-text keys.
  const COMMAND_LIST = [
    ['', 'menu'],
    ['group create [name]', 'groupCreate'],
    ['group add <group>', 'groupAdd'],
    ['group remove', 'groupRemove'],
    ['group show <group>', 'groupShow'],
    ['group rename <group> <name>', 'groupRename'],
    ['group source <group>', 'groupSource'],
    ['group delete <group>', 'groupDelete'],
    ['players [group]', 'players'],
    ['move <player> <page>', 'move'],
    ['move all <page>', 'moveAll'],
    ['layout save|restore [group]', 'layout'],
    ['hide [here|others|all|page=<page>]', 'hide'],
    ['show [here|others|all|page=<page>]', 'show'],
    ['status', 'status'],
    ['unlink', 'unlink'],
    ['repair [group|all] [--dry-run]', 'repair'],
    ['pause [group]', 'pause'],
    ['resume [group]', 'resume'],
    ['undo [group]', 'undo'],
    ['recycle [group]', 'recycle'],
    ['settings [group <group>]', 'settings'],
    ['set [group <group>] <setting> <value>', 'set'],
    ['settings reset [group <group>]', 'settingsReset'],
    ['handouts', 'handouts'],
    ['help', 'help'],
  ];

  const cmd = (text) => `${COMMAND} ${text}`.trim();

  /**
   * Builds a coloured inline label.
   *
   * @param {string} text Text.
   * @param {string} colour CSS colour.
   * @returns {string} HTML.
   */
  function pill(text, colour) {
    return `<span style="color:${colour};font-weight:bold">${escapeHtml(text)}</span>`;
  }

  /**
   * Builds a muted note.
   *
   * @param {string} text Text.
   * @returns {string} HTML.
   */
  function note(text) {
    return `<div style="color:${COLOR_MUTED};font-size:0.85em">${escapeHtml(text)}</div>`;
  }

  /**
   * Builds a roll query listing the groups.
   *
   * @param {string} lang Locale.
   * @returns {string} Query text.
   */
  function groupQuery(lang) {
    const names = listGroups().map((g) => queryText(g.name));
    return `?{${queryText(t('queries.group', lang))}|${names.join('|')}}`;
  }

  /**
   * Whispers the main menu.
   *
   * @param {object} ctx Command context.
   * @returns {void}
   */
  function showMenu(ctx) {
    const lang = getLang();
    const page = ctx.pageId;
    const group = groupOfPage(page);
    const parts = [];
    parts.push(buildRow(t('menu.thisPage', lang), escapeHtml(truncate(pageName(page), 28))));
    if (group) {
      const role = group.source === page ? t('menu.source', lang) : t('menu.copy', lang);
      parts.push(
        buildRow(
          t('menu.group', lang),
          `${escapeHtml(truncate(group.name, 24))} (${escapeHtml(role)})`
        )
      );
      if (group.paused) {
        parts.push(pill(t('menu.paused', lang), COLOR_HIDDEN));
      }
      parts.push(
        `<div>${buildButton(t('buttons.group', lang), cmd(`group show ${group.id}`))}${buildButton(t('buttons.players', lang), cmd(`players ${group.id}`))}${buildSecondaryButton(t('buttons.repair', lang), cmd(`repair ${group.id}`))}${buildSecondaryButton(t('buttons.dryRun', lang), cmd(`repair ${group.id} --dry-run`))}${buildSecondaryButton(group.paused ? t('buttons.resume', lang) : t('buttons.pause', lang), cmd(`${group.paused ? 'resume' : 'pause'} ${group.id}`))}</div>`
      );
      parts.push(
        `<div>${buildSecondaryButton(t('buttons.status', lang), cmd('status'))}${buildSecondaryButton(t('buttons.hideHere', lang), cmd('hide here'))}${buildSecondaryButton(t('buttons.showHere', lang), cmd('show here'))}${buildSecondaryButton(t('buttons.hideOthers', lang), cmd('hide others'))}${buildSecondaryButton(t('buttons.showOthers', lang), cmd('show others'))}</div>`
      );
      parts.push(note(t('menu.selectedHint', lang)));
    } else {
      parts.push(note(t('menu.notInGroup', lang)));
      const buttons = [
        buildButton(
          t('buttons.createGroup', lang),
          cmd(
            `group create ?{${queryText(t('queries.groupName', lang))}|${queryText(pageName(page))}}`
          )
        ),
      ];
      if (listGroups().length) {
        buttons.push(
          buildButton(t('buttons.addToGroup', lang), cmd(`group add ${groupQuery(lang)}`))
        );
      }
      parts.push(`<div>${buttons.join('')}</div>`);
      parts.push(note(t('menu.duplicateHint', lang)));
    }
    const groups = listGroups();
    if (groups.length) {
      parts.push(buildSectionLabel(t('menu.groups', lang)));
      parts.push(
        `<div>${groups.map((g) => buildSecondaryButton(`${truncate(g.name, 20)} (${g.pages.length})`, cmd(`group show ${g.id}`))).join('')}</div>`
      );
    }
    parts.push(buildDivider());
    parts.push(
      `<div>${buildSecondaryButton(t('buttons.settings', lang), cmd('settings'))}${buildSecondaryButton(t('buttons.recycle', lang), cmd('recycle'))}${buildSecondaryButton(t('buttons.undo', lang), cmd('undo'))}${buildSecondaryButton(t('buttons.help', lang), cmd('help'))}</div>`
    );
    whisper(ctx.playerId, `${SCRIPT_NAME} ${SCRIPT_VERSION}`, parts);
  }

  /**
   * Whispers a group's card.
   *
   * @param {object} ctx Command context.
   * @param {object} group Group.
   * @returns {void}
   */
  function showGroup(ctx, group) {
    const lang = getLang();
    const byPage = playersByPage(group);
    const parts = [];
    if (group.paused) {
      parts.push(pill(t('menu.paused', lang), COLOR_HIDDEN));
    }
    parts.push(buildSectionLabel(t('group.pages', lang)));
    for (const p of group.pages) {
      const isSource = p === group.source;
      const label = `${truncate(pageName(p), 24)}${isSource ? ` ★` : ''}`;
      const players = byPage[p]?.length || 0;
      const buttons = [];
      if (!isSource) {
        buttons.push(
          buildSecondaryButton(
            t('buttons.makeSource', lang),
            cmd(`group source ${group.id} --page ${p}`)
          )
        );
      }
      buttons.push(
        buildSecondaryButton(t('buttons.removePage', lang), cmd(`group remove --page ${p}`))
      );
      parts.push(
        buildRow(
          `${label} · ${t('group.playersCount', lang, { count: players })}`,
          buttons.join('')
        )
      );
    }
    parts.push(note(t('group.sourceHint', lang)));
    parts.push(buildSectionLabel(t('group.summary', lang)));
    const hiddenCount = Object.values(group.hidden).reduce(
      (n, byPage2) => n + Object.keys(byPage2).length,
      0
    );
    parts.push(buildRow(t('group.links', lang), String(Object.keys(group.links).length)));
    parts.push(buildRow(t('group.hidden', lang), String(hiddenCount)));
    parts.push(buildRow(t('group.recycle', lang), String(group.recycle.length)));
    const overrides = Object.keys(group.overrides);
    parts.push(
      buildRow(
        t('group.overrides', lang),
        overrides.length ? escapeHtml(overrides.join(', ')) : escapeHtml(t('group.none', lang))
      )
    );
    if (group.repairLog) {
      const log = group.repairLog;
      parts.push(
        note(
          t('group.lastRepair', lang, {
            when: formatAge(log.at, lang),
            drifted: log.drifted,
            recreated: log.recreated,
          })
        )
      );
    }
    parts.push(buildDivider());
    parts.push(
      `<div>${buildButton(t('buttons.players', lang), cmd(`players ${group.id}`))}${buildButton(t('buttons.repair', lang), cmd(`repair ${group.id}`))}${buildSecondaryButton(t('buttons.dryRun', lang), cmd(`repair ${group.id} --dry-run`))}${buildSecondaryButton(group.paused ? t('buttons.resume', lang) : t('buttons.pause', lang), cmd(`${group.paused ? 'resume' : 'pause'} ${group.id}`))}</div>`
    );
    parts.push(
      `<div>${buildSecondaryButton(t('buttons.groupSettings', lang), cmd(`settings group ${group.id}`))}${buildSecondaryButton(t('buttons.recycle', lang), cmd(`recycle ${group.id}`))}${buildSecondaryButton(t('buttons.rename', lang), cmd(`group rename ${group.id} ?{${queryText(t('queries.groupName', lang))}|${queryText(group.name)}}`))}${buildSecondaryButton(t('buttons.deleteGroup', lang), cmd(`group delete ${group.id} ?{${queryText(t('queries.deleteGroup', lang, { name: group.name }))}|${t('queries.no', lang)},no|${t('queries.yes', lang)},yes}`))}${buildSecondaryButton(t('buttons.menu', lang), cmd('menu'))}</div>`
    );
    whisper(ctx.playerId, t('titles.group', lang, { name: group.name }), parts);
  }

  /**
   * Formats how long ago a time was.
   *
   * @param {number} at Time in ms.
   * @param {string} lang Locale.
   * @returns {string} Text such as "5 minutes ago".
   */
  function formatAge(at, lang) {
    const mins = Math.max(0, Math.round((Date.now() - at) / 60000));
    if (mins < 1) {
      return t('age.now', lang);
    }
    if (mins < 60) {
      return t('age.minutes', lang, { count: mins });
    }
    const hours = Math.round(mins / 60);
    if (hours < 48) {
      return t('age.hours', lang, { count: hours });
    }
    return t('age.days', lang, { count: Math.round(hours / 24) });
  }

  /**
   * Whispers the players card: who is where, buttons to move them, and a
   * show/hide grid for the selected objects.
   *
   * @param {object} ctx Command context.
   * @param {object} group Group.
   * @returns {void}
   */
  function showPlayers(ctx, group) {
    const lang = getLang();
    const parts = [];
    const players = listPlayers();
    if (!players.length) {
      parts.push(note(t('players.none', lang)));
    }
    for (const player of players) {
      const here = pageOfPlayer(player.id);
      const name = truncate(player.get('displayname') || player.id, 22);
      const where = group.pages.includes(here)
        ? truncate(pageName(here), 18)
        : t('players.elsewhere', lang);
      const buttons = group.pages.map((p) =>
        p === here
          ? `<span style="color:${COLOR_ACCENT};margin:1px 3px">● ${escapeHtml(truncate(pageName(p), 14))}</span>`
          : buildSecondaryButton(
              truncate(pageName(p), 14),
              cmd(`move ${player.id} ${p} --group ${group.id}`)
            )
      );
      parts.push(
        `<div style="margin:3px 0"><strong>${escapeHtml(name)}</strong> <span style="color:${COLOR_MUTED}">(${escapeHtml(where)})</span><br>${buttons.join('')}</div>`
      );
    }
    parts.push(buildDivider());
    parts.push(
      `<div>${buildButton(t('buttons.everyoneTo', lang, { page: truncate(pageName(group.source), 14) }), cmd(`move all ${group.source} --group ${group.id}`))}${buildSecondaryButton(t('buttons.saveLayout', lang), cmd(`layout save ${group.id}`))}${buildSecondaryButton(t('buttons.restoreLayout', lang), cmd(`layout restore ${group.id}`))}</div>`
    );
    if (Object.keys(group.layout).length) {
      parts.push(note(t('players.layoutSaved', lang, { count: Object.keys(group.layout).length })));
    }
    const linked = (ctx.objects || [])
      .map((o) => ({ obj: o, found: linkOf(o.id) }))
      .filter((x) => x.found && x.found.group.id === group.id);
    if (linked.length) {
      parts.push(buildSectionLabel(t('players.visibility', lang)));
      for (const { obj, found } of linked.slice(0, 12)) {
        const label = truncate(
          obj.get('name') || obj.get('text') || t(`types.${obj.get('_type')}`, lang),
          20
        );
        const cells = group.pages.map((p) => {
          const hidden = !!hiddenOn(group, found.linkId, p);
          const text = `${truncate(pageName(p), 12)}: ${hidden ? t('players.hidden', lang) : t('players.shown', lang)}`;
          return `<a href="${escapeHtml(cmd(`${hidden ? 'show' : 'hide'} page=${p} --ids ${obj.id} --back players`))}" style="background:${hidden ? COLOR_HIDDEN : COLOR_SHOWN};color:#151027;padding:2px 6px;border-radius:3px;text-decoration:none;font-size:0.85em;display:inline-block;margin:1px 2px">${escapeHtml(text)}</a>`;
        });
        parts.push(`<div style="margin:3px 0">${escapeHtml(label)}<br>${cells.join('')}</div>`);
      }
    } else {
      parts.push(note(t('players.selectHint', lang)));
    }
    parts.push(
      `<div>${buildSecondaryButton(t('buttons.group', lang), cmd(`group show ${group.id}`))}${buildSecondaryButton(t('buttons.menu', lang), cmd('menu'))}</div>`
    );
    whisper(ctx.playerId, t('titles.players', lang, { name: group.name }), parts);
  }

  /**
   * Shows a setting's value as text.
   *
   * @param {object} def Setting definition.
   * @param {*} value Value.
   * @param {string} lang Locale.
   * @returns {string} Text.
   */
  function valueText(def, value, lang) {
    if (def.type === 'boolean') {
      return value ? t('values.on', lang) : t('values.off', lang);
    }
    if (def.type === 'multi') {
      return value.length
        ? value.map((v) => t(`options.${def.key}.${v}`, lang)).join(', ')
        : t('values.none', lang);
    }
    if (def.type === 'choice') {
      return t(`options.${def.key}.${value}`, lang);
    }
    return String(value);
  }

  /**
   * Whispers the settings card, global or for one group.
   *
   * @param {object} ctx Command context.
   * @param {object|null} group Group, for its overrides.
   * @returns {void}
   */
  function showSettings(ctx, group) {
    const lang = getLang();
    const scope = group ? `group ${group.id} ` : '';
    const parts = [];
    if (group) {
      parts.push(note(t('settings.groupHint', lang)));
    }
    for (const def of SETTINGS) {
      if (group && def.scope !== 'group') {
        continue;
      }
      const value = getSetting(def.key, group);
      const label = t(`settings.${def.key}`, lang);
      let control;
      if (def.type === 'boolean') {
        control = buildButton(
          valueText(def, value, lang),
          cmd(`set ${scope}${def.key} ${value ? 'off' : 'on'}`)
        );
      } else if (def.type === 'choice') {
        const opts = def.options
          .map((o) => `${queryText(t(`options.${def.key}.${o}`, lang))},${o}`)
          .join('|');
        control = buildButton(
          valueText(def, value, lang),
          cmd(`set ${scope}${def.key} ?{${queryText(label)}|${opts}}`)
        );
      } else if (def.type === 'number') {
        control = buildButton(
          String(value),
          cmd(`set ${scope}${def.key} ?{${queryText(label)}|${value}}`)
        );
      } else if (def.type === 'locale') {
        const opts = LOCALE_DEFINITIONS.map(
          (l) => `${queryText(l.nativeName || l.name)},${l.code}`
        ).join('|');
        control = buildButton(value, cmd(`set ${def.key} ?{${queryText(label)}|${opts}}`));
      } else {
        control = def.options
          .map((o) => {
            const on = value.includes(o);
            const text = `${on ? '✓ ' : ''}${t(`options.${def.key}.${o}`, lang)}`;
            return on
              ? buildButton(text, cmd(`set ${scope}${def.key} -${o}`))
              : buildSecondaryButton(text, cmd(`set ${scope}${def.key} +${o}`));
          })
          .join('');
      }
      const overridden = group && def.key in group.overrides;
      const clear = overridden
        ? buildSecondaryButton(t('buttons.useGlobal', lang), cmd(`set ${scope}${def.key} default`))
        : '';
      const tag = group
        ? ` <span style="color:${COLOR_MUTED};font-size:0.8em">${escapeHtml(overridden ? t('settings.override', lang) : t('settings.global', lang))}</span>`
        : '';
      if (def.type === 'multi') {
        parts.push(
          `<div style="margin:4px 0"><span style="color:${COLOR_MUTED};font-size:0.9em">${escapeHtml(label)}</span>${tag}<br>${control}${clear}</div>`
        );
      } else {
        parts.push(buildRow(label, `${control}${clear}${tag}`));
      }
      parts.push(note(t(`settingsHelp.${def.key}`, lang)));
    }
    parts.push(buildDivider());
    const reset = cmd(
      `settings reset ${scope}?{${queryText(t('queries.resetSettings', lang))}|${t('queries.no', lang)},no|${t('queries.yes', lang)},yes}`
    );
    parts.push(
      `<div>${buildSecondaryButton(t('buttons.reset', lang), reset)}${group ? buildSecondaryButton(t('buttons.group', lang), cmd(`group show ${group.id}`)) : ''}${buildSecondaryButton(t('buttons.menu', lang), cmd('menu'))}</div>`
    );
    whisper(
      ctx.playerId,
      group ? t('titles.groupSettings', lang, { name: group.name }) : t('titles.settings', lang),
      parts
    );
  }

  /**
   * Whispers the status of objects: links, pages and hidden copies.
   *
   * @param {object} ctx Command context.
   * @returns {void}
   */
  function showStatus(ctx) {
    const lang = getLang();
    const parts = [];
    for (const obj of (ctx.objects || []).slice(0, 12)) {
      const label = truncate(
        obj.get('name') || obj.get('text') || t(`types.${obj.get('_type')}`, lang),
        24
      );
      const found = linkOf(obj.id);
      if (!found) {
        const group = groupOfPage(obj.get('_pageid'));
        const why = group?.pageOnly.includes(obj.id)
          ? t('status.pageOnly', lang)
          : t('status.notLinked', lang);
        parts.push(`<div><strong>${escapeHtml(label)}</strong>: ${escapeHtml(why)}</div>`);
        continue;
      }
      const { group, linkId, link } = found;
      const pages = group.pages.map((p) => {
        const h = hiddenOn(group, linkId, p);
        const has = !!link.objects[p] || !!h?.snapshot;
        const state2 = !has
          ? t('status.missing', lang)
          : h
            ? t('players.hidden', lang)
            : t('players.shown', lang);
        const colour = !has ? COLOR_MUTED : h ? COLOR_HIDDEN : COLOR_SHOWN;
        return `${escapeHtml(truncate(pageName(p), 14))}: ${pill(state2, colour)}`;
      });
      parts.push(
        `<div><strong>${escapeHtml(label)}</strong> · ${escapeHtml(group.name)}<br>${pages.join(' · ')}</div>`
      );
    }
    if (!parts.length) {
      parts.push(note(t('errors.nothingSelected', lang)));
    }
    whisper(ctx.playerId, t('titles.status', lang), parts);
  }

  /**
   * Whispers a group's recycle bin.
   *
   * @param {object} ctx Command context.
   * @param {object} group Group.
   * @returns {void}
   */
  function showRecycle(ctx, group) {
    const lang = getLang();
    const parts = [];
    if (!group.recycle.length) {
      parts.push(note(t('recycle.empty', lang)));
    }
    group.recycle.slice(0, 15).forEach((entry, n) => {
      const names = entry.items
        .map((i) => i.props?.name || i.props?.text || t(`types.${i.type}`, lang))
        .filter(Boolean);
      const what = truncate([...new Set(names)].join(', '), 40);
      parts.push(
        buildRow(
          `${n + 1}. ${t(`recycle.reasons.${entry.reason}`, lang)} · ${formatAge(entry.at, lang)} · ${what}`,
          buildSecondaryButton(
            t('buttons.restore', lang),
            cmd(`recycle ${group.id} restore ${n + 1}`)
          )
        )
      );
    });
    if (group.recycle.length) {
      parts.push(buildDivider());
      parts.push(
        `<div>${buildButton(t('buttons.undo', lang), cmd(`undo ${group.id}`))}${buildSecondaryButton(t('buttons.emptyRecycle', lang), cmd(`recycle ${group.id} empty ?{${queryText(t('queries.emptyRecycle', lang))}|${t('queries.no', lang)},no|${t('queries.yes', lang)},yes}`))}</div>`
      );
    }
    whisper(ctx.playerId, t('titles.recycle', lang, { name: group.name }), parts);
  }

  /**
   * Whispers a repair report.
   *
   * @param {object} ctx Command context.
   * @param {object} group Group.
   * @param {object} counts Repair counts.
   * @param {boolean} dryRun True for a dry run.
   * @returns {void}
   */
  function showRepair(ctx, group, counts, dryRun) {
    const lang = getLang();
    const rows = [
      'drifted',
      'recreated',
      'removed',
      'dropped',
      'mirrored',
      'leftovers',
      'pageSettings',
    ].map((k) => buildRow(t(`repair.${k}`, lang), String(counts[k])));
    const parts = [
      note(dryRun ? t('repair.dryRunNote', lang) : t('repair.doneNote', lang)),
      ...rows,
    ];
    if (dryRun) {
      parts.push(
        `<div>${buildButton(t('buttons.repairNow', lang), cmd(`repair ${group.id} yes`))}</div>`
      );
    }
    whisper(
      ctx.playerId,
      dryRun
        ? t('titles.dryRun', lang, { name: group.name })
        : t('titles.repaired', lang, { name: group.name }),
      parts
    );
  }

  /**
   * Whispers the short in-chat help.
   *
   * @param {object} ctx Command context.
   * @returns {void}
   */
  function showHelp(ctx) {
    const lang = getLang();
    const rows = COMMAND_LIST.map(
      ([c, key]) =>
        `<div><code>${escapeHtml(cmd(c))}</code><br><span style="color:${COLOR_MUTED};font-size:0.85em">${escapeHtml(t(`help.${key}`, lang))}</span></div>`
    );
    rows.push(note(t('help.footer', lang, { help: HANDOUT_HELP_NAME, deck: HANDOUT_DECK_NAME })));
    whisper(ctx.playerId, t('titles.help', lang), rows);
  }

  /**
   * Whispers a player (not a GM) the page they are on.
   *
   * @param {object} ctx Command context.
   * @returns {void}
   */
  function showWhere(ctx) {
    const lang = getLang();
    const here = pageOfPlayer(ctx.playerId);
    whisper(
      ctx.playerId,
      SCRIPT_NAME,
      `<div>${escapeHtml(t('players.youAreOn', lang, { page: pageName(here) }))}</div>`
    );
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
    commands.push([code('--page <page>'), escapeHtml(t('help.page', lang))]);
    const settings = SETTINGS.map((def) => [
      code(def.key),
      escapeHtml(t(`settings.${def.key}`, lang)),
      escapeHtml(t(`settingsHelp.${def.key}`, lang)),
      escapeHtml(
        def.scope === 'group'
          ? t('handout.settings.scopeGroup', lang)
          : t('handout.settings.scopeGlobal', lang)
      ),
    ]);
    const api = [
      ['getGroup(pageId)', 'getGroup'],
      ['getLinked(obj)', 'getLinked'],
      ['notify(obj, prev)', 'notify'],
      ['isHidden(obj, pageId)', 'isHidden'],
      ['onSync(fn)', 'onSync'],
      ['repair(groupId)', 'repair'],
    ].map(([fn, key]) => [code(`SyncPage.${fn}`), escapeHtml(t(`handout.api.rows.${key}`, lang))]);
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
    ${section('overview', `${p('overview.body')}${p('overview.why')}`)}
    ${section('quickStart', list(raw('quickStart.steps'), true))}
    ${section('mirroring', list(raw('mirroring.points')))}
    ${section('visibility', list(raw('visibility.points')))}
    ${section('players', list(raw('players.points')))}
    ${section('repair', list(raw('repair.points')))}
    ${section('memory', list(raw('memory.points')))}
    ${section('commands', `${p('commands.intro')}${table([t('handout.commands.colCommand', lang), t('handout.commands.colDesc', lang)], commands)}`)}
    ${section('settings', `${p('settings.intro')}${table([t('handout.settings.colKey', lang), t('handout.settings.colName', lang), t('handout.settings.colDesc', lang), t('handout.settings.colScope', lang)], settings)}`)}
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
    const groupName = `?{${tr('queries.groupName').replaceAll(/[|,}{]/g, ' ')}}`;

    return `<div style="${STYLE.outer}${getDirectionStyle(lang)}">
    <div style="${STYLE.header}">
      <h1 style="${STYLE.h1}">✦ ${SCRIPT_NAME} ✦</h1>
      <p style="${STYLE.subtitle}">${DECK_TITLE} • v${SCRIPT_VERSION}</p>
    </div>
    ${group('deck.menuTitle', 'deck.menuDesc', [btn('menu', ''), btn('players', 'players'), btn('settings', 'settings', true), btn('help', 'help', true)])}
    ${group('deck.groupsTitle', 'deck.groupsDesc', [btn('createGroup', `group create ${groupName}`), btn('addToGroup', `group add ${groupName}`), btn('removePage', 'group remove', true)])}
    ${group('deck.selectedTitle', 'deck.selectedDesc', [btn('hideHere', 'hide here'), btn('showHere', 'show here'), btn('hideOthers', 'hide others', true), btn('showOthers', 'show others', true), btn('status', 'status', true), btn('unlink', 'unlink', true)])}
    ${group('deck.toolsTitle', 'deck.toolsDesc', [btn('dryRun', 'repair --dry-run'), btn('repair', 'repair'), btn('undo', 'undo', true), btn('recycle', 'recycle', true), btn('pause', 'pause', true), btn('resume', 'resume', true), btn('rebuild', 'handouts', true)])}
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

  // Pending prompts. A button that would carry a lot of data carries only a
  // short request ID; the data waits in state. Each button works once, and
  // requests expire, so an old button cannot act on stale data.

  /**
   * Stores a request.
   *
   * @param {string} kind What the request is for (`delete`, `leftover`, …).
   * @param {string} gm Player ID of the GM it was made for.
   * @param {*} payload JSON-safe data.
   * @returns {string} Request ID.
   */
  function createRequest(kind, gm, payload) {
    const id = makeId('r');
    getState().requests[id] = { kind, gm: gm || '', at: Date.now(), payload };
    return id;
  }

  /**
   * Takes a request, removing it.
   *
   * @param {string} id Request ID.
   * @param {string} [kind] Expected kind.
   * @returns {{ok: boolean, kind?: string, payload?: *, reason?: string}} The request's data, or why not.
   */
  function takeRequest(id, kind) {
    const requests = getState().requests;
    const r = requests[id];
    if (!r || kind) {
      return { ok: false, reason: 'unknown' };
    }
    delete requests[id];
    if (Date.now() - r.at > REQUEST_TTL_MS) {
      return { ok: false, reason: 'expired' };
    }
    return { ok: true, kind: r.kind, payload: r.payload, gm: r.gm };
  }

  /**
   * Drops requests long past their expiry. They are kept a while after they
   * expire so a late click is told "expired" rather than "already used".
   *
   * @returns {number} How many were dropped.
   */
  function sweepRequests() {
    const requests = getState().requests;
    let n = 0;
    for (const [id, r] of Object.entries(requests)) {
      if (Date.now() - r.at > REQUEST_TTL_MS * 6) {
        delete requests[id];
        n += 1;
      }
    }
    return n;
  }

  // The recycle bin: snapshots of objects SyncPage removed (deletes that
  // spread, removed links, repair clean-ups), so they can be put back.

  /**
   * @typedef {object} RecycleItem
   * @property {string} linkId Link the object belonged to.
   * @property {string} pageId Page it was on.
   * @property {string} type Object type.
   * @property {object} props Its properties.
   * @property {{layer: string}|null} [hidden] Its hidden state on that page.
   */

  /**
   * Adds an entry to a group's recycle bin.
   *
   * @param {object} group Group.
   * @param {string} reason Why the objects went (`delete`, `repair`, `exclude`, `group`).
   * @param {RecycleItem[]} items Snapshots.
   * @returns {string|null} The entry's ID.
   */
  function addToRecycle(group, reason, items) {
    if (!items.length) {
      return null;
    }
    const id = makeId('e');
    group.recycle.unshift({ id, at: Date.now(), reason, items });
    const max = getSetting('recycleSize');
    if (group.recycle.length > max) {
      group.recycle.length = max;
    }
    return id;
  }

  /**
   * Puts an entry's objects back and links them again.
   *
   * @param {object} group Group.
   * @param {number} [n=0] Entry number, newest first.
   * @returns {{ok: boolean, restored: number, failed: number}} Result.
   */
  function restoreEntry(group, n = 0) {
    const entry = group.recycle[n];
    if (!entry) {
      return { ok: false, restored: 0, failed: 0 };
    }
    let restored = 0;
    let failed = 0;
    for (const item of entry.items) {
      if (
        !group.pages.includes(item.pageId) ||
        !getObj('page', item.pageId) ||
        !canRecreate(item.type, item.props)
      ) {
        failed += 1;
        continue;
      }
      const { obj } = createCopy(item.type, item.props, item.pageId);
      if (!obj) {
        failed += 1;
        continue;
      }
      if (!group.links[item.linkId]) {
        group.links[item.linkId] = { type: item.type, objects: {} };
      }
      setLinkObject(group, item.linkId, item.pageId, obj.id);
      if (item.hidden) {
        group.hidden[item.linkId] = group.hidden[item.linkId] || {};
        group.hidden[item.linkId][item.pageId] = { layer: item.hidden.layer };
      }
      restored += 1;
    }
    group.recycle.splice(n, 1);
    return { ok: true, restored, failed };
  }

  // Mirroring: add, change and destroy events on a group's pages are copied to
  // the group's other pages. Page settings are mirrored too.

  /** @type {Map<string, {type: string, id: string}>} */
  const pendingAdds = new Map();
  let addTimer = null;
  const observers = [];
  // Images already reported as not copyable, so the GM is told once each.
  const reportedImages = new Set();

  /**
   * Runs a job over items, a slice at a time, so a big job does not stop the
   * sandbox. Small jobs run at once.
   *
   * @param {Array} items Items.
   * @param {Function} each Called with each item.
   * @param {Function} [done] Called when every item is done.
   * @returns {void}
   */
  function runJob(items, each, done) {
    if (items.length <= BATCH_SIZE) {
      items.forEach((item) => each(item));
      return;
    }
    let i = 0;
    const step = () => {
      const end = Math.min(i + BATCH_SIZE, items.length);
      for (; i < end; i++) {
        each(items[i]);
      }
      if (i < items.length) {
        setTimeout(step, BATCH_PAUSE_MS);
      }
    };
    step();
  }

  /**
   * Registers a function told about every mirrored change.
   *
   * @param {Function} fn Called with {kind, group, linkId, source, copies}.
   * @returns {void}
   */
  function onSync(fn) {
    if (typeof fn === 'function') {
      observers.push(fn);
    }
  }

  /**
   * Tells the observers. One failing observer does not stop the others.
   *
   * @param {object} event Event.
   * @returns {void}
   */
  function tell(event) {
    for (const fn of observers) {
      try {
        fn(event);
      } catch (e) {
        log(`SyncPage: an onSync observer failed: ${e?.stack || e}`);
      }
    }
  }

  /**
   * Returns true when objects on this layer are left alone.
   *
   * @param {object} group Group.
   * @param {string} layer Layer.
   * @returns {boolean} True when excluded.
   */
  function layerExcluded(group, layer) {
    return (getSetting('excludeLayers', group) || []).includes(layer);
  }

  /**
   * Tells the GM once about images the API cannot copy.
   *
   * @param {object} obj Object whose image could not be copied.
   * @returns {void}
   */
  function reportImage(obj) {
    const key = String(obj.get('imgsrc') || '');
    if (reportedImages.has(key)) {
      return;
    }
    reportedImages.add(key);
    const lang = getLang();
    whisper(
      null,
      t('titles.warning', lang),
      `<div>${escapeHtml(t('messages.imageNotCopied', lang, { name: obj.get('name') || obj.id, page: pageName(obj.get('_pageid')) }))}</div>`
    );
  }

  /**
   * Copies a new object to every other page of its group and links the copies.
   *
   * @param {object} group Group.
   * @param {object} obj New object.
   * @returns {{linkId: string|null, created: number, failed: number}} Result.
   */
  function mirrorNew(group, obj) {
    const type = obj.get('_type');
    const pageId = obj.get('_pageid');
    const props = readProps(obj);
    const objects = { [pageId]: obj.id };
    let created = 0;
    let failed = 0;
    for (const p of group.pages) {
      if (p === pageId || !getObj('page', p)) {
        continue;
      }
      const { obj: copy, reason } = createCopy(type, props, p);
      if (copy) {
        objects[p] = copy.id;
        created += 1;
      } else {
        failed += 1;
        if (reason === 'image') {
          reportImage(obj);
        }
      }
    }
    const linkId = newLink(group, type, objects, fingerprint(type, props));
    tell({ kind: 'create', group, linkId, source: obj, copies: objects });
    return { linkId, created, failed };
  }

  /**
   * Handles a new object after the debounce: copies it unless the group or
   * its settings say otherwise.
   *
   * @param {{type: string, id: string}} ref The object.
   * @returns {void}
   */
  function processAdd(ref) {
    const obj = getObj(ref.type, ref.id);
    if (!obj || linkOf(obj.id)) {
      return;
    }
    const pageId = obj.get('_pageid');
    const group = groupOfPage(pageId);
    if (!group || group.paused || layerExcluded(group, obj.get('layer'))) {
      return;
    }
    if (getSetting('newObjects', group) === 'sourceOnly' && pageId !== group.source) {
      markPageOnly(group, obj.id);
      return;
    }
    mirrorNew(group, obj);
  }

  /**
   * Copies every object waiting since the last add events.
   *
   * @returns {void}
   */
  function flushAdds() {
    addTimer = null;
    const items = [...pendingAdds.values()];
    pendingAdds.clear();
    runJob(items, processAdd);
  }

  /**
   * Handles add:<type>. New objects are collected for a moment so a paste or
   * a burst is handled together and property changes that follow have landed.
   *
   * @param {object} obj New object.
   * @returns {void}
   */
  function handleAdd(obj) {
    const type = obj?.get('_type');
    if (!SYNC_TYPES.includes(type)) {
      return;
    }
    const group = groupOfPage(obj.get('_pageid'));
    if (!group || group.paused) {
      return;
    }
    pendingAdds.set(obj.id, { type, id: obj.id });
    if (addTimer === null) {
      addTimer = setTimeout(flushAdds, ADD_DEBOUNCE_MS);
    }
  }

  /**
   * Returns the keys whose values changed.
   *
   * @param {object} obj Changed object.
   * @param {object} prev Previous attributes.
   * @returns {string[]} Keys.
   */
  function changedKeys(obj, prev) {
    if (!prev) {
      return Object.keys(readProps(obj));
    }
    const keys = [];
    for (const key of Object.keys(prev)) {
      if (!key.startsWith('_') && !sameValue(prev[key], obj.get(key))) {
        keys.push(key);
      }
    }
    return keys;
  }

  /**
   * Removes every copy of a link except the given object, putting them in the
   * recycle bin.
   *
   * @param {object} group Group.
   * @param {string} linkId Link ID.
   * @param {string} keepId Object to keep (or none).
   * @param {string} reason Recycle reason.
   * @param {object[]} [items] Snapshots already taken (such as the deleted object).
   * @returns {number} How many copies were removed.
   */
  function removeCopies(group, linkId, keepId, reason, items = []) {
    const link = group.links[linkId];
    if (!link) {
      return 0;
    }
    let n = 0;
    for (const [pageId, objId] of Object.entries(link.objects)) {
      if (objId === keepId) {
        continue;
      }
      const obj = getObj(link.type, objId);
      if (obj) {
        items.push({
          linkId,
          pageId,
          type: link.type,
          props: readProps(obj),
          hidden: hiddenOn(group, linkId, pageId)
            ? { layer: hiddenOn(group, linkId, pageId).layer }
            : null,
        });
        expectRemove(objId);
        obj.remove();
        n += 1;
      }
    }
    for (const [pageId, h] of Object.entries(group.hidden[linkId] || {})) {
      if (h.snapshot) {
        items.push({
          linkId,
          pageId,
          type: link.type,
          props: { ...h.snapshot.props, layer: HIDDEN_LAYER },
          hidden: { layer: h.layer },
        });
      }
    }
    addToRecycle(group, reason, items);
    return n;
  }

  /**
   * Handles change:<type>: mirrors the changed properties to the linked copies.
   *
   * @param {object} obj Changed object.
   * @param {object} prev Previous attributes.
   * @returns {void}
   */
  function handleChange(obj, prev) {
    const type = obj?.get('_type');
    if (!SYNC_TYPES.includes(type)) {
      return;
    }
    const pageId = obj.get('_pageid');
    const group = groupOfPage(pageId);
    if (!group || group.paused) {
      return;
    }
    let keys = filterEcho(obj, changedKeys(obj, prev));
    if (!keys.length) {
      return;
    }
    const found = linkOf(obj.id);
    const layer = obj.get('layer');
    if (!found) {
      // Moved off an excluded layer: it joins the group now.
      if (
        keys.includes('layer') &&
        prev &&
        layerExcluded(group, prev.layer) &&
        !layerExcluded(group, layer) &&
        !group.pageOnly.includes(obj.id)
      ) {
        mirrorNew(group, obj);
      }
      return;
    }
    const { linkId, link } = found;
    if (keys.includes('layer') && layerExcluded(group, layer)) {
      // Moved onto an excluded layer: the copies go and it stays here alone.
      removeCopies(group, linkId, obj.id, 'exclude');
      dropLink(group, linkId);
      return;
    }
    const own = hiddenOn(group, linkId, pageId);
    if (own && keys.includes('layer')) {
      // The GM moved a hidden copy by hand: off the GM layer means show it here.
      if (layer !== HIDDEN_LAYER) {
        delete group.hidden[linkId][pageId];
        if (Object.keys(group.hidden[linkId]).length === 0) {
          delete group.hidden[linkId];
        }
      }
      keys = keys.filter((k) => k !== 'layer');
    }
    const props = syncableChanges(obj, keys, group);
    if (!Object.keys(props).length) {
      return;
    }
    const pages = new Set([
      ...Object.keys(link.objects),
      ...Object.keys(group.hidden[linkId] || {}),
    ]);
    for (const p of pages) {
      if (p === pageId) {
        continue;
      }
      const rest = absorbIntoHidden(group, linkId, p, props);
      const copy = link.objects[p] ? getObj(type, link.objects[p]) : null;
      if (copy && Object.keys(rest).length) {
        applyProps(copy, rest);
      }
    }
    tell({ kind: 'change', group, linkId, source: obj, copies: { ...link.objects }, props });
  }

  /**
   * Whispers the GM a choice after a delete was kept to one page.
   *
   * @param {object} group Group.
   * @param {string} linkId Link ID.
   * @param {object} obj Deleted object.
   * @param {string} entry Recycle entry ID.
   * @returns {void}
   */
  function askAboutDelete(group, linkId, obj, entry) {
    const lang = getLang();
    const all = createRequest('deleteAll', '', { groupId: group.id, linkId, entry });
    const undo = createRequest('restore', '', { groupId: group.id, entry });
    const name = obj.get('name') || obj.get('text') || t(`types.${obj.get('_type')}`, lang);
    whisper(null, t('titles.deleted', lang), [
      `<div>${escapeHtml(t('messages.deletedAsk', lang, { name, page: pageName(obj.get('_pageid')) }))}</div>`,
      `<div style="margin-top:4px">${buildButton(t('buttons.deleteEverywhere', lang), `${COMMAND} request ${all}`)}${buildSecondaryButton(t('buttons.keepOthers', lang), `${COMMAND} request ${all} keep`)}${buildSecondaryButton(t('buttons.undo', lang), `${COMMAND} request ${undo}`)}</div>`,
    ]);
  }

  /**
   * Handles destroy:<type>: follows the group's deleteMode.
   *
   * @param {object} obj Deleted object.
   * @returns {void}
   */
  function handleDestroy(obj) {
    const type = obj?.get('_type');
    if (!SYNC_TYPES.includes(type)) {
      return;
    }
    pendingAdds.delete(obj.id);
    if (isOwnRemoval(obj.id)) {
      return;
    }
    const found = linkOf(obj.id);
    if (!found) {
      const group = groupOfPage(obj.get('_pageid'));
      if (group) {
        unmarkPageOnly(group, obj.id);
      }
      return;
    }
    const { group, linkId } = found;
    const pageId = obj.get('_pageid');
    const mine = {
      linkId,
      pageId,
      type,
      props: readProps(obj),
      hidden: hiddenOn(group, linkId, pageId)
        ? { layer: hiddenOn(group, linkId, pageId).layer }
        : null,
    };
    const mode = group.paused ? 'unlink' : getSetting('deleteMode', group);
    if (mode === 'all' || (mode === 'source' && pageId === group.source)) {
      removeCopies(group, linkId, obj.id, 'delete', [mine]);
      dropLink(group, linkId);
      tell({ kind: 'destroy', group, linkId, source: obj, copies: {} });
      return;
    }
    unlinkPage(group, linkId, pageId);
    const entry = addToRecycle(group, 'delete', [mine]);
    if (mode === 'ask' && group.links[linkId]) {
      askAboutDelete(group, linkId, obj, entry);
    }
  }

  /**
   * Returns the page keys a group keeps per page.
   *
   * @param {object} group Group.
   * @returns {string[]} Keys.
   */
  function localPageKeys(group) {
    return (getSetting('localPageSettings', group) || []).flatMap((name) => PAGE_SETS[name] || []);
  }

  /**
   * Returns the page settings to mirror from a page.
   *
   * @param {object} page Page.
   * @param {string[]} keys Keys to consider.
   * @param {object} group Group.
   * @returns {object} Settings.
   */
  function pageSettingsFrom(page, keys, group) {
    const local = localPageKeys(group);
    const out = {};
    for (const key of keys) {
      if (key.startsWith('_') || PAGE_NEVER_SYNC.includes(key) || keyInList(key, local)) {
        continue;
      }
      out[key] = page.get(key);
    }
    return out;
  }

  /**
   * Handles change:page: mirrors page settings to the group's other pages.
   *
   * @param {object} page Page.
   * @param {object} prev Previous attributes.
   * @returns {void}
   */
  function handlePageChange(page, prev) {
    const group = groupOfPage(page.id);
    if (!group || group.paused || !getSetting('syncPageSettings', group)) {
      return;
    }
    const keys = filterEcho(page, changedKeys(page, prev));
    const props = pageSettingsFrom(page, keys, group);
    if (!Object.keys(props).length) {
      return;
    }
    for (const p of group.pages) {
      const other = p !== page.id ? getObj('page', p) : null;
      if (other) {
        applyProps(other, props);
      }
    }
  }

  /**
   * Copies the source page's settings to the group's other pages (or one page).
   *
   * @param {object} group Group.
   * @param {object} [options] Options.
   * @param {string} [options.only] Only this page.
   * @param {boolean} [options.dryRun=false] Count without changing anything.
   * @returns {number} How many pages had settings that differed.
   */
  function copyPageSettings(group, { only, dryRun = false } = {}) {
    const source = getObj('page', group.source);
    if (!source || !getSetting('syncPageSettings', group)) {
      return 0;
    }
    const props = pageSettingsFrom(source, Object.keys(source.toJSON()), group);
    let n = 0;
    for (const p of group.pages) {
      if (p === group.source || (only && p !== only)) {
        continue;
      }
      const page = getObj('page', p);
      if (!page) {
        continue;
      }
      const differs = Object.entries(props).some(([k, v]) => !sameValue(page.get(k), v));
      if (differs) {
        n += 1;
        if (!dryRun) {
          applyProps(page, props);
        }
      }
    }
    return n;
  }

  /**
   * Handles destroy:page: the page leaves its group.
   *
   * @param {object} page Page.
   * @returns {void}
   */
  function handlePageDestroy(page) {
    const group = groupOfPage(page.id);
    if (group) {
      removePage(group, page.id);
    }
  }

  /**
   * Mirrors a change another Mod made (API changes raise no events).
   *
   * @param {object} obj Changed object.
   * @param {object} [prev] Previous attributes; without them every property is pushed.
   * @returns {boolean} True when the object is linked.
   */
  function notify(obj, prev) {
    if (!obj || !linkOf(obj.id)) {
      return false;
    }
    handleChange(obj, prev);
    return true;
  }

  // Joining pages to a group. Objects already on a page (from Roll20's
  // Duplicate Page, which keeps marketplace art the API cannot copy) are paired
  // with the group's objects; anything missing is copied; anything extra is a
  // leftover, handled by the pairLeftovers setting.

  /**
   * Returns the objects on a page that belong to no link and should be.
   *
   * @param {object} group Group.
   * @param {string} pageId Page ID.
   * @returns {object[]} Objects.
   */
  function unlinkedOn(group, pageId) {
    return objectsOnPage(pageId).filter(
      (o) =>
        !linkOf(o.id) && !group.pageOnly.includes(o.id) && !layerExcluded(group, o.get('layer'))
    );
  }

  /**
   * Links every unlinked object on a page as a link of its own (no copies).
   * Used for the source page when a group is made.
   *
   * @param {object} group Group.
   * @param {string} pageId Page ID.
   * @returns {number} How many were linked.
   */
  function adoptPage(group, pageId) {
    let n = 0;
    for (const obj of unlinkedOn(group, pageId)) {
      newLink(
        group,
        obj.get('_type'),
        { [pageId]: obj.id },
        fingerprint(obj.get('_type'), readProps(obj))
      );
      n += 1;
    }
    return n;
  }

  /**
   * Returns the object that stands for a link: the source page's, or else the
   * first that still exists.
   *
   * @param {object} group Group.
   * @param {object} link Link.
   * @returns {object|null} Object.
   */
  function referenceOf(group, link) {
    const first = link.objects[group.source] ? getObj(link.type, link.objects[group.source]) : null;
    if (first) {
      return first;
    }
    for (const id of Object.values(link.objects)) {
      const obj = getObj(link.type, id);
      if (obj) {
        return obj;
      }
    }
    return null;
  }

  const distance = (a, b) =>
    Math.hypot(
      (Number(a.get('left')) || 0) - (Number(b.get('left')) || 0),
      (Number(a.get('top')) || 0) - (Number(b.get('top')) || 0)
    );

  /**
   * Pairs a page's unlinked objects with the group's links, then copies what
   * is missing.
   *
   * @param {object} group Group.
   * @param {string} pageId Page to pair (not the source).
   * @param {object} [options] Options.
   * @param {boolean} [options.copyMissing=true] Copy links with no partner on the page.
   * @returns {{paired: number, copied: number, failed: number, leftovers: object[]}} Result.
   */
  function pairPage(group, pageId, { copyMissing = true } = {}) {
    const candidates = unlinkedOn(group, pageId);
    const byPrint = new Map();
    for (const obj of candidates) {
      const print = fingerprint(obj.get('_type'), readProps(obj));
      if (!byPrint.has(print)) {
        byPrint.set(print, []);
      }
      byPrint.get(print).push(obj);
    }
    const taken = new Set();
    const unmatched = [];
    let paired = 0;
    for (const [linkId, link] of Object.entries(group.links)) {
      if (link.objects[pageId] || group.hidden[linkId]?.[pageId]) {
        continue;
      }
      const ref = referenceOf(group, link);
      if (!ref) {
        continue;
      }
      const print = fingerprint(link.type, readProps(ref));
      const match = (byPrint.get(print) || []).find((o) => !taken.has(o.id));
      if (match) {
        taken.add(match.id);
        setLinkObject(group, linkId, pageId, match.id);
        paired += 1;
      } else {
        unmatched.push({ linkId, link, ref });
      }
    }
    // Tokens moved since the copy was made: same character and name, nearest wins.
    const stillUnmatched = [];
    for (const item of unmatched) {
      const { ref } = item;
      if (item.link.type !== 'graphic' || !toText(ref.get('represents'))) {
        stillUnmatched.push(item);
        continue;
      }
      const options = candidates.filter(
        (o) =>
          !taken.has(o.id) &&
          o.get('_type') === 'graphic' &&
          o.get('represents') === ref.get('represents') &&
          o.get('name') === ref.get('name')
      );
      options.sort((a, b) => distance(a, ref) - distance(b, ref));
      if (options[0]) {
        taken.add(options[0].id);
        setLinkObject(group, item.linkId, pageId, options[0].id);
        paired += 1;
      } else {
        stillUnmatched.push(item);
      }
    }
    let copied = 0;
    let failed = 0;
    if (copyMissing) {
      for (const { linkId, link, ref } of stillUnmatched) {
        if (layerExcluded(group, ref.get('layer'))) {
          continue;
        }
        const { obj } = createCopy(link.type, readProps(ref), pageId);
        if (obj) {
          setLinkObject(group, linkId, pageId, obj.id);
          copied += 1;
        } else {
          failed += 1;
        }
      }
    }
    return { paired, copied, failed, leftovers: candidates.filter((o) => !taken.has(o.id)) };
  }

  /**
   * Deals with objects that matched nothing, following pairLeftovers.
   *
   * @param {object} group Group.
   * @param {string} pageId Page ID.
   * @param {object[]} leftovers Objects.
   * @param {string} [gm] GM to ask.
   * @returns {{copied: number, kept: number, asked: number}} What happened.
   */
  function handleLeftovers(group, pageId, leftovers, gm) {
    const out = { copied: 0, kept: 0, asked: 0 };
    if (!leftovers.length) {
      return out;
    }
    const mode = getSetting('pairLeftovers', group);
    if (mode === 'copy') {
      leftovers.forEach((o) => mirrorNew(group, o));
      out.copied = leftovers.length;
      return out;
    }
    if (mode === 'leave') {
      leftovers.forEach((o) => markPageOnly(group, o.id));
      out.kept = leftovers.length;
      return out;
    }
    const lang = getLang();
    const ids = leftovers.map((o) => o.id);
    const all = createRequest('leftover', gm, { groupId: group.id, ids });
    const rows = leftovers.slice(0, 10).map((o) => {
      const one = createRequest('leftover', gm, { groupId: group.id, ids: [o.id] });
      const label = truncate(
        o.get('name') || o.get('text') || t(`types.${o.get('_type')}`, lang),
        30
      );
      return `<div>${escapeHtml(label)} ${buildSecondaryButton(t('buttons.copy', lang), `${COMMAND} request ${one} copy`)}${buildSecondaryButton(t('buttons.keepHere', lang), `${COMMAND} request ${one} keep`)}</div>`;
    });
    if (leftovers.length > 10) {
      rows.push(
        `<div>${escapeHtml(t('messages.andMore', lang, { count: leftovers.length - 10 }))}</div>`
      );
    }
    whisper(gm || null, t('titles.leftovers', lang), [
      `<div>${escapeHtml(t('messages.leftovers', lang, { count: leftovers.length, page: pageName(pageId) }))}</div>`,
      ...rows,
      `<div style="margin-top:4px">${buildButton(t('buttons.copyAll', lang), `${COMMAND} request ${all} copy`)}${buildSecondaryButton(t('buttons.keepAll', lang), `${COMMAND} request ${all} keep`)}</div>`,
    ]);
    out.asked = leftovers.length;
    return out;
  }

  /**
   * Adds a page to a group: pairs, copies what is missing and deals with
   * leftovers.
   *
   * @param {object} group Group.
   * @param {string} pageId Page ID.
   * @param {string} [gm] GM to ask about leftovers.
   * @returns {object} Counts.
   */
  function joinPage(group, pageId, gm) {
    addPage(group, pageId);
    // Objects made on the source while it was alone have no link yet.
    adoptPage(group, group.source);
    copyPageSettings(group, { only: pageId });
    const result = pairPage(group, pageId);
    const left = handleLeftovers(group, pageId, result.leftovers, gm);
    return {
      ...result,
      leftovers: result.leftovers.length,
      leftoversCopied: left.copied,
      leftoversKept: left.kept,
    };
  }

  // Repair: bring a group's copies back in step with the source page. Finds
  // copies that drifted (changed by another Mod, or while the sandbox was
  // down), copies that are missing, links whose objects have all gone, and
  // objects made while SyncPage was not watching.

  /**
   * @typedef {object} RepairCounts
   * @property {number} drifted Copies whose properties differed.
   * @property {number} recreated Missing copies made again.
   * @property {number} removed Copies removed because their source object went.
   * @property {number} dropped Links with no objects left.
   * @property {number} mirrored New objects copied to the other pages.
   * @property {number} leftovers New objects on copies, handled by pairLeftovers.
   * @property {number} pageSettings Pages whose settings differed.
   */

  /**
   * Repairs one group.
   *
   * @param {object} group Group.
   * @param {object} [options] Options.
   * @param {boolean} [options.dryRun=false] Count without changing anything.
   * @param {string} [options.gm] GM to ask about leftovers.
   * @returns {RepairCounts} Counts.
   */
  function repairGroup(group, { dryRun = false, gm } = {}) {
    const counts = {
      drifted: 0,
      recreated: 0,
      removed: 0,
      dropped: 0,
      mirrored: 0,
      leftovers: 0,
      pageSettings: 0,
    };
    const spreadSourceDeletes = ['all', 'source'].includes(getSetting('deleteMode', group));

    for (const [linkId, link] of Object.entries({ ...group.links })) {
      const sourceId = link.objects[group.source];
      const sourceGone = !!sourceId && !getObj(link.type, sourceId);
      if (sourceGone && spreadSourceDeletes) {
        // Deleted on the source page while SyncPage was not watching.
        counts.removed += Object.values(link.objects).filter(
          (id) => id !== sourceId && getObj(link.type, id)
        ).length;
        if (!dryRun) {
          removeCopies(group, linkId, sourceId, 'repair');
          dropLink(group, linkId);
        }
        continue;
      }
      const base = referenceOf(group, link);
      if (!base) {
        counts.dropped += 1;
        if (!dryRun) {
          dropLink(group, linkId);
        }
        continue;
      }
      const refPage = base.get('_pageid');
      const want = withoutLocal(readProps(base), group);
      for (const p of group.pages) {
        if (p === refPage || !getObj('page', p)) {
          continue;
        }
        const h = group.hidden[linkId]?.[p];
        if (h?.snapshot) {
          const differs = Object.entries(want).some(
            ([k, v]) => k !== 'layer' && !sameValue(h.snapshot.props[k], v)
          );
          if (differs) {
            counts.drifted += 1;
            if (!dryRun) {
              Object.assign(h.snapshot.props, { ...want, layer: h.snapshot.props.layer });
              h.layer = want.layer;
            }
          }
          continue;
        }
        const target = h ? { ...want, layer: HIDDEN_LAYER } : want;
        const objId = link.objects[p];
        const obj = objId ? getObj(link.type, objId) : null;
        if (!obj) {
          if (layerExcluded(group, want.layer)) {
            continue;
          }
          counts.recreated += 1;
          if (!dryRun) {
            const { obj: copy } = createCopy(
              link.type,
              { ...readProps(base), layer: target.layer },
              p
            );
            if (copy) {
              setLinkObject(group, linkId, p, copy.id);
            }
          }
          continue;
        }
        if (h) {
          h.layer = want.layer;
        }
        const diff = drift(link.type, target, readProps(obj), group);
        if (Object.keys(diff).length) {
          counts.drifted += 1;
          if (!dryRun) {
            applyProps(obj, diff);
          }
        }
      }
    }

    // Objects made while SyncPage was not watching (sandbox down, paused).
    for (const p of group.pages) {
      const fresh = unlinkedOn(group, p);
      if (!fresh.length) {
        continue;
      }
      if (
        p === group.source ||
        (getSetting('newObjects', group) === 'mirror' &&
          getSetting('pairLeftovers', group) === 'copy')
      ) {
        counts.mirrored += fresh.length;
        if (!dryRun) {
          fresh.forEach((o) => mirrorNew(group, o));
        }
      } else {
        counts.leftovers += fresh.length;
        if (!dryRun) {
          handleLeftovers(group, p, fresh, gm);
        }
      }
    }

    counts.pageSettings = copyPageSettings(group, { dryRun });
    if (!dryRun) {
      // Last, so missing objects were seen above before their entries are dropped.
      prune();
      group.repairLog = { at: Date.now(), ...counts };
    }
    return counts;
  }

  /**
   * Returns the total of the changes in a repair.
   *
   * @param {RepairCounts} counts Counts.
   * @returns {number} Total.
   */
  function repairTotal(counts) {
    return (
      counts.drifted +
      counts.recreated +
      counts.removed +
      counts.dropped +
      counts.mirrored +
      counts.leftovers +
      counts.pageSettings
    );
  }

  // The chat command parser.

  let lastSweep = 0;
  // Repairs that change more than this ask first.
  const CONFIRM_REPAIR_OVER = 20;

  /**
   * Returns the command words when a message is for SyncPage.
   *
   * @param {string} content Message text.
   * @returns {string[]|null} Words after the command, or null.
   */
  function parseCommand(content) {
    const words = splitWords(toText(content));
    const head = (words[0] || '').toLowerCase();
    const aliases = [...COMMAND_ALIASES, ...getState().aliases];
    return aliases.includes(head) ? words.slice(1) : null;
  }

  /**
   * Pulls `--flag value` options out of the words.
   *
   * @param {string[]} words Words.
   * @returns {{args: string[], flags: Record<string, string|true>}} Words left and flags.
   */
  function takeFlags(words) {
    const args = [];
    const flags = {};
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      if (w.startsWith('--')) {
        const name = w.slice(2).toLowerCase();
        if (['ids', 'page', 'group', 'back'].includes(name) && i + 1 < words.length) {
          flags[name] = words[++i];
        } else {
          flags[name] = true;
        }
      } else {
        args.push(w);
      }
    }
    return { args, flags };
  }

  /**
   * Builds the context for a command: who sent it, the page it is about, and
   * the objects it acts on.
   *
   * @param {object} msg Chat message.
   * @param {Record<string, string|true>} flags Flags.
   * @returns {object} Context.
   */
  function buildContext(msg, flags) {
    const playerId = msg.playerid;
    const objects = [];
    if (typeof flags.ids === 'string') {
      for (const id of splitList(flags.ids)) {
        const obj = findAny(id);
        if (obj) {
          objects.push(obj);
        }
      }
    } else {
      for (const sel of msg.selected || []) {
        const obj = findAny(sel._id, sel._type);
        if (obj) {
          objects.push(obj);
        }
      }
    }
    const player = getObj('player', playerId);
    const lastPage = player ? toText(player.get('_lastpage')) : '';
    const pageId =
      (typeof flags.page === 'string' && findPage(flags.page)) ||
      objects[0]?.get('_pageid') ||
      lastPage ||
      Campaign().get('playerpageid');
    return { playerId, objects, pageId, flags, lang: getLang() };
  }

  /**
   * Finds the group a command is about: named, else the page's group, else
   * the last one this GM used.
   *
   * @param {object} ctx Context.
   * @param {string} [ref] Group ID or name.
   * @returns {object|null} Group.
   */
  function resolveGroup(ctx, ref) {
    const named = ref ? findGroup(ref) : null;
    if (named) {
      return named;
    }
    if (typeof ctx.flags.group === 'string') {
      return findGroup(ctx.flags.group);
    }
    if (ref) {
      return null;
    }
    return groupOfPage(ctx.pageId) || findGroup(gmMemory(ctx.playerId).lastGroup);
  }

  /**
   * Tells the GM something short.
   *
   * @param {object} ctx Context.
   * @param {string} key Message key.
   * @param {object} [vars] Values.
   * @returns {void}
   */
  function say(ctx, key, vars) {
    whisper(ctx.playerId, 'SyncPage', `<div>${escapeHtml(t(key, ctx.lang, vars))}</div>`);
  }

  /**
   * Tells the GM about a mistake.
   *
   * @param {object} ctx Context.
   * @param {string} key Error key.
   * @param {object} [vars] Values.
   * @returns {void}
   */
  function fail(ctx, key, vars) {
    whisperError(
      ctx.playerId,
      t(`errors.${key}`, ctx.lang, vars),
      t('errors.hint', ctx.lang, { command: COMMAND })
    );
  }

  /**
   * Handles `group …`.
   *
   * @param {object} ctx Context.
   * @param {string[]} args Words after `group`.
   * @returns {void}
   */
  function groupCommand(ctx, args) {
    const sub = (args[0] || 'list').toLowerCase();
    const rest = args.slice(1);
    if (sub === 'list') {
      showMenu(ctx);
      return;
    }
    if (sub === 'create') {
      if (groupOfPage(ctx.pageId)) {
        fail(ctx, 'pageInGroup', {
          page: pageName(ctx.pageId),
          group: groupOfPage(ctx.pageId).name,
        });
        return;
      }
      const name = rest.join(' ').trim() || pageName(ctx.pageId);
      if (findGroup(name)) {
        fail(ctx, 'groupExists', { name });
        return;
      }
      const group = createGroup(name, ctx.pageId);
      const n = adoptPage(group, ctx.pageId);
      gmMemory(ctx.playerId).lastGroup = group.id;
      say(ctx, 'messages.groupCreated', { name: group.name, count: n, page: pageName(ctx.pageId) });
      showGroup(ctx, group);
      return;
    }
    if (sub === 'add') {
      const group = findGroup(rest.join(' '));
      if (!group) {
        fail(ctx, 'noGroup', { name: rest.join(' ') });
        return;
      }
      const current = groupOfPage(ctx.pageId);
      if (current) {
        fail(ctx, 'pageInGroup', { page: pageName(ctx.pageId), group: current.name });
        return;
      }
      const r = joinPage(group, ctx.pageId, ctx.playerId);
      gmMemory(ctx.playerId).lastGroup = group.id;
      say(ctx, 'messages.pageAdded', {
        page: pageName(ctx.pageId),
        name: group.name,
        paired: r.paired,
        copied: r.copied,
        failed: r.failed,
        leftovers: r.leftovers,
      });
      showGroup(ctx, group);
      return;
    }
    const group = sub === 'remove' ? groupOfPage(ctx.pageId) : resolveGroup(ctx, rest[0]);
    if (!group) {
      fail(ctx, 'noGroup', { name: rest[0] || pageName(ctx.pageId) });
      return;
    }
    if (sub === 'show') {
      gmMemory(ctx.playerId).lastGroup = group.id;
      showGroup(ctx, group);
    } else if (sub === 'remove') {
      const name = group.name;
      const still = removePage(group, ctx.pageId);
      say(ctx, still ? 'messages.pageRemoved' : 'messages.groupDeleted', {
        page: pageName(ctx.pageId),
        name,
      });
      if (still) {
        showGroup(ctx, group);
      }
    } else if (sub === 'rename') {
      const name = rest.slice(1).join(' ').trim();
      if (!name) {
        fail(ctx, 'noName');
        return;
      }
      const clash = findGroup(name);
      if (clash && clash.id !== group.id) {
        fail(ctx, 'groupExists', { name });
        return;
      }
      group.name = name;
      showGroup(ctx, group);
    } else if (sub === 'source') {
      if (!group.pages.includes(ctx.pageId)) {
        fail(ctx, 'pageNotInGroup', { page: pageName(ctx.pageId), name: group.name });
        return;
      }
      setSource(group, ctx.pageId);
      showGroup(ctx, group);
    } else if (sub === 'delete') {
      if ((rest[1] || '').toLowerCase() !== 'yes') {
        say(ctx, 'messages.notConfirmed');
        return;
      }
      const name = group.name;
      deleteGroup(group);
      say(ctx, 'messages.groupDeleted', { name });
    } else {
      fail(ctx, 'unknownCommand', { command: `group ${sub}` });
    }
  }

  /**
   * Works out which of a group's pages `hide`/`show` acts on.
   *
   * @param {object} group Group.
   * @param {string} where `here`, `others`, `all` or `page=<ref,ref>`.
   * @param {string} pageId The object's page.
   * @returns {string[]} Page IDs.
   */
  function targetPages(group, where, pageId) {
    const w = toText(where).toLowerCase() || 'here';
    if (w === 'others') {
      return group.pages.filter((p) => p !== pageId);
    }
    if (w === 'all') {
      return [...group.pages];
    }
    if (w.startsWith('page=')) {
      return splitList(where.slice(5))
        .map((ref) => findPage(ref, group))
        .filter(Boolean);
    }
    return [pageId];
  }

  /**
   * Handles `hide` and `show`.
   *
   * @param {object} ctx Context.
   * @param {boolean} hide True to hide.
   * @param {string} where Target.
   * @returns {void}
   */
  function visibilityCommand(ctx, hide, where) {
    if (!ctx.objects.length) {
      fail(ctx, 'nothingSelected');
      return;
    }
    let done = 0;
    let fallback = 0;
    let skipped = 0;
    let lastGroup = null;
    for (const obj of ctx.objects) {
      const found = linkOf(obj.id);
      if (!found) {
        skipped += 1;
        continue;
      }
      lastGroup = found.group;
      for (const p of targetPages(found.group, where, obj.get('_pageid'))) {
        const r = hide
          ? hideCopy(found.group, found.linkId, p)
          : showCopy(found.group, found.linkId, p);
        if (r.ok) {
          done += 1;
          if (r.fallback) {
            fallback += 1;
          }
        }
      }
    }
    if (ctx.flags.back === 'players' && lastGroup) {
      showPlayers(ctx, lastGroup);
    } else {
      say(ctx, hide ? 'messages.hidden' : 'messages.shown', { count: done, skipped });
    }
    if (fallback) {
      say(ctx, 'messages.hideFallback', { count: fallback });
    }
  }

  /**
   * Handles `request <id> [answer]`: a button on an earlier card.
   *
   * @param {object} ctx Context.
   * @param {string[]} args Words.
   * @returns {void}
   */
  function requestCommand(ctx, args) {
    const r = takeRequest(args[0]);
    if (!r.ok) {
      fail(ctx, r.reason === 'expired' ? 'requestExpired' : 'requestUnknown');
      return;
    }
    const answer = (args[1] || '').toLowerCase();
    const p = r.payload || {};
    const group = getState().groups[p.groupId];
    if (!group) {
      fail(ctx, 'noGroup', { name: p.groupId || '' });
      return;
    }
    if (r.kind === 'deleteAll') {
      if (answer === 'keep') {
        say(ctx, 'messages.keptOthers');
        return;
      }
      const n = removeCopies(group, p.linkId, null, 'delete');
      dropLink(group, p.linkId);
      // One entry for the whole delete, so the card's Undo puts everything back.
      const first = group.recycle.findIndex((e) => e.id === p.entry);
      if (n > 0 && first > 0) {
        group.recycle[first].items.push(...group.recycle[0].items);
        group.recycle.shift();
      }
      say(ctx, 'messages.deletedEverywhere', { count: n });
      return;
    }
    if (r.kind === 'restore') {
      const n = group.recycle.findIndex((e) => e.id === p.entry);
      if (n < 0) {
        fail(ctx, 'requestUnknown');
        return;
      }
      const res = restoreEntry(group, n);
      say(ctx, 'messages.restored', { count: res.restored, failed: res.failed });
      return;
    }
    if (r.kind === 'leftover' && Array.isArray(p.ids)) {
      let n = 0;
      for (const id of p.ids) {
        const obj = findAny(id);
        if (!obj || linkOf(id)) {
          continue;
        }
        if (answer === 'copy') {
          mirrorNew(group, obj);
        } else {
          markPageOnly(group, id);
        }
        n += 1;
      }
      say(ctx, answer === 'copy' ? 'messages.leftoversCopied' : 'messages.leftoversKept', {
        count: n,
      });
    }
  }

  /**
   * Handles `repair`.
   *
   * @param {object} ctx Context.
   * @param {string[]} args Words.
   * @returns {void}
   */
  function repairCommand(ctx, args) {
    const dryRun = ctx.flags['dry-run'] === true || ctx.flags.dryrun === true;
    const yes = args.some((a) => a.toLowerCase() === 'yes');
    const refs = args.filter((a) => a.toLowerCase() !== 'yes');
    const groups =
      refs[0]?.toLowerCase() === 'all'
        ? listGroups()
        : [resolveGroup(ctx, refs.join(' ') || undefined)].filter(Boolean);
    if (!groups.length) {
      fail(ctx, 'noGroup', { name: refs.join(' ') || pageName(ctx.pageId) });
      return;
    }
    for (const group of groups) {
      if (dryRun) {
        showRepair(ctx, group, repairGroup(group, { dryRun: true }), true);
        continue;
      }
      if (!yes) {
        const preview = repairGroup(group, { dryRun: true });
        if (repairTotal(preview) > CONFIRM_REPAIR_OVER) {
          showRepair(ctx, group, preview, true);
          continue;
        }
      }
      showRepair(ctx, group, repairGroup(group, { gm: ctx.playerId }), false);
    }
  }

  /**
   * Handles `set`.
   *
   * @param {object} ctx Context.
   * @param {string[]} args Words.
   * @returns {void}
   */
  function setCommand(ctx, args) {
    let group = null;
    let rest = args;
    if ((args[0] || '').toLowerCase() === 'group') {
      group = findGroup(args[1]);
      if (!group) {
        fail(ctx, 'noGroup', { name: args[1] || '' });
        return;
      }
      rest = args.slice(2);
    }
    const key = findSettingKey(rest[0]);
    if (!key) {
      fail(ctx, 'unknownSetting', { key: rest[0] || '' });
      return;
    }
    const value = rest.slice(1).join(' ');
    const result = setSetting(key, value, group);
    if (!result.ok) {
      fail(ctx, result.reason === 'globalOnly' ? 'globalOnly' : 'badValue', { key, value });
      return;
    }
    if (key === 'language') {
      installHandouts();
      ctx.lang = getLang();
    }
    showSettings(ctx, group);
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
    const words = parseCommand(msg.content);
    if (!words) {
      return;
    }
    if (Date.now() - lastSweep > SWEEP_EVERY_MS) {
      lastSweep = Date.now();
      sweepRequests();
    }
    const { args, flags } = takeFlags(words);
    const ctx = buildContext(msg, flags);
    const sub = (args[0] || 'menu').toLowerCase();
    const rest = args.slice(1);

    if (!playerIsGM(msg.playerid)) {
      if (['players', 'where', 'menu'].includes(sub) && getSetting('playerMenu') === 'players') {
        showWhere(ctx);
      } else {
        fail(ctx, 'gmOnly');
      }
      return;
    }

    switch (sub) {
      case 'menu':
        showMenu(ctx);
        break;
      case 'help':
        showHelp(ctx);
        break;
      case 'handouts':
      case 'journal':
        installHandouts();
        say(ctx, 'messages.handouts');
        break;
      case 'group':
        groupCommand(ctx, rest);
        break;
      case 'players': {
        const group = resolveGroup(ctx, rest.join(' ') || undefined);
        if (!group) {
          fail(ctx, 'noGroup', { name: rest.join(' ') || pageName(ctx.pageId) });
          break;
        }
        gmMemory(ctx.playerId).lastGroup = group.id;
        showPlayers(ctx, group);
        break;
      }
      case 'move': {
        const group = resolveGroup(ctx);
        if ((rest[0] || '').toLowerCase() === 'all') {
          const pageId = findPage(rest.slice(1).join(' '), group || undefined);
          if (!group || !pageId) {
            fail(ctx, 'noPage', { page: rest.slice(1).join(' ') });
            break;
          }
          const n = gatherPlayers(group, pageId);
          say(ctx, 'messages.movedAll', { count: n, page: pageName(pageId) });
          showPlayers(ctx, group);
          break;
        }
        const player =
          getObj('player', rest[0]) ||
          findObjs({ _type: 'player' }).find(
            (p) => toText(p.get('displayname')).toLowerCase() === toText(rest[0]).toLowerCase()
          );
        const pageId = findPage(rest.slice(1).join(' '), group || undefined);
        if (!player || !pageId) {
          fail(ctx, player ? 'noPage' : 'noPlayer', {
            page: rest.slice(1).join(' '),
            player: rest[0] || '',
          });
          break;
        }
        movePlayer(player.id, pageId);
        if (group) {
          showPlayers(ctx, group);
        } else {
          say(ctx, 'messages.moved', { player: player.get('displayname'), page: pageName(pageId) });
        }
        break;
      }
      case 'layout': {
        const action = (rest[0] || 'save').toLowerCase();
        const group = resolveGroup(ctx, rest.slice(1).join(' ') || undefined);
        if (!group) {
          fail(ctx, 'noGroup', { name: rest.slice(1).join(' ') });
          break;
        }
        if (action === 'restore') {
          say(ctx, 'messages.layoutRestored', { count: restoreLayout(group) });
        } else if (action === 'reset') {
          group.layout = {};
          say(ctx, 'messages.layoutReset');
        } else {
          say(ctx, 'messages.layoutSaved', { count: saveLayout(group) });
        }
        break;
      }
      case 'hide':
      case 'show':
        visibilityCommand(ctx, sub === 'hide', rest[0]);
        break;
      case 'status':
        showStatus(ctx);
        break;
      case 'unlink': {
        let n = 0;
        for (const obj of ctx.objects) {
          const found = linkOf(obj.id);
          if (found) {
            unlinkPage(found.group, found.linkId, obj.get('_pageid'));
            markPageOnly(found.group, obj.id);
            n += 1;
          }
        }
        say(ctx, 'messages.unlinked', { count: n });
        break;
      }
      case 'repair':
        repairCommand(ctx, rest);
        break;
      case 'pause':
      case 'resume': {
        const group = resolveGroup(
          ctx,
          rest.filter((w) => !['sync', 'keep'].includes(w.toLowerCase())).join(' ') || undefined
        );
        if (!group) {
          fail(ctx, 'noGroup', { name: rest.join(' ') });
          break;
        }
        group.paused = sub === 'pause';
        if (sub === 'resume') {
          const preview = repairGroup(group, { dryRun: true });
          say(ctx, 'messages.resumed', { name: group.name, count: repairTotal(preview) });
          if (repairTotal(preview) > 0) {
            showRepair(ctx, group, preview, true);
          }
        } else {
          say(ctx, 'messages.paused', { name: group.name });
        }
        break;
      }
      case 'undo': {
        const group = resolveGroup(ctx, rest.join(' ') || undefined);
        if (!group || !group.recycle.length) {
          say(ctx, 'messages.nothingToUndo');
          break;
        }
        const res = restoreEntry(group, 0);
        say(ctx, 'messages.restored', { count: res.restored, failed: res.failed });
        break;
      }
      case 'recycle': {
        const i = rest.findIndex((w) => ['restore', 'empty'].includes(w.toLowerCase()));
        const ref = (i >= 0 ? rest.slice(0, i) : rest).join(' ');
        const group = resolveGroup(ctx, ref || undefined);
        if (!group) {
          fail(ctx, 'noGroup', { name: ref });
          break;
        }
        const action = i >= 0 ? rest[i].toLowerCase() : '';
        if (action === 'restore') {
          const n = Math.max(1, Number(rest[i + 1]) || 1) - 1;
          const res = restoreEntry(group, n);
          say(ctx, res.ok ? 'messages.restored' : 'messages.nothingToUndo', {
            count: res.restored,
            failed: res.failed,
          });
        } else if (action === 'empty') {
          if ((rest[i + 1] || '').toLowerCase() === 'yes') {
            group.recycle = [];
            say(ctx, 'messages.recycleEmptied');
          } else {
            say(ctx, 'messages.notConfirmed');
          }
        }
        showRecycle(ctx, group);
        break;
      }
      case 'settings':
      case 'config': {
        const words2 = rest.map((w) => w.toLowerCase());
        if (sub === 'config' && rest[0]?.includes('|')) {
          // 0.1.x: config key|value
          const [k, v] = rest[0].split('|');
          if (k === 'command' && /^[a-z0-9_-]+$/i.test(v || '')) {
            getState().aliases.push(`!${v.toLowerCase()}`);
          }
        }
        if (words2[0] === 'reset') {
          const group = words2[1] === 'group' ? findGroup(rest[2]) : null;
          const confirmed = words2.includes('yes');
          if (confirmed) {
            resetSettings(group);
            say(ctx, 'messages.settingsReset');
          } else {
            say(ctx, 'messages.notConfirmed');
          }
          showSettings(ctx, group);
          break;
        }
        const group = words2[0] === 'group' ? findGroup(rest[1]) : null;
        if (words2[0] === 'group' && !group) {
          fail(ctx, 'noGroup', { name: rest[1] || '' });
          break;
        }
        showSettings(ctx, group);
        break;
      }
      case 'set':
        setCommand(ctx, rest);
        break;
      case 'reset':
        say(ctx, 'messages.resetMoved', { command: `${COMMAND} settings reset` });
        break;
      case 'request':
        requestCommand(ctx, rest);
        break;
      case 'prune': {
        const r = prune();
        say(ctx, 'messages.pruned', { links: r.links, pages: r.pages });
        break;
      }
      default:
        fail(ctx, 'unknownCommand', { command: sub });
    }
  }

  // Carrying a 0.1.x set-up over: pages named "<name>_synced" become a group
  // named <name>, 0.1.x's object links are kept where both objects still
  // exist, and its show/hide flags in GM Notes become per-copy visibility.

  const SUFFIX = /_synced$/i;
  const FLAG_TEXT = /(%3Cbr%3E|<br\s*\/?>)?(show|hide)_(here|others)(undefined)?/gi;

  /**
   * Reads 0.1.x's flags from a token's GM Notes.
   *
   * @param {string} notes GM Notes.
   * @returns {Set<string>} Flags such as `hide_here`.
   */
  function readFlags(notes) {
    const out = new Set();
    const text = toText(notes);
    for (const m of text.matchAll(/(show|hide)_(here|others)/gi)) {
      out.add(`${m[1].toLowerCase()}_${m[2].toLowerCase()}`);
    }
    return out;
  }

  /**
   * Removes 0.1.x's flags (and the "undefined" its bug wrote) from GM Notes.
   *
   * @param {string} notes GM Notes.
   * @returns {string} Clean notes.
   */
  function stripFlags(notes) {
    return toText(notes)
      .replaceAll(FLAG_TEXT, '')
      .replace(/^(%3Cbr%3E)+/i, '');
  }

  /**
   * Migrates 0.1.x's set-up once.
   *
   * @returns {{groups: number, links: number, hidden: number, trueCopy: boolean}|null}
   *   What was carried over, or null when there was nothing (or it was done before).
   */
  function migrateLegacy() {
    const s = getState();
    if (s.notices.migrated) {
      return null;
    }
    const legacy = isRecord(state[LEGACY_STATE_KEY]) ? state[LEGACY_STATE_KEY] : null;
    const pages = findObjs({ _type: 'page' });
    const copies = pages.filter((p) => SUFFIX.test(toText(p.get('name'))));
    if (!legacy && !copies.length) {
      s.notices.migrated = true;
      return null;
    }
    const result = { groups: 0, links: 0, hidden: 0, trueCopy: false };
    const config = isRecord(legacy?.config) ? legacy.config : {};
    const command = toText(config.command).toLowerCase();
    if (command && !COMMAND_ALIASES.includes(`!${command}`) && /^[a-z0-9_-]+$/.test(command)) {
      s.aliases.push(`!${command}`);
    }
    if (config.refresh_sync === false) {
      setSetting('repairOnStart', 'off');
    }
    if (config.true_copy === true) {
      result.trueCopy = true;
      s.notices.trueCopy = true;
    }

    // Groups: "<name>_synced" pages joined to the page called exactly <name>.
    const byBase = new Map();
    for (const copy of copies) {
      const base = toText(copy.get('name')).replace(SUFFIX, '').trim();
      const original = pages.find(
        (p) =>
          toText(p.get('name')).toLowerCase() === base.toLowerCase() &&
          !SUFFIX.test(toText(p.get('name')))
      );
      if (!original || groupOfPage(copy.id)) {
        continue;
      }
      if (!byBase.has(original.id)) {
        byBase.set(original.id, { base, original, copies: [] });
      }
      byBase.get(original.id).copies.push(copy);
    }

    for (const { base, original, copies: list } of byBase.values()) {
      const group = groupOfPage(original.id) || createGroup(base, original.id);
      result.groups += 1;
      for (const copy of list) {
        if (!group.pages.includes(copy.id)) {
          group.pages.push(copy.id);
        }
      }
      // 0.1.x's own links, where every object still exists.
      const old = isRecord(legacy?.synced_pages) ? legacy.synced_pages[base.toLowerCase()] : null;
      for (const ids of Array.isArray(old) ? old : []) {
        if (!Array.isArray(ids)) {
          continue;
        }
        const objs = ids
          .map((id) => findAny(toText(id)))
          .filter(
            (o) =>
              o &&
              SYNC_TYPES.includes(o.get('_type')) &&
              group.pages.includes(o.get('_pageid')) &&
              !linkOf(o.id)
          );
        const first = objs.find((o) => o.get('_pageid') === original.id);
        if (!first) {
          continue;
        }
        const objects = {};
        for (const o of objs) {
          if (!objects[o.get('_pageid')] && o.get('_type') === first.get('_type')) {
            objects[o.get('_pageid')] = o.id;
          }
        }
        if (Object.keys(objects).length > 1) {
          newLink(
            group,
            first.get('_type'),
            objects,
            fingerprint(first.get('_type'), readProps(first))
          );
          result.links += 1;
        }
      }
      // Everything else is matched the 1.0 way. Copies 0.1.x rebuilt on every
      // start sit where their originals are, so they pair by fingerprint.
      adoptPage(group, original.id);
      for (const copy of list) {
        pairPage(group, copy.id, { copyMissing: true });
      }

      // GM Notes flags become per-copy visibility.
      for (const [linkId, link] of Object.entries(group.links)) {
        for (const [pageId, objId] of Object.entries({ ...link.objects })) {
          const obj = getObj(link.type, objId);
          if (!obj || link.type !== 'graphic') {
            continue;
          }
          const notes = toText(obj.get('gmnotes'));
          const flags = readFlags(notes);
          if (!flags.size) {
            continue;
          }
          const targets = [];
          if (flags.has('hide_here')) {
            targets.push(pageId);
          }
          if (flags.has('hide_others') && !flags.has('show_here')) {
            targets.push(...group.pages.filter((p) => p !== pageId));
          }
          for (const p of targets) {
            if (hideCopy(group, linkId, p).ok) {
              result.hidden += 1;
            }
          }
          obj.set('gmnotes', stripFlags(notes));
        }
      }
    }
    // Links the loops above may have made point at objects from every page.
    for (const group of Object.values(s.groups)) {
      for (const [linkId, link] of Object.entries(group.links)) {
        for (const [pageId, objId] of Object.entries(link.objects)) {
          setLinkObject(group, linkId, pageId, objId);
        }
      }
    }
    s.notices.migrated = true;
    return result;
  }

  // SyncPage: start-up, event wiring and the public SyncPage object.

  let started = false;
  // How long after start the repair waits, so Roll20 has loaded every page.
  const START_REPAIR_DELAY_MS = 2000;

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
        log(`SyncPage: ${label} failed: ${e?.stack || e}`);
      }
    };
  }

  /**
   * Repairs every group on start, as the repairOnStart setting says.
   *
   * @returns {void}
   */
  function repairOnStart() {
    const mode = getSetting('repairOnStart');
    if (mode === 'off') {
      return;
    }
    const lang = getLang();
    const lines = [];
    for (const group of listGroups()) {
      if (group.paused) {
        continue;
      }
      const counts = repairGroup(group);
      if (repairTotal(counts) > 0) {
        lines.push(
          `<div>${escapeHtml(t('messages.startRepair', lang, { name: group.name, drifted: counts.drifted, recreated: counts.recreated, removed: counts.removed + counts.dropped, mirrored: counts.mirrored }))}</div>`
        );
      }
    }
    if (mode === 'report' && lines.length) {
      whisper(null, t('titles.repairedOnStart', lang), lines);
    }
  }

  /**
   * Starts SyncPage once Roll20 is ready.
   *
   * @returns {void}
   */
  function start() {
    if (started) {
      return;
    }
    started = true;
    const { fresh } = initialiseState();
    applyGlobalConfig();
    rebuildIndex();
    const migrated = migrateLegacy();
    prune();
    const lang = getLang();

    on('chat:message', guarded('chat:message', handleChat));
    for (const type of SYNC_TYPES) {
      on(`add:${type}`, guarded(`add:${type}`, handleAdd));
      on(`change:${type}`, guarded(`change:${type}`, handleChange));
      on(`destroy:${type}`, guarded(`destroy:${type}`, handleDestroy));
    }
    on('change:page', guarded('change:page', handlePageChange));
    on('destroy:page', guarded('destroy:page', handlePageDestroy));
    if (typeof TokenMod !== 'undefined' && typeof TokenMod.ObserveTokenChange === 'function') {
      TokenMod.ObserveTokenChange(guarded('TokenMod', (obj, prev) => notify(obj, prev)));
    }
    installHandouts();
    setTimeout(guarded('repair on start', repairOnStart), START_REPAIR_DELAY_MS);

    log(`-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} [Updated: ${SCRIPT_LAST_UPDATED}] <=-`);
    if (fresh || migrated) {
      const lines = [t('messages.readyHint', lang)];
      if (migrated) {
        lines.push(
          t('messages.migrated', lang, {
            groups: migrated.groups,
            links: migrated.links,
            hidden: migrated.hidden,
          })
        );
        if (migrated.trueCopy) {
          lines.push(t('messages.trueCopyGone', lang));
        }
      }
      whisper(
        null,
        t('titles.ready', lang),
        lines.map((l) => `<div>${escapeHtml(l)}</div>`).join('')
      );
    }
  }

  on('ready', start);

  /**
   * Describes a group for other Mods.
   *
   * @param {object|null} group Group.
   * @returns {object|null} Summary.
   */
  function describe(group) {
    return group
      ? {
          id: group.id,
          name: group.name,
          source: group.source,
          pages: [...group.pages],
          paused: group.paused,
        }
      : null;
  }

  /**
   * The public SyncPage object. 0.1.x's PascalCase functions are kept as
   * harmless no-ops for Mods that call them.
   */
  const api = {
    version: SCRIPT_VERSION,
    getGroup: (pageId) => describe(groupOfPage(pageId) || findGroup(pageId)),
    getLinked: (obj) => {
      const id = typeof obj === 'string' ? obj : obj?.id;
      const found = id ? linkOf(id) : null;
      return found ? { ...found.link.objects } : null;
    },
    notify: (obj, prev) => notify(typeof obj === 'string' ? findAny(obj) : obj, prev),
    isHidden: (obj, pageId) => {
      const id = typeof obj === 'string' ? obj : obj?.id;
      const found = id ? linkOf(id) : null;
      const page = pageId || (typeof obj === 'object' ? obj?.get('_pageid') : null);
      return !!(found && page && hiddenOn(found.group, found.linkId, page));
    },
    onSync,
    repair: (ref, options = {}) => {
      const group = findGroup(ref) || groupOfPage(ref);
      return group ? repairGroup(group, options) : null;
    },
    CheckInstall: () => {},
    RegisterEventHandlers: () => {},
    CheckSyncedPages: () => {},
  };

  globalThis.SyncPage = api;
})();
