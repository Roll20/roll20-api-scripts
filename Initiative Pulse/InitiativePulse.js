/*
 * Initiative Pulse v1.0.0
 * Last updated: 2026-08-21
 *
 * Announces GM-authored initiative Actions without changing the turn tracker.
 * Counts down Effects when !pulse-round notifications arrive.
 *
 * Commands:
 *   !pulse action Name %% Initiative %% Repeat
 *   !pulse effect Name %% Duration
 *   !pulse-menu
 *   !pulse install-macro
 *   !pulse install-scriptcards-macro
 *   !pulse install-clear-macro
 *   !pulse clear
 *   !pulse inspect
 *   !pulse clean
 */

var InitiativePulse = InitiativePulse || (function () {
    'use strict';

    var SCRIPT = 'Initiative Pulse';
    var VERSION = '1.0.0';
    var STATE_KEY = 'InitiativePulse';
    var SCHEMA_VERSION = 1;
    var MENU_MACRO = 'Initiative-Pulse';
    var SCRIPT_CARDS_MACRO = 'Initiative-Pulse-ScriptCards';
    var CLEAR_MACRO = 'Clear-Combat';

    function defaultState() {
        return {
            schemaVersion: SCHEMA_VERSION,
            nextId: 1,
            actions: [],
            effects: [],
            lastRound: null,
            activeInitiative: null
        };
    }

    function getState() {
        if (!state[STATE_KEY] || state[STATE_KEY].schemaVersion !== SCHEMA_VERSION) {
            state[STATE_KEY] = defaultState();
        }
        return state[STATE_KEY];
    }

    function escapeHtml(value) {
        return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function panel(title, body) {
        return '<div style="border:1px solid #444;background:#fff;padding:8px;border-radius:4px;">' +
            '<div style="font-weight:bold;font-size:1.15em;border-bottom:1px solid #bbb;margin-bottom:6px;">' +
            escapeHtml(title) + '</div>' + body + '</div>';
    }

    function button(label, command) {
        return '<a style="display:inline-block;background:#315b7d;color:#fff;padding:4px 7px;' +
            'margin:2px;text-decoration:none;border-radius:3px;" href="' + escapeHtml(command) + '">' +
            escapeHtml(label) + '</a>';
    }

    function announce(title, body) {
        sendChat(SCRIPT, '/direct ' + panel(title, body));
    }

    function whisper(message) {
        sendChat(SCRIPT, '/w gm ' + panel(SCRIPT, message));
    }

    function isAuthorized(msg) {
        return msg.playerid === 'API' || playerIsGM(msg.playerid);
    }

    function requireGM(msg) {
        if (!isAuthorized(msg)) {
            whisper('Only a GM can manage Initiative Pulse.');
            return false;
        }
        return true;
    }

    function nextId(prefix) {
        var data = getState();
        var id = prefix + data.nextId;
        data.nextId += 1;
        return id;
    }

    function parseRepeat(value) {
        return /^(1|true|yes|y|repeat|repeating)$/i.test(String(value || '').trim());
    }

    function splitFields(text) {
        return text.split('%%').map(function (field) { return field.trim(); });
    }

    function addAction(payload) {
        var fields = splitFields(payload);
        var initiative = Number(fields[1]);
        if (!fields[0] || fields.length < 3 || !isFinite(initiative)) {
            whisper('Usage: <code>!pulse action Name %% Initiative %% Repeat</code>. Repeat accepts yes or no.');
            return;
        }
        getState().actions.push({
            id: nextId('A'),
            name: fields[0],
            initiative: initiative,
            repeat: parseRepeat(fields[2])
        });
        whisper('Added Action <b>' + escapeHtml(fields[0]) + '</b> at initiative ' +
            escapeHtml(initiative) + (parseRepeat(fields[2]) ? ' (repeating).' : ' (once).'));
    }

    function addEffect(payload) {
        var fields = splitFields(payload);
        var duration = Number(fields[1]);
        if (!fields[0] || fields.length < 2 || !isFinite(duration) || duration < 1 || Math.floor(duration) !== duration) {
            whisper('Usage: <code>!pulse effect Name %% Duration</code>. Duration must be a positive whole number.');
            return;
        }
        getState().effects.push({ id: nextId('E'), name: fields[0], remaining: duration });
        whisper('Added Effect <b>' + escapeHtml(fields[0]) + '</b> for ' + duration + ' round(s).');
    }

    function parseTurnOrder(raw) {
        var order;
        if (!raw) { return []; }
        try {
            order = JSON.parse(raw);
            return Array.isArray(order) ? order : [];
        } catch (error) {
            log(SCRIPT + ': could not parse turn order: ' + error.message);
            return [];
        }
    }

    function currentInitiative(campaign) {
        var order = parseTurnOrder(campaign.get('turnorder'));
        var value = order.length ? Number(order[0].pr) : NaN;
        return isFinite(value) ? value : null;
    }

    function crossedThreshold(previous, current, threshold) {
        if (previous === current) { return false; }
        if (current < previous) {
            return threshold < previous && threshold >= current;
        }
        return threshold < previous || threshold >= current;
    }

    function handleTurnOrder(campaign) {
        var data = getState();
        var current = currentInitiative(campaign);
        var previous = data.activeInitiative;
        var fired = [];

        data.activeInitiative = current;
        if (previous === null || current === null) { return; }

        data.actions.forEach(function (action) {
            if (crossedThreshold(previous, current, Number(action.initiative))) {
                fired.push(action);
                announce('Action', '<b>' + escapeHtml(action.name) + '</b>' +
                    '<div>Initiative ' + escapeHtml(action.initiative) + '</div>');
            }
        });

        if (fired.length) {
            data.actions = data.actions.filter(function (action) {
                return action.repeat || fired.indexOf(action) === -1;
            });
        }
    }

    function handleRound(roundValue) {
        var data = getState();
        var round = String(roundValue || '').trim();
        if (!round) {
            whisper('Usage: <code>!pulse-round Round</code>.');
            return;
        }
        if (data.lastRound === round) { return; }
        data.lastRound = round;

        data.effects.forEach(function (effect) {
            effect.remaining -= 1;
            if (effect.remaining <= 0) {
                announce('Effect Expired', '<b>' + escapeHtml(effect.name) + '</b> has expired.');
            } else {
                announce('Effect', '<b>' + escapeHtml(effect.name) + '</b>' +
                    '<div>' + effect.remaining + ' round(s) remaining.</div>');
            }
        });
        data.effects = data.effects.filter(function (effect) { return effect.remaining > 0; });
    }

    function scriptCardsInstalled() {
        return typeof ScriptCards !== 'undefined' || !!state.ScriptCards;
    }

    function showMenu() {
        var body = '<div>' +
            button('Add Action', '!pulse action ?{Action name} %% ?{Initiative|20} %% ?{Repeat|No,no|Yes,yes}') +
            button('Add Effect', '!pulse effect ?{Effect name} %% ?{Duration in rounds|1}') +
            '</div><div style="margin-top:5px;">' +
            button('Inspect', '!pulse inspect') + button('Clear Combat', '!pulse clear') +
            '</div><div style="margin-top:5px;">' +
            button('Install Menu Macro', '!pulse install-macro') +
            button('Install Clear Macro', '!pulse install-clear-macro') +
            (scriptCardsInstalled() ? button('Install ScriptCards Macro', '!pulse install-scriptcards-macro') : '') +
            '</div>';
        whisper(body);
    }

    function upsertMacro(playerid, name, action) {
        var matches = findObjs({ _type: 'macro', _playerid: playerid, name: name });
        var macro = matches[0];
        if (macro) {
            macro.set({ action: action, visibleto: playerid });
        } else {
            createObj('macro', { _playerid: playerid, name: name, action: action, visibleto: playerid });
        }
        whisper('Installed GM macro <b>' + escapeHtml(name) + '</b>.');
    }

    function installScriptCardsMacro(playerid) {
        var action;
        if (!scriptCardsInstalled()) {
            whisper('ScriptCards is not installed, so no ScriptCards macro was created.');
            return;
        }
        action = '!scriptcard {{ --#title|Initiative Pulse --#emotestate|hidden ' +
            '--+Actions|[Add Action](!pulse action ?{Action name} %% ?{Initiative|20} %% ?{Repeat|No,no|Yes,yes}) ' +
            '--+Effects|[Add Effect](!pulse effect ?{Effect name} %% ?{Duration in rounds|1}) ' +
            '--+Tools|[Inspect](!pulse inspect) [Clear Combat](!pulse clear) }}';
        upsertMacro(playerid, SCRIPT_CARDS_MACRO, action);
    }

    function clearCombat() {
        var data = getState();
        data.actions = [];
        data.effects = [];
        data.lastRound = null;
        data.activeInitiative = currentInitiative(Campaign());
        whisper('All stored Actions and Effects were cleared. Initiative Tracker Plus remains untouched.');
    }

    function inspect() {
        var data = getState();
        var actions = data.actions.length ? data.actions.map(function (item) {
            return '<li><b>' + escapeHtml(item.name) + '</b> — initiative ' + escapeHtml(item.initiative) +
                (item.repeat ? ', repeating' : ', once') + '</li>';
        }).join('') : '<li>None</li>';
        var effects = data.effects.length ? data.effects.map(function (item) {
            return '<li><b>' + escapeHtml(item.name) + '</b> — ' + item.remaining + ' round(s)</li>';
        }).join('') : '<li>None</li>';
        whisper('<b>Actions</b><ul>' + actions + '</ul><b>Effects</b><ul>' + effects + '</ul>');
    }

    function clean(playerid) {
        [MENU_MACRO, SCRIPT_CARDS_MACRO, CLEAR_MACRO].forEach(function (name) {
            findObjs({ _type: 'macro', _playerid: playerid, name: name }).forEach(function (macro) { macro.remove(); });
        });
        delete state[STATE_KEY];
        whisper('Removed this GM\'s Initiative Pulse macros and reset Initiative Pulse state.');
    }

    function handleInput(msg) {
        var content;
        var match;
        var command;
        var payload;
        if (msg.type !== 'api') { return; }
        content = String(msg.content || '').trim();

        if (/^!eot(?:\s|$)/i.test(content)) {
            return; // Deliberately observed without consuming, replacing, or advancing the turn.
        }
        match = content.match(/^!pulse-round(?:\s+(.+))?$/i);
        if (match) {
            if (requireGM(msg)) { handleRound(match[1]); }
            return;
        }
        if (/^!itp\s+-clear(?:\s|$)/i.test(content)) {
            if (requireGM(msg)) { clearCombat(); }
            return;
        }
        if (/^!pulse-menu(?:\s|$)/i.test(content)) {
            if (requireGM(msg)) { showMenu(); }
            return;
        }
        match = content.match(/^!pulse(?:\s+([^\s]+))?(?:\s+([\s\S]*))?$/i);
        if (!match) { return; }
        if (!requireGM(msg)) { return; }
        command = String(match[1] || '').toLowerCase();
        payload = match[2] || '';

        switch (command) {
        case 'action': addAction(payload); break;
        case 'effect': addEffect(payload); break;
        case 'install-macro': upsertMacro(msg.playerid, MENU_MACRO, '!pulse-menu'); break;
        case 'install-scriptcards-macro': installScriptCardsMacro(msg.playerid); break;
        case 'install-clear-macro': upsertMacro(msg.playerid, CLEAR_MACRO, '!pulse clear'); break;
        case 'clear': clearCombat(); break;
        case 'inspect': inspect(); break;
        case 'clean': clean(msg.playerid); break;
        default: showMenu();
        }
    }

    function checkInstall() {
        var data = getState();
        data.activeInitiative = currentInitiative(Campaign());
        log(SCRIPT + ' v' + VERSION + ' ready.');
    }

    function registerEventHandlers() {
        on('chat:message', handleInput);
        on('change:campaign:turnorder', handleTurnOrder);
    }

    on('ready', function () {
        checkInstall();
        registerEventHandlers();
    });

    return { version: VERSION };
}());
