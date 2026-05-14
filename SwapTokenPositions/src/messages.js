import {
  COLOR_ACCENT_PURPLE_LIGHT,
  COLOR_ACCENT_PURPLE_DARK,
  COLOR_BG_SOFT_BLACK,
  COLOR_ERROR_DARK,
  COLOR_ERROR_LIGHT,
  COLOR_ERROR_RED,
  COLOR_ERROR_BG_LIGHT,
  COLOR_HEADER_PURPLE_LIGHT,
  COLOR_INFO_LIGHT,
  COLOR_INFO_DARK,
  COLOR_SUCCESS_DARK,
  COLOR_SUCCESS_GREEN,
  COLOR_SUCCESS_LIGHT,
  COLOR_SUCCESS_BG_LIGHT,
  COLOR_TEXT_ARCANE_SILVER,
  COLOR_TEXT_DIM_SILVER,
  SCRIPT_NAME,
} from "./constants.js";

/**
 * Escapes HTML-sensitive characters for safe chat rendering.
 *
 * @param {string} value Text to escape.
 * @returns {string} Escaped text.
 */
export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Builds a safe display name for a token in chat output.
 *
 * @param {object} token Roll20 graphic token object.
 * @param {string} fallback Fallback label when token has no name.
 * @returns {string} Escaped token display name.
 */
export function getSafeTokenName(token, fallback) {
  const name = token.get("name");
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
export function generateStyledMessage(msg, align = "center", header = "") {
  const padding = align === "center" ? "3px 0px" : "3px 8px";
  const isScriptReadyHeader = header === "Script Ready";
  const headerBackground = isScriptReadyHeader
    ? COLOR_HEADER_PURPLE_LIGHT
    : COLOR_INFO_LIGHT;
  const headerTextColor = isScriptReadyHeader ? COLOR_BG_SOFT_BLACK : COLOR_INFO_DARK;
  const headerLabel = isScriptReadyHeader ? `😎 ${header} 😎` : `ℹ️ ${header}`;
  const mainStyle = [
    "width:100%",
    "border-radius:4px",
    `box-shadow:1px 1px 1px ${COLOR_TEXT_DIM_SILVER}`,
    `text-align:${align}`,
    "vertical-align:middle",
    "margin:0px auto",
    `border:1px solid ${COLOR_BG_SOFT_BLACK}`,
    `color:${COLOR_TEXT_ARCANE_SILVER}`,
    `background-image:-webkit-linear-gradient(-45deg,${COLOR_ACCENT_PURPLE_DARK} 0%,${COLOR_ACCENT_PURPLE_LIGHT} 100%)`,
    "overflow:hidden",
  ].join(";");

  const headerHtml = header
    ? `<div style="background:${headerBackground}; color:${headerTextColor}; padding:2px 5px; border-bottom:1px solid ${COLOR_BG_SOFT_BLACK}; font-variant:small-caps; font-weight:bold; text-align:center">${headerLabel}</div>`
    : "";
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
export function generateStyledErrorMessage(msg, header = "Error", align = "left") {
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
export function generateStyledSuccessMessage(msg, header = "Success") {
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
export function whisperGM(msg, header = "", align = "center") {
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
export function whisperSender(msgObj, text, header = "", align = "center") {
  const player = getObj("player", msgObj.playerid);
  const name = player ? player.get("_displayname") : msgObj.who;
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
export function whisperSenderError(msgObj, text, header = "Error", align = "left") {
  const player = getObj("player", msgObj.playerid);
  const name = player ? player.get("_displayname") : msgObj.who;
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
export function whisperGMSuccess(text, header = "Success") {
  sendChat(SCRIPT_NAME, `/w GM ${generateStyledSuccessMessage(text, header)}`);
}

/**
 * Whispers an error-styled message card to the GM.
 *
 * @param {string} text Error body as HTML.
 * @param {string} [header="Error"] Optional header label.
 * @param {"left"|"center"|"right"} [align="left"] Content alignment.
 * @returns {void}
 */
export function whisperGMError(text, header = "Error", align = "left") {
  sendChat(
    SCRIPT_NAME,
    `/w GM ${generateStyledErrorMessage(text, header, align)}`,
  );
}
