/*
=========================================================
Name			:	RoleMasterD100
GitHub			:	
Roll20 Contact	:	timmaugh
Version			:	1.0.0
Last Update		:	6/17/2022
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.RoleMasterD100 = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{
    try { throw new Error(''); } catch (e) { API_Meta.RoleMasterD100.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (13)); }
}

const RoleMasterD100 = (() => {
    const apiproject = 'RoleMasterD100';
    const version = '1.0.0';
    const schemaVersion = 0.1;
    API_Meta[apiproject].version = version;
    const vd = new Date(1655476169424);
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
                /* break; // intentional dropthrough */ /* falls through */

                case 0.2:
                    state[apiproject].defaults = {
                        die: 100,
                        lowx: 5,
                        highx: 96,
                        multiflip: false
                    };
                    state[apiproject].settings = {
                        die: 100,
                        lowx: 5,
                        highx: 96,
                        multiflip: false
                    };

                case 'UpdateSchemaVersion':
                    state[apiproject].version = schemaVersion;
                    break;

                default:
                    state[apiproject] = {
                        version: schemaVersion,
                        defaults: {
                            die: 100,
                            lowx: 5,
                            highx: 96,
                            multiflip: false
                        },
                        settings: {
                            die: 100,
                            lowx: 5,
                            highx: 96,
                            multiflip: false
                        }
                    };
                    break;
            }
        }
    };
    const stateReady = false;
    const assureState = () => {
        if (!stateReady) {
            checkInstall();
            stateReady = true;
        }
    };
    const manageState = {
        reset: () => state[apiproject].settings = _.clone(state[apiproject].defaults),
        clone: () => { return _.clone(state[apiproject].settings); },
        set: (p, v) => state[apiproject].settings[p] = v,
        get: (p) => { return state[apiproject].settings[p]; }
    }
    const processConfig = (c) => { // pass in arg components, ie, everything after the initial pipe character: --config| die|100
        let argrx = /([^#|]+)(?:#|\|)?(.*)/g;
        c.trim()
            .split(/\s+/)
            .forEach(a => {
                argrx.lastIndex = 0;
                if (argrx.test(a)) {
                    argrx.lastIndex = 0;
                    res = argrx.exec(a);
                    switch (res[1].toLowerCase()) {
                        case 'die':
                        case 'lowx':
                        case 'highx':
                            if (res[2] && !isNaN(res[2])) manageState.set([res[1].toLowerCase()], Number(res[2]));
                            break;
                        case 'multi':
                        case 'multiflip':
                            // if there is no second part, or if the second part is '', or if the second part is in this list => set to true
                            manageState.set('multiflip', (!res[2] || !res[2].length || ['y', 'yes', 'yup', 'true', 't', 'keith', 'sure'].includes(res[2].toLowerCase())));
                            break;
                        default:
                            break;
                    }
                }
            });
    };
    // ==================================================
    //      MESSAGING
    // ==================================================

    // COLOR MANAGEMENT ===========================
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

    // CSS RULES AND MANAGEMENT ===================
    // CSS ========================================
    const defaultThemeColor1 = '#4D5F76'; // header background, border
    const defaultThemeColor2 = '#606A78'; // button background
    const defaultThemeColor3 = '#FF2700'; // red
    const defaultThemeColor4 = '#D3D3D3'; // button text
    const defaultShadowColor1 = '#D3D3D3';
    const defaultTextColor = '#404040';
    const defaultbgcolor = "#ce0f69";
    const defaultDivCSS = {
        "background-color": '#FFFFFF',
        "color": defaultTextColor
    };
    const defaultTableCSS = {
        width: '100%',
        margin: '0 auto',
        "border-collapse": 'collapse',
        "font-size": '12px',
    };
    const defaultpCSS = {};
    const defaultaCSS = {};
    const defaulth1CSS = {};
    const defaulth2CSS = {
        'margin-top': '10px',
        "color": defaultTextColor
    };
    const defaulth3CSS = {
        'margin-top': '10px',
        "color": defaultTextColor
    };
    const defaulth4CSS = {
        'margin-top': '8px',
        "color": defaultTextColor
    };
    const defaulth5CSS = {
        'margin-top': '8px',
        "color": defaultTextColor
    };
    const defaultthCSS = {
        "border-bottom": `1px solid #000000`,
        "font-weight": `bold`,
        "text-align": `center`,
        "line-height": `22px`,
        "color": defaultTextColor
    };
    const defaulttrCSS = {};
    const defaulttdCSS = {};
    const defaultCodeCSS = {};
    const defaultSpanCSS = {};
    const defaultulCSS = {};
    const defaultliCSS = {};
    const defaultpreCSS = {};

    const defaultMessageHeaderCSS = {
        'background-color': defaultThemeColor1,
        'width': '100%',
        'border-radius': '6px 6px 0px 0px',
        'position': 'relative',
        'box-shadow': `0px -3px 2px ${defaultShadowColor1}`
    };
    const defaultMessageBodyCSS = {
        'padding': '10px 8px 4px 8px',
        'border': `2px solid ${defaultThemeColor1}`,
        'border-bottom-style': 'none'
    };
    const defaultButtonCSS = {
        'background-color': defaultThemeColor2,
        'border-radius': '6px',
    };
    const defaultScriptButtonCSS = {
        'min-width': '25px',
        'padding': '6px 8px'
    }
    const defaultImgCSS = {};
    const messageContainerDivCSS = {
        'background-color': '#FFFFFF',
        'font-size': '12px',
        'border-radius': '6px'
    };
    const messageWrapperDivCSS = {
        'background-color': 'transparent',
        'border': 'none',
        'margin-left': '-30px',
        'margin-top': '5px',
        'border-radius': '0px',
        'min-height': '60px',
        'display': 'block',
        'padding': '10px 5px 0px 0px',
        'text-align': 'left',
        'white-space': 'pre-wrap !important'
    };
    const inlineEmphasisCSS = {
        'font-weight': 'bold'
    };
    const avatarDivContainerCSS = { // provides border to avatar
        'border-radius': '19px',
        'width': '37px',
        'height': '37px',
        'position': 'absolute',
        'left': '-7px',
        'top': '-4px',
        'background-image': `linear-gradient(to bottom right, ${defaultThemeColor1}, #FFFFFF)`
    };
    const avatarInteriorDivCSS = {
        'border-radius': '18px',
        'width': '35px',
        'height': '35px',
        'position': 'absolute',
        'left': '1px',
        'top': '1px',
        'background-color': defaultThemeColor1
    };
    const avatarDivCSS = {
        'border-radius': '18px',
        'width': '35px',
        'height': '35px',
        'position': 'absolute',
        'left': '-7px',
        'top': '-4px',
        'background-color': defaultThemeColor2
    };
    const avatarImgCSS = {
        'background-color': 'transparent',
        'float': 'left',
        'border': 'none',
        'max-height': '40px'
    };
    const defaultMessageTitleCSS = {
        'background-color': defaultThemeColor1,
        'font-weight': 'bold',
        'font-size': '16px',
        'border-bottom': `1px solid ${defaultThemeColor1}`,
        'line-height': '24px',
        'border-radius': '6px 6px 0px 0px',
        'padding': '4px 4px 0px 40px !important'
    };
    const defaultButtonRowCSS = {
        'text-align': `right`,
        'padding': '4px 0px 0px',
        'border': `2px solid${defaultThemeColor1}`,
        'border-top-style': 'none',
        'border-radius': '0px 0px 6px 6px'
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
        ul: (content, CSS) => `<ul style=${assembleCSS(combineCSS(defaultulCSS, (CSS || {})))}>${content}</ul>`,
        li: (content, CSS) => `<li style=${assembleCSS(combineCSS(defaultliCSS, (CSS || {})))}>${content}</li>`,
        table: (content, CSS) => `<table style=${assembleCSS(combineCSS(defaultTableCSS, (CSS || {})))}>${content}</table>`,
        th: (content, CSS) => `<th style=${assembleCSS(combineCSS(defaultthCSS, (CSS || {})))}>${content}</th>`,
        tr: (content, CSS) => `<tr style=${assembleCSS(combineCSS(defaulttrCSS, (CSS || {})))}>${content}</tr>`,
        td: (content, CSS) => `<td style=${assembleCSS(combineCSS(defaulttdCSS, (CSS || {})))}>${content}</td>`,
        pre: (content, CSS) => `<pre style=${assembleCSS(combineCSS(defaultpreCSS, (CSS || {})))}>${content}</pre>`,
        code: (content, CSS) => `<code style=${assembleCSS(combineCSS(defaultCodeCSS, (CSS || {})))}>${HE(HE(content))}</code>`,
        a: (content, CSS, link) => `<a href="${link}" style=${assembleCSS(combineCSS(defaultaCSS, (CSS || {})))}>${content}</a>`,
        span: (content, CSS) => `<span style=${assembleCSS(combineCSS(defaultSpanCSS, (CSS || {})))}>${content}</span>`,
        img: (content, CSS) => `<img style=${assembleCSS(combineCSS(defaultImgCSS, (CSS || {})))} src='${content}'>`,
        tip: (content, CSS, tipText) => `<div class="showtip tipsy-n-right" title="${HE(HE(tipText))}"style=${assembleCSS(combineCSS(defaultSpanCSS, (CSS || {})))}>${content}</div>`
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

    // MESSAGE PARTS ==============================
    class HeaderBlock {
        constructor({
            text: text = '',
            css: css = {},
            img: img = { src: '', link: '' }
        } = {}) {
            this.text = text;
            this.css = css;
            this.img = img;
        }
        render() {
            let textcss = confirmReadability(combineCSS(defaultMessageTitleCSS, (this.css || {})));
            let avatar = html.img(this.img.src, avatarImgCSS);
            if (this.img.link) avatar = html.a(avatar);
            return html.div(html.div(html.div(avatar, avatarInteriorDivCSS), avatarDivContainerCSS) + html.div(this.text, textcss), defaultMessageHeaderCSS);
        }
    }
    class BodyBlock {
        constructor({
            text: text = '',
            css: css = {}
        } = {}) {
            this.text = text;
            this.css = css;
        }
        render() {
            let textcss = confirmReadability(combineCSS(defaultDivCSS, defaultMessageBodyCSS, this.css));
            return html.div(this.text, textcss);
        }
    }
    class ClosingBlock {
        constructor({
            text: text = '',
            css: css = {}
        } = {}) {
            this.text = text;
            this.css = css;
        }
        render() {
            let textcss = confirmReadability(combineCSS(defaultButtonRowCSS, this.css));
            return html.div(this.text, textcss);
        }
    }
    const chatOutput = ({
        parts: parts = [],
        sendas: sendas = 'API',
        whisperto: whisperto = ''
    }) => {
        let msg = parts.map(p => p.render()).join('');
        let output = html.div(html.div(msg, combineCSS(defaultDivCSS, messageContainerDivCSS)), combineCSS(defaultDivCSS, messageWrapperDivCSS));
        if (whisperto) output = `/w "${whisperto}" ${output}`;
        sendChat(sendas, output);
    };
    const msgbox = ({
        msg: msg = "message",
        title: title = "RoleMaster D100 Generator",
        btn: btn = "",
        sendas: sendas = "API",
        whisperto: whisperto = "",
        headercss: headercss = {},
        bodycss: bodycss = {},
        btncss: btncss = {}
    }) => {
        let header = new HeaderBlock({ text: title, css: confirmReadability(combineCSS(defaultMessageTitleCSS, headercss)), img: { src: `https://i.imgur.com/NsEjpdZ.png`, link: '' } });
        let body = new BodyBlock({ text: msg, css: confirmReadability(combineCSS({}, bodycss)) });
        let close = new ClosingBlock({ text: btn, css: btncss });
        let parts = [header, body, close];
        chatOutput({ parts: parts, sendas: sendas, whisperto: whisperto });
    };
    // BUTTONS ====================================
    const btnAPI = ({ api: api = "", label: btnlabel = "Run API", css: css = defaultButtonCSS } = {}) => {
        let btnCSS = confirmReadability(combineCSS(defaultButtonCSS, css));
        return html.a(btnlabel, btnCSS, HE(api));
    };
    const standardbuttons = {
        config: btnAPI({ api: '!rmd100 --config', label: 'Config', css: defaultScriptButtonCSS }),
        help: btnAPI({ api: '!rmd100 --help', label: 'Help', css: defaultScriptButtonCSS }),
        reset: btnAPI({ api: '!rmd100 --reset', label: 'Reset', css: defaultScriptButtonCSS }),
        about: btnAPI({ api: '!rmd100 --about', label: 'About', css: defaultScriptButtonCSS }),
        set: btnAPI({ api: '!rmd100 --set|die|?{Base die|100} highx|?{High threshold|96} lowx|?{Low threshold|5} multi|?{Allow multiple direction changes on open rolls?|No|Yes}', label: 'Set&nbsp;', css: defaultScriptButtonCSS })
    };
    // STANDARD PANELS ============================
    const scriptAboutPanel = (whisperTo) => {
        msgbox({
            title: `RoleMaster D100 Generator`,
            msg: html.h2(`About`) + `${html.span(`RoleMaster D100 Generator`, inlineEmphasisCSS)} is a script for generating d100 rolls according to RoleMaster explosion rules. ` +
                `Rolls can be high open-ended, low open-ended, open-ended in both directions (the default), with the option to allow multiple change of directions (see Help). ` +
                `Use the Config panel to set script-level parameters, or command line arguments to apply settings to a single roll (see Help). ` +
                `This script is set up to work as a metascript, feeding the resulting roll into another script's command line, if you need it. See Help for details. ` +
                html.h3(`A Bit of Metamancery`) + `This bit of script metamancery brought to you by ${html.a('timmaugh, the Metamancer', {}, 'https://app.roll20.net/users/5962076/timmaugh')}.`,
            btn: `${standardbuttons.config} ${standardbuttons.help}`,
            btncss: { padding: `4px 6px 6px 0px` },
            whisperto: whisperTo
        });
    };
    const scriptHelpPanel = (whisperTo) => {
        msgbox({
            title: `RoleMaster D100 Generator`,
            msg: html.h2(`Help`) + `${html.span(`RoleMaster D100 Generator`, inlineEmphasisCSS)} will generate a d100 roll in accordance with RoleMaster explosion mechanics using a command line as simple as ` +
                html.code('!rmd100') + `. Here are the particulars of the script's use. ` +
                html.h3('Configure Script') + `The script is set up to follow RoleMaster rules regarding exploding d100 rolls (called 'open-ended' rolls). For high open-ended rolls, it will extend on a 96 or higher. ` +
                `For low open-ended rolls, it will negatively extend on a 5 or less (and then on a 96 or above for further rolls). For plain open-ended rolls, both of these mechanics are at play for that first roll. ` +
                `You can configure the script to change these settings so that all rolls made by the script will use the values you designate. Values for the high-explosion threshold (${html.span('highx', inlineEmphasisCSS)}), ` +
                `low-explosion threshold (${html.span('lowx', inlineEmphasisCSS)}), the kind of die rolled (${html.span('die', inlineEmphasisCSS)}), and even whether to allow multiple changes of direction (${html.span('multi', inlineEmphasisCSS)}). ` +
                `Allowing multiple changes of direction means that for a full open-ended roll (both explosion directions available), every roll at or below the low-explosion threshold changes the direction of explosion for subsequent rolls. ` +
                `The Config panel discusses changing these values at the script level (you can use the Config button, below, or just issue the chat command ${html.code('!rmd100 --config')} at any time).<br>` +
                standardbuttons.config +
                html.h3('Command Line') +
                `Use ${html.span('!rmd100', inlineEmphasisCSS)} to trigger the script. This will produce a simple roll depicting the various explosions that happened along the way.<br>` + html.img(`https://i.imgur.com/WJnaJeI.png`) +
                html.h4('Modifiers as Command Line Arguments') +
                `Add any modifiers to the roll as arguments to the line prefaced by a double hyphen. Any number of such modifiers can be used.` +
                html.pre(`!rmd100 --20<br>!rmd100 ${HE('--@{selected|Blacksmith} --@{selected|CraftingSkillGroup}')}<br>!rmd100 ${HE('--@{selected|Blacksmith} --@{selected|CraftingSkillGroup} --?{Bonus|0}')}`) +
                `If the argument represents a number, it will be included in the roll.` +
                html.h5('Include Labels for Modifiers') + `If you want to include a label for the value in the roll, include that label immediately after the double-hyphen, and separate it from the value by a hash (#) or a pipe (|) character.` +
                html.pre(`!rmd100 --Blacksmith|${HE('@{selected|Blacksmith}')}`) + `Labels will appear in the resulting roll: <br>` + html.img(`https://i.imgur.com/9qkyoxg.png`) +
                html.h4('Controlling Script Output (Whisper, Value Only)') +
                html.h5('Whispering') +
                `Include a --whisper argument to limit who can see the output of the roll. To whisper to yourself, leave the argument without a value:` +
                html.pre('!rmd100 --whisper') + `If you wish to whisper the result to someone else (for example, the GM), include the target after a delimiter:` +
                html.pre('!rmd100 --whisper|ActualCannibal<br>!rmd100 --whisper|gm') +
                html.h5('Outputting the Roll Value, Only') +
                `The typical output of the script is an inline roll equation (i.e. '${HE('[[90 + 20[Blacksmith] + 10]]')}'). If you wish, instead, to output the value of the roll only ` +
                `(which can be important when you use the script in combination with Plugger -- see below), you can use the special argument ${html.span('--value', inlineEmphasisCSS)}:` +
                html.pre(`!rmd100 --Blacksmith|${HE('@{selected|Blacksmith}')} --value`) +
                `The resulting output to chat will not have roll-tip available on-hover, but it will display the correct value.` +
                html.h4('Controlling Script Behavior Per Roll (Base Die, Explosion Thresholds') +
                html.h5('Base Dice & Explosion Thresholds') +
                `The same configuration settings that can be established at the script level (base die, high/low explosion thresholds, multiple changes of explosion direction) can be overridden and set for a given roll using special arguments to the command line. ` +
                `Having the ability to change these values allows for character-specific or encounter-specific alterations to the standard mechanic. The command line arguments are as follows:` +
                html.pre('--die<br>--lowx<br>--highx') + 
                `Follow these with an argument delimiter (hash or pipe), followed by a number. For instance, to use a d100/4/95 mechanic for a roll, the command line would be:` +
                html.pre('!rmd100 --lowx|4 --highx|95') +
                `Note, this assumes that the script is set to use a d100, so that particular argument doesn't have to be included.<br><br>` +
                `Changing these values as a part of the script configuration could allow this script to be adapted to other systems, lending this explosion mechanic to other games. ` +
                `For instance, you could configure the script to work in a d20 game by setting the die type to 20, the high-explosion threshold to 19, and the low-explosion threshold to 2. See the Config panel for more information.` +
                html.h3('As Metascript (Return a Value to the Command Line)') +
                `Plugger is a metascript that dispatches calls to secondary scripts when the Plugger syntax is included in a primary script's command line. If that secondary script registers itself to Plugger to be a 'plug-in', ` +
                `Plugger will actually return a value to the command line before the primary script ever receives the command.<br><br>` +
                `In other words: to use the roll produced by RoleMasterD100 in another script, use the Plugger syntax to embed it in the command line.<br><br>` +
                `The appropriate syntax for use as a plug-in is to take the original ${html.span('rmd100', inlineEmphasisCSS)} command line but leave off the exclamation mark, and enclose the arguments in parentheses. Then, enclose the whole thing in the ${html.span('{&eval}', inlineEmphasisCSS)} tags from Plugger.` +
                html.pre(`!somescript --Skill|Blacksmith --Result|{&eval}rmd100(--Blacksmith|${HE('@{selected|Blacksmith}')} --value){&/eval}`) + 
                `Another way to solve this is to have ZeroFrame (another metascript) installed, as well. ZeroFrame will detect the inline roll equation (the default return from RoleMasterD100), ` +
                `and add it to the message that the secondary script receives. Using ZeroFrame in this way will preserve the roll as an inline roll, so you will be able to see the on-hover roll-tip.`,
            btn: `${standardbuttons.about} ${standardbuttons.config}`,
            btncss: { padding: `4px 6px 6px 0px` },
            whisperto: whisperTo
        });
    };
    const scriptConfigPanel = (whisperTo, gm = false) => {
        msgbox({
            title: `RoleMaster D100 Generator`,
            msg: html.h2(`Config`) + `${html.span(`RoleMaster D100 Generator`, inlineEmphasisCSS)} is configured to use: ` +
                html.ul(
                    html.li(`${html.span('Die', inlineEmphasisCSS)}: d${manageState.get('die')}`) +
                    html.li(`${html.span('High Threshold', inlineEmphasisCSS)}: ${manageState.get('highx')}`) +
                    html.li(`${html.span('Low Threshold', inlineEmphasisCSS)}: ${manageState.get('lowx')}`) +
                    html.li(`${html.span('Multi', inlineEmphasisCSS)}: ${manageState.get('multiflip')}`)
                ) +
                `These are the values the script will use if none are declared for an individual roll. For more information on changing a value for a given roll, see the Help panel. ` +
                `${gm ? 'Use the Set button to change the above script-level values, or the Reset button to revert the script to RoleMaster defaults (d100/96/5).' : ''}`,
            btn: `${standardbuttons.about} ${standardbuttons.help}${gm ? ' ' + standardbuttons.set + ' ' + standardbuttons.reset : ''}`,
            btncss: { padding: `4px 6px 6px 0px` },
            whisperto: whisperTo
        });
    };
    const gmRightsRequired = (whisperTo) => {
        msgbox({
            title: `RoleMaster D100 Generator`,
            msg: html.h2(`GM Rights Required`) + `You must be a GM of this game to run that command. See Help for more information.`,
            btn: `${standardbuttons.help}`,
            btncss: { padding: `4px 6px 6px 0px` },
            whisperto: whisperTo
        })
    };

    // ==================================================
    //		HANDLE INPUT
    // ==================================================
    const handleInput = (msg) => {
        if (msg.type !== 'api' || !/^!rmd100/.test(msg.content.toLowerCase())) return;

        // reduce all inline rolls - this rewrites the content of the msg to be the output of an inline roll rather than the $[[0]], $[[1]], etc.
        if (_.has(msg, 'inlinerolls')) {
            msg.content = _.chain(msg.inlinerolls)
                .reduce(function (m, v, k) {
                    m['$[[' + k + ']]'] = v.results.total || 0;
                    return m;
                }, {})
                .reduce(function (m, v, k) {
                    return m.replace(k, v);
                }, msg.content)
                .value();
        }
        const controlArgs = { open: manageState.get('multiflip') ? 'multi' : 'both' };
        const fillControlArgs = () => { Object.assign(controlArgs, manageState.clone()); };
        fillControlArgs();

        const getRMd100 = (m = [{ val: 0, connector: '+' }], last = '+') => {
            let r = randomInteger(controlArgs.die);
            if (controlArgs.open === 'none') { // no explosion mechanic
                m.push({ val: r, label: '', connector: '' });
            } else {
                if (((m.length === 1 && ['low', 'both'].includes(controlArgs.open)) || (controlArgs.open === 'multi')) && r <= controlArgs.lowx) {
                    // if it's the first roll and the 'open' controlArg is 'low' or 'both' and the roll is below the threshold
                    // or if the 'open' controlArg is 'multi' (no matter how many rolls we've had) and the roll is below the threshold
                    m.push({ val: r, label: '', connector: last === '+' ? '-' : '+' });
                    m = getRMd100(m, last === '+' ? '-' : '+');
                } else if ((controlArgs.open !== 'low' || m.length > 1) && r >= controlArgs.highx) {
                    // rolls over the threshold matter for all rolls after the first, and for the first for all 'open' values other than 'low'
                    m.push({ val: r, label: '', connector: last });
                    m = getRMd100(m, last);
                } else {
                    m.push({ val: r, label: '', connector: '' });
                }
            }
            return m;
        };
        const getWho = () => { return msg.who.replace(/ \(GM\)$/, '') };

        let argrx = /([^#|]+)(?:#|\|)?(.*)/g,
            res,
            whisper = '',
            report = false,
            skipRoll = false,
            valueOnly = false;
        let args = msg.content.split(/\s+--/)          // split at argument delimiter
            .slice(1)                                  // drop the api tag
            .map(a => {                                // split each arg at # or |, (foo#bar becomes [foo, bar])
                argrx.lastIndex = 0;
                if (argrx.test(a)) {
                    argrx.lastIndex = 0;
                    res = argrx.exec(a);
                    switch (res[1].toLowerCase()) {
                        case 'about':
                            scriptAboutPanel(getWho());
                            skipRoll = true;
                            return undefined;
                        case 'help':
                            scriptHelpPanel(getWho());
                            skipRoll = true;
                            return undefined;
                        case 'set':
                            if (playerIsGM(msg.playerid)) {
                                if (res[2] && res[2].trim().length) processConfig(res[2]);
                                fillControlArgs();
                                report = true;
                            } else {
                                skipRoll = true;
                                gmRightsRequired(getWho());
                            }
                            return undefined;
                        case 'reset':
                            if (playerIsGM(msg.playerid)) {
                                manageState.reset();
                                fillControlArgs();
                                report = true;
                            } else {
                                skipRoll = true;
                                gmRightsRequired(getWho());
                            }
                            return undefined;
                        case 'report':
                        case 'config':
                            report = true;
                            return undefined;
                        case 'value':
                            valueOnly = true;
                            return undefined;
                        case 'die':
                        case 'lowx':
                        case 'highx':
                            if (res[2] && !isNaN(res[2])) controlArgs[res[1].toLowerCase()] = Number(res[2]);
                            return undefined;
                        case 'open':
                            if (res[2] && res[2].length && ['high', 'low', 'both', 'none', 'multi', 'multiflip'].includes(res[2].toLowerCase())) {
                                controlArgs.open = res[2].toLowerCase() === 'multiflip' ? 'multi' : res[2].toLowerCase();
                            }
                            return undefined;
                        case 'whisper':
                            if (!res[2] || !res[2].length) { // if argument is blank, whisper to the message 'who'
                                whisper = `/w "${getWho()}" `;
                            } else {
                                whisper = `/w "${res[2]}" `;
                            }
                            return undefined;
                        default:
                            return res[2] && res[2].length ? [res[1], res[2]] : ['', res[1]];

                    }
                } else {
                    return ['', a];
                }
            })
            .filter(a => a);                           // remove undefined elements

        let roll = getRMd100().slice(1);

        args.map(a => { return a[0].length ? [`[${a[0]}]`, a[1]] : a; })
            .forEach(a => {
                if (isNaN(a[1])) return;
                if (roll[roll.length - 1].connector === '') roll[roll.length - 1].connector = '+';
                roll.push({ val: Number(a[1]), label: a[0], connector: '' });
            });

        const getRollValue = () => {
            return roll.reduce((m, v) => {
                return m + (v.connector === '-' ? -1 * v.val : v.val);
            }, 0);
        };
        const getRollAsInline = () => {
            return `[[${roll.map(r => r.val + r.label + r.connector).join('')}]]`;
        };
        if (msg.eval) {
            if (valueOnly) {
                return getRollValue();
            } else {
                return `${getRollAsInline()}`;
            }
        } else {
            if (report) {
                scriptConfigPanel(getWho(), playerIsGM(msg.playerid));
                skipRoll = true;
            }
            if (!skipRoll) {
                if (valueOnly) {
                    sendChat('API', `${whisper}${getRollValue()}`);
                } else {
                    sendChat('API', `${whisper}${getRollAsInline()}`);
                }
            }
        }
    };

    const rmd100 = (m) => handleInput(m);
    on('chat:message', handleInput);
    on('ready', () => {
        versionInfo();
        assureState();
        logsig();
        try {
            Plugger.RegisterRule(rmd100);
        } catch (error) {
            log(`ERROR Registering to PlugEval: ${error.message}`);
        }
    });
    return {
    };
})();

{ try { throw new Error(''); } catch (e) { API_Meta.RoleMasterD100.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.RoleMasterD100.offset); } }