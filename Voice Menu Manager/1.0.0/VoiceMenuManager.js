/*
 * Voice Menu Manager v1.0.0
 * Copyright (c) 2026 Kingkiller546 — MIT License
 * Last updated: 2026-10-15
 * Creates table-backed NPC and narration menus; manages Jukebox voice playback.
 * Commands: !vmm, !vmm wizard, !vmm help, !vmm settings, !vmm play KEY_OR_TABLE.
 * Configure the voice_ track prefix and optional player playback with !vmm settings.
 * Start: !vmm
 * Standalone public edition. No campaign-specific data or dependencies.
 * Commands/state are separate from other voice scripts. Install only one copy.
 */
var VoiceMenuManager = VoiceMenuManager || (function () {
    'use strict';
    const NAME = 'Voice Menu Manager';
    const VERSION = '1.0.0';
    const COMMAND = '!vmm';
    const PAGE_SIZE = 12;
    let playbackRequest = 0;

    function data() {
        if (!state.VoiceMenuManager) {
            state.VoiceMenuManager = {
                schema: 1, nextId: 1, menus: {}, drafts: {},
                settings: { prefix: 'voice_', allowPlayers: false }
            };
        }
        if (state.VoiceMenuManager.schema !== 1) throw new Error('Unsupported saved-data version. Saved data has not been changed.');
        return state.VoiceMenuManager;
    }
    const id = kind => kind + data().nextId++;
    const normal = value => String(value || '').trim().toLowerCase();
    const sorted = (a, b) => a.localeCompare(b, 'en', { sensitivity: 'base', numeric: true });
    const byName = (a, b) => sorted(a.name, b.name);
    const html = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const tell = message => sendChat(NAME, '/w gm ' + message, null, { noarchive: true });
    const note = message => tell(html(message));
    const button = (label, command, colour) => '<a style="display:inline-block;background:' + (colour || '#355b80') + ';color:#fff;padding:4px 7px;margin:2px;border-radius:3px;text-decoration:none" href="' + html(COMMAND + (command ? ' ' + command : '')) + '">' + html(label) + '</a>';
    const panel = (title, body) => tell('<div style="border:1px solid #687384;background:#fff;color:#17212d;padding:9px"><b>' + html(title) + '</b><br>' + body + '</div>');
    const row = body => '<div style="border-top:1px solid #ddd;padding-top:5px;margin-top:6px">' + body + '</div>';
    const nav = menu => button('Menu', 'menu --menu ' + menu.id) + button('Home', '');
    function label(value) {
        const result = String(value || '').trim();
        if (!result || result.length > 140 || /[|{}\r\n<>#]/.test(result) || result.indexOf('::') !== -1 || result.indexOf('[[') !== -1) {
            throw new Error('Use 1–140 characters without pipes, braces, line breaks, HTML brackets, #, [[ or ::.');
        }
        if (['cancel', 'regenerate menus'].indexOf(normal(result)) !== -1) throw new Error('Cancel and Regenerate menus are reserved menu labels.');
        return result;
    }
    function key(value) {
        const result = String(value || '').trim();
        if (!result || result.length > 200 || /[|{},&<>\[\]\r\n#@%!?]/.test(result) || result.indexOf('::') !== -1 || result.indexOf('--') === 0) {
            throw new Error('Use a track key without query/control characters, :: or a leading --.');
        }
        return result;
    }
    function macroName(value) {
        const result = String(value || '').trim();
        if (!/^[A-Za-z0-9_-]{1,80}$/.test(result)) throw new Error('Macro names use 1–80 letters, numbers, underscores or hyphens.');
        return result;
    }
    const slug = value => normal(value).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'menu';
    function unique(list, value, exceptId) {
        if (list.some(item => item.id !== exceptId && normal(item.name) === normal(value))) throw new Error('That name is already in use here.');
    }
    function getMenu(menuId, includeArchived) {
        const menu = data().menus[menuId];
        if (!menu || (menu.archived && !includeArchived)) throw new Error('This menu is missing or archived. Run !vmm to manage menus.');
        return menu;
    }
    function settlement(menu, settlementId) {
        const result = menu.settlements.find(item => item.id === settlementId);
        if (!result) throw new Error('Settlement not found in this menu.');
        return result;
    }
    function kingdom(menu, kingdomId) {
        const result = menu.kingdoms.find(item => item.id === kingdomId);
        if (!result) throw new Error('Kingdom not found in this menu.');
        return result;
    }
    function character(menu, characterId) {
        const result = menu.characters.find(item => item.id === characterId);
        if (!result) throw new Error('Character not found in this menu.');
        return result;
    }
    function sources(menu) {
        return menu.type === 'npc' ? menu.settlements : menu.categories;
    }
    function linkedSource(menu, tableId) {
        const source = sources(menu).find(item => item.tableId === tableId);
        if (!source) throw new Error('That table is not linked to this menu.');
        return source;
    }
    function requireTable(tableId) {
        const table = tableId ? getObj('rollabletable', tableId) : null;
        if (!table) throw new Error('Linked table is missing. Use the table picker to link an existing table or create a replacement.');
        return table;
    }
    const tableItems = tableId => findObjs({ _type: 'tableitem', _rollabletableid: tableId });
    function record(raw) {
        const parts = String(raw || '').split('::');
        if (parts.length !== 2 && parts.length !== 3) throw new Error('Table items use Display Name::trackkey or Character::Title::trackkey. Invalid item: ' + raw);
        return { label: label(parts.length === 3 ? parts[1] : parts[0]), key: key(parts[parts.length - 1]), player: parts.length === 3 ? label(parts[0]) : null };
    }
    function recordings(tableId) {
        requireTable(tableId);
        const seen = new Set();
        return tableItems(tableId).map(item => {
            let parsed;
            try { parsed = record(item.get('name')); }
            catch (error) { throw new Error(error.message + ' (table item ' + item.id + ')'); }
            const signature = normal(parsed.player) + '\u0000' + normal(parsed.label);
            if (seen.has(signature)) throw new Error('Duplicate recording label in this table: ' + parsed.label);
            seen.add(signature);
            return parsed;
        }).sort((a, b) => sorted(a.label, b.label));
    }
    // Literal text and child-query syntax have separate escaping rules.
    const literal = text => String(text).replace(/&/g, '&#38;').replace(/,/g, '&#44;');
    const nested = query => query.replace(/&/g, '&#38;').replace(/\|/g, '&#124;').replace(/,/g, '&#44;').replace(/}/g, '&#125;');
    function query(prompt, options, emptyLabel) {
        const choices = options.length ? options.slice() : [literal(emptyLabel || 'No entries') + ',--none'];
        choices.push('Cancel,--cancel');
        return '?{' + literal(prompt) + '|' + choices.join('|') + '}';
    }
    function leaf(prompt, entries) {
        const seen = new Set();
        entries.forEach(item => {
            if (seen.has(normal(item.label))) throw new Error('Duplicate recording title in ' + prompt + ': ' + item.label);
            seen.add(normal(item.label));
        });
        return query(prompt, entries.map(item => literal(item.label) + ',' + literal(item.key)), 'No recordings');
    }
    function matchCharacter(menu, entry) {
        const matches = [];
        menu.characters.forEach(person => {
            const aliases = Array.from(new Set([person.name].concat(person.aliases)));
            for (const alias of aliases) {
                if (entry.player && normal(entry.player) === normal(alias)) {
                    matches.push({ person, title: entry.label }); break;
                }
                if (entry.player || normal(entry.label).indexOf(normal(alias)) !== 0) continue;
                const rest = entry.label.slice(alias.length);
                const dash = rest.match(/^\s+[-–—]\s+(.+)$/);
                if (dash) { matches.push({ person, title: dash[1].trim() }); break; }
                if (/^\s*\d+\b/.test(rest)) { matches.push({ person, title: rest.trim() }); break; }
            }
        });
        return matches.length === 1 ? matches[0] : null;
    }
    function narrationCategory(menu, category) {
        const entries = recordings(category.tableId);
        if (!category.grouped) return { query: leaf(category.name, entries), count: entries.length };
        const groups = menu.characters.slice().sort(byName).map(person => ({ person, entries: [] }));
        const unassigned = [];
        entries.forEach(entry => {
            const match = matchCharacter(menu, entry);
            if (match) groups.find(group => group.person.id === match.person.id).entries.push({ label: match.title, key: entry.key });
            else unassigned.push({ label: entry.player ? entry.player + ' - ' + entry.label : entry.label, key: entry.key });
        });
        const options = groups.map(group => literal(group.person.name) + ',' + nested(leaf(group.person.name + ' ' + category.name, group.entries.sort((a, b) => sorted(a.label, b.label)))));
        if (unassigned.length) options.push('Unassigned,' + nested(leaf('Unassigned ' + category.name, unassigned)));
        return { query: query(category.name + ' Character', options, 'No characters'), count: entries.length };
    }
    function build(menu) {
        let count = 0;
        let options;
        let prompt;
        const settlementOption = place => {
            const entries = recordings(place.tableId);
            count += entries.length;
            return literal(place.name) + ',' + nested(leaf(place.name + ' NPC', entries));
        };
        if (menu.type === 'narration') {
            prompt = 'Narration';
            options = menu.categories.map(category => {
                const built = narrationCategory(menu, category);
                count += built.count;
                return literal(category.name) + ',' + nested(built.query);
            });
        } else if (menu.grouped) {
            prompt = 'Kingdom';
            options = menu.kingdoms.slice().sort(byName).map(group => literal(group.name) + ',' + nested(query(group.name + ' Settlement', menu.settlements.filter(place => place.kingdomId === group.id).sort(byName).map(settlementOption), 'No settlements')));
        } else {
            prompt = 'Settlement';
            options = menu.settlements.slice().sort(byName).map(settlementOption);
        }
        options.unshift('Regenerate menus,--regenerate');
        return { action: COMMAND + ' select --menu ' + menu.id + ' --text ' + query(prompt, options), count };
    }
    function createTable(menu, name, suffix) {
        const table = createObj('rollabletable', { name: 'vmm-' + slug(menu.name) + '-' + slug(name) + '-' + suffix, showplayers: false });
        if (!table) throw new Error('Roll20 could not create the table. Retry from the menu manager.');
        return table.id;
    }
    function macroFor(menu, playerId) {
        const existing = menu.macros[playerId] ? getObj('macro', menu.macros[playerId]) : null;
        if (existing && existing.get('_playerid') !== playerId) throw new Error('Saved macro ownership does not match. No macro was changed.');
        return existing;
    }
    function checkMacroCollision(menu, playerId) {
        const existing = macroFor(menu, playerId);
        if (!existing && findObjs({ _type: 'macro', _playerid: playerId }).some(item => item.get('name') === menu.macroName)) {
            throw new Error('A macro named ' + menu.macroName + ' already exists. Rename that macro or choose a different default macro name.');
        }
    }
    function regenerate(menu, playerId) {
        const built = build(menu); // Validate every source before updating a macro.
        const owners = Array.from(new Set(Object.keys(menu.macros).concat([playerId]))).filter(owner => playerIsGM(owner));
        owners.forEach(owner => checkMacroCollision(menu, owner));
        owners.forEach(owner => {
            let macro = macroFor(menu, owner);
            if (macro) macro.set('action', built.action);
            else {
                macro = createObj('macro', { name: menu.macroName, _playerid: owner, action: built.action, visibleto: '' });
                if (!macro) throw new Error('Could not create macro for a GM. Saved table data is retained.');
                menu.macros[owner] = macro.id;
            }
        });
        return built.count;
    }
    function refresh(menu, playerId) {
        try { regenerate(menu, playerId); }
        catch (error) { note('Changes saved, but the macro could not be rebuilt: ' + error.message); }
    }
    function page(items, requested) {
        const total = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
        const current = Math.max(0, Math.min(parseInt(requested, 10) || 0, total - 1));
        return { current, total, items: items.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE) };
    }
    function paging(view, command) {
        return (view.current ? button('Previous', command + ' --page ' + (view.current - 1)) : '') +
            (view.current + 1 < view.total ? button('Next', command + ' --page ' + (view.current + 1)) : '');
    }
    function dashboard(showArchived, requested) {
        const all = Object.values(data().menus).filter(menu => !!menu.archived === !!showArchived).sort(byName);
        const view = page(all, requested);
        let body = 'v' + VERSION + ' · Kingkiller546<br>' + button('Create a menu', 'wizard') + button('Settings', 'settings') + button('Help', 'help') + button(showArchived ? 'Active menus' : 'Archived menus', showArchived ? '' : 'archived');
        if (!all.length) body += '<p>' + (showArchived ? 'No archived menus.' : 'Create your first NPC or narration menu to begin.') + '</p>';
        view.items.forEach(menu => {
            body += row('<b>' + html(menu.name) + '</b> · ' + (menu.type === 'narration' ? 'Narration' : menu.grouped ? 'Kingdoms and settlements' : 'Settlements') + '<br>' + (showArchived ? button('Restore', 'restore --menu ' + menu.id) : button('Manage', 'menu --menu ' + menu.id) + button('Regenerate', 'regenerate --menu ' + menu.id)));
        });
        body += '<br>Page ' + (view.current + 1) + '/' + view.total + paging(view, showArchived ? 'archived' : 'home');
        panel(NAME, body);
    }
    function wizard() {
        panel('Create a voice menu', '<p>Choose a structure. You will name the menu and macro, review it, then add locations or characters.</p>' +
            button('Settlements → NPCs', 'new --type npc --mode flat') +
            button('Kingdoms → Settlements → NPCs', 'new --type npc --mode grouped') +
            button('Narration', 'new --type narration') + button('Cancel', ''));
    }
    function showMenu(menu, requested) {
        let body = '<b>Default macro:</b> ' + html(menu.macroName) + '<br>' + button('Regenerate', 'regenerate --menu ' + menu.id) + button('Check tracks', 'audit --menu ' + menu.id) + button('Rename menu', 'rename-menu --menu ' + menu.id + ' --text ?{Menu name|' + literal(menu.name) + '}') + button('Default macro name', 'macro-name --menu ' + menu.id + ' --text ?{New macro name|' + menu.macroName + '}') + button('Archive', 'archive --menu ' + menu.id) + button('Home', '');
        if (menu.type === 'narration') {
            body += '<p>Dreams and Visions use your character names or prefixes. Use Session 01, Session 02, etc. for numbered intros.</p>' + button('Add character', 'add-character --menu ' + menu.id + ' --text ?{Character name|}');
            menu.categories.forEach(category => {
                const table = getObj('rollabletable', category.tableId);
                body += row('<b>' + html(category.name) + '</b><br>' + (table ? html(table.get('name')) : '<b>Table missing</b>') + '<br>' + button('Recordings', 'records --menu ' + menu.id + ' --table ' + category.tableId) + button('Link table', 'tables --menu ' + menu.id + ' --source ' + category.id) + button('New table', 'new-table --menu ' + menu.id + ' --source ' + category.id));
            });
            menu.characters.slice().sort(byName).forEach(person => {
                body += row('<b>' + html(person.name) + '</b><br>Prefixes: ' + html(person.aliases.join('; ')) + '<br>' + button('Rename', 'rename-character --menu ' + menu.id + ' --character ' + person.id + ' --text ?{Character name|' + literal(person.name) + '}') + button('Prefixes', 'aliases --menu ' + menu.id + ' --character ' + person.id + ' --text ?{Prefixes separated by semicolons|' + literal(person.aliases.join('; ')) + '}') + button('Remove', 'remove-character --menu ' + menu.id + ' --character ' + person.id));
            });
        } else if (menu.grouped) {
            body += '<p>Add kingdoms, then open each kingdom to add its settlements.</p>' + button('Add kingdom', 'add-kingdom --menu ' + menu.id + ' --text ?{Kingdom name|}');
            const view = page(menu.kingdoms.slice().sort(byName), requested);
            view.items.forEach(group => {
                body += row('<b>' + html(group.name) + '</b> (' + menu.settlements.filter(s => s.kingdomId === group.id).length + ' settlements)<br>' + button('Open', 'kingdom --menu ' + menu.id + ' --kingdom ' + group.id) + button('Rename', 'rename-kingdom --menu ' + menu.id + ' --kingdom ' + group.id + ' --text ?{Kingdom name|' + literal(group.name) + '}') + button('Remove', 'remove-kingdom --menu ' + menu.id + ' --kingdom ' + group.id));
            });
            body += paging(view, 'menu --menu ' + menu.id);
        } else {
            body += '<p>Add settlements to create their voice tables.</p>' + settlementList(menu, null, requested);
        }
        panel(menu.name, body);
    }
    function settlementList(menu, kingdomId, requested) {
        const view = page(menu.settlements.filter(place => !menu.grouped || place.kingdomId === kingdomId).sort(byName), requested);
        let body = button('Add settlement', 'add-settlement --menu ' + menu.id + (kingdomId ? ' --kingdom ' + kingdomId : '') + ' --text ?{Settlement name|}');
        view.items.forEach(place => { body += row('<b>' + html(place.name) + '</b><br>' + button('Manage', 'settlement --menu ' + menu.id + ' --settlement ' + place.id)); });
        return body + paging(view, menu.grouped ? 'kingdom --menu ' + menu.id + ' --kingdom ' + kingdomId : 'menu --menu ' + menu.id);
    }
    function showKingdom(menu, group, requested) {
        panel(menu.name + ' / ' + group.name, settlementList(menu, group.id, requested) + nav(menu));
    }
    function showSettlement(menu, place) {
        const table = getObj('rollabletable', place.tableId);
        let body = '<b>Table:</b> ' + (table ? html(table.get('name')) : 'Missing') + '<br>' + button('Recordings', 'records --menu ' + menu.id + ' --table ' + place.tableId) + button('Rename settlement', 'rename-settlement --menu ' + menu.id + ' --settlement ' + place.id + ' --text ?{Settlement name|' + literal(place.name) + '}') + button('Link existing table', 'tables --menu ' + menu.id + ' --source ' + place.id) + button('New table', 'new-table --menu ' + menu.id + ' --source ' + place.id);
        if (menu.grouped) body += button('Move kingdom', 'move-picker --menu ' + menu.id + ' --settlement ' + place.id);
        body += button('Detach settlement', 'detach --menu ' + menu.id + ' --settlement ' + place.id) + nav(menu);
        panel(menu.name + ' / ' + place.name, body);
    }
    function showRecords(menu, tableId, requested) {
        const source = linkedSource(menu, tableId);
        const table = requireTable(tableId);
        const view = page(tableItems(tableId).sort((a, b) => sorted(a.get('name'), b.get('name'))), requested);
        let body = html(table.get('name')) + '<br><code>Display Name::trackkey</code><br>' + (source.grouped ? '<code>Character::Title::trackkey</code> also works.<br>' : '') + button('Add recording', 'add-record --menu ' + menu.id + ' --table ' + tableId) + button('Regenerate', 'regenerate --menu ' + menu.id) + nav(menu);
        view.items.forEach(item => {
            body += row(html(item.get('name')) + '<br>' + button('Edit', 'edit-record --menu ' + menu.id + ' --table ' + tableId + ' --item ' + item.id) + button('Remove', 'remove-record --menu ' + menu.id + ' --table ' + tableId + ' --item ' + item.id));
        });
        body += '<br>Page ' + (view.current + 1) + '/' + view.total + paging(view, 'records --menu ' + menu.id + ' --table ' + tableId);
        panel(menu.name + ' / ' + source.name, body);
    }
    function sourceById(menu, sourceId) {
        const source = sources(menu).find(item => item.id === sourceId);
        if (!source) throw new Error('Menu source not found.');
        return source;
    }
    function tablePicker(menu, source, requested) {
        const view = page(findObjs({ _type: 'rollabletable' }).sort((a, b) => sorted(a.get('name'), b.get('name'))), requested);
        let body = '<p>Choose a table for ' + html(source.name) + '. Linking retains both tables and does not merge their entries.</p>';
        view.items.forEach(table => { body += row(html(table.get('name')) + '<br>' + button('Choose', 'bind --menu ' + menu.id + ' --source ' + source.id + ' --table ' + table.id)); });
        body += paging(view, 'tables --menu ' + menu.id + ' --source ' + source.id) + nav(menu);
        panel('Link a voice table', body);
    }
    function confirm(title, description, command, back) {
        panel(title, '<p>' + html(description) + '</p>' + button('Confirm', command + ' --confirm yes', '#8b3434') + button('Cancel', back));
    }
    function startDraft(playerId, type, fields, context) {
        const draft = { id: id('d'), type, fields, context: context || {}, values: {}, step: 0 };
        data().drafts[playerId] = draft;
        showDraft(playerId);
    }
    function draftFor(playerId, token) {
        const draft = data().drafts[playerId];
        if (!draft || draft.id !== token) throw new Error('That wizard is no longer active for you. Run !vmm and start again.');
        return draft;
    }
    function showDraft(playerId) {
        const draft = data().drafts[playerId];
        if (!draft) return wizard();
        let body = '';
        if (draft.step < draft.fields.length) {
            const field = draft.fields[draft.step];
            const fallback = draft.values[field.name] || field.default || (field.name === 'macroName' ? slug(draft.values.name) + '-voices' : '');
            body += 'Step ' + (draft.step + 1) + ' of ' + draft.fields.length + ': ' + html(field.title) + '<br>' + button('Enter ' + field.title, 'answer --token ' + draft.id + ' --text ?{' + literal(field.title) + '|' + literal(fallback) + '}');
        } else {
            body += '<p>Review before creating or changing anything:</p>';
            draft.fields.forEach(field => { body += '<b>' + html(field.title) + ':</b> ' + html(draft.values[field.name] || '(none)') + '<br>'; });
            if (draft.type === 'menu') body += '<b>Structure:</b> ' + (draft.context.type === 'narration' ? 'Narration' : draft.context.grouped ? 'Kingdoms → Settlements → NPCs' : 'Settlements → NPCs') + '<br>';
            body += button('Save', 'commit --token ' + draft.id, '#3c764b');
        }
        body += button('Cancel setup', 'cancel-draft --token ' + draft.id);
        panel('Voice menu setup', body);
    }
    function answerDraft(playerId, token, text) {
        const draft = draftFor(playerId, token);
        const field = draft.fields[draft.step];
        if (!field) throw new Error('This wizard is already ready to save.');
        const value = field.kind === 'macro' ? macroName(text) : field.kind === 'key' ? key(text) : field.kind === 'optional-label' && !String(text || '').trim() ? '' : label(text);
        draft.values[field.name] = value;
        draft.step += 1;
        showDraft(playerId);
    }
    function commitDraft(playerId, token) {
        const draft = draftFor(playerId, token);
        if (draft.step !== draft.fields.length) throw new Error('Finish the wizard fields first.');
        if (draft.type === 'menu') {
            const value = draft.values;
            const active = Object.values(data().menus).filter(menu => !menu.archived);
            unique(active, value.name);
            const menu = { id: id('m'), name: value.name, macroName: value.macroName, type: draft.context.type, grouped: !!draft.context.grouped, kingdoms: [], settlements: [], characters: [], categories: [], macros: {}, archived: false };
            checkMacroCollision(menu, playerId);
            data().menus[menu.id] = menu;
            if (menu.type === 'narration') {
                menu.categories = [['Session Intros', false], ['Scenes', false], ['Dreams', true], ['Visions', true]].map(pair => ({ id: id('c'), name: pair[0], grouped: pair[1], tableId: null }));
                // Keep all four source records recoverable if Roll20 rejects a create.
                menu.categories.forEach(category => {
                    try { category.tableId = createTable(menu, category.name, category.id); }
                    catch (error) { note(error.message + ' Use New table on the affected category to retry.'); }
                });
            }
            delete data().drafts[playerId];
            refresh(menu, playerId);
            showMenu(menu);
        } else if (draft.type === 'record') {
            const menu = getMenu(draft.context.menuId);
            linkedSource(menu, draft.context.tableId);
            requireTable(draft.context.tableId);
            const values = draft.values;
            const text = (values.player ? values.player + '::' : '') + values.title + '::' + values.key;
            const parsed = record(text);
            const existing = tableItems(draft.context.tableId).find(item => item.id !== draft.context.itemId && normal(item.get('name').split('::').slice(0, -1).join('::')) === normal(text.split('::').slice(0, -1).join('::')));
            if (existing) throw new Error('An entry with that label already exists in this table.');
            if (draft.context.itemId) {
                const item = getObj('tableitem', draft.context.itemId);
                if (!item || item.get('_rollabletableid') !== draft.context.tableId) throw new Error('Recording no longer exists in this table.');
                item.set('name', text);
            } else if (!createObj('tableitem', { _rollabletableid: draft.context.tableId, name: text, weight: 1 })) throw new Error('Could not create the table item.');
            delete data().drafts[playerId];
            note('Recording saved. Regenerate the menu when ready. Track key: ' + parsed.key);
            showRecords(menu, draft.context.tableId);
        }
    }
    function recordDraft(playerId, menu, tableId, itemId) {
        const source = linkedSource(menu, tableId);
        requireTable(tableId);
        let previous = null;
        if (itemId) {
            const item = getObj('tableitem', itemId);
            if (!item || item.get('_rollabletableid') !== tableId) throw new Error('Recording not found in the selected table.');
            previous = record(item.get('name'));
        }
        const fields = [];
        if (source.grouped) fields.push({ name: 'player', title: 'Character (blank for prefix format)', kind: 'optional-label', default: previous && previous.player || '' });
        fields.push({ name: 'title', title: 'Recording display name', default: previous && previous.label || '' });
        fields.push({ name: 'key', title: 'Track key or full prefixed title', kind: 'key', default: previous && previous.key || '' });
        startDraft(playerId, 'record', fields, { menuId: menu.id, tableId, itemId });
    }
    function settings() {
        const saved = data().settings;
        panel('Voice settings', '<b>Track prefix:</b> ' + html(saved.prefix) + '<br>' + button('Change prefix', 'prefix --text ?{Track prefix|' + saved.prefix + '}') + '<p>Tracks starting with this prefix stop one another. Other Jukebox audio is left alone.</p>' + '<b>Player playback:</b> ' + (saved.allowPlayers ? 'Allowed' : 'GM only') + '<br>' + button(saved.allowPlayers ? 'Restrict to GMs' : 'Allow players', 'player-access --value ' + (saved.allowPlayers ? 'no' : 'yes')) + button('Home', ''));
    }
    function audit(menu) {
        const titles = findObjs({ _type: 'jukeboxtrack' }).map(track => normal(track.get('title')));
        const problems = [];
        try { build(menu); } catch (error) { problems.push('Menu validation: ' + error.message); }
        sources(menu).forEach(source => {
            try {
                recordings(source.tableId).forEach(item => {
                    const title = trackTitle(item.key);
                    const count = titles.filter(found => found === title).length;
                    if (!count) problems.push(source.name + ': missing ' + title);
                    if (count > 1) problems.push(source.name + ': duplicate track title ' + title);
                });
            } catch (error) { problems.push(source.name + ': ' + error.message); }
        });
        if (!problems.length) return note(menu.name + ': all recording keys match unique Jukebox tracks.');
        note(menu.name + ': ' + problems.length + ' issue(s).');
        for (let start = 0; start < problems.length; start += 12) tell(problems.slice(start, start + 12).map(html).join('<br>'));
    }
    function trackTitle(input) {
        const prefix = normal(data().settings.prefix);
        const value = normal(input);
        return value.indexOf(prefix) === 0 ? value : prefix + value;
    }
    function play(input, allowTable) {
        let inputKey = String(input || '').trim();
        if (allowTable) {
            const tables = findObjs({ _type: 'rollabletable' }).filter(table => normal(table.get('name')) === normal(input));
            if (tables.length > 1) throw new Error('Multiple tables have that name. Give them unique names for weighted playback.');
            if (tables.length) {
                const items = tableItems(tables[0].id).map(item => ({ item, weight: Math.max(0, parseInt(item.get('weight'), 10) || 0) }));
                const total = items.reduce((sum, item) => sum + item.weight, 0);
                if (!total) throw new Error('That table has no items with a positive weight.');
                let target = randomInteger(total);
                const choice = items.find(item => { target -= item.weight; return target <= 0; });
                const text = String(choice.item.get('name') || '').trim();
                inputKey = text.indexOf('::') === -1 ? key(text) : record(text).key;
            }
        }
        const title = trackTitle(key(inputKey));
        const tracks = findObjs({ _type: 'jukeboxtrack' });
        const matches = tracks.filter(track => normal(track.get('title')) === title);
        if (matches.length !== 1) throw new Error(matches.length ? 'Duplicate Jukebox track title: ' + title : 'No Jukebox track named: ' + title);
        const chosen = matches[0];
        const request = ++playbackRequest;
        tracks.forEach(track => {
            if (track.id !== chosen.id && normal(track.get('title')).indexOf(normal(data().settings.prefix)) === 0) track.set({ playing: false, softstop: false, loop: false });
        });
        setTimeout(function () {
            if (request !== playbackRequest) return;
            const live = getObj('jukeboxtrack', chosen.id);
            if (!live) return note('The selected Jukebox track was removed before playback.');
            try { live.set({ playing: true, softstop: false, loop: false }); note('Playing ' + title); }
            catch (error) { note('Playback failed: ' + error.message); }
        }, 100);
    }
    function help() {
        panel(NAME + ' help', '<p>Run <b>!vmm</b> and choose Create a menu. Add kingdoms and settlements through chat; their empty voice tables are created automatically. Narration creates Session Intros, Scenes, Dreams and Visions tables.</p>' +
            '<p>Table entries: <code>Display Name::trackkey</code>. Grouped narration can use <code>Character::Title::trackkey</code> or prefixes such as <code>Character 01::trackkey</code> and <code>Character - Title::trackkey</code>.</p>' +
            '<p>Use Recordings to add/edit entries, or use any table editor. Regenerate afterwards. Menus sort naturally, and Cancel stays last.</p>' +
            '<p><b>!vmm play key</b> plays a track; <b>!vmm play TableName</b> rolls a weighted table first. The default prefix is voice_. The script does not create or upload audio.</p>' +
            '<p>Table links use IDs, so renaming tables is safe. Generated macros use IDs too. Missing tables can be relinked from Manage. Detaching a settlement retains its table. Archived menus can be restored.</p>' + button('Create a menu', 'wizard') + button('Home', ''));
    }
    // All free text is the final --text argument, never parsed as command flags.
    function parse(content) {
        const marker = content.match(/ --text(?: |$)/);
        const tail = marker ? marker.index : -1;
        const head = tail === -1 ? content : content.slice(0, tail);
        const parts = head.trim().split(/\s+/);
        const result = { action: parts[1] || 'home', text: tail === -1 ? undefined : content.slice(tail + marker[0].length), flags: {} };
        for (let index = 2; index < parts.length; index += 2) {
            if (!/^--[a-z-]+$/.test(parts[index]) || parts[index + 1] === undefined || parts[index + 1].indexOf('--') === 0) throw new Error('Invalid command arguments. Use !vmm and its buttons.');
            if (Object.prototype.hasOwnProperty.call(result.flags, parts[index].slice(2))) throw new Error('Duplicate command argument.');
            result.flags[parts[index].slice(2)] = parts[index + 1];
        }
        return result;
    }
    function handle(msg) {
        if (msg.type !== 'api' || !/^!vmm(?:\s|$)/.test(msg.content)) return;
        const gm = playerIsGM(msg.playerid);
        try {
            data();
            if (/^!vmm\s+play\s+/.test(msg.content)) {
                if (!gm && !data().settings.allowPlayers) return;
                return play(msg.content.replace(/^!vmm\s+play\s+/, '').trim(), true);
            }
            const request = parse(msg.content);
            const f = request.flags;
            if (request.action === 'select') {
                if (!gm && !data().settings.allowPlayers) return;
                const menu = getMenu(f.menu);
                if (request.text === '--cancel' || request.text === '--none') return;
                if (request.text === '--regenerate') {
                    if (!gm) return;
                    const count = regenerate(menu, msg.playerid);
                    return note('Regenerated ' + menu.name + ': ' + count + ' recordings. Run the macro again.');
                }
                return play(request.text, false);
            }
            if (!gm) return;
            const menu = f.menu ? getMenu(f.menu, request.action === 'restore') : null;
            const text = request.text;
            switch (request.action) {
            case 'home': return dashboard(false, f.page);
            case 'archived': return dashboard(true, f.page);
            case 'wizard': return wizard();
            case 'help': return help();
            case 'settings': return settings();
            case 'new':
                if (f.type !== 'npc' && f.type !== 'narration') throw new Error('Choose NPC or narration from the wizard.');
                if (f.type === 'npc' && f.mode !== 'flat' && f.mode !== 'grouped') throw new Error('Choose a settlement or kingdom structure.');
                return startDraft(msg.playerid, 'menu', [{ name: 'name', title: 'Menu name' }, { name: 'macroName', title: 'Macro name', kind: 'macro' }], { type: f.type, grouped: f.mode === 'grouped' });
            case 'answer': return answerDraft(msg.playerid, f.token, text);
            case 'commit': return commitDraft(msg.playerid, f.token);
            case 'cancel-draft': draftFor(msg.playerid, f.token); delete data().drafts[msg.playerid]; return dashboard();
            case 'menu': return showMenu(menu, f.page);
            case 'regenerate': note('Regenerated ' + menu.name + ': ' + regenerate(menu, msg.playerid) + ' recordings.'); return showMenu(menu);
            case 'rename-menu': {
                const name = label(text); unique(Object.values(data().menus).filter(m => !m.archived), name, menu.id); menu.name = name; return showMenu(menu);
            }
            case 'macro-name': menu.macroName = macroName(text); note('Default macro name saved. Existing generated macro names are retained; rename them in Collections if desired.'); return showMenu(menu);
            case 'archive':
                if (f.confirm !== 'yes') return confirm('Archive menu', 'The menu will be hidden and its generated macros disabled. Its tables, recordings and macro objects are retained. You can restore it later.', 'archive --menu ' + menu.id, 'menu --menu ' + menu.id);
                menu.archived = true; return dashboard();
            case 'restore': unique(Object.values(data().menus).filter(m => !m.archived), menu.name, menu.id); menu.archived = false; refresh(menu, msg.playerid); return showMenu(menu);
            case 'add-kingdom': {
                if (menu.type !== 'npc' || !menu.grouped) throw new Error('This menu does not use kingdoms.');
                const name = label(text); unique(menu.kingdoms, name); menu.kingdoms.push({ id: id('k'), name }); refresh(menu, msg.playerid); return showMenu(menu);
            }
            case 'kingdom': return showKingdom(menu, kingdom(menu, f.kingdom), f.page);
            case 'rename-kingdom': { const group = kingdom(menu, f.kingdom); const name = label(text); unique(menu.kingdoms, name, group.id); group.name = name; refresh(menu, msg.playerid); return showMenu(menu); }
            case 'remove-kingdom': {
                const group = kingdom(menu, f.kingdom);
                if (menu.settlements.some(place => place.kingdomId === group.id)) throw new Error('Move or detach this kingdom’s settlements before removing it.');
                if (f.confirm !== 'yes') return confirm('Remove kingdom', 'Remove ' + group.name + ' from the menu?', 'remove-kingdom --menu ' + menu.id + ' --kingdom ' + group.id, 'menu --menu ' + menu.id);
                menu.kingdoms = menu.kingdoms.filter(item => item.id !== group.id); refresh(menu, msg.playerid); return showMenu(menu);
            }
            case 'add-settlement': {
                if (menu.type !== 'npc') throw new Error('Only NPC menus use settlements.');
                if (menu.grouped) kingdom(menu, f.kingdom);
                const name = label(text); unique(menu.settlements.filter(place => !menu.grouped || place.kingdomId === f.kingdom), name);
                const place = { id: id('s'), name, kingdomId: menu.grouped ? f.kingdom : null, tableId: null };
                place.tableId = createTable(menu, name, place.id); menu.settlements.push(place); refresh(menu, msg.playerid); return showSettlement(menu, place);
            }
            case 'settlement': return showSettlement(menu, settlement(menu, f.settlement));
            case 'rename-settlement': { const place = settlement(menu, f.settlement); const name = label(text); unique(menu.settlements.filter(s => s.kingdomId === place.kingdomId), name, place.id); place.name = name; refresh(menu, msg.playerid); return showSettlement(menu, place); }
            case 'move-picker': {
                const place = settlement(menu, f.settlement);
                if (!menu.grouped) throw new Error('This menu does not use kingdoms.');
                let body = '';
                menu.kingdoms.slice().sort(byName).forEach(group => { body += button(group.name, 'move --menu ' + menu.id + ' --settlement ' + place.id + ' --kingdom ' + group.id); });
                return panel('Move ' + place.name + ' to kingdom', body + nav(menu));
            }
            case 'move': { const place = settlement(menu, f.settlement); kingdom(menu, f.kingdom); unique(menu.settlements.filter(s => s.kingdomId === f.kingdom), place.name, place.id); place.kingdomId = f.kingdom; refresh(menu, msg.playerid); return showSettlement(menu, place); }
            case 'detach': {
                const place = settlement(menu, f.settlement);
                if (f.confirm !== 'yes') return confirm('Detach settlement', 'Remove ' + place.name + ' from this menu? Its table and recordings will be retained.', 'detach --menu ' + menu.id + ' --settlement ' + place.id, 'settlement --menu ' + menu.id + ' --settlement ' + place.id);
                menu.settlements = menu.settlements.filter(s => s.id !== place.id); refresh(menu, msg.playerid); return showMenu(menu);
            }
            case 'tables': return tablePicker(menu, sourceById(menu, f.source), f.page);
            case 'bind': {
                const source = sourceById(menu, f.source); const table = requireTable(f.table);
                if (f.confirm !== 'yes') return confirm('Link table', 'Link ' + source.name + ' to ' + table.get('name') + '? The previous table and all of its entries will be retained. No data is merged.', 'bind --menu ' + menu.id + ' --source ' + source.id + ' --table ' + table.id, 'menu --menu ' + menu.id);
                source.tableId = table.id; refresh(menu, msg.playerid); return showMenu(menu);
            }
            case 'new-table': {
                const source = sourceById(menu, f.source);
                if (f.confirm !== 'yes') return confirm('Create replacement table', 'Create and link a new empty table for ' + source.name + '? Any previous table and its entries will remain unchanged.', 'new-table --menu ' + menu.id + ' --source ' + source.id, 'menu --menu ' + menu.id);
                source.tableId = createTable(menu, source.name, id('t')); refresh(menu, msg.playerid); return showMenu(menu);
            }
            case 'records': return showRecords(menu, f.table, f.page);
            case 'add-record': return recordDraft(msg.playerid, menu, f.table);
            case 'edit-record': return recordDraft(msg.playerid, menu, f.table, f.item);
            case 'remove-record': {
                linkedSource(menu, f.table); const item = getObj('tableitem', f.item);
                if (!item || item.get('_rollabletableid') !== f.table) throw new Error('Recording not found in this table.');
                if (f.confirm !== 'yes') return confirm('Remove recording entry', 'Delete this table item? This does not delete the Jukebox audio. ' + item.get('name'), 'remove-record --menu ' + menu.id + ' --table ' + f.table + ' --item ' + f.item, 'records --menu ' + menu.id + ' --table ' + f.table);
                item.remove(); note('Table item removed. Regenerate when ready.'); return showRecords(menu, f.table);
            }
            case 'add-character': {
                if (menu.type !== 'narration') throw new Error('This menu is not a narration menu.');
                const name = label(text); if (normal(name) === 'unassigned') throw new Error('Unassigned is reserved for unmatched recordings.'); unique(menu.characters, name);
                menu.characters.push({ id: id('p'), name, aliases: Array.from(new Set([name, name.split(/\s+/)[0].replace(/[,;:]+$/g, '')])) }); refresh(menu, msg.playerid); return showMenu(menu);
            }
            case 'rename-character': {
                const person = character(menu, f.character); const name = label(text); if (normal(name) === 'unassigned') throw new Error('Unassigned is reserved for unmatched recordings.'); unique(menu.characters, name, person.id);
                person.aliases = Array.from(new Set(person.aliases.concat([person.name, name]))); person.name = name; refresh(menu, msg.playerid); return showMenu(menu);
            }
            case 'aliases': {
                const person = character(menu, f.character);
                person.aliases = String(text || '').split(';').map(s => s.trim()).filter(Boolean).map(label);
                refresh(menu, msg.playerid); return showMenu(menu);
            }
            case 'remove-character': {
                const person = character(menu, f.character);
                if (f.confirm !== 'yes') return confirm('Remove character', 'Remove ' + person.name + ' from the menus? Recordings are retained and become Unassigned unless another character matches their prefix.', 'remove-character --menu ' + menu.id + ' --character ' + person.id, 'menu --menu ' + menu.id);
                menu.characters = menu.characters.filter(c => c.id !== person.id); refresh(menu, msg.playerid); return showMenu(menu);
            }
            case 'audit': return audit(menu);
            case 'prefix': {
                const prefix = String(text || f.value || '').trim();
                if (!/^[A-Za-z][A-Za-z0-9_-]{0,31}$/.test(prefix)) throw new Error('Use a non-empty prefix of up to 32 letters, numbers, underscores or hyphens, starting with a letter.');
                if (f.confirm !== 'yes') return confirm('Change track prefix', 'Set the voice prefix to ' + prefix + '? Existing track titles and table keys will not be renamed. Playback will stop other tracks with the new prefix.', 'prefix --value ' + prefix, 'settings');
                playbackRequest += 1; data().settings.prefix = prefix; return settings();
            }
            case 'player-access':
                if (f.value !== 'yes' && f.value !== 'no') throw new Error('Choose a player-access setting from Settings.');
                data().settings.allowPlayers = f.value === 'yes'; return settings();
            default: throw new Error('Unknown command. Run !vmm for the setup wizard and menu manager.');
            }
        } catch (error) { note(error.message); }
    }
    on('ready', function () {
        try { data(); on('chat:message', handle); log(NAME + ' v' + VERSION + ' by Kingkiller546 ready. Run !vmm.'); }
        catch (error) { log(NAME + ': ' + error.message); }
    });
    return {};
}());
