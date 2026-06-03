import {
  ALLOWED_POINT_FX,
  ALLOWED_PRESETS,
  ALLOWED_TRAVEL_FX,
  ALLOWED_TRAVEL_MODES,
  DELAY_MAX,
  DELAY_MIN,
  FLAG_DESTINATION_DELAY,
  FLAG_DESTINATION_FX,
  FLAG_DESTINATION_TIME,
  FLAG_LEGACY_BEAM_FX,
  FLAG_LEGACY_BURST_FX,
  FLAG_LEGACY_DURATION,
  FLAG_LEGACY_MODE,
  FLAG_ORIGIN_FX,
  FLAG_ORIGIN_TIME,
  FLAG_PRESET,
  FLAG_SWAP_DELAY,
  FLAG_TRAVEL_FX,
  FLAG_TRAVEL_MODE,
  FLAG_TRAVEL_TIME,
  FX_PRESETS,
  TIME_MAX,
  TIME_MIN,
} from "./constants.js";
import { whisperSender, whisperSenderError } from "./messages.js";
import {
  parseFloatFlag,
  parseStringFlag,
  processNumericFlags,
  processStringFlags,
} from "./parsers.js";
import { getSettings } from "./state.js";

/**
 * Applies deprecated flags to the active config while emitting compatibility warnings.
 *
 * @param {object} msg Roll20 chat message object.
 * @param {object} config Mutable config object.
 * @param {{valid:number, invalid:number}} updateTracker Valid/invalid counters.
 * @returns {void}
 */
export function applyLegacyFlags(msg, config, updateTracker) {
  const content = msg.content;
  const legacyModeToPreset = {
    beams: "lightning",
    transport: "transport",
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
        "Deprecated Flag",
        "left",
      );
      Object.assign(config, FX_PRESETS[mappedPreset]);
      updateTracker.valid++;
    } else {
      updateTracker.invalid++;
      whisperSenderError(
        msg,
        `Invalid value for deprecated <code>--mode</code>: '${modeResult.value}'.<br><br>Valid: ${Object.keys(legacyModeToPreset).join(", ")}`,
        "Invalid Input",
      );
    }
  }

  const fxMappings = [
    {
      flag: FLAG_LEGACY_BEAM_FX,
      key: "travelFx",
      allowed: ALLOWED_TRAVEL_FX,
      oldName: "--beam-fx",
      newName: "--travel-fx",
    },
    {
      flag: FLAG_LEGACY_BURST_FX,
      key: "destinationFx",
      allowed: ALLOWED_POINT_FX,
      oldName: "--burst-fx",
      newName: "--destination-fx",
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
      "Deprecated Flag",
      "left",
    );
    if (result.valid) {
      config[key] = result.value;
      updateTracker.valid++;
    } else {
      updateTracker.invalid++;
      whisperSenderError(
        msg,
        `Invalid value for deprecated <code>${oldName}</code>: '${result.value}'.<br><br>Valid: ${allowed.join(", ")}`,
        "Invalid Input",
      );
    }
  }

  const durationResult = parseFloatFlag(content, FLAG_LEGACY_DURATION, DELAY_MIN, DELAY_MAX);
  if (durationResult.found) {
    whisperSender(
      msg,
      "<code>--duration</code> is deprecated. Use <code>--swap-delay</code> instead.",
      "Deprecated Flag",
      "left",
    );
    if (durationResult.valid) {
      config.swapDelay = durationResult.value;
      updateTracker.valid++;
    } else {
      updateTracker.invalid++;
      whisperSenderError(
        msg,
        `Invalid value for deprecated <code>--duration</code>: must be between ${DELAY_MIN} and ${DELAY_MAX} seconds.`,
        "Invalid Input",
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
export function applyPresetLayer(msg, content, config, updateTracker) {
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
      `Invalid preset: '${presetResult.value}'.<br><br>Valid presets: ${ALLOWED_PRESETS.join(", ")}`,
      "Invalid Input",
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
export function buildSwapConfig(msg, updateTracker) {
  const content = msg.content;
  const config = { ...getSettings() };

  applyPresetLayer(msg, content, config, updateTracker);
  applyLegacyFlags(msg, config, updateTracker);

  const fxFlags = [
    {
      flag: FLAG_ORIGIN_FX,
      key: "originFx",
      allowed: ALLOWED_POINT_FX,
      label: "Origin FX",
    },
    {
      flag: FLAG_TRAVEL_FX,
      key: "travelFx",
      allowed: ALLOWED_TRAVEL_FX,
      label: "Travel FX",
    },
    {
      flag: FLAG_TRAVEL_MODE,
      key: "travelMode",
      allowed: ALLOWED_TRAVEL_MODES,
      label: "Travel Mode",
    },
    {
      flag: FLAG_DESTINATION_FX,
      key: "destinationFx",
      allowed: ALLOWED_POINT_FX,
      label: "Destination FX",
    },
  ];
  processStringFlags(content, fxFlags, config, updateTracker, msg);

  const timeFlags = [
    { flag: FLAG_ORIGIN_TIME, key: "originTime", label: "Origin Time", min: TIME_MIN, max: TIME_MAX },
    { flag: FLAG_TRAVEL_TIME, key: "travelTime", label: "Travel Time", min: TIME_MIN, max: TIME_MAX },
    {
      flag: FLAG_DESTINATION_TIME,
      key: "destinationTime",
      label: "Destination Time",
      min: TIME_MIN,
      max: TIME_MAX,
    },
  ];
  processNumericFlags(content, timeFlags, parseFloatFlag, config, updateTracker, msg);

  const delayFlags = [
    { flag: FLAG_SWAP_DELAY, key: "swapDelay", label: "Swap Delay", min: DELAY_MIN, max: DELAY_MAX },
    {
      flag: FLAG_DESTINATION_DELAY,
      key: "destinationDelay",
      label: "Destination Delay",
      min: DELAY_MIN,
      max: DELAY_MAX,
    },
  ];
  processNumericFlags(content, delayFlags, parseFloatFlag, config, updateTracker, msg);

  return config;
}
