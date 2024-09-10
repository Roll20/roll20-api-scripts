/*
=========================================================
Name			:	APILogic
GitHub			:	https://github.com/TimRohr22/Cauldron/tree/master/APILogic
Roll20 Contact	:	timmaugh
Version			:	2.0.9
Last Update		:	5 SEP 2024
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
    API_Meta[apiproject].version = '2.0.9';
    const schemaVersion = 0.1;
    const vd = new Date(1725559091022);
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

    // REGEXES ==============================================
    const defblockrx = /(\$?){&\s*define\s*/i,
        definitionrx = /\(\s*\[\s*(?<term>.+?)\s*]\s*('|"|`?)(?<definition>.*?)\2\)\s*/i,
        ifrx = /(\()?{&\s*if(?=\(|\s+|!)\s*/i,
        elseifrx = /(\()?{&\s*elseif(?=\(|\s+|!)\s*/i,
        elserx = /(\()?{&\s*else\s*(?=})/i,
        endrx = /(\()?{&\s*end\s*}((?<=\({&\s*end\s*})\)|\1)/i;
    // FORMERLY in IFTREEPARSER =============================
    const groupopenrx = /^\s*(?<negation>!?)\s*\((?!{&\d+}\))\s*/,
        namerx = /^\[(?<groupname>[^\s]+?)]\s*/i,
        comprx = /^(?<operator>(?:>=|<=|~|!~|=|!=|<|>))\s*/,
        operatorrx = /^(?<operator>(?:&&|\|\|))\s*/,
        groupendrx = /^\)\s*/,
        ifendrx = /^\s*}/,
        ifendparenrx = /^\s*}\)/,
        textrx = /^(?<negation>!?)\s*(`|'|"?)(?<argtext>\({&\d+}\)|.+?)\2\s*(?=!=|!~|>=|<=|[=~><]|&&|\|\||\)|})/;
    // TOKEN MARKERS ========================================
    const iftm = { rx: ifrx, type: 'if' },
        elseiftm = { rx: elseifrx, type: 'elseif' },
        elsetm = { rx: elserx, type: 'else' },
        endtm = { rx: endrx, type: 'end' },
        eostm = { rx: /$/, type: 'eos' },
        groupendtm = { rx: groupendrx, type: 'groupend' },
        ifendtm = { rx: ifendrx, type: 'mainconditions' },
        operatortm = { rx: operatorrx, type: 'operator' },
        texttm = { rx: textrx, type: 'text' },
        defblocktm = { rx: defblockrx, type: 'defblock' },
        comptm = { rx: comprx, type: 'comp' };

    // END TOKEN REGISTRY ===================================
    const endtokenregistry = {
        main: [eostm],
        if: [elseiftm, elsetm, endtm],
        elseif: [elseiftm, elsetm, endtm],
        else: [endtm],
        mainconditions: [ifendtm],
        group: [groupendtm],
    };

    const nestlog = (stmt, ilvl = 0, logcolor = '', boolog = false) => {
        if (isNaN(ilvl)) {
            ilvl = 0;
            log(`Next statement fed a NaN value for the indentation.`);
        }
        if ((state[apiproject] && state[apiproject].logging === true) || boolog) {
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

    // ==================================================
    //		PARSER PROCESSING
    // ==================================================
    const ifTreeParser = (msg, msgstate, status, notes) => {

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
            nestlog(`VAL BEGINS`, c.indent, logcolor, msgstate.logging);
            while (!loopstop) {
                loopindex = index;
                if (assertstart(ifrx).test(c.cmd.slice(index))) {
                    status.push('changed');
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
            nestlog(`VAL ENDS`, c.indent, logcolor, msgstate.logging);
            return { tokens: tokens, index: index };
        };
        const getTextToken = (c) => {
            let logcolor = 'lawngreen';
            nestlog(`TEXT INPUT: ${c.cmd}`, c.indent, logcolor, msgstate.logging);
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
            nestlog(`TEXT KEEPS: ${token.value}`, c.indent, logcolor, msgstate.logging);
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
                nestlog(`IF INPUT: ${c.cmd}`, c.indent, logcolor, msgstate.logging);
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
                let ifendres = (res[1] ? ifendparenrx : ifendrx).exec(c.cmd.slice(index));
                if (!ifendres) { // no end brace or the parens do not match
                    return { error: `Unexpected token at ${c.overallindex + index}. Expected end of logic structure ('}'), but saw: ${c.cmd.slice(index, index + 10)}` };
                }
                index += ifendres[0].length;

                // text content and nested ifs
                nestlog(`BUILDING CONTENT: ${c.cmd.slice(index)}`, c.indent + 1, 'lightseagreen', msgstate.logging);
                let contentres = val({ cmd: c.cmd.slice(index), indent: c.indent + 2, type: res.type, overallindex: c.overallindex + index });
                if (contentres.error) return contentres;
                token.contents = contentres.tokens;
                index += contentres.index;
                nestlog(`ENDING CONTENT: ${c.cmd.slice(index)}`, c.indent + 1, 'lightseagreen', msgstate.logging);

                // else cases
                let firstelseres = getfirst(c.cmd.slice(index), ...endtokenregistry[res.type]);
                if (firstelseres && firstelseres.type !== 'end' && firstelseres.index === 0) {
                    nestlog(`BUILDING ELSE: ${c.cmd.slice(index)}`, c.indent + 1, 'lightsalmon', msgstate.logging);
                    let elseres = getIfToken({ cmd: c.cmd.slice(index), indent: c.indent + 2, type: firstelseres.type, overallindex: c.overallindex + index });
                    token.else = elseres.token || [];
                    index += elseres.index;
                    nestlog(`ENDING ELSE: ${c.cmd.slice(index)}`, c.indent + 1, 'lightsalmon', msgstate.logging);
                }
                // end token (only for full IF blocks)
                if (res.type === 'if') {
                    let endres = assertstart(endrx).exec(c.cmd.slice(index));
                    if (!endres) {
                        return { error: `Unexpected token at ${c.overallindex + index}. Expected logical structure (END), but saw: ${c.cmd.slice(index, index + 10)}` };
                    }
                    index += endres[0].length;
                }
                nestlog(`IF OUTPUT: ${JSON.stringify(token)}`, c.indent, logcolor, msgstate.logging);
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
            nestlog(`GETCONDITIONS BEGINS`, c.indent, logcolor, msgstate.logging);
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
            nestlog(`GETCONDITIONS ENDS`, c.indent, logcolor, msgstate.logging);
            return { tokens: tokens, index: index };
        };
        const getGroupToken = (c) => {
            let logcolor = 'violet';
            let index = 0;
            let groupres = groupopenrx.exec(c.cmd);
            if (groupres) {
                nestlog(`GROUP INPUT: ${c.cmd}`, c.indent, logcolor, msgstate.logging);
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
                nestlog(`BUILDING CONTENT: ${c.cmd.slice(index)}`, c.indent + 1, 'lightseagreen', msgstate.logging);
                let contentres = getConditions({ cmd: c.cmd.slice(index), indent: c.indent + 2, type: 'group', overallindex: c.overallindex + index });
                if (contentres) {
                    if (contentres.error) { return contentres; }
                    token.contents = contentres.tokens;
                    index += contentres.index;
                }
                nestlog(`ENDING CONTENT: ${c.cmd.slice(index)}`, c.indent + 1, 'lightseagreen', msgstate.logging);

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

                nestlog(`GROUP OUTPUT: ${JSON.stringify(token)}`, c.indent, logcolor, msgstate.logging);
                //log(`<pre>${syntaxHighlight(token)}</pre>`);
                return { token: token, index: index };
            }
        };
        const getConditionToken = (c) => {
            let logcolor = 'white';
            let index = 0;
            let firstargres = getfirst(c.cmd, comptm, texttm);
            if (firstargres) {
                nestlog(`CONDITION INPUT: ${c.cmd}`, c.indent, logcolor, msgstate.logging);
                let token = new ConditionToken();
                if (firstargres.type === 'comp') {
                    firstargres = getfirst(' =', texttm);
                } else {
                    index += firstargres[0].length;
                }
                token.contents.push(firstargres);

                let compres = comprx.exec(c.cmd.slice(index));
                if (compres) {
                    index += compres[0].length;
                    let secondargres = getfirst(c.cmd.slice(index), groupendtm, ifendtm, operatortm, texttm);
                    if (secondargres && ![groupendtm.type, ifendtm.type, operatortm.type].includes(secondargres.type)) {
                        index += secondargres[0].length;
                    } else {					// comparison operator with no second arg
                        secondargres = getfirst(' =', texttm);
                    }
                    token.contents.push(secondargres);
                    token.type = compres.groups.operator;
                }
                // connecting operator
                let operatorres = operatorrx.exec(c.cmd.slice(index));
                if (operatorres) {
                    token.next = operatorres.groups.operator;
                    index += operatorres[0].length;
                }
                nestlog(`CONDITION OUTPUT: ${JSON.stringify(token)}`, c.indent, logcolor, msgstate.logging);
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
                nestlog(`TERM INPUT: ${c.cmd}`, c.indent, logcolor, msgstate.logging);
                let tokens = [];
                let loopstop = false;
                while (!loopstop) {
                    tokens.push({ term: res.groups.term, definition: res.groups.definition });
                    nestlog(`TERM DEFINED: ${res.groups.term} = ${res.groups.definition}`, c.indent + 1, logcolor, msgstate.logging);
                    index += res[0].length;
                    res = assertstart(definitionrx).exec(c.cmd.slice(index));
                    if (!res) loopstop = true;
                }

                nestlog(`TERM OUTPUT: ${JSON.stringify(tokens)}`, c.indent, logcolor, msgstate.logging);
                return { token: tokens, index: index };
            } else {
                return { error: `Unexpected token at ${c.overallindex + index}. Expected a term and definition, but saw: ${c.cmd.slice(index, index + 10)}` };
            }
        };
        const defval = c => {
            // expects an object in the form of:
            // { cmd: text, indent: #, defs: [] }
            let tokens = [];				// main text output array
            let defs = c.defs;					// main definition array
            let logcolor = 'aqua';
            let loopstop = false;
            let defendres = {};
            let tokenres = {};
            let index = 0;
            let loopindex = 0;
            let res;
            nestlog(`DEFVAL BEGINS`, c.indent, logcolor, msgstate.logging);
            while (!loopstop) {
                loopindex = index;
                if (assertstart(defblockrx).test(c.cmd.slice(index))) {
                    status.push('changed');
                    res = assertstart(defblockrx).exec(c.cmd.slice(index));
                    index += res[0].length;
                    tokenres = getTermToken({ cmd: c.cmd.slice(index), indent: c.indent + 1 });
                } else {
                    tokenres = getTextToken({ cmd: c.cmd.slice(index), indent: c.indent + 1, looptype: 'def' });
                }
                if (tokenres) {
                    if (tokenres.error) {
                        return tokenres;
                    }
                    index += tokenres.index;
                    if (tokenres.token.type === 'text') {
                        tokens.push(tokenres.token);
                    } else {
                        defendres = (res[1] ? ifendparenrx : ifendrx).exec(c.cmd.slice(index));
                        if (!defendres) { // no end brace or the parens do not match
                            return { error: `Unexpected token at ${c.overallindex + index}. Expected end of definition ('}'), but saw: ${c.cmd.slice(index, index + 10)}` };
                        }
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
            nestlog(`DEFVAL ENDS`, c.indent, logcolor, msgstate.logging);
            return { cmd: newcmd, defs: defs };
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

        const main = (msg) => {
            let retObj = {};

            // DEFINITION BLOCK DETECTION
            let defcmd = defval({ cmd: msg.content, indent: 0, type: 'main', overallindex: 0, defs: [...(msg.definitions || [])] });
            if (!defcmd.cmd) return { tokens: [], error: defcmd.error };
            if (defcmd.defs.length) msg.definitions = defcmd.defs;
            // WELL-FORMED CHECK
            let wf = checkWellFormed(defcmd.cmd);
            if (!wf.wellformed) return { tokens: [], error: wf.error };
            // LOGIC PARSING
            retObj = val({ cmd: defcmd.cmd, indent: 0, type: 'main', overallindex: 0 });

            return retObj;
        }
        return main(msg);
    };
    const reconstructCommandLine = (o, msgstate, status, notes) => {
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
                        item.groups.argtext = item.groups.argtext
                            .replace(/\$\[\[(\d+)]]/g, ((r, g1) => o.parsedinline[g1].value || 0))
                            .replace(/\({&(\d+)}\)/, ((r, g1) => o.parsedinline[g1].value || 0));
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
                    default:
                        log('Unknown token type in reconstruction');
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
            let res;
            c.memo = c.hasOwnProperty("memo") ? c.memo : { value: false, next: '||' };
            nestlog(`CONDITIONS TEST BEGINS`, c.indent, logcolor, msgstate.logging);
            let o = c.tokens.reduce((m, v, i) => {
                if ((!m.value && m.next === '&&') || (m.value && m.next === '||')) {
                    nestlog(`==TEST SKIPPED`, c.indent, logcolor, msgstate.logging);
                } else {
                    if (v.type === 'group') {
                        nestlog(`==AND-GROUP DETECTED: ${v.name || 'no name'}`, c.indent, logcolor, msgstate.logging);
                        groupname = v.name;
                        negate = v.negate;
                        res = areConditionsTruthy({ tokens: v.contents, indent: c.indent + 1, memo: { ...m } });
                        v.value = res.value;
                        if (groupname) {
                            grouplib[groupname] = v.value;
                        }
                        if (negate) v.value = !v.value;
                    } else {
                        nestlog(`==AND-CONDITION DETECTED: lhs>${v.contents[0]} type>${v.type} rhs>${v.contents[1] || ''}`, c.indent, logcolor, msgstate.logging);
                        ret = resolveCondition(v);
                        v.value = ret.value;
                    }
                    nestlog(`==VALUE: ${v.value}`, c.indent, logcolor, msgstate.logging);
                    m.value = m.next === '&&' ? m.value && v.value : m.value || v.value;
                }
                m.next = v.next;
                nestlog(`==LOOP END MEMO VALUE: ${m.value}, ${m.next}`, c.indent, logcolor, msgstate.logging);
                return m;
            }, c.memo);

            nestlog(`CONDITIONS TEST ENDS: Conditions are ${o.value}, ${o.next}`, c.indent, logcolor, msgstate.logging);
            return o;
        };

        const processContents = c => {
            // expects contents array
            let logcolor = 'aqua';
            nestlog(`PROCESS CONTENT BEGINS`, c.indent, logcolor, msgstate.logging);
            let tokens = c.tokens.reduce((m, v, i) => {
                nestlog(`==TOKEN ${i}: ${JSON.stringify(v)}`, c.indent, 'violet', msgstate.logging);
                if (v.type === 'text') {
                    nestlog(`====DETECTED TEXT: ${v.value}`, c.indent, 'lawngreen', msgstate.logging);
                    m.push(v.value);
                } else if (v.type === 'if') {
                    nestlog(`====DETECTED IF`, c.indent, 'yellow', msgstate.logging);
                    if (!v.conditions.length || areConditionsTruthy({ tokens: v.conditions, indent: c.indent + 1 }).value) {
                        nestlog(`======TRUE CASE`, c.indent, 'darkorange', msgstate.logging);
                        m.push(processContents({ tokens: v.contents, indent: c.indent + 1 }).join(''));
                    } else if (v.else) {
                        nestlog(`======TESTING ELSE CASE`, c.indent, 'darkorange', msgstate.logging);
                        m.push(processContents({ tokens: [v.else], indent: c.indent + 1 }).join(''));
                    }
                }
                nestlog(`==END OF TOKEN`, c.indent, 'violet', msgstate.logging);
                return m;
            }, []);
            nestlog(`PROCESS CONTENT ENDS`, c.indent, logcolor, msgstate.logging);
            return tokens;
        };
        let content = processContents({ tokens: o.tokens, indent: 0 }).join('');
        return { content: content, logicgroups: grouplib };
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

    // ==================================================
    //      TEST CONSTRUCTS
    // ==================================================
    const testConstructs = (c) => {
        let result = ifrx.test(c) || defblockrx.test(c);
        ifrx.lastIndex = 0;
        defblockrx.lastIndex = 0;

        return result;
    };

    // ==================================================
    //		HANDLE INPUT
    // ==================================================
    const handleInput = (msg, msgstate = {}) => {
        let funcret = { runloop: false, status: 'unchanged', notes: '' };
        if (msg.type !== 'api' || !testConstructs(msg.content)) {
            if (!msg.definitions || !msg.definitions.length) return funcret;
            let termrx = new RegExp(msg.definitions.map(d => escapeRegExp(d.term)).join('|'), 'gm');
            if (!termrx.test(msg.content)) return funcret;
        }
        if (!Object.keys(msgstate).length && scriptisplugin) return funcret;
        let status = [];
        let notes = [];
        const linebreak = '({&br-al})';
        msg.content = msg.content.replace(/<br\/>\n/g, linebreak);

        msg.logicgroups = msg.logicgroups || {};
        msg.definitions = msg.definitions || [];
        let o = ifTreeParser(msg, msgstate, status, notes);
        if (o.error) {
            status.push('unresolved');
            notes.push(o.error);
            log(o.error);
            log(msg.content);
            return condensereturn(funcret, status, notes);
        }
        if (o.tokens) {
            // reconstruct command line
            o.playerid = msg.playerid;
            o.logicgroups = msg.logicgroups;
            o.parsedinline = msg.parsedinline || [];
            let reconstruct = reconstructCommandLine(o, msgstate, status, notes);
            if (msg.content !== reconstruct.content) status.push('chnaged');
            msg.content = reconstruct.content;
            msg.content = msg.content.replace(new RegExp(escapeRegExp(linebreak), 'g'), '<br/>\n');
            msg.logicgroups = reconstruct.logicgroups;
        } else {
            status.push('unresolved');
            notes.push('Unexpected error encountered. Unable to reconstruct command line.');
            return condensereturn(funcret, status, notes);
        }
        return condensereturn(funcret, status, notes);
    };

    let scriptisplugin = false;
    const apilogic = (m, s) => handleInput(m, s);
    on('chat:message', handleInput);
    on('ready', () => {
        versionInfo();
        logsig();
        scriptisplugin = (typeof ZeroFrame !== `undefined`);
        if (typeof ZeroFrame !== 'undefined') {
            ZeroFrame.RegisterMetaOp(apilogic, { priority: 70, handles: ['apil', 'logic'] });
        }
    });

    return {
    }
})();
{ try { throw new Error(''); } catch (e) { API_Meta.APILogic.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.APILogic.offset); } }
