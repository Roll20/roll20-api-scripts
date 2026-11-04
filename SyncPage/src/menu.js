// Chat cards: main menu, group card, players, settings, status, recycle bin
// and repair reports. Every card is whispered to the GM who asked.

import {
  buildButton,
  buildDivider,
  buildRow,
  buildSecondaryButton,
  buildSectionLabel,
  whisper,
} from './chat.js';
import {
  COLOR_ACCENT,
  COLOR_HIDDEN,
  COLOR_MUTED,
  COLOR_SHOWN,
  COMMAND,
  HANDOUT_DECK_NAME,
  HANDOUT_HELP_NAME,
  SCRIPT_NAME,
  SCRIPT_VERSION,
  SETTINGS,
} from './constants.js';
import { groupOfPage, linkOf, listGroups, pageName } from './groups.js';
import { LOCALE_DEFINITIONS, t } from './i18n.js';
import { listPlayers, pageOfPlayer, playersByPage } from './players.js';
import { getLang, getSetting } from './state.js';
import { escapeHtml, queryText, truncate } from './utils.js';
import { hiddenOn } from './visibility.js';

// Commands for the Help handout and `help`, with their help-text keys.
export const COMMAND_LIST = [
  ['', 'menu'],
  ['group create [name]', 'groupCreate'],
  ['group add <group>', 'groupAdd'],
  ['group remove', 'groupRemove'],
  ['group show <group>', 'groupShow'],
  ['group rename <group> <name>', 'groupRename'],
  ['group source <group>', 'groupSource'],
  ['group delete <group>', 'groupDelete'],
  ['players [group]', 'players'],
  ['move <player> <page>', 'move'],
  ['move all <page>', 'moveAll'],
  ['layout save|restore [group]', 'layout'],
  ['hide [here|others|all|page=<page>]', 'hide'],
  ['show [here|others|all|page=<page>]', 'show'],
  ['status', 'status'],
  ['unlink', 'unlink'],
  ['repair [group|all] [--dry-run]', 'repair'],
  ['pause [group]', 'pause'],
  ['resume [group]', 'resume'],
  ['undo [group]', 'undo'],
  ['recycle [group]', 'recycle'],
  ['settings [group <group>]', 'settings'],
  ['set [group <group>] <setting> <value>', 'set'],
  ['settings reset [group <group>]', 'settingsReset'],
  ['handouts', 'handouts'],
  ['help', 'help'],
];

const cmd = (text) => `${COMMAND} ${text}`.trim();

/**
 * Builds a coloured inline label.
 *
 * @param {string} text Text.
 * @param {string} colour CSS colour.
 * @returns {string} HTML.
 */
function pill(text, colour) {
  return `<span style="color:${colour};font-weight:bold">${escapeHtml(text)}</span>`;
}

/**
 * Builds a muted note.
 *
 * @param {string} text Text.
 * @returns {string} HTML.
 */
function note(text) {
  return `<div style="color:${COLOR_MUTED};font-size:0.85em">${escapeHtml(text)}</div>`;
}

/**
 * Builds a roll query listing the groups.
 *
 * @param {string} lang Locale.
 * @returns {string} Query text.
 */
function groupQuery(lang) {
  const names = listGroups().map((g) => queryText(g.name));
  return `?{${queryText(t('queries.group', lang))}|${names.join('|')}}`;
}

/**
 * Whispers the main menu.
 *
 * @param {object} ctx Command context.
 * @returns {void}
 */
export function showMenu(ctx) {
  const lang = getLang();
  const page = ctx.pageId;
  const group = groupOfPage(page);
  const parts = [];
  parts.push(buildRow(t('menu.thisPage', lang), escapeHtml(truncate(pageName(page), 28))));
  if (group) {
    const role = group.source === page ? t('menu.source', lang) : t('menu.copy', lang);
    parts.push(
      buildRow(
        t('menu.group', lang),
        `${escapeHtml(truncate(group.name, 24))} (${escapeHtml(role)})`
      )
    );
    if (group.paused) {
      parts.push(pill(t('menu.paused', lang), COLOR_HIDDEN));
    }
    parts.push(
      `<div>${buildButton(t('buttons.group', lang), cmd(`group show ${group.id}`))}${buildButton(t('buttons.players', lang), cmd(`players ${group.id}`))}${buildSecondaryButton(t('buttons.repair', lang), cmd(`repair ${group.id}`))}${buildSecondaryButton(t('buttons.dryRun', lang), cmd(`repair ${group.id} --dry-run`))}${buildSecondaryButton(group.paused ? t('buttons.resume', lang) : t('buttons.pause', lang), cmd(`${group.paused ? 'resume' : 'pause'} ${group.id}`))}</div>`
    );
    parts.push(
      `<div>${buildSecondaryButton(t('buttons.status', lang), cmd('status'))}${buildSecondaryButton(t('buttons.hideHere', lang), cmd('hide here'))}${buildSecondaryButton(t('buttons.showHere', lang), cmd('show here'))}${buildSecondaryButton(t('buttons.hideOthers', lang), cmd('hide others'))}${buildSecondaryButton(t('buttons.showOthers', lang), cmd('show others'))}</div>`
    );
    parts.push(note(t('menu.selectedHint', lang)));
  } else {
    parts.push(note(t('menu.notInGroup', lang)));
    const buttons = [
      buildButton(
        t('buttons.createGroup', lang),
        cmd(
          `group create ?{${queryText(t('queries.groupName', lang))}|${queryText(pageName(page))}}`
        )
      ),
    ];
    if (listGroups().length) {
      buttons.push(
        buildButton(t('buttons.addToGroup', lang), cmd(`group add ${groupQuery(lang)}`))
      );
    }
    parts.push(`<div>${buttons.join('')}</div>`);
    parts.push(note(t('menu.duplicateHint', lang)));
  }
  const groups = listGroups();
  if (groups.length) {
    parts.push(buildSectionLabel(t('menu.groups', lang)));
    parts.push(
      `<div>${groups.map((g) => buildSecondaryButton(`${truncate(g.name, 20)} (${g.pages.length})`, cmd(`group show ${g.id}`))).join('')}</div>`
    );
  }
  parts.push(buildDivider());
  parts.push(
    `<div>${buildSecondaryButton(t('buttons.settings', lang), cmd('settings'))}${buildSecondaryButton(t('buttons.recycle', lang), cmd('recycle'))}${buildSecondaryButton(t('buttons.undo', lang), cmd('undo'))}${buildSecondaryButton(t('buttons.help', lang), cmd('help'))}</div>`
  );
  whisper(ctx.playerId, `${SCRIPT_NAME} ${SCRIPT_VERSION}`, parts);
}

/**
 * Whispers a group's card.
 *
 * @param {object} ctx Command context.
 * @param {object} group Group.
 * @returns {void}
 */
export function showGroup(ctx, group) {
  const lang = getLang();
  const byPage = playersByPage(group);
  const parts = [];
  if (group.paused) {
    parts.push(pill(t('menu.paused', lang), COLOR_HIDDEN));
  }
  parts.push(buildSectionLabel(t('group.pages', lang)));
  for (const p of group.pages) {
    const isSource = p === group.source;
    const label = `${truncate(pageName(p), 24)}${isSource ? ` ★` : ''}`;
    const players = byPage[p]?.length || 0;
    const buttons = [];
    if (!isSource) {
      buttons.push(
        buildSecondaryButton(
          t('buttons.makeSource', lang),
          cmd(`group source ${group.id} --page ${p}`)
        )
      );
    }
    buttons.push(
      buildSecondaryButton(t('buttons.removePage', lang), cmd(`group remove --page ${p}`))
    );
    parts.push(
      buildRow(`${label} · ${t('group.playersCount', lang, { count: players })}`, buttons.join(''))
    );
  }
  parts.push(note(t('group.sourceHint', lang)));
  parts.push(buildSectionLabel(t('group.summary', lang)));
  const hiddenCount = Object.values(group.hidden).reduce(
    (n, byPage2) => n + Object.keys(byPage2).length,
    0
  );
  parts.push(buildRow(t('group.links', lang), String(Object.keys(group.links).length)));
  parts.push(buildRow(t('group.hidden', lang), String(hiddenCount)));
  parts.push(buildRow(t('group.recycle', lang), String(group.recycle.length)));
  const overrides = Object.keys(group.overrides);
  parts.push(
    buildRow(
      t('group.overrides', lang),
      overrides.length ? escapeHtml(overrides.join(', ')) : escapeHtml(t('group.none', lang))
    )
  );
  if (group.repairLog) {
    const log = group.repairLog;
    parts.push(
      note(
        t('group.lastRepair', lang, {
          when: formatAge(log.at, lang),
          drifted: log.drifted,
          recreated: log.recreated,
        })
      )
    );
  }
  parts.push(buildDivider());
  parts.push(
    `<div>${buildButton(t('buttons.players', lang), cmd(`players ${group.id}`))}${buildButton(t('buttons.repair', lang), cmd(`repair ${group.id}`))}${buildSecondaryButton(t('buttons.dryRun', lang), cmd(`repair ${group.id} --dry-run`))}${buildSecondaryButton(group.paused ? t('buttons.resume', lang) : t('buttons.pause', lang), cmd(`${group.paused ? 'resume' : 'pause'} ${group.id}`))}</div>`
  );
  parts.push(
    `<div>${buildSecondaryButton(t('buttons.groupSettings', lang), cmd(`settings group ${group.id}`))}${buildSecondaryButton(t('buttons.recycle', lang), cmd(`recycle ${group.id}`))}${buildSecondaryButton(t('buttons.rename', lang), cmd(`group rename ${group.id} ?{${queryText(t('queries.groupName', lang))}|${queryText(group.name)}}`))}${buildSecondaryButton(t('buttons.deleteGroup', lang), cmd(`group delete ${group.id} ?{${queryText(t('queries.deleteGroup', lang, { name: group.name }))}|${t('queries.no', lang)},no|${t('queries.yes', lang)},yes}`))}${buildSecondaryButton(t('buttons.menu', lang), cmd('menu'))}</div>`
  );
  whisper(ctx.playerId, t('titles.group', lang, { name: group.name }), parts);
}

/**
 * Formats how long ago a time was.
 *
 * @param {number} at Time in ms.
 * @param {string} lang Locale.
 * @returns {string} Text such as "5 minutes ago".
 */
export function formatAge(at, lang) {
  const mins = Math.max(0, Math.round((Date.now() - at) / 60000));
  if (mins < 1) {
    return t('age.now', lang);
  }
  if (mins < 60) {
    return t('age.minutes', lang, { count: mins });
  }
  const hours = Math.round(mins / 60);
  if (hours < 48) {
    return t('age.hours', lang, { count: hours });
  }
  return t('age.days', lang, { count: Math.round(hours / 24) });
}

/**
 * Whispers the players card: who is where, buttons to move them, and a
 * show/hide grid for the selected objects.
 *
 * @param {object} ctx Command context.
 * @param {object} group Group.
 * @returns {void}
 */
export function showPlayers(ctx, group) {
  const lang = getLang();
  const parts = [];
  const players = listPlayers();
  if (!players.length) {
    parts.push(note(t('players.none', lang)));
  }
  for (const player of players) {
    const here = pageOfPlayer(player.id);
    const name = truncate(player.get('displayname') || player.id, 22);
    const where = group.pages.includes(here)
      ? truncate(pageName(here), 18)
      : t('players.elsewhere', lang);
    const buttons = group.pages.map((p) =>
      p === here
        ? `<span style="color:${COLOR_ACCENT};margin:1px 3px">● ${escapeHtml(truncate(pageName(p), 14))}</span>`
        : buildSecondaryButton(
            truncate(pageName(p), 14),
            cmd(`move ${player.id} ${p} --group ${group.id}`)
          )
    );
    parts.push(
      `<div style="margin:3px 0"><strong>${escapeHtml(name)}</strong> <span style="color:${COLOR_MUTED}">(${escapeHtml(where)})</span><br>${buttons.join('')}</div>`
    );
  }
  parts.push(buildDivider());
  parts.push(
    `<div>${buildButton(t('buttons.everyoneTo', lang, { page: truncate(pageName(group.source), 14) }), cmd(`move all ${group.source} --group ${group.id}`))}${buildSecondaryButton(t('buttons.saveLayout', lang), cmd(`layout save ${group.id}`))}${buildSecondaryButton(t('buttons.restoreLayout', lang), cmd(`layout restore ${group.id}`))}</div>`
  );
  if (Object.keys(group.layout).length) {
    parts.push(note(t('players.layoutSaved', lang, { count: Object.keys(group.layout).length })));
  }
  const linked = (ctx.objects || [])
    .map((o) => ({ obj: o, found: linkOf(o.id) }))
    .filter((x) => x.found && x.found.group.id === group.id);
  if (linked.length) {
    parts.push(buildSectionLabel(t('players.visibility', lang)));
    for (const { obj, found } of linked.slice(0, 12)) {
      const label = truncate(
        obj.get('name') || obj.get('text') || t(`types.${obj.get('_type')}`, lang),
        20
      );
      const cells = group.pages.map((p) => {
        const hidden = !!hiddenOn(group, found.linkId, p);
        const text = `${truncate(pageName(p), 12)}: ${hidden ? t('players.hidden', lang) : t('players.shown', lang)}`;
        return `<a href="${escapeHtml(cmd(`${hidden ? 'show' : 'hide'} page=${p} --ids ${obj.id} --back players`))}" style="background:${hidden ? COLOR_HIDDEN : COLOR_SHOWN};color:#151027;padding:2px 6px;border-radius:3px;text-decoration:none;font-size:0.85em;display:inline-block;margin:1px 2px">${escapeHtml(text)}</a>`;
      });
      parts.push(`<div style="margin:3px 0">${escapeHtml(label)}<br>${cells.join('')}</div>`);
    }
  } else {
    parts.push(note(t('players.selectHint', lang)));
  }
  parts.push(
    `<div>${buildSecondaryButton(t('buttons.group', lang), cmd(`group show ${group.id}`))}${buildSecondaryButton(t('buttons.menu', lang), cmd('menu'))}</div>`
  );
  whisper(ctx.playerId, t('titles.players', lang, { name: group.name }), parts);
}

/**
 * Shows a setting's value as text.
 *
 * @param {object} def Setting definition.
 * @param {*} value Value.
 * @param {string} lang Locale.
 * @returns {string} Text.
 */
function valueText(def, value, lang) {
  if (def.type === 'boolean') {
    return value ? t('values.on', lang) : t('values.off', lang);
  }
  if (def.type === 'multi') {
    return value.length
      ? value.map((v) => t(`options.${def.key}.${v}`, lang)).join(', ')
      : t('values.none', lang);
  }
  if (def.type === 'choice') {
    return t(`options.${def.key}.${value}`, lang);
  }
  return String(value);
}

/**
 * Whispers the settings card, global or for one group.
 *
 * @param {object} ctx Command context.
 * @param {object|null} group Group, for its overrides.
 * @returns {void}
 */
export function showSettings(ctx, group) {
  const lang = getLang();
  const scope = group ? `group ${group.id} ` : '';
  const parts = [];
  if (group) {
    parts.push(note(t('settings.groupHint', lang)));
  }
  for (const def of SETTINGS) {
    if (group && def.scope !== 'group') {
      continue;
    }
    const value = getSetting(def.key, group);
    const label = t(`settings.${def.key}`, lang);
    let control;
    if (def.type === 'boolean') {
      control = buildButton(
        valueText(def, value, lang),
        cmd(`set ${scope}${def.key} ${value ? 'off' : 'on'}`)
      );
    } else if (def.type === 'choice') {
      const opts = def.options
        .map((o) => `${queryText(t(`options.${def.key}.${o}`, lang))},${o}`)
        .join('|');
      control = buildButton(
        valueText(def, value, lang),
        cmd(`set ${scope}${def.key} ?{${queryText(label)}|${opts}}`)
      );
    } else if (def.type === 'number') {
      control = buildButton(
        String(value),
        cmd(`set ${scope}${def.key} ?{${queryText(label)}|${value}}`)
      );
    } else if (def.type === 'locale') {
      const opts = LOCALE_DEFINITIONS.map(
        (l) => `${queryText(l.nativeName || l.name)},${l.code}`
      ).join('|');
      control = buildButton(value, cmd(`set ${def.key} ?{${queryText(label)}|${opts}}`));
    } else {
      control = def.options
        .map((o) => {
          const on = value.includes(o);
          const text = `${on ? '✓ ' : ''}${t(`options.${def.key}.${o}`, lang)}`;
          return on
            ? buildButton(text, cmd(`set ${scope}${def.key} -${o}`))
            : buildSecondaryButton(text, cmd(`set ${scope}${def.key} +${o}`));
        })
        .join('');
    }
    const overridden = group && def.key in group.overrides;
    const clear = overridden
      ? buildSecondaryButton(t('buttons.useGlobal', lang), cmd(`set ${scope}${def.key} default`))
      : '';
    const tag = group
      ? ` <span style="color:${COLOR_MUTED};font-size:0.8em">${escapeHtml(overridden ? t('settings.override', lang) : t('settings.global', lang))}</span>`
      : '';
    if (def.type === 'multi') {
      parts.push(
        `<div style="margin:4px 0"><span style="color:${COLOR_MUTED};font-size:0.9em">${escapeHtml(label)}</span>${tag}<br>${control}${clear}</div>`
      );
    } else {
      parts.push(buildRow(label, `${control}${clear}${tag}`));
    }
    parts.push(note(t(`settingsHelp.${def.key}`, lang)));
  }
  parts.push(buildDivider());
  const reset = cmd(
    `settings reset ${scope}?{${queryText(t('queries.resetSettings', lang))}|${t('queries.no', lang)},no|${t('queries.yes', lang)},yes}`
  );
  parts.push(
    `<div>${buildSecondaryButton(t('buttons.reset', lang), reset)}${group ? buildSecondaryButton(t('buttons.group', lang), cmd(`group show ${group.id}`)) : ''}${buildSecondaryButton(t('buttons.menu', lang), cmd('menu'))}</div>`
  );
  whisper(
    ctx.playerId,
    group ? t('titles.groupSettings', lang, { name: group.name }) : t('titles.settings', lang),
    parts
  );
}

/**
 * Whispers the status of objects: links, pages and hidden copies.
 *
 * @param {object} ctx Command context.
 * @returns {void}
 */
export function showStatus(ctx) {
  const lang = getLang();
  const parts = [];
  for (const obj of (ctx.objects || []).slice(0, 12)) {
    const label = truncate(
      obj.get('name') || obj.get('text') || t(`types.${obj.get('_type')}`, lang),
      24
    );
    const found = linkOf(obj.id);
    if (!found) {
      const group = groupOfPage(obj.get('_pageid'));
      const why = group?.pageOnly.includes(obj.id)
        ? t('status.pageOnly', lang)
        : t('status.notLinked', lang);
      parts.push(`<div><strong>${escapeHtml(label)}</strong>: ${escapeHtml(why)}</div>`);
      continue;
    }
    const { group, linkId, link } = found;
    const pages = group.pages.map((p) => {
      const h = hiddenOn(group, linkId, p);
      const has = !!link.objects[p] || !!h?.snapshot;
      const state2 = !has
        ? t('status.missing', lang)
        : h
          ? t('players.hidden', lang)
          : t('players.shown', lang);
      const colour = !has ? COLOR_MUTED : h ? COLOR_HIDDEN : COLOR_SHOWN;
      return `${escapeHtml(truncate(pageName(p), 14))}: ${pill(state2, colour)}`;
    });
    parts.push(
      `<div><strong>${escapeHtml(label)}</strong> · ${escapeHtml(group.name)}<br>${pages.join(' · ')}</div>`
    );
  }
  if (!parts.length) {
    parts.push(note(t('errors.nothingSelected', lang)));
  }
  whisper(ctx.playerId, t('titles.status', lang), parts);
}

/**
 * Whispers a group's recycle bin.
 *
 * @param {object} ctx Command context.
 * @param {object} group Group.
 * @returns {void}
 */
export function showRecycle(ctx, group) {
  const lang = getLang();
  const parts = [];
  if (!group.recycle.length) {
    parts.push(note(t('recycle.empty', lang)));
  }
  group.recycle.slice(0, 15).forEach((entry, n) => {
    const names = entry.items
      .map((i) => i.props?.name || i.props?.text || t(`types.${i.type}`, lang))
      .filter(Boolean);
    const what = truncate([...new Set(names)].join(', '), 40);
    parts.push(
      buildRow(
        `${n + 1}. ${t(`recycle.reasons.${entry.reason}`, lang)} · ${formatAge(entry.at, lang)} · ${what}`,
        buildSecondaryButton(
          t('buttons.restore', lang),
          cmd(`recycle ${group.id} restore ${n + 1}`)
        )
      )
    );
  });
  if (group.recycle.length) {
    parts.push(buildDivider());
    parts.push(
      `<div>${buildButton(t('buttons.undo', lang), cmd(`undo ${group.id}`))}${buildSecondaryButton(t('buttons.emptyRecycle', lang), cmd(`recycle ${group.id} empty ?{${queryText(t('queries.emptyRecycle', lang))}|${t('queries.no', lang)},no|${t('queries.yes', lang)},yes}`))}</div>`
    );
  }
  whisper(ctx.playerId, t('titles.recycle', lang, { name: group.name }), parts);
}

/**
 * Whispers a repair report.
 *
 * @param {object} ctx Command context.
 * @param {object} group Group.
 * @param {object} counts Repair counts.
 * @param {boolean} dryRun True for a dry run.
 * @returns {void}
 */
export function showRepair(ctx, group, counts, dryRun) {
  const lang = getLang();
  const rows = [
    'drifted',
    'recreated',
    'removed',
    'dropped',
    'mirrored',
    'leftovers',
    'pageSettings',
  ].map((k) => buildRow(t(`repair.${k}`, lang), String(counts[k])));
  const parts = [note(dryRun ? t('repair.dryRunNote', lang) : t('repair.doneNote', lang)), ...rows];
  if (dryRun) {
    parts.push(
      `<div>${buildButton(t('buttons.repairNow', lang), cmd(`repair ${group.id} yes`))}</div>`
    );
  }
  whisper(
    ctx.playerId,
    dryRun
      ? t('titles.dryRun', lang, { name: group.name })
      : t('titles.repaired', lang, { name: group.name }),
    parts
  );
}

/**
 * Whispers the short in-chat help.
 *
 * @param {object} ctx Command context.
 * @returns {void}
 */
export function showHelp(ctx) {
  const lang = getLang();
  const rows = COMMAND_LIST.map(
    ([c, key]) =>
      `<div><code>${escapeHtml(cmd(c))}</code><br><span style="color:${COLOR_MUTED};font-size:0.85em">${escapeHtml(t(`help.${key}`, lang))}</span></div>`
  );
  rows.push(note(t('help.footer', lang, { help: HANDOUT_HELP_NAME, deck: HANDOUT_DECK_NAME })));
  whisper(ctx.playerId, t('titles.help', lang), rows);
}

/**
 * Whispers a player (not a GM) the page they are on.
 *
 * @param {object} ctx Command context.
 * @returns {void}
 */
export function showWhere(ctx) {
  const lang = getLang();
  const here = pageOfPlayer(ctx.playerId);
  whisper(
    ctx.playerId,
    SCRIPT_NAME,
    `<div>${escapeHtml(t('players.youAreOn', lang, { page: pageName(here) }))}</div>`
  );
}
