// The GM-only Help handout.

import { STEP_SPECS } from './catalogue.js';
import {
  AUTHOR_LINKS,
  COLOR_ACCENT,
  COLOR_BORDER,
  COLOR_CARD_BG_BOTTOM,
  COLOR_HEADER_BG,
  COLOR_HEADER_TEXT,
  COLOR_MUTED,
  COLOR_TEXT,
  COMMAND,
  HANDOUT_HELP_NAME,
  HELP_COMMANDS,
  SCRIPT_NAME,
  SCRIPT_VERSION,
} from './constants.js';
import { createObject, findObjects, getObject } from './host.js';
import { getDirectionStyle, getLocale, t, tRaw } from './i18n.js';
import { getConfig, getState } from './state.js';
import { escapeHtml, hashText } from './utils.js';

const STYLE = {
  outer: `background:${COLOR_CARD_BG_BOTTOM};color:${COLOR_TEXT};padding:14px 18px;border:1px solid ${COLOR_BORDER};border-radius:6px;font-family:Arial,sans-serif;line-height:1.5;`,
  header: `background:${COLOR_HEADER_BG};padding:12px;border-radius:4px;text-align:center;border-bottom:3px solid ${COLOR_ACCENT};margin-bottom:12px;`,
  h1: `color:${COLOR_HEADER_TEXT};margin:0;font-size:1.8em;letter-spacing:0.05em;`,
  subtitle: `color:${COLOR_MUTED};margin:4px 0 0 0;font-size:0.9em;`,
  h2: `color:${COLOR_ACCENT};border-bottom:1px solid ${COLOR_BORDER};padding-bottom:3px;margin:18px 0 8px 0;font-size:1.25em;`,
  p: `color:${COLOR_TEXT};margin:6px 0;`,
  li: `color:${COLOR_TEXT};margin:3px 0;`,
  table: 'width:100%;border-collapse:collapse;margin:6px 0;font-size:0.92em;',
  th: `background:${COLOR_HEADER_BG};color:${COLOR_HEADER_TEXT};padding:5px 8px;text-align:left;border:1px solid ${COLOR_BORDER};`,
  td: `padding:5px 8px;border:1px solid ${COLOR_BORDER};vertical-align:top;color:${COLOR_TEXT};`,
  code: 'font-family:monospace;color:#ffd58a;',
  link: `color:${COLOR_ACCENT};`,
  footer: `color:${COLOR_MUTED};font-size:0.85em;text-align:center;margin-top:16px;border-top:1px solid ${COLOR_BORDER};padding-top:8px;`,
};

/**
 * Builds a table.
 *
 * @param {string[]} headings Headings (escaped).
 * @param {string[][]} rows Cells (trusted HTML).
 * @returns {string} HTML.
 */
function table(headings, rows) {
  const head = headings.map((h) => `<th style="${STYLE.th}">${escapeHtml(h)}</th>`).join('');
  const body = rows
    .map((cells) => `<tr>${cells.map((c) => `<td style="${STYLE.td}">${c}</td>`).join('')}</tr>`)
    .join('');
  return `<table style="${STYLE.table}"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

/**
 * Builds a list from a translated array.
 *
 * @param {*} items Items.
 * @param {boolean} [ordered=false] Numbered.
 * @returns {string} HTML.
 */
function list(items, ordered = false) {
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag}>${(Array.isArray(items) ? items : []).map((item) => `<li style="${STYLE.li}">${escapeHtml(item)}</li>`).join('')}</${tag}>`;
}

/**
 * Builds the Help handout HTML.
 *
 * @param {string} locale Locale.
 * @returns {string} HTML.
 */
export function buildHelpHtml(locale) {
  const lang = getLocale(locale);
  const h = (key, vars) => escapeHtml(t(`handout.${key}`, lang, vars));
  const code = (text) => `<span style="${STYLE.code}">${escapeHtml(text)}</span>`;
  const section = (key, body) => `<h2 style="${STYLE.h2}">${h(`${key}.heading`)}</h2>${body}`;
  const commands = HELP_COMMANDS.map(([text, key]) => [
    code(`${COMMAND} ${text}`.trim()),
    escapeHtml(t(`help.${key}`, lang)),
  ]);
  const steps = Object.keys(STEP_SPECS).map((type) => [
    code(type),
    escapeHtml(t(`stepTypes.${type}`, lang)),
  ]);
  const triggers = ['manual', 'at', 'interval', 'daily', 'weekly', 'event', 'signal', 'chat'].map(
    (type) => [code(type), escapeHtml(t(`triggerTypes.${type}`, lang))]
  );
  const overdue = ['skip', 'runOnce', 'catchUpBounded', 'review', 'expire'].map((mode) => [
    code(mode),
    escapeHtml(t(`overdueModes.${mode}`, lang)),
  ]);
  const maintainer = AUTHOR_LINKS.maintainer;
  return [
    `<div style="${STYLE.outer}${getDirectionStyle(lang)}">`,
    `<div style="${STYLE.header}"><h1 style="${STYLE.h1}">${escapeHtml(SCRIPT_NAME)}</h1><p style="${STYLE.subtitle}">${h('subtitle', { version: SCRIPT_VERSION })}</p></div>`,
    `<p style="${STYLE.p}">${h('intro')}</p>`,
    section('quickStart', list(tRaw('handout.quickStart.items', lang), true)),
    section('concepts', list(tRaw('handout.concepts.items', lang))),
    section(
      'commands',
      table([t('handout.commands.command', lang), t('handout.commands.does', lang)], commands)
    ),
    section('steps', table([t('handout.steps.type', lang), t('handout.steps.does', lang)], steps)),
    section(
      'triggers',
      table([t('handout.triggers.type', lang), t('handout.triggers.does', lang)], triggers)
    ),
    section(
      'overdue',
      `<p style="${STYLE.p}">${h('overdue.intro')}</p>${table([t('handout.overdue.mode', lang), t('handout.overdue.does', lang)], overdue)}`
    ),
    section('limits', list(tRaw('handout.limits.items', lang))),
    `<div style="${STYLE.footer}">${h('footer', { name: maintainer.name })} · <a href="${escapeHtml(maintainer.github)}" style="${STYLE.link}">GitHub</a></div>`,
    '</div>',
  ].join('');
}

/**
 * Creates or updates the GM-only Help handout. The handout is only rewritten
 * when its content changes.
 *
 * @returns {object|null} Handout.
 */
export function installHelpHandout() {
  const s = getState();
  let handout = s.dashboard.helpHandoutId ? getObject('handout', s.dashboard.helpHandoutId) : null;
  if (!handout) {
    handout =
      findObjects({ _type: 'handout', name: HANDOUT_HELP_NAME })[0] ||
      createObject('handout', { name: HANDOUT_HELP_NAME, inplayerjournals: '', controlledby: '' });
  }
  if (!handout) {
    return null;
  }
  s.dashboard.helpHandoutId = handout.id;
  const html = buildHelpHtml(getConfig().language);
  const hash = hashText(html);
  if (s.dashboard.helpHash !== hash) {
    handout.set({ notes: html, inplayerjournals: '', controlledby: '' });
    s.dashboard.helpHash = hash;
  }
  return handout;
}
