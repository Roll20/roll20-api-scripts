/*
=========================================================
Name			:	Plugger
GitHub			:	https://github.com/TimRohr22/Cauldron/tree/master/Plugger
Roll20 Contact	:	timmaugh
Version			:	1.0.3
Last Update		:	5/6/2021
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.Plugger = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{
    try { throw new Error(''); } catch (e) { API_Meta.Plugger.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (13)); }
}

const Plugger = (() => {
    const apiproject = 'Plugger';
    const version = '1.0.3';
    const schemaVersion = 0.1;
    API_Meta[apiproject].version = version;
    const vd = new Date(1620275212489);
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

    // REGEX STATEMENTS =====================================
    const evalrx = /(\()?{&\s*eval(?:\((?<escape>[^)]+)\)){0,1}\s*}((?<=\({&\s*eval(?:\(([^)]+)\)){0,1}\s*})\)|\1)\s*/i,
        evalendrx = /(\()?{&\s*\/\s*eval\s*}((?<=\({&\s*\/\s*eval\s*})\)|\1)/i;

    // TAG RX SETS REGISTRY =================================
    const tagrxset = {
        'eval': { opentag: evalrx, endtag: evalendrx }
    };

    // TOKEN MARKERS ========================================
    const eostm = { rx: /$/, type: 'eos' },
        evaltm = { rx: evalrx, type: 'eval' },
        evalendtm = { rx: evalendrx, type: 'evalend' };

    // END TOKEN REGISTRY ===================================
    const endtokenregistry = {
        main: [eostm],
        eval: [evalendtm],
    };

    const tokenizeOps = (msg, msgstate, status, notes) => {
        class TextToken {
            constructor() {
                this.type = 'text';
                this.escape = '';
                this.value = '';
            }
        }
        class PlugEvalToken {
            constructor() {
                this.type = 'eval';
                this.contents = [];
            }
        }

        const getTextToken = (c) => {
            let logcolor = 'lawngreen';
            nestlog(`TEXT INPUT: ${c.cmd}`, c.indent, logcolor, msgstate.logging);
            let markers = [];
            c.looptype = c.looptype || '';
            switch (c.looptype) {
                case 'eval':
                default:
                    markers = [evaltm, evalendtm, eostm];
                    break;
            }
            let res = getfirst(c.cmd, ...markers);
            let index = res.index;
            let token = new TextToken();
            token.value = c.cmd.slice(0, index);
            nestlog(`TEXT KEEPS: ${token.value}`, c.indent, logcolor, msgstate.logging);
            return { token: token, index: index };
        };
        const getPlugEvalToken = (c) => {
            // receives object in the form of:
            // {cmd: command line slice, indent: #, overallindex: #, looptype: text}
            let logcolor = 'yellow';
            let index = 0;
            let evalopenres = tagrxset[c.looptype].opentag.exec(c.cmd);
            if (evalopenres) {
                nestlog(`${c.looptype.toUpperCase()} TOKEN INPUT: ${c.cmd}`, c.indent, logcolor, msgstate.logging);
                let token = new PlugEvalToken();
                token.escape = evalopenres.groups && evalopenres.groups.escape && evalopenres.groups.escape.length ? evalopenres.groups.escape : '';
                let index = evalopenres[0].length;

                // content and nested evals
                nestlog(`BUILDING CONTENT: ${c.cmd.slice(index)}`, c.indent + 1, 'lightseagreen', msgstate.logging);
                let contentres = evalval({ cmd: c.cmd.slice(index), indent: c.indent + 1, type: c.looptype, overallindex: c.overallindex + index, looptype: c.looptype });
                if (contentres.error) return contentres;
                token.contents = contentres.tokens;
                index += contentres.index;
                nestlog(`ENDING CONTENT: ${c.cmd.slice(index)}`, c.indent + 1, 'lightseagreen', msgstate.logging);

                // closing bracket of eval tag
                let evalendres = tagrxset[c.looptype].endtag.exec(c.cmd.slice(index));
                if (!evalendres) {
                    status.push('unresolved');
                    notes.push(`Unexpected token at ${c.overallindex + index}. Expected end of ${c.looptype.toUpperCase()} structure ('{& eval}'), but saw: ${c.cmd.slice(index, index + 10)}`);
                    return { error: `Unexpected token at ${c.overallindex + index}. Expected end of ${c.looptype.toUpperCase()} structure ('{& eval}'), but saw: ${c.cmd.slice(index, index + 10)}` };
                }
                index += evalendres[0].length;
                nestlog(`${c.looptype.toUpperCase()} TOKEN OUTPUT: ${JSON.stringify(token)}`, c.indent, logcolor, msgstate.logging);
                return { token: token, index: index };
            } else {
                status.push('unresolved');
                notes.push(`Unexpected token at ${c.overallindex + index}. Expected an ${c.looptype.toUpperCase()} structure, but saw: ${c.cmd.slice(index, index + 10)}`);
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
            nestlog(`${c.looptype.toUpperCase()} BEGINS`, c.indent, logcolor, msgstate.logging);
            while (!loopstop) {
                loopindex = index;
                if (assertstart(tagrxset[c.looptype].opentag).test(c.cmd.slice(index))) {
                    status.push('changed');
                    tokenres = getPlugEvalToken({ cmd: c.cmd.slice(index), indent: c.indent + 1, overallindex: c.overallindex + index, looptype: c.looptype });
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
            nestlog(`${c.looptype.toUpperCase()} ENDS`, c.indent, logcolor, msgstate.logging);
            return { tokens: tokens, index: index };
        };

        return evalval({ cmd: msg.content, indent: 0, type: 'main', overallindex: 0, looptype: 'eval' });
    };

    const reconstructOps = (o, msg, msgstate, status, notes) => {
        const runPlugin = c => {
            const evalstmtrx = /^\s*(?<script>[^(\s]*)\s*\((?<args>.*?)\)/gi;
            let ret;
            let content = '';
            if (evalstmtrx.test(c)) {
                return c.replace(evalstmtrx, ((m, script, args) => {
                    content = `${script} ${args}`;
                    if (!availFuncs[script.toLowerCase()]) {
                        sendChat('', `!${content}`);
                        return '';
                    }
                    let newmsg = _.clone(msg);
                    newmsg.content = `!${content}`;
                    newmsg.eval = true; // provide tag for message differentiation by client script
                    ret = availFuncs[script.toLowerCase()](newmsg);
                    return ['string', 'number', 'boolean', 'bigint'].includes(typeof ret) ? ret : '';
                }));
            } else {
                sendChat('', `!${c.replace(/^!/, '')}`);
                return '';
            }
        };
        const processPlugEvals = c => {
            // expects object in the form of:
            // { tokens: [], indent: # }
            let logcolor = 'aqua';
            nestlog(`PROCESS EVALS BEGINS`, c.indent, logcolor, msgstate.logging);
            let tokens = c.tokens.reduce((m, v, i) => {
                nestlog(`==TOKEN ${i}: ${JSON.stringify(v)}`, c.indent, 'violet', msgstate.logging);
                if (v.type === 'text') {
                    nestlog(`====DETECTED TEXT: ${v.value}`, c.indent, 'lawngreen', msgstate.logging);
                    m.push(v.value);
                } else if (v.type === 'eval') {
                    nestlog(`====DETECTED EVAL`, c.indent, 'yellow', msgstate.logging);
                    m.push(runPlugin(processPlugEvals({ tokens: v.contents, indent: c.indent + 1 }).join('').replace(new RegExp(escapeRegExp(v.escape), 'g'), '')));
                }
                nestlog(`==END OF TOKEN`, c.indent, 'violet', msgstate.logging);
                return m;
            }, []);
            nestlog(`PROCESS CONTENT ENDS`, c.indent, logcolor, msgstate.logging);
            return tokens;
        };

        return processPlugEvals({ tokens: o.tokens, indent: 0 }).join('');
    };

    // ==================================================
    //		SCRIPT PLUGINS
    // ==================================================
    const availFuncs = {};
    const registerRule = (...r) => { // pass in a list of functions to get them registered to the availFuncs library
        r.forEach(f => {
            if (f.name) {
                if (availFuncs[f.name.toLowerCase()]) {
                    log(`EVAL Function Registration: Name collision detected for ${f.name}. Last one loaded will win.`);
                }
                availFuncs[f.name.toLowerCase()] = f;
            }
        });
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

    const testConstructs = c => {
        let result = evalrx.test(c);
        evalrx.lastIndex = 0;
        return result;
    };
    // ==================================================
    //		HANDLE INPUT
    // ==================================================
    const handleInput = (msg, msgstate) => {
        let funcret = { runloop: false, status: 'unchanged', notes: '' };
        if (msg.type !== 'api' || !testConstructs(msg.content)) return funcret;
        if (!msgstate && scriptisplugin) return funcret;
        let status = [];
        let notes = [];

        const linebreak = '({&br-ev})';
        msg.content = msg.content.replace(/<br\/>\n/g, linebreak);

        let tokobj = tokenizeOps(msg, msgstate, status, notes);
        if (tokobj.error) return condensereturn(funcret, status, notes);
        let reconstructed = reconstructOps(tokobj, msg, msgstate, status, notes);
        msg.content = reconstructed;

        msg.content = msg.content.replace(new RegExp(escapeRegExp(linebreak), 'g'), '<br/>\n');

        return condensereturn(funcret,status,notes);
    };

    let scriptisplugin = false;
    const plugger = (m, s) => handleInput(m, s);
    on('chat:message', handleInput);
    on('ready', () => {
        versionInfo();
        logsig();
        scriptisplugin = (typeof ZeroFrame !== `undefined`);
        if (typeof ZeroFrame !== 'undefined') {
            ZeroFrame.RegisterMetaOp(plugger, { priority: 50, handles: ['eval', 'plug'] });
        }
    });
    return {
        RegisterRule: registerRule
    };
})();
const PluggerPlugins01 = (() => {
    // ==================================================
    //		VERSION
    // ==================================================
    const apiproject = 'PluggerPlugins01';
    const version = '0.0.2';
    const vd = new Date(1620099268834);
    const versionInfo = () => {
        log(`\u0166\u0166 ${apiproject} v${version}, ${vd.getFullYear()}/${vd.getMonth() + 1}/${vd.getDate()} \u0166\u0166 -- offset continues from Plugger`);
        return;
    };

    const getDiceByVal = (m) => {
        // expected syntax: !getDiceByVal $[[0]] <=2|6-7|>10 included count/total/list|delim
        let [rollmarker, valparams, dicetype = 'included', op = 'count'] = m.content.split(/\s+/g).slice(1);
        if (!rollmarker || !valparams) { log(`getDiceByVal: wrong number of arguments, expected 3`); return; }
        if (!['all', 'included', 'success', 'crit', 'fail', 'fumble', 'allcrit', 'dropped'].includes(dicetype)) { log(`getDiceByVal: Invalid dice type. Permitted values: all, included, success, crit, fail, fumble, allcrit, dropped`); return; }
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

        let roll = (/\$\[\[(\d+)]]/.exec(rollmarker) || /{\&(\d+)}/.exec(rollmarker) || ['', ''])[1];
        if (roll === '') return '0';
        let searchdicerx = /^((?<low>\d+)-(?<high>\d+)|(?<range>!=|>=|<=|>|<*)(?<singleval>\d+))$/;
        let res;
        let tests = valparams.split('|').map(p => {
            res = searchdicerx.exec(p);
            if (!res) return;
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
        if (!tests) return '';
        let dice = (m.parsedinline[roll] || { getDice: () => [] }).getDice(dicetype)
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
        // expected syntax: !getDiceByPos $[[0]] <=2|6-7|>10 included total/count/list|delim
        let [rollmarker, valparams, dicetype = 'included', op = 'count'] = m.content.split(/\s+/g).slice(1);
        if (!rollmarker || !valparams) { log(`getDiceByPos: wrong number of arguments, expected 3`); return; }
        if (!['all', 'included', 'success', 'crit', 'fail', 'fumble', 'allcrit', 'dropped'].includes(dicetype)) { log(`getDiceByPos: Invalid dice type. Permitted values: all, included, success, crit, fail, fumble, allcrit, dropped`); return; }
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

        let roll = (/\$\[\[(\d+)]]/.exec(rollmarker) || /{\&(\d+)}/.exec(rollmarker) || ['', ''])[1];
        if (roll === '') return '0';
        let searchdicerx = /^((?<low>\d+)-(?<high>\d+)|(?<range>!=|>=|<=|>|<*)(?<singleval>\d+))$/;
        let res;
        let tests = valparams.split('|').map(p => {
            res = searchdicerx.exec(p);
            if (!res) return;
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
        if (!tests) return '';
        let dice = (m.parsedinline[roll] || { getDice: () => [] }).getDice(dicetype)
            .filter((d, i) => {
                return tests.reduce((m, t) => {
                    return m || typeProcessor[t.test](i + 1, ...t.params)
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
        try {
            Plugger.RegisterRule(getDiceByVal, getDiceByPos);
        } catch (error) {
            log(`ERROR Registering to PlugEval: ${error.message}`);
        }
    })

    return;
})();
{ try { throw new Error(''); } catch (e) { API_Meta.Plugger.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.Plugger.offset); } }