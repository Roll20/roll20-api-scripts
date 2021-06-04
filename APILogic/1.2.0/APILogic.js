/*
=========================================================
Name			:	APILogic
GitHub			:	https://github.com/TimRohr22/Cauldron/tree/master/APILogic
Roll20 Contact	:	timmaugh
Version			:	1.2.0
Last Update		:	3/8/2021
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
    API_Meta[apiproject].version = '1.2.0';
    const vd = new Date(1615216126292);
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
        evalendrx = /{&\s*\/\s*eval\s*}/i,
        eval1rx = /{&\s*eval-\s*}/i,
        eval1endrx = /{&\s*\/\s*eval-\s*}/i;
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
    // MULE REGEXES =========================================
    const varrx = /^([^\s.=]+)\s*=\s*(.+)/,
        getrx = /get\.([^.]+\.[^\s.]+?\.[^\s\W.]+|[^\s\W]+)\b/gmi,
        setrx = /set\.((?:[^\s]+?|.+\.[^\s]+?\.[^\s]+)\s*=\s*.+?)\s*\/set/gmi,
        mulerx = /{&\s*mule\s*(.*?)\s*}/gi,
        muleabilrx = /\s*\((.*?)\)\s*/g;
    // MATH REGEXES =========================================
    const mathrx = /{&\s*math\s*([^}]+)\s*}/g;

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
        text_standalonetm = { rx: text_standalonerx, type: 'text' },
        defblocktm = { rx: defblockrx, type: 'defblock' },
        evaltm = { rx: evalrx, type: 'eval' },
        evalendtm = { rx: evalendrx, type: 'evalend' },
        eval1tm = { rx: eval1rx, type: 'eval' },
        eval1endtm = { rx: eval1endrx, type: 'evalend' };

    // END TOKEN REGISTRY ===================================
    const endtokenregistry = {
        main: [eostm],
        if: [elseiftm, elsetm, endtm],
        elseif: [elseiftm, elsetm, endtm],
        else: [endtm],
        mainconditions: [ifendtm],
        group: [groupendtm],
        eval: [evalendtm],
        eval1: [eval1endtm]
    };

    // TAG RX SETS REGISTRY ===================================
    const tagrxset = {
        'eval': { opentag: evalrx, endtag: evalendrx },
        'eval1': { opentag: eval1rx, endtag: eval1endrx }
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

    const charFromAmbig = (query,pid) => { // find a character where info is an identifying piece of information (id, name, or token id)
        let character;
        let qrx = new RegExp(escapeRegExp(query), 'i');
        let charsIControl = findObjs({ type: 'character' })
            .filter(c => c.get('controlledby').split(',').includes(pid));
        character = charsIControl.filter(c => c.id === query)[0] ||
            charsIControl.filter(c => c.id === (getObj('graphic', query) || { get: () => { return '' } }).get('represents'))[0] ||
            charsIControl.filter(c => c.get('name') === query)[0] ||
            charsIControl.filter(c => qrx.test(c)).reduce((m, v) => {
                let d = getEditDistance(query, v);
                return !m.length || d < m[1] ? [v, d] : m;
            }, [])[0];
        return character;
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

    const getSheetItem = (t, pid) => {
        // expects result of the getFirst() function, a rx result with a type property
        // r.type === 'sheetitem'
        // negation is at r.groups.negation, but handled in calling procedure
        const itemTypeLib = {
            '@': 'attribute',
            '*': 'attribute',
            '%': 'ability'
        }
        let c = charFromAmbig(t.groups.character, pid);
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
    const getSheetItemVal = (s, calledFrom, pid) => {
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
            o = getSheetItem(res,pid);
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
    //      MATH OPERATIONS
    // ==================================================
    const mathops = (() => {
        const tokenize = code => {
            let results = [];
            let tokenRegExp = /\s*([A-Za-z\s'"`]+|-?[0-9]+(\.[0-9]+)?|\S)\s*/g;

            let m;
            while ((m = tokenRegExp.exec(code)) !== null)
                results.push(m[1]);
            return results;
        };

        const isNumber = token => {
            return token !== undefined && token.match(/^-?[0-9]*.?[0-9]+$/) !== null;
        };

        const isName = token => {
            return token !== undefined && token.match(/^[A-Za-z\s'"`]+$/) !== null;
        };

        const parse = o => {
            let tokens = tokenize(o.code);
            let position = 0;
            const peek = () => {
                return tokens[position];
            };
            const peek1 = () => {
                if (position < tokens.length - 1) {
                    return tokens[position + 1];
                }
            };

            const consume = token => {
                position++;
            };

            const parsePrimaryExpr = () => {
                let t = peek();

                if (isNumber(t)) {
                    consume(t);
                    return { type: "number", value: t };
                } else if (isName(t)) {
                    if (funcbank.hasOwnProperty(t.toLowerCase()) && peek1() === '(') {
                        let f = t.toLowerCase();
                        let p = [];
                        consume(t);
                        consume('(');
                        while (peek() !== ')') {
                            if (peek() === ',') {
                                consume(',');
                            } else {
                                p.push(parseExpr());
                            }
                        }
                        if (peek() !== ")") throw new SyntaxError("expected )");
                        consume(')');
                        return { type: 'func', func: f, params: p };
                    } else {
                        consume(t);
                        return { type: "name", id: t };
                    }
                } else if (t === "(") {
                    consume(t);
                    let expr = parseExpr();
                    if (peek() !== ")") throw new SyntaxError("expected )");
                    consume(")");
                    return expr;
                } else {
                    throw new SyntaxError("expected a number, a variable, or parentheses");
                }
            };

            const parseMulExpr = () => {
                let expr = parsePrimaryExpr();
                let t = peek();
                while (t === "*" || t === "/" || t === "%") {
                    consume(t);
                    let rhs = parsePrimaryExpr();
                    expr = { type: t, left: expr, right: rhs };
                    t = peek();
                }
                return expr;
            };
            const parseExpr = () => {
                let expr = parseMulExpr();
                let t = peek();
                while (t === "+" || t === "-") {
                    consume(t);
                    let rhs = parseMulExpr();
                    expr = { type: t, left: expr, right: rhs };
                    t = peek();
                }
                return expr;
            };
            let result = parseExpr();
            if (position !== tokens.length) throw new SyntaxError("unexpected '" + peek() + "'");
            return result;
        };
        const funcbank = {
            abs: Math.abs,
            min: Math.min,
            max: Math.max,
            acos: Math.acos,
            acosh: Math.acosh,
            asin: Math.asin,
            asinh: Math.asinh,
            atan: Math.atan,
            atanh: Math.atanh,
            atantwo: Math.atan2,
            cbrt: Math.cbrt,
            ceiling: Math.ceil,
            cos: Math.cos,
            cosh: Math.cosh,
            exp: Math.exp,
            expmone: Math.expm1,
            floor: Math.floor,
            hypot: Math.hypot,
            log: Math.log,
            logonep: Math.log1p,
            logten: Math.log10,
            logtwo: Math.log2,
            pow: (v, e = 1) => Math.pow(v, e),
            rand: Math.random,
            randb: (v1, v2) => { return Math.random() * (Math.max(v1, v2) - Math.min(v1, v2) + 1) + Math.min(v1, v2) },
            randib: (v1, v2) => {
                let min = Math.ceil(Math.min(v1, v2));
                let max = Math.floor(Math.max(v1, v2));
                return Math.floor(Math.random() * (max - min) + min);
            },
            randa: (...v) => v[Math.floor(Math.random() * v.length)],
            round: (v, d = 0) => Math.round(v * 10 ** d) / 10 ** d,
            sin: Math.sin,
            sinh: Math.sinh,
            sqrt: Math.sqrt,
            tan: Math.tan,
            tanh: Math.tanh,
            trunc: Math.trunc
        };
        const knownbank = {
            e: Math.E,
            pi: Math.PI,
            lntwo: Math.LN2,
            lnten: Math.LN10,
            logtwoe: Math.LOG2E,
            logtene: Math.LOG10E
        }
        const isNum = (v) => +v === +v;
        const typeprocessor = {
            '-': (a, b) => { return isNum(a) && isNum(b) ? Number(a) - Number(b) : `${a}-${b}`; },
            '+': (a, b) => { return isNum(a) && isNum(b) ? Number(a) + Number(b) : `${a}+${b}`; },
            '/': (a, b) => { return isNum(a) && isNum(b) ? Number(a) / Number(b) : `${a}/${b}`; },
            '*': (a, b) => { return isNum(a) && isNum(b) ? Number(a) * Number(b) : `${a}*${b}`; },
            '%': (a, b) => { return isNum(a) && isNum(b) ? Number(a) % Number(b) : `${a}%${b}`; }
        };
        const isString = (s) => 'string' === typeof s || s instanceof String;
        const evalops = o => {
            if (!o.code || !isString(o.code)) return;
            o.known = o.known || {};
            Object.assign(o.known, knownbank);
            try {
                const getVal = t => {
                    switch (t.type) {
                        case 'number':
                            return t.value;
                        case 'name':
                            return o.known[t.id] || t.id;
                        case 'func':
                            return funcbank[t.func](...t.params.map(p => getVal(p)));
                        default:
                            return typeprocessor[t.type](getVal(t.left), getVal(t.right));
                    }
                };
                return getVal(parse(o));
            } catch (error) {
                return error;
            }
        };
        return evalops;
    })();
    const runMathOps = (preserved) => {
        preserved.content = preserved.content.replace(mathrx, (m, g1) => {
            g1 = g1.replace(/\$\[\[(\d+)]]/g, ((m1, g1_1) => preserved.parsedinline[g1_1].value));
            let result = mathops({ code: g1, known: preserved.variables });
            if (result.message) { // error
                sendChat('', `/w "${preserved.who}" MATH OPS ERROR: ${result.message}`);
                return '';
            } else {
                return result
            }
        });
    };
    // ==================================================
    //      MULE PROCESSING
    // ==================================================
    const mulegetter = (preserved) => {

        let variables = preserved.variables;
        mulerx.lastIndex = 0;
        if (mulerx.test(preserved.content)) {
            mulerx.lastIndex = 0;
            let characters = findObjs({ type: 'character' })
                .filter(c => c.get('controlledby').split(',').includes(preserved.playerid));

            let mulearray = [];
            preserved.content = preserved.content.replace(mulerx, (m, g1) => {
                g1 = g1.replace(muleabilrx, (m1, m1g1) => {
                    mulearray.push(m1g1);
                    return '';
                });
                g1.split(/\s+/).forEach(a => mulearray.push(a));
                return '';
            });
            let charids = characters.map(c => c.id);
            let vararray = [];
            let mules = []; // new mules in this pass
            mulearray.forEach(m => {
                let mchar;
                if (/\./.test(m)) {
                    mchar = charFromAmbig(m.slice(0, m.indexOf('.')), preserved.playerid);
                    mchar = charids.includes(mchar.id) ? mchar : undefined;
                }
                if (mchar) {
                    mules.push(findObjs({ type: 'ability', name: m.slice(m.indexOf('.') + 1), characterid: mchar.id })[0]);
                } else {
                    mules.push(findObjs({ type: 'ability', name: m }).filter(a => charids.includes(a.get('characterid')))[0]);
                }
            });

            mules = mules.filter(a => a);
            mules.forEach(a => {
                preserved.mules.push(a);
                let achar = characters.filter(c => c.id === a.get('characterid'))[0];
                a.localaction = a.get('action');
                a.localaction
                    .split('\n')
                    .filter(v => varrx.test(v))
                    .forEach(v => {
                        let k = varrx.exec(v);
                        vararray.push([k[1], k[2]]);
                        vararray.push([`${a.get('name')}.${k[1]}`, k[2]]);
                        vararray.push([`${achar.get('name')}.${a.get('name')}.${k[1]}`, k[2]]);
                    });
                Object.assign(variables, Object.fromEntries(vararray));
            });
            console.log(JSON.stringify(variables, undefined, 2));
        }
        preserved.content = preserved.content.replace(getrx, (m, gvar) => {
            let gchar, gmule;
            let dotcount = gvar.split('').filter(l => l === '.').length;
            if (dotcount > 1) {
                [gchar, gmule, ...gvar] = gvar.split('.');
                if (dotcount > 2) gvar = gvar.join('.');
                gchar = (charFromAmbig(gchar, preserved.playerid) || {
                    get: () => { return gchar }
                }).get('name');
                gvar = `${gchar}.${gmule}.${gvar}`;
            }
            return variables[gvar] || `${gvar}`; // remove the `get.` so we don't trigger infinite loops of processing
        });
    };
    const mulesetter = (preserved) => {
        let characters = findObjs({ type: 'character' })
            .filter(c => c.get('controlledby').split(',').includes(preserved.playerid));
        let charids = characters.map(c => c.id);

        preserved.content = preserved.content.replace(setrx, (m, g1) => {
            let setres = /\s*=\s*/.exec(g1);
            let [svar, sval] = [g1.slice(0, setres.index), g1.slice(setres.index + setres[0].length)];
            let schar, smule;
            let dotcount = svar.split('').filter(l => l === '.').length;
            switch (dotcount) {
                case 0:
                    break;
                case 1:
                    [smule, svar] = svar.split('.');
                    break;
                default:
                    [schar, smule, ...svar] = svar.split('.');
                    svar = svar.join('.');
                    break;
            }

            //schar = charFromAmbig(schar || charids[0], preserved.playerid);

            // write new value back to mule ability
            let svarrx = new RegExp(`^${escapeRegExp(svar)}\\s*=.+$`, 'm');
            if (smule) { // mule declared, create if doesn't exist
                if (!schar) {
                    schar = charFromAmbig(charids[0], preserved.playerid);
                    smule = preserved.mules.filter(m => m.get('name') === smule) || [createObj('ability', { characterid: schar.id, name: smule })];
                } else {
                    schar = charFromAmbig(schar, preserved.playerid);
                    smule = preserved.mules.filter(m => m.get('name') === smule && m.get('characterid') === schar.id) || [createObj('ability', { characterid: schar.id, name: smule })];
                }
            } else { // no mule declared, so we have to find if the variable exists
                smule = preserved.mules.filter(m => svarrx.test(m.localaction));
                smule = smule.length ? smule : preserved.mules;
            }
            let vararray = [];
            smule.forEach(m => {
                if (svarrx.test(m.localaction)) {    // existing variable in known mule
                    m.localaction = m.localaction.replace(svarrx, `${svar}=${sval}`);
                } else { // no text in the action, or it's missing this variable
                    m.localaction = `${m.localaction}\n${svar}=${sval}`;
                }
                m.set({ action: m.localaction });
                vararray.push([svar, sval]);
                vararray.push([`${m.get('name')}.${svar}`, sval]);
                vararray.push([`${charFromAmbig(m.get('characterid'), preserved.playerid).get('name')}.${m.get('name')}.${svar}`, sval]);
            });
            Object.assign(preserved.variables, Object.fromEntries(vararray));

            return '';
        });
    };

    // ==================================================
    //		PARSER PROCESSING
    // ==================================================
    const ifTreeParser = (preserved) => {

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
                case 'eval1':
                    markers = [eval1tm, eval1endtm, eostm];
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
                    definition = getSheetItemVal(res.groups.definition,'def', preserved.playerid);
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
            // {cmd: command line slice, indent: #, overallindex: #, looptype: text}
            let logcolor = 'yellow';
            let index = 0;
            let evalopenres = tagrxset[c.looptype].opentag.exec(c.cmd);
            if (evalopenres) {
                nestlog(`${c.looptype.toUpperCase()} TOKEN INPUT: ${c.cmd}`, c.indent, logcolor);
                let token = new EvalToken();
                let index = evalopenres[0].length;

                // content and nested evals
                nestlog(`BUILDING CONTENT: ${c.cmd.slice(index)}`, c.indent + 1, 'lightseagreen');
                let contentres = evalval({ cmd: c.cmd.slice(index), indent: c.indent + 1, type: c.looptype, overallindex: c.overallindex + index, looptype: c.looptype });
                if (contentres.error) return contentres;
                token.contents = contentres.tokens;
                index += contentres.index;
                nestlog(`ENDING CONTENT: ${c.cmd.slice(index)}`, c.indent + 1, 'lightseagreen');

                // closing bracket of eval tag
                let evalendres = tagrxset[c.looptype].endtag.exec(c.cmd.slice(index));
                if (!evalendres) {
                    return { error: `Unexpected token at ${c.overallindex + index}. Expected end of ${c.looptype.toUpperCase()} structure ('{& eval}'), but saw: ${c.cmd.slice(index, index + 10)}` };
                }
                index += evalendres[0].length;
                nestlog(`${c.looptype.toUpperCase()} TOKEN OUTPUT: ${JSON.stringify(token)}`, c.indent, logcolor);
                //log(`<pre>${syntaxHighlight(token)}</pre>`);
                return { token: token, index: index };
            } else {
                return { error: `Unexpected token at ${c.overallindex + index}. Expected an ${c.looptype.toUpperCase()} structure, but saw: ${c.cmd.slice(index, index + 10)}` };
            }

        };
        const evalval = c => {
            // expects an object in the form of:
            // { cmd: text, indent: #, overallindex: #, type: text, overallindex: #, looptype: text }
            let tokens = [];				// main output array
            let logcolor = 'aqua';
            let loopstop = false;
            let tokenres = {};
            let index = 0;
            let loopindex = 0;
            nestlog(`${c.looptype.toUpperCase()} BEGINS`, c.indent, logcolor);
            while (!loopstop) {
                loopindex = index;
                if (assertstart(tagrxset[c.looptype].opentag).test(c.cmd.slice(index))) {
                    tokenres = getEvalToken({ cmd: c.cmd.slice(index), indent: c.indent + 1, overallindex: c.overallindex + index, looptype: c.looptype });
                } else {
                    tokenres = getTextToken({ cmd: c.cmd.slice(index), indent: c.indent + 1, overallindex: c.overallindex + index, looptype: c.looptype });
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
            nestlog(`${c.looptype.toUpperCase()} ENDS`, c.indent, logcolor);
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
                sendChat('', `!${c.replace(/^!/,'')}`);
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

        const main = (preserved) => {
            let retObj = {};
            let logrx = /{\s*&\s*log\s*(?<setting>(?:on|off)?)\s*}/ig;
            let statelog = state[apiproject].logging;
            let loclog = 'none';
            preserved.content = preserved.content.replace(logrx, ((r, g1) => {
                loclog = g1;
                return '';
            }));
            if (['on', ''].includes(loclog)) state[apiproject].logging = true;
            if (loclog === 'off') state[apiproject].logging = false;

            // EVAL BLOCK DETECTION
            let evalcmd = evalval({ cmd: preserved.content, indent: 0, type: 'main', overallindex: 0, looptype: 'eval' });
            if (evalcmd.error) return { tokens: [], error: evalcmd.error };
            evalcmd.cmd = processEvals({ tokens: evalcmd.tokens, indent: 0 }).join('');
            // DEFINITION BLOCK DETECTION
            let defcmd = defval({ cmd: evalcmd.cmd, indent: 0, type: 'main', overallindex: 0 });
            if (!defcmd.cmd) return { tokens: [], error: defcmd.error };
            // EVAL- BLOCK DETECTION
            evalcmd = evalval({ cmd: defcmd.cmd, indent: 0, type: 'main', overallindex: 0, looptype: 'eval1' });
            if (evalcmd.error) return { tokens: [], error: evalcmd.error };
            evalcmd.cmd = processEvals({ tokens: evalcmd.tokens, indent: 0 }).join('');
            // WELL-FORMED CHECK
            let wf = checkWellFormed(evalcmd.cmd);
            if (!wf.wellformed) return { tokens: [], error: wf.error };
            // LOGIC PARSING
            retObj = val({ cmd: evalcmd.cmd, indent: 0, type: 'main', overallindex: 0 });

            if (loclog === '') state[apiproject].logging = statelog;
            return retObj;
        }
        return main(preserved);
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
            // internalTestLib moved to outer scope

            t.contents.forEach(item => {
                item.metavalue = true;
                switch (item.type) {
                    case 'text':
                        item.groups.argtext = item.groups.argtext.replace(/\$\[\[(\d+)]]/g, ((r, g1) => o.parsedinline[g1].value || 0));
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
                        [item.value, item.metavalue] = getSheetItemVal(item, 'condition', o.playerid);
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
    const availFuncs = {};
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
    //      TEST CONSTRUCTS
    // ==================================================
    const testConstructs = (c) => {
        let result = ifrx.test(c) || defblockrx.test(c) || evalrx.test(c) || eval1rx.test(c) || mulerx.test(c) || mathrx.test(c);
        ifrx.lastIndex = 0;
        defblockrx.lastIndex = 0;
        evalrx.lastIndex = 0;
        eval1rx.lastIndex = 0;
        mulerx.lastIndex = 0;
        mathrx.lastIndex = 0;

        return result;
    };
    const testSecondaryPass = (p, m) => {
        let result = (Object.keys(p.variables).length && (setrx.test(m.content) || getrx.test(m.content)));
        setrx.lastIndex = 0;
        getrx.lastIndex = 0;
        return result;
    };

    // ==================================================
    //		HANDLE INPUT
    // ==================================================
    const handleInput = (msg) => {
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
                if (!testConstructs(msg.content) && !testSecondaryPass(preserved, msg)) { // we're on our way out of the script, format everything and release message
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
                    setTimeout(() => { delete preservedMsgObj[apitrigger] }, 1000);
                    return;
                }
            }
            preserved.content = msg.content;
        } else {    // not prepended with apitrigger
            if (!testConstructs(msg.content)) return;
            apitrigger = `${apiproject}${generateUUID()}`;
            preservedMsgObj[apitrigger] = _.clone(msg);
            preserved = preservedMsgObj[apitrigger];
            preserved.content = preserved.content.replace(/<br\/>\n/g, ' ').replace(/^!(\{\{(.*)\}\})/, '!$2');
            preserved.logicgroups = {};
            preserved.variables = {};
            preserved.mules = [];
            preserved.content = `!${apitrigger}${preserved.content.slice(1)}`;
            preserved.parsedinline = msg.inlinerolls ? libInline.getRollData(msg) : [];
            msg.content = ``;
        }

        if (testConstructs(preserved.content) || testSecondaryPass(preserved, preserved)) {
            // replace inline rolls tagged with .value
            getValues(preserved);
            // mule detection and get resolution
            mulegetter(preserved);
            // math detection
            runMathOps(preserved);

            let o = ifTreeParser(preserved);
            if (o.error) {
                log(o.error);
                log(preserved.content);
                return;
            }
            if (o.tokens) {
                // reconstruct command line
                o.playerid = preserved.playerid;
                o.logicgroups = preserved.logicgroups;
                o.parsedinline = preserved.parsedinline || [];
                let reconstruct = reconstructCommandLine(o);
                preserved.content = reconstruct.content;
                preserved.logicgroups = reconstruct.logicgroups;
                // variable setting
                mulesetter(preserved);
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
const APILPlugins01 = (() => {
    // ==================================================
    //		VERSION
    // ==================================================
    const apiproject = 'APILPlugins01';
    API_Meta[apiproject].version = '0.0.1';
    const vd = new Date(1615216020193);
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

    const getDiceByVal = (m) => {
        // expected syntax: !getDiceByVal $[[0]] <=2|6-7|>10 count/total/list|delim
        let [rollmarker, valparams, op = 'count'] = m.content.split(/\s+/g).slice(1);
        if (!rollmarker || !valparams) { log(`getDiceByVal: wrong number of arguments, expected 3`); return; }
        const typeProcessor = {
            '!=': (r, t) => r != t,
            '>': (r, t) => r > t,
            '>=': (r, t) => r >= t,
            '<': (r, t) => r < t,
            '<=': (r, t) => r <= t,
            '-': (r, l, h) => r >= l && r <= h,
            '=': (r, t) => r == t
        };
        let delim;
        [op, ...delim] = op.split(/\|/);
        delim = delim.join('|');
        delim = /^('|"|`){0,1}(.*)?\1$/.exec(delim)[2] || '';

        let roll = (/\$\[\[(\d+)]]/.exec(rollmarker) || ['', ''])[1];
        if (roll === '') return '0';
        let searchdicerx = /^((?<low>\d+)-(?<high>\d+))|((?<range>!=|>=|<=|>|<*)(?<singleval>\d+))$/;
        let res;
        let tests = valparams.split('|').map(p => {
            res = searchdicerx.exec(p);
            return res.groups.low ?
                {
                    test: '-',
                    params: [res.groups.low, res.groups.high]
                } :
                {
                    test: res.groups.range || '=',
                    params: [res.groups.singleval]
                };
        });
        let dice = (m.parsedinline[roll] || { getDice: () => [] }).getDice('included')
            .filter(d => {
                return tests.reduce((m, t) => {
                    return m || typeProcessor[t.test](d, ...t.params)
                }, false);
            });
        switch (op) {
            case 'list':
                return dice.join(delim || '');
            case 'total':
                return dice.reduce((a, b) => (isNaN(a) ? 0 : a) + (isNaN(b) ? 0 : b));
            case 'count':
            default:
                return dice.length;
        }
    };

    const getDiceByPos = (m) => {
        // expected syntax: !getDiceByPos $[[0]] <=2|6-7|>10 total/count/list|delim
        let [rollmarker, valparams, op = 'count'] = m.content.split(/\s+/g).slice(1);
        if (!rollmarker || !valparams) { log(`getDiceByPos: wrong number of arguments, expected 3`); return; }
        const typeProcessor = {
            '!=': (r, t) => r != t,
            '>': (r, t) => r > t,
            '>=': (r, t) => r >= t,
            '<': (r, t) => r < t,
            '<=': (r, t) => r <= t,
            '-': (r, l, h) => r >= l && r <= h,
            '=': (r, t) => r == t
        };
        let delim;
        [op, ...delim] = op.split(/\|/);
        delim = delim.join('|');
        delim = /^('|"|`){0,1}(.*)?\1$/.exec(delim)[2] || '';

        let roll = (/\$\[\[(\d+)]]/.exec(rollmarker) || ['', ''])[1];
        if (roll === '') return '0';
        let searchdicerx = /^((?<low>\d+)-(?<high>\d+))|((?<range>!=|>=|<=|>|<*)(?<singleval>\d+))$/;
        let res;
        let tests = valparams.split('|').map(p => {
            res = searchdicerx.exec(p);
            return res.groups.low ?
                {
                    test: '-',
                    params: [res.groups.low, res.groups.high]
                } :
                {
                    test: res.groups.range || '=',
                    params: [res.groups.singleval]
                };
        });
        let dice = (m.parsedinline[roll] || { getDice: () => [] }).getDice('included')
            .filter((d, i) => {
                return tests.reduce((m, t) => {
                    return m || typeProcessor[t.test](i, ...t.params)
                }, false);
            });
        switch (op) {
            case 'list':
                return dice.join(delim || '');
            case 'count':
                return dice.length;
            case 'total':
            default:
                return dice.reduce((a, b) => (isNaN(a) ? 0 : a) + (isNaN(b) ? 0 : b));
        }
    };

    on('ready', () => {
        versionInfo();
        logsig();
        try {
            APILogic.RegisterRule(getDiceByVal, getDiceByPos);
        } catch (error) {
            log(`ERROR Registering to APILOGIC: ${error.message}`);
        }
    })

    return;
})();
{ try { throw new Error(''); } catch (e) { API_Meta.APILogic.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.APILogic.offset); } }
