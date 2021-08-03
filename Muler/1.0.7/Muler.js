/*
=========================================================
Name			:	Muler
GitHub			:	https://github.com/TimRohr22/Cauldron/tree/master/Muler
Roll20 Contact	:	timmaugh
Version			:	1.0.7
Last Update		:	7/20/2021
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.Muler = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{
    try { throw new Error(''); } catch (e) { API_Meta.Muler.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (13)); }
}

const Muler = (() => {
    const apiproject = 'Muler';
    const version = '1.0.7';
    const schemaVersion = 0.1;
    API_Meta[apiproject].version = version;
    const vd = new Date(1626810300264);
    const versionInfo = () => {
        log(`\u0166\u0166 ${apiproject} v${API_Meta[apiproject].version}, ${vd.getFullYear()}/${vd.getMonth() + 1}/${vd.getDate()} \u0166\u0166 -- offset ${API_Meta[apiproject].offset}`);
        if (!state.hasOwnProperty(apiproject) || state[apiproject].version !== schemaVersion) {
            log(`  > Updating ${apiproject} Schema to v${schemaVersion} <`);
            switch (state[apiproject] && state[apiproject].version) {

                case 0.1:
                /* break; // intentional dropthrough */ /* falls through */

                case 'UpdateSchemaVersion':
                    state[apiproject].version = schemaVersion;
                    break;

                default:
                    state[apiproject] = {
                        version: schemaVersion,
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

    const escapeRegExp = (string) => { return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); };

    const charFromAmbig = (query, pid) => { // find a character where info is an identifying piece of information (id, name, or token id)
        let character;
        let qrx = new RegExp(escapeRegExp(query), 'i');
        let charsIControl = findObjs({ type: 'character' });
        charsIControl = playerIsGM(pid) ? charsIControl : charsIControl.filter(c => c.get('controlledby').split(',').includes(pid));
        character = charsIControl.filter(c => c.id === query)[0] ||
            charsIControl.filter(c => c.id === (getObj('graphic', query) || { get: () => { return '' } }).get('represents'))[0] ||
            charsIControl.filter(c => c.get('name') === query)[0] ||
            charsIControl.filter(c => qrx.test(c)).reduce((m, v) => {
                let d = getEditDistance(query, v);
                return !m.length || d < m[1] ? [v, d] : m;
            }, [])[0];
        return character;
    };
    const getEditDistance = (a, b) => {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        var matrix = [];

        // increment along the first column of each row
        var i;
        for (i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }

        // increment each column in the first row
        var j;
        for (j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        // Fill in the rest of the matrix
        for (i = 1; i <= b.length; i++) {
            for (j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                        Math.min(matrix[i][j - 1] + 1, // insertion
                            matrix[i - 1][j] + 1)); // deletion
                }
            }
        }

        return matrix[b.length][a.length];
    };

    const varrx = /^((?:(?:\d+)-(?:\d+)|(?:!=|>=|<=|>|<)(?:\d+))|[^\s]+?)=(.+)$/,
        getrx = /get\.([^\s./]+(?:\.[^\s./]+?)*)(\/get|(?=\/|\s|$))/gmi,
        setrx = /set\.([^\s.=]+(?:\.[^\s=.]+)*\s*=\s*.+?)\s*\/set/gmi,
        mulerx = /(\()?{&\s*mule\s*(.*?)\s*}((?<=\({&\s*mule\s*(.*?)\s*})\)|\1)/gi,
        muleabilrx = /\s*\((.*?)\)\s*/g;

    const condensereturn = (funcret, status, notes) => {
        funcret.runloop = (status.includes('changed') || status.includes('unresolved'));
        if (status.length) {
            funcret.status = status.reduce((m, v) => {
                switch (m) {
                    case 'unchanged':
                        m = v;
                        break;
                    case 'changed':
                        m = v === 'unresolved' ? v : m;
                        break;
                    case 'unresolved':
                        break;
                }
                return m;
            });
        }
        funcret.notes = notes.join('<br>');
        return funcret;
    };
    const testGetConstructs = m => {
        let result = mulerx.test(m.content) || (Object.keys(m.variables).length &&  getrx.test(m.content));
        getrx.lastIndex = 0;
        mulerx.lastIndex = 0;
        return result;
    };
    const testSetConstructs = m => {
        let result = Object.keys(m.variables).length && setrx.test(m.content);
        setrx.lastIndex = 0;
        return result;
    };
    const internalTestLib = {
        'int': (v) => +v === +v && parseInt(parseFloat(v, 10), 10) == v,
        'num': (v) => +v === +v,
        'tru': (v) => v == true
    };
    const mulegetter = (msg, msgstate = {}) => {
        let funcret = { runloop: false, status: 'unchanged', notes: '' };
        msg.variables = msg.variables || {};
        msg.mules = msg.mules || [];
        if (msg.type !== 'api' || !testGetConstructs(msg)) return funcret;
        if (!Object.keys(msgstate).length && scriptisplugin) return funcret;
        let status = [];
        let notes = [];

        let variables = msg.variables;
        if (mulerx.test(msg.content)) {
            mulerx.lastIndex = 0;
            let characters = findObjs({ type: 'character' });
            characters = playerIsGM(msg.playerid) ? characters : characters.filter(c => c.get('controlledby').split(',').includes(msg.playerid));

            let mulearray = [];
            msg.content = msg.content.replace(mulerx, (m, padding, g1) => {
                g1 = g1.replace(muleabilrx, (m1, m1g1) => {
                    mulearray.push(m1g1);
                    return '';
                });
                g1.split(/\s+/).forEach(a => mulearray.push(a));
                status.push('changed');
                return '';
            });
            let charids = characters.map(c => c.id);
            let vararray = [];
            let mules = []; // new mules in this pass
            mulearray.forEach(m => {
                let mchar;
                if (/\./.test(m)) {
                    mchar = charFromAmbig(m.slice(0, m.indexOf('.')), msg.playerid);
                    mchar = charids.includes((mchar || { id: undefined }).id) ? mchar : undefined;
                }
                if (mchar) {
                    mules.push(findObjs({ type: 'ability', name: m.slice(m.indexOf('.') + 1), characterid: mchar.id })[0]);
                } else {
                    mules.push(findObjs({ type: 'ability', name: m }).filter(a => charids.includes(a.get('characterid')))[0]);
                }
            });

            mules = mules.filter(a => a);
            mules.forEach(a => {
                msg.mules.push(a);
                let achar = characters.filter(c => c.id === a.get('characterid'))[0];
                a.localaction = a.get('action');
                a.localaction
                    .split('\n')
                    .filter(v => varrx.test(v))
                    .forEach(v => {
                        let k = varrx.exec(v);
                        vararray.push([k[1], k[2]]);
                        vararray.push([`${a.get('name')}.${k[1]}`, k[2]]);
                        vararray.push([`${achar.get('name')}.${a.get('name')}.${k[1]}`, k[2]]);
                    });
                Object.assign(variables, Object.fromEntries(vararray));
            });
        }
        const typeProcessor = {
            '!=': (r, t) => r != t,
            '>': (r, t) => r > t,
            '>=': (r, t) => r >= t,
            '<': (r, t) => r < t,
            '<=': (r, t) => r <= t,
            '-': (r, l, h) => r >= l && r <= h,
        };
        msg.content = msg.content.replace(getrx, (m, gvar,gclose) => {
            let gchar, gmule;
            let fullgvar, gvarheader = '';
            let dotcount = gvar.split('').filter(l => l === '.').length;
            if (dotcount > 1) {
                [gchar, gmule, ...gvar] = gvar.split('.');
                if (dotcount > 2) gvar = gvar.join('.');
                gchar = (charFromAmbig(gchar, msg.playerid) || {
                    get: () => { return gchar }
                }).get('name');
                gvarheader = `${gchar}.${gmule}.`;
                fullgvar = `${gchar}.${gmule}.${gvar}`;
            } else {
                fullgvar = gvar;
            }

            let retval = variables[fullgvar];
            if (!retval && internalTestLib.num(gvar)) { // no explicit variable, but it's a number, so we check for a range variable
                let varrangerx = /((?<low>\d+)-(?<high>\d+)|(?<range>!=|>=|<=|>|<)(?<singleval>\d+))$/;
                let res;
                let keys = Object.keys(variables)
                    .filter(k => k.startsWith(gvarheader))
                    .filter(k => varrangerx.test(k))
                    .filter(p => {
                        res = varrangerx.exec(p);
                        return res.groups.low ?
                            typeProcessor['-'](Number(gvar), Number(res.groups.low), Number(res.groups.high)) :
                            typeProcessor[res.groups.range](Number(gvar), Number(res.groups.singleval));
                    });
                retval = variables[keys[0]];
            }
            if (retval) {
                status.push('changed');
            } else {
                status.push('unresolved');
                notes.push(`Unable to resolve variable: get.${fullgvar}${gclose}`);
            }
            return retval || `get.${fullgvar}${gclose}`; // leaving the `get.` trusting ZeroFrame to stop infinite loops of processing
        });
        return condensereturn(funcret, status, notes);
    };
    const mulesetter = (msg, msgstate = {}) => {
        let funcret = { runloop: false, status: 'unchanged', notes: '' };
        if (msg.type !== 'api' || !testSetConstructs(msg)) return funcret;
        if (!Object.keys(msgstate).length && scriptisplugin) return funcret;
        let status = [];
        let notes = [];
        let characters = findObjs({ type: 'character' })
            .filter(c => c.get('controlledby').split(',').includes(msg.playerid));
        let charids = characters.map(c => c.id);

        msg.content = msg.content.replace(setrx, (m, g1) => {
            let setres = /\s*=\s*/.exec(g1);
            let [svar, sval] = [g1.slice(0, setres.index), g1.slice(setres.index + setres[0].length)];
            let schar, smule;
            let dotcount = svar.split('').filter(l => l === '.').length;
            switch (dotcount) {
                case 0:
                    break;
                case 1:
                    [smule, svar] = svar.split('.');
                    break;
                default:
                    [schar, smule, ...svar] = svar.split('.');
                    svar = svar.join('.');
                    break;
            }

            // write new value back to mule ability
            let svarrx = new RegExp(`^${escapeRegExp(svar)}\\s*=.+$`, 'm');
            if (smule) { // mule declared, create if doesn't exist
                if (!schar) {
                    schar = charFromAmbig(charids[0], msg.playerid);
                    smule = msg.mules.filter(m => m.get('name') === smule) || [createObj('ability', { characterid: schar.id, name: smule })];
                } else {
                    schar = charFromAmbig(schar, msg.playerid);
                    smule = msg.mules.filter(m => m.get('name') === smule && m.get('characterid') === schar.id) || [createObj('ability', { characterid: schar.id, name: smule })];
                }
            } else { // no mule declared, so we have to find if the variable exists
                smule = msg.mules.filter(m => svarrx.test(m.localaction));
                smule = smule.length ? smule : msg.mules;
            }
            let vararray = [];
            smule.forEach(m => {
                if (svarrx.test(m.localaction)) {    // existing variable in known mule
                    m.localaction = m.localaction.replace(svarrx, `${svar}=${sval}`);
                } else { // no text in the action, or it's missing this variable
                    m.localaction = `${m.localaction}\n${svar}=${sval}`;
                }
                m.set({ action: m.localaction });
                vararray.push([svar, sval]);
                vararray.push([`${m.get('name')}.${svar}`, sval]);
                vararray.push([`${charFromAmbig(m.get('characterid'), msg.playerid).get('name')}.${m.get('name')}.${svar}`, sval]);
            });
            Object.assign(msg.variables, Object.fromEntries(vararray));
            status.push('changed');
            return '';
        });
        return condensereturn(funcret, status, notes);
    };

    let scriptisplugin = false;
    const mulerget = (m, s) => mulegetter(m, s);
    const mulerset = (m, s) => mulesetter(m, s);
    on('chat:message', mulegetter);
    on('chat:message', mulesetter);
    on('ready', () => {
        versionInfo();
        logsig();
        scriptisplugin = (typeof ZeroFrame !== `undefined`);
        if (typeof ZeroFrame !== 'undefined') {
            ZeroFrame.RegisterMetaOp(mulerget, { priority: 25, handles: ['get', 'muleget', 'muleload', 'load'] });
            ZeroFrame.RegisterMetaOp(mulerset, { priority: 65, handles: ['set', 'muleset'] });
        }
    });
    return {
    };
})();
{ try { throw new Error(''); } catch (e) { API_Meta.Muler.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.Muler.offset); } }