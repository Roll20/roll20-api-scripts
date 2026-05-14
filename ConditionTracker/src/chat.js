import {
  COLOR_ACCENT_DARK,
  COLOR_ACCENT_LIGHT,
  COLOR_BG_SOFT_BLACK,
  COLOR_HEADER_DARK,
  COLOR_HEADER_LIGHT,
  COLOR_TEXT_ARCANE_SILVER,
  COLOR_TEXT_DIM_SILVER,
  COLOR_TEXT_WHITE,
  COMMAND,
  LOGO_URL_256,
  SCRIPT_NAME,
} from "./constants.js";
import { isRtlLocale, t } from "./i18n.js";
import { getConfig } from "./state.js";
import { escapeHtml, getGmPlayerIds, toText } from "./utils.js";

const DEFAULT_WHISPER_TARGET = "gm";

const CHAT_CARD_STYLE = [
  "width:100%",
  "border-radius:4px",
  `box-shadow:1px 1px 1px ${COLOR_TEXT_DIM_SILVER}`,
  "text-align:left",
  "vertical-align:middle",
  "margin:0px auto",
  `border:1px solid ${COLOR_BG_SOFT_BLACK}`,
  `color:${COLOR_TEXT_ARCANE_SILVER}`,
  `background-image:-webkit-linear-gradient(-45deg,${COLOR_ACCENT_DARK} 0%,${COLOR_ACCENT_LIGHT} 100%)`,
  "overflow:hidden",
].join(";");

const CHAT_HEADER_STYLE = [
  `background:${COLOR_HEADER_LIGHT}`,
  `color:${COLOR_HEADER_DARK}`,
  "padding:2px 5px",
  `border-bottom:1px solid ${COLOR_BG_SOFT_BLACK}`,
  "font-variant:small-caps",
  "font-weight:bold",
  "text-align:center",
].join(";");

const CHAT_CONTENT_STYLE = "padding:3px 8px";

const TABLE_HEADER_STYLE = [
  "text-align:left",
  "padding:2px 4px",
  `border-bottom:1px solid ${COLOR_TEXT_ARCANE_SILVER}`,
].join(";");

const CHAT_BUTTON_STYLE = [
  `background:${COLOR_ACCENT_DARK}`,
  `color:${COLOR_TEXT_WHITE}`,
  "padding:2px 6px",
  "border-radius:4px",
  "text-decoration:none",
].join(";");

const CHAT_HEADER_SCRIPT_READY = "Script Ready";

const CHAT_HEADER_WARNING_STYLE = [
  "background:#FEF3C7",
  "color:#92400E",
  "padding:2px 5px",
  "border-bottom:1px solid #92400E",
  "font-variant:small-caps",
  "font-weight:bold",
  "text-align:center",
].join(";");

/**
 * Builds inline text direction styles for the active chat locale.
 *
 * @param {string} locale Locale code.
 * @returns {string} Inline CSS direction and alignment.
 */
function getDirectionStyle(locale) {
  return isRtlLocale(locale)
    ? "direction:rtl;text-align:right"
    : "direction:ltr;text-align:left";
}

/**
 * Returns the table header style adjusted for locale direction.
 *
 * @param {string} locale Locale code.
 * @returns {string} Inline CSS for table headers.
 */
function getTableHeaderStyle(locale) {
  return isRtlLocale(locale)
    ? TABLE_HEADER_STYLE.replace("text-align:left", "text-align:right")
    : TABLE_HEADER_STYLE;
}

const CHAT_HEADER_ERROR_STYLE = [
  "background:#FEE2E2",
  "color:#991B1B",
  "padding:2px 5px",
  "border-bottom:1px solid #991B1B",
  "font-variant:small-caps",
  "font-weight:bold",
  "text-align:center",
].join(";");

/**
 * Marks a string as trusted HTML for controlled chat rendering.
 *
 * @param {string} value Trusted HTML fragment.
 * @returns {object} Trusted HTML wrapper.
 */
export function rawHtml(value) {
  return { __trustedHtml: String(value) };
}

/**
 * Sends a public chat message (plain text, HTML-escaped).
 *
 * @param {string} message Message body.
 * @returns {void}
 */
export function announce(message) {
  sendChat(SCRIPT_NAME, escapeHtml(message));
}

/**
 * Sends a public chat message as raw HTML.
 *
 * @param {string} html Trusted HTML message body.
 * @returns {void}
 */
export function announceHtml(html) {
  sendChat(SCRIPT_NAME, html);
}

/**
 * Whispers a message to a GM or player.
 *
 * @param {string} playerId Player id.
 * @param {string} title Message title.
 * @param {string|string[]} body Message body lines.
 * @returns {void}
 */
export function whisper(playerId, title, body) {
  whisperWithBox(playerId, body, (lines) => buildBox(title, lines));
}

/**
 * Whispers a message to every GM in the game.
 *
 * @param {string} title Message title.
 * @param {string|string[]} body Message body lines.
 * @returns {void}
 */
export function whisperGms(title, body) {
  const gmIds = getGmPlayerIds();
  for (const gmId of gmIds) {
    whisper(gmId, title, body);
  }
}

/**
 * Builds a styled chat box.
 *
 * @param {string} title Message title.
 * @param {string[]} lines Message body lines.
 * @returns {string} Chat HTML.
 */
export function buildBox(title, lines) {
  const safeTitle = escapeHtml(title);
  const locale = getConfig().language;
  const headerLabel =
    toText(title) === CHAT_HEADER_SCRIPT_READY ||
    toText(title) === t("ui.title.scriptReady", locale)
      ? `😎 ${safeTitle} 😎`
      : `ℹ️ ${safeTitle}`;
  return buildStyledBox(lines, CHAT_HEADER_STYLE, headerLabel, locale);
}

/**
 * Builds a styled warning chat box.
 *
 * @param {string[]} lines Message body lines.
 * @returns {string} Chat HTML.
 */
function buildWarningBox(lines, locale) {
  return buildStyledBox(
    lines,
    CHAT_HEADER_WARNING_STYLE,
    `⚠️ ${escapeHtml(t("ui.title.warning", locale))}`,
    locale,
  );
}

/**
 * Builds a styled error chat box.
 *
 * @param {string[]} lines Message body lines.
 * @returns {string} Chat HTML.
 */
function buildErrorBox(lines, locale) {
  return buildStyledBox(
    lines,
    CHAT_HEADER_ERROR_STYLE,
    `❌ ${escapeHtml(t("ui.title.error", locale))}`,
    locale,
  );
}

/**
 * Whispers a warning message to a GM or player.
 *
 * @param {string} playerId Player id.
 * @param {string|string[]} body Message body lines.
 * @returns {void}
 */
export function whisperWarning(playerId, body) {
  whisperWithBox(playerId, body, (lines, locale) =>
    buildWarningBox(lines, locale),
  );
}

/**
 * Whispers an error message to a GM or player.
 *
 * @param {string} playerId Player id.
 * @param {string|string[]} body Message body lines.
 * @returns {void}
 */
export function whisperError(playerId, body) {
  whisperWithBox(playerId, body, (lines, locale) =>
    buildErrorBox(lines, locale),
  );
}

/**
 * Builds one of the styled chat card variants.
 *
 * @param {string[]} lines Message body lines.
 * @param {string} headerStyle Header style string.
 * @param {string} headerText Header label.
 * @param {string} locale Locale for text direction.
 * @returns {string} Chat HTML.
 */
function buildStyledBox(lines, headerStyle, headerText, locale) {
  const body = buildBody(lines);
  const directionStyle = getDirectionStyle(locale);
  const logo = `<div style="text-align:center;padding:6px 0 4px;"><img src="${LOGO_URL_256}" style="height:48px;width:auto;" alt="${SCRIPT_NAME} logo" title="${SCRIPT_NAME}" /></div>`;
  const header = `<div style="${headerStyle}">${headerText}</div>`;
  const content = `<div style="${CHAT_CONTENT_STYLE};${directionStyle}">${body}</div>`;
  return `<div style="${CHAT_CARD_STYLE};${directionStyle}">${logo}${header}${content}</div>`;
}

/**
 * Normalizes whisper input, builds a box, and sends it.
 *
 * @param {string} playerId Player id.
 * @param {string|string[]} body Message body lines.
 * @param {(lines: string[], locale: string) => string} boxBuilder Chat box builder.
 * @returns {void}
 */
function whisperWithBox(playerId, body, boxBuilder) {
  const lines = normalizeBodyLines(body);
  const locale = getConfig().language;
  const html = boxBuilder(lines, locale);
  sendWhisperHtml(playerId, html);
}

/**
 * Sends prebuilt whisper HTML to a player or GM target.
 *
 * @param {string} playerId Player id.
 * @param {string} html Prebuilt chat card HTML.
 * @returns {void}
 */
function sendWhisperHtml(playerId, html) {
  const target = getWhisperTarget(playerId);
  sendChat(SCRIPT_NAME, `/w "${target}" ${html}`);
}

/**
 * Normalizes whisper body input to a string array.
 *
 * @param {string|string[]} body Message body lines.
 * @returns {string[]} Body lines array.
 */
function normalizeBodyLines(body) {
  return Array.isArray(body) ? body : [body];
}

/**
 * Builds escaped chat body HTML.
 *
 * @param {string[]} lines Body lines.
 * @returns {string} Body HTML.
 */
function buildBody(lines) {
  const parts = [];
  for (const line of lines) {
    const content = formatChatLine(line);
    parts.push(`<div>${content}</div>`);
  }

  return parts.join("");
}

/**
 * Formats one line for chat body rendering.
 *
 * @param {*} line Chat line value.
 * @returns {string} Escaped or trusted HTML content.
 */
function formatChatLine(line) {
  if (isTrustedHtmlLine(line)) {
    return getTrustedHtml(line);
  }

  return escapeHtml(line);
}

/**
 * Returns true for internally generated chat HTML fragments.
 *
 * @param {*} line Chat line value.
 * @returns {boolean} True when the line is trusted HTML.
 */
function isTrustedHtmlLine(line) {
  return (
    Boolean(line) && typeof line === "object" && hasValue(line.__trustedHtml)
  );
}

/**
 * Returns the HTML payload from a trusted chat line.
 *
 * @param {*} line Chat line value.
 * @returns {string} Trusted HTML.
 */
function getTrustedHtml(line) {
  if (line === null || line === undefined) return "";
  if (typeof line === "object") {
    return hasValue(line.__trustedHtml) ? String(line.__trustedHtml) : "";
  }
  return String(line);
}

/**
 * Returns true when a value exists.
 *
 * @param {*} value The value to inspect.
 * @returns {boolean} True when the value is neither undefined nor null.
 */
function hasValue(value) {
  return value !== undefined && value !== null;
}

/**
 * Builds a Roll20 API command button.
 *
 * @param {string} label Button label.
 * @param {string} command Command text.
 * @returns {string} Button HTML.
 */
export function buildButton(label, command) {
  return rawHtml(
    `<a style="${CHAT_BUTTON_STYLE}" href="${escapeHtml(command)}">${escapeHtml(label)}</a>`,
  );
}

/**
 * Builds a remove button for an active condition.
 *
 * @param {object} condition Active condition record.
 * @returns {string} Button HTML.
 */
export function buildRemoveButton(condition) {
  return buildButton(
    `Remove: ${condition.displayText}`,
    `${COMMAND} --remove ${condition.id}`,
  );
}

/**
 * Creates a compact HTML table for chat output.
 *
 * @param {string[]} headers Column labels.
 * @param {string[][]} rows Table rows with trusted cell HTML.
 * @returns {object} Trusted HTML line.
 */
export function htmlTable(headers, rows) {
  const locale = getConfig().language;
  const tableHeaderStyle = getTableHeaderStyle(locale);
  const directionStyle = getDirectionStyle(locale);
  const headerCells = headers
    .map(
      (header) =>
        `<th style="${tableHeaderStyle}"><strong>${escapeHtml(header)}</strong></th>`,
    )
    .join("");

  const bodyRows = rows
    .map(
      (cells) =>
        `<tr>${cells
          .map(
            (cell) =>
              `<td style="padding:2px 4px;vertical-align:top;${directionStyle}">${getTrustedHtml(cell)}</td>`,
          )
          .join("")}</tr>`,
    )
    .join("");

  return rawHtml(
    `<table style="width:100%;border-collapse:collapse;${directionStyle}"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`,
  );
}

/**
 * Resolves a player whisper target.
 *
 * @param {string} playerId Player id.
 * @returns {string} Display name suitable for /w.
 */
function getWhisperTarget(playerId) {
  const player = getObj("player", playerId);
  const displayName = player
    ? toText(player.get("_displayname")).replaceAll('"', "")
    : "";
  if (displayName) {
    return displayName;
  }

  return DEFAULT_WHISPER_TARGET;
}
