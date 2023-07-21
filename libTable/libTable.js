/* eslint-disable no-prototype-builtins */
/*
=========================================================
Name            :   libTable
GitHub          :   
Roll20 Contact  :   timmaugh
Version	        :   1.0.0
Last Update     :   11/15/2022
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.libTable = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{
    try { throw new Error(''); } catch (e) { API_Meta.libTable.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (14)); }
}

const libTable = (() => { // eslint-disable-line no-unused-vars
    const apiproject = 'libTable';
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

    // ==================================================
    //		UTILITIES
    // ==================================================
    const simpleObj = (o) => o ? JSON.parse(JSON.stringify(o)) : undefined;

    // ==================================================
    //		LIBRARY OBJECTS
    // ==================================================
    let tables = {};
    let tablesByName = {};

    const flattenTable = (query) => {
        if (!query) return;
        let t = query;
        if (typeof query === 'string') t = findObjs({ type: 'rollabletable', id: query })[0] || findObjs({ type: 'rollabletable', name: query })[0];
        if (!(t && t.get('type') === 'rollabletable')) return;
        tables[t.id] = simpleObj(t);
        tables[t.id].items = { byindex: {}, byweight: {}, byname: {}, byweightedindex: {} };
        let items = findObjs({ type: 'tableitem', rollabletableid: t.id });
        let runningweight = 0;
        items.reduce((m, item, i) => {
            let simpleitem = simpleObj(item);
            simpleitem.image = simpleitem.avatar ? `<img src="${simpleitem.avatar}">` : '';
            m.byindex[i + 1] = simpleitem;
            m.byname[simpleitem.name] = simpleitem;
            let weightkey;
            let weight = parseInt(simpleitem.weight) || 1;
            for (let j = runningweight + 1; j <= runningweight + weight; j++) {
                m.byweightedindex[j] = simpleitem;
            }
            switch (i) {
                case 0:
                    weightkey = `<=${weight}`;
                    break;
                case items.length - 1:
                    weightkey = `>=${runningweight + 1}`;
                    break;
                default:
                    weightkey = weight === 1 ? `${runningweight + 1}` : `${runningweight + 1}-${runningweight + weight}`;
            }
            m.byweight[weightkey] = simpleitem;
            runningweight += weight;
            return m;
        }, tables[t.id].items);
        tablesByName[tables[t.id].name] = tables[t.id];
    };
    const buildTables = () => {
        findObjs({ type: 'rollabletable' }).forEach(t => flattenTable(t));
    };
    const getTable = (query) => {
        if (!query) return;
        let t = typeof query === 'string' ? query : query.id;
        return tables[t] || tablesByName[t];
    };
    const getItemsBy = (t, p) => {
        let tbl = getTable(t);
        return tbl ? tbl.items[p] : undefined;
    };
    on('ready', () => {
        versionInfo();
        assureState();
        logsig();
    });
    return { // public interface
        getTables: () => { buildTables(); return tables; },
        getTable: (t) => { flattenTable(t); return getTable(t); },
        getItems: (t) => { flattenTable(t); return (getTable(t) || {}).items; },
        getItemsByIndex: (t) => { flattenTable(t); return getItemsBy(t, 'byindex') },
        getItemsByName: (t) => { flattenTable(t); return getItemsBy(t, 'byname') },
        getItemsByWeight: (t) => { flattenTable(t); return getItemsBy(t, 'byweight') },
        getItemsByWeightedIndex: (t) => { flattenTable(t); return getItemsBy(t, 'byweightedindex') }
    };
})();

{ try { throw new Error(''); } catch (e) { API_Meta.libTable.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.libTable.offset); } }
