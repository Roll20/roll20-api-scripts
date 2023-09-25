/*
=========================================================
Name            :   Muler
GitHub          :   https://github.com/TimRohr22/Cauldron/tree/master/Muler
Roll20 Contact  :   timmaugh
Version         :   2.0.2
Last Update     :   25 Sep 2023
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.Muler = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.Muler.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (12)); } }

const Muler = (() => { //eslint-disable-line no-unused-vars
    const apiproject = 'Muler';
    const version = '2.0.2';
    const schemaVersion = 0.2;
    const apilogo = 'https://i.imgur.com/AcQSK23.png'; // black
    const apilogoalt = 'https://i.imgur.com/j8x0frn.png'; // white

    API_Meta[apiproject].version = version;
    const vd = new Date(1695645462807);
    const versionInfo = () => {
        log(`\u0166\u0166 ${apiproject} v${API_Meta[apiproject].version}, ${vd.getFullYear()}/${vd.getMonth() + 1}/${vd.getDate()} \u0166\u0166 -- offset ${API_Meta[apiproject].offset}`);
        if (!state.hasOwnProperty(apiproject) || state[apiproject].version !== schemaVersion) {
            log(`  > Updating ${apiproject} Schema to v${schemaVersion} <`);
            switch (state[apiproject] && state[apiproject].version) {

                case 0.1:
                /* falls through */

                case 0.2:
                    state[apiproject].settings = {
                        playersNeedControl: true
                    }
                    state[apiproject].defaults = {
                        playersNeedControl: true
                    }
                case 'UpdateSchemaVersion':
                    state[apiproject].version = schemaVersion;
                    break;

                default:
                    state[apiproject] = {
                        version: schemaVersion,
                        settings: { playersNeedControl: true },
                        defaults: { playersNeedControl: true }
                    };
                    break;
            }
        }
    };
    const manageState = { // eslint-disable-line no-unused-vars
        reset: () => state[apiproject].settings = _.clone(state[apiproject].defaults),
        set: (p, v) => state[apiproject].settings[p] = v,
        get: (p) => { return state[apiproject].settings[p]; }
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

    const getMyCharacters = (playerid) => {
        let characters = findObjs({ type: 'character' });
        return playerIsGM(playerid) || !manageState.get('playersNeedControl') ? characters : characters.filter(c => {
            return c.get('controlledby').split(',').reduce((m, p) => {
                return m || p === 'all' || p === playerid;
            }, false)
        });
    };

    const tableFromAmbig = (query) => findObjs({ type: 'rollabletable' }).filter(t => t.get('name') === query)[0];
    const abilityFromAmbig = (query, pid, sourcechar) => {
        let mychars = sourcechar ? [sourcechar] : getMyCharacters(pid);
        let charids = mychars.map(c => c.id);
        return findObjs({ type: 'ability', name: query }).filter(a => charids.includes(a.get('characterid')))[0];
    };
    const charFromAmbig = (query, pid, mychars = getMyCharacters(pid)) => { // find a character where info is an identifying piece of information (id, name, or token id)
        let character;
        let qrx = new RegExp(escapeRegExp(query), 'i');
        character = mychars.filter(c => c.id === query)[0] ||
            mychars.filter(c => c.id === (getObj('graphic', query) || { get: () => { return '' } }).get('represents'))[0] ||
            mychars.filter(c => c.get('name') === query)[0] ||
            mychars.filter(c => {
                qrx.lastIndex = 0;
                return qrx.test(c.get('name'));
            })[0];
        return character;
    };
    const checkTicks = (s,check = ["'","`",'"']) => {

        if (typeof s !== 'string') return s;
        return ((s.charAt(0) === s.charAt(s.length - 1)) && check.includes(s.charAt(0))) ? s.slice(1, s.length - 1) : s;

    };

    const varrx = /^((?:(?:-?\d+)-(?:-?\d+)|(?:!=|>=|<=|>|<)(?:-?\d+))|[^\s]+?)=(.+)$/,
        getrx = /get\.(([`'"])?[^\2.]+?\2)(?:\.(([`'"])?[^.\4]+?\4)){0,1}(?:\.(([`'"])?[^\6]+?\6)){0,1}(?:\?(name|avatar|url|image|html)){0,1}(\/get|(?=\s|$))/gmi,
        setrx = /set\.([^\s.=]+(?:\.[^\s=.]+)*\s*=\s*.+?)\s*\/set/gmi,
        mulerx = /(\()?{&\s*mule\s*(.*?)\s*}((?<=\({&\s*mule\s*(.*?)\s*})\)|\1)/gi,
        // muleabilrx = /\s*\((.*?)\)\s*/g;
        muleabilrx = /((['`"])(.+?)\2|[^\s.]+?)(?:\.((['`"])(.+?)\5|[^\s]+?)){0,1}(?:\s|$)/gmi;

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
    const testGetConstructs = m => {
        let rxarray = [mulerx, getrx, setrx];
        return rxarray.reduce(rx => {
            m = m || rx.test(m.content);
            rx.lastIndex = 0;
            return m;
        }, false);
    };
    const testSetConstructs = m => {
        let result = m.variables && Object.keys(m.variables).length && setrx.test(m.content);
        setrx.lastIndex = 0;
        return result;
    };
    const internalTestLib = {
        'int': (v) => +v === +v && parseInt(parseFloat(v, 10), 10) == v, // eslint-disable-line eqeqeq
        'num': (v) => +v === +v,
        'tru': (v) => v == true // eslint-disable-line eqeqeq
    };
    const getEmptyVarObject = () => {
        return {
            all: {},
            alltables: {},
            mules: {}
        };
    };
    let html = {};
    let css = {}; // eslint-disable-line no-unused-vars
    let HE = () => { }; // eslint-disable-line no-unused-vars
    const theme = {
        primaryColor: '#744402',
        primaryTextColor: '#232323',
        primaryTextBackground: '#ededed'
    }
    const localCSS = {
        msgheader: {
            'background-color': theme.primaryColor,
            'color': 'white',
            'font-size': '1.2em',
            'padding-left': '4px'
        },
        msgbody: {
            'color': theme.primaryTextColor,
            'background-color': theme.primaryTextBackground
        },
        msgfooter: {
            'color': theme.primaryTextColor,
            'background-color': theme.primaryTextBackground
        },
        msgheadercontent: {
            'display': 'table-cell',
            'vertical-align': 'middle',
            'padding': '4px 8px 4px 6px'
        },
        msgheaderlogodiv: {
            'display': 'table-cell',
            'max-height': '30px',
            'margin-right': '8px',
            'margin-top': '4px',
            'vertical-align': 'middle'
        },
        logoimg: {
            'background-color': 'transparent',
            'float': 'left',
            'border': 'none',
            'max-height': '30px'
        },
        boundingcss: {
            'background-color': theme.primaryTextBackground
        },
        inlineEmphasis: {
            'font-weight': 'bold'
        }
    }
    const msgbox = ({
        msg: msg = '',
        title: title = '',
        headercss: headercss = localCSS.msgheader,
        bodycss: bodycss = localCSS.msgbody,
        footercss: footercss = localCSS.msgfooter,
        sendas: sendas = 'Muler',
        whisperto: whisperto = '',
        footer: footer = '',
        btn: btn = '',
    } = {}) => {
        if (title) title = html.div(html.div(html.img(apilogoalt, 'Muler Logo', localCSS.logoimg), localCSS.msgheaderlogodiv) + html.div(title, localCSS.msgheadercontent), {});
        Messenger.MsgBox({ msg: msg, title: title, bodycss: bodycss, sendas: sendas, whisperto: whisperto, footer: footer, btn: btn, headercss: headercss, footercss: footercss, boundingcss: localCSS.boundingcss, noarchive: true });
    };
    const getWhisperTo = (who) => who.toLowerCase() === 'api' ? 'gm' : who.replace(/\s\(gm\)$/i, '');

    const handleConfig = (msg) => {
        if (msg.type !== 'api' || !/^!mulerconfig/i.test(msg.content)) return;
        let recipient = getWhisperTo(msg.who);
        if (!playerIsGM(msg.playerid)) {
            msgbox({ title: 'GM Rights Required', msg: 'You must be a GM to perform that operation', whisperto: recipient });
            return;
        }
        let cfgrx = /^(\+|-)(playersneedcontrol)$/i;
        let res;
        let cfgTrack = {};
        let message;
        if (/^!mulerconfig\s+[^\s]/i.test(msg.content)) {
            msg.content.split(/\s+/).slice(1).forEach(a => {
                res = cfgrx.exec(a);
                if (!res) return;
                if (res[2].toLowerCase() === 'playersneedcontrol') {
                    manageState.set('playersNeedControl', (res[1] === '+'));
                    cfgTrack[res[2]] = res[1];
                }
            });
            let changes = Object.keys(cfgTrack).map(k => `${html.span(k, localCSS.inlineEmphasis)}: ${cfgTrack[k] === '+' ? 'enabled' : 'disabled'}`).join('<br>');
            msgbox({ title: `Muler Config Changed`, msg: `You have made the following changes to the Muler configuration:<br>${changes}`, whisperto: recipient });
        } else {
            cfgTrack.playersneedcontrol = `${html.span('playersneedcontrol', localCSS.inlineEmphasis)}: ${manageState.get('playersNeedControl') ? 'enabled' : 'disabled'}`;
            message = `Muler is currently configured as follows:<br>${cfgTrack.playersneedcontrol}`;
            msgbox({ title: 'Muler Configuration', msg: message, whisperto: recipient });
        }

    };
    const mulegetter = (msg, msgstate = {}) => {
        let funcret = { runloop: false, status: 'unchanged', notes: '' };
        msg.variables = msg.variables || getEmptyVarObject();
        msg.mules = msg.mules || [];
        if (msg.type !== 'api' || !testGetConstructs(msg)) return funcret;
        if (!Object.keys(msgstate).length && scriptisplugin) return funcret;
        let status = [];
        let notes = [];
        let variables = msg.variables;
        //let characters = getMyCharacters(msg.playerid);
        
        // LOAD MULES ------------------------------------------------------------------
        let mulearray = [];
        // DETECT MULES
        [...msg.content.matchAll(mulerx)].forEach(match => {
            match[2].replace(muleabilrx, mule => {
                mulearray.push({ mule: mule.trim(), index: match.index });
                return '';
            });
        });
        [...msg.content.matchAll(getrx)].forEach(match => {
            if (match[5]) mulearray.push({ mule: `${match[1]}.${match[3]}`, index: match.index });
        });
        [...msg.content.matchAll(setrx)].forEach(match => {
            let res = match[1].split(/\s*=\s*/).shift().split('.');
            if (res.length > 2) mulearray.push({ mule: `${res[0]}.${res[1]}`, index: match.index });
        });

        mulearray = mulearray.sort((a, b) => a.index < b.index ? -1 : 1);
        mulearray = Object.keys(mulearray.reduce((m, v) => {
            m[v.mule] = v.index;
            return m;
        }, {}));
        msg.content = msg.content.replace(mulerx, '');

        // PROCESS MULES INTO ABILITIES AND GET VARIABLES --------------------------
        let mules = []; // new mules in this pass
        let tables = []; // new tables in this pass
        mulearray.forEach(m => {
            let source;
            let sourcetext = m.split('.').map(t => checkTicks(t));
            if (sourcetext.length > 1) { // use first portion as a character/table identifier
                if (sourcetext[0].toLowerCase() === 'table') {
                    source = tableFromAmbig(sourcetext[1]);
                    //if (source) tables.push(source);
                }
                else {
                    source = abilityFromAmbig(sourcetext[1], msg.playerid, charFromAmbig(sourcetext[0], msg.playerid));
                    //if (source) mules.push(source);
                }
            }
            if (!source) source = abilityFromAmbig(sourcetext[0], msg.playerid) || tableFromAmbig(sourcetext[0]);
            if (source && source.get('type') === 'rollabletable') tables.push(source);
            else if (source && source.get('type') === 'ability') mules.push(source);
        });

        mules = mules.filter(a => a);
        mules.forEach(a => {
            msg.mules.push(a);
            variables.mules[a.id] = variables.mules[a.id] || {};
            a.get('action')
                .split('\n')
                .filter(v => varrx.test(v))
                .forEach(v => {
                    let k = varrx.exec(v);
                    variables.mules[a.id][k[1]] = k[2];
                    variables.all[k[1]] = k[2];
                });
        });

        tables = tables.filter(t => t);
        tables.forEach(t => {
            msg.mules.push(t);
            variables.mules[t.id] = { ...libTable.getItemsByWeight(t), ...libTable.getItemsByName(t) };
            variables.alltables = { ...variables.alltables, ...variables.mules[t.id] };
        });

        const typeProcessor = {
            '!=': (r, t) => r != t, // eslint-disable-line eqeqeq
            '>': (r, t) => r > t,
            '>=': (r, t) => r >= t,
            '<': (r, t) => r < t,
            '<=': (r, t) => r <= t,
            '-': (r, l, h) => r >= l && r <= h,
        };
        const fillMuleParts = (...args) => { // indexing does not include the full return 'm'
            let thevar, thechar, themule, ovar, theask;

            if (args[4]) { // three elements filled (character.mule.variable)
                thechar = checkTicks(args[0]).toLowerCase() === 'table' ? 'table' : charFromAmbig(checkTicks(args[0]), msg.playerid);

                if (thechar && typeof thechar === 'string' && thechar === 'table') {
                    themule = msg.mules.filter(a => a.get('name') === checkTicks(args[2]))[0];
                } else if (thechar) {
                    themule = msg.mules.filter(a => a.get('name') === checkTicks(args[2]) && a.get('characterid') === thechar.id)[0];
                }
                thevar = checkTicks(args[4]);
                if (themule) ovar = msg.variables.mules[themule.id];
            } else if (args[2]) { // two elements filled (mule.variable)
                themule = msg.mules.filter(a => a.get('name') === checkTicks(args[0]))[0];
                thevar = checkTicks(args[2]);
                if (themule) {
                    ovar = msg.variables.mules[themule.id];
                    thechar = 'table';
                }
            } else { // one element filled (variable)
                thevar = checkTicks(args[0]);
                ovar = args[6] ? msg.variables.alltables : msg.variables.all;
            }
            if (args[6] || thechar === 'table') {
                let a6 = (args[6] || 'name').toLowerCase();
                switch (a6) {
                    case 'url':
                    case 'avatar':
                        theask = 'avatar';
                        break;
                    case 'image':
                    case 'html':
                        theask = 'image';
                        break;
                    default:
                        theask = 'name';
                }
            }
            return { thevar: thevar, themule: themule, thechar: thechar, theask: theask, ovar: ovar };
        };
        msg.content = msg.content.replace(getrx, (m, ...args) => {
            let retval;
            let varPackage = fillMuleParts(...args);

            if (varPackage.ovar) {
                if (varPackage.themule) {
                    if (varPackage.themule.get('type') === 'ability') retval = varPackage.ovar[varPackage.thevar];
                    else retval = varPackage.ovar.hasOwnProperty(varPackage.thevar) ? varPackage.ovar[varPackage.thevar][varPackage.theask] : undefined;
                } else { // pulling from variables.all or variables.alltables
                    if (varPackage.theask) retval = varPackage.ovar[varPackage.thevar] ? varPackage.ovar[varPackage.thevar][varPackage.theask] : undefined;
                }
            } 
            if (typeof retval === 'undefined' && varPackage.ovar && internalTestLib.num(varPackage.thevar)) { // no explicit variable, but we have a library and the variable is a number, so we check for a range key
                let varrangerx = /((?<low>-?\d+)-(?<high>-?\d+)|(?<range>!=|>=|<=|>|<)(?<singleval>-?\d+))$/;
                let res;
                let keys = Object.keys(varPackage.ovar)
                    .filter(k => varrangerx.test(k))
                    .filter(p => {
                        res = varrangerx.exec(p);
                        return res.groups.low ?
                            typeProcessor['-'](Number(varPackage.thevar), Number(res.groups.low), Number(res.groups.high)) :
                            typeProcessor[res.groups.range](Number(varPackage.thevar), Number(res.groups.singleval));
                    });
                if (keys.length && varPackage.ovar.hasOwnProperty(keys[0])) {
                    if (varPackage.themule) {
                        if (varPackage.themule.get('type') === 'ability') retval = varPackage.ovar[keys[0]];
                        else retval = varPackage.ovar[keys[0]][varPackage.theask];
                    } else { // pulling from variables.all or variables.alltables
                        retval = varPackage.theask ? varPackage.ovar[keys[0]][varPackage.theask] : varPackage.ovar[keys[0]];
                    }
                }
            }
            if (retval) {
                status.push('changed');
            } else {
                status.push('unresolved');
                notes.push(`Unable to resolve variable: ${m}`);
            }
            return retval || ``;
        });
        return condensereturn(funcret, status, notes);
    };

    const mulesetter = (msg, msgstate = {}) => {
        let funcret = { runloop: false, status: 'unchanged', notes: '' };
        msg.variables = msg.variables || getEmptyVarObject();
        let variables = msg.variables;
        msg.mules = msg.mules || [];
        if (msg.type !== 'api' || !testSetConstructs(msg)) return funcret;
        if (!Object.keys(msgstate).length && scriptisplugin) return funcret;
        let status = [];
        let notes = [];

        const fillMuleParts = (v) => { 
            let thevar, themule, thechar, ovar;
            let textparts = { themule: '', thechar: '' };
            let dotcount = v.split('.').length - 1;
            if (dotcount === 0) { //variable only
                thevar = v;
                if (msg.mules.length === 1) {
                    themule = msg.mules[0];
                    if (themule.get('type') === 'rollabletable') {
                        ovar = msg.variables.mules[themule.id];
                    } else {
                        thechar = charFromAmbig(themule.get('characterid'), msg.playerid);
                        if (thechar) ovar = msg.variables.mules[themule.id];
                    }
                } else {
                    ovar = msg.variables.all;
                }
            } else if (dotcount === 1) { // mule.variable
                [themule, thevar] = v.split('.');
                textparts.themule = themule;
                themule = msg.mules.filter(a => a.get('name') === themule)[0];
                if (themule) {
                    if (themule.get('type') === 'rollabletable') {
                        ovar = msg.variables.mules[themule.id];
                    } else {
                        thechar = charFromAmbig(themule.get('characterid'), msg.playerid);
                        if (thechar) ovar = msg.variables.mules[themule.id];
                    }
                }
            } else if (dotcount >= 2) { // char.mule.variable (perhaps more dots)
                [thechar, themule, ...thevar] = v.split('.');
                thevar = thevar.join('.');
                textparts.themule = themule;
                textparts.thechar = thechar;
                if (thechar.toLowerCase() === 'table') {
                    themule = msg.mules.filter(a => a.get('name') === themule)[0];
                } else {
                    thechar = charFromAmbig(thechar, msg.playerid);
                    themule = thechar ? msg.mules.filter(a => a.get('name') === themule && a.get('characterid') === thechar.id)[0] : undefined;
                }
                if (themule) ovar = msg.variables.mules[themule.id];
            }
            return { thevar: thevar, themule: themule, thechar: thechar, ovar: ovar, textparts: textparts };
        };

        msg.content = msg.content.replace(setrx, (m, g1) => {
            let setres = /^(.+?)(?:\s*=\s*)(.+)/.exec(g1);
            let [sv, sval] = [setres[1], setres[2]]; // [g1.slice(0, setres.index), g1.slice(setres.index + setres[0].length)];
            let varPackage = fillMuleParts(sv);
            let svar = varPackage.thevar;
            let localaction = '';

            // write new value back to mule ability
            let svarrx = new RegExp(`^${escapeRegExp(svar)}(?:\\s*=.*|$)`, 'm');
            if (!varPackage.ovar && varPackage.textparts.themule.length && varPackage.thechar) { // no mule found, but if a char.mule.var was specified, so we create it
                varPackage.themule = createObj('ability', { characterid: varPackage.thechar.id, name: varPackage.textparts.themule });
                msg.mules.push(varPackage.themule);
                variables.mules[varPackage.themule.id] = {};
                varPackage.ovar = variables.mules[varPackage.themule.id];
            }
            if (varPackage.ovar && varPackage.themule) {
                variables.all[svar] = sval;
                variables.mules[varPackage.themule.id][svar] = sval;
            }
            if (varPackage.themule && varPackage.themule.get('type') === 'ability') {
                localaction = varPackage.themule.get('action');
                if (svarrx.test(localaction)) {
                    localaction = localaction.replace(svarrx, `${svar}=${sval}`);
                } else { // no text in the action, or it's missing this variable
                    localaction = `${localaction.length ? localaction + '\n' : ''}${svar}=${sval}`;
                }
                varPackage.themule.set({ action: localaction });
            } else {
                notes.push(`Unable to save variable (no mule or table-mule specified): ${m}`);
            }
            status.push('changed');
            return '';
        });
        return condensereturn(funcret, status, notes);
    };

    const checkDependencies = (deps) => {
        /* pass array of objects like
            { name: 'ModName', version: '#.#.#' || '', mod: ModName || undefined, checks: [ [ExposedItem, type], [ExposedItem, type] ] }
        */
        const dependencyEngine = (deps) => {
            const versionCheck = (mv, rv) => {
                let modv = [...mv.split('.'), ...Array(4).fill(0)].slice(0, 4);
                let reqv = [...rv.split('.'), ...Array(4).fill(0)].slice(0, 4);
                return reqv.reduce((m, v, i) => {
                    if (m.pass || m.fail) return m;
                    if (i < 3) {
                        if (parseInt(modv[i]) > parseInt(reqv[i])) m.pass = true;
                        else if (parseInt(modv[i]) < parseInt(reqv[i])) m.fail = true;
                    } else {
                        // all betas are considered below the release they are attached to
                        if (reqv[i] === 0 && modv[i] === 0) m.pass = true;
                        else if (modv[i] === 0) m.pass = true;
                        else if (reqv[i] === 0) m.fail = true;
                        else if (parseInt(modv[i].slice(1)) >= parseInt(reqv[i].slice(1))) m.pass = true;
                    }
                    return m;
                }, { pass: false, fail: false }).pass;
            };

            let result = { passed: true, failures: {}, optfailures: {} };
            deps.forEach(d => {
                let failObj = d.optional ? result.optfailures : result.failures;
                if (!d.mod) {
                    if (!d.optional) result.passed = false;
                    failObj[d.name] = 'Not found';
                    return;
                }
                if (d.version && d.version.length) {
                    if (!(API_Meta[d.name].version && API_Meta[d.name].version.length && versionCheck(API_Meta[d.name].version, d.version))) {
                        if (!d.optional) result.passed = false;
                        failObj[d.name] = `Incorrect version. Required v${d.version}. ${API_Meta[d.name].version && API_Meta[d.name].version.length ? `Found v${API_Meta[d.name].version}` : 'Unable to tell version of current.'}`;
                        return;
                    }
                }
                d.checks.reduce((m, c) => {
                    if (!m.passed) return m;
                    let [pname, ptype] = c;
                    if (!d.mod.hasOwnProperty(pname) || typeof d.mod[pname] !== ptype) {
                        if (!d.optional) m.passed = false;
                        failObj[d.name] = `Incorrect version.`;
                    }
                    return m;
                }, result);
            });
            return result;
        };
        let depCheck = dependencyEngine(deps);
        let failures = '', contents = '', msg = '';
        if (Object.keys(depCheck.optfailures).length) { // optional components were missing
            failures = Object.keys(depCheck.optfailures).map(k => `&bull; <code>${k}</code> : ${depCheck.optfailures[k]}`).join('<br>');
            contents = `<span style="font-weight: bold">${apiproject}</span> utilizies one or more other scripts for optional features, and works best with those scripts installed. You can typically find these optional scripts in the 1-click Mod Library:<br>${failures}`;
            msg = `<div style="width: 100%;border: none;border-radius: 0px;min-height: 60px;display: block;text-align: left;white-space: pre-wrap;overflow: hidden"><div style="font-size: 14px;font-family: &quot;Segoe UI&quot;, Roboto, Ubuntu, Cantarell, &quot;Helvetica Neue&quot;, sans-serif"><div style="background-color: #000000;border-radius: 6px 6px 0px 0px;position: relative;border-width: 2px 2px 0px 2px;border-style:  solid;border-color: black;"><div style="border-radius: 18px;width: 35px;height: 35px;position: absolute;left: 3px;top: 2px;"><img style="background-color: transparent ; float: left ; border: none ; max-height: 40px" src="${apilogo}"></div><div style="background-color: #c94d4d;font-weight: bold;font-size: 18px;line-height: 36px;border-radius: 6px 6px 0px 0px;padding: 4px 4px 0px 43px;color: #ffffff;min-height: 38px;">MISSING MOD DETECTED</div></div><div style="background-color: white;padding: 4px 8px;border: 2px solid #000000;border-bottom-style: none;color: #404040;">${contents}</div><div style="background-color: white;text-align: right;padding: 4px 8px;border: 2px solid #000000;border-top-style: none;border-radius: 0px 0px 6px 6px"></div></div></div>`;
            sendChat(apiproject, `/w gm ${msg}`);
        }
        if (!depCheck.passed) {
            failures = Object.keys(depCheck.failures).map(k => `&bull; <code>${k}</code> : ${depCheck.failures[k]}`).join('<br>');
            contents = `<span style="font-weight: bold">${apiproject}</span> requires other scripts to work. Please use the 1-click Mod Library to correct the listed problems:<br>${failures}`;
            msg = `<div style="width: 100%;border: none;border-radius: 0px;min-height: 60px;display: block;text-align: left;white-space: pre-wrap;overflow: hidden"><div style="font-size: 14px;font-family: &quot;Segoe UI&quot;, Roboto, Ubuntu, Cantarell, &quot;Helvetica Neue&quot;, sans-serif"><div style="background-color: #000000;border-radius: 6px 6px 0px 0px;position: relative;border-width: 2px 2px 0px 2px;border-style:  solid;border-color: black;"><div style="border-radius: 18px;width: 35px;height: 35px;position: absolute;left: 3px;top: 2px;"><img style="background-color: transparent ; float: left ; border: none ; max-height: 40px" src="${apilogo}"></div><div style="background-color: #c94d4d;font-weight: bold;font-size: 18px;line-height: 36px;border-radius: 6px 6px 0px 0px;padding: 4px 4px 0px 43px;color: #ffffff;min-height: 38px;">MISSING MOD DETECTED</div></div><div style="background-color: white;padding: 4px 8px;border: 2px solid #000000;border-bottom-style: none;color: #404040;">${contents}</div><div style="background-color: white;text-align: right;padding: 4px 8px;border: 2px solid #000000;border-top-style: none;border-radius: 0px 0px 6px 6px"></div></div></div>`;
            sendChat(apiproject, `/w gm ${msg}`);
            return false;
        }
        return true;
    };

    let scriptisplugin = false;
    const mulerget = (m, s) => mulegetter(m, s);
    const mulerset = (m, s) => mulesetter(m, s);
    on('chat:message', mulegetter);
    on('chat:message', mulesetter);
    on('ready', () => {
        versionInfo();
        logsig();
        let reqs = [
            {
                name: 'libTable',
                version: `1.0.0`,
                mod: typeof libTable !== 'undefined' ? libTable : undefined,
                checks: [
                    ['getTable', 'function'],
                    ['getTables', 'function'],
                    ['getItems', 'function'],
                    ['getItemsByIndex', 'function'],
                    ['getItemsByName', 'function'],
                    ['getItemsByWeight', 'function'],
                    ['getItemsByWeightedIndex', 'function']
                ]
            },
            {
                name: 'Messenger',
                version: `1.0.0`,
                mod: typeof Messenger !== 'undefined' ? Messenger : undefined,
                checks: [['Button', 'function'], ['MsgBox', 'function'], ['HE', 'function'], ['Html', 'function'], ['Css', 'function']]
            }
        ];
        if (!checkDependencies(reqs)) return;

        html = Messenger.Html();
        css = Messenger.Css();
        HE = Messenger.HE;
        on('chat:message', handleConfig);

        scriptisplugin = (typeof ZeroFrame !== `undefined`);
        if (typeof ZeroFrame !== 'undefined') {
            ZeroFrame.RegisterMetaOp(mulerget, { priority: 25, handles: ['get', 'muleget', 'muleload', 'load'] });
            ZeroFrame.RegisterMetaOp(mulerset, { priority: 65, handles: ['set', 'muleset'] });
        }
    });
    return {
    };
})();
{ try { throw new Error(''); } catch (e) { API_Meta.Muler.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.Muler.offset); } }
