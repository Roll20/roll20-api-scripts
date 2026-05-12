import {
  ALLOWED_TOKEN_INPUT_ACCESS_MODES,
  FLAG_HELP,
  FLAG_INSTANT,
  FLAG_INSTALL_MACRO,
  FLAG_SAVE,
  FLAG_SHOW_SETTINGS,
  FLAG_CHECK_SETTINGS,
  FLAG_RESET_SETTINGS,
  FLAG_TOKEN1,
  FLAG_TOKEN2,
  FLAG_TOKEN_INPUT_ACCESS,
  FLAG_TOKEN_INPUT_USERS,
  FLAG_TOKEN_INPUT_USERS_REMOVE,
  MANAGEMENT_FLAGS,
} from './constants.js';
import { buildSwapConfig } from './config.js';
import { showHelp } from './help.js';
import {
  whisperGM,
  whisperGMError,
  whisperGMSuccess,
  whisperSenderError,
  whisperSender,
} from './messages.js';
import { parseCommaListFlag, parseFreeStringFlag, parseStringFlag } from './parsers.js';
import { getSettings, resetSettings, showSettings, validateSettings } from './state.js';
import {
  executeSwapPipeline,
  getSelectedTokens,
  performSwap,
  resolveExplicitTokenPair,
} from './swap.js';

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
    const byName = allPlayers.filter((p) => p.get('_displayname').toLowerCase() === lower);

    if (byName.length > 1) {
      whisperSenderError(
        msg,
        `Multiple players share the display name "${entry}". Use the player ID instead.`,
        'Ambiguous Name'
      );
      return null;
    }

    if (byName.length === 0) {
      whisperSenderError(msg, `No player found with ID or name "${entry}".`, 'Unknown Player');
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
export function installMacro(msgObj) {
  const macroName = 'SwapTokens';
  const existing = findObjs({ type: 'macro', name: macroName });

  if (existing.length > 0) {
    whisperSenderError(
      msgObj,
      `A macro named '<strong>${macroName}</strong>' already exists.`,
      'Macro Exists'
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
    'Macro Installed'
  );
}

/**
 * Handles management flags such as help, settings, reset, and macro install.
 *
 * @param {object} msg Roll20 chat message object.
 * @param {boolean} isGM Whether the sender is a GM.
 * @returns {boolean} True when a management command was handled.
 */
export function handleManagementCommands(msg, isGM) {
  if (FLAG_HELP.test(msg.content)) {
    showHelp(msg);
    return true;
  }

  const hasManagementFlag = MANAGEMENT_FLAGS.some((flag) => flag.test(msg.content));
  if (!isGM && hasManagementFlag) {
    whisperSenderError(
      msg,
      'You do not have permission to use script management flags.',
      'Access Denied'
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
  const result = parseStringFlag(msg.content, FLAG_TOKEN_INPUT_ACCESS, ALLOWED_TOKEN_INPUT_ACCESS_MODES);
  if (result.valid) {
    state.SwapTokenPositions.tokenInputAccess = result.value;
    whisperGMSuccess(
      `Token input access set to <strong>${result.value}</strong>.`,
      'Access Updated'
    );
  } else {
    whisperSenderError(
      msg,
      `Invalid access mode: '${result.value}'.<br><br>Valid: ${ALLOWED_TOKEN_INPUT_ACCESS_MODES.join(', ')}`,
      'Invalid Input'
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
  const listResult = parseCommaListFlag(msg.content, FLAG_TOKEN_INPUT_USERS_REMOVE);
  if (!listResult.found || listResult.values.length === 0) {
    whisperSenderError(msg, 'Please provide at least one player ID or name to remove.', 'Invalid Input');
    return;
  }
  const toRemove = resolvePlayerList(listResult.values, msg);
  if (!toRemove) {
    return;
  }
  const removeSet = new Set(toRemove);
  state.SwapTokenPositions.tokenInputUsers = state.SwapTokenPositions.tokenInputUsers.filter(
    (id) => !removeSet.has(id)
  );
  const removedNames = toRemove.map((id) => getObj('player', id)?.get('_displayname') ?? id);
  whisperGMSuccess(
    `Removed from allow-list: <strong>${removedNames.join(', ')}</strong>.`,
    'Users Removed'
  );
  if (
    state.SwapTokenPositions.tokenInputAccess === 'selected-users' &&
    state.SwapTokenPositions.tokenInputUsers.length === 0
  ) {
    whisperGM(
      'The allow-list is now empty. While mode is <code>selected-users</code>, only the GM can use explicit token targeting.',
      'Allow-List Empty'
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
    whisperSenderError(msg, 'Please provide at least one player ID or name.', 'Invalid Input');
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
    'Users Updated'
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
export function processPersistence(msg, isGM, tracker, config) {
  if (!FLAG_SAVE.test(msg.content)) {
    return false;
  }

  if (!isGM) {
    whisperSenderError(msg, 'You do not have permission to set game defaults.', 'Access Denied');
    return false;
  }

  if (tracker.valid > 0 && tracker.invalid === 0) {
    Object.assign(state.SwapTokenPositions, config);
    whisperGMSuccess('New defaults saved to persistent state.', 'Configuration');
    showSettings();
  } else if (tracker.invalid > 0) {
    whisperGMError('Settings not saved due to invalid parameters.', 'Save Failed');
  } else {
    whisperGMError(
      'No settings were provided to save. Please include flags like <code>--origin-fx</code> or <code>--preset</code> along with <code>--save</code>.',
      'Nothing to Save'
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
      'Invalid Input'
    );
    return null;
  }

  const { tokenInputAccess, tokenInputUsers } = getSettings();
  if (tokenInputAccess === 'gm-only' && !isGM) {
    whisperSenderError(msg, 'Explicit token targeting is restricted to the GM.', 'Access Denied');
    return null;
  }
  if (tokenInputAccess === 'selected-users' && !isGM && !tokenInputUsers.includes(msg.playerid)) {
    whisperSenderError(
      msg,
      'You are not on the explicit token targeting allow-list.',
      'Access Denied'
    );
    return null;
  }

  const input1 = parseFreeStringFlag(msg.content, FLAG_TOKEN1);
  const input2 = parseFreeStringFlag(msg.content, FLAG_TOKEN2);
  if (!input1.found || !input2.found) {
    whisperSenderError(
      msg,
      'Please provide a value for both <code>--token1</code> and <code>--token2</code>.',
      'Invalid Input'
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
export function handleSwapTokens(msg) {
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
    config.originFx === 'none' && config.travelFx === 'none' && config.destinationFx === 'none';
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
