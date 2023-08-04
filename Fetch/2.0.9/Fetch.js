/*
=========================================================
Name			:	Fetch
GitHub			:	https://github.com/TimRohr22/Cauldron/tree/master/Fetch
Roll20 Contact  :	timmaugh
Version			:   2.0.9
Last Update		:	8/4/2023
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.Fetch = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.Fetch.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (12)); } }

const Fetch = (() => { //eslint-disable-line no-unused-vars
    const apiproject = 'Fetch';
    const version = '2.0.9';
    const apilogo = 'https://i.imgur.com/jeIkjvS.png';
    const apilogoalt = 'https://i.imgur.com/boYO3cf.png';
    const schemaVersion = 0.2;
    API_Meta[apiproject].version = version;
    const vd = new Date(1691176175905);
    const versionInfo = () => {
        log(`\u0166\u0166 ${apiproject} v${API_Meta[apiproject].version}, ${vd.getFullYear()}/${vd.getMonth() + 1}/${vd.getDate()} \u0166\u0166 -- offset ${API_Meta[apiproject].offset}`);
        if (!state.hasOwnProperty(apiproject) || state[apiproject].version !== schemaVersion) { //eslint-disable-line no-prototype-builtins
            log(`  > Updating ${apiproject} Schema to v${schemaVersion} <`);
            switch (state[apiproject] && state[apiproject].version) {

                case 0.1:
                /* falls through */
                case 0.2:
                    state[apiproject].settings = {
                        playerscanids: false
                    };
                    state[apiproject].defaults = {
                        playerscanids: false
                    }
                /* falls through */
                case 'UpdateSchemaVersion':
                    state[apiproject].version = schemaVersion;
                    break;

                default:
                    state[apiproject] = {
                        version: schemaVersion,
                        settings: {
                            playerscanids: false
                        },
                        defaults: {
                            playerscanids: false
                        }
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
    // ==================================================
    //		STATE MANAGEMENT
    // ==================================================
    const manageState = { // eslint-disable-line no-unused-vars
        reset: () => state[apiproject].settings = _.clone(state[apiproject].defaults),
        set: (p, v) => state[apiproject].settings[p] = v,
        get: (p) => { return state[apiproject].settings[p]; }
    };

    // ==================================================
    //		UTILTIES
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

    // ==================================================
    //		PRESENTATION
    // ==================================================

    let html = {};
    let css = {}; // eslint-disable-line no-unused-vars
    let HE = () => { }; // eslint-disable-line no-unused-vars
    const theme = {
        primaryColor: '#5E0099',
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
        sendas: sendas = 'Fetch',
        whisperto: whisperto = '',
        footer: footer = '',
        btn: btn = '',
    } = {}) => {
        if (title) title = html.div(html.div(html.img(apilogoalt, 'SelectManager Logo', localCSS.logoimg), localCSS.msgheaderlogodiv) + html.div(title, localCSS.msgheadercontent), {});
        Messenger.MsgBox({ msg: msg, title: title, bodycss: bodycss, sendas: sendas, whisperto: whisperto, footer: footer, btn: btn, headercss: headercss, footercss: footercss, boundingcss: localCSS.boundingcss, noarchive: true });
    };

    const getWhisperTo = (who) => who.toLowerCase() === 'api' ? 'gm' : who.replace(/\s\(gm\)$/i, '');
    const handleConfig = msg => {
        if (msg.type !== 'api' || !/^!fetchconfig/.test(msg.content)) return;
        let recipient = getWhisperTo(msg.who);
        if (!playerIsGM(msg.playerid)) {
            msgbox({ title: 'GM Rights Required', msg: 'You must be a GM to perform that operation', whisperto: recipient });
            return;
        }
        let cfgrx = /^(\+|-)(playerscanids)$/i;
        let res;
        let cfgTrack = {};
        let message;
        if (/^!fetchconfig\s+[^\s]/.test(msg.content)) {
            msg.content.split(/\s+/).slice(1).forEach(a => {
                res = cfgrx.exec(a);
                if (!res) return;
                if (res[2].toLowerCase() === 'playerscanids') {
                    manageState.set('playerscanids', (res[1] === '+'));
                    cfgTrack[res[2]] = res[1];
                }
            });
            let changes = Object.keys(cfgTrack).map(k => `${html.span(k, localCSS.inlineEmphasis)}: ${cfgTrack[k] === '+' ? 'enabled' : 'disabled'}`).join('<br>');
            msgbox({ title: `Fetch Config Changed`, msg: `You have made the following changes to the Fetch configuration:<br>${changes}`, whisperto: recipient });
        } else {
            cfgTrack.playerscanids = `${html.span('playerscanids', localCSS.inlineEmphasis)}: ${manageState.get('playerscanids') ? 'enabled' : 'disabled'}`;
            message = `Fetch is currently configured as follows:<br>${cfgTrack.playerscanids}`;
            msgbox({ title: 'Fetch Configuration', msg: message, whisperto: recipient });
        }
    };

    // ==================================================
    //		PROCESS
    // ==================================================

    const repeatingOrdinal = (character_id, section = '', attr_name = '') => {
        if (!section && !attr_name) return;
        let ordrx, match;
        if (attr_name) {
            ordrx = /^repeating_([^_]+)_([^_]+)_.*$/;
            if (!ordrx.test(attr_name)) return; // the supplied attribute name isn't a repeating attribute at all
            match = ordrx.exec(attr_name);
            section = match[1];
        }
        let sectionrx = new RegExp(`repeating_${section}_([^_]+)_.*$`);
        let createOrderKeys = [...new Set(findObjs({ type: 'attribute', characterid: character_id })
            .filter(a => sectionrx.test(a.get('name')))
            .map(a => sectionrx.exec(a.get('name'))[1]))];
        let sortOrderKeys = (findObjs({ type: 'attribute', characterid: character_id, name: `_reporder_repeating_${section}` })[0] || { get: () => { return ''; } })
            .get('current')
            .split(/\s*,\s*/)
            .filter(a => createOrderKeys.includes(a));
        sortOrderKeys.push(...createOrderKeys.filter(a => !sortOrderKeys.includes(a)));
        return attr_name ? sortOrderKeys.indexOf(match[2]) : sortOrderKeys;
    };
    const parsePattern = (cmd) => {
        const fieldcomprx = /^((?<retrieve>m)\s*\|)?\s*(?<field>[^\s]+?)\s*(?<operator>>=|<=|~|!~|=|!=|<|>)\s*((`|'|")(?<value>.*?)\6|(?<altvalue>.*?)(?=\s|$))\s*/i;
        const fieldrx = /^((?<retrieve>m)\s*\|)?\s*(?<field>[^\s]+)\s*/i;
        const fieldcomptm = { rx: fieldcomprx, type: 'fieldcomp' },
            fieldtm = { rx: fieldrx, type: 'field' };
        let index = 0;
        let p = {};
        let tokens = [];
        while (!/^$/.test(cmd.slice(index))) {
            p = getfirst(cmd.slice(index), fieldcomptm, fieldtm);
            if (p) {
                if (p.type === 'field') tokens.push({ type: '=', contents: [p.groups.field, true], retrieve: p.groups.retrieve ? 'max' : 'current' });
                else tokens.push({ type: p.groups.operator, contents: [p.groups.field, p.groups.value || p.groups.altvalue], retrieve: p.groups.retrieve ? 'max' : 'current' });
                index += p[0].length;
            } else {
                return { tokens: [], error: `Unexpected token encountered in repeating pattern: ${cmd}` };
            }
        }
        return { tokens: tokens };
    };

    const getSheetItem = (res, pid, char) => {
        // expects result of the getFirst() function, a rx result with a type property
        // r.type === 'sheetitem'
        const itemTypeLib = {
            '@': 'attribute',
            '*': 'attribute',
            '%': 'ability'
        }
        let c = char || getChar(res.groups.character, pid);
        if (!c) return;
        c.id = c.id || c._id;
        // standard sheet items
        if (['@', '%'].includes(res.groups.type)) {
            return findObjs({ type: itemTypeLib[res.groups.type], characterid: c.id })
                .filter(a => a.get('name') === res.groups.item)[0];
        }
        // if we're still here, we're looking for a repeating item
        // test if they used a full form with an ID or a $0 form
        if (res.groups.type === '*' && res.groups.reference && res.groups.reference.length) {
            let rowid = /\$\d+/.test(res.groups.reference) ? repeatingOrdinal(c.id, res.groups.section)[/\$(\d+)/.exec(res.groups.reference)[1]] : res.groups.reference;
            return rowid ? findObjs({ type: itemTypeLib[res.groups.type], characterid: c.id })
                .filter(a => a.get('name') === `repeating_${res.groups.section}_${rowid}_${res.groups.valuesuffix}`)[0] : rowid;
        }
        // if we're still here, they used a pattern match
        let p = parsePattern(res.groups.pattern);
        if (!p.tokens.length) {
            log(p.error || 'No pattern detected for repeating sheet item.');
            return;
        }

        let filterLib = {
            '=': (a) => a.contents[0] == a.contents[1], // eslint-disable-line eqeqeq
            '!=': (a) => a.contents[0] != a.contents[1],// eslint-disable-line eqeqeq
            '~': (a) => a.contents[0].includes(a.contents[1]),
            '!~': (a) => !a.contents[0].includes(a.contents[1]),
            '>': (a) => (internalTestLib.num(a.contents[0]) ? Number(a.contents[0]) : a.contents[0]) > (internalTestLib.num(a.contents[1]) ? Number(a.contents[1]) : a.contents[1]),
            '>=': (a) => (internalTestLib.num(a.contents[0]) ? Number(a.contents[0]) : a.contents[0]) >= (internalTestLib.num(a.contents[1]) ? Number(a.contents[1]) : a.contents[1]),
            '<': (a) => (internalTestLib.num(a.contents[0]) ? Number(a.contents[0]) : a.contents[0]) < (internalTestLib.num(a.contents[1]) ? Number(a.contents[1]) : a.contents[1]),
            '<=': (a) => (internalTestLib.num(a.contents[0]) ? Number(a.contents[0]) : a.contents[0]) <= (internalTestLib.num(a.contents[1]) ? Number(a.contents[1]) : a.contents[1])
        }

        p.tests = [];
        let reprx = new RegExp(`^repeating_${res.groups.section}_(?<repID>[^_]*?)_(?<suffix>.+)$`);
        let repres;
        let o = findObjs({ type: itemTypeLib[res.groups.type], characterid: c.id })
            .filter(a => reprx.test(a.get('name')));
        o.forEach(a => {
            reprx.lastIndex = 0;
            repres = reprx.exec(a.get('name'));
            a.name = a.get('name');
            a.repID = repres.groups.repID;
            a.suffix = repres.groups.suffix;
        });

        let viable = [];
        p.tokens.forEach(s => {
            viable = [];
            o.forEach(a => {
                if (a.suffix.toLowerCase() === s.contents[0].toLowerCase()) {
                    if (filterLib[s.type]({ contents: [a.get(s.retrieve), s.contents[1]] })) viable.push(a.repID);
                }
            });
            p.tests.push(viable);
        });
        // we should have the same number of tests as we do testable conditions
        if (p.tests.length !== p.tokens.length) {
            log(`EXITING: TEST COUNTS DON'T MATCH`);
            return;
        }
        viable = p.tests.reduce((m, v) => m.filter(repID => v.includes(repID)));
        if (viable.length) {
            let retObj = findObjs({ type: itemTypeLib[res.groups.type], characterid: c.id })
                .filter(a => a.get('name') === `repeating_${res.groups.section}_${viable[0]}_${res.groups.valuesuffix}`)[0];
            return retObj;
        }
    };
    const getSheetItemVal = (res, pid, char) => {
        // expects the result of a rx with groups
        let val = '',
            retrieve = '',
            o = {};
        // determine what to test; also what to retrieve if another value isn't specified
        if (['@', '*'].includes(res.groups.type) && res.groups.valtype !== 'max') {
            retrieve = 'current';
        } else if (['@', '*'].includes(res.groups.type)) {
            retrieve = 'max';
        } else {
            retrieve = 'action';
        }
        // determine if a different retrievable info is requested
        if (res.groups.type === '*' && res.groups.valtype === 'name$') {
            retrieve = 'name$';
        } else if (res.groups.type === '*' && res.groups.valtype === 'row$') {
            retrieve = 'row$';
        } else if (res.groups.valtype === 'rowid') {
            retrieve = 'rowid';
        } else if (res.groups.valtype === 'name') {
            retrieve = 'name';
        } else if (res.groups.valtype === 'id') {
            retrieve = 'id';
        }
        // go get the item
        o = getSheetItem(res, pid, char);
        if (!o) {
            return;
        } else {
            if (['name', 'action', 'current', 'max', 'id'].includes(retrieve)) {
                val = o.get(retrieve);
            } else {
                val = o.get('name');
                let row;
                let rptrx = /^repeating_([^_]+)_([^_]+)_(.*)$/i;
                let rptres = rptrx.exec(val) || [undefined, undefined, '', ''];
                switch (retrieve) {
                    case 'row$':
                        val = `$${repeatingOrdinal(o.get('characterid'), undefined, val)}`;
                        break;
                    case 'name$':
                        row = `$${repeatingOrdinal(o.get('characterid'), undefined, val)}`;
                        val = `repeating_${rptres[1]}_${row}_${rptres[3]}`;
                        break;
                    case 'rowid':
                        val = rptres[2];
                        break;
                    default:
                }
            }
        }
        return val;
    };

    const getChar = (query, pid) => { // find a character where query is an identifying piece of information (id, name, or token id)
        let character;
        if (typeof query !== 'string') return character;
        let qrx = new RegExp(escapeRegExp(query), 'i');
        let charsIControl = findObjs({ type: 'character' });
        charsIControl = playerIsGM(pid) || manageState.get('playerscanids') ? charsIControl : charsIControl.filter(c => {
            return c.get('controlledby').split(',').reduce((m, p) => {
                return m || p === 'all' || p === pid;
            }, false)
        });
        character = charsIControl.filter(c => c.id === query)[0] ||
            charsIControl.filter(c => c.id === (getObj('graphic', query) || { get: () => { return '' } }).get('represents'))[0] ||
            charsIControl.filter(c => c.get('name') === query)[0] ||
            charsIControl.filter(c => {
                qrx.lastIndex = 0;
                return qrx.test(c.get('name'));
            })[0];
        return character;
    };
    const getPageForPlayer = (playerid) => {
        let player = getObj('player', playerid);
        if (playerIsGM(playerid)) {
            return player.get('lastpage') || Campaign().get('playerpageid');
        }

        let psp = Campaign().get('playerspecificpages');
        if (psp[playerid]) {
            return psp[playerid];
        }

        return Campaign().get('playerpageid');
    };
    const getPagesForAllPlayers = () => findObjs({ type: 'player', online: true })
        .reduce((m, p) => {
            m[p.id] = getPageForPlayer(p.id)
            return m;
        }, {});
    const getCampaign = () => {
        let c = simpleObj(Campaign());
        let p = getPagesForAllPlayers();

        c.currentpages = Object.keys(p).map(k => `${k}:${p[k]}`).join(',');
        c.currentpagesname = Object.keys(p).map(k => `${getObjName(k,'player')}:${getObjName(p[k],'page')}`).join(',');
        return c;
    };
    const getPlayer = (query) => {
        let player = findObjs({ type: 'player', id: query })[0] ||
            findObjs({ type: 'player' }).filter(p => { return [query.toLowerCase(), query.replace(/\s\(gm\)$/i, '').toLowerCase()].includes(p.get('_displayname').toLowerCase()); })[0];

        if (player && player.id) {
            player = simpleObj(player);
            player.currentpage = getPageForPlayer(player._id);
        }
        return player;
    };
    const getPage = (query) => {
        return findObjs({ type: 'page', id: query })[0] ||
            findObjs({ type: 'page' }).filter(p => { return p.get('name') === query; })[0];
    };
    const decomposeStatuses = (list = '') => {
        return list.split(/\s*,\s*/g).filter(s => s.length)
            .reduce((m, s) => {
                let origst = libTokenMarkers.getStatus(s.slice(0, /(@\d+$|:)/.test(s) ? /(@\d+$|:)/.exec(s).index : s.length));
                let st = _.clone(origst);
                if (!st) return m;
                st.num = /^.+@0*(\d+)/.test(s) ? /^.+@0*(\d+)/.exec(s)[1] : '';
                st.html = origst.getHTML();
                st.url = st.url || '';
                m.push(st);
                return m;
            }, []);
    };
    class StatusBlock {
        constructor({ token: token = {}, msgId: msgId = generateUUID() } = {}) {
            this.token = token;
            this.msgId = msgId;
            this.statuses = (decomposeStatuses(token.statusmarkers) || []).reduce((m, s) => {
                m[s.name] = m[s.name] || []
                m[s.name].push(Object.assign({}, s, { is: 'yes' }));
                return m;
            }, {});
        }
    }

    const tokenStatuses = {};
    const getStatus = (t, query, msgId) => {
        let token, rxret, status, index, modindex, statusblock;
        token = getToken(t);
        if (!token) return;
        token = simpleObj(token);
        if (token && !token.hasOwnProperty('id')) token.id = token._id; 
        if (!tokenStatuses.hasOwnProperty(token.id) || tokenStatuses[token.id].msgId !== msgId) {
            tokenStatuses[token.id] = new StatusBlock({ token: token, msgId: msgId });
        }
        rxret = /(?<marker>.+?)(?:\?(?<index>\d+|all\+?))?$/.exec(query);
        [status, index] = [rxret.groups.marker, rxret.groups.index];
        if (!index) {
            modindex = 1;
        } else if (['all', 'all+'].includes(index.toLowerCase())) {
            modindex = index.toLowerCase();
        } else {
            modindex = Number(index);
        }
        statusblock = tokenStatuses[token.id].statuses[status];
        if (!statusblock || !statusblock.length) {
            return { is: 'no', count: '0' };
        };
        switch (index) {
            case 'all':
                return statusblock.reduce((m, sm) => {
                    m.num = `${m.num || ''}${sm.num}`;
                    m.tag = m.tag || sm.tag;
                    m.url = m.url || sm.url;
                    m.html = m.html || sm.html;
                    m.is = 'yes';
                    m.count = m.count || statusblock.length;
                    return m;
                }, {});
            case 'all+':
                return statusblock.reduce((m, sm) => {
                    m.num = `${Number(m.num || 0) + Number(sm.num)}`;
                    m.tag = m.tag || sm.tag;
                    m.url = m.url || sm.url;
                    m.html = m.html || sm.html;
                    m.is = 'yes';
                    m.count = m.count || statusblock.length;
                    return m;
                }, {});
            default:
                if (statusblock.length >= modindex) {
                    return Object.assign({}, statusblock[modindex - 1], { count: index ? '1' : statusblock.length });
                } else {
                    return { is: 'no', 'count': '0' };
                }
        }
    };
    const getMarker = (query) => {
        if (libTokenMarkers.getStatus(query).getTag().length) return decomposeStatuses(query)[0];
    };

    const getPageID = (pid) => {
        return (pid && playerIsGM(pid)) ? (getObj('player', pid).get('_lastpage') || Campaign().get('playerpageid')) : Campaign().get('playerpageid');
    };
    const getTrackerVal = (token) => {
        let retval = {};
        let to = JSON.parse(Campaign().get('turnorder') || '[]');
        let mto = to.map(t => t.id);
        if (mto.includes(token.id)) {
            retval.tracker = to.filter(t => t.id === token.id)[0].pr;
            retval.tracker_offset = mto.indexOf(token.id);
        }
        return retval;
    };
    const getToken = (info, pgid = '') => {
        let lightvals = {
            base: {},
            assign: {}
        };
        let token = findObjs({ type: 'graphic', subtype: 'token', id: info })[0] ||
            findObjs({ type: 'graphic', subtype: 'card', id: info })[0] ||
            findObjs({ type: 'graphic', subtype: 'token', name: info, pageid: pgid })[0] ||
            findObjs({ type: 'graphic', subtype: 'token', pageid: pgid })
                .filter(t => t.get('represents').length && findObjs({ type: 'character', id: t.get('represents') })[0].get('name') === info)[0];
        if (token && token.id) {
            if (typeof checkLightLevel !== 'undefined' && checkLightLevel.hasOwnProperty('isLitBy') && typeof checkLightLevel.isLitBy === 'function') {
                lightvals.base = checkLightLevel.isLitBy(token);
                lightvals.assign.checklight_isbright = lightvals.base.bright ? 'true' : 'false';
                lightvals.assign.checklight_total = lightvals.base.total
            }
            token = Object.assign(simpleObj(token), getTrackerVal(token),lightvals.assign);
        }
        return token;
    };
    const getObjName = (key, type) => {
        let o;
        switch (type) {
            case 'playerlist':
                o = key.split(/\s*,\s*/)
                    .map(k => k === 'all' ? k : getObj('player', k))
                    .filter(c => c)
                    .map(c => c === 'all' ? c : c.get('displayname'))
                    .join(', ');
                return o.length ? o : undefined;
            case 'player':
                o = getObj(type, key);
                return o ? o.get('displayname') : undefined;
            case 'page':
            case 'attribute':
            case 'character':
            default:
                o = getObj(type, key);
                return o ? o.get('name') : undefined;
        }
    };
    const getControlledByList = (s, d) => {
        if (!s.represents || !s.represents.length) return d && d.length ? d : s.controlledby;
        let c = getObj('character', s.represents);
        if (c) return c.get('controlledby');
    };
    const tokenProps = {
        id: { refersto: '_id', permissionsreq: 'any', dataval: (d) => d },
        tid: { refersto: '_id', permissionsreq: 'any', dataval: (d) => d },
        token_id: { refersto: '_id', permissionsreq: 'any', dataval: (d) => d },
        token_name: { refersto: 'name', permissionsreq: 'any', dataval: (d) => d },
        cardid: { refersto: '_cardid', permissionsreq: 'any', dataval: (d) => d },
        cid: { refersto: '_cardid', permissionsreq: 'any', dataval: (d) => d },
        page_id: { refersto: '_pageid', permissionsreq: 'any', dataval: (d) => d },
        pageid: { refersto: '_pageid', permissionsreq: 'any', dataval: (d) => d },
        pid: { refersto: '_pageid', permissionsreq: 'any', dataval: (d) => d },
        token_page_id: { refersto: '_pageid', permissionsreq: 'any', dataval: (d) => d },
        token_pageid: { refersto: '_pageid', permissionsreq: 'any', dataval: (d) => d },
        token_pid: { refersto: '_pageid', permissionsreq: 'any', dataval: (d) => d },
        page: { refersto: '_pageid', permissionsreq: 'any', dataval: d => getObjName(d, 'page') },
        page_name: { refersto: '_pageid', permissionsreq: 'any', dataval: d => getObjName(d, 'page') },
        sub: { refersto: '_subtype', permissionsreq: 'any', dataval: (d) => d },
        subtype: { refersto: '_subtype', permissionsreq: 'any', dataval: (d) => d },
        type: { refersto: '_type', permissionsreq: 'any', dataval: (d) => d },
        token_type: { refersto: '_type', permissionsreq: 'any', dataval: (d) => d },
        adv_fow_view_distance: { refersto: 'adv_fow_view_distance', permissionsreq: 'any', dataval: (d) => d },
        aura1: { refersto: 'aura1_color', permissionsreq: 'any', dataval: (d) => d },
        aura1_color: { refersto: 'aura1_color', permissionsreq: 'any', dataval: (d) => d },
        aura1_radius: { refersto: 'aura1_radius', permissionsreq: 'any', dataval: (d) => d },
        radius1: { refersto: 'aura1_radius', permissionsreq: 'any', dataval: (d) => d },
        aura1_square: { refersto: 'aura1_square', permissionsreq: 'any', dataval: (d) => d },
        square1: { refersto: 'aura1_square', permissionsreq: 'any', dataval: (d) => d },
        aura2: { refersto: 'aura2_color', permissionsreq: 'any', dataval: (d) => d },
        aura2_color: { refersto: 'aura2_color', permissionsreq: 'any', dataval: (d) => d },
        aura2_radius: { refersto: 'aura2_radius', permissionsreq: 'any', dataval: (d) => d },
        radius2: { refersto: 'aura2_radius', permissionsreq: 'any', dataval: (d) => d },
        aura2_square: { refersto: 'aura2_square', permissionsreq: 'any', dataval: (d) => d },
        square2: { refersto: 'aura2_square', permissionsreq: 'any', dataval: (d) => d },
        bar_location: { refersto: 'bar_location', permissionsreq: 'any', dataval: (d) => d },
        bar_loc: { refersto: 'bar_location', permissionsreq: 'any', dataval: (d) => d },
        bar1_link: { refersto: 'bar1_link', permissionsreq: 'any', dataval: (d) => d },
        link1: { refersto: 'bar1_link', permissionsreq: 'any', dataval: (d) => d },
        bar1_name: { refersto: 'bar1_link', permissionsreq: 'any', dataval: d => /^sheetattr_/.test(d) ? d.replace(/^sheetattr_/, '') : getObjName(d, 'attribute') },
        name1: { refersto: 'bar1_link', permissionsreq: 'any', dataval: d => /^sheetattr_/.test(d) ? d.replace(/^sheetattr_/, '') : getObjName(d, 'attribute') },
        bar1_max: { refersto: 'bar1_max', permissionsreq: 'any', dataval: (d) => d },
        max1: { refersto: 'bar1_max', permissionsreq: 'any', dataval: (d) => d },
        bar1: { refersto: 'bar1_value', permissionsreq: 'any', dataval: (d) => d },
        bar1_current: { refersto: 'bar1_value', permissionsreq: 'any', dataval: (d) => d },
        bar1_value: { refersto: 'bar1_value', permissionsreq: 'any', dataval: (d) => d },
        bar2_link: { refersto: 'bar2_link', permissionsreq: 'any', dataval: (d) => d },
        link2: { refersto: 'bar2_link', permissionsreq: 'any', dataval: (d) => d },
        bar2_name: { refersto: 'bar2_link', permissionsreq: 'any', dataval: d => /^sheetattr_/.test(d) ? d.replace(/^sheetattr_/, '') : getObjName(d, 'attribute') },
        name2: { refersto: 'bar2_link', permissionsreq: 'any', dataval: d => /^sheetattr_/.test(d) ? d.replace(/^sheetattr_/, '') : getObjName(d, 'attribute') },
        bar2_max: { refersto: 'bar2_max', permissionsreq: 'any', dataval: (d) => d },
        max2: { refersto: 'bar2_max', permissionsreq: 'any', dataval: (d) => d },
        bar2: { refersto: 'bar2_value', permissionsreq: 'any', dataval: (d) => d },
        bar2_current: { refersto: 'bar2_value', permissionsreq: 'any', dataval: (d) => d },
        bar2_value: { refersto: 'bar2_value', permissionsreq: 'any', dataval: (d) => d },
        bar3_link: { refersto: 'bar3_link', permissionsreq: 'any', dataval: (d) => d },
        link3: { refersto: 'bar3_link', permissionsreq: 'any', dataval: (d) => d },
        bar3_name: { refersto: 'bar3_link', permissionsreq: 'any', dataval: d => /^sheetattr_/.test(d) ? d.replace(/^sheetattr_/, '') : getObjName(d, 'attribute') },
        name3: { refersto: 'bar3_link', permissionsreq: 'any', dataval: d => /^sheetattr_/.test(d) ? d.replace(/^sheetattr_/, '') : getObjName(d, 'attribute') },
        bar3_max: { refersto: 'bar3_max', permissionsreq: 'any', dataval: (d) => d },
        max3: { refersto: 'bar3_max', permissionsreq: 'any', dataval: (d) => d },
        bar3: { refersto: 'bar3_value', permissionsreq: 'any', dataval: (d) => d },
        bar3_current: { refersto: 'bar3_value', permissionsreq: 'any', dataval: (d) => d },
        bar3_value: { refersto: 'bar3_value', permissionsreq: 'any', dataval: (d) => d },
        bright_light_distance: { refersto: 'bright_light_distance', permissionsreq: 'any', dataval: (d) => d },

        checklight_isbright: { refersto: 'checklight_isbright', permissionsreq: 'any', dataval: (d) => d },
        checklight_total: { refersto: 'checklight_total', permissionsreq: 'any', dataval: (d) => d },

        compact_bar: { refersto: 'compact_bar', permissionsreq: 'any', dataval: (d) => d },
        player: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d, s) => getControlledByList(s, d).split(/\s*,\s*/).filter(a => a.toLowerCase() !== 'all' && getObj('player', a))[0] },
        player_name: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d, s) => getControlledByList(s, d).split(/\s*,\s*/).filter(a => a.toLowerCase() !== 'all').map(a => getObjName(a, 'player')).filter(a => a)[0] },
        token_cby: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d, s) => getControlledByList(s, d) },
        token_controlledby: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d, s) => getControlledByList(s, d) },
        token_cby_names: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d, s) => getObjName(getControlledByList(s, d), 'playerlist') },
        token_controlledby_names: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d, s) => getObjName(getControlledByList(s, d), 'playerlist') },
        token_cby_name: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d, s) => getObjName(getControlledByList(s, d), 'playerlist') },
        token_controlledby_name: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d, s) => getObjName(getControlledByList(s, d), 'playerlist') },
        currentside: { refersto: 'currentSide', permissionsreq: 'any', dataval: (d) => d },
        curside: { refersto: 'currentSide', permissionsreq: 'any', dataval: (d) => d },
        side: { refersto: 'currentSide', permissionsreq: 'any', dataval: (d) => d },
        dim_light_opacity: { refersto: 'dim_light_opacity', permissionsreq: 'any', dataval: (d) => d },
        directional_bright_light_center: { refersto: 'directional_bright_light_center', permissionsreq: 'any', dataval: (d) => d },
        directional_bright_light_total: { refersto: 'directional_bright_light_total', permissionsreq: 'any', dataval: (d) => d },
        directional_low_light_center: { refersto: 'directional_low_light_center', permissionsreq: 'any', dataval: (d) => d },
        directional_low_light_total: { refersto: 'directional_low_light_total', permissionsreq: 'any', dataval: (d) => d },
        emits_bright: { refersto: 'emits_bright_light', permissionsreq: 'any', dataval: (d) => d },
        emits_bright_light: { refersto: 'emits_bright_light', permissionsreq: 'any', dataval: (d) => d },
        emits_low: { refersto: 'emits_low_light', permissionsreq: 'any', dataval: (d) => d },
        emits_low_light: { refersto: 'emits_low_light', permissionsreq: 'any', dataval: (d) => d },
        fliph: { refersto: 'fliph', permissionsreq: 'any', dataval: (d) => d },
        flipv: { refersto: 'flipv', permissionsreq: 'any', dataval: (d) => d },
        gmnotes: { refersto: 'gmnotes', permissionsreq: 'gm', dataval: (d) => unescape(d) },
        has_bright_light_vision: { refersto: 'has_bright_light_vision', permissionsreq: 'any', dataval: (d) => d },
        has_directional_bright_light: { refersto: 'has_directional_bright_light', permissionsreq: 'any', dataval: (d) => d },
        has_directional_low_light: { refersto: 'has_directional_low_light', permissionsreq: 'any', dataval: (d) => d },
        has_limit_field_of_night_vision: { refersto: 'has_limit_field_of_night_vision', permissionsreq: 'any', dataval: (d) => d },
        has_limit_field_of_vision: { refersto: 'has_limit_field_of_vision', permissionsreq: 'any', dataval: (d) => d },
        has_night_vision: { refersto: 'has_night_vision', permissionsreq: 'any', dataval: (d) => d },
        has_nv: { refersto: 'has_night_vision', permissionsreq: 'any', dataval: (d) => d },
        nv_has: { refersto: 'has_night_vision', permissionsreq: 'any', dataval: (d) => d },
        height: { refersto: 'height', permissionsreq: 'any', dataval: (d) => d },
        img: { refersto: 'imgsrc', permissionsreq: 'any', dataval: (d) => `<img src="${d}">` },
        imgsrc: { refersto: 'imgsrc', permissionsreq: 'any', dataval: (d) => d },
        imgsrc_short: { refersto: 'imgsrc', permissionsreq: 'any', dataval: (d) => d.slice(0, Math.max(d.indexOf(`?`), 0) || d.length) },
        drawing: { refersto: 'isdrawing', permissionsreq: 'any', dataval: (d) => d },
        isdrawing: { refersto: 'isdrawing', permissionsreq: 'any', dataval: (d) => d },
        lastmove: { refersto: 'lastmove', permissionsreq: 'any', dataval: (d) => d },
        lastx: { refersto: 'lastmove', permissionsreq: 'any', dataval: d => d.split(/\s*,\s*/)[0] || '' },
        lasty: { refersto: 'lastmove', permissionsreq: 'any', dataval: d => d.split(/\s*,\s*/)[1] || '' },
        layer: { refersto: 'layer', permissionsreq: 'gm', dataval: (d) => d },
        left: { refersto: 'left', permissionsreq: 'any', dataval: (d) => d },
        light_angle: { refersto: 'light_angle', permissionsreq: 'any', dataval: (d) => d },
        light_dimradius: { refersto: 'light_dimradius', permissionsreq: 'any', dataval: (d) => d },
        light_hassight: { refersto: 'light_hassight', permissionsreq: 'any', dataval: (d) => d },
        light_losangle: { refersto: 'light_losangle', permissionsreq: 'any', dataval: (d) => d },
        light_multiplier: { refersto: 'light_multiplier', permissionsreq: 'any', dataval: (d) => d },
        light_otherplayers: { refersto: 'light_otherplayers', permissionsreq: 'any', dataval: (d) => d },
        light_radius: { refersto: 'light_radius', permissionsreq: 'any', dataval: (d) => d },
        light_sensitivity_multiplier: { refersto: 'light_sensitivity_multiplier', permissionsreq: 'any', dataval: (d) => d },
        light_sensitivity_mult: { refersto: 'light_sensitivity_multiplier', permissionsreq: 'any', dataval: (d) => d },
        limit_field_of_night_vision_center: { refersto: 'limit_field_of_night_vision_center', permissionsreq: 'any', dataval: (d) => d },
        limit_field_of_night_vision_total: { refersto: 'limit_field_of_night_vision_total', permissionsreq: 'any', dataval: (d) => d },
        limit_field_of_vision_center: { refersto: 'limit_field_of_vision_center', permissionsreq: 'any', dataval: (d) => d },
        limit_field_of_vision_total: { refersto: 'limit_field_of_vision_total', permissionsreq: 'any', dataval: (d) => d },
        low_light_distance: { refersto: 'low_light_distance', permissionsreq: 'any', dataval: (d) => d },
        night_vision_distance: { refersto: 'night_vision_distance', permissionsreq: 'any', dataval: (d) => d },
        nv_dist: { refersto: 'night_vision_distance', permissionsreq: 'any', dataval: (d) => d },
        nv_distance: { refersto: 'night_vision_distance', permissionsreq: 'any', dataval: (d) => d },
        night_vision_effect: { refersto: 'night_vision_effect', permissionsreq: 'any', dataval: (d) => d },
        nv_effect: { refersto: 'night_vision_effect', permissionsreq: 'any', dataval: (d) => d },
        night_vision_tint: { refersto: 'night_vision_tint', permissionsreq: 'any', dataval: (d) => d },
        nv_tint: { refersto: 'night_vision_tint', permissionsreq: 'any', dataval: (d) => d },
        playersedit_aura1: { refersto: 'playersedit_aura1', permissionsreq: 'any', dataval: (d) => d },
        playersedit_aura2: { refersto: 'playersedit_aura2', permissionsreq: 'any', dataval: (d) => d },
        playersedit_bar1: { refersto: 'playersedit_bar1', permissionsreq: 'any', dataval: (d) => d },
        playersedit_bar2: { refersto: 'playersedit_bar2', permissionsreq: 'any', dataval: (d) => d },
        playersedit_bar3: { refersto: 'playersedit_bar3', permissionsreq: 'any', dataval: (d) => d },
        playersedit_name: { refersto: 'playersedit_name', permissionsreq: 'any', dataval: (d) => d },
        represents: { refersto: 'represents', permissionsreq: 'any', dataval: (d) => d },
        reps: { refersto: 'represents', permissionsreq: 'any', dataval: (d) => d },
        represents_name: { refersto: 'represents', permissionsreq: 'any', dataval: d => getObjName(d, 'character') },
        reps_name: { refersto: 'represents', permissionsreq: 'any', dataval: d => getObjName(d, 'character') },
        rotation: { refersto: 'rotation', permissionsreq: 'any', dataval: (d) => d },
        showname: { refersto: 'showname', permissionsreq: 'any', dataval: (d) => d },
        showplayers_aura1: { refersto: 'showplayers_aura1', permissionsreq: 'any', dataval: (d) => d },
        showplayers_aura2: { refersto: 'showplayers_aura2', permissionsreq: 'any', dataval: (d) => d },
        showplayers_bar1: { refersto: 'showplayers_bar1', permissionsreq: 'any', dataval: (d) => d },
        showplayers_bar2: { refersto: 'showplayers_bar2', permissionsreq: 'any', dataval: (d) => d },
        showplayers_bar3: { refersto: 'showplayers_bar3', permissionsreq: 'any', dataval: (d) => d },
        showplayers_name: { refersto: 'showplayers_name', permissionsreq: 'any', dataval: (d) => d },
        show_tooltip: { refersto: 'show_tooltip', permissionsreq: 'any', dataval: (d) => d },
        sides: { refersto: 'sides', permissionsreq: 'any', dataval: (d) => d },
        sidecount: { refersto: 'sides', permissionsreq: 'any', dataval: (d) => ('' || d).split(`|`).length },
        sidescount: { refersto: 'sides', permissionsreq: 'any', dataval: (d) => ('' || d).split(`|`).length },
        markers: { refersto: 'statusmarkers', permissionsreq: 'any', dataval: (d) => d },
        statusmarkers: { refersto: 'statusmarkers', permissionsreq: 'any', dataval: (d) => d },
        tint: { refersto: 'tint_color', permissionsreq: 'any', dataval: (d) => d },
        tint_color: { refersto: 'tint_color', permissionsreq: 'any', dataval: (d) => d },
        tooltip: { refersto: 'tooltip', permissionsreq: 'any', dataval: (d) => d },
        top: { refersto: 'top', permissionsreq: 'any', dataval: (d) => d },
        tracker: { refersto: 'tracker', permissionsreq: 'any', dataval: (d) => d },
        tracker_offset: { refersto: 'tracker_offset', permissionsreq: 'any', dataval: (d) => d },
        width: { refersto: 'width', permissionsreq: 'any', dataval: (d) => d }
    };
    const charProps = {
        char_id: { refersto: '_id', permissionsreq: 'any', dataval: (d) => d },
        character_id: { refersto: '_id', permissionsreq: 'any', dataval: (d) => d },
        char_name: { refersto: 'name', permissionsreq: 'any', dataval: (d) => d },
        character_name: { refersto: 'name', permissionsreq: 'any', dataval: (d) => d },
        char_type: { refersto: '_type', permissionsreq: 'any', dataval: (d) => d },
        character_type: { refersto: '_type', permissionsreq: 'any', dataval: (d) => d },
        avatar: { refersto: 'avatar', permissionsreq: 'any', dataval: (d) => d },
        char_img: { refersto: 'avatar', permissionsreq: 'any', dataval: (d) => `<img src="${d}">` },
        character_img: { refersto: 'avatar', permissionsreq: 'any', dataval: (d) => `<img src="${d}">` },
        archived: { refersto: 'archived', permissionsreq: 'any', dataval: (d) => d },
        inplayerjournals: { refersto: 'inplayerjournals', permissionsreq: 'any', dataval: (d) => d },
        inplayerjournals_name: { refersto: 'inplayerjournals', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        inplayerjournals_names: { refersto: 'inplayerjournals', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        character_controlledby: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => d },
        character_cby: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => d },
        player: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => d.split(/\s*,\s*/).filter(a => a.toLowerCase() !== 'all' && getObj('player', a))[0] },
        player_name: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => d.split(/\s*,\s*/).filter(a => a.toLowerCase() !== 'all').map(a => getObjName(a, 'player')).filter(a => a)[0] },
        char_cby: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => d },
        char_controlledby: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => d },
        character_controlledby_name: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        character_cby_name: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        char_cby_name: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        char_controlledby_name: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        character_controlledby_names: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        character_cby_names: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        char_cby_names: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        char_controlledby_names: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        defaulttoken: { refersto: '_defaulttoken', permissionsreq: 'any', dataval: (d) => d }
    };
    const playerProps = { // $(player.player_color)
        player_id: { refersto: '_id', permissionsreq: 'any', dataval: (d) => d },
        player_name: { refersto: '_displayname', permissionsreq: 'any', dataval: (d) => d },
        displayname: { refersto: '_displayname', permissionsreq: 'any', dataval: (d) => d },
        display_name: { refersto: '_displayname', permissionsreq: 'any', dataval: (d) => d },
        player_type: { refersto: '_type', permissionsreq: 'any', dataval: (d) => d },
        color: { refersto: 'color', permissionsreq: 'any', dataval: (d) => d },
        lastpage: { refersto: '_lastpage', permissionsreq: 'any', dataval: (d) => d },
        last_page: { refersto: '_lastpage', permissionsreq: 'any', dataval: (d) => d },
        lastpagename: { refersto: '_lastpage', permissionsreq: 'any', dataval: (d) => getObjName(d, 'page') },
        last_page_name: { refersto: '_lastpage', permissionsreq: 'any', dataval: (d) => getObjName(d, 'page') },
        current_page: { refersto: 'currentpage', permissionsreq: 'any', dataval: (d) => d },
        currentpage: { refersto: 'currentpage', permissionsreq: 'any', dataval: (d) => d },
        currentpagename: { refersto: 'currentpage', permissionsreq: 'any', dataval: (d) => getObjName(d, 'page') },
        current_page_name: { refersto: 'currentpage', permissionsreq: 'any', dataval: (d) => getObjName(d, 'page') },
        macrobar: { refersto: '_macrobar', permissionsreq: 'any', dataval: (d) => d },
        online: { refersto: '_online', permissionsreq: 'any', dataval: (d) => d },
        roll20id: { refersto: '_d20userid', permissionsreq: 'any', dataval: (d) => d },
        roll20_id: { refersto: '_d20userid', permissionsreq: 'any', dataval: (d) => d },
        r20id: { refersto: '_d20userid', permissionsreq: 'any', dataval: (d) => d },
        r20_id: { refersto: '_d20userid', permissionsreq: 'any', dataval: (d) => d },
        showmacrobar: { refersto: 'showmacrobar', permissionsreq: 'any', dataval: (d) => d },
        show_macrobar: { refersto: 'showmacrobar', permissionsreq: 'any', dataval: (d) => d },
        speakingas: { refersto: 'speakingas', permissionsreq: 'any', dataval: (d) => d },
        speaking_as: { refersto: 'speakingas', permissionsreq: 'any', dataval: (d) => d },
        userid: { refersto: '_d20userid', permissionsreq: 'any', dataval: (d) => d },
        user_id: { refersto: '_d20userid', permissionsreq: 'any', dataval: (d) => d }
    };
    const pageProps = { // @(page.pagename)
        page_id: { refersto: '_id', permissionsreq: 'any', dataval: (d) => d },
        page_name: { refersto: 'name', permissionsreq: 'any', dataval: (d) => d },
        page_type: { refersto: '_type', permissionsreq: 'any', dataval: (d) => d },
        adv_fow_enabled: { refersto: 'adv_fow_enabled', permissionsreq: 'any', dataval: (d) => d },
        adv_fow_dim_reveals: { refersto: 'adv_fow_dim_reveals', permissionsreq: 'any', dataval: (d) => d },
        adv_fow_show_grid: { refersto: 'adv_fow_show_grid', permissionsreq: 'any', dataval: (d) => d },
        archived: { refersto: 'archived', permissionsreq: 'any', dataval: (d) => d },
        background_color: { refersto: 'background_color', permissionsreq: 'any', dataval: (d) => d },
        bg_color: { refersto: 'background_color', permissionsreq: 'any', dataval: (d) => d },
        daylight_mode_enabled: { refersto: 'daylight_mode_enabled', permissionsreq: 'any', dataval: (d) => d },
        daylightmodeopacity: { refersto: 'daylightModeOpacity', permissionsreq: 'any', dataval: (d) => d },
        daylight_mode_opacity: { refersto: 'daylightModeOpacity', permissionsreq: 'any', dataval: (d) => d },
        diagonaltype: { refersto: 'diagonaltype', permissionsreq: 'any', dataval: (d) => d },
        diagonal_type: { refersto: 'diagonaltype', permissionsreq: 'any', dataval: (d) => d },
        diagonal: { refersto: 'diagonaltype', permissionsreq: 'any', dataval: (d) => d },
        dynamic_lighting_enabled: { refersto: 'dynamic_lighting_enabled', permissionsreq: 'any', dataval: (d) => d },
        explorer_mode: { refersto: 'explorer_mode', permissionsreq: 'any', dataval: (d) => d },
        fogopacity: { refersto: 'fog_opacity', permissionsreq: 'any', dataval: (d) => d },
        fog_opacity: { refersto: 'fog_opacity', permissionsreq: 'any', dataval: (d) => d },
        force_lighting_refresh: { refersto: 'force_lighting_refresh', permissionsreq: 'any', dataval: (d) => d },
        gridcolor: { refersto: 'gridcolor', permissionsreq: 'any', dataval: (d) => d },
        grid_color: { refersto: 'gridcolor', permissionsreq: 'any', dataval: (d) => d },
        grid_labels: { refersto: 'gridlabels', permissionsreq: 'any', dataval: (d) => d },
        gridlabels: { refersto: 'gridlabels', permissionsreq: 'any', dataval: (d) => d },
        gridopacity: { refersto: 'grid_opacity', permissionsreq: 'any', dataval: (d) => d },
        grid_opacity: { refersto: 'grid_opacity', permissionsreq: 'any', dataval: (d) => d },
        gridtype: { refersto: 'grid_type', permissionsreq: 'any', dataval: (d) => d },
        grid_type: { refersto: 'grid_type', permissionsreq: 'any', dataval: (d) => d },
        height: { refersto: 'height', permissionsreq: 'any', dataval: (d) => d },
        jukeboxtrigger: { refersto: 'jukeboxtrigger', permissionsreq: 'any', dataval: (d) => d },
        jukebox_trigger: { refersto: 'jukeboxtrigger', permissionsreq: 'any', dataval: (d) => d },
        lightupdatedrop: { refersto: 'lightupdatedrop', permissionsreq: 'any', dataval: (d) => d },
        lightenforcelos: { refersto: 'lightenforcelos', permissionsreq: 'any', dataval: (d) => d },
        lightrestrictmove: { refersto: 'lightrestrictmove', permissionsreq: 'any', dataval: (d) => d },
        lightglobalillum: { refersto: 'lightglobalillum', permissionsreq: 'any', dataval: (d) => d },
        scale_number: { refersto: 'scale_number', permissionsreq: 'any', dataval: (d) => d },
        scale_units: { refersto: 'scale_units', permissionsreq: 'any', dataval: (d) => d },
        showdarkness: { refersto: 'showdarkness', permissionsreq: 'any', dataval: (d) => d },
        show_darkness: { refersto: 'showdarkness', permissionsreq: 'any', dataval: (d) => d },
        showgrid: { refersto: 'showgrid', permissionsreq: 'any', dataval: (d) => d },
        show_grid: { refersto: 'showgrid', permissionsreq: 'any', dataval: (d) => d },
        showlighting: { refersto: 'showlighting', permissionsreq: 'any', dataval: (d) => d },
        show_lighting: { refersto: 'showlighting', permissionsreq: 'any', dataval: (d) => d },
        snapping_increment: { refersto: 'snapping_increment', permissionsreq: 'any', dataval: (d) => d },
        width: { refersto: 'width', permissionsreq: 'any', dataval: (d) => d },
        zorder: { refersto: '_zorder', permissionsreq: 'any', dataval: (d) => d }
    };
    const campaignProps = { // @(campaign.prop)
        campaign_id: { refersto: '_id', permissionsreq: 'any', dataval: (d) => d },
        campaign_type: { refersto: '_type', permissionsreq: 'any', dataval: (d) => d },
        id: { refersto: '_id', permissionsreq: 'any', dataval: (d) => d },
        type: { refersto: '_type', permissionsreq: 'any', dataval: (d) => d },
        turnorder: { refersto: 'turnorder', permissionsreq: 'any', dataval: (d) => d },
        initiativepage: { refersto: 'initiativepage', permissionsreq: 'any', dataval: (d) => d },
        pageid: { refersto: 'playerpageid', permissionsreq: 'any', dataval: (d) => d },
        page_id: { refersto: 'playerpageid', permissionsreq: 'any', dataval: (d) => d },
        playerpageid: { refersto: 'playerpageid', permissionsreq: 'any', dataval: (d) => d },
        playerpage_id: { refersto: 'playerpageid', permissionsreq: 'any', dataval: (d) => d },
        pagename: { refersto: 'playerpageid', permissionsreq: 'any', dataval: (d) => getObjName(d, 'page') },
        page_name: { refersto: 'playerpageid', permissionsreq: 'any', dataval: (d) => getObjName(d, 'page') },
        playerpagename: { refersto: 'playerpageid', permissionsreq: 'any', dataval: (d) => getObjName(d, 'page') },
        playerpage_name: { refersto: 'playerpageid', permissionsreq: 'any', dataval: (d) => getObjName(d, 'page') },
        playerspecificpages: { refersto: 'playerspecificpages', permissionsreq: 'any', dataval: (d) => Object.keys(d).map(k => `${k}:${d[k]}`).join(',') },
        playerspecificpagesname: { refersto: 'playerspecificpages', permissionsreq: 'any', dataval: (d) => Object.keys(d).map(k => `${getObjName(k, 'player')}:${getObjName(d[k], 'page')}`).join(',') },
        playerspecificpages_name: { refersto: 'playerspecificpages', permissionsreq: 'any', dataval: (d) => Object.keys(d).map(k => `${getObjName(k, 'player')}:${getObjName(d[k], 'page')}`).join(',') },
        currentpages: { refersto: 'currentpages', permissionsreq: 'any', dataval: (d) => d },
        currentpagesname: { refersto: 'currentpagesname', permissionsreq: 'any', dataval: (d) => d },
        journalfolder: { refersto: '_journalfolder', permissionsreq: 'any', dataval: (d) => d },
        jukeboxfolder: { refersto: '_jukeboxfolder', permissionsreq: 'any', dataval: (d) => d },
        jukeboxplaylistplaying: { refersto: '_jukeboxplaylistplaying', permissionsreq: 'any', dataval: (d) => d },
        token_markers: { refersto: '_token_markers', permissionsreq: 'any', dataval: (d) => d },
        markers: { refersto: '_token_markers', permissionsreq: 'any', dataval: (d) => d }
    };
    const markerProps = { // derived from the Campaign object
        marker_id: { refersto: 'tag', permissionsreq: 'any', dataval: (d) => d },
        marker_name: { refersto: 'name', permissionsreq: 'any', dataval: (d) => d },
        tag: { refersto: 'tag', permissionsreq: 'any', dataval: (d) => d },
        url: { refersto: 'url', permissionsreq: 'any', dataval: (d) => d },
        html: { refersto: 'html', permissionsreq: 'any', dataval: (d) => d }
    };
    const statusProps = { // derived from a Token object
        status_id: { refersto: 'tag', permissionsreq: 'any', dataval: (d) => d },
        status_name: { refersto: 'name', permissionsreq: 'any', dataval: (d) => d },
        num: { refersto: 'num', permissionsreq: 'any', dataval: (d) => d },
        number: { refersto: 'num', permissionsreq: 'any', dataval: (d) => d },
        value: { refersto: 'num', permissionsreq: 'any', dataval: (d) => d },
        val: { refersto: 'num', permissionsreq: 'any', dataval: (d) => d },
        html: { refersto: 'html', permissionsreq: 'any', dataval: (d) => d },
        tag: { refersto: 'tag', permissionsreq: 'any', dataval: (d) => d },
        url: { refersto: 'url', permissionsreq: 'any', dataval: (d) => d },
        is: { refersto: 'is', permissionsreq: 'any', dataval: (d) => d },
        count: { refersto: 'count', permissionsreq: 'any', dataval: (d) => d }
    };
    const textProps = {
        id: { refersto: '_id', permissionsreq: 'any', dataval: (d) => d },
        type: { refersto: '_type', permissionsreq: 'any', dataval: (d) => d },
        color: { refersto: 'color', permissionsreq: 'any', dataval: (d) => d },
        cby: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => d },
        controlledby: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => d },
        cby_names: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        controlledby_names: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        cby_name: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        controlledby_name: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        font_family: { refersto: 'font_family', permissionsreq: 'any', dataval: (d) => d },
        font_size: { refersto: 'font_size', permissionsreq: 'any', dataval: (d) => d },
        height: { refersto: 'height', permissionsreq: 'any', dataval: (d) => d },
        layer: { refersto: 'layer', permissionsreq: 'gm', dataval: (d) => d },
        left: { refersto: 'left', permissionsreq: 'any', dataval: (d) => d },
        page_id: { refersto: '_pageid', permissionsreq: 'any', dataval: (d) => d },
        pageid: { refersto: '_pageid', permissionsreq: 'any', dataval: (d) => d },
        pid: { refersto: '_pageid', permissionsreq: 'any', dataval: (d) => d },
        page: { refersto: '_pageid', permissionsreq: 'any', dataval: d => getObjName(d, 'page') },
        page_name: { refersto: '_pageid', permissionsreq: 'any', dataval: d => getObjName(d, 'page') },
        player: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => d.split(/\s*,\s*/).filter(a => a.toLowerCase() !== 'all' && getObj('player', a))[0] },
        player_name: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d, s) => getControlledByList(s, d).split(/\s*,\s*/).filter(a => a.toLowerCase() !== 'all').map(a => getObjName(a, 'player')).filter(a => a)[0] },
        rotation: { refersto: 'rotation', permissionsreq: 'any', dataval: (d) => d },
        text: { refersto: 'text', permissionsreq: 'any', dataval: (d) => d },
        top: { refersto: 'top', permissionsreq: 'any', dataval: (d) => d },
        width: { refersto: 'width', permissionsreq: 'any', dataval: (d) => d }
    };
    const pathProps = {
        id: { refersto: '_id', permissionsreq: 'any', dataval: (d) => d },
        type: { refersto: '_type', permissionsreq: 'any', dataval: (d) => d },
        cby: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d, s) => getControlledByList(s, d) },
        controlledby: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d, s) => getControlledByList(s, d) },
        cby_names: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        controlledby_names: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        cby_name: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        controlledby_name: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => getObjName(d, 'playerlist') },
        fill: { refersto: 'fill', permissionsreq: 'any', dataval: (d) => d },
        height: { refersto: 'height', permissionsreq: 'any', dataval: (d) => d },
        layer: { refersto: 'layer', permissionsreq: 'gm', dataval: (d) => d },
        left: { refersto: 'left', permissionsreq: 'any', dataval: (d) => d },
        page_id: { refersto: '_pageid', permissionsreq: 'any', dataval: (d) => d },
        pageid: { refersto: '_pageid', permissionsreq: 'any', dataval: (d) => d },
        pid: { refersto: '_pageid', permissionsreq: 'any', dataval: (d) => d },
        page: { refersto: '_pageid', permissionsreq: 'any', dataval: d => getObjName(d, 'page') },
        page_name: { refersto: '_pageid', permissionsreq: 'any', dataval: d => getObjName(d, 'page') },
        path: { refersto: 'path', permissionsreq: 'any', dataval: (d) => d },
        player: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d) => d.split(/\s*,\s*/).filter(a => a.toLowerCase() !== 'all' && getObj('player', a))[0] },
        player_name: { refersto: 'controlledby', permissionsreq: 'any', dataval: (d, s) => getControlledByList(s, d).split(/\s*,\s*/).filter(a => a.toLowerCase() !== 'all').map(a => getObjName(a, 'player')).filter(a => a)[0] },
        rotation: { refersto: 'rotation', permissionsreq: 'any', dataval: (d) => d },
        scalex: { refersto: 'scaleX', permissionsreq: 'any', dataval: (d) => d },
        scaley: { refersto: 'scaleY', permissionsreq: 'any', dataval: (d) => d },
        stroke: { refersto: 'stroke', permissionsreq: 'any', dataval: (d) => d },
        stroke_width: { refersto: 'stroke_width', permissionsreq: 'any', dataval: (d) => d },
        top: { refersto: 'top', permissionsreq: 'any', dataval: (d) => d },
        width: { refersto: 'width', permissionsreq: 'any', dataval: (d) => d }
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

    const trackerrx = /^tracker(\[(?<filter>[^\]]+)]){0,1}((?<operator>\+|-)(?<offset>\d+)){0,1}$/i;
    const rptgitemrx = /(?<type>(?:\*))\((?<character>[^|.]+?)[|.](?<section>[^\s.|]+?)[|.](?:\[\s*(?<pattern>.+?)\s*]|(?<reference>\$\d+|[a-zA-Z0-9_-]{20}))\s*[|.](?<valuesuffix>[^[\s).]+?)(?:[|.](?<valtype>[^\s.[)]+?)){0,1}(?:\[(?<default>[^\]]*?)]){0,1}\s*\)/gi;
    //const rptgitemrx = /(?<type>(?:\*))\((?<character>[^|.]+?)[|.](?<section>[^\s.|]+?)[|.]\[\s*(?<pattern>.+?)\s*]\s*[|.](?<valuesuffix>[^[\s).]+?)(?:[|.](?<valtype>[^\s.[)]+?)){0,1}(?:\[(?<default>[^\]]*?)]){0,1}\s*\)/gi;
    const macrorx = /#\((?<item>[^\s.[)]+?)(?:\[(?<default>[^\]]*?)]){0,1}\s*\)/gi;
    const multirx = /(?<type>(?:@|%))\((?<obj>tracker(?:\[[^\]]+]){0,1}(?:(?:\+|-)\d+){0,1}|[^@*%#|.]+?)[|.](?<prop>[^@*%#\s.[|]+?)(?:[|.](?<identikey>[^@*%#.|[]+?)(?:[|.](?<subprop>[^[@*%#]+?)){0,1}){0,1}(?:\[(?<default>[^@*%#\]]*?)]){0,1}\s*\)/gi;

    const testConstructs = c => {
        return [multirx, rptgitemrx, macrorx].reduce((m, r) => {
            m = m || r.test(c);
            r.lastIndex = 0;
            return m;
        }, false);
    };
    const simpleObj = (o) => {
        if (typeof o === 'undefined') { return o; }
        let obj = JSON.parse(JSON.stringify(o));
        if (!Object.keys(obj).length) { return obj; }
        return Object.keys(obj).reduce((m, k) => {
            if (/^_/.test(k) && !m.hasOwnProperty(k.slice(1))) { m[k.slice(1)] = m[k]; }
            return m;
        }, obj);
    };

    const handleInput = (msg, msgstate = {}) => {
        let funcret = { runloop: false, status: 'unchanged', notes: '' };
        if (msg.type !== 'api' || !testConstructs(msg.content)) return funcret;
        if (!Object.keys(msgstate).length && scriptisplugin) return funcret;
        let status = [];
        let notes = [];
        let msgId = generateUUID();

        const filterObj = {
            'page': (t) => t._pageid === getPageForPlayer(msg.playerid),
            'ribbon': (t) => t._pageid === Campaign().get('playerpageid'),
            'gm': () => true
        };
        const propContainers = {
            token: tokenProps,
            character: charProps,
            page: pageProps,
            campaign: campaignProps,
            marker: markerProps,
            player: playerProps,
            status: statusProps,
            text: textProps,
            path: pathProps
        };
        const getPropertyValue = (source, objtype, item, def = '') => {
            let propObj = propContainers[objtype.toLowerCase()];
            let retval = def;
            if (!source) {
                notes.push(`Unable to find a source for property named ${item}. Using default value.`);
            } else if (!Object.keys(propObj).includes(item.toLowerCase())) {
                notes.push(`Unable to find a ${objtype.toLowerCase()} property named ${item}. Using default value.`);
            } else {
                retval = propObj[item.toLowerCase()].dataval(source[propObj[item.toLowerCase()].refersto],source);
                if (typeof retval === 'undefined') {
                    notes.push(`Unable to find ${objtype.toLowerCase()} value for ${item}. Using default value.`);
                    retval = def;
                }
            }
            return retval;
        };
        const getCharacterAttribute = (source, type, prop, valtype, def = '') => {
            let retval = def;
            if (!source) {
                notes.push(`Unable to find a character with the given criteria. Using default value.`);
            } else {
                retval = getSheetItemVal({ groups: { type: type, character: source.id, item: prop, valtype: valtype } }, msg.playerid, source);
                if (typeof retval === 'undefined') {
                    notes.push(`Unable to find ${type === '@' ? 'attribute' : 'ability'} named ${prop} for ${source.name}. Using default value.`);
                    retval = def;
                }
            }
            return retval;
        };
        while (testConstructs(msg.content)) {
            msg.content = msg.content.replace(multirx, (m, type, obj, prop, identikey, subprop, def = '') => {
                let offset = 0,
                    trackres,
                    pgfilter = 'page',
                    selsource,
                    presource,
                    source,
                    retval = def,
                    reverse = false,
                    to;
                if (trackerrx.test(obj)) { // if it is a tracker call, it could have an offset, so we detect that first
                    trackres = trackerrx.exec(obj);
                    offset = parseInt(trackres.groups.offset || '0');
                    if (trackres.groups.operator === '-') reverse = true;
                    if (playerIsGM(msg.playerid)) pgfilter = trackres.groups.filter || 'page';
                    obj = `tracker`;
                    trackres.lastIndex = 0;
                }
                if (obj.toLowerCase() === 'speaker') { // if it's a speaker call, determine if player or character, and adjust appropriately
                    presource = simpleObj(getChar(msg.who, msg.playerid));
                    if (presource && presource.name) {
                        obj = presource.name;
                    } else {
                        presource = simpleObj(getPlayer(msg.who));
                        if (presource && presource._displayname) {
                            obj = 'player';
                            subprop = identikey;
                            identikey = prop;
                            prop = presource._displayname;
                        } else {
                            notes.push(`Unable to find the speaker`);
                        }
                    }
                }
                switch (obj.toLowerCase()) {
                    case 'player':
                        source = getPlayer(prop);
                        retval = getPropertyValue(source, obj, identikey, def);
                        break;
                    case 'page':
                        source = simpleObj(getPage(prop));
                        retval = getPropertyValue(source, obj, identikey, def);
                        break;
                    case 'marker':
                        source = simpleObj(getMarker(prop));
                        retval = getPropertyValue(source, obj, (identikey || 'html'), def);
                        break;
                    case 'campaign':
                        source = getCampaign();
                        retval = getPropertyValue(source, obj, prop, def);
                        break;
                    case 'selected':
                        if (!msg.selected) { // selected but no token => default
                            notes.push(`No token selected for ${m}. Using default value.`);
                            retval = def;
                        } else {
                            selsource = simpleObj(findObjs({ id: msg.selected[0]._id })[0]);
                            if (['text', 'path'].includes(selsource.type)) { // text objects and paths
                                retval = getPropertyValue(selsource, selsource.type, prop, def);
                            } else { // graphics/tokens/cards
                                if (Object.keys(tokenProps).includes(prop.toLowerCase())) { // selected with token prop
                                    source = simpleObj(getToken(msg.selected[0]._id));
                                    retval = getPropertyValue(source, 'token', prop, def);
                                } else if (prop.toLowerCase() === 'status') { // selected with status
                                    if (identikey &&
                                        getMarker(/(?<marker>.+?)(?:\?(?<index>\d+|all\+?))?$/.exec(identikey.toLowerCase())[1]).name &&
                                        Object.keys(statusProps).includes((subprop || 'value').toLowerCase())) {
                                        presource = simpleObj(getToken(msg.selected[0]._id));
                                        if (presource && !presource.hasOwnProperty('id')) presource.id = presource._id;
                                        if (!tokenStatuses.hasOwnProperty(presource.id) || tokenStatuses[presource.id].msgId !== msgId) {// eslint-disable-line no-prototype-builtins
                                            tokenStatuses[presource.id] = new StatusBlock({ token: presource, msgId: msgId });
                                        }
                                        source = getStatus(msg.selected[0]._id, identikey, msgId);
                                        retval = getPropertyValue(source, prop, (subprop || 'value'), def);
                                    }
                                } else { // selected with character prop/attribute/ability
                                    source = simpleObj(getChar(msg.selected[0]._id, msg.playerid));
                                    if (Object.keys(charProps).includes(prop.toLowerCase())) { // selected + character prop
                                        retval = getPropertyValue(simpleObj(source), 'character', prop, def);
                                    } else { // selected + character attribute or ability
                                        retval = getCharacterAttribute(source, type, prop, identikey, def);
                                    }
                                }
                            }
                        }

                        break;
                    case 'tracker':
                        to = JSON.parse(Campaign().get('turnorder') || '[]').filter(filterObj[pgfilter] || filterObj['page']);
                        if (!to.length || to[0].id === '-1') {
                            notes.push(`No tracker token for ${m}. Using default value.`);
                            retval = def;
                        } else {
                            presource = to[(reverse ? to.length - (offset % to.length) : offset % to.length) % to.length];
                            if (Object.keys(tokenProps).includes(prop.toLowerCase())) {                   // tracker + token property
                                source = simpleObj(getToken(presource.id, presource._pageid));
                                retval = getPropertyValue(source, 'token', prop, def);
                            } else if (prop.toLowerCase() === 'status') { // tracker with status
                                if (identikey &&
                                    getMarker(/(?<marker>.+?)(?:\?(?<index>\d+|all\+?))?$/.exec(identikey.toLowerCase())[1]).name &&
                                    Object.keys(statusProps).includes((subprop || 'value').toLowerCase())) {
                                    presource = simpleObj(getToken(presource.id, presource._pageid));
                                    if (presource && !presource.hasOwnProperty('id')) presource.id = presource._id; 
                                    if (!tokenStatuses.hasOwnProperty(presource.id) || tokenStatuses[presource.id].msgId !== msgId) { 
                                        tokenStatuses[presource.id] = new StatusBlock({ token: presource, msgId: msgId });
                                    }
                                    source = getStatus(presource.id, identikey, msgId);
                                    retval = getPropertyValue(source, prop, (subprop || 'value'), def);
                                }
                            } else {                                                        // tracker with character prop/attribute/ability
                                source = simpleObj(getChar(presource.id, msg.playerid));
                                if (Object.keys(charProps).includes(prop.toLowerCase())) {  // tracker + character prop
                                    retval = getPropertyValue(simpleObj(source), 'character', prop, def);
                                } else {  //tracker + character attribute/ability
                                    retval = getCharacterAttribute(source, type, prop, identikey, def);
                                }
                            }
                        }
                        break;
                    default: // all others -- could be token name, token id, character name, or character id
                        selsource = simpleObj(findObjs({ id: obj })[0] || {});
                        if (selsource.type && ['text', 'path'].includes(selsource.type)) { // text objects and paths
                            retval = getPropertyValue(selsource, 'text', prop, def);
                        } else { // graphics/tokens/cards
                            if (Object.keys(tokenProps).includes(prop.toLowerCase())) {        // token property
                                source = simpleObj(getToken(obj, getPageID(msg.playerid)));
                                retval = getPropertyValue(source, 'token', prop, def);
                            } else if (prop.toLowerCase() === 'status') { // status
                                if (identikey &&
                                    getMarker(/(?<marker>.+?)(?:\?(?<index>\d+|all\+?))?$/.exec(identikey.toLowerCase())[1]).name &&
                                    Object.keys(statusProps).includes((subprop || 'value').toLowerCase())) {
                                    presource = simpleObj(getToken(obj));
                                    if (presource && !presource.hasOwnProperty('id')) presource.id = presource._id;
                                    if (!tokenStatuses.hasOwnProperty(presource.id) || tokenStatuses[presource.id].msgId !== msgId) {
                                        tokenStatuses[presource.id] = new StatusBlock({ token: presource, msgId: msgId });
                                    }
                                    source = getStatus(obj, identikey, msgId);
                                    retval = getPropertyValue(source, prop, (subprop || 'value'), def);
                                }
                            } else { // character property or attribute or ability
                                source = simpleObj(getChar(obj, msg.playerid) || getChar((simpleObj(getToken(obj, getPageID(msg.playerid))) || {}).represents, msg.playerid));
                                if (Object.keys(charProps).includes(prop.toLowerCase())) { // character property
                                    retval = getPropertyValue(simpleObj(source), 'character', prop, def);
                                } else {                                                  // character attribute/ability
                                    retval = getCharacterAttribute(source, type, prop, identikey, def);
                                }
                            }
                        }
                        break;
                }
                status.push('changed');
                return retval;
            });

            // REPEATING SHEET ITEMS
            msg.content = msg.content.replace(rptgitemrx, (m, type, obj, section, pattern, reference, valuesuffix, valtype, def = '') => {
                let bsel = false;
                let offset = 0,
                    trackres,
                    pgfilter = 'page',
                    presource,
                    source,
                    retval,
                    reverse = false,
                    to;
                if (trackerrx.test(obj)) { // if it is a tracker call, it could have an offset, so we detect that first
                    trackres = trackerrx.exec(obj);
                    offset = parseInt(trackres.groups.offset || '0');
                    if (trackres.groups.operator === '-') reverse = true;
                    if (playerIsGM(msg.playerid)) pgfilter = trackres.groups.filter || 'page';
                    obj = `tracker`;
                    trackres.lastIndex = 0;
                }
                switch (obj.toLowerCase()) {
                    case 'selected':
                        if (!msg.selected) {
                            notes.push(`No token selected for ${m}. Using default value.`);
                            bsel = true;
                            retval = def;
                        } else {
                            source = getChar(msg.selected[0]._id, msg.playerid);
                        }
                        break;
                    case 'speaker':
                        source = getChar(msg.who, msg.playerid);
                        break;
                    case 'tracker':
                        to = JSON.parse(Campaign().get('turnorder') || '[]').filter(filterObj[pgfilter] || filterObj['page']);
                        if (!to.length || to[0].id === '-1') {
                            notes.push(`No tracker token for ${m}. Using default value.`);
                            retval = def;
                        } else {
                            presource = to[(reverse ? to.length - (offset % to.length) : offset % to.length) % to.length];
                            if (presource && !presource.hasOwnProperty('id')) presource.id = presource._id; 
                            source = simpleObj(getChar(presource.id, msg.playerid));
                        }
                        break;
                    default:
                        source = getChar(obj, msg.playerid);
                }

                if (!source) {
                    if (!bsel) notes.push(`Unable to find character for ${m}. Using default value.`); //track note only if we haven't already tracked no selected
                    retval = def;
                } else {
                    retval = getSheetItemVal({ groups: { type: type, character: source.id, section: section, pattern: pattern, reference: reference, valuesuffix: valuesuffix, valtype: valtype } }, msg.playerid, source);
                    if (typeof retval === 'undefined') {
                        notes.push(`Unable to find repeating item for ${m}. Using default value.`);
                        retval = def;
                    }
                }
                if (retval) status.push('changed');
                return retval;
            });

            // MACROS
            msg.content = msg.content.replace(macrorx, (m, item, def = '') => {
                let retval = def;
                let locobj = findObjs({ type: 'macro', name: item })[0];
                const validator = e => ['all', msg.playerid].includes(e);
                if (!locobj || !(msg.playerid === locobj.get('_playerid') || locobj.get('visibleto').split(',').some(validator))) {
                    status.push('unresolved');
                    notes.push(`Unable to find macro named ${item}. Using default value.`);
                    return retval;
                }
                retval = locobj.get('action') || '';
                status.push('changed');
                return retval;
            });
        }
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
    const fetch = (m, s) => handleInput(m, s);
    on('chat:message', handleInput);
    on('ready', () => {
        versionInfo();
        logsig();

        let reqs = [
            {
                name: 'checkLightLevel',
//                version: `1.0.0.b3`,
                mod: typeof checkLightLevel !== 'undefined' ? checkLightLevel : undefined,
                checks: [['isLitBy', 'function']],
                optional: true
            },
            {
                name: 'libTokenMarkers',
                version: `0.1.2`,
                mod: typeof libTokenMarkers !== 'undefined' ? libTokenMarkers : undefined,
                checks: [['getStatus', 'function'], ['getStatuses', 'function'], ['getOrderedList', 'function']]
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
            ZeroFrame.RegisterMetaOp(fetch);
        }
    });
    return {
    };
})();
{ try { throw new Error(''); } catch (e) { API_Meta.Fetch.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.Fetch.offset); } }
/* */
