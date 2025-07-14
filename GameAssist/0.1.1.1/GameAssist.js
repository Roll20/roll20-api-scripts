// =============================
// === GameAssist v0.1.1.1 ===
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

    const VERSION      = '0.1.1.1';
    const STATE_KEY    = 'GameAssist';
    const MODULES      = {};
    let   READY        = false;

    // ————— QUEUE + WATCHDOG —————
    let _busy      = false;
    let _lastStart = 0;
    const _queue            = [];
    const DEFAULT_TIMEOUT   = 30000;
    const WATCHDOG_INTERVAL = 15000;

    function _enqueue(task, priority = 0, timeout = DEFAULT_TIMEOUT) {
        _queue.push({ task, priority, enqueuedAt: Date.now(), timeout });
        _queue.sort((a,b) => b.priority - a.priority || a.enqueuedAt - b.enqueuedAt);
        _runNext();
    }

    function _runNext() {
        if (_busy || !_queue.length) return;
        const { task, timeout } = _queue.shift();
        _busy = true;
        _lastStart = Date.now();

        const timer = setTimeout(() => {
            GameAssist.log('Core', `Task timed out after ${timeout}ms`, 'WARN');
            _busy = false;
            _runNext();
        }, timeout);

        Promise.resolve()
            .then(task)
            .catch(err => GameAssist.log('Core', `Error in task: ${err.message}`, 'ERROR'))
            .finally(() => {
                clearTimeout(timer);
                _busy = false;
                const duration = Date.now() - _lastStart;
                GameAssist._metrics.taskDurations.push(duration);
                GameAssist._metrics.lastUpdate = new Date().toISOString();
                _runNext();
            });
    }

    setInterval(() => {
        if (_busy && Date.now() - _lastStart > DEFAULT_TIMEOUT * 2) {
            GameAssist.log('Core', 'Watchdog forced queue reset', 'WARN');
            _busy = false;
            _runNext();
        }
    }, WATCHDOG_INTERVAL);

    // ————— HANDLER TRACKING —————
    globalThis._handlers = globalThis._handlers || {};
    const originalOn  = typeof globalThis.on  === 'function' ? globalThis.on  : null;
    const originalOff = typeof globalThis.off === 'function' ? globalThis.off : null;

    globalThis.on = (event, handler) => {
        globalThis._handlers[event] = globalThis._handlers[event] || [];
        globalThis._handlers[event].push(handler);
        if (typeof originalOn === 'function') {
            return originalOn(event, handler);
        }
    };

    globalThis.off = (event, handler) => {
        if (!globalThis._handlers[event]) return;
        globalThis._handlers[event] = globalThis._handlers[event].filter(h => h !== handler);
        if (typeof originalOff === 'function') {
            return originalOff(event, handler);
        }
    };

    // ————— UTILITIES —————
    function _parseArgs(content) {
        const args = {}, pattern = /--(\w+)(?:\s+("[^"]*"|[^\s]+))?/g;
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

    function getState(mod) {
        state[STATE_KEY] = state[STATE_KEY] || { config: {} };
        state[STATE_KEY][mod] = state[STATE_KEY][mod] || { config: {}, runtime: {} };
        return state[STATE_KEY][mod];
    }
    function saveState(mod, data) {
        state[STATE_KEY] = state[STATE_KEY] || { config: {} };
        state[STATE_KEY][mod] = Object.assign(getState(mod), data);
    }
    function clearState(mod) {
        if (state[STATE_KEY]?.[mod]) delete state[STATE_KEY][mod];
    }

    function auditState() {
        const root = state[STATE_KEY] || {};
        Object.keys(root).forEach(k => {
            if (k === 'config') return;
            if (!MODULES[k]) {
                GameAssist.log('Core', `Unexpected state branch: ${k}`, 'WARN');
                delete root[k];
            } else {
                const branch = root[k];
                if (!branch.config || !branch.runtime) {
                    GameAssist.log('Core', `Malformed state for ${k}`, 'WARN');
                    delete root[k];
                }
            }
        });
        GameAssist._metrics.stateAudits++;
        GameAssist._metrics.lastUpdate = new Date().toISOString();
    }

    function seedDefaults() {
        Object.entries(MODULES).forEach(([name, mod]) => {
            const cfg = getState(name).config;
            if (cfg.enabled === undefined) cfg.enabled = mod.enabled;
        });
    }

    function _sanitize(str = '') {
        return str.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/'/g, '&#39;');
    }

    // ————— COMPATIBILITY —————
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
    function auditCompatibility() {
        if (!GameAssist.flags.DEBUG_COMPAT) return;
        const known  = KNOWN_SCRIPTS.map(normalizeScriptName);
        const active = Object.keys(state.api?.scripts || {}).map(normalizeScriptName);
        const good   = active.filter(n => known.includes(n));
        const bad    = active.filter(n => !known.includes(n));
        GameAssist.log('Compat', '✅ Known: '  + (good.join(', ')  || 'none'));
        GameAssist.log('Compat', '❓ Unknown: ' + (bad.join(', ')   || 'none'));
        GameAssist.log('Compat', '🔌 Events: '   + GameAssist._plannedEvents.join(', '));
        GameAssist.log('Compat', '💬 Commands: ' + GameAssist._plannedChatPrefixes.join(', '));
    }

    // ————— CONFIG PARSER —————
    function parseConfigValue(raw) {
        raw = raw.trim();
        if (raw === 'true')  return true;
        if (raw === 'false') return false;
        if (!isNaN(raw))      return Number(raw);
        if ((raw.startsWith('{') && raw.endsWith('}')) || (raw.startsWith('[') && raw.endsWith(']'))) {
            try { return JSON.parse(raw); }
            catch { GameAssist.log('Config', 'Invalid JSON: ' + _sanitize(raw)); }
        }
        return raw;
    }

    // ————— GameAssist CORE —————
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
        config: {},
        flags: { DEBUG_COMPAT: false, QUIET_STARTUP: true },

        log(mod, msg, level = 'INFO', { startup = false } = {}) {
            if (startup && GameAssist.flags.QUIET_STARTUP) return;

            const timestamp = new Date().toLocaleTimeString();
            const levelIcon = { INFO: 'ℹ️', WARN: '⚠️', ERROR: '❌' }[level] || 'ℹ️';

            // escape user-supplied text, then split on newlines
            const safe = _sanitize(msg).split('\n');

            // prepend /w gm to every continuation line so Roll20 treats
            // the whole block as one whisper
            const stitched = safe.map((l, i) => (i ? '/w gm ' + l : l)).join('\n');

            sendChat(
                'GameAssist',
                `/w gm ${levelIcon} [${timestamp}] [${mod}] ${stitched}`
            );
        },

        handleError(mod, err) {
            this._metrics.errors++;
            this._metrics.lastUpdate = new Date().toISOString();
            this.log(mod, err.message || String(err), 'ERROR');
        },

        register(name, initFn, { enabled = true, events = [], prefixes = [], teardown = null } = {}) {
            if (READY) {
                this.log('Core', `Cannot register after ready: ${name}`, 'WARN');
                return;
            }
            if (MODULES[name]) {
                this.log('Core', `Duplicate module: ${name}`, 'WARN');
                return;
            }
            MODULES[name] = { initFn, teardown, enabled, initialized: false, events, prefixes };
            this._plannedEvents.push(...events);
            this._plannedChatPrefixes.push(...prefixes);
        },

        onCommand(prefix, fn, mod, { gmOnly = false, acl = [] } = {}) {
            const wrapped = msg => {
                if (msg.type !== 'api' || !msg.content.startsWith(prefix)) return;
                if (gmOnly && !playerIsGM(msg.playerid)) return;
                if (acl.length && !acl.includes(msg.playerid)) return;
                this._metrics.commands++;
                this._metrics.lastUpdate = new Date().toISOString();
                try { fn(msg); }
                catch(e) { this.handleError(mod, e); }
            };
            on('chat:message', wrapped);
            this._commandHandlers[mod] = (this._commandHandlers[mod] || []).concat({ event:'chat:message', fn:wrapped });
        },

        offCommands(mod) {
            (this._commandHandlers[mod] || []).forEach(h => off(h.event, h.fn));
            this._commandHandlers[mod] = [];
        },

        onEvent(evt, fn, mod) {
            const wrapped = (...args) => {
                if (!READY || !MODULES[mod].initialized) return;
                this._metrics.messages++;
                this._metrics.lastUpdate = new Date().toISOString();
                try { fn(...args); }
                catch(e) { this.handleError(mod, e); }
            };
            on(evt, wrapped);
            this._listeners[mod] = (this._listeners[mod] || []).concat({ event:evt, fn:wrapped });
        },

        offEvents(mod) {
            (this._listeners[mod] || []).forEach(h => off(h.event, h.fn));
            this._listeners[mod] = [];
        },

        _clearAllListeners() {
            Object.keys(this._commandHandlers).forEach(m => this.offCommands(m));
            Object.keys(this._listeners).forEach(m => this.offEvents(m));
        },

        _dedupePlanned() {
            this._plannedEvents = [...new Set(this._plannedEvents)];
            this._plannedChatPrefixes = [...new Set(this._plannedChatPrefixes)];
        },

        enableModule(name) {
            _enqueue(() => {
                const m = MODULES[name];
                if (!m) { this.log('Core', `No such module: ${name}`, 'WARN'); return; }
                this.offEvents(name);
                this.offCommands(name);
                clearState(name);
                getState(name).config.enabled = true;
                m.initialized = true;
                try { m.initFn(); this.log(name, 'Enabled'); }
                catch(e) { this.handleError(name, e); }
            });
        },

        disableModule(name) {
            _enqueue(() => {
                const m = MODULES[name];
                if (!m) { this.log('Core', `No such module: ${name}`, 'WARN'); return; }
                if (typeof m.teardown === 'function') {
                    try { m.teardown(); }
                    catch(e) { this.log(name, `Teardown failed: ${e.message}`, 'WARN'); }
                }
                this.offEvents(name);
                this.offCommands(name);
                clearState(name);
                getState(name).config.enabled = false;
                m.initialized = false;
                this.log(name, 'Disabled');
            });
        }
    };

    globalThis.GameAssist = GameAssist;

    // ————— CONFIG COMMAND —————
    GameAssist.onCommand('!ga-config', msg => {
        const parts = msg.content.trim().split(/\s+/);
        const sub   = parts[1];
        if (sub === 'list') {
            const ts   = new Date().toLocaleString();
            const ver  = `v${VERSION}`;
            const cfg  = JSON.stringify(state[STATE_KEY].config, null, 2)
                          .replace(/[<>&]/g, c=>({'<':'&lt;','>':'&gt;','&':'&amp;'})[c]);
            const name = 'GameAssist Config';
            let handout = findObjs({ type:'handout', name })[0];
            if (!handout) handout = createObj('handout', { name, archived:false });
            handout.set('notes', `<pre>Generated: ${ts} (${ver})\n\n${cfg}</pre>`);
            sendChat('GameAssist', `/w gm Config written to "${name}"`);
        }
        else if (sub === 'set' && parts.length >= 4) {
            const mod = parts[2];
            const [ key, ...rest ] = parts.slice(3).join(' ').split('=');
            const val = rest.join('=');
            const parsed = parseConfigValue(val);
            if (!MODULES[mod]) {
                GameAssist.log('Config', `Unknown module: ${mod}`, 'WARN');
                return;
            }
            getState(mod).config[key.trim()] = parsed;
            GameAssist.log('Config', `Set ${mod}.${key.trim()} = ${JSON.stringify(parsed)}`);
        }
        else if (sub === 'get' && parts.length >= 4) {
            const mod = parts[2];
            const key = parts[3];
            if (!MODULES[mod]) {
                GameAssist.log('Config', `Unknown module: ${mod}`, 'WARN');
                return;
            }
            const val = getState(mod).config[key];
            GameAssist.log('Config', `${mod}.${key} = ${JSON.stringify(val)}`);
        }
        else if (sub === 'modules') {
            const moduleList = Object.entries(MODULES).map(([name, mod]) => {
                const cfg = getState(name).config;
                const status = cfg.enabled ? '✅' : '❌';
                const init = mod.initialized ? '🔄' : '⏸️';
                return `${status}${init} ${name}`;
            }).join('\n');
            GameAssist.log('Config', `Modules:\n${moduleList}`);
        }
        else {
            GameAssist.log('Config', 'Usage: !ga-config list|set|get|modules [args]');
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
        const metrics = GameAssist._metrics;
        const avgDuration = metrics.taskDurations.length > 0 
            ? (metrics.taskDurations.reduce((a,b) => a+b, 0) / metrics.taskDurations.length).toFixed(2)
            : 'N/A';

        const status = [
            `**GameAssist ${VERSION} Status**`,
            `Commands: ${metrics.commands}`,
            `Messages: ${metrics.messages}`,
            `Errors: ${metrics.errors}`,
            `Avg Task Duration: ${avgDuration}ms`,
            `Queue Length: ${_queue.length}`,
            `Last Update: ${metrics.lastUpdate || 'Never'}`,
            `Modules: ${Object.keys(MODULES).length}`,
            `Active Listeners: ${Object.values(GameAssist._listeners).flat().length}`
        ].join('\n');

        GameAssist.log('Status', status);
    }, 'Core', { gmOnly: true });

    // ————— CRITFUMBLE MODULE v0.2.4.8 —————
    GameAssist.register('CritFumble', function() {
        // ─── Module Setup ──────────────────────────────────────────────────────────────
        const modState = getState('CritFumble');
        Object.assign(modState.config, {
            enabled:   true,
            debug:     true,
            useEmojis: true,
            rollDelayMs: 200,
            // Preserve any values previously saved in state
            ...modState.config
        });
        modState.runtime.activePlayers = modState.runtime.activePlayers || {};

        // ─── Constants ─────────────────────────────────────────────────────────────────
        /** Which Roll20 rolltemplates we watch for natural-1s */
        const VALID_TEMPLATES = ['atk','atkdmg','npcatk','spell'];
        const FUMBLE_TABLES = {
            melee:   'CF-Melee',
            ranged:  'CF-Ranged',
            spell:   'CF-Spell',
            natural: 'CF-Natural',
            thrown:  'CF-Thrown'
        };
        // Lookup for confirm tables
        const CONFIRM_TABLES = {
            'confirm-crit-martial': 'Confirm-Crit-Martial',
            'confirm-crit-magic':   'Confirm-Crit-Magic'
        };

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

        function sendTemplateMessage(who,title,fields) {
            who = sanitizeWho(who);
            const content = fields.map(f=>`{{${f.label}=${f.value}}}`).join(' ');
            sendChat('CritFumble', `/w "${who}" &{template:default} {{name=${title}}} ${content}`);
        }

        function getFumbleTableName(type) {
            return FUMBLE_TABLES[type]||null;
        }

        function sendConfirmMenu(who) {
            const buttons = [
                `[Confirm-Crit-Martial](!Confirm-Crit-Martial)`,
                `[Confirm-Crit-Magic](!Confirm-Crit-Magic)`
            ].join(' ');
            sendTemplateMessage(who, `${emoji('❓')} Confirm Critical Miss`, [
                { label: "Choose Confirmation Type", value: buttons }
            ]);
        }

        function sendFumbleMenu(who) {
            sendConfirmMenu(who);
            const buttons = [
                `[⚔ Melee](!critfumble-melee)`,
                `[🏹 Ranged](!critfumble-ranged)`,
                `[🎯 Thrown](!critfumble-thrown)`,
                `[🔥 Spell](!critfumble-spell)`,
                `[👊 Natural/Unarmed](!critfumble-natural)`
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
                sendChat('', `/roll 1t[${tableName}]`);
                debugLog(`Roll command executed: /roll 1t[${tableName}]`);
            }, modState.config.rollDelayMs);
        }

        function rollFumbleTable(who,type) {
            const table = getFumbleTableName(type);
            if (!table) {
                sendTemplateMessage(who, "⚠️ Invalid Fumble Type", [
                    { label: "Requested",    value: `"${type}"` },
                    { label: "Valid Types",  value: Object.keys(FUMBLE_TABLES).join(', ') }
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

        function hasNaturalOne(inlinerolls=[]) {
            return inlinerolls.some(group=>{
                if (!group.results||!Array.isArray(group.results.rolls)) return false;
                return group.results.rolls.some(roll=>{
                    if (roll.type!=='R'||roll.sides!==20) return false;
                    const results = Array.isArray(roll.results)? roll.results : [roll.results];
                    return results.some(r=> (r.r===true||r.r===undefined) && r.v===1 );
                });
            });
        }

        function showManualTriggerMenu() {
            const players = Object.values(modState.runtime.activePlayers);
            if (!players.length) {
                sendTemplateMessage('gm', "⚠️ No Players Detected", [
                    { label:"Note", value:"No players have been active yet this session." }
                ]);
                return;
            }
            const buttons = players.map(name=>
                `[${name}](!critfumblemenu-${encodeURIComponent(name)})`
            ).join(' ');
            sendTemplateMessage('gm',"Manually Trigger Fumble Menu",[
                { label:"Select Player", value:buttons }
            ]);
        }

        function handleManualTrigger(encodedName) {
            sendFumbleMenu(decodeURIComponent(encodedName));
            debugLog(`Manually triggered fumble menu for: ${encodedName}`);
        }

        function showHelpMessage(who) {
            sendTemplateMessage(who, "📘 CritFumble Help", [
                { label: "Version",     value: "v0.2.4.8" },
                { label: "Commands",    value: "`!critfail`, `!critfumble help`, `!critfumble-<type>`, `!confirm-crit-martial`, `!confirm-crit-magic`" },
                { label: "Description", value: "Auto-detects critical misses and prompts attacker with a fumble menu; GM can also manually trigger via `!critfail`." },
                { label: "Valid Types", value: Object.keys(FUMBLE_TABLES).join(', ') }
            ]);
        }

        function handleRoll(msg) {
            if (!msg) return;
            // register active players
            if (msg.playerid && !modState.runtime.activePlayers[msg.playerid]) {
                const p = getObj('player', msg.playerid);
                if (p) modState.runtime.activePlayers[msg.playerid] = p.get('displayname');
            }

            // API‐style commands
            if (msg.type==='api') {
                const cmd = (msg.content||'').trim().toLowerCase();

                if (cmd==='!critfail') {
                    debugLog('Manual trigger: !critfail');
                    return showManualTriggerMenu();
                }
                if (cmd==='!critfumble help') {
                    return showHelpMessage(msg.who);
                }
                if (cmd.startsWith('!critfumblemenu-')) {
                    return handleManualTrigger(msg.content.replace('!critfumblemenu-',''));
                }
                if (cmd.startsWith('!critfumble-')) {
                    const who        = sanitizeWho(msg.who);
                    const fumbleType = msg.content.replace('!critfumble-','').toLowerCase();
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
            if (!msg.rolltemplate || !VALID_TEMPLATES.includes(msg.rolltemplate)) return;
            const rolls = msg.inlinerolls||[];
            if (!hasNaturalOne(rolls)) return;

            const who = sanitizeWho(msg.who);
            debugLog(`Fumble detected from: ${who}`);
            sendFumbleMenu(who);
        }

        GameAssist.onEvent('chat:message', handleRoll, 'CritFumble');
        GameAssist.log('CritFumble','v0.2.4.8 Ready: Auto fumble detection + !critfail','INFO',{startup:true});
    }, {
        enabled: true,
        events:   ['chat:message'],
        prefixes: ['!critfail','!critfumble']
    });

    // ————— NPC MANAGER MODULE v0.1.1.0 —————
    GameAssist.register('NPCManager', function() {
        const modState = getState('NPCManager');

        Object.assign(modState.config, {
            enabled: true,
            autoTrackDeath: true,
            deadMarker: 'dead',
            ...modState.config
        });

        function isNPC(token) {
            if (!token || token.get('layer') !== 'objects') return false;
            const charId = token.get('represents');
            if (!charId) return false;

            const npcAttr = findObjs({
                _type: 'attribute',
                _characterid: charId,
                name: 'npc'
            })[0];

            return npcAttr && npcAttr.get('current') === '1';
        }

        function checkForDeath(token) {
            if (!modState.config.autoTrackDeath || !isNPC(token)) return;

            const hp = parseInt(token.get('bar1_value'), 10) || 0;
            const markers = (token.get('statusmarkers') || '').split(',');
            const isDead = markers.includes(modState.config.deadMarker);

            if (hp < 1 && !isDead) {
                sendChat('api', `!token-mod --ids ${token.id} --set statusmarkers|+${modState.config.deadMarker}`);
                GameAssist.log('NPCManager', `${token.get('name')} marked as dead (HP: ${hp})`);
            } else if (hp >= 1 && isDead) {
                sendChat('api', `!token-mod --ids ${token.id} --set statusmarkers|-${modState.config.deadMarker}`);
                GameAssist.log('NPCManager', `${token.get('name')} revived (HP: ${hp})`);
            }
        }

        function handleTokenChange(obj, prev) {
            if (obj.get('bar1_value') !== prev.bar1_value) {
                checkForDeath(obj);
            }
        }

        GameAssist.onCommand('!npc-death-report', msg => {
            const pageId = Campaign().get('playerpageid');
            const tokens = findObjs({
                _pageid: pageId,
                _type: 'graphic',
                layer: 'objects'
            });

            const flagged = [];
            for (let token of tokens) {
                if (!isNPC(token)) continue;

                const hp = parseInt(token.get('bar1_value'), 10) || 0;
                const markers = (token.get('statusmarkers') || '').split(',');
                const isDead = markers.includes(modState.config.deadMarker);

                if ((hp < 1 && !isDead) || (hp >= 1 && isDead)) {
                    flagged.push({
                        name: token.get('name') || '(Unnamed)',
                        id: token.id,
                        hp,
                        markers: token.get('statusmarkers') || '(none)'
                    });
                }
            }

            if (flagged.length === 0) {
                GameAssist.log('NPCManager', '✅ Living NPCs have correct death marker states.');
            } else {
                GameAssist.log('NPCManager', `⚠️ ${flagged.length} NPC(s) with mismatched death markers:`);
                flagged.forEach(({ name, id, hp, markers }) => {
                    GameAssist.log('NPCManager', `- ${name} [${id}] | HP: ${hp} | Markers: ${markers}`);
                });
            }
        }, 'NPCManager', { gmOnly: true });

        GameAssist.onEvent('change:graphic:bar1_value', handleTokenChange, 'NPCManager');
        GameAssist.log('NPCManager', 'v0.1.1.0 Ready: Auto death tracking + !npc-death-report', 'INFO', { startup: true });
    }, { 
        enabled: true, 
        events: ['change:graphic:bar1_value'], 
        prefixes: ['!npc-death-report'] 
    });

// ————— CONCENTRATION TRACKER MODULE v0.1.0.5 —————
GameAssist.register('ConcentrationTracker', function() {
    // ─── Module Setup ──────────────────────────────────────────────────────────────
    const modState = getState('ConcentrationTracker');
    Object.assign(modState.config, {
        enabled:   true,
        marker:    'Concentrating',
        randomize: true,
        ...modState.config
    });
    modState.runtime.lastDamage = modState.runtime.lastDamage || {};

    // ─── Public Command Prefixes ───────────────────────────────────────────────────
    const CMDS = ['!concentration', '!cc'];
    const TOKEN_MARKER = 'Concentrating';

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
        sendChat('api',
            `!token-mod --ids ${token.id} --set statusmarkers|${on ? '+' : '-'}${TOKEN_MARKER}`
        );
    }

    /**
     * postButtons(recipient)
     *   Sends the three-button UI for a new concentration check.
     */
    function postButtons(recipient) {
        const dmg = '?{Damage taken?|0}';
        const buttons = [
            `[🎯 Maintain Control](!concentration --damage ${dmg} --mode normal)`,
            `[🧠 Brace for the Distraction](!concentration --damage ${dmg} --mode adv)`,
            `[😣 Struggling to Focus](!concentration --damage ${dmg} --mode dis)`
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
        const tokens = findObjs({
            _type:  'graphic',
            _pageid: page,
            layer:  'objects'
        }).filter(t =>
            (t.get('statusmarkers') || '')
                .toLowerCase()
                .includes(TOKEN_MARKER.toLowerCase())
        );
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
        const charId = token.get('represents');
        if (!charId) {
            return sendChat('ConcentrationTracker',
                `/w "${player}" ⚠️ Token not linked.`
            );
        }
        const character = getObj('character', charId);
        if (!character) {
            return sendChat('ConcentrationTracker',
                `/w "${player}" ⚠️ Character not found.`
            );
        }

        const bonus = getConBonus(character);
        const dc    = Math.max(10, Math.floor(damage / 2));
        const name  = token.get('name') || character.get('name');
        const { success: S, failure: F } = getOutcomeLines(name);
        const { randomize } = getConfig();

        let expr = `1d20 + ${bonus}`;
        if (mode === 'adv') expr = `2d20kh1 + ${bonus}`;
        if (mode === 'dis') expr = `2d20kl1 + ${bonus}`;

        modState.runtime.lastDamage[msg.playerid] = damage;

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
        msg.selected?.forEach(sel => {
            const t = getObj('graphic', sel._id);
            if (t) toggleMarker(t, false);
        });
        sendChat('ConcentrationTracker', `/w "${player}" ✅ Cleared markers.`);
    }

    /**
     * handleLast(msg)
     *   Repeats the last concentration check.
     */
    function handleLast(msg) {
        const player = msg.who.replace(/ \(GM\)$/, '');
        const dmg    = modState.runtime.lastDamage[msg.playerid];
        if (!dmg) {
            return sendChat('ConcentrationTracker',
                `/w "${player}" ⚠️ No previous damage.`
            );
        }
        handleRoll(msg, dmg, 'normal');
    }

    // ─── Core Handler (Case-Insensitive) ──────────────────────────────────────────
    function handler(msg) {
        if (msg.type !== 'api') return;

        // 1) Normalize prefix: trim + lowercase
        const raw   = msg.content.trim();
        const parts = raw.toLowerCase().split(/\s+--/);
        const cmd   = parts.shift();             // "!concentration" or "!cc"
        if (!CMDS.includes(cmd)) return;

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
    GameAssist.onEvent('chat:message', handler, 'ConcentrationTracker');
    GameAssist.log(
        'ConcentrationTracker',
        `Ready: ${CMDS.join(' & ')}`,
        'INFO',
        { startup: true }
    );
}, {
    enabled:  true,
    prefixes: ['!concentration','!cc'],
    teardown: () => {
        const page = Campaign().get('playerpageid');
        findObjs({ _type: 'graphic', _pageid: page, layer: 'objects' })
            .filter(t =>
                (t.get('statusmarkers') || '')
                    .toLowerCase()
                    .includes('concentrating')
            )
            .forEach(t =>
                sendChat('api',
                    `!token-mod --ids ${t.id} --set statusmarkers|-Concentrating`
                )
            );
    }
});

    // ————— NPC HP ROLLER MODULE v0.1.1.0 —————
    GameAssist.register('NPCHPRoller', function() {
        const modState = getState('NPCHPRoller');

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

        function rollTokenHP(token) {
            const charId = token.get('represents');
            if (!charId) {
                GameAssist.log('NPCHPRoller', 'Token not linked to character', 'WARN');
                return;
            }

            const npcAttr = findObjs({
                _type: 'attribute',
                _characterid: charId,
                name: 'npc'
            })[0];

            if (!npcAttr || npcAttr.get('current') !== '1') {
                return;
            }

            const hpFormulaAttr = findObjs({
                _type: 'attribute',
                _characterid: charId,
                name: 'npc_hpformula'
            })[0];

            if (!hpFormulaAttr) {
                GameAssist.log('NPCHPRoller', `No HP formula found for ${token.get('name')}`, 'WARN');
                return;
            }

            const formula = hpFormulaAttr.get('current');
            const diceData = parseDiceString(formula);

            if (!diceData) {
                GameAssist.log('NPCHPRoller', `Invalid HP formula: ${formula}`, 'WARN');
                return;
            }

            const hp = rollHP(diceData);

            token.set('bar1_value', hp);
            token.set('bar1_max', hp);

            GameAssist.log('NPCHPRoller', `${token.get('name')} HP set to ${hp} using [${formula}]`);
        }

        GameAssist.onCommand('!npc-hp-all', async msg => {
            const pageId = Campaign().get('playerpageid');
            const tokens = findObjs({
                _pageid: pageId,
                _type: 'graphic',
                layer: 'objects'
            });

            const npcTokens = [];

            for (const token of tokens) {
                const characterId = token.get('represents');
                if (!characterId) continue;

                const npcAttr = findObjs({
                    _type: 'attribute',
                    _characterid: characterId,
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
        }, 'NPCHPRoller', { gmOnly: true });

        GameAssist.onCommand('!npc-hp-selected', msg => {
            if (!msg.selected || msg.selected.length === 0) {
                GameAssist.log('NPCHPRoller', 'No tokens selected', 'WARN');
                return;
            }

            msg.selected.forEach(sel => {
                const token = getObj('graphic', sel._id);
                if (token) {
                    try {
                        rollTokenHP(token);
                    } catch (err) {
                        GameAssist.log('NPCHPRoller', `Error processing ${token.get('name')}: ${err.message}`, 'ERROR');
                    }
                }
            });
        }, 'NPCHPRoller', { gmOnly: true });

        GameAssist.log('NPCHPRoller', 'v0.1.1.0 Ready: !npc-hp-all, !npc-hp-selected', 'INFO', { startup: true });
    }, { 
        enabled: true, 
        events: [], 
        prefixes: ['!npc-hp-all', '!npc-hp-selected'] 
    });

    // ————— BOOTSTRAP —————
    on('ready', () => {
        if (READY) return;
        READY = true;

        state[STATE_KEY] = state[STATE_KEY] || { config: {} };
        GameAssist.config = state[STATE_KEY].config;

        GameAssist._clearAllListeners();
        seedDefaults();
        auditState();
        GameAssist._dedupePlanned();
        auditCompatibility();

        GameAssist.log('Core', `GameAssist v${VERSION} ready; modules: ${Object.keys(MODULES).join(', ')}`);

        Object.entries(MODULES).forEach(([name, m]) => {
            if (getState(name).config.enabled) {
                m.initialized = true;
                try { m.initFn(); }
                catch(e) { GameAssist.handleError(name, e); }
            }
        });
    });

})();

