/*
=========================================================
Name			:	APILogic
GitHub			:	https://github.com/TimRohr22/Cauldron/tree/master/APILogic
Roll20 Contact	:	timmaugh
Version			:	1.0.0
Last Update		:	2/3/2021
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.APILogic = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{
    try { throw new Error(''); } catch (e) { API_Meta.APILogic.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (13)); }
    // sendChat('API', `APILOGIC offset is ${API_Meta.APILogic.offset}`);
}

const APILogic = (() => {
    // ==================================================
    //		VERSION
    // ==================================================
    const vrs = '1.0.0';
    const vd = new Date(1612366265068);
    const apiproject = 'APILogic';
    const versionInfo = () => {
        log(`\u0166\u0166 ${apiproject} v${vrs}, ${vd.getFullYear()}/${vd.getMonth() + 1}/${vd.getDate()} \u0166\u0166 -- offset ${API_Meta.APILogic.offset}`);
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

    let preserved;
    let apitrigger;

    const stoprx = /{&\s*stop\s*}/i,
        simplerx = /{&\s*simple\s*}/i,
        defblockrx = /{&\s*define\s*/i,
        definitionrx = /\(\s*\[\s*(?<term>.+?)\s*]\s*('|"|`?)(?<definition>.*?)\2\)\s*/i,
        ifrx = /{&\s*if(?=\(|\s+|!)\s*/i,
        elseifrx = /{&\s*elseif(?=\(|\s+|!)\s*/i,
        elserx = /{&\s*else\s*(?=})/i,
        endrx = /{&\s*end\s*}/i,
        valuerx = /\$\[\[(?<rollnumber>\d+)]]\.value/gi,
        tablerx = /\$\[\[(?<rollnumber>\d+)]]\.table/gi;

    const nestlog = (stmt, ilvl = 0, logcolor = '') => {
        if (state[apiproject] && state[apiproject].logging === true) {
            let l = `${Array(ilvl + 1).join("==")}${stmt}`;
            if (logcolor) {
                l = /:/.test(l) ? `<span style="color:${logcolor};">${l.replace(/:/, ':</span>')}` : `<span style="color:${logcolor};">${l}</span>`;
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

    const charFromAmbig = (info) => {                                       // find a character where info is an identifying piece of information (id, name, or token id)
        let character;
        character = findObjs({ type: 'character', id: info })[0] ||
            findObjs({ type: 'character' }).filter(c => c.get('name') === info)[0] ||
            findObjs({ type: 'character', id: (getObj("graphic", info) || { get: () => { return "" } }).get("represents") })[0];
        return character;
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
            '>': (a) => a.contents[0] > a.contents[1],
            '>=': (a) => a.contents[0] >= a.contents[1],
            '<': (a) => a.contents[0] < a.contents[1],
            '<=': (a) => a.contents[0] <= a.contents[1]
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

    // ==================================================
    //		PARSER PROCESSING
    // ==================================================
    const ifTreeParser = (cmd) => {

        const groupopenrx = /^\s*(?<negation>!?)\s*\(\s*/,
            namerx = /^\[(?<groupname>[^\s]+?)]\s*/i,
            sheetitemrx = /^(?<negation>!?)\s*(?<type>(?:@|%))(?<operation>[^\s@%|]*)\|(?<character>[^|]+?)\|(?<item>[^)\]\s=~<>!&\|]+)\s*(?=!=|!~|>=|<=|[=~><]|&&|\|\||\)|})/i,
            rptgitemrx = /^(?<negation>!?)\s*(?<type>(?:\*))(?<operation>[^\s*|]*)\|(?<character>[^|]+?)\|(?<section>[^\s|]+)\|\[\s*(?<pattern>.+?)\s*]\s*\|(?<valuesuffix>[^)\]\s=~<>!&\|]+)\s*(?=!=|!~|>=|<=|[=~><]|&&|\|\||\)|})/i,
            comprx = /^(?<operator>(?:>=|<=|~|!~|=|!=|<|>))\s*/,
            operatorrx = /^(?<operator>(?:&&|\|\|))\s*/,
            groupendrx = /^\)\s*/,
            ifendrx = /^\s*}/,
            textrx = /^(?<negation>!?)\s*(`|'|"?)(?<argtext>.+?)\2\s*(?=!=|!~|>=|<=|[=~><]|&&|\|\||\)|})/;

        // TOKEN MARKERS ==========================
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
            defblocktm = { rx: defblockrx, type: 'defblock' };

        const endtokenregistry = {
            main: [eostm],
            if: [elseiftm, elsetm, endtm],
            elseif: [elseiftm, elsetm, endtm],
            else: [endtm],
            mainconditions: [ifendtm],
            group: [groupendtm]
        }

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
            let res = c.define ? getfirst(c.cmd, defblocktm, eostm) : getfirst(c.cmd, iftm, elseiftm, elsetm, endtm, eostm);
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
                    return { error: `Unexpected token at ${c.overallindex + index}. Expected end of logic structure (']'), but saw: ${c.cmd.slice(index, index + 10)}` };
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
            if (res) {
                nestlog(`TERM INPUT: ${c.cmd}`, c.indent, logcolor);
                let tokens = [];
                let loopstop = false;
                while (!loopstop) {
                    tokens.push({ term: res.groups.term, definition: res.groups.definition });
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
                    tokenres = getTextToken({ cmd: c.cmd.slice(index), indent: c.indent + 1, define: true });
                }
                if (tokenres) {
                    if (tokenres.error) { return tokenres; }
                    index += tokenres.index;
                    if (tokenres.token.type === 'text') {
                        tokens.push(tokenres.token);
                    } else {
                        defendres = ifendrx.exec(c.cmd.slice(index));
                        if (!defendres) return { error: `Unexpected token at ${c.overallindex + index}. Expected end of definition (\']\'), but saw: ${c.cmd.slice(index, index + 10)}` };
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

            // DEFINITION BLOCK DETECTION
            let defcmd = defval({ cmd: cmd, indent: 0, type: 'main', overallindex: 0 });
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
            '>': (t) => t.contents[0].value > t.contents[1].value,
            '>=': (t) => t.contents[0].value >= t.contents[1].value,
            '<': (t) => t.contents[0].value < t.contents[1].value,
            '<=': (t) => t.contents[0].value <= t.contents[1].value
        }

        const resolveCondition = (t) => {
            // expects condition token
            // each item in t.contents should be a regex result also with a property type: 'sheetitem', 'rptgitem', 'text' 
            // t.type :: 'condition', '=', '!=', etc.
            // negation is at t.contents[#].groups.negation
            // comparable or usable text is different for text vs sheet item vs rpt item
            let o = {};
            let retrieve = '';	// retrievable field for attributes and abilities
            let internalTestLib = {
                'i': (v) => +v === +v && parseInt(parseFloat(v, 10), 10) == v,
                'n': (v) => +v === +v,
                't': (v) => v == true
            };
            t.contents.forEach(item => {
                if (item.type !== 'text') {
                    if (['@', '*'].includes(item.groups.type) && !item.groups.operation.includes('m')) retrieve = 'current';
                    else if (['@', '*'].includes(item.groups.type)) retrieve = 'max';
                    else retrieve = 'action';
                }
                item.metavalue = true;
                switch (item.type) {
                    case 'text':
                        item.groups.argtext = item.groups.argtext.replace(/\$\[\[(\d+)]]/g, ((r, g1) => preserved.inlinerolls[g1].results.total || 0));
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
                        o = getSheetItem(item);
                        if (!o) {
                            item.metavalue = false;
                            item.value = undefined;
                        } else {
                            item.value = o.get(retrieve);
                            for (const test in internalTestLib) {
                                if (item.groups.operation.includes(test)) {
                                    item.metavalue = item.metavalue && internalTestLib[test](item.value);
                                }
                                if (!item.metavalue) break;
                            }
                        }

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

    const nestedInline = (cmd) => {
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

        while (index < cmd.length) {
            c = cmd.slice(index);
            ores = getfirst(c, outertm, innertm, inlineclosetm, eostm);
            switch (ores.type) {
                case 'eos':
                    index = cmd.length;
                    break;
                case 'inner':
                    index += ores.index;
                    ires = nestedrx.exec(cmd.slice(index));
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
            cmd = `${cmd.slice(0, r.index)}${r.value}${cmd.slice(r.index + r.replacestring.length, cmd.length)}`;
        });
        return cmd;
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
    //		HANDLE INPUT
    // ==================================================
    const handleInput = (msg) => {
        const testConstructs = (c) => (ifrx.test(c) || defblockrx.test(c));
        if (!msg.type === 'api') return;
        if (new RegExp(`^!${apitrigger}`).test(msg.content)) {
            if (msg.inlinerolls) {
                preserved.inlinerolls = preserved.inlinerolls || [];
                // insert inline rolls to preserved message, correct the placeholder shorthand index
                msg.inlinerolls.forEach((r, i) => {
                    preserved.inlinerolls.push(r);
                    msg.content = msg.content.replace(new RegExp(`\\$\\[\\[(${i})]]`, 'g'), `$[[${preserved.inlinerolls.length - 1}]]`);
                });
                preserved.parsedinline = [...(preserved.parsedinline || []), ...libInline.getRollData(msg)];
                preserved.content = msg.content;
            } else {    // no inlineroll array
                if (!testConstructs(msg.content)) { // we're on our way out of the script, format everything and release message
                    // replace all APIL formatted inline roll shorthand markers with roll20 formatted shorthand markers
                    msg.content = msg.content.replace(/{&(\d+)}/g, `$[[$1]]`);
                    // copy over new message command line to preserved message after removing the apitrigger
                    preserved.content = msg.content.replace(apitrigger,'');
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
                        return;
                    }
                    // release the message to other scripts (FINAL OUTPUT)
                    Object.keys(preserved).forEach(k => msg[k] = preserved[k]);
                    return;
                }
            }
        } else {    // not prepended with apitrigger
            if (!testConstructs(msg.content)) return;
            preserved = _.clone(msg);
            preserved.logicgroups = {};
            apitrigger = `${apiproject}${generateUUID()}`;
            preserved.content = `!${apitrigger}${preserved.content.slice(1)}`;
            preserved.parsedinline = msg.inlinerolls ? libInline.getRollData(msg) : [];
            msg.content = ``;
        }

        if (testConstructs(preserved.content)) {
            // replace inline rolls tagged with .value or .table
            getValues(preserved);

            let o = ifTreeParser(preserved.content);
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
        preserved.content = nestedInline(preserved.content);
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
})();
{ try { throw new Error(''); } catch (e) { API_Meta.APILogic.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.APILogic.offset); } }
