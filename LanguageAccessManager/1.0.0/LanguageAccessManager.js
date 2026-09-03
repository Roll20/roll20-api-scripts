/*
 * Language Access Manager
 * Version 1.0.0
 * Author: Kingkiller546
 * License: MIT (SPDX-License-Identifier: MIT)
 *
 * Roll20 Mod/API script for managing temporary access to hidden language
 * character sheets. Designed first for Tal'Tamaira with a non-destructive
 * setup wizard, generated GM macros, and extension points for public release.
 *
 * Commands (GM only):
 *   !lang help
 *   !lang list
 *   !lang grant <player or character> <language[, language...] | all>
 *   !lang restore <player or character>
 *   !lang status <player or character>
 *   !lang setup
 *   !lang setup validate
 *   !lang setup create-sheets
 *   !lang setup grant-gm
 *   !lang rebuildmacros
 *   !lang playermacro <player or character>
 *   !lang manage <player or character>
 *   !lang permanent <add|remove> <player or character> <language>
 *   !lang registry preset <standard|tal-tamaira>
 *   !lang registry add <display name> <exact sheet name>
 *   !lang registry remove <display name>
 *
 * Quote names containing spaces, for example:
 *   !lang grant "Bob Whatshisface" "Deep Speech, Elvish"
 */

var LanguageAccessManager = LanguageAccessManager || (function () {
    'use strict';

    var SCRIPT = 'Language Access Manager';
    var VERSION = '1.0.0';
    var STATE_KEY = 'LanguageAccessManager';
    var SCHEMA_VERSION = 2;

    // Registry is deliberately separate from permission and command logic.
    // TODO: move registry data into state with validation/import commands.
    var TAL_TAMAIRA_REGISTRY = [
        { display: 'Ademic', sheet: 'Sheltek Ademic Language' },
        { display: 'Druidic', sheet: 'Druvo Druidic Language' },
        { display: 'Dwarvish', sheet: 'Kharzun Dwarvish Language' },
        { display: 'Elvish', sheet: 'Aeltharyn Elvish Language' },
        { display: 'Giant', sheet: 'Druumeg Giant Language' },
        { display: 'Gnomish', sheet: 'Tivri Gnomish Language' },
        { display: 'Halfling', sheet: 'Lethwynn Half-ling Language' },
        { display: 'Orcish', sheet: 'Ghorvakh Orcish Language' },
        { display: 'Aarakocran', sheet: 'Kaaril Aarakocran Language' },
        { display: 'Abyssal', sheet: 'Gorazhul Abyssal Language' },
        { display: 'Celestial', sheet: 'Aelhael Celestial Language' },
        { display: 'Deep Speech', sheet: "Uul'Qhess DeepSpeech Language" },
        { display: 'Draconic', sheet: 'Kharzul Draconic Language' },
        { display: 'Goblin', sheet: 'Grik-Tak Goblin Language' },
        { display: 'Gnoll', sheet: 'Kharzra Gnoll Language' },
        { display: 'Infernal', sheet: 'Ishkarul Infernal Language' },
        { display: 'Leonin', sheet: "Rha'Savari Leonin Language" },
        { display: 'Sylvan', sheet: 'Vaeliri Sylvan Language' },
        { display: 'Undercommon', sheet: 'Xulvryn Undercommon Language' },
        { display: 'Primordial', sheet: 'Uraval Primordial Language' },
        { display: 'Aquan', sheet: 'Oshuren Aquan Language' },
        { display: 'Auran', sheet: 'Selayin Auran Language' },
        { display: 'Ignan', sheet: 'Avarakh Ignan Language' },
        { display: 'Terran', sheet: 'Durnak Terran Language' }
    ];

    var STANDARD_REGISTRY = [
        'Common', 'Dwarvish', 'Elvish', 'Giant', 'Gnomish', 'Goblin', 'Halfling', 'Orc',
        'Abyssal', 'Celestial', 'Draconic', 'Deep Speech', 'Infernal', 'Primordial', 'Sylvan', 'Undercommon'
    ].map(function (display) {
        return { display: display, sheet: display + ' Language' };
    });

    var REGISTRY = [];

    function cloneRegistry(registry) {
        return registry.map(function (entry) {
            return { display: entry.display, sheet: entry.sheet };
        });
    }

    function initialiseState() {
        if (!state[STATE_KEY]) {
            state[STATE_KEY] = {
                schemaVersion: SCHEMA_VERSION,
                sessions: {},
                effects: {},
                registryName: 'standard',
                registry: cloneRegistry(STANDARD_REGISTRY)
            };
        } else if (state[STATE_KEY].schemaVersion === 1) {
            state[STATE_KEY].schemaVersion = SCHEMA_VERSION;
            state[STATE_KEY].registryName = 'tal-tamaira';
            state[STATE_KEY].registry = cloneRegistry(TAL_TAMAIRA_REGISTRY);
        }
        state[STATE_KEY].sessions = state[STATE_KEY].sessions || {};
        state[STATE_KEY].effects = state[STATE_KEY].effects || {};
        state[STATE_KEY].registryName = state[STATE_KEY].registryName || 'custom';
        state[STATE_KEY].registry = state[STATE_KEY].registry || cloneRegistry(STANDARD_REGISTRY);
        REGISTRY = state[STATE_KEY].registry;
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (character) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
        });
    }

    function whisperGM(title, body) {
        var style = 'border:1px solid #5b4636;background:#f4efe6;padding:8px;border-radius:4px;';
        sendChat(SCRIPT, '/w gm <div style="' + style + '"><b>' + escapeHtml(title) +
            '</b><div style="margin-top:5px;">' + body + '</div></div>');
    }

    function normalise(value) {
        return String(value || '').trim().toLowerCase();
    }

    function unique(objects) {
        var seen = {};
        return objects.filter(function (object) {
            if (!object || seen[object.id]) {
                return false;
            }
            seen[object.id] = true;
            return true;
        });
    }

    function tokenise(input) {
        var tokens = [];
        var matcher = /"([^"]*)"|'([^']*)'|(\S+)/g;
        var match;
        while ((match = matcher.exec(input)) !== null) {
            tokens.push(match[1] !== undefined ? match[1] : (match[2] !== undefined ? match[2] : match[3]));
        }
        return tokens;
    }

    function findExact(type, property, query) {
        var wanted = normalise(query);
        return findObjs({ _type: type }).filter(function (object) {
            return normalise(object.get(property)) === wanted;
        });
    }

    function resolveTarget(query) {
        var players = [];
        var byId = getObj('player', query);
        if (byId) {
            players.push(byId);
        }
        players = players.concat(findExact('player', '_displayname', query));

        var characters = findExact('character', 'name', query);
        characters.forEach(function (character) {
            String(character.get('controlledby') || '').split(',').forEach(function (id) {
                id = id.trim();
                if (id && id !== 'all') {
                    players.push(getObj('player', id));
                }
            });
        });
        players = unique(players);

        if (players.length === 1) {
            return { player: players[0] };
        }
        if (players.length > 1) {
            return { error: '“' + escapeHtml(query) + '” resolves to multiple players. Use the exact player display name.' };
        }
        if (characters.length && characters.some(function (character) {
            return String(character.get('controlledby') || '').split(',').indexOf('all') !== -1;
        })) {
            return { error: 'That character is controlled by all players, so it cannot identify one permission recipient.' };
        }
        return { error: 'No exact player display name or character name matched “' + escapeHtml(query) + '”.' };
    }

    function resolveLanguages(request) {
        if (normalise(request) === 'all') {
            return { entries: REGISTRY.slice(), unknown: [] };
        }
        var wanted = String(request || '').split(',').map(function (part) { return normalise(part); }).filter(Boolean);
        var entries = [];
        var unknown = [];
        wanted.forEach(function (name) {
            var entry = REGISTRY.filter(function (item) {
                return normalise(item.display) === name || normalise(item.sheet) === name;
            })[0];
            if (entry) {
                if (entries.indexOf(entry) === -1) {
                    entries.push(entry);
                }
            } else {
                unknown.push(name);
            }
        });
        return { entries: entries, unknown: unknown };
    }

    function findLanguageSheet(entry) {
        var matches = findExact('character', 'name', entry.sheet);
        if (matches.length === 1) {
            return { sheet: matches[0] };
        }
        if (matches.length > 1) {
            return { error: entry.display + ': multiple character sheets are named “' + entry.sheet + '”.' };
        }
        return { error: entry.display + ': missing hidden sheet “' + entry.sheet + '”.' };
    }

    function playerHasAccess(controlledBy, playerId) {
        var controllers = String(controlledBy || '').split(',').map(function (id) { return id.trim(); });
        return controllers.indexOf('all') !== -1 || controllers.indexOf(playerId) !== -1;
    }

    function addPlayer(controlledBy, playerId) {
        var controllers = String(controlledBy || '').split(',').map(function (id) { return id.trim(); }).filter(Boolean);
        if (controllers.indexOf('all') === -1 && controllers.indexOf(playerId) === -1) {
            controllers.push(playerId);
        }
        return controllers.join(',');
    }

    function removePlayer(controlledBy, playerId) {
        return String(controlledBy || '').split(',').map(function (id) {
            return id.trim();
        }).filter(function (id) {
            return id && id !== playerId;
        }).join(',');
    }

    function grant(player, entries) {
        var playerId = player.id;
        var session = state[STATE_KEY].sessions[playerId] || {
            playerName: player.get('_displayname'),
            started: Date.now(),
            sheets: {}
        };
        var granted = [];
        var already = [];
        var errors = [];

        entries.forEach(function (entry) {
            var found = findLanguageSheet(entry);
            if (found.error) {
                errors.push(found.error);
                return;
            }
            var sheet = found.sheet;
            var before = String(sheet.get('controlledby') || '');
            if (!Object.prototype.hasOwnProperty.call(session.sheets, sheet.id)) {
                session.sheets[sheet.id] = {
                    display: entry.display,
                    sheetName: entry.sheet,
                    controlledby: before
                };
            }
            if (playerHasAccess(before, playerId)) {
                already.push(entry.display);
            } else {
                sheet.set('controlledby', addPlayer(before, playerId));
                granted.push(entry.display);
            }
        });

        if (Object.keys(session.sheets).length) {
            state[STATE_KEY].sessions[playerId] = session;
        }
        return { granted: granted, already: already, errors: errors };
    }

    function restore(player) {
        var session = state[STATE_KEY].sessions[player.id];
        var restored = [];
        var errors = [];
        if (!session) {
            return { none: true, restored: restored, errors: errors };
        }
        Object.keys(session.sheets).forEach(function (sheetId) {
            var snapshot = session.sheets[sheetId];
            var sheet = getObj('character', sheetId);
            if (!sheet) {
                errors.push(snapshot.display + ': the original sheet no longer exists (ID ' + sheetId + ').');
                return;
            }
            sheet.set('controlledby', snapshot.controlledby);
            restored.push(snapshot.display);
        });
        // Keep failed records so a later repair/retry cannot lose the snapshot.
        if (errors.length) {
            Object.keys(session.sheets).forEach(function (sheetId) {
                if (getObj('character', sheetId)) {
                    delete session.sheets[sheetId];
                }
            });
        } else {
            delete state[STATE_KEY].sessions[player.id];
        }
        return { restored: restored, errors: errors };
    }

    function formatItems(items) {
        return items.length ? items.map(escapeHtml).join(', ') : 'none';
    }

    function showHelp() {
        whisperGM(SCRIPT + ' v' + VERSION,
            '<div><code>!lang list</code></div>' +
            '<div><code>!lang grant "Player or Character" all</code></div>' +
            '<div><code>!lang grant "Player or Character" "Elvish, Deep Speech"</code></div>' +
            '<div><code>!lang status "Player or Character"</code></div>' +
            '<div><code>!lang restore "Player or Character"</code></div>' +
            '<div><code>!lang setup</code></div>' +
            '<div><code>!lang rebuildmacros</code></div>' +
            '<div><code>!lang playermacro "Player or Character"</code></div>' +
            '<div><code>!lang manage "Player or Character"</code></div>' +
            '<div style="margin-top:5px;">Names with spaces must be quoted. Commands are GM-only.</div>');
    }

    function showList() {
        var rows = REGISTRY.map(function (entry) {
            var found = findLanguageSheet(entry);
            return '<div>' + escapeHtml(entry.display) + ' → ' + escapeHtml(entry.sheet) +
                (found.error ? ' <span style="color:#a00;">[problem]</span>' : ' <span style="color:#286b28;">[found]</span>') + '</div>';
        });
        whisperGM('Language registry (' + REGISTRY.length + ')', rows.join(''));
    }

    function setRegistryPreset(name) {
        var preset = name === 'standard' ? STANDARD_REGISTRY : (name === 'tal-tamaira' ? TAL_TAMAIRA_REGISTRY : null);
        if (!preset) {
            whisperGM('Unknown registry preset', 'Use <code>standard</code> or <code>tal-tamaira</code>.');
            return;
        }
        state[STATE_KEY].registryName = name;
        state[STATE_KEY].registry = cloneRegistry(preset);
        REGISTRY = state[STATE_KEY].registry;
        whisperGM('Registry preset selected',
            '<div><b>Preset:</b> ' + escapeHtml(name) + '</div><div><b>Languages:</b> ' + REGISTRY.length + '</div>' +
            '<div style="margin-top:5px;">No sheets or macros were deleted or changed. Validate, create missing sheets, then rebuild macros.</div>');
        showSetup();
    }

    function addRegistryEntry(display, sheet) {
        if (!display || !sheet) {
            whisperGM('Registry entry not added', 'Both display name and exact sheet name are required.');
            return;
        }
        if (REGISTRY.some(function (entry) { return normalise(entry.display) === normalise(display); })) {
            whisperGM('Registry entry not added', 'A display language named “' + escapeHtml(display) + '” already exists.');
            return;
        }
        if (REGISTRY.some(function (entry) { return normalise(entry.sheet) === normalise(sheet); })) {
            whisperGM('Registry entry not added', 'The sheet name “' + escapeHtml(sheet) + '” is already assigned.');
            return;
        }
        REGISTRY.push({ display: display.trim(), sheet: sheet.trim() });
        state[STATE_KEY].registryName = 'custom';
        whisperGM('Registry entry added', escapeHtml(display) + ' → ' + escapeHtml(sheet));
    }

    function removeRegistryEntry(display) {
        var matches = REGISTRY.filter(function (entry) { return normalise(entry.display) === normalise(display); });
        if (matches.length !== 1) {
            whisperGM('Registry entry not removed', 'No exact display-language match was found.');
            return;
        }
        var index = REGISTRY.indexOf(matches[0]);
        REGISTRY.splice(index, 1);
        state[STATE_KEY].registryName = 'custom';
        whisperGM('Registry entry removed', escapeHtml(matches[0].display) +
            ' was removed from the registry. Its character sheet was not deleted or changed.');
    }

    function button(label, command) {
        return '<a style="display:inline-block;background:#5b4636;color:#fff;padding:4px 7px;' +
            'margin:2px;text-decoration:none;border-radius:3px;" href="' + escapeHtml(command) + '">' +
            escapeHtml(label) + '</a>';
    }

    function validateRegistry() {
        var found = [];
        var missing = [];
        var duplicates = [];
        REGISTRY.forEach(function (entry) {
            var matches = findExact('character', 'name', entry.sheet);
            if (matches.length === 1) {
                found.push(entry);
            } else if (!matches.length) {
                missing.push(entry);
            } else {
                duplicates.push(entry);
            }
        });
        return { found: found, missing: missing, duplicates: duplicates };
    }

    function showSetup() {
        var validation = validateRegistry();
        whisperGM('Language setup',
            '<div><b>Registry:</b> ' + escapeHtml(state[STATE_KEY].registryName) + ' (' + REGISTRY.length + ' languages)</div>' +
            '<div><b>Sheets found:</b> ' + validation.found.length + '</div>' +
            '<div><b>Missing:</b> ' + validation.missing.length + '</div>' +
            '<div><b>Duplicate names:</b> ' + validation.duplicates.length + '</div>' +
            '<div style="margin-top:5px;">' +
            button('Validate sheets', '!lang setup validate') +
            button('Create missing sheets', '!lang setup create-sheets') +
            button('Give me GM access', '!lang setup grant-gm') +
            button('Rebuild GM macros', '!lang rebuildmacros') +
            button('Build player macro', '!lang playermacro "?{Exact player or character name}"') +
            '<br>' + button('Standard preset', '!lang registry preset standard') +
            button('Tal\'Tamaira preset', '!lang registry preset tal-tamaira') +
            button('Add custom language', '!lang registry add "?{Display language}" "?{Exact sheet name}"') +
            '</div><div style="margin-top:5px;font-size:90%;">Creation is idempotent. Existing sheets are never changed.</div>');
    }

    function showValidation() {
        var validation = validateRegistry();
        var body = '<div><b>Found:</b> ' + validation.found.length + ' / ' + REGISTRY.length + '</div>';
        if (validation.missing.length) {
            body += '<div style="color:#a00;"><b>Missing:</b><br>' + validation.missing.map(function (entry) {
                return escapeHtml(entry.display + ' → ' + entry.sheet);
            }).join('<br>') + '</div>';
        }
        if (validation.duplicates.length) {
            body += '<div style="color:#a00;"><b>Duplicate exact sheet names:</b><br>' + validation.duplicates.map(function (entry) {
                return escapeHtml(entry.display + ' → ' + entry.sheet);
            }).join('<br>') + '</div>';
        }
        if (!validation.missing.length && !validation.duplicates.length) {
            body += '<div style="color:#286b28;"><b>Validation passed.</b> Every language has exactly one sheet.</div>';
        }
        whisperGM('Registry validation', body);
    }

    function createMissingSheets(ownerId) {
        var validation = validateRegistry();
        var created = [];
        validation.missing.forEach(function (entry) {
            var sheet = createObj('character', {
                name: entry.sheet,
                controlledby: ownerId,
                inplayerjournals: '',
                archived: false
            });
            if (sheet) {
                created.push(entry.sheet);
            }
        });
        whisperGM('Create language sheets',
            '<div><b>Created:</b> ' + formatItems(created) + '</div>' +
            '<div><b>Already present:</b> ' + validation.found.length + '</div>' +
            (validation.duplicates.length ? '<div style="color:#a00;"><b>Not changed—duplicate exact names:</b> ' +
                formatItems(validation.duplicates.map(function (entry) { return entry.sheet; })) + '</div>' : '') +
            '<div style="margin-top:5px;">New sheets are controlled by the invoking GM and have no player-journal visibility.</div>');
    }

    function grantGmAccess(ownerId) {
        var changed = [];
        var already = [];
        var errors = [];
        REGISTRY.forEach(function (entry) {
            var found = findLanguageSheet(entry);
            if (found.error) {
                errors.push(found.error);
                return;
            }
            var controlledBy = String(found.sheet.get('controlledby') || '');
            if (playerHasAccess(controlledBy, ownerId)) {
                already.push(entry.display);
            } else {
                found.sheet.set('controlledby', addPlayer(controlledBy, ownerId));
                changed.push(entry.display);
            }
        });
        whisperGM('GM language-sheet access',
            '<div><b>Access added:</b> ' + formatItems(changed) + '</div>' +
            '<div><b>Already accessible:</b> ' + formatItems(already) + '</div>' +
            (errors.length ? '<div style="color:#a00;"><b>Problems:</b><br>' + errors.map(escapeHtml).join('<br>') + '</div>' : '') +
            '<div style="margin-top:5px;">Existing player controllers and journal visibility were preserved.</div>');
    }

    function languageQuery() {
        return '?{Language|' + REGISTRY.map(function (entry) {
            return entry.display.replace(/,/g, '') + ',"' + entry.sheet.replace(/"/g, '') + '"';
        }).join('|') + '}';
    }

    function macroDefinitions() {
        var query = languageQuery();
        return [
            {
                name: 'Language-Spoken-GM',
                action: '/em ?{NPC Name|} speaks in a foreign tongue, "?{Foreign Language Text?}"\n' +
                    '!lang route --mode|spoken --language|' + query + ' --translation|?{Translation}'
            },
            {
                name: 'Language-Inscription-GM',
                action: '/em Inscription reads, "?{Foreign Language Text?}"\n' +
                    '!lang route --mode|written --language|' + query + ' --translation|?{Translation}'
            }
        ];
    }

    function rebuildGmMacros(ownerId) {
        var created = [];
        var updated = [];
        var errors = [];
        macroDefinitions().forEach(function (definition) {
            var owned = findObjs({ _type: 'macro', _playerid: ownerId }).filter(function (macro) {
                return macro.get('name') === definition.name;
            });
            if (owned.length > 1) {
                errors.push(definition.name + ': you own multiple macros with this name; none were changed.');
            } else if (owned.length === 1) {
                owned[0].set({ action: definition.action, visibleto: '' });
                updated.push(definition.name);
            } else {
                var macro = createObj('macro', {
                    name: definition.name,
                    action: definition.action,
                    _playerid: ownerId,
                    visibleto: ''
                });
                if (macro) {
                    created.push(definition.name);
                } else {
                    errors.push(definition.name + ': Roll20 did not create the macro.');
                }
            }
        });
        whisperGM('Rebuild GM language macros',
            '<div><b>Created:</b> ' + formatItems(created) + '</div>' +
            '<div><b>Updated:</b> ' + formatItems(updated) + '</div>' +
            (errors.length ? '<div style="color:#a00;"><b>Not changed:</b><br>' + errors.map(escapeHtml).join('<br>') + '</div>' : '') +
            '<div style="margin-top:5px;">Only macros owned by the invoking GM were considered. They remain GM-private.</div>');
    }

    function permanentLanguages(player) {
        var session = state[STATE_KEY].sessions[player.id];
        var entries = [];
        var errors = [];
        REGISTRY.forEach(function (entry) {
            var found = findLanguageSheet(entry);
            if (found.error) {
                errors.push(found.error);
                return;
            }
            var controlledBy = found.sheet.get('controlledby');
            if (session && Object.prototype.hasOwnProperty.call(session.sheets, found.sheet.id)) {
                controlledBy = session.sheets[found.sheet.id].controlledby;
            }
            if (playerHasAccess(controlledBy, player.id)) {
                entries.push(entry);
            }
        });
        return { entries: entries, errors: errors };
    }

    function showManage(player) {
        var access = permanentLanguages(player);
        if (access.errors.length) {
            whisperGM('Cannot manage languages',
                '<div>Registry validation must pass first.</div><div style="color:#a00;">' +
                access.errors.map(escapeHtml).join('<br>') + '</div>');
            return;
        }
        var knownNames = {};
        access.entries.forEach(function (entry) { knownNames[entry.display] = true; });
        var unknown = REGISTRY.filter(function (entry) { return !knownNames[entry.display]; });
        var playerId = player.id;
        var session = state[STATE_KEY].sessions[playerId];
        var removeButtons = access.entries.map(function (entry) {
            return button('− ' + entry.display, '!lang permanent remove ' + playerId + ' "' + entry.display + '"');
        }).join('');
        var addButtons = unknown.map(function (entry) {
            return button('+ ' + entry.display, '!lang permanent add ' + playerId + ' "' + entry.display + '"');
        }).join('');

        whisperGM('Manage languages: ' + player.get('_displayname'),
            '<div><b>Permanent languages:</b> ' + formatItems(access.entries.map(function (entry) {
                return entry.display;
            })) + '</div>' +
            (removeButtons ? '<div style="margin-top:5px;"><b>Remove:</b><br>' + removeButtons + '</div>' : '') +
            (addButtons ? '<div style="margin-top:5px;"><b>Add:</b><br>' + addButtons + '</div>' : '') +
            '<div style="margin-top:6px;">' +
            button('Rebuild player macro', '!lang playermacro ' + playerId) +
            button('Grant all temporarily', '!lang grant ' + playerId + ' all') +
            (session ? button('Restore temporary access', '!lang restore ' + playerId) : '') +
            button('Refresh', '!lang manage ' + playerId) +
            '</div><div style="margin-top:5px;font-size:90%;"><b>Temporary snapshot:</b> ' +
            (session ? 'active' : 'none') + '</div>');
    }

    function changePermanentLanguage(player, entry, operation) {
        var found = findLanguageSheet(entry);
        if (found.error) {
            return { error: found.error };
        }
        var sheet = found.sheet;
        var current = String(sheet.get('controlledby') || '');
        var session = state[STATE_KEY].sessions[player.id];
        var snapshot = session && session.sheets[sheet.id];
        var baseline = snapshot ? String(snapshot.controlledby || '') : current;
        var baselineControllers = baseline.split(',').map(function (id) { return id.trim(); });

        if (operation === 'add') {
            if (playerHasAccess(baseline, player.id)) {
                return { unchanged: true, message: entry.display + ' is already permanent.' };
            }
            var addedBaseline = addPlayer(baseline, player.id);
            if (snapshot) {
                snapshot.controlledby = addedBaseline;
            }
            sheet.set('controlledby', addPlayer(current, player.id));
            return { changed: true, message: entry.display + ' added permanently.' };
        }

        if (baselineControllers.indexOf('all') !== -1) {
            return { error: entry.display + ' is controlled by “all”. One player cannot be removed without changing access for everyone.' };
        }
        if (baselineControllers.indexOf(player.id) === -1) {
            return { unchanged: true, message: entry.display + ' is not a permanent language for this player.' };
        }
        var removedBaseline = removePlayer(baseline, player.id);
        if (snapshot) {
            // Keep current temporary access; restore will apply the new baseline.
            snapshot.controlledby = removedBaseline;
        } else {
            sheet.set('controlledby', removePlayer(current, player.id));
        }
        return { changed: true, message: entry.display + ' removed permanently.' };
    }

    function parseFields(content) {
        var fields = {};
        content.replace(/--([a-z]+)\|([\s\S]*?)(?=\s--[a-z]+\||$)/gi, function (all, key, value) {
            fields[key.toLowerCase()] = value.trim().replace(/^"|"$/g, '');
            return all;
        });
        return fields;
    }

    function effectPlayers(effectName) {
        return Object.keys(state[STATE_KEY].effects).filter(function (id) {
            return state[STATE_KEY].effects[id][effectName] && getObj('player', id);
        }).map(function (id) { return getObj('player', id); });
    }

    function routeTranslation(fields) {
        var resolved = resolveLanguages(fields.language);
        if (resolved.entries.length !== 1) {
            whisperGM('Translation not routed', 'The selected language was not resolved.');
            return;
        }
        var entry = resolved.entries[0];
        var found = findLanguageSheet(entry);
        if (found.error) {
            whisperGM('Translation not routed', escapeHtml(found.error));
            return;
        }
        var label = fields.mode === 'written' ? 'Inscription Reads' : 'Translation';
        var safeText = escapeHtml(fields.translation || '');
        sendChat(SCRIPT, '/w "' + entry.sheet.replace(/"/g, '') + '" **' + label + ':** "' + safeText + '"');
        var extras = effectPlayers('comprehend');
        if (fields.mode === 'spoken') {
            extras = extras.concat(effectPlayers('tongues'));
        }
        unique(extras).forEach(function (player) {
            if (!playerHasAccess(found.sheet.get('controlledby'), player.id)) {
                sendChat(SCRIPT, '/w "' + String(player.get('_displayname')).replace(/"/g, '') + '" **' + label + ':** "' + safeText + '"');
            }
        });
    }

    function whisperPlayer(player, label, text) {
        sendChat(SCRIPT, '/w "' + String(player.get('_displayname')).replace(/"/g, '') +
            '" **' + label + ':** "' + escapeHtml(text || '') + '"');
    }

    function routePlayerSpeech(message) {
        var player = getObj('player', message.playerid);
        var fields = parseFields(message.content);
        if (!player) {
            return;
        }
        var effects = state[STATE_KEY].effects[player.id] || {};
        if (fields.language === '__tongues__') {
            if (!effects.tongues) {
                whisperPlayer(player, 'Language Access Manager', 'Tongues is not active.');
                return;
            }
            var listeners = findObjs({ _type: 'player' }).filter(function (candidate) {
                return permanentLanguages(candidate).entries.length > 0;
            }).concat(effectPlayers('comprehend'), effectPlayers('tongues'));
            unique(listeners).forEach(function (listener) {
                whisperPlayer(listener, 'Character Says', fields.message);
            });
            return;
        }
        var resolved = resolveLanguages(fields.language);
        var permanent = permanentLanguages(player).entries;
        if (resolved.entries.length !== 1 || permanent.indexOf(resolved.entries[0]) === -1) {
            whisperPlayer(player, 'Language Access Manager', 'That is not one of your permanent languages.');
            return;
        }
        var entry = resolved.entries[0];
        var found = findLanguageSheet(entry);
        if (found.error) {
            whisperPlayer(player, 'Language Access Manager', found.error);
            return;
        }
        sendChat(SCRIPT, '/w "' + entry.sheet.replace(/"/g, '') + '" **Character Says:** "' +
            escapeHtml(fields.message || '') + '"');
        unique(effectPlayers('comprehend').concat(effectPlayers('tongues'))).forEach(function (listener) {
            if (!playerHasAccess(found.sheet.get('controlledby'), listener.id)) {
                whisperPlayer(listener, 'Character Says', fields.message);
            }
        });
    }

    function syncPlayerMacroIfPresent(player) {
        if (findObjs({ _type: 'macro', _playerid: player.id }).some(function (macro) {
            return macro.get('name') === 'Language-Speak';
        })) {
            rebuildPlayerMacro(player);
        }
    }

    function setNamedEffect(player, effect, enabled) {
        var effects = state[STATE_KEY].effects[player.id] || {};
        if (enabled) {
            effects[effect] = true;
            state[STATE_KEY].effects[player.id] = effects;
        } else {
            delete effects[effect];
            if (!Object.keys(effects).length) {
                delete state[STATE_KEY].effects[player.id];
            }
        }
        whisperGM((enabled ? 'Effect started: ' : 'Effect ended: ') + effect,
            escapeHtml(player.get('_displayname')) + (effect === 'tongues' ?
                ' can understand spoken languages. Written translations remain unavailable.' :
                ' can understand spoken and written languages. Speaking is not granted.'));
        if (effect === 'tongues') {
            syncPlayerMacroIfPresent(player);
        }
    }

    function playerMacroAction(entries, tonguesActive) {
        var options = entries.map(function (entry) {
            return { display: entry.display, value: entry.display };
        });
        if (tonguesActive) {
            options.push({ display: 'Tongues', value: '__tongues__' });
        }
        var languageValue;
        if (options.length === 1) {
            languageValue = options[0].value;
        } else {
            languageValue = '?{Language|' + options.map(function (option) {
                return option.display + ',' + option.value;
            }).join('|') + '}';
        }
        return '/em speaks in a foreign tongue,\n' +
            '!lang playerroute --language|' + languageValue + ' --message|?{Message}';
    }

    function rebuildPlayerMacro(player) {
        var access = permanentLanguages(player);
        if (access.errors.length) {
            whisperGM('Player macro not changed',
                '<div>Registry validation must pass before building a player macro.</div>' +
                '<div style="color:#a00;">' + access.errors.map(escapeHtml).join('<br>') + '</div>');
            return;
        }
        if (!access.entries.length) {
            whisperGM('Player macro not changed', escapeHtml(player.get('_displayname')) +
                ' has no permanent language-sheet permissions. Assign at least one language first.');
            return;
        }

        var name = 'Language-Speak';
        var owned = findObjs({ _type: 'macro', _playerid: player.id }).filter(function (macro) {
            return macro.get('name') === name;
        });
        if (owned.length > 1) {
            whisperGM('Player macro not changed', escapeHtml(player.get('_displayname')) +
                ' owns multiple macros named <code>' + name + '</code>. Resolve the duplicates first.');
            return;
        }

        var effects = state[STATE_KEY].effects[player.id] || {};
        var action = playerMacroAction(access.entries, !!effects.tongues);
        var result;
        if (owned.length === 1) {
            owned[0].set({ action: action, visibleto: '' });
            result = 'Updated';
        } else {
            var macro = createObj('macro', {
                name: name,
                action: action,
                _playerid: player.id,
                visibleto: ''
            });
            if (!macro) {
                whisperGM('Player macro not created', 'Roll20 did not create the macro for ' +
                    escapeHtml(player.get('_displayname')) + '.');
                return;
            }
            result = 'Created';
        }
        whisperGM('Player language macro',
            '<div><b>Player:</b> ' + escapeHtml(player.get('_displayname')) + '</div>' +
            '<div><b>' + result + ':</b> ' + name + '</div>' +
            '<div><b>Permanent languages:</b> ' + formatItems(access.entries.map(function (entry) {
                return entry.display;
            })) + '</div>' +
            '<div style="margin-top:5px;">The macro is owned by that player. Temporary grants are excluded.</div>');
    }

    function showStatus(player) {
        var session = state[STATE_KEY].sessions[player.id];
        var accessible = [];
        var missing = [];
        REGISTRY.forEach(function (entry) {
            var found = findLanguageSheet(entry);
            if (found.error) {
                missing.push(found.error);
            } else if (playerHasAccess(found.sheet.get('controlledby'), player.id)) {
                accessible.push(entry.display);
            }
        });
        var temporary = session ? Object.keys(session.sheets).map(function (id) {
            return session.sheets[id].display;
        }) : [];
        whisperGM('Status: ' + player.get('_displayname'),
            '<div><b>Current access:</b> ' + formatItems(accessible) + '</div>' +
            '<div><b>Sheets protected by active snapshot:</b> ' + formatItems(temporary) + '</div>' +
            (missing.length ? '<div style="color:#a00;"><b>Registry problems:</b><br>' + missing.map(escapeHtml).join('<br>') + '</div>' : ''));
    }

    function handleInput(message) {
        if (message.type !== 'api' || !/^!lang(?:\s|$)/i.test(message.content)) {
            return;
        }
        if (/^!lang\s+playerroute(?:\s|$)/i.test(message.content)) {
            routePlayerSpeech(message);
            return;
        }
        if (!playerIsGM(message.playerid)) {
            sendChat(SCRIPT, '/w "' + String((getObj('player', message.playerid) || { get: function () { return 'player'; } }).get('_displayname')).replace(/"/g, '') + '" This command is GM-only.');
            return;
        }

        var tokens = tokenise(message.content.replace(/^!lang\s*/i, ''));
        var command = normalise(tokens.shift() || 'help').replace(/^-+/, '');
        if (command === 'help') {
            showHelp();
            return;
        }
        if (command === 'list') {
            showList();
            return;
        }
        if (command === 'registry') {
            var registryAction = normalise(tokens.shift());
            if (registryAction === 'preset') {
                setRegistryPreset(normalise(tokens.shift()));
            } else if (registryAction === 'add' && tokens.length >= 2) {
                addRegistryEntry(tokens.shift(), tokens.join(' '));
            } else if (registryAction === 'remove' && tokens.length) {
                removeRegistryEntry(tokens.join(' '));
            } else if (registryAction === 'list') {
                showList();
            } else {
                whisperGM('Registry commands',
                    '<div><code>!lang registry preset standard</code></div>' +
                    '<div><code>!lang registry preset tal-tamaira</code></div>' +
                    '<div><code>!lang registry add "Display" "Exact Sheet Name"</code></div>' +
                    '<div><code>!lang registry remove "Display"</code></div>');
            }
            return;
        }
        if (command === 'setup') {
            var setupAction = normalise(tokens.shift() || 'menu');
            if (setupAction === 'menu') {
                showSetup();
            } else if (setupAction === 'validate') {
                showValidation();
            } else if (setupAction === 'create-sheets') {
                createMissingSheets(message.playerid);
            } else if (setupAction === 'grant-gm') {
                grantGmAccess(message.playerid);
            } else {
                whisperGM('Unknown setup action', 'Use <code>!lang setup</code> to open the setup menu.');
            }
            return;
        }
        if (command === 'rebuildmacros') {
            rebuildGmMacros(message.playerid);
            return;
        }
        if (command === 'route') {
            routeTranslation(parseFields(message.content));
            return;
        }
        if (command === 'comprehend' || command === 'tongues') {
            var effectTarget = resolveTarget(tokens.join(' '));
            if (effectTarget.error) {
                whisperGM('Target not resolved', effectTarget.error);
                return;
            }
            setNamedEffect(effectTarget.player, command, true);
            return;
        }
        if (command === 'end') {
            var effectName = normalise(tokens.pop());
            var endTarget = resolveTarget(tokens.join(' '));
            if (['comprehend', 'tongues'].indexOf(effectName) === -1 || endTarget.error) {
                whisperGM('Effect not ended', endTarget.error || 'Use comprehend or tongues as the effect name.');
                return;
            }
            setNamedEffect(endTarget.player, effectName, false);
            return;
        }
        if (command === 'playermacro') {
            if (!tokens.length) {
                whisperGM('Missing target', 'Provide an exact player display name or character name. Quote names containing spaces.');
                return;
            }
            var macroTarget = resolveTarget(tokens.join(' '));
            if (macroTarget.error) {
                whisperGM('Target not resolved', macroTarget.error);
                return;
            }
            rebuildPlayerMacro(macroTarget.player);
            return;
        }
        if (command === 'manage') {
            if (!tokens.length) {
                whisperGM('Missing target', 'Provide an exact player display name or character name. Quote names containing spaces.');
                return;
            }
            var manageTarget = resolveTarget(tokens.join(' '));
            if (manageTarget.error) {
                whisperGM('Target not resolved', manageTarget.error);
                return;
            }
            showManage(manageTarget.player);
            return;
        }
        if (command === 'permanent') {
            var operation = normalise(tokens.shift());
            if (['add', 'remove'].indexOf(operation) === -1 || tokens.length < 2) {
                whisperGM('Invalid permanent-language command',
                    'Use <code>!lang permanent add "Player or Character" "Language"</code> or replace <code>add</code> with <code>remove</code>.');
                return;
            }
            var permanentTarget = resolveTarget(tokens.shift());
            if (permanentTarget.error) {
                whisperGM('Target not resolved', permanentTarget.error);
                return;
            }
            var permanentLanguage = resolveLanguages(tokens.join(' '));
            if (permanentLanguage.entries.length !== 1 || permanentLanguage.unknown.length) {
                whisperGM('Language not resolved', 'Provide exactly one registered display-language or sheet name.');
                return;
            }
            var permanentResult = changePermanentLanguage(permanentTarget.player, permanentLanguage.entries[0], operation);
            whisperGM('Permanent language: ' + permanentTarget.player.get('_displayname'),
                permanentResult.error ? '<span style="color:#a00;">' + escapeHtml(permanentResult.error) + '</span>' :
                    escapeHtml(permanentResult.message) +
                    (permanentResult.changed ? '<div style="margin-top:4px;">Rebuild the player macro when assignments are complete.</div>' : ''));
            showManage(permanentTarget.player);
            return;
        }
        if (['grant', 'restore', 'status'].indexOf(command) === -1) {
            whisperGM('Unknown command', 'Use <code>!lang help</code> to see the available commands.');
            return;
        }
        if (!tokens.length) {
            whisperGM('Missing target', 'Provide an exact player display name or character name. Quote names containing spaces.');
            return;
        }

        var target = resolveTarget(tokens.shift());
        if (target.error) {
            whisperGM('Target not resolved', target.error);
            return;
        }
        if (command === 'status') {
            showStatus(target.player);
            return;
        }
        if (command === 'restore') {
            var restored = restore(target.player);
            whisperGM('Restore: ' + target.player.get('_displayname'),
                restored.none ? 'No active temporary session was found.' :
                    '<div><b>Restored:</b> ' + formatItems(restored.restored) + '</div>' +
                    (restored.errors.length ? '<div style="color:#a00;"><b>Not restored:</b><br>' + restored.errors.map(escapeHtml).join('<br>') + '</div>' : ''));
            return;
        }
        if (!tokens.length) {
            whisperGM('Missing language', 'Use a display language, comma-separated languages, or <code>all</code>.');
            return;
        }

        var resolved = resolveLanguages(tokens.join(' '));
        if (!resolved.entries.length) {
            whisperGM('No languages matched', 'Unknown: ' + formatItems(resolved.unknown) + '. Use <code>!lang list</code>.');
            return;
        }
        var result = grant(target.player, resolved.entries);
        whisperGM('Temporary grant: ' + target.player.get('_displayname'),
            '<div><b>Granted:</b> ' + formatItems(result.granted) + '</div>' +
            '<div><b>Already accessible:</b> ' + formatItems(result.already) + '</div>' +
            (resolved.unknown.length ? '<div style="color:#a00;"><b>Unknown:</b> ' + formatItems(resolved.unknown) + '</div>' : '') +
            (result.errors.length ? '<div style="color:#a00;"><b>Sheet problems:</b><br>' + result.errors.map(escapeHtml).join('<br>') + '</div>' : ''));
    }

    function registerEventHandlers() {
        on('chat:message', handleInput);
    }

    on('ready', function () {
        initialiseState();
        registerEventHandlers();
        log(SCRIPT + ' v' + VERSION + ' ready. Registry entries: ' + REGISTRY.length + '.');
    });

    return {
        version: VERSION
        // TODO: add state-backed custom registries and optional bulk player-macro rebuilding.
    };
}());
