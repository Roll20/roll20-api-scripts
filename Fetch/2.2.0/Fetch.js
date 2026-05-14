/*
=========================================================
Name            :   Fetch
GitHub          :   https://github.com/TimRohr22/Cauldron/tree/master/Fetch
Roll20 Contact  :   timmaugh
Version         :   2.2.0
Last Update	    :   12 MAY 2026
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.Fetch = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.Fetch.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (12)); } }

const Fetch = (() => { //eslint-disable-line no-unused-vars
    const apiproject = 'Fetch';
    const version = '2.2.0';
    const apilogo = 'https://i.imgur.com/jeIkjvS.png';
    const apilogoalt = 'https://i.imgur.com/boYO3cf.png';
    const schemaVersion = 0.2;
    API_Meta[apiproject].version = version;
    const vd = new Date(1770641544905);
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
    const simpleObj = (o) => {
        if (typeof o === 'undefined') { return o; }
        let obj = JSON.parse(JSON.stringify(o));
        if (!Object.keys(obj).length) { return obj; }
        return Object.keys(obj).reduce((m, k) => {
            if (/^_/.test(k) && !m.hasOwnProperty(k.slice(1))) { m[k.slice(1)] = m[k]; }
            return m;
        }, obj);
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
            'padding-left': '4px',
            'font-weight': 'bold'
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
        },
        tblOddRow: {
            'background-color': '#d3d3d3'
        },
        button: {
            'background-color': '#3c3c3c',
            'color': '#ededed',
            'border-radius': '5px',
            'border-width': '0px',
            'margin': '0px 2px',
            'line-height': '12px',
            'font-size': '12px',
            'text-align': 'center',
            'width': '54px',
            'height': '12px',
            'vertical-align': 'middle',
            'text-decoration': 'none'
        },
        textright: {
            'text-align': 'right'
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

    // ==================================================
    //		PROCESS
    // ==================================================
    class StatusBlock {
        constructor({ token: token = {}, msgId: msgId = generateUUID() } = {}) {
            this.token = token;
            this.msgId = msgId;
            this.statuses = (decomposeStatuses(token.statusmarkers) || []).reduce((m, s) => {
                m[s.name] = m[s.name] || [];
                m[s.name].push(Object.assign({}, s, { is: 'yes' }));
                let shortTag = s.tag.split(/::/)[0];
                if (shortTag !== s.name) {
                    m[shortTag] = m[shortTag] || [];
                    m[shortTag].push(Object.assign({}, s, { is: 'yes' }));
                }
                return m;
            }, {});
        }
    }
    class nullObj {
        constructor() {
            this.get = function () { return undefined; }
        }
    }
    class AggAttr {
        constructor() {
            this.get = function (r) { return this[r]; }
        }
    }

    const tokenStatuses = {};

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
    const decomposeStatuses = (list = '') => {
        return list.split(/\s*,\s*/g).filter(s => s.length)
            .reduce((m, s) => {
                let origst = libTokenMarkers.getStatus(s.slice(0, /(@\d+$|:)/.test(s) ? /(@\d+$|:)/.exec(s).index : s.length));
                let st = _.clone(origst);
                if (!st) return m;
                st.type = 'marker';
                st.num = /^.+@0*(\d+)/.test(s) ? /^.+@0*(\d+)/.exec(s)[1] : '';
                st.html = origst.getHTML();
                st.url = st.url || '';
                m.push(st);
                return m;
            }, []);
    };
    const isMarker = prop => (getMarker({ query: /(?<marker>.+?)(?:\?(?<index>\d+|all\+?))?$/.exec(prop)[1] }) || {}).hasOwnProperty('name');
    const getFirstGM = () => simpleObj(findObjs({ type: 'player' }).filter(p => playerIsGM(p.id))[0]);

    // ===== DATA RETRIEVAL =============================
    const getSheetItem = (searchObj, notes) => {
        const itemTypeLib = {
            '@': 'attribute',
            '*': 'attribute',
            '%': 'ability'
        };
        const internalTestLib = {
            'int': (v) => +v === +v && parseInt(parseFloat(v, 10), 10) == v,
            'num': (v) => +v === +v,
            'tru': (v) => v == true
        };
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

        let c = searchObj.source; // || getChar({ query: res.groups.character, msg: searchObj.msg });
        // if (!c) return;

        // standard sheet items
        if (['@', '%'].includes(searchObj.symbol)) {
            return findObjs({ type: itemTypeLib[searchObj.symbol], characterid: c.id })
                .filter(a => a.get('name') === searchObj.item)[0];
        }

        // if we're still here, we're looking for a repeating item
        if (searchObj.symbol === '*') {
            let rowid;
            let entries = repeatingOrdinal(c.id, searchObj.section);
            let retrieve = 'current';

            if (searchObj.pattern && searchObj.pattern.length) {
                let p = parsePattern(searchObj.pattern);
                if (!p.tokens.length) {
                    notes.push(p.error || 'No pattern detected for repeating sheet item.');
                    return;
                }

                p.tests = [];
                let reprx = new RegExp(`^repeating_${searchObj.section}_(?<repID>[^_]*?)_(?<suffix>.+)$`);
                let repres;
                let o = findObjs({ type: itemTypeLib[searchObj.symbol], characterid: c.id })
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
                    notes.push(`EXITING: TEST COUNTS DON'T MATCH`);
                    return;
                }
                viable = p.tests.reduce((m, v) => m.filter(repID => v.includes(repID)));
                if (viable.length) {
                    let retObj = findObjs({ type: itemTypeLib[searchObj.symbol], characterid: c.id })
                        .filter(a => a.get('name') === `repeating_${searchObj.section}_${viable[0]}_${searchObj.valuesuffix}`)[0];
                    return retObj;
                }
            } else if (searchObj.reference && searchObj.reference.length) {
                if (/\$\d+/.test(searchObj.reference) ||
                    /\$[nN]/.test(searchObj.reference) ||
                    /1[dD][wW](?:[eE][iI][gG][hH][tT])?(?:\?(?<weightattr>.+?))?/.test(searchObj.reference)) {

                    if (/\$\d+/.test(searchObj.reference)) {
                        rowid = entries[/\$(\d+)/.exec(searchObj.reference)[1]];
                    } else if (/\$[nN]/.test(searchObj.reference)) {
                        rowid = entries[entries.length - 1];
                    } else if (/1[dD][wW](?:[eE][iI][gG][hH][tT])?(?:\?(?<weightattr>.+))?/.test(searchObj.reference)) {
                        let weightAttr = /1[dD][wW](?:[eE][iI][gG][hH][tT])?(?:\?(?<weightattr>.+))?/.exec(searchObj.reference).groups.weightattr;
                        retrieve = 'current';
                        if (weightAttr && /\?/i.test(weightAttr)) {
                            let weightedParts = /([^\?]*)\?(.*)$/.exec(weightAttr);
                            retrieve = weightedParts[2] && weightedParts[2].toLowerCase() === 'max' ? 'max' : 'current';
                            weightAttr = weightedParts[1];
                        }
                        let weightrx = new RegExp(`^repeating_${escapeRegExp(searchObj.section || '')}_[^_]+_${escapeRegExp(weightAttr || '')}$`);
                        if (weightAttr && !findObjs({ type: itemTypeLib[searchObj.symbol], characterid: c.id })
                            .filter(a => weightrx.test(a.get('name'))).length) {
                            notes.push(`Weight attribute provided doesn't exist on this repeating list.`);
                        } else if (weightAttr) {
                            entries = entries.map(e => {
                                let objWeightAttr = (findObjs({ type: itemTypeLib[searchObj.symbol], characterid: c.id })
                                    .filter(a => a.get('name') === `repeating_${searchObj.section}_${e}_${weightAttr}`)[0] ||
                                    { get: () => '0' });

                                return {
                                    rowid: e,
                                    weight: Math.max(0, parseInt(objWeightAttr.get(retrieve)) || 0)
                                }
                            }).reduce((m, v) => {
                                m = [...m, ...new Array(v.weight).fill().map(e => v.rowid)];
                                return m;
                            }, []);
                        }
                        rowid = entries[randomInteger(entries.length) - 1];
                    }
                } else {
                    rowid = searchObj.reference;
                }
                return rowid
                    ? findObjs({ type: itemTypeLib[searchObj.symbol], characterid: c.id })
                        .filter(a => a.get('name') === `repeating_${searchObj.section}_${rowid}_${searchObj.valuesuffix}`)[0]
                    : rowid;
            } else if (searchObj.aggregate && searchObj.aggregate.length) {
                let aggParts = searchObj.aggregate.split('?');
                let aggAttrs;
                let aggrx;
                let initialAttr;
                let tgtName = '';
                let delim = ',';
                let data = '';

                switch (aggParts[0].toLowerCase()) {
                    case 'avg':
                        aggrx = new RegExp(`^repeating_${searchObj.section}_(${entries.join('|')})_${searchObj.valuesuffix}$`);
                        aggAttrs = findObjs({ type: 'attribute', characterid: c.id })
                            .filter(a => aggrx.test(a.get('name')));

                        return aggAttrs.reduce((m, a, i, attrs) => {
                            m.current = (m.current || 0) + parseInt(a.get('current') || 0);
                            m.max = (m.max || 0) + parseInt(a.get('max') || 0);
                            if (i === attrs.length - 1) {
                                m.current = parseInt((m.current / i) * 100) / 100;
                                m.max = parseInt((m.max / i) * 100) / 100;
                            }
                            return m;
                        }, new AggAttr());
                    // break;
                    case 'sum':
                        aggrx = new RegExp(`^repeating_${searchObj.section}_(${entries.join('|')})_${searchObj.valuesuffix}$`);
                        aggAttrs = findObjs({ type: 'attribute', characterid: c.id })
                            .filter(a => aggrx.test(a.get('name')));

                        return aggAttrs.reduce((m, a, i, attrs) => {
                            m.current = (m.current || 0) + parseInt(a.get('current') || 0);
                            m.max = (m.max || 0) + parseInt(a.get('max') || 0);
                            return m;
                        }, new AggAttr());
                    // break;
                    case 'min':
                    case 'max':
                        if (aggParts.length === 1) { return; } // no attr provided to aggregate on
                        aggrx = new RegExp(`^repeating_${searchObj.section}_(${entries.join('|')})_${aggParts[1]}$`);
                        aggAttrs = findObjs({ type: 'attribute', characterid: c.id })
                            .filter(a => aggrx.test(a.get('name')));
                        if (!aggAttrs.length) { return; }
                        retrieve = aggParts.length === 3 && aggParts[2].toLowerCase() === 'max' ? 'max' : 'current';
                        initialAttr = aggAttrs.reduce((m, a, i, attrs) => {
                            return (
                                (aggParts[0].toLowerCase() === 'min' && parseFloat(m.get(retrieve)) <= parseFloat(a.get(retrieve)))
                                || (aggParts[0].toLowerCase() === 'max' && parseFloat(m.get(retrieve)) >= parseFloat(a.get(retrieve)))
                            )
                                ? m
                                : a;
                        });

                        tgtName = initialAttr.get('name').replace(/^(repeating_[^_]+_[^_]+_).+$/i, (m, g1) => `${g1}${searchObj.valuesuffix}`);
                        return findObjs({ type: 'attribute', characterid: c.id })
                            .filter(a => a.get('name') === tgtName)[0];
                    // break;
                    case 'vals':
                    case 'uniq':
                    case 'ids':
                        // *(char.list.vals?delim.subAttr.max)
                        // *(char.list.uniq?delim.subAttr.max)
                        // *(char.list.ids?delim.subAttr.max)
                        if (aggParts.length > 1) {
                            delim = aggParts[1];
                        }
                        aggrx = new RegExp(`^repeating_${searchObj.section}_(${entries.join('|')})_${searchObj.valuesuffix}$`);
                        aggAttrs = findObjs({ type: 'attribute', characterid: c.id })
                            .filter(a => aggrx.test(a.get('name')));
                        initialAttr = new AggAttr();
                        data = aggParts[0].toLowerCase() === 'ids'
                            ? aggAttrs.map(a => a.id)
                            : aggAttrs.map(a => `${a.get(searchObj.valtype || 'current')}`);

                        if (aggParts[0].toLowerCase() === 'uniq') { data = [...new Set(data)]; }
                        initialAttr.current = data.join(delim);
                        return initialAttr;
                    // break;
                    case 'rowids':
                        if (aggParts.length > 1) {
                            delim = aggParts[1];
                        }
                        initialAttr = new AggAttr();
                        initialAttr.current = entries.join(delim);
                        return initialAttr;
                    // break;
                }
            }
        }
    };
    const getSheetItemVal = (searchObj, notes) => {
        let val = '',
            retrieve = '',
            o = {};
        // determine what to test; also what to retrieve if another value isn't specified
        if (['@', '*'].includes(searchObj.symbol) && (searchObj.valtype || '').toLowerCase() !== 'max') {
            retrieve = 'current';
        } else if (['@', '*'].includes(searchObj.symbol)) {
            retrieve = 'max';
        } else {
            retrieve = 'action';
        }
        // determine if a different retrievable info is requested
        if (searchObj.symbol === '*') {
            switch ((searchObj.valtype || '').toLowerCase()) {
                case 'name$':
                    retrieve = 'name$';
                    break;
                case 'row$':
                    retrieve = 'row$';
                    break;
                case 'rowid':
                    retrieve = 'rowid';
                    break;
                case 'name':
                    retrieve = 'name';
                    break;
                case 'id':
                    retrieve = 'id';
                    break;
                default:
            }
        }
        // go get the item
        o = getSheetItem(searchObj, notes);
        if (!o) {
            notes.push(`No sheet object found.`);
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
    const getPageIDForPlayer = (pid) => {
        return (pid && playerIsGM(pid))
            ? (getObj('player', pid).get('_lastpage') || Campaign().get('playerpageid'))
            : Campaign().get('playerpageid');
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
                o = getObjOrNull(type, key);
                return o ? o.displayname : undefined;
            case 'deck':
                o = getObjOrNull(type, getObjOrNull('card', key).id);
                return o ? o.name : undefined;
            case 'unknown':
                o = getObjOrNull(type, key);
                return getObjName(o.id, o.type);
            case 'attribute':
            case 'card':
            case 'character':
            case 'handout':
            case 'page':
            default:
                o = getObjOrNull(type, key);
                return o ? o.name : undefined;
        }
    };
    const getControlledByList = (o) => {
        if (!o.represents || !o.represents.length) return o.controlledby;
        let c = getObj('character', o.represents);
        if (c) return c.get('controlledby');
    };

    // ===== OBJECT RETRIEVAL ===========================
    const getCard = ({ query: query = '' } = {}) => {
        let card = findObjs({ type: 'card', id: query })[0] ||
            findObjs({ type: 'card', name: query })[0] ||
            findObjs({ id: (findObjs({ type: 'graphic', subtype: 'card', id: query })[0] || { get: () => '' }).get('cardid') })[0];
        return simpleObj(card);
    };
    const getChar = ({ query: query = '', msg: msg } = {}) => {
        let character;
        if (typeof query !== 'string') return character;
        let qrx = new RegExp(escapeRegExp(query), 'i');
        let charsIControl = findObjs({ type: 'character' });
        charsIControl = playerIsGM(msg.playerid) || manageState.get('playerscanids') ? charsIControl : charsIControl.filter(c => {
            return c.get('controlledby').split(',').reduce((m, p) => {
                return m || p === 'all' || p === msg.playerid;
            }, false)
        });
        character = charsIControl.filter(c => c.id === query)[0] ||
            charsIControl.filter(c => c.id === (getObj('graphic', query) || { get: () => { return '' } }).get('represents'))[0] ||
            charsIControl.filter(c => c.get('name') === query)[0] ||
            charsIControl.filter(c => {
                qrx.lastIndex = 0;
                return qrx.test(c.get('name'));
            })[0];
        return simpleObj(character);
    };
    const getCustFx = ({ query: query = '' } = {}) => {
        let cfx = findObjs({ type: 'custfx', id: query })[0] ||
            findObjs({ type: 'custfx' }).filter(p => { return p.get('name') === query; })[0];

        if (!cfx) { return; }
        return { ...simpleObj(cfx), ...cfx.get('definition') };

    };
    const getDeck = ({ query: query = '' } = {}) => {
        let deck = findObjs({ type: 'deck', id: query })[0] ||
            findObjs({ type: 'deck' }).filter(p => { return p.get('name') === query; })[0];
        return simpleObj(deck);
    };
    const getHandout = ({ query: query = '', msg: msg } = {}) => {
        let handout;
        if (typeof query !== 'string') return handout;
        let qrx = new RegExp(escapeRegExp(query), 'i');

        let handoutsIControl = findObjs({ type: 'handout' });

        handoutsIControl = playerIsGM(msg.playerid) || manageState.get('playerscanids') ? handoutsIControl : handoutsIControl.filter(ho => {
            return [...ho.get('inplayerjournals').split(','), ...ho.get('controlledby').split(',')].reduce((m, p) => {
                return m || p === 'all' || p === msg.playerid;
            }, false)
        });
        handout = handoutsIControl.filter(ho => ho.id === query)[0] ||
            handoutsIControl.filter(ho => ho.get('name') === query)[0] ||
            handoutsIControl.filter(ho => {
                qrx.lastIndex = 0;
                return qrx.test(ho.get('name'));
            })[0];
        return simpleObj(handout);
    };
    const getMacro = ({ query: query = '' } = {}) => {
        let macro = findObjs({ type: 'macro', id: query })[0] ||
            findObjs({ type: 'macro' })
                .filter(p => { return query === p.get('name'); })[0];

        if (macro && macro.id) {
            macro = simpleObj(macro);
        }
        return macro;
    }
    const getMarker = ({ query: query = '' } = {}) => {
        if (libTokenMarkers.getStatus(query).getTag().length) return decomposeStatuses(query)[0];
    };
    const getPage = ({ query: query = '' } = {}) => {
        if (query.toLowerCase() === 'ribbon') {
            return simpleObj(findObjs({ type: 'page', id: Campaign().get('playerspecificpages') })[0]);
        }
        return simpleObj(findObjs({ type: 'page', id: query })[0] ||
            findObjs({ type: 'page' }).filter(p => { return p.get('name') === query; })[0]);
    };
    const getPin = ({ query: query = '', msg: msg } = {}) => {
        if (typeof query !== 'string') return;
        let pinsICanSee = playerIsGM(msg.playerid) || manageState.get('playerscanids')
            ? findObjs({ type: 'pin' })
            : findObjs({ type: 'pin' }).filter(p => p.get('visibleTo') === 'all');
        return simpleObj(pinsICanSee.filter(p => p.id === query)[0] ||
            pinsICanSee.filter(p => p.get('title').length
                ? p.get('title')
                : p.get('subLink').length
                    ? p.get('subLink')
                    : getObjName(p.get('link'), p.get('linkType')) || getObjName(p.get('link'), 'unknown') === query
            )[0]);

    };
    const getPlayer = ({ query: query = '' } = {}) => {
        let player = findObjs({ type: 'player', id: query })[0] ||
            findObjs({ type: 'player' })
                .filter(p => { return [query.toLowerCase(), query.replace(/\s\(gm\)$/i, '').toLowerCase()].includes(p.get('_displayname').toLowerCase()); })[0];

        if (player && player.id) {
            player = simpleObj(player);
        }
        return player;
    };
    const getStatus = ({ source: source = '', query: query = '', msg: msg = {}, msgId: msgId = generateUUID() } = {}) => {
        let token, rxret, status, index, modindex, statusblock;
        token = typeof source === 'string' ? getGraphic({ query: source, msg: msg/*, pageid: getPageForPlayer(msg.playerid) */ }) : source;
        if (!token) return;
        token = simpleObj(token);
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
        let retval = { type: 'status', is: 'no', count: '0' };
        if (!statusblock || !statusblock.length) {
            return retval;
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
                }, retval);
            case 'all+':
                return statusblock.reduce((m, sm) => {
                    m.num = `${Number(m.num || 0) + Number(sm.num)}`;
                    m.tag = m.tag || sm.tag;
                    m.url = m.url || sm.url;
                    m.html = m.html || sm.html;
                    m.is = 'yes';
                    m.count = m.count || statusblock.length;
                    return m;
                }, retval);
            default:
                if (statusblock.length >= modindex) {
                    return Object.assign(retval, statusblock[modindex - 1], { count: index ? '1' : statusblock.length, type: 'status' });
                } else {
                    return retval;
                }
        }
    };
    const getRollableTable = ({ query: query = '', msg: msg } = {}) => {
        let table;
        if (typeof query !== 'string') return table;
        let qrx = new RegExp(escapeRegExp(query), 'i');

        let tablesIControl = findObjs({ type: 'rollabletable' });

        tablesIControl = playerIsGM(msg.playerid) || manageState.get('playerscanids') ? tablesIControl : tablesIControl.filter(tbl => tbl.get('showplayers'));
        table = tablesIControl.filter(tbl => tbl.id === query)[0] ||
            tablesIControl.filter(tbl => tbl.get('name') === query)[0] ||
            tablesIControl.filter(tbl => {
                qrx.lastIndex = 0;
                return qrx.test(tbl.get('name'));
            })[0];
        if (table && table.id) {
            table = simpleObj(table);
        }
        return simpleObj(table);
    };
    const getTableItems = ({ query: query = '', tbl: tbl = '', msg: msg } = {}) => {
        let item = getObjOrNull('tableitem', query);
        let table;
        if (tbl) {
            table = typeof tbl === 'string'
                ? getRollableTable({ query: tbl, msg: msg })
                : tbl;
        } else {
            if (item) {
                table = getRollableTable({ query: item.rollabletableid, msg: msg });
            }
        }
        if (item && item.id) {
            if (item.rollabletableid === table.id) {
                return item;
            }
        } else if (table && table.id) {
            let allitems = findObjs({ type: 'tableitem', rollabletableid: table.id })
                .map(item => simpleObj(item));
            item = allitems.filter(ti => ti.id === query)[0] ||
                allitems.filter(ti => ti.name === query)[0];

            if (item && item.id) { return item; }

            let weightedItems = allitems.reduce((m, v) => {
                m = [...m, ...new Array(v.weight).fill().map(e => v)];
                return m;
            }, []);
            let index;
            if (['1dw', '1dweight'].includes(query.toLowerCase())) {
                index = randomInteger(weightedItems.length) - 1;
                return weightedItems[index];
            } else if (!isNaN(parseInt(query))) {

                index = parseInt(query);
                if (index < 1) {
                    index = 1;
                } else if (index > weightedItems.length) {
                    index = weightedItems.length;
                }
                return weightedItems[index - 1];
            }
        }

    };
    const getTag = ({ oid: oid = '', otype: otype = '', query: query = '', pid: pid = '' } = {}) => {
        let obj = getObjOrNull(otype, oid);
        if (!obj.id) {
            if (otype === 'character') {
                obj = getChar({ query: oid, msg: { playerid: pid } });
            } else if (otype === 'handout') {
                obj = getHandout({ query: oid, msg: { playerid: pid } });
            }
        }
        let tags = JSON.parse(obj.tags || JSON.stringify([]));
        if (!tags.length || !tags.map(t => t.toLowerCase()).includes(query.toLowerCase())) {
            return { type: 'tag', is: 'no', count: 0 };
        } else {
            return { type: 'tag', is: 'yes', count: tags.filter(t => t === query).length };
        }
    };
    const getGraphic = ({ query: query = '', msg: msg, pageid: pgid = '' } = {}) => {
        let lightvals = {
            base: {},
            assign: {}
        };
        if (!pgid.length && msg) {
            pgid = getPageForPlayer(msg.playerid);
        }
        let token = findObjs({ type: 'graphic', subtype: 'token', id: query })[0] ||
            findObjs({ type: 'graphic', subtype: 'card', id: query })[0] ||
            findObjs({ type: 'graphic', subtype: 'token', name: query, pageid: pgid })[0] ||
            findObjs({ type: 'graphic', subtype: 'token', pageid: pgid })
                .filter(t => t.get('represents').length && findObjs({ type: 'character', id: t.get('represents') })[0].get('name') === query)[0];
        if (!token) {
            let tokensOfName = findObjs({ type: 'graphic', subtype: 'token', name: query });
            if (tokensOfName.length === 1) {
                token = tokensOfName[0];
            }
        }
        if (token && token.id) {
            if (typeof checkLightLevel !== 'undefined' && checkLightLevel.hasOwnProperty('isLitBy') && typeof checkLightLevel.isLitBy === 'function') {
                lightvals.base = checkLightLevel.isLitBy(token);
                lightvals.assign.checklight_isbright = lightvals.base.bright ? 'true' : 'false';
                lightvals.assign.checklight_total = lightvals.base.total
            }
            token = Object.assign(
                simpleObj(token),
                getTrackerVal(token),
                lightvals.assign,
                {
                    centerx: Math.round(token.get('left') + (token.get('width') / 2)),
                    centery: Math.round(token.get('top') + (token.get('height') / 2))
                }
            );
        }
        return simpleObj(token);
    };
    const getObjOrNull = (type, id) => {
        return simpleObj(getObj(type, id) || new nullObj());
    };
    const getFirstOrNull = (type) => {
        return simpleObj(findObjs({ type: type })[0] || new nullObj());
    };

    const getFetchObject = (options = {}) => {
        let lib = {
            campaign: () => simpleObj(Campaign()),
            card: () => getCard(options),
            character: () => getChar(options),
            custfx: () => getCustFx(options),
            deck: () => getDeck(options),
            // door
            handout: () => getHandout(options),
            graphic: () => getGraphic(options),
            macro: () => getMacro(options),
            marker: () => getMarker(options),
            page: () => getPage(options),
            // path
            // pathv2
            pin: () => getPin(options),
            player: () => getPlayer(options),
            rollabletable: () => getRollableTable(options),
            //status: () => getStatus(options),
            tableitem: () => getTableItems(options),
            //tag: () => getTag(options),
            //text
            //window
            default: () => simpleObj(findObjs({ id: options.query })[0])
        };
        return (lib[options.type] || lib.default)();
    };

    const getFirstObjectOfType = (type = '') => {
        let o = getFirstOrNull(type);
        let lib = {
            campaign: () => Campaign(),
            // card
            character: () => getChar({ query: o.id, msg: { playerid: getFirstGM().id } }),
            custfx: () => getCustFx({ query: o.id }),
            // deck
            // door
            handout: () => getHandout({ query: o.id, msg: { playerid: getFirstGM().id } }),
            graphic: () => getGraphic({ query: o.id, pageid: o.pageid }),
            // macro
            marker: () => getMarker({ query: JSON.parse(Campaign().get('token_markers'))[0].tag }),
            page: () => getPage({ query: o.id }),
            // path
            // pathv2
            pin: () => getPin({ query: o.id, msg: { playerid: getFirstGM().id } }),
            // player
            rollabletable: () => getRollableTable({ query: o.id, msg: { playerid: getFirstGM().id } }),
            status: () => {
                let source = findObjs({ type: 'graphic' }).filter(g => g.get('statusmarkers').length)[0];
                if (!source || !source.id) { return; }
                let query = source.get('statusmarkers').split(/\s*,\s*/)[0].split(/::/)[0];
                let m = { playerid: getFirstGM().id };
                return getStatus({ source, query, msg: m });
            },
            tableitem: () => {
                return getTableItems({ query: o.id,/* tbl: o.rollabletableid,*/ msg: { playerid: getFirstGM().id } })
            },
            tag: () => {
                let o = findObjs({ type: 'character' }).filter(c => c.get('tags').length)[0] ||
                    findObjs({ type: 'handout' }).filter(h => h.get('tags').length)[0];
                return o
                    ? getTag({ oid: o.id, otype: o.get('type'), query: o.get('tags')[0], pid: getFirstGM().id })
                    : { is: 'no', count: 0 };

            },
            // text
            //window
            default: () => getFirstOrNull(type)
        };
        return (lib[type] || lib.default)();
    };

    // ===== PROP CONTAINERS ============================
    const abilityProps = {
        nicks: {
        },
        compProps: {}
    }
    const attributeProps = {
        nicks: {
            istokenaction: ['tokenaction']
        },
        compProps: {}
    }
    const campaignProps = { // @(campaign.<prop>)
        nicks: {
            id: ['campaign_id'],
            type: ['campaign_type'],
            playerpageid: ['pageid', 'page_id', 'playerpageid', 'playerpage_id'],
            token_markers: ['markers']
        },
        compProps: {
            currentpages: { nicks: [], val: (o) => ((p = getPagesForAllPlayers()) => Object.keys(p).map(k => `${k}:${p[k]}`).join(','))() },
            currentpagesname: { nicks: [], val: (o) => ((p = getPagesForAllPlayers()) => Object.keys(p).map(k => `${getObjName(k, 'player')}:${getObjName(p[k], 'page')}`).join(','))() },
            pagename: { nicks: ['page_name', 'playerpagename', 'playerpage_name'], val: o => getObjName(o.playerpageid, 'page') },
            playerspecificpages: { nicks: [], val: (o) => Object.keys(o.playerspecificpages).map(k => `${k}:${o.playerspecificpages[k]}`).join(',') },
            playerspecificpagesname: { nicks: ['playerspecificpages_name'], val: (o) => Object.keys(o.playerspecificpages).map(k => `${getObjName(k, 'player')}:${getObjName(o.playerspecificpages[k], 'page')}`).join(',') },
        }
    }
    const cardProps = {
        nicks: {
            avatar: ['imgsrc']
        },
        compProps: {
            img: { nicks: [], val: (o) => `<img src="${o.avatar}">` },
            imgsrc_short: { nicks: [], val: (o) => ((d = o.avatar) => d.slice(0, Math.max(d.indexOf(`?`), 0) || d.length))() }
        }
    }
    const charProps = (() => {
        let nicks = {
            id: ['char_id', 'character_id'],
            type: ['char_type', 'character_type'],
            name: ['char_name', 'character_name'],

            controlledby: ['character_controlledby', 'character_cby', 'char_cby', 'char_controlledby', 'cby'],
        };
        let ccbyNicks = ['controlledby_names', 'controlledby_name', 'cby_name', 'cby_names', 'character_controlledby_names', 'character_cby_name', 'character_cby_names', 'char_cby_name', 'char_cby_names', 'char_controlledby_name', 'char_controlledby_names'];
        let compProps = {
            character_img: { nicks: ['char_img', 'character_image', 'char_image'], val: (o) => `<img src="${(o.avatar)}">` },
            character_controlledby_name: { nicks: ccbyNicks, val: (o) => getObjName(o.controlledby, 'playerlist') },
            inplayerjournals_name: { nicks: ['inplayerjournals_names'], val: (o) => getObjName(o.inplayerjournals, 'playerlist') },
            player: { nicks: [], val: (o) => o.controlledby.split(/\s*,\s*/).filter(a => a.toLowerCase() !== 'all' && getObj('player', a))[0] },
            player_name: { nicks: [], val: (o) => o.controlledby.split(/\s*,\s*/).filter(a => a.toLowerCase() !== 'all').map(a => getObjName(a, 'player')).filter(a => a)[0] },
            tags: { nicks: [], val: (o) => JSON.parse(o.tags).join(',') }
        };
        return { nicks, compProps };
    })();
    const custfxProps = {
        nicks: {
            definition: ['def'],
            startcolour: ['startcolor'],
            endcolour: ['endcolor'],
            startcolourrandom: ['startcolorrandom'],
            endcolourrandom: ['endcolorrandom']
        },
        compProps: {}
    }
    const deckProps = {
        nicks: {
            avatar: ['imgsrc']
        },
        compProps: {
            img: { nicks: [], val: (o) => `<img src="${o.avatar}">` },
            imgsrc_short: { nicks: [], val: (o) => ((d = o.avatar) => d.slice(0, Math.max(d.indexOf(`?`), 0) || d.length))() }
        }
    }
    const doorProps = {
        nicks: {
            color: ['colour']
        },
        compProps: {
            path: { nicks: [], val: (o) => JSON.stringify(o.path) }
        }
    }
    const graphicProps = {
        nicks: {
            id: ['tid', 'token_id'],
            name: ['token_name'],
            type: ['token_type'],
            aura1_color: ['aura1'],
            aura1_radius: ['radius1'],
            aura1_square: ['square1'],
            aura2_color: ['aura2'],
            aura2_radius: ['radius2'],
            aura2_square: ['square2'],
            bar_location: ['bar_loc'],
            bar1_link: ['link1'],
            bar1_max: ['max1'],
            bar1_value: ['bar1', 'bar1_current'],
            bar2_link: ['link2'],
            bar2_max: ['max2'],
            bar2_value: ['bar2', 'bar2_current'],
            bar3_link: ['link3'],
            bar3_max: ['max3'],
            bar3_value: ['bar3', 'bar3_current'],
            bar4_link: ['link4'],
            bar4_max: ['max4'],
            bar4_value: ['bar4', 'bar4_current'],
            cardid: ['cid'],
            currentside: ['curside', 'side'],
            emits_bright_light: ['emits_bright'],
            emits_low_light: ['emits_low'],
            has_night_vision: ['nv_has', 'has_nv'],
            isdrawing: ['drawing'],
            light_sensitivity_multiplier: ['light_sensitivity_mult'],
            night_vision_distance: ['nv_dist', 'nv_distance'],
            night_vision_effect: ['nv_effect'],
            night_vision_tint: ['nv_tint'],
            pageid: ['page_id', 'pid', 'token_page_id', 'token_pageid', 'token_pid'],
            represents: ['reps'],
            statusmarkers: ['markers'],
            subtype: ['sub'],
            tint_color: ['tint'],
        },
        compProps: {
            page: { nicks: ['page_name'], val: (o) => getObjName(o.pageid, 'page') },
            bar1_name: { nicks: ['name1'], val: (o) => ((d = o.bar1_link) => /^sheetattr_/.test(d) ? d.replace(/^sheetattr_/, '') : getObjName(d, 'attribute'))() },
            bar2_name: { nicks: ['name2'], val: (o) => ((d = o.bar2_link) => /^sheetattr_/.test(d) ? d.replace(/^sheetattr_/, '') : getObjName(d, 'attribute'))() },
            bar3_name: { nicks: ['name3'], val: (o) => ((d = o.bar3_link) => /^sheetattr_/.test(d) ? d.replace(/^sheetattr_/, '') : getObjName(d, 'attribute'))() },
            bar4_name: { nicks: ['name4'], val: (o) => ((d = o.bar4_link) => /^sheetattr_/.test(d) ? d.replace(/^sheetattr_/, '') : getObjName(d, 'attribute'))() },
            cardback: { nicks: ['card_back'], val: (o) => getObjOrNull('card', o.cardid).card_back },
            cardname: { nicks: ['card_name'], val: (o) => getObjName(o.cardid, 'card') },
            deckid: { nicks: [], val: (o) => getObjOrNull('card', o.cardid).deckid },
            deckname: { nicks: [], val: (o) => getObjName('deck', getObjOrNull('card', o.cardid).deckid) },

            gmnotes: { nicks: [], val: (o) => unescape(o.gmnotes) },
            img: { nicks: [], val: (o) => `<img src="${o.imgsrc}">` },
            imgsrc_short: { nicks: [], val: (o) => ((d = o.imgsrc) => d.slice(0, Math.max(d.indexOf(`?`), 0) || d.length))() },
            lastx: { nicks: [], val: (o) => o.lastmove.split(/\s*,\s*/)[0] || '' },
            lasty: { nicks: [], val: (o) => o.lastmove.split(/\s*,\s*/)[1] || '' },
            player: { nicks: [], val: (o) => getControlledByList(o).split(/\s*,\s*/).filter(a => a.toLowerCase() !== 'all' && getObj('player', a))[0] },
            player_name: { nicks: [], val: (o) => getControlledByList(o).split(/\s*,\s*/).filter(a => a.toLowerCase() !== 'all').map(a => getObjName(a, 'player')).filter(a => a)[0] },
            represents_name: { nicks: ['reps_name'], val: (o) => getObjName(o.represents, 'character') },

            controlledby: { nicks: ['cby', 'token_cby', 'token_controlledby'], val: (o) => getControlledByList(o) },
            token_cby_names: { nicks: ['controlledby_names', 'controlledby_name', 'cby_names', 'cby_name', 'token_controlledby_names', 'token_cby_name', 'token_controlledby_name'], val: (o) => getObjName(getControlledByList(o), 'playerlist') },

            sides_short: { nicks: [], val: (o) => (o.sides || '').split(`|`).map(side => decodeURIComponent(side).slice(0, Math.max(side.indexOf(`?`), 0) || side.length)).join(`|`) },
            sidecount: { nicks: ['sidescount'], val: (o) => (o.sides || '').split(`|`).length }
        },

    }
    const handoutProps = {
        nicks: {
            avatar: ['imgsrc']
        },
        compProps: {
            controlledby_name: { nicks: ['controlledby_name', 'cby_name'], val: (o) => getObjName(o.controlledby, 'playerlist') },
            img: { nicks: [], val: (o) => `<img src="${o.avatar}">` },
            imgsrc_short: { nicks: [], val: (o) => ((d = o.avatar) => d.slice(0, Math.max(d.indexOf(`?`), 0) || d.length))() },
            inplayerjournals_name: { nicks: ['inplayerjournals_names'], val: (o) => getObjName(o.inplayerjournals, 'playerlist') },
            player: { nicks: [], val: (o) => o.controlledby.split(/\s*,\s*/).filter(a => a.toLowerCase() !== 'all' && getObj('player', a))[0] },
            player_name: { nicks: [], val: (o) => o.controlledby.split(/\s*,\s*/).filter(a => a.toLowerCase() !== 'all').map(a => getObjName(a, 'player')).filter(a => a)[0] },
            tags: { nicks: [], val: (o) => JSON.parse(o.tags).join(',') }
        }
    }
    const macroProps = {
        nicks: {
            istokenaction: ['tokenaction']
        },
        compProps: {}
    }
    const markerProps = { // derived from the Campaign object
        nicks: {
            tag: ['marker_id'],
            name: ['marker_name']
        },
        compProps: {}
    }
    const pageProps = { // @(page.<page ref>.<prop>)
        nicks: {
            id: ['page_id'],
            name: ['page_name'],
            type: ['page_type'],
            background_color: ['bg_color'],
            daylightmodeopacity: ['daylight_mode_opacity'],
            diagonaltype: ['diagonal_type', 'diagonal'],
            fog_opacity: ['fogopacity'],
            gridcolor: ['grid_color'],
            gridlabel: ['grid_label'],
            grid_opacity: ['gridopacity'],
            grid_type: ['gridtype'],
            jukebox_trigger: ['jukeboxtrigger'],
            showdarkness: ['show_darkness'],
            showgrid: ['show_grid'],
            showlighting: ['show_lighting'],
            snapping_increment: ['snappingincrement']
        },
        compProps: {}
    }
    const pathProps = {
        nicks: {
            pageid: ['page_id', 'pid'],
            stroke_width: ['strokewidth']
        },
        compProps: {
            controlledby: { nicks: ['cby'], val: (o) => getControlledByList(o) },
            controlledby_names: { nicks: ['controlledby_name', 'cby_name', 'cby_names'], val: (o) => getObjName(getControlledByList(o), 'playerlist') },
            page: { nicks: ['page_name'], val: (o) => getObjName(o.pageid, 'page') },
            player: { nicks: [], val: (o) => o.controlledby.split(/\s*,\s*/).filter(a => a.toLowerCase() !== 'all' && getObj('player', a))[0] },
            player_name: { nicks: [], val: (o) => getControlledByList(o).split(/\s*,\s*/).filter(a => a.toLowerCase() !== 'all').map(a => getObjName(a, 'player')).filter(a => a)[0] }
        }
    }
    const pathv2Props = {
        nicks: {
            pageid: ['page_id', 'pid'],
            stroke_width: ['strokewidth']
        },
        compProps: {
            controlledby: { nicks: ['cby'], val: (o) => getControlledByList(o) },
            controlledby_names: { nicks: ['controlledby_name', 'cby_name', 'cby_names'], val: (o) => getObjName(getControlledByList(o), 'playerlist') },
            page: { nicks: ['page_name'], val: (o) => getObjName(o.pageid, 'page') },
            player: { nicks: [], val: (o) => o.controlledby.split(/\s*,\s*/).filter(a => a.toLowerCase() !== 'all' && getObj('player', a))[0] },
            player_name: { nicks: [], val: (o) => getControlledByList(o).split(/\s*,\s*/).filter(a => a.toLowerCase() !== 'all').map(a => getObjName(a, 'player')).filter(a => a)[0] }
        }
    }
    const pinProps = (() => {
        const nicks = {
            title: ['name']
        };
        const permission = (obj, prop, msg) => {
            if (playerIsGM(msg.playerid)) return true;
            if (obj.tooltipVisibleTo !== 'all') return false;
            switch (prop.toLowerCase()) {
                case 'image':
                    return true;
                case 'notes':
                    return obj.notesVisibleTo === 'all';
                case 'gmnotes':
                    return obj.gmNotesVisibleTo === 'all';
                case 'title':
                case 'name':
                    return obj.nameplateVisibleTo === 'all';
            }
        };
        const compProps = {
            gmnotes: {
                nicks: [],
                val: (o, msg) => permission(o, 'gmnotes', msg)
                    ? o.gmnotes
                    : undefined
            },
            image: {
                nicks: ['img'],
                val: (o, msg) => permission(o, 'image', msg)
                    ? ((u = o.tooltipImage.length ? o.tooltipImage : getObjOrNull(o.linkType, o.link).avatar || '') => u.length ? `<img src="${u}">` : undefined)()
                    : undefined
            },
            linkname: { nicks: [], val: (o) => getObjName(o.link, o.linkType) || getObjName(o.link, 'unknown') },
            name: {
                nicks: ['title'],
                val: (o, msg) => permission(o, 'name', msg)
                    ? o.title.length
                        ? o.title
                        : o.subLink.length
                            ? o.subLink
                            : getObjName(o.link, o.linkType) || getObjName(o.link, 'unknown')
                    : undefined
            },
            notes: {
                nicks: [],
                val: (o, msg) => permission(o, 'notes', msg)
                    ? o.notes
                    : undefined
            },
            page: { nicks: ['page_name'], val: (o) => getObjName(o.pageid, 'page') }
        };
        return { nicks, compProps };
    })();
    const playerProps = { // @(player.<player ref>.<prop>)
        nicks: {
            id: ['player_id'],
            displayname: ['name', 'player_name', 'display_name'],
            type: ['player_type'],
            d20userid: ['roll20id', 'roll20_id', 'r20id', 'r20_id', 'userid', 'user_id'],
            lastpage: ['last_page'],
            showmacrobar: ['show_macrobar'],
            speakingas: ['speaking_as']
        },
        compProps: {
            currentpage: { nicks: ['current_page'], val: (o) => getPageForPlayer(o.id) },
            currentpagename: { nicks: ['current_page_name', 'page_name'], val: (o) => getObjName(getPageForPlayer(o.id), 'page') },
            isgm: { nicks: [], val: (o) => playerIsGM(o) },
            lastpagename: { nicks: ['last_page_name'], val: (o) => getObjName(o.lastpage, 'page') }
        }
    }
    const rollabletableProps = {
        nicks: {},
        compProps: {
            totalweight: { nicks: [], val: (o) => findObjs({ type: 'tableitem', rollabletableid: o.id }).reduce((m, v) => m += v.get('weight'), 0) }
        }
    }
    const statusProps = { // derived from a token object
        nicks: {
            tag: ['id', 'status_id'],
            name: ['status_name'],
            num: ['number', 'value', 'val']
        },
        compProps: {

        }
    }
    const tableitemProps = {
        nicks: {
            avatar: ['imgsrc']
        },
        compProps: {
            img: { nicks: [], val: (o) => `<img src="${o.avatar}">` },
            imgsrc_short: { nicks: [], val: (o) => o.avatar.slice(0, Math.max(o.avatar.indexOf(`?`), 0) || o.avatar.length) }
        }
    }
    const tagProps = {
        nicks: {

        },
        compProps: {

        }
    }
    const textProps = {
        nicks: {
            controlledby: ['cby'],
            pageid: ['page_id', 'pid']

        },
        compProps: {
            controlledby_names: { nicks: ['cby_names', 'cby_name', 'controlledby_name'], val: (o) => getObjName(o.controlledby, 'playerlist') },
            page: { nicks: ['page_name'], val: (o) => getObjName(o.pageid, 'page') },
            player: { nicks: [], val: (o) => o.controlledby.split(/\s*,\s*/).filter(a => a.toLowerCase() !== 'all' && getObj('player', a))[0] },
            player_name: { nicks: [], val: (o) => getControlledByList(o).split(/\s*,\s*/).filter(a => a.toLowerCase() !== 'all').map(a => getObjName(a, 'player')).filter(a => a)[0] },
        },

    }
    const windowProps = {
        nicks: {
            pageid: ['pid', 'page_id']
        },
        compProps: {
            page: { nicks: ['page_name'], val: (o) => getObjName(o.pageid, 'page') }
        }
    }

    const customPropsByType = {
        ability: abilityProps,
        attribute: attributeProps,
        campaign: campaignProps,
        card: cardProps,
        character: charProps,
        custfx: custfxProps,
        deck: deckProps,
        door: doorProps,
        graphic: graphicProps,
        handout: handoutProps,
        marker: markerProps,
        macro: macroProps,
        page: pageProps,
        path: pathProps,
        pathv2: pathv2Props,
        pin: pinProps,
        player: playerProps,
        rollabletable: rollabletableProps,
        status: statusProps,
        tableitem: tableitemProps,
        tag: tagProps,
        text: textProps,
        window: windowProps
    };
    const buildPropsForType = (query) => {
        let o = getFirstObjectOfType(query.toLowerCase());
        if (!o || !o.id) { return; }
        let nicks = customPropsByType[query.toLowerCase()]?.nicks || {};
        let compProps = customPropsByType[query.toLowerCase()]?.compProps || {};
        let props = Object.keys(o).reduce((m, p) => { // roll20 object props
            m[p.toLowerCase()] = (o) => o[p];
            return m;
        }, {});
        Object.keys(nicks || {}).forEach(p => { // aliases for roll20 object props
            nicks[p].forEach(n => {
                props[n] = (o) => o[p];
            });
        });
        Object.keys(compProps || {}).forEach(p => { // custom props
            [p, ...compProps[p].nicks].forEach(n => {
                props[n] = compProps[p].val;
            });
        });
        return props;
    };
    let knownObjectTypes = [];
    let propContainers = {};
    const commitProps = t => {
        knownObjectTypes.push(t);
        propContainers[t] = buildPropsForType(t);
    };
    const buildPropContainers = () => {
        [...new Set(getAllObjs().map(o => o.get('type')))]
            .filter(t => !knownObjectTypes.includes(t))
            .forEach(t => {
                commitProps(t);
            });
        Object.keys(customPropsByType) // props for non-R20 objects like tags, status, and markers
            .filter(k => !knownObjectTypes.includes(k))
            .forEach(k => {
                propContainers[k] = buildPropsForType(k);
            });
    };

    // ==================================================
    //		EVENT HANDLERS
    // ==================================================
    const handleInput = (msg, msgstate = {}) => {
        const trackerrx = /^tracker(\[(?<filter>[^\]]+)]){0,1}((?<operator>\+|-)(?<offset>\d+)){0,1}$/i;
        const rptgitemrx = /(?<type>(?:\*))\((?<character>[^|.]+?)[|.](?<section>[^\s.|]+?)[|.](?:\[\s*(?<pattern>.+?)\s*]|(?<reference>\$(?:\d+|[nN])|1[dD][wW](?:[eE][iI][gG][hH][tT])?(?:\?.+?)?|[a-zA-Z0-9_-]{20})|(?<aggregate>(?:min|max|avg|sum|vals|uniq|rowids|ids)(?:\?.+?)?))\s*[|.](?<valuesuffix>[^[\s).]+?)(?:[|.](?<valtype>[^\s.[)]+?)){0,1}(?:\[(?<default>[^\]]*?)]){0,1}\s*\)/gi;
        // const rptgitemrx = /(?<type>(?:\*))\((?<character>[^|.]+?)[|.](?<section>[^\s.|]+?)[|.](?:\[\s*(?<pattern>.+?)\s*]|(?<reference>\$\d+|[a-zA-Z0-9_-]{20}))\s*[|.](?<valuesuffix>[^[\s).]+?)(?:[|.](?<valtype>[^\s.[)]+?)){0,1}(?:\[(?<default>[^\]]*?)]){0,1}\s*\)/gi;

        const macrorx = /#\((?<item>[^\s.[)]+?)(?:\[(?<default>[^\]]*?)]){0,1}\s*\)/gi;
        const multirx = /(?<type>(?:@|%))\((?<obj>tracker(?:\[[^\]]+]){0,1}(?:(?:\+|-)\d+){0,1}|[^@*%#|.]+?)[|.](?<prop>[^@*%#.[|]+?)(?:[|.](?<identikey>[^@*%#.|[]+?)(?:[|.](?<subprop>[^[@*%#]+?)){0,1}){0,1}(?:\[(?<default>[^@*%#\]]*?)]){0,1}\s*\)/gi;
        const testConstructs = c => {
            return [multirx, rptgitemrx, macrorx].reduce((m, r) => {
                m = m || r.test(c);
                r.lastIndex = 0;
                return m;
            }, false);
        };
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
        const getPropertyValue = (searchObj, typeList = []) => {
            let retval;
            let propObj;
            let newSource;

            if (!Object.keys(propContainers[searchObj.source.type] || {}).length) { commitProps(searchObj.source.type); }

            if (typeList.includes(searchObj.source.type)) { return searchObj.retval; }

            typeList.push(searchObj.source.type);
            let newProp1;

            switch (searchObj.source.type) {
                case 'character':
                    if (searchObj.prop1.toLowerCase() === 'status' || // token status
                        (searchObj.prop1.toLowerCase() === 'is' && searchObj.prop2 && isMarker(searchObj.prop2)) || // token status
                        (Object.keys(propContainers.graphic || {}).includes(searchObj.prop1)
                            && searchObj.type !== 'speaker'
                            && !Object.keys(propContainers.character).includes(searchObj.prop1)
                        ) // token property
                    ) { // any of these cases means we should get a token, if possible
                        newSource = getGraphic({ query: searchObj.source.name, msg: searchObj.msg, /*pid: getPageIDForPlayer(searchObj.msg.playerid) */ });
                        if (!newSource) {
                            notes.push(`No token can be found for that character. Using default value.`);
                        } else {
                            retval = getPropertyValue({ ...searchObj, ...{ source: newSource } }, typeList);
                        }
                    } else if (searchObj.prop1.toLowerCase() === 'is') { // looking for tag (status would have been already caught)
                        if (searchObj.prop2) {
                            newSource = getTag({ oid: searchObj.source.id, otype: 'character', query: searchObj.prop2, pid: searchObj.msg.playerid });
                            retval = propContainers.tag.is(newSource, searchObj.msg);
                        }
                        // } else if (Object.keys(propContainers.graphic).includes(searchObj.prop1)) { // token property taken care of, above
                    } else if (Object.keys(propContainers.character || {}).includes(searchObj.prop1)) { // character property
                        retval = propContainers.character[searchObj.prop1](searchObj.source, searchObj.msg);
                    } else { // potentially character attribute
                        retval = getCharacterAttribute(searchObj);
                    }
                    break;
                case 'graphic':
                    if (searchObj.prop1.toLowerCase() === 'status' || // token status
                        (searchObj.prop1.toLowerCase() === 'is' && searchObj.prop2 && isMarker(searchObj.prop2))) {
                        newSource = getStatus({ source: searchObj.source, query: searchObj.prop2, msg: searchObj.msg });
                        newProp1 = 'val';
                        if (searchObj.prop3 === 'is' || searchObj.prop1 === 'is') {
                            newProp1 = 'is';
                        } else if (searchObj.prop3 && searchObj.prop3.length) {
                            newProp1 = searchObj.prop3;
                        }
                        retval = getPropertyValue({ ...searchObj, ...{ source: newSource, prop1: newProp1 } }, typeList);
                    } else if (Object.keys(propContainers.graphic || {}).includes(searchObj.prop1)) {
                        retval = propContainers.graphic[searchObj.prop1](searchObj.source, searchObj.msg);
                    } else {
                        if (searchObj.source.subtype === 'card') { // card subtype, could be type:card
                            if (!searchObj.source.cardid || !searchObj.source.cardid.length) {
                                notes.push(`Not a recongized token property, but no card object can be found for that card graphic. Using default value.`);
                            } else {
                                newSource = getCard({ query: searchObj.source.cardid });
                                if (!newSource) {
                                    notes.push(`No card object can be found for that card graphic. Using default value.`);
                                } else {
                                    retval = getPropertyValue({ ...searchObj, ...{ source: newSource } }, typeList);
                                }
                            }
                        } else { // token subtype, could be character
                            if (!searchObj.source.represents || !searchObj.source.represents.length) {
                                notes.push(`Not a recongized token property, and no character is associated with that token. Using default value.`);
                            } else {
                                newSource = getChar({ query: searchObj.source.represents, msg: searchObj.msg });
                                if (!newSource) {
                                    notes.push(`Not a recongized token property, but the associated character cannot be found. Using default value.`);
                                } else {
                                    retval = getPropertyValue({ ...searchObj, ...{ source: newSource } }, typeList);
                                }
                            }
                        }
                    }
                    break;
                case 'rollabletable':
                    if (Object.keys(propContainers.rollabletable || {}).includes(searchObj.prop1)) {
                        retval = propContainers.rollabletable[searchObj.prop1](searchObj.source, searchObj.msg);
                    } else {
                        newSource = getTableItems({ query: searchObj.prop1, tbl: searchObj.source, msg: searchObj.msg });
                        if (!newSource) {
                            notes.push(`Not a recognized item in that table. Using default value.`);
                        } else {
                            retval = propContainers.tableitem[!(searchObj.prop2 && searchObj.prop2.length) ? 'name' : searchObj.prop2](newSource, searchObj.msg);
                        }
                    }
                    break;
                case 'handout':
                    if (searchObj.prop1.toLowerCase() === 'is') { // looking for tag
                        if (searchObj.prop2) {
                            newSource = getTag({ oid: searchObj.source.id, otype: 'handout', query: searchObj.prop2, pid: searchObj.msg.playerid });
                            retval = propContainers.tag.is(newSource, searchObj.msg);
                        }
                    } else if (Object.keys(propContainers.character || {}).includes(searchObj.prop1)) { // handout property
                        retval = propContainers.character[searchObj.prop1](searchObj.source, searchObj.msg);
                    }
                    break;
                default:
                    propObj = propContainers[searchObj.source.type];
                    if (!Object.keys(propObj || {}).includes(searchObj.prop1.toLowerCase())) {
                        notes.push(`Unable to find a ${searchObj.type.toLowerCase()} property named ${searchObj.prop1}. Using default value.`);
                    } else {
                        retval = propObj[searchObj.prop1.toLowerCase()](searchObj.source, searchObj.msg);
                        if (typeof retval === 'undefined') {
                            notes.push(`Unable to find ${searchObj.type.toLowerCase()} value for ${searchObj.prop1}. Using default value.`);
                            retval = searchObj.retval;
                        }
                    }

            }

            return typeof retval !== 'undefined' ? retval : searchObj.retval;
        };

        const getCharacterAttribute = (searchObj) => {
            let retval = getSheetItemVal({ ...searchObj, ...{ item: searchObj.prop1, valtype: searchObj.prop2 } }, notes);
            if (typeof retval === 'undefined') {
                notes.push(`Unable to find ${searchObj.symbol === '@' ? 'attribute' : 'ability'} named ${searchObj.prop1} for ${searchObj.source.name}. Using default value.`);
                retval = searchObj.retval;
            }
            return retval;
        };

        const assignFromSpecialIdentifier = (searchObj) => {
            let offset = 0,
                trackres,
                pgfilter = 'page',
                presource,
                reverse = false;
            if (trackerrx.test(searchObj.init.obj)) { // if it is a tracker call, it could have an offset, so we detect that first
                trackres = trackerrx.exec(searchObj.init.obj);
                offset = parseInt(trackres.groups.offset || '0');
                if (trackres.groups.operator === '-') reverse = true;
                if (playerIsGM(searchObj.msg.playerid)) pgfilter = trackres.groups.filter || 'page';
                searchObj.type = `tracker`;
                let to = JSON.parse(Campaign().get('turnorder') || '[]').filter(filterObj[pgfilter] || filterObj['page']);
                if (!to.length || to[0].id === '-1') {
                    notes.push(`No tracker token for ${searchObj.m}. Using default value.`);
                } else {
                    presource = to[(reverse ? to.length - (offset % to.length) : offset % to.length) % to.length];
                    searchObj.source = getGraphic({ query: presource.id, pageid: presource._pageid });
                }
            } else if (searchObj.init.obj.toLowerCase() === 'speaker') { // if it's a speaker call, determine if player or character, and adjust appropriately
                presource = getChar({ query: msg.who, msg: searchObj.msg });
                if (presource && presource.name) {
                    searchObj.type = 'speaker';
                    searchObj.source = presource;
                } else {
                    presource = getPlayer({ query: msg.who, msg: searchObj.msg });
                    if (presource && presource.displayname) {
                        searchObj.type = 'speaker';
                        searchObj.source = presource;
                    } else {
                        notes.push(`Unable to find the speaker`);
                    }
                }
            } else if (searchObj.init.obj.toLowerCase() === 'selected') {
                if (!searchObj.msg.selected || !searchObj.msg.selected.length) { // selected but no token => default
                    notes.push(`No token selected for ${searchObj.m}. Using default value.`);
                } else {
                    presource = simpleObj(findObjs({ id: searchObj.msg.selected[0]._id })[0]);
                    if (!Object.keys(propContainers || {}).includes(presource.type.toLowerCase())) {
                        commitProps(presource.type);
                    }
                    searchObj.source = getFetchObject({ type: presource.type, query: presource.id, msg: searchObj.msg });
                    searchObj.type = 'selected';
                }
            }
        };

        while (testConstructs(msg.content)) {
            msg.content = msg.content.replace(multirx, (m, symbol, obj, prop, identikey, subprop, def = '') => {
                let presource,
                    retval = def,
                    searchObj = {
                        source: {},
                        type: '',
                        symbol: symbol,
                        prop1: prop,
                        prop2: identikey,
                        prop3: subprop,
                        retval: def,
                        init: {
                            m: m,
                            obj: obj,
                            prop: prop,
                            identikey: identikey,
                            subprop: subprop,
                            def: def
                        },
                        msg: msg
                    };
                if (obj.toLowerCase() === 'table') { searchObj.type = 'rollabletable'; obj = 'rollabletable'; }
                if (trackerrx.test(obj) || ['selected', 'speaker'].includes(obj.toLowerCase())) {
                    assignFromSpecialIdentifier(searchObj);
                } else if ([...knownObjectTypes, 'marker'].includes(obj.toLowerCase()) || (findObjs({ type: obj.toLowerCase() })[0] || {}).hasOwnProperty('id')) { // fetch call using object type
                    searchObj.source = getFetchObject({ type: obj.toLowerCase(), query: prop, msg: msg });
                    searchObj.type = obj.toLowerCase();
                    searchObj.prop1 = searchObj.type === 'marker' ? identikey || 'html' : identikey;
                    searchObj.prop2 = subprop;
                    searchObj.prop3 = undefined;
                    //retval = getPropertyValue(source, obj, identikey, def);
                } else if (((presource = findObjs({ id: obj })[0]) || {}).hasOwnProperty('id')) { // object ID
                    searchObj.source = getFetchObject({ type: presource.get('type'), query: presource.id, msg: msg });
                    searchObj.type = 'id';
                } else { // all others (names, etc.)
                    if (/([^[]+)\[([^\]]+)\]/.test(obj)) {
                        let pageData = /([^[]+)\[([^\]]+)\]/.exec(obj);
                        presource = getGraphic({ query: pageData[1], msg: searchObj.msg, pageid: (getPage({ query: pageData[2] }) || {}).id }); //getGraphic
                    } else {
                        presource = getGraphic({ query: obj, msg: searchObj.msg/*, pageid: getPageIDForPlayer(msg.playerid) */ }); //getGraphic
                    }
                    if (presource && presource.name) {
                        searchObj.type = 'name';
                        searchObj.source = presource;
                    } else {
                        presource = getChar({ query: obj, msg: searchObj.msg }); //getChar
                        if (presource && presource.name) {
                            searchObj.type = 'name';
                            searchObj.source = presource;
                        } else {
                            notes.push(`Unable to find a game object named ${obj}. Using default value.`);
                        }
                    }
                }

                if (!searchObj.source || !Object.keys(searchObj.source || {}).length) {
                    retval = searchObj.retval;
                } else {
                    retval = getPropertyValue(searchObj);
                }

                if (retval) status.push('changed');
                return retval;
            });

            // REPEATING SHEET ITEMS
            msg.content = msg.content.replace(rptgitemrx, (m, symbol, obj, section, pattern, reference, aggregate, valuesuffix, valtype, def = '') => {
                let retval,
                    searchObj = {
                        source: {},
                        type: '',
                        symbol: symbol,
                        obj: obj,
                        section: section,
                        pattern: pattern,
                        reference: reference,
                        aggregate: aggregate,
                        valuesuffix: valuesuffix,
                        valtype: valtype,
                        retval: def,
                        init: {
                            m: m,
                            type: symbol,
                            obj: obj,
                            section: section,
                            pattern: pattern,
                            reference: reference,
                            valuesuffix: valuesuffix,
                            valtype: valtype,
                            def: def
                        },
                        msg: msg
                    };
                if (trackerrx.test(obj) || ['selected', 'speaker'].includes(obj.toLowerCase())) {
                    assignFromSpecialIdentifier(searchObj);
                    if (searchObj.source && searchObj.source.type === 'graphic') {
                        searchObj.source = getChar({ query: searchObj.source.represents, msg });
                    }
                } else {
                    searchObj.source = getChar({ query: obj, msg: searchObj.msg });
                    if ((findObjs({ id: obj })[0] || {}).hasOwnProperty('id')) { // object ID
                        searchObj.type = 'id';
                    } else { // all others (names, etc.)
                        searchObj.type = 'name'
                    }
                }

                if (!searchObj.source || !Object.keys(searchObj.source || {}).length) {
                    retval = searchObj.retval;
                    notes.push(`Unable to find character for ${m}. Using default value.`); //track note only if we haven't already tracked no selected
                } else {
                    if (!Object.keys(propContainers[searchObj.source.type] || {}).length) { commitProps(searchObj.source.type); }
                    if (!Object.keys(propContainers.attribute || {}).length) { commitProps('attribute'); }

                    retval = getSheetItemVal(searchObj, notes);
                    if (typeof retval === 'undefined') {
                        notes.push(`Unable to find repeating item for ${m}. Using default value.`);
                        retval = searchObj.retval;
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

    const handlePropReport = msg => {
        /*
        !fetchprops
        !fetchprops --type=<type>        
        */
        if (!(msg.type === "api" && /^!fetchprops/i.test(msg.content))) return;
        if (/^!fetchprops-rebuild/i.test(msg.content)) {
            buildPropContainers();
        }
        let contents = [];
        let rptArgs = {
            type: '',
            ref: '',
            object: undefined
        };
        const propNicks = (type) => {
            let nicks = [...Object.entries(customPropsByType[type]?.compProps || {}).map(e => [e[0], ...e[1].nicks]),
            ...Object.entries(customPropsByType[type]?.nicks || {}).map(e => [e[0], ...e[1]])];
            let filterProps = nicks.reduce((m, p) => {
                m = [...m, ...p];
                return m;
            }, []);
            let remainingProps = Object.keys(propContainers[type] || {}).filter(p => !filterProps.includes(p));
            remainingProps.filter(k => !/^_/.test(k)).forEach(k => { nicks.push([k]); });
            remainingProps.filter(k => /^_/.test(k)).forEach(k => { nicks.find(n => n.includes(k.slice(1))).unshift(k); });
            return nicks.map(props => props.sort()).sort((a, b) => a[0] > b[0] ? 1 : -1);
        }

        let [handle, args] = ((apriori = msg.content.split(/\s+--/)) => { return [apriori[0], apriori.slice(1)]; })();

        let typesWithProps = Object.keys(propContainers || {});
        let tbl = '';

        args.filter(a => /^([^#\|=:]+)(?:#|\||=|:)(.+)$/.test(a)).forEach(a => {
            let argParts = a.split(/^([^#\|=:]+)(?:#|\||=|:)(.+)$/).slice(1, 3);
            if (argParts[0].toLowerCase() === 'type' && typesWithProps.includes(argParts[1].toLowerCase())) {
                rptArgs.type = argParts[1].toLowerCase();
            } else if (argParts[0].toLowerCase() === 'for') {
                rptArgs.ref = argParts[1];
            }
        });
        let btnRebuild = Messenger.Button({ type: '!', label: 'Rebuild', elem: `!fetchprops-rebuild${rptArgs.type && rptArgs.type.length ? ' --type=' + rptArgs.type : ''}`, css: localCSS.button });
        let tblFooter = html.table(html.tr(html.td(btnRebuild, localCSS.textright)));
        if (!args.length || !rptArgs.type) { // handle only
            tbl = html.table(
                typesWithProps.filter(t => propContainers[t]).sort().map((k, i) => html.tr(
                    html.td(k) +
                    html.td(Object.keys(propContainers[k] || {}).length) +
                    html.td(Messenger.Button({ type: '!', label: 'Props', elem: `!fetchprops --type=${k}`, css: localCSS.button }), localCSS.textright),
                    i % 2 === 1 ? localCSS.tblOddRow : {}
                )).join('')
            );
            msgbox({ title: `Fetch Props for Each Type`, whisperto: getWhisperTo(msg.who), msg: tbl, headercss: localCSS.msgheader, btn: tblFooter });
        } else { // handle with type
            let nicks = propNicks(rptArgs.type);
            tbl = html.table(
                nicks.map((props, i) => html.tr(
                    html.td(props.join('<br>')),
                    i % 2 === 1 ? localCSS.tblOddRow : {}
                )).join('')
            );
            msgbox({ title: `Fetch Props for ${rptArgs.type}`, whisperto: getWhisperTo(msg.who), msg: tbl, headercss: localCSS.msgheader, btn: tblFooter });
            /*
            nicks.forEach(props => {
                contents.push(`${props.join('%NEWLINE%')}= `); // ${Messenger.HE(propContainers[rptArgs.type][props[0]](rptArgs.object))}`);
            });
            defaultReport(rptArgs.type, contents);
            /* */
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

    // ==================================================
    //		METASCRIPT FUNCTIONALITY
    // ==================================================
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
    let scriptisplugin = false;
    // const fetch = async (m, s) => await handleInput(m, s);
    const fetch = (m, s) => handleInput(m, s);
    on('chat:message', handleInput);

    // ==================================================
    //		INITIALIZATION
    // ==================================================
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
        buildPropContainers();

        on('chat:message', handleConfig);
        on('chat:message', handlePropReport);

        scriptisplugin = (typeof ZeroFrame !== `undefined`);
        if (typeof ZeroFrame !== 'undefined') {
            ZeroFrame.RegisterMetaOp(fetch);
        }
    });
    return {
        KnownObjectTypes: knownObjectTypes,
        PropContainers: propContainers,
        CustomPropsByType: customPropsByType
    };
})();
{ try { throw new Error(''); } catch (e) { API_Meta.Fetch.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.Fetch.offset); } }
/* */
