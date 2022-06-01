/*
=========================================================
Name			:	MathOps
GitHub			:	https://github.com/TimRohr22/Cauldron/tree/master/MathOps
Roll20 Contact	:	timmaugh
Version			:	1.0.5
Last Update		:	6/1/2022
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.MathOps = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{
    try { throw new Error(''); } catch (e) { API_Meta.MathOps.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (13)); }
}

const MathOps = (() => {
    const apiproject = 'MathOps';
    const version = '1.0.5';
    const schemaVersion = 0.1;
    API_Meta[apiproject].version = version;
    const vd = new Date(1654096750119);
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

    const mathprocessor = (() => {
        const tokenize = code => {
            let results = [];
            let tokenRegExp = /\s*([A-Za-z\s'"`]+|-?[0-9]+(\.[0-9]+)?|\S)\s*/g;

            let m;
            while ((m = tokenRegExp.exec(code)) !== null)
                results.push(m[1]);
            return results;
        };

        const isNumber = token => {
            return token !== undefined && token.match(/^-?[0-9]*.?[0-9]+$/) !== null;
        };

        const isName = token => {
            return token !== undefined && token.match(/^[A-Za-z\s'"`]+$/) !== null;
        };

        const parse = o => {
            let tokens = tokenize(o.code);
            let position = 0;
            const peek = () => {
                return tokens[position];
            };
            const peek1 = () => {
                if (position < tokens.length - 1) {
                    return tokens[position + 1];
                }
            };

            const consume = token => {
                position++;
            };

            const parsePrimaryExpr = () => {
                let t = peek();

                if (isNumber(t)) {
                    consume(t);
                    return { type: "number", value: t };
                } else if (isName(t)) {
                    if (funcbank.hasOwnProperty(t.toLowerCase()) && peek1() === '(') {
                        let f = t.toLowerCase();
                        let p = [];
                        consume(t);
                        consume('(');
                        while (peek() !== ')') {
                            if (peek() === ',') {
                                consume(',');
                            } else {
                                p.push(parseExpr());
                            }
                        }
                        if (peek() !== ")") throw "Expected )";
                        consume(')');
                        return { type: 'func', func: f, params: p };
                    } else {
                        consume(t);
                        return { type: "name", id: t };
                    }
                } else if (t === "(") {
                    consume(t);
                    let expr = parseExpr();
                    if (peek() !== ")") throw "Expected )";
                    consume(")");
                    return expr;
                } else {
                    throw "Expected a number, a variable, or parentheses";
                }
            };

            const parseMulExpr = () => {
                let expr = parsePrimaryExpr();
                let t = peek();
                while (t === "*" || t === "/" || t === "%") {
                    consume(t);
                    let rhs = parsePrimaryExpr();
                    expr = { type: t, left: expr, right: rhs };
                    t = peek();
                }
                return expr;
            };
            const parseExpr = () => {
                let expr = parseMulExpr();
                let t = peek();
                while (t === "+" || t === "-") {
                    consume(t);
                    let rhs = parseMulExpr();
                    expr = { type: t, left: expr, right: rhs };
                    t = peek();
                }
                return expr;
            };
            let result = parseExpr();
            if (position !== tokens.length) throw "Unexpected '" + peek() + "'";
            return result;
        };
        const formatReturn = (a, d) => {
            switch (d) {
                case 'roll':
                    return `[[${a.join('+')}]]`;
                default:
                    return a.join(d);
            }
        };
        const funcbank = {
            abs: Math.abs,
            min: Math.min,
            max: Math.max,
            maxn: (n, d, ...i) => {
                if (!isNaN(d)) [i, d] = [[d, ...i], ','];
                if (n > i.length) {
                    return formatReturn(i, d);
                }
                return formatReturn(
                    i.slice().sort((a, b) => { return b - a; }).slice(0, n),
                    d);
            },
            minn: (n, d, ...i) => {
                if (!isNaN(d)) [i, d] = [[d, ...i], ','];
                if (n > i.length) {
                    return formatReturn(i, d);
                }
                return formatReturn(
                    i.slice().sort((a, b) => { return a - b; }).slice(0, n),
                    d);
            },
            acos: Math.acos,
            acosh: Math.acosh,
            asin: Math.asin,
            asinh: Math.asinh,
            atan: Math.atan,
            atanh: Math.atanh,
            atantwo: Math.atan2,
            cbrt: Math.cbrt,
            ceiling: Math.ceil,
            cos: Math.cos,
            cosh: Math.cosh,
            exp: Math.exp,
            expmone: Math.expm1,
            floor: Math.floor,
            hypot: Math.hypot,
            log: Math.log,
            logonep: Math.log1p,
            logten: Math.log10,
            logtwo: Math.log2,
            pow: (v, e = 1) => Math.pow(v, e),
            rand: Math.random,
            randb: (v1, v2) => { return Math.random() * (Math.max(v1, v2) - Math.min(v1, v2) + 1) + Math.min(v1, v2) },
            randib: (v1, v2) => {
                let min = Math.ceil(Math.min(v1, v2));
                let max = Math.floor(Math.max(v1, v2));
                return Math.floor(Math.random() * (max - min) + min);
            },
            randa: (...v) => v[Math.floor(Math.random() * v.length)],
            round: (v, d = 0) => Math.round(v * 10 ** d) / 10 ** d,
            sin: Math.sin,
            sinh: Math.sinh,
            sqrt: Math.sqrt,
            tan: Math.tan,
            tanh: Math.tanh,
            trunc: Math.trunc
        };
        const knownbank = {
            e: Math.E,
            pi: Math.PI,
            lntwo: Math.LN2,
            lnten: Math.LN10,
            logtwoe: Math.LOG2E,
            logtene: Math.LOG10E
        }
        const isNum = (v) => +v === +v;
        const typeprocessor = {
            '-': (a, b) => { return isNum(a) && isNum(b) ? Number(a) - Number(b) : `${a}-${b}`; },
            '+': (a, b) => { return isNum(a) && isNum(b) ? Number(a) + Number(b) : `${a}+${b}`; },
            '/': (a, b) => { return isNum(a) && isNum(b) ? Number(a) / Number(b) : `${a}/${b}`; },
            '*': (a, b) => { return isNum(a) && isNum(b) ? Number(a) * Number(b) : `${a}*${b}`; },
            '%': (a, b) => { return isNum(a) && isNum(b) ? Number(a) % Number(b) : `${a}%${b}`; }
        };
        const isString = (s) => 'string' === typeof s || s instanceof String;
        const evalops = o => {
            if (!o.code || !isString(o.code)) return;
            o.known = o.known || {};
            Object.assign(o.known, knownbank);
            try {
                const getVal = t => {
                    switch (t.type) {
                        case 'number':
                            return t.value;
                        case 'name':
                            return o.known[t.id.trim()] || t.id;
                        case 'func':
                            return funcbank[t.func](...t.params.map(p => getVal(p)));
                        default:
                            return typeprocessor[t.type](getVal(t.left), getVal(t.right));
                    }
                };
                return getVal(parse(o));
            } catch (error) {
                return { message: error };
            }
        };
        return evalops;
    })();
    const mathrx = /(\()?{&\s*math\s*([^}]+)\s*}((?<=\({&\s*math\s*([^}]+)\s*})\)|\1)/g;

    const testConstructs = c => {
        let result = mathrx.test(c);
        mathrx.lastIndex = 0;
        return result;
    };
    const handleInput = (msg, msgstate = {}) => {
        let funcret = { runloop: false, status: 'unchanged', notes: '' };
        if (msg.type !== 'api' || !testConstructs(msg.content)) return funcret;
        if (!Object.keys(msgstate).length && scriptisplugin) return funcret;
        let status = [];
        let notes = [];
        msg.content = msg.content.replace(mathrx, (m, padding, g1) => {
            g1 = g1.replace(/\$\[\[(\d+)]]/g, (m1, roll) => {
                let rollval;
                if (msg.parsedinline) {
                    rollval = msg.parsedinline[roll].value;
                } else if (msg.inlinerolls && msg.inlinerolls[roll]) {
                    rollval = msg.inlinerolls[roll].results.total;
                } else {
                    rollval = 0;
                }
                return rollval;
            });
            let result = mathprocessor({ code: g1, known: msg.variables || {} });
            if (result.message) { // error
                status.push('unresolved');
                notes.push(result.message);
                return m;
            } else {
                status.push('changed');
                return result;
            }
        });
        funcret.runloop = (status.includes('changed') || status.includes('unresolved'));
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
        funcret.notes = notes.join('<br>');
        return funcret;
    };

    let scriptisplugin = false;
    const mathops = (m, s) => handleInput(m, s);
    on('chat:message', handleInput);
    on('ready', () => {
        versionInfo();
        logsig();
        scriptisplugin = (typeof ZeroFrame !== `undefined`);
        if (typeof ZeroFrame !== 'undefined') {
            ZeroFrame.RegisterMetaOp(mathops, { priority: 55, handles: ['math'] });
        }
    });
    return {
    };
})();
{ try { throw new Error(''); } catch (e) { API_Meta.MathOps.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.MathOps.offset); } }