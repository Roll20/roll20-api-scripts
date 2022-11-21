/* eslint no-prototype-builtins: "off" */
/*
=========================================================
Name			:	Messenger
GitHub			:	
Roll20 Contact	:	timmaugh
Version			:	1.0.0
Last Update		:	10/26/2022
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.Messenger = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{
    try { throw new Error(''); } catch (e) { API_Meta.Messenger.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (13)); }
}
const Messenger = (() => { // eslint-disable-line no-unused-vars
    const apiproject = 'Messenger';
    const apilogo = `https://i.imgur.com/DEkWTak.png`;
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
                        settings: {
                        },
                        defaults: {
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

    // ============================================
    //      PRESENTATION
    // ============================================
    const getTextColor = (h) => {
        h = `#${h.replace(/#/g, '')}`;
        let hc = hexToRGBA(h);
        return (((hc[0] * 299) + (hc[1] * 587) + (hc[2] * 114)) / 1000 >= 128) ? "#000000" : "#ffffff";
    };
    const hexToRGBA = (hex, alpha, reqAlpha = 'auto') => {

        const isValidHex = (hex) => /^#([A-Fa-f0-9]{3,4}){1,2}$/.test(hex);

        const getChunksFromString = (st, chunkSize) => st.match(new RegExp(`.{${chunkSize}}`, "g"));

        const convertHexUnitTo256 = (hexStr) => parseInt(hexStr.repeat(2 / hexStr.length), 16);

        const getAlphafloat = (a, alpha) => {
            if (typeof a !== "undefined") { return a / 255 }
            if ((typeof alpha != "number") || alpha < 0 || alpha > 1) { // eslint-disable-line eqeqeq
                return 1
            }
            return alpha
        };

        if (!isValidHex(hex)) { throw new Error("Invalid HEX") }
        const chunkSize = Math.floor((hex.length - 1) / 3)
        const hexArr = getChunksFromString(hex.slice(1), chunkSize)
        const [r, g, b, a] = hexArr.map(convertHexUnitTo256)
        switch (reqAlpha) {
            case true:
                return `rgba(${r}, ${g}, ${b}, ${getAlphafloat(a, alpha)})`;
            case false:
                return `rgb(${r}, ${g}, ${b})`;
            default:
                return `rgb${a || alpha ? 'a' : ''}(${r}, ${g}, ${b}${a || alpha ? `, ${getAlphafloat(a, alpha)}` : ''})`;
        }
    };

    //const hexToRGB = (h) => {
    //    let r = 0, g = 0, b = 0;

    //    // 3 digits
    //    if (h.length === 4) {
    //        r = "0x" + h[1] + h[1];
    //        g = "0x" + h[2] + h[2];
    //        b = "0x" + h[3] + h[3];
    //        // 6 digits
    //    } else if (h.length === 7) {
    //        r = "0x" + h[1] + h[2];
    //        g = "0x" + h[3] + h[4];
    //        b = "0x" + h[5] + h[6];
    //    }
    //    return [+r, +g, +b];
    //};
    const validCSSColors = {
        AliceBlue: `#F0F8FF`,
        AntiqueWhite: `#FAEBD7`,
        Aqua: `#00FFFF`,
        Aquamarine: `#7FFFD4`,
        Azure: `#F0FFFF`,
        Beige: `#F5F5DC`,
        Bisque: `#FFE4C4`,
        Black: `#000000`,
        BlanchedAlmond: `#FFEBCD`,
        Blue: `#0000FF`,
        BlueViolet: `#8A2BE2`,
        Brown: `#A52A2A`,
        BurlyWood: `#DEB887`,
        CadetBlue: `#5F9EA0`,
        Chartreuse: `#7FFF00`,
        Chocolate: `#D2691E`,
        Coral: `#FF7F50`,
        CornflowerBlue: `#6495ED`,
        Cornsilk: `#FFF8DC`,
        Crimson: `#DC143C`,
        Cyan: `#00FFFF`,
        DarkBlue: `#00008B`,
        DarkCyan: `#008B8B`,
        DarkGoldenrod: `#B8860B`,
        DarkGray: `#A9A9A9`,
        DarkGreen: `#006400`,
        DarkGrey: `#A9A9A9`,
        DarkKhaki: `#BDB76B`,
        DarkMagenta: `#8B008B`,
        DarkOliveGreen: `#556B2F`,
        DarkOrange: `#FF8C00`,
        DarkOrchid: `#9932CC`,
        DarkRed: `#8B0000`,
        DarkSalmon: `#E9967A`,
        DarkSeaGreen: `#8FBC8F`,
        DarkSlateBlue: `#483D8B`,
        DarkSlateGray: `#2F4F4F`,
        DarkSlateGrey: `#2F4F4F`,
        DarkTurquoise: `#00CED1`,
        DarkViolet: `#9400D3`,
        DeepPink: `#FF1493`,
        DeepSkyBlue: `#00BFFF`,
        DimGray: `#696969`,
        DimGrey: `#696969`,
        DodgerBlue: `#1E90FF`,
        FireBrick: `#B22222`,
        FloralWhite: `#FFFAF0`,
        ForestGreen: `#228B22`,
        Fuchsia: `#FF00FF`,
        Gainsboro: `#DCDCDC`,
        GhostWhite: `#F8F8FF`,
        Gold: `#FFD700`,
        Goldenrod: `#DAA520`,
        Gray: `#808080`,
        Green: `#008000`,
        GreenYellow: `#ADFF2F`,
        Grey: `#808080`,
        Honeydew: `#F0FFF0`,
        HotPink: `#FF69B4`,
        IndianRed: `#CD5C5C`,
        Indigo: `#4B0082`,
        Ivory: `#FFFFF0`,
        Khaki: `#F0E68C`,
        Lavender: `#E6E6FA`,
        LavenderBlush: `#FFF0F5`,
        LawnGreen: `#7CFC00`,
        LemonChiffon: `#FFFACD`,
        LightBlue: `#ADD8E6`,
        LightCoral: `#F08080`,
        LightCyan: `#E0FFFF`,
        LightGoldenrodYellow: `#FAFAD2`,
        LightGray: `#D3D3D3`,
        LightGreen: `#90EE90`,
        LightGrey: `#D3D3D3`,
        LightPink: `#FFB6C1`,
        LightSalmon: `#FFA07A`,
        LightSeaGreen: `#20B2AA`,
        LightSkyBlue: `#87CEFA`,
        LightSlateGray: `#778899`,
        LightSlateGrey: `#778899`,
        LightSteelBlue: `#B0C4DE`,
        LightYellow: `#FFFFE0`,
        Lime: `#00FF00`,
        LimeGreen: `#32CD32`,
        Linen: `#FAF0E6`,
        Magenta: `#FF00FF`,
        Maroon: `#800000`,
        MediumAquamarine: `#66CDAA`,
        MediumBlue: `#0000CD`,
        MediumOrchid: `#BA55D3`,
        MediumPurple: `#9370DB`,
        MediumSeaGreen: `#3CB371`,
        MediumSlateBlue: `#7B68EE`,
        MediumSpringGreen: `#00FA9A`,
        MediumTurquoise: `#48D1CC`,
        MediumVioletRed: `#C71585`,
        MidnightBlue: `#191970`,
        MintCream: `#F5FFFA`,
        MistyRose: `#FFE4E1`,
        Moccasin: `#FFE4B5`,
        NavajoWhite: `#FFDEAD`,
        Navy: `#000080`,
        OldLace: `#FDF5E6`,
        Olive: `#808000`,
        OliveDrab: `#6B8E23`,
        Orange: `#FFA500`,
        OrangeRed: `#FF4500`,
        Orchid: `#DA70D6`,
        PaleGoldenrod: `#EEE8AA`,
        PaleGreen: `#98FB98`,
        PaleTurquoise: `#AFEEEE`,
        PaleVioletRed: `#DB7093`,
        PapayaWhip: `#FFEFD5`,
        PeachPuff: `#FFDAB9`,
        Peru: `#CD853F`,
        Pink: `#FFC0CB`,
        Plum: `#DDA0DD`,
        PowderBlue: `#B0E0E6`,
        Purple: `#800080`,
        RebeccaPurple: `#663399`,
        Red: `#FF0000`,
        RosyBrown: `#BC8F8F`,
        RoyalBlue: `#4169E1`,
        SaddleBrown: `#8B4513`,
        Salmon: `#FA8072`,
        SandyBrown: `#F4A460`,
        SeaGreen: `#2E8B57`,
        Seashell: `#FFF5EE`,
        Sienna: `#A0522D`,
        Silver: `#C0C0C0`,
        SkyBlue: `#87CEEB`,
        SlateBlue: `#6A5ACD`,
        SlateGray: `#708090`,
        SlateGrey: `#708090`,
        Snow: `#FFFAFA`,
        SpringGreen: `#00FF7F`,
        SteelBlue: `#4682B4`,
        Tan: `#D2B48C`,
        Teal: `#008080`,
        Thistle: `#D8BFD8`,
        Tomato: `#FF6347`,
        Turquoise: `#40E0D0`,
        Violet: `#EE82EE`,
        Wheat: `#F5DEB3`,
        White: `#FFFFFF`,
        WhiteSmoke: `#F5F5F5`,
        Yellow: `#FFFF00`,
        YellowGreen: `#9ACD32`
    };
    const validateHexColor = (s, d = defaultThemeColor1) => {
        let colorRegX = /^#?([A-Fa-f0-9]{3,4}){1,2}$/;
        let cname = Object.keys(validCSSColors).filter(c => c.toLowerCase() === s.toLowerCase())[0];
        if (cname) return validCSSColors[cname];
        return `#${colorRegX.test(s) ? s.replace('#', '') : d.replace('#', '')}`;
    };

    // CSS ========================================
    const defaultThemeColor1 = '#66806a';
    const css = {
        divContainer: {
            'background-color': '#00000000',
            'overflow': `hidden`,
            width: '100%',
            border: 'none'
        },
        div: {
            'background-color': '#00000000',
            'overflow': `hidden`
        },
        rounded: {
            'border-radius': `10px`,
            'border': `2px solid #000000`,
        },
        tb: {
            width: '100%',
            margin: '0 auto',
            'border-collapse': 'collapse',
            'font-size': '12px',
        },
        p: {},
        a: {},
        img: {},
        h1: {},
        h2: {},
        h3: {},
        h4: {},
        h5: {},
        th: {
            'border-bottom': `1px solid #000000`,
            'font-weight': `bold`,
            'text-align': `center`,
            'line-height': `22px`
        },
        tr: {},
        td: {
            padding: '4px',
            'min-width': '10px'
        },
        code: {},
        pre: {
            'color': 'dimgray',
            'background': 'transparent',
            'border': 'none',
            'white-space': 'pre-wrap',
            'font-family': 'Inconsolata, Consolas, monospace'
        },
        span: {},
        messageHeader: {
            'border-bottom': `1px solid #000000`,
            'background-color': '#dedede',
            'display': 'block'
        },
        messageHeaderContent: {
            margin: '0px auto',
            width: '98%',
            'line-height': `24px`,
            'padding': '2px 8px',
            'min-height': '25px'
        },
        messageBody: {
            'display': 'block',
            'background-color': '#ededed',
            'padding-top': '6px',
            'padding-bottom': '8px'
        },
        messageBodyContent: {
            margin: '0px auto',
            width: '95%',
            'font-size': '13px'
        },
        messageButtons: {
            'text-align': `right`,
            'margin': `4px 4px 8px`,
            'padding': '8px'
        },
        messageFooterContent: {
            margin: '0px 8px',
            width: '98%'
        },
        button: {
            'background-color': defaultThemeColor1,
            'border-radius': '6px',
            'min-width': '25px',
            'padding': '6px 8px'
        },
        divShadow: {
            'margin': '0px 16px 16px 0px',
            'box-shadow': '5px 8px 8px #888888'
        },
    };
    const combineCSS = (origCSS = {}, ...assignCSS) => {
        return Object.assign({}, origCSS, assignCSS.reduce((m, v) => {
            return Object.assign(m, v || {});
        }, {}));
    };
    const confirmReadability = (origCSS = {}) => {
        let outputCSS = Object.assign({}, origCSS);
        if (outputCSS['background-color']) outputCSS['background-color'] = validateHexColor(outputCSS['background-color'] || "#dedede");
        if (!outputCSS['color'] && outputCSS['background-color']) outputCSS['color'] = getTextColor(outputCSS['background-color'] || "#dedede");
        return outputCSS;
    };
    const assembleCSS = (css) => {
        return `"${Object.keys(css).map((key) => { return `${key}:${css[key]};` }).join('')}"`;
    };

    // HTML =======================================
    const html = {
        div: (content, ...CSS) => `<div style=${assembleCSS(combineCSS(css.div, ...CSS))}>${content}</div>`,
        h1: (content, ...CSS) => `<h1 style=${assembleCSS(combineCSS(css.h1, ...CSS))}>${content}</h1>`,
        h2: (content, ...CSS) => `<h2 style=${assembleCSS(combineCSS(css.h2, ...CSS))}>${content}</h2>`,
        h3: (content, ...CSS) => `<h3 style=${assembleCSS(combineCSS(css.h3, ...CSS))}>${content}</h3>`,
        h4: (content, ...CSS) => `<h4 style=${assembleCSS(combineCSS(css.h4, ...CSS))}>${content}</h4>`,
        h5: (content, ...CSS) => `<h5 style=${assembleCSS(combineCSS(css.h5, ...CSS))}>${content}</h5>`,
        p: (content, ...CSS) => `<p style=${assembleCSS(combineCSS(css.p, ...CSS))}>${content}</p>`,
        table: (content, ...CSS) => `<table style=${assembleCSS(combineCSS(css.tb, ...CSS))}>${content}</table>`,
        th: (content, ...CSS) => `<th style=${assembleCSS(combineCSS(css.th, ...CSS))}>${content}</th>`,
        tr: (content, ...CSS) => `<tr style=${assembleCSS(combineCSS(css.tr, ...CSS))}>${content}</tr>`,
        td: (content, ...CSS) => `<td style=${assembleCSS(combineCSS(css.td, ...CSS))}>${content}</td>`,
        td2: (content, ...CSS) => `<td colspan="2" style=${assembleCSS(combineCSS(css.td, ...CSS))}>${content}</td>`,
        code: (content, ...CSS) => `<code style=${assembleCSS(combineCSS(css.code, ...CSS))}>${content}</code>`,
        pre: (content, ...CSS) => `<pre style=${assembleCSS(combineCSS(css.pre, ...CSS))}>${content}</pre>`,
        span: (content, ...CSS) => `<span style=${assembleCSS(combineCSS(css.span, ...CSS))}>${content}</span>`,
        a: (content, link, ...CSS) => `<a href="${link}" style=${assembleCSS(combineCSS(css.a, ...CSS))}>${content}</a>`,
        img: (content, altText, ...CSS) => `<img src="${content}" alt="${altText}" style=${assembleCSS(combineCSS(css.img, ...CSS))}>`,
        tip: (content, tipText, ...CSS) => `<span class="showtip tipsy-n-right" title="${HE(HE(tipText))}"style=${assembleCSS(combineCSS(css.span, ...CSS))}>${content}</span>`
    };

    // HTML Escaping function
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
            '"': e('quot')
        };
        const re = new RegExp(`(${Object.keys(entities).map(esRE).join('|')})`, 'g');
        return (s) => s.replace(re, (c) => (entities[c] || c));
    })();

    // MESSAGING ==================================
    const button = ({ elem: elem = '', label: label = '', char: char = '', type: type = '%', css: css = Messenger.Css.button } = {}) => {
        const htmlTable = {
            '@': '&#64;', 'attr': '&#64;', 'attribute': '&#64;',
            '#': '&#35;', 'mac': '&#35;', 'macro': '&#35;',
            '%': '&#37;', 'abil': '&#37;', 'ability': '&#37;',
            '!': '&#33;', 'api': '&#33;', 'mod': '&#33;', 'script': '&#33;', 'bang': '&#33;',
            'handout': 'handout', 'ho': 'handout'
        };
        type = htmlTable[type];
        if (!type) return '';
        let btnCSS = confirmReadability(css);
        let api = '';
        switch (type) {
            case '&#35;': // macro
                api = `${type}${elem}`;
                break;
            case '&#37;': // ability
            case '&#64;': // attribute
                api = `${type}{${char}|${elem}}`;
                break;
            case '&#33;': // api
                api = `${type}${/^!/.test(elem) ? elem.slice(1) : elem}`;
                break;
            case 'handout': // button to open a handout
                api = `${elem}`;
                break;
        }

        if (!api) return;
        if (type !== 'handout') api = `!&#13;${api}`;
        return html.a(label, HE(api), btnCSS);
    };
    const hobutton = ({ elem: elem = '', label: label = '', char: char = '', type: type = '%', css: css = Messenger.Css.button } = {}) => {
        const htmlTable = {
            '@': '@', 'attr': '@', 'attribute': '@',
            '#': '#', 'mac': '#', 'macro': '#',
            '%': '%', 'abil': '!', 'ability': '%',
            '!': '!', 'api': '!', 'mod': '!', 'script': '!', 'bang': '!'
        };
        type = htmlTable[type];
        if (!type) return '';
        let btnCSS = confirmReadability(css);
        let api = '';
        switch (type) {
            case '#': // macro
                api = `${type}${elem}`;
                break;
            case '%': // ability
            case '@': // attribute
                api = `${type}{${char}|${elem}}`;
                break;
            case '!': // api
                api = `${type}${/^!/.test(elem) ? elem.slice(1) : elem}`;
                break;
        }

        if (!api) return;
        api = `${api}`;
        return html.a(label, `\`${api}`, btnCSS);
    };
    const msgbox = ({
        msg: msg = 'message',
        title: title = '',
        footer: footer = '',
        btn: btn = '',
        sendas: sendas = 'API',
        whisperto: whisperto = '',
        containercss: containercss = {},
        boundingcss: boundingcss = {},
        headercss: headercss = {},
        bodycss: bodycss = {},
        footercss: footercss = {},
        noarchive: noarchive = false
    } = {}) => {
        let containerCSS = confirmReadability(combineCSS(css.divContainer, containercss));
        let boundingCSS = confirmReadability(combineCSS(css.div, css.rounded, boundingcss));
        let hdrCSS = confirmReadability(combineCSS(css.messageHeader, headercss));
        let bodyCSS = confirmReadability(combineCSS(css.messageBody, bodycss));
        let footerCSS = confirmReadability(combineCSS(css.messageFooterContent, footercss));

        let hdr = title !== '' ? html.div(html.div(title, css.messageHeaderContent), hdrCSS) : '';
        let body = html.div(html.div(msg, css.messageBodyContent), bodyCSS);
        let buttons = btn !== '' ? html.div(btn, css.messageButtons) : '';
        if (footer) footer = html.div(footer);
        if (footer || buttons) {
            footer = html.div(html.div(footer + buttons), footerCSS);
        }
        let output = html.div(html.div(html.div(`${hdr}${body}${footer}`, {}), boundingCSS), containerCSS);
        if (whisperto) output = `/w "${whisperto}" ${output}`;
        sendChat(sendas, output, null, { noarchive: !!noarchive });
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
            // { name: 'Messenger', mod: typeof Messenger !== 'undefined' ? Messenger : undefined, checks: [['Button', 'function'], ['MsgBox', 'function'], ['HE', 'function'], ['Html', 'object']] }
        ];
        if (reqs.length && !checkDependencies(reqs)) return;
    });
    return {
        Button: button,
        HOButton: hobutton,
        MsgBox: msgbox,
        Html: () => _.clone(html),
        Css: () => _.clone(css),
        HE: HE,
        version: version
    };
})();

{ try { throw new Error(''); } catch (e) { API_Meta.Messenger.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.Messenger.offset); } }
