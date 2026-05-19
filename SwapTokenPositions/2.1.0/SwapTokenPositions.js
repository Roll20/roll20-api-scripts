/**
 * NOTE: GENERATED FILE - DO NOT EDIT DIRECTLY.
 * NOTE: Source files live under src/ and are bundled with `npm run build`.
 * ------------------------------------------------
 * Name: SwapTokenPositions
 * Script: SwapTokenPositions.js
 * Built: 2026-05-19T19:15:31.630Z
 */
const SwapTokenPositionsMod = (() => {
  'use strict';

  const SCRIPT_NAME = 'SwapTokenPositions';
  const SWAP_TOKEN_POSITIONS_VERSION = '2.1.0';
  const SWAP_TOKEN_POSITIONS_LAST_UPDATED = '19 May 2026';
  const COLOR_BG_SOFT_BLACK = '#0A0A12';
  const COLOR_TEXT_ARCANE_SILVER = '#E6DFFF';
  const COLOR_TEXT_DIM_SILVER = '#B8AFCF';
  const COLOR_ACCENT_PURPLE_LIGHT = '#FF4D6D';
  const COLOR_ACCENT_PURPLE_DARK = '#5B21B6';
  const COLOR_HEADER_PURPLE_LIGHT = '#E9D5FF';

  const COLOR_INFO_LIGHT = '#DBEAFE';
  const COLOR_INFO_DARK = '#1E40AF';
  const COLOR_ERROR_RED = '#D32F2F';
  const COLOR_ERROR_DARK = '#B71C1C';
  const COLOR_ERROR_LIGHT = '#FFCDD2';
  const COLOR_ERROR_BG_LIGHT = '#FFEBEE';
  const COLOR_SUCCESS_GREEN = '#2E7D32';
  const COLOR_SUCCESS_DARK = '#1B5E20';
  const COLOR_SUCCESS_LIGHT = '#E8F5E9';
  const COLOR_SUCCESS_BG_LIGHT = '#F1F5FE';

  const TIME_MIN = 0;
  const TIME_MAX = 10;
  const DELAY_MIN = 0;
  const DELAY_MAX = 10;

  const ALLOWED_TRAVEL_FX = [
    'none',
    'beam-magic',
    'beam-acid',
    'beam-charm',
    'beam-fire',
    'beam-frost',
    'beam-holy',
    'beam-death',
    'beam-energy',
    'beam-lightning',
  ];

  const ALLOWED_TRAVEL_MODES = ['normal', 'invisible'];

  const ALLOWED_TOKEN_INPUT_ACCESS_MODES = [
    'gm-only',
    'all-players',
    'selected-users',
  ];

  const ALLOWED_POINT_FX = [
    'none',
    'nova-magic',
    'nova-acid',
    'nova-charm',
    'nova-fire',
    'nova-frost',
    'nova-holy',
    'nova-death',
    'burst-magic',
    'burst-acid',
    'burst-charm',
    'burst-fire',
    'burst-frost',
    'burst-holy',
    'burst-death',
    'burst-energy',
    'burst-smoke',
    'explode-magic',
    'explode-acid',
    'explode-charm',
    'explode-fire',
    'explode-frost',
    'explode-holy',
    'explode-death',
    'burn-magic',
    'burn-acid',
    'burn-charm',
    'burn-fire',
    'burn-frost',
    'burn-holy',
    'burn-death',
    'splatter-magic',
    'splatter-acid',
    'splatter-charm',
    'splatter-fire',
    'splatter-frost',
    'splatter-holy',
    'splatter-death',
    'splatter-dark',
    'glow-magic',
    'glow-acid',
    'glow-charm',
    'glow-fire',
    'glow-frost',
    'glow-holy',
    'glow-death',
  ];

  const FX_PRESETS = {
    portal: {
      originFx: 'nova-magic',
      travelFx: 'beam-magic',
      destinationFx: 'burst-holy',
      originTime: 1,
      travelTime: 1,
      destinationTime: 0.5,
      swapDelay: 0.5,
      destinationDelay: 1,
      travelMode: 'normal',
    },
    lightning: {
      originFx: 'none',
      travelFx: 'beam-holy',
      destinationFx: 'burst-holy',
      originTime: 0,
      travelTime: 0.3,
      destinationTime: 0,
      swapDelay: 0,
      destinationDelay: 0.3,
      travelMode: 'normal',
    },
    shadow: {
      originFx: 'burst-smoke',
      travelFx: 'none',
      destinationFx: 'burst-smoke',
      originTime: 0.5,
      travelTime: 0,
      destinationTime: 0,
      swapDelay: 0.5,
      destinationDelay: 0.5,
      travelMode: 'normal',
    },
    fire: {
      originFx: 'explode-fire',
      travelFx: 'none',
      destinationFx: 'explode-fire',
      originTime: 0.5,
      travelTime: 0,
      destinationTime: 0,
      swapDelay: 0.5,
      destinationDelay: 0.5,
      travelMode: 'normal',
    },
    magic: {
      originFx: 'nova-magic',
      travelFx: 'none',
      destinationFx: 'burst-magic',
      originTime: 0.5,
      travelTime: 0,
      destinationTime: 0,
      swapDelay: 0.5,
      destinationDelay: 0.5,
      travelMode: 'normal',
    },
    transport: {
      originFx: 'glow-magic',
      travelFx: 'none',
      destinationFx: 'glow-magic',
      originTime: 0.55,
      travelTime: 0,
      destinationTime: 0,
      swapDelay: 0.15,
      destinationDelay: 0.05,
      travelMode: 'invisible',
    },
    none: {
      originFx: 'none',
      travelFx: 'none',
      destinationFx: 'none',
      originTime: 0,
      travelTime: 0,
      destinationTime: 0,
      swapDelay: 0,
      destinationDelay: 0,
      travelMode: 'normal',
    },
  };

  const ALLOWED_PRESETS = Object.keys(FX_PRESETS);

  const FACTORY_DEFAULTS = {
    originFx: 'none',
    travelFx: 'none',
    destinationFx: 'none',
    originTime: 0,
    travelTime: 0,
    destinationTime: 0,
    swapDelay: 0,
    destinationDelay: 0,
    travelMode: 'normal',
    tokenInputAccess: 'gm-only',
    tokenInputUsers: [],
  };

  const FLAG_HELP = /--help\b/i;
  const FLAG_SHOW_SETTINGS = /--show-settings\b/i;
  const FLAG_CHECK_SETTINGS = /--check-settings\b/i;
  const FLAG_RESET_SETTINGS = /--reset-settings\b/i;
  const FLAG_SAVE = /--save\b/i;
  const FLAG_INSTALL_MACRO = /--install-macro\b/i;

  const FLAG_INSTANT = /--instant\b/i;
  const FLAG_PRESET = /--preset\b/i;
  const FLAG_ORIGIN_FX = /--origin-fx\b/i;
  const FLAG_TRAVEL_FX = /--travel-fx\b/i;
  const FLAG_DESTINATION_FX = /--destination-fx\b/i;
  const FLAG_ORIGIN_TIME = /--origin-time\b/i;
  const FLAG_TRAVEL_TIME = /--travel-time\b/i;
  const FLAG_TRAVEL_MODE = /--travel-mode\b/i;
  const FLAG_DESTINATION_TIME = /--destination-time\b/i;
  const FLAG_SWAP_DELAY = /--swap-delay\b/i;
  const FLAG_DESTINATION_DELAY = /--destination-delay\b/i;

  const FLAG_LEGACY_BEAM_FX = /--beam-fx\b/i;
  const FLAG_LEGACY_BURST_FX = /--burst-fx\b/i;
  const FLAG_LEGACY_DURATION = /--duration\b/i;
  const FLAG_LEGACY_MODE = /--mode\b/i;

  const FLAG_TOKEN1 = /--token1\b/i;
  const FLAG_TOKEN2 = /--token2\b/i;

  const FLAG_TOKEN_INPUT_ACCESS = /--token-input-access\b/i;
  const FLAG_TOKEN_INPUT_USERS_REMOVE = /--token-input-users-remove\b/i;
  // Negative lookahead prevents matching --token-input-users-remove.
  const FLAG_TOKEN_INPUT_USERS = /--token-input-users(?!-)/i;

  const MANAGEMENT_FLAGS = [
    FLAG_SHOW_SETTINGS,
    FLAG_CHECK_SETTINGS,
    FLAG_RESET_SETTINGS,
    FLAG_INSTALL_MACRO,
    FLAG_TOKEN_INPUT_ACCESS,
    FLAG_TOKEN_INPUT_USERS_REMOVE,
    FLAG_TOKEN_INPUT_USERS,
  ];

  const SILENT_MANAGEMENT_FLAGS = [
    FLAG_HELP,
    FLAG_SHOW_SETTINGS,
    FLAG_CHECK_SETTINGS,
    FLAG_RESET_SETTINGS,
    FLAG_INSTALL_MACRO,
    FLAG_TOKEN_INPUT_ACCESS,
    FLAG_TOKEN_INPUT_USERS_REMOVE,
    FLAG_TOKEN_INPUT_USERS,
  ];

  /**
   * Escapes HTML-sensitive characters for safe chat rendering.
   *
   * @param {string} value Text to escape.
   * @returns {string} Escaped text.
   */
  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  /**
   * Builds a safe display name for a token in chat output.
   *
   * @param {object} token Roll20 graphic token object.
   * @param {string} fallback Fallback label when token has no name.
   * @returns {string} Escaped token display name.
   */
  function getSafeTokenName(token, fallback) {
    const name = token.get('name');
    return escapeHtml(name?.trim() ? name : fallback);
  }

  /**
   * Builds the standard styled chat message container.
   *
   * @param {string} msg Message body as HTML.
   * @param {"left"|"center"|"right"} [align="center"] Content alignment.
   * @param {string} [header=""] Optional header label.
   * @returns {string} HTML for a styled chat card.
   */
  function generateStyledMessage(msg, align = 'center', header = '') {
    const padding = align === 'center' ? '3px 0px' : '3px 8px';
    const isScriptReadyHeader = header === 'Script Ready';
    const headerBackground = isScriptReadyHeader
      ? COLOR_HEADER_PURPLE_LIGHT
      : COLOR_INFO_LIGHT;
    const headerTextColor = isScriptReadyHeader
      ? COLOR_BG_SOFT_BLACK
      : COLOR_INFO_DARK;
    const headerLabel = isScriptReadyHeader
      ? `😎 ${header} 😎`
      : `ℹ️ ${header}`;
    const mainStyle = [
      'width:100%',
      'border-radius:4px',
      `box-shadow:1px 1px 1px ${COLOR_TEXT_DIM_SILVER}`,
      `text-align:${align}`,
      'vertical-align:middle',
      'margin:0px auto',
      `border:1px solid ${COLOR_BG_SOFT_BLACK}`,
      `color:${COLOR_TEXT_ARCANE_SILVER}`,
      `background-image:-webkit-linear-gradient(-45deg,${COLOR_ACCENT_PURPLE_DARK} 0%,${COLOR_ACCENT_PURPLE_LIGHT} 100%)`,
      'overflow:hidden',
    ].join(';');

    const headerHtml = header
      ? `<div style="background:${headerBackground}; color:${headerTextColor}; padding:2px 5px; border-bottom:1px solid ${COLOR_BG_SOFT_BLACK}; font-variant:small-caps; font-weight:bold; text-align:center">${headerLabel}</div>`
      : '';
    const contentHtml = `<div style="padding:${padding}"><strong>${msg}</strong></div>`;

    return `<div style='${mainStyle}'>${headerHtml}${contentHtml}</div>`;
  }

  /**
   * Builds a red error variant of the styled chat container.
   *
   * @param {string} msg Error body as HTML.
   * @param {string} [header="Error"] Optional header label.
   * @param {"left"|"center"|"right"} [align="left"] Content alignment.
   * @returns {string} HTML for an error-styled chat card.
   */
  function generateStyledErrorMessage(msg, header = 'Error', align = 'left') {
    const mainStyle = [
      'width:100%',
      'border-radius:4px',
      `box-shadow:1px 1px 1px ${COLOR_ERROR_RED}`,
      `text-align:${align}`,
      'vertical-align:middle',
      'margin:0px auto',
      `border:1px solid ${COLOR_ERROR_DARK}`,
      `color:${COLOR_ERROR_LIGHT}`,
      `background-color:${COLOR_ERROR_DARK}`,
      `background-image:-webkit-linear-gradient(-45deg,${COLOR_ERROR_DARK} 0%,${COLOR_ERROR_RED} 100%)`,
      'overflow:hidden',
    ].join(';');

    const headerHtml = `<div style="background:${COLOR_ERROR_BG_LIGHT}; color:${COLOR_ERROR_DARK}; padding:2px 5px; border-bottom:1px solid ${COLOR_ERROR_DARK}; font-variant:small-caps; font-weight:bold; text-align:center">⚠️ ${header}</div>`;
    const contentHtml = `<div style="padding:3px 8px"><strong>${msg}</strong></div>`;

    return `<div style='${mainStyle}'>${headerHtml}${contentHtml}</div>`;
  }

  /**
   * Builds a green success variant of the styled chat container.
   *
   * @param {string} msg Success body as HTML.
   * @param {string} [header="Success"] Optional header label.
   * @returns {string} HTML for a success-styled chat card.
   */
  function generateStyledSuccessMessage(msg, header = 'Success') {
    const mainStyle = [
      'width:100%',
      'border-radius:4px',
      `box-shadow:1px 1px 1px ${COLOR_SUCCESS_GREEN}`,
      'text-align:center',
      'vertical-align:middle',
      'margin:0px auto',
      `border:1px solid ${COLOR_SUCCESS_DARK}`,
      `color:${COLOR_SUCCESS_LIGHT}`,
      `background-image:-webkit-linear-gradient(-45deg,${COLOR_SUCCESS_DARK} 0%,${COLOR_SUCCESS_GREEN} 100%)`,
      'overflow:hidden',
    ].join(';');

    const headerHtml = `<div style="background:${COLOR_SUCCESS_BG_LIGHT}; color:${COLOR_SUCCESS_DARK}; padding:2px 5px; border-bottom:1px solid ${COLOR_SUCCESS_DARK}; font-variant:small-caps; font-weight:bold; text-align:center">✅ ${header}</div>`;
    const contentHtml = `<div style="padding:3px 8px"><strong>${msg}</strong></div>`;

    return `<div style='${mainStyle}'>${headerHtml}${contentHtml}</div>`;
  }

  /**
   * Whispers a styled message card to the GM.
   *
   * @param {string} msg Message body as HTML.
   * @param {string} [header=""] Optional header label.
   * @param {"left"|"center"|"right"} [align="center"] Content alignment.
   * @returns {void}
   */
  function whisperGM(msg, header = '', align = 'center') {
    sendChat(SCRIPT_NAME, `/w GM ${generateStyledMessage(msg, align, header)}`);
  }

  /**
   * Whispers a styled message card to the user that sent the command.
   *
   * @param {object} msgObj Roll20 chat message object.
   * @param {string} text Message body as HTML.
   * @param {string} [header=""] Optional header label.
   * @param {"left"|"center"|"right"} [align="center"] Content alignment.
   * @returns {void}
   */
  function whisperSender(msgObj, text, header = '', align = 'center') {
    const player = getObj('player', msgObj.playerid);
    const name = player ? player.get('_displayname') : msgObj.who;
    sendChat(
      SCRIPT_NAME,
      `/w "${name}" ${generateStyledMessage(text, align, header)}`,
    );
  }

  /**
   * Whispers an error-styled message card to the user that sent the command.
   *
   * @param {object} msgObj Roll20 chat message object.
   * @param {string} text Error body as HTML.
   * @param {string} [header="Error"] Optional header label.
   * @param {"left"|"center"|"right"} [align="left"] Content alignment.
   * @returns {void}
   */
  function whisperSenderError(msgObj, text, header = 'Error', align = 'left') {
    const player = getObj('player', msgObj.playerid);
    const name = player ? player.get('_displayname') : msgObj.who;
    sendChat(
      SCRIPT_NAME,
      `/w "${name}" ${generateStyledErrorMessage(text, header, align)}`,
    );
  }

  /**
   * Whispers a success-styled message card to the GM.
   *
   * @param {string} text Success body as HTML.
   * @param {string} [header="Success"] Optional header label.
   * @returns {void}
   */
  function whisperGMSuccess(text, header = 'Success') {
    sendChat(
      SCRIPT_NAME,
      `/w GM ${generateStyledSuccessMessage(text, header)}`,
    );
  }

  /**
   * Whispers an error-styled message card to the GM.
   *
   * @param {string} text Error body as HTML.
   * @param {string} [header="Error"] Optional header label.
   * @param {"left"|"center"|"right"} [align="left"] Content alignment.
   * @returns {void}
   */
  function whisperGMError(text, header = 'Error', align = 'left') {
    sendChat(
      SCRIPT_NAME,
      `/w GM ${generateStyledErrorMessage(text, header, align)}`,
    );
  }

  /**
   * Parses a comma-separated list flag, supporting quoted and bare entries.
   *
   * Each member may be single-quoted, double-quoted, or bare (no commas within).
   * Empty members and whitespace-only entries are filtered silently.
   *
   * @param {string} content Full command content.
   * @param {RegExp} flagRegex Regex for the flag name.
   * @returns {{found:boolean, values:string[]}} Parse result.
   */
  function parseCommaListFlag(content, flagRegex) {
    const match = new RegExp(
      String.raw`${flagRegex.source}\s+(.+?)(?=\s+--|$)`,
      'i',
    ).exec(content);
    if (!match) {
      return { found: false, values: [] };
    }

    const values = [];
    for (const part of match[1].trim().split(',')) {
      const trimmed = part
        .trim()
        .replace(/^(['"])(.*)\1$/, '$2')
        .trim();
      if (trimmed) {
        values.push(trimmed);
      }
    }

    return { found: true, values };
  }

  /**
   * Parses a string flag whose value may be quoted (allowing spaces) or unquoted.
   *
   * Supports single-quoted, double-quoted, and bare (no-whitespace) values.
   *
   * @param {string} content Full command content.
   * @param {RegExp} flagRegex Regex for the flag name.
   * @returns {{found:boolean, value:(string|null)}} Parse result.
   */
  function parseFreeStringFlag(content, flagRegex) {
    const match = new RegExp(
      String.raw`${flagRegex.source}\s+(?:"([^"]+)"|'([^']+)'|(\S+))`,
      'i',
    ).exec(content);
    if (!match) {
      return { found: false, value: null };
    }
    const value = (match[1] ?? match[2] ?? match[3]).trim();
    return { found: true, value };
  }

  /**
   * Parses a string flag and validates it against an allowed set.
   *
   * @param {string} content Full command content.
   * @param {RegExp} flagRegex Regex for the flag name.
   * @param {string[]} allowedValues Allowed lower-case values.
   * @returns {{found:boolean, valid:boolean, value:(string|null)}} Parse result.
   */
  function parseStringFlag(content, flagRegex, allowedValues) {
    const match = new RegExp(String.raw`${flagRegex.source}\s+(\S+)`, 'i').exec(
      content,
    );
    if (!match) {
      return { found: false, valid: false, value: null };
    }
    const normalized = match[1]
      .trim()
      .replaceAll(/(^['"]|['"]$)/g, '')
      .replaceAll(/[.,;]+$/g, '')
      .toLowerCase();
    if (allowedValues.includes(normalized)) {
      return { found: true, valid: true, value: normalized };
    }
    return { found: true, valid: false, value: match[1] };
  }

  /**
   * Parses a numeric flag and validates it against an inclusive range.
   *
   * @param {string} content Full command content.
   * @param {RegExp} flagRegex Regex for the flag name.
   * @param {number} min Minimum allowed value.
   * @param {number} max Maximum allowed value.
   * @returns {{found:boolean, valid:boolean, value:(number|null)}} Parse result.
   */
  function parseFloatFlag(content, flagRegex, min, max) {
    const match = new RegExp(
      String.raw`${flagRegex.source}\s+([\d.]+)`,
      'i',
    ).exec(content);
    if (!match) {
      return { found: false, valid: false, value: null };
    }
    const value = Number.parseFloat(match[1]);
    if (!Number.isNaN(value) && value >= min && value <= max) {
      return { found: true, valid: true, value };
    }
    return { found: true, valid: false, value: null };
  }

  /**
   * Applies a parsed string flag result to config and update tracking.
   *
   * @param {{found:boolean, valid:boolean, value:(string|null)}} result Parse result.
   * @param {string} key Config key to set.
   * @param {object} config Mutable config object.
   * @param {{valid:number, invalid:number}} updateTracker Valid/invalid counters.
   * @param {object} msg Roll20 chat message object.
   * @param {string} errorMsg Error message shown when invalid.
   * @returns {void}
   */
  function applyStringFlagResult(
    result,
    key,
    config,
    updateTracker,
    msg,
    errorMsg,
  ) {
    if (result.valid) {
      config[key] = result.value;
      updateTracker.valid++;
    } else {
      updateTracker.invalid++;
      whisperSenderError(msg, errorMsg, 'Invalid Input');
    }
  }

  /**
   * Applies a parsed numeric flag result to config and update tracking.
   *
   * @param {{found:boolean, valid:boolean, value:(number|null)}} result Parse result.
   * @param {string} key Config key to set.
   * @param {object} config Mutable config object.
   * @param {{valid:number, invalid:number}} updateTracker Valid/invalid counters.
   * @param {object} msg Roll20 chat message object.
   * @param {string} label Human-readable field label.
   * @param {{min:number,max:number}} range Allowed numeric range.
   * @returns {void}
   */
  function applyNumericFlagResult(
    result,
    key,
    config,
    updateTracker,
    msg,
    label,
    range,
  ) {
    if (result.valid) {
      config[key] = result.value;
      updateTracker.valid++;
    } else {
      updateTracker.invalid++;
      whisperSenderError(
        msg,
        `Invalid ${label}: must be between ${range.min} and ${range.max} seconds.`,
        'Invalid Input',
      );
    }
  }

  /**
   * Parses and applies a collection of string flags.
   *
   * @param {string} content Full command content.
   * @param {Array<{flag:RegExp,key:string,allowed:string[],label:string}>} flagConfigs Flag specs.
   * @param {object} config Mutable config object.
   * @param {{valid:number, invalid:number}} updateTracker Valid/invalid counters.
   * @param {object} msg Roll20 chat message object.
   * @returns {void}
   */
  function processStringFlags(
    content,
    flagConfigs,
    config,
    updateTracker,
    msg,
  ) {
    for (const { flag, key, allowed, label } of flagConfigs) {
      const result = parseStringFlag(content, flag, allowed);
      if (!result.found) {
        continue;
      }
      const errorMsg = `Invalid ${label}: '${result.value}'.<br><br>Valid: ${allowed.join(', ')}`;
      applyStringFlagResult(result, key, config, updateTracker, msg, errorMsg);
    }
  }

  /**
   * Parses and applies a collection of numeric flags.
   *
   * @param {string} content Full command content.
   * @param {Array<{flag:RegExp,key:string,label:string,min:number,max:number}>} flagConfigs Flag specs.
   * @param {(content:string, flagRegex:RegExp, min:number, max:number)=>{found:boolean, valid:boolean, value:(number|null)}} parseFunc Numeric parser.
   * @param {object} config Mutable config object.
   * @param {{valid:number, invalid:number}} updateTracker Valid/invalid counters.
   * @param {object} msg Roll20 chat message object.
   * @returns {void}
   */
  function processNumericFlags(
    content,
    flagConfigs,
    parseFunc,
    config,
    updateTracker,
    msg,
  ) {
    for (const { flag, key, label, min, max } of flagConfigs) {
      const result = parseFunc(content, flag, min, max);
      if (!result.found) {
        continue;
      }
      applyNumericFlagResult(result, key, config, updateTracker, msg, label, {
        min,
        max,
      });
    }
  }

  /**
   * Ensures persisted script settings exist and backfills missing keys with defaults.
   *
   * @returns {void}
   */
  function initializeState() {
    if (!state.SwapTokenPositions) {
      state.SwapTokenPositions = {};
    }
    for (const [key, value] of Object.entries(FACTORY_DEFAULTS)) {
      if (state.SwapTokenPositions[key] === undefined) {
        state.SwapTokenPositions[key] = value;
      }
    }
  }

  /**
   * Retrieves persisted script settings from Roll20 state.
   *
   * @returns {object} Effective script settings object.
   */
  function getSettings() {
    return state.SwapTokenPositions;
  }

  /**
   * Renders the current persisted settings to GM chat.
   *
   * @returns {void}
   */
  function showSettings() {
    const settings = getSettings();

    const userListLine =
      settings.tokenInputAccess === 'selected-users'
        ? `<strong>Token Input Users:</strong> ${formatTokenInputUsers(settings.tokenInputUsers)}<br>`
        : '';

    const settingsMsg = [
      `<strong>Origin FX:</strong> ${settings.originFx}<br>`,
      `<strong>Travel FX:</strong> ${settings.travelFx}<br>`,
      `<strong>Travel Mode:</strong> ${settings.travelMode}<br>`,
      `<strong>Destination FX:</strong> ${settings.destinationFx}<br>`,
      `<strong>Origin Time:</strong> ${settings.originTime}s<br>`,
      `<strong>Travel Time:</strong> ${settings.travelTime}s<br>`,
      `<strong>Destination Time:</strong> ${settings.destinationTime}s<br>`,
      `<strong>Swap Delay:</strong> ${settings.swapDelay}s<br>`,
      `<strong>Destination Delay:</strong> ${settings.destinationDelay}s<br>`,
      `<strong>Token Input Access:</strong> ${settings.tokenInputAccess}<br>`,
      userListLine,
    ].join('');
    whisperGM(settingsMsg, 'Persistent Settings', 'left');
  }

  /**
   * Formats a list of player IDs as human-readable names with ID fallback.
   *
   * @param {string[]} ids Player ID array from persistent state.
   * @returns {string} Comma-separated display names, or "(none)" when empty.
   */
  function formatTokenInputUsers(ids) {
    if (!ids || ids.length === 0) {
      return '(none)';
    }
    return ids
      .map((id) => {
        const player = getObj('player', id);
        return player ? `${player.get('_displayname')} (${id})` : id;
      })
      .join(', ');
  }

  /**
   * Resets persisted script settings to factory defaults.
   *
   * @returns {void}
   */
  function resetSettings() {
    state.SwapTokenPositions = { ...FACTORY_DEFAULTS };
    whisperGM(
      '<strong>Settings reset to factory defaults.</strong>',
      'Settings Reset',
    );
    showSettings();
  }

  /**
   * Validates persisted settings for supported FX values and timing ranges.
   *
   * @param {boolean} [silentOnSuccess=false] When true, success output is suppressed.
   * @returns {boolean} True when settings are valid; otherwise false.
   */
  function validateSettings(silentOnSuccess = false) {
    const settings = getSettings();
    const errors = [];

    if (!ALLOWED_TOKEN_INPUT_ACCESS_MODES.includes(settings.tokenInputAccess)) {
      errors.push(
        `Token Input Access '${settings.tokenInputAccess}' is no longer valid.`,
      );
    }
    if (
      !Array.isArray(settings.tokenInputUsers) ||
      settings.tokenInputUsers.some(
        (entry) => typeof entry !== 'string' || entry.length === 0,
      )
    ) {
      errors.push('Token Input Users contains invalid entries.');
    }

    if (!ALLOWED_POINT_FX.includes(settings.originFx)) {
      errors.push(`Origin FX '${settings.originFx}' is no longer valid.`);
    }
    if (!ALLOWED_TRAVEL_FX.includes(settings.travelFx)) {
      errors.push(`Travel FX '${settings.travelFx}' is no longer valid.`);
    }
    if (!ALLOWED_TRAVEL_MODES.includes(settings.travelMode)) {
      errors.push(`Travel Mode '${settings.travelMode}' is no longer valid.`);
    }
    if (!ALLOWED_POINT_FX.includes(settings.destinationFx)) {
      errors.push(
        `Destination FX '${settings.destinationFx}' is no longer valid.`,
      );
    }

    const timingFields = [
      { key: 'originTime', label: 'Origin Time', min: TIME_MIN, max: TIME_MAX },
      { key: 'travelTime', label: 'Travel Time', min: TIME_MIN, max: TIME_MAX },
      {
        key: 'destinationTime',
        label: 'Destination Time',
        min: TIME_MIN,
        max: TIME_MAX,
      },
      { key: 'swapDelay', label: 'Swap Delay', min: DELAY_MIN, max: DELAY_MAX },
      {
        key: 'destinationDelay',
        label: 'Destination Delay',
        min: DELAY_MIN,
        max: DELAY_MAX,
      },
    ];

    for (const { key, label, min, max } of timingFields) {
      const value = settings[key];
      if (typeof value !== 'number' || value < min || value > max) {
        errors.push(`${label} (${value}) is out of range (${min}-${max}).`);
      }
    }

    if (errors.length > 0) {
      const errorMsg = [
        '<strong>Validation Issues Found:</strong><br>',
        errors.map((error) => `&bull; ${error}`).join('<br>'),
        '<br><em>Try running <code>!swap-tokens --reset-settings</code> to fix these issues.</em>',
      ].join('');
      whisperGMError(errorMsg, 'Settings Validation');
      return false;
    }

    if (!silentOnSuccess) {
      whisperGMSuccess(
        'All persistent settings are valid.',
        'Settings Validation',
      );
    }
    return true;
  }

  /**
   * Applies deprecated flags to the active config while emitting compatibility warnings.
   *
   * @param {object} msg Roll20 chat message object.
   * @param {object} config Mutable config object.
   * @param {{valid:number, invalid:number}} updateTracker Valid/invalid counters.
   * @returns {void}
   */
  function applyLegacyFlags(msg, config, updateTracker) {
    const content = msg.content;
    const legacyModeToPreset = {
      beams: 'lightning',
      transport: 'transport',
    };

    const modeResult = parseStringFlag(
      content,
      FLAG_LEGACY_MODE,
      Object.keys(legacyModeToPreset),
    );

    if (modeResult.found) {
      if (modeResult.valid) {
        const mappedPreset = legacyModeToPreset[modeResult.value];
        whisperSender(
          msg,
          `<code>--mode</code> is deprecated. Use <code>--preset ${mappedPreset}</code> instead.`,
          'Deprecated Flag',
          'left',
        );
        Object.assign(config, FX_PRESETS[mappedPreset]);
        updateTracker.valid++;
      } else {
        updateTracker.invalid++;
        whisperSenderError(
          msg,
          `Invalid value for deprecated <code>--mode</code>: '${modeResult.value}'.<br><br>Valid: ${Object.keys(legacyModeToPreset).join(', ')}`,
          'Invalid Input',
        );
      }
    }

    const fxMappings = [
      {
        flag: FLAG_LEGACY_BEAM_FX,
        key: 'travelFx',
        allowed: ALLOWED_TRAVEL_FX,
        oldName: '--beam-fx',
        newName: '--travel-fx',
      },
      {
        flag: FLAG_LEGACY_BURST_FX,
        key: 'destinationFx',
        allowed: ALLOWED_POINT_FX,
        oldName: '--burst-fx',
        newName: '--destination-fx',
      },
    ];

    for (const { flag, key, allowed, oldName, newName } of fxMappings) {
      const result = parseStringFlag(content, flag, allowed);
      if (!result.found) {
        continue;
      }
      whisperSender(
        msg,
        `<code>${oldName}</code> is deprecated. Use <code>${newName}</code> instead.`,
        'Deprecated Flag',
        'left',
      );
      if (result.valid) {
        config[key] = result.value;
        updateTracker.valid++;
      } else {
        updateTracker.invalid++;
        whisperSenderError(
          msg,
          `Invalid value for deprecated <code>${oldName}</code>: '${result.value}'.<br><br>Valid: ${allowed.join(', ')}`,
          'Invalid Input',
        );
      }
    }

    const durationResult = parseFloatFlag(
      content,
      FLAG_LEGACY_DURATION,
      DELAY_MIN,
      DELAY_MAX,
    );
    if (durationResult.found) {
      whisperSender(
        msg,
        '<code>--duration</code> is deprecated. Use <code>--swap-delay</code> instead.',
        'Deprecated Flag',
        'left',
      );
      if (durationResult.valid) {
        config.swapDelay = durationResult.value;
        updateTracker.valid++;
      } else {
        updateTracker.invalid++;
        whisperSenderError(
          msg,
          `Invalid value for deprecated <code>--duration</code>: must be between ${DELAY_MIN} and ${DELAY_MAX} seconds.`,
          'Invalid Input',
        );
      }
    }
  }

  /**
   * Applies a preset configuration layer when the preset flag is present.
   *
   * @param {object} msg Roll20 chat message object.
   * @param {string} content Full command content.
   * @param {object} config Mutable config object.
   * @param {{valid:number, invalid:number}} updateTracker Valid/invalid counters.
   * @returns {void}
   */
  function applyPresetLayer(msg, content, config, updateTracker) {
    const presetResult = parseStringFlag(content, FLAG_PRESET, ALLOWED_PRESETS);
    if (!presetResult.found) {
      return;
    }
    if (presetResult.valid) {
      Object.assign(config, FX_PRESETS[presetResult.value]);
      updateTracker.valid++;
    } else {
      updateTracker.invalid++;
      whisperSenderError(
        msg,
        `Invalid preset: '${presetResult.value}'.<br><br>Valid presets: ${ALLOWED_PRESETS.join(', ')}`,
        'Invalid Input',
      );
    }
  }

  /**
   * Builds the final swap configuration by layering settings, preset, and explicit flags.
   *
   * @param {object} msg Roll20 chat message object.
   * @param {{valid:number, invalid:number}} updateTracker Valid/invalid counters.
   * @returns {object} Effective swap configuration.
   */
  function buildSwapConfig(msg, updateTracker) {
    const content = msg.content;
    const config = { ...getSettings() };

    applyPresetLayer(msg, content, config, updateTracker);
    applyLegacyFlags(msg, config, updateTracker);

    const fxFlags = [
      {
        flag: FLAG_ORIGIN_FX,
        key: 'originFx',
        allowed: ALLOWED_POINT_FX,
        label: 'Origin FX',
      },
      {
        flag: FLAG_TRAVEL_FX,
        key: 'travelFx',
        allowed: ALLOWED_TRAVEL_FX,
        label: 'Travel FX',
      },
      {
        flag: FLAG_TRAVEL_MODE,
        key: 'travelMode',
        allowed: ALLOWED_TRAVEL_MODES,
        label: 'Travel Mode',
      },
      {
        flag: FLAG_DESTINATION_FX,
        key: 'destinationFx',
        allowed: ALLOWED_POINT_FX,
        label: 'Destination FX',
      },
    ];
    processStringFlags(content, fxFlags, config, updateTracker, msg);

    const timeFlags = [
      {
        flag: FLAG_ORIGIN_TIME,
        key: 'originTime',
        label: 'Origin Time',
        min: TIME_MIN,
        max: TIME_MAX,
      },
      {
        flag: FLAG_TRAVEL_TIME,
        key: 'travelTime',
        label: 'Travel Time',
        min: TIME_MIN,
        max: TIME_MAX,
      },
      {
        flag: FLAG_DESTINATION_TIME,
        key: 'destinationTime',
        label: 'Destination Time',
        min: TIME_MIN,
        max: TIME_MAX,
      },
    ];
    processNumericFlags(
      content,
      timeFlags,
      parseFloatFlag,
      config,
      updateTracker,
      msg,
    );

    const delayFlags = [
      {
        flag: FLAG_SWAP_DELAY,
        key: 'swapDelay',
        label: 'Swap Delay',
        min: DELAY_MIN,
        max: DELAY_MAX,
      },
      {
        flag: FLAG_DESTINATION_DELAY,
        key: 'destinationDelay',
        label: 'Destination Delay',
        min: DELAY_MIN,
        max: DELAY_MAX,
      },
    ];
    processNumericFlags(
      content,
      delayFlags,
      parseFloatFlag,
      config,
      updateTracker,
      msg,
    );

    return config;
  }

  /**
   * Sends full command and option help text to the invoking player.
   *
   * @param {object} msgObj Roll20 chat message object.
   * @returns {void}
   */
  function showHelp(msgObj) {
    const helpMsg = [
      `<strong>SwapTokenPositions</strong> v${SWAP_TOKEN_POSITIONS_VERSION}<br>`,
      `Last Updated: ${SWAP_TOKEN_POSITIONS_LAST_UPDATED}<br>`,
      '<br><strong>Basic Usage:</strong><br>',
      '<code>!swap-tokens</code> &mdash; Instant swap of 2 selected tokens.<br>',
      '<code>!swap-tokens --instant</code> &mdash; Force instant swap, ignoring all FX and timing.<br>',
      '<code>!swap-tokens --help</code> &mdash; Show this help message (available to all players).<br>',
      '<br><strong>Explicit Token Targeting (Macro-Friendly):</strong><br>',
      '<em>Use both flags together to target tokens without selection.</em><br>',
      '<code>--token1 &lt;id|name&gt;</code> &mdash; First token, resolved by ID then by name on the active page.<br>',
      '<code>--token2 &lt;id|name&gt;</code> &mdash; Second token, resolved by ID then by name on the active page.<br>',
      '<em>Quote names that contain spaces: <code>--token1 "Goblin A"</code></em><br>',
      '<em>When a name matches multiple tokens, use the token ID instead.</em><br>',
      '<br><strong>FX Stages:</strong><br>',
      '<em>Pipeline order: Origin FX &rarr; Travel FX &rarr; Swap &rarr; Destination FX.</em><br>',
      '<code>--origin-fx &lt;type&gt;</code> &mdash; FX at both original positions before movement.<br>',
      '<code>--travel-fx &lt;type&gt;</code> &mdash; FX between tokens during transition.<br>',
      '<code>--travel-mode &lt;normal|invisible&gt;</code> &mdash; Keep tokens visible during travel or hide them until reveal.<br>',
      '<code>--destination-fx &lt;type&gt;</code> &mdash; FX at both new positions after swap.<br>',
      '<br><strong>Stage Timing:</strong><br>',
      `<code>--origin-time &lt;${TIME_MIN}-${TIME_MAX}&gt;</code> &mdash; Wait (s) after Origin FX before continuing.<br>`,
      `<code>--travel-time &lt;${TIME_MIN}-${TIME_MAX}&gt;</code> &mdash; Duration (s) of the travel animation stage.<br>`,
      `<code>--destination-time &lt;${TIME_MIN}-${TIME_MAX}&gt;</code> &mdash; Additional wait (s) before Destination FX is shown.<br>`,
      '<br><strong>Delays:</strong><br>',
      `<code>--swap-delay &lt;${DELAY_MIN}-${DELAY_MAX}&gt;</code> &mdash; Additional pause between Origin and Travel stages.<br>`,
      `<code>--destination-delay &lt;${DELAY_MIN}-${DELAY_MAX}&gt;</code> &mdash; Additional pause before Destination FX is shown.<br>`,
      '<br><strong>Presets:</strong><br>',
      `<code>--preset &lt;name&gt;</code> &mdash; Apply a preset. Valid: <code>${ALLOWED_PRESETS.join(', ')}</code><br>`,
      '&bull; <strong>portal</strong> &mdash; Magical portal teleport (nova, beam, burst).<br>',
      '&bull; <strong>lightning</strong> &mdash; Fast lightning strike (beam, burst).<br>',
      '&bull; <strong>shadow</strong> &mdash; Dark shadow blink (splatter, no travel FX).<br>',
      '&bull; <strong>fire</strong> &mdash; Fiery explosion swap (explode, no travel FX).<br>',
      '&bull; <strong>magic</strong> &mdash; Arcane sparkle swap (nova, burst).<br>',
      '&bull; <strong>transport</strong> &mdash; Starship transport shimmer (invisible travel reveal).<br>',
      '&bull; <strong>none</strong> &mdash; No FX, equivalent to instant mode.<br>',
      '<em>Explicit flags override preset values. Example: <code>--preset portal --travel-time 3</code></em><br>',
      '<br><strong>Global Configuration (GM Only):</strong><br>',
      '<code>--save</code> &mdash; Commit provided flags as the new global defaults.<br>',
      '<code>--show-settings</code> &mdash; View current persistent defaults.<br>',
      '<code>--reset-settings</code> &mdash; Restore all factory defaults.<br>',
      "<code>--install-macro</code> &mdash; Create a global 'SwapTokens' macro.<br>",
      '<br><strong>Explicit Token Access Control (GM Only):</strong><br>',
      '<em>Controls who may use <code>--token1</code> and <code>--token2</code>. Takes effect immediately.</em><br>',
      '<code>--token-input-access &lt;mode&gt;</code> &mdash; Set access mode. Valid: <code>gm-only</code> (default), <code>all-players</code>, <code>selected-users</code>.<br>',
      '<code>--token-input-users &lt;id|name,...&gt;</code> &mdash; Replace the allow-list (used with <code>selected-users</code> mode).<br>',
      '<code>--token-input-users-remove &lt;id|name,...&gt;</code> &mdash; Remove specific players from the allow-list.<br>',
      '<em>Names containing spaces must be quoted. Comma-separated entries are supported.</em><br>',
      '<em>The GM is always permitted regardless of access mode.</em><br>',
      '<br><strong>Examples:</strong><br>',
      '<code>!swap-tokens</code><br>',
      '<code>!swap-tokens --preset portal</code><br>',
      '<code>!swap-tokens --preset transport</code><br>',
      '<code>!swap-tokens --preset portal --travel-time 3</code><br>',
      '<code>!swap-tokens --origin-fx nova-magic --swap-delay 1 --destination-fx burst-holy</code><br>',
      '<code>!swap-tokens --preset lightning --save</code><br>',
      '<code>!swap-tokens --token1 -Kabc123 --token2 -Kdef456</code><br>',
      '<code>!swap-tokens --token1 "Goblin A" --token2 "Goblin B"</code><br>',
      '<code>!swap-tokens --token1 -Kabc123 --token2 "Goblin B" --preset portal</code><br>',
      '<code>!swap-tokens --token-input-access all-players</code><br>',
      '<code>!swap-tokens --token-input-access selected-users</code><br>',
      '<code>!swap-tokens --token-input-users "Alice","Bob"</code><br>',
      '<code>!swap-tokens --token-input-users-remove Alice</code><br>',
    ].join('');

    whisperSender(msgObj, helpMsg, 'SwapTokenPositions Help', 'left');
  }

  /**
   * Spawns a point FX on a page when enabled.
   *
   * @param {number} x X coordinate.
   * @param {number} y Y coordinate.
   * @param {string} fxType Roll20 FX type.
   * @param {string} pageId Roll20 page id.
   * @returns {void}
   */
  function spawnPointFx(x, y, fxType, pageId) {
    if (fxType === 'none') {
      return;
    }
    try {
      spawnFx(x, y, fxType, pageId);
    } catch (error) {
      log(
        `SwapTokenPositions: Point FX failed, but swap will continue: ${error.message}`,
      );
    }
  }

  /**
   * Spawns travel FX between two positions when enabled.
   *
   * @param {{left:number, top:number, page:string}} pos1 Source position.
   * @param {{left:number, top:number, page:string}} pos2 Destination position.
   * @param {string} fxType Roll20 FX type.
   * @returns {void}
   */
  function spawnTravelFx(pos1, pos2, fxType) {
    if (fxType === 'none') {
      return;
    }
    try {
      spawnFxBetweenPoints(
        { x: pos1.left, y: pos1.top, pageid: pos1.page },
        { x: pos2.left, y: pos2.top, pageid: pos2.page },
        fxType,
      );
    } catch (error) {
      log(
        `SwapTokenPositions: Travel FX failed, but swap will continue: ${error.message}`,
      );
    }
  }

  /**
   * Resolves a token object by its Roll20 graphic ID.
   *
   * @param {string} id Token graphic ID.
   * @returns {object|null} Token object or null when not found.
   */
  function resolveTokenById(id) {
    return getObj('graphic', id) ?? null;
  }

  /**
   * Finds all graphic tokens with a given name on a specific page.
   *
   * @param {string} name Token name to search for.
   * @param {string} pageId Page to search on.
   * @returns {object[]} Array of matching token objects.
   */
  function resolveTokensByName(name, pageId) {
    return findObjs({ type: 'graphic', pageid: pageId, name }).filter(
      (t) => t.get('subtype') === 'token',
    );
  }

  /**
   * Resolves a token from an input string by ID first, then by name on the active page.
   *
   * @param {string} input Token ID or name to resolve.
   * @param {string} pageId Active page ID to scope name lookups.
   * @returns {{token:(object|null), error:(string|null)}} Resolved token or a targeted error message.
   */
  function resolveTokenInput(input, pageId) {
    const byId = resolveTokenById(input);
    if (byId) {
      return { token: byId, error: null };
    }

    const byName = resolveTokensByName(input, pageId);
    if (byName.length === 1) {
      return { token: byName[0], error: null };
    }
    if (byName.length > 1) {
      return {
        token: null,
        error: `Multiple tokens named "${input}" were found on the active page. Use the token ID instead to avoid ambiguity.`,
      };
    }
    return {
      token: null,
      error: `No token found with ID or name "${input}" on the active page.`,
    };
  }

  /**
   * Resolves and validates a pair of explicitly specified tokens for swapping.
   *
   * Resolution order per input: token ID first, then token name on the active page.
   * Fails with a targeted error on ambiguous names, missing tokens, same-token pairs, or cross-page pairs.
   *
   * @param {string} token1Input ID or name for the first token.
   * @param {string} token2Input ID or name for the second token.
   * @param {object} msg Roll20 chat message object.
   * @returns {Array<object>|null} Two token objects or null when resolution fails.
   */
  function resolveExplicitTokenPair(token1Input, token2Input, msg) {
    const pageId = Campaign().get('playerpageid');

    const result1 = resolveTokenInput(token1Input, pageId);
    if (result1.error) {
      whisperSenderError(msg, result1.error, 'Token Not Found');
      return null;
    }

    const result2 = resolveTokenInput(token2Input, pageId);
    if (result2.error) {
      whisperSenderError(msg, result2.error, 'Token Not Found');
      return null;
    }

    const token1 = result1.token;
    const token2 = result2.token;

    if (token1.get('_id') === token2.get('_id')) {
      whisperSenderError(
        msg,
        'Both <code>--token1</code> and <code>--token2</code> resolved to the same token. Please provide two distinct tokens.',
        'Selection Error',
      );
      return null;
    }

    if (token1.get('pageid') !== token2.get('pageid')) {
      whisperSenderError(
        msg,
        'Both tokens must be on the same page to perform a swap.',
        'Selection Error',
      );
      return null;
    }

    return [token1, token2];
  }

  /**
   * Validates selection and resolves the two tokens targeted for swapping.
   *
   * @param {object} msg Roll20 chat message object.
   * @returns {Array<object>|null} Two graphic token objects or null when invalid.
   */
  function getSelectedTokens(msg) {
    const selectedCount = (msg.selected || []).length;

    if (selectedCount !== 2) {
      const isSilent = SILENT_MANAGEMENT_FLAGS.some((flag) =>
        flag.test(msg.content),
      );
      if (!isSilent) {
        whisperSenderError(
          msg,
          `Please select exactly two tokens to perform a swap. (Currently selected: ${selectedCount})`,
          'Selection Error',
        );
      }
      return null;
    }

    const token1 = getObj('graphic', msg.selected[0]._id);
    const token2 = getObj('graphic', msg.selected[1]._id);

    if (!token1 || !token2) {
      whisperSenderError(
        msg,
        'One or both selected tokens could not be found.',
      );
      return null;
    }

    if (token1.get('pageid') !== token2.get('pageid')) {
      whisperSenderError(
        msg,
        'Please select two tokens on the same page to perform a swap.',
        'Selection Error',
      );
      return null;
    }

    return [token1, token2];
  }

  /**
   * Confirms both tokens reached their intended destination coordinates.
   *
   * @param {object} token1 First token object.
   * @param {object} token2 Second token object.
   * @param {{left:number, top:number}} pos1 Original position for token1.
   * @param {{left:number, top:number}} pos2 Original position for token2.
   * @returns {boolean} True when both tokens match expected post-swap coordinates.
   */
  function hasVerifiedSwapPosition(token1, token2, pos1, pos2) {
    return (
      token1.get('left') === pos2.left &&
      token1.get('top') === pos2.top &&
      token2.get('left') === pos1.left &&
      token2.get('top') === pos1.top
    );
  }

  /**
   * Resolves the current live token objects from stored ids.
   *
   * @param {string} token1Id First token id.
   * @param {string} token2Id Second token id.
   * @returns {{token1:object, token2:object}|null} Live tokens or null when missing.
   */
  function getLiveTokenPair(token1Id, token2Id) {
    const token1 = getObj('graphic', token1Id);
    const token2 = getObj('graphic', token2Id);
    if (!token1 || !token2) {
      return null;
    }
    return { token1, token2 };
  }

  /**
   * Resolves live tokens and handles missing-token failures consistently.
   *
   * @param {{token1Id:string, token2Id:string, msg:object}} context Token ids and message context.
   * @param {(tokens:{token1:object, token2:object})=>void} callback Work to execute when tokens are live.
   * @returns {boolean} True when callback ran; false when tokens were missing.
   */
  function withLiveTokens(context, callback) {
    const livePair = getLiveTokenPair(context.token1Id, context.token2Id);
    if (!livePair) {
      whisperSenderError(
        context.msg,
        'Swap cancelled because one or both tokens are no longer available.',
        'Swap Cancelled',
      );
      return false;
    }
    callback(livePair);
    return true;
  }

  /**
   * Spawns destination FX at both destination points after an optional delay.
   *
   * @param {{left:number, top:number, page:string}} pos1 Original position for token1.
   * @param {{left:number, top:number, page:string}} pos2 Original position for token2.
   * @param {string} destinationFx FX to spawn at destination points.
   * @param {number} delayMs Delay in milliseconds before spawning FX.
   * @returns {void}
   */
  function scheduleDestinationFx(pos1, pos2, destinationFx, delayMs) {
    const spawn = () => {
      spawnPointFx(pos2.left, pos2.top, destinationFx, pos2.page);
      spawnPointFx(pos1.left, pos1.top, destinationFx, pos1.page);
    };

    if (delayMs > 0) {
      setTimeout(spawn, delayMs);
      return;
    }

    spawn();
  }

  /**
   * Keeps travel FX visible for the configured travel duration.
   *
   * Roll20's spawnFxBetweenPoints API does not expose a duration argument for
   * built-in beam FX, so persistence is achieved by re-spawning bursts across
   * the travel window.
   *
   * @param {{left:number, top:number, page:string}} pos1 Start position.
   * @param {{left:number, top:number, page:string}} pos2 End position.
   * @param {string} travelFx Travel FX type.
   * @param {number} durationMs Duration in milliseconds.
   * @param {Function} onComplete Callback when the FX window completes.
   * @returns {void}
   */
  function sustainTravelFx(pos1, pos2, travelFx, durationMs, onComplete) {
    if (travelFx === 'none') {
      onComplete();
      return;
    }

    if (durationMs <= 0) {
      spawnTravelFx(pos1, pos2, travelFx);
      onComplete();
      return;
    }

    const pulseMs = 350;
    const startedAt = Date.now();

    const pulse = () => {
      spawnTravelFx(pos1, pos2, travelFx);
      if (Date.now() - startedAt >= durationMs) {
        onComplete();
        return;
      }
      setTimeout(pulse, pulseMs);
    };

    pulse();
  }

  /**
   * Animates both tokens toward their destination over the configured travel duration.
   *
   * @param {object} token1 First token object.
   * @param {object} token2 Second token object.
   * @param {{left:number, top:number}} pos1 Original position for token1.
   * @param {{left:number, top:number}} pos2 Original position for token2.
   * @param {number} durationMs Travel animation duration in milliseconds.
   * @param {object} msg Roll20 chat message object.
   * @param {Function} onComplete Callback after animation reaches the destination.
   * @returns {void}
   */
  function animateTravel(
    token1,
    token2,
    pos1,
    pos2,
    durationMs,
    msg,
    onComplete,
  ) {
    if (durationMs <= 0) {
      onComplete();
      return;
    }

    const token1Id = token1.get('_id');
    const token2Id = token2.get('_id');
    // Roll20 can coalesce very frequent token updates. Use paced, fixed steps so
    // travel visibly spans the configured duration.
    const maxTickMs = 120;
    const stepCount = Math.max(1, Math.ceil(durationMs / maxTickMs));
    const stepIntervalMs = durationMs / stepCount;
    let stepIndex = 0;

    const step = () => {
      stepIndex += 1;
      const progress = Math.min(stepIndex / stepCount, 1);

      const nextToken1Left = pos1.left + (pos2.left - pos1.left) * progress;
      const nextToken1Top = pos1.top + (pos2.top - pos1.top) * progress;
      const nextToken2Left = pos2.left + (pos1.left - pos2.left) * progress;
      const nextToken2Top = pos2.top + (pos1.top - pos2.top) * progress;

      if (
        !withLiveTokens(
          { token1Id, token2Id, msg },
          ({ token1: liveToken1, token2: liveToken2 }) => {
            liveToken1.set({ left: nextToken1Left, top: nextToken1Top });
            liveToken2.set({ left: nextToken2Left, top: nextToken2Top });
          },
        )
      ) {
        return;
      }

      if (progress >= 1) {
        onComplete();
        return;
      }

      setTimeout(step, stepIntervalMs);
    };

    setTimeout(step, stepIntervalMs);
  }

  /**
   * Swaps token coordinates, verifies the result, and runs a completion callback.
   *
   * @param {object} token1 First token object.
   * @param {object} token2 Second token object.
   * @param {{left:number, top:number, page:string}} pos1 Original position for token1.
   * @param {{left:number, top:number, page:string}} pos2 Original position for token2.
   * @param {object} msg Roll20 chat message object.
   * @param {Function} [onVerified] Optional callback executed after verification.
   * @param {Function} [onFailed] Optional callback executed when verification fails.
   * @returns {void}
   */
  function performSwap(token1, token2, pos1, pos2, msg, onVerified, onFailed) {
    const token1Id = token1.get('_id');
    const token2Id = token2.get('_id');

    if (
      !withLiveTokens(
        { token1Id, token2Id, msg },
        ({ token1: liveToken1, token2: liveToken2 }) => {
          liveToken1.set({ left: pos2.left, top: pos2.top });
          liveToken2.set({ left: pos1.left, top: pos1.top });
        },
      )
    ) {
      return;
    }

    const maxVerificationAttempts = 8;
    const verificationRetryMs = 50;
    let attempt = 0;

    const verifyThenFinalize = () => {
      const livePair = getLiveTokenPair(token1Id, token2Id);
      if (!livePair) {
        whisperSenderError(
          msg,
          'Swap cancelled because one or both tokens are no longer available.',
          'Swap Cancelled',
        );
        return;
      }

      if (
        hasVerifiedSwapPosition(livePair.token1, livePair.token2, pos1, pos2)
      ) {
        const token1Name = getSafeTokenName(livePair.token1, 'Token 1');
        const token2Name = getSafeTokenName(livePair.token2, 'Token 2');
        whisperSender(
          msg,
          `<strong>Swap Successful!</strong><br>${token1Name} ↔ ${token2Name}`,
          'Success',
        );
        if (typeof onVerified === 'function') {
          onVerified();
        }
        return;
      }

      attempt += 1;
      if (attempt >= maxVerificationAttempts) {
        whisperSenderError(msg, 'Token swap failed verification.');
        return;
      }

      setTimeout(verifyThenFinalize, verificationRetryMs);
    };

    verifyThenFinalize();
  }

  function runNormalTravelPhase(context) {
    const {
      token1,
      token2,
      pos1,
      pos2,
      travelFx,
      destinationFx,
      msg,
      msTravelTime,
      msSwapDelay,
      msBeforeDestinationFx,
    } = context;

    const runSwap = () => {
      performSwap(token1, token2, pos1, pos2, msg, () => {
        scheduleDestinationFx(pos1, pos2, destinationFx, msBeforeDestinationFx);
      });
    };

    let completedTracks = 0;
    const finishTravelPhase = () => {
      completedTracks += 1;
      if (completedTracks < 2) {
        return;
      }
      if (msSwapDelay > 0) {
        setTimeout(runSwap, msSwapDelay);
      } else {
        runSwap();
      }
    };

    animateTravel(
      token1,
      token2,
      pos1,
      pos2,
      msTravelTime,
      msg,
      finishTravelPhase,
    );
    sustainTravelFx(pos1, pos2, travelFx, msTravelTime, finishTravelPhase);
  }

  function runInvisibleTravelPhase(context) {
    const {
      token1,
      token2,
      pos1,
      pos2,
      travelFx,
      destinationFx,
      msg,
      msTravelTime,
      msSwapDelay,
      msBeforeDestinationFx,
    } = context;
    const revealRenderBufferMs = 120;
    const token1Id = token1.get('_id');
    const token2Id = token2.get('_id');

    const layer1 = token1.get('layer');
    const layer2 = token2.get('layer');

    const revealThenFx = () => {
      withLiveTokens(
        { token1Id, token2Id, msg },
        ({ token1: liveToken1, token2: liveToken2 }) => {
          // Restore layer — tokens appear at their new positions with no render artifact.
          liveToken1.set({ layer: layer1 });
          liveToken2.set({ layer: layer2 });
          setTimeout(
            () => scheduleDestinationFx(pos1, pos2, destinationFx, 0),
            revealRenderBufferMs,
          );
        },
      );
    };

    const doMove = () => {
      withLiveTokens(
        { token1Id, token2Id, msg },
        ({ token1: liveToken1, token2: liveToken2 }) => {
          // Tokens are on the GM layer so the position change is invisible to players.
          liveToken1.set({ left: pos2.left, top: pos2.top });
          liveToken2.set({ left: pos1.left, top: pos1.top });

          const token1Name = getSafeTokenName(liveToken1, 'Token 1');
          const token2Name = getSafeTokenName(liveToken2, 'Token 2');
          whisperSender(
            msg,
            `<strong>Swap Successful!</strong><br>${token1Name} ↔ ${token2Name}`,
            'Success',
          );

          if (msBeforeDestinationFx > 0) {
            setTimeout(revealThenFx, msBeforeDestinationFx);
          } else {
            revealThenFx();
          }
        },
      );
    };

    // Moving to gmlayer removes tokens from the player canvas instantly — no
    // position-change flash, unlike baseOpacity which Roll20 ignores on move renders.
    if (
      !withLiveTokens(
        { token1Id, token2Id, msg },
        ({ token1: liveToken1, token2: liveToken2 }) => {
          liveToken1.set({ layer: 'gmlayer' });
          liveToken2.set({ layer: 'gmlayer' });
        },
      )
    ) {
      return;
    }

    setTimeout(() => {
      sustainTravelFx(pos1, pos2, travelFx, msTravelTime, () => {});

      const msBeforeHiddenSwap = msTravelTime + msSwapDelay;
      if (msBeforeHiddenSwap > 0) {
        setTimeout(doMove, msBeforeHiddenSwap);
        return;
      }
      doMove();
    });
  }

  /**
   * Executes staged FX before performing the final swap.
   *
   * @param {object} config Effective swap configuration.
   * @param {object} token1 First token object.
   * @param {object} token2 Second token object.
   * @param {{left:number, top:number, page:string}} pos1 Original position for token1.
   * @param {{left:number, top:number, page:string}} pos2 Original position for token2.
   * @param {object} msg Roll20 chat message object.
   * @returns {void}
   */
  function executeSwapPipeline(config, token1, token2, pos1, pos2, msg) {
    const {
      originFx,
      travelFx,
      travelMode,
      destinationFx,
      originTime,
      travelTime,
      swapDelay,
      destinationDelay,
      destinationTime,
    } = config;

    const msBeforeTravel = originTime * 1000;
    const msTravelTime = travelTime * 1000;
    const msSwapDelay = swapDelay * 1000;
    const msBeforeDestinationFx = (destinationDelay + destinationTime) * 1000;
    const useInvisibleTravel = travelMode === 'invisible';

    spawnPointFx(pos1.left, pos1.top, originFx, pos1.page);
    spawnPointFx(pos2.left, pos2.top, originFx, pos2.page);

    setTimeout(() => {
      if (useInvisibleTravel) {
        runInvisibleTravelPhase({
          token1,
          token2,
          pos1,
          pos2,
          travelFx,
          destinationFx,
          msg,
          msTravelTime,
          msSwapDelay,
          msBeforeDestinationFx,
        });
        return;
      }

      runNormalTravelPhase({
        token1,
        token2,
        pos1,
        pos2,
        travelFx,
        destinationFx,
        msg,
        msTravelTime,
        msSwapDelay,
        msBeforeDestinationFx,
      });
    }, msBeforeTravel);
  }

  /**
   * Resolves an array of player ID or display-name inputs to canonical player IDs.
   *
   * Resolution order per entry: exact player ID first, then case-insensitive display name.
   * Emits an error whisper and returns null on ambiguous or unknown entries.
   * Deduplicates resolved IDs silently.
   *
   * @param {string[]} entries Raw player ID or display-name strings.
   * @param {object} msg Roll20 chat message object.
   * @returns {string[]|null} Canonical player ID array, or null on error.
   */
  function resolvePlayerList(entries, msg) {
    const allPlayers = findObjs({ type: 'player' });
    const resolved = new Set();

    for (const entry of entries) {
      const byId = getObj('player', entry);
      if (byId) {
        resolved.add(byId.get('_id'));
        continue;
      }

      const lower = entry.toLowerCase();
      const byName = allPlayers.filter(
        (p) => p.get('_displayname').toLowerCase() === lower,
      );

      if (byName.length > 1) {
        whisperSenderError(
          msg,
          `Multiple players share the display name "${entry}". Use the player ID instead.`,
          'Ambiguous Name',
        );
        return null;
      }

      if (byName.length === 0) {
        whisperSenderError(
          msg,
          `No player found with ID or name "${entry}".`,
          'Unknown Player',
        );
        return null;
      }

      resolved.add(byName[0].get('_id'));
    }

    return [...resolved];
  }

  /**
   * Creates a shared SwapTokens macro for the game when one does not already exist.
   *
   * @param {object} msgObj Roll20 chat message object.
   * @returns {void}
   */
  function installMacro(msgObj) {
    const macroName = 'SwapTokens';
    const existing = findObjs({ type: 'macro', name: macroName });

    if (existing.length > 0) {
      whisperSenderError(
        msgObj,
        `A macro named '<strong>${macroName}</strong>' already exists.`,
        'Macro Exists',
      );
      return;
    }

    createObj('macro', {
      name: macroName,
      action: '!swap-tokens',
      playerid: msgObj.playerid,
      isvisibleto: 'all',
    });

    whisperGMSuccess(
      `Global macro '<strong>${macroName}</strong>' has been created and is visible to all players.`,
      'Macro Installed',
    );
  }

  /**
   * Handles management flags such as help, settings, reset, and macro install.
   *
   * @param {object} msg Roll20 chat message object.
   * @param {boolean} isGM Whether the sender is a GM.
   * @returns {boolean} True when a management command was handled.
   */
  function handleManagementCommands(msg, isGM) {
    if (FLAG_HELP.test(msg.content)) {
      showHelp(msg);
      return true;
    }

    const hasManagementFlag = MANAGEMENT_FLAGS.some((flag) =>
      flag.test(msg.content),
    );
    if (!isGM && hasManagementFlag) {
      whisperSenderError(
        msg,
        'You do not have permission to use script management flags.',
        'Access Denied',
      );
      return true;
    }

    if (FLAG_SHOW_SETTINGS.test(msg.content)) {
      showSettings();
      return true;
    }
    if (FLAG_CHECK_SETTINGS.test(msg.content)) {
      validateSettings();
      return true;
    }
    if (FLAG_RESET_SETTINGS.test(msg.content)) {
      resetSettings();
      return true;
    }
    if (FLAG_INSTALL_MACRO.test(msg.content)) {
      installMacro(msg);
      return true;
    }

    // Check remove before set — FLAG_TOKEN_INPUT_USERS would otherwise match the remove variant.
    if (FLAG_TOKEN_INPUT_ACCESS.test(msg.content)) {
      handleTokenInputAccess(msg);
      return true;
    }
    if (FLAG_TOKEN_INPUT_USERS_REMOVE.test(msg.content)) {
      handleTokenInputUsersRemove(msg);
      return true;
    }
    if (FLAG_TOKEN_INPUT_USERS.test(msg.content)) {
      handleTokenInputUsersSet(msg);
      return true;
    }

    return false;
  }

  /**
   * Sets the persistent token-input access mode.
   *
   * @param {object} msg Roll20 chat message object.
   * @returns {void}
   */
  function handleTokenInputAccess(msg) {
    const result = parseStringFlag(
      msg.content,
      FLAG_TOKEN_INPUT_ACCESS,
      ALLOWED_TOKEN_INPUT_ACCESS_MODES,
    );
    if (result.valid) {
      state.SwapTokenPositions.tokenInputAccess = result.value;
      whisperGMSuccess(
        `Token input access set to <strong>${result.value}</strong>.`,
        'Access Updated',
      );
    } else {
      whisperSenderError(
        msg,
        `Invalid access mode: '${result.value}'.<br><br>Valid: ${ALLOWED_TOKEN_INPUT_ACCESS_MODES.join(', ')}`,
        'Invalid Input',
      );
    }
  }

  /**
   * Removes specific players from the token-input allow-list.
   *
   * @param {object} msg Roll20 chat message object.
   * @returns {void}
   */
  function handleTokenInputUsersRemove(msg) {
    const listResult = parseCommaListFlag(
      msg.content,
      FLAG_TOKEN_INPUT_USERS_REMOVE,
    );
    if (!listResult.found || listResult.values.length === 0) {
      whisperSenderError(
        msg,
        'Please provide at least one player ID or name to remove.',
        'Invalid Input',
      );
      return;
    }
    const toRemove = resolvePlayerList(listResult.values, msg);
    if (!toRemove) {
      return;
    }
    const removeSet = new Set(toRemove);
    state.SwapTokenPositions.tokenInputUsers =
      state.SwapTokenPositions.tokenInputUsers.filter(
        (id) => !removeSet.has(id),
      );
    const removedNames = toRemove.map(
      (id) => getObj('player', id)?.get('_displayname') ?? id,
    );
    whisperGMSuccess(
      `Removed from allow-list: <strong>${removedNames.join(', ')}</strong>.`,
      'Users Removed',
    );
    if (
      state.SwapTokenPositions.tokenInputAccess === 'selected-users' &&
      state.SwapTokenPositions.tokenInputUsers.length === 0
    ) {
      whisperGM(
        'The allow-list is now empty. While mode is <code>selected-users</code>, only the GM can use explicit token targeting.',
        'Allow-List Empty',
      );
    }
  }

  /**
   * Replaces the token-input allow-list with a new set of resolved players.
   *
   * @param {object} msg Roll20 chat message object.
   * @returns {void}
   */
  function handleTokenInputUsersSet(msg) {
    const listResult = parseCommaListFlag(msg.content, FLAG_TOKEN_INPUT_USERS);
    if (!listResult.found || listResult.values.length === 0) {
      whisperSenderError(
        msg,
        'Please provide at least one player ID or name.',
        'Invalid Input',
      );
      return;
    }
    const resolved = resolvePlayerList(listResult.values, msg);
    if (!resolved) {
      return;
    }
    state.SwapTokenPositions.tokenInputUsers = resolved;
    const names = resolved.map((id) => {
      const player = getObj('player', id);
      return player ? `${player.get('_displayname')} (${id})` : id;
    });
    whisperGMSuccess(
      `Allow-list updated. Users: <strong>${names.join(', ')}</strong>.`,
      'Users Updated',
    );
  }

  /**
   * Persists settings when a GM invokes save mode.
   *
   * @param {object} msg Roll20 chat message object.
   * @param {boolean} isGM Whether the sender is a GM.
   * @param {{valid:number, invalid:number}} tracker Valid/invalid counters.
   * @param {object} config Effective swap configuration to persist.
   * @returns {boolean} True when save mode was processed and execution should stop.
   */
  function processPersistence(msg, isGM, tracker, config) {
    if (!FLAG_SAVE.test(msg.content)) {
      return false;
    }

    if (!isGM) {
      whisperSenderError(
        msg,
        'You do not have permission to set game defaults.',
        'Access Denied',
      );
      return false;
    }

    if (tracker.valid > 0 && tracker.invalid === 0) {
      Object.assign(state.SwapTokenPositions, config);
      whisperGMSuccess(
        'New defaults saved to persistent state.',
        'Configuration',
      );
      showSettings();
    } else if (tracker.invalid > 0) {
      whisperGMError(
        'Settings not saved due to invalid parameters.',
        'Save Failed',
      );
    } else {
      whisperGMError(
        'No settings were provided to save. Please include flags like <code>--origin-fx</code> or <code>--preset</code> along with <code>--save</code>.',
        'Nothing to Save',
      );
    }
    return true;
  }

  /**
   * Resolves the token pair for the swap from explicit flags or selection.
   *
   * Returns null and emits an error whisper when resolution fails.
   *
   * @param {object} msg Roll20 chat message object.
   * @param {boolean} isGM Whether the sender is a GM.
   * @returns {Array<object>|null} Two token objects or null on failure.
   */
  function resolveSwapTokens(msg, isGM) {
    const hasToken1 = FLAG_TOKEN1.test(msg.content);
    const hasToken2 = FLAG_TOKEN2.test(msg.content);

    if (!hasToken1 && !hasToken2) {
      return getSelectedTokens(msg);
    }

    if (hasToken1 !== hasToken2) {
      whisperSenderError(
        msg,
        'Both <code>--token1</code> and <code>--token2</code> must be provided together. Omit both flags to use selection mode instead.',
        'Invalid Input',
      );
      return null;
    }

    const { tokenInputAccess, tokenInputUsers } = getSettings();
    if (tokenInputAccess === 'gm-only' && !isGM) {
      whisperSenderError(
        msg,
        'Explicit token targeting is restricted to the GM.',
        'Access Denied',
      );
      return null;
    }
    if (
      tokenInputAccess === 'selected-users' &&
      !isGM &&
      !tokenInputUsers.includes(msg.playerid)
    ) {
      whisperSenderError(
        msg,
        'You are not on the explicit token targeting allow-list.',
        'Access Denied',
      );
      return null;
    }

    const input1 = parseFreeStringFlag(msg.content, FLAG_TOKEN1);
    const input2 = parseFreeStringFlag(msg.content, FLAG_TOKEN2);
    if (!input1.found || !input2.found) {
      whisperSenderError(
        msg,
        'Please provide a value for both <code>--token1</code> and <code>--token2</code>.',
        'Invalid Input',
      );
      return null;
    }

    return resolveExplicitTokenPair(input1.value, input2.value, msg);
  }

  /**
   * Main API command handler for !swap-tokens.
   *
   * Supports two token input modes:
   * - Selection mode: exactly two tokens selected, no token flags.
   * - Explicit mode: both --token1 and --token2 provided (ID or name).
   *
   * @param {object} msg Roll20 chat message object.
   * @returns {void}
   */
  function handleSwapTokens(msg) {
    if (msg.type !== 'api' || !/^!swap-tokens\b/i.test(msg.content)) {
      return;
    }

    const isGM = playerIsGM(msg.playerid);

    if (handleManagementCommands(msg, isGM)) {
      return;
    }

    const tokens = resolveSwapTokens(msg, isGM);
    if (!tokens) {
      return;
    }

    const [token1, token2] = tokens;
    const pos1 = {
      left: token1.get('left'),
      top: token1.get('top'),
      page: token1.get('pageid'),
    };
    const pos2 = {
      left: token2.get('left'),
      top: token2.get('top'),
      page: token2.get('pageid'),
    };

    if (FLAG_INSTANT.test(msg.content)) {
      performSwap(token1, token2, pos1, pos2, msg);
      return;
    }

    const updateTracker = { valid: 0, invalid: 0 };
    const config = buildSwapConfig(msg, updateTracker);

    processPersistence(msg, isGM, updateTracker, config);

    if (updateTracker.valid > 0 && (!FLAG_SAVE.test(msg.content) || !isGM)) {
      const overrideDetails = [
        `<strong>Origin FX:</strong> ${config.originFx}`,
        `<strong>Travel FX:</strong> ${config.travelFx}`,
        `<strong>Travel Mode:</strong> ${config.travelMode}`,
        `<strong>Destination FX:</strong> ${config.destinationFx}`,
        `<strong>Origin Time:</strong> ${config.originTime}s`,
        `<strong>Travel Time:</strong> ${config.travelTime}s`,
        `<strong>Swap Delay:</strong> ${config.swapDelay}s`,
        `<strong>Destination Delay:</strong> ${config.destinationDelay}s`,
      ].join('<br>');
      whisperSender(msg, overrideDetails, 'Override Active', 'left');
    }

    const hasNoFx =
      config.originFx === 'none' &&
      config.travelFx === 'none' &&
      config.destinationFx === 'none';
    const hasNoTiming =
      config.originTime === 0 &&
      config.travelTime === 0 &&
      config.swapDelay === 0 &&
      config.destinationDelay === 0;

    if (hasNoFx && hasNoTiming) {
      performSwap(token1, token2, pos1, pos2, msg);
      return;
    }

    executeSwapPipeline(config, token1, token2, pos1, pos2, msg);
  }

  /**
   * Boots the script when Roll20 signals API readiness.
   * Initializes state, performs validation, logs status, and registers chat handlers.
   *
   * @returns {void}
   */
  on('ready', () => {
    initializeState();
    validateSettings(true);
    log(
      `-=> ${SCRIPT_NAME} v${SWAP_TOKEN_POSITIONS_VERSION} [Updated: ${SWAP_TOKEN_POSITIONS_LAST_UPDATED}] <=-`,
    );
    whisperGM(
      `<strong>MOD READY</strong> (v${SWAP_TOKEN_POSITIONS_VERSION})`,
      'Script Ready',
    );
    on('chat:message', handleSwapTokens);
  });
})();
