// SyncPage: start-up, event wiring and the public SyncPage object.

import { whisper } from './chat.js';
import { handleChat } from './commands.js';
import { SCRIPT_LAST_UPDATED, SCRIPT_NAME, SCRIPT_VERSION, SYNC_TYPES } from './constants.js';
import {
  findAny,
  findGroup,
  groupOfPage,
  linkOf,
  listGroups,
  prune,
  rebuildIndex,
} from './groups.js';
import { t } from './i18n.js';
import { installHandouts } from './journals.js';
import { migrateLegacy } from './migrate.js';
import { repairGroup, repairTotal } from './repair.js';
import { applyGlobalConfig, getLang, getSetting, initialiseState } from './state.js';
import {
  handleAdd,
  handleChange,
  handleDestroy,
  handlePageChange,
  handlePageDestroy,
  notify,
  onSync,
} from './sync.js';
import { escapeHtml } from './utils.js';
import { hiddenOn } from './visibility.js';

let started = false;
// How long after start the repair waits, so Roll20 has loaded every page.
const START_REPAIR_DELAY_MS = 2000;

/**
 * Wraps an event handler so one failure is logged instead of stopping the sandbox.
 *
 * @param {string} label Where the failure happened.
 * @param {Function} fn Handler.
 * @returns {Function} Wrapped handler.
 */
function guarded(label, fn) {
  return (...args) => {
    try {
      fn(...args);
    } catch (e) {
      log(`SyncPage: ${label} failed: ${e?.stack || e}`);
    }
  };
}

/**
 * Repairs every group on start, as the repairOnStart setting says.
 *
 * @returns {void}
 */
function repairOnStart() {
  const mode = getSetting('repairOnStart');
  if (mode === 'off') {
    return;
  }
  const lang = getLang();
  const lines = [];
  for (const group of listGroups()) {
    if (group.paused) {
      continue;
    }
    const counts = repairGroup(group);
    if (repairTotal(counts) > 0) {
      lines.push(
        `<div>${escapeHtml(t('messages.startRepair', lang, { name: group.name, drifted: counts.drifted, recreated: counts.recreated, removed: counts.removed + counts.dropped, mirrored: counts.mirrored }))}</div>`
      );
    }
  }
  if (mode === 'report' && lines.length) {
    whisper(null, t('titles.repairedOnStart', lang), lines);
  }
}

/**
 * Starts SyncPage once Roll20 is ready.
 *
 * @returns {void}
 */
function start() {
  if (started) {
    return;
  }
  started = true;
  const { fresh } = initialiseState();
  applyGlobalConfig();
  rebuildIndex();
  const migrated = migrateLegacy();
  prune();
  const lang = getLang();

  on('chat:message', guarded('chat:message', handleChat));
  for (const type of SYNC_TYPES) {
    on(`add:${type}`, guarded(`add:${type}`, handleAdd));
    on(`change:${type}`, guarded(`change:${type}`, handleChange));
    on(`destroy:${type}`, guarded(`destroy:${type}`, handleDestroy));
  }
  on('change:page', guarded('change:page', handlePageChange));
  on('destroy:page', guarded('destroy:page', handlePageDestroy));
  if (typeof TokenMod !== 'undefined' && typeof TokenMod.ObserveTokenChange === 'function') {
    TokenMod.ObserveTokenChange(guarded('TokenMod', (obj, prev) => notify(obj, prev)));
  }
  installHandouts();
  setTimeout(guarded('repair on start', repairOnStart), START_REPAIR_DELAY_MS);

  log(`-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} [Updated: ${SCRIPT_LAST_UPDATED}] <=-`);
  if (fresh || migrated) {
    const lines = [t('messages.readyHint', lang)];
    if (migrated) {
      lines.push(
        t('messages.migrated', lang, {
          groups: migrated.groups,
          links: migrated.links,
          hidden: migrated.hidden,
        })
      );
      if (migrated.trueCopy) {
        lines.push(t('messages.trueCopyGone', lang));
      }
    }
    whisper(
      null,
      t('titles.ready', lang),
      lines.map((l) => `<div>${escapeHtml(l)}</div>`).join('')
    );
  }
}

on('ready', start);

/**
 * Describes a group for other Mods.
 *
 * @param {object|null} group Group.
 * @returns {object|null} Summary.
 */
function describe(group) {
  return group
    ? {
        id: group.id,
        name: group.name,
        source: group.source,
        pages: [...group.pages],
        paused: group.paused,
      }
    : null;
}

/**
 * The public SyncPage object. 0.1.x's PascalCase functions are kept as
 * harmless no-ops for Mods that call them.
 */
const api = {
  version: SCRIPT_VERSION,
  getGroup: (pageId) => describe(groupOfPage(pageId) || findGroup(pageId)),
  getLinked: (obj) => {
    const id = typeof obj === 'string' ? obj : obj?.id;
    const found = id ? linkOf(id) : null;
    return found ? { ...found.link.objects } : null;
  },
  notify: (obj, prev) => notify(typeof obj === 'string' ? findAny(obj) : obj, prev),
  isHidden: (obj, pageId) => {
    const id = typeof obj === 'string' ? obj : obj?.id;
    const found = id ? linkOf(id) : null;
    const page = pageId || (typeof obj === 'object' ? obj?.get('_pageid') : null);
    return !!(found && page && hiddenOn(found.group, found.linkId, page));
  },
  onSync,
  repair: (ref, options = {}) => {
    const group = findGroup(ref) || groupOfPage(ref);
    return group ? repairGroup(group, options) : null;
  },
  CheckInstall: () => {},
  RegisterEventHandlers: () => {},
  CheckSyncedPages: () => {},
};

globalThis.SyncPage = api;
