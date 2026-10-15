/* Tests for the Roll20 Mod Script, using Node.js built-ins only. */
'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const SCRIPT = fs.readFileSync(path.join(__dirname, '..', 'VoiceMenuManager.js'), 'utf8');

function sandbox(initialState) {
    let next = 1, failCreate = null;
    const objects = [], events = {}, messages = [], timers = [], logs = [];
    const state = initialState || {};
    function create(type, values) {
        if (failCreate === type) { failCreate = null; return null; }
        const item = {
            id: '-object' + next++, values: { _type: type, ...values },
            get(key) { return this.values[key]; },
            set(key, value) { if (typeof key === 'string') this.values[key] = value; else Object.assign(this.values, key); },
            remove() { objects.splice(objects.indexOf(this), 1); }
        };
        objects.push(item);
        return item;
    }
    const context = vm.createContext({
        state, on: (event, callback) => { (events[event] ||= []).push(callback); },
        log: value => logs.push(value),
        sendChat: (name, content) => messages.push(content),
        findObjs: query => objects.filter(item => Object.keys(query).every(key => item.get(key) === query[key])),
        getObj: (type, id) => objects.find(item => item.get('_type') === type && item.id === id),
        createObj: create, playerIsGM: playerId => ['gm', 'gm2'].includes(playerId),
        randomInteger: max => max, setTimeout: callback => timers.push(callback)
    });
    const load = () => vm.runInContext(SCRIPT, context);
    load();
    events.ready.forEach(callback => callback());
    function run(command, playerId = 'gm') {
        const before = messages.length;
        for (const callback of events['chat:message'] || []) callback({ type: 'api', content: command, playerid: playerId });
        return messages.slice(before).join('\n');
    }
    function finishDraft(values, playerId = 'gm') {
        const token = state.VoiceMenuManager.drafts[playerId].id;
        for (const text of values) run('!vmm answer --token ' + token + ' --text ' + text, playerId);
        assert.equal(state.VoiceMenuManager.drafts[playerId].step, values.length);
        run('!vmm commit --token ' + token, playerId);
        return token;
    }
    function newMenu(name, type = 'npc', grouped = false, playerId = 'gm') {
        const previous = Object.keys(state.VoiceMenuManager.menus);
        run('!vmm new --type ' + type + (type === 'npc' ? ' --mode ' + (grouped ? 'grouped' : 'flat') : ''), playerId);
        finishDraft([name, name.replace(/[^A-Za-z0-9]+/g, '-') + '-Voices'], playerId);
        const menu = Object.values(state.VoiceMenuManager.menus).find(item => !previous.includes(item.id));
        assert(menu, messages.slice(-3).join('\n'));
        return menu;
    }
    const macro = (menu, owner = 'gm') => objects.find(item => item.id === menu.macros[owner]);
    const root = (menu, owner = 'gm') => macro(menu, owner).get('action').split(' --text ')[1];
    const addPlace = (menu, name, kingdomId) => {
        run('!vmm add-settlement --menu ' + menu.id + (kingdomId ? ' --kingdom ' + kingdomId : '') + ' --text ' + name);
        return menu.settlements.find(item => item.name === name);
    };
    const addEntry = (tableId, name, weight = 1) => create('tableitem', { _rollabletableid: tableId, name, weight });
    const flush = () => { while (timers.length) timers.shift()(); };
    return { state, objects, messages, events, logs, run, finishDraft, newMenu, macro, root, addPlace, addEntry, create, flush, load, failNext: type => { failCreate = type; } };
}
// Resolve nested generated queries exactly one entity layer at a time.
const decode = text => text.replace(/&#(35|38|44|124|125);/g, (_, code) => String.fromCharCode(+code));
function options(query) {
    assert(query.startsWith('?{') && query.endsWith('}'), query);
    return query.slice(query.indexOf('|') + 1, -1).split('|').map(option => {
        const at = option.indexOf(',');
        assert(at >= 0, option);
        return { label: decode(option.slice(0, at)), value: decode(option.slice(at + 1)) };
    });
}
function choose(query, label) {
    const found = options(query).find(option => option.label === label);
    assert(found, label + ' missing from ' + query);
    return found.value;
}
function verifyCancel(query) {
    const choices = options(query);
    assert(choices.length >= 2);
    assert.equal(choices.at(-1).label, 'Cancel');
    assert.equal(choices.at(-1).value, '--cancel');
    for (const choice of choices) if (choice.value.startsWith('?{')) verifyCancel(choice.value);
}
function links(markup) {
    return [...markup.matchAll(/href="([^"]+)"/g)].map(match => match[1].replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'));
}

 test('fresh install and cancelled wizard create no tables or macros; duplicate install is inert', () => {
    const s = sandbox();
    assert.equal(s.objects.length, 0);
    assert.match(s.run('!vmm'), /Create a menu/);
    s.run('!vmm new --type npc --mode grouped');
    const token = s.state.VoiceMenuManager.drafts.gm.id;
    s.run('!vmm answer --token ' + token + ' --text North Coast');
    s.run('!vmm cancel-draft --token ' + token);
    assert.equal(s.objects.length, 0);
    s.load();
    assert.equal(s.events.ready.length, 1);
    assert.equal(s.events['chat:message'].length, 1);
 });
 test('flat wizard, records wizard and single/empty menus work; Cancel remains last', () => {
    const s = sandbox(); const menu = s.newMenu('Coast');
    const place = s.addPlace(menu, 'Harbour');
    const table = s.objects.find(item => item.id === place.tableId);
    assert.equal(table.get('showplayers'), false);
    s.run('!vmm add-record --menu ' + menu.id + ' --table ' + place.tableId);
    s.finishDraft(['Captain Vale', 'voice_captainvale']);
    s.run('!vmm regenerate --menu ' + menu.id);
    const list = choose(s.root(menu), 'Harbour');
    assert.equal(choose(list, 'Captain Vale'), 'voice_captainvale');
    assert.equal(options(list).length, 2);
    verifyCancel(s.root(menu));
    s.addPlace(menu, 'Empty Town'); verifyCancel(s.root(menu));
    assert.equal(choose(choose(s.root(menu), 'Empty Town'), 'No recordings'), '--none');
 });
 test('grouped menus sort naturally and correctly escape commas, ampersands and apostrophes', () => {
    const s = sandbox(), menu = s.newMenu('Northern Isles', 'npc', true);
    s.run('!vmm add-kingdom --menu ' + menu.id + ' --text Realm 10');
    s.run('!vmm add-kingdom --menu ' + menu.id + ' --text Realm 2');
    const group = menu.kingdoms.find(k => k.name === 'Realm 2');
    const place = s.addPlace(menu, "King's Harbour, East & West", group.id);
    s.addEntry(place.tableId, "Smith, Rowan & Sons::smith");
    s.run('!vmm regenerate --menu ' + menu.id);
    assert.deepEqual(options(s.root(menu)).map(o => o.label), ['Regenerate menus', 'Realm 2', 'Realm 10', 'Cancel']);
    const entries = choose(choose(s.root(menu), 'Realm 2'), "King's Harbour, East & West");
    assert.equal(choose(entries, 'Smith, Rowan & Sons'), 'smith');
    verifyCancel(s.root(menu));
 });
 test('rename/move/detach and archive/restore retain table IDs and data', () => {
    const s = sandbox(), menu = s.newMenu('Empire', 'npc', true);
    s.run('!vmm add-kingdom --menu ' + menu.id + ' --text South');
    s.run('!vmm add-kingdom --menu ' + menu.id + ' --text North');
    const place = s.addPlace(menu, 'Market', menu.kingdoms[0].id);
    const entry = s.addEntry(place.tableId, 'Merchant::merchant'); const tableId = place.tableId;
    const table = s.objects.find(item => item.id === tableId); table.set('name', 'Any renamed table');
    s.run('!vmm rename-settlement --menu ' + menu.id + ' --settlement ' + place.id + ' --text New Market');
    s.run('!vmm move --menu ' + menu.id + ' --settlement ' + place.id + ' --kingdom ' + menu.kingdoms[1].id);
    assert.equal(place.tableId, tableId);
    assert.equal(choose(choose(choose(s.root(menu), 'North'), 'New Market'), 'Merchant'), 'merchant');
    const macro = s.macro(menu); macro.set('name', 'CustomName'); const macroId = macro.id;
    s.run('!vmm regenerate --menu ' + menu.id); assert.equal(s.macro(menu).id, macroId); assert.equal(macro.get('name'), 'CustomName');
    s.run('!vmm archive --menu ' + menu.id); assert.equal(menu.archived, false);
    s.run('!vmm archive --menu ' + menu.id + ' --confirm yes'); assert.equal(menu.archived, true);
    assert.match(s.run('!vmm select --menu ' + menu.id + ' --text merchant'), /archived/);
    s.run('!vmm restore --menu ' + menu.id); assert.equal(menu.archived, false);
    s.run('!vmm detach --menu ' + menu.id + ' --settlement ' + place.id + ' --confirm yes');
    assert.equal(menu.settlements.length, 0); assert(s.objects.includes(table)); assert(s.objects.includes(entry));
 });
 test('table picker binds by ID and preserves previously linked tables; missing tables recover', () => {
    const s = sandbox(), menu = s.newMenu('Coast'), place = s.addPlace(menu, 'Port');
    const old = s.objects.find(item => item.id === place.tableId);
    const replacement = s.create('rollabletable', { name: 'Existing table', showplayers: true });
    s.addEntry(replacement.id, 'Sailor::sailor');
    s.run('!vmm bind --menu ' + menu.id + ' --source ' + place.id + ' --table ' + replacement.id + ' --confirm yes');
    assert.equal(place.tableId, replacement.id); assert(s.objects.includes(old));
    replacement.remove();
    const before = s.macro(menu).get('action');
    assert.match(s.run('!vmm regenerate --menu ' + menu.id), /missing/); assert.equal(s.macro(menu).get('action'), before);
    s.run('!vmm new-table --menu ' + menu.id + ' --source ' + place.id + ' --confirm yes');
    assert.notEqual(place.tableId, replacement.id); verifyCancel(s.root(menu));
 });
 test('narration has generic tables, configurable characters, numbered/prefixed/structured entries', () => {
    const s = sandbox(), menu = s.newMenu('Narration', 'narration');
    assert.equal(menu.categories.length, 4); assert.equal(menu.characters.length, 0);
    s.run('!vmm add-character --menu ' + menu.id + ' --text Rowan, Keeper of the Gate');
    s.run('!vmm add-character --menu ' + menu.id + ' --text Morgan Reed');
    const dreams = menu.categories.find(c => c.name === 'Dreams');
    const visions = menu.categories.find(c => c.name === 'Visions');
    s.addEntry(dreams.tableId, 'Rowan 02::r02'); s.addEntry(dreams.tableId, 'Rowan 01::r01');
    s.addEntry(dreams.tableId, 'Morgan Reed::A Warning::mwarning');
    s.addEntry(visions.tableId, 'Morgan - The Tower::tower');
    s.addEntry(dreams.tableId, 'Unknown - Lost::lost');
    s.run('!vmm regenerate --menu ' + menu.id);
    const root = s.root(menu);
    const rowan = choose(choose(root, 'Dreams'), 'Rowan, Keeper of the Gate');
    assert.deepEqual(options(rowan).map(o => o.label), ['01', '02', 'Cancel']);
    assert.equal(choose(choose(choose(root, 'Dreams'), 'Morgan Reed'), 'A Warning'), 'mwarning');
    assert.equal(choose(choose(choose(root, 'Visions'), 'Morgan Reed'), 'The Tower'), 'tower');
    assert.equal(choose(choose(choose(root, 'Dreams'), 'Unassigned'), 'Unknown - Lost'), 'lost');
    verifyCancel(root);
    const person = menu.characters[0];
    s.run('!vmm rename-character --menu ' + menu.id + ' --character ' + person.id + ' --text Rowan Newname');
    assert.equal(choose(choose(choose(s.root(menu), 'Dreams'), 'Rowan Newname'), '01'), 'r01');
 });
 test('ambiguous short character prefixes become Unassigned instead of silently choosing someone', () => {
    const s = sandbox(), menu = s.newMenu('Narration', 'narration');
    s.run('!vmm add-character --menu ' + menu.id + ' --text Rowan North');
    s.run('!vmm add-character --menu ' + menu.id + ' --text Rowan South');
    const source = menu.categories.find(c => c.name === 'Dreams'); s.addEntry(source.tableId, 'Rowan 01::r01');
    s.run('!vmm regenerate --menu ' + menu.id);
    assert.equal(choose(choose(choose(s.root(menu), 'Dreams'), 'Unassigned'), 'Rowan 01'), 'r01');
 });
 test('narration record wizard handles explicit character/title fields and editing', () => {
    const s = sandbox(), menu = s.newMenu('Narration', 'narration');
    const dreams = menu.categories.find(c => c.name === 'Dreams');
    s.run('!vmm add-character --menu ' + menu.id + ' --text Morgan Reed');
    s.run('!vmm add-record --menu ' + menu.id + ' --table ' + dreams.tableId);
    s.finishDraft(['Morgan Reed', '01 - The Forest', 'voice_forest']);
    const item = s.objects.find(o => o.get('_type') === 'tableitem');
    assert.equal(item.get('name'), 'Morgan Reed::01 - The Forest::voice_forest');
    s.run('!vmm edit-record --menu ' + menu.id + ' --table ' + dreams.tableId + ' --item ' + item.id);
    s.finishDraft(['Morgan Reed', '01 - The Wood', 'voice_forest']);
    s.run('!vmm regenerate --menu ' + menu.id);
    assert.equal(choose(choose(choose(s.root(menu), 'Dreams'), 'Morgan Reed'), '01 - The Wood'), 'voice_forest');
 });
 test('GM-only management; player playback requires explicit enablement; another GM gets a separate macro', () => {
    const s = sandbox(), menu = s.newMenu('Coast');
    const before = JSON.stringify(s.state); s.run('!vmm add-settlement --menu ' + menu.id + ' --text Illicit', 'player');
    assert.equal(JSON.stringify(s.state), before);
    s.run('!vmm regenerate --menu ' + menu.id, 'gm2'); assert.notEqual(menu.macros.gm, menu.macros.gm2);
    const track = s.create('jukeboxtrack', { title: 'voice_test', playing: false });
    s.run('!vmm play test', 'player'); s.flush(); assert.equal(track.get('playing'), false);
    s.run('!vmm player-access --value yes'); s.run('!vmm play test', 'player'); s.flush(); assert.equal(track.get('playing'), true);
    const snapshots = Object.values(menu.macros).map(mid => s.objects.find(o => o.id === mid).get('action'));
    s.run('!vmm select --menu ' + menu.id + ' --text --regenerate', 'player');
    assert.deepEqual(Object.values(menu.macros).map(mid => s.objects.find(o => o.id === mid).get('action')), snapshots);
 });
 test('macro collisions and invalid table entries never overwrite an existing working macro', () => {
    const s = sandbox(); s.create('macro', { _playerid: 'gm', name: 'Coast-Voices', action: 'original' });
    s.run('!vmm new --type npc --mode flat'); s.finishDraft(['Coast', 'Coast-Voices']);
    assert.equal(Object.keys(s.state.VoiceMenuManager.menus).length, 0);
    assert.equal(s.objects[0].get('action'), 'original');
    s.run('!vmm cancel-draft --token ' + s.state.VoiceMenuManager.drafts.gm.id);
    const menu = s.newMenu('Other'), place = s.addPlace(menu, 'Port');
    const before = s.macro(menu).get('action'); s.addEntry(place.tableId, 'Broken item');
    assert.match(s.run('!vmm regenerate --menu ' + menu.id), /Invalid item/);
    assert.equal(s.macro(menu).get('action'), before);
 });
 test('direct and weighted playback preserve other audio, reject duplicates, and supersede rapid requests', () => {
    const s = sandbox();
    const one = s.create('jukeboxtrack', { title: 'voice_one', playing: false });
    const two = s.create('jukeboxtrack', { title: 'voice_two', playing: true });
    const music = s.create('jukeboxtrack', { title: 'Music', playing: true });
    s.run('!vmm play one'); s.flush(); assert.equal(one.get('playing'), true); assert.equal(two.get('playing'), false); assert.equal(music.get('playing'), true);
    s.run('!vmm play two'); s.run('!vmm play voice_one'); s.flush(); assert.equal(one.get('playing'), true); assert.equal(two.get('playing'), false);
    const table = s.create('rollabletable', { name: 'Random & Voices' });
    s.addEntry(table.id, 'one', 0); s.addEntry(table.id, 'Two::voice_two', 2);
    s.run('!vmm play Random & Voices'); s.flush(); assert.equal(two.get('playing'), true);
    const duplicate = s.create('jukeboxtrack', { title: 'voice_two' });
    assert.match(s.run('!vmm play two'), /Duplicate Jukebox/); duplicate.remove();
    s.run('!vmm play one'); one.remove(); assert.doesNotThrow(() => s.flush());
 });
 test('Cancel and placeholders leave playing/pending audio alone', () => {
    const s = sandbox(), menu = s.newMenu('Coast');
    const track = s.create('jukeboxtrack', { title: 'voice_one', playing: false });
    s.run('!vmm play one');
    const before = s.messages.length;
    s.run('!vmm select --menu ' + menu.id + ' --text --cancel');
    s.run('!vmm select --menu ' + menu.id + ' --text --none');
    assert.equal(s.messages.length, before); s.flush(); assert.equal(track.get('playing'), true);
 });
 test('prefix confirmation button executes correctly; prefix changes do not rename tracks', () => {
    const s = sandbox(); const track = s.create('jukeboxtrack', { title: 'speech_demo', playing: false });
    const result = s.run('!vmm prefix --text speech_');
    assert.equal(s.state.VoiceMenuManager.settings.prefix, 'voice_');
    const command = links(result).find(link => link.includes('prefix --value speech_'));
    assert(command); s.run(command); assert.equal(s.state.VoiceMenuManager.settings.prefix, 'speech_');
    s.run('!vmm play demo'); s.flush(); assert.equal(track.get('playing'), true); assert.equal(track.get('title'), 'speech_demo');
 });
 test('track audit reports missing and duplicate titles without editing tracks', () => {
    const s = sandbox(), menu = s.newMenu('Coast'), place = s.addPlace(menu, 'Port');
    s.addEntry(place.tableId, 'Missing::missing'); s.addEntry(place.tableId, 'Duplicate::duplicate');
    const one = s.create('jukeboxtrack', { title: 'voice_duplicate' }), two = s.create('jukeboxtrack', { title: 'voice_duplicate' });
    const result = s.run('!vmm audit --menu ' + menu.id);
    assert.match(result, /missing voice_missing/); assert.match(result, /duplicate track title/); assert.equal(one.get('playing'), undefined); assert.equal(two.get('playing'), undefined);
 });
 test('text is not reinterpreted as command flags and wizard tokens belong to the initiating GM', () => {
    const s = sandbox(), menu = s.newMenu('Coast');
    s.run('!vmm add-settlement --menu ' + menu.id + ' --text Town --confirm yes');
    assert.equal(menu.settlements[0].name, 'Town --confirm yes');
    s.run('!vmm new --type npc --mode flat'); const draft = s.state.VoiceMenuManager.drafts.gm;
    s.run('!vmm answer --token ' + draft.id + ' --text Stolen', 'gm2'); assert.equal(draft.step, 0);
    assert.match(s.run('!vmm answer --token ' + draft.id + ' --text Bad|Query'), /without pipes/); assert.equal(draft.step, 0);
    assert.match(s.run('!vmm answer --token ' + draft.id + ' --text <script>'), /without pipes/); assert.equal(draft.step, 0);
 });
 test('record deletion needs confirmation, checks membership and never deletes the audio track', () => {
    const s = sandbox(), menu = s.newMenu('Coast'), place = s.addPlace(menu, 'Port'), other = s.addPlace(menu, 'Hill');
    const item = s.addEntry(place.tableId, 'Guard::guard'), audio = s.create('jukeboxtrack', { title: 'voice_guard' });
    const base = '!vmm remove-record --menu ' + menu.id + ' --table ' + place.tableId + ' --item ' + item.id;
    s.run(base); assert(s.objects.includes(item));
    s.run('!vmm remove-record --menu ' + menu.id + ' --table ' + other.tableId + ' --item ' + item.id + ' --confirm yes'); assert(s.objects.includes(item));
    s.run(base + ' --confirm yes'); assert(!s.objects.includes(item)); assert(s.objects.includes(audio));
 });
 test('failed table creation leaves all narration categories accessible for recovery', () => {
    const s = sandbox(); s.failNext('rollabletable'); const menu = s.newMenu('Narration', 'narration');
    assert.equal(menu.categories.length, 4); assert.equal(menu.categories.filter(c => !c.tableId).length, 1);
    const missing = menu.categories.find(c => !c.tableId);
    s.run('!vmm new-table --menu ' + menu.id + ' --source ' + missing.id + ' --confirm yes');
    assert(menu.categories.every(c => c.tableId)); assert(s.macro(menu)); verifyCancel(s.root(menu));
 });
 test('table and recording list pagination remain usable with hundreds of entries', () => {
    const s = sandbox(), menu = s.newMenu('Coast'), place = s.addPlace(menu, 'Port');
    for (let i = 0; i < 80; i++) s.create('rollabletable', { name: 'Table ' + i });
    const first = s.run('!vmm tables --menu ' + menu.id + ' --source ' + place.id);
    assert.equal((first.match(/>Choose<\/a>/g) || []).length, 12); assert.match(first, /Next/);
    const next = links(first).find(link => link.includes('--page 1')); assert(next); assert.match(s.run(next), /Previous/);
    for (let i = 0; i < 50; i++) s.addEntry(place.tableId, 'NPC ' + i + '::npc' + i);
    assert.match(s.run('!vmm records --menu ' + menu.id + ' --table ' + place.tableId + ' --page 999'), /Page 5\/5/);
 });
 test('reloading with saved state retains configuration, table links and macro IDs', () => {
    const s = sandbox(), menu = s.newMenu('Coast'), place = s.addPlace(menu, 'Port');
    const macroId = s.macro(menu).id; s.addEntry(place.tableId, 'Guard::guard');
    s.load(); s.run('!vmm regenerate --menu ' + menu.id);
    assert.equal(s.macro(menu).id, macroId); assert.equal(menu.settlements[0].tableId, place.tableId);
    assert.equal(choose(choose(s.root(menu), 'Port'), 'Guard'), 'guard');
    assert.equal(s.events['chat:message'].length, 1);
 });

 test('blank optional text survives trimming and reserved labels cannot collide with controls', () => {
    const s = sandbox(), menu = s.newMenu('Narration', 'narration');
    s.run('!vmm add-character --menu ' + menu.id + ' --text Morgan Reed');
    const dreams = menu.categories.find(c => c.name === 'Dreams');
    s.run('!vmm add-record --menu ' + menu.id + ' --table ' + dreams.tableId);
    const draft = s.state.VoiceMenuManager.drafts.gm;
    s.run('!vmm answer --token ' + draft.id + ' --text');
    assert.equal(draft.step, 1); assert.equal(draft.values.player, '');
    s.run('!vmm answer --token ' + draft.id + ' --text Morgan 01');
    s.run('!vmm answer --token ' + draft.id + ' --text voice_one');
    s.run('!vmm commit --token ' + draft.id);
    const names = s.objects.filter(o => o.get('_type') === 'tableitem').map(o => o.get('name'));
    assert(names.includes('Morgan 01::voice_one'));
    assert.match(s.run('!vmm add-character --menu ' + menu.id + ' --text Unassigned'), /reserved/);
    assert.match(s.run('!vmm add-character --menu ' + menu.id + ' --text Cancel'), /reserved/);
    assert.equal(menu.characters.length, 1);
 });
