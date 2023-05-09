/*
=========================================================
Name            : ZeroFrame
GitHub          : https://github.com/TimRohr22/Cauldron/tree/master/ZeroFrame
Roll20 Contact  : timmaugh
Version         : 1.1.6
Last Update     : 5/8/2023
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.ZeroFrame = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.ZeroFrame.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (12)); } }

const ZeroFrame = (() => { //eslint-disable-line no-unused-vars
    // ==================================================
    //		VERSION
    // ==================================================
    const apiproject = 'ZeroFrame';
    API_Meta[apiproject].version = '1.1.6';
    const schemaVersion = 0.2;
    const vd = new Date(1683600799493);
    let stateReady = false;
    const checkInstall = () => {
        if (!state.hasOwnProperty(apiproject) || state[apiproject].version !== schemaVersion) {
            log(`  > Updating ${apiproject} Schema to v${schemaVersion} <`);
            switch (state[apiproject] && state[apiproject].version) {
                case 0.1:
                    state[apiproject].config.singlebang = true;
                /* break; // intentional dropthrough */ /* falls through */
                case 0.2:
                /* break; // intentional dropthrough */ /* falls through */
                case 'UpdateSchemaVersion':
                    state[apiproject].version = schemaVersion;
                    break;

                default:
                    state[apiproject] = {
                        config: {
                            looporder: [],
                            logging: false,
                            singlebang: true
                        },
                        version: schemaVersion
                    };
                    break;
            }
        }
    };
    const assureState = () => {
        if (!stateReady) {
            checkInstall();
            stateReady = true;
        }
    };
    const versionInfo = () => {
        log(`\u0166\u0166 ${apiproject} v${API_Meta[apiproject].version}, ${vd.getFullYear()}/${vd.getMonth() + 1}/${vd.getDate()} \u0166\u0166 -- offset ${API_Meta[apiproject].offset}`);
        assureState();
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
    //		MESSAGE STORAGE
    // ==================================================
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
    const preservedMsgObj = {};
    const batchMsgLibrary = {}; // will contain key pairs of UUID:originalMsg

    // ==================================================
    //		META-OP REGISTRATION
    // ==================================================

    const loopFuncs = [];

    class Func {
        constructor({ func: func = () => { }, priority: priority = 50, handles: handles = [] }) {
            this.name = func.name || handles[0] || 'unknown';
            this.func = func;
            this.priority = priority;
            this.handles = [func.name, ...handles.filter(h => h !== func.name)]
        }
    }

    const registerMetaOp = (func, options = { priority: 50, handles: [] }) => {
        assureState();
        if (!(func.name || (options.handles && options.handles.length))) {
            log(`Functions registered for the loop must bear a name or a handle. The unnamed function attempted to register after ${Object.keys(loopFuncs).join(', ')}`);
            return;
        }
        let rFunc = new Func({ func, ...options });
        let statefunc;
        if (state[apiproject].config.looporder && state[apiproject].config.looporder.length) {
            statefunc = state[apiproject].config.looporder.filter(f => f.name === (rFunc.name || rFunc.handles[0]))[0];
        }
        if (statefunc) {
            rFunc.priority = statefunc.priority || rFunc.priority;
            statefunc.handles = [...new Set([...statefunc.handles, ...rFunc.handles])];
        } else {
            state[apiproject].config.looporder.push(rFunc);
        }
        if (!loopFuncs.filter(f => f.name === rFunc.name || f.name === rFunc.handles[0]).length) {
            loopFuncs.push(rFunc);
        }
    };
    const initState = () => {
        return {
            runloop: true,
            loopcount: 0,
            logging: state[apiproject].config.logging || false,
            looporder: loopFuncs.sort((a, b) => a.priority > b.priority ? 1 : -1),
            history: [],
            duplicatecount: 0
        }
    };
    const trackhistory = (msg, preservedstate, props = {}) => {
        preservedstate.history.push({
            action: props.action,
            content: msg.content,
            notes: props.notes || '',
            status: props.status || ''
        });
    };

    // ==================================================
    //      LOGGING
    // ==================================================
    const handleLogging = (msg, preservedstate) => {
        let logrx = /{\s*&\s*log\s*}/ig;
        msg.content = msg.content.replace(logrx, (r => { //eslint-disable-line no-unused-vars
            preservedstate.logging = true;
            return '';
        }));
    };
    // ==================================================
    //      MESSAGING AND REPORTING
    // ==================================================
    const HE = (() => { //eslint-disable-line no-unused-vars
        const esRE = (s) => s.replace(/(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\||\.|\^|\$)/g, '\\$1');
        const e = (s) => `&${s};`;
        const entities = {
            '<': e('lt'),
            '>': e('gt'),
            "'": e('#39'),
            '@': e('#64'),
            '{': e('#123'),
            '|': e('#124'),
            '}': e('#125'),
            '[': e('#91'),
            ']': e('#93'),
            '"': e('quot'),
            '*': e('#42')
        };
        const re = new RegExp(`(${Object.keys(entities).map(esRE).join('|')})`, 'g');
        return (s) => s.replace(re, (c) => (entities[c] || c));
    })();
    const msgframe = `<div class="wrapper" style="width: 100%; position: relative; overflow: hidden;"><div class="logo" style="position: absolute; left: 5px; top: 0px; z-index: 2;"> <img src="https://imgur.com/Rz2uclB.png" height="80"></div><div class="mainvisbox" style="font-family: 'Helvetica Neue', 'Arial', sans-serif; font-size: 12px; border-radius: 20px; position: relative; box-shadow: 5px 5px 5px #909090; margin: 35px 7px 7px 0px; overflow: hidden; z-index: 1; background-color: #1f2431;"><div class="headerrow" style="min-height: 50px; overflow: hidden;"><div class="title" style="margin: auto; margin-left: 45px; font-size: 2.5em; color: rgba(232, 232, 232, 1); text-align: center; line-height: 50px; font-family: 'Contrail One','Arial', sans-serif; text-shadow: 1px 1px 1px #909090;"> ZeroFrame</div></div><div class="bodywrapper" style="margin: 0px 7px;"><div class="bodybox-message" style="background-color: rgba(232,232,232,0); width: 100%; overflow: hidden; border-radius: 6px;"><div class="bodyboxinterior-message" style="width: 98%; overflow: hidden; margin: 3px auto 3px;"> __BODYCONTENT__</div></div></div><div class="footerrow" style="min-height: 20px; overflow: hidden;"> &nbsp;</div></div></div>`;
    const msgsimpleframe = `<div class="wrapper" style="width: 100%; position: relative; overflow: hidden;"><div class="logo" style="position: absolute; left: 5px; top: 0px; z-index: 2;"> <img src="https://imgur.com/Rz2uclB.png" height="80"></div><div class="mainvisbox" style="font-family: 'Helvetica Neue', 'Arial', sans-serif; font-size: 12px; border-radius: 20px; position: relative; box-shadow: 5px 5px 5px #909090; margin: 35px 7px 7px 0px; overflow: hidden; z-index: 1; background-color: #1f2431;"><div class="headerrow" style="min-height: 50px; overflow: hidden;"><div class="title" style="margin: auto; margin-left: 45px; font-size: 2.5em; color: rgba(232, 232, 232, 1); text-align: center; line-height: 50px; font-family: 'Contrail One','Arial', sans-serif; text-shadow: 1px 1px 1px #909090;"> ZeroFrame</div></div><div class="bodywrapper" style="margin: 0px 7px;"><div class="bodybox-message" style="background-color: rgba(232,232,232,1); width: 100%; overflow: hidden; border-radius: 6px;"><div class="bodyboxinterior-message" style="width: 98%; overflow: hidden; margin: 3px auto 3px;"> __BODYCONTENT__</div></div></div><div class="footerrow" style="min-height: 20px; overflow: hidden;"> &nbsp;</div></div></div>`;
    const msgsimplecontent = `<div class="bodycontent" style="width: 98%; margin: 0px auto;"> __CONTENTMESSAGE__</div>`;
    const msgconfigcontent = `<div class="bodycontent" style="width: 98%; margin: 0px auto;"><div class="scriptnames" style="overflow: hidden; background-color: rgba(232, 232, 232, 1); width: 100%; min-height: 40px; position: relative; border-radius: 20px; margin-top: 3px;"><div class="prioritycircle" style="width: 40px; height: 100%; border-radius: 20px 0px 0px 20px; border-right: 3px solid #1f2431; line-height: 40px; text-align: center; font-size: 2em; font-family: 'Contrail One',Arial,sans-serif; color: black; vertical-align: top; background-color: #ff9637; display: inline-block; position: absolute; left: 0px; top: 0px;"> <a style="height: 100%;font-family: &quot;contrail one&quot; , &quot;arial&quot; , sans-serif;color: black;background-color: #ff9637;display: inline-block;border:0px;text-align: center;line-height: 40px;padding: 0px;" href="!0 __ALIAS1__|?{Enter new priority for __SCRIPTNAME__|__PRIORITY__}">__PRIORITY__</a></div><div class="scriptname" style="font-family: 'Contrail One','Arial', sans-serif; font-size: 1.5em; color: black; margin-left: 50px; margin-top: 3px;">__SCRIPTNAME__</div><div class="scriptaliases" style="font-size: 1em; text-align: left; margin-left: 50px; margin-top: 1px; overflow: hidden;">__ALIASES__</div></div></div>`;
    //    const msgconfigcontent = `<div class="bodycontent" style="width: 98%; margin: 0px auto;"><div class="scriptnames" style="overflow: hidden; background-color: rgba(232, 232, 232, 1); width: 100%; min-height: 40px; position: relative; border-radius: 20px; margin-top: 3px;"><div class="prioritycircle" style="width: 40px; height: 100%; border-radius: 20px 0px 0px 20px; border-right: 3px solid #1f2431; line-height: 40px; text-align: center; font-size: 2em; font-family: 'Contrail One',Arial,sans-serif; color: black; vertical-align: top; background-color: #ff9637; display: inline-block; position: absolute; left: 0px; top: 0px;">__PRIORITY__</div><div class="scriptname" style="font-family: 'Contrail One','Arial', sans-serif; font-size: 1.5em; color: black; margin-left: 50px; margin-top: 3px;">__SCRIPTNAME__</div><div class="scriptaliases" style="font-size: 1em; text-align: left; margin-left: 50px; margin-top: 1px; overflow: hidden;">__ALIASES__</div></div></div>`;
    const msglogcontent = `<div class="bodycontent" style="width: 98%; margin: 0px auto;min-height: 25px;"><div class="scriptnames-log" style="overflow: hidden; background-color: rgba(232, 232, 232, 1); width: 100%; min-height: 20px; position: relative;"><div class="status" style="width: 20px; height: 20px; color: white; vertical-align: top; border-radius: 10px; box-shadow: 1px 1px 2px #162533; position: absolute; left: 0px; top: 0px; background-image: linear-gradient(45deg, __STATUSCOLOR__, __STATUSCOLOR__30);"><div class="status-shine" style="width: 20px; height: 20px; vertical-align: top; border-radius: 10px; position: absolute; left: 0px; top: 0px; background-image: linear-gradient(180deg, transparent, transparent, rgba(255, 255, 255, .35));">&nbsp;</div></div><div class="scriptname-log" style="font-family: 'Contrail One','Arial', sans-serif; font-size: 1.5em; color: black; margin-left: 30px; margin-top: 2px;">__SCRIPTNAME__</div><div class="scriptaliases-log" style="font-size: 1em; text-align: left; margin-left: 30px; margin-top: 2px; overflow: hidden;">__LOGMESSAGE__</div></div></div>`;

    const msgboxfull = ({ c: c = 'chat message', sendas: sas = 'API', wto: wto = '', simple: simple = false }) => {
        let msg = (simple ? msgsimpleframe : msgframe).replace("__BODYCONTENT__", c);
        if (!['API', ''].includes(wto)) msg = `/w "${wto.replace(' (GM)', '')}" ${msg}`;
        sendChat(sas, msg);
    };
    const msgbox = ({ c: c = 'chat message', sendas: sas = 'API', wto: wto = '' }) => {
        let msg = msgsimplecontent.replace('__CONTENTMESSAGE__', c);
        msgboxfull({ c: msg, wto: wto, simple: true, sendas: sas });
    }
    const buildLog = (msg, ps, apitrigger) => {
        const statuscolor = {
            loop: '#ff9637',
            changed: '#339b00',
            unchanged: '#001ea6',
            unresolved: '#b70000',
            stop: '#b70000',
            simple: '#ff9637',
            release: '#001ea6'
        }
        let rows = ps.history.reduce((m, v) => {
            if (/^ORIGINAL/.test(v.action)) return m;
            let note = '';
            switch (v.status) {
                case 'unchanged':
                    if (v.notes.length) note = `NOTES: ${v.notes}`;
                    break;
                case 'release':
                case 'stop':
                case 'simple':
                    if (v.notes.length) note = `NOTES: ${v.notes}`;
                    note += note.length ? '<br>' : '';
                    note += `<b>FINAL MESSAGE</b><br>${v.content.replace(apitrigger, '').replace(/&{template:/g, `&#38;{template:`)}`;
                    break;
                default:
                    note = v.content.replace(apitrigger, '');
                    if (v.notes.length) note += `<br>NOTES: ${v.notes}`;
            }
            // if (v.status !== 'unchanged') note = v.content.replace(apitrigger,'');
            // if (note.length && v.notes.length) note += `<br>NOTES: ${v.notes}`;
            return m + msglogcontent
                .replace(/__STATUSCOLOR__/g, c => { return statuscolor[v.status] || statuscolor.loop; }) //eslint-disable-line no-unused-vars
                .replace('__SCRIPTNAME__', v.action.toUpperCase())
                .replace('__LOGMESSAGE__', note);
        }, '');
        msgboxfull({ c: rows, wto: msg.who, simple: true });

    };
    const buildConfig = (msg) => {
        let looporder = loopFuncs.sort((a, b) => a.priority > b.priority ? 1 : -1);
        let rows = looporder.reduce((m, v) => {
            return m + msgconfigcontent
                .replace(/__PRIORITY__/g, v.priority)
                .replace(/__SCRIPTNAME__/g, v.name)
                .replace(/__ALIASES__/g, v.handles.join(', '))
                .replace(/__ALIAS1__/g, v.handles[0]);
        }, '');

        msgboxfull({ c: rows, wto: msg.who });

    };

    // ==================================================
    //      REGEX MANAGEMENT
    // ==================================================
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
    const getConfigItem = e => {
        return state[apiproject].config[e];
    };

    // ==================================================
    //      ROLL MANAGEMENT
    // ==================================================
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
        // return preserved.content;
    };
    const getValues = (msg, lastpass = false) => {
        // replace inline rolls tagged with .value
        const valuerx = /\$\[\[(?<rollnumber>\d+)]]\.value/gi;
        const value2rx = /\({&(?<rollnumber>\d+)}\)\.value/gi;
        let retval = false;
        msg.content = msg.content.replace(valuerx, ((r, g1) => {
            retval = true;
            if (msg.inlinerolls.length > g1) {
                return msg.parsedinline[g1].value;
            } else if (lastpass) {
                return '0';
            } else {
                return r;
            }
        }));
        msg.content = msg.content.replace(value2rx, ((r, g1) => {
            if (msg.inlinerolls.length > g1) {
                retval = true;
                return msg.parsedinline[g1].value;
            } else if (lastpass) {
                retval = true;
                return '0';
            } else {
                return r;
            }
        }));
        return retval;
    };
    const getLoopRolls = (msg, preserved, preservedstate) => {
        let replaceTrack = {};
        if (msg.inlinerolls) {
            // insert inline rolls to preserved message, correct the placeholder shorthand index
            msg.inlinerolls.forEach((r, i) => {
                preserved.inlinerolls.push(r);
                replaceTrack[i] = (preserved.inlinerolls.length - 1);
            });
            Object.keys(replaceTrack).reverse().forEach(k => {
                msg.content = msg.content.replace(new RegExp(`\\$\\[\\[(${k})]]`, 'g'), `$[[${replaceTrack[k]}]]`);
            });
            preserved.parsedinline = [...(preserved.parsedinline || []), ...libInline.getRollData(msg)];
            preservedstate.runloop = true;
        }
    };
    // ==================================================
    //      GLOBAL DEFINITIONS
    // ==================================================

    const getGlobals = msg => {

        class TextToken {
            constructor({ value: value = '' } = {}) {
                this.type = 'text';
                this.value = value;
            }
        }
        class GlobalToken {
            constructor({ value: value = '' } = {}) {
                this.type = 'global';
                this.value = value;
            }
        }
        let index = 0;
        let gres;
        let globalrx = /{&\s*globals?\s+/gi;
        //        let definitionrx = /\(\s*\[\s*(?<term>.+?)\s*]\s*('|"|`?)(?<definition>.*?)\2\)\s*/g;
        let definitionrx = /\(\s*\[\s*(?<term>.+?)\s*]\s*('|"|`?)(?<definition>.*?)\2(?:\)(?<!\({&\d+}\)\s*))\s*/g;
        let tokens = [];

        const closureCheck = (c, counter = 0) => {
            let pos = 0;
            let loop = true;
            while (loop && pos <= c.length - 1) {
                if (c.charAt(pos) === '{') counter++;
                else if (c.charAt(pos) === '}') counter--;
                if (counter === 0) loop = false;
                pos++;
            }
            return loop ? undefined : pos;
        }
        while (globalrx.test(msg.content)) {
            globalrx.lastIndex = index;
            gres = globalrx.exec(msg.content);
            tokens.push(new TextToken({ value: msg.content.slice(index, gres.index) }));
            let p = closureCheck(msg.content.slice(gres.index)) || gres[0].length;
            tokens.push(new GlobalToken({ value: msg.content.slice(gres.index, gres.index + p) }));
            index = gres.index + p;
        }
        tokens.push(new TextToken({ value: msg.content.slice(index) }));
        definitionrx.lastIndex = 0;
        return tokens.reduce((m, t) => {
            if (t.type === 'text' || (t.type === 'global' && !/}$/.test(t.value))) {
                m.cmd = `${m.cmd}${t.value}`;
            } else {
                t.value.replace(definitionrx, (match, term, _, def) => {
                    m.globals[term] = def;
                    return match;
                });
            }
            return m;
        }, { cmd: '', globals: {} });

    };
    // ==================================================
    //      THE LOOP & LOOP MANAGEMENT
    // ==================================================
    const setOrder = (msg, preservedstate) => {
        let orderrx = /(\()?{&\s*0\s+([^}]+?)\s*}((?<=\({&\s*0\s+([^}]+?)\s*})\)|\1)/g;
        msg.content = msg.content.replace(orderrx, (m, padding, list) => {
            let order = list
                .split(/\s+/)
                .map(l => preservedstate.looporder.filter(f => f.name === l || f.handles.includes(l))[0])
                .filter(f => f);
            let orderedfuncs = order.map(f => f.name);
            preservedstate.looporder = [...order, ...preservedstate.looporder.filter(f => !orderedfuncs.includes(f.name))];
            return '';
        })
    };
    const runLoop = (preserved, preservedstate, apitrigger, msg = {}) => {
        const delayrx = /{&\s*delay(?:\((.+?)\))?\s+(.*?)\s*}/gi
        preservedstate.runloop = false;
        preservedstate.loopcount++;
        trackhistory(msg, preservedstate, { action: `LOOP ${preservedstate.loopcount}` });
        handleLogging(msg, preservedstate);
        setOrder(msg, preservedstate);
        if (preservedstate.logging) {
            log(`LOOP ${preservedstate.loopcount}`);
        }
        if (preservedstate.logging) {
            log(`====MSG DATA====`);
            log(`  CONT: ${preserved.content}`);
            log(`  DEFS: ${JSON.stringify(preserved.definitions || [])}`);
        }
        getLoopRolls(msg, preserved, preservedstate);
        preserved.content = msg.content.replace(/(<br\/>)?\n/g, '({&br})');
        if (!preserved.rolltemplate && msg.rolltemplate && msg.rolltemplate.length) preserved.rolltemplate = msg.rolltemplate;
        msg.content = `${msg.apitrigger}`;
        // manage delay
        let delay = 0;
        let delaydeferrals = [];
        preserved.content = preserved.content.replace(delayrx, (m, def, del) => {
            delay = Math.max(delay, (Number(del) || 0));
            if (def) delaydeferrals.push(def);
            return '';
        });
        if (delay > 0) {
            let delaycmd = delaydeferrals.reduce((m, def) => {
                m = m.replace(new RegExp(escapeRegExp(def), 'g'), '');
                return m;
            }, preserved.content);
            setTimeout(sendChat, delay * 1000, '', delaycmd);
            msg.content = ''; // flatten the original message so other scripts don't take action
            return { delay: true };
        }
        preservedstate.runloop = getValues(preserved) || preservedstate.runloop;
        // manage global definitions
        let globalCheck = getGlobals(preserved);
        let globalnote = 'No global detected.';
        if (Object.keys(globalCheck.globals).length) {
            globalnote = Object.keys(globalCheck.globals).map(k => `&bull; ${k}: ${globalCheck.globals[k]}`).join('<br>');
        }
        preserved.globals = Object.assign({}, (preserved.globals || {}), globalCheck.globals);
        Object.keys(preserved.globals).forEach(k => {
            globalCheck.cmd = globalCheck.cmd.replace(new RegExp(escapeRegExp(k), 'g'), preserved.globals[k]);
        });
        if (globalCheck.cmd !== preserved.content) {
            preserved.content = globalCheck.cmd;
            trackhistory(preserved, preservedstate, { action: 'GLOBALS', notes: `Global tag detected.<br>${globalnote}`, status: 'changed' });
            preservedstate.runloop = true;
        } else {
            trackhistory(preserved, preservedstate, { action: 'GLOBALS', notes: ``, status: 'unchanged' });
        }

        // loop through registered functions
        let funcret;
        preservedstate.looporder.forEach(f => {
            if (preservedstate.logging) log(`...RUNNING ${f.name}`);

            funcret = f.func(preserved, preservedstate);
            if (preservedstate.logging) {
                log(`....MSG DATA....`);
                log(`  CONT: ${preserved.content}`);
                log(`  DEFS: ${JSON.stringify(preserved.definitions || [])}`);
            }
            // returned object should include { runloop: boolean, status: (changed|unchanged|unresolved), notes: text}
            trackhistory(preserved, preservedstate, { action: f.name, notes: funcret.notes, status: funcret.status });
            preservedstate.runloop = preservedstate.runloop || funcret.runloop;
            // replace inline rolls tagged with .value
            getValues(preserved);

        });

        // see if we're done
        if (preservedstate.runloop) {
            if (preservedstate.history.filter(h => /^LOOP\s/.test(h.action) && h.content === preserved.content).length > 5) {
                msgbox({ c: 'Possible infinite loop detected. Check ZeroFrame log for more information.', wto: preserved.who });
                preservedstate.logging = true;
                releaseMsg(preserved, preservedstate, apitrigger, msg);
            } else {
                // un-escape characters
                preserved.content = preserved.content.replace(/(\[\\+]|\\.)/gm, m => {
                    if (/^\[/.test(m)) {
                        return m.length === 3 ? `[` : `[${Array(m.length - 2).join(`\\`)}]`;
                    } else {
                        return `${Array(m.length - 1).join(`\\`)}${m.slice(-1)}`;
                    }
                });
                // convert nested inline rolls to value
                nestedInline(preserved);
                // replace other inline roll markers with ({&#}) formation
                preserved.content = preserved.content.replace(/\$\[\[(\d+)]]/g, `({&$1})`);
                // properly format rolls that would normally fail in the API (but work in chat)
                preserved.content = preserved.content.replace(/\[\[\s+/g, '[[');
                // send new command line through chat
                sendChat('', preserved.content);
                msg.content = ''; // flatten the original message so other scripts don't take action
            }
        } else {
            return releaseMsg(preserved, preservedstate, apitrigger, msg);
        }
    };

    // ==================================================
    //      RELEASING THE MESSAGE
    // ==================================================
    const releaseMsg = (preserved, preservedstate, apitrigger, msg) => {
        // we're on our way out of the script, format everything and release message
        let notes = [];
        let releaseAction = `OUTRO`;
        // remove the apitrigger
        preserved.content = preserved.content.replace(apitrigger, '');
        // replace all ZF formatted inline roll shorthand markers with roll20 formatted shorthand markers
        preserved.content = preserved.content.replace(/\({&(\d+)}\)/g, `$[[$1]]`);
        // replace inline rolls tagged with .value
        getValues(preserved, true);

        const stoprx = /(\()?{&\s*stop\s*}((?<=\({&\s*stop\s*})\)|\1)/gi,
            escaperx = /(\()?{&\s*escape\s+([^}]+?)\s*}((?<=\({&\s*escape\s+([^}]+?)\s*})\)|\1)/gi,
            simplerx = /(\()?{&\s*(simple|flat)\s*}((?<=\({&\s*(simple|flat)\s*})\)|\1)/gi,
            templaterx = /(\()?{&\s*template:([^}]+?)}((?<=\({&\s*template:([^}]+?)})\)|\1)/gi;

        const escapeCheck = () => {
            // check for ESCAPE tag
            let escapearray = [];
            if (preserved.content.match(escaperx)) {
                notes.push(`ESCAPE tag detected`)
                preserved.content = preserved.content.replace(escaperx, (m, padding, escchar) => {
                    escapearray.push(escchar);
                    return ``;
                });
                escapearray.forEach(e => {
                    preserved.content = preserved.content.replace(new RegExp(escapeRegExp(e), 'g'), '');
                });
            }
        };
        // check for STOP tag
        if (preserved.content.match(stoprx)) {
            trackhistory(preserved, preservedstate, { action: releaseAction, notes: `STOP detected`, status: 'stop' });
            if (preservedstate.logging) buildLog(preserved, preservedstate, apitrigger);
            preserved.content = '';
            return { release: true };
        }
        // check for TEMPLATE tag
        let temptag;
        if (preserved.content.match(templaterx)) {
            preserved.content = preserved.content.replace(templaterx, (m, padding, template) => {
                temptag = true;
                notes.push(`TEMPLATE tag detected`);
                return `&{template:${template}}`;
            });
        }
        // check for SIMPLE tag
        if (preserved.content.match(simplerx)) {
            notes.push(`SIMPLE or FLAT tag detected`)
            preserved.content = preserved.content.replace(/^!+\s*/, '')
                .replace(simplerx, '')
                .replace(/\$\[\[(\d+)]]/g, ((m, g1) => typeof preserved.parsedinline[g1] === 'undefined' ? m : preserved.parsedinline[g1].getRollTip()))
                .replace(/\({&br}\)/g, '<br/>\n');
            if (preserved.rolltemplate && !temptag) {
                let dbpos = preserved.content.indexOf(`{{`);
                dbpos = dbpos === -1 ? 0 : dbpos;
                preserved.content = `${preserved.content.slice(0, dbpos)}&{template:${preserved.rolltemplate}} ${preserved.content.slice(dbpos)}`;
            }
            let speakas = '';
            if (preserved.who.toLowerCase() === 'api') {
                speakas = '';
            } else {
                speakas = (findObjs({ type: 'character' }).filter(c => c.get('name') === preserved.who)[0] || { id: '' }).id;
                if (speakas) speakas = `character|${speakas}`;
                else speakas = `player|${preserved.playerid}`;
            }
            trackhistory(preserved, preservedstate, { action: releaseAction, notes: notes.join('<br>'), status: 'simple' });
            if (preservedstate.logging) buildLog(preserved, preservedstate, apitrigger);
            escapeCheck();
            sendChat(speakas, preserved.content);
            setTimeout(() => { delete preservedMsgObj[apitrigger] }, 3000);
            return { release: true };
        } else if (getConfigItem('singlebang')) {
            preserved.content = preserved.content.replace(/^!!+\s*/, '!');
        }
        escapeCheck();
        trackhistory(preserved, preservedstate, { action: releaseAction, notes: notes.join('<br>'), status: 'release' });
        if (preservedstate.logging) buildLog(preserved, preservedstate, apitrigger);

        // release the message to other scripts (FINAL OUTPUT)
        preserved.content = preserved.content.replace(/\({&br}\)/g, '<br/>\n');
        if (preserved.inlinerolls && !preserved.inlinerolls.length) delete preserved.inlinerolls;
        Object.keys(preserved).forEach(k => msg[k] = preserved[k]);

        setTimeout(() => { delete preservedMsgObj[apitrigger] }, 3000);
        return { release: true };
    };
    const zfconfig = /^!0\s*(?<scripts>(?:(?:[A-Za-z]+\|\d+)(?:\s+|$))+)/;
    const testConstructs = (c) => {
        if (/^!0(\s+(cfg|config)|\s*$)/.test(c)) return 'showconfig';
        if (zfconfig.test(c)) return 'runconfig';
        if (/^!0(\s+help|$)/.test(c)) return 'help';
    };
    // ==================================================
    //		BATCH OPERATIONS
    // ==================================================

    const getBatchTextBreakpoint = c => {
        let counter = 1;
        let pos = 3;
        let openprime = false;
        let closeprime = false;
        while (counter !== 0 && pos <= c.length - 1) {
            if (c.charAt(pos) === '{') {
                closeprime = false;
                if (openprime) {
                    counter++;
                    openprime = false;
                } else openprime = true;
            } else {
                openprime = false;
                if (c.charAt(pos) === '}') {
                    if (closeprime) {
                        counter--;
                        closeprime = false;
                    } else closeprime = true;
                }
            }
            pos++;
        }
        return pos;
    };

    // ==================================================
    //      HANDLE INPUT
    // ==================================================
    const handleInput = (msg) => {
        const trigrx = new RegExp(`^!(${Object.keys(preservedMsgObj).join('|')})`);
        const batchtrigrx = new RegExp(`^!(${Object.keys(batchMsgLibrary).map(k => escapeRegExp(`{&batch ${k}}`)).join('|')})`, '');
        let preserved,
            preservedstate,
            apitrigger; // the apitrigger used by the message
        let restoreMsg;
        if (msg.type !== 'api') return;
        let configtest = testConstructs(msg.content); // special commands for zeroframe
        if (configtest) {
            let statefunc,
                localfunc;
            let configerrors = [];
            switch (configtest) {
                case 'showconfig':
                    buildConfig(msg);
                    break;
                case 'runconfig':
                    zfconfig.exec(msg.content).groups.scripts
                        .trim()
                        .split(/\s+/)
                        .map(c => c.split('|'))
                        .forEach(c => {
                            statefunc = state[apiproject].config.looporder.filter(f => f.name === c[0] || f.handles.includes(c[0]))[0];
                            if (!statefunc) {
                                configerrors.push(`No script found for ${c[0]}.`);
                            } else {
                                if (isNaN(Number(c[1]))) {
                                    configerrors.push(`Priority supplied for ${c[0]} was not a number.`);
                                } else {
                                    if (statefunc) statefunc.priority = Number(c[1]);
                                    localfunc = loopFuncs.filter(f => f.name === c[0] || f.handles.includes(c[0]))[0];
                                    if (localfunc) localfunc.priority = Number(c[1]);
                                }
                            }
                        });
                    buildConfig(msg);
                    if (configerrors.length) {
                        msgbox({ c: configerrors.join('<br>'), wto: msg.who });
                    }
                    break;
                case 'help':
                    // TO DO: build help output
                    break;
                default:
            }
        } else {
            const skiprx = /(\()?{&\s*skip\s*}((?<=\({&\s*skip\s*})\)|\1)/gi;
            if (msg.content.match(skiprx)) {
                msg.content = msg.content.replace(skiprx, '');
                return;
            }
            if (Object.keys(preservedMsgObj).length && trigrx.test(msg.content)) { // check all active apitriggers in play
                apitrigger = trigrx.exec(msg.content)[1];
                preserved = preservedMsgObj[apitrigger].message;
                preservedstate = preservedMsgObj[apitrigger].state;
            } else {    // not prepended with apitrigger, original or batch-dispatched message
                if (Object.keys(batchMsgLibrary).length && batchtrigrx.test(msg.content)) {
                    let bres = batchtrigrx.exec(msg.content);
                    let msgID = bres[0].slice(9, -1);
                    msg.content = `!${msg.content.slice(bres[0].length)}`;
                    restoreMsg = batchMsgLibrary[msgID];
                    if (restoreMsg) {
                        msg.batch = msgID;
                    }
                }
                msg.unlock = { zeroframe: generateUUID() };
                apitrigger = `${apiproject}${generateUUID()}`;
                msg.apitrigger = apitrigger;
                msg.origcontent = msg.content;
                msg.content = msg.content.replace(/(<br\/>)?\n/g, '({&br})'); //.replace(/^!(\{\{(.*)\}\})/, '!$2');
                msg.content = `!${apitrigger}${msg.content.slice(1)}`;
                if (restoreMsg && restoreMsg.hasOwnProperty('message')) {
                    // this is a batched dispatch, restore non-Roll20 properties like mules, conditional tests, definitions, etc.
                    Object.keys(restoreMsg.message).filter(k => !['inlinerolls', 'parsedinline', 'content'].includes(k))
                        .forEach(k => msg[k] = msg[k] || restoreMsg.message[k]);
                }
                preservedMsgObj[apitrigger] = { message: _.clone(msg), state: initState() };
                preserved = preservedMsgObj[apitrigger].message;
                preservedstate = preservedMsgObj[apitrigger].state;

                if (restoreMsg && restoreMsg.hasOwnProperty('message') && restoreMsg.message.hasOwnProperty('inlinerolls') && restoreMsg.message.inlinerolls.length) {
                    preserved.inlinerolls = [...restoreMsg.message.inlinerolls];
                    preserved.parsedinline = [...restoreMsg.message.parsedinline];
                } else {
                    preserved.inlinerolls = [];
                    preserved.parsedinline = [];
                }

                trackhistory(preserved, preservedstate, { action: 'ORIGINAL MESSAGE' });
            }
            let loopstate = runLoop(preserved, preservedstate, apitrigger, msg);
            if (loopstate && loopstate.delay) { //if we delay the command, we should not immediately dispatch the next
                return;
            }
            if (loopstate && loopstate.release && preserved.batch) {
                restoreMsg = restoreMsg || batchMsgLibrary[preserved.batch];
                if (restoreMsg && restoreMsg.hasOwnProperty('commands')) {
                    if (restoreMsg.commands.length) {
                        sendChat('BatchOp', restoreMsg.commands.shift());
                    } else {
                        delete batchMsgLibrary[restoreMsg.message.messageID];
                    }
                }
            }
        }
    };

    // ==================================================
    //		BATCH HANDLE INPUT
    // ==================================================
    const handleBatchInput = (msg) => {
        if (msg.type !== 'api' || !/^!{{/.test(msg.content)) return;
        Object.keys(batchMsgLibrary).filter(k => Date.now() - batchMsgLibrary[k].time > 10000).forEach(k => delete batchMsgLibrary[k]);

        const storeOutbound = (cmd) => {
            if (!msg.messageID) {
                msg.messageID = generateUUID();
                batchMsgLibrary[msg.messageID] = { message: _.clone(msg), time: Date.now(), commands: [] };
            }
            batchMsgLibrary[msg.messageID].commands.push(`!{&batch ${msg.messageID}}${cmd.replace(/\$\[\[(\d+)]]/g, `({&$1})`)}`);
        };
        let cleancmd = msg.content.replace(/\({\)/g, '{{').replace(/\(}\)/g, '}}');
        let breakpoint = getBatchTextBreakpoint(cleancmd) + 1;
        let [batchText, remainingText] = [cleancmd.slice(0, breakpoint), cleancmd.slice(breakpoint)];
        let lines = batchText.split(/(<br\/>)?\n/gi)
            .map(l => (l || '').trim())
            .filter(l => l.length && '<br/>' !== l)
            .reduce((m, l, i, a) => {
                if (i === 0 || i === a.length - 1) {
                    m.lines.push(l);
                    return m;
                }
                m.count += ((l.match(/{{/g) || []).length - (l.match(/}}/g) || []).length);
                m.temp.push(l);
                if (m.count === 0) {
                    m.lines.push(m.temp.join(' '));
                    m.temp = [];
                }
                return m;
            }, { count: 0, lines: [], temp: [] })
            .lines || [];
        let escapeall = '';
        let escaperx = /^\((.+?)\)/g;
        let escapeallrx = /^!{{(?:\((.+?)\))?/;
        if (escapeallrx.test(lines[0])) {
            escapeallrx.lastIndex = 0;
            escapeall = escapeallrx.exec(lines[0])[1] || '';
        }
        escapeallrx.lastIndex = 0;
        lines[0] = lines[0].replace(escapeallrx, ''); // in case there is a command on the first line
        lines[lines.length - 1] = lines[lines.length - 1].replace(/}}(?!}})/, ''); // in case there is a command on the last line
        lines.filter(l => l.length).forEach(l => {
            // handle escape characters
            let escapelocal = '';
            escaperx.lastIndex = 0;
            if (escaperx.test(l)) {
                escaperx.lastIndex = 0;
                let eres = escaperx.exec(l);
                escapelocal = eres[1];
                l = l.slice(eres[0].length);
            }
            if (escapeall.length) l = l.replace(new RegExp(escapeRegExp(escapeall), 'g'), '');
            if (escapelocal.length) l = l.replace(new RegExp(escapeRegExp(escapelocal), 'g'), '');

            if (!/^!/.test(l)) { // this isn't a script message
                l = `!${l}{&simple}`;
            }
            storeOutbound(l);
            //            dispatchOutbound(l);

        });
        if (batchMsgLibrary[msg.messageID] && batchMsgLibrary[msg.messageID].commands && batchMsgLibrary[msg.messageID].commands.length) {
            sendChat('BatchOp', batchMsgLibrary[msg.messageID].commands.shift());
        }

        msg.content = remainingText;

        return;
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


    on('chat:message', handleInput);

    on('ready', () => {
        versionInfo();
        logsig();
        let reqs = [
            {
                name: 'libInline',
                version: `1.0.4`,
                mod: typeof libInline !== 'undefined' ? libInline : undefined,
                checks: [
                    ['getRollData', 'function'],
                    ['getDice', 'function'],
                    ['getValue', 'function'],
                    ['getTables', 'function'],
                    ['getParsed', 'function'],
                    ['getRollTip', 'function']
                ]
            }
        ];
        if (!checkDependencies(reqs)) return;
        on('chat:message', handleBatchInput);

    });

    return {
        RegisterMetaOp: registerMetaOp
    };

})();
{ try { throw new Error(''); } catch (e) { API_Meta.ZeroFrame.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.ZeroFrame.offset); } }
/* */