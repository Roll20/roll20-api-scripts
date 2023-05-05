/* eslint no-prototype-builtins: "off" */
/*
=========================================================
Name            :   ScriptInfo
GitHub          :   
Roll20 Contact  :   timmaugh
Version			:   0.0.1
Last Update		:   12/21/2022
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.ScriptInfo = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.ScriptInfo.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (13)); } }

const ScriptInfo = (() => { // eslint-disable-line no-unused-vars
    const ScriptInfo = 'ScriptInfo';
    const scriptVersion = '0.0.1';
    API_Meta[ScriptInfo].version = scriptVersion;
    const logsig = () => {
        state.houseofmod = state.houseofmod || {};
        state.houseofmod.siglogged = state.houseofmod.siglogged || false;
        state.houseofmod.sigtime = state.houseofmod.sigtime || Date.now() - 3001;
        if (
            !state.houseofmod.siglogged ||
            Date.now() - state.houseofmod.sigtime > 3000
        ) {
            const logsig =
                "\n" +
                "             ________________________               \n" +
                "            ╱                 ______ ╲              \n" +
                "           ╱                    _____ ╲             \n" +
                "          ╱                       ____ ╲            \n" +
                "         ╱______________________________╲           \n" +
                "             ┃ _____          _____ ┃               \n" +
                "             ┃ ┃_┃_┃    MOD   ┃_┃_┃ ┃               \n" +
                "             ┃ ┃_┃_┃   _____  ┃_┃_┃ ┃               \n" +
                "             ┃         ┃   ┃        ┃               \n" +
                "             ┃         ┃  o┃        ┃               \n" +
                "_____________┃_________┃___┃________┃_______________\n" +
                "                                                    \n";
            log(`${logsig}`);
            state.houseofmod.siglogged = true;
            state.houseofmod.sigtime = Date.now();
        }
        return;
    };
    const versionInfo = () => {
        let hom = String.fromCodePoint(0xd83c, 0xdfe0);
        log(`${hom} ${ScriptInfo} v${scriptVersion} ${hom} -- offset ${API_Meta[ScriptInfo].offset}`);
    };
    let reportMsg;
    const fillReportMsg = () => {
        reportMsg = Object.keys(API_Meta).reduce((m, k) => {
            if (API_Meta[k].hasOwnProperty('offset')) {
                m = `${m}{{ ${k}${API_Meta[k].hasOwnProperty('version') ? ` (${API_Meta[k].version})` : ''}=${API_Meta[k].offset} / (${API_Meta[k].hasOwnProperty('lineCount') ? API_Meta[k].lineCount : '????'})}}`;
            }
            return m;
        }, `&{template:default}{{name=Script Information}}{{ SCRIPT NAME=**START / LINES**}}`);
    };
    const getReportForLine = (n) => {
        let location = Object.keys(API_Meta).filter(k => API_Meta[k].hasOwnProperty('offset') && API_Meta[k].hasOwnProperty('lineCount')).reduce((m, k) => {
            if (m.hasOwnProperty('within')) return m;
            if (n >= API_Meta[k].offset && n <= (API_Meta[k].offset + API_Meta[k].lineCount - 1)) {
                m.within = k;
            } else {
                if (n < API_Meta[k].offset) m.before = m.before || k;
                else m.after = k;
            }
            return m;
        }, {});
        if (location.within) return `Line ${n} corresponds to line ${n - API_Meta[location.within].offset} in ${location.within}.`;
        if (location.before && location.after) return `That line number does not correspond to any script reporting its offset. ` +
            `It occurs ${n - (API_Meta[location.after].offset + API_Meta[location.after].lineCount - 1)} lines after the end of ${location.after}, and ` +
            `${API_Meta[location.before].offset - (n + 1)} lines before the start of ${location.before}.`;
        if (location.after) return `That line number does not correspond to any script reporting its offset. ` +
            `It occurs ${n - (API_Meta[location.after].offset + API_Meta[location.after].lineCount - 1)} lines after the end of ${location.after}.`;
        if (location.before) return `That line number does not correspond to any script reporting its offset. ` +
            `It occurs ${API_Meta[location.before].offset - (n + 1)} lines before the start of ${location.before}.`;
    };
    const handleInput = msg => {
        if (msg.type !== 'api' || !/^!scriptinfo\b/.test(msg.content)) return;
        let args = msg.content.split(/\s+/).slice(1);
        if (!args.length) { // get API_Meta object info
            sendChat('MODERATOR', reportMsg);
        } else {
            sendChat('MODERATOR', `&{template:default}{{name=Script Information (Line ${args[0]})}}{{=${getReportForLine(Number(args[0]))}}}`, null, { noarchive: true });
        }
    };

    const registerEventHandlers = () => {
        on('chat:message', handleInput);
    };

    on('ready', () => {
        logsig();
        versionInfo();
        fillReportMsg();
        registerEventHandlers();
    });
    return {};
})();

{ try { throw new Error(''); } catch (e) { API_Meta.ScriptInfo.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.ScriptInfo.offset); } }