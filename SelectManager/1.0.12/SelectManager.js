/*
=========================================================
Name			:	SelectManager
GitHub			:   https://github.com/TimRohr22/Cauldron/tree/master/SelectManager
Roll20 Contact	:	timmaugh && TheAaron
Version			:	1.0.12
Last Update		:	4/28/2023
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.SelectManager = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.SelectManager.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (12)); } }

const SelectManager = (() => { //eslint-disable-line no-unused-vars
    // ==================================================
    //		VERSION
    // ==================================================
    const apiproject = 'SelectManager';
    const version = '1.0.12';
    const schemaVersion = 0.3;
    const apilogo = 'https://i.imgur.com/ewyOzMU.png';
    const apilogoalt = 'https://i.imgur.com/3U8c9rE.png'
    API_Meta[apiproject].version = version;
    const vd = new Date(1682708139825);
    const versionInfo = () => {
        log(`\u0166\u0166 ${apiproject} v${API_Meta[apiproject].version}, ${vd.getFullYear()}/${vd.getMonth() + 1}/${vd.getDate()} \u0166\u0166 -- offset ${API_Meta[apiproject].offset}`);
        if (!state.hasOwnProperty(apiproject) || state[apiproject].version !== schemaVersion) {
            log(`  > Updating ${apiproject} Schema to v${schemaVersion} <`);
            switch (state[apiproject] && state[apiproject].version) {

                case 0.1:
                    state[apiproject].settings = {
                        playerscanids: false
                    };
                    if (state[apiproject].hasOwnProperty('autoinsert')) state[apiproject].settings.autoinsert = [...state[apiproject].autoinsert];
                    else state[apiproject].settings.autoinsert = ['selected'];
                    state[apiproject].defaults = {
                        autoinsert: ['selected'],
                        playerscanids: false
                    };
                    delete state[apiproject].autoinsert;
                /* falls through */
                case 0.2:
                    state[apiproject].settings.knownsenders = ['CRL'];
                    state[apiproject].defaults.knownsenders = ['CRL'];
                /* falls through */
                case 'UpdateSchemaVersion':
                    state[apiproject].version = schemaVersion;
                    break;

                default:
                    state[apiproject] = {
                        version: schemaVersion,
                        settings: {
                            autoinsert: ['selected'],
                            playerscanids: false,
                            knownsenders: ['CRL']
                        },
                        defaults: {
                            autoinsert: ['selected'],
                            playerscanids: false,
                            knownsenders: ['CRL']
                        }
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
    const escapeRegExp = (string) => { return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); };
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
    const playersCanUseIDs = () => manageState.get('playerscanids');
    const getTheSpeaker = msg => {
        let speaking;
        if (['API', ''].includes(msg.who)) {
            speaking = { id: undefined, type: 'API', localName: 'API', speakerType: 'API', chatSpeaker: 'API', get: () => { return 'API'; } };
        } else {
            let characters = findObjs({ type: 'character' });
            characters.forEach(c => { if (c.get('name') === msg.who) speaking = c; });

            if (speaking) {
                speaking.speakerType = "character";
                speaking.localName = speaking.get("name");
            } else {
                speaking = getObj('player', msg.playerid);
                speaking.speakerType = "player";
                speaking.localName = speaking.get("displayname");
            }
            speaking.chatSpeaker = speaking.speakerType + '|' + speaking.id;
        }

        return speaking;
    };
    const playerCanControl = (obj, playerid = 'any') => {
        const playerInControlledByList = (list, playerid) => list.includes('all') || list.includes(playerid) || ('any' === playerid && list.length);
        let players = obj.get('controlledby')
            .split(/,/)
            .filter(s => s.length);

        if (playerInControlledByList(players, playerid)) {
            return true;
        }

        if ('' !== obj.get('represents')) {
            players = (getObj('character', obj.get('represents')) || { get: function () { return ''; } })
                .get('controlledby').split(/,/)
                .filter(s => s.length);
            return playerInControlledByList(players, playerid);
        }
        return false;
    };

    const getToken = (query, pid) => {
        let pageid;
        if (pid === 'API') pid = preservedMsgObj[maintrigger].playerid;
        if (playerIsGM(pid)) {
            pageid = getObj('player', pid).get('lastpage') || Campaign().get('playerpageid');
        } else {
            pageid = Campaign().get('playerspecificpages')[pid] || Campaign().get('playerpageid');
        }
        let qrx = new RegExp(escapeRegExp(query), 'i');
        let tokensIControl = findObjs({ type: 'graphic', subtype: 'token', pageid })
            .filter(t => t.get('layer') === 'objects' || playerIsGM(pid))
            .filter(t => playerIsGM(pid) || playersCanUseIDs() || playerCanControl(t, pid));

        let token = tokensIControl.filter(t => t.id === query)[0] ||
            tokensIControl.filter(t => t.get('name') === query)[0] ||
            tokensIControl.filter(t => qrx.test(t)).reduce((m, v) => {
                let d = getEditDistance(query, v);
                return !m.length || d < m[1] ? [v, d] : m;
            }, [])[0];
        return token;
    };

    let html = {};
    let css = {}; // eslint-disable-line no-unused-vars
    let HE = () => { }; // eslint-disable-line no-unused-vars
    const theme = {
        primaryColor: '#E66B00',
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
            'vertical-align':'middle'
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
        sendas: sendas = 'SelectManager',
        whisperto: whisperto = '',
        footer: footer = '',
        btn: btn = '',
    } = {}) => {
        if (title) title = html.div(html.div(html.img(apilogoalt, 'SelectManager Logo', localCSS.logoimg), localCSS.msgheaderlogodiv) + html.div(title, localCSS.msgheadercontent), {});
        Messenger.MsgBox({ msg: msg, title: title, bodycss: bodycss, sendas: sendas, whisperto: whisperto, footer: footer, btn: btn, headercss: headercss, footercss: footercss, boundingcss: localCSS.boundingcss, noarchive: true });
    };

    const getWhisperTo = (who) => who.toLowerCase() === 'api' ? 'gm' : who.replace(/\s\(gm\)$/i, '');
    const handleConfig = msg => {
        if (msg.type !== 'api' || !/^!smconfig/.test(msg.content)) return;
        let recipient = getWhisperTo(msg.who);
        if (!playerIsGM(msg.playerid)) {
            msgbox({ title: 'GM Rights Required', msg: 'You must be a GM to perform that operation', whisperto: recipient });
            return;
        }
        let cfgrx = /^(\+|-)(selected|who|playerid|playerscanids)$/i;
        let res;
        let cfgTrack = {};
        let message;
        if (/^!smconfig\s+[^\s]/.test(msg.content)) {
            msg.content.split(/\s+/).slice(1).forEach(a => {
                res = cfgrx.exec(a);
                if (!res) return;
                if (res[2].toLowerCase() === 'playerscanids') {
                    manageState.set('playerscanids',(res[1] === '+'));
                    cfgTrack[res[2]] = res[1];
                } else if (['selected', 'who', 'playerid'].includes(res[2].toLowerCase())) {
                    if (res[1] === '+') {
                        manageState.set('autoinsert', [...new Set([...manageState.get('autoinsert'), res[2].toLowerCase()])]);
                        cfgTrack[res[2]] = res[1];
                    } else {
                        manageState.set('autoinsert', manageState.get('autoinsert').filter(e => e !== res[2].toLowerCase()));
                        cfgTrack[res[2]] = res[1];
                    }
                }
            });
            let changes = Object.keys(cfgTrack).map(k => `${html.span(k, localCSS.inlineEmphasis)}: ${cfgTrack[k] === '+' ? 'enabled' : 'disabled'}`).join('<br>');
            msgbox({ title: `SelectManager Config Changed`, msg: `You have made the following changes to the SelectManager configuration:<br>${changes}`, whisperto: recipient });
        } else {
            cfgTrack.playerscanids = `${html.span('playerscanids', localCSS.inlineEmphasis)}: ${manageState.get('playerscanids') ? 'enabled' : 'disabled'}`;
            cfgTrack.autoinsert = ['selected', 'who', 'playerid'].map(k => `${html.span(k, localCSS.inlineEmphasis)}: ${manageState.get('autoinsert').includes(k) ? 'enabled' : 'disabled'}`).join('<br>');
            message = `SelectManager is currently configured as follows:<br>${cfgTrack.playerscanids}<br>${cfgTrack.autoinsert}`;
            msgbox({ title: 'SelectManager Configuration', msg: message, whisperto: recipient });
        }
    };

    const maintrigger = `${apiproject}-main`;
    let preservedMsgObj = {
        [maintrigger]: { selected: undefined, who: '', playerid: '' }
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

    const injectrx = /(\()?{&\s*inject\s+([^}]+?)\s*}((?<=\({&\s*inject\s+([^}]+?)\s*})\)|\1)/gi;
    const selectrx = /(\()?{&\s*select\s+([^}]+?)\s*}((?<=\({&\s*select\s+([^}]+?)\s*})\)|\1)/gi;
    const inject = (msg, status/*, notes*/) => {
        let list = [];
        let selected = [];
        let retResult = false;
        msg.selected = msg.selected || [];
        // handle selections
        if (selectrx.test(msg.content)) {
            retResult = true;
            msg.selected = [];
            selectrx.lastIndex = 0;
            msg.content = msg.content.replace(selectrx, (m, padding, group) => {
                selected = msg.selected.map(s => s._id);

                list = group.split(/\s*,\s*/)
                    .map(l => getToken(l, msg.playerid))
                    .filter(t => typeof t !== 'undefined' && !selected.includes(t.id))
                    .map(t => { return { '_id': t.id, '_type': 'graphic' }; });


                selected = list.map(s => s._id);
                list = list.filter(t => !selected.includes(t.id));
                msg.selected = [...msg.selected, ...list];
                status.push('changed');
                return '';
            });
        }
        // handle injections
        if (injectrx.test(msg.content)) {
            retResult = true;
            injectrx.lastIndex = 0;
            list = [];
            msg.content = msg.content.replace(injectrx, (m, padding, group) => {
                selected = msg.selected.map(s => s._id);
                list = group.split(/,\s*/)
                    .map(l => getToken(l, msg.playerid))
                    .filter(t => typeof t !== 'undefined' && !selected.includes(t.id))
                    .map(t => { return { '_id': t.id, '_type': 'graphic' }; });

                selected = list.map(s => s._id);
                list = list.filter(t => !selected.includes(t.id));
                msg.selected = [...msg.selected, ...list];
                status.push('changed');
                return '';
            });
        }
        if (!msg.selected.length) delete msg.selected;
        return retResult;
    };

    const fsrx = /(^!forselected(--|\+\+|\+-|-\+|\+|-|)(?:\((.)\)){0,1}\s+!?).+/i;
    const forselected = (msg, apitrigger) => {
        apitrigger = `${apiproject}${generateUUID()}`;
        preservedMsgObj[apitrigger] = {
            selected: preservedMsgObj[maintrigger].selected || [],
            who: preservedMsgObj[maintrigger].who,
            playerid: preservedMsgObj[maintrigger].playerid
        };
        if (!preservedMsgObj[apitrigger].selected.length) {
            msgbox({ msg: `No selected tokens to use for that command. Please select some tokens then try again.`, title: `NO TOKENS`, whisperto: getWhisperTo(preservedMsgObj[apitrigger].who) });
            return;
        }
        let fsres = fsrx.exec(msg.content);
        switch (fsres[2] || '++') {
            case '+-':
                preservedMsgObj[apitrigger].replaceid = true;
                preservedMsgObj[apitrigger].replacename = false;
                break;
            case '-':
            case '-+':
                preservedMsgObj[apitrigger].replaceid = false;
                preservedMsgObj[apitrigger].replacename = true;
                preservedMsgObj[apitrigger].nametoreplace = findObjs({ type: 'graphic', subtype: 'token', id: preservedMsgObj[apitrigger].selected[0]._id })[0].get('name');
                break;
            case '--':
                preservedMsgObj[apitrigger].replaceid = false;
                preservedMsgObj[apitrigger].replacename = false;
                break;
            case '+':
            case '++':
            default:
                preservedMsgObj[apitrigger].replaceid = true;
                preservedMsgObj[apitrigger].replacename = true;
                preservedMsgObj[apitrigger].nametoreplace = findObjs({ type: 'graphic', subtype: 'token', id: preservedMsgObj[apitrigger].selected[0]._id })[0].get('name');
                break;
        }
        let chatspeaker = getTheSpeaker(preservedMsgObj[apitrigger]).chatSpeaker;
        msg.content = msg.content.replace(/<br\/>\n/g, ' ');
        let dsmsg = msg.content.slice(fsres[1].length);
        if (fsres[3]) {
            dsmsg = dsmsg.replace(new RegExp(escapeRegExp(fsres[3]), 'g'), '');
        }
        preservedMsgObj[apitrigger].selected.forEach((t, i) => {
            sendChat(chatspeaker, `!${apitrigger}${i} ${dsmsg.replace(/{&\s*i\s*((\+|-)\s*([\d]+)){0,1}}/gi, ((m, g1, op, val) => { return !g1 ? i : op === '-' ? parseInt(i) - parseInt(val) : parseInt(i) + parseInt(val); }))}`);
        });
        setTimeout(() => { delete preservedMsgObj[apitrigger] }, 10000);
    };
    const trackprops = (msg) => {
        [
            preservedMsgObj[maintrigger].who,
            preservedMsgObj[maintrigger].selected,
            preservedMsgObj[maintrigger].playerid,
            preservedMsgObj[maintrigger].inlinerolls
        ] = [msg.who, msg.selected, msg.playerid, msg.inlinerolls];
    };
    const handleInput = (msg, msgstate = {}) => {
        let funcret = { runloop: false, status: 'unchanged', notes: '' };
        const trigrx = new RegExp(`^!(${Object.keys(preservedMsgObj).join('|')})`);
        let apitrigger; // the apitrigger used by the message
        if (!Object.keys(msgstate).length && scriptisplugin) return funcret;
        let status = [];
        let notes = [];
        msg.content = msg.content.replace(/<br\/>\n/g, '({&br-sm})');
        let injection = inject(msg, status, notes);
        if ('API' !== msg.playerid) { // user generated message
            trackprops(msg);
        } else { // API generated message
            if (injection) preservedMsgObj[maintrigger].selected = msg.selected;
            // peel off ZeroFrame trigger, if it's there
            if (msg.apitrigger) msg.content = msg.content.replace(msg.apitrigger, '');
            if (trigrx.test(msg.content)) { // message has apitrigger (iterative call of forselected) so cycle-in next selected
                apitrigger = trigrx.exec(msg.content)[1];
                msg.content = msg.content.replace(apitrigger, '');
                status.push('changed');
                let nextindex = /^!(\d+)\s*/.exec(msg.content)[1];
                msg.content = `!${msg.content.slice(nextindex.length + 2)}`;
                nextindex = Number(nextindex);
                msg.selected = [];
                msg.selected.push(preservedMsgObj[apitrigger].selected[nextindex]);
                msg.who = preservedMsgObj[apitrigger].who;
                msg.playerid = preservedMsgObj[apitrigger].playerid;
                // handle replacements of @{selected|token_id} and @{selected|token_name}
                if (preservedMsgObj[apitrigger].replaceid) {
                    msg.content = msg.content.replace(apitrigger, '').replace(preservedMsgObj[apitrigger].selected[0]._id, msg.selected[0]._id);
                }
                if (preservedMsgObj[apitrigger].replacename) {
                    msg.content = msg.content.replace(apitrigger, '').replace(preservedMsgObj[apitrigger].nametoreplace, findObjs({ type: 'graphic', subtype: 'token', id: msg.selected[0]._id })[0].get('name'));
                }
                // handle replacements of at{selected|prop}
                if (typeof Fetch !== 'undefined' && typeof ZeroFrame !== 'undefined') {
                    const fetchselrx = /at\((?<token>selected)[|.](?<item>[^\s[|.)]+?)(?:[|.](?<valtype>[^\s.[|]+?)){0,1}(?:\[(?<default>[^\]]*?)]){0,1}\s*\)/gi;
                    const fetchrptgselrx = /at\((?<character>selected)[|.](?<section>[^\s.|]+?)[|.]\[\s*(?<pattern>.+?)\s*]\s*[|.](?<valuesuffix>[^[\s).]+?)(?:[|.](?<valtype>[^\s.[)]+?)){0,1}(?:\[(?<default>[^\]]*?)]){0,1}\s*\)/gi;
                    msg.content = msg.content.replace(fetchselrx, m => {
                        status.push('changed')
                        return `@${m.slice(2)}`;
                    });
                    msg.content = msg.content.replace(fetchrptgselrx, m => {
                        status.push('changed')
                        return `*${m.slice(2)}`;
                    });
                } else {
                    let selrx = /at{selected(?:\||\.)([^|}]+)(\|max)?}/ig;
                    let retval;
                    msg.content = msg.content.replace(selrx, (g0, g1, g2) => {
                        if (['token_id', 'token_name', 'bar1', 'bar2', 'bar3'].includes(g1.toLowerCase())) {
                            let tok = findObjs({ type: 'graphic', subtype: 'token', id: msg.selected[0]._id })[0];
                            if (g1.toLowerCase() === 'token_id') retval = tok.id;
                            else if (g1.toLowerCase() === 'token_name') retval = tok.get('name');
                            else retval = tok.get(`${g1}_${g2 ? 'max' : 'value'}`) || '';
                        } else {
                            let character = findObjs({ type: 'character', id: (getObj("graphic", msg.selected[0]._id) || { get: () => { return "" } }).get("represents") })[0];
                            if (!character) {
                                notes.push('No character found represented by token ${msg.selected[0]._id}');
                                status.push('unresolved');
                                retval = '';
                            } else if ('character_id' === g1.toLowerCase()) {
                                retval = character.id;
                            } else if ('character_name' === g1.toLowerCase()) {
                                retval = character.get('name');
                            }
                            status.push('changed');
                            retval(findObjs({ type: 'attribute', character_id: character.id })[0] || { get: () => { return '' } }).get(g2 ? 'max' : 'current') || '';
                        }
                    });
                }
            } else { // api generated call to another script, copy in the appropriate data
                if (manageState.get('autoinsert').includes('selected')) {
                    if (preservedMsgObj[maintrigger].selected && preservedMsgObj[maintrigger].selected.length) {
                        msg.selected = preservedMsgObj[maintrigger].selected;
                    }
                    if (!msg.selected || (msg.selected && !msg.selected.length)) {
                        delete msg.selected;
                    }
                }
                if (manageState.get('autoinsert').includes('who') && !manageState.get('knownsenders').includes(msg.who)) {
                    msg.who = preservedMsgObj[maintrigger].who;
                }
                if (manageState.get('autoinsert').includes('playerid')) {
                    msg.playerid = preservedMsgObj[maintrigger].playerid;
                }
            }
            // replace ZeroFrame trigger, if it's there
            if (msg.apitrigger) msg.content = `!${msg.apitrigger}${msg.content.slice(1)}`;
        }
        msg.content = msg.content.replace(/\({&br-sm}\)/g, '<br/>\n');
        return condensereturn(funcret, status, notes);
    };
    const handleForSelected = (msg) => {
        if (msg.type !== 'api' || !fsrx.test(msg.content)) return;
        forselected(msg);
    };
    const getProp = (prop) => {
        return preservedMsgObj[maintrigger][prop] || undefined;
    };
    const getSelected = () => getProp('selected');
    const getWho = () => getProp('who');
    const getPlayerID = () => getProp('playerid');

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


    let scriptisplugin = false;
    const selectmanager = (m, s) => handleInput(m, s);
    on('chat:message', handleInput);
    setTimeout(() => { on('chat:message', handleForSelected) }, 0);
    on('ready', () => {
        versionInfo();
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

        scriptisplugin = (typeof ZeroFrame !== `undefined`);
        if (typeof ZeroFrame !== 'undefined') {
            ZeroFrame.RegisterMetaOp(selectmanager, { priority: 20, handles: ['sm'] });
        }
        on('chat:message', handleConfig);
    });

    return { // public interface
        GetSelected: getSelected,
        GetWho: getWho,
        GetPlayerID: getPlayerID
    };

})();
{ try { throw new Error(''); } catch (e) { API_Meta.SelectManager.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.SelectManager.offset); } }
/* */
