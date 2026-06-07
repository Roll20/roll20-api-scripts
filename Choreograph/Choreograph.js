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
    const HANDOUT_PREFIX = '[Choreograph] ';

    // =========================================================================
    // State helpers
    // =========================================================================

    const s = () => state[SCRIPT_NAME];

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

    const HANDOUT_NAME = (name) => `${HANDOUT_PREFIX}${name}`;

    const findHandout = (name) => {
        const results = findObjs({ _type: 'handout', name: HANDOUT_NAME(name) });
        return results.length > 0 ? results[0] : undefined;
    };

    const findAllSceneHandouts = () =>
        findObjs({ _type: 'handout' })
            .filter(h => h.get('name').startsWith(HANDOUT_PREFIX));

    const getOrCreateHandout = (name) => {
        const existing = findHandout(name);
        if (existing) return existing;
        return createObj('handout', {
            name:             HANDOUT_NAME(name),
            inplayerjournals: '',
            archived:         false,
        });
    };

    const getHandoutNotes = (handout, callback) => {
        handout.get('notes', (notes) => callback(notes || ''));
    };

    const setHandoutNotes = (handout, html) => {
        handout.set('notes', html);
    };

    // =========================================================================
    // Scene scaffolding (new)
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
        html += `<b>Scene:</b> ${escHtml(name)}<br>`;
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
    // Handout parser
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
        const scene = { name, notes: '', params: [], rows: [] };

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

    // In-memory cache of parsed scenes
    const sceneCache = {};

    /**
     * Load a scene from its handout into the cache.
     */
    const loadScene = (name, callback) => {
        if (sceneCache[name]) { callback(sceneCache[name]); return; }
        const handout = findHandout(name);
        if (!handout) { callback(null); return; }
        getHandoutNotes(handout, (html) => {
            if (!html) { callback(null); return; }
            const scene = parseScene(name, html);
            if (scene) sceneCache[name] = scene;
            callback(scene);
        });
    };

    // =========================================================================
    // Running scenes
    // =========================================================================

    // { instanceId: { name, queue, timers, cast, params, state } }
    const runningScenes = {};

    let instanceCounter = 0;
    const genInstanceId = () => `${SCRIPT_NAME}-${++instanceCounter}-${Date.now()}`;

    const stopScene = (instanceId) => {
        const scene = runningScenes[instanceId];
        if (!scene) return;
        (scene.timers || []).forEach(t => clearTimeout(t));
        delete runningScenes[instanceId];
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
    const evalFilterCondition = (condition, token) => {
        const c = condition.trim();
        if (!c || c === '*') return true;

        // Negation
        if (c.startsWith('!')) {
            return !evalFilterCondition(c.slice(1), token);
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
            // role=X — check if token has this role in the cast metadata
            // (for MVP, role filtering requires cast roles — deferred)
            if (key === 'role') return false; // TODO: cast role support
        }

        return false;
    };

    /**
     * Evaluate a full filter string (space-separated AND conditions).
     */
    const evalFilter = (filterStr, token) => {
        if (!filterStr.trim()) return false; // empty = no match
        if (filterStr.trim() === '*') return true;
        const conditions = filterStr.trim().split(/\s+/);
        return conditions.every(c => evalFilterCondition(c, token));
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
    const executeScene = (scene, cast, params, msg) => {
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

        // For each row, evaluate filter on all cast, then compute delays
        scene.rows.forEach((row, rowIndex) => {
            // Filter cast
            const filtered = cast.filter(token => evalFilter(row.filter, token));
            if (filtered.length === 0) return;

            // For each matching token, evaluate delay and build queue entry
            filtered.forEach(token => {
                const scope = buildTokenScope(token, filtered, resolvedParams);
                // Add resolved params to scope
                Object.assign(scope, resolvedParams);
                // Add tokenId and tokenName for command templates
                scope.tokenId   = token.get('id');
                scope.tokenName = token.get('name') || '';

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
            name:   scene.name,
            queue,
            timers: [],
            cast,
            params: resolvedParams,
            state:  'running',
        };
        runningScenes[instanceId] = instance;

        // Execute queue — batch entries with same time into one setTimeout,
        // and merge entries with same time AND same command into one sendChat
        const sender = msg.who.split(' ')[0];
        let i = 0;
        while (i < queue.length) {
            const batchTime = queue[i].time;
            const batch = [];
            while (i < queue.length && queue[i].time === batchTime) {
                batch.push(queue[i]);
                i++;
            }
            const timer = setTimeout(() => {
                // Group by command string — same command merges token IDs
                const byCommand = {};
                batch.forEach(entry => {
                    if (!byCommand[entry.command]) byCommand[entry.command] = [];
                    byCommand[entry.command].push(entry.tokenId);
                });
                Object.entries(byCommand).forEach(([command, tokenIds]) => {
                    const selectSuffix = ` {& select ${tokenIds.join(', ')}}`;
                    sendChat(sender, command + selectSuffix);
                });
            }, batchTime);
            instance.timers.push(timer);
        }

        // Auto-cleanup when done
        if (queue.length > 0) {
            const maxTime = queue[queue.length - 1].time;
            const cleanup = setTimeout(() => {
                delete runningScenes[instanceId];
            }, maxTime + 100);
            instance.timers.push(cleanup);
        } else {
            delete runningScenes[instanceId];
        }

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
            if (findHandout(name)) {
                replyError(msg, `A scene named "${name}" already exists.`);
                return;
            }
            const handout = getOrCreateHandout(name);
            setHandoutNotes(handout, generateBlankScene(name));
            reply(msg, 'Choreograph',
                `Created scene "${escHtml(name)}". `
                + `<a href="http://journal.roll20.net/handout/${handout.get('id')}">[Open Handout]</a>`);
            return;
        }

        // ---- list ----
        if (cmd === 'list') {
            let handouts = findAllSceneHandouts();
            const query = args[0];
            if (query) {
                const q = query.toLowerCase();
                handouts = handouts.filter(h =>
                    h.get('name').slice(HANDOUT_PREFIX.length).toLowerCase().includes(q)
                );
            }
            if (handouts.length === 0) {
                reply(msg, 'Choreograph', query
                    ? `No scenes matching "${escHtml(query)}" found.`
                    : 'No scenes found.');
                return;
            }
            let out = `<b>${handouts.length} scene(s)${query ? ` matching "${escHtml(query)}"` : ''}:</b><br>`;
            handouts.forEach(h => {
                const sceneName = h.get('name').slice(HANDOUT_PREFIX.length);
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
            const handout = findHandout(name);
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
            const handout = findHandout(name);
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

        // ---- refresh ----
        if (cmd === 'refresh') {
            const name = args[0];
            if (!name) { replyError(msg, 'Usage: !choreograph refresh <name>'); return; }
            const handout = findHandout(name);
            if (!handout) { replyError(msg, `No scene named "${name}" found.`); return; }
            delete sceneCache[name];
            loadScene(name, (scene) => {
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
            const handout = findHandout(name);
            if (!handout) { replyError(msg, `No scene named "${name}" found.`); return; }
            delete sceneCache[name];
            loadScene(name, (scene) => {
                if (!scene) { replyError(msg, `Could not parse scene "${name}".`); return; }
                scene.rows.push({ filter: '*', delay: '0', command: '', notes: '' });
                sceneCache[name] = scene;
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
            const handout = findHandout(name);
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
            const handout = findHandout(name);
            if (!handout) { replyError(msg, `No scene named "${name}" found.`); return; }

            // Gather cast
            const castIds = [];
            if (!flags.has('ignore-selected')) {
                (msg.selected || []).forEach(s => castIds.push(s._id));
            }
            // --id tokens
            if (opts.id) {
                const ids = Array.isArray(opts.id) ? opts.id : String(opts.id).split(/\s+/);
                ids.forEach(id => { if (id) castIds.push(id); });
            }
            // Also collect any Roll20 IDs from remaining args
            args.slice(1).forEach(a => {
                if (/^-[A-Za-z0-9_-]+$/.test(a)) castIds.push(a);
            });

            const cast = castIds
                .map(id => getObj('graphic', id))
                .filter(Boolean);

            if (cast.length === 0) {
                replyError(msg, 'No tokens in cast. Select tokens, use --id, or use --cast.');
                return;
            }

            loadScene(name, (scene) => {
                if (!scene) {
                    replyError(msg, `Could not parse scene "${name}".`);
                    return;
                }

                // Collect params from opts (strip known flags)
                const knownFlags = new Set(['id', 'force', 'loop', 'depth', 'page', 'cast', 'sync']);
                const params = {};
                Object.entries(opts).forEach(([k, v]) => {
                    if (!knownFlags.has(k) && typeof v === 'string') params[k] = v;
                });

                const instanceId = executeScene(scene, cast, params, msg);
                reply(msg, 'Choreograph',
                    `Running "${escHtml(name)}" on ${cast.length} token(s). `
                    + `Instance: <code>${instanceId}</code>`);
            });
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
    };

    return {
        checkInstall,
        registerEventHandlers,
    };
})();

on('ready', () => {
    'use strict';
    Choreograph.checkInstall();
    Choreograph.registerEventHandlers();
});
