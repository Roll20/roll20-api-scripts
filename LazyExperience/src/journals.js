// Journal handouts: Help, Command Deck and the Session Log.

import {
  AUTHOR_LINKS,
  COLOR_ACCENT,
  COLOR_BORDER,
  COLOR_BUTTON_BG,
  COLOR_BUTTON_TEXT,
  COLOR_CARD_BG_BOTTOM,
  COLOR_HEADER_BG,
  COLOR_HEADER_TEXT,
  COLOR_MUTED,
  COLOR_TEXT,
  COMMAND,
  DECK_TITLE,
  DEFAULT_CONFIG,
  HANDOUT_DECK_NAME,
  HANDOUT_HELP_NAME,
  HANDOUT_ICON,
  HANDOUT_ICON_PATH,
  HANDOUT_LOG_NAME,
  LONG_COMMAND,
  MAX_LOGGED_SESSIONS,
  SCRIPT_NAME,
  SCRIPT_VERSION,
  SHORT_ALIAS,
} from './constants.js';
import { buildLocaleFlag } from './chat.js';
import { getDirectionStyle, getLocale, LOCALE_DEFINITIONS, t, tRaw } from './i18n.js';
import { getConfig, getState } from './state.js';
import { PROFILES } from './systems.js';
import { escapeForChat, escapeHtml, formatNumber } from './utils.js';

const STYLE = {
  outer: `background:${COLOR_CARD_BG_BOTTOM};color:${COLOR_TEXT};padding:14px 18px;border:1px solid ${COLOR_BORDER};border-radius:6px;font-family:Arial,sans-serif;line-height:1.5;`,
  header: `background:${COLOR_HEADER_BG};padding:12px;border-radius:4px;text-align:center;border-bottom:3px solid ${COLOR_ACCENT};margin-bottom:12px;`,
  h1: `color:${COLOR_HEADER_TEXT};margin:0;font-size:1.8em;letter-spacing:0.05em;`,
  subtitle: `color:${COLOR_MUTED};margin:4px 0 0 0;font-size:0.9em;`,
  h2: `color:${COLOR_ACCENT};border-bottom:1px solid ${COLOR_BORDER};padding-bottom:3px;margin:18px 0 8px 0;font-size:1.25em;`,
  h3: `color:${COLOR_HEADER_TEXT};margin:12px 0 4px 0;font-size:1.05em;`,
  p: `color:${COLOR_TEXT};margin:6px 0;`,
  li: `color:${COLOR_TEXT};margin:3px 0;`,
  table: 'width:100%;border-collapse:collapse;margin:6px 0;font-size:0.92em;',
  th: `background:${COLOR_HEADER_BG};color:${COLOR_HEADER_TEXT};padding:5px 8px;text-align:left;border:1px solid ${COLOR_BORDER};`,
  td: `padding:5px 8px;border:1px solid ${COLOR_BORDER};vertical-align:top;color:${COLOR_TEXT};`,
  code: 'font-family:monospace;color:#f3d48b;white-space:nowrap;',
  link: `color:${COLOR_ACCENT};`,
  footer: `color:${COLOR_MUTED};font-size:0.85em;text-align:center;margin-top:16px;border-top:1px solid ${COLOR_BORDER};padding-top:8px;`,
  btn: `background:${COLOR_BUTTON_BG};color:${COLOR_BUTTON_TEXT};padding:3px 9px;border-radius:3px;text-decoration:none;font-size:0.9em;display:inline-block;margin:2px 3px;font-weight:bold;`,
  btnDark: `background:#3b2d57;color:${COLOR_TEXT};border:1px solid #6a5590;padding:3px 9px;border-radius:3px;text-decoration:none;font-size:0.9em;display:inline-block;margin:2px 3px;`,
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

  const commands = [
    ['', 'menu'],
    ['add <xp> [reason]', 'add'],
    ['bonus <xp> [reason] [--ids …]', 'bonus'],
    ['give <xp> [reason] [--ids …]', 'give'],
    ['kill [--xp <n>]', 'kill'],
    ['kill confirm <token> [xp]', 'killConfirm'],
    ['absent [--ids …]', 'absent'],
    ['present [--ids …]', 'present'],
    ['share <n> [--ids …]', 'share'],
    ['exclude | include [--ids …]', 'exclude'],
    ['undo', 'undo'],
    ['end', 'end'],
    ['reset session', 'resetSession'],
    ['show', 'show'],
    ['roster', 'roster'],
    ['party add | remove', 'party'],
    ['settings', 'settings'],
    ['set <setting> <value>', 'set'],
    ['lang [code]', 'lang'],
    ['status', 'status'],
    ['log', 'log'],
    ['journal', 'journal'],
    ['help', 'help'],
  ].map(([cmd, key]) => [code(`${COMMAND} ${cmd}`.trim()), escapeHtml(t(`help.${key}`, lang))]);

  const settings = Object.keys(DEFAULT_CONFIG).map((key) => [
    code(key),
    escapeHtml(t(`settings.${key}.label`, lang)),
    escapeHtml(t(`settings.${key}.desc`, lang)),
  ]);

  // Long sheet names must wrap, or the table is wider than the handout.
  const wrapCode = (text) =>
    `<span style="${STYLE.code.replace('white-space:nowrap;', 'word-break:break-all;')}">${escapeHtml(text)}</span>`;
  const systems = PROFILES.map((p) => [
    escapeHtml(p.label),
    wrapCode(p.id),
    // Roll20's name for the sheet (as in Game Settings), then the name Mods see.
    p.roll20Name
      ? `${escapeHtml(p.roll20Name)}<br>${wrapCode(p.sheets.join(', '))}`
      : escapeHtml(p.sheets.join(', ') || '—'),
    escapeHtml(t(`handout.systems.verified.${p.verified}`, lang)),
  ]);

  const legacyCommands = [
    ['!xp add session <xp>', `${COMMAND} add <xp>`],
    ['!xp add <characterid> <xp>', `${COMMAND} bonus <xp> --ids <characterid>`],
    ['!xp end', `${COMMAND} end`],
    ['!xp resetxp', `${COMMAND} reset session`],
    ['!xp config', `${COMMAND} settings`],
    ['!xp refresh', `${COMMAND} roster`],
  ].map(([v1, v2]) => [code(v1), code(v2)]);

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
    ${section('overview', `<p style="${STYLE.p}">${h('overview.body')}</p>`)}
    ${section('quickStart', list(raw('quickStart.steps'), true))}
    ${section('commands', `<p style="${STYLE.p}">${h('commands.intro', { long: LONG_COMMAND, short: SHORT_ALIAS })}</p><p style="${STYLE.p}">${h('commands.targets')}</p>${table([t('handout.commands.colCommand', lang), t('handout.commands.colDesc', lang)], commands)}`)}
    ${section('party', list(raw('party.points')))}
    ${section('splitting', list(raw('splitting.points')))}
    ${section('kills', list(raw('kills.points')))}
    ${section('levels', list(raw('levels.points')))}
    ${section('systems', `<p style="${STYLE.p}">${h('systems.intro')}</p>${table([t('handout.systems.colSystem', lang), t('handout.systems.colId', lang), t('handout.systems.colSheets', lang), t('handout.systems.colChecked', lang)], systems)}${list(raw('systems.points'))}`)}
    ${section('settings', `<p style="${STYLE.p}">${h('settings.intro')}</p>${table([t('handout.settings.colKey', lang), t('handout.settings.colName', lang), t('handout.settings.colDesc', lang)], settings)}`)}
    ${section('upgrading', `${list(raw('upgrading.points'))}${table([t('handout.upgrading.colV1', lang), t('handout.upgrading.colV2', lang)], legacyCommands)}`)}
    ${section('troubleshooting', list(raw('troubleshooting.points')))}
    ${section('languages', `<p style="${STYLE.p}">${h('languages.body')}</p>${table([t('handout.languages.colLanguage', lang), t('handout.languages.colNative', lang), t('handout.languages.colCode', lang)], locales)}`)}
    ${section(
      'credits',
      `<p style="${STYLE.p}">${h('credits.original')} ${link(original.profile, original.name)} • ${link(original.github, 'GitHub')} • ${link(original.patreon, 'Patreon')}</p>
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
  const btn = (key, cmd, dark = false) =>
    `<a href="${escapeHtml(`${COMMAND} ${cmd}`.trim())}" style="${dark ? STYLE.btnDark : STYLE.btn}">${escapeHtml(tr(`buttons.${key}`))}</a>`;
  const group = (titleKey, descKey, buttons) =>
    `<div style="${STYLE.section}">${escapeHtml(tr(titleKey))}</div><div style="${STYLE.desc}">${escapeHtml(tr(descKey))}</div><div>${buttons.join('')}</div>`;
  const xp = `?{${tr('prompts.xp')}}`;
  const reason = `?{${tr('prompts.reason')}| }`;

  return `<div style="${STYLE.outer}${getDirectionStyle(lang)}">
    <div style="${STYLE.header}">
      <h1 style="${STYLE.h1}">✦ ${SCRIPT_NAME} ✦</h1>
      <p style="${STYLE.subtitle}">${DECK_TITLE} • v${SCRIPT_VERSION}</p>
    </div>
    ${group('deck.session', 'deck.sessionDesc', [btn('menu', ''), btn('addXp', `add ${xp} ${reason}`), btn('undo', 'undo', true), btn('show', 'show', true), btn('endSession', `end ?{${tr('prompts.confirmEnd')}|${tr('options.yesNo.yes')},yes|${tr('options.yesNo.no')},no}`)])}
    ${group('deck.selected', 'deck.selectedDesc', [btn('killSelected', 'kill'), btn('bonusSelected', `bonus ${xp} ${reason}`), btn('giveSelected', `give ${xp} ${reason}`, true), btn('absent', 'absent', true), btn('present', 'present', true)])}
    ${group('deck.party', 'deck.partyDesc', [btn('roster', 'roster'), btn('partyAdd', 'party add', true), btn('partyRemove', 'party remove', true)])}
    ${group('deck.tools', 'deck.toolsDesc', [btn('settings', 'settings', true), btn('status', 'status', true), btn('log', 'log', true), btn('help', 'help', true)])}
    <div style="${STYLE.footer}">${escapeHtml(tr('deck.footer', { help: HANDOUT_HELP_NAME }))}</div>
  </div>`;
}

/**
 * Builds the HTML for one logged session.
 *
 * @param {object} entry Logged session.
 * @param {string} lang Locale code.
 * @returns {string} HTML string.
 */
function sessionHtml(entry, lang) {
  const tr = (key, vars) => t(key, lang, vars);
  const date = new Date(entry.ended).toISOString().slice(0, 16).replace('T', ' ');
  const parts = [
    `<h3 style="${STYLE.h3}">${escapeHtml(tr('log.sessionHeading', { number: entry.number, date }))}</h3>`,
  ];
  if (entry.totals.length > 0) {
    parts.push(
      table(
        [tr('log.colCharacter'), tr('log.colXp')],
        entry.totals.map((r) => [escapeForChat(r.name), formatNumber(r.xp)])
      )
    );
  } else {
    parts.push(`<p style="${STYLE.p}">${escapeHtml(tr('end.nothing'))}</p>`);
  }
  if (entry.awards.length > 0) {
    parts.push(
      `<p style="${STYLE.p}"><strong>${escapeHtml(tr('log.awards'))}</strong></p>`,
      `<ul>${entry.awards
        .map(
          (a) =>
            `<li style="${STYLE.li}">${formatNumber(a.xp)} XP — ${escapeForChat(a.reason || tr(`awardKinds.${a.kind}`))}${a.names ? ` (${escapeForChat(a.names)})` : ''}</li>`
        )
        .join('')}</ul>`
    );
  }
  if (entry.levelUps.length > 0) {
    parts.push(
      `<p style="${STYLE.p}"><strong>${escapeHtml(tr('log.levelUps'))}</strong> ${entry.levelUps
        .map((u) => escapeForChat(tr('end.levelLine', { name: u.name, level: u.level })))
        .join('; ')}</p>`
    );
  }
  if (entry.remainder > 0) {
    parts.push(
      `<p style="${STYLE.desc}">${escapeHtml(tr('end.remainder', { xp: formatNumber(entry.remainder) }))}</p>`
    );
  }
  return parts.join('');
}

/**
 * Builds the Session Log handout HTML.
 *
 * @param {string} locale Locale code.
 * @returns {string} HTML string.
 */
export function buildLogHtml(locale) {
  const lang = getLocale(locale);
  const history = getState().history || [];
  const body =
    history.length > 0
      ? history
          .map((entry) => sessionHtml(entry, lang))
          .join(`<hr style="border:none;border-top:1px solid ${COLOR_BORDER}">`)
      : `<p style="${STYLE.p}">${escapeHtml(t('log.empty', lang))}</p>`;
  return `<div style="${STYLE.outer}${getDirectionStyle(lang)}">
    <div style="${STYLE.header}">
      <h1 style="${STYLE.h1}">✦ ${escapeHtml(t('log.title', lang))} ✦</h1>
      <p style="${STYLE.subtitle}">${SCRIPT_NAME} v${SCRIPT_VERSION}</p>
    </div>
    ${body}
  </div>`;
}

/**
 * Adds an ended session to the history (newest first) and rewrites the Session Log.
 *
 * @param {object} summary Session summary from endSession.
 * @returns {void}
 */
export function logSession(summary) {
  const s = getState();
  if (!Array.isArray(s.history)) s.history = [];
  s.history.unshift({
    number: summary.number,
    ended: summary.ended,
    totals: summary.totals.map((r) => ({ name: r.name, xp: r.xp })),
    awards: summary.awards.map((a) => ({
      xp: a.xp,
      kind: a.kind,
      reason: a.reason,
      names: a.targets
        ? a.targets.map((id) => getObj('character', id)?.get('name') || id).join(', ')
        : '',
    })),
    levelUps: summary.levelUps.map((u) => ({ name: u.name, level: u.level })),
    remainder: summary.remainder,
  });
  s.history.splice(MAX_LOGGED_SESSIONS);
  upsertHandout(HANDOUT_LOG_NAME, buildLogHtml(getConfig().language));
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
  const handout = primary || createObj('handout', { name, avatar: HANDOUT_ICON });
  if (!handout) {
    return;
  }
  handout.set({ inplayerjournals: '', controlledby: '' });
  if (!String(handout.get('avatar') || '').includes(HANDOUT_ICON_PATH)) {
    handout.set('avatar', HANDOUT_ICON);
  }
  handout.set('notes', html);
  for (const dup of duplicates) {
    dup.remove();
  }
}

/**
 * Creates or refreshes the handouts in the current language.
 *
 * @returns {void}
 */
export function installHandouts() {
  const lang = getConfig().language;
  upsertHandout(HANDOUT_HELP_NAME, buildHelpHtml(lang));
  upsertHandout(HANDOUT_DECK_NAME, buildDeckHtml(lang));
  if ((getState().history || []).length > 0) {
    upsertHandout(HANDOUT_LOG_NAME, buildLogHtml(lang));
  }
}
