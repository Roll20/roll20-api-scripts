import {
  ALLOWED_PRESETS,
  DELAY_MAX,
  DELAY_MIN,
  SWAP_TOKEN_POSITIONS_LAST_UPDATED,
  SWAP_TOKEN_POSITIONS_VERSION,
  TIME_MAX,
  TIME_MIN,
} from "./constants.js";
import { whisperSender } from "./messages.js";

/**
 * Sends full command and option help text to the invoking player.
 *
 * @param {object} msgObj Roll20 chat message object.
 * @returns {void}
 */
export function showHelp(msgObj) {
  const helpMsg = [
    `<strong>SwapTokenPositions</strong> v${SWAP_TOKEN_POSITIONS_VERSION}<br>`,
    `Last Updated: ${SWAP_TOKEN_POSITIONS_LAST_UPDATED}<br>`,
    "<br><strong>Basic Usage:</strong><br>",
    "<code>!swap-tokens</code> &mdash; Instant swap of 2 selected tokens.<br>",
    "<code>!swap-tokens --instant</code> &mdash; Force instant swap, ignoring all FX and timing.<br>",
    "<code>!swap-tokens --help</code> &mdash; Show this help message (available to all players).<br>",
    "<br><strong>FX Stages:</strong><br>",
    "<em>Pipeline order: Origin FX &rarr; Travel FX &rarr; Swap &rarr; Destination FX.</em><br>",
    "<code>--origin-fx &lt;type&gt;</code> &mdash; FX at both original positions before movement.<br>",
    "<code>--travel-fx &lt;type&gt;</code> &mdash; FX between tokens during transition.<br>",
    "<code>--travel-mode &lt;normal|invisible&gt;</code> &mdash; Keep tokens visible during travel or hide them until reveal.<br>",
    "<code>--destination-fx &lt;type&gt;</code> &mdash; FX at both new positions after swap.<br>",
    "<br><strong>Stage Timing:</strong><br>",
    `<code>--origin-time &lt;${TIME_MIN}-${TIME_MAX}&gt;</code> &mdash; Wait (s) after Origin FX before continuing.<br>`,
    `<code>--travel-time &lt;${TIME_MIN}-${TIME_MAX}&gt;</code> &mdash; Duration (s) of the travel animation stage.<br>`,
    `<code>--destination-time &lt;${TIME_MIN}-${TIME_MAX}&gt;</code> &mdash; Additional wait (s) before Destination FX is shown.<br>`,
    "<br><strong>Delays:</strong><br>",
    `<code>--swap-delay &lt;${DELAY_MIN}-${DELAY_MAX}&gt;</code> &mdash; Additional pause between Origin and Travel stages.<br>`,
    `<code>--destination-delay &lt;${DELAY_MIN}-${DELAY_MAX}&gt;</code> &mdash; Additional pause before Destination FX is shown.<br>`,
    "<br><strong>Presets:</strong><br>",
    `<code>--preset &lt;name&gt;</code> &mdash; Apply a preset. Valid: <code>${ALLOWED_PRESETS.join(", ")}</code><br>`,
    "&bull; <strong>portal</strong> &mdash; Magical portal teleport (nova, beam, burst).<br>",
    "&bull; <strong>lightning</strong> &mdash; Fast lightning strike (beam, burst).<br>",
    "&bull; <strong>shadow</strong> &mdash; Dark shadow blink (splatter, no travel FX).<br>",
    "&bull; <strong>fire</strong> &mdash; Fiery explosion swap (explode, no travel FX).<br>",
    "&bull; <strong>magic</strong> &mdash; Arcane sparkle swap (nova, burst).<br>",
    "&bull; <strong>transport</strong> &mdash; Starship transport shimmer (invisible travel reveal).<br>",
    "&bull; <strong>none</strong> &mdash; No FX, equivalent to instant mode.<br>",
    "<em>Explicit flags override preset values. Example: <code>--preset portal --travel-time 3</code></em><br>",
    "<br><strong>Global Configuration (GM Only):</strong><br>",
    "<code>--save</code> &mdash; Commit provided flags as the new global defaults.<br>",
    "<code>--show-settings</code> &mdash; View current persistent defaults.<br>",
    "<code>--reset-settings</code> &mdash; Restore all factory defaults.<br>",
    "<code>--install-macro</code> &mdash; Create a global 'SwapTokens' macro.<br>",
    "<br><strong>Examples:</strong><br>",
    "<code>!swap-tokens</code><br>",
    "<code>!swap-tokens --preset portal</code><br>",
    "<code>!swap-tokens --preset transport</code><br>",
    "<code>!swap-tokens --preset portal --travel-time 3</code><br>",
    "<code>!swap-tokens --origin-fx nova-magic --swap-delay 1 --destination-fx burst-holy</code><br>",
    "<code>!swap-tokens --preset lightning --save</code><br>",
  ].join("");

  whisperSender(msgObj, helpMsg, "SwapTokenPositions Help", "left");
}
