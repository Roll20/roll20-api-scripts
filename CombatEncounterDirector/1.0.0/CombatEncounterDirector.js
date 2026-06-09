/**
 * NOTE: GENERATED FILE - DO NOT EDIT DIRECTLY.
 * NOTE: Source files live under src/ and are bundled with `npm run build`.
 * ------------------------------------------------
 * Name: Combat Encounter Director
 * Script: CombatEncounterDirector.js
 * Version: 1.0.0
 * Built: 2026-06-06T08:58:04.220Z
 */
const CombatEncounterDirectorMod = (() => {
  'use strict';

  // Build-time placeholders replaced by rollup.config.js inject-build-metadata plugin.
  const SCRIPT_NAME = 'Combat Encounter Director';
  const SCRIPT_VERSION = '1.0.0';
  const SCRIPT_LAST_UPDATED = '2026-06-06T08:58:04.220Z';

  const DEFAULT_LOCALE$1 = 'en-US';

  const STATE_KEY = 'CombatEncounterDirector';
  const COMMAND = '!director';

  const JOURNAL_PANEL_NAME = 'Combat Encounter Director - Command Deck';
  const JOURNAL_STATUS_NAME = 'Combat Encounter Director - Status';

  // Command Deck views
  const DECK_VIEW_KEYS = ['all', 'scaling', 'positioning', 'admin'];
  const DEFAULT_DECK_VIEW = 'all';
  const DECK_VIEWS = {
    all: { label: 'All' },
    scaling: { label: 'Scaling' },
    positioning: { label: 'Positioning' },
    admin: { label: 'Admin' },
  };

  // Token bars
  const VALID_HP_BARS = ['bar1', 'bar2', 'bar3'];
  const VALID_AC_BARS = ['bar1', 'bar2', 'bar3', 'none'];
  const DEFAULT_HP_BAR = 'bar1';
  const DEFAULT_AC_BAR = 'bar2';

  // Roll20 layer identifiers
  const LAYER_TOKEN = 'objects';
  const LAYER_GM = 'gmlayer';
  const LAYER_MAP = 'map';
  const VALID_LAYERS = [LAYER_TOKEN, LAYER_GM, LAYER_MAP];

  /**
   * Party-size scaling presets.
   *
   * hp / damage are percentages of the base value.
   * ac is a flat modifier added to base AC.
   */
  const PARTY_PRESETS = {
    solo: { label: 'Solo', partySize: 1, hp: 25, ac: -2, damage: 75 },
    duo: { label: 'Duo', partySize: 2, hp: 50, ac: -1, damage: 85 },
    small: { label: 'Small Party', partySize: 3, hp: 75, ac: 0, damage: 90 },
    standard: { label: 'Standard Party', partySize: 4, hp: 100, ac: 0, damage: 100 },
    large: { label: 'Large Party', partySize: 6, hp: 140, ac: 1, damage: 120 },
    convention: { label: 'Convention Table', partySize: 10, hp: 200, ac: 2, damage: 150 },
    massive: { label: 'Massive Table', partySize: 20, hp: 300, ac: 3, damage: 200 },
  };

  /**
   * Boss-type presets.
   *
   * For 'set' hpMode the hp value replaces the token's HP directly.
   * For 'percent' hpMode the hp value is a percentage of original max HP.
   * ac is a flat modifier added to original AC.
   * damage is a percentage of base damage.
   */
  const BOSS_PRESETS = {
    minion: { label: 'Minion', hpMode: 'set', hp: 1, ac: -2, damage: 50 },
    elite: { label: 'Elite', hpMode: 'percent', hp: 150, ac: 1, damage: 125 },
    boss: { label: 'Boss', hpMode: 'percent', hp: 300, ac: 2, damage: 150 },
    legendary: { label: 'Legendary', hpMode: 'percent', hp: 500, ac: 3, damage: 200 },
  };

  const VALID_BOSS_PRESETS = new Set(Object.keys(BOSS_PRESETS));
  const VALID_PARTY_PRESETS = new Set(Object.keys(PARTY_PRESETS));

  // Duplicate counts offered in the journal panel
  const DUPLICATE_OPTIONS = [2, 3, 5, 10];

  // Maximum total tokens created in a single duplicate operation across all selected tokens
  const MAX_TOTAL_DUPLICATES = 100;

  // Encounter name constraints: letters, digits, spaces, hyphens, underscores; max 64 chars
  const ENCOUNTER_NAME_RE = /^[a-zA-Z0-9 _-]{1,64}$/;

  // Color palette
  const COLOR_HEADER_BG = '#1a1a2e';
  const COLOR_HEADER_TEXT = '#c8b8a2';
  const COLOR_CARD_BG_TOP = '#16213e';
  const COLOR_CARD_BG_BOTTOM = '#0f3460';
  const COLOR_BORDER = '#2a2a4a';
  const COLOR_TEXT = '#d0cfc8';
  const COLOR_MUTED = '#888888';
  const COLOR_ACCENT = '#e94560';
  const COLOR_BUTTON_BG = '#e94560';
  const COLOR_BUTTON_TEXT = '#ffffff';
  const COLOR_CHANGED = '#f59e0b';
  const COLOR_WARNING_BG = '#fef3c7';
  const COLOR_WARNING_BORDER = '#92400e';
  const COLOR_WARNING_TEXT = '#92400e';
  const COLOR_ERROR_BG = '#fee2e2';
  const COLOR_ERROR_BORDER = '#991b1b';
  const COLOR_ERROR_TEXT = '#991b1b';

  /**
   * Returns true when the value is a non-null plain object.
   *
   * @param {*} value Value to test.
   * @returns {boolean} True when value is a plain object.
   */
  function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  /**
   * Coerces a Roll20 attribute value to a string.
   *
   * @param {*} value Raw Roll20 value.
   * @returns {string} String representation.
   */
  function toText(value) {
    if (value === undefined || value === null) {
      return '';
    }
    return String(value);
  }

  /**
   * Escapes HTML special characters to prevent XSS in chat/handout output.
   *
   * @param {string} text Raw text.
   * @returns {string} Escaped text.
   */
  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Returns a Roll20 Graphic token object by ID, or null when not found.
   *
   * @param {string} tokenId Roll20 graphic ID.
   * @returns {Graphic|null} Token object or null.
   */
  function getGraphicToken(tokenId) {
    if (!tokenId) {
      return null;
    }
    return getObj('graphic', tokenId) || null;
  }

  /**
   * Returns the display name of a token, falling back to 'Unknown Token'.
   *
   * @param {Graphic} token Roll20 Graphic object.
   * @returns {string} Token name.
   */
  function getTokenName(token) {
    return toText(token?.get('name')) || 'Unknown Token';
  }

  /**
   * Returns all GM player IDs currently in the campaign.
   *
   * @returns {string[]} Array of GM player IDs.
   */
  function getGmPlayerIds() {
    return findObjs({ type: 'player' })
      .filter((player) => playerIsGM(player.id))
      .map((player) => player.id);
  }

  /**
   * Safely reads a Roll20 token bar value, distinguishing blank/absent from zero.
   *
   * Roll20 returns an empty string ("") when a bar has never been set. This is
   * fundamentally different from a bar explicitly set to 0. Writing any value
   * (including 0) to a previously-blank bar activates it and makes it visible in
   * the token HUD — so callers must check `valid` before writing.
   *
   * @param {*} raw Raw bar value from token.get().
   * @returns {{ valid: boolean, value: number }}
   *   valid = false → bar is blank or unparseable; do NOT write to the bar.
   *   valid = true  → bar has an explicit numeric value (may be 0).
   */
  function readBarSafe(raw) {
    const s = toText(raw).trim();
    if (s === '') {
      return { valid: false, value: 0 };
    }
    const n = parseInt(s, 10);
    return Number.isFinite(n) ? { valid: true, value: n } : { valid: false, value: 0 };
  }

  /**
   * Strictly parses an integer from a string, rejecting partial matches like "150abc" or "6players".
   * Only strings that consist entirely of an optional sign followed by digits are accepted.
   *
   * @param {*} raw Raw value to parse.
   * @returns {number} Parsed integer, or NaN when the input is not a strict integer string.
   */
  function parseStrictInt(raw) {
    const s = String(raw === undefined || raw === null ? '' : raw).trim();
    if (!/^[+-]?\d+$/.test(s)) {
      return NaN;
    }
    return parseInt(s, 10);
  }

  /**
   * Rounds a number to the nearest integer, with a minimum of 1.
   *
   * @param {number} value Value to round.
   * @returns {number} Rounded value, at least 1.
   */
  function roundAtLeastOne(value) {
    return Math.max(1, Math.round(value));
  }

  /**
   * Returns the page ID for a given token.
   *
   * @param {Graphic} token Roll20 Graphic object.
   * @returns {string} Page ID.
   */
  function getTokenPageId(token) {
    return toText(token?.get('_pageid'));
  }

  /**
   * Returns the current page ID viewed by a specific player.
   * Falls back to the first GM's page when no player ID is supplied.
   *
   * Use this instead of getCurrentPageId() when the calling command has access
   * to the GM's player ID — it avoids targeting the wrong page in multi-GM games.
   *
   * @param {string} [playerId] Roll20 player ID.
   * @returns {string} Current page ID.
   */
  function getPlayerPageId(playerId) {
    if (playerId) {
      const player = getObj('player', playerId);
      if (player) {
        return toText(player.get('lastpage')) || toText(Campaign().get('playerpageid'));
      }
    }
    return getCurrentPageId();
  }

  /**
   * Returns the current page ID viewed by the GM.
   * Prefer getPlayerPageId(playerId) when a player ID is available.
   *
   * @returns {string} Current page ID.
   */
  function getCurrentPageId() {
    const player = findObjs({ type: 'player' }).find((p) => playerIsGM(p.id));
    if (!player) {
      return '';
    }
    return toText(player.get('lastpage')) || toText(Campaign().get('playerpageid'));
  }

  /**
   * Returns all graphic tokens on the given page (all layers).
   *
   * @param {string} pageId Roll20 page ID.
   * @returns {Graphic[]} Token objects.
   */
  function getTokensOnPage(pageId) {
    if (!pageId) {
      return [];
    }
    return findObjs({ type: 'graphic', _pageid: pageId, subtype: 'token' });
  }

  /**
   * Converts a Roll20 image URL to the thumb-sized format required by createObj.
   *
   * Roll20's API rejects imgsrc values that are not thumb-sized URLs from the
   * user's library. token.get('imgsrc') often returns a 'med' or 'max' variant;
   * this converts it to 'thumb' so createObj accepts it.
   *
   * If the URL does not match the expected Roll20 image path pattern, the
   * original string is returned unchanged.
   *
   * @param {string} imgsrc Raw imgsrc value from token.get('imgsrc').
   * @returns {string} Thumb-format URL, or the original string when not matched.
   */
  function getCleanImgsrc(imgsrc) {
    if (!imgsrc) {
      return '';
    }
    const parts = imgsrc.match(/(.*\/images\/.*?)(thumb|med|original|max)(\..*?)(\?.*)?$/);
    if (parts) {
      return parts[1] + 'thumb' + parts[3] + (parts[4] || '');
    }
    return imgsrc;
  }

  /**
   * Formats a timestamp as "DD MMM YYYY, HH:MM:SS TZ".
   *
   * The timezone abbreviation is resolved via Intl.DateTimeFormat (e.g. "BST",
   * "EST", "UTC"). If Intl is unavailable the abbreviated name is derived from
   * the parenthesised full name in toTimeString() by taking the first letter of
   * each word (e.g. "British Summer Time" → "BST"). Note: the time reflects the
   * Roll20 server's local timezone, not the GM's browser timezone.
   *
   * @param {number} timestamp Unix timestamp in milliseconds.
   * @returns {string} Formatted date-time string, or 'Never' for falsy input.
   */
  function formatTimestamp(timestamp) {
    if (!timestamp) {
      return 'Never';
    }

    const d = new Date(timestamp);
    const MONTHS = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const day = String(d.getDate()).padStart(2, '0');
    const month = MONTHS[d.getMonth()];
    const year = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');

    // Resolve timezone abbreviation.
    // Prefer Intl.DateTimeFormat which returns named abbreviations (BST, EST…).
    // Fall back to parsing the parenthesised name in toTimeString().
    let tz = 'UTC';
    try {
      const parts = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' }).formatToParts(d);
      const tzPart = parts.find((p) => p.type === 'timeZoneName');
      if (tzPart) {
        tz = tzPart.value;
      }
    } catch (_) {
      const match = d.toTimeString().match(/\(([^)]+)\)/);
      if (match) {
        tz = match[1]
          .split(/\s+/)
          .map((w) => w[0])
          .join('')
          .toUpperCase();
      }
    }

    return `${day} ${month} ${year}, ${hh}:${mm}:${ss} ${tz}`;
  }

  /**
   * Converts a percentage modifier to a display string.
   *
   * @param {number} pct Percentage value (100 = no change).
   * @returns {string} e.g. '150%', '100% (base)'
   */
  function formatPct(pct) {
    if (pct === 100) {
      return '100% (base)';
    }
    return `${pct}%`;
  }

  /**
   * Converts a flat modifier to a signed display string.
   *
   * @param {number} mod Modifier value.
   * @returns {string} e.g. '+2', '0', '-1'
   */
  function formatMod(mod) {
    if (mod === 0) {
      return '0';
    }
    return mod > 0 ? `+${mod}` : String(mod);
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
    'background:#2a3a5c',
    `color:${COLOR_TEXT}`,
    'border:1px solid #4a5a7a',
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
   * Sends a whisper to a specific player.
   *
   * @param {string} playerId Roll20 player ID.
   * @param {string} title Card header text.
   * @param {string|string[]} content HTML body content or array of HTML strings.
   * @returns {void}
   */
  function whisper(playerId, title, content) {
    const body = Array.isArray(content) ? content.join('') : content;
    const html = buildCard(title, body);
    sendChat(SCRIPT_NAME, `/w "${getPlayerDisplayName(playerId)}" ${html}`, null, {
      noarchive: true,
    });
  }

  /**
   * Sends a warning card whispered to a player.
   *
   * @param {string} playerId Roll20 player ID.
   * @param {string} message Warning message.
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
    const html = `<div style="${style}"><strong>Warning:</strong> ${escapeHtml(message)}</div>`;
    sendChat(SCRIPT_NAME, `/w "${getPlayerDisplayName(playerId)}" ${html}`, null, {
      noarchive: true,
    });
  }

  /**
   * Sends an error card whispered to a player.
   *
   * @param {string} playerId Roll20 player ID.
   * @param {string} message Error description.
   * @param {string} [hint] Optional hint explaining how to fix the error.
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
    const html = `<div style="${style}"><strong>Error:</strong> ${escapeHtml(message)}${hintHtml}</div>`;
    sendChat(SCRIPT_NAME, `/w "${getPlayerDisplayName(playerId)}" ${html}`, null, {
      noarchive: true,
    });
  }

  /**
   * Builds a styled chat card with a header and body.
   *
   * @param {string} title Header text.
   * @param {string} body HTML body content.
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
   * Builds a primary action button (red/accent).
   *
   * @param {string} label Button label.
   * @param {string} command Roll20 chat command the button triggers.
   * @returns {string} HTML anchor string.
   */
  function buildButton(label, command) {
    return `<a href="${escapeHtml(command)}" style="${BUTTON_STYLE}">${escapeHtml(label)}</a>`;
  }

  /**
   * Builds a secondary action button (dark/outline).
   *
   * @param {string} label Button label.
   * @param {string} command Roll20 chat command the button triggers.
   * @returns {string} HTML anchor string.
   */
  function buildSecondaryButton(label, command) {
    return `<a href="${escapeHtml(command)}" style="${BUTTON_SECONDARY_STYLE}">${escapeHtml(label)}</a>`;
  }

  /**
   * Builds a section label (small caps, muted).
   *
   * @param {string} text Section label text.
   * @returns {string} HTML string.
   */
  function buildSectionLabel(text) {
    return `<div style="${SECTION_LABEL_STYLE}">${escapeHtml(text)}</div>`;
  }

  /**
   * Builds a horizontal divider.
   *
   * @returns {string} HTML hr string.
   */
  function buildDivider() {
    return `<hr style="${DIVIDER_STYLE}">`;
  }

  /**
   * Builds an inline key-value row for status display.
   * Both label and value are HTML-escaped. Use buildRowHtml() when the value
   * is already trusted HTML that must not be double-escaped.
   *
   * @param {string} label Label text.
   * @param {string} value Value text (plain text — will be escaped).
   * @param {string} [valueColor] Optional color for the value.
   * @returns {string} HTML string.
   */
  function buildRow(label, value, valueColor) {
    const valueStyle = 'font-weight:bold;text-align:right';
    return [
      '<table style="width:100%;border-collapse:collapse;margin:1px 0"><tr>',
      `<td style="color:${COLOR_MUTED};width:55%">${escapeHtml(label)}</td>`,
      `<td style="${valueStyle};width:45%">${escapeHtml(String(value))}</td>`,
      '</tr></table>',
    ].join('');
  }

  /**
   * Returns a Roll20 player's display name, falling back to their ID.
   *
   * Double-quotes are stripped so the name is safe to embed in the
   * /w "name" whisper command without breaking the argument boundary.
   *
   * @param {string} playerId Roll20 player ID.
   * @returns {string} Sanitised display name or player ID.
   */
  function getPlayerDisplayName(playerId) {
    const player = getObj('player', playerId);
    const raw = player ? player.get('displayname') || playerId : playerId;
    return String(raw).replace(/"/g, '');
  }

  const TRANSLATION$n = {
    titles: {
      scriptReady: 'Skrip gereed',
      scalingApplied: 'Skaal toegepas',
      scalingPresetReady: 'Skaalvoorinstelling gereed',
      hpUpdated: 'HP-skaal opgedateer',
      acUpdated: 'AC-skaal opgedateer',
      damageUpdated: 'Skadeskalering opgedateer',
      bossPreset: 'Baasvoorinstelling: {preset}',
      partySize: 'Partytjiegrootte: {size}',
      reinforcementsCreated: 'Versterkings Geskep',
      tokensNumbered: 'Tokens genommer',
      layerChanged: 'Laag Verander',
      tokensHidden: 'Tekens versteek',
      tokensRevealed: 'Tekens onthul',
      positionsSaved: 'Posisies gestoor',
      positionsRestored: 'Posisies herstel',
      encounterSaved: 'Ontmoeting gestoor',
      encounterLoaded: 'Ontmoeting gelaai',
      encounterDeleted: 'Ontmoeting is uitgevee',
      savedEncounters: 'Gestoorde ontmoetings',
      tokensReset: 'Tokens Herstel',
      pageReset: 'Herstel bladsy',
      allReset: 'Alle tokens is teruggestel',
      reportUpdated: 'Verslag opgedateer',
      reportCleared: 'Verslag uitgevee',
      journalsRebuilt: 'Joernale herbou',
      deckUpdated: 'Command Deck opgedateer',
      configUpdated: 'Config opgedateer',
      currentConfig: 'Huidige Config',
      help: '{name} — Hulp',
    },
    errors: {
      unknownCommand: 'Onbekende opdrag: "{sub}".',
      unknownCommandHint: "Tik !director help vir 'n lys opdragte.",
      noTokensSelected: 'Geen tokens gekies nie. Kies eers tekens op die kaart.',
      unknownScaleAction: 'Onbekende skaalhandeling: "{action}".',
      scaleActionHint: 'Geldige aksies: voorafingestel, partytjie, hp, ac, skade, toepas',
      unknownPartyPreset: 'Onbekende partyvoorafinstelling: "{preset}".',
      partyPresetHint: 'Geldige voorafinstellings: {presets}',
      missingBossPreset: 'Ontbrekende baasvooringestelde naam.',
      missingBossPresetHint: 'Geldige voorafinstellings: {presets}',
      unknownBossPreset: 'Onbekende baasvoorinstelling: "{preset}".',
      unknownBossPresetHint: 'Geldige voorafinstellings: {presets}',
      unknownReinforceAction: 'Onbekende versterkingsaksie: "{action}".',
      reinforceActionHint: 'Geldige handelinge: dupliseer, optel, wys',
      noReinforcementsToReveal: 'Geen onlangse versterkings om te openbaar nie.',
      noReinforcementsToRevealHint: 'Gebruik eers !director versterk duplikaat.',
      unknownLayer: 'Onbekende laag: "{layer}".',
      layerHint: 'Geldige lae: teken, gm, kaart',
      unknownPositionAction: 'Onbekende posisie-handeling: "{action}".',
      positionActionHint: 'Geldige aksies: stoor, herstel',
      unknownEncounterAction: 'Onbekende ontmoetingshandeling: "{action}".',
      encounterActionHint: 'Geldige aksies: stoor, laai, verwyder, lys',
      encounterNameRequired: 'Naam van ontmoeting vereis.',
      encounterNameRequiredHint: 'Voorbeeld: !direkteur ontmoeting stoor kabouter-hinderlaag',
      encounterNotFound: 'Ontmoeting "{name}" nie gevind nie.',
      encounterNotFoundHint: 'Gebruik !directeur ontmoetingslys om gestoorde ontmoetings te sien.',
      unknownResetScope: 'Onbekende terugstelomvang: "{scope}".',
      resetScopeHint: 'Geldige omvang: gekies, bladsy, almal',
      unknownReportAction: 'Onbekende rapporteerhandeling: "{action}".',
      reportActionHint: 'Geldige handelinge: verfris, gekies, verander, skoon',
      unknownJournalAction: 'Onbekende joernaalhandeling: "{action}".',
      journalActionHint: 'Geldige aksies: herbou',
      unknownDeckView: 'Onbekende dekaansig: "{view}".',
      deckViewHint: 'Geldige aansigte: almal, skaal, posisionering, admin',
      unknownConfigKey: 'Onbekende konfigurasiesleutel: "{key}".',
      configKeyHint: 'Geldige sleutels: hp-bar, ac-bar, taal',
      invalidHpBar: 'Ongeldige HP-balk: "{value}".',
      invalidHpBarHint: 'Geldige opsies: {options}',
      invalidAcBar: 'Ongeldige AC-balk: "{value}".',
      invalidAcBarHint: 'Geldige opsies: {options}',
      invalidLanguage: 'Ongeldige taal: "{value}".',
      invalidLanguageHint: 'Ondersteun: {locales}',
      invalidPartySize:
        'Partytjiegrootte moet \'n getal tussen 1 en 30 wees (het "{value}") gekry.',
      invalidHpPercent:
        'HP-persentasie moet tussen 1 en 1000 wees (het "{value}") gekry. Voorbeeld: 150',
      invalidAcModifier:
        'AC-wysiger moet tussen -10 en +10 wees (het "{value} gekry"). Voorbeeld: +2',
      invalidDamagePercent:
        'Skadepersentasie moet tussen 1 en 1000 wees (het "{value}") gekry. Voorbeeld: 125',
      invalidDuplicateCount:
        'Duplikaattelling moet tussen 1 en 50 wees (het "{value}") gekry. Voorbeeld: 3',
      invalidEncounterName:
        'Ongeldige ontmoetingsnaam: "{name}". Name mag letters, syfers, spasies, koppeltekens en onderstrepings bevat (maksimum 64 karakters).',
      invalidEncounterNameHint: 'Voorbeeld: !direkteur ontmoeting stoor kabouter-hinderlaag',
      duplicateBurstLimit:
        "Operasie sal {requested} tekens skep, wat die limiet van {limit} oorskry. Kies minder tekens of gebruik 'n kleiner telling.",
      unexpectedError: "'n Onverwagte fout het voorgekom: {message}",
      unexpectedErrorHint: 'Gaan die API-konsole na vir besonderhede.',
    },
    confirm: {
      scalingPresetPending: 'Kies tekens en klik dan op Pas skaal toe.',
      journalsRebuilt: 'Command Deck en statusjoernaal is geregenereer.',
      deckUpdated: 'Die Command Deck is geregenereer deur die {view}-aansig te gebruik.',
      reportCleared: 'Verslag uitgevee.',
      scriptReadyHint:
        'Maak die Combat Encounter Director - Command Deck-joernaal vir die kontrolepaneel oop.',
      langSet: 'Taal gestel op {locale}.',
    },
    labels: {
      preset: 'Vooraf ingesteld',
      nearestPreset: 'Naaste voorafinstelling',
      hp: 'HP',
      ac: 'AC',
      acModifier: 'AC wysiger',
      damage: 'Skade',
      appliedTo: 'Toegepas op',
      copiesPerToken: 'Afskrifte per teken',
      totalCreated: 'Totaal geskep',
      renamed: 'Hernoem',
      layer: 'Laag',
      moved: 'Geskuif',
      hidden: 'Versteek',
      revealed: 'Geopenbaar',
      saved: 'Gestoor',
      restored: 'Herstel',
      noSavedPosition: 'Geen gestoorde posisie nie',
      tokensCaptured: 'Tokens gevang',
      loaded: 'Gelaai',
      missingTokens: 'Ontbrekende tekens',
      reset: 'Stel terug',
      notTracked: 'Nie nagespoor nie',
      tokensInReport: 'Tokens in verslag',
      selectedTokensInReport: 'Geselekteerde tokens in verslag',
      changedTokensInReport: 'Verander tokens in verslag',
      hpBar: 'HP staaf',
      acBar: 'AC kroeg',
      language: 'Taal',
      noEncountersSaved: 'Geen ontmoetings is nog gestoor nie.',
      name: 'Naam',
      deleted: 'Geskrap',
      duplicateFailed: 'Nie gedupliseer nie',
      duplicateFailedHint:
        'Prent nie in Roll20-biblioteek nie - voeg by jou biblioteek of stel die tekenprent handmatig in.',
    },
    ui: {
      applyScalingButton: 'Pas skaal toe op geselekteerde',
      partyScaling: 'Party Skaal',
      customScaling: 'Pasgemaakte skaal',
      bossTools: 'Baas gereedskap',
      bossPresetHint: 'Pas voorafinstelling toe op geselekteerde tokens',
      reinforcements: 'Versterkings',
      duplicateSelected: 'Duplikaat gekies:',
      customDuplicate: 'Gepasmaakte …',
      autoNumber: 'Outo-nommer gekies',
      layerVisibility: 'Laag en sigbaarheid',
      moveToLayer: 'Skuif na laag:',
      tokenLayer: 'Tekenlaag',
      gmLayer: 'GM-laag',
      mapLayer: 'Kaartlaag',
      hideSelected: 'Versteek geselekteerde',
      revealSelected: 'Reveal Selected',
      revealReinforcements: 'Onthul op Token Layer',
      positionSaving: 'Posisie stoor',
      savePositions: 'Stoor posisies',
      restorePositions: 'Herstel posisies',
      encounterTemplates: 'Ontmoet sjablone',
      saveEncounter: 'Stoor ontmoeting …',
      loadEncounter: 'Laai ontmoeting …',
      deleteEncounter: 'Vee ontmoeting uit …',
      listEncounters: 'Lys ontmoetings',
      resetRecovery: 'Herstel en herstel',
      resetSelected: 'Stel Gekies terug',
      resetPage: 'Stel bladsy terug',
      resetAll: 'Stel alles terug',
      reporting: 'Verslagdoening',
      refreshReport: 'Herlaai verslag',
      selectedReport: 'Gekies',
      changedReport: 'Verander',
      clearReport: 'Duidelik',
      help: 'Help',
      rebuildJournals: 'Herbou joernale',
      commandDeck: 'Beveldek',
      deckViewAll: 'Almal',
      deckViewScaling: 'Skaal',
      deckViewPositioning: 'Posisionering',
      deckViewAdmin: 'Admin',
      deckViewLabel: 'Bekyk:',
      partySizeLabel: 'Partytjie grootte:',
      hpPercentLabel: 'HP %:',
      acModLabel: 'AC wysiger:',
      damagePercentLabel: 'Skade%:',
      load: 'Laai',
      delete: 'Vee uit',
      quickActions: 'Vinnige aksies',
      config: 'Config',
      quickActionsDesc:
        'Vinnige toegang tot die mees gebruikte partytjie-skaalvoorinstellings en baastipes.',
      partyScalingDesc:
        'Pas skaal onmiddellik toe op geselekteerde tekens. Met geen keuse nie, faseer die waardes vir Pas skaal toe.',
      customScalingDesc:
        'Is onmiddellik van toepassing op geselekteerde tokens. Verhoog eers individuele waardes, gebruik dan Pas skaal toe wanneer geen tokens gekies is nie.',
      bossToolsDesc:
        'Pas rolvoorinstellings toe op geselekteerde tekens - Minion verminder statistieke, baas en legendaries versterk hulle.',
      reinforcementsDesc:
        'Dupliseer geselekteerde tokens op die kaart en nommer herhaalde tokenname outomaties.',
      layerVisibilityDesc:
        'Beweeg geselekteerde tekens tussen lae of wissel hul sigbaarheid vir spelers.',
      positionSavingDesc: 'Snapshot token-posisies op die huidige bladsy en herstel dit enige tyd.',
      encounterTemplatesDesc:
        "Stoor die huidige bladsystatus as 'n benoemde sjabloon en herstel dit in toekomstige sessies.",
      resetRecoveryDesc:
        'Herstel nagespoorde tokens na hul oorspronklike statistieke en verwyder hul spoorrekords.',
      reportingDesc:
        "Verfris die statusjoernaal met 'n opsomming van nagespoorde tekens en toegepaste veranderinge.",
      configDesc: 'Stel in watter tekenbalke HP en AC volg, en kies die koppelvlaktaal.',
      helpDesc: 'Bekyk die volledige opdragverwysing of herbou die Command Deck en statusjoernale.',
      setHpBar1: 'Stel HP-balk 1 in',
      setHpBar2: 'Stel HP bar 2',
      setAcBar2: 'Stel AC bar 2',
      disableAc: 'Deaktiveer AC',
    },
    report: {
      summary: 'Opsomming',
      generated: 'Gegenereer',
      tokensOnPage: 'Tokens op bladsy',
      trackedTokens: 'Nagespoorde tokens',
      changed: 'Verander',
      hiddenGm: 'Versteek (GM-laag)',
      bossesLegendary: 'Base / Legendaries',
      minions: 'Minions',
      noTrackedTokens: 'Geen nagespoorde tekens nie.',
      tokenCol: 'Teken',
      layerCol: 'Laag',
      hpCol: 'HP',
      acCol: 'AC',
      dmgCol: 'Dmg',
      presetCol: 'Vooraf ingesteld',
    },
  };

  const TRANSLATION$m = {
    titles: {
      scriptReady: 'Guió llest',
      scalingApplied: 'Escalat aplicat',
      scalingPresetReady: 'Escalat predefinit llest',
      hpUpdated: "Escalat d'HP actualitzat",
      acUpdated: 'Escalat AC actualitzat',
      damageUpdated: "S'ha actualitzat l'escala de danys",
      bossPreset: 'Preconfiguració del cap: {preset}',
      partySize: 'Mida del grup: {size}',
      reinforcementsCreated: 'Reforços creats',
      tokensNumbered: 'Fitxes numerades',
      layerChanged: 'Capa canviada',
      tokensHidden: 'Fitxes ocultes',
      tokensRevealed: "S'han revelat fitxes",
      positionsSaved: 'Posicions guardades',
      positionsRestored: 'Posicions restaurades',
      encounterSaved: 'Encontre guardat',
      encounterLoaded: 'Trobada carregada',
      encounterDeleted: "S'ha eliminat la trobada",
      savedEncounters: 'Trobades guardades',
      tokensReset: 'Restabliment de fitxes',
      pageReset: 'Restableix la pàgina',
      allReset: 'Restableix tots els fitxes',
      reportUpdated: 'Informe actualitzat',
      reportCleared: 'Informe esborrat',
      journalsRebuilt: 'Revistes reconstruïdes',
      deckUpdated: "S'ha actualitzat la plataforma de comandaments",
      configUpdated: 'Configuració actualitzada',
      currentConfig: 'Configuració actual',
      help: '{name} — Ajuda',
    },
    errors: {
      unknownCommand: 'Ordre desconeguda: "{sub}".',
      unknownCommandHint: "Escriviu !director help per obtenir una llista d'ordres.",
      noTokensSelected: "No s'han seleccionat fitxes. Seleccioneu primer les fitxes al mapa.",
      unknownScaleAction: 'Acció d\'escala desconeguda: "{action}".',
      scaleActionHint: 'Accions vàlides: preset, party, hp, ac, damage, apply',
      unknownPartyPreset: 'Preconfiguració de la part desconeguda: "{preset}".',
      partyPresetHint: 'Valors predefinits vàlids: {presets}',
      missingBossPreset: 'Falta el nom predefinit del cap.',
      missingBossPresetHint: 'Valors predefinits vàlids: {presets}',
      unknownBossPreset: 'Preconfiguració de cap desconeguda: "{preset}".',
      unknownBossPresetHint: 'Valors predefinits vàlids: {presets}',
      unknownReinforceAction: 'Acció de reforç desconeguda: "{action}".',
      reinforceActionHint: 'Accions vàlides: duplicar, enumerar, mostrar',
      noReinforcementsToReveal: 'No hi ha reforços recents per revelar.',
      noReinforcementsToRevealHint: 'Utilitzeu !director reinforce duplicat primer.',
      unknownLayer: 'Capa desconeguda: "{layer}".',
      layerHint: 'Capes vàlides: testimoni, gm, mapa',
      unknownPositionAction: 'Acció de posició desconeguda: "{action}".',
      positionActionHint: 'Accions vàlides: desar, restaurar',
      unknownEncounterAction: 'Acció de trobada desconeguda: "{action}".',
      encounterActionHint: 'Accions vàlides: desar, carregar, suprimir, llistar',
      encounterNameRequired: 'Nom de trobada obligatori.',
      encounterNameRequiredHint: 'Exemple: !director encounter salva goblin-emboscada',
      encounterNotFound: 'No s\'ha trobat la trobada "{name}".',
      encounterNotFoundHint:
        'Utilitzeu la llista de trobades del director per veure les trobades desades.',
      unknownResetScope: 'Àmbit de restabliment desconegut: "{scope}".',
      resetScopeHint: 'Àmbits vàlids: seleccionat, pàgina, tots',
      unknownReportAction: 'Acció d\'informe desconeguda: "{action}".',
      reportActionHint: 'Accions vàlides: actualitzar, seleccionar, canviar, esborrar',
      unknownJournalAction: 'Acció de diari desconeguda: "{action}".',
      journalActionHint: 'Accions vàlides: reconstruir',
      unknownDeckView: 'Vista de la coberta desconeguda: "{view}".',
      deckViewHint: 'Visualitzacions vàlides: totes, escala, posicionament, admin',
      unknownConfigKey: 'Clau de configuració desconeguda: "{key}".',
      configKeyHint: 'Claus vàlides: hp-bar, ac-bar, idioma',
      invalidHpBar: 'Barra d\'HP no vàlida: "{value}".',
      invalidHpBarHint: 'Opcions vàlides: {options}',
      invalidAcBar: 'Barra de CA no vàlida: "{value}".',
      invalidAcBarHint: 'Opcions vàlides: {options}',
      invalidLanguage: 'Idioma no vàlid: "{value}".',
      invalidLanguageHint: 'Admesos: {locales}',
      invalidPartySize: 'La mida del grup ha de ser un número entre 1 i 30 (obté "{value}").',
      invalidHpPercent:
        'El percentatge d\'HP ha d\'estar entre 1 i 1.000 (obté "{value}"). Exemple: 150',
      invalidAcModifier:
        'El modificador de CA ha d\'estar entre -10 i +10 (obté "{value}"). Exemple: +2',
      invalidDamagePercent:
        'El percentatge de danys ha d\'estar entre 1 i 1.000 (s\'ha obtingut "{value}"). Exemple: 125',
      invalidDuplicateCount:
        'El nombre de duplicats ha d\'estar entre 1 i 50 (obté "{value}"). Exemple: 3',
      invalidEncounterName:
        'Nom de trobada no vàlid: "{name}". Els noms poden contenir lletres, dígits, espais, guions i guions baixos (màxim 64 caràcters).',
      invalidEncounterNameHint: 'Exemple: !director encounter salva goblin-emboscada',
      duplicateBurstLimit:
        "L'operació crearia fitxes {requested}, superant el límit de {limit}. Seleccioneu menys fitxes o utilitzeu un recompte més petit.",
      unexpectedError: "S'ha produït un error inesperat: {message}",
      unexpectedErrorHint: "Consulteu la consola de l'API per obtenir més informació.",
    },
    confirm: {
      scalingPresetPending: "Seleccioneu fitxes i feu clic a Aplica l'escala.",
      journalsRebuilt: "La plataforma de comandaments i el diari d'estat s'han regenerat.",
      deckUpdated: "La plataforma de comandaments s'ha regenerat mitjançant la vista {view}.",
      reportCleared: "S'ha esborrat l'informe.",
      scriptReadyHint:
        'Obriu el diari Combat Encounter Director - Command Deck per al tauler de control.',
      langSet: "S'ha definit l'idioma a {locale}.",
    },
    labels: {
      preset: 'Preestablert',
      nearestPreset: 'Preestablert més proper',
      hp: 'HP',
      ac: 'AC',
      acModifier: 'Modificador de CA',
      damage: 'Danys',
      appliedTo: 'Aplicat a',
      copiesPerToken: 'Còpies per testimoni',
      totalCreated: 'Total creat',
      renamed: 'Reanomenat',
      layer: 'Capa',
      moved: 'Mogut',
      hidden: 'Ocult',
      revealed: 'Revelat',
      saved: 'Desat',
      restored: 'Restaurat',
      noSavedPosition: "No s'ha guardat cap posició",
      tokensCaptured: 'Fitxes capturades',
      loaded: 'Carregat',
      missingTokens: 'Falten fitxes',
      reset: 'Restableix',
      notTracked: 'No es fa un seguiment',
      tokensInReport: "Fitxes a l'informe",
      selectedTokensInReport: "Fitxes seleccionades a l'informe",
      changedTokensInReport: "S'han canviat les fitxes a l'informe",
      hpBar: "Barra d'HP",
      acBar: 'Barra de CA',
      language: 'Llengua',
      noEncountersSaved: "Encara no s'ha guardat cap trobada.",
      name: 'Nom',
      deleted: "S'ha suprimit",
      duplicateFailed: 'No duplicat',
      duplicateFailedHint:
        'La imatge no està a la biblioteca de Roll20: afegiu-la a la vostra biblioteca o configureu la imatge del testimoni manualment.',
    },
    ui: {
      applyScalingButton: "Aplica l'escala als seleccionats",
      partyScaling: 'Escalada de festes',
      customScaling: 'Escalat personalitzat',
      bossTools: 'Eines del cap',
      bossPresetHint: 'Aplica el valor predefinit als fitxes seleccionats',
      reinforcements: 'Reforços',
      duplicateSelected: 'Duplicat seleccionat:',
      customDuplicate: 'Personalitzat…',
      autoNumber: 'Número automàtic seleccionat',
      layerVisibility: 'Capa i visibilitat',
      moveToLayer: 'Mou a la capa:',
      tokenLayer: 'Capa de testimoni',
      gmLayer: 'Capa GM',
      mapLayer: 'Capa de mapa',
      hideSelected: 'Amaga els seleccionats',
      revealSelected: 'Revela els seleccionats',
      revealReinforcements: 'Revela a la capa de testimoni',
      positionSaving: 'Estalvi de posició',
      savePositions: 'Guarda posicions',
      restorePositions: 'Restaurar posicions',
      encounterTemplates: 'Plantilles de trobada',
      saveEncounter: 'Desa la trobada...',
      loadEncounter: 'Carrega la trobada...',
      deleteEncounter: 'Suprimeix la trobada...',
      listEncounters: 'Llista de trobades',
      resetRecovery: 'Restabliment i recuperació',
      resetSelected: 'Restableix la selecció',
      resetPage: 'Restableix la pàgina',
      resetAll: 'Restableix tot',
      reporting: 'Informes',
      refreshReport: "Informe d'actualització",
      selectedReport: 'Seleccionat',
      changedReport: 'Canviat',
      clearReport: 'Clar',
      help: 'Ajuda',
      rebuildJournals: 'Reconstrueix revistes',
      commandDeck: 'Comandament de la plataforma',
      deckViewAll: 'Tots',
      deckViewScaling: 'Escalat',
      deckViewPositioning: 'Posicionament',
      deckViewAdmin: 'Admin',
      deckViewLabel: 'Visualització:',
      partySizeLabel: 'Mida del partit:',
      hpPercentLabel: 'HP %:',
      acModLabel: 'Modificador de CA:',
      damagePercentLabel: '% de dany:',
      load: 'Carrega',
      delete: 'Suprimeix',
      quickActions: 'Accions ràpides',
      config: 'Config',
      quickActionsDesc: 'Accés ràpid als valors predefinits i als tipus de cap més utilitzats.',
      partyScalingDesc:
        "Aplica l'escala immediatament als fitxes seleccionats. Sense cap selecció, classifica els valors per a Aplicar escala.",
      customScalingDesc:
        "S'aplica immediatament als fitxes seleccionats. Organitzeu primer els valors individuals i, a continuació, utilitzeu Aplica l'escala quan no hi hagi cap testimoni seleccionat.",
      bossToolsDesc:
        'Apliqueu els valors predefinits als fitxes seleccionats: Minion redueix les estadístiques, Boss i Legendary les augmenten.',
      reinforcementsDesc:
        'Duplica les fitxes seleccionades al mapa i numera automàticament els noms de fitxes repetides.',
      layerVisibilityDesc:
        'Mou les fitxes seleccionades entre capes o canvia la seva visibilitat per als jugadors.',
      positionSavingDesc:
        'Captura les posicions dels testimonis a la pàgina actual i restaura-les en qualsevol moment.',
      encounterTemplatesDesc:
        "Deseu l'estat actual de la pàgina com a plantilla amb nom i restaurau-lo en sessions futures.",
      resetRecoveryDesc:
        'Restaura els fitxes de seguiment a les seves estadístiques originals i elimina els seus registres de seguiment.',
      reportingDesc:
        "Actualitzeu el diari d'estat amb un resum dels testimonis de seguiment i dels canvis aplicats.",
      configDesc:
        "Estableix quines barres de testimoni segueixen HP i AC i tria l'idioma de la interfície.",
      helpDesc:
        "Consulteu la referència completa de l'ordre o reconstruïu el Command Deck i els diaris d'estat.",
      setHpBar1: 'Estableix la barra HP 1',
      setHpBar2: 'Estableix la barra HP 2',
      setAcBar2: 'Estableix la barra AC 2',
      disableAc: "Desactiva l'AC",
    },
    report: {
      summary: 'Resum',
      generated: 'Generat',
      tokensOnPage: 'Fitxes a la pàgina',
      trackedTokens: 'Fitxes de seguiment',
      changed: 'Canviat',
      hiddenGm: 'Ocult (capa GM)',
      bossesLegendary: 'Caps / Llegendari',
      minions: 'Minions',
      noTrackedTokens: 'No hi ha fitxes de seguiment.',
      tokenCol: 'Token',
      layerCol: 'Capa',
      hpCol: 'HP',
      acCol: 'AC',
      dmgCol: 'Dmg',
      presetCol: 'Preestablert',
    },
  };

  const TRANSLATION$l = {
    titles: {
      scriptReady: '腳本就緒',
      scalingApplied: '應用縮放',
      scalingPresetReady: '縮放預設就緒',
      hpUpdated: 'HP 擴充功能已更新',
      acUpdated: 'AC 縮放更新',
      damageUpdated: '傷害調整更新',
      bossPreset: 'Boss 預設：{preset}',
      partySize: '聚會人數：{size}',
      reinforcementsCreated: '增援部隊已創建',
      tokensNumbered: '代幣編號',
      layerChanged: '圖層已更改',
      tokensHidden: '代幣隱藏',
      tokensRevealed: '代幣揭曉',
      positionsSaved: '職位已保存',
      positionsRestored: '職位恢復',
      encounterSaved: '遭遇已儲存',
      encounterLoaded: '遭遇加載',
      encounterDeleted: '遭遇刪除',
      savedEncounters: '保存的遭遇',
      tokensReset: '代幣重置',
      pageReset: '頁面重置',
      allReset: '所有代幣重置',
      reportUpdated: '報告已更新',
      reportCleared: '報告已清除',
      journalsRebuilt: '重建期刊',
      deckUpdated: '指揮台已更新',
      configUpdated: '配置已更新',
      currentConfig: '目前配置',
      help: '{name} — 幫助',
    },
    errors: {
      unknownCommand: '未知指令：「{sub}」。',
      unknownCommandHint: '輸入 !director help 以獲得命令列表。',
      noTokensSelected: '未選擇任何標記。首先選擇地圖上的標記。',
      unknownScaleAction: '未知的縮放操作：「{action}」。',
      scaleActionHint: '有效動作：預設、派對、hp、ac、傷害、應用',
      unknownPartyPreset: '未知方預設：「{preset}」。',
      partyPresetHint: '有效預設：{presets}',
      missingBossPreset: '缺少 Boss 預設名稱。',
      missingBossPresetHint: '有效預設：{presets}',
      unknownBossPreset: '未知的 boss 預設：「{preset}」。',
      unknownBossPresetHint: '有效預設：{presets}',
      unknownReinforceAction: '未知的強化動作：「{action}」。',
      reinforceActionHint: '有效操作：複製、列舉、顯示',
      noReinforcementsToReveal: '沒有最近的增援可以透露。',
      noReinforcementsToRevealHint: '首先使用 !director 加固重複項。',
      unknownLayer: '未知圖層：「{layer}」。',
      layerHint: '有效層：token、gm、map',
      unknownPositionAction: '未知位置操作：「{action}」。',
      positionActionHint: '有效操作：保存、恢復',
      unknownEncounterAction: '未知的遭遇操作：「{action}」。',
      encounterActionHint: '有效操作：儲存、載入、刪除、列表',
      encounterNameRequired: '遇到需要姓名。',
      encounterNameRequiredHint: '例：!導演遭遇拯救妖精伏擊',
      encounterNotFound: '遇到“{name}”未找到。',
      encounterNotFoundHint: '使用!director遭遇清單查看已儲存的遭遇。',
      unknownResetScope: '未知的重置範圍：「{scope}」。',
      resetScopeHint: '有效範圍：選定、頁面、全部',
      unknownReportAction: '未知的報告操作：「{action}」。',
      reportActionHint: '有效操作：刷新、選擇、變更、清除',
      unknownJournalAction: '未知的日記操作：「{action}」。',
      journalActionHint: '有效動作：重建',
      unknownDeckView: '未知的甲板視圖：“{view}”。',
      deckViewHint: '有效視圖：全部、縮放、定位、管理',
      unknownConfigKey: '未知的配置鍵：「{key}」。',
      configKeyHint: '有效鍵：hp-bar、ac-bar、語言',
      invalidHpBar: '生命值欄無效：「{value}」。',
      invalidHpBarHint: '有效選項：{options}',
      invalidAcBar: '無效 AC 欄：「{value}」。',
      invalidAcBarHint: '有效選項：{options}',
      invalidLanguage: '無效語言：「{value}」。',
      invalidLanguageHint: '支援：{locales}',
      invalidPartySize: '團體人數必須是 1 到 30 之間的數字（得到「{value}」）。',
      invalidHpPercent: 'HP 百分比必須介於 1 到 1000 之間（得到「{value}」）。範例：150',
      invalidAcModifier: 'AC 修飾符必須介於 -10 和 +10 之間（得到「{value}」）。範例：+2',
      invalidDamagePercent: '損壞百分比必須介於 1 到 1000 之間（得到「{value}」）。範例：125',
      invalidDuplicateCount: '重複計數必須介於 1 到 50 之間（得到「{value}」）。範例：3',
      invalidEncounterName:
        '遭遇名稱無效：「{name}」。名稱可以包含字母、數字、空格、連字符和底線（最多 64 個字元）。',
      invalidEncounterNameHint: '例：!導演遭遇拯救妖精伏擊',
      duplicateBurstLimit:
        '操作將建立 {requested} 令牌，超出 {limit} 的限制。選擇較少的標記或使用較小的計數。',
      unexpectedError: '發生意外錯誤：{message}',
      unexpectedErrorHint: '檢查 API 控制台以了解詳細資訊。',
    },
    confirm: {
      scalingPresetPending: '選擇令牌，然後按一下「套用縮放」。',
      journalsRebuilt: '命令甲板和狀態日誌已重新產生。',
      deckUpdated: '命令面板已使用 {view} 視圖重新產生。',
      reportCleared: '報告已清除。',
      scriptReadyHint: '開啟控制面板的戰鬥遭遇總監 - Command Deck 日誌。',
      langSet: '語言設定為 {locale}。',
    },
    labels: {
      preset: '預設',
      nearestPreset: '最近的預設',
      hp: '惠普',
      ac: '交流電',
      acModifier: '交流調節器',
      damage: '損害',
      appliedTo: '應用於',
      copiesPerToken: '每個令牌的副本',
      totalCreated: '建立總數',
      renamed: '更名',
      layer: '層',
      moved: '搬家了',
      hidden: '隱',
      revealed: '揭曉',
      saved: '已儲存',
      restored: '已恢復',
      noSavedPosition: '沒有保存位置',
      tokensCaptured: '捕獲的代幣',
      loaded: '已載入',
      missingTokens: '缺少代幣',
      reset: '重置',
      notTracked: '未追蹤',
      tokensInReport: '報告中的代幣',
      selectedTokensInReport: '報告中選定的代幣',
      changedTokensInReport: '報告中的標記已更改',
      hpBar: '血量條',
      acBar: '交流棒',
      language: '語言',
      noEncountersSaved: '尚未保存任何遭遇。',
      name: '姓名',
      deleted: '已刪除',
      duplicateFailed: '不重複',
      duplicateFailedHint: '圖像不在 Roll20 庫中 — 新增到您的庫或手動設定令牌圖像。',
    },
    ui: {
      applyScalingButton: '將縮放應用於所選內容',
      partyScaling: '聚會規模',
      customScaling: '自訂縮放',
      bossTools: '老闆工具',
      bossPresetHint: '將預設應用於選定的標記',
      reinforcements: '援軍',
      duplicateSelected: '重複選擇：',
      customDuplicate: '風俗…',
      autoNumber: '自動編號選擇',
      layerVisibility: '圖層和可見性',
      moveToLayer: '移動到圖層：',
      tokenLayer: '令牌層',
      gmLayer: 'GM層',
      mapLayer: '地圖圖層',
      hideSelected: '隱藏所選內容',
      revealSelected: '顯示所選內容',
      revealReinforcements: '在令牌層上顯示',
      positionSaving: '部位節省',
      savePositions: '儲存位置',
      restorePositions: '恢復位置',
      encounterTemplates: '遭遇模板',
      saveEncounter: '儲存遭遇...',
      loadEncounter: '負載遭遇...',
      deleteEncounter: '刪除遭遇...',
      listEncounters: '列出遭遇',
      resetRecovery: '重置與恢復',
      resetSelected: '重置所選內容',
      resetPage: '重置頁面',
      resetAll: '全部重置',
      reporting: '報告',
      refreshReport: '重新整理報告',
      selectedReport: '已選擇',
      changedReport: '改變了',
      clearReport: '清除',
      help: '幫助',
      rebuildJournals: '重建期刊',
      commandDeck: '指揮台',
      deckViewAll: '全部',
      deckViewScaling: '縮放',
      deckViewPositioning: '定位',
      deckViewAdmin: '行政',
      deckViewLabel: '看法：',
      partySizeLabel: '聚會規模：',
      hpPercentLabel: '生命值百分比：',
      acModLabel: '交流調節器：',
      damagePercentLabel: '損害 ％：',
      load: '載入',
      delete: '刪除',
      quickActions: '快速行動',
      config: '配置',
      quickActionsDesc: '快速存取最常用的隊伍擴充預設和 Boss 類型。',
      partyScalingDesc:
        '立即對選定的令牌套用縮放。在不進行任何選擇的情況下，暫存「套用縮放」的值。',
      customScalingDesc:
        '立即應用於選定的標記。首先暫存各個值，然後在未選擇令牌時使用「套用縮放」。',
      bossToolsDesc:
        '將角色預設應用於選定的標記 - Minion 會降低統計數據，Boss 和 Legendary 會提高統計數據。',
      reinforcementsDesc: '複製地圖上選定的標記並自動對重複的標記名稱進行編號。',
      layerVisibilityDesc: '在層之間移動選定的令牌或切換其對玩家的可見性。',
      positionSavingDesc: '快照當前頁面上的令牌位置並隨時恢復它們。',
      encounterTemplatesDesc: '將當前頁面狀態儲存為命名範本並在以後的會話中恢復它。',
      resetRecoveryDesc: '將追蹤令牌恢復為其原始統計資料並刪除其追蹤記錄。',
      reportingDesc: '使用追蹤令牌和應用的變更的摘要刷新狀態日誌。',
      configDesc: '設定哪些令牌欄追蹤 HP 和 AC，並選擇介面語言。',
      helpDesc: '查看完整的命令參考或重建命令庫和狀態日誌。',
      setHpBar1: '設定 HP 條 1',
      setHpBar2: '設定 HP 欄 2',
      setAcBar2: '設定 AC 條 2',
      disableAc: '禁用交流電',
    },
    report: {
      summary: '概括',
      generated: '產生',
      tokensOnPage: '頁面上的令牌',
      trackedTokens: '追蹤代幣',
      changed: '改變了',
      hiddenGm: '隱藏（GM層）',
      bossesLegendary: 'Boss/傳奇',
      minions: '小小兵',
      noTrackedTokens: '沒有追蹤令牌。',
      tokenCol: '代幣',
      layerCol: '層',
      hpCol: '惠普',
      acCol: '交流電',
      dmgCol: '劑量',
      presetCol: '預設',
    },
  };

  const TRANSLATION$k = {
    titles: {
      scriptReady: 'Skript připraven',
      scalingApplied: 'Použito měřítko',
      scalingPresetReady: 'Předvolba škálování připravena',
      hpUpdated: 'HP Scaling aktualizováno',
      acUpdated: 'AC Scaling aktualizováno',
      damageUpdated: 'Měřítko poškození aktualizováno',
      bossPreset: 'Předvolba šéfa: {preset}',
      partySize: 'Velikost party: {size}',
      reinforcementsCreated: 'Posílení vytvořeno',
      tokensNumbered: 'Tokeny očíslované',
      layerChanged: 'Vrstva změněna',
      tokensHidden: 'Tokeny skryté',
      tokensRevealed: 'Tokeny odhaleny',
      positionsSaved: 'Pozice uloženy',
      positionsRestored: 'Pozice obnoveny',
      encounterSaved: 'Setkání uloženo',
      encounterLoaded: 'Setkání načteno',
      encounterDeleted: 'Setkání smazáno',
      savedEncounters: 'Uložená setkání',
      tokensReset: 'Resetování tokenů',
      pageReset: 'Obnovení stránky',
      allReset: 'Všechny tokeny resetovány',
      reportUpdated: 'Zpráva aktualizována',
      reportCleared: 'Zpráva vymazána',
      journalsRebuilt: 'Deníky přestavěny',
      deckUpdated: 'Command Deck aktualizován',
      configUpdated: 'Konfigurace aktualizována',
      currentConfig: 'Aktuální konfigurace',
      help: '{name} — Nápověda',
    },
    errors: {
      unknownCommand: 'Neznámý příkaz: "{sub}".',
      unknownCommandHint: 'Pro seznam příkazů napište !director help.',
      noTokensSelected: 'Nejsou vybrány žádné tokeny. Nejprve vyberte žetony na mapě.',
      unknownScaleAction: 'Neznámá akce měřítka: "{action}".',
      scaleActionHint: 'Platné akce: přednastavení, párty, hp, ac, poškození, použít',
      unknownPartyPreset: 'Neznámá předvolba party: „{preset}“.',
      partyPresetHint: 'Platné předvolby: {presets}',
      missingBossPreset: 'Chybí přednastavený název šéfa.',
      missingBossPresetHint: 'Platné předvolby: {presets}',
      unknownBossPreset: 'Neznámá předvolba šéfa: "{preset}".',
      unknownBossPresetHint: 'Platné předvolby: {presets}',
      unknownReinforceAction: 'Neznámá akce zesílení: "{action}".',
      reinforceActionHint: 'Platné akce: duplikovat, vyjmenovat, ukázat',
      noReinforcementsToReveal: 'Žádné nedávné posily k odhalení.',
      noReinforcementsToRevealHint: 'Nejprve použijte !director zesílit duplikát.',
      unknownLayer: 'Neznámá vrstva: "{layer}".',
      layerHint: 'Platné vrstvy: token, gm, mapa',
      unknownPositionAction: 'Neznámá akce pozice: "{action}".',
      positionActionHint: 'Platné akce: uložit, obnovit',
      unknownEncounterAction: 'Neznámá akce setkání: "{action}".',
      encounterActionHint: 'Platné akce: uložit, načíst, odstranit, vypsat',
      encounterNameRequired: 'Je vyžadován název setkání.',
      encounterNameRequiredHint: 'Příklad: !director meet save goblin-ambush',
      encounterNotFound: 'Setkání „{name}“ nebylo nalezeno.',
      encounterNotFoundHint:
        'Chcete-li zobrazit uložená setkání, použijte seznam setkání !director.',
      unknownResetScope: 'Neznámý rozsah resetování: "{scope}".',
      resetScopeHint: 'Platné rozsahy: vybrané, stránka, vše',
      unknownReportAction: 'Neznámá akce hlášení: "{action}".',
      reportActionHint: 'Platné akce: obnovit, vybrat, změnit, vymazat',
      unknownJournalAction: 'Neznámá akce deníku: "{action}".',
      journalActionHint: 'Platné akce: přestavět',
      unknownDeckView: 'Neznámý pohled na palubu: "{view}".',
      deckViewHint: 'Platná zobrazení: vše, škálování, umístění, admin',
      unknownConfigKey: 'Neznámý konfigurační klíč: "{key}".',
      configKeyHint: 'Platné klávesy: hp-bar, ac-bar, jazyk',
      invalidHpBar: 'Neplatná lišta HP: "{value}".',
      invalidHpBarHint: 'Platné možnosti: {options}',
      invalidAcBar: 'Neplatný pruh AC: "{value}".',
      invalidAcBarHint: 'Platné možnosti: {options}',
      invalidLanguage: 'Neplatný jazyk: "{value}".',
      invalidLanguageHint: 'Podporováno: {locales}',
      invalidPartySize: 'Velikost skupiny musí být číslo mezi 1 a 30 (získáno „{value}“).',
      invalidHpPercent: 'Procento HP musí být mezi 1 a 1000 (získáno „{value}“). Příklad: 150',
      invalidAcModifier: 'Modifikátor AC musí být mezi -10 a +10 (získáno "{value}"). Příklad: +2',
      invalidDamagePercent:
        'Procento poškození musí být mezi 1 a 1000 (získáno „{value}“). Příklad: 125',
      invalidDuplicateCount: 'Počet duplicit musí být mezi 1 a 50 (získáno „{value}“). Příklad: 3',
      invalidEncounterName:
        'Neplatný název setkání: "{name}". Jména mohou obsahovat písmena, číslice, mezery, pomlčky a podtržítka (max. 64 znaků).',
      invalidEncounterNameHint: 'Příklad: !director meet save goblin-ambush',
      duplicateBurstLimit:
        'Operace by vytvořila {requested} tokenů, což by překročilo limit {limit}. Vyberte méně žetonů nebo použijte menší počet.',
      unexpectedError: 'Došlo k neočekávané chybě: {message}',
      unexpectedErrorHint: 'Podrobnosti najdete v konzole API.',
    },
    confirm: {
      scalingPresetPending: 'Vyberte tokeny a poté klikněte na Použít měřítko.',
      journalsRebuilt: 'Panel příkazů a stavový deník byly obnoveny.',
      deckUpdated: 'Velitelský balíček byl vygenerován pomocí pohledu {view}.',
      reportCleared: 'Hlášení vymazáno.',
      scriptReadyHint:
        'Otevřete deník Combat Encounter Director – Command Deck pro ovládací panel.',
      langSet: 'Jazyk nastaven na {locale}.',
    },
    labels: {
      preset: 'Přednastaveno',
      nearestPreset: 'Nejbližší předvolba',
      hp: 'HP',
      ac: 'AC',
      acModifier: 'AC modifikátor',
      damage: 'Poškození',
      appliedTo: 'Aplikováno na',
      copiesPerToken: 'Počet kopií na token',
      totalCreated: 'Celkem vytvořeno',
      renamed: 'Přejmenováno',
      layer: 'Vrstva',
      moved: 'Přesunuto',
      hidden: 'Skrytý',
      revealed: 'Odhaleno',
      saved: 'Uloženo',
      restored: 'Obnoveno',
      noSavedPosition: 'Žádná uložená pozice',
      tokensCaptured: 'Tokeny zachyceny',
      loaded: 'Nabito',
      missingTokens: 'Chybějící tokeny',
      reset: 'Resetovat',
      notTracked: 'Nesledováno',
      tokensInReport: 'Tokeny v přehledu',
      selectedTokensInReport: 'Vybrané tokeny v přehledu',
      changedTokensInReport: 'Změněné tokeny v přehledu',
      hpBar: 'HP lišta',
      acBar: 'AC bar',
      language: 'Jazyk',
      noEncountersSaved: 'Dosud nebyla uložena žádná setkání.',
      name: 'Jméno',
      deleted: 'Smazáno',
      duplicateFailed: 'Není duplicitní',
      duplicateFailedHint:
        'Obrázek není v knihovně Roll20 – přidejte do své knihovny nebo nastavte obrázek tokenu ručně.',
    },
    ui: {
      applyScalingButton: 'Použít měřítko na vybrané',
      partyScaling: 'Party škálování',
      customScaling: 'Vlastní škálování',
      bossTools: 'Nástroje šéfa',
      bossPresetHint: 'Použít předvolbu na vybrané tokeny',
      reinforcements: 'Výztuhy',
      duplicateSelected: 'Vybrán duplikát:',
      customDuplicate: 'Zvyk…',
      autoNumber: 'Vybráno automatické číslování',
      layerVisibility: 'Vrstva a viditelnost',
      moveToLayer: 'Přesunout do vrstvy:',
      tokenLayer: 'Token Layer',
      gmLayer: 'Vrstva GM',
      mapLayer: 'Vrstva mapy',
      hideSelected: 'Skrýt vybrané',
      revealSelected: 'Odhalit vybrané',
      revealReinforcements: 'Odhalit na Token Layer',
      positionSaving: 'Ukládání pozice',
      savePositions: 'Uložit pozice',
      restorePositions: 'Obnovit pozice',
      encounterTemplates: 'Šablony setkání',
      saveEncounter: 'Uložit setkání…',
      loadEncounter: 'Načíst setkání…',
      deleteEncounter: 'Smazat setkání…',
      listEncounters: 'Seznam setkání',
      resetRecovery: 'Obnovení a obnovení',
      resetSelected: 'Resetovat vybrané',
      resetPage: 'Obnovit stránku',
      resetAll: 'Obnovit vše',
      reporting: 'Hlášení',
      refreshReport: 'Obnovit zprávu',
      selectedReport: 'Vybraný',
      changedReport: 'Změněno',
      clearReport: 'Jasný',
      help: 'Pomoc',
      rebuildJournals: 'Přestavte deníky',
      commandDeck: 'Velitelský balíček',
      deckViewAll: 'Vše',
      deckViewScaling: 'Měřítko',
      deckViewPositioning: 'Polohování',
      deckViewAdmin: 'Admin',
      deckViewLabel: 'Pohled:',
      partySizeLabel: 'Velikost party:',
      hpPercentLabel: '% HP:',
      acModLabel: 'AC modifikátor:',
      damagePercentLabel: '% poškození:',
      load: 'Zatížení',
      delete: 'Vymazat',
      quickActions: 'Rychlé akce',
      config: 'Konfigurace',
      quickActionsDesc:
        'Rychlý přístup k nejpoužívanějším přednastavením stranového škálování a typům šéfů.',
      partyScalingDesc:
        'Okamžitě použije změnu měřítka na vybrané tokeny. Bez výběru uspořádá hodnoty pro Použít měřítko.',
      customScalingDesc:
        'Platí okamžitě na vybrané tokeny. Nejprve vytvořte jednotlivé hodnoty a poté použijte volbu Použít měřítko, když nejsou vybrány žádné tokeny.',
      bossToolsDesc:
        'Použijte předvolby rolí na vybrané tokeny – Minion snižuje statistiky, Boss a Legendary je zvyšují.',
      reinforcementsDesc:
        'Duplikujte vybrané tokeny na mapě a automaticky očíslujte názvy opakovaných tokenů.',
      layerVisibilityDesc:
        'Přesouvejte vybrané žetony mezi vrstvami nebo přepínejte jejich viditelnost pro hráče.',
      positionSavingDesc: 'Snímejte pozice tokenů na aktuální stránce a kdykoli je obnovte.',
      encounterTemplatesDesc:
        'Uložte aktuální stav stránky jako pojmenovanou šablonu a obnovte ji v budoucích relacích.',
      resetRecoveryDesc:
        'Obnovte sledované tokeny na jejich původní statistiky a odstraňte jejich záznamy sledování.',
      reportingDesc: 'Aktualizujte deník stavu souhrnem sledovaných tokenů a použitých změn.',
      configDesc: 'Nastavte, které panely tokenů sledují HP a AC, a vyberte jazyk rozhraní.',
      helpDesc:
        'Prohlédněte si úplnou referenci k příkazům nebo znovu sestavte Command Deck a stavové žurnálu.',
      setHpBar1: 'Nastavte HP bar 1',
      setHpBar2: 'Nastavte HP bar 2',
      setAcBar2: 'Nastavte AC bar 2',
      disableAc: 'Zakázat AC',
    },
    report: {
      summary: 'Shrnutí',
      generated: 'Vygenerováno',
      tokensOnPage: 'Tokeny na stránce',
      trackedTokens: 'Sledované tokeny',
      changed: 'Změněno',
      hiddenGm: 'Skrytý (vrstva GM)',
      bossesLegendary: 'Šéfové / Legendární',
      minions: 'Přisluhovači',
      noTrackedTokens: 'Žádné sledované tokeny.',
      tokenCol: 'Žeton',
      layerCol: 'Vrstva',
      hpCol: 'HP',
      acCol: 'AC',
      dmgCol: 'Dmg',
      presetCol: 'Přednastaveno',
    },
  };

  const TRANSLATION$j = {
    titles: {
      scriptReady: 'Script klar',
      scalingApplied: 'Skalering anvendt',
      scalingPresetReady: 'Forudindstillet skalering er klar',
      hpUpdated: 'HP Scaling opdateret',
      acUpdated: 'AC-skalering opdateret',
      damageUpdated: 'Skadeskalering opdateret',
      bossPreset: 'Boss Preset: {preset}',
      partySize: 'Feststørrelse: {size}',
      reinforcementsCreated: 'Forstærkninger oprettet',
      tokensNumbered: 'Poletter nummereret',
      layerChanged: 'Lag skiftet',
      tokensHidden: 'Poletter skjult',
      tokensRevealed: 'Tokens afsløret',
      positionsSaved: 'Stillinger gemt',
      positionsRestored: 'Positioner gendannet',
      encounterSaved: 'Møde gemt',
      encounterLoaded: 'Møde indlæst',
      encounterDeleted: 'Møde slettet',
      savedEncounters: 'Gemte møder',
      tokensReset: 'Tokens nulstilles',
      pageReset: 'Side nulstil',
      allReset: 'Alle tokens nulstilles',
      reportUpdated: 'Rapport opdateret',
      reportCleared: 'Rapport ryddet',
      journalsRebuilt: 'Journaler ombygget',
      deckUpdated: 'Command Deck opdateret',
      configUpdated: 'Konfig opdateret',
      currentConfig: 'Aktuel konfig',
      help: '{name} — Hjælp',
    },
    errors: {
      unknownCommand: 'Ukendt kommando: "{sub}".',
      unknownCommandHint: 'Skriv !director help for at få en liste over kommandoer.',
      noTokensSelected: 'Ingen tokens valgt. Vælg tokens på kortet først.',
      unknownScaleAction: 'Ukendt skalahandling: "{action}".',
      scaleActionHint: 'Gyldige handlinger: forudindstillet, fest, hp, ac, skade, anvende',
      unknownPartyPreset: 'Ukendt parti forudindstilling: "{preset}".',
      partyPresetHint: 'Gyldige forudindstillinger: {presets}',
      missingBossPreset: 'Mangler forudindstillet chefnavn.',
      missingBossPresetHint: 'Gyldige forudindstillinger: {presets}',
      unknownBossPreset: 'Ukendt boss-forudindstilling: "{preset}".',
      unknownBossPresetHint: 'Gyldige forudindstillinger: {presets}',
      unknownReinforceAction: 'Ukendt forstærkningshandling: "{action}".',
      reinforceActionHint: 'Gyldige handlinger: dupliker, opregn, vis',
      noReinforcementsToReveal: 'Ingen nyere forstærkninger at afsløre.',
      noReinforcementsToRevealHint: 'Brug !director forstærk duplikat først.',
      unknownLayer: 'Ukendt lag: "{layer}".',
      layerHint: 'Gyldige lag: token, gm, kort',
      unknownPositionAction: 'Ukendt positionshandling: "{action}".',
      positionActionHint: 'Gyldige handlinger: gem, gendan',
      unknownEncounterAction: 'Ukendt stødende handling: "{action}".',
      encounterActionHint: 'Gyldige handlinger: gem, indlæs, slet, liste',
      encounterNameRequired: 'Mødenavn påkrævet.',
      encounterNameRequiredHint: 'Eksempel: !direktør støder på save goblin-baghold',
      encounterNotFound: 'Mødet "{name}" blev ikke fundet.',
      encounterNotFoundHint: 'Brug !director-mødeliste til at se gemte møder.',
      unknownResetScope: 'Ukendt nulstillingsomfang: "{scope}".',
      resetScopeHint: 'Gyldige områder: valgt, side, alle',
      unknownReportAction: 'Ukendt rapporthandling: "{action}".',
      reportActionHint: 'Gyldige handlinger: Opdater, valgt, ændret, ryd',
      unknownJournalAction: 'Ukendt journalhandling: "{action}".',
      journalActionHint: 'Gyldige handlinger: genopbygg',
      unknownDeckView: 'Ukendt dækvisning: "{view}".',
      deckViewHint: 'Gyldige visninger: alle, skalering, positionering, admin',
      unknownConfigKey: 'Ukendt konfigurationsnøgle: "{key}".',
      configKeyHint: 'Gyldige nøgler: hp-bar, ac-bar, sprog',
      invalidHpBar: 'Ugyldig HP-bjælke: "{value}".',
      invalidHpBarHint: 'Gyldige muligheder: {options}',
      invalidAcBar: 'Ugyldig AC-bjælke: "{value}".',
      invalidAcBarHint: 'Gyldige muligheder: {options}',
      invalidLanguage: 'Ugyldigt sprog: "{value}".',
      invalidLanguageHint: 'Understøttet: {locales}',
      invalidPartySize: 'Partistørrelsen skal være et tal mellem 1 og 30 (fik "{value}").',
      invalidHpPercent: 'HP-procenten skal være mellem 1 og 1000 (fik "{value}"). Eksempel: 150',
      invalidAcModifier: 'AC-modifikator skal være mellem -10 og +10 (fik "{value}"). Eksempel: +2',
      invalidDamagePercent:
        'Skadeprocenten skal være mellem 1 og 1000 (fik "{value}"). Eksempel: 125',
      invalidDuplicateCount: 'Duplikatantal skal være mellem 1 og 50 (fik "{value}"). Eksempel: 3',
      invalidEncounterName:
        'Ugyldigt mødenavn: "{name}". Navne kan indeholde bogstaver, cifre, mellemrum, bindestreger og understregninger (maks. 64 tegn).',
      invalidEncounterNameHint: 'Eksempel: !direktør støder på save goblin-baghold',
      duplicateBurstLimit:
        'Operation ville skabe {requested} tokens, der overskrider grænsen på {limit}. Vælg færre tokens, eller brug et mindre antal.',
      unexpectedError: 'Der opstod en uventet fejl: {message}',
      unexpectedErrorHint: 'Tjek API-konsollen for detaljer.',
    },
    confirm: {
      scalingPresetPending: 'Vælg tokens, og klik derefter på Anvend skalering.',
      journalsRebuilt: 'Command Deck og statusjournal er blevet regenereret.',
      deckUpdated: 'Command Deck er blevet regenereret ved hjælp af visningen {view}.',
      reportCleared: 'Rapport ryddet.',
      scriptReadyHint: 'Åbn Combat Encounter Director - Command Deck journal for kontrolpanelet.',
      langSet: 'Sproget er indstillet til {locale}.',
    },
    labels: {
      preset: 'Forudindstillet',
      nearestPreset: 'Nærmeste forudindstilling',
      hp: 'HP',
      ac: 'AC',
      acModifier: 'AC modifikator',
      damage: 'Skade',
      appliedTo: 'Anvendt til',
      copiesPerToken: 'Kopier pr. token',
      totalCreated: 'Samlet oprettet',
      renamed: 'Omdøbt',
      layer: 'Lag',
      moved: 'Flyttet',
      hidden: 'Skjult',
      revealed: 'Afsløret',
      saved: 'Gemt',
      restored: 'Restaureret',
      noSavedPosition: 'Ingen gemt position',
      tokensCaptured: 'Tokens fanget',
      loaded: 'Indlæst',
      missingTokens: 'Manglende tokens',
      reset: 'Nulstil',
      notTracked: 'Ikke sporet',
      tokensInReport: 'Tokens i rapporten',
      selectedTokensInReport: 'Udvalgte tokens i rapporten',
      changedTokensInReport: 'Ændrede tokens i rapport',
      hpBar: 'HP bar',
      acBar: 'AC bar',
      language: 'Sprog',
      noEncountersSaved: 'Ingen møder gemt endnu.',
      name: 'Navn',
      deleted: 'Slettet',
      duplicateFailed: 'Ikke duplikeret',
      duplicateFailedHint:
        'Billede ikke i Roll20 Library — føj til dit bibliotek, eller indstil tokenbilledet manuelt.',
    },
    ui: {
      applyScalingButton: 'Anvend skalering på udvalgte',
      partyScaling: 'Partiskalering',
      customScaling: 'Brugerdefineret skalering',
      bossTools: 'Boss værktøjer',
      bossPresetHint: 'Anvend forudindstilling på valgte tokens',
      reinforcements: 'Forstærkninger',
      duplicateSelected: 'Dublet valgt:',
      customDuplicate: 'Skik…',
      autoNumber: 'Automatisk nummer valgt',
      layerVisibility: 'Lag og synlighed',
      moveToLayer: 'Flyt til lag:',
      tokenLayer: 'Token Layer',
      gmLayer: 'GM lag',
      mapLayer: 'Kortlag',
      hideSelected: 'Skjul valgte',
      revealSelected: 'Vis valgt',
      revealReinforcements: 'Afsløre på Token Layer',
      positionSaving: 'Lagring af position',
      savePositions: 'Gem positioner',
      restorePositions: 'Gendan positioner',
      encounterTemplates: 'Møde skabeloner',
      saveEncounter: 'Gem møde...',
      loadEncounter: 'Indlæs møde...',
      deleteEncounter: 'Slet møde...',
      listEncounters: 'Liste over møder',
      resetRecovery: 'Nulstil og gendannelse',
      resetSelected: 'Nulstil valgt',
      resetPage: 'Nulstil side',
      resetAll: 'Nulstil alle',
      reporting: 'Indberetning',
      refreshReport: 'Opdater rapport',
      selectedReport: 'Valgt',
      changedReport: 'Ændret',
      clearReport: 'Klar',
      help: 'Hjælp',
      rebuildJournals: 'Genopbyg journaler',
      commandDeck: 'Kommandodæk',
      deckViewAll: 'Alle',
      deckViewScaling: 'Skalering',
      deckViewPositioning: 'Positionering',
      deckViewAdmin: 'Admin',
      deckViewLabel: 'Udsigt:',
      partySizeLabel: 'Feststørrelse:',
      hpPercentLabel: 'HP %:',
      acModLabel: 'AC modifikator:',
      damagePercentLabel: 'Skade %:',
      load: 'Indlæs',
      delete: 'Slet',
      quickActions: 'Hurtige handlinger',
      config: 'Konfig',
      quickActionsDesc:
        'Hurtig adgang til de mest brugte partyskaleringsforudindstillinger og bosstyper.',
      partyScalingDesc:
        'Anvender skalering med det samme på valgte tokens. Uden valg iscenesætter værdierne for Anvend skalering.',
      customScalingDesc:
        'Gælder med det samme for udvalgte tokens. Indtast individuelle værdier først, og brug derefter Anvend skalering, når der ikke er valgt tokens.',
      bossToolsDesc:
        'Anvend rolleforudindstillinger på udvalgte tokens - Minion reducerer statistikker, Boss og Legendary booster dem.',
      reinforcementsDesc: 'Dupliker valgte tokens på kortet og autonummerer gentagne tokennavne.',
      layerVisibilityDesc:
        'Flyt valgte tokens mellem lag, eller skift deres synlighed for spillere.',
      positionSavingDesc:
        'Snapshot token-positioner på den aktuelle side og gendan dem til enhver tid.',
      encounterTemplatesDesc:
        'Gem den aktuelle sidetilstand som en navngivet skabelon, og gendan den i fremtidige sessioner.',
      resetRecoveryDesc:
        'Gendan sporede tokens til deres oprindelige statistik og fjern deres sporingsregistreringer.',
      reportingDesc:
        'Opdater statusjournalen med en oversigt over sporede tokens og anvendte ændringer.',
      configDesc: 'Indstil hvilke token-bjælker der sporer HP og AC, og vælg grænsefladesproget.',
      helpDesc: 'Se den fulde kommandoreference eller genopbyg Command Deck og statusjournaler.',
      setHpBar1: 'Indstil HP bar 1',
      setHpBar2: 'Indstil HP bar 2',
      setAcBar2: 'Indstil AC bar 2',
      disableAc: 'Deaktiver AC',
    },
    report: {
      summary: 'Oversigt',
      generated: 'Genereret',
      tokensOnPage: 'Tokens på side',
      trackedTokens: 'Sporede tokens',
      changed: 'Ændret',
      hiddenGm: 'Skjult (GM-lag)',
      bossesLegendary: 'Chefer / legendarisk',
      minions: 'Minions',
      noTrackedTokens: 'Ingen sporede tokens.',
      tokenCol: 'Token',
      layerCol: 'Lag',
      hpCol: 'HP',
      acCol: 'AC',
      dmgCol: 'Dmg',
      presetCol: 'Forudindstillet',
    },
  };

  const TRANSLATION$i = {
    titles: {
      scriptReady: 'Script klaar',
      scalingApplied: 'Schalen toegepast',
      scalingPresetReady: 'Schaalvoorinstelling gereed',
      hpUpdated: 'HP-schaalverdeling bijgewerkt',
      acUpdated: 'AC-schaling bijgewerkt',
      damageUpdated: 'Schadeschaal bijgewerkt',
      bossPreset: 'Boss-voorinstelling: {preset}',
      partySize: 'Partijgrootte: {size}',
      reinforcementsCreated: 'Versterkingen gemaakt',
      tokensNumbered: 'Tokens genummerd',
      layerChanged: 'Laag gewijzigd',
      tokensHidden: 'Tokens verborgen',
      tokensRevealed: 'Tokens onthuld',
      positionsSaved: 'Posities opgeslagen',
      positionsRestored: 'Posities hersteld',
      encounterSaved: 'Ontmoeting opgeslagen',
      encounterLoaded: 'Ontmoeting geladen',
      encounterDeleted: 'Ontmoeting verwijderd',
      savedEncounters: 'Opgeslagen ontmoetingen',
      tokensReset: 'Tokens opnieuw ingesteld',
      pageReset: 'Pagina opnieuw instellen',
      allReset: 'Alle tokens opnieuw ingesteld',
      reportUpdated: 'Rapport bijgewerkt',
      reportCleared: 'Rapport gewist',
      journalsRebuilt: 'Tijdschriften herbouwd',
      deckUpdated: 'Commandodek bijgewerkt',
      configUpdated: 'Configuratie bijgewerkt',
      currentConfig: 'Huidige configuratie',
      help: '{name} — Hulp',
    },
    errors: {
      unknownCommand: 'Onbekend commando: "{sub}".',
      unknownCommandHint: 'Typ !director help voor een lijst met opdrachten.',
      noTokensSelected: 'Geen tokens geselecteerd. Selecteer eerst tokens op de kaart.',
      unknownScaleAction: 'Onbekende schaalactie: "{action}".',
      scaleActionHint: 'Geldige acties: preset, party, hp, ac, damage, apply',
      unknownPartyPreset: "Onbekende partijvoorinstelling: '{preset}'.",
      partyPresetHint: 'Geldige voorinstellingen: {presets}',
      missingBossPreset: 'Ontbrekende vooraf ingestelde naam van de baas.',
      missingBossPresetHint: 'Geldige voorinstellingen: {presets}',
      unknownBossPreset: 'Onbekende baasvoorinstelling: "{preset}".',
      unknownBossPresetHint: 'Geldige voorinstellingen: {presets}',
      unknownReinforceAction: 'Onbekende versterkingsactie: "{action}".',
      reinforceActionHint: 'Geldige acties: dupliceren, opsommen, weergeven',
      noReinforcementsToReveal: 'Geen recente versterkingen te onthullen.',
      noReinforcementsToRevealHint: 'Gebruik !director en versterk eerst het duplicaat.',
      unknownLayer: 'Onbekende laag: "{layer}".',
      layerHint: 'Geldige lagen: token, gm, kaart',
      unknownPositionAction: 'Onbekende positieactie: "{action}".',
      positionActionHint: 'Geldige acties: opslaan, herstellen',
      unknownEncounterAction: 'Onbekende ontmoetingsactie: "{action}".',
      encounterActionHint: 'Geldige acties: opslaan, laden, verwijderen, lijst',
      encounterNameRequired: 'Naam van ontmoeting vereist.',
      encounterNameRequiredHint: 'Voorbeeld: !director ontmoeting save goblin-hinderlaag',
      encounterNotFound: 'Ontmoeting "{name}" niet gevonden.',
      encounterNotFoundHint:
        'Gebruik de !director-ontmoetingslijst om opgeslagen ontmoetingen te bekijken.',
      unknownResetScope: 'Onbekend resetbereik: "{scope}".',
      resetScopeHint: 'Geldige bereiken: geselecteerd, pagina, alles',
      unknownReportAction: 'Onbekende rapportactie: "{action}".',
      reportActionHint: 'Geldige acties: vernieuwen, geselecteerd, gewijzigd, wissen',
      unknownJournalAction: 'Onbekende journaalactie: "{action}".',
      journalActionHint: 'Geldige acties: opnieuw opbouwen',
      unknownDeckView: 'Onbekende kaartweergave: "{view}".',
      deckViewHint: 'Geldige weergaven: alles, schaling, positionering, admin',
      unknownConfigKey: 'Onbekende configuratiesleutel: "{key}".',
      configKeyHint: 'Geldige toetsen: hp-bar, ac-bar, taal',
      invalidHpBar: 'Ongeldige HP-balk: "{value}".',
      invalidHpBarHint: 'Geldige opties: {options}',
      invalidAcBar: 'Ongeldige AC-balk: "{value}".',
      invalidAcBarHint: 'Geldige opties: {options}',
      invalidLanguage: 'Ongeldige taal: "{value}".',
      invalidLanguageHint: 'Ondersteund: {locales}',
      invalidPartySize: 'De groepsgrootte moet een getal tussen 1 en 30 zijn (kreeg "{value}").',
      invalidHpPercent:
        'Het HP-percentage moet tussen 1 en 1000 liggen (kreeg "{value}"). Voorbeeld: 150',
      invalidAcModifier:
        'AC-modifier moet tussen -10 en +10 liggen (kreeg "{value}"). Voorbeeld: +2',
      invalidDamagePercent:
        'Het schadepercentage moet tussen 1 en 1000 liggen (kreeg "{value}"). Voorbeeld: 125',
      invalidDuplicateCount:
        'Het dubbele aantal moet tussen 1 en 50 liggen (kreeg "{value}"). Voorbeeld: 3',
      invalidEncounterName:
        'Ongeldige ontmoetingsnaam: "{name}". Namen mogen letters, cijfers, spaties, koppeltekens en onderstrepingstekens bevatten (max. 64 tekens).',
      invalidEncounterNameHint: 'Voorbeeld: !director ontmoeting save goblin-hinderlaag',
      duplicateBurstLimit:
        'De bewerking zou {requested} tokens creëren, waardoor de limiet van {limit} wordt overschreden. Selecteer minder tokens of gebruik een kleiner aantal.',
      unexpectedError: 'Er is een onverwachte fout opgetreden: {message}',
      unexpectedErrorHint: 'Controleer de API-console voor meer informatie.',
    },
    confirm: {
      scalingPresetPending: 'Selecteer tokens en klik vervolgens op Schalen toepassen.',
      journalsRebuilt: 'Command Deck en statusjournaal zijn opnieuw gegenereerd.',
      deckUpdated: 'Het Command Deck is opnieuw gegenereerd met de weergave {view}.',
      reportCleared: 'Rapport gewist.',
      scriptReadyHint:
        'Open het Combat Encounter Director - Command Deck-dagboek voor het configuratiescherm.',
      langSet: 'Taal ingesteld op {locale}.',
    },
    labels: {
      preset: 'Voorinstelling',
      nearestPreset: 'Dichtstbijzijnde voorinstelling',
      hp: 'PK',
      ac: 'AC',
      acModifier: 'AC-modificator',
      damage: 'Schade',
      appliedTo: 'Toegepast op',
      copiesPerToken: 'Kopieën per token',
      totalCreated: 'Totaal gemaakt',
      renamed: 'Hernoemd',
      layer: 'Laag',
      moved: 'Verplaatst',
      hidden: 'Verborgen',
      revealed: 'Onthuld',
      saved: 'Opgeslagen',
      restored: 'Hersteld',
      noSavedPosition: 'Geen opgeslagen positie',
      tokensCaptured: 'Tokens gevangen',
      loaded: 'Geladen',
      missingTokens: 'Ontbrekende tokens',
      reset: 'Opnieuw instellen',
      notTracked: 'Niet gevolgd',
      tokensInReport: 'Tokens in rapport',
      selectedTokensInReport: 'Geselecteerde tokens in rapport',
      changedTokensInReport: 'Gewijzigde tokens in rapport',
      hpBar: 'HP-balk',
      acBar: 'AC-balk',
      language: 'Taal',
      noEncountersSaved: 'Nog geen ontmoetingen opgeslagen.',
      name: 'Naam',
      deleted: 'Verwijderd',
      duplicateFailed: 'Niet gedupliceerd',
      duplicateFailedHint:
        'Afbeelding niet in Roll20-bibliotheek: voeg toe aan uw bibliotheek of stel de tokenafbeelding handmatig in.',
    },
    ui: {
      applyScalingButton: 'Schaal toepassen op geselecteerd',
      partyScaling: 'Schaal van partijen',
      customScaling: 'Aangepaste schaling',
      bossTools: 'Baas Gereedschap',
      bossPresetHint: 'Voorinstelling toepassen op geselecteerde tokens',
      reinforcements: 'Versterkingen',
      duplicateSelected: 'Duplicaat geselecteerd:',
      customDuplicate: 'Aangepast…',
      autoNumber: 'Automatische nummering Geselecteerd',
      layerVisibility: 'Laag en zichtbaarheid',
      moveToLayer: 'Verplaatsen naar laag:',
      tokenLayer: 'Tokenlaag',
      gmLayer: 'GM-laag',
      mapLayer: 'Kaartlaag',
      hideSelected: 'Geselecteerde verbergen',
      revealSelected: 'Geselecteerd onthullen',
      revealReinforcements: 'Onthullen op tokenlaag',
      positionSaving: 'Positie opslaan',
      savePositions: 'Posities opslaan',
      restorePositions: 'Herstel posities',
      encounterTemplates: 'Ontmoet sjablonen',
      saveEncounter: 'Ontmoeting opslaan…',
      loadEncounter: 'Ontmoeting laden…',
      deleteEncounter: 'Ontmoeting verwijderen…',
      listEncounters: 'Lijst ontmoetingen',
      resetRecovery: 'Resetten en herstellen',
      resetSelected: 'Reset geselecteerd',
      resetPage: 'Pagina opnieuw instellen',
      resetAll: 'Alles resetten',
      reporting: 'Rapportage',
      refreshReport: 'Rapport vernieuwen',
      selectedReport: 'Gekozen',
      changedReport: 'Gewijzigd',
      clearReport: 'Duidelijk',
      help: 'Hulp',
      rebuildJournals: 'Herbouw dagboeken',
      commandDeck: 'Commandodek',
      deckViewAll: 'Alle',
      deckViewScaling: 'Schalen',
      deckViewPositioning: 'Positionering',
      deckViewAdmin: 'Beheerder',
      deckViewLabel: 'Weergave:',
      partySizeLabel: 'Partijgrootte:',
      hpPercentLabel: 'PK%:',
      acModLabel: 'AC-modificator:',
      damagePercentLabel: 'Schade %:',
      load: 'Laden',
      delete: 'Verwijderen',
      quickActions: 'Snelle acties',
      config: 'Configuratie',
      quickActionsDesc:
        'Snelle toegang tot de meest gebruikte voorinstellingen voor partijschaling en baastypes.',
      partyScalingDesc:
        'Past schaling onmiddellijk toe op geselecteerde tokens. Zonder selectie worden de waarden voor Schalen toepassen gefaseerd.',
      customScalingDesc:
        'Geldt onmiddellijk voor geselecteerde tokens. Voer eerst individuele waarden uit en gebruik vervolgens Schalen toepassen als er geen tokens zijn geselecteerd.',
      bossToolsDesc:
        'Pas rolvoorinstellingen toe op geselecteerde tokens – Minion verlaagt statistieken, Boss en Legendary versterken ze.',
      reinforcementsDesc:
        'Dupliceer geselecteerde tokens op de kaart en nummer herhaalde tokennamen automatisch.',
      layerVisibilityDesc:
        'Verplaats geselecteerde tokens tussen lagen of schakel hun zichtbaarheid voor spelers in.',
      positionSavingDesc:
        'Maak een momentopname van de tokenposities op de huidige pagina en herstel deze op elk gewenst moment.',
      encounterTemplatesDesc:
        'Sla de huidige paginastatus op als een benoemde sjabloon en herstel deze in toekomstige sessies.',
      resetRecoveryDesc:
        'Herstel bijgehouden tokens naar hun oorspronkelijke statistieken en verwijder hun trackinggegevens.',
      reportingDesc:
        'Vernieuw het statusjournaal met een samenvatting van bijgehouden tokens en toegepaste wijzigingen.',
      configDesc: 'Stel in welke tokenbalken HP en AC volgen en kies de interfacetaal.',
      helpDesc:
        'Bekijk de volledige opdrachtreferentie of herbouw het Command Deck en de statuslogboeken.',
      setHpBar1: 'Stel HP-balk 1 in',
      setHpBar2: 'Stel HP-balk 2 in',
      setAcBar2: 'AC-balk 2 instellen',
      disableAc: 'Schakel AC uit',
    },
    report: {
      summary: 'Samenvatting',
      generated: 'Gegenereerd',
      tokensOnPage: 'Tokens op pagina',
      trackedTokens: 'Bijgehouden tokens',
      changed: 'Gewijzigd',
      hiddenGm: 'Verborgen (GM-laag)',
      bossesLegendary: 'Bazen / Legendarisch',
      minions: 'Minions',
      noTrackedTokens: 'Geen bijgehouden tokens.',
      tokenCol: 'Token',
      layerCol: 'Laag',
      hpCol: 'PK',
      acCol: 'AC',
      dmgCol: 'Dmg',
      presetCol: 'Voorinstelling',
    },
  };

  const TRANSLATION$h = {
    titles: {
      scriptReady: 'Script Ready',
      scalingApplied: 'Scaling Applied',
      scalingPresetReady: 'Scaling Preset Ready',
      hpUpdated: 'HP Scaling Updated',
      acUpdated: 'AC Scaling Updated',
      damageUpdated: 'Damage Scaling Updated',
      bossPreset: 'Boss Preset: {preset}',
      partySize: 'Party Size: {size}',
      reinforcementsCreated: 'Reinforcements Created',
      tokensNumbered: 'Tokens Numbered',
      layerChanged: 'Layer Changed',
      tokensHidden: 'Tokens Hidden',
      tokensRevealed: 'Tokens Revealed',
      positionsSaved: 'Positions Saved',
      positionsRestored: 'Positions Restored',
      encounterSaved: 'Encounter Saved',
      encounterLoaded: 'Encounter Loaded',
      encounterDeleted: 'Encounter Deleted',
      savedEncounters: 'Saved Encounters',
      tokensReset: 'Tokens Reset',
      pageReset: 'Page Reset',
      allReset: 'All Tokens Reset',
      reportUpdated: 'Report Updated',
      reportCleared: 'Report Cleared',
      journalsRebuilt: 'Journals Rebuilt',
      deckUpdated: 'Command Deck Updated',
      configUpdated: 'Config Updated',
      currentConfig: 'Current Config',
      help: '{name} — Help',
    },
    errors: {
      unknownCommand: 'Unknown command: "{sub}".',
      unknownCommandHint: 'Type !director help for a list of commands.',
      noTokensSelected: 'No tokens selected. Select tokens on the map first.',
      unknownScaleAction: 'Unknown scale action: "{action}".',
      scaleActionHint: 'Valid actions: preset, party, hp, ac, damage, apply',
      unknownPartyPreset: 'Unknown party preset: "{preset}".',
      partyPresetHint: 'Valid presets: {presets}',
      missingBossPreset: 'Missing boss preset name.',
      missingBossPresetHint: 'Valid presets: {presets}',
      unknownBossPreset: 'Unknown boss preset: "{preset}".',
      unknownBossPresetHint: 'Valid presets: {presets}',
      unknownReinforceAction: 'Unknown reinforce action: "{action}".',
      reinforceActionHint: 'Valid actions: duplicate, enumerate, show',
      noReinforcementsToReveal: 'No recent reinforcements to reveal.',
      noReinforcementsToRevealHint: 'Use !director reinforce duplicate first.',
      unknownLayer: 'Unknown layer: "{layer}".',
      layerHint: 'Valid layers: token, gm, map',
      unknownPositionAction: 'Unknown position action: "{action}".',
      positionActionHint: 'Valid actions: save, restore',
      unknownEncounterAction: 'Unknown encounter action: "{action}".',
      encounterActionHint: 'Valid actions: save, load, delete, list',
      encounterNameRequired: 'Encounter name required.',
      encounterNameRequiredHint: 'Example: !director encounter save goblin-ambush',
      encounterNotFound: 'Encounter "{name}" not found.',
      encounterNotFoundHint: 'Use !director encounter list to see saved encounters.',
      unknownResetScope: 'Unknown reset scope: "{scope}".',
      resetScopeHint: 'Valid scopes: selected, page, all',
      unknownReportAction: 'Unknown report action: "{action}".',
      reportActionHint: 'Valid actions: refresh, selected, changed, clear',
      unknownJournalAction: 'Unknown journal action: "{action}".',
      journalActionHint: 'Valid actions: rebuild',
      unknownDeckView: 'Unknown deck view: "{view}".',
      deckViewHint: 'Valid views: all, scaling, positioning, admin',
      unknownConfigKey: 'Unknown config key: "{key}".',
      configKeyHint: 'Valid keys: hp-bar, ac-bar, language',
      invalidHpBar: 'Invalid HP bar: "{value}".',
      invalidHpBarHint: 'Valid options: {options}',
      invalidAcBar: 'Invalid AC bar: "{value}".',
      invalidAcBarHint: 'Valid options: {options}',
      invalidLanguage: 'Invalid language: "{value}".',
      invalidLanguageHint: 'Supported: {locales}',
      invalidPartySize: 'Party size must be a number between 1 and 30 (got "{value}").',
      invalidHpPercent: 'HP percentage must be between 1 and 1000 (got "{value}"). Example: 150',
      invalidAcModifier: 'AC modifier must be between -10 and +10 (got "{value}"). Example: +2',
      invalidDamagePercent:
        'Damage percentage must be between 1 and 1000 (got "{value}"). Example: 125',
      invalidDuplicateCount: 'Duplicate count must be between 1 and 50 (got "{value}"). Example: 3',
      invalidEncounterName:
        'Invalid encounter name: "{name}". Names may contain letters, digits, spaces, hyphens and underscores (max 64 characters).',
      invalidEncounterNameHint: 'Example: !director encounter save goblin-ambush',
      duplicateBurstLimit:
        'Operation would create {requested} tokens, exceeding the limit of {limit}. Select fewer tokens or use a smaller count.',
      unexpectedError: 'An unexpected error occurred: {message}',
      unexpectedErrorHint: 'Check the API console for details.',
    },
    confirm: {
      scalingPresetPending: 'Select tokens then click Apply Scaling.',
      journalsRebuilt: 'Command Deck and status journal have been regenerated.',
      deckUpdated: 'The Command Deck has been regenerated using the {view} view.',
      reportCleared: 'Report cleared.',
      scriptReadyHint:
        'Open the Combat Encounter Director - Command Deck journal for the control panel.',
      langSet: 'Language set to {locale}.',
    },
    labels: {
      preset: 'Preset',
      nearestPreset: 'Nearest preset',
      hp: 'HP',
      ac: 'AC',
      acModifier: 'AC modifier',
      damage: 'Damage',
      appliedTo: 'Applied to',
      copiesPerToken: 'Copies per token',
      totalCreated: 'Total created',
      renamed: 'Renamed',
      layer: 'Layer',
      moved: 'Moved',
      hidden: 'Hidden',
      revealed: 'Revealed',
      saved: 'Saved',
      restored: 'Restored',
      noSavedPosition: 'No saved position',
      tokensCaptured: 'Tokens captured',
      loaded: 'Loaded',
      missingTokens: 'Missing tokens',
      reset: 'Reset',
      notTracked: 'Not tracked',
      tokensInReport: 'Tokens in report',
      selectedTokensInReport: 'Selected tokens in report',
      changedTokensInReport: 'Changed tokens in report',
      hpBar: 'HP bar',
      acBar: 'AC bar',
      language: 'Language',
      noEncountersSaved: 'No encounters saved yet.',
      name: 'Name',
      deleted: 'Deleted',
      duplicateFailed: 'Not duplicated',
      duplicateFailedHint:
        'Image not in Roll20 Library — add to your library or set the token image manually.',
    },
    ui: {
      applyScalingButton: 'Apply Scaling to Selected',
      partyScaling: 'Party Scaling',
      customScaling: 'Custom Scaling',
      bossTools: 'Boss Tools',
      bossPresetHint: 'Apply preset to selected tokens',
      reinforcements: 'Reinforcements',
      duplicateSelected: 'Duplicate selected:',
      customDuplicate: 'Custom…',
      autoNumber: 'Auto-number Selected',
      layerVisibility: 'Layer & Visibility',
      moveToLayer: 'Move to layer:',
      tokenLayer: 'Token Layer',
      gmLayer: 'GM Layer',
      mapLayer: 'Map Layer',
      hideSelected: 'Hide Selected',
      revealSelected: 'Reveal Selected',
      revealReinforcements: 'Reveal on Token Layer',
      positionSaving: 'Position Saving',
      savePositions: 'Save Positions',
      restorePositions: 'Restore Positions',
      encounterTemplates: 'Encounter Templates',
      saveEncounter: 'Save Encounter…',
      loadEncounter: 'Load Encounter…',
      deleteEncounter: 'Delete Encounter…',
      listEncounters: 'List Encounters',
      resetRecovery: 'Reset & Recovery',
      resetSelected: 'Reset Selected',
      resetPage: 'Reset Page',
      resetAll: 'Reset All',
      reporting: 'Reporting',
      refreshReport: 'Refresh Report',
      selectedReport: 'Selected',
      changedReport: 'Changed',
      clearReport: 'Clear',
      help: 'Help',
      rebuildJournals: 'Rebuild Journals',
      commandDeck: 'Command Deck',
      deckViewAll: 'All',
      deckViewScaling: 'Scaling',
      deckViewPositioning: 'Positioning',
      deckViewAdmin: 'Admin',
      deckViewLabel: 'View:',
      partySizeLabel: 'Party size:',
      hpPercentLabel: 'HP %:',
      acModLabel: 'AC modifier:',
      damagePercentLabel: 'Damage %:',
      load: 'Load',
      delete: 'Delete',
      quickActions: 'Quick Actions',
      config: 'Config',
      quickActionsDesc: 'Quick access to the most-used party scaling presets and boss types.',
      partyScalingDesc:
        'Applies scaling immediately to selected tokens. With no selection, stages the values for Apply Scaling.',
      customScalingDesc:
        'Applies immediately to selected tokens. Stage individual values first, then use Apply Scaling when no tokens are selected.',
      bossToolsDesc:
        'Apply role presets to selected tokens — Minion reduces stats, Boss and Legendary boost them.',
      reinforcementsDesc:
        'Duplicate selected tokens on the map and auto-number repeated token names.',
      layerVisibilityDesc:
        'Move selected tokens between layers or toggle their visibility for players.',
      positionSavingDesc:
        'Snapshot token positions on the current page and restore them at any time.',
      encounterTemplatesDesc:
        'Save the current page state as a named template and restore it in future sessions.',
      resetRecoveryDesc:
        'Restore tracked tokens to their original stats and remove their tracking records.',
      reportingDesc:
        'Refresh the status journal with a summary of tracked tokens and applied changes.',
      configDesc: 'Set which token bars track HP and AC, and choose the interface language.',
      helpDesc: 'View the full command reference or rebuild the Command Deck and status journals.',
      setHpBar1: 'Set HP bar 1',
      setHpBar2: 'Set HP bar 2',
      setAcBar2: 'Set AC bar 2',
      disableAc: 'Disable AC',
    },
    report: {
      summary: 'Summary',
      generated: 'Generated',
      tokensOnPage: 'Tokens on page',
      trackedTokens: 'Tracked tokens',
      changed: 'Changed',
      hiddenGm: 'Hidden (GM layer)',
      bossesLegendary: 'Bosses / Legendary',
      minions: 'Minions',
      noTrackedTokens: 'No tracked tokens.',
      tokenCol: 'Token',
      layerCol: 'Layer',
      hpCol: 'HP',
      acCol: 'AC',
      dmgCol: 'Dmg',
      presetCol: 'Preset',
    },
  };

  const TRANSLATION$g = {
    titles: {
      scriptReady: 'Script valmis',
      scalingApplied: 'Skaalaus käytössä',
      scalingPresetReady: 'Skaalaus valmiiksi asetettu',
      hpUpdated: 'HP:n skaalaus päivitetty',
      acUpdated: 'AC-skaalaus päivitetty',
      damageUpdated: 'Vahinkojen skaalaus päivitetty',
      bossPreset: 'Pomon esiasetus: {preset}',
      partySize: 'Juhlan koko: {size}',
      reinforcementsCreated: 'Vahvikkeet luotu',
      tokensNumbered: 'Tokenit numeroitu',
      layerChanged: 'Kerros muutettu',
      tokensHidden: 'Tokenit piilotettu',
      tokensRevealed: 'Tokenit paljastettu',
      positionsSaved: 'Positiot tallennettu',
      positionsRestored: 'Asemat palautettu',
      encounterSaved: 'Tapaaminen tallennettu',
      encounterLoaded: 'Kohtaus ladattu',
      encounterDeleted: 'Tapaaminen poistettu',
      savedEncounters: 'Tallennetut kohtaamiset',
      tokensReset: 'Tokens Reset',
      pageReset: 'Sivun nollaus',
      allReset: 'Kaikki tunnukset nollataan',
      reportUpdated: 'Raportti päivitetty',
      reportCleared: 'Raportti tyhjennetty',
      journalsRebuilt: 'Lehdet uusittu',
      deckUpdated: 'Command Deck päivitetty',
      configUpdated: 'Konfiguraatio päivitetty',
      currentConfig: 'Nykyinen kokoonpano',
      help: '{name} — Ohje',
    },
    errors: {
      unknownCommand: 'Tuntematon komento: "{sub}".',
      unknownCommandHint: 'Kirjoita komentoluettelo !director help.',
      noTokensSelected: 'Tunnuksia ei ole valittu. Valitse ensin tunnukset kartalta.',
      unknownScaleAction: 'Tuntematon mittakaavatoiminto: "{action}".',
      scaleActionHint: 'Kelvolliset toiminnot: esiasetus, juhla, hp, ac, vahinko, käytä',
      unknownPartyPreset: 'Tuntemattoman osapuolen esiasetus: "{preset}".',
      partyPresetHint: 'Kelvolliset esiasetukset: {presets}',
      missingBossPreset: 'Esiasetetun pomon nimi puuttuu.',
      missingBossPresetHint: 'Kelvolliset esiasetukset: {presets}',
      unknownBossPreset: 'Tuntematon esiasetus: "{preset}".',
      unknownBossPresetHint: 'Kelvolliset esiasetukset: {presets}',
      unknownReinforceAction: 'Tuntematon vahvistustoiminto: "{action}".',
      reinforceActionHint: 'Kelvolliset toiminnot: kopioi, luettele, näytä',
      noReinforcementsToReveal: 'Ei viimeaikaisia ​​vahvistuksia paljastettavana.',
      noReinforcementsToRevealHint: 'Käytä ensin !director vahvistuskopiota.',
      unknownLayer: 'Tuntematon taso: "{layer}".',
      layerHint: 'Kelvolliset tasot: token, gm, kartta',
      unknownPositionAction: 'Tuntematon sijaintitoiminto: "{action}".',
      positionActionHint: 'Kelvolliset toimet: tallenna, palauta',
      unknownEncounterAction: 'Tuntematon kohtaamistoiminto: "{action}".',
      encounterActionHint: 'Kelvolliset toiminnot: tallenna, lataa, poista, luettelo',
      encounterNameRequired: 'Tapaamisen nimi vaaditaan.',
      encounterNameRequiredHint: 'Esimerkki: !director kohtaaminen save goblin-ambush',
      encounterNotFound: 'Kohtaamista "{name}" ei löytynyt.',
      encounterNotFoundHint:
        'Käytä !director-kohtaamisten listaa nähdäksesi tallennetut kohtaamiset.',
      unknownResetScope: 'Tuntematon nollausalue: "{scope}".',
      resetScopeHint: 'Kelvolliset laajuudet: valittu, sivu, kaikki',
      unknownReportAction: 'Tuntematon raporttitoiminto: "{action}".',
      reportActionHint: 'Kelvolliset toiminnot: päivitä, valitse, muutettu, tyhjennä',
      unknownJournalAction: 'Tuntematon päiväkirjatoiminto: "{action}".',
      journalActionHint: 'Kelvolliset toimenpiteet: rakentaa uudelleen',
      unknownDeckView: 'Tuntematon kansinäkymä: "{view}".',
      deckViewHint: 'Kelvolliset näkymät: kaikki, skaalaus, paikannus, järjestelmänvalvoja',
      unknownConfigKey: 'Tuntematon määritysavain: "{key}".',
      configKeyHint: 'Kelvolliset avaimet: hp-bar, ac-bar, kieli',
      invalidHpBar: 'Virheellinen HP-palkki: "{value}".',
      invalidHpBarHint: 'Kelvolliset vaihtoehdot: {options}',
      invalidAcBar: 'Virheellinen vaihtovirtapalkki: "{value}".',
      invalidAcBarHint: 'Kelvolliset vaihtoehdot: {options}',
      invalidLanguage: 'Virheellinen kieli: "{value}".',
      invalidLanguageHint: 'Tuettu: {locales}',
      invalidPartySize: 'Ryhmän koon on oltava väliltä 1–30 (saat "{value}").',
      invalidHpPercent: 'HP-prosentin on oltava välillä 1–1000 (saat "{value}"). Esimerkki: 150',
      invalidAcModifier:
        'AC-muuntimen on oltava välillä -10 ja +10 (saat "{value}"). Esimerkki: +2',
      invalidDamagePercent:
        'Vahinkoprosentin on oltava välillä 1–1 000 (saat "{value}"). Esimerkki: 125',
      invalidDuplicateCount: 'Kopioiden määrän on oltava 1–50 (saat "{value}"). Esimerkki: 3',
      invalidEncounterName:
        'Virheellinen kohtaamisen nimi: "{name}". Nimet voivat sisältää kirjaimia, numeroita, välilyöntejä, yhdysmerkkejä ja alaviivoja (enintään 64 merkkiä).',
      invalidEncounterNameHint: 'Esimerkki: !director kohtaaminen save goblin-ambush',
      duplicateBurstLimit:
        'Toiminto loisi {requested} tunnistetta ylittäen rajan {limit}. Valitse vähemmän tunnuksia tai käytä pienempää määrää.',
      unexpectedError: 'Tapahtui odottamaton virhe: {message}',
      unexpectedErrorHint: 'Katso lisätietoja API-konsolista.',
    },
    confirm: {
      scalingPresetPending: 'Valitse tunnukset ja napsauta sitten Käytä skaalausta.',
      journalsRebuilt: 'Command Deck ja tilapäiväkirja on luotu uudelleen.',
      deckUpdated: 'Command Deck on luotu uudelleen käyttämällä {view}-näkymää.',
      reportCleared: 'Raportti tyhjennetty.',
      scriptReadyHint: 'Avaa ohjauspaneelin Combat Encounter Director - Command Deck -päiväkirja.',
      langSet: 'Kieleksi on asetettu {locale}.',
    },
    labels: {
      preset: 'Esiasetus',
      nearestPreset: 'Lähin esiasetus',
      hp: 'HP',
      ac: 'AC',
      acModifier: 'AC muuntaja',
      damage: 'Vahingoittaa',
      appliedTo: 'Sovellettu',
      copiesPerToken: 'Kopioita per merkki',
      totalCreated: 'Luotu yhteensä',
      renamed: 'Nimetty uudelleen',
      layer: 'Kerros',
      moved: 'Siirretty',
      hidden: 'Piilotettu',
      revealed: 'Paljastettu',
      saved: 'Tallennettu',
      restored: 'Palautettu',
      noSavedPosition: 'Ei tallennettua sijaintia',
      tokensCaptured: 'Tokenit vangittu',
      loaded: 'Ladattu',
      missingTokens: 'Tokenit puuttuvat',
      reset: 'Nollaa',
      notTracked: 'Ei jäljitetty',
      tokensInReport: 'Tokenit raportissa',
      selectedTokensInReport: 'Valitut tunnukset raportissa',
      changedTokensInReport: 'Raportin tunnuksia muutettu',
      hpBar: 'HP baari',
      acBar: 'AC baari',
      language: 'Kieli',
      noEncountersSaved: 'Tapaamisia ei ole vielä tallennettu.',
      name: 'Nimi',
      deleted: 'Poistettu',
      duplicateFailed: 'Ei kopioitu',
      duplicateFailedHint:
        'Kuva ei ole Roll20-kirjastossa — lisää kirjastoosi tai aseta tunnuskuva manuaalisesti.',
    },
    ui: {
      applyScalingButton: 'Käytä Skaalaus valittuihin',
      partyScaling: 'Party Skaalaus',
      customScaling: 'Mukautettu skaalaus',
      bossTools: 'Bossin työkalut',
      bossPresetHint: 'Käytä esiasetusta valittuihin tokeneihin',
      reinforcements: 'Vahvikkeet',
      duplicateSelected: 'Kopio valittu:',
      customDuplicate: 'Mukautettu…',
      autoNumber: 'Automaattinen numero valittu',
      layerVisibility: 'Taso ja näkyvyys',
      moveToLayer: 'Siirrä tasolle:',
      tokenLayer: 'Token Layer',
      gmLayer: 'GM-kerros',
      mapLayer: 'Karttataso',
      hideSelected: 'Piilota valitut',
      revealSelected: 'Näytä valitut',
      revealReinforcements: 'Paljasta Token Layerissa',
      positionSaving: 'Aseman tallennus',
      savePositions: 'Tallenna asemat',
      restorePositions: 'Palauta asemat',
      encounterTemplates: 'Kohtausmallit',
      saveEncounter: 'Tallenna kohtaus…',
      loadEncounter: 'Lataa kohtaaminen…',
      deleteEncounter: 'Poista kohtaus…',
      listEncounters: 'Lista kohtaamiset',
      resetRecovery: 'Reset & Recovery',
      resetSelected: 'Nollaa valittu',
      resetPage: 'Nollaa sivu',
      resetAll: 'Nollaa kaikki',
      reporting: 'Raportointi',
      refreshReport: 'Päivitä raportti',
      selectedReport: 'Valittu',
      changedReport: 'Muutettu',
      clearReport: 'Selkeä',
      help: 'Auttaa',
      rebuildJournals: 'Rakenna lehtiä uudelleen',
      commandDeck: 'Command Deck',
      deckViewAll: 'Kaikki',
      deckViewScaling: 'Skaalaus',
      deckViewPositioning: 'Paikannus',
      deckViewAdmin: 'Admin',
      deckViewLabel: 'Näytä:',
      partySizeLabel: 'Juhlan koko:',
      hpPercentLabel: 'HP %:',
      acModLabel: 'AC-muunnin:',
      damagePercentLabel: 'Vahinko %:',
      load: 'Ladata',
      delete: 'Poistaa',
      quickActions: 'Nopeat toiminnot',
      config: 'Konfig',
      quickActionsDesc:
        'Nopea pääsy eniten käytettyihin puolueen skaalauksen esiasetuksiin ja pomotyyppeihin.',
      partyScalingDesc:
        'Skaalaus otetaan välittömästi käyttöön valittuihin tokeneihin. Jos valintaa ei ole tehty, vaiheittaa Käytä skaalaus -toiminnon arvot.',
      customScalingDesc:
        'Koskee välittömästi valittuja tokeneita. Aseta ensin yksittäiset arvot ja käytä sitten Käytä Skaalausta, kun tunnisteita ei ole valittu.',
      bossToolsDesc:
        'Käytä roolien esiasetuksia valittuihin tokeneihin – Minion vähentää tilastoja, Boss ja Legendary tehostavat niitä.',
      reinforcementsDesc:
        'Kopioi valitut tunnukset kartalle ja numeroi toistuvat merkkien nimet automaattisesti.',
      layerVisibilityDesc:
        'Siirrä valittuja tokeneita tasojen välillä tai vaihda niiden näkyvyyttä pelaajille.',
      positionSavingDesc:
        'Ota tilannekuvan tunnuksen sijainnit nykyisellä sivulla ja palauta ne milloin tahansa.',
      encounterTemplatesDesc:
        'Tallenna nykyinen sivun tila nimettynä mallina ja palauta se tulevissa istunnoissa.',
      resetRecoveryDesc:
        'Palauta seuratut tunnukset niiden alkuperäisiin tilastoihin ja poista niiden seurantatietueet.',
      reportingDesc:
        'Päivitä tilapäiväkirja yhteenvedolla seuratuista tunnisteista ja tehdyistä muutoksista.',
      configDesc:
        'Määritä, mitkä merkkipalkit seuraavat HP:tä ja AC:tä, ja valitse käyttöliittymän kieli.',
      helpDesc:
        'Tarkastele koko komentoviittausta tai rakenna Command Deck ja tilapäiväkirjat uudelleen.',
      setHpBar1: 'Aseta HP bar 1',
      setHpBar2: 'Aseta HP bar 2',
      setAcBar2: 'Aseta AC bar 2',
      disableAc: 'Poista AC käytöstä',
    },
    report: {
      summary: 'Yhteenveto',
      generated: 'Luotu',
      tokensOnPage: 'Tokenit sivulla',
      trackedTokens: 'Seuratut tunnukset',
      changed: 'Muutettu',
      hiddenGm: 'Piilotettu (GM-taso)',
      bossesLegendary: 'Pomot / Legendaarinen',
      minions: 'Minions',
      noTrackedTokens: 'Ei jäljitettyjä tunnuksia.',
      tokenCol: 'Token',
      layerCol: 'Kerros',
      hpCol: 'HP',
      acCol: 'AC',
      dmgCol: 'Dmg',
      presetCol: 'Esiasetus',
    },
  };

  const TRANSLATION$f = {
    titles: {
      scriptReady: 'Prêt pour le script',
      scalingApplied: "Mise à l'échelle appliquée",
      scalingPresetReady: "Mise à l'échelle prédéfinie prête",
      hpUpdated: "Mise à l'échelle HP mise à jour",
      acUpdated: "Mise à l'échelle AC mise à jour",
      damageUpdated: 'Échelle des dégâts mise à jour',
      bossPreset: 'Préréglage du patron : {preset}',
      partySize: 'Taille du groupe : {size}',
      reinforcementsCreated: 'Renforts créés',
      tokensNumbered: 'Jetons numérotés',
      layerChanged: 'Calque modifié',
      tokensHidden: 'Jetons cachés',
      tokensRevealed: 'Jetons révélés',
      positionsSaved: 'Postes enregistrés',
      positionsRestored: 'Postes restaurés',
      encounterSaved: 'Rencontre enregistrée',
      encounterLoaded: 'Rencontre chargée',
      encounterDeleted: 'Rencontre supprimée',
      savedEncounters: 'Rencontres enregistrées',
      tokensReset: 'Réinitialisation des jetons',
      pageReset: 'Réinitialisation des pages',
      allReset: 'Réinitialisation de tous les jetons',
      reportUpdated: 'Rapport mis à jour',
      reportCleared: 'Rapport effacé',
      journalsRebuilt: 'Journaux reconstruits',
      deckUpdated: 'Deck de commandement mis à jour',
      configUpdated: 'Configuration mise à jour',
      currentConfig: 'Configuration actuelle',
      help: '{name} — Aide',
    },
    errors: {
      unknownCommand: 'Commande inconnue : "{sub}".',
      unknownCommandHint: 'Tapez !director help pour une liste de commandes.',
      noTokensSelected: 'Aucun jeton sélectionné. Sélectionnez d’abord les jetons sur la carte.',
      unknownScaleAction: 'Action d\'échelle inconnue : "{action}".',
      scaleActionHint: 'Actions valides : préréglage, fête, hp, ac, dégâts, appliquer',
      unknownPartyPreset: 'Préréglage de fête inconnu : "{preset}".',
      partyPresetHint: 'Préréglages valides : {presets}',
      missingBossPreset: 'Nom prédéfini du boss manquant.',
      missingBossPresetHint: 'Préréglages valides : {presets}',
      unknownBossPreset: 'Préréglage de boss inconnu : "{preset}".',
      unknownBossPresetHint: 'Préréglages valides : {presets}',
      unknownReinforceAction: 'Action de renforcement inconnue : "{action}".',
      reinforceActionHint: 'Actions valides : dupliquer, énumérer, afficher',
      noReinforcementsToReveal: 'Aucun renfort récent à révéler.',
      noReinforcementsToRevealHint: "Utilisez d'abord !director pour renforcer la duplication.",
      unknownLayer: 'Couche inconnue : "{layer}".',
      layerHint: 'Couches valides : token, gm, map',
      unknownPositionAction: 'Action de position inconnue : "{action}".',
      positionActionHint: 'Actions valides : enregistrer, restaurer',
      unknownEncounterAction: 'Action de rencontre inconnue : "{action}".',
      encounterActionHint: 'Actions valides : enregistrer, charger, supprimer, lister',
      encounterNameRequired: 'Nom de la rencontre requis.',
      encounterNameRequiredHint: 'Exemple : !director rencontre save goblin-ambush',
      encounterNotFound: 'Rencontre "{name}" introuvable.',
      encounterNotFoundHint:
        'Utilisez la liste de rencontres !director pour voir les rencontres enregistrées.',
      unknownResetScope: 'Portée de réinitialisation inconnue : "{scope}".',
      resetScopeHint: 'Portées valides : sélectionnée, page, toutes',
      unknownReportAction: 'Action de rapport inconnue : "{action}".',
      reportActionHint: 'Actions valides : actualiser, sélectionné, modifié, effacer',
      unknownJournalAction: 'Action de journal inconnue : "{action}".',
      journalActionHint: 'Actions valides : reconstruire',
      unknownDeckView: 'Vue de pont inconnue : "{view}".',
      deckViewHint: "Vues valides : toutes, mise à l'échelle, positionnement, admin",
      unknownConfigKey: 'Clé de configuration inconnue : "{key}".',
      configKeyHint: 'Clés valides : hp-bar, ac-bar, langue',
      invalidHpBar: 'Barre HP invalide : "{value}".',
      invalidHpBarHint: 'Options valides : {options}',
      invalidAcBar: 'Barre AC invalide : "{value}".',
      invalidAcBarHint: 'Options valides : {options}',
      invalidLanguage: 'Langue invalide : "{value}".',
      invalidLanguageHint: 'Pris en charge : {locales}',
      invalidPartySize:
        'La taille du groupe doit être un nombre compris entre 1 et 30 (obtenu "{value}").',
      invalidHpPercent:
        'Le pourcentage de HP doit être compris entre 1 et 1000 (obtenu "{value}"). Exemple : 150',
      invalidAcModifier:
        'Le modificateur AC doit être compris entre -10 et +10 (obtenu "{value}"). Exemple : +2',
      invalidDamagePercent:
        'Le pourcentage de dégâts doit être compris entre 1 et 1 000 (obtenu "{value}"). Exemple : 125',
      invalidDuplicateCount:
        'Le nombre de doublons doit être compris entre 1 et 50 (obtenu "{value}"). Exemple : 3',
      invalidEncounterName:
        'Nom de rencontre non valide : "{name}". Les noms peuvent contenir des lettres, des chiffres, des espaces, des traits d\'union et des traits de soulignement (maximum 64 caractères).',
      invalidEncounterNameHint: 'Exemple : !director rencontre save goblin-ambush',
      duplicateBurstLimit:
        "L'opération créerait {requested} jetons, dépassant la limite de {limit}. Sélectionnez moins de jetons ou utilisez un nombre plus petit.",
      unexpectedError: "Une erreur inattendue s'est produite : {message}",
      unexpectedErrorHint: 'Consultez la console API pour plus de détails.',
    },
    confirm: {
      scalingPresetPending:
        "Sélectionnez les jetons, puis cliquez sur Appliquer la mise à l'échelle.",
      journalsRebuilt: 'Le Command Deck et le journal d’état ont été régénérés.',
      deckUpdated: "Le Command Deck a été régénéré à l'aide de la vue {view}.",
      reportCleared: 'Rapport effacé.',
      scriptReadyHint:
        'Ouvrez le journal Combat Encounter Director - Command Deck pour le panneau de contrôle.',
      langSet: 'Langue définie sur {locale}.',
    },
    labels: {
      preset: 'Préréglage',
      nearestPreset: 'Préréglage le plus proche',
      hp: 'HP',
      ac: 'CA',
      acModifier: 'Modificateur AC',
      damage: 'Dommage',
      appliedTo: 'Appliqué à',
      copiesPerToken: 'Copies par jeton',
      totalCreated: 'Total créé',
      renamed: 'Renommé',
      layer: 'Couche',
      moved: 'Déplacé',
      hidden: 'Caché',
      revealed: 'Révélé',
      saved: 'Enregistré',
      restored: 'Restauré',
      noSavedPosition: 'Aucune position enregistrée',
      tokensCaptured: 'Jetons capturés',
      loaded: 'Chargé',
      missingTokens: 'Jetons manquants',
      reset: 'Réinitialiser',
      notTracked: 'Non suivi',
      tokensInReport: 'Jetons dans le rapport',
      selectedTokensInReport: 'Jetons sélectionnés dans le rapport',
      changedTokensInReport: 'Jetons modifiés dans le rapport',
      hpBar: 'Barre HP',
      acBar: 'Barre de climatisation',
      language: 'Langue',
      noEncountersSaved: "Aucune rencontre enregistrée pour l'instant.",
      name: 'Nom',
      deleted: 'Supprimé',
      duplicateFailed: 'Non dupliqué',
      duplicateFailedHint:
        "Image absente de la bibliothèque Roll20 : ajoutez-la à votre bibliothèque ou définissez l'image du jeton manuellement.",
    },
    ui: {
      applyScalingButton: "Appliquer la mise à l'échelle à la sélection",
      partyScaling: "Mise à l'échelle du parti",
      customScaling: "Mise à l'échelle personnalisée",
      bossTools: 'Outils de patron',
      bossPresetHint: 'Appliquer le préréglage aux jetons sélectionnés',
      reinforcements: 'Renforts',
      duplicateSelected: 'Duplicata sélectionné :',
      customDuplicate: 'Coutume…',
      autoNumber: 'Numéro automatique sélectionné',
      layerVisibility: 'Calque et visibilité',
      moveToLayer: 'Déplacer vers le calque :',
      tokenLayer: 'Couche de jetons',
      gmLayer: 'Couche GM',
      mapLayer: 'Couche de carte',
      hideSelected: 'Masquer la sélection',
      revealSelected: 'Révéler la sélection',
      revealReinforcements: 'Révéler sur la couche de jetons',
      positionSaving: 'Sauvegarde de position',
      savePositions: 'Enregistrer les postes',
      restorePositions: 'Restaurer les postes',
      encounterTemplates: 'Modèles de rencontre',
      saveEncounter: 'Enregistrer la rencontre…',
      loadEncounter: 'Charger la rencontre…',
      deleteEncounter: 'Supprimer la rencontre…',
      listEncounters: 'Liste des rencontres',
      resetRecovery: 'Réinitialisation et récupération',
      resetSelected: 'Réinitialiser la sélection',
      resetPage: 'Page de réinitialisation',
      resetAll: 'Tout réinitialiser',
      reporting: 'Rapports',
      refreshReport: 'Actualiser le rapport',
      selectedReport: 'Choisi',
      changedReport: 'Modifié',
      clearReport: 'Clair',
      help: 'Aide',
      rebuildJournals: 'Reconstruire les journaux',
      commandDeck: 'Pont de commandement',
      deckViewAll: 'Tous',
      deckViewScaling: "Mise à l'échelle",
      deckViewPositioning: 'Positionnement',
      deckViewAdmin: 'Administrateur',
      deckViewLabel: 'Voir:',
      partySizeLabel: 'Taille du groupe :',
      hpPercentLabel: '% de PV :',
      acModLabel: 'Modificateur AC :',
      damagePercentLabel: 'Dommage %:',
      load: 'Charger',
      delete: 'Supprimer',
      quickActions: 'Actions rapides',
      config: 'Configuration',
      quickActionsDesc:
        "Accès rapide aux préréglages de mise à l'échelle du groupe et aux types de boss les plus utilisés.",
      partyScalingDesc:
        "Applique la mise à l'échelle immédiatement aux jetons sélectionnés. Sans sélection, organise les valeurs pour Appliquer la mise à l'échelle.",
      customScalingDesc:
        "S'applique immédiatement aux jetons sélectionnés. Organisez d'abord les valeurs individuelles, puis utilisez Appliquer la mise à l'échelle lorsqu'aucun jeton n'est sélectionné.",
      bossToolsDesc:
        'Appliquez des préréglages de rôle aux jetons sélectionnés : Minion réduit les statistiques, Boss et Légendaire les augmentent.',
      reinforcementsDesc:
        'Dupliquez les jetons sélectionnés sur la carte et numérotez automatiquement les noms de jetons répétés.',
      layerVisibilityDesc:
        'Déplacez les jetons sélectionnés entre les couches ou basculez leur visibilité pour les joueurs.',
      positionSavingDesc:
        'Instantanez les positions des jetons sur la page actuelle et restaurez-les à tout moment.',
      encounterTemplatesDesc:
        "Enregistrez l'état actuel de la page en tant que modèle nommé et restaurez-le lors des sessions futures.",
      resetRecoveryDesc:
        "Restaurez les jetons suivis à leurs statistiques d'origine et supprimez leurs enregistrements de suivi.",
      reportingDesc:
        "Actualisez le journal d'état avec un résumé des jetons suivis et des modifications appliquées.",
      configDesc:
        "Définissez les barres de jetons qui suivent HP et AC et choisissez la langue de l'interface.",
      helpDesc:
        'Consultez la référence complète des commandes ou reconstruisez le Command Deck et les journaux d’état.',
      setHpBar1: 'Définir la barre HP 1',
      setHpBar2: 'Définir la barre HP 2',
      setAcBar2: 'Définir la barre AC 2',
      disableAc: 'Désactiver la climatisation',
    },
    report: {
      summary: 'Résumé',
      generated: 'Généré',
      tokensOnPage: 'Jetons sur la page',
      trackedTokens: 'Jetons suivis',
      changed: 'Modifié',
      hiddenGm: 'Masqué (couche GM)',
      bossesLegendary: 'Boss / Légendaire',
      minions: 'Minions',
      noTrackedTokens: 'Aucun jeton suivi.',
      tokenCol: 'Jeton',
      layerCol: 'Couche',
      hpCol: 'HP',
      acCol: 'CA',
      dmgCol: 'Dmg',
      presetCol: 'Préréglage',
    },
  };

  const TRANSLATION$e = {
    titles: {
      scriptReady: 'Skript bereit',
      scalingApplied: 'Skalierung angewendet',
      scalingPresetReady: 'Skalierungsvoreinstellung bereit',
      hpUpdated: 'HP-Skalierung aktualisiert',
      acUpdated: 'AC-Skalierung aktualisiert',
      damageUpdated: 'Schadensskalierung aktualisiert',
      bossPreset: 'Boss-Voreinstellung: {preset}',
      partySize: 'Gruppengröße: {size}',
      reinforcementsCreated: 'Verstärkungen erstellt',
      tokensNumbered: 'Nummerierte Token',
      layerChanged: 'Ebene geändert',
      tokensHidden: 'Versteckte Token',
      tokensRevealed: 'Token enthüllt',
      positionsSaved: 'Positionen gespeichert',
      positionsRestored: 'Positionen wiederhergestellt',
      encounterSaved: 'Begegnung gespeichert',
      encounterLoaded: 'Begegnung geladen',
      encounterDeleted: 'Begegnung gelöscht',
      savedEncounters: 'Gespeicherte Begegnungen',
      tokensReset: 'Zurücksetzen der Token',
      pageReset: 'Seite zurücksetzen',
      allReset: 'Alle Token zurückgesetzt',
      reportUpdated: 'Bericht aktualisiert',
      reportCleared: 'Bericht gelöscht',
      journalsRebuilt: 'Zeitschriften neu aufgebaut',
      deckUpdated: 'Kommandodeck aktualisiert',
      configUpdated: 'Konfiguration aktualisiert',
      currentConfig: 'Aktuelle Konfiguration',
      help: '{name} – Hilfe',
    },
    errors: {
      unknownCommand: 'Unbekannter Befehl: „{sub}“.',
      unknownCommandHint: 'Geben Sie !director help ein, um eine Liste mit Befehlen anzuzeigen.',
      noTokensSelected: 'Keine Token ausgewählt. Wählen Sie zuerst Token auf der Karte aus.',
      unknownScaleAction: 'Unbekannte Skalenaktion: „{action}“.',
      scaleActionHint:
        'Gültige Aktionen: Voreinstellung, Party, PS, Wechselstrom, Schaden, Anwenden',
      unknownPartyPreset: 'Unbekannte Party-Voreinstellung: „{preset}“.',
      partyPresetHint: 'Gültige Voreinstellungen: {presets}',
      missingBossPreset: 'Der Name der Boss-Voreinstellung fehlt.',
      missingBossPresetHint: 'Gültige Voreinstellungen: {presets}',
      unknownBossPreset: 'Unbekannte Boss-Voreinstellung: „{preset}“.',
      unknownBossPresetHint: 'Gültige Voreinstellungen: {presets}',
      unknownReinforceAction: 'Unbekannte Verstärkungsaktion: „{action}“.',
      reinforceActionHint: 'Gültige Aktionen: Duplizieren, Aufzählen, Anzeigen',
      noReinforcementsToReveal: 'Keine aktuellen Verstärkungen zu verraten.',
      noReinforcementsToRevealHint:
        'Verwenden Sie zuerst !director, um das Duplikat zu verstärken.',
      unknownLayer: 'Unbekannter Layer: „{layer}“.',
      layerHint: 'Gültige Layer: Token, GM, Karte',
      unknownPositionAction: 'Unbekannte Positionsaktion: „{action}“.',
      positionActionHint: 'Gültige Aktionen: Speichern, Wiederherstellen',
      unknownEncounterAction: 'Unbekannte Begegnungsaktion: „{action}“.',
      encounterActionHint: 'Gültige Aktionen: Speichern, Laden, Löschen, Auflisten',
      encounterNameRequired: 'Begegnungsname erforderlich.',
      encounterNameRequiredHint: 'Beispiel: !director Begegnung retten Goblin-Hinterhalt',
      encounterNotFound: 'Begegnung „{name}“ nicht gefunden.',
      encounterNotFoundHint:
        'Verwenden Sie die !director-Begegnungsliste, um gespeicherte Begegnungen anzuzeigen.',
      unknownResetScope: 'Unbekannter Zurücksetzungsbereich: „{scope}“.',
      resetScopeHint: 'Gültige Bereiche: ausgewählt, Seite, alle',
      unknownReportAction: 'Unbekannte Berichtsaktion: „{action}“.',
      reportActionHint: 'Gültige Aktionen: Aktualisieren, Ausgewählt, Geändert, Löschen',
      unknownJournalAction: 'Unbekannte Journalaktion: „{action}“.',
      journalActionHint: 'Gültige Aktionen: Neu erstellen',
      unknownDeckView: 'Unbekannte Deckansicht: „{view}“.',
      deckViewHint: 'Gültige Ansichten: alle, Skalierung, Positionierung, Admin',
      unknownConfigKey: 'Unbekannter Konfigurationsschlüssel: „{key}“.',
      configKeyHint: 'Gültige Schlüssel: hp-bar, ac-bar, language',
      invalidHpBar: 'Ungültiger HP-Balken: „{value}“.',
      invalidHpBarHint: 'Gültige Optionen: {options}',
      invalidAcBar: 'Ungültige AC-Leiste: „{value}“.',
      invalidAcBarHint: 'Gültige Optionen: {options}',
      invalidLanguage: 'Ungültige Sprache: „{value}“.',
      invalidLanguageHint: 'Unterstützt: {locales}',
      invalidPartySize:
        'Die Gruppengröße muss eine Zahl zwischen 1 und 30 sein (erhielt „{value}“).',
      invalidHpPercent:
        'Der HP-Prozentsatz muss zwischen 1 und 1000 liegen (erhielt „{value}“). Beispiel: 150',
      invalidAcModifier:
        'Der AC-Modifikator muss zwischen -10 und +10 liegen (erhielt „{value}“). Beispiel: +2',
      invalidDamagePercent:
        'Der Schadensprozentsatz muss zwischen 1 und 1000 liegen (erhielt „{value}“). Beispiel: 125',
      invalidDuplicateCount:
        'Die Anzahl der Duplikate muss zwischen 1 und 50 liegen (erhielt „{value}“). Beispiel: 3',
      invalidEncounterName:
        'Ungültiger Begegnungsname: „{name}“. Namen können Buchstaben, Ziffern, Leerzeichen, Bindestriche und Unterstriche enthalten (maximal 64 Zeichen).',
      invalidEncounterNameHint: 'Beispiel: !director Begegnung retten Goblin-Hinterhalt',
      duplicateBurstLimit:
        'Der Vorgang würde {requested} Token erstellen und damit den Grenzwert von {limit} überschreiten. Wählen Sie weniger Token aus oder verwenden Sie eine kleinere Anzahl.',
      unexpectedError: 'Es ist ein unerwarteter Fehler aufgetreten: {message}',
      unexpectedErrorHint: 'Weitere Informationen finden Sie in der API-Konsole.',
    },
    confirm: {
      scalingPresetPending: 'Wählen Sie Token aus und klicken Sie dann auf Skalierung anwenden.',
      journalsRebuilt: 'Command Deck und Statusjournal wurden neu generiert.',
      deckUpdated: 'Das Command Deck wurde mit der Ansicht {view} neu generiert.',
      reportCleared: 'Bericht gelöscht.',
      scriptReadyHint:
        'Öffnen Sie das Journal „Combat Encounter Director – Command Deck“ für das Bedienfeld.',
      langSet: 'Die Sprache ist auf {locale} eingestellt.',
    },
    labels: {
      preset: 'Voreingestellt',
      nearestPreset: 'Nächste Voreinstellung',
      hp: 'PS',
      ac: 'Wechselstrom',
      acModifier: 'AC-Modifikator',
      damage: 'Schaden',
      appliedTo: 'Angewendet auf',
      copiesPerToken: 'Kopien pro Token',
      totalCreated: 'Insgesamt erstellt',
      renamed: 'Umbenannt',
      layer: 'Schicht',
      moved: 'Verschoben',
      hidden: 'Versteckt',
      revealed: 'Enthüllt',
      saved: 'Gespeichert',
      restored: 'Restauriert',
      noSavedPosition: 'Keine gespeicherte Position',
      tokensCaptured: 'Erbeutete Token',
      loaded: 'Geladen',
      missingTokens: 'Fehlende Token',
      reset: 'Zurücksetzen',
      notTracked: 'Nicht verfolgt',
      tokensInReport: 'Token im Bericht',
      selectedTokensInReport: 'Ausgewählte Token im Bericht',
      changedTokensInReport: 'Geänderte Token im Bericht',
      hpBar: 'HP-Leiste',
      acBar: 'AC-Bar',
      language: 'Sprache',
      noEncountersSaved: 'Noch keine Begegnungen gespeichert.',
      name: 'Name',
      deleted: 'Gelöscht',
      duplicateFailed: 'Nicht dupliziert',
      duplicateFailedHint:
        'Bild nicht in der Roll20-Bibliothek – fügen Sie es Ihrer Bibliothek hinzu oder legen Sie das Token-Bild manuell fest.',
    },
    ui: {
      applyScalingButton: 'Skalierung auf Auswahl anwenden',
      partyScaling: 'Party-Skalierung',
      customScaling: 'Benutzerdefinierte Skalierung',
      bossTools: 'Boss-Tools',
      bossPresetHint: 'Voreinstellung auf ausgewählte Token anwenden',
      reinforcements: 'Verstärkung',
      duplicateSelected: 'Duplikat ausgewählt:',
      customDuplicate: 'Brauch…',
      autoNumber: 'Automatische Nummerierung ausgewählt',
      layerVisibility: 'Ebene und Sichtbarkeit',
      moveToLayer: 'Zur Ebene verschieben:',
      tokenLayer: 'Token-Schicht',
      gmLayer: 'GM-Ebene',
      mapLayer: 'Kartenebene',
      hideSelected: 'Ausgewählte ausblenden',
      revealSelected: 'Ausgewählte anzeigen',
      revealReinforcements: 'Offenlegung auf Token-Ebene',
      positionSaving: 'Positionsspeicherung',
      savePositions: 'Positionen speichern',
      restorePositions: 'Positionen wiederherstellen',
      encounterTemplates: 'Begegnungsvorlagen',
      saveEncounter: 'Begegnung speichern…',
      loadEncounter: 'Begegnung laden…',
      deleteEncounter: 'Begegnung löschen…',
      listEncounters: 'Begegnungen auflisten',
      resetRecovery: 'Zurücksetzen und Wiederherstellen',
      resetSelected: 'Ausgewählte zurücksetzen',
      resetPage: 'Seite zurücksetzen',
      resetAll: 'Alles zurücksetzen',
      reporting: 'Berichterstattung',
      refreshReport: 'Bericht aktualisieren',
      selectedReport: 'Ausgewählt',
      changedReport: 'Geändert',
      clearReport: 'Klar',
      help: 'Helfen',
      rebuildJournals: 'Journale neu erstellen',
      commandDeck: 'Kommandodeck',
      deckViewAll: 'Alle',
      deckViewScaling: 'Skalierung',
      deckViewPositioning: 'Positionierung',
      deckViewAdmin: 'Admin',
      deckViewLabel: 'Sicht:',
      partySizeLabel: 'Gruppengröße:',
      hpPercentLabel: 'HP %:',
      acModLabel: 'AC-Modifikator:',
      damagePercentLabel: 'Schaden %:',
      load: 'Laden',
      delete: 'Löschen',
      quickActions: 'Schnelle Aktionen',
      config: 'Konfig',
      quickActionsDesc:
        'Schneller Zugriff auf die am häufigsten verwendeten Party-Skalierungsvoreinstellungen und Boss-Typen.',
      partyScalingDesc:
        'Wendet die Skalierung sofort auf ausgewählte Token an. Ohne Auswahl werden die Werte für „Skalierung anwenden“ in Stufen gesetzt.',
      customScalingDesc:
        'Gilt sofort für ausgewählte Token. Stellen Sie zunächst einzelne Werte bereit und verwenden Sie dann „Skalierung anwenden“, wenn keine Token ausgewählt sind.',
      bossToolsDesc:
        'Wenden Sie Rollenvoreinstellungen auf ausgewählte Token an – Minion reduziert die Statistiken, Boss und Legendary erhöhen sie.',
      reinforcementsDesc:
        'Duplizieren Sie ausgewählte Token auf der Karte und nummerieren Sie wiederholte Token-Namen automatisch.',
      layerVisibilityDesc:
        'Verschieben Sie ausgewählte Spielsteine ​​zwischen Ebenen oder schalten Sie ihre Sichtbarkeit für Spieler um.',
      positionSavingDesc:
        'Schnappen Sie sich Token-Positionen auf der aktuellen Seite und stellen Sie sie jederzeit wieder her.',
      encounterTemplatesDesc:
        'Speichern Sie den aktuellen Seitenstatus als benannte Vorlage und stellen Sie ihn in zukünftigen Sitzungen wieder her.',
      resetRecoveryDesc:
        'Stellen Sie die ursprünglichen Statistiken der verfolgten Token wieder her und entfernen Sie ihre Tracking-Datensätze.',
      reportingDesc:
        'Aktualisieren Sie das Statusjournal mit einer Zusammenfassung der verfolgten Token und angewendeten Änderungen.',
      configDesc:
        'Legen Sie fest, welche Tokenleisten HP und AC verfolgen, und wählen Sie die Sprache der Benutzeroberfläche aus.',
      helpDesc:
        'Sehen Sie sich die vollständige Befehlsreferenz an oder erstellen Sie das Command Deck und die Statusjournale neu.',
      setHpBar1: 'Stellen Sie HP-Leiste 1 ein',
      setHpBar2: 'Stellen Sie HP-Leiste 2 ein',
      setAcBar2: 'AC-Leiste 2 einstellen',
      disableAc: 'Deaktivieren Sie die Klimaanlage',
    },
    report: {
      summary: 'Zusammenfassung',
      generated: 'Generiert',
      tokensOnPage: 'Tokens auf Seite',
      trackedTokens: 'Verfolgte Token',
      changed: 'Geändert',
      hiddenGm: 'Ausgeblendet (GM-Ebene)',
      bossesLegendary: 'Bosse / Legendär',
      minions: 'Schergen',
      noTrackedTokens: 'Keine verfolgten Token.',
      tokenCol: 'Token',
      layerCol: 'Schicht',
      hpCol: 'PS',
      acCol: 'Wechselstrom',
      dmgCol: 'Schaden',
      presetCol: 'Voreingestellt',
    },
  };

  const TRANSLATION$d = {
    titles: {
      scriptReady: 'Έτοιμο σενάριο',
      scalingApplied: 'Εφαρμόστηκε κλιμάκωση',
      scalingPresetReady: 'Προκαθορισμένη κλιμάκωση έτοιμο',
      hpUpdated: 'Η κλιμάκωση HP ενημερώθηκε',
      acUpdated: 'Ενημερώθηκε η κλιμάκωση AC',
      damageUpdated: 'Ενημερώθηκε η κλιμάκωση ζημιών',
      bossPreset: 'Προκαθορισμένο αφεντικό: {preset}',
      partySize: 'Μέγεθος πάρτι: {size}',
      reinforcementsCreated: 'Δημιουργήθηκαν ενισχύσεις',
      tokensNumbered: 'Μαρτυρικά αριθμημένα',
      layerChanged: 'Άλλαξε το επίπεδο',
      tokensHidden: 'Tokens Hidden',
      tokensRevealed: 'Tokens Revealed',
      positionsSaved: 'Οι θέσεις αποθηκεύτηκαν',
      positionsRestored: 'Οι θέσεις αποκαταστάθηκαν',
      encounterSaved: 'Η συνάντηση αποθηκεύτηκε',
      encounterLoaded: 'Η συνάντηση φορτώθηκε',
      encounterDeleted: 'Η συνάντηση διαγράφηκε',
      savedEncounters: 'Αποθηκευμένες συναντήσεις',
      tokensReset: 'Επαναφορά διακριτικών',
      pageReset: 'Επαναφορά σελίδας',
      allReset: 'Επαναφορά όλων των διακριτικών',
      reportUpdated: 'Η αναφορά ενημερώθηκε',
      reportCleared: 'Η αναφορά διαγράφηκε',
      journalsRebuilt: 'Τα περιοδικά ανακατασκευάστηκαν',
      deckUpdated: 'Ενημερώθηκε το Command Deck',
      configUpdated: 'Διαμόρφωση Ενημερώθηκε',
      currentConfig: 'Τρέχουσα διαμόρφωση',
      help: '{name} — Βοήθεια',
    },
    errors: {
      unknownCommand: 'Άγνωστη εντολή: "{sub}".',
      unknownCommandHint: 'Πληκτρολογήστε !director help για μια λίστα εντολών.',
      noTokensSelected: 'Δεν επιλέχθηκαν διακριτικά. Επιλέξτε πρώτα διακριτικά στο χάρτη.',
      unknownScaleAction: 'Άγνωστη ενέργεια κλίμακας: "{action}".',
      scaleActionHint: 'Έγκυρες ενέργειες: προεπιλογή, πάρτι, hp, ac, ζημιά, εφαρμογή',
      unknownPartyPreset: 'Άγνωστο προκαθορισμένο μέρος: "{preset}".',
      partyPresetHint: 'Έγκυρες προεπιλογές: {presets}',
      missingBossPreset: 'Λείπει το προκαθορισμένο όνομα του αφεντικού.',
      missingBossPresetHint: 'Έγκυρες προεπιλογές: {presets}',
      unknownBossPreset: 'Άγνωστο προκαθορισμένο αφεντικό: "{preset}".',
      unknownBossPresetHint: 'Έγκυρες προεπιλογές: {presets}',
      unknownReinforceAction: 'Άγνωστη ενέργεια ενίσχυσης: "{action}".',
      reinforceActionHint: 'Έγκυρες ενέργειες: διπλότυπο, απαρίθμηση, εμφάνιση',
      noReinforcementsToReveal: 'Δεν υπάρχουν πρόσφατες ενισχύσεις προς αποκάλυψη.',
      noReinforcementsToRevealHint: 'Χρησιμοποιήστε πρώτα το !director reinforce διπλότυπο.',
      unknownLayer: 'Άγνωστο επίπεδο: "{layer}".',
      layerHint: 'Έγκυρα επίπεδα: διακριτικό, gm, χάρτης',
      unknownPositionAction: 'Ενέργεια άγνωστης θέσης: "{action}".',
      positionActionHint: 'Έγκυρες ενέργειες: αποθήκευση, επαναφορά',
      unknownEncounterAction: 'Άγνωστη ενέργεια συνάντησης: "{action}".',
      encounterActionHint: 'Έγκυρες ενέργειες: αποθήκευση, φόρτωση, διαγραφή, λίστα',
      encounterNameRequired: 'Απαιτείται όνομα συνάντησης.',
      encounterNameRequiredHint: 'Παράδειγμα: !director encounter save goblin-ambush',
      encounterNotFound: 'Η συνάντηση "{name}" δεν βρέθηκε.',
      encounterNotFoundHint:
        'Χρησιμοποιήστε τη λίστα συναντήσεων !director για να δείτε αποθηκευμένες συναντήσεις.',
      unknownResetScope: 'Άγνωστο εύρος επαναφοράς: "{scope}".',
      resetScopeHint: 'Έγκυρα πεδία: επιλεγμένα, σελίδα, όλα',
      unknownReportAction: 'Άγνωστη ενέργεια αναφοράς: "{action}".',
      reportActionHint: 'Έγκυρες ενέργειες: ανανέωση, επιλεγμένη, αλλαγή, διαγραφή',
      unknownJournalAction: 'Άγνωστη ενέργεια ημερολογίου: "{action}".',
      journalActionHint: 'Έγκυρες ενέργειες: ανακατασκευή',
      unknownDeckView: 'Άγνωστη προβολή καταστρώματος: "{view}".',
      deckViewHint: 'Έγκυρες προβολές: όλα, κλιμάκωση, τοποθέτηση, διαχείριση',
      unknownConfigKey: 'Άγνωστο κλειδί διαμόρφωσης: "{key}".',
      configKeyHint: 'Έγκυρα κλειδιά: hp-bar, ac-bar, γλώσσα',
      invalidHpBar: 'Μη έγκυρη γραμμή HP: "{value}".',
      invalidHpBarHint: 'Έγκυρες επιλογές: {options}',
      invalidAcBar: 'Μη έγκυρη γραμμή AC: "{value}".',
      invalidAcBarHint: 'Έγκυρες επιλογές: {options}',
      invalidLanguage: 'Μη έγκυρη γλώσσα: "{value}".',
      invalidLanguageHint: 'Υποστηρίζεται: {locales}',
      invalidPartySize:
        'Το μέγεθος του πάρτι πρέπει να είναι ένας αριθμός μεταξύ 1 και 30 (έλαβε "{value}").',
      invalidHpPercent:
        'Το ποσοστό HP πρέπει να είναι μεταξύ 1 και 1000 (έχει "{value}"). Παράδειγμα: 150',
      invalidAcModifier:
        'Ο τροποποιητής AC πρέπει να είναι μεταξύ -10 και +10 (έλαβε "{value}"). Παράδειγμα: +2',
      invalidDamagePercent:
        'Το ποσοστό ζημιάς πρέπει να είναι μεταξύ 1 και 1000 (έλαβε "{value}"). Παράδειγμα: 125',
      invalidDuplicateCount:
        'Ο αριθμός των διπλότυπων πρέπει να είναι μεταξύ 1 και 50 (λήφθηκε "{value}"). Παράδειγμα: 3',
      invalidEncounterName:
        'Μη έγκυρο όνομα συνάντησης: "{name}". Τα ονόματα μπορεί να περιέχουν γράμματα, ψηφία, κενά, παύλες και κάτω παύλες (έως 64 χαρακτήρες).',
      invalidEncounterNameHint: 'Παράδειγμα: !director encounter save goblin-ambush',
      duplicateBurstLimit:
        'Η λειτουργία θα δημιουργούσε διακριτικά {requested}, που υπερβαίνουν το όριο των {limit}. Επιλέξτε λιγότερα διακριτικά ή χρησιμοποιήστε μικρότερο πλήθος.',
      unexpectedError: 'Παρουσιάστηκε ένα μη αναμενόμενο σφάλμα: {message}',
      unexpectedErrorHint: 'Ελέγξτε την κονσόλα API για λεπτομέρειες.',
    },
    confirm: {
      scalingPresetPending: 'Επιλέξτε διακριτικά και, στη συνέχεια, κάντε κλικ στο Apply Scaling.',
      journalsRebuilt: 'Το Command Deck και το ημερολόγιο κατάστασης έχουν αναδημιουργηθεί.',
      deckUpdated: 'Το Command Deck έχει αναδημιουργηθεί χρησιμοποιώντας την προβολή {view}.',
      reportCleared: 'Η αναφορά διαγράφηκε.',
      scriptReadyHint:
        'Ανοίξτε το ημερολόγιο Combat Encounter Director - Command Deck για τον πίνακα ελέγχου.',
      langSet: 'Η γλώσσα ορίστηκε σε {locale}.',
    },
    labels: {
      preset: 'Προκαθορισμένη',
      nearestPreset: 'Πλησιέστερη προεπιλογή',
      hp: 'ιπποδύναμη',
      ac: 'AC',
      acModifier: 'Τροποποιητής AC',
      damage: 'Βλάβη',
      appliedTo: 'Εφαρμόστηκε σε',
      copiesPerToken: 'Αντίγραφα ανά διακριτικό',
      totalCreated: 'Σύνολο δημιουργήθηκε',
      renamed: 'Μετονομάστηκε',
      layer: 'Στρώμα',
      moved: 'Μετακινήθηκε',
      hidden: 'Κεκρυμμένος',
      revealed: 'Αποκαλύφθηκε',
      saved: 'Αποθηκεύτηκε',
      restored: 'Αποκαταστάθηκε',
      noSavedPosition: 'Δεν υπάρχει αποθηκευμένη θέση',
      tokensCaptured: 'Τα κουπόνια έχουν συλληφθεί',
      loaded: 'Φορτωμένος',
      missingTokens: 'Λείπουν μάρκες',
      reset: 'Επαναφορά',
      notTracked: 'Δεν παρακολουθείται',
      tokensInReport: 'Tokens στην αναφορά',
      selectedTokensInReport: 'Επιλεγμένα διακριτικά στην αναφορά',
      changedTokensInReport: 'Άλλαξαν διακριτικά στην αναφορά',
      hpBar: 'Μπάρα HP',
      acBar: 'Μπάρα AC',
      language: 'Γλώσσα',
      noEncountersSaved: 'Δεν έχουν αποθηκευτεί ακόμη συναντήσεις.',
      name: 'Ονομα',
      deleted: 'Διαγράφηκε',
      duplicateFailed: 'Δεν είναι διπλό',
      duplicateFailedHint:
        'Η εικόνα δεν βρίσκεται στη βιβλιοθήκη Roll20 — προσθέστε τη στη βιβλιοθήκη σας ή ορίστε την εικόνα διακριτικού με μη αυτόματο τρόπο.',
    },
    ui: {
      applyScalingButton: 'Εφαρμογή κλιμάκωσης σε επιλεγμένα',
      partyScaling: 'Κλιμάκωση πάρτι',
      customScaling: 'Προσαρμοσμένη κλιμάκωση',
      bossTools: 'Boss Tools',
      bossPresetHint: 'Εφαρμογή προεπιλογής σε επιλεγμένα διακριτικά',
      reinforcements: 'Ενισχύσεις',
      duplicateSelected: 'Επιλέχθηκε διπλότυπο:',
      customDuplicate: 'Εθιμο…',
      autoNumber: 'Επιλέχθηκε ο αυτόματος αριθμός',
      layerVisibility: 'Επίπεδο & Ορατότητα',
      moveToLayer: 'Μετακίνηση στο επίπεδο:',
      tokenLayer: 'Token Layer',
      gmLayer: 'Στρώμα GM',
      mapLayer: 'Επίπεδο χάρτη',
      hideSelected: 'Απόκρυψη επιλεγμένων',
      revealSelected: 'Αποκάλυψη επιλεγμένων',
      revealReinforcements: 'Αποκάλυψη στο Token Layer',
      positionSaving: 'Αποθήκευση θέσης',
      savePositions: 'Αποθήκευση θέσεων',
      restorePositions: 'Επαναφορά θέσεων',
      encounterTemplates: 'Πρότυπα συνάντησης',
      saveEncounter: 'Αποθήκευση συνάντησης…',
      loadEncounter: 'Φόρτωση συνάντησης…',
      deleteEncounter: 'Διαγραφή Συνάντησης…',
      listEncounters: 'Λίστα συναντήσεων',
      resetRecovery: 'Επαναφορά & ανάκτηση',
      resetSelected: 'Επαναφορά επιλεγμένου',
      resetPage: 'Επαναφορά σελίδας',
      resetAll: 'Επαναφορά όλων',
      reporting: 'Αναφορά',
      refreshReport: 'Ανανέωση αναφοράς',
      selectedReport: 'Επιλεγμένο',
      changedReport: 'Άλλαξε',
      clearReport: 'Σαφής',
      help: 'Βοήθεια',
      rebuildJournals: 'Ανακατασκευή περιοδικών',
      commandDeck: 'Κατάστρωμα εντολών',
      deckViewAll: 'Ολοι',
      deckViewScaling: 'Απολέπιση',
      deckViewPositioning: 'Τοποθέτηση',
      deckViewAdmin: 'Διαχειρ',
      deckViewLabel: 'Θέα:',
      partySizeLabel: 'Μέγεθος πάρτι:',
      hpPercentLabel: '% HP:',
      acModLabel: 'Τροποποιητής AC:',
      damagePercentLabel: '% ζημιάς:',
      load: 'Φορτίο',
      delete: 'Διαγράφω',
      quickActions: 'Γρήγορες Ενέργειες',
      config: 'Διαμόρφωση',
      quickActionsDesc:
        'Γρήγορη πρόσβαση στις πιο χρησιμοποιούμενες προεπιλογές κλιμάκωσης πάρτι και τύπους boss.',
      partyScalingDesc:
        'Εφαρμόζει κλιμάκωση αμέσως σε επιλεγμένα διακριτικά. Χωρίς επιλογή, σκηνοθετεί τις τιμές για Εφαρμογή κλιμάκωσης.',
      customScalingDesc:
        'Εφαρμόζεται άμεσα σε επιλεγμένα διακριτικά. Σταθμοποιήστε πρώτα μεμονωμένες τιμές και, στη συνέχεια, χρησιμοποιήστε την Εφαρμογή κλιμάκωσης όταν δεν έχουν επιλεγεί διακριτικά.',
      bossToolsDesc:
        'Εφαρμόστε προεπιλογές ρόλων σε επιλεγμένα διακριτικά — Το Minion μειώνει τα στατιστικά στοιχεία, το Boss και το Legendary τα ενισχύουν.',
      reinforcementsDesc:
        'Δημιουργήστε διπλότυπα επιλεγμένα διακριτικά στο χάρτη και αριθμήστε αυτόματα επαναλαμβανόμενα ονόματα διακριτικών.',
      layerVisibilityDesc:
        'Μετακινήστε τα επιλεγμένα διακριτικά μεταξύ των επιπέδων ή αλλάξτε την ορατότητά τους για τους παίκτες.',
      positionSavingDesc:
        'Στιγμιότυπο θέσεων διακριτικών στην τρέχουσα σελίδα και επαναφορά τους ανά πάσα στιγμή.',
      encounterTemplatesDesc:
        'Αποθηκεύστε την τρέχουσα κατάσταση της σελίδας ως πρότυπο με όνομα και επαναφέρετέ την σε μελλοντικές συνεδρίες.',
      resetRecoveryDesc:
        'Επαναφέρετε τα εντοπισμένα διακριτικά στα αρχικά στατιστικά τους και αφαιρέστε τα αρχεία παρακολούθησης.',
      reportingDesc:
        'Ανανεώστε το ημερολόγιο κατάστασης με μια σύνοψη των εντοπισμένων διακριτικών και των εφαρμοζόμενων αλλαγών.',
      configDesc:
        'Ορίστε ποιες γραμμές διακριτικών παρακολουθούν το HP και το AC και επιλέξτε τη γλώσσα διεπαφής.',
      helpDesc:
        'Δείτε την πλήρη αναφορά εντολών ή δημιουργήστε ξανά το Command Deck και τα ημερολόγια κατάστασης.',
      setHpBar1: 'Ρυθμίστε τη γραμμή HP 1',
      setHpBar2: 'Ρυθμίστε τη γραμμή HP 2',
      setAcBar2: 'Ρυθμίστε τη γραμμή AC 2',
      disableAc: 'Απενεργοποιήστε το AC',
    },
    report: {
      summary: 'Περίληψη',
      generated: 'Δημιουργήθηκε',
      tokensOnPage: 'Tokens στη σελίδα',
      trackedTokens: 'Παρακολούθησαν διακριτικά',
      changed: 'Άλλαξε',
      hiddenGm: 'Κρυφό (επίπεδο GM)',
      bossesLegendary: 'Αφεντικά / Θρυλικοί',
      minions: 'Minions',
      noTrackedTokens: 'Δεν υπάρχουν διακριτικά παρακολούθησης.',
      tokenCol: 'Ενδειξη',
      layerCol: 'Στρώμα',
      hpCol: 'ιπποδύναμη',
      acCol: 'AC',
      dmgCol: 'Dmg',
      presetCol: 'Προκαθορισμένη',
    },
  };

  const TRANSLATION$c = {
    titles: {
      scriptReady: 'תסריט מוכן',
      scalingApplied: 'קנה מידה הוחל',
      scalingPresetReady: 'קנה מידה מוגדר מראש מוכן',
      hpUpdated: 'קנה המידה של HP מעודכן',
      acUpdated: 'קנה מידה AC מעודכן',
      damageUpdated: 'קנה מידה נזק עודכן',
      bossPreset: 'בוס מוגדר מראש: {preset}',
      partySize: 'גודל מסיבה: {size}',
      reinforcementsCreated: 'חיזוקים נוצרו',
      tokensNumbered: 'אסימונים ממוספרים',
      layerChanged: 'השכבה השתנתה',
      tokensHidden: 'אסימונים מוסתרים',
      tokensRevealed: 'אסימונים נחשפו',
      positionsSaved: 'המיקומים נשמרו',
      positionsRestored: 'עמדות שוחזרו',
      encounterSaved: 'המפגש נשמר',
      encounterLoaded: 'המפגש נטען',
      encounterDeleted: 'המפגש נמחק',
      savedEncounters: 'מפגשים שמורים',
      tokensReset: 'אסימונים איפוס',
      pageReset: 'איפוס עמוד',
      allReset: 'כל האסימונים מאופסים',
      reportUpdated: 'הדוח עודכן',
      reportCleared: 'הדוח נמחק',
      journalsRebuilt: 'כתבי עת נבנו מחדש',
      deckUpdated: 'סיפון הפיקוד עודכן',
      configUpdated: 'התצורה עודכנה',
      currentConfig: 'התצורה הנוכחית',
      help: '{name} — עזרה',
    },
    errors: {
      unknownCommand: 'פקודה לא ידועה: "{sub}".',
      unknownCommandHint: 'הקלד !director help לקבלת רשימה של פקודות.',
      noTokensSelected: 'לא נבחרו אסימונים. תחילה בחר אסימונים במפה.',
      unknownScaleAction: 'פעולת קנה מידה לא ידועה: "{action}".',
      scaleActionHint: 'פעולות חוקיות: מוגדר מראש, מסיבה, hp, ac, נזק, החל',
      unknownPartyPreset: 'קבוצה לא ידועה מראש: "{preset}".',
      partyPresetHint: 'קביעות מוגדרות מראש חוקיות: {presets}',
      missingBossPreset: 'חסר שם מוגדר מראש של הבוס.',
      missingBossPresetHint: 'קביעות מוגדרות מראש חוקיות: {presets}',
      unknownBossPreset: 'בוס לא ידוע מראש: "{preset}".',
      unknownBossPresetHint: 'קביעות מוגדרות מראש חוקיות: {presets}',
      unknownReinforceAction: 'פעולת חיזוק לא ידועה: "{action}".',
      reinforceActionHint: 'פעולות חוקיות: שכפול, מנה, הצג',
      noReinforcementsToReveal: 'אין חיזוקים אחרונים לחשוף.',
      noReinforcementsToRevealHint: 'השתמש תחילה ב-!director חיזוק שכפול.',
      unknownLayer: 'שכבה לא ידועה: "{layer}".',
      layerHint: 'שכבות תקפות: אסימון, GM, מפה',
      unknownPositionAction: 'פעולת מיקום לא ידועה: "{action}".',
      positionActionHint: 'פעולות חוקיות: שמור, שחזר',
      unknownEncounterAction: 'פעולת מפגש לא ידועה: "{action}".',
      encounterActionHint: 'פעולות חוקיות: שמור, טען, מחק, רשום',
      encounterNameRequired: 'נדרש שם מפגש.',
      encounterNameRequiredHint: 'דוגמה: !director encounter save goblin-ambush',
      encounterNotFound: 'המפגש "{name}" לא נמצא.',
      encounterNotFoundHint: 'השתמש ברשימת מפגשי !director כדי לראות מפגשים שמורים.',
      unknownResetScope: 'היקף איפוס לא ידוע: "{scope}".',
      resetScopeHint: 'היקפים תקפים: נבחר, עמוד, הכל',
      unknownReportAction: 'פעולת דיווח לא ידועה: "{action}".',
      reportActionHint: 'פעולות חוקיות: רענון, נבחר, השתנה, נקה',
      unknownJournalAction: 'פעולת יומן לא ידועה: "{action}".',
      journalActionHint: 'פעולות תקפות: בנייה מחדש',
      unknownDeckView: 'תצוגת סיפון לא ידוע: "{view}".',
      deckViewHint: 'תצוגות תקפות: הכל, קנה מידה, מיקום, אדמין',
      unknownConfigKey: 'מפתח תצורה לא ידוע: "{key}".',
      configKeyHint: 'מפתחות תקפים: hp-bar, ac-bar, language',
      invalidHpBar: 'סרגל HP לא חוקי: "{value}".',
      invalidHpBarHint: 'אפשרויות חוקיות: {options}',
      invalidAcBar: 'פס AC לא חוקי: "{value}".',
      invalidAcBarHint: 'אפשרויות חוקיות: {options}',
      invalidLanguage: 'שפה לא חוקית: "{value}".',
      invalidLanguageHint: 'נתמך: {locales}',
      invalidPartySize: 'גודל המפלגה חייב להיות מספר בין 1 ל-30 (יש "{value}").',
      invalidHpPercent: 'אחוז HP חייב להיות בין 1 ל-1000 (קיבלתי "{value}"). דוגמה: 150',
      invalidAcModifier: 'משנה AC חייב להיות בין -10 ל-+10 (יש "{value}"). דוגמה: +2',
      invalidDamagePercent: 'אחוז הנזק חייב להיות בין 1 ל-1000 (קיבלתי "{value}"). דוגמה: 125',
      invalidDuplicateCount: 'ספירת כפילויות חייבת להיות בין 1 ל-50 (יש "{value}"). דוגמה: 3',
      invalidEncounterName:
        'שם מפגש לא חוקי: "{name}". שמות עשויים להכיל אותיות, ספרות, רווחים, מקפים וקווים תחתונים (מקסימום 64 תווים).',
      invalidEncounterNameHint: 'דוגמה: !director encounter save goblin-ambush',
      duplicateBurstLimit:
        'הפעולה תיצור {requested} אסימונים, יחרוג מהמגבלה של {limit}. בחר פחות אסימונים או השתמש בספירה קטנה יותר.',
      unexpectedError: 'אירעה שגיאה בלתי צפויה: {message}',
      unexpectedErrorHint: 'בדוק את מסוף ה-API לפרטים.',
    },
    confirm: {
      scalingPresetPending: 'בחר אסימונים ולאחר מכן לחץ על החל קנה מידה.',
      journalsRebuilt: 'סיפון הפיקוד ויומן המצב נוצרו מחדש.',
      deckUpdated: 'סיפון הפיקוד נוצר מחדש באמצעות תצוגת {view}.',
      reportCleared: 'הדוח נמחק.',
      scriptReadyHint: 'פתח את יומן Combat Encounter Director - Command Deck עבור לוח הבקרה.',
      langSet: 'השפה מוגדרת ל-{locale}.',
    },
    labels: {
      preset: 'מוגדר מראש',
      nearestPreset: 'הכי קרוב',
      hp: 'HP',
      ac: 'AC',
      acModifier: 'משנה AC',
      damage: 'נֵזֶק',
      appliedTo: 'הוחל על',
      copiesPerToken: 'עותקים לכל אסימון',
      totalCreated: 'סך הכל נוצר',
      renamed: 'שונה שם',
      layer: 'שִׁכבָה',
      moved: 'נִרגָשׁ',
      hidden: 'מוּסתָר',
      revealed: 'נחשף',
      saved: 'נשמר',
      restored: 'מְשׁוּחזָר',
      noSavedPosition: 'אין מיקום שמור',
      tokensCaptured: 'אסימונים נתפסו',
      loaded: 'טָעוּן',
      missingTokens: 'חסרים אסימונים',
      reset: 'אִתחוּל',
      notTracked: 'לא במעקב',
      tokensInReport: 'אסימונים בדוח',
      selectedTokensInReport: 'אסימונים נבחרים בדוח',
      changedTokensInReport: 'שונו אסימונים בדוח',
      hpBar: 'בר HP',
      acBar: 'בר AC',
      language: 'שָׂפָה',
      noEncountersSaved: 'עדיין לא נשמרו מפגשים.',
      name: 'שֵׁם',
      deleted: 'נמחק',
      duplicateFailed: 'לא משוכפל',
      duplicateFailedHint:
        'תמונה לא בספריית Roll20 - הוסף לספרייה שלך או הגדר את תמונת האסימון באופן ידני.',
    },
    ui: {
      applyScalingButton: 'החל שינוי קנה מידה על נבחרים',
      partyScaling: 'קנה המידה של המפלגה',
      customScaling: 'קנה מידה מותאם אישית',
      bossTools: 'בוס כלים',
      bossPresetHint: 'החל הגדרה מראש על אסימונים שנבחרו',
      reinforcements: 'חיזוקים',
      duplicateSelected: 'נבחר כפול:',
      customDuplicate: 'מִנְהָג…',
      autoNumber: 'נבחר מספר אוטומטי',
      layerVisibility: 'שכבה ונראות',
      moveToLayer: 'העבר לשכבה:',
      tokenLayer: 'שכבת אסימונים',
      gmLayer: 'שכבת GM',
      mapLayer: 'שכבת מפה',
      hideSelected: 'הסתר את הנבחרים',
      revealSelected: 'חשוף שנבחר',
      revealReinforcements: 'לחשוף על Token Layer',
      positionSaving: 'שמירת מיקום',
      savePositions: 'שמור עמדות',
      restorePositions: 'שחזור עמדות',
      encounterTemplates: 'מפגש עם תבניות',
      saveEncounter: 'שמור מפגש...',
      loadEncounter: 'טען מפגש...',
      deleteEncounter: 'מחק את המפגש...',
      listEncounters: 'רשימת מפגשים',
      resetRecovery: 'איפוס ושחזור',
      resetSelected: 'אפס נבחר',
      resetPage: 'אפס דף',
      resetAll: 'אפס הכל',
      reporting: 'דיווח',
      refreshReport: 'רענן דוח',
      selectedReport: 'נִבחָר',
      changedReport: 'השתנה',
      clearReport: 'בָּרוּר',
      help: 'עֶזרָה',
      rebuildJournals: 'בניית יומנים מחדש',
      commandDeck: 'סיפון פיקוד',
      deckViewAll: 'כֹּל',
      deckViewScaling: 'דֵרוּג',
      deckViewPositioning: 'מיקום',
      deckViewAdmin: 'מנהל מערכת',
      deckViewLabel: 'נוֹף:',
      partySizeLabel: 'גודל מסיבה:',
      hpPercentLabel: 'HP %:',
      acModLabel: 'משנה AC:',
      damagePercentLabel: '% נזק:',
      load: 'לִטעוֹן',
      delete: 'לִמְחוֹק',
      quickActions: 'פעולות מהירות',
      config: 'Config',
      quickActionsDesc: 'גישה מהירה להגדרות הקבועות מראש של קנה מידה וסוגי הבוסים הנפוצים ביותר.',
      partyScalingDesc:
        'מחיל שינוי מידה על אסימונים נבחרים. ללא בחירה, משלב את הערכים עבור Apply Scaling.',
      customScalingDesc:
        'חל באופן מיידי על אסימונים נבחרים. תחילה שלב ערכים בודדים, ולאחר מכן השתמש ב-Apply Scaling כאשר לא נבחרו אסימונים.',
      bossToolsDesc:
        'החל קביעות מוגדרות מראש של תפקידים על אסימונים נבחרים - Minion מצמצם נתונים סטטיסטיים, Boss ו- Legendary מגבירים אותם.',
      reinforcementsDesc: 'שכפל אסימונים נבחרים במפה ומספר אוטומטי של שמות אסימונים חוזרים.',
      layerVisibilityDesc: 'העבר אסימונים נבחרים בין שכבות או החלף את הנראות שלהם עבור שחקנים.',
      positionSavingDesc: 'מיקומי אסימון Snapshot בעמוד הנוכחי ושחזר אותם בכל עת.',
      encounterTemplatesDesc: 'שמור את מצב העמוד הנוכחי כתבנית עם שם ושחזר אותו בפעילויות עתידיות.',
      resetRecoveryDesc: 'שחזר אסימונים במעקב לסטטיסטיקה המקורית שלהם והסר את רשומות המעקב שלהם.',
      reportingDesc: 'רענן את יומן המצב עם סיכום של אסימונים במעקב ושינויים שהוחלו.',
      configDesc: 'הגדר אילו פסי אסימונים עוקבים אחר HP ו-AC, ובחר את שפת הממשק.',
      helpDesc: 'הצג את ההפניה המלאה לפקודה או בנה מחדש את סיפון הפקודה ויומני המצב.',
      setHpBar1: 'הגדר את HP bar 1',
      setHpBar2: 'הגדר את HP bar 2',
      setAcBar2: 'הגדר AC בר 2',
      disableAc: 'השבת AC',
    },
    report: {
      summary: 'תַקצִיר',
      generated: 'נוצר',
      tokensOnPage: 'אסימונים בעמוד',
      trackedTokens: 'אסימונים במעקב',
      changed: 'השתנה',
      hiddenGm: 'מוסתר (שכבת GM)',
      bossesLegendary: 'בוסים / אגדי',
      minions: 'מיניונים',
      noTrackedTokens: 'אין אסימונים במעקב.',
      tokenCol: 'אֲסִימוֹן',
      layerCol: 'שִׁכבָה',
      hpCol: 'HP',
      acCol: 'AC',
      dmgCol: 'Dmg',
      presetCol: 'מוגדר מראש',
    },
  };

  const TRANSLATION$b = {
    titles: {
      scriptReady: 'Szkript kész',
      scalingApplied: 'Méretezés alkalmazva',
      scalingPresetReady: 'Méretezési előbeállítás kész',
      hpUpdated: 'A HP méretezés frissítve',
      acUpdated: 'AC skálázás frissítve',
      damageUpdated: 'A sérülések skálázása frissítve',
      bossPreset: 'Főnök előbeállítása: {preset}',
      partySize: 'Parti mérete: {size}',
      reinforcementsCreated: 'Erősítések létrehozva',
      tokensNumbered: 'Tokenek számozott',
      layerChanged: 'Réteg megváltozott',
      tokensHidden: 'Tokenek rejtve',
      tokensRevealed: 'Tokenek feltárva',
      positionsSaved: 'Pozíciók mentve',
      positionsRestored: 'Pozíciók visszaállítva',
      encounterSaved: 'Találkozás mentve',
      encounterLoaded: 'Encounter Loaded',
      encounterDeleted: 'Találkozás törölve',
      savedEncounters: 'Mentett találkozások',
      tokensReset: 'Tokenek visszaállítása',
      pageReset: 'Oldal visszaállítása',
      allReset: 'Minden token visszaállítása',
      reportUpdated: 'Jelentés frissítve',
      reportCleared: 'Jelentés törölve',
      journalsRebuilt: 'Újjáépített folyóiratok',
      deckUpdated: 'Command Deck frissítve',
      configUpdated: 'Konfig frissítve',
      currentConfig: 'Aktuális konfiguráció',
      help: '{name} — Súgó',
    },
    errors: {
      unknownCommand: 'Ismeretlen parancs: "{sub}".',
      unknownCommandHint: 'Írja be a !director help parancsot a parancsok listájához.',
      noTokensSelected: 'Nincs kiválasztva token. Először válassza ki a tokeneket a térképen.',
      unknownScaleAction: 'Ismeretlen léptékművelet: „{action}”.',
      scaleActionHint: 'Érvényes műveletek: előre beállított, party, hp, ac, kár, alkalmaz',
      unknownPartyPreset: 'Ismeretlen fél előbeállítása: "{preset}".',
      partyPresetHint: 'Érvényes előbeállítások: {presets}',
      missingBossPreset: 'Hiányzik a főnök előre beállított neve.',
      missingBossPresetHint: 'Érvényes előbeállítások: {presets}',
      unknownBossPreset: 'Ismeretlen főnök előre beállított: "{preset}".',
      unknownBossPresetHint: 'Érvényes előbeállítások: {presets}',
      unknownReinforceAction: 'Ismeretlen megerősítési művelet: "{action}".',
      reinforceActionHint: 'Érvényes műveletek: másolás, felsorolás, megjelenítés',
      noReinforcementsToReveal: 'Nem árulnak el újabb erősítéseket.',
      noReinforcementsToRevealHint: 'Először használd a !director erősítő duplikációt.',
      unknownLayer: 'Ismeretlen réteg: "{layer}".',
      layerHint: 'Érvényes rétegek: token, gm, térkép',
      unknownPositionAction: 'Ismeretlen pozícióművelet: "{action}".',
      positionActionHint: 'Érvényes műveletek: mentés, visszaállítás',
      unknownEncounterAction: 'Ismeretlen találkozási művelet: "{action}".',
      encounterActionHint: 'Érvényes műveletek: mentés, betöltés, törlés, listázás',
      encounterNameRequired: 'Találkozási név kötelező.',
      encounterNameRequiredHint: 'Példa: !director találkozás mentés goblin-ambush',
      encounterNotFound: 'A „{name}” találkozás nem található.',
      encounterNotFoundHint:
        'Használja a !director találkozási listát a mentett találkozások megtekintéséhez.',
      unknownResetScope: 'Ismeretlen visszaállítási hatókör: "{scope}".',
      resetScopeHint: 'Érvényes hatókör: kiválasztott, oldal, minden',
      unknownReportAction: 'Ismeretlen bejelentési művelet: "{action}".',
      reportActionHint: 'Érvényes műveletek: frissítés, kijelölés, módosítás, törlés',
      unknownJournalAction: 'Ismeretlen naplóművelet: "{action}".',
      journalActionHint: 'Érvényes műveletek: újjáépítés',
      unknownDeckView: 'Ismeretlen fedélzeti nézet: „{view}”.',
      deckViewHint: 'Érvényes nézetek: minden, méretezés, pozicionálás, admin',
      unknownConfigKey: 'Ismeretlen konfigurációs kulcs: "{key}".',
      configKeyHint: 'Érvényes kulcsok: hp-bar, ac-bar, nyelv',
      invalidHpBar: 'Érvénytelen HP-sáv: "{value}".',
      invalidHpBarHint: 'Érvényes lehetőségek: {options}',
      invalidAcBar: 'Érvénytelen váltakozó áramú sáv: "{value}".',
      invalidAcBarHint: 'Érvényes lehetőségek: {options}',
      invalidLanguage: 'Érvénytelen nyelv: "{value}".',
      invalidLanguageHint: 'Támogatott: {locales}',
      invalidPartySize:
        'A társaság létszámának 1 és 30 közötti számnak kell lennie (a "{value}" érték).',
      invalidHpPercent:
        'A HP százalékának 1 és 1000 között kell lennie (a "{value}" értéket kapta). Példa: 150',
      invalidAcModifier:
        'Az AC módosítónak -10 és +10 között kell lennie (a "{value}" értéket kapta). Példa: +2',
      invalidDamagePercent:
        'A kár százalékának 1 és 1000 között kell lennie (a "{value}" érték). Példa: 125',
      invalidDuplicateCount:
        'Az ismétlődések számának 1 és 50 között kell lennie (a következőt kapta: „{value}”). Példa: 3',
      invalidEncounterName:
        'Érvénytelen találkozásnév: "{name}". A nevek tartalmazhatnak betűket, számjegyeket, szóközöket, kötőjeleket és aláhúzásjeleket (max. 64 karakter).',
      invalidEncounterNameHint: 'Példa: !director találkozás mentés goblin-ambush',
      duplicateBurstLimit:
        'A művelet {requested} tokent hozna létre, ami meghaladja a {limit} korlátot. Válasszon kevesebb tokent, vagy használjon kisebb számot.',
      unexpectedError: 'Váratlan hiba történt: {message}',
      unexpectedErrorHint: 'A részletekért tekintse meg az API-konzolt.',
    },
    confirm: {
      scalingPresetPending:
        'Válassza ki a tokeneket, majd kattintson a Méretezés alkalmazása gombra.',
      journalsRebuilt: 'A Command Deck és az állapotnapló újragenerálásra került.',
      deckUpdated: 'A Command Deck újra lett generálva a {view} nézet használatával.',
      reportCleared: 'Jelentés törölve.',
      scriptReadyHint:
        'Nyissa meg a Combat Encounter Director - Command Deck naplót a vezérlőpulthoz.',
      langSet: 'A nyelv beállítása a következőre: {locale}.',
    },
    labels: {
      preset: 'Előre beállított',
      nearestPreset: 'Legközelebbi előre beállított',
      hp: 'HP',
      ac: 'AC',
      acModifier: 'AC módosító',
      damage: 'Kár',
      appliedTo: 'Alkalmazva',
      copiesPerToken: 'Példányok tokenenként',
      totalCreated: 'Összesen létrehozva',
      renamed: 'Átnevezve',
      layer: 'Réteg',
      moved: 'Elköltözött',
      hidden: 'Rejtett',
      revealed: 'Kiderült',
      saved: 'Mentve',
      restored: 'Helyreállítva',
      noSavedPosition: 'Nincs mentett pozíció',
      tokensCaptured: 'A tokenek elfogva',
      loaded: 'Töltött',
      missingTokens: 'Hiányzó tokenek',
      reset: 'Reset',
      notTracked: 'Nincs nyomon követve',
      tokensInReport: 'Tokenek a jelentésben',
      selectedTokensInReport: 'Kiválasztott tokenek a jelentésben',
      changedTokensInReport: 'Módosult a tokenek a jelentésben',
      hpBar: 'HP bár',
      acBar: 'AC bár',
      language: 'Nyelv',
      noEncountersSaved: 'Még nincs mentett találkozás.',
      name: 'Név',
      deleted: 'Törölve',
      duplicateFailed: 'Nem sokszorosított',
      duplicateFailedHint:
        'A kép nincs a Roll20 Library-ben – adja hozzá a könyvtárához, vagy állítsa be kézzel a token képet.',
    },
    ui: {
      applyScalingButton: 'Méretezés alkalmazása a kiválasztottra',
      partyScaling: 'Party méretezés',
      customScaling: 'Egyedi méretezés',
      bossTools: 'Boss Tools',
      bossPresetHint: 'Előbeállítás alkalmazása a kiválasztott tokenekre',
      reinforcements: 'Erősítések',
      duplicateSelected: 'Másodpéldány kiválasztva:',
      customDuplicate: 'Szokás…',
      autoNumber: 'Automatikus szám kiválasztva',
      layerVisibility: 'Réteg és láthatóság',
      moveToLayer: 'Ugrás a rétegre:',
      tokenLayer: 'Token Layer',
      gmLayer: 'GM réteg',
      mapLayer: 'Térképréteg',
      hideSelected: 'Kijelölt elrejtése',
      revealSelected: 'Kijelölt megjelenítése',
      revealReinforcements: 'Felfedés a Token Layeren',
      positionSaving: 'Pozíció mentése',
      savePositions: 'Pozíciók mentése',
      restorePositions: 'Pozíciók visszaállítása',
      encounterTemplates: 'Találkozási sablonok',
      saveEncounter: 'Találkozás mentése…',
      loadEncounter: 'Találkozás betöltése…',
      deleteEncounter: 'Találkozás törlése…',
      listEncounters: 'Találkozások listája',
      resetRecovery: 'Visszaállítás és helyreállítás',
      resetSelected: 'Reset Selected',
      resetPage: 'Oldal visszaállítása',
      resetAll: 'Összes visszaállítása',
      reporting: 'Jelentés',
      refreshReport: 'Jelentés frissítése',
      selectedReport: 'Kiválasztott',
      changedReport: 'Megváltozott',
      clearReport: 'Világos',
      help: 'Segítség',
      rebuildJournals: 'Folyóiratok újjáépítése',
      commandDeck: 'Command Deck',
      deckViewAll: 'Minden',
      deckViewScaling: 'Méretezés',
      deckViewPositioning: 'Elhelyezés',
      deckViewAdmin: 'Admin',
      deckViewLabel: 'Kilátás:',
      partySizeLabel: 'A társaság mérete:',
      hpPercentLabel: 'HP %:',
      acModLabel: 'AC módosító:',
      damagePercentLabel: 'Sebzés %:',
      load: 'Terhelés',
      delete: 'Töröl',
      quickActions: 'Gyors műveletek',
      config: 'Konfig',
      quickActionsDesc:
        'Gyors hozzáférés a leggyakrabban használt pártméretezési beállításokhoz és főnöktípusokhoz.',
      partyScalingDesc:
        'Azonnal alkalmazza a méretezést a kiválasztott tokenekre. Kiválasztás nélkül fokozatba állítja az Apply Scaling értékeit.',
      customScalingDesc:
        'Azonnal vonatkozik a kiválasztott tokenekre. Először állítsa be az egyedi értékeket, majd használja a Méretezés alkalmazása parancsot, ha nincs kiválasztva token.',
      bossToolsDesc:
        'Alkalmazzon előre beállított szerepeket a kiválasztott tokenekre – a Minion csökkenti a statisztikákat, a Boss és a Legendary pedig növeli őket.',
      reinforcementsDesc:
        'A kiválasztott tokenek megkettőzése a térképen, és az ismétlődő tokennevek automatikus számozása.',
      layerVisibilityDesc:
        'Mozgassa a kiválasztott tokeneket a rétegek között, vagy módosítsa láthatóságukat a játékosok számára.',
      positionSavingDesc:
        'Pillanatképet készíthet a jogkivonat pozícióiról az aktuális oldalon, és bármikor visszaállíthatja azokat.',
      encounterTemplatesDesc:
        'Mentse el az aktuális oldalállapotot elnevezett sablonként, és állítsa vissza a következő munkamenetekben.',
      resetRecoveryDesc:
        'Állítsa vissza a nyomon követett tokenek eredeti statisztikáit, és távolítsa el a nyomkövetési rekordjaikat.',
      reportingDesc:
        'Frissítse az állapotnaplót a nyomon követett tokenek és az alkalmazott változtatások összegzésével.',
      configDesc:
        'Állítsa be, hogy mely tokensávok kövessék a HP-t és az AC-t, és válassza ki az interfész nyelvét.',
      helpDesc:
        'Tekintse meg a teljes parancsreferenciát, vagy építse újra a Command Decket és az állapotnaplókat.',
      setHpBar1: 'Állítsa be a HP sávot 1',
      setHpBar2: 'Állítsa be a HP bar 2-t',
      setAcBar2: 'Állítsa be az AC sávot 2',
      disableAc: 'Az AC letiltása',
    },
    report: {
      summary: 'Összegzés',
      generated: 'Generált',
      tokensOnPage: 'Tokenek az oldalon',
      trackedTokens: 'Nyomon követett tokenek',
      changed: 'Megváltozott',
      hiddenGm: 'Rejtett (GM réteg)',
      bossesLegendary: 'Főnökök / Legendás',
      minions: 'Minyonok',
      noTrackedTokens: 'Nincsenek nyomon követett tokenek.',
      tokenCol: 'Jelképes',
      layerCol: 'Réteg',
      hpCol: 'HP',
      acCol: 'AC',
      dmgCol: 'Dmg',
      presetCol: 'Előre beállított',
    },
  };

  const TRANSLATION$a = {
    titles: {
      scriptReady: 'Sceneggiatura pronta',
      scalingApplied: 'Ridimensionamento applicato',
      scalingPresetReady: 'Preimpostazione ridimensionamento pronta',
      hpUpdated: 'Ridimensionamento HP aggiornato',
      acUpdated: 'Ridimensionamento CA aggiornato',
      damageUpdated: 'Ridimensionamento dei danni aggiornato',
      bossPreset: 'Preimpostazione Boss: {preset}',
      partySize: 'Dimensioni della festa: {size}',
      reinforcementsCreated: 'Rinforzi creati',
      tokensNumbered: 'Gettoni numerati',
      layerChanged: 'Livello modificato',
      tokensHidden: 'Gettoni nascosti',
      tokensRevealed: 'Token rivelati',
      positionsSaved: 'Posizioni salvate',
      positionsRestored: 'Posizioni ripristinate',
      encounterSaved: 'Incontro salvato',
      encounterLoaded: 'Incontro caricato',
      encounterDeleted: 'Incontro eliminato',
      savedEncounters: 'Incontri salvati',
      tokensReset: 'Reimpostazione dei token',
      pageReset: 'Reimposta pagina',
      allReset: 'Tutti i token vengono reimpostati',
      reportUpdated: 'Rapporto aggiornato',
      reportCleared: 'Rapporto cancellato',
      journalsRebuilt: 'Riviste ricostruite',
      deckUpdated: 'Mazzo di comando aggiornato',
      configUpdated: 'Configurazione aggiornata',
      currentConfig: 'Configurazione corrente',
      help: '{name} — Aiuto',
    },
    errors: {
      unknownCommand: 'Comando sconosciuto: "{sub}".',
      unknownCommandHint: 'Digitare !director help per un elenco di comandi.',
      noTokensSelected: 'Nessun token selezionato. Seleziona prima i token sulla mappa.',
      unknownScaleAction: 'Azione scala sconosciuta: "{action}".',
      scaleActionHint: 'Azioni valide: preset, party, hp, ac, danno, applica',
      unknownPartyPreset: 'Preimpostazione gruppo sconosciuto: "{preset}".',
      partyPresetHint: 'Preimpostazioni valide: {presets}',
      missingBossPreset: 'Nome preimpostato del boss mancante.',
      missingBossPresetHint: 'Preimpostazioni valide: {presets}',
      unknownBossPreset: 'Preimpostazione boss sconosciuto: "{preset}".',
      unknownBossPresetHint: 'Preimpostazioni valide: {presets}',
      unknownReinforceAction: 'Azione di rinforzo sconosciuta: "{action}".',
      reinforceActionHint: 'Azioni valide: duplicare, enumerare, mostrare',
      noReinforcementsToReveal: 'Nessun rinforzo recente da rivelare.',
      noReinforcementsToRevealHint: 'Utilizzare prima !director per rinforzare il duplicato.',
      unknownLayer: 'Livello sconosciuto: "{layer}".',
      layerHint: 'Livelli validi: token, gm, mappa',
      unknownPositionAction: 'Azione di posizione sconosciuta: "{action}".',
      positionActionHint: 'Azioni valide: salva, ripristina',
      unknownEncounterAction: 'Azione incontro sconosciuta: "{action}".',
      encounterActionHint: 'Azioni valide: salva, carica, elimina, elenca',
      encounterNameRequired: "Nome dell'incontro obbligatorio.",
      encounterNameRequiredHint: "Esempio: !l'incontro del regista salva l'imboscata dei goblin",
      encounterNotFound: 'Incontro "{name}" non trovato.',
      encounterNotFoundHint:
        "Utilizza l'elenco degli incontri di !director per vedere gli incontri salvati.",
      unknownResetScope: 'Ambito di reimpostazione sconosciuto: "{scope}".',
      resetScopeHint: 'Ambiti validi: selezionato, pagina, tutto',
      unknownReportAction: 'Azione di segnalazione sconosciuta: "{action}".',
      reportActionHint: 'Azioni valide: aggiorna, selezionato, modificato, cancella',
      unknownJournalAction: 'Azione del diario sconosciuta: "{action}".',
      journalActionHint: 'Azioni valide: ricostruire',
      unknownDeckView: 'Visualizzazione mazzo sconosciuta: "{view}".',
      deckViewHint:
        'Visualizzazioni valide: tutto, ridimensionamento, posizionamento, amministrazione',
      unknownConfigKey: 'Chiave di configurazione sconosciuta: "{key}".',
      configKeyHint: 'Chiavi valide: hp-bar, ac-bar, lingua',
      invalidHpBar: 'Barra HP non valida: "{value}".',
      invalidHpBarHint: 'Opzioni valide: {options}',
      invalidAcBar: 'Barra AC non valida: "{value}".',
      invalidAcBarHint: 'Opzioni valide: {options}',
      invalidLanguage: 'Lingua non valida: "{value}".',
      invalidLanguageHint: 'Supportato: {locales}',
      invalidPartySize:
        'La dimensione del gruppo deve essere un numero compreso tra 1 e 30 (ha ottenuto "{value}").',
      invalidHpPercent:
        'La percentuale di HP deve essere compresa tra 1 e 1000 (ottenuto "{value}"). Esempio: 150',
      invalidAcModifier:
        'Il modificatore CA deve essere compreso tra -10 e +10 (ottenuto "{value}"). Esempio: +2',
      invalidDamagePercent:
        'La percentuale di danno deve essere compresa tra 1 e 1000 (ottenuto "{value}"). Esempio: 125',
      invalidDuplicateCount:
        'Il conteggio dei duplicati deve essere compreso tra 1 e 50 (ottenuto "{value}"). Esempio: 3',
      invalidEncounterName:
        'Nome incontro non valido: "{name}". I nomi possono contenere lettere, cifre, spazi, trattini e trattini bassi (max 64 caratteri).',
      invalidEncounterNameHint: "Esempio: !l'incontro del regista salva l'imboscata dei goblin",
      duplicateBurstLimit:
        "L'operazione creerebbe {requested} token, superando il limite di {limit}. Seleziona meno token o utilizza un conteggio inferiore.",
      unexpectedError: 'Si è verificato un errore imprevisto: {message}',
      unexpectedErrorHint: 'Controlla la console API per i dettagli.',
    },
    confirm: {
      scalingPresetPending: 'Seleziona i token, quindi fai clic su Applica ridimensionamento.',
      journalsRebuilt: 'Il mazzo di comando e il diario di stato sono stati rigenerati.',
      deckUpdated: 'Il mazzo di comando è stato rigenerato utilizzando la vista {view}.',
      reportCleared: 'Rapporto cancellato.',
      scriptReadyHint:
        'Apri il diario Combat Encounter Director - Command Deck per il pannello di controllo.',
      langSet: 'Lingua impostata su {locale}.',
    },
    labels: {
      preset: 'Preimpostato',
      nearestPreset: 'Preimpostazione più vicina',
      hp: 'HP',
      ac: 'AC',
      acModifier: 'Modificatore CA',
      damage: 'Danno',
      appliedTo: 'Applicato a',
      copiesPerToken: 'Copie per token',
      totalCreated: 'Totale creato',
      renamed: 'Rinominato',
      layer: 'Strato',
      moved: 'Mosso',
      hidden: 'Nascosto',
      revealed: 'Rivelato',
      saved: 'Salvato',
      restored: 'Restaurato',
      noSavedPosition: 'Nessuna posizione salvata',
      tokensCaptured: 'Gettoni catturati',
      loaded: 'Caricato',
      missingTokens: 'Gettoni mancanti',
      reset: 'Reset',
      notTracked: 'Non tracciato',
      tokensInReport: 'Token nel rapporto',
      selectedTokensInReport: 'Token selezionati nel rapporto',
      changedTokensInReport: 'Token modificati nel rapporto',
      hpBar: 'Barra HP',
      acBar: 'Barra AC',
      language: 'Lingua',
      noEncountersSaved: 'Nessun incontro ancora salvato.',
      name: 'Nome',
      deleted: 'Eliminato',
      duplicateFailed: 'Non duplicato',
      duplicateFailedHint:
        "Immagine non nella libreria Roll20: aggiungi alla tua libreria o imposta manualmente l'immagine del token.",
    },
    ui: {
      applyScalingButton: 'Applica ridimensionamento a selezionato',
      partyScaling: 'Ridimensionamento del partito',
      customScaling: 'Ridimensionamento personalizzato',
      bossTools: 'Strumenti del capo',
      bossPresetHint: 'Applica la preimpostazione ai token selezionati',
      reinforcements: 'Rinforzi',
      duplicateSelected: 'Duplicato selezionato:',
      customDuplicate: 'Costume…',
      autoNumber: 'Numerazione automatica selezionata',
      layerVisibility: 'Livello e visibilità',
      moveToLayer: 'Passa al livello:',
      tokenLayer: 'Livello token',
      gmLayer: 'Strato GM',
      mapLayer: 'Livello mappa',
      hideSelected: 'Nascondi selezionato',
      revealSelected: 'Rivela selezionati',
      revealReinforcements: 'Rivela sul livello token',
      positionSaving: 'Salvataggio della posizione',
      savePositions: 'Salva posizioni',
      restorePositions: 'Ripristina posizioni',
      encounterTemplates: 'Modelli di incontro',
      saveEncounter: 'Salva incontro...',
      loadEncounter: 'Carica incontro...',
      deleteEncounter: 'Elimina incontro...',
      listEncounters: 'Elenca gli incontri',
      resetRecovery: 'Ripristino e ripristino',
      resetSelected: 'Reimposta selezionato',
      resetPage: 'Reimposta pagina',
      resetAll: 'Reimposta tutto',
      reporting: 'Segnalazione',
      refreshReport: 'Aggiorna rapporto',
      selectedReport: 'Selezionato',
      changedReport: 'Cambiato',
      clearReport: 'Chiaro',
      help: 'Aiuto',
      rebuildJournals: 'Ricostruire i diari',
      commandDeck: 'Mazzo di comando',
      deckViewAll: 'Tutto',
      deckViewScaling: 'Ridimensionamento',
      deckViewPositioning: 'Posizionamento',
      deckViewAdmin: 'Ammin',
      deckViewLabel: 'Visualizzazione:',
      partySizeLabel: 'Dimensione del gruppo:',
      hpPercentLabel: '% HP:',
      acModLabel: 'Modificatore CA:',
      damagePercentLabel: 'Danno %:',
      load: 'Carico',
      delete: 'Eliminare',
      quickActions: 'Azioni rapide',
      config: 'Configurazione',
      quickActionsDesc:
        'Accesso rapido alle preimpostazioni di ridimensionamento del party e ai tipi di boss più utilizzati.',
      partyScalingDesc:
        'Applica immediatamente il ridimensionamento ai token selezionati. Senza alcuna selezione, mette in scena i valori per Applica ridimensionamento.',
      customScalingDesc:
        'Si applica immediatamente ai token selezionati. Metti prima in scena i singoli valori, quindi utilizza Applica ridimensionamento quando non sono selezionati token.',
      bossToolsDesc:
        'Applica i ruoli predefiniti ai token selezionati: il Minion riduce le statistiche, il Boss e il Leggendario le aumentano.',
      reinforcementsDesc:
        'Duplica i token selezionati sulla mappa e numera automaticamente i nomi dei token ripetuti.',
      layerVisibilityDesc:
        'Sposta i token selezionati tra i livelli o attiva la loro visibilità per i giocatori.',
      positionSavingDesc:
        'Cattura le posizioni dei token sulla pagina corrente e ripristinale in qualsiasi momento.',
      encounterTemplatesDesc:
        'Salva lo stato corrente della pagina come modello con nome e ripristinalo nelle sessioni future.',
      resetRecoveryDesc:
        'Ripristina i token tracciati alle loro statistiche originali e rimuovi i relativi record di tracciamento.',
      reportingDesc:
        'Aggiorna il diario di stato con un riepilogo dei token tracciati e delle modifiche applicate.',
      configDesc:
        "Imposta quali barre dei token tracciano HP e AC e scegli la lingua dell'interfaccia.",
      helpDesc:
        'Visualizza il riferimento completo ai comandi o ricostruisci il mazzo di comandi e i diari di stato.',
      setHpBar1: 'Imposta la barra HP 1',
      setHpBar2: 'Imposta la barra HP 2',
      setAcBar2: 'Impostare la barra CA 2',
      disableAc: 'Disabilita AC',
    },
    report: {
      summary: 'Riepilogo',
      generated: 'Generato',
      tokensOnPage: 'Gettoni a pagina',
      trackedTokens: 'Gettoni tracciati',
      changed: 'Cambiato',
      hiddenGm: 'Nascosto (livello GM)',
      bossesLegendary: 'Boss/Leggendari',
      minions: 'Servi',
      noTrackedTokens: 'Nessun token tracciato.',
      tokenCol: 'Gettone',
      layerCol: 'Strato',
      hpCol: 'HP',
      acCol: 'AC',
      dmgCol: 'Accidenti',
      presetCol: 'Preimpostato',
    },
  };

  const TRANSLATION$9 = {
    titles: {
      scriptReady: 'スクリプトの準備完了',
      scalingApplied: 'スケーリングが適用されました',
      scalingPresetReady: 'スケーリングプリセット対応',
      hpUpdated: 'HPスケーリングが更新されました',
      acUpdated: 'AC スケーリングが更新されました',
      damageUpdated: 'ダメージスケーリングが更新されました',
      bossPreset: 'ボスプリセット: {preset}',
      partySize: 'パーティーの規模: {size}',
      reinforcementsCreated: '増援が作成されました',
      tokensNumbered: '番号付きトークン',
      layerChanged: 'レイヤーが変更されました',
      tokensHidden: '隠されたトークン',
      tokensRevealed: 'トークンの公開',
      positionsSaved: '保存されたポジション',
      positionsRestored: 'ポジションが回復されました',
      encounterSaved: '保存された出会い',
      encounterLoaded: '出会いが満載',
      encounterDeleted: '削除された出会い',
      savedEncounters: '保存された出会い',
      tokensReset: 'トークンのリセット',
      pageReset: 'ページのリセット',
      allReset: 'すべてのトークンをリセット',
      reportUpdated: 'レポートを更新しました',
      reportCleared: 'レポートがクリアされました',
      journalsRebuilt: 'ジャーナルの再構築',
      deckUpdated: 'コマンドデッキが更新されました',
      configUpdated: '構成が更新されました',
      currentConfig: '現在の構成',
      help: '{name} — ヘルプ',
    },
    errors: {
      unknownCommand: '不明なコマンド:「{sub}」。',
      unknownCommandHint: 'コマンドのリストを表示するには、「!director help」と入力します。',
      noTokensSelected: 'トークンが選択されていません。まずマップ上のトークンを選択します。',
      unknownScaleAction: '不明なスケール アクション: "{action}"。',
      scaleActionHint: '有効なアクション: プリセット、パーティー、HP、AC、ダメージ、適用',
      unknownPartyPreset: '不明なパーティのプリセット:「{preset}」。',
      partyPresetHint: '有効なプリセット: {presets}',
      missingBossPreset: 'ボスのプリセット名がありません。',
      missingBossPresetHint: '有効なプリセット: {presets}',
      unknownBossPreset: '不明なボスのプリセット:「{preset}」。',
      unknownBossPresetHint: '有効なプリセット: {presets}',
      unknownReinforceAction: '不明な強化アクション:「{action}」。',
      reinforceActionHint: '有効なアクション: 複製、列挙、表示',
      noReinforcementsToReveal: '最近明らかになった増援はありません。',
      noReinforcementsToRevealHint: '最初に !director を使用して重複を強化します。',
      unknownLayer: '不明なレイヤー:「{layer}」。',
      layerHint: '有効なレイヤー: トークン、gm、マップ',
      unknownPositionAction: '不明な位置アクション:「{action}」。',
      positionActionHint: '有効なアクション: 保存、復元',
      unknownEncounterAction: '不明な遭遇アクション:「{action}」。',
      encounterActionHint: '有効なアクション: 保存、ロード、削除、リスト',
      encounterNameRequired: 'エンカウント名は必須です。',
      encounterNameRequiredHint: '例: !director 遭遇 保存 ゴブリン待ち伏せ',
      encounterNotFound: '「{name}」が見つかりません。',
      encounterNotFoundHint: '保存された遭遇を表示するには、!director 遭遇リストを使用します。',
      unknownResetScope: '不明なリセット スコープ: "{scope}"。',
      resetScopeHint: '有効なスコープ: 選択済み、ページ、すべて',
      unknownReportAction: '不明なレポート アクション:「{action}」。',
      reportActionHint: '有効なアクション: 更新、選択、変更、クリア',
      unknownJournalAction: '不明なジャーナル アクション: "{action}"。',
      journalActionHint: '有効なアクション: リビルド',
      unknownDeckView: '不明なデッキ ビュー: "{view}"。',
      deckViewHint: '有効なビュー: all、scaling、positioning、admin',
      unknownConfigKey: '不明な構成キー:「{key}」。',
      configKeyHint: '有効なキー: hp-bar、ac-bar、言語',
      invalidHpBar: '無効な HP バー:「{value}」。',
      invalidHpBarHint: '有効なオプション: {options}',
      invalidAcBar: '無効な AC バー:「{value}」。',
      invalidAcBarHint: '有効なオプション: {options}',
      invalidLanguage: '無効な言語:「{value}」。',
      invalidLanguageHint: 'サポートされている: {locales}',
      invalidPartySize:
        'パーティのサイズは 1 ～ 30 の数値である必要があります (「{value}」を取得)。',
      invalidHpPercent:
        'HP パーセンテージは 1 ～ 1000 でなければなりません (「{value}」を取得)。例: 150',
      invalidAcModifier: 'AC 修飾子は -10 ～ +10 でなければなりません (「{value}」を取得)。例: +2',
      invalidDamagePercent:
        'ダメージの割合は 1 ～ 1000 でなければなりません (「{value}」を取得)。例: 125',
      invalidDuplicateCount: '重複数は 1 ～ 50 である必要があります (「{value}」を取得)。例: 3',
      invalidEncounterName:
        '無効なエンカウント名:「{name}」。名前には文字、数字、スペース、ハイフン、アンダースコアを含めることができます (最大 64 文字)。',
      invalidEncounterNameHint: '例: !director 遭遇 保存 ゴブリン待ち伏せ',
      duplicateBurstLimit:
        'この操作により、{limit} の制限を超える {requested} トークンが作成されます。選択するトークンの数を減らすか、より小さい数を使用します。',
      unexpectedError: '予期しないエラーが発生しました: {message}',
      unexpectedErrorHint: '詳細については API コンソールを確認してください。',
    },
    confirm: {
      scalingPresetPending: 'トークンを選択し、「スケーリングの適用」をクリックします。',
      journalsRebuilt: 'コマンドデッキとステータスジャーナルが再生成されました。',
      deckUpdated: 'コマンド デッキは {view} ビューを使用して再生成されました。',
      reportCleared: 'レポートはクリアされました。',
      scriptReadyHint:
        'コントロール パネルの Combat Encounter Director - Command Deck ジャーナルを開きます。',
      langSet: '言語は {locale} に設定されました。',
    },
    labels: {
      preset: 'プリセット',
      nearestPreset: '最も近いプリセット',
      hp: 'HP',
      ac: '交流',
      acModifier: 'ACモディファイアー',
      damage: 'ダメージ',
      appliedTo: '適用対象',
      copiesPerToken: 'トークンあたりのコピー数',
      totalCreated: '作成された合計',
      renamed: '名前変更',
      layer: '層',
      moved: '移転しました',
      hidden: '隠れた',
      revealed: '明らかにした',
      saved: '保存されました',
      restored: '復元されました',
      noSavedPosition: '位置が保存されていません',
      tokensCaptured: 'キャプチャされたトークン',
      loaded: 'ロード済み',
      missingTokens: '不足しているトークン',
      reset: 'リセット',
      notTracked: '追跡されていません',
      tokensInReport: 'レポート内のトークン',
      selectedTokensInReport: 'レポートで選択されたトークン',
      changedTokensInReport: 'レポート内の変更されたトークン',
      hpBar: 'HPバー',
      acBar: 'ACバー',
      language: '言語',
      noEncountersSaved: 'まだ保存された出会いはありません。',
      name: '名前',
      deleted: '削除されました',
      duplicateFailed: '重複しない',
      duplicateFailedHint:
        '画像が Roll20 ライブラリにありません — ライブラリに追加するか、トークン イメージを手動で設定してください。',
    },
    ui: {
      applyScalingButton: '選択したものにスケーリングを適用する',
      partyScaling: 'パーティーのスケーリング',
      customScaling: 'カスタムスケーリング',
      bossTools: 'ボスツール',
      bossPresetHint: '選択したトークンにプリセットを適用します',
      reinforcements: '補強材',
      duplicateSelected: '重複して選択されました:',
      customDuplicate: 'カスタム…',
      autoNumber: '自動番号が選択されました',
      layerVisibility: 'レイヤーと可視性',
      moveToLayer: 'レイヤーに移動:',
      tokenLayer: 'トークンレイヤー',
      gmLayer: 'GMレイヤー',
      mapLayer: 'マップレイヤー',
      hideSelected: '選択したものを非表示にする',
      revealSelected: '選択したものを表示',
      revealReinforcements: 'トークンレイヤーで公開',
      positionSaving: 'ポジションの保存',
      savePositions: '位置を保存する',
      restorePositions: '位置を復元する',
      encounterTemplates: 'エンカウンターテンプレート',
      saveEncounter: '出会いを保存…',
      loadEncounter: '出会いをロード…',
      deleteEncounter: '出会いを削除…',
      listEncounters: '出会いをリストアップする',
      resetRecovery: 'リセットとリカバリ',
      resetSelected: '選択をリセット',
      resetPage: 'ページをリセット',
      resetAll: 'すべてリセット',
      reporting: '報告',
      refreshReport: 'レポートを更新する',
      selectedReport: '選択済み',
      changedReport: '変更されました',
      clearReport: 'クリア',
      help: 'ヘルプ',
      rebuildJournals: 'ジャーナルを再構築する',
      commandDeck: 'コマンドデッキ',
      deckViewAll: '全て',
      deckViewScaling: 'スケーリング',
      deckViewPositioning: '位置決め',
      deckViewAdmin: '管理者',
      deckViewLabel: 'ビュー：',
      partySizeLabel: 'パーティーの規模:',
      hpPercentLabel: 'HP %:',
      acModLabel: 'AC モディファイア:',
      damagePercentLabel: 'ダメージ ％：',
      load: '負荷',
      delete: '消去',
      quickActions: 'クイックアクション',
      config: '構成',
      quickActionsDesc:
        '最もよく使用されるパーティー スケーリング プリセットとボス タイプに素早くアクセスできます。',
      partyScalingDesc:
        '選択したトークンにスケーリングをただちに適用します。何も選択しない場合、Apply Scaling の値が段階的に設定されます。',
      customScalingDesc:
        '選択したトークンに即座に適用されます。最初に個々の値をステージングし、トークンが選択されていない場合はスケーリングの適用を使用します。',
      bossToolsDesc:
        '選択したトークンにロールのプリセットを適用します。ミニオンはステータスを低下させ、ボスとレジェンドはステータスを向上させます。',
      reinforcementsDesc:
        '選択したトークンをマップ上で複製し、繰り返されるトークン名に自動番号を付けます。',
      layerVisibilityDesc:
        '選択したトークンをレイヤー間で移動したり、プレイヤーに対するトークンの表示を切り替えたりします。',
      positionSavingDesc:
        'スナップショット トークンは現在のページに配置され、いつでも復元できます。',
      encounterTemplatesDesc:
        '現在のページの状態を名前付きテンプレートとして保存し、将来のセッションで復元します。',
      resetRecoveryDesc: '追跡されたトークンを元の統計に復元し、追跡記録を削除します。',
      reportingDesc:
        '追跡されたトークンと適用された変更の概要でステータス ジャーナルを更新します。',
      configDesc:
        'どのトークン バーが HP と AC を追跡するかを設定し、インターフェース言語を選択します。',
      helpDesc:
        '完全なコマンド リファレンスを表示するか、コマンド デッキとステータス ジャーナルを再構築します。',
      setHpBar1: 'HPバー1を設定する',
      setHpBar2: 'HPバー2を設定する',
      setAcBar2: 'ACバー2の設定',
      disableAc: 'ACを無効にする',
    },
    report: {
      summary: 'まとめ',
      generated: '生成された',
      tokensOnPage: 'ページ上のトークン',
      trackedTokens: '追跡されたトークン',
      changed: '変更されました',
      hiddenGm: '非表示 (GM レイヤー)',
      bossesLegendary: 'ボス / レジェンダリー',
      minions: 'ミニオンズ',
      noTrackedTokens: '追跡されたトークンはありません。',
      tokenCol: 'トークン',
      layerCol: '層',
      hpCol: 'HP',
      acCol: '交流',
      dmgCol: 'ダメージ',
      presetCol: 'プリセット',
    },
  };

  const TRANSLATION$8 = {
    titles: {
      scriptReady: '스크립트 준비',
      scalingApplied: '스케일링 적용',
      scalingPresetReady: '스케일링 프리셋 준비',
      hpUpdated: 'HP 스케일링 업데이트됨',
      acUpdated: 'AC 스케일링 업데이트됨',
      damageUpdated: '피해 규모가 업데이트되었습니다.',
      bossPreset: '보스 사전 설정: {preset}',
      partySize: '파티 규모: {size}',
      reinforcementsCreated: '지원군 생성됨',
      tokensNumbered: '토큰 번호',
      layerChanged: '레이어가 변경됨',
      tokensHidden: '숨겨진 토큰',
      tokensRevealed: '공개된 토큰',
      positionsSaved: '저장된 위치',
      positionsRestored: '복원된 위치',
      encounterSaved: '만남이 저장되었습니다',
      encounterLoaded: '만남이 로드되었습니다.',
      encounterDeleted: '삭제된 만남',
      savedEncounters: '저장된 만남',
      tokensReset: '토큰 재설정',
      pageReset: '페이지 재설정',
      allReset: '모든 토큰 재설정',
      reportUpdated: '보고서가 업데이트되었습니다.',
      reportCleared: '보고서가 삭제됨',
      journalsRebuilt: '저널 재구축',
      deckUpdated: '커맨드 덱이 업데이트되었습니다.',
      configUpdated: '구성이 업데이트되었습니다.',
      currentConfig: '현재 구성',
      help: '{name} — 도움말',
    },
    errors: {
      unknownCommand: '알 수 없는 명령: "{sub}".',
      unknownCommandHint: '명령 목록을 보려면 !director help를 입력하세요.',
      noTokensSelected: '선택된 토큰이 없습니다. 먼저 지도에서 토큰을 선택하세요.',
      unknownScaleAction: '알 수 없는 크기 조정 작업: "{action}".',
      scaleActionHint: '유효한 작업: 사전 설정, 파티, hp, ac, 손상, 적용',
      unknownPartyPreset: '알 수 없는 파티 사전 설정: "{preset}".',
      partyPresetHint: '유효한 사전 설정: {presets}',
      missingBossPreset: '보스 사전 설정 이름이 없습니다.',
      missingBossPresetHint: '유효한 사전 설정: {presets}',
      unknownBossPreset: '알 수 없는 보스 사전 설정: "{preset}".',
      unknownBossPresetHint: '유효한 사전 설정: {presets}',
      unknownReinforceAction: '알 수 없는 강화 작업: "{action}".',
      reinforceActionHint: '유효한 작업: 복제, 열거, 표시',
      noReinforcementsToReveal: '최근 공개할 지원군이 없습니다.',
      noReinforcementsToRevealHint: '!director를 사용하여 중복을 먼저 강화하세요.',
      unknownLayer: '알 수 없는 레이어: "{layer}".',
      layerHint: '유효한 레이어: 토큰, GM, 지도',
      unknownPositionAction: '알 수 없는 위치 작업: "{action}".',
      positionActionHint: '유효한 작업: 저장, 복원',
      unknownEncounterAction: '알 수 없는 만남 작업: "{action}".',
      encounterActionHint: '유효한 작업: 저장, 로드, 삭제, 나열',
      encounterNameRequired: '만남 이름이 필요합니다.',
      encounterNameRequiredHint: '예: !director 조우 save goblin-ambush',
      encounterNotFound: '"{name}"을(를) 찾을 수 없습니다.',
      encounterNotFoundHint: '저장된 만남을 보려면 !director 만남 목록을 사용하세요.',
      unknownResetScope: '알 수 없는 재설정 범위: "{scope}".',
      resetScopeHint: '유효한 범위: 선택됨, 페이지, 모두',
      unknownReportAction: '알 수 없는 신고 작업: "{action}".',
      reportActionHint: '유효한 작업: 새로 고침, 선택, 변경, 지우기',
      unknownJournalAction: '알 수 없는 저널 작업: "{action}".',
      journalActionHint: '유효한 조치: 재구축',
      unknownDeckView: '알 수 없는 데크 보기: "{view}".',
      deckViewHint: '유효한 보기: 모두, 크기 조정, 위치 지정, 관리',
      unknownConfigKey: '알 수 없는 구성 키: "{key}".',
      configKeyHint: '유효한 키: hp-bar, ac-bar, 언어',
      invalidHpBar: '잘못된 HP 바: "{value}".',
      invalidHpBarHint: '유효한 옵션: {options}',
      invalidAcBar: '잘못된 AC 바: "{value}".',
      invalidAcBarHint: '유효한 옵션: {options}',
      invalidLanguage: '잘못된 언어: "{value}".',
      invalidLanguageHint: '지원됨: {locales}',
      invalidPartySize: '파티 규모는 1에서 30 사이의 숫자여야 합니다("{value}" 있음).',
      invalidHpPercent: 'HP 비율은 1에서 1000 사이여야 합니다("{value}" 있음). 예: 150',
      invalidAcModifier: 'AC 수정자는 -10에서 +10 사이여야 합니다("{value}" 있음). 예: +2',
      invalidDamagePercent: '피해 비율은 1에서 1000 사이여야 합니다("{value}" 있음). 예: 125',
      invalidDuplicateCount: '중복 개수는 1에서 50 사이여야 합니다("{value}" 있음). 예: 3',
      invalidEncounterName:
        '잘못된 만남 이름: "{name}". 이름에는 문자, 숫자, 공백, 하이픈, 밑줄(최대 64자)이 포함될 수 있습니다.',
      invalidEncounterNameHint: '예: !director 조우 save goblin-ambush',
      duplicateBurstLimit:
        '작업으로 인해 {requested} 토큰이 생성되어 {limit} 한도를 초과합니다. 더 적은 수의 토큰을 선택하거나 더 적은 수를 사용하십시오.',
      unexpectedError: '예상치 못한 오류가 발생했습니다: {message}',
      unexpectedErrorHint: '자세한 내용은 API 콘솔을 확인하세요.',
    },
    confirm: {
      scalingPresetPending: '토큰을 선택한 후 Apply Scaling을 클릭합니다.',
      journalsRebuilt: '커맨드 덱과 상태 일지가 재생성되었습니다.',
      deckUpdated: 'Command Deck은 {view} 뷰를 사용하여 재생성되었습니다.',
      reportCleared: '보고서가 삭제되었습니다.',
      scriptReadyHint: '제어판의 Combat Encounter Director - Command Deck 저널을 엽니다.',
      langSet: '언어가 {locale}로 설정되었습니다.',
    },
    labels: {
      preset: '프리셋',
      nearestPreset: '가장 가까운 사전 설정',
      hp: 'HP',
      ac: '교류',
      acModifier: 'AC 수정자',
      damage: '손상',
      appliedTo: '적용대상',
      copiesPerToken: '토큰당 복사본',
      totalCreated: '생성된 총계',
      renamed: '이름이 변경됨',
      layer: '층',
      moved: '움직이는',
      hidden: '숨겨진',
      revealed: '노출된',
      saved: '저장됨',
      restored: '복원됨',
      noSavedPosition: '저장된 위치 없음',
      tokensCaptured: '캡처된 토큰',
      loaded: '짐을 실은',
      missingTokens: '누락된 토큰',
      reset: '다시 놓기',
      notTracked: '추적되지 않음',
      tokensInReport: '보고서의 토큰',
      selectedTokensInReport: '보고서에서 선택된 토큰',
      changedTokensInReport: '보고서의 변경된 토큰',
      hpBar: 'HP바',
      acBar: 'AC 바',
      language: '언어',
      noEncountersSaved: '아직 저장된 만남이 없습니다.',
      name: '이름',
      deleted: '삭제됨',
      duplicateFailed: '중복되지 않음',
      duplicateFailedHint:
        'Roll20 라이브러리에 없는 이미지 - 라이브러리에 추가하거나 토큰 이미지를 수동으로 설정하세요.',
    },
    ui: {
      applyScalingButton: '선택 항목에 크기 조정 적용',
      partyScaling: '파티 규모 조정',
      customScaling: '맞춤형 스케일링',
      bossTools: '보스 도구',
      bossPresetHint: '선택한 토큰에 사전 설정 적용',
      reinforcements: '지원군',
      duplicateSelected: '중복 선택됨:',
      customDuplicate: '관습…',
      autoNumber: '자동번호 선택됨',
      layerVisibility: '레이어 및 가시성',
      moveToLayer: '레이어로 이동:',
      tokenLayer: '토큰 레이어',
      gmLayer: 'GM 레이어',
      mapLayer: '지도 레이어',
      hideSelected: '선택 항목 숨기기',
      revealSelected: '선택 항목 공개',
      revealReinforcements: '토큰 레이어 공개',
      positionSaving: '위치 저장',
      savePositions: '위치 저장',
      restorePositions: '위치 복원',
      encounterTemplates: '만남 템플릿',
      saveEncounter: '만남 저장…',
      loadEncounter: '만남 로드…',
      deleteEncounter: '만남 삭제…',
      listEncounters: '만남 나열',
      resetRecovery: '재설정 및 복구',
      resetSelected: '선택 재설정',
      resetPage: '페이지 재설정',
      resetAll: '모두 재설정',
      reporting: '보고',
      refreshReport: '보고서 새로 고침',
      selectedReport: '선택된',
      changedReport: '변경됨',
      clearReport: '분명한',
      help: '돕다',
      rebuildJournals: '저널 재구성',
      commandDeck: '커맨드 덱',
      deckViewAll: '모두',
      deckViewScaling: '스케일링',
      deckViewPositioning: '포지셔닝',
      deckViewAdmin: '관리자',
      deckViewLabel: '보다:',
      partySizeLabel: '파티 규모:',
      hpPercentLabel: 'HP %:',
      acModLabel: 'AC 수정자:',
      damagePercentLabel: '손상 %:',
      load: '짐',
      delete: '삭제',
      quickActions: '빠른 작업',
      config: '구성',
      quickActionsDesc:
        '가장 많이 사용되는 파티 스케일링 사전 설정 및 보스 유형에 빠르게 액세스하세요.',
      partyScalingDesc:
        '선택한 토큰에 즉시 크기 조정을 적용합니다. 선택하지 않으면 배율 적용 값을 준비합니다.',
      customScalingDesc:
        '선택한 토큰에 즉시 적용됩니다. 먼저 개별 값을 준비한 다음 선택한 토큰이 없으면 크기 조정 적용을 사용하세요.',
      bossToolsDesc:
        '선택한 토큰에 역할 사전 설정을 적용합니다. 미니언은 능력치를 줄이고 보스와 전설은 능력치를 높입니다.',
      reinforcementsDesc:
        '지도에서 선택한 토큰을 복제하고 반복되는 토큰 이름에 자동 번호를 매깁니다.',
      layerVisibilityDesc: '선택된 토큰을 레이어 간에 이동하거나 플레이어의 가시성을 전환합니다.',
      positionSavingDesc: '현재 페이지의 스냅샷 토큰 위치를 확인하고 언제든지 복원하세요.',
      encounterTemplatesDesc:
        '현재 페이지 상태를 명명된 템플릿으로 저장하고 향후 세션에서 복원합니다.',
      resetRecoveryDesc: '추적된 토큰을 원래 상태로 복원하고 추적 기록을 제거합니다.',
      reportingDesc: '추적된 토큰 및 적용된 변경 사항의 요약으로 상태 저널을 새로 고칩니다.',
      configDesc: 'HP와 AC를 추적하는 토큰 바를 설정하고 인터페이스 언어를 선택합니다.',
      helpDesc: '전체 명령 참조를 보거나 Command Deck 및 상태 저널을 재구성하십시오.',
      setHpBar1: 'HP 바 1 설정',
      setHpBar2: 'HP 바 2 설정',
      setAcBar2: 'AC 바 2 설정',
      disableAc: 'AC 비활성화',
    },
    report: {
      summary: '요약',
      generated: '생성됨',
      tokensOnPage: '페이지의 토큰',
      trackedTokens: '추적된 토큰',
      changed: '변경됨',
      hiddenGm: '숨김(GM 레이어)',
      bossesLegendary: '보스 / 전설',
      minions: '미니언즈',
      noTrackedTokens: '추적된 토큰이 없습니다.',
      tokenCol: '토큰',
      layerCol: '층',
      hpCol: 'HP',
      acCol: '교류',
      dmgCol: '데미지',
      presetCol: '프리셋',
    },
  };

  const TRANSLATION$7 = {
    titles: {
      scriptReady: 'Skrypt gotowy',
      scalingApplied: 'Zastosowano skalowanie',
      scalingPresetReady: 'Gotowe ustawienie wstępne skalowania',
      hpUpdated: 'Zaktualizowano skalowanie HP',
      acUpdated: 'Zaktualizowano skalowanie AC',
      damageUpdated: 'Zaktualizowano skalowanie obrażeń',
      bossPreset: 'Ustawienie szefa: {preset}',
      partySize: 'Rozmiar imprezy: {size}',
      reinforcementsCreated: 'Utworzono posiłki',
      tokensNumbered: 'Żetony numerowane',
      layerChanged: 'Warstwa zmieniona',
      tokensHidden: 'Tokeny ukryte',
      tokensRevealed: 'Tokeny ujawnione',
      positionsSaved: 'Pozycje zapisane',
      positionsRestored: 'Pozycje przywrócone',
      encounterSaved: 'Spotkanie zapisane',
      encounterLoaded: 'Spotkanie załadowane',
      encounterDeleted: 'Spotkanie usunięte',
      savedEncounters: 'Zapisane spotkania',
      tokensReset: 'Reset tokenów',
      pageReset: 'Resetuj stronę',
      allReset: 'Wszystkie tokeny zresetowane',
      reportUpdated: 'Raport zaktualizowany',
      reportCleared: 'Raport usunięty',
      journalsRebuilt: 'Odbudowane czasopisma',
      deckUpdated: 'Zaktualizowano talię dowodzenia',
      configUpdated: 'Konfiguracja zaktualizowana',
      currentConfig: 'Bieżąca konfiguracja',
      help: '{name} — Pomoc',
    },
    errors: {
      unknownCommand: 'Nieznane polecenie: „{sub}”.',
      unknownCommandHint: 'Wpisz !director help, aby wyświetlić listę poleceń.',
      noTokensSelected: 'Nie wybrano tokenów. Najpierw wybierz żetony na mapie.',
      unknownScaleAction: 'Nieznana akcja skali: „{action}”.',
      scaleActionHint:
        'Prawidłowe akcje: ustawienie wstępne, impreza, hp, ac, obrażenia, zastosowanie',
      unknownPartyPreset: 'Nieznane ustawienie grupy: „{preset}”.',
      partyPresetHint: 'Prawidłowe ustawienia wstępne: {presets}',
      missingBossPreset: 'Brakuje wstępnie ustawionej nazwy szefa.',
      missingBossPresetHint: 'Prawidłowe ustawienia wstępne: {presets}',
      unknownBossPreset: 'Nieznane ustawienie szefa: „{preset}”.',
      unknownBossPresetHint: 'Prawidłowe ustawienia wstępne: {presets}',
      unknownReinforceAction: 'Nieznane działanie wzmacniające: „{action}”.',
      reinforceActionHint: 'Prawidłowe akcje: duplikuj, wylicz, pokaż',
      noReinforcementsToReveal: 'Brak niedawnych wzmocnień do ujawnienia.',
      noReinforcementsToRevealHint: 'Najpierw użyj !director wzmocnij duplikat.',
      unknownLayer: 'Nieznana warstwa: „{layer}”.',
      layerHint: 'Prawidłowe warstwy: token, gm, map',
      unknownPositionAction: 'Nieznana akcja dotycząca pozycji: „{action}”.',
      positionActionHint: 'Prawidłowe działania: zapisz, przywróć',
      unknownEncounterAction: 'Nieznana akcja spotkania: „{action}”.',
      encounterActionHint: 'Prawidłowe działania: zapisz, załaduj, usuń, wylistuj',
      encounterNameRequired: 'Wymagana nazwa spotkania.',
      encounterNameRequiredHint: 'Przykład: !reżyser spotkanie zapisz zasadzkę na goblina',
      encounterNotFound: 'Nie znaleziono spotkania „{name}”.',
      encounterNotFoundHint: 'Użyj listy spotkań !director, aby zobaczyć zapisane spotkania.',
      unknownResetScope: 'Nieznany zakres resetowania: „{scope}”.',
      resetScopeHint: 'Prawidłowe zakresy: wybrane, strona, wszystkie',
      unknownReportAction: 'Nieznana akcja raportu: „{action}”.',
      reportActionHint: 'Prawidłowe akcje: odśwież, zaznacz, zmień, wyczyść',
      unknownJournalAction: 'Nieznana akcja dziennika: „{action}”.',
      journalActionHint: 'Prawidłowe działania: odbudowa',
      unknownDeckView: 'Nieznany widok talii: „{view}”.',
      deckViewHint: 'Prawidłowe widoki: wszystkie, skalowanie, pozycjonowanie, admin',
      unknownConfigKey: 'Nieznany klucz konfiguracyjny: „{key}”.',
      configKeyHint: 'Prawidłowe klawisze: hp-bar, ac-bar, język',
      invalidHpBar: 'Nieprawidłowy pasek HP: „{value}”.',
      invalidHpBarHint: 'Prawidłowe opcje: {options}',
      invalidAcBar: 'Nieprawidłowy pasek AC: „{value}”.',
      invalidAcBarHint: 'Prawidłowe opcje: {options}',
      invalidLanguage: 'Nieprawidłowy język: „{value}”.',
      invalidLanguageHint: 'Obsługiwane: {locales}',
      invalidPartySize: 'Rozmiar grupy musi być liczbą z zakresu od 1 do 30 (otrzymano „{value}”).',
      invalidHpPercent:
        'Procent HP musi mieścić się w przedziale od 1 do 1000 (otrzymano „{value}”). Przykład: 150',
      invalidAcModifier:
        'Modyfikator AC musi mieścić się w przedziale od -10 do +10 (otrzymano „{value}”). Przykład: +2',
      invalidDamagePercent:
        'Procent obrażeń musi mieścić się w przedziale od 1 do 1000 (otrzymano „{value}”). Przykład: 125',
      invalidDuplicateCount:
        'Liczba duplikatów musi mieścić się w przedziale od 1 do 50 (otrzymano „{value}”). Przykład: 3',
      invalidEncounterName:
        'Nieprawidłowa nazwa spotkania: „{name}”. Nazwy mogą zawierać litery, cyfry, spacje, łączniki i podkreślenia (maks. 64 znaki).',
      invalidEncounterNameHint: 'Przykład: !reżyser spotkanie zapisz zasadzkę na goblina',
      duplicateBurstLimit:
        'Operacja spowodowałaby utworzenie {requested} tokenów, przekraczających limit {limit}. Wybierz mniej tokenów lub użyj mniejszej liczby.',
      unexpectedError: 'Wystąpił nieoczekiwany błąd: {message}',
      unexpectedErrorHint: 'Aby uzyskać szczegółowe informacje, sprawdź konsolę API.',
    },
    confirm: {
      scalingPresetPending: 'Wybierz tokeny, a następnie kliknij Zastosuj skalowanie.',
      journalsRebuilt: 'Zregenerowano pokład dowodzenia i dziennik stanu.',
      deckUpdated: 'Talia dowodzenia została zregenerowana przy użyciu widoku {view}.',
      reportCleared: 'Raport został usunięty.',
      scriptReadyHint:
        'Otwórz dziennik Combat Encounter Director – Command Deck w panelu sterowania.',
      langSet: 'Język ustawiony na {locale}.',
    },
    labels: {
      preset: 'Wstępnie ustawione',
      nearestPreset: 'Najbliższe ustawienie wstępne',
      hp: 'HP',
      ac: 'AC',
      acModifier: 'Modyfikator AC',
      damage: 'Szkoda',
      appliedTo: 'Zastosowano do',
      copiesPerToken: 'Kopie na token',
      totalCreated: 'Razem utworzono',
      renamed: 'Zmieniono nazwę',
      layer: 'Warstwa',
      moved: 'Wzruszony',
      hidden: 'Ukryty',
      revealed: 'Ujawnił',
      saved: 'Zapisano',
      restored: 'Przywrócony',
      noSavedPosition: 'Brak zapisanej pozycji',
      tokensCaptured: 'Tokeny zdobyte',
      loaded: 'Załadowany',
      missingTokens: 'Brakujące tokeny',
      reset: 'Nastawić',
      notTracked: 'Nie śledzone',
      tokensInReport: 'Tokeny w raporcie',
      selectedTokensInReport: 'Wybrane tokeny w raporcie',
      changedTokensInReport: 'Zmieniono tokeny w raporcie',
      hpBar: 'Pasek HP',
      acBar: 'Pasek AC',
      language: 'Język',
      noEncountersSaved: 'Nie zapisano jeszcze żadnych spotkań.',
      name: 'Nazwa',
      deleted: 'Usunięto',
      duplicateFailed: 'Nie zduplikowany',
      duplicateFailedHint:
        'Obrazu nie ma w Bibliotece Roll20 — dodaj do swojej biblioteki lub ustaw ręcznie obraz tokena.',
    },
    ui: {
      applyScalingButton: 'Zastosuj skalowanie do wybranych',
      partyScaling: 'Skalowanie imprezy',
      customScaling: 'Skalowanie niestandardowe',
      bossTools: 'Narzędzia szefa',
      bossPresetHint: 'Zastosuj ustawienie wstępne do wybranych tokenów',
      reinforcements: 'Wzmocnienia',
      duplicateSelected: 'Wybrano duplikat:',
      customDuplicate: 'Zwyczaj…',
      autoNumber: 'Wybrano automatyczne numerowanie',
      layerVisibility: 'Warstwa i widoczność',
      moveToLayer: 'Przejdź do warstwy:',
      tokenLayer: 'Warstwa tokenów',
      gmLayer: 'Warstwa GM',
      mapLayer: 'Warstwa mapy',
      hideSelected: 'Ukryj wybrane',
      revealSelected: 'Pokaż wybrane',
      revealReinforcements: 'Ujawnij na warstwie żetonów',
      positionSaving: 'Zapisywanie pozycji',
      savePositions: 'Zapisz pozycje',
      restorePositions: 'Przywróć pozycje',
      encounterTemplates: 'Szablony spotkań',
      saveEncounter: 'Zapisz spotkanie…',
      loadEncounter: 'Załaduj spotkanie…',
      deleteEncounter: 'Usuń spotkanie…',
      listEncounters: 'Lista spotkań',
      resetRecovery: 'Resetuj i odzyskiwanie',
      resetSelected: 'Zresetuj wybrane',
      resetPage: 'Zresetuj stronę',
      resetAll: 'Zresetuj wszystko',
      reporting: 'Raportowanie',
      refreshReport: 'Odśwież raport',
      selectedReport: 'Wybrany',
      changedReport: 'Zmieniono',
      clearReport: 'Jasne',
      help: 'Pomoc',
      rebuildJournals: 'Odbuduj dzienniki',
      commandDeck: 'Pokład dowodzenia',
      deckViewAll: 'Wszystko',
      deckViewScaling: 'Ułuskowienie',
      deckViewPositioning: 'Pozycjonowanie',
      deckViewAdmin: 'Administrator',
      deckViewLabel: 'Pogląd:',
      partySizeLabel: 'Rozmiar imprezy:',
      hpPercentLabel: '% HP:',
      acModLabel: 'Modyfikator AC:',
      damagePercentLabel: 'Szkoda %:',
      load: 'Obciążenie',
      delete: 'Usuwać',
      quickActions: 'Szybkie działania',
      config: 'Konfig',
      quickActionsDesc:
        'Szybki dostęp do najczęściej używanych ustawień skalowania drużyny i typów bossów.',
      partyScalingDesc:
        'Natychmiast stosuje skalowanie do wybranych tokenów. W przypadku braku wyboru ustawia wartości dla opcji Zastosuj skalowanie.',
      customScalingDesc:
        'Dotyczy natychmiast wybranych tokenów. Najpierw przygotuj poszczególne wartości, a następnie użyj opcji Zastosuj skalowanie, jeśli nie wybrano żadnych tokenów.',
      bossToolsDesc:
        'Zastosuj gotowe ustawienia ról do wybranych tokenów — Stwory zmniejszają statystyki, Boss i Legendarny je wzmacniają.',
      reinforcementsDesc:
        'Duplikuj wybrane tokeny na mapie i automatycznie numeruj powtarzające się nazwy tokenów.',
      layerVisibilityDesc:
        'Przenoś wybrane żetony pomiędzy warstwami lub przełączaj ich widoczność dla graczy.',
      positionSavingDesc:
        'Zrób zdjęcie pozycji tokenów na bieżącej stronie i przywróć je w dowolnym momencie.',
      encounterTemplatesDesc:
        'Zapisz bieżący stan strony jako nazwany szablon i przywróć go w przyszłych sesjach.',
      resetRecoveryDesc:
        'Przywróć śledzone tokeny do ich oryginalnych statystyk i usuń ich zapisy śledzenia.',
      reportingDesc:
        'Odśwież dziennik stanu z podsumowaniem prześledzonych tokenów i zastosowanych zmian.',
      configDesc: 'Ustaw, które paski tokenów śledzą HP i AC, i wybierz język interfejsu.',
      helpDesc:
        'Wyświetl pełne informacje o poleceniach lub przebuduj pokład poleceń i dzienniki stanu.',
      setHpBar1: 'Ustaw pasek HP 1',
      setHpBar2: 'Ustaw pasek HP 2',
      setAcBar2: 'Ustaw pasek AC 2',
      disableAc: 'Wyłącz klimatyzację',
    },
    report: {
      summary: 'Streszczenie',
      generated: 'Wygenerowano',
      tokensOnPage: 'Tokeny na stronie',
      trackedTokens: 'Śledzone tokeny',
      changed: 'Zmieniono',
      hiddenGm: 'Ukryty (warstwa GM)',
      bossesLegendary: 'Bossowie / Legendarni',
      minions: 'Minionki',
      noTrackedTokens: 'Brak śledzonych tokenów.',
      tokenCol: 'Znak',
      layerCol: 'Warstwa',
      hpCol: 'HP',
      acCol: 'AC',
      dmgCol: 'DMG',
      presetCol: 'Wstępnie ustawione',
    },
  };

  const TRANSLATION$6 = {
    titles: {
      scriptReady: 'Script pronto',
      scalingApplied: 'Dimensionamento aplicado',
      scalingPresetReady: 'Dimensionamento predefinido pronto',
      hpUpdated: 'Dimensionamento HP atualizado',
      acUpdated: 'Escala AC atualizada',
      damageUpdated: 'Escala de dano atualizada',
      bossPreset: 'Predefinição do chefe: {preset}',
      partySize: 'Tamanho do grupo: {size}',
      reinforcementsCreated: 'Reforços criados',
      tokensNumbered: 'Tokens Numerados',
      layerChanged: 'Camada alterada',
      tokensHidden: 'Tokens ocultos',
      tokensRevealed: 'Tokens revelados',
      positionsSaved: 'Posições guardadas',
      positionsRestored: 'Posições restauradas',
      encounterSaved: 'Encontro salvo',
      encounterLoaded: 'Encontro carregado',
      encounterDeleted: 'Encontro excluído',
      savedEncounters: 'Encontros salvos',
      tokensReset: 'Redefinição de tokens',
      pageReset: 'Redefinição de página',
      allReset: 'Todos os tokens redefinidos',
      reportUpdated: 'Relatório atualizado',
      reportCleared: 'Relatório apagado',
      journalsRebuilt: 'Diários reconstruídos',
      deckUpdated: 'Plataforma de comando atualizada',
      configUpdated: 'Configuração atualizada',
      currentConfig: 'Configuração atual',
      help: '{name} — Ajuda',
    },
    errors: {
      unknownCommand: 'Comando desconhecido: "{sub}".',
      unknownCommandHint: 'Digite !director help para obter uma lista de comandos.',
      noTokensSelected: 'Nenhum token selecionado. Selecione primeiro os tokens no mapa.',
      unknownScaleAction: 'Ação de escala desconhecida: "{action}".',
      scaleActionHint: 'Ações válidas: predefinição, grupo, hp, ac, dano, aplicar',
      unknownPartyPreset: 'Predefinição de grupo desconhecido: "{preset}".',
      partyPresetHint: 'Predefinições válidas: {presets}',
      missingBossPreset: 'Nome predefinido do chefe ausente.',
      missingBossPresetHint: 'Predefinições válidas: {presets}',
      unknownBossPreset: 'Predefinição de chefe desconhecida: "{preset}".',
      unknownBossPresetHint: 'Predefinições válidas: {presets}',
      unknownReinforceAction: 'Ação de reforço desconhecida: "{action}".',
      reinforceActionHint: 'Ações válidas: duplicar, enumerar, mostrar',
      noReinforcementsToReveal: 'Sem reforço recente para revelar.',
      noReinforcementsToRevealHint: 'Utilize !director para reforçar primeiro o duplicado.',
      unknownLayer: 'Camada desconhecida: "{layer}".',
      layerHint: 'Camadas válidas: token, gm, mapa',
      unknownPositionAction: 'Ação de posição desconhecida: "{action}".',
      positionActionHint: 'Ações válidas: guardar, restaurar',
      unknownEncounterAction: 'Ação de encontro desconhecida: "{action}".',
      encounterActionHint: 'Ações válidas: guardar, carregar, eliminar, listar',
      encounterNameRequired: 'Nome do encontro obrigatório.',
      encounterNameRequiredHint: 'Exemplo: !director encontro salvar duende-emboscada',
      encounterNotFound: 'Encontro "{name}" não encontrado.',
      encounterNotFoundHint: 'Utilize !director meet list para ver os encontros guardados.',
      unknownResetScope: 'Âmbito de reposição desconhecido: "{scope}".',
      resetScopeHint: 'Escopos válidos: selecionado, página, todos',
      unknownReportAction: 'Ação de relatório desconhecida: "{action}".',
      reportActionHint: 'Ações válidas: atualizar, selecionar, alterar, limpar',
      unknownJournalAction: 'Ação de diário desconhecida: "{action}".',
      journalActionHint: 'Ações válidas: reconstruir',
      unknownDeckView: 'Visualização de baralho desconhecida: "{view}".',
      deckViewHint: 'Visualizações válidas: todas, escala, posicionamento, administrador',
      unknownConfigKey: 'Chave de configuração desconhecida: "{key}".',
      configKeyHint: 'Chaves válidas: hp-bar, ac-bar, idioma',
      invalidHpBar: 'Barra de HP inválida: "{value}".',
      invalidHpBarHint: 'Opções válidas: {options}',
      invalidAcBar: 'Barra AC inválida: "{value}".',
      invalidAcBarHint: 'Opções válidas: {options}',
      invalidLanguage: 'Idioma inválido: "{value}".',
      invalidLanguageHint: 'Compatível: {locales}',
      invalidPartySize: 'O tamanho do grupo deve ser um número entre 1 e 30 (obteve "{value}").',
      invalidHpPercent:
        'A percentagem de HP deve estar entre 1 e 1000 (obteve "{value}"). Exemplo: 150',
      invalidAcModifier:
        'O modificador AC deve estar entre -10 e +10 (obteve "{value}"). Exemplo: +2',
      invalidDamagePercent:
        'A percentagem de dano deve estar entre 1 e 1000 (obteve "{value}"). Exemplo: 125',
      invalidDuplicateCount:
        'A contagem de duplicados deve estar entre 1 e 50 (obtido "{value}"). Exemplo: 3',
      invalidEncounterName:
        'Nome de encontro inválido: "{name}". Os nomes podem conter letras, dígitos, espaços, hífens e sublinhados (máximo de 64 caracteres).',
      invalidEncounterNameHint: 'Exemplo: !director encontro salvar duende-emboscada',
      duplicateBurstLimit:
        'A operação criaria tokens {requested}, excedendo o limite de {limit}. Selecione menos tokens ou utilize uma contagem mais baixa.',
      unexpectedError: 'Ocorreu um erro inesperado: {message}',
      unexpectedErrorHint: 'Verifique a consola da API para obter detalhes.',
    },
    confirm: {
      scalingPresetPending: 'Selecione tokens e clique em Aplicar dimensionamento.',
      journalsRebuilt: 'O Command Deck e o diário de estado foram regenerados.',
      deckUpdated: 'O Command Deck foi regenerado utilizando a vista {view}.',
      reportCleared: 'Relatório apagado.',
      scriptReadyHint:
        'Abra o diário Combat Encounter Director - Command Deck para o painel de controlo.',
      langSet: 'Idioma definido como {locale}.',
    },
    labels: {
      preset: 'Predefinido',
      nearestPreset: 'Predefinição mais próxima',
      hp: 'HP',
      ac: 'AC',
      acModifier: 'Modificador AC',
      damage: 'Dano',
      appliedTo: 'Aplicado a',
      copiesPerToken: 'Cópias por token',
      totalCreated: 'Total criado',
      renamed: 'Renomeado',
      layer: 'Camada',
      moved: 'Movido',
      hidden: 'Oculto',
      revealed: 'Revelado',
      saved: 'Salvo',
      restored: 'Restaurado',
      noSavedPosition: 'Nenhuma posição guardada',
      tokensCaptured: 'Tokens capturados',
      loaded: 'Carregado',
      missingTokens: 'Tokens em falta',
      reset: 'Reiniciar',
      notTracked: 'Não rastreado',
      tokensInReport: 'Tokens no relatório',
      selectedTokensInReport: 'Tokens selecionados no relatório',
      changedTokensInReport: 'Tokens alterados no relatório',
      hpBar: 'Barra de HP',
      acBar: 'Barra CA',
      language: 'Idioma',
      noEncountersSaved: 'Nenhum encontro guardado ainda.',
      name: 'Nome',
      deleted: 'Excluído',
      duplicateFailed: 'Não duplicado',
      duplicateFailedHint:
        'Imagem que não está na biblioteca Roll20 – adicione à sua biblioteca ou defina a imagem do token manualmente.',
    },
    ui: {
      applyScalingButton: 'Aplicar escala ao selecionado',
      partyScaling: 'Dimensionamento de festas',
      customScaling: 'Dimensionamento personalizado',
      bossTools: 'Ferramentas Chefe',
      bossPresetHint: 'Aplicar predefinição aos tokens selecionados',
      reinforcements: 'Reforços',
      duplicateSelected: 'Duplicar selecionado:',
      customDuplicate: 'Personalizado…',
      autoNumber: 'Numeração automática selecionada',
      layerVisibility: 'Camada e Visibilidade',
      moveToLayer: 'Mover para a camada:',
      tokenLayer: 'Camada de token',
      gmLayer: 'Camada GM',
      mapLayer: 'Camada do mapa',
      hideSelected: 'Ocultar selecionado',
      revealSelected: 'Revelar selecionado',
      revealReinforcements: 'Revelar na camada de token',
      positionSaving: 'Salvamento de posição',
      savePositions: 'Guardar posições',
      restorePositions: 'Restaurar posições',
      encounterTemplates: 'Modelos de Encontro',
      saveEncounter: 'Guardar encontro…',
      loadEncounter: 'Carregar encontro…',
      deleteEncounter: 'Apagar encontro…',
      listEncounters: 'Listar encontros',
      resetRecovery: 'Repor e recuperar',
      resetSelected: 'Repor selecionado',
      resetPage: 'Redefinir página',
      resetAll: 'Redefinir tudo',
      reporting: 'Relatórios',
      refreshReport: 'Atualizar relatório',
      selectedReport: 'Selecionado',
      changedReport: 'Mudado',
      clearReport: 'Claro',
      help: 'Ajuda',
      rebuildJournals: 'Reconstruir diários',
      commandDeck: 'Convés de comando',
      deckViewAll: 'Tudo',
      deckViewScaling: 'Dimensionamento',
      deckViewPositioning: 'Posicionamento',
      deckViewAdmin: 'Administrador',
      deckViewLabel: 'Ver:',
      partySizeLabel: 'Tamanho da festa:',
      hpPercentLabel: '% de HP:',
      acModLabel: 'Modificador AC:',
      damagePercentLabel: 'Dano %:',
      load: 'Carga',
      delete: 'Eliminar',
      quickActions: 'Ações rápidas',
      config: 'Configuração',
      quickActionsDesc:
        'Acesso rápido às predefinições de escala de grupo e aos tipos de bosses mais utilizados.',
      partyScalingDesc:
        'Aplica o dimensionamento imediatamente aos tokens selecionados. Sem seleção, prepara os valores para Aplicar escala.',
      customScalingDesc:
        'Aplica-se imediatamente aos tokens selecionados. Prepare primeiro os valores individuais e, em seguida, utilize Aplicar escalabilidade quando não for selecionado nenhum token.',
      bossToolsDesc:
        'Aplicar predefinições de funções a tokens selecionados – Minion reduz as estatísticas, Boss e Legendary aumentam-nas.',
      reinforcementsDesc:
        'Duplique os tokens selecionados no mapa e numere automaticamente os nomes dos tokens repetidos.',
      layerVisibilityDesc:
        'Mova os tokens selecionados entre camadas ou alterne a sua visibilidade para os jogadores.',
      positionSavingDesc:
        'Capturar posições de tokens na página atual e restaurá-las a qualquer momento.',
      encounterTemplatesDesc:
        'Guarde o estado atual da página como um modelo nomeado e restaure-o em sessões futuras.',
      resetRecoveryDesc:
        'Restaure os tokens rastreados às suas estatísticas originais e remova os seus registos de rastreio.',
      reportingDesc:
        'Atualize o diário de estado com um resumo dos tokens rastreados e das alterações aplicadas.',
      configDesc:
        'Defina quais as barras de tokens que rastreiam o HP e o AC e escolha o idioma da interface.',
      helpDesc:
        'Consulte a referência completa do comando ou reconstrua o Command Deck e os diários de estado.',
      setHpBar1: 'Definir barra de HP 1',
      setHpBar2: 'Definir barra HP 2',
      setAcBar2: 'Definir barra AC 2',
      disableAc: 'Desativar CA',
    },
    report: {
      summary: 'Resumo',
      generated: 'Gerado',
      tokensOnPage: 'Tokens na página',
      trackedTokens: 'Tokens rastreados',
      changed: 'Mudado',
      hiddenGm: 'Oculto (camada GM)',
      bossesLegendary: 'Chefes / Lendários',
      minions: 'Lacaios',
      noTrackedTokens: 'Nenhum token rastreado.',
      tokenCol: 'Símbolo',
      layerCol: 'Camada',
      hpCol: 'HP',
      acCol: 'AC',
      dmgCol: 'Dano',
      presetCol: 'Predefinido',
    },
  };

  const TRANSLATION$5 = {
    titles: {
      scriptReady: 'Script pronto',
      scalingApplied: 'Dimensionamento aplicado',
      scalingPresetReady: 'Dimensionamento predefinido pronto',
      hpUpdated: 'Dimensionamento HP atualizado',
      acUpdated: 'Escala AC atualizada',
      damageUpdated: 'Escala de dano atualizada',
      bossPreset: 'Predefinição de chefe: {preset}',
      partySize: 'Tamanho do grupo: {size}',
      reinforcementsCreated: 'Reforços criados',
      tokensNumbered: 'Tokens Numerados',
      layerChanged: 'Camada alterada',
      tokensHidden: 'Tokens ocultos',
      tokensRevealed: 'Tokens revelados',
      positionsSaved: 'Posições salvas',
      positionsRestored: 'Posições restauradas',
      encounterSaved: 'Encontro salvo',
      encounterLoaded: 'Encontro carregado',
      encounterDeleted: 'Encontro excluído',
      savedEncounters: 'Encontros salvos',
      tokensReset: 'Redefinição de tokens',
      pageReset: 'Redefinição de página',
      allReset: 'Todos os tokens redefinidos',
      reportUpdated: 'Relatório atualizado',
      reportCleared: 'Relatório apagado',
      journalsRebuilt: 'Diários reconstruídos',
      deckUpdated: 'Plataforma de comando atualizada',
      configUpdated: 'Configuração atualizada',
      currentConfig: 'Configuração atual',
      help: '{name} — Ajuda',
    },
    errors: {
      unknownCommand: 'Comando desconhecido: "{sub}".',
      unknownCommandHint: 'Digite !director help para obter uma lista de comandos.',
      noTokensSelected: 'Nenhum token selecionado. Selecione os tokens no mapa primeiro.',
      unknownScaleAction: 'Ação de escala desconhecida: "{action}".',
      scaleActionHint: 'Ações válidas: predefinição, grupo, hp, ac, dano, aplicar',
      unknownPartyPreset: 'Predefinição de grupo desconhecido: "{preset}".',
      partyPresetHint: 'Predefinições válidas: {presets}',
      missingBossPreset: 'Nome predefinido do chefe ausente.',
      missingBossPresetHint: 'Predefinições válidas: {presets}',
      unknownBossPreset: 'Predefinição de chefe desconhecida: "{preset}".',
      unknownBossPresetHint: 'Predefinições válidas: {presets}',
      unknownReinforceAction: 'Ação de reforço desconhecida: "{action}".',
      reinforceActionHint: 'Ações válidas: duplicar, enumerar, mostrar',
      noReinforcementsToReveal: 'Nenhum reforço recente para revelar.',
      noReinforcementsToRevealHint: 'Use !director para reforçar a duplicata primeiro.',
      unknownLayer: 'Camada desconhecida: "{layer}".',
      layerHint: 'Camadas válidas: token, gm, mapa',
      unknownPositionAction: 'Ação de posição desconhecida: "{action}".',
      positionActionHint: 'Ações válidas: salvar, restaurar',
      unknownEncounterAction: 'Ação de encontro desconhecida: "{action}".',
      encounterActionHint: 'Ações válidas: salvar, carregar, excluir, listar',
      encounterNameRequired: 'Nome do encontro obrigatório.',
      encounterNameRequiredHint: 'Exemplo: !director encontro salvar goblin-emboscada',
      encounterNotFound: 'Encontro "{name}" não encontrado.',
      encounterNotFoundHint: 'Use !director meet list para ver os encontros salvos.',
      unknownResetScope: 'Escopo de redefinição desconhecido: "{scope}".',
      resetScopeHint: 'Escopos válidos: selecionado, página, todos',
      unknownReportAction: 'Ação de relatório desconhecida: "{action}".',
      reportActionHint: 'Ações válidas: atualizar, selecionar, alterar, limpar',
      unknownJournalAction: 'Ação de diário desconhecida: "{action}".',
      journalActionHint: 'Ações válidas: reconstruir',
      unknownDeckView: 'Visualização de deck desconhecida: "{view}".',
      deckViewHint: 'Visualizações válidas: todas, escala, posicionamento, administrador',
      unknownConfigKey: 'Chave de configuração desconhecida: "{key}".',
      configKeyHint: 'Chaves válidas: hp-bar, ac-bar, idioma',
      invalidHpBar: 'Barra de HP inválida: "{value}".',
      invalidHpBarHint: 'Opções válidas: {options}',
      invalidAcBar: 'Barra AC inválida: "{value}".',
      invalidAcBarHint: 'Opções válidas: {options}',
      invalidLanguage: 'Idioma inválido: "{value}".',
      invalidLanguageHint: 'Compatível: {locales}',
      invalidPartySize: 'O tamanho do grupo deve ser um número entre 1 e 30 (obteve "{value}").',
      invalidHpPercent:
        'A porcentagem de HP deve estar entre 1 e 1000 (obteve "{value}"). Exemplo: 150',
      invalidAcModifier:
        'O modificador AC deve estar entre -10 e +10 (obteve "{value}"). Exemplo: +2',
      invalidDamagePercent:
        'A porcentagem de dano deve estar entre 1 e 1000 (obteve "{value}"). Exemplo: 125',
      invalidDuplicateCount:
        'A contagem de duplicatas deve estar entre 1 e 50 (obtido "{value}"). Exemplo: 3',
      invalidEncounterName:
        'Nome de encontro inválido: "{name}". Os nomes podem conter letras, dígitos, espaços, hífens e sublinhados (máximo de 64 caracteres).',
      invalidEncounterNameHint: 'Exemplo: !director encontro salvar goblin-emboscada',
      duplicateBurstLimit:
        'A operação criaria tokens {requested}, excedendo o limite de {limit}. Selecione menos tokens ou use uma contagem menor.',
      unexpectedError: 'Ocorreu um erro inesperado: {message}',
      unexpectedErrorHint: 'Verifique o console da API para obter detalhes.',
    },
    confirm: {
      scalingPresetPending: 'Selecione tokens e clique em Aplicar dimensionamento.',
      journalsRebuilt: 'O Command Deck e o diário de status foram regenerados.',
      deckUpdated: 'O Command Deck foi regenerado usando a visualização {view}.',
      reportCleared: 'Relatório apagado.',
      scriptReadyHint:
        'Abra o diário Combat Encounter Director - Command Deck para o painel de controle.',
      langSet: 'Idioma definido como {locale}.',
    },
    labels: {
      preset: 'Predefinido',
      nearestPreset: 'Predefinição mais próxima',
      hp: 'HP',
      ac: 'AC',
      acModifier: 'Modificador AC',
      damage: 'Dano',
      appliedTo: 'Aplicado a',
      copiesPerToken: 'Cópias por token',
      totalCreated: 'Total criado',
      renamed: 'Renomeado',
      layer: 'Camada',
      moved: 'Movido',
      hidden: 'Escondido',
      revealed: 'Revelado',
      saved: 'Salvo',
      restored: 'Restaurado',
      noSavedPosition: 'Nenhuma posição salva',
      tokensCaptured: 'Tokens capturados',
      loaded: 'Carregado',
      missingTokens: 'Tokens ausentes',
      reset: 'Reiniciar',
      notTracked: 'Não rastreado',
      tokensInReport: 'Tokens no relatório',
      selectedTokensInReport: 'Tokens selecionados no relatório',
      changedTokensInReport: 'Tokens alterados no relatório',
      hpBar: 'Barra de HP',
      acBar: 'Barra CA',
      language: 'Linguagem',
      noEncountersSaved: 'Nenhum encontro salvo ainda.',
      name: 'Nome',
      deleted: 'Excluído',
      duplicateFailed: 'Não duplicado',
      duplicateFailedHint:
        'Imagem que não está na biblioteca Roll20 – adicione à sua biblioteca ou defina a imagem do token manualmente.',
    },
    ui: {
      applyScalingButton: 'Aplicar escala ao selecionado',
      partyScaling: 'Dimensionamento de festa',
      customScaling: 'Dimensionamento personalizado',
      bossTools: 'Ferramentas Chefe',
      bossPresetHint: 'Aplicar predefinição aos tokens selecionados',
      reinforcements: 'Reforços',
      duplicateSelected: 'Duplicar selecionado:',
      customDuplicate: 'Personalizado…',
      autoNumber: 'Numeração automática selecionada',
      layerVisibility: 'Camada e Visibilidade',
      moveToLayer: 'Mover para a camada:',
      tokenLayer: 'Camada de token',
      gmLayer: 'Camada GM',
      mapLayer: 'Camada do mapa',
      hideSelected: 'Ocultar selecionado',
      revealSelected: 'Revelar selecionado',
      revealReinforcements: 'Revelar na camada de token',
      positionSaving: 'Salvamento de posição',
      savePositions: 'Salvar posições',
      restorePositions: 'Restaurar posições',
      encounterTemplates: 'Modelos de Encontro',
      saveEncounter: 'Salvar encontro…',
      loadEncounter: 'Carregar encontro…',
      deleteEncounter: 'Excluir encontro…',
      listEncounters: 'Listar encontros',
      resetRecovery: 'Redefinir e recuperar',
      resetSelected: 'Redefinir selecionado',
      resetPage: 'Redefinir página',
      resetAll: 'Redefinir tudo',
      reporting: 'Relatórios',
      refreshReport: 'Atualizar relatório',
      selectedReport: 'Selecionado',
      changedReport: 'Mudado',
      clearReport: 'Claro',
      help: 'Ajuda',
      rebuildJournals: 'Reconstruir diários',
      commandDeck: 'Convés de comando',
      deckViewAll: 'Todos',
      deckViewScaling: 'Dimensionamento',
      deckViewPositioning: 'Posicionamento',
      deckViewAdmin: 'Administrador',
      deckViewLabel: 'Visualizar:',
      partySizeLabel: 'Tamanho da festa:',
      hpPercentLabel: '% de HP:',
      acModLabel: 'Modificador AC:',
      damagePercentLabel: 'Dano %:',
      load: 'Carregar',
      delete: 'Excluir',
      quickActions: 'Ações rápidas',
      config: 'Configuração',
      quickActionsDesc:
        'Acesso rápido às predefinições de escala de grupo e tipos de chefes mais usados.',
      partyScalingDesc:
        'Aplica o dimensionamento imediatamente aos tokens selecionados. Sem seleção, prepara os valores para Aplicar escala.',
      customScalingDesc:
        'Aplica-se imediatamente aos tokens selecionados. Prepare valores individuais primeiro e, em seguida, use Aplicar escalabilidade quando nenhum token for selecionado.',
      bossToolsDesc:
        'Aplique predefinições de funções a tokens selecionados – Minion reduz estatísticas, Boss e Legendary as aumentam.',
      reinforcementsDesc:
        'Duplique os tokens selecionados no mapa e numere automaticamente os nomes dos tokens repetidos.',
      layerVisibilityDesc:
        'Mova os tokens selecionados entre as camadas ou alterne sua visibilidade para os jogadores.',
      positionSavingDesc:
        'Capturar posições de token na página atual e restaurá-las a qualquer momento.',
      encounterTemplatesDesc:
        'Salve o estado atual da página como um modelo nomeado e restaure-o em sessões futuras.',
      resetRecoveryDesc:
        'Restaure os tokens rastreados às suas estatísticas originais e remova seus registros de rastreamento.',
      reportingDesc:
        'Atualize o diário de status com um resumo dos tokens rastreados e das alterações aplicadas.',
      configDesc: 'Defina quais barras de token rastreiam HP e AC e escolha o idioma da interface.',
      helpDesc:
        'Veja a referência completa do comando ou reconstrua o Command Deck e os diários de status.',
      setHpBar1: 'Definir barra de HP 1',
      setHpBar2: 'Definir barra HP 2',
      setAcBar2: 'Definir barra AC 2',
      disableAc: 'Desativar CA',
    },
    report: {
      summary: 'Resumo',
      generated: 'Gerado',
      tokensOnPage: 'Tokens na página',
      trackedTokens: 'Tokens rastreados',
      changed: 'Mudado',
      hiddenGm: 'Oculto (camada GM)',
      bossesLegendary: 'Chefes / Lendários',
      minions: 'Lacaios',
      noTrackedTokens: 'Nenhum token rastreado.',
      tokenCol: 'Símbolo',
      layerCol: 'Camada',
      hpCol: 'HP',
      acCol: 'AC',
      dmgCol: 'Dano',
      presetCol: 'Predefinido',
    },
  };

  const TRANSLATION$4 = {
    titles: {
      scriptReady: 'Сценарий готов',
      scalingApplied: 'Применено масштабирование',
      scalingPresetReady: 'Предустановка масштабирования готова',
      hpUpdated: 'Обновление масштабирования HP',
      acUpdated: 'Обновлено масштабирование переменного тока',
      damageUpdated: 'Обновлено масштабирование урона.',
      bossPreset: 'Предустановка босса: {preset}',
      partySize: 'Размер вечеринки: {size}',
      reinforcementsCreated: 'Подкрепления созданы',
      tokensNumbered: 'Жетоны пронумерованы',
      layerChanged: 'Слой изменен',
      tokensHidden: 'Токены скрыты',
      tokensRevealed: 'Токены раскрыты',
      positionsSaved: 'Позиции сохранены',
      positionsRestored: 'Позиции восстановлены',
      encounterSaved: 'Встреча сохранена',
      encounterLoaded: 'Встреча загружена',
      encounterDeleted: 'Встреча удалена',
      savedEncounters: 'Сохраненные встречи',
      tokensReset: 'Сброс токенов',
      pageReset: 'Сброс страницы',
      allReset: 'Сброс всех токенов',
      reportUpdated: 'Отчет обновлен',
      reportCleared: 'Отчет очищен',
      journalsRebuilt: 'Журналы восстановлены',
      deckUpdated: 'Обновлена ​​командная колода',
      configUpdated: 'Конфигурация обновлена',
      currentConfig: 'Текущая конфигурация',
      help: '{name} — Помощь',
    },
    errors: {
      unknownCommand: 'Неизвестная команда: «{sub}».',
      unknownCommandHint: 'Введите !director help для получения списка команд.',
      noTokensSelected: 'Токены не выбраны. Сначала выберите жетоны на карте.',
      unknownScaleAction: 'Неизвестное масштабное действие: «{action}».',
      scaleActionHint:
        'Допустимые действия: предустановка, группа, здоровье, ток, урон, применить.',
      unknownPartyPreset: 'Неизвестная предустановка участника: «{preset}».',
      partyPresetHint: 'Допустимые настройки: {presets}.',
      missingBossPreset: 'Отсутствует имя предустановки босса.',
      missingBossPresetHint: 'Допустимые настройки: {presets}.',
      unknownBossPreset: 'Предустановка неизвестного босса: «{preset}».',
      unknownBossPresetHint: 'Допустимые настройки: {presets}.',
      unknownReinforceAction: 'Неизвестное подкрепление: «{action}».',
      reinforceActionHint: 'Допустимые действия: дублировать, перечислять, показывать.',
      noReinforcementsToReveal: 'Никаких недавних подкреплений, о которых можно было бы узнать.',
      noReinforcementsToRevealHint: 'Используйте !director сначала для усиления дубликата.',
      unknownLayer: 'Неизвестный слой: «{layer}».',
      layerHint: 'Допустимые слои: жетон, гм, карта.',
      unknownPositionAction: 'Неизвестное действие по позиции: «{action}».',
      positionActionHint: 'Допустимые действия: сохранить, восстановить',
      unknownEncounterAction: 'Неизвестное действие при столкновении: «{action}».',
      encounterActionHint: 'Допустимые действия: сохранить, загрузить, удалить, составить список.',
      encounterNameRequired: 'Требуется имя встречи.',
      encounterNameRequiredHint: 'Пример: !director встреча сохранить засаду гоблинов',
      encounterNotFound: 'Встреча «{name}» не найдена.',
      encounterNotFoundHint:
        'Используйте список встреч !director, чтобы просмотреть сохраненные встречи.',
      unknownResetScope: 'Неизвестная область сброса: «{scope}».',
      resetScopeHint: 'Допустимые области: выбрано, страница, все.',
      unknownReportAction: 'Неизвестное действие по отчету: «{action}».',
      reportActionHint: 'Допустимые действия: обновить, выбрать, изменить, очистить.',
      unknownJournalAction: 'Неизвестное действие журнала: «{action}».',
      journalActionHint: 'Допустимые действия: перестроить',
      unknownDeckView: 'Неизвестный вид колоды: «{view}».',
      deckViewHint: 'Допустимые виды: все, масштабирование, позиционирование, администрирование.',
      unknownConfigKey: 'Неизвестный ключ конфигурации: «{key}».',
      configKeyHint: 'Действительные ключи: hp-bar, ac-bar, язык.',
      invalidHpBar: 'Неверная полоска HP: «{value}».',
      invalidHpBarHint: 'Допустимые параметры: {options}.',
      invalidAcBar: 'Неверная полоса переменного тока: «{value}».',
      invalidAcBarHint: 'Допустимые параметры: {options}.',
      invalidLanguage: 'Неверный язык: «{value}».',
      invalidLanguageHint: 'Поддерживается: {locales}',
      invalidPartySize: 'Размер группы должен быть числом от 1 до 30 (получено "{value}").',
      invalidHpPercent: 'Процент HP должен быть между 1 и 1000 (получено "{value}"). Пример: 150',
      invalidAcModifier:
        'Модификатор AC должен быть между -10 и +10 (получено «{value}»). Пример: +2',
      invalidDamagePercent:
        'Процент урона должен быть от 1 до 1000 (получено "{value}"). Пример: 125',
      invalidDuplicateCount:
        'Число дубликатов должно быть от 1 до 50 (получено "{value}"). Пример: 3',
      invalidEncounterName:
        'Недопустимое имя встречи: «{name}». Имена могут содержать буквы, цифры, пробелы, дефисы и подчеркивания (максимум 64 символа).',
      invalidEncounterNameHint: 'Пример: !director встреча сохранить засаду гоблинов',
      duplicateBurstLimit:
        'В результате операции будет создано {requested} токенов, что превысит ограничение в {limit}. Выберите меньше жетонов или используйте меньшее количество.',
      unexpectedError: 'Произошла непредвиденная ошибка: {message}.',
      unexpectedErrorHint: 'Подробности проверьте в консоли API.',
    },
    confirm: {
      scalingPresetPending: 'Выберите токены и нажмите «Применить масштабирование».',
      journalsRebuilt: 'Командная колода и журнал состояния были восстановлены.',
      deckUpdated: 'Командная колода была воссоздана с использованием представления {view}.',
      reportCleared: 'Отчет удален.',
      scriptReadyHint:
        'Откройте журнал боевых столкновений — командная колода для панели управления.',
      langSet: 'Язык установлен на {locale}.',
    },
    labels: {
      preset: 'Предустановка',
      nearestPreset: 'Ближайшая предустановка',
      hp: 'HP',
      ac: 'переменного тока',
      acModifier: 'модификатор переменного тока',
      damage: 'Повреждать',
      appliedTo: 'Применяется к',
      copiesPerToken: 'Копий на токен',
      totalCreated: 'Всего создано',
      renamed: 'Переименован',
      layer: 'Слой',
      moved: 'Взолнованный',
      hidden: 'Скрытый',
      revealed: 'Раскрытый',
      saved: 'Сохранено',
      restored: 'Восстановлен',
      noSavedPosition: 'Нет сохраненной позиции',
      tokensCaptured: 'Токены захвачены',
      loaded: 'Загружено',
      missingTokens: 'Отсутствующие токены',
      reset: 'Перезагрузить',
      notTracked: 'Не отслеживается',
      tokensInReport: 'Токены в отчете',
      selectedTokensInReport: 'Выбранные токены в отчете',
      changedTokensInReport: 'Изменены токены в отчете',
      hpBar: 'полоска HP',
      acBar: 'Бар переменного тока',
      language: 'Язык',
      noEncountersSaved: 'Пока не сохранено ни одной встречи.',
      name: 'Имя',
      deleted: 'Удалено',
      duplicateFailed: 'Не дублируется',
      duplicateFailedHint:
        'Изображение отсутствует в библиотеке Roll20 — добавьте в свою библиотеку или установите изображение токена вручную.',
    },
    ui: {
      applyScalingButton: 'Применить масштабирование к выбранному',
      partyScaling: 'Масштабирование партии',
      customScaling: 'Пользовательское масштабирование',
      bossTools: 'Инструменты босса',
      bossPresetHint: 'Применить предустановку к выбранным токенам',
      reinforcements: 'Подкрепления',
      duplicateSelected: 'Выбран дубликат:',
      customDuplicate: 'Обычай…',
      autoNumber: 'Автонумерация выбрана',
      layerVisibility: 'Слой и видимость',
      moveToLayer: 'Перейти на слой:',
      tokenLayer: 'Слой токенов',
      gmLayer: 'Слой ГМ',
      mapLayer: 'Слой карты',
      hideSelected: 'Скрыть выбранное',
      revealSelected: 'Показать выбранное',
      revealReinforcements: 'Раскрыть на уровне токена',
      positionSaving: 'Сохранение позиции',
      savePositions: 'Сохранить позиции',
      restorePositions: 'Восстановить позиции',
      encounterTemplates: 'Шаблоны встреч',
      saveEncounter: 'Сохранить встречу…',
      loadEncounter: 'Загрузить встречу…',
      deleteEncounter: 'Удалить встречу…',
      listEncounters: 'Список встреч',
      resetRecovery: 'Сброс и восстановление',
      resetSelected: 'Сбросить выбранное',
      resetPage: 'Сбросить страницу',
      resetAll: 'Сбросить все',
      reporting: 'Отчетность',
      refreshReport: 'Обновить отчет',
      selectedReport: 'Выбрано',
      changedReport: 'Измененный',
      clearReport: 'Прозрачный',
      help: 'Помощь',
      rebuildJournals: 'Восстановить журналы',
      commandDeck: 'Командная колода',
      deckViewAll: 'Все',
      deckViewScaling: 'Масштабирование',
      deckViewPositioning: 'Позиционирование',
      deckViewAdmin: 'Админ',
      deckViewLabel: 'Вид:',
      partySizeLabel: 'Размер вечеринки:',
      hpPercentLabel: 'ХП %:',
      acModLabel: 'Модификатор переменного тока:',
      damagePercentLabel: 'Повреждать %:',
      load: 'Нагрузка',
      delete: 'Удалить',
      quickActions: 'Быстрые действия',
      config: 'Конфигурация',
      quickActionsDesc:
        'Быстрый доступ к наиболее часто используемым настройкам масштабирования отряда и типам боссов.',
      partyScalingDesc:
        'Немедленно применяет масштабирование к выбранным токенам. Если выбор не выбран, устанавливаются значения для параметра «Применить масштабирование».',
      customScalingDesc:
        'Применяется немедленно к выбранным токенам. Сначала подготовьте отдельные значения, а затем используйте «Применить масштабирование», если токены не выбраны.',
      bossToolsDesc:
        'Примените настройки ролей к выбранным жетонам — Миньон снижает характеристики, Босс и Легендарный повышают их.',
      reinforcementsDesc:
        'Дублируйте выбранные токены на карте и автоматически нумеруйте повторяющиеся имена токенов.',
      layerVisibilityDesc:
        'Перемещайте выбранные жетоны между слоями или переключайте их видимость для игроков.',
      positionSavingDesc:
        'Снимите позиции токенов на текущей странице и восстановите их в любое время.',
      encounterTemplatesDesc:
        'Сохраните текущее состояние страницы как именованный шаблон и восстановите его в будущих сеансах.',
      resetRecoveryDesc:
        'Восстановите исходную статистику отслеживаемых токенов и удалите их записи отслеживания.',
      reportingDesc:
        'Обновите журнал состояния со сводкой отслеживаемых токенов и примененных изменений.',
      configDesc:
        'Установите, какие панели токенов отслеживают HP и AC, и выберите язык интерфейса.',
      helpDesc:
        'Просмотрите полный справочник команд или перестройте панель команд и журналы состояний.',
      setHpBar1: 'Установить полоску HP 1',
      setHpBar2: 'Установить планку HP 2',
      setAcBar2: 'Установите переменную панель 2',
      disableAc: 'Отключить переменный ток',
    },
    report: {
      summary: 'Краткое содержание',
      generated: 'Сгенерировано',
      tokensOnPage: 'Токены на странице',
      trackedTokens: 'Отслеживаемые токены',
      changed: 'Измененный',
      hiddenGm: 'Скрытый (слой GM)',
      bossesLegendary: 'Боссы / Легендарный',
      minions: 'Миньоны',
      noTrackedTokens: 'Нет отслеживаемых токенов.',
      tokenCol: 'Токен',
      layerCol: 'Слой',
      hpCol: 'HP',
      acCol: 'переменного тока',
      dmgCol: 'урон',
      presetCol: 'Предустановка',
    },
  };

  const TRANSLATION$3 = {
    titles: {
      scriptReady: 'Guión listo',
      scalingApplied: 'Escala aplicada',
      scalingPresetReady: 'Escala preestablecida lista',
      hpUpdated: 'Escalado de HP actualizado',
      acUpdated: 'Escalado de CA actualizado',
      damageUpdated: 'Escala de daños actualizada',
      bossPreset: 'Preajuste de jefe: {preset}',
      partySize: 'Tamaño del grupo: {size}',
      reinforcementsCreated: 'Refuerzos creados',
      tokensNumbered: 'Fichas numeradas',
      layerChanged: 'Capa cambiada',
      tokensHidden: 'Fichas ocultas',
      tokensRevealed: 'Fichas reveladas',
      positionsSaved: 'Posiciones guardadas',
      positionsRestored: 'Posiciones restauradas',
      encounterSaved: 'Encuentro guardado',
      encounterLoaded: 'Encuentro cargado',
      encounterDeleted: 'Encuentro eliminado',
      savedEncounters: 'Encuentros guardados',
      tokensReset: 'Restablecer tokens',
      pageReset: 'Restablecer página',
      allReset: 'Restablecer todos los tokens',
      reportUpdated: 'Informe actualizado',
      reportCleared: 'Informe borrado',
      journalsRebuilt: 'Revistas reconstruidas',
      deckUpdated: 'Plataforma de mando actualizada',
      configUpdated: 'Configuración actualizada',
      currentConfig: 'Configuración actual',
      help: '{name} — Ayuda',
    },
    errors: {
      unknownCommand: 'Comando desconocido: "{sub}".',
      unknownCommandHint: 'Escriba !director help para obtener una lista de comandos.',
      noTokensSelected: 'No hay tokens seleccionados. Primero selecciona fichas en el mapa.',
      unknownScaleAction: 'Acción de escala desconocida: "{action}".',
      scaleActionHint: 'Acciones válidas: preestablecer, fiesta, hp, ac, dañar, aplicar',
      unknownPartyPreset: 'Preajuste de grupo desconocido: "{preset}".',
      partyPresetHint: 'Ajustes preestablecidos válidos: {presets}',
      missingBossPreset: 'Falta el nombre preestablecido del jefe.',
      missingBossPresetHint: 'Ajustes preestablecidos válidos: {presets}',
      unknownBossPreset: 'Preajuste de jefe desconocido: "{preset}".',
      unknownBossPresetHint: 'Ajustes preestablecidos válidos: {presets}',
      unknownReinforceAction: 'Acción de refuerzo desconocida: "{action}".',
      reinforceActionHint: 'Acciones válidas: duplicar, enumerar, mostrar',
      noReinforcementsToReveal: 'No hay refuerzos recientes que revelar.',
      noReinforcementsToRevealHint: 'Utilice !director reforzar duplicado primero.',
      unknownLayer: 'Capa desconocida: "{layer}".',
      layerHint: 'Capas válidas: token, gm, mapa',
      unknownPositionAction: 'Acción de posición desconocida: "{action}".',
      positionActionHint: 'Acciones válidas: guardar, restaurar',
      unknownEncounterAction: 'Acción de encuentro desconocida: "{action}".',
      encounterActionHint: 'Acciones válidas: guardar, cargar, eliminar, listar',
      encounterNameRequired: 'Se requiere el nombre del encuentro.',
      encounterNameRequiredHint: 'Ejemplo: !director encuentro salvar goblin-emboscada',
      encounterNotFound: 'No se encontró el encuentro "{name}".',
      encounterNotFoundHint:
        'Utilice la lista de encuentros de !director para ver los encuentros guardados.',
      unknownResetScope: 'Alcance de reinicio desconocido: "{scope}".',
      resetScopeHint: 'Ámbitos válidos: seleccionado, página, todos',
      unknownReportAction: 'Acción de informe desconocida: "{action}".',
      reportActionHint: 'Acciones válidas: actualizar, seleccionar, cambiar, borrar',
      unknownJournalAction: 'Acción de diario desconocida: "{action}".',
      journalActionHint: 'Acciones válidas: reconstruir',
      unknownDeckView: 'Vista de plataforma desconocida: "{view}".',
      deckViewHint: 'Vistas válidas: todas, escalado, posicionamiento, administración',
      unknownConfigKey: 'Clave de configuración desconocida: "{key}".',
      configKeyHint: 'Teclas válidas: hp-bar, ac-bar, idioma',
      invalidHpBar: 'Barra de HP no válida: "{value}".',
      invalidHpBarHint: 'Opciones válidas: {options}',
      invalidAcBar: 'Barra de CA no válida: "{value}".',
      invalidAcBarHint: 'Opciones válidas: {options}',
      invalidLanguage: 'Idioma no válido: "{value}".',
      invalidLanguageHint: 'Compatible: {locales}',
      invalidPartySize: 'El tamaño del grupo debe ser un número entre 1 y 30 (obtuvo "{value}").',
      invalidHpPercent:
        'El porcentaje de HP debe estar entre 1 y 1000 (obtuvo "{value}"). Ejemplo: 150',
      invalidAcModifier:
        'El modificador AC debe estar entre -10 y +10 (obtuvo "{value}"). Ejemplo: +2',
      invalidDamagePercent:
        'El porcentaje de daño debe estar entre 1 y 1000 (obtuvo "{value}"). Ejemplo: 125',
      invalidDuplicateCount:
        'El recuento de duplicados debe estar entre 1 y 50 (obtuvo "{value}"). Ejemplo: 3',
      invalidEncounterName:
        'Nombre de encuentro no válido: "{name}". Los nombres pueden contener letras, dígitos, espacios, guiones y guiones bajos (máximo 64 caracteres).',
      invalidEncounterNameHint: 'Ejemplo: !director encuentro salvar goblin-emboscada',
      duplicateBurstLimit:
        'La operación crearía {requested} tokens, excediendo el límite de {limit}. Seleccione menos tokens o utilice un recuento menor.',
      unexpectedError: 'Se produjo un error inesperado: {message}',
      unexpectedErrorHint: 'Consulte la consola API para obtener más detalles.',
    },
    confirm: {
      scalingPresetPending: 'Seleccione tokens y luego haga clic en Aplicar escala.',
      journalsRebuilt: 'Se han regenerado la plataforma de mando y el diario de estado.',
      deckUpdated: 'La plataforma de mando se ha regenerado utilizando la vista {view}.',
      reportCleared: 'Informe borrado.',
      scriptReadyHint:
        'Abra el diario Combat Encounter Director - Command Deck para el panel de control.',
      langSet: 'Idioma establecido en {locale}.',
    },
    labels: {
      preset: 'Programar',
      nearestPreset: 'Preajuste más cercano',
      hp: 'caballos de fuerza',
      ac: 'C.A.',
      acModifier: 'modificador de CA',
      damage: 'Daño',
      appliedTo: 'Aplicado a',
      copiesPerToken: 'Copias por token',
      totalCreated: 'Total creado',
      renamed: 'Renombrado',
      layer: 'Capa',
      moved: 'Emocionado',
      hidden: 'Oculto',
      revealed: 'Reveló',
      saved: 'Guardado',
      restored: 'Restaurado',
      noSavedPosition: 'Ninguna posición guardada',
      tokensCaptured: 'Fichas capturadas',
      loaded: 'Cargado',
      missingTokens: 'fichas faltantes',
      reset: 'Reiniciar',
      notTracked: 'No rastreado',
      tokensInReport: 'Fichas en el informe',
      selectedTokensInReport: 'Tokens seleccionados en el informe',
      changedTokensInReport: 'Tokens modificados en el informe',
      hpBar: 'barra de vida',
      acBar: 'barra de aire acondicionado',
      language: 'Idioma',
      noEncountersSaved: 'Aún no se han guardado encuentros.',
      name: 'Nombre',
      deleted: 'Eliminado',
      duplicateFailed: 'No duplicado',
      duplicateFailedHint:
        'Imagen que no está en la biblioteca Roll20: agréguela a su biblioteca o configure la imagen del token manualmente.',
    },
    ui: {
      applyScalingButton: 'Aplicar escala a lo seleccionado',
      partyScaling: 'Escalamiento del partido',
      customScaling: 'Escala personalizada',
      bossTools: 'Herramientas de jefe',
      bossPresetHint: 'Aplicar ajustes preestablecidos a tokens seleccionados',
      reinforcements: 'Refuerzos',
      duplicateSelected: 'Duplicado seleccionado:',
      customDuplicate: 'Costumbre…',
      autoNumber: 'Numeración automática seleccionada',
      layerVisibility: 'Capa y visibilidad',
      moveToLayer: 'Mover a capa:',
      tokenLayer: 'Capa de token',
      gmLayer: 'Capa GM',
      mapLayer: 'Capa de mapa',
      hideSelected: 'Ocultar seleccionado',
      revealSelected: 'Revelar Seleccionado',
      revealReinforcements: 'Revelar en la capa de token',
      positionSaving: 'Guardar posición',
      savePositions: 'Guardar posiciones',
      restorePositions: 'Restaurar posiciones',
      encounterTemplates: 'Plantillas de encuentro',
      saveEncounter: 'Guardar encuentro…',
      loadEncounter: 'Cargar encuentro...',
      deleteEncounter: 'Eliminar encuentro…',
      listEncounters: 'Encuentros de lista',
      resetRecovery: 'Restablecimiento y recuperación',
      resetSelected: 'Restablecer seleccionado',
      resetPage: 'Restablecer página',
      resetAll: 'Restablecer todo',
      reporting: 'Informes',
      refreshReport: 'Actualizar informe',
      selectedReport: 'Seleccionado',
      changedReport: 'Cambió',
      clearReport: 'Claro',
      help: 'Ayuda',
      rebuildJournals: 'Reconstruir diarios',
      commandDeck: 'Cubierta de mando',
      deckViewAll: 'Todo',
      deckViewScaling: 'Escalada',
      deckViewPositioning: 'Posicionamiento',
      deckViewAdmin: 'Administración',
      deckViewLabel: 'Vista:',
      partySizeLabel: 'Tamaño del grupo:',
      hpPercentLabel: '% de vida:',
      acModLabel: 'Modificador de CA:',
      damagePercentLabel: 'Daño %:',
      load: 'Carga',
      delete: 'Borrar',
      quickActions: 'Acciones Rápidas',
      config: 'configuración',
      quickActionsDesc:
        'Acceso rápido a los ajustes preestablecidos de escalado de grupo y los tipos de jefes más utilizados.',
      partyScalingDesc:
        'Aplica la escala inmediatamente a los tokens seleccionados. Sin selección, organiza los valores para Aplicar escala.',
      customScalingDesc:
        'Se aplica inmediatamente a los tokens seleccionados. Primero organice los valores individuales y luego use Aplicar escala cuando no se seleccionen tokens.',
      bossToolsDesc:
        'Aplique ajustes preestablecidos de roles a tokens seleccionados: Minion reduce las estadísticas, Boss y Legendary las aumentan.',
      reinforcementsDesc:
        'Duplica los tokens seleccionados en el mapa y numera automáticamente los nombres de los tokens repetidos.',
      layerVisibilityDesc:
        'Mueva las fichas seleccionadas entre capas o cambie su visibilidad para los jugadores.',
      positionSavingDesc:
        'Capture las posiciones de los tokens en la página actual y restáurelas en cualquier momento.',
      encounterTemplatesDesc:
        'Guarde el estado actual de la página como una plantilla con nombre y restáurelo en sesiones futuras.',
      resetRecoveryDesc:
        'Restaure los tokens rastreados a sus estadísticas originales y elimine sus registros de seguimiento.',
      reportingDesc:
        'Actualice el diario de estado con un resumen de los tokens rastreados y los cambios aplicados.',
      configDesc:
        'Establezca qué barras de tokens rastrean HP y AC, y elija el idioma de la interfaz.',
      helpDesc:
        'Vea la referencia de comando completa o reconstruya la plataforma de comando y los diarios de estado.',
      setHpBar1: 'Establecer barra de HP 1',
      setHpBar2: 'Establecer barra de HP 2',
      setAcBar2: 'Establecer barra de CA 2',
      disableAc: 'Desactivar aire acondicionado',
    },
    report: {
      summary: 'Resumen',
      generated: 'Generado',
      tokensOnPage: 'Fichas en la página',
      trackedTokens: 'Fichas rastreadas',
      changed: 'Cambió',
      hiddenGm: 'Oculto (capa GM)',
      bossesLegendary: 'Jefes / Legendario',
      minions: 'Minions',
      noTrackedTokens: 'No hay tokens rastreados.',
      tokenCol: 'Simbólico',
      layerCol: 'Capa',
      hpCol: 'caballos de fuerza',
      acCol: 'C.A.',
      dmgCol: 'Daño',
      presetCol: 'Programar',
    },
  };

  const TRANSLATION$2 = {
    titles: {
      scriptReady: 'Manus redo',
      scalingApplied: 'Skalning tillämpad',
      scalingPresetReady: 'Skalningsförinställning redo',
      hpUpdated: 'HP Scaling uppdaterad',
      acUpdated: 'AC-skalning uppdaterad',
      damageUpdated: 'Skadeskalning uppdaterad',
      bossPreset: 'Boss Preset: {preset}',
      partySize: 'Feststorlek: {size}',
      reinforcementsCreated: 'Förstärkningar skapade',
      tokensNumbered: 'Polletter numrerade',
      layerChanged: 'Skikt har ändrats',
      tokensHidden: 'Poletter gömda',
      tokensRevealed: 'Tokens avslöjade',
      positionsSaved: 'Positioner sparade',
      positionsRestored: 'Positioner återställda',
      encounterSaved: 'Möte sparat',
      encounterLoaded: 'Encounter Loaded',
      encounterDeleted: 'Encounter raderade',
      savedEncounters: 'Sparade möten',
      tokensReset: 'Tokens återställs',
      pageReset: 'Sidåterställning',
      allReset: 'Alla tokens återställs',
      reportUpdated: 'Rapport uppdaterad',
      reportCleared: 'Rapport rensad',
      journalsRebuilt: 'Tidskrifter ombyggda',
      deckUpdated: 'Command Deck uppdaterad',
      configUpdated: 'Konfig uppdaterad',
      currentConfig: 'Aktuell konfig',
      help: '{name} — Hjälp',
    },
    errors: {
      unknownCommand: 'Okänt kommando: "{sub}".',
      unknownCommandHint: 'Skriv !director help för en lista med kommandon.',
      noTokensSelected: 'Inga tokens har valts. Välj tokens på kartan först.',
      unknownScaleAction: 'Okänd skalåtgärd: "{action}".',
      scaleActionHint: 'Giltiga åtgärder: förinställd, fest, hp, ac, skada, tillämpa',
      unknownPartyPreset: 'Okänd part förinställning: "{preset}".',
      partyPresetHint: 'Giltiga förinställningar: {presets}',
      missingBossPreset: 'Förinställningsnamn för chef saknas.',
      missingBossPresetHint: 'Giltiga förinställningar: {presets}',
      unknownBossPreset: 'Okänd chefsförinställning: "{preset}".',
      unknownBossPresetHint: 'Giltiga förinställningar: {presets}',
      unknownReinforceAction: 'Okänd förstärkningsåtgärd: "{action}".',
      reinforceActionHint: 'Giltiga åtgärder: duplicera, räkna upp, visa',
      noReinforcementsToReveal: 'Inga nya förstärkningar att avslöja.',
      noReinforcementsToRevealHint: 'Använd !director förstärka duplicate först.',
      unknownLayer: 'Okänt lager: "{layer}".',
      layerHint: 'Giltiga lager: token, gm, karta',
      unknownPositionAction: 'Okänd positionsåtgärd: "{action}".',
      positionActionHint: 'Giltiga åtgärder: spara, återställa',
      unknownEncounterAction: 'Okänd mötesåtgärd: "{action}".',
      encounterActionHint: 'Giltiga åtgärder: spara, ladda, ta bort, lista',
      encounterNameRequired: 'Namn på möte krävs.',
      encounterNameRequiredHint: 'Exempel: !direktör möte save goblin-bakhåll',
      encounterNotFound: 'Möte "{name}" hittades inte.',
      encounterNotFoundHint: 'Använd !director möteslista för att se sparade möten.',
      unknownResetScope: 'Okänd återställningsomfång: "{scope}".',
      resetScopeHint: 'Giltiga omfång: valda, sida, alla',
      unknownReportAction: 'Okänd rapportåtgärd: "{action}".',
      reportActionHint: 'Giltiga åtgärder: uppdatera, vald, ändrad, rensa',
      unknownJournalAction: 'Okänd journalåtgärd: "{action}".',
      journalActionHint: 'Giltiga åtgärder: bygg om',
      unknownDeckView: 'Okänd däckvy: "{view}".',
      deckViewHint: 'Giltiga vyer: alla, skalning, positionering, admin',
      unknownConfigKey: 'Okänd konfigurationsnyckel: "{key}".',
      configKeyHint: 'Giltiga nycklar: hp-bar, ac-bar, språk',
      invalidHpBar: 'Ogiltig HP-stapel: "{value}".',
      invalidHpBarHint: 'Giltiga alternativ: {options}',
      invalidAcBar: 'Ogiltig AC-stapel: "{value}".',
      invalidAcBarHint: 'Giltiga alternativ: {options}',
      invalidLanguage: 'Ogiltigt språk: "{value}".',
      invalidLanguageHint: 'Stöds: {locales}',
      invalidPartySize: 'Partistorleken måste vara ett tal mellan 1 och 30 (fick "{value}").',
      invalidHpPercent: 'HP-procenten måste vara mellan 1 och 1000 (fick "{value}"). Exempel: 150',
      invalidAcModifier:
        'AC-modifieraren måste vara mellan -10 och +10 (fick "{value}"). Exempel: +2',
      invalidDamagePercent:
        'Skadeprocenten måste vara mellan 1 och 1000 (fick "{value}"). Exempel: 125',
      invalidDuplicateCount:
        'Dubblettantalet måste vara mellan 1 och 50 (fick "{value}"). Exempel: 3',
      invalidEncounterName:
        'Ogiltigt mötesnamn: "{name}". Namn kan innehålla bokstäver, siffror, mellanslag, bindestreck och understreck (max 64 tecken).',
      invalidEncounterNameHint: 'Exempel: !direktör möte save goblin-bakhåll',
      duplicateBurstLimit:
        'Åtgärden skulle skapa {requested} tokens, vilket överskrider gränsen på {limit}. Välj färre tokens eller använd ett mindre antal.',
      unexpectedError: 'Ett oväntat fel inträffade: {message}',
      unexpectedErrorHint: 'Kontrollera API-konsolen för detaljer.',
    },
    confirm: {
      scalingPresetPending: 'Välj tokens och klicka sedan på Använd skalning.',
      journalsRebuilt: 'Command Deck och statusjournal har återskapats.',
      deckUpdated: 'Kommandodäcket har återskapats med vyn {view}.',
      reportCleared: 'Rapport rensad.',
      scriptReadyHint:
        'Öppna Combat Encounter Director - Command Deck journal för kontrollpanelen.',
      langSet: 'Språket är inställt på {locale}.',
    },
    labels: {
      preset: 'Förinställa',
      nearestPreset: 'Närmaste förinställning',
      hp: 'HP',
      ac: 'AC',
      acModifier: 'AC modifierare',
      damage: 'Skada',
      appliedTo: 'Tillämpas på',
      copiesPerToken: 'Kopior per token',
      totalCreated: 'Totalt skapat',
      renamed: 'Omdöpt',
      layer: 'Lager',
      moved: 'Rörd',
      hidden: 'Dold',
      revealed: 'Avslöjat',
      saved: 'Sparad',
      restored: 'Återställd',
      noSavedPosition: 'Ingen sparad position',
      tokensCaptured: 'Polletter tillfångatagna',
      loaded: 'Lastad',
      missingTokens: 'Saknade tokens',
      reset: 'Återställa',
      notTracked: 'Ej spårad',
      tokensInReport: 'Tokens i rapporten',
      selectedTokensInReport: 'Valda tokens i rapporten',
      changedTokensInReport: 'Ändrade tokens i rapporten',
      hpBar: 'HP bar',
      acBar: 'AC bar',
      language: 'Språk',
      noEncountersSaved: 'Inga möten sparade ännu.',
      name: 'Namn',
      deleted: 'Raderad',
      duplicateFailed: 'Inte duplicerad',
      duplicateFailedHint:
        'Bild inte i Roll20 Library — lägg till i ditt bibliotek eller ställ in tokenbilden manuellt.',
    },
    ui: {
      applyScalingButton: 'Tillämpa skalning på valda',
      partyScaling: 'Party Skalning',
      customScaling: 'Anpassad skalning',
      bossTools: 'Boss Tools',
      bossPresetHint: 'Använd förinställning på valda tokens',
      reinforcements: 'Förstärkningar',
      duplicateSelected: 'Dubblett vald:',
      customDuplicate: 'Beställnings…',
      autoNumber: 'Automatiskt nummer valt',
      layerVisibility: 'Lager & Synlighet',
      moveToLayer: 'Flytta till lager:',
      tokenLayer: 'Tokenlager',
      gmLayer: 'GM lager',
      mapLayer: 'Kartlager',
      hideSelected: 'Dölj valda',
      revealSelected: 'Avslöja vald',
      revealReinforcements: 'Avslöja på Token Layer',
      positionSaving: 'Positionssparande',
      savePositions: 'Spara positioner',
      restorePositions: 'Återställ positioner',
      encounterTemplates: 'Möte mallar',
      saveEncounter: 'Spara möte...',
      loadEncounter: 'Ladda möte...',
      deleteEncounter: 'Ta bort möte...',
      listEncounters: 'Lista möten',
      resetRecovery: 'Återställ och återställning',
      resetSelected: 'Återställ valt',
      resetPage: 'Återställ sida',
      resetAll: 'Återställ alla',
      reporting: 'Rapportering',
      refreshReport: 'Uppdatera rapport',
      selectedReport: 'Vald',
      changedReport: 'Ändrad',
      clearReport: 'Rensa',
      help: 'Hjälp',
      rebuildJournals: 'Bygg om tidskrifter',
      commandDeck: 'Kommandodäck',
      deckViewAll: 'Alla',
      deckViewScaling: 'Skalning',
      deckViewPositioning: 'Positionering',
      deckViewAdmin: 'Administration',
      deckViewLabel: 'Se:',
      partySizeLabel: 'Feststorlek:',
      hpPercentLabel: 'HP %:',
      acModLabel: 'AC modifierare:',
      damagePercentLabel: 'Skador %:',
      load: 'Ladda',
      delete: 'Radera',
      quickActions: 'Snabba åtgärder',
      config: 'Konfig',
      quickActionsDesc:
        'Snabb åtkomst till de mest använda partyskalningsförinställningarna och bosstyperna.',
      partyScalingDesc:
        'Tillämpar skalning omedelbart på valda tokens. Utan något val, stegar värdena för Tillämpa skalning.',
      customScalingDesc:
        'Gäller omedelbart för valda tokens. Steg först individuella värden och använd sedan Tillämpa skalning när inga tokens har valts.',
      bossToolsDesc:
        'Tillämpa rollförinställningar på utvalda tokens — Minion minskar statistik, Boss och Legendary ökar dem.',
      reinforcementsDesc:
        'Duplicera valda tokens på kartan och numrera upprepade tokennamn automatiskt.',
      layerVisibilityDesc:
        'Flytta valda tokens mellan lager eller växla deras synlighet för spelare.',
      positionSavingDesc:
        'Snapshot token-positioner på den aktuella sidan och återställ dem när som helst.',
      encounterTemplatesDesc:
        'Spara den aktuella sidstatusen som en namngiven mall och återställ den i framtida sessioner.',
      resetRecoveryDesc:
        'Återställ spårade tokens till deras ursprungliga statistik och ta bort deras spårningsrekord.',
      reportingDesc:
        'Uppdatera statusjournalen med en sammanfattning av spårade tokens och tillämpade ändringar.',
      configDesc: 'Ställ in vilka tokenstaplar som spårar HP och AC och välj gränssnittsspråk.',
      helpDesc: 'Se hela kommandoreferensen eller bygg om kommandodäcket och statusjournalerna.',
      setHpBar1: 'Ställ in HP bar 1',
      setHpBar2: 'Ställ in HP bar 2',
      setAcBar2: 'Ställ in AC bar 2',
      disableAc: 'Inaktivera AC',
    },
    report: {
      summary: 'Sammanfattning',
      generated: 'Genererad',
      tokensOnPage: 'Tokens på sidan',
      trackedTokens: 'Spårade tokens',
      changed: 'Ändrad',
      hiddenGm: 'Dolt (GM-lager)',
      bossesLegendary: 'Bossar / Legendarisk',
      minions: 'Minions',
      noTrackedTokens: 'Inga spårade tokens.',
      tokenCol: 'Tecken',
      layerCol: 'Lager',
      hpCol: 'HP',
      acCol: 'AC',
      dmgCol: 'Dmg',
      presetCol: 'Förinställa',
    },
  };

  const TRANSLATION$1 = {
    titles: {
      scriptReady: 'Senaryo Hazır',
      scalingApplied: 'Ölçeklendirme Uygulandı',
      scalingPresetReady: 'Ölçeklendirme Ön Ayarı Hazır',
      hpUpdated: 'HP Ölçeklendirme Güncellendi',
      acUpdated: 'AC Ölçeklendirme Güncellendi',
      damageUpdated: 'Hasar Ölçeklendirmesi Güncellendi',
      bossPreset: 'Patron Ön Ayarı: {preset}',
      partySize: 'Parti Boyutu: {size}',
      reinforcementsCreated: 'Takviyeler Oluşturuldu',
      tokensNumbered: 'Numaralandırılmış Jetonlar',
      layerChanged: 'Katman Değiştirildi',
      tokensHidden: 'Gizli Jetonlar',
      tokensRevealed: 'Tokenlar Ortaya Çıktı',
      positionsSaved: 'Kaydedilen Pozisyonlar',
      positionsRestored: 'Geri Yüklenen Pozisyonlar',
      encounterSaved: 'Karşılaşma Kaydedildi',
      encounterLoaded: 'Karşılaşma Yüklendi',
      encounterDeleted: 'Karşılaşma Silindi',
      savedEncounters: 'Kayıtlı Karşılaşmalar',
      tokensReset: 'Jetonları Sıfırla',
      pageReset: 'Sayfa Sıfırlama',
      allReset: 'Tüm Jetonları Sıfırla',
      reportUpdated: 'Rapor Güncellendi',
      reportCleared: 'Rapor Temizlendi',
      journalsRebuilt: 'Günlükler Yeniden Oluşturuldu',
      deckUpdated: 'Komuta Güvertesi Güncellendi',
      configUpdated: 'Yapılandırma Güncellendi',
      currentConfig: 'Geçerli Yapılandırma',
      help: '{name} — Yardım',
    },
    errors: {
      unknownCommand: 'Bilinmeyen komut: "{sub}".',
      unknownCommandHint: 'Komutların listesi için !director help yazın.',
      noTokensSelected: 'Hiçbir jeton seçilmedi. Önce haritada jetonları seçin.',
      unknownScaleAction: 'Bilinmeyen ölçek eylemi: "{action}".',
      scaleActionHint: 'Geçerli eylemler: ön ayar, parti, hp, ac, hasar, uygulama',
      unknownPartyPreset: 'Bilinmeyen taraf ön ayarı: "{preset}".',
      partyPresetHint: 'Geçerli ön ayarlar: {presets}',
      missingBossPreset: 'Patronun ön ayar adı eksik.',
      missingBossPresetHint: 'Geçerli ön ayarlar: {presets}',
      unknownBossPreset: 'Bilinmeyen patron ön ayarı: "{preset}".',
      unknownBossPresetHint: 'Geçerli ön ayarlar: {presets}',
      unknownReinforceAction: 'Bilinmeyen takviye eylemi: "{action}".',
      reinforceActionHint: 'Geçerli eylemler: çoğalt, numaralandır, göster',
      noReinforcementsToReveal: 'Açıklanacak yeni bir takviye yok.',
      noReinforcementsToRevealHint: 'Önce !director takviye kopyasını kullanın.',
      unknownLayer: 'Bilinmeyen katman: "{layer}".',
      layerHint: 'Geçerli katmanlar: jeton, gm, harita',
      unknownPositionAction: 'Bilinmeyen konum işlemi: "{action}".',
      positionActionHint: 'Geçerli eylemler: kaydet, geri yükle',
      unknownEncounterAction: 'Bilinmeyen karşılaşma eylemi: "{action}".',
      encounterActionHint: 'Geçerli eylemler: kaydet, yükle, sil, listele',
      encounterNameRequired: 'Karşılaşma adı gerekli.',
      encounterNameRequiredHint: 'Örnek: !director karşılaşması goblin pususunu kurtarır',
      encounterNotFound: '"{name}" ile karşılaşma bulunamadı.',
      encounterNotFoundHint:
        'Kaydedilen karşılaşmaları görmek için !director karşılaşma listesini kullanın.',
      unknownResetScope: 'Bilinmeyen sıfırlama kapsamı: "{scope}".',
      resetScopeHint: 'Geçerli kapsamlar: seçili, sayfa, tümü',
      unknownReportAction: 'Bilinmeyen rapor eylemi: "{action}".',
      reportActionHint: 'Geçerli eylemler: yenile, seçildi, değiştirildi, temizle',
      unknownJournalAction: 'Bilinmeyen günlük eylemi: "{action}".',
      journalActionHint: 'Geçerli eylemler: yeniden oluşturma',
      unknownDeckView: 'Bilinmeyen güverte görünümü: "{view}".',
      deckViewHint: 'Geçerli görünümler: tümü, ölçeklendirme, konumlandırma, yönetici',
      unknownConfigKey: 'Bilinmeyen yapılandırma anahtarı: "{key}".',
      configKeyHint: 'Geçerli tuşlar: hp-bar, ac-bar, dil',
      invalidHpBar: 'Geçersiz HP çubuğu: "{value}".',
      invalidHpBarHint: 'Geçerli seçenekler: {options}',
      invalidAcBar: 'Geçersiz AC çubuğu: "{value}".',
      invalidAcBarHint: 'Geçerli seçenekler: {options}',
      invalidLanguage: 'Geçersiz dil: "{value}".',
      invalidLanguageHint: 'Desteklenen: {locales}',
      invalidPartySize:
        'Parti büyüklüğü 1 ile 30 arasında bir sayı olmalıdır ("{value}" değerini alır).',
      invalidHpPercent: 'HP yüzdesi 1 ile 1000 arasında olmalıdır ("{value}" aldı). Örnek: 150',
      invalidAcModifier:
        'AC değiştirici -10 ile +10 arasında olmalıdır ("{value}" alır). Örnek: +2',
      invalidDamagePercent:
        'Hasar yüzdesi 1 ile 1000 arasında olmalıdır ("{value}" aldı). Örnek: 125',
      invalidDuplicateCount:
        'Yinelenen kopya sayısı 1 ile 50 arasında olmalıdır ("{value}" aldı). Örnek: 3',
      invalidEncounterName:
        'Geçersiz karşılaşma adı: "{name}". İsimler harf, rakam, boşluk, tire ve alt çizgi içerebilir (en fazla 64 karakter).',
      invalidEncounterNameHint: 'Örnek: !director karşılaşması goblin pususunu kurtarır',
      duplicateBurstLimit:
        'İşlem, {limit} sınırını aşan {requested} jetonları oluşturacaktır. Daha az jeton seçin veya daha küçük bir sayı kullanın.',
      unexpectedError: 'Beklenmeyen bir hata oluştu: {message}',
      unexpectedErrorHint: 'Ayrıntılar için API konsolunu kontrol edin.',
    },
    confirm: {
      scalingPresetPending: "Belirteçleri seçin ve ardından Ölçeklendirmeyi Uygula'ya tıklayın.",
      journalsRebuilt: 'Komuta Güvertesi ve durum günlüğü yeniden oluşturuldu.',
      deckUpdated: 'Komuta Güvertesi {view} görünümü kullanılarak yeniden oluşturuldu.',
      reportCleared: 'Rapor temizlendi.',
      scriptReadyHint:
        'Kontrol paneli için Combat Encounter Director - Command Deck günlüğünü açın.',
      langSet: 'Dil {locale} olarak ayarlandı.',
    },
    labels: {
      preset: 'Ön ayar',
      nearestPreset: 'En yakın ön ayar',
      hp: 'HP',
      ac: 'klima',
      acModifier: 'AC değiştirici',
      damage: 'Zarar',
      appliedTo: 'Uygulanan',
      copiesPerToken: 'Belirteç başına kopya sayısı',
      totalCreated: 'Toplam oluşturulan',
      renamed: 'Yeniden adlandırıldı',
      layer: 'Katman',
      moved: 'Etkilenmiş',
      hidden: 'Gizlenmiş',
      revealed: 'Açıklığa kavuşmuş',
      saved: 'Kaydedildi',
      restored: 'Geri yüklendi',
      noSavedPosition: 'Kayıtlı konum yok',
      tokensCaptured: 'Yakalanan jetonlar',
      loaded: 'Yüklendi',
      missingTokens: 'Eksik jetonlar',
      reset: 'Sıfırla',
      notTracked: 'Takip edilmedi',
      tokensInReport: 'Rapordaki jetonlar',
      selectedTokensInReport: 'Raporda seçilen belirteçler',
      changedTokensInReport: 'Rapordaki jetonlar değiştirildi',
      hpBar: 'HP çubuğu',
      acBar: 'Klima çubuğu',
      language: 'Dil',
      noEncountersSaved: 'Henüz kaydedilen karşılaşma yok.',
      name: 'İsim',
      deleted: 'Silindi',
      duplicateFailed: 'Kopyalanmadı',
      duplicateFailedHint:
        'Resim Roll20 Kitaplığında değil — kitaplığınıza ekleyin veya simge resmini manuel olarak ayarlayın.',
    },
    ui: {
      applyScalingButton: 'Seçilenlere Ölçeklendirme Uygula',
      partyScaling: 'Parti Ölçeklendirmesi',
      customScaling: 'Özel Ölçeklendirme',
      bossTools: 'Patron Araçları',
      bossPresetHint: 'Seçilen belirteçlere ön ayarı uygula',
      reinforcements: 'Takviyeler',
      duplicateSelected: 'Kopya seçildi:',
      customDuplicate: 'Gelenek…',
      autoNumber: 'Otomatik Numara Seçildi',
      layerVisibility: 'Katman ve Görünürlük',
      moveToLayer: 'Katmana taşı:',
      tokenLayer: 'Jeton Katmanı',
      gmLayer: 'GM Katmanı',
      mapLayer: 'Harita Katmanı',
      hideSelected: 'Seçileni Gizle',
      revealSelected: 'Seçileni Göster',
      revealReinforcements: 'Token Katmanında Göster',
      positionSaving: 'Pozisyon Kaydetme',
      savePositions: 'Pozisyonları Kaydet',
      restorePositions: 'Pozisyonları Geri Yükle',
      encounterTemplates: 'Karşılaşma Şablonları',
      saveEncounter: 'Karşılaşmayı Kaydet…',
      loadEncounter: 'Karşılaşmayı Yükle…',
      deleteEncounter: 'Karşılaşmayı Sil…',
      listEncounters: 'Karşılaşmaları Listeleme',
      resetRecovery: 'Sıfırlama ve Kurtarma',
      resetSelected: 'Seçileni Sıfırla',
      resetPage: 'Sayfayı Sıfırla',
      resetAll: 'Tümünü Sıfırla',
      reporting: 'Raporlama',
      refreshReport: 'Raporu Yenile',
      selectedReport: 'Seçildi',
      changedReport: 'Değiştirildi',
      clearReport: 'Temizlemek',
      help: 'Yardım',
      rebuildJournals: 'Günlükleri Yeniden Oluştur',
      commandDeck: 'Komut Güvertesi',
      deckViewAll: 'Tüm',
      deckViewScaling: 'Ölçeklendirme',
      deckViewPositioning: 'Konumlandırma',
      deckViewAdmin: 'Yönetici',
      deckViewLabel: 'Görüş:',
      partySizeLabel: 'Parti büyüklüğü:',
      hpPercentLabel: "HP %'si:",
      acModLabel: 'AC değiştirici:',
      damagePercentLabel: 'Zarar %:',
      load: 'Yük',
      delete: 'Silmek',
      quickActions: 'Hızlı Eylemler',
      config: 'Yapılandırma',
      quickActionsDesc:
        'En çok kullanılan parti ölçeklendirme ön ayarlarına ve patron türlerine hızlı erişim.',
      partyScalingDesc:
        'Ölçeklendirmeyi seçilen belirteçlere hemen uygular. Hiçbir seçim yapılmadan, Ölçeklendirmeyi Uygula için değerler aşamalandırılır.',
      customScalingDesc:
        "Seçilen belirteçlere anında uygulanır. Önce bireysel değerleri aşamalandırın, ardından hiçbir belirteç seçilmediğinde Ölçeklendirmeyi Uygula'yı kullanın.",
      bossToolsDesc:
        'Rol ön ayarlarını seçilen jetonlara uygulayın - Minion istatistikleri azaltır, Boss ve Legendary ise bunları güçlendirir.',
      reinforcementsDesc:
        'Seçilen jetonları haritada çoğaltın ve tekrarlanan jeton adlarını otomatik olarak numaralandırın.',
      layerVisibilityDesc:
        'Seçilen jetonları katmanlar arasında taşıyın veya oyuncular için görünürlüğünü değiştirin.',
      positionSavingDesc:
        'Anlık görüntü jetonunun geçerli sayfadaki konumları ve bunları istediğiniz zaman geri yükleyin.',
      encounterTemplatesDesc:
        'Geçerli sayfa durumunu adlandırılmış bir şablon olarak kaydedin ve sonraki oturumlarda geri yükleyin.',
      resetRecoveryDesc:
        'Takip edilen tokenleri orijinal istatistiklerine geri yükleyin ve takip kayıtlarını kaldırın.',
      reportingDesc:
        'İzlenen belirteçlerin ve uygulanan değişikliklerin özetiyle durum günlüğünü yenileyin.',
      configDesc:
        "Hangi jeton çubuklarının HP ve AC'yi izleyeceğini ayarlayın ve arayüz dilini seçin.",
      helpDesc:
        'Komut referansının tamamını görüntüleyin veya Komut Güvertesi ve durum günlüklerini yeniden oluşturun.',
      setHpBar1: "HP çubuğu 1'i ayarla",
      setHpBar2: "HP çubuğu 2'yi ayarlayın",
      setAcBar2: "AC çubuğu 2'yi ayarlayın",
      disableAc: "AC'yi devre dışı bırak",
    },
    report: {
      summary: 'Özet',
      generated: 'Oluşturuldu',
      tokensOnPage: 'Sayfadaki jetonlar',
      trackedTokens: 'Takip edilen jetonlar',
      changed: 'Değiştirildi',
      hiddenGm: 'Gizli (GM katmanı)',
      bossesLegendary: 'Patronlar / Efsanevi',
      minions: 'Minyonlar',
      noTrackedTokens: 'Takip edilen jeton yok.',
      tokenCol: 'Jeton',
      layerCol: 'Katman',
      hpCol: 'HP',
      acCol: 'klima',
      dmgCol: 'hasar',
      presetCol: 'Ön ayar',
    },
  };

  const TRANSLATION = {
    titles: {
      scriptReady: 'Сценарій готовий',
      scalingApplied: 'Застосовано масштабування',
      scalingPresetReady: 'Попереднє налаштування масштабування готове',
      hpUpdated: 'Оновлено масштабування HP',
      acUpdated: 'Масштабування змінного струму оновлено',
      damageUpdated: 'Оновлено шкалу пошкоджень',
      bossPreset: 'Попереднє налаштування боса: {preset}',
      partySize: 'Розмір групи: {size}',
      reinforcementsCreated: 'Підкріплення створено',
      tokensNumbered: 'Жетони пронумеровані',
      layerChanged: 'Шар змінено',
      tokensHidden: 'Жетони приховано',
      tokensRevealed: 'Розкрито токени',
      positionsSaved: 'Позиції збережено',
      positionsRestored: 'Позиції відновлені',
      encounterSaved: 'Зустріч збережено',
      encounterLoaded: 'Зустріч завантажена',
      encounterDeleted: 'Зустріч видалена',
      savedEncounters: 'Збережені зустрічі',
      tokensReset: 'Скидання токенів',
      pageReset: 'Скидання сторінки',
      allReset: 'Усі токени скинути',
      reportUpdated: 'Звіт оновлено',
      reportCleared: 'Звіт очищено',
      journalsRebuilt: 'Журнали перебудовані',
      deckUpdated: 'Командна колода оновлена',
      configUpdated: 'Конфігурацію оновлено',
      currentConfig: 'Поточна конфігурація',
      help: '{name} — Довідка',
    },
    errors: {
      unknownCommand: 'Невідома команда: "{sub}".',
      unknownCommandHint: 'Введіть !director help, щоб отримати список команд.',
      noTokensSelected: 'Токенів не вибрано. Спочатку виберіть жетони на карті.',
      unknownScaleAction: 'Невідома дія масштабу: "{action}".',
      scaleActionHint: 'Допустимі дії: preset, party, hp, ac, damage, apply',
      unknownPartyPreset: 'Налаштування невідомої сторони: "{preset}".',
      partyPresetHint: 'Дійсні попередні налаштування: {presets}',
      missingBossPreset: 'Відсутня назва боса.',
      missingBossPresetHint: 'Дійсні попередні налаштування: {presets}',
      unknownBossPreset: 'Невідомий стиль боса: "{preset}".',
      unknownBossPresetHint: 'Дійсні попередні налаштування: {presets}',
      unknownReinforceAction: 'Невідома дія посилення: "{action}".',
      reinforceActionHint: 'Допустимі дії: дублювати, перераховувати, показувати',
      noReinforcementsToReveal: 'Немає нещодавніх підкріплень.',
      noReinforcementsToRevealHint: 'Спочатку використовуйте !director reinforce duplicate.',
      unknownLayer: 'Невідомий шар: "{layer}".',
      layerHint: 'Дійсні шари: маркер, gm, карта',
      unknownPositionAction: 'Невідома дія позиції: "{action}".',
      positionActionHint: 'Допустимі дії: зберегти, відновити',
      unknownEncounterAction: 'Невідома зустрічна дія: "{action}".',
      encounterActionHint: 'Допустимі дії: збереження, завантаження, видалення, список',
      encounterNameRequired: 'Потрібна назва зустрічі.',
      encounterNameRequiredHint: 'Приклад: !director encounter save goblin-ambush',
      encounterNotFound: 'Зустріч "{name}" не знайдено.',
      encounterNotFoundHint:
        'Використовуйте список зустрічей !director, щоб переглянути збережені зустрічі.',
      unknownResetScope: 'Невідомий діапазон скидання: "{scope}".',
      resetScopeHint: 'Дійсні області: вибрані, сторінка, усі',
      unknownReportAction: 'Невідома дія звіту: "{action}".',
      reportActionHint: 'Допустимі дії: оновити, вибрати, змінити, очистити',
      unknownJournalAction: 'Невідома дія журналу: "{action}".',
      journalActionHint: 'Допустимі дії: перебудувати',
      unknownDeckView: 'Невідомий вигляд колоди: "{view}".',
      deckViewHint: 'Дійсні перегляди: усі, масштабування, позиціонування, адмін',
      unknownConfigKey: 'Невідомий ключ конфігурації: "{key}".',
      configKeyHint: 'Дійсні ключі: hp-bar, ac-bar, language',
      invalidHpBar: 'Недійсна панель HP: "{value}".',
      invalidHpBarHint: 'Дійсні варіанти: {options}',
      invalidAcBar: 'Недійсна панель AC: "{value}".',
      invalidAcBarHint: 'Дійсні варіанти: {options}',
      invalidLanguage: 'Недійсна мова: "{value}".',
      invalidLanguageHint: 'Підтримується: {locales}',
      invalidPartySize: 'Розмір групи має бути числом від 1 до 30 (отримано "{value}").',
      invalidHpPercent: 'Відсоток HP має бути від 1 до 1000 (отримано "{value}"). Приклад: 150',
      invalidAcModifier: 'Модифікатор AC має бути від -10 до +10 (отримано "{value}"). Приклад: +2',
      invalidDamagePercent:
        'Відсоток шкоди має бути від 1 до 1000 (отримано «{value}»). Приклад: 125',
      invalidDuplicateCount:
        'Кількість дублікатів має бути від 1 до 50 (отримано "{value}"). Приклад: 3',
      invalidEncounterName:
        'Недійсна назва зустрічі: "{name}". Імена можуть містити літери, цифри, пробіли, дефіси та підкреслення (максимум 64 символи).',
      invalidEncounterNameHint: 'Приклад: !director encounter save goblin-ambush',
      duplicateBurstLimit:
        'Операція призведе до створення {requested} токенів, що перевищує ліміт у {limit}. Виберіть менше жетонів або використовуйте меншу кількість.',
      unexpectedError: 'Сталася неочікувана помилка: {message}',
      unexpectedErrorHint: 'Перевірте консоль API для отримання деталей.',
    },
    confirm: {
      scalingPresetPending: 'Виберіть маркери, а потім натисніть «Застосувати масштабування».',
      journalsRebuilt: 'Командну колоду та журнал статусу було відновлено.',
      deckUpdated: 'Панель команд було перетворено за допомогою перегляду {view}.',
      reportCleared: 'Звіт очищено.',
      scriptReadyHint:
        'Відкрийте журнал Combat Encounter Director - Command Deck для панелі керування.',
      langSet: 'Вибрано мову {locale}.',
    },
    labels: {
      preset: 'Попереднє налаштування',
      nearestPreset: 'Найближчий пресет',
      hp: 'HP',
      ac: 'AC',
      acModifier: 'Модифікатор змінного струму',
      damage: 'Пошкодження',
      appliedTo: 'Застосовується до',
      copiesPerToken: 'Копії на токен',
      totalCreated: 'Всього створено',
      renamed: 'Перейменовано',
      layer: 'Шар',
      moved: 'Переїхав',
      hidden: 'Прихований',
      revealed: 'Розкрито',
      saved: 'Збережено',
      restored: 'Відновлено',
      noSavedPosition: 'Немає збереженої позиції',
      tokensCaptured: 'Жетони захоплені',
      loaded: 'Завантажено',
      missingTokens: 'Відсутні жетони',
      reset: 'Скинути',
      notTracked: 'Не відслідковується',
      tokensInReport: 'Жетони у звіті',
      selectedTokensInReport: 'Вибрані маркери у звіті',
      changedTokensInReport: 'Змінено токени у звіті',
      hpBar: 'панель HP',
      acBar: 'AC бар',
      language: 'Мова',
      noEncountersSaved: 'Ще немає збережених зустрічей.',
      name: "Ім'я",
      deleted: 'Видалено',
      duplicateFailed: 'Не дублюється',
      duplicateFailedHint:
        'Зображення немає в бібліотеці Roll20 — додайте до своєї бібліотеки або встановіть зображення маркера вручну.',
    },
    ui: {
      applyScalingButton: 'Застосувати масштабування до вибраного',
      partyScaling: 'Масштабування партії',
      customScaling: 'Спеціальне масштабування',
      bossTools: 'Бос Інструменти',
      bossPresetHint: 'Застосувати попередні налаштування до вибраних маркерів',
      reinforcements: 'Підкріплення',
      duplicateSelected: 'Вибрано копію:',
      customDuplicate: 'Спеціальний…',
      autoNumber: 'Вибрано автонумерацію',
      layerVisibility: 'Шар і видимість',
      moveToLayer: 'Перейти до шару:',
      tokenLayer: 'Рівень маркерів',
      gmLayer: 'GM Layer',
      mapLayer: 'Шар карти',
      hideSelected: 'Приховати вибране',
      revealSelected: 'Відкрити вибране',
      revealReinforcements: 'Розкрити на шарі маркерів',
      positionSaving: 'Збереження позиції',
      savePositions: 'Зберегти позиції',
      restorePositions: 'Відновити позиції',
      encounterTemplates: 'Шаблони зустрічей',
      saveEncounter: 'Зберегти зустріч…',
      loadEncounter: 'Завантажити зустріч…',
      deleteEncounter: 'Видалити зустріч…',
      listEncounters: 'Список зустрічей',
      resetRecovery: 'Скидання та відновлення',
      resetSelected: 'Скинути вибране',
      resetPage: 'Скинути сторінку',
      resetAll: 'Скинути все',
      reporting: 'Звітність',
      refreshReport: 'Оновити звіт',
      selectedReport: 'Вибране',
      changedReport: 'Змінено',
      clearReport: 'ясно',
      help: 'Довідка',
      rebuildJournals: 'Перебудувати журнали',
      commandDeck: 'Командна колода',
      deckViewAll: 'все',
      deckViewScaling: 'Масштабування',
      deckViewPositioning: 'Позиціонування',
      deckViewAdmin: 'адмін',
      deckViewLabel: 'Переглянути:',
      partySizeLabel: 'Розмір партії:',
      hpPercentLabel: 'HP %:',
      acModLabel: 'Модифікатор змінного струму:',
      damagePercentLabel: 'Пошкодження %:',
      load: 'навантаження',
      delete: 'Видалити',
      quickActions: 'Швидкі дії',
      config: 'Конфігурація',
      quickActionsDesc:
        'Швидкий доступ до найпопулярніших пресетів масштабування груп і типів босів.',
      partyScalingDesc:
        'Негайно застосовує масштабування до вибраних токенів. Без вибору, розподіляє значення для застосування масштабування.',
      customScalingDesc:
        'Застосовується негайно до вибраних токенів. Спочатку відредагуйте окремі значення, а потім скористайтеся «Застосувати масштабування», якщо не вибрано маркерів.',
      bossToolsDesc:
        'Застосуйте шаблони ролей до вибраних жетонів — Міньйон зменшує статистику, Бос і Легендарний підвищують її.',
      reinforcementsDesc:
        'Дублюйте вибрані маркери на карті та автоматично нумеруйте повторювані назви маркерів.',
      layerVisibilityDesc:
        'Переміщуйте вибрані жетони між шарами або перемикайте їх видимість для гравців.',
      positionSavingDesc:
        'Зробіть знімок позицій маркерів на поточній сторінці та відновіть їх у будь-який час.',
      encounterTemplatesDesc:
        'Збережіть поточний стан сторінки як іменований шаблон і відновіть його в наступних сесіях.',
      resetRecoveryDesc:
        'Відновити відстежувані маркери до початкової статистики та видалити їхні записи відстеження.',
      reportingDesc: 'Оновіть журнал статусу з описом відстежених токенів і застосованих змін.',
      configDesc:
        'Установіть, які панелі маркерів відстежують HP і AC, і виберіть мову інтерфейсу.',
      helpDesc:
        'Перегляньте повну довідку про команди або перебудуйте Command Deck і журнали стану.',
      setHpBar1: 'Встановіть шкалу HP 1',
      setHpBar2: 'Встановіть шкалу HP 2',
      setAcBar2: 'Встановіть AC бар 2',
      disableAc: 'Вимкнути AC',
    },
    report: {
      summary: 'Резюме',
      generated: 'Сформований',
      tokensOnPage: 'Жетони на сторінці',
      trackedTokens: 'Відстежувані токени',
      changed: 'Змінено',
      hiddenGm: 'Прихований (шар GM)',
      bossesLegendary: 'Боси / Легендарний',
      minions: 'Міньйони',
      noTrackedTokens: 'Немає відстежених токенів.',
      tokenCol: 'Токен',
      layerCol: 'Шар',
      hpCol: 'HP',
      acCol: 'AC',
      dmgCol: 'Dmg',
      presetCol: 'Попереднє налаштування',
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
  const SUPPORTED_LOCALE_LIST = SUPPORTED_LOCALES.map((code) => LOCALE_LABELS[code]).join(' / ');

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

  /**
   * Creates a fresh default deck state object.
   *
   * @returns {object} Default deck state.
   */
  function createDefaultDeck() {
    return { view: DEFAULT_DECK_VIEW };
  }

  /**
   * Merges a possibly incomplete deck state with defaults, preserving valid values.
   *
   * @param {object} deck Existing deck state to merge.
   * @returns {object} Complete deck state object.
   */
  function mergeDeckState(deck) {
    const d = isRecord(deck) ? deck : {};
    return {
      view: DECK_VIEW_KEYS.includes(d.view) ? d.view : DEFAULT_DECK_VIEW,
    };
  }

  /**
   * Creates a fresh default configuration object.
   *
   * @returns {object} Default configuration.
   */
  function createDefaultConfig() {
    return {
      hpBar: DEFAULT_HP_BAR,
      acBar: DEFAULT_AC_BAR,
      language: DEFAULT_LOCALE$1,
    };
  }

  /**
   * Ensures the persistent Roll20 state exists and has all required fields.
   *
   * @returns {object} The CombatEncounterDirector state branch.
   */
  function ensureState() {
    if (!isRecord(state[STATE_KEY])) {
      state[STATE_KEY] = {};
    }

    const s = state[STATE_KEY];

    if (!isRecord(s.config)) {
      s.config = createDefaultConfig();
    } else {
      s.config = mergeConfig(s.config);
    }

    if (!isRecord(s.tokens)) {
      s.tokens = {};
    }

    if (!isRecord(s.encounters)) {
      s.encounters = {};
    }

    if (!isRecord(s.deck)) {
      s.deck = createDefaultDeck();
    } else {
      s.deck = mergeDeckState(s.deck);
    }

    if (!Array.isArray(s.lastReinforcementIds)) {
      s.lastReinforcementIds = [];
    }

    s.version = SCRIPT_VERSION;

    return s;
  }

  /**
   * Merges a possibly incomplete config with defaults, preserving valid values.
   *
   * @param {object} config Existing config to merge.
   * @returns {object} Complete config object.
   */
  function mergeConfig(config) {
    const c = isRecord(config) ? config : {};
    const defaults = createDefaultConfig();

    return {
      hpBar: VALID_HP_BARS.includes(c.hpBar) ? c.hpBar : defaults.hpBar,
      acBar: VALID_AC_BARS.includes(c.acBar) ? c.acBar : defaults.acBar,
      language: normalizeLocale(c.language) || defaults.language,
    };
  }

  /**
   * Returns the current configuration.
   *
   * @returns {object} Current configuration.
   */
  function getConfig() {
    return ensureState().config;
  }

  /**
   * Replaces the current configuration with merged values.
   *
   * @param {object} config Partial or full config to apply.
   * @returns {object} The saved configuration.
   */
  function setConfig(config) {
    const s = ensureState();
    s.config = mergeConfig({ ...s.config, ...config });
    return s.config;
  }

  /**
   * Imports Roll20 One-Click useroptions into persisted config when available.
   *
   * @returns {object} The saved configuration.
   */
  function applyGlobalConfig() {
    if (!isRecord(globalconfig)) {
      return getConfig();
    }

    const branch =
      globalconfig[STATE_KEY.toLowerCase()] ||
      globalconfig['combatencounterdirector'] ||
      globalconfig[STATE_KEY];

    if (!isRecord(branch)) {
      return getConfig();
    }

    const options = isRecord(branch.useroptions) ? branch.useroptions : branch;
    const updates = {};

    if (VALID_HP_BARS.includes(options.hpBar)) {
      updates.hpBar = options.hpBar;
    }
    if (VALID_AC_BARS.includes(options.acBar)) {
      updates.acBar = options.acBar;
    }
    const lang = normalizeLocale(options.language);
    if (lang) {
      updates.language = lang;
    }

    return setConfig(updates);
  }

  /**
   * Returns the currently stored Command Deck view key.
   *
   * @returns {string} Deck view key.
   */
  function getDeckView() {
    return ensureState().deck.view;
  }

  /**
   * Saves the active Command Deck view key.
   *
   * @param {string} view Deck view key to persist.
   * @returns {string} The saved view key.
   */
  function setDeckView(view) {
    const s = ensureState();
    s.deck.view = DECK_VIEW_KEYS.includes(view) ? view : DEFAULT_DECK_VIEW;
    return s.deck.view;
  }

  // ---------------------------------------------------------------------------
  // Reinforcement tracking
  // ---------------------------------------------------------------------------

  /**
   * Returns the Roll20 IDs of tokens created by the most recent duplicate operation.
   * Used by the 'reinforce show' command to move that batch to the token layer.
   *
   * @returns {string[]} Array of token IDs.
   */
  function getLastReinforcementIds() {
    return ensureState().lastReinforcementIds;
  }

  /**
   * Persists the IDs of a newly created reinforcement batch.
   *
   * @param {string[]} ids Roll20 token IDs to store.
   */
  function setLastReinforcementIds(ids) {
    ensureState().lastReinforcementIds = Array.isArray(ids) ? [...ids] : [];
  }

  // ---------------------------------------------------------------------------
  // Token state
  // ---------------------------------------------------------------------------

  /**
   * Returns the tracked state record for a token, or null when not tracked.
   *
   * @param {string} tokenId Roll20 graphic ID.
   * @returns {object|null} Token record or null.
   */
  function getTokenRecord(tokenId) {
    const tokens = ensureState().tokens;
    return isRecord(tokens[tokenId]) ? tokens[tokenId] : null;
  }

  /**
   * Returns all tracked token records as an array.
   *
   * @returns {object[]} Array of token records.
   */
  function getAllTokenRecords() {
    return Object.values(ensureState().tokens).filter(isRecord);
  }

  /**
   * Returns tracked token records filtered by a predicate.
   *
   * @param {(record: object) => boolean} predicate Filter function.
   * @returns {object[]} Matching token records.
   */
  function filterTokenRecords(predicate) {
    return getAllTokenRecords().filter(predicate);
  }

  /**
   * Saves or updates a token record in state.
   *
   * @param {string} tokenId Roll20 graphic ID.
   * @param {object} record Token record to save.
   * @returns {object} The saved record.
   */
  function setTokenRecord(tokenId, record) {
    const s = ensureState();
    s.tokens[tokenId] = record;
    return record;
  }

  /**
   * Removes a token record from state.
   *
   * @param {string} tokenId Roll20 graphic ID.
   * @returns {object|null} The removed record, or null.
   */
  function removeTokenRecord(tokenId) {
    const s = ensureState();
    const record = s.tokens[tokenId] || null;
    delete s.tokens[tokenId];
    return record;
  }

  /**
   * Creates a new token record capturing original values.
   *
   * @param {string} tokenId Roll20 graphic ID.
   * @param {object} original Snapshot of original token values.
   * @param {string} pageId Page the token belongs to.
   * @returns {object} New token record.
   */
  function createTokenRecord(tokenId, original, pageId) {
    return {
      tokenId,
      pageId,
      original,
      hpModifier: 100,
      acModifier: 0,
      damageModifier: 100,
      preset: null,
      lastModified: Date.now(),
      lastOperation: '',
    };
  }

  // ---------------------------------------------------------------------------
  // Encounter templates
  // ---------------------------------------------------------------------------

  /**
   * Returns a named encounter template, or null when not found.
   *
   * @param {string} name Encounter template name.
   * @returns {object|null} Encounter template or null.
   */
  function getEncounter(name) {
    const encounters = ensureState().encounters;
    return isRecord(encounters[name]) ? encounters[name] : null;
  }

  /**
   * Returns all saved encounter templates.
   *
   * @returns {object[]} Array of encounter template objects.
   */
  function getAllEncounters() {
    return Object.values(ensureState().encounters).filter(isRecord);
  }

  /**
   * Saves an encounter template under a given name.
   *
   * @param {string} name Template name.
   * @param {object} template Encounter template to save.
   * @returns {object} The saved template.
   */
  function setEncounter(name, template) {
    const s = ensureState();
    s.encounters[name] = template;
    return template;
  }

  /**
   * Deletes a named encounter template.
   *
   * @param {string} name Template name.
   * @returns {boolean} True when the template existed and was deleted.
   */
  function deleteEncounter(name) {
    const s = ensureState();
    if (!isRecord(s.encounters[name])) {
      return false;
    }
    delete s.encounters[name];
    return true;
  }

  // ---------------------------------------------------------------------------
  // Bar read/write — configured bars only
  // ---------------------------------------------------------------------------

  /**
   * Reads the current HP values from a token using the configured HP bar.
   *
   * Returns null for a bar field when the bar has never been set (blank string).
   * Callers must check for null before using the value — writing null back would
   * activate a previously-blank bar and make it visible in the token HUD.
   *
   * @param {Graphic} token Roll20 Graphic object.
   * @returns {{ hp: number|null, maxHp: number|null }}
   *   null = bar is blank; number = bar has an explicit value (may be 0).
   */
  function readTokenHp(token) {
    const { hpBar } = getConfig();
    const hp = readBarSafe(token.get(`${hpBar}_value`));
    const maxHp = readBarSafe(token.get(`${hpBar}_max`));
    return {
      hp: hp.valid ? hp.value : null,
      maxHp: maxHp.valid ? maxHp.value : null,
    };
  }

  /**
   * Reads the current AC value from a token using the configured AC bar.
   *
   * Returns null when AC bar is 'none' or the bar is blank.
   * A null return means the caller must not write an AC value to the token.
   *
   * @param {Graphic} token Roll20 Graphic object.
   * @returns {number|null} AC value, or null when unavailable.
   */
  function readTokenAc(token) {
    const { acBar } = getConfig();
    if (acBar === 'none') {
      return null;
    }
    const result = readBarSafe(token.get(`${acBar}_value`));
    return result.valid ? result.value : null;
  }

  /**
   * Writes HP values to a token using the configured HP bar.
   *
   * No-op when either hp or maxHp is null — a null value means the bar was
   * blank before tracking began and must not be activated by a write.
   *
   * @param {Graphic} token Roll20 Graphic object.
   * @param {number|null} hp Current HP value to set.
   * @param {number|null} maxHp Max HP value to set.
   * @returns {boolean} True when the write occurred.
   */
  function writeTokenHp(token, hp, maxHp) {
    if (hp === null || maxHp === null) {
      return false;
    }
    const { hpBar } = getConfig();
    token.set(`${hpBar}_value`, hp);
    token.set(`${hpBar}_max`, maxHp);
    return true;
  }

  /**
   * Writes an AC value to a token using the configured AC bar.
   *
   * No-op when AC bar is 'none' or ac is null.
   * A null ac means the bar was blank before tracking began.
   *
   * @param {Graphic} token Roll20 Graphic object.
   * @param {number|null} ac AC value to set.
   * @returns {boolean} True when the write occurred.
   */
  function writeTokenAc(token, ac) {
    if (ac === null) {
      return false;
    }
    const { acBar } = getConfig();
    if (acBar === 'none') {
      return false;
    }
    token.set(`${acBar}_value`, ac);
    return true;
  }

  // ---------------------------------------------------------------------------
  // Token record helpers
  // ---------------------------------------------------------------------------

  /**
   * Captures a snapshot of a token's original values for recovery.
   *
   * HP and AC are stored as null when the configured bar is blank — this signals
   * to all restore/scale paths that the bar must not be written to.
   *
   * Only the configured HP and AC bars are read. bar3 (or any unconfigured bar)
   * is intentionally ignored to prevent accidental activation.
   *
   * @param {Graphic} token Roll20 Graphic object.
   * @returns {object} Original value snapshot.
   */
  function captureOriginalValues(token) {
    const { hp, maxHp } = readTokenHp(token);
    return {
      name: token.get('name') || '',
      hp, // null = HP bar was blank when first tracked
      maxHp, // null = HP bar max was blank when first tracked
      ac: readTokenAc(token), // null = AC bar blank or acBar is 'none'
      layer: token.get('layer') || 'objects',
      left: token.get('left') || 0,
      top: token.get('top') || 0,
      width: token.get('width') || 70,
      height: token.get('height') || 70,
    };
  }

  /**
   * Ensures a token has a state record, creating one from current values when absent.
   *
   * @param {Graphic} token Roll20 Graphic object.
   * @returns {object} Existing or newly created token record.
   */
  function ensureTokenRecord(token) {
    const tokenId = token.id;
    const existing = getTokenRecord(tokenId);
    if (existing) {
      return existing;
    }
    const original = captureOriginalValues(token);
    const pageId = getTokenPageId(token);
    const record = createTokenRecord(tokenId, original, pageId);
    setTokenRecord(tokenId, record);
    return record;
  }

  /**
   * Applies HP scaling to a token based on the stored record's modifiers.
   *
   * Skipped when:
   *   - original.maxHp is null (HP bar was blank when captured)
   *   - original.maxHp <= 0 (can't derive a sensible scaled value from zero or negative max)
   *
   * New HP = round(originalMaxHp × (hpModifier / 100)), min 1.
   * Current HP is scaled proportionally to preserve the damage state.
   *
   * @param {Graphic} token Roll20 Graphic object.
   * @param {object} record Token state record.
   * @returns {boolean} True when the write occurred.
   */
  function applyHpToToken(token, record) {
    const { hpModifier, original } = record;

    // Guard: blank bar or zero/negative max HP — do not activate an unused bar.
    if (original.maxHp === null || original.maxHp <= 0) {
      return false;
    }

    const newMax = roundAtLeastOne((original.maxHp * hpModifier) / 100);

    // Preserve the damage ratio: if the token was at 50% HP, keep it at 50%.
    const hpRatio = original.hp !== null && original.hp > 0 ? original.hp / original.maxHp : 1;
    const newHp = roundAtLeastOne(newMax * hpRatio);

    writeTokenHp(token, Math.min(newHp, newMax), newMax);
    return true;
  }

  /**
   * Applies AC scaling to a token based on the stored record's AC modifier.
   *
   * Skipped when original.ac is null (AC bar was blank or acBar is 'none').
   *
   * @param {Graphic} token Roll20 Graphic object.
   * @param {object} record Token state record.
   * @returns {boolean} True when the write occurred.
   */
  function applyAcToToken(token, record) {
    const { acModifier, original } = record;
    if (original.ac === null) {
      return false;
    }
    writeTokenAc(token, original.ac + acModifier);
    return true;
  }

  /**
   * Restores all original values to a token from its state record.
   *
   * Only writes to bars that had explicit values when the record was created.
   * Null values are skipped — they indicate the bar was blank before tracking
   * began, and restoring null would activate the bar unnecessarily.
   *
   * @param {Graphic} token Roll20 Graphic object.
   * @param {object} record Token state record.
   * @returns {void}
   */
  function restoreTokenFromRecord(token, record) {
    const { original } = record;
    writeTokenHp(token, original.hp, original.maxHp);
    writeTokenAc(token, original.ac);
    token.set('name', original.name);
    token.set('layer', original.layer);
    token.set('left', original.left);
    token.set('top', original.top);
  }

  /**
   * Extracts selected token objects from a chat message.
   * Returns an empty array when no tokens are selected.
   *
   * @param {object} msg Roll20 chat message object.
   * @returns {Graphic[]} Array of selected token objects.
   */
  function getSelectedTokens(msg) {
    if (!Array.isArray(msg.selected) || msg.selected.length === 0) {
      return [];
    }
    return msg.selected
      .map((sel) => getGraphicToken(sel._id))
      .filter((token) => token !== null && token.get('subtype') === 'token');
  }

  /**
   * Moves selected tokens to the specified Roll20 layer.
   *
   * @param {object} msg Roll20 chat message.
   * @param {string} layer Target layer ('objects', 'gmlayer', or 'map').
   * @returns {{ moved: string[], invalid: boolean }} Result summary.
   */
  function moveSelectedToLayer(msg, layer) {
    if (!VALID_LAYERS.includes(layer)) {
      return { moved: [], invalid: true };
    }

    const tokens = getSelectedTokens(msg);
    const moved = [];

    for (const token of tokens) {
      token.set('layer', layer);
      moved.push(getTokenName(token));
    }

    return { moved, invalid: false };
  }

  /**
   * Hides selected tokens by moving them to the GM layer.
   * Saves the current layer in the token record so it can be restored.
   *
   * @param {object} msg Roll20 chat message.
   * @returns {{ hidden: string[] }} Result summary.
   */
  function hideSelectedTokens(msg) {
    const tokens = getSelectedTokens(msg);
    const hidden = [];

    for (const token of tokens) {
      const record = ensureTokenRecord(token);
      // Only update the record if the token is not already on the GM layer
      if (token.get('layer') !== LAYER_GM) {
        record.lastOperation = 'hide';
        record.lastModified = Date.now();
        setTokenRecord(token.id, record);
        token.set('layer', LAYER_GM);
      }
      hidden.push(getTokenName(token));
    }

    return { hidden };
  }

  /**
   * Reveals selected tokens by moving them back to the token layer.
   *
   * @param {object} msg Roll20 chat message.
   * @returns {{ revealed: string[] }} Result summary.
   */
  function revealSelectedTokens(msg) {
    const tokens = getSelectedTokens(msg);
    const revealed = [];

    for (const token of tokens) {
      token.set('layer', LAYER_TOKEN);
      const record = getTokenRecord(token.id);
      if (record) {
        record.lastOperation = 'reveal';
        record.lastModified = Date.now();
        setTokenRecord(token.id, record);
      }
      revealed.push(getTokenName(token));
    }

    return { revealed };
  }

  /**
   * Saves the current positions of selected tokens into their state records.
   *
   * @param {object} msg Roll20 chat message.
   * @returns {{ saved: string[] }} Result summary.
   */
  function saveSelectedPositions(msg) {
    const tokens = getSelectedTokens(msg);
    const saved = [];

    for (const token of tokens) {
      const record = ensureTokenRecord(token);
      record.savedPosition = {
        left: token.get('left'),
        top: token.get('top'),
        layer: token.get('layer'),
      };
      record.lastOperation = 'position:save';
      record.lastModified = Date.now();
      setTokenRecord(token.id, record);
      saved.push(getTokenName(token));
    }

    return { saved };
  }

  /**
   * Restores the saved positions of selected tokens from their state records.
   *
   * @param {object} msg Roll20 chat message.
   * @returns {{ restored: string[], noSave: string[] }} Result summary.
   */
  function restoreSelectedPositions(msg) {
    const tokens = getSelectedTokens(msg);
    const restored = [];
    const noSave = [];

    for (const token of tokens) {
      const record = getTokenRecord(token.id);
      if (!record?.savedPosition) {
        noSave.push(getTokenName(token));
        continue;
      }
      token.set('left', record.savedPosition.left);
      token.set('top', record.savedPosition.top);
      token.set('layer', record.savedPosition.layer || LAYER_TOKEN);
      record.lastOperation = 'position:restore';
      record.lastModified = Date.now();
      setTokenRecord(token.id, record);
      restored.push(getTokenName(token));
    }

    return { restored, noSave };
  }

  /**
   * Returns the boss preset configuration for a given key.
   *
   * @param {string} presetKey Preset key (e.g. 'boss', 'elite').
   * @returns {object|null} Preset config or null when not found.
   */
  function resolveBossPreset(presetKey) {
    return BOSS_PRESETS[presetKey] || null;
  }

  /**
   * Returns true when the given key is a valid boss preset identifier.
   *
   * @param {string} key Key to test.
   * @returns {boolean} True when valid.
   */
  function isValidBossPreset(key) {
    return VALID_BOSS_PRESETS.has(key);
  }

  /**
   * Applies a boss preset to a single token.
   *
   * - 'set' hpMode: overrides HP to a fixed value (e.g. Minion → 1 HP).
   *   Skipped when the token's HP bar was blank when first tracked.
   * - 'percent' hpMode: scales HP/maxHP from the original max HP.
   *   Skipped when original.maxHp is null (blank bar) or <= 0.
   * AC is adjusted by the preset's flat modifier.
   *   Skipped when original.ac is null (blank bar or acBar is 'none').
   *
   * @param {Graphic} token Roll20 Graphic object.
   * @param {object} preset Boss preset config.
   * @param {string} presetKey Boss preset key for record tagging.
   * @returns {object} Updated token record.
   */
  function applyBossPresetToToken(token, preset, presetKey) {
    const record = ensureTokenRecord(token);

    if (preset.hpMode === 'set') {
      // Minion: force HP to a fixed value — only when the HP bar was present.
      if (record.original.maxHp !== null) {
        writeTokenHp(token, preset.hp, preset.hp);
        record.hpModifier = preset.hp === 1 ? -999 : preset.hp; // flag for report display
      }
    } else {
      // percent mode: scale from original max HP.
      // Guard: blank bar (null) or zero/negative max means we cannot derive a value.
      if (record.original.maxHp !== null && record.original.maxHp > 0) {
        const newMax = roundAtLeastOne((record.original.maxHp * preset.hp) / 100);
        const hpRatio =
          record.original.hp !== null && record.original.hp > 0
            ? record.original.hp / record.original.maxHp
            : 1;
        const newHp = roundAtLeastOne(newMax * hpRatio);
        writeTokenHp(token, Math.min(newHp, newMax), newMax);
        record.hpModifier = preset.hp;
      }
    }

    // Apply AC modifier — skipped when original.ac is null (blank bar or 'none').
    if (record.original.ac !== null) {
      const newAc = record.original.ac + preset.ac;
      const { acBar } = getConfig();
      if (acBar !== 'none') {
        token.set(`${acBar}_value`, newAc);
      }
      record.acModifier = preset.ac;
    }

    record.damageModifier = preset.damage;
    record.preset = presetKey;
    record.lastModified = Date.now();
    record.lastOperation = `boss:${presetKey}`;

    setTokenRecord(token.id, record);
    return record;
  }

  /**
   * Applies a boss preset to all selected tokens.
   *
   * @param {object} msg Roll20 chat message.
   * @param {string} presetKey Boss preset key.
   * @returns {{ applied: string[], preset: object|null }} Result summary.
   */
  function applyBossPresetToSelected(msg, presetKey) {
    const preset = resolveBossPreset(presetKey);
    if (!preset) {
      return { applied: [], preset: null };
    }

    const tokens = getSelectedTokens(msg);
    const applied = [];
    for (const token of tokens) {
      applyBossPresetToToken(token, preset, presetKey);
      applied.push(getTokenName(token));
    }

    return { applied, preset };
  }

  // ---------------------------------------------------------------------------
  // Bar snapshot helpers
  //
  // Encounters save/restore only the bars this mod manages (configured HP bar
  // and configured AC bar). Writing to an unmanaged bar — even writing 0 —
  // activates it in the Roll20 token HUD. To prevent that:
  //
  //   • snapshots store null for blank/absent bar values
  //   • loadEncounter skips writing any null or undefined snapshot value
  //   • loadEncounter only touches configured bars, never bar3 (or whichever
  //     bar is not assigned to HP or AC in the current config)
  // ---------------------------------------------------------------------------

  /**
   * Reads a token bar value for snapshotting.
   * Returns null when the bar is blank so that loadEncounter can skip the write.
   *
   * @param {Graphic} token Roll20 Graphic object.
   * @param {string} barName e.g. 'bar1'.
   * @param {string} field 'value' or 'max'.
   * @returns {number|null}
   */
  function snapshotBar(token, barName, field) {
    const result = readBarSafe(token.get(`${barName}_${field}`));
    return result.valid ? result.value : null;
  }

  /**
   * Saves the current state of all tokens on the given page as an encounter template.
   *
   * Only the configured HP bar and AC bar are snapshotted. Unmanaged bars are not
   * stored, so they are never restored on load and therefore never activated.
   *
   * @param {string} name Encounter template name.
   * @param {string} [pageId] Page to snapshot. Defaults to the first GM's current page.
   * @returns {{ saved: boolean, tokenCount: number, name: string }} Result summary.
   */
  function saveEncounter(name, pageId) {
    const resolvedPageId = pageId || getCurrentPageId();
    const allTokens = getTokensOnPage(resolvedPageId);
    const { hpBar, acBar } = getConfig();

    const tokenSnapshots = allTokens.map((token) => {
      const record = getTokenRecord(token.id);

      // Only snapshot the bars this mod manages. null = bar was blank.
      const snapshot = {
        tokenId: token.id,
        name: token.get('name') || '',
        layer: token.get('layer') || 'objects',
        left: token.get('left') || 0,
        top: token.get('top') || 0,
        imgsrc: token.get('imgsrc') || '',
        hpBar,
        acBar,
        [`${hpBar}_value`]: snapshotBar(token, hpBar, 'value'),
        [`${hpBar}_max`]: snapshotBar(token, hpBar, 'max'),
        hpModifier: record?.hpModifier ?? 100,
        acModifier: record?.acModifier ?? 0,
        damageModifier: record?.damageModifier ?? 100,
        preset: record?.preset ?? null,
        original: record?.original ?? captureOriginalValues(token),
      };

      if (acBar !== 'none') {
        snapshot[`${acBar}_value`] = snapshotBar(token, acBar, 'value');
      }

      return snapshot;
    });

    const template = {
      name,
      pageId: resolvedPageId,
      savedAt: Date.now(),
      tokens: tokenSnapshots,
    };

    setEncounter(name, template);
    return { saved: true, tokenCount: tokenSnapshots.length, name };
  }

  /**
   * Loads a named encounter template, restoring token positions, layers, and stats.
   *
   * Only tokens that still exist on the page by their original Roll20 ID are restored.
   * Missing tokens are counted in the result but are NOT recreated — encounter load is
   * a state-restore operation, not a token-creation operation.
   *
   * Bar restoration rules:
   *   - Only the bars configured as HP and AC at save time are ever touched.
   *   - Null values (bars that were blank when saved) are not written — writing null
   *     or 0 to a blank bar would activate it and make it visible in the token HUD.
   *   - For snapshots saved with the old format (flat bar1/2/3 keys), only the
   *     configured bars from the current config are restored; others are skipped.
   *
   * @param {string} name Encounter template name.
   * @returns {{ loaded: boolean, restored: number, missing: number, notFound: boolean }} Result summary.
   */
  function loadEncounter(name) {
    const template = getEncounter(name);
    if (!template) {
      return { loaded: false, restored: 0, missing: 0, notFound: true };
    }

    const { hpBar: currentHpBar, acBar: currentAcBar } = getConfig();

    let restored = 0;
    let missing = 0;

    for (const snapshot of template.tokens) {
      const token = getGraphicToken(snapshot.tokenId);
      if (!token) {
        missing++;
        continue;
      }

      // Restore position and layer — these are safe, no bar activation risk.
      token.set('name', snapshot.name);
      token.set('layer', snapshot.layer);
      token.set('left', snapshot.left);
      token.set('top', snapshot.top);

      // Determine which bar names were used as HP/AC at save time.
      // Fall back to current config for snapshots saved before hpBar/acBar were recorded.
      const savedHpBar = snapshot.hpBar || currentHpBar;
      const savedAcBar = snapshot.acBar || currentAcBar;

      // Restore HP bar — value and max are written as an atomic pair.
      // Writing _max without _value (or vice versa) is enough to activate a
      // previously-blank bar in the Roll20 token HUD. Both must be non-null to
      // write either. Only restores when the snapshot used the current HP bar.
      if (savedHpBar === currentHpBar) {
        const hpValue = snapshot[`${savedHpBar}_value`];
        const hpMax = snapshot[`${savedHpBar}_max`];
        if (hpValue !== null && hpValue !== undefined && hpMax !== null && hpMax !== undefined) {
          token.set(`${savedHpBar}_value`, hpValue);
          token.set(`${savedHpBar}_max`, hpMax);
        }
      }

      // Restore AC bar (value only — AC bars have no meaningful max).
      // Skipped when the AC value was null (bar was blank when saved).
      if (savedAcBar !== 'none' && savedAcBar === currentAcBar) {
        const acValue = snapshot[`${savedAcBar}_value`];
        if (acValue !== null && acValue !== undefined) {
          token.set(`${savedAcBar}_value`, acValue);
        }
      }

      // Restore the state record.
      const tokenPageId = getTokenPageId(token);
      const record = createTokenRecord(snapshot.tokenId, snapshot.original, tokenPageId);
      record.hpModifier = snapshot.hpModifier;
      record.acModifier = snapshot.acModifier;
      record.damageModifier = snapshot.damageModifier;
      record.preset = snapshot.preset;
      record.lastOperation = `encounter:load:${name}`;
      record.lastModified = Date.now();
      setTokenRecord(snapshot.tokenId, record);

      restored++;
    }

    return { loaded: true, restored, missing, notFound: false };
  }

  /**
   * Deletes a named encounter template.
   *
   * @param {string} name Encounter template name.
   * @returns {{ deleted: boolean, name: string }} Result summary.
   */
  function deleteEncounterTemplate(name) {
    const deleted = deleteEncounter(name);
    return { deleted, name };
  }

  /**
   * Returns all saved encounter template names.
   *
   * @returns {string[]} Template names sorted alphabetically.
   */
  function listEncounterNames() {
    return getAllEncounters()
      .map((e) => e.name)
      .sort();
  }

  // ---------------------------------------------------------------------------
  // Style constants shared across journal sections
  // ---------------------------------------------------------------------------

  const BTN = [
    `background:${COLOR_BUTTON_BG}`,
    `color:${COLOR_BUTTON_TEXT}`,
    'padding:2px 8px',
    'border-radius:3px',
    'text-decoration:none',
    'font-size:0.85em',
    'display:inline-block',
    'margin:1px 2px',
    'font-weight:bold',
  ].join(';');

  const BTN_DARK = [
    'background:#2a3a5c',
    `color:${COLOR_TEXT}`,
    'border:1px solid #4a5a7a',
    'padding:2px 8px',
    'border-radius:3px',
    'text-decoration:none',
    'font-size:0.85em',
    'display:inline-block',
    'margin:1px 2px',
  ].join(';');

  const BTN_TAB_ACTIVE = [
    `background:${COLOR_ACCENT}`,
    `color:${COLOR_BUTTON_TEXT}`,
    'padding:2px 8px',
    'border-radius:3px',
    'font-weight:bold',
    'font-size:0.85em',
    'display:inline-block',
    'margin:1px 2px',
  ].join(';');

  const SECTION_HEADER = [
    'background:#1e2d4a',
    `color:${COLOR_ACCENT}`,
    'padding:3px 6px',
    'font-variant:small-caps',
    'font-weight:bold',
    'font-size:0.9em',
    'letter-spacing:0.05em',
    `border-left:3px solid ${COLOR_ACCENT}`,
    'margin:6px 0 3px 0',
  ].join(';');

  const SECTION_BODY = 'padding:2px 4px 4px 4px';

  const SECTION_DESC_STYLE = [
    `color:${COLOR_MUTED}`,
    'font-size:0.8em',
    'padding:1px 6px 5px 6px',
    'line-height:1.4',
  ].join(';');

  const DIVIDER = `<hr style="border:none;border-top:1px solid ${COLOR_BORDER};margin:4px 0">`;

  /**
   * Builds a primary action button anchor.
   *
   * @param {string} label Button text.
   * @param {string} command !director command.
   * @param {boolean} [dark=false] Use dark/secondary button style.
   * @returns {string} HTML anchor string.
   */
  function btn(label, command, dark) {
    const style = dark ? BTN_DARK : BTN;
    return `<a href="${escapeHtml(command)}" style="${style}">${escapeHtml(label)}</a>`;
  }

  /**
   * Builds a section header div.
   *
   * @param {string} title Section title.
   * @returns {string} HTML div string.
   */
  function section(title) {
    return `<div style="${SECTION_HEADER}">${escapeHtml(title)}</div>`;
  }

  /**
   * Builds a section description paragraph — shown directly beneath the section
   * heading and above the first row of buttons.
   *
   * @param {string} text Description text (plain, will be escaped).
   * @returns {string} HTML div string.
   */
  function desc(text) {
    return `<div style="${SECTION_DESC_STYLE}">${escapeHtml(text)}</div>`;
  }

  // ---------------------------------------------------------------------------
  // Deck tab bar
  // ---------------------------------------------------------------------------

  /**
   * Returns the i18n label for a deck view key.
   *
   * @param {string} key Deck view key.
   * @param {string} lang Locale code.
   * @returns {string} Translated label.
   */
  function deckViewLabel(key, lang) {
    const map = {
      all: t('ui.deckViewAll', lang),
      scaling: t('ui.deckViewScaling', lang),
      positioning: t('ui.deckViewPositioning', lang),
      admin: t('ui.deckViewAdmin', lang),
    };
    return map[key] || DECK_VIEWS[key]?.label || key;
  }

  /**
   * Builds the pseudo-tab row shown at the top of every Command Deck view.
   * The active tab is a non-clickable highlighted span; inactive tabs are buttons.
   *
   * @param {string} activeView Currently active deck view key.
   * @param {string} lang Locale code.
   * @returns {string} HTML string.
   */
  function buildDeckTabs(activeView, lang) {
    const tabs = DECK_VIEW_KEYS.map((key) => {
      const label = deckViewLabel(key, lang);
      if (key === activeView) {
        return `<span style="${BTN_TAB_ACTIVE}">${escapeHtml(label)}</span>`;
      }
      return btn(label, `${COMMAND} deck ${key}`, true);
    });
    return `<div style="padding:4px 4px 2px 4px">${tabs.join('')}</div>`;
  }

  // ---------------------------------------------------------------------------
  // Section renderers
  // ---------------------------------------------------------------------------

  function buildQuickActionsSection(lang) {
    const parts = [
      section(t('ui.quickActions', lang)),
      desc(t('ui.quickActionsDesc', lang)),
      `<div style="${SECTION_BODY}"><div>`,
    ];
    for (const [key, preset] of Object.entries(PARTY_PRESETS)) {
      parts.push(btn(preset.label, `${COMMAND} scale preset ${key}`));
    }
    parts.push('</div><div style="margin-top:3px">');
    for (const [key, preset] of Object.entries(BOSS_PRESETS)) {
      parts.push(btn(preset.label, `${COMMAND} boss ${key}`));
    }
    parts.push('</div></div>');
    return parts.join('');
  }

  function buildPartyScalingSection(lang) {
    const parts = [
      section(t('ui.partyScaling', lang)),
      desc(t('ui.partyScalingDesc', lang)),
      `<div style="${SECTION_BODY}">`,
    ];
    parts.push('<div style="margin-bottom:3px">');
    for (const [key, preset] of Object.entries(PARTY_PRESETS)) {
      parts.push(btn(preset.label, `${COMMAND} scale preset ${key}`));
    }
    parts.push('</div>');
    parts.push(
      `<div style="color:${COLOR_MUTED};font-size:0.8em;margin-bottom:2px">${escapeHtml(t('ui.partySizeLabel', lang))}</div>`
    );
    parts.push('<div>');
    for (const size of [1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20]) {
      parts.push(btn(String(size), `${COMMAND} scale party ${size}`, true));
    }
    parts.push('</div></div>');
    return parts.join('');
  }

  function buildCustomScalingSection(lang) {
    const parts = [
      section(t('ui.customScaling', lang)),
      desc(t('ui.customScalingDesc', lang)),
      `<div style="${SECTION_BODY}">`,
    ];

    parts.push(
      `<div style="color:${COLOR_MUTED};font-size:0.8em">${escapeHtml(t('ui.hpPercentLabel', lang))}</div><div>`
    );
    for (const pct of [25, 50, 75, 100, 125, 150, 175, 200, 300]) {
      parts.push(btn(`${pct}%`, `${COMMAND} scale hp ${pct}`, pct === 100));
    }
    parts.push('</div>');

    parts.push(
      `<div style="color:${COLOR_MUTED};font-size:0.8em;margin-top:3px">${escapeHtml(t('ui.acModLabel', lang))}</div><div>`
    );
    for (const mod of [-3, -2, -1, 0, 1, 2, 3, 4, 5]) {
      const label = mod >= 0 ? `+${mod}` : String(mod);
      parts.push(btn(label, `${COMMAND} scale ac ${mod}`, mod === 0));
    }
    parts.push('</div>');

    parts.push(
      `<div style="color:${COLOR_MUTED};font-size:0.8em;margin-top:3px">${escapeHtml(t('ui.damagePercentLabel', lang))}</div><div>`
    );
    for (const pct of [50, 75, 100, 125, 150, 200]) {
      parts.push(btn(`${pct}%`, `${COMMAND} scale damage ${pct}`, pct === 100));
    }
    parts.push('</div>');

    parts.push('</div>');
    return parts.join('');
  }

  function buildBossToolsSection(lang) {
    const parts = [
      section(t('ui.bossTools', lang)),
      desc(t('ui.bossToolsDesc', lang)),
      `<div style="${SECTION_BODY}"><div>`,
    ];
    for (const [key, preset] of Object.entries(BOSS_PRESETS)) {
      parts.push(btn(preset.label, `${COMMAND} boss ${key}`));
    }
    parts.push('</div>');
    parts.push(
      `<div style="color:${COLOR_MUTED};font-size:0.75em;margin-top:2px">${escapeHtml(t('ui.bossPresetHint', lang))}</div>`
    );
    parts.push('</div>');
    return parts.join('');
  }

  function buildReinforcementsSection(lang) {
    const parts = [
      section(t('ui.reinforcements', lang)),
      desc(t('ui.reinforcementsDesc', lang)),
      `<div style="${SECTION_BODY}">`,
    ];
    parts.push(
      `<div style="color:${COLOR_MUTED};font-size:0.8em">${escapeHtml(t('ui.duplicateSelected', lang))}</div><div>`
    );
    for (const count of DUPLICATE_OPTIONS) {
      parts.push(btn(`×${count}`, `${COMMAND} reinforce duplicate ${count}`));
    }
    parts.push(
      `${btn(t('ui.customDuplicate', lang), `${COMMAND} reinforce duplicate ?{Copies|3}`)}</div>`
    );
    parts.push(
      `<div style="margin-top:3px">${btn(t('ui.autoNumber', lang), `${COMMAND} reinforce enumerate`, true)}</div>`
    );
    parts.push('</div>');
    return parts.join('');
  }

  function buildLayerVisibilitySection(lang) {
    const parts = [
      section(t('ui.layerVisibility', lang)),
      desc(t('ui.layerVisibilityDesc', lang)),
      `<div style="${SECTION_BODY}">`,
    ];
    parts.push(
      `<div style="color:${COLOR_MUTED};font-size:0.8em">${escapeHtml(t('ui.moveToLayer', lang))}</div><div>`
    );
    parts.push(btn(t('ui.tokenLayer', lang), `${COMMAND} layer token`));
    parts.push(btn(t('ui.gmLayer', lang), `${COMMAND} layer gm`));
    parts.push(btn(t('ui.mapLayer', lang), `${COMMAND} layer map`));
    parts.push('</div><div style="margin-top:3px">');
    parts.push(btn(t('ui.hideSelected', lang), `${COMMAND} hide`));
    parts.push(btn(t('ui.revealSelected', lang), `${COMMAND} reveal`));
    parts.push('</div></div>');
    return parts.join('');
  }

  function buildPositionSavingSection(lang) {
    return [
      section(t('ui.positionSaving', lang)),
      desc(t('ui.positionSavingDesc', lang)),
      `<div style="${SECTION_BODY}"><div>`,
      btn(t('ui.savePositions', lang), `${COMMAND} position save`, true),
      btn(t('ui.restorePositions', lang), `${COMMAND} position restore`, true),
      '</div></div>',
    ].join('');
  }

  function buildEncounterTemplatesSection(lang) {
    return [
      section(t('ui.encounterTemplates', lang)),
      desc(t('ui.encounterTemplatesDesc', lang)),
      `<div style="${SECTION_BODY}"><div>`,
      btn(
        t('ui.saveEncounter', lang),
        `${COMMAND} encounter save ?{${t('ui.encounterTemplates', lang)}|my-encounter}`
      ),
      btn(
        t('ui.loadEncounter', lang),
        `${COMMAND} encounter load ?{${t('ui.encounterTemplates', lang)}}`
      ),
      btn(
        t('ui.deleteEncounter', lang),
        `${COMMAND} encounter delete ?{${t('ui.encounterTemplates', lang)}}`,
        true
      ),
      btn(t('ui.listEncounters', lang), `${COMMAND} encounter list`, true),
      '</div></div>',
    ].join('');
  }

  function buildResetRecoverySection(lang) {
    return [
      section(t('ui.resetRecovery', lang)),
      desc(t('ui.resetRecoveryDesc', lang)),
      `<div style="${SECTION_BODY}"><div>`,
      btn(t('ui.resetSelected', lang), `${COMMAND} reset selected`),
      btn(t('ui.resetPage', lang), `${COMMAND} reset page`),
      btn(t('ui.resetAll', lang), `${COMMAND} reset all`),
      '</div></div>',
    ].join('');
  }

  function buildReportingSection(lang) {
    return [
      section(t('ui.reporting', lang)),
      desc(t('ui.reportingDesc', lang)),
      `<div style="${SECTION_BODY}"><div>`,
      btn(t('ui.refreshReport', lang), `${COMMAND} report refresh`),
      btn(t('ui.selectedReport', lang), `${COMMAND} report selected`, true),
      btn(t('ui.changedReport', lang), `${COMMAND} report changed`, true),
      btn(t('ui.clearReport', lang), `${COMMAND} report clear`, true),
      '</div></div>',
    ].join('');
  }

  function buildConfigSection(lang) {
    const parts = [
      section(t('ui.config', lang)),
      desc(t('ui.configDesc', lang)),
      `<div style="${SECTION_BODY}">`,
    ];

    parts.push(
      `<div style="color:${COLOR_MUTED};font-size:0.8em">${escapeHtml(t('labels.hpBar', lang))}</div><div>`
    );
    parts.push(btn('Bar 1', `${COMMAND} config hp-bar bar1`, true));
    parts.push(btn('Bar 2', `${COMMAND} config hp-bar bar2`, true));
    parts.push(btn('Bar 3', `${COMMAND} config hp-bar bar3`, true));
    parts.push('</div>');

    parts.push(
      `<div style="color:${COLOR_MUTED};font-size:0.8em;margin-top:3px">${escapeHtml(t('labels.acBar', lang))}</div><div>`
    );
    parts.push(btn('Bar 1', `${COMMAND} config ac-bar bar1`, true));
    parts.push(btn('Bar 2', `${COMMAND} config ac-bar bar2`, true));
    parts.push(btn('Bar 3', `${COMMAND} config ac-bar bar3`, true));
    parts.push(btn(t('ui.disableAc', lang), `${COMMAND} config ac-bar none`, true));
    parts.push('</div></div>');
    return parts.join('');
  }

  function buildHelpSection(lang) {
    return [
      section(t('ui.help', lang)),
      desc(t('ui.helpDesc', lang)),
      `<div style="${SECTION_BODY}"><div>`,
      btn(t('ui.help', lang), `${COMMAND} help`, true),
      btn(t('ui.rebuildJournals', lang), `${COMMAND} journal rebuild`, true),
      '</div></div>',
    ].join('');
  }

  // ---------------------------------------------------------------------------
  // Section registry — maps section keys to renderer functions
  // ---------------------------------------------------------------------------

  const SECTION_RENDERERS = {
    quickActions: buildQuickActionsSection,
    partyScaling: buildPartyScalingSection,
    customScaling: buildCustomScalingSection,
    bossTools: buildBossToolsSection,
    reinforcements: buildReinforcementsSection,
    layerVisibility: buildLayerVisibilitySection,
    positionSaving: buildPositionSavingSection,
    encounterTemplates: buildEncounterTemplatesSection,
    resetRecovery: buildResetRecoverySection,
    reporting: buildReportingSection,
    config: buildConfigSection,
    help: buildHelpSection,
  };

  const DECK_VIEW_SECTIONS = {
    all: [
      'quickActions',
      'partyScaling',
      'customScaling',
      'bossTools',
      'reinforcements',
      'layerVisibility',
      'positionSaving',
      'encounterTemplates',
      'resetRecovery',
      'reporting',
      'config',
      'help',
    ],
    scaling: ['quickActions', 'partyScaling', 'customScaling', 'bossTools'],
    positioning: ['reinforcements', 'layerVisibility', 'positionSaving', 'encounterTemplates'],
    admin: ['resetRecovery', 'reporting', 'config', 'help'],
  };

  // ---------------------------------------------------------------------------
  // Command Deck builder
  // ---------------------------------------------------------------------------

  /**
   * Builds the header block for the Command Deck.
   *
   * @param {string} activeView Currently active deck view key.
   * @param {string} lang Locale code.
   * @returns {string} HTML string.
   */
  function buildDeckHeader(activeView, lang) {
    const viewLabel = deckViewLabel(activeView, lang);
    return [
      `<div style="background:${COLOR_HEADER_BG};color:${COLOR_HEADER_TEXT};padding:6px 10px;text-align:center;font-variant:small-caps;font-weight:bold;font-size:1.1em;letter-spacing:0.1em;border-bottom:2px solid ${COLOR_ACCENT}">`,
      `${escapeHtml(SCRIPT_NAME)} v${escapeHtml(SCRIPT_VERSION)}`,
      '</div>',
      `<div style="padding:2px 6px 0 6px;font-size:0.75em;color:${COLOR_MUTED};text-align:right">`,
      `${escapeHtml(t('ui.deckViewLabel', lang))} ${escapeHtml(viewLabel)}`,
      '</div>',
    ].join('');
  }

  /**
   * Builds the full HTML for the Command Deck journal in the given view.
   *
   * @param {string} [view] Deck view key. Defaults to DEFAULT_DECK_VIEW.
   * @returns {string} HTML string.
   */
  function buildCommandDeck(view = DEFAULT_DECK_VIEW) {
    const lang = getConfig().language;
    const activeView = DECK_VIEW_KEYS.includes(view) ? view : DEFAULT_DECK_VIEW;
    const sectionKeys = DECK_VIEW_SECTIONS[activeView];

    const sectionHtml = sectionKeys
      .map((key, i) => {
        const renderer = SECTION_RENDERERS[key];
        if (!renderer) return '';
        const html = renderer(lang);
        // Add a divider between sections (not after the last one)
        return i < sectionKeys.length - 1 ? html + DIVIDER : html;
      })
      .join('');

    return [buildDeckHeader(activeView, lang), buildDeckTabs(activeView, lang), sectionHtml].join(
      ''
    );
  }

  // ---------------------------------------------------------------------------
  // Journal installation
  // ---------------------------------------------------------------------------

  /**
   * Creates or updates the Command Deck handout.
   * Migrates the old 'Combat Encounter Director' handout name if found.
   *
   * @param {string} [view] Deck view to render. Defaults to DEFAULT_DECK_VIEW.
   * @returns {void}
   */
  function installControlPanelHandout(view = DEFAULT_DECK_VIEW) {
    const html = buildCommandDeck(view);

    // Migrate old journal name from before the Command Deck rename.
    const OLD_PANEL_NAME = 'Combat Encounter Director';
    const legacy = findObjs({ type: 'handout', name: OLD_PANEL_NAME })[0];
    if (legacy) {
      legacy.set('name', JOURNAL_PANEL_NAME);
      legacy.set('notes', html);
      return;
    }

    const existing = findObjs({ type: 'handout', name: JOURNAL_PANEL_NAME })[0];
    if (existing) {
      existing.set('notes', html);
    } else {
      createObj('handout', { name: JOURNAL_PANEL_NAME, notes: html });
    }
  }

  /**
   * Creates or clears the status journal handout with placeholder content.
   *
   * @returns {void}
   */
  function installStatusHandout() {
    const placeholder = `<p style="color:${COLOR_MUTED};font-style:italic">Run <strong>!director report refresh</strong> to populate this report.</p>`;
    const existing = findObjs({ type: 'handout', name: JOURNAL_STATUS_NAME })[0];
    if (!existing) {
      createObj('handout', { name: JOURNAL_STATUS_NAME, notes: placeholder });
    }
  }

  // ---------------------------------------------------------------------------
  // HTML builders for the status journal
  // ---------------------------------------------------------------------------

  const TABLE_STYLE = 'width:100%;border-collapse:collapse;font-size:0.85em';
  const SUMMARY_TABLE_STYLE = 'width:100%;border-collapse:collapse;font-size:0.9em';
  const SUMMARY_TD_LABEL_STYLE = `padding:3px 8px 3px 0;color:${COLOR_MUTED}`;
  const SUMMARY_TD_VALUE_STYLE = `padding:3px 0 3px 8px;color:${COLOR_TEXT};font-weight:bold;text-align:right`;
  const TH_STYLE = [
    `background:${COLOR_HEADER_BG}`,
    `color:${COLOR_HEADER_TEXT}`,
    'padding:3px 5px',
    'text-align:left',
    'font-variant:small-caps',
    'font-size:0.9em',
  ].join(';');
  const TD_STYLE = `padding:2px 5px;border-bottom:1px solid ${COLOR_BORDER};color:${COLOR_TEXT}`;
  const TD_CHANGED_STYLE = `padding:2px 5px;border-bottom:1px solid ${COLOR_BORDER};color:${COLOR_CHANGED};font-weight:bold`;
  const TD_MUTED_STYLE = `padding:2px 5px;border-bottom:1px solid ${COLOR_BORDER};color:${COLOR_MUTED}`;

  /**
   * Returns a human-readable layer name using the active locale.
   *
   * @param {string} layer Roll20 layer identifier.
   * @param {string} lang Locale code.
   * @returns {string} Display name.
   */
  function layerLabel(layer, lang) {
    switch (layer) {
      case LAYER_TOKEN:
        return t('ui.tokenLayer', lang);
      case LAYER_GM:
        return t('ui.gmLayer', lang);
      case LAYER_MAP:
        return t('ui.mapLayer', lang);
      default:
        return layer || '—';
    }
  }

  /**
   * Builds an HTML table row for a single tracked token.
   *
   * @param {object} record Token state record.
   * @param {Graphic|null} token Live token object (or null if deleted).
   * @param {string} lang Locale code.
   * @returns {string} HTML tr string.
   */
  function buildTokenRow(record, token, lang) {
    const name = token
      ? escapeHtml(getTokenName(token))
      : `<em style="color:${COLOR_MUTED}">—</em>`;
    const layer = token
      ? layerLabel(token.get('layer'), lang)
      : `<em style="color:${COLOR_MUTED}">[deleted]</em>`;

    const hpChanged = record.hpModifier !== 100;
    const acChanged = record.acModifier !== 0;
    const dmgChanged = record.damageModifier !== 100;

    const hpCell = hpChanged
      ? `<td style="${TD_CHANGED_STYLE}">${formatPct(record.hpModifier)}</td>`
      : `<td style="${TD_MUTED_STYLE}">—</td>`;

    const acCell = acChanged
      ? `<td style="${TD_CHANGED_STYLE}">${formatMod(record.acModifier)}</td>`
      : `<td style="${TD_MUTED_STYLE}">—</td>`;

    const dmgCell = dmgChanged
      ? `<td style="${TD_CHANGED_STYLE}">${formatPct(record.damageModifier)}</td>`
      : `<td style="${TD_MUTED_STYLE}">—</td>`;

    const presetCell = record.preset
      ? `<td style="${TD_CHANGED_STYLE}">${escapeHtml(record.preset)}</td>`
      : `<td style="${TD_MUTED_STYLE}">—</td>`;

    return [
      '<tr>',
      `<td style="${TD_STYLE}">${name}</td>`,
      `<td style="${TD_MUTED_STYLE}">${token ? escapeHtml(layer) : layer}</td>`,
      hpCell,
      acCell,
      dmgCell,
      presetCell,
      '</tr>',
    ].join('');
  }

  /**
   * Builds the full HTML content for the status journal handout.
   *
   * @param {object[]} records Token records to include in the report.
   * @param {{ pageId: string, generatedAt: number, totalOnPage: number }} meta Report metadata.
   * @returns {string} HTML string suitable for a Roll20 handout.
   */
  function buildStatusReportHtml(records, meta) {
    const lang = getConfig().language;

    const trackedCount = records.length;
    const changedCount = records.filter(
      (r) => r.hpModifier !== 100 || r.acModifier !== 0 || r.damageModifier !== 100 || r.preset
    ).length;
    const hiddenCount = records.filter((r) => {
      const token = getGraphicToken(r.tokenId);
      return token?.get('layer') === LAYER_GM;
    }).length;
    const bossCount = records.filter((r) => ['boss', 'legendary'].includes(r.preset)).length;
    const minionCount = records.filter((r) => r.preset === 'minion').length;

    const cardStyle = [
      `background-image:-webkit-linear-gradient(135deg,${COLOR_CARD_BG_TOP} 0%,${COLOR_CARD_BG_BOTTOM} 100%)`,
      'border-radius:4px',
      'padding:6px 8px',
      'margin-bottom:8px',
      `border:1px solid ${COLOR_BORDER}`,
    ].join(';');

    const summaryHtml = [
      `<div style="${cardStyle}">`,
      `<div style="font-weight:bold;font-size:1.05em;color:${COLOR_HEADER_TEXT};margin-bottom:4px">${escapeHtml(t('report.summary', lang))}</div>`,
      `<table style="${SUMMARY_TABLE_STYLE}">`,
      buildSummaryRow(t('report.generated', lang), formatTimestamp(meta.generatedAt)),
      buildSummaryRow(t('report.tokensOnPage', lang), String(meta.totalOnPage)),
      buildSummaryRow(t('report.trackedTokens', lang), String(trackedCount)),
      buildSummaryRow(t('report.changed', lang), String(changedCount), COLOR_CHANGED),
      buildSummaryRow(t('report.hiddenGm', lang), String(hiddenCount)),
      buildSummaryRow(t('report.bossesLegendary', lang), String(bossCount)),
      buildSummaryRow(t('report.minions', lang), String(minionCount)),
      '</table>',
      '</div>',
    ].join('');

    if (records.length === 0) {
      return (
        summaryHtml +
        `<p style="color:${COLOR_MUTED};font-style:italic">${escapeHtml(t('report.noTrackedTokens', lang))}</p>`
      );
    }

    const tableHtml = [
      `<table style="${TABLE_STYLE}">`,
      '<thead><tr>',
      `<th style="${TH_STYLE}">${escapeHtml(t('report.tokenCol', lang))}</th>`,
      `<th style="${TH_STYLE}">${escapeHtml(t('report.layerCol', lang))}</th>`,
      `<th style="${TH_STYLE}">${escapeHtml(t('report.hpCol', lang))}</th>`,
      `<th style="${TH_STYLE}">${escapeHtml(t('report.acCol', lang))}</th>`,
      `<th style="${TH_STYLE}">${escapeHtml(t('report.dmgCol', lang))}</th>`,
      `<th style="${TH_STYLE}">${escapeHtml(t('report.presetCol', lang))}</th>`,
      '</tr></thead>',
      '<tbody>',
      ...records.map((record) => buildTokenRow(record, getGraphicToken(record.tokenId), lang)),
      '</tbody>',
      '</table>',
    ].join('');

    return summaryHtml + tableHtml;
  }

  /**
   * Builds a summary key-value row.
   *
   * @param {string} label Key label.
   * @param {string} value Value string.
   * @param {string} [valueColor] Optional color override for the value.
   * @returns {string} HTML string.
   */
  function buildSummaryRow(label, value, valueColor) {
    const valStyle = valueColor
      ? `padding:2px 0;color:${valueColor};font-weight:bold;text-align:right`
      : SUMMARY_TD_VALUE_STYLE;
    return [
      '<tr>',
      `<td style="${SUMMARY_TD_LABEL_STYLE}">${escapeHtml(label)}</td>`,
      `<td style="${valStyle}">${escapeHtml(value)}</td>`,
      '</tr>',
    ].join('');
  }

  /**
   * Writes or updates the Combat Encounter Director Status handout.
   *
   * @param {string} content HTML content to write into the handout notes.
   * @returns {void}
   */
  function updateStatusHandout(content) {
    const existing = findObjs({ type: 'handout', name: JOURNAL_STATUS_NAME })[0];
    if (existing) {
      existing.set('notes', content);
    } else {
      createObj('handout', {
        name: JOURNAL_STATUS_NAME,
        notes: content,
      });
    }
  }

  /**
   * Generates and writes a status report for all tracked tokens on a page.
   *
   * @param {string} [pageId] Page to report on. Pass the commanding GM's page ID
   *   (via getPlayerPageId) to avoid the wrong-GM-page issue in multi-GM games.
   *   Defaults to the first GM's current page.
   * @returns {{ tokenCount: number }} Result summary.
   */
  function refreshStatusReport(pageId) {
    const resolvedPageId = pageId || getCurrentPageId();
    const allPageTokens = getTokensOnPage(resolvedPageId);
    const records = filterTokenRecords((r) => r.pageId === resolvedPageId);

    const html = buildStatusReportHtml(records, {
      generatedAt: Date.now(),
      totalOnPage: allPageTokens.length,
    });

    updateStatusHandout(html);
    return { tokenCount: records.length };
  }

  /**
   * Generates and writes a status report for a specific set of token records.
   *
   * @param {object[]} records Token records to report on.
   * @param {string} [pageId] Page ID for the "tokens on page" summary count.
   *   Defaults to the first GM's current page.
   * @returns {void}
   */
  function writeFilteredReport(records, pageId) {
    const resolvedPageId = pageId || getCurrentPageId();
    const allPageTokens = getTokensOnPage(resolvedPageId);

    const html = buildStatusReportHtml(records, {
      generatedAt: Date.now(),
      totalOnPage: allPageTokens.length,
    });

    updateStatusHandout(html);
  }

  /**
   * Generates a status report limited to currently selected tokens.
   *
   * @param {object} msg Roll20 chat message.
   * @param {string} [pageId] Page ID for the summary count.
   * @returns {{ tokenCount: number }} Result summary.
   */
  function reportSelectedTokens(msg, pageId) {
    const tokens = getSelectedTokens(msg);
    const records = tokens.map((tok) => getTokenRecord(tok.id)).filter(Boolean);

    writeFilteredReport(records, pageId);
    return { tokenCount: records.length };
  }

  /**
   * Generates a status report for all tokens that have been modified.
   *
   * @param {string} [pageId] Page ID for the summary count.
   * @returns {{ tokenCount: number }} Result summary.
   */
  function reportChangedTokens(pageId) {
    const records = filterTokenRecords(
      (r) => r.hpModifier !== 100 || r.acModifier !== 0 || r.damageModifier !== 100 || r.preset
    );
    writeFilteredReport(records, pageId);
    return { tokenCount: records.length };
  }

  /**
   * Clears the status journal content.
   *
   * @returns {void}
   */
  function clearStatusReport() {
    const lang = getConfig().language;
    const emptyHtml = `<p style="color:${COLOR_MUTED};font-style:italic">${escapeHtml(t('confirm.reportCleared', lang))}</p>`;
    updateStatusHandout(emptyHtml);
  }

  /**
   * Duplicates a single token N times, placing copies offset from the original.
   *
   * Each copy is placed 70px (one grid square) to the right of the previous,
   * wrapping after 5 copies to avoid running off screen.
   *
   * @param {Graphic} token Roll20 Graphic object to duplicate.
   * @param {number} count Number of copies to create.
   * @param {number} [startIndex=1] Index offset for enumerating names.
   * @returns {Graphic[]} Newly created token objects (may be fewer than count when
   *   Roll20 rejects the imgsrc for non-library images).
   */
  function duplicateToken(token, count, startIndex) {
    const copies = [];
    const baseName = stripEnumeration(token.get('name') || 'Token');
    const baseLeft = token.get('left') || 0;
    const baseTop = token.get('top') || 0;
    const width = token.get('width') || 70;
    const pageId = getTokenPageId(token);

    // Collect the properties we want to copy.
    // imgsrc is included so that tokens backed by the user's own Roll20 Library
    // get their image copied. Roll20 requires imgsrc to be present and valid for
    // createObj to succeed — omitting it causes creation to fail for all tokens.
    // For non-library images (marketplace, compendium) Roll20 logs a console error
    // and createObj returns undefined; these are counted as failures by the caller.
    const copyProps = [
      'imgsrc',
      'layer',
      'width',
      'height',
      'bar1_value',
      'bar1_max',
      'bar2_value',
      'bar2_max',
      'bar3_value',
      'bar3_max',
      'represents',
      'statusmarkers',
      'tint_color',
      'aura1_radius',
      'aura1_color',
      'aura1_square',
      'aura2_radius',
      'aura2_color',
      'aura2_square',
      'showname',
      'showplayers_name',
      'showplayers_bar1',
      'showplayers_bar2',
      'showplayers_bar3',
      'light_radius',
      'light_dimradius',
      'light_hassight',
      'light_angle',
      'light_losangle',
      'light_multiplier',
    ];

    const tokenProps = {};
    for (const prop of copyProps) {
      tokenProps[prop] = token.get(prop);
    }

    // Convert the imgsrc to the thumb format Roll20's createObj requires.
    if (tokenProps.imgsrc) {
      tokenProps.imgsrc = getCleanImgsrc(tokenProps.imgsrc);
    }

    // Reinforcement duplicates are placed on the GM layer so the GM can review
    // and position them before revealing to players. Use the 'Reveal on Token Layer'
    // button in the confirmation whisper to move them when ready.
    tokenProps.layer = 'gmlayer';

    const idx = 1;

    for (let i = 0; i < count; i++) {
      const copyNumber = idx + i;
      const colOffset = copyNumber % 5;
      const rowOffset = Math.floor(copyNumber / 5);

      const newToken = createObj('graphic', {
        ...tokenProps,
        _pageid: pageId,
        subtype: 'token',
        name: `${baseName} ${copyNumber + 1}`,
        left: baseLeft + (colOffset + 1) * width,
        top: baseTop + rowOffset * width,
      });

      if (newToken) {
        const original = captureOriginalValues(newToken);
        const record = createTokenRecord(newToken.id, original, pageId);
        record.lastOperation = `reinforce:duplicate`;
        setTokenRecord(newToken.id, record);
        copies.push(newToken);
      }
    }

    return copies;
  }

  /**
   * Duplicates each selected token N times.
   *
   * The total number of new tokens is capped at MAX_TOTAL_DUPLICATES to prevent
   * accidental bursts when many tokens are selected.
   *
   * @param {object} msg Roll20 chat message.
   * @param {number} count Number of copies per selected token.
   * @returns {{ created: number, createdIds: string[], names: string[], failedNames: string[], failedCount: number, limitHit: boolean }}
   *   created     — total tokens actually placed on the map.
   *   createdIds  — Roll20 IDs of every successfully created token, used by the
   *                 caller to store a reference for the "Reveal on Token Layer" command.
   *   names       — display strings for tokens that were duplicated successfully.
   *   failedNames — display strings (with copy count) for tokens that produced
   *                 zero copies (Roll20 rejected the imgsrc — image not in the
   *                 user's library).
   *   failedCount — total number of copies that were attempted but not created.
   */
  function duplicateSelectedTokens(msg, count) {
    const tokens = getSelectedTokens(msg);
    if (tokens.length === 0) {
      return {
        created: 0,
        createdIds: [],
        names: [],
        failedNames: [],
        failedCount: 0,
        limitHit: false,
      };
    }

    const totalRequested = tokens.length * count;
    if (totalRequested > MAX_TOTAL_DUPLICATES) {
      return {
        created: 0,
        createdIds: [],
        names: [],
        failedNames: [],
        failedCount: 0,
        limitHit: true,
        limit: MAX_TOTAL_DUPLICATES,
        requested: totalRequested,
      };
    }

    const names = [];
    const failedNames = [];
    const createdIds = [];
    let totalCreated = 0;
    let totalFailed = 0;

    for (const token of tokens) {
      const copies = duplicateToken(token, count);
      const baseName = stripEnumeration(token.get('name') || 'Token');
      if (copies.length > 0) {
        totalCreated += copies.length;
        for (const copy of copies) {
          createdIds.push(copy.id);
        }
        names.push(`${baseName} (×${copies.length})`);
      } else {
        // createObj returned undefined for every attempt — Roll20 rejected the
        // imgsrc (not in the user's library). No tokens were placed on the map.
        totalFailed += count;
        failedNames.push(`${baseName} (×${count})`);
      }
    }

    return {
      created: totalCreated,
      createdIds,
      names,
      failedNames,
      failedCount: totalFailed,
      limitHit: false,
    };
  }

  /**
   * Auto-numbers all selected tokens using a shared base name.
   *
   * Strips any existing trailing number from each token name, then renames
   * all selected tokens as "Name 1", "Name 2", etc., using the name of the
   * first selected token as the base.
   *
   * @param {object} msg Roll20 chat message.
   * @returns {{ renamed: string[] }} Result summary.
   */
  function enumerateSelectedTokens(msg) {
    const tokens = getSelectedTokens(msg);
    if (tokens.length === 0) {
      return { renamed: [] };
    }

    const baseName = stripEnumeration(tokens[0].get('name') || 'Token');
    const renamed = [];

    for (let i = 0; i < tokens.length; i++) {
      const newName = `${baseName} ${i + 1}`;
      tokens[i].set('name', newName);
      renamed.push(newName);
    }

    return { renamed };
  }

  /**
   * Strips trailing enumeration (numbers and spaces) from a token name.
   *
   * Example: "Goblin 3" → "Goblin", "Orc Warrior 12" → "Orc Warrior"
   *
   * @param {string} name Token name.
   * @returns {string} Base name without trailing number.
   */
  function stripEnumeration(name) {
    return name.replace(/\s+\d+$/, '').trim();
  }

  /**
   * Parses and validates a duplication count from a string argument.
   * Rejects partial matches such as "3copies".
   *
   * @param {string} raw Raw argument value.
   * @returns {{ valid: boolean, value?: number, message?: string }} Parsed result.
   */
  function parseDuplicateCount(raw) {
    const n = parseStrictInt(raw);
    if (!Number.isFinite(n) || n < 1 || n > 50) {
      return {
        valid: false,
        message: `Duplicate count must be between 1 and 50 (got "${raw}"). Example: 3`,
      };
    }
    return { valid: true, value: n };
  }

  /**
   * Resets selected tokens to their original values and removes their state records.
   *
   * @param {object} msg Roll20 chat message.
   * @returns {{ reset: string[], notTracked: string[] }} Result summary.
   */
  function resetSelectedTokens(msg) {
    const tokens = getSelectedTokens(msg);
    const reset = [];
    const notTracked = [];

    for (const token of tokens) {
      const record = removeTokenRecord(token.id);
      if (!record) {
        notTracked.push(getTokenName(token));
        continue;
      }
      restoreTokenFromRecord(token, record);
      reset.push(getTokenName(token));
    }

    return { reset, notTracked };
  }

  /**
   * Resets all tracked tokens across all pages.
   *
   * @returns {{ reset: number, missing: number }} Result summary.
   */
  function resetAllTokens() {
    const records = getAllTokenRecords();
    let reset = 0;
    let missing = 0;

    for (const record of records) {
      const token = getGraphicToken(record.tokenId);
      removeTokenRecord(record.tokenId);
      if (!token) {
        missing++;
        continue;
      }
      restoreTokenFromRecord(token, record);
      reset++;
    }

    return { reset, missing };
  }

  /**
   * Resets all tracked tokens on a page.
   *
   * @param {string} [pageId] Page to reset. Pass the commanding GM's page ID
   *   (via getPlayerPageId) to avoid the wrong-GM-page issue in multi-GM games.
   *   Defaults to the first GM's current page.
   * @returns {{ reset: number, missing: number }} Result summary.
   */
  function resetCurrentPageTokens(pageId) {
    const resolvedPageId = pageId || getCurrentPageId();
    const records = filterTokenRecords((r) => r.pageId === resolvedPageId);

    let reset = 0;
    let missing = 0;

    for (const record of records) {
      const token = getGraphicToken(record.tokenId);
      removeTokenRecord(record.tokenId);
      if (!token) {
        missing++;
        continue;
      }
      restoreTokenFromRecord(token, record);
      reset++;
    }

    return { reset, missing };
  }

  /**
   * Resolves a named party preset to a scaling object.
   *
   * @param {string} presetKey Preset key (e.g. 'standard', 'large').
   * @returns {object|null} Preset object or null when not found.
   */
  function resolvePartyPreset(presetKey) {
    return PARTY_PRESETS[presetKey] || null;
  }

  /**
   * Returns the party preset whose size is nearest to the given party size.
   *
   * @param {number} partySize Number of players.
   * @returns {object} Nearest preset.
   */
  function resolvePartyPresetBySize(partySize) {
    const presets = Object.values(PARTY_PRESETS);
    return presets.reduce((best, preset) => {
      const bestDelta = Math.abs(best.partySize - partySize);
      const thisDelta = Math.abs(preset.partySize - partySize);
      return thisDelta < bestDelta ? preset : best;
    });
  }

  /**
   * Applies a scaling profile to one token, updating its state record and token bars.
   *
   * @param {Graphic} token Roll20 Graphic object.
   * @param {{ hp: number, ac: number, damage: number }} profile Scaling values.
   * @param {string} [operation] Description of the operation for the audit log.
   * @returns {object} Updated token record.
   */
  function applyScalingToToken(token, profile, operation) {
    const record = ensureTokenRecord(token);

    record.hpModifier = profile.hp;
    record.acModifier = profile.ac;
    record.damageModifier = profile.damage;
    record.lastModified = Date.now();
    record.lastOperation = operation;

    applyHpToToken(token, record);
    applyAcToToken(token, record);

    setTokenRecord(token.id, record);
    return record;
  }

  /**
   * Applies a scaling profile to all selected tokens.
   *
   * @param {object} msg Roll20 chat message.
   * @param {{ hp: number, ac: number, damage: number }} profile Scaling values.
   * @param {string} [label] Human-readable label for feedback messages.
   * @returns {{ applied: string[], skipped: number }} Result summary.
   */
  function applyScalingToSelected(msg, profile, label) {
    const tokens = getSelectedTokens(msg);
    if (tokens.length === 0) {
      return { applied: [], skipped: 0 };
    }

    const applied = [];
    for (const token of tokens) {
      applyScalingToToken(token, profile, label || 'scale');
      applied.push(getTokenName(token));
    }

    return { applied, skipped: 0 };
  }

  /**
   * Parses and validates a party size integer from a string argument.
   * Rejects partial matches such as "6players".
   *
   * @param {string} raw Raw argument value.
   * @returns {{ valid: boolean, value?: number, message?: string }} Parsed result.
   */
  function parsePartySize(raw) {
    const n = parseStrictInt(raw);
    if (!Number.isFinite(n) || n < 1 || n > 30) {
      return {
        valid: false,
        message: `Party size must be a number between 1 and 30 (got "${raw}").`,
      };
    }
    return { valid: true, value: n };
  }

  /**
   * Parses and validates an HP percentage from a string argument.
   * A trailing '%' is stripped before parsing. Rejects partial matches.
   *
   * @param {string} raw Raw argument value (e.g. '150' or '150%').
   * @returns {{ valid: boolean, value?: number, message?: string }} Parsed result.
   */
  function parseHpPercent(raw) {
    const cleaned = String(raw)
      .replace(/^(\d+)%$/, '$1')
      .trim();
    const n = parseStrictInt(cleaned);
    if (!Number.isFinite(n) || n < 1 || n > 1000) {
      return {
        valid: false,
        message: `HP percentage must be between 1 and 1000 (got "${raw}"). Example: 150`,
      };
    }
    return { valid: true, value: n };
  }

  /**
   * Parses and validates an AC modifier from a string argument.
   * A leading '+' is stripped before parsing. Rejects partial matches.
   *
   * @param {string} raw Raw argument value (e.g. '+2', '-1', '0').
   * @returns {{ valid: boolean, value?: number, message?: string }} Parsed result.
   */
  function parseAcModifier(raw) {
    const cleaned = String(raw).replace(/^\+/, '').trim();
    const n = parseStrictInt(cleaned);
    if (!Number.isFinite(n) || n < -10 || n > 10) {
      return {
        valid: false,
        message: `AC modifier must be between -10 and +10 (got "${raw}"). Example: +2`,
      };
    }
    return { valid: true, value: n };
  }

  /**
   * Parses and validates a damage percentage from a string argument.
   * A trailing '%' is stripped before parsing. Rejects partial matches.
   *
   * @param {string} raw Raw argument value.
   * @returns {{ valid: boolean, value?: number, message?: string }} Parsed result.
   */
  function parseDamagePercent(raw) {
    const cleaned = String(raw)
      .replace(/^(\d+)%$/, '$1')
      .trim();
    const n = parseStrictInt(cleaned);
    if (!Number.isFinite(n) || n < 1 || n > 1000) {
      return {
        valid: false,
        message: `Damage percentage must be between 1 and 1000 (got "${raw}"). Example: 125`,
      };
    }
    return { valid: true, value: n };
  }

  /**
   * Returns true when the given string is a valid party preset key.
   *
   * @param {string} key Preset key to test.
   * @returns {boolean} True when valid.
   */
  function isValidPartyPreset(key) {
    return VALID_PARTY_PRESETS.has(key);
  }

  // ---------------------------------------------------------------------------
  // Pending scaling state (per-player session state — not persisted)
  // ---------------------------------------------------------------------------

  /** @type {Map<string, { hp: number, ac: number, damage: number }>} */
  const pendingScaling = new Map();

  /**
   * Returns the pending scaling profile for a player, defaulting to 100/0/100.
   *
   * @param {string} playerId Player ID.
   * @returns {{ hp: number, ac: number, damage: number }} Pending scaling.
   */
  function getPendingScaling(playerId) {
    return pendingScaling.get(playerId) || { hp: 100, ac: 0, damage: 100 };
  }

  /**
   * Updates one or more fields in the pending scaling profile for a player.
   *
   * @param {string} playerId Player ID.
   * @param {object} updates Partial update ({ hp, ac, damage }).
   * @returns {{ hp: number, ac: number, damage: number }} Updated pending scaling.
   */
  function updatePendingScaling(playerId, updates) {
    const current = getPendingScaling(playerId);
    const next = { ...current, ...updates };
    pendingScaling.set(playerId, next);
    return next;
  }

  /**
   * Returns the current locale for a player, from the persisted config.
   *
   * @returns {string} Locale code.
   */
  function locale() {
    return getConfig().language;
  }

  // ---------------------------------------------------------------------------
  // Entry point
  // ---------------------------------------------------------------------------

  /**
   * Handles incoming chat messages, routing !director commands to sub-handlers.
   *
   * @param {object} msg Roll20 chat message object.
   * @returns {void}
   */
  function handleInput(msg) {
    if (msg.type !== 'api') {
      return;
    }

    const rawContent = msg.content || '';
    if (!rawContent.startsWith(COMMAND)) {
      return;
    }

    if (!playerIsGM(msg.playerid)) {
      return;
    }

    const args = rawContent.slice(COMMAND.length).trim().split(/\s+/).filter(Boolean);
    const playerId = msg.playerid;

    try {
      routeCommand(msg, args, playerId);
    } catch (error) {
      log(`[${SCRIPT_NAME}] Command error: ${error.message}`);
      whisperError(
        playerId,
        t('errors.unexpectedError', locale(), { message: error.message }),
        t('errors.unexpectedErrorHint', locale())
      );
    }
  }

  /**
   * Routes a parsed command to the appropriate handler.
   *
   * @param {object} msg Roll20 chat message.
   * @param {string[]} args Command arguments (subcommands and parameters).
   * @param {string} playerId GM player ID.
   * @returns {void}
   */
  function routeCommand(msg, args, playerId) {
    const [sub, ...rest] = args;

    if (!sub) {
      showMainMenu(playerId);
      return;
    }

    switch (sub) {
      case 'scale':
        handleScale(msg, rest, playerId);
        break;
      case 'boss':
        handleBoss(msg, rest, playerId);
        break;
      case 'reinforce':
        handleReinforce(msg, rest, playerId);
        break;
      case 'layer':
        handleLayer(msg, rest, playerId);
        break;
      case 'hide':
        handleHide(msg, playerId);
        break;
      case 'reveal':
        handleReveal(msg, playerId);
        break;
      case 'position':
        handlePosition(msg, rest, playerId);
        break;
      case 'encounter':
        handleEncounter(msg, rest, playerId);
        break;
      case 'reset':
        handleReset(msg, rest, playerId);
        break;
      case 'report':
        handleReport(msg, rest, playerId);
        break;
      case 'deck':
        handleDeck(rest, playerId);
        break;
      case 'journal':
        handleJournal(rest, playerId);
        break;
      case 'config':
        handleConfig(rest, playerId);
        break;
      case 'help':
        showHelp(playerId);
        break;
      default:
        whisperError(
          playerId,
          t('errors.unknownCommand', locale(), { sub }),
          t('errors.unknownCommandHint', locale())
        );
    }
  }

  // ---------------------------------------------------------------------------
  // Sub-handlers
  // ---------------------------------------------------------------------------

  /**
   * Handles !director scale ... commands.
   *
   * @param {object} msg Roll20 chat message.
   * @param {string[]} args Remaining arguments after 'scale'.
   * @param {string} playerId GM player ID.
   * @returns {void}
   */
  function handleScale(msg, args, playerId) {
    const [action, value] = args;
    const lang = locale();

    switch (action) {
      case 'preset': {
        if (!isValidPartyPreset(value)) {
          whisperError(
            playerId,
            t('errors.unknownPartyPreset', lang, { preset: value }),
            t('errors.partyPresetHint', lang, { presets: Object.keys(PARTY_PRESETS).join(', ') })
          );
          return;
        }
        const preset = resolvePartyPreset(value);
        updatePendingScaling(playerId, { hp: preset.hp, ac: preset.ac, damage: preset.damage });
        const tokens = getSelectedTokens(msg);
        if (tokens.length > 0) {
          const result = applyScalingToSelected(msg, preset, `preset:${value}`);
          whisper(
            playerId,
            t('titles.scalingApplied', lang),
            [
              buildRow(t('labels.preset', lang), preset.label),
              buildRow(t('labels.hp', lang), `${preset.hp}%`),
              buildRow(t('labels.ac', lang), formatMod(preset.ac)),
              buildRow(t('labels.damage', lang), `${preset.damage}%`),
              buildDivider(),
              buildRow(t('labels.appliedTo', lang), `${result.applied.length}`),
            ].join('')
          );
        } else {
          whisper(
            playerId,
            t('titles.scalingPresetReady', lang),
            [
              buildRow(t('labels.hp', lang), `${preset.hp}%`),
              buildRow(t('labels.ac', lang), formatMod(preset.ac)),
              buildRow(t('labels.damage', lang), `${preset.damage}%`),
              buildDivider(),
              `<div style="font-size:0.85em">${escapeHtml(t('confirm.scalingPresetPending', lang))}</div>`,
              buildButton(t('ui.applyScalingButton', lang), `${COMMAND} scale apply`),
            ].join('')
          );
        }
        break;
      }

      case 'party': {
        const parsed = parsePartySize(value);
        if (!parsed.valid) {
          whisperError(
            playerId,
            t('errors.invalidPartySize', lang, { value }),
            `Example: ${COMMAND} scale party 6`
          );
          return;
        }
        const preset = resolvePartyPresetBySize(parsed.value);
        updatePendingScaling(playerId, { hp: preset.hp, ac: preset.ac, damage: preset.damage });
        const tokens = getSelectedTokens(msg);
        if (tokens.length > 0) {
          const result = applyScalingToSelected(msg, preset, `party:${parsed.value}`);
          whisper(
            playerId,
            t('titles.scalingApplied', lang),
            [
              buildRow(t('labels.nearestPreset', lang), preset.label),
              buildRow(t('labels.hp', lang), `${preset.hp}%`),
              buildRow(t('labels.ac', lang), formatMod(preset.ac)),
              buildRow(t('labels.damage', lang), `${preset.damage}%`),
              buildDivider(),
              buildRow(t('labels.appliedTo', lang), `${result.applied.length}`),
            ].join('')
          );
        } else {
          whisper(
            playerId,
            t('titles.partySize', lang, { size: parsed.value }),
            [
              buildRow(t('labels.nearestPreset', lang), preset.label),
              buildRow(t('labels.hp', lang), `${preset.hp}%`),
              buildRow(t('labels.ac', lang), formatMod(preset.ac)),
              buildRow(t('labels.damage', lang), `${preset.damage}%`),
              buildDivider(),
              `<div style="font-size:0.85em">${escapeHtml(t('confirm.scalingPresetPending', lang))}</div>`,
              buildButton(t('ui.applyScalingButton', lang), `${COMMAND} scale apply`),
            ].join('')
          );
        }
        break;
      }

      case 'hp': {
        const parsed = parseHpPercent(value);
        if (!parsed.valid) {
          whisperError(
            playerId,
            t('errors.invalidHpPercent', lang, { value }),
            `Example: ${COMMAND} scale hp 150`
          );
          return;
        }
        const next = updatePendingScaling(playerId, { hp: parsed.value });
        const tokens = getSelectedTokens(msg);
        if (tokens.length > 0) {
          const result = applyScalingToSelected(msg, next, 'scale:hp');
          whisper(
            playerId,
            t('titles.scalingApplied', lang),
            [
              buildRow(t('labels.hp', lang), `${next.hp}%`),
              buildRow(t('labels.ac', lang), formatMod(next.ac)),
              buildRow(t('labels.damage', lang), `${next.damage}%`),
              buildDivider(),
              buildRow(t('labels.appliedTo', lang), `${result.applied.length}`),
            ].join('')
          );
        } else {
          whisper(
            playerId,
            t('titles.hpUpdated', lang),
            [
              buildRow(t('labels.hp', lang), `${next.hp}%`),
              buildRow(t('labels.ac', lang), formatMod(next.ac)),
              buildRow(t('labels.damage', lang), `${next.damage}%`),
              buildDivider(),
              buildButton(t('ui.applyScalingButton', lang), `${COMMAND} scale apply`),
            ].join('')
          );
        }
        break;
      }

      case 'ac': {
        const parsed = parseAcModifier(value);
        if (!parsed.valid) {
          whisperError(
            playerId,
            t('errors.invalidAcModifier', lang, { value }),
            `Example: ${COMMAND} scale ac +2`
          );
          return;
        }
        const next = updatePendingScaling(playerId, { ac: parsed.value });
        const tokens = getSelectedTokens(msg);
        if (tokens.length > 0) {
          const result = applyScalingToSelected(msg, next, 'scale:ac');
          whisper(
            playerId,
            t('titles.scalingApplied', lang),
            [
              buildRow(t('labels.hp', lang), `${next.hp}%`),
              buildRow(t('labels.ac', lang), formatMod(next.ac)),
              buildRow(t('labels.damage', lang), `${next.damage}%`),
              buildDivider(),
              buildRow(t('labels.appliedTo', lang), `${result.applied.length}`),
            ].join('')
          );
        } else {
          whisper(
            playerId,
            t('titles.acUpdated', lang),
            [
              buildRow(t('labels.hp', lang), `${next.hp}%`),
              buildRow(t('labels.ac', lang), formatMod(next.ac)),
              buildRow(t('labels.damage', lang), `${next.damage}%`),
              buildDivider(),
              buildButton(t('ui.applyScalingButton', lang), `${COMMAND} scale apply`),
            ].join('')
          );
        }
        break;
      }

      case 'damage': {
        const parsed = parseDamagePercent(value);
        if (!parsed.valid) {
          whisperError(
            playerId,
            t('errors.invalidDamagePercent', lang, { value }),
            `Example: ${COMMAND} scale damage 125`
          );
          return;
        }
        const next = updatePendingScaling(playerId, { damage: parsed.value });
        const tokens = getSelectedTokens(msg);
        if (tokens.length > 0) {
          const result = applyScalingToSelected(msg, next, 'scale:damage');
          whisper(
            playerId,
            t('titles.scalingApplied', lang),
            [
              buildRow(t('labels.hp', lang), `${next.hp}%`),
              buildRow(t('labels.ac', lang), formatMod(next.ac)),
              buildRow(t('labels.damage', lang), `${next.damage}%`),
              buildDivider(),
              buildRow(t('labels.appliedTo', lang), `${result.applied.length}`),
            ].join('')
          );
        } else {
          whisper(
            playerId,
            t('titles.damageUpdated', lang),
            [
              buildRow(t('labels.hp', lang), `${next.hp}%`),
              buildRow(t('labels.ac', lang), formatMod(next.ac)),
              buildRow(t('labels.damage', lang), `${next.damage}%`),
              buildDivider(),
              buildButton(t('ui.applyScalingButton', lang), `${COMMAND} scale apply`),
            ].join('')
          );
        }
        break;
      }

      case 'apply': {
        const tokens = getSelectedTokens(msg);
        if (tokens.length === 0) {
          whisperWarning(playerId, t('errors.noTokensSelected', lang));
          return;
        }
        const profile = getPendingScaling(playerId);
        const result = applyScalingToSelected(msg, profile, 'scale:apply');
        whisper(
          playerId,
          t('titles.scalingApplied', lang),
          [
            buildRow(t('labels.hp', lang), `${profile.hp}%`),
            buildRow(t('labels.ac', lang), formatMod(profile.ac)),
            buildRow(t('labels.damage', lang), `${profile.damage}%`),
            buildDivider(),
            buildRow(t('labels.appliedTo', lang), `${result.applied.length}`),
          ].join('')
        );
        break;
      }

      default:
        whisperError(
          playerId,
          t('errors.unknownScaleAction', lang, { action }),
          t('errors.scaleActionHint', lang)
        );
    }
  }

  /**
   * Handles !director boss ... commands.
   *
   * @param {object} msg Roll20 chat message.
   * @param {string[]} args Remaining arguments after 'boss'.
   * @param {string} playerId GM player ID.
   * @returns {void}
   */
  function handleBoss(msg, args, playerId) {
    const [presetKey] = args;
    const lang = locale();

    if (!presetKey) {
      whisperError(
        playerId,
        t('errors.missingBossPreset', lang),
        t('errors.missingBossPresetHint', lang, { presets: Object.keys(BOSS_PRESETS).join(', ') })
      );
      return;
    }

    if (!isValidBossPreset(presetKey)) {
      whisperError(
        playerId,
        t('errors.unknownBossPreset', lang, { preset: presetKey }),
        t('errors.unknownBossPresetHint', lang, { presets: Object.keys(BOSS_PRESETS).join(', ') })
      );
      return;
    }

    const tokens = getSelectedTokens(msg);
    if (tokens.length === 0) {
      whisperWarning(playerId, t('errors.noTokensSelected', lang));
      return;
    }

    const result = applyBossPresetToSelected(msg, presetKey);
    const preset = resolveBossPreset(presetKey);

    whisper(
      playerId,
      t('titles.bossPreset', lang, { preset: preset.label }),
      [
        buildRow(
          t('labels.hp', lang),
          preset.hpMode === 'set' ? `Set to ${preset.hp}` : `${preset.hp}%`
        ),
        buildRow(
          t('labels.acModifier', lang),
          preset.ac >= 0 ? `+${preset.ac}` : String(preset.ac)
        ),
        buildRow(t('labels.damage', lang), `${preset.damage}%`),
        buildDivider(),
        buildRow(t('labels.appliedTo', lang), `${result.applied.length}`),
      ].join('')
    );
  }

  /**
   * Handles !director reinforce ... commands.
   *
   * @param {object} msg Roll20 chat message.
   * @param {string[]} args Remaining arguments after 'reinforce'.
   * @param {string} playerId GM player ID.
   * @returns {void}
   */
  function handleReinforce(msg, args, playerId) {
    const [action, value] = args;
    const lang = locale();

    switch (action) {
      case 'duplicate': {
        const parsed = parseDuplicateCount(value);
        if (!parsed.valid) {
          whisperError(
            playerId,
            t('errors.invalidDuplicateCount', lang, { value }),
            `Example: ${COMMAND} reinforce duplicate 3`
          );
          return;
        }
        const tokens = getSelectedTokens(msg);
        if (tokens.length === 0) {
          whisperWarning(playerId, t('errors.noTokensSelected', lang));
          return;
        }
        const result = duplicateSelectedTokens(msg, parsed.value);
        if (result.limitHit) {
          whisperError(
            playerId,
            t('errors.duplicateBurstLimit', lang, {
              requested: result.requested,
              limit: result.limit,
            })
          );
          return;
        }
        setLastReinforcementIds(result.createdIds);
        whisper(
          playerId,
          t('titles.reinforcementsCreated', lang),
          [
            buildRow(t('labels.copiesPerToken', lang), String(parsed.value)),
            buildRow(t('labels.totalCreated', lang), String(result.created)),
            buildDivider(),
            ...result.names.map((n) => `<div style="font-size:0.85em">• ${escapeHtml(n)}</div>`),
            result.created > 0
              ? buildButton(t('ui.revealReinforcements', lang), `${COMMAND} reinforce show`)
              : '',
            result.failedNames.length > 0
              ? [
                  buildDivider(),
                  buildRow(t('labels.duplicateFailed', lang), String(result.failedCount)),
                  ...result.failedNames.map(
                    (n) => `<div style="font-size:0.85em">• ${escapeHtml(n)}</div>`
                  ),
                  `<div style="font-size:0.8em;margin-top:4px;opacity:0.75">${escapeHtml(t('labels.duplicateFailedHint', lang))}</div>`,
                ].join('')
              : '',
          ].join('')
        );
        break;
      }

      case 'show': {
        const ids = getLastReinforcementIds();
        if (!ids.length) {
          whisperError(
            playerId,
            t('errors.noReinforcementsToReveal', lang),
            t('errors.noReinforcementsToRevealHint', lang)
          );
          return;
        }
        let moved = 0;
        for (const id of ids) {
          const token = getGraphicToken(id);
          if (token) {
            token.set('layer', 'objects');
            moved++;
          }
        }
        whisper(
          playerId,
          t('titles.tokensRevealed', lang),
          buildRow(t('labels.moved', lang), String(moved))
        );
        break;
      }

      case 'enumerate': {
        const tokens = getSelectedTokens(msg);
        if (tokens.length === 0) {
          whisperWarning(playerId, t('errors.noTokensSelected', lang));
          return;
        }
        const result = enumerateSelectedTokens(msg);
        whisper(
          playerId,
          t('titles.tokensNumbered', lang),
          [
            buildRow(t('labels.renamed', lang), String(result.renamed.length)),
            buildDivider(),
            ...result.renamed.map((n) => `<div style="font-size:0.85em">• ${escapeHtml(n)}</div>`),
          ].join('')
        );
        break;
      }

      default:
        whisperError(
          playerId,
          t('errors.unknownReinforceAction', lang, { action }),
          t('errors.reinforceActionHint', lang)
        );
    }
  }

  /**
   * Handles !director layer ... commands.
   *
   * @param {object} msg Roll20 chat message.
   * @param {string[]} args Remaining arguments after 'layer'.
   * @param {string} playerId GM player ID.
   * @returns {void}
   */
  function handleLayer(msg, args, playerId) {
    const [layerArg] = args;
    const lang = locale();
    const layerMap = { token: LAYER_TOKEN, gm: LAYER_GM, map: LAYER_MAP };
    const layer = layerMap[layerArg];

    if (!layer) {
      whisperError(
        playerId,
        t('errors.unknownLayer', lang, { layer: layerArg }),
        t('errors.layerHint', lang)
      );
      return;
    }

    const tokens = getSelectedTokens(msg);
    if (tokens.length === 0) {
      whisperWarning(playerId, t('errors.noTokensSelected', lang));
      return;
    }

    const result = moveSelectedToLayer(msg, layer);
    whisper(
      playerId,
      t('titles.layerChanged', lang),
      [
        buildRow(t('labels.layer', lang), layerArg),
        buildRow(t('labels.moved', lang), String(result.moved.length)),
      ].join('')
    );
  }

  /**
   * Handles !director hide command.
   *
   * @param {object} msg Roll20 chat message.
   * @param {string} playerId GM player ID.
   * @returns {void}
   */
  function handleHide(msg, playerId) {
    const lang = locale();
    const tokens = getSelectedTokens(msg);
    if (tokens.length === 0) {
      whisperWarning(playerId, t('errors.noTokensSelected', lang));
      return;
    }
    const result = hideSelectedTokens(msg);
    whisper(
      playerId,
      t('titles.tokensHidden', lang),
      buildRow(t('labels.hidden', lang), String(result.hidden.length))
    );
  }

  /**
   * Handles !director reveal command.
   *
   * @param {object} msg Roll20 chat message.
   * @param {string} playerId GM player ID.
   * @returns {void}
   */
  function handleReveal(msg, playerId) {
    const lang = locale();
    const tokens = getSelectedTokens(msg);
    if (tokens.length === 0) {
      whisperWarning(playerId, t('errors.noTokensSelected', lang));
      return;
    }
    const result = revealSelectedTokens(msg);
    whisper(
      playerId,
      t('titles.tokensRevealed', lang),
      buildRow(t('labels.revealed', lang), String(result.revealed.length))
    );
  }

  /**
   * Handles !director position ... commands.
   *
   * @param {object} msg Roll20 chat message.
   * @param {string[]} args Remaining arguments after 'position'.
   * @param {string} playerId GM player ID.
   * @returns {void}
   */
  function handlePosition(msg, args, playerId) {
    const [action] = args;
    const lang = locale();

    switch (action) {
      case 'save': {
        const tokens = getSelectedTokens(msg);
        if (tokens.length === 0) {
          whisperWarning(playerId, t('errors.noTokensSelected', lang));
          return;
        }
        const result = saveSelectedPositions(msg);
        whisper(
          playerId,
          t('titles.positionsSaved', lang),
          buildRow(t('labels.saved', lang), String(result.saved.length))
        );
        break;
      }

      case 'restore': {
        const tokens = getSelectedTokens(msg);
        if (tokens.length === 0) {
          whisperWarning(playerId, t('errors.noTokensSelected', lang));
          return;
        }
        const result = restoreSelectedPositions(msg);
        const parts = [buildRow(t('labels.restored', lang), String(result.restored.length))];
        if (result.noSave.length > 0) {
          parts.push(buildRow(t('labels.noSavedPosition', lang), String(result.noSave.length)));
        }
        whisper(playerId, t('titles.positionsRestored', lang), parts.join(''));
        break;
      }

      default:
        whisperError(
          playerId,
          t('errors.unknownPositionAction', lang, { action }),
          t('errors.positionActionHint', lang)
        );
    }
  }

  /**
   * Handles !director encounter ... commands.
   *
   * @param {object} msg Roll20 chat message.
   * @param {string[]} args Remaining arguments after 'encounter'.
   * @param {string} playerId GM player ID.
   * @returns {void}
   */
  function handleEncounter(msg, args, playerId) {
    const [action, ...nameParts] = args;
    // Multi-word names (e.g. "My Encounter") are intentionally joined back from
    // the split args. Buttons in the encounter list emit the full name as trailing
    // arguments, and the command router splits on whitespace — joining here is the
    // correct inverse. ENCOUNTER_NAME_RE prevents characters that could cause
    // ambiguous splits or injection.
    const name = nameParts.join(' ');
    const lang = locale();

    // Validate name for operations that require one
    const nameRequired = action === 'save' || action === 'load' || action === 'delete';
    if (nameRequired) {
      if (!name) {
        whisperError(
          playerId,
          t('errors.encounterNameRequired', lang),
          t('errors.encounterNameRequiredHint', lang)
        );
        return;
      }
      if (!ENCOUNTER_NAME_RE.test(name)) {
        whisperError(
          playerId,
          t('errors.invalidEncounterName', lang, { name }),
          t('errors.invalidEncounterNameHint', lang)
        );
        return;
      }
    }

    switch (action) {
      case 'save': {
        const pageId = getPlayerPageId(playerId);
        const result = saveEncounter(name, pageId);
        whisper(
          playerId,
          t('titles.encounterSaved', lang),
          [
            buildRow(t('labels.name', lang), result.name),
            buildRow(t('labels.tokensCaptured', lang), String(result.tokenCount)),
          ].join('')
        );
        break;
      }

      case 'load': {
        const result = loadEncounter(name);
        if (result.notFound) {
          whisperError(
            playerId,
            t('errors.encounterNotFound', lang, { name }),
            t('errors.encounterNotFoundHint', lang)
          );
          return;
        }
        const parts = [
          buildRow(t('labels.loaded', lang), name),
          buildRow(t('labels.restored', lang), String(result.restored)),
        ];
        if (result.missing > 0) {
          parts.push(buildRow(t('labels.missingTokens', lang), String(result.missing)));
        }
        whisper(playerId, t('titles.encounterLoaded', lang), parts.join(''));
        break;
      }

      case 'delete': {
        const result = deleteEncounterTemplate(name);
        if (!result.deleted) {
          whisperError(
            playerId,
            t('errors.encounterNotFound', lang, { name }),
            t('errors.encounterNotFoundHint', lang)
          );
          return;
        }
        whisper(
          playerId,
          t('titles.encounterDeleted', lang),
          buildRow(t('labels.deleted', lang), result.name)
        );
        break;
      }

      case 'list': {
        const names = listEncounterNames();
        if (names.length === 0) {
          whisper(
            playerId,
            t('titles.savedEncounters', lang),
            `<div style="font-style:italic">${escapeHtml(t('labels.noEncountersSaved', lang))}</div>`
          );
          return;
        }
        const rows = names.map(
          (n) =>
            `<div>${escapeHtml(n)} ` +
            buildSecondaryButton(t('ui.load', lang), `${COMMAND} encounter load ${n}`) +
            ` ` +
            buildSecondaryButton(t('ui.delete', lang), `${COMMAND} encounter delete ${n}`) +
            `</div>`
        );
        whisper(playerId, t('titles.savedEncounters', lang), rows.join(''));
        break;
      }

      default:
        whisperError(
          playerId,
          t('errors.unknownEncounterAction', lang, { action }),
          t('errors.encounterActionHint', lang)
        );
    }
  }

  /**
   * Handles !director reset ... commands.
   *
   * @param {object} msg Roll20 chat message.
   * @param {string[]} args Remaining arguments after 'reset'.
   * @param {string} playerId GM player ID.
   * @returns {void}
   */
  function handleReset(msg, args, playerId) {
    const [scope] = args;
    const lang = locale();

    switch (scope) {
      case 'selected': {
        const tokens = getSelectedTokens(msg);
        if (tokens.length === 0) {
          whisperWarning(playerId, t('errors.noTokensSelected', lang));
          return;
        }
        const result = resetSelectedTokens(msg);
        const parts = [buildRow(t('labels.reset', lang), String(result.reset.length))];
        if (result.notTracked.length > 0) {
          parts.push(buildRow(t('labels.notTracked', lang), String(result.notTracked.length)));
        }
        whisper(playerId, t('titles.tokensReset', lang), parts.join(''));
        break;
      }

      case 'page': {
        const result = resetCurrentPageTokens(getPlayerPageId(playerId));
        const parts = [buildRow(t('labels.reset', lang), String(result.reset))];
        if (result.missing > 0) {
          parts.push(buildRow(t('labels.missingTokens', lang), String(result.missing)));
        }
        whisper(playerId, t('titles.pageReset', lang), parts.join(''));
        break;
      }

      case 'all': {
        const result = resetAllTokens();
        const parts = [buildRow(t('labels.reset', lang), String(result.reset))];
        if (result.missing > 0) {
          parts.push(buildRow(t('labels.missingTokens', lang), String(result.missing)));
        }
        whisper(playerId, t('titles.allReset', lang), parts.join(''));
        break;
      }

      default:
        whisperError(
          playerId,
          t('errors.unknownResetScope', lang, { scope }),
          t('errors.resetScopeHint', lang)
        );
    }
  }

  /**
   * Handles !director report ... commands.
   *
   * @param {object} msg Roll20 chat message.
   * @param {string[]} args Remaining arguments after 'report'.
   * @param {string} playerId GM player ID.
   * @returns {void}
   */
  function handleReport(msg, args, playerId) {
    const [action] = args;
    const lang = locale();

    switch (action) {
      case 'refresh': {
        const result = refreshStatusReport(getPlayerPageId(playerId));
        whisper(
          playerId,
          t('titles.reportUpdated', lang),
          buildRow(t('labels.tokensInReport', lang), String(result.tokenCount))
        );
        break;
      }

      case 'selected': {
        const result = reportSelectedTokens(msg, getPlayerPageId(playerId));
        whisper(
          playerId,
          t('titles.reportUpdated', lang),
          buildRow(t('labels.selectedTokensInReport', lang), String(result.tokenCount))
        );
        break;
      }

      case 'changed': {
        const result = reportChangedTokens(getPlayerPageId(playerId));
        whisper(
          playerId,
          t('titles.reportUpdated', lang),
          buildRow(t('labels.changedTokensInReport', lang), String(result.tokenCount))
        );
        break;
      }

      case 'clear': {
        clearStatusReport();
        whisper(
          playerId,
          t('titles.reportCleared', lang),
          escapeHtml(t('confirm.reportCleared', lang))
        );
        break;
      }

      default:
        whisperError(
          playerId,
          t('errors.unknownReportAction', lang, { action }),
          t('errors.reportActionHint', lang)
        );
    }
  }

  /**
   * Handles !director journal ... commands.
   *
   * @param {string[]} args Remaining arguments after 'journal'.
   * @param {string} playerId GM player ID.
   * @returns {void}
   */
  /**
   * Handles !director deck [view] commands.
   * Rebuilds the Command Deck journal in the specified or stored view.
   *
   * @param {string[]} args Remaining arguments after 'deck'.
   * @param {string} playerId GM player ID.
   * @returns {void}
   */
  function handleDeck(args, playerId) {
    const [viewArg] = args;
    const lang = locale();

    let view;
    if (!viewArg) {
      // No argument: use the stored view (falls back to default via getDeckView).
      view = getDeckView();
    } else if (DECK_VIEW_KEYS.includes(viewArg)) {
      view = viewArg;
    } else {
      whisperError(
        playerId,
        t('errors.unknownDeckView', lang, { view: viewArg }),
        t('errors.deckViewHint', lang)
      );
      return;
    }

    setDeckView(view);
    installControlPanelHandout(view);
    whisper(
      playerId,
      t('titles.deckUpdated', lang),
      escapeHtml(t('confirm.deckUpdated', lang, { view }))
    );
  }

  function handleJournal(args, playerId) {
    const [action] = args;
    const lang = locale();

    if (action === 'rebuild') {
      installControlPanelHandout(getDeckView());
      installStatusHandout();
      whisper(
        playerId,
        t('titles.journalsRebuilt', lang),
        escapeHtml(t('confirm.journalsRebuilt', lang))
      );
    } else {
      whisperError(
        playerId,
        t('errors.unknownJournalAction', lang, { action }),
        t('errors.journalActionHint', lang)
      );
    }
  }

  /**
   * Handles !director config ... commands.
   *
   * @param {string[]} args Remaining arguments after 'config'.
   * @param {string} playerId GM player ID.
   * @returns {void}
   */
  function handleConfig(args, playerId) {
    const [key, value] = args;
    const lang = locale();

    switch (key) {
      case 'hp-bar': {
        if (!VALID_HP_BARS.includes(value)) {
          whisperError(
            playerId,
            t('errors.invalidHpBar', lang, { value }),
            t('errors.invalidHpBarHint', lang, { options: VALID_HP_BARS.join(', ') })
          );
          return;
        }
        setConfig({ hpBar: value });
        whisper(
          playerId,
          t('titles.configUpdated', lang),
          buildRow(t('labels.hpBar', lang), value)
        );
        break;
      }

      case 'ac-bar': {
        if (!VALID_AC_BARS.includes(value)) {
          whisperError(
            playerId,
            t('errors.invalidAcBar', lang, { value }),
            t('errors.invalidAcBarHint', lang, { options: VALID_AC_BARS.join(', ') })
          );
          return;
        }
        setConfig({ acBar: value });
        whisper(
          playerId,
          t('titles.configUpdated', lang),
          buildRow(t('labels.acBar', lang), value)
        );
        break;
      }

      case 'language': {
        const normalized = normalizeLocale(value);
        if (!normalized) {
          whisperError(
            playerId,
            t('errors.invalidLanguage', lang, { value }),
            t('errors.invalidLanguageHint', lang, { locales: SUPPORTED_LOCALE_LIST })
          );
          return;
        }
        setConfig({ language: normalized });
        // Use the NEW language for the confirmation so the GM sees it's working.
        whisper(
          playerId,
          t('titles.configUpdated', normalized),
          buildRow(t('labels.language', normalized), normalized)
        );
        break;
      }

      case undefined:
      case '': {
        const config = getConfig();
        whisper(
          playerId,
          t('titles.currentConfig', lang),
          [
            buildRow(t('labels.hpBar', lang), config.hpBar),
            buildRow(t('labels.acBar', lang), config.acBar),
            buildRow(t('labels.language', lang), config.language),
            buildDivider(),
            buildSecondaryButton(t('ui.setHpBar1', lang), `${COMMAND} config hp-bar bar1`),
            buildSecondaryButton(t('ui.setHpBar2', lang), `${COMMAND} config hp-bar bar2`),
            buildDivider(),
            buildSecondaryButton(t('ui.setAcBar2', lang), `${COMMAND} config ac-bar bar2`),
            buildSecondaryButton(t('ui.disableAc', lang), `${COMMAND} config ac-bar none`),
          ].join('')
        );
        break;
      }

      default:
        whisperError(
          playerId,
          t('errors.unknownConfigKey', lang, { key }),
          t('errors.configKeyHint', lang)
        );
    }
  }

  // ---------------------------------------------------------------------------
  // Menus
  // ---------------------------------------------------------------------------

  /**
   * Whispers the main quick-action menu to a GM player.
   *
   * @param {string} playerId GM player ID.
   * @returns {void}
   */
  function showMainMenu(playerId) {
    const lang = locale();
    whisper(
      playerId,
      SCRIPT_NAME,
      [
        `<div style="font-size:0.85em;margin-bottom:4px">v${escapeHtml(SCRIPT_VERSION)} — Open the <strong>${escapeHtml(SCRIPT_NAME)}</strong> journal for the full control panel.</div>`,
        buildDivider(),
        buildSectionLabel(t('ui.quickActions', lang)),
        buildButton('Standard Party (4)', `${COMMAND} scale preset standard`),
        buildButton('Boss', `${COMMAND} boss boss`),
        buildButton('Elite', `${COMMAND} boss elite`),
        buildButton('Minion', `${COMMAND} boss minion`),
        buildDivider(),
        buildButton(t('ui.resetSelected', lang), `${COMMAND} reset selected`),
        buildButton(t('ui.refreshReport', lang), `${COMMAND} report refresh`),
        buildDivider(),
        buildSecondaryButton(t('ui.help', lang), `${COMMAND} help`),
        buildSecondaryButton(t('ui.config', lang), `${COMMAND} config`),
      ].join('')
    );
  }

  /**
   * Whispers the help reference card to a GM player.
   *
   * @param {string} playerId GM player ID.
   * @returns {void}
   */
  function showHelp(playerId) {
    const lang = locale();
    const cmds = [
      ['Scale by preset', `${COMMAND} scale preset standard`],
      ['Scale by party size', `${COMMAND} scale party 6`],
      ['Set HP %', `${COMMAND} scale hp 150`],
      ['Set AC modifier', `${COMMAND} scale ac +2`],
      ['Set Damage %', `${COMMAND} scale damage 125`],
      ['Apply pending scaling', `${COMMAND} scale apply`],
      ['Boss preset', `${COMMAND} boss boss`],
      ['Elite / Minion', `${COMMAND} boss elite`],
      ['Legendary', `${COMMAND} boss legendary`],
      ['Duplicate tokens', `${COMMAND} reinforce duplicate 3`],
      ['Auto-number tokens', `${COMMAND} reinforce enumerate`],
      ['Move to GM layer', `${COMMAND} layer gm`],
      ['Move to token layer', `${COMMAND} layer token`],
      ['Hide selected', `${COMMAND} hide`],
      ['Reveal selected', `${COMMAND} reveal`],
      ['Save positions', `${COMMAND} position save`],
      ['Restore positions', `${COMMAND} position restore`],
      ['Save encounter', `${COMMAND} encounter save name`],
      ['Load encounter', `${COMMAND} encounter load name`],
      ['List encounters', `${COMMAND} encounter list`],
      ['Reset selected', `${COMMAND} reset selected`],
      ['Reset page', `${COMMAND} reset page`],
      ['Reset all', `${COMMAND} reset all`],
      ['Report refresh', `${COMMAND} report refresh`],
      ['Report changed', `${COMMAND} report changed`],
      ['Config', `${COMMAND} config`],
      ['Set language', `${COMMAND} config language fr`],
      ['Rebuild journals', `${COMMAND} journal rebuild`],
    ];

    const rows = cmds.map(
      ([label, cmd]) =>
        `<div style="display:flex;justify-content:space-between;padding:1px 0;font-size:0.8em">` +
        `<span>${escapeHtml(label)}</span>` +
        `<code style="font-size:0.9em">${escapeHtml(cmd)}</code>` +
        `</div>`
    );

    whisper(playerId, t('titles.help', lang, { name: SCRIPT_NAME }), rows.join(''));
  }

  /**
   * Initializes state, journals, and confirms startup to all GM players.
   *
   * @returns {void}
   */
  function checkInstall() {
    log(`${SCRIPT_NAME}: Starting up.`);

    ensureState();
    applyGlobalConfig();
    installControlPanelHandout(getDeckView());
    installStatusHandout();

    log(`-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} [Updated: ${SCRIPT_LAST_UPDATED}] <=-`);

    const lang = getConfig().language;
    const gmIds = getGmPlayerIds();

    for (const gmId of gmIds) {
      whisper(
        gmId,
        `${SCRIPT_NAME} v${SCRIPT_VERSION}`,
        `<div><strong>${escapeHtml(t('titles.scriptReady', lang))}</strong></div>` +
          `<div style="font-size:0.85em;margin-top:3px">${escapeHtml(t('confirm.scriptReadyHint', lang))}</div>`
      );
      showMainMenu(gmId);
    }
  }

  /**
   * Registers all Roll20 event handlers.
   *
   * @returns {void}
   */
  function registerEventHandlers() {
    on('ready', checkInstall);
    on('chat:message', handleInput);
  }

  registerEventHandlers();
})();
