/*
=========================================================
Name			:	ShowButtons
GitHub			:	
Roll20 Contact	:	timmaugh
Version			:	1.0.2
Last Update		:	08 MAY 2025
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.ShowButtons = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.ShowButtons.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (13)); } }

const ShowButtons = (() => { // eslint-disable-line no-unused-vars
    const apiproject = 'ShowButtons';
    const version = '1.0.2';
    const apilogo = 'https://i.imgur.com/JLcfnek.png';
    const apilogoalt = 'https://i.imgur.com/IbS0DA7.png';    
    const schemaVersion = 0.3;
    API_Meta[apiproject].version = version;
    const vd = new Date(1746714262551);
    const versionInfo = () => {
        log(`\u0166\u0166 ${apiproject} v${API_Meta[apiproject].version}, ${vd.getFullYear()}/${vd.getMonth() + 1}/${vd.getDate()} \u0166\u0166 -- offset ${API_Meta[apiproject].offset}`);
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
    // ==================================================
    //		STATE MANAGEMENT
    // ==================================================
    const checkInstall = () => {
        if (!state.hasOwnProperty(apiproject) || state[apiproject].version !== schemaVersion) {
            log(`  > Updating ${apiproject} Schema to v${schemaVersion} <`);
            switch (state[apiproject] && state[apiproject].version) {

                case 0.1:
                    state[apiproject].settings.playerscanids = false;
                /* falls through */

                case 0.2:
                    state[apiproject].settings.verbose = false;
                    state[apiproject].defaults.verbose = false;
                /* falls through */

                case 'UpdateSchemaVersion':
                    state[apiproject].version = schemaVersion;
                    break;

                default:
                    state[apiproject] = {
                        settings: {
                            report: true,
                            playerscanids: false,
                            verbose: false
                        },
                        defaults: {
                            report: true,
                            playerscanids: false,
                            verbose: false
                        },
                        version: schemaVersion
                    }
                    break;
            }
        }
    };
    let stateReady = false;
    const assureState = () => {
        if (!stateReady) {
            checkInstall();
            stateReady = true;
        }
    };
    const manageState = { // eslint-disable-line no-unused-vars
        reset: () => state[apiproject].settings = _.clone(state[apiproject].defaults),
        clone: () => { return _.clone(state[apiproject].settings); },
        set: (p, v) => state[apiproject].settings[p] = v,
        get: (p) => { return state[apiproject].settings[p]; }
    };

    // ==================================================
    //		UTILITIES
    // ==================================================
    const escapeRegExp = (string) => { return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); };

    // ==================================================
    //		PRESENTATION
    // ==================================================
    let html = {};
    let css = {}; // eslint-disable-line no-unused-vars
    let HE = () => { }; // eslint-disable-line no-unused-vars
    const theme = {
        primaryColor: '#007999',
        primaryTextColor: '#232323',
        primaryTextBackground: '#ededed',
        secondaryColor: '#b6d2d9'
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
            'max-height': '30px',
            'max-width': '30px'
        },
        boundingcss: {
            'background-color': theme.primaryTextBackground
        },
        tablesectionheader: {
            'font-size': '1.2em',
            'background-color': theme.secondaryColor,
            'border-radius': '6px'
        },
        tablesubheading: {
            'border-bottom': `1px solid ${theme.secondaryColor}`,
            'font-size': '1.2em',
        },
        actionindicator: {
            'width': '6px',
            'font-family': 'pictos',
            'font-size': '1.1em'
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
        sendas: sendas = 'ShowButtons',
        whisperto: whisperto = '',
        footer: footer = '',
        btn: btn = ''
    } = {}) => {
        if (title) title = html.div(html.div(html.img(apilogoalt, 'ShowButtons Logo', localCSS.logoimg), localCSS.msgheaderlogodiv) + html.div(title, localCSS.msgheadercontent), {});
        Messenger.MsgBox({ msg: msg, title: title, bodycss: bodycss, sendas: sendas, whisperto: whisperto, footer: footer, btn: btn, headercss: headercss, footercss: footercss, boundingcss: localCSS.boundingcss, noarchive: true });
    };

    const getWhisperTo = (who) => who.toLowerCase() === 'api' ? 'gm' : who.replace(/\s\(gm\)$/i, '');

    // ==================================================
    //		ROLL20 DATA
    // ==================================================
    const hasAccess = pid => obj => {
        someCheck = id => id.toLowerCase() === 'all' || id === pid;
        let prop = (o = {
            macro: () => [...(obj.get('visibleto') || '').split(/\s*,\s*/), obj.get('playerid')].some(someCheck),
            ability: () => (getObj('character', obj.get('characterid'))?.get('controlledby') || '').split(/\s*,\s*/).some(someCheck),
            character: () => (obj.get('controlledby') || '').split(/\s*,\s*/).some(someCheck),
            default: () => undefined
        })[obj && obj.get && typeof obj.get === 'function' && Object.keys(o).includes(obj.get('type')) ? obj.get('type') : 'default']();

        return typeof prop === 'undefined' ? false : playerIsGM(pid) || prop;
    };
    const getChar = (query, pid) => {
        let character;
        if (typeof query !== 'string' || !query.length) return character;
        let qrx = new RegExp(escapeRegExp(query), 'i');
        let charsIControl = findObjs({ type: 'character' }).filter(hasAccess(pid));
        //charsIControl = playerIsGM(pid) || manageState.get('playerscanids') ? charsIControl : charsIControl.filter(c => {
        //    return c.get('controlledby').split(',').reduce((m, p) => {
        //        return m || p === 'all' || p === pid;
        //    }, false)
        //});
        character = charsIControl.filter(c => c.id === query)[0] ||
            charsIControl.filter(c => c.id === (getObj('graphic', query) || { get: () => { return '' } }).get('represents'))[0] ||
            charsIControl.filter(c => c.get('name') === query)[0] ||
            charsIControl.filter(c => {
                qrx.lastIndex = 0;
                return qrx.test(c.get('name'));
            })[0];
        return character;
    };

    // ==================================================
    //		TOKENIZING
    // ==================================================
    const tokenize = (cmd) => {
        let pos = 0;
        let tokens = [];
        class ObjectToken {
            constructor({ type: type = '', char: char = '', query: query = '' } = {}) {
                this.type = type;
                this.char = char;
                this.query = query;
            }
        }

        const getNext = () => {
            const ticksrx = /^(`[^`#|]+`|'[^'#|]+'|"[^"#|]+")/;
            let ret;
            if (ticksrx.test(cmd.slice(pos))) {
                ret = ticksrx.exec(cmd.slice(pos));
                pos += ret[0].length;
                return ret[0].slice(1, ret[0].length - 1);
            } else {
                ret = /^[^\s#|]*?(?=\s|#|\||$)/.exec(cmd.slice(pos));
                pos += ret[0].length;
                return ret[0];
            }
        };

        const getToken = () => {
            let tok = new ObjectToken();
            let first = getNext();
            if (['#', '|'].includes(cmd.charAt(pos))) {
                tok.type = 'ability';
                tok.char = first;
                pos++;
                tok.query = getNext();
                pos++;
            } else if ([' '].includes(cmd.charAt(pos)) || pos >= cmd.length) {
                tok.type = 'macro';
                tok.query = first;
                pos++;
            } else {
                tok.type = 'error';
                tok.query = `Unexpected character at position ${pos} of: ${cmd}`;
                pos++;
            }
            return tok;
        };

        while (pos <= cmd.length) {
            tokens.push(getToken());
        }
        return tokens;
    };

    // ==================================================
    //		HANDLE INPUT
    // ==================================================
    const testHandles = (cmd) => {
        if (/^!showbuttons?\b/i.test(cmd)) return true;
    };
    const finders = {
        macro: (props) => findObjs({ type: 'macro', ...props }),
        ability: (props) => findObjs({ type: 'ability', ...props })
    };
    const handleInput = (msg) => {
        if (msg.type !== 'api' || !testHandles(msg.content)) return;
        let report = manageState.get('report');
        let argObj = msg.content.split(/\s+--/).slice(1)
            .filter(a => {
                if (['report','silent'].includes(a.toLowerCase())) report = a.toLowerCase() === 'report';
                return !['report', 'silent'].includes(a.toLowerCase());
            })
            .map(a => {
                if (a.indexOf(' ') > 0) return [a.slice(0, a.indexOf(' ')).toLowerCase(), a.slice(a.indexOf(' ') + 1).trim()];
            })
            .filter(a => a)
            .reduce((m, a) => {
                m[a[0]] = [...(m[a[0]] || []), ...tokenize(a[1])];
                return m;
            }, {});
        let switchObj = {
            'show': () => true,
            'hide': () => false,
            'toggle': (c) => !c
        };
        let reportList = {};

        Object.keys(argObj).filter(k => Object.keys(switchObj).includes(k.toLowerCase())).forEach(k => {
            argObj[k].forEach(a => {
                let character = getChar(a.char, msg.playerid) || { id: undefined };
                let fArgs = {
                    macro: {},
                    ability: { characterid: character.id }
                }
                let found = a.query.toLowerCase() === 'all'
                    ? (finders[a.type] || (() => []))(fArgs[a.type]).filter(hasAccess(msg.playerid))
                    : [(finders[a.type] || (() => []))({ name: a.query, ...fArgs[a.type] }).filter(hasAccess(msg.playerid))[0]]
                    ;

                //found.forEach(o => {
                //    if (o) {
                //        reportList[k] = [
                //            ...(reportList[k] || []),
                //            {
                //                ...a,
                //                id: o.id,
                //                name: o.get('name'),
                //                action: switchObj[k](o.get('istokenaction')),
                //                change: (switchObj[k] || (() => { }))(o.get('istokenaction')) === o.get('istokenaction')
                //            }
                //        ];
                //        o.set({ istokenaction: (switchObj[k] || (() => { }))(o.get('istokenaction')) });
                //    } else {
                //        reportList.notfound = [...(reportList.notfound || []), a];
                //    }
                //})
                reportList = found.reduce((m, o) => {
                    if (o) {
                        m.hasOwnProperty(o.id)
                            ? m[o.id].action = switchObj[k.toLowerCase()](m[o.id].action)
                            : m[o.id] = {
                                name: o.get('name'),
                                type: o.get('type'),
                                char: character.id ? character.get('name') : '',
                                action: switchObj[k.toLowerCase()](o.get('istokenaction')),
                                initial: o.get('istokenaction'),
                                obj: o
                            }
                            ;
                    } else {
                        m.notfound = [...(m.notfound || []), a];
                    }

                    return m;
                }, reportList);
            });
        });
        Object.entries(reportList)
            .filter(([key,val]) => key !== 'notfound' && val.action !== val.initial)
            .forEach(([_key, val]) => val.obj.set({ istokenaction: val.action }));
        let verbose = manageState.get('verbose');
        if (report) {
            let recipient = getWhisperTo(msg.who);
            let message = html.table(
                html.tr(html.td('&nbsp;', { 'width': '6px' }) + html.td(`&nbsp;`, localCSS.inlineEmphasis, localCSS.tablesubheading) + html.td(`NAME`, localCSS.inlineEmphasis, localCSS.tablesubheading) + html.td(`CHARACTER`, localCSS.inlineEmphasis, localCSS.tablesubheading)) +
                Object.entries(reportList)
                    .filter(([key, val]) => key !== 'notfound' && (verbose || val.action !== val.initial))
                    .map(([_key,val]) => {
                        return html.tr(
                            html.td('L', localCSS.actionindicator, { 'color': val.action ? '#0bcd0b' : '#DD2222' }) +
                            html.td(val.type === 'ability' ? '%' : '#', { 'text-align': 'right' }) +
                            html.td(val.name) + html.td(val.char)
                        )
                    }).join('')
            );
            msgbox({ title: `ShowButtons Report`, whisperto: recipient, msg: message });
        }
    };

    // ==================================================
    //		HANDLE CONFIG
    // ==================================================
    const handleConfig = msg => {
        if (msg.type !== 'api' || !/^!showbuttons?config/.test(msg.content)) return;
        let recipient = getWhisperTo(msg.who);
        if (!playerIsGM(msg.playerid)) {
            msgbox({ title: 'GM Rights Required', msg: 'You must be a GM to perform that operation', whisperto: recipient });
            return;
        }
        let cfgrx = /^(\+|-)(report|playerscanids|verbose)$/i;
        let res;
        let cfgTrack = {};
        let message;
        if (/^!showbuttons?config\s+[^\s]/.test(msg.content)) {
            msg.content.split(/\s+/).slice(1).forEach(a => {
                res = cfgrx.exec(a);
                if (!res) return;
                if (res[2].toLowerCase() === 'report') {
                    manageState.set('report', (res[1] === '+'));
                    cfgTrack[res[2]] = res[1];
                } else if (res[2].toLowerCase() === 'playerscanids') {
                    manageState.set('playerscanids', (res[1] === '+'));
                    cfgTrack[res[2]] = res[1];
                } else if (res[2].toLowerCase() === 'verbose') {
                    manageState.set('verbose', (res[1] === '+'));
                    cfgTrack[res[2]] = res[1];
                }
            });
            let changes = Object.keys(cfgTrack).map(k => `${html.span(k, localCSS.inlineEmphasis)}: ${cfgTrack[k] === '+' ? 'ON' : 'OFF'}`).join('<br>');
            msgbox({ title: `ShowButtons Config Changed`, msg: `You have made the following changes to the <b>ShowButtons</b> configuration:<br>${changes}`, whisperto: recipient });
        } else { // naked call to config, show panel of current config
            cfgTrack.report = `${html.span('report', localCSS.inlineEmphasis)}: ${manageState.get('report') ? 'ON' : 'OFF'}`;
            cfgTrack.playerscanids = `${html.span('playerscanids', localCSS.inlineEmphasis)}: ${manageState.get('playerscanids') ? 'ON' : 'OFF'}`;
            cfgTrack.verbose = `${html.span('verbose', localCSS.inlineEmphasis)}: ${manageState.get('verbose') ? 'ON' : 'OFF'}`;
            message = `<b>ShowButtons</b> is currently configured as follows:<br>${cfgTrack.report}<br>${cfgTrack.playerscanids}`;
            msgbox({ title: 'ShowButtons Configuration', msg: message, whisperto: recipient });
        }
    };

    // ==================================================
    //		DEPENDENCIES
    // ==================================================
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
            msg = `<div style="width: 100%;border: none;border-radius: 0px;min-height: 60px;display: block;text-align: left;white-space: pre-wrap;overflow: hidden"><div style="font-size: 14px;font-family: &quot;Segoe UI&quot;, Roboto, Ubuntu, Cantarell, &quot;Helvetica Neue&quot;, sans-serif"><div style="background-color: #000000;border-radius: 6px 6px 0px 0px;position: relative;border-width: 2px 2px 0px 2px;border-style:  solid;border-color: black;"><div style="border-radius: 18px;width: 35px;height: 35px;position: absolute;left: 3px;top: 2px;"><img style="background-color: transparent ; float: left ; border: none ; max-height: 40px" src="${typeof apilogo !== 'undefined' ? apilogo : 'https://i.imgur.com/kxkuQFy.png'}"></div><div style="background-color: #c94d4d;font-weight: bold;font-size: 18px;line-height: 36px;border-radius: 6px 6px 0px 0px;padding: 4px 4px 0px 43px;color: #ffffff;min-height: 38px;">MISSING MOD DETECTED</div></div><div style="background-color: white;padding: 4px 8px;border: 2px solid #000000;border-bottom-style: none;color: #404040;">${contents}</div><div style="background-color: white;text-align: right;padding: 4px 8px;border: 2px solid #000000;border-top-style: none;border-radius: 0px 0px 6px 6px"></div></div></div>`;
            sendChat(apiproject, `/w gm ${msg}`);
        }
        if (!depCheck.passed) {
            failures = Object.keys(depCheck.failures).map(k => `&bull; <code>${k}</code> : ${depCheck.failures[k]}`).join('<br>');
            contents = `<span style="font-weight: bold">${apiproject}</span> requires other scripts to work. Please use the 1-click Mod Library to correct the listed problems:<br>${failures}`;
            msg = `<div style="width: 100%;border: none;border-radius: 0px;min-height: 60px;display: block;text-align: left;white-space: pre-wrap;overflow: hidden"><div style="font-size: 14px;font-family: &quot;Segoe UI&quot;, Roboto, Ubuntu, Cantarell, &quot;Helvetica Neue&quot;, sans-serif"><div style="background-color: #000000;border-radius: 6px 6px 0px 0px;position: relative;border-width: 2px 2px 0px 2px;border-style:  solid;border-color: black;"><div style="border-radius: 18px;width: 35px;height: 35px;position: absolute;left: 3px;top: 2px;"><img style="background-color: transparent ; float: left ; border: none ; max-height: 40px" src="${typeof apilogo !== 'undefined' ? apilogo : 'https://i.imgur.com/kxkuQFy.png'}"></div><div style="background-color: #c94d4d;font-weight: bold;font-size: 18px;line-height: 36px;border-radius: 6px 6px 0px 0px;padding: 4px 4px 0px 43px;color: #ffffff;min-height: 38px;">MISSING MOD DETECTED</div></div><div style="background-color: white;padding: 4px 8px;border: 2px solid #000000;border-bottom-style: none;color: #404040;">${contents}</div><div style="background-color: white;text-align: right;padding: 4px 8px;border: 2px solid #000000;border-top-style: none;border-radius: 0px 0px 6px 6px"></div></div></div>`;
            sendChat(apiproject, `/w gm ${msg}`);
            return false;
        }
        return true;
    };

    const registerEventHandlers = () => {
        on('chat:message', handleInput);
        on('chat:message', handleConfig);
    };

    on('ready', () => {
        versionInfo();
        assureState();
        logsig();
        let reqs = [
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

        registerEventHandlers();
    });
    return {};
})();

{ try { throw new Error(''); } catch (e) { API_Meta.ShowButtons.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.ShowButtons.offset); } }
/* */