// =============================================================================
// Choreograph v0.1
// Last Updated: 2026-06-07
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
          playerIsGM, log, _, setInterval, clearInterval, setTimeout, Date */

var Choreograph = Choreograph || (() => {
    'use strict';

    const SCRIPT_NAME    = 'Choreograph';
    const SCRIPT_VERSION = '0.1';
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
    const EXT_LIFECYCLE      = []; // [{ source, stop, pause, resume }]
    const EXT_SYNC           = []; // [{ source, waiting: fn }]

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
        return true;
    };

    const registerLifecycleHook = (sourceId, struct) => {
        const src = sourceId || SCRIPT_NAME;
        EXT_LIFECYCLE.push(Object.assign({ source: src, stop: null, pause: null, resume: null }, struct));
        return true;
    };

    const fireLifecycleHooks = (event, instance) => {
        const firedCommands = instance.firedCommands || [];
        EXT_LIFECYCLE.forEach(hook => {
            const fn = hook[event];
            if (typeof fn !== 'function') return;
            firedCommands.forEach(entry => {
                fn({ tokens: entry.tokens, command: entry.command, instanceId: instance.id });
            });
        });
    };

    const registerSyncParticipant = (sourceId, struct) => {
        const src = sourceId || SCRIPT_NAME;
        if (typeof struct.waiting !== 'function') {
            log(`${SCRIPT_NAME}: [${src}] registerSyncParticipant — missing waiting function`);
            return false;
        }
        EXT_SYNC.push(Object.assign({ source: src }, struct));
        return true;
    };

    /**
     * Fire sync — calls all registered sync participants and invokes onResolved
     * when all have called done() or timeout expires.
     */
    const fireSync = (instance, onResolved, timeoutMs) => {
        if (EXT_SYNC.length === 0) { onResolved(); return; }

        let remaining = EXT_SYNC.length;
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

        const context = {
            tokens:   (instance.firedCommands || []).flatMap(e => e.tokens),
            commands: (instance.firedCommands || []).map(e => e.command),
            instanceId: instance.id,
        };

        EXT_SYNC.forEach(participant => {
            let called = false;
            participant.waiting(Object.assign({}, context, {
                done: () => {
                    if (called) return;
                    called = true;
                    checkDone();
                    if (resolved) clearTimeout(timeout);
                },
            }));
        });
    };

    const generateExtensionHandout = (sourceId, opts = {}) => {
        const src = sourceId || SCRIPT_NAME;
        const { name = src, description = '', sections = [] } = opts;
        const handoutName = `Help: ${SCRIPT_NAME}/${name}`;
        let hh = findObjs({ type: 'handout', name: handoutName })[0];
        if (!hh) {
            hh = createObj('handout', {
                name:             handoutName,
                inplayerjournals: 'all',
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

    const reply = (msg, tag, text, noarchive = false) => {
        const body      = text !== undefined ? text : tag;
        const prefix    = text !== undefined ? ` [${tag}]` : '';
        const recipient = msg.who.split(' ')[0];
        sendChat(`${SCRIPT_NAME}${prefix}`, `/w ${recipient} ${body}`,
            null, noarchive ? { noarchive: true } : undefined);
    };

    const replyError = (msg, text) => reply(msg, 'Error', text);

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
                inplayerjournals: '',
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

        // Scene table
        html += `<table style="border-collapse:collapse;width:100%;font-size:12px;">`;
        html += `<tr><th style="${STYLE.th}">Filter</th>`;
        html += `<th style="${STYLE.th}">Delay (ms)</th>`;
        html += `<th style="${STYLE.th}">Command</th>`;
        html += `<th style="${STYLE.th}">Notes</th></tr>`;
        (scene.rows || []).forEach(row => {
            html += `<tr><td style="${STYLE.td}">${escHtml(row.filter)}</td>`;
            html += `<td style="${STYLE.td}">${escHtml(row.delay)}</td>`;
            html += `<td style="${STYLE.td}">${escHtml(row.command)}</td>`;
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
                { filter: '*', delay: '0', command: '', notes: 'Example row — add your command here' },
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

            // Parse rows
            const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
            rowRe.exec(tableHtml); // skip header row
            let rowMatch;
            while ((rowMatch = rowRe.exec(tableHtml)) !== null) {
                const cells = [];
                const tdRe = /<td[^>]*>([\s\S]*?)<\/td>/gi;
                let tdMatch;
                while ((tdMatch = tdRe.exec(rowMatch[1])) !== null) {
                    cells.push(stripTags(tdMatch[1]));
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
                    scene.rows.push({
                        filter:  cells[0] || '',
                        delay:   cells[1] || '0',
                        command: cells[2] || '',
                        notes:   cells[3] || '',
                    });
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
        const sender = msg ? msg.who.split(' ')[0] : 'gm';
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
                Object.entries(byCommand).forEach(([command, tokenIds]) => {
                    const selectSuffix = ` {& select ${tokenIds.join(', ')}}`;
                    sendChat(sender, command + selectSuffix);
                    // Track fired commands for lifecycle hooks
                    instance.firedCommands = instance.firedCommands || [];
                    instance.firedCommands.push({
                        tokens: tokenIds.map(id => getObj('graphic', id)).filter(Boolean),
                        command,
                    });
                });
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
    const evalFilterCondition = (condition, token, castData) => {
        const c = condition.trim();
        if (!c || c === '*') return true;

        // Negation
        if (c.startsWith('!')) {
            return !evalFilterCondition(c.slice(1), token, castData);
        }

        // key=value patterns
        const eqIdx = c.indexOf('=');
        if (eqIdx !== -1) {
            const key = c.slice(0, eqIdx).toLowerCase();
            const val = c.slice(eqIdx + 1);

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

        return false;
    };

    /**
     * Evaluate a full filter string (space-separated AND conditions).
     */
    const evalFilter = (filterStr, token, castData) => {
        if (!filterStr.trim()) return false; // empty = no match
        if (filterStr.trim() === '*') return true;
        const conditions = filterStr.trim().split(/\s+/);
        return conditions.every(c => evalFilterCondition(c, token, castData));
    };

    // =========================================================================
    // Delay expression evaluation
    // =========================================================================

    /**
     * Build the expression scope for a token in context.
     */
    const buildTokenScope = (token, filteredTokens, params) => {
        return {
            left:   token.get('left'),
            top:    token.get('top'),
            name:   token.get('name') || '',
            layer:  token.get('layer'),
            width:  token.get('width'),
            height: token.get('height'),
            count:  filteredTokens.length,
            INF:    Infinity,
            SKIP:   Infinity,
            // Built-in functions
            distance: (x, y) => {
                if (typeof x === 'object' && x !== null) {
                    // distance(tokenObj) sugar
                    y = x.top || x.get('top');
                    x = x.left || x.get('left');
                }
                const dx = token.get('left') - x;
                const dy = token.get('top') - y;
                return Math.sqrt(dx * dx + dy * dy);
            },
            propagate: (dist, speed) => dist / speed,
            stagger:   (rank, interval) => rank * interval,
            rank: (attr) => {
                let sorted;
                if (typeof attr === 'function') {
                    sorted = [...filteredTokens].sort((a, b) => attr(a) - attr(b));
                } else if (typeof attr === 'string') {
                    sorted = [...filteredTokens].sort((a, b) =>
                        (a.get(attr) || 0) - (b.get(attr) || 0)
                    );
                } else {
                    // attr is a number — caller passed the value of a variable
                    // Fall back to sorting by that same property for all tokens
                    // Can't determine which property, so just return index in cast
                    return filteredTokens.indexOf(token);
                }
                return sorted.indexOf(token);
            },
            rand:    (min, max) => min + Math.random() * (max - min),
            randInt: (min, max) => Math.floor(min + Math.random() * (max + 1 - min)),
            clamp:   (v, lo, hi) => Math.min(Math.max(v, lo), hi),
            abs:     Math.abs,
            round:   Math.round,
            floor:   Math.floor,
            ceil:    Math.ceil,
            min:     Math.min,
            max:     Math.max,
            sqrt:    Math.sqrt,
            pow:     Math.pow,
            sin:     Math.sin,
            cos:     Math.cos,
            PI:      Math.PI,
            TAU:     Math.PI * 2,
        };

        // Inject registered extension functions
        Object.values(EXT_FUNCTIONS).forEach(reg => {
            const name = reg.namespace === 'core' ? reg.name : `${reg.namespace}_${reg.name}`;
            scope[name] = (...args) => reg.fn(token, filteredTokens, params, ...args);
        });

        // Inject registered token variables
        Object.values(EXT_TOKEN_VARS).forEach(reg => {
            const name = reg.namespace === 'core' ? reg.name : `${reg.namespace}_${reg.name}`;
            scope[name] = reg.fn(token, { tokens: filteredTokens, params });
        });

        // Inject registered constants
        Object.values(EXT_CONSTANTS).forEach(reg => {
            const name = reg.namespace === 'core' ? reg.name : `${reg.namespace}_${reg.name}`;
            scope[name] = reg.value;
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
    // Scene execution
    // =========================================================================

    /**
     * Execute a scene: gather cast, evaluate rows, build queue, fire commands.
     */
    const executeScene = (scene, cast, params, msg, castData, loopOpts) => {
        const instanceId = genInstanceId();
        const queue = [];

        // Resolve params — merge defaults with provided values
        const resolvedParams = {};
        scene.params.forEach(p => {
            if (p.name === 'cast') return; // handled separately
            resolvedParams[p.name] = params[p.name] !== undefined
                ? params[p.name]
                : (p.default || null);
        });

        // Precompute variables per token
        const tokenVars = {};
        if (scene.variables && scene.variables.length > 0) {
            cast.forEach(token => {
                const scope = buildTokenScope(token, cast, resolvedParams);
                Object.assign(scope, resolvedParams);
                scope.tokenId   = token.get('id');
                scope.tokenName = token.get('name') || '';
                const vars = {};
                scene.variables.forEach(v => {
                    if (!v.name || !v.expression) return;
                    scope[v.name] = evalDelay(v.expression, scope);
                    vars[v.name] = scope[v.name];
                });
                tokenVars[token.get('id')] = vars;
            });
        }

        // For each row, evaluate filter on all cast, then compute delays
        scene.rows.forEach((row, rowIndex) => {
            // Filter cast
            const filtered = cast.filter(token => evalFilter(row.filter, token, castData));
            if (filtered.length === 0) return;

            // For each matching token, evaluate delay and build queue entry
            filtered.forEach(token => {
                const scope = buildTokenScope(token, filtered, resolvedParams);
                // Add resolved params to scope
                Object.assign(scope, resolvedParams);
                // Add computed variables
                Object.assign(scope, tokenVars[token.get('id')] || {});
                // Add tokenId and tokenName for command templates
                scope.tokenId   = token.get('id');
                scope.tokenName = token.get('name') || '';

                // Check for sync delay
                if (row.delay.trim().toLowerCase() === 'sync') {
                    queue.push({ time: -1, rowIndex, isSync: true });
                    return;
                }

                const delay = evalDelay(row.delay, scope);
                if (!isFinite(delay)) return; // INF/SKIP

                const command = evalCommand(row.command, scope);
                if (!command) return;

                queue.push({ time: delay, rowIndex, tokenId: scope.tokenId, command });
            });
        });

        // Sort queue by time, break ties by rowIndex
        queue.sort((a, b) => a.time - b.time || a.rowIndex - b.rowIndex);

        // Register running scene
        const instance = {
            id:       instanceId,
            name:     scene.name,
            queue,
            timers:   [],
            cast,
            params:   resolvedParams,
            state:    'running',
            startTime: Date.now(),
            firedCommands: [],
            loop: loopOpts || null, // { unbounded: bool, remaining: number|null, sync: bool }
        };
        runningScenes[instanceId] = instance;

        // Handle scene completion — loop or cleanup
        const finishScene = () => {
            const loop = instance.loop;
            if (!loop) {
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
                delete runningScenes[instanceId];
            }
        };

        // Execute queue — split at sync points, chain chunks
        const sender = msg.who.split(' ')[0];
        const syncTimeout = opts['sync-timeout'] ? parseInt(opts['sync-timeout'], 10) : 30000;

        // Split queue into chunks separated by sync markers
        const chunks = [[]];
        queue.forEach(entry => {
            if (entry.isSync) {
                chunks.push([]); // start new chunk after sync
            } else {
                chunks[chunks.length - 1].push(entry);
            }
        });

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
                    Object.entries(byCommand).forEach(([command, tokenIds]) => {
                        const selectSuffix = ` {& select ${tokenIds.join(', ')}}`;
                        sendChat(sender, command + selectSuffix);
                        instance.firedCommands.push({
                            tokens: tokenIds.map(id => getObj('graphic', id)).filter(Boolean),
                            command,
                        });
                    });
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

    const handleInput = (msg) => {
        if (msg.type !== 'api') return;
        if (msg.content.split(' ')[0] !== CMD_TOKEN) return;

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
                // Stop all instances of this scene
                const matches = Object.entries(runningScenes)
                    .filter(([, s]) => s.name === name);
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
                    .filter(([, s]) => s.name === name && s.state === 'running');
                if (matches.length === 0) { replyError(msg, `No running scene named "${name}" to pause.`); return; }
                matches.forEach(([id]) => pauseScene(id));
                reply(msg, 'Choreograph', `Paused ${matches.length} instance(s) of "${escHtml(name)}".`);
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
                    .filter(([, s]) => s.name === name && s.state === 'paused');
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

                    const knownFlags = new Set(['id', 'force', 'loop', 'depth', 'page', 'cast', 'sync', 'sync-timeout']);
                    const params = {};
                    Object.entries(opts).forEach(([k, v]) => {
                        if (!knownFlags.has(k) && typeof v === 'string') params[k] = v;
                    });

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

                    const instanceId = executeScene(scene, cast, params, msg, castData || null, loopOpts);
                    reply(msg, 'Choreograph',
                        `Running "${escHtml(name)}" on ${cast.length} token(s). `
                        + `Instance: <code>${instanceId}</code>`);
                });
            };

            if (opts.cast) {
                casts().load(String(opts.cast), (castData) => {
                    if (!castData) {
                        replyError(msg, `No cast named "${opts.cast}" found.`);
                        return;
                    }
                    getAllCastIds(castData).forEach(id => castIds.push(id));
                    runWithCast(castData);
                });
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

        // ---- echo (debug/test) ----
        if (cmd === 'echo') {
            const text = rest.join(' ');
            reply(msg, 'Echo', text, true);
            return;
        }

        replyError(msg, `Unknown command: ${cmd}. Commands: new, list, edit, delete, run, stop, refresh.`);
    };

    // =========================================================================
    // Initialization
    // =========================================================================

    const checkInstall = () => {
        state[SCRIPT_NAME] = state[SCRIPT_NAME] || {};

        log(`-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} Initialized <=-`);

        // Signal extensions that Choreograph is ready
        sendChat('', `!${SCRIPT_NAME.toLowerCase()}-ready`, null, { noarchive: true });
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
