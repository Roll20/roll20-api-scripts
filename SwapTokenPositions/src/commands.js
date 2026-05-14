import {
  FLAG_HELP,
  FLAG_INSTANT,
  FLAG_INSTALL_MACRO,
  FLAG_SAVE,
  FLAG_SHOW_SETTINGS,
  FLAG_CHECK_SETTINGS,
  FLAG_RESET_SETTINGS,
  MANAGEMENT_FLAGS,
} from "./constants.js";
import { buildSwapConfig } from "./config.js";
import { showHelp } from "./help.js";
import { whisperGMError, whisperGMSuccess, whisperSenderError, whisperSender } from "./messages.js";
import { resetSettings, showSettings, validateSettings } from "./state.js";
import { executeSwapPipeline, getSelectedTokens, performSwap } from "./swap.js";

/**
 * Creates a shared SwapTokens macro for the game when one does not already exist.
 *
 * @param {object} msgObj Roll20 chat message object.
 * @returns {void}
 */
export function installMacro(msgObj) {
  const macroName = "SwapTokens";
  const existing = findObjs({ type: "macro", name: macroName });

  if (existing.length > 0) {
    whisperSenderError(
      msgObj,
      `A macro named '<strong>${macroName}</strong>' already exists.`,
      "Macro Exists",
    );
    return;
  }

  createObj("macro", {
    name: macroName,
    action: "!swap-tokens",
    playerid: msgObj.playerid,
    isvisibleto: "all",
  });

  whisperGMSuccess(
    `Global macro '<strong>${macroName}</strong>' has been created and is visible to all players.`,
    "Macro Installed",
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
      "You do not have permission to use script management flags.",
      "Access Denied",
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

  return false;
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
    whisperSenderError(
      msg,
      "You do not have permission to set game defaults.",
      "Access Denied",
    );
    return false;
  }

  if (tracker.valid > 0 && tracker.invalid === 0) {
    Object.assign(state.SwapTokenPositions, config);
    whisperGMSuccess("New defaults saved to persistent state.", "Configuration");
    showSettings();
  } else if (tracker.invalid > 0) {
    whisperGMError("Settings not saved due to invalid parameters.", "Save Failed");
  } else {
    whisperGMError(
      "No settings were provided to save. Please include flags like <code>--origin-fx</code> or <code>--preset</code> along with <code>--save</code>.",
      "Nothing to Save",
    );
  }
  return true;
}

/**
 * Main API command handler for !swap-tokens.
 *
 * @param {object} msg Roll20 chat message object.
 * @returns {void}
 */
export function handleSwapTokens(msg) {
  if (msg.type !== "api" || !/^!swap-tokens\b/i.test(msg.content)) {
    return;
  }

  const isGM = playerIsGM(msg.playerid);
  const tokens = getSelectedTokens(msg);

  if (handleManagementCommands(msg, isGM)) {
    return;
  }

  if (!tokens) {
    return;
  }

  const [token1, token2] = tokens;
  const pos1 = {
    left: token1.get("left"),
    top: token1.get("top"),
    page: token1.get("pageid"),
  };
  const pos2 = {
    left: token2.get("left"),
    top: token2.get("top"),
    page: token2.get("pageid"),
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
    ].join("<br>");
    whisperSender(msg, overrideDetails, "Override Active", "left");
  }

  const hasNoFx =
    config.originFx === "none" &&
    config.travelFx === "none" &&
    config.destinationFx === "none";
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
