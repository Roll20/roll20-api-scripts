// Journal handouts: the Help handout and the Command Deck.

import {
  AUTHOR_LINKS,
  COMMON_TEMPLATES,
  TEMPLATE_LINKS,
  COLOR_ACCENT,
  COLOR_BORDER,
  COLOR_BUTTON_BG,
  COLOR_BUTTON_DARK_BG,
  COLOR_BUTTON_DARK_BORDER,
  COLOR_BUTTON_TEXT,
  COLOR_CARD_BG_BOTTOM,
  COLOR_HEADER_BG,
  COLOR_HEADER_TEXT,
  COLOR_MUTED,
  COLOR_TEXT,
  COMMAND,
  HANDOUT_DECK_NAME,
  HANDOUT_HELP_NAME,
  MESSAGE_TYPES,
  SCRIPT_NAME,
  SCRIPT_VERSION,
  STORE_CHARACTER_NAME,
} from './constants.js';
import { getDirectionStyle, getLocale, LOCALE_LABELS, SUPPORTED_LOCALES, t, tRaw } from './i18n.js';
import { getConfig } from './state.js';
import { escapeAttr, escapeHtml } from './utils.js';

const STYLE = {
  outer: `background:${COLOR_CARD_BG_BOTTOM};color:${COLOR_TEXT};padding:14px 18px;border:1px solid ${COLOR_BORDER};border-radius:6px;font-family:Arial,sans-serif;line-height:1.5;`,
  header: `background:${COLOR_HEADER_BG};padding:12px;border-radius:4px;text-align:center;border-bottom:3px solid ${COLOR_ACCENT};margin-bottom:12px;`,
  h1: `color:${COLOR_HEADER_TEXT};margin:0;font-size:1.7em;letter-spacing:0.04em;`,
  subtitle: `color:${COLOR_MUTED};margin:4px 0 0 0;font-size:0.9em;`,
  h2: `color:${COLOR_ACCENT};border-bottom:1px solid ${COLOR_BORDER};padding-bottom:3px;margin:18px 0 8px 0;font-size:1.25em;`,
  p: `color:${COLOR_TEXT};margin:6px 0;`,
  li: `color:${COLOR_TEXT};margin:3px 0;`,
  table: 'width:100%;border-collapse:collapse;margin:6px 0;font-size:0.92em;',
  th: `background:${COLOR_HEADER_BG};color:${COLOR_HEADER_TEXT};padding:5px 8px;text-align:left;border:1px solid ${COLOR_BORDER};`,
  td: `padding:5px 8px;border:1px solid ${COLOR_BORDER};vertical-align:top;color:${COLOR_TEXT};`,
  code: 'font-family:monospace;color:#f3d48b;',
  pre: 'font-family:monospace;color:#f3d48b;background:rgba(0,0,0,0.25);padding:6px 8px;border-radius:3px;white-space:pre-wrap;margin:6px 0;',
  link: `color:${COLOR_ACCENT};`,
  footer: `color:${COLOR_MUTED};font-size:0.85em;text-align:center;margin-top:16px;border-top:1px solid ${COLOR_BORDER};padding-top:8px;`,
  btn: `background:${COLOR_BUTTON_BG};color:${COLOR_BUTTON_TEXT};padding:3px 9px;border-radius:3px;text-decoration:none;font-size:0.9em;display:inline-block;margin:2px 3px;font-weight:bold;`,
  btnDark: `background:${COLOR_BUTTON_DARK_BG};color:${COLOR_TEXT};border:1px solid ${COLOR_BUTTON_DARK_BORDER};padding:3px 9px;border-radius:3px;text-decoration:none;font-size:0.9em;display:inline-block;margin:2px 3px;`,
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
  return `<a href="${escapeAttr(url)}" style="${STYLE.link}">${escapeHtml(label)}</a>`;
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
  const pre = (text) => `<div style="${STYLE.pre}">${escapeHtml(text)}</div>`;
  const section = (key, body) => `<h2 style="${STYLE.h2}">${h(`${key}.heading`)}</h2>${body}`;

  const commands = [
    ['', 'menu'],
    ['new <name> [--option value …] [--commands …]', 'new'],
    ['show <name>', 'show'],
    ['edit <name> --option value …', 'edit'],
    ['edit <name> --commands line 1 \\\\ line 2', 'commands'],
    ['enable <name> / disable <name>', 'enable'],
    ['up <name> / down <name>', 'move'],
    ['test <name>', 'test'],
    ['delete <name>', 'delete'],
    ['inspect', 'inspect'],
    ['inspect off', 'inspectOff'],
    ['on / off', 'onOff'],
    ['config [setting value]', 'config'],
    ['journal', 'journal'],
    ['help', 'help'],
  ].map(([cmd, key]) => [code(`${COMMAND} ${cmd}`.trim()), escapeHtml(t(`help.${key}`, lang))]);

  const options = [
    ['--templates', 'templates'],
    ['--types', 'types'],
    ['--text', 'text'],
    ['--regex', 'regex'],
    ['--who', 'who'],
    ['--players', 'players'],
    ['--results', 'results'],
    ['--total', 'total'],
    ['--natural', 'natural'],
    ['--dice', 'dice'],
    ['--cooldown', 'cooldown'],
    ['--stop', 'stop'],
    ['--speaker', 'speaker'],
    ['--enabled', 'enabled'],
    ['--name', 'name'],
    ['--commands', 'commands'],
  ].map(([opt, key]) => [
    code(opt),
    escapeHtml(t(`handout.options.${key}`, lang, { types: MESSAGE_TYPES.join(', ') })),
  ]);

  const placeholders = [
    'who',
    'character',
    'player',
    'template',
    'total',
    'natural',
    'result',
    'expression',
    'table',
    'listener',
  ]
    .map((name) => [code(`\${${name}}`), escapeHtml(t(`handout.placeholders.${name}`, lang))])
    .concat([[code('${field:key}'), escapeHtml(t('handout.placeholders.field', lang))]]);

  const settings = ['enabled', 'speaker', 'listenToMods', 'language'].map((key) => [
    code(key),
    escapeHtml(t(`settings.${key}.label`, lang)),
    escapeHtml(t(`settings.${key}.desc`, lang)),
  ]);

  const legacy = [
    [
      '!crl \\\\create,name=N,text=T,template=a b,roll=critical \\\\cmd',
      `${COMMAND} new N --text T --templates a b --results crit --commands cmd`,
    ],
    ['!crl \\\\edit,name=N,…', `${COMMAND} edit N --…`],
    ['!crl \\\\delete,name=N', `${COMMAND} delete N`],
    ['!crl \\\\config[,menu=N]', `${COMMAND} / ${COMMAND} show N`],
    ['!crl \\\\set,listen=on|off', `${COMMAND} on / ${COMMAND} off`],
  ].map(([v1, v2]) => [code(v1), code(v2)]);

  const templates = COMMON_TEMPLATES.map(({ sheet, names }) => [
    escapeHtml(sheet),
    names
      .split(', ')
      .map((name) => code(name))
      .join(' '),
  ]);
  const templateLinks = Object.entries(TEMPLATE_LINKS)
    .map(([key, url]) => link(url, t(`handout.templates.${key}`, lang)))
    .join(' • ');

  const locales = SUPPORTED_LOCALES.map((c) => escapeHtml(LOCALE_LABELS[c])).join(', ');
  const { original, maintainer } = AUTHOR_LINKS;

  return `<div style="${STYLE.outer}${getDirectionStyle(lang)}">
    <div style="${STYLE.header}">
      <h1 style="${STYLE.h1}">🎲 ${SCRIPT_NAME} 🎲</h1>
      <p style="${STYLE.subtitle}">${h('versionLabel')} ${SCRIPT_VERSION} • ${h('subtitle')}</p>
    </div>
    ${section('overview', `<p style="${STYLE.p}">${h('overview.body')}</p>`)}
    ${section('quickStart', list(raw('quickStart.steps'), true))}
    ${section('examples', `${list(raw('examples.points'))}${pre(raw('examples.code')?.join?.('\n') || '')}`)}
    ${section('matching', list(raw('matching.points')))}
    ${section(
      'templates',
      `${list(raw('templates.points'))}${table([t('handout.templates.colSheet', lang), t('handout.templates.colNames', lang)], templates)}
       <p style="${STYLE.p}">${h('templates.links')} ${templateLinks}</p>`
    )}
    ${section('rolls', list(raw('rolls.points')))}
    ${section('commands', `<p style="${STYLE.p}">${h('commands.intro')}</p>${table([t('handout.commands.colCommand', lang), t('handout.commands.colDesc', lang)], commands)}`)}
    ${section('options', `<p style="${STYLE.p}">${h('options.intro')}</p>${table([t('handout.options.colOption', lang), t('handout.options.colDesc', lang)], options)}`)}
    ${section('placeholders', `<p style="${STYLE.p}">${h('placeholders.intro')}</p>${table([t('handout.placeholders.colName', lang), t('handout.placeholders.colDesc', lang)], placeholders)}`)}
    ${section('running', list(raw('running.points')))}
    ${section('inspector', list(raw('inspector.points')))}
    ${section('settings', `<p style="${STYLE.p}">${h('settings.intro')}</p>${table([t('handout.settings.colKey', lang), t('handout.settings.colName', lang), t('handout.settings.colDesc', lang)], settings)}`)}
    ${section('storage', `<p style="${STYLE.p}">${h('storage.body', { character: STORE_CHARACTER_NAME })}</p>`)}
    ${section('upgrading', `${list(raw('upgrading.points'))}${table([t('handout.upgrading.colV1', lang), t('handout.upgrading.colV2', lang)], legacy)}`)}
    ${section('troubleshooting', list(raw('troubleshooting.points')))}
    ${section('languages', `<p style="${STYLE.p}">${h('languages.body')}</p><p style="${STYLE.p};font-size:0.85em">${locales}</p>`)}
    ${section(
      'credits',
      `<p style="${STYLE.p}">${h('credits.original')} ${link(original.profile, original.name)} • ${link(original.wiki, t('handout.credits.wiki', lang))}</p>
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
  const q = (key) => `?{${tr(`prompts.${key}`).replaceAll(/[|{},]/g, ' ')}|}`;
  const btn = (key, cmd, dark = false) =>
    `<a href="${escapeAttr(`${COMMAND} ${cmd}`.trim())}" style="${dark ? STYLE.btnDark : STYLE.btn}">${escapeHtml(tr(`buttons.${key}`))}</a>`;
  const group = (titleKey, descKey, buttons) =>
    `<div style="${STYLE.section}">${escapeHtml(tr(titleKey))}</div><div style="${STYLE.desc}">${escapeHtml(tr(descKey))}</div><div>${buttons.join('')}</div>`;

  return `<div style="${STYLE.outer}${getDirectionStyle(lang)}">
    <div style="${STYLE.header}">
      <h1 style="${STYLE.h1}">🎲 ${SCRIPT_NAME} 🎲</h1>
      <p style="${STYLE.subtitle}">${escapeHtml(tr('deck.subtitle'))} • v${SCRIPT_VERSION}</p>
    </div>
    ${group('deck.listeners', 'deck.listenersDesc', [btn('menu', ''), btn('new', `new ${q('newName')}`), btn('edit', `show ${q('target')}`, true), btn('test', `test ${q('target')}`, true)])}
    ${group('deck.listening', 'deck.listeningDesc', [btn('turnOn', 'on'), btn('turnOff', 'off', true)])}
    ${group('deck.tools', 'deck.toolsDesc', [btn('inspect', 'inspect'), btn('inspectOff', 'inspect off', true), btn('settings', 'config', true), btn('rebuildJournal', 'journal', true), btn('help', 'help', true)])}
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
 * Creates or refreshes the Help and Command Deck handouts in the current language.
 *
 * @returns {void}
 */
export function installHandouts() {
  const lang = getConfig().language;
  upsertHandout(HANDOUT_HELP_NAME, buildHelpHtml(lang));
  upsertHandout(HANDOUT_DECK_NAME, buildDeckHtml(lang));
}
