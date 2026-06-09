import {
  COLOR_ACCENT,
  COLOR_BORDER,
  COLOR_BUTTON_BG,
  COLOR_BUTTON_TEXT,
  COLOR_CARD_BG_BOTTOM,
  COLOR_CARD_BG_TOP,
  COLOR_ERROR_BG,
  COLOR_ERROR_BORDER,
  COLOR_ERROR_TEXT,
  COLOR_HEADER_BG,
  COLOR_HEADER_TEXT,
  COLOR_MUTED,
  COLOR_TEXT,
  COLOR_WARNING_BG,
  COLOR_WARNING_BORDER,
  COLOR_WARNING_TEXT,
  SCRIPT_NAME,
} from './constants.js';
import { escapeHtml } from './utils.js';

const CHAT_CARD_STYLE = [
  'width:100%',
  'border-radius:4px',
  'box-shadow:1px 1px 3px rgba(0,0,0,0.4)',
  'text-align:left',
  'margin:2px auto',
  `border:1px solid ${COLOR_BORDER}`,
  `color:${COLOR_TEXT}`,
  `background-image:-webkit-linear-gradient(135deg,${COLOR_CARD_BG_TOP} 0%,${COLOR_CARD_BG_BOTTOM} 100%)`,
  'overflow:hidden',
].join(';');

const CHAT_HEADER_STYLE = [
  `background:${COLOR_HEADER_BG}`,
  `color:${COLOR_HEADER_TEXT}`,
  'padding:4px 8px',
  `border-bottom:2px solid ${COLOR_ACCENT}`,
  'font-variant:small-caps',
  'font-weight:bold',
  'font-size:1.05em',
  'text-align:center',
  'letter-spacing:0.05em',
].join(';');

const CHAT_CONTENT_STYLE = 'padding:5px 8px;line-height:1.5';

const BUTTON_STYLE = [
  `background:${COLOR_BUTTON_BG}`,
  `color:${COLOR_BUTTON_TEXT}`,
  'padding:2px 7px',
  'border-radius:3px',
  'text-decoration:none',
  'font-size:0.9em',
  'display:inline-block',
  'margin:1px 2px',
].join(';');

const BUTTON_SECONDARY_STYLE = [
  'background:#2a3a5c',
  `color:${COLOR_TEXT}`,
  'border:1px solid #4a5a7a',
  'padding:2px 7px',
  'border-radius:3px',
  'text-decoration:none',
  'font-size:0.9em',
  'display:inline-block',
  'margin:1px 2px',
].join(';');

const SECTION_LABEL_STYLE = [
  `color:${COLOR_MUTED}`,
  'font-size:0.8em',
  'text-transform:uppercase',
  'letter-spacing:0.08em',
  'margin-top:4px',
  'margin-bottom:2px',
].join(';');

const DIVIDER_STYLE = `border:none;border-top:1px solid ${COLOR_BORDER};margin:4px 0`;

/**
 * Sends a whisper to a specific player.
 *
 * @param {string} playerId Roll20 player ID.
 * @param {string} title Card header text.
 * @param {string|string[]} content HTML body content or array of HTML strings.
 * @returns {void}
 */
export function whisper(playerId, title, content) {
  const body = Array.isArray(content) ? content.join('') : content;
  const html = buildCard(title, body);
  sendChat(SCRIPT_NAME, `/w "${getPlayerDisplayName(playerId)}" ${html}`, null, {
    noarchive: true,
  });
}

/**
 * Sends a warning card whispered to a player.
 *
 * @param {string} playerId Roll20 player ID.
 * @param {string} message Warning message.
 * @returns {void}
 */
export function whisperWarning(playerId, message) {
  const style = [
    `background:${COLOR_WARNING_BG}`,
    `color:${COLOR_WARNING_TEXT}`,
    `border:1px solid ${COLOR_WARNING_BORDER}`,
    'padding:4px 8px',
    'border-radius:4px',
    'font-size:0.95em',
  ].join(';');
  const html = `<div style="${style}"><strong>Warning:</strong> ${escapeHtml(message)}</div>`;
  sendChat(SCRIPT_NAME, `/w "${getPlayerDisplayName(playerId)}" ${html}`, null, {
    noarchive: true,
  });
}

/**
 * Sends an error card whispered to a player.
 *
 * @param {string} playerId Roll20 player ID.
 * @param {string} message Error description.
 * @param {string} [hint] Optional hint explaining how to fix the error.
 * @returns {void}
 */
export function whisperError(playerId, message, hint) {
  const style = [
    `background:${COLOR_ERROR_BG}`,
    `color:${COLOR_ERROR_TEXT}`,
    `border:1px solid ${COLOR_ERROR_BORDER}`,
    'padding:4px 8px',
    'border-radius:4px',
    'font-size:0.95em',
  ].join(';');
  const hintHtml = hint
    ? `<div style="margin-top:3px;font-size:0.9em">${escapeHtml(hint)}</div>`
    : '';
  const html = `<div style="${style}"><strong>Error:</strong> ${escapeHtml(message)}${hintHtml}</div>`;
  sendChat(SCRIPT_NAME, `/w "${getPlayerDisplayName(playerId)}" ${html}`, null, {
    noarchive: true,
  });
}

/**
 * Builds a styled chat card with a header and body.
 *
 * @param {string} title Header text.
 * @param {string} body HTML body content.
 * @returns {string} HTML string.
 */
export function buildCard(title, body) {
  return [
    `<div style="${CHAT_CARD_STYLE}">`,
    `<div style="${CHAT_HEADER_STYLE}">${escapeHtml(title)}</div>`,
    `<div style="${CHAT_CONTENT_STYLE}">${body}</div>`,
    '</div>',
  ].join('');
}

/**
 * Builds a primary action button (red/accent).
 *
 * @param {string} label Button label.
 * @param {string} command Roll20 chat command the button triggers.
 * @returns {string} HTML anchor string.
 */
export function buildButton(label, command) {
  return `<a href="${escapeHtml(command)}" style="${BUTTON_STYLE}">${escapeHtml(label)}</a>`;
}

/**
 * Builds a secondary action button (dark/outline).
 *
 * @param {string} label Button label.
 * @param {string} command Roll20 chat command the button triggers.
 * @returns {string} HTML anchor string.
 */
export function buildSecondaryButton(label, command) {
  return `<a href="${escapeHtml(command)}" style="${BUTTON_SECONDARY_STYLE}">${escapeHtml(label)}</a>`;
}

/**
 * Builds a section label (small caps, muted).
 *
 * @param {string} text Section label text.
 * @returns {string} HTML string.
 */
export function buildSectionLabel(text) {
  return `<div style="${SECTION_LABEL_STYLE}">${escapeHtml(text)}</div>`;
}

/**
 * Builds a horizontal divider.
 *
 * @returns {string} HTML hr string.
 */
export function buildDivider() {
  return `<hr style="${DIVIDER_STYLE}">`;
}

/**
 * Builds an inline key-value row for status display.
 * Both label and value are HTML-escaped. Use buildRowHtml() when the value
 * is already trusted HTML that must not be double-escaped.
 *
 * @param {string} label Label text.
 * @param {string} value Value text (plain text — will be escaped).
 * @param {string} [valueColor] Optional color for the value.
 * @returns {string} HTML string.
 */
export function buildRow(label, value, valueColor) {
  const valueStyle = valueColor
    ? `color:${valueColor};font-weight:bold;text-align:right`
    : 'font-weight:bold;text-align:right';
  return [
    '<table style="width:100%;border-collapse:collapse;margin:1px 0"><tr>',
    `<td style="color:${COLOR_MUTED};width:55%">${escapeHtml(label)}</td>`,
    `<td style="${valueStyle};width:45%">${escapeHtml(String(value))}</td>`,
    '</tr></table>',
  ].join('');
}

/**
 * Returns a Roll20 player's display name, falling back to their ID.
 *
 * Double-quotes are stripped so the name is safe to embed in the
 * /w "name" whisper command without breaking the argument boundary.
 *
 * @param {string} playerId Roll20 player ID.
 * @returns {string} Sanitised display name or player ID.
 */
function getPlayerDisplayName(playerId) {
  const player = getObj('player', playerId);
  const raw = player ? player.get('displayname') || playerId : playerId;
  return String(raw).replace(/"/g, '');
}
