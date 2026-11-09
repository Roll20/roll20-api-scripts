// Chat cards: the main menu, status, settings, markers and help.

import {
  buildButton,
  buildDivider,
  buildRow,
  buildSecondaryButton,
  buildSectionLabel,
  whisper,
} from './chat.js';
import {
  BOOLEAN_SETTINGS,
  COMMAND,
  FX_COLOURS,
  FX_TYPES,
  MARKER_SETTINGS,
  SCRIPT_VERSION,
  SETTING_CHOICES,
  STATUS,
  STATUS_COLOURS,
} from './constants.js';
import { readHp } from './hp.js';
import { LOCALE_DEFINITIONS, t } from './i18n.js';
import { healthColorsInstalled } from './integration.js';
import { listMarkers, markerName } from './markers.js';
import { getOwner, healthColorsShares, OWNER_SETTINGS } from './owners.js';
import { getSandboxVersion } from './sheet.js';
import { getLang, getRecord, getSettings } from './state.js';
import { isPc } from './tracker.js';
import { escapeForChat, escapeHtml, toText, truncate } from './utils.js';

// Every command, with the key of its description under help.*. Shared by the
// help card and the Help handout.
export const COMMAND_LIST = [
  ['', 'menu'],
  ['status [all]', 'status'],
  ['check [all]', 'check'],
  ['stable', 'stable'],
  ['restore', 'restore'],
  ['clear', 'clear'],
  ['pc | npc | auto', 'role'],
  ['markers', 'markers'],
  ['macro', 'macro'],
  ['settings', 'settings'],
  ['set <setting> <value>', 'set'],
  ['reset', 'reset'],
  ['config [setting|value]', 'config'],
  ['journal rebuild', 'journal'],
  ['help', 'help'],
];

/**
 * Turns text into something safe inside a roll query option.
 *
 * @param {string} text Text.
 * @returns {string} Text without characters a query would split on.
 */
function queryText(text) {
  return toText(text)
    .replaceAll(/[|,{}]/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim();
}

/**
 * Returns the GM's current page ID.
 *
 * @param {string} playerId GM's player ID.
 * @returns {string} Page ID.
 */
export function gmPageId(playerId) {
  const player = getObj('player', playerId);
  return (player && player.get('_lastpage')) || Campaign().get('playerpageid');
}

/**
 * Lists the tokens on a page that have readable hit points.
 *
 * @param {string} pageId Page ID.
 * @returns {object[]} Roll20 graphics.
 */
export function tokensWithHp(pageId) {
  const bar = getSettings().hpBar;
  return findObjs({ _type: 'graphic', _pageid: pageId, _subtype: 'token' }).filter(
    (tok) => readHp(tok, bar).value !== null
  );
}

/**
 * Builds a coloured status label.
 *
 * @param {string|null} status Status.
 * @param {string} lang Locale.
 * @returns {string} HTML.
 */
function statusLabel(status, lang) {
  const colour = STATUS_COLOURS[status] || '#a99fc9';
  return `<span style="color:${colour};font-weight:bold">${escapeHtml(t(`status.${status || 'none'}`, lang))}</span>`;
}

/**
 * Builds one token's status line.
 *
 * @param {object} token Roll20 graphic.
 * @param {string} lang Locale.
 * @returns {string} HTML.
 */
export function tokenLine(token, lang) {
  const rec = getRecord(token.id);
  const { value, max } = readHp(token, getSettings().hpBar);
  const name = escapeForChat(truncate(token.get('name') || t('status.unnamed', lang), 32));
  const hp =
    value === null
      ? ''
      : t(max ? 'status.hp' : 'status.hpNoMax', lang, { hp: value, max: max ?? '' });
  const role = t(isPc(token) ? 'status.pc' : 'status.npc', lang);
  let extra = '';
  if (rec?.saves && [STATUS.DYING, STATUS.STABLE].includes(rec.status)) {
    extra = `<div style="font-size:0.85em;margin-left:8px">${escapeHtml(t('status.saves', lang, rec.saves))}</div>`;
  }
  if (rec?.actions) {
    extra += `<div style="font-size:0.85em;margin-left:8px">${escapeHtml(t('status.actions', lang))}</div>`;
  }
  return `<div><strong>${name}</strong> <span style="font-size:0.85em">(${escapeHtml(role)}, ${escapeHtml(hp)})</span> ${statusLabel(rec?.status ?? null, lang)}${extra}</div>`;
}

/**
 * Sends the main menu.
 *
 * @param {string} playerId GM's player ID.
 * @returns {void}
 */
export function showMenu(playerId) {
  const lang = getLang();
  const pageId = gmPageId(playerId);
  const tokens = tokensWithHp(pageId);
  const counts = {};
  const down = [];
  for (const tok of tokens) {
    const rec = getRecord(tok.id);
    const status = rec?.status;
    if (status) {
      counts[status] = (counts[status] || 0) + 1;
      if ([STATUS.DYING, STATUS.STABLE, STATUS.DEAD].includes(status) && isPc(tok)) {
        down.push(tok);
      }
    }
  }
  const page = getObj('page', pageId);
  const summary = [STATUS.HEALTHY, STATUS.BLOODIED, STATUS.DYING, STATUS.STABLE, STATUS.DEAD]
    .filter((s) => counts[s])
    .map((s) => `${statusLabel(s, lang)} ${counts[s]}`)
    .join(' • ');
  const sandbox = getSandboxVersion() || t('menu.sandboxUnknown', lang);
  whisper(playerId, t('titles.menu', lang), [
    `<div style="font-size:0.85em">${escapeHtml(t('status.page', lang, { page: escapeForChat(page?.get('name') || '') }))}</div>`,
    buildSectionLabel(t('menu.summary', lang)),
    `<div>${summary || escapeHtml(t('status.noneHere', lang))}</div>`,
    buildSectionLabel(t('menu.down', lang)),
    down.length
      ? down.map((tok) => tokenLine(tok, lang)).join('')
      : `<div>${escapeHtml(t('menu.noneDown', lang))}</div>`,
    buildDivider(),
    buildButton(t('buttons.checkPage', lang), `${COMMAND} check all`),
    buildButton(t('buttons.status', lang), `${COMMAND} status`),
    buildSecondaryButton(t('buttons.check', lang), `${COMMAND} check`),
    buildSecondaryButton(t('buttons.stable', lang), `${COMMAND} stable`),
    buildSecondaryButton(t('buttons.restore', lang), `${COMMAND} restore`),
    buildSecondaryButton(t('buttons.clear', lang), `${COMMAND} clear`),
    buildSectionLabel(t('menu.tools', lang)),
    buildSecondaryButton(t('buttons.pc', lang), `${COMMAND} pc`),
    buildSecondaryButton(t('buttons.npc', lang), `${COMMAND} npc`),
    buildSecondaryButton(t('buttons.auto', lang), `${COMMAND} auto`),
    buildSecondaryButton(t('buttons.markers', lang), `${COMMAND} markers`),
    buildButton(t('buttons.settings', lang), `${COMMAND} settings`),
    buildSecondaryButton(t('buttons.help', lang), `${COMMAND} help`),
    buildDivider(),
    `<div style="font-size:0.8em;color:#a99fc9">v${SCRIPT_VERSION} • ${escapeHtml(t('menu.sandbox', lang, { version: sandbox }))}${healthColorsInstalled() ? ` • ${escapeHtml(t('menu.hcNote', lang))}` : ''}</div>`,
  ]);
}

/**
 * Sends the status of some tokens.
 *
 * @param {string} playerId Player to tell.
 * @param {object[]} tokens Tokens.
 * @returns {void}
 */
export function showStatus(playerId, tokens) {
  const lang = getLang();
  const lines = tokens.map((tok) => tokenLine(tok, lang));
  whisper(playerId, t('titles.status', lang), [
    lines.length ? lines.join('') : `<div>${escapeHtml(t('status.noneHere', lang))}</div>`,
    buildDivider(),
    buildSecondaryButton(t('buttons.menu', lang), COMMAND),
  ]);
}

/**
 * Describes a setting's value for the settings card.
 *
 * @param {string} key Setting.
 * @param {*} value Value.
 * @param {string} lang Locale.
 * @returns {string} Text.
 */
export function describeValue(key, value, lang) {
  if (key in OWNER_SETTINGS) {
    if (value === 'off') {
      return t('buttons.off', lang);
    }
    const missing =
      (value === 'HealthColors' && !healthColorsShares()) ||
      (value !== 'HealthColors' && value !== 'DeathTracker');
    return missing ? `${value} (${t('choices.notInstalled', lang)})` : value;
  }
  if (BOOLEAN_SETTINGS.includes(key)) {
    return t(value ? 'buttons.on' : 'buttons.off', lang);
  }
  if (MARKER_SETTINGS.includes(key)) {
    return value ? markerName(value) : t('choices.none', lang);
  }
  if (key in SETTING_CHOICES) {
    return t(`choices.${key}.${value}`, lang);
  }
  if (key === 'bloodiedPercent') {
    return value > 0 ? `${value}%` : t('choices.none', lang);
  }
  if (key === 'language') {
    return LOCALE_DEFINITIONS.find((d) => d.code === value)?.nativeName || value;
  }
  return toText(value);
}

/**
 * Builds the command a setting's button runs (with a query for its value).
 *
 * @param {string} key Setting.
 * @param {*} value Current value.
 * @param {string} lang Locale.
 * @returns {string} Command.
 */
function settingCommand(key, value, lang) {
  const set = `${COMMAND} set ${key}`;
  if (key in OWNER_SETTINGS) {
    return `${set} ?{${queryText(t(`settings.${key}`, lang))}|DeathTracker|HealthColors|${queryText(t('buttons.off', lang))},off} --settings`;
  }
  if (BOOLEAN_SETTINGS.includes(key)) {
    return `${set} ${value ? 'off' : 'on'} --settings`;
  }
  if (key in SETTING_CHOICES) {
    const options = SETTING_CHOICES[key]
      .map((v) => `${queryText(t(`choices.${key}.${v}`, lang))},${v}`)
      .join('|');
    return `${set} ?{${queryText(t(`settings.${key}`, lang))}|${options}} --settings`;
  }
  if (MARKER_SETTINGS.includes(key)) {
    const options = [
      `${queryText(t('choices.none', lang))},none`,
      ...listMarkers().map((m) => `${queryText(m.name)},${m.tag}`),
    ].join('|');
    return `${set} ?{${queryText(t('prompts.marker', lang))}|${options}} --settings`;
  }
  if (key === 'bloodiedPercent') {
    return `${set} ?{${queryText(t('prompts.percent', lang))}|${value}} --settings`;
  }
  if (key === 'hurtFxType' || key === 'healFxType') {
    const options = FX_TYPES.flatMap((type) => FX_COLOURS.map((c) => `${type}-${c}`))
      .map((fx) => `${fx},${fx}`)
      .join('|');
    return `${set} ?{${queryText(t('prompts.fx', lang))}|${value},${value}|${options}} --settings`;
  }
  if (key === 'successFields' || key === 'failureFields') {
    return `${set} ?{${queryText(t('prompts.fields', lang))}|${value}} --settings`;
  }
  if (key === 'language') {
    const options = LOCALE_DEFINITIONS.map(
      (d) => `${queryText(d.nativeName || d.name)},${d.code}`
    ).join('|');
    return `${set} ?{${queryText(t('prompts.language', lang))}|${options}} --settings`;
  }
  return set;
}

// The settings card's sections and what is in each.
const SETTING_SECTIONS = [
  ['owners', Object.keys(OWNER_SETTINGS)],
  ['hp', ['hpBar', 'bloodiedPercent', 'pcDetection']],
  ['markers', ['bloodiedMarker', 'dyingMarker', 'stableMarker', 'deadMarker']],
  [
    'deathSaves',
    [
      'deathSaves',
      'resetSheetSaves',
      'successFields',
      'failureFields',
      'massiveDamage',
      'announce',
    ],
  ],
  ['onDeath', ['deathLayer', 'deathTurnOrder', 'deathActionsFor']],
  ['looks', ['tintPlayers', 'tintNpcs', 'hurtFx', 'hurtFxType', 'healFx', 'healFxType']],
  ['general', ['language']],
];

/**
 * Sends the settings card.
 *
 * @param {string} playerId GM's player ID.
 * @returns {void}
 */
export function showSettings(playerId) {
  const lang = getLang();
  const s = getSettings();
  const parts = [];
  for (const [section, keys] of SETTING_SECTIONS) {
    parts.push(buildSectionLabel(t(`sections.${section}`, lang)));
    for (const key of keys) {
      const value = key in OWNER_SETTINGS ? getOwner(OWNER_SETTINGS[key]) : s[key];
      const label = describeValue(key, value, lang);
      parts.push(
        buildRow(
          t(`settings.${key}`, lang),
          buildSecondaryButton(truncate(label, 24), settingCommand(key, value, lang))
        )
      );
    }
  }
  parts.push(buildDivider());
  parts.push(buildSecondaryButton(t('buttons.macro', lang), `${COMMAND} macro`));
  parts.push(buildSecondaryButton(t('buttons.rebuild', lang), `${COMMAND} journal rebuild`));
  parts.push(buildSecondaryButton(t('buttons.reset', lang), `${COMMAND} reset`));
  parts.push(buildButton(t('buttons.back', lang), COMMAND));
  whisper(playerId, t('titles.settings', lang), parts);
}

/**
 * Sends the list of markers in the game.
 *
 * @param {string} playerId GM's player ID.
 * @returns {void}
 */
export function showMarkers(playerId) {
  const lang = getLang();
  const rows = listMarkers().map(
    (m) =>
      `<div style="font-size:0.9em">${escapeForChat(m.name)}${m.name === m.tag ? '' : ` <span style="color:#a99fc9">(${escapeForChat(m.tag)})</span>`}</div>`
  );
  whisper(playerId, t('titles.markers', lang), [
    ...rows,
    buildDivider(),
    buildButton(t('buttons.settings', lang), `${COMMAND} settings`),
  ]);
}

/**
 * Sends the list of commands.
 *
 * @param {string} playerId Player to tell.
 * @returns {void}
 */
export function showHelp(playerId) {
  const lang = getLang();
  const rows = COMMAND_LIST.map(
    ([cmd, key]) =>
      `<div style="margin:2px 0"><code>${escapeForChat(`${COMMAND} ${cmd}`.trim())}</code><div style="font-size:0.85em;margin-left:8px">${escapeHtml(t(`help.${key}`, lang))}</div></div>`
  );
  whisper(playerId, t('titles.help', lang), [
    ...rows,
    `<div style="font-size:0.85em">${escapeHtml(t('help.ids', lang))}</div>`,
    buildDivider(),
    buildButton(t('buttons.menu', lang), COMMAND),
  ]);
}
