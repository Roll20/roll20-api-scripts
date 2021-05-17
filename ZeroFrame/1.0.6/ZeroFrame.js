/*
=========================================================
Name            : ZeroFrame
GitHub          : https://github.com/TimRohr22/Cauldron/tree/master/ZeroFrame
Roll20 Contact  : timmaugh
Version         : 1.0.6
Last Update     : 5/12/2021
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.ZeroFrame = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{
    try { throw new Error(''); } catch (e) { API_Meta.ZeroFrame.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (13)); }
}

const ZeroFrame = (() => {
    // ==================================================
    //		VERSION
    // ==================================================
    const apiproject = 'ZeroFrame';
    API_Meta[apiproject].version = '1.0.6';
    const schemaVersion = 0.2;
    const vd = new Date(1621257940445);
    let stateReady = false;
    const checkInstall = () => {
        if (!state.hasOwnProperty(apiproject) || state[apiproject].version !== schemaVersion) {
            log(`  > Updating ${apiproject} Schema to v${schemaVersion} <`);
            switch (state[apiproject] && state[apiproject].version) {
                case 0.1:
                    state[apiproject] = {
                        config: {
                            looporder: [],
                            logging: false
                        }
                    };
                /* break; // intentional dropthrough */ /* falls through */
                case 0.2:
                    state[apiproject].config.singlebang = true;
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
        msg.content = msg.content.replace(logrx, (r => {
            preservedstate.logging = true;
            return '';
        }));
    };
    // ==================================================
    //      MESSAGING AND REPORTING
    // ==================================================
    const HE = (() => {
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
        msgboxfull({ c: msg, wto: wto, simple: true });
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
                .replace(/__STATUSCOLOR__/g, c => { return statuscolor[v.status] || statuscolor.loop; })
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
    const getValues = (msg) => {
        // replace inline rolls tagged with .value
        const valuerx = /\$\[\[(?<rollnumber>\d+)]]\.value/gi;
        let retval = false;
        msg.content = msg.content.replace(valuerx, ((r, g1) => {
            retval = true;
            if (msg.inlinerolls.length > g1) {
                return msg.parsedinline[g1].value;
            } else {
                return '0';
            }
        }));
        return retval;
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
        preservedstate.runloop = false;
        preservedstate.loopcount++;

        trackhistory(msg, preservedstate, { action: `LOOP ${preservedstate.loopcount}` });
        handleLogging(msg, preservedstate);
        setOrder(msg, preservedstate);
        if (msg.inlinerolls) {
            // insert inline rolls to preserved message, correct the placeholder shorthand index
            msg.inlinerolls.forEach((r, i) => {
                preserved.inlinerolls.push(r);
                msg.content = msg.content.replace(new RegExp(`\\$\\[\\[(${i})]]`, 'g'), `$[[${preserved.inlinerolls.length - 1}]]`);
            });
            preserved.parsedinline = [...(preserved.parsedinline || []), ...libInline.getRollData(msg)];
            preservedstate.runloop = true;
        }
        preserved.content = msg.content.replace(/<br\/>\n/g, '({&br})');
        msg.content = `${msg.apitrigger}`;
        preservedstate.runloop = getValues(preserved) || preservedstate.runloop;
        // loop through registered functions
        let funcret;
        preservedstate.looporder.forEach(f => {
            funcret = f.func(preserved, preservedstate);
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
            }
        } else {
            releaseMsg(preserved, preservedstate, apitrigger, msg);
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
        getValues(preserved);

        const stoprx = /(\()?{&\s*stop\s*}((?<=\({&\s*stop\s*})\)|\1)/gi,
            simplerx = /(\()?{&\s*(simple|flat)\s*}((?<=\({&\s*(simple|flat)\s*})\)|\1)/gi,
            templaterx = /(\()?{&\s*template:([^}]+?)}((?<=\({&\s*template:([^}]+?)})\)|\1)/gi;

        // check for STOP tag
        if (preserved.content.match(stoprx)) {
            trackhistory(preserved, preservedstate, { action: releaseAction, notes: `STOP detected`, status: 'stop' });
            if (preservedstate.logging) buildLog(preserved, preservedstate, apitrigger);
            preserved.content = '';
            return;
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
                .replace(/\$\[\[(\d+)]]/g, ((m, g1) => preserved.parsedinline[g1].getRollTip()))
                .replace(/\({&br}\)/g, '<br/>\n');
            if (preserved.rolltemplate && !temptag) preserved.content = `&{template:${preserved.rolltemplate}} ${preserved.content}`;
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
            sendChat(speakas, preserved.content);
            delete preservedMsgObj[apitrigger];
            return;
        } else if (getConfigItem('singlebang')) {
            preserved.content = preserved.content.replace(/^!!+\s*/, '!');
        }

        trackhistory(preserved, preservedstate, { action: releaseAction, notes: notes.join('<br>'), status: 'release' });
        if (preservedstate.logging) buildLog(preserved, preservedstate, apitrigger);

        // release the message to other scripts (FINAL OUTPUT)
        preserved.content = preserved.content.replace(/\({&br}\)/g, '<br/>\n');
        if (!preserved.inlinerolls.length) delete preserved.inlinerolls;
        Object.keys(preserved).forEach(k => msg[k] = preserved[k]);

        setTimeout(() => { delete preservedMsgObj[apitrigger] }, 1000);
        return;
    };
    const zfconfig = /^!0\s*(?<scripts>(?:(?:[A-Za-z]+\|\d+)(?:\s+|$))+)/;
    const testConstructs = (c) => {
        if (/^!0(\s+(cfg|config)|\s*$)/.test(c)) return 'showconfig';
        if (zfconfig.test(c)) return 'runconfig';
        if (/^!0(\s+help|$)/.test(c)) return 'help';
    };
    // ==================================================
    //      HANDLE INPUT
    // ==================================================
    const handleInput = (msg) => {
        const trigrx = new RegExp(`^!(${Object.keys(preservedMsgObj).join('|')})`);
        let preserved,
            preservedstate,
            apitrigger; // the apitrigger used by the message
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
            if (Object.keys(preservedMsgObj).length && trigrx.test(msg.content)) { // check all active apitriggers in play
                apitrigger = trigrx.exec(msg.content)[1];
                preserved = preservedMsgObj[apitrigger].message;
                preservedstate = preservedMsgObj[apitrigger].state;
            } else {    // not prepended with apitrigger, original message
                const skiprx = /(\()?{&\s*skip\s*}((?<=\({&\s*skip\s*})\)|\1)/gi;
                if (msg.content.match(skiprx)) {
                    msg.content = msg.content.replace(skiprx, '');
                    return;
                }
                apitrigger = `${apiproject}${generateUUID()}`;
                msg.apitrigger = apitrigger;
                msg.origcontent = msg.content;
                msg.content = msg.content.replace(/<br\/>\n/g, '({&br})'); //.replace(/^!(\{\{(.*)\}\})/, '!$2');
                msg.content = `!${apitrigger}${msg.content.slice(1)}`;
                preservedMsgObj[apitrigger] = { message: _.clone(msg), state: initState() };
                preserved = preservedMsgObj[apitrigger].message;
                preservedstate = preservedMsgObj[apitrigger].state;

                preserved.inlinerolls = [];
                preserved.parsedinline = [];

                trackhistory(preserved, preservedstate, { action: 'ORIGINAL MESSAGE' });
            }
            runLoop(preserved, preservedstate, apitrigger, msg);
        }
    };

    on('chat:message', handleInput);

    on('ready', () => {
        versionInfo();
        logsig();
    });

    return {
        RegisterMetaOp: registerMetaOp
    };

})();
{ try { throw new Error(''); } catch (e) { API_Meta.ZeroFrame.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.ZeroFrame.offset); } }
