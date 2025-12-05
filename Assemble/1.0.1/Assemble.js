/*
=========================================================
Name            :   Assemble
GitHub          :   
Roll20 Contact  :   timmaugh
Version         :   1.0.1
Last Update     :   5 DEC 2025
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.Assemble = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.Assemble.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (12)); } }

const Assemble = (() => { // eslint-disable-line no-unused-vars
    const apiproject = 'Assemble';
    const version = '1.0.1';
    const schemaVersion = 0.1;
    API_Meta[apiproject].version = version;
    const vd = new Date(1764944902848);
    const apilogo = `https://i.imgur.com/zcfdU8n.png`;

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
    const checkInstall = () => {
        if (!state.hasOwnProperty(apiproject) || state[apiproject].version !== schemaVersion) {
            log(`  > Updating ${apiproject} Schema to v${schemaVersion} <`);
            switch (state[apiproject] && state[apiproject].version) {

                case 0.1:
                /* falls through */

                case 'UpdateSchemaVersion':
                    state[apiproject].version = schemaVersion;
                    break;

                default:
                    state[apiproject] = {
                        settings: {},
                        defaults: {},
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
    //		PRESENTATION
    // ==================================================
    let html = {};
    let HE = () => { }; // eslint-disable-line no-unused-vars
    const theme = {
        primaryColor: '#23223F',
        primaryTextColor: '#232323',
        primaryTextBackground: '#ededed',
        secondaryColor: '#607D8B',
        baseFontFamily: 'Arial',
        baseFontSize: '10pt',
        headerFontFamily: 'Contrail One',
        headerFontSize: '1.3em',
        headerColor: 'white',
        dangerColor: `#781718`, // red
        infoColor: `#1A6675`, // carribean
        safeColor: `#3E7A46`, // fern

    }
    const localCSS = {
        containerCSS: {
            'margin-left': '-8px',
            'width': 'unset',
            'position': 'relative',
            'top': '-20px',
            'display': 'block'
        },
        msgheader: {
            'background-color': theme.primaryColor,
            'color': theme.headerColor,
            'font-size': theme.headerFontSize,
            'font-family': theme.headerFontFamily,
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
        },
        btncss: {
            'background-color': theme.primaryColor,
            'border-radius': '6px',
            'text-decoration': 'none',
        },
        menubtn: {
            'background-color': theme.primaryColor,
            'border-radius': '6px',
            'width': '13px',
            'height': '14px',
            'line-height': '14px',
            'text-decoration': 'none',
            'text-align': 'center',
        },
        buttonPictos: {
            'background-color': theme.primaryColor,
            'border-radius': '6px',
            'margin': '0px 2px',
            'line-height': '14px',
            'font-family': 'pictos',
            'font-size': '12px',
            'text-align': 'center',
            'width': '13px',
            'height': '14px',
            'vertical-align': 'middle',
            'margin-top': '-2px',
            'text-decoration': 'none',
        },
        secondaryColor: {
            'background-color': theme.secondaryColor
        },
        danger: {
            'background-color': theme.dangerColor
        },
        safe: {
            'background-color': theme.safeColor
        },
        info: {
            'background-color': theme.infoColor
        },
        tipContainer: {
            'overflow': 'hidden',
            'width': '100%',
            'border': 'none',
            'max-width': '250px',
            'display': 'block'
        },
        tipBounding: {
            'border-radius': '10px',
            'border': '2px solid #000000',
            'display': 'table-cell',
            'width': '100%',
            'overflow': 'hidden',
            'font-family': theme.baseFontFamily,
            'font-size': theme.baseFontSize
        },
        tipHeaderLine: {
            'overflow': 'hidden',
            'display': 'table',
            'background-color': theme.primaryColor,
            'width': '100%'
        },
        tipLogoSpan: {
            'display': 'table-cell',
            'overflow': 'hidden',
            'vertical-align': 'middle',
            'width': '40px'
        },
        tipLogoImg: {
            'margin-left': '3px',
            'background-image': `url('${apilogo}')`,
            'background-repeat': 'no-repeat',
            'backgound-size': 'contain',
            'width': '37px',
            'height': '37px',
            'display': 'inline-block',
            'background-size': '35px',
            'vertical-align': 'middle'
        },
        tipContentLine: {
            'overflow': 'hidden',
            'display': 'table',
            'background-color': theme.primaryTextBackground,
            'width': '100%'
        },
        tipContent: {
            'display': 'table-cell',
            'overflow': 'hidden',
            'padding': '5px 8px',
            'text-align': 'left',
            'color': theme.primaryTextColor,
            'background-color': theme.primaryTextBackground
        },
        tipHeaderTitle: {
            'display': 'table-cell',
            'overflow': 'hidden',
            'padding': '5px 8px',
            'text-align': 'left',
            'vertical-align': 'middle',
            'color': theme.headerColor,
            'font-size': theme.headerFontSize,
            'font-family': theme.headerFontFamily
        },
        textleft: {
            'text-align': 'left'
        },
        textright: {
            'text-align': 'right'
        },
        textcenter: {
            'text-align': 'center'
        }
    }
    const msgbox = ({
        msg: msg = '',
        title: title = '',
        headercss: headercss = localCSS.msgheader,
        bodycss: bodycss = localCSS.msgbody,
        footercss: footercss = localCSS.msgfooter,
        sendas: sendas = 'Assemble',
        whisperto: whisperto = '',
        footer: footer = '',
        btn: btn = '',
    } = {}) => {
        if (title) title = html.div(html.div(html.img(apilogo, 'Assemble Logo', localCSS.logoimg), localCSS.msgheaderlogodiv) + html.div(title, localCSS.msgheadercontent), {});
        Messenger.MsgBox({ msg: msg, title: title, bodycss: bodycss, sendas: sendas, whisperto: whisperto, footer: footer, btn: btn, headercss: headercss, footercss: footercss, boundingcss: localCSS.boundingcss, containercss: localCSS.containerCSS, noarchive: true });
    };
    const getTip = (label, header = 'Info', contents, contentcss = {}) => {
        let contentCSS = { ...localCSS.tipContent, ...contentcss };
        return html.tip(
            label,
            html.span( // container
                html.span( // bounding
                    html.span( // header line
                        html.span( // left (logo)
                            html.span('', localCSS.tipLogoImg),
                            localCSS.tipLogoSpan) +
                        html.span( // right (content)
                            header,
                            localCSS.tipHeaderTitle),
                        localCSS.msgheader, localCSS.tipHeaderLine) +
                    html.span( // content line
                        html.span( // content cell
                            contents,
                            contentCSS),
                        localCSS.tipContentLine),
                    localCSS.tipBounding),
                localCSS.tipContainer),
            { 'display': 'inline-block' }
        );
    };

    const getWhisperTo = (who) => who.toLowerCase() === 'api'
        ? 'gm'
        : who.toLowerCase() === 'all'
            ? ''
            : who.replace(/\s\(gm\)$/i, '');
    // ==================================================
    //		UTILITIES
    // ==================================================
    const escapeRegExp = (string) => { return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); };
    const getAgnostic = query => {
        let o = findObjs({ type: 'character' }).filter(c => c.get('name') === query || c.id === query)[0] ||
            findObjs({ type: 'player', displayname: query })[0];
        if (o) {
            o.speakerType = o.get('type');
            o.localName = o.get('name') || o.get('displayname');
            o.chatSpeaker = o.speakerType + '|' + o.id;
        } else if (query.toLowerCase() === 'all') {
            o = { id: undefined, type: 'all', localName: 'all', speakerType: 'all', chatSpeaker: 'all', get: () => { return 'all'; } };
        } else {
            o = { id: undefined, type: 'gm', localName: 'gm', speakerType: 'gm', chatSpeaker: 'gm', get: () => { return 'gm'; } };
        }
        return o;
    };
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

    const isNum = (v) => +v === +v;

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
    const getToken = (info, pgid = '') => {
        let token = findObjs({ type: 'graphic', subtype: 'token', id: info })[0] ||
            findObjs({ type: 'graphic', subtype: 'card', id: info })[0] ||
            findObjs({ type: 'graphic', subtype: 'token', name: info, pageid: pgid })[0] ||
            findObjs({ type: 'graphic', subtype: 'token', pageid: pgid })
                .filter(t => t.get('represents').length && findObjs({ type: 'character', id: t.get('represents') })[0].get('name') === info)[0];
        if (!token) {
            let tokensOfName = findObjs({ type: 'graphic', subtype: 'token', name: info });
            if (tokensOfName.length === 1) {
                token = tokensOfName[0];
            }
        }
        return token;
    };
    const getAttr = (aname, char, pid) => {
        if (!(aname && aname.length) || !char) return;
        if (!char.id) char = getChar(char, pid);
        return findObjs({ type: 'attribute', characterid: char.id })
            .filter(a => a.get('name') === aname)[0];
    };
    const obtainAttr = (aname, char, pid, create = true) => {
        if (!(aname && aname.length) || !char) return;
        if (!char.id) char = getChar(char, pid);
        let attr = getAttr(aname, char, pid);
        if (!attr && create) attr = createObj('attribute', { characterid: char.id, name: aname });
        return attr;
    };

    // ==================================================
    //		DEFINITIONS & TABLES
    // ==================================================
    const posValues = ['yes', 'y', 'true', 't', 'keith', 'yep'];
    const maxAttrPrefix = `Assemble Attr: `;

    // ==================================================
    //		HANDLE INPUT
    // ==================================================
    const handleInput = (msg) => {
        /**
         * !assemble --group|[=+-] --delim| --count|[=+-]# --keep|[id,name,charid] --mode|[=,+,-] --target| --target|
         * !assemble --menu|character
         * !assemble --swapdelim| --group|
         */
        if (msg.type !== 'api' || !/^!assemble\b/.test(msg.content)) { return; }

        let args = msg.content
            .split(/\s+--/)
            .slice(1)
            .map(a => a.split(/[#=|](.*)/))
            .map(a => [a[0], /^(['`"])(.*)\1$/.test(a[1]) ? /^(['`"])(.*)\1$/.exec(a[1])[2] : a[1]])
            .filter(a => a[1] && a[1].length);

        let theSpeaker = getTheSpeaker(msg);

        let argObj = {
            delim: ',',
            keep: 'id',
            mode: '=', //overwrite
            char: undefined,
            attr: 'targets',
            count: 0,
            targets: [],
            menu: [],
            swapdelim: undefined,
            report: true,
            unique: true,
            who: theSpeaker
        };
        let modeArray = ['=', '+', '-'];
        let rxRet;
        let explicitDelim = false;
        let explicitKeep = false;
        let explicitUnique = false;
        args.forEach(a => {
            switch (a[0]) {
                case 'delim':
                    if (a[1].length) {
                        explicitDelim = true;
                        argObj.delim = a[1];
                    }
                    break;
                case 'keep':
                    if (['id', 'name', 'charid'].includes(a[1].toLowerCase())) {
                        explicitKeep = true;
                        argObj.keep = a[1].toLowerCase();
                    }
                    break;
                case 'mode':
                    if (modeArray.includes(a[1])) { argObj.mode = a[1]; }
                    break;
                case 'group':
                    if (a[1].length) {
                        rxRet = /^([+=-])?(?:([^|\r\n]+)\|)?([^|\r\n]+)$/.exec(a[1]);
                        if (rxRet[1]) argObj.mode = rxRet[1];
                        if (rxRet[2]) argObj.char = getChar(rxRet[2], msg.playerid);
                        if (rxRet[3]) argObj.attr = rxRet[3]; 
                    }
                    break;
                case 'count':
                    if (a[1].length) {
                        rxRet = /^([+=-])?(\d+)$/.exec(a[1]);
                        if (rxRet && rxRet[1]) { argObj.mode = rxRet[1]; }
                        if (rxRet && rxRet[2] && isNum(rxRet[2])) { argObj.count = parseInt(rxRet[2]); }
                    }
                    break;
                case 'target':
                    if (a[1].length) { argObj.targets.push(a[1]); }
                    break;
                case 'menu':
                    argObj.menu = getChar(a[1], msg.playerid);
                    break;
                case 'swapdelim':
                    if (a[1].length) {
                        argObj.swapdelim = a[1];
                    }
                    break;
                case 'report':
                    if (!posValues.includes(a[1])) {
                        argObj.report = false;
                    }
                    break;
                case 'unique':
                    if (!posValues.includes(a[1])) {
                        argObj.unique = false;
                        explicitUnique = true;
                    }
                    break;
                case 'who':
                    if (a[1].length) {
                        argObj.who = getAgnostic(a[1]);
                    }
                    break;
                default:
            }
        });


        // CONFIRM CHARACTER AVAILABILITY =======================================
        if ((argObj.count || argObj.targets.length) && (!argObj.char || !argObj.char.id)) {
            if (argObj.who.speakerType === 'character') {
                argObj.char = theSpeaker;
            } else {
                msgbox({
                    title: 'No Character Found',
                    msg: 'Either no character was supplied or no character matching the supplied criteria could be found.',
                    whisperto: getWhisperTo(theSpeaker.localName)
                });
                return;
            }
        } 

        // APPLY DATA TO STORAGE ATTRIBUTE ============================================
        const retFuncs = {
            id: (t) => t.id,
            name: (t) => t.get('name'),
            charid: (t) => t.get('represents')
        };
        if (argObj.char && argObj.char.id && argObj.attr && argObj.attr.length) {

            let attr = obtainAttr(argObj.attr, argObj.char, msg.playerid);
            let data;

            if (!explicitDelim && attr.get('max').length && /\(delim:([^)]+)\)/.test(attr.get('max'))) {
                argObj.delim = /\(delim:([^)]+)\)/.exec(attr.get('max'))[1];
            }
            if (!explicitKeep && attr.get('max').length && /\(keep:(id|name|charid)\)/i.test(attr.get('max'))) {
                argObj.keep = /\(keep:([^)]+)\)/.exec(attr.get('max'))[1].toLowerCase();
            }
            if (!explicitUnique && attr.get('max').length && /\(unique:([^)]+)\)/i.test(attr.get('max'))) {
                argObj.unique = /\(unique:([^)]+)\)/.exec(attr.get('max'))[1].toLowerCase();
            }

            if (argObj.swapdelim) {
                data = [...(argObj.unique ? new Set([...attr.get('current').split(argObj.delim)]) : attr.get('current').split(argObj.delim))].filter(d => d && d.length);
                argObj.delim = argObj.swapdelim;
                attr.set({ current: data.join(argObj.delim), max: `${maxAttrPrefix}(delim:${argObj.delim})(keep:${argObj.keep})` });
                msgbox({
                    title: 'Delimiter Swapped',
                    msg: `Changed delimiter for ${data.length} entries.`,
                    btn: Messenger.Button({ type: '!', elem: `!assemble --menu|${argObj.char.get('name')}`, label: 'Menu', css: [localCSS.btncss] }),
                    whisperto: getWhisperTo(argObj.who.localName)
                });
            }

            data = [...(argObj.unique ? new Set(argObj.targets) : argObj.targets)]
                .map(t => getToken(t))
                .filter(t => t && t.id)
                .map(t => retFuncs[argObj.keep](t));

            if (data.length) {
                switch (argObj.mode) {
                    case '+':
                        data = [...(argObj.unique ? new Set([...attr.get('current').split(argObj.delim), ...data]) : [...attr.get('current').split(argObj.delim), ...data])].filter(d => d && d.length);
                        break;
                    case '-':
                        data = attr.get('current').split(argObj.delim).filter(d => !data.includes(d));
                        break;
                    case '=':
                    default:
                }

                attr.set({ current: data.join(argObj.delim), max: `${maxAttrPrefix}(delim:${argObj.delim})(keep:${argObj.keep})(unique:${argObj.unique})` });

                if (argObj.report) {
                    msgbox({
                        title: 'Process Completed',
                        msg: `${argObj.mode === '+' ? 'Added' :
                            argObj.mode === '-' ? 'Removed' : 'Overwrote with'} ${data.length} entries. Current contents are shown below.` +
                            html.tag('hr', '', { 'border-top-color': theme.primaryColor }) +
                            HE(attr.get('current')),
                        btn: Messenger.Button({ type: '!', elem: `!assemble --menu|${argObj.char.get('name')}`, label: 'Menu', css: [localCSS.btncss] }),
                        whisperto: getWhisperTo(argObj.who.localName)
                    });
                }
            }

            // SEND NEW TARGETING MESSAGE =========================================
            if (argObj.count) {

                let actionText = {
                    '=': 'replace the contents of',
                    '+': 'be added to',
                    '-': 'be removed from'
                };
                let reconArgs = {
                    group: `--group|${argObj.char.get('name')}|${argObj.attr}`,
                    toArgs: (o = reconArgs) => Object.keys(o).filter(a => a !== 'toArgs').map(k => o[k]).join(' ')
                };
                if (argObj.delim !== ',') { reconArgs.delim = `--delim|'${argObj.delim}'`; }
                if (argObj.keep !== 'id') { reconArgs.keep = `--keep|${argObj.keep}`; }
                if (argObj.mode !== '=') { reconArgs.mode = `--mode|${argObj.mode}`; }
                if (!argObj.report) { reconArgs.report = `--report|no`; }
                if (!argObj.unique) { reconArgs.unique = `--unique|no`; }
                reconArgs.targets = Array(argObj.count).fill().map((a, i) => `--target|@{target|Target ${i + 1}|token_id}`).join(' ');

                let outbound = `Click the button to choose the ${argObj.count} target${argObj.count > 1 ? 's' : ''} that will ` +
                    `${actionText[argObj.mode]} the ${argObj.attr} attribute on ${argObj.char.get('name')}.`;
                let btn = Messenger.Button({ label: '&nbsp;Assemble!&nbsp;', elem: `!assemble ${reconArgs.toArgs()}`, type: 'api', css: localCSS.btncss });
                msgbox({ title: 'Targets Assemble!', msg: outbound, whisperto: getWhisperTo(argObj.who.localName), btn: btn });

            }
        }

        // SEND MENU =========================================
        if (argObj.menu && argObj.menu.id) {
            let menuAttrs = findObjs({type: 'attribute', characterid: argObj.menu.id })
                .filter(a => (new RegExp(`^${escapeRegExp(maxAttrPrefix)}`)).test(a.get('max')));

            let hdr = html.tr(
                html.th('ATTR', localCSS.textleft) + html.th('ACTIONS') // + html.th('REM') + html.th('OVER') + html.th('DELIM')
            );
            let rows = menuAttrs.map(a => {
                let locDelim = a.get('max').length && /\(delim:([^)]+)\)/.test(a.get('max'))
                    ? argObj.delim = /\(delim:([^)]+)\)/.exec(a.get('max'))[1]
                    : argObj.delim;
                let cmdStart = `!assemble --group|${argObj.menu.get('name')}|${a.get('name')} --delim|'${argObj.delim}' --keep|${argObj.keep} --unique|${argObj.unique}`;
                return html.tr(
                    html.td(getTip(a.get('name'), `${a.get('current').split(argObj.delim).length} Entries`, HE(a.get('current'))), localCSS.textleft) +
                    html.td(
                        Messenger.Button({ type: '!', elem: `${cmdStart} --mode|+ --target|@{target|Target 1|token_id}`, label: html.tip('+1', 'Add one'), css: [localCSS.menubtn, localCSS.safe] }) +
                        Messenger.Button({ type: '!', elem: `${cmdStart} --count|+?{How many targets|1|2|3|4|5|6|7|8|9|10}`, label: html.tip('+?', 'Add by query'), css: [localCSS.menubtn, localCSS.safe] }) +
                        Messenger.Button({ type: '!', elem: `${cmdStart} --mode|- --target|@{target|Target 1|token_id}`, label: html.tip('-1', 'Remove one'), css: [localCSS.menubtn, localCSS.danger] }) +
                        Messenger.Button({ type: '!', elem: `${cmdStart} --count|-?{How many targets|1|2|3|4|5|6|7|8|9|10}`, label: html.tip('-?', 'Remove by query'), css: [localCSS.menubtn, localCSS.danger] }) +
                        Messenger.Button({ type: '!', elem: `${cmdStart} --count|=?{How many targets|1|2|3|4|5|6|7|8|9|10}`, label: html.tip('=?', 'Overwrite by query'), css: [localCSS.menubtn, localCSS.secondaryColor] }) +
                        Messenger.Button({ type: '!', elem: `!assemble --group|${argObj.menu.get('name')}|${a.get('name')} --swapdelim|'?{Enter new delimiter|${locDelim}}'`, label: html.tip('y', 'Swap delimiter'), css: [localCSS.buttonPictos] })
                    )
                );
            });
            let ftr = html.tr(
                html.tdcs(Messenger.Button({
                    type: '!',
                    elem: `!assemble --group|${argObj.menu.get('name')}|?{Name for attribute} --delim|'?{List delimiter|,}' --keep|?{Save info|Token ID,id|Name,name|Character ID,charid} --unique|?{Allow Duplicates?|No,yes|Yes,no} --count|=?{How many targets?|1|2|3|4|5|6|7|8|9|10}`,
                    label: 'Create New',
                    css: [localCSS.btncss]
                }), 5, {'text-align': 'right'})
            )
            let tbl = html.table(hdr+rows.join('')+ftr,localCSS.textcenter);
            msgbox({ title: argObj.menu.get('name'), msg: tbl, whisperto: getWhisperTo(argObj.who.localName) });
        }
    };

    const registerEventHandlers = () => {
        on('chat:message', handleInput);
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

    on('ready', () => {
        versionInfo();
        logsig();
        let reqs = [
            {
                name: 'Messenger',
                version: `1.0.2`,
                mod: typeof Messenger !== 'undefined' ? Messenger : undefined,
                checks: [['Button', 'function'], ['MsgBox', 'function'], ['HE', 'function'], ['Html', 'function'], ['Css', 'function']]
            }
        ];
        if (!checkDependencies(reqs)) return;
        html = Messenger.Html();
        HE = Messenger.HE;

        assureState();
        registerEventHandlers();
    });
    return {};
})();

{ try { throw new Error(''); } catch (e) { API_Meta.Assemble.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.Assemble.offset); } }
