// The chat command parser.

import { whisper, whisperError } from './chat.js';
import { COMMAND, COMMAND_ALIASES, SWEEP_EVERY_MS } from './constants.js';
import {
  createGroup,
  deleteGroup,
  dropLink,
  findAny,
  findGroup,
  findPage,
  groupOfPage,
  linkOf,
  listGroups,
  markPageOnly,
  pageName,
  prune,
  removePage,
  setSource,
  unlinkPage,
} from './groups.js';
import { t } from './i18n.js';
import { installHandouts } from './journals.js';
import {
  showGroup,
  showHelp,
  showMenu,
  showPlayers,
  showRecycle,
  showRepair,
  showSettings,
  showStatus,
  showWhere,
} from './menu.js';
import { adoptPage, joinPage } from './pair.js';
import { gatherPlayers, movePlayer, restoreLayout, saveLayout } from './players.js';
import { restoreEntry } from './recycle.js';
import { repairGroup, repairTotal } from './repair.js';
import { sweepRequests, takeRequest } from './requests.js';
import {
  findSettingKey,
  getLang,
  getSetting,
  getState,
  gmMemory,
  resetSettings,
  setSetting,
} from './state.js';
import { mirrorNew, removeCopies } from './sync.js';
import { escapeHtml, splitList, splitWords, toText } from './utils.js';
import { hideCopy, showCopy } from './visibility.js';

let lastSweep = 0;
// Repairs that change more than this ask first.
const CONFIRM_REPAIR_OVER = 20;

/**
 * Returns the command words when a message is for SyncPage.
 *
 * @param {string} content Message text.
 * @returns {string[]|null} Words after the command, or null.
 */
export function parseCommand(content) {
  const words = splitWords(toText(content));
  const head = (words[0] || '').toLowerCase();
  const aliases = [...COMMAND_ALIASES, ...getState().aliases];
  return aliases.includes(head) ? words.slice(1) : null;
}

/**
 * Pulls `--flag value` options out of the words.
 *
 * @param {string[]} words Words.
 * @returns {{args: string[], flags: Record<string, string|true>}} Words left and flags.
 */
function takeFlags(words) {
  const args = [];
  const flags = {};
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (w.startsWith('--')) {
      const name = w.slice(2).toLowerCase();
      if (['ids', 'page', 'group', 'back'].includes(name) && i + 1 < words.length) {
        flags[name] = words[++i];
      } else {
        flags[name] = true;
      }
    } else {
      args.push(w);
    }
  }
  return { args, flags };
}

/**
 * Builds the context for a command: who sent it, the page it is about, and
 * the objects it acts on.
 *
 * @param {object} msg Chat message.
 * @param {Record<string, string|true>} flags Flags.
 * @returns {object} Context.
 */
function buildContext(msg, flags) {
  const playerId = msg.playerid;
  const objects = [];
  if (typeof flags.ids === 'string') {
    for (const id of splitList(flags.ids)) {
      const obj = findAny(id);
      if (obj) {
        objects.push(obj);
      }
    }
  } else {
    for (const sel of msg.selected || []) {
      const obj = findAny(sel._id, sel._type);
      if (obj) {
        objects.push(obj);
      }
    }
  }
  const player = getObj('player', playerId);
  const lastPage = player ? toText(player.get('_lastpage')) : '';
  const pageId =
    (typeof flags.page === 'string' && findPage(flags.page)) ||
    objects[0]?.get('_pageid') ||
    lastPage ||
    Campaign().get('playerpageid');
  return { playerId, objects, pageId, flags, lang: getLang() };
}

/**
 * Finds the group a command is about: named, else the page's group, else
 * the last one this GM used.
 *
 * @param {object} ctx Context.
 * @param {string} [ref] Group ID or name.
 * @returns {object|null} Group.
 */
function resolveGroup(ctx, ref) {
  const named = ref ? findGroup(ref) : null;
  if (named) {
    return named;
  }
  if (typeof ctx.flags.group === 'string') {
    return findGroup(ctx.flags.group);
  }
  if (ref) {
    return null;
  }
  return groupOfPage(ctx.pageId) || findGroup(gmMemory(ctx.playerId).lastGroup);
}

/**
 * Tells the GM something short.
 *
 * @param {object} ctx Context.
 * @param {string} key Message key.
 * @param {object} [vars] Values.
 * @returns {void}
 */
function say(ctx, key, vars) {
  whisper(ctx.playerId, 'SyncPage', `<div>${escapeHtml(t(key, ctx.lang, vars))}</div>`);
}

/**
 * Tells the GM about a mistake.
 *
 * @param {object} ctx Context.
 * @param {string} key Error key.
 * @param {object} [vars] Values.
 * @returns {void}
 */
function fail(ctx, key, vars) {
  whisperError(
    ctx.playerId,
    t(`errors.${key}`, ctx.lang, vars),
    t('errors.hint', ctx.lang, { command: COMMAND })
  );
}

/**
 * Handles `group …`.
 *
 * @param {object} ctx Context.
 * @param {string[]} args Words after `group`.
 * @returns {void}
 */
function groupCommand(ctx, args) {
  const sub = (args[0] || 'list').toLowerCase();
  const rest = args.slice(1);
  if (sub === 'list') {
    showMenu(ctx);
    return;
  }
  if (sub === 'create') {
    if (groupOfPage(ctx.pageId)) {
      fail(ctx, 'pageInGroup', { page: pageName(ctx.pageId), group: groupOfPage(ctx.pageId).name });
      return;
    }
    const name = rest.join(' ').trim() || pageName(ctx.pageId);
    if (findGroup(name)) {
      fail(ctx, 'groupExists', { name });
      return;
    }
    const group = createGroup(name, ctx.pageId);
    const n = adoptPage(group, ctx.pageId);
    gmMemory(ctx.playerId).lastGroup = group.id;
    say(ctx, 'messages.groupCreated', { name: group.name, count: n, page: pageName(ctx.pageId) });
    showGroup(ctx, group);
    return;
  }
  if (sub === 'add') {
    const group = findGroup(rest.join(' '));
    if (!group) {
      fail(ctx, 'noGroup', { name: rest.join(' ') });
      return;
    }
    const current = groupOfPage(ctx.pageId);
    if (current) {
      fail(ctx, 'pageInGroup', { page: pageName(ctx.pageId), group: current.name });
      return;
    }
    const r = joinPage(group, ctx.pageId, ctx.playerId);
    gmMemory(ctx.playerId).lastGroup = group.id;
    say(ctx, 'messages.pageAdded', {
      page: pageName(ctx.pageId),
      name: group.name,
      paired: r.paired,
      copied: r.copied,
      failed: r.failed,
      leftovers: r.leftovers,
    });
    showGroup(ctx, group);
    return;
  }
  const group = sub === 'remove' ? groupOfPage(ctx.pageId) : resolveGroup(ctx, rest[0]);
  if (!group) {
    fail(ctx, 'noGroup', { name: rest[0] || pageName(ctx.pageId) });
    return;
  }
  if (sub === 'show') {
    gmMemory(ctx.playerId).lastGroup = group.id;
    showGroup(ctx, group);
  } else if (sub === 'remove') {
    const name = group.name;
    const still = removePage(group, ctx.pageId);
    say(ctx, still ? 'messages.pageRemoved' : 'messages.groupDeleted', {
      page: pageName(ctx.pageId),
      name,
    });
    if (still) {
      showGroup(ctx, group);
    }
  } else if (sub === 'rename') {
    const name = rest.slice(1).join(' ').trim();
    if (!name) {
      fail(ctx, 'noName');
      return;
    }
    const clash = findGroup(name);
    if (clash && clash.id !== group.id) {
      fail(ctx, 'groupExists', { name });
      return;
    }
    group.name = name;
    showGroup(ctx, group);
  } else if (sub === 'source') {
    if (!group.pages.includes(ctx.pageId)) {
      fail(ctx, 'pageNotInGroup', { page: pageName(ctx.pageId), name: group.name });
      return;
    }
    setSource(group, ctx.pageId);
    showGroup(ctx, group);
  } else if (sub === 'delete') {
    if ((rest[1] || '').toLowerCase() !== 'yes') {
      say(ctx, 'messages.notConfirmed');
      return;
    }
    const name = group.name;
    deleteGroup(group);
    say(ctx, 'messages.groupDeleted', { name });
  } else {
    fail(ctx, 'unknownCommand', { command: `group ${sub}` });
  }
}

/**
 * Works out which of a group's pages `hide`/`show` acts on.
 *
 * @param {object} group Group.
 * @param {string} where `here`, `others`, `all` or `page=<ref,ref>`.
 * @param {string} pageId The object's page.
 * @returns {string[]} Page IDs.
 */
function targetPages(group, where, pageId) {
  const w = toText(where).toLowerCase() || 'here';
  if (w === 'others') {
    return group.pages.filter((p) => p !== pageId);
  }
  if (w === 'all') {
    return [...group.pages];
  }
  if (w.startsWith('page=')) {
    return splitList(where.slice(5))
      .map((ref) => findPage(ref, group))
      .filter(Boolean);
  }
  return [pageId];
}

/**
 * Handles `hide` and `show`.
 *
 * @param {object} ctx Context.
 * @param {boolean} hide True to hide.
 * @param {string} where Target.
 * @returns {void}
 */
function visibilityCommand(ctx, hide, where) {
  if (!ctx.objects.length) {
    fail(ctx, 'nothingSelected');
    return;
  }
  let done = 0;
  let fallback = 0;
  let skipped = 0;
  let lastGroup = null;
  for (const obj of ctx.objects) {
    const found = linkOf(obj.id);
    if (!found) {
      skipped += 1;
      continue;
    }
    lastGroup = found.group;
    for (const p of targetPages(found.group, where, obj.get('_pageid'))) {
      const r = hide
        ? hideCopy(found.group, found.linkId, p)
        : showCopy(found.group, found.linkId, p);
      if (r.ok) {
        done += 1;
        if (r.fallback) {
          fallback += 1;
        }
      }
    }
  }
  if (ctx.flags.back === 'players' && lastGroup) {
    showPlayers(ctx, lastGroup);
  } else {
    say(ctx, hide ? 'messages.hidden' : 'messages.shown', { count: done, skipped });
  }
  if (fallback) {
    say(ctx, 'messages.hideFallback', { count: fallback });
  }
}

/**
 * Handles `request <id> [answer]`: a button on an earlier card.
 *
 * @param {object} ctx Context.
 * @param {string[]} args Words.
 * @returns {void}
 */
function requestCommand(ctx, args) {
  const r = takeRequest(args[0]);
  if (!r.ok) {
    fail(ctx, r.reason === 'expired' ? 'requestExpired' : 'requestUnknown');
    return;
  }
  const answer = (args[1] || '').toLowerCase();
  const p = r.payload || {};
  const group = getState().groups[p.groupId];
  if (!group) {
    fail(ctx, 'noGroup', { name: p.groupId || '' });
    return;
  }
  if (r.kind === 'deleteAll') {
    if (answer === 'keep') {
      say(ctx, 'messages.keptOthers');
      return;
    }
    const n = removeCopies(group, p.linkId, null, 'delete');
    dropLink(group, p.linkId);
    // One entry for the whole delete, so the card's Undo puts everything back.
    const first = group.recycle.findIndex((e) => e.id === p.entry);
    if (n > 0 && first > 0) {
      group.recycle[first].items.push(...group.recycle[0].items);
      group.recycle.shift();
    }
    say(ctx, 'messages.deletedEverywhere', { count: n });
    return;
  }
  if (r.kind === 'restore') {
    const n = group.recycle.findIndex((e) => e.id === p.entry);
    if (n < 0) {
      fail(ctx, 'requestUnknown');
      return;
    }
    const res = restoreEntry(group, n);
    say(ctx, 'messages.restored', { count: res.restored, failed: res.failed });
    return;
  }
  if (r.kind === 'leftover' && Array.isArray(p.ids)) {
    let n = 0;
    for (const id of p.ids) {
      const obj = findAny(id);
      if (!obj || linkOf(id)) {
        continue;
      }
      if (answer === 'copy') {
        mirrorNew(group, obj);
      } else {
        markPageOnly(group, id);
      }
      n += 1;
    }
    say(ctx, answer === 'copy' ? 'messages.leftoversCopied' : 'messages.leftoversKept', {
      count: n,
    });
  }
}

/**
 * Handles `repair`.
 *
 * @param {object} ctx Context.
 * @param {string[]} args Words.
 * @returns {void}
 */
function repairCommand(ctx, args) {
  const dryRun = ctx.flags['dry-run'] === true || ctx.flags.dryrun === true;
  const yes = args.some((a) => a.toLowerCase() === 'yes');
  const refs = args.filter((a) => a.toLowerCase() !== 'yes');
  const groups =
    refs[0]?.toLowerCase() === 'all'
      ? listGroups()
      : [resolveGroup(ctx, refs.join(' ') || undefined)].filter(Boolean);
  if (!groups.length) {
    fail(ctx, 'noGroup', { name: refs.join(' ') || pageName(ctx.pageId) });
    return;
  }
  for (const group of groups) {
    if (dryRun) {
      showRepair(ctx, group, repairGroup(group, { dryRun: true }), true);
      continue;
    }
    if (!yes) {
      const preview = repairGroup(group, { dryRun: true });
      if (repairTotal(preview) > CONFIRM_REPAIR_OVER) {
        showRepair(ctx, group, preview, true);
        continue;
      }
    }
    showRepair(ctx, group, repairGroup(group, { gm: ctx.playerId }), false);
  }
}

/**
 * Handles `set`.
 *
 * @param {object} ctx Context.
 * @param {string[]} args Words.
 * @returns {void}
 */
function setCommand(ctx, args) {
  let group = null;
  let rest = args;
  if ((args[0] || '').toLowerCase() === 'group') {
    group = findGroup(args[1]);
    if (!group) {
      fail(ctx, 'noGroup', { name: args[1] || '' });
      return;
    }
    rest = args.slice(2);
  }
  const key = findSettingKey(rest[0]);
  if (!key) {
    fail(ctx, 'unknownSetting', { key: rest[0] || '' });
    return;
  }
  const value = rest.slice(1).join(' ');
  const result = setSetting(key, value, group);
  if (!result.ok) {
    fail(ctx, result.reason === 'globalOnly' ? 'globalOnly' : 'badValue', { key, value });
    return;
  }
  if (key === 'language') {
    installHandouts();
    ctx.lang = getLang();
  }
  showSettings(ctx, group);
}

/**
 * Handles a chat message.
 *
 * @param {object} msg Roll20 chat message.
 * @returns {void}
 */
export function handleChat(msg) {
  if (msg.type !== 'api') {
    return;
  }
  const words = parseCommand(msg.content);
  if (!words) {
    return;
  }
  if (Date.now() - lastSweep > SWEEP_EVERY_MS) {
    lastSweep = Date.now();
    sweepRequests();
  }
  const { args, flags } = takeFlags(words);
  const ctx = buildContext(msg, flags);
  const sub = (args[0] || 'menu').toLowerCase();
  const rest = args.slice(1);

  if (!playerIsGM(msg.playerid)) {
    if (['players', 'where', 'menu'].includes(sub) && getSetting('playerMenu') === 'players') {
      showWhere(ctx);
    } else {
      fail(ctx, 'gmOnly');
    }
    return;
  }

  switch (sub) {
    case 'menu':
      showMenu(ctx);
      break;
    case 'help':
      showHelp(ctx);
      break;
    case 'handouts':
    case 'journal':
      installHandouts();
      say(ctx, 'messages.handouts');
      break;
    case 'group':
      groupCommand(ctx, rest);
      break;
    case 'players': {
      const group = resolveGroup(ctx, rest.join(' ') || undefined);
      if (!group) {
        fail(ctx, 'noGroup', { name: rest.join(' ') || pageName(ctx.pageId) });
        break;
      }
      gmMemory(ctx.playerId).lastGroup = group.id;
      showPlayers(ctx, group);
      break;
    }
    case 'move': {
      const group = resolveGroup(ctx);
      if ((rest[0] || '').toLowerCase() === 'all') {
        const pageId = findPage(rest.slice(1).join(' '), group || undefined);
        if (!group || !pageId) {
          fail(ctx, 'noPage', { page: rest.slice(1).join(' ') });
          break;
        }
        const n = gatherPlayers(group, pageId);
        say(ctx, 'messages.movedAll', { count: n, page: pageName(pageId) });
        showPlayers(ctx, group);
        break;
      }
      const player =
        getObj('player', rest[0]) ||
        findObjs({ _type: 'player' }).find(
          (p) => toText(p.get('displayname')).toLowerCase() === toText(rest[0]).toLowerCase()
        );
      const pageId = findPage(rest.slice(1).join(' '), group || undefined);
      if (!player || !pageId) {
        fail(ctx, player ? 'noPage' : 'noPlayer', {
          page: rest.slice(1).join(' '),
          player: rest[0] || '',
        });
        break;
      }
      movePlayer(player.id, pageId);
      if (group) {
        showPlayers(ctx, group);
      } else {
        say(ctx, 'messages.moved', { player: player.get('displayname'), page: pageName(pageId) });
      }
      break;
    }
    case 'layout': {
      const action = (rest[0] || 'save').toLowerCase();
      const group = resolveGroup(ctx, rest.slice(1).join(' ') || undefined);
      if (!group) {
        fail(ctx, 'noGroup', { name: rest.slice(1).join(' ') });
        break;
      }
      if (action === 'restore') {
        say(ctx, 'messages.layoutRestored', { count: restoreLayout(group) });
      } else if (action === 'reset') {
        group.layout = {};
        say(ctx, 'messages.layoutReset');
      } else {
        say(ctx, 'messages.layoutSaved', { count: saveLayout(group) });
      }
      break;
    }
    case 'hide':
    case 'show':
      visibilityCommand(ctx, sub === 'hide', rest[0]);
      break;
    case 'status':
      showStatus(ctx);
      break;
    case 'unlink': {
      let n = 0;
      for (const obj of ctx.objects) {
        const found = linkOf(obj.id);
        if (found) {
          unlinkPage(found.group, found.linkId, obj.get('_pageid'));
          markPageOnly(found.group, obj.id);
          n += 1;
        }
      }
      say(ctx, 'messages.unlinked', { count: n });
      break;
    }
    case 'repair':
      repairCommand(ctx, rest);
      break;
    case 'pause':
    case 'resume': {
      const group = resolveGroup(
        ctx,
        rest.filter((w) => !['sync', 'keep'].includes(w.toLowerCase())).join(' ') || undefined
      );
      if (!group) {
        fail(ctx, 'noGroup', { name: rest.join(' ') });
        break;
      }
      group.paused = sub === 'pause';
      if (sub === 'resume') {
        const preview = repairGroup(group, { dryRun: true });
        say(ctx, 'messages.resumed', { name: group.name, count: repairTotal(preview) });
        if (repairTotal(preview) > 0) {
          showRepair(ctx, group, preview, true);
        }
      } else {
        say(ctx, 'messages.paused', { name: group.name });
      }
      break;
    }
    case 'undo': {
      const group = resolveGroup(ctx, rest.join(' ') || undefined);
      if (!group || !group.recycle.length) {
        say(ctx, 'messages.nothingToUndo');
        break;
      }
      const res = restoreEntry(group, 0);
      say(ctx, 'messages.restored', { count: res.restored, failed: res.failed });
      break;
    }
    case 'recycle': {
      const i = rest.findIndex((w) => ['restore', 'empty'].includes(w.toLowerCase()));
      const ref = (i >= 0 ? rest.slice(0, i) : rest).join(' ');
      const group = resolveGroup(ctx, ref || undefined);
      if (!group) {
        fail(ctx, 'noGroup', { name: ref });
        break;
      }
      const action = i >= 0 ? rest[i].toLowerCase() : '';
      if (action === 'restore') {
        const n = Math.max(1, Number(rest[i + 1]) || 1) - 1;
        const res = restoreEntry(group, n);
        say(ctx, res.ok ? 'messages.restored' : 'messages.nothingToUndo', {
          count: res.restored,
          failed: res.failed,
        });
      } else if (action === 'empty') {
        if ((rest[i + 1] || '').toLowerCase() === 'yes') {
          group.recycle = [];
          say(ctx, 'messages.recycleEmptied');
        } else {
          say(ctx, 'messages.notConfirmed');
        }
      }
      showRecycle(ctx, group);
      break;
    }
    case 'settings':
    case 'config': {
      const words2 = rest.map((w) => w.toLowerCase());
      if (sub === 'config' && rest[0]?.includes('|')) {
        // 0.1.x: config key|value
        const [k, v] = rest[0].split('|');
        if (k === 'command' && /^[a-z0-9_-]+$/i.test(v || '')) {
          getState().aliases.push(`!${v.toLowerCase()}`);
        }
      }
      if (words2[0] === 'reset') {
        const group = words2[1] === 'group' ? findGroup(rest[2]) : null;
        const confirmed = words2.includes('yes');
        if (confirmed) {
          resetSettings(group);
          say(ctx, 'messages.settingsReset');
        } else {
          say(ctx, 'messages.notConfirmed');
        }
        showSettings(ctx, group);
        break;
      }
      const group = words2[0] === 'group' ? findGroup(rest[1]) : null;
      if (words2[0] === 'group' && !group) {
        fail(ctx, 'noGroup', { name: rest[1] || '' });
        break;
      }
      showSettings(ctx, group);
      break;
    }
    case 'set':
      setCommand(ctx, rest);
      break;
    case 'reset':
      say(ctx, 'messages.resetMoved', { command: `${COMMAND} settings reset` });
      break;
    case 'request':
      requestCommand(ctx, rest);
      break;
    case 'prune': {
      const r = prune();
      say(ctx, 'messages.pruned', { links: r.links, pages: r.pages });
      break;
    }
    default:
      fail(ctx, 'unknownCommand', { command: sub });
  }
}
