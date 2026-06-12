// =============================================================================
// Choreograph v0.2
// Last Updated: 2026-06-12
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
          sendPing, spawnFx, spawnFxBetweenPoints */

var Choreograph = Choreograph || (() => {
    'use strict';

    const SCRIPT_NAME    = 'Choreograph';
    const SCRIPT_VERSION = '0.2';
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
    const EXT_EXAMPLES       = {}; // { 'name': { name, description, source, scene } }

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
    const registerExample = (sourceId, struct) => {
        const src = sourceId || SCRIPT_NAME;
        const { name, description = '', scene } = struct;
        if (!name || !scene) {
            log(`${SCRIPT_NAME}: [${src}] registerExample — missing name or scene`);
            return false;
        }
        if (EXT_EXAMPLES[name]) return false; // no-op on duplicate
        EXT_EXAMPLES[name] = { name, description, source: src, scene, onGenerate: struct.onGenerate || null };
        return true;
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
                    // Parse command cell: split on <p> boundaries for multi-command cells
                    const rawCmd = rawCells[2] || '';
                    const commands = rawCmd
                        .replace(/<\/p>\s*<p[^>]*>/gi, '\n')
                        .replace(/<\/?p[^>]*>/gi, '')
                        .replace(/<br[^>]*>/gi, '\n')
                        .replace(/<[^>]+>/g, '')
                        .split('\n')
                        .map(s => s.trim())
                        .filter(Boolean);
                    scene.rows.push({
                        filter:   cells[0] || '',
                        delay:    cells[1] || '0',
                        commands: commands,
                        notes:    cells[3] || '',
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

    // =========================================================================
    // Delay expression evaluation
    // =========================================================================

    /**
     * Build the expression scope for a token in context.
     */
    const buildTokenScope = (token, filteredTokens, params) => {
        const scope = {
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
                    // Accept TokenProxy (.left/.top) or Roll20 obj (.get('left'))
                    y = x.top !== undefined ? x.top : (x.get ? x.get('top') : 0);
                    x = x.left !== undefined ? x.left : (x.get ? x.get('left') : 0);
                }
                const dx = token.get('left') - x;
                const dy = token.get('top') - y;
                return Math.sqrt(dx * dx + dy * dy);
            },
            propagate: (dist, speed) => dist / speed,
            stagger:   (rank, interval) => rank * interval,
            wave:      (pos, wavelength, duration) => ((pos % wavelength) / wavelength) * (duration || wavelength),
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

        // actors(filter?) — returns tokens sorted by distance from current token
        // actor_ids(filter?) — returns token ID strings
        // LINQ-inspired enriched array — returned by actors() and similar
        // Get a comparable identity from any item (token ID, or the value itself)
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

        const ctx = { tokens: filteredTokens, params };

        scope.actors = (filterStr) => {
            const set = filterStr
                ? filteredTokens.filter(t => evalFilter(filterStr, t, null))
                : filteredTokens;
            const tx = token.get('left'), ty = token.get('top');
            const sorted = [...set].sort((a, b) => {
                const da = Math.pow(a.get('left') - tx, 2) + Math.pow(a.get('top') - ty, 2);
                const db = Math.pow(b.get('left') - tx, 2) + Math.pow(b.get('top') - ty, 2);
                return da - db;
            });
            return enrichArray(sorted.map(t => wrapToken(t, ctx)));
        };
        scope.actor_ids = (filterStr) => enrichArray(scope.actors(filterStr).map(t => t.id));

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
            }
            resolvedParams[p.name] = val;
        });

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
                    scope[v.name] = evalDelay(v.expression, scope);
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

        // ---- help / --help ----
        if (cmd === 'help' || cmd === '--help') {
            reply(msg, SCRIPT_NAME, `<b>${SCRIPT_NAME} v${SCRIPT_VERSION}</b><br><br>`
                + `<b>Scene commands:</b><br>`
                + `${CMD_TOKEN} run &lt;name&gt; [flags] — execute a scene<br>`
                + `${CMD_TOKEN} new &lt;name&gt; — create blank scene<br>`
                + `${CMD_TOKEN} list [query] — list scenes<br>`
                + `${CMD_TOKEN} edit &lt;name&gt; — open handout<br>`
                + `${CMD_TOKEN} delete &lt;name&gt; — delete scene<br>`
                + `${CMD_TOKEN} refresh &lt;name&gt; — regenerate handout<br>`
                + `${CMD_TOKEN} add-row &lt;name&gt; — add blank row<br><br>`
                + `<b>Playback:</b><br>`
                + `${CMD_TOKEN} stop [name] — stop scene(s)<br>`
                + `${CMD_TOKEN} pause [name] — pause scene(s)<br>`
                + `${CMD_TOKEN} resume [name] — resume scene(s)<br>`
                + `${CMD_TOKEN} status — show running scenes<br><br>`
                + `<b>Cast:</b><br>`
                + `${CMD_TOKEN} cast add/remove/list/show/delete<br><br>`
                + `<b>Help:</b><br>`
                + `${CMD_TOKEN} man [topic] — detailed help by topic<br>`
                + `${CMD_TOKEN} gen-dev-docs — generate extension guide<br>`);
            return;
        }

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

                    const runtimeOpts = {
                        parent: opts.parent || null,
                        depth:  opts.depth !== undefined ? parseInt(opts.depth, 10) : 10,
                        syncTimeout: opts['sync-timeout'] ? parseInt(opts['sync-timeout'], 10) : 30000,
                    };

                    const instanceId = executeScene(scene, cast, params, msg, castData || null, loopOpts, runtimeOpts);
                    const inst = runningScenes[instanceId];
                    const iName = inst ? inst.instanceName : instanceId;
                    // Only show status card for user-initiated runs
                    if (msg.playerid !== 'API') {
                        let card = `<div style="background:#222;color:#fff;padding:6px;border-radius:4px;font-size:12px;">`;
                        card += `<b>${escHtml(name)}</b> — ${cast.length} token(s)<br>`;
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

        // ---- example ----
        if (cmd === 'example' || cmd === 'examples') {
            const exName = args[0];
            if (!exName || exName === 'list') {
                const examples = Object.values(EXT_EXAMPLES);
                if (examples.length === 0) {
                    reply(msg, 'Examples', 'No examples registered.');
                    return;
                }
                let out = `<b>${examples.length} example(s) available:</b><br>`;
                examples.forEach(ex => {
                    const sceneName = `example-${ex.name}`;
                    const exists = scenes().find(sceneName);
                    out += `• <b>${escHtml(ex.name)}</b>`;
                    if (ex.description) out += ` — ${escHtml(ex.description)}`;
                    out += ` <i>[${escHtml(ex.source)}]</i> `;
                    out += btnHtml(exists ? '🔄 Regen' : '+ Generate', `${CMD_TOKEN} example ${ex.name}`);
                    if (exists) {
                        out += btnHtml('▶ Run', `${CMD_TOKEN} run ${sceneName}`);
                        out += ` <a href="http://journal.roll20.net/handout/${exists.get('id')}">[Open]</a>`;
                    }
                    out += `<br>`;
                });
                reply(msg, 'Examples', out);
                return;
            }

            const ex = EXT_EXAMPLES[exName];
            if (!ex) {
                replyError(msg, `No example named "${exName}". Use ${CMD_TOKEN} example list.`);
                return;
            }

            // Generate the scene handout
            const sceneName = `example-${exName}`;
            const scene = Object.assign({ name: sceneName }, ex.scene);
            // Ensure cast param
            if (!scene.params) scene.params = [];
            if (!scene.params.find(p => p.name === 'cast')) {
                scene.params.unshift({ name: 'cast', type: 'token[]', default: 'selected', description: 'Tokens to run the scene on (built-in)' });
            }
            if (!scene.variables) scene.variables = [];
            if (!scene.rows) scene.rows = [];

            const handout = scenes().getOrCreate(sceneName);
            setHandoutNotes(handout, generateSceneHtml(sceneName, scene));
            scenes().cache[sceneName] = scene;

            // Call onGenerate hook if provided (e.g. to set up recordings)
            if (typeof ex.onGenerate === 'function') ex.onGenerate(sceneName);

            reply(msg, 'Examples',
                `Generated example scene "<b>${escHtml(sceneName)}</b>". `
                + `<a href="http://journal.roll20.net/handout/${handout.get('id')}">[Open Handout]</a> `
                + btnHtml('▶ Run', `${CMD_TOKEN} run ${sceneName}`));
            return;
        }

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

        // ---- man ----
        if (cmd === 'man') {
            const topic = args[0] || '';

            if (!topic) {
                reply(msg, 'Man', '<b>Choreograph Help Topics:</b><br>'
                    + '• <b>filters</b> — filter syntax<br>'
                    + '• <b>delay</b> — delay expressions and functions<br>'
                    + '• <b>commands</b> — command template syntax<br>'
                    + '• <b>cast</b> — cast system<br>'
                    + '• <b>sync</b> — sync system<br>'
                    + '• <b>loop</b> — looping<br>'
                    + '• <b>chain</b> — scene chaining and recursion<br>'
                    + '• <b>params</b> — parameter types<br>'
                    + '• <b>vars</b> — variables and scope<br>'
                    + '• <b>api</b> — extension API<br>'
                    + '• <b>func</b> — registered functions<br>'
                    + '• <b>tokenvar</b> — registered token variables<br>'
                    + '• <b>const</b> — registered constants<br>');
                return;
            }

            const c = (t) => `<code>${t}</code>`;

            if (topic === 'filters') {
                reply(msg, 'Man', '<b>Filters</b><br>'
                    + `${c('*')} all tokens<br>`
                    + `${c('layer=X')} on layer X<br>`
                    + `${c('name=X*')} name glob<br>`
                    + `${c('id=-ABC')} specific ID<br>`
                    + `${c('role=X')} cast role<br>`
                    + `${c('status=X')} has status marker<br>`
                    + `${c('!prefix')} negation<br>`
                    + 'Space-separated = AND. Multiple rows = OR. Empty = no match.');
                return;
            }

            if (topic === 'delay') {
                reply(msg, 'Man', '<b>Delay Expressions</b><br>'
                    + 'Return: number (ms), INF/SKIP, or sync.<br><br>'
                    + '<b>Variables:</b> left, top, name, layer, width, height, count, INF, SKIP, self, tokenId, tokenName<br><br>'
                    + '<b>Functions:</b><br>'
                    + `${c('rank("attr")')} — sort position in filtered set<br>`
                    + `${c('distance(x, y)')} — pixel distance (or ${c('distance(orig)')})<br>`
                    + `${c('propagate(dist, speed)')} — dist / speed<br>`
                    + `${c('stagger(rank, interval)')} — rank × interval<br>`
                    + `${c('rand(min, max)')} — random number<br>`
                    + `${c('randInt(min, max)')} — random integer<br>`
                    + `${c('clamp(v, lo, hi)')} — clamp<br>`
                    + `${c('actors(filter?)')} — tokens sorted by distance<br>`
                    + `${c('actor_ids(filter?)')} — token IDs sorted by distance<br>`
                    + '<br><b>Constants:</b> PI, TAU');
                return;
            }

            if (topic === 'commands' || topic === 'templates') {
                reply(msg, 'Man', '<b>Command Templates</b><br>'
                    + `Use ${c('${expr}')} for substitutions. Evaluated as JS template literals.<br><br>`
                    + `Example: ${c('!sequence play ${anim} ignore-selected ${token.id}')}<br>`
                    + `Conditional: ${c('${counter > 1 ? "!choreograph run " + self : ""}')}<br><br>`
                    + 'All variables, params, computed variables, and functions are in scope.');
                return;
            }

            if (topic === 'cast') {
                reply(msg, 'Man', '<b>Cast System</b><br>'
                    + `Stored in ${c('[Cast] <name>')} handouts with roles.<br><br>`
                    + `${c('!choreograph cast add <name> [--role R]')} — add tokens<br>`
                    + `${c('!choreograph cast remove <name> [--role R]')} — remove<br>`
                    + `${c('!choreograph cast list')} / ${c('show')} / ${c('delete')}<br><br>`
                    + `Use ${c('--cast <name>')} in run. Filter with ${c('role=X')}.`);
                return;
            }

            if (topic === 'sync') {
                reply(msg, 'Man', '<b>Sync</b><br>'
                    + `Use ${c('sync')} as a delay value. Waits for all registered sync participants to signal completion before continuing.<br><br>`
                    + 'Useful for gating recursion or phase transitions on animation completion.');
                return;
            }

            if (topic === 'loop') {
                reply(msg, 'Man', '<b>Looping</b><br>'
                    + `${c('--loop')} — infinite, sync each cycle<br>`
                    + `${c('--loop N')} — N times, immediate restart<br>`
                    + `${c('--loop N --sync')} — N times, sync between cycles<br><br>`
                    + 'Top-level only. Children cannot loop. Expressions re-evaluate each cycle.');
                return;
            }

            if (topic === 'chain' || topic === 'recursion') {
                reply(msg, 'Man', '<b>Scene Chaining</b><br>'
                    + `${c('self')} resolves to current scene name.<br>`
                    + `${c('--parent')} and ${c('--depth')} are auto-injected.<br>`
                    + `At depth 0, child spawns are skipped.<br>`
                    + `Children cannot use ${c('--loop')}.<br><br>`
                    + `Example: ${c('!choreograph run ${self} --counter ${counter - 1}')}`);
                return;
            }

            if (topic === 'params' || topic === 'parameters') {
                reply(msg, 'Man', '<b>Parameter Types</b><br>'
                    + 'number, text, boolean, token, path, sequence, scene, role<br>'
                    + 'Append [] for arrays (e.g. token[], number[]).<br><br>'
                    + `${c('cast')} is built-in (token[], default: selected).<br>`
                    + 'Params without defaults are required at run time.');
                return;
            }

            if (topic === 'vars' || topic === 'variables') {
                reply(msg, 'Man', '<b>Variables</b><br>'
                    + 'Defined in the Variables table (Variable | Expression).<br>'
                    + 'Computed once per token before execution.<br>'
                    + 'Later variables can reference earlier ones.<br>'
                    + 'Available in all delay expressions and command templates.');
                return;
            }

            if (topic === 'api' || topic === 'extension') {
                reply(msg, 'Man', '<b>Extension API</b><br>'
                    + `${c('Choreograph.registerFunction(src, struct)')}<br>`
                    + `${c('Choreograph.registerTokenVariable(src, struct)')}<br>`
                    + `${c('Choreograph.registerConstant(src, struct)')}<br>`
                    + `${c('Choreograph.registerParameterType(src, struct)')}<br>`
                    + `${c('Choreograph.registerLifecycleHook(src, struct)')}<br>`
                    + `${c('Choreograph.registerSyncParticipant(src, struct)')}<br>`
                    + `${c('Choreograph.generateExtensionHandout(src, opts)')}<br><br>`
                    + 'Run !choreograph gen-dev-docs for the full developer guide.');
                return;
            }

            if (topic === 'func' || topic === 'functions') {
                const regs = Object.values(EXT_FUNCTIONS);
                if (regs.length === 0) { reply(msg, 'Man', '<i>No functions registered.</i>'); return; }
                let out = `<b>Registered Functions (${regs.length}):</b><br>`;
                regs.forEach(r => {
                    const ns = r.namespace === 'core' ? '' : `<b>${escHtml(r.namespace)}.</b>`;
                    const argList = (r.args || []).map(a => a.name).join(', ');
                    const purity = r.pure === false ? ' [unstable]' : '';
                    out += `${ns}<b>${escHtml(r.name)}(${argList})</b> → <i>${escHtml(r.returns || 'any')}</i>${purity}<br>`;
                    if (r.description) out += `${escHtml(r.description)}<br>`;
                    out += '<br>';
                });
                reply(msg, 'Man', out);
                return;
            }

            if (topic === 'tokenvar' || topic === 'tokenvars') {
                const regs = Object.values(EXT_TOKEN_VARS);
                if (regs.length === 0) { reply(msg, 'Man', '<i>No token variables registered.</i>'); return; }
                let out = `<b>Registered Token Variables (${regs.length}):</b><br>`;
                regs.forEach(r => {
                    const ns = r.namespace === 'core' ? '' : `<b>${escHtml(r.namespace)}.</b>`;
                    out += `${ns}<b>${escHtml(r.name)}</b>`;
                    if (r.description) out += ` — ${escHtml(r.description)}`;
                    out += '<br>';
                });
                reply(msg, 'Man', out);
                return;
            }

            if (topic === 'const' || topic === 'constants') {
                const regs = Object.values(EXT_CONSTANTS);
                if (regs.length === 0) { reply(msg, 'Man', '<i>No constants registered.</i>'); return; }
                let out = `<b>Registered Constants (${regs.length}):</b><br>`;
                regs.forEach(r => {
                    const ns = r.namespace === 'core' ? '' : `<b>${escHtml(r.namespace)}.</b>`;
                    out += `${ns}<b>${escHtml(r.name)}</b> = <code>${escHtml(String(r.value))}</code>`;
                    if (r.description) out += ` — ${escHtml(r.description)}`;
                    out += '<br>';
                });
                reply(msg, 'Man', out);
                return;
            }

            replyError(msg, `Unknown topic "${topic}". Use !choreograph man for a list.`);
            return;
        }

        // ---- gen-dev-docs ----
        if (cmd === 'gen-dev-docs') {
            const handoutName = `Help: ${SCRIPT_NAME}/Extending Choreograph`;
            let hh = findObjs({ type: 'handout', name: handoutName })[0];
            if (!hh) {
                hh = createObj('handout', { name: handoutName, inplayerjournals: 'all', archived: false });
            }

            const h = (n, t) => `<h${n}>${t}</h${n}>`;
            const p = (t) => `<p>${t}</p>`;
            const c = (t) => `<code>${t}</code>`;
            const b = (t) => `<b>${t}</b>`;
            const li = (t) => `<li>${t}</li>`;
            const ul = (...items) => `<ul>${items.join('')}</ul>`;
            const pre = (t) => `<pre>${t}</pre>`;

            let html = '';
            html += h(1, 'Extending Choreograph');
            html += p('Guide for script developers adding custom functions, variables, and integrations to Choreograph.');

            html += h(2, 'Signal Pattern');
            html += p(`Choreograph emits ${c('!choreograph-ready')} on startup. Register in response:`);
            html += pre(
`on('chat:message', (msg) => {
    if (msg.content === '!choreograph-ready') doRegister();
});
// Also register immediately if already loaded:
if (typeof Choreograph !== 'undefined') doRegister();`);

            html += h(2, 'registerFunction(sourceId, struct)');
            html += p('Add a function to the delay/filter/command expression scope.');
            html += pre(
`Choreograph.registerFunction('MyScript', {
    name: 'inRange',
    namespace: 'mymod',
    description: 'Check if token is within range of a point',
    args: [{ name: 'range', type: 'number' }],
    returns: 'boolean',
    pure: true,  // default true; false for impure/stateful
    fn: (token, filteredTokens, params, range) => {
        // token = current Roll20 graphic
        // filteredTokens = tokens passing the current row filter
        // params = resolved scene parameters
        return someCheck(token, range);
    },
});`);

            html += h(2, 'registerTokenVariable(sourceId, struct)');
            html += p('Add a per-token variable to the expression scope.');
            html += pre(
`Choreograph.registerTokenVariable('MyScript', {
    name: 'hp',
    namespace: 'dnd',
    description: 'Current hit points from bar1',
    fn: (token, ctx) => parseInt(token.get('bar1_value')) || 0,
    // ctx: { tokens, params }
});`);

            html += h(2, 'registerConstant(sourceId, struct)');
            html += p('Add a named constant to the expression scope.');
            html += pre(
`Choreograph.registerConstant('MyScript', {
    name: 'GRID_SIZE',
    namespace: 'mymod',
    value: 70,
    description: 'Grid square size in pixels',
});`);

            html += h(2, 'registerParameterType(sourceId, struct)');
            html += p('Add a custom parameter type for scene handouts.');
            html += pre(
`Choreograph.registerParameterType('MyScript', {
    name: 'character',
    description: 'A Roll20 character by name or ID',
    parse: (rawValue) => {
        const char = findObjs({type:'character', name:rawValue})[0];
        if (!char) throw new Error('Character not found: ' + rawValue);
        return char;
    },
    validate: (rawValue) => null, // return error string or null
});`);

            html += h(2, 'registerLifecycleHook(sourceId, struct)');
            html += p('React to scene lifecycle events. ' + c('commands') + ' filters which fired commands trigger your hooks. Source-deduplicated — same sourceId cannot register twice.');
            html += pre(
`Choreograph.registerLifecycleHook('MyScript', {
    commands: [/^!myscript\\b/],
    start:  (ctx) => { /* msg-shaped context — pass to your handleInput */ },
    stop:   (ctx) => { /* same shape */ },
    pause:  (ctx) => { /* same shape */ },
    resume: (ctx) => { /* same shape */ },
});

// ctx shape (msg-shaped with sceneInfo):
// {
//   type: 'api',
//   content: '!myscript ...',
//   who: 'PlayerName (GM)',
//   playerid: '-ABC123',
//   selected: [{ _id, _type }],
//   sceneInfo: { instanceId, sceneName, instanceName },
// }`);
            html += p(`The ${c('start')} hook receives commands directly (bypassing sendChat). The context is msg-shaped so you can pass it directly to your command handler. ${c('sceneInfo.instanceId')} enables correlation with stop/pause/resume events.`);

            html += h(2, 'registerSyncParticipant(sourceId, struct)');
            html += p('Participate in sync resolution. Only called when fired commands match your patterns. Source-deduplicated.');
            html += pre(
`Choreograph.registerSyncParticipant('MyScript', {
    commands: [/^!myscript\\b/],
    waiting: (ctx) => {
        // ctx.entries — array of msg-shaped contexts (filtered to your commands)
        // ctx.sceneInfo — { instanceId, sceneName, instanceName }
        // ctx.done() — call when finished (idempotent)
        setTimeout(() => ctx.done(), 1000);
    },
});`);
            html += p(`${c('done()')} is idempotent — safe to call multiple times. Sync times out after 30s by default. Each participant only receives entries matching their registered command patterns.`);

            html += h(2, 'generateExtensionHandout(sourceId, opts)');
            html += p('Generate a help handout documenting your registered items.');
            html += pre(
`Choreograph.generateExtensionHandout('MyScript', {
    name: 'My Extension',
    description: 'Adds DnD-specific features.',
    sections: [{ namespace: 'dnd', description: '...' }],
});`);

            html += h(2, 'Introspection');
            html += ul(
                li(`${c('Choreograph.getFunction(key)')} — ${c("'namespace/name'")} or null`),
                li(`${c('Choreograph.getVariable(key)')} — or null`),
                li(`${c('Choreograph.getConstant(key)')} — or null`),
                li(`${c('Choreograph.getParameterType(name)')} — or null`)
            );

            hh.set('notes', html);
            reply(msg, 'Choreograph', `Generated ${b('Help: Choreograph/Extending Choreograph')} — check your journal.`);
            return;
        }

        // ---- echo (debug/test) ----
        if (cmd === 'echo') {
            const text = rest.join(' ');
            const ts = Date.now() % 100000;
            reply(msg, 'Echo', `[${ts}ms] ${text}`, true);
            return;
        }

        // ---- ping ----
        // Usage: !choreograph ping <x> <y> [pageId] [moveAll]
        // Or with selected token: !choreograph ping (pings selected token location)
        if (cmd === 'ping') {
            let x, y, pageId, moveAll = false;
            if (args.length >= 2) {
                x = parseFloat(args[0]);
                y = parseFloat(args[1]);
                pageId = args[2] || Campaign().get('playerpageid');
                moveAll = args[3] === 'true';
            } else if (msg.selected && msg.selected.length > 0) {
                const tok = getObj('graphic', msg.selected[0]._id);
                if (tok) { x = tok.get('left'); y = tok.get('top'); pageId = tok.get('_pageid'); }
            }
            if (x !== undefined && y !== undefined) {
                sendPing(x, y, msg.playerid, pageId, moveAll);
            }
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

        // ── Built-in example scenes ───────────────────────────────────────
        registerExample(SCRIPT_NAME, {
            name: 'shockwave',
            description: 'Propagates an echo outward from the nearest neighbor.',
            scene: {
                notes: 'Each token fires based on its distance rank from the nearest neighbor (actors()[1]).',
                params: [
                    { name: 'interval', type: 'number', default: '500', description: 'Ms between each token' },
                ],
                variables: [],
                rows: [
                    { filter: '*', delay: 'stagger(rank("left"), interval)', commands: ['!choreograph echo 💥 Shockwave hits ${token.name}! (${actors().length} actors nearby)'], notes: 'Propagate' },
                ],
            },
        });

        registerExample(SCRIPT_NAME, {
            name: 'roll-call',
            description: 'Tokens announce themselves one by one, sorted left to right.',
            scene: {
                notes: 'A simple stagger demo — each token echoes its name in order.',
                params: [],
                variables: [],
                rows: [
                    { filter: '*', delay: 'stagger(rank("left"), 800)', commands: ['!choreograph echo ${token.name} reporting in!'], notes: '' },
                ],
            },
        });

        registerExample(SCRIPT_NAME, {
            name: 'countdown',
            description: 'Recursive countdown — echoes a number, then calls itself with n-1.',
            scene: {
                notes: 'Demonstrates scene chaining and recursion with sync.',
                params: [
                    { name: 'n', type: 'number', default: '5', description: 'Countdown start' },
                ],
                variables: [],
                rows: [
                    { filter: '*', delay: '0', commands: ['!choreograph echo ${n}...'], notes: 'Echo current count' },
                    { filter: '*', delay: 'sync', commands: [], notes: 'Wait' },
                    { filter: '*', delay: '500', commands: ['${n > 1 ? "!choreograph run " + self + " --n " + (n - 1) : "!choreograph echo Liftoff!"}'], notes: 'Recurse or finish' },
                ],
            },
        });

        registerExample(SCRIPT_NAME, {
            name: 'spotlight',
            description: 'Each token gets a moment in the spotlight — fires one at a time with a pause between.',
            scene: {
                notes: 'Uses sync to wait between each token\'s turn.',
                params: [],
                variables: [],
                rows: [
                    { filter: '*', delay: 'stagger(rank("left"), 2000)', commands: ['!choreograph echo ✨ ${token.name} takes the spotlight! ✨'], notes: 'Staggered spotlight' },
                ],
            },
        });

        registerExample(SCRIPT_NAME, {
            name: 'elites-only',
            description: 'Only tokens wider than 70px (large tokens) get the effect — demonstrates expression filters.',
            scene: {
                notes: 'Uses an expression filter: width > 70. Only large tokens fire.',
                params: [],
                variables: [],
                rows: [
                    { filter: 'width > 70', delay: '0', commands: ['!choreograph echo 🏆 ${token.name} is an elite! (width=${token.width})'], notes: 'Expression filter' },
                    { filter: 'width <= 70', delay: '0', commands: ['!choreograph echo 🐜 ${token.name} is too small (width=${token.width})'], notes: 'Inverse' },
                ],
            },
        });

        registerExample(SCRIPT_NAME, {
            name: 'tidal-wave',
            description: 'Tokens fire in a wave pattern based on horizontal position.',
            scene: {
                notes: 'Uses wave() for sinusoidal timing offset.',
                params: [
                    { name: 'wavelength', type: 'number', default: '500', description: 'Wave period in pixels' },
                    { name: 'duration', type: 'number', default: '2000', description: 'Total wave duration in ms' },
                ],
                variables: [],
                rows: [
                    { filter: '*', delay: 'wave(left, wavelength, duration)', commands: ['!choreograph echo 🌊 ${token.name} hit by wave at ${Math.round(wave(left, wavelength, duration))}ms'], notes: 'Wave timing' },
                ],
            },
        });

        registerExample(SCRIPT_NAME, {
            name: 'fireball',
            description: 'Explosion FX propagates outward from the leftmost token.',
            scene: {
                notes: 'Fire explosions staggered by position — looks like a spreading fireball.',
                params: [
                    { name: 'interval', type: 'number', default: '200', description: 'Ms between each explosion' },
                ],
                variables: [],
                rows: [
                    { filter: '*', delay: 'stagger(rank("left"), interval)', commands: ['!choreograph fx explode-fire ${token.left} ${token.top} ${token.pageid}'], notes: '' },
                ],
            },
        });

        registerExample(SCRIPT_NAME, {
            name: 'chain-lightning',
            description: 'Lightning beam jumps from each token to the next nearest.',
            scene: {
                notes: 'Beams connect tokens in order of proximity using fxbetween.',
                params: [
                    { name: 'interval', type: 'number', default: '300', description: 'Ms between each bolt' },
                ],
                variables: [],
                rows: [
                    { filter: '*', delay: 'stagger(rank("left"), interval)', commands: [
                        '!choreograph fx burst-magic ${token.left} ${token.top} ${token.pageid}',
                        '${actors().length > 1 ? "!choreograph fxbetween beam-magic " + left + " " + top + " " + actors()[1].get("left") + " " + actors()[1].get("top") : ""}',
                    ], notes: 'Bolt + beam to nearest neighbor' },
                ],
            },
        });

        registerExample(SCRIPT_NAME, {
            name: 'battle-cry',
            description: 'Tokens rally one by one with a ping, glow, and announcement.',
            scene: {
                notes: 'Staggered rally effect — each token pings, glows, and announces.',
                params: [
                    { name: 'interval', type: 'number', default: '800', description: 'Ms between each token' },
                ],
                variables: [],
                rows: [
                    { filter: '*', delay: 'stagger(rank("left"), interval)', commands: [
                        '!choreograph ping ${token.left} ${token.top} ${token.pageid}',
                        '!choreograph fx glow-holy ${token.left} ${token.top} ${token.pageid}',
                        '!choreograph echo ⚔️ ${token.name} rallies!',
                    ], notes: 'Ping + glow + announce' },
                ],
            },
        });

        registerExample(SCRIPT_NAME, {
            name: 'fireball',
            description: 'Explosion FX propagates outward from the leftmost token.',
            scene: {
                notes: 'Fire explosions staggered by position.',
                params: [
                    { name: 'interval', type: 'number', default: '200', description: 'Ms between each explosion' },
                ],
                variables: [],
                rows: [
                    { filter: '*', delay: 'stagger(rank("left"), interval)', commands: ['!choreograph fx explode-fire ${token.left} ${token.top} ${token.pageid}'], notes: '' },
                ],
            },
        });

        registerExample(SCRIPT_NAME, {
            name: 'chain-lightning',
            description: 'Lightning beam jumps from each token to the next nearest.',
            scene: {
                notes: 'Beams connect tokens in order of proximity.',
                params: [
                    { name: 'interval', type: 'number', default: '300', description: 'Ms between each bolt' },
                ],
                variables: [],
                rows: [
                    { filter: '*', delay: 'stagger(rank("left"), interval)', commands: [
                        '!choreograph fx burst-magic ${token.left} ${token.top} ${token.pageid}',
                        '${actors().length > 1 ? "!choreograph fxbetween beam-magic " + left + " " + top + " " + actors()[1].get("left") + " " + actors()[1].get("top") : ""}',
                    ], notes: 'Bolt + beam to nearest' },
                ],
            },
        });

        registerExample(SCRIPT_NAME, {
            name: 'battle-cry',
            description: 'Tokens rally one by one with a ping, glow, and announcement.',
            scene: {
                notes: 'Staggered rally effect.',
                params: [
                    { name: 'interval', type: 'number', default: '800', description: 'Ms between each token' },
                ],
                variables: [],
                rows: [
                    { filter: '*', delay: 'stagger(rank("left"), interval)', commands: [
                        '!choreograph ping ${token.left} ${token.top} ${token.pageid}',
                        '!choreograph fx glow-holy ${token.left} ${token.top} ${token.pageid}',
                        '!choreograph echo ⚔️ ${token.name} rallies!',
                    ], notes: 'Ping + glow + announce' },
                ],
            },
        });

        registerExample(SCRIPT_NAME, {
            name: 'ripple-ping',
            description: 'Cascading pings that propagate outward and decay in speed over distance.',
            scene: {
                notes: 'Pings the origin point, then recursively pings outward with decreasing speed. Pass --px/--py to set origin (defaults to center of cast).',
                params: [
                    { name: 'px', type: 'number', default: '0', description: 'Origin X (0 = auto-center)' },
                    { name: 'py', type: 'number', default: '0', description: 'Origin Y (0 = auto-center)' },
                    { name: 'speed', type: 'number', default: '0.4', description: 'Propagation speed (px/ms)' },
                    { name: 'decay', type: 'number', default: '0.6', description: 'Speed multiplier each hop' },
                    { name: 'minSpeed', type: 'number', default: '0.05', description: 'Stop when speed drops below this' },
                ],
                variables: [
                    { name: 'cx', expression: 'px > 0 ? px : actors().reduce((s,t) => s + t.get("left"), 0) / count' },
                    { name: 'cy', expression: 'py > 0 ? py : actors().reduce((s,t) => s + t.get("top"), 0) / count' },
                ],
                rows: [
                    { filter: '*', delay: 'propagate(distance(cx, cy), speed)', commands: [
                        '!choreograph ping ${token.left} ${token.top} ${token.pageid}',
                        '!choreograph fx nova-holy ${token.left} ${token.top} ${token.pageid}',
                        '${speed * decay >= minSpeed ? "!choreograph run " + self + " --px " + left + " --py " + top + " --speed " + (speed * decay) + " --decay " + decay + " --minSpeed " + minSpeed : ""}',
                    ], notes: 'Ping + FX + recurse with decay' },
                ],
            },
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

        // Generate Help: Choreograph handout
        (() => {
            const helpName = `Help: ${SCRIPT_NAME}`;
            let hh = findObjs({ type: 'handout', name: helpName })[0];
            if (!hh) {
                hh = createObj('handout', { name: helpName, inplayerjournals: 'all', archived: false });
            }

            const h = (n, t) => `<h${n}>${t}</h${n}>`;
            const p = (t) => `<p>${t}</p>`;
            const c = (t) => `<code>${t}</code>`;
            const b = (t) => `<b>${t}</b>`;
            const li = (t) => `<li>${t}</li>`;
            const ul = (...items) => `<ul>${items.join('')}</ul>`;

            let html = '';
            html += h(1, `${SCRIPT_NAME} v${SCRIPT_VERSION}`);
            html += p('A meta-sequencer for Roll20 tokens. Define scenes in handouts — filter tokens, compute per-token timing, and fire commands at the right moments.');

            html += h(2, 'Commands');
            html += ul(
                li(`${c('!choreograph run <name> [flags]')} — Execute a scene`),
                li(`${c('!choreograph new <name>')} — Create blank scene`),
                li(`${c('!choreograph list [query]')} — List scenes`),
                li(`${c('!choreograph edit <name>')} — Open handout`),
                li(`${c('!choreograph delete <name>')} — Delete scene`),
                li(`${c('!choreograph stop [name]')} — Stop scene(s)`),
                li(`${c('!choreograph pause [name]')} — Pause scene(s)`),
                li(`${c('!choreograph resume [name]')} — Resume scene(s)`),
                li(`${c('!choreograph status')} — Show running scenes`),
                li(`${c('!choreograph refresh <name>')} — Regenerate handout`),
                li(`${c('!choreograph cast <sub> ...')} — Manage casts`)
            );

            html += h(2, 'Run Flags');
            html += ul(
                li(`${c('--loop')} / ${c('--loop N')} / ${c('--loop N --sync')} — Looping`),
                li(`${c('--page [id]')} — All tokens on a page`),
                li(`${c('--id <ids>')} — Explicit token IDs`),
                li(`${c('--cast <name>')} — Use a saved cast`),
                li(`${c('ignore-selected')} — Skip selected tokens`),
                li(`${c('--depth N')} — Max chaining depth (default: 10)`),
                li(`${c('--<param> <value>')} — Bind scene parameters`)
            );

            html += h(2, 'Scene Handout');
            html += p(`Scenes are stored in ${c('[Scene] <name>')} handouts with three tables:`);
            html += ul(
                li(`${b('Parameter Table')} (Name | Type | Default | Description) — scene inputs`),
                li(`${b('Variables Table')} (Variable | Expression) — computed per-token before execution`),
                li(`${b('Scene Table')} (Filter | Delay | Command | Notes) — the choreography`)
            );

            html += h(2, 'Filters');
            html += ul(
                li(`${c('*')} — all tokens`),
                li(`${c('layer=X')} — on layer X`),
                li(`${c('name=X*')} — name glob`),
                li(`${c('id=-ABC')} — specific ID`),
                li(`${c('role=X')} — cast role`),
                li(`${c('status=X')} — has status marker`),
                li(`${c('!prefix')} — negation`),
                li('Space-separated = AND. Multiple rows = OR.')
            );

            html += h(2, 'Delay Expressions');
            html += p('Evaluated per-token. Return ms, INF/SKIP, or sync.');
            html += p(b('Variables:') + ' left, top, name, layer, width, height, count, INF, SKIP, self, tokenId, tokenName, plus all params and computed variables.');
            html += p(b('Functions:') + ` rank("attr"), distance(x,y), propagate(dist,speed), stagger(rank,interval), rand(min,max), randInt(min,max), clamp(v,lo,hi), actors(filter?), actor_ids(filter?), plus math.`);
            html += p(b('Constants:') + ' PI, TAU');

            html += h(2, 'Command Templates');
            html += p(`Use ${c('${expr}')} for substitutions. Evaluated as JS template literals.`);
            html += p(`Example: ${c('!sequence play ${anim} ignore-selected ${token.id}')}`);

            html += h(2, 'Cast System');
            html += p(`Casts are saved token groups in ${c('[Cast] <name>')} handouts with optional roles.`);
            html += ul(
                li(`${c('!choreograph cast add <name> [--role R]')} — add tokens`),
                li(`${c('!choreograph cast remove <name> [--role R]')} — remove tokens`),
                li(`${c('!choreograph cast list')} / ${c('show <name>')} / ${c('delete <name>')}`),
                li(`Use ${c('--cast <name>')} in run, filter with ${c('role=X')}`)
            );

            html += h(2, 'Sync');
            html += p(`Use ${c('sync')} as a delay value to wait for all registered sync participants before continuing.`);

            html += h(2, 'Scene Chaining');
            html += p(`Use ${c('self')} in commands to reference the current scene. Recursion is depth-limited (${c('--depth')}).`);

            html += h(2, 'Looping');
            html += ul(
                li(`${c('--loop')} — infinite, sync each cycle`),
                li(`${c('--loop N')} — N times, immediate restart`),
                li(`${c('--loop N --sync')} — N times, sync between cycles`)
            );

            hh.set('notes', html);
        })();

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
        registerExample,
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
