/*
=========================================================
Name			:	Fetch
GitHub			:	https://github.com/TimRohr22/Cauldron/tree/master/Fetch
Roll20 Contact	:	timmaugh
Version			:	1.0.11
Last Update		:	2/25/2022
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.Fetch = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{
    try { throw new Error(''); } catch (e) { API_Meta.Fetch.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (13)); }
}

const Fetch = (() => {
    const apiproject = 'Fetch';
    const version = '1.0.11';
    const schemaVersion = 0.1;
    API_Meta[apiproject].version = version;
    const vd = new Date(1645805488397);
    const versionInfo = () => {
        log(`\u0166\u0166 ${apiproject} v${API_Meta[apiproject].version}, ${vd.getFullYear()}/${vd.getMonth() + 1}/${vd.getDate()} \u0166\u0166 -- offset ${API_Meta[apiproject].offset}`);
        if (!state.hasOwnProperty(apiproject) || state[apiproject].version !== schemaVersion) {
            log(`  > Updating ${apiproject} Schema to v${schemaVersion} <`);
            switch (state[apiproject] && state[apiproject].version) {

                case 0.1:
                /* break; // intentional dropthrough */ /* falls through */

                case 'UpdateSchemaVersion':
                    state[apiproject].version = schemaVersion;
                    break;

                default:
                    state[apiproject] = {
                        version: schemaVersion,
                    };
                    break;
            }
        }
    };
    const logsig = () => {
        // initialize shared namespace for all signed projects, if needed
        state.torii = state.torii || {};
        // initialize siglogged check, if needed
        state.torii.siglogged = state.torii.siglogged || false;
        state.torii.sigtime = state.torii.sigtime || Date.now() - 3001;
        if (!state.torii.siglogged || Date.now() - state.torii.sigtime > 3000) {
            const logsig = '\n' +
                '  _____________________________________________   ' + '\n' +
                '   )_________________________________________(    ' + '\n' +
                '     )_____________________________________(      ' + '\n' +
                '           ___| |_______________| |___            ' + '\n' +
                '          |___   _______________   ___|           ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '              | |               | |               ' + '\n' +
                '______________|_|_______________|_|_______________' + '\n' +
                '                                                  ' + '\n';
            log(`${logsig}`);
            state.torii.siglogged = true;
            state.torii.sigtime = Date.now();
        }
        return;
    };

    const escapeRegExp = (string) => { return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); };
    const getfirst = (cmd, ...args) => {
        // pass in objects of form: {type: 'text', rx: /regex/}
        // return object of form  : {regex exec object with property 'type': 'text'}

        let ret = {};
        let r;
        args.find(a => {
            r = a.rx.exec(cmd);
            if (r && (!ret.length || r.index < ret.index)) {
                ret = Object.assign(r, { type: a.type });
            }
            a.lastIndex = 0;
        }, ret);
        return ret;
    };
    const getEditDistance = (a, b) => {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        var matrix = [];

        // increment along the first column of each row
        var i;
        for (i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        // increment each column in the first row
        var j;
        for (j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        // Fill in the rest of the matrix
        for (i = 1; i <= b.length; i++) {
            for (j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                        Math.min(matrix[i][j - 1] + 1, // insertion
                            matrix[i - 1][j] + 1)); // deletion
                }
            }
        }

        return matrix[b.length][a.length];
    };
    const repeatingOrdinal = (character_id, section = '', attr_name = '') => {
        if (!section && !attr_name) return;
        let ordrx, match;
        if (attr_name) {
            ordrx = /^repeating_([^_]+)_([^_]+)_.*$/;
            if (!ordrx.test(attr_name)) return; // the supplied attribute name isn't a repeating attribute at all
            match = ordrx.exec(attr_name);
            section = match[1];
        }
        let sectionrx = new RegExp(`repeating_${section}_([^_]+)_.*$`);
        let createOrderKeys = [...new Set(findObjs({ type: 'attribute', characterid: character_id })
            .filter(a => sectionrx.test(a.get('name')))
            .map(a => sectionrx.exec(a.get('name'))[1]))];
        let sortOrderKeys = (findObjs({ type: 'attribute', characterid: character_id, name: `_reporder_repeating_${section}` })[0] || { get: () => { return ''; } })
            .get('current')
            .split(/\s*,\s*/)
            .filter(a => createOrderKeys.includes(a));
        sortOrderKeys.push(...createOrderKeys.filter(a => !sortOrderKeys.includes(a)));
        return attr_name ? sortOrderKeys.indexOf(match[2]) : sortOrderKeys;
    };
    const parsePattern = (cmd) => {
        const fieldcomprx = /^((?<retrieve>m)\s*\|)?\s*^(?<field>[^\s]+?)\s*(?<operator>>=|<=|~|!~|=|!=|<|>)\s*((`|'|")(?<value>.*?)\6|(?<altvalue>.*?)(?=\s|$))\s*/i;
        const fieldrx = /^((?<retrieve>m)\s*\|)?\s*(?<field>[^\s]+)\s*/i;
        const fieldcomptm = { rx: fieldcomprx, type: 'fieldcomp' },
            fieldtm = { rx: fieldrx, type: 'field' };
        let index = 0;
        let p = {};
        let tokens = [];
        while (!/^$/.test(cmd.slice(index))) {
            p = getfirst(cmd.slice(index), fieldcomptm, fieldtm);
            if (p) {
                if (p.type === 'field') tokens.push({ type: '=', contents: [p.groups.field, true], retrieve: p.groups.retrieve ? 'max' : 'current' });
                else tokens.push({ type: p.groups.operator, contents: [p.groups.field, p.groups.value || p.groups.altvalue], retrieve: p.groups.retrieve ? 'max' : 'current' });
                index += p[0].length;
            } else {
                return { tokens: [], error: `Unexpected token encountered in repeating pattern: ${cmd}` };
            }
        }
        return { tokens: tokens };
    };

    const getSheetItem = (res, pid, char) => {
        // expects result of the getFirst() function, a rx result with a type property
        // r.type === 'sheetitem'
        const itemTypeLib = {
            '@': 'attribute',
            '*': 'attribute',
            '%': 'ability'
        }
        let c = char || getChar(res.groups.character, pid);
        if (!c) return;
        // standard sheet items
        if (['@', '%'].includes(res.groups.type)) {
            let sheetobj = findObjs({ type: itemTypeLib[res.groups.type], characterid: c.id })
                .filter(a => a.get('name') === res.groups.item)[0];
            return sheetobj;
        }
        // if we're still here, we're looking for a repeating item
        let p = parsePattern(res.groups.pattern);
        if (!p.tokens.length) {
            log(p.error || 'No pattern detected for repeating sheet item.');
            return;
        }

        let filterLib = {
            '=': (a) => a.contents[0] == a.contents[1],
            '!=': (a) => a.contents[0] != a.contents[1],
            '~': (a) => a.contents[0].includes(a.contents[1]),
            '!~': (a) => !a.contents[0].includes(a.contents[1]),
            '>': (a) => (internalTestLib.num(a.contents[0]) ? Number(a.contents[0]) : a.contents[0]) > (internalTestLib.num(a.contents[1]) ? Number(a.contents[1]) : a.contents[1]),
            '>=': (a) => (internalTestLib.num(a.contents[0]) ? Number(a.contents[0]) : a.contents[0]) >= (internalTestLib.num(a.contents[1]) ? Number(a.contents[1]) : a.contents[1]),
            '<': (a) => (internalTestLib.num(a.contents[0]) ? Number(a.contents[0]) : a.contents[0]) < (internalTestLib.num(a.contents[1]) ? Number(a.contents[1]) : a.contents[1]),
            '<=': (a) => (internalTestLib.num(a.contents[0]) ? Number(a.contents[0]) : a.contents[0]) <= (internalTestLib.num(a.contents[1]) ? Number(a.contents[1]) : a.contents[1])
        }

        p.tests = [];
        let reprx = new RegExp(`^repeating_${res.groups.section}_(?<repID>[^_]*?)_(?<suffix>.+)$`);
        let repres;
        let o = findObjs({ type: itemTypeLib[res.groups.type], characterid: c.id })
            .filter(a => reprx.test(a.get('name')));
        o.forEach(a => {
            reprx.lastIndex = 0;
            repres = reprx.exec(a.get('name'));
            a.name = a.get('name');
            a.repID = repres.groups.repID;
            a.suffix = repres.groups.suffix;
        });

        let viable = [];
        p.tokens.forEach(s => {
            viable = [];
            o.forEach(a => {
                if (a.suffix.toLowerCase() === s.contents[0].toLowerCase()) {
                    if (filterLib[s.type]({ contents: [a.get(s.retrieve), s.contents[1]] })) viable.push(a.repID);
                }
            });
            p.tests.push(viable);
        });
        // we should have the same number of tests as we do testable conditions
        if (p.tests.length !== p.tokens.length) {
            log(`EXITING: TEST COUNTS DON'T MATCH`);
            return;
        }
        viable = p.tests.reduce((m, v) => m.filter(repID => v.includes(repID)));
        if (viable.length) {
            let retObj = findObjs({ type: itemTypeLib[res.groups.type], characterid: c.id })
                .filter(a => a.get('name') === `repeating_${res.groups.section}_${viable[0]}_${res.groups.valuesuffix}`)[0];
            return retObj;
        }
    };
    const getSheetItemVal = (res, pid, char) => {
        // expects the result of a rx with groups
        let val = '',
            retrieve = '',
            o = {};
        // determine what to test; also what to retrieve if another value isn't specified
        if (['@', '*'].includes(res.groups.type) && res.groups.valtype !== 'max') {
            retrieve = 'current';
        } else if (['@', '*'].includes(res.groups.type)) {
            retrieve = 'max';
        } else {
            retrieve = 'action';
        }
        // determine if a different retrievable info is requested
        if (res.groups.type === '*' && res.groups.valtype === 'name$') {
            retrieve = 'name$';
        } else if (res.groups.type === '*' && res.groups.valtype === 'row$') {
            retrieve = 'row$';
        } else if (res.groups.valtype === 'rowid') {
            retrieve = 'rowid';
        } else if (res.groups.valtype === 'name') {
            retrieve = 'name';
        } else if (res.groups.valtype === 'id') {
            retrieve = 'id';
        }
        // go get the item
        o = getSheetItem(res, pid, char);
        if (!o) {
            return;
        } else {
            if (['name', 'action', 'current', 'max', 'id'].includes(retrieve)) {
                val = o.get(retrieve);
            } else {
                val = o.get('name');
                let row;
                let rptrx = /^repeating_([^_]+)_([^_]+)_(.*)$/i;
                let rptres = rptrx.exec(val) || [undefined, undefined, '', ''];
                switch (retrieve) {
                    case 'row$':
                        val = `$${repeatingOrdinal(o.get('characterid'), undefined, val)}`;
                        break;
                    case 'name$':
                        row = `$${repeatingOrdinal(o.get('characterid'), undefined, val)}`;
                        val = `repeating_${rptres[1]}_${row}_${rptres[3]}`;
                        break;
                    case 'rowid':
                        val = rptres[2];
                        break;
                    default:
                }
            }
        }
        return val;
    };

    const getChar = (query, pid) => { // find a character where info is an identifying piece of information (id, name, or token id)
        let character;
        let qrx = new RegExp(escapeRegExp(query), 'i');
        let charsIControl = findObjs({ type: 'character' });
        charsIControl = playerIsGM(pid) ? charsIControl : charsIControl.filter(c => c.get('controlledby').split(',').includes(pid));
        character = charsIControl.filter(c => c.id === query)[0] ||
            charsIControl.filter(c => c.id === (getObj('graphic', query) || { get: () => { return '' } }).get('represents'))[0] ||
            charsIControl.filter(c => c.get('name') === query)[0] ||
            charsIControl.filter(c => qrx.test(c)).reduce((m, v) => {
                let d = getEditDistance(query, v);
                return !m.length || d < m[1] ? [v, d] : m;
            }, [])[0];
        return character;
    };
    const getPageID = (pid) => {
        return (pid && playerIsGM(pid)) ? (getObj('player', pid).get('_lastpage') || Campaign().get('playerpageid')) : Campaign().get('playerpageid');
    };
    const getToken = (info, pgid = '') => {
        return findObjs({ type: 'graphic', subtype: 'token', id: info })[0] ||
            findObjs({ type: 'graphic', subtype: 'card', id: info })[0] ||
            findObjs({ type: 'graphic', subtype: 'token', name: info, pageid: pgid })[0];
    };
    const getObjName = (key, type) => {
        let o;
        switch (type) {
            case 'playerlist':
                o = key.split(/\s*,\s*/)
                    .map(k => k === 'all' ? k : getObj('player', k))
                    .filter(c => c)
                    .map(c => c === 'all' ? c : c.get('displayname'))
                    .join(', ');
                return o.length ? o : undefined;
            case 'page':
            case 'attribute':
            case 'character':
            default:
                o = getObj(type, key);
                return o ? o.get('name') : undefined;
        }
    };
    const tokenProps = {
        cardid: { refersto: '_cardid', permissionreq: 'any', dataval: (d) => d },
        cid: { refersto: '_cardid', permissionreq: 'any', dataval: (d) => d },
        tid: { refersto: '_id', permissionreq: 'any', dataval: (d) => d },
        token_id: { refersto: '_id', permissionreq: 'any', dataval: (d) => d },
        pageid: { refersto: '_pageid', permissionreq: 'any', dataval: (d) => d },
        pid: { refersto: '_pageid', permissionreq: 'any', dataval: (d) => d },
        page: { refersto: '_pageid', permissionreq: 'any', dataval: d => getObjName(d, 'page') },
        page_name: { refersto: '_pageid', permissionreq: 'any', dataval: d => getObjName(d, 'page') },
        sub: { refersto: '_subtype', permissionreq: 'any', dataval: (d) => d },
        subtype: { refersto: '_subtype', permissionreq: 'any', dataval: (d) => d },
        token_type: { refersto: '_type', permissionreq: 'any', dataval: (d) => d },
        adv_fow_view_distance: { refersto: 'adv_fow_view_distance', permissionreq: 'any', dataval: (d) => d },
        aura1: { refersto: 'aura1_color', permissionreq: 'any', dataval: (d) => d },
        aura1_color: { refersto: 'aura1_color', permissionreq: 'any', dataval: (d) => d },
        aura1_radius: { refersto: 'aura1_radius', permissionreq: 'any', dataval: (d) => d },
        radius1: { refersto: 'aura1_radius', permissionreq: 'any', dataval: (d) => d },
        aura1_square: { refersto: 'aura1_square', permissionreq: 'any', dataval: (d) => d },
        square1: { refersto: 'aura1_square', permissionreq: 'any', dataval: (d) => d },
        aura2: { refersto: 'aura2_color', permissionreq: 'any', dataval: (d) => d },
        aura2_color: { refersto: 'aura2_color', permissionreq: 'any', dataval: (d) => d },
        aura2_radius: { refersto: 'aura2_radius', permissionreq: 'any', dataval: (d) => d },
        radius2: { refersto: 'aura2_radius', permissionreq: 'any', dataval: (d) => d },
        aura2_square: { refersto: 'aura2_square', permissionreq: 'any', dataval: (d) => d },
        square2: { refersto: 'aura2_square', permissionreq: 'any', dataval: (d) => d },
        bar_location: { refersto: 'bar_location', permissionreq: 'any', dataval: (d) => d },
        bar_loc: { refersto: 'bar_location', permissionreq: 'any', dataval: (d) => d },
        bar1_link: { refersto: 'bar1_link', permissionreq: 'any', dataval: (d) => d },
        link1: { refersto: 'bar1_link', permissionreq: 'any', dataval: (d) => d },
        bar1_name: { refersto: 'bar1_link', permissionreq: 'any', dataval: d => /^sheetattr_/.test(d) ? d.replace(/^sheetattr_/, '') : getObjName(d, 'attribute') },
        name1: { refersto: 'bar1_link', permissionreq: 'any', dataval: d => /^sheetattr_/.test(d) ? d.replace(/^sheetattr_/, '') : getObjName(d, 'attribute') },
        bar1_max: { refersto: 'bar1_max', permissionreq: 'any', dataval: (d) => d },
        max1: { refersto: 'bar1_max', permissionreq: 'any', dataval: (d) => d },
        bar1: { refersto: 'bar1_value', permissionreq: 'any', dataval: (d) => d },
        bar1_current: { refersto: 'bar1_value', permissionreq: 'any', dataval: (d) => d },
        bar1_value: { refersto: 'bar1_value', permissionreq: 'any', dataval: (d) => d },
        bar2_link: { refersto: 'bar2_link', permissionreq: 'any', dataval: (d) => d },
        link2: { refersto: 'bar2_link', permissionreq: 'any', dataval: (d) => d },
        bar2_name: { refersto: 'bar2_link', permissionreq: 'any', dataval: d => /^sheetattr_/.test(d) ? d.replace(/^sheetattr_/, '') : getObjName(d, 'attribute') },
        name2: { refersto: 'bar2_link', permissionreq: 'any', dataval: d => /^sheetattr_/.test(d) ? d.replace(/^sheetattr_/, '') : getObjName(d, 'attribute') },
        bar2_max: { refersto: 'bar2_max', permissionreq: 'any', dataval: (d) => d },
        max2: { refersto: 'bar2_max', permissionreq: 'any', dataval: (d) => d },
        bar2: { refersto: 'bar2_value', permissionreq: 'any', dataval: (d) => d },
        bar2_current: { refersto: 'bar2_value', permissionreq: 'any', dataval: (d) => d },
        bar2_value: { refersto: 'bar2_value', permissionreq: 'any', dataval: (d) => d },
        bar3_link: { refersto: 'bar3_link', permissionreq: 'any', dataval: (d) => d },
        link3: { refersto: 'bar3_link', permissionreq: 'any', dataval: (d) => d },
        bar3_name: { refersto: 'bar3_link', permissionreq: 'any', dataval: d => /^sheetattr_/.test(d) ? d.replace(/^sheetattr_/, '') : getObjName(d, 'attribute') },
        name3: { refersto: 'bar3_link', permissionreq: 'any', dataval: d => /^sheetattr_/.test(d) ? d.replace(/^sheetattr_/, '') : getObjName(d, 'attribute') },
        bar3_max: { refersto: 'bar3_max', permissionreq: 'any', dataval: (d) => d },
        max3: { refersto: 'bar3_max', permissionreq: 'any', dataval: (d) => d },
        bar3: { refersto: 'bar3_value', permissionreq: 'any', dataval: (d) => d },
        bar3_current: { refersto: 'bar3_value', permissionreq: 'any', dataval: (d) => d },
        bar3_value: { refersto: 'bar3_value', permissionreq: 'any', dataval: (d) => d },
        bright_light_distance: { refersto: 'bright_light_distance', permissionreq: 'any', dataval: (d) => d },
        compact_bar: { refersto: 'compact_bar', permissionreq: 'any', dataval: (d) => d },
        token_cby: { refersto: 'controlledby', permissionreq: 'any', dataval: (d) => d },
        token_controlledby: { refersto: 'controlledby', permissionreq: 'any', dataval: (d) => d },
        token_cby_names: { refersto: 'controlledby', permissionreq: 'any', dataval: d => getObjName(d, 'playerlist') },
        token_controlledby_names: { refersto: 'controlledby', permissionreq: 'any', dataval: d => getObjName(d, 'playerlist') },
        token_cby_name: { refersto: 'controlledby', permissionreq: 'any', dataval: d => getObjName(d, 'playerlist') },
        token_controlledby_name: { refersto: 'controlledby', permissionreq: 'any', dataval: d => getObjName(d, 'playerlist') },
        currentside: { refersto: 'currentSide', permissionreq: 'any', dataval: (d) => d },
        curside: { refersto: 'currentSide', permissionreq: 'any', dataval: (d) => d },
        side: { refersto: 'currentSide', permissionreq: 'any', dataval: (d) => d },
        dim_light_opacity: { refersto: 'dim_light_opacity', permissionreq: 'any', dataval: (d) => d },
        directional_bright_light_center: { refersto: 'directional_bright_light_center', permissionreq: 'any', dataval: (d) => d },
        directional_bright_light_total: { refersto: 'directional_bright_light_total', permissionreq: 'any', dataval: (d) => d },
        directional_low_light_center: { refersto: 'directional_low_light_center', permissionreq: 'any', dataval: (d) => d },
        directional_low_light_total: { refersto: 'directional_low_light_total', permissionreq: 'any', dataval: (d) => d },
        emits_bright: { refersto: 'emits_bright_light', permissionreq: 'any', dataval: (d) => d },
        emits_bright_light: { refersto: 'emits_bright_light', permissionreq: 'any', dataval: (d) => d },
        emits_low: { refersto: 'emits_low_light', permissionreq: 'any', dataval: (d) => d },
        emits_low_light: { refersto: 'emits_low_light', permissionreq: 'any', dataval: (d) => d },
        fliph: { refersto: 'fliph', permissionreq: 'any', dataval: (d) => d },
        flipv: { refersto: 'flipv', permissionreq: 'any', dataval: (d) => d },
        gmnotes: { refersto: 'gmnotes', permissionreq: 'gm', dataval: (d) => unescape(d) },
        has_bright_light_vision: { refersto: 'has_bright_light_vision', permissionreq: 'any', dataval: (d) => d },
        has_directional_bright_light: { refersto: 'has_directional_bright_light', permissionreq: 'any', dataval: (d) => d },
        has_directional_low_light: { refersto: 'has_directional_low_light', permissionreq: 'any', dataval: (d) => d },
        has_limit_field_of_night_vision: { refersto: 'has_limit_field_of_night_vision', permissionreq: 'any', dataval: (d) => d },
        has_limit_field_of_vision: { refersto: 'has_limit_field_of_vision', permissionreq: 'any', dataval: (d) => d },
        has_night_vision: { refersto: 'has_night_vision', permissionreq: 'any', dataval: (d) => d },
        has_nv: { refersto: 'has_night_vision', permissionreq: 'any', dataval: (d) => d },
        nv_has: { refersto: 'has_night_vision', permissionreq: 'any', dataval: (d) => d },
        height: { refersto: 'height', permissionreq: 'any', dataval: (d) => d },
        imgsrc: { refersto: 'imgsrc', permissionreq: 'any', dataval: (d) => d },
        imgsrc_short: { refersto: 'imgsrc', permissionreq: 'any', dataval: (d) => d.slice(0, Math.max(d.indexOf(`?`), 0) || d.length) },
        drawing: { refersto: 'isdrawing', permissionreq: 'any', dataval: (d) => d },
        isdrawing: { refersto: 'isdrawing', permissionreq: 'any', dataval: (d) => d },
        lastmove: { refersto: 'lastmove', permissionreq: 'any', dataval: (d) => d },
        lastx: { refersto: 'lastmove', permissionreq: 'any', dataval: d => d.split(/\s*,\s*/)[0] || '' },
        lasty: { refersto: 'lastmove', permissionreq: 'any', dataval: d => d.split(/\s*,\s*/)[1] || '' },
        layer: { refersto: 'layer', permissionreq: 'gm', dataval: (d) => d },
        left: { refersto: 'left', permissionreq: 'any', dataval: (d) => d },
        light_angle: { refersto: 'light_angle', permissionreq: 'any', dataval: (d) => d },
        light_dimradius: { refersto: 'light_dimradius', permissionreq: 'any', dataval: (d) => d },
        light_hassight: { refersto: 'light_hassight', permissionreq: 'any', dataval: (d) => d },
        light_losangle: { refersto: 'light_losangle', permissionreq: 'any', dataval: (d) => d },
        light_multiplier: { refersto: 'light_multiplier', permissionreq: 'any', dataval: (d) => d },
        light_otherplayers: { refersto: 'light_otherplayers', permissionreq: 'any', dataval: (d) => d },
        light_radius: { refersto: 'light_radius', permissionreq: 'any', dataval: (d) => d },
        light_sensitivity_multiplier: { refersto: 'light_sensitivity_multiplier', permissionreq: 'any', dataval: (d) => d },
        light_sensitivity_mult: { refersto: 'light_sensitivity_multiplier', permissionreq: 'any', dataval: (d) => d },
        limit_field_of_night_vision_center: { refersto: 'limit_field_of_night_vision_center', permissionreq: 'any', dataval: (d) => d },
        limit_field_of_night_vision_total: { refersto: 'limit_field_of_night_vision_total', permissionreq: 'any', dataval: (d) => d },
        limit_field_of_vision_center: { refersto: 'limit_field_of_vision_center', permissionreq: 'any', dataval: (d) => d },
        limit_field_of_vision_total: { refersto: 'limit_field_of_vision_total', permissionreq: 'any', dataval: (d) => d },
        low_light_distance: { refersto: 'low_light_distance', permissionreq: 'any', dataval: (d) => d },
        token_name: { refersto: 'name', permissionreq: 'any', dataval: (d) => d },
        night_vision_distance: { refersto: 'night_vision_distance', permissionreq: 'any', dataval: (d) => d },
        nv_dist: { refersto: 'night_vision_distance', permissionreq: 'any', dataval: (d) => d },
        nv_distance: { refersto: 'night_vision_distance', permissionreq: 'any', dataval: (d) => d },
        night_vision_effect: { refersto: 'night_vision_effect', permissionreq: 'any', dataval: (d) => d },
        nv_effect: { refersto: 'night_vision_effect', permissionreq: 'any', dataval: (d) => d },
        night_vision_tint: { refersto: 'night_vision_tint', permissionreq: 'any', dataval: (d) => d },
        nv_tint: { refersto: 'night_vision_tint', permissionreq: 'any', dataval: (d) => d },
        playersedit_aura1: { refersto: 'playersedit_aura1', permissionreq: 'any', dataval: (d) => d },
        playersedit_aura2: { refersto: 'playersedit_aura2', permissionreq: 'any', dataval: (d) => d },
        playersedit_bar1: { refersto: 'playersedit_bar1', permissionreq: 'any', dataval: (d) => d },
        playersedit_bar2: { refersto: 'playersedit_bar2', permissionreq: 'any', dataval: (d) => d },
        playersedit_bar3: { refersto: 'playersedit_bar3', permissionreq: 'any', dataval: (d) => d },
        playersedit_name: { refersto: 'playersedit_name', permissionreq: 'any', dataval: (d) => d },
        represents: { refersto: 'represents', permissionreq: 'any', dataval: (d) => d },
        reps: { refersto: 'represents', permissionreq: 'any', dataval: (d) => d },
        represents_name: { refersto: 'represents', permissionreq: 'any', dataval: d => getObjName(d, 'character') },
        reps_name: { refersto: 'represents', permissionreq: 'any', dataval: d => getObjName(d, 'character') },
        rotation: { refersto: 'rotation', permissionreq: 'any', dataval: (d) => d },
        showname: { refersto: 'showname', permissionreq: 'any', dataval: (d) => d },
        showplayers_aura1: { refersto: 'showplayers_aura1', permissionreq: 'any', dataval: (d) => d },
        showplayers_aura2: { refersto: 'showplayers_aura2', permissionreq: 'any', dataval: (d) => d },
        showplayers_bar1: { refersto: 'showplayers_bar1', permissionreq: 'any', dataval: (d) => d },
        showplayers_bar2: { refersto: 'showplayers_bar2', permissionreq: 'any', dataval: (d) => d },
        showplayers_bar3: { refersto: 'showplayers_bar3', permissionreq: 'any', dataval: (d) => d },
        showplayers_name: { refersto: 'showplayers_name', permissionreq: 'any', dataval: (d) => d },
        show_tooltip: { refersto: 'show_tooltip', permissionreq: 'any', dataval: (d) => d },
        sides: { refersto: 'sides', permissionreq: 'any', dataval: (d) => d },
        markers: { refersto: 'statusmarkers', permissionreq: 'any', dataval: (d) => d },
        statusmarkers: { refersto: 'statusmarkers', permissionreq: 'any', dataval: (d) => d },
        tint: { refersto: 'tint_color', permissionreq: 'any', dataval: (d) => d },
        tint_color: { refersto: 'tint_color', permissionreq: 'any', dataval: (d) => d },
        tooltip: { refersto: 'tooltip', permissionreq: 'any', dataval: (d) => d },
        top: { refersto: 'top', permissionreq: 'any', dataval: (d) => d },
        width: { refersto: 'width', permissionreq: 'any', dataval: (d) => d }
    };
    const charProps = {
        char_id: { refersto: '_id', permissionsreq: 'any', dataval: (d) => d },
        character_id: { refersto: '_id', permissionsreq: 'any', dataval: (d) => d },
        character_type: { refersto: '_type', permissionsreq: 'any', dataval: (d) => d },
        char_type: { refersto: '_type', permissionsreq: 'any', dataval: (d) => d },
        avatar: { refersto: 'avatar', permissionsreq: 'any', dataval: (d) => d },
        char_name: { refersto: 'name', permissionsreq: 'any', dataval: (d) => d },
        character_name: { refersto: 'name', permissionsreq: 'any', dataval: (d) => d },
        archived: { refersto: 'archived', permissionsreq: 'any', dataval: (d) => d },
        inplayerjournals: { refersto: 'inplayerjournals', permissionsreq: 'any', dataval: (d) => d },
        inplayerjournals_name: { refersto: 'inplayerjournals', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        inplayerjournals_names: { refersto: 'inplayerjournals', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        character_controlledby: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => d },
        character_cby: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => d },
        char_cby: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => d },
        char_controlledby: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => d },
        character_controlledby_name: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        character_cby_name: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        char_cby_name: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        char_controlledby_name: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        character_controlledby_names: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        character_cby_names: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        char_cby_names: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        char_controlledby_names: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        defaulttoken: { refersto: '_defaulttoken', permissionsreq: 'any', dataval: (d) => d }
    };

    const condensereturn = (funcret, status, notes) => {
        funcret.runloop = (status.includes('changed') || status.includes('unresolved'));
        if (status.length) {
            funcret.status = status.reduce((m, v) => {
                switch (m) {
                    case 'unchanged':
                        m = v;
                        break;
                    case 'changed':
                        m = v === 'unresolved' ? v : m;
                        break;
                    case 'unresolved':
                        break;
                }
                return m;
            });
        }
        funcret.notes = notes.join('<br>');
        return funcret;
    };

    const tokenrx = /@\((?<token>selected|tracker|(?:[^|.]+?))[|.](?<item>[^\s[|.)]+?)(?:[|.](?<valtype>[^\s.[|]+?)){0,1}(?:\[(?<default>[^\]]*?)]){0,1}\s*\)/gi;
    const trackerrx = /^tracker(\[(?<filter>[^\]]+)]){0,1}((?<operator>\+|-)(?<offset>\d+)){0,1}$/i;
    const sheetitemrx = /(?<type>(?:@|%))\((?<character>[^|.]+?)[|.](?<item>[^\s.[|)]+?)(?:[|.](?<valtype>[^\s.[)]+?)){0,1}(?:\[(?<default>[^\]]*?)]){0,1}\s*\)/gi;
    const rptgitemrx = /(?<type>(?:\*))\((?<character>[^|.]+?)[|.](?<section>[^\s.|]+?)[|.]\[\s*(?<pattern>.+?)\s*]\s*[|.](?<valuesuffix>[^[\s).]+?)(?:[|.](?<valtype>[^\s.[)]+?)){0,1}(?:\[(?<default>[^\]]*?)]){0,1}\s*\)/gi;
    const macrorx = /#\((?<item>[^\s.[)]+?)(?:\[(?<default>[^\]]*?)]){0,1}\s*\)/gi;

    const testConstructs = c => {
        let result = tokenrx.test(c) || sheetitemrx.test(c) || rptgitemrx.test(c) || macrorx.test(c);
        tokenrx.lastIndex = 0;
        sheetitemrx.lastIndex = 0;
        rptgitemrx.lastIndex = 0;
        macrorx.lastIndex = 0;
        return result;
    };
    const simpleObj = (o) => JSON.parse(JSON.stringify(o));
    const handleInput = (msg, msgstate = {}) => {
        let funcret = { runloop: false, status: 'unchanged', notes: '' };
        if (msg.type !== 'api' || !testConstructs(msg.content)) return funcret;
        if (!Object.keys(msgstate).length && scriptisplugin) return funcret;
        let status = [];
        let notes = [];

        const filterObj = {
            'page': (t) => t._pageid === (Campaign().get('playerspecificpages')[msg.playerid] || Campaign().get('playerpageid')),
            'ribbon': (t) => t._pageid === Campaign().get('playerpageid'),
            'gm': (t) => true
        };

        while (tokenrx.test(msg.content) || sheetitemrx.test(msg.content) || rptgitemrx.test(msg.content) || macrorx.test(msg.content)) {
            tokenrx.lastIndex = 0;
            sheetitemrx.lastIndex = 0;
            rptgitemrx.lastIndex = 0;
            macrorx.lastIndex = 0;

            // TOKENS
            msg.content = msg.content.replace(tokenrx, (m, token, item, valtype, def = '') => {
                let source;
                let sourcetokID;
                let sourcechar;
                let retval;
                let trackres;
                let offset;
                let reverse = false;
                let pgfilter = 'page';

                let to;
                if (trackerrx.test(token)) { // if it is a tracker call, it could have an offset, so we detect that first
                    trackres = trackerrx.exec(token);
                    offset = trackres.groups.offset || '0';
                    if (trackres.groups.operator === '-') reverse = true;
                    if(playerIsGM(msg.playerid)) pgfilter = trackres.groups.filter || 'page';
                    token = `tracker`;
                }
                switch (token.toLowerCase()) {
                    case 'tracker':
                        to = JSON.parse(Campaign().get('turnorder') || '[]').filter(filterObj[pgfilter] || filterObj['page']);
                        if (!to.length || to[0].id === '-1') {
                            notes.push(`No tracker token for ${m}. Using default value.`);
                            retval = def;
                        } else {
                            sourcetokID = to[reverse ? Math.min(offset % to.length, 1) * (to.length - (offset % to.length)) : offset % to.length].id;
                            if (Object.keys(tokenProps).includes(item.toLowerCase())) {                   // selected + token property = return token property || default
                                source = simpleObj(getToken(sourcetokID) || {});
                                retval = tokenProps[item.toLowerCase()].dataval(source[tokenProps[item.toLowerCase()].refersto]);
                                if (typeof retval === 'undefined') {
                                    notes.push(`No token property found for ${m}. Using default value.`);
                                    retval = def;
                                }
                            } else {                                                        // selected + character attribute = return character attribute info || default
                                sourcechar = getChar(sourcetokID, msg.playerid);
                                source = simpleObj(sourcechar || {});
                                if (!Object.keys(source).length) {
                                    notes.push(`No character found for ${m}. Using default value.`);
                                    retval = def;
                                } else {
                                    if (Object.keys(charProps).includes(item.toLowerCase())) {
                                        retval = charProps[item.toLowerCase()].dataval(source[charProps[item.toLowerCase()].refersto]);
                                        if (typeof retval === 'undefined') {
                                            notes.push(`No character property found for ${m}. Using default value.`);
                                            retval = def;
                                        }
                                    } else {
                                        retval = getSheetItemVal({ groups: { type: '@', character: source._id, item: item, valtype: valtype } }, msg.playerid, sourcechar);
                                        if (typeof retval === 'undefined') {
                                            notes.push(`No attribute found for ${m}. Using default value.`);
                                            retval = def;
                                        }
                                    }
                                }
                            }
                        }
                        break;
                    case 'selected':
                        if (!msg.selected) {
                            notes.push(`No token selected for ${m}. Using default value.`);
                            retval = def;
                        } else {
                            if (Object.keys(tokenProps).includes(item.toLowerCase())) {                   // selected + token property = return token property || default
                                source = simpleObj(getToken(msg.selected[0]._id) || {});
                                retval = tokenProps[item.toLowerCase()].dataval(source[tokenProps[item.toLowerCase()].refersto]);
                                if (typeof retval === 'undefined') {
                                    notes.push(`No token property found for ${m}. Using default value.`);
                                    retval = def;
                                }
                            } else {                                                        // selected + character attribute = return character attribute info || default
                                sourcechar = getChar(msg.selected[0]._id, msg.playerid);
                                source = simpleObj(sourcechar || {});
                                if (!Object.keys(source).length) {
                                    notes.push(`No character found for ${m}. Using default value.`);
                                    retval = def;
                                } else {
                                    if (Object.keys(charProps).includes(item.toLowerCase())) {
                                        retval = charProps[item.toLowerCase()].dataval(source[charProps[item.toLowerCase()].refersto]);
                                        if (typeof retval === 'undefined') {
                                            notes.push(`No character property found for ${m}. Using default value.`);
                                            retval = def;
                                        }
                                    } else {
                                        retval = getSheetItemVal({ groups: { type: '@', character: source._id, item: item, valtype: valtype } }, msg.playerid, sourcechar);
                                        if (typeof retval === 'undefined') {
                                            notes.push(`No attribute found for ${m}. Using default value.`);
                                            retval = def;
                                        }
                                    }
                                }
                            }
                        }
                        break;
                    default:
                        source = simpleObj(getToken(token, getPageID(msg.playerid)) || {});
                        if (!Object.keys(source).length && Object.keys(tokenProps).includes(item.toLowerCase())) {        // no token found + token property = return default
                            notes.push(`No token property found for ${m}. Using default value.`);
                            retval = def;
                        } else if (Object.keys(source).length && Object.keys(tokenProps).includes(item.toLowerCase())) {  // token + token property = return token property || default
                            retval = tokenProps[item.toLowerCase()].dataval(source[tokenProps[item.toLowerCase()].refersto]);
                            if (typeof retval === 'undefined') {
                                notes.push(`No token property found for ${m}. Using default value.`);
                                retval = def;
                            }
                        } else if (Object.keys(source).length && !Object.keys(tokenProps).includes(item.toLowerCase())) { // token + character attribute/property = return character attribute info || default
                            sourcechar = getChar(token, msg.playerid);
                            source = simpleObj(sourcechar || {});
                            if (!Object.keys(source).length) {
                                notes.push(`No character found for ${m}. Using default value.`);
                                retval = def;
                            } else {
                                if (Object.keys(charProps).includes(item.toLowerCase())) { // token + character property
                                    retval = charProps[item.toLowerCase()].dataval(source[charProps[item.toLowerCase()].refersto]);
                                    if (typeof retval === 'undefined') {
                                        notes.push(`No character property found for ${m}. Using default value.`);
                                        retval = def;
                                    }
                                } else {                                                  // token + character attribute
                                    retval = getSheetItemVal({ groups: { type: '@', character: source._id, item: item, valtype: valtype } }, msg.playerid, sourcechar);
                                    if (typeof retval === 'undefined') {
                                        notes.push(`No attribute found for ${m}. Using default value.`);
                                        retval = def;
                                    }
                                }
                            }
                        } else {                                                        // not a token (character or non existent) = leave everything to be caught by the later rx statements
                            retval = m;
                        }
                }
                if (retval) status.push('changed');
                return retval;
            });

            // STANDARD SHEET ITEMS
            msg.content = msg.content.replace(sheetitemrx, (m, type, character, item, valtype, def = '') => {
                let retval;
                if (character.toLowerCase() === 'speaker') character = msg.who;
                let sourcechar = getChar(character, msg.playerid);
                let source = simpleObj(sourcechar || {});
                if (!sourcechar) {
                    notes.push(`Unable to find character for ${m}. Using default value.`);
                    retval = def;
                } else {
                    if (Object.keys(charProps).includes(item.toLowerCase())) {
                        retval = charProps[item.toLowerCase()].dataval(source[charProps[item.toLowerCase()].refersto]);
                        if (typeof retval === 'undefined') {
                            notes.push(`Unable to find character property for ${m}. Using default value.`);
                            retval = def;
                        }
                    } else {
                        retval = getSheetItemVal({ groups: { type: type, character: sourcechar.id, item: item, valtype: valtype } }, msg.playerid, sourcechar);
                        if (typeof retval === 'undefined') {
                            notes.push(`Unable to find ${type === '@' ? 'attribute' : 'ability'} for ${m}. Using default value.`);
                            retval = def;
                        }
                    }
                }
                if (retval) status.push('changed');
                return retval;
            });

            // REPEATING SHEET ITEMS
            msg.content = msg.content.replace(rptgitemrx, (m, type, character, section, pattern, valuesuffix, valtype, def = '') => {
                let retval;
                let bsel = false;
                let sourcechar;
                switch (character.toLowerCase()) {
                    case 'selected':
                        if (!msg.selected) {
                            notes.push(`No token selected for ${m}. Using default value.`);
                            bsel = true;
                            retval = def;
                        } else {
                            sourcechar = getChar(msg.selected[0]._id, msg.playerid);
                        }
                        break;
                    case 'speaker':
                        sourcechar = getChar(msg.who, msg.playerid);
                        break;
                    default:
                        sourcechar = getChar(character, msg.playerid);
                }

                if (!sourcechar) {
                    if (!bsel) notes.push(`Unable to find character for ${m}. Using default value.`); //track note only if we haven't already tracked no selected
                    retval = def;
                } else {
                    retval = getSheetItemVal({ groups: { type: type, character: sourcechar.id, valtype: valtype, section: section, pattern: pattern, valuesuffix: valuesuffix } }, msg.playerid, sourcechar);
                    if (typeof retval === 'undefined') {
                        notes.push(`Unable to find repeating item for ${m}. Using default value.`);
                        retval = def;
                    }
                }
                if (retval) status.push('changed');
                return retval;
            });

            // MACROS
            msg.content = msg.content.replace(macrorx, (m, item, def = '') => {
                let retval = def;
                let locobj = findObjs({ type: 'macro', name: item })[0];
                const validator = e => ['all', msg.playerid].includes(e);
                if (!locobj || !(msg.playerid === locobj.get('_playerid') || locobj.get('visibleto').split(',').some(validator))) {
                    status.push('unresolved');
                    notes.push(`Unable to find macro named ${item}. Using default value.`);
                    return retval;
                }
                retval = locobj.get('action') || '';
                status.push('changed');
                return retval;
            });

        }
        return condensereturn(funcret, status, notes);
    };

    let scriptisplugin = false;
    const fetch = (m, s) => handleInput(m, s);
    on('chat:message', handleInput);
    on('ready', () => {
        versionInfo();
        logsig();
        scriptisplugin = (typeof ZeroFrame !== `undefined`);
        if (typeof ZeroFrame !== 'undefined') {
            ZeroFrame.RegisterMetaOp(fetch);
        }
    });
    return {
    };
})();
{ try { throw new Error(''); } catch (e) { API_Meta.Fetch.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.Fetch.offset); } }