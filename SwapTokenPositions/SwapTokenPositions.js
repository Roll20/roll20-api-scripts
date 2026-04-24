/**
 * SwapTokenPositions
 * Roll20 API Script to swap the positions of two selected tokens on the same page.
 *
 * Usage: Select exactly two tokens and run `!swap-tokens` in chat.
 *
 * - Shows a FX between tokens for a couple of seconds before swapping.
 * - Swaps positions, verifies, and notifies GM.
 *
 * @author MidNiteShadow7 (https://app.roll20.net/users/16506286/midniteshadow7)
 * @link https://app.roll20.net/forum/permalink/12727681/
 *
 * @version 1.0.0
 * @lastUpdated 2026-04-24
 * @license MIT
 */
const SwapTokenPositions = (() => {
  "use strict";

  /**
   * Script variables and configuration parameters are defined at the top for easy customization.
   * The script includes validation for FX types and colors, and provides help instructions.
   * The main functionality is triggered by the `!swap-tokens` command in chat.
   */
  // === Script version and last updated date ===
  const SWAP_TOKEN_POSITIONS_VERSION = "1.0.0";
  const SWAP_TOKEN_POSITIONS_LAST_UPDATED = "2026-04-21";

  // === Brand Color Palette ===
  const COLOR_GLOW_PURPLE = "#B388FF";
  const COLOR_DEEP_ARCANE_PURPLE = "#3D1A78";
  const COLOR_BG_SOFT_BLACK = "#0A0A12";
  const COLOR_TEXT_ARCANE_SILVER = "#E6DFFF";
  const COLOR_TEXT_DIM_SILVER = "#B8AFCF";
  const COLOR_ACCENT_PINK = "#FF4D6D";
  const COLOR_ACCENT_BLUE = "#3D5AFE";

  // UI Message Colors
  const COLOR_ERROR_RED = "#D32F2F";
  const COLOR_ERROR_DARK = "#B71C1C";
  const COLOR_ERROR_LIGHT = "#FFCDD2";
  const COLOR_SUCCESS_GREEN = "#2E7D32";
  const COLOR_SUCCESS_DARK = "#1B5E20";
  const COLOR_SUCCESS_LIGHT = "#E8F5E9";

  // === Script FX and color parameters (factory defaults) ===
  const SWAP_BEAM_DURATION_SECS = 2; // Default duration (seconds)
  const DURATION_MIN = 1;
  const DURATION_MAX = 10;
  const SWAP_FX_TYPE = "beam-magic"; // Default beam FX
  const SWAP_FINAL_FX_TYPE = "burst-magic"; // Default FX at new positions
  const SWAP_MODE = "transport"; // Default swap mode ("beams" or "transport")

  // === Allowed beam and burst FX types and colors for validation ===
  const ALLOWED_BEAM_FX = [
    "none",
    "beam-magic",
    "beam-acid",
    "beam-charm",
    "beam-fire",
    "beam-frost",
    "beam-holy",
    "beam-death",
  ];
  const ALLOWED_SWAP_MODES = ["beams", "transport"];
  const ALLOWED_BURST_FX = [
    "none",
    "burst-holy",
    "burst-magic",
    "burst-fire",
    "burst-acid",
    "burst-frost",
    "burst-smoke",
    "explode-fire",
    "explode-holy",
    "burn-fire",
    "burn-holy",
  ];

  // === Command Flags (Regex Constants) ===
  const FLAG_HELP = /--help\b/i;
  const FLAG_SHOW_SETTINGS = /--show-settings\b/i;
  const FLAG_CHECK_SETTINGS = /--check-settings\b/i;
  const FLAG_RESET_SETTINGS = /--reset-settings\b/i;
  const FLAG_SAVE = /--save\b/i;
  const FLAG_INSTALL_MACRO = /--install-macro\b/i;

  const FLAG_DURATION = /--duration\b/i;
  const FLAG_MODE = /--mode\b/i;
  const FLAG_BEAM_FX = /--beam-fx\b/i;
  const FLAG_BURST_FX = /--burst-fx\b/i;

  // Grouped Flags for bulk testing
  const MANAGEMENT_FLAGS = [
    FLAG_HELP,
    FLAG_SHOW_SETTINGS,
    FLAG_CHECK_SETTINGS,
    FLAG_RESET_SETTINGS,
    FLAG_SAVE,
    FLAG_INSTALL_MACRO,
  ];

  const SILENT_MANAGEMENT_FLAGS = [
    FLAG_HELP,
    FLAG_SHOW_SETTINGS,
    FLAG_CHECK_SETTINGS,
    FLAG_RESET_SETTINGS,
    FLAG_INSTALL_MACRO,
  ];

  const OVERRIDE_FLAGS = [
    FLAG_DURATION,
    FLAG_MODE,
    FLAG_BEAM_FX,
    FLAG_BURST_FX,
  ];

  const ALL_SCRIPT_FLAGS = [...MANAGEMENT_FLAGS, ...OVERRIDE_FLAGS];

  /**
   * Initializes the persistent state for SwapTokenPositions.
   * Sets factory defaults for any settings not already stored in state.
   *
   * @returns {void}
   */
  function initializeState() {
    if (!state.SwapTokenPositions) {
      state.SwapTokenPositions = {};
    }
    const factoryDefaults = {
      duration: SWAP_BEAM_DURATION_SECS,
      beamFx: SWAP_FX_TYPE,
      burstFx: SWAP_FINAL_FX_TYPE,
      swapMode: SWAP_MODE,
    };
    for (const [key, value] of Object.entries(factoryDefaults)) {
      if (state.SwapTokenPositions[key] === undefined) {
        state.SwapTokenPositions[key] = value;
      }
    }
  }

  /**
   * Returns the current effective settings from persistent state.
   *
   * @returns {object} - The current settings object.
   */
  function getSettings() {
    return state.SwapTokenPositions;
  }

  /**
   * Displays the current persistent settings to the GM as a styled whisper.
   *
   * @returns {void}
   */
  function showSettings() {
    const settings = getSettings();

    const settingsMsg = [
      `<strong>Duration:</strong> ${settings.duration}s<br>`,
      `<strong>Swap Mode:</strong> ${settings.swapMode}<br>`,
      `<strong>Beam FX:</strong> ${settings.beamFx}<br>`,
      `<strong>Burst FX:</strong> ${settings.burstFx}<br>`,
    ].join("");
    whisperGM(settingsMsg, "Persistent Settings");
  }

  /**
   * Resets all persistent settings back to factory defaults and confirms to the GM.
   *
   * @returns {void}
   */
  function resetSettings() {
    state.SwapTokenPositions = {
      duration: SWAP_BEAM_DURATION_SECS,
      beamFx: SWAP_FX_TYPE,
      burstFx: SWAP_FINAL_FX_TYPE,
      swapMode: SWAP_MODE,
    };
    whisperGM(
      "<strong>Settings reset to factory defaults.</strong>",
      "Settings Reset",
    );
    showSettings();
  }

  /**
   * Creates a global macro for SwapTokenPositions if one doesn't already exist.
   * The macro is named 'SwapTokens' and triggers the !swap-tokens command.
   *
   * @param {object} msgObj - The Roll20 message object.
   * @returns {void}
   */
  function installMacro(msgObj) {
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
   * Validates the current persistent settings against the allowed lists.
   * Reports any issues to the GM and suggests a reset if necessary.
   *
   * @param {boolean} [silentOnSuccess=false] - If true, only reports errors.
   * @returns {boolean} - True if all settings are valid, false otherwise.
   */
  function validateSettings(silentOnSuccess = false) {
    const settings = getSettings();
    const errors = [];

    if (settings.duration < DURATION_MIN || settings.duration > DURATION_MAX) {
      errors.push(
        `Duration (${settings.duration}) is out of range (${DURATION_MIN}-${DURATION_MAX}).`,
      );
    }
    if (!ALLOWED_BEAM_FX.includes(settings.beamFx)) {
      errors.push(`Beam FX '${settings.beamFx}' is no longer valid.`);
    }
    if (!ALLOWED_SWAP_MODES.includes(settings.swapMode)) {
      errors.push(`Swap Mode '${settings.swapMode}' is no longer valid.`);
    }
    if (!ALLOWED_BURST_FX.includes(settings.burstFx)) {
      errors.push(`Burst FX '${settings.burstFx}' is no longer valid.`);
    }

    if (errors.length > 0) {
      const errorMsg = [
        "<strong>Validation Issues Found:</strong><br>",
        errors.map((err) => `&bull; ${err}`).join("<br>"),
        "<br><em>Try running <code>!swap-tokens --reset-settings</code> to fix these issues.</em>",
      ].join("");
      whisperGMError(errorMsg, "Settings Validation");
      return false;
    }

    if (!silentOnSuccess) {
      whisperGMSuccess(
        "All persistent settings are valid.",
        "Settings Validation",
      );
    }
    return true;
  }

  /**
   * Displays help instructions to the sender as a styled whisper.
   * Lists usage, available command options, and a description of the script.
   *
   * @param {object} msgObj - The Roll20 message object.
   * @returns {void}
   */
  function showHelp(msgObj) {
    const helpMsg = [
      `<strong>SwapTokenPositions</strong> v${SWAP_TOKEN_POSITIONS_VERSION}<br>`,
      `Last Updated: ${SWAP_TOKEN_POSITIONS_LAST_UPDATED}<br>`,
      "<br><strong>Basic Usage:</strong><br>",
      "<code>!swap-tokens</code> &mdash; Swap 2 selected tokens using current defaults.<br>",
      "<br><strong>One-Time Overrides (Everyone):</strong><br>",
      "<em>Use these to customize a single swap (e.g. in a character macro).</em><br>",
      `<code>--duration &lt;1-10&gt;</code> &mdash; Seconds to play FX before swapping.<br>`,
      `<code>--mode &lt;type&gt;</code> &mdash; Style. Valid: <code>${ALLOWED_SWAP_MODES.join(", ")}</code><br>`,
      `<code>--beam-fx &lt;type&gt;</code> &mdash; Beam FX. Valid: <code>${ALLOWED_BEAM_FX.join(", ")}</code><br>`,
      `<code>--burst-fx &lt;type&gt;</code> &mdash; Burst FX. Valid: <code>${ALLOWED_BURST_FX.join(", ")}</code><br>`,
      "<br><strong>Global Configuration (GM Only):</strong><br>",
      "<em>To change the script's permanent defaults, use flags with <code>--save</code>.</em><br>",
      "<code>--save</code> &mdash; Commit provided flags as the new global defaults.<br>",
      "<code>--show-settings</code> &mdash; View current persistent defaults.<br>",
      "<code>--reset-settings</code> &mdash; Restore all factory defaults.<br>",
      "<code>--install-macro</code> &mdash; Create a global 'SwapTokens' macro.<br>",
      "<br><strong>Example (Set new global default):</strong><br>",
      "<code>!swap-tokens --duration 5 --mode beams --save</code><br>",
    ].join("");
    whisperSender(msgObj, helpMsg, "SwapTokenPositions Help", "left");
  }

  /**
   * Generates a styled message box using branding variables.
   *
   * @param {string} msg - The message to display inside the styled box.
   * @param {string} [align="center"] - Text alignment ("left", "center", or "right").
   * @param {string} [header=""] - Optional header text for the top of the box.
   * @returns {string} - The HTML string for the styled message box.
   */
  function generateStyledMessage(msg, align = "center", header = "") {
    const padding = align === "center" ? "3px 0px" : "3px 8px";
    const mainStyle = [
      "width:100%",
      "border-radius:4px",
      `box-shadow:1px 1px 1px ${COLOR_TEXT_DIM_SILVER}`,
      `text-align:${align}`,
      "vertical-align:middle",
      "margin:0px auto",
      `border:1px solid ${COLOR_BG_SOFT_BLACK}`,
      `color:${COLOR_TEXT_ARCANE_SILVER}`,
      `background-image:-webkit-linear-gradient(-45deg,${COLOR_ACCENT_BLUE} 0%,${COLOR_ACCENT_PINK} 100%)`,
      "overflow:hidden",
    ].join(";");

    const headerHtml = header
      ? `<div style="background:${COLOR_BG_SOFT_BLACK}; color:${COLOR_GLOW_PURPLE}; padding:2px 5px; border-bottom:1px solid ${COLOR_BG_SOFT_BLACK}; font-variant:small-caps; font-weight:bold; text-align:center">${header}</div>`
      : "";
    const contentHtml = `<div style="padding:${padding}"><strong>${msg}</strong></div>`;

    return `<div style='${mainStyle}'>${headerHtml}${contentHtml}</div>`;
  }

  /**
   * Generates a styled error message box with red/danger branding.
   *
   * @param {string} msg - The error message to display inside the styled box.
   * @param {string} [header="Error"] - Header text for the error box.
   * @param {string} [align="left"] - Text alignment ("left", "center", or "right").
   * @returns {string} - The HTML string for the styled error message box.
   */
  function generateStyledErrorMessage(msg, header = "Error", align = "left") {
    const mainStyle = [
      "width:100%",
      "border-radius:4px",
      `box-shadow:1px 1px 1px ${COLOR_ERROR_RED}`,
      `text-align:${align}`,
      "vertical-align:middle",
      "margin:0px auto",
      `border:1px solid ${COLOR_ERROR_DARK}`,
      `color:${COLOR_ERROR_LIGHT}`,
      `background-color:${COLOR_ERROR_DARK}`,
      `background-image:-webkit-linear-gradient(-45deg,${COLOR_ERROR_DARK} 0%,${COLOR_ERROR_RED} 100%)`,
      "overflow:hidden",
    ].join(";");

    const headerHtml = `<div style="background:${COLOR_ERROR_DARK}; color:${COLOR_ERROR_LIGHT}; padding:2px 5px; border-bottom:1px solid ${COLOR_ERROR_DARK}; font-variant:small-caps; font-weight:bold; text-align:center">[!] ${header}</div>`;
    const contentHtml = `<div style="padding:3px 8px"><strong>${msg}</strong></div>`;

    return `<div style='${mainStyle}'>${headerHtml}${contentHtml}</div>`;
  }

  /**
   * Generates a styled success message box with green branding.
   *
   * @param {string} msg - The success message to display inside the styled box.
   * @param {string} [header="Success"] - Header text for the success box.
   * @returns {string} - The HTML string for the styled success message box.
   */
  function generateStyledSuccessMessage(msg, header = "Success") {
    const mainStyle = [
      "width:100%",
      "border-radius:4px",
      `box-shadow:1px 1px 1px ${COLOR_SUCCESS_GREEN}`,
      "text-align:center",
      "vertical-align:middle",
      "margin:0px auto",
      `border:1px solid ${COLOR_SUCCESS_DARK}`,
      `color:${COLOR_SUCCESS_LIGHT}`,
      `background-image:-webkit-linear-gradient(-45deg,${COLOR_SUCCESS_DARK} 0%,${COLOR_SUCCESS_GREEN} 100%)`,
      "overflow:hidden",
    ].join(";");

    const headerHtml = `<div style="background:${COLOR_SUCCESS_DARK}; color:${COLOR_SUCCESS_LIGHT}; padding:2px 5px; border-bottom:1px solid ${COLOR_SUCCESS_DARK}; font-variant:small-caps; font-weight:bold; text-align:center">✅ ${header}</div>`;
    const contentHtml = `<div style="padding:3px 8px"><strong>${msg}</strong></div>`;

    return `<div style='${mainStyle}'>${headerHtml}${contentHtml}</div>`;
  }

  /**
   * Sends a formatted whisper message to the GM using brand colors and styles.
   *
   * @param {string} msg - The message to send.
   * @param {string} [header=""] - Optional header text.
   * @param {string} [align="center"] - Text alignment.
   * @returns {void}
   */
  function whisperGM(msg, header = "", align = "center") {
    sendChat(
      "SwapTokenPositions",
      `/w GM ${generateStyledMessage(msg, align, header)}`,
    );
  }

  /**
   * Sends a formatted whisper message to the message sender.
   *
   * @param {object} msgObj - The Roll20 message object.
   * @param {string} text - The message to send.
   * @param {string} [header=""] - Optional header text.
   * @param {string} [align="center"] - Text alignment.
   * @returns {void}
   */
  function whisperSender(msgObj, text, header = "", align = "center") {
    const p = getObj("player", msgObj.playerid);
    const name = p ? p.get("_displayname") : msgObj.who;
    sendChat(
      "SwapTokenPositions",
      `/w "${name}" ${generateStyledMessage(text, align, header)}`,
    );
  }

  /**
   * Sends a formatted error whisper message to the message sender.
   *
   * @param {object} msgObj - The Roll20 message object.
   * @param {string} text - The error message to send.
   * @param {string} [header="Error"] - Optional header text.
   * @param {string} [align="left"] - Text alignment.
   * @returns {void}
   */
  function whisperSenderError(msgObj, text, header = "Error", align = "left") {
    const p = getObj("player", msgObj.playerid);
    const name = p ? p.get("_displayname") : msgObj.who;
    sendChat(
      "SwapTokenPositions",
      `/w "${name}" ${generateStyledErrorMessage(text, header, align)}`,
    );
  }

  /**
   * Sends a formatted chat announcement to all players using brand colors and styles.
   *
   * @param {string} msg - The message to announce.
   * @param {string} [header=""] - Optional header text.
   * @returns {void}
   */
  function announce(msg, header = "") {
    sendChat(
      "SwapTokenPositions",
      generateStyledMessage(msg, "center", header),
    );
  }

  /**
   * Sends a formatted success whisper message to the GM using the green success style.
   *
   * @param {string} text - The success message to send.
   * @param {string} [header="Success"] - Optional header text.
   * @returns {void}
   */
  function whisperGMSuccess(text, header = "Success") {
    sendChat(
      "SwapTokenPositions",
      `/w GM ${generateStyledSuccessMessage(text, header)}`,
    );
  }

  /**
   * Sends a formatted error whisper message to the GM using the red danger style.
   *
   * @param {string} text - The error message to send.
   * @param {string} [header="Error"] - Optional header text.
   * @param {string} [align="left"] - Text alignment.
   * @returns {void}
   */
  function whisperGMError(text, header = "Error", align = "left") {
    sendChat(
      "SwapTokenPositions",
      `/w GM ${generateStyledErrorMessage(text, header, align)}`,
    );
  }

  /**
   * Spawns a beam FX between two points, with validation.
   * Falls back to default FX type if the provided type is invalid.
   *
   * @param {number} fromX - Start X coordinate.
   * @param {number} fromY - Start Y coordinate.
   * @param {number} toX - End X coordinate.
   * @param {number} toY - End Y coordinate.
   * @param {string} pageId - Page ID for the FX.
   * @param {string} [fxType=SWAP_FX_TYPE] - Beam FX type (e.g. "beam-magic").
   * @returns {void}
   */
  function spawnBeamFx(fromX, fromY, toX, toY, pageId, fxType = SWAP_FX_TYPE) {
    if (fxType === "none") {
      return;
    }

    if (!ALLOWED_BEAM_FX.includes(fxType)) {
      whisperGMError(
        `Invalid beam FX type: ${fxType}.<br><br>Using default: ${SWAP_FX_TYPE}`,
        "FX Compatibility",
      );
      fxType = SWAP_FX_TYPE;
    }

    spawnFxBetweenPoints(
      { x: fromX, y: fromY, pageid: pageId },
      { x: toX, y: toY, pageid: pageId },
      fxType,
    );
  }

  /**
   * Spawns a burst/final FX at a position, with validation.
   * Falls back to default burst FX type if the provided type is invalid.
   *
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
   * @param {string} fxType - Burst FX type (e.g. "burst-holy").
   * @param {string} pageId - Page ID.
   * @returns {void}
   */
  function spawnFinalFx(x, y, fxType, pageId) {
    if (fxType === "none") {
      return;
    }

    if (!ALLOWED_BURST_FX.includes(fxType)) {
      whisperGMError(
        `Invalid burst FX type: ${fxType}.<br><br>Using default: ${SWAP_FINAL_FX_TYPE}`,
        "FX Compatibility",
      );
      fxType = SWAP_FINAL_FX_TYPE;
    }

    spawnFx(x, y, fxType, pageId);
  }

  /**
   * Parses the --duration flag from the command content.
   *
   * @param {object} msgObj - The Roll20 message object.
   * @param {object} updateTracker - Object to track valid/invalid updates.
   * @returns {number} - The beam duration in seconds.
   */
  function parseDuration(msgObj, updateTracker) {
    const match = new RegExp(
      String.raw`${FLAG_DURATION.source}\s+(\d+)`,
      "i",
    ).exec(msgObj.content);
    if (!match) {
      return getSettings().duration;
    }
    const requested = Number.parseInt(match[1], 10);
    if (requested >= DURATION_MIN && requested <= DURATION_MAX) {
      updateTracker.valid++;
      return requested;
    }
    updateTracker.invalid++;
    whisperSenderError(
      msgObj,
      `Duration must be between ${DURATION_MIN} and ${DURATION_MAX} seconds.<br><br>Using default: ${getSettings().duration}s`,
      "Invalid Input",
    );
    return getSettings().duration;
  }

  /**
   * Parses the --beam-fx flag from the command content.
   *
   * @param {object} msgObj - The Roll20 message object.
   * @param {object} updateTracker - Object to track valid/invalid updates.
   * @returns {string} - The beam FX type.
   */
  function parseBeamFx(msgObj, updateTracker) {
    const match = new RegExp(
      String.raw`${FLAG_BEAM_FX.source}\s+(\S+)`,
      "i",
    ).exec(msgObj.content);
    if (!match) {
      return getSettings().beamFx;
    }
    if (ALLOWED_BEAM_FX.includes(match[1])) {
      updateTracker.valid++;
      return match[1];
    }
    updateTracker.invalid++;
    whisperSenderError(
      msgObj,
      `Invalid beam FX: ${match[1]}.<br><br>Valid: ${ALLOWED_BEAM_FX.join(", ")}<br><br>Using default: ${getSettings().beamFx}`,
      "Invalid Input",
    );
    return getSettings().beamFx;
  }

  /**
   * Parses the --mode flag from the command content.
   *
   * @param {object} msgObj - The Roll20 message object.
   * @param {object} updateTracker - Object to track valid/invalid updates.
   * @returns {string} - The swap mode ("beams" or "transport").
   */
  function parseSwapMode(msgObj, updateTracker) {
    const match = new RegExp(String.raw`${FLAG_MODE.source}\s+(\S+)`, "i").exec(
      msgObj.content,
    );
    if (!match) {
      return getSettings().swapMode;
    }
    if (ALLOWED_SWAP_MODES.includes(match[1].toLowerCase())) {
      updateTracker.valid++;
      return match[1].toLowerCase();
    }
    updateTracker.invalid++;
    whisperSenderError(
      msgObj,
      `Invalid swap mode: ${match[1]}.<br><br>Valid: ${ALLOWED_SWAP_MODES.join(", ")}<br><br>Using default: ${getSettings().swapMode}`,
      "Invalid Input",
    );
    return getSettings().swapMode;
  }

  /**
   * Parses the --burst-fx flag from the command content.
   *
   * @param {object} msgObj - The Roll20 message object.
   * @param {object} updateTracker - Object to track valid/invalid updates.
   * @returns {string} - The burst FX type.
   */
  function parseBurstFx(msgObj, updateTracker) {
    const match = new RegExp(
      String.raw`${FLAG_BURST_FX.source}\s+(\S+)`,
      "i",
    ).exec(msgObj.content);
    if (!match) {
      return getSettings().burstFx;
    }
    if (ALLOWED_BURST_FX.includes(match[1])) {
      updateTracker.valid++;
      return match[1];
    }
    updateTracker.invalid++;
    whisperSenderError(
      msgObj,
      `Invalid burst FX: ${match[1]}.<br><br>Valid: ${ALLOWED_BURST_FX.join(", ")}<br><br>Using default: ${getSettings().burstFx}`,
      "Invalid Input",
    );
    return getSettings().burstFx;
  }

  /**
   * Processes management commands like --help, --show-settings, etc.
   *
   * @param {object} msg - The Roll20 message object.
   * @param {boolean} isGM - Whether the sender is a GM.
   * @returns {boolean} - True if a command was handled and we should exit.
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
   * Handles the persistent saving of settings if requested.
   *
   * @param {object} msg - The Roll20 message object.
   * @param {boolean} isGM - Whether the sender is a GM.
   * @param {object} tracker - The update tracker object.
   * @param {object} values - The parsed override values.
   * @returns {boolean} - True if we should exit after processing.
   */
  function processPersistence(msg, isGM, tracker, values) {
    if (!FLAG_SAVE.test(msg.content) || !isGM) {
      return false;
    }

    if (tracker.valid > 0 && tracker.invalid === 0) {
      state.SwapTokenPositions.duration = values.duration;
      state.SwapTokenPositions.swapMode = values.mode;
      state.SwapTokenPositions.beamFx = values.beamFx;
      state.SwapTokenPositions.burstFx = values.burstFx;
      whisperGMSuccess(
        "New defaults saved to persistent state.",
        "Configuration",
      );
      showSettings();
    } else if (tracker.invalid > 0) {
      whisperGMError(
        "Settings not saved due to invalid parameters.",
        "Save Failed",
      );
    } else {
      whisperGMError(
        "No settings were provided to save. Please include flags like <code>--duration</code> or <code>--mode</code> along with <code>--save</code>.",
        "Nothing to Save",
      );
    }
    return true;
  }

  /**
   * Validates selection and retrieves the two tokens for swapping.
   *
   * @param {object} msg - The Roll20 message object.
   * @returns {object[]|null} - Array of two token objects, or null if invalid.
   */
  function getSelectedTokens(msg) {
    const selectedCount = (msg.selected || []).length;

    if (selectedCount !== 2) {
      // Suppress error if this is a "silent" management command (help, reset, etc.)
      // Note: --save is intentionally excluded from silent flags as it is used with move commands.
      const isSilent = SILENT_MANAGEMENT_FLAGS.some((flag) =>
        flag.test(msg.content),
      );

      if (!isSilent) {
        whisperSenderError(
          msg,
          `Please select exactly two tokens to perform a swap. (Currently selected: ${selectedCount})`,
          "Selection Error",
        );
      }
      return null;
    }

    const token1 = getObj("graphic", msg.selected[0]._id);
    const token2 = getObj("graphic", msg.selected[1]._id);

    if (!token1 || !token2) {
      whisperSenderError(
        msg,
        "One or both selected tokens could not be found.",
      );
      return null;
    }

    return [token1, token2];
  }

  /**
   * Handles the !swap-tokens API command.
   * Parses command options, validates token selection, and executes the swap logic.
   *
   * @param {object} msg - The Roll20 chat message object.
   * @returns {void}
   */
  const handleSwapTokens = (msg) => {
    if (msg.type !== "api" || !/^!swap-tokens\b/i.test(msg.content)) {
      return;
    }

    const isGM = playerIsGM(msg.playerid);

    // 1. Always validate tokens first (as requested for testing/visibility)
    const tokens = getSelectedTokens(msg);

    // 2. Handle Management Commands (Help, Reset, etc.)
    if (handleManagementCommands(msg, isGM)) {
      return;
    }

    // 3. Exit if tokens were invalid and no management command was handled
    if (!tokens) {
      return;
    }

    // 4. Parse Overrides
    const updateTracker = { valid: 0, invalid: 0 };
    const overrides = {
      duration: parseDuration(msg, updateTracker),
      mode: parseSwapMode(msg, updateTracker),
      beamFx: parseBeamFx(msg, updateTracker),
      burstFx: parseBurstFx(msg, updateTracker),
    };

    // 3. Handle Persistence (--save)
    if (processPersistence(msg, isGM, updateTracker, overrides)) {
      return;
    }

    // 4. Feedback for one-time overrides
    if (updateTracker.valid > 0 && !FLAG_SAVE.test(msg.content)) {
      const overrideDetails = [
        `<strong>Duration:</strong> ${overrides.duration}s`,
        `<strong>Mode:</strong> ${overrides.mode}`,
        `<strong>Beam:</strong> ${overrides.beamFx}`,
        `<strong>Burst:</strong> ${overrides.burstFx}`,
      ].join("<br>");
      whisperSender(msg, overrideDetails, "Override Active");
    }

    const [token1, token2] = tokens;
    const position1 = {
      left: token1.get("left"),
      top: token1.get("top"),
      page: token1.get("pageid"),
    };
    const position2 = {
      left: token2.get("left"),
      top: token2.get("top"),
      page: token2.get("pageid"),
    };

    const bounceInterval = 250;
    const maxBounces = Math.max(
      1,
      Math.floor((overrides.duration * 1000) / bounceInterval),
    );
    let bounceCount = 0;

    /**
     * Finalizes the token swap by updating coordinates on the Roll20 objects.
     * Verifies the swap was successful and triggers the final arrival FX.
     *
     * @returns {void}
     */
    function swapPositions() {
      token1.set({ left: position2.left, top: position2.top });
      token2.set({ left: position1.left, top: position1.top });

      const isVerified =
        token1.get("left") === position2.left &&
        token2.get("left") === position1.left;

      if (isVerified) {
        spawnFinalFx(
          position2.left,
          position2.top,
          overrides.burstFx,
          position2.page,
        );
        spawnFinalFx(
          position1.left,
          position1.top,
          overrides.burstFx,
          position1.page,
        );
        whisperSender(
          msg,
          `<strong>Swap Successful!</strong><br>${token1.get("name") || "Token 1"} &harr; ${token2.get("name") || "Token 2"}`,
          "Success",
        );
      } else {
        whisperSenderError(msg, "Token swap failed verification.");
      }
    }

    /**
     * Executes the 'beams' animation style.
     * Recursively spawns beams back and forth between tokens until the duration expires.
     *
     * @returns {void}
     */
    function doBeams() {
      if (bounceCount >= maxBounces) {
        swapPositions();
        return;
      }
      const from = bounceCount % 2 === 0 ? position1 : position2;
      const to = bounceCount % 2 === 0 ? position2 : position1;

      spawnBeamFx(
        from.left,
        from.top,
        to.left,
        to.top,
        from.page,
        overrides.beamFx,
      );
      bounceCount++;
      setTimeout(doBeams, bounceInterval);
    }

    /**
     * Executes the 'transport' animation style.
     * Spawns vertical light columns and simultaneous shimmer bursts at both locations.
     *
     * @returns {void}
     */
    function doTransport() {
      if (bounceCount >= maxBounces) {
        swapPositions();
        return;
      }
      [position1, position2].forEach((pos) => {
        if (overrides.beamFx !== "none") {
          spawnFxBetweenPoints(
            { x: pos.left, y: pos.top - 70, pageid: pos.page },
            { x: pos.left, y: pos.top + 70, pageid: pos.page },
            overrides.beamFx,
          );
        }
        if (overrides.burstFx !== "none") {
          spawnFx(pos.left, pos.top, overrides.burstFx, pos.page);
        }
      });
      bounceCount++;
      setTimeout(doTransport, bounceInterval);
    }

    // Bypass animation if all FX are disabled
    if (overrides.beamFx === "none" && overrides.burstFx === "none") {
      swapPositions();
      return;
    }

    if (overrides.mode === "beams") {
      doBeams();
    } else {
      doTransport();
    }
  };

  /**
   * Initializes persistent state, validates settings, and logs the ready message.
   * Called once when the API sandbox is ready.
   *
   * @returns {void}
   */
  const checkInstall = () => {
    initializeState();
    validateSettings(true); // Silent check on load
    log(
      `-=> SwapTokenPositions v${SWAP_TOKEN_POSITIONS_VERSION} [Updated: ${SWAP_TOKEN_POSITIONS_LAST_UPDATED}] <=-`,
    );
    whisperGM(
      `<strong>MOD READY</strong> (v${SWAP_TOKEN_POSITIONS_VERSION})`,
      "Script Ready",
    );
  };

  /**
   * Registers all Roll20 event handlers for the script.
   *
   * @returns {void}
   */
  const registerEventHandlers = () => {
    on("chat:message", handleSwapTokens);
  };

  on("ready", () => {
    checkInstall();
    registerEventHandlers();
  });

  return {};
})();
