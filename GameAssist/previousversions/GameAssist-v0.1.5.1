/*
========================================
GameAssist - Roll20 API Script
Version: 0.1.5.1
Last Updated: 2026-07-19 (America/New_York)
Development line: configurable campaign timezone v0.1.5.1.
Author: Mord Eagle
License: MIT for original GameAssist code; see LICENSE and ATTRIBUTIONS.md
Homepage: https://github.com/Mord-Eagle/GameAssist

DESCRIPTION
GameAssist is a modular D&D 5E (2014) automation suite with an explicit opt-in
task queue, state/configuration helpers, consistent logging, and a core marker
service. Normal event handlers execute directly unless a module deliberately
calls GameAssist.enqueue(). This package ships with eight configurable modules:
- ConfigUI - GM-only chat controls for toggling modules and common options.
- CritFumble - Detects natural-1 attacks and offers fumble/confirm menus.
- ConditionAssist 1.0.1 - Provides condition wording, artwork, announcements, and marker controls.
- TokenAssist 1.0.1 - Provides general token controls through !token-assist and !ta commands.
- ConcentrationTracker - Runs concentration checks and manages its configured marker.
- NPCManager 1.3.0 - Tracks NPC death markers, history, reports, audits, repair previews, and Arc rosters.
- NPCHPRoller - Rolls npc_hpformula and writes the result to token bar 1.
- DebugTools 0.2.0 - Optional dry-run-first GM diagnostics.

INSTALL / USAGE
- One-Click: install GameAssist.
- Manual (Pro): paste this entire file into the Mod (API) Scripts editor and save.
- MarkerService is enabled by default and can be disabled without turning off
  GameAssist modules that do not use marker behavior.

CORE COMMANDS (GM)
- !ga-config list
- !ga-config modules
- !ga-config set <ModuleOrService> key=value
- !ga-config get <ModuleOrService> key
- !ga-config ui / !ga-config-ui
- !ga-enable <ModuleOrService> / !ga-disable <ModuleOrService>
- !ga-status [--details]
- !ga-timezone [set <IANA timezone>|clear]
- !ga-debug <action>

MODULE COMMANDS
- CritFumble: !critfail, !critfumble help, !critfumble menu,
  !critfumble-<melee|ranged|thrown|spell|natural>,
  !confirm-crit-martial, !confirm-crit-magic
- ConditionAssist: !condition, !condition status, !cond-<condition>, !condition announce, !c-a, !cond-!, !condition help, !condition config,
  !condition add|remove|toggle <condition...>
- TokenAssist: !token-assist, !ta, !ta-<action>, !token-assist help|about|config;
  older supported !token-mod macros continue temporarily and must be updated before v0.2.0.
- ConcentrationTracker: !concentration, !cc, !ga-conc-status
- NPCManager: !npc-death-help, !npc-death-report, !npc-death-buckets,
  !npc-death-clear, !npc-death-write, !npc-wr, !npc-death-audit, !npc-death-repair,
  !npc-death-arc
- NPCHPRoller: !npc-hp-selected, !npc-hp-all
- DebugTools: !ga-debug damage|marker|save

V0.1.5.1 FOUNDATION
- [GAMEASSIST:CORE:MARKERSERVICE] is the single GameAssist authority for marker
  resolution, reads, writes, toggles, duplicate handling, and change observation.
- Built-in ids, custom display names, exact stored tags, numbered markers, and
  unrelated marker entries are preserved through a structured mutation contract.
- NPCManager, ConcentrationTracker, and DebugTools use GameAssist.MarkerService.
- Marker-dependent GameAssist modules no longer depend on standalone TokenMod.
- ConditionAssist uses MarkerService for condition reads, writes, and change observation.
- TokenAssist uses MarkerService for every status-marker command.
- Disabling MarkerService also disables ConditionAssist, TokenAssist, NPCManager,
  ConcentrationTracker, and DebugTools while CritFumble, ConfigUI, and
  NPCHPRoller remain available.
- Human-facing times and automatic Session date rollover use the DM's validated
  IANA timezone when configured; stored event timestamps remain absolute.
- Queue timeouts release the queue but cannot terminate Roll20 operations.
- Configuration snapshots contain configuration only, never runtime caches.

COMPATIBILITY / FOOTPRINT
- Namespaced under global GameAssist only.
- Does not override Roll20 global on/off handlers.
- Writes only to Roll20 objects documented in script.json.
- Standalone scripts that also change the same markers may still compete for
  ownership even though TokenMod is no longer required by GameAssist.

SUPPORT
Use !ga-status for system health and !ga-config list for a configuration snapshot.
For bug reports, include the relevant GameAssist chat output and sandbox console error.
========================================
*/

// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST"
//   project_version: "v0.1.5.1"
//   purpose: "Roll20 API modular kernel and bundled modules with MECHSUITS v1.5.2 contracts, explicit opt-in queue execution, state self-healing, dependency diagnostics, one toggleable marker authority, integrated condition guidance, general token controls, and a validated campaign timezone for human-facing dates. Non-goals: fallback dispatch to standalone TokenMod/StatusInfo, implicit event queueing, or transport changes beyond Roll20 chat API."
//   order: ["policy","app.utils","core.queue","core.compat","core.state","core.markerservice","core.object","interfaces.events","interfaces.commands","modules.configui","modules.critfumble","modules.conditionassist","modules.tokenassist","modules.npcmanager","modules.concentrationtracker","modules.npchproller","modules.debugtools","bootstrap"]
//   env:
//     required: []
//     optional: []
//     secrets: []
//   data_class: "Internal"
//   ai_data: "internal_redacted"
//   refusals:
//     - "Do not emit secrets or player data outside the Roll20 sandbox."
//     - "Do not override Roll20 global on/off handlers."
//   observability:
//     logs: "roll20_whisper_to_gm"
//     metrics: [{ name: "gameassist.queue.task_duration_ms", unit: "ms" }]
//     spans: ["[GAMEASSIST:CORE:QUEUE]","[GAMEASSIST:CORE:MARKERSERVICE]","[GAMEASSIST:MODULES:CRITFUMBLE]"]
//   performance: { notes: "No current benchmark claim; validate in the target Roll20 campaign sandbox." }
//   concurrency: { model: "Direct event handlers plus explicit opt-in serialized task queue", idempotency: "N/A (event-driven)" }
//   compatibility: { accepts: ["Roll20 API sandbox; current campaign smoke test required"], emits: "Roll20 chat whispers/logs" }
//   policy: { notes_ref: "[GAMEASSIST:POLICY]" }
//   error_codes: ["INVALID_ARGUMENT","NOT_FOUND","CONFLICT","UNAUTHORIZED","FORBIDDEN","UNPROCESSABLE","RATE_LIMITED","TIMEOUT","UNAVAILABLE","INTERNAL"]
//   transport_map:
//     chat: "Errors are whispered to GM; status/info are whispered as structured text"
//   canonical_tree: |
//     [GAMEASSIST]/
//     ├─ [GAMEASSIST:POLICY]
//     ├─ [GAMEASSIST:APP]
//     │  └─ [GAMEASSIST:APP:UTILS]
//     ├─ [GAMEASSIST:CORE]
//     │  ├─ [GAMEASSIST:CORE:QUEUE]
//     │  ├─ [GAMEASSIST:CORE:COMPAT]
//     │  ├─ [GAMEASSIST:CORE:STATE]
//     │  ├─ [GAMEASSIST:CORE:MARKERSERVICE]
//     │  └─ [GAMEASSIST:CORE:OBJECT]
//     ├─ [GAMEASSIST:INTERFACES]
//     │  ├─ [GAMEASSIST:INTERFACES:EVENTS]
//     │  └─ [GAMEASSIST:INTERFACES:COMMANDS]
//     ├─ [GAMEASSIST:MODULES]
//     │  ├─ [GAMEASSIST:MODULES:CONFIGUI]
//     │  ├─ [GAMEASSIST:MODULES:CRITFUMBLE]
//     │  ├─ [GAMEASSIST:MODULES:CONDITIONASSIST]
//     │  ├─ [GAMEASSIST:MODULES:TOKENASSIST]
//     │  ├─ [GAMEASSIST:MODULES:NPCMANAGER]
//     │  ├─ [GAMEASSIST:MODULES:CONCENTRATIONTRACKER]
//     │  ├─ [GAMEASSIST:MODULES:NPCHPROLLER]
//     │  └─ [GAMEASSIST:MODULES:DEBUGTOOLS]
//     └─ [GAMEASSIST:BOOTSTRAP]
// --- prose banner ---
// Guarantee: GameAssist v0.1.5.1 runs policy, utilities, guarded core services including MarkerService, interfaces, independently lifecycle-managed condition/token/gameplay modules, then bootstrap in the declared order. Human-facing times use the validated campaign timezone while stored instants remain absolute. Secrets required: none. It refuses to emit player data outside Roll20 or override Roll20 global on/off handlers.

// =============================
// === GameAssist v0.1.5.1 ===
// === Author: Mord Eagle ===
// =============================
// Released under the MIT License (see https://opensource.org/licenses/MIT)
//
// Copyright (c) 2025 Mord Eagle
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

(() => {
    'use strict';

    const R20_ON = (typeof on === 'function') ? on : (typeof globalThis?.on === 'function' ? globalThis.on : null);
    if (!R20_ON) throw new Error('Roll20 "on" is unavailable.');

    // =============================================================================
    // [GAMEASSIST:POLICY] BEGIN
    // Section Title: Tunables and operational policy
    // -------------------------------------------------------------------------
    // mechsuit_section: { codename: "GAMEASSIST", area: "POLICY", title: "Tunables",
    //   guarantees: ["Shared behavioral knobs and snapshot identifiers have one owner; NPC initialization, timezone input, and condition-service limits remain explicit"],
    //   provides: ["POLICY"], last_updated_version: "v0.1.5.1", lifecycle: "active" }
    // -------------------------------------------------------------------------
    // Narrative
    // POLICY owns shared timeouts, cache limits, UI defaults, snapshot identifiers,
    // and declared metric names.
    // Values preserve v0.1.4 behavior; callers reference POLICY so future
    // changes have one explicit review and rollback point.
    // -------------------------------------------------------------------------
    const POLICY = Object.freeze({
        queue: Object.freeze({
            defaultTimeoutMs: 30000,
            watchdogIntervalMs: 15000,
            watchdogMultiplier: 2
        }),
        metrics: Object.freeze({
            historyLimit: 50,
            durationLimit: 20,
            queueDurationName: 'gameassist.queue.task_duration_ms'
        }),
        runtime: Object.freeze({
            activePlayerLimit: 50,
            deathLogLimit: 100,
            npcAuditDetailLimit: 8,
            deathReportSummaryLimit: 5,
            deathReportDetailLimit: 10,
            npcHpInitializationGraceMs: 2000,
            lastDamageLimit: 50
        }),
        timestamps: Object.freeze({
            maxFutureMs: 1000 * 60 * 60 * 24 * 7,
            maxTimeZoneLength: 100,
            formatterCacheLimit: 32,
            locale: 'en-US',
            commonTimeZones: Object.freeze([
                Object.freeze({ label: 'US Eastern', value: 'America/New_York' }),
                Object.freeze({ label: 'US Central', value: 'America/Chicago' }),
                Object.freeze({ label: 'US Mountain', value: 'America/Denver' }),
                Object.freeze({ label: 'US Pacific', value: 'America/Los_Angeles' }),
                Object.freeze({ label: 'UTC', value: 'UTC' }),
                Object.freeze({ label: 'London', value: 'Europe/London' }),
                Object.freeze({ label: 'Paris', value: 'Europe/Paris' }),
                Object.freeze({ label: 'Sydney', value: 'Australia/Sydney' })
            ])
        }),
        configUi: Object.freeze({
            pageSize: 3
        }),
        critFumble: Object.freeze({
            rollDelayMs: 200
        }),
        conditions: Object.freeze({
            maxDefinitions: 100,
            maxNameLength: 80,
            maxDescriptionLength: 4000,
            maxMarkerLength: 200,
            maxImportLength: 100000,
            recentDescriptionMs: 1000,
            announcementMutationSuppressionMs: 5000,
            announcementGrantMs: 1000 * 60 * 10,
            announcementGrantLimit: 50,
            maxAnnouncementTokens: 12,
            statusChatLimit: 20
        }),
        config: Object.freeze({
            unsafeKeys: Object.freeze(['__proto__', 'prototype', 'constructor'])
        }),
        snapshots: Object.freeze({
            configFormat: 'gameassist-config-snapshot',
            configSchemaVersion: 1
        })
    });
    // --- Notes & Comments ---
    // Changed (v0.1.5.1): Added bounded IANA timezone input, a bounded formatter cache, a stable display locale, and common GM menu choices; rollback: remove timestamps timezone fields and restore sandbox-only formatting.
    // Decision log:
    //   CHOICE: Offer common IANA zones plus validated custom input - ALT: fixed numeric offsets; REJECTED: fixed offsets do not follow daylight-saving changes.
    //   CHOICE: Keep NPC initialization and snapshot knobs centralized while removing the unused external marker delay - ALT: retain the dead setting; REJECTED: implied behavior no caller performs.
    // Prior notes:
    //   v0.1.5.0: Removed the obsolete standalone TokenMod verification delay and added bounded condition-definition, import, announcement-selection, private-reference, announcement-observer suppression, and current-page status limits for ConditionAssist.
    //   v0.1.4.7: Added a two-second NPC HP initialization grace period so auto-roll-on-add setup is not recorded as a death/revival.
    //   v0.1.4.7: Added a one-second standalone TokenMod marker-verification delay.
    //   v0.1.4.5: Added runtime death-report summary/detail limits for bounded GM-facing history reports.
    //   v0.1.4.4: Added runtime.npcAuditDetailLimit to bound grouped NPC death-audit chat output.
    //   v0.1.4.3: Removed internal development-provenance wording from the narrative; no semantic change.
    //   v0.1.4.2: Added stable configuration-snapshot format and schema identifiers.
    //   v0.1.4.1: Centralized existing defaults without changing their values.
    //   v0.1.3: Added POLICY narrative and corrected top-level version metadata; no semantic change.
    //   v0.1.1.2: Updated MECHSUITS metadata for v1.5.1 compliance; no semantic change.
    //   Existing decisions: version configuration-only exports before import exists; freeze shallow policy groups to prevent hidden runtime drift.
    // [GAMEASSIST:POLICY] END
    // [GAMEASSIST:APP] BEGIN
    // Section Title: App wrapper (utilities and shared helpers)
    // -------------------------------------------------------------------------
    // mechsuit_section: { codename: "GAMEASSIST", area: "APP", title: "Wrapper",
    //   guarantees: ["APP-scoped non-marker helpers are grouped here; marker authority belongs to CORE:MARKERSERVICE"],
    //   depends_on: [], last_updated_version: "v0.1.5.1" }
    // -------------------------------------------------------------------------
    // Narrative
    // The APP tree houses shared helpers used by core services and bundled modules.
    // Utilities below cover argument parsing, state helpers, auditing, sanitization,
    // time, token-character linking, and standalone-script evidence.
    // -------------------------------------------------------------------------

    // ————— UTILITIES —————
    // =============================================================================
    // [GAMEASSIST:APP:UTILS] BEGIN
    // Section Title: Utilities (arg parsing, state helpers, audit, sanitize)
    // -------------------------------------------------------------------------
    // mechsuit_section: { codename: "GAMEASSIST", area: "APP:UTILS", title: "Utilities",
    //   guarantees: ["Shared non-marker helpers; known module state branches self-heal without deleting valid config","Absolute timestamps remain unchanged while human displays and date keys use one validated DM timezone","Standalone-script evidence remains diagnostic rather than a marker dependency"],
    //   depends_on: ["[GAMEASSIST:POLICY]"], last_updated_version: "v0.1.5.1", lifecycle: "active" }
    // -------------------------------------------------------------------------
    // Narrative
    // APP:UTILS collects helpers for metrics/state initialization, conservative state
    // repair, argument parsing, sanitization, time access, token-character linking,
    // and external-script evidence. Marker resolution and mutation now belong only to
    // CORE:MARKERSERVICE.
    // Roll20 does not guarantee a high-resolution monotonic clock, so monotonic()
    // falls back to Date.now() while keeping duration access behind a named seam.
    // -------------------------------------------------------------------------
    function now() {
        return Date.now();
    }

    function monotonic() {
        if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
            return performance.now();
        }
        return Date.now();
    }

    function isoNow() {
        return new Date(now()).toISOString();
    }

    const dateTimeFormatterCache = new Map();

    /**
     * getDateTimeFormatter - Reuse expensive Intl formatters without allowing
     * arbitrary custom timezone input to grow sandbox memory indefinitely.
     */
    function getDateTimeFormatter(key, options) {
        if (dateTimeFormatterCache.has(key)) {
            const formatter = dateTimeFormatterCache.get(key);
            dateTimeFormatterCache.delete(key);
            dateTimeFormatterCache.set(key, formatter);
            return formatter;
        }

        const formatter = new Intl.DateTimeFormat(POLICY.timestamps.locale, options);
        dateTimeFormatterCache.set(key, formatter);
        while (dateTimeFormatterCache.size > POLICY.timestamps.formatterCacheLimit) {
            dateTimeFormatterCache.delete(dateTimeFormatterCache.keys().next().value);
        }
        return formatter;
    }

    function validateTimeZone(raw) {
        if (raw === null || raw === undefined || String(raw).trim() === '') {
            return { ok: true, value: null, requested: null, message: null };
        }
        if (typeof raw !== 'string') {
            return { ok: false, value: null, requested: raw, message: 'Timezone must be an IANA name such as America/New_York.' };
        }

        const requested = raw.trim();
        if (requested.length > POLICY.timestamps.maxTimeZoneLength || !/^[A-Za-z0-9_+\-/]+$/.test(requested)) {
            return { ok: false, value: null, requested, message: 'Timezone must be a valid IANA name such as America/New_York.' };
        }
        if (typeof Intl !== 'object' || typeof Intl.DateTimeFormat !== 'function') {
            return { ok: false, value: null, requested, message: 'This Roll20 sandbox cannot format named timezones; GameAssist will continue using sandbox time.' };
        }

        try {
            const formatter = getDateTimeFormatter(
                `validation|${POLICY.timestamps.locale}|${requested}`,
                { timeZone: requested }
            );
            if (typeof formatter.formatToParts !== 'function') {
                return { ok: false, value: null, requested, message: 'This Roll20 sandbox cannot format named timezones; GameAssist will continue using sandbox time.' };
            }
            formatter.format(new Date(0));
            return {
                ok: true,
                value: formatter.resolvedOptions().timeZone || requested,
                requested,
                message: null
            };
        } catch (error) {
            return { ok: false, value: null, requested, message: `Timezone "${requested}" is not recognized by this Roll20 sandbox.` };
        }
    }

    function getTimeZoneInfo() {
        const root = (typeof state === 'object' && state) ? state[STATE_KEY] : null;
        const configured = root?.config?.timezone ?? null;
        const validation = validateTimeZone(configured);
        if (validation.ok && validation.value) {
            return {
                configured: validation.value,
                active: validation.value,
                label: validation.value,
                fallback: false,
                warning: null
            };
        }
        return {
            configured,
            active: null,
            label: 'Sandbox default',
            fallback: true,
            warning: validation.ok ? null : validation.message
        };
    }

    function dateParts(raw, timeZone = null, hour12 = true) {
        const date = raw instanceof Date ? raw : new Date(raw);
        if (!Number.isFinite(date.getTime())) return null;
        if (timeZone && typeof Intl === 'object' && typeof Intl.DateTimeFormat === 'function') {
            const options = {
                timeZone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            };
            if (hour12) options.hour12 = true;
            else options.hourCycle = 'h23';
            const formatter = getDateTimeFormatter(
                `parts|${POLICY.timestamps.locale}|${timeZone}|${hour12 ? 'h12' : 'h23'}`,
                options
            );
            const parts = {};
            formatter.formatToParts(date).forEach(part => {
                if (part.type !== 'literal') parts[part.type] = part.value;
            });
            if (!hour12 && parts.hour === '24') parts.hour = '00';
            parts.date = date;
            return parts;
        }

        const hours = date.getHours();
        return {
            year: String(date.getFullYear()),
            month: String(date.getMonth() + 1).padStart(2, '0'),
            day: String(date.getDate()).padStart(2, '0'),
            hour: hour12 ? String((hours % 12) || 12).padStart(2, '0') : String(hours).padStart(2, '0'),
            minute: String(date.getMinutes()).padStart(2, '0'),
            second: String(date.getSeconds()).padStart(2, '0'),
            dayPeriod: hour12 ? (hours >= 12 ? 'PM' : 'AM') : '',
            date
        };
    }

    function timeZoneOffset(raw, timeZone = null) {
        const date = raw instanceof Date ? raw : new Date(raw);
        if (!Number.isFinite(date.getTime())) return '+0000';
        let minutes;
        if (timeZone) {
            const parts = dateParts(date, timeZone, false);
            if (!parts) return '+0000';
            const utcLike = Date.UTC(
                Number(parts.year),
                Number(parts.month) - 1,
                Number(parts.day),
                Number(parts.hour),
                Number(parts.minute),
                Number(parts.second)
            );
            const roundedEpoch = Math.floor(date.getTime() / 1000) * 1000;
            minutes = Math.round((utcLike - roundedEpoch) / 60000);
        } else {
            minutes = -date.getTimezoneOffset();
        }
        const sign = minutes < 0 ? '-' : '+';
        const absolute = Math.abs(minutes);
        return `${sign}${String(Math.floor(absolute / 60)).padStart(2, '0')}${String(absolute % 60).padStart(2, '0')}`;
    }

    function localNow(raw = now()) {
        const info = getTimeZoneInfo();
        const parts = dateParts(raw, info.active, true);
        if (!parts) return 'Invalid time';
        return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second} ${parts.dayPeriod} ${timeZoneOffset(parts.date, info.active)}`.trim();
    }

    function localTime(raw = now()) {
        const info = getTimeZoneInfo();
        const parts = dateParts(raw, info.active, true);
        if (!parts) return 'Invalid time';
        return `${parts.hour}:${parts.minute}:${parts.second} ${parts.dayPeriod}`.trim();
    }

    function localDateKey(raw = now()) {
        const info = getTimeZoneInfo();
        const parts = dateParts(raw, info.active, false);
        return parts ? `${parts.year}-${parts.month}-${parts.day}` : new Date(raw).toISOString().slice(0, 10);
    }

    function displayStoredTime(timestamp, fallback = 'time unknown') {
        if (timestamp !== null && timestamp !== undefined && timestamp !== '') {
            const parsed = new Date(timestamp);
            if (Number.isFinite(parsed.getTime())) return localNow(parsed);
        }
        return fallback || 'time unknown';
    }

    function createMetricsStore() {
        return {
            totals: {},
            history: [],
            durations: [],
            sessionStart: isoNow(),
            lastUpdate: null
        };
    }

    function ensureStateRoot() {
        const current = state[STATE_KEY];
        const root = (current && typeof current === 'object' && !Array.isArray(current))
            ? current
            : {};

        if (!root.config || typeof root.config !== 'object') {
            root.config = {};
        }
        if (!Object.prototype.hasOwnProperty.call(root.config, 'timezone')) {
            root.config.timezone = null;
        }

        if (!root.metrics || typeof root.metrics !== 'object') {
            root.metrics = createMetricsStore();
        } else {
            root.metrics.totals = root.metrics.totals || {};
            root.metrics.history = Array.isArray(root.metrics.history) ? root.metrics.history : [];
            root.metrics.durations = Array.isArray(root.metrics.durations) ? root.metrics.durations : [];
            if (!root.metrics.sessionStart) {
                root.metrics.sessionStart = isoNow();
            }
        }

        state[STATE_KEY] = root;
        return root;
    }

    function getMetricsStore() {
        return ensureStateRoot().metrics;
    }

    function resetMetricsStore() {
        const root = ensureStateRoot();
        root.metrics = createMetricsStore();
        return root.metrics;
    }

    function _parseArgs(content) {
        // CHOICE: A following --name begins a new flag; it is never consumed as the prior flag's value.
        const args = {}, pattern = /--(\w+)(?:\s+(?!--)("[^"]*"|[^\s]+))?/g;
        let m;
        while ((m = pattern.exec(content))) {
            let v = m[2] || true;
            if (typeof v === 'string') {
                if (/^".*"$/.test(v))      v = v.slice(1, -1);
                else if (/^\d+$/.test(v))  v = parseInt(v, 10);
                else if (/,/.test(v))      v = v.split(',');
            }
            args[m[1]] = v;
        }
        return { cmd: content.split(/\s+/)[0], args };
    }

    function ensureStateBranch(root, mod) {
        const repairs = [];
        let branch = root[mod];

        if (!branch || typeof branch !== 'object' || Array.isArray(branch)) {
            branch = {};
            root[mod] = branch;
            repairs.push('branch');
        }
        if (!branch.config || typeof branch.config !== 'object' || Array.isArray(branch.config)) {
            branch.config = {};
            repairs.push('config');
        }
        if (!branch.runtime || typeof branch.runtime !== 'object' || Array.isArray(branch.runtime)) {
            branch.runtime = {};
            repairs.push('runtime');
        }

        return { branch, repairs };
    }

    function getState(mod) {
        const root = ensureStateRoot();
        return ensureStateBranch(root, mod).branch;
    }

    /**
     * migrateKnownComponentState — Move known pre-release component branches to their final branded names.
     * Inputs: the validated GameAssist state root.
     * Outputs: migration records on the destination runtime branch.
     * Invariants: destination values win; missing valid values are copied; unrelated branches are untouched.
     * Failure: malformed source branches are left for the ordinary state auditor to report.
     * Design: these exact names shipped only in v0.1.5.0 test checkpoints, so they are known migrations rather than unknown-state cleanup.
     */
    function migrateKnownComponentState(root) {
        const mappings = [
            ['ConditionService', 'ConditionAssist'],
            ['TokenService', 'TokenAssist']
        ];
        const isRecord = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

        const copyMissing = (target, source) => {
            Object.entries(source).forEach(([key, value]) => {
                if (!Object.prototype.hasOwnProperty.call(target, key)) {
                    target[key] = value;
                    return;
                }
                const targetValue = target[key];
                if (
                    targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue) &&
                    value && typeof value === 'object' && !Array.isArray(value)
                ) {
                    copyMissing(targetValue, value);
                }
            });
        };

        mappings.forEach(([previousName, currentName]) => {
            const previous = root[previousName];
            if (!isRecord(previous)) return;
            // DANGER: malformed pre-release state must remain visible to the warning-only auditor; do not consume or delete it here.
            if (previous.config !== undefined && !isRecord(previous.config)) return;
            if (previous.runtime !== undefined && !isRecord(previous.runtime)) return;

            const destination = ensureStateBranch(root, currentName).branch;
            copyMissing(destination.config, previous.config || {});
            copyMissing(destination.runtime, previous.runtime || {});
            destination.runtime.brandMigration = {
                from: previousName,
                to: currentName,
                migratedAt: isoNow(),
                sourceRemoved: true
            };
            delete root[previousName];
            recordMetric('state_migration', { mod: currentName, note: `${previousName}->${currentName}` });
        });
    }

    function saveState(mod, data) {
        const root = ensureStateRoot();
        Object.assign(getState(mod), data);
        ensureStateBranch(root, mod);
    }

    function commandMatches(content, prefix, { caseInsensitive = false, mode = 'token' } = {}) {
        const raw = (content || '').trim();
        const pfx = caseInsensitive ? prefix.toLowerCase() : prefix;
        const txt = caseInsensitive ? raw.toLowerCase() : raw;

        if (mode === 'prefix') return txt.startsWith(pfx);
        if (txt === pfx) return true;

        const escaped = pfx.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const boundary = new RegExp(`^${escaped}(\\s|$)`);
        return boundary.test(txt);
    }

    /**
     * getStandaloneScriptEvidence — Inspect public contracts without assuming Roll20's script registry exists.
     * Inputs: the literal upstream script name TokenMod or StatusInfo.
     * Outputs: detected contract/version/config evidence; absence is not automatically proof of missing installation.
     * Design: both supplied upstream scripts intentionally expose these globals for script interoperability.
     */
    function getStandaloneScriptEvidence(name) {
        const requested = String(name || '');
        if (requested === 'TokenMod') {
            const api = (typeof TokenMod !== 'undefined' && TokenMod) ? TokenMod : null;
            const meta = (typeof API_Meta !== 'undefined' && API_Meta?.TokenMod)
                ? API_Meta.TokenMod
                : null;
            return {
                name: requested,
                confirmed: Boolean((api && typeof api.ObserveTokenChange === 'function') || meta),
                contract: Boolean(api && typeof api.ObserveTokenChange === 'function'),
                version: meta?.version ? String(meta.version) : null,
                playersCanUseIds: typeof state?.TokenMod?.playersCanUse_ids === 'boolean'
                    ? state.TokenMod.playersCanUse_ids
                    : null
            };
        }

        if (requested === 'StatusInfo') {
            const api = (typeof StatusInfo !== 'undefined' && StatusInfo) ? StatusInfo : null;
            return {
                name: requested,
                confirmed: Boolean(api && typeof api.ObserveTokenChange === 'function'),
                contract: Boolean(api && typeof api.ObserveTokenChange === 'function'),
                version: api?.version ? String(api.version) : null,
                showDescriptions: typeof state?.STATUSINFO?.config?.showDescOnStatusChange === 'boolean'
                    ? state.STATUSINFO.config.showDescOnStatusChange
                    : null
            };
        }

        return { name: requested, confirmed: false, contract: false, version: null };
    }

    function getStandaloneIntegrationLines() {
        const tokenMod = getStandaloneScriptEvidence('TokenMod');
        const statusInfo = getStandaloneScriptEvidence('StatusInfo');
        const tokenModVersion = tokenMod.version ? ` v${tokenMod.version}` : '';
        const statusInfoVersion = statusInfo.version ? ` v${statusInfo.version}` : '';
        const markerLine = MarkerService.isEnabled()
            ? `MarkerService v${MarkerService.version}: enabled; GameAssist marker reads and writes are available.`
            : `MarkerService v${MarkerService.version}: disabled; marker-dependent GameAssist modules are unavailable.`;
        const tokenModLine = tokenMod.confirmed
            ? `Standalone TokenMod${tokenModVersion}: detected. TokenAssist leaves !token-mod to that script; !token-assist and !ta commands remain available.`
            : 'Standalone TokenMod: not detected; TokenAssist accepts !token-assist, !ta, and temporary older !token-mod syntax when enabled.';
        const statusInfoLine = statusInfo.confirmed
            ? `Standalone StatusInfo${statusInfoVersion}: detected as a separate Mod. Avoid enabling overlapping condition automation.`
            : 'Standalone StatusInfo: not detected.';
        return [markerLine, tokenModLine, statusInfoLine];
    }

    function clearState(mod) {
        const root = ensureStateRoot();
        if (root?.[mod]) delete root[mod];
    }

    function auditState() {
        const root = ensureStateRoot();
        const whitelist = new Set(['config', 'flags', 'metrics']);
        const repaired = [];
        const unknown = [];

        Object.keys(root).forEach(k => {
            if (whitelist.has(k)) return;

            const mod = MODULES[k];
            if (!mod || mod.internal) {
                unknown.push(k);
                GameAssist.log('Core', `Unexpected state branch: ${k}`, 'WARN');
            }
        });

        Object.entries(MODULES)
            .filter(([, mod]) => !mod.internal)
            .forEach(([name]) => {
                if (!Object.prototype.hasOwnProperty.call(root, name)) return;

                const result = ensureStateBranch(root, name);
                if (!result.repairs.length) return;

                repaired.push({ name, fields: result.repairs.slice() });
                GameAssist.log('Core', `Repaired state for ${name}: ${result.repairs.join(', ')}`, 'WARN');
                recordMetric('state_repair', { mod: name, note: result.repairs.join(',') });
            });

        GameAssist._metrics.stateAudits++;
        GameAssist._metrics.lastUpdate = isoNow();
        recordMetric('audit', { noHistory: true });
        return { repaired, unknown };
    }

    function seedDefaults() {
        Object.entries(MODULES).forEach(([name, mod]) => {
            if (mod.internal) return;
            const cfg = getState(name).config;
            if (cfg.enabled === undefined) cfg.enabled = mod.enabled;
        });
    }

    function recordMetric(type, { mod = null, note = '', noHistory = false, duration = null } = {}) {
        if (!type) return;

        const store = getMetricsStore();
        const totals = store.totals;
        totals[type] = (totals[type] || 0) + 1;

        const timestamp = isoNow();
        store.lastUpdate = timestamp;

        if (!noHistory) {
            const entry = { ts: timestamp, type };
            if (mod) entry.mod = mod;
            if (note !== undefined && note !== null) {
                const text = String(note).slice(0, 120);
                if (text) entry.note = text;
            }
            store.history.push(entry);
            if (store.history.length > POLICY.metrics.historyLimit) {
                store.history.splice(0, store.history.length - POLICY.metrics.historyLimit);
            }
        }

        if (typeof duration === 'number' && isFinite(duration)) {
            const durations = store.durations;
            durations.push(Math.max(0, Math.round(duration)));
            if (durations.length > POLICY.metrics.durationLimit) {
                durations.splice(0, durations.length - POLICY.metrics.durationLimit);
            }
        }
    }

    function ensureRuntimeObject(modState) {
        if (!modState || typeof modState !== 'object') {
            return {};
        }

        const runtime = modState.runtime;

        if (!runtime || typeof runtime !== 'object' || Array.isArray(runtime)) {
            modState.runtime = {};
        }

        return modState.runtime;
    }

    function ensureRuntimeKey(runtime, key, kind) {
        if (!runtime || typeof runtime !== 'object') return null;

        const value = runtime[key];
        if (kind === 'array') {
            if (!Array.isArray(value)) runtime[key] = [];
        } else if (kind === 'object') {
            if (!value || typeof value !== 'object' || Array.isArray(value)) runtime[key] = {};
        }

        return runtime[key];
    }

    function ensureModRuntimeKey(modState, key, kind) {
        const runtime = ensureRuntimeObject(modState);
        return ensureRuntimeKey(runtime, key, kind);
    }

    function sanitizeTimestamp(raw, fallback) {
        const current = now();
        const fb = (typeof fallback === 'number' && Number.isFinite(fallback) && fallback >= 0)
            ? fallback
            : current;

        const ts = Number(raw);

        if (!Number.isFinite(ts)) return fb;
        if (ts <= 0) return fb;

        if (ts > current + POLICY.timestamps.maxFutureMs) return fb;

        return Math.floor(ts);
    }

    function _sanitize(str = '') {
        return str.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/'/g, '&#39;')
            .replace(/"/g, '&quot;');
    }

    function getLinkedCharacter(token) {
        if (!token || typeof token.get !== 'function') return null;
        if (token.get('layer') !== 'objects') return null;

        const charId = token.get('represents');
        if (!charId) return null;

        const character = getObj('character', charId);
        if (!character) return null;

        return { token, character };
    }
    // --- Notes & Comments ---
    // NOTE: State auditor warns about unexpected branches; no automatic deletion occurs.
    // Changed (v0.1.5.1): Added validated IANA timezone resolution, bounded formatter reuse, DST-aware human formatting, date-key generation, and legacy-display fallback while preserving stored absolute timestamps.
    // Decision log:
    //   CHOICE: Keep standalone detection as diagnostics only - ALT: use it for marker dependency gating; REJECTED: MarkerService owns GameAssist marker behavior.
    //   CHOICE: Unknown branches remain warning-only; explicit cleanup is required before deletion.
    //   CHOICE: monotonic() falls back to Date.now() in Roll20 - ALT: assume performance.now; REJECTED: sandbox portability.
    //   CHOICE: Validate formatToParts and normalize an h24 midnight result - ALT: accept partial Intl support; REJECTED: a saved setting must not produce an invalid clock or one-day offset.
    //   CHOICE: Reuse formatters through a bounded LRU cache - ALT: construct on every log/UI render; REJECTED: repeated Intl setup adds avoidable Roll20 sandbox overhead.
    // Prior notes:
    //   v0.1.5.0: Moved all marker identity and mutation behavior into CORE:MARKERSERVICE; added exact known-state migration from the unreleased ConditionService/TokenService names to ConditionAssist/TokenAssist; APP utilities retain general helpers and public-contract evidence used for standalone collision diagnostics.
    //   v0.1.4.7: Detected TokenMod/StatusInfo through public contracts and dispatched verified TokenMod --api-as marker requests.
    //   v0.1.4.5: Kept adjacent command flags independent so combined switches execute as displayed.
    //   v0.1.4.3: Resolved configured marker names/tags, fast-pathed exact stored custom tags, and stripped simple matching quote pairs.
    //   v0.1.4.2: Known module state branches self-heal malformed config/runtime containers while preserving valid configuration.
    //   v0.1.4.1: Added wall/monotonic clock seams and routed shared limits through POLICY.
    //   v0.1.4: Added regex command matching and the shared marker helpers now superseded by CORE:MARKERSERVICE.
    //   v0.1.3: Added ensureModRuntimeKey, sanitizeTimestamp, runtime guards, and section narrative.
    //   v0.1.1.2: Aligned section metadata to MECHSUITS v1.5.1.
    //   Marker-resolution decisions retained from v0.1.4.x are recorded in [GAMEASSIST:CORE:MARKERSERVICE].
    // [GAMEASSIST:APP:UTILS] END
    // =============================================================================

    // --- Notes & Comments ---
    // Changed (v0.1.5.1): APP now owns the shared validated timezone and human-facing date/time helpers while continuing to delegate marker ownership to CORE:MARKERSERVICE.
    // Prior notes:
    //   v0.1.5.0: APP explicitly excluded marker ownership and delegated that contract to CORE:MARKERSERVICE.
    //   v0.1.4.7: APP included verified standalone TokenMod requests while preserving StatusInfo observer delivery.
    //   v0.1.4.3: APP included shared exact marker-identity resolution.
    //   v0.1.3: Updated wrapper commentary while preserving explicit nesting over APP:UTILS only; no semantic change.
    //   v0.1.1.2: Relocated the APP wrapper to avoid implied nesting over non-APP sections; no semantic change.
    //   Existing guarantees retained: MIT license, bundled feature modules, queue/watchdog defaults, and GM-whisper logging.
    // [GAMEASSIST:APP] END
    // =============================================================================

    // =============================================================================
    // [GAMEASSIST:CORE] BEGIN
    // Section Title: Core wrapper (constants and kernel services)
    // -------------------------------------------------------------------------
    // mechsuit_section: { codename: "GAMEASSIST", area: "CORE", title: "Core wrapper",
    //   guarantees: ["Core constants and kernel services are grouped; MarkerService is the sole marker authority"],
    //   depends_on: ["[GAMEASSIST:POLICY]","[GAMEASSIST:APP]"], last_updated_version: "v0.1.5.1",
    //   lifecycle: "active" }
    // -------------------------------------------------------------------------
    // Narrative
    // CORE wraps the foundational constants, queue, compatibility checks, state,
    // marker service, and object utilities. Children carry the executable code; this wrapper
    // documents scope and anchors the hierarchy for MECHSUITS compliance.
    // -------------------------------------------------------------------------

    const VERSION      = '0.1.5.1';
    const STATE_KEY    = 'GameAssist';
    const MODULES      = {};
    const _transitioning   = {};
    let   READY        = false;
    const METRIC_HISTORY_LIMIT  = POLICY.metrics.historyLimit;
    const METRIC_DURATION_LIMIT = POLICY.metrics.durationLimit;

    MODULES.Core = {
        internal:    true,
        initFn:      () => {},
        teardown:    null,
        enabled:     true,
        initialized: true,
        active:      true,
        events:      [],
        prefixes:    [],
        wired:       true,
        dependsOn:   []
    };

    // ————— QUEUE + WATCHDOG —————
    // =============================================================================
    // [GAMEASSIST:CORE:QUEUE] BEGIN
    // Section Title: Serialized task queue + watchdog
    // -------------------------------------------------------------------------
    // mechsuit_section: { codename: "GAMEASSIST", area: "CORE:QUEUE", title: "Queue",
    //   guarantees: ["Only explicitly enqueued tasks serialize; stale completions cannot advance the queue"],
    //   depends_on: ["[GAMEASSIST:POLICY]","[GAMEASSIST:APP:UTILS]"],
    //   observability: { metrics: [{ name: "gameassist.queue.task_duration_ms", unit: "ms" }] },
    //   last_updated_version: "v0.1.4.2", lifecycle: "active" }
    // -------------------------------------------------------------------------
    // Narrative
    // CORE:QUEUE serializes only tasks explicitly submitted through internal _enqueue
    // or public GameAssist.enqueue. Normal command/event handlers execute directly.
    // A timeout releases the queue but cannot cancel underlying JavaScript or Roll20 work.
    // -------------------------------------------------------------------------
    let _busy      = false;
    let _lastStart = 0;
    let _jobId     = 0;
    const _queue            = [];
    const DEFAULT_TIMEOUT   = POLICY.queue.defaultTimeoutMs;
    const WATCHDOG_INTERVAL = POLICY.queue.watchdogIntervalMs;

    function _enqueue(task, priority = 0, timeout = DEFAULT_TIMEOUT) {
        _queue.push({ task, priority, enqueuedAt: monotonic(), timeout });
        _queue.sort((a,b) => b.priority - a.priority || a.enqueuedAt - b.enqueuedAt);
        _runNext();
    }

    function _runNext() {
        if (_busy || !_queue.length) return;

        const job = _queue.shift();
        const myId = ++_jobId;
        _busy = true;
        _lastStart = monotonic();

        let timedOut = false;

        const timer = setTimeout(() => {
            if (myId !== _jobId) return;
            timedOut = true;
            GameAssist.log('Core', `Task timed out after ${job.timeout}ms`, 'WARN');
            _busy = false;
            _runNext();
        }, job.timeout);

        Promise.resolve()
            .then(job.task)
            .catch(err => GameAssist.log('Core', `Error in task: ${err?.message || err}`, 'ERROR'))
            .finally(() => {
                clearTimeout(timer);
                if (myId !== _jobId) return;
                if (timedOut) return;
                _busy = false;
                const duration = monotonic() - _lastStart;
                GameAssist._metrics.taskDurations.push(duration);
                if (GameAssist._metrics.taskDurations.length > METRIC_DURATION_LIMIT) {
                    GameAssist._metrics.taskDurations.shift();
                }
                GameAssist._metrics.lastUpdate = isoNow();
                recordMetric('task', { noHistory: true });
                recordMetric(POLICY.metrics.queueDurationName, { duration, noHistory: true });
                _runNext();
            });
    }

    setInterval(() => {
        if (_busy && monotonic() - _lastStart > DEFAULT_TIMEOUT * POLICY.queue.watchdogMultiplier) {
            GameAssist.log('Core', 'Watchdog forced queue reset', 'WARN');
            _busy = false;
            _runNext();
        }
    }, WATCHDOG_INTERVAL);
    // --- Notes & Comments ---
    // Decision log:
    //   CHOICE: FIFO with priority bump via sort; simple and sufficient for sandbox.
    //   CHOICE: Watchdog multiplier remains 2; policy owns the value and preserves legacy behavior.
    //   CHOICE: Timeouts release queue ownership but never claim to cancel underlying Roll20 work.
    // Changed (v0.1.4.2): Clarified the opt-in queue contract and timeout limitation for the public enqueue seam.
    // Prior notes:
    //   Changed (v0.1.4.1): Routed queue timing through POLICY/monotonic() and emitted the declared duration metric name.
    //   Changed (v0.1.4): Added job id guard to prevent stale completions advancing the queue after timeout.
    //   Maintenance (v0.1.3, no semantic change): Added narrative and reconfirmed queue/watchdog defaults.
    //   Maintenance (v0.1.1.2, no semantic change): MECHSUITS metadata updated for v1.5.1 compliance.
    // [GAMEASSIST:CORE:QUEUE] END
    // =============================================================================

    // ————— HANDLER TRACKING —————
    // =============================================================================
    // =============================================================================

    // =============================================================================
    // =============================================================================

    // ————— COMPATIBILITY —————
    // =============================================================================
    // [GAMEASSIST:CORE:COMPAT] BEGIN
    // Section Title: Compatibility audit
    // -------------------------------------------------------------------------
    // mechsuit_section: { codename: "GAMEASSIST", area: "CORE:COMPAT", title: "Compat",
    //   guarantees: ["Optional visibility of known/unknown scripts","TokenMod overlap guidance matches TokenAssist and MarkerService ownership"], last_updated_version: "v0.1.5.0" }
    // -------------------------------------------------------------------------
    // Narrative
    // CORE:COMPAT inspects other loaded scripts against known signatures to highlight
    // overlapping prefixes or event hooks. It is gated by DEBUG_COMPAT to avoid noisy
    // logs during normal play.
    // -------------------------------------------------------------------------
    const KNOWN_SCRIPTS = [
        'tokenmod.js','universaltvttimporter.js','npc-hp.js','wolfpack.js',
        'critfumble.js','rana-curse.js','statusinfo.js','npc death tracker.js',
        'customizable roll listener.js','5th edition ogl by roll20 companion.js'
    ];
    function normalizeScriptName(n) {
        return (n||'')
            .toLowerCase()
            .replace(/\.js$/, '')
            .replace(/[\s_]+/g, '-')
            .replace(/[^\w-]/g, '');
    }
    const SIGNATURES = (() => {
        const defs = [
            {
                id: 'TokenMod',
                displayName: 'TokenMod',
                aliases: ['TokenMod', 'Token Mod'],
                prefixes: ['!token-mod', '!tokenmod', '!tm'],
                events: ['chat:message', 'change:graphic:statusmarkers'],
                hints: [
                    'Standalone TokenMod and TokenAssist both use !token-mod; remove the standalone script for normal v0.1.5.0 use.',
                    'TokenAssist suspends only its deprecated !token-mod alias when the standalone public contract is detected; independently automated token or marker changes can still compete with GameAssist.'
                ]
            },
            {
                id: 'ScriptCards',
                displayName: 'ScriptCards',
                aliases: ['ScriptCards'],
                prefixes: ['!scriptcard', '!scriptcards'],
                events: ['chat:message'],
                hints: [
                    'ScriptCards and GameAssist both watch chat:message—keep command prefixes distinct to prevent clashes.'
                ]
            },
            {
                id: 'APILogic',
                displayName: 'APILogic',
                aliases: ['APILogic'],
                prefixes: ['!apilogic'],
                events: ['chat:message', 'change:graphic'],
                hints: [
                    'APILogic can rewrite chat commands; prefer explicit !ga- prefixes when integrating with it.'
                ]
            }
        ];
        const map = {};
        defs.forEach(def => {
            const key = normalizeScriptName(def.id);
            const match = new Set(def.aliases.map(normalizeScriptName));
            match.add(key);
            map[key] = {
                displayName: def.displayName,
                match,
                prefixes: def.prefixes.map(p => p.toLowerCase()),
                events: def.events,
                hints: def.hints
            };
        });
        return map;
    })();
    function resolveSignature(normName) {
        if (SIGNATURES[normName]) return SIGNATURES[normName];
        return Object.values(SIGNATURES).find(sig => sig.match.has(normName)) || null;
    }
    function auditCompatibility() {
        if (!GameAssist.flags.DEBUG_COMPAT) return;

        const plannedEvents   = GameAssist._plannedEvents;
        const plannedPrefixes = GameAssist._plannedChatPrefixes;
        const scriptState     = state.api?.scripts;

        if (!scriptState || !Object.keys(scriptState).length) {
            GameAssist.log('Compat', 'Sandbox did not expose external scripts; compatibility scoring limited.');
            GameAssist.log('Compat', '🔌 Events: '   + (plannedEvents.join(', ')   || 'none'));
            GameAssist.log('Compat', '💬 Commands: ' + (plannedPrefixes.join(', ') || 'none'));
            return;
        }

        const activeEntries   = Object.keys(scriptState);
        const activeNormalized = activeEntries.map(normalizeScriptName);

        const knownSet = new Set([
            ...KNOWN_SCRIPTS.map(normalizeScriptName),
            ...activeNormalized
                .map(resolveSignature)
                .filter(Boolean)
                .flatMap(sig => Array.from(sig.match))
        ]);

        const known = [];
        const unknown = [];

        activeNormalized.forEach((norm, idx) => {
            const original = activeEntries[idx];
            if (knownSet.has(norm)) {
                known.push(original);
            } else {
                unknown.push(original);
            }
        });

        GameAssist.log('Compat', '✅ Known: '  + (known.join(', ')   || 'none'));
        GameAssist.log('Compat', '❓ Unknown: ' + (unknown.join(', ') || 'none'));
        GameAssist.log('Compat', '🔌 Events: '   + (plannedEvents.join(', ')   || 'none'));
        GameAssist.log('Compat', '💬 Commands: ' + (plannedPrefixes.join(', ') || 'none'));

        const rows = [];

        activeNormalized.forEach((norm, idx) => {
            const signature = resolveSignature(norm);
            if (!signature) return;

            const prefixMatches = plannedPrefixes.filter(prefix =>
                signature.prefixes.includes(prefix.toLowerCase())
            );
            const eventMatches = plannedEvents.filter(evt =>
                signature.events.includes(evt)
            );

            const score = prefixMatches.length + (eventMatches.length * 2);
            const notes = [];

            if (signature.hints?.length) notes.push(...signature.hints);
            if (prefixMatches.length) notes.push('Shared prefixes: ' + prefixMatches.join(', '));
            if (eventMatches.length) notes.push('Shared events: ' + eventMatches.join(', '));

            rows.push({
                raw: activeEntries[idx],
                score,
                notes
            });
        });

        if (!rows.length) {
            GameAssist.log('Compat', 'No signature overlaps detected.');
            return;
        }

        rows.sort((a, b) => b.score - a.score || a.raw.localeCompare(b.raw));

        const table = [
            '| Script | Score | Notes |',
            '| ------ | ----: | ----- |',
            ...rows.map(row => {
                const noteText = row.notes.length ? row.notes.join(' · ') : 'No overlaps detected.';
                return `| ${row.raw} | ${row.score} | ${noteText} |`;
            })
        ].join('\n');

        GameAssist.log('Compat', `Compatibility hints:\n${table}`);
    }
    // --- Notes & Comments ---
    // Changed (v0.1.5.0): Replaced obsolete TokenMod dependency guidance with the current TokenAssist command-overlap and MarkerService ownership warning.
    // CHOICE: DEBUG_COMPAT gate avoids noise; GM toggles as needed.
    // Prior notes:
    //   Maintenance (v0.1.3, no semantic change): Added narrative clarifying gating and kept compatibility heuristics unchanged; version metadata corrected.
    //   Maintenance (v0.1.1.2, no semantic change): MECHSUITS compliance metadata refreshed.
    // [GAMEASSIST:CORE:COMPAT] END
    // =============================================================================

    // ————— CONFIG PARSER —————
    // =============================================================================
    // [GAMEASSIST:CORE:STATE] BEGIN
    // Section Title: Config parser (aux to state management)
    // -------------------------------------------------------------------------
    // mechsuit_section: { codename: "GAMEASSIST", area: "CORE:STATE", title: "Config parser",
    //   guarantees: ["Parse JSON/boolean/number safely"], last_updated_version: "v0.1.4" }
    // -------------------------------------------------------------------------
    // Narrative
    // CORE:STATE handles normalization of chat-provided configuration strings into
    // booleans, numbers, JSON, or passthrough text. It logs rather than throws to
    // protect chat usability.
    // -------------------------------------------------------------------------
    function parseConfigValue(raw) {
        raw = String(raw ?? '').trim();
        if (raw === 'true')  return true;
        if (raw === 'false') return false;
        if (raw !== '' && /^-?\d+(\.\d+)?$/.test(raw)) return Number(raw);
        if ((raw.startsWith('{') && raw.endsWith('}')) || (raw.startsWith('[') && raw.endsWith(']'))) {
            try { return JSON.parse(raw); }
            catch { GameAssist.log('Config', 'Invalid JSON: ' + _sanitize(raw)); }
        }
        return raw;
    }
    // --- Notes & Comments ---
    // Maintenance (v0.1.5.0, no semantic change): Consolidated prior commentary under one history label; parser behavior is unchanged.
    // Decision log:
    //   CHOICE: Gracefully log bad JSON rather than throwing; keeps chat usable.
    // Prior notes:
    //   v0.1.4: Guarded numeric parsing against empty strings to avoid silent 0 writes from blank inputs.
    //   v0.1.3: Added normalization narrative while retaining behavior; no semantic change.
    //   v0.1.1.2: Added MECHSUITS v1.5.1 tracking metadata; no semantic change.
    // [GAMEASSIST:CORE:STATE] END
    // =============================================================================

    // ————— MARKER SERVICE —————
    // =============================================================================
    // [GAMEASSIST:CORE:MARKERSERVICE] BEGIN
    // Section Title: Roll20 token marker authority
    // -------------------------------------------------------------------------
    // mechsuit_section: { codename: "GAMEASSIST", area: "CORE:MARKERSERVICE", title: "MarkerService",
    //   guarantees: ["Single authority for built-in/custom marker resolution, artwork metadata, reads, writes, toggles, and observations","Custom marker lookup prefers Roll20's documented token_markers property and retains _token_markers as a compatibility fallback","Mutations preserve unrelated markers, numbered overlays, and duplicate entries unless the requested marker is removed","Disabled service refuses marker work with actionable diagnostics"],
    //   depends_on: ["[GAMEASSIST:APP:UTILS]"], provides: ["GameAssist.MarkerService"],
    //   observability: { spans: ["[GAMEASSIST:CORE:MARKERSERVICE]"] },
    //   last_updated_version: "v0.1.5.0",
    //   independent_versions: { marker_service_version: "1.0.1" }, lifecycle: "active" }
    // -------------------------------------------------------------------------
    // Narrative
    // MarkerService resolves Roll20 built-in marker ids, custom display names, and exact
    // stored custom tags. Registry reads prefer Roll20's documented token_markers property
    // and retain _token_markers as a compatibility fallback for observed sandbox behavior.
    // It owns marker parsing and mutation so modules cannot drift into competing
    // implementations. Mutations return explicit result objects and direct statusmarkers
    // writes trigger one shared observation contract for future modules.
    // The DM may disable the service; GameAssist then disables marker-dependent modules
    // while leaving unrelated modules available.
    // -----------------------------------------------------------------------------
    let setMarkerServiceEnabled;
    const MarkerService = (() => {
        const version = '1.0.1';
        const builtInMarkerIds = new Set([
            'red', 'blue', 'green', 'brown', 'purple', 'pink', 'yellow', 'dead',
            'skull', 'sleepy', 'half-heart', 'half-haze', 'interdiction', 'snail',
            'lightning-helix', 'spanner', 'chained-heart', 'chemical-bolt',
            'death-zone', 'drink-me', 'edge-crack', 'ninja-mask', 'stopwatch',
            'fishing-net', 'overdrive', 'strong', 'fist', 'padlock', 'three-leaves',
            'fluffy-wing', 'pummeled', 'tread', 'arrowed', 'aura', 'back-pain',
            'black-flag', 'bleeding-eye', 'bolt-shield', 'broken-heart', 'cobweb',
            'broken-shield', 'flying-flag', 'radioactive', 'trophy', 'broken-skull',
            'frozen-orb', 'rolling-bomb', 'white-tower', 'grab', 'screaming',
            'grenade', 'sentry-gun', 'all-for-one', 'angel-outfit', 'archery-target'
        ]);
        const builtInMarkerColors = Object.freeze({
            red: '#C91010',
            blue: '#1076C9',
            green: '#2FC910',
            brown: '#C97310',
            purple: '#9510C9',
            pink: '#EB75E1',
            yellow: '#E5EB75'
        });
        const builtInSpriteOrder = Object.freeze([
            'skull', 'sleepy', 'half-heart', 'half-haze', 'interdiction',
            'snail', 'lightning-helix', 'spanner', 'chained-heart',
            'chemical-bolt', 'death-zone', 'drink-me', 'edge-crack',
            'ninja-mask', 'stopwatch', 'fishing-net', 'overdrive', 'strong',
            'fist', 'padlock', 'three-leaves', 'fluffy-wing', 'pummeled',
            'tread', 'arrowed', 'aura', 'back-pain', 'black-flag',
            'bleeding-eye', 'bolt-shield', 'broken-heart', 'cobweb',
            'broken-shield', 'flying-flag', 'radioactive', 'trophy',
            'broken-skull', 'frozen-orb', 'rolling-bomb', 'white-tower',
            'grab', 'screaming', 'grenade', 'sentry-gun', 'all-for-one',
            'angel-outfit', 'archery-target'
        ]);
        let registryCache = { key: null, raw: null, source: null, markers: [], error: null };
        const observers = new Map();
        let observerId = 0;
        let observerWired = false;
        let enabled = false;

        function disabledFailure(extra = {}) {
            return failure(
                'UNAVAILABLE',
                'MarkerService is disabled. Enable it with !ga-enable MarkerService before using marker-dependent features.',
                extra
            );
        }

        function isEnabled() {
            return enabled;
        }

        setMarkerServiceEnabled = value => {
            enabled = value === true;
            return enabled;
        };

        function unwrap(marker) {
            const text = String(marker ?? '').split('@')[0].trim();
            if (text.length >= 2) {
                const first = text[0];
                const last = text[text.length - 1];
                if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
                    return text.slice(1, -1).trim();
                }
            }
            return text;
        }

        function normalizeId(marker) {
            return unwrap(marker).toLowerCase();
        }

        function requestedNumber(marker) {
            const match = String(marker ?? '').trim().match(/@(\d+)$/);
            return match ? Number(match[1]) : null;
        }

        function parseEntry(raw, index) {
            const stored = String(raw ?? '').trim();
            const numberMatch = stored.match(/^(.*)@(\d+)$/);
            const id = (numberMatch ? numberMatch[1] : stored).trim();
            return {
                index,
                raw: stored,
                id,
                normalizedId: normalizeId(id),
                number: numberMatch ? Number(numberMatch[2]) : null
            };
        }

        function parseList(raw) {
            return String(raw || '')
                .split(',')
                .map((entry, index) => parseEntry(entry, index))
                .filter(entry => entry.id);
        }

        function failure(code, message, extra = {}) {
            return {
                ok: false,
                code,
                message,
                changed: false,
                verified: false,
                ...extra
            };
        }

        /**
         * getRegistry - Read Roll20's custom marker display-name/tag map.
         * Failure: returns an empty registry plus an actionable error; never throws.
         * Design: cache by the raw campaign value to avoid repeated JSON parsing.
         */
        function getRegistry() {
            if (!enabled) {
                return {
                    raw: null,
                    source: null,
                    markers: [],
                    error: 'MarkerService is disabled. Enable it with !ga-enable MarkerService.'
                };
            }

            const attempts = ['token_markers', '_token_markers'].map(property => {
                try {
                    const value = Campaign().get(property);
                    return {
                        property,
                        raw: value === undefined || value === null || value === ''
                            ? null
                            : String(value),
                        error: null
                    };
                } catch (error) {
                    return {
                        property,
                        raw: null,
                        error: `${property} unavailable: ${error.message || error}`
                    };
                }
            });
            const cacheKey = JSON.stringify(attempts);

            if (registryCache.key === cacheKey) {
                return {
                    raw: registryCache.raw,
                    source: registryCache.source,
                    markers: registryCache.markers.map(entry => ({ ...entry })),
                    error: registryCache.error
                };
            }

            const diagnostics = [];
            let selected = null;
            for (const attempt of attempts) {
                if (attempt.error) {
                    diagnostics.push(attempt.error);
                    continue;
                }
                if (attempt.raw === null) continue;
                try {
                    const parsed = JSON.parse(attempt.raw);
                    if (!Array.isArray(parsed)) {
                        diagnostics.push(`${attempt.property} did not contain a JSON array.`);
                        continue;
                    }
                    selected = { property: attempt.property, raw: attempt.raw, parsed };
                    break;
                } catch (error) {
                    diagnostics.push(`${attempt.property} is invalid JSON: ${error.message || error}`);
                }
            }

            if (selected) {
                const markers = selected.parsed
                    .filter(entry => entry && entry.name && entry.tag)
                    .map(entry => ({
                        name: String(entry.name).trim(),
                        tag: String(entry.tag).split('@')[0].trim(),
                        url: typeof entry.url === 'string' ? entry.url.trim() : ''
                    }))
                    .filter(entry => entry.name && entry.tag);
                registryCache = {
                    key: cacheKey,
                    raw: selected.raw,
                    source: selected.property,
                    markers,
                    error: null
                };
            } else if (attempts.every(attempt => attempt.raw === null && !attempt.error)) {
                registryCache = {
                    key: cacheKey,
                    raw: '[]',
                    source: 'token_markers',
                    markers: [],
                    error: null
                };
            } else {
                registryCache = {
                    key: cacheKey,
                    raw: attempts.find(attempt => attempt.raw !== null)?.raw || null,
                    source: null,
                    markers: [],
                    error: `Campaign marker registry is unavailable: ${diagnostics.join(' ')}`
                };
            }

            return {
                raw: registryCache.raw,
                source: registryCache.source,
                markers: registryCache.markers.map(entry => ({ ...entry })),
                error: registryCache.error
            };
        }

        /**
         * resolve - Resolve configured marker text to the exact stored marker id.
         * Inputs: built-in id, custom display name, custom stored tag, or numbered stored value.
         * Outputs: a structured result; callers inspect ok before using id.
         */
        function resolve(marker) {
            if (!enabled) {
                return disabledFailure({
                    requested: unwrap(marker),
                    id: null,
                    source: null,
                    ambiguous: false,
                    candidates: [],
                    reason: 'service-disabled',
                    registryError: null
                });
            }
            const requested = unwrap(marker);
            const normalized = normalizeId(requested);

            if (!requested) {
                return failure('INVALID_ARGUMENT', 'Marker name or stored tag is required.', {
                    requested,
                    id: null,
                    source: null,
                    ambiguous: false,
                    candidates: [],
                    reason: 'empty',
                    registryError: null
                });
            }

            if (requested === normalized && builtInMarkerIds.has(normalized)) {
                return {
                    ok: true,
                    code: null,
                    message: null,
                    requested,
                    id: normalized,
                    source: 'built-in',
                    ambiguous: false,
                    candidates: [normalized],
                    reason: null,
                    registryError: null
                };
            }

            if (requested.includes('::')) {
                if (/[,\r\n]/.test(requested)) {
                    return failure('INVALID_ARGUMENT', 'Exact stored marker tags cannot contain commas or line breaks.', {
                        requested,
                        id: null,
                        source: null,
                        ambiguous: false,
                        candidates: [],
                        reason: 'invalid-tag',
                        registryError: null
                    });
                }
                return {
                    ok: true,
                    code: null,
                    message: null,
                    requested,
                    id: requested,
                    source: 'custom-tag-direct',
                    ambiguous: false,
                    candidates: [requested],
                    reason: null,
                    registryError: null
                };
            }

            const registry = getRegistry();
            const resolved = (matches, source) => ({
                ok: true,
                code: null,
                message: null,
                requested,
                id: matches[0].tag,
                source,
                ambiguous: matches.length > 1,
                candidates: matches.map(entry => entry.tag),
                reason: null,
                registryError: registry.error
            });

            const directTagMatches = registry.markers
                .filter(entry => normalizeId(entry.tag) === normalized);
            if (directTagMatches.length) return resolved(directTagMatches, 'custom-tag');

            const exactNameMatches = registry.markers
                .filter(entry => entry.name === requested);
            if (exactNameMatches.length) return resolved(exactNameMatches, 'custom-name');

            if (builtInMarkerIds.has(normalized)) {
                return {
                    ok: true,
                    code: null,
                    message: null,
                    requested,
                    id: normalized,
                    source: 'built-in',
                    ambiguous: false,
                    candidates: [normalized],
                    reason: null,
                    registryError: registry.error
                };
            }

            const foldedNameMatches = registry.markers
                .filter(entry => entry.name.toLowerCase() === normalized);
            if (foldedNameMatches.length) return resolved(foldedNameMatches, 'custom-name-folded');

            const code = registry.error ? 'UNAVAILABLE' : 'NOT_FOUND';
            const message = registry.error
                ? `Marker "${requested}" could not be resolved because the campaign marker registry is unavailable.`
                : `Marker "${requested}" was not found among built-in or custom campaign markers.`;
            return failure(code, message, {
                requested,
                id: null,
                source: null,
                ambiguous: false,
                candidates: [],
                reason: registry.error ? 'registry-error' : 'not-found',
                registryError: registry.error
            });
        }

        /**
         * artwork - Return display metadata for a built-in or custom marker.
         * Custom artwork is available only when Roll20 exposes a matching registry URL.
         * Failure is non-fatal: chat consumers should fall back to the marker name.
         */
        function artwork(marker) {
            const resolution = resolve(marker);
            if (!resolution.ok) return resolution;

            const id = normalizeId(resolution.id);
            if (builtInMarkerColors[id]) {
                return {
                    ok: true,
                    code: null,
                    type: 'color',
                    id: resolution.id,
                    color: builtInMarkerColors[id],
                    resolution
                };
            }
            if (id === 'dead') {
                return {
                    ok: true,
                    code: null,
                    type: 'text',
                    id: resolution.id,
                    text: 'X',
                    color: '#CC1010',
                    resolution
                };
            }

            const spriteIndex = builtInSpriteOrder.indexOf(id);
            if (spriteIndex >= 0) {
                return {
                    ok: true,
                    code: null,
                    type: 'sprite',
                    id: resolution.id,
                    url: 'https://app.roll20.net/images/statussheet.png',
                    offsetPercent: 2.173913 * spriteIndex,
                    resolution
                };
            }

            const registry = getRegistry();
            const match = registry.markers.find(entry => normalizeId(entry.tag) === id);
            if (match?.url && /^https:\/\//i.test(match.url)) {
                return {
                    ok: true,
                    code: null,
                    type: 'custom',
                    id: resolution.id,
                    name: match.name,
                    url: match.url,
                    resolution
                };
            }

            return failure(
                registry.error ? 'UNAVAILABLE' : 'NOT_FOUND',
                registry.error
                    ? `Artwork for marker "${resolution.requested}" is unavailable because the campaign marker registry could not be read.`
                    : `Artwork for marker "${resolution.requested}" is not available.`,
                { id: resolution.id, resolution, registryError: registry.error }
            );
        }

        function read(token) {
            if (!enabled) {
                return disabledFailure({
                    tokenId: token?.id || null,
                    raw: '',
                    entries: []
                });
            }
            if (!token || typeof token.get !== 'function' || !token.id) {
                return failure('INVALID_ARGUMENT', 'A Roll20 graphic token is required.', {
                    tokenId: token?.id || null,
                    raw: '',
                    entries: []
                });
            }

            try {
                const raw = String(token.get('statusmarkers') || '');
                return {
                    ok: true,
                    code: null,
                    message: null,
                    tokenId: token.id,
                    raw,
                    entries: parseList(raw)
                };
            } catch (error) {
                return failure('UNAVAILABLE', `Token markers could not be read: ${error.message || error}`, {
                    tokenId: token.id,
                    raw: '',
                    entries: []
                });
            }
        }

        function inspect(token, marker) {
            const resolution = resolve(marker);
            if (!resolution.ok) {
                return { ...resolution, tokenId: token?.id || null, present: false, count: 0, matches: [] };
            }

            const snapshot = read(token);
            if (!snapshot.ok) {
                return { ...snapshot, resolution, present: false, count: 0, matches: [] };
            }

            const wanted = normalizeId(resolution.id);
            const matches = snapshot.entries.filter(entry => entry.normalizedId === wanted);
            return {
                ok: true,
                code: null,
                message: null,
                tokenId: snapshot.tokenId,
                resolution,
                present: matches.length > 0,
                count: matches.length,
                matches,
                entries: snapshot.entries,
                raw: snapshot.raw
            };
        }

        function has(token, marker) {
            const result = inspect(token, marker);
            return result.ok && result.present;
        }

        function normalizeNumber(value) {
            if (value === null || value === undefined || value === '') return null;
            const number = Number(value);
            return Number.isInteger(number) && number >= 0 && number <= 9 ? number : NaN;
        }

        /**
         * mutate - Apply one marker operation while preserving unrelated stored entries.
         * Duplicate requested markers are retained on add/toggle-on and all are removed
         * on remove/toggle-off. A number option updates only the first matching entry.
         */
        function mutate(token, marker, action, options = {}) {
            const operation = String(action || '').toLowerCase();
            if (!['add', 'remove', 'toggle'].includes(operation)) {
                return failure('INVALID_ARGUMENT', `Unsupported marker action "${operation}".`, {
                    action: operation,
                    tokenId: token?.id || null
                });
            }

            const resolution = resolve(marker);
            if (!resolution.ok) {
                return { ...resolution, action: operation, tokenId: token?.id || null };
            }

            const before = read(token);
            if (!before.ok) {
                return { ...before, action: operation, resolution };
            }

            const optionNumber = Object.prototype.hasOwnProperty.call(options, 'number')
                ? normalizeNumber(options.number)
                : normalizeNumber(requestedNumber(marker));
            if (Number.isNaN(optionNumber)) {
                return failure('INVALID_ARGUMENT', 'Marker number must be an integer from 0 through 9.', {
                    action: operation,
                    tokenId: before.tokenId,
                    resolution,
                    before: before.entries,
                    after: before.entries
                });
            }

            const wanted = normalizeId(resolution.id);
            const matchingPositions = before.entries
                .map((entry, position) => ({ entry, position }))
                .filter(item => item.entry.normalizedId === wanted)
                .map(item => item.position);
            const present = matchingPositions.length > 0;
            const targetPresent = operation === 'toggle' ? !present : operation === 'add';
            let afterRaw = before.entries.map(entry => entry.raw);

            if (!targetPresent) {
                afterRaw = before.entries
                    .filter(entry => entry.normalizedId !== wanted)
                    .map(entry => entry.raw);
            } else if (!present) {
                afterRaw.push(optionNumber === null ? resolution.id : `${resolution.id}@${optionNumber}`);
            } else if (optionNumber !== null) {
                const firstPosition = matchingPositions[0];
                afterRaw[firstPosition] = `${resolution.id}@${optionNumber}`;
            }

            const nextRaw = afterRaw.join(',');
            const changed = nextRaw !== before.raw;
            if (!changed) {
                return {
                    ok: true,
                    code: null,
                    message: null,
                    action: operation,
                    tokenId: before.tokenId,
                    resolution,
                    changed: false,
                    verified: true,
                    present,
                    before: before.entries,
                    after: before.entries
                };
            }

            try {
                token.set('statusmarkers', nextRaw);
            } catch (error) {
                return failure('UNAVAILABLE', `Token markers could not be updated: ${error.message || error}`, {
                    action: operation,
                    tokenId: before.tokenId,
                    resolution,
                    before: before.entries,
                    after: parseList(nextRaw)
                });
            }

            const verification = inspect(token, resolution.id);
            const verified = verification.ok && verification.present === targetPresent;
            if (!verified) {
                return failure('CONFLICT', 'Roll20 did not retain the requested marker state.', {
                    action: operation,
                    tokenId: before.tokenId,
                    resolution,
                    changed: true,
                    before: before.entries,
                    after: verification.entries || parseList(nextRaw),
                    present: verification.present === true
                });
            }

            return {
                ok: true,
                code: null,
                message: null,
                action: operation,
                tokenId: before.tokenId,
                resolution,
                changed: true,
                verified: true,
                present: verification.present,
                before: before.entries,
                after: verification.entries
            };
        }

        function set(token, marker, on, options = {}) {
            return mutate(token, marker, on === true ? 'add' : 'remove', options);
        }

        function add(token, marker, options = {}) {
            return mutate(token, marker, 'add', options);
        }

        function remove(token, marker, options = {}) {
            return mutate(token, marker, 'remove', options);
        }

        function toggle(token, marker, options = {}) {
            return mutate(token, marker, 'toggle', options);
        }

        function difference(left, right) {
            const remaining = right.map(entry => entry.raw);
            return left.filter(entry => {
                const index = remaining.indexOf(entry.raw);
                if (index >= 0) {
                    remaining.splice(index, 1);
                    return false;
                }
                return true;
            });
        }

        function wireObserver() {
            if (observerWired) return;
            observerWired = true;
            R20_ON('change:graphic:statusmarkers', (token, previous) => {
                if (!enabled || !observers.size) return;
                const before = parseList(previous?.statusmarkers || '');
                const current = read(token);
                if (!current.ok) return;
                const event = {
                    token,
                    tokenId: token.id,
                    previous: before,
                    current: current.entries,
                    added: difference(current.entries, before),
                    removed: difference(before, current.entries),
                    timestamp: isoNow()
                };

                observers.forEach(subscription => {
                    try {
                        subscription.callback(event);
                    } catch (error) {
                        const api = globalThis.GameAssist;
                        if (api && typeof api.handleError === 'function') {
                            api.handleError(subscription.owner, error);
                        }
                    }
                });
            });
        }

        function observe(callback, options = {}) {
            if (!enabled) return disabledFailure();
            if (typeof callback !== 'function') {
                return failure('INVALID_ARGUMENT', 'Marker observer callback must be a function.');
            }

            const observerOptions = options && typeof options === 'object' ? options : {};
            const owner = typeof options === 'string'
                ? options
                : String(observerOptions.owner || 'MarkerServiceConsumer');
            const id = ++observerId;
            observers.set(id, { owner, callback });
            wireObserver();

            return {
                ok: true,
                id,
                owner,
                unsubscribe: () => observers.delete(id)
            };
        }

        function clearObservers(owner) {
            const requested = String(owner || '');
            let removed = 0;
            observers.forEach((subscription, id) => {
                if (requested && subscription.owner !== requested) return;
                observers.delete(id);
                removed++;
            });
            return removed;
        }

        return Object.freeze({
            version,
            isEnabled,
            resolve,
            artwork,
            read,
            inspect,
            has,
            add,
            remove,
            toggle,
            set,
            observe,
            clearObservers,
            getRegistry,
            normalizeId
        });
    })();
    // --- Notes & Comments ---
    // Changed (v0.1.5.0): Advanced MarkerService to 1.0.1 with built-in and custom marker artwork metadata, documented token_markers registry lookup with _token_markers compatibility fallback, explicit lifecycle controls, and no GameAssist marker dependence on chat-generated TokenMod commands.
    // Decision log:
    //   CHOICE: Mutate statusmarkers directly and publish one observation contract - ALT: send TokenMod chat commands; REJECTED: external authorization, timing, and dependency ambiguity.
    //   CHOICE: Remove every matching duplicate on explicit removal - ALT: remove only the first; REJECTED: callers asking for an absent state should not leave hidden duplicates active.
    //   CHOICE: Preserve duplicates and number overlays on reads and unrelated mutations - ALT: normalize the complete marker list; REJECTED: normalization would rewrite campaign state outside the requested operation.
    //   CHOICE: Preserve literal lowercase built-in ids before custom display names, then honor exact-case custom names - ALT: always prefer custom names; REJECTED: a custom "dead" could silently replace NPCManager's built-in default.
    //   CHOICE: Prefer token_markers and fall back to _token_markers only when the documented value is absent or unusable - ALT: retain the underscored property alone; REJECTED: current Roll20 documentation defines token_markers while existing sandbox evidence supports the compatibility alias.
    //   CHOICE: Resolve exact stored custom tags without registry access - ALT: require registry confirmation; REJECTED: valid stored tags must survive registry read failures.
    //   CHOICE: Return marker artwork as metadata - ALT: emit chat HTML from MarkerService; REJECTED: presentation belongs to consuming modules.
    //   CHOICE: Refuse every marker operation while disabled - ALT: leave read-only helpers active; REJECTED: a disabled service must have one clear, predictable boundary.
    //   CHOICE: Pause observers while disabled but retain their registrations - ALT: clear observers; REJECTED: dependent modules are wired once and would not resubscribe after a service restart.
    // [GAMEASSIST:CORE:MARKERSERVICE] END
    // =============================================================================

    // ————— GameAssist CORE —————
    // =============================================================================
    // [GAMEASSIST:CORE:OBJECT] BEGIN
    // Section Title: GameAssist kernel object
    // -------------------------------------------------------------------------
    // mechsuit_section: { codename: "GAMEASSIST", area: "CORE:OBJECT", title: "Kernel",
    //   guarantees: ["Logging, explicit enqueue, dependency diagnostics, register/enable/disable, listener management", "MarkerService and the validated time seam are exposed through the stable GameAssist object", "Module registration may explicitly retain durable runtime state and protect validated configuration maps", "Failed dependency enable checks preserve the module's existing configured intent"],
    //   depends_on: ["[GAMEASSIST:POLICY]","[GAMEASSIST:APP:UTILS]","[GAMEASSIST:CORE:QUEUE]","[GAMEASSIST:CORE:MARKERSERVICE]"],
    //   last_updated_version: "v0.1.5.1", lifecycle: "active" }
    // -------------------------------------------------------------------------
    // Narrative
    // CORE:OBJECT exposes the GameAssist singleton with metrics, logging, explicit
    // queue submission, contract-aware dependency diagnostics, registration helpers, and
    // safe enable/disable hooks. A refused dependency enable leaves prior configuration
    // unchanged; existing command/event execution remains direct.
    // -------------------------------------------------------------------------
    const GameAssist = {
        _metrics: {
            commands: 0,
            messages: 0,
            errors: 0,
            stateAudits: 0,
            taskDurations: [],
            lastUpdate: null
        },
        _plannedEvents: [],
        _plannedChatPrefixes: [],
        _listeners: {},
        _commandHandlers: {},
        _eventHandlers: {},
        _transitioning,
        config: {},
        flags: { DEBUG_COMPAT: false, QUIET_STARTUP: true },
        MarkerService,
        Time: Object.freeze({
            version: '1.0.0',
            validateTimeZone,
            getInfo: getTimeZoneInfo,
            formatDateTime: localNow,
            formatTime: localTime,
            dateKey: localDateKey
        }),

        log(mod, msg, level = 'INFO', { startup = false } = {}) {
            if (startup && GameAssist.flags.QUIET_STARTUP) return;

            const timestamp = localTime();
            const levelIcon = { INFO: 'ℹ️', WARN: '⚠️', ERROR: '❌' }[level] || 'ℹ️';
            const safeLines = _sanitize(String(msg ?? '')).split('\n');
            const body = safeLines.join('<br>');

            sendChat(
                'GameAssist',
                `/w gm ${levelIcon} [${timestamp}] [${_sanitize(mod)}] ${body}`
            );
        },

        handleError(mod, err) {
            this._metrics.errors++;
            this._metrics.lastUpdate = isoNow();
            recordMetric('error', { mod, note: err?.message || String(err) });
            this.log(mod, err.message || String(err), 'ERROR');
        },

        register(name, initFn, {
            enabled = true,
            events = [],
            prefixes = [],
            teardown = null,
            dependsOn = [],
            preserveRuntimeOnDisable = false,
            service = false,
            protectedConfigKeys = []
        } = {}) {
            if (READY) {
                this.log('Core', `Cannot register after ready: ${name}`, 'WARN');
                return;
            }
            if (MODULES[name]) {
                this.log('Core', `Duplicate module: ${name}`, 'WARN');
                return;
            }
            MODULES[name] = {
                initFn,
                teardown,
                enabled,
                initialized: false,
                active: false,
                events,
                prefixes,
                dependsOn,
                preserveRuntimeOnDisable: preserveRuntimeOnDisable === true,
                service: service === true,
                protectedConfigKeys: Array.isArray(protectedConfigKeys)
                    ? protectedConfigKeys.map(key => String(key))
                    : [],
                wired: false,
                internal: false
            };
            this._plannedEvents.push(...events);
            this._plannedChatPrefixes.push(...prefixes);
        },

        onCommand(prefix, fn, mod, { gmOnly = false, acl = [], match = { caseInsensitive: true, mode: 'token' } } = {}) {
            const wrapped = msg => {
                if (!MODULES[mod]?.initialized || !MODULES[mod]?.active) return;
                if (msg.type !== 'api' || !commandMatches(msg.content, prefix, match)) return;
                if (gmOnly && !playerIsGM(msg.playerid)) return;
                if (acl.length && !acl.includes(msg.playerid)) return;
                this._metrics.commands++;
                this._metrics.lastUpdate = isoNow();
                recordMetric('command', { mod, note: prefix, noHistory: true });
                try { fn(msg); }
                catch(e) { this.handleError(mod, e); }
            };
            R20_ON('chat:message', wrapped);
            this._commandHandlers[mod] = (this._commandHandlers[mod] || []).concat({ event:'chat:message', fn:wrapped });
        },

        offCommands(mod) {
            // Clears internal bookkeeping only; does not detach from Roll20 bus.
            this._commandHandlers[mod] = [];
        },

        onEvent(evt, fn, mod) {
            const wrapped = (...args) => {
                if (!MODULES[mod]?.initialized || !MODULES[mod]?.active) return;
                if (!READY) return;
                this._metrics.messages++;
                this._metrics.lastUpdate = isoNow();
                recordMetric('event', { mod, note: evt, noHistory: true });
                try { fn(...args); }
                catch(e) { this.handleError(mod, e); }
            };
            R20_ON(evt, wrapped);
            this._listeners[mod] = (this._listeners[mod] || []).concat({ event:evt, fn:wrapped });
        },

        offEvents(mod) {
            // Clears internal bookkeeping only; does not detach from Roll20 bus.
            this._listeners[mod] = [];
        },

        _clearAllListeners() {
            this._commandHandlers = {};
            this._listeners = {};
        },

        _dedupePlanned() {
            if (this._deduped) return;
            this._plannedEvents = [...new Set(this._plannedEvents)];
            this._plannedChatPrefixes = [...new Set(this._plannedChatPrefixes)];
            this._deduped = true;
        },

        _getActiveScriptNames() {
            const scripts = state.api?.scripts;
            if (!scripts) return null;
            return Object.keys(scripts).map(normalizeScriptName);
        },

        _checkDependencies(name) {
            const mod = MODULES[name];
            if (!mod) {
                return {
                    status: 'missing',
                    missing: [name],
                    confirmed: [],
                    unverifiable: [],
                    verified: true
                };
            }

            const deps = mod.dependsOn || [];
            if (!deps.length) {
                return {
                    status: 'confirmed',
                    missing: [],
                    confirmed: [],
                    unverifiable: [],
                    verified: true
                };
            }

            const activeExternal = this._getActiveScriptNames();
            const missing = [];
            const confirmed = [];
            const unverifiable = [];

            deps.forEach(dep => {
                const normalized = normalizeScriptName(dep);
                if (MODULES[dep]) {
                    if (MODULES[dep].active) confirmed.push(dep);
                    else missing.push(dep);
                    return;
                }

                const contractEvidence = getStandaloneScriptEvidence(dep);
                if (contractEvidence.confirmed) {
                    confirmed.push(dep);
                    return;
                }

                if (activeExternal === null) {
                    unverifiable.push(dep);
                } else if (activeExternal.includes(normalized)) {
                    confirmed.push(dep);
                } else {
                    missing.push(dep);
                }
            });

            const status = missing.length
                ? 'missing'
                : (unverifiable.length ? 'unverifiable' : 'confirmed');

            return {
                status,
                missing,
                confirmed,
                unverifiable,
                verified: status !== 'unverifiable'
            };
        },

        resolveComponentName(requestedName) {
            const requested = String(requestedName || '').trim();
            if (!requested) return null;
            if (MODULES[requested]) return requested;
            const normalized = requested.toLowerCase();
            return Object.keys(MODULES).find(name => name.toLowerCase() === normalized) || null;
        },

        /**
         * enqueue — Explicitly submit work to the serialized queue.
         * Async work must return a Promise that settles when the queued portion is done.
         * A timeout releases the queue; it cannot cancel underlying Roll20 operations.
         */
        enqueue(task, options = {}) {
            if (typeof task !== 'function') {
                this.log('Core', 'GameAssist.enqueue requires a task function.', 'WARN');
                return false;
            }

            const opts = (options && typeof options === 'object') ? options : {};
            const priorityRaw = Number(opts.priority);
            const timeoutRaw = Number(opts.timeout);
            const priority = Number.isFinite(priorityRaw) ? priorityRaw : 0;
            const timeout = Number.isFinite(timeoutRaw) && timeoutRaw > 0
                ? timeoutRaw
                : DEFAULT_TIMEOUT;

            _enqueue(task, priority, timeout);
            return true;
        },

        enableModule(requestedName) {
            const name = this.resolveComponentName(requestedName);
            const mod = MODULES[name];
            if (!mod) {
                this.log('Core', `No such GameAssist module or service: ${String(requestedName || '').trim() || '(blank)'}`, 'WARN');
                return;
            }
            if (mod.internal) {
                this.log('Core', `${name} is managed by the core and cannot be toggled.`, 'WARN');
                return;
            }
            if (mod.active && mod.initialized) {
                this.log('Core', `${name} already enabled`, 'INFO');
                return;
            }
            if (_transitioning[name]) {
                this.log('Core', `${name} is already transitioning`, 'WARN');
                return;
            }

            const depInfo = this._checkDependencies(name);
            if (depInfo.status === 'missing') {
                this.log('Core', `${name} requires ${depInfo.missing.join(', ')}. Enable dependencies first.`, 'WARN');
                // CHOICE: Refuse activation without changing config - the module may be configured-and-skipped or deliberately disabled.
                return;
            }
            if (depInfo.status === 'unverifiable') {
                this.log('Core', `${name} dependencies unverifiable (${depInfo.unverifiable.join(', ')}); proceeding without confirmation.`, 'WARN');
            }

            _transitioning[name] = true;

            _enqueue(() => {
                const m = MODULES[name];
                const finish = () => { delete _transitioning[name]; };
                if (!m) { finish(); return; }

                const branch = getState(name);
                branch.config.enabled = true;
                branch.runtime = branch.runtime || {};

                if (!m.wired) {
                    try {
                        m.initFn();
                        m.wired = true;
                    } catch (e) {
                        m.initialized = false;
                        m.active = false;
                        branch.config.enabled = false;
                        finish();
                        this.handleError(name, e);
                        return;
                    }
                }

                m.initialized = true;
                m.active = true;
                this._metrics.lastUpdate = isoNow();
                this.log(name, 'Enabled');
                recordMetric('toggle', { mod: name, note: 'enabled' });
                finish();
            });
        },

        disableModule(requestedName) {
            const name = this.resolveComponentName(requestedName);
            const mod = MODULES[name];
            if (!mod) {
                this.log('Core', `No such GameAssist module or service: ${String(requestedName || '').trim() || '(blank)'}`, 'WARN');
                return;
            }
            if (mod.internal) {
                this.log('Core', `${name} is managed by the core and cannot be toggled.`, 'WARN');
                return;
            }
            const configured = getState(name).config.enabled !== false;
            // CHOICE: A configured-but-inactive dependency skip is still enabled from the DM's perspective and must remain disableable.
            if (!configured && !mod.active && !mod.initialized) {
                this.log('Core', `${name} already disabled`, 'INFO');
                return;
            }
            if (_transitioning[name]) {
                this.log('Core', `${name} is already transitioning`, 'WARN');
                return;
            }
            const dependents = [];
            const visitedDependencies = new Set([name]);
            const collectDependents = dependency => {
                Object.entries(MODULES).forEach(([candidate, candidateMod]) => {
                    if (candidateMod.internal || visitedDependencies.has(candidate)) return;
                    if (!(candidateMod.dependsOn || []).includes(dependency)) return;
                    visitedDependencies.add(candidate);
                    collectDependents(candidate);
                    dependents.push(candidate);
                });
            };
            collectDependents(name);

            const transitionNames = [...dependents, name];
            const busyDependency = transitionNames.find(moduleName => _transitioning[moduleName]);
            if (busyDependency) {
                this.log('Core', `${busyDependency} is already transitioning`, 'WARN');
                return;
            }
            transitionNames.forEach(moduleName => { _transitioning[moduleName] = true; });

            _enqueue(() => {
                const disabledDependents = [];
                transitionNames.forEach(moduleName => {
                    const m = MODULES[moduleName];
                    if (!m) {
                        delete _transitioning[moduleName];
                        return;
                    }

                    const branch = getState(moduleName);
                    const wasConfigured = branch.config.enabled !== false;
                    const wasRunning = m.active || m.initialized;
                    m.active = false;

                    if (typeof m.teardown === 'function' && m.wired && (wasConfigured || wasRunning)) {
                        try { m.teardown(); }
                        catch(e) { this.log(moduleName, `Teardown failed: ${e.message}`, 'WARN'); }
                    }

                    branch.config.enabled = false;
                    if (!m.preserveRuntimeOnDisable) branch.runtime = {};
                    m.initialized = false;
                    if (m.service) m.wired = false;

                    if (wasConfigured || wasRunning) {
                        this.log(moduleName, 'Disabled');
                        recordMetric('toggle', { mod: moduleName, note: 'disabled' });
                        if (moduleName !== name) disabledDependents.push(moduleName);
                    }
                    delete _transitioning[moduleName];
                });

                this._metrics.lastUpdate = isoNow();
                if (disabledDependents.length) {
                    this.log(
                        'Core',
                        `${name} was turned off, so ${disabledDependents.join(', ')} ${disabledDependents.length === 1 ? 'was' : 'were'} also turned off. Other GameAssist modules remain available.`,
                        'WARN'
                    );
                    if (name === 'MarkerService') {
                        this.log(
                            'Core',
                            'Standalone TokenMod by The Aaron and StatusInfo by Robin Kuiper can provide separate token-marker and condition tools, but they do not restore GameAssist death-history or concentration features.',
                            'INFO'
                        );
                    }
                }
            });
        },

        createButton(label, command) {
            const safeLabel = _sanitize(label ?? 'Button')
                .replace(/\[/g, '&#91;')
                .replace(/\]/g, '&#93;');
            const trimmed = (command || '').trim();
            if (!trimmed) {
                this.log('Core', 'createButton requires a command string', 'WARN');
                return '';
            }
            const final = trimmed.startsWith('!') ? trimmed : `!${trimmed}`;
            return `[${safeLabel}](${final})`;
        },

        rollTable(tableName) {
            const name = (tableName || '').toString().trim();
            if (!name) {
                this.log('Core', 'rollTable requires a table name', 'WARN');
                return;
            }
            const sanitized = name.replace(/[\[\]]/g, '');
            sendChat('CritFumble', `/roll 1t[${sanitized}]`);
        }
    };

    GameAssist.getState = getState;
    GameAssist.saveState = saveState;
    GameAssist.clearState = clearState;
    GameAssist.getMetricsStore = getMetricsStore;
    GameAssist.recordMetric = recordMetric;
    GameAssist.getLinkedCharacter = getLinkedCharacter;

    globalThis.GameAssist = GameAssist;
    GameAssist.register('MarkerService', () => {
        setMarkerServiceEnabled(true);
    }, {
        enabled: true,
        service: true,
        teardown: () => setMarkerServiceEnabled(false)
    });
    // --- Notes & Comments ---
    // Changed (v0.1.5.1): Exposed GameAssist.Time as the shared validated timezone, display-formatting, and date-key seam used by interfaces and NPCManager.
    // Decision log:
    //   CHOICE: Expose globally under the existing GameAssist name - ALT: add another global; REJECTED: unnecessary global pollution.
    //   CHOICE: Keep normal handlers direct and serialized work explicit through GameAssist.enqueue.
    //   CHOICE: Keep runtime retention as registration-level opt-in - ALT: preserve every runtime cache; REJECTED: changed established lifecycle semantics.
    //   CHOICE: Preserve configured intent when dependency enablement is refused - ALT: force false; REJECTED: concealed dependency-skipped modules.
    //   CHOICE: Disable dependent modules before their service - ALT: disable the service first; REJECTED: dependent teardown would lose the marker access it needs for cleanup.
    // Prior notes:
    //   v0.1.5.0: Exposed GameAssist.MarkerService as a toggleable core service, added case-insensitive module/service lifecycle resolution and protected config-key registration, cascaded service shutdown to dependent modules, and removed marker-module dependency gating on standalone TokenMod.
    //   v0.1.4.7: Public TokenMod contract/API metadata could confirm that external dependency when Roll20 metadata was unavailable.
    //   v0.1.4.6: Refused dependency enable attempts preserved configured intent and configured-but-inactive modules remained disableable.
    //   v0.1.4.5: Added preserveRuntimeOnDisable for durable module-owned records.
    //   v0.1.4.2: Added public opt-in enqueue and three-state dependency diagnostics.
    //   v0.1.4.1: Routed kernel timestamps through the wall-clock seam; no semantic change.
    //   v0.1.4: Hardened logging, adopted captured R20_ON, and added safer command matching.
    //   v0.1.3: Added kernel narrative; behavior unchanged.
    //   v0.1.1.2: Updated MECHSUITS metadata; behavior unchanged.
    // [GAMEASSIST:CORE:OBJECT] END
    // =============================================================================

    // --- Notes & Comments ---
    // Changed (v0.1.5.1): Advanced runtime VERSION for the configurable campaign-timezone release; the established core child order is unchanged.
    // Prior notes:
    //   v0.1.5.0: Added CORE:MARKERSERVICE to the declared child order and advanced runtime VERSION for the integrated marker architecture.
    //   v0.1.4.7: Advanced runtime VERSION for standalone TokenMod/StatusInfo interoperability; child order was unchanged.
    //   v0.1.4.6: Advanced runtime VERSION for DM-readable status; child order was unchanged.
    //   v0.1.4.5: Advanced runtime VERSION for NPC death-history buckets and handouts; child order was unchanged.
    //   v0.1.4.4: Advanced runtime VERSION for DM-facing readability; child order was unchanged.
    //   v0.1.4.3: Advanced runtime VERSION for standalone-interoperability stabilization.
    //   v0.1.4.2: Advanced runtime VERSION for diagnostic and migration readiness.
    //   v0.1.4.1: Advanced runtime VERSION and linked inherited limits to POLICY.
    //   v0.1.3: Added the CORE wrapper to enclose kernel children and satisfy parent rules.
    // [GAMEASSIST:CORE] END
    // =============================================================================

    // ————— INTERFACES (EVENTS + COMMANDS) —————
    // =============================================================================
    // [GAMEASSIST:INTERFACES] BEGIN
    // Section Title: Interfaces wrapper (events + commands)
    // -------------------------------------------------------------------------
    // mechsuit_section: { codename: "GAMEASSIST", area: "INTERFACES", title: "Interfaces wrapper",
    //   guarantees: ["Interfaces are grouped; children retain behavior"],
    //   depends_on: ["[GAMEASSIST:CORE]"], last_updated_version: "v0.1.4" }
    // -------------------------------------------------------------------------
    // Narrative
    // INTERFACES groups inbound chat/event surfaces. Children hold the executable
    // handlers; this wrapper documents scope, ordering, and dependencies while
    // preserving runtime behavior. Roll20 chat is a human-facing event bus rather
    // than HTTP/GraphQL/CLI, so legacy whispers/templates are the declared transport
    // adaptation; GameAssist does not invent trace-id envelopes that Roll20 cannot
    // propagate consistently.
    // -------------------------------------------------------------------------

    // [GAMEASSIST:INTERFACES:EVENTS] BEGIN
    // Section Title: Roll20 handler registry (non-invasive)
    // -------------------------------------------------------------------------
    // mechsuit_section: { codename: "GAMEASSIST", area: "INTERFACES:EVENTS", title: "Handlers",
    //   guarantees: ["Track listeners for safe enable/disable"], last_updated_version: "v0.1.4" }
    // -------------------------------------------------------------------------
    // Narrative
    // INTERFACES:EVENTS tracks handlers registered through GameAssist.onEvent and
    // GameAssist.onCommand without overriding Roll20 globals. Registries live in
    // GameAssist._listeners and GameAssist._commandHandlers; Roll20's native `on`
    // is captured once (R20_ON) and reused to avoid polluting the global scope.
    // -------------------------------------------------------------------------
    // --- Notes & Comments ---
    // CHOICE: Use captured Roll20 `on` without overriding globals; registries remain internal.
    // Changed (v0.1.4): Removed global on/off overrides to prevent cross-script collisions; rely on R20_ON and internal tracking.
    // Prior notes: Maintenance (v0.1.1.2, no semantic change): MECHSUITS metadata refreshed for v1.5.1.
    // [GAMEASSIST:INTERFACES:EVENTS] END

    // [GAMEASSIST:INTERFACES:COMMANDS] BEGIN
    // Section Title: Admin/config commands (!ga-*)
    // -------------------------------------------------------------------------
    // mechsuit_section: { codename: "GAMEASSIST", area: "INTERFACES:COMMANDS", title: "Commands",
    //   guarantees: ["GM-gated admin commands; unsafe and component-protected config keys refused; versioned config-only export; validated timezone menu; plain-language health summary with opt-in marker and standalone-integration details"],
    //   depends_on: ["[GAMEASSIST:POLICY]","[GAMEASSIST:CORE:STATE]","[GAMEASSIST:CORE:MARKERSERVICE]","[GAMEASSIST:CORE:OBJECT]"],
    //   last_updated_version: "v0.1.5.1", lifecycle: "active" }
    // -------------------------------------------------------------------------
    // Narrative
    // INTERFACES:COMMANDS contains GM/admin chat commands for listing modules, toggling
    // config, exporting versioned configuration-only snapshots, and inspecting health.
    // The default status view prioritizes a DM's next action; --details preserves
    // session counters, queue state, timestamps, event-hook counts, dependency evidence,
    // MarkerService lifecycle state and separately detected marker/condition Mod evidence.
    // -------------------------------------------------------------------------
    function getModuleHealth() {
        return Object.entries(MODULES)
            .filter(([, mod]) => !mod.internal)
            .map(([name, mod]) => {
                const cfg = GameAssist.getState(name).config;
                const dependencies = GameAssist._checkDependencies(name);
                const configured = cfg.enabled !== false;
                const running = !!(mod.initialized && mod.active);
                const skipped = configured && !running && dependencies.status === 'missing';

                return { name, mod, cfg, configured, running, skipped, dependencies };
            });
    }

    function formatDependencyStatus(depInfo) {
        if (depInfo.status === 'missing') {
            return `missing (${depInfo.missing.join(', ')})`;
        }
        if (depInfo.status === 'unverifiable') {
            return `unverifiable (${depInfo.unverifiable.join(', ')})`;
        }
        return 'confirmed';
    }

    /**
     * statusPanelText — Sanitize dynamic text at the Roll20 template boundary.
     * Inputs: module names, dependency names, counters, or fixed status guidance.
     * Outputs: chat-safe text with template-closing braces encoded.
     * Invariants: dynamic values cannot create a new default-template field.
     * Failure: nullish values become an empty string; raw values are never emitted.
     * Design: keep escaping at the interface edge so health rules stay readable.
     */
    function statusPanelText(value) {
        return _sanitize(value ?? '')
            .replace(/\{/g, '&#123;')
            .replace(/\}/g, '&#125;');
    }

    function statusField(label, value) {
        const lines = Array.isArray(value) ? value : [value];
        return `{{${statusPanelText(label)}=${lines.map(statusPanelText).join('<br>')}}}`;
    }

    function readableList(items) {
        const values = (items || []).filter(Boolean);
        if (values.length < 2) return values[0] || '';
        if (values.length === 2) return `${values[0]} and ${values[1]}`;
        return `${values.slice(0, -1).join(', ')}, and ${values[values.length - 1]}`;
    }

    function groupDependencies(rows, property) {
        const groups = {};
        rows.forEach(row => {
            (row.dependencies[property] || []).forEach(dependency => {
                if (!groups[dependency]) groups[dependency] = [];
                groups[dependency].push(row.name);
            });
        });
        return Object.entries(groups).map(([dependency, modules]) =>
            `${dependency} for ${readableList(modules)}`
        );
    }

    function formatStatusTimestamp(raw) {
        if (!raw) return 'No activity recorded yet.';
        const parsed = new Date(raw);
        return Number.isFinite(parsed.getTime())
            ? localNow(parsed)
            : 'Time unavailable.';
    }

    function sendTimeZoneMenu(notice = '') {
        const info = getTimeZoneInfo();
        const presetButtons = POLICY.timestamps.commonTimeZones
            .map(option => GameAssist.createButton(option.label, `!ga-timezone set ${option.value}`))
            .join(' ');
        const customButton = GameAssist.createButton('Choose Another Timezone', '!ga-timezone set ?{IANA timezone name|America/New_York}');
        const clearButton = GameAssist.createButton('Use Sandbox Default', '!ga-timezone clear');
        const warning = info.warning
            ? `<div style="margin-top:6px;color:#7a3d00;"><strong>Saved setting needs attention:</strong> ${_sanitize(info.warning)}</div>`
            : '';
        const message = [
            '<div><strong>GameAssist Timezone</strong></div>',
            notice ? `<div style="margin-top:6px;"><strong>${_sanitize(notice)}</strong></div>` : '',
            `<div style="margin-top:6px;"><strong>Current setting:</strong> ${_sanitize(info.label)}</div>`,
            `<div><strong>Current GameAssist time:</strong> ${_sanitize(localNow())}</div>`,
            `<div><strong>Current Session date:</strong> ${_sanitize(localDateKey())}</div>`,
            warning,
            '<div style="margin-top:8px;"><strong>Common choices</strong><br>',
            presetButtons,
            '</div>',
            `<div style="margin-top:8px;">${customButton} ${clearButton}</div>`,
            '<div style="margin-top:7px;font-size:0.9em;">Choose the city/region that governs your table clock. Named timezones follow daylight-saving changes automatically. Existing event timestamps remain unchanged.</div>'
        ].join('');
        sendChat('GameAssist', `/w gm ${message}`);
    }

    /**
     * buildStatusSnapshot — Convert runtime diagnostics into one status model.
     * Inputs: current module lifecycle state, dependency evidence, metrics, and queue state.
     * Outputs: counts plus plain-language health and dependency guidance for both panels.
     * Invariants: disabled modules do not create active dependency warnings; unverifiable is not missing.
     * Failure: absent numeric error data falls back to zero; no state is mutated.
     * Design: classify once so the simple and detailed views cannot disagree.
     */
    function buildStatusSnapshot() {
        const metrics = GameAssist._metrics;
        const modules = getModuleHealth();
        const featureModules = modules.filter(row => !row.mod.service);
        const coreServices = modules.filter(row => row.mod.service);
        const enabled = modules.filter(row => row.configured);
        const running = enabled.filter(row => row.running);
        const stopped = enabled.filter(row => !row.running);
        const disabled = modules.filter(row => !row.configured);
        const missing = enabled.filter(row => row.dependencies.status === 'missing');
        const unverifiable = enabled.filter(row => row.dependencies.status === 'unverifiable');
        const skipped = modules.filter(row => row.skipped);
        const errors = Number(metrics.errors) || 0;
        const missingGroups = groupDependencies(missing, 'missing');
        const unverifiableGroups = groupDependencies(unverifiable, 'unverifiable');

        // CHOICE: Unverifiable remains ready-with-check — ALT: report failure; REJECTED: Roll20 metadata absence is not proof that the dependency is missing.
        let overall;
        if (errors || stopped.length || missing.length) {
            overall = 'Attention needed - review the items below.';
        } else if (unverifiable.length) {
            overall = 'Ready - enabled modules are running. A marker check is recommended.';
        } else {
            overall = 'Ready - GameAssist is responding and every enabled module is running.';
        }

        const enabledFeatureModules = featureModules.filter(row => row.configured);
        const runningFeatureModules = enabledFeatureModules.filter(row => row.running);
        const disabledFeatureModules = featureModules.filter(row => !row.configured);
        const enabledCoreServices = coreServices.filter(row => row.configured);
        const runningCoreServices = enabledCoreServices.filter(row => row.running);
        const disabledCoreServices = coreServices.filter(row => !row.configured);
        const componentLines = [
            `${runningFeatureModules.length} of ${enabledFeatureModules.length} enabled feature module${enabledFeatureModules.length === 1 ? '' : 's'} running.`,
            `${runningCoreServices.length} of ${enabledCoreServices.length} enabled core service${enabledCoreServices.length === 1 ? '' : 's'} running.`,
            `${disabledFeatureModules.length} feature module${disabledFeatureModules.length === 1 ? '' : 's'} and ${disabledCoreServices.length} core service${disabledCoreServices.length === 1 ? '' : 's'} turned off.`
        ];

        const dependencyLines = [];
        if (missingGroups.length) {
            dependencyLines.push(`Missing: ${missingGroups.join('; ')}. Install or enable the dependency, or turn off the affected module.`);
        }
        if (unverifiableGroups.length) {
            dependencyLines.push(`Could not confirm: ${unverifiableGroups.join('; ')}. This is not automatically a failure; test one death or concentration marker.`);
        }
        if (!dependencyLines.length) {
            dependencyLines.push('Required dependencies were confirmed for enabled modules.');
        }

        const avgDuration = metrics.taskDurations.length
            ? `${(metrics.taskDurations.reduce((a, b) => a + b, 0) / metrics.taskDurations.length).toFixed(2)} ms`
            : 'N/A - no queued task duration has been recorded.';

        return {
            metrics,
            modules,
            featureModules,
            coreServices,
            enabled,
            running,
            stopped,
            disabled,
            missing,
            unverifiable,
            skipped,
            errors,
            overall,
            componentLines,
            dependencyLines,
            integrationLines: getStandaloneIntegrationLines(),
            avgDuration,
            listenerCount: Object.values(GameAssist._listeners).flat().length
        };
    }

    function sendStatusPanel(snapshot, detailed = false) {
        const timezone = getTimeZoneInfo();
        const fields = [
            `&{template:default} {{name=GameAssist ${VERSION} System Check}}`,
            statusField('Overall', snapshot.overall),
            statusField('Components', snapshot.componentLines),
            statusField('Timezone', timezone.warning
                ? `${timezone.label}. ${timezone.warning}`
                : `${timezone.label} | ${localNow()} | Session date ${localDateKey()}`),
            statusField('Errors This Sandbox Session', snapshot.errors
                ? `${snapshot.errors} error${snapshot.errors === 1 ? '' : 's'} recorded. Open Troubleshooting Details.`
                : 'None recorded.'),
            statusField('Dependency Check', snapshot.dependencyLines)
        ];

        if (detailed) {
            fields.push(
                statusField('Component Counts', `${snapshot.featureModules.length} feature modules + ${snapshot.coreServices.length} core services | ${snapshot.enabled.length} enabled | ${snapshot.running.length} running | ${snapshot.skipped.length} dependency-skipped`),
                statusField('Session Activity', `${snapshot.metrics.commands} commands handled | ${snapshot.metrics.messages} chat messages observed | ${snapshot.errors} errors recorded`),
                statusField('Queue', `${_queue.length} waiting. Normal Roll20 events run directly; the queue is used only when a feature requests it.`),
                statusField('Average Queued Task Time', snapshot.avgDuration),
                statusField('Last Recorded Activity', formatStatusTimestamp(snapshot.metrics.lastUpdate)),
                statusField('GameAssist Event Hooks', `${snapshot.listenerCount} tracked internally. This is troubleshooting information, not a pass/fail test.`),
                statusField('Marker and Standalone Integrations', snapshot.integrationLines)
            );
        }

        const buttons = detailed
            ? [
                GameAssist.createButton('Refresh Details', '!ga-status --details'),
                GameAssist.createButton('Simple View', '!ga-status'),
                GameAssist.createButton('Modules & Services', '!ga-config modules'),
                GameAssist.createButton('Metrics', '!ga-metrics'),
                GameAssist.createButton('Timezone', '!ga-timezone')
            ]
            : [
                GameAssist.createButton('Troubleshooting Details', '!ga-status --details'),
                GameAssist.createButton('Modules & Services', '!ga-config modules'),
                GameAssist.createButton('Open Settings', '!ga-config ui'),
                GameAssist.createButton('Timezone', '!ga-timezone')
            ];
        const actionTitle = detailed ? 'Troubleshooting Actions' : 'GameAssist Actions';
        const actionRow = `<div><strong>${actionTitle}</strong><br>${buttons.join(' ')}</div>`;

        sendChat('GameAssist', `/w gm ${fields.join(' ')}`);
        // CHOICE: Use a normal whisper for navigation; the live sandbox dropped button-only rows from the default template.
        sendChat('GameAssist', `/w gm ${actionRow}`);
    }

    GameAssist.onCommand('!ga-config', msg => {
        const parts = msg.content.trim().split(/\s+/);
        const sub   = parts[1];
        if (sub === 'list') {
            const ts   = localNow();
            const ver  = `v${VERSION}`;

            const root = ensureStateRoot();
            const snapshot = {
                format: POLICY.snapshots.configFormat,
                schemaVersion: POLICY.snapshots.configSchemaVersion,
                scope: 'configuration-only',
                generatedAt: isoNow(),
                version: VERSION,
                flags: GameAssist.flags,
                globalConfig: root.config || {},
                modules: {}
            };

            Object.entries(MODULES)
                .filter(([, mod]) => !mod.internal)
                .forEach(([name]) => {
                    snapshot.modules[name] = GameAssist.getState(name).config || {};
                });

            const cfg  = JSON.stringify(snapshot, null, 2)
                          .replace(/[<>&]/g, c=>({'<':'&lt;','>':'&gt;','&':'&amp;'})[c]);
            const name = 'GameAssist Config';
            let handout = findObjs({ type:'handout', name })[0];
            if (!handout) handout = createObj('handout', { name, archived:false });
            handout.set('notes', `<pre>Generated: ${ts} (${ver})\nScope: configuration-only; runtime caches and metrics are excluded.\n\n${cfg}</pre>`);
            sendChat('GameAssist', `/w gm Configuration-only snapshot written to "${name}"`);
        }
        else if (sub === 'set' && parts.length >= 4) {
            const requestedMod = parts[2];
            const mod = GameAssist.resolveComponentName(requestedMod);
            const [ key, ...rest ] = parts.slice(3).join(' ').split('=');
            const val = rest.join('=');
            const parsed = parseConfigValue(val);
            const BAD_KEYS = new Set(POLICY.config.unsafeKeys);
            if (!MODULES[mod] || MODULES[mod].internal) {
                GameAssist.log('Config', `Unknown GameAssist module or service: ${requestedMod}`, 'WARN');
                return;
            }
            const k = key.trim();
            if (BAD_KEYS.has(k)) {
                GameAssist.log('Config', `Refusing unsafe config key: ${k}`, 'WARN');
                return;
            }
            if ((MODULES[mod].protectedConfigKeys || []).includes(k)) {
                GameAssist.log('Config', `${mod}.${k} must be changed through that component's validated settings menu.`, 'WARN');
                return;
            }
            if (k === 'enabled') {
                if (typeof parsed !== 'boolean') {
                    GameAssist.log('Config', 'enabled must be true/false', 'WARN');
                    return;
                }
                parsed ? GameAssist.enableModule(mod) : GameAssist.disableModule(mod);
                return;
            }
            GameAssist.getState(mod).config[k] = parsed;
            GameAssist.log('Config', `Set ${mod}.${k} = ${JSON.stringify(parsed)}`);
        }
        else if (sub === 'get') {
            if (parts.length < 3) {
                GameAssist.log('Config', 'Usage: !ga-config get <module-or-service> [key]', 'WARN');
                return;
            }
            const requestedMod = parts[2];
            const mod = GameAssist.resolveComponentName(requestedMod);
            if (!MODULES[mod] || MODULES[mod].internal) {
                GameAssist.log('Config', `Unknown GameAssist module or service: ${requestedMod}`, 'WARN');
                return;
            }
            const modState = GameAssist.getState(mod);
            if (parts.length >= 4) {
                // Get specific key
                const key = parts[3];
                const val = modState.config[key];
                GameAssist.log('Config', `${mod}.${key} = ${JSON.stringify(val)}`);
            } else {
                // Get all config for module
                const cfg = JSON.stringify(modState.config, null, 2);
                GameAssist.log('Config', `${mod} config:\n${cfg}`);
            }
        }
        else if (sub === 'ui') {
            if (typeof GameAssist.renderConfigUI !== 'function') {
                GameAssist.log('Config', 'Config UI module is disabled or unavailable.', 'WARN');
                return;
            }
            const raw = msg.content.trim().split(/\s+/).slice(2).join(' ');
            GameAssist.renderConfigUI(msg.playerid, { rawArgs: raw });
        }
        else if (sub === 'timezone') {
            sendTimeZoneMenu();
        }
        else if (sub === 'modules') {
            const moduleList = Object.entries(MODULES)
                .filter(([, mod]) => !mod.internal)
                .map(([name, mod]) => {
                    const cfg = GameAssist.getState(name).config;
                    const depInfo = GameAssist._checkDependencies(name);
                    const configured = cfg.enabled ? '✅' : '❌';
                    const running = mod.initialized && mod.active ? '🟢' : '⏸️';
                    return `${name}: config ${configured} | runtime ${running} | deps ${formatDependencyStatus(depInfo)}`;
                }).join('\n');
            GameAssist.log('Config', `Modules and Core Services:\n${moduleList}`);
        }
        else if (sub === 'cleanup') {
            const root = ensureStateRoot();
            const whitelist = new Set(['config', 'flags', 'metrics']);
            const known = new Set(Object.keys(MODULES));

            const removed = [];
            Object.keys(root).forEach(k => {
                if (whitelist.has(k)) return;
                if (!known.has(k)) { delete root[k]; removed.push(k); }
            });

            GameAssist.log('Config', removed.length
                ? `Removed orphaned module state branches: ${removed.join(', ')}`
                : 'No orphaned module state branches found.');
        }
        else {
            GameAssist.log('Config', 'Usage: !ga-config list|set|get|modules|cleanup|timezone [args]');
        }
    }, 'Core', { gmOnly: true });

    GameAssist.onCommand('!ga-timezone', msg => {
        const raw = String(msg.content || '').replace(/^!ga-timezone\s*/i, '').trim();
        if (!raw || /^help$/i.test(raw)) {
            sendTimeZoneMenu();
            return;
        }
        if (/^(?:clear|default|sandbox)$/i.test(raw)) {
            ensureStateRoot().config.timezone = null;
            const rolled = MODULES.NPCManager?.active
                && typeof GameAssist.NPCManager?.refreshSessionDate === 'function'
                && GameAssist.NPCManager.refreshSessionDate({ announce: false });
            sendTimeZoneMenu(`GameAssist will use the Roll20 sandbox clock until another timezone is selected.${rolled ? ' The active date-managed Session was updated.' : ''}`);
            return;
        }

        const match = raw.match(/^set\s+(.+)$/i);
        if (!match) {
            GameAssist.log('Time', 'Use !ga-timezone, !ga-timezone set <IANA timezone>, or !ga-timezone clear.', 'WARN');
            return;
        }
        const requested = match[1].trim().replace(/^(?:"([\s\S]*)"|'([\s\S]*)')$/, '$1$2');
        const validation = validateTimeZone(requested);
        if (!validation.ok || !validation.value) {
            GameAssist.log('Time', validation.message || 'Choose a named timezone such as America/New_York.', 'WARN');
            return;
        }
        ensureStateRoot().config.timezone = validation.value;
        const rolled = MODULES.NPCManager?.active
            && typeof GameAssist.NPCManager?.refreshSessionDate === 'function'
            && GameAssist.NPCManager.refreshSessionDate({ announce: false });
        sendTimeZoneMenu(`Timezone set to ${validation.value}.${rolled ? ' The active date-managed Session was updated.' : ''}`);
    }, 'Core', { gmOnly: true });

    // ————— CONTROL COMMANDS —————
    GameAssist.onCommand('!ga-enable', msg => {
        const mod = msg.content.split(/\s+/)[1];
        if (!mod) {
            GameAssist.log('Core', 'Usage: !ga-enable <module-or-service>', 'WARN');
            return;
        }
        GameAssist.enableModule(mod);
    }, 'Core', { gmOnly: true });

    GameAssist.onCommand('!ga-disable', msg => {
        const mod = msg.content.split(/\s+/)[1];
        if (!mod) {
            GameAssist.log('Core', 'Usage: !ga-disable <module-or-service>', 'WARN');
            return;
        }
        GameAssist.disableModule(mod);
    }, 'Core', { gmOnly: true });

    GameAssist.onCommand('!ga-status', msg => {
        const detailed = /(?:^|\s)(?:--details|details)(?:\s|$)/i.test(msg.content || '');
        sendStatusPanel(buildStatusSnapshot(), detailed);
    }, 'Core', { gmOnly: true });

    GameAssist.onCommand('!ga-metrics', msg => {
        const parts = msg.content.trim().split(/\s+/);
        const sub = (parts[1] || 'summary').toLowerCase();

        if (sub === 'reset') {
            resetMetricsStore();
            GameAssist._metrics.commands = 0;
            GameAssist._metrics.messages = 0;
            GameAssist._metrics.errors = 0;
            GameAssist._metrics.stateAudits = 0;
            GameAssist._metrics.taskDurations = [];
            GameAssist._metrics.lastUpdate = isoNow();
            recordMetric('system', { mod: 'Core', note: 'Metrics reset' });
            GameAssist.log('Metrics', 'Metrics reset. Session counters cleared.');
            return;
        }

        const store = getMetricsStore();
        const totals = store.totals || {};
        const durations = store.durations || [];
        const labels = {
            command: 'Commands',
            event: 'Events',
            task: 'Queue Tasks',
            [POLICY.metrics.queueDurationName]: 'Queue Duration Samples',
            toggle: 'Module Toggles',
            error: 'Errors',
            audit: 'State Audits',
            state_repair: 'State Repairs',
            system: 'System Events'
        };

        const summary = [
            '**GameAssist Metrics**',
            `Session Start: ${store.sessionStart || 'unknown'}`,
            `Last Update: ${store.lastUpdate || 'unknown'}`
        ];

        Object.entries(labels).forEach(([key, label]) => {
            summary.push(`${label}: ${totals[key] || 0}`);
        });

        const extraKeys = Object.keys(totals).filter(key => !labels[key]).sort();
        extraKeys.forEach(key => {
            summary.push(`${key}: ${totals[key]}`);
        });

        if (durations.length) {
            const totalDur = durations.reduce((acc, val) => acc + val, 0);
            const avg = (totalDur / durations.length).toFixed(2);
            const min = Math.min(...durations);
            const max = Math.max(...durations);
            summary.push(`Queue Durations (last ${durations.length}): avg ${avg}ms | min ${min}ms | max ${max}ms`);
        } else {
            summary.push('Queue Durations: no tasks recorded yet.');
        }

        const history = (store.history || []).slice(-5).reverse();
        if (history.length) {
            summary.push('Recent activity:');
            history.forEach(entry => {
                const segments = [];
                if (entry.ts) segments.push(entry.ts);
                segments.push(entry.type);
                if (entry.mod) segments.push(`[${entry.mod}]`);
                if (entry.note) segments.push(`— ${entry.note}`);
                summary.push(`• ${segments.join(' ')}`.trim());
            });
        } else {
            summary.push('Recent activity: none logged.');
        }

        GameAssist.log('Metrics', summary.join('\n'));
    }, 'Core', { gmOnly: true });
    // --- Notes & Comments ---
    // Changed (v0.1.5.1): Added GM-only timezone configuration, status visibility, common/custom selection buttons, validation diagnostics, sandbox-default restoration, and immediate NPC Session-date refresh when that module is running.
    // Decision log:
    //   CHOICE: Keep command syntax identical to legacy for drop-in replacement.
    //   CHOICE: Keep the default status action-oriented and volatile counters behind --details - ALT: one exhaustive panel; REJECTED: obscured the health signal.
    //   CHOICE: Send status navigation as a separate normal whisper - ALT: button-only template row; REJECTED: Roll20 omitted that row in live testing.
    //   CHOICE: Report dependency certainty instead of treating unavailable script metadata as absence.
    //   CHOICE: Export flags/global/module config in one snapshot - ALT: module-only export; REJECTED: incomplete configuration evidence.
    // Prior notes:
    //   v0.1.5.0: Status and configuration output distinguish feature modules from core services, troubleshooting details identify MarkerService lifecycle state, component names resolve case-insensitively, and validated configuration maps cannot be replaced through the generic setter.
    //   v0.1.4.7: Troubleshooting details reported TokenMod and optional StatusInfo contract/version evidence.
    //   v0.1.4.6: Rebuilt !ga-status as a plain-language system check, moved volatile data behind --details, and separated navigation buttons.
    //   v0.1.4.3: Replaced an editorial guarantee label with specific health states; no semantic change.
    //   v0.1.4.2: Added versioned configuration-only snapshots and module/dependency health reporting.
    //   v0.1.4.1: Ported the complete config snapshot while retaining key safety and enabled routing.
    //   v0.1.4: Refused unsafe keys, routed enabled toggles through lifecycle methods, and expanded get/modules output.
    //   v0.1.3: Added narrative describing GM/admin scope; no semantic change.
    //   v0.1.1.2: Updated MECHSUITS tracking fields; no semantic change.
    // [GAMEASSIST:INTERFACES:COMMANDS] END
    // =============================================================================

    // --- Notes & Comments ---
    // Maintenance (v0.1.4.1, no semantic change): Documented the Roll20 chat-envelope adaptation and preserved command order.
    // Maintenance (v0.1.3, no semantic change): Introduced INTERFACES wrapper to nest
    //   events/commands under a parent section for MECHSUITS compliance while
    //   preserving handler behavior and ordering.
    // Prior notes: N/A (wrapper added for compliance).
    // [GAMEASSIST:INTERFACES] END
    // =============================================================================

    // ————— MODULES —————
    // =============================================================================
    // [GAMEASSIST:MODULES] BEGIN
    // Section Title: Modules wrapper (bundled features)
    // -------------------------------------------------------------------------
    // mechsuit_section: { codename: "GAMEASSIST", area: "MODULES", title: "Modules wrapper",
    //   guarantees: ["Bundled feature modules remain grouped and independently lifecycle-managed","Condition, token, and gameplay marker consumers share CORE:MARKERSERVICE","TokenAssist owns the documented GameAssist token-command surface without assuming the TokenMod brand"],
    //   depends_on: ["[GAMEASSIST:CORE]","[GAMEASSIST:INTERFACES]"], last_updated_version: "v0.1.5.0" }
    // -------------------------------------------------------------------------
    // Narrative
    // MODULES encloses all shipped feature modules. Each child retains its own
    // guarantees and version signals; this wrapper documents grouping and
    // sequencing while child sections own their observable behavior.
    // -------------------------------------------------------------------------

    // ————— CONFIG UI MODULE v0.2.0 —————
    // =============================================================================
    // [GAMEASSIST:MODULES:CONFIGUI] BEGIN
    // Section Title: Config UI module
    // -------------------------------------------------------------------------
    // mechsuit_section: { codename: "GAMEASSIST", area: "MODULES:CONFIGUI", title: "Config UI",
    //   guarantees: ["GM chat menu for module and core-service toggles, timezone access, and quick config"],
    //   depends_on: ["[GAMEASSIST:POLICY]","[GAMEASSIST:INTERFACES:COMMANDS]"],
    //   last_updated_version: "v0.1.5.1",
    //   independent_versions: { module_version: "0.2.0" } }
    // -------------------------------------------------------------------------
    // Narrative
    // MODULES:CONFIGUI provides GM-facing chat controls to page through modules,
    // toggle enablement, identify core services, and write configs without changing legacy defaults. It reuses
    // shared button helpers for consistency across modules.
    // -------------------------------------------------------------------------
    GameAssist.register('ConfigUI', function() {
        const modState = GameAssist.getState('ConfigUI');
        Object.assign(modState.config, {
            enabled: true,
            pageSize: POLICY.configUi.pageSize,
            showSummaries: true,
            ...modState.config
        });

        function getPageSize() {
            const raw = modState.config.pageSize;
            const parsed = Number(raw);
            return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : POLICY.configUi.pageSize;
        }

        function formatValue(value) {
            if (value === null || value === undefined) return '—';
            if (typeof value === 'object') {
                try { return JSON.stringify(value); }
                catch { return '[object]'; }
            }
            return String(value);
        }

        function formatConfigSummary(cfg) {
            const entries = Object.entries(cfg || {})
                .filter(([key]) => key !== 'enabled')
                .map(([key, val]) => {
                    let display = formatValue(val);
                    if (key === 'conditions' && val && typeof val === 'object' && !Array.isArray(val)) {
                        display = `${Object.keys(val).length} definitions`;
                    } else if (key === 'legacyStatusInfoMigration' && val && typeof val === 'object') {
                        display = 'completed';
                    }
                    return `<span><strong>${_sanitize(key)}</strong>: ${_sanitize(display)}</span>`;
                });
            return entries.length ? entries.join(' • ') : '';
        }

        function buildConfigButtons(name, cfg) {
            return Object.entries(cfg || {})
                .filter(([key, val]) => key !== 'enabled' && typeof val === 'boolean')
                .map(([key, val]) => {
                    const label = `${key}: ${val ? 'ON' : 'OFF'}`;
                    const next  = (!val).toString();
                    return GameAssist.createButton(label, `!ga-config set ${name} ${key}=${next}`);
                })
                .join(' ');
        }

        function parsePage(rawArgs) {
            if (!rawArgs) return 0;
            const parsed = _parseArgs(rawArgs);
            const pageArg = parsed.args.page;
            if (typeof pageArg === 'number') return Math.max(0, pageArg);
            if (typeof pageArg === 'string') {
                const val = parseInt(pageArg, 10);
                if (!isNaN(val)) return Math.max(0, val);
            }
            if (parsed.cmd && /^\d+$/.test(parsed.cmd)) {
                return Math.max(0, parseInt(parsed.cmd, 10));
            }
            const direct = rawArgs.split(/\s+/).find(part => /^\d+$/.test(part));
            if (direct) return Math.max(0, parseInt(direct, 10));
            return 0;
        }

        function getModuleEntries() {
            return Object.entries(MODULES)
                .filter(([, mod]) => !mod.internal)
                .sort((a, b) => a[0].localeCompare(b[0], 'en', { sensitivity: 'base' }));
        }

        function buildNav(page, total) {
            if (total <= 1) return '';
            const buttons = [];
            if (page > 0) {
                buttons.push(GameAssist.createButton('⬅ Prev', `!ga-config ui --page ${page - 1}`));
            }
            buttons.push(GameAssist.createButton('🔄 Refresh', `!ga-config ui --page ${page}`));
            if (page < total - 1) {
                buttons.push(GameAssist.createButton('Next ➡', `!ga-config ui --page ${page + 1}`));
            }
            return buttons.join(' ');
        }

        function renderModuleBlock(name, mod) {
            const branch = GameAssist.getState(name);
            const cfg    = branch.config || {};
            const enabled = cfg.enabled !== false;
            const active  = !!(mod.initialized && mod.active);
            const statusIcon = enabled ? (active ? '🟢' : '⏸️') : '⛔';
            const statusText = enabled ? (active ? 'Enabled' : 'Disabled (inactive)') : 'Disabled';
            const typeLabel = mod.service ? ' <span style="font-size:smaller;">(core service)</span>' : '';
            const toggleCmd  = enabled ? `!ga-disable ${name}` : `!ga-enable ${name}`;
            const toggleBtn  = GameAssist.createButton(`${enabled ? 'Disable' : 'Enable'} ${name}`, toggleCmd);
            const configButtons = buildConfigButtons(name, cfg);
            const summary = modState.config.showSummaries ? formatConfigSummary(cfg) : '';

            const rows = [
                `${statusIcon} <strong>${_sanitize(name)}</strong>${typeLabel} — ${_sanitize(statusText)}`,
                toggleBtn
            ];
            if (configButtons) {
                rows.push(`Config: ${configButtons}`);
            }
            if (summary) {
                rows.push(summary);
            }
            return `<div style="margin-top:4px;">${rows.join('<br>')}</div>`;
        }

        function renderInternal(playerId, { page: explicitPage, rawArgs = '' } = {}) {
            const modules = getModuleEntries();
            if (!modules.length) {
                sendChat('GameAssist', '/w gm No modules registered.');
                return;
            }

            const pageSize = getPageSize();
            const totalPages = Math.max(1, Math.ceil(modules.length / pageSize));
            let page = typeof explicitPage === 'number' ? explicitPage : parsePage(rawArgs);
            if (!Number.isFinite(page) || page < 0) page = 0;
            if (page > totalPages - 1) page = totalPages - 1;

            const slice = modules.slice(page * pageSize, page * pageSize + pageSize);
            const blocks = slice.map(([name, mod]) => renderModuleBlock(name, mod)).join('');
            const nav = buildNav(page, totalPages);

            const timezone = getTimeZoneInfo();
            const header = `<div><strong>🛠️ GameAssist Config UI</strong> <span style="font-size:smaller;">Page ${page + 1}/${totalPages}</span></div>`;
            const timezoneRow = [
                '<div style="margin-top:5px;padding-bottom:5px;border-bottom:1px solid #ddd;">',
                `<strong>Table timezone:</strong> ${_sanitize(timezone.label)}<br>`,
                `${GameAssist.createButton('Manage Timezone', '!ga-timezone')} `,
                `<span style="font-size:smaller;">Session date ${_sanitize(localDateKey())}</span>`,
                '</div>'
            ].join('');
            const footer = '<div style="margin-top:4px; font-size:smaller;">Use !ga-config set &lt;Module&gt; key=value for advanced settings.</div>';
            const navLine = nav ? `<div style="margin-top:4px;">${nav}</div>` : '';

            const message = `${header}${timezoneRow}${blocks}${navLine}${footer}`;
            sendChat('GameAssist', `/w gm ${message}`);
        }

        GameAssist.renderConfigUI = function(playerId, options = {}) {
            if (!MODULES.ConfigUI?.initialized || !MODULES.ConfigUI?.active) {
                GameAssist.log('ConfigUI', 'Config UI module is disabled.', 'WARN');
                return;
            }
            renderInternal(playerId, options);
        };

        GameAssist.onCommand('!ga-config-ui', msg => {
            const rawArgs = msg.content.replace(/^!ga-config-ui\s*/i, '');
            renderInternal(msg.playerid, { rawArgs });
        }, 'ConfigUI', { gmOnly: true });

        GameAssist.log('ConfigUI', 'Ready: !ga-config ui (or !ga-config-ui) to open chat controls.', 'INFO', { startup: true });
    }, {
        enabled: true,
        prefixes: ['!ga-config-ui', '!ga-config ui']
    });
    // --- Notes & Comments ---
    // Changed (v0.1.5.1): ConfigUI module_version advanced to 0.2.0 and now exposes the active table timezone, current Session date, and direct timezone settings access on every page.
    // Decision log:
    //   CHOICE: Button helper reused; nav uses the same command path for refresh/paging.
    // Prior notes:
    //   v0.1.5.0: Core services appeared with an explicit label, used the same guarded enable/disable controls as modules, and summarized large condition/migration maps without dumping them into the settings panel.
    //   Maintenance (v0.1.4.1, no semantic change): Routed the unchanged default page size through POLICY.
    //   Maintenance (v0.1.3, no semantic change): Added module narrative; preserved UI behavior and pagination defaults.
    //   Maintenance (v0.1.1.2, no semantic change): Updated section metadata for MECHSUITS v1.5.1.
    // [GAMEASSIST:MODULES:CONFIGUI] END
    // =============================================================================

    // ————— CRITFUMBLE MODULE v0.2.4.9 —————
    // =============================================================================
    // [GAMEASSIST:MODULES:CRITFUMBLE] BEGIN
    // Section Title: CritFumble module
    // -------------------------------------------------------------------------
    // mechsuit_section: { codename: "GAMEASSIST", area: "MODULES:CRITFUMBLE", title: "CritFumble",
    //   guarantees: ["Readable help output; natural‑1 detection bugfix retained"],
    //   depends_on: ["[GAMEASSIST:POLICY]","[GAMEASSIST:APP:UTILS]"],
    //   last_updated_version: "v0.1.4.4",
    //   independent_versions: { module_version: "0.2.4.9" } }
    // -------------------------------------------------------------------------
    // Narrative
    // MODULES:CRITFUMBLE watches rolltemplate outputs for natural-1 results and serves
    // confirm/fumble menus with legacy tables. It keeps the prior bugfix for
    // inlineroll detection intact while relying on core helpers for logging and state.
    // -------------------------------------------------------------------------
    GameAssist.register('CritFumble', function() {
        // ─── Module Setup ──────────────────────────────────────────────────────────────
        const modState = GameAssist.getState('CritFumble');
        Object.assign(modState.config, {
            enabled:   true,
            debug:     false,
            useEmojis: true,
            rollDelayMs: POLICY.critFumble.rollDelayMs,
            // Preserve any values previously saved in state
            ...modState.config
        });

        const ACTIVE_PLAYER_LIMIT = POLICY.runtime.activePlayerLimit;

        // ─── Constants ─────────────────────────────────────────────────────────────────
        /** Roll20 rolltemplates monitored for natural-1s */
        const VALID_TEMPLATES = ['atk','atkdmg','npcatk','npcfullatk','npcaction','spell','simple','dmg','default'];
        const FUMBLE_TABLES = {
            melee:   'CF-Melee',
            ranged:  'CF-Ranged',
            spell:   'CF-Spell',
            natural: 'CF-Natural',
            thrown:  'CF-Thrown'
        };
        const FUMBLE_TYPE_ORDER = ['melee', 'ranged', 'thrown', 'spell', 'natural'];
        // Lookup for confirm tables
        const CONFIRM_TABLES = {
            'confirm-crit-martial': 'Confirm-Crit-Martial',
            'confirm-crit-magic':   'Confirm-Crit-Magic'
        };
        const REQUIRED_TABLES = [
            ...FUMBLE_TYPE_ORDER.map(type => FUMBLE_TABLES[type]),
            'Confirm-Crit-Martial',
            'Confirm-Crit-Magic'
        ];

        function ensureCritFumbleRuntime() {
            const runtime = ensureRuntimeObject(modState);
            runtime.activePlayers = ensureModRuntimeKey(modState, 'activePlayers', 'object');
            return runtime;
        }

        function getActivePlayerTs(entry) {
            const ts = Number(entry && entry.ts);
            return (Number.isFinite(ts) && ts > 0) ? ts : 0;
        }

        function pruneActivePlayers(rt) {
            const entries = Object.entries(rt.activePlayers);
            if (entries.length <= ACTIVE_PLAYER_LIMIT) return;

            entries
                .sort(([, a], [, b]) => getActivePlayerTs(a) - getActivePlayerTs(b))
                .slice(0, entries.length - ACTIVE_PLAYER_LIMIT)
                .forEach(([id]) => delete rt.activePlayers[id]);
        }

        function noteActivePlayer(rt, playerId) {
            const p = getObj('player', playerId);
            if (!p) return;

            const seenAt = sanitizeTimestamp(now());
            const entry = rt.activePlayers[playerId];

            if (typeof entry === 'string') {
                rt.activePlayers[playerId] = { name: entry, ts: seenAt };
            } else if (!entry || typeof entry !== 'object') {
                rt.activePlayers[playerId] = { name: p.get('displayname'), ts: seenAt };
            } else {
                entry.name = entry.name || p.get('displayname');
                entry.ts = seenAt;
            }

            pruneActivePlayers(rt);
        }

        // ─── Helper Functions ──────────────────────────────────────────────────────────
        /**
         * debugLog(msg)
        *   Logs to the GM only when debug mode is on.
        *   Uses GameAssist.log under the hood.
        */
        function debugLog(msg) {
            if (modState.config.debug) {
                GameAssist.log('CritFumble', msg);
            }
        }
        function emoji(sym) {
            return modState.config.useEmojis ? sym : '';
        }

        // Strip off any " (GM)" suffix so /w target resolves
        function sanitizeWho(who) {
            return who.replace(/ \(GM\)$/, '');
        }

        function whisperPrefix(who) {
            const cleaned = sanitizeWho(String(who || ''));
            if (cleaned.toLowerCase() === 'gm') return '/w gm ';
            return `/w "${cleaned}" `;
        }

        function sendTemplateMessage(who,title,fields) {
            const content = fields.map(f=>`{{${f.label}=${f.value}}}`).join(' ');
            sendChat('CritFumble', `${whisperPrefix(who)}&{template:default} {{name=${title}}} ${content}`);
        }

        function getFumbleTableName(type) {
            return FUMBLE_TABLES[type]||null;
        }

        function sendConfirmMenu(who) {
    const confirmButtons = [
        GameAssist.createButton('Confirm-Crit-Martial', '!confirm-crit-martial'),
        GameAssist.createButton('Confirm-Crit-Magic', '!confirm-crit-magic')
    ].join(' ');

    // Send to player
    sendTemplateMessage(who, `${emoji('❓')} Confirm Critical Miss`, [
        { label: "Choose Confirmation Type", value: confirmButtons }
    ]);
    // Also send to GM
    sendTemplateMessage('gm', `${emoji('❓')} Confirm Critical Miss for ${who}!`, [
        { label: "Choose Confirmation Type", value: confirmButtons }
    ]);
}

        function sendFumbleMenu(who) {
            sendConfirmMenu(who);
            const buttons = [
                GameAssist.createButton('⚔ Melee', '!critfumble-melee'),
                GameAssist.createButton('🏹 Ranged', '!critfumble-ranged'),
                GameAssist.createButton('🎯 Thrown', '!critfumble-thrown'),
                GameAssist.createButton('🔥 Spell', '!critfumble-spell'),
                GameAssist.createButton('👊 Natural/Unarmed', '!critfumble-natural')
            ].join(' ');
            sendTemplateMessage(who, `${emoji('💥')} Critical Miss!`, [
                { label: "What kind of attack was this?", value: buttons }
            ]);
            // also whisper to GM for awareness
            sendTemplateMessage('gm', `${emoji('💥')} Critical Miss for ${who}!`, [
                { label: "What kind of attack was this?", value: buttons }
            ]);
        }

        function announceTableRoll(tableName) {
            sendTemplateMessage('gm', `${emoji('🎲')} Rolling Table`, [
                { label: "Table", value: `**${tableName}**` }
            ]);
        }
        function executeTableRoll(tableName) {
            setTimeout(()=>{
                GameAssist.rollTable(tableName);
                debugLog(`Roll command executed: /roll 1t[${tableName}]`);
            }, modState.config.rollDelayMs);
        }

        function rollFumbleTable(who,type) {
            const table = getFumbleTableName(type);
            if (!table) {
                sendTemplateMessage(who, "⚠️ Invalid Fumble Type", [
                    { label: "Requested",    value: `"${type}"` },
                    { label: "Valid Types",  value: FUMBLE_TYPE_ORDER.join(', ') }
                ]);
                debugLog(`Invalid fumble type "${type}"`);
                return;
            }
            announceTableRoll(table);
            executeTableRoll(table);
        }

        function rollConfirmTable(who,rawCommand) {
            const table = CONFIRM_TABLES[rawCommand.toLowerCase()];
            if (!table) {
                sendTemplateMessage(who, "⚠️ Invalid Confirm Type", [
                    { label: "Requested",     value: `"${rawCommand}"` },
                    { label: "Valid Options", value: Object.values(CONFIRM_TABLES).join(', ') }
                ]);
                debugLog(`Invalid confirm type "${rawCommand}"`);
                return;
            }
            announceTableRoll(table);
            executeTableRoll(table);
        }

        function hasNaturalOne(inlinerolls) {
    for (const group of inlinerolls) {
        if (!group || !group.results || !Array.isArray(group.results.rolls)) continue;
        for (const roll of group.results.rolls) {
            // Only look at d20 dice rolls
            if (roll.type !== 'R' || roll.sides !== 20 || !Array.isArray(roll.results)) continue;
            for (const result of roll.results) {
                // Defensive: result must have .v (value); .r is not always present
                if (typeof result.v !== 'number') continue;
                if (result.v === 1) return true;
            }
        }
    }
    return false;
}

        function showManualTriggerMenu() {
            const rt = ensureCritFumbleRuntime();
            const entries = Object.entries(rt.activePlayers || {});
            if (!entries.length) {
                sendTemplateMessage('gm', "⚠️ No Players Detected", [
                    { label:"Note", value:"No players have been active yet this session." }
                ]);
                return;
            }
            const buttons = entries.map(([pid, entry]) => {
                const label = typeof entry === 'string' ? entry : entry?.name || pid;
                return GameAssist.createButton(label, `!critfumblemenu --pid ${pid}`);
            }).join(' ');
            sendTemplateMessage('gm',"Manually Trigger Fumble Menu",[
                { label:"Select Player", value:buttons }
            ]);
        }

        function handleManualTrigger(playerId) {
            const p = getObj('player', playerId);
            if (!p) return;
            sendFumbleMenu(p.get('displayname').replace(/ \(GM\)$/, ''));
            debugLog(`Manually triggered fumble menu for: ${playerId}`);
        }

        function showHelpMessage(who) {
            const menuButton = GameAssist.createButton('Open Natural 1 Menu', '!critfumble menu');
            sendTemplateMessage(who, "CritFumble Quick Reference", [
                { label: "What It Does", value: "Helps resolve natural 1 attack rolls with a guided Natural 1 menu or direct table rolls." },
                { label: "Best First Step", value: menuButton },
                { label: "Common Commands", value: "!critfumble menu = guided Natural 1 menu<br>!critfail = open the player picker directly<br>!critfumble-melee = roll melee<br>!critfumble-ranged = roll ranged<br>!critfumble-thrown = roll thrown<br>!critfumble-spell = roll spell<br>!critfumble-natural = roll natural" },
                { label: "Attack Types", value: "melee, ranged, thrown, spell, natural" },
                { label: "Before First Use", value: "Create Roll20 rollable tables with these exact names:<br>" + REQUIRED_TABLES.join('<br>') }
            ]);
        }

        function showCritFumbleMenu(who) {
            const pickerButton = GameAssist.createButton('Open Player Picker', '!critfail');
            const directButtons = FUMBLE_TYPE_ORDER
                .map(type => GameAssist.createButton(type.charAt(0).toUpperCase() + type.slice(1), `!critfumble-${type}`))
                .join(' ');
            const confirmButtons = [
                GameAssist.createButton('Martial Confirm', '!confirm-crit-martial'),
                GameAssist.createButton('Magic Confirm', '!confirm-crit-magic')
            ].join(' ');

            sendTemplateMessage(who, "CritFumble Help: Natural 1 Attacks", [
                { label: "When To Use", value: "Use this when a player rolls a natural 1 on an attack." },
                { label: "Normal Steps", value: "1. Click Open Player Picker.<br>2. Choose the player who rolled the natural 1.<br>3. The player chooses the attack type.<br>4. GameAssist rolls the fumble result." },
                { label: "Start", value: pickerButton },
                { label: "Attack Types", value: "melee = close weapon<br>ranged = bow, crossbow, or firearm<br>thrown = thrown weapon<br>spell = spell attack<br>natural = bite, claw, or unarmed" },
                { label: "Roll Directly", value: directButtons },
                { label: "Confirm Rolls", value: confirmButtons }
            ]);
        }

        function handleRoll(msg) {
            if (!msg) return;

            // Ignore GameAssist's own log messages and CritFumble's own messages to prevent feedback loops
            if (msg.who === 'GameAssist' || msg.who === 'CritFumble') return;

            const rt = ensureCritFumbleRuntime();

            // register active players
            if (msg.playerid) noteActivePlayer(rt, msg.playerid);

            // API‐style commands
            if (msg.type==='api') {
                const rawCmd = (msg.content||'').trim();
                const cmd = rawCmd.toLowerCase();

                if (cmd==='!critfail') {
                    debugLog(`Manual trigger: ${rawCmd}`);
                    return showManualTriggerMenu();
                }
                if (/^!critfumble\s+menu$/.test(cmd)) {
                    return showCritFumbleMenu(msg.who);
                }
                if (/^!critfumble(?:\s+help)?$/.test(cmd)) {
                    return showHelpMessage(msg.who);
                }
                if (cmd.startsWith('!critfumblemenu')) {
                    const { args } = _parseArgs(rawCmd.replace('!critfumblemenu', '').trim());
                    if (args.pid) {
                        return handleManualTrigger(String(args.pid));
                    }
                    return;
                }
                if (cmd.startsWith('!critfumble-')) {
                    const who        = sanitizeWho(msg.who);
                    const fumbleType = cmd.slice('!critfumble-'.length).split(/\s+/)[0];
                    debugLog(`${who} selected fumble type: ${fumbleType}`);
                    return rollFumbleTable(who, fumbleType);
                }
                if (cmd.startsWith('!confirm-crit-')) {
                    const who        = sanitizeWho(msg.who);
                    const rawCommand = msg.content.slice(1);  // e.g. "confirm-crit-martial"
                    debugLog(`${who} selected confirm type: ${rawCommand}`);
                    return rollConfirmTable(who, rawCommand);
                }
                return;
            }

            // auto-detect natural 1 on a valid rolltemplate
            if (!msg.rolltemplate) {
                if (modState.config.debug) debugLog('No rolltemplate in message');
                return;
            }
            if (!VALID_TEMPLATES.includes(msg.rolltemplate)) {
                if (modState.config.debug) debugLog(`Rolltemplate "${msg.rolltemplate}" not in VALID_TEMPLATES: ${VALID_TEMPLATES.join(', ')}`);
                return;
            }
            const rolls = msg.inlinerolls||[];
            if (!hasNaturalOne(rolls)) {
                if (modState.config.debug) debugLog(`No natural 1 detected in ${rolls.length} inline roll(s)`);
                return;
            }

            const who = sanitizeWho(msg.who);
            debugLog(`Fumble detected from: ${who}`);
            sendFumbleMenu(who);
        }

        GameAssist.onEvent('chat:message', handleRoll, 'CritFumble');
        GameAssist.log('CritFumble','v0.2.4.9 Ready: Auto fumble detection + !critfumble help/menu','INFO',{startup:true});
    }, {
        enabled: true,
        events:   ['chat:message'],
        prefixes: ['!critfail','!critfumble']
    });
    // --- Notes & Comments ---
    // Bugfix retained: robust natural‑1 detection across templates/inlineroll variants.
    // Changed (v0.1.4.4): CritFumble help is a quick reference; !critfumble menu opens the guided natural-1 dialogue; !critfail remains the direct player picker; command parsing tolerates extra whitespace and mixed-case direct rolls.
    // Maintenance (v0.1.4.3, no semantic change): Reworded an internal comment for collaborator clarity.
    // Maintenance (v0.1.4.1, no semantic change): Routed unchanged defaults through POLICY and timestamps through now().
    // Prior notes:
    //   Changed (v0.1.4): Default debug off, corrected GM whisper handling, and made manual buttons target player ids.
    //   Maintenance (v0.1.3, no semantic change): Added runtime self-healing for activePlayers and deterministic pruning.
    //   Maintenance (v0.1.3, no semantic change): Added module narrative; retained natural-1 detection behavior.
    //   Maintenance (v0.1.1.2, no semantic change): MECHSUITS metadata updated only.
    // [GAMEASSIST:MODULES:CRITFUMBLE] END
    // =============================================================================

    // ————— CONDITION ASSIST MODULE v1.0.1 —————
    // =============================================================================
    // [GAMEASSIST:MODULES:CONDITIONASSIST] BEGIN
    // Section Title: GameAssist condition descriptions and controls
    // -------------------------------------------------------------------------
    // mechsuit_section: { codename: "GAMEASSIST", area: "MODULES:CONDITIONASSIST", title: "ConditionAssist",
    //   guarantees: ["2014 SRD condition wording is the default, with selectable 2024 SRD and campaign-custom wording","!condition and case-insensitive !cond-[condition] provide condition-reference workflows for official and campaign conditions","Selected-token menus and current-page status report configured conditions from actual marker state and distinguish other active markers","Built-in and registered custom marker artwork may accompany readable condition text","GM announcements toggle and verify selected token markers before reporting character-first is/is-no-longer results through explicit public/private delivery","All condition marker reads, writes, and observations use CORE:MARKERSERVICE","Legacy state.STATUSINFO may be copied through a validated migration and is never silently deleted"],
    //   depends_on: ["[GAMEASSIST:POLICY]","[GAMEASSIST:APP:UTILS]","[GAMEASSIST:CORE:MARKERSERVICE]","[GAMEASSIST:CORE:OBJECT]"],
    //   provides: ["GameAssist.ConditionAssist"],
    //   last_updated_version: "v0.1.5.0",
    //   independent_versions: { module_version: "1.0.1", condition_config_schema_version: 2 }, lifecycle: "active" }
    // -------------------------------------------------------------------------
    // Narrative
    // ConditionAssist is GameAssist's condition-information module. It preserves the
    // familiar !condition menu, quick !cond-[condition] references, selectable SRD wording,
    // marker artwork, add/remove/toggle actions, selected-character announcements,
    // configurable definitions, and safe import/export while using MarkerService as the
    // only marker authority. It is independently maintained and is not an upstream
    // StatusInfo release.
    // -------------------------------------------------------------------------
    GameAssist.register('ConditionAssist', function() {
        const MODULE_NAME = 'ConditionAssist';
        const MODULE_VERSION = '1.0.1';
        const CONFIG_SCHEMA_VERSION = 2;
        const PRIMARY_COMMAND = 'condition';
        const STATUS_HANDOUT_NAME = 'GameAssist Condition Status';
        const modState = GameAssist.getState(MODULE_NAME);
        const originalConfigKeys = new Set(Object.keys(modState.config || {}));
        const hadConditionConfig = Boolean(
            modState.config?.conditions &&
            typeof modState.config.conditions === 'object' &&
            !Array.isArray(modState.config.conditions) &&
            Object.keys(modState.config.conditions).length
        );
        const recentDescriptions = new Map();
        const suppressedMarkerDescriptions = new Map();
        const announcementGrants = new Map();
        let announcementGrantId = 0;

        // Retained only to recognize untouched ConditionAssist 1.0.0 defaults during upgrade.
        const LEGACY_GAMEASSIST_DEFAULTS = Object.freeze({
            blinded: Object.freeze({ name: 'Blinded', marker: 'bleeding-eye', description: 'Cannot see. Sight-dependent checks fail. Attacks against the creature have advantage, and its attacks have disadvantage.' }),
            charmed: Object.freeze({ name: 'Charmed', marker: 'broken-heart', description: 'Cannot attack or deliberately harm the charmer. The charmer has advantage on social checks involving the creature.' }),
            deafened: Object.freeze({ name: 'Deafened', marker: 'edge-crack', description: 'Cannot hear and fails checks that depend on hearing.' }),
            frightened: Object.freeze({ name: 'Frightened', marker: 'screaming', description: 'Has disadvantage on attacks and ability checks while the source of fear is visible, and cannot willingly move closer to it.' }),
            grappled: Object.freeze({ name: 'Grappled', marker: 'grab', description: 'Speed becomes 0. The condition ends if the grappler is incapacitated or the creature is moved beyond the grappler\'s reach.' }),
            incapacitated: Object.freeze({ name: 'Incapacitated', marker: 'interdiction', description: 'Cannot take actions or reactions.' }),
            inspiration: Object.freeze({ name: 'Inspiration', marker: 'black-flag', description: 'May be spent to gain advantage on an attack roll, saving throw, or ability check, according to the campaign\'s inspiration rules.' }),
            invisible: Object.freeze({ name: 'Invisible', marker: 'ninja-mask', description: 'Cannot be seen without magic or a special sense. Its attacks have advantage, and attacks against it have disadvantage.' }),
            paralyzed: Object.freeze({ name: 'Paralyzed', marker: 'pummeled', description: 'Is incapacitated and cannot move or speak. It fails Strength and Dexterity saves; nearby hits can become critical hits.' }),
            petrified: Object.freeze({ name: 'Petrified', marker: 'frozen-orb', description: 'Is transformed into solid material, incapacitated, unaware, resistant to damage, and protected from new poison or disease.' }),
            poisoned: Object.freeze({ name: 'Poisoned', marker: 'chemical-bolt', description: 'Has disadvantage on attack rolls and ability checks.' }),
            prone: Object.freeze({ name: 'Prone', marker: 'back-pain', description: 'Must crawl or stand to move normally. Its attacks have disadvantage; nearby attackers have advantage and distant attackers have disadvantage.' }),
            restrained: Object.freeze({ name: 'Restrained', marker: 'fishing-net', description: 'Speed becomes 0. Attacks against the creature have advantage; its attacks and Dexterity saves have disadvantage.' }),
            stunned: Object.freeze({ name: 'Stunned', marker: 'fist', description: 'Is incapacitated, cannot move, and can barely speak. It fails Strength and Dexterity saves, and attacks against it have advantage.' }),
            unconscious: Object.freeze({ name: 'Unconscious', marker: 'sleepy', description: 'Is incapacitated, unaware, and prone. It drops held items, fails Strength and Dexterity saves, and nearby hits can become critical hits.' })
        });

        const CONDITION_MARKERS = Object.freeze({
            blinded: 'bleeding-eye',
            charmed: 'broken-heart',
            deafened: 'edge-crack',
            exhaustion: 'half-haze',
            frightened: 'screaming',
            grappled: 'grab',
            incapacitated: 'interdiction',
            invisible: 'ninja-mask',
            paralyzed: 'pummeled',
            petrified: 'frozen-orb',
            poisoned: 'chemical-bolt',
            prone: 'back-pain',
            restrained: 'fishing-net',
            stunned: 'fist',
            unconscious: 'sleepy'
        });

        const RULES_PROFILES = Object.freeze({
            '2014': Object.freeze({
                label: '2014 SRD',
                conditions: Object.freeze({
                    blinded: Object.freeze({ name: 'Blinded', description: "A blinded creature can't see and automatically fails any ability check that requires sight.\nAttack rolls against the creature have advantage, and the creature's attack rolls have disadvantage." }),
                    charmed: Object.freeze({ name: 'Charmed', description: "A charmed creature can't attack the charmer or target the charmer with harmful abilities or magical effects.\nThe charmer has advantage on any ability check to interact socially with the creature." }),
                    deafened: Object.freeze({ name: 'Deafened', description: "A deafened creature can't hear and automatically fails any ability check that requires hearing." }),
                    exhaustion: Object.freeze({ name: 'Exhaustion', description: 'Exhaustion has six cumulative levels. Level 1 gives disadvantage on ability checks; level 2 halves speed; level 3 gives disadvantage on attack rolls and saving throws; level 4 halves hit point maximum; level 5 reduces speed to 0; level 6 causes death. A long rest with food and drink removes one level.' }),
                    frightened: Object.freeze({ name: 'Frightened', description: "A frightened creature has disadvantage on ability checks and attack rolls while the source of its fear is within line of sight.\nThe creature can't willingly move closer to the source of its fear." }),
                    grappled: Object.freeze({ name: 'Grappled', description: "A grappled creature's speed becomes 0 and can't benefit from bonuses to speed.\nThe condition ends if the grappler is incapacitated or an effect moves the grappled creature outside the grappler's reach." }),
                    incapacitated: Object.freeze({ name: 'Incapacitated', description: "An incapacitated creature can't take actions or reactions." }),
                    invisible: Object.freeze({ name: 'Invisible', description: "An invisible creature is impossible to see without magic or a special sense. For hiding, the creature is heavily obscured, though its location can be detected by noise or tracks.\nAttack rolls against the creature have disadvantage, and the creature's attack rolls have advantage." }),
                    paralyzed: Object.freeze({ name: 'Paralyzed', description: 'A paralyzed creature is incapacitated and cannot move or speak. It automatically fails Strength and Dexterity saving throws.\nAttack rolls against it have advantage, and a hit from an attacker within 5 feet is a critical hit.' }),
                    petrified: Object.freeze({ name: 'Petrified', description: 'A petrified creature and its nonmagical gear are transformed into solid inanimate material. Its weight increases tenfold and it stops aging.\nThe creature is incapacitated, cannot move or speak, and is unaware. Attacks against it have advantage; it automatically fails Strength and Dexterity saves; it has resistance to all damage and immunity to poison and disease, although existing poison or disease is suspended.' }),
                    poisoned: Object.freeze({ name: 'Poisoned', description: 'A poisoned creature has disadvantage on attack rolls and ability checks.' }),
                    prone: Object.freeze({ name: 'Prone', description: 'A prone creature can crawl or use half its speed to stand.\nThe creature has disadvantage on attack rolls. Attacks against it have advantage from within 5 feet and disadvantage from farther away.' }),
                    restrained: Object.freeze({ name: 'Restrained', description: "A restrained creature's speed becomes 0 and can't benefit from bonuses to speed.\nAttack rolls against it have advantage; its attack rolls have disadvantage; and it has disadvantage on Dexterity saving throws." }),
                    stunned: Object.freeze({ name: 'Stunned', description: 'A stunned creature is incapacitated, cannot move, and can speak only falteringly. It automatically fails Strength and Dexterity saving throws.\nAttack rolls against the creature have advantage.' }),
                    unconscious: Object.freeze({ name: 'Unconscious', description: 'An unconscious creature is incapacitated, cannot move or speak, and is unaware. It drops held items and falls prone.\nIt automatically fails Strength and Dexterity saves. Attacks against it have advantage, and a hit from an attacker within 5 feet is a critical hit.' })
                })
            }),
            '2024': Object.freeze({
                label: '2024 SRD',
                conditions: Object.freeze({
                    blinded: Object.freeze({ name: 'Blinded', description: "A blinded creature can't see and automatically fails any ability check that requires sight.\nAttack rolls against the creature have advantage, and the creature's attack rolls have disadvantage." }),
                    charmed: Object.freeze({ name: 'Charmed', description: "A charmed creature can't attack the charmer or target the charmer with damaging abilities or magical effects.\nThe charmer has advantage on any ability check to interact socially with the creature." }),
                    deafened: Object.freeze({ name: 'Deafened', description: "A deafened creature can't hear and automatically fails any ability check that requires hearing." }),
                    exhaustion: Object.freeze({ name: 'Exhaustion', description: 'Exhaustion is cumulative from level 1 through level 6. D20 Tests are reduced by twice the exhaustion level, and speed is reduced by 5 feet for each level. A creature dies at level 6. Finishing a long rest removes one level.' }),
                    frightened: Object.freeze({ name: 'Frightened', description: "A frightened creature has disadvantage on ability checks and attack rolls while the source of its fear is within line of sight.\nThe creature can't willingly move closer to the source of its fear." }),
                    grappled: Object.freeze({ name: 'Grappled', description: "A grappled creature's speed is 0 and can't increase. It has disadvantage on attacks against targets other than the grappler.\nThe grappler can drag or carry it, but each foot of movement costs 1 extra foot unless the grappled creature is Tiny or at least two sizes smaller." }),
                    incapacitated: Object.freeze({ name: 'Incapacitated', description: "An incapacitated creature can't take an action, Bonus Action, or Reaction; can't maintain Concentration; and can't speak. If incapacitated when rolling Initiative, it has disadvantage on that roll." }),
                    invisible: Object.freeze({ name: 'Invisible', description: "An invisible creature has advantage on Initiative rolls. It isn't affected by effects that require their target to be seen unless the effect's creator can somehow see it.\nAttack rolls against the creature have disadvantage, and the creature's attack rolls have advantage. A creature that can see it ignores this attack-roll benefit." }),
                    paralyzed: Object.freeze({ name: 'Paralyzed', description: 'A paralyzed creature is incapacitated and has speed 0. It automatically fails Strength and Dexterity saving throws.\nAttack rolls against it have advantage, and a hit from an attacker within 5 feet is a critical hit.' }),
                    petrified: Object.freeze({ name: 'Petrified', description: 'A petrified creature and its nonmagical gear are transformed into solid inanimate material. Its weight increases tenfold and it stops aging.\nThe creature is incapacitated, has speed 0, automatically fails Strength and Dexterity saves, and has resistance to all damage and immunity to the Poisoned condition. Attacks against it have advantage.' }),
                    poisoned: Object.freeze({ name: 'Poisoned', description: 'A poisoned creature has disadvantage on attack rolls and ability checks.' }),
                    prone: Object.freeze({ name: 'Prone', description: 'A prone creature can crawl or spend movement equal to half its speed, rounded down, to stand. It cannot stand while its speed is 0.\nIts attacks have disadvantage. Attacks against it have advantage from within 5 feet and disadvantage from farther away.' }),
                    restrained: Object.freeze({ name: 'Restrained', description: "A restrained creature's speed is 0 and can't increase.\nAttack rolls against it have advantage; its attack rolls have disadvantage; and it has disadvantage on Dexterity saving throws." }),
                    stunned: Object.freeze({ name: 'Stunned', description: 'A stunned creature is incapacitated and automatically fails Strength and Dexterity saving throws.\nAttack rolls against the creature have advantage.' }),
                    unconscious: Object.freeze({ name: 'Unconscious', description: 'An unconscious creature is incapacitated, prone, and unaware of its surroundings. It drops held items and has speed 0. When the condition ends, it remains prone.\nIt automatically fails Strength and Dexterity saves. Attacks against it have advantage, and a hit from an attacker within 5 feet is a critical hit.' })
                })
            })
        });

        function cloneProfileConditions(profile = '2014') {
            const source = RULES_PROFILES[profile] || RULES_PROFILES['2014'];
            return Object.fromEntries(
                Object.entries(source.conditions).map(([key, value]) => [
                    key,
                    { ...value, marker: CONDITION_MARKERS[key] }
                ])
            );
        }

        function cloneDefaultConditions() {
            return cloneProfileConditions('2014');
        }

        function isPlainObject(value) {
            return Boolean(value && typeof value === 'object' && !Array.isArray(value));
        }

        function hasUnsafeKey(value) {
            if (!isPlainObject(value) && !Array.isArray(value)) return false;
            if (Object.keys(value).some(key => POLICY.config.unsafeKeys.includes(key))) return true;
            return Object.values(value).some(hasUnsafeKey);
        }

        function conditionKey(value) {
            const normalized = String(value || '')
                .trim()
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^a-z0-9_-]/g, '')
                .slice(0, POLICY.conditions.maxNameLength);
            return normalized === 'invisibility' ? 'invisible' : normalized;
        }

        function plainDescription(value) {
            return String(value || '')
                .replace(/<\s*br\s*\/?\s*>/gi, '\n')
                .replace(/<\s*\/p\s*>/gi, '\n')
                .replace(/<[^>]*>/g, ' ')
                .replace(/&nbsp;/gi, ' ')
                .replace(/&amp;/gi, '&')
                .replace(/&quot;/gi, '"')
                .replace(/&#39;|&apos;/gi, "'")
                .replace(/\s*\n\s*/g, '\n')
                .replace(/[ \t]+/g, ' ')
                .trim()
                .slice(0, POLICY.conditions.maxDescriptionLength);
        }

        function normalizeDefinition(rawKey, rawDefinition) {
            const source = isPlainObject(rawDefinition) ? rawDefinition : {};
            const key = conditionKey(rawKey || source.name);
            const rawName = String(source.name || rawKey || '')
                .trim()
                .slice(0, POLICY.conditions.maxNameLength);
            const name = rawName.toLowerCase() === 'concentration' ? 'Concentrating' : rawName;
            const marker = String(source.marker || source.icon || '')
                .trim()
                .slice(0, POLICY.conditions.maxMarkerLength);
            const description = plainDescription(source.description);

            if (!key || POLICY.config.unsafeKeys.includes(key)) {
                return { ok: false, error: `Unsafe or empty condition key: ${String(rawKey || '(blank)')}` };
            }
            if (!name) return { ok: false, error: `Condition ${key} has no display name.` };
            if (!marker) return { ok: false, error: `Condition ${name} has no marker.` };

            return { ok: true, key, definition: { name, marker, description } };
        }

        function normalizeConditionMap(rawConditions, { strict = false } = {}) {
            if (!isPlainObject(rawConditions) || hasUnsafeKey(rawConditions)) {
                return { ok: false, conditions: {}, errors: ['Conditions must be a safe object.'] };
            }

            const entries = Object.entries(rawConditions);
            if (entries.length > POLICY.conditions.maxDefinitions) {
                return {
                    ok: false,
                    conditions: {},
                    errors: [`Condition limit is ${POLICY.conditions.maxDefinitions}.`]
                };
            }

            const conditions = {};
            const errors = [];
            entries.forEach(([key, value]) => {
                const result = normalizeDefinition(key, value);
                if (!result.ok) {
                    errors.push(result.error);
                    return;
                }
                conditions[result.key] = result.definition;
            });

            return {
                ok: strict ? errors.length === 0 : Object.keys(conditions).length > 0,
                conditions,
                errors
            };
        }

        function isLegacyGameAssistDefaultMap(conditions) {
            const expectedKeys = Object.keys(LEGACY_GAMEASSIST_DEFAULTS);
            const actualKeys = Object.keys(conditions || {});
            return actualKeys.length === expectedKeys.length && expectedKeys.every(key => {
                const actual = conditions[key];
                const expected = LEGACY_GAMEASSIST_DEFAULTS[key];
                return actual &&
                    actual.name === expected.name &&
                    actual.marker === expected.marker &&
                    actual.description === expected.description;
            });
        }

        function rulesProfileLabel(profile = modState.config.rulesProfile) {
            if (RULES_PROFILES[profile]) return RULES_PROFILES[profile].label;
            return 'Campaign Custom';
        }

        function profileCapacityError(profile, conditions) {
            const source = RULES_PROFILES[profile];
            if (!source) return 'Unknown rules wording profile.';
            const missing = Object.keys(source.conditions).filter(key => !conditions[key]).length;
            const projected = Object.keys(conditions).length + missing;
            return projected > POLICY.conditions.maxDefinitions
                ? `The ${rulesProfileLabel(profile)} profile needs ${missing} missing official condition slot(s), which would exceed the ${POLICY.conditions.maxDefinitions}-condition limit.`
                : '';
        }

        /**
         * applyRulesProfile - Replaces only the official SRD names and descriptions.
         * Existing marker choices and campaign-added condition definitions are retained.
         */
        function applyRulesProfile(profile) {
            const source = RULES_PROFILES[profile];
            if (!source) return { ok: false, message: 'Unknown rules wording profile.' };
            const conditions = modState.config.conditions;
            const capacityError = profileCapacityError(profile, conditions);
            if (capacityError) return { ok: false, message: capacityError };
            Object.entries(source.conditions).forEach(([key, definition]) => {
                const existing = conditions[key];
                conditions[key] = {
                    name: definition.name,
                    marker: existing?.marker || CONDITION_MARKERS[key],
                    description: definition.description
                };
            });
            modState.config.rulesProfile = profile;
            return { ok: true };
        }

        function repairConfig() {
            const persisted = isPlainObject(modState.config) ? modState.config : {};
            const persistedProfile = ['2014', '2024', 'custom'].includes(persisted.rulesProfile)
                ? persisted.rulesProfile
                : '';
            Object.assign(modState.config, {
                enabled: true,
                command: PRIMARY_COMMAND,
                rulesProfile: '2014',
                userAllowed: false,
                userToggle: false,
                sendOnlyToGM: false,
                showDescOnStatusChange: true,
                showIconInDescription: true,
                ...persisted
            });
            // This unreleased option belonged to the superseded creative-announcement design.
            delete modState.config.randomizeAnnouncements;

            const normalized = normalizeConditionMap(modState.config.conditions || {});
            if (normalized.ok) {
                modState.config.conditions = normalized.conditions;
                if (persistedProfile === '2014' || persistedProfile === '2024') {
                    const result = applyRulesProfile(persistedProfile);
                    if (!result.ok) {
                        modState.config.rulesProfile = 'custom';
                        GameAssist.log(MODULE_NAME, `${result.message} Existing definitions were retained as Campaign Custom.`, 'WARN');
                    }
                } else if (persistedProfile === 'custom') {
                    modState.config.rulesProfile = 'custom';
                } else if (isLegacyGameAssistDefaultMap(normalized.conditions)) {
                    modState.config.conditions = cloneDefaultConditions();
                    modState.config.rulesProfile = '2014';
                    GameAssist.log(MODULE_NAME, 'Upgraded untouched ConditionAssist 1.0.0 definitions to the complete 2014 SRD profile.', 'INFO');
                } else {
                    modState.config.rulesProfile = 'custom';
                }
                if (normalized.errors.length) {
                    GameAssist.log(MODULE_NAME, `Ignored ${normalized.errors.length} malformed saved condition definition(s).`, 'WARN');
                }
            } else {
                modState.config.conditions = cloneDefaultConditions();
                modState.config.rulesProfile = '2014';
                if (persisted.conditions !== undefined) {
                    GameAssist.log(MODULE_NAME, 'Saved condition definitions were malformed; restored GameAssist defaults.', 'WARN');
                }
            }

            const command = String(modState.config.command || PRIMARY_COMMAND).trim().replace(/^!/, '');
            modState.config.command = /^[A-Za-z][A-Za-z0-9_-]{0,39}$/.test(command)
                ? command
                : PRIMARY_COMMAND;
            ['userAllowed', 'userToggle', 'sendOnlyToGM', 'showDescOnStatusChange', 'showIconInDescription']
                .forEach(key => { modState.config[key] = modState.config[key] === true; });
        }

        function migrateLegacyStatusInfo() {
            if (modState.config.legacyStatusInfoMigration) return;
            const legacy = state?.STATUSINFO;
            if (!isPlainObject(legacy)) return;

            const legacyConfig = isPlainObject(legacy.config) ? legacy.config : {};
            const boolKeys = ['userAllowed', 'userToggle', 'sendOnlyToGM', 'showDescOnStatusChange', 'showIconInDescription'];
            const importedSettings = [];
            boolKeys.forEach(key => {
                if (!originalConfigKeys.has(key) && typeof legacyConfig[key] === 'boolean') {
                    modState.config[key] = legacyConfig[key];
                    importedSettings.push(key);
                }
            });
            if (!originalConfigKeys.has('command') && typeof legacyConfig.command === 'string') {
                const command = legacyConfig.command.trim().replace(/^!/, '');
                if (/^[A-Za-z][A-Za-z0-9_-]{0,39}$/.test(command)) {
                    modState.config.command = command;
                    importedSettings.push('command');
                }
            }

            const normalized = normalizeConditionMap(legacy.conditions || {});
            let importedConditions = 0;
            if (normalized.ok) {
                if (hadConditionConfig) {
                    Object.entries(normalized.conditions).forEach(([key, value]) => {
                        if (modState.config.conditions[key]) return;
                        modState.config.conditions[key] = value;
                        importedConditions++;
                    });
                } else {
                    modState.config.conditions = {
                        ...cloneDefaultConditions(),
                        ...normalized.conditions
                    };
                    importedConditions = Object.keys(normalized.conditions).length;
                }
                if (importedConditions > 0) modState.config.rulesProfile = 'custom';
            }

            modState.config.legacyStatusInfoMigration = {
                source: 'state.STATUSINFO',
                referenceVersion: '0.3.11/0.3.12',
                importedAt: isoNow(),
                importedSettings,
                importedConditions
            };
            GameAssist.log(
                MODULE_NAME,
                `Copied ${importedConditions} condition definition(s) and ${importedSettings.length} setting(s) from legacy state.STATUSINFO. The legacy branch was retained.`,
                'INFO'
            );
        }

        repairConfig();
        migrateLegacyStatusInfo();
        repairConfig();

        function isRunning() {
            return Boolean(MODULES[MODULE_NAME]?.initialized && MODULES[MODULE_NAME]?.active);
        }

        function safeWho(msg) {
            return String(msg?.who || 'gm')
                .replace(/\s+\(GM\)\s*$/i, '')
                .replace(/["\\]/g, '')
                .trim() || 'gm';
        }

        function requesterWhisper(msg) {
            return playerIsGM(msg?.playerid) ? '/w gm ' : `/w "${safeWho(msg)}" `;
        }

        function sendPanel(title, body, { msg = null, publicMessage = false, gmOnly = false, whisperTo = '' } = {}) {
            const destination = publicMessage
                ? ''
                : (whisperTo
                    ? `/w "${safeWho({ who: whisperTo })}" `
                    : (gmOnly || !msg ? '/w gm ' : requesterWhisper(msg)));
            const panel = [
                '<div style="border:1px solid #555;background:#fff;padding:8px;border-radius:5px;">',
                `<div style="font-size:1.15em;font-weight:bold;margin-bottom:6px;">${_sanitize(title)}</div>`,
                body,
                '</div>'
            ].join('');
            sendChat(MODULE_NAME, destination + panel, null, { noarchive: true });
        }

        function queryText(value) {
            return String(value || '').replace(/[|},]/g, ' ').replace(/[\r\n]+/g, ' ').trim();
        }

        function getConditions() {
            return modState.config.conditions;
        }

        function getCondition(name) {
            const requested = String(name || '').trim().toLowerCase();
            const key = conditionKey(requested);
            if (getConditions()[key]) return { key, ...getConditions()[key] };
            const match = Object.entries(getConditions()).find(([, condition]) =>
                String(condition.name || '').toLowerCase() === requested
            );
            return match ? { key: match[0], ...match[1] } : null;
        }

        function selectedTokens(msg) {
            return (msg?.selected || [])
                .map(selection => getObj('graphic', selection._id))
                .filter(token => token && token.get('_subtype') === 'token');
        }

        function renderMarkerArtwork(condition) {
            if (!modState.config.showIconInDescription || !condition?.marker) return '';
            const artwork = GameAssist.MarkerService.artwork(condition.marker);
            const label = _sanitize(condition.name || condition.marker);
            if (!artwork.ok) {
                return `<div style="font-size:0.85em;color:#555;margin-bottom:5px;">Marker: ${_sanitize(condition.marker)}</div>`;
            }
            if (artwork.type === 'color') {
                return `<div title="${label}" style="width:20px;height:20px;border-radius:50%;display:inline-block;margin:0 6px 5px 0;vertical-align:middle;background:${_sanitize(artwork.color)};border:1px solid #fff;box-shadow:0 0 0 1px #777;"></div>`;
            }
            if (artwork.type === 'text') {
                return `<div title="${label}" style="display:inline-block;margin:0 6px 5px 0;vertical-align:middle;font-size:22px;line-height:22px;font-weight:bold;color:${_sanitize(artwork.color)};">${_sanitize(artwork.text)}</div>`;
            }
            if (artwork.type === 'sprite') {
                return `<div title="${label}" style="width:24px;height:24px;display:inline-block;margin:0 6px 5px 0;vertical-align:middle;background-image:url('${_sanitize(artwork.url)}');background-repeat:no-repeat;background-position:${Number(artwork.offsetPercent) || 0}% 0;background-size:auto 24px;"></div>`;
            }
            if (artwork.type === 'custom') {
                return `<img title="${label}" alt="${label}" src="${_sanitize(artwork.url)}" style="width:24px;height:24px;display:inline-block;margin:0 6px 5px 0;vertical-align:middle;border:0;">`;
            }
            return '';
        }

        function showCondition(condition, { force = false } = {}) {
            if (!condition?.description) return false;
            const key = condition.key || conditionKey(condition.name);
            const last = recentDescriptions.get(key) || 0;
            const current = monotonic();
            if (!force && recentDescriptions.has(key) && current - last < POLICY.conditions.recentDescriptionMs) return false;
            recentDescriptions.set(key, current);
            setTimeout(() => {
                if (recentDescriptions.get(key) === current) recentDescriptions.delete(key);
            }, POLICY.conditions.recentDescriptionMs);

            const marker = renderMarkerArtwork(condition);
            const text = _sanitize(condition.description).replace(/\n/g, '<br>');
            sendPanel(condition.name, marker + text, {
                publicMessage: modState.config.sendOnlyToGM !== true,
                gmOnly: modState.config.sendOnlyToGM === true
            });
            return true;
        }

        function conditionButtons(action = 'toggle') {
            const buttons = Object.entries(getConditions()).map(([key, condition]) =>
                GameAssist.createButton(condition.name, `!condition ${action} ${key}`)
            );
            const rows = [];
            for (let index = 0; index < buttons.length; index += 3) {
                rows.push(buttons.slice(index, index + 3).join(' '));
            }
            return rows.join('<br>');
        }

        function formatNameList(names) {
            const clean = names.filter(Boolean);
            if (clean.length <= 1) return clean[0] || 'The selected character';
            if (clean.length === 2) return `${clean[0]} and ${clean[1]}`;
            return `${clean.slice(0, -1).join(', ')}, and ${clean[clean.length - 1]}`;
        }

        function announcementTokenIds(body) {
            const match = String(body || '').match(/(?:^|\s)--ids\s+([A-Za-z0-9_,-]+)/i);
            return match
                ? Array.from(new Set(match[1].split(',').filter(id => /^[-A-Za-z0-9_]+$/.test(id))))
                : [];
        }

        function announcementTargets(msg, body = '') {
            const explicitIds = announcementTokenIds(body);
            const tokens = explicitIds.length
                ? explicitIds.map(id => getObj('graphic', id)).filter(Boolean)
                : selectedTokens(msg);
            if (!tokens.length) {
                return { ok: false, message: 'Select one or more linked character tokens before opening the announcement menu.' };
            }
            if (tokens.length > POLICY.conditions.maxAnnouncementTokens) {
                return {
                    ok: false,
                    message: `Choose no more than ${POLICY.conditions.maxAnnouncementTokens} tokens for one announcement.`
                };
            }

            const seenCharacters = new Set();
            const targets = [];
            let ignored = 0;
            tokens.forEach(token => {
                const linked = GameAssist.getLinkedCharacter(token);
                if (!linked || seenCharacters.has(linked.character.id)) {
                    ignored++;
                    return;
                }
                seenCharacters.add(linked.character.id);
                targets.push({
                    token,
                    character: linked.character,
                    name: token.get('name') || linked.character.get('name') || '(Unnamed character)'
                });
            });
            if (!targets.length) {
                return { ok: false, message: 'None of the selected tokens are linked to characters on the Objects layer.' };
            }
            return { ok: true, targets, ignored };
        }

        function announcementIdsArgument(targets) {
            return targets.map(target => target.token.id).join(',');
        }

        function announcementConditionButtons(targets) {
            const ids = announcementIdsArgument(targets);
            const buttons = Object.entries(getConditions())
                .sort((a, b) => a[1].name.localeCompare(b[1].name))
                .map(([key, condition]) =>
                    GameAssist.createButton(condition.name, `!condition announce choose ${key} --ids ${ids}`)
                );
            const rows = [];
            for (let index = 0; index < buttons.length; index += 3) {
                rows.push(buttons.slice(index, index + 3).join(' '));
            }
            return rows.join('<br>');
        }

        function sendAnnouncementConditionMenu(msg, targets, ignored = 0) {
            const names = targets.map(target => target.name);
            const body = [
                `<div><strong>Selected:</strong> ${_sanitize(formatNameList(names))}</div>`,
                ignored ? `<div style="margin-top:4px;color:#7a3d00;">Ignored ${ignored} unlinked or duplicate selection${ignored === 1 ? '' : 's'}.</div>` : '',
                '<div style="margin-top:7px;"><strong>Choose the condition to toggle and communicate</strong></div>',
                announcementConditionButtons(targets),
                '<div style="margin-top:7px;font-size:0.9em;">The marker changes only after you choose a final public or whisper button.</div>'
            ].join('');
            sendPanel('Condition Announcement', body, { msg, gmOnly: true });
        }

        function sendAnnouncementDeliveryMenu(msg, condition, targets) {
            const ids = announcementIdsArgument(targets);
            const names = _sanitize(formatNameList(targets.map(target => target.name)));
            const body = [
                `<div><strong>${_sanitize(condition.name)}</strong> for ${names}</div>`,
                '<div style="margin-top:8px;"><strong>Condition update</strong><br>',
                GameAssist.createButton('Toggle & Announce', `!condition announce send public ${condition.key} --ids ${ids}`),
                ' ', GameAssist.createButton('Toggle & Whisper', `!condition announce send whisper ${condition.key} --ids ${ids}`),
                '</div>',
                '<div style="margin-top:8px;"><strong>Exact rules wording</strong><br>',
                GameAssist.createButton('Toggle & Post Wording', `!condition announce rules public ${condition.key} --ids ${ids}`),
                ' ', GameAssist.createButton('Toggle & Whisper Wording', `!condition announce rules whisper ${condition.key} --ids ${ids}`),
                '</div>',
                `<div style="margin-top:8px;">${GameAssist.createButton('Choose Another Condition', `!condition announce --ids ${ids}`)}</div>`,
                '<div style="margin-top:7px;font-size:0.9em;">Every delivery button toggles the marker once on each selected token. The message reports which characters had the condition applied or removed.</div>'
            ].join('');
            sendPanel('Choose Announcement Delivery', body, { msg, gmOnly: true });
        }

        function allNonGmPlayers() {
            return findObjs({ _type: 'player' }).filter(player => !playerIsGM(player.id));
        }

        function targetControllerIds(target) {
            const raw = [target.token.get('controlledby'), target.character.get('controlledby')]
                .filter(Boolean)
                .join(',')
                .split(',')
                .map(id => id.trim())
                .filter(Boolean);
            if (raw.includes('all')) return allNonGmPlayers().map(player => player.id);
            return Array.from(new Set(raw.filter(id => !playerIsGM(id) && getObj('player', id))));
        }

        function controllerRecipients(targets) {
            const recipients = new Map();
            const unassigned = [];
            targets.forEach(target => {
                const ids = targetControllerIds(target);
                if (!ids.length) {
                    unassigned.push(target.name);
                    return;
                }
                ids.forEach(id => {
                    const player = getObj('player', id);
                    if (!player) return;
                    if (!recipients.has(id)) recipients.set(id, { player, targets: [] });
                    recipients.get(id).targets.push(target);
                });
            });
            return { recipients: Array.from(recipients.values()), unassigned };
        }

        function pruneAnnouncementGrants() {
            const current = now();
            announcementGrants.forEach((grant, id) => {
                if (!grant || grant.expiresAt <= current) announcementGrants.delete(id);
            });
            while (announcementGrants.size >= POLICY.conditions.announcementGrantLimit) {
                announcementGrants.delete(announcementGrants.keys().next().value);
            }
        }

        function createAnnouncementGrant(condition) {
            pruneAnnouncementGrants();
            const id = `${now().toString(36)}${(++announcementGrantId).toString(36)}${Math.floor(Math.random() * 0xFFFFFF).toString(36)}`;
            announcementGrants.set(id, {
                condition: { ...condition },
                expiresAt: now() + POLICY.conditions.announcementGrantMs
            });
            return id;
        }

        function markerDescriptionSuppressionKey(tokenId, normalizedMarkerId) {
            return `${tokenId}:${normalizedMarkerId}`;
        }

        function suppressAnnouncementMarkerDescription(tokenId, normalizedMarkerId) {
            const key = markerDescriptionSuppressionKey(tokenId, normalizedMarkerId);
            const record = { expiresAt: now() + POLICY.conditions.announcementMutationSuppressionMs };
            suppressedMarkerDescriptions.set(key, record);
            setTimeout(() => {
                if (suppressedMarkerDescriptions.get(key) === record) suppressedMarkerDescriptions.delete(key);
            }, POLICY.conditions.announcementMutationSuppressionMs);
            return key;
        }

        function consumeAnnouncementMarkerSuppression(tokenId, normalizedMarkerId) {
            const key = markerDescriptionSuppressionKey(tokenId, normalizedMarkerId);
            const record = suppressedMarkerDescriptions.get(key);
            if (!record) return false;
            suppressedMarkerDescriptions.delete(key);
            return record.expiresAt >= now();
        }

        /**
         * toggleAnnouncementTargets - Toggle each selected marker and retain the
         * verified per-token result so chat never reports an assumed state.
         */
        function toggleAnnouncementTargets(condition, targets) {
            const results = { applied: [], removed: [], failed: [], states: new Map() };
            targets.forEach(target => {
                const before = GameAssist.MarkerService.inspect(target.token, condition.marker);
                if (!before.ok) {
                    results.failed.push({ target, message: before.message || 'The current marker state could not be read.' });
                    return;
                }

                const normalizedMarkerId = GameAssist.MarkerService.normalizeId(before.resolution.id);
                const suppressionKey = before.present
                    ? ''
                    : suppressAnnouncementMarkerDescription(target.token.id, normalizedMarkerId);
                const change = GameAssist.MarkerService.toggle(target.token, condition.marker, { owner: MODULE_NAME });
                if (!change.ok || change.verified !== true) {
                    if (suppressionKey) suppressedMarkerDescriptions.delete(suppressionKey);
                    results.failed.push({ target, message: change.message || 'Roll20 did not retain the requested marker state.' });
                    GameAssist.log(MODULE_NAME, `${condition.name} could not be toggled on ${target.name}: ${change.message || change.code || 'verification failed'}`, 'WARN');
                    return;
                }

                const state = change.present ? 'applied' : 'removed';
                results.states.set(target.token.id, state);
                results[state].push(target);
            });
            return results;
        }

        function announcementStateLines(condition, targets, results) {
            return targets.map(target => {
                const state = results.states.get(target.token.id);
                if (!state) return '';
                const transition = state === 'applied' ? 'is' : 'is no longer';
                return `<div><strong>${_sanitize(target.name)}</strong> ${transition} <strong>${_sanitize(condition.name)}</strong>.</div>`;
            }).filter(Boolean).join('');
        }

        function announcementBody(condition, targets, results, { exactWording = false, grantId = '' } = {}) {
            const details = exactWording
                ? `<div style="margin-top:8px;"><strong>Condition wording</strong><br>${_sanitize(condition.description || 'No description is configured.').replace(/\n/g, '<br>')}</div>`
                : `<div style="margin-top:8px;">${GameAssist.createButton('Read Exact Wording', `!condition details ${grantId}`)}</div>`;
            return [
                renderMarkerArtwork(condition),
                announcementStateLines(condition, targets, results),
                details
            ].join('');
        }

        function sendAnnouncementFailures(msg, condition, results) {
            if (!results.failed.length) return;
            const details = results.failed.map(({ target, message }) =>
                `<div style="margin-top:4px;"><strong>${_sanitize(target.name)}</strong>: ${_sanitize(message)}</div>`
            ).join('');
            sendPanel(
                'Condition Marker Warning',
                `<div>${results.failed.length} ${_sanitize(condition.name)} marker change${results.failed.length === 1 ? '' : 's'} could not be verified. No success message was sent for ${results.failed.length === 1 ? 'that token' : 'those tokens'}.</div>${details}`,
                { msg, gmOnly: true }
            );
        }

        function sendConditionAnnouncement(msg, condition, targets, mode, exactWording) {
            const delivery = mode === 'whisper' ? controllerRecipients(targets) : null;
            if (delivery && !delivery.recipients.length) {
                sendPanel('Condition Announcement', 'No selected character has a non-GM player controller. Use a public option instead, or assign a controller on the character sheet. No markers were changed.', { msg, gmOnly: true });
                return;
            }

            const results = toggleAnnouncementTargets(condition, targets);
            const successfulTargets = targets.filter(target => results.states.has(target.token.id));
            if (!successfulTargets.length) {
                sendAnnouncementFailures(msg, condition, results);
                return;
            }

            const grantId = exactWording ? '' : createAnnouncementGrant(condition);
            if (mode === 'public') {
                sendPanel(
                    exactWording ? condition.name : 'Condition Updated',
                    announcementBody(condition, successfulTargets, results, { exactWording, grantId }),
                    { publicMessage: true }
                );
            } else {
                let sent = 0;
                delivery.recipients.forEach(({ player, targets: playerTargets }) => {
                    const successfulPlayerTargets = playerTargets.filter(target => results.states.has(target.token.id));
                    if (!successfulPlayerTargets.length) return;
                    sendPanel(
                        exactWording ? condition.name : 'Condition Updated',
                        announcementBody(condition, successfulPlayerTargets, results, { exactWording, grantId }),
                        { whisperTo: player.get('_displayname') || player.get('displayname') }
                    );
                    sent++;
                });
                const skipped = delivery.unassigned.length
                    ? `<div style="margin-top:6px;">No player whisper was sent for ${_sanitize(formatNameList(delivery.unassigned))} because ${delivery.unassigned.length === 1 ? 'that character has' : 'those characters have'} no non-GM controller.</div>`
                    : '';
                sendPanel(
                    'Condition Update Sent',
                    `${announcementStateLines(condition, successfulTargets, results)}<div style="margin-top:6px;">Sent to ${sent} player${sent === 1 ? '' : 's'}.</div>${skipped}`,
                    { msg, gmOnly: true }
                );
            }
            sendAnnouncementFailures(msg, condition, results);
        }

        function handleAnnouncementDetails(msg, body) {
            pruneAnnouncementGrants();
            const id = body.replace(/^details\s*/i, '').split(/\s+/)[0];
            const grant = announcementGrants.get(id);
            if (!grant || grant.expiresAt <= now()) {
                announcementGrants.delete(id);
                sendPanel('Condition Details', 'This private condition-reference button has expired. Ask the GM to announce the condition again.', { msg });
                return;
            }
            sendPanel(
                grant.condition.name,
                renderMarkerArtwork(grant.condition) + _sanitize(grant.condition.description || 'No description is configured.').replace(/\n/g, '<br>'),
                { msg }
            );
        }

        function handleAnnouncement(msg, body) {
            if (!playerIsGM(msg.playerid)) {
                sendPanel('Condition Announcement', 'Only the GM can announce conditions for selected characters.', { msg });
                return;
            }
            const targetResult = announcementTargets(msg, body);
            if (!targetResult.ok) {
                sendPanel('Condition Announcement', targetResult.message, { msg, gmOnly: true });
                return;
            }
            const actionText = body
                .replace(/^announce\s*/i, '')
                .replace(/(?:^|\s)--ids\s+[A-Za-z0-9_,-]+/i, '')
                .trim();
            if (!actionText) {
                sendAnnouncementConditionMenu(msg, targetResult.targets, targetResult.ignored);
                return;
            }
            const parts = actionText.split(/\s+/);
            const action = String(parts.shift() || '').toLowerCase();
            if (action === 'choose') {
                const condition = getCondition(parts.shift());
                if (!condition) {
                    sendPanel('Condition Announcement', 'That condition is no longer configured. Choose another condition.', { msg, gmOnly: true });
                    return;
                }
                sendAnnouncementDeliveryMenu(msg, condition, targetResult.targets);
                return;
            }
            if (action === 'send' || action === 'rules') {
                const mode = String(parts.shift() || '').toLowerCase();
                const condition = getCondition(parts.shift());
                if (!['public', 'whisper'].includes(mode) || !condition) {
                    sendPanel('Condition Announcement', 'The announcement choice was invalid or expired. Open the announcement menu again.', { msg, gmOnly: true });
                    return;
                }
                sendConditionAnnouncement(msg, condition, targetResult.targets, mode, action === 'rules');
                return;
            }
            sendAnnouncementConditionMenu(msg, targetResult.targets, targetResult.ignored);
        }

        function markerEntryLabel(entry, registryMarkers = []) {
            const custom = registryMarkers.find(marker =>
                GameAssist.MarkerService.normalizeId(marker.tag) === entry.normalizedId
            );
            const base = custom?.name || String(entry.id || '')
                .replace(/::.*$/, '')
                .replace(/[-_]+/g, ' ')
                .replace(/\b\w/g, letter => letter.toUpperCase()) || '(Unknown marker)';
            return entry.number === null ? base : `${base} (${entry.number})`;
        }

        /**
         * inspectTokenConditions - Read one token once, then map each stored marker
         * to configured conditions while retaining readable untracked markers.
         */
        function inspectTokenConditions(token) {
            const snapshot = GameAssist.MarkerService.read(token);
            if (!snapshot.ok) {
                return { ok: false, message: snapshot.message || 'Token markers could not be read.', tracked: [], other: [] };
            }

            const tracked = new Map();
            const matchedEntryIndexes = new Set();
            snapshot.entries.forEach(entry => {
                const matches = conditionsForMarkerEntry(entry);
                if (!matches.length) return;
                matchedEntryIndexes.add(entry.index);
                matches.forEach(condition => tracked.set(condition.key, condition.name));
            });

            const registry = GameAssist.MarkerService.getRegistry();
            const registryMarkers = Array.isArray(registry.markers) ? registry.markers : [];
            const other = snapshot.entries
                .filter(entry => !matchedEntryIndexes.has(entry.index))
                .map(entry => markerEntryLabel(entry, registryMarkers));

            return {
                ok: true,
                tracked: Array.from(tracked.values()).sort((a, b) => a.localeCompare(b)),
                other,
                entries: snapshot.entries
            };
        }

        function activeConditionNames(token) {
            const result = inspectTokenConditions(token);
            return result.ok ? result.tracked : [];
        }

        function writeConditionStatusHandout(rows, unlinkedWithMarkers, readFailures) {
            let handout = findObjs({ _type: 'handout', name: STATUS_HANDOUT_NAME })[0];
            if (!handout) handout = createObj('handout', { name: STATUS_HANDOUT_NAME, archived: false });
            if (!handout) return false;

            const renderedRows = rows.length
                ? rows.map(row => [
                    `<h3>${_sanitize(row.name)} (${row.type})</h3>`,
                    `<p><strong>Conditions:</strong> ${_sanitize(row.tracked.join(', ') || 'None configured for these markers')}<br>`,
                    row.other.length ? `<strong>Other markers:</strong> ${_sanitize(row.other.join(', '))}` : '<strong>Other markers:</strong> None',
                    '</p>'
                ].join('')).join('\n')
                : '<p>No linked characters or NPCs on the current player page have active markers.</p>';
            const notes = [
                '<h2>Current Conditions and Markers</h2>',
                `<p><strong>Updated:</strong> ${_sanitize(localNow())}</p>`,
                '<p>Scope: linked character and NPC tokens on the current player page. Unmarked tokens are omitted. Other markers are not treated as configured conditions.</p>',
                renderedRows,
                `<p><strong>Marked unlinked tokens ignored:</strong> ${unlinkedWithMarkers}<br>`,
                `<strong>Marker read failures:</strong> ${readFailures}</p>`
            ].join('\n');
            handout.set('notes', notes);
            return true;
        }

        function sendConditionStatus(msg) {
            if (!playerIsGM(msg.playerid)) {
                sendPanel('Condition Status', 'Only the GM can review conditions and markers across the current player page.', { msg });
                return;
            }

            const pageId = Campaign().get('playerpageid');
            const tokens = findObjs({
                _type: 'graphic',
                _pageid: pageId,
                layer: 'objects'
            });
            const rows = [];
            let unlinkedWithMarkers = 0;
            let readFailures = 0;

            tokens.forEach(token => {
                const status = inspectTokenConditions(token);
                if (!status.ok) {
                    readFailures++;
                    return;
                }
                if (!status.entries.length) return;

                const linked = GameAssist.getLinkedCharacter(token);
                if (!linked) {
                    unlinkedWithMarkers++;
                    return;
                }

                const isNPC = String(getAttrByName(linked.character.id, 'npc') || '') === '1';
                rows.push({
                    name: token.get('name') || linked.character.get('name') || '(Unnamed token)',
                    type: isNPC ? 'NPC' : 'Character',
                    tracked: status.tracked,
                    other: status.other
                });
            });

            rows.sort((left, right) => left.name.localeCompare(right.name));
            const wroteHandout = writeConditionStatusHandout(rows, unlinkedWithMarkers, readFailures);
            const visibleRows = rows.slice(0, POLICY.conditions.statusChatLimit);
            const body = [
                rows.length
                    ? visibleRows.map(row => [
                        '<div style="margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #ddd;">',
                        `<strong>${_sanitize(row.name)}</strong> <span style="color:#666;">(${row.type})</span><br>`,
                        `<strong>Conditions:</strong> ${_sanitize(row.tracked.join(', ') || 'None configured for these markers')}<br>`,
                        row.other.length ? `<strong>Other markers:</strong> ${_sanitize(row.other.join(', '))}` : '',
                        '</div>'
                    ].join('')).join('')
                    : '<div>No linked characters or NPCs on the current player page have active markers.</div>',
                rows.length > visibleRows.length
                    ? `<div><strong>More results:</strong> ${rows.length - visibleRows.length} additional marked token${rows.length - visibleRows.length === 1 ? '' : 's'} are not shown in this chat summary.</div>`
                    : '',
                unlinkedWithMarkers
                    ? `<div style="margin-top:6px;color:#666;">Ignored ${unlinkedWithMarkers} marked unlinked token${unlinkedWithMarkers === 1 ? '' : 's'} such as scenery, labels, or props.</div>`
                    : '',
                readFailures
                    ? `<div style="margin-top:6px;color:#7a3d00;">Could not read markers from ${readFailures} token${readFailures === 1 ? '' : 's'}.</div>`
                    : '',
                `<div style="margin-top:6px;"><strong>Complete roster:</strong> ${wroteHandout ? STATUS_HANDOUT_NAME : 'The handout could not be updated.'}</div>`,
                '<div style="margin-top:8px;">',
                GameAssist.createButton('Refresh Status', '!condition status'),
                ' ', GameAssist.createButton('Condition Menu', '!condition'),
                '</div>',
                '<div style="margin-top:7px;font-size:0.9em;">Scope: linked character and NPC tokens on the current player page. Unmarked tokens are omitted. Other markers are shown separately and are not treated as configured conditions.</div>'
            ].join('');
            sendPanel('Current Conditions and Markers', body, { msg, gmOnly: true });
        }

        function sendConditionMenu(msg) {
            if (!playerIsGM(msg.playerid) && !modState.config.userToggle) {
                sendPanel('ConditionAssist', 'Only the GM can change token conditions in this campaign.', { msg });
                return;
            }
            const tokens = selectedTokens(msg);
            const selection = tokens.length
                ? tokens.map(token => {
                    const names = activeConditionNames(token);
                    return `<strong>${_sanitize(token.get('name') || '(Unnamed token)')}</strong>: ${_sanitize(names.join(', ') || 'No tracked conditions')}`;
                }).join('<br>')
                : 'Select one or more tokens before using a condition button.';
            const body = [
                `<div style="margin-bottom:7px;">${selection}</div>`,
                '<div style="font-weight:bold;margin-bottom:4px;">Toggle on selected tokens</div>',
                conditionButtons('toggle'),
                '<div style="margin-top:8px;">',
                playerIsGM(msg.playerid) ? `${GameAssist.createButton('Announce a Condition', '!condition announce')} ` : '',
                playerIsGM(msg.playerid) ? `${GameAssist.createButton('Condition Status', '!condition status')} ` : '',
                GameAssist.createButton('Help', '!condition help'),
                playerIsGM(msg.playerid) ? ` ${GameAssist.createButton('Settings', '!condition config')}` : '',
                '</div>'
            ].join('');
            sendPanel('ConditionAssist Menu', body, { msg });
        }

        function sendHelp(msg) {
            const body = [
                '<div><strong>What it does</strong><br>Shows plain-language condition reminders and manages status markers on selected tokens.</div>',
                '<div style="margin-top:7px;"><strong>Quick start</strong><br>1. Select one or more tokens.<br>2. Open the condition menu.<br>3. Click a condition to add or remove it.</div>',
                `<div style="margin-top:7px;">${GameAssist.createButton('Open Condition Menu', '!condition')}</div>`,
                '<div style="margin-top:7px;"><strong>Useful commands</strong><br>',
                '<code>!condition prone</code> - show one description<br>',
                '<code>!cond-prone</code> - quick shortcut for the same description<br>',
                '<code>!condition add prone</code> - add to selected tokens<br>',
                '<code>!condition remove prone</code> - remove from selected tokens<br>',
                '<code>!condition toggle prone</code> - switch the marker on or off<br>',
                '<code>!condition status</code> - list current-page characters and NPCs with configured conditions or other markers<br>',
                '<code>!condition announce</code>, <code>!c-a</code>, or <code>!cond-!</code> - toggle and communicate a condition for selected linked characters<br>',
                '<code>!condition config</code> - GM settings and condition definitions</div>',
                `<div style="margin-top:7px;"><strong>Rules wording</strong><br>${_sanitize(rulesProfileLabel())}. The GM can switch between 2014 and 2024 SRD wording or edit any description.</div>`,
                '<div style="margin-top:7px;"><strong>Announcements</strong><br>Select linked character tokens first. A final public or whisper button toggles the condition marker once, verifies the result, and reports that each character is or is no longer affected by that condition. Exact wording is optional.</div>',
                '<div style="margin-top:7px;font-size:0.9em;">Condition names and shortcuts are not case-sensitive. Campaign-created conditions work with the same menus and <code>!cond-&lt;condition&gt;</code> shortcut.</div>'
            ].join('');
            sendPanel('ConditionAssist Help', body, { msg });
        }

        function sendConfigMenu(msg, notice = '') {
            const boolRows = [
                ['Players may view descriptions', 'userAllowed'],
                ['Players may change token conditions', 'userToggle'],
                ['Send descriptions only to the GM', 'sendOnlyToGM'],
                ['Show descriptions when markers are added', 'showDescOnStatusChange'],
                ['Show marker artwork with descriptions', 'showIconInDescription']
            ].map(([label, key]) => {
                const value = modState.config[key] === true;
                return `${_sanitize(label)}: ${GameAssist.createButton(value ? 'ON' : 'OFF', `!condition config ${key}|${!value}`)}`;
            }).join('<br>');
            const customCommand = modState.config.command === PRIMARY_COMMAND
                ? '!condition'
                : `!${_sanitize(modState.config.command)} (plus permanent !condition compatibility)`;
            const profile = modState.config.rulesProfile;
            const profileButtons = [
                profile === '2014'
                    ? '<strong>2014 SRD active</strong>'
                    : GameAssist.createButton('Use 2014 SRD', '!condition config rulesProfile|2014|?{Replace the 15 official condition descriptions with 2014 SRD wording?|No,no|Yes,yes}'),
                profile === '2024'
                    ? '<strong>2024 SRD active</strong>'
                    : GameAssist.createButton('Use 2024 SRD', '!condition config rulesProfile|2024|?{Replace the 15 official condition descriptions with 2024 SRD wording?|No,no|Yes,yes}')
            ].join(' ');
            const body = [
                notice ? `<div style="margin-bottom:7px;color:#7a3d00;">${_sanitize(notice)}</div>` : '',
                `<div><strong>Command</strong>: ${customCommand} ${GameAssist.createButton('Change', `!condition config command|?{Custom command without !|${queryText(modState.config.command)}}`)}</div>`,
                `<div style="margin-top:7px;"><strong>Condition wording</strong>: ${_sanitize(rulesProfileLabel())}<br>${profileButtons}</div>`,
                '<div style="margin-top:4px;font-size:0.9em;">Switching profiles updates only the 15 official names and descriptions. Marker choices and added campaign conditions are retained. Editing a description changes the source label to Campaign Custom.</div>',
                `<div style="margin-top:7px;">${boolRows}</div>`,
                '<div style="margin-top:8px;">',
                GameAssist.createButton(`Manage ${Object.keys(getConditions()).length} Conditions`, '!condition config-conditions'),
                ' ', GameAssist.createButton('Export', '!condition config export'),
                ' ', GameAssist.createButton('Import Help', '!condition config import'),
                '</div>',
                '<div style="margin-top:7px;font-size:0.9em;">Changing the custom command takes effect after the Mod sandbox reloads. <code>!condition</code> always remains available.</div>'
            ].join('');
            sendPanel('ConditionAssist Settings', body, { msg, gmOnly: true });
        }

        function duplicateMarkerAssignments() {
            const grouped = {};
            Object.entries(getConditions()).forEach(([key, condition]) => {
                const resolution = GameAssist.MarkerService.resolve(condition.marker);
                const markerId = resolution.ok
                    ? GameAssist.MarkerService.normalizeId(resolution.id)
                    : String(condition.marker || '').trim().toLowerCase();
                if (!markerId) return;
                grouped[markerId] = (grouped[markerId] || []).concat(condition.name || key);
            });
            return Object.values(grouped).filter(names => names.length > 1);
        }

        function sendDefinitionsMenu(msg, notice = '') {
            const duplicateMarkers = duplicateMarkerAssignments();
            const duplicateNotice = duplicateMarkers.length
                ? `<div style="margin-bottom:7px;color:#7a3d00;"><strong>Shared marker warning:</strong> ${duplicateMarkers.map(names => _sanitize(names.join(' and '))).join('; ')} use the same marker. Adding that marker may show more than one description.</div>`
                : '';
            const rows = Object.entries(getConditions())
                .sort((a, b) => a[1].name.localeCompare(b[1].name))
                .map(([key, condition]) =>
                    `<div style="margin-top:3px;"><strong>${_sanitize(condition.name)}</strong> - ${_sanitize(condition.marker)} ${GameAssist.createButton('Edit', `!condition config-conditions ${key}`)}</div>`
                ).join('');
            const body = [
                notice ? `<div style="margin-bottom:7px;color:#7a3d00;">${_sanitize(notice)}</div>` : '',
                duplicateNotice,
                rows || '<div>No condition definitions are configured.</div>',
                '<div style="margin-top:8px;">',
                GameAssist.createButton('Add Condition', '!condition config-conditions add ?{Condition name}'),
                ' ', GameAssist.createButton('Back to Settings', '!condition config'),
                '</div>'
            ].join('');
            sendPanel('Condition Definitions', body, { msg, gmOnly: true });
        }

        function sendDefinitionMenu(msg, key, notice = '') {
            const condition = getConditions()[key];
            if (!condition) {
                sendDefinitionsMenu(msg, `Condition ${key} was not found.`);
                return;
            }
            const body = [
                notice ? `<div style="margin-bottom:7px;color:#7a3d00;">${_sanitize(notice)}</div>` : '',
                `<div><strong>Name</strong>: ${_sanitize(condition.name)} ${GameAssist.createButton('Change', `!condition config-conditions ${key} name|?{Display name|${queryText(condition.name)}}`)}</div>`,
                `<div style="margin-top:5px;"><strong>Marker</strong>: ${_sanitize(condition.marker)} ${GameAssist.createButton('Change', `!condition config-conditions ${key} marker|?{Built-in id, custom display name, or exact tag|${queryText(condition.marker)}}`)}</div>`,
                `<div style="margin-top:5px;"><strong>Description</strong>: ${_sanitize(condition.description || '(blank)')}<br>${GameAssist.createButton('Edit Description', `!condition config-conditions ${key} description|?{Description|${queryText(condition.description)}}`)}</div>`,
                '<div style="margin-top:8px;">',
                GameAssist.createButton('Back', '!condition config-conditions'),
                ' ', GameAssist.createButton('Remove', `!condition config-conditions remove ${key} ?{Remove ${queryText(condition.name)}?|No,no|Yes,yes}`),
                '</div>'
            ].join('');
            sendPanel(`${condition.name} Settings`, body, { msg, gmOnly: true });
        }

        function mutateConditions(tokens, requestedConditions, action) {
            const results = { changed: 0, unchanged: 0, failed: 0, missing: [] };
            requestedConditions.forEach(requested => {
                const condition = getCondition(requested);
                if (!condition) {
                    results.missing.push(requested);
                    return;
                }
                tokens.forEach(token => {
                    const result = action === 'add'
                        ? GameAssist.MarkerService.add(token, condition.marker)
                        : (action === 'remove'
                            ? GameAssist.MarkerService.remove(token, condition.marker)
                            : GameAssist.MarkerService.toggle(token, condition.marker));
                    if (!result.ok) {
                        results.failed++;
                        GameAssist.log(MODULE_NAME, `${condition.name} could not be ${action === 'remove' ? 'removed from' : 'updated on'} ${token.get('name') || token.id}: ${result.message}`, 'WARN');
                        return;
                    }
                    if (result.changed) results.changed++;
                    else results.unchanged++;
                    if (result.present) showCondition(condition);
                });
            });
            return results;
        }

        function sendMutationResult(msg, action, results) {
            const lines = [
                `${results.changed} token marker change${results.changed === 1 ? '' : 's'} completed.`,
                results.unchanged ? `${results.unchanged} already matched the requested state.` : '',
                results.failed ? `${results.failed} could not be changed; the GM received details.` : '',
                results.missing.length ? `Unknown condition${results.missing.length === 1 ? '' : 's'}: ${_sanitize(results.missing.join(', '))}.` : ''
            ].filter(Boolean).join('<br>');
            sendPanel(`Condition ${action} complete`, lines, { msg });
        }

        function exportConfiguration(msg) {
            const payload = {
                format: 'gameassist-condition-config',
                schemaVersion: CONFIG_SCHEMA_VERSION,
                componentVersion: MODULE_VERSION,
                config: {
                    command: modState.config.command,
                    rulesProfile: modState.config.rulesProfile,
                    userAllowed: modState.config.userAllowed,
                    userToggle: modState.config.userToggle,
                    sendOnlyToGM: modState.config.sendOnlyToGM,
                    showDescOnStatusChange: modState.config.showDescOnStatusChange,
                    showIconInDescription: modState.config.showIconInDescription
                },
                conditions: getConditions()
            };
            sendPanel('ConditionAssist Export', `<pre style="white-space:pre-wrap;">${_sanitize(JSON.stringify(payload))}</pre>`, { msg, gmOnly: true });
        }

        function importConfiguration(msg, rawJson) {
            if (rawJson.length > POLICY.conditions.maxImportLength) {
                sendConfigMenu(msg, `Import exceeds ${POLICY.conditions.maxImportLength} characters.`);
                return;
            }
            let payload;
            try { payload = JSON.parse(rawJson); }
            catch {
                sendConfigMenu(msg, 'Import was refused because it is not valid JSON.');
                return;
            }
            if (!isPlainObject(payload) || hasUnsafeKey(payload)) {
                sendConfigMenu(msg, 'Import was refused because it contains an unsafe or invalid object.');
                return;
            }
            const sourceConditions = payload.conditions || payload.config?.conditions;
            const normalized = normalizeConditionMap(sourceConditions, { strict: true });
            if (!normalized.ok) {
                sendConfigMenu(msg, `Import was refused: ${normalized.errors.slice(0, 3).join(' ')}`);
                return;
            }

            const sourceConfig = isPlainObject(payload.config) ? payload.config : {};
            const boolKeys = ['userAllowed', 'userToggle', 'sendOnlyToGM', 'showDescOnStatusChange', 'showIconInDescription'];
            if (boolKeys.some(key => sourceConfig[key] !== undefined && typeof sourceConfig[key] !== 'boolean')) {
                sendConfigMenu(msg, 'Import was refused because a permission/display setting is not true or false.');
                return;
            }
            const rulesProfile = sourceConfig.rulesProfile === undefined
                ? 'custom'
                : String(sourceConfig.rulesProfile).toLowerCase();
            if (!['2014', '2024', 'custom'].includes(rulesProfile)) {
                sendConfigMenu(msg, 'Import was refused because the condition wording source is invalid.');
                return;
            }
            const capacityError = rulesProfile === 'custom'
                ? ''
                : profileCapacityError(rulesProfile, normalized.conditions);
            if (capacityError) {
                sendConfigMenu(msg, `Import was refused: ${capacityError}`);
                return;
            }
            const command = sourceConfig.command === undefined
                ? modState.config.command
                : String(sourceConfig.command).trim().replace(/^!/, '');
            if (!/^[A-Za-z][A-Za-z0-9_-]{0,39}$/.test(command)) {
                sendConfigMenu(msg, 'Import was refused because the custom command name is invalid.');
                return;
            }

            boolKeys.forEach(key => {
                if (typeof sourceConfig[key] === 'boolean') modState.config[key] = sourceConfig[key];
            });
            modState.config.command = command;
            modState.config.conditions = normalized.conditions;
            modState.config.rulesProfile = rulesProfile;
            if (rulesProfile === '2014' || rulesProfile === '2024') applyRulesProfile(rulesProfile);
            sendConfigMenu(msg, `Imported ${Object.keys(normalized.conditions).length} validated condition definitions using ${rulesProfileLabel()} wording. Reload the sandbox if the custom command changed.`);
        }

        function handleConfig(msg, body) {
            if (!playerIsGM(msg.playerid)) {
                sendPanel('ConditionAssist', 'Only the GM can change ConditionAssist settings.', { msg });
                return;
            }
            const rest = body.replace(/^config\s*/i, '');
            if (!rest) {
                sendConfigMenu(msg);
                return;
            }
            if (/^export(?:\s|$)/i.test(rest)) {
                exportConfiguration(msg);
                return;
            }
            if (/^import(?:\s|$)/i.test(rest)) {
                const rawJson = rest.replace(/^import\s*/i, '');
                if (!rawJson) sendConfigMenu(msg, 'Paste the exported JSON after !condition config import.');
                else importConfiguration(msg, rawJson);
                return;
            }

            const delimiter = rest.indexOf('|');
            if (delimiter < 1) {
                sendConfigMenu(msg, 'Choose a setting button or use key|value.');
                return;
            }
            const key = rest.slice(0, delimiter).trim();
            const values = rest.slice(delimiter + 1).split('|').map(value => value.trim());
            const rawValue = values.shift() || '';
            const confirmation = String(values.shift() || '').toLowerCase();
            const boolKeys = ['userAllowed', 'userToggle', 'sendOnlyToGM', 'showDescOnStatusChange', 'showIconInDescription'];
            if (boolKeys.includes(key)) {
                if (!/^(true|false)$/i.test(rawValue)) {
                    sendConfigMenu(msg, `${key} must be true or false.`);
                    return;
                }
                modState.config[key] = rawValue.toLowerCase() === 'true';
                sendConfigMenu(msg, `${key} is now ${modState.config[key] ? 'ON' : 'OFF'}.`);
                return;
            }
            if (key === 'command') {
                const command = rawValue.replace(/^!/, '');
                if (!/^[A-Za-z][A-Za-z0-9_-]{0,39}$/.test(command)) {
                    sendConfigMenu(msg, 'Command names must begin with a letter and contain only letters, numbers, underscores, or hyphens.');
                    return;
                }
                modState.config.command = command;
                sendConfigMenu(msg, 'Custom command saved. Reload the Mod sandbox to activate it; !condition remains available.');
                return;
            }
            if (key === 'rulesProfile') {
                const profile = rawValue.toLowerCase();
                if (!RULES_PROFILES[profile]) {
                    sendConfigMenu(msg, 'Choose either the 2014 SRD or 2024 SRD wording profile.');
                    return;
                }
                if (confirmation !== 'yes') {
                    sendConfigMenu(msg, 'Rules wording was not changed.');
                    return;
                }
                const result = applyRulesProfile(profile);
                if (!result.ok) {
                    sendConfigMenu(msg, result.message);
                    return;
                }
                sendConfigMenu(msg, `${rulesProfileLabel()} wording is now active. Custom marker choices and added campaign conditions were retained.`);
                return;
            }
            sendConfigMenu(msg, `Unknown setting: ${key}.`);
        }

        function handleDefinitionConfig(msg, body) {
            if (!playerIsGM(msg.playerid)) {
                sendPanel('ConditionAssist', 'Only the GM can change condition definitions.', { msg });
                return;
            }
            const rest = body.replace(/^config-conditions\s*/i, '');
            if (!rest) {
                sendDefinitionsMenu(msg);
                return;
            }
            const parts = rest.split(/\s+/);
            const action = parts.shift().toLowerCase();
            if (action === 'add') {
                const displayName = parts.join(' ').trim();
                const key = conditionKey(displayName);
                if (!key) {
                    sendDefinitionsMenu(msg, 'Enter a condition name.');
                    return;
                }
                if (getConditions()[key]) {
                    sendDefinitionMenu(msg, key, 'That condition already exists.');
                    return;
                }
                if (Object.keys(getConditions()).length >= POLICY.conditions.maxDefinitions) {
                    sendDefinitionsMenu(msg, `Condition limit is ${POLICY.conditions.maxDefinitions}.`);
                    return;
                }
                getConditions()[key] = { name: displayName.slice(0, POLICY.conditions.maxNameLength), marker: 'red', description: '' };
                sendDefinitionMenu(msg, key, 'Condition added. Choose its marker and description.');
                return;
            }
            if (action === 'remove') {
                const key = conditionKey(parts.shift());
                const confirmed = String(parts.shift() || '').toLowerCase() === 'yes';
                if (!confirmed) {
                    sendDefinitionMenu(msg, key, 'Removal cancelled.');
                    return;
                }
                const name = getConditions()[key]?.name || key;
                delete getConditions()[key];
                sendDefinitionsMenu(msg, `${name} was removed.`);
                return;
            }

            const key = conditionKey(action);
            if (!getConditions()[key]) {
                sendDefinitionsMenu(msg, `Condition ${action} was not found.`);
                return;
            }
            const remainder = rest.slice(action.length).trim();
            if (!remainder) {
                sendDefinitionMenu(msg, key);
                return;
            }
            const delimiter = remainder.indexOf('|');
            if (delimiter < 1) {
                sendDefinitionMenu(msg, key, 'Choose one of the edit buttons.');
                return;
            }
            const field = remainder.slice(0, delimiter).trim().toLowerCase();
            const value = remainder.slice(delimiter + 1).trim();
            if (field === 'name') {
                if (!value) {
                    sendDefinitionMenu(msg, key, 'Display name cannot be blank.');
                    return;
                }
                getConditions()[key].name = value.slice(0, POLICY.conditions.maxNameLength);
            } else if (field === 'marker' || field === 'icon') {
                if (!value) {
                    sendDefinitionMenu(msg, key, 'Marker cannot be blank.');
                    return;
                }
                getConditions()[key].marker = value.slice(0, POLICY.conditions.maxMarkerLength);
            } else if (field === 'description') {
                getConditions()[key].description = plainDescription(value);
                modState.config.rulesProfile = 'custom';
            } else {
                sendDefinitionMenu(msg, key, `Unknown definition field: ${field}.`);
                return;
            }
            sendDefinitionMenu(msg, key, 'Condition updated.');
        }

        function handleInput(msg) {
            const content = String(msg.content || '').trim();
            const body = content.replace(/^!\S+\s*/i, '').trim();
            const first = body.split(/\s+/)[0]?.toLowerCase() || '';

            if (!body) {
                sendConditionMenu(msg);
                return;
            }
            if (first === 'help') {
                sendHelp(msg);
                return;
            }
            if (first === 'status' || first === '--status') {
                sendConditionStatus(msg);
                return;
            }
            if (first === 'details') {
                handleAnnouncementDetails(msg, body);
                return;
            }
            if (first === 'announce') {
                handleAnnouncement(msg, body);
                return;
            }
            if (first === 'config') {
                handleConfig(msg, body);
                return;
            }
            if (first === 'config-conditions') {
                handleDefinitionConfig(msg, body);
                return;
            }
            if (first === 'reset') {
                if (!playerIsGM(msg.playerid)) {
                    sendPanel('ConditionAssist', 'Only the GM can reset ConditionAssist.', { msg });
                    return;
                }
                if (!/\bconfirm\b/i.test(body)) {
                    sendPanel('Reset ConditionAssist', `This restores the default definitions and settings. ${GameAssist.createButton('Confirm Reset', '!condition reset confirm')}`, { msg, gmOnly: true });
                    return;
                }
                const enabled = modState.config.enabled !== false;
                const legacyStatusInfoMigration = modState.config.legacyStatusInfoMigration || (
                    isPlainObject(state?.STATUSINFO)
                        ? { source: 'state.STATUSINFO', resetAt: isoNow(), importedSettings: [], importedConditions: 0 }
                        : undefined
                );
                modState.config = { enabled, rulesProfile: '2014', conditions: cloneDefaultConditions() };
                if (legacyStatusInfoMigration) {
                    modState.config.legacyStatusInfoMigration = legacyStatusInfoMigration;
                }
                repairConfig();
                sendConfigMenu(msg, 'ConditionAssist defaults were restored.');
                return;
            }
            if (['add', 'remove', 'toggle'].includes(first)) {
                if (!playerIsGM(msg.playerid) && !modState.config.userToggle) {
                    sendPanel('ConditionAssist', 'Only the GM can change token conditions in this campaign.', { msg });
                    return;
                }
                const tokens = selectedTokens(msg);
                if (!tokens.length) {
                    sendPanel('ConditionAssist', 'Select one or more token objects, then try the command again.', { msg });
                    return;
                }
                const requested = body.split(/\s+/).slice(1).filter(Boolean);
                if (!requested.length) {
                    sendPanel('ConditionAssist', `Add one or more condition names, such as <code>!condition ${first} prone</code>.`, { msg });
                    return;
                }
                sendMutationResult(msg, first, mutateConditions(tokens, requested, first));
                return;
            }
            if (!playerIsGM(msg.playerid) && !modState.config.userAllowed) {
                sendPanel('ConditionAssist', 'Only the GM can show condition descriptions in this campaign.', { msg });
                return;
            }
            const condition = getCondition(body);
            if (!condition) {
                sendPanel('ConditionAssist', `No condition named ${_sanitize(body)} is configured. Use <code>!condition help</code> for guidance.`, { msg });
                return;
            }
            showCondition(condition, { force: true });
        }

        function handleConditionShortcut(msg) {
            const requested = String(msg.content || '')
                .trim()
                .replace(/^!cond-/i, '')
                .split(/\s+/)[0];
            if (requested === '!') {
                handleAnnouncement(msg, 'announce');
                return;
            }
            if (!playerIsGM(msg.playerid) && !modState.config.userAllowed) {
                sendPanel('ConditionAssist', 'Only the GM can show condition descriptions in this campaign.', { msg });
                return;
            }
            const condition = getCondition(requested);
            if (!condition) {
                sendPanel('ConditionAssist', `No condition named ${_sanitize(requested || '(blank)')} is configured. Use <code>!condition help</code> for guidance.`, { msg });
                return;
            }
            showCondition(condition, { force: true });
        }

        function conditionsForMarkerEntry(entry) {
            return Object.entries(getConditions())
                .map(([key, condition]) => {
                    const resolution = GameAssist.MarkerService.resolve(condition.marker);
                    return resolution.ok && GameAssist.MarkerService.normalizeId(resolution.id) === entry.normalizedId
                        ? { key, ...condition }
                        : null;
                })
                .filter(Boolean);
        }

        const observation = GameAssist.MarkerService.observe(event => {
            if (!isRunning() || !modState.config.showDescOnStatusChange) return;
            event.added.forEach(entry => {
                if (consumeAnnouncementMarkerSuppression(event.tokenId, entry.normalizedId)) return;
                conditionsForMarkerEntry(entry).forEach(condition => showCondition(condition));
            });
        }, { owner: MODULE_NAME });
        if (!observation.ok) {
            throw new Error(observation.message || 'ConditionAssist could not observe MarkerService.');
        }

        GameAssist.onCommand('!condition', handleInput, MODULE_NAME);
        GameAssist.onCommand('!cond-', handleConditionShortcut, MODULE_NAME, {
            match: { caseInsensitive: true, mode: 'prefix' }
        });
        GameAssist.onCommand('!c-a', msg => handleAnnouncement(msg, 'announce'), MODULE_NAME, {
            match: { caseInsensitive: true, mode: 'exact' }
        });
        const customCommand = String(modState.config.command || PRIMARY_COMMAND).toLowerCase();
        if (customCommand !== PRIMARY_COMMAND) {
            GameAssist.onCommand(`!${customCommand}`, handleInput, MODULE_NAME);
        }

        GameAssist.ConditionAssist = Object.freeze({
            version: MODULE_VERSION,
            configSchemaVersion: CONFIG_SCHEMA_VERSION,
            rulesProfile: () => modState.config.rulesProfile,
            getConditions: () => JSON.parse(JSON.stringify(getConditions())),
            getCondition: name => {
                const condition = getCondition(name);
                return condition ? { ...condition } : null;
            },
            apply: (tokens, names, action = 'add') => {
                if (!isRunning()) return { ok: false, code: 'UNAVAILABLE', message: 'ConditionAssist is disabled.' };
                if (!['add', 'remove', 'toggle'].includes(action)) {
                    return { ok: false, code: 'INVALID_ARGUMENT', message: `Unsupported condition action: ${action}` };
                }
                const tokenList = Array.isArray(tokens) ? tokens.filter(Boolean) : [tokens].filter(Boolean);
                const nameList = Array.isArray(names) ? names : [names];
                const results = mutateConditions(tokenList, nameList, action);
                return { ok: results.failed === 0 && results.missing.length === 0, ...results };
            }
        });

        const standalone = getStandaloneScriptEvidence('StatusInfo');
        if (standalone.confirmed) {
            GameAssist.log(
                MODULE_NAME,
                'Standalone StatusInfo was detected. Remove or disable it before using ConditionAssist because both respond to !condition and condition-marker changes.',
                'WARN'
            );
        }
        GameAssist.log(MODULE_NAME, `v${MODULE_VERSION} Ready: !condition opens the menu; !condition status reviews the current page; !cond-[condition] shows a quick rules reference.`, 'INFO', { startup: true });
    }, {
        enabled: true,
        events: ['change:graphic:statusmarkers'],
        prefixes: ['!condition', '!cond-', '!c-a'],
        dependsOn: ['MarkerService'],
        protectedConfigKeys: ['conditions', 'rulesProfile', 'legacyStatusInfoMigration']
    });
    // --- Notes & Comments ---
    // Changed (v0.1.5.0): Advanced unreleased ConditionAssist to 1.0.1 with accurate selected-token condition recognition, a bounded GM current-page condition/marker status view plus complete status handout, case-insensitive !cond-[condition] references for official/custom definitions, !c-a and !cond-! announcement aliases, complete 2014/2024/campaign wording, built-in/custom marker artwork, selected-character announcements that toggle and verify marker state, character-first is/is-no-longer reporting, Concentrating display-name repair, documented Roll20 player-name lookup for private delivery, bounded private-reference buttons, duplicate-marker warnings, schema-v2 import/export, and automatic repair of untouched 1.0.0 defaults.
    // Decision log:
    //   CHOICE: Name the GameAssist module ConditionAssist - ALT: retain StatusInfo branding; REJECTED: this is an independently maintained adaptation with a different lifecycle and marker architecture.
    //   CHOICE: Keep permanent !condition compatibility plus one optional custom alias - ALT: replace the command; REJECTED: upgrades should not strand familiar workflows.
    //   CHOICE: Copy valid legacy state.STATUSINFO data without deleting the source branch - ALT: move/delete it; REJECTED: rollback and standalone recovery require non-destructive migration.
    //   CHOICE: Default to the 2014 SRD and offer 2024 SRD plus campaign-custom wording - ALT: one blended summary set; REJECTED: rules-edition differences must remain explicit to the GM.
    //   CHOICE: Preserve markers and added conditions when switching wording profiles - ALT: replace the complete map; REJECTED: profile selection must not erase campaign configuration.
    //   CHOICE: Reserve !cond- as a case-insensitive read-only description prefix - ALT: add individual static handlers; REJECTED: dynamic campaign definitions require one bounded prefix route.
    //   CHOICE: Capture linked token ids before the GM chooses delivery - ALT: rely on the later button click selection; REJECTED: Roll20 selection can change while a guided menu remains open.
    //   CHOICE: Use expiring private-reference grants for announcement buttons - ALT: globally allow every player description command; REJECTED: one GM announcement should not silently broaden campaign permissions.
    //   CHOICE: Toggle markers only when the GM chooses a final delivery button - ALT: mutate while browsing menus; REJECTED: opening or revisiting a menu must not change token state.
    //   CHOICE: Report each verified result as "character is condition" or "character is no longer condition" - ALT: grouped or creative narration; REJECTED: character-first statements are clearer across varied conditions and mixed selections.
    //   CHOICE: Suppress ordinary marker-add descriptions only during announcement-owned writes - ALT: allow both panels; REJECTED: one GM action should not produce duplicate condition messages.
    //   CHOICE: Show configured conditions and other markers separately in the GM status roster - ALT: label every marker as a condition; REJECTED: death, concentration, counters, and campaign markers may not represent ConditionAssist definitions.
    //   CHOICE: Omit upstream character-sheet attribute synchronization in this checkpoint - ALT: mutate sheet-specific attributes; REJECTED: GameAssist's condition contract is token-marker synchronization through MarkerService.
    // SRD 5.1 attribution:
    //   This work includes material taken from the System Reference Document 5.1 ("SRD 5.1") by Wizards of the Coast LLC and available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License available at https://creativecommons.org/licenses/by/4.0/legalcode.
    // SRD 5.2.1 attribution:
    //   This work includes material from the System Reference Document 5.2.1 ("SRD 5.2.1") by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.
    // Prior notes:
    //   Earlier unreleased v0.1.5.0 checkpoints used the name ConditionService. Saved test configuration and runtime state are migrated to ConditionAssist before startup auditing.
    //   Earlier unreleased 1.0.1 checkpoints kept announcements communication-only; live sandbox testing showed the delivery action was expected to toggle the selected token markers.
    //   StatusInfo 0.3.11 by Robin Kuiper provided the supplied compatibility baseline; the Roll20 0.3.12 package changes only its character-sheet identification line and still declares internal version 0.3.11.
    // [GAMEASSIST:MODULES:CONDITIONASSIST] END
    // =============================================================================

    // ————— TOKEN ASSIST MODULE v1.0.1 —————
    // =============================================================================
    // [GAMEASSIST:MODULES:TOKENASSIST] BEGIN
    // Section Title: GameAssist general token controls and TokenMod compatibility
    // -------------------------------------------------------------------------
    // mechsuit_section: { codename: "GAMEASSIST", area: "MODULES:TOKENASSIST", title: "TokenAssist",
    //   guarantees: ["General token controls use !token-assist and !ta/!ta-* commands; older !token-mod syntax is removed no later than v0.2.0","Selected tokens are available to their users while explicit --ids targeting remains GM-only unless the DM opts in","Every status-marker command uses CORE:MARKERSERVICE","Valid legacy state.TokenMod playersCanUse_ids configuration is copied once without deleting the source state","A detected standalone TokenMod suspends only overlapping !token-mod handling and produces an actionable warning rather than double-applying token changes"],
    //   depends_on: ["[GAMEASSIST:POLICY]","[GAMEASSIST:APP:UTILS]","[GAMEASSIST:CORE:MARKERSERVICE]","[GAMEASSIST:CORE:OBJECT]"],
    //   provides: ["GameAssist.TokenAssist"],
    //   last_updated_version: "v0.1.5.0",
    //   independent_versions: { module_version: "1.0.1", token_config_schema_version: 1, tokenmod_reference_version: "0.8.88" }, lifecycle: "active" }
    // -------------------------------------------------------------------------
    // Narrative
    // TokenAssist provides GameAssist's general token controls through a verified,
    // intentionally bounded command surface. Older !token-mod syntax remains temporary;
    // GameAssist lifecycle, validation, diagnostics, and MarkerService own the behavior.
    // See ATTRIBUTIONS.md for TokenMod credit, pinned source, and the MIT notice.
    // -------------------------------------------------------------------------
    const TokenAssist = (() => {
        const MODULE_NAME = 'TokenAssist';
        const MODULE_VERSION = '1.0.1';
        const CONFIG_SCHEMA_VERSION = 1;
        const TOKENMOD_REFERENCE = Object.freeze({
            version: '0.8.88',
            repository: 'Roll20/roll20-api-scripts',
            commit: '9d634d3149985dcf10333920b3f4c41f215f39fc',
            path: 'TokenMod/0.8.88/TokenMod.js',
            blob: 'fc6c9cb45ec2f2ee254a24f849e089507a0e610a'
        });
        const observers = new Map();
        let observerId = 0;
        let legacyWarningShown = false;

        const BOOLEAN_FIELDS = new Set([
            'showname', 'show_tooltip', 'gm_only_tooltip',
            'showplayers_name', 'showplayers_bar1', 'showplayers_bar2',
            'showplayers_bar3', 'showplayers_bar4', 'showplayers_aura1',
            'showplayers_aura2', 'playersedit_name', 'playersedit_bar1',
            'playersedit_bar2', 'playersedit_bar3', 'playersedit_bar4',
            'playersedit_aura1', 'playersedit_aura2', 'light_otherplayers',
            'light_hassight', 'isdrawing', 'disableSnapping', 'disableTokenMenu',
            'flipv', 'fliph', 'aura1_square', 'aura2_square', 'lockMovement',
            'fadeOnOverlap', 'renderAsScenery', 'has_bright_light_vision',
            'has_night_vision', 'emits_bright_light', 'emits_low_light',
            'has_limit_field_of_vision', 'has_limit_field_of_night_vision',
            'has_directional_bright_light', 'has_directional_dim_light'
        ]);
        const PIXEL_FIELDS = new Set(['left', 'top', 'width', 'height']);
        const DISTANCE_FIELDS = new Set([
            'light_radius', 'light_dimradius', 'adv_fow_view_distance',
            'aura1_radius', 'aura2_radius', 'night_vision_distance',
            'bright_light_distance', 'low_light_distance'
        ]);
        const NUMBER_FIELDS = new Set([
            ...PIXEL_FIELDS, ...DISTANCE_FIELDS, 'rotation', 'light_angle',
            'light_losangle', 'light_multiplier', 'light_sensitivity_multiplier',
            'limit_field_of_vision_center', 'limit_field_of_night_vision_center',
            'directional_bright_light_center', 'directional_dim_light_center',
            'limit_field_of_vision_total', 'limit_field_of_night_vision_total',
            'directional_bright_light_total', 'directional_dim_light_total'
        ]);
        const PERCENTAGE_FIELDS = new Set(['fadeOpacity', 'baseOpacity', 'dim_light_opacity']);
        const TEXT_FIELDS = new Set([
            'name', 'tooltip', 'bar1_value', 'bar2_value', 'bar3_value', 'bar4_value',
            'bar1_max', 'bar2_max', 'bar3_max', 'bar4_max', 'represents',
            'bar1_link', 'bar2_link', 'bar3_link', 'bar4_link', 'controlledby'
        ]);
        const COLOR_FIELDS = new Set([
            'aura1_color', 'aura2_color', 'tint_color', 'night_vision_tint', 'lightColor'
        ]);
        const OPTION_FIELDS = Object.freeze({
            layer: Object.freeze({ objects: 'objects', gmlayer: 'gmlayer', map: 'map', walls: 'walls' }),
            aura1_options: Object.freeze({ '': 'circle', circle: 'circle', square: 'square' }),
            aura2_options: Object.freeze({ '': 'circle', circle: 'circle', square: 'square' }),
            night_vision_effect: Object.freeze({ '': 'None', off: 'None', none: 'None', nocturnal: 'Nocturnal' }),
            bar_location: Object.freeze({ '': null, off: null, none: null, above: 'above', below: 'below', overlap_top: 'overlap_top', overlap_bottom: 'overlap_bottom' }),
            compact_bar: Object.freeze({ '': null, off: null, none: null, on: 'compact', compact: 'compact' }),
            bar1_num_permission: Object.freeze({ '': '', editor: '', hidden: 'hidden', none: 'hidden', everyone: 'everyone', all: 'everyone' }),
            bar2_num_permission: Object.freeze({ '': '', editor: '', hidden: 'hidden', none: 'hidden', everyone: 'everyone', all: 'everyone' }),
            bar3_num_permission: Object.freeze({ '': '', editor: '', hidden: 'hidden', none: 'hidden', everyone: 'everyone', all: 'everyone' }),
            bar4_num_permission: Object.freeze({ '': '', editor: '', hidden: 'hidden', none: 'hidden', everyone: 'everyone', all: 'everyone' })
        });
        const FIELD_ALIASES = Object.freeze({
            bar1_current: 'bar1_value',
            bar2_current: 'bar2_value',
            bar3_current: 'bar3_value',
            bar4_current: 'bar4_value',
            aura1_option: 'aura1_options',
            aura2_option: 'aura2_options',
            aura1_shape: 'aura1_options',
            aura2_shape: 'aura2_options',
            bright_vision: 'has_bright_light_vision',
            night_vision: 'has_night_vision',
            emits_bright: 'emits_bright_light',
            emits_low: 'emits_low_light',
            night_distance: 'night_vision_distance',
            bright_distance: 'bright_light_distance',
            low_distance: 'low_light_distance',
            low_light_opacity: 'dim_light_opacity',
            has_directional_low_light: 'has_directional_dim_light',
            directional_low_light_total: 'directional_dim_light_total',
            directional_low_light_center: 'directional_dim_light_center',
            currentside: 'currentSide',
            lightcolor: 'lightColor',
            light_color: 'lightColor',
            lockmovement: 'lockMovement',
            lock_movement: 'lockMovement',
            disablesnapping: 'disableSnapping',
            disable_snapping: 'disableSnapping',
            disabletokenmenu: 'disableTokenMenu',
            disable_token_menu: 'disableTokenMenu',
            fadeonoverlap: 'fadeOnOverlap',
            renderasscenery: 'renderAsScenery',
            fadeopacity: 'fadeOpacity',
            baseopacity: 'baseOpacity'
        });
        const FIELD_CASE = (() => {
            const names = [
                ...BOOLEAN_FIELDS, ...NUMBER_FIELDS, ...PERCENTAGE_FIELDS,
                ...TEXT_FIELDS, ...COLOR_FIELDS, ...Object.keys(OPTION_FIELDS),
                'currentSide', 'statusmarkers'
            ];
            return Object.freeze(names.reduce((map, name) => {
                map[name.toLowerCase()] = name;
                return map;
            }, {}));
        })();
        const SNAPSHOT_FIELDS = Object.freeze([
            ...new Set([
                ...Object.values(FIELD_CASE), 'lastmove', 'pageid', '_pageid',
                'statusmarkers'
            ])
        ]);

        function getModuleState() {
            const modState = GameAssist.getState(MODULE_NAME);
            const config = modState.config;
            const runtime = modState.runtime;

            if (config.configSchemaVersion !== CONFIG_SCHEMA_VERSION) {
                config.configSchemaVersion = CONFIG_SCHEMA_VERSION;
            }

            if (!runtime.tokenModMigration || typeof runtime.tokenModMigration !== 'object') {
                const legacy = (typeof state !== 'undefined' && state.TokenMod && typeof state.TokenMod === 'object')
                    ? state.TokenMod
                    : null;
                const copied = [];
                if (config.playersCanUseIds === undefined && typeof legacy?.playersCanUse_ids === 'boolean') {
                    config.playersCanUseIds = legacy.playersCanUse_ids;
                    copied.push('playersCanUse_ids');
                }
                runtime.tokenModMigration = {
                    checkedAt: isoNow(),
                    sourceFound: Boolean(legacy),
                    sourceSchemaVersion: legacy?.version ?? null,
                    copied,
                    sourcePreserved: true
                };
            }

            if (typeof config.playersCanUseIds !== 'boolean') config.playersCanUseIds = false;
            if (typeof config.warnOnStandalone !== 'boolean') config.warnOnStandalone = true;
            return modState;
        }

        function isEnabled() {
            return Boolean(
                MODULES[MODULE_NAME]?.active &&
                MODULES[MODULE_NAME]?.initialized &&
                GameAssist.MarkerService.isEnabled()
            );
        }

        function getDisplayName(playerId, fallback = 'gm') {
            if (!playerId || playerId === 'API') return fallback;
            const player = getObj('player', playerId);
            return String(player?.get('_displayname') || player?.get('displayname') || fallback)
                .replace(/\s+\(GM\)$/i, '')
                .replace(/"/g, '');
        }

        function whisper(msg, body) {
            const fallback = String(msg?.who || 'gm').replace(/\s+\(GM\)$/i, '').replace(/"/g, '');
            const who = getDisplayName(msg?.playerid, fallback);
            sendChat('GameAssist TokenAssist', `/w "${who}" ${body}`);
        }

        function truthy(value) {
            return ['1', 'on', 'yes', 'true', 'sure', 'yup'].includes(String(value ?? '').toLowerCase());
        }

        function falsey(value) {
            return ['0', 'off', 'no', 'false', 'none'].includes(String(value ?? '').toLowerCase());
        }

        function canonicalField(raw) {
            const lower = String(raw || '').trim().toLowerCase();
            const alias = FIELD_ALIASES[lower] || lower;
            return FIELD_CASE[String(alias).toLowerCase()] || null;
        }

        function tokenize(text) {
            const tokens = [];
            let current = '';
            let quote = null;
            for (let i = 0; i < text.length; i++) {
                const ch = text[i];
                if (quote) {
                    if (ch === quote) quote = null;
                    else current += ch;
                    continue;
                }
                if (ch === '"' || ch === "'") {
                    quote = ch;
                    continue;
                }
                if (/\s/.test(ch)) {
                    if (current) tokens.push(current);
                    current = '';
                    continue;
                }
                current += ch;
            }
            if (current) tokens.push(current);
            return tokens;
        }

        function splitFlagGroups(text) {
            const groups = [];
            let current = '';
            let quote = null;
            let inFlag = false;

            for (let i = 0; i < text.length; i++) {
                const ch = text[i];
                if (quote) {
                    current += ch;
                    if (ch === quote) quote = null;
                    continue;
                }
                if (ch === '"' || ch === "'") {
                    quote = ch;
                    current += ch;
                    continue;
                }
                const atBoundary = i === 0 || /\s/.test(text[i - 1]);
                if (ch === '-' && text[i + 1] === '-' && atBoundary) {
                    if (inFlag && current.trim()) groups.push(current.trim());
                    current = '';
                    inFlag = true;
                    i++;
                    continue;
                }
                if (inFlag) current += ch;
            }
            if (inFlag && current.trim()) groups.push(current.trim());
            return groups;
        }

        function expandInlineRolls(msg) {
            const rolls = Array.isArray(msg?.inlinerolls) ? msg.inlinerolls : [];
            return String(msg?.content || '').replace(/\$\[\[(\d+)\]\]/g, (match, index) => {
                const total = rolls[Number(index)]?.results?.total;
                return Number.isFinite(Number(total)) ? String(total) : '0';
            });
        }

        function parseRequest(msg) {
            let content = expandInlineRolls(msg)
                .replace(/<br\s*\/?>/gi, ' ')
                .replace(/\{\{|\}\}/g, ' ');
            const taFlag = content.match(/^!ta-([a-z][a-z-]*)\b/i);
            if (taFlag) {
                content = `!token-assist --${taFlag[1]}${content.slice(taFlag[0].length)}`;
            } else {
                content = content.replace(/^!ta\b/i, '!token-assist');
            }
            const body = content.replace(/^!(?:token-assist|token-mod)\b/i, '').trim();
            const request = {
                help: !body,
                helpMarkers: false,
                configRequested: false,
                config: [],
                apiAs: null,
                ids: [],
                ignoreSelected: false,
                currentPage: false,
                activePages: false,
                on: [],
                off: [],
                flip: [],
                set: [],
                order: [],
                move: [],
                reports: [],
                unknown: []
            };

            splitFlagGroups(body).forEach(group => {
                const words = tokenize(group);
                const flag = String(words.shift() || '').toLowerCase();
                switch (flag) {
                    case 'help': request.help = true; break;
                    case 'help-statusmarkers': request.helpMarkers = true; break;
                    case 'config': request.configRequested = true; request.config.push(...words); break;
                    case 'api-as': request.apiAs = words[0] || null; break;
                    case 'ids': request.ids.push(...words); break;
                    case 'ignore-selected': request.ignoreSelected = true; break;
                    case 'current-page': request.currentPage = true; break;
                    case 'active-pages': request.activePages = true; break;
                    case 'on': request.on.push(...words); break;
                    case 'off': request.off.push(...words); break;
                    case 'flip': request.flip.push(...words); break;
                    case 'set': request.set.push(...words); break;
                    case 'order': request.order.push(...words); break;
                    case 'move': request.move.push(...words); break;
                    case 'report': request.reports.push(...words); break;
                    case 'debug': request.unknown.push(flag); break;
                    default: if (flag) request.unknown.push(flag);
                }
            });
            return request;
        }

        function parseFieldSpec(raw) {
            const match = String(raw || '').match(/^([^|#]+)[|#](.*)$/);
            if (!match) return { ok: false, message: `Expected property|value, received "${String(raw || '')}".` };
            return { ok: true, field: match[1], value: match[2] };
        }

        function compileSetSpec(raw) {
            const parsed = parseFieldSpec(raw);
            if (!parsed.ok) return parsed;
            const requested = String(parsed.field).toLowerCase();

            if (/^bar[1-4]$/.test(requested)) {
                return {
                    ok: true,
                    operations: [
                        { field: `${requested}_value`, value: parsed.value },
                        { field: `${requested}_max`, value: parsed.value }
                    ]
                };
            }
            if (requested === 'scale') {
                return {
                    ok: true,
                    operations: [
                        { field: 'width', value: parsed.value },
                        { field: 'height', value: parsed.value }
                    ]
                };
            }

            const field = canonicalField(requested);
            if (!field) {
                const unsupported = ['imgsrc', 'sides', 'defaulttoken'].includes(requested)
                    ? ` This advanced TokenMod feature is not in TokenAssist ${MODULE_VERSION}.`
                    : '';
                return { ok: false, message: `Unsupported token property "${parsed.field}".${unsupported}` };
            }
            return { ok: true, operations: [{ field, value: parsed.value }] };
        }

        function getPage(token) {
            return getObj('page', token.get('pageid') || token.get('_pageid'));
        }

        function convertUnits(number, unit, page, mode) {
            const value = Number(number);
            const normalizedUnit = String(unit || '').toLowerCase();
            if (!normalizedUnit) return value;
            const scale = Number(page?.get('scale_number')) || 1;
            const snap = Number(page?.get('snapping_increment')) || 1;
            if (mode === 'distance') {
                if (normalizedUnit === 'u') return value * scale * (1 / snap);
                if (normalizedUnit === 'g') return value * scale;
                return value;
            }
            if (normalizedUnit === 'u') return value * 70;
            if (normalizedUnit === 'g') return value * snap * 70;
            return (value / scale) * 70;
        }

        function numericValue(token, updates, field, raw) {
            const text = String(raw ?? '').trim();
            if (!text && DISTANCE_FIELDS.has(field)) return { ok: true, value: '' };
            const toggleMatch = DISTANCE_FIELDS.has(field)
                ? text.match(/^!([+\-]?(?:\d+(?:\.\d+)?|\.\d+))(u|g|s|ft|m|km|mi|in|cm|un|hex|sq)?$/i)
                : null;
            if (toggleMatch) {
                const currentRaw = Object.prototype.hasOwnProperty.call(updates, field) ? updates[field] : token.get(field);
                const hasCurrent = String(currentRaw ?? '').trim() !== '' && Number(currentRaw) !== 0;
                return {
                    ok: true,
                    value: hasCurrent ? '' : convertUnits(toggleMatch[1], toggleMatch[2], getPage(token), 'distance')
                };
            }
            const match = text.match(/^([=+\-*/])?([+\-]?(?:\d+(?:\.\d+)?|\.\d+))(u|g|s|ft|m|km|mi|in|cm|un|hex|sq)?$/i);
            if (!match) return { ok: false, message: `${field} requires a number or supported unit value.` };

            const operation = match[1] || '=';
            const page = getPage(token);
            const mode = PIXEL_FIELDS.has(field) ? 'pixel' : (DISTANCE_FIELDS.has(field) ? 'distance' : 'plain');
            let next = mode === 'plain'
                ? Number(match[2])
                : convertUnits(match[2], match[3], page, mode);
            const current = Number(Object.prototype.hasOwnProperty.call(updates, field) ? updates[field] : token.get(field));

            if (operation !== '=') {
                if (!Number.isFinite(current)) return { ok: false, message: `${field} is not currently numeric.` };
                if (operation === '+') next = current + next;
                if (operation === '-') next = current - next;
                if (operation === '*') next = current * next;
                if (operation === '/') next = current / (next || 1);
            }

            if (field === 'rotation') next = ((next % 360) + 360) % 360;
            if (PIXEL_FIELDS.has(field) && ['width', 'height'].includes(field)) next = Math.max(1, next);
            return { ok: true, value: next };
        }

        /**
         * normalizeLiteralColor — Convert supported TokenAssist color literals to Roll20 hex storage.
         * Inputs: transparent, 3/4/6/8-digit hex, rgb/rgba, or hsv/hsva.
         * Outputs: transparent, #rrggbb, #rrggbbaa, or null for invalid input.
         * Invariants: components are bounded before conversion; no relative color arithmetic occurs here.
         * Design: Roll20 aura/tint fields store hex values even when a command uses readable RGB or HSV syntax.
         */
        function normalizeLiteralColor(raw) {
            const text = String(raw || '').trim().toLowerCase();
            if (text === 'transparent') return 'transparent';

            const hex = text.match(/^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
            if (hex) {
                let value = hex[1].toLowerCase();
                if (value.length === 3 || value.length === 4) {
                    value = value.split('').map(ch => ch + ch).join('');
                }
                return `#${value}`;
            }

            const functional = text.match(/^(rgb|rgba|hsv|hsva)\(([^)]+)\)$/i);
            if (!functional) return null;
            const mode = functional[1].slice(0, 3).toLowerCase();
            const parts = functional[2].split(',').map(part => part.trim());
            if (parts.length < 3 || parts.length > 4 || parts.some(part => part === '' || !Number.isFinite(Number(part)))) {
                return null;
            }

            const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
            const scaled = (part, decimalMaximum, integerMaximum) => {
                const value = Number(part);
                return String(part).includes('.')
                    ? clamp(value, 0, 1) * decimalMaximum
                    : clamp(value, 0, integerMaximum) * (decimalMaximum / integerMaximum);
            };
            let red;
            let green;
            let blue;

            if (mode === 'rgb') {
                red = scaled(parts[0], 255, 255);
                green = scaled(parts[1], 255, 255);
                blue = scaled(parts[2], 255, 255);
            } else {
                const hue = ((scaled(parts[0], 360, 360) % 360) + 360) % 360;
                const saturation = scaled(parts[1], 1, 100);
                const value = scaled(parts[2], 1, 100);
                const chroma = value * saturation;
                const segment = hue / 60;
                const secondary = chroma * (1 - Math.abs((segment % 2) - 1));
                const match = value - chroma;
                const rgb = segment < 1 ? [chroma, secondary, 0]
                    : segment < 2 ? [secondary, chroma, 0]
                        : segment < 3 ? [0, chroma, secondary]
                            : segment < 4 ? [0, secondary, chroma]
                                : segment < 5 ? [secondary, 0, chroma]
                                    : [chroma, 0, secondary];
                [red, green, blue] = rgb.map(component => (component + match) * 255);
            }

            const toHex = value => Math.round(clamp(value, 0, 255)).toString(16).padStart(2, '0');
            const alpha = parts.length === 4 ? scaled(parts[3], 255, 100) : null;
            return `#${toHex(red)}${toHex(green)}${toHex(blue)}${alpha === null ? '' : toHex(alpha)}`;
        }

        function propertyValue(token, updates, operation) {
            const { field } = operation;
            const raw = String(operation.value ?? '');

            if (BOOLEAN_FIELDS.has(field)) {
                if (truthy(raw)) return { ok: true, value: true };
                if (falsey(raw) || raw === '') return { ok: true, value: false };
                return { ok: false, message: `${field} expects on/off, yes/no, or true/false.` };
            }
            if (NUMBER_FIELDS.has(field)) return numericValue(token, updates, field, raw);
            if (PERCENTAGE_FIELDS.has(field)) {
                const match = raw.replace(/%$/, '').match(/^([=+\-*/])?([+\-]?(?:\d+(?:\.\d+)?|\.\d+))$/);
                if (!match) return { ok: false, message: `${field} requires a percentage value.` };
                const operationName = match[1] || '=';
                let amount = Number(match[2]);
                if (Math.abs(amount) > 1) amount /= 100;
                let value = amount;
                if (operationName !== '=') {
                    const current = Number(Object.prototype.hasOwnProperty.call(updates, field) ? updates[field] : token.get(field));
                    if (!Number.isFinite(current)) return { ok: false, message: `${field} is not currently numeric.` };
                    if (operationName === '+') value = current + amount;
                    if (operationName === '-') value = current - amount;
                    if (operationName === '*') value = current * amount;
                    if (operationName === '/') value = current / (amount || 1);
                }
                return { ok: true, value: Math.max(0, Math.min(1, value)) };
            }
            if (COLOR_FIELDS.has(field)) {
                const value = normalizeLiteralColor(raw);
                if (value === null) {
                    return { ok: false, message: `${field} requires transparent, a hex color, rgb/rgba, or hsv/hsva.` };
                }
                return { ok: true, value };
            }
            if (OPTION_FIELDS[field]) {
                const value = raw.toLowerCase();
                if (!Object.prototype.hasOwnProperty.call(OPTION_FIELDS[field], value)) {
                    return { ok: false, message: `${field} does not support "${raw}".` };
                }
                return { ok: true, value: OPTION_FIELDS[field][value] };
            }
            if (field === 'currentSide') {
                const side = Number(raw);
                if (!Number.isInteger(side) || side < 1) {
                    return { ok: false, message: 'currentSide uses a 1-based positive side number.' };
                }
                return { ok: true, value: side - 1 };
            }
            if (TEXT_FIELDS.has(field)) {
                if (/^bar[1-4]_(?:value|max)$/.test(field) && /^[+\-*/=]/.test(raw)) {
                    const result = numericValue(token, updates, field, raw);
                    if (result.ok) return result;
                }
                return { ok: true, value: raw };
            }
            return { ok: false, message: `Unsupported token property "${field}".` };
        }

        function parseMove(raw) {
            const parts = String(raw || '').split(/[|#]/);
            let angleText = '0';
            let distanceText = parts[0];
            if (parts.length > 1) {
                angleText = parts.shift();
                distanceText = parts.shift();
            }
            const angle = String(angleText).match(/^(=)?([+\-]?(?:\d+(?:\.\d+)?|\.\d+))(!)?$/);
            const distance = String(distanceText || '').match(/^([+\-]?(?:\d+(?:\.\d+)?|\.\d+))(u|g|s|ft|m|km|mi|in|cm|un|hex|sq)?$/i);
            if (!angle || !distance) return { ok: false, message: `Unsupported move expression "${raw}".` };
            return {
                ok: true,
                relativeAngle: angle[1] !== '=',
                angle: Number(angle[2]),
                updateFacing: angle[3] === '!',
                distance: Number(distance[1]),
                unit: distance[2] || ''
            };
        }

        function compileRequest(request) {
            const errors = [];
            const operations = [];
            const booleans = { on: [], off: [], flip: [] };
            const moves = [];
            const reports = [];

            ['on', 'off', 'flip'].forEach(mode => {
                request[mode].forEach(raw => {
                    const field = canonicalField(raw);
                    if (!field || !BOOLEAN_FIELDS.has(field)) errors.push(`--${mode} does not support "${raw}".`);
                    else booleans[mode].push(field);
                });
            });
            request.set.forEach(raw => {
                const compiled = compileSetSpec(raw);
                if (!compiled.ok) errors.push(compiled.message);
                else operations.push(...compiled.operations);
            });
            request.move.forEach(raw => {
                const move = parseMove(raw);
                if (!move.ok) errors.push(move.message);
                else moves.push(move);
            });
            request.order.forEach(raw => {
                if (!['tofront', 'toback', 'front', 'back'].includes(String(raw).toLowerCase())) {
                    errors.push(`--order supports tofront or toback, not "${raw}".`);
                }
            });
            request.reports.forEach(raw => {
                const parsed = parseFieldSpec(raw);
                if (!parsed.ok || !parsed.value) errors.push(`--report expects recipients|message, received "${raw}".`);
                else reports.push({ recipients: parsed.field.toLowerCase().split(/[:;]/), message: parsed.value });
            });
            request.unknown.forEach(flag => errors.push(`Unknown option --${flag}.`));
            booleans.on = [...new Set(booleans.on)];
            booleans.off = [...new Set(booleans.off)].filter(field => !booleans.on.includes(field));
            booleans.flip = [...new Set(booleans.flip)]
                .filter(field => !booleans.on.includes(field) && !booleans.off.includes(field));
            return { ok: !errors.length, errors, operations, booleans, moves, reports };
        }

        function selectedIds(msg) {
            return (Array.isArray(msg?.selected) ? msg.selected : [])
                .map(entry => entry?._id || entry?.id)
                .filter(Boolean);
        }

        function pageForPlayer(playerId) {
            const campaign = Campaign();
            const ribbon = campaign.get('playerpageid');
            const specific = campaign.get('playerspecificpages') || {};
            if (playerId && playerId !== 'API' && playerIsGM(playerId)) {
                return getObj('player', playerId)?.get('_lastpage') || ribbon;
            }
            return specific[playerId] || ribbon;
        }

        function activePages() {
            const campaign = Campaign();
            const pages = [campaign.get('playerpageid')];
            const specific = campaign.get('playerspecificpages') || {};
            pages.push(...Object.values(specific));
            (findObjs({ type: 'player' }) || []).forEach(player => {
                if (playerIsGM(player.id) && player.get('_online')) pages.push(player.get('_lastpage'));
            });
            return [...new Set(pages.filter(Boolean))];
        }

        function resolveTargets(msg, request, effectivePlayerId) {
            const config = getModuleState().config;
            const gm = effectivePlayerId === 'API' || playerIsGM(effectivePlayerId);
            let ids = request.ignoreSelected ? [] : selectedIds(msg);
            if (request.ids.length) {
                if (gm || config.playersCanUseIds) ids.push(...request.ids);
                else whisper(msg, 'Only the GM may use <code>--ids</code> unless the DM enables that TokenAssist setting. Selected tokens are still available.');
            }

            const pageFilter = request.currentPage
                ? new Set([pageForPlayer(effectivePlayerId)])
                : (request.activePages ? new Set(activePages()) : null);
            const tokens = [];
            [...new Set(ids)].forEach(id => {
                const token = getObj('graphic', id);
                if (token) tokens.push(token);
                else {
                    const character = getObj('character', id);
                    if (character) tokens.push(...(findObjs({ type: 'graphic', represents: character.id }) || []));
                }
            });
            return [...new Map(tokens
                .filter(token => !pageFilter || pageFilter.has(token.get('pageid') || token.get('_pageid')))
                .map(token => [token.id, token])).values()];
        }

        function snapshotToken(token) {
            return SNAPSHOT_FIELDS.reduce((snapshot, field) => {
                try { snapshot[field] = token.get(field); }
                catch (error) { snapshot[field] = undefined; }
                return snapshot;
            }, { _id: token.id, id: token.id });
        }

        function clearAllMarkers(token) {
            const read = GameAssist.MarkerService.read(token);
            if (!read.ok) return [read];
            const ids = [...new Set(read.entries.map(entry => entry.id))];
            return ids.map(id => GameAssist.MarkerService.remove(token, id, { owner: MODULE_NAME }));
        }

        function decodeMarker(raw) {
            let text = String(raw || '').trim().replace(/;;/g, '::');
            let action = 'add';
            if (/^[+\-!=?]/.test(text)) {
                const prefix = text[0];
                text = text.slice(1);
                action = { '+': 'add', '-': 'remove', '!': 'toggle', '=': 'replace', '?': 'conditional' }[prefix];
            }
            if (/\[[^\]]*\]/.test(text)) {
                return { ok: false, message: `Duplicate-index marker syntax is not supported in TokenAssist ${MODULE_VERSION}: ${raw}` };
            }
            if (action === 'conditional') {
                return { ok: false, message: `Conditional marker syntax is not supported in TokenAssist ${MODULE_VERSION}: ${raw}` };
            }

            let marker = text;
            let number = null;
            const countMatch = text.includes('::')
                ? text.match(/^(.*::[^;:]+)(?:[;:]([0-9]))$/)
                : text.match(/^(.*?)(?:[;:]([0-9]))$/);
            if (countMatch) {
                marker = countMatch[1];
                number = Number(countMatch[2]);
            }
            return { ok: true, action, marker, number };
        }

        function applyMarkerSpec(token, value) {
            const results = [];
            const specs = String(value).split('|');
            specs.forEach(raw => {
                const decoded = decodeMarker(raw);
                if (!decoded.ok) {
                    results.push({ ok: false, changed: false, message: decoded.message });
                    return;
                }
                if (decoded.action === 'replace' && decoded.marker) {
                    const resolution = GameAssist.MarkerService.resolve(decoded.marker);
                    if (!resolution.ok) {
                        results.push(resolution);
                        return;
                    }
                    decoded.marker = resolution.id;
                }
                if (decoded.action === 'replace') results.push(...clearAllMarkers(token));
                if (!decoded.marker) return;
                const options = { owner: MODULE_NAME };
                if (decoded.number !== null) options.number = decoded.number;
                if (decoded.action === 'remove') results.push(GameAssist.MarkerService.remove(token, decoded.marker, options));
                else if (decoded.action === 'toggle') results.push(GameAssist.MarkerService.toggle(token, decoded.marker, options));
                else results.push(GameAssist.MarkerService.add(token, decoded.marker, options));
            });
            return results;
        }

        function applyLinkedBars(token, updates) {
            for (let number = 1; number <= 4; number++) {
                const valueKey = `bar${number}_value`;
                const maxKey = `bar${number}_max`;
                if (!Object.prototype.hasOwnProperty.call(updates, valueKey) &&
                    !Object.prototype.hasOwnProperty.call(updates, maxKey)) continue;
                const linkKey = `bar${number}_link`;
                const link = Object.prototype.hasOwnProperty.call(updates, linkKey)
                    ? updates[linkKey]
                    : token.get(linkKey);
                const attribute = link ? getObj('attribute', link) : null;
                if (!attribute) continue;
                const change = {};
                if (Object.prototype.hasOwnProperty.call(updates, valueKey)) {
                    change.current = updates[valueKey];
                    delete updates[valueKey];
                }
                if (Object.prototype.hasOwnProperty.call(updates, maxKey)) {
                    change.max = updates[maxKey];
                    delete updates[maxKey];
                }
                if (typeof attribute.setWithWorker === 'function') attribute.setWithWorker(change);
                else attribute.set(change);
            }
        }

        function applyMove(token, updates, move) {
            const currentRotation = Number(Object.prototype.hasOwnProperty.call(updates, 'rotation')
                ? updates.rotation
                : token.get('rotation')) || 0;
            const angle = ((move.relativeAngle ? currentRotation : 0) + move.angle + 360) % 360;
            const radians = (angle - 90) * (Math.PI / 180);
            const distance = convertUnits(move.distance, move.unit, getPage(token), 'pixel');
            const left = Number(Object.prototype.hasOwnProperty.call(updates, 'left') ? updates.left : token.get('left')) || 0;
            const top = Number(Object.prototype.hasOwnProperty.call(updates, 'top') ? updates.top : token.get('top')) || 0;
            // CHOICE: Preserve only movement points created by this command; an older Roll20 lastmove trail would draw back to a stale origin.
            const priorLastMove = Object.prototype.hasOwnProperty.call(updates, 'lastmove') ? updates.lastmove : '';
            updates.lastmove = priorLastMove ? `${priorLastMove},${left},${top}` : `${left},${top}`;
            updates.left = left + distance * Math.cos(radians);
            updates.top = top + distance * Math.sin(radians);
            if (move.updateFacing) updates.rotation = angle;
        }

        function notifyObservers(token, previous, context) {
            observers.forEach(subscription => {
                try { subscription.callback(token, previous, context); }
                catch (error) { GameAssist.handleError(subscription.owner, error); }
            });
        }

        function controllerNames(token) {
            const ids = new Set(String(token.get('controlledby') || '').split(',').filter(Boolean));
            const character = getObj('character', token.get('represents'));
            String(character?.get('controlledby') || '').split(',').filter(Boolean).forEach(id => ids.add(id));
            return [...ids].map(id => id === 'all' ? 'all' : getDisplayName(id, id));
        }

        function reportValue(token, previous, expression) {
            const [rawField, modifier] = String(expression || '').split(/[:;]/);
            const field = canonicalField(rawField) || rawField;
            const before = previous[field];
            const after = token.get(field);
            if (modifier === 'before') return before;
            if (modifier === 'change') return `${before} -> ${after}`;
            if (modifier === 'abschange') return Math.abs((Number(after) || 0) - (Number(before) || 0));
            return field === 'currentSide' ? (Number(after) || 0) + 1 : after;
        }

        function sendReports(msg, token, previous, reports) {
            reports.forEach(report => {
                const body = _sanitize(report.message.replace(/\{(.+?)\}/g, (match, expression) =>
                    String(reportValue(token, previous, expression) ?? '')
                ));
                const recipients = new Set();
                report.recipients.forEach(recipient => {
                    if (recipient === 'all') recipients.add('all');
                    else if (recipient === 'gm') recipients.add('gm');
                    else if (recipient === 'player') {
                        const fallback = String(msg.who || 'gm').replace(/\s+\(GM\)$/i, '').replace(/"/g, '');
                        recipients.add(getDisplayName(msg.playerid, fallback));
                    }
                    else if (['token', 'character', 'control'].includes(recipient)) {
                        controllerNames(token).forEach(name => recipients.add(name));
                    }
                });
                if (!recipients.size) recipients.add('gm');
                if (recipients.has('all')) sendChat('GameAssist TokenAssist', body);
                else recipients.forEach(recipient => sendChat('GameAssist TokenAssist', `/w "${String(recipient).replace(/"/g, '')}" ${body}`));
            });
        }

        function applyToToken(msg, token, compiled, request) {
            const previous = snapshotToken(token);
            const updates = {};
            const markerOperations = [];
            const failures = [];
            let changed = false;

            compiled.booleans.on.forEach(field => { updates[field] = true; });
            compiled.booleans.off.forEach(field => { updates[field] = false; });
            compiled.booleans.flip.forEach(field => {
                updates[field] = !Boolean(Object.prototype.hasOwnProperty.call(updates, field) ? updates[field] : token.get(field));
            });
            compiled.operations.forEach(operation => {
                if (operation.field === 'statusmarkers') {
                    markerOperations.push(operation.value);
                    return;
                }
                const result = propertyValue(token, updates, operation);
                if (!result.ok) failures.push(result.message);
                else updates[operation.field] = result.value;
            });
            compiled.moves.forEach(move => applyMove(token, updates, move));

            if (failures.length) return { ok: false, changed: false, failures };
            request.order.forEach(raw => {
                const value = String(raw).toLowerCase();
                if (['tofront', 'front'].includes(value)) toFront(token);
                else if (['toback', 'back'].includes(value)) toBack(token);
                changed = true;
            });
            if (Object.prototype.hasOwnProperty.call(updates, 'represents')) {
                ['bar1_link', 'bar2_link', 'bar3_link', 'bar4_link'].forEach(key => {
                    if (!Object.prototype.hasOwnProperty.call(updates, key)) updates[key] = '';
                });
            }
            if (Object.prototype.hasOwnProperty.call(updates, 'controlledby')) {
                const character = getObj('character', updates.represents || token.get('represents'));
                if (character) {
                    character.set('controlledby', updates.controlledby);
                    delete updates.controlledby;
                    changed = true;
                }
            }
            applyLinkedBars(token, updates);

            if (Object.keys(updates).length) {
                token.set(updates);
                changed = true;
            }
            markerOperations.forEach(value => {
                applyMarkerSpec(token, value).forEach(result => {
                    if (!result.ok) failures.push(result.message || result.code || 'Marker operation failed.');
                    if (result.changed) changed = true;
                });
            });
            sendReports(msg, token, previous, compiled.reports);
            if (changed) notifyObservers(token, previous, { command: msg.content, source: MODULE_NAME });
            return { ok: !failures.length, changed, failures };
        }

        function showMarkerHelp(msg) {
            whisper(msg, [
                '<b>TokenAssist Marker Commands</b><br>',
                '<code>!ta-set statusmarkers|red</code> adds a marker.<br>',
                '<code>|-red</code> removes, <code>|!red</code> toggles, and <code>|=dead</code> replaces all markers.<br>',
                'Use <code>red:3</code> for a number, a custom display name, or an exact <code>Name::id</code> tag.<br>',
                `Duplicate-index and conditional-count expressions remain unsupported in TokenAssist ${MODULE_VERSION}.`
            ].join(''));
        }

        function showHelp(msg) {
            const config = getModuleState().config;
            const configButton = GameAssist.createButton(
                `Players --ids: ${config.playersCanUseIds ? 'On' : 'Off'}`,
                `!token-assist --config players-can-ids|${config.playersCanUseIds ? 'off' : 'on'}`
            );
            const markerButton = GameAssist.createButton('Marker Help', '!token-assist --help-statusmarkers');
            whisper(msg, [
                '<div style="border:1px solid #444;background:#fff;padding:8px;border-radius:5px">',
                '<b style="font-size:1.15em">TokenAssist Quick Guide</b><br>',
                'Select one or more tokens, then use a command below. <code>!token-assist</code> is the full name; <code>!ta</code> and <code>!ta-*</code> are the table-friendly shortcuts.<br><br>',
                '<b>Visibility:</b> <code>!ta-on showname</code> / <code>!ta-off showname</code> / <code>!ta-flip showname</code><br>',
                '<b>Values:</b> <code>!ta-set name|Guardian bar1_value|25</code><br>',
                '<b>Relative values:</b> <code>--set bar1_value|-5 left|+70</code>; use <code>=-5</code> to assign a negative value.<br>',
                '<b>Aura:</b> <code>!ta-set aura1_radius|5 aura1_color|336699 aura1_options|circle</code><br>',
                '<b>Move:</b> <code>!ta-move 3g</code> or <code>!ta-move =90|2u</code><br>',
                '<b>Layer/order:</b> <code>--set layer|gmlayer</code> or <code>--order tofront</code><br>',
                '<b>Target:</b> <code>--ids TOKEN_ID</code>, <code>--current-page</code>, <code>--active-pages</code>, <code>--ignore-selected</code><br>',
                '<b>Report:</b> <code>--report gm|"{name}: {bar1_value:before} to {bar1_value}"</code><br><br>',
                '<span style="color:#7a4b00"><b>Older macros:</b> supported <code>!token-mod</code> syntax works temporarily, but update those macros before GameAssist v0.2.0.</span><br><br>',
                `${markerButton} ${configButton} ${GameAssist.createButton('About and Limits', '!token-assist about')}`,
                '</div>'
            ].join(''));
        }

        function showAbout(msg) {
            whisper(msg, [
                '<b>About TokenAssist</b><br>',
                `TokenAssist v${MODULE_VERSION} provides selected-token controls, authorized ID targeting, movement, reports, auras, lighting, and MarkerService-backed status changes.<br><br>`,
                `Token-control design credit: TokenMod ${TOKENMOD_REFERENCE.version} by The Aaron, Arcane Scriptomancer. Source and MIT license details are preserved in ATTRIBUTIONS.md.<br><br>`,
                '<b>Commands:</b> use <code>!token-assist</code>, <code>!ta</code>, or <code>!ta-*</code>. Update older <code>!token-mod</code> macros before GameAssist v0.2.0.<br><br>',
                '<b>Current limits:</b> image-side stack editing, default-token writes, computed or name-resolved attributes, advanced controller-list editing, advanced color arithmetic, dimming night-vision parameters, relative/random multi-sided-token selection, exact TokenMod report-recipient distinctions, duplicate-index markers, conditional marker counts, and TokenMod help-handout rebuilding are not yet supported.'
            ].join(''));
        }

        function handleConfig(msg, entries) {
            if (msg.playerid !== 'API' && !playerIsGM(msg.playerid)) {
                whisper(msg, 'Only the GM can change TokenAssist settings.');
                return;
            }
            const config = getModuleState().config;
            if (!entries.length) {
                showHelp(msg);
                return;
            }
            entries.forEach(entry => {
                const parsed = String(entry).split(/[|#]/);
                const key = String(parsed.shift() || '').toLowerCase();
                const value = parsed.join('|');
                if (key !== 'players-can-ids') {
                    whisper(msg, `TokenAssist has no setting named <code>${_sanitize(key)}</code>.`);
                    return;
                }
                config.playersCanUseIds = value
                    ? truthy(value)
                    : !config.playersCanUseIds;
                GameAssist.recordMetric('config', { mod: MODULE_NAME, note: `playersCanUseIds=${config.playersCanUseIds}` });
            });
            showHelp(msg);
        }

        function standaloneConflict() {
            return getStandaloneScriptEvidence('TokenMod');
        }

        function handleTokenRequest(msg) {
            const request = parseRequest(msg);
            if (request.helpMarkers) return showMarkerHelp(msg);
            if (request.help) return showHelp(msg);
            if (request.configRequested) return handleConfig(msg, request.config);

            let effectivePlayerId = msg.playerid;
            if (request.apiAs) {
                if (msg.playerid === 'API' && getObj('player', request.apiAs)) effectivePlayerId = request.apiAs;
                else if (msg.playerid !== 'API') whisper(msg, '<code>--api-as</code> is available only to commands sent by another Mod script.');
            }

            const compiled = compileRequest(request);
            if (!compiled.ok) {
                whisper(msg, `<b>TokenAssist could not run that command.</b><br>${compiled.errors.map(_sanitize).join('<br>')}`);
                return;
            }
            const targets = resolveTargets(msg, request, effectivePlayerId);
            if (!targets.length) {
                whisper(msg, 'No eligible token was found. Select a token, or use an authorized <code>--ids</code> target.');
                return;
            }

            const failures = [];
            let changed = 0;
            targets.forEach(token => {
                const result = applyToToken(msg, token, compiled, request);
                if (result.changed) changed++;
                if (!result.ok) {
                    const tokenName = token.get('name') || token.id;
                    result.failures.forEach(failure => failures.push(`${tokenName}: ${failure}`));
                }
            });
            GameAssist.recordMetric('token_command', { mod: MODULE_NAME, note: `${changed}/${targets.length} changed` });
            if (failures.length) {
                whisper(msg, `<b>Some token changes need attention.</b><br>${failures.map(_sanitize).join('<br>')}`);
            }
        }

        function handleLegacyCommand(msg) {
            const evidence = standaloneConflict();
            if (evidence.confirmed) {
                const runtime = getModuleState().runtime;
                if (!runtime.commandConflictWarned) {
                    runtime.commandConflictWarned = isoNow();
                    GameAssist.log(
                        MODULE_NAME,
                        `Standalone TokenMod${evidence.version ? ` v${evidence.version}` : ''} is active. TokenAssist did not process !token-mod so the command cannot be applied twice. Remove standalone TokenMod and restart the sandbox to use TokenAssist compatibility commands.`,
                        'WARN'
                    );
                }
                return;
            }
            if (!legacyWarningShown) {
                legacyWarningShown = true;
                whisper(msg, '<b>Legacy command accepted.</b><br><code>!token-mod</code> is deprecated. Replace it with <code>!token-assist</code>, <code>!ta</code>, or a matching <code>!ta-*</code> command before GameAssist v0.2.0.');
            }
            handleTokenRequest(msg);
        }

        function handleBranded(msg) {
            const raw = String(msg.content || '').trim();
            const taFlag = raw.match(/^!ta-([a-z][a-z-]*)\b/i);
            if (taFlag) {
                const direct = String(taFlag[1]).toLowerCase();
                if (['about'].includes(direct)) return showAbout(msg);
                if (['menu'].includes(direct)) return showHelp(msg);
                return handleTokenRequest(msg);
            }

            const body = raw.replace(/^!(?:token-assist|ta)\b/i, '').trim();
            if (body.startsWith('--')) return handleTokenRequest(msg);
            const words = tokenize(body);
            const command = String(words[0] || 'help').toLowerCase();
            if (['help', 'menu'].includes(command)) return showHelp(msg);
            if (command === 'about') return showAbout(msg);
            if (command === 'config') return handleConfig(msg, words.slice(1));
            if (['on', 'off', 'flip', 'set', 'move', 'order', 'report', 'ids', 'api-as', 'current-page', 'active-pages', 'ignore-selected', 'help-statusmarkers'].includes(command)) {
                const commandContent = `!token-assist --${command}${body.slice(words[0].length)}`;
                return handleTokenRequest({ ...msg, content: commandContent });
            }
            whisper(msg, `Unknown TokenAssist command <code>${_sanitize(command)}</code>. Use ${GameAssist.createButton('TokenAssist Help', '!token-assist help')}.`);
        }

        function observeTokenChange(callback, options = {}) {
            if (typeof callback !== 'function') {
                return { ok: false, code: 'INVALID_ARGUMENT', message: 'TokenAssist observer requires a callback.' };
            }
            const owner = String(typeof options === 'string' ? options : (options.owner || 'TokenAssistConsumer'));
            const id = ++observerId;
            observers.set(id, { owner, callback });
            return { ok: true, id, owner, unsubscribe: () => observers.delete(id) };
        }

        function clearObservers(owner) {
            const requested = String(owner || '');
            let removed = 0;
            observers.forEach((subscription, id) => {
                if (requested && subscription.owner !== requested) return;
                observers.delete(id);
                removed++;
            });
            return removed;
        }

        function initialize() {
            const modState = getModuleState();
            const evidence = standaloneConflict();
            modState.runtime.standaloneDetected = evidence.confirmed;
            modState.runtime.standaloneVersion = evidence.version || null;
            if (evidence.confirmed && modState.config.warnOnStandalone) {
                GameAssist.log(
                    MODULE_NAME,
                    `Standalone TokenMod${evidence.version ? ` v${evidence.version}` : ''} is also installed. TokenAssist will leave !token-mod commands to that script; !token-assist and !ta commands remain available.`,
                    'WARN'
                );
            }
            GameAssist.onCommand('!token-assist', handleBranded, MODULE_NAME, {
                match: { caseInsensitive: true, mode: 'token' }
            });
            GameAssist.onCommand('!ta', handleBranded, MODULE_NAME, {
                match: { caseInsensitive: true, mode: 'token' }
            });
            GameAssist.onCommand('!ta-', handleBranded, MODULE_NAME, {
                match: { caseInsensitive: true, mode: 'prefix' }
            });
            GameAssist.onCommand('!token-mod', handleLegacyCommand, MODULE_NAME, {
                match: { caseInsensitive: true, mode: 'token' }
            });
            GameAssist.log(MODULE_NAME, `v${MODULE_VERSION} ready; use !token-assist help or !ta-help`, 'INFO', { startup: true });
        }

        function shutdown() {
            const modState = GameAssist.getState(MODULE_NAME);
            modState.runtime.lastDisabledAt = isoNow();
        }

        return Object.freeze({
            version: MODULE_VERSION,
            configSchemaVersion: CONFIG_SCHEMA_VERSION,
            reference: TOKENMOD_REFERENCE,
            isEnabled,
            initialize,
            shutdown,
            observeTokenChange,
            ObserveTokenChange: observeTokenChange,
            clearObservers
        });
    })();

    GameAssist.TokenAssist = TokenAssist;
    GameAssist.register('TokenAssist', TokenAssist.initialize, {
        enabled: true,
        events: ['chat:message'],
        prefixes: ['!token-assist', '!ta', '!ta-', '!token-mod'],
        teardown: TokenAssist.shutdown,
        dependsOn: ['MarkerService'],
        preserveRuntimeOnDisable: true,
        protectedConfigKeys: ['configSchemaVersion']
    });
    // --- Notes & Comments ---
    // Changed (v0.1.5.0): Advanced unreleased TokenAssist to 1.0.1; added canonical !token-assist, !ta, and !ta-* mutation commands, explicitly deprecated !token-mod for removal no later than v0.2.0, normalized aura option and literal color values, added number-blank aura toggles, and limited lastmove trails to the current command so movement does not reconnect to an old origin.
    // TokenMod provenance:
    //   Original project: TokenMod by The Aaron, Arcane Scriptomancer.
    //   Pinned reference: Roll20/roll20-api-scripts commit 9d634d3149985dcf10333920b3f4c41f215f39fc, TokenMod/0.8.88/TokenMod.js blob fc6c9cb45ec2f2ee254a24f849e089507a0e610a.
    //   License and public notice: MIT; see LICENSE and ATTRIBUTIONS.md. No upstream endorsement is implied.
    // Decision log:
    //   CHOICE: Name the module TokenAssist and tag it TOKENASSIST - ALT: retain TokenMod branding; REJECTED: GameAssist owns this implementation, lifecycle, limits, and support.
    //   CHOICE: Make !token-assist and !ta/!ta-* canonical while retaining a warning-bearing !token-mod migration alias through v0.1.x - ALT: remove the old spelling immediately; REJECTED: test campaigns need a bounded macro migration window.
    //   CHOICE: Implement a bounded, documented command surface - ALT: paste the complete upstream implementation; REJECTED: unverified wholesale integration would duplicate marker authority and import unrelated state/lifecycle assumptions.
    //   CHOICE: Suspend compatibility handling when standalone TokenMod is detected - ALT: let both handlers run; REJECTED: one command could mutate the same token twice.
    //   CHOICE: Copy only practical legacy configuration and preserve state.TokenMod - ALT: rename or delete upstream state; REJECTED: rollback and migration diagnosis require the source state.
    //   CHOICE: Expose GameAssist.TokenAssist.observeTokenChange - ALT: create a global TokenMod compatibility object; REJECTED: the global would blur branding, provenance, and standalone-conflict detection.
    //   CHOICE: Route all status-marker syntax through MarkerService - ALT: write statusmarkers independently; REJECTED: GameAssist must have one marker authority.
    // Prior notes:
    //   Earlier unreleased v0.1.5.0 checkpoints used the name TokenService, exposed !token-service, and treated !token-mod as the primary compatibility command. Saved test state is migrated to TokenAssist.
    // [GAMEASSIST:MODULES:TOKENASSIST] END
    // =============================================================================

    // ————— NPC MANAGER MODULE v1.3.0 —————
    // =============================================================================
    // [GAMEASSIST:MODULES:NPCMANAGER] BEGIN
    // Section Title: NPCManager module
    // -------------------------------------------------------------------------
    // mechsuit_section: { codename: "GAMEASSIST", area: "MODULES:NPCMANAGER", title: "NPCManager",
    //   guarantees: ["Auto toggle resolved configured dead marker based on known HP transitions; maintain hierarchical death-history handouts and curated arc rosters", "Date-based Session rollover and timestamp rendering use the validated GameAssist timezone while stored instants remain absolute", "Audits are read-only; separately confirmed repair commands re-scan current HP and change only the configured death marker", "NPCHPRoller auto-roll initialization is not recorded as death/revival history", "Death-marker reads and writes use CORE:MARKERSERVICE"],
    //   depends_on: ["[GAMEASSIST:POLICY]","[GAMEASSIST:APP:UTILS]","[GAMEASSIST:CORE:MARKERSERVICE]","[GAMEASSIST:CORE:OBJECT]"],
    //   last_updated_version: "v0.1.5.1",
    //   independent_versions: { module_version: "1.3.0" } }
    // -------------------------------------------------------------------------
    // Narrative
    // MODULES:NPCMANAGER monitors token HP changes to set or clear the configured
    // death marker through CORE:MARKERSERVICE. New-token HP initialization
    // is ignored while NPCHPRoller auto-roll-on-add establishes the token's starting HP.
    // It records deaths into active Campaign, Chapter,
    // Section, and Session buckets; writes bucket/audit handouts; rolls date-based
    // sessions forward before new activity; and maintains deduplicated, editable
    // story arc rosters for selected linked PC/NPC tokens or Session imports.
    // -------------------------------------------------------------------------
    GameAssist.register('NPCManager', function() {
        const modState = GameAssist.getState('NPCManager');

        Object.assign(modState.config, {
            enabled: true,
            autoTrackDeath: true,
            deadMarker: 'dead',
            autoHide: false,
            hideLayer: 'gmlayer',
            ...modState.config
        });

        const DEATH_BUCKET_SCOPES = ['campaign', 'chapter', 'section', 'session'];
        const DEATH_BUCKET_TITLES = {
            campaign: 'Campaign',
            chapter: 'Chapter',
            section: 'Section',
            session: 'Session'
        };
        const DEFAULT_BUCKET_NAMES = {
            campaign: 'Campaign',
            chapter: 'Chapter',
            section: 'Section'
        };
        const NESTED_BUCKET_SCOPES = {
            campaign: ['campaign', 'chapter', 'section', 'session'],
            chapter: ['chapter', 'section', 'session'],
            section: ['section', 'session'],
            session: ['session']
        };
        const DEATH_LOG_LIMIT = POLICY.runtime.deathLogLimit;
        const AUDIT_DETAIL_LIMIT = POLICY.runtime.npcAuditDetailLimit;
        const DEATH_REPORT_SUMMARY_LIMIT = POLICY.runtime.deathReportSummaryLimit;
        const DEATH_REPORT_DETAIL_LIMIT = POLICY.runtime.deathReportDetailLimit;
        const AUDIT_HANDOUT_NAME = 'GameAssist NPC Death Audit';
        const NPCMANAGER_MODULE_VERSION = '1.3.0';
        const initializingNpcHp = new Set();

        function currentSessionDateKey(raw = now()) {
            return localDateKey(raw);
        }

        function defaultBucketName(scope) {
            return scope === 'session' ? currentSessionDateKey() : DEFAULT_BUCKET_NAMES[scope];
        }

        function ensureDeathBucketConfig() {
            const existing = modState.config.deathBuckets;
            const current = existing && typeof existing === 'object' && !Array.isArray(existing)
                ? existing
                : {};

            modState.config.deathBuckets = DEATH_BUCKET_SCOPES.reduce((next, scope) => {
                const raw = current[scope];
                const fallback = defaultBucketName(scope);
                next[scope] = String(raw || fallback).trim() || fallback;
                return next;
            }, {});

            return modState.config.deathBuckets;
        }

        ensureDeathBucketConfig();

        function ensureNPCManagerRuntime() {
            const state = ensureRuntimeObject(modState);
            const deathLog = ensureModRuntimeKey(modState, 'deathLog', 'array');
            const buckets = ensureModRuntimeKey(modState, 'deathBuckets', 'object');
            const arcs = ensureModRuntimeKey(modState, 'deathArcs', 'array');

            DEATH_BUCKET_SCOPES.forEach(scope => {
                if (!Array.isArray(buckets[scope])) buckets[scope] = [];
            });

            return { state, deathLog, buckets, arcs };
        }

        function getDeathMarkerResolution() {
            return GameAssist.MarkerService.resolve(modState.config.deadMarker || 'dead');
        }

        function deathMarkerWarning(resolution) {
            const marker = _sanitize(resolution.requested || modState.config.deadMarker || 'dead');
            const detail = resolution.registryError
                ? ` Roll20 marker registry problem: ${_sanitize(resolution.registryError)}.`
                : '';
            return `Configured NPC death marker "${marker}" could not be recognized.${detail}` +
                ' Use a built-in marker id such as dead or configure the exact custom marker tag.';
        }

        function panelText(value) {
            return _sanitize(value ?? '')
                .replace(/\{/g, '&#123;')
                .replace(/\}/g, '&#125;');
        }

        function panelValue(value) {
            if (Array.isArray(value)) {
                return value.map(panelText).join('<br>');
            }
            return panelText(value);
        }

        function sendNPCPanel(title, fields) {
            const content = fields
                .map(({ label, value }) => `{{${panelValue(label)}=${panelValue(value)}}}`)
                .join(' ');
            sendChat('GameAssist', `/w gm &{template:default} {{name=${panelValue(title)}}} ${content}`);
        }

        function sendAuditReport(fields) {
            sendNPCPanel('NPC Death Audit', fields);
        }

        function sendDeathReport(fields) {
            sendNPCPanel('NPC Death Report', fields);
        }

        function summarizeAuditNames(names, limit = 5) {
            const listed = names.slice(0, limit).join(', ');
            return names.length > limit ? `${listed}, +${names.length - limit} more` : listed;
        }

        function formatAuditEntries(entries, limit = AUDIT_DETAIL_LIMIT) {
            const lines = [];
            entries.slice(0, limit).forEach((entry, index) => {
                if (index > 0) lines.push('');
                lines.push(
                    entry.name,
                    `HP: ${entry.hp}`,
                    `Markers: ${entry.markers}`,
                    `Token ID: ${entry.id}`
                );
            });
            if (entries.length > limit) {
                lines.push('', `Showing ${limit} of ${entries.length}. Run again after fixing these to see the next set.`);
            }
            return lines;
        }

        /**
         * collectDeathAudit - Build the shared read-only view used by audit and repair.
         * Blank or invalid HP is reported but never treated as zero for automatic repair.
         */
        function collectDeathAudit() {
            const pageId = Campaign().get('playerpageid');
            const tokens = findObjs({
                _pageid: pageId,
                _type: 'graphic',
                layer: 'objects'
            });
            const resolution = getDeathMarkerResolution();
            const needsMarker = [];
            const needsClear = [];
            const unlinked = [];
            const invalidHp = [];

            for (const token of tokens) {
                const link = GameAssist.getLinkedCharacter(token);
                if (!link) {
                    unlinked.push(token.get('name') || '(Unnamed)');
                    continue;
                }
                if (!getNPCContext(token, link)) continue;

                const hp = parseTrackedHP(token.get('bar1_value'));
                if (hp === null) {
                    invalidHp.push(token.get('name') || '(Unnamed NPC)');
                    continue;
                }

                const isDead = resolution.ok && GameAssist.MarkerService.has(token, resolution.id);
                const entry = {
                    token,
                    name: token.get('name') || '(Unnamed)',
                    id: token.id,
                    hp,
                    markers: token.get('statusmarkers') || '(none)'
                };
                if (hp < 1 && !isDead) needsMarker.push(entry);
                else if (hp >= 1 && isDead) needsClear.push(entry);
            }

            return {
                pageId,
                resolution,
                needsMarker,
                needsClear,
                unlinked,
                invalidHp,
                mismatchCount: needsMarker.length + needsClear.length
            };
        }

        function normalizeScope(scope, fallback = 'session') {
            const value = String(scope || fallback).toLowerCase();
            return DEATH_BUCKET_SCOPES.includes(value) ? value : fallback;
        }

        function htmlText(value) {
            return _sanitize(value ?? '');
        }

        function handoutSafeName(value, fallback = 'Unnamed') {
            return String(value || fallback)
                .replace(/[<>]/g, '')
                .replace(/\s+/g, ' ')
                .trim()
                .slice(0, 80) || fallback;
        }

        function queryDefault(value, fallback = 'Bucket') {
            return String(value || fallback)
                .replace(/[|"{}]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim() || fallback;
        }

        function bucketHandoutName(scope, name) {
            return `GameAssist Deaths - ${DEATH_BUCKET_TITLES[scope]} - ${handoutSafeName(name)}`;
        }

        function arcHandoutName(name) {
            return `GameAssist Arc - ${handoutSafeName(name)}`;
        }

        function getOrCreateHandout(name) {
            let handout = findObjs({ type: 'handout', name })[0];
            if (!handout) handout = createObj('handout', { name, archived: false });
            return handout;
        }

        function setHandoutNotes(name, notes) {
            const handout = getOrCreateHandout(name);
            handout.set('notes', notes);
            return handout;
        }

        function findNamedCollectionItem(list, name) {
            const target = String(name || '').trim();
            return (Array.isArray(list) ? list : []).find(item => item && item.name === target) || null;
        }

        function getActiveBucket(scope) {
            const safeScope = normalizeScope(scope);
            const runtime = ensureNPCManagerRuntime();
            const names = ensureDeathBucketConfig();
            const bucketName = names[safeScope] || defaultBucketName(safeScope);
            let bucket = findNamedCollectionItem(runtime.buckets[safeScope], bucketName);

            if (!bucket) {
                bucket = {
                    scope: safeScope,
                    name: bucketName,
                    createdAt: isoNow(),
                    entries: []
                };
                runtime.buckets[safeScope].push(bucket);
            }

            if (!Array.isArray(bucket.entries)) bucket.entries = [];
            return bucket;
        }

        function getActiveBuckets() {
            return DEATH_BUCKET_SCOPES.reduce((memo, scope) => {
                memo[scope] = getActiveBucket(scope);
                return memo;
            }, {});
        }

        function nextArcEntryId() {
            const runtime = ensureNPCManagerRuntime();
            const current = Number(runtime.state.arcEntryCounter);
            runtime.state.arcEntryCounter = Number.isFinite(current) && current >= 0 ? current + 1 : 1;
            return `arc-${now()}-${runtime.state.arcEntryCounter}`;
        }

        function ensureArcEntryShape(entry) {
            if (!entry || typeof entry !== 'object') return null;
            if (!entry.arcEntryId) entry.arcEntryId = nextArcEntryId();
            return entry;
        }

        function arcEntityKey(entry) {
            if (entry?.tokenId) return `token:${entry.tokenId}`;
            if (entry?.characterId) return `character:${entry.characterId}`;
            const name = String(entry?.name || '').trim().toLowerCase();
            return name ? `name:${name}` : null;
        }

        function findArcEntityEntry(arc, candidate) {
            const key = arcEntityKey(candidate);
            if (!key) return null;
            return arc.entries.find(entry => arcEntityKey(entry) === key) || null;
        }

        function beginArcBatch(arc, label) {
            return {
                id: `batch-${now()}-${arc.entries.length}`,
                label,
                createdAt: isoNow(),
                addedArcEntryIds: [],
                updatedEntries: []
            };
        }

        function rememberArcEntryBeforeUpdate(batch, entry) {
            if (!batch || batch.addedArcEntryIds.includes(entry.arcEntryId)) return;
            if (batch.updatedEntries.some(item => item.arcEntryId === entry.arcEntryId)) return;
            batch.updatedEntries.push({
                arcEntryId: entry.arcEntryId,
                before: { ...entry }
            });
        }

        function mergeArcEntry(existing, incoming, batch) {
            let changed = false;
            const incomingNote = String(incoming.note || '').trim();

            if (incomingNote && !String(existing.note || '').split(' | ').includes(incomingNote)) {
                rememberArcEntryBeforeUpdate(batch, existing);
                existing.note = existing.note ? `${existing.note} | ${incomingNote}` : incomingNote;
                changed = true;
            }

            if (incoming.sourceEventId && !existing.sourceEventId) {
                rememberArcEntryBeforeUpdate(batch, existing);
                [
                    'sourceEventId', 'source', 'hp', 'marker', 'time', 'timestamp',
                    'revivedAt', 'revivedTime', 'revivedHp'
                ].forEach(key => {
                    if (incoming[key] !== undefined) existing[key] = incoming[key];
                });
                changed = true;
            }

            return changed;
        }

        function appendArcCandidate(arc, candidate, options = {}) {
            const allowDuplicates = Boolean(options.allowDuplicates);
            const batch = options.batch || null;
            const existing = allowDuplicates ? null : findArcEntityEntry(arc, candidate);

            if (existing) {
                return mergeArcEntry(existing, candidate, batch)
                    ? { added: 0, updated: 1, duplicate: 0 }
                    : { added: 0, updated: 0, duplicate: 1 };
            }

            const entry = ensureArcEntryShape({ ...candidate });
            arc.entries.push(entry);
            pruneEntries(arc.entries);
            if (batch) batch.addedArcEntryIds.push(entry.arcEntryId);
            return { added: 1, updated: 0, duplicate: 0 };
        }

        function finalizeArcBatch(arc, batch) {
            const changed = batch.addedArcEntryIds.length > 0 || batch.updatedEntries.length > 0;
            if (changed) arc.lastBatch = batch;
            return changed;
        }

        function undoLastArcBatch(arc) {
            const batch = arc.lastBatch;
            if (!batch) return { addedRemoved: 0, updatesRestored: 0, label: null };

            const addedIds = new Set(batch.addedArcEntryIds || []);
            const beforeCount = arc.entries.length;
            arc.entries = arc.entries.filter(entry => !addedIds.has(entry.arcEntryId));

            let updatesRestored = 0;
            (batch.updatedEntries || []).forEach(snapshot => {
                const index = arc.entries.findIndex(entry => entry.arcEntryId === snapshot.arcEntryId);
                if (index < 0) return;
                arc.entries[index] = { ...snapshot.before };
                updatesRestored++;
            });

            arc.lastBatch = null;
            return {
                addedRemoved: beforeCount - arc.entries.length,
                updatesRestored,
                label: batch.label || 'last arc update'
            };
        }

        function removeArcEntryById(arc, arcEntryId) {
            const before = arc.entries.length;
            arc.entries = arc.entries.filter(entry => entry.arcEntryId !== arcEntryId);
            arc.lastBatch = null;
            return before - arc.entries.length;
        }

        function removeSelectedArcEntries(arc, msg) {
            const selected = Array.isArray(msg.selected) ? msg.selected : [];
            const selectedKeys = new Set();

            selected.forEach(sel => {
                const token = getObj('graphic', sel._id);
                if (!token) return;
                const link = GameAssist.getLinkedCharacter(token);
                selectedKeys.add(`token:${token.id}`);
                if (link?.character?.id) selectedKeys.add(`character:${link.character.id}`);
            });

            const before = arc.entries.length;
            arc.entries = arc.entries.filter(entry => !selectedKeys.has(arcEntityKey(entry)));
            arc.lastBatch = null;
            return before - arc.entries.length;
        }

        function getOrCreateArc(name) {
            const runtime = ensureNPCManagerRuntime();
            const arcName = handoutSafeName(name, 'Unnamed Arc');
            let arc = findNamedCollectionItem(runtime.arcs, arcName);

            if (!arc) {
                arc = {
                    name: arcName,
                    createdAt: isoNow(),
                    entries: []
                };
                runtime.arcs.push(arc);
            }

            if (!Array.isArray(arc.entries)) arc.entries = [];
            arc.entries = arc.entries.filter(Boolean).map(ensureArcEntryShape);
            return arc;
        }

        function entryStatus(entry) {
            return entry.revivedAt
                ? `Revived ${displayStoredTime(entry.revivedAt, entry.revivedTime || entry.revivedAt)}`
                : 'Dead';
        }

        function deathEntryKey(entry) {
            return entry?.sourceEventId || entry?.id || `${entry?.name || ''}|${entry?.timestamp || ''}|${entry?.hp ?? ''}`;
        }

        function renderDeathEntries(entries) {
            if (!entries.length) return '<p>No recorded NPC deaths in this bucket yet.</p>';

            const rows = entries.slice().reverse().map(entry => [
                '<tr>',
                `<td>${htmlText(entry.name)}</td>`,
                `<td>${htmlText(entry.hp ?? 'unknown')}</td>`,
                `<td>${htmlText(displayStoredTime(entry.timestamp, entry.time || entry.timestamp || 'time unknown'))}</td>`,
                `<td>${htmlText(entryStatus(entry))}</td>`,
                '</tr>'
            ].join(''));

            return [
                '<table>',
                '<thead><tr><th>NPC</th><th>HP</th><th>Recorded</th><th>Status</th></tr></thead>',
                `<tbody>${rows.join('')}</tbody>`,
                '</table>'
            ].join('\n');
        }

        function renderDeathBucketHandout(bucket) {
            const title = `${DEATH_BUCKET_TITLES[bucket.scope]}: ${bucket.name}`;
            return [
                `<h2>${htmlText(title)}</h2>`,
                `<p><strong>Updated:</strong> ${htmlText(localNow())}</p>`,
                `<p><strong>Total entries:</strong> ${bucket.entries.length}</p>`,
                renderDeathEntries(bucket.entries),
                '<p><em>Deaths are recorded into Campaign, Chapter, Section, and Session buckets. Revivals are annotated on the matching entry instead of silently deleting history.</em></p>'
            ].join('\n');
        }

        function writeBucketHandout(bucket) {
            setHandoutNotes(bucketHandoutName(bucket.scope, bucket.name), renderDeathBucketHandout(bucket));
        }

        function writeActiveBucketHandouts() {
            const buckets = getActiveBuckets();
            DEATH_BUCKET_SCOPES.forEach(scope => writeBucketHandout(buckets[scope]));
            return buckets;
        }

        function renderArcHandout(arc) {
            const rows = arc.entries.length
                ? '<ol>' + arc.entries.slice().reverse().map(entry => {
                    const source = entry.source ? ` | ${htmlText(entry.source)}` : '';
                    const note = entry.note ? ` | ${htmlText(entry.note)}` : '';
                    const status = entry.revivedAt ? ` | ${htmlText(entryStatus(entry))}` : '';
                    return `<li><strong>${htmlText(entry.name)}</strong> | ${htmlText(displayStoredTime(entry.timestamp, entry.time || entry.timestamp || 'time unknown'))}${source}${status}${note}</li>`;
                }).join('') + '</ol>'
                : '<p>No entries recorded in this arc yet.</p>';

            return [
                `<h2>Arc: ${htmlText(arc.name)}</h2>`,
                `<p><strong>Updated:</strong> ${htmlText(localNow())}</p>`,
                `<p><strong>Total entries:</strong> ${arc.entries.length}</p>`,
                rows,
                '<p><em>Arc buckets keep one entry per linked creature by default. Use the Arc management menu to remove entries, undo the last addition, or deliberately allow duplicates.</em></p>'
            ].join('\n');
        }

        function writeArcHandout(arc) {
            setHandoutNotes(arcHandoutName(arc.name), renderArcHandout(arc));
        }

        function deathEventIdentity(token, hp) {
            const linked = GameAssist.getLinkedCharacter(token);
            const character = linked?.character || null;
            const name = token.get('name') || character?.get('name') || '(Unnamed NPC)';
            return {
                id: `${now()}-${token.id}`,
                tokenId: token.id,
                characterId: character?.id || null,
                name,
                hp,
                marker: modState.config.deadMarker || 'dead',
                time: localNow(),
                timestamp: isoNow()
            };
        }

        function cloneDeathEntry(entry) {
            return {
                id: entry.id,
                sourceEventId: entry.sourceEventId || entry.id || null,
                tokenId: entry.tokenId || null,
                characterId: entry.characterId || null,
                name: entry.name || '(Unnamed NPC)',
                hp: entry.hp ?? null,
                marker: entry.marker || modState.config.deadMarker || 'dead',
                time: entry.time || entry.timestamp || 'time unknown',
                timestamp: entry.timestamp || null,
                source: entry.source || null,
                note: entry.note || null,
                revivedAt: entry.revivedAt || null,
                revivedTime: entry.revivedTime || null,
                revivedHp: entry.revivedHp ?? null
            };
        }

        function pruneEntries(entries, limit = DEATH_LOG_LIMIT) {
            if (entries.length > limit) entries.splice(0, entries.length - limit);
        }

        function backfillBucketsFromLegacyLog() {
            const runtime = ensureNPCManagerRuntime();
            if (runtime.state.deathBucketsBackfilled) return;
            if (!runtime.deathLog.length) {
                runtime.state.deathBucketsBackfilled = true;
                return;
            }

            const anyBucketHasEntries = DEATH_BUCKET_SCOPES.some(scope =>
                runtime.buckets[scope].some(bucket => Array.isArray(bucket.entries) && bucket.entries.length)
            );
            if (anyBucketHasEntries) {
                runtime.state.deathBucketsBackfilled = true;
                return;
            }

            const activeBuckets = getActiveBuckets();
            DEATH_BUCKET_SCOPES.forEach(scope => {
                const bucket = activeBuckets[scope];
                runtime.deathLog.forEach(entry => {
                    bucket.entries.push(cloneDeathEntry(entry));
                });
                pruneEntries(bucket.entries);
                writeBucketHandout(bucket);
            });
            runtime.state.deathBucketsBackfilled = true;
        }

        function recordDeathInBuckets(entry) {
            const runtime = ensureNPCManagerRuntime();
            runtime.deathLog.push(cloneDeathEntry(entry));
            pruneEntries(runtime.deathLog);

            DEATH_BUCKET_SCOPES.forEach(scope => {
                const bucket = getActiveBucket(scope);
                bucket.entries.push(cloneDeathEntry(entry));
                pruneEntries(bucket.entries);
                writeBucketHandout(bucket);
            });
        }

        function entryMatchesToken(entry, token, fallbackName) {
            if (entry?.tokenId) return entry.tokenId === token.id;
            return Boolean(entry?.name && fallbackName && entry.name === fallbackName);
        }

        function hasOpenDeathEntry(token) {
            const runtime = ensureNPCManagerRuntime();
            const collections = [runtime.deathLog];
            DEATH_BUCKET_SCOPES.forEach(scope => {
                runtime.buckets[scope].forEach(bucket => {
                    if (Array.isArray(bucket.entries)) collections.push(bucket.entries);
                });
            });
            return collections.some(entries => entries.some(entry =>
                entry?.tokenId === token.id && !entry.revivedAt
            ));
        }

        function annotateRevivalInEntries(entries, token, fallbackName, hp, isEligible = null) {
            for (let i = entries.length - 1; i >= 0; i--) {
                const entry = entries[i];
                if (entry?.revivedAt) continue;
                if (isEligible && !isEligible(entry)) continue;
                if (!entryMatchesToken(entry, token, fallbackName)) continue;

                entry.revivedAt = isoNow();
                entry.revivedTime = localNow();
                entry.revivedHp = hp;
                return true;
            }
            return false;
        }

        function annotateRevivalInBuckets(token, hp) {
            const runtime = ensureNPCManagerRuntime();
            const fallbackName = token.get('name') || '(Unnamed NPC)';
            let changed = false;

            if (annotateRevivalInEntries(runtime.deathLog, token, fallbackName, hp)) changed = true;
            DEATH_BUCKET_SCOPES.forEach(scope => {
                runtime.buckets[scope].forEach(bucket => {
                    if (annotateRevivalInEntries(bucket.entries, token, fallbackName, hp)) {
                        changed = true;
                        writeBucketHandout(bucket);
                    }
                });
            });
            runtime.arcs.forEach(arc => {
                if (annotateRevivalInEntries(
                    arc.entries,
                    token,
                    fallbackName,
                    hp,
                    entry => Boolean(entry?.sourceEventId)
                )) {
                    changed = true;
                    writeArcHandout(arc);
                }
            });
            return changed;
        }

        function normalizeDeathEvent(entry) {
            const item = entry && typeof entry === 'object' ? entry : {};
            return {
                name: item.name || '(Unnamed NPC)',
                hp: item.hp ?? 'unknown',
                time: displayStoredTime(item.timestamp, item.time || item.timestamp || 'time unknown'),
                timestamp: item.timestamp || null,
                revivedAt: item.revivedAt || null,
                revivedTime: item.revivedTime || null
            };
        }

        function formatDeathEvent(entry, index) {
            const item = normalizeDeathEvent(entry);
            const status = item.revivedAt ? ` (${entryStatus(item)})` : '';
            return `${index}. ${item.name} - HP ${item.hp} - ${item.time}${status}`;
        }

        function summarizeDeathCounts(log, limit = DEATH_REPORT_SUMMARY_LIMIT) {
            const counts = {};
            log.forEach(entry => {
                const item = normalizeDeathEvent(entry);
                counts[item.name] = (counts[item.name] || 0) + 1;
            });

            const rows = Object.entries(counts)
                .sort(([nameA, countA], [nameB, countB]) => {
                    if (countB !== countA) return countB - countA;
                    return nameA.localeCompare(nameB);
                });

            if (!rows.length) return 'No recorded NPC deaths yet.';

            const lines = rows.slice(0, limit)
                .map(([name, count]) => `${name}: ${count}`);

            if (rows.length > limit) {
                lines.push(`+${rows.length - limit} more NPC name${rows.length - limit === 1 ? '' : 's'}`);
            }

            return lines;
        }

        function getDeathReportPage(log, page = 1, limit = DEATH_REPORT_DETAIL_LIMIT) {
            const newestFirst = log.slice().reverse();
            const pageCount = Math.max(1, Math.ceil(newestFirst.length / limit));
            const currentPage = Math.min(Math.max(parseInt(page, 10) || 1, 1), pageCount);
            const start = (currentPage - 1) * limit;
            const entries = newestFirst.slice(start, start + limit);
            const lines = entries.map((entry, index) => formatDeathEvent(entry, start + index + 1));

            return { currentPage, pageCount, lines };
        }

        function deathReportActions(scope = 'session', currentPage = 1, pageCount = 1) {
            const safeScope = normalizeScope(scope);
            const scoped = `--scope ${safeScope}`;
            const buttons = [
                GameAssist.createButton('Summary', `!npc-death-report ${scoped}`),
                GameAssist.createButton('Recent', `!npc-death-report ${scoped} --recent`)
            ];

            if (currentPage > 1) {
                buttons.push(GameAssist.createButton('Newer', `!npc-death-report ${scoped} --page ${currentPage - 1}`));
            }
            if (currentPage < pageCount) {
                buttons.push(GameAssist.createButton('Older', `!npc-death-report ${scoped} --page ${currentPage + 1}`));
            }

            buttons.push(
                GameAssist.createButton('Buckets', '!npc-death-buckets'),
                GameAssist.createButton('Write Reports', '!npc-wr'),
                GameAssist.createButton('Run Audit', '!npc-death-audit'),
                GameAssist.createButton('Clear This Bucket', `!npc-death-clear ${scoped}`)
            );

            return buttons.join(' ');
        }

        function showDeathReportHelp() {
            const names = ensureDeathBucketConfig();
            const buckets = getActiveBuckets();
            const activeLines = DEATH_BUCKET_SCOPES.map(scope =>
                `${DEATH_BUCKET_TITLES[scope]}: ${names[scope]} (${buckets[scope].entries.length} deaths)`
            );

            sendNPCPanel('NPCManager Guide: Death Reports', [
                {
                    label: 'Start Here',
                    value: [
                        '1. Name the Campaign, Chapter, Section, and Session you are currently playing.',
                        '2. Let linked NPC HP changes record deaths automatically.',
                        '3. Read reports in chat or write the full histories to handouts.',
                        '4. Use Arc buckets for a separate character or story tally.'
                    ]
                },
                {
                    label: 'How The Four Levels Work',
                    value: [
                        'Every new NPC death is recorded in all four active levels.',
                        'Session is the smallest unit. Section contains its sessions; Chapter contains its sections; Campaign contains everything.',
                        'When Session Date mode is active, the next NPCManager command or tracked HP change after a sandbox/UTC date change starts a new date-named Session.',
                        'A custom Session name remains active across date changes until Reset Session Date is used.',
                        'Changing a bucket name starts or resumes that named history; it does not erase the old one.'
                    ]
                },
                { label: 'Active Now', value: activeLines },
                {
                    label: 'Read Reports',
                    value: DEATH_BUCKET_SCOPES.map(scope =>
                        GameAssist.createButton(DEATH_BUCKET_TITLES[scope], `!npc-death-report --scope ${scope}`)
                    )
                },
                {
                    label: 'Write Or Adjust Reports',
                    value: [
                        GameAssist.createButton('Open Report Writer', '!npc-wr'),
                        GameAssist.createButton('Change Active Names', '!npc-death-buckets'),
                        'The writer can update one report, all four reports, or start a new Section using only the current Session.'
                    ]
                },
                {
                    label: 'Clear History',
                    value: [
                        'A clear menu always offers the safest choice: clear only the selected bucket.',
                        'Campaign, Chapter, and Section also offer a second choice that clears that level and every nested level beneath it.',
                        ...DEATH_BUCKET_SCOPES.map(scope =>
                            GameAssist.createButton(`Clear ${DEATH_BUCKET_TITLES[scope]}`, `!npc-death-clear --scope ${scope}`)
                        )
                    ]
                },
                {
                    label: 'Arc Buckets',
                    value: [
                        'Arc buckets are separate story rosters. A creature appears once by default, even when selected manually and later imported with the whole Session.',
                        'Manage an Arc to remove one entry, remove selected tokens, or undo the last addition. Use --allowDuplicates only when repetition is intentional.',
                        GameAssist.createButton('Open Arc Menu', '!npc-death-arc')
                    ]
                },
                {
                    label: 'Current Page Audit',
                    value: [
                        'Audit compares linked NPC HP with the configured death marker. Player characters are excluded, and opening the audit never changes a token.',
                        GameAssist.createButton('Run Audit', '!npc-death-audit'),
                        GameAssist.createButton('Review Marker Repairs', '!npc-death-repair')
                    ]
                },
                {
                    label: 'Expert Shortcuts',
                    value: [
                        '!npc-death-report --scope campaign|chapter|section|session',
                        '!npc-wr = report writer',
                        '!npc-death-repair = preview marker corrections from current HP',
                        '!npc-death-clear --scope chapter --nested --confirm',
                        '!npc-death-arc --name "Arc Name" --manage'
                    ]
                }
            ]);
        }

        function showNPCManagerHelp() {
            showDeathReportHelp();
        }

        function showDeathReportSummary(bucket) {
            const log = bucket.entries;
            const scopeTitle = DEATH_BUCKET_TITLES[bucket.scope];
            const handoutName = bucketHandoutName(bucket.scope, bucket.name);

            if (!log.length) {
                sendDeathReport([
                    { label: 'Viewing', value: `${scopeTitle}: ${bucket.name}` },
                    { label: 'Result', value: 'No NPC deaths recorded in this bucket yet.' },
                    { label: 'Handout', value: handoutName },
                    {
                        label: 'What To Use Next',
                        value: [
                            GameAssist.createButton('Run Audit', '!npc-death-audit'),
                            GameAssist.createButton('Manage Buckets', '!npc-death-buckets')
                        ]
                    }
                ]);
                return;
            }

            const latest = normalizeDeathEvent(log[log.length - 1]);
            const recent = getDeathReportPage(log, 1, DEATH_REPORT_SUMMARY_LIMIT);
            sendDeathReport([
                {
                    label: 'Viewing',
                    value: `${scopeTitle}: ${bucket.name}`
                },
                {
                    label: 'Handout',
                    value: handoutName
                },
                {
                    label: 'Total Recorded',
                    value: `${log.length} NPC death event${log.length === 1 ? '' : 's'}`
                },
                {
                    label: 'Latest',
                    value: `${latest.name} - ${latest.time}`
                },
                {
                    label: 'Most Frequent',
                    value: summarizeDeathCounts(log)
                },
                {
                    label: 'Recent',
                    value: recent.lines
                },
                {
                    label: 'Actions',
                    value: deathReportActions(bucket.scope)
                }
            ]);
        }

        function showDeathReportPage(bucket, page = 1, label = 'Entries') {
            const log = bucket.entries;
            if (!log.length) {
                showDeathReportSummary(bucket);
                return;
            }

            const reportPage = getDeathReportPage(log, page);
            sendDeathReport([
                {
                    label,
                    value: `${DEATH_BUCKET_TITLES[bucket.scope]}: ${bucket.name}. Showing page ${reportPage.currentPage} of ${reportPage.pageCount}. Newest entries appear first.`
                },
                {
                    label: 'Recorded Deaths',
                    value: reportPage.lines
                },
                {
                    label: 'Actions',
                    value: deathReportActions(bucket.scope, reportPage.currentPage, reportPage.pageCount)
                }
            ]);
        }

        function updateDeathBucketNames(args) {
            const names = ensureDeathBucketConfig();
            const runtime = ensureNPCManagerRuntime();
            let changed = false;

            DEATH_BUCKET_SCOPES.forEach(scope => {
                if (args[scope] === undefined) return;
                if (args[scope] === true) return;
                const next = handoutSafeName(args[scope], defaultBucketName(scope));
                if (names[scope] !== next) {
                    names[scope] = next;
                    changed = true;
                }
                if (scope === 'session') {
                    runtime.state.activeSessionDateKey = currentSessionDateKey();
                    runtime.state.sessionDateManaged = false;
                }
            });

            if (args.resetSession) {
                const next = currentSessionDateKey();
                if (names.session !== next) {
                    names.session = next;
                    changed = true;
                }
                runtime.state.activeSessionDateKey = next;
                runtime.state.sessionDateManaged = true;
            }

            if (changed) writeActiveBucketHandouts();
            return changed;
        }

        function ensureSessionDateRollover(announce = true) {
            const runtime = ensureNPCManagerRuntime();
            const names = ensureDeathBucketConfig();
            const currentDate = currentSessionDateKey();
            const previousDate = runtime.state.activeSessionDateKey;
            const sessionLooksDateNamed = /^\d{4}-\d{2}-\d{2}$/.test(names.session);
            if (runtime.state.sessionDateManaged === undefined) {
                runtime.state.sessionDateManaged = sessionLooksDateNamed;
            }
            const sessionDateManaged = Boolean(runtime.state.sessionDateManaged);

            if (!previousDate) {
                runtime.state.activeSessionDateKey = currentDate;
                if (!sessionDateManaged || names.session === currentDate) return false;
            } else if (previousDate === currentDate) {
                return false;
            }

            runtime.state.activeSessionDateKey = currentDate;
            if (!sessionDateManaged) return false;

            const previousName = names.session;
            names.session = currentDate;
            const bucket = getActiveBucket('session');
            writeBucketHandout(bucket);

            if (announce) {
                GameAssist.log(
                    'NPCManager',
                    `Date changed from ${previousDate || previousName} to ${currentDate}; active Session is now ${currentDate}.`,
                    'INFO'
                );
            }
            return true;
        }

        function prepareNPCManagerActivity() {
            backfillBucketsFromLegacyLog();
            return ensureSessionDateRollover();
        }

        GameAssist.NPCManager = Object.freeze({
            version: '1.3.0',
            refreshSessionDate(options = {}) {
                return ensureSessionDateRollover(options.announce !== false);
            }
        });

        function showDeathBucketsPanel(message = null) {
            const names = ensureDeathBucketConfig();
            const buckets = getActiveBuckets();
            const lines = DEATH_BUCKET_SCOPES.map(scope =>
                `${DEATH_BUCKET_TITLES[scope]}: ${names[scope]} (${buckets[scope].entries.length} deaths)`
            );

            sendNPCPanel('NPC Death Buckets', [
                {
                    label: 'Active Buckets',
                    value: lines
                },
                {
                    label: 'Change Names',
                    value: [
                        GameAssist.createButton('Set Campaign', `!npc-death-buckets --campaign "?{Campaign bucket name|${queryDefault(names.campaign)}}"`),
                        GameAssist.createButton('Set Chapter', `!npc-death-buckets --chapter "?{Chapter bucket name|${queryDefault(names.chapter)}}"`),
                        GameAssist.createButton('Set Section', `!npc-death-buckets --section "?{Section bucket name|${queryDefault(names.section)}}"`),
                        GameAssist.createButton('Set Session', `!npc-death-buckets --session "?{Session bucket name|${queryDefault(names.session)}}"`),
                        GameAssist.createButton('Reset Session Date', '!npc-death-buckets --resetSession')
                    ]
                },
                {
                    label: 'Reports',
                    value: DEATH_BUCKET_SCOPES.map(scope =>
                        GameAssist.createButton(DEATH_BUCKET_TITLES[scope], `!npc-death-report --scope ${scope}`)
                    )
                },
                {
                    label: 'Write Reports',
                    value: GameAssist.createButton('Open Report Writer', '!npc-wr')
                },
                {
                    label: 'Tip',
                    value: message || 'Changing a bucket name starts or resumes that named bucket. Existing bucket handouts are retained.'
                }
            ]);
        }

        function appendUniqueDeathEntries(targetBucket, sourceEntries) {
            const existing = new Set(targetBucket.entries.map(deathEntryKey));
            let added = 0;

            sourceEntries.forEach(entry => {
                const key = deathEntryKey(entry);
                if (existing.has(key)) return;
                targetBucket.entries.push(cloneDeathEntry(entry));
                existing.add(key);
                added++;
            });

            pruneEntries(targetBucket.entries);
            return added;
        }

        function startSectionFromCurrentSession(sectionName) {
            const names = ensureDeathBucketConfig();
            names.section = handoutSafeName(sectionName, defaultBucketName('section'));
            const section = getActiveBucket('section');
            const session = getActiveBucket('session');
            const added = appendUniqueDeathEntries(section, session.entries);
            writeBucketHandout(section);
            writeBucketHandout(session);
            return { section, session, added };
        }

        function showReportWriterPanel(message = null) {
            const names = ensureDeathBucketConfig();
            const buckets = getActiveBuckets();
            const activeLines = DEATH_BUCKET_SCOPES.map(scope =>
                `${DEATH_BUCKET_TITLES[scope]}: ${names[scope]} (${buckets[scope].entries.length} deaths)`
            );

            sendNPCPanel('NPC Report Writer', [
                {
                    label: 'Before You Write',
                    value: 'Review the active names and counts below. Writing updates handouts from saved GameAssist history; it does not create another death entry.'
                },
                { label: 'Active Reports', value: activeLines },
                {
                    label: 'Write Now',
                    value: [
                        GameAssist.createButton('Write All Four', '!npc-death-write --all'),
                        ...DEATH_BUCKET_SCOPES.map(scope =>
                            GameAssist.createButton(`Write ${DEATH_BUCKET_TITLES[scope]}`, `!npc-death-write --scope ${scope}`)
                        )
                    ]
                },
                {
                    label: 'Adjust First',
                    value: [
                        GameAssist.createButton('Change Active Names', '!npc-death-buckets'),
                        GameAssist.createButton('New Section From Current Session', `!npc-death-write --newSection "?{New section name|${queryDefault(names.section)}}"`)
                    ]
                },
                {
                    label: 'New Section From Session',
                    value: 'Changes the active Section name, copies only missing deaths from the current Session into that Section, and writes both handouts. Campaign and Chapter are not rewritten by that action.'
                },
                {
                    label: 'Short Command',
                    value: '!NPC-WR opens this menu. !npc-death-write is the full command.'
                },
                { label: 'Result', value: message || 'No reports written yet.' }
            ]);
        }

        function handleReportWriter(args = {}) {
            if (args.newSection && args.newSection !== true) {
                const result = startSectionFromCurrentSession(args.newSection);
                showReportWriterPanel(
                    `Section is now ${result.section.name}. Added ${result.added} current-session death${result.added === 1 ? '' : 's'} and updated the Section and Session handouts.`
                );
                return;
            }

            if (args.all) {
                writeActiveBucketHandouts();
                showReportWriterPanel('Campaign, Chapter, Section, and Session handouts updated.');
                return;
            }

            if (args.scope) {
                const scope = normalizeScope(args.scope);
                const bucket = getActiveBucket(scope);
                writeBucketHandout(bucket);
                showReportWriterPanel(`${DEATH_BUCKET_TITLES[scope]} handout updated: ${bucketHandoutName(scope, bucket.name)}.`);
                return;
            }

            showReportWriterPanel();
        }

        function showDeathClearConfirm(scope) {
            const safeScope = normalizeScope(scope);
            const onlyBucket = getActiveBucket(safeScope);
            const nestedScopes = NESTED_BUCKET_SCOPES[safeScope];
            const nestedBuckets = nestedScopes.map(getActiveBucket);
            const nestedCount = nestedBuckets.reduce((total, bucket) => total + bucket.entries.length, 0);
            const nestedNames = nestedBuckets.map(bucket => `${DEATH_BUCKET_TITLES[bucket.scope]}: ${bucket.name}`).join(', ');

            if (!nestedCount) {
                sendNPCPanel('NPC Death Bucket Clear', [
                    { label: 'Result', value: `No recorded NPC deaths to clear from ${nestedNames}.` },
                    { label: 'Actions', value: deathReportActions(safeScope) }
                ]);
                return;
            }

            sendNPCPanel('NPC Death Bucket Clear', [
                {
                    label: 'Clear Only This Bucket',
                    value: `${DEATH_BUCKET_TITLES[safeScope]}: ${onlyBucket.name} contains ${onlyBucket.entries.length} recorded death${onlyBucket.entries.length === 1 ? '' : 's'}.`
                },
                {
                    label: 'Clear This Level And Below',
                    value: nestedScopes.length > 1
                        ? `${nestedCount} total entries across ${nestedNames}. Parent buckets above ${DEATH_BUCKET_TITLES[safeScope]} are retained.`
                        : 'Session has no nested bucket beneath it.'
                },
                {
                    label: 'Buttons',
                    value: [
                        GameAssist.createButton(`Clear Only ${DEATH_BUCKET_TITLES[safeScope]}`, `!npc-death-clear --scope ${safeScope} --confirm`),
                        ...(nestedScopes.length > 1
                            ? [GameAssist.createButton(`Clear ${DEATH_BUCKET_TITLES[safeScope]} And Below`, `!npc-death-clear --scope ${safeScope} --nested --confirm`)]
                            : []),
                        GameAssist.createButton('Cancel', `!npc-death-report --scope ${safeScope}`)
                    ]
                }
            ]);
        }

        function clearActiveDeathBuckets(scope, includeNested = false) {
            const safeScope = normalizeScope(scope);
            const scopes = includeNested ? NESTED_BUCKET_SCOPES[safeScope] : [safeScope];
            const results = scopes.map(itemScope => {
                const bucket = getActiveBucket(itemScope);
                const count = bucket.entries.length;
                bucket.entries.length = 0;
                writeBucketHandout(bucket);
                return { bucket, count };
            });

            if (scopes.includes('session')) {
                const runtime = ensureNPCManagerRuntime();
                runtime.deathLog.length = 0;
            }

            return {
                scope: safeScope,
                includeNested,
                results,
                count: results.reduce((total, result) => total + result.count, 0)
            };
        }

        function renderAuditHandout(needsMarker, needsClear, unlinked, invalidHp) {
            function renderList(title, entries) {
                if (!entries.length) return `<h3>${htmlText(title)}</h3><p>None.</p>`;
                return [
                    `<h3>${htmlText(title)}</h3>`,
                    '<ul>',
                    entries.map(entry =>
                        `<li><strong>${htmlText(entry.name)}</strong> | HP ${htmlText(entry.hp)} | Markers: ${htmlText(entry.markers)} | Token ID: ${htmlText(entry.id)}</li>`
                    ).join(''),
                    '</ul>'
                ].join('\n');
            }

            return [
                '<h2>NPC Death Audit</h2>',
                `<p><strong>Updated:</strong> ${htmlText(localNow())}</p>`,
                '<p>Checked linked NPC tokens on the current player page. Player characters are intentionally not included.</p>',
                `<p><strong>Configured death marker:</strong> ${htmlText(modState.config.deadMarker || 'dead')}</p>`,
                renderList('Needs Death Marker', needsMarker),
                renderList('Needs Marker Cleared', needsClear),
                unlinked.length
                    ? `<h3>Ignored Unlinked Items</h3><p>${htmlText(summarizeAuditNames(unlinked, 20))}</p><p>Expected for party markers, scenery, labels, or props.</p>`
                    : '<h3>Ignored Unlinked Items</h3><p>None.</p>',
                invalidHp.length
                    ? `<h3>Ignored Invalid HP</h3><p>${htmlText(summarizeAuditNames(invalidHp, 20))}</p><p>Blank or non-numeric HP is never treated as zero by marker repair.</p>`
                    : '<h3>Ignored Invalid HP</h3><p>None.</p>',
                '<p><strong>Safety:</strong> The audit is read-only. The separate repair command re-scans current HP, requires confirmation, and changes only the configured death marker.</p>'
            ].join('\n');
        }

        function selectedArcEntry(token, note = null) {
            const link = GameAssist.getLinkedCharacter(token);
            if (!link) return null;
            const isNPC = Boolean(getNPCContext(token, link));
            const character = link.character;
            const rawHP = token.get('bar1_value');
            return {
                id: `${now()}-${token.id}`,
                tokenId: token.id,
                characterId: character.id,
                name: token.get('name') || character.get('name') || '(Unnamed)',
                hp: rawHP === '' || rawHP == null ? null : rawHP,
                marker: token.get('statusmarkers') || null,
                time: localNow(),
                timestamp: isoNow(),
                source: isNPC ? 'Selected NPC token' : 'Selected PC token',
                note: note || null
            };
        }

        function appendSelectedTokensToArc(arc, msg, note = null, options = {}) {
            const selected = Array.isArray(msg.selected) ? msg.selected : [];
            const skipped = [];
            const result = { added: 0, updated: 0, duplicates: 0, skipped };

            selected.forEach(sel => {
                const token = getObj('graphic', sel._id);
                if (!token) {
                    skipped.push('(missing token)');
                    return;
                }

                const entry = selectedArcEntry(token, note);
                if (!entry) {
                    skipped.push(token.get('name') || '(Unnamed)');
                    return;
                }

                const change = appendArcCandidate(arc, entry, options);
                result.added += change.added;
                result.updated += change.updated;
                result.duplicates += change.duplicate;
            });

            return result;
        }

        function appendSessionToArc(arc, options = {}) {
            const bucket = getActiveBucket('session');
            const result = { added: 0, updated: 0, duplicates: 0 };

            bucket.entries.forEach(entry => {
                const key = deathEntryKey(entry);
                const change = appendArcCandidate(arc, {
                    ...cloneDeathEntry(entry),
                    source: `Session bucket: ${bucket.name}`,
                    sourceEventId: key
                }, options);
                result.added += change.added;
                result.updated += change.updated;
                result.duplicates += change.duplicate;
            });

            return result;
        }

        function showArcPanel(message = null) {
            const runtime = ensureNPCManagerRuntime();
            const arcLines = runtime.arcs.length
                ? runtime.arcs.map(arc => [
                    `${arc.name}: ${Array.isArray(arc.entries) ? arc.entries.length : 0} entries`,
                    GameAssist.createButton('Manage', `!npc-death-arc --name "${queryDefault(arc.name)}" --manage`)
                ].join(' '))
                : ['No arc buckets created yet.'];

            sendNPCPanel('NPC Arc Buckets', [
                {
                    label: 'Default Rule',
                    value: 'Each linked creature appears once per arc. Adding it again updates the existing entry instead of creating a duplicate.'
                },
                {
                    label: 'Current Arcs',
                    value: arcLines
                },
                {
                    label: 'Commands',
                    value: [
                        '!npc-death-arc --name "Paladin Atonement" = add selected linked PC/NPC tokens',
                        '!npc-death-arc --name "Paladin Atonement" --session = append current session deaths',
                        '!npc-death-arc --name "Paladin Atonement" --note "text" = add a short note to selected tokens',
                        '!npc-death-arc --name "Paladin Atonement" --manage = remove or undo entries',
                        '!npc-death-arc --name "Paladin Atonement" --allowDuplicates = deliberately bypass deduplication'
                    ]
                },
                {
                    label: 'Buttons',
                    value: [
                        GameAssist.createButton('Add Selected To Arc', '!npc-death-arc --name "?{Arc bucket name|Paladin Atonement}"'),
                        GameAssist.createButton('Append Session To Arc', '!npc-death-arc --name "?{Arc bucket name|Paladin Atonement}" --session'),
                        GameAssist.createButton('Manage Arc', '!npc-death-arc --name "?{Arc bucket name|Paladin Atonement}" --manage')
                    ]
                },
                {
                    label: 'Tip',
                    value: message || 'Select tokens before using the selected-token command.'
                }
            ]);
        }

        function showArcManagePanel(arc, page = 1, message = null) {
            const limit = DEATH_REPORT_DETAIL_LIMIT;
            const newest = arc.entries.slice().reverse();
            const pageCount = Math.max(1, Math.ceil(newest.length / limit));
            const currentPage = Math.min(Math.max(parseInt(page, 10) || 1, 1), pageCount);
            const start = (currentPage - 1) * limit;
            const entries = newest.slice(start, start + limit);
            const arcName = queryDefault(arc.name, 'Arc');
            const entryLines = entries.length
                ? entries.map(entry => [
                    `${entry.name} | ${entry.source || 'Manual entry'}`,
                    GameAssist.createButton('Remove', `!npc-death-arc --name "${arcName}" --remove ${entry.arcEntryId}`)
                ].join(' '))
                : ['No entries in this arc.'];
            const nav = [];

            if (currentPage > 1) {
                nav.push(GameAssist.createButton('Newer', `!npc-death-arc --name "${arcName}" --manage --page ${currentPage - 1}`));
            }
            if (currentPage < pageCount) {
                nav.push(GameAssist.createButton('Older', `!npc-death-arc --name "${arcName}" --manage --page ${currentPage + 1}`));
            }

            sendNPCPanel('Manage NPC Arc', [
                { label: 'Arc', value: `${arc.name} (${arc.entries.length} entries)` },
                { label: 'Entries', value: entryLines },
                {
                    label: 'Bulk Actions',
                    value: [
                        GameAssist.createButton('Remove Selected Tokens', `!npc-death-arc --name "${arcName}" --removeSelected`),
                        GameAssist.createButton('Undo Last Addition', `!npc-death-arc --name "${arcName}" --undo`),
                        GameAssist.createButton('Append Current Session', `!npc-death-arc --name "${arcName}" --session`)
                    ]
                },
                { label: 'Pages', value: nav.length ? nav : `Page ${currentPage} of ${pageCount}` },
                {
                    label: 'Tip',
                    value: message || 'Remove buttons affect only this arc handout. Campaign, Chapter, Section, and Session death history is unchanged.'
                }
            ]);
        }

        function requestDeathMarker(token, on) {
            const resolution = getDeathMarkerResolution();
            if (!resolution.ok) {
                GameAssist.log('NPCManager', deathMarkerWarning(resolution), 'WARN');
                return false;
            }

            if (resolution.ambiguous) {
                GameAssist.log(
                    'NPCManager',
                    `Marker "${resolution.requested}" matches multiple custom markers; using ${resolution.id}.`,
                    'WARN'
                );
            }

            const result = GameAssist.MarkerService.set(token, modState.config.deadMarker || 'dead', on, { owner: 'NPCManager' });
            if (!result.ok) {
                GameAssist.log('NPCManager', result.message || `Marker change failed (${result.code || 'INTERNAL'}).`, 'WARN');
                return false;
            }
            return true;
        }

        function getNPCContext(token, link = null) {
            const linked = link || GameAssist.getLinkedCharacter(token);
            if (!linked) return null;

            const npcAttr = findObjs({
                _type: 'attribute',
                _characterid: linked.character.id,
                name: 'npc'
            })[0];

            if (!npcAttr || npcAttr.get('current') !== '1') return null;
            return linked;
        }

        function parseTrackedHP(raw) {
            if (raw === '' || raw == null) return null;
            const hp = parseInt(raw, 10);
            return Number.isFinite(hp) ? hp : null;
        }

        /**
         * handleTokenAdd — Guard the short setup interval in which NPCHPRoller replaces placeholder HP.
         * Context: Roll20 can expose zero/blank bar values before auto-roll-on-add writes rolled HP.
         * Invariant: only active auto-roll-on-add receives the grace period; normal gameplay HP changes remain direct.
         */
        function handleTokenAdd(token) {
            const hpRollerConfig = GameAssist.getState('NPCHPRoller')?.config;
            if (hpRollerConfig?.enabled === false || hpRollerConfig?.autoRollOnAdd !== true) return;

            initializingNpcHp.add(token.id);
            setTimeout(
                () => initializingNpcHp.delete(token.id),
                POLICY.runtime.npcHpInitializationGraceMs
            );
        }

        function checkForDeath(token) {
            if (!modState.config.autoTrackDeath) return;

            if (!getNPCContext(token)) return;

            const hp = parseTrackedHP(token.get('bar1_value'));
            if (hp === null) return;

            prepareNPCManagerActivity();
            const isDead = GameAssist.MarkerService.has(token, modState.config.deadMarker);

            if (hp < 1) {
                if (!isDead) requestDeathMarker(token, true);
                if (hasOpenDeathEntry(token)) return;

                const name = token.get('name') || '(Unnamed NPC)';
                GameAssist.log('NPCManager', `${name} recorded as dead (HP: ${hp})`);

                // Auto-hide if enabled
                if (modState.config.autoHide) {
                    token.set('layer', modState.config.hideLayer);
                    GameAssist.log('NPCManager', `${name} moved to ${modState.config.hideLayer}`);
                }

                recordDeathInBuckets(deathEventIdentity(token, hp));
            } else if (hp >= 1) {
                const annotated = annotateRevivalInBuckets(token, hp);
                if (isDead) requestDeathMarker(token, false);
                if (isDead || annotated) {
                    GameAssist.log('NPCManager', `${token.get('name')} revived (HP: ${hp})`);
                }
            }
        }

        function handleTokenChange(obj, prev) {
            const currentHp = parseTrackedHP(obj.get('bar1_value'));
            const previousHp = parseTrackedHP(prev?.bar1_value);
            if (currentHp === null || currentHp === previousHp) return;

            if (initializingNpcHp.has(obj.id)) {
                if (currentHp >= 1) initializingNpcHp.delete(obj.id);
                return;
            }

            // CHOICE: unknown/blank -> dead is initialization, not evidence of a living NPC crossing zero.
            if (previousHp === null && currentHp < 1) return;
            checkForDeath(obj);
        }

        GameAssist.onCommand('!npc-death-help', msg => {
            prepareNPCManagerActivity();
            showNPCManagerHelp();
        }, 'NPCManager', { gmOnly: true });

        GameAssist.onCommand('!npc-death-report', msg => {
            const { args } = _parseArgs(msg.content);
            prepareNPCManagerActivity();

            if (args.help) {
                showDeathReportHelp();
                return;
            }

            if (args.write) {
                handleReportWriter(args);
                return;
            }

            const scope = normalizeScope(args.scope);
            const bucket = getActiveBucket(scope);

            if (args.recent) {
                showDeathReportPage(bucket, 1, 'Recent Entries');
                return;
            }

            if (args.page || args.details || args.all) {
                showDeathReportPage(bucket, args.page || 1, 'Detail View');
                return;
            }

            showDeathReportSummary(bucket);
        }, 'NPCManager', { gmOnly: true });

        GameAssist.onCommand('!npc-death-clear', msg => {
            const { args } = _parseArgs(msg.content);
            const scope = normalizeScope(args.scope);
            prepareNPCManagerActivity();

            if (!args.confirm) {
                showDeathClearConfirm(scope);
                return;
            }

            const result = clearActiveDeathBuckets(scope, Boolean(args.nested));
            const cleared = result.results
                .map(item => `${DEATH_BUCKET_TITLES[item.bucket.scope]} ${item.bucket.name}: ${item.count}`)
                .join(', ');
            sendNPCPanel('NPC Death Bucket Clear', [
                { label: 'Result', value: `Cleared ${result.count} recorded NPC death event${result.count === 1 ? '' : 's'}.` },
                { label: 'Buckets', value: cleared },
                { label: 'Mode', value: result.includeNested ? 'Selected level and all nested levels.' : 'Selected bucket only.' },
                { label: 'Actions', value: deathReportActions(result.scope) }
            ]);
        }, 'NPCManager', { gmOnly: true });

        GameAssist.onCommand('!npc-death-buckets', msg => {
            const { args } = _parseArgs(msg.content);
            prepareNPCManagerActivity();
            const changed = updateDeathBucketNames(args);
            showDeathBucketsPanel(changed ? 'Bucket names updated and active bucket handouts refreshed.' : null);
        }, 'NPCManager', { gmOnly: true });

        function reportWriterCommand(msg) {
            const { args } = _parseArgs(msg.content);
            prepareNPCManagerActivity();
            handleReportWriter(args);
        }

        GameAssist.onCommand('!npc-death-write', reportWriterCommand, 'NPCManager', { gmOnly: true });
        GameAssist.onCommand('!npc-wr', reportWriterCommand, 'NPCManager', { gmOnly: true });

        GameAssist.onCommand('!npc-death-arc', msg => {
            const { args } = _parseArgs(msg.content);
            prepareNPCManagerActivity();

            if (args.help || args.list || !args.name || args.name === true) {
                showArcPanel(args.name === true ? 'Add an arc name, for example: !npc-death-arc --name "Paladin Atonement".' : null);
                return;
            }

            const arc = getOrCreateArc(args.name);
            if (args.manage) {
                showArcManagePanel(arc, args.page || 1);
                return;
            }

            if (args.undo) {
                const result = undoLastArcBatch(arc);
                writeArcHandout(arc);
                showArcManagePanel(
                    arc,
                    1,
                    result.label
                        ? `Undid ${result.label}: removed ${result.addedRemoved} added entr${result.addedRemoved === 1 ? 'y' : 'ies'} and restored ${result.updatesRestored} updated entr${result.updatesRestored === 1 ? 'y' : 'ies'}.`
                        : 'There is no recent arc addition to undo.'
                );
                return;
            }

            if (args.removeSelected) {
                const removed = removeSelectedArcEntries(arc, msg);
                writeArcHandout(arc);
                showArcManagePanel(arc, 1, removed
                    ? `Removed ${removed} entr${removed === 1 ? 'y' : 'ies'} matching the selected token${removed === 1 ? '' : 's'}.`
                    : 'No arc entries matched the selected tokens.');
                return;
            }

            if (args.remove && args.remove !== true) {
                const removed = removeArcEntryById(arc, String(args.remove));
                writeArcHandout(arc);
                showArcManagePanel(arc, args.page || 1, removed ? 'Entry removed.' : 'That arc entry was not found.');
                return;
            }

            const allowDuplicates = Boolean(args.allowDuplicates || args.duplicate);
            const batch = beginArcBatch(arc, args.session ? `Session import: ${getActiveBucket('session').name}` : 'Selected-token addition');
            const options = { allowDuplicates, batch };
            const selectedResult = args.session
                ? { added: 0, updated: 0, duplicates: 0, skipped: [] }
                : appendSelectedTokensToArc(arc, msg, args.note || null, options);
            const sessionResult = args.session
                ? appendSessionToArc(arc, options)
                : { added: 0, updated: 0, duplicates: 0 };
            const added = selectedResult.added + sessionResult.added;
            const updated = selectedResult.updated + sessionResult.updated;
            const duplicates = selectedResult.duplicates + sessionResult.duplicates;
            const changed = finalizeArcBatch(arc, batch);

            if (!changed) {
                showArcManagePanel(
                    arc,
                    1,
                    args.session
                        ? `No new creatures were added. ${duplicates} existing entr${duplicates === 1 ? 'y was' : 'ies were'} kept without duplication.`
                        : 'No new linked creatures were added. Select linked tokens, or use --allowDuplicates when repetition is intentional.'
                );
                return;
            }

            writeArcHandout(arc);
            sendNPCPanel('NPC Arc Bucket Updated', [
                { label: 'Arc', value: arc.name },
                { label: 'Added', value: `${added} entr${added === 1 ? 'y' : 'ies'}` },
                { label: 'Updated', value: `${updated} existing entr${updated === 1 ? 'y' : 'ies'}` },
                { label: 'Duplicates Avoided', value: duplicates },
                { label: 'Handout', value: arcHandoutName(arc.name) },
                {
                    label: 'Skipped',
                    value: selectedResult.skipped.length
                        ? `${selectedResult.skipped.length} unlinked or missing token${selectedResult.skipped.length === 1 ? '' : 's'}: ${summarizeAuditNames(selectedResult.skipped)}`
                        : 'None'
                },
                {
                    label: 'Actions',
                    value: [
                        GameAssist.createButton('Manage Arc', `!npc-death-arc --name "${queryDefault(arc.name)}" --manage`),
                        GameAssist.createButton('Undo This Addition', `!npc-death-arc --name "${queryDefault(arc.name)}" --undo`)
                    ]
                }
            ]);
        }, 'NPCManager', { gmOnly: true });

        function showDeathAudit() {
            prepareNPCManagerActivity();
            const audit = collectDeathAudit();
            setHandoutNotes(AUDIT_HANDOUT_NAME, renderAuditHandout(
                audit.needsMarker,
                audit.needsClear,
                audit.unlinked,
                audit.invalidHp
            ));
            const fields = [
                {
                    label: 'Result',
                    value: !audit.resolution.ok
                        ? deathMarkerWarning(audit.resolution)
                        : (audit.mismatchCount
                            ? `⚠️ ${audit.mismatchCount} linked NPC${audit.mismatchCount === 1 ? '' : 's'} need death-marker attention.`
                            : '✅ No death-marker problems found for linked NPCs.')
                }
            ];

            if (audit.needsMarker.length) {
                fields.push({
                    label: `Add Death Marker (${audit.needsMarker.length})`,
                    value: formatAuditEntries(audit.needsMarker)
                });
            }

            if (audit.needsClear.length) {
                fields.push({
                    label: `Remove Death Marker (${audit.needsClear.length})`,
                    value: formatAuditEntries(audit.needsClear)
                });
            }

            fields.push(
                {
                    label: 'Scope',
                    value: 'Checked linked NPC tokens on the current player page. Player characters are not included.'
                },
                {
                    label: 'Detail Handout',
                    value: AUDIT_HANDOUT_NAME
                },
                {
                    label: 'Configured Marker',
                    value: modState.config.deadMarker || 'dead'
                },
                {
                    label: 'Counts',
                    value: [
                        `Needs marker: ${audit.needsMarker.length}`,
                        `Needs marker cleared: ${audit.needsClear.length}`,
                        `Ignored unlinked: ${audit.unlinked.length}`,
                        `Ignored invalid HP: ${audit.invalidHp.length}`
                    ]
                }
            );

            if (audit.unlinked.length) {
                fields.push({
                    label: `Ignored Unlinked (${audit.unlinked.length})`,
                    value: [
                        summarizeAuditNames(audit.unlinked),
                        'Expected for party markers, scenery, labels, or props.'
                    ]
                });
            }

            if (audit.invalidHp.length) {
                fields.push({
                    label: `Ignored Invalid HP (${audit.invalidHp.length})`,
                    value: [
                        summarizeAuditNames(audit.invalidHp),
                        'Blank or non-numeric HP is not treated as zero.'
                    ]
                });
            }

            fields.push({
                label: 'Actions',
                value: [
                    GameAssist.createButton('Refresh Audit', '!npc-death-audit'),
                    ...(audit.resolution.ok && audit.mismatchCount
                        ? [GameAssist.createButton('Review Marker Repairs', '!npc-death-repair')]
                        : [])
                ]
            });

            sendAuditReport(fields);
        }

        function showDeathRepair(confirmed = false) {
            prepareNPCManagerActivity();
            const audit = collectDeathAudit();

            if (!audit.resolution.ok) {
                sendNPCPanel('NPC Death Marker Repair', [
                    { label: 'Result', value: deathMarkerWarning(audit.resolution) },
                    { label: 'Changed', value: 'Nothing. Repair cannot run until the configured marker is recognized.' },
                    { label: 'Actions', value: GameAssist.createButton('Back to Audit', '!npc-death-audit') }
                ]);
                return;
            }

            if (!audit.mismatchCount) {
                sendNPCPanel('NPC Death Marker Repair', [
                    { label: 'Result', value: 'No marker repairs are currently needed.' },
                    { label: 'Changed', value: 'Nothing.' },
                    { label: 'Actions', value: GameAssist.createButton('Run Audit', '!npc-death-audit') }
                ]);
                return;
            }

            if (!confirmed) {
                sendNPCPanel('Review NPC Death Marker Repairs', [
                    {
                        label: 'Proposed Changes',
                        value: [
                            `Add ${modState.config.deadMarker || 'dead'} to ${audit.needsMarker.length} NPC${audit.needsMarker.length === 1 ? '' : 's'} with HP below 1.`,
                            `Remove ${modState.config.deadMarker || 'dead'} from ${audit.needsClear.length} NPC${audit.needsClear.length === 1 ? '' : 's'} with positive HP.`
                        ]
                    },
                    {
                        label: 'Important',
                        value: [
                            'This follows the HP currently shown on bar 1.',
                            'It changes only the configured death marker. It does not change HP, death history, bucket records, or Arc records.',
                            'If HP is wrong, cancel and correct HP before repairing markers.'
                        ]
                    },
                    {
                        label: 'Actions',
                        value: [
                            GameAssist.createButton('Confirm Marker Repairs', '!npc-death-repair --confirm'),
                            GameAssist.createButton('Cancel', '!npc-death-audit')
                        ]
                    }
                ]);
                return;
            }

            let added = 0;
            let removed = 0;
            const failed = [];
            const apply = (entries, action) => {
                entries.forEach(entry => {
                    const token = getObj('graphic', entry.id);
                    if (!token) {
                        failed.push(`${entry.name}: token no longer exists`);
                        return;
                    }
                    const result = GameAssist.MarkerService[action](
                        token,
                        modState.config.deadMarker || 'dead',
                        { owner: 'NPCManager' }
                    );
                    if (!result.ok || result.verified !== true) {
                        failed.push(`${entry.name}: ${result.message || result.code || 'marker change was not verified'}`);
                        return;
                    }
                    if (result.changed) {
                        if (action === 'add') added++;
                        else removed++;
                    }
                });
            };

            apply(audit.needsMarker, 'add');
            apply(audit.needsClear, 'remove');

            const after = collectDeathAudit();
            setHandoutNotes(AUDIT_HANDOUT_NAME, renderAuditHandout(
                after.needsMarker,
                after.needsClear,
                after.unlinked,
                after.invalidHp
            ));
            sendNPCPanel('NPC Death Marker Repair Complete', [
                {
                    label: 'Changed',
                    value: [
                        `Markers added: ${added}`,
                        `Markers removed: ${removed}`,
                        `Changes not completed: ${failed.length}`
                    ]
                },
                {
                    label: 'Remaining Mismatches',
                    value: after.mismatchCount
                        ? `${after.mismatchCount} linked NPC${after.mismatchCount === 1 ? '' : 's'} still need attention.`
                        : 'None.'
                },
                ...(failed.length ? [{ label: 'Needs Manual Attention', value: summarizeAuditNames(failed, AUDIT_DETAIL_LIMIT) }] : []),
                {
                    label: 'Preserved',
                    value: 'HP, death history, bucket records, Arc records, and unrelated markers were not changed.'
                },
                { label: 'Actions', value: GameAssist.createButton('Run Audit', '!npc-death-audit') }
            ]);
        }

        GameAssist.onCommand('!npc-death-audit', () => {
            showDeathAudit();
        }, 'NPCManager', { gmOnly: true });

        GameAssist.onCommand('!npc-death-repair', msg => {
            showDeathRepair(/(?:^|\s)--confirm(?:\s|$)/i.test(String(msg.content || '')));
        }, 'NPCManager', { gmOnly: true });

        GameAssist.onEvent('add:graphic', handleTokenAdd, 'NPCManager');
        GameAssist.onEvent('change:graphic:bar1_value', handleTokenChange, 'NPCManager');
        GameAssist.log('NPCManager', `${NPCMANAGER_MODULE_VERSION} Ready: Auto death tracking + hierarchical reports/writer/audits/confirmed marker repair/arcs`, 'INFO', { startup: true });
    }, {
        enabled: true,
        events: ['add:graphic', 'change:graphic:bar1_value'],
        prefixes: ['!npc-death-help', '!npc-death-report', '!npc-death-clear', '!npc-death-audit', '!npc-death-repair', '!npc-death-buckets', '!npc-death-write', '!npc-wr', '!npc-death-arc'],
        dependsOn: ['MarkerService'],
        preserveRuntimeOnDisable: true,
        teardown: () => {
            const branch = GameAssist.getState('NPCManager');
            const marker = branch?.config?.deadMarker || 'dead';
            const resolution = GameAssist.MarkerService.resolve(marker);
            const pageId = Campaign().get('playerpageid');

            if (!pageId) return;
            if (!resolution.ok) {
                const detail = resolution.registryError
                    ? ` Roll20 marker registry problem: ${_sanitize(resolution.registryError)}.`
                    : '';
                GameAssist.log('NPCManager', `Configured NPC death marker "${_sanitize(marker)}" could not be recognized during teardown.${detail}`, 'WARN');
                return;
            }

            const targets = findObjs({
                _type: 'graphic',
                _pageid: pageId,
                layer: 'objects'
            }).filter(token => GameAssist.MarkerService.has(token, resolution.id));

            if (!targets.length) return;

            let removed = 0;
            targets.forEach(token => {
                const result = GameAssist.MarkerService.remove(token, resolution.id, { owner: 'NPCManager' });
                if (!result.ok) {
                    GameAssist.log('NPCManager', result.message || `Marker removal failed (${result.code || 'INTERNAL'}).`, 'WARN');
                } else if (result.changed) {
                    removed++;
                }
            });

            if (removed) {
                GameAssist.log('NPCManager', `Removed ${resolution.id} from ${removed} token(s) during teardown.`);
            }
        }
    });
    // --- Notes & Comments ---
    // Changed (v0.1.5.1): NPCManager module_version advanced to 1.3.0; date-based Session rollover and dynamically rendered death, revival, bucket, and Arc timestamps now follow the validated GameAssist timezone while stored ISO instants remain unchanged. A bounded public refresh hook lets a validated timezone change update an active date-managed Session immediately.
    // Decision log:
    //   CHOICE: Keep death-history recording independent from marker mutation success - ALT: record only after marker success; REJECTED: history should describe HP events even when a visual marker cannot change.
    //   CHOICE: Identify Arc creatures by token before character/name fallbacks - ALT: character-only identity; REJECTED: multiple NPC tokens may share one character sheet.
    //   CHOICE: Require a separate preview and confirmation before repairing audit mismatches - ALT: repair from the audit command; REJECTED: a marker/HP mismatch may reveal HP housekeeping the DM wants to correct manually.
    //   CHOICE: Ignore blank or invalid HP during audit repair - ALT: coerce it to zero; REJECTED: automatic repair must not mark an incompletely configured NPC as dead.
    // Prior notes:
    //   v0.1.5.0: Audits remain read-only while !npc-death-repair previews, confirms, re-scans, and verifies death-marker corrections without changing HP or history. All marker reads, writes, audits, repair actions, and teardown use CORE:MARKERSERVICE with no standalone TokenMod dependency. Writes preserve configured numbered overlays such as dead@2.
    //   v0.1.4.7: Suppressed placeholder HP transitions, advanced NPCManager to 1.1.1, and used verified TokenMod --api-as marker requests.
    //   v0.1.4.5: Advanced NPCManager through 1.0.0 and 1.1.0 for scoped history, handouts, Arc curation, hierarchical clearing, date-managed Sessions, report writing, retention, deduplication, and help.
    //   v0.1.4.5: Explicit Session names persisted across dates; revival annotations no longer depended on marker removal; bounded audit details were restored.
    //   v0.1.4.4: Grouped death-audit output, stated PC exclusion, categorized mismatches, and bounded chat detail.
    //   v0.1.4.3: Resolved configured death markers before add/remove/teardown requests.
    //   v0.1.4.1: Used exact marker matching, POLICY cache limits, and shared time seams.
    //   v0.1.3: Hardened deathLog self-healing and added module narrative.
    //   v0.1.1.2: Updated MECHSUITS metadata.
    // [GAMEASSIST:MODULES:NPCMANAGER] END
    // =============================================================================

    // ————— CONCENTRATION TRACKER MODULE v0.2.0 —————
    // =============================================================================
    // [GAMEASSIST:MODULES:CONCENTRATIONTRACKER] BEGIN
    // Section Title: ConcentrationTracker module
    // -------------------------------------------------------------------------
    // mechsuit_section: { codename: "GAMEASSIST", area: "MODULES:CONCENTRATIONTRACKER", title: "ConcentrationTracker",
    //   guarantees: ["Chat UI for concentration saves; exact configured-marker status reporting; marker mutations through CORE:MARKERSERVICE"],
    //   depends_on: ["[GAMEASSIST:POLICY]","[GAMEASSIST:APP:UTILS]","[GAMEASSIST:CORE:MARKERSERVICE]","[GAMEASSIST:CORE:OBJECT]"],
    //   last_updated_version: "v0.1.5.0",
    //   independent_versions: { module_version: "0.2.0" } }
    // -------------------------------------------------------------------------
    // Narrative
    // MODULES:CONCENTRATIONTRACKER manages concentration save rolls, whispering outcomes,
    // and applying the configured marker through CORE:MARKERSERVICE. Status reads resolve custom marker
    // display names to their stored Roll20 tags and report invalid configuration.
    // -------------------------------------------------------------------------
    GameAssist.register('ConcentrationTracker', function() {
    // ─── Module Setup ──────────────────────────────────────────────────────────────
    const modState = GameAssist.getState('ConcentrationTracker');
    Object.assign(modState.config, {
        enabled:   true,
        marker:    'Concentrating',
        randomize: true,
        ...modState.config
    });

    const LAST_DAMAGE_LIMIT = POLICY.runtime.lastDamageLimit;

    function getEntryTimestamp(entry) {
        const ts = Number(entry && entry.timestamp);
        return (Number.isFinite(ts) && ts > 0) ? ts : 0;
    }

    function pruneLastDamage(lastDamage) {
        const entries = Object.entries(lastDamage || {});
        if (entries.length <= LAST_DAMAGE_LIMIT) return;

        entries
            .sort(([, a], [, b]) => getEntryTimestamp(a) - getEntryTimestamp(b))
            .slice(0, entries.length - LAST_DAMAGE_LIMIT)
            .forEach(([playerId]) => delete lastDamage[playerId]);
    }

    function normalizeLastDamageCache() {
        const lastDamage = ensureModRuntimeKey(modState, 'lastDamage', 'object');

        Object.entries(lastDamage).forEach(([playerId, payload]) => {
            if (typeof payload === 'number' || typeof payload === 'string') {
                const dmg = Number(payload) || 0;
                lastDamage[playerId] = {
                    damage: dmg,
                    dc: Math.max(10, Math.floor(dmg / 2)),
                    bonus: null,
                    mode: 'normal',
                    tokenId: null,
                    tokenName: null,
                    characterId: null,
                    characterName: null,
                    player: (getObj('player', playerId)?.get('displayname') || null),
                    timestamp: 0
                };
                return;
            }

            if (payload && typeof payload === 'object') {
                let tokenId = null;
                if (payload.tokenId) tokenId = payload.tokenId;
                else if (payload.tokenID) tokenId = payload.tokenID;
                else if (payload.tokenIdLegacy) tokenId = payload.tokenIdLegacy;

                const damage = Number(payload.damage) || 0;
                const normalized = {
                    damage,
                    dc: payload.dc !== undefined ? (Number(payload.dc) || Math.max(10, Math.floor(damage / 2))) : Math.max(10, Math.floor(damage / 2)),
                    bonus: Number.isFinite(Number(payload.bonus)) ? Number(payload.bonus) : null,
                    mode: (payload.mode === 'adv' || payload.mode === 'dis' || payload.mode === 'normal') ? payload.mode : 'normal',
                    tokenId: tokenId,
                    tokenName: payload.tokenName || payload.token,
                    characterId: payload.characterId,
                    characterName: payload.characterName,
                    player: payload.player || payload.playerName,
                    timestamp: sanitizeTimestamp(payload.timestamp, 0)
                };

                lastDamage[playerId] = normalized;
                return;
            }

            delete lastDamage[playerId];
        });

        pruneLastDamage(lastDamage);
        return lastDamage;
    }

    function ensureConcentrationRuntime() {
        const runtime = ensureRuntimeObject(modState);
        const lastDamage = normalizeLastDamageCache();
        return { runtime, lastDamage };
    }

    // One-time normalization/repair of runtime cache at module init.
    // Return value intentionally ignored: this call is for side effects (mutates runtime).
    ensureConcentrationRuntime();

    // ─── Public Command Prefixes ───────────────────────────────────────────────────
    const CMDS = ['!concentration', '!cc'];

    // ─── Marker Helper ──────────────────────────────────────────────────────────────
    function getMarker() {
        return modState.config.marker || 'Concentrating';
    }

    function getMarkerResolution() {
        return GameAssist.MarkerService.resolve(getMarker());
    }

    function markerResolutionWarning(resolution) {
        const marker = _sanitize(resolution.requested || getMarker());
        const detail = resolution.registryError
            ? ` Roll20 marker registry problem: ${_sanitize(resolution.registryError)}.`
            : '';
        return `⚠️ Configured concentration marker "${marker}" could not be recognized.${detail}` +
            ` Check the campaign marker library, then use !ga-config set ConcentrationTracker marker=<name-or-tag>.`;
    }

    // ─── Default Emote Lines ────────────────────────────────────────────────────────
    const DEFAULT_LINES = {
        success: [
            "steadies their breath, holding their focus.",
            "'s grip tightens as they maintain their spell.",
            "staggers slightly but does not lose concentration.",
            "clenches their jaw, magic still flickering with intent.",
            "narrows their eyes, spell still intact."
        ],
        failure: [
            "gasps, their focus shattered as the spell falters.",
            "'s concentration breaks and the magic fades.",
            "cries out, unable to maintain the spell.",
            "'s spell fizzles as they lose control.",
            "winces, focus lost in the heat of battle."
        ]
    };

    // ─── Helper Functions ──────────────────────────────────────────────────────────

    /**
     * getConfig()
     *   Merge default settings with stored config.
     */
    function getConfig() {
        return Object.assign({ randomize: true }, modState.config);
    }

    /**
     * getOutcomeLines(name)
     *   Returns the success/failure emote arrays with {{name}} replaced.
     */
    function getOutcomeLines(name) {
        const fill = line => line.replace("{{name}}", name);
        return {
            success: DEFAULT_LINES.success.map(fill),
            failure: DEFAULT_LINES.failure.map(fill)
        };
    }

    /**
     * getConBonus(character)
     *   Reads the character's Constitution saving throw bonus.
     */
    function getConBonus(character) {
        const attr = findObjs({
            _type:       'attribute',
            _characterid: character.id,
            name:        'constitution_save_bonus'
        })[0];
        return attr ? parseInt(attr.get('current'), 10) : 0;
    }

    /**
     * toggleMarker(token, on)
     *   Adds or removes the Concentrating status marker.
     */
    function toggleMarker(token, on) {
        const resolution = getMarkerResolution();
        if (!resolution.ok) {
            GameAssist.log('ConcentrationTracker', markerResolutionWarning(resolution), 'WARN');
            return false;
        }

        if (resolution.ambiguous) {
            GameAssist.log(
                'ConcentrationTracker',
                `Marker "${resolution.requested}" matches multiple custom markers; using ${resolution.id}.`,
                'WARN'
            );
        }

        const result = GameAssist.MarkerService.set(token, getMarker(), on, { owner: 'ConcentrationTracker' });
        if (!result.ok) {
            GameAssist.log('ConcentrationTracker', result.message || `Marker change failed (${result.code || 'INTERNAL'}).`, 'WARN');
            return false;
        }
        return true;
    }

    /**
     * postButtons(recipient)
     *   Sends the three-button UI for a new concentration check.
     */
    function postButtons(recipient) {
        const dmg = '?{Damage taken?|0}';
        const buttons = [
            GameAssist.createButton('🎯 Maintain Control', `!concentration --damage ${dmg} --mode normal`),
            GameAssist.createButton('🧠 Brace for the Distraction', `!concentration --damage ${dmg} --mode adv`),
            GameAssist.createButton('😣 Struggling to Focus', `!concentration --damage ${dmg} --mode dis`)
        ].join(' ');
        sendChat('ConcentrationTracker',
            `/w "${recipient}" ${buttons}<br>⚠️ Select your token before clicking.`
        );
    }

    /**
     * sendResult(player, dc, total, rolls, formula)
     *   Whispers the concentration-check result to player & GM.
     */
    function sendResult(player, dc, total, rolls, formula) {
        const tpl =
            `&{template:default} {{name=🧠 Concentration Check}}` +
            ` {{DC=${dc}}} {{Result=Roll(s) ${rolls} → ${total} (from ${formula})}}`;
        sendChat('ConcentrationTracker', `/w "${player}" ${tpl}`);
        sendChat('ConcentrationTracker', `/w gm ${tpl}`);
    }

    /**
     * showStatus(player)
     *   Lists all tokens currently marked Concentrating.
     */
    function showStatus(player) {
        const page = Campaign().get('playerpageid');
        const resolution = getMarkerResolution();
        if (!resolution.ok) {
            return sendChat(
                'ConcentrationTracker',
                `/w "${player}" ${markerResolutionWarning(resolution)}`
            );
        }
        if (!page) {
            return sendChat(
                'ConcentrationTracker',
                `/w "${player}" ⚠️ Current player page could not be determined. Check !ga-status and try again.`
            );
        }
        if (resolution.ambiguous) {
            GameAssist.log(
                'ConcentrationTracker',
                `Marker "${resolution.requested}" matches multiple custom markers; status uses ${resolution.id}.`,
                'WARN'
            );
        }
        const tokens = findObjs({
            _type:  'graphic',
            _pageid: page,
            layer:  'objects'
        }).filter(t => GameAssist.MarkerService.has(t, resolution.id));
        if (!tokens.length) {
            return sendChat('ConcentrationTracker',
                `/w "${player}" No tokens concentrating.`
            );
        }
        let out = `&{template:default} {{name=🧠 Concentration Status}}`;
        tokens.forEach(t => {
            out += `{{${t.get('name') || 'Unnamed'}=Concentrating}}`;
        });
        sendChat('ConcentrationTracker', `/w "${player}" ${out}`);
    }

    function buildStatusTemplate() {
        const { lastDamage } = ensureConcentrationRuntime();
        const entries = Object.entries(lastDamage || {});
        if (!entries.length) return null;

        const compiled = entries.map(([playerId, payload]) => {
            const data = (payload && typeof payload === 'object')
                ? payload
                : { damage: Number(payload) || 0, mode: 'normal', timestamp: 0 };
            const playerObj = getObj('player', playerId);
            const display = data.player || playerObj?.get('displayname') || 'Unknown Player';
            const playerName = display.replace(/ \(GM\)$/, '');
            const damage = Number(data.damage) || 0;
            const dc = data.dc ?? Math.max(10, Math.floor(damage / 2));
            const bonus = typeof data.bonus === 'number' ? data.bonus : null;
            const mode = data.mode || 'normal';
            const token = data.tokenId ? getObj('graphic', data.tokenId) : null;
            const character = data.characterId ? getObj('character', data.characterId) : null;
            const tokenName = data.tokenName || token?.get('name') || character?.get('name') || '(Token)';
            const characterName = data.characterName || character?.get('name') || tokenName;
            const recorded = data.timestamp ? localTime(data.timestamp) : '—';
            const bonusText = bonus !== null ? (bonus >= 0 ? `+${bonus}` : `${bonus}`) : '—';

            return {
                player: playerName,
                info: `${characterName} • DMG ${damage} → DC ${dc} • Bonus ${bonusText} • Mode ${mode} • @ ${recorded}`,
                timestamp: data.timestamp || 0
            };
        });

        compiled.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        const rows = compiled.map(row => `{{${_sanitize(row.player)}=${_sanitize(row.info)}}}`);
        return `&{template:default} {{name=🧠 Concentration Status}} ${rows.join(' ')}`;
    }

    /**
     * showHelp(player)
     *   Whisper the full list of commands and usage.
     */
    function showHelp(player) {
        const helpText = [
            "🧠 Concentration Help:",
            "• !concentration / !cc → Show buttons",
            "• --damage X           → Roll vs DC = max(10,⌊X/2⌋)",
            "• --mode normal|adv|dis→ Set roll mode",
            "• --last               → Repeat last check",
            "• --off                → Remove marker from selected tokens",
            "• --status             → Who is concentrating",
            "• --config randomize on|off → Toggle emote randomization"
        ].join('<br>');
        sendChat('ConcentrationTracker', `/w "${player}" ${helpText}`);
    }

    /**
     * handleRoll(msg, damage, mode)
     *   Executes the concentration roll workflow.
     */
    function handleRoll(msg, damage, mode) {
        const { lastDamage } = ensureConcentrationRuntime();
        const player = msg.who.replace(/ \(GM\)$/, '');
        if (!msg.selected?.length) {
            return sendChat('ConcentrationTracker',
                `/w "${player}" ⚠️ No token selected.`
            );
        }
        const token = getObj('graphic', msg.selected[0]._id);
        if (!token) {
            return sendChat('ConcentrationTracker',
                `/w "${player}" ⚠️ Token not found.`
            );
        }

        const linked = GameAssist.getLinkedCharacter(token);
        if (!linked) {
            return sendChat('ConcentrationTracker',
                `/w "${player}" ⚠️ Token must be on the Objects layer and linked to a character.`
            );
        }

        const { character } = linked;

        const bonus = getConBonus(character);
        const dc    = Math.max(10, Math.floor(damage / 2));
        const name  = token.get('name') || character.get('name');
        const { success: S, failure: F } = getOutcomeLines(name);
        const { randomize } = getConfig();

        let expr = `1d20 + ${bonus}`;
        if (mode === 'adv') expr = `2d20kh1 + ${bonus}`;
        if (mode === 'dis') expr = `2d20kl1 + ${bonus}`;

        lastDamage[msg.playerid] = {
            damage,
            dc,
            bonus,
            mode,
            tokenId: token.id,
            tokenName: name,
            characterId: character.id,
            characterName: character.get('name'),
            player,
            timestamp: sanitizeTimestamp(now())
        };

        pruneLastDamage(lastDamage);

        sendChat('', `[[${expr}]]`, ops => {
            const roll = ops[0].inlinerolls?.[0];
            if (!roll) {
                return sendChat('ConcentrationTracker',
                    `/w "${player}" ⚠️ Roll failed.`
                );
            }
            const total   = roll.results.total;
            const formula = roll.expression;
            const vals    = roll.results.rolls[0].results.map(r => r.v);
            const rollsText = (mode === 'normal' ? vals[0] : vals.join(','));
            const ok        = total >= dc;

            sendResult(player, dc, total, rollsText, formula);

            const pool = ok ? S : F;
            const tail = randomize
                ? pool[Math.floor(Math.random() * pool.length)]
                : pool[0];
            sendChat(`character|${character.id}`, `/em ${tail}`);
            toggleMarker(token, ok);
        });
    }

    /**
     * handleClear(msg)
     *   Clears the marker from selected tokens.
     */
    function handleClear(msg) {
        const player = msg.who.replace(/ \(GM\)$/, '');

        if (!msg.selected || msg.selected.length === 0) {
            sendChat('ConcentrationTracker', `/w "${player}" ⚠️ No tokens selected.`);
            return;
        }

        const skipped = [];

        msg.selected.forEach(sel => {
            const t = getObj('graphic', sel._id);
            if (!t) {
                skipped.push('(Missing Token)');
                return;
            }

            if (!GameAssist.getLinkedCharacter(t)) {
                skipped.push(t.get('name') || '(Unnamed)');
                return;
            }

            if (!toggleMarker(t, false)) {
                skipped.push(t.get('name') || '(Unnamed)');
            }
        });

        let response = '✅ Requested marker removal.';
        if (skipped.length) {
            response += ` Skipped: ${skipped.join(', ')}.`;
        }

        sendChat('ConcentrationTracker', `/w "${player}" ${response}`);
    }

    /**
     * handleLast(msg)
     *   Repeats the last concentration check.
     */
    function handleLast(msg) {
        const { lastDamage } = ensureConcentrationRuntime();
        const player = msg.who.replace(/ \(GM\)$/, '');
        const entry  = lastDamage[msg.playerid];
        const dmg    = typeof entry === 'object' ? Number(entry.damage) : Number(entry);
        if (!entry || !dmg) {
            return sendChat('ConcentrationTracker',
                `/w "${player}" ⚠️ No previous damage.`
            );
        }
        const mode = typeof entry === 'object' && entry.mode ? entry.mode : 'normal';
        handleRoll(msg, dmg, mode);
    }

    // ─── Core Handler (Case-Insensitive) ──────────────────────────────────────────
    function handler(msg) {
        if (msg.type !== 'api') return;

        // 1) Normalize prefix: trim + lowercase
        const raw   = msg.content.trim();
        const parts = raw.toLowerCase().split(/\s+--/);
        const cmd   = parts.shift();             // "!concentration" or "!cc"
        if (!CMDS.includes(cmd)) return;

        ensureConcentrationRuntime();

        // 2) Identify player (strip " (GM)")
        const player = msg.who.replace(/ \(GM\)$/, '');

        // 3) Config branch
        if (parts[0]?.startsWith('config ')) {
            const [, key, val] = parts[0].split(/\s+/);
            if (key === 'randomize') {
                modState.config.randomize = (val === 'on' || val === 'true');
                return sendChat('ConcentrationTracker',
                    `/w "${player}" ✅ Randomize = ${modState.config.randomize}`
                );
            }
            return sendChat('ConcentrationTracker',
                `/w "${player}" ❌ Unknown config ${key}`
            );
        }

        // 4) Parse flags
        let damage = 0, mode = 'normal';
        for (let p of parts) {
            if (p === 'help')   return showHelp(player);
            if (p === 'status') return showStatus(player);
            if (p === 'last')   return handleLast(msg);
            if (p === 'off')    return handleClear(msg);
            if (p.startsWith('damage ')) damage = parseInt(p.split(' ')[1], 10);
            if (p.startsWith('mode '))   mode   = p.split(' ')[1];
        }

        // 5) Execute
        if (damage > 0) {
            handleRoll(msg, damage, mode);
        } else {
            postButtons(player);
        }
    }

    // ─── Wire It Up ────────────────────────────────────────────────────────────────
    GameAssist.onCommand('!ga-conc-status', () => {
        const tpl = buildStatusTemplate();
        if (!tpl) {
            GameAssist.log('ConcentrationTracker', 'No concentration activity recorded yet.');
            return;
        }
        sendChat('ConcentrationTracker', `/w gm ${tpl}`);
    }, 'ConcentrationTracker', { gmOnly: true });

    GameAssist.onEvent('chat:message', handler, 'ConcentrationTracker');
    GameAssist.log(
        'ConcentrationTracker',
        `Ready: ${[...CMDS, '!ga-conc-status'].join(' & ')}`,
        'INFO',
        { startup: true }
    );
}, {
    enabled:  true,
    events: ['chat:message'],
    prefixes: ['!concentration','!cc','!ga-conc-status'],
    dependsOn: ['MarkerService'],
    teardown: () => {
        const page = Campaign().get('playerpageid');
        const marker = (GameAssist.getState('ConcentrationTracker')?.config?.marker) || 'Concentrating';
        const resolution = GameAssist.MarkerService.resolve(marker);
        if (!resolution.ok) {
            GameAssist.log(
                'ConcentrationTracker',
                `Teardown could not resolve configured marker "${marker}"; no markers were removed.`,
                'WARN'
            );
            return;
        }
        const targets = findObjs({ _type: 'graphic', _pageid: page, layer: 'objects' })
            .filter(t => GameAssist.MarkerService.has(t, resolution.id));
        let removed = 0;
        targets.forEach(token => {
            const result = GameAssist.MarkerService.remove(token, resolution.id, { owner: 'ConcentrationTracker' });
            if (!result.ok) {
                GameAssist.log('ConcentrationTracker', result.message || `Marker removal failed (${result.code || 'INTERNAL'}).`, 'WARN');
            } else if (result.changed) {
                removed++;
            }
        });
        if (removed) {
            GameAssist.log('ConcentrationTracker', `Removed the concentration marker from ${removed} token(s) during teardown.`);
        }
    }
    });
    // --- Notes & Comments ---
    // Changed (v0.1.5.0): ConcentrationTracker module_version advanced to 0.2.0; status, toggle, and teardown marker behavior uses CORE:MARKERSERVICE without standalone TokenMod. Writes preserve configured numbered overlays such as Concentrating@2.
    // Decision log:
    //   CHOICE: Keep lowercase parsing and established aliases - ALT: introduce a new command grammar; REJECTED: unnecessary user retraining.
    // Prior notes:
    //   v0.1.4.7: Advanced to 0.1.0.6 and used verified TokenMod --api-as marker requests while preserving standalone StatusInfo observation.
    //   v0.1.4.3: Resolved custom marker names to stored tags and reported unrecognized configuration.
    //   v0.1.4.1: Routed lastDamage limits and timestamps through POLICY/shared time seams.
    //   v0.1.4: Added exact configured-marker matching and GM whisper handling.
    //   v0.1.3: Sanitized timestamps, normalized legacy/runtime lastDamage entries, self-healed post-toggle state, and added module narrative.
    //   v0.1.1.2: Updated MECHSUITS metadata.
    // [GAMEASSIST:MODULES:CONCENTRATIONTRACKER] END
    // =============================================================================

    // ————— NPC HP ROLLER MODULE v0.1.1.0 —————
    // =============================================================================
    // [GAMEASSIST:MODULES:NPCHPROLLER] BEGIN
    // Section Title: NPCHPRoller module
    // -------------------------------------------------------------------------
    // mechsuit_section: { codename: "GAMEASSIST", area: "MODULES:NPCHPROLLER", title: "NPCHPRoller",
    //   guarantees: ["Parse NdM±K and set bar1 to rolled HP"],
    //   last_updated_version: "v0.1.1.2",
    //   independent_versions: { module_version: "0.1.1.0" } }
    // -------------------------------------------------------------------------
    // Narrative
    // MODULES:NPCHPROLLER parses `npc_hpformula`, rolls HP, and writes to bar1 value/max
    // without altering defaults. It keeps the legacy dice parsing semantics and bar writes
    // while surfacing warnings when formulas are invalid.
    // -------------------------------------------------------------------------
    GameAssist.register('NPCHPRoller', function() {
        const modState = GameAssist.getState('NPCHPRoller');

    Object.assign(modState.config, {
        enabled: true,
        autoRollOnAdd: false,
        ...modState.config
    });

        function parseDiceString(diceStr) {
            // Match “NdM”, “NdM+K”, “NdM + K”, “NdM-K”, case-insensitive on “d”
            const match = diceStr.match(
                /^\s*(\d+)\s*[dD]\s*(\d+)(?:\s*([+-])\s*(\d+))?\s*$/
            );
            if (!match) return null;

            const count = parseInt(match[1], 10);
            const sides = parseInt(match[2], 10);
            const sign  = match[3] === '-' ? -1 : 1;
            const bonus = match[4] ? sign * parseInt(match[4], 10) : 0;

            return { count, sides, bonus };
        }

        function rollDice(count, sides) {
            let total = 0;
            for (let i = 0; i < count; i++) {
                total += Math.floor(Math.random() * sides) + 1;
            }
            return total;
        }

        function rollHP(diceData) {
            const { count, sides, bonus } = diceData;
            return rollDice(count, sides) + bonus;
        }

        function resolveNpcContext(token, { logWarnings = true } = {}) {
            if (!token) {
                if (logWarnings) {
                    GameAssist.log('NPCHPRoller', 'Token not found', 'WARN');
                }
                return null;
            }

            const linked = GameAssist.getLinkedCharacter(token);
            if (!linked) {
                if (logWarnings) {
                    GameAssist.log('NPCHPRoller', `${token.get('name') || 'Token'} must be linked to a character on the Objects layer.`, 'WARN');
                }
                return null;
            }

            const displayName = token.get('name') || linked.character.get('name') || 'Token';

            const npcAttr = findObjs({
                _type: 'attribute',
                _characterid: linked.character.id,
                name: 'npc'
            })[0];

            if (!npcAttr || npcAttr.get('current') !== '1') {
                if (logWarnings) {
                    GameAssist.log('NPCHPRoller', `${displayName} is not flagged as an NPC.`, 'WARN');
                }
                return null;
            }

            const hpFormulaAttr = findObjs({
                _type: 'attribute',
                _characterid: linked.character.id,
                name: 'npc_hpformula'
            })[0];

            if (!hpFormulaAttr) {
                if (logWarnings) {
                    GameAssist.log('NPCHPRoller', `No HP formula found for ${displayName}`, 'WARN');
                }
                return null;
            }

            const formula = hpFormulaAttr.get('current');
            const diceData = parseDiceString(formula);

            if (!diceData) {
                if (logWarnings) {
                    GameAssist.log('NPCHPRoller', `Invalid HP formula: ${formula}`, 'WARN');
                }
                return null;
            }

            return { linked, formula, diceData, displayName };
        }

        function rollTokenHP(token, { logWarnings = true, reason = 'manual' } = {}) {
            const context = resolveNpcContext(token, { logWarnings });
            if (!context) return false;

            const hp = rollHP(context.diceData);

            token.set('bar1_value', hp);
            token.set('bar1_max', hp);

            const suffix = reason === 'auto' ? ' (auto-roll on add)' : '';
            GameAssist.log('NPCHPRoller', `${context.displayName} HP set to ${hp} using [${context.formula}]${suffix}`);
            return true;
        }

        GameAssist.onCommand('!npc-hp-all', async msg => {
            const pageId = Campaign().get('playerpageid');
            const tokens = findObjs({
                _pageid: pageId,
                _type: 'graphic',
                layer: 'objects'
            });

            const npcTokens = [];
            const skipped = [];

            for (const token of tokens) {
                const link = GameAssist.getLinkedCharacter(token);
                if (!link) {
                    skipped.push(token.get('name') || '(Unnamed)');
                    continue;
                }

                const npcAttr = findObjs({
                    _type: 'attribute',
                    _characterid: link.character.id,
                    name: 'npc'
                })[0];

                if (npcAttr && npcAttr.get('current') === '1') {
                    npcTokens.push(token);
                }
            }

            GameAssist.log('NPCHPRoller', `Rolling HP for ${npcTokens.length} NPCs on current map...`);

            for (const token of npcTokens) {
                try {
                    rollTokenHP(token);
                } catch (err) {
                    GameAssist.log('NPCHPRoller', `Error processing ${token.get('name')}: ${err.message}`, 'ERROR');
                }
            }

            if (skipped.length) {
                GameAssist.log('NPCHPRoller', `Skipped ${skipped.length} token(s) without linked characters: ${skipped.join(', ')}`, 'WARN');
            }
        }, 'NPCHPRoller', { gmOnly: true });

        GameAssist.onCommand('!npc-hp-selected', msg => {
            if (!msg.selected || msg.selected.length === 0) {
                GameAssist.log('NPCHPRoller', 'No tokens selected', 'WARN');
                return;
            }

            const skipped = [];

            msg.selected.forEach(sel => {
                const token = getObj('graphic', sel._id);
                if (!token) {
                    skipped.push('(Missing Token)');
                    return;
                }

                if (!GameAssist.getLinkedCharacter(token)) {
                    skipped.push(token.get('name') || '(Unnamed)');
                    return;
                }

                try {
                    rollTokenHP(token);
                } catch (err) {
                    GameAssist.log('NPCHPRoller', `Error processing ${token.get('name')}: ${err.message}`, 'ERROR');
                }
            });

            if (skipped.length) {
                GameAssist.log('NPCHPRoller', `Skipped ${skipped.length} token(s): ${skipped.join(', ')}`, 'WARN');
            }
        }, 'NPCHPRoller', { gmOnly: true });

        GameAssist.onEvent('add:graphic', token => {
            if (!modState.config.autoRollOnAdd) return;
            rollTokenHP(token, { logWarnings: false, reason: 'auto' });
        }, 'NPCHPRoller');

    GameAssist.log('NPCHPRoller', 'v0.1.1.0 Ready: !npc-hp-all, !npc-hp-selected', 'INFO', { startup: true });
}, {
    enabled: true,
    events: ['add:graphic'],
    prefixes: ['!npc-hp-all', '!npc-hp-selected']
});
    // --- Notes & Comments ---
    // CHOICE: Use Math.random for simplicity; acceptable for non‑critical HP rolls.
    // Maintenance (v0.1.3, no semantic change): Added module narrative and aligned version
    //   metadata; HP rolling behavior unchanged.
    // Prior notes: Maintenance (v0.1.1.2, no semantic change): MECHSUITS metadata updated for compliance.
    // [GAMEASSIST:MODULES:NPCHPROLLER] END
    // =============================================================================

    // ————— DEBUG TOOLS MODULE v0.2.0 —————
    // =============================================================================
    // [GAMEASSIST:MODULES:DEBUGTOOLS] BEGIN
    // Section Title: DebugTools module
    // -------------------------------------------------------------------------
    // mechsuit_section: { codename: "GAMEASSIST", area: "MODULES:DEBUGTOOLS", title: "DebugTools",
    //   guarantees: ["Dry-run friendly debugging helpers","Applied marker diagnostics use CORE:MARKERSERVICE"],
    //   depends_on: ["[GAMEASSIST:APP:UTILS]","[GAMEASSIST:CORE:MARKERSERVICE]","[GAMEASSIST:CORE:OBJECT]"],
    //   last_updated_version: "v0.1.5.0",
    //   independent_versions: { module_version: "0.2.0" } }
    // -------------------------------------------------------------------------
    // Narrative
    // MODULES:DEBUGTOOLS offers optional GM-only diagnostics for damage, markers, and
    // saves. It remains disabled by default, defaulting to dry-run behavior until
    // explicitly applied.
    // -------------------------------------------------------------------------
    GameAssist.register('DebugTools', function() {
        const modState = GameAssist.getState('DebugTools');
        Object.assign(modState.config, {
            enabled: false,
            ...modState.config
        });

        function ensureDebugRuntime() {
            return ensureRuntimeObject(modState);
        }

        function wantsApply(args) {
            if (args.apply === undefined) return false;
            if (args.apply === false) return false;
            if (typeof args.apply === 'string') {
                return args.apply.toLowerCase() !== 'false';
            }
            return Boolean(args.apply);
        }

        function getTokenFromArgs(msg, args) {
            let tokenId = null;
            if (typeof args.token === 'string') tokenId = args.token;
            else if (Array.isArray(args.token) && args.token.length) tokenId = args.token[0];

            if (!tokenId && msg.selected?.length) {
                tokenId = msg.selected[0]._id;
            }

            if (!tokenId) return null;

            const token = getObj('graphic', tokenId);
            if (!token) {
                GameAssist.log('DebugTools', `Token ${tokenId} not found.`, 'WARN');
                return null;
            }
            if (token.get('layer') !== 'objects') {
                GameAssist.log('DebugTools', 'Token must be on the Objects layer.', 'WARN');
                return null;
            }
            return token;
        }

        function handleDamage(msg, args) {
            const token = getTokenFromArgs(msg, args);
            if (!token) {
                GameAssist.log('DebugTools', 'Select a token or pass --token <id> for damage tests.', 'WARN');
                return;
            }

            const amountRaw = args.amount ?? args.damage ?? args.value;
            const amount = Number(amountRaw);
            if (!Number.isFinite(amount) || amount <= 0) {
                GameAssist.log('DebugTools', 'Provide --amount <number> greater than zero.', 'WARN');
                return;
            }

            const current = Number(token.get('bar1_value')) || 0;
            const next    = Math.max(0, current - amount);
            const name    = _sanitize(token.get('name') || token.id);
            const summary = `${name}: HP ${current} → ${next} (-${amount})`;

            if (!wantsApply(args)) {
                GameAssist.log('DebugTools', `Dry run — would apply ${summary}. Add --apply to commit.`);
                return;
            }

            token.set('bar1_value', next);
            GameAssist.log('DebugTools', `Applied ${summary}.`);
            ensureDebugRuntime().lastAction = { type: 'damage', token: token.id, amount, previous: current };
        }

        function handleMarker(msg, args) {
            const token = getTokenFromArgs(msg, args);
            if (!token) {
                GameAssist.log('DebugTools', 'Select a token or pass --token <id> for marker tests.', 'WARN');
                return;
            }

            const markerRaw = args.marker ?? args.status;
            const marker = (markerRaw ? String(markerRaw) : 'blue').trim();
            if (!marker) {
                GameAssist.log('DebugTools', 'Provide --marker <status name>.', 'WARN');
                return;
            }

            const modeRaw = args.state ?? args.mode ?? args.action;
            const mode = modeRaw ? String(modeRaw).toLowerCase() : 'toggle';
            const inspection = GameAssist.MarkerService.inspect(token, marker);
            if (!inspection.ok) {
                GameAssist.log('DebugTools', inspection.message || `Marker lookup failed (${inspection.code || 'INTERNAL'}).`, 'WARN');
                return;
            }

            const action = (mode === 'on' || mode === 'add')
                ? 'add'
                : ((mode === 'off' || mode === 'remove' || mode === 'clear') ? 'remove' : 'toggle');
            const actionDesc = action === 'toggle'
                ? `${inspection.present ? 'remove' : 'add'} ${inspection.resolution.id}`
                : `${action} ${inspection.resolution.id}`;
            const name = _sanitize(token.get('name') || token.id);

            if (!wantsApply(args)) {
                GameAssist.log('DebugTools', `Dry run — would ${actionDesc} on ${name}. Add --apply to commit.`);
                return;
            }

            const result = action === 'add'
                ? GameAssist.MarkerService.add(token, marker, { owner: 'DebugTools' })
                : (action === 'remove'
                    ? GameAssist.MarkerService.remove(token, marker, { owner: 'DebugTools' })
                    : GameAssist.MarkerService.toggle(token, marker, { owner: 'DebugTools' }));
            if (!result.ok) {
                GameAssist.log('DebugTools', result.message || `Marker action failed (${result.code || 'INTERNAL'}).`, 'WARN');
                return;
            }

            GameAssist.log('DebugTools', `Marker action: ${actionDesc} on ${name}${result.changed ? '.' : ' (already in the requested state).'}`);
            ensureDebugRuntime().lastAction = {
                type: 'marker',
                token: token.id,
                marker: result.resolution.id,
                mode: action
            };
        }

        function handleSave(msg, args) {
            const dcRaw = args.dc ?? args.target;
            const dc = Number(dcRaw);
            if (!Number.isFinite(dc)) {
                GameAssist.log('DebugTools', 'Provide --dc <number> for save tests.', 'WARN');
                return;
            }

            const bonusRaw = args.bonus ?? args.mod ?? 0;
            const bonus = Number(bonusRaw) || 0;
            const modeRaw = args.mode ?? args.roll ?? '';
            const mode = typeof modeRaw === 'string' ? modeRaw.toLowerCase() : '';
            let expr = `1d20 + ${bonus}`;
            let descriptor = 'normal';
            if (mode.startsWith('adv')) {
                expr = `2d20kh1 + ${bonus}`;
                descriptor = 'advantage';
            } else if (mode.startsWith('dis')) {
                expr = `2d20kl1 + ${bonus}`;
                descriptor = 'disadvantage';
            }

            if (!wantsApply(args)) {
                GameAssist.log('DebugTools', `Dry run — would roll ${expr} vs DC ${dc} (${descriptor}). Add --apply to execute.`);
                return;
            }

            const label = args.label ? _sanitize(String(args.label)) : 'Debug Save';
            sendChat('', `[[${expr}]]`, ops => {
                const roll = ops?.[0]?.inlinerolls?.[0];
                if (!roll) {
                    GameAssist.log('DebugTools', 'Save roll failed.', 'WARN');
                    return;
                }
                const total = roll.results.total;
                const success = total >= dc;
                const outcome = success ? '✅ Success' : '❌ Failure';
                const template = `&{template:default} {{name=${label}}} {{Result=${total} vs DC ${dc}}} {{Outcome=${outcome} (${descriptor})}}`;
                sendChat('DebugTools', `/w gm ${template}`);
                GameAssist.log('DebugTools', `Rolled ${total} vs DC ${dc} (${descriptor}). ${success ? 'Success' : 'Failure'}.`);
            });
        }

        function showHelp() {
            GameAssist.log('DebugTools', [
                'Debug helpers:',
                '• !ga-debug damage --amount N [--token TOKENID|select] [--apply]',
                '• !ga-debug marker --marker status [--state on|off|toggle] [--token TOKENID|select] [--apply]',
                '• !ga-debug save --dc N [--bonus M] [--mode normal|adv|dis] [--label Text] [--apply]'
            ].join('\n'));
        }

        const HANDLERS = {
            damage: handleDamage,
            marker: handleMarker,
            save: handleSave
        };

        GameAssist.onCommand('!ga-debug', msg => {
            const payload = msg.content.replace(/^!ga-debug\s*/i, '');
            if (!payload) {
                showHelp();
                return;
            }

            const parsed = _parseArgs(payload);
            const action = (parsed.cmd || '').toLowerCase();
            const handler = HANDLERS[action];
            if (!handler) {
                GameAssist.log('DebugTools', `Unknown debug action: ${_sanitize(action || '(none)')}`, 'WARN');
                showHelp();
                return;
            }
            handler(msg, parsed.args || {});
        }, 'DebugTools', { gmOnly: true });

        GameAssist.log('DebugTools', 'Debug module registered. Enable with !ga-enable DebugTools when needed.', 'INFO', { startup: true });
    }, {
        enabled: false,
        prefixes: ['!ga-debug'],
        dependsOn: ['MarkerService']
    });
    // --- Notes & Comments ---
    // Changed (v0.1.5.0): DebugTools module_version advanced to 0.2.0; marker previews and applied changes now resolve and mutate through CORE:MARKERSERVICE.
    // Decision log:
    //   CHOICE: Keep helpers dry-run by default and require --apply for mutation.
    // Prior notes:
    //   v0.1.4.1: Marker diagnostics used exact shared marker normalization, including counted markers.
    //   v0.1.3: Runtime self-healed before recording lastAction; dry-run and disabled-by-default posture remained.
    //   v0.1.1.2: Refreshed MECHSUITS metadata.
    // [GAMEASSIST:MODULES:DEBUGTOOLS] END
    // =============================================================================

    // --- Notes & Comments ---
    // Changed (v0.1.5.0): Updated the module wrapper contract because all marker consumers share CORE:MARKERSERVICE and TokenAssist now owns supported general token commands.
    // Prior notes:
    //   v0.1.4.3: Updated the wrapper contract after marker consumers adopted configured marker identity resolution.
    //   v0.1.3: Added MODULES wrapper for MECHSUITS parent/child compliance; no semantic change.
    // [GAMEASSIST:MODULES] END
    // =============================================================================

    // ————— BOOTSTRAP —————
    // =============================================================================
    // [GAMEASSIST:BOOTSTRAP] BEGIN
    // Section Title: Sandbox ready bootstrap
    // -------------------------------------------------------------------------
    // mechsuit_section: { codename: "GAMEASSIST", area: "BOOTSTRAP", title: "Bootstrap",
    //   guarantees: ["Repair known state, seed defaults, diagnose dependencies, preserve configured intent when dependencies prevent startup, init enabled modules","MarkerService initializes before its consumers and may be disabled without disabling unrelated modules"],
    //   depends_on: ["[GAMEASSIST:APP:UTILS]","[GAMEASSIST:CORE]","[GAMEASSIST:MODULES]"],
    //   last_updated_version: "v0.1.5.0", lifecycle: "active" }
    // -------------------------------------------------------------------------
    // Narrative
    // BOOTSTRAP runs at sandbox ready: repairs known state containers, seeds defaults,
    // audits compatibility, diagnoses dependencies, and initializes enabled modules.
    // Deliberately disabled modules remain quiet. Missing dependencies skip configured
    // modules without rewriting the DM's enabled setting; unverifiable dependencies warn and proceed.
    // -------------------------------------------------------------------------
    R20_ON('ready', () => {
        if (READY) return;
        READY = true;

        const root = ensureStateRoot();
        GameAssist.config = root.config;
        if (!root.metrics.sessionStart) {
            root.metrics.sessionStart = isoNow();
        }
        recordMetric('system', { mod: 'Core', note: 'Sandbox ready' });

        GameAssist._clearAllListeners();
        migrateKnownComponentState(root);
        auditState();
        seedDefaults();
        GameAssist._dedupePlanned();
        auditCompatibility();

        const moduleNames = Object.entries(MODULES)
            .filter(([, mod]) => !mod.internal)
            .map(([name]) => name);

        GameAssist.log('Core', `GameAssist v${VERSION} ready; modules: ${moduleNames.join(', ')}`);

        moduleNames.forEach(name => {
            const mod = MODULES[name];
            const cfg = getState(name).config;

            // CHOICE: Honor the DM's disabled setting before dependency checks so optional modules stay quiet.
            if (!cfg.enabled) {
                mod.initialized = false;
                mod.active = false;
                return;
            }

            const depInfo = GameAssist._checkDependencies(name);
            if (depInfo.status === 'missing') {
                const disabledServices = depInfo.missing.filter(dependency =>
                    MODULES[dependency]?.service && getState(dependency).config.enabled === false
                );
                if (disabledServices.length) {
                    cfg.enabled = false;
                    GameAssist.log(
                        'Core',
                        `${name} was turned off because ${disabledServices.join(', ')} is disabled. Enable the service first, then re-enable this module when its marker features are wanted.`,
                        'WARN'
                    );
                }
                GameAssist.log('Core', `${name} skipped (missing dependencies: ${depInfo.missing.join(', ')})`, 'WARN');
                // DANGER: Only an explicitly disabled internal service cascades to cfg.enabled=false; ordinary missing dependencies preserve configured intent for diagnosis.
                mod.initialized = false;
                mod.active = false;
                return;
            }
            if (depInfo.status === 'unverifiable') {
                GameAssist.log('Core', `${name} dependencies unverifiable (${depInfo.unverifiable.join(', ')}); proceeding without confirmation.`, 'WARN');
            }

            try {
                if (!mod.wired) {
                    mod.initFn();
                    mod.wired = true;
                }
                mod.initialized = true;
                mod.active = true;
            } catch (e) {
                mod.initialized = false;
                mod.active = false;
                GameAssist.handleError(name, e);
            }
        });

        GameAssist._metrics.lastUpdate = isoNow();
    });
    // --- Notes & Comments ---
    // Changed (v0.1.5.0): Startup migrates known unreleased component names before auditing state, initializes the toggleable MarkerService before its consumers, turns consumers off when the DM has disabled that service, and no longer gates marker consumers on standalone TokenMod.
    // Decision log:
    //   CHOICE: Keep the core ready log visible while QUIET_STARTUP suppresses module-ready noise.
    //   CHOICE: Repair known state before seeding defaults so valid configuration survives.
    //   CHOICE: Preserve configured intent for dependency-skipped modules - ALT: force-disable config; REJECTED: hid startup failures and erased DM intent.
    //   CHOICE: Treat an explicitly disabled GameAssist service differently from an unavailable external dependency because the DM selected that lifecycle outcome.
    // Prior notes:
    //   v0.1.4.7: Startup reported the standalone-interoperability release; lifecycle order was unchanged.
    //   v0.1.4.6: Checked configured intent before dependencies and preserved enabled configuration when a confirmed dependency was missing.
    //   v0.1.4.2: Repaired known state before defaults and reported three-state dependencies.
    //   v0.1.4.1: Routed bootstrap timestamps through the wall-clock seam.
    //   v0.1.3: Added bootstrap narrative while preserving ready flow and dependency checks.
    //   v0.1.1.2: Refreshed MECHSUITS metadata.
    // [GAMEASSIST:BOOTSTRAP] END
    // =============================================================================

})();
