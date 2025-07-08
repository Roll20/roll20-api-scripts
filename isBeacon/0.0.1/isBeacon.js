/*
=========================================================
Name            :   isBeacon
GitHub          :   
Roll20 Contact  :   timmaugh
Version         :   0.0.1
Last Update     :   05 JUN 2025
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.isBeacon = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.isBeacon.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (12)); } }
const isBeacon = (() => {
    const scriptName = "isBeacon";
    const version = "0.0.1";
    const lastUpdate = Date("June 5, 2025 10:00 ET");
    const schemaVersion = 0.1;
    const house = String.fromCodePoint(0x0001F3E0);

    // ============================================
    //      STARTUP
    // ============================================
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
                "              ______________________               \n" +
                "            ╱                ______ ╲              \n" +
                "           ╱                   _____ ╲             \n" +
                "          ╱                      ____ ╲            \n" +
                "         ╱_____________________________╲           \n" +
                "             | _____          _____ |              \n" +
                "             | |_|_|    MOD   |_|_| |              \n" +
                "             | |_|_|   _____  |_|_| |              \n" +
                "             |         |   |        |              \n" +
                "             |         |  o|        |              \n" +
                "_____________|_________|___|________|______________\n" +
                "                                                   \n";
            log(`${logsig}`);
            state.houseofmod.siglogged = true;
            state.houseofmod.sigtime = Date.now();
        }
        return;
    };

    const checkInstall = () => {
        log(`${house} ${scriptName} v${version} ${house} -- offset ${API_Meta[scriptName].offset}`);

        if (!state.hasOwnProperty(scriptName) || state[scriptName].version !== schemaVersion) {
            log(`  > Updating Schema to v${schemaVersion} <`);
            switch (state[scriptName] && state[scriptName].version) {
                case 0.1:
                /* falls through */
                case "UpdateSchemaVersion":
                    state[scriptName].version = schemaVersion;
                    break;

                default:
                    state[scriptName] = {
                        version: schemaVersion,
                        settings: {},
                        defaults: {}
                    };
                    break;
            }
        }
    };

    // ============================================
    //      DATA
    // ============================================
    let computeds = [];
    let sheetObj = {};

    const buildData = () => {
        computeds = Object.keys(Campaign()?.computedSummary || {});

        let sheetChars = findObjs({ type: "character" }).reduce((m, c) => ({ ...m, [c.get('charactersheetname')]: c.id }), {});

        (async () => {
            await Promise.all(Object.keys(sheetChars).map(async sheet => {
                try {
                    sheetObj[sheet] = await Promise.any(computeds.map(async comp => {
                        if (comp) {
                            let v = await getComputed({ characterId: sheetChars[sheet], property: comp });
                            return typeof v !== 'undefined';
                        } else {
                            return false;
                        }
                    }));
                } catch {
                    sheetObj[sheet] = false;
                }
            }));
        })();
    };
    // ============================================
    //      TESTS
    // ============================================
    const getCharacter = (query) => {
        let chars = findObjs({ type: 'character' });
        return chars.filter(c => c.id === query)[0]
            || chars.filter(c => c.id === (getObj('graphic', query) || { get: () => { return '' } }).get('represents'))[0]
            || chars.filter(c => c.get('name') === query)[0];
    };
    const isBeaconTest = (query) => {
        if (typeof 'query' !== 'string') {
            return null;
        }
        if (sheetObj.hasOwnProperty(query)) {
            return sheetObj[query];
        } else {
            let c = getCharacter(query);
            if (c) {
                return sheetObj[c.get('charactersheetname')] || null;
            } else {
                log(`isBeacon: No character or sheet data found.`);
                return null;
            }
        }
    };
    // ============================================
    //      LISTENERS
    // ============================================
    const loadListeners = () => {
        on('chat:message', msg => {
            if (!msg.type === 'api' || !/^!getsheets/.test(msg.content)) { return; }
            log(`${house} isBeacon Output ${house}`);
            log(JSON.stringify(sheetObj, undefined, 2));
        });
        on('add:character', (c, p) => {
            if (!sheetObj.hasOwnProperty(c.get('charactersheetname'))) {
                buildData();
            }
        });
    }
    on('ready', () => {
        logsig();
        checkInstall();
        buildData();
        loadListeners();
    });

    return isBeaconTest;

})();
{ try { throw new Error(''); } catch (e) { API_Meta.isBeacon.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.isBeacon.offset); } }
/* */