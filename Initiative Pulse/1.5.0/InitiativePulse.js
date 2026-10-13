/*
 * Initiative Pulse v1.5.0 — Token durations and integrated concentration
 * Maintainer: Kingkiller546
 * Last updated: 2026-09-30
 *
 * Announces GM-authored initiative Actions without changing the turn tracker.
 * Counts down Effects when their affected token's turn ends.
 * Integrated click-to-roll concentration checks using HP bar 1.
 * Disable the separate Manual Concentration script when installing this version.
 *
 * Original Initiative Pulse and Manual Concentration scripts: Kingkiller546.
 * Credit to keithcurtis1 for the idea to merge the token countdown into Initiative Pulse.
 * Licence: MIT (see repository LICENSE).
 * Actions retain Pulse's initiative timing; round notifications never tick Effects.
 * Commands:
 *   !pulse token-effect Name %% Duration %% Emoji %% Concentration (yes/no; selected tokens)
 *   !pulse edit EffectID %% Duration (zero removes)
 *   !pulse remove EffectID
 *   !pulse bind EffectID (attach an older unassigned effect to one selected token)
 *   !pulse action Name %% Initiative %% Repeat
 *   !pulse effect Name %% Duration
 *   !pulse-menu
 *   !pulse setup (2014/2024/custom sheets, character overrides and advantage)
 *   !pulse install-macro
 *   !pulse install-scriptcards-macro
 *   !pulse install-clear-macro
 *   !pulse clear
 *   !pulse inspect
 *   !pulse clean
 *   !concentration start --token TOKEN_ID --name SPELL_OR_ABILITY
 *   !concentration stop --token TOKEN_ID
 *   !concentration check --token TOKEN_ID --dc NUMBER
 * Save buttons use single-use, session-bound --check IDs.
 */

var InitiativePulse = InitiativePulse || (function () {
    'use strict';

    var SCRIPT = 'Initiative Pulse';
    var VERSION = '1.5.0';
    var STATE_KEY = 'InitiativePulse';
    var SCHEMA_VERSION = 1;
    var MENU_MACRO = 'Initiative-Pulse';
    var SCRIPT_CARDS_MACRO = 'Initiative-Pulse-ScriptCards';
    var CLEAR_MACRO = 'Clear-Combat';
    // Runtime baseline, shared by native events, EOT checks and fallback polling.
    // Never count an EOT command itself: ITP may reject it or be paused.
    var observedTurnOrder = null;
    var pendingSheetReads = {};

    function isRoundMarker(entry) {
        return entry && String(entry.id) === '-1' && /Round\s*\d+/i.test(entry.custom || '');
    }

    function turnKey(entry) {
        return JSON.stringify([String(entry.id), String(entry.pr),
            isRoundMarker(entry) ? 'ITP Round' : entry.custom || '', entry._pageid || '']);
    }

    function forwardSteps(before, after) {
        if (before.length < 2 || before.length !== after.length) { return 0; }
        var oldKeys = before.map(turnKey);
        var newKeys = JSON.stringify(after.map(turnKey));
        for (var step = 1; step <= before.length; step += 1) {
            // ITP can automatically pass round separators, never another actor.
            if (step > 1 && !isRoundMarker(before[step - 1])) { break; }
            if (JSON.stringify(oldKeys.slice(step).concat(oldKeys.slice(0, step))) !== newKeys) { continue; }
            if (step === before.length) {
                // One actor plus separator can finish back in the same order.
                var oldRound = before.filter(isRoundMarker)[0];
                var newRound = after.filter(isRoundMarker)[0];
                if (!oldRound || !newRound ||
                    Number(newRound.custom.match(/Round\s*(\d+)/i)[1]) !==
                    Number(oldRound.custom.match(/Round\s*(\d+)/i)[1]) + 1) { return 0; }
            }
            return step;
        }
        return 0;
    }

    function observeTurnOrder() {
        observeConcentrationLoss();
        var raw = Campaign().get('turnorder') || '';
        if (observedTurnOrder === null) { observedTurnOrder = raw; return; }
        if (raw === observedTurnOrder) { return; }
        var previousRaw = observedTurnOrder;
        observedTurnOrder = raw; // Claim the transition before producing chat/name updates.
        var before = parseTurnOrder(previousRaw);
        var after = parseTurnOrder(raw);
        var steps = forwardSteps(before, after);
        if (steps) {
            // Replay the real actor/round-boundary steps for both clocks.
            for (var i = 0; i < steps; i += 1) {
                var next = before.slice(1).concat(before[0]);
                var snapshot = JSON.stringify(next);
                handleTurnOrder({ get: function () { return snapshot; } }, { turnorder: JSON.stringify(before) });
                before = next;
            }
        } else {
            // Sorting, priority edits, additions, removals and backward moves
            // rebaseline the observer; they must not trigger initiative actions.
            getState().activeInitiative = currentInitiative(Campaign());
        }
    }

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
        if (!state[STATE_KEY].tokenNames) { state[STATE_KEY].tokenNames = {}; }
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
        if (!fields[0] || !fields[1] || fields.length < 3 || !isFinite(initiative) || !/^(yes|no)$/i.test(fields[2])) {
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

    // Remember only our exact generated suffix; natural emoji in names are preserved.
    var COUNTER_EMOJIS = ['🔹', '🔸', '💠', '♦️', '▫️', '◽', '▪️', '◾', '🔻', '🔺', '⭐', '✨'];

    // Defaults retained for upgrades; GMs can change these with !pulse config.
    var CONCENTRATION = {
        marker: 'chained-heart',
        hpBar: 1,
        sheet: '2014',
        computedSaveAttribute: 'constitution_save_bonus',
        saveAttribute: 'constitution_save_bonus',
        warcasterAttribute: 'warcaster',
        breakingConditions: [
            { marker: 'interdiction', name: 'Incapacitated' },
            { marker: 'pummeled', name: 'Paralysed' },
            { marker: 'frozen-orb', name: 'Petrified' },
            { marker: 'fist', name: 'Stunned' },
            { marker: 'sleepy', name: 'Unconscious' }
        ]
    };

    function configure(payload) {
        if (!payload.trim()) {
            whisper('<b>Settings</b><br>' + Object.keys(CONCENTRATION).map(function (key) {
                return escapeHtml(key) + ': ' + escapeHtml(JSON.stringify(CONCENTRATION[key]));
            }).join('<br>') + '<br>Set one option per command: !pulse config SETTING VALUE. ' +
                'Settings: sheet (2014/2024/custom), hpBar (1/2/3), saveAttribute, computedSaveAttribute, ' +
                'warcasterAttribute, marker, conditions (TAG=Name,TAG=Name or none).<br>' + button('Setup Manager', '!pulse setup'));
            return;
        }
        var match = payload.trim().match(/^(\S+)\s+([\s\S]+)$/);
        if (!match) { whisper('Use !pulse config SETTING VALUE.'); return; }
        var key = match[1], value = match[2].trim();
        if (key === 'hpBar') {
            if (!/^[123]$/.test(value)) { whisper('HP bar must be 1, 2 or 3.'); return; }
            value = Number(value);
        } else if (key === 'sheet') {
            if (['2014', '2024', 'custom'].indexOf(value) === -1) { whisper('Choose 2014, 2024 or custom.'); return; }
        } else if (key === 'saveAttribute' || key === 'warcasterAttribute' || key === 'computedSaveAttribute') {
            if (!/^[\w.-]+$/.test(value)) { whisper('Use an attribute name containing letters, numbers, dots, underscores or hyphens.'); return; }
        } else if (key === 'marker') {
            if (!/^[\w-]+(?:::\d+)?$/.test(value)) { whisper('Use a built-in marker name or a custom marker tag such as Concentration::123.'); return; }
            if (Object.keys(concentrationData().sessions).length || getState().effects.some(function (effect) { return effect.concentration; }) ||
                (findObjs({ _type: 'graphic', _subtype: 'token' }) || []).some(hasConcentrationMarker)) {
                whisper('End existing concentration before changing its marker.'); return;
            }
        } else if (key === 'conditions') {
            key = 'breakingConditions';
            value = value === 'none' ? [] : value.split(',').map(function (part) {
                var pair = part.trim().match(/^([\w-]+(?:::\d+)?)=(.+)$/);
                return pair ? { marker: pair[1], name: pair[2].trim() } : null;
            });
            if (value.some(function (item) { return !item; })) { whisper('Use conditions TAG=Name,TAG=Name or conditions none.'); return; }
        } else { whisper('Unknown setting. Run !pulse config for the supported settings.'); return; }
        CONCENTRATION[key] = value;
        getState().config = JSON.parse(JSON.stringify(CONCENTRATION));
        // Configuration changes invalidate checks made with the previous settings.
        concentrationData().checks = {};
        initialiseConcentration();
        whisper('Setting saved. Pending saves were invalidated; request fresh checks if needed.');
    }

    // PCs and NPCs use the same configured total saving throw bonus.
    function concentrationSave(characterId) {
        var attribute = CONCENTRATION.saveAttribute;
        var raw = characterId ? getAttrByName(characterId, attribute, 'current') : undefined;
        return { attribute: attribute, value: numericHP(raw) };
    }

    function characterOptions(characterId) {
        return (getState().characterOptions || {})[characterId] || {};
    }

    function sheetProfile(characterId) {
        return characterOptions(characterId).sheet || CONCENTRATION.sheet;
    }

    function readConcentrationSheet(characterId, done) {
        var profile = sheetProfile(characterId);
        var advantage = characterOptions(characterId).advantage;
        if (!characterId || !getObj('character', characterId)) {
            done({ error: 'Link the token to a character using Represents Character.' }); return;
        }
        if (profile !== '2024') {
            var save = concentrationSave(characterId);
            save.profile = profile;
            save.advantage = advantage === 'yes' || (advantage !== 'no' &&
                Number(getAttrByName(characterId, CONCENTRATION.warcasterAttribute, 'current')) === 1);
            done(save); return;
        }
        if (typeof getSheetItem !== 'function') {
            done({ error: '2024 sheet access is unavailable. Enable the Experimental API sandbox and restart it.' }); return;
        }
        var property = CONCENTRATION.computedSaveAttribute;
        var finished = false;
        function finish(result) {
            if (finished) { return; }
            finished = true;
            done(result);
        }
        setTimeout(function () {
            finish({ error: 'The 2024 sheet read timed out. Check the sandbox and retry this save button.' });
        }, 10000);
        Promise.resolve().then(function () {
            return getSheetItem(characterId, property);
        }).then(function (raw) {
            finish({ attribute: property, value: typeof raw === 'number' || typeof raw === 'string' ? numericHP(raw) : null,
                profile: profile, advantage: advantage === 'yes' });
        }, function () {
            finish({ error: 'Could not read ' + property + ' from the 2024 sheet. Check the Experimental sandbox and Setup, then retry.' });
        });
    }

    function selectedCharacters(msg) {
        var ids = [];
        (msg.selected || []).forEach(function (selection) {
            var token = selection._type === 'graphic' && getObj('graphic', selection._id);
            var id = token && token.get('represents');
            if (id && getObj('character', id) && ids.indexOf(id) === -1) { ids.push(id); }
        });
        return ids;
    }

    function showSetup(msg) {
        var rows = selectedCharacters(msg).map(function (id) {
            var character = getObj('character', id), options = characterOptions(id);
            return escapeHtml(character.get('name') || id) + ': ' + escapeHtml(sheetProfile(id)) +
                '; concentration advantage: ' + escapeHtml(options.advantage || 'default');
        });
        whisper('<b>Setup Manager</b><br>Game default: ' + escapeHtml(CONCENTRATION.sheet) +
            '<br>' + button('2014 sheets', '!pulse setup sheet 2014') +
            button('2024 sheets', '!pulse setup sheet 2024') + button('Custom legacy sheet', '!pulse setup sheet custom') +
            '<br><b>Selected characters</b><br>' + (rows.join('<br>') || 'Select linked tokens to change their characters.') +
            '<br>' + button('Use game default', '!pulse setup selected-sheet default') +
            button('Use 2014', '!pulse setup selected-sheet 2014') + button('Use 2024', '!pulse setup selected-sheet 2024') +
            button('Use custom', '!pulse setup selected-sheet custom') +
            '<br>Concentration advantage (for example, War Caster): ' +
            button('Yes', '!pulse setup advantage yes') + button('No', '!pulse setup advantage no') +
            button('Default', '!pulse setup advantage default') +
            '<br>Default advantage uses the legacy advantage attribute for 2014/custom; 2024 defaults to No. Set Yes for characters who have War Caster.' +
            '<br><b>HP and markers</b><br>HP bar: ' + CONCENTRATION.hpBar + ' ' +
            button('Bar 1', '!pulse config hpBar 1') + button('Bar 2', '!pulse config hpBar 2') + button('Bar 3', '!pulse config hpBar 3') +
            '<br>Concentration marker: ' + escapeHtml(CONCENTRATION.marker) + ' ' +
            button('Change marker', '!pulse config marker ?{Concentration marker tag|chained-heart}') +
            '<br>' + button('Check selected tokens', '!pulse diagnose') +
            button('Advanced settings', '!pulse config') + button('Main menu', '!pulse-menu') +
            '<br><b>Advanced sheet mapping</b><br>2014/custom save: ' + escapeHtml(CONCENTRATION.saveAttribute) +
            ' ' + button('Change legacy save', '!pulse config saveAttribute ?{Save attribute|constitution_save_bonus}') +
            '<br>2024 save: ' + escapeHtml(CONCENTRATION.computedSaveAttribute) +
            ' ' + button('Change 2024 save', '!pulse config computedSaveAttribute ?{2024 save property|constitution_save_bonus}') +
            '<br>Legacy advantage: ' + escapeHtml(CONCENTRATION.warcasterAttribute) +
            ' ' + button('Change advantage attribute', '!pulse config warcasterAttribute ?{Advantage attribute|warcaster}') +
            '<br>' + button('Breaking conditions', '!pulse config conditions ?{Marker=Condition pairs or none|interdiction=Incapacitated,pummeled=Paralysed,frozen-orb=Petrified,fist=Stunned,sleepy=Unconscious}') +
            '<br>2024 sheets require the Experimental API sandbox. Link the HP token bar to the sheet HP field. ' +
            'Character choices apply to all tokens representing that character and survive restarts.');
    }

    function setupManager(payload, msg) {
        if (!payload.trim()) { showSetup(msg); return; }
        var parts = payload.trim().split(/\s+/), key = parts[0], value = parts[1];
        if (parts.length !== 2) { whisper('Use the Setup buttons to choose a setting.'); return; }
        if (key === 'sheet') {
            configure('sheet ' + value); showSetup(msg); return;
        }
        var allowed = key === 'selected-sheet' ? ['default', '2014', '2024', 'custom'] :
            key === 'advantage' ? ['default', 'yes', 'no'] : [];
        if (allowed.indexOf(value) === -1) { whisper('Invalid Setup choice.'); return; }
        var ids = selectedCharacters(msg);
        if (!ids.length) { whisper('Select tokens linked to characters first.'); return; }
        var data = getState();
        data.characterOptions = data.characterOptions || {};
        ids.forEach(function (id) {
            var options = data.characterOptions[id] || {};
            var field = key === 'selected-sheet' ? 'sheet' : 'advantage';
            if (value === 'default') { delete options[field]; } else { options[field] = value; }
            data.characterOptions[id] = options;
        });
        concentrationData().checks = {};
        whisper('Character settings saved. Request fresh concentration checks for any pending saves.');
        showSetup(msg);
    }

    function diagnose(msg) {
        var found = false;
        (msg.selected || []).forEach(function (selection) {
            var token = selection._type === 'graphic' && getObj('graphic', selection._id);
            if (!token) { return; }
            found = true;
            var character = token.get('represents');
            readConcentrationSheet(character, function (save) {
                if (token.get('represents') !== character) { whisper('Token link changed; run Diagnose again.'); return; }
                whisper('<b>' + escapeHtml(tokenLabel(token.id)) + '</b>: ' +
                    (save.error ? escapeHtml(save.error) : 'sheet ' + escapeHtml(save.profile) +
                    '; HP bar ' + CONCENTRATION.hpBar + ' = ' + escapeHtml(token.get('bar' + CONCENTRATION.hpBar + '_value')) +
                    '; save = ' + escapeHtml(save.value) + ' (attribute: ' + escapeHtml(save.attribute) + ')' +
                    '; concentration advantage = ' + (save.advantage ? 'Yes' : 'No') +
                    (save.value === null ? ' — SAVE NOT READY' : ' — save ready')));
            });
        });
        if (!found) { whisper('Select one or more tokens first.'); }
    }

    function concentrationData() {
        var data = getState();
        if (!data.concentration) { data.concentration = { sessions: {}, checks: {}, debug: false }; }
        return data.concentration;
    }

    function numericHP(value) {
        if (value === undefined || value === null || String(value).trim() === '') { return null; }
        var number = Number(value);
        return isFinite(number) ? number : null;
    }

    function breakingCondition(token) {
        var markers = String(token.get('statusmarkers') || '').split(',').map(function (marker) { return marker.split('@')[0]; });
        return CONCENTRATION.breakingConditions.filter(function (condition) { return markers.indexOf(condition.marker) !== -1; })[0];
    }

    function concentrationBlocked(token) {
        var hp = numericHP(token.get('bar' + CONCENTRATION.hpBar + '_value'));
        var condition = breakingCondition(token);
        return hp !== null && hp <= 0 ? '0 HP' : condition ? condition.name : '';
    }

    function concentrationCard(token, title, body) {
        // Keep checks for hidden tokens out of public chat.
        if (token.get('layer') && token.get('layer') !== 'objects') { whisper(escapeHtml(title) + '<br>' + body); }
        else { announce(title, body); }
    }

    function discardChecks(tokenId) {
        var checks = concentrationData().checks;
        Object.keys(checks).forEach(function (id) { if (checks[id].tokenId === tokenId) { delete checks[id]; } });
    }

    function forgetConcentration(tokenId) {
        discardChecks(tokenId);
        delete concentrationData().sessions[tokenId];
    }

    function refreshConcentration(token, manualName, restart) {
        var data = concentrationData();
        if (!hasConcentrationMarker(token)) { forgetConcentration(token.id); return null; }
        var effects = getState().effects.filter(function (effect) { return effect.tokenId === token.id && effect.concentration; });
        var session = data.sessions[token.id];
        var signature = effects.map(function (effect) { return effect.id + ':' + (effect.concentrationRevision || 'legacy'); }).sort().join('|');
        if (manualName === undefined) { manualName = session ? session.manualName : ''; }
        signature += '/' + (manualName || '');
        if (!session || session.signature !== signature || restart) {
            discardChecks(token.id);
            session = { id: nextId('C') + '-' + Date.now(), signature: signature,
                manualName: manualName || '', hp: numericHP(token.get('bar' + CONCENTRATION.hpBar + '_value')) };
            data.sessions[token.id] = session;
        }
        session.name = effects.length ? effects.map(function (effect) { return effect.name; }).join(', ') : manualName || 'Concentration';
        return session;
    }

    function endConcentration(token, reason) {
        var data = getState();
        var session = concentrationData().sessions[token.id];
        var name = session ? session.name : 'Concentration';
        data.effects = data.effects.filter(function (effect) { return effect.tokenId !== token.id || !effect.concentration; });
        var saved = data.tokenNames[token.id];
        if (saved) { saved.concentrationExpected = false; saved.concentrationAdded = false; }
        token.set('statusmarkers', String(token.get('statusmarkers') || '').split(',').filter(function (marker) {
            return marker && marker.split('@')[0] !== CONCENTRATION.marker;
        }).join(','));
        forgetConcentration(token.id);
        syncTokenName(token.id);
        if (reason) { concentrationCard(token, 'Concentration Ended', '<b>' + escapeHtml(tokenLabel(token.id)) + '</b> loses <b>' + escapeHtml(name) + '</b>: ' + escapeHtml(reason) + '.'); }
    }

    function requestConcentrationCheck(token, dc, damage) {
        var session = refreshConcentration(token);
        if (!session) { return; }
        var id = nextId('Q') + '-' + Date.now();
        concentrationData().checks[id] = { tokenId: token.id, sessionId: session.id, dc: dc };
        concentrationCard(token, 'Concentration Required', '<b>' + escapeHtml(tokenLabel(token.id)) + '</b>' +
            (damage === undefined ? ' needs a check' : ' took <b>' + damage + ' damage</b>') +
            ' while maintaining <b>' + escapeHtml(session.name) + '</b>.<br>' +
            button('Click to Roll — DC ' + dc, '!concentration roll --token ' + token.id + ' --check ' + id));
    }

    function handleConcentrationDamage(token, previous) {
        if (!token || token.get('_subtype') !== 'token') { return; }
        if (!hasConcentrationMarker(token)) {
            if (getState().tokenNames[token.id]) { syncTokenName(token.id); }
            forgetConcentration(token.id);
            return;
        }
        var oldSession = concentrationData().sessions[token.id];
        var session = refreshConcentration(token);
        var blocked = concentrationBlocked(token);
        if (blocked) { endConcentration(token, blocked); return; }
        var bar = 'bar' + CONCENTRATION.hpBar + '_value';
        var current = numericHP(token.get(bar));
        var prior = oldSession === session ? session.hp : numericHP(previous && previous[bar]);
        if (current === null) { session.hp = null; return; }
        session.hp = current; // One cache for property events, broad events and polling.
        if (prior === null || current >= prior) { return; }
        var damage = prior - current;
        if (concentrationData().debug) { whisper('HP change: ' + escapeHtml(tokenLabel(token.id)) + ' ' + prior + ' → ' + current); }
        requestConcentrationCheck(token, Math.max(10, Math.floor(damage / 2)), damage);
    }

    function pollConcentration() {
        (findObjs({ _type: 'graphic', _subtype: 'token' }) || []).forEach(function (token) {
            if (hasConcentrationMarker(token) || concentrationData().sessions[token.id]) { handleConcentrationDamage(token); }
        });
    }

    function controlsConcentration(token, playerId) {
        if (playerIsGM(playerId)) { return true; }
        var controllers = String(token.get('controlledby') || '').split(',');
        var character = token.get('represents') && getObj('character', token.get('represents'));
        if (character) { controllers = controllers.concat(String(character.get('controlledby') || '').split(',')); }
        return controllers.indexOf('all') !== -1 || controllers.indexOf(playerId) !== -1;
    }

    function rollConcentration(token, checkId, playerId) {
        // Process intervening HP/condition/marker changes before trusting the button.
        handleConcentrationDamage(token);
        var data = concentrationData();
        var check = data.checks[checkId];
        var session = data.sessions[token.id];
        if (!check || check.tokenId !== token.id || !session || check.sessionId !== session.id || !hasConcentrationMarker(token)) {
            whisper('That concentration check has expired or was already rolled. Use a current check button.'); return;
        }
        var characterId = token.get('represents');
        if (pendingSheetReads[checkId]) { return; }
        pendingSheetReads[checkId] = true;
        readConcentrationSheet(characterId, function (save) {
            delete pendingSheetReads[checkId];
            // Beacon reads yield: recheck identity, permissions and session before
            // using the result. Never let an old read affect a replacement spell.
            var currentToken = getObj('graphic', token.id);
            if (!currentToken || currentToken.get('represents') !== characterId) { return; }
            handleConcentrationDamage(currentToken);
            var currentData = concentrationData(), currentSession = currentData.sessions[token.id];
            if (currentData.checks[checkId] !== check || !currentSession ||
                    currentSession.id !== session.id || !hasConcentrationMarker(currentToken) ||
                    !controlsConcentration(currentToken, playerId)) { return; }
            if (save.error || save.value === null) {
                whisper('Cannot roll for ' + escapeHtml(tokenLabel(token.id)) + ': ' +
                    escapeHtml(save.error || ('missing or non-numeric ' + save.attribute +
                    '. Correct the character attribute, then click the same button again.'))); return;
            }
            var modifier = save.value, warcaster = save.advantage;
            delete currentData.checks[checkId]; // Consume before rolling or sending chat.
            var first = randomInteger(20), second = warcaster ? randomInteger(20) : null;
            var die = warcaster ? Math.max(first, second) : first;
            var total = die + modifier, success = total >= check.dc, spell = currentSession.name;
            if (!success) { endConcentration(currentToken); }
            concentrationCard(currentToken, 'Concentration Check', '<b>' + escapeHtml(tokenLabel(token.id)) + '</b><br>' +
                (warcaster ? 'War Caster Advantage / Concentration Advantage: [' + first + ', ' + second + ']<br>' : '') +
                die + (modifier >= 0 ? ' + ' : ' − ') + Math.abs(modifier) + ' = <b>' + total + '</b> vs DC ' + check.dc + '<br>' +
                '<b>' + (success ? 'Success' : 'Failure') + '</b> — ' + (success ? 'maintains ' : 'loses ') + escapeHtml(spell) + '.');
        });
    }

    function handleConcentrationCommand(msg) {
        var content = String(msg.content || '');
        if (/^!concentration\s+debug\s*$/i.test(content)) {
            if (playerIsGM(msg.playerid)) { concentrationData().debug = !concentrationData().debug; whisper('Concentration debug ' + (concentrationData().debug ? 'ON' : 'OFF')); }
            return;
        }
        var action = content.match(/^!concentration\s+(start|stop|roll|check)\b/i);
        var tokenMatch = content.match(/--token\s+(\S+)/i);
        var token = tokenMatch && getObj('graphic', tokenMatch[1]);
        if (!action || !token || token.get('_subtype') !== 'token') { whisper('Use !concentration start, stop or check with --token TOKEN_ID.'); return; }
        if (!controlsConcentration(token, msg.playerid)) { whisper('Only the GM or a controller of that token can manage its concentration checks.'); return; }
        var verb = action[1].toLowerCase();
        if (verb === 'roll') {
            var check = content.match(/--check\s+(\S+)/i);
            if (!check) { whisper('Old concentration roll buttons are no longer valid. Request a fresh check using !concentration check --token TOKEN_ID --dc NUMBER.'); return; }
            rollConcentration(token, check[1], msg.playerid); return;
        }
        if (verb === 'stop') { endConcentration(token, 'stopped manually'); return; }
        if (verb === 'check') {
            handleConcentrationDamage(token);
            var dcMatch = content.match(/--dc\s+(\S+)/i), dc = dcMatch ? Number(dcMatch[1]) : 10;
            if (!isFinite(dc) || dc < 1 || Math.floor(dc) !== dc) { whisper('DC must be a positive whole number.'); return; }
            if (!hasConcentrationMarker(token)) { whisper('That token is not concentrating.'); return; }
            requestConcentrationCheck(token, dc); return;
        }
        var blocked = concentrationBlocked(token);
        if (blocked) { whisper('Cannot concentrate: ' + escapeHtml(blocked) + '.'); return; }
        var nameMatch = content.match(/--name\s+([\s\S]*?)(?=\s+--(?:token|dc|check)\b|$)/i);
        var name = nameMatch ? nameMatch[1].trim() : 'Concentration';
        endConcentration(token);
        var markers = String(token.get('statusmarkers') || '').split(',').filter(Boolean);
        markers.push(CONCENTRATION.marker); token.set('statusmarkers', markers.join(','));
        refreshConcentration(token, name, true);
        concentrationCard(token, 'Concentration Started', escapeHtml(tokenLabel(token.id)) + ' is concentrating on <b>' + escapeHtml(name) + '</b>.');
    }

    function initialiseConcentration() {
        var data = concentrationData();
        if (!data.importedManual) {
            var legacy = state.MANUAL_CONCENTRATION && state.MANUAL_CONCENTRATION.spells || {};
            Object.keys(legacy).forEach(function (id) {
                var token = getObj('graphic', id);
                if (token && hasConcentrationMarker(token)) { refreshConcentration(token, legacy[id]); }
            });
            data.importedManual = true;
        }
        // Establish HP baselines without interpreting offline HP edits as damage.
        (findObjs({ _type: 'graphic', _subtype: 'token' }) || []).forEach(function (token) {
            if (hasConcentrationMarker(token)) {
                var session = refreshConcentration(token);
                session.hp = numericHP(token.get('bar' + CONCENTRATION.hpBar + '_value'));
                if (concentrationBlocked(token)) { endConcentration(token, concentrationBlocked(token)); }
            } else { forgetConcentration(token.id); }
        });
    }


    function hasConcentrationMarker(token) {
        return String(token.get('statusmarkers') || '').split(',').some(function (marker) {
            return marker.split('@')[0] === CONCENTRATION.marker;
        });
    }

    function observeConcentrationLoss() {
        var data = getState();
        Object.keys(data.tokenNames).forEach(function (id) {
            var token = getObj('graphic', id);
            if (token && data.tokenNames[id].concentrationExpected && !hasConcentrationMarker(token)) {
                syncTokenName(id);
            }
        });
    }

    function syncConcentration(token, saved, effects) {
        var markers = String(token.get('statusmarkers') || '').split(',').filter(Boolean);
        var hasMarker = markers.some(function (marker) { return marker.split('@')[0] === CONCENTRATION.marker; });
        var needed = effects.some(function (effect) { return effect.concentration === true && effect.remaining > 0; });
        saved.concentrationExpected = needed;
        if (needed && !hasMarker) {
            markers.push(CONCENTRATION.marker);
            saved.concentrationAdded = true;
            token.set('statusmarkers', markers.join(','));
        } else if (!needed && saved.concentrationAdded) {
            // Preserve markers which were already present before Pulse needed one.
            saved.concentrationAdded = false;
            token.set('statusmarkers', markers.filter(function (marker) {
                return marker.split('@')[0] !== CONCENTRATION.marker;
            }).join(','));
        }
        refreshConcentration(token);
    }

    function tokenLabel(tokenId) {
        var saved = getState().tokenNames[tokenId];
        var token = getObj('graphic', tokenId);
        return saved ? saved.base : (token ? token.get('name') || 'Unnamed token' : 'Missing token');
    }

    function syncTokenName(tokenId) {
        var data = getState();
        var saved = data.tokenNames[tokenId];
        var token = getObj('graphic', tokenId);
        if (!saved) { return; }
        if (!token) {
            data.effects = data.effects.filter(function (effect) { return effect.tokenId !== tokenId; });
            delete data.tokenNames[tokenId];
            return;
        }
        // A missing marker which was previously present means concentration broke.
        // Check before rendering so a name update or EOT cannot restore it first.
        if (saved.concentrationExpected && !hasConcentrationMarker(token)) {
            var ended = data.effects.filter(function (effect) {
                return effect.tokenId === tokenId && effect.concentration === true;
            });
            saved.concentrationExpected = false;
            saved.concentrationAdded = false;
            data.effects = data.effects.filter(function (effect) {
                return effect.tokenId !== tokenId || effect.concentration !== true;
            });
            if (ended.length) {
                whisper('Concentration ended on <b>' + escapeHtml(saved.base) + '</b>: ' +
                    ended.map(function (effect) { return escapeHtml(effect.name); }).join(', ') + '.');
            }
        }
        var current = String(token.get('name') || '');
        if (current !== saved.base + saved.suffix) {
            saved.base = saved.suffix && current.slice(-saved.suffix.length) === saved.suffix ?
                current.slice(0, -saved.suffix.length) : current;
        }
        var effects = data.effects.filter(function (effect) { return effect.tokenId === tokenId; });
        syncConcentration(token, saved, effects);
        saved.suffix = effects.map(function (effect) { return ' ' + effect.emoji + effect.remaining; }).join('');
        var desired = saved.base + saved.suffix;
        if (!effects.length) { delete data.tokenNames[tokenId]; }
        if (current !== desired) { token.set('name', desired); }
    }

    function syncTokenNames() {
        Object.keys(getState().tokenNames).forEach(syncTokenName);
    }

    function addTokenEffect(payload, msg) {
        var fields = splitFields(payload);
        var duration = Number(fields[1]);
        var emoji = fields[2] || '🔹';
        var concentrationChoice = String(fields[3] || 'no').toLowerCase();
        if (concentrationChoice !== 'yes' && concentrationChoice !== 'no') {
            whisper('Concentration must be Yes or No.');
            return;
        }
        var concentration = concentrationChoice === 'yes';
        if (!fields[0] || !fields[1] || !isFinite(duration) || duration < 1 ||
                Math.floor(duration) !== duration || duration > Number.MAX_SAFE_INTEGER ||
                COUNTER_EMOJIS.indexOf(emoji) === -1) {
            whisper('Usage: <code>!pulse token-effect Name %% Rounds %% Emoji</code>. Select the affected tokens first. Use a positive whole number and a supported counter emoji.');
            return;
        }
        var ids = [];
        (fields[4] ? [{ _type: 'graphic', _id: fields[4] }] : (msg.selected || [])).forEach(function (selection) {
            var token = selection._type === 'graphic' && getObj('graphic', selection._id);
            if (token && token.get('_subtype') === 'token' && ids.indexOf(token.id) === -1) { ids.push(token.id); }
        });
        if (!ids.length) {
            whisper('Select one or more affected tokens, then add the token effect.');
            return;
        }
        var data = getState();
        if (concentration) {
            ids = ids.filter(function (id) {
                var blocked = concentrationBlocked(getObj('graphic', id));
                if (blocked) { whisper('Cannot add concentration to ' + escapeHtml(tokenLabel(id)) + ': ' + escapeHtml(blocked) + '.'); }
                return !blocked;
            });
            if (!ids.length) { return; }
        }
        ids.forEach(function (id) {
            var token = getObj('graphic', id);
            if (concentration) { endConcentration(token); }
            if (!data.tokenNames[id]) { data.tokenNames[id] = { base: String(token.get('name') || ''), suffix: '' }; }
            var existing = data.effects.filter(function (effect) { return effect.tokenId === id && effect.name === fields[0]; })[0];
            if (existing) {
                existing.remaining = duration;
                existing.emoji = emoji;
                existing.concentration = concentration;
                existing.concentrationRevision = concentration ? nextId('R') : null;
            } else {
                data.effects.push({ id: nextId('E'), name: fields[0], remaining: duration, tokenId: id, emoji: emoji, concentration: concentration,
                    concentrationRevision: concentration ? nextId('R') : null });
            }
            syncTokenName(id);
        });
        whisper('Added <b>' + escapeHtml(fields[0]) + '</b> to ' + ids.length + ' token(s) for ' + duration +
            ' turn(s) of each affected token. Counters tick at that token\'s turn end and follow its nameplate visibility settings.');
    }

    function bindEffect(payload, msg) {
        var data = getState();
        var effect = data.effects.filter(function (item) { return item.id === payload.trim(); })[0];
        var selected = msg.selected || [];
        var token = selected.length === 1 && selected[0]._type === 'graphic' && getObj('graphic', selected[0]._id);
        if (!effect || effect.tokenId || !token || token.get('_subtype') !== 'token') {
            whisper('Select exactly one token and use <code>!pulse bind EffectID</code> for an unassigned effect listed in Inspect.');
            return;
        }
        effect.tokenId = token.id;
        if (effect.concentration) {
            var blocked = concentrationBlocked(token);
            if (blocked) { delete effect.tokenId; whisper('Cannot concentrate: ' + escapeHtml(blocked)); return; }
            // Keep the unassigned record aside while replacing the previous spell.
            delete effect.tokenId;
            endConcentration(token);
            effect.tokenId = token.id;
        }
        effect.emoji = effect.emoji || '🔹';
        if (!data.tokenNames[token.id]) { data.tokenNames[token.id] = { base: String(token.get('name') || ''), suffix: '' }; }
        syncTokenName(token.id);
        whisper('Effect attached to ' + escapeHtml(tokenLabel(token.id)) + '. It now counts down at that token\'s turn end.');
    }

    function editEffect(payload) {
        var fields = splitFields(payload);
        var duration = Number(fields[1]);
        var data = getState();
        var effect = data.effects.filter(function (item) { return item.id === fields[0]; })[0];
        if (!effect || !fields[1] || !isFinite(duration) || duration < 0 ||
                Math.floor(duration) !== duration || duration > Number.MAX_SAFE_INTEGER) {
            whisper('Use <code>!pulse edit EffectID %% Rounds</code> with an existing ID and a whole number of zero or greater. Inspect lists IDs.');
            return;
        }
        effect.remaining = duration;
        if (!duration) { data.effects = data.effects.filter(function (item) { return item.id !== effect.id; }); }
        if (effect.tokenId) { syncTokenName(effect.tokenId); }
        whisper(duration ? 'Effect duration updated.' : 'Effect removed.');
    }

    function reportEffect(effect, expired) {
        var body = '<b>' + escapeHtml(effect.name) + '</b>' +
            (effect.tokenId ? ' on <b>' + escapeHtml(tokenLabel(effect.tokenId)) + '</b>' : '') +
            (expired ? ' has expired.' : '<div>' + effect.remaining + ' token turn(s) remaining.</div>');
        // Token effects are GM-only in chat, including tokens on hidden pages/layers.
        // Global effects keep Initiative Pulse's public announcements.
        if (effect.tokenId) { whisper(body); }
        else { announce(expired ? 'Effect Expired' : 'Effect', body); }
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

    function handleTokenTurn(campaign, prev) {
        // Full-order, one-step rotation only. Retain custom entries so ending a
        // token turn on a round-marker entry still counts exactly once.
        var before = parseTurnOrder(prev && prev.turnorder);
        var after = parseTurnOrder(campaign.get('turnorder'));
        if (before.length < 2 || before.length !== after.length) { return; }
        var oldKeys = before.map(turnKey);
        var newKeys = after.map(turnKey);
        if (JSON.stringify(oldKeys) === JSON.stringify(newKeys)) { return; }
        var forward = oldKeys.slice(1).concat(oldKeys[0]);
        if (JSON.stringify(forward) !== JSON.stringify(newKeys)) { return; }
        var tokenId = before[0].id;
        if (!tokenId || tokenId === '-1' || !getObj('graphic', tokenId)) { return; }
        var data = getState();
        data.effects.forEach(function (effect) {
            if (effect.tokenId !== tokenId) { return; }
            effect.remaining -= 1;
            if (effect.remaining <= 0) { reportEffect(effect, true); }
        });
        data.effects = data.effects.filter(function (effect) { return effect.remaining > 0; });
        syncTokenName(tokenId);
    }

    function handleTurnOrder(campaign, prev) {
        handleTokenTurn(campaign, prev);
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

        // Compatibility with existing tracker notifications. Effect durations
        // are exclusively driven by the affected token leaving the top slot.
    }

    function scriptCardsInstalled() {
        return typeof ScriptCards !== 'undefined' || !!state.ScriptCards;
    }

    function showMenu() {
        var body = '<div>' +
            button('Add Action', '!pulse action ?{Action name} %% ?{Initiative|20} %% ?{Repeat|No,no|Yes,yes}') +
            button('Add Effect to Selected Tokens', '!pulse effect ?{Effect name} %% ?{Affected token turns|1} %% ?{Counter|Blue,🔹|Orange,🔸|Star,⭐|Sparkles,✨|Diamond,💠} %% ?{Concentration|No,no|Yes,yes}') +
            '</div><div style="margin-top:5px;">' +
            button('Inspect', '!pulse inspect') + button('Clear Combat', '!pulse clear') +
            button('Setup', '!pulse setup') + button('Check Selected Tokens', '!pulse diagnose') +
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

    function dropdownMacro() {
        // Escape nested query delimiters so only the selected branch is expanded.
        function nested(text) {
            return text.replace(/\|/g, '&#124;').replace(/,/g, '&#44;').replace(/}/g, '&#125;');
        }
        return '!pulse ?{Initiative Pulse' +
            '|Action,action ' + nested('?{Action name} %% ?{Initiative|20} %% ?{Repeat|No,no|Yes,yes}') +
            '|Effect,effect ' + nested('?{Effect name} %% ?{Affected token turns|1} %% ?{Counter|Blue,🔹|Orange,🔸|Star,⭐|Sparkles,✨|Diamond,💠} %% ?{Concentration|No,no|Yes,yes}') +
            '|Inspect,inspect|Menu,menu}';
    }

    function installScriptCardsMacro(playerid) {
        if (!scriptCardsInstalled()) {
            whisper('Install ScriptCards to use this interactive form, or use !pulse-menu.');
            return;
        }
        var action = "!scriptcard {{\n--#title|Initiative Pulse\n--#whisper|gm\n--=Type|?{Initiative Pulse|Action,1|Effect,2}\n--?[$Type.Total] -eq 1|Action\n--^Effect|\n--:Action|\n--iCustom Action;Enter Action Details|q;ActionName;Action Name||q;Start;Starting Initiative||q;Repeat;Repeat each round? Enter yes or no\n--@pulse|action [&ActionName] %% [&Start] %% [&Repeat]\n--X|\n--:Effect|\n--?[@SC_SelectedTokens(length)] -eq 0|NoToken\n--iCustom Effect;Enter Effect Details|q;EffectName;Effect Name||q;Duration;Duration in affected token turns||q;Concentration;Concentration? Enter yes or no\n--@pulse|effect [&EffectName] %% [&Duration] %% 🔹 %% [&Concentration] %% [@SC_SelectedTokens(0)]\n--X|\n--:NoToken|\n--+Select a token|Select the affected token before choosing Effect.\n--X|\n}}";
        upsertMacro(playerid, SCRIPT_CARDS_MACRO, action);
    }

    function clearCombat() {
        var data = getState();
        Object.keys(concentrationData().sessions).forEach(function (id) {
            var token = getObj('graphic', id);
            if (token && concentrationData().sessions[id].manualName) { endConcentration(token); } else { forgetConcentration(id); }
        });
        data.actions = [];
        data.effects = [];
        syncTokenNames();
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
            var target = item.tokenId ? ' on ' + tokenLabel(item.tokenId) : ' (unassigned; paused — select a token and Bind)';
            return '<li><b>' + escapeHtml(item.name) + '</b>' + escapeHtml(target) +
                (item.concentration ? ' <b>[Concentration]</b>' : '') +
                ' — ' + item.remaining + ' token turn(s) [' + escapeHtml(item.id) + '] ' +
                (!item.tokenId ? button('Bind', '!pulse bind ' + item.id) : '') +
                (item.tokenId && item.concentration ? button('Request Save', '!concentration check --token ' + item.tokenId + ' --dc ?{Concentration DC|10}') : '') +
                button('Edit', '!pulse edit ' + item.id + ' %% ?{Token turns remaining|' + item.remaining + '}') +
                button('Remove', '!pulse remove ' + item.id) + '</li>';
        }).join('') : '<li>None</li>';
        whisper('<b>Actions</b><ul>' + actions + '</ul><b>Effects</b><ul>' + effects + '</ul>');
    }

    function clean(playerid) {
        [MENU_MACRO, SCRIPT_CARDS_MACRO, CLEAR_MACRO].forEach(function (name) {
            findObjs({ _type: 'macro', _playerid: playerid, name: name }).forEach(function (macro) { macro.remove(); });
        });
        Object.keys(concentrationData().sessions).forEach(function (id) {
            var token = getObj('graphic', id);
            if (token && concentrationData().sessions[id].manualName) { endConcentration(token); } else { forgetConcentration(id); }
        });
        getState().effects = [];
        syncTokenNames();
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
        if (/^!concentration(?:\s|$)/i.test(content)) {
            handleConcentrationCommand(msg);
            return;
        }

        if (/^!eot(?:\s|$)/i.test(content)) {
            // Check both sides of the dispatch so script load order does not matter.
            // ITP remains responsible for permissions and advancing the tracker.
            observeTurnOrder();
            setTimeout(observeTurnOrder, 0);
            setTimeout(observeTurnOrder, 100);
            return;
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
        // Finish any already-completed tracker move before adding/editing Effects.
        observeTurnOrder();
        command = String(match[1] || '').toLowerCase();
        payload = match[2] || '';

        switch (command) {
        case 'action': addAction(payload); break;
        case 'effect': addTokenEffect(payload, msg); break;
        case 'token-effect': addTokenEffect(payload, msg); break;
        case 'bind': bindEffect(payload, msg); break;
        case 'edit': editEffect(payload); break;
        case 'remove': editEffect(payload.trim() + ' %% 0'); break;
        case 'install-macro': upsertMacro(msg.playerid, MENU_MACRO, '!pulse-menu'); break;
        case 'install-scriptcards-macro': installScriptCardsMacro(msg.playerid); break;
        case 'install-clear-macro': upsertMacro(msg.playerid, CLEAR_MACRO, '!pulse clear'); break;
        case 'clear': clearCombat(); break;
        case 'inspect': inspect(); break;
        case 'clean': clean(msg.playerid); break;
        case 'config': configure(payload); break;
        case 'setup': if (playerIsGM(msg.playerid)) { setupManager(payload, msg); } break;
        case 'diagnose': diagnose(msg); break;
        default: showMenu();
        }
    }

    function checkInstall() {
        var data = getState();
        // One-time correction of the pre-release 2014 default; preserve custom mappings.
        if (!data.playerSaveDefaultCorrected) {
            if (data.config && data.config.sheet !== 'custom' &&
                    data.config.saveAttribute === 'constitution_save_mod') {
                data.config.saveAttribute = 'constitution_save_bonus';
                if (data.concentration) { data.concentration.checks = {}; }
            }
            data.playerSaveDefaultCorrected = true;
        }
        if (data.config) { Object.keys(CONCENTRATION).forEach(function (key) { if (data.config[key] !== undefined) { CONCENTRATION[key] = data.config[key]; } }); }
        data.activeInitiative = currentInitiative(Campaign());
        observedTurnOrder = Campaign().get('turnorder') || '';
        // Upgrade existing concentration records without resurrecting a removed marker.
        Object.keys(data.tokenNames).forEach(function (id) {
            if (data.tokenNames[id].concentrationExpected === undefined) {
                data.tokenNames[id].concentrationExpected = data.effects.some(function (effect) {
                    return effect.tokenId === id && effect.concentration === true;
                });
            }
        });
        syncTokenNames();
        initialiseConcentration();
        if (data.effects.some(function (effect) { return !effect.tokenId; })) {
            whisper('Older unassigned Effects are preserved but paused. Use Inspect to bind each to its affected token.');
        }
        log(SCRIPT + ' v' + VERSION + ' ready.');
    }

    function registerEventHandlers() {
        on('chat:message', handleInput);
        on('change:campaign:turnorder', observeTurnOrder);
        // Script writes do not emit native change events. Covers delayed ITP
        // writes and other turn-advance integrations; same baseline prevents repeats.
        setInterval(observeTurnOrder, 250);
        setInterval(pollConcentration, 500);
        [1, 2, 3].forEach(function (bar) {
            on('change:graphic:bar' + bar + '_value', function (token, previous) {
                if (bar === CONCENTRATION.hpBar) { handleConcentrationDamage(token, previous); }
            });
        });
        on('change:graphic', handleConcentrationDamage);
        on('change:graphic:statusmarkers', function (token) {
            if (getState().tokenNames[token.id]) { syncTokenName(token.id); }
            handleConcentrationDamage(token);
        });
        on('change:graphic:name', function (token) {
            if (getState().tokenNames[token.id]) { syncTokenName(token.id); }
        });
        on('destroy:graphic', function (token) {
            var data = getState();
            data.effects = data.effects.filter(function (effect) { return effect.tokenId !== token.id; });
            delete data.tokenNames[token.id];
            forgetConcentration(token.id);
        });
    }

    on('ready', function () {
        checkInstall();
        registerEventHandlers();
    });

    return { version: VERSION };
}());
