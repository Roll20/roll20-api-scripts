// Journal handouts: the Help handout and the Command Deck. Both are rebuilt on
// every start and when the language changes, so they always match the
// installed version.

import { buildLocaleFlag } from './chat.js';
import {
  AUTHOR_LINKS,
  COMMAND_LIST,
  CREATURE_SIZES,
  COLOR_ACCENT,
  COLOR_BORDER,
  COLOR_BUTTON2_BG,
  COLOR_BUTTON2_BORDER,
  COLOR_BUTTON_BG,
  COLOR_BUTTON_TEXT,
  COLOR_CARD_BG_BOTTOM,
  COLOR_HEADER_BG,
  COLOR_HEADER_TEXT,
  COLOR_MUTED,
  COLOR_TEXT,
  DECK_TITLE,
  DEFAULT_SETTINGS,
  HANDOUT_DECK_NAME,
  HANDOUT_HELP_NAME,
  SCRIPT_NAME,
  SCRIPT_VERSION,
} from './constants.js';
import { getDirectionStyle, getLocale, LOCALE_DEFINITIONS, t, tRaw } from './i18n.js';
import { getCommand, getLang } from './state.js';
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
  code: 'font-family:monospace;color:#d9c2ff;',
  link: `color:${COLOR_ACCENT};`,
  footer: `color:${COLOR_MUTED};font-size:0.85em;text-align:center;margin-top:16px;border-top:1px solid ${COLOR_BORDER};padding-top:8px;`,
  btn: `background:${COLOR_BUTTON_BG};color:${COLOR_BUTTON_TEXT};padding:3px 9px;border-radius:3px;text-decoration:none;font-size:0.9em;display:inline-block;margin:2px 3px;font-weight:bold;`,
  btnDark: `background:${COLOR_BUTTON2_BG};color:${COLOR_TEXT};border:1px solid ${COLOR_BUTTON2_BORDER};padding:3px 9px;border-radius:3px;text-decoration:none;font-size:0.9em;display:inline-block;margin:2px 3px;`,
  section: `background:${COLOR_HEADER_BG};color:${COLOR_ACCENT};padding:4px 8px;font-variant:small-caps;font-weight:bold;letter-spacing:0.05em;border-left:3px solid ${COLOR_ACCENT};margin:12px 0 4px 0;`,
  desc: `color:${COLOR_MUTED};font-size:0.85em;margin:0 0 4px 8px;`,
};

/**
 * Builds a table.
 *
 * @param {string[]} headings Column headings (escaped here).
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
 * @param {*} items Translated value (an array of strings).
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
  const command = getCommand();
  const h = (key, vars) => escapeHtml(t(`handout.${key}`, lang, vars));
  const raw = (key) => tRaw(`handout.${key}`, lang);
  const code = (text) => `<span style="${STYLE.code}">${escapeHtml(text)}</span>`;
  const p = (key, vars) => `<p style="${STYLE.p}">${h(key, vars)}</p>`;
  const section = (key, body) => `<h2 style="${STYLE.h2}">${h(`${key}.heading`)}</h2>${body}`;

  const commands = COMMAND_LIST.map(([cmd, key]) => [
    code(`${command} ${cmd}`.trim()),
    escapeHtml(t(`help.${key}`, lang)),
  ]);
  const settings = Object.keys(DEFAULT_SETTINGS).map((key) => [
    code(key),
    escapeHtml(t(`handout.settings.rows.${key}`, lang)),
  ]);
  const sizes = Object.entries(CREATURE_SIZES).map(([size, cells]) => [
    escapeHtml(t(`sizes.${size}`, lang)),
    code(`${command} size ${size}`),
    escapeHtml(t('handout.sizes.cells', lang, { cells })),
  ]);
  const legacy = [
    ['!resizer 50 50', `${command} size 50 50 px`],
    ['!resizer page 30 20', `${command} page 30 20 units`],
    ['!resizer page 2100 1400 pixels', `${command} page 2100 1400 px`],
    ['!resizer scale 2 up', `${command} zoom 2`],
    ['!resizer scale 2 down', `${command} zoom 1/2`],
    ['!resizer fit keep_ratio', `${command} fit --keep-ratio`],
    ['!resizer center h v', `${command} center both`],
    ['!resizer config command|name', `${command} set command name`],
  ].map(([a, b]) => [code(a), code(b)]);
  const api = [
    ['zoomPage(pageId, factor, options)', 'zoomPage'],
    ['undo()', 'undo'],
    ['onZoom((pageId, factor) => …)', 'onZoom'],
    ['history()', 'history'],
  ].map(([fn, key]) => [code(`Resizer.${fn}`), escapeHtml(t(`handout.api.rows.${key}`, lang))]);
  const locales = LOCALE_DEFINITIONS.map((locale) => [
    escapeHtml(locale.name),
    escapeHtml(locale.nativeName || locale.name),
    `${buildLocaleFlag(locale)}${code(locale.code)}`,
  ]);
  const { original, maintainer } = AUTHOR_LINKS;

  return `<div style="${STYLE.outer}${getDirectionStyle(lang)}">
    <div style="${STYLE.header}">
      <h1 style="${STYLE.h1}">✦ ${SCRIPT_NAME} ✦</h1>
      <p style="${STYLE.subtitle}">${h('versionLabel')} ${SCRIPT_VERSION} • ${h('subtitle')}</p>
    </div>
    ${section('overview', p('overview.body'))}
    ${section('quickStart', list(raw('quickStart.steps'), true))}
    ${section('zoom', `${p('zoom.intro')}${list(raw('zoom.points'))}`)}
    ${section('calibrate', `${p('calibrate.intro')}${list(raw('calibrate.steps'), true)}${list(raw('calibrate.points'))}`)}
    ${section('sizes', `${p('sizes.intro')}${table([t('handout.sizes.colSize', lang), t('handout.sizes.colCommand', lang), t('handout.sizes.colCells', lang)], sizes)}`)}
    ${section('pages', list(raw('pages.points')))}
    ${section('undo', list(raw('undo.points')))}
    ${section('commands', `${p('commands.intro', { command })}${table([t('handout.commands.colCommand', lang), t('handout.commands.colDesc', lang)], commands)}`)}
    ${section('settings', `${p('settings.intro')}${table([t('handout.settings.colKey', lang), t('handout.settings.colDesc', lang)], settings)}`)}
    ${section('api', `${p('api.intro')}${table([t('handout.api.colFunction', lang), t('handout.api.colDesc', lang)], api)}`)}
    ${section('upgrading', `${list(raw('upgrading.points'))}${table([t('handout.upgrading.colOld', lang), t('handout.upgrading.colNew', lang)], legacy)}`)}
    ${section('troubleshooting', list(raw('troubleshooting.points')))}
    ${section('languages', `${p('languages.body')}${table([t('handout.languages.colLanguage', lang), t('handout.languages.colNative', lang), t('handout.languages.colCode', lang)], locales)}`)}
    ${section(
      'credits',
      `<p style="${STYLE.p}">${h('credits.original')} ${link(original.profile, original.name)} • ${link(original.thread, t('handout.credits.thread', lang))}</p>
       <p style="${STYLE.p}">${h('credits.maintainer')} ${link(maintainer.profile, maintainer.name)} • ${link(maintainer.github, 'GitHub')}</p>
       ${p('credits.support')}`
    )}
    <div style="${STYLE.footer}">${SCRIPT_NAME} ${SCRIPT_VERSION} • ${h('footer', { deck: HANDOUT_DECK_NAME })}</div>
  </div>`;
}

/**
 * Makes text safe inside a Roll20 query, where | , { and } have meaning.
 *
 * @param {string} text Label.
 * @returns {string} Safe label.
 */
function queryText(text) {
  return String(text)
    .replaceAll(/[|,{}]/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim();
}

/**
 * Builds the Command Deck handout HTML.
 *
 * @param {string} locale Locale code.
 * @returns {string} HTML string.
 */
export function buildDeckHtml(locale) {
  const lang = getLocale(locale);
  const command = getCommand();
  const tr = (key, vars) => t(key, lang, vars);
  const q = (key, answer) => `?{${queryText(tr(`queries.${key}`))}|${answer}}`;
  const btn = (label, cmd, dark = false) =>
    `<a href="${escapeHtml(`${command} ${cmd}`.trim())}" style="${dark ? STYLE.btnDark : STYLE.btn}">${escapeHtml(label)}</a>`;
  const group = (titleKey, descKey, buttons) =>
    `<div style="${STYLE.section}">${escapeHtml(tr(titleKey))}</div><div style="${STYLE.desc}">${escapeHtml(tr(descKey))}</div><div>${buttons.join('')}</div>`;
  const sizeButtons = Object.keys(CREATURE_SIZES)
    .filter((s) => s !== 'small')
    .map((s) => btn(tr(`sizes.${s}`), `size ${s}`, true));

  return `<div style="${STYLE.outer}${getDirectionStyle(lang)}">
    <div style="${STYLE.header}">
      <h1 style="${STYLE.h1}">✦ ${SCRIPT_NAME} ✦</h1>
      <p style="${STYLE.subtitle}">${DECK_TITLE} • v${SCRIPT_VERSION}</p>
    </div>
    ${group('deck.menuTitle', 'deck.menuDesc', [btn(tr('buttons.menu'), ''), btn(tr('buttons.settings'), 'settings', true), btn(tr('buttons.help'), 'help', true)])}
    ${group('deck.selectedTitle', 'deck.selectedDesc', [btn(tr('buttons.resize'), `size ${q('width', 70)} ${q('height', 70)} px`), btn(tr('buttons.fit'), 'fit --keep-ratio'), btn(tr('buttons.centre'), 'center both', true), ...sizeButtons])}
    ${group('deck.mapTitle', 'deck.mapDesc', [btn(tr('buttons.calibrate'), `calibrate ${q('across', 1)} ${q('downCount', 1)}`), btn(tr('buttons.calibrateFit'), `calibrate ${q('across', 1)} ${q('downCount', 1)} --fit-page`, true), btn(tr('buttons.calibratePx'), `calibrate --cell ${q('squarePx', 100)}`, true)])}
    ${group('deck.pageTitle', 'deck.pageDesc', [btn(tr('buttons.zoomIn'), 'zoom 2'), btn(tr('buttons.zoomOut'), 'zoom 1/2'), btn(tr('buttons.zoom'), `zoom ${q('factor', 2)}`, true), btn(tr('buttons.pageSize'), 'page', true), btn(tr('buttons.pages'), 'pages', true)])}
    ${group('deck.historyTitle', 'deck.historyDesc', [btn(tr('buttons.undo'), 'undo'), btn(tr('buttons.history'), 'history', true)])}
    <div style="${STYLE.footer}">${escapeHtml(tr('deck.footer', { help: HANDOUT_HELP_NAME }))}</div>
  </div>`;
}

/**
 * Creates or updates a handout, removing duplicates with the same name.
 *
 * @param {string} name Handout name.
 * @param {string} html Handout notes HTML.
 * @returns {void}
 */
function upsertHandout(name, html) {
  const [primary, ...duplicates] = findObjs({ _type: 'handout', name });
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
 * Creates or refreshes the Help and Command Deck handouts in the GM's language.
 *
 * @returns {void}
 */
export function installHandouts() {
  const lang = getLang();
  upsertHandout(HANDOUT_HELP_NAME, buildHelpHtml(lang));
  upsertHandout(HANDOUT_DECK_NAME, buildDeckHtml(lang));
}
