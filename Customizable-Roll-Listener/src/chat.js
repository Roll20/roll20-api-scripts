import {
  COLOR_ACCENT,
  COLOR_BORDER,
  COLOR_BUTTON_BG,
  COLOR_BUTTON_DARK_BG,
  COLOR_BUTTON_DARK_BORDER,
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
import { escapeAttr, escapeHtml } from './utils.js';

const CHAT_CARD_STYLE = [
  'width:100%',
  'border-radius:4px',
  'box-shadow:1px 1px 3px rgba(0,0,0,0.4)',
  'text-align:left',
  'margin:2px auto',
  `border:1px solid ${COLOR_BORDER}`,
  `color:${COLOR_TEXT}`,
  `background-image:-webkit-linear-gradient(135deg,${COLOR_CARD_BG_TOP} 0%,${COLOR_CARD_BG_BOTTOM} 100%)`,
  `background-color:${COLOR_CARD_BG_BOTTOM}`,
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
  `background:${COLOR_BUTTON_DARK_BG}`,
  `color:${COLOR_TEXT}`,
  `border:1px solid ${COLOR_BUTTON_DARK_BORDER}`,
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
 * Returns the whisper target for a player, falling back to all GMs.
 *
 * Double quotes are stripped so the name is safe inside /w "name".
 *
 * @param {string} [playerId] Roll20 player ID.
 * @returns {string} Whisper target text.
 */
function whisperTarget(playerId) {
  const player = playerId ? getObj('player', playerId) : null;
  if (!player) {
    return 'gm';
  }
  return `"${String(player.get('displayname') || playerId).replaceAll('"', '')}"`;
}

/**
 * Keeps chat HTML on one line. Roll20 only whispers the first line of a
 * message and posts the rest publicly, so a stray line break would leak
 * the end of a GM card to the players.
 *
 * @param {string} html Chat HTML.
 * @returns {string} The same HTML without line breaks.
 */
export function oneLine(html) {
  return String(html).replaceAll(/\r?\n/g, ' ');
}

/**
 * Sends a styled card whispered to a player, or to every GM when no player is given.
 *
 * @param {string|null} playerId Roll20 player ID.
 * @param {string} title Card header text.
 * @param {string|string[]} content HTML body content.
 * @returns {void}
 */
export function whisper(playerId, title, content) {
  const body = Array.isArray(content) ? content.join('') : content;
  sendChat(SCRIPT_NAME, `/w ${whisperTarget(playerId)} ${oneLine(buildCard(title, body))}`, null, {
    noarchive: true,
  });
}

/**
 * Sends a styled card to everyone.
 *
 * @param {string} title Card header text.
 * @param {string} body HTML body content.
 * @returns {void}
 */
export function broadcast(title, body) {
  sendChat(SCRIPT_NAME, oneLine(buildCard(title, body)));
}

/**
 * Sends a warning whispered to a player (or every GM).
 *
 * @param {string|null} playerId Roll20 player ID.
 * @param {string} message Warning text.
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
  const html = `<div style="${style}">${escapeHtml(message)}</div>`;
  sendChat(SCRIPT_NAME, `/w ${whisperTarget(playerId)} ${oneLine(html)}`, null, {
    noarchive: true,
  });
}

/**
 * Sends an error whispered to a player (or every GM).
 *
 * @param {string|null} playerId Roll20 player ID.
 * @param {string} message What went wrong.
 * @param {string} [hint] How to fix it.
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
  const html = `<div style="${style}"><strong>${escapeHtml(message)}</strong>${hintHtml}</div>`;
  sendChat(SCRIPT_NAME, `/w ${whisperTarget(playerId)} ${oneLine(html)}`, null, {
    noarchive: true,
  });
}

/**
 * Builds a styled chat card.
 *
 * @param {string} title Header text (escaped).
 * @param {string} body Body HTML (trusted).
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
 * Builds a primary action button.
 *
 * @param {string} label Button label.
 * @param {string} command Chat command the button runs.
 * @returns {string} HTML anchor.
 */
export function buildButton(label, command) {
  return `<a href="${escapeAttr(command)}" style="${BUTTON_STYLE}">${escapeHtml(label)}</a>`;
}

/**
 * Builds a secondary action button.
 *
 * @param {string} label Button label.
 * @param {string} command Chat command the button runs.
 * @returns {string} HTML anchor.
 */
export function buildSecondaryButton(label, command) {
  return `<a href="${escapeAttr(command)}" style="${BUTTON_SECONDARY_STYLE}">${escapeHtml(label)}</a>`;
}

/**
 * Builds a section label.
 *
 * @param {string} text Label text.
 * @returns {string} HTML string.
 */
export function buildSectionLabel(text) {
  return `<div style="${SECTION_LABEL_STYLE}">${escapeHtml(text)}</div>`;
}

/**
 * Builds a horizontal divider.
 *
 * @returns {string} HTML string.
 */
export function buildDivider() {
  return `<hr style="${DIVIDER_STYLE}">`;
}

/**
 * Builds a label/value row. The value may be trusted HTML (e.g. a button).
 *
 * @param {string} label Label text (escaped).
 * @param {string} valueHtml Value HTML.
 * @returns {string} HTML string.
 */
export function buildRow(label, valueHtml) {
  return [
    '<table style="width:100%;border-collapse:collapse;margin:1px 0"><tr>',
    `<td style="color:${COLOR_MUTED};width:50%;font-size:0.9em">${escapeHtml(label)}</td>`,
    `<td style="text-align:right;width:50%">${valueHtml}</td>`,
    '</tr></table>',
  ].join('');
}

/**
 * Builds a block of monospace text, keeping line breaks.
 *
 * @param {string} text Text (escaped here).
 * @returns {string} HTML string.
 */
export function buildCode(text) {
  const style =
    'font-family:monospace;font-size:0.85em;white-space:pre-wrap;word-break:break-word;background:rgba(0,0,0,0.25);padding:3px 5px;border-radius:3px;margin:2px 0';
  return `<div style="${style}">${escapeHtml(text).replaceAll(/\r?\n/g, '<br>')}</div>`;
}
