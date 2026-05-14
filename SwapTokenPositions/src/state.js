import {
  ALLOWED_POINT_FX,
  ALLOWED_TRAVEL_FX,
  ALLOWED_TRAVEL_MODES,
  DELAY_MAX,
  DELAY_MIN,
  FACTORY_DEFAULTS,
  TIME_MAX,
  TIME_MIN,
} from "./constants.js";
import { whisperGM, whisperGMError, whisperGMSuccess } from "./messages.js";

/**
 * Ensures persisted script settings exist and backfills missing keys with defaults.
 *
 * @returns {void}
 */
export function initializeState() {
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
export function getSettings() {
  return state.SwapTokenPositions;
}

/**
 * Renders the current persisted settings to GM chat.
 *
 * @returns {void}
 */
export function showSettings() {
  const settings = getSettings();
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
  ].join("");
  whisperGM(settingsMsg, "Persistent Settings", "left");
}

/**
 * Resets persisted script settings to factory defaults.
 *
 * @returns {void}
 */
export function resetSettings() {
  state.SwapTokenPositions = { ...FACTORY_DEFAULTS };
  whisperGM(
    "<strong>Settings reset to factory defaults.</strong>",
    "Settings Reset",
  );
  showSettings();
}

/**
 * Validates persisted settings for supported FX values and timing ranges.
 *
 * @param {boolean} [silentOnSuccess=false] When true, success output is suppressed.
 * @returns {boolean} True when settings are valid; otherwise false.
 */
export function validateSettings(silentOnSuccess = false) {
  const settings = getSettings();
  const errors = [];

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
    errors.push(`Destination FX '${settings.destinationFx}' is no longer valid.`);
  }

  const timingFields = [
    { key: "originTime", label: "Origin Time", min: TIME_MIN, max: TIME_MAX },
    { key: "travelTime", label: "Travel Time", min: TIME_MIN, max: TIME_MAX },
    {
      key: "destinationTime",
      label: "Destination Time",
      min: TIME_MIN,
      max: TIME_MAX,
    },
    { key: "swapDelay", label: "Swap Delay", min: DELAY_MIN, max: DELAY_MAX },
    {
      key: "destinationDelay",
      label: "Destination Delay",
      min: DELAY_MIN,
      max: DELAY_MAX,
    },
  ];

  for (const { key, label, min, max } of timingFields) {
    const value = settings[key];
    if (typeof value !== "number" || value < min || value > max) {
      errors.push(`${label} (${value}) is out of range (${min}-${max}).`);
    }
  }

  if (errors.length > 0) {
    const errorMsg = [
      "<strong>Validation Issues Found:</strong><br>",
      errors.map((error) => `&bull; ${error}`).join("<br>"),
      "<br><em>Try running <code>!swap-tokens --reset-settings</code> to fix these issues.</em>",
    ].join("");
    whisperGMError(errorMsg, "Settings Validation");
    return false;
  }

  if (!silentOnSuccess) {
    whisperGMSuccess("All persistent settings are valid.", "Settings Validation");
  }
  return true;
}
