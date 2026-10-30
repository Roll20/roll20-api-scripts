// Command controller (plan §13): `!taskautomation <resource> <verb> [options]`.
// Authenticates the real sender, applies size and rate limits, parses an
// allowlisted grammar, checks revisions and confirmations, then calls the
// services. Replies are short private whispers; detail lives in the dashboard.

import { acknowledgeIncident, audit, openIncidents } from './audit.js';
import {
  buildButton,
  buildDivider,
  buildRow,
  buildSecondaryButton,
  buildSectionLabel,
  whisper,
  whisperError,
} from './chat.js';
import { STEP_SPECS } from './catalogue.js';
import {
  ACTIVE_STATUSES,
  COMMAND,
  DEFAULT_CONFIG,
  HANDOUT_EXPORT_NAME,
  HELP_COMMANDS,
  SCRIPT_NAME,
  SCRIPT_VERSION,
  STATUS,
} from './constants.js';
import {
  dashboardUrl,
  decisionsFor,
  ensureDashboard,
  flushDashboard,
  markDirty,
  repairDashboard,
  setView,
} from './dashboard.js';
import {
  archiveRecord,
  blankDefinition,
  blockList,
  cloneRecord,
  createRecord,
  dependencies,
  exportDefinition,
  findStepLocation,
  freeId,
  getRecord,
  getSnapshot,
  importDefinition,
  listRecords,
  publish,
  purgeRecord,
  setEnabled,
  updateDraft,
  validateBody,
} from './definitions.js';
import {
  admitRun,
  cancelRun,
  currentStep,
  decideReview,
  getInstance,
  listInstances,
  pauseRun,
  resolveParams,
  rerun,
  resumeRun,
} from './executor.js';
import { createObject, findObjects, isGm, logLine, now, playerName } from './host.js';
import { getLocale, t } from './i18n.js';
import { listAdapters } from './integrations.js';
import { resolveBindings, targetLabel } from './objects.js';
import {
  allowCommand,
  canManageRun,
  canStart,
  consumeConfirmation,
  issueConfirmation,
} from './permissions.js';
import { listFrom, normaliseSpec, parseClockTime, parseWeekdays } from './recurrence.js';
import { runtime } from './runtime.js';
import {
  addSchedule,
  applyOffset,
  applyRecovery,
  listSchedules,
  pauseSchedule,
  previewOffset,
  removeSchedule,
  resumeSchedule,
} from './schedules.js';
import { ID_PATTERN, describePath, durationValue } from './schema.js';
import { getConfig, getLimits, getState, setConfigValue, stateSize } from './state.js';
import { TEMPLATE_DEPENDENCIES, TEMPLATES, getTemplate } from './templates.js';
import { playerSignals, raiseSignal } from './triggers.js';
import {
  byteLength,
  clone,
  escapeHtml,
  formatDuration,
  formatUtc,
  formatUtcOffset,
  isRecord,
  parseIsoInstant,
  parseJsonSafe,
  parseStrictInt,
  parseUtcOffset,
  quoteArg,
  tokenize,
  truncate,
} from './utils.js';

/**
 * Returns the GM-facing language.
 *
 * @returns {string} Locale.
 */
function lang() {
  return getLocale(getState()?.config?.language);
}

/**
 * Builds a command string from words.
 *
 * @param {...string} words Words after the prefix.
 * @returns {string} Command.
 */
function cmd(...words) {
  return [COMMAND, ...words.map((w) => quoteArg(w))].join(' ');
}

/**
 * Whispers a translated error with an optional hint.
 *
 * @param {string} playerId Player.
 * @param {string} code Error key under `errors.`.
 * @param {object} [vars] Values.
 * @returns {void}
 */
function fail(playerId, code, vars = {}) {
  const hintKey = `hints.${code}`;
  const hint = t(hintKey, lang(), vars);
  whisperError(playerId, t(`errors.${code}`, lang(), vars), hint === hintKey ? undefined : hint);
}

/**
 * Whispers a short success line, with optional buttons.
 *
 * @param {string} playerId Player.
 * @param {string} text Text.
 * @param {string[]} [buttons] Button HTML.
 * @returns {void}
 */
function ok(playerId, text, buttons = []) {
  whisper(
    playerId,
    SCRIPT_NAME,
    `<div>${escapeHtml(text)}</div>${buttons.length ? `<div style="margin-top:3px">${buttons.join('')}</div>` : ''}`
  );
}

/**
 * Reports a service result: success text or the translated error.
 *
 * @param {string} playerId Player.
 * @param {{ok: boolean, error?: string, vars?: object}} result Result.
 * @param {string} successText Text on success.
 * @param {string[]} [buttons] Buttons on success.
 * @returns {boolean} result.ok.
 */
function report(playerId, result, successText, buttons) {
  if (!result.ok) {
    fail(playerId, result.error || result.reason || 'internal', result.vars || {});
    return false;
  }
  ok(playerId, successText, buttons);
  return true;
}

/**
 * Parses `--name value` options against an allowlist. Unknown options fail
 * with help rather than being ignored.
 *
 * @param {{text: string, quoted: boolean}[]} words Words.
 * @param {object} spec Option kinds: 'value' | 'flag' | 'multi'.
 * @returns {{opts?: object, positional?: string[], error?: string, vars?: object}} Parsed.
 */
export function parseOptions(words, spec) {
  const opts = {};
  const positional = [];
  for (let i = 0; i < words.length; i += 1) {
    const word = words[i];
    if (!word.quoted && word.text.startsWith('--')) {
      const name = word.text.slice(2);
      const kind = spec[name];
      if (!kind) {
        return { error: 'unknownOption', vars: { option: word.text } };
      }
      if (kind === 'flag') {
        opts[name] = true;
        continue;
      }
      const next = words[i + 1];
      if (!next || (!next.quoted && next.text.startsWith('--'))) {
        return { error: 'missingValue', vars: { option: word.text } };
      }
      i += 1;
      if (kind === 'multi') {
        (opts[name] = opts[name] || []).push(next.text);
      } else {
        opts[name] = next.text;
      }
    } else {
      positional.push(word.text);
    }
  }
  return { opts, positional };
}

/**
 * Parses an optional `--rev` value.
 *
 * @param {object} opts Options.
 * @returns {number|undefined|null} Revision, undefined when absent, null when invalid.
 */
function revOf(opts) {
  if (opts.rev === undefined) {
    return undefined;
  }
  const rev = parseStrictInt(opts.rev);
  return rev === null || rev < 1 ? null : rev;
}

/**
 * Parses repeated `name=value` options.
 *
 * @param {string[]|undefined} list Values.
 * @returns {object|null} Map, or null when malformed.
 */
function pairs(list) {
  const out = {};
  for (const item of list || []) {
    const at = item.indexOf('=');
    if (at < 1) {
      return null;
    }
    out[item.slice(0, at)] = item.slice(at + 1);
  }
  return out;
}

/**
 * Returns the selected object IDs from a command message.
 *
 * @param {object} msg Chat message.
 * @returns {string[]} IDs.
 */
function selectedIds(msg) {
  return (Array.isArray(msg.selected) ? msg.selected : [])
    .map((s) => s?._id)
    .filter((id) => typeof id === 'string');
}

// ---------------------------------------------------------------------------
// Entry
// ---------------------------------------------------------------------------

/**
 * Handles a chat message. Only exactly `!taskautomation` is accepted, so
 * `!taskautomationx` or `!task` never reach this Mod.
 *
 * @param {object} msg Roll20 chat message.
 * @returns {void}
 */
export function handleInput(msg) {
  if (msg.type !== 'api') {
    return;
  }
  const content = String(msg.content ?? '');
  const prefix = content.split(/\s/, 1)[0];
  if (prefix.toLowerCase() !== COMMAND) {
    return;
  }
  const playerId = msg.playerid;
  // API-origin messages are never a person, whatever name they show.
  if (!playerId || playerId === 'API') {
    return;
  }
  if (byteLength(content) > getLimits().payloadBytes) {
    fail(playerId, 'tooLarge', { max: getLimits().payloadBytes });
    return;
  }
  if (!allowCommand(playerId)) {
    fail(playerId, 'rateLimited');
    return;
  }
  if (runtime.disabled && isGm(playerId)) {
    fail(playerId, 'modDisabled', { reason: runtime.disabled.status });
    return;
  }
  const parsed = tokenize(content.slice(prefix.length));
  if (parsed.error) {
    fail(playerId, parsed.error);
    return;
  }
  try {
    route(msg, playerId, parsed.words, parsed.json);
    getState().boot.lastObservedAt = now();
  } catch (err) {
    logLine(`ERROR handling "${truncate(content, 200)}": ${err?.message || err}`);
    if (err?.stack) {
      log(err.stack);
    }
    fail(playerId, 'internal');
  }
}

const PLAYER_ROUTES = new Set(['help', 'instance', 'signal']);

/**
 * Routes a parsed command.
 *
 * @param {object} msg Message.
 * @param {string} playerId Real sender ID.
 * @param {{text: string, quoted: boolean}[]} words Words.
 * @param {string|null} json Raw `--json` payload.
 * @returns {void}
 */
function route(msg, playerId, words, json) {
  const gm = isGm(playerId);
  const resource = (words[0]?.text || '').toLowerCase();
  if (!gm && !PLAYER_ROUTES.has(resource)) {
    fail(playerId, 'gmOnly');
    return;
  }
  const rest = words.slice(1);
  switch (resource) {
    case '':
    case 'menu':
    case 'status':
      showMenu(playerId);
      return;
    case 'help':
      showHelp(playerId, gm);
      return;
    case 'dashboard':
      return commandDashboard(playerId, rest);
    case 'definition':
      return commandDefinition(msg, playerId, rest, json);
    case 'template':
      return commandTemplate(playerId, rest);
    case 'instance':
      return commandInstance(msg, playerId, rest, gm);
    case 'schedule':
      return commandSchedule(playerId, rest);
    case 'signal':
      return commandSignal(playerId, rest, gm);
    case 'report':
      return commandReport(playerId, rest);
    case 'recovery':
      return commandRecovery(playerId, rest);
    case 'config':
      return commandConfig(playerId, rest);
    case 'adapter':
      return commandAdapter(playerId);
    case 'stop-all':
      return commandStopAll(playerId, rest);
    case 'resume-all':
      return commandResumeAll(playerId);
    default:
      fail(playerId, 'unknownCommand', { command: resource });
  }
}

// ---------------------------------------------------------------------------
// Menu and help
// ---------------------------------------------------------------------------

/**
 * Shows the main menu.
 *
 * @param {string} playerId Player.
 * @returns {void}
 */
export function showMenu(playerId) {
  const l = lang();
  const s = getState();
  const active = listInstances((i) => ACTIVE_STATUSES.has(i.status));
  const status = runtime.disabled
    ? t('dashboard.statusDisabled', l)
    : s.halted
      ? t('dashboard.statusHalted', l)
      : t('dashboard.statusRunning', l);
  const url = dashboardUrl();
  const lines = [
    buildRow(t('menu.status', l), escapeHtml(status)),
    buildRow(t('menu.definitions', l), escapeHtml(String(listRecords().length))),
    buildRow(t('menu.active', l), escapeHtml(String(active.length))),
    buildRow(
      t('menu.review', l),
      escapeHtml(String(active.filter((i) => i.status === STATUS.REVIEW).length))
    ),
    buildRow(t('menu.incidents', l), escapeHtml(String(openIncidents().length))),
    buildDivider(),
    url
      ? `<a href="${escapeHtml(url)}" style="display:inline-block;margin:1px 2px">${escapeHtml(t('buttons.dashboard', l))}</a>`
      : '',
    buildButton(t('buttons.refresh', l), cmd('dashboard', 'open')),
    buildButton(t('buttons.definitions', l), cmd('definition', 'list')),
    buildButton(t('buttons.runs', l), cmd('instance', 'list')),
    buildButton(t('buttons.templates', l), cmd('template', 'list')),
    buildSecondaryButton(t('buttons.incidents', l), cmd('report', 'missed')),
    buildSecondaryButton(t('buttons.help', l), cmd('help')),
    buildSecondaryButton(
      s.halted ? t('dashboard.resumeAll', l) : t('dashboard.stopAll', l),
      s.halted ? cmd('resume-all') : cmd('stop-all', '--preview')
    ),
  ];
  whisper(playerId, `${SCRIPT_NAME} v${SCRIPT_VERSION}`, lines);
}

/**
 * Shows command help. Players see only the commands they may use.
 *
 * @param {string} playerId Player.
 * @param {boolean} gm Whether the caller is a GM.
 * @returns {void}
 */
function showHelp(playerId, gm) {
  const l = lang();
  const keys = gm
    ? HELP_COMMANDS
    : HELP_COMMANDS.filter(([, key]) =>
        ['help', 'instanceStart', 'instance', 'signal'].includes(key)
      );
  const rows = keys.map(
    ([text, key]) =>
      `<div style="margin:2px 0"><code>${escapeHtml(`${COMMAND} ${text}`.trim())}</code><br><span style="font-size:0.85em">${escapeHtml(t(`help.${key}`, l))}</span></div>`
  );
  whisper(playerId, t('titles.help', l), rows);
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

/**
 * `dashboard open|refresh|view|repair`.
 *
 * @param {string} playerId Player.
 * @param {object[]} words Words.
 * @returns {void}
 */
function commandDashboard(playerId, words) {
  const verb = (words[0]?.text || 'open').toLowerCase();
  const l = lang();
  switch (verb) {
    case 'open': {
      ensureDashboard();
      flushDashboard({ force: true });
      const url = dashboardUrl();
      whisper(
        playerId,
        SCRIPT_NAME,
        url
          ? `<a href="${escapeHtml(url)}">${escapeHtml(t('buttons.dashboard', l))}</a>`
          : escapeHtml(t('errors.dashboardMissing', l))
      );
      return;
    }
    case 'refresh':
      markDirty();
      ok(playerId, t('messages.dashboardRefresh', l));
      return;
    case 'view': {
      const page = words[2] ? parseStrictInt(words[2].text) : 1;
      if (!setView(words[1]?.text || '', page || 1)) {
        fail(playerId, 'badView', {
          views: 'overview, definitions, instances, queue, incidents, history, integrations',
        });
      }
      return;
    }
    case 'repair':
      report(
        playerId,
        { ok: repairDashboard(), error: 'dashboardMissing' },
        t('messages.dashboardRepaired', l)
      );
      return;
    default:
      fail(playerId, 'unknownCommand', { command: `dashboard ${verb}` });
  }
}

// ---------------------------------------------------------------------------
// Definitions
// ---------------------------------------------------------------------------

/**
 * Formats validation errors for chat.
 *
 * @param {object[]} errors Errors.
 * @returns {string} HTML.
 */
function formatErrors(errors) {
  const l = lang();
  return errors
    .slice(0, 15)
    .map(
      (e) =>
        `<div style="font-size:0.9em">• <strong>${escapeHtml(describePath(e.path))}</strong>: ${escapeHtml(t(`validation.${e.code}`, l, e.vars || {}))}</div>`
    )
    .join('');
}

/**
 * `definition …` commands.
 *
 * @param {object} msg Message.
 * @param {string} playerId GM.
 * @param {object[]} words Words.
 * @param {string|null} json JSON payload.
 * @returns {void}
 */
function commandDefinition(msg, playerId, words, json) {
  const verb = (words[0]?.text || 'list').toLowerCase();
  const sub = (words[1]?.text || '').toLowerCase();
  const nested = ['step', 'trigger', 'import'].includes(verb) && sub && !sub.startsWith('--');
  const parsed = parseOptions(words.slice(nested ? 2 : 1), {
    id: 'value',
    name: 'value',
    rev: 'value',
    'new-id': 'value',
    field: 'value',
    value: 'value',
    step: 'value',
    trigger: 'value',
    block: 'value',
    index: 'value',
    after: 'value',
    parts: 'value',
    n: 'value',
    preview: 'flag',
    confirm: 'value',
    replace: 'flag',
    draft: 'flag',
    handout: 'flag',
    archived: 'flag',
    remove: 'flag',
  });
  if (parsed.error) {
    fail(playerId, parsed.error, parsed.vars);
    return;
  }
  const { opts } = parsed;
  const l = lang();
  const rev = revOf(opts);
  if (rev === null) {
    fail(playerId, 'badRev');
    return;
  }
  const needId = () => {
    if (!opts.id || !getRecord(opts.id)) {
      fail(playerId, 'definitionNotFound', { id: opts.id || '' });
      return false;
    }
    return true;
  };
  switch (verb) {
    case 'list':
      return listDefinitions(playerId, Boolean(opts.archived));
    case 'show':
      if (needId()) {
        showDefinition(playerId, opts.id);
      }
      return;
    case 'create': {
      const name = String(opts.name || '').trim();
      if (!name || name.length > getLimits().nameLength) {
        fail(playerId, 'badName', { max: getLimits().nameLength });
        return;
      }
      const id = opts.id || freeId(name);
      const result = createRecord(blankDefinition(id, name), playerId);
      if (
        report(playerId, result, t('messages.definitionCreated', l, { id, name }), [
          buildButton(t('buttons.show', l), cmd('definition', 'show', '--id', id)),
        ])
      ) {
        markDirty();
      }
      return;
    }
    case 'validate': {
      if (!needId()) {
        return;
      }
      const record = getRecord(opts.id);
      const check = validateBody({ ...clone(record.draft || getSnapshot(opts.id)), id: opts.id });
      const warnings = check.warnings.length
        ? `<div style="margin-top:3px">${formatErrors(check.warnings)}</div>`
        : '';
      if (check.ok) {
        whisper(
          playerId,
          t('titles.validation', l),
          `<div>${escapeHtml(t('messages.valid', l, { id: opts.id }))}</div>${warnings}${buildButton(t('buttons.publish', l), cmd('definition', 'publish', '--id', opts.id, '--rev', String(record.rev)))}`
        );
      } else {
        whisper(
          playerId,
          t('titles.validation', l),
          `<div>${escapeHtml(t('messages.invalid', l, { id: opts.id, count: check.errors.length }))}</div>${formatErrors(check.errors)}${warnings}`
        );
      }
      return;
    }
    case 'publish': {
      if (!needId()) {
        return;
      }
      const result = publish(opts.id, playerId, rev);
      if (!result.ok && result.errors) {
        whisper(
          playerId,
          t('titles.validation', l),
          `<div>${escapeHtml(t('messages.invalid', l, { id: opts.id, count: result.errors.length }))}</div>${formatErrors(result.errors)}`
        );
        return;
      }
      report(
        playerId,
        result,
        t('messages.published', l, { id: opts.id, revision: result.revision }),
        [buildButton(t('buttons.start', l), cmd('instance', 'start', '--definition', opts.id))]
      );
      return;
    }
    case 'enable':
    case 'disable':
      if (needId()) {
        report(
          playerId,
          setEnabled(opts.id, verb === 'enable', playerId, { expectedRev: rev }),
          t(verb === 'enable' ? 'messages.enabled' : 'messages.disabled', l, { id: opts.id })
        );
      }
      return;
    case 'clone': {
      if (!needId()) {
        return;
      }
      const name = String(opts.name || `${getRecord(opts.id).name} (copy)`).slice(
        0,
        getLimits().nameLength
      );
      const result = cloneRecord(opts.id, name, playerId, opts['new-id']);
      report(
        playerId,
        result,
        t('messages.cloned', l, { id: result.record?.id || '', name }),
        result.record
          ? [buildButton(t('buttons.show', l), cmd('definition', 'show', '--id', result.record.id))]
          : []
      );
      return;
    }
    case 'archive':
      if (needId()) {
        report(
          playerId,
          archiveRecord(opts.id, playerId),
          t('messages.archived', l, { id: opts.id })
        );
      }
      return;
    case 'purge':
      return purgeCommand(playerId, opts);
    case 'export':
      if (needId()) {
        exportCommand(playerId, opts);
      }
      return;
    case 'import':
      return importCommand(playerId, nested ? sub : '', opts, json);
    case 'set':
      if (needId()) {
        setField(playerId, opts, rev);
      }
      return;
    case 'param':
    case 'binding':
      if (needId()) {
        editMapEntry(playerId, verb === 'param' ? 'parameters' : 'bindings', opts, json, rev);
      }
      return;
    case 'access':
    case 'policy':
      if (needId()) {
        editObject(playerId, verb, json, rev, opts.id);
      }
      return;
    case 'trigger':
      if (needId()) {
        editTrigger(playerId, sub, opts, json, rev);
      }
      return;
    case 'step':
      if (needId()) {
        editStep(playerId, sub, opts, json, rev);
      }
      return;
    default:
      fail(playerId, 'unknownCommand', { command: `definition ${verb}` });
  }
}

/**
 * Lists definitions.
 *
 * @param {string} playerId GM.
 * @param {boolean} archived Include archived.
 * @returns {void}
 */
function listDefinitions(playerId, archived) {
  const l = lang();
  const records = listRecords({ archived });
  if (!records.length) {
    whisper(
      playerId,
      t('titles.definitions', l),
      `<div>${escapeHtml(t('dashboard.noDefinitions', l))}</div>${buildButton(t('buttons.templates', l), cmd('template', 'list'))}`
    );
    return;
  }
  const rows = records.slice(0, 40).map((r) => {
    const state = r.enabled ? '✓' : '✗';
    return `<div style="margin:2px 0">${state} <strong>${escapeHtml(truncate(r.name, 40))}</strong> <span style="font-size:0.85em">${escapeHtml(r.id)} r${r.current || '—'}</span> ${buildSecondaryButton('⋯', cmd('definition', 'show', '--id', r.id))}${r.enabled ? buildButton(t('buttons.start', l), cmd('instance', 'start', '--definition', r.id)) : ''}</div>`;
  });
  whisper(playerId, t('titles.definitions', l), rows);
}

/**
 * Outlines steps for a definition card.
 *
 * @param {object[]} steps Steps.
 * @param {number} depth Indent.
 * @param {string[]} out Lines.
 * @returns {void}
 */
function outline(steps, depth, out) {
  for (const step of steps || []) {
    if (out.length >= 40) {
      return;
    }
    out.push(
      `<div style="margin-left:${depth * 12}px;font-size:0.88em">${escapeHtml(step.id)} <span style="opacity:0.7">${escapeHtml(step.type)}</span></div>`
    );
    outline(step.steps, depth + 1, out);
    if (step.then?.length) {
      out.push(
        `<div style="margin-left:${(depth + 1) * 12}px;font-size:0.8em;opacity:0.7">then</div>`
      );
      outline(step.then, depth + 2, out);
    }
    if (step.else?.length) {
      out.push(
        `<div style="margin-left:${(depth + 1) * 12}px;font-size:0.8em;opacity:0.7">else</div>`
      );
      outline(step.else, depth + 2, out);
    }
    for (const branch of step.branches || []) {
      out.push(
        `<div style="margin-left:${(depth + 1) * 12}px;font-size:0.8em;opacity:0.7">${escapeHtml(branch.id)}</div>`
      );
      outline(branch.steps, depth + 2, out);
    }
  }
}

/**
 * Shows a definition card with its controls.
 *
 * @param {string} playerId GM.
 * @param {string} id Definition ID.
 * @returns {void}
 */
function showDefinition(playerId, id) {
  const l = lang();
  const record = getRecord(id);
  const body = record.draft || getSnapshot(id);
  const rev = String(record.rev);
  const steps = [];
  outline(body.steps, 0, steps);
  const draftAhead = Boolean(record.draftDirty);
  const schedules = listSchedules(id).map(
    (sc) =>
      `${sc.id}: ${sc.paused ? t('statuses.paused', l) : sc.cursor.nextDueAt ? formatUtc(sc.cursor.nextDueAt) : '—'}`
  );
  const lines = [
    buildRow(t('labels.id', l), escapeHtml(id)),
    buildRow(
      t('labels.revision', l),
      escapeHtml(`${record.current || '—'}${draftAhead ? ` (${t('labels.draft', l)})` : ''}`)
    ),
    buildRow(
      t('labels.enabled', l),
      escapeHtml(
        record.enabled
          ? t('labels.yes', l)
          : t('dashboard.disabled', l, { reason: record.disabledReason || '—' })
      )
    ),
    buildRow(
      t('labels.triggers', l),
      escapeHtml(
        (body.triggers || [])
          .map((tr) => `${tr.id}:${tr.type === 'event' ? tr.event : tr.type}`)
          .join(', ') || '—'
      )
    ),
    schedules.length ? buildRow(t('labels.schedules', l), escapeHtml(schedules.join('; '))) : '',
    body.description
      ? `<div style="font-size:0.88em;margin:3px 0">${escapeHtml(truncate(body.description, 300))}</div>`
      : '',
    buildSectionLabel(t('labels.steps', l)),
    steps.join('') || `<div>${escapeHtml(t('labels.noSteps', l))}</div>`,
    buildDivider(),
    buildButton(t('buttons.validate', l), cmd('definition', 'validate', '--id', id)),
    draftAhead || !record.current
      ? buildButton(t('buttons.publish', l), cmd('definition', 'publish', '--id', id, '--rev', rev))
      : '',
    record.current
      ? buildButton(
          record.enabled ? t('buttons.disable', l) : t('buttons.enable', l),
          cmd('definition', record.enabled ? 'disable' : 'enable', '--id', id, '--rev', rev)
        )
      : '',
    record.enabled
      ? buildButton(t('buttons.start', l), cmd('instance', 'start', '--definition', id))
      : '',
    record.current
      ? buildSecondaryButton(t('buttons.dryRun', l), cmd('instance', 'dry-run', '--definition', id))
      : '',
    buildSecondaryButton(t('buttons.export', l), cmd('definition', 'export', '--id', id)),
    buildSecondaryButton(t('buttons.clone', l), cmd('definition', 'clone', '--id', id)),
    buildSecondaryButton(t('buttons.archive', l), cmd('definition', 'archive', '--id', id)),
    buildSecondaryButton(
      t('buttons.purge', l),
      cmd('definition', 'purge', '--id', id, '--preview')
    ),
  ];
  whisper(playerId, truncate(record.name, 60), lines);
}

/**
 * `definition purge --preview` / `--confirm <token>`.
 *
 * @param {string} playerId GM.
 * @param {object} opts Options.
 * @returns {void}
 */
function purgeCommand(playerId, opts) {
  const l = lang();
  if (opts.confirm) {
    const confirmation = consumeConfirmation(opts.confirm, playerId);
    if (!confirmation.ok || confirmation.op !== 'purge') {
      fail(playerId, confirmation.reason || 'confirmationUnknown');
      return;
    }
    const id = confirmation.payload.id;
    const record = getRecord(id);
    if (!record || record.rev !== confirmation.payload.rev) {
      fail(playerId, 'stale', { id, rev: record?.rev ?? '—' });
      return;
    }
    report(playerId, purgeRecord(id, playerId), t('messages.purged', l, { id }));
    return;
  }
  const record = opts.id ? getRecord(opts.id) : null;
  if (!record) {
    fail(playerId, 'definitionNotFound', { id: opts.id || '' });
    return;
  }
  const deps = dependencies(opts.id);
  if (deps.runs || deps.queued || deps.callers.length) {
    fail(playerId, 'purgeBlocked', {
      runs: deps.runs,
      queued: deps.queued,
      callers: deps.callers.join(', ') || '—',
    });
    return;
  }
  const token = issueConfirmation(playerId, 'purge', { id: opts.id, rev: record.rev });
  whisper(playerId, t('titles.confirm', l), [
    `<div>${escapeHtml(t('messages.purgePreview', l, { id: opts.id, schedules: deps.schedules }))}</div>`,
    buildButton(t('buttons.confirmPurge', l), cmd('definition', 'purge', '--confirm', token)),
  ]);
}

/**
 * `definition export`: escaped JSON in bounded chat pages, or a private handout.
 *
 * @param {string} playerId GM.
 * @param {object} opts Options.
 * @returns {void}
 */
function exportCommand(playerId, opts) {
  const l = lang();
  const body = exportDefinition(opts.id, { draft: Boolean(opts.draft) });
  const text = JSON.stringify(body);
  if (opts.handout) {
    const name = `${HANDOUT_EXPORT_NAME}: ${opts.id}`;
    const handout =
      findObjects({ _type: 'handout', name })[0] ||
      createObject('handout', { name, inplayerjournals: '', controlledby: '' });
    handout?.set('gmnotes', `<pre>${escapeHtml(text)}</pre>`);
    ok(playerId, t('messages.exportedHandout', l, { name }));
    return;
  }
  const size = 1500;
  const pages = Math.ceil(text.length / size);
  for (let i = 0; i < Math.min(pages, 20); i += 1) {
    whisper(
      playerId,
      t('titles.export', l, { page: i + 1, pages }),
      `<pre style="white-space:pre-wrap;font-size:0.8em">${escapeHtml(text.slice(i * size, (i + 1) * size))}</pre>`
    );
  }
  ok(playerId, t('messages.exportHint', l, { command: `${COMMAND} definition import --json` }));
}

/**
 * `definition import` (single message or begin/part/commit).
 *
 * @param {string} playerId GM.
 * @param {string} sub Sub-verb.
 * @param {object} opts Options.
 * @param {string|null} json JSON.
 * @returns {void}
 */
function importCommand(playerId, sub, opts, json) {
  const l = lang();
  const s = getState();
  const limits = getLimits();
  const finish = (text) => {
    const parsed = parseJsonSafe(text, limits.importBytes);
    if (!parsed.ok) {
      fail(playerId, parsed.error, { path: parsed.path || '', max: limits.importBytes });
      return;
    }
    const result = importDefinition(parsed.value, playerId, { replace: Boolean(opts.replace) });
    if (!result.ok && result.errors) {
      whisper(
        playerId,
        t('titles.validation', l),
        `<div>${escapeHtml(t('messages.invalid', l, { id: String(parsed.value?.id ?? '?'), count: result.errors.length }))}</div>${formatErrors(result.errors)}`
      );
      return;
    }
    report(
      playerId,
      result,
      t('messages.imported', l, { id: parsed.value.id, revision: result.revision }),
      [buildButton(t('buttons.show', l), cmd('definition', 'show', '--id', parsed.value.id))]
    );
  };
  switch (sub) {
    case '':
      if (!json) {
        fail(playerId, 'emptyJson');
        return;
      }
      finish(json);
      return;
    case 'begin': {
      const parts = parseStrictInt(opts.parts);
      if (!parts || parts < 1 || parts > 64) {
        fail(playerId, 'badParts');
        return;
      }
      s.imports[playerId] = { parts, received: [], expiresAt: now() + 10 * 60 * 1000 };
      ok(playerId, t('messages.importBegun', l, { parts }));
      return;
    }
    case 'part': {
      const pending = s.imports[playerId];
      const n = parseStrictInt(opts.n);
      if (!pending || pending.expiresAt < now()) {
        delete s.imports[playerId];
        fail(playerId, 'noImport');
        return;
      }
      if (n !== pending.received.length + 1 || n > pending.parts || !json) {
        fail(playerId, 'importOrder', { expected: pending.received.length + 1 });
        return;
      }
      const total = pending.received.reduce((sum, p) => sum + p.length, 0) + json.length;
      if (total > limits.importBytes) {
        delete s.imports[playerId];
        fail(playerId, 'tooLarge', { max: limits.importBytes });
        return;
      }
      pending.received.push(json);
      ok(playerId, t('messages.importPart', l, { n, parts: pending.parts }));
      return;
    }
    case 'commit': {
      const pending = s.imports[playerId];
      if (!pending || pending.expiresAt < now() || pending.received.length !== pending.parts) {
        fail(playerId, 'noImport');
        return;
      }
      delete s.imports[playerId];
      finish(pending.received.join(''));
      return;
    }
    case 'cancel':
      delete s.imports[playerId];
      ok(playerId, t('messages.importCancelled', l));
      return;
    default:
      fail(playerId, 'unknownCommand', { command: `definition import ${sub}` });
  }
}

/**
 * `definition set --field name|description --value …`.
 *
 * @param {string} playerId GM.
 * @param {object} opts Options.
 * @param {number|undefined} rev Revision guard.
 * @returns {void}
 */
function setField(playerId, opts, rev) {
  const l = lang();
  const field = opts.field;
  if (!['name', 'description'].includes(field) || typeof opts.value !== 'string') {
    fail(playerId, 'badField', { fields: 'name, description' });
    return;
  }
  const result = updateDraft(
    opts.id,
    (draft) => {
      draft[field] = opts.value.slice(
        0,
        field === 'name' ? getLimits().nameLength : getLimits().stringLength
      );
    },
    playerId,
    rev
  );
  report(playerId, result, t('messages.draftUpdated', l, { id: opts.id }), draftButtons(opts.id));
}

/**
 * Buttons after a draft edit.
 *
 * @param {string} id Definition ID.
 * @returns {string[]} Buttons.
 */
function draftButtons(id) {
  const l = lang();
  const record = getRecord(id);
  return [
    buildButton(t('buttons.validate', l), cmd('definition', 'validate', '--id', id)),
    buildButton(
      t('buttons.publish', l),
      cmd('definition', 'publish', '--id', id, '--rev', String(record?.rev ?? 1))
    ),
    buildSecondaryButton(t('buttons.show', l), cmd('definition', 'show', '--id', id)),
  ];
}

/**
 * Parses the JSON payload of an edit command.
 *
 * @param {string} playerId GM.
 * @param {string|null} json JSON.
 * @returns {*} Value, or undefined after reporting the error.
 */
function editJson(playerId, json) {
  const parsed = parseJsonSafe(json || '', getLimits().payloadBytes);
  if (!parsed.ok) {
    fail(playerId, parsed.error, { path: parsed.path || '', max: getLimits().payloadBytes });
    return undefined;
  }
  return parsed.value;
}

/**
 * `definition param|binding --id --name n --json {…}` or `--remove`.
 *
 * @param {string} playerId GM.
 * @param {string} key parameters or bindings.
 * @param {object} opts Options.
 * @param {string|null} json JSON.
 * @param {number|undefined} rev Revision guard.
 * @returns {void}
 */
function editMapEntry(playerId, key, opts, json, rev) {
  if (!opts.name || !ID_PATTERN.test(opts.name)) {
    fail(playerId, 'badId', { id: opts.name || '' });
    return;
  }
  const value = opts.remove ? null : editJson(playerId, json);
  if (value === undefined) {
    return;
  }
  const result = updateDraft(
    opts.id,
    (draft) => {
      draft[key] = isRecord(draft[key]) ? draft[key] : {};
      if (opts.remove) {
        delete draft[key][opts.name];
      } else {
        draft[key][opts.name] = value;
      }
    },
    playerId,
    rev
  );
  report(
    playerId,
    result,
    t('messages.draftUpdated', lang(), { id: opts.id }),
    draftButtons(opts.id)
  );
}

/**
 * `definition access|policy --id --json {…}` (replaces the object).
 *
 * @param {string} playerId GM.
 * @param {string} key access or policy.
 * @param {string|null} json JSON.
 * @param {number|undefined} rev Revision guard.
 * @param {string} id Definition ID.
 * @returns {void}
 */
function editObject(playerId, key, json, rev, id) {
  const value = editJson(playerId, json);
  if (value === undefined) {
    return;
  }
  if (!isRecord(value)) {
    fail(playerId, 'notObject');
    return;
  }
  const result = updateDraft(
    id,
    (draft) => {
      draft[key] = value;
    },
    playerId,
    rev
  );
  report(playerId, result, t('messages.draftUpdated', lang(), { id }), draftButtons(id));
}

/**
 * `definition trigger add|remove`.
 *
 * @param {string} playerId GM.
 * @param {string} sub add or remove.
 * @param {object} opts Options.
 * @param {string|null} json JSON.
 * @param {number|undefined} rev Revision guard.
 * @returns {void}
 */
function editTrigger(playerId, sub, opts, json, rev) {
  let result;
  if (sub === 'add') {
    const value = editJson(playerId, json);
    if (value === undefined) {
      return;
    }
    result = updateDraft(
      opts.id,
      (draft) => {
        draft.triggers = Array.isArray(draft.triggers) ? draft.triggers : [];
        if (draft.triggers.some((tr) => tr.id === value?.id)) {
          return { ok: false, error: 'duplicateTrigger', vars: { id: String(value?.id) } };
        }
        draft.triggers.push(value);
      },
      playerId,
      rev
    );
  } else if (sub === 'remove') {
    result = updateDraft(
      opts.id,
      (draft) => {
        const before = (draft.triggers || []).length;
        draft.triggers = (draft.triggers || []).filter((tr) => tr.id !== opts.trigger);
        if (draft.triggers.length === before) {
          return { ok: false, error: 'triggerNotFound', vars: { id: opts.trigger || '' } };
        }
      },
      playerId,
      rev
    );
  } else {
    fail(playerId, 'unknownCommand', { command: `definition trigger ${sub}` });
    return;
  }
  report(
    playerId,
    result,
    t('messages.draftUpdated', lang(), { id: opts.id }),
    draftButtons(opts.id)
  );
}

/**
 * `definition step add|edit|remove|move` on the draft.
 *
 * @param {string} playerId GM.
 * @param {string} sub Sub-verb.
 * @param {object} opts Options.
 * @param {string|null} json JSON.
 * @param {number|undefined} rev Revision guard.
 * @returns {void}
 */
function editStep(playerId, sub, opts, json, rev) {
  let value;
  if (sub === 'add' || sub === 'edit') {
    value = editJson(playerId, json);
    if (value === undefined) {
      return;
    }
    if (!isRecord(value)) {
      fail(playerId, 'notObject');
      return;
    }
  }
  const result = updateDraft(
    opts.id,
    (draft) => {
      draft.steps = Array.isArray(draft.steps) ? draft.steps : [];
      switch (sub) {
        case 'add': {
          if (!STEP_SPECS[value.type]) {
            return { ok: false, error: 'unknownAction', vars: { type: String(value.type) } };
          }
          if (findStepLocation(draft.steps, value.id)) {
            return { ok: false, error: 'duplicateStep', vars: { id: String(value.id) } };
          }
          let list = blockList(draft, opts.block || 'root');
          let index = list ? list.length : 0;
          if (opts.after) {
            const location = findStepLocation(draft.steps, opts.after);
            if (!location) {
              return { ok: false, error: 'stepNotFound', vars: { id: opts.after } };
            }
            list = location.list;
            index = location.index + 1;
          } else if (opts.index !== undefined) {
            index = parseStrictInt(opts.index);
          }
          if (!list || index === null || index < 0 || index > list.length) {
            return { ok: false, error: 'badBlock', vars: { block: opts.block || 'root' } };
          }
          list.splice(index, 0, value);
          return { ok: true };
        }
        case 'edit': {
          const location = findStepLocation(draft.steps, opts.step);
          if (!location) {
            return { ok: false, error: 'stepNotFound', vars: { id: opts.step || '' } };
          }
          // A patch: given fields replace, `null` removes, the ID stays.
          const step = location.list[location.index];
          for (const [key, v] of Object.entries(value)) {
            if (key === 'id') {
              continue;
            }
            if (v === null) {
              delete step[key];
            } else {
              step[key] = v;
            }
          }
          return { ok: true };
        }
        case 'remove': {
          const location = findStepLocation(draft.steps, opts.step);
          if (!location) {
            return { ok: false, error: 'stepNotFound', vars: { id: opts.step || '' } };
          }
          location.list.splice(location.index, 1);
          return { ok: true };
        }
        case 'move': {
          const location = findStepLocation(draft.steps, opts.step);
          if (!location) {
            return { ok: false, error: 'stepNotFound', vars: { id: opts.step || '' } };
          }
          const [step] = location.list.splice(location.index, 1);
          const target = opts.block ? blockList(draft, opts.block) : location.list;
          const index = opts.index === undefined ? target?.length : parseStrictInt(opts.index);
          if (!target || index === null || index < 0 || index > target.length) {
            location.list.splice(location.index, 0, step);
            return { ok: false, error: 'badBlock', vars: { block: opts.block || '' } };
          }
          target.splice(index, 0, step);
          return { ok: true };
        }
        default:
          return {
            ok: false,
            error: 'unknownCommand',
            vars: { command: `definition step ${sub}` },
          };
      }
    },
    playerId,
    rev
  );
  report(
    playerId,
    result,
    t('messages.draftUpdated', lang(), { id: opts.id }),
    draftButtons(opts.id)
  );
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

/**
 * `template list|add <id>`.
 *
 * @param {string} playerId GM.
 * @param {object[]} words Words.
 * @returns {void}
 */
function commandTemplate(playerId, words) {
  const l = lang();
  const verb = (words[0]?.text || 'list').toLowerCase();
  if (verb === 'list') {
    const rows = TEMPLATES.map(
      (tpl) =>
        `<div style="margin:3px 0"><strong>${escapeHtml(tpl.name)}</strong> <span style="font-size:0.85em">${escapeHtml(tpl.id)}</span> ${getRecord(tpl.id) ? escapeHtml(t('labels.installed', l)) : buildButton(t('buttons.add', l), cmd('template', 'add', tpl.id))}<br><span style="font-size:0.85em">${escapeHtml(tpl.description)}</span></div>`
    );
    whisper(playerId, t('titles.templates', l), rows);
    return;
  }
  if (verb !== 'add') {
    fail(playerId, 'unknownCommand', { command: `template ${verb}` });
    return;
  }
  const id = words[1]?.text;
  const tpl = id ? getTemplate(id) : null;
  if (!tpl) {
    fail(playerId, 'templateNotFound', { id: id || '' });
    return;
  }
  const added = [];
  for (const depId of [...(TEMPLATE_DEPENDENCIES[id] || []), id]) {
    if (getRecord(depId)) {
      continue;
    }
    const result = importDefinition(clone(getTemplate(depId)), playerId);
    if (!result.ok) {
      fail(playerId, result.error || 'invalidDefinition', result.vars || {});
      return;
    }
    added.push(depId);
  }
  audit('template.add', { template: id, by: playerId });
  const enabled = getRecord(id)?.enabled;
  ok(
    playerId,
    t(enabled ? 'messages.templateAdded' : 'messages.templateAddedDisabled', l, {
      ids: added.join(', ') || id,
    }),
    [buildButton(t('buttons.show', l), cmd('definition', 'show', '--id', id))]
  );
}

// ---------------------------------------------------------------------------
// Instances
// ---------------------------------------------------------------------------

/**
 * `instance …` commands. Players may start published tasks and manage
 * their own runs.
 *
 * @param {object} msg Message.
 * @param {string} playerId Real sender.
 * @param {object[]} words Words.
 * @param {boolean} gm Caller is a GM.
 * @returns {void}
 */
function commandInstance(msg, playerId, words, gm) {
  const verb = (words[0]?.text || 'list').toLowerCase();
  const parsed = parseOptions(words.slice(1), {
    definition: 'value',
    id: 'value',
    rev: 'value',
    bind: 'multi',
    param: 'multi',
    status: 'value',
    page: 'value',
    action: 'value',
    confirm: 'value',
    'dry-run': 'flag',
  });
  if (parsed.error) {
    fail(playerId, parsed.error, parsed.vars);
    return;
  }
  const { opts } = parsed;
  const rev = revOf(opts);
  if (rev === null) {
    fail(playerId, 'badRev');
    return;
  }
  const l = lang();
  const runFor = () => {
    const inst = opts.id ? getInstance(opts.id) : null;
    if (!inst || !canManageRun(playerId, inst)) {
      fail(playerId, 'runNotFound', { id: opts.id || '' });
      return null;
    }
    if (rev !== undefined && inst.revision !== rev) {
      fail(playerId, 'stale', { id: inst.id, rev: inst.revision });
      return null;
    }
    return inst;
  };
  switch (verb) {
    case 'start':
    case 'dry-run':
      startCommand(msg, playerId, opts, verb === 'dry-run' || Boolean(opts['dry-run']));
      return;
    case 'list':
      listRuns(playerId, opts, gm);
      return;
    case 'inspect': {
      const inst = runFor();
      if (inst) {
        inspectRun(playerId, inst, gm);
      }
      return;
    }
    case 'pause': {
      const inst = runFor();
      if (inst) {
        report(playerId, pauseRun(inst.id, playerId), t('messages.paused', l, { id: inst.id }), [
          buildButton(
            t('buttons.resume', l),
            cmd('instance', 'resume', '--id', inst.id, '--rev', String(inst.revision))
          ),
        ]);
      }
      return;
    }
    case 'resume': {
      const inst = runFor();
      if (inst) {
        report(playerId, resumeRun(inst.id, playerId), t('messages.resumed', l, { id: inst.id }));
      }
      return;
    }
    case 'cancel': {
      const inst = runFor();
      if (inst) {
        report(
          playerId,
          cancelRun(inst.id, playerId),
          t('messages.cancelled', l, { id: inst.id, effects: inst.effects })
        );
      }
      return;
    }
    case 'rerun': {
      const source = opts.id
        ? getInstance(opts.id) || getState().history.find((h) => h.id === opts.id)
        : null;
      if (
        !source ||
        (!gm && source.initiatorPlayerId !== playerId && source.initiator !== playerId)
      ) {
        fail(playerId, 'runNotFound', { id: opts.id || '' });
        return;
      }
      const def = getSnapshot(source.definitionId);
      if (!def || !canStart(playerId, def, source.bindings).ok) {
        fail(playerId, 'notAllowed');
        return;
      }
      const result = rerun(opts.id, playerId);
      startReply(playerId, result, source.definitionId);
      return;
    }
    case 'decide':
      if (!gm) {
        fail(playerId, 'gmOnly');
        return;
      }
      decideCommand(playerId, opts, rev);
      return;
    default:
      fail(playerId, 'unknownCommand', { command: `instance ${verb}` });
  }
}

/**
 * Starts (or dry-runs) a definition from a command. Selection is captured
 * now and stored as IDs.
 *
 * @param {object} msg Message.
 * @param {string} playerId Real sender.
 * @param {object} opts Options.
 * @param {boolean} dryRun Validate only.
 * @returns {void}
 */
function startCommand(msg, playerId, opts, dryRun) {
  const l = lang();
  const record = opts.definition ? getRecord(opts.definition) : null;
  const def = record ? getSnapshot(record.id) : null;
  if (!def || (!isGm(playerId) && def.access?.mode !== 'players')) {
    fail(playerId, 'definitionNotFound', { id: opts.definition || '' });
    return;
  }
  const rawParams = pairs(opts.param);
  const rawBind = pairs(opts.bind);
  if (!rawParams || !rawBind) {
    fail(playerId, 'badPair');
    return;
  }
  const params = resolveParams(def, rawParams);
  if (!params.ok) {
    fail(playerId, params.error, params.vars);
    return;
  }
  const explicit = {};
  for (const [name, value] of Object.entries(rawBind)) {
    if (!def.bindings?.[name]) {
      fail(playerId, 'unknownBinding', { name });
      return;
    }
    // Only a GM may aim a task at objects by ID; players use their selection.
    if (value !== 'selected' && !isGm(playerId)) {
      fail(playerId, 'notController');
      return;
    }
    explicit[name] = value === 'selected' ? 'selected' : value.split(',').filter(Boolean);
  }
  const bindings = resolveBindings(def, {
    selected: selectedIds(msg),
    explicit,
    params: params.params,
  });
  if (!bindings.ok) {
    const first = bindings.errors[0];
    fail(playerId, `binding_${first.code}`, {
      binding: first.binding,
      id: first.id || '',
      max: first.max || '',
    });
    return;
  }
  const allowed = canStart(playerId, def, bindings.bindings);
  if (!allowed.ok) {
    fail(playerId, allowed.reason);
    return;
  }
  if (dryRun) {
    const check = validateBody(def);
    const targets = Object.entries(bindings.bindings).map(
      ([name, ids]) => `${name}: ${ids.map(targetLabel).join(', ') || '—'}`
    );
    whisper(playerId, t('titles.dryRun', l), [
      `<div>${escapeHtml(t(check.ok ? 'messages.dryRunOk' : 'messages.invalid', l, { id: def.id, count: check.errors.length }))}</div>`,
      targets.length ? `<div style="font-size:0.9em">${escapeHtml(targets.join('; '))}</div>` : '',
      check.ok ? '' : formatErrors(check.errors),
      check.warnings.length ? formatErrors(check.warnings) : '',
      `<div style="font-size:0.85em;opacity:0.8">${escapeHtml(t('messages.dryRunNote', l))}</div>`,
    ]);
    return;
  }
  const result = admitRun(record.id, {
    initiatorId: def.access?.authority === 'gmService' && isGm(playerId) ? null : playerId,
    params: params.params,
    bindings: bindings.bindings,
    trigger: { type: 'manual', id: 'manual' },
  });
  startReply(playerId, result, record.id);
}

/**
 * Replies to a start.
 *
 * @param {string} playerId Player.
 * @param {object} result Admission result.
 * @param {string} defId Definition ID.
 * @returns {void}
 */
function startReply(playerId, result, defId) {
  const l = lang();
  if (result.status === 'started') {
    const inst = result.instance;
    ok(playerId, t('messages.started', l, { id: inst.id, definition: defId }), [
      buildSecondaryButton(
        t('buttons.pause', l),
        cmd('instance', 'pause', '--id', inst.id, '--rev', String(inst.revision))
      ),
      buildSecondaryButton(
        t('buttons.cancel', l),
        cmd('instance', 'cancel', '--id', inst.id, '--rev', String(inst.revision))
      ),
      buildSecondaryButton(t('buttons.inspect', l), cmd('instance', 'inspect', '--id', inst.id)),
    ]);
    return;
  }
  if (result.status === 'queued') {
    ok(playerId, t('messages.queued', l, { definition: defId }));
    return;
  }
  if (result.status === 'skipped') {
    fail(playerId, 'alreadyRunning', { id: defId });
    return;
  }
  fail(playerId, result.reason || 'rejected', result.vars || {});
}

/**
 * Lists runs (players see their own).
 *
 * @param {string} playerId Player.
 * @param {object} opts Options.
 * @param {boolean} gm Caller is a GM.
 * @returns {void}
 */
function listRuns(playerId, opts, gm) {
  const l = lang();
  const runs = listInstances(
    (i) =>
      (gm || i.initiatorPlayerId === playerId) &&
      (!opts.status
        ? ACTIVE_STATUSES.has(i.status)
        : opts.status === 'all' || i.status === opts.status) &&
      (!opts.definition || i.definitionId === opts.definition)
  );
  if (!runs.length) {
    whisper(playerId, t('titles.runs', l), escapeHtml(t('dashboard.noRuns', l)));
    return;
  }
  const page = Math.max(1, parseStrictInt(opts.page) || 1);
  const rows = runs.slice((page - 1) * 15, page * 15).map((i) => {
    const controls = [];
    if (i.status === STATUS.RUNNING || i.status === STATUS.WAITING) {
      controls.push(
        buildSecondaryButton(
          t('buttons.pause', l),
          cmd('instance', 'pause', '--id', i.id, '--rev', String(i.revision))
        )
      );
    }
    if (i.status === STATUS.PAUSED) {
      controls.push(
        buildButton(
          t('buttons.resume', l),
          cmd('instance', 'resume', '--id', i.id, '--rev', String(i.revision))
        )
      );
    }
    controls.push(buildSecondaryButton('⋯', cmd('instance', 'inspect', '--id', i.id)));
    return `<div style="margin:2px 0"><strong>${escapeHtml(i.id)}</strong> ${escapeHtml(i.definitionId)} · ${escapeHtml(t(`statuses.${i.status}`, l))} ${controls.join('')}</div>`;
  });
  if (runs.length > page * 15) {
    rows.push(
      buildSecondaryButton(
        t('dashboard.next', l),
        cmd('instance', 'list', '--page', String(page + 1))
      )
    );
  }
  whisper(playerId, t('titles.runs', l), rows);
}

/**
 * Shows one run in detail. Players see a reduced card for their own runs.
 *
 * @param {string} playerId Player.
 * @param {object} inst Instance.
 * @param {boolean} gm Caller is a GM.
 * @returns {void}
 */
function inspectRun(playerId, inst, gm) {
  const l = lang();
  const rev = String(inst.revision);
  const lines = [
    buildRow(
      t('labels.definition', l),
      escapeHtml(`${inst.definitionId} r${inst.definitionRevision}`)
    ),
    buildRow(
      t('labels.status', l),
      escapeHtml(
        t(`statuses.${inst.status}`, l) +
          (inst.review ? ` (${t(`review.${inst.review.reason}`, l)})` : '')
      )
    ),
    buildRow(t('labels.step', l), escapeHtml(currentStep(inst) || '—')),
    buildRow(t('labels.started', l), escapeHtml(formatUtc(inst.startedAt))),
  ];
  if (gm) {
    lines.push(
      buildRow(
        t('labels.initiator', l),
        escapeHtml(
          inst.initiatorPlayerId ? playerName(inst.initiatorPlayerId) : t('labels.gmService', l)
        )
      )
    );
    lines.push(
      buildRow(
        t('labels.targets', l),
        escapeHtml(
          Object.entries(inst.bindings)
            .map(([k, ids]) => `${k}: ${ids.map(targetLabel).join(', ')}`)
            .join('; ') || '—'
        )
      )
    );
    if (inst.intendedDueAt) {
      lines.push(buildRow(t('labels.lateness', l), escapeHtml(formatDuration(inst.latenessMs))));
    }
    if (inst.error) {
      lines.push(
        `<div style="font-size:0.9em">${escapeHtml(t(`runErrors.${inst.error.reason}`, l, inst.error.vars || {}))}${inst.error.stepId ? ` @ ${escapeHtml(inst.error.stepId)}` : ''}</div>`
      );
    }
    const journal = Object.entries(inst.journal).slice(-8);
    if (journal.length) {
      lines.push(buildSectionLabel(t('labels.journal', l)));
      for (const [key, entry] of journal) {
        lines.push(
          `<div style="font-size:0.85em">${escapeHtml(key)}: ${escapeHtml(t(`journal.${entry.status}`, l))}</div>`
        );
      }
    }
    lines.push(buildSectionLabel(t('labels.timeline', l)));
    for (const entry of inst.timeline.slice(-10)) {
      lines.push(
        `<div style="font-size:0.82em">${escapeHtml(formatUtc(entry.at).slice(11))} ${escapeHtml(t(`timeline.${entry.kind}`, l, entry))}</div>`
      );
    }
  }
  lines.push(buildDivider());
  if (inst.status === STATUS.RUNNING || inst.status === STATUS.WAITING) {
    lines.push(
      buildButton(t('buttons.pause', l), cmd('instance', 'pause', '--id', inst.id, '--rev', rev))
    );
  }
  if (inst.status === STATUS.PAUSED) {
    lines.push(
      buildButton(t('buttons.resume', l), cmd('instance', 'resume', '--id', inst.id, '--rev', rev))
    );
  }
  if (inst.status === STATUS.REVIEW && gm) {
    for (const decision of decisionsFor(inst)) {
      lines.push(
        buildButton(
          t(`decisions.${decision}`, l),
          cmd('instance', 'decide', '--id', inst.id, '--action', decision, '--rev', rev)
        )
      );
    }
  }
  if (ACTIVE_STATUSES.has(inst.status) && inst.status !== STATUS.REVIEW) {
    lines.push(
      buildSecondaryButton(
        t('buttons.cancel', l),
        cmd('instance', 'cancel', '--id', inst.id, '--rev', rev)
      )
    );
  }
  if (!ACTIVE_STATUSES.has(inst.status)) {
    lines.push(
      buildSecondaryButton(t('buttons.rerun', l), cmd('instance', 'rerun', '--id', inst.id))
    );
  }
  whisper(playerId, inst.id, lines);
}

/**
 * `instance decide` for runs in review. Retrying an action whose outcome is
 * uncertain could duplicate it, so that needs a confirmation.
 *
 * @param {string} playerId GM.
 * @param {object} opts Options.
 * @param {number|undefined} rev Revision guard.
 * @returns {void}
 */
function decideCommand(playerId, opts, rev) {
  const l = lang();
  if (opts.confirm) {
    const confirmation = consumeConfirmation(opts.confirm, playerId);
    if (!confirmation.ok || confirmation.op !== 'decide') {
      fail(playerId, confirmation.reason || 'confirmationUnknown');
      return;
    }
    const inst = getInstance(confirmation.payload.id);
    if (!inst || inst.revision !== confirmation.payload.rev) {
      fail(playerId, 'stale', { id: confirmation.payload.id, rev: inst?.revision ?? '—' });
      return;
    }
    report(
      playerId,
      decideReview(inst.id, confirmation.payload.action, playerId),
      t('messages.decided', l, {
        id: inst.id,
        action: t(`decisions.${confirmation.payload.action}`, l),
      })
    );
    return;
  }
  const inst = opts.id ? getInstance(opts.id) : null;
  if (!inst) {
    fail(playerId, 'runNotFound', { id: opts.id || '' });
    return;
  }
  if (rev !== undefined && inst.revision !== rev) {
    fail(playerId, 'stale', { id: inst.id, rev: inst.revision });
    return;
  }
  const action = opts.action;
  if (
    !['retry', 'skip', 'complete', 'skipNext', 'cancel'].includes(action) ||
    !decisionsFor(inst).includes(action)
  ) {
    fail(playerId, 'badDecision', { actions: decisionsFor(inst).join(', ') });
    return;
  }
  const risky =
    action === 'retry' && ['uncertainOutcome', 'restartConflict'].includes(inst.review?.reason);
  if (risky) {
    const token = issueConfirmation(playerId, 'decide', {
      id: inst.id,
      rev: inst.revision,
      action,
    });
    whisper(playerId, t('titles.confirm', l), [
      `<div>${escapeHtml(t('messages.retryWarning', l, { id: inst.id, step: inst.review.stepId || '' }))}</div>`,
      buildButton(t('buttons.confirmRetry', l), cmd('instance', 'decide', '--confirm', token)),
    ]);
    return;
  }
  report(
    playerId,
    decideReview(inst.id, action, playerId),
    t('messages.decided', l, { id: inst.id, action: t(`decisions.${action}`, l) })
  );
}

// ---------------------------------------------------------------------------
// Schedules
// ---------------------------------------------------------------------------

/**
 * `schedule add|list|pause|resume|remove|offset|preview`.
 *
 * @param {string} playerId GM.
 * @param {object[]} words Words.
 * @returns {void}
 */
function commandSchedule(playerId, words) {
  const verb = (words[0]?.text || 'list').toLowerCase();
  const parsed = parseOptions(words.slice(1), {
    definition: 'value',
    id: 'value',
    rev: 'value',
    at: 'value',
    every: 'value',
    anchor: 'value',
    mode: 'value',
    daily: 'value',
    weekly: 'value',
    time: 'value',
    offset: 'value',
    start: 'value',
    end: 'value',
    count: 'value',
    overdue: 'value',
    bind: 'multi',
    param: 'multi',
    yes: 'flag',
  });
  if (parsed.error) {
    fail(playerId, parsed.error, parsed.vars);
    return;
  }
  const { opts } = parsed;
  const l = lang();
  const rev = revOf(opts);
  if (rev === null) {
    fail(playerId, 'badRev');
    return;
  }
  switch (verb) {
    case 'add':
      return addScheduleCommand(playerId, opts);
    case 'list': {
      const list = listSchedules(opts.definition);
      const rows = list.slice(0, 30).map((sc) => {
        const state = sc.paused
          ? t('statuses.paused', l)
          : sc.ended
            ? t('labels.ended', l)
            : formatUtc(sc.cursor.nextDueAt);
        const control = sc.paused
          ? buildButton(
              t('buttons.resume', l),
              cmd('schedule', 'resume', '--id', sc.id, '--rev', String(sc.rev))
            )
          : sc.ended
            ? ''
            : buildSecondaryButton(
                t('buttons.pause', l),
                cmd('schedule', 'pause', '--id', sc.id, '--rev', String(sc.rev))
              );
        return `<div style="margin:2px 0"><strong>${escapeHtml(sc.id)}</strong> ${escapeHtml(sc.definitionId)} · ${escapeHtml(describeSpec(sc.spec))} · ${escapeHtml(state)} ${control}${buildSecondaryButton('×', cmd('schedule', 'remove', '--id', sc.id))}</div>`;
      });
      whisper(
        playerId,
        t('titles.schedules', l),
        rows.length ? rows : escapeHtml(t('messages.noSchedules', l))
      );
      return;
    }
    case 'pause':
      report(
        playerId,
        pauseSchedule(opts.id, playerId, rev),
        t('messages.schedulePaused', l, { id: opts.id || '' }),
        [
          buildButton(
            t('buttons.resumeSkip', l),
            cmd('schedule', 'resume', '--id', opts.id || '', '--mode', 'skipPausedRange')
          ),
          buildSecondaryButton(
            t('buttons.resumeCatchUp', l),
            cmd('schedule', 'resume', '--id', opts.id || '', '--mode', 'catchUp')
          ),
        ]
      );
      return;
    case 'resume': {
      const mode = opts.mode || 'skipPausedRange';
      if (!['skipPausedRange', 'catchUp'].includes(mode)) {
        fail(playerId, 'badMode', { modes: 'skipPausedRange, catchUp' });
        return;
      }
      const result = resumeSchedule(opts.id, playerId, mode, rev);
      report(
        playerId,
        result,
        t('messages.scheduleResumed', l, {
          id: opts.id || '',
          skipped: result.skipped ?? result.summary?.missed ?? 0,
        })
      );
      return;
    }
    case 'remove':
      report(
        playerId,
        {
          ok: removeSchedule(opts.id, playerId),
          error: 'scheduleNotFound',
          vars: { id: opts.id || '' },
        },
        t('messages.scheduleRemoved', l, { id: opts.id || '' })
      );
      return;
    case 'preview': {
      const sched = getState().schedules[opts.id];
      if (!sched) {
        fail(playerId, 'scheduleNotFound', { id: opts.id || '' });
        return;
      }
      const times = listFrom(sched.spec, now(), 5).map(formatUtc);
      ok(playerId, t('messages.nextTimes', l, { id: sched.id, times: times.join(', ') || '—' }));
      return;
    }
    case 'offset': {
      const offset = parseUtcOffset(opts.offset);
      if (offset === null) {
        fail(playerId, 'badOffset');
        return;
      }
      if (!opts.yes) {
        const preview = previewOffset(opts.id, offset);
        if (!preview.ok) {
          fail(playerId, preview.error, preview.vars);
          return;
        }
        whisper(playerId, t('titles.offset', l), [
          `<div>${escapeHtml(t('messages.offsetPreview', l, { id: opts.id, offset: formatUtcOffset(offset) }))}</div>`,
          `<div style="font-size:0.88em">${escapeHtml(t('labels.before', l))}: ${escapeHtml(preview.before.map(formatUtc).join(', '))}</div>`,
          `<div style="font-size:0.88em">${escapeHtml(t('labels.after', l))}: ${escapeHtml(preview.after.map(formatUtc).join(', '))}</div>`,
          buildButton(
            t('buttons.apply', l),
            cmd('schedule', 'offset', '--id', opts.id, '--offset', formatUtcOffset(offset), '--yes')
          ),
        ]);
        return;
      }
      report(
        playerId,
        applyOffset(opts.id, offset, playerId),
        t('messages.offsetApplied', l, { id: opts.id, offset: formatUtcOffset(offset) })
      );
      return;
    }
    default:
      fail(playerId, 'unknownCommand', { command: `schedule ${verb}` });
  }
}

/**
 * Describes a recurrence spec.
 *
 * @param {object} spec Spec.
 * @returns {string} Text.
 */
function describeSpec(spec) {
  switch (spec.kind) {
    case 'once':
      return `at ${formatUtc(spec.at)}`;
    case 'interval':
      return `every ${formatDuration(spec.everyMs)} (${spec.mode})`;
    case 'daily':
      return `daily ${String(Math.floor(spec.timeMs / 3600000)).padStart(2, '0')}:${String(Math.floor((spec.timeMs % 3600000) / 60000)).padStart(2, '0')} ${formatUtcOffset(spec.offsetMinutes)}`;
    case 'weekly':
      return `weekly ${spec.days.map((d) => ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][d]).join(',')} ${String(Math.floor(spec.timeMs / 3600000)).padStart(2, '0')}:${String(Math.floor((spec.timeMs % 3600000) / 60000)).padStart(2, '0')} ${formatUtcOffset(spec.offsetMinutes)}`;
    default:
      return spec.kind;
  }
}

/**
 * `schedule add`: parses the times, shows them in UTC and asks for `--yes`
 * before anything is scheduled.
 *
 * @param {string} playerId GM.
 * @param {object} opts Options.
 * @returns {void}
 */
function addScheduleCommand(playerId, opts) {
  const l = lang();
  const record = opts.definition ? getRecord(opts.definition) : null;
  const def = record ? getSnapshot(record.id) : null;
  if (!def) {
    fail(playerId, 'definitionNotFound', { id: opts.definition || '' });
    return;
  }
  if (def.access?.authority !== 'gmService') {
    fail(playerId, 'scheduleNeedsService', { id: record.id });
    return;
  }
  const window = {};
  for (const key of ['start', 'end']) {
    if (opts[key] !== undefined) {
      const value = parseIsoInstant(opts[key]);
      if (value === null) {
        fail(playerId, 'badInstant', { value: opts[key] });
        return;
      }
      window[key === 'start' ? 'startAt' : 'endAt'] = value;
    }
  }
  if (opts.count !== undefined) {
    window.maxCount = parseStrictInt(opts.count);
  }
  let raw;
  if (opts.at) {
    raw = { kind: 'once', at: parseIsoInstant(opts.at) };
    if (raw.at === null) {
      fail(playerId, 'badInstant', { value: opts.at });
      return;
    }
  } else if (opts.every) {
    const anchor = opts.anchor ? parseIsoInstant(opts.anchor) : now();
    if (anchor === null) {
      fail(playerId, 'badInstant', { value: opts.anchor });
      return;
    }
    raw = {
      ...window,
      kind: 'interval',
      everyMs: durationValue(opts.every),
      anchor,
      mode: opts.mode || 'fixedRate',
    };
  } else if (opts.daily || opts.weekly) {
    const time = opts.daily || opts.time;
    raw = {
      ...window,
      kind: opts.weekly ? 'weekly' : 'daily',
      timeMs: parseClockTime(time),
      offsetMinutes: parseUtcOffset(opts.offset),
      days: opts.weekly ? parseWeekdays(opts.weekly) : undefined,
    };
    if (raw.offsetMinutes === null) {
      fail(playerId, 'offsetRequired');
      return;
    }
  } else {
    fail(playerId, 'scheduleKind');
    return;
  }
  const built = normaliseSpec(raw, getLimits());
  if (!built.ok) {
    fail(playerId, `spec_${built.error}`, { min: formatDuration(getLimits().minIntervalMs) });
    return;
  }
  const bindPairs = pairs(opts.bind);
  const paramPairs = pairs(opts.param);
  if (!bindPairs || !paramPairs) {
    fail(playerId, 'badPair');
    return;
  }
  const params = resolveParams(def, paramPairs);
  if (!params.ok) {
    fail(playerId, params.error, params.vars);
    return;
  }
  const bindings = Object.fromEntries(
    Object.entries(bindPairs).map(([k, v]) => [k, v.split(',').filter(Boolean)])
  );
  const check = resolveBindings(def, {
    explicit: bindings,
    params: params.params,
    unattended: true,
  });
  if (!check.ok) {
    const first = check.errors[0];
    fail(playerId, `binding_${first.code}`, {
      binding: first.binding,
      id: first.id || '',
      max: first.max || '',
    });
    return;
  }
  if (
    opts.overdue &&
    !['skip', 'runOnce', 'catchUpBounded', 'review', 'expire'].includes(opts.overdue)
  ) {
    fail(playerId, 'badMode', { modes: 'skip, runOnce, catchUpBounded, review, expire' });
    return;
  }
  const times = listFrom(built.spec, now(), 3);
  if (!opts.yes) {
    const again = ['schedule', 'add', '--definition', record.id];
    for (const key of [
      'at',
      'every',
      'anchor',
      'mode',
      'daily',
      'weekly',
      'time',
      'offset',
      'start',
      'end',
      'count',
      'overdue',
    ]) {
      if (opts[key] !== undefined) {
        again.push(`--${key}`, opts[key]);
      }
    }
    for (const b of opts.bind || []) {
      again.push('--bind', b);
    }
    for (const p of opts.param || []) {
      again.push('--param', p);
    }
    whisper(playerId, t('titles.schedulePreview', l), [
      buildRow(t('labels.definition', l), escapeHtml(record.id)),
      buildRow(t('labels.schedule', l), escapeHtml(describeSpec(built.spec))),
      buildRow(
        t('labels.nextTimes', l),
        escapeHtml(times.map(formatUtc).join(', ') || t('messages.noFutureTimes', l))
      ),
      built.spec.kind === 'daily' || built.spec.kind === 'weekly'
        ? `<div style="font-size:0.85em">${escapeHtml(t('messages.offsetNote', l))}</div>`
        : '',
      buildButton(t('buttons.confirmSchedule', l), cmd(...again, '--yes')),
    ]);
    return;
  }
  if (!times.length) {
    fail(playerId, 'noFutureTimes');
    return;
  }
  const sched = addSchedule({
    definitionId: record.id,
    spec: built.spec,
    overdue: opts.overdue ? { mode: opts.overdue } : null,
    bindings: check.bindings,
    params: params.params,
    by: playerId,
  });
  ok(
    playerId,
    t('messages.scheduleAdded', l, { id: sched.id, next: formatUtc(sched.cursor.nextDueAt) }),
    [
      buildSecondaryButton(
        t('buttons.pause', l),
        cmd('schedule', 'pause', '--id', sched.id, '--rev', String(sched.rev))
      ),
    ]
  );
}

// ---------------------------------------------------------------------------
// Signals, reports, recovery, config, adapters, emergency
// ---------------------------------------------------------------------------

/**
 * `signal <name> [--value v]`. Players may raise only signals a published
 * task listens for.
 *
 * @param {string} playerId Real sender.
 * @param {object[]} words Words.
 * @param {boolean} gm Caller is a GM.
 * @returns {void}
 */
function commandSignal(playerId, words, gm) {
  const name = words[0]?.text || '';
  const parsed = parseOptions(words.slice(1), { value: 'value' });
  if (parsed.error) {
    fail(playerId, parsed.error, parsed.vars);
    return;
  }
  if (!ID_PATTERN.test(name)) {
    fail(playerId, 'badId', { id: name });
    return;
  }
  if (!gm && !playerSignals().has(name)) {
    fail(playerId, 'signalNotAllowed', { name });
    return;
  }
  const raw = parsed.opts.value;
  const value =
    raw === undefined ? null : /^-?\d+(\.\d+)?$/.test(raw) ? Number(raw) : truncate(raw, 200);
  raiseSignal(name, value, playerId, 'command');
  ok(playerId, t('messages.signalled', lang(), { name }));
}

/**
 * `report missed|runs|audit|diagnostics`.
 *
 * @param {string} playerId GM.
 * @param {object[]} words Words.
 * @returns {void}
 */
function commandReport(playerId, words) {
  const verb = (words[0]?.text || 'missed').toLowerCase();
  const parsed = parseOptions(words.slice(1), { status: 'value', page: 'value' });
  if (parsed.error) {
    fail(playerId, parsed.error, parsed.vars);
    return;
  }
  const l = lang();
  const page = Math.max(1, parseStrictInt(parsed.opts.page) || 1);
  const s = getState();
  const pageOf = (list) => list.slice((page - 1) * 15, page * 15);
  switch (verb) {
    case 'missed': {
      const status = parsed.opts.status || 'open';
      const list = Object.values(s.incidents)
        .filter(
          (i) =>
            status === 'all' || (status === 'open' ? i.status !== 'resolved' : i.status === status)
        )
        .sort((a, b) => b.createdAt - a.createdAt);
      const rows = pageOf(list).map(
        (i) =>
          `<div style="margin:2px 0;font-size:0.9em"><strong>${escapeHtml(i.id)}</strong> ${escapeHtml(t(`causes.${i.cause}`, l))} ×${i.count} · ${escapeHtml(t(`incidentStatus.${i.status}`, l))}${i.status === 'open' ? buildSecondaryButton(t('buttons.acknowledge', l), cmd('recovery', 'acknowledge', '--incident', i.id)) : ''}${i.proposal?.mode === 'runOnce' && i.status !== 'resolved' ? buildButton(t('buttons.recoverRun', l), cmd('recovery', 'preview', '--incident', i.id, '--mode', 'runOnce')) : ''}</div>`
      );
      whisper(
        playerId,
        t('titles.incidents', l),
        rows.length ? rows : escapeHtml(t('dashboard.noIncidents', l))
      );
      return;
    }
    case 'runs': {
      const rows = pageOf([...s.history].reverse()).map(
        (h) =>
          `<div style="font-size:0.9em">${escapeHtml(h.id)} ${escapeHtml(h.definitionId)} · ${escapeHtml(t(`statuses.${h.status}`, l))} · ${escapeHtml(formatDuration(h.durationMs))}</div>`
      );
      whisper(
        playerId,
        t('titles.history', l),
        rows.length ? rows : escapeHtml(t('dashboard.noHistory', l))
      );
      return;
    }
    case 'audit': {
      const rows = pageOf([...s.audit].reverse()).map(
        (a) =>
          `<div style="font-size:0.82em">${escapeHtml(formatUtc(a.at))} ${escapeHtml(a.kind)} ${escapeHtml(
            truncate(
              Object.entries(a)
                .filter(([k]) => !['at', 'kind'].includes(k))
                .map(([k, v]) => `${k}=${v}`)
                .join(' '),
              120
            )
          )}</div>`
      );
      whisper(playerId, t('titles.audit', l), rows);
      return;
    }
    case 'diagnostics': {
      const stats = runtime.scheduler?.stats() || {};
      const rows = [
        buildRow('jobs', escapeHtml(`${stats.jobs} (${stats.stale} stale)`)),
        buildRow('next', escapeHtml(stats.nextDueAt ? formatUtc(stats.nextDueAt) : '—')),
        buildRow('armed', escapeHtml(stats.armed ? 'yes' : 'no')),
        buildRow('drains/yields', escapeHtml(`${stats.drains}/${stats.yields}`)),
        buildRow('maxDrainMs', escapeHtml(String(stats.maxDrainMs))),
        buildRow('clockJumps', escapeHtml(String(stats.clockJumps))),
        buildRow('state', escapeHtml(`${Math.round(stateSize() / 1024)} KiB`)),
        buildRow('boot', escapeHtml(`${s.boot.id} @ ${formatUtc(s.boot.at)}`)),
        buildRow(
          'adapters',
          escapeHtml(
            listAdapters()
              .map((a) => a.name)
              .join(', ') || '—'
          )
        ),
      ];
      whisper(playerId, t('titles.diagnostics', l), rows);
      return;
    }
    default:
      fail(playerId, 'unknownCommand', { command: `report ${verb}` });
  }
}

/**
 * `recovery preview|apply|acknowledge`.
 *
 * @param {string} playerId GM.
 * @param {object[]} words Words.
 * @returns {void}
 */
function commandRecovery(playerId, words) {
  const verb = (words[0]?.text || '').toLowerCase();
  const parsed = parseOptions(words.slice(1), { incident: 'value', mode: 'value', token: 'value' });
  if (parsed.error) {
    fail(playerId, parsed.error, parsed.vars);
    return;
  }
  const { opts } = parsed;
  const l = lang();
  const s = getState();
  switch (verb) {
    case 'acknowledge':
      report(
        playerId,
        {
          ok: Boolean(acknowledgeIncident(opts.incident, playerId)),
          error: 'incidentNotFound',
          vars: { id: opts.incident || '' },
        },
        t('messages.acknowledged', l, { id: opts.incident || '' })
      );
      return;
    case 'preview': {
      const incident = s.incidents[opts.incident];
      if (!incident || incident.status === 'resolved') {
        fail(playerId, 'incidentNotFound', { id: opts.incident || '' });
        return;
      }
      const mode = opts.mode || 'runOnce';
      if (!['runOnce', 'skip'].includes(mode)) {
        fail(playerId, 'badMode', { modes: 'runOnce, skip' });
        return;
      }
      const token = issueConfirmation(playerId, 'recovery', {
        id: incident.id,
        mode,
        updatedAt: incident.updatedAt,
      });
      whisper(playerId, t('titles.recovery', l), [
        buildRow(t('labels.incident', l), escapeHtml(incident.id)),
        buildRow(t('labels.cause', l), escapeHtml(t(`causes.${incident.cause}`, l))),
        buildRow(t('labels.missed', l), escapeHtml(String(incident.count))),
        incident.range
          ? buildRow(
              t('labels.range', l),
              escapeHtml(`${formatUtc(incident.range.from)} → ${formatUtc(incident.range.to)}`)
            )
          : '',
        `<div>${escapeHtml(t(mode === 'runOnce' ? 'messages.recoveryRunOnce' : 'messages.recoverySkip', l))}</div>`,
        buildButton(t('buttons.apply', l), cmd('recovery', 'apply', '--token', token)),
      ]);
      return;
    }
    case 'apply': {
      const confirmation = consumeConfirmation(opts.token || '', playerId);
      if (!confirmation.ok || confirmation.op !== 'recovery') {
        fail(playerId, confirmation.reason || 'confirmationUnknown');
        return;
      }
      const incident = s.incidents[confirmation.payload.id];
      if (
        !incident ||
        incident.status === 'resolved' ||
        incident.updatedAt !== confirmation.payload.updatedAt
      ) {
        fail(playerId, 'stale', { id: confirmation.payload.id, rev: '—' });
        return;
      }
      const result = applyRecovery(incident, confirmation.payload.mode, playerId);
      report(
        playerId,
        result,
        t('messages.recovered', l, { id: incident.id, run: result.run || '—' })
      );
      return;
    }
    default:
      fail(playerId, 'unknownCommand', { command: `recovery ${verb}` });
  }
}

/**
 * `config show|set <key> <value>`.
 *
 * @param {string} playerId GM.
 * @param {object[]} words Words.
 * @returns {void}
 */
function commandConfig(playerId, words) {
  const verb = (words[0]?.text || 'show').toLowerCase();
  const l = lang();
  if (verb === 'show') {
    const rows = Object.keys(DEFAULT_CONFIG).map((key) =>
      buildRow(key, escapeHtml(String(getConfig()[key])))
    );
    whisper(playerId, t('titles.config', l), rows);
    return;
  }
  if (verb === 'set') {
    const key = words[1]?.text || '';
    const result = setConfigValue(key, words[2]?.text);
    if (!result.valid) {
      fail(playerId, 'badConfig', { key });
      return;
    }
    markDirty();
    ok(playerId, t('messages.configSet', l, { key, value: String(result.value) }));
    return;
  }
  fail(playerId, 'unknownCommand', { command: `config ${verb}` });
}

/**
 * `adapter list`.
 *
 * @param {string} playerId GM.
 * @returns {void}
 */
function commandAdapter(playerId) {
  const l = lang();
  const rows = listAdapters().map(
    (a) =>
      `<div><strong>${escapeHtml(a.name)}</strong> ${escapeHtml(String(a.version || ''))}: ${escapeHtml(Object.keys(a.actions).join(', '))}</div>`
  );
  whisper(
    playerId,
    t('titles.adapters', l),
    rows.length ? rows : escapeHtml(t('dashboard.noAdapters', l))
  );
}

/**
 * `stop-all --preview` / `--confirm <token>`: holds new admissions and
 * cancels active work. Already dispatched actions cannot be retracted.
 *
 * @param {string} playerId GM.
 * @param {object[]} words Words.
 * @returns {void}
 */
function commandStopAll(playerId, words) {
  const parsed = parseOptions(words, { preview: 'flag', confirm: 'value' });
  if (parsed.error) {
    fail(playerId, parsed.error, parsed.vars);
    return;
  }
  const l = lang();
  const s = getState();
  const active = listInstances((i) => ACTIVE_STATUSES.has(i.status));
  const queued = Object.values(s.queues).reduce((n, q) => n + q.length, 0);
  if (!parsed.opts.confirm) {
    const token = issueConfirmation(playerId, 'stopAll', { count: active.length });
    whisper(playerId, t('titles.confirm', l), [
      `<div>${escapeHtml(t('messages.stopAllPreview', l, { runs: active.length, queued }))}</div>`,
      buildButton(t('buttons.confirmStop', l), cmd('stop-all', '--confirm', token)),
    ]);
    return;
  }
  const confirmation = consumeConfirmation(parsed.opts.confirm, playerId);
  if (!confirmation.ok || confirmation.op !== 'stopAll') {
    fail(playerId, confirmation.reason || 'confirmationUnknown');
    return;
  }
  s.halted = { at: now(), by: playerId };
  let cancelled = 0;
  for (const inst of active) {
    if (
      ACTIVE_STATUSES.has(getInstance(inst.id)?.status) &&
      cancelRun(inst.id, playerId, 'stopAll').ok
    ) {
      cancelled += 1;
    }
  }
  s.queues = {};
  audit('stopAll', { by: playerId, cancelled });
  markDirty();
  ok(playerId, t('messages.stopped', l, { count: cancelled }), [
    buildButton(t('dashboard.resumeAll', l), cmd('resume-all')),
  ]);
}

/**
 * `resume-all`: allows new admissions again after stop-all.
 *
 * @param {string} playerId GM.
 * @returns {void}
 */
function commandResumeAll(playerId) {
  const s = getState();
  if (!s.halted) {
    fail(playerId, 'notHalted');
    return;
  }
  s.halted = null;
  audit('resumeAll', { by: playerId });
  markDirty();
  ok(playerId, t('messages.resumedAll', lang()));
}
