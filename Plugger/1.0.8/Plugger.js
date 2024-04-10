/*
=========================================================
Name			:	Plugger
GitHub			:	https://github.com/TimRohr22/Cauldron/tree/master/Plugger
Roll20 Contact	:	timmaugh
Version			:	1.0.8
Last Update		:	05 APRIL 2024
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.Plugger = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{
    try { throw new Error(''); } catch (e) { API_Meta.Plugger.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (13)); }
}

const Plugger = (() => {
    const apiproject = 'Plugger';
    const version = '1.0.8';
    const schemaVersion = 0.1;
    API_Meta[apiproject].version = version;
    const vd = new Date(1712322138494);
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
            const evalstmtrx = /^\s*(?<script>[^(\s]*)\s*\((?<args>.*?)\)(?<!\({&\d+}\))/gi;
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
    const handleInput = (msg, msgstate = {}) => {
        let funcret = { runloop: false, status: 'unchanged', notes: '' };
        if (msg.type !== 'api' || !testConstructs(msg.content)) return funcret;
        if (!Object.keys(msgstate).length && scriptisplugin) return funcret;
        let status = [];
        let notes = [];

        const linebreak = '({&br-ev})';
        msg.content = msg.content.replace(/<br\/>\n/g, linebreak);

        let tokobj = tokenizeOps(msg, msgstate, status, notes);
        if (tokobj.error) return condensereturn(funcret, status, notes);
        let reconstructed = reconstructOps(tokobj, msg, msgstate, status, notes);
        msg.content = reconstructed;

        msg.content = msg.content.replace(new RegExp(escapeRegExp(linebreak), 'g'), '<br/>\n');

        return condensereturn(funcret, status, notes);
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
    const version = '0.0.3';
    const vd = new Date(1620099268834);
    const versionInfo = () => {
        log(`\u0166\u0166 ${apiproject} v${version}, ${vd.getFullYear()}/${vd.getMonth() + 1}/${vd.getDate()} \u0166\u0166 -- offset continues from Plugger`);
        return;
    };

    const tickSplit = (s, ticks = ["'", "`", '"'], split = ['|', '#'], mark = '--') => {
        const escapeRegExp = (string) => { return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); };
        let index = 0;
        let tokens = [];
        let markrx,
            openrx,
            splitrx;

        class ArgToken {
            constructor(type = '') {
                this.type = type;
                this.results = [];
            }
        }

        const validate = () => {
            if (
                split && Array.isArray(split) && split.length &&
                ticks && Array.isArray(ticks) && ticks.length &&
                s && typeof s === 'string' && s.length
            ) {
                markrx = new RegExp(`\\s+${escapeRegExp(mark).replace(/\s/g, '\\s')}(.+?)(?:${split.map(s => escapeRegExp(s)).join('|')})`, 'g');
                openrx = new RegExp(`^\\s+${escapeRegExp(mark).replace(/\s/g, '\\s')}`);
                splitrx = new RegExp(`^($|${split.map(s => escapeRegExp(s)).join('|')})`);
                return true;
            }
        };

        const getTick = () => {
            let tick = '';
            ticks.some(t => {
                let res;
                let rx = new RegExp(`^${escapeRegExp(t)}`);
                if ((res = rx.exec(s.slice(index))) !== null) {
                    tick = t;
                    index += res[0].length;
                    return true;
                }
            });
            return tick;
        };

        const transition = (tick) => {
            let res;
            if (tick) {
                let tickrx = new RegExp(`^${escapeRegExp(tick)}`);
                if ((res = tickrx.exec(s.slice(index))) !== null) {
                    index += res[0].length;
                }
            }
            if (index < s.length) {
                if ((res = splitrx.exec(s.slice(index))) !== null) {
                    index += res[0].length;
                }
            }
        };

        const getPart = (token) => {
            let tick = getTick();
            let rx;
            if (tick) {
                rx = new RegExp(`^.+?(?=$|${escapeRegExp(tick)})`);
            } else {
                rx = new RegExp(`^.+?(?=$|${split.map(s => escapeRegExp(s)).join('|')}|\\s+${escapeRegExp(mark).replace(/\s/g, '\\s')})`);
            }
            let res = rx.exec(s.slice(index));
            token.results.push(res[0]);
            index += res[0].length;
            if (index < s.length) {
                transition(tick);
            }
        };

        const getArg = () => {
            let res;
            markrx.lastIndex = 0;
            if ((res = markrx.exec(s.slice(index))) === null) {
                index = s.length;
                return;
            }
            let token = new ArgToken(res[1]);
            index += markrx.lastIndex;
            while (index < s.length && !openrx.test(s.slice(index))) {
                getPart(token);
            }
            tokens.push(token);
        };

        if (validate()) {
            while (index < s.length) {
                getArg();
            }
            return tokens;
        }
    };

    const listen = (m) => {
        // expected syntax: !listen ~~object|<identifier> ~~delay|1000 ~~test|(propA|+ && propB|-) command
        if (!/^!listen\s/.test(m.content)) return;
        let params = m.content.split(/~~\s+/).slice(1).map(p => p.split(`|`,1));
        params.forEach(p => {
            switch (p.toLowerCase()) {
                case 'object':

                    break;
                case 'delay':
            }
        })
    };
    const getDiceByVal = (m) => {
        // expected syntax: !getDiceByVal $[[0]] <=2|6-7|>10 included count/total/list|delim
        let [rollmarker, valparams, dicetype = 'included', op = 'count'] = m.content.split(/\s--+/.test(m.content) ? /\s--+/ : /\s+/g).slice(1);
        if (!rollmarker || !valparams) { log(`getDiceByVal: wrong number of arguments, expected 4`); return; }
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
        let searchdicerx = /^((?<low>-?\d+)-(?<high>-?\d+)|(?<range>!=|>=|<=|>|<*)(?<singleval>-?\d+))$/;
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
                return dice.length ? dice.reduce((a, b) => (isNaN(a) ? 0 : a) + (isNaN(b) ? 0 : b)) : '0';
            case 'count':
            default:
                return dice.length;
        }
    };

    const getDiceByPos = (m) => {
        // expected syntax: !getDiceByPos $[[0]] <=2|6-7|>10 included total/count/list|delim
        let [rollmarker, valparams, dicetype = 'included', op = 'count'] = m.content.split(/\s--+/.test(m.content) ? /\s--+/ : /\s+/g).slice(1);
        if (!rollmarker || !valparams) { log(`getDiceByPos: wrong number of arguments, expected 4`); return; }
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
        let searchdicerx = /^((?<low>-?\d+)-(?<high>-?\d+)|(?<range>!=|>=|<=|>|<*)(?<singleval>-?\d+))$/;
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
                return dice.length ? dice.reduce((a, b) => (isNaN(a) ? 0 : a) + (isNaN(b) ? 0 : b)) : '0';
        }
    };

    const filter = (m) => {
        // expected syntax: !filter --a|b|c --<=c|d|>10 --count/total/list|delim
        let [list, valparams, op = 'count'] = m.content.split(/\s+--/.test(m.content) ? /\s+--/ : /\s+/g).slice(1);
        if (!list || !valparams) { log(`filterFor: wrong number of arguments, expected 3`); return; }

        const isNum = (...v) => v.reduce((m, a) => { return m && +a === +a; }, true);
        const typeProcessor = {
            '!=': (r, t) => r != t,
            '>': (r, t) => isNum(r, t) ? Number(r) > Number(t) : r > t,
            '>=': (r, t) => isNum(r, t) ? Number(r) >= Number(t) : r >= t,
            '<': (r, t) => isNum(r, t) ? Number(r) < Number(t) : r < t,
            '<=': (r, t) => isNum(r, t) ? Number(r) <= Number(t) : r <= t,
            '-': (r, l, h) => isNum(r, l, h) ? Number(r) >= Number(l) && Number(r) <= Number(h) : r >= l && r <= h,
            '=': (r, t) => r == t
        };

        let delim;
        [op, ...delim] = op.split(/\|/);
        delim = delim.join('|');
        delim = /^('|"|`){0,1}(.*)?\1$/.exec(delim)[2] || '';

        let searchrx = /^((?<low>-?\d+)-(?<high>-?\d+)|(?<range>!=|>=|<=|>|<*)(?<singleval>-?\d+))$/;
        let res;
        let tests = valparams.split('|').map(p => {
            res = searchrx.exec(p);
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

        list = list.split(/\|/g)
            .filter(l => {
                return tests.reduce((m, t) => {
                    return m || typeProcessor[t.test](l, ...t.params);
                }, false);
            });
        switch (op) {
            case 'list':
                return list.join(delim || '');
            case 'total':
                return list.length ? list.reduce((a, b) => (isNaN(a) ? 0 : a) + (isNaN(b) ? 0 : b)) : '0';
            case 'count':
            default:
                return list.length;
        }
    };

    const replace = (m) => {
        // expected syntax: !replace --source|source text --find|search text 1|replace text 1|i --find|'search text|2'|replace text 2'
        const escapeRegExp = (string) => { return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); };

        let args = tickSplit(m.content);
        let source;
        let findargs = args.reduce((m, v) => {
            if (/^source$/i.test(v.type)) {
                source = v.results[0] || '';
            } else if (/^find$/i.test(v.type)) {
                //m.push(v);
                if (v.results.length === 2 || (v.results.length > 2 && !/i/i.test(v.results[2]))) {
                    m.push([new RegExp(escapeRegExp(v.results[0]), 'g'), v.results[1]]);
                } else if (v.results.length === 3 && /i/i.test(v.results[2])) {
                    m.push([new RegExp(escapeRegExp(v.results[0]), 'gi'), v.results[1]]);
                }
            }
            return m;
        }, []);


        return findargs.reduce((m, v) => {
            m = m.replace(...v);
            return m;
        }, source);
    };

    on('ready', () => {
        versionInfo();
        try {
            Plugger.RegisterRule(getDiceByVal, getDiceByPos, filter, replace);
        } catch (error) {
            log(`ERROR Registering to PlugEval: ${error.message}`);
        }
    })

    return;
})();
{ try { throw new Error(''); } catch (e) { API_Meta.Plugger.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.Plugger.offset); } }