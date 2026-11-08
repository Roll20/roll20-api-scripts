// Journal handouts: the Help handout and the Command Deck. Both are rebuilt on
// every start and when the language changes, so they always match the
// installed version.

import { buildLocaleFlag } from './chat.js';
import {
  AUTHOR_LINKS,
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
  COMMAND,
  DECK_TITLE,
  DEFAULT_SETTINGS,
  DEMO_GIF_URL,
  HANDOUT_DECK_NAME,
  HANDOUT_HELP_NAME,
  SCRIPT_NAME,
  SCRIPT_VERSION,
} from './constants.js';
import { getDirectionStyle, getLocale, LOCALE_DEFINITIONS, t, tRaw } from './i18n.js';
import { BUILTIN_PRESETS, PRESET_PACKS } from './presets.js';
import { getLang } from './state.js';
import { escapeHtml } from './utils.js';

// Every command, with the key of its description under help.*. Shared by the
// chat help card and the Help handout.
export const COMMAND_LIST = [
  ['', 'menu'],
  ['create [name]', 'create'],
  ['edit', 'edit'],
  ['preset <id>', 'preset'],
  ['presets', 'presets'],
  ['on | off | pause | resume | toggle', 'switches'],
  ['fire [count]', 'fire'],
  ['fx <effect>', 'fx'],
  ['interval <shortest> [longest]', 'interval'],
  ['direction random | <across> <down>', 'direction'],
  ['area <radius> [circle|square]', 'area'],
  ['intensity <n> | intensity global <n>', 'intensity'],
  ['name <text>', 'name'],
  ['layer add [effect] | layer remove <n>', 'layer'],
  ['trigger add <event> <action> [options]', 'triggerAdd'],
  ['trigger remove <n> | trigger clear', 'triggerRemove'],
  ['null create | null remove', 'null'],
  ['delete', 'delete'],
  ['status', 'status'],
  ['settings', 'settings'],
  ['set <setting> <value>', 'set'],
  ['rescan', 'rescan'],
  ['journal rebuild', 'journal'],
  ['help', 'help'],
];

const STYLE = {
  outer: `background:${COLOR_CARD_BG_BOTTOM};color:${COLOR_TEXT};padding:14px 18px;border:1px solid ${COLOR_BORDER};border-radius:6px;font-family:Arial,sans-serif;line-height:1.5;`,
  header: `background:${COLOR_HEADER_BG};padding:12px;border-radius:4px;text-align:center;border-bottom:3px solid ${COLOR_ACCENT};margin-bottom:12px;`,
  h1: `color:${COLOR_HEADER_TEXT};margin:0;font-size:1.8em;letter-spacing:0.05em;`,
  subtitle: `color:${COLOR_MUTED};margin:4px 0 0 0;font-size:0.9em;`,
  h2: `color:${COLOR_ACCENT};border-bottom:1px solid ${COLOR_BORDER};padding-bottom:3px;margin:18px 0 8px 0;font-size:1.25em;`,
  p: `color:${COLOR_TEXT};margin:6px 0;`,
  li: `color:${COLOR_TEXT};margin:3px 0;`,
  table: 'width:100%;border-collapse:collapse;margin:6px 0;font-size:0.92em;',
  th: `background:${COLOR_HEADER_BG};color:${COLOR_HEADER_TEXT};padding:5px 8px;text-align:start;border:1px solid ${COLOR_BORDER};`,
  td: `padding:5px 8px;border:1px solid ${COLOR_BORDER};vertical-align:top;color:${COLOR_TEXT};`,
  // Commands read left to right inside right-to-left handouts; without this the "!" of
  // "!pagefx create" moves to the end in Hebrew. inline-block holds even if unicode-bidi is stripped.
  code: 'font-family:monospace;color:#d9c2ff;direction:ltr;unicode-bidi:embed;display:inline-block;',
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
  const h = (key, vars) => escapeHtml(t(`handout.${key}`, lang, vars));
  const raw = (key) => tRaw(`handout.${key}`, lang);
  const code = (text) => `<span style="${STYLE.code}">${escapeHtml(text)}</span>`;
  const p = (key) => `<p style="${STYLE.p}">${h(key)}</p>`;
  const section = (key, body) => `<h2 style="${STYLE.h2}">${h(`${key}.heading`)}</h2>${body}`;

  const commands = COMMAND_LIST.map(([cmd, key]) => [
    code(`${COMMAND} ${cmd}`.trim()),
    escapeHtml(t(`help.${key}`, lang)),
  ]);
  const settings = Object.keys(DEFAULT_SETTINGS).map((key) => [
    code(key),
    escapeHtml(t(`handout.settings.rows.${key}`, lang)),
  ]);
  const presets = PRESET_PACKS.map((pack) => [
    escapeHtml(t(`packs.${pack}`, lang)),
    BUILTIN_PRESETS.filter((preset) => preset.pack === pack)
      .map((preset) => `${escapeHtml(t(`presets.${preset.id}`, lang))} ${code(preset.id)}`)
      .join('<br>'),
  ]);
  const v1 = [
    ['!pageFX on', `${COMMAND} resume`],
    ['!pageFX off', `${COMMAND} pause`],
  ].map(([a, b]) => [code(a), code(b)]);
  const api = [
    ['activateAllEffects()', 'activateAll'],
    ['deactivateAllEffects()', 'deactivateAll'],
    ['activateEffect(token) / deactivateEffect(token) / toggleEffect(token)', 'activate'],
    ['start(token) / stop(token) / pause(token) / resume(token)', 'start'],
    ['setIntensity(token, n)', 'setIntensity'],
    ['fire(token, count)', 'fire'],
    ['create(token, options) / remove(token)', 'create'],
    ['getEffect(token) / listEffects(pageId) / isRunning(token)', 'getEffect'],
    ['registerPreset(id, definition) / listPresets()', 'registerPreset'],
    ['checkToken(token)', 'checkToken'],
  ].map(([fn, key]) => [code(`PageFX.${fn}`), escapeHtml(t(`handout.api.rows.${key}`, lang))]);
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
    ${section('overview', `${p('overview.body')}<p style="${STYLE.p}">${link(DEMO_GIF_URL, t('handout.overview.demo', lang))}</p>`)}
    ${section('quickStart', list(raw('quickStart.steps'), true))}
    ${section('effects', list(raw('effects.points')))}
    ${section('pages', list(raw('pages.points')))}
    ${section('presets', `${p('presets.intro')}${table([t('handout.presets.colPack', lang), t('handout.presets.colPresets', lang)], presets)}`)}
    ${section('triggers', `${p('triggers.intro')}${list(raw('triggers.points'))}`)}
    ${section('nullAreas', list(raw('nullAreas.points')))}
    ${section('commands', `${p('commands.intro')}${table([t('handout.commands.colCommand', lang), t('handout.commands.colDesc', lang)], commands)}`)}
    ${section('settings', `${p('settings.intro')}${table([t('handout.settings.colKey', lang), t('handout.settings.colDesc', lang)], settings)}`)}
    ${section('api', `${p('api.intro')}${table([t('handout.api.colFunction', lang), t('handout.api.colDesc', lang)], api)}`)}
    ${section('upgrading', `${list(raw('upgrading.points'))}${table([t('handout.upgrading.colV1', lang), t('handout.upgrading.colV2', lang)], v1)}`)}
    ${section('troubleshooting', list(raw('troubleshooting.points')))}
    ${section('languages', `${p('languages.body')}${table([t('handout.languages.colLanguage', lang), t('handout.languages.colNative', lang), t('handout.languages.colCode', lang)], locales)}`)}
    ${section(
      'credits',
      `<p style="${STYLE.p}">${h('credits.original')} ${link(original.profile, original.name)} • ${link(original.marketplace, t('handout.credits.marketplace', lang))}</p>
       <p style="${STYLE.p}">${h('credits.maintainer')} ${link(maintainer.profile, maintainer.name)} • ${link(maintainer.github, 'GitHub')}</p>
       ${p('credits.support')}`
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
  const btn = (key, cmd, dark = false) =>
    `<a href="${escapeHtml(`${COMMAND} ${cmd}`.trim())}" style="${dark ? STYLE.btnDark : STYLE.btn}">${escapeHtml(tr(`buttons.${key}`))}</a>`;
  const group = (titleKey, descKey, buttons) =>
    `<div style="${STYLE.section}">${escapeHtml(tr(titleKey))}</div><div style="${STYLE.desc}">${escapeHtml(tr(descKey))}</div><div>${buttons.join('')}</div>`;

  return `<div style="${STYLE.outer}${getDirectionStyle(lang)}">
    <div style="${STYLE.header}">
      <h1 style="${STYLE.h1}">✦ ${SCRIPT_NAME} ✦</h1>
      <p style="${STYLE.subtitle}">${DECK_TITLE} • v${SCRIPT_VERSION}</p>
    </div>
    ${group('deck.menuTitle', 'deck.menuDesc', [btn('menu', ''), btn('status', 'status', true), btn('settings', 'settings', true), btn('help', 'help', true)])}
    ${group('deck.newTitle', 'deck.newDesc', [btn('create', 'create --edit'), btn('presets', 'presets'), btn('createNull', 'null create'), btn('removeNull', 'null remove', true)])}
    ${group('deck.selectedTitle', 'deck.selectedDesc', [btn('edit', 'edit'), btn('fire', 'fire'), btn('turnOn', 'on', true), btn('turnOff', 'off', true), btn('pause', 'pause', true), btn('resume', 'resume', true)])}
    ${group('deck.allTitle', 'deck.allDesc', [btn('pauseAll', 'pause --ids'), btn('resumeAll', 'resume --ids')])}
    ${group('deck.toolsTitle', 'deck.toolsDesc', [btn('rescan', 'rescan', true), btn('rebuild', 'journal rebuild', true)])}
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
