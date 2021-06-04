/*
=========================================================
Name			:	SelectManager
GitHub			:   https://github.com/TimRohr22/Cauldron/tree/master/SelectManager
Roll20 Contact	:	timmaugh && TheAaron
Version			:	1.0.6
Last Update		:	5/6/2021
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.SelectManager = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{
    try { throw new Error(''); } catch (e) { API_Meta.SelectManager.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (13)); }
}

const SelectManager = (() => {
    // ==================================================
    //		VERSION
    // ==================================================
    const apiproject = 'SelectManager';
    const version = '1.0.6';
    const schemaVersion = 0.1;
    API_Meta[apiproject].version = version;
    const vd = new Date(1620275212489);
    const versionInfo = () => {
        log(`\u0166\u0166 ${apiproject} v${API_Meta[apiproject].version}, ${vd.getFullYear()}/${vd.getMonth() + 1}/${vd.getDate()} \u0166\u0166 -- offset ${API_Meta[apiproject].offset}`);
        if (!state.hasOwnProperty(apiproject) || state[apiproject].version !== schemaVersion) {
            log(`  > Updating ${apiproject} Schema to v${schemaVersion} <`);
            switch (state[apiproject] && state[apiproject].version) {

                case 0.1:
                    state[apiproject].autoinsert = ['selected'];
                /* break; // intentional dropthrough */ /* falls through */

                case 'UpdateSchemaVersion':
                    state[apiproject].version = schemaVersion;
                    break;

                default:
                    state[apiproject] = {
                        version: schemaVersion,
                        autoinsert: ['selected']
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

    const getTheSpeaker = msg => {
        let speaking;
        if (['API', ''].includes(msg.who)) {
            speaking = { id: undefined, type: 'API', localName: 'API', speakerType: 'API', chatSpeaker: 'API', get: (p) => { return 'API'; } };
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
            .filter(t => t.get('layer') === 'objects' || (playerIsGM(pid) && t.get('layer') === 'gmlayer'))
            .filter(t => playerIsGM(pid) || playerCanControl(t, pid));

        let token = tokensIControl.filter(t => t.id === query)[0] ||
            tokensIControl.filter(t => t.get('name') === query)[0] ||
            tokensIControl.filter(t => qrx.test(t)).reduce((m, v) => {
                let d = getEditDistance(query, v);
                return !m.length || d < m[1] ? [v, d] : m;
            }, [])[0];
        return token;
    };

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
    const rowbg = ["#ffffff", "#dedede"];
    const headerbg = {
        normal: rowbg[1],
        critical: "##F46065"
    };
    const msgtable = '<div style="width:100%;"><div style="border-radius:10px;border:2px solid #000000;background-color:__bg__; margin-right:16px; overflow:hidden;"><table style="width:100%; margin: 0 auto; border-collapse:collapse;font-size:12px;">__TABLE-ROWS__</table></div></div>';
    const msg1header = '<tr style="border-bottom:1px solid #000000;font-weight:bold;text-align:center; background-color:__bg__; line-height: 22px;"><td colspan = "__colspan__">__cell1__</td></tr>';
    const msg2header = '<tr style="border-bottom:1px solid #000000;font-weight:bold;text-align:center; background-color:__bg__; line-height: 22px;"><td>__cell1__</td><td style="border-left:1px solid #000000;">__cell2__</td></tr>';
    const msg3header = '<tr style="border-bottom:1px solid #000000;font-weight:bold;text-align:center; background-color:__bg__; line-height: 22px;"><td>__cell1__</td><td style="border-left:1px solid #000000;">__cell2__</td><td style="border-left:1px solid #000000;">__cell3__</td></tr>';
    const msg1row = '<tr style="background-color:__bg__;"><td style="padding:4px;"><div style="__row-css__">__cell1__</div></td></tr>';
    const msg2row = '<tr style="background-color:__bg__;font-weight:bold;"><td style="padding:1px 4px;">__cell1__</td><td style="border-left:1px solid #000000;text-align:center;padding:1px 4px;font-weight:normal;">__cell2__</td></tr>';
    const msg3row = '<tr style="background-color:__bg__;font-weight:bold;"><td style="padding:1px 4px;">__cell1__</td><td style="border-left:1px solid #000000;text-align:center;padding:1px 4px;font-weight:normal;">__cell2__</td><td style="border-left:1px solid #000000;text-align:center;padding:1px 4px;font-weight:normal;">__cell3__</td></tr>';
    const msgbox = ({ c: c = "chat message", t: t = "title", btn: b = "buttons", send: send = true, sendas: sas = "API", wto: wto = "", type: type = "normal" }) => {
        let tbl = msgtable.replace("__bg__", rowbg[0]);
        let hdr = msg1header.replace("__bg__", headerbg[type]).replace("__cell1__", t);
        let row = msg1row.replace("__bg__", rowbg[0]).replace("__cell1__", c);
        let btn = b !== "buttons" ? msg1row.replace("__bg__", rowbg[0]).replace("__cell1__", b).replace("__row-css__", "text-align:right;margin:4px 4px 8px;") : "";
        let msg = tbl.replace("__TABLE-ROWS__", hdr + row + btn);
        if (!['API', ''].includes(wto)) msg = `/w "${wto.replace(' (GM)', '')}" ${msg}`;
        if (["t", "true", "y", "yes", true].includes(send)) {
            sendChat(sas, msg);
        } else {
            return msg;
        }
    };

    const syntaxHighlight = (str, replacer = undefined) => {
        const css = {
            stringstyle: 'mediumblue;',
            numberstyle: 'magenta;',
            booleanstyle: 'darkorange;',
            nullstyle: 'darkred;',
            keystyle: 'darkgreen;'
        };
        if (typeof str !== 'string') {
            str = JSON.stringify(str, replacer, '   ');
        }
        str = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return str.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (match) {
            let cls = 'numberstyle';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'keystyle';
                } else {
                    cls = 'stringstyle';
                }
            } else if (/true|false/.test(match)) {
                cls = 'booleanstyle';
            } else if (/null/.test(match)) {
                cls = 'nullstyle';
            }
            return '<span style=" color: ' + css[cls] + '">' + HE(match.replace(/^"(.*)"(:?)$/g, ((m, g1, g2) => `${g1}${g2}`)).replace(/\\(.)/g, `$1`)) + '</span>';
        });
    };
    const showObjInfo = (msg, o, t = 'PARSED OBJECT', replacer = undefined) => {
        let recipient = getTheSpeaker(msg).localName;
        recipient = recipient === 'API' ? '' : recipient
        msgbox({ t: t, c: `<div><pre style="background: transparent; border: none;white-space: pre-wrap;font-family: Inconsolata, Consolas, monospace;">${syntaxHighlight(o || '', replacer).replace(/\n/g, '<br>')}</pre></div>`, send: true, wto: recipient });
        return;
    };
    const handleConfig = msg => {
        let cfgrx = /^(\+|-)(selected|who|playerid)$/i;
        let res;
        let cfgTrack = {};
        if (msg.type !== 'api' || !/^!smconfig/.test(msg.content)) return;
        if (/^!smconfig\s+[^\s]/.test(msg.content)) {
            msg.content.split(/\s+/).slice(1).forEach(a => {
                res = cfgrx.exec(a);
                if (!res) return;
                if (res[1] === '+') {
                    if (!state[apiproject].autoinsert.includes(res[2])) state[apiproject].autoinsert.push(res[2]);
                    cfgTrack[res[2]] = res[1];
                } else {
                    state[apiproject].autoinsert = state[apiproject].autoinsert.filter(e => e !== res[2]);
                    cfgTrack[res[2]] = res[1];
                }
            });
            let changes = Object.keys(cfgTrack).map(k => cfgTrack[k] === '+' ? `${k}: enabled` : `${k}: disabled`).join('<br>');
            let recipient = getTheSpeaker(msg).localName;
            recipient = recipient === 'API' ? '' : recipient;
            msgbox({ t: `SELECTMANAGER CONFIG CHANGED`, c: changes, wto: recipient, send: true });
        } else {
            showObjInfo(msg, state[apiproject].autoinsert, `STATE SELECT MANAGER AUTOINSERT`);
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
    const inject = (msg, status, notes) => {
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
            msgbox({ c: `No selected tokens to use for that command. Please select some tokens then try again.`, t: `NO TOKENS`, wto: preservedMsgObj[apitrigger].who });
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
            dsmsg = dsmsg.replace(new RegExp(escapeRegExp(fsres[3]),'g'), '');
        }
        preservedMsgObj[apitrigger].selected.forEach((t, i) => {
            sendChat(chatspeaker, `!${apitrigger}${i} ${dsmsg}`);
        });
        setTimeout(() => { delete preservedMsgObj[apitrigger] }, 10000);
    };
    const trackprops = (msg) => {
        [preservedMsgObj[maintrigger].who, preservedMsgObj[maintrigger].selected, preservedMsgObj[maintrigger].playerid] = [msg.who, msg.selected, msg.playerid];
    };
    const handleInput = (msg, msgstate) => {
        let funcret = { runloop: false, status: 'unchanged', notes: '' };
        const trigrx = new RegExp(`^!(${Object.keys(preservedMsgObj).join('|')})`);
        let apitrigger; // the apitrigger used by the message
        if (!msgstate && scriptisplugin) return funcret;
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
                if (state[apiproject].autoinsert.includes('selected')) {
                    if (preservedMsgObj[maintrigger].selected && preservedMsgObj[maintrigger].selected.length) {
                        msg.selected = preservedMsgObj[maintrigger].selected;
                    }
                    if (!msg.selected || (msg.selected && !msg.selected.length)) {
                        delete msg.selected;
                    }
                }
                if (state[apiproject].autoinsert.includes('who')) {
                    msg.who = preservedMsgObj[maintrigger].who;
                }
                if (state[apiproject].autoinsert.includes('playerid')) {
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

    let scriptisplugin = false;
    const selectmanager = (m, s) => handleInput(m, s);
    on('chat:message', handleInput);
    setTimeout(() => { on('chat:message', handleForSelected) }, 0);
    on('ready', () => {
        versionInfo();
        logsig();
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