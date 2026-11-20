// Chat menus: the main card, the roster card, settings and status.

import {
  buildButton,
  buildDivider,
  buildLocaleFlag,
  buildNote,
  buildRow,
  buildSecondaryButton,
  buildSectionLabel,
  whisper,
} from './chat.js';
import {
  COMMAND,
  DEFAULT_CONFIG,
  HANDOUT_DECK_NAME,
  HANDOUT_HELP_NAME,
  SCRIPT_NAME,
  SCRIPT_VERSION,
  SETTING_TYPES,
} from './constants.js';
import { getLocale, LOCALE_DEFINITIONS, t } from './i18n.js';
import { getRoster, rosterSource, shareOf } from './roster.js';
import { previewPayout } from './session.js';
import { getProfile } from './sheets.js';
import { getCharacterRecord, getConfig, getSession, getState } from './state.js';
import { TRACK_SHEET, getProfileById, parseTrackPlan, systemIds } from './systems.js';
import { canUseBeacon, escapeForChat, formatNumber, getSandboxVersion } from './utils.js';

/**
 * Returns the language and a translate shortcut.
 *
 * @returns {{lang: string, tr: Function}} Helpers.
 */
function helpers() {
  const lang = getConfig().language;
  return { lang, tr: (key, vars) => t(key, lang, vars) };
}

/**
 * Shows the main menu to the GM.
 *
 * @param {string|null} playerId GM to whisper.
 * @returns {void}
 */
export function showMainMenu(playerId) {
  const { tr } = helpers();
  const config = getConfig();
  const session = getSession();
  const lines = [];
  lines.push(buildRow(tr('menu.session'), `<strong>${session.number}</strong>`));
  const { split, rows } = previewPayout();
  lines.push(
    buildRow(
      tr('menu.pool'),
      `<strong>${formatNumber(session.pool)}</strong>${session.carried ? ` (+${formatNumber(session.carried)})` : ''}`
    ),
    buildRow(tr('menu.payout'), escapeForChat(tr(`options.payout.${config.payout}`))),
    // Half shares are common, so shares keep up to two decimals (3.5, not 4).
    buildRow(
      tr('menu.shares'),
      Number.isInteger(split.shares)
        ? formatNumber(split.shares)
        : String(Math.round(split.shares * 100) / 100)
    ),
    buildRow(tr('menu.perShare'), formatNumber(split.perShare))
  );
  lines.push(
    buildSectionLabel(tr('menu.party', { source: tr(`options.roster.${rosterSource()}`) }))
  );
  if (rows.length === 0) {
    lines.push(buildNote(escapeForChat(tr('menu.noParty'))));
  }
  for (const row of rows) {
    const rec = getCharacterRecord(row.id);
    const toggle = rec.absent
      ? buildSecondaryButton(tr('buttons.present'), `${COMMAND} present --ids ${row.id} --menu`)
      : buildSecondaryButton(tr('buttons.absent'), `${COMMAND} absent --ids ${row.id} --menu`);
    const detail = [
      config.payout === 'end' ? formatNumber(row.total) : formatNumber(session.paid[row.id] || 0),
      rec.absent ? tr('menu.absentTag') : '',
      row.bonus ? tr('menu.bonusTag', { xp: formatNumber(row.bonus) }) : '',
    ]
      .filter(Boolean)
      .join(' ');
    lines.push(
      buildRow(
        row.name,
        `${escapeForChat(detail)} ${buildSecondaryButton('+', `${COMMAND} bonus ?{${tr('prompts.xp')}} --ids ${row.id} --menu`)}${toggle}`
      )
    );
  }
  lines.push(buildDivider());
  lines.push(
    `<div>${buildButton(tr('buttons.addXp'), `${COMMAND} add ?{${tr('prompts.xp')}} ?{${tr('prompts.reason')}| } --menu`)}${buildButton(tr('buttons.killSelected'), `${COMMAND} kill --menu`)}${buildButton(tr('buttons.bonusSelected'), `${COMMAND} bonus ?{${tr('prompts.xp')}} --menu`)}</div>`,
    `<div>${buildButton(tr('buttons.endSession'), `${COMMAND} end ?{${tr('prompts.confirmEnd')}|${tr('options.yesNo.yes')},yes|${tr('options.yesNo.no')},no}`)}${buildSecondaryButton(tr('buttons.undo'), `${COMMAND} undo --menu`)}</div>`
  );
  lines.push(
    `<div>${buildSecondaryButton(tr('buttons.roster'), `${COMMAND} roster`)}${buildSecondaryButton(tr('buttons.settings'), `${COMMAND} settings`)}${buildSecondaryButton(tr('buttons.status'), `${COMMAND} status`)}${buildSecondaryButton(tr('buttons.help'), `${COMMAND} help`)}</div>`
  );
  whisper(playerId, `${SCRIPT_NAME} v${SCRIPT_VERSION}`, lines);
}

/**
 * Shows the roster card: who is in the party, shares and absence.
 *
 * @param {string|null} playerId GM to whisper.
 * @returns {void}
 */
export function showRoster(playerId) {
  const { tr } = helpers();
  const config = getConfig();
  const source = rosterSource();
  const lines = [
    buildRow(tr('menu.rosterSource'), escapeForChat(tr(`options.roster.${config.roster}`))),
    buildNote(escapeForChat(tr(`roster.explain.${source}`))),
  ];
  const roster = getRoster();
  if (roster.length === 0) {
    lines.push(buildNote(escapeForChat(tr('menu.noParty'))));
  }
  for (const c of roster) {
    const rec = getCharacterRecord(c.id);
    // Name and share on one line, the buttons under it: three buttons do not fit beside
    // a name in the chat panel.
    const tags = [
      tr('menu.shareTag', { share: shareOf(c.id) }),
      rec.absent ? tr('menu.absentTag') : '',
    ]
      .filter(Boolean)
      .join(' ');
    lines.push(
      `<div style="margin:4px 0 2px 0"><strong>${escapeForChat(c.get('name'))}</strong> <span style="font-size:0.85em">${escapeForChat(tags)}</span></div>`,
      `<div>${buildSecondaryButton(tr('buttons.share'), `${COMMAND} share ?{${tr('prompts.share')}|1} --ids ${c.id} --roster`)}${buildSecondaryButton(rec.absent ? tr('buttons.present') : tr('buttons.absent'), `${COMMAND} ${rec.absent ? 'present' : 'absent'} --ids ${c.id} --roster`)}${buildSecondaryButton(tr('buttons.exclude'), `${COMMAND} exclude --ids ${c.id} --roster`)}</div>`
    );
  }
  const excluded = Object.entries(getState().characters)
    .filter(([, rec]) => rec.excluded)
    .map(([id]) => getObj('character', id))
    .filter(Boolean);
  if (excluded.length > 0) {
    lines.push(buildSectionLabel(tr('menu.excluded')));
    for (const c of excluded) {
      lines.push(
        buildRow(
          c.get('name'),
          buildSecondaryButton(tr('buttons.include'), `${COMMAND} include --ids ${c.id} --roster`)
        )
      );
    }
  }
  lines.push(buildDivider());
  lines.push(
    `<div>${buildButton(tr('buttons.partyAdd'), `${COMMAND} party add --roster`)}${buildSecondaryButton(tr('buttons.partyRemove'), `${COMMAND} party remove --roster`)}${buildSecondaryButton(tr('buttons.menu'), COMMAND)}</div>`,
    buildNote(escapeForChat(tr('roster.selectHint')))
  );
  whisper(playerId, tr('titles.roster'), lines);
}

/**
 * Describes the Pathfinder 1E track setting for the settings card, such as
 * "Fast 1–3 · Medium 4–13 · Slow 14+".
 *
 * @param {string} value Setting value.
 * @param {Function} tr Translate shortcut.
 * @returns {string} Label.
 */
export function trackLabel(value, tr) {
  if (value === TRACK_SHEET) return tr('options.pf1Track.sheet');
  const plan = parseTrackPlan(value);
  if (!plan) return String(value);
  if (plan.length === 1) return tr(`options.pf1Track.${plan[0].track}`);
  return plan
    .map((p, i) => {
      const to = plan[i + 1] ? plan[i + 1].from - 1 : null;
      const range = to === null ? `${p.from}+` : to === p.from ? `${p.from}` : `${p.from}–${to}`;
      return `${tr(`options.pf1Track.${p.track}`)} ${range}`;
    })
    .join(' · ');
}

/**
 * Builds the edit button for one setting.
 *
 * @param {string} key Setting name.
 * @returns {string} Button HTML.
 */
function settingButton(key) {
  const { tr } = helpers();
  const config = getConfig();
  const type = SETTING_TYPES[key];
  const value = config[key];
  const cmd = (v) => `${COMMAND} set ${key} ${v} --settings`;
  if (type === 'boolean') {
    return buildSecondaryButton(
      value ? tr('options.yesNo.yes') : tr('options.yesNo.no'),
      cmd(!value)
    );
  }
  if (Array.isArray(type)) {
    const label = typeof type[0] === 'number' ? String(value) : tr(`options.${key}.${value}`);
    const query = type
      .map(
        (v) =>
          `${typeof v === 'number' ? v : tr(`options.${key}.${v}`).replace(/[,|}]/g, ' ')},${v}`
      )
      .join('|');
    return buildSecondaryButton(label, cmd(`?{${tr(`settings.${key}.label`)}|${query}}`));
  }
  if (type === 'system') {
    const query = systemIds()
      // Commas and pipes would split a Roll20 query option.
      .map(
        (id) =>
          `${(id === 'auto' ? tr('options.system.auto') : getProfileById(id).label).replace(/[,|]/g, ' /')},${id}`
      )
      .join('|');
    const label =
      value === 'auto' ? tr('options.system.auto') : getProfileById(value)?.label || value;
    return buildSecondaryButton(label, cmd(`?{${tr('settings.system.label')}|${query}}`));
  }
  if (type === 'track') {
    const query = ['fast', 'medium', 'slow', TRACK_SHEET]
      .map((v) => `${tr(`options.pf1Track.${v}`).replace(/[,|}]/g, ' ')},${v}`)
      .join('|');
    const plan =
      value === TRACK_SHEET || !value.includes(',') ? 'fast 1, medium 4, slow 14' : value;
    return (
      buildSecondaryButton(
        trackLabel(value, tr),
        cmd(`?{${tr('settings.pf1Track.label')}|${query}}`)
      ) +
      buildSecondaryButton(tr('buttons.trackPlan'), cmd(`?{${tr('prompts.trackPlan')}|${plan}}`))
    );
  }
  if (type === 'locale') {
    const locale = LOCALE_DEFINITIONS.find((d) => d.code === getLocale(value));
    return buildSecondaryButton(
      locale?.nativeName || locale?.name || value,
      `${COMMAND} lang`,
      buildLocaleFlag(locale)
    );
  }
  if (type === 'share') {
    return buildSecondaryButton(
      `${Math.round(Number(value) * 100)}%`,
      cmd(`?{${tr('settings.absentShare.label')}|${Math.round(Number(value) * 100)}%}`)
    );
  }
  const shown = String(value) === '' ? tr('menu.blank') : String(value);
  return buildSecondaryButton(shown, cmd(`?{${tr(`settings.${key}.label`)}|${value}}`));
}

/**
 * Shows the settings card.
 *
 * @param {string|null} playerId GM to whisper.
 * @returns {void}
 */
export function showSettings(playerId) {
  const { tr } = helpers();
  const config = getConfig();
  const groups = [
    ['menu.groupXp', ['language', 'payout', 'updateSheets', 'announce', 'levelNotice']],
    ['menu.groupParty', ['roster', 'absentShare', 'extraShares']],
    [
      'menu.groupKills',
      ['killMode', 'killBar', 'hpBar', 'killMarker', 'marker', 'killDeathTracker'],
    ],
    ['menu.groupSheet', ['system']],
  ];
  if (['auto', 'pf1', 'pf1community'].includes(config.system)) {
    groups[3][1].push('pf1Track');
  }
  if (config.system === 'custom') {
    groups[3][1].push('customXp', 'customLevel', 'customNpcXp', 'customNpcCr', 'customLevels');
  }
  const lines = [];
  for (const [title, keys] of groups) {
    lines.push(buildSectionLabel(tr(title)));
    for (const key of keys) {
      lines.push(buildRow(tr(`settings.${key}.label`), settingButton(key)));
    }
  }
  lines.push(buildDivider());
  lines.push(
    `<div>${buildSecondaryButton(tr('buttons.menu'), COMMAND)}${buildSecondaryButton(tr('buttons.status'), `${COMMAND} status`)}</div>`
  );
  whisper(playerId, tr('titles.settings'), lines);
}

/**
 * Shows the status card: sandbox, sheet profiles in use and aliases.
 *
 * @param {string|null} playerId GM to whisper.
 * @param {string[]} aliases Command aliases in use.
 * @returns {void}
 */
export function showStatus(playerId, aliases) {
  const { tr } = helpers();
  const profiles = new Map();
  for (const c of findObjs({ _type: 'character' })) {
    const p = getProfile(c);
    profiles.set(p.id, (profiles.get(p.id) || 0) + 1);
  }
  const lines = [
    buildRow(tr('status.version'), `${SCRIPT_VERSION}`),
    buildRow(tr('status.sandbox'), escapeForChat(getSandboxVersion() || '?')),
    buildRow(
      tr('status.beacon'),
      escapeForChat(canUseBeacon() ? tr('options.yesNo.yes') : tr('options.yesNo.no'))
    ),
    buildRow(tr('status.commands'), escapeForChat([COMMAND, ...aliases].join(' '))),
    buildSectionLabel(tr('status.profiles')),
  ];
  for (const [id, count] of profiles) {
    const p = getProfileById(id);
    lines.push(buildRow(p?.label || id, escapeForChat(tr('status.characters', { count }))));
  }
  lines.push(
    buildNote(
      escapeForChat(tr('status.handouts', { help: HANDOUT_HELP_NAME, deck: HANDOUT_DECK_NAME }))
    )
  );
  whisper(playerId, tr('titles.status'), lines);
}

/**
 * Shows the language picker.
 *
 * @param {string|null} playerId GM to whisper.
 * @returns {void}
 */
export function showLanguages(playerId) {
  const { tr } = helpers();
  const buttons = LOCALE_DEFINITIONS.map((d) =>
    buildSecondaryButton(
      d.nativeName || d.name,
      `${COMMAND} set language ${d.code} --settings`,
      buildLocaleFlag(d)
    )
  );
  whisper(playerId, tr('titles.language'), `<div>${buttons.join('')}</div>`);
}

/**
 * Lists the settings and defaults for the help card.
 *
 * @returns {string[]} Setting names.
 */
export function settingNames() {
  return Object.keys(DEFAULT_CONFIG);
}
