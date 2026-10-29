// GM dashboard handout and optional player view (plan §9). Content is a
// snapshot rendered from state, written at most every two seconds through
// one scheduler job, skipped when unchanged, and never trusted back.

import { openIncidents } from './audit.js';
import { whisper } from './chat.js';
import {
  ACTIVE_STATUSES,
  COLOR_ACCENT,
  COLOR_BORDER,
  COLOR_BUTTON_ALT_BG,
  COLOR_BUTTON_ALT_BORDER,
  COLOR_BUTTON_BG,
  COLOR_BUTTON_TEXT,
  COLOR_CARD_BG_BOTTOM,
  COLOR_DANGER_BG,
  COLOR_HEADER_BG,
  COLOR_HEADER_TEXT,
  COLOR_MUTED,
  COLOR_OK,
  COLOR_TEXT,
  COMMAND,
  DASHBOARD_VIEWS,
  HANDOUT_DASHBOARD_NAME,
  HANDOUT_PLAYER_NAME,
  JOB,
  SCRIPT_NAME,
  SCRIPT_VERSION,
  STATUS,
  TIMING,
} from './constants.js';
import { getSnapshot, listRecords } from './definitions.js';
import { currentStep, listInstances } from './executor.js';
import { createObject, findObjects, getObject, logLine, now } from './host.js';
import { t } from './i18n.js';
import { listAdapters } from './integrations.js';
import { targetLabel } from './objects.js';
import { onJob, runtime, schedule } from './runtime.js';
import { listSchedules } from './schedules.js';
import { getConfig, getState, stateSize, getLimits } from './state.js';
import { escapeHtml, formatDuration, formatUtc, hashText, quoteArg, truncate } from './utils.js';

const S = {
  outer: `background:${COLOR_CARD_BG_BOTTOM};color:${COLOR_TEXT};padding:12px 16px;border:1px solid ${COLOR_BORDER};border-radius:6px;font-family:Arial,sans-serif;line-height:1.45;`,
  header: `background:${COLOR_HEADER_BG};padding:10px;border-radius:4px;text-align:center;border-bottom:3px solid ${COLOR_ACCENT};margin-bottom:8px;`,
  h1: `color:${COLOR_HEADER_TEXT};margin:0;font-size:1.5em;letter-spacing:0.05em;`,
  sub: `color:${COLOR_MUTED};margin:3px 0 0 0;font-size:0.85em;`,
  h2: `color:${COLOR_ACCENT};border-bottom:1px solid ${COLOR_BORDER};padding-bottom:2px;margin:14px 0 6px 0;font-size:1.15em;`,
  p: `color:${COLOR_TEXT};margin:4px 0;`,
  muted: `color:${COLOR_MUTED};font-size:0.85em;`,
  table: 'width:100%;border-collapse:collapse;margin:4px 0;font-size:0.88em;',
  th: `background:${COLOR_HEADER_BG};color:${COLOR_HEADER_TEXT};padding:4px 6px;text-align:left;border:1px solid ${COLOR_BORDER};`,
  td: `padding:4px 6px;border:1px solid ${COLOR_BORDER};vertical-align:top;color:${COLOR_TEXT};`,
  btn: `background:${COLOR_BUTTON_BG};color:${COLOR_BUTTON_TEXT};padding:2px 7px;border-radius:3px;text-decoration:none;font-size:0.85em;display:inline-block;margin:1px 2px;`,
  btnAlt: `background:${COLOR_BUTTON_ALT_BG};color:${COLOR_TEXT};border:1px solid ${COLOR_BUTTON_ALT_BORDER};padding:2px 7px;border-radius:3px;text-decoration:none;font-size:0.85em;display:inline-block;margin:1px 2px;`,
  btnDanger: `background:${COLOR_DANGER_BG};color:#ffffff;padding:2px 7px;border-radius:3px;text-decoration:none;font-size:0.85em;display:inline-block;margin:1px 2px;font-weight:bold;`,
  navOn: `background:${COLOR_ACCENT};color:#1d2a3a;padding:2px 8px;border-radius:3px;text-decoration:none;font-size:0.85em;display:inline-block;margin:1px 2px;font-weight:bold;`,
  ok: `color:${COLOR_OK};font-weight:bold;`,
  warn: `color:${COLOR_ACCENT};font-weight:bold;`,
};

const memory = { dirtySince: null, writing: false, generation: 0, notices: new Map() };

/**
 * Builds a command link. Only command words, opaque IDs and numbers go into
 * links; every value is quoted for the tokenizer and escaped for HTML.
 *
 * @param {string} label Link text.
 * @param {string[]} words Command words after the prefix.
 * @param {string} [style] Inline style.
 * @returns {string} HTML anchor.
 */
export function commandLink(label, words, style = S.btn) {
  const command = [COMMAND, ...words.map((w) => quoteArg(w))].join(' ');
  return `<a href="${escapeHtml(command)}" style="${style}">${escapeHtml(label)}</a>`;
}

/**
 * Builds a table.
 *
 * @param {string[]} headings Headings.
 * @param {string[][]} rows Cells (trusted HTML).
 * @returns {string} HTML.
 */
function table(headings, rows) {
  if (!rows.length) {
    return '';
  }
  const head = headings.map((h) => `<th style="${S.th}">${escapeHtml(h)}</th>`).join('');
  const body = rows
    .map((cells) => `<tr>${cells.map((c) => `<td style="${S.td}">${c}</td>`).join('')}</tr>`)
    .join('');
  return `<table style="${S.table}"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

/**
 * Returns one page of rows.
 *
 * @param {object[]} items Items.
 * @param {number} page 1-based page.
 * @returns {{items: object[], page: number, pages: number}} Page.
 */
function paginate(items, page) {
  const size = getConfig().dashboardRows;
  const pages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(Math.max(1, page), pages);
  return { items: items.slice((current - 1) * size, current * size), page: current, pages };
}

/**
 * Renders page navigation for a section.
 *
 * @param {string} view View.
 * @param {{page: number, pages: number}} paged Page info.
 * @param {string} lang Locale.
 * @returns {string} HTML.
 */
function pager(view, paged, lang) {
  if (paged.pages <= 1) {
    return '';
  }
  const parts = [];
  if (paged.page > 1) {
    parts.push(
      commandLink(
        t('dashboard.prev', lang),
        ['dashboard', 'view', view, String(paged.page - 1)],
        S.btnAlt
      )
    );
  }
  parts.push(
    `<span style="${S.muted}">${escapeHtml(t('dashboard.page', lang, { page: paged.page, pages: paged.pages }))}</span>`
  );
  if (paged.page < paged.pages) {
    parts.push(
      commandLink(
        t('dashboard.next', lang),
        ['dashboard', 'view', view, String(paged.page + 1)],
        S.btnAlt
      )
    );
  }
  return `<div style="margin:4px 0">${parts.join(' ')}</div>`;
}

/**
 * Formats a deadline as UTC with the remaining time as of this render.
 *
 * @param {number|null} at Deadline.
 * @param {number} renderedAt Render time.
 * @returns {string} HTML.
 */
function deadline(at, renderedAt) {
  if (!Number.isFinite(at)) {
    return '—';
  }
  const left = at - renderedAt;
  return `${escapeHtml(formatUtc(at))}<br><span style="${S.muted}">${escapeHtml(left >= 0 ? `in ${formatDuration(left)}` : `${formatDuration(-left)} ago`)}</span>`;
}

/**
 * Describes what a run is waiting for.
 *
 * @param {object} inst Instance.
 * @param {string} lang Locale.
 * @returns {{text: string, at: number|null}} Wait.
 */
function waitOf(inst, lang) {
  const wait = inst.branches.main?.wait;
  if (inst.status === STATUS.REVIEW) {
    return { text: t(`review.${inst.review?.reason}`, lang), at: null };
  }
  if (!wait) {
    return { text: '', at: null };
  }
  const at = wait.dueAt ?? wait.timeoutAt ?? null;
  return {
    text: t(`waits.${wait.kind}`, lang, { event: wait.event || '', child: wait.childId || '' }),
    at: inst.status === STATUS.PAUSED ? null : at,
  };
}

/**
 * Summarises a definition's triggers.
 *
 * @param {object|null} def Definition snapshot.
 * @returns {string} Text.
 */
function triggerSummary(def) {
  return (def?.triggers || [])
    .map((tr) =>
      tr.type === 'event' ? tr.event : tr.type === 'signal' ? `signal:${tr.name}` : tr.type
    )
    .join(', ');
}

/**
 * Renders the dashboard HTML for a view.
 *
 * @param {string} view View name.
 * @param {number} page Page.
 * @returns {string} HTML.
 */
export function renderDashboard(view, page) {
  const s = getState();
  const lang = getConfig().language;
  const at = now();
  const nav = DASHBOARD_VIEWS.map((v) =>
    commandLink(
      t(`dashboard.views.${v}`, lang),
      ['dashboard', 'view', v],
      v === view ? S.navOn : S.btnAlt
    )
  ).join('');
  const status = runtime.disabled
    ? `<span style="${S.warn}">${escapeHtml(t('dashboard.statusDisabled', lang))}</span>`
    : s.halted
      ? `<span style="${S.warn}">${escapeHtml(t('dashboard.statusHalted', lang))}</span>`
      : `<span style="${S.ok}">${escapeHtml(t('dashboard.statusRunning', lang))}</span>`;
  const controls = [
    commandLink(t('dashboard.refresh', lang), ['dashboard', 'refresh'], S.btnAlt),
    s.halted
      ? commandLink(t('dashboard.resumeAll', lang), ['resume-all'], S.btn)
      : commandLink(t('dashboard.stopAll', lang), ['stop-all', '--preview'], S.btnDanger),
    commandLink(t('dashboard.templates', lang), ['template', 'list'], S.btnAlt),
    commandLink(t('dashboard.help', lang), ['help'], S.btnAlt),
  ].join('');
  const sections = {
    overview: renderOverview,
    definitions: renderDefinitions,
    instances: renderInstances,
    queue: renderQueue,
    incidents: renderIncidents,
    history: renderHistory,
    integrations: renderIntegrations,
  };
  const body = (sections[view] || renderOverview)(page, lang, at);
  return [
    `<div style="${S.outer}">`,
    `<div style="${S.header}"><h1 style="${S.h1}">${escapeHtml(SCRIPT_NAME)}</h1>`,
    `<p style="${S.sub}">${escapeHtml(t('dashboard.generated', lang, { at: formatUtc(at), version: SCRIPT_VERSION }))}</p></div>`,
    `<p style="${S.muted}">${escapeHtml(t('dashboard.generatedNote', lang))}</p>`,
    `<div style="margin:4px 0">${status} ${controls}</div>`,
    `<div style="margin:6px 0">${nav}</div>`,
    body,
    '</div>',
  ].join('');
}

/**
 * Overview: counts, runs needing a decision, top incidents and next times.
 *
 * @param {number} page Page.
 * @param {string} lang Locale.
 * @param {number} at Render time.
 * @returns {string} HTML.
 */
function renderOverview(page, lang, at) {
  const s = getState();
  const active = listInstances((i) => ACTIVE_STATUSES.has(i.status));
  const byStatus = (status) => active.filter((i) => i.status === status).length;
  const incidents = openIncidents();
  const sched = runtime.scheduler?.stats() || {};
  const counts = [
    [
      t('dashboard.counts.definitions', lang),
      listRecords().filter((r) => r.enabled).length + ' / ' + listRecords().length,
    ],
    [t('dashboard.counts.running', lang), byStatus(STATUS.RUNNING) + byStatus(STATUS.WAITING)],
    [t('dashboard.counts.paused', lang), byStatus(STATUS.PAUSED)],
    [t('dashboard.counts.review', lang), byStatus(STATUS.REVIEW)],
    [t('dashboard.counts.queued', lang), Object.values(s.queues).reduce((n, q) => n + q.length, 0)],
    [t('dashboard.counts.incidents', lang), incidents.length],
    [t('dashboard.counts.nextJob', lang), sched.nextDueAt ? formatUtc(sched.nextDueAt) : '—'],
  ].map(([label, value]) => [escapeHtml(label), escapeHtml(String(value))]);
  const review = active
    .filter((i) => i.status === STATUS.REVIEW)
    .map((inst) => instanceRow(inst, lang, at));
  const next = listSchedules()
    .filter((sc) => !sc.paused && !sc.ended && sc.cursor.nextDueAt)
    .slice(0, 5)
    .map((sc) => [
      escapeHtml(sc.id),
      escapeHtml(sc.definitionId),
      deadline(sc.cursor.nextDueAt, at),
    ]);
  return [
    `<h2 style="${S.h2}">${escapeHtml(t('dashboard.views.overview', lang))}</h2>`,
    table([t('dashboard.cols.item', lang), t('dashboard.cols.value', lang)], counts),
    review.length
      ? `<h2 style="${S.h2}">${escapeHtml(t('dashboard.needsDecision', lang))}</h2>`
      : '',
    table(instanceHeadings(lang), review),
    incidents.length
      ? `<h2 style="${S.h2}">${escapeHtml(t('dashboard.views.incidents', lang))}</h2>`
      : '',
    table(
      incidentHeadings(lang),
      incidents.slice(0, 5).map((i) => incidentRow(i, lang))
    ),
    next.length ? `<h2 style="${S.h2}">${escapeHtml(t('dashboard.nextTimes', lang))}</h2>` : '',
    table(
      [
        t('dashboard.cols.schedule', lang),
        t('dashboard.cols.definition', lang),
        t('dashboard.cols.due', lang),
      ],
      next
    ),
    warnings(lang),
  ].join('');
}

/**
 * Resource and circuit-breaker warnings.
 *
 * @param {string} lang Locale.
 * @returns {string} HTML.
 */
function warnings(lang) {
  const items = [];
  const size = stateSize();
  if (size > getLimits().stateBytes * 0.75) {
    items.push(
      t('dashboard.warnState', lang, {
        kb: Math.round(size / 1024),
        max: Math.round(getLimits().stateBytes / 1024),
      })
    );
  }
  for (const record of listRecords()) {
    if (record.disabledReason === 'circuit') {
      items.push(t('dashboard.warnCircuit', lang, { id: record.id }));
    }
  }
  if (getState().dashboard.drift) {
    items.push(t('dashboard.warnDrift', lang));
  }
  return items.length
    ? `<h2 style="${S.h2}">${escapeHtml(t('dashboard.warnings', lang))}</h2>${items.map((x) => `<p style="${S.warn}">${escapeHtml(x)}</p>`).join('')}`
    : '';
}

/**
 * Definitions view.
 *
 * @param {number} page Page.
 * @param {string} lang Locale.
 * @param {number} at Render time.
 * @returns {string} HTML.
 */
function renderDefinitions(page, lang, at) {
  const paged = paginate(listRecords(), page);
  const rows = paged.items.map((record) => {
    const def = getSnapshot(record.id);
    const next =
      listSchedules(record.id).find((sc) => !sc.paused && !sc.ended)?.cursor.nextDueAt ?? null;
    const actions = [
      def && record.enabled
        ? commandLink(t('buttons.start', lang), ['instance', 'start', '--definition', record.id])
        : '',
      record.enabled
        ? commandLink(
            t('buttons.disable', lang),
            ['definition', 'disable', '--id', record.id, '--rev', String(record.rev)],
            S.btnAlt
          )
        : def
          ? commandLink(
              t('buttons.enable', lang),
              ['definition', 'enable', '--id', record.id, '--rev', String(record.rev)],
              S.btnAlt
            )
          : '',
      commandLink(t('buttons.show', lang), ['definition', 'show', '--id', record.id], S.btnAlt),
    ].join('');
    const state = record.enabled
      ? t('dashboard.enabled', lang)
      : t('dashboard.disabled', lang, { reason: record.disabledReason || '—' });
    return [
      `${escapeHtml(truncate(record.name, 60))}<br><span style="${S.muted}">${escapeHtml(record.id)} r${record.current || '—'}${record.draft && record.current && record.draft.revision > record.current ? ' +draft' : ''}</span>`,
      escapeHtml(state),
      escapeHtml(triggerSummary(def)),
      deadline(next, at),
      actions,
    ];
  });
  return [
    `<h2 style="${S.h2}">${escapeHtml(t('dashboard.views.definitions', lang))}</h2>`,
    rows.length
      ? table(
          [
            t('dashboard.cols.definition', lang),
            t('dashboard.cols.state', lang),
            t('dashboard.cols.triggers', lang),
            t('dashboard.cols.next', lang),
            '',
          ],
          rows
        )
      : `<p style="${S.p}">${escapeHtml(t('dashboard.noDefinitions', lang))}</p>`,
    pager('definitions', paged, lang),
  ].join('');
}

/**
 * Column headings for run rows.
 *
 * @param {string} lang Locale.
 * @returns {string[]} Headings.
 */
function instanceHeadings(lang) {
  return [
    t('dashboard.cols.run', lang),
    t('dashboard.cols.status', lang),
    t('dashboard.cols.targets', lang),
    t('dashboard.cols.step', lang),
    t('dashboard.cols.due', lang),
    '',
  ];
}

/**
 * Renders one run row with its controls.
 *
 * @param {object} inst Instance.
 * @param {string} lang Locale.
 * @param {number} at Render time.
 * @returns {string[]} Cells.
 */
function instanceRow(inst, lang, at) {
  const rev = String(inst.revision);
  const wait = waitOf(inst, lang);
  const targets = Object.values(inst.bindings).flat();
  const actions = [];
  if (inst.status === STATUS.RUNNING || inst.status === STATUS.WAITING) {
    actions.push(
      commandLink(
        t('buttons.pause', lang),
        ['instance', 'pause', '--id', inst.id, '--rev', rev],
        S.btnAlt
      )
    );
  }
  if (inst.status === STATUS.PAUSED) {
    actions.push(
      commandLink(t('buttons.resume', lang), ['instance', 'resume', '--id', inst.id, '--rev', rev])
    );
  }
  if (inst.status === STATUS.REVIEW) {
    for (const decision of decisionsFor(inst)) {
      actions.push(
        commandLink(t(`decisions.${decision}`, lang), [
          'instance',
          'decide',
          '--id',
          inst.id,
          '--action',
          decision,
          '--rev',
          rev,
        ])
      );
    }
  }
  if (ACTIVE_STATUSES.has(inst.status) && inst.status !== STATUS.REVIEW) {
    actions.push(
      commandLink(
        t('buttons.cancel', lang),
        ['instance', 'cancel', '--id', inst.id, '--rev', rev],
        S.btnAlt
      )
    );
  }
  actions.push(
    commandLink(t('buttons.inspect', lang), ['instance', 'inspect', '--id', inst.id], S.btnAlt)
  );
  const late =
    inst.latenessMs > getConfig().graceMs
      ? `<br><span style="${S.muted}">${escapeHtml(t('dashboard.late', lang, { late: formatDuration(inst.latenessMs) }))}</span>`
      : '';
  return [
    `${escapeHtml(inst.id)}<br><span style="${S.muted}">${escapeHtml(inst.definitionId)} r${inst.definitionRevision}</span>`,
    `${escapeHtml(t(`statuses.${inst.status}`, lang))}${wait.text ? `<br><span style="${S.muted}">${escapeHtml(wait.text)}</span>` : ''}${late}`,
    escapeHtml(
      targets.slice(0, 3).map(targetLabel).join(', ') +
        (targets.length > 3 ? ` +${targets.length - 3}` : '')
    ),
    escapeHtml(currentStep(inst)),
    deadline(wait.at, at),
    actions.join(''),
  ];
}

/**
 * Lists the decisions offered for a run in review.
 *
 * @param {object} inst Instance.
 * @returns {string[]} Decisions.
 */
export function decisionsFor(inst) {
  switch (inst.review?.reason) {
    case 'overdueWait':
      return ['complete', 'skipNext', 'cancel'];
    case 'uncertainOutcome':
    case 'restartConflict':
      return ['complete', 'retry', 'skip', 'cancel'];
    default:
      return ['retry', 'skip', 'cancel'];
  }
}

/**
 * Runs view: everything not finished.
 *
 * @param {number} page Page.
 * @param {string} lang Locale.
 * @param {number} at Render time.
 * @returns {string} HTML.
 */
function renderInstances(page, lang, at) {
  const order = { review: 0, paused: 1, running: 2, waiting: 3, queued: 4 };
  const active = listInstances((i) => ACTIVE_STATUSES.has(i.status)).sort(
    (a, b) => order[a.status] - order[b.status]
  );
  const paged = paginate(active, page);
  return [
    `<h2 style="${S.h2}">${escapeHtml(t('dashboard.views.instances', lang))}</h2>`,
    paged.items.length
      ? table(
          instanceHeadings(lang),
          paged.items.map((i) => instanceRow(i, lang, at))
        )
      : `<p style="${S.p}">${escapeHtml(t('dashboard.noRuns', lang))}</p>`,
    pager('instances', paged, lang),
  ].join('');
}

/**
 * Queue view.
 *
 * @param {number} page Page.
 * @param {string} lang Locale.
 * @param {number} at Render time.
 * @returns {string} HTML.
 */
function renderQueue(page, lang, at) {
  const entries = Object.values(getState().queues).flat();
  const paged = paginate(entries, page);
  const rows = paged.items.map((e) => [
    escapeHtml(e.id),
    escapeHtml(e.definitionId),
    escapeHtml(formatUtc(e.admittedAt)),
    deadline(e.expiresAt, at),
  ]);
  return [
    `<h2 style="${S.h2}">${escapeHtml(t('dashboard.views.queue', lang))}</h2>`,
    rows.length
      ? table(
          [
            t('dashboard.cols.entry', lang),
            t('dashboard.cols.definition', lang),
            t('dashboard.cols.admitted', lang),
            t('dashboard.cols.expires', lang),
          ],
          rows
        )
      : `<p style="${S.p}">${escapeHtml(t('dashboard.noQueue', lang))}</p>`,
    pager('queue', paged, lang),
  ].join('');
}

/**
 * Column headings for incident rows.
 *
 * @param {string} lang Locale.
 * @returns {string[]} Headings.
 */
function incidentHeadings(lang) {
  return [
    t('dashboard.cols.incident', lang),
    t('dashboard.cols.cause', lang),
    t('dashboard.cols.range', lang),
    t('dashboard.cols.count', lang),
    '',
  ];
}

/**
 * Renders one incident row.
 *
 * @param {object} incident Incident.
 * @param {string} lang Locale.
 * @returns {string[]} Cells.
 */
function incidentRow(incident, lang) {
  const actions = [];
  if (incident.status === 'open') {
    actions.push(
      commandLink(
        t('buttons.acknowledge', lang),
        ['recovery', 'acknowledge', '--incident', incident.id],
        S.btnAlt
      )
    );
  }
  if (incident.kind === 'missed' && incident.proposal?.mode === 'runOnce') {
    actions.push(
      commandLink(t('buttons.recoverRun', lang), [
        'recovery',
        'preview',
        '--incident',
        incident.id,
        '--mode',
        'runOnce',
      ])
    );
    actions.push(
      commandLink(
        t('buttons.recoverSkip', lang),
        ['recovery', 'preview', '--incident', incident.id, '--mode', 'skip'],
        S.btnAlt
      )
    );
  }
  if (incident.runId) {
    actions.push(
      commandLink(
        t('buttons.inspect', lang),
        ['instance', 'inspect', '--id', incident.runId],
        S.btnAlt
      )
    );
  }
  const target = incident.scheduleId || incident.runId || incident.definitionId || '';
  const range = incident.range
    ? `${formatUtc(incident.range.from)} → ${formatUtc(incident.range.to)}`
    : '—';
  return [
    `${escapeHtml(incident.id)}<br><span style="${S.muted}">${escapeHtml(target)} · ${escapeHtml(t(`incidentStatus.${incident.status}`, lang))}</span>`,
    `${escapeHtml(t(`causes.${incident.cause}`, lang))}${incident.policy ? `<br><span style="${S.muted}">${escapeHtml(incident.policy)}</span>` : ''}`,
    escapeHtml(range),
    escapeHtml(String(incident.count)),
    actions.join(''),
  ];
}

/**
 * Incidents view.
 *
 * @param {number} page Page.
 * @param {string} lang Locale.
 * @returns {string} HTML.
 */
function renderIncidents(page, lang) {
  const paged = paginate(openIncidents(), page);
  return [
    `<h2 style="${S.h2}">${escapeHtml(t('dashboard.views.incidents', lang))}</h2>`,
    paged.items.length
      ? table(
          incidentHeadings(lang),
          paged.items.map((i) => incidentRow(i, lang))
        )
      : `<p style="${S.p}">${escapeHtml(t('dashboard.noIncidents', lang))}</p>`,
    pager('incidents', paged, lang),
  ].join('');
}

/**
 * History view: recent finished runs.
 *
 * @param {number} page Page.
 * @param {string} lang Locale.
 * @returns {string} HTML.
 */
function renderHistory(page, lang) {
  const items = [...getState().history].reverse();
  const paged = paginate(items, page);
  const rows = paged.items.map((h) => [
    `${escapeHtml(h.id)}<br><span style="${S.muted}">${escapeHtml(h.definitionId)} r${h.revision}</span>`,
    `${escapeHtml(t(`statuses.${h.status}`, lang))}${h.error ? `<br><span style="${S.muted}">${escapeHtml(truncate(t(`runErrors.${h.error.reason}`, lang, h.error.vars || {}), 120))}${h.error.stepId ? ` @ ${escapeHtml(h.error.stepId)}` : ''}</span>` : ''}`,
    escapeHtml(formatUtc(h.completedAt)),
    escapeHtml(formatDuration(h.durationMs)),
    escapeHtml(
      `${h.effects}${h.uncertain ? ` / ${t('dashboard.uncertain', lang, { count: h.uncertain })}` : ''}`
    ),
    commandLink(t('buttons.rerun', lang), ['instance', 'rerun', '--id', h.id], S.btnAlt),
  ]);
  return [
    `<h2 style="${S.h2}">${escapeHtml(t('dashboard.views.history', lang))}</h2>`,
    rows.length
      ? table(
          [
            t('dashboard.cols.run', lang),
            t('dashboard.cols.status', lang),
            t('dashboard.cols.finished', lang),
            t('dashboard.cols.duration', lang),
            t('dashboard.cols.effects', lang),
            '',
          ],
          rows
        )
      : `<p style="${S.p}">${escapeHtml(t('dashboard.noHistory', lang))}</p>`,
    pager('history', paged, lang),
  ].join('');
}

/**
 * Integrations and diagnostics view.
 *
 * @param {number} page Page.
 * @param {string} lang Locale.
 * @returns {string} HTML.
 */
function renderIntegrations(page, lang) {
  const adapters = listAdapters().map((a) => [
    escapeHtml(a.name),
    escapeHtml(String(a.version || '')),
    escapeHtml(Object.keys(a.actions).join(', ')),
    escapeHtml(formatUtc(a.registeredAt)),
  ]);
  const stats = runtime.scheduler?.stats() || {};
  const s = getState();
  const diag = [
    ['jobs', stats.jobs],
    ['stale', stats.stale],
    ['next', stats.nextDueAt ? formatUtc(stats.nextDueAt) : '—'],
    ['armed', stats.armed ? 'yes' : 'no'],
    ['drains', stats.drains],
    ['yields', stats.yields],
    ['maxDrainMs', stats.maxDrainMs],
    ['clockJumps', stats.clockJumps],
    ['stateKb', Math.round(stateSize() / 1024)],
    ['boot', `${s.boot.id} (${formatUtc(s.boot.at)})`],
    ['admitted', s.stats.admitted],
    ['suppressed', s.stats.suppressed],
    ['dropped', s.stats.dropped],
    ['coalesced', s.stats.coalesced],
  ].map(([k, v]) => [escapeHtml(t(`dashboard.diag.${k}`, lang)), escapeHtml(String(v ?? '—'))]);
  return [
    `<h2 style="${S.h2}">${escapeHtml(t('dashboard.views.integrations', lang))}</h2>`,
    adapters.length
      ? table(
          [
            t('dashboard.cols.adapter', lang),
            t('dashboard.cols.version', lang),
            t('dashboard.cols.actions', lang),
            t('dashboard.cols.registered', lang),
          ],
          adapters
        )
      : `<p style="${S.p}">${escapeHtml(t('dashboard.noAdapters', lang))}</p>`,
    `<h2 style="${S.h2}">${escapeHtml(t('dashboard.diagnostics', lang))}</h2>`,
    table([t('dashboard.cols.item', lang), t('dashboard.cols.value', lang)], diag),
  ].join('');
}

/**
 * Renders the player view: only definitions published to players and the
 * status of their runs. Never GM rows hidden with styling.
 *
 * @returns {string} HTML.
 */
export function renderPlayerView() {
  const lang = getConfig().language;
  const published = listRecords().filter(
    (r) => r.enabled && getSnapshot(r.id)?.access?.mode === 'players'
  );
  const rows = published.map((r) => {
    const def = getSnapshot(r.id);
    return [
      escapeHtml(truncate(def.name, 60)),
      escapeHtml(truncate(def.description || '', 160)),
      commandLink(t('buttons.start', lang), ['instance', 'start', '--definition', r.id]),
    ];
  });
  const runs = listInstances(
    (i) =>
      ACTIVE_STATUSES.has(i.status) &&
      i.authority === 'initiator' &&
      getSnapshot(i.definitionId, i.definitionRevision)?.access?.mode === 'players'
  ).map((i) => [
    escapeHtml(i.id),
    escapeHtml(truncate(i.name, 60)),
    escapeHtml(t(`statuses.${i.status}`, lang)),
  ]);
  return [
    `<div style="${S.outer}">`,
    `<div style="${S.header}"><h1 style="${S.h1}">${escapeHtml(t('dashboard.playerTitle', lang))}</h1>`,
    `<p style="${S.sub}">${escapeHtml(t('dashboard.generated', lang, { at: formatUtc(now()), version: SCRIPT_VERSION }))}</p></div>`,
    rows.length
      ? table([t('dashboard.cols.task', lang), t('dashboard.cols.description', lang), ''], rows)
      : `<p style="${S.p}">${escapeHtml(t('dashboard.noPlayerTasks', lang))}</p>`,
    runs.length
      ? `<h2 style="${S.h2}">${escapeHtml(t('dashboard.activeRuns', lang))}</h2>${table([t('dashboard.cols.run', lang), t('dashboard.cols.task', lang), t('dashboard.cols.status', lang)], runs)}`
      : '',
    '</div>',
  ].join('');
}

/**
 * Returns the dashboard handout, creating it GM-only when missing. A
 * deleted handout is recreated at most once a minute.
 *
 * @returns {object|null} Handout.
 */
export function ensureDashboard() {
  const s = getState();
  let handout = s.dashboard.handoutId ? getObject('handout', s.dashboard.handoutId) : null;
  if (!handout) {
    handout = findObjects({ _type: 'handout', name: HANDOUT_DASHBOARD_NAME })[0] || null;
  }
  if (!handout) {
    const recreating = Boolean(s.dashboard.handoutId);
    // Recreate a deleted dashboard at most once a minute, so a GM deleting
    // it repeatedly does not start a create/delete loop.
    if (recreating && now() - s.dashboard.recreatedAt < TIMING.recreateHandoutMs) {
      schedule({
        kind: JOB.DASHBOARD,
        dueAt: s.dashboard.recreatedAt + TIMING.recreateHandoutMs,
        key: 'dashboard',
      });
      return null;
    }
    handout = createObject('handout', {
      name: HANDOUT_DASHBOARD_NAME,
      inplayerjournals: '',
      controlledby: '',
      archived: false,
    });
    if (recreating) {
      s.dashboard.recreatedAt = now();
    }
    s.dashboard.lastHash = null;
  }
  s.dashboard.handoutId = handout?.id || null;
  return handout;
}

/**
 * Checks that the dashboard is still GM-only. Permission drift stops
 * sensitive writes until the GM repairs it.
 *
 * @param {object} handout Handout.
 * @returns {boolean} True when private.
 */
function isPrivate(handout) {
  const journals = String(handout.get('inplayerjournals') || '').trim();
  const control = String(handout.get('controlledby') || '').trim();
  const s = getState();
  if (journals || control) {
    if (!s.dashboard.drift) {
      s.dashboard.drift = { at: now(), journals, control };
      noticeGm('drift', t('notices.drift', getConfig().language));
    }
    return false;
  }
  s.dashboard.drift = null;
  return true;
}

/**
 * Removes player access from the dashboard after drift (GM command).
 *
 * @returns {boolean} True when repaired.
 */
export function repairDashboard() {
  const handout = ensureDashboard();
  if (!handout) {
    return false;
  }
  handout.set({ inplayerjournals: '', controlledby: '' });
  getState().dashboard.drift = null;
  // Content may be stale after the drift: write it again.
  getState().dashboard.lastHash = null;
  markDirty('repair');
  return true;
}

/**
 * Marks the dashboard dirty. One job writes it: no sooner than the
 * coalescing delay, no sooner than two seconds after the last write, and
 * no later than five seconds after it first became dirty under normal load.
 *
 * @returns {void}
 */
export function markDirty() {
  if (!runtime.ready || runtime.disabled) {
    return;
  }
  const s = getState();
  const at = now();
  if (memory.dirtySince === null) {
    memory.dirtySince = at;
  }
  const earliest = Math.max(
    at + TIMING.dashboardCoalesceMs,
    (s.dashboard.lastWriteAt || 0) + TIMING.dashboardSpacingMs
  );
  const latest = Math.max(
    memory.dirtySince + TIMING.dashboardMaxDirtyMs,
    (s.dashboard.lastWriteAt || 0) + TIMING.dashboardSpacingMs
  );
  const dueAt = Math.min(earliest, latest);
  const existing = runtime.scheduler?.getKey('dashboard');
  if (existing && existing.dueAt <= dueAt) {
    return;
  }
  schedule({ kind: JOB.DASHBOARD, dueAt, key: 'dashboard' });
}

/**
 * Writes the dashboard (and player view) when content changed.
 *
 * @param {{force?: boolean}} [options] Write even when the hash matches.
 * @returns {void}
 */
export function flushDashboard({ force = false } = {}) {
  const s = getState();
  memory.dirtySince = null;
  memory.generation += 1;
  const handout = ensureDashboard();
  if (!handout) {
    return;
  }
  if (!isPrivate(handout)) {
    return;
  }
  const html = renderDashboard(s.dashboard.view, s.dashboard.page);
  const hash = hashText(html.replace(/Generated [^<]*/, ''));
  if (force || hash !== s.dashboard.lastHash) {
    handout.set('notes', html);
    s.dashboard.lastHash = hash;
    s.dashboard.lastWriteAt = now();
  }
  if (getConfig().playerView) {
    writePlayerView();
  }
}

/**
 * Writes the player view handout, visible to the players tasks are published to.
 *
 * @returns {void}
 */
function writePlayerView() {
  const s = getState();
  let handout = s.dashboard.playerHandoutId
    ? getObject('handout', s.dashboard.playerHandoutId)
    : null;
  if (!handout) {
    handout =
      findObjects({ _type: 'handout', name: HANDOUT_PLAYER_NAME })[0] ||
      createObject('handout', {
        name: HANDOUT_PLAYER_NAME,
        inplayerjournals: '',
        controlledby: '',
      });
    s.dashboard.playerHandoutId = handout?.id || null;
  }
  if (!handout) {
    return;
  }
  const players = new Set();
  for (const record of listRecords()) {
    const access = getSnapshot(record.id)?.access;
    if (record.enabled && access?.mode === 'players') {
      for (const p of access.players || []) {
        players.add(p);
      }
    }
  }
  const journals = players.has('all') ? 'all' : [...players].join(',');
  if (handout.get('inplayerjournals') !== journals) {
    handout.set('inplayerjournals', journals);
  }
  const html = renderPlayerView();
  const hash = hashText(html.replace(/Generated [^<]*/, ''));
  if (hash !== s.dashboard.playerHash) {
    handout.set('notes', html);
    s.dashboard.playerHash = hash;
  }
}

/**
 * Handles a deleted handout: the dashboard is recreated on the next write.
 *
 * @param {object} obj Destroyed handout.
 * @returns {void}
 */
export function onHandoutDestroyed(obj) {
  const s = getState();
  if (obj.id === s.dashboard.handoutId) {
    logLine('dashboard handout deleted; it will be recreated');
    s.dashboard.lastHash = null;
    markDirty();
  }
  if (obj.id === s.dashboard.playerHandoutId) {
    s.dashboard.playerHandoutId = null;
  }
}

/**
 * Changes the shared dashboard view.
 *
 * @param {string} view View.
 * @param {number} page Page.
 * @returns {boolean} True when the view exists.
 */
export function setView(view, page = 1) {
  if (!DASHBOARD_VIEWS.includes(view)) {
    return false;
  }
  const s = getState();
  s.dashboard.view = view;
  s.dashboard.page = Math.max(1, page);
  markDirty();
  return true;
}

/**
 * Returns a link to open the dashboard handout from chat.
 *
 * @returns {string|null} URL.
 */
export function dashboardUrl() {
  const id = getState().dashboard.handoutId;
  return id ? `http://journal.roll20.net/handout/${id}` : null;
}

/**
 * Whispers a short, rate-limited notice to the GM with a dashboard link.
 * Routine history stays in the dashboard; chat stays quiet.
 *
 * @param {string} kind Notice kind (one per kind per minute).
 * @param {string} text Text.
 * @returns {void}
 */
export function noticeGm(kind, text) {
  const at = now();
  const last = memory.notices.get(kind) || 0;
  if (at - last < TIMING.recoverySummaryMs) {
    return;
  }
  memory.notices.set(kind, at);
  const url = dashboardUrl();
  const link = url
    ? ` <a href="${escapeHtml(url)}" style="${S.btnAlt}">${escapeHtml(t('buttons.dashboard', getConfig().language))}</a>`
    : '';
  whisper(null, SCRIPT_NAME, `<div>${escapeHtml(text)}${link}</div>`);
}

/**
 * Registers the dashboard job handler.
 *
 * @returns {void}
 */
export function registerDashboardJobs() {
  onJob(JOB.DASHBOARD, () => flushDashboard());
}
