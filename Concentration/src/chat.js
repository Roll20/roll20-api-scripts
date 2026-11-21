import {
  COLOR_ACCENT,
  COLOR_BORDER,
  COLOR_BUTTON_ALT_BG,
  COLOR_BUTTON_ALT_BORDER,
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
import { escapeAttr, escapeHtml, toText } from './utils.js';

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

const CHAT_SUBTITLE_STYLE = `color:${COLOR_MUTED};font-size:0.8em;font-variant:normal;font-weight:normal;letter-spacing:0`;

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
  `background:${COLOR_BUTTON_ALT_BG}`,
  `color:${COLOR_TEXT}`,
  `border:1px solid ${COLOR_BUTTON_ALT_BORDER}`,
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
 * Keeps chat HTML on one line. Roll20 only whispers the first line of a
 * message and posts the rest publicly, so a stray line break would leak the
 * end of a whispered card to everyone.
 *
 * @param {string} html Chat HTML.
 * @returns {string} The same HTML without line breaks.
 */
export function oneLine(html) {
  return String(html).replaceAll(/\r?\n/g, ' ');
}

/**
 * Returns the whisper target for a player, falling back to all GMs.
 * Double quotes are stripped so the name is safe inside /w "name".
 *
 * @param {string} [playerId] Roll20 player ID.
 * @returns {string} Whisper target text.
 */
export function playerTarget(playerId) {
  const player = playerId ? getObj('player', playerId) : null;
  if (!player) {
    return 'gm';
  }
  return `"${String(player.get('displayname') || playerId).replaceAll('"', '')}"`;
}

/**
 * Returns the whisper target for a character's players: Roll20 whispers to
 * a character by name reach everyone who controls it.
 *
 * @param {string} name Character name.
 * @returns {string} Whisper target text.
 */
export function characterTarget(name) {
  const clean = toText(name).replaceAll('"', '');
  return clean ? `"${clean}"` : 'gm';
}

/**
 * Sends HTML to a target: '' for everyone, otherwise a whisper.
 *
 * @param {string} target Whisper target, or '' for everyone.
 * @param {string} html Chat HTML.
 * @returns {void}
 */
export function sendTo(target, html) {
  const text = oneLine(html);
  if (target) {
    sendChat(SCRIPT_NAME, `/w ${target} ${text}`, null, { noarchive: true });
  } else {
    sendChat(SCRIPT_NAME, text);
  }
}

/**
 * Builds a styled chat card.
 *
 * @param {string} title Header text (escaped).
 * @param {string} body Body HTML (trusted).
 * @param {string} [subtitle] Second header line (escaped).
 * @param {string} [dirStyle] Text direction CSS for right-to-left languages.
 * @returns {string} HTML string.
 */
export function buildCard(title, body, subtitle = '', dirStyle = '') {
  const sub = subtitle
    ? `<br><span style="${CHAT_SUBTITLE_STYLE}">${escapeHtml(subtitle)}</span>`
    : '';
  return [
    `<div style="${CHAT_CARD_STYLE}">`,
    `<div style="${CHAT_HEADER_STYLE}">${escapeHtml(title)}${sub}</div>`,
    `<div style="${CHAT_CONTENT_STYLE}${dirStyle ? `;${dirStyle}` : ''}">${body}</div>`,
    '</div>',
  ].join('');
}

/**
 * Sends a styled card whispered to a player, or to every GM when no player is given.
 *
 * @param {string|null} playerId Roll20 player ID.
 * @param {string} title Card header text.
 * @param {string|string[]} content HTML body content.
 * @param {string} [dirStyle] Text direction CSS.
 * @returns {void}
 */
export function whisper(playerId, title, content, dirStyle = '') {
  const body = Array.isArray(content) ? content.join('') : content;
  sendTo(playerTarget(playerId), buildCard(title, body, '', dirStyle));
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
  sendTo(playerTarget(playerId), `<div style="${style}">${escapeHtml(message)}</div>`);
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
  sendTo(
    playerTarget(playerId),
    `<div style="${style}"><strong>${escapeHtml(message)}</strong>${hintHtml}</div>`
  );
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
 * @param {string} [hint] Small text under the label (escaped).
 * @returns {string} HTML string.
 */
export function buildRow(label, valueHtml, hint = '') {
  const hintHtml = hint
    ? `<div style="font-size:0.8em;color:${COLOR_MUTED};line-height:1.2">${escapeHtml(hint)}</div>`
    : '';
  return [
    '<table style="width:100%;border-collapse:collapse;margin:1px 0"><tr>',
    `<td style="color:${COLOR_MUTED};width:55%;font-size:0.9em;vertical-align:middle">${escapeHtml(label)}${hintHtml}</td>`,
    `<td style="text-align:right;width:45%;vertical-align:middle">${valueHtml}</td>`,
    '</tr></table>',
  ].join('');
}
