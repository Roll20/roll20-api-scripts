/* eslint no-prototype-builtins: "off" */
/*
=========================================================
Name			:	Inspector
GitHub			:	
Roll20 Contact	:	timmaugh
Version			:	1.0.0
Last Update		:	11/07/2022
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.Inspector = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{
    try { throw new Error(''); } catch (e) { API_Meta.Inspector.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (14)); }
}

// TODO: Fix a handout panel's "gmnotes" field -- getting set to 'undefined'... because of async pull?
// TODO: Add buttons to panel's for applicable 'typefor' opportunities (player => character, player => tokens, etc.)
// TODO: Can images in the return be detected and shown? Maybe in a pop-up?

const Inspector = (() => { // eslint-disable-line no-unused-vars
    const apiproject = 'Inspector';
    const apilogo = `https://i.imgur.com/N9swrPX.png`; // black for light backgrounds
    const apilogoalt = `https://i.imgur.com/xFOQhK5.png`; // white for dark backgrounds
    const version = '1.0.0';
    const schemaVersion = 0.1;
    API_Meta[apiproject].version = version;
    const vd = new Date(1668569081210);
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
                /* falls through */

                case 'UpdateSchemaVersion':
                    state[apiproject].version = schemaVersion;
                    break;

                default:
                    state[apiproject] = {
                        settings: {
                            playersCanIDs: false,
                            playersCanUse: false
                        },
                        defaults: {
                            playersCanIDs: false,
                            playersCanUse: false
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
    const trueTypes = ['true', 't', 'yes', 'y', 'yep', 'yup', '+', 'keith', true];
    const propSanitation = (p, v) => {
        const propTypes = {
            'playersCanIDs': (p, v) => validateBoolean(p, v),
            'playersCanUse': (p, v) => validateBoolean(p, v)
        };
        const validateBoolean = (p, v) => {
            return { prop: p, val: trueTypes.includes(v) };
        };

        return Object.keys(propTypes).reduce((m, k) => {
            if (m) return m;
            if (k.toLowerCase() === p.toLowerCase()) return propTypes[k](k, v);
        }, undefined);

    };
    // ==================================================
    //		PRESENTATION
    // ==================================================
    let html = {};
    let css = {}; // eslint-disable-line no-unused-vars
    let HE = () => { };
    const syntaxHighlight = (obj, replacer = undefined, msgobj = {}) => {
        const css = {
            stringstyle: 'darkcyan;',
            numberstyle: 'magenta;',
            booleanstyle: 'orangered;',
            nullstyle: 'darkred;',
            keystyle: 'black;'
        };
        let str = '';
        if (typeof obj !== 'string') {
            str = JSON.stringify(obj, replacer, '   ');
            obj = simpleObj(obj);
        } else {
            str = obj;
            obj = JSON.parse(obj);
        }
        str = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        let olinkrx = new RegExp(`(${getAllObjs().map(o => o.id).join('|')})`, 'g');
        return str.replace(/\\n(?<!\\\\n)/g, msgobj.aboutUUID).replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, function (match) {
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
            let content = match.replace(/^"(.*)"(:?)$/g, ((m, g1, g2) => `${g1}${g2}`)).replace(/\\(.)/g, `$1`);
            content = HE(content)
                .replace(/\*/g, '&#42;')
                .replace(/((#[0-9A-Fa-f]{6}\d{2})|(#[0-9A-Fa-f]{6})|(#[0-9A-Fa-f]{3}))(?:.|$)(?<!&\1;)/gi, m => getTipForColor(m))
                .replace(olinkrx, (m, g1) => {
                    let b = Messenger.Button({ type: '!', elem: `!about --${g1}`, label: 's', css: localCSS.inlineLink });
                    let o = fuzzyGet(g1, msgobj, true);
                    let idTip = '';
                    if (o && o.obj && o.obj.length) {
                        o = o.obj[0];
                        idTip = getTipFromObjForID(o);
                    } else {
                        o = undefined;
                    }
                    // idTip = getTipFromObjForID(o);
                    return idTip ? idTip.replace(`${g1}</span>`, `${g1}${b}</span>`) : `<span style="display: inline-block">${g1}${b}</span>`;
                });
            return `<span style="color:${css[cls]}">${content}</span>`;
        })
            .replace(/gmnotes:<\/span>/, () => {
                if (obj && obj.gmnotes && obj.gmnotes.length) {
                    return `${getTip(decodeURIComponent(decodeUnicode(obj.gmnotes)), 'gmnotes', 'GM Notes')}</span>`;
                }
            }).replace(/(>statusmarkers:<\/span>\s*<span[^>]*>)(.*?)(<\/span>)/g, (m, pretag, list, posttag) => {
                let newlist = list.split(/\s*,\s*/).map(sm => {
                    let tagres = /([^&:]*?)(?:&#64;|:|$)/.exec(sm);
                    let name = tagres[1];
                    //let ltmret = libTokenMarkers.getStatus(name);
                    return getTip(libTokenMarkers.getStatus(name).getHTML(5).replace(/div/gi, 'span'), sm, name, { 'text-align': 'center' });
                }).join(', ');
                return `${pretag}${newlist}${posttag}`;
            })
            .replace(new RegExp(msgobj.aboutUUID, 'g'), '<br>');
    };
    const showObjInfo = ({
        o: o = '',
        title: title = 'PARSED OBJECT',
        replacer: replacer = undefined,
        sendas: sendas = "Inspector",
        whisperto: whisperto = "",
        headercss: headercss = {},
        bodycss: bodycss = {},
        msgobj: msgobj = {}
    } = {}) => {
        let buttons = '';
        if (libButtonsForRelatedChildren.hasOwnProperty(o._type)) {
            buttons = html.div(Object.keys(libButtonsForRelatedChildren[o._type]).map(k => libButtonsForRelatedChildren[o._type][k](o)).join(' '));
        }
        msgbox({
            title: title,
            msg: html.pre(syntaxHighlight(o || '', replacer, msgobj).replace(/\n/g, '<br>')) + buttons,
            sendas: sendas,
            whisperto: whisperto,
            headercss: headercss,
            bodycss: bodycss
        });
        return;
    };
    const theme = {
        primaryColor: '#222d3a',
        primaryLightColor: '#ededed',
        baseTextColor: '#232323',
        secondaryColor: '#82b9b9'
    };
    let localCSS = {
        inlineEmphasis: {
            'font-weight': 'bold'
        },
        hspacer: {
            'padding-top': '4px'
        },
        textColor: {
            'color': theme.baseTextColor
        },
        pre: {
            'border': `1px solid ${theme.baseTextColor}`,
            'border-radius': '5px',
            'padding': '4px 8px',
            'margin-top': '4px'
        },
        msgbody: {
            'background-color': theme.primaryLightColor,
            'color': theme.baseTextColor
        },
        msgheader: {
            'background-color': theme.primaryColor,
            'color': theme.primaryLightColor,
            'font-size': '1.2em'
        },
        msgheadercontent: {
            'display': 'inline-block'
        },
        msgheaderlogodiv: {
            'display': 'inline-block',
            'max-height': '30px',
            'margin-right': '8px',
            'margin-top': '4px'
        },
        logoimg: {
            'background-color': 'transparent',
            'float': 'left',
            'border': 'none',
            'max-height': '30px'
        },
        infoheader: {
            'background-color': theme.primaryColor,
            'color': theme.primaryLightColor,
            'font-size': '1.2em'
        },
        infobody: {
            'background-color': theme.primaryLightColor,
            'color': theme.baseTextColor
        },
        buttoncss: {
            'padding': '4px 8px',
            'background-color': theme.primaryColor,
            'color': theme.primaryLightColor,
            'border-radius': '5px',
            'line-height': '12px',
            'font-size': '12px'
        },
        relatedLink: {
            'background-color': theme.primaryColor,
            'color': theme.primaryLightColor,
            'border-radius': '5px',
            'margin': '0px 4px',
            'line-height': '12px',
            'font-family': 'pictos',
            'font-size': '18px',
            'text-align': 'center',
            'width': '24px',
            'height': '12px',
            'vertical-align': 'middle'
        },
        inlineLink: {
            'background-color': theme.secondaryColor,
            'color': theme.primaryLightColor,
            'padding': '1px 1px 2px 3px',
            'border-radius': '5px',
            'margin': '0px 1px 0px 3px',
            'line-height': '.95em',
            'font-family': 'pictos'
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
            'font-size': '12px'
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
            'min-height': '40px',
            'margin-left': '3px',
            'background-image': `url('${apilogoalt}')`,
            'background-repeat': 'no-repeat',
            'backgound-size': 'contain',
            'width': '37px',
            'display': 'inline-block'
        },
        tipContentLine: {
            'overflow': 'hidden',
            'display': 'table',
            'background-color': theme.primaryLightColor,
            'width': '100%'
        },
        tipContent: {
            'display': 'table-cell',
            'overflow': 'hidden',
            'padding': '5px 8px',
            'text-align': 'left',
            'color': '#232323',
            'background-color': theme.primaryLightColor
        },
        tipHeaderTitle: {
            'display': 'table-cell',
            'overflow': 'hidden',
            'padding': '5px 8px',
            'text-align': 'left',
            'color': theme.primaryLightColor,
            'font-size': '1.2em',
            'vertical-align': 'middle',
            'font-weight': 'bold'
        }
    };
    const getTipFromObjForID = (obj) => {
        let o = simpleObj(obj);
        let contents = validTypes[o._type](o);
        let tipHeader = contents.header || 'Info';
        let formattedContent = Object.keys(contents)
            .filter(k => !['header', 'id'].includes(k.toLowerCase()))
            .map(k => `&bull; <span style="font-weight:bold">${k}</span>: ${contents[k]}`)
            .join('<br>');
        return getTip(formattedContent, contents.ID, tipHeader);
    };
    const getTipForColor = (color) => {
        const localCSS = {
            colorTip: {
                'width': '100%',
                'height': '50px',
                'min-height': '50px',
                'display': 'inline-block',
                'border': '0',
                'padding': '0',
                'margin': '0 auto',
                'vertical-align': 'middle',
                'background-color': color,

            }
        };
        let content = html.span('', localCSS.colorTip);
        return getTip(content, color, color);
    };
    const getTip = (contents, label, header = 'Info', contentcss = {}) => {
        let contentCSS = Object.assign(_.clone(localCSS.tipContent), contentcss);
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
                        localCSS.tipHeaderLine) +
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
    // ==================================================
    //		UTILITIES
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
    const simpleObj = (o) => typeof o !== 'undefined' ? JSON.parse(JSON.stringify(o)) : o;
    const decodeUnicode = (str) => str.replace(/%u[0-9a-fA-F]{2,4}/g, (m) => String.fromCharCode(parseInt(m.slice(2), 16)));
    const escapePreserveLineBreaks = (s) => {
        if (s && s.length) {
            let aboutuuid = generateUUID();
            return HE(s.replace(/\n/g, aboutuuid)).replace(new RegExp(aboutuuid, 'g'), '<br>');
        }
        return s;
    };
    const validTypes = {
        'graphic': (o) => {
            return {
                header: (o._subtype || o._type).toUpperCase(),
                ID: o._id,
                Name: o.name,
                Page: (getObj('page', o._pageid) || { get: () => o._pageid || 'Unknown' }).get('name'),
                Layer: o.layer,
                Position: `(${Math.round(o.left)}, ${Math.round(o.top)})`,
                Control: [...o.controlledby.split(/\s*,\s*/),
                ...((getObj('character', o.represents) || { get: () => '' }).get('controlledby')).split(/\s*,\s*/)]
                    .map(p => p.toLowerCase() === 'all' ? 'All' : (getObj('player', p) || { get: () => p || 'Unknown' }).get('displayname')).join(', ')
            };
        },
        'character': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                Name: o.name,
                Journals: o.inplayerjournals.split(/\s*,\s*/).map(p => p.toLowerCase() === 'all' ? 'All' : (getObj('player', p) || { get: () => p || 'Unknown' }).get('displayname')).join(', '),
                Control: o.controlledby.split(/\s*,\s*/).map(p => p.toLowerCase() === 'all' ? 'All' : (getObj('player', p) || { get: () => p || 'Unknown' }).get('displayname')).join(', ')
            };
        },
        'attribute': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                Name: o.name,
                Character: (getObj('character', o._characterid) || { get: () => o._characterid || 'Unknown' }).get('name'),
                Current: escapePreserveLineBreaks(o.current),
                Max: escapePreserveLineBreaks(o.max)
            }
        },
        'ability': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                Name: o.name,
                Character: (getObj('character', o._characterid) || { get: () => o._characterid || 'Unknown' }).get('name'),
                Action: escapePreserveLineBreaks(o.action)
            }
        },
        'macro': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                Name: o.name,
                Visible: o.visibleto.split(/\s*,\s*/).map(p => p.toLowerCase() === 'all' ? 'All' : (getObj('player', p) || { get: () => p || 'Unknown' }).get('displayname')).join(', '),
                Creator: (getObj('player', o._playerid) || { get: () => o._playerid || 'Unknown' }).get('displayname'),
                Action: escapePreserveLineBreaks(o.action)
            }
        },
        'handout': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                Name: o.name,
                Journals: o.inplayerjournals.split(/\s*,\s*/).map(p => p.toLowerCase() === 'all' ? 'All' : (getObj('player', p) || { get: () => p || 'Unknown' }).get('displayname')).join(', '),
                Control: o.controlledby.split(/\s*,\s*/).map(p => p.toLowerCase() === 'all' ? 'All' : (getObj('player', p) || { get: () => p || 'Unknown' }).get('displayname')).join(', '),
            }
        },
        'rollabletable': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                Name: o.name
            }
        },
        'tableitem': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                Name: o.name,
                Table: (getObj('rollabletable', o._rollabletableid) || { get: () => o._rollabletableid || 'Unknown' }).get('name'),
                Weight: o.weight
            }
        },
        'page': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                Name: o.name,
                Height: o.height,
                Width: o.width
            }
        },
        'deck': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                Name: o.name
            }
        },
        'card': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                Name: o.name,
                Deck: (getObj('deck', o._deckid) || { get: () => o._deckid || 'Unknown' }).get('name')
            }
        },
        'hand': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                Player: (getObj('player', o._parentid) || { get: () => o._parentid || 'Unknown' }).get('displayname'),

            }
        },
        'jukeboxtrack': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                Title: o.title,
                Volume: o.volume,
                Loop: o.loop
            }
        },
        'custfx': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                Name: o.name
            }
        },
        'path': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                Page: (getObj('page', o._pageid) || { get: () => o._pageid || 'Unknown' }).get('name'),
                Layer: o.layer,
                Position: `(${Math.round(o.left)}, ${Math.round(o.top)})`,
                Type: o.barrierType,
                OneWay: o.oneWayReversed,
                Control: o.controlledby.split(/\s*,\s*/).map(p => p.toLowerCase() === 'all' ? 'All' : (getObj('player', p) || { get: () => p || 'Unknown' }).get('displayname')).join(', '),

            }
        },
        'text': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                Page: (getObj('page', o._pageid) || { get: () => o._pageid || 'Unknown' }).get('name'),
                Layer: o.layer,
                Position: `(${Math.round(o.left)}, ${Math.round(o.top)})`,
                Text: o.text || '',
                Control: o.controlledby.split(/\s*,\s*/).map(p => p.toLowerCase() === 'all' ? 'All' : (getObj('player', p) || { get: () => p || 'Unknown' }).get('displayname')).join(', '),
            }
        },
        'player': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                DisplayName: o._displayname,
                GM: playerIsGM(o._id),
                Page: getObj('page', getPageForPlayer(o)).get('name')
            }
        },
        'campaign': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                Page: (getObj('page', o.playerpageid) || { get: () => o.playerpageid || 'Unknown' }).get('name'),
                Others: Object.keys(o.playerspecificpages).map(k => `<span style="display:inline-block;">${(getObj('player', k) || { get: () => k || 'Unknown' }).get('displayname')} (${(getObj('page', o.playerspecificpages[k]) || { get: () => o.o.playerspecificpages[k] || 'Unknown' }).get('name')})</span>`)
            }
        },
        'repeating': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                List: o.list,
                RowID: o.rowid,
                SubAttr: `<br>${o.subattr.join('<br>')}`
            }
        },
        'list': (o) => {
            return {
                header: o._type.toUpperCase(),
                ID: o._id,
                Name: o.name,
                SubAttr: `<br>${o.subattr.join('<br>')}`
            }
        },
        'state key': (o) => {
            return {
                header: `STATE KEY`,
                ID: o._id,
                Name: o.name,
                SubKeys: `<br>${o.subkeys.join('<br>')}`
            }
        }
    };
    validTypes.fx = o => validTypes.custfx(o);
    validTypes.token = o => validTypes.graphic(o);
    validTypes.table = o => validTypes.rollabletable(o);
    validTypes.track = o => validTypes.jukeboxtrack(o);
    validTypes.item = o => validTypes.tableitem(o);
    const validTypeTranslator = {
        fx: 'custfx',
        table: 'rollabletable',
        track: 'jukeboxtrack',
        item: 'tableitem'
    };
    const getPageForPlayer = (p) => {
        let player;
        if (typeof p === 'string') player = getObj('player', p);
        else {
            if (p._id) player = getObj('player', p._id);
            else if (p.id) player = getObj('player', p.id);
        }
        if (!player) return;
        if (playerIsGM(player.id)) {
            return player.get('lastpage') || Campaign().get('playerpageid');
        }

        let psp = Campaign().get('playerspecificpages');
        if (psp[player.id]) {
            return psp[player.id];
        }

        return Campaign().get('playerpageid');
    };
    const getCharactersForPlayer = (p, argObj) => {
        let player;
        if (typeof p === 'string') player = getObj('player', p);
        else {
            if (p._id) player = getObj('player', p._id);
            else if (p.id) player = getObj('player', p.id);
        }
        if (!player) return;
        let limit = trueTypes.includes((argObj || { limit: false }).limit);
        let testcases = [player.id];
        let characters = findObjs({ type: 'character' });
        if (!limit && playerIsGM(player.id)) {
            return characters;
        }
        if (!limit) testcases.push('all');
        return characters.filter(c => {
            return c.get('controlledby').split(',').filter(Set.prototype.has, new Set(testcases)).length;
        });
    };
    const getTokensForPlayer = (p, argObj) => {
        let player;
        if (typeof p === 'string') player = getObj('player', p);
        else {
            if (p._id) player = getObj('player', p._id);
            else if (p.id) player = getObj('player', p.id);
        }
        if (!player) return;
        let limit = trueTypes.includes((argObj || { limit: false }).limit);
        let testcases = [player.id];
        let tokens = findObjs({ subtype: 'token' });
        if (!limit && playerIsGM(player.id)) {
            return tokens;
        }
        if (!limit) testcases.push('all');
        return tokens.filter(t => {
            return [...t.get('controlledby').split(','),
            ...((getObj('character', t.get('represents')) || { get: () => '' }).get('controlledby')).split(',')]
                .filter(Set.prototype.has, new Set(testcases)).length;
        });
    };
    const getMacrosForPlayer = (p) => {
        let player;
        if (typeof p === 'string') player = getObj('player', p);
        else {
            if (p._id) player = getObj('player', p._id);
            else if (p.id) player = getObj('player', p.id);
        }
        if (!player) return;
        return findObjs({ type: 'macro' }).filter(m => {
            return [...m.get('visibleto').split(','), m.get('playerid')].includes(player.id);
        });
    };
    const getHandoutsForPlayer = (p) => {
        let player;
        if (typeof p === 'string') player = getObj('player', p);
        else {
            if (p._id) player = getObj('player', p._id);
            else if (p.id) player = getObj('player', p.id);
        }
        if (!player) return;
        return findObjs({ type: 'handout' }).filter(m => {
            return [...m.get('inplayerjournals').split(','),
            ...m.get('controlledby').split(',')].filter(Set.prototype.has, new Set([player.id, 'all']));
        });

    };
    const getHandsForPlayer = (p) => {
        let player;
        if (typeof p === 'string') player = getObj('player', p);
        else {
            if (p._id) player = getObj('player', p._id);
            else if (p.id) player = getObj('player', p.id);
        }
        if (!player) return;
        return findObjs({ type: 'hand', parentid: player.id });
    };
    const getCardsForPlayer = (p) => {
        let player;
        if (typeof p === 'string') player = getObj('player', p);
        else {
            if (p._id) player = getObj('player', p._id);
            else if (p.id) player = getObj('player', p.id);
        }
        if (!player) return;
        return findObjs({ type: 'graphic', subtype: 'card' }).filter(c => {
            return [...c.get('controlledby').split(',')].filter(Set.prototype.has, new Set([player.id, 'all']));
        });
    };
    const getRepeatingForCharacter = (p, argObj) => {
        if (!argObj.list) return;
        let rpt = findObjs({ type: 'attribute' })
            .filter(c => c.get('characterid') === p._id)
            .reduce((m, c) => {
                let rptres = /^repeating_([^_]*?)_([^_]*?)_(.+)$/i.exec(c.get('name'));
                if (!rptres || rptres[1].toLowerCase() !== argObj.list.toLowerCase()) return m;
                let rowname = (m[rptres[2]] || { _id: '' })._id;
                if (/name/i.test(rptres[3])) rowname = c.get('current');
                m[rptres[2]] = {
                    _id: rowname,
                    list: rptres[1],
                    rowid: rptres[2],
                    _type: 'repeating',
                    subattr: [...new Set([...(m[rptres[2]] || { subattr: [] }).subattr, rptres[3]])],
                    button: `!about --${rptres[2]}`
                };
                return m;
            }, {});
        return Object.keys(rpt).map(k => rpt[k]);
    };
    const getListsForCharacter = (p) => {
        return [...new Set(
            findObjs({ type: 'attribute' })
                .filter(c => c.get('characterid') === p._id && /^repeating_([^_]*?)_([^_]*?)_(.+)$/i.test(c.get('name')))
                .map(c => /^repeating_([^_]*?)_([^_]*?)_(.+)$/i.exec(c.get('name'))[1]))
        ].map(c => {
            return {
                name: c,
                _id: c,
                type: 'list',
                _type: 'list',
                subattr: [...new Set(
                    findObjs({ type: 'attribute' })
                        .filter(a => new RegExp(`^repeating_${escapeRegExp(c)}_([^_]*?)_(.+)$`, 'i').test(a.get('name')))
                        .map(a => new RegExp(`^repeating_${escapeRegExp(c)}_([^_]*?)_(.+)$`, 'i').exec(a.get('name'))[2])
                )],
                button: `!about --typefor type=repeating for=${p.name} list=${c}`
            }
        });
    };
    const getAllRepeating = () => {
        return findObjs({ type: 'attribute' }).filter(c => /^repeating_([^_]*?)_([^_]*?)_(.+)$/i.test(c.get('name')));
    };
    const getAllRepIDs = (r) => {
        return [...new Set([...r.map(c => /^repeating_([^_]*?)_([^_]*?)_(.+)$/i.exec(c.get('name'))[2])])];
    };
    const libButtonsForRelatedChildren = {
        page: {
            player: (p) => Messenger.Button({ type: '!', elem: `!about --typefor type=player for=${p.name}`, label: html.tip('U', 'Players'), css: localCSS.relatedLink }),
            token: (p) => Messenger.Button({ type: '!', elem: `!about --typefor type=token for=${p.name}`, label: html.tip('g', 'Tokens'), css: localCSS.relatedLink }),
            graphic: (p) => Messenger.Button({ type: '!', elem: `!about --typefor type=graphic for=${p.name}`, label: html.tip('P', 'Graphics'), css: localCSS.relatedLink }),
            path: (p) => Messenger.Button({ type: '!', elem: `!about --typefor type=path for=${p.name}`, label: html.tip('Y', 'Paths'), css: localCSS.relatedLink }),
            text: (p) => Messenger.Button({ type: '!', elem: `!about --typefor type=text for=${p.name}`, label: html.tip('n', 'Text'), css: localCSS.relatedLink })
        },
        table: {
            tableitem: (p) => Messenger.Button({ type: '!', elem: `!about --typefor type=tableitem for=${p.name}`, label: html.tip('l', 'Items'), css: localCSS.relatedLink })
        },
        character: {
            token: (p) => Messenger.Button({ type: '!', elem: `!about --typefor type=token for=${p.name}`, label: html.tip('g', 'Tokens'), css: localCSS.relatedLink }),
            attribute: (p) => Messenger.Button({ type: '!', elem: `!about --typefor type=attribute for=${p.name}`, label: html.tip('@', 'Attributes'), css: { ...localCSS.relatedLink, ...{ 'font-family': 'Arial', 'font-size': '13px' } } }),
            ability: (p) => Messenger.Button({ type: '!', elem: `!about --typefor type=ability for=${p.name}`, label: html.tip('%', 'Abilities'), css: { ...localCSS.relatedLink, ...{ 'font-family': 'Arial', 'font-size': '13px' } } }),
            list: (p) => Messenger.Button({ type: '!', elem: `!about --typefor type=list for=${p.name}`, label: html.tip('l', 'Repeating Lists'), css: localCSS.relatedLink }),
        },
        list: {
            repeating: (p) => Messenger.Button({ type: '!', elem: p.button, label: html.tip('l', 'List Items'), css: localCSS.relatedLink })
        },
        player: {
            mycharacters: (p) => Messenger.Button({ type: '!', elem: `!about --typefor limit=true type=character for=${p._displayname}`, label: html.tip('U', 'My Characters'), css: { ...localCSS.relatedLink, ...{ 'color': theme.secondaryColor } } }),
            character: (p) => Messenger.Button({ type: '!', elem: `!about --typefor type=character for=${p._displayname}`, label: html.tip('U', 'Characters'), css: localCSS.relatedLink }),
            mytokens: (p) => Messenger.Button({ type: '!', elem: `!about --typefor limit=true type=token for=${p._displayname}`, label: html.tip('g', 'My Tokens'), css: { ...localCSS.relatedLink, ...{ 'color': theme.secondaryColor } } }),
            token: (p) => Messenger.Button({ type: '!', elem: `!about --typefor type=token for=${p._displayname}`, label: html.tip('g', 'Tokens'), css: localCSS.relatedLink }),
            macro: (p) => Messenger.Button({ type: '!', elem: `!about --typefor type=macro for=${p._displayname}`, label: html.tip('e', 'Macros'), css: localCSS.relatedLink }),
            handout: (p) => Messenger.Button({ type: '!', elem: `!about --typefor type=handout for=${p._displayname}`, label: html.tip('N', 'Handouts'), css: localCSS.relatedLink }),
            hand: (p) => Messenger.Button({ type: '!', elem: `!about --typefor type=hand for=${p._displayname}`, label: html.tip('|', 'Hands'), css: localCSS.relatedLink }),
            card: (p) => Messenger.Button({ type: '!', elem: `!about --typefor type=card for=${p._displayname}`, label: html.tip('k', 'Cards'), css: localCSS.relatedLink }),
        }
    }
    const libRelatedChildren = { // p will be a simpleObj
        page: {
            token: (p) => findObjs({ subtype: 'token' }).filter(c => c.get('pageid') === p._id),
            graphic: (p) => findObjs({ type: 'graphic' }).filter(c => c.get('pageid') === p._id),
            path: (p) => findObjs({ type: 'path' }).filter(c => c.get('pageid') === p._id),
            text: (p) => findObjs({ type: 'text' }).filter(c => c.get('pageid') === p._id),
            player: (p) => findObjs({ type: 'player' }).filter(c => getPageForPlayer(c) === p._id)
        },
        table: {
            tableitem: (p) => findObjs({ type: 'tableitem' }).filter(c => c.get('rollabletableid') === p._id)
        },
        character: {
            attribute: (p) => findObjs({ type: 'attribute' }).filter(c => c.get('characterid') === p._id),
            ability: (p) => findObjs({ type: 'ability' }).filter(c => c.get('characterid') === p._id),
            token: (p) => findObjs({ subtype: 'token' }).filter(c => c.get('represents') === p._id),
            list: getListsForCharacter,
        },
        list: {
            repeating: getRepeatingForCharacter
        },
        player: {
            character: getCharactersForPlayer,
            token: getTokensForPlayer,
            macro: getMacrosForPlayer,
            handout: getHandoutsForPlayer,
            hand: getHandsForPlayer,
            card: getCardsForPlayer,
        }
    };
    const getParentsForChildrenOfType = t => {
        return Object.keys(libRelatedChildren).filter(pk => libRelatedChildren[pk].hasOwnProperty(t));
    };
    const reduceByType = (ret) => {
        if (!ret) return;
        ret.bytype = ret.bytype || {};
        ret.obj = ret.obj.map(o => {
            o = simpleObj(o);
            let type = o._type;
            if (type === 'player' && playerIsGM(o._id)) type += ' (gm)';
            //            ret.bytype[o._type] = [...(ret.bytype[o._type] || []), o];
            ret.bytype[type] = [...(ret.bytype[type] || []), o];
            return o;
        });
        return ret;
    };
    const getUnknown = (query, msg, onlyfirst = true) => {
        let ret = lexicalGet(query, msg);
        ret = ret || fuzzyGet(query, msg, onlyfirst);
        return ret || { fail: true, reason: 'notfound' };
    }
    const lexicalGet = (query, msg) => {
        let ret;
        let res;
        const types = Object.keys(validTypes);
        const canIds = playerIsGM(msg.playerid) || manageState.get('playersCanIDs');
        let optionrx = /([^\s=/]+)=((?:=(?<=\/=)|[^=])*?)(?=(?:[^\s=/]+=.*|$))/g;

        if (/state(\.|$)/i.test(query)) {
            if (!canIds) return { fail: true, reason: 'canids' };
            if (/state$/i.test(query)) {
                ret = reduceByType({
                    name: query,
                    obj: Object.keys(state)
                        .map(k => {
                            return {
                                name: k,
                                _id: `${k}`,
                                _type: 'state key',
                                subkeys: Object.keys(state[k]).map(sk => `${sk} (${typeof state[k][sk]})`),
                                button: `!about --state.${k}`
                            }
                        })
                });
            } else {
                res = [query.split('.').slice(1)
                    .reduce((m, k) => {
                        if (m) m = m[k];
                        return m;
                    }, state)];
                if (res[0]) ret = { name: query, obj: res };
                else ret = { fail: true, reason: 'notfound' };
            }
        } else if (/^(msg|message)/i.test(query)) {
            ret = { name: 'Message', obj: [msg] };
        } else if (/^(inline|inlinerolls?|rolls)/i.test(query)) {
            ret = msg.inlinerolls && msg.inlinerolls.length ? { name: 'Rolls', obj: [msg.inlinerolls] } : { fail: true, reason: 'msgpart' };
        } else if (/^selected/i.test(query)) {
            ret = msg.selected && msg.selected.length ? { name: 'Selected', obj: [msg.selected] } : { fail: true, reason: 'msgpart' };
        } else if (/^\$\[\[(\d+)]]/.test(query)) {
            res = /^\$\[\[(\d+)]]/.exec(query);
            ret = msg.inlinerolls && msg.inlinerolls.length > res[1] ? msg.inlinerolls[res[1]] : undefined;
            if (ret) ret = { name: `Roll ${res[1]} (${msg.inlinerolls[res[1]].expression})`, obj: [ret] };
        } else if (/^type\s+([^\s]+.*)/i.test(query)) {
            res = /^type\s+([^\s]+.*)/i.exec(query)[1]
                .split(/\s+/)
                .map(t => t.toLowerCase())
                .filter(t => types.includes(t))
                .map(t => [...findObjs({ type: validTypeTranslator[t] || t }), ...findObjs({ subtype: validTypeTranslator[t] || t })])
                .reduce((m, t) => [...m, ...t], []);
            if (res.length) {
                ret = reduceByType({ name: 'By Type', obj: res });
            }
        } else if (/^typefor\s([^\s]+.*)/i.test(query)) {
            let parent;
            let children;
            let parval;
            let childval;
            let potentials;
            let potparenttypes;
            let settype;
            let argObj = {};
            /^typefor\s([^\s]+.*)/i.exec(query)[1].replace(optionrx, (m, prop, val) => {
                switch (prop.toLowerCase()) {
                    case 'type':
                        childval = val.trim();
                        break;
                    case 'for':
                        parval = val.trim();
                        break;
                    default:
                        argObj[prop.toLowerCase()] = val.trim();
                }
            });
            if (!(parval && childval)) return { fail: true, reason: 'notfound' };
            // childval = types.filter(t => t === childval.toLowerCase())[0];
            childval = validTypeTranslator[childval.toLowerCase()] || childval.toLowerCase();
            potentials = fuzzyGet(parval, msg, false);
            if (!potentials || !potentials.obj.length) return { fail: true, reason: 'notfound' };
            if (potentials.bytype.hasOwnProperty('player (gm)')) potentials.bytype.player = [...(potentials.bytype.player || []), ...potentials.bytype['player (gm)']];
            if (potentials.obj.length === 1) {
                parent = potentials.obj[0];
                settype = childval === 'repeating' && argObj.list ? 'list' : parent._type;
            } else {
                potparenttypes = getParentsForChildrenOfType(childval);
                settype = childval === 'repeating' && argObj.list && potentials.bytype.hasOwnProperty('character') ? 'list' : Object.keys(potentials.bytype).filter(k => potparenttypes.includes(k))[0];
                if (settype) {
                    if (settype === 'list') parent = potentials.bytype.character[0];
                    else parent = potentials.bytype[settype][0];
                }
            }

            if (parent && libRelatedChildren[settype] && libRelatedChildren[settype][childval] && typeof libRelatedChildren[settype][childval] === 'function') {
                children = libRelatedChildren[settype][childval](parent, argObj);
                ret = reduceByType({ name: `${settype === 'list' ? argObj.list.toUpperCase() : childval.toUpperCase()}(S) FOR ${parval.toUpperCase()}`, obj: children });
            } else ret = { fail: true, reason: 'notfound' };
        } else {
            if (!msg.allRepeating) msg.allRepeating = getAllRepeating();
            if (getAllRepIDs(msg.allRepeating).includes(query)) {
                let queryrx = new RegExp(`repeating_([^_]*?)_${query}_(.+)$`, 'i');
                let children = msg.allRepeating.filter(c => queryrx.test(c.get('name')));
                let parent = simpleObj(getObj('character', children[0].get('characterid')));
                let thelist = queryrx.exec(children[0].get('name'))[1];
                ret = reduceByType({ name: `${thelist.toUpperCase()} ENTRY FOR ${parent.name.toUpperCase()}`, obj: children });
            }
        }
        return ret;
    };

    const fuzzyGet = (query, msg, onlyfirst = true) => {
        let ret;
        let res;
        const validProps = ['name', 'title', 'text', 'displayname'];
        const canIds = playerIsGM(msg.playerid) || manageState.get('playersCanIDs');
        if (canIds) validProps.unshift('id');
        while (validProps.length) {
            if (onlyfirst && ret) break;
            const prop = validProps.shift();
            res = findObjs({ [prop]: query });
            if (res.length) {
                if (!ret) ret = { name: query, obj: res };
                else ret.obj = [...ret.obj, ...res];
            }
        }
        ret = reduceByType(ret);
        return ret;
    };
    const failHandler = (wto, altmsg = 'default') => {
        const messages = {
            canids: 'You must be a GM or have your GM enable the playerCanIds setting for Inspector to use this feature.',
            notfound: 'Unable to find an object using the parameters supplied. Please try again.',
            default: 'You must be a GM or have your GM enable the playersCanUse setting for Inspector to use this feature.',
            msgpart: 'Message does not contain that component. Please try again.'
        };
        messages.notfoundid = `${messages.notfound} If you were searching by ID, it is possible that the object exists, but Inspector is not currently configured to allow players to use IDs. Your GM can enable this feature, if needed.`
        altmsg = Object.keys(messages).map(k => k.toLowerCase()).includes(altmsg.toLowerCase()) ? altmsg.toLowerCase() : 'default';
        msgbox({ msg: messages[altmsg], title: 'Inspection Failed', whisperto: wto });
    };
    const msgbox = ({
        msg: msg = '',
        title: title = '',
        headercss: headercss = localCSS.msgheader,
        bodycss: bodycss = localCSS.msgbody,
        sendas: sendas = 'Inspector',
        whisperto: whisperto = '',
        footer: footer = '',
        btn: btn = '',
    } = {}) => {
        if (title) title = html.div(html.div(html.img(apilogoalt, 'Inspector Logo', localCSS.logoimg), localCSS.msgheaderlogodiv) + html.div(title, localCSS.msgheadercontent), {});
        Messenger.MsgBox({ msg: msg, title: title, bodycss: bodycss, sendas: sendas, whisperto: whisperto, footer: footer, btn: btn, headercss: headercss, noarchive: true });
    };
    const helpPanel = (wto) => {
        msgbox({
            title: 'Inspector Help',
            msg: html.h2(`Help`, localCSS.textColor) +
                `${html.span(`Inspector`, localCSS.inlineEmphasis)} is designed to help you easily look at objects in your game and view their properties. ` +
                `Search by id, name, type, or other specialized parameters. All objects answering to that identifying piece of information will be reported, allowing you to examine them more closely. ` +
                `Roll20 object IDs are detected in the output and turned into links so that you can navigate from one object to a related object easily. ` +
                `Here are the particulars of the script's use. ` +
                html.h3('Command Line', localCSS.textColor, localCSS.hspacer) +
                `Use ${html.span('!about', localCSS.inlineEmphasis)} followed by arguments of the things you want to inspect. Arguments should be set off with double hyphens:` +
                html.pre('!about --Kraang the Conciliatory', localCSS.pre) +
                `Multiple arguments can be included. Each will produce a panel of returns.` +
                html.pre('!about --Fire Ball --Kraang the Really Quite Agreeable', localCSS.pre) +
                html.h3('Returns', localCSS.textColor, localCSS.hspacer) +
                `If your argument returns a single thing, you will see a detailed breakdown of the way that object is structured in your game, allowing you to pinpoint a particular property name or check ` +
                `the value as it is stored in the object. Certain datapoints (Roll20 IDs, recognizable hex color strings, and token marker names) are formatted to have a hover tip providing you more ` +
                `information very quickly. Also, the Roll20 IDs that are present in the output are also paired with a link to let you pull up that object in Inspector for a for detailed examination.<br><br>` +
                `If, on the other hand,  you get a number of returns for your search criteria, they will be presented by category of the object. For instance, the command line:` +
                html.pre('!about --Kraang the No Idea Is a Bad Idea Leader', localCSS.pre) +
                `Might produce a return for a character going by that name, as well as all tokens representing this super-progressive character (and thus sharing a name).` +
                html.h4('Extended Returns', localCSS.textColor, localCSS.hspacer) +
                `Some items are related to each other in the game even though they might not show up on the initial property panel as directly attached as a javascript property. You will see these returns ` +
                `represented in the returns panel as buttons at the bottom. They include such relationships as attributes, abilities, repeating lists, or tokens for a character, characters for a player, tokens ` +
                `for a page, etc. Each of the buttons has a hover-tip to tell you what it represents, if the chosen icon is not clear enough. (See ${html.span('TextFor', localCSS.inlineEmphasis)}, for more information)` +
                html.h4('Return Types', localCSS.textColor, localCSS.hspacer) +
                `For the most part, the returned types represent object types in a Roll20 game. In an effort to present more information, Inspector deviates from this in one or two places. ` +
                `First, there is no discrete Roll20 object for a repeating ${html.span('list', localCSS.inlineEmphasis)}, nor for ${html.span('repeating', localCSS.inlineEmphasis)} as an object type separate from ` +
                `an ${html.span('attribute', localCSS.inlineEmphasis)}, nor is there a foreign-key-style relationship between a list and an entry on that list, nor between a list entry and the various sub-attributes ` +
                `that are a part of that entry (the relationship is a bit more complex than that). Similarly, there is no object-level distinction between a ${html.span('player', localCSS.inlineEmphasis)} object ` +
                `who is a GM versus one who is not. All of this data can be determined, however, and Inspector is built to allow you to flow between these related objects.` +
                html.h3('Argument Types', localCSS.textColor, localCSS.hspacer) +
                `You have a few options for what to use in an argument. And since every argument produces a different panel of returns, they need not be related.` +
                html.h4('General Text', localCSS.textColor, localCSS.hspacer) +
                `Text not recognized as one of the special arguments below will be used as search criteria across all objects in your game. Inspector will look for matches in the ` +
                `${html.span('id', localCSS.inlineEmphasis)}, ${html.span('name', localCSS.inlineEmphasis)}, ${html.span('displayname', localCSS.inlineEmphasis)} (for players), ${html.span('title', localCSS.inlineEmphasis)} (for jukebox tracks), ` +
                `or ${html.span('text', localCSS.inlineEmphasis)} (for text objects) properties. (At this point, your supplied criteria must match fully what is in the property. Perhaps at some point ` +
                `in the future Inspector will be able to perform partial matches.)` +
                html.h4('Message', localCSS.textColor, localCSS.hspacer) +
                `Use ${html.span('message', localCSS.inlineEmphasis)} or ${html.span('msg', localCSS.inlineEmphasis)} to look at this message.` +
                html.pre('!about --message', localCSS.pre) +
                `This is helpful if you want to see the way a message comes structured from Roll20, including any rolls or selected tokens. Remember, messages are handed off from script ` +
                `to script, so by the time Inspector sees the message it may have been altered by other scripts (especially metascripts).` +
                html.h4('Selected', localCSS.textColor, localCSS.hspacer) +
                `Use ${html.span('selected', localCSS.inlineEmphasis)} to specifically see the data in the message object for any selected tokens.` +
                html.pre('!about --selected', localCSS.pre) +
                html.h4('Rolls', localCSS.textColor, localCSS.hspacer) +
                `Use any of ${html.span('rolls', localCSS.inlineEmphasis)}, ${html.span('inline', localCSS.inlineEmphasis)}, or ${html.span('inlinerolls', localCSS.inlineEmphasis)} to ` +
                `view the inline rolls that are a part of the message. The rolls can be included almost anywhere in the command line, from just after the script handle to after the ${html.span('rolls', localCSS.inlineEmphasis)} handle:` +
                html.pre(`!about ${HE('[[2d20kh1]]')} --rolls <br>!about --rolls ${HE('[[ 1d[[2d20kl1]] ]]')}`, localCSS.pre) +
                `It also works to put an inline roll as the argument, itself, to see that roll expanded in its own panel:` +
                html.pre(`!about --${HE('[[2d20kl1]]')}`, localCSS.pre) +
                html.h4('State', localCSS.textColor, localCSS.hspacer) +
                `A game's state is where data that requires tracking between sessions or sandbox reboots is stored. It is the most permanent storage available to a script, so scripters often use it for user preferences, script configurations, or caching. ` +
                `You can get a look at the state (or component parts of it) by using the word ${html.span('state', localCSS.inlineEmphasis)}.` +
                html.pre(`!about --state<br>`, localCSS.pre) +
                `Depending on the number of scripts you have installed and how much the developers responsible for those scripts have utilized the state object, you might have quite a sizable return. In that case, ` +
                `you might wish to see a smaller section of the state. You can use dot notation to drill down to properties attached to the state object, narrowing the scope of your returns:` +
                html.pre(`!about --state.Inspector<br>!about --state.Inspector.settings`, localCSS.pre) +
                html.h4('Type', localCSS.textColor, localCSS.hspacer) +
                `The keyword ${html.span('type', localCSS.inlineEmphasis)} gives you the opportunity to return all things associated with one or more Roll20 object types. Include the types ` +
                `you want to search for after a space, and separate each with a space:` +
                html.pre(`!about --type player<br>!about --type character token`, localCSS.pre) +
                `For these searches, you will very likely have more than one return, so you will see the panel of categorized results showing the objects Inspector found. ` +
                `Use the ${html.span('View', localCSS.inlineEmphasis)} button to view a more detailed breakdown of an individual object.` +
                `The following types are recognized:` +
                html.pre(`ability<br>attribute<br>campaign<br>card<br>character<br>custfx        (also: fx)<br>deck<br>graphic<br>hand<br>handout<br>jukeboxtrack  (also: track)<br>list<br>` +
                    `macro<br>page<br>path<br>player<br>repeating<br>rollabletable (also: table)<br>tableitem     (also: item)<br>text<br>token`, localCSS.pre) +
                html.h4('TypeFor', localCSS.textColor, localCSS.hspacer) +
                `The ${html.span('typefor', localCSS.inlineEmphasis)} keyword lets you build object lists from objects that are related by game context, if not directly by property attachment. ` +
                `This could include tokens on a page, or characters for a player. The full set of ${html.span('typefor', localCSS.inlineEmphasis)} combinations is given, below. To use them, begin the ` +
                `argument with ${html.span('typefor', localCSS.inlineEmphasis)}, followed by the sub-parts ${html.span('for', localCSS.inlineEmphasis)} and ${html.span('type', localCSS.inlineEmphasis)} ` +
                `set equal to the appropriate value: ` +
                html.pre(`!about --typefor type=player for=Start<br>!about --typefor type=token for=Kraang Gifter of Office Mints`, localCSS.pre) +
                `In the first one, you would be asking for players currently on the Start page. The second example asks for tokens associated with the ever-more-benevolent Kraang.<br><br>` +
                `For certain combinations (such as entries on a repeating list), a third argument, ${html.span('list', localCSS.inlineEmphasis)}, is required:` +
                html.pre(`!about --typefor type=repeating list=traits for=Kraang Bringer of Bagels`, localCSS.pre) +
                `It does not matter in which order the sub-arguments come. The ${html.span('type', localCSS.inlineEmphasis)} sub-argument should be singular, and the ${html.span('for', localCSS.inlineEmphasis)} ` +
                `sub-argument should be a way to identify a parent object.` +
                html.h5(`TypeFor Combinations`, localCSS.textColor, localCSS.hspacer) +
                `The following combinations will work in the ${html.span('typefor', localCSS.inlineEmphasis)} argument:` +
                html.pre(`For a character:<br> -- attribute<br> -- ability<br> -- token<br> -- list<br>` +
                    `For a page:<br> -- token<br> -- graphic<br> -- path<br> -- text<br> -- player<br>` +
                    `For a player:<br> -- character<br> -- token<br> -- macro<br> -- handout<br> -- hand<br> -- card<br>` +
                    `For a table:<br> -- tableitem<br>` +
                    `For a list:<br> -- repeating (requires list sub-argument)`, localCSS.pre) +
                html.h3('A Note About Hover Tips', localCSS.textColor, localCSS.hspacer) +
                `As mentioned, Roll20 IDs, hex color strings, and token markers are hoverable items. If the tip is attached to an object's ID, it will contain the most relevant information for that object. Colors ` +
                `and markers will show a preview. Token markers are only detected in the detailed look at a token (in the ${html.span('statusmarkers', localCSS.inlineEmphasis)} property), and in the Campaign detail ` +
                `in the ${html.span('_token_markers', localCSS.inlineEmphasis)} property.` +
                html.h2('Configuration', localCSS.textColor, localCSS.hspacer) +
                `Use the script handle ${html.span('aboutconfig', localCSS.inlineEmphasis)} to change script settings. As of this release, script arguments are not case-sensitive.` +
                html.h3('Booleans', localCSS.textColor, localCSS.hspacer) +
                `Boolean properties are set to ${html.span('true', localCSS.inlineEmphasis)} if they are set to any of the following: ${html.span('true', localCSS.inlineEmphasis)}, ${html.span('t', localCSS.inlineEmphasis)}, ` +
                `${html.span('yes', localCSS.inlineEmphasis)}, ${html.span('yep', localCSS.inlineEmphasis)}, ${html.span('yup', localCSS.inlineEmphasis)}, ${html.span('y', localCSS.inlineEmphasis)}, ` +
                `${html.span('+', localCSS.inlineEmphasis)}, or ${html.span('keith', localCSS.inlineEmphasis)}. Any other value passed will evaluate as ${html.span('false', localCSS.inlineEmphasis)}.` +
                html.h4('playersCanUse', localCSS.textColor, localCSS.hspacer) +
                `Because Inspector offers a way to glimpse game or campaign data not otherwise easily viewable, it comes pre-configured to only allow GMs to use it. You can allow players to use the script by setting ` +
                `${html.span('playersCanUse', localCSS.inlineEmphasis)} to true:` +
                html.pre('!aboutconfig --playerscanuse=keith', localCSS.pre) +
                html.h4('playersCanIDs', localCSS.textColor, localCSS.hspacer) +
                `If the players can use the script, can they search by ID? Honestly, this one is less useful given the amount of information that is presented even in hover tips, so I would suggest ` +
                `relying on the ${html.span('playersCanUse', localCSS.inlineEmphasis)} setting more than this one. However, if you find a case where you would like your players able to search only by name/text/title, ` +
                `you can control access with the ${html.span('playersCanIDs', localCSS.inlineEmphasis)} setting:` +
                html.pre('!aboutconfig --playerscanids=false', localCSS.pre) +
                html.h2(`About`, localCSS.textColor, localCSS.hspacer) +
                `${html.span(`version: ${version}`, localCSS.inlineEmphasis)}<br>This bit of scriptometry brought to you by ${html.a('timmaugh, the Metamancer', 'https://app.roll20.net/users/5962076/timmaugh')}.`
            ,
            wto: wto
        });
    };
    // ==================================================
    //		HANDLE INPUT
    // ==================================================
    const apihandles = {
        about: /^!about\b/i,
        aboutfirst: /^!aboutfirst\b/i,
        aboutconfig: /^!aboutconfig\b/i
    };
    const testConstructs = (c) => {
        return Object.keys(apihandles).reduce((m, k) => {
            if (!m.length) m = m || apihandles[k].test(c) ? k : '';
            apihandles[k].lastIndex = 0;
            return m;
        }, '');
    };
    const handleInput = (msg) => {
        if (!msg.type === 'api' || !testConstructs(msg.content).length) return;
        let wto = msg.who.replace(/\s\(gm\)$/i, '');
        if (!(playerIsGM(msg.playerid) || manageState.get('playersCanUse'))) {
            failHandler(wto);
            return;
        }
        let args = msg.content.split(/\s+--/g);
        let o;
        let table = '', rows = '';
        msg.aboutUUID = `About${generateUUID()}`;
        switch (testConstructs(msg.content)) {
            case 'aboutfirst':
                args.slice(1).forEach(a => {
                    o = getUnknown(a, msg);
                    if (!o || o.fail) failHandler(wto, (o || { reason: `notfound${!manageState.get('playersCanIDs') && !playerIsGM(msg.playerid) ? 'id' : ''}` }).reason);
                    else if (o) showObjInfo({ o: o.obj[0], title: o.name, whisperto: wto, headercss: localCSS.infoheader, bodycss: localCSS.infobody, msgobj: msg });
                    else msgbox({ msg: `No object found for ${a}.${!manageState.get('playersCanIDs') && !playerIsGM(msg.playerid) ? ' If you were searching by ID, it is possible that the object exists, but Inspector is not currently configured to allow players to use IDs. Your GM can enable this feature, if needed.' : ''}`, title: `No Object Found`, whisperto: wto });
                });
                break;
            case 'about':
                if (args.length === 1) { // no arguments means help panel
                    helpPanel(wto);
                } else {
                    args.slice(1).forEach(a => {
                        o = getUnknown(a, msg, false)
                        if (!o || o.fail) failHandler(wto, (o || { reason: `notfound${!manageState.get('playersCanIDs') && !playerIsGM(msg.playerid) ? 'id' : ''}` }).reason);
                        else if (o && o.obj && o.obj.length === 1) showObjInfo({ o: o.obj[0], title: o.name, whisperto: wto, headercss: localCSS.infoheader, bodycss: localCSS.infobody, msgobj: msg });
                        else {
                            rows = Object.keys(o.bytype).map(k => {
                                return html.tr(html.td(k.toUpperCase()) + html.td('', { width: '50px' }), { 'border-bottom': '1px solid #222d3a', 'font-size': '14px', 'font-weight': 'bold' }) + o.bytype[k].map(item => {
                                    return `${html.tr(html.td(getTipFromObjForID(item)) + html.td(Messenger.Button({ type: '!', elem: item.button || '!about --' + item._id, label: 'View', css: localCSS.buttoncss }), { width: '50px' }))}`;
                                }).join('');
                            }).join('');
                            table = html.table(rows, { width: '100%' });
                            msgbox({ msg: table, title: o.name, whisperto: wto });
                        }
                    });
                }
                break;
            case 'aboutconfig':
                if (!playerIsGM(msg.playerid)) {
                    failHandler(wto, 'canids');
                    return;
                }
                o = {};
                args.slice(1).forEach(a => {
                    if (!/([^\s=/]+)\s*=\s*(.*)/.test(a)) return;
                    let [_m, prop, val] = /([^\s=/]+)\s*=\s*(.*)/.exec(a); // eslint-disable-line no-unused-vars
                    let sanisetting = propSanitation(prop, val);
                    if (sanisetting) {
                        o[sanisetting.prop] = sanisetting.val;
                        manageState.set(sanisetting.prop, sanisetting.val);
                    }
                });
                if (Object.keys(o).length) {
                    msgbox({
                        title: 'Settings Changed',
                        whisperto: wto,
                        msg: `You made the following changes to Inspector:<br>${Object.keys(o).map(k => `&bull; <b>${k}</b> : ${o[k]}`).join('<br>')}`
                    });
                }
                break;
            default:
                return;
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

            let result = { passed: true, failures: {} };
            deps.forEach(d => {
                if (!d.mod) {
                    result.passed = false;
                    result.failures[d.name] = `Not found.`;
                    return;
                }
                if (d.version && d.version.length) {
                    //let [prop, version] = ['version', ...d.version.split('::')].slice(-2);
                    if (!(API_Meta[d.name].version && API_Meta[d.name].version.length && versionCheck(API_Meta[d.name].version, d.version))) {
                        result.passed = false;
                        result.failures[d.name] = `Incorrect version. Required v${d.version}. ${API_Meta[d.name].version && API_Meta[d.name].version.length ? `Found v${API_Meta[d.name].version}` : 'Unable to tell version of current.'}`;
                        return;
                    }
                }
                d.checks.reduce((m, c) => {
                    if (!m.passed) return m;
                    let [pname, ptype] = c;
                    if (!d.mod.hasOwnProperty(pname) || typeof d.mod[pname] !== ptype) {
                        m.passed = false;
                        m.failures[d.name] = `Incorrect version.`;
                    }
                    return m;
                }, result);
            });
            return result;
        };
        let depCheck = dependencyEngine(deps);
        if (!depCheck.passed) {
            let failures = Object.keys(depCheck.failures).map(k => `&bull; <code>${k}</code> : ${depCheck.failures[k]}`).join('<br>');
            let contents = `<span style="font-weight: bold">${apiproject}</span> requires other scripts to work. Please use the 1-click Mod Library to correct the listed problems:<br>${failures}`;
            let msg = `<div style="width: 100%;border: none;border-radius: 0px;min-height: 60px;display: block;text-align: left;white-space: pre-wrap;overflow: hidden"><div style="font-size: 14px;font-family: &quot;Segoe UI&quot;, Roboto, Ubuntu, Cantarell, &quot;Helvetica Neue&quot;, sans-serif"><div style="background-color: #000000;border-radius: 6px 6px 0px 0px;position: relative;border-width: 2px 2px 0px 2px;border-style:  solid;border-color: black;"><div style="border-radius: 18px;width: 35px;height: 35px;position: absolute;left: 3px;top: 2px;"><img style="background-color: transparent ; float: left ; border: none ; max-height: 40px" src="${typeof apilogo !== 'undefined' ? apilogo : 'https://i.imgur.com/kxkuQFy.png'}"></div><div style="background-color: #c94d4d;font-weight: bold;font-size: 18px;line-height: 36px;border-radius: 6px 6px 0px 0px;padding: 4px 4px 0px 43px;color: #ffffff;min-height: 38px;">MISSING MOD DETECTED</div></div><div style="background-color: white;padding: 4px 8px;border: 2px solid #000000;border-bottom-style: none;color: #404040;">${contents}</div><div style="background-color: white;text-align: right;padding: 4px 8px;border: 2px solid #000000;border-top-style: none;border-radius: 0px 0px 6px 6px"></div></div></div>`;
            sendChat(apiproject, `/w gm ${msg}`);
            return false;
        }
        return true;
    };

    on('ready', () => {
        versionInfo();
        assureState();
        logsig();
        let reqs = [
            {
                name: 'Messenger',
                version: `1.0.0.b3`,
                mod: typeof Messenger !== 'undefined' ? Messenger : undefined,
                checks: [['Button', 'function'], ['MsgBox', 'function'], ['HE', 'function'], ['Html', 'function']]
            },
            {
                name: 'libTokenMarkers',
                version: `0.1.2`,
                mod: typeof libTokenMarkers !== 'undefined' ? libTokenMarkers : undefined,
                checks: [['getStatus', 'function'], ['getStatuses', 'function'], ['getOrderedList', 'function']]
            }
        ];
        if (!checkDependencies(reqs)) return;
        html = Messenger.Html();
        css = Messenger.Css();
        HE = Messenger.HE;
        registerEventHandlers();
    });
    return {
        version: version
    };
})();

{ try { throw new Error(''); } catch (e) { API_Meta.Inspector.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.Inspector.offset); } }
