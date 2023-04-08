/*
=========================================================
Name			:	DiscreteWhisper
GitHub			:	https://github.com/TimRohr22/Cauldron/tree/master/DiscreteWhisper
Roll20 Contact	:	timmaugh
Version			:	1.1.2
Last Update		:	6/1/2022
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.DiscreteWhisper = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{
    try { throw new Error(''); } catch (e) { API_Meta.DiscreteWhisper.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (13)); }
}

/*
COMMAND LINE EXAMPLE:
!w --character|character|character --any text {{aside|character|character}} more text {{Aside|character}} still more text --{{all/aside/Aside}}Button Label|

BUTTONS:
{{all / aside}}label|!script <<args>>
{{all / aside}}label|local|ability
{{all / aside}}label|local|@attribute
{{all / aside}}label|character|ability
{{all / aside}}label|character|@attribute
{{all / aside}}label|macro

*/

const DiscreteWhisper = (() => {
    // ==================================================
    //		VERSION
    // ==================================================
    const apiproject = 'DiscreteWhisper';
    const version = '1.1.2';
    const schemaVersion = 0.1;
    API_Meta[apiproject].version = version;

    const vd = new Date(1654109447798);
    const versionInfo = () => {
        log(`\u0166\u0166 ${apiproject} v${API_Meta[apiproject].version}, ${vd.getFullYear()}/${vd.getMonth() + 1}/${vd.getDate()} \u0166\u0166 -- offset ${API_Meta[apiproject].offset}`);
        if (!state.hasOwnProperty(apiproject) || state[apiproject].version !== schemaVersion) {
            log(`  > Updating ${apiproject} Schema to v${schemaVersion} <`);
            switch (state[apiproject] && state[apiproject].version) {

                case 0.1:
                    /* break; // intentional dropthrough */ /* falls through */
                    state[apiproject].config = { silent: false };
                    state[apiproject].apihandles = ['w', 'discrete'];
                case 'UpdateSchemaVersion':
                    state[apiproject].version = schemaVersion;
                    break;
                default:
                    state[apiproject] = {
                        version: schemaVersion,
                        config: { silent: false },
                        apihandles: ['w', 'discrete']
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
    //		HTML & CSS
    // ==================================================

    // CSS DEFAULTS =====================================
    const defaultThemeColor1 = '#ff9747';

    // COLOR MANAGEMENT =================================
    const getAltColor = (primarycolor, fade = .35) => {

        let pc = hexToRGB(`#${primarycolor.replace(/#/g, '')}`);
        let sc = [0, 0, 0];

        for (let i = 0; i < 3; i++) {
            sc[i] = Math.floor(pc[i] + (fade * (255 - pc[i])));
        }

        return RGBToHex(sc[0], sc[1], sc[2]);
    };
    const RGBToHex = (r, g, b) => {
        r = r.toString(16);
        g = g.toString(16);
        b = b.toString(16);

        if (r.length === 1)
            r = "0" + r;
        if (g.length === 1)
            g = "0" + g;
        if (b.length === 1)
            b = "0" + b;

        return "#" + r + g + b;
    };
    const getTextColor = (h) => {
        h = `#${h.replace(/#/g, '')}`;
        let hc = hexToRGB(h);
        return (((hc[0] * 299) + (hc[1] * 587) + (hc[2] * 114)) / 1000 >= 128) ? "#000000" : "#ffffff";
    };
    const hexToRGB = (h) => {
        let r = 0, g = 0, b = 0;

        // 3 digits
        if (h.length === 4) {
            r = "0x" + h[1] + h[1];
            g = "0x" + h[2] + h[2];
            b = "0x" + h[3] + h[3];
            // 6 digits
        } else if (h.length === 7) {
            r = "0x" + h[1] + h[2];
            g = "0x" + h[3] + h[4];
            b = "0x" + h[5] + h[6];
        }
        return [+r, +g, +b];
    };
    const validateHexColor = (s, d = defaultThemeColor1) => {
        let colorRegX = /(^#?[0-9A-Fa-f]{6}$)|(^#?[0-9A-Fa-f]{3}$)|(^#?[0-9A-Fa-f]{6}\d{2}$)/i;
        return '#' + (colorRegX.test(s) ? s.replace('#', '') : d);
    };
    const combineCSS = (origCSS = {}, ...assignCSS) => {
        return Object.assign({}, origCSS, assignCSS.reduce((m, v) => {
            return Object.assign(m, v || {});
        }), {});
    };
    const confirmReadability = (origCSS = {}) => {
        if (origCSS.hasOwnProperty('background-color') && origCSS.hasOwnProperty('color')) return origCSS;
        let outputCSS = Object.assign({}, origCSS);
        if (outputCSS.hasOwnProperty('background-color')) outputCSS['background-color'] = validateHexColor(outputCSS['background-color'] || "#dedede");
        if (outputCSS.hasOwnProperty('color') || outputCSS.hasOwnProperty('background-color')) outputCSS['color'] = getTextColor(outputCSS['background-color'] || "#dedede");
        return outputCSS;
    };
    const assembleCSS = (css) => {
        return `"${Object.keys(css).map((key) => { return `${key}:${css[key]};` }).join('')}"`;
    };

    // HTML =======================================
    const html = {
        div: (content, CSS) => `<div style=${assembleCSS(combineCSS(defaultDivCSS, (CSS || {})))}>${content}</div>`,
        h1: (content, CSS) => `<h1 style=${assembleCSS(combineCSS(defaulth1CSS, (CSS || {})))}>${content}</h1>`,
        h2: (content, CSS) => `<h2 style=${assembleCSS(combineCSS(defaulth2CSS, (CSS || {})))}>${content}</h2>`,
        h3: (content, CSS) => `<h3 style=${assembleCSS(combineCSS(defaulth3CSS, (CSS || {})))}>${content}</h3>`,
        h4: (content, CSS) => `<h4 style=${assembleCSS(combineCSS(defaulth4CSS, (CSS || {})))}>${content}</h4>`,
        h5: (content, CSS) => `<h5 style=${assembleCSS(combineCSS(defaulth5CSS, (CSS || {})))}>${content}</h5>`,
        p: (content, CSS) => `<p style=${assembleCSS(combineCSS(defaultpCSS, (CSS || {})))}>${content}</p>`,
        table: (content, CSS) => `<table style=${assembleCSS(combineCSS(defaultTableCSS, (CSS || {})))}>${content}</table>`,
        th: (content, CSS) => `<th style=${assembleCSS(combineCSS(defaultthCSS, (CSS || {})))}>${content}</th>`,
        tr: (content, CSS) => `<tr style=${assembleCSS(combineCSS(defaulttrCSS, (CSS || {})))}>${content}</tr>`,
        td: (content, CSS) => `<td style=${assembleCSS(combineCSS(defaulttdCSS, (CSS || {})))}>${content}</td>`,
        code: (content, CSS) => `<code style=${assembleCSS(combineCSS(defaultCodeCSS, (CSS || {})))}>${content}</code>`,
        a: (content, CSS, link) => `<a href="${link}" style=${assembleCSS(combineCSS(defaultaCSS, (CSS || {})))}>${content}</a>`,
        span: (content, CSS) => `<span style=${assembleCSS(combineCSS(defaultSpanCSS, (CSS || {})))}>${content}</span>`,
        img: (content, CSS) => `<img style=${assembleCSS(combineCSS(defaultImgCSS, (CSS || {})))} src='${content}'>`,
        tip: (content, CSS, tipText) => `<div class="showtip tipsy" title="${HE(HE(tipText))}"style=${assembleCSS(combineCSS(defaultSpanCSS, (CSS || {})))}>${content}</div>`
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

    const msgtable = '<div style="width:100%;"><div style="border-radius:10px;border:2px solid #000000;background-color:__bg__; margin-right:16px; overflow:hidden;"><table style="width:100%; margin: 0 auto; border-collapse:collapse;font-size:12px;">__TABLE-ROWS__</table></div></div>';
    const msg1header = '<tr style="border-bottom:1px solid #000000;font-weight:bold;text-align:center; background-color:__bg__; line-height: 22px;"><td>__cell1__</td></tr>';
    const msg1row = '<tr style="background-color:__bg__;"><td style="padding:4px;__row-css__">__cell1__</td></tr>';
    const bgcolor = "#ce0f69";
    const htmlTable = {
        "&": "&amp;",
        "{": "&#123;",
        "}": "&#125;",
        "|": "&#124;",
        ",": "&#44;",
        "%": "&#37;",
        "?": "&#63;",
        "[": "&#91;",
        "]": "&#93;",
        "@": "&#64;",
        "~": "&#126;",
        "(": "&#40;",
        ")": "&#41;",
        "<": "&#60;",
        ">": "&#62;",
    };
    const htmlCoding = (s = "", encode = true) => {
        if (typeof s !== "string") return undefined;
        let searchfor = encode ? htmlTable : _.invert(htmlTable);
        s = s.replace(new RegExp(Object.keys(searchfor)
            .map((k) => { return escapeRegExp(k); })
            .join("|"), 'gmi'), (r) => { return searchfor[r]; })
            .replace(new RegExp(/\n/, 'gmi'), '<br><br>');
        return s;
    };

    // ==================================================
    //		HANDOUT
    // ==================================================
    const getBuilderHandout = (player) => {
        let playerObj = playerFromAmbig(player);
        let builder = findObjs({ type: 'handout', name: `DiscreteWhisper Builder - ${playerObj.get('name')}` })[0] ||
            createObj('handout', { type: 'handout', name: `DiscreteWhisper Builder - ${playerObj.get('name')}`, inplayerjournals: playerObj.get('id'), controlledby: playerObj.get('id') });
    }

    // ==================================================
    //		UTILITIES
    // ==================================================
    const getTheSpeaker = function (msg) {
        var characters = findObjs({ type: 'character' });
        var speaking;
        characters.forEach((chr) => { if (chr.get('name') === msg.who) speaking = chr; });

        if (speaking) {
            speaking.speakerType = "character";
            speaking.localName = speaking.get("name");
        } else {
            speaking = getObj('player', msg.playerid);
            speaking.speakerType = "player";
            speaking.localName = speaking.get("displayname");
        }
        speaking.chatSpeaker = speaking.speakerType + '|' + speaking.id;

        return speaking;
    };
    const playerFromAmbig = (info) => {                                       // find a player where info is an identifying piece of information (id or name)
        let player;
        if (info.get('displayname').length) return info;
        player = findObjs({ type: 'player', id: info })[0] ||
            findObjs({ type: 'player' }).filter(p => p.get('displayname') === info)[0];
        return player;
    };
    const addHandle = (handles) => {
        let delta = [];
        handles.split('|').forEach(h => {
            if (!state[apiproject].apihandles.includes(h)) {
                state[apiproject].apihandles.push(h);
                delta.push(h);
            }
        });
        if (delta.length) getHandles(delta, 'add');
    };
    const remHandle = (handles) => {
        let delta = [];
        handles.split('|').forEach(h => {
            if (state[apiproject].apihandles.includes(h)) {
                state[apiproject].apihandles = state[apiproject].apihandles.filter(a => a !== h);
                delta.push(h);
            }
        });
        if (delta.length) getHandles(delta, 'rem');
    };
    const getHandles = (seed = '', seedtype = '') => {
        let message = `The following handles were found for this script:<br>${apiproject}<br>${state[apiproject].apihandles.join('<br>')}`;
        if (seed && seedtype) message = `The following handles were ${seedtype === 'add' ? 'added' : 'removed'}:<br>${seed.join(', ')}<br><br>${message}`;
        msgbox({ c: message, t: 'API HANDLES', wto: 'GM' });
    };
    const setConfig = (cfg) => {
        Object.keys(cfg).forEach(setting => {
            state[apiproject].config[setting] = cfg[setting];
        });
    };
    const getConfig = (setting) => {
        return state[apiproject].config[setting];
    };
    const escapeRegExp = (string) => { return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); };
    const charFromAmbig = (info) => {                                       // find a character where info is an identifying piece of information (id, name, or token id)
        let character;
        character = findObjs({ type: 'character', id: info })[0] ||
            findObjs({ type: 'character' }).filter(c => c.get('name') === info)[0] ||
            findObjs({ type: 'character', id: (getObj("graphic", info) || { get: () => { return "" } }).get("represents") })[0];
        return character;
    };
    const msgbox = ({ c: c = "message", t: t = "DISCRETE WHISPER", btn: b = "buttons", sendas: sas = "API", wto: wto = "", bg: bg = "#dedede" }) => {
        const rowbg = ["#ffffff", "#dedede"];
        let tbl = msgtable.replace("__bg__", rowbg[0]);
        let hdr = msg1header.replace("__bg__", bg).replace("__cell1__", t);
        let row = msg1row.replace("__bg__", rowbg[0]).replace("__cell1__", c);
        let btn = b !== "buttons" ? msg1row.replace("__bg__", rowbg[0]).replace("__cell1__", b).replace("__row-css__", "text-align:right;margin:4px 4px 8px;") : "";
        let msg = tbl.replace("__TABLE-ROWS__", hdr + row + btn);
        if (wto) msg = `/w "${wto}" ${msg}`;
        sendChat(sas, msg);
    };
    const btnElem = ({ bg: btnbg = bgcolor, store: s = "", label: btnlabel = "Loaded Ability", charname: cn = "not set", entity: e = "&#37;", css: css = "" } = {}) => {
        btnbg = validateHexColor(btnbg);
        let link;
        switch (e) {
            case '#':
            case 'macro':
            case 'm':
            case '&#35;':
                link = `&#35;${s}`;
                break;
            case '@':
            case 'attr':
            case 'attribute':
            case '&#64;':
                link = `&#64;{${cn}|${s}}`;
                break;
            case '%':
            case 'abil':
            case 'ability':
            case '&#37;':
            default:
                link = `&#37;{${cn}|${s}}`;
                break;
        }
        return `<a style="background-color: ${btnbg}; color: ${getTextColor(btnbg)}; ${css}" href="!&#13;${link}">${btnlabel}</a>`;
    };
    const btnAPI = ({ bg: btnbg = bgcolor, api: api = "", label: btnlabel = "Run API", css: css = "", r20style: r20style = false, encode: encode = true } = {}) => {
        btnbg = validateHexColor(btnbg);
        api = encode ? htmlCoding(api, true) : api;
        r20style = ['t', 'true', 'y', 'yes', true].includes(r20style) ? true : false;
        return `<a style="background-color: ${btnbg}; color: ${getTextColor(btnbg)};${r20style ? 'padding: 5px;display:inline-block;border 1px solid white;' : ''}${css}" href="${api}">${btnlabel}</a>`;
    };
    const parseButton = (btn, character) => {
        /* btn should be one of:
           label|!script
           label|character|ability
           label|local|ability
            --can include the @ or %; @ is required for attributes (abilities are default)
           label|macro
        */
        let output = '';
        if (!/^[^\|]+\|.+/g.test(btn)) return output;
        let args = btn.split('|');
        if (typeof character === 'string') character = { localName: character, get: () => { return 'Not found'; }, id: 'none' };

        // reconstruct if this is an API command that might contain pipe characters
        if (args[1].startsWith('!')) args = [args[0], args.slice(1).join('|')];

        let label = args[0];

        let storerx = /^roll\((@|%)?([^\s)]+?)\)$/i;
        let storeres;
        let api;

        switch (args.length) {
            case 2: // API BUTTON OR MACRO BUTTON
                if (args[1].startsWith('!')) {
                    output = btnAPI({ label: label, api: args[1] });
                } else {
                    output = btnElem({ label: label, store: args[1], entity: "macro" });
                }
                break;
            case 3: // ABILITY OR ATTRIBUTE BUTTON
                if (storerx.test(args[2])) { // wrap as a roll
                    storeres = storerx.exec(args[2]);
                    let storeitem = findObjs({ type: storeres[1] === '@' ? 'attribute' : 'ability', characterid: character.id }).filter(a => a.get('name') === storeres[2])[0];
                    if (storeitem) { // attribute or ability found
                        api = `!&#13;&lbrack;&lbrack;${storeitem.get(storeres[1] === '@' ? 'current' : 'action')}&rbrack;&rbrack;`;
                    } else { // no such attribute or ability
                        api = `!&#13;No ${storeres[1] === '@' ? 'attribute' : 'ability'} named ${storeres[2]} found.`;
                    }
                    output = btnAPI({ label: label, api: api, encode: false });
                } else { // no roll wrapping
                    output = btnElem({
                        store: (args[2].startsWith('@') || args[2].startsWith('%')) ? args[2].slice(1) : args[2],
                        charname: character.localName,
                        label: label,
                        entity: args[2].startsWith('@') ? 'attribute' : 'ability'
                    });
                }

                break;
            default: // BADLY FORMED BUTTON COMMAND
                break;
        }
        return output;
    };

    // ==================================================
    //		PROCESS
    // ==================================================
    const handleInput = (msg_orig) => {
        if (msg_orig.type !== 'api') return;
        if (!(new RegExp(apiproject)).test(msg_orig.content)) {
            if (!state[apiproject].apihandles.reduce((a, h) => { return new RegExp(`^!${h}\\b`).test(msg_orig.content) ? true : a; }, false)) return;
        }

        let msg = _.clone(msg_orig);
        let theSpeaker = getTheSpeaker(msg);
        let msgsilent = getConfig('silent');
        let args = msg.content.split(/\s+--/);
        let handleArg = args.shift();
        if (playerIsGM(msg.playerid)) {
            let handlerx = /^!.*#(remapi(?=\|(.+))|addapi(?=\|(.+))|getapi|silent|report)\|?(.*)/g;
            // FROM    : !apihandle#option|hande1|handle2
            // group 1 : option
            // group 4 : handle1|handle2
            handlerx.lastIndex = 0;
            let handle = handlerx.exec(handleArg);
            if (handle) {
                switch (handle[1]) {
                    case 'remapi':
                        remHandle(handle[4]);
                        break;
                    case 'addapi':
                        addHandle(handle[4]);
                        break;
                    case 'getapi':
                        getHandles();
                        break;
                    case 'silent':
                        if (handle[4]) {
                            setConfig({ silent: ['yes', 'y', 'on', 'true', 'yup', '+'].includes(handle[4]) ? true : false });
                            msgsilent = getConfig('silent');
                        } else {
                            msgsilent = true;
                        }
                        break;
                    case 'report':
                        msgsilent = false;
                        break;
                    default:
                        break;
                }
            }
        }
        if (args.length >= 4) args = [args[0], args[1], args[2], args.slice(3).join(" --")];

        let [characters, output, title, buttons] = args;
        if (!characters && !output) return;

        if (!output || output.length === 0) {
            msgbox({ c: `No whispered message provided.`, t: `NO MESSAGE`, wto: theSpeaker.localName });
            return;
        }
        // if either the message or the buttons are not prepended with an aside/all designation, add "{{all}}" as the default
        if (!/^({{[Aa]side\|.+?}}|{{all}})/g.test(output)) output = `{{all}}${output}`;
        if (buttons && buttons.length && !/^({{[Aa]side\|.+?}}|{{all}})/g.test(buttons)) buttons = `{{all}}${buttons}`;

        let undeliverable = [];
        let tempChar;
//        characters = characters.split('|');
        characters = [...new Set(characters.split('|'))]
            .map(c => {
                if (c.toLowerCase() === 'gm') {
                    tempChar = { get: () => { return 'GM' }, whisper: '', button: '' };
                }
                else if (c.startsWith('{{as}}')) {
                    tempChar = undefined;
                    theSpeaker.chatSpeaker = c.slice(6);
                }
                else {
                    tempChar = charFromAmbig(c);
                    if (!tempChar) undeliverable.push({ localName: c, whisper: 'All' });
                }
                return tempChar;
            })
            .filter(c => c);

        if (!characters.length) {
            msgbox({ c: `No valid characters provided.`, t: `NO MESSAGE`, wto: theSpeaker.localName });
            return;
        }

        characters.forEach(c => { Object.assign(c, { whisper: '', button: '', localName: c.get('name') }) });

        // let whisperrx = /{{(Aside\||aside\||all)(.*?)}}(.*?(?=(?:{{|$)))/g;
        let outputrx = /{{(Aside\||aside\||all)(.*?)}}(.*?(?=(?:{{[Aa]side\|.+?}}|{{all}}|$)))/g;
        // FROM   : {{aside|character|character2}}Whispered text. 
        // group 1: aside|
        // group 2: character|character2
        // group 3: Whispered text.
        let asideCharacters = [];
        let matches = [...output.matchAll(outputrx)];
        matches.forEach(m => {
            switch (m[1]) {
                case "Aside|":
                    asideCharacters = [...new Set(m[2].split('|'))];
                    characters.filter(c => asideCharacters.includes(c.localName))
                        .forEach(c => c.whisper = `${c.whisper.trim()} <b>[Aside:</b> ${m[3].trim()} <b>]</b>`);
                    asideCharacters.filter(a => !characters.filter(c => c.localName === a).length)
                        .forEach(a => {
                            tempChar = undeliverable.filter(u => u.localName === a)[0];
                            if (tempChar) tempChar.whisper = `${tempChar.whisper && tempChar.whisper.length ? tempChar.whisper + '; ' : ''}${m[3]}`;
                            else undeliverable.push({ localName: a, whisper: m[3], button: '' });
                        });
                    break;
                case "aside|":
                    asideCharacters = [...new Set(m[2].split('|'))];
                    characters.filter(c => asideCharacters.includes(c.localName))
                        .forEach(c => c.whisper = `${c.whisper.trim()} ${m[3].trim()}`);
                    asideCharacters.filter(a => !characters.filter(c => c.localName === a).length)
                        .forEach(a => {
                            tempChar = undeliverable.filter(u => u.localName === a)[0];
                            if (tempChar) tempChar.whisper = `${tempChar.whisper && tempChar.whisper.length ? tempChar.whisper + '; ' : ''}${m[3]}`;
                            else undeliverable.push({ localName: a, whisper: m[3], button: '' });
                        });
                    break;
                case "all":
                    characters.forEach(c => c.whisper = `${c.whisper.trim()} ${m[3].trim()}`);
                    undeliverable.filter(u => u.whisper && u.whisper.startsWith('All')).forEach(u => u.whisper = `${u.whisper}; ${m[3]}`);
                    break;
            }
        });

        let buttonrx = /{{(Aside\|(?=[^}$]+)|aside\|(?=[^}$]+)|all)(.*?)}}([^{$\|]+?\|.+?(?=(?:{{(Aside\|(?=[^}$]+)|aside\|(?=[^}$]+)|all)(?:.*?)}}|$)))/g
        let btnasideCharacters = [];

        if (buttons && buttons.length) {
            matches = [...buttons.matchAll(buttonrx)];
            matches.forEach(m => {
                switch (m[1]) {
                    case 'Aside|':
                        btnasideCharacters = [...new Set(m[2].split('|'))];
                        characters.filter(c => btnasideCharacters.includes(c.localName))
                            .forEach(c => c.button = `${c.button.trim()}<br><b>Aside:</b> ${parseButton(m[3], c).trim()}`);
                        btnasideCharacters.filter(a => !characters.filter(c => c.localName === a).length)
                            .forEach(a => {
                                tempChar = undeliverable.filter(u => u.localName === a)[0];
                                if (tempChar) tempChar.button = `${tempChar.button && tempChar.button.length ? tempChar.button + '; ' : ''}${parseButton(m[3], a)}`;
                                else undeliverable.push({ localName: a, whisper: '', button: parseButton(m[3], a) });
                            });
                        break;
                    case 'aside|':
                        btnasideCharacters = [...new Set(m[2].split('|'))];
                        characters.filter(c => btnasideCharacters.includes(c.localName))
                            .forEach(c => c.button = `${c.button.trim()} ${parseButton(m[3], c).trim()}`);
                        btnasideCharacters.filter(a => !characters.filter(c => c.localName === a).length)
                            .forEach(a => {
                                tempChar = undeliverable.filter(u => u.localName === a)[0];
                                if (tempChar) tempChar.button = `${tempChar.button && tempChar.button.length ? tempChar.button + ' ' : ''}${parseButton(m[3], a)}`;
                                else undeliverable.push({ localName: a, whisper: '', button: parseButton(m[3], a) });
                            });
                        break;
                    case 'all':
                        characters.forEach(c => c.button = `${c.button.trim()} ${parseButton(m[3], c).trim()}`);
                        undeliverable.filter(u => u.whisper && u.whisper.startsWith('All')).forEach(u => u.button = `${u.button && u.button.length ? u.button + ' ' : ''}${parseButton(m[3],u)}`);
                        break;
                }
            });
        }

        characters.forEach(c => {                                           // make sure each character has a button and whisper property
            c.whisper = c.whisper || '';
            c.button = c.button || '';
        });
        undeliverable.forEach(c => {                                        // make sure each undeliverable has a button and a whisper property
            c.whisper = c.whisper || '';
            c.button = c.button || '';
        });

        // OUTPUT WHISPERS
        if (title) {                                                        // title provided, so template the output
            characters.forEach(c => msgbox({ c: `${c.whisper}`, t: title, sendas: theSpeaker.chatSpeaker, wto: c.localName, btn: c.button }));
        } else {                                                            // no title provided, so simple output
            characters.forEach(c => sendChat(theSpeaker.chatSpeaker, `/w "${c.localName}" ${c.whisper}`));
        }

        if (msgsilent) return;

        // REPORT SENT MESSAGES
        let sent = characters.reduce((a, c) => {
            return `${a}<br><b>${c.localName}</b><br>${c.whisper}${c.button ? `<br>${c.button}`:''}<br>`;
        }, '').slice(4);
        msgbox({ c: sent, t: 'DELIVERED WHISPERS', wto: `${theSpeaker.localName}` });

        // REPORT UNSENT MESSAGES
        if (undeliverable.length) {
            let unsent = undeliverable.reduce((a, c) => {
                return `${a}<br><b>${c.localName}</b><br>${c.whisper}<br>${c.button}<br>`;
            }, '').slice(4);
            msgbox({ c: unsent, t: 'UNDELIVERABLE ALERT', wto: `${theSpeaker.localName}`, bg: "#fdc6c6" });
        }
    };

    const registerEventHandlers = () => {
        on('chat:message', handleInput);
    };

    on('ready', () => {
        versionInfo();
        logsig();
        registerEventHandlers();

        //if (!state[apiproject]) state[apiproject] = { apihandles: ['w','discrete'] };

    });

    return {
        // public interface
    };

})();
{ try { throw new Error(''); } catch (e) { API_Meta.DiscreteWhisper.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.DiscreteWhisper.offset); } }
