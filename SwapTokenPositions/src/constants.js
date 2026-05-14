export const SCRIPT_NAME = "__SCRIPT_NAME__";
export const SCRIPT_FILE = "__SCRIPT_FILE__";
export const SWAP_TOKEN_POSITIONS_VERSION = "__BUILD_VERSION__";
export const SWAP_TOKEN_POSITIONS_LAST_UPDATED = "__BUILD_DATE__";

export const COLOR_GLOW_PURPLE = "#B388FF";
export const COLOR_BG_SOFT_BLACK = "#0A0A12";
export const COLOR_TEXT_ARCANE_SILVER = "#E6DFFF";
export const COLOR_TEXT_DIM_SILVER = "#B8AFCF";
export const COLOR_ACCENT_PURPLE_LIGHT = "#FF4D6D";
export const COLOR_ACCENT_PURPLE_DARK = "#5B21B6";
export const COLOR_HEADER_PURPLE_LIGHT = "#E9D5FF";

export const COLOR_INFO_LIGHT = "#DBEAFE";
export const COLOR_INFO_DARK = "#1E40AF";
export const COLOR_ERROR_RED = "#D32F2F";
export const COLOR_ERROR_DARK = "#B71C1C";
export const COLOR_ERROR_LIGHT = "#FFCDD2";
export const COLOR_ERROR_BG_LIGHT = "#FFEBEE";
export const COLOR_SUCCESS_GREEN = "#2E7D32";
export const COLOR_SUCCESS_DARK = "#1B5E20";
export const COLOR_SUCCESS_LIGHT = "#E8F5E9";
export const COLOR_SUCCESS_BG_LIGHT = "#F1F5FE";

export const TIME_MIN = 0;
export const TIME_MAX = 10;
export const DELAY_MIN = 0;
export const DELAY_MAX = 10;

export const ALLOWED_TRAVEL_FX = [
  "none",
  "beam-magic",
  "beam-acid",
  "beam-charm",
  "beam-fire",
  "beam-frost",
  "beam-holy",
  "beam-death",
  "beam-energy",
  "beam-lightning",
];

export const ALLOWED_TRAVEL_MODES = ["normal", "invisible"];

export const ALLOWED_POINT_FX = [
  "none",
  "nova-magic",
  "nova-acid",
  "nova-charm",
  "nova-fire",
  "nova-frost",
  "nova-holy",
  "nova-death",
  "burst-magic",
  "burst-acid",
  "burst-charm",
  "burst-fire",
  "burst-frost",
  "burst-holy",
  "burst-death",
  "burst-energy",
  "burst-smoke",
  "explode-magic",
  "explode-acid",
  "explode-charm",
  "explode-fire",
  "explode-frost",
  "explode-holy",
  "explode-death",
  "burn-magic",
  "burn-acid",
  "burn-charm",
  "burn-fire",
  "burn-frost",
  "burn-holy",
  "burn-death",
  "splatter-magic",
  "splatter-acid",
  "splatter-charm",
  "splatter-fire",
  "splatter-frost",
  "splatter-holy",
  "splatter-death",
  "splatter-dark",
  "glow-magic",
  "glow-acid",
  "glow-charm",
  "glow-fire",
  "glow-frost",
  "glow-holy",
  "glow-death",
];

export const FX_PRESETS = {
  portal: {
    originFx: "nova-magic",
    travelFx: "beam-magic",
    destinationFx: "burst-holy",
    originTime: 1,
    travelTime: 1,
    destinationTime: 0.5,
    swapDelay: 0.5,
    destinationDelay: 1,
    travelMode: "normal",
  },
  lightning: {
    originFx: "none",
    travelFx: "beam-holy",
    destinationFx: "burst-holy",
    originTime: 0,
    travelTime: 0.3,
    destinationTime: 0,
    swapDelay: 0,
    destinationDelay: 0.3,
    travelMode: "normal",
  },
  shadow: {
    originFx: "burst-smoke",
    travelFx: "none",
    destinationFx: "burst-smoke",
    originTime: 0.5,
    travelTime: 0,
    destinationTime: 0,
    swapDelay: 0.5,
    destinationDelay: 0.5,
    travelMode: "normal",
  },
  fire: {
    originFx: "explode-fire",
    travelFx: "none",
    destinationFx: "explode-fire",
    originTime: 0.5,
    travelTime: 0,
    destinationTime: 0,
    swapDelay: 0.5,
    destinationDelay: 0.5,
    travelMode: "normal",
  },
  magic: {
    originFx: "nova-magic",
    travelFx: "none",
    destinationFx: "burst-magic",
    originTime: 0.5,
    travelTime: 0,
    destinationTime: 0,
    swapDelay: 0.5,
    destinationDelay: 0.5,
    travelMode: "normal",
  },
  transport: {
    originFx: "glow-magic",
    travelFx: "none",
    destinationFx: "glow-magic",
    originTime: 0.55,
    travelTime: 0,
    destinationTime: 0,
    swapDelay: 0.15,
    destinationDelay: 0.05,
    travelMode: "invisible",
  },
  none: {
    originFx: "none",
    travelFx: "none",
    destinationFx: "none",
    originTime: 0,
    travelTime: 0,
    destinationTime: 0,
    swapDelay: 0,
    destinationDelay: 0,
    travelMode: "normal",
  },
};

export const ALLOWED_PRESETS = Object.keys(FX_PRESETS);

export const FACTORY_DEFAULTS = {
  originFx: "none",
  travelFx: "none",
  destinationFx: "none",
  originTime: 0,
  travelTime: 0,
  destinationTime: 0,
  swapDelay: 0,
  destinationDelay: 0,
  travelMode: "normal",
};

export const FLAG_HELP = /--help\b/i;
export const FLAG_SHOW_SETTINGS = /--show-settings\b/i;
export const FLAG_CHECK_SETTINGS = /--check-settings\b/i;
export const FLAG_RESET_SETTINGS = /--reset-settings\b/i;
export const FLAG_SAVE = /--save\b/i;
export const FLAG_INSTALL_MACRO = /--install-macro\b/i;

export const FLAG_INSTANT = /--instant\b/i;
export const FLAG_PRESET = /--preset\b/i;
export const FLAG_ORIGIN_FX = /--origin-fx\b/i;
export const FLAG_TRAVEL_FX = /--travel-fx\b/i;
export const FLAG_DESTINATION_FX = /--destination-fx\b/i;
export const FLAG_ORIGIN_TIME = /--origin-time\b/i;
export const FLAG_TRAVEL_TIME = /--travel-time\b/i;
export const FLAG_TRAVEL_MODE = /--travel-mode\b/i;
export const FLAG_DESTINATION_TIME = /--destination-time\b/i;
export const FLAG_SWAP_DELAY = /--swap-delay\b/i;
export const FLAG_DESTINATION_DELAY = /--destination-delay\b/i;

export const FLAG_LEGACY_BEAM_FX = /--beam-fx\b/i;
export const FLAG_LEGACY_BURST_FX = /--burst-fx\b/i;
export const FLAG_LEGACY_DURATION = /--duration\b/i;
export const FLAG_LEGACY_MODE = /--mode\b/i;

export const MANAGEMENT_FLAGS = [
  FLAG_SHOW_SETTINGS,
  FLAG_CHECK_SETTINGS,
  FLAG_RESET_SETTINGS,
  FLAG_INSTALL_MACRO,
];

export const SILENT_MANAGEMENT_FLAGS = [
  FLAG_HELP,
  FLAG_SHOW_SETTINGS,
  FLAG_CHECK_SETTINGS,
  FLAG_RESET_SETTINGS,
  FLAG_INSTALL_MACRO,
];
