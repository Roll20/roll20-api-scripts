// Journal handouts: the Help handout and the Command Deck. Both are GM-only.

import {
  AUTHOR_LINKS,
  COLOR_ACCENT,
  COLOR_BORDER,
  COLOR_BUTTON_ALT_BG,
  COLOR_BUTTON_ALT_BORDER,
  COLOR_BUTTON_BG,
  COLOR_BUTTON_TEXT,
  COLOR_CARD_BG_BOTTOM,
  COLOR_HEADER_BG,
  COLOR_HEADER_TEXT,
  COLOR_MUTED,
  COLOR_TEXT,
  COMMAND,
  DEFAULT_CONFIG,
  HANDOUT_DECK_NAME,
  HANDOUT_HELP_NAME,
  HELP_COMMANDS,
  LEGACY_HANDOUT_NAME,
  SCRIPT_NAME,
  SCRIPT_VERSION,
} from './constants.js';
import { getDirectionStyle, getLocale, LOCALE_LABELS, SUPPORTED_LOCALES, t, tRaw } from './i18n.js';
import { getConfig } from './state.js';
import { escapeHtml } from './utils.js';

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
  code: 'font-family:monospace;color:#ffd58a;white-space:nowrap;',
  link: `color:${COLOR_ACCENT};`,
  footer: `color:${COLOR_MUTED};font-size:0.85em;text-align:center;margin-top:16px;border-top:1px solid ${COLOR_BORDER};padding-top:8px;`,
  btn: `background:${COLOR_BUTTON_BG};color:${COLOR_BUTTON_TEXT};padding:3px 9px;border-radius:3px;text-decoration:none;font-size:0.9em;display:inline-block;margin:2px 3px;font-weight:bold;`,
  btnDark: `background:${COLOR_BUTTON_ALT_BG};color:${COLOR_TEXT};border:1px solid ${COLOR_BUTTON_ALT_BORDER};padding:3px 9px;border-radius:3px;text-decoration:none;font-size:0.9em;display:inline-block;margin:2px 3px;`,
  section: `background:${COLOR_HEADER_BG};color:${COLOR_ACCENT};padding:4px 8px;font-variant:small-caps;font-weight:bold;letter-spacing:0.05em;border-left:3px solid ${COLOR_ACCENT};margin:12px 0 4px 0;`,
  desc: `color:${COLOR_MUTED};font-size:0.85em;margin:0 0 4px 8px;`,
};

/**
 * Builds a table.
 *
 * @param {string[]} headings Column headings (escaped).
 * @param {string[][]} rows Row cells (trusted HTML).
 * @returns {string} HTML string.
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
 * @param {*} items Translated value (array of strings expected).
 * @param {boolean} [ordered=false] Use a numbered list.
 * @returns {string} HTML string.
 */
function list(items, ordered = false) {
  const tag = ordered ? 'ol' : 'ul';
  const lis = (Array.isArray(items) ? items : [])
    .map((item) => `<li style="${STYLE.li}">${escapeHtml(item)}</li>`)
    .join('');
  return `<${tag}>${lis}</${tag}>`;
}

/**
 * Builds a link.
 *
 * @param {string} url URL.
 * @param {string} label Link text.
 * @returns {string} HTML anchor.
 */
function link(url, label) {
  return `<a href="${escapeHtml(url)}" style="${STYLE.link}">${escapeHtml(label)}</a>`;
}

/**
 * Builds the Help handout HTML.
 *
 * @param {string} locale Locale code.
 * @returns {string} HTML string.
 */
export function buildHelpHtml(locale) {
  const lang = getLocale(locale);
  const h = (key, vars) => escapeHtml(t(`handout.${key}`, lang, vars));
  const raw = (key) => tRaw(`handout.${key}`, lang);
  const code = (text) => `<span style="${STYLE.code}">${escapeHtml(text)}</span>`;
  const section = (key, body) => `<h2 style="${STYLE.h2}">${h(`${key}.heading`)}</h2>${body}`;

  const commands = HELP_COMMANDS.map(([text, key]) => [
    code(`${COMMAND} ${text}`.trim()),
    escapeHtml(t(`help.${key}`, lang)),
  ]);

  const codes = [
    ['U D L R', 'move'],
    ['UL UR DL DR', 'diagonal'],
    ['U3, R10', 'distance'],
    ['U0', 'face'],
    ['W, W3', 'wait'],
    ['S', 'stealth'],
  ].map(([c, key]) => [code(c), escapeHtml(t(`handout.codes.${key}`, lang))]);

  const routeOptions = ['mode', 'interval', 'max', 'random', 'start'].map((key) => [
    code(key),
    escapeHtml(t(`handout.routeOptions.${key}`, lang)),
  ]);

  const settings = Object.keys(DEFAULT_CONFIG).map((key) => [
    code(key),
    escapeHtml(t(`settings.${key}.label`, lang)),
    escapeHtml(t(`settings.${key}.desc`, lang)),
  ]);

  const legacyCommands = [
    ['!tc / !token-control', `${COMMAND}`],
    ['!tc set <path> <code>', `${COMMAND} edit <route> <code>`],
    ['!tc setstart / clearstart <path>', `${COMMAND} route <route> start set|clear`],
    ['!tc build, !tc draft', `${COMMAND} record`],
    ['!tc tick <ms>', `${COMMAND} set interval <ms>`],
    ['!tc rotate / combat / substeps', `${COMMAND} set facing / combatBehaviour / movement`],
    ['!tc pathinterval / maxtokens', `${COMMAND} route <route> interval / max`],
    ['!tc runonce / cycle / randomstart', `${COMMAND} route <route> mode / random`],
    ['!tc duplicate', `${COMMAND} copy`],
    ['!tc exportpaths / importpaths', `${COMMAND} export / import`],
    ['!tc follow <follower> <leader>', `${COMMAND} follow <leader>`],
  ].map(([v4, v5]) => [code(v4), code(v5)]);

  const locales = SUPPORTED_LOCALES.map((c) => escapeHtml(LOCALE_LABELS[c])).join(', ');
  const { original, maintainer } = AUTHOR_LINKS;

  return `<div style="${STYLE.outer}${getDirectionStyle(lang)}">
    <div style="${STYLE.header}">
      <h1 style="${STYLE.h1}">✥ ${SCRIPT_NAME} ✥</h1>
      <p style="${STYLE.subtitle}">${h('versionLabel')} ${SCRIPT_VERSION} • ${h('subtitle')}</p>
    </div>
    ${section('overview', `<p style="${STYLE.p}">${h('overview.body')}</p>`)}
    ${section('quickStart', list(raw('quickStart.steps'), true))}
    ${section('routes', `${list(raw('routes.points'))}${table([t('handout.codes.colCode', lang), t('handout.codes.colMeaning', lang)], codes)}`)}
    ${section('routeOptions', table([t('handout.routeOptions.colOption', lang), t('handout.routeOptions.colMeaning', lang)], routeOptions))}
    ${section('tokens', list(raw('tokens.points')))}
    ${section('grids', list(raw('grids.points')))}
    ${section('combat', list(raw('combat.points')))}
    ${section('commands', `<p style="${STYLE.p}">${h('commands.intro')}</p>${table([t('handout.commands.colCommand', lang), t('handout.commands.colDesc', lang)], commands)}`)}
    ${section('settings', `<p style="${STYLE.p}">${h('settings.intro')}</p>${table([t('handout.settings.colKey', lang), t('handout.settings.colName', lang), t('handout.settings.colDesc', lang)], settings)}`)}
    ${section('upgrading', `${list(raw('upgrading.points'))}${table([t('handout.upgrading.colV4', lang), t('handout.upgrading.colV5', lang)], legacyCommands)}`)}
    ${section('troubleshooting', list(raw('troubleshooting.points')))}
    ${section('languages', `<p style="${STYLE.p}">${h('languages.body')}</p><p style="${STYLE.p};font-size:0.85em">${locales}</p>`)}
    ${section(
      'credits',
      `<p style="${STYLE.p}">${h('credits.original')} ${link(original.profile, original.name)} • ${link(original.patreon, 'Patreon')}</p>
       <p style="${STYLE.p}">${h('credits.maintainer')} ${link(maintainer.profile, maintainer.name)} • ${link(maintainer.github, 'GitHub')}</p>
       <p style="${STYLE.p}">${h('credits.support')}</p>`
    )}
    <div style="${STYLE.footer}">${SCRIPT_NAME} ${SCRIPT_VERSION} • ${h('footer', { deck: HANDOUT_DECK_NAME })}</div>
  </div>`;
}

/**
 * Builds the Command Deck handout HTML.
 *
 * @param {string} locale Locale code.
 * @returns {string} HTML string.
 */
export function buildDeckHtml(locale) {
  const lang = getLocale(locale);
  const tr = (key, vars) => t(key, lang, vars);
  const q = (key, fallback = '') => `?{${tr(key).replaceAll(/[|}]/g, '')}|${fallback}}`;
  const btn = (key, args, dark = false) =>
    `<a href="${escapeHtml(`${COMMAND} ${args}`.trim())}" style="${dark ? STYLE.btnDark : STYLE.btn}">${escapeHtml(tr(`buttons.${key}`))}</a>`;
  const group = (titleKey, descKey, buttons) =>
    `<div style="${STYLE.section}">${escapeHtml(tr(titleKey))}</div><div style="${STYLE.desc}">${escapeHtml(tr(descKey))}</div><div>${buttons.join('')}</div>`;

  return `<div style="${STYLE.outer}${getDirectionStyle(lang)}">
    <div style="${STYLE.header}">
      <h1 style="${STYLE.h1}">✥ ${SCRIPT_NAME} ✥</h1>
      <p style="${STYLE.subtitle}">${escapeHtml(tr('deck.subtitle'))} • v${SCRIPT_VERSION}</p>
    </div>
    ${group('menu.patrols', 'deck.patrolsDesc', [btn('menu', ''), btn('startRoute', `start ${q('prompts.route')}`), btn('stop', 'stop', true), btn('reset', 'reset', true), btn('stopAll', 'stop all', true), btn('pause', 'pause', true), btn('resume', 'resume', true)])}
    ${group('menu.create', 'deck.createDesc', [btn('add', `add ${q('prompts.name')} ${q('prompts.code', 'U2R2D2L2')}`), btn('draw', `draw ${q('prompts.name')}`), btn('record', `record ${q('prompts.name')}`), btn('examples', 'examples', true), btn('list', 'list', true)])}
    ${group('menu.selected', 'deck.selectedDesc', [btn('lock', 'lock'), btn('unlock', 'unlock', true), btn('leader', 'leader'), btn('follow', 'follow'), btn('unfollow', 'unfollow', true)])}
    ${group('menu.tools', 'deck.toolsDesc', [btn('combatOn', 'combat on', true), btn('combatOff', 'combat off', true), btn('settings', 'set', true), btn('status', 'status', true), btn('calibrate', 'calibrate', true), btn('help', 'help', true)])}
    <div style="${STYLE.footer}">${escapeHtml(tr('deck.footer', { help: HANDOUT_HELP_NAME }))}</div>
  </div>`;
}

/**
 * Creates or updates a GM-only handout, removing duplicates with the same name.
 *
 * @param {string} name Handout name.
 * @param {string} html Handout notes HTML.
 * @returns {void}
 */
function upsertHandout(name, html) {
  const existing = findObjs({ _type: 'handout', name });
  const [primary, ...duplicates] = existing;
  const handout = primary || createObj('handout', { name });
  if (!handout) {
    return;
  }
  handout.set({ inplayerjournals: '', controlledby: '' });
  handout.set('notes', html);
  for (const dup of duplicates) {
    dup.remove();
  }
}

/**
 * Creates or refreshes the Help and Command Deck handouts in the current
 * language.
 *
 * @returns {void}
 */
export function installHandouts() {
  const lang = getConfig().language;
  upsertHandout(HANDOUT_HELP_NAME, buildHelpHtml(lang));
  upsertHandout(HANDOUT_DECK_NAME, buildDeckHtml(lang));
}

/**
 * Removes v4's usage guide, which every player could see.
 *
 * @returns {number} Number of handouts removed.
 */
export function removeLegacyHandout() {
  const old = findObjs({ _type: 'handout', name: LEGACY_HANDOUT_NAME });
  for (const handout of old) {
    handout.remove();
  }
  return old.length;
}
