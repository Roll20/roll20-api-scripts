import { handleInput, showMenu } from './commands.js';
import { SCRIPT_LAST_UPDATED, SCRIPT_NAME, SCRIPT_VERSION } from './constants.js';
import {
  ensureDashboard,
  flushDashboard,
  markDirty,
  noticeGm,
  onHandoutDestroyed,
  registerDashboardJobs,
} from './dashboard.js';
import { getRecord, getSnapshot } from './definitions.js';
import { admitRun, drainQueue, registerExecutorJobs } from './executor.js';
import { isJumpgate, logLine, onEvent } from './host.js';
import { t } from './i18n.js';
import {
  ADAPTER_CONTRACT,
  drainRegistrationQueue,
  getAdapter,
  registerAdapter,
  registerReferenceAdapter,
} from './integrations.js';
import { installHelpHandout } from './journals.js';
import {
  releaseAdmissions,
  recoverState,
  registerRecoveryJobs,
  startBoot,
  summaryWorthTelling,
} from './recovery.js';
import { createRuntimeScheduler, provide, runtime } from './runtime.js';
import {
  onRunTerminal,
  registerScheduleJobs,
  removeSchedule,
  syncDefinitionSchedules,
} from './schedules.js';
import { applyGlobalConfig, getConfig, getState, initialiseState } from './state.js';
import {
  awaitsChanged,
  definitionsChanged,
  emitInternal,
  noteOwnWrite,
  raiseSignal,
  registerNativeHandlers,
  registerTriggerJobs,
} from './triggers.js';
import { escapeHtml, formatDuration, isRecord, toText } from './utils.js';
import { whisper } from './chat.js';

/**
 * Wraps a handler so an exception is logged instead of stopping the sandbox.
 *
 * @param {string} label Handler name.
 * @param {Function} fn Handler.
 * @returns {Function} Wrapped handler.
 */
function guarded(label, fn) {
  return (...args) => {
    if (!runtime.ready || runtime.disabled) {
      return;
    }
    try {
      fn(...args);
    } catch (err) {
      logLine(`ERROR in ${label}: ${err?.message || err}`);
      if (err?.stack) {
        log(err.stack);
      }
    }
  };
}

/**
 * Connects services that call each other through runtime hooks.
 *
 * @returns {void}
 */
function wireHooks() {
  provide('dashboardDirty', () => markDirty());
  provide('emitEvent', (event) => emitInternal(event));
  provide('noteOwnWrite', (id, changes) => noteOwnWrite(id, changes));
  provide('awaitsChanged', () => awaitsChanged());
  provide('definitionChanged', (id) => {
    definitionsChanged();
    syncDefinitionSchedules(id);
    drainQueue(id);
  });
  provide('removeSchedule', (id, by) => removeSchedule(id, by));
  provide('runTerminal', (inst) => onRunTerminal(inst));
  provide('adapterKnown', (name) => Boolean(getAdapter(name)));
  provide('adapterStatus', (name, action, key) => {
    const fn = getAdapter(name)?.actions?.[action]?.status;
    return typeof fn === 'function' ? fn(key) : null;
  });
  provide('adapterRegistered', (name) => {
    if (!runtime.ready) {
      return;
    }
    const waiting = Object.values(getState().instances).filter(
      (i) => i.review?.reason === 'adapterUnavailable' && i.review?.vars?.adapter === name
    );
    if (waiting.length) {
      noticeGm(
        `adapter:${name}`,
        t('notices.adapterRegistered', getConfig().language, { name, count: waiting.length })
      );
    }
  });
  provide('notifyGm', (kind, vars) =>
    noticeGm(`${kind}:${vars.id || ''}`, t(`notices.${kind}`, getConfig().language, vars))
  );
}

/**
 * Publishes the API other Mods can call (plan §11). Registration is
 * idempotent; specs queued on globalThis.TaskAutomationQueue before this
 * Mod loaded are drained on ready.
 *
 * @returns {void}
 */
function publishApi() {
  globalThis.TaskAutomation = Object.freeze({
    version: SCRIPT_VERSION,
    contract: ADAPTER_CONTRACT,
    /**
     * Registers a trusted adapter (see docs/ADAPTERS.md).
     *
     * @param {object} spec Adapter spec.
     * @returns {{ok: boolean, error?: string}} Result.
     */
    registerAdapter(spec) {
      return registerAdapter(spec);
    },
    /**
     * Registers an action provided by an adapter: shorthand for an adapter
     * with one action.
     *
     * @param {string} adapter Adapter name.
     * @param {string} action Action name.
     * @param {object} impl {invoke, replay, timeoutMs, status}.
     * @returns {{ok: boolean, error?: string}} Result.
     */
    registerAction(adapter, action, impl) {
      const existing = getAdapter(adapter);
      return registerAdapter({
        name: adapter,
        contract: ADAPTER_CONTRACT,
        version: existing?.version || '1',
        authority: existing?.authority || 'gm',
        actions: { ...(existing?.actions || {}), [action]: impl },
      });
    },
    /**
     * Registers an adapter event name so tasks can await or trigger on it.
     * Events are raised with `emit`.
     *
     * @param {string} adapter Adapter name.
     * @param {string} event Event name.
     * @returns {boolean} True when the adapter exists.
     */
    registerTrigger(adapter, event) {
      const existing = getAdapter(adapter);
      if (!existing) {
        return false;
      }
      registerAdapter({ ...existing, events: [...new Set([...(existing.events || []), event])] });
      return true;
    },
    /**
     * Raises an adapter event (`integration` events in task triggers).
     *
     * @param {string} adapter Adapter name.
     * @param {string} event Event name.
     * @param {*} value Scalar value.
     * @returns {boolean} True when routed.
     */
    emit(adapter, event, value) {
      if (!runtime.ready || !getAdapter(adapter)) {
        return false;
      }
      emitInternal({
        type: 'integration',
        adapter,
        name: toText(event).slice(0, 48),
        value: isRecord(value) ? null : (value ?? null),
        source: 'adapter',
      });
      return true;
    },
    /**
     * Raises a named signal from a trusted Mod. Not a person: it never has
     * GM rights.
     *
     * @param {string} name Signal name.
     * @param {*} value Scalar value.
     * @returns {boolean} True when routed.
     */
    signal(name, value) {
      if (!runtime.ready || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,47}$/.test(toText(name))) {
        return false;
      }
      raiseSignal(name, isRecord(value) ? null : (value ?? null), null, 'adapter');
      return true;
    },
    /**
     * Starts a GM-service definition. Definitions acting for a person
     * cannot be started from other Mods.
     *
     * @param {string} definitionId Definition ID.
     * @param {object} [options] {params, bindings: {name: [ids]}}.
     * @returns {string|null} Run ID, or null.
     */
    start(definitionId, options = {}) {
      const def = runtime.ready ? getSnapshot(definitionId) : null;
      if (!def || def.access?.authority !== 'gmService' || !getRecord(definitionId)?.enabled) {
        return null;
      }
      const result = admitRun(definitionId, {
        initiatorId: null,
        params: isRecord(options.params) ? options.params : {},
        bindings: isRecord(options.bindings) ? options.bindings : {},
        trigger: { type: 'api', id: 'api' },
      });
      return result.instance?.id || null;
    },
  });
}

/**
 * Startup (plan §8): load state, hold admissions, recover, then listen.
 *
 * @returns {void}
 */
function checkInstall() {
  const loaded = initialiseState(Date.now());
  if (!['fresh', 'ok', 'migrated'].includes(loaded.status)) {
    // Fail closed: keep the stored data and run nothing.
    runtime.disabled = loaded;
    logLine(
      `ERROR: state not loaded (${loaded.status}${loaded.error ? `: ${loaded.error}` : ''}); no tasks will run.`
    );
    whisper(
      null,
      SCRIPT_NAME,
      `<div>${escapeHtml(t('notices.disabled', 'en-US', { status: loaded.status, version: loaded.from ?? '?' }))}</div>`
    );
    return;
  }
  applyGlobalConfig();
  wireHooks();
  createRuntimeScheduler();
  registerExecutorJobs();
  registerScheduleJobs();
  registerTriggerJobs();
  registerDashboardJobs();
  registerRecoveryJobs();
  registerReferenceAdapter();
  drainRegistrationQueue();
  publishApi();
  const boot = startBoot();
  runtime.ready = true;
  runtime.admissionsHeld = true;
  const summary = recoverState(boot);
  registerNativeHandlers(guarded);
  onEvent('destroy:handout', guarded('destroy:handout', onHandoutDestroyed));
  releaseAdmissions(summary);
  ensureDashboard();
  installHelpHandout();
  flushDashboard({ force: true });

  log(
    `-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} [Updated: ${SCRIPT_LAST_UPDATED}] (${isJumpgate() ? 'Jumpgate' : 'Legacy'}) <=-`
  );
  const lang = getConfig().language;
  const lines = [`<div><strong>${escapeHtml(t('titles.ready', lang))}</strong></div>`];
  if (loaded.status === 'migrated') {
    lines.push(`<div>${escapeHtml(t('messages.migrated', lang, { from: loaded.from }))}</div>`);
  }
  if (summaryWorthTelling(summary)) {
    lines.push(
      `<div style="margin-top:3px">${escapeHtml(
        t('messages.recoverySummary', lang, {
          runs: summary.runs,
          review: summary.review,
          missed: summary.missed,
          admitted: summary.admitted,
          gaps: summary.gaps,
          gap: summary.gapMs ? formatDuration(summary.gapMs) : '—',
        })
      )}</div>`
    );
  }
  lines.push(
    `<div style="font-size:0.85em;margin-top:3px">${escapeHtml(t('messages.readyHint', lang))}</div>`
  );
  whisper(null, `${SCRIPT_NAME} v${SCRIPT_VERSION}`, lines);
  if (loaded.status === 'fresh') {
    showMenu(null);
  }
}

/**
 * Registers the startup and command handlers. Object and campaign handlers
 * are registered after ready by the trigger router.
 *
 * @returns {void}
 */
function registerEventHandlers() {
  onEvent('ready', () => {
    try {
      checkInstall();
    } catch (err) {
      runtime.disabled = { status: 'fatal', error: String(err?.message || err) };
      logLine(`ERROR during startup: ${err?.message || err}`);
      if (err?.stack) {
        log(err.stack);
      }
    }
  });
  onEvent('chat:message', (msg) => {
    if (runtime.ready || runtime.disabled) {
      handleInput(msg);
    }
  });
}

registerEventHandlers();
