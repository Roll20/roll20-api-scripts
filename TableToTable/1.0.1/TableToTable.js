/*
=========================================================
Name			:	TableToTable
GitHub			:	
Roll20 Contact	:	timmaugh
Version			:	1.0.1
Last Update		:	20 JUN 2023
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.TableToTable = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.TableToTable.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (12)); } }

const TableToTable = (() => { // eslint-disable-line no-unused-vars
    const apiproject = 'TableToTable';
    const apilogo = 'https://i.imgur.com/rqEKJhJ.png';
    const apilogoalt = 'https://i.imgur.com/1Zhohx6.png';
    const version = '1.0.1';
    const schemaVersion = 0.1;
    API_Meta[apiproject].version = version;
    const vd = new Date(1687292659829);
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
        if (!state.hasOwnProperty(apiproject) || state[apiproject].version !== schemaVersion) { // eslint-disable-line no-prototype-builtins
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
    }

    // ==================================================
    //		PRESENTATION
    // ==================================================
    //let html = (Messenger || { Html: () => { return { td: () => { }, tr: () => { }, table: () => { } } } }).Html();
    let html = {};
    let css = {}; // eslint-disable-line no-unused-vars
    let HE = () => { }; // eslint-disable-line no-unused-vars
    const theme = {
        primaryColor: '#2b2b2b',
        primaryTextColor: '#232323',
        primaryTextBackground: '#ededed',
        secondaryColor: '#407f3f',
        secondaryTextColor: '#efefef',
        warningColor: '#ab2426'
    }
    const localCSS = {
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
            'background-color': theme.primaryTextBackground,
            'width': '100%'
        },
        tipHeaderTitle: {
            'display': 'table-cell',
            'overflow': 'hidden',
            'padding': '5px 8px',
            'text-align': 'left',
            'color': theme.primaryTextBackground,
            'font-size': '1.2em',
            'vertical-align': 'middle',
            'font-weight': 'bold'
        },
        tipContent: {
            'display': 'table-cell',
            'overflow': 'hidden',
            'padding': '5px 8px',
            'text-align': 'left',
            'color': theme.primaryTextColor,
            'background-color': theme.primaryTextBackground
        },
        inlineEmphasis: {
            'font-weight': 'bold'
        },
        hspacer: {
            'padding-top': '4px'
        },
        textColor: {
            'color': theme.primaryTextColor
        },
        pre: {
            'border': `1px solid ${theme.baseTextColor}`,
            'border-radius': '5px',
            'padding': '4px 8px',
            'margin-top': '4px'
        },
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
            'display': 'inline-block'
        },
        msgheaderlogodiv: {
            'display': 'inline-block',
            'max-height': '30px',
            'margin-right': '8px',
            'margin-top': '4px'
        },
        msgImageDiv: {
            'text-align': 'center',
            'margin': '8px 0px'
        },
        logoimg: {
            'background-color': 'transparent',
            'float': 'left',
            'border': 'none',
            'max-height': '30px'
        },
        interfaceButton: {
            'background-color': theme.primaryColor,
            'color': 'white',
            'border-radius': '5px',
            'font-size': '14px',
            'line-height': '14px',
            'padding': '4px 8px 6px',
            'border': '1px solid white',
            'text-decoration': 'none',
            'display': 'inline-block',
            'margin': '2px',
            'min-width': '30px',
            'text-align':'center'
        },
        titleButton: {
            'width': '60px',
            'text-align': 'center'
        },
        squareButton: {
            'width': '20px',
            'height': '20px',
            'text-align': 'center',
            'font-family': 'pictos',
            'font-size': '20px',
            'line-height': '20px',
            'color': 'white',
            'background-color': theme.primaryColor,
            'border-radius': '5px',
            'border': '1px solid white',
            'text-decoration': 'none',
            'display': 'inline-block',
            'margin': '2px',
            'padding': '4px 8px 6px',
        },
        secondaryBackgroundColor: {
            'background-color': theme.secondaryColor
        },
        pictosFont: {
            'font-family': 'pictos'
        },
        pictosCustomFont: {
            'font-family': 'pictos custom'
        },
        boundingcss: {
            'background-color': theme.primaryTextBackground
        },
        tableHeader: {
            'font-weight': 'bold',
            'background-color': theme.primaryColor,
            'color': theme.secondaryTextColor
        },
        warning: {
            'background-color': theme.warningColor
        },
        rowImage: {
            'width': '50px',
            'height': '50px'
        },
        inlineLeft: {
            'float': 'left',
            'text-align': 'left',
            'overflow': 'hidden',
            'display': 'inline-block'
        },
        inlineRight: {
            'float': 'right',
            'text-align': 'right',
            'overflow': 'hidden',
            'display': 'inline-block'
        }
    };
    const combineCSS = (origCSS = {}, ...assignCSS) => {
        return Object.assign({}, origCSS, assignCSS.reduce((m, v) => {
            return Object.assign(m, v || {});
        }, {}));
    };
    const hobutton = ({
        elem: elem = '',
        label: label = '',
        char: char = '',
        type: type = '!',
        css: css = []
    } = {}) => {
        let loccss = combineCSS(...css);
        return Messenger.HOButton({ elem: elem, label: label, type: type, char: char, css: loccss });
    };
    const msgbox = ({
        msg: msg = '',
        title: title = '',
        headercss: headercss = localCSS.msgheader,
        bodycss: bodycss = localCSS.msgbody,
        footercss: footercss = localCSS.msgfooter,
        sendas: sendas = 'T3',
        whisperto: whisperto = '',
        footer: footer = '',
        btn: btn = '',
    } = {}) => {
        if (title) title = html.div(html.div(html.img(apilogoalt, 'T3 Logo', localCSS.logoimg), localCSS.msgheaderlogodiv) + html.div(title, localCSS.msgheadercontent), {});
        Messenger.MsgBox({ msg: msg, title: title, bodycss: bodycss, sendas: sendas, whisperto: whisperto, footer: footer, btn: btn, headercss: headercss, footercss: footercss, boundingcss: localCSS.boundingcss, noarchive: true });
    };
    const createNote = (n, h = '', b = '') => {
        if (h) h = `<span style="font-weight:bold">${h}</span>: `;
        return `${b}${h}${n}`;
    }
    const createBullet = {
        normal: `<span style="color:${theme.primaryColor};font-size: 2.5em;">&bull; </span>`,
        warning: `<span style="color:${theme.warningColor};font-size: 2.5em;">&bull; </span>`,
        info: `<span style="color:#555577;font-size: 2.5em;">&bull; </span>`
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
    const libPrefix = 'https://s3.amazonaws.com/files.d20.io/images/';
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
    const getHandout = (query) => {
        return findObjs({ type: 'handout', name: query })[0] ||
            findObjs({ type: 'handout', id: query })[0];
    };
    const getTable = (n = '') => {
        return findObjs({ type: 'rollabletable', name: n })[0] || createObj('rollabletable', { name: n });
    };
    const getTableQuery = (prompt = 'Choose Table') => {
        let queryReplacement = {
            ',': '&comma;',
            '}': '&rbrace;',
            '|': '&vert;'
        };
        return `?{${prompt}|${findObjs({ type: 'rollabletable' })
            .map(t => t.get('name').replace(/\||,|}/g, m => queryReplacement[m]))
            .sort((a, b) => `${a}`.toLowerCase() < `${b}`.toLowerCase() ? -1 : 1)
            .join('|')
            }}`;
    };
    const getHandoutQuery = (prompt = 'Choose Handout') => {
        let queryReplacement = {
            ',': '&comma;',
            '}': '&rbrace;',
            '|': '&vert;'
        };
        return `?{${prompt}|${findObjs({ type: 'handout' })
            .map(t => t.get('name').replace(/\||,|}/g, m => queryReplacement[m]))
            .sort((a, b) => `${a}`.toLowerCase() < `${b}`.toLowerCase() ? -1 : 1)
            .join('|')
            }}`;
    };
    const trueTypes = ['true', 't', 'yes', 'y', 'yep', 'yup', '+', 'keith', true];
    const validateBoolean = (b) => trueTypes.includes(b);
    const getWhisperTo = (msg) => msg.who.replace(/\s\(gm\)$/i, '');
    const failFactory = (reason) => { return { fail: true, reason: reason }; };
    const findNavClosure = (s) => {
        if (!/^<div\sid="(?:userscript-)?navblock"/i.test(s)) return failFactory('Handout not setup for T3 processing. See help documentation for setup command.');
        let n = 0;
        let i = 0;
        while (((n === 0 && i === 0) || (n !== 0 && i < s.length))) {
            while (i < s.length && !/^(?:(?<open><div[^>]+?>)|(?<close><\/div>))/i.test(s.slice(i))) i++;
            if (i === s.length && n !== 0) return failFactory('DIV elements not closed');
            let tag = /^(?:(?<open><div[^>]+?>)|(?<close><\/div>))/i.exec(s.slice(i));

            if (tag.groups.open) {
                i += tag.groups.open.length;
                n++
            } else if (tag.groups.close) {
                i += tag.groups.close.length;
                n--;
            }
        }
        if (i === s.length && n !== 0) return { fail: true, reason: 'DIV elements not closed' };
        return { i: i };
    };
    const failHandler = (errObj, wto) => {
        if (!wto) wto = 'gm';
        msgbox({ msg: errObj.reason, title: 'T3 Error', whisperto: wto })
    };
    const buildLibImage = (argObj, urls = []) => {
        return urls.map(u => {
            let highlight = argObj.img && `${libPrefix}${argObj.img}` === u ? `box-shadow: 0px 0px 0px 5px #00ff00 inset;` : '';
            return `<a href="\`!t3-copy --ho=${argObj.ho} --img=${u.replace(libPrefix, '')}"><div style="overflow:hidden;display:inline-block;${highlight}"><img src="${u}" style="height:50px;width:50px;margin:5px;"></div></a>`;
        });
    };
    const clipboard = {};
    const highlightLibrary = async (argObj) => {
        let ho = getHandout(argObj.ho);
        if (!ho) return failFactory('Something went wrong. Please rebuild your library.');
        let library = [];
        let workingnotes = await new Promise(res => ho.get('notes', res));
        workingnotes.replace(/(?:\r\n|\r|\n)/g, '').replace(/<img src="([^"]*?)"/gi, (m,g1) => {
            library.push(g1);
            return m;
        });
        let newnotes = buildLibImage(argObj,library.filter(u => !/(?:thumb|original|max)\.webm\?\d*$/gi.test(u))).join('');
        ho.set({ notes: newnotes });
        return {};
    };
    // ==================================================
    //		TABLE PROCESSING
    // ==================================================
    let tablerx = /<h1.*?>(?:(append|replace|new):\s*)(.*?)<\/h1>.*?<table.*?>(.*?)<\/table>/gi;
    let gettablerx = /(<h1.*?>)(?:get:\s*)(.*?)(<\/h1>)/gi;
    let trrx = /<tr.*?>(.*?)<\/tr>/g;
    let tdstartrx = /<td.*?>/g;

    const buildCell = (content = '', ...cellcss) => {
        let ret = html.td(content, ...cellcss);
        return ret;
    };
    const buildRow = (cells, ...rowcss) => {
        let ret = html.tr(cells.join(''), ...rowcss);
        return ret;
    };
    const buildRollableRow = ({
        name: name = '',
        weight: weight = '',
        avatar: avatar = '',
        header: header = false,
        honame: honame = '' } = {}) => {
        let uuid = generateUUID();
        return buildRow(
            [
                buildCell(name, {}),
                buildCell(weight, { 'text-align': 'center' }),
                buildCell(avatar, { 'text-align': 'center' }),
                ...buildButtonCells(honame, uuid, header)
            //    buildCell(header ? 'ASSIGN AVATAR' : assignButtons(honame, uuid), { 'text-align': 'center' }),
            //    buildCell(header ? 'ROW MGT' : rowButtons(honame, uuid), { 'text-align': 'center' })
            ],
            header ? localCSS.tableHeader : {}
        );
    };
    const buildHeaderRow = () => buildRollableRow({ name: 'NAME', weight: 'WEIGHT', avatar: 'AVATAR', header: true });
    const buildTable = (rows, ...tblcss) => {
        let ret = html.table(rows.join(''), ...tblcss);
        return ret;
    };
    const buildBlankTable = (honame, rows = 4) => buildTable([buildHeaderRow(), ...Array(Math.max(1, parseInt(rows))).fill().reduce(m => {
        m.push(buildRollableRow({ honame: honame }));
        return m;
    },[])]);
    const buildTableFromData = (honame, name) => {
        let ret;
        let tbl = libTable.getItemsByIndex(name);
        if (!tbl) {
            ret = failFactory(`Couldn't find a table named ${name}.`);
            return ret;
        }
        let hr = buildHeaderRow();
        ret = buildTable([hr, ...Object.keys(tbl).map(r => buildRollableRow({ name: tbl[r].name, weight: tbl[r].weight, avatar: tbl[r].avatar.length ? html.img(tbl[r].avatar, '', localCSS.rowImage) : '', honame: honame }))]);
        return ret;
    };
    const btnTarget = (honame, uuid) => hobutton({ elem: `!t3-assign --ho=${honame} --row=${uuid} --source=@{Target|Pick source|token_id}`, label: '&oplus;', type: '!', css: [localCSS.interfaceButton, localCSS.pictosCustomFont, localCSS.secondaryBackgroundColor, { 'vertical-align': 'bottom' }] });
    const btnPaste = (honame, uuid) => hobutton({ elem: `!t3-assign --ho=${honame} --row=${uuid} --source=paste`, label: 'a', type: '!', css: [localCSS.interfaceButton, localCSS.pictosFont, localCSS.secondaryBackgroundColor, { 'vertical-align': 'bottom' }] });
    const btnRemove = (honame, uuid) => hobutton({ elem: `!t3-assign --ho=${honame} --row=${uuid}`, label: 'd', type: '!', css: [localCSS.interfaceButton, localCSS.pictosFont, localCSS.warning, { 'vertical-align': 'bottom', 'margin-left':'12px' }] });
    const btnAddRow = (honame, uuid) => hobutton({ elem: `!t3-row --ho=${honame} --row=${uuid} --type=add`, label: '&', type: '!', css: [localCSS.interfaceButton, localCSS.pictosFont, localCSS.secondaryBackgroundColor, { 'vertical-align': 'bottom' }] });
    const btnDeleteRow = (honame, uuid) => hobutton({ elem: `!t3-row --ho=${honame} --row=${uuid} --type=del`, label: '*', type: '!', css: [localCSS.interfaceButton, localCSS.pictosFont, localCSS.warning, { 'vertical-align': 'bottom', 'margin-left': '12px' }] });

    const btnWrapUnwrapTable = (honame, uuid) => hobutton({ elem: `!t3-table --ho=${honame} --table=${uuid} --type=wrap`, label: 'P', type: '!', css: [localCSS.interfaceButton, localCSS.pictosFont, { 'vertical-align': 'bottom' }] });
    const btnReProcessTable = (honame, uuid) => hobutton({ elem: `!t3-table --ho=${honame} --table=${uuid} --type=repro`, label: 'Q', type: '!', css: [localCSS.interfaceButton, localCSS.pictosFont, { 'vertical-align': 'bottom'}] });
    const btnDeleteTable = (honame, uuid) => hobutton({ elem: `!t3-table --ho=${honame} --table=${uuid} --type=del`, label: '*', type: '!', css: [localCSS.interfaceButton, localCSS.pictosFont, localCSS.warning, { 'vertical-align': 'bottom', 'margin-left': '8px' }] });

    const tblButtons = (honame, uuid) => {
        return btnReProcessTable(honame, uuid) + btnWrapUnwrapTable(honame, uuid) + btnDeleteTable(honame, uuid);
    };
    const rowButtons = (honame, uuid) => {
        return btnAddRow(honame, uuid) + btnDeleteRow(honame, uuid);
    };
    const assignButtons = (honame, uuid) => {
        return btnPaste(honame, uuid) + btnTarget(honame, uuid) + btnRemove(honame, uuid);
    };
    const buildButtonCells = (honame, uuid, header) => {
        return [
            buildCell(header ? 'ASSIGN AVATAR' : assignButtons(honame, uuid), { 'text-align': 'center' }),
            buildCell(header ? 'ROW MGT' : rowButtons(honame, uuid), { 'text-align': 'center' })
        ];

    }
    const assignToRow = async (argObj) => {
        let ho = getHandout(argObj.ho);
        if (!ho) return failFactory(`Could not find referenced handout: ${argObj.ho}`);
        let workingnotes = await new Promise(res => ho.get('notes', res));
        workingnotes = workingnotes.replace(/(<td[^>]*>)(?:<img\ssrc[^>]*>|[^<]*)(<\/td>)(?=<td[^>]*><a href="[^"]*?--row=([A-Za-z0-9_-]*))/gi, (m, opentag, closetag, uuid) => {
            if (uuid === argObj.row) return `${opentag}${argObj.source.length ? html.img(argObj.source,'',localCSS.rowImage) : ''}${closetag}`;
            return m;
        });
        ho.set({ notes: workingnotes });
    };
    const manageRows = async (argObj) => {
        let ho = getHandout(argObj.ho);
        if (!ho) return failFactory(`Could not find referenced handout: ${argObj.ho}`);
        let workingnotes = await new Promise(res => ho.get('notes', res));
        workingnotes = workingnotes.replace(/<tr[^>]*>.*?<td[^>]*><a href="[^"]*?--row=([A-Za-z0-9_-]*).*?<\/tr>/gi, (m, uuid) => {
            if (uuid === argObj.row) {
                if (argObj.type === 'add') return `${m}${buildRollableRow({ honame: argObj.ho })}`;
                else return '';
            }
            return m;
        });
        ho.set({ notes: workingnotes });
    };
    const manageTable = async (argObj) => {
        let ho = getHandout(argObj.ho);
        if (!ho) return failFactory(`Could not find referenced handout: ${argObj.ho}`);
        let workingnotes = await new Promise(res => ho.get('notes', res));
        workingnotes = workingnotes.replace(/<div\sid="(?:userscript-)?([A-Za-z0-9_-]{20})".*?<table.*?<\/table>(<p.*?<\/p>){0,1}/gi, (m, uuid) => {
            if (uuid === argObj.table) {
                if (argObj.type === 'del') return ``;
                else if (argObj.type === 'repro') return m.replace(/(<h1[^>]*>)Processed(:.*?<\/h1>)/g, `$1Replace$2`);
                else if (argObj.type === 'wrap') {
                    return m.replace(/(^.*?)(<tr.*?<\/tr>)(<\/table>.*)/i, (m, opening, rows, ending) => { // get rows of table
                        let newrows = rows.split('</tr>')
                            .slice(0,-1) // last entry will be empty (we'll add it later)
                            .map(r => r.split('</td>')); // newrows is now an array of arrays
                        if (newrows[0].length > 4) { // currently wrapped (user sees image, buttons)
                            // extract the image url in cell 2; drop the last two cells; join with the </td> tag
                            newrows = newrows.map(r => {
                                r[2] = r[2].replace(/<img.*?src\s*=\s*"(.*?)"[^>]*>/gi, `$1`);
                                r = [...r.slice(0, 3),''].join('</td>'); // have to add an empty entry to get the final </td>
                                return r;
                            });

                        } else { // currently unwrapped (user sees the image urls, no buttons)
                            // rebuild the image in cell 2; join with the </td> tag; insert the two button cells
                            newrows = newrows.map((r,i) => {
                                let rowuuid = generateUUID();
                                r[2] = r[2].replace(/https:\/\/s3[^\t\s<$]*\/(?:thumb|max|original)\.[^\t\s<$]*/gi, m => html.img(m, '', localCSS.rowImage));
                                r = r.join('</td>') + buildButtonCells(argObj.ho, rowuuid, i === 0).join('');
                                return r;
                            });

                        }
                        newrows = [...newrows, ''].join('</tr>');
                        return `${opening}${newrows}${ending}`;
                    });
                }
            }
            return m;
        });
        ho.set({ notes: workingnotes });
    };
    const setupTypes = {
        append: (honame, table = '') => {
            let uuid = generateUUID();
            let header = html.div(html.div(html.h1(`Append: ${table}`), localCSS.inlineLeft) + html.div(tblButtons(honame, uuid), localCSS.inlineRight), { 'overflow': 'hidden' }).replace(/^(<div)\s/i, `<div id="${uuid}" `);
            let ret = `${header}${buildBlankTable(honame)}${html.p('<br>')}`;
            return ret;
        },
        get: (honame, table = '') => {
            let tbl = buildTableFromData(honame, table);
            if (tbl.hasOwnProperty('fail')) return tbl;
            let uuid = generateUUID();
            let header = html.div(html.div(html.h1(`Replace: ${table}`), localCSS.inlineLeft) + html.div(tblButtons(honame, uuid), localCSS.inlineRight), { 'overflow': 'hidden' }).replace(/^(<div)\s/i, `<div id="${uuid}" `);
            let ret = `${header}${tbl}${html.p('<br>')}`;
            return ret;
        },
        new: (honame, table = '') => {
            let uuid = generateUUID();
            let header = html.div(html.div(html.h1(`New: ${table}`), localCSS.inlineLeft) + html.div(tblButtons(honame, uuid), localCSS.inlineRight), { 'overflow': 'hidden' }).replace(/^(<div)\s/i, `<div id="${uuid}" `);
            let ret = `${header}${buildBlankTable(honame)}${html.p('<br>')}`;
            return ret;
        },
        init: () => { },
        lib: () => { },
        refresh: (honame) => { return buildNavBlock(honame); }
    }
    const processSetup = async (argObj) => {
        let ho = getHandout(argObj.ho);
        let workingnotes,
            newnotes,
            library = [],
            ncIndex,
            insert,
            btn;
        switch(argObj.type.toLowerCase()) {
            case 'init': // setup workspace handout
                if ((argObj.confirm && validateBoolean(argObj.confirm)) || !ho) {
                    prepInterface(argObj.ho, argObj.wto, true);
                } else {
                    let btn = Messenger.Button({ elem: `!t3-setup --ho=${argObj.ho} --type=init --confirm=yes`, label: `Yes`, type: '!', css: localCSS.interfaceButton });
                    msgbox({ title: 'Confirm Setup Request', msg: `This will wipe the contents of the handout named ${argObj.ho}. Are you sure?`, btn: btn, whisperto: argObj.wto });
                }
                return;
            case 'lib': // setup library
                if (!ho) return failFactory('To process your library, you must create the handout and paste the links to your library images. See the help for more details.');
                if (argObj.confirm && validateBoolean(argObj.confirm)) {
                    workingnotes = await new Promise(res => ho.get('notes', res));
                    workingnotes.replace(/(?:\r\n|\r|\n)/g, '').replace(/https:\/\/s3[^\t\s<$]*\/(?:thumb|max|original)\.[^\t\s<$]*/gi, m => {
                        library.push(m);
                        return m;
                    });
                    newnotes = buildLibImage(argObj, library.filter(u => !/(?:thumb|max|original)\.webm\?\d*$/gi.test(u))).join('');
                    ho.set({ notes: newnotes });
                    btn = Messenger.Button({ elem: `http://journal.roll20.net/handout/${ho.id}`, label: `Open ${argObj.ho}`, type: 'handout', css: localCSS.interfaceButton });
                    msgbox({ title: `T3 Library Setup Report`, msg: 'Finished setting up that library.', whisperto: argObj.wto, btn: btn });
                } else {
                    btn = Messenger.Button({ elem: `!t3-setup --ho=${argObj.ho} --type=lib --confirm=yes`, label: `Yes`, type: '!', css: localCSS.interfaceButton });
                    msgbox({ title: 'Confirm Setup Request', msg: `This will wipe the contents of the handout named ${argObj.ho} and use any image URLs found there as a part of a T3 library. Are you sure?`, btn: btn, whisperto: argObj.wto });
                }
                break;
            case 'refresh': // rebuild the table query (and navblock)
                if (!ho) return failFactory('Unable to find handout with that name.');
                workingnotes = await new Promise(res => ho.get('notes', res));
                ncIndex = findNavClosure(workingnotes);
                if (ncIndex.fail) return ncIndex;
                insert = setupTypes[argObj.type.toLowerCase()](argObj.ho);
                ho.set({ notes: `${insert}${workingnotes.slice(ncIndex.i)}` });
                break;
            default:
                if (!ho) return failFactory('Unable to find handout with that name.');
                workingnotes = await new Promise(res => ho.get('notes', res));
                ncIndex = findNavClosure(workingnotes);
                if (ncIndex.fail) return ncIndex;
                insert = setupTypes[argObj.type.toLowerCase()](argObj.ho, argObj.table);
                if (insert.hasOwnProperty('fail')) return insert; // bubble up errors
                ho.set({ notes: `${workingnotes.slice(0, ncIndex.i)}${insert}${workingnotes.slice(ncIndex.i)}` });
        }
    };

    // ==================================================
    //		PREBUILT PANELS
    // ==================================================
    const panelButtonRow = (buttons) => {
        return html.div(buttons, { 'text-align': 'right', 'margin': '4px 0px' });
    };
    const controlPanel = async (wto) => {
        await prepInterface('T3 Workspace', wto, false, true);
        let hoquery = getHandoutQuery();
        let ho = getHandout('T3 Workspace');
        let btnOpenWorkspace = getTip('Open the default T3 Workspace handout to begin working on a table.', Messenger.Button({ elem: `http://journal.roll20.net/handout/${ho.id}`, label: `x`, type: 'handout', css: localCSS.squareButton }), 'T3 WORKSPACE');
        let btnMakeInterface = getTip('Make a new interface (or reset an existing one) from a handout you choose. The query for this button is built at the time you rendered this chat panel, so if you have created a new handout since then, re-run this chat panel.', hobutton({ elem: `!t3-setup --ho=${hoquery} --type=init`, label: 'W', type: '!', css: [localCSS.squareButton] }), 'MAKE INTERFACE');
        let btnMakeLibrary = getTip('Choose a handout to turn into a library. Image URLs in the handout will be re-rendered as T3 clickable images, to tie into the table interface. Choose a handout in which you have already pasted image URLs. Other content in the handout will be lost. The query for this button is built at the time you rendered this chat panel, so if you have created a new handout since then, re-run this chat panel.', hobutton({ elem: `!t3-setup --ho=${hoquery} --type=lib`, label: 'N', type: '!', css: [localCSS.squareButton] }), 'MAKE LIBRARY');
        let btnHelp = getTip('Click to view the help panel, with more information about the TableToTable script.',hobutton({ elem: `!t3-help`, label: 'i', type: '!', css: [localCSS.squareButton] }),'HELP PANEL');
        msgbox({
            title: 'T3 Control Panel',
            msg: 'What would you like to do?',
            btn: btnOpenWorkspace + btnMakeInterface + btnMakeLibrary + btnHelp,
            wto: wto
        });
    };
    const helpPanel = async (wto) => {
        await prepInterface('T3 Workspace', wto, false, true);
        let hoquery = getHandoutQuery();
        let ho = getHandout('T3 Workspace');
        let btnOpenWorkspace = getTip('Open the default T3 Workspace handout to begin working on a table.', Messenger.Button({ elem: `http://journal.roll20.net/handout/${ho.id}`, label: `x`, type: 'handout', css: localCSS.squareButton }), 'T3 WORKSPACE');
        let btnMakeInterface = getTip('Make a new interface (or reset an existing one) from a handout you choose. The query for this button is built at the time you rendered this chat panel, so if you have created a new handout since then, re-run this chat panel.', hobutton({ elem: `!t3-setup --ho=${hoquery} --type=init`, label: 'W', type: '!', css: [localCSS.interfaceButton, localCSS.squareButton] }), 'MAKE INTERFACE');
        let btnMakeLibrary = getTip('Choose a handout to turn into a library. Image URLs in the handout will be re-rendered as T3 clickable images, to tie into the table interface. Choose a handout in which you have already pasted image URLs. Other content in the handout will be lost. The query for this button is built at the time you rendered this chat panel, so if you have created a new handout since then, re-run this chat panel.', hobutton({ elem: `!t3-setup --ho=${hoquery} --type=lib`, label: 'N', type: '!', css: [localCSS.interfaceButton, localCSS.squareButton] }), 'MAKE LIBRARY');

        msgbox({
            title: 'TableToTable (T3) Help',
            msg: html.h2(`Help`, localCSS.textColor) +
                `Editing tables can be a pain. It can take forever. The steps to edit an entry are a series of discrete actions, just different enough to make you have to think about each, and which you have to chain ` +
                `together in proper sequence. Then you have to repeat that series of steps again for the next entry you want to change. ${html.span(`TableToTable`, localCSS.inlineEmphasis)} ` +
                `(or ${html.span(`T3`, localCSS.inlineEmphasis)}) aims to give you an easy interface for building, updating, trimming, or expanding your rollabletables. The basic idea is that you can ` +
                `load a table into a handout interface with much more functionality, and then from there copy/paste it into your favorite third-party software better suited for editing table-structure data. ` +
                `T3 helps you:<ul>` +
                `<li>take a Roll20 table elsewhere to edit</li>` +
                `<li>import a table to Roll20 from elsewhere</li>` +
                `<li>share a table with someone else</li>` +
                `<li>backup your tables</li>` +
                `<li>easily assign image avatars to table entries (multi-sided tokens)</li>` +
                `<li>view table entries side-by-side and quickly make adjustments</li>` +
                `<li>...more...</li>` +
                `</ul >` +
                `Here's what you need to know to get up and going.` +
                html.h3('Installation', localCSS.textColor, localCSS.hspacer) +
                `T3 is available in timmaugh's github repo, as well as (soon) the one-click library. It also has a small number of script dependencies (like Messenger and libTable) that it requires to properly function. ` +
                `If you get the script from the one-click, these will be installed automatically. If you got the script from my repo, be sure to grab the latest versions of these scripts, too. ` +
                `Once installed with all of its dependencies, T3 will automatically create your first handout interface, called ${html.span(`T3 Workspace`, localCSS.inlineEmphasis)}. If you delete it, don't worry; ` +
                `T3 will recreate it the next time the sandbox reboots or you open this help panel. Click the button to open the interface.` +
                panelButtonRow(btnOpenWorkspace) + 
                html.h3('Handout Types', localCSS.textColor, localCSS.hspacer) +
                `T3 utilizes (and can setup) 2 kinds of handouts for you to use: interfaces and libraries. Interface handouts are where you will interact with tables and port them out of and into your Roll20 game. ` +
                `Libraries are places to view image files from your Roll20 media library, and from which you can quickly assign images to a table entry in an interface. Any handout can be used for either purpose, and the ` + 
                `buttons, below, will let you pick an existing handout to use. Bear in mind that setting up a handout as an interface will overwrite the contents of that handout (you will receive a confirmation through the ` +
                `chat panel; click ${html.span(`Yes`, localCSS.inlineEmphasis)} to proceed). Also bear in mind, if you would like to set up a library, that you are actually converting the content of an existing handout. ` +
                `Make sure you understand what is required before using these buttons.` +
                panelButtonRow(btnMakeLibrary + btnMakeInterface) + 
                `You may only need one interface at any given time (you will see how to use and reuse it, below), though you could create others, especially if you and another player will need to use the script ` +
                `at the same time. You may find more of a use for having multiple library handouts prepared, as these might provide you a way to group images into a concise or discrete set.` +
                html.h3('Setting Up a Library', localCSS.textColor, localCSS.hspacer) +
                `A library presents a series of images from your Roll20 library as clickable/choosable items that makes it easier to assign them to items in tables you are currently working on in a T3 interface. Using a ` +
                `library is explained below in the discussion of interface handouts. To set a library up, paste URLs of images in your library in the body of a handout in your game. The URLs don't have to be ` +
                `the only thing in the handout, but setting up a library will consume everything in the handout and leave only the images behind. That means that you could use an existing import table script, for instance, ` +
                `and have T3 detect the URLs in the body of the text. Once the URLs are in the content of the handout, either enter the below command in chat, or simply use the ${html.span(`Make Library`, localCSS.inlineEmphasis)} ` +
                `button and choose the handout you wish to set up.` + html.pre(HE('!t3-setup --ho=<handout name here> --type=lib'), localCSS.pre) +
                `Though Roll20 scripts cannot access your Roll20 library in order to provide you a list of the images available to you, the forum thread for this script will share a way to use a bookmarket to easily capture ` +
                `all of the URL addresses for your Roll20 library.` +
                html.h3('The Interface', localCSS.textColor, localCSS.hspacer) +
                `A handout prepared as an interface will have a set of controls near the top. The controls provide the methods to execute most of the things you'll need to do.` +
                html.div(html.img('https://i.imgur.com/b2jNp8w.png', 'Interface screenshot', {}), localCSS.msgImageDiv) +
                html.h4('Navigating the Interface', localCSS.textColor, localCSS.hspacer) +
                `The set of icon buttons (level with the header) give you access to the Control Panel, the Help Panel, refreshing the table list, and resetting the interface. Each of these buttons has a hover-tip ` +
                `to better explain what they do.` +
                html.div(html.img('https://i.imgur.com/n1tdylh.png', 'Interface detail of icon row', {}), localCSS.msgImageDiv) +
                `Below these buttons are a set of buttons to help you interact with your game's rollable tables. The GET, NEW, and APPEND buttons will get a table structure added to the interface. ` + 
                html.div(html.img('https://i.imgur.com/X0RZhOY.png', 'Interface detail of buttons to interact with tables', {}), localCSS.msgImageDiv) +
                `The GET button will ask you to choose an existing rollable table and it will load up the data into a handout table. The APPEND button is similar in that it will ask you to which table you want to append ` + 
                `the new entries you will create, but it will not load up already existing data from the table you choose. The NEW button will ask you to provide the name of the rollable table you'd like to create. Note ` +
                `that NONE of these will actually alter the data in your table until you choose the PROCESS button, at the right.` +
                html.div(html.img('https://i.imgur.com/vyWCHlw.png', 'Interface detail of PROCESS button', {}), localCSS.msgImageDiv) +
                `The PROCESS button will read the contents of the interface to determine if there is any work for it to do. If it sees a Header1-formatted line saying REPLACE, APPEND, or GET, it will attempt to fill that ` +
                `request. Note that if any line is marked as a GET line, this processing pass will only perform GET operations, turning that line into a REPLACE line that will await your next press of the PROCESS button. ` +
                `Since the GET button will get the table data for you, it actually creates a REPLACE line so that you can immediately start making alterations to your data and it will be ready the next time you ` +
                `press the PROCESS button. This means that there won't actually be a GET line in the handout unless you manually add one.<br><br>` +
                `The general workflow you would most often use would be to click the GET or APPEND button, make your changes, then click the PROCESS button. At that point, you should see your changes reflected in your game's ` +
                `rollable table. The REPLACE or APPEND line will have been replaced with a line beginning PROCESSED. You will also see a chat report of the work T3 performed, including the number of items it created.` +
                html.h4('Table Buttons', localCSS.textColor, localCSS.hspacer) +
                `There are two sets of buttons for a table. Outside of the table, even with the REPLACE or APPEND line, are the table control buttons:` +
                html.div(html.img('https://i.imgur.com/6taadse.png', 'Table control buttons', {}), localCSS.msgImageDiv) +
                `The first button is used to turn a PROCESSED line back into a REPLACE line (to effectively "turn it on" again, thus the power icon), in case you see something you need to correct. For obvious reasons, you don't want to got from APPEND => PROCESSED => REPLACE, ` +
                `as that will overwrite whatever other rows were in your table originally.<br><br>` +
                `The second button (with the image icon) is called the Unwrap button, will render the table into something more easily cut-and-pastable. Images in the AVATAR column will be unwrapped to show their URLs, and the extra columns ` +
                `to the right will be removed. Use this button if you want to work in another software to make changes to your table data.<br><br>` +
                `The last button (red X) is the Delete button. It will remove this html table entry from your handout interface. Your rollable table will remain, of course.<br><br>` +
                `The second set of buttons are the row control buttons, and you will see these in every row of your table:` +
                html.div(html.img('https://i.imgur.com/O7OpA65.png', 'Table control buttons', {}), localCSS.msgImageDiv) +
                `The Assign Avatar buttons will let you add or remove an avatar from this row. The anchor icon indicates that you want to use the library image currently on your T3-clipboard (see Using a Library with an Interface). ` +
                `The reticle icon will ask you to target an existing token for the source of the image (using the standard Roll20 targeting interface). Be careful that you choose a token whose image comes from your library, ` +
                `as scripts don't have the ability to use marketplace images as the source of a token image when that token is created. Finally, the empty-set icon will remove the avatar image from that row.<br><br>` +
                `The Row Management buttons are straightforward, letting you either add a row at that position, or delete the row you are in.` + 
                html.h4('Data Validation', localCSS.textColor, localCSS.hspacer) +
                `You do not need to enter a Weight for a given row; if a weight is not supplied, it will be defaulted to a 1. Other coercions will happen to text or decimal numbers to ensure that the value of the weight ` +
                `field is an integer. Besides that, a row need only have data in ${html.span('either',localCSS.inlineEmphasis)} the Name or an Avatar fields for it to be a valid entry.` +
                html.h3('Using a Library with an Interface', localCSS.textColor, localCSS.hspacer) +
                `Once you have a library handout created with images from your library, click on those images to see a green box appear around them. This box is indicating to you that the image is now on a special clipboard ` +
                `built into the T3 script. If you then click on the anchor icon button for a row in a given table in a T3 interface, you will effectively "paste" that image into the Avatar field. To work quickly, have the handouts ` +
                `side-by-side and click from one to the other, choosing the image in your library handout and choosing the anchor button in your destination row. This should make avatar-image-designation much quicker for you, so even ` +
                `if you use a third-party software to do your table-row editing, it might be worth it to bring the table back into Roll20 to assign the images. ${html.span(`Read the Table Editing in a Different Software`, localCSS.inlineEmphasis)} ` +
                `section for more information.` +
                html.h3('Table Editing in a Different Software', localCSS.textColor, localCSS.hspacer) +
                `If you want to edit your table in another software, T3 has you covered. First load your table using the GET button, then choose the Unwrap button to render the table in a state that is ready to be copied. ` +
                `Copy the table, paste it into your other software, and make your edits/additions/deletions. When you're ready, copy your data again and return to the T3 interface of your choosing. Unfortunately, since scripts ` +
                `don't have access to your computer's clipboard, this part must be handled with a bit of manual effort.<br><br>Choose the button to Edit your handout (the Roll20 button at the top of every handout). Paste your ` +
                `table below a Header1 line that reads: ${html.span('Replace: ', localCSS.inlineEmphasis)} followed by the name of the table you want to replace. If you are working in the same handout interface from which ` +
                `you initially copied this table to your third-party software, you may need to delete the existing table and paste the new one in. Save your changes to the handout.` +
                html.h4('Your Pasted Table Will Not Have Buttons', localCSS.textColor, localCSS.hspacer) +
                `Only a table created by the interface will have the handy buttons that make working in the table easy. For that reason, at the point that you have saved your interface with the pasted table, ` +
                `you will probably need to click the PROCESS button to assign those entries to the designated table. At this point, you can clear the table (clicking the table's Delete button, if you started with one), ` +
                `or just clicking the Reset button from the top block of controls. This will give you a clean slate. Now you can choose the GET button to load the table again, this time with all of the attendant ` +
                `bells, whistles, and buttons of a T3 interface table. (Note you may need to click the Refresh button to update the list of tables that your GET button will use.)` +
                html.h4('Column Order', localCSS.textColor, localCSS.hspacer) +
                `You don't need to start in T3 to construct your table (copying and pasting from a T3 interface to your other software). You can build a table from the ground-up in your other software, then select ` +
                `and paste it into a T3 interface as mentioned. In this case, T3 will not care about the order of the columns, provided that the first row of the table indicates the header designation for which ` +
                `column is which. Use column names of 'Name', 'Weight', and 'Avatar' to have T3 recognize which column is which.` +
                html.h4('Tested Software', localCSS.textColor, localCSS.hspacer) +
                `I tested Microsoft Word, Microsoft Excel, Microsoft Access, and other HTML-table producing softwares with success (meaning T3 was able to interpret the structure of their tables). I had mixed results ` +
                `with Google Sheets (it sometimes failed to include the last cell in a click-drag selection of cells). Scrivener was right out. If you try another software that you think should work but does not, ` +
                `drop a message in the forum thread or shoot me a PM and I will see if I can update T3 to recognize what that software title produces.` +
                html.h3('Working Manually', localCSS.textColor, localCSS.hspacer) +
                `You don't actually have to use the interface T3 sets up for you. All T3 needs to function is a Header1 formatted line beginning ${html.code('Get:')}, ${html.code('Append:')}, or ${html.code('New:')}, followed  ` +
                `by the name of a table (an existing table, in the cases of Get or Append), followed by an HTML table. You could even just use the built-in table option in the handout editing interface ` +
                `to construct and enter your data. When you are ready, use the command: ` +
                html.pre(HE('!t3 --<handout name here>'), localCSS.pre) +
                `T3 will carry out the actions requested by the Header1 lines which are followed by HTML tables.` +
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
        process: /^!t3\s+--.+/i,
        setup: /^!t3-setup\s+--.+/i,
        copy: /^!t3-copy\s+--.+/i,
        control: /^!t3$/i,
        assign: /^!t3-assign\s+--.+/i,
        row: /^!t3-row\s+--.+/i,
        table: /^!t3-table\s+--.+/i,
        help: /^!t3-help/i
    };
    const testConstructs = (c) => {
        return Object.keys(apihandles).reduce((m, k) => {
            if (!m.length) m = m || apihandles[k].test(c) ? k : '';
            apihandles[k].lastIndex = 0;
            return m;
        }, '');
    };
    const processArgs = (args, wto) => {
        let argObj = args.reduce((m, a) => {
            if (!a || !a.length) return m;
            let v = a.split('=');
            m[v[0].toLowerCase()] = v.slice(1).join('=');
            return m;
        }, {});
        argObj.wto = wto;
        return argObj;
    };
    const handleInput = async (msg) => {
        if (msg.type !== 'api' || !testConstructs(msg.content)) return;
        let args = msg.content.split(/\s+--/).slice(1);
        let tables = {};
        let notes = [];
        let wto = getWhisperTo(msg);
        const processGetTable = (honame) => (outer, opentag, name, closetag) => {
            let tbl = buildTableFromData(honame,name);
            if (tbl.hasOwnProperty('fail')) {
                notes.push(createNote(tbl.reason, `No Table Found`, createBullet.warning));
                return outer;
            }
            return `${opentag}Replace: ${name}${closetag}${tbl}`;
        };
        const processTable = (outer, process, name, inner) => {

            trrx.lastIndex = 0;
            if (!trrx.test(inner)) {
                notes.push(createNote(`Table ${name} did not have any rows.`, `Format`, createBullet.warning));
                return;
            }
            trrx.lastIndex = 0;
            tables[name] = [];
            let tblSchema = { avatar: undefined, weight: undefined, name: undefined };
            // get header row, form schema
            let hrow = trrx.exec(inner)[1];
            let tdi = 0;
            let cells = hrow.split(tdstartrx).slice(1);
            cells.map(c => {
                c = c.replace(/<\/td>$/, '');
                while (/<([^\s]+).*?>(.*?)<\/\1>/g.test(c)) c = /<([^\s]+).*?>(.*?)<\/\1>/g.exec(c)[2];
                c = c.replace(/&nbsp;/, ' ');
                return c;
            }).forEach(c => {
                if (['avatar', 'image'].includes(c.toLowerCase())) tblSchema.avatar = tdi;
                else if (c.toLowerCase() === 'weight') tblSchema.weight = tdi;
                else if (['name', 'text'].includes(c.toLowerCase())) tblSchema.name = tdi;
                tdi++;
            });
            if (typeof tblSchema.name === 'undefined') {
                notes.push(createNote('No compliant table structure detected for table ${name}.', 'Format', createBullet.warning));
                return;
            }
            // get the rest of the rows
            let remrows = inner.slice(trrx.lastIndex);
            trrx.lastIndex = 0;
            remrows.replace(trrx, (outertr, innertr) => {
                cells = innertr.split(tdstartrx).slice(1).map(c => {
                    c = c.replace(/<\/td>$/, '');
                    c = c.replace(/&nbsp;/, ' ');
                    while (/<([^\s]+).*?>(.*?)<\/\1>/g.test(c)) c = /<([^\s]+).*?>(.*?)<\/\1>/g.exec(c)[2].trim();
                    if (/^<img src="([^"]*)"/i.test(c)) c = /^<img src="([^"]*)"/i.exec(c)[1];
                    return c;
                });
                let row = { avatar: '', weight: '', name: '' };
                Object.keys(tblSchema).forEach(k => {
                    row[k] = cells[tblSchema[k]] || '';
                });
                row.weight = row.weight && parseInt(row.weight) > 0 ? parseInt(row.weight) : 1;
                if ((row.avatar && row.avatar.trim().length) || (row.name && row.name.trim().length)) tables[name].push(row);
            });
            let tbl;
            tbl = getTable(name);
            if (!tbl) tbl = createObj('rollabletable', { name: name });
            if (process && process.toLowerCase() === 'replace') { // delete table items if the idea is to replace it
                findObjs({ type: 'tableitem', rollabletableid: tbl.id }).forEach(ti => ti.remove());
                notes.push(createNote(`Cleared table ${name} of all associated items.`, 'Delete', createBullet.info));
            }
            let rowCount = 0;
            tables[name].forEach(r => {
                let item = createObj('tableitem', { rollabletableid: tbl.id });
                item.set({ weight: r.weight, name: r.name });
                if (r.avatar.length) item.set({ avatar: r.avatar });
                rowCount++;
            });
            notes.push(createNote(`Created ${rowCount} items for table ${name}.`, `${rowCount ? '' : 'No '}Items Created`, createBullet[rowCount ? 'info' : 'warning']));
            return outer.replace(/^(<h1.*?>)(?:(?:append|replace|new):\s*)(.*?)(<\/h1>)/i, `$1Processed: $2$3`);
        };
        let argObj;
        let errObj;
        switch (testConstructs(msg.content)) {
            case 'process':
                for (const a of args) {
                    let ho = getHandout(a);
                    if (!ho) {
                        notes.push(createNote(`No handout found for ${a}.`, 'No Handout', createBullet.warning));
                        return;
                    }
                    let workingnotes = await new Promise(res => ho.get('notes', res));
                    notes.push(createNote(`Working on handout ${ho.get('name')}`, 'Working', createBullet.normal));
                    workingnotes = workingnotes.replace(/(?:\r\n|\r|\n)/g, '') // make one line
                        .replace(/>\s+</g, '><'); // remove extra white space between tags
                    if (gettablerx.test(workingnotes)) {
                        notes.push(createNote(`Table retrieval detected; only retrieving in this run.`, `Get Statement`, createBullet.info));
                        workingnotes = workingnotes.replace(gettablerx, processGetTable(ho.get('name')));
                    } else if (tablerx.test(workingnotes)) {
                        notes.push(createNote(`Table update detected.`, `Update Statement`, createBullet.info));
                        workingnotes = workingnotes.replace(tablerx, processTable);
                    } else {
                        notes.push(createNote(`No work detected.`, `Nothing Detected`, createBullet.warning));
                    }
                    ho.set({ notes: workingnotes });
                    if (notes.length) msgbox({ title: `T3 Report`, msg: notes.join('<br>'), whisperto: wto });
                }
                break;
            case 'setup':
                argObj = processArgs(args, wto);
                if (!argObj.ho || !argObj.type || !Object.keys(setupTypes).includes(argObj.type)) {
                    failHandler(failFactory('That command did not contain all of the necessary parts.'), wto);
                    return;
                }
                errObj = await processSetup(argObj);
                break;
            case 'copy':
                argObj = processArgs(args, wto);
                if (!argObj.ho || !argObj.img) {
                    failHandler(failFactory('That command did not contain all of the necessary parts.'), wto);
                    return;
                }
                errObj = await highlightLibrary(argObj);
                if (!errObj.fail) clipboard[msg.playerid] = `${libPrefix}${argObj.img}`;
                break;
            case 'assign':
                argObj = processArgs(args, wto);
                if (!argObj.ho || !argObj.row) {
                    failHandler(failFactory('That command did not contain all of the necessary parts.'), wto);
                    return;
                }
                argObj.source = argObj.source || '';
                if (argObj.source === 'paste') {
                    if (!(clipboard[msg.playerid] && clipboard[msg.playerid].length)) {
                        failHandler(failFactory('Nothing on the clipboard.'), wto);
                        return;
                    }
                    argObj.source = clipboard[msg.playerid];
                } else if (argObj.source.length) {
                    let token = getObj('graphic', argObj.source) || findObjs({ type: 'graphic', name: argObj.source })[0];
                    if (!token) {
                        failHandler(failFactory(`Could not find token referenced by ${argObj.source}.`), wto);
                        return;
                    }
                    argObj.source = token.get('imgsrc');
                }
                errObj = await assignToRow(argObj);
                break;
            case 'row':
                argObj = processArgs(args, wto);
                if (!argObj.ho || !argObj.row || !argObj.type) {
                    failHandler(failFactory('That command did not contain all of the necessary parts.'), wto);
                    return;
                }
                argObj.type = argObj.type.toLowerCase() === 'del' ? 'del' : 'add';
                errObj = await manageRows(argObj);
                break;
            case 'table':
                argObj = processArgs(args, wto);
                if (!argObj.ho || !argObj.table || !argObj.type) {
                    failHandler(failFactory('That command did not contain all of the necessary parts.'), wto);
                    return;
                }
                argObj.type = ['wrap','repro','del'].includes(argObj.type.toLowerCase()) ? argObj.type.toLowerCase() : 'repro';
                errObj = await manageTable(argObj);

                break;
            case 'control':
                controlPanel(wto);
                break;
            case 'help':
                helpPanel(wto);
                break;
            default:
        }
        if (errObj && errObj.fail) {
            failHandler(errObj, wto);
            return;
        }
    };

    const registerEventHandlers = () => {
        on('chat:message', handleInput);

    };
    const buildNavBlock = (honame) => {
        let tblQuery = getTableQuery();
        let btnProcess = hobutton({ elem: `!t3 --${honame}`, label: 'PROCESS', type: '!', css: [localCSS.interfaceButton, localCSS.titleButton] });
        let btnNewGet = hobutton({ elem: `!t3-setup --ho=${honame} --type=get --table=${tblQuery}`, label: 'GET', type: '!', css: [localCSS.interfaceButton, localCSS.titleButton] });
        let btnNewNew = hobutton({ elem: `!t3-setup --ho=${honame} --type=new --table=?{Enter name for new table|}`, label: 'NEW', type: '!', css: [localCSS.interfaceButton, localCSS.titleButton] });
        let btnNewAppend = hobutton({ elem: `!t3-setup --ho=${honame} --type=append --table=${tblQuery}`, label: 'APPEND', type: '!', css: [localCSS.interfaceButton, localCSS.titleButton] });
        let btnControl = getTip('Open the control panel to do things like designate handouts as workspaces or libraries', hobutton({ elem: `!t3`, label: 'y', type: '!', css: [localCSS.squareButton] }), 'CONTROL PANEL');
        let btnHelp = getTip('Click to view the help panel, with more information about the TableToTable script.',hobutton({ elem: `!t3-help`, label: 'i', type: '!', css: [localCSS.squareButton] }),'HELP PANEL');
        let btnRefresh = getTip(`This button will refresh the list of tables used in the queries for the ${html.span('Get', localCSS.inlineEmphasis)} and ${html.span('Append', localCSS.inlineEmphasis)} buttons. Use it if you have added a new table since the last time you built or reset this interface.`,hobutton({ elem: `!t3-setup --ho=${honame} --type=refresh`, label: '0', type: '!', css: [localCSS.squareButton] }),'REFRESH TABLE LIST');
        let btnReset = getTip(`Reset this interface to having no table data below the buttons.`,hobutton({ elem: `!t3-setup --ho=${honame} --type=init`, label: '1', type: '!', css: [localCSS.squareButton] }),'RESET INTERFACE');

        let headerline = html.div(
            html.div( // title row
                html.div(
                    html.h1(html.img('https://i.imgur.com/AM7kMKI.png', '', { 'margin':'-23px 10px 0px 0px', 'height':'70px'}) + `Table to Table`, { 'font-family': 'contrail one', 'line-height':'70px','font-size':'37px' }),
                    localCSS.inlineLeft
                ) +
                html.div(
//                    btnControl + '<br>' + btnHelp + '<br>' + btnRefresh + '<br>' + btnReset,
                    btnControl + btnHelp + btnRefresh + btnReset,
                    localCSS.inlineRight, { 'margin-top':'14px' }
                ),
                { 'overflow': 'hidden', 'display': 'block', 'margin-bottom': '10px' }
            ) +
            html.div( // button row
                html.div(
                    btnNewGet + btnNewNew + btnNewAppend,
                    localCSS.inlineLeft
                ) +
                html.div(
                    btnProcess,
                    localCSS.inlineRight
                ),
                { 'overflow': 'hidden', 'display':'block'}
            ),
            { 'border-bottom': `2px solid ${theme.primaryColor}`, 'overflow': 'hidden', 'background-color': 'dimgrey', 'padding': '20px 0px', 'margin-bottom': '15px' }
        ).replace(/^(<div)\s/i, '<div id="navblock" ');
        return headerline;
    };
    const prepInterface = async (honame = 'T3 Workspace', whisperto = 'gm', overwrite = false, quiet = false) => {
        let notes = [];
        let buttons = [];
        let ho = getHandout(honame);
        if (!ho) {
            ho = createObj('handout', { name: honame });
            notes.push(createNote(`Creating handout: ${honame}`, 'Handout Created', createBullet.info));
        }
        let workingnotes = await new Promise(res => ho.get('notes', res));
        if (overwrite || !/^<div\sid="(?:userscript-)?navblock"/i.test(workingnotes)) {
            let navblock = buildNavBlock(honame);
            notes.push(createNote(`Prepping handout: ${honame}`, 'Interface', createBullet.info));
            ho.set({ notes: navblock });
        }
        if (notes.length) {
            buttons.push(Messenger.Button({ elem: `http://journal.roll20.net/handout/${ho.id}`, label: `Open ${honame}`, type: 'handout', css: localCSS.interfaceButton }));
            if(!quiet) msgbox({ title: `T3 Setup Report`, msg: notes.join('<br>'), whisperto: whisperto, btn: buttons.join('') });
        }
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
        assureState();
        logsig();
        let reqs = [
            {
                name: 'Messenger',
                version: `1.0.0.b4`,
                mod: typeof Messenger !== 'undefined' ? Messenger : undefined,
                checks: [['Button', 'function'], ['MsgBox', 'function'], ['HE', 'function'], ['Html', 'function'], ['Css', 'function']]
            },
            {
                name: 'libTable',
                version: `1.0.0.b1`,
                mod: typeof libTable !== 'undefined' ? libTable : undefined,
                checks: [
                    ['getTable', 'function'],
                    ['getTables', 'function'],
                    ['getItems', 'function'],
                    ['getItemsByIndex', 'function'],
                    ['getItemsByName', 'function'],
                    ['getItemsByWeight', 'function'],
                    ['getItemsByWeightedIndex', 'function']
                ]
            }
        ];
        if (!checkDependencies(reqs)) return;
        html = Messenger.Html();
        css = Messenger.Css();
        HE = Messenger.HE;
        prepInterface();

        registerEventHandlers();
    });
    return {};
})();

{ try { throw new Error(''); } catch (e) { API_Meta.TableToTable.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.TableToTable.offset); } }
/* */
