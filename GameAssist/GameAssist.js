/*
========================================
GameAssist — Roll20 API Script
Version: 0.1.4.7
Last Updated: 2026-07-17 (America/New_York)
Development line: standalone TokenMod and StatusInfo interoperability v0.1.4.7 based on the v0.1.4.6 system-health release.
Author: Mord Eagle
License: MIT (see repository LICENSE)
Homepage: https://github.com/Roll20/roll20-api-scripts (submission target)

DESCRIPTION
GameAssist is a small framework for organizing Roll20 API modules with an explicit opt-in
task queue, watchdog, config/state helpers, and consistent logging. Normal event handlers
execute directly unless a module deliberately calls GameAssist.enqueue(). This package ships with six modules:
• ConfigUI — GM-only chat controls for toggling modules and boolean options.
• CritFumble — Detects natural-1s on selected rolltemplates and offers fumble/confirm menus.
• ConcentrationTracker — Runs concentration checks (normal/adv/dis), whispers results, toggles marker.
• NPCManager 1.1.1 — Tracks NPC death markers, hierarchical death-history buckets, report writing, audits, and curated arc rosters.
• NPCHPRoller — Rolls NPC HP from `npc_hpformula` and writes to bar1 (value/max).
• DebugTools — Optional GM diagnostics (dry-run by default) for damage, markers, and save rolls.

INSTALL / USAGE (One-Click or Manual)
• One-Click: install “GameAssist”. (Make sure “TokenMod” is also installed; see Dependencies.)
• Manual (Pro): paste this entire file into the API Scripts editor and Save.

CORE COMMANDS (GM):
• !ga-config list                          — write config handout “GameAssist Config”
• !ga-config modules                       — list modules + status
• !ga-config set <Module> key=value        — set module config (JSON/number/bool supported)
• !ga-config get <Module> key              — echo module config value
• !ga-config ui / !ga-config-ui            — open the GM chat control panel
• !ga-enable <Module> / !ga-disable <Module>
• !ga-status [--details]                   — show simple health or troubleshooting details
• !ga-debug <action>                       — run DebugTools helpers (`damage`, `marker`, `save`)

MODULE COMMANDS:
• CritFumble:
    !critfail                               — GM menu to trigger fumble UI for a player
    !critfumble                             — help
    !critfumble help                        — help
    !critfumble menu                        — guided natural-1 menu
    !critfumble-<melee|ranged|thrown|spell|natural>
    !confirm-crit-martial   | !confirm-crit-magic
• ConcentrationTracker (players/GM):
    !concentration [--damage N] [--mode normal|adv|dis] [--off|--status|--last|--config randomize on|off]
    !cc (alias)
• NPCManager (GM):         !npc-death-help
                            !npc-death-report [--scope campaign|chapter|section|session] [--recent|--page N|--write|--help]
                            !npc-death-buckets | !npc-death-clear [--scope session] [--nested] [--confirm]
                            !npc-death-write | !npc-wr | !npc-death-audit | !npc-death-arc
• NPCHPRoller (GM):        !npc-hp-selected    |   !npc-hp-all
• ConfigUI (GM):           !ga-config ui [--page N] | !ga-config-ui
• DebugTools (GM-only):    !ga-debug damage|marker|save [flags] (module disabled by default)

DEPENDENCIES
• TokenMod 0.8.88 baseline — required for marker/status changes issued by NPCManager and ConcentrationTracker.
• StatusInfo 0.3.11 baseline — optional; provides condition descriptions and menus while observing TokenMod changes.

CONFIGURATION NOTES
• Global flags (in code): GameAssist.flags.DEBUG_COMPAT, GameAssist.flags.QUIET_STARTUP.
• Per-module config via !ga-config set; types: boolean, number, JSON object/array, string.

COMPATIBILITY / FOOTPRINT
• Namespaced under global `GameAssist` only; avoids other global pollution.
• Uses standard events: `on('ready')`, `on('chat:message')`, and graphic change events.
• Writes only to Roll20 objects documented in script.json: handout notes, token bars/markers.

SUPPORT / HELP
• Use !ga-status for quick health; !ga-config list creates a “GameAssist Config” handout.
• For bug reports, include the console whisper output from `GameAssist.log(...)`.

V0.1.4.7 STANDALONE INTEROPERABILITY NOTES
- Normal commands/events execute directly; GameAssist.enqueue(task, options) is explicitly opt-in.
- Queue timeouts release the queue but cannot cancel JavaScript or Roll20 operations.
- Dependency status is confirmed, missing, or unverifiable.
- !ga-config list exports configuration only; runtime caches and metrics are excluded.
- Hidden/admin commands: !ga-config cleanup, !npc-death-buckets, !npc-death-clear [--scope session] [--nested] [--confirm], !npc-death-write, !npc-wr, !npc-death-audit, !npc-death-arc, !ga-metrics [reset].
- Additional config: NPCManager autoHide/hideLayer; registration dependsOn; onCommand match options.
- Built-in and custom status-marker names resolve to the exact ids Roll20 stores on tokens.
- Concentration status reports invalid marker configuration instead of silently returning an incorrect result.
- CritFumble help and NPC death-audit output use clearer DM-facing wording.
- NPC deaths record into Campaign, Chapter, Section, and Session buckets, with one handout per bucket.
- NPC death audits show bounded token-specific findings in chat and write the complete findings to the GameAssist NPC Death Audit handout.
- Disabling NPCManager clears its configured page markers but preserves saved death-history and Arc records.
- Arc buckets let the GM append selected linked PC/NPC tokens or current-session deaths to story handouts.
- GameAssist uses TokenMod's documented --api-as path, so internal marker requests do not require players-can-ids.
- Marker requests are checked after TokenMod runs; mismatches produce a direct manual test command for the GM.
- !ga-status --details reports detected TokenMod and optional StatusInfo versions/configuration evidence.
- Marker mutation remains inside standalone TokenMod so StatusInfo continues receiving TokenMod observer notifications.
- NPCManager ignores placeholder HP while NPCHPRoller auto-roll-on-add establishes a new token's starting HP.

HEADER REQUIREMENTS NOTE
Per the Roll20 API repo contribution guidelines, this header provides name, version, last updated,
description, syntax/commands, and configuration pointers near the top of the script.
========================================
*/

// --- MECHSUITS BANNER (YAML) ---
// mechsuit:
//   codename: "GAMEASSIST"
//   project_version: "v0.1.4.7"
//   purpose: "Roll20 API modular kernel and bundled modules with MECHSUITS v1.5.2 contracts, explicit opt-in queue execution, state self-healing, contract-aware dependency diagnostics, verified standalone TokenMod marker requests, and preserved StatusInfo observer delivery. Non-goals: embedded TokenMod/StatusInfo, sheet-specific integrations, implicit event queueing, or transport changes beyond Roll20 chat API."
//   order: ["policy","app.utils","core.queue","core.compat","core.state","core.object","interfaces.events","interfaces.commands","modules.configui","modules.critfumble","modules.npcmanager","modules.concentrationtracker","modules.npchproller","modules.debugtools","bootstrap"]
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
//     spans: ["[GAMEASSIST:CORE:QUEUE]","[GAMEASSIST:MODULES:CRITFUMBLE]"]
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
//     │  └─ [GAMEASSIST:CORE:OBJECT]
//     ├─ [GAMEASSIST:INTERFACES]
//     │  ├─ [GAMEASSIST:INTERFACES:EVENTS]
//     │  └─ [GAMEASSIST:INTERFACES:COMMANDS]
//     ├─ [GAMEASSIST:MODULES]
//     │  ├─ [GAMEASSIST:MODULES:CONFIGUI]
//     │  ├─ [GAMEASSIST:MODULES:CRITFUMBLE]
//     │  ├─ [GAMEASSIST:MODULES:NPCMANAGER]
//     │  ├─ [GAMEASSIST:MODULES:CONCENTRATIONTRACKER]
//     │  ├─ [GAMEASSIST:MODULES:NPCHPROLLER]
//     │  └─ [GAMEASSIST:MODULES:DEBUGTOOLS]
//     └─ [GAMEASSIST:BOOTSTRAP]
// --- prose banner ---
// Guarantee: GameAssist v0.1.4.7 runs policy, utilities, guarded core services, interfaces, modules, then bootstrap using the declared order and preserves standalone TokenMod/StatusInfo ownership. Secrets required: none. It refuses to emit player data outside Roll20 or override Roll20 global on/off handlers.

// =============================
// === GameAssist v0.1.4.7 ===
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
    //   guarantees: ["Shared behavioral knobs and snapshot identifiers have one owner; marker verification and NPC initialization waits are explicit"],
    //   provides: ["POLICY"], last_updated_version: "v0.1.4.7", lifecycle: "active" }
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
            maxFutureMs: 1000 * 60 * 60 * 24 * 7
        }),
        configUi: Object.freeze({
            pageSize: 3
        }),
        critFumble: Object.freeze({
            rollDelayMs: 200
        }),
        standaloneInterop: Object.freeze({
            markerVerificationDelayMs: 1000
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
    // Changed (v0.1.4.7): Added a two-second NPC HP initialization grace period so auto-roll-on-add setup is not recorded as a death/revival; rollback: remove the guard and this policy value.
    // Changed (v0.1.4.7): Added a one-second standalone TokenMod marker-verification delay; rollback: remove standaloneInterop and delayed verification.
    // Changed (v0.1.4.5): Added runtime death-report summary/detail limits for bounded GM-facing history reports.
    // Changed (v0.1.4.4): Added runtime.npcAuditDetailLimit to bound grouped NPC death-audit chat output.
    // Changed (v0.1.4.2): Added stable configuration-snapshot format and schema identifiers.
    // Maintenance (v0.1.4.3, no semantic change): Removed internal development-provenance wording from the narrative.
    // Decision log:
    //   CHOICE: Version configuration-only exports before import exists; safe import validation remains deferred.
    //   CHOICE: Freeze shallow policy groups to prevent accidental runtime mutation — ALT: mutable config; REJECTED: hidden drift.
    // Prior notes:
    //   Changed (v0.1.4.1): Centralized existing defaults without changing their values; rollback: restore section-local aliases.
    //   Maintenance (v0.1.3, no semantic change): Added POLICY narrative and corrected top-level version metadata.
    //   Maintenance (v0.1.1.2, no semantic change): Updated MECHSUITS metadata for v1.5.1 compliance.
    // [GAMEASSIST:POLICY] END
    // [GAMEASSIST:APP] BEGIN
    // Section Title: App wrapper (utilities and shared helpers)
    // -------------------------------------------------------------------------
    // mechsuit_section: { codename: "GAMEASSIST", area: "APP", title: "Wrapper",
    //   guarantees: ["APP-scoped shared helpers are grouped here", "Standalone marker requests preserve TokenMod observer delivery"],
    //   depends_on: [], last_updated_version: "v0.1.4.7" }
    // -------------------------------------------------------------------------
    // Narrative
    // The APP tree houses shared helpers used by core services and bundled modules.
    // Utilities below cover argument parsing, state helpers, auditing, sanitization,
    // exact Roll20 status-marker identity resolution, and standalone script interoperability.
    // -------------------------------------------------------------------------

    // ————— UTILITIES —————
    // =============================================================================
    // [GAMEASSIST:APP:UTILS] BEGIN
    // Section Title: Utilities (arg parsing, state helpers, audit, sanitize)
    // -------------------------------------------------------------------------
    // mechsuit_section: { codename: "GAMEASSIST", area: "APP:UTILS", title: "Utilities",
    //   guarantees: ["Shared helpers; known module state branches self-heal without deleting valid config","Configured built-in/custom marker names resolve to stored Roll20 marker ids","TokenMod marker requests use documented API impersonation and delayed outcome verification"],
    //   depends_on: ["[GAMEASSIST:POLICY]"], last_updated_version: "v0.1.4.7", lifecycle: "active" }
    // -------------------------------------------------------------------------
    // Narrative
    // APP:UTILS collects helpers for metrics/state initialization, conservative state
    // repair, argument parsing, sanitization, time access, token-character linking,
    // exact built-in/custom status-marker identity resolution, external-script evidence,
    // and verified requests through standalone TokenMod.
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

    function localNow() {
        return new Date(now()).toLocaleString();
    }

    function localTime(raw = now()) {
        return new Date(raw).toLocaleTimeString();
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

    const BUILT_IN_MARKER_IDS = new Set([
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

    let customMarkerRegistryCache = {
        raw: null,
        markers: [],
        error: null
    };

    function unwrapMarkerText(marker) {
        const text = String(marker || '').split('@')[0].trim();
        if (text.length >= 2) {
            const first = text[0];
            const last = text[text.length - 1];
            if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
                return text.slice(1, -1).trim();
            }
        }
        return text;
    }

    function normalizeMarkerId(marker) {
        return unwrapMarkerText(marker).toLowerCase();
    }

    /**
     * getCustomMarkerRegistry — Read Roll20's custom marker display-name/tag map.
     * Failure: returns an empty registry plus an actionable error; never throws.
     * Design: cache by the raw campaign value so audits do not repeatedly parse JSON.
     */
    function getCustomMarkerRegistry() {
        let raw;
        try {
            raw = String(Campaign().get('_token_markers') || '[]');
        } catch (error) {
            return {
                raw: null,
                markers: [],
                error: `Campaign marker registry unavailable: ${error.message || error}`
            };
        }

        if (customMarkerRegistryCache.raw === raw) {
            return customMarkerRegistryCache;
        }

        try {
            const parsed = JSON.parse(raw);
            const markers = (Array.isArray(parsed) ? parsed : [])
                .filter(entry => entry && entry.name && entry.tag)
                .map(entry => ({
                    name: String(entry.name).trim(),
                    tag: String(entry.tag).split('@')[0].trim()
                }))
                .filter(entry => entry.name && entry.tag);

            customMarkerRegistryCache = { raw, markers, error: null };
        } catch (error) {
            customMarkerRegistryCache = {
                raw,
                markers: [],
                error: `Campaign marker registry is invalid JSON: ${error.message || error}`
            };
        }

        return customMarkerRegistryCache;
    }

    /**
     * resolveMarkerId — Resolve configured marker text to the exact stored marker id.
     * Inputs: built-in id, custom display name, or custom stored tag.
     * Outputs: a result object; callers must inspect ok before using id.
     * Design: literal lowercase built-in ids retain precedence, exact stored
     * custom tags do not require the campaign registry, and exact custom display
     * names such as "Dead" can still select a custom marker.
     */
    function resolveMarkerId(marker) {
        const requested = unwrapMarkerText(marker);
        const normalized = normalizeMarkerId(requested);

        if (!requested) {
            return {
                ok: false,
                requested,
                id: null,
                source: null,
                ambiguous: false,
                candidates: [],
                reason: 'empty',
                registryError: null
            };
        }

        if (requested === normalized && BUILT_IN_MARKER_IDS.has(normalized)) {
            return {
                ok: true,
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
            return {
                ok: true,
                requested,
                id: requested,
                source: 'custom-tag-direct',
                ambiguous: false,
                candidates: [requested],
                reason: null,
                registryError: null
            };
        }

        const registry = getCustomMarkerRegistry();

        const resolved = (matches, source) => ({
            ok: true,
            requested,
            id: matches[0].tag,
            source,
            ambiguous: matches.length > 1,
            candidates: matches.map(entry => entry.tag),
            reason: null,
            registryError: registry.error
        });

        const directTagMatches = registry.markers
            .filter(entry => normalizeMarkerId(entry.tag) === normalized);
        if (directTagMatches.length) return resolved(directTagMatches, 'custom-tag');

        const exactNameMatches = registry.markers
            .filter(entry => entry.name === requested);
        if (exactNameMatches.length) return resolved(exactNameMatches, 'custom-name');

        if (BUILT_IN_MARKER_IDS.has(normalized)) {
            return {
                ok: true,
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

        return {
            ok: false,
            requested,
            id: null,
            source: null,
            ambiguous: false,
            candidates: [],
            reason: registry.error ? 'registry-error' : 'not-found',
            registryError: registry.error
        };
    }

    function tokenHasMarker(token, marker) {
        if (!token || typeof token.get !== 'function') return false;

        const requested = unwrapMarkerText(marker);
        const normalized = normalizeMarkerId(requested);
        const isStoredId = requested.includes('::') ||
            (requested === normalized && BUILT_IN_MARKER_IDS.has(normalized));
        const resolution = isStoredId
            ? { ok: true, id: requested }
            : resolveMarkerId(requested);

        if (!resolution.ok) return false;
        const want = normalizeMarkerId(resolution.id);
        const list = String(token.get('statusmarkers') || '')
            .split(',')
            .map(normalizeMarkerId)
            .filter(Boolean);
        return list.includes(want);
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
        const statusInfoDescriptions = statusInfo.showDescriptions === true
            ? 'condition descriptions are enabled'
            : (statusInfo.showDescriptions === false
                ? 'condition descriptions are disabled'
                : 'the condition-description setting could not be read');
        const tokenModLine = tokenMod.confirmed
            ? `TokenMod${tokenModVersion}: detected; GameAssist can send authorized marker requests and check their results.`
            : 'TokenMod: not directly confirmed; enabled marker modules still require a live marker test.';
        const statusInfoLine = statusInfo.confirmed
            ? `StatusInfo${statusInfoVersion}: detected; ${statusInfoDescriptions}. Live observation remains the final check.`
            : 'StatusInfo: not detected. It is optional unless this campaign uses condition descriptions and menus.';
        return [tokenModLine, statusInfoLine];
    }

    function getTokenModApiIdentity() {
        const gm = (findObjs({ _type: 'player' }) || [])
            .filter(player => {
                try { return playerIsGM(player.id); }
                catch { return false; }
            })
            .sort((a, b) => String(a.id).localeCompare(String(b.id)))[0] || null;
        const evidence = getStandaloneScriptEvidence('TokenMod');
        return {
            gmPlayerId: gm?.id || null,
            playersCanUseIds: evidence.playersCanUseIds,
            evidence
        };
    }

    const pendingTokenModMarkerOps = new Map();
    let tokenModMarkerOpId = 0;

    /**
     * requestTokenModMarker — Request one marker mutation through standalone TokenMod and verify the result.
     * Inputs: Roll20 token, resolved stored marker id, desired boolean state, owning module name.
     * Outputs: true when a request was accepted for dispatch; false when validation/authentication prevents dispatch.
     * Failure: delayed mismatch warnings give the GM a direct TokenMod command to try on a selected token.
     * Design: use TokenMod rather than token.set so StatusInfo keeps receiving TokenMod.ObserveTokenChange notifications.
     */
    function requestTokenModMarker(token, marker, on, moduleName) {
        if (!token || typeof token.get !== 'function' || !token.id) {
            GameAssist.log(moduleName, 'TokenMod marker request could not identify the target token.', 'WARN');
            return false;
        }

        const markerId = unwrapMarkerText(marker);
        if (!markerId || /[\s|#]/.test(markerId)) {
            GameAssist.log(moduleName, `TokenMod marker request refused unsafe or invalid marker id "${_sanitize(markerId)}".`, 'WARN');
            return false;
        }

        const desired = on === true;
        if (tokenHasMarker(token, markerId) === desired) return true;

        const auth = getTokenModApiIdentity();
        if (!auth.gmPlayerId && auth.playersCanUseIds !== true) {
            GameAssist.log(
                moduleName,
                'TokenMod marker request could not find a GM identity for --api-as, and TokenMod does not report players-can-ids as enabled. Open !ga-status --details and test TokenMod directly.',
                'WARN'
            );
            return false;
        }

        const apiAs = auth.gmPlayerId ? ` --api-as ${auth.gmPlayerId}` : '';
        const operation = desired ? '+' : '-';
        const command = `!token-mod${apiAs} --ids ${token.id} --set statusmarkers|${operation}${markerId}`;
        const key = `${token.id}|${normalizeMarkerId(markerId)}`;
        const operationId = ++tokenModMarkerOpId;
        pendingTokenModMarkerOps.set(key, operationId);
        sendChat('api', command);

        setTimeout(() => {
            if (pendingTokenModMarkerOps.get(key) !== operationId) return;
            pendingTokenModMarkerOps.delete(key);

            const current = getObj('graphic', token.id);
            if (!current) {
                GameAssist.log(moduleName, `TokenMod marker result could not be verified because token ${token.id} no longer exists.`, 'WARN');
                return;
            }
            if (tokenHasMarker(current, markerId) === desired) return;

            const tokenName = current.get('name') || '(Unnamed Token)';
            const verb = desired ? 'add' : 'remove';
            const manual = `!token-mod --ids @{selected|token_id} --set statusmarkers|${operation}${markerId}`;
            GameAssist.log(
                moduleName,
                `TokenMod did not ${verb} marker "${markerId}" on ${tokenName}. Select that token and try ${manual}. Check !ga-status --details for detected standalone versions.`,
                'WARN'
            );
        }, POLICY.standaloneInterop.markerVerificationDelayMs);

        return true;
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
    // Changed (v0.1.4.7): Detect TokenMod/StatusInfo through their public contracts, dispatch marker requests through TokenMod --api-as, and warn when delayed marker verification fails.
    // Changed (v0.1.4.5): Keep adjacent command flags independent so combinations such as --nested --confirm and --session --allowDuplicates execute as displayed.
    // Changed (v0.1.4.3): Resolve configured built-in/custom marker names to exact stored Roll20 ids and return explicit resolution failures.
    // Changed (v0.1.4.3): Exact stored custom marker tags resolve before registry access so valid configured tags survive registry read failures.
    // Changed (v0.1.4.3): Marker resolution strips simple matching quote pairs so chat config like marker="red" resolves as red.
    // Decision log:
    //   CHOICE: Unknown branches remain warning-only; explicit cleanup is required before deletion.
    //   CHOICE: monotonic() falls back to Date.now() in Roll20 — ALT: assume performance.now; REJECTED: sandbox portability.
    //   CHOICE: Preserve literal lowercase built-in ids before custom display names, then honor exact-case custom names — ALT: always prefer custom names; REJECTED: a custom "dead" could silently replace NPCManager's built-in default.
    //   CHOICE: Fast-path exact stored ids during resolution and token comparison — ALT: require registry confirmation; REJECTED: valid stored tags should remain usable when the registry is unavailable.
    //   CHOICE: Keep marker mutation inside standalone TokenMod — ALT: token.set from GameAssist; REJECTED: bypassed TokenMod observers used by StatusInfo.
    //   CHOICE: Prefer TokenMod --api-as with a GM id — ALT: require players-can-ids; REJECTED: script-to-script calls should not depend on a player-facing permission toggle.
    // Prior notes:
    //   Changed (v0.1.4.2): Known module state branches now self-heal malformed config/runtime containers while preserving valid configuration.
    //   Changed (v0.1.4.1): Added wall/monotonic clock seams and routed shared limits through POLICY.
    //   Changed (v0.1.4): Added regex-based command matching and shared marker helpers for teardown visibility.
    //   Changed (v0.1.3): Added ensureModRuntimeKey, sanitizeTimestamp, and runtime guards for post-toggle self-healing.
    //   Maintenance (v0.1.3, no semantic change): Added narrative for APP utilities and aligned version metadata.
    //   Maintenance (v0.1.1.2, no semantic change): Section metadata aligned to MECHSUITS v1.5.1.
    // [GAMEASSIST:APP:UTILS] END
    // =============================================================================

    // --- Notes & Comments ---
    // Changed (v0.1.4.7): Updated APP contract to include verified standalone TokenMod requests while preserving StatusInfo observer delivery.
    // Changed (v0.1.4.3): Updated APP contract to include shared exact marker-identity resolution.
    // Prior notes (selected):
    //   Maintenance (v0.1.3, no semantic change): Updated APP wrapper commentary after utility narrative addition; nesting remains explicit over APP:UTILS only.
    //   • Maintenance (v0.1.1.2, no semantic change): APP wrapper relocated to avoid implied nesting over non-APP sections while still covering APP:UTILS.
    //   • MIT license retained; copyright © 2025 Mord Eagle.
    //   • Modules: ConfigUI, CritFumble, NPCManager, ConcentrationTracker, NPCHPRoller, DebugTools.
    //   • Queue/watchdog defaults preserved (30s/15s).
    //   • Logging emits /w gm with icons and timestamp.
    // [GAMEASSIST:APP] END
    // =============================================================================

    // =============================================================================
    // [GAMEASSIST:CORE] BEGIN
    // Section Title: Core wrapper (constants and kernel services)
    // -------------------------------------------------------------------------
    // mechsuit_section: { codename: "GAMEASSIST", area: "CORE", title: "Core wrapper",
    //   guarantees: ["Core constants and kernel services are grouped; children own logic"],
    //   depends_on: ["[GAMEASSIST:POLICY]","[GAMEASSIST:APP]"], last_updated_version: "v0.1.4.7",
    //   lifecycle: "active" }
    // -------------------------------------------------------------------------
    // Narrative
    // CORE wraps the foundational constants, queue, compatibility checks, state,
    // and object utilities. Children carry the executable code; this wrapper
    // documents scope and anchors the hierarchy for MECHSUITS compliance.
    // -------------------------------------------------------------------------

    const VERSION      = '0.1.4.7';
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
    //   guarantees: ["Optional visibility of known/unknown scripts"], last_updated_version: "v0.1.1.2" }
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
                    'TokenMod drives status-marker automation; NPCManager and ConcentrationTracker expect it for marker toggles.',
                    'If TokenMod is offline, disable marker-dependent modules with !ga-disable to avoid duplicate whispers.'
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
    // CHOICE: DEBUG_COMPAT gate avoids noise; GM toggles as needed.
    // Maintenance (v0.1.3, no semantic change): Added narrative clarifying gating and kept
    //   compatibility heuristics unchanged; version metadata corrected.
    // Prior notes: Maintenance (v0.1.1.2, no semantic change): MECHSUITS compliance metadata refreshed.
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
    // CHOICE: Gracefully log bad JSON rather than throwing; keeps chat usable.
    // Changed (v0.1.4): Guarded numeric parsing against empty strings to avoid silent 0 writes from blank inputs.
    // Prior notes: Maintenance (v0.1.3, no semantic change): Added narrative about normalization while keeping parsing
    //   behavior identical; version metadata aligned to 0.1.3 banner.
    // Prior notes: Maintenance (v0.1.1.2, no semantic change): Added MECHSUITS v1.5.1 tracking metadata.
    // [GAMEASSIST:CORE:STATE] END
    // =============================================================================

    // ————— GameAssist CORE —————
    // =============================================================================
    // [GAMEASSIST:CORE:OBJECT] BEGIN
    // Section Title: GameAssist kernel object
    // -------------------------------------------------------------------------
    // mechsuit_section: { codename: "GAMEASSIST", area: "CORE:OBJECT", title: "Kernel",
    //   guarantees: ["Logging, explicit enqueue, dependency diagnostics, register/enable/disable, listener management", "Public standalone contracts can confirm dependencies when Roll20 script metadata is absent", "Module registration may explicitly retain durable runtime state across disable/enable transitions", "Failed dependency enable checks preserve the module's existing configured intent"],
    //   depends_on: ["[GAMEASSIST:POLICY]","[GAMEASSIST:APP:UTILS]","[GAMEASSIST:CORE:QUEUE]"],
    //   last_updated_version: "v0.1.4.7", lifecycle: "active" }
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
            preserveRuntimeOnDisable = false
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

        enableModule(name) {
            const mod = MODULES[name];
            if (!mod) {
                this.log('Core', `No such module: ${name}`, 'WARN');
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

        disableModule(name) {
            const mod = MODULES[name];
            if (!mod) {
                this.log('Core', `No such module: ${name}`, 'WARN');
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
            _transitioning[name] = true;

            _enqueue(() => {
                const m = MODULES[name];
                const finish = () => { delete _transitioning[name]; };
                if (!m) { finish(); return; }

                m.active = false;

                if (typeof m.teardown === 'function' && m.wired) {
                    try { m.teardown(); }
                    catch(e) { this.log(name, `Teardown failed: ${e.message}`, 'WARN'); }
                }

                const branch = getState(name);
                branch.config.enabled = false;
                if (!m.preserveRuntimeOnDisable) {
                    branch.runtime = {};
                }

                m.initialized = false;
                this._metrics.lastUpdate = isoNow();
                this.log(name, 'Disabled');
                recordMetric('toggle', { mod: name, note: 'disabled' });
                finish();
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
    // --- Notes & Comments ---
    // CHOICE: Expose globally under same name for console and other scripts.
    // CHOICE: Keep normal handlers direct and make serialized work an explicit GameAssist.enqueue call.
    // CHOICE: Runtime retention is registration-level opt-in; ALT: preserve every module runtime; REJECTED: existing modules use runtime as disposable cache state.
    // Changed (v0.1.4.7): Public TokenMod contract/API metadata can confirm the dependency when Roll20's internal script registry is unavailable.
    // Changed (v0.1.4.6): Refused enable attempts with confirmed missing dependencies preserve configured intent, and configured-but-inactive dependency skips can still be disabled through normal lifecycle commands.
    // Decision log:
    //   CHOICE: Leave config.enabled unchanged when dependency enablement is refused - ALT: force false; REJECTED: erased enabled intent and concealed dependency-skipped modules from status reporting.
    //   CHOICE: Treat a module as already disabled only when both config and runtime are disabled - ALT: runtime-only check; REJECTED: trapped dependency-skipped modules in the enabled configuration.
    // Prior notes:
    //   Changed (v0.1.4.5): Added preserveRuntimeOnDisable so modules with durable runtime-owned records can survive ordinary disable/enable transitions without changing the default cache-clearing lifecycle.
    //   Changed (v0.1.4.2): Added public opt-in enqueue and confirmed/missing/unverifiable dependency diagnostics without changing direct event execution.
    //   Maintenance (v0.1.4.1, no semantic change): Routed kernel timestamps through the shared wall-clock seam.
    //   Changed (v0.1.4): Hardened logging whisper formatting, adopted captured R20_ON, and added safer command matching.
    //   Maintenance (v0.1.3, no semantic change): Added kernel narrative to document invariants.
    //   Maintenance (v0.1.1.2, no semantic change): Updated MECHSUITS metadata; behavior untouched.
    // [GAMEASSIST:CORE:OBJECT] END
    // =============================================================================

    // --- Notes & Comments ---
    // Changed (v0.1.4.7): Advanced runtime VERSION for the standalone TokenMod/StatusInfo interoperability release; child service order is unchanged.
    // Changed (v0.1.4.6): Advanced runtime VERSION for the DM-readable status and troubleshooting release; child service order is unchanged.
    // Changed (v0.1.4.5): Advanced runtime VERSION for the NPC death-history bucket and handout release; child service order is unchanged.
    // Changed (v0.1.4.4): Advanced runtime VERSION for the DM-facing readability release; child service order is unchanged.
    // Prior notes:
    //   Changed (v0.1.4.3): Advanced runtime VERSION for standalone-interoperability stabilization; child service order is unchanged.
    //   Changed (v0.1.4.2): Advanced runtime VERSION for the diagnostic and migration-readiness release; child service order is unchanged.
    //   Changed (v0.1.4.1): Advanced runtime VERSION and linked inherited limits to POLICY; child service order is unchanged.
    //   Maintenance (v0.1.3, no semantic change): Added CORE wrapper to enclose kernel children and satisfy parent rules.
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
    //   guarantees: ["GM-gated admin commands; unsafe config keys refused; versioned config-only export; plain-language health summary with opt-in troubleshooting and standalone-integration details"],
    //   depends_on: ["[GAMEASSIST:POLICY]","[GAMEASSIST:CORE:STATE]","[GAMEASSIST:CORE:OBJECT]"],
    //   last_updated_version: "v0.1.4.7", lifecycle: "active" }
    // -------------------------------------------------------------------------
    // Narrative
    // INTERFACES:COMMANDS contains GM/admin chat commands for listing modules, toggling
    // config, exporting versioned configuration-only snapshots, and inspecting health.
    // The default status view prioritizes a DM's next action; --details preserves
    // session counters, queue state, timestamps, event-hook counts, dependency evidence,
    // and optional standalone TokenMod/StatusInfo evidence.
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
            ? `${parsed.toLocaleString()} (sandbox time)`
            : 'Time unavailable.';
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

        const moduleLines = [
            stopped.length
                ? `${running.length} of ${enabled.length} enabled modules are running; ${stopped.length} need attention.`
                : `${running.length} enabled module${running.length === 1 ? '' : 's'} running.`,
            `${disabled.length} module${disabled.length === 1 ? '' : 's'} turned off.`
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
            enabled,
            running,
            stopped,
            disabled,
            missing,
            unverifiable,
            skipped,
            errors,
            overall,
            moduleLines,
            dependencyLines,
            integrationLines: getStandaloneIntegrationLines(),
            avgDuration,
            listenerCount: Object.values(GameAssist._listeners).flat().length
        };
    }

    function sendStatusPanel(snapshot, detailed = false) {
        const fields = [
            `&{template:default} {{name=GameAssist ${VERSION} System Check}}`,
            statusField('Overall', snapshot.overall),
            statusField('Modules', snapshot.moduleLines),
            statusField('Errors This Sandbox Session', snapshot.errors
                ? `${snapshot.errors} error${snapshot.errors === 1 ? '' : 's'} recorded. Open Troubleshooting Details.`
                : 'None recorded.'),
            statusField('Dependency Check', snapshot.dependencyLines)
        ];

        if (detailed) {
            fields.push(
                statusField('Module Counts', `${snapshot.modules.length} registered | ${snapshot.enabled.length} enabled | ${snapshot.running.length} running | ${snapshot.skipped.length} dependency-skipped`),
                statusField('Session Activity', `${snapshot.metrics.commands} commands handled | ${snapshot.metrics.messages} chat messages observed | ${snapshot.errors} errors recorded`),
                statusField('Queue', `${_queue.length} waiting. Normal Roll20 events run directly; the queue is used only when a feature requests it.`),
                statusField('Average Queued Task Time', snapshot.avgDuration),
                statusField('Last Recorded Activity', formatStatusTimestamp(snapshot.metrics.lastUpdate)),
                statusField('GameAssist Event Hooks', `${snapshot.listenerCount} tracked internally. This is troubleshooting information, not a pass/fail test.`),
                statusField('Standalone Integrations', snapshot.integrationLines)
            );
        }

        const buttons = detailed
            ? [
                GameAssist.createButton('Refresh Details', '!ga-status --details'),
                GameAssist.createButton('Simple View', '!ga-status'),
                GameAssist.createButton('Module List', '!ga-config modules'),
                GameAssist.createButton('Metrics', '!ga-metrics')
            ]
            : [
                GameAssist.createButton('Troubleshooting Details', '!ga-status --details'),
                GameAssist.createButton('Module List', '!ga-config modules'),
                GameAssist.createButton('Open Settings', '!ga-config ui')
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
            const mod = parts[2];
            const [ key, ...rest ] = parts.slice(3).join(' ').split('=');
            const val = rest.join('=');
            const parsed = parseConfigValue(val);
            const BAD_KEYS = new Set(POLICY.config.unsafeKeys);
            if (!MODULES[mod] || MODULES[mod].internal) {
                GameAssist.log('Config', `Unknown module: ${mod}`, 'WARN');
                return;
            }
            const k = key.trim();
            if (BAD_KEYS.has(k)) {
                GameAssist.log('Config', `Refusing unsafe config key: ${k}`, 'WARN');
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
                GameAssist.log('Config', 'Usage: !ga-config get <module> [key]', 'WARN');
                return;
            }
            const mod = parts[2];
            if (!MODULES[mod] || MODULES[mod].internal) {
                GameAssist.log('Config', `Unknown module: ${mod}`, 'WARN');
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
            GameAssist.log('Config', `Modules:\n${moduleList}`);
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
            GameAssist.log('Config', 'Usage: !ga-config list|set|get|modules|cleanup [args]');
        }
    }, 'Core', { gmOnly: true });

    // ————— CONTROL COMMANDS —————
    GameAssist.onCommand('!ga-enable', msg => {
        const mod = msg.content.split(/\s+/)[1];
        if (!mod) {
            GameAssist.log('Core', 'Usage: !ga-enable <module>', 'WARN');
            return;
        }
        GameAssist.enableModule(mod);
    }, 'Core', { gmOnly: true });

    GameAssist.onCommand('!ga-disable', msg => {
        const mod = msg.content.split(/\s+/)[1];
        if (!mod) {
            GameAssist.log('Core', 'Usage: !ga-disable <module>', 'WARN');
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
    // CHOICE: Keep command syntax identical to legacy for drop‑in replacement.
    // CHOICE: Keep the default status action-oriented and place volatile counters behind --details — ALT: one exhaustive panel; REJECTED: the health signal became difficult for non-programmer DMs to find.
    // CHOICE: Send status navigation as a separate normal whisper — ALT: button-only default-template row; REJECTED: Roll20 live smoke testing omitted the row and every contained button.
    // Changed (v0.1.4.7): Troubleshooting details now report TokenMod and optional StatusInfo contract/version evidence without making StatusInfo a required dependency.
    // Changed (v0.1.4.6): Rebuilt !ga-status as a plain-language system check with explicit module/error/dependency guidance and an opt-in troubleshooting view; unavailable queue duration now renders without an ms suffix.
    // Changed (v0.1.4.6): Moved status navigation into a separate action strip so Troubleshooting Details, Module List, Open Settings, Simple View, and Metrics render in the Roll20 API sandbox.
    // Changed (v0.1.4.2): Added versioned configuration-only snapshots plus module/dependency health reporting.
    // Maintenance (v0.1.4.3, no semantic change): Replaced an editorial guarantee label with the specific health states reported.
    // CHOICE: Report dependency certainty instead of treating unavailable Roll20 script metadata as absence.
    // Decision log:
    //   CHOICE: export flags/global/module config in one snapshot — ALT: module-only export; REJECTED: incomplete recovery data.
    // Prior notes:
    //   Changed (v0.1.4.1): Ported the v0.1.5 complete config snapshot while retaining v0.1.4 key safety and enabled routing.
    //   Changed (v0.1.4): Refused unsafe keys, routed enabled toggles through lifecycle methods, and expanded get/modules output.
    //   Maintenance (v0.1.3, no semantic change): Added narrative describing GM/admin scope.
    //   Maintenance (v0.1.1.2, no semantic change): Updated MECHSUITS tracking fields only.
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
    //   guarantees: ["Bundled feature modules remain grouped and independently lifecycle-managed"],
    //   depends_on: ["[GAMEASSIST:CORE]","[GAMEASSIST:INTERFACES]"], last_updated_version: "v0.1.4.3" }
    // -------------------------------------------------------------------------
    // Narrative
    // MODULES encloses all shipped feature modules. Each child retains its own
    // guarantees and version signals; this wrapper documents grouping and
    // sequencing while child sections own their observable behavior.
    // -------------------------------------------------------------------------

    // ————— CONFIG UI MODULE v0.1.0 —————
    // =============================================================================
    // [GAMEASSIST:MODULES:CONFIGUI] BEGIN
    // Section Title: Config UI module
    // -------------------------------------------------------------------------
    // mechsuit_section: { codename: "GAMEASSIST", area: "MODULES:CONFIGUI", title: "Config UI",
    //   guarantees: ["GM chat menu for module toggles and quick config"],
    //   depends_on: ["[GAMEASSIST:POLICY]","[GAMEASSIST:INTERFACES:COMMANDS]"],
    //   last_updated_version: "v0.1.1.2",
    //   independent_versions: { module_version: "0.1.0" } }
    // -------------------------------------------------------------------------
    // Narrative
    // MODULES:CONFIGUI provides GM-facing chat controls to page through modules,
    // toggle enablement, and write configs without changing legacy defaults. It reuses
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
                .map(([key, val]) => `<span><strong>${_sanitize(key)}</strong>: ${_sanitize(formatValue(val))}</span>`);
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
            const toggleCmd  = enabled ? `!ga-disable ${name}` : `!ga-enable ${name}`;
            const toggleBtn  = GameAssist.createButton(`${enabled ? 'Disable' : 'Enable'} ${name}`, toggleCmd);
            const configButtons = buildConfigButtons(name, cfg);
            const summary = modState.config.showSummaries ? formatConfigSummary(cfg) : '';

            const rows = [
                `${statusIcon} <strong>${_sanitize(name)}</strong> — ${_sanitize(statusText)}`,
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

            const header = `<div><strong>🛠️ GameAssist Config UI</strong> <span style="font-size:smaller;">Page ${page + 1}/${totalPages}</span></div>`;
            const footer = '<div style="margin-top:4px; font-size:smaller;">Use !ga-config set &lt;Module&gt; key=value for advanced settings.</div>';
            const navLine = nav ? `<div style="margin-top:4px;">${nav}</div>` : '';

            const message = `${header}${blocks}${navLine}${footer}`;
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
    // CHOICE: Button helper reused; nav uses the same command path for refresh/paging.
    // Maintenance (v0.1.4.1, no semantic change): Routed the unchanged default page size through POLICY.
    // Prior notes:
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

    // ————— NPC MANAGER MODULE v1.1.1 —————
    // =============================================================================
    // [GAMEASSIST:MODULES:NPCMANAGER] BEGIN
    // Section Title: NPCManager module
    // -------------------------------------------------------------------------
    // mechsuit_section: { codename: "GAMEASSIST", area: "MODULES:NPCMANAGER", title: "NPCManager",
    //   guarantees: ["Auto toggle resolved configured dead marker based on known HP transitions; maintain hierarchical death-history handouts and curated arc rosters", "NPCHPRoller auto-roll initialization is not recorded as death/revival history", "Death-marker requests use verified standalone TokenMod interoperability"],
    //   depends_on: ["[GAMEASSIST:POLICY]","[GAMEASSIST:APP:UTILS]","[GAMEASSIST:CORE:OBJECT]"],
    //   last_updated_version: "v0.1.4.7",
    //   independent_versions: { module_version: "1.1.1" } }
    // -------------------------------------------------------------------------
    // Narrative
    // MODULES:NPCMANAGER monitors token HP changes to set or clear the configured
    // death marker through verified standalone TokenMod requests. New-token HP initialization
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
        const NPCMANAGER_MODULE_VERSION = '1.1.1';
        const initializingNpcHp = new Set();

        function currentSessionDateKey(raw = now()) {
            return new Date(raw).toISOString().slice(0, 10);
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
            return resolveMarkerId(modState.config.deadMarker || 'dead');
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
                ? `Revived ${entry.revivedTime || entry.revivedAt}`
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
                `<td>${htmlText(entry.time || entry.timestamp || 'time unknown')}</td>`,
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
                    return `<li><strong>${htmlText(entry.name)}</strong> | ${htmlText(entry.time || entry.timestamp || 'time unknown')}${source}${status}${note}</li>`;
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
                time: item.time || item.timestamp || 'time unknown',
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
                        'Audit compares linked NPC HP with the configured death marker. Player characters are excluded.',
                        GameAssist.createButton('Run Audit', '!npc-death-audit')
                    ]
                },
                {
                    label: 'Expert Shortcuts',
                    value: [
                        '!npc-death-report --scope campaign|chapter|section|session',
                        '!npc-wr = report writer',
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

        function renderAuditHandout(needsMarker, needsClear, invalid) {
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
                invalid.length
                    ? `<h3>Ignored Unlinked Items</h3><p>${htmlText(summarizeAuditNames(invalid, 20))}</p><p>Expected for party markers, scenery, labels, or props.</p>`
                    : '<h3>Ignored Unlinked Items</h3><p>None.</p>'
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

            return requestTokenModMarker(token, resolution.id, on, 'NPCManager');
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
            const isDead = tokenHasMarker(token, modState.config.deadMarker);

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

        GameAssist.onCommand('!npc-death-audit', msg => {
            prepareNPCManagerActivity();
            const pageId = Campaign().get('playerpageid');
            const tokens = findObjs({
                _pageid: pageId,
                _type: 'graphic',
                layer: 'objects'
            });

            const needsMarker = [];
            const needsClear = [];
            const invalid = [];
            for (let token of tokens) {
                const link = GameAssist.getLinkedCharacter(token);
                if (!link) {
                    invalid.push(token.get('name') || '(Unnamed)');
                    continue;
                }

                if (!getNPCContext(token, link)) continue;

                const hp = parseInt(token.get('bar1_value'), 10) || 0;
                const isDead = tokenHasMarker(token, modState.config.deadMarker);

                if (hp < 1 && !isDead) {
                    needsMarker.push({
                        name: token.get('name') || '(Unnamed)',
                        id: token.id,
                        hp,
                        markers: token.get('statusmarkers') || '(none)'
                    });
                } else if (hp >= 1 && isDead) {
                    needsClear.push({
                        name: token.get('name') || '(Unnamed)',
                        id: token.id,
                        hp,
                        markers: token.get('statusmarkers') || '(none)'
                    });
                }
            }

            const mismatchCount = needsMarker.length + needsClear.length;
            setHandoutNotes(AUDIT_HANDOUT_NAME, renderAuditHandout(needsMarker, needsClear, invalid));
            const fields = [
                {
                    label: 'Result',
                    value: mismatchCount
                        ? `⚠️ ${mismatchCount} linked NPC${mismatchCount === 1 ? '' : 's'} need death-marker attention.`
                        : '✅ No death-marker problems found for linked NPCs.'
                }
            ];

            if (needsMarker.length) {
                fields.push({
                    label: `Add Death Marker (${needsMarker.length})`,
                    value: formatAuditEntries(needsMarker)
                });
            }

            if (needsClear.length) {
                fields.push({
                    label: `Remove Death Marker (${needsClear.length})`,
                    value: formatAuditEntries(needsClear)
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
                        `Needs marker: ${needsMarker.length}`,
                        `Needs marker cleared: ${needsClear.length}`,
                        `Ignored unlinked: ${invalid.length}`
                    ]
                }
            );

            if (invalid.length) {
                fields.push({
                    label: `Ignored Unlinked (${invalid.length})`,
                    value: [
                        summarizeAuditNames(invalid),
                        'Expected for party markers, scenery, labels, or props.'
                    ]
                });
            }

            sendAuditReport(fields);
        }, 'NPCManager', { gmOnly: true });

        GameAssist.onEvent('add:graphic', handleTokenAdd, 'NPCManager');
        GameAssist.onEvent('change:graphic:bar1_value', handleTokenChange, 'NPCManager');
        GameAssist.log('NPCManager', `${NPCMANAGER_MODULE_VERSION} Ready: Auto death tracking + hierarchical reports/writer/audits/arcs`, 'INFO', { startup: true });
    }, {
        enabled: true,
        events: ['add:graphic', 'change:graphic:bar1_value'],
        prefixes: ['!npc-death-help', '!npc-death-report', '!npc-death-clear', '!npc-death-audit', '!npc-death-buckets', '!npc-death-write', '!npc-wr', '!npc-death-arc'],
        dependsOn: ['TokenMod'],
        preserveRuntimeOnDisable: true,
        teardown: () => {
            const branch = GameAssist.getState('NPCManager');
            const marker = branch?.config?.deadMarker || 'dead';
            const resolution = resolveMarkerId(marker);
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
            }).filter(token => tokenHasMarker(token, resolution.id));

            if (!targets.length) return;

            const requested = targets.filter(token =>
                requestTokenModMarker(token, resolution.id, false, 'NPCManager')
            ).length;

            if (requested) {
                GameAssist.log('NPCManager', `Requested removal of ${resolution.id} from ${requested} token(s) during teardown; results will be verified.`);
            }
        }
    });
    // --- Notes & Comments ---
    // CHOICE: TokenMod used for status marker ops; keep dependency explicit in README.
    // CHOICE: Arc rosters identify a creature by token before legacy character/name fallbacks — ALT: character-only identity; REJECTED: multiple NPC tokens may share one character sheet.
    // Changed (v0.1.4.7): Suppress placeholder HP transitions during NPCHPRoller auto-roll-on-add and require a known starting HP before recording an automatic death; this prevents false death/revival history when an NPC is added to the map.
    // Changed (v0.1.4.7): NPCManager module_version advanced to 1.1.1; marker add/remove/teardown now use TokenMod --api-as with delayed result verification and no longer claim teardown completion before confirmation.
    // Maintenance (v0.1.4.5, no semantic change): Removed the unused init-time Session default; live Session defaults continue to come from currentSessionDateKey().
    // Changed (v0.1.4.5): NPCManager module_version advanced from 0.1.1.0 to 1.0.0 for scoped bucket/handout management, then to 1.1.0 for Arc curation, hierarchical clearing, date-managed Sessions, and report writing.
    // Changed (v0.1.4.5): Explicit Session names now remain active across date changes; Reset Session Date re-enables automatic UTC date rollover.
    // Changed (v0.1.4.5): Revival history annotations no longer depend on successful TokenMod marker removal.
    // Changed (v0.1.4.5): Restored bounded, grouped token details to the death-audit chat panel while retaining the complete audit handout.
    // Changed (v0.1.4.5): NPCManager opts into runtime retention so disabling marker automation does not erase saved bucket history or Arc records.
    // Changed (v0.1.4.5): Open-death deduplication requires an exact token id so legacy name-only entries cannot suppress a different same-named NPC.
    // Changed (v0.1.4.5): Added !npc-death-help as the GM-facing start-here menu for bucket naming, reports, audits, and arc handouts.
    // Changed (v0.1.4.5): NPC death history now records into active Campaign/Chapter/Section/Session buckets independently of marker-write success, updates one handout per bucket, annotates revivals on matching entries, moves audit details into a handout, and adds manual arc buckets for selected linked PC/NPC tokens or current-session deaths.
    // Changed (v0.1.4.5): Renamed the arc command to !npc-death-arc and hardened migration, same-name token matching, scoped-clear duplicate prevention, zero-HP capture, and death-only revival annotations in arc handouts.
    // Changed (v0.1.4.4): NPC death-audit now sends a grouped GM report, states that PCs are excluded, categorizes marker mismatches by action, and caps detailed rows to keep Roll20 chat output usable.
    // Changed (v0.1.4.3): NPCManager now resolves configured death markers before TokenMod add/remove/teardown requests, matching shared read-side marker identity behavior.
    // Changed (v0.1.4.1): Use exact shared marker matching, POLICY-owned cache limits, and shared time seams.
    // Prior notes:
    //   Changed (v0.1.3): Hardened deathLog self-healing, timestamps, cap, and in-place clearing.
    //   Maintenance (v0.1.3, no semantic change): Added module narrative; preserved dependency and marker logic.
    //   Maintenance (v0.1.1.2, no semantic change): Metadata updated for MECHSUITS v1.5.1 alignment.
    // [GAMEASSIST:MODULES:NPCMANAGER] END
    // =============================================================================

    // ————— CONCENTRATION TRACKER MODULE v0.1.0.6 —————
    // =============================================================================
    // [GAMEASSIST:MODULES:CONCENTRATIONTRACKER] BEGIN
    // Section Title: ConcentrationTracker module
    // -------------------------------------------------------------------------
    // mechsuit_section: { codename: "GAMEASSIST", area: "MODULES:CONCENTRATIONTRACKER", title: "ConcentrationTracker",
    //   guarantees: ["Chat UI for concentration saves; exact configured-marker status reporting; verified standalone TokenMod marker requests"],
    //   depends_on: ["[GAMEASSIST:POLICY]","[GAMEASSIST:APP:UTILS]","[GAMEASSIST:CORE:OBJECT]"],
    //   last_updated_version: "v0.1.4.7",
    //   independent_versions: { module_version: "0.1.0.6" } }
    // -------------------------------------------------------------------------
    // Narrative
    // MODULES:CONCENTRATIONTRACKER manages concentration save rolls, whispering outcomes
    // and requesting the configured marker through standalone TokenMod with delayed
    // result verification. Status reads resolve custom marker
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
        return resolveMarkerId(getMarker());
    }

    function markerResolutionWarning(resolution) {
        const marker = _sanitize(resolution.requested || getMarker());
        const detail = resolution.registryError
            ? ` Roll20 marker registry problem: ${_sanitize(resolution.registryError)}.`
            : '';
        return `⚠️ Configured concentration marker "${marker}" could not be recognized.${detail}` +
            ` Run !token-mod --help-statusmarkers, then use !ga-config set ConcentrationTracker marker=<name-or-tag>.`;
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

        return requestTokenModMarker(token, resolution.id, on, 'ConcentrationTracker');
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
        }).filter(t => tokenHasMarker(t, resolution.id));
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
    dependsOn: ['TokenMod'],
    teardown: () => {
        const page = Campaign().get('playerpageid');
        const marker = (GameAssist.getState('ConcentrationTracker')?.config?.marker) || 'Concentrating';
        const resolution = resolveMarkerId(marker);
        if (!resolution.ok) {
            GameAssist.log(
                'ConcentrationTracker',
                `Teardown could not resolve configured marker "${marker}"; no markers were removed.`,
                'WARN'
            );
            return;
        }
        const targets = findObjs({ _type: 'graphic', _pageid: page, layer: 'objects' })
            .filter(t => tokenHasMarker(t, resolution.id));
        const requested = targets.filter(t =>
            requestTokenModMarker(t, resolution.id, false, 'ConcentrationTracker')
        ).length;
        if (requested) {
            GameAssist.log('ConcentrationTracker', `Requested concentration-marker removal from ${requested} token(s) during teardown; results will be verified.`);
        }
    }
    });
    // --- Notes & Comments ---
    // CHOICE: Keep lowercase parsing and aliases exactly as legacy; avoids user retraining.
    // Changed (v0.1.4.7): ConcentrationTracker module_version advanced to 0.1.0.6; marker add/remove/teardown now use TokenMod --api-as with delayed result verification while preserving TokenMod observer delivery to StatusInfo.
    // Changed (v0.1.4.3): Resolve configured custom marker names to stored tags for mutation/status/teardown and report unrecognized marker configuration.
    // Prior notes:
    //   Maintenance (v0.1.4.1, no semantic change): Routed lastDamage limits and timestamps through POLICY/shared time seams.
    //   Changed (v0.1.4): Exact marker matching and GM whisper special-casing honor configured marker ids.
    //   Maintenance (v0.1.3, no semantic change): Sanitized timestamps, deterministic pruning, and runtime normalization.
    //   Maintenance (v0.1.3, no semantic change): Added complete lastDamage schema defaults and post-toggle self-healing.
    //   Maintenance (v0.1.3, no semantic change): Added module narrative; behavior and aliases remained untouched.
    //   Maintenance (v0.1.1.2, no semantic change): Updated MECHSUITS metadata only.
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

    // ————— DEBUG TOOLS MODULE v0.1.0 —————
    // =============================================================================
    // [GAMEASSIST:MODULES:DEBUGTOOLS] BEGIN
    // Section Title: DebugTools module
    // -------------------------------------------------------------------------
    // mechsuit_section: { codename: "GAMEASSIST", area: "MODULES:DEBUGTOOLS", title: "DebugTools",
    //   guarantees: ["Dry-run friendly debugging helpers"],
    //   depends_on: ["[GAMEASSIST:APP:UTILS]","[GAMEASSIST:CORE:OBJECT]"],
    //   last_updated_version: "v0.1.4.1",
    //   independent_versions: { module_version: "0.1.0" } }
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
            const markers = (token.get('statusmarkers') || '').split(',').filter(Boolean);
            const hasMarker = tokenHasMarker(token, marker);
            let finalMarkers = markers.slice();
            let actionDesc;

            if (mode === 'on' || mode === 'add') {
                if (!hasMarker) finalMarkers.push(marker);
                actionDesc = `add ${marker}`;
            } else if (mode === 'off' || mode === 'remove' || mode === 'clear') {
                finalMarkers = markers.filter(m => normalizeMarkerId(m) !== normalizeMarkerId(marker));
                actionDesc = `remove ${marker}`;
            } else {
                if (hasMarker) finalMarkers = markers.filter(m => normalizeMarkerId(m) !== normalizeMarkerId(marker));
                else finalMarkers.push(marker);
                actionDesc = `${hasMarker ? 'remove' : 'add'} ${marker}`;
            }

            const name = _sanitize(token.get('name') || token.id);
            if (!wantsApply(args)) {
                GameAssist.log('DebugTools', `Dry run — would ${actionDesc} on ${name}. Add --apply to commit.`);
                return;
            }

            token.set('statusmarkers', finalMarkers.join(','));
            GameAssist.log('DebugTools', `Marker action: ${actionDesc} on ${name}.`);
            ensureDebugRuntime().lastAction = { type: 'marker', token: token.id, marker, mode };
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
        prefixes: ['!ga-debug']
    });
    // --- Notes & Comments ---
    // CHOICE: Helpers default to dry-run; --apply required for mutations.
    // Changed (v0.1.4.1): Marker diagnostics now use exact shared marker normalization, including counted markers.
    // Prior notes:
    //   Changed (v0.1.3): Ensured runtime self-heals before recording lastAction.
    //   Maintenance (v0.1.3, no semantic change): Kept dry-run defaults and disabled-by-default posture.
    //   Maintenance (v0.1.1.2, no semantic change): MECHSUITS metadata refreshed to v1.5.1.
    // [GAMEASSIST:MODULES:DEBUGTOOLS] END
    // =============================================================================

    // --- Notes & Comments ---
    // Changed (v0.1.4.3): Updated wrapper contract because marker-dependent modules now resolve configured marker identity before read/write operations.
    // Prior notes:
    //   Maintenance (v0.1.3, no semantic change): Added MODULES wrapper to group bundled features under a parent section for MECHSUITS parent/child compliance.
    // [GAMEASSIST:MODULES] END
    // =============================================================================

    // ————— BOOTSTRAP —————
    // =============================================================================
    // [GAMEASSIST:BOOTSTRAP] BEGIN
    // Section Title: Sandbox ready bootstrap
    // -------------------------------------------------------------------------
    // mechsuit_section: { codename: "GAMEASSIST", area: "BOOTSTRAP", title: "Bootstrap",
    //   guarantees: ["Repair known state, seed defaults, diagnose dependencies, preserve configured intent when dependencies prevent startup, init enabled modules"],
    //   depends_on: ["[GAMEASSIST:APP:UTILS]","[GAMEASSIST:CORE]","[GAMEASSIST:MODULES]"],
    //   last_updated_version: "v0.1.4.7", lifecycle: "active" }
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
                GameAssist.log('Core', `${name} skipped (missing dependencies: ${depInfo.missing.join(', ')})`, 'WARN');
                // DANGER: Do not set cfg.enabled=false here; that would erase configured intent and hide the startup failure from !ga-status.
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
    // CHOICE: Core ready log is never suppressed; mirrors README guidance.
    // CHOICE: Repair existing known branches before seeding defaults so valid configuration survives.
    // Changed (v0.1.4.7): Startup reports the v0.1.4.7 standalone-interoperability release; lifecycle order and dependency-skip behavior are unchanged.
    // Changed (v0.1.4.6): Check configured intent before dependency diagnostics and preserve enabled configuration when a confirmed missing dependency skips startup; this keeps deliberate disables quiet while making skipped modules visible to status reporting.
    // Decision log:
    //   CHOICE: Preserve cfg.enabled for dependency-skipped startup modules - ALT: force-disable config; REJECTED: erased DM intent and caused !ga-status to conceal the missing dependency.
    // Prior notes:
    //   Changed (v0.1.4.2): Repair known state before default seeding and report confirmed/missing/unverifiable dependencies during startup.
    //   Maintenance (v0.1.4.1, no semantic change): Routed bootstrap timestamps through the wall-clock seam; order unchanged.
    //   Maintenance (v0.1.3, no semantic change): Added bootstrap narrative; preserved ready flow and dependency checks.
    //   Maintenance (v0.1.1.2, no semantic change): MECHSUITS metadata fields refreshed for compliance.
    // [GAMEASSIST:BOOTSTRAP] END
    // =============================================================================

})();
