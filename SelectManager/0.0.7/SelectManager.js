/*
=========================================================
Name			:	SelectManager
GitHub			:   https://github.com/TimRohr22/Cauldron/tree/master/SelectManager
Roll20 Contact	:	timmaugh && TheAaron
Version			:	0.0.7
Last Update		:	2/19/2020
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
    const version = '0.0.7';
    const schemaVersion = 0.1;
    API_Meta[apiproject].version = version;
    const vd = new Date(1613764140237);
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
    const getTheSpeaker = msg => {
        let speaking;
        if (msg.who === 'API') {
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
    const msgbox = ({ c: c = "chat message", t: t = "title", btn: b = "buttons", send: send = false, sendas: sas = "API", wto: wto = "", type: type = "normal" }) => {
        let tbl = msgtable.replace("__bg__", rowbg[0]);
        let hdr = msg1header.replace("__bg__", headerbg[type]).replace("__cell1__", t);
        let row = msg1row.replace("__bg__", rowbg[0]).replace("__cell1__", c);
        let btn = b !== "buttons" ? msg1row.replace("__bg__", rowbg[0]).replace("__cell1__", b).replace("__row-css__", "text-align:right;margin:4px 4px 8px;") : "";
        let msg = tbl.replace("__TABLE-ROWS__", hdr + row + btn);
        if (wto) msg = `/w "${wto}" ${msg}`;
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
    const fsrx = /^!forselected(--|\+\+|\+-|-\+|\+|-|)\s+.+/i;

    const forselected = (msg, apitrigger) => {
        apitrigger = `${apiproject}${generateUUID()}`;
        preservedMsgObj[apitrigger] = { selected: [...msg.selected], who: msg.who, playerid: msg.playerid };
        let fsres = fsrx.exec(msg.content);
        switch (fsres[1] || '++') {
            case '+-':
                preservedMsgObj[apitrigger].replaceid = true;
                preservedMsgObj[apitrigger].replacename = false;
                break;
            case '-':
            case '-+':
                preservedMsgObj[apitrigger].replaceid = false;
                preservedMsgObj[apitrigger].replacename = true;
                preservedMsgObj[apitrigger].nametoreplace = findObjs({ type: 'graphic', subtype: 'token', id: msg.selected[0]._id })[0].get('name');
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
                preservedMsgObj[apitrigger].nametoreplace = findObjs({ type: 'graphic', subtype: 'token', id: msg.selected[0]._id })[0].get('name');
                break;
        }
        let chatspeaker = getTheSpeaker(msg).chatSpeaker;
        msg.content = msg.content.replace(/<br\/>\n/g, ' ');
        msg.selected.forEach((t, i) => {
            sendChat(chatspeaker, `!${apitrigger}${i} ${msg.content.replace(/^!forselected(--|\+\+|\+-|-\+|\+|-|)\s+!?/, '')}`);
        });
        setTimeout(() => { delete preservedMsgObj[apitrigger] }, 1000);
    }
    const handleInput = (msg) => {
        const trigrx = new RegExp(`^!(${Object.keys(preservedMsgObj).join('|')})`);
        let apitrigger; // the apitrigger used by the message
        if ('API' !== msg.playerid) { // user generated message
            [preservedMsgObj[maintrigger].who, preservedMsgObj[maintrigger].selected, preservedMsgObj[maintrigger].playerid] = [msg.who, msg.selected, msg.playerid];
            if (fsrx.test(msg.content)) { // user wants to iterate the command over the selected tokens
                if (!msg.selected) {
                    sendChat('API', `/w "${msg.who.replace(' (GM)', '')}" No selected tokens to use for that command. Please select some tokens then try again.`);
                    return;
                }
                forselected(msg, apitrigger);
                return;
            } else if (/^!smconfig/.test(msg.content)) { // user wants to process config options for SelectManager
                handleConfig(msg);
            }
        } else { // API generated message
            if (fsrx.test(msg.content)) { // user had api generate call to iterate the command over the selected tokens
                if (!preservedMsgObj[maintrigger].selected) {
                    sendChat('API', `/w "${preservedMsgObj[maintrigger].who.replace(' (GM)', '')}" No selected tokens to use for that command. Please select some tokens then try again.`);
                    return;
                }
                msg.selected = [];
                msg.selected.push(...preservedMsgObj[maintrigger].selected);
                msg.who = preservedMsgObj[maintrigger].who;
                msg.playerid = preservedMsgObj[maintrigger].playerid;
                forselected(msg, apitrigger);
                return;
            } else if (trigrx.test(msg.content)) { // message has apitrigger (iterative call of forselected) so cycle-in next selected
                apitrigger = trigrx.exec(msg.content)[1];
                msg.content = msg.content.replace(apitrigger, '');
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
                // handle replacements of +{selected|prop}
                let selrx = /at{selected\|([^|}]+)(\|max)?}/ig;
                msg.content = msg.content.replace(selrx, (g0, g1, g2) => {
                    if (['token_id', 'token_name', 'bar1', 'bar2', 'bar3'].includes(g1.toLowerCase())) {
                        let tok = findObjs({ type: 'graphic', subtype: 'token', id: msg.selected[0]._id })[0];
                        if (g1.toLowerCase() === 'token_id') return tok.id;
                        if (g1.toLowerCase() === 'token_name') return tok.get('name');
                        return tok.get(`${g1}_${g2 ? 'max' : 'value'}`) || '';
                    } else {
                        let character = findObjs({ type: 'character', id: (getObj("graphic", msg.selected[0]._id) || { get: () => { return "" } }).get("represents") })[0];
                        if (!character) return '';
                        if ('character_id' === g1.toLowerCase()) {
                            return character.id;
                        } else if ('character_name' === g1.toLowerCase()) {
                            return character.get('name');
                        }
                        return (findObjs({ type: 'attribute', character_id: character.id })[0] || { get: () => { return '' } }).get(g2 ? 'max' : 'current') || '';
                    }
                });
            } else { // api generated call to another script, copy in the appropriate data
                if (state[apiproject].autoinsert.includes('selected')) {
                    msg.selected = preservedMsgObj[maintrigger].selected;
                }
                if (state[apiproject].autoinsert.includes('who')) {
                    msg.who = preservedMsgObj[maintrigger].who;
                }
                if (state[apiproject].autoinsert.includes('playerid')) {
                    msg.playerid = preservedMsgObj[maintrigger].playerid;
                }
            }
        }

    };
    const getProp = (prop) => {
        return preservedMsgObj[maintrigger][prop] || undefined;
    };
    const getSelected = () => getProp('selected');
    const getWho = () => getProp('who');
    const getPlayerID = () => getProp('playerid');

    on('chat:message', handleInput);

    on('ready', () => {
        versionInfo();
        logsig();
    });

    return { // public interface
        GetSelected: getSelected,
        GetWho: getWho,
        GetPlayerID: getPlayerID
    };

})();
{ try { throw new Error(''); } catch (e) { API_Meta.SelectManager.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.SelectManager.offset); } }
