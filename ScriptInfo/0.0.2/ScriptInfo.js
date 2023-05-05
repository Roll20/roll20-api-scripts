/*
=========================================================
Name            :   ScriptInfo
GitHub          :   
Roll20 Contact  :   timmaugh
Version			:   0.0.2
Last Update		:   2/2/2023
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.ScriptInfo = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.ScriptInfo.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (13)); } }

const ScriptInfo = (() => { // eslint-disable-line no-unused-vars
    const ScriptInfo = 'ScriptInfo';
    const scriptVersion = '0.0.2';
    API_Meta[ScriptInfo].version = scriptVersion;
    const vd = new Date(1675352155338);
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
        log(`${hom} ${ScriptInfo} v${scriptVersion}, ${vd.getFullYear()}/${vd.getMonth() + 1}/${vd.getDate()} ${hom} -- offset ${API_Meta[ScriptInfo].offset}`);
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
    const findInMeta = (() => {
        let lookup;

        let doLookup = (n) => {
            lookup = Object.keys(API_Meta)
                .reduce((m, k) => [...m, { start: (API_Meta[k].offset), end: (API_Meta[k].offset) + (API_Meta[k].lineCount) - 1, name: k }], [])
                .sort((a, b) => a.start > b.start ? 1 : -1);
            doLookup = doLookupReal;
            return doLookupReal(n);
        };
        const doLookupReal = (n) => {
            let location = {};
            lookup.find(e => {
                if (n >= e.start && n <= e.end) {
                    location.within = e.name;
                    location.line = n - e.start;
                    return true;
                } else {
                    if (n < e.start && !location.before) {
                        location.before = e.name;
                        location.linesbefore = e.start - (n + 1);
                        return false;
                    } else if (n > e.end) {
                        location.after = e.name;
                        location.linesafter = n - e.end;
                        return false;
                    }
                    return false;
                }
            });
            if (location.within) return `Line ${n} corresponds to line ${location.line} in ${location.within}.`;
            if (location.before && location.after) return `That line number does not correspond to any script reporting its offset. ` +
                `It occurs ${location.linesafter} lines after the end of ${location.after}, and ` +
                `${location.linesbefore} lines before the start of ${location.before}.`;
            if (location.after) return `That line number does not correspond to any script reporting its offset. ` +
                `It occurs ${location.linesafter} lines after the end of ${location.after}.`;
            if (location.before) return `That line number does not correspond to any script reporting its offset. ` +
                `It occurs ${location.linesbefore} lines before the start of ${location.before}.`;
            return `No information is available for that line number. Check that you have scripts reporting to API_Meta by running !scriptinfo.`;
        };
        return (n) => doLookup(n);
    })();
    const handleInput = msg => {
        if (msg.type !== 'api' || !/^!scriptinfo\b/.test(msg.content)) return;
        let args = msg.content.split(/\s+/).slice(1);
        if (!args.length) { // get API_Meta object info
            sendChat('MODERATOR', reportMsg);
        } else {
            args.forEach(a => {
                sendChat('MODERATOR', `&{template:default}{{name=Script Information (Line ${a})}}{{=${findInMeta(Number(a))}}}`, null, { noarchive: true });
            });
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
        findInMeta(100);
    });
    return {};
})();

{ try { throw new Error(''); } catch (e) { API_Meta.ScriptInfo.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.ScriptInfo.offset); } }
