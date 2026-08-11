// =============================================================================
// Choreograph v1.0.0
// Last Updated: 2026-07-04
// Author: Kenan Millet
//
// Description:
//   Meta-sequencer for Roll20 tokens. Define scenes in handouts — filter
//   tokens, compute per-token timing, and fire commands at the right moments.
//
// Dependencies: SelectManager
//
// Commands:
//   !choreograph run <name> [flags]     Execute a scene
//   !choreograph new <name>             Create blank scene handout
//   !choreograph list                   List all scenes
//   !choreograph edit <name>            Open scene handout
//   !choreograph delete <name> [--force] Delete a scene
//   !choreograph stop [name]            Stop running scene(s)
//   !choreograph refresh <name>         Regenerate handout from cache
// =============================================================================

/* global state, on, sendChat, getObj, createObj, findObjs, Campaign,
          playerIsGM, log, _, setInterval, clearInterval, setTimeout, Date,
          spawnFx, spawnFxBetweenPoints */

var Choreograph = Choreograph || (() => {
    'use strict';

    const SCRIPT_NAME    = 'Choreograph';
    const SCRIPT_VERSION = '1.0.0';
    const CMD_TOKEN      = '!choreograph';

    // =========================================================================
    // State helpers
    // =========================================================================

    const s = () => state[SCRIPT_NAME];

    // =========================================================================
    // Extension API Registries
    // =========================================================================

    const EXT_FUNCTIONS      = {}; // { 'namespace/name': { name, namespace, fn, description, args, returns, pure } }
    const EXT_TOKEN_VARS     = {}; // { 'namespace/name': { name, namespace, fn, description } }
    const EXT_CONSTANTS      = {}; // { 'namespace/name': { name, namespace, value, description, type } }
    const EXT_PARAM_TYPES    = {}; // { 'typeName': { name, description, parse, validate } }
    const EXT_LIFECYCLE      = []; // [{ source, commands: [RegExp], start, stop, pause, resume }]
    const EXT_SYNC           = []; // [{ source, commands: [RegExp], waiting: fn }]

    // Schedule help handout regeneration after extensions register
    const scheduleHandoutRegen = () => {
        if (typeof ScriptKit === 'undefined') return;
        ScriptKit.updateHandout(SCRIPT_NAME, 'usr');
    };

    const validIdent = (s) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(s);

    const registerFunction = (sourceId, struct) => {
        const src = sourceId || SCRIPT_NAME;
        const { name, namespace = 'core', fn } = struct;
        if (!name || !validIdent(name)) {
            log(`${SCRIPT_NAME}: [${src}] registerFunction — invalid name "${name}"`);
            return false;
        }
        if (typeof fn !== 'function') {
            log(`${SCRIPT_NAME}: [${src}] registerFunction — "${name}" missing fn`);
            return false;
        }
        const key = `${namespace}/${name}`;
        if (EXT_FUNCTIONS[key]) {
            const existing = EXT_FUNCTIONS[key].source || SCRIPT_NAME;
            if (existing !== src) log(`${SCRIPT_NAME}: [${src}] registerFunction — "${name}" already registered by [${existing}]`);
            return false;
        }
        EXT_FUNCTIONS[key] = Object.assign({ namespace, source: src, pure: true, description: '', args: [], returns: 'any', examples: [] }, struct);
        scheduleHandoutRegen();
        return true;
    };

    const registerTokenVariable = (sourceId, struct) => {
        const src = sourceId || SCRIPT_NAME;
        const { name, namespace = 'core', fn } = struct;
        if (!name || !validIdent(name)) {
            log(`${SCRIPT_NAME}: [${src}] registerTokenVariable — invalid name "${name}"`);
            return false;
        }
        if (typeof fn !== 'function') {
            log(`${SCRIPT_NAME}: [${src}] registerTokenVariable — "${name}" missing fn`);
            return false;
        }
        const key = `${namespace}/${name}`;
        if (EXT_TOKEN_VARS[key]) {
            const existing = EXT_TOKEN_VARS[key].source || SCRIPT_NAME;
            if (existing !== src) log(`${SCRIPT_NAME}: [${src}] registerTokenVariable — "${name}" already registered by [${existing}]`);
            return false;
        }
        EXT_TOKEN_VARS[key] = Object.assign({ namespace, source: src, description: '' }, struct);
        scheduleHandoutRegen();
        return true;
    };

    const registerParameterType = (sourceId, struct) => {
        const src = sourceId || SCRIPT_NAME;
        const { name, parse } = struct;
        if (!name) {
            log(`${SCRIPT_NAME}: [${src}] registerParameterType — missing name`);
            return false;
        }
        if (typeof parse !== 'function') {
            log(`${SCRIPT_NAME}: [${src}] registerParameterType — "${name}" missing parse`);
            return false;
        }
        if (EXT_PARAM_TYPES[name]) {
            const existing = EXT_PARAM_TYPES[name].source || SCRIPT_NAME;
            if (existing !== src) log(`${SCRIPT_NAME}: [${src}] registerParameterType — "${name}" already registered by [${existing}]`);
            return false;
        }
        EXT_PARAM_TYPES[name] = Object.assign({ source: src, description: '', validate: null }, struct);
        scheduleHandoutRegen();
        return true;
    };

    const registerConstant = (sourceId, struct) => {
        const src = sourceId || SCRIPT_NAME;
        const { name, namespace = 'core', value } = struct;
        if (!name || !validIdent(name)) {
            log(`${SCRIPT_NAME}: [${src}] registerConstant — invalid name "${name}"`);
            return false;
        }
        if (value === undefined) {
            log(`${SCRIPT_NAME}: [${src}] registerConstant — "${name}" missing value`);
            return false;
        }
        const key = `${namespace}/${name}`;
        if (EXT_CONSTANTS[key]) {
            const existing = EXT_CONSTANTS[key].source || SCRIPT_NAME;
            if (existing !== src) log(`${SCRIPT_NAME}: [${src}] registerConstant — "${name}" already registered by [${existing}]`);
            return false;
        }
        EXT_CONSTANTS[key] = Object.assign({ namespace, source: src, description: '', type: typeof value }, struct);
        scheduleHandoutRegen();
        return true;
    };

    const registerLifecycleHook = (sourceId, struct) => {
        const src = sourceId || SCRIPT_NAME;
        if (!struct.commands || !Array.isArray(struct.commands)) {
            log(`${SCRIPT_NAME}: [${src}] registerLifecycleHook — missing commands array`);
            return false;
        }
        // Prevent duplicate registration from same source
        if (EXT_LIFECYCLE.some(h => h.source === src)) return false;
        EXT_LIFECYCLE.push(Object.assign({ source: src, start: null, stop: null, pause: null, resume: null }, struct));
        return true;
    };

    const buildHookContext = (instance, entry) => ({
        type: 'api',
        content: entry.command,
        who: instance.who || 'gm',
        playerid: instance.playerid || 'API',
        selected: (entry.tokens || []).map(t => ({ _id: t.get('id'), _type: 'graphic' })),
        sceneInfo: {
            instanceId: instance.id,
            sceneName: instance.name,
            instanceName: instance.instanceName,
        },
    });

    const fireLifecycleHooks = (event, instance) => {
        const firedCommands = instance.firedCommands || [];
        EXT_LIFECYCLE.forEach(hook => {
            const fn = hook[event];
            if (typeof fn !== 'function') return;
            firedCommands.forEach(entry => {
                const matches = hook.commands.some(rx => rx.test(entry.command));
                if (!matches) return;
                fn(buildHookContext(instance, entry));
            });
        });
    };

    const registerSyncParticipant = (sourceId, struct) => {
        const src = sourceId || SCRIPT_NAME;
        if (typeof struct.waiting !== 'function') {
            log(`${SCRIPT_NAME}: [${src}] registerSyncParticipant — missing waiting function`);
            return false;
        }
        if (!struct.commands || !Array.isArray(struct.commands)) {
            log(`${SCRIPT_NAME}: [${src}] registerSyncParticipant — missing commands array`);
            return false;
        }
        // Prevent duplicate registration from same source
        if (EXT_SYNC.some(p => p.source === src)) return false;
        EXT_SYNC.push(Object.assign({ source: src }, struct));
        return true;
    };

    /**
     * Fire sync — calls all registered sync participants and invokes onResolved
     * when all have called done() or timeout expires.
     */
    const fireSync = (instance, onResolved, timeoutMs) => {
        const allEntries = (instance.firedCommands || []).map(entry => buildHookContext(instance, entry));
        const sceneInfo = {
            instanceId: instance.id,
            sceneName: instance.name,
            instanceName: instance.instanceName,
        };

        // Build filtered context per participant; skip those with no matching entries
        const participants = [];
        EXT_SYNC.forEach(p => {
            const filtered = allEntries.filter(e => p.commands.some(rx => rx.test(e.content)));
            if (filtered.length > 0) participants.push({ participant: p, entries: filtered });
        });

        if (participants.length === 0) { onResolved(); return; }

        let remaining = participants.length;
        let resolved = false;

        const checkDone = () => {
            if (resolved) return;
            remaining--;
            if (remaining <= 0) {
                resolved = true;
                onResolved();
            }
        };

        const timeout = setTimeout(() => {
            if (!resolved) {
                resolved = true;
                log(`${SCRIPT_NAME}: sync timeout (${timeoutMs}ms) — proceeding`);
                onResolved();
            }
        }, timeoutMs || 30000);

        participants.forEach(({ participant, entries }) => {
            let called = false;
            participant.waiting({
                entries,
                sceneInfo,
                done: () => {
                    if (called) return;
                    called = true;
                    checkDone();
                    if (resolved) clearTimeout(timeout);
                },
            });
        });
    };

    /**
     * Register an example scene that can be generated via !choreograph example <name>.
     * @param {string} sourceId - registering script name
     * @param {object} struct - { name, description, scene }
     *   scene: { notes, params, variables, rows } (same shape as parseScene output)
     */



    const generateExtensionHandout = (sourceId, opts = {}) => {
        const src = sourceId || SCRIPT_NAME;
        const { name = src, description = '', sections = [] } = opts;
        const handoutName = `Help: ${SCRIPT_NAME}/${name}`;
        let hh = findObjs({ type: 'handout', name: handoutName })[0];
        if (!hh) {
            hh = createObj('handout', {
                name:             handoutName,
                archived:         false,
            });
        }

        let html = `<h1>${name}</h1>`;
        if (description) html += `<p>${description}</p>`;

        const fmtFn = (r) => {
            const argList = (r.args || []).map(a => a.name).join(', ');
            const ns = r.namespace === 'core' ? '' : `<b>${r.namespace}.</b>`;
            return `<p><b>${ns}${r.name}(${argList})</b> → <i>${r.returns || 'any'}</i><br>${r.description || ''}</p>`;
        };

        sections.forEach(section => {
            const ns = section.namespace;
            html += `<h2>${ns}</h2>`;
            if (section.description) html += `<p>${section.description}</p>`;

            const fns = Object.values(EXT_FUNCTIONS).filter(r => r.namespace === ns);
            const vars = Object.values(EXT_TOKEN_VARS).filter(r => r.namespace === ns);
            const consts = Object.values(EXT_CONSTANTS).filter(r => r.namespace === ns);

            if (fns.length) {
                html += `<h3>Functions</h3>`;
                fns.forEach(r => { html += fmtFn(r); });
            }
            if (vars.length) {
                html += `<h3>Token Variables</h3>`;
                vars.forEach(r => { html += `<p><b>${r.name}</b> — ${r.description || ''}</p>`; });
            }
            if (consts.length) {
                html += `<h3>Constants</h3>`;
                consts.forEach(r => { html += `<p><b>${r.name}</b> = <code>${r.value}</code> — ${r.description || ''}</p>`; });
            }
        });

        hh.set('notes', html);
        log(`${SCRIPT_NAME}: generated help handout "${handoutName}"`);
    };

    // =========================================================================
    // Chat helpers
    // =========================================================================

    const getPlayerName = (playerid) => {
        if (!playerid || playerid === 'API') return 'gm';
        const player = getObj('player', playerid);
        return player ? player.get('_displayname') : 'gm';
    };

    const reply = (msg, tag, text, noarchive = false) => {
        const body      = text !== undefined ? text : tag;
        const prefix    = text !== undefined ? ` [${tag}]` : '';
        const recipient = getPlayerName(msg.playerid);
        sendChat(`${SCRIPT_NAME}${prefix}`, `/w "${recipient}" ${body}`,
            null, noarchive ? { noarchive: true } : undefined);
    };

    const replyError = (msg, text) => reply(msg, 'Error', text);

    // CSV-style array parser: splits on commas, respects double-quoted segments
    const parseCSV = (str) => {
        if (!str) return [];
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < str.length; i++) {
            const ch = str[i];
            if (ch === '"' && (i === 0 || str[i - 1] !== '\\')) {
                inQuotes = !inQuotes;
            } else if (ch === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += ch;
            }
        }
        result.push(current.trim());
        return result.filter(s => s.length > 0);
    };

    const escHtml = (str) => String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    // =========================================================================
    // Handout helpers
    // =========================================================================

    const HandoutRegex = /^\[([^\]]+)\] (.+)$/;

    class HandoutCache {
        constructor(tag, parser) {
            this.tag = tag;
            this.parser = parser;
            this.cache = {};
        }

        static handoutTag = (tag) => `[${tag}]`;
        static handoutNametag = (tag, name) => `${HandoutCache.handoutTag(tag)} ${name}`;
        static getHandoutTagAndName = (nametag) => {
            const match = nametag.match(HandoutRegex);
            return match ? [match[1], match[2]] : [null, null];
        };

        handoutName = (nametag) => {
            const handoutTag = HandoutCache.handoutTag(this.tag);
            if (!nametag || !nametag.startsWith(handoutTag)) return null;
            return nametag.slice(handoutTag.length).trim();
        };

        find = (name) => {
            const results = findObjs({ _type: 'handout', name: `${HandoutCache.handoutNametag(this.tag, name)}` });
            return results.length > 0 ? results[0] : undefined;
        };

        findAll = () => findObjs({ _type: 'handout' }).filter(h => h.get('name').startsWith(HandoutCache.handoutTag(this.tag)));

        getOrCreate = (name) => {
            const existing = this.find(name);
            if (existing) return existing;
            return createObj('handout', {
                name:             HandoutCache.handoutNametag(this.tag, name),
                archived:         false,
            });
        };

        load = (name, callback) => {
            if (this.cache[name]) { callback(this.cache[name]); return; }
            const handout = this.find(name);
            if (!handout) { callback(null); return; }
            getHandoutNotes(handout, (html) => {
                if (!html) { callback(null); return; }
                const result = this.parser(name, html);
                this.cache[name] = result;
                callback(result);
            });
        };
    }

    const handoutCache = {};

    const addHandoutCache = (tag, parser) => {
        handoutCache[tag] = new HandoutCache(tag, parser);
    };

    const getHandoutNotes = (handout, callback) => {
        handout.get('notes', (notes) => callback(notes || ''));
    };

    const setHandoutNotes = (handout, html) => {
        handout.set('notes', html);
    };

    // =========================================================================
    // Scene System
    // =========================================================================

    const STYLE = {
        btn: 'display:inline-block;margin:2px;padding:2px 8px;background:#444;color:#fff;'
             + 'border-radius:3px;text-decoration:none;font-size:11px;',
        th:  'background:#222;color:#fff;padding:3px 6px;border:1px solid #555;white-space:nowrap;',
        td:  'padding:2px 5px;border:1px solid #ccc;',
    };

    const btnHtml = (label, cmd) => {
        const href = cmd.startsWith('!') ? cmd : `!${cmd}`;
        return `<a href="${href}" style="${STYLE.btn}">${escHtml(label)}</a>`;
    };

    const generateSceneHtml = (name, scene) => {
        let html = '';

        // Metadata
        html += `<div style="font-family:monospace;font-size:12px;margin-bottom:8px;">`;
        html += `<b>Notes:</b> ${escHtml(scene.notes || '')}<br>`;
        html += `</div>`;

        // Action buttons
        html += `<div style="margin-bottom:8px;">`;
        html += btnHtml('▶ Run',    `${CMD_TOKEN} run ${name}`);
        html += btnHtml('+ Row',    `${CMD_TOKEN} add-row ${name}`);
        html += btnHtml('Refresh',  `${CMD_TOKEN} refresh ${name}`);
        html += btnHtml('🔍 Dump',  `${CMD_TOKEN} dump-html ${name}`);
        html += btnHtml('⚠ Delete', `${CMD_TOKEN} delete ${name}`);
        html += `</div>`;

        // Parameter table
        html += `<table style="border-collapse:collapse;width:100%;font-size:12px;margin-bottom:8px;">`;
        html += `<tr><th style="${STYLE.th}">Name</th>`;
        html += `<th style="${STYLE.th}">Type</th>`;
        html += `<th style="${STYLE.th}">Default</th>`;
        html += `<th style="${STYLE.th}">Description</th></tr>`;
        (scene.params || []).forEach(p => {
            html += `<tr><td style="${STYLE.td}">${escHtml(p.name)}</td>`;
            html += `<td style="${STYLE.td}">${escHtml(p.type)}</td>`;
            html += `<td style="${STYLE.td}">${escHtml(p.default || '')}</td>`;
            html += `<td style="${STYLE.td}">${escHtml(p.description)}</td></tr>`;
        });
        html += `</table>`;

        // Variables table
        html += `<table style="border-collapse:collapse;width:100%;font-size:12px;margin-bottom:8px;">`;
        html += `<tr><th style="${STYLE.th}">Variable</th>`;
        html += `<th style="${STYLE.th}">Expression</th></tr>`;
        (scene.variables || []).forEach(v => {
            html += `<tr><td style="${STYLE.td}">${escHtml(v.name)}</td>`;
            html += `<td style="${STYLE.td}">${escHtml(v.expression)}</td></tr>`;
        });
        html += `</table>`;

        // Roles table
        if (scene.roles && scene.roles.length > 0) {
            html += `<table style="border-collapse:collapse;width:100%;font-size:12px;margin-bottom:8px;">`;
            html += `<tr><th style="${STYLE.th}">Role</th>`;
            html += `<th style="${STYLE.th}">Min</th>`;
            html += `<th style="${STYLE.th}">Max</th></tr>`;
            scene.roles.forEach(r => {
                html += `<tr><td style="${STYLE.td}">${escHtml(r.name)}</td>`;
                html += `<td style="${STYLE.td}">${r.min != null ? r.min : ''}</td>`;
                html += `<td style="${STYLE.td}">${r.max != null ? r.max : ''}</td></tr>`;
            });
            html += `</table>`;
        }

        // Scene table
        html += `<table style="border-collapse:collapse;width:100%;font-size:12px;">`;
        html += `<tr><th style="${STYLE.th}">Filter</th>`;
        html += `<th style="${STYLE.th}">Delay (ms)</th>`;
        html += `<th style="${STYLE.th}">When</th>`;
        html += `<th style="${STYLE.th}">Command</th>`;
        html += `<th style="${STYLE.th}">Notes</th></tr>`;
        (scene.rows || []).forEach(row => {
            html += `<tr><td style="${STYLE.td}">${escHtml(row.filter)}</td>`;
            html += `<td style="${STYLE.td}">${escHtml(row.delay)}</td>`;
            html += `<td style="${STYLE.td}">${escHtml(row.when || '')}</td>`;
            html += `<td style="${STYLE.td}">${escHtml((row.commands || [row.command]).join('\n'))}</td>`;
            html += `<td style="${STYLE.td}">${escHtml(row.notes)}</td></tr>`;
        });
        html += `</table>`;

        return html;
    };

    const generateBlankScene = (name) => {
        const scene = {
            name,
            notes: '',
            params: [
                { name: 'cast', type: 'token[]', default: 'selected', description: 'Tokens to run the scene on (built-in)' },
            ],
            rows: [
                { filter: '*', delay: '0', commands: [], notes: 'Example row — add your command here' },
            ],
        };
        return generateSceneHtml(name, scene);
    };

    // =========================================================================
    // Scene Handout parser
    // =========================================================================

    /**
     * Parse a scene handout's HTML into a scene object.
     * Returns { name, notes, params, rows } or null on failure.
     *
     * params: [{ name, type, default, description }]
     * rows:   [{ filter, delay, command, notes }]
     */
    const parseScene = (name, html) => {
        const decode = (s) => String(s)
            .replace(/&amp;/g,  '&')
            .replace(/&lt;/g,   '<')
            .replace(/&gt;/g,   '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g,  "'")
            .replace(/&nbsp;/g, ' ');

        const body = decode(html)
            .replace(/<\/?p[^>]*>/gi, '\n')
            .replace(/<br[^>]*>/gi,   '\n')
            .replace(/\r\n/g, '\n');

        const stripTags = (s) => String(s).replace(/<[^>]+>/g, '').trim();

        // Parse metadata
        const scene = { name, notes: '', params: [], rows: [], variables: [] };

        const metaVal = (label) => {
            const re = new RegExp(label + '[^<]*(?:<[^>]+>)?\\s*([^<\\n]+)', 'i');
            const m  = body.match(re);
            return m ? stripTags(m[1]).trim() : null;
        };
        const notesVal = metaVal('Notes');
        if (notesVal) scene.notes = notesVal;

        // Parse tables
        const tableRe = /<table[^>]*>([\s\S]*?)<\/table>/gi;
        const tables = [];
        let tableMatch;
        while ((tableMatch = tableRe.exec(body)) !== null) {
            tables.push(tableMatch[1]);
        }

        // Identify tables by headers
        tables.forEach(tableHtml => {
            const headerMatch = tableHtml.match(/<tr[^>]*>([\s\S]*?)<\/tr>/i);
            if (!headerMatch) return;
            const headerHtml = headerMatch[1];
            const headers = [];
            const thRe = /<th[^>]*>([\s\S]*?)<\/th>/gi;
            let thMatch;
            while ((thMatch = thRe.exec(headerHtml)) !== null) {
                headers.push(stripTags(thMatch[1]).toLowerCase());
            }

            const isParamTable = headers.includes('name') && headers.includes('type');
            const isSceneTable = headers.includes('filter') && headers.some(h => h.startsWith('delay'));
            const isVarTable   = headers.includes('variable') && headers.includes('expression');
            const isRoleTable  = headers.includes('role') && headers.includes('min');

            // Parse rows
            const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
            rowRe.exec(tableHtml); // skip header row
            let rowMatch;
            while ((rowMatch = rowRe.exec(tableHtml)) !== null) {
                const cells = [];
                const rawCells = [];
                const tdRe = /<td[^>]*>([\s\S]*?)<\/td>/gi;
                let tdMatch;
                while ((tdMatch = tdRe.exec(rowMatch[1])) !== null) {
                    cells.push(stripTags(tdMatch[1]));
                    rawCells.push(tdMatch[1]);
                }

                if (isParamTable && cells.length >= 2) {
                    scene.params.push({
                        name:        cells[0] || '',
                        type:        cells[1] || 'text',
                        default:     cells[2] || null,
                        description: cells[3] || '',
                    });
                } else if (isVarTable && cells.length >= 2) {
                    scene.variables.push({
                        name:       cells[0] || '',
                        expression: cells[1] || '',
                    });
                } else if (isSceneTable && cells.length >= 2) {
                    // Detect column layout by headers
                    const whenIdx = headers.indexOf('when');
                    const cmdIdx = whenIdx >= 0 ? whenIdx + 1 : 2;
                    const notesIdx = cmdIdx + 1;
                    // Parse command cell: split on <p> boundaries for multi-command cells
                    const rawCmd = rawCells[cmdIdx] || '';
                    const commands = rawCmd
                        .replace(/<\/p>\s*<p[^>]*>/gi, '\n')
                        .replace(/<\/?p[^>]*>/gi, '')
                        .replace(/<br[^>]*>/gi, '\n')
                        .replace(/<[^>]+>/g, '')
                        .split('\n')
                        .map(s => s.trim())
                        .filter(Boolean);
                    const row = {
                        filter:   cells[0] || '',
                        delay:    cells[1] || '0',
                        commands: commands,
                        notes:    cells[notesIdx] || '',
                    };
                    if (whenIdx >= 0 && cells[whenIdx]) row.when = cells[whenIdx];
                    scene.rows.push(row);
                } else if (isRoleTable && cells.length >= 1) {
                    const role = { name: cells[0] || '' };
                    if (cells[1]) role.min = parseInt(cells[1], 10) || undefined;
                    if (cells[2]) role.max = parseInt(cells[2], 10) || undefined;
                    if (!scene.roles) scene.roles = [];
                    scene.roles.push(role);
                }
            }
        });

        // Ensure cast param exists
        if (!scene.params.find(p => p.name === 'cast')) {
            scene.params.unshift({
                name: 'cast', type: 'token[]', default: 'selected',
                description: 'Tokens to run the scene on (built-in)',
            });
        }

        return scene;
    };

    const sceneHandoutTag = 'Scene';
    const scenes = () => handoutCache[sceneHandoutTag];

    // =========================================================================
    // Cast System
    // =========================================================================

    const castHandoutTag = 'Cast';
    const casts = () => handoutCache[castHandoutTag];

    /**
     * Parse a cast handout into { roles: { roleName: [tokenId, ...] } }
     * Format:
     *   role1: -id1, -id2, -id3
     *   role2: -id4
     *   -id5, -id6          (no role — stored under '')
     */
    const parseCast = (name, html) => {
        const decode = (s) => String(s)
            .replace(/&amp;/g, '&').replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>').replace(/&quot;/g, '"')
            .replace(/&nbsp;/g, ' ');

        const text = decode(html)
            .replace(/<\/?p[^>]*>/gi, '\n')
            .replace(/<br[^>]*>/gi, '\n')
            .replace(/<[^>]+>/g, '')
            .replace(/\r\n/g, '\n');

        const roles = {};
        text.split('\n').forEach(line => {
            line = line.trim();
            if (!line) return;
            const colonIdx = line.indexOf(':');
            let role = '';
            let idsStr = line;
            if (colonIdx !== -1) {
                const beforeColon = line.slice(0, colonIdx).trim();
                // Only treat as role if the part before colon doesn't look like an ID
                if (!/^-[A-Za-z0-9_-]+$/.test(beforeColon)) {
                    role = beforeColon;
                    idsStr = line.slice(colonIdx + 1);
                }
            }
            const ids = idsStr.split(',')
                .map(s => s.trim())
                .filter(s => /^-[A-Za-z0-9_-]+$/.test(s));
            if (ids.length === 0) return;
            if (!roles[role]) roles[role] = [];
            roles[role].push(...ids);
        });
        return { roles };
    };

    /**
     * Generate cast handout HTML from a roles object.
     */
    const generateCastHtml = (name, roles) => {
        let html = `<div style="font-family:monospace;font-size:12px;">`;
        Object.entries(roles).forEach(([role, ids]) => {
            if (role) {
                html += `<b>${escHtml(role)}:</b> ${ids.join(', ')}<br>`;
            } else {
                html += `${ids.join(', ')}<br>`;
            }
        });
        html += `</div>`;
        return html;
    };

    /**
     * Get all token IDs from a cast (all roles combined).
     */
    const getAllCastIds = (cast) => {
        const ids = [];
        Object.values(cast.roles).forEach(roleIds => ids.push(...roleIds));
        return [...new Set(ids)];
    };

    /**
     * Get token IDs for a specific role.
     */
    const getCastRoleIds = (cast, role) => cast.roles[role] || [];

    // Register handout caches (after parsers are defined)
    addHandoutCache(sceneHandoutTag, parseScene);
    addHandoutCache(castHandoutTag, parseCast);

    // =========================================================================
    // Running scenes
    // =========================================================================

    // { instanceId: { id, name, queue, timers, cast, params, state, startTime, firedCommands, remaining } }
    const runningScenes = {};

    let instanceCounter = 0;
    const genInstanceId = () => `${SCRIPT_NAME}-${++instanceCounter}-${Date.now()}`;

    // Human-readable instance names
    const adjectives = ['swift','bold','red','blue','dark','bright','wild','calm','iron','silver'];
    const nouns = ['wolf','hawk','storm','flame','wave','frost','shadow','tide','spark','wind'];
    const genInstanceName = () => {
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        return `${adj}-${noun}-${instanceCounter}`;
    };

    const stopScene = (instanceId) => {
        const instance = runningScenes[instanceId];
        if (!instance) return;
        (instance.timers || []).forEach(t => clearTimeout(t));
        fireLifecycleHooks('stop', instance);
        delete runningScenes[instanceId];
    };

    const pauseScene = (instanceId) => {
        const instance = runningScenes[instanceId];
        if (!instance || instance.state === 'paused') return;
        // Clear pending timers and save remaining queue entries with adjusted times
        (instance.timers || []).forEach(t => clearTimeout(t));
        instance.timers = [];
        const elapsed = Date.now() - instance.startTime;
        instance.remaining = (instance.remaining || instance.queue)
            .filter(entry => entry.time > elapsed)
            .map(entry => Object.assign({}, entry, { time: entry.time - elapsed }));
        instance.pausedAt = Date.now();
        instance.state = 'paused';
        fireLifecycleHooks('pause', instance);
    };

    const resumeScene = (instanceId, msg) => {
        const instance = runningScenes[instanceId];
        if (!instance || instance.state !== 'paused') return;
        instance.state = 'running';
        instance.startTime = Date.now();
        const sender = getPlayerName(msg && msg.playerid);
        // Re-schedule remaining entries
        let i = 0;
        const queue = instance.remaining || [];
        while (i < queue.length) {
            const batchTime = queue[i].time;
            const batch = [];
            while (i < queue.length && queue[i].time === batchTime) {
                batch.push(queue[i]);
                i++;
            }
            const timer = setTimeout(() => {
                const byCommand = {};
                batch.forEach(entry => {
                    if (!byCommand[entry.command]) byCommand[entry.command] = [];
                    byCommand[entry.command].push(entry.tokenId);
                });
                dispatchCommands(byCommand, instance, sender);
            }, batchTime);
            instance.timers.push(timer);
        }
        instance.remaining = null;
        fireLifecycleHooks('resume', instance);
    };

    const stopAll = () => {
        Object.keys(runningScenes).forEach(stopScene);
    };

    // =========================================================================
    // Filter evaluation
    // =========================================================================

    /**
     * Evaluate a single filter condition against a token.
     * Returns true if token matches.
     */
    const evalFilterCondition = (condition, token, castData, scope) => {
        const c = condition.trim();
        if (!c || c === '*') return true;

        // Negation
        if (c.startsWith('!')) {
            return !evalFilterCondition(c.slice(1), token, castData, scope);
        }

        // key=value patterns
        const eqIdx = c.indexOf('=');
        if (eqIdx !== -1) {
            const key = c.slice(0, eqIdx).toLowerCase();
            const raw = c.slice(eqIdx + 1);
            const val = (raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))
                ? raw.slice(1, -1) : raw;

            if (key === 'layer') return token.get('layer') === val;
            if (key === 'id')    return token.get('id') === val;
            if (key === 'status' || key === 'statusmarkers') {
                const markers = (token.get('statusmarkers') || '').split(',');
                return markers.includes(val);
            }
            if (key === 'name') {
                const name = token.get('name') || '';
                if (val.includes('*')) {
                    const re = new RegExp('^' + val.replace(/\*/g, '.*') + '$', 'i');
                    return re.test(name);
                }
                return name === val;
            }
            if (key === 'role') {
                if (!castData) return false;
                const roleIds = castData.roles[val] || [];
                return roleIds.includes(token.get('id'));
            }
        }

        // Expression fallback — evaluate as boolean if scope is available
        if (scope) {
            const result = evalDelay(c, scope);
            return !!result && isFinite(result);
        }

        return false;
    };

    /**
     * Evaluate a full filter string (space-separated AND conditions).
     */
    const evalFilter = (filterStr, token, castData, scope) => {
        const trimmed = filterStr.trim();
        if (!trimmed) return false; // empty = no match
        if (trimmed === '*') return true;

        // If the filter contains comparison/logical operators, treat as a single expression
        if (/[<>!&|]/.test(trimmed) && !/^!?[a-z]+=/.test(trimmed)) {
            // Expression filter — evaluate as boolean
            if (scope) {
                const decls = Object.keys(scope).map(k =>
                    `var ${k} = __scope["${k}"];`
                ).join(' ');
                try {
                    const __scope = scope;
                    return !!eval(decls + '(' + trimmed + ')');
                } catch(e) {
                    log(`${SCRIPT_NAME}: filter expression error: ${e.message} (expr: "${trimmed}")`);
                    return false;
                }
            }
            return false;
        }

        // Simple filters: space-separated AND conditions
        const conditions = trimmed.split(/\s+/);
        return conditions.every(c => evalFilterCondition(c, token, castData, scope));
    };

    // =========================================================================
    // TokenProxy — rich wrapper for tokens in expression scope
    // =========================================================================

    // Registry of token variable definitions (used by TokenProxy to build getters)
    // Each entry: { name, namespace, fn, evaluation: 'eager'|'lazy'|'computed' }
    const TOKEN_VAR_DEFS = [];

    /**
     * Register a token variable definition for use by TokenProxy.
     * Called during checkInstall (for core vars) and by extensions (via registerTokenVariable).
     */
    const addTokenVarDef = (reg) => {
        TOKEN_VAR_DEFS.push(reg);
    };

    /**
     * NamespaceProxy — lazy sub-proxy for a specific namespace on a token.
     * Created once per namespace per TokenProxy instance.
     */
    class NamespaceProxy {
        constructor(rawToken, namespace, ctx) {
            this._token = rawToken;
            this._namespace = namespace;
            this._ctx = ctx;
            this._cache = {};

            // Attach getters for all token vars in this namespace
            TOKEN_VAR_DEFS
                .filter(d => d.namespace === namespace)
                .forEach(d => {
                    Object.defineProperty(this, d.name, {
                        get: () => {
                            const eval_ = d.evaluation || 'lazy';
                            if (eval_ === 'computed') return d.fn(this._token, this._ctx);
                            if (eval_ === 'lazy' || eval_ === 'eager') {
                                if (!(d.name in this._cache)) this._cache[d.name] = d.fn(this._token, this._ctx);
                                return this._cache[d.name];
                            }
                            return d.fn(this._token, this._ctx);
                        },
                        enumerable: true,
                    });
                });
        }
    }

    /**
     * TokenProxy — wraps a Roll20 graphic object with namespaced getters.
     * Core properties (left, top, name, etc.) are direct getters.
     * Extension namespaces are lazy NamespaceProxy instances.
     */
    class TokenProxy {
        constructor(rawToken, ctx) {
            this._token = rawToken;
            this._ctx = ctx || {};
            this._nsCache = {};

            // Attach core namespace getters directly
            TOKEN_VAR_DEFS
                .filter(d => d.namespace === 'core')
                .forEach(d => {
                    Object.defineProperty(this, d.name, {
                        get: () => d.fn(this._token, this._ctx),
                        enumerable: true,
                    });
                });

            // Attach namespace sub-proxies as lazy getters
            const namespaces = [...new Set(TOKEN_VAR_DEFS.map(d => d.namespace).filter(ns => ns !== 'core'))];
            namespaces.forEach(ns => {
                Object.defineProperty(this, ns, {
                    get: () => {
                        if (!this._nsCache[ns]) this._nsCache[ns] = new NamespaceProxy(this._token, ns, this._ctx);
                        return this._nsCache[ns];
                    },
                    enumerable: true,
                });
            });
        }

        // Allow access to the raw Roll20 object for interop
        get _id() { return this._token.get('id'); }
        get(prop) { return this._token.get(prop); }
        toString() { return this._token.get('name') || this._token.get('id'); }
    }

    /**
     * Wrap a Roll20 graphic object (or array of them) in TokenProxy.
     */
    const wrapToken = (rawToken, ctx) => rawToken ? new TokenProxy(rawToken, ctx) : null;
    const wrapTokens = (arr, ctx) => arr.map(t => wrapToken(t, ctx));

    // LINQ-inspired enriched array — returned by cast(), role(), and token[] params
    const itemId = (t) => {
        if (typeof t === 'string' || typeof t === 'number') return t;
        if (t && t._id) return t._id;
        if (t && typeof t.get === 'function') return t.get('id');
        return t;
    };

    const enrichArray = (arr) => {
        arr.from = (other) => {
            const ids = new Set((other || []).map(itemId));
            return enrichArray(arr.filter(t => ids.has(itemId(t))));
        };
        arr.without = (other) => {
            const ids = new Set((other || []).map(itemId));
            return enrichArray(arr.filter(t => !ids.has(itemId(t))));
        };
        arr.where = (fn) => enrichArray(arr.filter(fn));
        arr.select = (fn) => enrichArray(arr.map(fn));
        arr.orderBy = (attr) => {
            if (typeof attr === 'function') return enrichArray([...arr].sort((a, b) => attr(a) - attr(b)));
            return enrichArray([...arr].sort((a, b) => {
                const av = a && typeof a === 'object' ? (a[attr] !== undefined ? a[attr] : (a.get ? a.get(attr) : 0)) : a;
                const bv = b && typeof b === 'object' ? (b[attr] !== undefined ? b[attr] : (b.get ? b.get(attr) : 0)) : b;
                return (av || 0) - (bv || 0);
            }));
        };
        arr.first = (n) => n === undefined ? arr[0] : enrichArray(arr.slice(0, n));
        arr.last = (n) => n === undefined ? arr[arr.length - 1] : enrichArray(arr.slice(-n));
        arr.any = (fn) => fn ? arr.some(fn) : arr.length > 0;
        arr.count = (fn) => fn ? arr.filter(fn).length : arr.length;
        arr.ids = () => enrichArray(arr.map(itemId));
        return arr;
    };

    // =========================================================================
    // Delay expression evaluation
    // =========================================================================

    /**
     * Build the expression scope for a token in context.
     */
    const buildTokenScope = (token, filteredTokens, params) => {
        const scope = {
            // Flat backward-compat aliases (also accessible via token.X proxy)
            left:   token.get('left'),
            top:    token.get('top'),
            name:   token.get('name') || '',
            layer:  token.get('layer'),
            width:  token.get('width'),
            height: token.get('height'),
            count:  filteredTokens.length,
        };

        // actors(filter?) — returns tokens sorted by distance from current token
        // actor_ids(filter?) — returns token ID strings
        // LINQ-inspired enriched array — uses module-level enrichArray/itemId

        const ctx = { tokens: filteredTokens, params };

        // Insert a value into scope at the given namespace path
        const insertIntoScope = (ns, name, val) => {
            if (ns === 'core') { scope[name] = val; return; }
            const parts = ns.split('.');
            let node = scope;
            parts.forEach(p => { if (!node[p] || typeof node[p] !== 'object') node[p] = {}; node = node[p]; });
            node[name] = val;
        };

        // Auto-wrap return values based on declared returns type
        const autoWrap = (val, returns) => {
            if (returns === 'token' && val && !( val instanceof TokenProxy)) return wrapToken(val, ctx);
            if (returns === 'token[]' && Array.isArray(val)) return enrichArray(val.filter(Boolean).map(t => t instanceof TokenProxy ? t : wrapToken(t, ctx)));
            return val;
        };

        // Inject registered extension functions
        Object.values(EXT_FUNCTIONS).forEach(reg => {
            insertIntoScope(reg.namespace, reg.name, (...args) => autoWrap(reg.fn(token, filteredTokens, params, ...args), reg.returns));
        });

        // Inject registered token variables
        Object.values(EXT_TOKEN_VARS).forEach(reg => {
            const val = reg.fn(token, { tokens: filteredTokens, params });
            insertIntoScope(reg.namespace, reg.name, autoWrap(val, reg.returns));
        });

        // Inject registered constants
        Object.values(EXT_CONSTANTS).forEach(reg => {
            insertIntoScope(reg.namespace, reg.name, reg.value);
        });

        return scope;
    };

    /**
     * Evaluate a delay expression string in the given scope.
     * Returns a number (ms) or Infinity.
     */
    const evalDelay = (expr, scope) => {
        if (!expr || !expr.trim()) return 0;
        const trimmed = expr.trim();
        // Quick numeric check
        const num = parseFloat(trimmed);
        if (!isNaN(num) && /^[\d.]+$/.test(trimmed)) return num;

        // Build scope declarations for eval
        const decls = Object.keys(scope).map(k =>
            `var ${k} = __scope["${k}"];`
        ).join(' ');

        try {
            const __scope = scope;
            const result = eval(decls + '(' + trimmed + ')');
            if (typeof result !== 'number' || isNaN(result)) return Infinity;
            return result;
        } catch(e) {
            log(`${SCRIPT_NAME}: delay expression error: ${e.message} (expr: "${trimmed}")`);
            return Infinity;
        }
    };

    // General-purpose expression eval — preserves any return type
    const evalExpr = (expr, scope) => {
        if (!expr || !expr.trim()) return undefined;
        const trimmed = expr.trim();
        const decls = Object.keys(scope).map(k =>
            `var ${k} = __scope["${k}"];`
        ).join(' ');
        try {
            const __scope = scope;
            return eval(decls + '(' + trimmed + ')');
        } catch(e) {
            log(`${SCRIPT_NAME}: expression error: ${e.message} (expr: "${trimmed}")`);
            return undefined;
        }
    };

    // =========================================================================
    // Command template evaluation
    // =========================================================================

    /**
     * Evaluate a command template string with ${} substitutions.
     */
    const evalCommand = (template, scope) => {
        if (!template || !template.trim()) return '';

        const decls = Object.keys(scope).map(k =>
            `var ${k} = __scope["${k}"];`
        ).join(' ');

        try {
            const __scope = scope;
            return eval(decls + '`' + template + '`');
        } catch(e) {
            log(`${SCRIPT_NAME}: command template error: ${e.message} (template: "${template}")`);
            return '';
        }
    };

    // =========================================================================
    // Command dispatch helper
    // =========================================================================

    /**
     * Dispatch a batch of commands grouped by command string.
     * Handles start hooks, {& select} injection, depth enforcement.
     */
    const dispatchCommands = (byCommand, instance, sender) => {
        const instanceId = instance.id;
        Object.entries(byCommand).forEach(([command, tokenIds]) => {
            let finalCmd = command;
            // Auto-inject --parent and --depth for chained choreograph runs
            if (finalCmd.startsWith('!choreograph run ') || finalCmd.startsWith(`${CMD_TOKEN} run `)) {
                if (instance.depth <= 0) return;
                finalCmd += ` --parent ${instanceId} --depth ${instance.depth - 1}`;
            }

            const tokens = tokenIds.map(id => getObj('graphic', id)).filter(Boolean);
            const ctx = buildHookContext(instance, { command: finalCmd, tokens });

            // Check if any lifecycle hook wants to handle this via start
            let handled = false;
            EXT_LIFECYCLE.forEach(hook => {
                if (!hook.start) return;
                const matches = hook.commands.some(rx => rx.test(finalCmd));
                if (matches) {
                    hook.start(ctx);
                    handled = true;
                }
            });

            // Fall back to sendChat if no start hook handled it
            if (!handled) {
                if (finalCmd.startsWith('!')) {
                    const selectSuffix = ` {& select ${tokenIds.join(', ')}}`;
                    sendChat(sender, finalCmd + selectSuffix);
                } else {
                    sendChat(sender, finalCmd);
                }
            }

            instance.firedCommands.push({ tokens, command: finalCmd });
        });
    };

    // =========================================================================
    // Scene execution
    // =========================================================================

    /**
     * Execute a scene: gather cast, evaluate rows, build queue, fire commands.
     */
    const executeScene = (scene, cast, params, msg, castData, loopOpts, runtimeOpts) => {
        const instanceId = genInstanceId();
        const queue = [];

        // Resolve params — merge defaults with provided values
        const resolvedParams = {};
        scene.params.forEach(p => {
            if (p.name === 'cast') return; // handled separately
            let val = params[p.name] !== undefined ? params[p.name] : (p.default || null);
            // Resolve token-type parameters to TokenProxy
            if (p.type === 'token' && val && typeof val === 'string') {
                const obj = getObj('graphic', val);
                if (obj) val = wrapToken(obj, { tokens: cast, params: resolvedParams });
            } else if (p.type === 'token[]' && val && typeof val === 'string') {
                val = enrichArray(parseCSV(val)
                    .map(id => getObj('graphic', id.trim()))
                    .filter(Boolean)
                    .map(obj => wrapToken(obj, { tokens: cast, params: resolvedParams })));
            } else if (p.type === 'path' && val && typeof val === 'string') {
                val = getObj('path', val) || val;
            } else if (p.type === 'path[]' && val && typeof val === 'string') {
                val = enrichArray(parseCSV(val)
                    .map(id => getObj('path', id.trim()))
                    .filter(Boolean));
            }
            resolvedParams[p.name] = val;
        });

        // Attach execution context for registered functions that need full cast access
        resolvedParams.__ctx = { allTokens: cast, castData };

        // Validate role constraints (min/max)
        if (scene.roles && scene.roles.length > 0 && castData && castData.roles) {
            for (const roleDef of scene.roles) {
                const assigned = (castData.roles[roleDef.name] || []).length;
                if (roleDef.min && assigned < roleDef.min) {
                    const errMsg = `Role "${roleDef.name}" requires at least ${roleDef.min} token(s) (got ${assigned}).`;
                    if (msg) replyError(msg, errMsg);
                    else log(`${SCRIPT_NAME}: ${errMsg}`);
                    return null;
                }
            }
        }

        // Precompute variables per token
        const tokenVars = {};
        if (scene.variables && scene.variables.length > 0) {
            cast.forEach(token => {
                const scope = buildTokenScope(token, cast, resolvedParams);
                Object.assign(scope, resolvedParams);
                scope.token = wrapToken(token, { tokens: cast, params: resolvedParams });
                const vars = {};
                scene.variables.forEach(v => {
                    if (!v.name || !v.expression) return;
                    scope[v.name] = evalExpr(v.expression, scope);
                    vars[v.name] = scope[v.name];
                });
                tokenVars[token.get('id')] = vars;
            });
        }

        // For each row, evaluate filter on all cast, then compute delays
        scene.rows.forEach((row, rowIndex) => {
            // Check for sync delay — only one sync entry per row
            if (row.delay.trim().toLowerCase() === 'sync') {
                queue.push({ time: -1, rowIndex, isSync: true });
                return;
            }

            // Filter cast
            const filtered = cast.filter(token => {
                const filterScope = buildTokenScope(token, cast, resolvedParams);
                Object.assign(filterScope, resolvedParams);
                Object.assign(filterScope, tokenVars[token.get('id')] || {});
                return evalFilter(row.filter, token, castData, filterScope);
            });
            if (filtered.length === 0) return;

            // For each matching token, evaluate delay and build queue entry
            filtered.forEach(token => {
                const scope = buildTokenScope(token, filtered, resolvedParams);
                // Add resolved params to scope
                Object.assign(scope, resolvedParams);
                // Add computed variables
                Object.assign(scope, tokenVars[token.get('id')] || {});
                // Add token proxy and scene metadata
                const tokenProxy = wrapToken(token, { tokens: filtered, params: resolvedParams });
                scope.token     = tokenProxy;
                // Deprecated aliases (kept for backward compat)
                scope.tokenId   = token.get('id');
                scope.tokenName = token.get('name') || '';
                scope.pageId    = token.get('_pageid');
                scope.self      = scene.name;
                scope.__parent  = instanceId;
                scope.__depth   = Math.max(0, ((runtimeOpts && runtimeOpts.depth !== undefined) ? runtimeOpts.depth : 10) - 1);

                const delay = evalDelay(row.delay, scope);
                if (!isFinite(delay)) return; // INF/SKIP

                // Evaluate 'when' condition — skip if false
                if (row.when) {
                    try {
                        const decls = Object.keys(scope).map(k => `var ${k} = __scope["${k}"];`).join(' ');
                        const __scope = scope;
                        if (!eval(decls + '(' + row.when + ')')) return;
                    } catch(e) {
                        log(`${SCRIPT_NAME}: when expression error: ${e.message} (expr: "${row.when}")`);
                        return;
                    }
                }

                const commands = row.commands || [row.command];
                commands.forEach(cmdTemplate => {
                    const command = evalCommand(cmdTemplate, scope);
                    if (!command) return;
                    queue.push({ time: delay, rowIndex, tokenId: token.get('id'), command });
                });
            });
        });

        // Split queue into chunks at sync markers (preserving row order), then sort each chunk
        const chunks = [[]];
        queue.sort((a, b) => a.rowIndex - b.rowIndex); // row order first
        queue.forEach(entry => {
            if (entry.isSync) {
                chunks.push([]);
            } else {
                chunks[chunks.length - 1].push(entry);
            }
        });
        // Sort each chunk by time, break ties by rowIndex
        chunks.forEach(chunk => chunk.sort((a, b) => a.time - b.time || a.rowIndex - b.rowIndex));

        const sender = getPlayerName(msg.playerid);
        const senderPlayerId = msg.playerid;
        const senderWho = msg.who;

        // Register running scene
        const instance = {
            id:       instanceId,
            instanceName: genInstanceName(),
            name:     scene.name,
            queue,
            timers:   [],
            cast,
            castName: (runtimeOpts && runtimeOpts.castName) || null,
            castData: castData || null,
            params:   resolvedParams,
            state:    'running',
            startTime: Date.now(),
            firedCommands: [],
            who: senderWho,
            playerid: senderPlayerId,
            loop:     loopOpts || null,
            parentId: (runtimeOpts && runtimeOpts.parent) || null,
            children: [],
            depth:    (runtimeOpts && runtimeOpts.depth !== undefined) ? runtimeOpts.depth : 10,
        };
        runningScenes[instanceId] = instance;

        // Register as child of parent
        if (instance.parentId && runningScenes[instance.parentId]) {
            runningScenes[instance.parentId].children.push(instanceId);
        }

        // Handle scene completion — loop or cleanup
        const finishScene = () => {
            const loop = instance.loop;
            if (!loop) {
                // Show completion card (only for top-level scenes)
                if (instance.playerid !== 'API' && !instance.parentId) {
                    const sceneName = instance.name;
                    const sceneHandout = scenes().find(sceneName);
                    const openLink = sceneHandout ? ` <a href="http://journal.roll20.net/handout/${sceneHandout.get('id')}">[open]</a>` : '';
                    const castIdStr = (instance.cast || []).map(t => t.get ? t.get('id') : t).join(' ');
                    const castFlag = instance.castName ? ` --cast ${instance.castName}` : '';
                    let card = `<div style="background:#222;color:#fff;padding:6px;border-radius:4px;font-size:12px;">`;
                    card += `<b>${escHtml(sceneName)}</b>${openLink} — Finished<br><br>`;
                    card += btnHtml('▶ Replay', `${CMD_TOKEN} run ${sceneName} ignore-selected${castFlag} --id ${castIdStr}`);
                    card += btnHtml('🔁 Loop', `${CMD_TOKEN} run ${sceneName} --loop ignore-selected${castFlag} --id ${castIdStr}`);
                    card += `</div>`;
                    const fakeMsg = { who: instance.who, playerid: instance.playerid };
                    reply(fakeMsg, 'Choreograph', card, true);
                }
                delete runningScenes[instanceId];
                return;
            }
            if (loop.unbounded) {
                // Unbounded: sync then restart
                fireSync(instance, () => {
                    instance.firedCommands = [];
                    instance.timers = [];
                    executeChunk(0);
                }, syncTimeout);
            } else if (loop.remaining > 0) {
                instance.loop = Object.assign({}, loop, { remaining: loop.remaining - 1 });
                instance.firedCommands = [];
                instance.timers = [];
                if (loop.sync) {
                    // Bounded with sync: wait then restart
                    fireSync(instance, () => executeChunk(0), syncTimeout);
                } else {
                    // Bounded without sync: immediate restart
                    executeChunk(0);
                }
            } else {
                // Loops exhausted — show completion card (only for top-level scenes)
                if (instance.playerid !== 'API' && !instance.parentId) {
                    const sceneName = instance.name;
                    const sceneHandout = scenes().find(sceneName);
                    const openLink = sceneHandout ? ` <a href="http://journal.roll20.net/handout/${sceneHandout.get('id')}">[open]</a>` : '';
                    const castIdStr = (instance.cast || []).map(t => t.get ? t.get('id') : t).join(' ');
                    const castFlag = instance.castName ? ` --cast ${instance.castName}` : '';
                    let card = `<div style="background:#222;color:#fff;padding:6px;border-radius:4px;font-size:12px;">`;
                    card += `<b>${escHtml(sceneName)}</b>${openLink} — Finished<br><br>`;
                    card += btnHtml('▶ Replay', `${CMD_TOKEN} run ${sceneName} ignore-selected${castFlag} --id ${castIdStr}`);
                    card += btnHtml('🔁 Loop', `${CMD_TOKEN} run ${sceneName} --loop ignore-selected${castFlag} --id ${castIdStr}`);
                    card += `</div>`;
                    const fakeMsg = { who: instance.who, playerid: instance.playerid };
                    reply(fakeMsg, 'Choreograph', card, true);
                }
                delete runningScenes[instanceId];
            }
        };

        // Execute chunks — chain with sync between them
        const syncTimeout = (runtimeOpts && runtimeOpts.syncTimeout) ? runtimeOpts.syncTimeout : 30000;

        // Execute one chunk, then fire sync and proceed to next
        const executeChunk = (chunkIdx) => {
            if (chunkIdx >= chunks.length) {
                finishScene();
                return;
            }
            const chunk = chunks[chunkIdx];
            if (chunk.length === 0) {
                if (chunkIdx < chunks.length - 1) {
                    fireSync(instance, () => executeChunk(chunkIdx + 1), syncTimeout);
                } else {
                    finishScene();
                }
                return;
            }

            instance.startTime = Date.now();
            let i = 0;
            while (i < chunk.length) {
                const batchTime = chunk[i].time;
                const batch = [];
                while (i < chunk.length && chunk[i].time === batchTime) {
                    batch.push(chunk[i]);
                    i++;
                }
                const timer = setTimeout(() => {
                    const byCommand = {};
                    batch.forEach(entry => {
                        if (!byCommand[entry.command]) byCommand[entry.command] = [];
                        byCommand[entry.command].push(entry.tokenId);
                    });
                    dispatchCommands(byCommand, instance, sender);
                }, batchTime);
                instance.timers.push(timer);
            }

            // After last entry in chunk fires, proceed to sync (or finish)
            const maxTime = chunk[chunk.length - 1].time;
            if (chunkIdx < chunks.length - 1) {
                // There's a sync point after this chunk
                const syncTimer = setTimeout(() => {
                    fireSync(instance, () => executeChunk(chunkIdx + 1), syncTimeout);
                }, maxTime + 1);
                instance.timers.push(syncTimer);
            } else {
                // Last chunk — finish (loop or cleanup) after it completes
                const cleanup = setTimeout(() => {
                    finishScene();
                }, maxTime + 100);
                instance.timers.push(cleanup);
            }
        };

        executeChunk(0);

        return instanceId;
    };

    // =========================================================================
    // Command handler
    // =========================================================================

    const handleInput = (msg, invokeOpts) => {
        if (msg.type !== 'api') return;
        if (msg.content.split(' ')[0] !== CMD_TOKEN) return;

        // Delegate to ScriptKit framework for examples/guide commands
        if (typeof ScriptKit !== 'undefined' && ScriptKit.handleInput(msg)) return;

        // Permission check — GM or API always allowed
        if (!playerIsGM(msg.playerid) && msg.playerid !== 'API') {
            replyError(msg, 'Only the GM can use Choreograph commands.');
            return;
        }

        const raw  = msg.content.slice(CMD_TOKEN.length).trim().split(/\s+/).filter(Boolean);
        const cmd  = raw[0];
        const rest = raw.slice(1);

        // Parse flags and plain args
        const flags = new Set();
        const args  = [];
        const opts  = {};

        rest.forEach((tok, i) => {
            if (tok === 'ignore-selected') { flags.add('ignore-selected'); return; }
            if (tok.startsWith('--')) {
                const eqIdx = tok.indexOf('=');
                if (eqIdx !== -1) {
                    opts[tok.slice(2, eqIdx)] = tok.slice(eqIdx + 1);
                } else {
                    const key = tok.slice(2);
                    opts[key] = rest[i + 1] || true;
                    flags.add(key);
                }
                return;
            }
            args.push(tok);
        });

        // ---- new ----
        if (cmd === 'new') {
            const name = args[0];
            if (!name) { replyError(msg, 'Usage: !choreograph new <name>'); return; }
            if (scenes().find(name)) {
                replyError(msg, `A scene named "${name}" already exists.`);
                return;
            }
            const handout = scenes().getOrCreate(name);
            setHandoutNotes(handout, generateBlankScene(name));
            reply(msg, 'Choreograph',
                `Created scene "${escHtml(name)}". `
                + `<a href="http://journal.roll20.net/handout/${handout.get('id')}">[Open Handout]</a>`);
            return;
        }

        // ---- list ----
        if (cmd === 'list') {
            let handouts = scenes().findAll();
            const query = args[0];
            if (query) {
                const q = query.toLowerCase();
                handouts = handouts.filter(h => {
                    const n = scenes().handoutName(h.get('name'));
                    return n && n.toLowerCase().includes(q);
                });
            }
            if (handouts.length === 0) {
                reply(msg, 'Choreograph', query
                    ? `No scenes matching "${escHtml(query)}" found.`
                    : 'No scenes found.');
                return;
            }
            let out = `<b>${handouts.length} scene(s)${query ? ` matching "${escHtml(query)}"` : ''}:</b><br>`;
            handouts.forEach(h => {
                const sceneName = scenes().handoutName(h.get('name'));
                out += `• <b>${escHtml(sceneName)}</b> `
                    + `<a href="http://journal.roll20.net/handout/${h.get('id')}">[Open Handout]</a><br>`;
            });
            reply(msg, 'Choreograph', out);
            return;
        }

        // ---- edit ----
        if (cmd === 'edit') {
            const name = args[0];
            if (!name) { replyError(msg, 'Usage: !choreograph edit <name>'); return; }
            const handout = scenes().find(name);
            if (!handout) { replyError(msg, `No scene named "${name}" found.`); return; }
            reply(msg, 'Choreograph',
                `Opening scene "${escHtml(name)}": `
                + `<a href="http://journal.roll20.net/handout/${handout.get('id')}">[Open Handout]</a>`);
            return;
        }

        // ---- delete ----
        if (cmd === 'delete') {
            const name = args[0];
            if (!name) { replyError(msg, 'Usage: !choreograph delete <name>'); return; }
            if (!flags.has('force')) {
                reply(msg, 'Choreograph',
                    `Delete scene "${escHtml(name)}"? `
                    + `<a href="${CMD_TOKEN} delete ${name} --force" `
                    + `style="display:inline-block;padding:2px 8px;background:#900;color:#fff;border-radius:3px;text-decoration:none;font-size:11px;">Yes, delete</a>`);
                return;
            }
            const handout = scenes().find(name);
            if (!handout) { replyError(msg, `No scene named "${name}" found.`); return; }
            handout.remove();
            reply(msg, 'Choreograph', `Deleted scene "${escHtml(name)}".`);
            return;
        }

        // ---- stop ----
        if (cmd === 'stop') {
            const name = args[0];
            if (name) {
                // Stop by scene name or instance name
                const matches = Object.entries(runningScenes)
                    .filter(([, s]) => s.name === name || s.instanceName === name);
                if (matches.length === 0) {
                    replyError(msg, `No running scene named "${name}".`);
                    return;
                }
                matches.forEach(([id]) => stopScene(id));
                reply(msg, 'Choreograph', `Stopped ${matches.length} instance(s) of "${escHtml(name)}".`);
            } else {
                const count = Object.keys(runningScenes).length;
                stopAll();
                reply(msg, 'Choreograph', count > 0
                    ? `Stopped ${count} running scene(s).`
                    : 'No scenes running.');
            }
            return;
        }

        // ---- pause ----
        if (cmd === 'pause') {
            const name = args[0];
            if (name) {
                const matches = Object.entries(runningScenes)
                    .filter(([, s]) => (s.name === name || s.instanceName === name) && s.state === 'running');
                if (matches.length === 0) { replyError(msg, `No running scene named "${name}" to pause.`); return; }
                matches.forEach(([id]) => pauseScene(id));
                reply(msg, 'Choreograph', `Paused ${matches.length} instance(s) of "${escHtml(name)}". `
                    + btnHtml('▶ Resume', `${CMD_TOKEN} resume ${name}`)
                    + btnHtml('⏹ Stop', `${CMD_TOKEN} stop ${name}`));
            } else {
                const running = Object.entries(runningScenes).filter(([, s]) => s.state === 'running');
                running.forEach(([id]) => pauseScene(id));
                reply(msg, 'Choreograph', running.length > 0
                    ? `Paused ${running.length} running scene(s).`
                    : 'No scenes running to pause.');
            }
            return;
        }

        // ---- resume ----
        if (cmd === 'resume') {
            const name = args[0];
            if (name) {
                const matches = Object.entries(runningScenes)
                    .filter(([, s]) => (s.name === name || s.instanceName === name) && s.state === 'paused');
                if (matches.length === 0) { replyError(msg, `No paused scene named "${name}" to resume.`); return; }
                matches.forEach(([id]) => resumeScene(id, msg));
                reply(msg, 'Choreograph', `Resumed ${matches.length} instance(s) of "${escHtml(name)}".`);
            } else {
                const paused = Object.entries(runningScenes).filter(([, s]) => s.state === 'paused');
                paused.forEach(([id]) => resumeScene(id, msg));
                reply(msg, 'Choreograph', paused.length > 0
                    ? `Resumed ${paused.length} paused scene(s).`
                    : 'No scenes paused to resume.');
            }
            return;
        }

        // ---- refresh ----
        if (cmd === 'refresh') {
            const name = args[0];
            if (!name) { replyError(msg, 'Usage: !choreograph refresh <name>'); return; }
            const handout = scenes().find(name);
            if (!handout) { replyError(msg, `No scene named "${name}" found.`); return; }
            delete scenes().cache[name];
            scenes().load(name, (scene) => {
                if (!scene) { replyError(msg, `Could not parse scene "${name}".`); return; }
                const html = generateSceneHtml(name, scene);
                setHandoutNotes(handout, html);
                reply(msg, 'Choreograph', `Refreshed "${escHtml(name)}" — ${scene.rows.length} row(s).`);
            });
            return;
        }

        // ---- add-row ----
        if (cmd === 'add-row') {
            const name = args[0];
            if (!name) { replyError(msg, 'Usage: !choreograph add-row <name>'); return; }
            const handout = scenes().find(name);
            if (!handout) { replyError(msg, `No scene named "${name}" found.`); return; }
            delete scenes().cache[name];
            scenes().load(name, (scene) => {
                if (!scene) { replyError(msg, `Could not parse scene "${name}".`); return; }
                scene.rows.push({ filter: '*', delay: '0', command: '', notes: '' });
                const html = generateSceneHtml(name, scene);
                setHandoutNotes(handout, html);
                reply(msg, 'Choreograph', `Added row to "${escHtml(name)}".`);
            });
            return;
        }

        // ---- dump-html ----
        if (cmd === 'dump-html') {
            const name = args[0];
            if (!name) { replyError(msg, 'Usage: !choreograph dump-html <name>'); return; }
            const handout = scenes().find(name);
            if (!handout) { replyError(msg, `No scene named "${name}" found.`); return; }
            getHandoutNotes(handout, (html) => {
                const chunkSize = 1000;
                for (let i = 0; i < html.length; i += chunkSize) {
                    log(`${SCRIPT_NAME} dump-html [${name}] chunk ${Math.floor(i/chunkSize)+1}: `
                        + html.slice(i, i + chunkSize));
                }
                reply(msg, 'Choreograph',
                    `Dumped HTML for "${escHtml(name)}" to API console (${html.length} chars).`);
            });
            return;
        }

        // Helper: parse --role flags from message content and merge into castData
        const mergeRoleFlags = (content, castData, castIds) => {
            const roleRegex = /--role\s+(\S+)((?:\s+-(?!-)[A-Za-z0-9_-]+)+)/g;
            let roleMatch;
            while ((roleMatch = roleRegex.exec(content)) !== null) {
                const roleName = roleMatch[1];
                const roleIds = roleMatch[2].trim().split(/\s+/).filter(Boolean);
                if (!castData.roles[roleName]) castData.roles[roleName] = [];
                roleIds.forEach(id => {
                    castData.roles[roleName].push(id);
                    castIds.push(id);
                });
            }
        };

        // ---- run ----
        if (cmd === 'run') {
            const name = args[0];
            if (!name) { replyError(msg, 'Usage: !choreograph run <name>'); return; }
            const handout = scenes().find(name);
            if (!handout) { replyError(msg, `No scene named "${name}" found.`); return; }

            // Gather cast IDs from all sources
            const castIds = [];
            if (!flags.has('ignore-selected')) {
                (msg.selected || []).forEach(s => castIds.push(s._id));
            }
            if (opts.id) {
                const ids = Array.isArray(opts.id) ? opts.id : String(opts.id).split(/\s+/);
                ids.forEach(id => { if (id) castIds.push(id); });
            }
            if (flags.has('page')) {
                let pageId;
                if (typeof opts.page === 'string' && opts.page !== 'true') {
                    pageId = opts.page;
                } else {
                    // Player: use their specific page if split, else ribbon page
                    const psp = Campaign().get('playerspecificpages') || {};
                    pageId = (!playerIsGM(msg.playerid) && psp[msg.playerid])
                        ? psp[msg.playerid]
                        : Campaign().get('playerpageid');
                }
                findObjs({ _type: 'graphic', _pageid: pageId })
                    .forEach(t => castIds.push(t.get('id')));
            }
            args.slice(1).forEach(a => {
                if (/^-[A-Za-z0-9_-]+$/.test(a)) castIds.push(a);
            });

            // --cast <name> — merge IDs from cast handout
            const runWithCast = (castData) => {
                const cast = [...new Set(castIds)]
                    .map(id => getObj('graphic', id))
                    .filter(Boolean);

                if (cast.length === 0) {
                    replyError(msg, 'No tokens in cast. Select tokens, use --id, or use --cast.');
                    return;
                }

                scenes().load(name, (scene) => {
                    if (!scene) {
                        replyError(msg, `Could not parse scene "${name}".`);
                        return;
                    }

                    const knownFlags = new Set(['id', 'force', 'loop', 'depth', 'page', 'cast', 'sync', 'sync-timeout', 'role', 'parent']);
                    const params = {};
                    Object.entries(opts).forEach(([k, v]) => {
                        if (!knownFlags.has(k) && typeof v === 'string') params[k] = v;
                    });

                    // Enforce max on roles
                    if (scene.roles && castData && castData.roles) {
                        scene.roles.forEach(roleDef => {
                            if (roleDef.max && castData.roles[roleDef.name]) {
                                const arr = castData.roles[roleDef.name];
                                if (arr.length > roleDef.max) {
                                    castData.roles[roleDef.name] = arr.slice(-roleDef.max);
                                }
                            }
                        });
                    }

                    // Parse loop options
                    let loopOpts = null;
                    if (flags.has('loop')) {
                        const loopVal = opts.loop;
                        if (loopVal === true || loopVal === 'true') {
                            // --loop (unbounded)
                            loopOpts = { unbounded: true, remaining: null, sync: true };
                        } else {
                            const n = parseInt(loopVal, 10);
                            if (!isNaN(n) && n > 0) {
                                loopOpts = { unbounded: false, remaining: n - 1, sync: flags.has('sync') };
                            }
                        }
                    }

                    const runtimeOpts = {
                        parent: opts.parent || null,
                        depth:  opts.depth !== undefined ? parseInt(opts.depth, 10) : 10,
                        syncTimeout: opts['sync-timeout'] ? parseInt(opts['sync-timeout'], 10) : 30000,
                        castName: opts.cast || null,
                    };
                    const instanceId = executeScene(scene, cast, params, msg, castData || null, loopOpts, runtimeOpts);
                    const inst = runningScenes[instanceId];
                    const iName = inst ? inst.instanceName : instanceId;
                    // Only show status card for user-initiated runs (not children/recursive)
                    if (msg.playerid !== 'API' && !runtimeOpts.parent) {
                        const sceneHandout = scenes().find(name);
                        const openLink = sceneHandout ? ` <a href="http://journal.roll20.net/handout/${sceneHandout.get('id')}">[open]</a>` : '';
                        let castInfo = '';
                        if (inst && inst.castName) {
                            const castHandout = casts().find(inst.castName);
                            castInfo = castHandout
                                ? ` — <b>${escHtml(inst.castName)}</b> <a href="http://journal.roll20.net/handout/${castHandout.get('id')}">[open]</a>`
                                : ` — ${escHtml(inst.castName)}`;
                        }
                        const looseCt = (inst && inst.castName) ? 0 : cast.length;
                        if (looseCt > 0 && !(inst && inst.castName)) castInfo = ` — ${looseCt} token(s)`;
                        let card = `<div style="background:#222;color:#fff;padding:6px;border-radius:4px;font-size:12px;">`;
                        card += `<b>${escHtml(name)}</b>${openLink}${castInfo}<br>`;
                        card += `Instance: <b>${escHtml(iName)}</b><br><br>`;
                        card += btnHtml('⏸ Pause', `${CMD_TOKEN} pause ${iName}`);
                        card += btnHtml('⏹ Stop', `${CMD_TOKEN} stop ${iName}`);
                        card += btnHtml('🔄 Status', `${CMD_TOKEN} status`);
                        card += `</div>`;
                        reply(msg, 'Choreograph', card, true);
                    }
                });
            };

            if (opts.cast) {
                casts().load(String(opts.cast), (castData) => {
                    if (!castData) {
                        replyError(msg, `No cast named "${opts.cast}" found.`);
                        return;
                    }
                    getAllCastIds(castData).forEach(id => castIds.push(id));
                    // Merge --role into loaded cast if present
                    if (opts.role) {
                        mergeRoleFlags(msg.content, castData, castIds);
                    }
                    runWithCast(castData);
                });
            } else if (opts.role) {
                // --role <name> <ids...> — build ephemeral castData
                const roleData = { roles: {} };
                mergeRoleFlags(msg.content, roleData, castIds);
                runWithCast(roleData);
            } else {
                runWithCast(null);
            }
            return;
        }

        // ---- cast ----
        if (cmd === 'cast') {
            const subCmd = args[0];
            const castName = args[1];

            if (subCmd === 'list') {
                const handouts = casts().findAll();
                if (handouts.length === 0) {
                    reply(msg, 'Cast', 'No casts found.');
                    return;
                }
                let out = `<b>${handouts.length} cast(s):</b><br>`;
                handouts.forEach(h => {
                    const n = casts().handoutName(h.get('name'));
                    out += `• <b>${escHtml(n)}</b> `
                        + `<a href="http://journal.roll20.net/handout/${h.get('id')}">[Open]</a><br>`;
                });
                reply(msg, 'Cast', out);
                return;
            }

            if (subCmd === 'show') {
                if (!castName) { replyError(msg, 'Usage: !choreograph cast show <name>'); return; }
                casts().load(castName, (cast) => {
                    if (!cast) { replyError(msg, `No cast named "${castName}" found.`); return; }
                    let out = `<b>Cast: ${escHtml(castName)}</b><br>`;
                    Object.entries(cast.roles).forEach(([role, ids]) => {
                        const label = role || '(no role)';
                        const names = ids.map(id => {
                            const obj = getObj('graphic', id);
                            return obj ? (obj.get('name') || id) : `${id} (missing)`;
                        });
                        out += `<b>${escHtml(label)}:</b> ${names.join(', ')}<br>`;
                    });
                    reply(msg, 'Cast', out);
                });
                return;
            }

            if (subCmd === 'add') {
                if (!castName) { replyError(msg, 'Usage: !choreograph cast add <name> [--role <role>]'); return; }
                const role = opts.role || '';
                // Gather IDs from selection + --id + remaining args
                const ids = [];
                if (!flags.has('ignore-selected')) {
                    (msg.selected || []).forEach(s => ids.push(s._id));
                }
                if (opts.id) String(opts.id).split(/\s+/).forEach(id => { if (id) ids.push(id); });
                args.slice(2).forEach(a => { if (/^-[A-Za-z0-9_-]+$/.test(a)) ids.push(a); });

                if (ids.length === 0) {
                    replyError(msg, 'No tokens specified. Select tokens or use --id.');
                    return;
                }

                const handout = casts().getOrCreate(castName);
                casts().load(castName, (cast) => {
                    if (!cast) cast = { roles: {} };
                    if (!cast.roles[role]) cast.roles[role] = [];
                    ids.forEach(id => {
                        if (!cast.roles[role].includes(id)) cast.roles[role].push(id);
                    });
                    casts().cache[castName] = cast;
                    setHandoutNotes(handout, generateCastHtml(castName, cast.roles));
                    reply(msg, 'Cast',
                        `Added ${ids.length} token(s) to "${escHtml(castName)}"${role ? ` role "${escHtml(role)}"` : ''}.`);
                });
                return;
            }

            if (subCmd === 'remove') {
                if (!castName) { replyError(msg, 'Usage: !choreograph cast remove <name> [--role <role>]'); return; }
                const role = opts.role;
                // Gather IDs to remove
                const ids = [];
                if (!flags.has('ignore-selected')) {
                    (msg.selected || []).forEach(s => ids.push(s._id));
                }
                if (opts.id) String(opts.id).split(/\s+/).forEach(id => { if (id) ids.push(id); });
                args.slice(2).forEach(a => { if (/^-[A-Za-z0-9_-]+$/.test(a)) ids.push(a); });

                if (ids.length === 0) {
                    replyError(msg, 'No tokens specified. Select tokens or use --id.');
                    return;
                }

                casts().load(castName, (cast) => {
                    if (!cast) { replyError(msg, `No cast named "${castName}" found.`); return; }
                    const handout = casts().find(castName);
                    if (role !== undefined) {
                        // Remove from specific role
                        if (cast.roles[role]) {
                            cast.roles[role] = cast.roles[role].filter(id => !ids.includes(id));
                            if (cast.roles[role].length === 0) delete cast.roles[role];
                        }
                    } else {
                        // Remove from all roles
                        Object.keys(cast.roles).forEach(r => {
                            cast.roles[r] = cast.roles[r].filter(id => !ids.includes(id));
                            if (cast.roles[r].length === 0) delete cast.roles[r];
                        });
                    }
                    casts().cache[castName] = cast;
                    setHandoutNotes(handout, generateCastHtml(castName, cast.roles));
                    reply(msg, 'Cast',
                        `Removed ${ids.length} token(s) from "${escHtml(castName)}"${role ? ` role "${escHtml(role)}"` : ''}.`);
                });
                return;
            }

            if (subCmd === 'delete') {
                if (!castName) { replyError(msg, 'Usage: !choreograph cast delete <name>'); return; }
                if (!flags.has('force')) {
                    reply(msg, 'Cast',
                        `Delete cast "${escHtml(castName)}"? `
                        + `<a href="${CMD_TOKEN} cast delete ${castName} --force" `
                        + `style="${STYLE.btn};background:#900;">Yes, delete</a>`);
                    return;
                }
                const handout = casts().find(castName);
                if (!handout) { replyError(msg, `No cast named "${castName}" found.`); return; }
                handout.remove();
                delete casts().cache[castName];
                reply(msg, 'Cast', `Deleted cast "${escHtml(castName)}".`);
                return;
            }

            replyError(msg, 'Usage: !choreograph cast <add|remove|list|show|delete> [name] [options]');
            return;
        }

        // ---- example ----


        // ---- status ----
        if (cmd === 'status') {
            const instances = Object.values(runningScenes);
            if (instances.length === 0) {
                reply(msg, 'Choreograph', 'No scenes running.');
                return;
            }
            let out = `<b>${instances.length} running scene(s):</b><br>`;
            instances.forEach(inst => {
                const elapsed = Math.round((Date.now() - inst.startTime) / 1000);
                out += `• <b>${escHtml(inst.instanceName)}</b> — ${escHtml(inst.name)} `
                    + `[${inst.state}] ${elapsed}s `
                    + `(${inst.cast.length} tokens)<br>`;
            });
            reply(msg, 'Choreograph', out);
            return;
        }


        // ---- echo (debug/test) ----
        if (cmd === 'echo') {
            const text = rest.join(' ');
            const ts = Date.now() % 100000;
            reply(msg, 'Echo', `[${ts}ms] ${text}`, true);
            return;
        }

        // ---- fx ----
        // Usage: !choreograph fx <type> <x> <y> [pageId]
        // Or with selected: !choreograph fx <type> (at selected token location)
        if (cmd === 'fx') {
            const fxType = args[0];
            if (!fxType) { replyError(msg, 'Usage: !choreograph fx <type> [x y [pageId]] or with token selected'); return; }
            let x, y, pageId;
            if (args.length >= 3) {
                x = parseFloat(args[1]);
                y = parseFloat(args[2]);
                pageId = args[3] || undefined;
            }
            if (x === undefined || y === undefined) {
                if (msg.selected && msg.selected.length > 0) {
                    const tok = getObj('graphic', msg.selected[0]._id);
                    if (tok) { x = tok.get('left'); y = tok.get('top'); pageId = pageId || tok.get('_pageid'); }
                }
            }
            if (!pageId && msg.selected && msg.selected.length > 0) {
                const tok = getObj('graphic', msg.selected[0]._id);
                if (tok) pageId = tok.get('_pageid');
            }
            if (x !== undefined && y !== undefined) {
                spawnFx(x, y, fxType, pageId);
            }
            return;
        }

        // ---- fxbetween ----
        // Usage: !choreograph fxbetween <type> <x1> <y1> <x2> <y2> [pageId]
        // Or with 2 selected: !choreograph fxbetween <type>
        if (cmd === 'fxbetween') {
            const fxType = args[0];
            if (!fxType) { replyError(msg, 'Usage: !choreograph fxbetween <type> [x1 y1 x2 y2]'); return; }
            let p1, p2, pageId;
            if (args.length >= 5) {
                p1 = { x: parseFloat(args[1]), y: parseFloat(args[2]) };
                p2 = { x: parseFloat(args[3]), y: parseFloat(args[4]) };
                pageId = args[5] || Campaign().get('playerpageid');
            } else if (msg.selected && msg.selected.length >= 2) {
                const t1 = getObj('graphic', msg.selected[0]._id);
                const t2 = getObj('graphic', msg.selected[1]._id);
                if (t1 && t2) {
                    p1 = { x: t1.get('left'), y: t1.get('top') };
                    p2 = { x: t2.get('left'), y: t2.get('top') };
                    pageId = t1.get('_pageid');
                }
            }
            if (p1 && p2) {
                spawnFxBetweenPoints(p1, p2, fxType, pageId);
            }
            return;
        }

        replyError(msg, `Unknown command: ${cmd}. Commands: new, list, edit, delete, run, stop, refresh.`);
    };

    // =========================================================================
    // Initialization
    // =========================================================================

    const checkInstall = () => {
        state[SCRIPT_NAME] = state[SCRIPT_NAME] || {};

        // ── Register core token variables (eager) ─────────────────────────
        [
            { name: 'id',       fn: (t) => t.get('id') },
            { name: 'left',     fn: (t) => t.get('left') },
            { name: 'top',      fn: (t) => t.get('top') },
            { name: 'name',     fn: (t) => t.get('name') || '' },
            { name: 'layer',    fn: (t) => t.get('layer') },
            { name: 'width',    fn: (t) => t.get('width') },
            { name: 'height',   fn: (t) => t.get('height') },
            { name: 'rotation', fn: (t) => t.get('rotation') || 0 },
            { name: 'flipv',    fn: (t) => t.get('flipv') },
            { name: 'fliph',    fn: (t) => t.get('fliph') },
            { name: 'bar1_value', fn: (t) => parseFloat(t.get('bar1_value')) || 0 },
            { name: 'bar2_value', fn: (t) => parseFloat(t.get('bar2_value')) || 0 },
            { name: 'bar3_value', fn: (t) => parseFloat(t.get('bar3_value')) || 0 },
            { name: 'statusmarkers', fn: (t) => t.get('statusmarkers') || '' },
            { name: 'imgsrc',   fn: (t) => t.get('imgsrc') || '' },
            { name: 'pageid',   fn: (t) => t.get('_pageid') },
        ].forEach(def => addTokenVarDef({ name: def.name, namespace: 'core', fn: def.fn, evaluation: 'eager' }));

        // ── Register core constants ───────────────────────────────────────
        registerConstant(SCRIPT_NAME, { name: 'PI', namespace: 'core', value: Math.PI, description: 'π' });
        registerConstant(SCRIPT_NAME, { name: 'TAU', namespace: 'core', value: Math.PI * 2, description: '2π' });
        registerConstant(SCRIPT_NAME, { name: 'INF', namespace: 'core', value: Infinity, description: 'Infinity — skip token' });
        registerConstant(SCRIPT_NAME, { name: 'SKIP', namespace: 'core', value: Infinity, description: 'Alias for INF' });

        // ── Register core functions ───────────────────────────────────────
        registerFunction(SCRIPT_NAME, {
            name: 'distance', namespace: 'core', returns: 'number',
            description: 'Pixel distance from (x,y) or token to current token.',
            args: [{ name: 'x', type: 'number' }, { name: 'y', type: 'number' }],
            fn: (token, filteredTokens, params, x, y) => {
                if (typeof x === 'object' && x !== null) {
                    y = x.top !== undefined ? x.top : (x.get ? x.get('top') : 0);
                    x = x.left !== undefined ? x.left : (x.get ? x.get('left') : 0);
                }
                const dx = token.get('left') - x;
                const dy = token.get('top') - y;
                return Math.sqrt(dx * dx + dy * dy);
            },
        });
        registerFunction(SCRIPT_NAME, {
            name: 'propagate', namespace: 'core', returns: 'number',
            description: 'dist / speed',
            fn: (token, filteredTokens, params, dist, speed) => dist / speed,
        });
        registerFunction(SCRIPT_NAME, {
            name: 'stagger', namespace: 'core', returns: 'number',
            description: 'rank * interval',
            fn: (token, filteredTokens, params, rank, interval) => rank * interval,
        });
        registerFunction(SCRIPT_NAME, {
            name: 'wave', namespace: 'core', returns: 'number',
            description: 'Wave offset: (pos % wavelength) / wavelength * duration',
            fn: (token, filteredTokens, params, pos, wavelength, duration) => ((pos % wavelength) / wavelength) * (duration || wavelength),
        });
        registerFunction(SCRIPT_NAME, {
            name: 'rank', namespace: 'core', returns: 'number',
            description: 'Sort position (0-based) within filtered set.',
            fn: (token, filteredTokens, params, attr) => {
                let sorted;
                if (typeof attr === 'function') {
                    sorted = [...filteredTokens].sort((a, b) => attr(a) - attr(b));
                } else if (typeof attr === 'string') {
                    sorted = [...filteredTokens].sort((a, b) => (a.get(attr) || 0) - (b.get(attr) || 0));
                } else {
                    return filteredTokens.indexOf(token);
                }
                return sorted.indexOf(token);
            },
        });
        registerFunction(SCRIPT_NAME, {
            name: 'rand', namespace: 'core', returns: 'number', pure: false,
            description: 'Random number between min and max.',
            fn: (token, filteredTokens, params, min, max) => min + Math.random() * (max - min),
        });
        registerFunction(SCRIPT_NAME, {
            name: 'randInt', namespace: 'core', returns: 'number', pure: false,
            description: 'Random integer between min and max (inclusive).',
            fn: (token, filteredTokens, params, min, max) => Math.floor(min + Math.random() * (max + 1 - min)),
        });
        registerFunction(SCRIPT_NAME, {
            name: 'clamp', namespace: 'core', returns: 'number',
            fn: (token, filteredTokens, params, v, lo, hi) => Math.min(Math.max(v, lo), hi),
        });
        registerFunction(SCRIPT_NAME, { name: 'abs',   namespace: 'core', returns: 'number', fn: (t, f, p, x) => Math.abs(x) });
        registerFunction(SCRIPT_NAME, { name: 'round', namespace: 'core', returns: 'number', fn: (t, f, p, x) => Math.round(x) });
        registerFunction(SCRIPT_NAME, { name: 'floor', namespace: 'core', returns: 'number', fn: (t, f, p, x) => Math.floor(x) });
        registerFunction(SCRIPT_NAME, { name: 'ceil',  namespace: 'core', returns: 'number', fn: (t, f, p, x) => Math.ceil(x) });
        registerFunction(SCRIPT_NAME, { name: 'min',   namespace: 'core', returns: 'number', fn: (t, f, p, ...args) => Math.min(...args) });
        registerFunction(SCRIPT_NAME, { name: 'max',   namespace: 'core', returns: 'number', fn: (t, f, p, ...args) => Math.max(...args) });
        registerFunction(SCRIPT_NAME, { name: 'sqrt',  namespace: 'core', returns: 'number', fn: (t, f, p, x) => Math.sqrt(x) });
        registerFunction(SCRIPT_NAME, { name: 'pow',   namespace: 'core', returns: 'number', fn: (t, f, p, x, y) => Math.pow(x, y) });
        registerFunction(SCRIPT_NAME, { name: 'sin',   namespace: 'core', returns: 'number', fn: (t, f, p, x) => Math.sin(x) });
        registerFunction(SCRIPT_NAME, { name: 'cos',   namespace: 'core', returns: 'number', fn: (t, f, p, x) => Math.cos(x) });

        // count — number of tokens in current filtered set (registered as function, 0 args)
        registerFunction(SCRIPT_NAME, {
            name: 'count', namespace: 'core', returns: 'number',
            description: 'Number of tokens passing the current row filter.',
            fn: (token, filteredTokens) => filteredTokens.length,
        });

        // actors / actor_ids — registered as functions returning token[]
        registerFunction(SCRIPT_NAME, {
            name: 'actors', namespace: 'core', returns: 'token[]',
            description: 'Tokens sorted by distance from current token.',
            fn: (token, filteredTokens, params, filterStr) => {
                const set = filterStr
                    ? filteredTokens.filter(t => evalFilter(filterStr, t, null))
                    : filteredTokens;
                const tx = token.get('left'), ty = token.get('top');
                return [...set].sort((a, b) => {
                    const da = Math.pow(a.get('left') - tx, 2) + Math.pow(a.get('top') - ty, 2);
                    const db = Math.pow(b.get('left') - tx, 2) + Math.pow(b.get('top') - ty, 2);
                    return da - db;
                });
            },
        });
        registerFunction(SCRIPT_NAME, {
            name: 'actor_ids', namespace: 'core', returns: 'string[]',
            description: 'Token IDs sorted by distance from current token.',
            fn: (token, filteredTokens, params, filterStr) => {
                const set = filterStr
                    ? filteredTokens.filter(t => evalFilter(filterStr, t, null))
                    : filteredTokens;
                const tx = token.get('left'), ty = token.get('top');
                return [...set].sort((a, b) => {
                    const da = Math.pow(a.get('left') - tx, 2) + Math.pow(a.get('top') - ty, 2);
                    const db = Math.pow(b.get('left') - tx, 2) + Math.pow(b.get('top') - ty, 2);
                    return da - db;
                }).map(t => t.get('id'));
            },
        });

        registerFunction(SCRIPT_NAME, {
            name: 'cast', namespace: 'core', returns: 'token[]',
            description: 'All tokens in the full cast (ignoring row filter), optionally filtered by role. Sorted by distance from current token.',
            fn: (token, filteredTokens, params, filterStr) => {
                const ctx = params.__ctx || {};
                const all = ctx.allTokens || filteredTokens;
                const cd  = ctx.castData || null;
                const set = filterStr
                    ? all.filter(t => evalFilter(filterStr, t, cd))
                    : all;
                const tx = token.get('left'), ty = token.get('top');
                return [...set].sort((a, b) => {
                    const da = Math.pow(a.get('left') - tx, 2) + Math.pow(a.get('top') - ty, 2);
                    const db = Math.pow(b.get('left') - tx, 2) + Math.pow(b.get('top') - ty, 2);
                    return da - db;
                });
            },
        });
        registerFunction(SCRIPT_NAME, {
            name: 'cast_ids', namespace: 'core', returns: 'string[]',
            description: 'Token IDs from the full cast (ignoring row filter), optionally filtered by role. Sorted by distance.',
            fn: (token, filteredTokens, params, filterStr) => {
                const ctx = params.__ctx || {};
                const all = ctx.allTokens || filteredTokens;
                const cd  = ctx.castData || null;
                const set = filterStr
                    ? all.filter(t => evalFilter(filterStr, t, cd))
                    : all;
                const tx = token.get('left'), ty = token.get('top');
                return [...set].sort((a, b) => {
                    const da = Math.pow(a.get('left') - tx, 2) + Math.pow(a.get('top') - ty, 2);
                    const db = Math.pow(b.get('left') - tx, 2) + Math.pow(b.get('top') - ty, 2);
                    return da - db;
                }).map(t => t.get('id'));
            },
        });
        registerFunction(SCRIPT_NAME, {
            name: 'role', namespace: 'core', returns: 'token[]',
            description: 'Shorthand for cast("role=<name>"). Returns tokens in the named role, sorted by distance.',
            fn: (token, filteredTokens, params, roleName) => {
                const ctx = params.__ctx || {};
                const all = ctx.allTokens || filteredTokens;
                const cd  = ctx.castData || null;
                const set = roleName
                    ? all.filter(t => evalFilter(`role=${roleName}`, t, cd))
                    : all;
                const tx = token.get('left'), ty = token.get('top');
                return [...set].sort((a, b) => {
                    const da = Math.pow(a.get('left') - tx, 2) + Math.pow(a.get('top') - ty, 2);
                    const db = Math.pow(b.get('left') - tx, 2) + Math.pow(b.get('top') - ty, 2);
                    return da - db;
                });
            },
        });
        registerFunction(SCRIPT_NAME, {
            name: 'role_ids', namespace: 'core', returns: 'string[]',
            description: 'Shorthand for cast_ids("role=<name>"). Returns IDs of tokens in the named role, sorted by distance.',
            fn: (token, filteredTokens, params, roleName) => {
                const ctx = params.__ctx || {};
                const all = ctx.allTokens || filteredTokens;
                const cd  = ctx.castData || null;
                const set = roleName
                    ? all.filter(t => evalFilter(`role=${roleName}`, t, cd))
                    : all;
                const tx = token.get('left'), ty = token.get('top');
                return [...set].sort((a, b) => {
                    const da = Math.pow(a.get('left') - tx, 2) + Math.pow(a.get('top') - ty, 2);
                    const db = Math.pow(b.get('left') - tx, 2) + Math.pow(b.get('top') - ty, 2);
                    return da - db;
                }).map(t => t.get('id'));
            },
        });

        // ── Built-in example scenes (via ScriptKit framework) ─────────────────
        const registerWithScriptKit = () => {
            if (typeof ScriptKit === 'undefined') return;

            ScriptKit.register(SCRIPT_NAME, {
                command: CMD_TOKEN,
                tag: 'Scene',
                version: SCRIPT_VERSION,
                newSince: '1.0.0',
                motd: [
                    'Use `!choreograph examples` to browse interactive demos you can run immediately.',
                    'The `sync` delay waits for animations to finish before continuing — great for phased effects.',
                    'Use `--role caster <id>` to assign roles at run time without pre-saving a cast.',
                    'Chain scenes recursively with `\\${self}` — combined with `when`, you can build bounce/jump effects.',
                    'TokenProxy gives you `token.left`, `token.name`, etc. — no more `get()` calls in expressions.',
                    'LINQ methods like `.first()`, `.without()`, `.orderBy()` chain on `actors()` and `role()` results.',
                    'Use `!choreograph man <topic>` to search help — it fuzzy-matches across topics and items.',
                    'Expressions re-evaluate each loop cycle, so `rand()` produces different results every iteration.',
                ],
                help: {
                    description: 'Meta-sequencer for Roll20 tokens. Define scenes in handouts — filter tokens, compute per-token timing, and fire commands at the right moments.',
                    quickStart: [
                        '`!choreograph new myScene` — creates a blank scene handout.',
                        'Open the **[Scene] myScene** handout. Add rows to the Scene Table: set a Filter (e.g. `\\*`), a Delay expression (e.g. `stagger(rank("left"), 200)`), and a Command template (e.g. `!sequence play sparkle --target \\${token.id}`).',
                        'Select tokens and run `!choreograph run myScene`.',
                    ],
                    changelog: [
                        { version: '1.0.0', changes: [
                            'Revamped example command with fuzzy search, tiered sorting, and bold highlights',
                            'Interactive setup guide wizard for examples (multi-step, roles, params)',
                            'when field for conditional row execution',
                            '--role flag for ad-hoc role assignment at run time',
                            'role()/role_ids()/cast()/cast_ids() expression functions',
                            'token[]/path[] parameters enriched with TokenProxy',
                        ]},
                        { version: '0.2', changes: [
                            'TokenProxy — dot-notation access to all token properties',
                            'LINQ-style array methods (.from, .without, .where, .orderBy, .first, .last, .select)',
                            'Dynamic man/help generation from registries',
                            'role=X filter for cast roles',
                        ]},
                        { version: '0.1', changes: [
                            'Initial release: run, new, list, edit, delete, stop, pause, resume, status',
                            'Scene handout format (params, variables, rows)',
                            'Cast system with roles',
                            'Scene chaining, looping, sync system',
                            'Extension API (registerFunction, registerTokenVariable, registerConstant, etc.)',
                            'Filters, delay expressions, command templates',
                        ]},
                    ],
                    commands: [
                        { syntax: 'run <name> [flags]', description: 'Execute a scene', version: '0.1', details: 'Runs the named scene on selected tokens (or cast).', items: [
                            { name: '--loop', description: 'Loop indefinitely (sync between cycles)', version: '0.1' },
                            { name: '--loop N', description: 'Loop N times (immediate restart)', version: '0.1' },
                            { name: '--loop N --sync', description: 'Loop N times (sync between cycles)', version: '0.1' },
                            { name: '--page [id]', description: 'Populate cast from all tokens on a page', version: '0.1' },
                            { name: '--id <ids...>', description: 'Populate cast from explicit token IDs', version: '0.1' },
                            { name: '--cast <name>', description: 'Populate cast from a saved cast', version: '0.1' },
                            { name: 'ignore-selected', description: 'Don\'t include selected tokens in cast', version: '0.1' },
                            { name: '--depth N', description: 'Max chaining depth (default: 10)', version: '0.1' },
                            { name: '--sync-timeout <ms>', description: 'Sync timeout in ms (default: 30000)', version: '0.1' },
                            { name: '--role <name> <ids...>', description: 'Assign tokens to a role at run time', version: '1.0.0' },
                            { name: '--<param> <value>', description: 'Bind a scene parameter value', version: '0.1' },
                        ]},
                        { syntax: 'new <name>', description: 'Create blank scene handout', version: '0.1' },
                        { syntax: 'list [query]', description: 'List scenes (fuzzy search)', version: '0.1' },
                        { syntax: 'edit <name>', description: 'Open scene handout', version: '0.1' },
                        { syntax: 'delete <name>', description: 'Delete a scene', version: '0.1' },
                        { syntax: 'refresh <name>', description: 'Regenerate handout from cache', version: '0.1' },
                        { syntax: 'add-row <name>', description: 'Add blank row to scene table', version: '0.1' },
                        { syntax: 'dump-html <name>', description: 'Dump raw handout HTML to API console', version: '0.1' },
                        { syntax: 'echo <text>', description: 'Debug: whisper text with timestamp', version: '0.1' },
                        { group: 'Playback', commands: [
                            { syntax: 'stop [name]', description: 'Stop running scene(s)', version: '0.1' },
                            { syntax: 'pause [name]', description: 'Pause running scene(s)', version: '0.1' },
                            { syntax: 'resume [name]', description: 'Resume paused scene(s)', version: '0.1' },
                            { syntax: 'status', description: 'Show all running scenes', version: '0.1' },
                        ]},
                        { group: 'Cast', commands: [
                            { syntax: 'cast add/remove/list/show/delete', description: 'Manage casts', version: '0.1' },
                        ]},
                    ],
                    topics: {
                        handout: {
                            title: 'Scene Handout Structure',
                            description: 'How scene handouts are organized',
                            version: '0.1',
                            body: 'Each scene is stored in a `[Scene] <name>` handout with three HTML tables that Choreograph parses. You can edit them directly in the handout editor.',
                            items: [
                                { name: 'Parameter Table', description: 'Name | Type | Default | Description — scene inputs bound at run time', version: '0.1' },
                                { name: 'Variables Table', description: 'Variable | Expression — computed once per token before execution', version: '0.1' },
                                { name: 'Scene Table', description: 'Filter | Delay | Command | Notes — the choreography rows', version: '0.1' },
                            ],
                        },
                        flow: {
                            title: 'How It All Connects',
                            description: 'The execution pipeline from run to command',
                            version: '0.1',
                            body: '**1. Cast assembly** — You run `!choreograph run myScene` with tokens selected. These become the *cast*. Parameters are bound from --flags.\n'
                                + '**2. Variables computed** — For each token in the cast, the Variables table is evaluated top-to-bottom. Each variable can reference params, earlier variables, and the token itself.\n'
                                + '**3. Row processing** — Each row in the Scene Table is processed:\n'
                                + '    • The **Filter** selects which cast members this row applies to.\n'
                                + '    • The **When** condition (if any) is checked per-token — falsy = skip.\n'
                                + '    • The **Delay** expression is evaluated per-token to compute milliseconds.\n'
                                + '    • After the delay fires, the **Command** template is evaluated per-token and sent to chat.\n'
                                + '**4. All rows fire in parallel** — rows don\'t wait for each other unless you use `sync` to create coordination points.\n\n'
                                + '**Example trace:** Scene has `speed` param (default 2). Variable `dist = distance(350, 350)` computes per-token. Delay `dist / speed` staggers by distance. Command `!sequence play sparkle --target \\${token.id}` fires per-token when its delay expires.',
                        },
                        example: {
                            title: 'Example Scene',
                            description: 'A complete scene showing all pieces working together',
                            version: '0.1',
                            body: '**Propagating burst** — a sparkle effect radiates outward from a center point, hitting nearby tokens first.\n\n'
                                + '**Parameters:**\n'
                                + '    `speed` — number, default `2` (pixels per ms)\n'
                                + '    `origin` — token, default `selected` (center point)\n\n'
                                + '**Variables:**\n'
                                + '    `dist` = `distance(origin.left, origin.top)`\n\n'
                                + '**Scene Table:**\n'
                                + '    Row 1: Filter `\\*` | Delay `dist / speed` | Command `!sequence play sparkle --target \\${token.id}`\n'
                                + '    Row 2: Filter `\\*` | Delay `dist / speed + 500` | Command `!sequence play fade-out --target \\${token.id}`\n\n'
                                + '**Result:** Tokens near the origin sparkle first, with the burst rippling outward. 500ms after each sparkle, that token fades out.',
                        },
                        filters: {
                            title: 'Filters',
                            description: 'Filter syntax for selecting tokens',
                            version: '0.1',
                            details: 'Filters determine which tokens in the cast are affected by a scene row. Each row in the scene table has a filter column that selects a subset of the cast.',
                            body: 'Space-separated conditions within a cell are AND. Multiple rows provide OR. Empty filter = no tokens match.',
                            items: [
                                { name: '*', description: 'All tokens', version: '0.1' },
                                { name: 'layer=X', description: 'On layer X', version: '0.1' },
                                { name: 'name=X*', description: 'Name glob match (supports * wildcard)', version: '0.1' },
                                { name: 'id=-ABC123', description: 'Specific token ID', version: '0.1' },
                                { name: 'role=X', description: 'Has role X in the cast', version: '0.2' },
                                { name: 'status=X', description: 'Has status marker X', version: '0.1' },
                                { name: '!prefix', description: 'Negation (e.g. !layer=gm)', version: '0.1' },
                            ],
                        },
                        delay: {
                            title: 'Delay Expressions',
                            description: 'Per-token timing expressions',
                            version: '0.1',
                            details: 'Each row has a delay column containing a JavaScript expression evaluated per-token. The expression must return a number (milliseconds), INF/SKIP to exclude a token, or sync to wait for all participants before continuing.',
                            body: () => 'Return: number (ms), INF/SKIP, or sync.\n\n'
                                + '**Token Variables:** ' + TOKEN_VAR_DEFS.filter(d => d.namespace === 'core').map(d => d.name).join(', ') + ', self, plus params/computed vars.\n'
                                + '**Constants:** ' + Object.values(EXT_CONSTANTS).filter(r => r.namespace === 'core').map(r => r.name).join(', '),
                            items: [
                                { name: 'rank("attr")', description: 'Sort position of current token in filtered set', version: '0.1' },
                                { name: 'distance(x, y)', description: 'Pixel distance from token to point (or `distance(orig)`)', version: '0.1' },
                                { name: 'propagate(dist, speed)', description: 'dist / speed', version: '0.1' },
                                { name: 'stagger(rank, interval)', description: 'rank × interval', version: '0.1' },
                                { name: 'wave(pos, wavelength, duration)', description: 'Sinusoidal timing offset', version: '0.1' },
                                { name: 'rand(min, max)', description: 'Random number in range', version: '0.1' },
                                { name: 'randInt(min, max)', description: 'Random integer in range', version: '0.1' },
                                { name: 'clamp(v, lo, hi)', description: 'Clamp value to range', version: '0.1' },
                                { name: 'actors(filter?)', description: 'Tokens passing filter, sorted by distance', version: '0.1' },
                                { name: 'actor_ids(filter?)', description: 'Token IDs passing filter, sorted by distance', version: '0.1' },
                                { name: 'sync', description: 'Wait for all sync participants before continuing', version: '0.1' },
                                { name: 'INF / SKIP', description: 'Skip this token (infinite delay)', version: '0.1' },
                            ],
                        },
                        commands: {
                            title: 'Command Templates',
                            description: 'How to write command templates in scene rows',
                            version: '0.1',
                            details: 'Each row in the scene table has a command column. Commands are API calls (starting with !) that fire when a token\'s delay expires. Template literals allow dynamic values computed per-token.',
                            body: 'Use `\\${expr}` for substitutions. Evaluated as JS template literals. All variables, params, computed variables, and functions are in scope.\n\nMultiple commands per cell: put each on a new line in the handout cell. They fire simultaneously for that token.',
                            items: [
                                { name: '${token.id}', description: 'Current token ID', version: '0.1' },
                                { name: '${token.left}', description: 'Token X position (TokenProxy)', version: '0.2' },
                                { name: '${token.name}', description: 'Token display name', version: '0.2' },
                                { name: '${self}', description: 'Current scene name (for recursion/chaining)', version: '0.1' },
                                { name: '${count}', description: 'Number of tokens matching this row\'s filter', version: '0.1' },
                                { name: '${myVar}', description: 'Any computed variable or parameter by name', version: '0.1' },
                                { name: '${actors().first().id}', description: 'ID of the nearest other token in the filtered set', version: '0.1' },
                                { name: '${role("targets").first().id}', description: 'ID of the nearest token in a role', version: '1.0.0' },
                                { name: '${role_ids("targets").join(" ")}', description: 'Space-separated list of all target IDs', version: '1.0.0' },
                                { name: '${Math.round(dist / speed)}', description: 'Any JS expression (computed inline)', version: '0.1' },
                            ],
                        },
                        cast: {
                            title: 'Cast Management',
                            description: 'Saving and managing token groups',
                            version: '0.1',
                            details: 'Casts are saved token groups stored in [Cast] handouts. They persist across sessions and can assign tokens to named roles for filtering. Use --cast in run to use a saved cast instead of selection.',
                            body: 'Stored in `[Cast] <name>` handouts. Use `--cast <name>` in run to load. Tokens default to selected if no --cast/--page/--id is given.',
                            items: [
                                { name: 'cast add <name> [--role R]', syntax: '!choreograph cast add <name> [--role R]', description: 'Add selected tokens to cast (optionally to a role)', version: '0.1' },
                                { name: 'cast remove <name> [--role R]', syntax: '!choreograph cast remove <name> [--role R]', description: 'Remove tokens from cast', version: '0.1' },
                                { name: 'cast list', syntax: '!choreograph cast list', description: 'List all saved casts', version: '0.1' },
                                { name: 'cast show <name>', syntax: '!choreograph cast show <name>', description: 'Show cast members and roles', version: '0.1' },
                                { name: 'cast delete <name>', syntax: '!choreograph cast delete <name>', description: 'Delete a saved cast', version: '0.1' },
                            ],
                        },
                        castexpr: {
                            title: 'Cast Expressions',
                            description: 'Accessing cast and role data in expressions',
                            version: '1.0.0',
                            details: 'These functions are available in delay expressions and command templates. They return enriched arrays with LINQ methods for chaining.',
                            body: 'Use these in delay/command expressions to access the full cast or specific roles. All return arrays sorted by distance from the current token.',
                            items: [
                                { name: 'cast()', description: 'Full cast array (all tokens in the scene run)', version: '1.0.0' },
                                { name: 'cast_ids()', description: 'Full cast ID array', version: '1.0.0' },
                                { name: 'role("name")', description: 'Tokens in a specific role (enriched array)', version: '1.0.0' },
                                { name: 'role_ids("name")', description: 'Token IDs in a specific role', version: '1.0.0' },
                            ],
                        },
                        sync: {
                            title: 'Sync',
                            description: 'Waiting for participants to complete',
                            version: '0.1',
                            details: 'Sync creates coordination points within a scene. When a row uses sync as its delay, execution pauses until all registered sync participants (like Sequence animations) report completion. This gates phase transitions on actual animation end rather than estimated timing.',
                            body: 'Use `sync` as a delay value. Waits for all registered sync participants to signal completion before continuing.\n\nUseful for gating recursion or phase transitions on animation completion.',
                        },
                        loop: {
                            title: 'Looping',
                            description: 'Repeating scene execution',
                            version: '0.1',
                            details: 'Looping repeats the entire scene. Expressions re-evaluate each cycle, so randomized delays and staggering produce different results each iteration. Only top-level scenes can loop — child scenes spawned via chaining cannot.',
                            items: [
                                { name: '--loop', description: 'Loop indefinitely, sync between cycles', version: '0.1' },
                                { name: '--loop N', description: 'Loop N times, immediate restart', version: '0.1' },
                                { name: '--loop N --sync', description: 'Loop N times, sync between cycles', version: '0.1' },
                            ],
                            body: 'Top-level only. Children cannot loop. Expressions re-evaluate each cycle.',
                        },
                        chain: {
                            title: 'Scene Chaining',
                            description: 'Recursion and scene composition',
                            version: '0.1',
                            details: 'Scenes can spawn other scenes (or themselves) via command templates. This enables recursive patterns like chain-lightning that bounce between targets. Depth is capped (default 10) to prevent infinite recursion.',
                            body: 'At depth 0, child spawns are skipped. Children cannot use `--loop`.',
                            items: [
                                { name: 'self', description: 'Resolves to current scene name', version: '0.1' },
                                { name: '--parent', description: 'Auto-injected parent scene reference', version: '0.1' },
                                { name: '--depth N', description: 'Max chaining depth (default: 10)', version: '0.1' },
                            ],
                        },
                        when: {
                            title: 'Row Conditions',
                            description: 'Conditional row execution',
                            version: '1.0.0',
                            details: 'The when field is a JavaScript expression evaluated per-token. If it returns falsy, the row is skipped for that token. Combined with recursion, this enables patterns like "keep jumping until jumps runs out."',
                            body: 'Add a `when` expression to a scene row. The row only executes for tokens where the expression evaluates to truthy.\n\nExample: `jumps > 0 && next`',
                        },
                        params: {
                            title: 'Parameter Types',
                            description: 'Types available for scene parameters',
                            version: '0.1',
                            details: 'Parameters are defined in the scene handout\'s Parameter table. They configure the scene at run time via --flags or the guide wizard. Type determines how values are resolved (e.g. token IDs are looked up as Roll20 objects).',
                            body: 'Append [] for arrays (e.g. token[], number[]). `cast` is built-in (token[], default: selected). Params without defaults are required at run time.',
                            items: [
                                { name: 'number', description: 'Numeric value', version: '0.1' },
                                { name: 'text', description: 'String value', version: '0.1' },
                                { name: 'boolean', description: 'true/false', version: '0.1' },
                                { name: 'token', description: 'Token reference (resolved from ID)', version: '0.1' },
                                { name: 'path', description: 'Path reference', version: '0.1' },
                                { name: 'sequence', description: 'Sequence recording name', version: '0.1' },
                                { name: 'scene', description: 'Choreograph scene name', version: '0.1' },
                                { name: 'role', description: 'Cast role name', version: '1.0.0' },
                            ],
                        },
                        vars: {
                            title: 'Variables',
                            description: 'Computed variables in scene tables',
                            version: '0.1',
                            details: 'Variables are computed once per token before any rows execute. They can reference parameters, other variables (defined earlier), and all built-in functions. Use them in delay expressions and command templates.',
                            body: 'Defined in the Variables table (Variable | Expression). Computed once per token before execution. Later variables can reference earlier ones. Available in all delay expressions and command templates.',
                        },
                        tokenproxy: {
                            title: 'TokenProxy',
                            description: 'Dot-notation access to token properties',
                            version: '0.2',
                            details: 'TokenProxy wraps Roll20 graphic objects so you can access properties with dot notation in expressions instead of calling get(). Token parameters (type token) are also TokenProxy instances, so param.left works.',
                            body: 'The `token` object provides access to all token properties via dot notation. Token parameters (type `token`) are also TokenProxy instances.',
                            items: [
                                { name: 'token.id', description: 'Token ID', version: '0.2' },
                                { name: 'token.name', description: 'Token display name', version: '0.2' },
                                { name: 'token.left / token.top', description: 'Token position', version: '0.2' },
                                { name: 'token.width / token.height', description: 'Token dimensions', version: '0.2' },
                                { name: 'token.rotation', description: 'Token rotation', version: '0.2' },
                                { name: 'token.layer', description: 'Token layer', version: '0.2' },
                                { name: 'token.pageid', description: 'Token page ID', version: '0.2' },
                                { name: 'token.bar1_value', description: 'Bar values (bar1-3)', version: '0.2' },
                            ],
                        },
                        linq: {
                            title: 'Array Methods (LINQ)',
                            description: 'Chainable array operations on token sets',
                            version: '0.2',
                            details: 'Arrays returned by actors(), role(), cast(), and other set-returning functions are enriched with LINQ-style methods for filtering, sorting, and projecting without manual iteration.',
                            body: 'Arrays returned by `actors()`, `role()`, etc. have extra methods:',
                            items: [
                                { name: '.from(other)', description: 'Intersection — keep only items in both arrays', version: '0.2' },
                                { name: '.without(other)', description: 'Exclusion — remove items in other', version: '0.2' },
                                { name: '.where(fn)', description: 'Filter (alias for .filter())', version: '0.2' },
                                { name: '.orderBy(attr)', description: 'Sort by attribute name or function', version: '0.2' },
                                { name: '.first(n?)', description: 'First element or first N elements', version: '0.2' },
                                { name: '.last(n?)', description: 'Last element or last N elements', version: '0.2' },
                                { name: '.any(fn?)', description: 'True if any match (or non-empty)', version: '0.2' },
                                { name: '.count(fn?)', description: 'Count matching or total', version: '0.2' },
                                { name: '.ids()', description: 'Get ID strings', version: '0.2' },
                                { name: '.select(fn)', description: 'Map/project elements', version: '0.2' },
                            ],
                        },
                        roles: {
                            title: 'Roles',
                            description: 'Ad-hoc role assignment and filtering',
                            version: '1.0.0',
                            details: 'Roles are lightweight labels assigned to tokens at run time. Unlike casts (which are persisted), roles exist only for the duration of a scene run. They enable patterns like "caster hits targets" without pre-configuring casts.',
                            body: 'Assign tokens to roles at runtime with `--role <name> <ids>`. Filter with `role=X`. Access in expressions with `role("name")` and `role_ids("name")`.',
                            items: [
                                { name: '--role <name> <ids...>', description: 'Assign tokens to a role at run time', version: '1.0.0' },
                                { name: 'role("name")', description: 'Get tokens in role (returns enriched array)', version: '1.0.0' },
                                { name: 'role_ids("name")', description: 'Get token IDs in role', version: '1.0.0' },
                            ],
                        },
                        troubleshooting: {
                            title: 'Troubleshooting',
                            description: 'Common issues and error behavior',
                            version: '0.1',
                            body: '**Expression errors** — If a delay or variable expression throws, that token is skipped for that row. An error is whispered to the GM with the expression and error message.\n\n'
                                + '**Empty filter match** — If a filter matches no tokens, the row does nothing (no error). This is intentional for conditional scenes.\n\n'
                                + '**Missing parameters** — If a required parameter (no default) is not provided at run time, the scene aborts with an error listing the missing params.\n\n'
                                + '**Depth limit reached** — At depth 0, any `!choreograph run` commands in the scene table are silently skipped. Increase `--depth` if legitimate recursion is being cut short.\n\n'
                                + '**Sync timeout** — If a sync participant doesn\'t signal completion within the timeout (default 30s), the scene continues without it. Adjust with `--sync-timeout`.\n\n'
                                + '**Scene not found** — Check that the handout is named exactly `[Scene] <name>` and hasn\'t been renamed. Use `!choreograph list` to see available scenes.\n\n'
                                + '**Tokens not moving/animating** — Choreograph only fires commands; it doesn\'t move tokens itself. Make sure the target script (e.g. Sequence) is installed and the command syntax is correct.',
                        },
                        api: {
                            title: 'Extension API',
                            description: 'How to extend Choreograph from other scripts',
                            version: '0.1',
                            handouts: 'dev',
                            details: 'Other scripts can extend Choreograph by registering custom functions, token variables, constants, parameter types, lifecycle hooks, and sync participants. Extensions appear in man pages and the dev handout automatically.',
                            items: [
                                { name: 'registerFunction(src, struct)', syntax: 'Choreograph.registerFunction(src, struct)', description: 'Add a function to delay/command expressions', version: '0.1' },
                                { name: 'registerTokenVariable(src, struct)', syntax: 'Choreograph.registerTokenVariable(src, struct)', description: 'Add a per-token variable', version: '0.1' },
                                { name: 'registerConstant(src, struct)', syntax: 'Choreograph.registerConstant(src, struct)', description: 'Add a constant', version: '0.1' },
                                { name: 'registerParameterType(src, struct)', syntax: 'Choreograph.registerParameterType(src, struct)', description: 'Add a custom parameter type', version: '0.1' },
                                { name: 'registerLifecycleHook(src, struct)', syntax: 'Choreograph.registerLifecycleHook(src, struct)', description: 'Hook into scene lifecycle events', version: '0.1' },
                                { name: 'registerSyncParticipant(src, struct)', syntax: 'Choreograph.registerSyncParticipant(src, struct)', description: 'Register for sync coordination', version: '0.1' },
                                { name: 'generateExtensionHandout(src, opts)', syntax: 'Choreograph.generateExtensionHandout(src, opts)', description: 'Generate developer docs handout', version: '0.1' },
                            ],
                            body: 'Run `!choreograph gen-dev-docs` for the full developer guide.',
                        },
                        func: {
                            title: 'Registered Functions',
                            description: 'Functions available in delay/command expressions',
                            version: '0.1',
                            body: () => {
                                const regs = Object.values(EXT_FUNCTIONS);
                                if (regs.length === 0) return '*No functions registered.*';
                                let out = '';
                                regs.forEach(r => {
                                    const ns = r.namespace === 'core' ? '' : '**' + r.namespace + '.**';
                                    const argList = (r.args || []).map(a => a.name).join(', ');
                                    const purity = r.pure === false ? ' [unstable]' : '';
                                    out += ns + '**' + r.name + '(' + argList + ')** → *' + (r.returns || 'any') + '*' + purity + '\n';
                                    if (r.description) out += r.description + '\n';
                                    out += '\n';
                                });
                                return out;
                            },
                        },
                        tokenvar: {
                            title: 'Token Variables',
                            description: 'Registered per-token variables',
                            version: '0.1',
                            body: () => {
                                const regs = Object.values(EXT_TOKEN_VARS);
                                if (regs.length === 0) return '*No token variables registered.*';
                                let out = '';
                                regs.forEach(r => {
                                    const ns = r.namespace === 'core' ? '' : '**' + r.namespace + '.**';
                                    out += ns + '**' + r.name + '**';
                                    if (r.description) out += ' — ' + r.description;
                                    out += '\n';
                                });
                                return out;
                            },
                        },
                        const: {
                            title: 'Constants',
                            description: 'Registered constants',
                            version: '0.1',
                            body: () => {
                                const regs = Object.values(EXT_CONSTANTS);
                                if (regs.length === 0) return '*No constants registered.*';
                                let out = '';
                                regs.forEach(r => {
                                    const ns = r.namespace === 'core' ? '' : '**' + r.namespace + '.**';
                                    out += ns + '**' + r.name + '** = `' + String(r.value) + '`';
                                    if (r.description) out += ' — ' + r.description;
                                    out += '\n';
                                });
                                return out;
                            },
                        },
                    },
                },
                exampleHandler: (example, msg) => {
                    const sceneName = example.source + '/example-' + example.name;
                    const scene = Object.assign({ name: sceneName }, example.scene);
                    if (!scene.params) scene.params = [];
                    if (!scene.params.find(p => p.name === 'cast')) {
                        scene.params.unshift({ name: 'cast', type: 'token[]', default: 'selected', description: 'Tokens to run the scene on (built-in)' });
                    }
                    if (!scene.variables) scene.variables = [];
                    if (!scene.rows) scene.rows = [];
                    const html = generateSceneHtml(sceneName, scene);
                    // Cache the scene so Choreograph can run it
                    scenes().cache[sceneName] = scene;
                    return { notes: html, archived: true };
                },
                onComplete: (ctx) => {
                    // Build cast from selections._roles and run the scene
                    const sceneName = ctx.example.source + '/example-' + ctx.example.name;
                    const roles = ctx.selections._roles || {};
                    if (Object.keys(roles).length > 0) {
                        const castName = sceneName + '-cast';
                        const castRoles = {};
                        Object.entries(roles).forEach(([role, tokens]) => {
                            castRoles[role] = (Array.isArray(tokens) ? tokens : [tokens]).map(t => t.get('id'));
                        });
                        const castHandout = casts().getOrCreate(castName);
                        casts().cache[castName] = { roles: castRoles };
                        setHandoutNotes(castHandout, generateCastHtml(castName, castRoles));
                        castHandout.set('archived', true);
                        // Build param flags
                        const paramFlags = Object.entries(ctx.params || {})
                            .map(([k, v]) => '--' + k + ' ' + v)
                            .join(' ');
                        const syntheticMsg = Object.assign({}, ctx.msg, {
                            content: CMD_TOKEN + ' run ' + sceneName + ' ignore-selected --cast ' + castName + (paramFlags ? ' ' + paramFlags : ''),
                            selected: [],
                        });
                        handleInput(syntheticMsg);
                    }
                },
            });
        };

        // Try immediately + listen for ready signal
        registerWithScriptKit();
        on('chat:message', function(msg) {
            if (msg.type === 'api' && msg.content === '!scriptkit-ready') registerWithScriptKit();
        });

        // =====================================================================
        // Tutorial Examples (via ScriptKit)
        // =====================================================================

        ScriptKit.Choreograph.registerExample(SCRIPT_NAME, {
            name: 'your-first-scene',
            description: 'Create "The Summoning" — learn scenes, tables, filters, delay, and running.',
            guide: [
                { prompt: '**Welcome to Choreograph!**\n\nOver the next few tutorials, you\'ll build a complete **ritual summoning** scene step by step. Cultists chant, energy gathers, and a creature is summoned.\n\nThis first tutorial covers the fundamentals: creating a scene, understanding the three tables, and running it.\n\nClick Continue to begin.' },
                { prompt: '**Setup: Place Your Tokens**\n\nBefore we create the scene, set up the stage. On your current page, place:\n\n• 3–6 tokens to serve as cultists (these will form the ritual circle) and give them names\n• Arrange them roughly in a circle\n• **Rotate each cultist to face generally toward the center** (select token, hold alt, and drag the rotation handle)\n\nThe rotation values will determine clockwise ordering later — this is important!\n\nClick Continue when your cultist tokens are placed and facing inward.' },
                { prompt: '**Create the Scene**\n\nRun `!choreograph new summoning` to create the scene handout.',
                  ...ScriptKit.waitForCommand('!choreograph new'),
                  onContinue: () => {
                      if (!scenes().find('summoning')) return 'Scene "summoning" not found. Run `!choreograph new summoning`.';
                  }
                },
                { prompt: '**The Three Tables**\n\nOpen `[Scene] summoning` from your journal. You\'ll see:\n\n1. **Parameters** — inputs the scene accepts when run (e.g. `--speed 2`). The built-in `cast` parameter is your selected tokens.\n2. **Variables** — computed values evaluated *per token* at runtime (e.g. distance from center).\n3. **Scene Table** — the rows: **Filter** | **Delay** | **When** | **Command** | **Notes**\n\nEach row says: *"for tokens matching this **filter**, after this **delay**, and **when** these conditions are met, fire this **command** (the **Notes** is just for you to keep track of what is going on)."* All rows start simultaneously — the delay offsets them.\n\nClick Continue when you\'ve opened the handout.' },
                { prompt: () => ScriptKit.html.raw(
                    '<b>Your First Rows</b><br><br>'
                    + 'In the Scene Table, replace the example row with three rows (leave <b>When</b> and <b>Notes</b> empty for now):<br><br>'
                    + ScriptKit.html.table(
                        ['Filter', 'Delay', 'When', 'Command', 'Notes'],
                        [
                            ['<code>&#42;</code>', '<code>0</code>', '', '<code>!choreograph echo ${token.name}: Liviate Viiopur Turola Ravla...</code>', ''],
                            ['<code>&#42;</code>', '<code>2000</code>', '', '<code>!choreograph echo ${token.name}: Insus Antioiauernus Lobaitis Broalgia...</code>', ''],
                            ['<code>&#42;</code>', '<code>4000</code>', '', '<code>!choreograph echo ${token.name}: Idishelligio Labyouin Vararum...</code>', ''],
                        ])
                    + '<br><b>What this does:</b><br>'
                    + '• Three phases of chanting, 2 seconds apart<br>'
                    + '• All cultists speak each line simultaneously (same delay per row)<br>'
                    + '• <code>${token.name}</code> inserts each token\'s name<br><br>'
                    + '<b>Save the handout</b>, then click Continue.'
                ) },
                { prompt: '**Run It!**\n\nSelect your cultist tokens, then run:\n\n`!choreograph run summoning`\n\nYou should see whispered messages appear one by one, staggered left-to-right: *"Cultist begins chanting..."*',
                  ...ScriptKit.waitForCommand('!choreograph run')
                },
                { prompt: '**What Just Happened?**\n\nChoreograph:\n1. Collected your selected tokens as the **cast**\n2. Evaluated each row\'s filter (`*` = all tokens)\n3. Fired each row\'s command at its delay — 0ms, 2000ms, 4000ms\n4. Substituted `${token.name}` with each token\'s actual name\n\n**Key Concepts:**\n• All rows start their timers simultaneously — delays offset them\n• Fixed delays (`0`, `2000`, `4000`) create sequential phases\n• Within a row, all matching tokens fire at the same time\n• `${...}` expressions are evaluated per-token\n\nRight now all cultists chant the same lines in unison. In the next tutorial, we\'ll split them into groups so each group chants a different phrase.',
                  offerExamples: ['roles-and-casts']
                },
            ],
        });

        ScriptKit.Choreograph.registerExample(SCRIPT_NAME, {
            name: 'roles-and-casts',
            description: 'Split cultists into role groups — each group chants a different phrase.',
            guide: [
                { prompt: '**Roles & Casts**\n\nRight now all cultists chant the same three phrases in unison. Let\'s split them into three groups so each group speaks a different line of the incantation.\n\n**Prerequisite:** Complete the "Your First Scene" tutorial first. You should have `[Scene] summoning` and your cultist tokens.\n\nClick Continue to begin.',
                  onContinue: () => {
                      if (!scenes().find('summoning')) return 'Scene "summoning" not found. Complete the "Your First Scene" tutorial first.';
                  }
                },
                { prompt: '**What is a Cast?**\n\nA **Cast** is a saved group of tokens with named **roles**. Instead of selecting tokens every time you run a scene, you define the cast once and reference it.\n\nRoles let you target subsets of the cast in your scene rows using the `role=X` filter.\n\nLet\'s create a cast for our summoning ritual.' },
                { prompt: '**Create the Cast — Group 1**\n\nSelect roughly a third of your cultist tokens (the ones you want to chant the first phrase).\n\nRun: `!choreograph cast add summoning --role first`',
                  ...ScriptKit.waitForCommand('!choreograph cast')
                },
                { prompt: '**Create the Cast — Group 2**\n\nSelect the next third of cultists.\n\nRun: `!choreograph cast add summoning --role second`',
                  ...ScriptKit.waitForCommand('!choreograph cast')
                },
                { prompt: '**Create the Cast — Group 3**\n\nSelect the remaining cultists.\n\nRun: `!choreograph cast add summoning --role third`',
                  ...ScriptKit.waitForCommand('!choreograph cast')
                },
                { prompt: () => ScriptKit.html.raw(
                    '<b>Update the Scene</b><br><br>'
                    + 'Open <code>[Scene] summoning</code> and change the Filter column on each row to target a specific role:<br><br>'
                    + ScriptKit.html.table(
                        ['Filter', 'Delay', 'When', 'Command', 'Notes'],
                        [
                            ['<code>role=first</code>', '<code>0</code>', '', '<code>!choreograph echo ${token.name}: Liviate Viiopur Turola Ravla...</code>', ''],
                            ['<code>role=second</code>', '<code>2000</code>', '', '<code>!choreograph echo ${token.name}: Insus Antioiauernus Lobaitis Broalgia...</code>', ''],
                            ['<code>role=third</code>', '<code>4000</code>', '', '<code>!choreograph echo ${token.name}: Idishelligio Labyouin Vararum...</code>', ''],
                        ])
                    + '<br>Now each group chants its own phrase instead of everyone saying the same thing.<br><br>'
                    + '<b>Save the handout</b>, then click Continue.'
                ) },
                { prompt: '**Run with the Cast**\n\nInstead of selecting tokens manually, use the saved cast:\n\n`!choreograph run summoning --cast summoning`\n\nYou should see each group chant its own phrase at its scheduled time.',
                  ...ScriptKit.waitForCommand('!choreograph run')
                },
                { prompt: '**Key Concepts:**\n\n• `!choreograph cast add <name> --role <role>` — assign selected tokens to a named role\n• `role=X` in the Filter column — only match tokens in that role\n• `--cast <name>` on run — load a saved cast instead of using selected tokens\n• Roles persist in a `[Cast] summoning` handout — edit it directly to reassign\n\n**Useful commands:**\n• `!choreograph cast show summoning` — view current assignments\n• `!choreograph cast remove summoning --role first` — remove tokens from a role\n\nIn the next tutorial, we\'ll add timing expressions so the cultists within each group activate one at a time, clockwise around the circle.',
                  offerExamples: ['filters-and-delay']
                },
            ],
        });

        ScriptKit.Choreograph.registerExample(SCRIPT_NAME, {
            name: 'filters-and-delay',
            description: 'Stagger cultists clockwise with timing expressions and add chaotic energy effects.',
            guide: [
                { prompt: '**Filters & Delay**\n\nThe cultist groups chant their phrases, but within each group everyone speaks at the same instant. Let\'s make them activate one at a time, sweeping clockwise around the circle.\n\n**Prerequisite:** Complete "Roles & Casts" first. You should have `[Scene] summoning` with role-based filters and a `[Cast] summoning`.\n\nClick Continue to begin.',
                  onContinue: () => {
                      if (!scenes().find('summoning')) return 'Scene "summoning" not found. Complete the previous tutorials first.';
                  }
                },
                { prompt: '**Timing Expressions**\n\nSo far, delays have been fixed numbers (ms). But delays can be *expressions* — evaluated per-token, producing different values for each.\n\nKey functions:\n• `rank("attr")` — this token\'s sort position (0-based) among filtered tokens, sorted by attribute\n• `stagger(position, interval)` — `position * interval` (spaces out execution)\n• `rand(min, max)` — random number in range\n• `propagate(distance, speed)` — `distance / speed`\n\nSince your cultists face the center, their `rotation` values increase clockwise. So `rank("rotation")` gives clockwise order!\n\nClick Continue.' },
                { prompt: () => ScriptKit.html.raw(
                    '<b>Update the Delays</b><br><br>'
                    + 'Open <code>[Scene] summoning</code> and update the Delay column:<br><br>'
                    + ScriptKit.html.table(
                        ['Filter', 'Delay', 'When', 'Command', 'Notes'],
                        [
                            ['<code>role=first</code>', '<code>stagger(rank("rotation"), 500)</code>', '', '<code>!choreograph echo ${token.name}: Liviate Viiopur Turola Ravla...</code>', ''],
                            ['<code>role=second</code>', '<code>2000 + stagger(rank("rotation"), 500)</code>', '', '<code>!choreograph echo ${token.name}: Insus Antioiauernus Lobaitis Broalgia...</code>', ''],
                            ['<code>role=third</code>', '<code>4000 + stagger(rank("rotation"), 500)</code>', '', '<code>!choreograph echo ${token.name}: Idishelligio Labyouin Vararum...</code>', ''],
                        ])
                    + '<br>Each group still starts at its fixed offset (0/2000/4000), but <i>within</i> the group, tokens fire 500ms apart in clockwise order.<br><br>'
                    + '<b>Save the handout</b>, then click Continue.'
                ) },
                { prompt: '**Test the Stagger**\n\nRun: `!choreograph run summoning --cast summoning`\n\nYou should see each group\'s cultists chant one at a time, sweeping clockwise — first group, then second, then third.',
                  ...ScriptKit.waitForCommand('!choreograph run')
                },
                { prompt: () => ScriptKit.html.raw(
                    '<b>Add a Chaotic Energy Row</b><br><br>'
                    + 'Add a 4th row to the scene — dark energy crackles at random intervals:<br><br>'
                    + ScriptKit.html.table(
                        ['Filter', 'Delay', 'When', 'Command', 'Notes'],
                        [
                            ['<code>&#42;</code>', '<code>rand(500, 5000)</code>', '', '<code>!choreograph echo &#x26;#x26;#x1F5F2; Dark energy crackles around ${token.name}!</code>', 'chaos'],
                        ])
                    + '<br>• <code>&#42;</code> matches all tokens regardless of role<br>'
                    + '• <code>rand(500, 5000)</code> gives each token a random delay between 0.5s and 5s<br>'
                    + '• This row runs in parallel with the chanting rows — overlapping effects!<br><br>'
                    + '<b>Save</b> and click Continue.'
                ) },
                { prompt: '**Run the Full Scene**\n\nRun: `!choreograph run summoning --cast summoning`\n\nNow you should see the clockwise chanting *plus* random dark energy messages firing chaotically on top.',
                  ...ScriptKit.waitForCommand('!choreograph run')
                },
                { prompt: '**Other Filter Syntax**\n\nYou\'ve used `*` (all) and `role=X` (by role). Other filters:\n\n• `name=Cultist*` — glob match on token name\n• `name=Cultist` — exact match\n• `!role=first` — negation (everyone EXCEPT role first)\n• `layer=objects` — only tokens on the objects layer\n• `token.left < 500` — expression filter (JS boolean)\n• Space-separated = AND: `role=first layer=objects`\n\nMultiple rows with different filters let you orchestrate complex parallel effects on different token subsets.\n\n**Key Takeaways:**\n• `stagger(rank("attr"), interval)` — sequential timing sorted by any attribute\n• `rand(min, max)` — randomized timing\n• Arithmetic works in delays: `2000 + stagger(...)`\n• `*` vs `role=X` vs `name=X` vs expressions — flexible targeting\n\nNext: we\'ll add a sacrifice token and compute distances from it.',
                  offerExamples: ['variables-and-templates']
                },
            ],
        });

        ScriptKit.Choreograph.registerExample(SCRIPT_NAME, {
            name: 'variables-and-templates',
            description: 'Compute distance from the sacrifice and use it in delays and commands.',
            guide: [
                { prompt: '**Variables & Templates**\n\nThe cultists chant in clockwise order, but the ritual should intensify based on proximity to the sacrifice at the center. Let\'s add computed variables that measure distance from the sacrifice token.\n\n**Prerequisite:** Complete "Filters & Delay". You need `[Scene] summoning` and `[Cast] summoning` with roles.\n\nClick Continue to begin.',
                  onContinue: () => {
                      if (!scenes().find('summoning')) return 'Scene "summoning" not found. Complete the previous tutorials first.';
                  }
                },
                { prompt: '**Add a Sacrifice Token**\n\nPlace a token in the center of the cultist circle. This is the sacrifice — the focal point of the ritual.\n\nAdd it to the cast with a new role:\n\n`!choreograph cast add summoning --role sacrifice`\n\n(Select the center token first.)',
                  ...ScriptKit.waitForCommand('!choreograph cast')
                },
                { prompt: '**The Variables Table**\n\nOpen `[Scene] summoning`. The second table is the **Variables** table (two columns: **Variable** | **Expression**).\n\nVariables are computed *per token* before the scene runs. They can reference:\n• `token.left`, `token.top`, `token.name`, etc. — the current token\'s properties\n• Any registered function — `distance()`, `rank()`, `actors()`, `role_ids()`, etc.\n• Parameters passed at runtime\n• Earlier variables (evaluated top-to-bottom)\n\nClick Continue.' },
                { prompt: () => ScriptKit.html.raw(
                    '<b>Add a Distance Variable</b><br><br>'
                    + 'In the Variables table, add this row:<br><br>'
                    + ScriptKit.html.table(
                        ['Variable', 'Expression'],
                        [
                            ['<code>dist</code>', '<code>distance(actors("role=sacrifice")[0])</code>'],
                        ])
                    + '<br><b>What this does:</b><br>'
                    + '• <code>actors("role=sacrifice")[0]</code> — gets the sacrifice token (nearest one in that role)<br>'
                    + '• <code>distance(...)</code> — computes pixel distance from the current token to the sacrifice<br>'
                    + '• The result is stored as <code>dist</code>, available in all delay expressions and commands for this token<br><br>'
                    + '<b>Save the handout</b>, then click Continue.'
                ) },
                { prompt: () => ScriptKit.html.raw(
                    '<b>Use Distance in a Command</b><br><br>'
                    + 'Add a new row to the Scene Table that uses <code>dist</code> in the command. This echoes each cultist\'s distance from the center:<br><br>'
                    + ScriptKit.html.table(
                        ['Filter', 'Delay', 'When', 'Command', 'Notes'],
                        [
                            ['<code>!role=sacrifice</code>', '<code>propagate(dist, 0.2)</code>', '', '<code>!choreograph echo ${token.name} is ${Math.round(dist)}px from the sacrifice</code>', 'distance echo'],
                        ])
                    + '<br><b>What\'s new here:</b><br>'
                    + '• <code>!role=sacrifice</code> — negation filter: all tokens EXCEPT the sacrifice<br>'
                    + '• <code>propagate(dist, 0.2)</code> — delay = distance / speed, so farther tokens fire later<br>'
                    + '• <code>${Math.round(dist)}</code> — use the variable in a command template with JS expressions<br><br>'
                    + '<b>Save</b> and click Continue.'
                ) },
                { prompt: '**Run It**\n\nRun: `!choreograph run summoning --cast summoning`\n\nYou should see:\n1. The chanting rows fire as before (clockwise stagger)\n2. The new distance row fires with timing based on proximity — closer cultists first, farther ones later\n3. Each message shows the actual pixel distance',
                  ...ScriptKit.waitForCommand('!choreograph run')
                },
                { prompt: '**Command Templates: Full Power**\n\nThe `${...}` syntax in commands is a full JavaScript template literal. You have access to:\n\n• All computed variables (`dist`, etc.)\n• `token.left`, `token.top`, `token.id`, `token.name`, etc.\n• All functions: `rank()`, `distance()`, `rand()`, `actors()`, etc.\n• JS expressions: `${dist > 100 ? "far" : "close"}`\n• String methods: `${token.name.toUpperCase()}`\n\n**Key Takeaways:**\n• Variables table = per-token computed values\n• Variables cascade top-to-bottom (later vars can use earlier ones)\n• `distance(target)` + `propagate(dist, speed)` = ripple-outward timing\n• `!filter` = negation (exclude a role/name/layer)\n• `${expr}` in commands = full JS evaluation\n\nNext: we\'ll make the chanting loop with escalating intensity.',
                  offerExamples: ['looping-and-sync']
                },
            ],
        });

        ScriptKit.Choreograph.registerExample(SCRIPT_NAME, {
            name: 'looping-and-sync',
            description: 'Make the ritual chanting loop with sync gating between cycles.',
            guide: [
                { prompt: '**Looping & Sync**\n\nThe summoning ritual should repeat — cultists chanting in cycles, energy building with each repetition. Choreograph\'s loop system handles this.\n\n**Prerequisite:** Complete "Variables & Templates". You need `[Scene] summoning` with roles, stagger delays, and the distance variable.\n\nClick Continue to begin.',
                  onContinue: () => {
                      if (!scenes().find('summoning')) return 'Scene "summoning" not found. Complete the previous tutorials first.';
                  }
                },
                { prompt: '**Loop Basics**\n\nLoop flags are added to the `run` command — they don\'t go in the handout:\n\n• `--loop` — repeat forever (until `!choreograph stop`)\n• `--loop 3` — repeat exactly 3 times, restart immediately\n• `--loop 3 --sync` — repeat 3 times, wait for ALL commands to finish before restarting\n\nExpressions **re-evaluate each cycle** — so `rand()` produces different results every iteration. The chant timing stays the same (deterministic), but the chaos energy row fires at new random times each loop.\n\nClick Continue.' },
                { prompt: '**Try Looping**\n\nRun the scene with 3 loops and sync:\n\n`!choreograph run summoning --cast summoning --loop 3 --sync`\n\n`--sync` means each cycle waits for the previous one to fully complete before restarting. You should see the full chant sequence play out 3 times. Notice how the random "dark energy" row fires at different times each cycle.',
                  ...ScriptKit.waitForCommand('!choreograph run')
                },
                { prompt: '**Infinite Loop + Stop**\n\nFor ambience or sustained effects, use unbounded looping:\n\n`!choreograph run summoning --cast summoning --loop`\n\nThis loops forever. To stop it:\n\n`!choreograph stop`\n\n(Or click the stop button on the status card that appears.)\n\nTry running it in a loop, then stopping it after a few cycles.',
                  ...ScriptKit.waitForCommand('!choreograph run')
                },
                { prompt: '**The SKIP Delay**\n\nSometimes you want a row to only fire on certain conditions. The special delay value `SKIP` causes a row to be skipped entirely for a token.\n\nYou can use it conditionally in an expression:\n\n`dist > 200 ? SKIP : propagate(dist, 0.2)`\n\nThis means: "If this token is more than 200px from the sacrifice, skip it. Otherwise, fire with propagation timing."\n\nThis is useful for limiting effects to nearby tokens. You don\'t need to add this to your scene right now — just know it exists for when you need conditional row execution.\n\nClick Continue.' },
                { prompt: '**Key Takeaways:**\n\n• `--loop N --sync` — bounded loop with completion gating\n• `--loop` — infinite, stopped with `!choreograph stop`\n• Expressions re-evaluate each cycle (randomness varies per iteration)\n• `SKIP` — conditionally skip a row for a token based on an expression\n• Sync ensures all commands finish before the next cycle begins\n• Loop flags live on the run command, not in the handout — same scene can be run with or without looping\n\nNext: we\'ll split the climax into a separate child scene triggered by chaining.',
                  offerExamples: ['chaining-and-recursion']
                },
            ],
        });

        ScriptKit.Choreograph.registerExample(SCRIPT_NAME, {
            name: 'chaining-and-recursion',
            description: 'Create a climax scene triggered by chaining — FX explosion when the ritual completes.',
            guide: [
                { prompt: '**Chaining & Recursion**\n\nThe ritual builds to a climax — but the climax is a separate effect (explosion, reveal, etc.). Choreograph lets one scene **chain** into another, passing parameters between them.\n\n**Prerequisite:** Complete "Looping & Sync".\n\nClick Continue to begin.',
                  onContinue: () => {
                      if (!scenes().find('summoning')) return 'Scene "summoning" not found. Complete the previous tutorials first.';
                  }
                },
                { prompt: '**Create the Climax Scene**\n\nRun: `!choreograph new summoning-climax`\n\nThis will hold the dramatic finale — an explosion of energy at the sacrifice.',
                  ...ScriptKit.waitForCommand('!choreograph new'),
                  onContinue: () => {
                      if (!scenes().find('summoning-climax')) return 'Scene "summoning-climax" not found. Run `!choreograph new summoning-climax`.';
                  }
                },
                { prompt: () => ScriptKit.html.raw(
                    '<b>Fill in the Climax Scene</b><br><br>'
                    + 'Open <code>[Scene] summoning-climax</code> and set up a simple explosion effect:<br><br>'
                    + ScriptKit.html.table(
                        ['Filter', 'Delay', 'When', 'Command', 'Notes'],
                        [
                            ['<code>role=sacrifice</code>', '<code>0</code>', '', '<code>!choreograph fx nova-holy ${token.left} ${token.top}</code>', 'explosion'],
                            ['<code>&#42;</code>', '<code>500</code>', '', '<code>!choreograph echo The ritual is complete! A being emerges from the void...</code>', 'reveal'],
                        ])
                    + '<br>The climax scene targets the sacrifice token for the FX, then announces the result.<br><br>'
                    + '<b>Save the handout</b>, then click Continue.'
                ) },
                { prompt: () => ScriptKit.html.raw(
                    '<b>Chain from the Main Scene</b><br><br>'
                    + 'Open <code>[Scene] summoning</code> and add a final row that triggers the climax. We use the <b>When</b> column to ensure only one token fires it:<br><br>'
                    + ScriptKit.html.table(
                        ['Filter', 'Delay', 'When', 'Command', 'Notes'],
                        [
                            ['<code>role=sacrifice</code>', '<code>6000</code>', '', '<code>!choreograph run summoning-climax --cast summoning</code>', 'chain to climax'],
                        ])
                    + '<br><b>What\'s happening:</b><br>'
                    + '• <code>role=sacrifice</code> — only the sacrifice token fires this row (so it only triggers once)<br>'
                    + '• <code>6000</code> — waits 6 seconds (after all chanting finishes)<br>'
                    + '• The command runs <code>summoning-climax</code> with the same cast<br>'
                    + '• Choreograph auto-injects <code>--parent</code> and <code>--depth</code> for chain management<br><br>'
                    + '<b>Save</b> and click Continue.'
                ) },
                { prompt: '**Run the Complete Ritual**\n\nRun: `!choreograph run summoning --cast summoning`\n\nYou should see:\n1. Clockwise chanting from each group\n2. Random dark energy crackling\n3. Distance-based propagation\n4. After 6 seconds — the climax scene fires: nova FX + reveal message',
                  ...ScriptKit.waitForCommand('!choreograph run')
                },
                { prompt: '**Chaining Concepts:**\n\n• Any `!choreograph run` in a command template chains to that scene\n• `--parent` and `--depth` are auto-injected (prevents infinite recursion)\n• `--depth 10` is the default max — at depth 0, child scenes are skipped\n• `${self}` in a command resolves to the current scene name (useful for recursive scenes)\n• Child scenes inherit the parent\'s cast if you pass `--cast`\n\n**The When Column:**\n\nThe When column is a JS expression. If it returns falsy, the row is skipped for that token:\n• `role=sacrifice` as a filter already limits *which* tokens fire\n• When is for more complex conditions: `dist < 100`, `token.name === "Leader"`, etc.\n• Combined with `${self}` and a decreasing counter param, you can build recursive patterns\n\n**Congratulations!** You\'ve built a complete multi-phase ritual summoning scene with roles, timing, variables, and chaining. From here, experiment with:\n• `--loop 3 --sync` on the main scene for repeated chants before the climax\n• `!sequence play` commands for smooth animations (requires Sequence)\n• `!token-mod` for visual changes (tint, size, layer, status markers)',
                  offerExamples: ['your-first-scene', 'roles-and-casts', 'filters-and-delay', 'variables-and-templates', 'looping-and-sync']
                },
            ],
        });

        // Register Choreograph with itself for child cascading
        registerLifecycleHook(SCRIPT_NAME, {
            commands: [/^!choreograph run /],
            start: (ctx) => {
                // ctx is msg-shaped from Choreograph's execution engine
                handleInput(ctx, { internal: true });
            },
            stop: (ctx) => {
                Object.values(runningScenes)
                    .filter(s => s.parentId === ctx.sceneInfo.instanceId)
                    .forEach(s => stopScene(s.id));
            },
            pause: (ctx) => {
                Object.values(runningScenes)
                    .filter(s => s.parentId === ctx.sceneInfo.instanceId)
                    .forEach(s => pauseScene(s.id));
            },
            resume: (ctx) => {
                Object.values(runningScenes)
                    .filter(s => s.parentId === ctx.sceneInfo.instanceId)
                    .forEach(s => resumeScene(s.id));
            },
        });

        // Register as sync participant — wait for children to finish
        registerSyncParticipant(SCRIPT_NAME, {
            commands: [/^!choreograph run /],
            waiting: (ctx) => {
                const children = Object.values(runningScenes)
                    .filter(s => s.parentId === ctx.sceneInfo.instanceId);
                if (children.length === 0) { ctx.done(); return; }
                // Poll for children to finish
                const check = setInterval(() => {
                    const remaining = Object.values(runningScenes)
                        .filter(s => s.parentId === ctx.sceneInfo.instanceId);
                    if (remaining.length === 0) {
                        clearInterval(check);
                        ctx.done();
                    }
                }, 100);
            },
        });


        log(`-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} Initialized <=-`);
    };

    const registerEventHandlers = () => {
        on('chat:message', handleInput);
        on('change:handout:notes', (handout) => {
            const [tag, name] = HandoutCache.getHandoutTagAndName(handout.get('name'));
            const cache = handoutCache[tag];
            if (cache !== undefined) {
                delete cache.cache[name];
                cache.load(name, () => {});
            }
        });
        on('destroy:handout', (handout) => {
            const [tag, name] = HandoutCache.getHandoutTagAndName(handout.get('name'));
            const cache = handoutCache[tag];
            if (cache !== undefined) {
                delete cache.cache[name];
            }
        });
    };

    return {
        checkInstall,
        registerEventHandlers,
        // Public Extension API
        registerFunction,
        registerTokenVariable,
        registerParameterType,
        registerConstant,
        registerLifecycleHook,
        registerSyncParticipant,

        generateExtensionHandout,
        // Introspection
        getFunction:      (name) => EXT_FUNCTIONS[name] || null,
        getVariable:      (name) => EXT_TOKEN_VARS[name] || null,
        getConstant:      (name) => EXT_CONSTANTS[name] || null,
        getParameterType: (name) => EXT_PARAM_TYPES[name] || null,
    };
})();

on('ready', () => {
    'use strict';
    Choreograph.checkInstall();
    Choreograph.registerEventHandlers();
});
