/*
=========================================================
Name			:	APILogic
GitHub			:	https://github.com/TimRohr22/Cauldron/tree/master/APILogic
Roll20 Contact	:	timmaugh
Version			:	1.1.2
Last Update		:	2/17/2021
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.APILogic = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{
    try { throw new Error(''); } catch (e) { API_Meta.APILogic.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (13)); }
}

const APILogic = (() => {
    // ==================================================
    //		VERSION
    // ==================================================
    const apiproject = 'APILogic';
    API_Meta[apiproject].version = '1.1.2';
    const vd = new Date(1613614788869);
    const versionInfo = () => {
        log(`\u0166\u0166 ${apiproject} v${API_Meta[apiproject].version}, ${vd.getFullYear()}/${vd.getMonth() + 1}/${vd.getDate()} \u0166\u0166 -- offset ${API_Meta[apiproject].offset}`);
        return;
    };
    const logsig = () => {
        // initialize shared namespace for all signed projects, if needed
        state.torii = state.torii || {};
        // initialize siglogged check, if needed
        state.torii.siglogged = state.torii.siglogged || false;
        state.torii.sigtime = state.torii.sigtime || Date.now() - 3001;
        if (!state.torii.siglogged || Date.now() - state.torii.sigtime > 3000) {
            const logsig = '\n' +
                '   ‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗    ' + '\n' +
                '    ∖_______________________________________∕     ' + '\n' +
                '      ∖___________________________________∕       ' + '\n' +
                '           ___┃ ┃_______________┃ ┃___            ' + '\n' +
                '          ┃___   _______________   ___┃           ' + '\n' +
                '              ┃ ┃               ┃ ┃               ' + '\n' +
                '              ┃ ┃               ┃ ┃               ' + '\n' +
                '              ┃ ┃               ┃ ┃               ' + '\n' +
                '              ┃ ┃               ┃ ┃               ' + '\n' +
                '              ┃ ┃               ┃ ┃               ' + '\n' +
                '______________┃ ┃_______________┃ ┃_______________' + '\n' +
                '             ⎞⎞⎛⎛            ⎞⎞⎛⎛      ' + '\n';
            log(`${logsig}`);
            state.torii.siglogged = true;
            state.torii.sigtime = Date.now();
        }
        return;
    };
    const generateUUID = (() => {
        let a = 0;
        let b = [];

        return () => {
            let c = (new Date()).getTime() + 0;
            let f = 7;
            let e = new Array(8);
            let d = c === a;
            a = c;
            for (; 0 <= f; f--) {
                e[f] = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(c % 64);
                c = Math.floor(c / 64);
            }
            c = e.join("");
            if (d) {
                for (f = 11; 0 <= f && 63 === b[f]; f--) {
                    b[f] = 0;
                }
                b[f]++;
            } else {
                for (f = 0; 12 > f; f++) {
                    b[f] = Math.floor(64 * Math.random());
                }
            }
            for (f = 0; 12 > f; f++) {
                c += "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);
            }
            return c;
        };
    })();

    let preservedMsgObj = {};

    // REGEXES ==============================================
    const stoprx = /{&\s*stop\s*}/i,
        simplerx = /{&\s*simple\s*}/i,
        defblockrx = /{&\s*define\s*/i,
        definitionrx = /\(\s*\[\s*(?<term>.+?)\s*]\s*('|"|`?)(?<definition>.*?)\2\)\s*/i,
        ifrx = /{&\s*if(?=\(|\s+|!)\s*/i,
        elseifrx = /{&\s*elseif(?=\(|\s+|!)\s*/i,
        elserx = /{&\s*else\s*(?=})/i,
        endrx = /{&\s*end\s*}/i,
        valuerx = /\$\[\[(?<rollnumber>\d+)]]\.value/gi,
        evalrx = /{&\s*eval\s*}\s*/i,
        evalendrx = /{&\s*\/\s*eval\s*}/i;
    // FORMERLY in IFTREEPARSER =============================
    const groupopenrx = /^\s*(?<negation>!?)\s*\(\s*/,
        namerx = /^\[(?<groupname>[^\s]+?)]\s*/i,
        sheetitemrx = /^(?<negation>!?)\s*(?<type>(?:@|%))(?<operation>[^\s@%|]*)\|(?<character>[^|]+?)\|(?<item>[^)\]\s=~<>!&\|]+)\s*(?=!=|!~|>=|<=|[=~><]|&&|\|\||\)|})/i,
        rptgitemrx = /^(?<negation>!?)\s*(?<type>(?:\*))(?<operation>[^\s*|]*)\|(?<character>[^|]+?)\|(?<section>[^\s|]+)\|\[\s*(?<pattern>.+?)\s*]\s*\|(?<valuesuffix>[^)\]\s=~<>!&\|]+)\s*(?=!=|!~|>=|<=|[=~><]|&&|\|\||\)|})/i,
        sheetitem_standalonerx = /^(?<negation>!?)\s*(?<type>(?:@|%))(?<operation>[^\s@%|]*)\|(?<character>[^|]+?)\|(?<item>[^)\]\s=~<>!&\|]+)\s*/i,
        rptgitem_standalonerx = /^(?<negation>!?)\s*(?<type>(?:\*))(?<operation>[^\s*|]*)\|(?<character>[^|]+?)\|(?<section>[^\s|]+)\|\[\s*(?<pattern>.+?)\s*]\s*\|(?<valuesuffix>[^)\]\s=~<>!&\|]+)\s*/i,
        comprx = /^(?<operator>(?:>=|<=|~|!~|=|!=|<|>))\s*/,
        operatorrx = /^(?<operator>(?:&&|\|\|))\s*/,
        groupendrx = /^\)\s*/,
        ifendrx = /^\s*}/,
        textrx = /^(?<negation>!?)\s*(`|'|"?)(?<argtext>.+?)\2\s*(?=!=|!~|>=|<=|[=~><]|&&|\|\||\)|})/,
        text_standalonerx = /^(?<negation>!?)\s*(`|'|"?)(?<argtext>.+?)\2\s*/;


    // TOKEN MARKERS ========================================
    const iftm = { rx: ifrx, type: 'if' },
        elseiftm = { rx: elseifrx, type: 'elseif' },
        elsetm = { rx: elserx, type: 'else' },
        endtm = { rx: endrx, type: 'end' },
        eostm = { rx: /$/, type: 'eos' },
        groupopentm = { rx: groupopenrx, type: 'groupopen' },
        groupendtm = { rx: groupendrx, type: 'groupend' },
        ifendtm = { rx: ifendrx, type: 'mainconditions' },
        texttm = { rx: textrx, type: 'text' },
        sheetitemtm = { rx: sheetitemrx, type: 'sheetitem' },
        rptgitemtm = { rx: rptgitemrx, type: 'rptgitem' },
        sheetitem_standalonetm = { rx: sheetitem_standalonerx, type: 'sheetitem' },
        rptgitem_standalonetm = { rx: rptgitem_standalonerx, type: 'rptgitem' },
        text_standalonetm = { rx: text_standalonerx, type: 'text' }
    defblocktm = { rx: defblockrx, type: 'defblock' },
        evaltm = { rx: evalrx, type: 'eval' },
        evalendtm = { rx: evalendrx, type: 'evalend' };

    // END TOKEN REGISTRY ===================================
    const endtokenregistry = {
        main: [eostm],
        if: [elseiftm, elsetm, endtm],
        elseif: [elseiftm, elsetm, endtm],
        else: [endtm],
        mainconditions: [ifendtm],
        group: [groupendtm],
        eval: [evalendtm]
    };


    const nestlog = (stmt, ilvl = 0, logcolor = '') => {
        if (isNaN(ilvl)) {
            ilvl = 0;
            log(`Next statement fed a NaN value for the indentation.`);
        }
        if (state[apiproject] && state[apiproject].logging === true) {
            let l = `${Array(ilvl + 1).join("==")}${stmt}`;
            if (logcolor) {
                // l = /:/.test(l) ? `<span style="color:${logcolor};">${l.replace(/:/, ':</span>')}` : `<span style="color:${logcolor};">${l}</span>`;
            }
            log(l);
        }
    };

    const escapeRegExp = (string) => { return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); };
    const assertstart = rx => new RegExp(`^${rx.source}`, rx.flags);
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
    const internalTestLib = {
        'int': (v) => +v === +v && parseInt(parseFloat(v, 10), 10) == v,
        'num': (v) => +v === +v,
        'tru': (v) => v == true
    };

    const charFromAmbig = (info) => {                                       // find a character where info is an identifying piece of information (id, name, or token id)
        let character;
        character = findObjs({ type: 'character', id: info })[0] ||
            findObjs({ type: 'character' }).filter(c => c.get('name') === info)[0] ||
            findObjs({ type: 'character', id: (getObj("graphic", info) || { get: () => { return "" } }).get("represents") })[0];
        return character;
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

    const getSheetItem = (t) => {
        // expects result of the getFirst() function, a rx result with a type property
        // r.type === 'sheetitem'
        // negation is at r.groups.negation, but handled in calling procedure
        const itemTypeLib = {
            '@': 'attribute',
            '*': 'attribute',
            '%': 'ability'
        }
        let c = charFromAmbig(t.groups.character);
        if (!c) return;
        // standard sheet items
        if (['@', '%'].includes(t.groups.type)) {
            let sheetobj = findObjs({ type: itemTypeLib[t.groups.type], characterid: c.id })
                .filter(a => a.get('name') === t.groups.item)[0];
            return sheetobj;
        }
        // if we're still here, we're looking for a repeating item
        let p = parsePattern(t.groups.pattern);
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
        let reprx = new RegExp(`^repeating_${t.groups.section}_(?<repID>[^_]*?)_(?<suffix>.+)$`);
        let repres;
        let o = findObjs({ type: itemTypeLib[t.groups.type], characterid: c.id })
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
            let retObj = findObjs({ type: itemTypeLib[t.groups.type], characterid: c.id })
                .filter(a => a.get('name') === `repeating_${t.groups.section}_${viable[0]}_${t.groups.valuesuffix}`)[0];
            return retObj;
        }
    };
    const getSheetItemVal = (s, calledFrom = 'def') => {
        let res;
        if (calledFrom === 'def') {
            res = getfirst(s, sheetitem_standalonetm, rptgitem_standalonetm, text_standalonetm);
        } else {
            res = s;
        }

        let val = '',
            retrieve = '',
            valtotest = '';
        let o = {};
        let metavalue = true;
        if (res.type === 'text') {
            val = s;
        } else { // sheet item
            // determine what to test; also what to retrieve if another value isn't specified
            if (['@', '*'].includes(res.groups.type) && !res.groups.operation.includes('max')) {
                retrieve = 'current';
                valtotest = 'current';
            } else if (['@', '*'].includes(res.groups.type)) {
                retrieve = 'max';
                valtotest = 'max';
            } else {
                retrieve = 'action';
                valtotest = 'action';
            }
            // determine if a different retrievable field is requested
            if (res.groups.type === '*' && res.groups.operation.includes('rowname')) {
                retrieve = 'rowname';
            } else if (res.groups.type === '*' && res.groups.operation.includes('row')) {
                retrieve = 'row';
            } else if (res.groups.operation.includes('name')) {
                retrieve = 'name';
            }
            // go get the value
            o = getSheetItem(res);
            if (!o) {
                val = undefined;
                metavalue = false;
            } else {
                val = o.get(valtotest);
                for (const test in internalTestLib) {
                    if (res.groups.operation.includes(test)) {
                        metavalue = metavalue && internalTestLib[test](val);
                    }
                    if (!metavalue) {
                        val = undefined;
                        break;
                    }
                }
                if (val && ['name', 'row', 'rowname'].includes(retrieve)) {
                    val = o.get('name');
                    let row,
                        rptrx = /^repeating_([^_]+)_([^_]+)_(.*)$/i,
                        rptres;
                    switch (retrieve) {
                        case 'row':
                            val = `$${repeatingOrdinal(o.get('characterid'), undefined, o.get('name'))}`;
                            break;
                        case 'rowname':
                            row = `$${repeatingOrdinal(o.get('characterid'), undefined, o.get('name'))}`;
                            rptres = rptrx.exec(o.get('name'));
                            val = `repeating_${rptres[1]}_${row}_${rptres[3]}`;
                            break;
                        default:
                            break;
                    }
                }
            }
        }
        if (calledFrom === 'def') {
            return val ? val : ''; // account for undefined returns in a text-replacement setting
        } else {
            return [val, metavalue];
        }
    }
    // ==================================================
    //		PARSER PROCESSING
    // ==================================================
    const ifTreeParser = (preserved) => {
        let cmd = preserved.content;

        class TextToken {
            constructor() {
                this.type = 'text';
                this.value = '';
            }
        }
        class IfToken {
            constructor() {
                this.type = 'if';
                this.conditions = [];
                this.contents = [];
                this.else = {};
            }
        }
        class EvalToken {
            constructor() {
                this.type = 'eval';
                this.contents = [];
            }
        }
        class GroupToken {
            constructor() {
                this.type = 'group';
                this.name = '';
                this.contents = [];
                this.next = '';
                this.negate = false;
            }
        }
        class ConditionToken {
            constructor() {
                this.type = 'condition';
                this.contents = [];
                this.next = '';
                this.negate = false;
            }
        }

        const val = c => {
            // expects an object in the form of:
            // { cmd: text, indent: #, type: main/if/elseif/else, overallindex: #}
            let tokens = [];				// main output array
            let logcolor = 'aqua';
            let loopstop = false;
            let tokenres = {};
            let index = 0;
            let loopindex = 0;
            nestlog(`VAL BEGINS`, c.indent, logcolor);
            while (!loopstop) {
                loopindex = index;
                if (assertstart(ifrx).test(c.cmd.slice(index))) {
                    tokenres = getIfToken({ cmd: c.cmd.slice(index), indent: c.indent + 1, overallindex: c.overallindex + index });
                } else {
                    tokenres = getTextToken({ cmd: c.cmd.slice(index), indent: c.indent + 1, overallindex: c.overallindex + index });
                }
                if (tokenres) {
                    if (tokenres.error) { return tokenres; }
                    tokens.push(tokenres.token);
                    index += tokenres.index;
                }
                if (loopindex === index) {				// nothing detected, loop never ends
                    return { error: `Unexpected token at ${c.overallindex + index}.` };
                }
                loopstop = (getfirst(c.cmd.slice(index), ...endtokenregistry[c.type]).index === 0);
            }
            nestlog(`VAL ENDS`, c.indent, logcolor);
            return { tokens: tokens, index: index };
        };
        const getTextToken = (c) => {
            let logcolor = 'lawngreen';
            nestlog(`TEXT INPUT: ${c.cmd}`, c.indent, logcolor);
            let markers = [];
            c.looptype = c.looptype || '';
            switch (c.looptype) {
                case 'def':
                    markers = [defblocktm, eostm];
                    break;
                case 'eval':
                    markers = [evaltm, evalendtm, eostm];
                    break;
                default:
                    markers = [iftm, elseiftm, elsetm, endtm, eostm];
                    break;
            }
            let res = getfirst(c.cmd, ...markers);
            let index = res.index;
            let token = new TextToken();
            token.value = c.cmd.slice(0, index);
            nestlog(`TEXT KEEPS: ${token.value}`, c.indent, logcolor);
            //log(`<pre>${syntaxHighlight(token)}</pre>`);
            return { token: token, index: index };
        };
        const getIfToken = (c) => {

            // receives object in the form of:
            // {cmd: command line slice, indent: #, type: if/else}
            let logcolor = 'yellow';
            let res = getfirst(c.cmd, iftm, elseiftm, elsetm);
            // one of these should be at the 0 index position
            if (res && res.index === 0) {
                nestlog(`IF INPUT: ${c.cmd}`, c.indent, logcolor);
                let token = new IfToken();
                let index = res[0].length;

                // groups and conditions
                if (['if', 'elseif'].includes(res.type)) {
                    let condres = getConditions({ cmd: c.cmd.slice(index), indent: c.indent + 1, type: 'mainconditions', overallindex: c.overallindex + index });
                    if (condres.error) { return condres; }
                    token.conditions = condres.tokens;
                    index += condres.index;
                }

                // closing bracket of if/elseif/else tag
                let ifendres = ifendrx.exec(c.cmd.slice(index));
                if (!ifendres) {
                    return { error: `Unexpected token at ${c.overallindex + index}. Expected end of logic structure ('}'), but saw: ${c.cmd.slice(index, index + 10)}` };
                }
                index += ifendres[0].length;

                // text content and nested ifs
                nestlog(`BUILDING CONTENT: ${c.cmd.slice(index)}`, c.indent + 1, 'lightseagreen');
                let contentres = val({ cmd: c.cmd.slice(index), indent: c.indent + 2, type: res.type, overallindex: c.overallindex + index });
                if (contentres.error) return contentres;
                token.contents = contentres.tokens;
                index += contentres.index;
                nestlog(`ENDING CONTENT: ${c.cmd.slice(index)}`, c.indent + 1, 'lightseagreen');

                // else cases
                let firstelseres = getfirst(c.cmd.slice(index), ...endtokenregistry[res.type]);
                if (firstelseres && firstelseres.type !== 'end' && firstelseres.index === 0) {
                    nestlog(`BUILDING ELSE: ${c.cmd.slice(index)}`, c.indent + 1, 'lightsalmon');
                    let elseres = getIfToken({ cmd: c.cmd.slice(index), indent: c.indent + 2, type: firstelseres.type, overallindex: c.overallindex + index });
                    token.else = elseres.token || [];
                    index += elseres.index;
                    nestlog(`ENDING ELSE: ${c.cmd.slice(index)}`, c.indent + 1, 'lightsalmon');
                }
                // end token (only for full IF blocks)
                if (res.type === 'if') {
                    let endres = assertstart(endrx).exec(c.cmd.slice(index));
                    if (!endres) {
                        return { error: `Unexpected token at ${c.overallindex + index}. Expected logical structure (END), but saw: ${c.cmd.slice(index, index + 10)}` };
                    }
                    index += endres[0].length;
                }
                nestlog(`IF OUTPUT: ${JSON.stringify(token)}`, c.indent, logcolor);
                //log(`<pre>${syntaxHighlight(token)}</pre>`);
                return { token: token, index: index };
            } else {
                return { error: `Unexpected token at ${c.overallindex + index}. Expected a logic structure (IF, ELSEIF, or ELSE), but saw: ${c.cmd.slice(index, index + 10)}` };
            }
        };
        const getConditions = (c) => {
            // expects object in the form {cmd: text, indent: #, type: mainconditions/group, overallindex: #}
            let tokens = [];				// main output array
            let logcolor = 'darkorange';
            let loopstop = false;
            let tokenres = {};
            let index = 0;
            let loopindex = 0;
            nestlog(`GETCONDITIONS BEGINS`, c.indent, logcolor);
            while (!loopstop) {
                loopindex = index;
                if (groupopenrx.test(c.cmd.slice(index))) {
                    tokenres = getGroupToken({ cmd: c.cmd.slice(index), indent: c.indent + 1, overallindex: c.overallindex + index });
                } else {
                    tokenres = getConditionToken({ cmd: c.cmd.slice(index), indent: c.indent + 1, overallindex: c.overallindex + index });
                }
                if (tokenres) {
                    if (tokenres.error) return tokenres;
                    tokens.push(tokenres.token);
                    index += tokenres.index;

                }
                if (loopindex === index) {		// no token found, loop won't end
                    return { error: `Unexpected token at ${c.overallindex + index}.` };
                }
                loopstop = (getfirst(c.cmd.slice(index), ...endtokenregistry[c.type]).index === 0);
            }
            nestlog(`GETCONDITIONS ENDS`, c.indent, logcolor);
            return { tokens: tokens, index: index };
        };
        const getGroupToken = (c) => {
            let logcolor = 'violet';
            let index = 0;
            let groupres = groupopenrx.exec(c.cmd);
            if (groupres) {
                nestlog(`GROUP INPUT: ${c.cmd}`, c.indent, logcolor);
                index += groupres[0].length;
                let token = new GroupToken();
                // negation
                token.negate = !!groupres.groups.negation;
                // name
                let nameres = namerx.exec(c.cmd.slice(index));
                if (nameres) {
                    token.name = nameres.groups.groupname;
                    index += nameres[0].length;
                }

                // text content and nested groups
                nestlog(`BUILDING CONTENT: ${c.cmd.slice(index)}`, c.indent + 1, 'lightseagreen');
                let contentres = getConditions({ cmd: c.cmd.slice(index), indent: c.indent + 2, type: 'group', overallindex: c.overallindex + index });
                if (contentres) {
                    if (contentres.error) { return contentres; }
                    token.contents = contentres.tokens;
                    index += contentres.index;
                }
                nestlog(`ENDING CONTENT: ${c.cmd.slice(index)}`, c.indent + 1, 'lightseagreen');

                // closing paren of group
                let groupendres = groupendrx.exec(c.cmd.slice(index));
                if (!groupendres) {
                    return { error: `Unexpected token at ${c.overallindex + index}. Expected the end of a group but saw: ${c.cmd.slice(index, index + 10)}` };
                }
                index += groupendres[0].length;

                // connecting operator
                let operatorres = operatorrx.exec(c.cmd.slice(index));
                if (operatorres) {
                    token.next = operatorres.groups.operator;
                    index += operatorres[0].length;
                }

                nestlog(`GROUP OUTPUT: ${JSON.stringify(token)}`, c.indent, logcolor);
                //log(`<pre>${syntaxHighlight(token)}</pre>`);
                return { token: token, index: index };
            }
        };
        const getConditionToken = (c) => {
            let logcolor = 'white';
            let index = 0;
            let firstargres = getfirst(c.cmd, sheetitemtm, rptgitemtm, texttm);
            if (firstargres) {
                nestlog(`CONDITION INPUT: ${c.cmd}`, c.indent, logcolor);
                index += firstargres[0].length;
                let token = new ConditionToken();
                //        token.negate = firstargres.groups.negation;
                token.contents.push(firstargres);

                let compres = comprx.exec(c.cmd.slice(index));
                if (compres) {
                    index += compres[0].length;
                    let secondargres = getfirst(c.cmd.slice(index), sheetitemtm, rptgitemtm, texttm);
                    if (secondargres) {
                        index += secondargres[0].length;
                        token.contents.push(secondargres);

                    } else {					// comparison operator with no second arg, return an error
                        return { error: `Unexpected token at ${c.overallindex + index}. Expected a condition argument but saw: {c.cmd.slice(index, index+10)}` };
                    }
                    token.type = compres.groups.operator;

                    // connecting operator
                    let operatorres = operatorrx.exec(c.cmd.slice(index));
                    if (operatorres) {
                        token.next = operatorres.groups.operator;
                        index += operatorres[0].length;
                    }
                }
                nestlog(`CONDITION OUTPUT: ${JSON.stringify(token)}`, c.indent, logcolor);
                //log(`<pre>${syntaxHighlight(token)}</pre>`);
                return { token: token, index: index };

            } else {					// no first arg found, return an error
                return { error: `Unexpected token at ${c.overallindex + index}. Expected a condition argument but saw: {c.cmd.slice(index, index+10)}` };
            }
        };

        const getTermToken = (c) => {
            // receives object in the form of:
            // {cmd: command line slice, indent: #}
            let logcolor = 'yellow';
            let index = 0;
            let res = assertstart(definitionrx).exec(c.cmd);
            let defres;
            let definition = '';
            let valtotest = '';
            let retrieve = '';
            let o = {};
            if (res) {
                nestlog(`TERM INPUT: ${c.cmd}`, c.indent, logcolor);
                let tokens = [];
                let loopstop = false;
                while (!loopstop) {
                    definition = getSheetItemVal(res.groups.definition);
                    tokens.push({ term: res.groups.term, definition: definition });
                    nestlog(`==TERM DEFINED: ${res.groups.term} = ${res.groups.definition}`);
                    index += res[0].length;
                    res = assertstart(definitionrx).exec(c.cmd.slice(index));
                    if (!res) loopstop = true;
                }

                nestlog(`TERM OUTPUT: ${JSON.stringify(tokens)}`, c.indent, logcolor);
                return { token: tokens, index: index };
            } else {
                return { error: `Unexpected token at ${c.overallindex + index}. Expected a term and definition, but saw: ${c.cmd.slice(index, index + 10)}` };
            }
        };
        const defval = c => {
            // expects an object in the form of:
            // { cmd: text, indent: # }
            let tokens = [];				// main text output array
            let defs = [];					// main definition array
            let logcolor = 'aqua';
            let loopstop = false;
            let defendres = {};
            let tokenres = {};
            let index = 0;
            let loopindex = 0;
            nestlog(`DEFVAL BEGINS`, c.indent, logcolor);
            while (!loopstop) {
                loopindex = index;
                if (assertstart(defblockrx).test(c.cmd.slice(index))) {
                    index += assertstart(defblockrx).exec(c.cmd.slice(index))[0].length;
                    tokenres = getTermToken({ cmd: c.cmd.slice(index), indent: c.indent + 1 });
                } else {
                    tokenres = getTextToken({ cmd: c.cmd.slice(index), indent: c.indent + 1, looptype: 'def' });
                }
                if (tokenres) {
                    if (tokenres.error) { return tokenres; }
                    index += tokenres.index;
                    if (tokenres.token.type === 'text') {
                        tokens.push(tokenres.token);
                    } else {
                        defendres = ifendrx.exec(c.cmd.slice(index));
                        if (!defendres) return { error: `Unexpected token at ${c.overallindex + index}. Expected end of definition (\'}\'), but saw: ${c.cmd.slice(index, index + 10)}` };
                        index += defendres[0].length;
                        defs = [...defs, ...tokenres.token];
                    }
                }
                if (loopindex === index) {				// nothing detected, loop never ends
                    return { error: `Unexpected token at ${c.overallindex + index}.` };
                }
                loopstop = (getfirst(c.cmd.slice(index), ...endtokenregistry[c.type]).index === 0);
            }

            // get non-definitional text back into a string
            let nondeftext = [];
            tokens.forEach(t => nondeftext.push(t.value));
            let newcmd = nondeftext.join('');
            // replace all term/defs
            defs.forEach(d => {
                newcmd = newcmd.replace(new RegExp(escapeRegExp(d.term), 'g'), d.definition);
            });
            nestlog(`DEFVAL ENDS`, c.indent, logcolor);
            return { cmd: newcmd };
        };
        const getEvalToken = (c) => {
            // receives object in the form of:
            // {cmd: command line slice, indent: #, overallindex: #}
            let logcolor = 'yellow';
            let index = 0;
            let evalopenres = evalrx.exec(c.cmd);
            if (evalopenres) {
                nestlog(`EVAL INPUT: ${c.cmd}`, c.indent, logcolor);
                let token = new EvalToken();
                let index = evalopenres[0].length;

                // content and nested evals
                nestlog(`BUILDING CONTENT: ${c.cmd.slice(index)}`, c.indent + 1, 'lightseagreen');
                let contentres = evalval({ cmd: c.cmd.slice(index), indent: c.indent + 1, type: 'eval', overallindex: c.overallindex + index });
                if (contentres.error) return contentres;
                token.contents = contentres.tokens;
                index += contentres.index;
                nestlog(`ENDING CONTENT: ${c.cmd.slice(index)}`, c.indent + 1, 'lightseagreen');

                // closing bracket of eval tag
                let evalendres = evalendrx.exec(c.cmd.slice(index));
                if (!evalendres) {
                    return { error: `Unexpected token at ${c.overallindex + index}. Expected end of eval structure ('}'), but saw: ${c.cmd.slice(index, index + 10)}` };
                }
                index += evalendres[0].length;
                nestlog(`EVAL OUTPUT: ${JSON.stringify(token)}`, c.indent, logcolor);
                //log(`<pre>${syntaxHighlight(token)}</pre>`);
                return { token: token, index: index };
            } else {
                return { error: `Unexpected token at ${c.overallindex + index}. Expected an EVAL structure, but saw: ${c.cmd.slice(index, index + 10)}` };
            }

        };

        const evalval = c => {
            // expects an object in the form of:
            // { cmd: text, indent: #, overallindex: #, type: text, overallindex: # }
            let tokens = [];				// main output array
            let logcolor = 'aqua';
            let loopstop = false;
            let tokenres = {};
            let index = 0;
            let loopindex = 0;
            nestlog(`EVAL BEGINS`, c.indent, logcolor);
            while (!loopstop) {
                loopindex = index;
                if (assertstart(evalrx).test(c.cmd.slice(index))) {
                    tokenres = getEvalToken({ cmd: c.cmd.slice(index), indent: c.indent + 1, overallindex: c.overallindex + index });
                } else {
                    tokenres = getTextToken({ cmd: c.cmd.slice(index), indent: c.indent + 1, overallindex: c.overallindex + index, looptype: 'eval' });
                }
                if (tokenres) {
                    if (tokenres.error) { return tokenres; }
                    tokens.push(tokenres.token);
                    index += tokenres.index;
                }
                if (loopindex === index) {				// nothing detected, loop never ends
                    return { error: `Unexpected token at ${c.overallindex + index}.` };
                }
                loopstop = (getfirst(c.cmd.slice(index), ...endtokenregistry[c.type]).index === 0);
            }
            nestlog(`EVAL ENDS`, c.indent, logcolor);
            return { tokens: tokens, index: index };
        };
        const runPlugin = c => {
            const evalstmtrx = /^\s*(?<script>[^(\s]*)\s*\((?<args>.*?)\)/gi;
            let ret;
            let content = '';
            if (evalstmtrx.test(c)) {
                return c.replace(evalstmtrx, ((m, g1, g2) => {
                    content = `${g1} ${g2}`;
                    if (!availFuncs[g1.toLowerCase()]) {
                        sendChat('', `!${content}`);
                        return '';
                    }
                    let newmsg = _.clone(preserved);
                    newmsg.content = `!${content}`;
                    newmsg.apil = true; // provide tag for message differentiation by client script
                    ret = availFuncs[g1.toLowerCase()](newmsg);
                    return ['string', 'number', 'boolean', 'bigint'].includes(typeof ret) ? ret : '';
                }));
            } else {
                return '';
            }
        };
        const processEvals = c => {
            // expects object in the form of:
            // { tokens: [], indent: # }
            let logcolor = 'aqua';
            nestlog(`PROCESS EVALS BEGINS`, c.indent, logcolor);
            let tokens = c.tokens.reduce((m, v, i) => {
                nestlog(`==TOKEN ${i}: ${JSON.stringify(v)}`, c.indent, 'violet');
                if (v.type === 'text') {
                    nestlog(`====DETECTED TEXT: ${v.value}`, c.indent, 'lawngreen');
                    m.push(v.value);
                } else if (v.type === 'eval') {
                    nestlog(`====DETECTED EVAL`, c.indent, 'yellow');
                    m.push(runPlugin(processEvals({ tokens: v.contents, indent: c.indent + 1 }).join('')));
                }
                nestlog(`==END OF TOKEN`, c.indent, 'violet');
                return m;
            }, []);
            nestlog(`PROCESS CONTENT ENDS`, c.indent, logcolor);
            return tokens;
        };

        const checkWellFormed = (cmd) => {
            let ifarray = [],
                index = 0,
                nextstructure = getfirst(cmd, iftm, elseiftm, elsetm, endtm, eostm),
                retObj = { wellformed: true, error: '', position: 0 };
            while (index < cmd.length && retObj.wellformed) {
                index += nextstructure.index;
                switch (nextstructure.type) {
                    case 'if':
                        ifarray.push(true);
                        break;
                    case 'elseif':
                    case 'else':
                        if (!ifarray.length) {
                            retObj = { wellformed: false, error: `${nextstructure.type.toUpperCase()} without IF at position ${index}` };
                        } else {
                            if (!ifarray[ifarray.length - 1]) {
                                retObj = { wellformed: false, error: `${nextstructure.type.toUpperCase()} after ELSE at position ${index}` };
                            } else {
                                if (nextstructure.type === 'else') {
                                    ifarray[ifarray.length - 1] = false;
                                }
                            }
                        }
                        break;
                    case 'end':
                        if (!ifarray.length) {
                            retObj = { wellformed: false, error: `END without IF at position ${index}` };
                        } else {
                            ifarray.pop();
                        }
                        break;
                    case 'eos':

                        break;
                }
                if (retObj.wellformed && nextstructure.type !== 'eos') {
                    index += nextstructure[0].length;
                    nextstructure = getfirst(cmd.slice(index), iftm, elseiftm, elsetm, endtm, eostm);
                }

            }
            return retObj;
        };

        const main = (cmd) => {
            let retObj = {};
            let logrx = /{\s*&\s*log\s*(?<setting>(?:on|off)?)\s*}/ig;
            let statelog = state[apiproject].logging;
            let loclog = 'none';
            cmd = cmd.replace(logrx, ((r, g1) => {
                loclog = g1;
                return '';
            }));
            if (['on', ''].includes(loclog)) state[apiproject].logging = true;
            if (loclog === 'off') state[apiproject].logging = false;

            // EVAL BLOCK DETECTION
//            let evalcmd = evalval({ cmd: cmd, indent: 0, type: 'main', overallindex: 0 });
//            if (evalcmd.error) return { tokens: [], error: evalcmd.error };
//            evalcmd.cmd = processEvals({ tokens: evalcmd.tokens, indent: 0 }).join('');
            let evalcmd = { cmd: cmd };
            // DEFINITION BLOCK DETECTION
            let defcmd = defval({ cmd: evalcmd.cmd, indent: 0, type: 'main', overallindex: 0 });
            if (!defcmd.cmd) return { tokens: [], error: defcmd.error };
            // WELL-FORMED CHECK
            let wf = checkWellFormed(defcmd.cmd);
            if (wf.wellformed) {
                retObj = val({ cmd: defcmd.cmd, indent: 0, type: 'main', overallindex: 0 });
            } else {
                retObj = { tokens: [], error: wf.error };
            }
            if (loclog === '') state[apiproject].logging = statelog;
            return retObj;
        }
        return main(cmd);
    };

    const reconstructCommandLine = (o) => {
        const grouplib = {};
        const typeProcessor = {
            '=': (t) => t.contents[0].value == t.contents[1].value,
            '!=': (t) => t.contents[0].value != t.contents[1].value,
            '~': (t) => t.contents[0].value.includes(t.contents[1].value),
            '!~': (t) => !t.contents[0].value.includes(t.contents[1].value),
            '>': (t) => (internalTestLib.num(t.contents[0].value) ? Number(t.contents[0].value) : t.contents[0].value) > (internalTestLib.num(t.contents[1].value) ? Number(t.contents[1].value) : t.contents[1].value),
            '>=': (t) => (internalTestLib.num(t.contents[0].value) ? Number(t.contents[0].value) : t.contents[0].value) >= (internalTestLib.num(t.contents[1].value) ? Number(t.contents[1].value) : t.contents[1].value),
            '<': (t) => (internalTestLib.num(t.contents[0].value) ? Number(t.contents[0].value) : t.contents[0].value) < (internalTestLib.num(t.contents[1].value) ? Number(t.contents[1].value) : t.contents[1].value),
            '<=': (t) => (internalTestLib.num(t.contents[0].value) ? Number(t.contents[0].value) : t.contents[0].value) <= (internalTestLib.num(t.contents[1].value) ? Number(t.contents[1].value) : t.contents[1].value)
        }

        const resolveCondition = (t) => {
            // expects condition token
            // each item in t.contents should be a regex result also with a property type: 'sheetitem', 'rptgitem', 'text' 
            // t.type :: 'condition', '=', '!=', etc.
            // negation is at t.contents[#].groups.negation
            // comparable or usable text is different for text vs sheet item vs rpt item
            let o = {};
            let retrieve = '';	// retrievable field for attributes and abilities
            // internalTestLib moved to outer scope

            t.contents.forEach(item => {
                item.metavalue = true;
                switch (item.type) {
                    case 'text':
                        item.groups.argtext = item.groups.argtext.replace(/\$\[\[(\d+)]]/g, ((r, g1) => preserved.parsedinline[g1].value || 0));
                        if (grouplib.hasOwnProperty(item.groups.argtext)) {
                            if (grouplib[item.groups.argtext]) item.value = true;
                            else {
                                item.value = false;
                                item.metavalue = false;
                            }
                        } else {
                            item.value = item.groups.argtext;
                        }
                        break;
                    case 'sheetitem':
                    case 'rptgitem':	// intended fall-through
                        [item.value, item.metavalue] = getSheetItemVal(item, 'condition');
                        break;
                }
                if (item.groups.negation === '!') {
                    item.value = !item.value;
                    item.metavalue = !item.metavalue;
                }
            })
            if (t.type === 'condition') {
                // single arg tests: exists, is integer, named condition, etc.
                t.value = t.contents[0].metavalue && t.contents[0].value;
                return t;
            } else {
                // two arg tests: =, !=, >, etc.
                t.value = t.contents[0].metavalue && typeProcessor[t.type](t);
            }
            return t;
        };

        const areConditionsTruthy = c => {
            // expects conditions array
            let logcolor = 'lightseagreen';
            let groupname = '';
            let negate = false;
            nestlog(`CONDITIONS TEST BEGINS`, c.indent, logcolor);
            let o = c.tokens.reduce((m, v, i) => {
                if ((!m.value && m.next === '&&') || (m.value && m.next === '||')) {
                    nestlog(`==TEST SKIPPED`, c.indent, logcolor);
                } else {
                    if (v.type === 'group') {
                        nestlog(`==AND-GROUP DETECTED: ${v.name || 'no name'}`, c.indent, logcolor);
                        groupname = v.name;
                        negate = v.negate;
                        v = areConditionsTruthy({ tokens: v.contents, indent: c.indent + 1 });
                        if (groupname) {
                            grouplib[groupname] = v.value;
                        }
                        if (negate) v.value = !v.value;
                    } else {
                        nestlog(`==AND-CONDITION DETECTED: lhs>${v.contents[0]} type>${v.type} rhs>${v.contents[1] || ''}`, c.indent, logcolor);
                        v = resolveCondition(v);
                    }
                    nestlog(`==VALUE: ${v.value}`, c.indent, logcolor);
                    m.value = m.next === '&&' ? m.value && v.value : m.value || v.value;
                }
                nestlog(`==LOOP END MEMO VALUE: ${m.value}, ${m.next}`, c.indent, logcolor);
                m.next = v.next;
                return m;
            }, { value: false, next: '||' });

            nestlog(`CONDITION TEST ENDS: Conditions are ${o.value}, ${o.next}`, c.indent, logcolor);
            return o;
        };

        const processContents = c => {
            // expects contents array
            let logcolor = 'aqua';
            nestlog(`PROCESS CONTENT BEGINS`, c.indent, logcolor);
            let tokens = c.tokens.reduce((m, v, i) => {
                nestlog(`==TOKEN ${i}: ${JSON.stringify(v)}`, c.indent, 'violet');
                if (v.type === 'text') {
                    nestlog(`====DETECTED TEXT: ${v.value}`, c.indent, 'lawngreen');
                    m.push(v.value);
                } else if (v.type === 'if') {
                    nestlog(`====DETECTED IF`, c.indent, 'yellow');
                    if (!v.conditions.length || areConditionsTruthy({ tokens: v.conditions, indent: c.indent + 1 }).value) {
                        nestlog(`======TRUE CASE`, c.indent, 'darkorange');
                        m.push(processContents({ tokens: v.contents, indent: c.indent + 1 }).join(''));
                    } else if (v.else) {
                        nestlog(`======TESTING ELSE CASE`, c.indent, 'darkorange');
                        m.push(processContents({ tokens: [v.else], indent: c.indent + 1 }).join(''));
                    }
                }
                nestlog(`==END OF TOKEN`, c.indent, 'violet');
                return m;
            }, []);
            nestlog(`PROCESS CONTENT ENDS`, c.indent, logcolor);
            return tokens;
        };
        let content = processContents({ tokens: o.tokens, indent: 0 }).join('');
        return { content: content, logicgroups: grouplib };
    };

    const nestedInline = (preserved) => {
        let ores,
            ires,
            c = '',
            index = 0,
            nestedindexarray = [],
            nestedlvl = 0,
            outeropenrx = /(?<!\$)\[\[/,
            inneropenrx = /\$\[\[/,
            inlinecloserx = /]]/,
            nestedrx = /^\$\[\[(\d+)]]/,
            outertm = { rx: outeropenrx, type: 'outer' },
            innertm = { rx: inneropenrx, type: 'inner' },
            inlineclosetm = { rx: inlinecloserx, type: 'close' },
            eostm = { rx: /$/, type: 'eos' };

        while (index < preserved.content.length) {
            c = preserved.content.slice(index);
            ores = getfirst(c, outertm, innertm, inlineclosetm, eostm);
            switch (ores.type) {
                case 'eos':
                    index = preserved.content.length;
                    break;
                case 'inner':
                    index += ores.index;
                    ires = nestedrx.exec(preserved.content.slice(index));
                    if (ires) {
                        // using unshift orders them in descending order
                        if (nestedlvl > 0) nestedindexarray.unshift({ index: index, value: preserved.parsedinline[ires[1]].value, replacestring: ires[0] });
                        index += ires[0].length;
                    } else {
                        // this would probably indicate an error -- something like $[[NaN]]
                        index += ores[0].length;
                    }
                    break;
                case 'outer':
                    nestedlvl++;
                    index += ores.index + ores[0].length;
                    break;
                case 'close':
                    nestedlvl--;
                    index += ores.index + ores[0].length;
                    break;
            }
        }
        //since we are working in descending order, all of our indices will survive the replacement operation
        nestedindexarray.forEach(r => {
            preserved.content = `${preserved.content.slice(0, r.index)}${r.value}${preserved.content.slice(r.index + r.replacestring.length, preserved.content.length)}`;
        });
        return preserved.content;
    };

    const getValues = (preserved) => {
        // replace inline rolls tagged with .value
        preserved.content = preserved.content.replace(valuerx, ((r, g1) => {
            preserved.inlinerolls = preserved.inlinerolls || [];
            if (preserved.inlinerolls.length > g1) {
                return preserved.parsedinline[g1].value;
            } else {
                return '0';
            }
        }));
    }

    // ==================================================
    //		SCRIPT PLUGINS
    // ==================================================
    const availFuncs = {
        getme: (m) => { return m.who; },
        getsheetitem: (m) => {
            let item = m.content.slice(m.content.indexOf(' ') + 1);
            return (sheetitem_standalonerx.test(item) || rptgitem_standalonerx.test(item)) ? getSheetItemVal(item) : '';
        }
    };
    const registerRule = (...r) => { // pass in a list of functions to get them registered to the availFuncs library
        r.forEach(f => {
            if (f.name) {
                if (availFuncs[f.name.toLowerCase()]) {
                    log(`APILogic Function Registration: Name collision detected for ${f.name}. Last one loaded will win.`);
                    delete availHelp[f.name.toLowerCase()];
                }
                availFuncs[f.name.toLowerCase()] = f;
            }
        });
    };

    // ==================================================
    //		HANDLE INPUT
    // ==================================================
    const handleInput = (msg) => {
        const testConstructs = (c) => (ifrx.test(c) || defblockrx.test(c) );
        const trigrx = new RegExp(`^!(${Object.keys(preservedMsgObj).join('|')})`);
        let preserved,
            apitrigger; // the apitrigger used by the message
        if (!msg.type === 'api') return;
        if (Object.keys(preservedMsgObj).length && trigrx.test(msg.content)) { // check all active apitriggers in play
            apitrigger = trigrx.exec(msg.content)[1];
            preserved = preservedMsgObj[apitrigger];
            if (msg.inlinerolls) {
                preserved.inlinerolls = preserved.inlinerolls || [];
                // insert inline rolls to preserved message, correct the placeholder shorthand index
                msg.inlinerolls.forEach((r, i) => {
                    preserved.inlinerolls.push(r);
                    msg.content = msg.content.replace(new RegExp(`\\$\\[\\[(${i})]]`, 'g'), `$[[${preserved.inlinerolls.length - 1}]]`);
                });
                preserved.parsedinline = [...(preserved.parsedinline || []), ...libInline.getRollData(msg)];
            } else {    // no inlineroll array
                if (!testConstructs(msg.content)) { // we're on our way out of the script, format everything and release message
                    // replace all APIL formatted inline roll shorthand markers with roll20 formatted shorthand markers
                    msg.content = msg.content.replace(/{&(\d+)}/g, `$[[$1]]`);
                    // copy over new message command line to preserved message after removing the apitrigger
                    preserved.content = msg.content.replace(apitrigger, '');
                    // check for STOP tag
                    if (preserved.content.match(stoprx)) {
                        preserved.content = '';
                        return;
                    }
                    // replace inline rolls tagged with .value
                    getValues(preserved);
                    // check for SIMPLE tag
                    if (preserved.content.match(simplerx)) {
                        preserved.content = preserved.content.replace(/^!\s*/, '').replace(simplerx, '');
                        preserved.content = preserved.content.replace(/\$\[\[(\d+)]]/g, ((m, g1) => preserved.parsedinline[g1].getRollTip()));
                        let speakas = '';
                        if (preserved.who.toLowerCase() === 'api') {
                            speakas = '';
                        } else {
                            speakas = (findObjs({ type: 'character' }).filter(c => c.get('name') === preserved.who)[0] || { id: '' }).id;
                            if (speakas) speakas = `character|${speakas}`;
                            else speakas = `player|${preserved.playerid}`;
                        }
                        sendChat(speakas, preserved.content);
                        delete preservedMsgObj[apitrigger];
                        return;
                    }
                    // release the message to other scripts (FINAL OUTPUT)
                    Object.keys(preserved).forEach(k => msg[k] = preserved[k]);
                    delete preservedMsgObj[apitrigger];
                    return;
                }
            }
            preserved.content = msg.content;
        } else {    // not prepended with apitrigger
            if (!testConstructs(msg.content)) return;
            apitrigger = `${apiproject}${generateUUID()}`;
            preservedMsgObj[apitrigger] = _.clone(msg);
            preserved = preservedMsgObj[apitrigger];
            preserved.logicgroups = {};
            preserved.content = `!${apitrigger}${preserved.content.slice(1)}`;
            preserved.parsedinline = msg.inlinerolls ? libInline.getRollData(msg) : [];
            msg.content = ``;
        }

        if (testConstructs(preserved.content)) {
            // replace inline rolls tagged with .value
            getValues(preserved);

            let o = ifTreeParser(preserved);
            if (o.error) {
                log(o.error);
                log(preserved.content);
                return;
            }
            if (o.tokens) {
                // reconstruct command line
                o.logicgroups = preserved.logicgroups;
                let reconstruct = reconstructCommandLine(o);
                preserved.content = reconstruct.content;
                preserved.logicgroups = reconstruct.logicgroups;
            } else {
                log('Unexpected error encountered. Unable to reconstruct command line.');
                return;
            }
        }
        // replace inline rolls tagged with .value
        getValues(preserved);
        // un-escape characters
        preserved.content = preserved.content.replace(/\\(.)/gm, "$1");
        // convert nested inline rolls to value
        preserved.content = nestedInline(preserved);
        // replace other inline roll markers with [&#] formation
        preserved.content = preserved.content.replace(/\$\[\[(\d+)]]/g, `{&$1}`);
        // properly format rolls that would normally fail in the API (but work in chat)
        preserved.content = preserved.content.replace(/\[\[\s+/g, '[[');
        // send new command line through chat
        sendChat('', preserved.content);
        return;
    };
    on('chat:message', handleInput);

    on('ready', () => {
        state[apiproject] = state[apiproject] || { logging: false };
        versionInfo();
        logsig();
    });

    return {
        RegisterRule: registerRule
    }
})();
{ try { throw new Error(''); } catch (e) { API_Meta.APILogic.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.APILogic.offset); } }
