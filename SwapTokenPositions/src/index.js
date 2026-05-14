import {
  SCRIPT_NAME,
  SWAP_TOKEN_POSITIONS_LAST_UPDATED,
  SWAP_TOKEN_POSITIONS_VERSION,
} from "./constants.js";
import { handleSwapTokens } from "./commands.js";
import { whisperGM } from "./messages.js";
import { initializeState, validateSettings } from "./state.js";

/**
 * Boots the script when Roll20 signals API readiness.
 * Initializes state, performs validation, logs status, and registers chat handlers.
 *
 * @returns {void}
 */
on("ready", () => {
  initializeState();
  validateSettings(true);
  log(
    `-=> ${SCRIPT_NAME} v${SWAP_TOKEN_POSITIONS_VERSION} [Updated: ${SWAP_TOKEN_POSITIONS_LAST_UPDATED}] <=-`,
  );
  whisperGM(
    `<strong>MOD READY</strong> (v${SWAP_TOKEN_POSITIONS_VERSION})`,
    "Script Ready",
  );
  on("chat:message", handleSwapTokens);
});
